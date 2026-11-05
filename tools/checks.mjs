#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════════
   Guitar Class — pre-push checks  (zero dependencies, Node 18+)

   Three safeguards, run before every push (see CLAUDE.md workflow):

     1. VALIDATE  — loads every module-N.js the same way the browser does
                    and checks each Set has the fields the app needs, so a
                    stray comma or missing field is caught here instead of
                    breaking the live site for students.

     2. LINKS     — checks every external YouTube / Google-Docs link still
                    resolves (YouTube via the oEmbed endpoint). Catches the
                    dead-link rot that used to need a manual audit.

     3. SW BUMP   — sets sw.js's CACHE_VERSION to a fingerprint of the
                    cached files' contents. Because the version *is* the
                    fingerprint, it changes automatically whenever a shell
                    file changes and never when nothing changed — no more
                    remembering to bump it by hand.

   USAGE
     node tools/checks.mjs            validate + bump SW + check links
     node tools/checks.mjs --skip-links   validate + bump SW  (fast)
     node tools/checks.mjs --check        verify only, change nothing
                                          (exit 1 if SW version is stale)
     node tools/checks.mjs --live     POST-push only: fetch the live site's
                                      sw.js and confirm its CACHE_VERSION
                                      matches local — catches a failed or
                                      still-running GitHub Pages deploy.
                                      Runs alone (no other checks).

   Exit code is non-zero if anything fails, so a push can be aborted.
   ════════════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync, readdirSync, mkdtempSync, rmSync, existsSync, statSync } from 'node:fs';
import { spawnSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { audioHashMap, renderAudioBlock, AUDIO_BLOCK_RE, AUDIO_CACHE_NAME, AUDIO_HASH_CACHE_NAME } from './sw-audio-map.mjs';
import { tmpdir, cpus } from 'node:os';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const CHECK_ONLY = args.has('--check');
const SKIP_LINKS = args.has('--skip-links');
const LIVE_ONLY  = args.has('--live');

const LIVE_SW_URL = 'https://jhoffmanteacher.github.io/guitar-class/sw.js';

const C = { red:'\x1b[31m', green:'\x1b[32m', yellow:'\x1b[33m', dim:'\x1b[2m', bold:'\x1b[1m', reset:'\x1b[0m' };
const ok   = m => console.log(`${C.green}✓${C.reset} ${m}`);
const warn = m => console.log(`${C.yellow}!${C.reset} ${m}`);
const err  = m => console.log(`${C.red}✗${C.reset} ${m}`);
const head = m => console.log(`\n${C.bold}${m}${C.reset}`);

let problems = 0;   // hard failures — abort the push
let warnings = 0;   // surfaced but non-blocking

/* ── Files that make up the offline shell (mirror of ASSETS in sw.js) ── */
const MODULE_FILES = readdirSync(ROOT)
  .filter(f => /^module-\d+\.js$/.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

/* Song Journey pages (and their shared CSS/JS) aren't all in the sw.js
   ASSETS precache list, but the SW runtime-caches every same-origin page
   cache-first — so an edit to any tabs/ file only reaches returning
   students when CACHE_VERSION changes. Include them all in the fingerprint
   so that bump happens automatically. */
let TAB_PAGES = [];
try {
  TAB_PAGES = readdirSync(join(ROOT, 'tabs'))
    .filter(f => /\.(html|css|js)$/.test(f)).sort().map(f => `tabs/${f}`);
} catch { /* no tabs/ dir yet */ }

const SHELL_FILES = [
  'index.html', '404.html', 'mood-chart.html', 'styles.css', 'i18n.js', 'guitar-diagrams.js', 'class-activities.js', 'app.js', 'practice-minutes-config.js', 'practice-minutes.js', 'fab-tools.js', 'tuner.js', 'coach.js', 'teacher.js', 'live-quiz.js', 'config-main.js',
  'trainer-core.js', 'trainer-audio.js', 'trainer-ui.js', 'trainer-site-adapter.js',
  'firebase-config.js', 'manifest.json', 'icon.svg',
  ...MODULE_FILES,
  ...TAB_PAGES,
];

/* Shell files deliberately NOT in sw.js ASSETS (2026-10-12). Every student's
   service worker re-downloads all of ASSETS on every deploy, so a file no
   student ever loads is pure cost there. They stay in SHELL_FILES — still
   fingerprinted into CACHE_VERSION, because the fetch handler runtime-caches
   them into that cache on first use, and an edit has to retire the old copy.
     teacher.js       only the ?teacher console loads it (ensureTeacherJs)
     mood-chart.html  no link to it anywhere since 2026-10-02
     trainer-core.js, trainer-audio.js, trainer-ui.js
                      "Hear It First" (hidden from students; loaded only by its
                      direct link — WO-hear-it-first). NOT trainer-site-adapter.js:
                      index.html loads that one on every page, so it is precached
                      (Friday check R2-4, 2026-10-31).
   checkSwAssets() fails the push if one of these turns up in ASSETS anyway
   (one of the two lists would be wrong), and checkPrecacheCoverage() still
   fails if a shipped page starts linking mood-chart.html again — at that
   point it is student-facing and goes back in ASSETS, off this list. */
const SHELL_NOT_PRECACHED = ['teacher.js', 'mood-chart.html', 'trainer-core.js', 'trainer-audio.js', 'trainer-ui.js'];

/* Backing-track audio isn't in sw.js's ASSETS precache list (they're large —
   precaching them at install would bloat the offline install). The SW's fetch
   handler runtime-caches each track in its own stable audio cache, and evicts a
   track when its hash in the AUDIO_HASHES block changes (syncAudioHashes below
   writes the block, so a re-exported mix reaches returning students without
   renaming the cache or touching CACHE_VERSION). AUDIO_FILES is the list the
   migration fingerprint is taken over; it stays out of SHELL_FILES so
   checkSwAssets doesn't also demand the tracks be precached. */
let AUDIO_FILES = [];
try {
  AUDIO_FILES = readdirSync(join(ROOT, 'audio'))
    .filter(f => /\.(mp3|m4a|wav|ogg)$/i.test(f)).sort().map(f => `audio/${f}`);
} catch { /* no audio/ dir yet */ }

/* Same reasoning as AUDIO_FILES above, for step-figure images: img/ isn't
   fully precached in sw.js's ASSETS list, but the SW's fetch handler still
   runtime-caches same-origin GETs cache-first — so re-exporting a diagram at
   the same filename never reaches a returning student unless it's also
   fingerprinted into CACHE_VERSION. */
let IMG_FILES = [];
try {
  IMG_FILES = readdirSync(join(ROOT, 'img'))
    .filter(f => /\.(svg|png|jpe?g|webp|gif)$/i.test(f)).sort().map(f => `img/${f}`);
} catch { /* no img/ dir yet */ }

/* Same reasoning again for the chord-sheet PDFs a lyric-sheet practice card
   draws (card.sheet, 2026-10-19) and the pdf.js files that draw them: both
   are runtime-cached cache-first and never precached, so re-saving a sheet
   at the same name must bump CACHE_VERSION or returning students keep the
   old page. */
let SHEET_FILES = [];
try {
  SHEET_FILES = readdirSync(join(ROOT, 'sheets'))
    .filter(f => /\.pdf$/i.test(f)).sort().map(f => `sheets/${f}`);
} catch { /* no sheets/ dir */ }
let VENDOR_FILES = [];
try {
  VENDOR_FILES = readdirSync(join(ROOT, 'vendor', 'pdfjs'))
    .filter(f => /\.js$/i.test(f)).sort().map(f => `vendor/pdfjs/${f}`);
} catch { /* no vendor/pdfjs dir */ }

/* ════════════════════════════════════════════════════════════════════
   1. VALIDATE — load each module in a sandbox and check its Sets
   ════════════════════════════════════════════════════════════════════ */
function validateModules() {
  head('1. Validating module data');
  const configSrc = readFileSync(join(ROOT, 'config-main.js'), 'utf8');
  const allSets = [];
  const reviewsByModule = new Map();  // moduleNum → MODULE_REVIEWS[moduleNum]
  const moduleSongsByModule = new Map(); // moduleNum → MODULE_SONGS[moduleNum] (modules 2–12 only)
  const seenIds = new Map();          // set id → file it first appeared in

  for (const file of MODULE_FILES) {
    const expectedNum = Number(file.match(/\d+/)[0]);
    const sandbox = { console };
    vm.createContext(sandbox);
    // Load config-main.js first so the shared globals (SETS, MODULE_REVIEWS,
    // MODULE_MANIFEST) exist, then run the module the same way the browser does.
    try {
      vm.runInContext(configSrc, sandbox, { filename: 'config-main.js' });
    } catch (e) {
      err(`config-main.js failed to parse: ${e.message}`); problems++; return null;
    }
    try {
      vm.runInContext(readFileSync(join(ROOT, file), 'utf8'), sandbox, { filename: file });
    } catch (e) {
      const line = (e.stack && e.stack.match(new RegExp(`${file}:(\\d+)`)) || [])[1];
      err(`${file} failed to load${line ? ` (line ${line})` : ''}: ${e.message}`);
      problems++;
      continue;
    }

    // config-main declares SETS/etc. with `const`, so they're lexical globals in
    // the context — read them back by evaluating the name, not as sandbox props.
    const sets = vm.runInContext('SETS', sandbox) || [];
    if (sets.length === 0) { warn(`${file} pushed no Sets`); warnings++; }
    const reviews = vm.runInContext('typeof MODULE_REVIEWS !== "undefined" ? MODULE_REVIEWS : {}', sandbox) || {};
    if (reviews[expectedNum]) reviewsByModule.set(expectedNum, reviews[expectedNum]);
    const moduleSongs = vm.runInContext('typeof MODULE_SONGS !== "undefined" ? MODULE_SONGS : {}', sandbox) || {};
    if (moduleSongs[expectedNum]) moduleSongsByModule.set(expectedNum, moduleSongs[expectedNum]);

    for (const s of sets) {
      const where = `${file} · set "${s && s.id || '??'}"`;
      if (!s || typeof s !== 'object') { err(`${where}: not an object`); problems++; continue; }
      // Required fields the app relies on when rendering pills/panels.
      for (const field of ['id', 'label', 'moduleNum']) {
        if (s[field] === undefined || s[field] === null || s[field] === '') {
          err(`${where}: missing required field "${field}"`); problems++;
        }
      }
      if (s.moduleNum !== undefined && Number(s.moduleNum) !== expectedNum) {
        err(`${where}: moduleNum is ${s.moduleNum} but lives in ${file}`); problems++;
      }
      if (s.id !== undefined) {
        if (seenIds.has(s.id)) { err(`${where}: duplicate set id — also in ${seenIds.get(s.id)}`); problems++; }
        else seenIds.set(s.id, file);
      }
      // Shape sanity on the optional-but-structured fields.
      if (s.stations !== undefined && (typeof s.stations !== 'object' || Array.isArray(s.stations)))
        { err(`${where}: "stations" should be an object`); problems++; }
      if (s.songs !== undefined && !Array.isArray(s.songs))
        { err(`${where}: "songs" should be an array`); problems++; }
      if (Array.isArray(s.songs)) {
        for (const song of s.songs) {
          if (!song || song.loops === undefined) continue;
          const songWhere = `${where} · song "${song.name || '??'}"`;
          if (!song.backingUrl) { warn(`${songWhere}: "loops" set but no "backingUrl" — presets have no video to attach to`); warnings++; }
          if (!Array.isArray(song.loops)) { err(`${songWhere}: "loops" should be an array`); problems++; continue; }
          song.loops.forEach((loop, i) => {
            const loopWhere = `${songWhere} · loops[${i}]`;
            if (!loop || typeof loop !== 'object') { err(`${loopWhere}: not an object`); problems++; return; }
            if (typeof loop.label !== 'string' || !loop.label) { err(`${loopWhere}: "label" should be a non-empty string`); problems++; }
            if (typeof loop.a !== 'number' || loop.a < 0) { err(`${loopWhere}: "a" should be a number >= 0`); problems++; }
            if (typeof loop.b !== 'number' || !(loop.b > loop.a)) { err(`${loopWhere}: "b" should be a number greater than "a"`); problems++; }
          });
        }
      }
      if (s.skills !== undefined && !Array.isArray(s.skills))
        { err(`${where}: "skills" should be an array`); problems++; }
      allSets.push(s);
    }
  }

  // Cross-check against the dropdown manifest in config-main.js.
  const manifest = (() => {
    const sb = { console };
    vm.createContext(sb);
    try { vm.runInContext(configSrc, sb, { filename: 'config-main.js' }); } catch { /* reported above */ }
    return vm.runInContext('typeof MODULE_MANIFEST !== "undefined" ? MODULE_MANIFEST : []', sb) || [];
  })();
  const modulesWithSets = new Set(allSets.map(s => Number(s.moduleNum)));
  for (const m of manifest) {
    if (!modulesWithSets.has(m.num))
      { warn(`Module ${m.num} ("${m.name}") is in the dropdown manifest but has no Sets yet`); warnings++; }
  }

  // The nav layer (progress strip, dropdown counts) reads per-module skill totals
  // from MODULE_MANIFEST's skillCount + skillIdRe WITHOUT loading module files, so
  // those two fields duplicate data that lives in the module files. Verify they
  // still match the real set-skills — see the sync rule in CLAUDE.md.
  const skillsByModule = new Map();     // moduleNum → [skill id, …]
  const seenSkillIds = new Map();       // moduleNum → Set of skill ids seen so far
  for (const s of allSets) {
    const n = Number(s.moduleNum);
    if (!skillsByModule.has(n)) skillsByModule.set(n, []);
    if (!seenSkillIds.has(n)) seenSkillIds.set(n, new Set());
    const seenInModule = seenSkillIds.get(n);
    const ids = (Array.isArray(s.skills) ? s.skills : []).map(sk => sk && sk.id).filter(Boolean);
    for (const id of ids) {
      if (seenInModule.has(id)) { err(`Module ${n} · set "${s.id}": duplicate skill id "${id}"`); problems++; }
      else seenInModule.add(id);
    }
    skillsByModule.get(n).push(...ids);
  }
  for (const m of manifest) {
    if (!modulesWithSets.has(m.num)) continue;     // no sets yet (warned above)
    const ids = skillsByModule.get(m.num) || [];
    if (m.skillCount === undefined) { err(`Module ${m.num}: MODULE_MANIFEST is missing "skillCount"`); problems++; }
    else if (ids.length !== m.skillCount)
      { err(`Module ${m.num}: MODULE_MANIFEST skillCount=${m.skillCount} but module-${m.num}.js has ${ids.length} set-skills — update config-main.js`); problems++; }
    if (m.skillIdRe === undefined) { err(`Module ${m.num}: MODULE_MANIFEST is missing "skillIdRe"`); problems++; continue; }
    let re = null;
    try { re = new RegExp(m.skillIdRe); }
    catch { err(`Module ${m.num}: skillIdRe "${m.skillIdRe}" is not a valid regex`); problems++; }
    if (re) {
      const bad = ids.find(id => !re.test(id));
      if (bad) { err(`Module ${m.num}: skillIdRe "${m.skillIdRe}" doesn't match skill id "${bad}"`); problems++; }
      // A regex that also matches another module's ids would double-count at runtime.
      for (const [other, otherIds] of skillsByModule) {
        if (other === m.num) continue;
        const clash = otherIds.find(id => re.test(id));
        if (clash) { err(`Module ${m.num}: skillIdRe "${m.skillIdRe}" also matches Module ${other}'s skill "${clash}" — would double-count`); problems++; break; }
      }
    }
  }

  if (problems === 0) ok(`${allSets.length} Sets across ${MODULE_FILES.length} modules — all valid`);
  checkI18nCompleteness(manifest, allSets, reviewsByModule, moduleSongsByModule);
  validateNoteBeats(allSets);
  checkMcAnswerTells(allSets);
  checkFrozenGradedMcs(allSets);
  checkMcShoutedAnswer(allSets);
  checkMcCatchAllDistractors(allSets);
  checkMcAnswerOnCard(allSets);
  checkPlaySeqStrings(allSets);
  checkTuningWarmupTag(allSets);
  checkSectionKindTitle(allSets);
  checkHiddenStepComments();
  return allSets;
}

/* ════════════════════════════════════════════════════════════════════
   1r. TUNING-WARMUP TAG ↔ TITLE — app.js's isTuningWarmupSection() drops
   these sections from the ladder BEFORE sections are numbered, so every
   stored progress key in the 27 sets that carry one
   (`${set}-b-sec{gi}-{i}`) is a post-filter index. The predicate used to
   match the English title alone, which made a copy edit to that one
   string silently renumber every later section in those sets — moving
   students' done-marks, MC picks and written responses onto the wrong
   steps, with nothing to notice it.

   The predicate now matches `kind: 'tuning-warmup'` and keeps the title
   as a backstop. That only helps while the two agree, so assert both
   directions: a section titled like a tuning warm-up must carry the tag,
   and a tagged section must still be titled that way. Retitling one is
   then a two-line edit that fails loudly if half-done, instead of a
   one-line edit that corrupts progress quietly.
   ════════════════════════════════════════════════════════════════════ */
const TUNING_WARMUP_TITLE = 'Warm-up — tuning check (Module 1)';
const TUNING_WARMUP_COUNT = 27;
function checkTuningWarmupTag(allSets) {
  head('1r. Tuning warm-up sections carry their kind tag');
  let bad = 0, tagged = 0;
  for (const w of allSets) {
    for (const stId of Object.keys(w.stations || {})) {
      const sections = (w.stations[stId] || {}).sections || [];
      sections.forEach((sec, si) => {
        const where = `${w.id} · station "${stId}" · section ${si + 1}`;
        const looksLikeWarmup = /^Warm-?up\s*[—-]\s*tuning check/i.test(sec.title || '');
        if (sec.kind === 'tuning-warmup') {
          tagged++;
          if (sec.title !== TUNING_WARMUP_TITLE) {
            err(`${where}: tagged 'tuning-warmup' but titled "${sec.title}" — app.js keeps the exact title as a backstop, so update both or neither`);
            problems++; bad++;
          }
        } else if (looksLikeWarmup && Number(w.moduleNum) !== 1) {
          err(`${where}: looks like a tuning warm-up ("${sec.title}") but has no kind:'tuning-warmup' — without the tag it is filtered by title alone, and every later section's progress keys ride on that string`);
          problems++; bad++;
        }
      });
    }
  }
  /* Pinned. Both branches above pass if a section's title AND its tag are
     removed in the same edit — which is precisely the state that breaks
     things: isTuningWarmupSection() stops filtering it, and every later
     section in that station shifts its positional progress keys. Only a
     deliberate edit to this number can lower the total. */
  if (tagged !== TUNING_WARMUP_COUNT) {
    err(`${tagged} sections carry kind:'tuning-warmup', expected ${TUNING_WARMUP_COUNT} — if a warm-up was genuinely added or removed, update TUNING_WARMUP_COUNT in checks.mjs in the same commit. A drop usually means a section lost its tag AND its title together, which silently reshuffles every later progress key in that station.`);
    problems++; bad++;
  }
  if (bad === 0) ok(`${tagged} tuning warm-up sections tagged and titled consistently`);
}

/* ════════════════════════════════════════════════════════════════════
   1ad. RENDER-TIME SECTION KIND ↔ TITLE — Today-first work order, Phase 3.
   Four more `kind` values (take-to-song, routine, ear-spark, reflection)
   now drive visibleSections() in app.js, same render-time-hiding mechanism
   1r protects for tuning-warmup. Module 2 alone shipped one-way (kind ⇒
   title only) while the rest of the course was still untagged; now that
   every module (1, 3–13) is tagged too (step 2 of the work order), this
   checks BOTH directions, same shape as 1r: a tagged section must have the
   matching title, AND a section titled like one of these must carry the
   kind — so a title copy-edit and a dropped tag are equally loud instead
   of one of them silently reshuffling every later section's progress keys
   in that station.
   ════════════════════════════════════════════════════════════════════ */
const KIND_TITLE_TABLE = [
  { kind: 'take-to-song', titles: ['Take It to a Song'] },
  { kind: 'routine', titles: [
    'My Practice Routine — weekly check-in (never graded)',
    'My Practice Routine — session check-in (never graded)',   // Module 1's variant
  ] },
  { kind: 'ear-spark', titles: ['Ear Spark — optional ear bonus'] },
  { kind: 'reflection', titles: ['Checkpoint', 'Wrap-Up'] },
];
const TITLE_TO_KIND = new Map(KIND_TITLE_TABLE.flatMap(r => r.titles.map(t => [t, r.kind])));
// Pinned per kind — a drop usually means a section lost its kind tag while
// keeping its title (or vice versa via a copy-paste), which is exactly the
// silent-renumber risk this ratchet exists to catch. Only a deliberate
// widening (a set gains a genuinely new one of these sections) or
// narrowing (Phase 3's step-level hiding removes one) should move these.
const KIND_TITLE_COUNTS = { 'take-to-song': 29, 'routine': 5, 'ear-spark': 7, 'reflection': 62 };
function checkSectionKindTitle(allSets) {
  head('1ad. Render-time section kind ↔ title');
  let bad = 0;
  const counts = {};
  for (const { kind } of KIND_TITLE_TABLE) counts[kind] = 0;
  for (const w of allSets) {
    for (const stId of Object.keys(w.stations || {})) {
      const sections = (w.stations[stId] || {}).sections || [];
      sections.forEach((sec, si) => {
        const where = `${w.id} · station "${stId}" · section ${si + 1}`;
        const expectedKind = TITLE_TO_KIND.get(sec.title);
        if (sec.kind && sec.kind in counts) {
          counts[sec.kind]++;
          const row = KIND_TITLE_TABLE.find(r => r.kind === sec.kind);
          if (!row.titles.includes(sec.title)) {
            err(`${where}: kind:'${sec.kind}' but titled "${sec.title}" — expected one of ${row.titles.map(t => `"${t}"`).join(' / ')}`);
            problems++; bad++;
          }
        } else if (expectedKind) {
          err(`${where}: titled "${sec.title}" but has no kind:'${expectedKind}' tag — without it visibleSections() won't hide it, and it silently renumbers every later section's progress keys once it eventually is tagged`);
          problems++; bad++;
        }
      });
    }
  }
  for (const kind of Object.keys(KIND_TITLE_COUNTS)) {
    if (counts[kind] !== KIND_TITLE_COUNTS[kind]) {
      err(`${counts[kind]} sections carry kind:'${kind}', expected ${KIND_TITLE_COUNTS[kind]} — if this kind was genuinely added to (or removed from) a set, update KIND_TITLE_COUNTS in checks.mjs in the same commit.`);
      problems++; bad++;
    }
  }
  if (bad === 0) ok(`${Object.values(counts).reduce((a, b) => a + b, 0)} render-time-hidden sections tagged and titled consistently`);
}

/* ════════════════════════════════════════════════════════════════════
   1ae. HIDDEN STEPS NAME THEIR ACTIVITY — every `hidden: true` step
   (Today-first work order, Phase 3: a song preview a class activity now
   teaches) carries a `// ... ca-<n>` comment on the line directly above it.
   A hidden step is otherwise a step with no visible explanation for why —
   the next person reading the module file (including a future audit) has
   nothing to tell them it's deliberate, let alone which activity replaced
   it. Mechanical: a line-above-line text check, not a data-shape one.
   Since 2026-10-16 a step can also be hidden because it was TRIMMED (the
   Module 3 clean-up: a frozen module can't delete a step without moving
   every key after it, so `hidden` is how a step comes out). The reason
   then reads "Hidden YYYY-MM-DD (...)" instead of naming an activity. The
   comment block directly above (consecutive // lines) must carry one of
   the two; a bare `hidden: true` still fails.
   ════════════════════════════════════════════════════════════════════ */
function checkHiddenStepComments() {
  head('1ae. Hidden steps carry a // ca-<n> or // Hidden <date> reason');
  let bad = 0, hiddenCount = 0;
  for (const file of MODULE_FILES) {
    let lines;
    try { lines = readFileSync(join(ROOT, file), 'utf8').split('\n'); } catch { continue; }
    lines.forEach((line, li) => {
      if (!/^\s*hidden:\s*true\s*,?\s*$/.test(line)) return;
      hiddenCount++;
      const block = [];
      for (let k = li - 1; k >= 0 && /^\s*\/\//.test(lines[k]); k--) block.unshift(lines[k].trim());
      const why = block.join(' ');
      if (!block.length || !(/\bca-\d+\b/.test(why) || /\bHidden \d{4}-\d{2}-\d{2}\b/.test(why))) {
        err(`${file}:${li + 1}: 'hidden: true' with no "// ... ca-<n>" or "// Hidden YYYY-MM-DD (why)" comment directly above it — say which class activity now teaches this step, or why it was trimmed`);
        problems++; bad++;
      }
    });
  }
  if (hiddenCount === 0) { warn('no hidden:true steps found yet — 1ae has nothing to check'); warnings++; return; }
  if (bad === 0) ok(`${hiddenCount} hidden steps all carry a // ca-<n> or // Hidden <date> reason above them`);
}

/* ════════════════════════════════════════════════════════════════════
   1c. NOTE "beats" SHAPE — tab.notes and playSeq.notes entries may
   optionally carry { beats: N } (or, for tab notes, a bare beats field
   alongside string/fret/midi) so a demo can hold a note longer than one
   beat. Default is 1 and every existing entry omits it, so this only
   fires on the new field — nothing else about note shape is checked.
   ════════════════════════════════════════════════════════════════════ */
/* A tab note may also carry `finger` — the fretting finger, drawn in a circle
   under the staff in place of the note name (Finger Gym convention, 2026-08-28).
   Only 1-4 are fingers; a 0 (open) or a 5 is a typo, or a fret number pasted
   into the wrong field. Shared by the module-file walk here and the
   class-activities walk further down. */
function checkFinger(where, n) {
  if (n && n.finger !== undefined && !(Number.isInteger(n.finger) && n.finger >= 1 && n.finger <= 4))
    { err(`${where}: "finger" ${JSON.stringify(n.finger)} is not a fretting finger 1-4`); problems++; }
}
function validateNoteBeats(allSets) {
  head('1c. Note "beats" / "finger" field shape');
  const checkBeats = (where, n) => {
    if (!n || typeof n !== 'object' || Array.isArray(n)) return;
    if (n.beats !== undefined && !(typeof n.beats === 'number' && n.beats > 0))
      { err(`${where}: "beats" should be a positive number`); problems++; }
    checkFinger(where, n);
  };
  const checkTabNotes = (where, notes) => {
    (notes || []).forEach((n, i) => checkBeats(`${where} · notes[${i}]`, n));
  };
  const checkTab = (where, tabSpec) => {
    if (!tabSpec) return;
    if (Array.isArray(tabSpec.phrases)) tabSpec.phrases.forEach((p, pi) => checkTabNotes(`${where} · phrases[${pi}]`, p.notes));
    else checkTabNotes(where, tabSpec.notes);
  };
  const checkPlaySeq = (where, ps) => {
    if (!ps || !Array.isArray(ps.notes)) return;
    ps.notes.forEach((n, i) => checkBeats(`${where} · notes[${i}]`, n));
  };

  for (const w of allSets) {
    for (const stId of Object.keys(w.stations || {})) {
      const st = w.stations[stId];
      const sections = st.sections || (st.steps ? [{ title: '', steps: st.steps }] : []);
      sections.forEach(sec => {
        (sec.steps || []).forEach((step, sti) => {
          const stepWhere = `set "${w.id}" · station "${stId}" · step ${sti + 1}`;
          checkTab(`${stepWhere} · tab`, step.tab);
          if (Array.isArray(step.tabs)) step.tabs.forEach((t, ti) => checkTab(`${stepWhere} · tabs[${ti}]`, t));
          checkPlaySeq(`${stepWhere} · playSeq`, step.playSeq);
        });
      });
    }
    if (Array.isArray(w.skills)) {
      w.skills.forEach(sk => {
        if (sk.practice && sk.practice.type === 'playSeq') checkPlaySeq(`set "${w.id}" · skill "${sk.id}" · practice`, sk.practice);
      });
    }
  }

  if (problems === 0) ok('all note "beats" / "finger" fields (where present) are valid');
}

/* ════════════════════════════════════════════════════════════════════
   1h. MC ANSWER-LENGTH TELLS — a keyed choice that stands out by
   LENGTH lets students guess without knowing the material. Two sweeps
   (2026-07-31, 2026-08-01) found and fixed the longest-answer form by
   hand; this makes it structural. Flags any 3+-choice MC, in EITHER
   language, whose keyed answer is strictly longest OR strictly
   shortest, by ≥1.3× and ≥8 characters.

   The shortest form was added 2026-09-05, after an audit found five
   cards where the right answer was the conspicuously short one — "Thumb"
   among three "... finger" options, "vi–I–ii–IV" among three numeral
   strings that each carried their reasoning. Same tell, mirrored, and
   the original check couldn't see it.

   Both bounds need the ≥8-character floor as well as the ratio: without
   it, one-word answers ("Em" against "G", 9 chars against 5) trip a
   ratio test constantly and mean nothing to a student.

   Fix by giving the odd one out the same level of detail as the rest —
   not by padding with filler.
   ════════════════════════════════════════════════════════════════════ */
function checkMcAnswerTells(allSets) {
  head('1h. MC answer-length tells');
  const RATIO = 1.3, MIN_DIFF = 8;
  let total = 0, bad = 0;

  const checkLang = (choices, answer, where, lang) => {
    const lens = choices.map(c => String(c).length);
    const key = lens[answer];
    const others = lens.filter((_, i) => i !== answer);
    const shortest = Math.min(...others);
    if (key < shortest && shortest >= RATIO * key && shortest - key >= MIN_DIFF) {
      err(`${where} [${lang}]: keyed answer is the giveaway-shortest choice (${key} vs ${shortest} chars) — "${String(choices[answer]).slice(0, 50)}…"`);
      problems++; bad++;
    }
    const second = Math.max(...others);
    if (key > second && key >= RATIO * second && key - second >= MIN_DIFF) {
      err(`${where} [${lang}]: keyed answer is the giveaway-longest choice (${key} vs ${second} chars) — "${String(choices[answer]).slice(0, 50)}…"`);
      problems++; bad++;
    }
  };
  const checkMc = (mc, where) => {
    if (!mc || mc.type !== 'mc' || !Array.isArray(mc.choices) || typeof mc.answer !== 'number') return;
    if (mc.choices.length < 3 || !mc.choices[mc.answer]) return;
    total++;
    checkLang(mc.choices, mc.answer, where, 'en');
    if (Array.isArray(mc.choices_es) && mc.choices_es.length === mc.choices.length)
      checkLang(mc.choices_es, mc.answer, where, 'es');
  };
  const walk = (obj, where) => {
    if (!obj || typeof obj !== 'object') return;
    if (obj.type === 'mc') checkMc(obj, where);
    for (const [k, v] of Object.entries(obj)) {
      if (k.endsWith('_es')) continue;
      if (v && typeof v === 'object') walk(v, where);
    }
  };
  for (const w of allSets) {
    for (const stId of Object.keys(w.stations || {})) {
      const st = w.stations[stId];
      const sections = st.sections || (st.steps ? [{ steps: st.steps }] : []);
      sections.forEach(sec => (sec.steps || []).forEach((step, i) =>
        walk(step, `set "${w.id}" · station "${stId}" · step ${i + 1}`)));
    }
    (Array.isArray(w.skills) ? w.skills : []).forEach(sk =>
      walk(sk && sk.practice, `set "${w.id}" · skill "${sk && sk.id}" · practice`));
  }
  if (bad === 0) ok(`no answer-length tells across ${total} MCs (checked in both languages)`);
}

/* ════════════════════════════════════════════════════════════════════
   1ap. FROZEN KEYED MCs — a KEYED multiple-choice (a `response:
   { type:'mc' }` on a lesson step) persists the chosen choice's TEXT,
   not its index. Reword a choice after a student has picked it and
   their stored answer matches nothing on the card any more: it renders
   as "answered, nothing selected", and there is no way to tell from
   the data that it was ever right.

   So every keyed MC in Modules 1..FROZEN_MC_THROUGH_MODULE is pinned
   by a fingerprint of its `choices` + `choices_es` + `answer`. Change
   one character and this check goes red with the reason, rather than
   the damage showing up weeks later in a student's progress page.

   The practice-panel MC on a skill is NOT covered here — it stores the
   index, so its wording is free to change and its ORDER is what must
   not. That one is a review-time rule, not a mechanical one.

   ── RAISE THE CONSTANT AS THE CLASS ADVANCES ──
   FROZEN_MC_THROUGH_MODULE is "the furthest module a student has
   reached". Ask Jonathan which module the class is in and raise it —
   then re-run with --check and paste the printed fingerprints in, in
   the same commit. Lowering it is almost never right: a module the
   class has already passed keeps its stored answers forever. The one
   exception is the summer reset, which sets it to 0 (and empties
   FROZEN_MC_FINGERPRINTS) on purpose — see CLAUDE.md's "Summer reset
   list".

   Modules 3–6 were reworded on 2026-09-19 (the quiz-giveaways work
   order) precisely because nobody had reached them yet. Module 3 was
   pinned on 2026-10-01, a day AHEAD of the class: until that day a
   locked-out student could tap a quiz choice in a set's read-only
   preview and have it saved (app.js, isPeekedResponseKey), so "nobody
   has answered these" could not be taken on trust for the next module
   up. Pin a module when the class is about to reach it, not after.
   ════════════════════════════════════════════════════════════════════ */
const FROZEN_MC_THROUGH_MODULE = 3;   // students are about to enter Module 3 (Jonathan, 2026-10-01); was 2 (2026-09-19)
const FROZEN_MC_FINGERPRINTS = {
  'w1·b·sec0·step2': '668fc32b5e8cc516',
  'w1·b·sec1·step0': '81a193a1701dd036',
  'w1·b·sec2·step0': 'be803497cbcb926f',
  'w2·b·sec0·step0': '07296b3215c43902',
  'w2·b·sec0·step1': '4a352ae8bc9b434e',
  'w2·b·sec0·step2': '6fec4f7b9d504ef1',
  'w2·b·sec0·step3': '80edeb91da013eb5',
  'w2·b·sec0·step4': 'aa2ba845ff4a35ac',
  'w2·b·sec0·step5': '7618d4b79e83cf67',
  'w2·b·sec1·step2': '68d619ef15c36c30',
  'm2w1·b·sec0·step0': '0f4f02095d20caf3',
  'm2w1·b·sec2·step0': '5ae4ee8377ad36f1',
  'm2w1·c·sec1·step1': '8035342978401bd1',
  'm2w1·c·sec2·step1': '81880d91285378b8',
  'm2w2·b·sec0·step1': '2b8df432062bf537',
  'm2w2·b·sec0·step2': '69a47fa1e26ece32',
  'm2w2·b·sec1·step1': '1ab25779aa2ef868',
  'm2w2·c·sec0·step3': '77eba66498d9971c',
  'm2w2·c·sec1·step4': '4c1583f324c81209',
  // Module 3 — pinned 2026-10-01, the day before the class reached it.
  'm3w1·b·sec0·step0': 'c96a4e8a77c9b746',   // 2026-10-19 reworded twice with renamedChoices (Jonathan)
  'm3w1·b·sec1·step1': '56086620b6ae5dc1',
  'm3w1·c·sec2·step1': '132d5423a393f611',   // 2026-10-19 added after Module 3 opened (Jonathan)
  'm3w1·c·sec4·step0': '982ff1050e4ee042',
  'm3w2·b·sec0·step0': '1a402410b40720f2',
};
function gradedMcFingerprint(mc) {
  return createHash('sha256')
    .update(JSON.stringify({ choices: mc.choices, choices_es: mc.choices_es, answer: mc.answer }))
    .digest('hex').slice(0, 16);
}
function checkFrozenGradedMcs(allSets) {
  head(`1ap. Keyed MC choices frozen through Module ${FROZEN_MC_THROUGH_MODULE}`);
  let bad = 0;
  const seen = {};
  for (const w of allSets) {
    if (!(Number(w.moduleNum) <= FROZEN_MC_THROUGH_MODULE)) continue;
    for (const stId of Object.keys(w.stations || {})) {
      const st = w.stations[stId];
      const sections = st.sections || (st.steps ? [{ steps: st.steps }] : []);
      sections.forEach((sec, si) => (sec.steps || []).forEach((step, i) => {
        const r = step.response;
        if (!r || r.type !== 'mc' || !Array.isArray(r.choices)) return;
        // Keyed on WHERE the MC lives, never on what it says — the wording is
        // the thing under guard, so it can't also be the identity.
        const key = `${w.id}·${stId}·sec${si}·step${i}`;
        const fp = gradedMcFingerprint(r);
        seen[key] = fp;
        const pinned = FROZEN_MC_FINGERPRINTS[key];
        if (pinned === undefined) {
          err(`${key} — "${step.label}": keyed MC in Module ${w.moduleNum} is not pinned. Students may already have answered it; add its fingerprint to FROZEN_MC_FINGERPRINTS in checks.mjs.`);
          problems++; bad++;
        } else if (pinned !== fp) {
          err(`${key} — "${step.label}": FROZEN keyed MC changed (${pinned} → ${fp}). Students store their pick as the choice TEXT, so every answer already given to this card is orphaned — it renders as "answered, nothing selected". Reword only with an old→new map in the renderer, or wait until progress resets for the new school year.`);
          problems++; bad++;
        }
      }));
    }
  }
  for (const key of Object.keys(FROZEN_MC_FINGERPRINTS)) {
    if (!(key in seen)) {
      err(`${key}: pinned keyed MC no longer exists — a frozen card was removed or moved, which orphans its stored answers too.`);
      problems++; bad++;
    }
  }
  if (bad === 0) ok(`${Object.keys(seen).length} keyed MCs in Modules 1–${FROZEN_MC_THROUGH_MODULE} match their pinned choices`);
  else console.log(`  ${C.dim}current fingerprints:\n${Object.entries(seen).map(([k, v]) => `    '${k}': '${v}',`).join('\n')}${C.reset}`);
}

/* ════════════════════════════════════════════════════════════════════
   MC GIVEAWAY DETECTORS (1at / 1au / 1av) — added 2026-09-20 after a
   sweep of Modules 7–13 found 47 questions a student could answer
   without knowing the material. All three walk the same surface: every
   MC in the course, graded and practice, in both languages.

   Shared helper — the strings that render on the SAME card as an MC,
   so a detector can ask "was the answer already on screen?".
     · a KEYED MC lives on a lesson step: its label, text, hint, stuck
       and levelUp all render around it (buildLesson in app.js).
     · a PRACTICE MC lives on a skill: buildChecklist prints the skill's
       `text` as an always-visible .sk-label right above the practice
       button (app.js:5140), and `gotItWhen` behind the #gi-<id> fold.
   ════════════════════════════════════════════════════════════════════ */
function mcCards(allSets) {
  const out = [];
  for (const w of allSets) {
    for (const stId of Object.keys(w.stations || {})) {
      const st = w.stations[stId];
      const sections = st.sections || (st.steps ? [{ steps: st.steps }] : []);
      sections.forEach((sec, si) => (sec.steps || []).forEach((step, i) => {
        if (!step.response || step.response.type !== 'mc') return;
        /* `parts` keeps each field on its own (1av clause (d) measures how
           near a word sits, and the end of the label is not "next to" the
           start of the text); `visible` is the same fields joined. */
        const parts = ['label', 'text', 'hint', 'stuck', 'levelUp'].map(f => step[f] || '');
        const parts_es = ['label_es', 'text_es', 'hint_es', 'stuck_es', 'levelUp_es'].map(f => step[f] || '');
        out.push({
          key: `${w.id}·${stId}·sec${si}·step${i}`, moduleNum: Number(w.moduleNum), kind: 'graded',
          label: step.label, mc: step.response,
          parts, parts_es, visible: parts.join(' '), visible_es: parts_es.join(' '),
        });
      }));
    }
    (Array.isArray(w.skills) ? w.skills : []).forEach(sk => {
      if (!sk || !sk.practice || sk.practice.type !== 'mc') return;
      const parts = [sk.text || '', sk.gotItWhen || ''], parts_es = [sk.text_es || '', sk.gotItWhen_es || ''];
      out.push({
        key: `skill ${sk.id}`, moduleNum: Number(w.moduleNum), kind: 'practice',
        label: sk.text, mc: sk.practice,
        parts, parts_es, visible: parts.join(' '), visible_es: parts_es.join(' '),
      });
    });
  }
  return out;
}

/* ════════════════════════════════════════════════════════════════════
   1at. THE KEYED CHOICE IS THE ONLY ONE SHOUTING — a choice that
   emphasises a word in CAPITALS when none of its neighbours do is a
   free answer: the student scans for the shouted word and never reads
   the question. A 2026-09-20 sweep found 8, all in Modules 7–12
   ("On the BACK of the neck", "then HAMMER onto fret 7", "contains
   ALL the chords").

   No allowlist and no innocent twin: chord symbols, note names, Roman
   numerals and the handful of real acronyms are excluded by NOT_SHOUT,
   and anything left is emphasis, which CLAUDE.md already says belongs
   at render time rather than in content. The fix is to drop the caps —
   or, where the emphasis genuinely teaches a contrast, to mirror it
   into the distractor it contrasts with (m10w2's relative/parallel
   pair does exactly that).

   Prompts are NOT scanned: a shouted word there ("which STRING?") is
   site convention and gives nothing away.
   ════════════════════════════════════════════════════════════════════ */
const NOT_SHOUT = /^(?:TAB|BPM|[A-G]|I{1,3}|IV|V|VI{1,2}|X|XX|EADGBE|DAH|ONE|TWO|OK|PDF|USA|AC|DC)$/;
function checkMcShoutedAnswer(allSets) {
  head('1at. Keyed MC choice is the only one shouting a word');
  let bad = 0, total = 0;
  const shouts = c => [...String(c).matchAll(/\b[A-Z]{2,}\b/g)].map(m => m[0]).filter(x => !NOT_SHOUT.test(x));
  for (const card of mcCards(allSets)) {
    for (const [lang, arr] of [['en', card.mc.choices], ['es', card.mc.choices_es]]) {
      if (!Array.isArray(arr) || arr.length < 3 || typeof card.mc.answer !== 'number') continue;
      total++;
      const withCaps = arr.map((c, i) => (shouts(c).length ? i : -1)).filter(i => i >= 0);
      if (withCaps.length === 1 && withCaps[0] === card.mc.answer) {
        err(`${card.key} [${lang}] — "${card.label}": the keyed choice is the ONLY one emphasising a word (${shouts(arr[card.mc.answer]).join(', ')}) — "${String(arr[card.mc.answer]).slice(0, 60)}". A student can find the answer by scanning for the capitals. Drop the caps, or mirror the emphasis into the distractor it contrasts with.`);
        problems++; bad++;
      }
    }
  }
  if (bad === 0) ok(`no keyed-choice emphasis tells across ${total} MC choice lists (both languages)`);
}

/* ════════════════════════════════════════════════════════════════════
   1au. NEVER-CORRECT DISTRACTORS — "It doesn't matter", "Either works
   equally well", "Nothing at all, ever", "Any string you like", "You
   can't". A student who has learned nothing but how tests are written
   crosses these off for free, so a four-choice question quietly becomes
   a two-choice one. The 2026-09-20 sweep found 30 across 26 MCs.

   ── WHY THIS ONE HAS AN ALLOWLIST AND 1at DOESN'T ──
   CLAUDE.md: "Reach for a whitelist over a blacklist whenever the
   banned word has an innocent twin." Several of these are real beginner
   beliefs, not filler — m5w1-s6's "Never repeating anything" is the
   plausible OPPOSITE of its keyed "repeat an idea, vary it, leave
   space", and m11w2-s6's "Can't tell from chords alone" is what a
   cautious student genuinely answers. Those are the best distractors on
   their cards, so the phrase list alone cannot decide. MC_CATCHALL_ALLOW
   holds every reviewed exception as `<card key>|<choice index>|<lang>`;
   anything not on it fails the push.

   The KEYED choice is never scanned — exactly two in the course contain
   an absolute ("At exactly the same time", "Never breaks at performance
   tempo") and both are correct. Neither are prompts or explains, where
   "the thumb never stops" is ordinary teaching.

   Entries below in Modules 1–6 are pre-existing and were reviewed, not
   fixed: Module 1–2 keyed MCs are frozen (see 1ap), and the rest were
   out of that sweep's scope. `w2·b·sec0·step0|2` is a genuine defect
   deferred to the reset — see CLAUDE.md's "Summer reset list".
   ════════════════════════════════════════════════════════════════════ */
const MC_CATCHALL_EN = /it doesn'?t matter|either [^.]{0,12}works|equally well|any [^.]{0,20}you like|whichever [^.]{0,20}(?:you like|happens)|as long as you|at random|wherever it|\bnever\b|\balways\b|can'?t be|you can'?t|it isn'?t|it can'?t|exactly the same|nothing at all|only ever|automatically|just pick one|your choice|doesn'?t play at all|can'?t tell/i;
const MC_CATCHALL_ES = /no importa|da igual|cualquier [^.]{0,25}quieras|al azar|donde sea|\bnunca\b|\bsiempre\b|jamás|no se puede|exactamente lo mismo|funciona igual/i;
const MC_CATCHALL_ALLOW = new Set([
  'w2·b·sec0·step0|2|en',        // "It doesn't matter which way" — FROZEN graded (1ap); on the Summer reset list
  'w2·b·sec0·step0|2|es',        //   same card, Spanish twin
  'skill m3w1-s3|1|en',          // "only ever hit the two strings you want" — a real beginner belief about aim
  'skill m5w1-s6|2|en',          // "Never repeating anything" — the plausible opposite of the keyed answer
  'skill m5w1-s6|2|es',          //   same card, Spanish twin
  'm5w2·b·sec1·step0|3|en',      // "They sound exactly the same" — a genuine hammer-on misconception
  'skill m4w2-s5|3|es',          // "Al azar" — a real (wrong) way students pick a practice order
  'skill m11w2-s6|3|en',         // "Can't tell from chords alone" — what a cautious student really answers
  'skill m11w2-s6|3|es',         //   same card, Spanish twin
]);
function checkMcCatchAllDistractors(allSets) {
  head('1au. Never-correct catch-all distractors');
  let bad = 0, allowed = 0;
  for (const card of mcCards(allSets)) {
    for (const [lang, arr, re] of [['en', card.mc.choices, MC_CATCHALL_EN], ['es', card.mc.choices_es, MC_CATCHALL_ES]]) {
      if (!Array.isArray(arr) || typeof card.mc.answer !== 'number') continue;
      arr.forEach((c, i) => {
        if (i === card.mc.answer || !re.test(String(c))) return;
        const id = `${card.key}|${i}|${lang}`;
        if (MC_CATCHALL_ALLOW.has(id)) { allowed++; return; }
        err(`${card.key} [${lang}] choice ${i} — "${card.label}": never-correct catch-all distractor "${String(c).slice(0, 60)}". A student crosses it off without knowing anything. Replace it with a near-miss a real beginner might believe — or, if it IS one, add '${id}' to MC_CATCHALL_ALLOW with a reason.`);
        problems++; bad++;
      });
    }
  }
  if (bad === 0) ok(`no unreviewed catch-all distractors (${allowed} reviewed exceptions allowed)`);
}

/* ════════════════════════════════════════════════════════════════════
   1av. THE ANSWER IS ALREADY ON THE CARD — the keyed choice repeats a
   phrase from text the same screen is already showing, and no
   distractor shares it. The student matches strings instead of knowing
   anything. This was the single biggest class in the 2026-09-20 sweep
   and the one every reviewer under-counted, because the leak is usually
   in the step's `hint` or the skill's own always-visible label rather
   than in the question.

   Matching is on 3-word content n-grams after stripping HTML and
   stopwords. Three clauses keep it honest:
     (a) the n-gram appears in the visible text,
     (b) it appears in NO distractor — a phrase shared with a distractor
         is common vocabulary, not a tell, and this clause is the whole
         discriminator,
     (c) it is absent from the prompt, which may legitimately repeat a
         term from the answer.
   Plus MC_LEAK_VOCAB: an n-gram made only of course vocabulary ("the
   low E", "on the fret") says nothing, so at least one token must come
   from outside that list.

   A card whose job IS to restate its own teaching (Module 1's tuner
   step, where the MC is a read-the-card check) goes in MC_LEAK_ALLOW,
   keyed `<card key>|<n-gram>`, the way JOURNEY_ALLOWED_DIFFS works.

   Hardened 2026-10-12: a keyed answer of 1–2 content words (139 of the
   486 choice lists after that day's review, one-letter answers aside —
   the run prints the live count) has no 3-word n-gram and was invisible; it is
   now matched whole (see the short-answer branch, which adds clause (d)).
   Roman numerals keep their case. The first run found 3 cards —
   m3w1-s1's label printed "(root + 5th)", m3w2-s5's printed "octave",
   m8w2-s2's gotItWhen said the ring finger "is hardest" — plus 2 by
   reading what clause (d) excuses: m8w1-s2's and m10w3-s1's gotItWhen
   each printed the whole lookup table its practice MC quizzed.
   Clause (d) was then too generous: it excused a card that named ANY
   distractor ANYWHERE, so "bright means major, dark and moody means
   minor" (m10w3-s4) and "name your strum as corcheas rectas" (m3w2-s6,
   Spanish) passed because the same card also said "major or minor" /
   "redondas, blancas, negras". It now judges each place the answer is
   printed by its nearest neighbours — see the short-answer branch.
   ════════════════════════════════════════════════════════════════════ */
const MC_LEAK_STOP = new Set((
  'the a an and or of to in on at it is are you your for that this from then than so no not but as be by ' +
  'can do does if into its just like make more most one only other out over same some such their them they ' +
  'very what when where which while who will would ' +
  /* Spanish stopwords matter as much as the English ones: without them an
     n-gram like "la nota trasteada" is two articles and a noun, and the check
     fires on ordinary grammar rather than on a leak. */
  'el la los las un una unos unas de del al en y o que se su sus lo le les por para con como es son esta ' +
  'estan ser estar hace hacer no ni mas muy ya si cuando donde cual cuales esto este esos esas tu tus mi ' +
  'mis te cada todo toda todos todas otro otra pero tambien solo entre sobre desde hasta cuerda cuerdas ' +
  /* "misma/mismo" joined 2026-10-12 as the twin of "same", which the English
     half has always had: "Pulsa la misma nota cerca del puente" put one more
     word between the answer and the alternative it sat beside than the
     English did, and clause (d) of 1av counts that distance. */
  'misma mismo mismas mismos'
).split(' '));
/* The Spanish half joined 2026-10-12: the list was English-only, so the
   Spanish twin of a vocabulary-only phrase counted as a leak — "Pulgar" was
   flagged on the very card where "Thumb" was not. */
const MC_LEAK_VOCAB = new Set(('string strings fret frets chord chords note notes beat beats bar bars play plays played playing thumb finger fingers barre pattern scale guitar hand strum strums low high open ' +
  'traste trastes acorde acordes nota notas tiempo tiempos compas compases toca tocar tocas pulgar dedo dedos cejilla patron escala guitarra mano rasgueo rasgueos rasguea grave aguda abierta abiertas').split(' '));
/* 1av clause (d) only: words too general to count as a card "naming" a
   distractor ("They sound identical", "Also major") or as the prompt's own
   cue word sitting beside the answer ("Which POWER chord…", "the same
   SHAPE", "slide along WITH him"). */
const MC_LEAK_GENERIC = new Set(('sound sounds same identical exactly also both neither none all different ' +
  'shape power with ' +
  'suena suenan igual iguales identicos exactamente tambien ambos ninguno ninguna todos diferente ' +
  'forma potencia').split(' '));
/* Every entry here is in Modules 1–6, which the 2026-09-20 sweep did not cover
   (it ran over 7–13). They are reviewed and deliberately carried, not tuned
   away — Modules 1–2's keyed MCs are frozen for the year (1ap), so two of
   them cannot be reworded until progress resets. Clearing the rest is a
   separate job; when a module gets swept, delete its entries here first and
   let the check tell you what is left. */
const MC_LEAK_ALLOW = new Set([
  'w2·b·sec0·step4|high loosen peg',        // Module 1 tuner card — the MC IS the read-the-card check; FROZEN (1ap)
  'skill w2-s3|3 4 mm',                     // a string gauge; the skill label has to state it
  'skill m2w2-s6|behind middle finger',     // pre-existing Module 2 debt, outside the 7–13 sweep
  'skill m2w2-s6|menos detras dedo',        //   same card, Spanish twin
  /* The skill label IS the one-finger-per-fret rule ("index=1 … ring=3 …")
     and its practice MC asks which finger plays fret 3 — a read-the-card
     check, like the Module 1 tuner card. Taking the table out of the label
     would take the rule out of the skill, so the card is excused instead. */
  'skill m2w2-s2|ring 3',
  'skill m2w2-s2|anular 3',                 //   same card, Spanish twin
  'skill m5w2-s1|p mf f',                   // the skill label has to define p / mf / f to be teachable at all
]);
function checkMcAnswerOnCard(allSets) {
  head('1av. Keyed MC answer already printed on the same card');
  /* Strip accents BEFORE dropping punctuation — otherwise "más" becomes the two
     tokens "m" and "s" and every Spanish n-gram turns to noise.
     A Roman numeral keeps its CASE (2026-10-12): case is the whole answer in
     a numeral question — I–V–vi–IV and I–V–VI–IV are different progressions —
     and lower-casing everything made a keyed "I–V–vi–IV" share its n-grams
     with a "I–V–VI–IV" distractor, so clause (b) read it as vocabulary and
     the check could never fire on a numeral card. */
  const ROMAN = /^(?:I{1,3}|IV|VI{0,2}|i{1,3}|iv|vi{0,2})(?:7|maj7|dim|o)?$/;
  const words = s => String(s || '').normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/<[^>]*>/g, ' ').replace(/[^A-Za-z0-9#]+/g, ' ')
    .split(' ').map(x => (ROMAN.test(x) ? x : x.toLowerCase()))
    .filter(x => x && !MC_LEAK_STOP.has(x));
  const grams = (a, n) => { const o = []; for (let i = 0; i + n <= a.length; i++) o.push(a.slice(i, i + n).join(' ')); return o; };
  const hasRun = (toks, run) => { for (let i = 0; i + run.length <= toks.length; i++) if (run.every((t, k) => toks[i + k] === t)) return true; return false; };
  let bad = 0, allowed = 0, total = 0, short = 0;
  for (const card of mcCards(allSets)) {
    for (const [lang, arr, vis] of [['en', card.mc.choices, card.visible], ['es', card.mc.choices_es, card.visible_es]]) {
      if (!Array.isArray(arr) || typeof card.mc.answer !== 'number' || !arr[card.mc.answer]) continue;
      total++;
      const visW = words(vis);
      if (!visW.length) continue;
      const promptW = words(lang === 'es' ? card.mc.prompt_es : card.mc.prompt);
      const distW = arr.filter((_, i) => i !== card.mc.answer).map(words);
      const keyW = words(arr[card.mc.answer]);
      let leaked;
      if (keyW.length >= 3) {
        const visG = new Set(grams(visW, 3));
        const promptG = new Set(grams(promptW, 3));
        const distG = new Set(distW.flatMap(d => grams(d, 3)));
        leaked = grams(keyW, 3).filter(g =>
          visG.has(g) && !distG.has(g) && !promptG.has(g) && g.split(' ').some(t => !MC_LEAK_VOCAB.has(t)));
      } else if (keyW.length && keyW.join('').length > 1) {
        /* A keyed answer of only 1–2 content words ("I–iii", "Fret 5",
           "An octave") has no 3-word n-gram at all, so until 2026-10-12 this
           check could never see one. Match it whole, word for word, under
           the same three clauses — on the card, in no distractor, not in the
           prompt — plus one more, because a short answer is usually a plain
           term the card has to use: (d) the card is LISTING the
           alternatives where it prints the answer. "Tell major from minor
           by ear" prints the keyed "Minor" and the distractor "Major" side
           by side; a student matching strings still has to choose, so that
           is vocabulary, not a tell.
           (d) is judged at EACH place the answer is printed, within one
           field, by its nearest neighbours (content words, stopwords
           dropped). That place is excused only when a distractor's own
           word — not shared with the keyed answer, not course vocabulary,
           not MC_LEAK_GENERIC — sits within 3 words of it, AND sits nearer
           than any CUE: a word the prompt uses that no distractor does. A
           tie goes against the card. So "call it major or minor before you
           check" is a list, while "bright means major, dark and moody means
           minor" pairs the answer with the prompt's own "moody … dark" and
           fails, and so does a lookup table ("index=1, middle=2, ring=3")
           whose prompt asks for fret 3 — a cue can sit INSIDE the keyed
           phrase. Cues are compared with a trailing plural "s" dropped, so
           "the nut is a real part; the hinge is not" or "…are real parts;
           the hinge is not" both answer "Which is NOT a part…". Until
           2026-10-12 one distractor word anywhere on the card excused every
           print of the answer, which is how m10w3-s4 and m3w2-s6 (Spanish)
           shipped. Known limit: the EN half of m3w2-s6 said "straight
           eighths" against a keyed "Eighth notes" — a different word form,
           which word-for-word matching does not see.
           A ONE-LETTER answer is skipped: a note letter is also a string
           and chord name ("the E and A strings", "low E"), so it collides
           with ordinary text on nearly every card — and for the same reason
           a one-letter prompt word is never a cue. */
        short++;
        const keySet = new Set(keyW);
        const plain = t => !MC_LEAK_VOCAB.has(t) && !MC_LEAK_GENERIC.has(t);
        const stem = t => (t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t);
        const distTok = distW.flat();
        const distStem = new Set(distTok.map(stem));
        const names = new Set(distTok.filter(t => !keySet.has(t) && plain(t)));
        const cues = new Set(promptW.filter(t => plain(t) && !/^[A-Za-z]$/.test(t) && !distStem.has(stem(t))).map(stem));
        const tellAt = (toks, at) => {
          const end = at + keyW.length - 1;
          const nearest = test => {
            let best = Infinity;
            for (let j = Math.max(0, at - 3); j <= Math.min(toks.length - 1, end + 3); j++) {
              const d = j < at ? at - j : j > end ? j - end : 0;
              if (d < best && test(toks[j])) best = d;
            }
            return best;
          };
          const toName = nearest(t => names.has(t)), toCue = nearest(t => cues.has(stem(t)));
          return !(toName <= 3 && toName < toCue);
        };
        const printed = (lang === 'es' ? card.parts_es : card.parts).map(words).some(toks => {
          for (let i = 0; i + keyW.length <= toks.length; i++)
            if (keyW.every((t, k) => toks[i + k] === t) && tellAt(toks, i)) return true;
          return false;
        });
        leaked = printed && !distW.some(d => hasRun(d, keyW)) && !hasRun(promptW, keyW) &&
          keyW.some(t => !MC_LEAK_VOCAB.has(t)) ? [keyW.join(' ')] : [];
      } else leaked = [];
      if (!leaked.length) continue;
      /* An allowlist entry excuses the CARD, not the phrase. A leaking answer
         usually overlaps its own card in several places at once, so a
         per-phrase exception would just surface the next n-gram and invite
         whoever is holding the push to paste that one in too. One reviewed
         decision per card is the honest unit. */
      if (leaked.some(g => MC_LEAK_ALLOW.has(`${card.key}|${g}`))) { allowed++; continue; }
      err(`${card.key} [${lang}] — "${card.label}": the keyed choice repeats "${leaked[0]}" from text already on screen (its ${card.kind === 'practice' ? 'skill label or gotItWhen' : 'step text or hint'}), and no distractor uses it. Reword whichever one you can — or add '${card.key}|${leaked[0]}' to MC_LEAK_ALLOW with a reason.`);
      problems++; bad++;
    }
  }
  if (bad === 0) ok(`no keyed answers printed on their own card across ${total} MC choice lists (${short} of them 1–2-word answers matched whole; ${allowed} reviewed exceptions allowed)`);
}

/* ════════════════════════════════════════════════════════════════════
   1j. NUMBERED STRINGS IN STUDENT-FACING TEXT — course convention
   (Jonathan, 2026-08-06): strings are named (low E · A · D · G · B ·
   high e; ES solfège cuerda Mi grave … mi aguda), never numbered. A
   2026-08-06 sweep converted ~90 instances across modules 4–8 and 12.
   The ONLY allowed form is a digit immediately anchored to its name —
   "string 6 (the low E)" / "cuerda 5 (la La)" — used where a card
   deliberately teaches chart numbering (two Module 7 MCs). Chord
   shorthand like xx4432 carries no "string/cuerda" word and never
   matches. Fix by naming the string, not by adding an anchor.
   ════════════════════════════════════════════════════════════════════ */
/* Anchored teaching exceptions are PINNED (2026-09-28 double-check): the
   reversed "(6th string)" anchor used to accept any parenthesised ordinal
   with no string name in front of it, and a count that only prints can
   grow without anyone noticing. Bump on purpose when a card legitimately
   adds one. */
const NUMBERED_STRING_ANCHORS = 17;
function checkNumberedStrings() {
  head('1j. Numbered strings in student-facing text');
  const RE = /\b(?:string|strings|cuerda|cuerdas) [0-6]\b|\b[0-6](?:st|nd|rd|th)[\s-]+strings?\b|\b[0-6]\.?[ºª]\s+cuerdas?\b/gi;
  let bad = 0, anchored = 0;
  const files = [...MODULE_FILES, 'class-activities.js', 'i18n.js', 'config-main.js', ...TAB_PAGES.filter(f => f.endsWith('.html'))];
  for (const file of files) {
    const lines = readFileSync(join(ROOT, file), 'utf8').split('\n');
    lines.forEach((line, li) => {
      for (const m of line.matchAll(RE)) {
        const after = line.slice(m.index + m[0].length);
        const before = line.slice(Math.max(0, m.index - 12), m.index);
        const oldForm = /^(?:string|cuerda)/i.test(m[0]);   // "string 6" — the ordinal form starts with the digit
        if (/^ \((?:the|la|el) /.test(after)) { anchored++; continue; }   // "string 6 (the low E)" teaching anchor
        // "Low E (6th string)" — same anchor, reversed order. The string NAME
        // has to be right before the paren, or "the thin one (1st string)"
        // would count as anchored too.
        if (/(?:\b[ADGBE]|\be|\b(?:Mi|La|Re|Sol|Si)|aguda|grave)\s?\($/.test(before) && /^\)/.test(after)) { anchored++; continue; }
        // "the A string 4 times" — a named string followed by a count, not a
        // numbered string. Only for the old form: before an ordinal, a lone
        // "a" is the article ("Find a 5th string root"), not the A string.
        if (oldForm && /(?:\b[ADGBE]|\be|aguda|grave)\s$/.test(before)) continue;
        err(`${file}:${li + 1}: numbered string in student-facing text — "${line.slice(Math.max(0, m.index - 20), m.index + m[0].length + 20).trim()}" (use the string's name)`);
        problems++; bad++;
      }
    });
  }
  if (anchored !== NUMBERED_STRING_ANCHORS) {
    err(`1j: ${anchored} anchored numbered-string exception${anchored === 1 ? '' : 's'} found, but NUMBERED_STRING_ANCHORS pins ${NUMBERED_STRING_ANCHORS} — a new "(the low E)"-style anchor needs a deliberate bump (or is a numbered string hiding behind a paren)`);
    problems++; bad++;
  }
  if (bad === 0) ok(`no numbered strings in student-facing text (${anchored} anchored teaching exception${anchored === 1 ? '' : 's'} allowed, pinned)`);
}

/* ════════════════════════════════════════════════════════════════════
   1k. FILTER-BLOCKED TAB SITES BY NAME — student-facing text must not
   send students to a specific external TAB site. School Chromebooks
   filter them, so a named site is a dead end mid-challenge (Jonathan,
   2026-08-07). A 2026-08-07 sweep pulled 6 instances (3 EN/ES pairs)
   out of module-7.js. The cards still teach "find a TAB online" — it
   is naming the destination that breaks. Fix by describing what to
   look for (rhythm stems above the numbers), not where to go.
   ════════════════════════════════════════════════════════════════════ */
function checkBlockedTabSites() {
  head('1k. Filter-blocked TAB sites named in student-facing text');
  const RE = /songsterr|ultimate[\s-]?guitar/gi;
  let bad = 0;
  for (const file of [...MODULE_FILES, 'class-activities.js', 'i18n.js', 'index.html', ...TAB_PAGES]) {
    const lines = readFileSync(join(ROOT, file), 'utf8').split('\n');
    lines.forEach((line, li) => {
      for (const m of line.matchAll(RE)) {
        err(`${file}:${li + 1}: names a filter-blocked TAB site — "${line.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30).trim()}" (describe what to look for, not which site)`);
        problems++; bad++;
      }
    });
  }
  if (bad === 0) ok('no filter-blocked TAB sites named in student-facing text');
}

/* ════════════════════════════════════════════════════════════════════
   1n. RETIRED STATION WORDING — the classroom's three-group B/C
   rotation ended 2026-08-27 (Work Order 7). The room is two groups now
   (one with the teacher, one on the site), so a set renders as ONE
   linear ladder and nothing student-facing names a station. That sweep
   retired 208 instances: 94 "Station Wrap-Up", 104 "Cierre de la
   estación", 10 "Station wrap-up", plus the nav/search i18n keys.
   The mid-set reflection card is "Checkpoint" / "Punto de control";
   the end-of-set one is "Wrap-Up" / "Cierre".
   The DATA layer keeps `stations.b` / `stations.c` and their progress
   keys untouched, so this only looks at text students read — quoted
   string literals in the module files and i18n.js, and visible text in
   index.html / the Journey pages. Fix by naming the work, not the
   station. (The student tour was deleted rather than rewritten — it was
   the last surface still teaching the B/C model, and Jonathan is building a
   new one against the merged ladder.)
   ════════════════════════════════════════════════════════════════════ */
function checkRetiredStationWording() {
  head('1n. Retired station wording in student-facing text');
  const RE = /\b(?:Station|Estaci[oó]n)\s+[BC]\b|Station Wrap-?Up|Cierre de la estaci[oó]n/gi;
  let bad = 0;
  for (const file of [...MODULE_FILES, 'class-activities.js', 'i18n.js', 'index.html', ...TAB_PAGES]) {
    let lines;
    try { lines = readFileSync(join(ROOT, file), 'utf8').split('\n'); } catch { continue; }
    lines.forEach((line, li) => {
      if (/^\s*(\/\/|\*|\/\*|<!--)/.test(line)) return;   // a comment may still discuss the old model
      for (const m of line.matchAll(RE)) {
        err(`${file}:${li + 1}: retired station wording — "${line.slice(Math.max(0, m.index - 25), m.index + m[0].length + 25).trim()}" (the ladder is one linear block; use Checkpoint / Wrap-Up)`);
        problems++; bad++;
      }
    });
  }
  if (bad === 0) ok('no retired station wording in student-facing text');
}

/* ════════════════════════════════════════════════════════════════════
   1n2. ROTATION-STATION NAMES IN STUDENT-FACING TEXT — the sibling of
   1n. Where 1n bans the retired "Station B/C" labels, this bans the two
   places they named: the "computer station" and the "practice station".
   Since WO7 (2026-08-27) a set renders as ONE continuous ladder, so a
   card that says "you'll drill this at the practice station" points at a
   room layout the student cannot see. The station titles are not even
   rendered any more — buildLesson()'s seam divider keeps only what
   follows the em-dash ("Practice station — melodies & TAB" shows as
   "Now practice — melodies & TAB"), so the words reach nobody.

   The 2026-09-09 sweep rewrote 10 EN/ES pairs across modules 1, 2, 4, 7,
   8, 9 and 11 into ladder-relative wording — "further down this set",
   "earlier in this set", "in the challenges below" / "más adelante en
   esta unidad", "antes en esta unidad", "en los retos de abajo".
   Fix a relapse the same way: say where in the ladder, not which station.

   Scope is deliberately the two NAMES, not the word "station". Module 13
   uses "your station is clear" for the student's own work area during a
   restring — a different sense, still correct — and Spanish "estacionados"
   ("i-m-a stay parked") shares the stem. Banning the bare word would
   force a whitelist for both, which is exactly the fragile shape
   CLAUDE.md warns about; the two-name ban collides with neither.

   The `stations.b` / `stations.c` DATA and their `title` fields are
   untouched and out of scope — progress keys hang off them, and the
   titles are internal labels now. So the field list below deliberately
   omits `title`, and `\b` keeps `title` from matching inside `tabTitle`.

   HONEST LIMIT: this pins the two retired names, not every way of
   naming a place. "Over at the computers" would slip past. That is the
   same trade 1k and 1w make — catch the exact wording a sweep retired.
   ════════════════════════════════════════════════════════════════════ */
const STATION_NAME_RE =
  /\b(?:computer|practice)\s+stations?\b|\bestaci[oó]n(?:es)?\s+de\s+(?:computadora|pr[aá]ctica)\b/gi;
function checkStationNames() {
  head('1n2. Rotation-station names in student-facing text');
  const RE = STATION_NAME_RE;
  let bad = 0;
  const flag = (file, li, phrase) => {
    err(`${file}:${li + 1}: names a rotation station — "${phrase}" (the ladder is one block; say where in the set)`);
    problems++; bad++;
  };

  /* Module content + class activities — student-facing authoring fields in
     BOTH languages. `title`/`title_es` are excluded on purpose (see above);
     Spanish matters as much as English here, since nothing else reads it. */
  const FIELD_RE = new RegExp(
    '\\b(?:text|hint|stuck|levelUp|gotItWhen|explain|forward|subtitle|meta|intro|note|label|prompt|placeholder|caption|sub|tabTitle|tabSub)' +
    '(?:_es)?:\\s*\'((?:\\\\.|[^\'\\\\])*)\'', 'g');
  for (const file of [...MODULE_FILES, 'class-activities.js']) {
    let lines;
    try { lines = readFileSync(join(ROOT, file), 'utf8').split('\n'); } catch { continue; }
    lines.forEach((line, li) => {
      for (const f of line.matchAll(FIELD_RE))
        for (const m of f[1].matchAll(RE)) flag(file, li, m[0]);
    });
  }

  /* i18n.js — both sides of each key. */
  const VAL_RE = /\b(?:en|es):\s*(?:'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)")/g;
  try {
    readFileSync(join(ROOT, 'i18n.js'), 'utf8').split('\n').forEach((line, li) => {
      for (const e of line.matchAll(VAL_RE))
        for (const m of (e[1] ?? e[2] ?? '').matchAll(RE)) flag('i18n.js', li, m[0]);
    });
  } catch { /* checked elsewhere */ }

  /* Shell + Journey pages — visible text and data-es alike. */
  for (const file of ['index.html', ...TAB_PAGES]) {
    let lines;
    try { lines = readFileSync(join(ROOT, file), 'utf8').split('\n'); } catch { continue; }
    lines.forEach((line, li) => {
      if (/^\s*<!--/.test(line)) return;
      for (const m of line.matchAll(RE)) flag(file, li, m[0]);
    });
  }

  if (bad === 0) ok('no rotation-station names in student-facing text');
}

/* ════════════════════════════════════════════════════════════════════
   1br. A STEP POINTS AT PAGE PARTS THAT NO LONGER RENDER (2026-10-25).
   Two places a step used to send students are gone:
     · the per-module Songs fold at the foot of a set page — removed with
       the per-set Songs tab (2026-08-27); MODULE_SONGS now reaches students
       only through the Songs page in the left menu and search;
     · the "song card at the bottom of this station" — every
       kind:'take-to-song' section, hidden since TAKE_TO_SONG_ENABLED went
       false (2026-10-18).
   The 2026-10-25 sweep of Modules 7–13 found four rendered steps still
   pointing at one or the other: m12w3's "this module's Songs section at
   the bottom of the page", m8w2's "the song card at the bottom of this
   station", and two that named a hidden step by its module — m10w2's
   "your full Bm barre shape from Module 7" and m12w2's "you already
   fingerpicked this verse in Module 8".

   This bans the wording of the first two kinds, in BOTH languages: every
   student-facing field 1w reads (STUDENT_VALUE_NAME_RE), every `*_es`
   field 1w-t reads (ES_VALUE_NAME_RE), and both sides of i18n.js, through
   readFieldStrings, matched on the UNESCAPED value with &nbsp; read as a
   space. Hidden sections are read too — the take-to-song switch can be
   turned back on, and the Songs fold would still be gone. Fix a relapse by
   putting the link in the step, or by naming where the thing really is:
   the Songs page (left menu), or a place in the ladder ("Set 3,
   Challenge 2").

   Widened the same day after review: "end of this set / module / page /
   station" and "al final de esta unidad" / "al final del módulo" (the
   Songs fold sat there too), "pestaña Canciones" / "sección Canciones"
   without the "de", and "tarjeta de la canción".

   Two innocent twins are carved out. "Whole Song card" (EN) / "tarjeta
   de La canción completa" (ES) is the real name of the whole-song
   play-along cards (ca-24…ca-28), which five class-activity steps send
   students to — so "song card" never matches after "whole", and the
   Spanish "tarjeta de (la) canción" never matches before "completa". The
   carve-out excuses only those words: "the Whole Song card at the bottom
   of this station" still fails on "bottom of this station". And it is
   plural "songs section/tab" only: a singular "song tab" is a song's TAB.
   One i18n.js key is excused (GONE_UI_I18N_OK, below).

   HONEST LIMIT: phrases only. A pointer at a hidden step by its module
   number ("you did this in Module 8") passes; only reading finds those.
   ════════════════════════════════════════════════════════════════════ */
const GONE_UI_RE = new RegExp(
  '(?<!whole[ -])\\bsong cards?\\b|\\bsongs (?:section|tab|fold)s?\\b' +
  '|\\bbottom of (?:this|the) (?:station|page)\\b|\\bend of (?:this|the) (?:station|page|set|module)\\b' +
  '|\\btarjetas? de (?:la )?canci[oó]n(?! completa)|\\b(?:secci[oó]n|pesta[ñn]a)(?: de)? canciones' +
  '|\\bal final de (?:esta|la) (?:estaci[oó]n|p[aá]gina|unidad)|\\bal final del (?:m[oó]dulo|set)',
  'gi');
/* review.assessPopNote's "the bottom of this page" is the Module Review
   popup, and that page does end in the section it names. */
const GONE_UI_I18N_OK = new Set(['review.assessPopNote']);
/* 17,801 values on 2026-10-25 (9,199 EN · 5,912 ES · 2,690 i18n.js). The
   floor sits ~4% under that: losing i18n.js or the Spanish pass, or a big
   module file, fails; ordinary rewording does not. Lower it on purpose
   when content is deleted on purpose. */
const GONE_UI_READ_FLOOR = 17000;
function checkGoneUiPointers() {
  head('1br. Steps that point at page parts that no longer render');
  let bad = 0, read = 0;
  const scan = (file, line, field, text) => {
    read++;
    // &nbsp; / U+00A0 count as a space: "Songs&nbsp;section" is the same pointer.
    const t = straightQuotes(text).replace(/&nbsp;|\u00a0/g, ' ');
    for (const m of t.matchAll(GONE_UI_RE)) {
      err(`${file}:${line}: ${field} points at a page part that no longer renders — "${m[0]}" (link it in the step, or name the Songs page or a place in the ladder)`);
      problems++; bad++;
    }
  };
  /* English through 1w's field list, Spanish through 1w-t's (every `*_es`
     field), so each error names the field it is really in. */
  for (const file of STUDENT_VALUE_FILES) {
    for (const v of readFieldStrings(file, STUDENT_VALUE_NAME_RE) || [])
      if (!v.field.endsWith('_es')) scan(file, v.line, v.field, v.text);   // choices_es etc.: the ES pass reads them
    for (const v of readFieldStrings(file, ES_VALUE_NAME_RE) || []) scan(file, v.line, v.field, v.text);
  }
  /* i18n.js — both sides of every key but the one excused above. A key's
     values may sit on the lines after it, so the last key seen owns them. */
  try {
    let key = '';
    readFileSync(join(ROOT, 'i18n.js'), 'utf8').split('\n').forEach((line, li) => {
      const k = /^\s*'([\w.-]+)'\s*:/.exec(line);
      if (k) key = k[1];
      if (GONE_UI_I18N_OK.has(key)) return;
      for (const re of [STUDENT_I18N_EN_RE, STUDENT_I18N_ES_RE])
        for (const e of line.matchAll(re)) scan('i18n.js', li + 1, `${key} ${re === STUDENT_I18N_EN_RE ? 'en' : 'es'}`, unescapeJs(e[1] ?? e[2] ?? ''));
    });
  } catch { /* checked elsewhere */ }
  /* A floor, not just "read anything": a reader that silently loses a file
     or a language still reads thousands of values. */
  if (read < GONE_UI_READ_FLOOR) { err(`1br read only ${read} values (floor ${GONE_UI_READ_FLOOR}) — the field reader has lost a file or a language`); problems++; return; }
  if (bad === 0) ok(`no step points at the removed Songs fold or a hidden song card (${read} EN + ES values read, i18n.js included)`);
}

/* ════════════════════════════════════════════════════════════════════
   1o. TAB CAN SCROLL SIDEWAYS AGAIN — the inline TAB board is laid out to
   fill its card and wrap a long phrase onto a second staff (WO7,
   2026-08-28). Nothing about it may scroll horizontally: a student on a
   phone who has to swipe a riff sideways mostly doesn't discover there IS
   a sideways.

   The 2026-08-28 sweep (all 495 tab specs at 1100/768/390px) found 14
   tabs still overflowing a 390px screen, all from one cause: an
   invisible speaker glyph inside .tab-note-btn was still occupying
   layout width, and a grid column can never be narrower than the widest
   thing in it — so eight columns couldn't fit however small the frets
   got. Four mechanical preconditions have to hold or the scrolling comes
   back; each is greppable, so catch a relapse of exactly those.

   HONEST LIMIT: this proves the preconditions, not the absence of
   overflow — only a real browser can measure layout, and the repo has no
   build step or node_modules to hang a headless one off. A new element
   added inside a note button with a rest width would slip past this and
   reintroduce the exact 2026-08-28 bug. If that happens, the fix is the
   same shape: keep it out of flow at rest.
   ════════════════════════════════════════════════════════════════════ */
function checkTabNoScroll() {
  head('1o. Inline TAB horizontal-scroll preconditions');
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };

  let css, appjs;
  try { css = readFileSync(join(ROOT, 'styles.css'), 'utf8'); } catch { css = ''; }
  try { appjs = readFileSync(join(ROOT, 'app.js'), 'utf8'); } catch { appjs = ''; }

  const rule = (src, selector) => {
    const i = src.indexOf(selector + '{');
    return i === -1 ? null : src.slice(i + selector.length + 1, src.indexOf('}', i));
  };

  // 1. The board must not reintroduce its own scroller.
  const board = rule(css, '.tab-board');
  if (board === null) flag('styles.css: .tab-board rule not found — the TAB layout was restructured; re-verify this check');
  else if (/overflow(-x)?\s*:\s*(auto|scroll)/.test(board))
    flag('styles.css: .tab-board scrolls again (overflow auto/scroll) — a long phrase must wrap to a new staff, not scroll');

  // 2. min-width:max-content on the grid is what forced scrolling before WO7.
  const grid = rule(css, '.tab-grid');
  if (grid === null) flag('styles.css: .tab-grid rule not found — the TAB layout was restructured; re-verify this check');
  else if (/min-width\s*:\s*max-content/.test(grid))
    flag('styles.css: .tab-grid has min-width:max-content — that is exactly what forced the TAB to scroll before WO7');

  // 3. Columns must stay fractional; fixed px per column can outgrow the card.
  const tmpl = appjs.match(/grid-template-columns:[^"'`]*/g) || [];
  const tabTmpl = tmpl.filter(t => /repeat\(/.test(t));
  if (!tabTmpl.length) flag('app.js: no TAB grid-template-columns found — renderTabSystem was restructured; re-verify this check');
  for (const t of tabTmpl) {
    if (/repeat\([^)]*,\s*\d+px\s*\)/.test(t))
      flag(`app.js: TAB columns are a fixed px width (${t.trim()}) — use 1fr so N columns always share the card width`);
  }

  // 4. Nothing inside a note button may hold layout width at rest: a note
  //    button is the widest item in its column, so it sets the column floor.
  const spkr = rule(css, '.tab-note-btn .tab-spkr');
  if (spkr === null) flag('styles.css: .tab-note-btn .tab-spkr rule not found — if the glyph is back in flow at rest it sets the minimum column width (see 2026-08-28)');
  else if (!/max-width\s*:\s*0/.test(spkr))
    flag('styles.css: the speaker glyph holds layout width at rest (no max-width:0) — that is the 2026-08-28 bug: 14 tabs overflowed a 390px screen');

  // 5. The wrap constant must still exist and be sane.
  const max = appjs.match(/const\s+TAB_MAX_COLS\s*=\s*(\d+)/);
  if (!max) flag('app.js: TAB_MAX_COLS is gone — without it a long phrase has nothing to wrap at');
  else if (+max[1] < 2 || +max[1] > 12)
    flag(`app.js: TAB_MAX_COLS is ${max[1]} — outside the 2..12 range a staff stays readable in`);

  // 6. --tab-cell-h (desktop) must stay small enough for a four-line tab to
  //    fit an 1366x657 Chromebook screen without scrolling (WO 2026-09-23).
  if (grid !== null) {
    const cellH = grid.match(/--tab-cell-h\s*:\s*(\d+(?:\.\d+)?)px/);
    if (!cellH) flag('styles.css: .tab-grid has no --tab-cell-h — the TAB row height is unset');
    else if (+cellH[1] > 14)
      flag(`styles.css: .tab-grid --tab-cell-h is ${cellH[1]}px — over 14px, a four-line tab no longer fits a 1366×657 Chromebook (2026-09-23)`);
  }

  if (bad === 0) ok('inline TAB cannot scroll sideways (board, grid, columns, note-button width, wrap constant, row height)');
}

/* ════════════════════════════════════════════════════════════════════
   1q. JOURNEY-PAGE TAB CARDS MUST KEEP THE APP'S SHAPE — a tab inside a
   set is rendered by buildTab() in app.js; a tab on a tabs/*.html Journey
   page is hand-typed HTML. Until 2026-09-04 the Journey ones were bare
   <pre class="tab"> dark panels that looked nothing like the app card, and
   all 63 were converted to the same head/body/board markup.

   Nothing generates that markup, so the next hand-written tab can easily
   be typed the old way and be the one block on the site that still looks
   wrong. Two things are greppable: the retired <pre class="tab"> form, and
   whether each card carries the four parts the CSS styles.

   HONEST LIMIT: this checks structure, not appearance — the tab-card rules
   in tabs/journey-theme.css are a hand-kept copy of the .tab rules in
   styles.css (the Journey pages don't load styles.css), and only an eye on
   both can tell you they still match.
   ════════════════════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════════════════════
   1s. TEXT CONTRAST IN BOTH PALETTES — styles.css defines its colours as
   tokens and redefines a dozen of them under
   @media(prefers-color-scheme:dark). A rule that hard-codes `color:#fff`
   over `background:var(--something)` therefore only gets checked in the
   light palette by eye, and silently fails in dark mode when that token
   flips light: the 2026-09-05 audit found six such rules, worst at
   1.84:1 — white on the light blue used for the note under a playing
   TAB's beat cursor, i.e. invisible exactly while a student is following
   along. The site's own fix idiom is `color:var(--bg)`, which is #fff in
   light mode and near-black in dark.

   So: resolve every rule that sets BOTH a colour and a background,
   through each palette, and fail under 4.5:1. The rule's own `opacity`
   fades the colour toward an ancestor's surface. A colour and a surface
   that only the markup brings together are part 2 (CONTRAST_STATES,
   2026-10-26), below checkContrast().

   HONEST LIMITS — both err on the side of not crying wolf:
   · a translucent background (rgba/transparent) is skipped, because the
     real contrast depends on what it sits over and this parses one rule
     at a time;
   · WCAG allows 3:1 for large text, so a legitimately large-text pair
     between 3 and 4.5 would need adding to ALLOW below. Nothing on the
     site is in that band today.
   ════════════════════════════════════════════════════════════════════ */
/* Selectors held to 3:1 instead of 4.5:1, each with the reason. These are
   still CHECKED — an entry lowers the bar, it does not switch the selector
   off — so a colour change that drops one below 3:1 still fails the push.
   3:1 is the WCAG floor for large text (≥24px, or ≥18.7px bold) and for
   non-text graphics such as an icon glyph. */
const CONTRAST_ALLOW = new Map([
  // an 18px SVG icon inside the rail button, not a text glyph (1.4.11)
  ['.nav-btn.active .ico', 'an 18px SVG icon, not text'],
]);
/* Every stylesheet 1s reads. Until 2026-09-08 it read styles.css and nothing
   else, so the Journey pages and the two standalone pages — which carry their
   own palettes and their own dark blocks — were never checked at all. That is
   how .btn-translate.active shipped at 4.15:1 and the Mood chart's phone
   column labels at 1.25:1. */
const CONTRAST_SOURCES = [
  //  file,                      where the CSS is,  whose palette it uses
  ['styles.css',              'css',  null],
  ['tabs/journey-theme.css',  'css',  null],
  ['mood-chart.html',         'html', null],
  // 404.html has no :root of its own — it <link>s styles.css and its inline
  // block reads that palette's tokens.
  ['404.html',                'html', 'styles.css'],
];
const isDarkMedia = m => /prefers-color-scheme\s*:\s*dark/.test(m);
const isLightMedia = m => /prefers-color-scheme\s*:\s*light/.test(m);
const isPrintMedia = m => /@media[^{]*\bprint\b/.test(m);
/* Split a value on top-level whitespace: "var(--bg2) url(a b) no-repeat"
   is three tokens, and rgb(0, 0, 0) stays one. */
function cssTokens(v) {
  const out = []; let depth = 0, buf = '';
  for (const ch of String(v)) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (depth === 0 && /\s/.test(ch)) { if (buf) out.push(buf); buf = ''; continue; }
    buf += ch;
  }
  if (buf) out.push(buf);
  return out;
}
/* Resolve var(), including a var() nested inside another's fallback. The old
   version's fallback group was ([^)]+), so var(--x, rgb(1,2,3)) never matched
   and the pair was silently skipped. */
function cssVar(v, pal, d = 0) {
  if (v == null || d > 8) return null;
  v = String(v).replace(/\s*!\s*important\s*$/i, '').trim();
  const m = /^var\(\s*(--[\w-]+)\s*(?:,([\s\S]*))?\)$/.exec(v);
  if (!m) return v;
  if (pal[m[1]] != null) return cssVar(pal[m[1]], pal, d + 1);
  return m[2] != null ? cssVar(m[2].trim(), pal, d + 1) : null;
}
/* #rgb / #rrggbb / #rrggbbaa / rgb() / rgba() / hsl() / hsla() / white / black.
   Anything translucent returns null — it would have to be composited against
   whatever is behind it, which this check cannot know. */
function cssRGB(c) {
  if (c == null) return null;
  c = String(c).trim().toLowerCase();
  if (c === 'white') c = '#ffffff';
  if (c === 'black') c = '#000000';
  let m = /^#([0-9a-f]{3})$/.exec(c);
  if (m) return [0, 1, 2].map(i => parseInt(m[1][i] + m[1][i], 16));
  m = /^#([0-9a-f]{6})$/.exec(c);
  if (m) return [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16));
  m = /^#([0-9a-f]{8})$/.exec(c);
  if (m) return parseInt(m[1].slice(6, 8), 16) < 254 ? null
    : [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16));
  m = /^rgba?\(([^)]*)\)$/.exec(c);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean);
    if (p.length < 3) return null;
    if (p.length > 3 && parseFloat(p[3]) < 0.995) return null;
    const v = p.slice(0, 3).map(t => t.endsWith('%') ? parseFloat(t) * 2.55 : parseFloat(t));
    return v.some(n => Number.isNaN(n)) ? null : v.map(n => Math.max(0, Math.min(255, Math.round(n))));
  }
  m = /^hsla?\(([^)]*)\)$/.exec(c);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean);
    if (p.length < 3) return null;
    if (p.length > 3 && parseFloat(p[3]) < 0.995) return null;
    const h = ((parseFloat(p[0]) % 360) + 360) % 360 / 360;
    const sat = parseFloat(p[1]) / 100, li = parseFloat(p[2]) / 100;
    if ([h, sat, li].some(n => Number.isNaN(n))) return null;
    const q = li < 0.5 ? li * (1 + sat) : li + sat - li * sat, pp = 2 * li - q;
    const ch = t => {
      t = (t + 1) % 1;
      if (t < 1 / 6) return pp + (q - pp) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return pp + (q - pp) * (2 / 3 - t) * 6;
      return pp;
    };
    return [ch(h + 1 / 3), ch(h), ch(h - 1 / 3)].map(n => Math.round(n * 255));
  }
  return null;   // transparent, currentColor, gradients, named colours
}
/* WCAG relative luminance and contrast ratio, shared by 1s and 1aj. */
function lum(c) {
  const [r, g, b] = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) { const [hi, lo] = [lum(a), lum(b)].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); }
function checkContrast() {
  head('1s. Text contrast in both palettes');

  let bad = 0, pairs = 0, files = 0;
  const flag = m => { err(m); problems++; bad++; };

  /* cssRuleMap strips comments and keeps the @media context as its own key,
     so a leading block comment can no longer end up glued to the selector
     (which used to make CONTRAST_ALLOW unmatchable and print the comment in
     the error text), and a spaced @media (prefers-color-scheme: dark) reads
     the same as an unspaced one. */
  const maps = new Map();
  for (const [name, kind] of CONTRAST_SOURCES) {
    let src;
    try { src = readFileSync(join(ROOT, name), 'utf8'); }
    catch { warn(`${name} unreadable — contrast NOT checked there`); warnings++; continue; }
    const css = kind === 'html'
      ? [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join('\n')
      : src;
    if (!css.trim()) { flag(`${name}: no CSS found — 1s cannot check this file`); continue; }
    maps.set(name, cssRuleMap(css));
  }
  const paletteOf = name => {
    const rootByMedia = maps.get(name) && maps.get(name).get(':root');
    const baseRoot = rootByMedia && rootByMedia.get('');
    if (!baseRoot || !baseRoot.size) return { err: 'no :root palette found' };
    const light = Object.fromEntries(baseRoot);
    const darkKey = [...rootByMedia.keys()].find(isDarkMedia);
    /* Hard failure, not a skip. The palettes are spread dark = {...light},
       so "no dark block" could never trip the old guard — reformatting one
       @media line would have quietly turned 1s into a light-only check. */
    if (!darkKey) return { err: 'no dark :root block — without one 1s would silently check only the light palette' };
    return { light, dark: { ...light, ...Object.fromEntries(rootByMedia.get(darkKey)) } };
  };

  for (const [name, , paletteFrom] of CONTRAST_SOURCES) {
    const map = maps.get(name);
    if (!map) continue;
    const pals = paletteOf(paletteFrom || name);
    if (pals.err) { flag(`${paletteFrom || name}: ${pals.err}`); continue; }
    const { light, dark } = pals;
    files++;

    /* Declarations for one selector in one media context, with any
       prefers-color-scheme:dark override for the SAME selector folded in when
       we are judging dark mode. Media-aware both ways: a dark-only rule is
       judged against the dark palette (journey's .fab-track override was a
       false positive that way), and a dark override that fixes a base rule is
       no longer missed (that was a false negative). */
    const effOf = (key, media, mode) => {
      const bm = map.get(key);
      const base = bm && bm.get(media);
      if (!base) return null;
      if (mode !== 'dark' || isDarkMedia(media)) return base;
      const ovs = [...bm].filter(([k]) => isDarkMedia(k));
      if (!ovs.length) return base;
      const out = new Map(base);
      for (const [, d] of ovs) for (const [k, v] of d) out.set(k, v);
      return out;
    };
    const bgOf = d => d ? (d.has('background') ? d.get('background') : d.get('background-color')) : null;
    /* The surface a descendant sits on. ".pop .hear" sets a colour but no
       background — the card behind it is painted by ".pop". Scope alone would
       not have caught the two worst dark-mode bugs of 2026-09-05 (the Mood
       chart's phone column labels, and the "Hear it" link in all 24 Rhythm
       popovers): both colour a descendant of the element that paints the
       surface, so the old same-rule-only pairing never saw either. Walks the
       selector's own prefixes, nothing else. */
    const ancestorBg = (sel, media, mode) => {
      const parts = sel.split(/\s+(?:[>+~]\s+)?/).filter(Boolean);
      for (let i = parts.length - 1; i >= 1; i--) {
        const anc = parts.slice(0, i).join(' ');
        for (const m of [media, '']) {
          const bg = bgOf(effOf(anc, m, mode));
          if (bg != null) return bg;
        }
      }
      return null;
    };

    for (const [sel, byMedia] of map) {
      if (sel.startsWith(':root')) continue;
      const why = CONTRAST_ALLOW.get(sel);
      const need = why ? 3 : 4.5;
      for (const [media] of byMedia) {
        if (isPrintMedia(media)) continue;          // print swaps the palette wholesale
        const modes = isDarkMedia(media) ? ['dark'] : isLightMedia(media) ? ['light'] : ['light', 'dark'];
        for (const mode of modes) {
          const pal = mode === 'dark' ? dark : light;
          const eff = effOf(sel, media, mode);
          if (!eff) continue;
          const fgRaw = eff.get('color');
          const bgRaw = bgOf(eff) ?? ancestorBg(sel, media, mode);
          if (fgRaw == null || bgRaw == null) continue;
          const fgV = cssVar(fgRaw, pal);
          let bgV = null;
          for (const tok of cssTokens(bgRaw)) {
            const r = cssVar(tok, pal);
            if (cssRGB(r)) { bgV = r; break; }
          }
          const f0 = cssRGB(fgV), b = cssRGB(bgV);
          if (!f0 || !b) continue;
          /* Opacity on the text's own rule fades it toward the surface behind
             it. Only when that surface is an ancestor's: a rule that paints
             its own background fades both, over something this cannot see. */
          const op = bgOf(eff) == null ? parseFloat(eff.get('opacity')) : NaN;
          const a = op >= 0 && op < 1 ? op : 1;
          const f = f0.map((v, i) => a * v + (1 - a) * b[i]);
          pairs++;
          const r = ratio(f, b);
          if (r < need) {
            flag(`${name}: ${media ? media + ' { ' : ''}${sel} — ${r.toFixed(2)}:1 in ${mode} mode (${fgV}${a < 1 ? ` at opacity ${a}` : ''} on ${bgV}); needs ${need}${why ? ` (${why})` : ''}. If the text is genuinely large, or the colour is an icon rather than a glyph, add the selector to CONTRAST_ALLOW.`);
          }
        }
      }
    }
  }
  const st = contrastStates(flag);
  if (!bad) ok(`${pairs} colour pairs checked across both palettes in ${files} stylesheets, plus ${st} rendered states (cross-rule colour, background and opacity) — all ≥ 4.5:1`);
}
/* ── 1s, part 2: rendered states ─────────────────────────────────────────
   The pass above pairs a colour with a background only when the selector
   itself states both. It cannot see a colour in one rule and the surface in
   another when only the MARKUP puts them together, and until 2026-10-26 it
   ignored opacity. The 2026-10-26 audit found five that way, all green:
   `.step-branch` (colour) inside `.step-stuck` / `.step-levelup` (fill) at
   4.0:1 dark; a done practice-card check head on the green done fill (4.0
   dark, 4.4 light for Level up); four done-text rules at opacity .65 (~3:1);
   Note Runner's "unlock" label dimmed to 2.1:1 by its parent's opacity.

   So each state below is an element chain as the code emits it (outermost
   first, one compound per element, `::after` for a pseudo-element). Where a
   card has two views (the lesson's "One at a time" focus view, the default,
   and its list view; an in-class card's focus and list views) both are
   listed. A small cascade resolves each chain against the real stylesheet
   at the 1366×657 target: every matching rule, ordered by !important,
   specificity and source order; colour inherits, background does not, and
   the opacity of every element between the text and its surface multiplies
   in.

   What the matcher models: tag, class, id, `*`, ::before/::after, the
   descendant and child combinators, and :not() / :is() / :where() over
   simple compounds. What it leaves out ON PURPOSE, because the resting
   text a student reads is not in that state: rules with a STATE-ONLY
   pseudo-class (CONTRAST_STATE_ONLY: hover, active, focus, focus-visible,
   focus-within, visited, disabled, checked, target, fullscreen) and rules
   for any other pseudo-element (::placeholder, ::-webkit-…); a state-only
   member inside :not()/:is()/:where() is dropped and the rest still
   count. At-rules go through contrastMediaApplies (true / false / cannot
   tell). Everything else it cannot model — an attribute selector, :has(), a structural
   pseudo-class (:first-child, :nth-child, :empty…), a + or ~ combinator —
   is matched loosely (the unmodelled part treated as true) and, if it
   could then reach a judged element and sets color, opacity or
   background, the state FAILS with "cannot judge" rather than skipping.

   `overStop` names the surface when the text hangs outside the box that
   paints it: the last colour stop of that chain element's own resolved
   background (the unlock label sits below its gate line, on the lane's
   lower band), unless an element between the two paints first. `offBox`
   lists the chain elements the text hangs outside of (the gate line), so
   their own background is not behind it; their opacity still is. Every
   class must still appear in its emitter file, and a state that resolves
   no colour or no surface FAILS rather than skips — so the pinned count
   below is the number actually judged, in both palettes. A chain with no
   colour of its own takes body's, as the page does.

   KNOWN LIMITS, not modelled: filter:opacity()/brightness(),
   -webkit-text-fill-color, ::first-line, a translucent background in the
   chain (read as transparent), opacity on or above the element that paints
   the surface (both fade together over the page), and :focus-within
   (state-only here, though focus can rest inside a step after its Done
   button is pressed). */
const CONTRAST_STATES = [
  { name: 'Stuck? panel',             file: 'app.js',   chain: ['li.step', 'div.step-detail', 'div.step-body', 'div.step-folds', 'div.step-fold-panel', 'div.step-branch.step-stuck'] },
  { name: 'Level up panel',           file: 'app.js',   chain: ['li.step', 'div.step-detail', 'div.step-body', 'div.step-folds', 'div.step-fold-panel', 'div.step-branch.step-levelup'] },
  { name: 'practice check head',      file: 'app.js',   chain: ['ul.pc-checks', 'li.pc-check', 'button.pc-check-btn', 'span.pc-check-body', 'span.pc-check-head'] },
  { name: 'done check head',          file: 'app.js',   chain: ['ul.pc-checks', 'li.pc-check.is-done', 'button.pc-check-btn', 'span.pc-check-body', 'span.pc-check-head'] },
  { name: 'Level up check head',      file: 'app.js',   chain: ['ul.pc-checks', 'li.pc-check.pc-check--lvl', 'button.pc-check-btn', 'span.pc-check-body', 'span.pc-check-head'] },
  { name: 'done Level up check head', file: 'app.js',   chain: ['ul.pc-checks', 'li.pc-check.is-done.pc-check--lvl', 'button.pc-check-btn', 'span.pc-check-body', 'span.pc-check-head'] },
  { name: 'done step label (focus)',  file: 'app.js',   chain: ['div.dp.focus', 'div.stp-sec', 'ul.steps', 'li.step.step-done', 'button.step-head', 'span.step-label'] },
  { name: 'done step text (focus)',   file: 'app.js',   chain: ['div.dp.focus', 'div.stp-sec', 'ul.steps', 'li.step.step-done', 'div.step-detail', 'span.st-text'] },
  { name: 'done step label (list)',   file: 'app.js',   chain: ['div.dp', 'div.stp-sec', 'ul.steps', 'li.step.step-done', 'button.step-head', 'span.step-label'] },
  { name: 'done step text (list)',    file: 'app.js',   chain: ['div.dp', 'div.stp-sec', 'ul.steps', 'li.step.step-done', 'div.step-detail', 'span.st-text'] },
  { name: 'done in-class step label (focus)', file: 'app.js', chain: ['details.ca-card.ca-card--focus', 'div.ca-card-body', 'ol.ca-steps', 'li.ca-step.ca-step-done', 'div.ca-step-head.ca-step-head--focus', 'span.ca-step-label'] },
  { name: 'done in-class step label (list)',  file: 'app.js', chain: ['details.ca-card', 'div.ca-card-body', 'ol.ca-steps', 'li.ca-step.ca-step-done', 'button.ca-step-head', 'span.ca-step-label'] },
  { name: 'done review card text',    file: 'app.js',   chain: ['div.sr-card.sr-done', 'div.sr-card-main', 'div.sr-card-text'] },
  { name: 'Note Runner unlock label', file: 'coach.js', chain: ['div.nr-race', 'div.nr-race-lane', 'div.nr-race-gate', '::after'], overStop: 0, offBox: [2] },
];
const CONTRAST_STATES_PINNED = 14;
const CONTRAST_STATE_ONLY = new Set(['hover', 'active', 'focus', 'focus-visible', 'focus-within', 'visited', 'disabled', 'checked', 'target', 'fullscreen']);
/* Does at-rule context `m` apply at the 1366×657 target in this palette?
   true, false, or null = cannot tell. Known false: print alone, a width or
   height outside 1366×657 (min-/max- or range syntax), the other colour
   scheme, prefers-reduced-motion:reduce, hover:none, (any-)pointer:coarse,
   orientation:portrait. Known true: screen/all, the matching scheme,
   hover:hover, pointer:fine, landscape. A rule under anything else
   (@supports, @layer, @container, an unknown feature) is "cannot judge"
   when it could reach the text, like an unmodelled selector. @keyframes
   frames, @font-face and @page are not selectors: false. */
function contrastMediaApplies(m, mode) {
  if (!m) return true;
  const segs = m.split(/(?=@)/).map(x => x.trim()).filter(Boolean);
  let unknown = false;
  for (const seg of segs) {
    if (/^@(keyframes|font-face|page)\b/.test(seg)) return false;
    if (!/^@media\b/.test(seg)) { unknown = true; continue; }
    const v = contrastQueryList(seg.replace(/^@media/, '').trim(), mode);
    if (v === false) return false;
    if (v === null) unknown = true;
  }
  return unknown ? null : true;
}
function contrastQueryList(list, mode) {
  const vals = contrastSplitTop(list, ',').map(q => contrastQuery(q, mode));
  if (vals.includes(true)) return true;
  return vals.every(v => v === false) ? false : null;
}
function contrastQuery(q, mode) {
  let neg = false;
  q = q.trim().replace(/^only\s+/i, '');
  if (/^not\s/i.test(q)) { neg = true; q = q.replace(/^not\s+/i, ''); }
  const out = v => v === null ? null : (neg ? !v : v);
  const px = t => { const n = parseFloat(t); return /r?em$/.test(t) ? n * 16 : /px$/.test(t) || n === 0 ? n : NaN; };
  let res = true;
  for (const part of contrastSplitTop(q.replace(/\)\s*and\s*\(/gi, ') , ('), ',').flatMap(x => x.split(/\s+and\s+/i))) {
    const t = part.trim();
    if (!t) continue;
    let v = null;
    if (/^(screen|all)$/i.test(t)) v = true;
    else if (/^print$/i.test(t)) v = false;
    else {
      const f = /^\(\s*([\w-]+)\s*:\s*([^)]+?)\s*\)$/.exec(t);
      const r = /^\(([^:]+)\)$/.exec(t);
      if (f) {
        const [, feat, val] = f;
        const n = px(val);
        if (feat === 'prefers-color-scheme') v = val === mode;
        else if (feat === 'min-width' && !isNaN(n)) v = 1366 >= n;
        else if (feat === 'max-width' && !isNaN(n)) v = 1366 <= n;
        else if (feat === 'min-height' && !isNaN(n)) v = 657 >= n;
        else if (feat === 'max-height' && !isNaN(n)) v = 657 <= n;
        else if (feat === 'prefers-reduced-motion') v = val === 'no-preference';
        else if (feat === 'hover' || feat === 'any-hover') v = val === 'hover' ? true : val === 'none' ? (feat === 'hover' ? false : null) : null;
        else if (feat === 'pointer') v = val === 'fine' ? true : val === 'coarse' || val === 'none' ? false : null;
        else if (feat === 'any-pointer') v = val === 'fine' ? true : val === 'coarse' ? false : null;
        else if (feat === 'orientation') v = val === 'landscape';
      } else if (r) {
        // range syntax: (width <= 600px), (400px < width <= 900px)
        const toks = r[1].match(/[\d.]+(?:px|r?em)?|width|height|<=|>=|<|>|=/g) || [];
        const val = x => x === 'width' ? 1366 : x === 'height' ? 657 : px(x);
        if (toks.length >= 3 && toks.length % 2 === 1 && toks.some(x => x === 'width' || x === 'height')) {
          v = true;
          for (let k = 0; k + 2 < toks.length; k += 2) {
            const a = val(toks[k]), op = toks[k + 1], b = val(toks[k + 2]);
            if (isNaN(a) || isNaN(b) || !/^(<=|>=|<|>|=)$/.test(op)) { v = null; break; }
            const ok = op === '<=' ? a <= b : op === '>=' ? a >= b : op === '<' ? a < b : op === '>' ? a > b : a === b;
            if (!ok) { v = false; break; }
          }
        }
      }
    }
    if (v === false) return out(false);
    if (v === null) res = null;
  }
  return out(res);
}
/* Split on `sep` at paren/bracket depth 0. */
function contrastSplitTop(s, sep) {
  const out = []; let d = 0, buf = '';
  for (const ch of s) {
    if (ch === '(' || ch === '[') d++;
    else if (ch === ')' || ch === ']') d--;
    if (d === 0 && ch === sep) { out.push(buf.trim()); buf = ''; continue; }
    buf += ch;
  }
  out.push(buf.trim());
  return out.filter(Boolean);
}
/* One compound ("li.step.step-done", "*", ".x::after", ".a:not(.b)") ->
   { tag, cls, ids, pseudo, nots, iss, spec, unknown, stateOnly, otherPseudo },
   or null if it does not parse. `unknown` = something matched loosely. */
function contrastCompound(s) {
  const c = { tag: null, cls: [], ids: [], pseudo: null, nots: [], iss: [], spec: [0, 0, 0], unknown: false, stateOnly: false, otherPseudo: false };
  let i = 0;
  const name = () => { const m = /^-?[\w-]+/.exec(s.slice(i)); if (!m) return null; i += m[0].length; return m[0]; };
  const group = () => { let d = 0, j = i; for (; j < s.length; j++) { if (s[j] === '(' || s[j] === '[') d++; else if (s[j] === ')' || s[j] === ']') { d--; if (!d) break; } } const inner = s.slice(i + 1, j); i = j + 1; return inner; };
  const tm = /^([a-z][\w-]*|\*)/i.exec(s);
  if (tm) { if (tm[1] !== '*') { c.tag = tm[1].toLowerCase(); c.spec[2]++; } i = tm[1].length; }
  while (i < s.length) {
    const ch = s[i];
    if (ch === '.') { i++; const n = name(); if (!n) return null; c.cls.push(n); c.spec[1]++; }
    else if (ch === '#') { i++; const n = name(); if (!n) return null; c.ids.push(n); c.spec[0]++; }
    else if (ch === '[') { group(); c.unknown = true; c.spec[1]++; }
    else if (s.startsWith('::', i)) {
      i += 2; const n = name(); if (!n) return null;
      if (n === 'before' || n === 'after') c.pseudo = '::' + n; else c.otherPseudo = true;
      c.spec[2]++;
    } else if (ch === ':') {
      i++; const n = (name() || '').toLowerCase(); if (!n) return null;
      const arg = s[i] === '(' ? group() : null;
      if (n === 'before' || n === 'after') { c.pseudo = '::' + n; c.spec[2]++; continue; }
      if ((n === 'not' || n === 'is' || n === 'where') && arg != null) {
        const all = contrastSplitTop(arg, ',').map(x => /[\s>+~]/.test(x) ? null : contrastCompound(x));
        if (all.some(x => !x)) { c.unknown = true; c.spec[1]++; continue; }
        if (n !== 'where') { const best = all.map(x => x.spec).sort((a, b) => (b[0] - a[0]) || (b[1] - a[1]) || (b[2] - a[2]))[0]; c.spec = c.spec.map((v, k) => v + best[k]); }
        /* A state-only member is false at rest: drop it. What is left still
           negates (:not) or offers alternatives (:is/:where). :not() of only
           state members is the resting state (no constraint); :is() of only
           state members never matches at rest. */
        const list = all.filter(x => !x.stateOnly);
        if (!list.length) { if (n !== 'not') c.stateOnly = true; continue; }
        if (list.some(x => x.unknown || x.pseudo || x.otherPseudo)) { c.unknown = true; continue; }
        (n === 'not' ? c.nots : c.iss).push(list);
        continue;
      }
      if (CONTRAST_STATE_ONLY.has(n)) { c.stateOnly = true; c.spec[1]++; continue; }
      c.unknown = true; c.spec[1]++;
    } else return null;
  }
  return c;
}
/* A whole selector -> { parts: [compound + comb], spec, unknown, never }. */
function contrastSelector(sel) {
  const toks = []; let d = 0, buf = '';
  const push = () => { if (buf.trim()) toks.push(buf.trim()); buf = ''; };
  for (const ch of sel) {
    if (ch === '(' || ch === '[') d++;
    else if (ch === ')' || ch === ']') d--;
    if (d === 0 && /[\s>+~]/.test(ch)) { push(); if (ch !== ' ') toks.push(ch); continue; }
    buf += ch;
  }
  push();
  const parts = []; let comb = ' ';
  for (const t of toks) {
    if (t === '>' || t === '+' || t === '~') { comb = t; continue; }
    const c = contrastCompound(t);
    if (!c) return null;
    parts.push({ ...c, comb }); comb = ' ';
  }
  if (!parts.length) return null;
  const spec = parts.reduce((a, p) => a.map((v, k) => v + p.spec[k]), [0, 0, 0]);
  const unknown = parts.some(p => p.unknown || p.comb === '+' || p.comb === '~');
  const never = parts.some(p => p.stateOnly || p.otherPseudo) || parts.slice(0, -1).some(p => p.pseudo);
  return { parts, spec, unknown, never };
}
function contrastStates(flag) {
  let judged = 0;
  let css, emit = {};
  try { css = readFileSync(join(ROOT, 'styles.css'), 'utf8'); }
  catch { flag('1s states: styles.css unreadable'); return 0; }
  /* Ordered rule list: [{sel, media, decls, order}], one entry per selector
     of a selector list — the order the cascade needs, which cssRuleMap's
     merged map does not keep. */
  const rules = [];
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let i = 0, order = 0;
  const parse = (ctx) => {
    let buf = '';
    while (i < clean.length) {
      const c = clean[i++];
      if (c === '}') return;
      if (c !== '{') { buf += c; continue; }
      const sel = buf.trim().replace(/\s+/g, ' '); buf = '';
      if (sel.startsWith('@')) { parse(ctx ? ctx + ' ' + sel : sel); continue; }
      let body = '', depth = 1;
      while (i < clean.length && depth > 0) {
        const d = clean[i++];
        if (d === '{') depth++;
        else if (d === '}') { depth--; if (!depth) break; }
        body += d;
      }
      const decls = cssDecls(body);
      for (const s of contrastSplitTop(sel, ',')) rules.push({ sel: s, media: ctx, decls, order: order++, ...(contrastSelector(s) || { parts: null }) });
    }
  };
  parse('');
  /* A selector the parser cannot read at all would otherwise drop out
     unseen. @keyframes frames, @font-face and @page are not selectors. */
  for (const r of rules) {
    if (!r.parts && !/@(?:keyframes|font-face|page)\b/.test(r.media || '') && !(r.media || '').includes('print')) flag(`1s states: cannot parse the selector "${r.sel}" — the rendered-state resolver would skip it`);
  }
  /* `loose`: unmodelled parts count as matching, so a rule this cannot
     judge is found rather than missed. */
  const compMatches = (p, el, loose) => {
    if (p.tag && p.tag !== el.tag) return false;
    if (!p.cls.every(c => el.cls.includes(c)) || !p.ids.every(x => el.ids.includes(x))) return false;
    if (p.nots.some(list => list.some(x => compMatches(x, el, false)))) return false;
    if (!p.iss.every(list => list.some(x => compMatches(x, el, false)))) return false;
    return loose || !p.unknown;
  };
  /* Does part list `ps` ending at k match chain node n? A sibling (+ ~)
     stands where node n stands, so the part before it is skipped and the
     match carries on from n's ancestors (loose mode only). */
  const matchAt = (ps, k, chain, n, loose) => {
    const p = ps[k];
    if (!compMatches(p, chain[n], loose)) return false;
    if (k === 0) return true;
    let kk = k, comb = p.comb;
    while (comb === '+' || comb === '~') { kk--; if (kk === 0) return true; comb = ps[kk].comb; }
    if (comb === '>') return n > 0 && matchAt(ps, kk - 1, chain, n - 1, loose);
    for (let j = n - 1; j >= 0; j--) if (matchAt(ps, kk - 1, chain, j, loose)) return true;
    return false;
  };
  const ruleMatches = (r, chain, n, loose) => {
    const ps = r.parts, last = ps[ps.length - 1];
    if (chain[n].pseudo) {
      if (last.pseudo !== chain[n].pseudo) return false;
      return matchAt(ps.map((p, k) => k === ps.length - 1 ? { ...p, pseudo: null } : p), ps.length - 1, chain, n - 1, loose);
    }
    if (last.pseudo) return false;
    return matchAt(ps, ps.length - 1, chain, n, loose);
  };
  const isImp = v => /!\s*important\s*$/i.test(v);
  const cmp = (a, b) => (a.imp - b.imp) || (a.spec[0] - b.spec[0]) || (a.spec[1] - b.spec[1]) || (a.spec[2] - b.spec[2]) || (a.order - b.order);
  let cannot = null;
  const winner = (chain, n, props, mode) => {
    let best = null;
    for (const r of rules) {
      if (!r.parts || r.never) continue;
      const applies = contrastMediaApplies(r.media, mode);
      if (applies === false) continue;
      if (r.unknown || applies === null) {
        if (props.some(pr => r.decls.has(pr)) && ruleMatches(r, chain, n, true)) cannot.add(applies === null ? `${r.media} { ${r.sel}` : r.sel);
        continue;
      }
      if (!ruleMatches(r, chain, n, false)) continue;
      for (const pr of props) {
        if (!r.decls.has(pr)) continue;
        const v = r.decls.get(pr);
        const cand = { v, imp: isImp(v) ? 1 : 0, spec: r.spec, order: r.order };
        if (!best || cmp(cand, best) >= 0) best = cand;
      }
    }
    return best ? best.v : null;
  };
  const rootByMedia = cssRuleMap(css).get(':root');
  if (!rootByMedia || !rootByMedia.get('')) { flag('1s states: styles.css has no :root palette'); return 0; }
  const light = Object.fromEntries(rootByMedia.get(''));
  const darkKey = [...rootByMedia.keys()].find(isDarkMedia);
  const pals = { light, dark: { ...light, ...Object.fromEntries(rootByMedia.get(darkKey) || []) } };
  /* The opaque colour a background value paints: a plain colour, or for a
     gradient its LAST colour stop when `lastStop` (else its first). */
  const paintOf = (raw, pal, lastStop) => {
    if (raw == null) return null;
    const g = /-gradient\(([\s\S]*)\)\s*$/.exec(String(raw).trim());
    const toks = g ? contrastSplitTop(g[1], ',').map(a => cssTokens(a)[0]) : cssTokens(raw);
    const cols = toks.map(t => cssVar(t, pal)).filter(v => cssRGB(v));
    return cols.length ? (lastStop ? cols[cols.length - 1] : cols[0]) : null;
  };

  if (CONTRAST_STATES.length !== CONTRAST_STATES_PINNED) {
    flag(`1s states: ${CONTRAST_STATES.length} rendered states listed, ${CONTRAST_STATES_PINNED} pinned — change the pin on purpose, in the same edit`);
  }
  for (const st of CONTRAST_STATES) {
    if (!(st.file in emit)) { try { emit[st.file] = readFileSync(join(ROOT, st.file), 'utf8'); } catch { emit[st.file] = ''; } }
    const chain = st.chain.map(s => /^::(before|after)$/.test(s) ? { tag: null, cls: [], ids: [], pseudo: s } : contrastCompound(s));
    const gone = chain.flatMap(e => e.cls).filter(c => !new RegExp(`(?<![\\w-])${c}(?![\\w-])`).test(emit[st.file]));
    if (gone.length) { flag(`1s states: "${st.name}" — ${gone.join(', ')} no longer emitted in ${st.file}; update the chain to the real markup`); continue; }
    for (const mode of ['light', 'dark']) {
      const pal = pals[mode];
      const t = chain.length - 1;
      cannot = new Set();
      let fgRaw = null;
      for (let n = t; n >= 0 && fgRaw == null; n--) {
        fgRaw = winner(chain, n, ['color'], mode);
        // inherit / currentColor on `color` mean the parent's colour
        if (fgRaw != null && /^(inherit|unset|currentcolor)$/i.test(String(fgRaw).replace(/\s*!\s*important\s*$/i, '').trim())) fgRaw = null;
      }
      // nothing in the chain sets it: the page's own colour, from body
      if (fgRaw == null) fgRaw = winner([{ tag: 'body', cls: [], ids: [], pseudo: null }], 0, ['color'], mode);
      const opAt = n => { const v = parseFloat(winner(chain, n, ['opacity'], mode)); return v >= 0 && v < 1 ? v : 1; };
      let bgV = null, alpha = 1, gradAt = null;
      if (st.overStop != null) {
        /* Anything painted between the text and overStop sits in front of
           that stop, except the boxes the text hangs outside (offBox). */
        for (let n = t; n > st.overStop && bgV == null && !gradAt; n--) {
          if (!(st.offBox || []).includes(n)) {
            const raw = winner(chain, n, ['background', 'background-color', 'background-image'], mode);
            if (raw != null && /-gradient\(/.test(raw)) { gradAt = st.chain[n]; break; }
            bgV = paintOf(raw, pal, false);
          }
          if (bgV == null) alpha *= opAt(n);
        }
        if (bgV == null && !gradAt) bgV = paintOf(winner(chain, st.overStop, ['background', 'background-color', 'background-image'], mode), pal, true);
      } else {
        for (let n = t; n >= 0 && bgV == null; n--) {
          const raw = winner(chain, n, ['background', 'background-color', 'background-image'], mode);
          // which stop of a gradient sits behind the text is a layout question;
          // say so through overStop rather than guess
          if (raw != null && /-gradient\(/.test(raw)) { gradAt = st.chain[n]; break; }
          bgV = paintOf(raw, pal, false);
          if (bgV == null) alpha *= opAt(n);
        }
      }
      if (cannot.size) { flag(`1s states: "${st.name}" (${mode}) — cannot judge ${[...cannot].join(' | ')}: it may set colour, opacity or a background on this text but uses a selector or at-rule the resolver does not model; model it or write it without that part`); continue; }
      const fgV = cssVar(fgRaw, pal), f0 = cssRGB(fgV), b = cssRGB(bgV);
      if (!f0 || !b) { flag(`1s states: "${st.name}" (${mode}) resolved no ${!f0 ? 'text colour' : gradAt ? `single surface (${gradAt} paints a gradient)` : 'opaque surface'} — fix the chain or give it an overStop`); continue; }
      const f = f0.map((v, k) => alpha * v + (1 - alpha) * b[k]);
      judged++;
      const r = ratio(f, b);
      if (r < 4.5) flag(`styles.css: "${st.name}" (${st.chain.join(' ')}) — ${r.toFixed(2)}:1 in ${mode} mode (${fgV}${alpha < 1 ? ` at opacity ${+alpha.toFixed(3)}` : ''} on ${bgV}); needs 4.5`);
    }
  }
  if (judged !== CONTRAST_STATES_PINNED * 2) flag(`1s states: ${judged} state/palette pairs judged, expected ${CONTRAST_STATES_PINNED * 2}`);
  return judged / 2;
}

/* ════════════════════════════════════════════════════════════════════
   1t. JOURNEY THEME ↔ APP THEME — the six Song Journey pages don't load
   styles.css, so tabs/journey-theme.css hand-copies the rules for the
   tab card and the live-quiz banner. CLAUDE.md's rule is "restyle both
   or neither", and until now nothing could check it: by 2026-09-05 the
   copies had drifted in four places (a margin, a missing display, a
   missing font-family, and the documented --tab-head-bg).

   Compares only selectors DEFINED IN BOTH files. One-sided selectors are
   deliberate and plentiful — the app renders a real `.tab-grid` of note
   buttons, Journey ships `.tab-ascii` text — so requiring both files to
   carry the same selector list would be wrong.
   ════════════════════════════════════════════════════════════════════ */
const JOURNEY_SHARED_PREFIXES = [/^\.tab(\b|[.:\s>])/, /^\.lq-banner/, /^\.lq-invite/];
/* The differences that are meant to be there — per PROPERTY, not per rule.
   Exempting a whole rule (which this did until 2026-09-08) meant every other
   declaration in it could drift unseen: journey's .tab-head padding could
   walk away from the app's and 1t stayed green. Both entries below are
   documented at the rule itself in journey-theme.css. */
const JOURNEY_ALLOWED_DIFFS = new Map([
  // these cards stack down a Journey page and need the air; in the app the
  // step body around them supplies it (the shorthand, not margin-bottom)
  ['.tab', new Set(['margin'])],
  // journey's --brand doubles as the link colour and lightens in dark mode,
  // so the header strip tracks styles.css's --brand through its own token
  ['.tab-head', new Set(['background'])],
]);
/* Split a declaration block into a property -> value map.
   Later declarations win per property, so a selector written twice (the
   tap-target add-on group at styles.css:2126 plus the full rule further
   down) merges the way the browser sees it rather than the second body
   simply replacing the first. Splitting is paren-aware: max(100%,44px) and
   translate(-50%,-50%) carry commas, and url(a;b) could carry a semicolon. */
function cssDecls(body) {
  const out = new Map();
  let depth = 0, buf = '', parts = [];
  for (const ch of body) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ';' && depth === 0) { parts.push(buf); buf = ''; continue; }
    buf += ch;
  }
  parts.push(buf);
  for (const raw of parts) {
    const d = raw.trim();
    if (!d) continue;
    let i = -1, dep = 0;
    for (let k = 0; k < d.length; k++) {
      const c = d[k];
      if (c === '(') dep++;
      else if (c === ')') dep--;
      else if (c === ':' && dep === 0) { i = k; break; }
    }
    if (i < 0) continue;
    out.set(d.slice(0, i).trim(), d.slice(i + 1).replace(/\s+/g, ' ').trim());
  }
  return out;
}
/* selector -> (media context -> declaration map). Keeping the @media context
   as its own key, rather than gluing it onto the selector and stripping it
   back off with a regex, is what lets 1t see a rule that exists inside a
   media query on one side only (the .tab-body phone padding was journey-only
   for four days) — and it can't be fooled by a compound query or by a
   selector that contains its own parentheses, e.g. :not(.has-finger). */
function cssRuleMap(css) {
  const out = new Map();
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let i = 0;
  const parse = (ctx) => {
    let buf = '';
    while (i < clean.length) {
      const c = clean[i++];
      if (c === '}') return;
      if (c !== '{') { buf += c; continue; }
      const sel = buf.trim().replace(/\s+/g, ' '); buf = '';
      if (sel.startsWith('@')) { parse(ctx ? ctx + ' ' + sel : sel); continue; }
      let body = '', depth = 1;
      while (i < clean.length && depth > 0) {
        const d = clean[i++];
        if (d === '{') depth++;
        else if (d === '}') { depth--; if (!depth) break; }
        body += d;
      }
      for (const s of sel.split(',').map(x => x.trim()).filter(Boolean)) {
        if (!out.has(s)) out.set(s, new Map());
        const byMedia = out.get(s);
        if (!byMedia.has(ctx)) byMedia.set(ctx, new Map());
        const decls = byMedia.get(ctx);
        for (const [k, v] of cssDecls(body)) decls.set(k, v);
      }
    }
  };
  parse('');
  return out;
}
function checkJourneyThemeDrift() {
  head('1t. Journey theme matches the app theme');
  let appCss, jCss;
  try {
    appCss = readFileSync(join(ROOT, 'styles.css'), 'utf8');
    jCss = readFileSync(join(ROOT, 'tabs/journey-theme.css'), 'utf8');
  } catch { warn('stylesheets unreadable — drift NOT checked'); warnings++; return; }
  const app = cssRuleMap(appCss), jour = cssRuleMap(jCss);
  const label = m => m ? `${m} { ` : '';
  let shared = 0, bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  for (const [sel, appByMedia] of app) {
    if (!JOURNEY_SHARED_PREFIXES.some(re => re.test(sel))) continue;
    const jourByMedia = jour.get(sel);
    if (!jourByMedia) continue;        // selector one-sided by design
    const allow = JOURNEY_ALLOWED_DIFFS.get(sel) || new Set();
    for (const media of new Set([...appByMedia.keys(), ...jourByMedia.keys()])) {
      const a = appByMedia.get(media), j = jourByMedia.get(media);
      if (!a || !j) {
        flag(`"${label(media)}${sel}" exists only in ${a ? 'styles.css' : 'tabs/journey-theme.css'} — a one-sided rule is drift too (CLAUDE.md: restyle both or neither).`);
        continue;
      }
      shared++;
      for (const prop of new Set([...a.keys(), ...j.keys()])) {
        if (allow.has(prop)) continue;
        if (a.get(prop) === j.get(prop)) continue;
        flag(`"${label(media)}${sel}" — "${prop}" has drifted between styles.css and tabs/journey-theme.css — restyle both or neither (CLAUDE.md).\n      styles.css : ${a.has(prop) ? a.get(prop) : '(absent)'}\n      journey    : ${j.has(prop) ? j.get(prop) : '(absent)'}`);
      }
    }
  }
  const exempt = [...JOURNEY_ALLOWED_DIFFS].reduce((n, [, ps]) => n + ps.size, 0);
  if (!bad) ok(`${shared} shared tab/live-quiz rules identical across both stylesheets (${exempt} documented per-property exceptions)`);
}

/* ════════════════════════════════════════════════════════════════════
   1t2. FLOATING TOOLS THEME ↔ APP THEME — tabs/fab-tools.css says right in
   its own header comment that it's "ported verbatim from the main app's
   styles.css", but nothing checked that claim: found drifted 2026-09-26
   (.tp-title's icon layout, .tp-ctrl's stacked-row spacing), the same
   one-sided-copy bug class 1t already guards for journey-theme.css, one
   level over. Same per-property comparison, same shared cssRuleMap/cssDecls.

   .fab-group/.fab-buttons are exempted by property, not by rule: the app
   docks the tools in the rail (a row, no fixed position needed) and the
   Journey pages float them over the page corner (a column, pinned), so
   position/inset/z-index/flex-direction/align-items/gap are meant to
   differ there. Every OTHER shared selector (.fab, .tool-popup, .tuner-*,
   .ts-btn, .tp-*, .bpm-*, .ladder-*, #ladder-*) is compared with no
   exemptions. `.ladder-*`/`#ladder-*` added 2026-09-27 after the Tempo
   ladder markup shipped to the six Journey pages (1t3) with no matching
   CSS at all in tabs/fab-tools.css — 1t2 couldn't see the gap because
   nothing told it this family was shared.
   ════════════════════════════════════════════════════════════════════ */
const FAB_SHARED_PREFIXES = [/^\.fab\b/, /^\.tool-popup/, /^\.tuner-/, /^\.ts-btn/, /^\.tp-/, /^\.bpm-/, /^\.ladder-/, /^#ladder-/];
const FAB_ALLOWED_DIFFS = new Map([
  ['.fab-group', new Set(['position', 'top', 'bottom', 'left', 'right', 'align-items', 'gap', 'z-index'])],
  ['.fab-buttons', new Set(['flex-direction', 'align-items', 'gap'])],
]);
function checkFabToolsThemeDrift() {
  head('1t2. Floating tools (fab-tools.css) match the app theme');
  let appCss, fCss;
  try {
    appCss = readFileSync(join(ROOT, 'styles.css'), 'utf8');
    fCss = readFileSync(join(ROOT, 'tabs/fab-tools.css'), 'utf8');
  } catch { warn('stylesheets unreadable — drift NOT checked'); warnings++; return; }
  const app = cssRuleMap(appCss), fab = cssRuleMap(fCss);
  const label = m => m ? `${m} { ` : '';
  let shared = 0, bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  for (const [sel, appByMedia] of app) {
    if (!FAB_SHARED_PREFIXES.some(re => re.test(sel))) continue;
    const fabByMedia = fab.get(sel);
    if (!fabByMedia) continue;         // selector one-sided by design
    const allow = FAB_ALLOWED_DIFFS.get(sel) || new Set();
    for (const media of new Set([...appByMedia.keys(), ...fabByMedia.keys()])) {
      const a = appByMedia.get(media), f = fabByMedia.get(media);
      if (!a || !f) {
        flag(`"${label(media)}${sel}" exists only in ${a ? 'styles.css' : 'tabs/fab-tools.css'} — a one-sided rule is drift too (CLAUDE.md: restyle both or neither).`);
        continue;
      }
      shared++;
      for (const prop of new Set([...a.keys(), ...f.keys()])) {
        if (allow.has(prop)) continue;
        if (a.get(prop) === f.get(prop)) continue;
        flag(`"${label(media)}${sel}" — "${prop}" has drifted between styles.css and tabs/fab-tools.css — restyle both or neither (CLAUDE.md).\n      styles.css   : ${a.has(prop) ? a.get(prop) : '(absent)'}\n      fab-tools.css: ${f.has(prop) ? f.get(prop) : '(absent)'}`);
      }
    }
  }
  const exempt = [...FAB_ALLOWED_DIFFS].reduce((n, [, ps]) => n + ps.size, 0);
  if (!bad) ok(`${shared} shared floating-tools rules identical across both stylesheets (${exempt} documented per-property exceptions)`);
}

/* ════════════════════════════════════════════════════════════════════
   1t3. JOURNEY POPUP MARKUP ↔ APP MARKUP — 1t/1t2 cover the CSS these
   floating tools share with the main app; nothing covered the HTML
   itself. Found 2026-09-27: the six Journey pages' tool popups still
   used emoji (🎵⏱🎸) for the metronome/timer/tuner titles where
   index.html switched to inline SVG, and were missing the July "Tempo
   ladder" feature entirely (the toggle button + its ladder-box), even
   though the JS that drives it (toggleLadder/ladderClean/ladderMiss) has
   lived in fab-tools.js — already loaded on every Journey page — the
   whole time. This was a pure markup gap, not a missing feature: fixing
   it needed no JS changes at all.
   ════════════════════════════════════════════════════════════════════ */
/* Matches both the HTML-entity form these files actually use and the raw
   glyph, so a future hand-edit that pastes the literal character instead
   of the entity still trips this — found as a gap in the first cut,
   2026-09-27 review. */
const POPUP_EMOJI_RE = /<span class="tp-title">\s*(?:&#x1F3B5;|&#x23F1;|&#x1F3B8;|\u{1F3B5}|\u{23F1}️?|\u{1F3B8})/u;
function checkJourneyPopupMarkup() {
  head('1t3. Journey popup markup (tool-popup HTML) matches the app');
  let bad = 0, pages = 0;
  const flag = m => { err(m); problems++; bad++; };
  for (const file of TAB_PAGES.filter(f => f.endsWith('.html'))) {
    let raw;
    try { raw = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
    pages++;
    if (POPUP_EMOJI_RE.test(raw))
      flag(`${file}: a tool-popup title still uses an emoji icon — the app uses inline SVG for tools.metronome/timerTitle/tuner (CLAUDE.md: restyle both or neither applies to markup here too).`);
    const metroPopup = raw.match(/<div class="tool-popup" id="metro-popup"[\s\S]*?<div class="tool-popup" id="timer-popup"/);
    if (!metroPopup) { flag(`${file}: no metro-popup found — can't check for the Tempo ladder.`); continue; }
    if (!/class="ladder-toggle"/.test(metroPopup[0]) || !/class="ladder-box"/.test(metroPopup[0]))
      flag(`${file}: metro-popup is missing the Tempo ladder toggle/box that index.html's metronome popup has.`);
  }
  if (!bad) ok(`${pages} Journey pages — no emoji tool-popup icons, all carry the Tempo ladder`);
}

/* Per-page tab-card counts, pinned. See the note where they're compared. */
const JOURNEY_TAB_COUNTS = {
  'all-along-the-watchtower.html': 10,
  'let-it-be.html': 12,
  'luna.html': 13,
  'seven-nation-army.html': 11,
  'sweet-child-o-mine.html': 13,
  'the-cure.html': 13,
};
/* ════════════════════════════════════════════════════════════════════
   1v. FIGURES RESERVE THEIR SPACE — an <img> with no width/height has no
   intrinsic size until it loads, so the card it sits in grows the moment
   it arrives and everything below jumps. The 2026-09-05 CLS pass gave all
   47 module-data figures a width/height pair and stopped there; the ten
   img/ca-*.svg class-activity figures are emitted by the RENDERERS, not
   written in the data, so they kept jumping in both the student card and
   the teacher console preview.

   Three things, because a size is only right if it matches the art:
   1. every <img> written into module data or class-activities.js carries
      width AND height;
   2. every img/ca-*.svg really is the 640x244 board the renderers assume;
   3. BOTH renderers emit that pair — caStepHtml() in app.js and
      renderTeacherActivityDetail() in teacher.js are separate code paths
      (CLAUDE.md's two-renderer rule), and a fix to one is invisible in
      the other.
   ════════════════════════════════════════════════════════════════════ */
const CA_FIGURE_BOX = [640, 244];
function checkFigureDimensions() {
  head('1v. Figures carry their intrinsic size');
  let bad = 0, imgs = 0;
  const flag = m => { err(m); problems++; bad++; };

  for (const f of [...MODULE_FILES, 'class-activities.js']) {
    let src;
    try { src = maskComments(readFileSync(join(ROOT, f), 'utf8')); } catch { continue; }
    for (const m of src.matchAll(/<img\b[^>]*>/g)) {
      imgs++;
      const miss = [['width', /\bwidth\s*=/], ['height', /\bheight\s*=/]].filter(([, re]) => !re.test(m[0])).map(([a]) => a);
      if (miss.length)
        flag(`${f}: <img> with no ${miss.join('/')} — "${m[0].slice(0, 70)}…". Without both, the card resizes when the figure loads and everything under it jumps.`);
    }
  }

  const [W, H] = CA_FIGURE_BOX;
  let cas = 0;
  try {
    for (const f of readdirSync(join(ROOT, 'img')).filter(x => /^ca-.*\.svg$/.test(x)).sort()) {
      cas++;
      const vb = (readFileSync(join(ROOT, 'img', f), 'utf8').match(/viewBox\s*=\s*"([^"]+)"/) || [])[1] || '';
      const n = vb.trim().split(/[\s,]+/).map(Number);
      if (n.length !== 4 || n[2] !== W || n[3] !== H)
        flag(`img/${f}: viewBox "${vb}" is not the ${W}x${H} board both class-activity renderers hardcode — either redraw it to the board or teach the renderers (and CA_FIGURE_BOX here) about a per-figure size.`);
    }
  } catch { flag('img/ is unreadable — class-activity figure sizes NOT checked'); }

  /* The two renderers, by name, so this can say which one drifted. */
  for (const [f, fn] of [['app.js', 'caStepHtml'], ['teacher.js', 'renderTeacherActivityDetail']]) {
    let src;
    try { src = readFileSync(join(ROOT, f), 'utf8'); } catch { flag(`${f} unreadable`); continue; }
    // the <img> each renderer builds around escAttr(step.figure) / escAttr(s.figure)
    const emit = src.match(/<img src="\$\{escAttr\((?:step|s)\.figure\)\}"[^>]*>/);
    if (!emit) { flag(`${f}: no step-figure <img> found — ${fn}() is where class-activity figures are rendered; if it moved, update 1v`); continue; }
    if (!new RegExp(`width="${W}"`).test(emit[0]) || !new RegExp(`height="${H}"`).test(emit[0]))
      flag(`${f}: ${fn}() emits a class-activity figure without width="${W}" height="${H}" — the other renderer has it, and CLAUDE.md's two-renderer rule says patch both in the same edit.`);
  }

  if (bad === 0) ok(`${imgs} figures in module data carry width+height; ${cas} class-activity figures match the ${W}x${H} board in both renderers`);
}

/* ── 1x. Orphaned assets and content pools ──────────────────────────────
   The mirror image of checkPrecacheCoverage: that one proves every path the
   site *references* exists on disk, this one proves every file on disk is
   still referenced by something. Both directions rot — a figure gets redrawn
   under a new name, a deck gets retired from the step that used it — and the
   leftovers are invisible until someone goes looking. A by-hand sweep on
   2026-09-09 found none, so this starts clean and stays that way.

   Reference sources are SHELL_FILES, deliberately NOT sw.js: the ASSETS
   precache list mirrors the references, so counting it would let a dead file
   keep itself alive and the check could never fail. Totals aren't pinned —
   adding a figure or a deck is ordinary content work, and a file going
   *missing* is already caught by checkPrecacheCoverage. */
function checkOrphanAssets() {
  head('1x. Orphaned assets and content pools');
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };

  /* Two reference shapes, both matched whole so a name can never be kept alive
     by a longer one containing it (img/ca-hb-a.svg vs img/ca-hb-a-full.svg):

       - a prefixed path, how most step data stores it (figure: 'img/…')
       - a bare filename in its own string literal, how a helper that prepends
         the directory takes it — module-13.js's m13Photo('m13-step-1-….png')
         builds `img/${file}`, so the path never appears in the source at all.

     The bare form is matched only as a complete quoted literal ending in an
     asset extension, so it stays exact rather than a substring search. */
  const refs = new Set(), bare = new Set();
  for (const f of SHELL_FILES) {
    let src;
    try { src = readFileSync(join(ROOT, f), 'utf8'); } catch { continue; }
    for (const m of src.matchAll(/\b(?:img|audio)\/[A-Za-z0-9._%-]+\.[A-Za-z0-9]+/g)) refs.add(m[0]);
    for (const m of src.matchAll(/['"`]([A-Za-z0-9._%-]+\.(?:svg|png|jpe?g|gif|webp|avif|mp3|m4a|wav|ogg))['"`]/g)) bare.add(m[1]);
  }

  let assets = 0;
  for (const [dir, skip] of [['img', /\.md$/], ['audio', null]]) {
    let files;
    try { files = readdirSync(join(ROOT, dir)).filter(f => !(skip && skip.test(f))).sort(); }
    catch { flag(`${dir}/ is unreadable — orphaned assets NOT checked`); continue; }
    for (const f of files) {
      assets++;
      if (!refs.has(`${dir}/${f}`) && !bare.has(f))
        flag(`${dir}/${f} is not referenced by any shipped file — delete it, or wire it up. Either way it is still in the repo every student clones.`);
    }
  }

  /* DECKS / EAR_POOLS are defined in app.js and addressed from step data by id
     (drill: { type:'deck', deck:'numerals-C' } / pool:'…'), so only the step
     data is scanned — app.js's own definition would otherwise count as a use. */
  let pools = 0;
  let steps = '';
  for (const f of [...MODULE_FILES, 'class-activities.js']) {
    try { steps += maskComments(readFileSync(join(ROOT, f), 'utf8')); } catch { /* covered by 0/1 */ }
  }
  for (const [name, field] of [['DECKS', 'deck'], ['EAR_POOLS', 'pool']]) {
    let obj;
    try { obj = loadConstObject(readFileSync(join(ROOT, 'app.js'), 'utf8'), name); }
    catch (e) { warn(`could not enumerate ${name} from app.js: ${e.message}`); warnings++; continue; }
    for (const id of Object.keys(obj)) {
      pools++;
      const lit = id.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
      if (!new RegExp(`${field}\\s*:\\s*['"\`]${lit}['"\`]`).test(steps))
        flag(`app.js ${name}['${id}'] is defined but no step uses ${field}:'${id}' — a retired pool still carries its i18n keys and reads as live content.`);
    }
  }

  if (bad === 0) ok(`${assets} files in img/ and audio/ are all referenced; ${pools} DECKS/EAR_POOLS ids are all in use`);
}

function checkJourneyTabCards() {
  head('1q. Journey-page tab cards');
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };

  let files = [];
  try { files = readdirSync(join(ROOT, 'tabs')).filter(f => f.endsWith('.html')).sort(); }
  catch { ok('no tabs/ directory'); return; }

  let cards = 0;
  for (const f of files) {
    const src = readFileSync(join(ROOT, 'tabs', f), 'utf8');
    for (const _ of src.matchAll(/<pre class="tab"/g))
      flag(`tabs/${f}: a bare <pre class="tab"> — Journey tabs use the app's card markup (see the 2026-09-04 conversion), not a raw dark panel`);
    /* [^>]* — the opening tag was matched exactly, so a card that grew any
       extra attribute (an id, a data-*) became invisible to every check
       below AND to the total, which would just quietly read 62. */
    let pageCards = 0;
    for (const m of src.matchAll(/<div class="tab"[^>]*>([\s\S]*?)<\/pre><\/div>/g)) {
      cards++; pageCards++;
      for (const part of ['tab-head', 'tab-title', 'tab-body', 'tab-ascii']) {
        if (!m[1].includes(`class="${part}"`) && !m[1].includes(` ${part}"`))
          flag(`tabs/${f}: a tab card is missing its .${part} — the card needs head + title + body + board to match the app`);
      }
      if (!/<span class="tab-title" data-es="/.test(m[1]))
        flag(`tabs/${f}: a tab card's title has no data-es — its heading would stay in English in Spanish mode`);
    }
    /* Pinned counts. Without them a card could vanish — deleted, or just
       stopped matching — and 1q would still say "all good", only with a
       smaller number nobody reads. Editing a page's tabs means editing this
       number in the same commit, on purpose. */
    const want = JOURNEY_TAB_COUNTS[f];
    if (want === undefined)
      flag(`tabs/${f}: no pinned tab-card count — add one to JOURNEY_TAB_COUNTS so a card can't disappear silently`);
    else if (want !== pageCards)
      flag(`tabs/${f}: ${pageCards} tab cards, expected ${want} — if that change is deliberate, update JOURNEY_TAB_COUNTS in checks.mjs in the same commit`);
  }

  // The CSS the cards depend on has to exist, or every one of them renders bare.
  let css = '';
  try { css = readFileSync(join(ROOT, 'tabs', 'journey-theme.css'), 'utf8'); } catch {}
  for (const sel of ['.tab{', '.tab-head{', '.tab-body{', '.tab-ascii{'])
    if (!css.includes(sel)) flag(`tabs/journey-theme.css: no ${sel.slice(0, -1)} rule — the Journey tab cards render unstyled without it`);

  if (bad === 0) ok(`Journey tab cards match the app's markup (${cards} cards across ${files.length} pages)`);
}

/* ════════════════════════════════════════════════════════════════════
   1z. JOURNEY TAB-ASCII COLUMN ALIGNMENT — a Journey page's <pre
   class="tab-ascii"> block is hand-typed text (these pages have no
   app.js to compute it, unlike an in-module tab's structured
   fret/string data — see the note on checkJourneyTabCards above), so
   nothing stops one string's dash padding from drifting out of step
   with the rest when a fret number's digit count changes (7 → 10). On
   2026-09-10 "the cure"'s Layer 3 power-chord tab shipped with its
   A-string row 1-2 characters short per cell, so its fret numbers sat
   left of the low-E row they're meant to stack on — two notes played
   together read as two different beats.

   Every string row in a block must have the same length between each
   pair of "|"s as every other string row, column for column — that's
   the only way two simultaneous notes land in the same character
   column. <span class="hl"> wrappers are stripped first since they add
   no visible width.
   ════════════════════════════════════════════════════════════════════ */
function checkTabAsciiAlignment() {
  head('1z. Journey tab-ascii column alignment');
  let bad = 0, blocks = 0;
  const flag = m => { err(m); problems++; bad++; };

  for (const file of TAB_PAGES.filter(f => f.endsWith('.html'))) {
    let src;
    try { src = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
    for (const m of src.matchAll(/<pre class="tab-ascii">([\s\S]*?)<\/pre>/g)) {
      blocks++;
      const startLine = src.slice(0, m.index).split('\n').length; // 1-based line of the <pre> tag; block line 0 shares it
      const blockLines = m[1].replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '').split('\n');
      const rows = [];
      blockLines.forEach((line, li) => {
        if (!/^[a-zA-Z] \|/.test(line)) return; // a string row: one letter, space, pipe
        const parts = line.split('|');
        rows.push({ letter: line[0], line: startLine + li, segs: parts.slice(1, -1).map(s => s.length) });
      });
      if (rows.length < 2) continue;
      const ncols = Math.max(...rows.map(r => r.segs.length));
      for (let c = 0; c < ncols; c++) {
        const lens = rows.map(r => r.segs[c]).filter(x => x !== undefined);
        if (new Set(lens).size > 1) {
          const detail = rows.map(r => `${r.letter}=${r.segs[c] ?? '—'}`).join(', ');
          flag(`${file}:${rows[0].line}: tab-ascii cell ${c + 1} isn't the same width on every string (${detail}) — fret numbers will drift instead of stacking on the same beat`);
        }
      }
    }
  }
  if (bad === 0) ok(`${blocks} Journey tab-ascii blocks — every string row lines up column-for-column`);
}

/* ════════════════════════════════════════════════════════════════════
   1ab. JOURNEY_LAYERS ↔ tabs/*.html — the "Take It to a Song" link card
   (Today-first work order, Phase 3b) opens tabs/<slug>.html#layer-<n> off
   app.js's JOURNEY_LAYERS map. Rebuilds the real map from every Journey
   page's own .layer-num/.layer-unit spans and fails on any drift — a
   relabeled or reordered layer silently pointing a module's link card at
   the wrong (or a bonus) layer would otherwise only surface as a wrong
   card in the room. Pins the song count: six pages, no more, no fewer,
   without a deliberate update here.
   ════════════════════════════════════════════════════════════════════ */
const JOURNEY_LAYERS_SONG_COUNT = 6;
/* ════════════════════════════════════════════════════════════════════
   1al. ENGLISH WORDS INSIDE A JOURNEY TAB-ASCII BLOCK — journey.js
   translates a page by swapping innerHTML on every [data-es], so a word
   sitting as a bare text node inside <pre class="tab-ascii"> has no twin
   to swap and stays English for a Spanish reader. tabs/the-cure.html
   already shows the fix: wrap the token in its own
   <span data-es="…">…</span>. On 2026-09-18 ten of these were found and
   wrapped — (loop) x8, (rest), (roll ↑) — which is why this exists.

   What is legitimately English-free-of-a-twin inside these blocks, and so
   allowed: chord and note symbols (Am, C#m, G/B, A5, Em7, x/o markers),
   the string-name letters that open each row, fret/beat digits, and tab
   punctuation. So the rule is: a run of 3+ ASCII letters that is not a
   chord symbol and is not inside a data-es span is prose, and fails.
   ════════════════════════════════════════════════════════════════════ */
function checkTabAsciiEnglish() {
  head('1al. English words inside Journey tab-ascii blocks');
  let bad = 0, blocks = 0, wrapped = 0;
  const flag = m => { err(m); problems++; bad++; };
  // A chord/note symbol: root letter, optional accidental, optional
  // quality/extension, optional /bass. Also the bare string-name letters.
  const CHORD = /^(?:[A-Ga-g](?:#|b)?(?:m|maj|min|sus|add|dim|aug|M)?\d*(?:\/[A-Ga-g](?:#|b)?)?)$/;
  for (const file of TAB_PAGES.filter(f => f.endsWith('.html'))) {
    let src;
    try { src = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
    for (const m of src.matchAll(/<pre class="tab-ascii">([\s\S]*?)<\/pre>/g)) {
      blocks++;
      const startLine = src.slice(0, m.index).split('\n').length;
      // Drop every <span …>…</span> that carries a data-es: those ARE
      // translated. Keep other spans' text (e.g. .hl fret highlights),
      // which is digits and so can't trip the letter rule below.
      let body = m[1].replace(/<span[^>]*data-es=(?:"[^"]*"|'[^']*')[^>]*>[\s\S]*?<\/span>/g,
        () => { wrapped++; return ' '; });
      body = body.replace(/<[^>]+>/g, ' ').replace(/&[a-zA-Z]+;|&#x?[0-9A-Fa-f]+;/g, ' ');
      body.split('\n').forEach((line, li) => {
        // A string row opens "e |" / "B |" — strip that leading label so the
        // single letter isn't read as a word.
        const text = /^[a-zA-Z] \|/.test(line) ? line.slice(1) : line;
        for (const w of text.match(/[A-Za-z]{3,}/g) || []) {
          if (CHORD.test(w)) continue;
          flag(`${file}:${startLine + li}: tab-ascii holds the English word "${w}" with no data-es twin — `
             + `wrap it (<span data-es="…">${w}</span>), the way tabs/the-cure.html does, or a Spanish reader sees English inside the tab`);
        }
      });
    }
  }
  if (bad === 0) ok(`${blocks} Journey tab-ascii blocks — no untranslated English prose (${wrapped} translated spans)`);
}

function checkJourneyLayers() {
  head('1ab. JOURNEY_LAYERS ↔ tabs/*.html layer-unit spans');
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  let JOURNEY_LAYERS;
  try {
    JOURNEY_LAYERS = loadConstObject(readFileSync(join(ROOT, 'app.js'), 'utf8'), 'JOURNEY_LAYERS');
  } catch (e) { flag(`app.js: could not load JOURNEY_LAYERS — ${e.message}`); return; }

  const real = {};
  const layerRe = /<span class="layer-num"[^>]*>(\d+)<\/span>.*?<span class="layer-unit"[^>]*>([^<]*)<\/span>/g;
  for (const file of TAB_PAGES.filter(f => f.endsWith('.html'))) {
    let src;
    try { src = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
    const slug = file.replace(/^tabs\//, '').replace(/\.html$/, '');
    const map = {};
    for (const m of src.matchAll(layerRe)) {
      const layerNum = Number(m[1]);
      const mod = m[2].match(/^Module (\d+)$/);
      if (mod) map[Number(mod[1])] = layerNum;   // "Extra"/"Bonus" layers carry no module number — left out on purpose
    }
    if (Object.keys(map).length) real[slug] = map;
  }

  const slugs = new Set([...Object.keys(real), ...Object.keys(JOURNEY_LAYERS)]);
  for (const slug of slugs) {
    const r = real[slug], j = JOURNEY_LAYERS[slug];
    if (!r) { flag(`JOURNEY_LAYERS has '${slug}' but no tabs/${slug}.html layer-unit spans were found`); continue; }
    if (!j) { flag(`tabs/${slug}.html has layer-unit spans but JOURNEY_LAYERS['${slug}'] is missing`); continue; }
    const mods = new Set([...Object.keys(r), ...Object.keys(j)].map(Number));
    for (const mod of mods) {
      if (r[mod] !== j[mod]) {
        flag(`${slug}: Module ${mod} is Layer ${r[mod] ?? '—'} on the page but JOURNEY_LAYERS says Layer ${j[mod] ?? '—'}`);
      }
    }
  }
  if (Object.keys(real).length !== JOURNEY_LAYERS_SONG_COUNT) {
    flag(`${Object.keys(real).length} Journey pages have layer-unit spans, expected ${JOURNEY_LAYERS_SONG_COUNT} — update JOURNEY_LAYERS_SONG_COUNT in checks.mjs if a song was genuinely added or removed.`);
  }
  if (bad === 0) ok(`JOURNEY_LAYERS matches all ${JOURNEY_LAYERS_SONG_COUNT} Journey pages' layer-unit spans`);
}

/* ════════════════════════════════════════════════════════════════════
   1ab2. MODULE FILES ↔ JOURNEY LAYERS — 1ab proves the six pages and
   JOURNEY_LAYERS agree; nothing proved the MODULE files agree with
   either. Added 2026-10-12, when Open Chords and Pentatonic Scales
   swapped places (Module 4 ↔ 5) and every page swapped Layers 4 and 5 to
   match: a set names its layer by NUMBER in two places — its
   `songThread` entries (the "About this set" line, deep-linked to
   #layer-N) and its take-to-song text ("this is Layer N of 5") — so
   moving a module's content without moving those numbers links every
   one of its sets to the other skill's layer, with all of 1ab green.
   Four rules:
   - a songThread entry with a `layer` and no `bonus` must be the layer
     JOURNEY_LAYERS gives that song for the set's module;
   - a `bonus` entry must name a layer the page marks .bonus;
   - RULE X: any "Layer N" / "Capa N" (N ≤ 5) in module-M.js for M ≤ 5 —
     "Layer N of 5" or free-form ("play this loop there, Layer 4") — must
     have N = M, and "Layer N of 5" must have N = M in every module. The
     one exception is a REVISIT ("revisit" / "back to" / "vuelve a (la)"),
     and only when N < M: a revisit points back, so "revisit Layer 5 of 5"
     in Module 4 is a wrong number, not a revisit. (A plural "Layers 2 and
     3" names several layers on purpose and is left to RULE Y.)
   - a tabs/<slug>.html#layer-N link in a module file must name a layer
     that page has.
   And the rules that tie the NUMBERS to the SKILL, which nothing else
   does (every rule above holds just as well with the pages and the
   modules each numbered 1..5 but in different orders):
   - a core layer whose title names a skill in LAYER_SKILL_WORDS must
     carry the "Module N" whose MODULE_MANIFEST name says the same skill
     — and there must be exactly CORE_LAYER_TITLES of them (3 skills × 6
     pages): the title regex reads a title with no markup in it, so one
     that gains a <small> would drop out of the count silently;
   - RULE Y: a "Layer N" / "Capa N" (or "Layers 3 · 4", "Capas 2 y 3")
     with a SKILL CUE within LAYER_CUE_WINDOW characters — pentatonic /
     box / caja / scale / escala; open chords / strum / rasgue- / acordes
     al aire / chord shapes / formas de acordes; power chords / acordes de
     potencia — must name the layer whose TITLE carries that skill on that
     page (the layer titles are read from each page's own headings, so
     the rule follows the pages). The nearest cue wins, and a cue counts
     only for the mention nearest to it, so "the Layer 2 riff and the
     Layer 5 box" ties "box" to Layer 5 alone. Read on the six Journey
     pages (English text and every data-es value, inline scripts and
     comments blanked), in every string literal of the module files,
     class-activities.js, i18n.js and app.js (comments stripped; a
     tabs/<slug>.html link in the same string picks the page, otherwise
     any page's layer is accepted), and in Watchtower's song-anatomy rows,
     where a cue anywhere in a row's description must be one of the
     layers the row lists. It is what guards the free-form numbers RULE X
     can't (Modules 6+, the bonus-layer intros that say "Best once Layer
     5's box feels automatic", the anatomy rows): a number with no cue
     word near it is still unguarded there — add the cue word to the
     sentence rather than widening the list.
   Added 2026-10-12 after the Module 4/5 swap review: RULE X, RULE Y, the
   N < M limit on "revisit" (it used to skip the check outright) and the
   CORE_LAYER_TITLES pin were each proved red by mutation.
   ════════════════════════════════════════════════════════════════════ */
const LAYER_SKILL_WORDS = ['Power Chords', 'Pentatonic', 'Open Chords'];
const CORE_LAYER_TITLES = 18;    // 3 skill layers × 6 Journey pages
const LAYER_CUE_WINDOW = 40;
const LAYER_CUES = [
  { skill: 'Pentatonic',   re: /pentat[oó]nic\w*|\bbox(?:es)?\b|\bcajas?\b|\bscales?\b|\bescalas?\b/gi },
  { skill: 'Open Chords',  re: /\bopen[- ]chords?\b|\bstrum\w*|\brasgue\w*|\bacordes al aire\b|\bchord shapes?\b|\bformas? (?:\S+ )?del? acordes?\b/gi },
  { skill: 'Power Chords', re: /\bpower[- ]chords?\b|\bacordes? de potencia\b/gi },
];
const LAYER_MENTION_RE = /\b(?:Layers?|Capas?) (\d+)((?:\s*(?:·|&middot;|,|and|&amp;|&|or|y|o)\s*\d+)*)/gi;
/* Block-level tags become a \u0001 boundary a cue never reaches across;
   every other tag becomes spaces. Same length either way, so an offset
   in the masked text is an offset in the source (and gives its line). */
const LAYER_BLOCK_TAG_RE = /<\/(?:p|div|li|ol|ul|h\d|summary|td|tr)>|<br\s*\/?>|<(?:p|div|li|ol|ul|h\d|summary|td|tr)\b[^>]*>/gi;
const maskLayerHtml = s => s
  .replace(LAYER_BLOCK_TAG_RE, m => '\u0001' + m.slice(1).replace(/[^\n]/g, ' '))
  .replace(/<[^>]*>/g, m => m.replace(/[^\n]/g, ' '));
/* Every "Layer N" in `text` (already masked) that has a skill cue tied to
   it: [{ at, nums, raw, skill, word, ctx }]. */
function layerCueMentions(text) {
  const out = [];
  let base = 0;
  for (const seg of text.split('\u0001')) {
    const mentions = [...seg.matchAll(LAYER_MENTION_RE)].map(m => ({
      s: m.index, e: m.index + m[0].length, raw: m[0].replace(/\s+/g, ' '),
      nums: (m[1] + m[2]).match(/\d+/g).map(Number), cues: [],
    }));
    if (mentions.length) {
      for (const cue of LAYER_CUES) {
        for (const c of seg.matchAll(cue.re)) {
          const cs = c.index, ce = c.index + c[0].length;
          let near = null, dist = Infinity;
          for (const m of mentions) {
            const d = ce <= m.s ? m.s - ce : cs >= m.e ? cs - m.e : 0;
            if (d < dist) { dist = d; near = m; }
          }
          if (near && dist <= LAYER_CUE_WINDOW) near.cues.push({ skill: cue.skill, word: c[0], d: dist });
        }
      }
      for (const m of mentions) {
        if (!m.cues.length) continue;
        const cue = m.cues.sort((a, b) => a.d - b.d)[0];
        const ctx = seg.slice(Math.max(0, m.s - LAYER_CUE_WINDOW), m.e + LAYER_CUE_WINDOW).replace(/\s+/g, ' ').trim();
        out.push({ at: base + m.s, nums: m.nums, raw: m.raw, skill: cue.skill, word: cue.word, ctx });
      }
    }
    base += seg.length + 1;
  }
  return out;
}
/* ════════════════════════════════════════════════════════════════════
   1ab3. SKILL → SONG JOURNEY LINKS (2026-10-18). A skill about one core song
   carries `journey: [{ song, layer }]` and its checklist row links to that
   page (skillJourneyHtml() in app.js) — the replacement for the "Take It to a
   Song" box, which is switched off. The failures are silent: an unknown song
   id renders nothing, and a layer the page does not have opens the page at
   the top with no hint that the link meant something else. So this checks the
   field against the real pages and then reads the real rendered checklist.
   Pinned at 14 skills / 16 links so a link cannot disappear unnoticed; adding
   one is a deliberate edit to these two numbers.
   ════════════════════════════════════════════════════════════════════ */
const SKILL_JOURNEY_SKILLS = 14, SKILL_JOURNEY_LINKS = 16;
function checkSkillJourneyLinks(sets, ctx) {
  head('1ab3. Skill → Song Journey links');
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  if (!sets || !sets.length || !ctx) { flag('1ab3: no parsed SETS — it cannot see the skill links it guards'); return; }
  let SJ, buildChecklist;
  try { SJ = vm.runInContext('SONG_JOURNEYS', ctx); buildChecklist = vm.runInContext('buildChecklist', ctx); }
  catch { flag('1ab3: SONG_JOURNEYS / buildChecklist not found in app.js'); return; }
  const layersOf = slug => {
    let src = '';
    try { src = readFileSync(join(ROOT, 'tabs', `${slug}.html`), 'utf8'); } catch { /* reported by the caller */ }
    return new Set([...src.matchAll(/<section class="layer[^"]*" id="layer-(\d+)"/g)].map(m => Number(m[1])));
  };
  let skills = 0, links = 0;
  for (const w of sets) {
    let want = 0;
    for (const sk of (w.skills || [])) {
      if (sk.journey === undefined) continue;
      skills++;
      const where = `${sk.id} (module-${w.moduleNum}.js)`;
      if (!Array.isArray(sk.journey) || !sk.journey.length) { flag(`${where}: journey must be a non-empty array of { song, layer }`); continue; }
      const seen = new Set();
      for (const j of sk.journey) {
        links++; want++;
        const sg = j && SJ.find(x => x.id === j.song);
        if (!sg) { flag(`${where}: journey song "${j && j.song}" is not a SONG_JOURNEYS id`); continue; }
        if (!Number.isInteger(j.layer) || !layersOf(sg.id).has(j.layer)) flag(`${where}: ${sg.id} has no layer ${j.layer} — the link would open the page at the top`);
        if (seen.has(j.song)) flag(`${where}: journey names ${j.song} twice`);
        seen.add(j.song);
      }
    }
    if (want) {
      let html = '';
      try { html = buildChecklist(w); } catch (e) { flag(`${w.id}: buildChecklist threw (${e.message}) — 1ab3 cannot read its skill links`); continue; }
      const got = (html.match(/class="sk-where-btn sk-song-btn"/g) || []).length;
      if (got !== want) flag(`${w.id}: ${want} skill journey link(s) in the data but ${got} rendered in the checklist`);
      if (!/data-i18n="ca\.openJourney" data-i18n-params=/.test(html)) flag(`${w.id}: the skill link label lost data-i18n-params — it would stay in its first language`);
    }
  }
  if (skills !== SKILL_JOURNEY_SKILLS || links !== SKILL_JOURNEY_LINKS) flag(`${skills} skills / ${links} links carry a journey field, pinned at ${SKILL_JOURNEY_SKILLS} / ${SKILL_JOURNEY_LINKS} — bump SKILL_JOURNEY_* in the same edit if that is on purpose`);
  if (!bad) ok(`${skills} skills carry ${links} Song Journey links — every song and layer exists, every link renders in the checklist (pinned)`);
}
function checkModuleJourneyLayers(sets, ctx) {
  head('1ab2. Module files name the right Journey layer');
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  if (!sets || !sets.length || !ctx) { flag('1ab2: no parsed SETS — it cannot see the songThread layers it guards'); return; }
  let JL;
  try { JL = vm.runInContext('JOURNEY_LAYERS', ctx); } catch { flag('1ab2: JOURNEY_LAYERS not found in app.js'); return; }
  const pageLayers = {};   // slug -> { all: Set, bonus: Set }
  const layersOf = slug => {
    if (pageLayers[slug]) return pageLayers[slug];
    let src = '';
    try { src = readFileSync(join(ROOT, 'tabs', `${slug}.html`), 'utf8'); } catch { /* reported below */ }
    const all = new Set([...src.matchAll(/<section class="layer[^"]*" id="layer-(\d+)"/g)].map(m => Number(m[1])));
    const bonus = new Set([...src.matchAll(/<section class="layer[^"]*\bbonus\b[^"]*" id="layer-(\d+)"/g)].map(m => Number(m[1])));
    return (pageLayers[slug] = { all, bonus });
  };
  let threads = 0, texts = 0, free = 0, links = 0;
  for (const s of sets) {
    const mod = Number(s.moduleNum);
    for (const e of (Array.isArray(s.songThread) ? s.songThread : [])) {
      if (!e || !e.journey || e.layer == null) continue;
      const slug = String(e.journey).replace(/^tabs\//, '').replace(/\.html$/, '');
      const L = layersOf(slug);
      threads++;
      if (!L.all.size) { flag(`${s.id}: songThread names ${e.journey} — no such Journey page (or it has no layers)`); continue; }
      if (e.bonus) {
        if (!L.bonus.has(Number(e.layer))) flag(`${s.id}: songThread marks "${slug}" layer ${e.layer} as bonus, but that page's bonus layers are ${[...L.bonus].join(', ') || 'none'}`);
      } else {
        const want = (JL[slug] || {})[mod];
        if (Number(e.layer) !== want) flag(`${s.id} (Module ${mod}): songThread says "${slug}" layer ${e.layer}, but Module ${mod} is Layer ${want ?? '—'} on that page (JOURNEY_LAYERS) — the "About this set" link opens the wrong layer`);
      }
    }
  }
  // RULE X (+ "Layer N of 5" in every module), on comment-stripped source.
  const LAYER_REF_RE = /(\b(?:revisit|back to|vuelve(?: a)?)(?: (?:the|la|el))? )?\b(?:Layer|Capa) (\d+)( (?:of|de) 5\b)?/gi;
  for (const file of MODULE_FILES) {
    const mod = Number(file.match(/\d+/)[0]);
    let src;
    try { src = stripJsComments(readFileSync(join(ROOT, file), 'utf8')); } catch { continue; }
    const lineOf = lineLookup(src);
    for (const m of src.matchAll(LAYER_REF_RE)) {
      const n = Number(m[2]), ofFive = !!m[3], back = m[1] ? m[1].trim() : '';
      if (ofFive) texts++;
      else if (mod <= 5 && n <= 5) free++;
      else continue;              // a bonus layer, or a free-form number in Modules 6+: RULE Y's
      if (n === mod || (back && n < mod)) continue;
      flag(`${file}:${lineOf(m.index)}: "${m[0].trim()}" — a Module ${mod} set builds Layer ${mod}; ${back
        ? `"${back}" only excuses an EARLIER layer (a revisit points back, never forward)`
        : 'say "revisit" if it points back on purpose'}`);
    }
    for (const m of src.matchAll(/tabs\/([a-z0-9-]+)\.html#layer-(\d+)/g)) {
      links++;
      const L = layersOf(m[1]);
      if (!L.all.has(Number(m[2]))) flag(`${file}:${lineOf(m.index)}: links ${m[0]} — that page has layers ${[...L.all].join(', ') || 'none'}`);
    }
  }
  let manifest = [];
  try { manifest = vm.runInContext('MODULE_MANIFEST', ctx) || []; } catch { /* flagged below */ }
  const modName = {};
  for (const m of manifest) modName[Number(m.num)] = String(m.name || '');
  let tied = 0;
  const skillLayer = {};   // slug -> { skill word -> layer number }, from the page's own headings
  for (const file of TAB_PAGES.filter(f => f.endsWith('.html'))) {
    let src;
    try { src = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
    const re = /<span class="layer-num"[^>]*>(\d+)<\/span><span class="layer-title"[^>]*>([^<]*)<\/span><span class="layer-unit"[^>]*>Module (\d+)<\/span>/g;
    for (const m of src.matchAll(re)) {
      const word = LAYER_SKILL_WORDS.find(w => m[2].includes(w));
      if (!word) continue;
      tied++;
      const mod = Number(m[3]);
      if (!(modName[mod] || '').includes(word)) {
        const owner = Object.keys(modName).find(k => modName[k].includes(word));
        flag(`${file}: Layer ${m[1]} "${m[2].replace(/&nbsp;.*$/, '').trim()}" says Module ${mod}, but Module ${mod} is "${modName[mod] || '?'}"${owner ? ` — ${word} is Module ${owner}` : ''} (MODULE_MANIFEST)`);
      }
    }
    // RULE Y's map reads markup inside a title too (tags dropped), so it
    // never loses a layer the pinned count above is there to notice.
    const slug = file.replace(/^tabs\//, '').replace(/\.html$/, ''), map = {};
    for (const m of src.matchAll(/<span class="layer-num"[^>]*>(\d+)<\/span>\s*<span class="layer-title"[^>]*>((?:(?!<\/span>)[\s\S])*)<\/span>/g)) {
      const word = LAYER_SKILL_WORDS.find(w => m[2].replace(/<[^>]*>/g, '').includes(w));
      if (word) map[word] = Number(m[1]);
    }
    for (const w of LAYER_SKILL_WORDS) if (map[w] == null) flag(`${file}: no layer title names "${w}" — RULE Y cannot tell which layer a "${w}" cue points to`);
    skillLayer[slug] = map;
  }
  if (!tied) flag('1ab2 matched no core layer title to a module — it cannot see what it is supposed to guard');
  else if (tied !== CORE_LAYER_TITLES) flag(`1ab2 read ${tied} core layer titles (Power Chords / Pentatonic / Open Chords), expected ${CORE_LAYER_TITLES} (3 × 6 pages) — a title with markup inside it is invisible to this check; if a page or skill layer was genuinely added or removed, update CORE_LAYER_TITLES`);
  if (!threads) flag('1ab2 found no songThread entry with a layer — it cannot see what it is supposed to guard');
  if (!texts) flag('1ab2 found no "Layer N of 5" text in the module files — it cannot see what it is supposed to guard');

  // RULE Y
  let cued = 0;
  const wantFor = (slug, skill) => {
    if (slug && skillLayer[slug]) return new Set([skillLayer[slug][skill]]);
    return new Set(Object.values(skillLayer).map(m => m[skill]).filter(v => v != null));
  };
  const judge = (where, slug, hit) => {
    cued++;
    const want = wantFor(slug, hit.skill);
    if (hit.nums.some(n => want.has(n))) return;
    flag(`${where}: "${hit.raw}" sits next to "${hit.word}", but ${hit.skill} is Layer ${[...want].join('/') || '—'} on ${slug ? `tabs/${slug}.html` : 'the Journey pages'} (read from the layer titles) — "…${hit.ctx}…"`);
  };
  for (const file of TAB_PAGES.filter(f => f.endsWith('.html'))) {
    let raw;
    try { raw = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
    const slug = file.replace(/^tabs\//, '').replace(/\.html$/, '');
    raw = blankHtmlComments(raw).replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, m => m.replace(/[^\n]/g, ' '));
    const lineAt = lineLookup(raw);
    // Song-anatomy rows: a cue in the description must be among the listed layers.
    for (const row of raw.matchAll(/<div class="anatomy-row">([\s\S]*?)<\/div>/g)) {
      const d = row[1].match(/<span data-es="([^"]*)">([\s\S]*?)<\/span>/);
      const l = row[1].match(/<span class="an-layers" data-es="([^"]*)">([\s\S]*?)<\/span>/);
      if (!d || !l) { flag(`${file}:${lineAt(row.index)}: an anatomy row 1ab2 cannot read (description or an-layers span missing)`); continue; }
      for (const [desc, list, lang] of [[decodeHtmlEntities(d[1]), decodeHtmlEntities(l[1]), 'es'], [d[2], decodeHtmlEntities(l[2]), 'en']]) {
        const nums = (list.match(/\d+/g) || []).map(Number);
        for (const cue of LAYER_CUES) {
          for (const c of desc.matchAll(cue.re)) {
            judge(`${file}:${lineAt(row.index)} (anatomy row${lang === 'es' ? ', es' : ''})`, slug,
              { raw: list.replace(/<[^>]*>/g, '').replace(/&middot;/g, '·').trim(), nums, skill: cue.skill, word: c[0], ctx: desc.replace(/<[^>]*>/g, '').trim() });
          }
        }
      }
    }
    const body = raw.replace(/<div class="anatomy-row">[\s\S]*?<\/div>/g, m => m.replace(/[^\n]/g, ' '));
    for (const m of body.matchAll(/\bdata-es="([^"]*)"/g)) {
      for (const hit of layerCueMentions(maskLayerHtml(decodeHtmlEntities(m[1])))) judge(`${file}:${lineAt(m.index)} (es)`, slug, hit);
    }
    const en = maskLayerHtml(body.replace(/\bdata-es="[^"]*"/g, m => m.replace(/[^\n]/g, ' ')));
    for (const hit of layerCueMentions(en)) judge(`${file}:${lineAt(hit.at)}`, slug, hit);
  }
  for (const file of [...MODULE_FILES, 'class-activities.js', 'i18n.js', 'app.js']) {
    let src;
    try { src = stripJsComments(readFileSync(join(ROOT, file), 'utf8')); } catch { continue; }
    const lineOf = lineLookup(src);
    for (let i = 0; i < src.length; ) {
      if (!isQuote(src[i])) { i++; continue; }
      const { text, end } = readJsString(src, i);
      if (/\b(?:Layer|Capa)s? \d/i.test(text)) {
        const link = text.match(/tabs\/([a-z0-9-]+)\.html/);
        for (const hit of layerCueMentions(maskLayerHtml(decodeHtmlEntities(text)))) judge(`${file}:${lineOf(i)}`, link ? link[1] : null, hit);
      }
      i = end;
    }
  }
  if (!cued) flag('1ab2 RULE Y tied no "Layer N" to a skill cue anywhere — it cannot see what it is supposed to guard');
  if (bad === 0) ok(`${threads} songThread layers, ${texts} "Layer N of 5" mentions, ${free} other Module 1–5 layer numbers and ${links} #layer-N links in the module files name the right Journey layer; ${tied} core layer titles (pinned) sit on the module that teaches them; ${cued} layer numbers next to a skill cue name the layer with that skill`);
}

/* ════════════════════════════════════════════════════════════════════
   1ac. visibleSteps/visibleSections ACTUALLY USED — the render-time-hiding
   helpers (Today-first work order, Phase 3) are only as good as every place
   that used to iterate `.sections`/`.steps` raw switching over to them. This
   can't prove NO raw iteration slipped back in (that needs a real parser),
   but it proves the positive: each function below still calls
   visibleSteps(/visibleSections( at least once. A regression that deletes
   the call — the shape a careless revert takes — fails here even though a
   narrower "no raw .sections./.steps." scan would also flag ordinary
   presence checks (`if (stn.sections)`) as false positives.
   HONEST LIMIT: doesn't catch a raw iteration added ALONGSIDE a leftover,
   unrelated call to the helper elsewhere in the same function.
   ════════════════════════════════════════════════════════════════════ */
const VISIBLE_HELPER_CALLERS = [
  { file: 'app.js', fn: 'resumeLessonCounts' },
  { file: 'app.js', fn: 'buildLesson' },
  { file: 'app.js', fn: 'buildSearchIndex' },
  { file: 'app.js', fn: 'moduleStepsFlat' },   // Daily 5 candidates — a retired section's step must never be dealt
  { file: 'app.js', fn: 'skillTaughtStation' }, // checklist "Show me where" — a hidden step must not be the place it points
  // The teacher's response audit walks ALL storage sections on purpose
  // (retired prompts still hold real answers) — so it must call
  // storageSections(, and must NOT be narrowed back to visibleSections(.
  { file: 'teacher.js', fn: 'setShortResponses', helper: 'storageSections', forbid: 'visibleSections' },
];
function checkVisibleHelperUsage() {
  head('1ac. Section/step counters call visibleSteps()/visibleSections()');
  let bad = 0;
  for (const { file, fn } of VISIBLE_HELPER_CALLERS) {
    let src;
    try { src = readFileSync(join(ROOT, file), 'utf8'); } catch { err(`${file} unreadable — 1ac cannot check ${fn}()`); problems++; bad++; continue; }
    const decls = topLevelFunctionDecls(src).filter(d => d.name === fn);
    if (!decls.length) { err(`${file}: no top-level function '${fn}' found — 1ac's whitelist is stale`); problems++; bad++; continue; }
    /* 2026-10-12, two blind spots closed together:
       · Comments are blanked — a leftover `// visibleSteps(` note kept a
         reverted function green.
       · The body runs from the declaration to its OWN closing brace, which
         this codebase writes flush at column 0 (the convention
         topLevelFunctionDecls relies on). functionBodyAt's brace count is
         not used: a nested template literal (`${a ? `x` : ''}`) reads to it
         as the end of the outer one, and it returned only the first 181 of
         buildLesson's 454 lines (2026-10-12) — green solely because they
         open with a comment naming visibleSteps(. */
    const from = decls[0].index, close = src.slice(from).search(/\n\}/);
    const body = stripJsComments(close < 0 ? src.slice(from) : src.slice(from, from + close + 2));
    const { helper, forbid } = VISIBLE_HELPER_CALLERS.find(c => c.file === file && c.fn === fn);
    const want = helper ? new RegExp(`\\b${helper}\\s*\\(`) : /\bvisible(Steps|Sections)\s*\(/;
    if (!want.test(body)) {
      err(`${file}: ${fn}() no longer calls ${helper ? helper + '(' : 'visibleSteps(/visibleSections('} — ${helper ? 'retired prompts would vanish from the audit' : 'a hidden step or section would count again'}`);
      problems++; bad++;
    }
    if (forbid && new RegExp(`\\b${forbid}\\s*\\(`).test(body)) {
      err(`${file}: ${fn}() calls ${forbid}( — this audit must walk every storage section, not just the rendered ones`);
      problems++; bad++;
    }
  }
  if (bad === 0) ok(`${VISIBLE_HELPER_CALLERS.length} section/step counters all call visibleSteps()/visibleSections()`);
}

/* ════════════════════════════════════════════════════════════════════
   1aa. GATE-SAFE NAV — the activity gate (app.js applyActivityGate,
   Today-first work order, Phase 1) hides every rail .nav-btn except In class
   while it's on (Live quiz lost its rail button 2026-09-29). The CSS that does it keys off
   data-gate="hide" (styles.css body.ca-gated [data-gate="hide"]), not a
   hand-kept id list — so a new nav item with no data-gate attribute at all
   would silently leak past the gate, reachable while the rest of the site
   is supposed to be blocked. Every .nav-btn must carry data-gate="keep" or
   data-gate="hide" so there is no third, unguarded state.
   ════════════════════════════════════════════════════════════════════ */
function checkGateSafeNav() {
  head('1aa. Gate-safe nav — every rail .nav-btn is tagged keep/hide');
  let bad = 0, total = 0;
  const flag = m => { err(m); problems++; bad++; };
  let src;
  try { src = readFileSync(join(ROOT, 'index.html'), 'utf8'); }
  catch { flag('index.html unreadable — 1aa cannot check this'); return; }
  src.split('\n').forEach((line, li) => {
    for (const m of line.matchAll(/<button\b[^>]*\bclass="[^"]*\bnav-btn\b[^"]*"[^>]*>/g)) {
      total++;
      if (!/\bdata-gate="(?:keep|hide)"/.test(m[0]))
        flag(`index.html:${li + 1}: a .nav-btn with no data-gate="keep"/"hide" — the activity gate hides nav items by this attribute, not a hand-kept id list, so a new one with none of it would leak straight past the gate. "${m[0].slice(0, 90)}…"`);
    }
  });
  if (!total) { flag('index.html: no .nav-btn found at all — 1aa cannot see what it is supposed to guard'); return; }
  if (bad === 0) ok(`${total} rail nav buttons all carry data-gate="keep"/"hide"`);
}

/* ════════════════════════════════════════════════════════════════════
   1p. playSeq PITCHES MUST EXIST ON THE STRING THE STEP NAMES — a step
   whose wording names exactly one string, then plays a ▶ sequence
   containing a note BELOW that string's open pitch, is asking for a
   sound the student cannot produce there. On 2026-08-28 the Module 2
   Set 1 ear exercise shipped exactly that: the text moved from the low
   E string to the A string, the playSeq stayed on the old low-E
   transposition, and two of its seven notes (G2, F#2) sat below the
   open A string — unplayable, so the exercise could not be completed
   as written. 1b/1c validate playSeq SHAPE; nothing checked that the
   audio agreed with the prose. Only the physically-impossible case is
   flagged (below the open string); high frets, unnamed steps and
   steps naming several strings are left alone.
   ════════════════════════════════════════════════════════════════════ */
function checkPlaySeqStrings(allSets) {
  head('1p. playSeq pitches playable on the named string');
  const OPEN = { 'low e': 40, a: 45, d: 50, g: 55, b: 59, 'high e': 64 };
  const NAMES = { 40: 'low E', 45: 'A', 50: 'D', 55: 'G', 59: 'B', 64: 'high e' };
  let checked = 0, bad = 0;

  // Directions only: an <img alt> describes a diagram (often a scale box
  // spanning every string) and must not be read as "this step is on the D
  // string". Tags go too, so markup can't split a phrase.
  const prose = t => String(t).replace(/<img\b[^>]*>/gi, ' ').replace(/<[^>]+>/g, ' ');

  const namedStrings = raw => {
    const text = prose(raw);
    const found = new Set();
    // Plural "strings", or "the E or A string", means the step deliberately
    // spans more than one — there is no single string to judge the pitches against.
    if (/\bstrings\b/i.test(text)) return found;
    if (/\b[EADGBe]\s*(?:,|\/|\bor\b|\band\b)\s*[EADGBe][- ]string\b/.test(text)) return found;
    if (/\blow[ -]E[- ]string\b/i.test(text)) found.add(OPEN['low e']);
    if (/\bhigh[ -]e[- ]string\b/i.test(text)) found.add(OPEN['high e']);
    for (const m of text.matchAll(/\b([ADGB])[- ]string\b/g)) {
      if (/(?:low|high) $/i.test(text.slice(Math.max(0, m.index - 6), m.index))) continue;
      found.add(OPEN[m[1].toLowerCase()]);
    }
    // a bare "E string" could be either E — too ambiguous to judge
    if (/\bE[- ]string\b/.test(text) && !/(?:low|high)[ -]e[- ]string/i.test(text)) found.add(-1);
    return found;
  };

  for (const w of allSets) {
    for (const stId of Object.keys(w.stations || {})) {
      const st = w.stations[stId];
      const sections = st.sections || (st.steps ? [{ steps: st.steps }] : []);
      sections.forEach((sec, gi) => (sec.steps || []).forEach((step, i) => {
        const ps = step.playSeq;
        if (!ps || !Array.isArray(ps.notes) || !ps.notes.length) return;
        const pitches = ps.notes
          .map(n => (n && typeof n === 'object' ? n.midi : n))
          .filter(n => typeof n === 'number');
        if (!pitches.length) return;
        const strings = namedStrings([step.label, step.text, ps.label].filter(Boolean).join(' '));
        if (strings.size !== 1 || strings.has(-1)) return;   // unnamed, ambiguous, or crosses strings
        checked++;
        const open = [...strings][0];
        const low = Math.min(...pitches);
        if (low < open) {
          err(`set "${w.id}" · station "${stId}" · section ${gi + 1} · step ${i + 1}: playSeq drops to MIDI ${low}, below the open ${NAMES[open]} string (${open}) that its wording names — unplayable there`);
          problems++; bad++;
        }
      }));
    }
  }
  if (bad === 0) ok(`${checked} single-string playSeq sequences all sit at or above their open string`);
}

/* ════════════════════════════════════════════════════════════════════
   1m. NARRATIVE LEAD-INS IN STEP TEXT — a step's `text`/`text_es` opens
   directly with the verb, not an announcement that an instruction is
   coming. A 2026-08-24 sweep removed ~45 instances of a handful of
   recurring phrases across every module + class-activities.js
   (Jonathan): "Now …", "Try it …", "Listen for it …", "Ahora …". Not
   every narrative lead-in is mechanically detectable — that sweep also
   hand-rewrote plenty of one-off descriptive openers — but these
   specific phrases recur, so catch a relapse of exactly those.
   ════════════════════════════════════════════════════════════════════ */
function checkNarrativeLeadIns() {
  head('1m. Narrative lead-ins in step text');
  const FIELD_RE = /\b(text|text_es):\s*'((?:\\.|[^'\\])*)'/g;
  const LEAD_IN = /^(Now\b|Try it\b|Listen for it\b|Ahora\b)/;
  let bad = 0;
  for (const file of [...MODULE_FILES, 'class-activities.js']) {
    const lines = readFileSync(join(ROOT, file), 'utf8').split('\n');
    lines.forEach((line, li) => {
      for (const m of line.matchAll(FIELD_RE)) {
        const val = m[2];
        if (LEAD_IN.test(val)) {
          err(`${file}:${li + 1}: ${m[1]} opens with a narrative lead-in instead of the verb — "${val.slice(0, 50)}${val.length > 50 ? '…' : ''}"`);
          problems++; bad++;
        }
      }
    });
  }
  if (bad === 0) ok('no narrative lead-ins at the start of step text');
}

/* ════════════════════════════════════════════════════════════════════
   1w. SLANG AND FIGURATIVE PHRASING IN STUDENT-FACING TEXT — copy tells
   students what happens: louder, quieter, higher, in front of,
   underneath. It does not describe a sound through a metaphor ("the
   band slams the loop; the lead flies over the top") or an informal
   idiom ("nail it", "for real", "rock solid"). The 2026-09-08 sweep
   rewrote ~120 such phrases across the six Song Journey pages, every
   module, class-activities.js and i18n.js; this catches a relapse of
   the exact phrases it retired.

   What this does NOT ban: standard music vocabulary the course defines
   in context — riff, lick, hook, loop, lap, solo, wah, slide,
   hammer-on, pull-off, palm-mute, chug, vamp, requinto, barre,
   pentatonic box, backing track, call and response, turnaround, fill,
   roll, groove, shuffle — nor the UI conventions ("Stuck?", "Level
   up", "Finger Gym", "You've got it when"), nor the figurative lick
   nicknames on the Journey pages ("the taunt", "the dive"), which are
   titles beside a diagram rather than instructions.

   The list is English, and so is nearly everything it reads: the HTML
   scan blanks every data-es="…" attribute before matching (keeping line
   numbers intact) and i18n.js is read through its `en:` values only. The
   module scan is the exception — STUDENT_VALUE_NAME_RE also names
   `choices_es` and `assessItems_es`, so those Spanish arrays ARE read
   against this English list (harmless, but not "exempt"); every other
   `_es` field is not read here. Spanish reassurance is 1w-t's job
   (TEACHER_PHRASES_ES).
   ════════════════════════════════════════════════════════════════════ */
const SLANG_PHRASES = [
  'slams the loop', 'flies over the top', 'straight out of the box', 'played bigger',
  'pure stomp', 'tore through', 'hit hard', 'out front', 'the whole ride', 'sneak them',
  'sneak the', 'steal them', 'sound like a record', 'for real', 'nail it',
  'the whole trick', 'the same trick', 'whisper-quiet', 'at a whisper', 'fights you',
  'fight the', 'toolkit', 'payoff', 'pays off', 'backbone', 'slam your', 'slam a finger',
  'rock solid', 'like a pro', 'wants to be played', 'dialed down', 'the boss',
  'big finish', 'gets bigger every time', 'skinny',
  /* Practice-chunks work order, 2026-09-19, item 3s — the nine sample
     phrases named in the work order (added as permanent guards whether or
     not this sweep's own content still has them) plus every additional
     idiom/figurative phrase the five Phase 3 content agents actually found
     and reworded in Modules 2–6 and class-activities.js. Deliberately NOT
     banning "two homes" or "top of the ladder" — content agents reworded
     one instance of each, but both turned out to be established,
     deliberately-defined site-wide terms predating this sweep (module-5/7/
     11's "Two Homes for F"; i18n.js's own tools.ladderMax metronome-ladder
     string and its module-4/6 companions — numbers as of the 2026-10-12
     Modules 4/5 swap), the same innocent-twin situation
     1w2's whitelist exists for. */
  'nine times out of ten', 'a hair toward the wire', 'park on just g5', 'park on the slide',
  'play it cold', 'read a lick cold', 'what will eat most of your practice time',
  'line them up like soldiers', 'disappear into it', 'pass line 100 bpm', 'rung 4',
  'read it cold', 'sight-read it cold', 'hearing it cold', 'park on just the f',
  "that one's free", 'trip up the neck', 'driving riff',
  'carries the whole job', 'holding the two bars out', 'the module bar', 'on call',
  'cold read', 'cold-read', 'feels like a punchline', 'parked in one place',
  'rushed at first, then locked in', 'runs on autopilot', 'test the names cold',
  /* Content-style backlog, 2026-09-26/27 follow-up sweep. "lives in/on/at/
     around/inside" and "live in/on/at/around" describe which string, key,
     fret or box a note/chord/riff belongs to using a figurative verb where
     the site's own convention elsewhere is the literal "is on/in" — ~45
     instances reworded across Modules 2, 4–12, class-activities.js and the
     Journey pages. Deliberately NOT banning "home"/"feels like home"/"home
     to <chord>" — that's a separate, established teaching device for the
     TONIC (module-11's "home chord" unit, mirrored by "back home to Am" in
     module-9/11 and the Watchtower Journey page), not this pattern; banning
     it would also hit "two homes", which 1w already carves out. "owns
     the"/"own the" is the matching verb for finger/string responsibility
     ("which finger owns the root note"); "rock-steady", "stay parked",
     "still fighting" and "rattle off" are single-family idioms found the
     same sweep. */
  'lives in', 'lives on', 'lives at', 'lives around', 'lives inside',
  'live in', 'live on', 'live at', 'live around',
  'owns the', 'own the',
  'rock-steady', 'stay parked', 'still fighting', 'rattle off',
  /* Language pass, 2026-10-25. The preposition list above let the same
     verb through with any other word after it — "the octave lives two
     strings toward the floor", "the intro lives up high", "the ball end
     lives under the bridge", "Part A lives down low", "a line living
     entirely at fret 5", "where each note lives" (i18n), "Where do IV and V
     live?" — eight found and reworded to is / goes / stays. So the bare
     verb is banned now: no student text uses "lives" or "living" in any
     other sense. Plain "live" stays legal ("live quiz", "Try it live"); its
     figurative prepositions are still listed above. "parked" joined for the
     same reason as "stay parked": "hand parked in 5th position", "parked at
     the semester's highest position" (both Journey pages). The Spanish twin
     ("la octava vive…") is SLANG_PHRASES_ES, below. "stays put" (seven
     uses, Modules 1, 4, 8, 9, 13 — "the guitar stays put on your leg")
     joined the same day: its Spanish twins were already the literal "se
     queda quieta / en su lugar", so English now says "stays still / in
     place" too. */
  'lives', 'living', 'parked', 'stays put', 'stay put',
];
/* Reviewed occurrences that stay, matched at their exact position the way
   TEACHER_PHRASE_ALLOW is. None today: the one entry (module-9.js's m9w3
   sight-reading card, "It lives entirely at frets 5–10") was reworded on
   2026-10-25. An unused entry only stands ready to excuse a new one, so add
   one only for a phrase that is genuinely right where it is. */
const SLANG_ALLOW = [];
/* Spanish figurative "vive / viven" for where a note, riff or chord sits —
   the twin of 'lives' above (eight found 2026-10-25: "la bolita vive debajo
   del puente", "¿Dónde viven el IV y el V?", "el riff vive en el mismo
   mundo…"). Matched on the accent-folded, lower-cased value with Unicode
   word edges, so "en vivo" and "vivir" are not hits. Read from every `_es`
   value, the es: side of i18n.js and every data-es attribute. */
const SLANG_PHRASES_ES = ['vive', 'viven'];
const SLANG_ALLOW_ES = [];   // none today — see SLANG_ALLOW
/* Hoisted to module scope so 1y can sweep exit-check item labels with the
   exact same list — 1w's own FIELD_RE has no `label`, and widening it would
   re-scan every module step label. matchAll clones the regex, so sharing one
   /g instance across checks carries no lastIndex state between them. */
const SLANG_RE = new RegExp(
  '\\b(?:' + SLANG_PHRASES.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b',
  'gi');
/* Single-line field regexes. 1w and 1w-t no longer use these for module
   content (they read through readFieldStrings, below, since 2026-10-12);
   1bc/1bd still do. `choices` was the first ARRAY field — until 2026-09-20
   neither check could see inside it, which is how a banned phrase in an
   answer choice shipped while the identical phrase in its `explain` failed
   the push; `caption` and `label` joined 2026-09-26 (module-9.js's TAB
   cards shipped "cold-read" invisibly in both). The STUDENT_CHOICES_RE /
   STUDENT_CAPTION_RE line regexes were retired with the switch. */
const STUDENT_FIELD_RE =
  /\b(text|hint|stuck|levelUp|gotItWhen|explain|forward|subtitle|meta|intro|note|prompt|placeholder):\s*'((?:\\.|[^'\\])*)'/g;
const STUDENT_I18N_EN_RE = /\ben:\s*(?:'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)")/g;
const STUDENT_I18N_ES_RE = /\bes:\s*(?:'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)")/g;
const STUDENT_LABEL_RE = /\blabel:\s*'((?:\\.|[^'\\])*)'/g;

/* ════════════════════════════════════════════════════════════════════
   Shared value reader for 1w, 1w-t and 1bp (2026-10-12). The line regexes
   above only see a SINGLE-quoted value that opens and closes on ONE line,
   so until this date 1w and 1w-t never read:
     · a `choices: [` array whose elements sit on their own lines — about
       50 of them, nearly all graded "Watch:" MCs in Modules 1–8;
     · `assessItems` / `assessItems_es` (the Module Review's assessment
       list, app.js renderModuleReview) and exit-check `items`;
     · a double-quoted or template-literal value — module-13.js's nine
       `text: \`…\`` restringing cards.
   module-7.js's "Buzz a little — that's normal for this shape" sat in a
   multi-line choices array with 1w-t green because of exactly this.

   readJsString is 1bp's reader, hoisted so all three share one. The
   source is comment-stripped, then every string's CONTENTS are masked
   (maskJsStrings), so a field name is only matched in code — never inside
   another value's text. Each value is read as one literal plus any
   `+ 'literal'` pieces chained after it, or as every literal at any depth
   inside an array. Each piece reports its OWN line, and a piece reachable
   twice (a `label:` inside an `items:` array) is read once.
   ════════════════════════════════════════════════════════════════════ */
const readJsString = (src, i) => {   // src[i] is the opening quote
  const end = skipStringOrComment(src, i);
  return { text: unescapeJs(src.slice(i + 1, end - 1)), end };
};
function maskJsStrings(src) {
  let out = '';
  for (let i = 0; i < src.length; ) {
    const c = src[i];
    if (c === "'" || c === '"' || c === '`') {
      const end = Math.min(skipStringOrComment(src, i), src.length);
      out += c + src.slice(i + 1, end - 1).replace(/[^\n]/g, ' ') + src.slice(Math.max(i + 1, end - 1), end);
      i = end; continue;
    }
    out += c; i++;
  }
  return out;
}
const lineLookup = src => {
  const nl = [];
  for (let i = 0; i < src.length; i++) if (src.charCodeAt(i) === 10) nl.push(i);
  return idx => { let lo = 0, hi = nl.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (nl[mid] < idx) lo = mid + 1; else hi = mid; } return lo + 1; };
};
const isQuote = c => c === "'" || c === '"' || c === '`';
/* Every string value of every field whose name nameRe (global, group 1 =
   the field name, match ending at the value) finds in `file`. Returns
   [{ field, line, text }] with 1-based lines, or null if the file is
   missing. */
function readFieldStrings(file, nameRe) {
  let src;
  try { src = stripJsComments(readFileSync(join(ROOT, file), 'utf8')); } catch { return null; }
  const masked = maskJsStrings(src), lineAt = lineLookup(src), seen = new Set(), out = [];
  const take = (field, i) => {
    const s = readJsString(src, i);
    if (!seen.has(i)) { seen.add(i); out.push({ field, line: lineAt(i), text: s.text }); }
    return s.end;
  };
  for (const m of masked.matchAll(nameRe)) {
    const field = m[1];
    let i = m.index + m[0].length;
    if (isQuote(masked[i])) {
      for (;;) {                                 // a literal, then any `+ literal` / `+ NAME` chain
        let j = take(field, i), next = -1;
        for (;;) {
          const plus = /^\s*\+\s*/.exec(masked.slice(j, j + 200));
          if (!plus) break;
          j += plus[0].length;
          if (isQuote(masked[j])) { next = j; break; }
          const id = /^[A-Za-z_$][\w$]*/.exec(masked.slice(j, j + 200));
          if (!id) break;
          j += id[0].length;
        }
        if (next < 0) break;
        i = next;
      }
    } else if (masked[i] === '[') {
      for (let depth = 0; i < src.length; i++) {
        const c = masked[i];
        if (isQuote(c)) { i = take(field, i) - 1; continue; }
        if (c === '[') depth++;
        else if (c === ']' && --depth === 0) break;
      }
    }
  }
  return out;
}
/* The student-facing fields 1w and 1w-t read in module files and
   class-activities.js: STUDENT_FIELD_RE's names plus label and caption
   (the line regexes above), and the array fields. Joined 2026-10-12, as
   every English field that has a Spanish `_es` twin somewhere in the
   content (so it renders to students) but that neither check read:
   title, unit, skillFocus, name, module, checklistSub, tabTitle, tabSub,
   repLabel, bassDirections. */
const STUDENT_VALUE_NAME_RE = new RegExp(
  '\\b(text|hint|stuck|levelUp|gotItWhen|explain|forward|subtitle|meta|intro|note|prompt|placeholder|' +
  'label|caption|title|unit|skillFocus|name|module|checklistSub|tabTitle|tabSub|repLabel|bassDirections|' +
  'choices|choices_es|assessItems|assessItems_es|items|rowLabels|rowLabels_es)(?:_power)?\\s*:\\s*', 'g');   // `_power`: the chord-version twin (caView)
/* The JS files 1w and 1w-t read values from: the module content, class
   activities and — since 2026-10-12 — config-main.js, whose MODULE_MANIFEST
   `name` / `name_es` are the module titles students see on every page (and
   whose WARMUP_BANK keeps label/text twins ready to switch back on). 1bp
   already read it; 1w and 1w-t did not. */
const STUDENT_VALUE_FILES = [...MODULE_FILES, 'class-activities.js', 'config-main.js'];
function checkSlangPhrasing() {
  head('1w. Slang and figurative phrasing in student-facing text');
  const RE = SLANG_RE;
  let bad = 0;
  const flag = (file, li, phrase) => {
    err(`${file}:${li + 1} — "${phrase}"`);
    problems++; bad++;
  };

  /* The shell, 404 and Journey pages — English text only. Blanking each
     data-es="…" and each comment in place (spaces, newlines kept) leaves
     every line number correct. */
  for (const file of STUDENT_HTML_PAGES()) {
    let raw;
    try { raw = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
    htmlEnglishLines(raw).forEach((line, li) => {
      for (const m of line.matchAll(RE)) flag(file, li, m[0]);
    });
  }

  /* Module content, class activities and config-main.js
     (STUDENT_VALUE_FILES) — the EN authoring fields only.
     Matched against the UNESCAPED value: a regex-captured field is still raw
     source text (e.g. "that one\'s free"), and a banned phrase containing an
     apostrophe can never match that raw form. Also scans `caption` and
     nested `label` (a tab/playSeq heading, not a step/Challenge title) —
     found missing 2026-09-26 when module-9.js's TAB cards shipped "cold-read"
     and "read it cold" invisibly in both. */
  /* Read through readFieldStrings (2026-10-12): every quote style, every
     element of a multi-line array, each on its own line — see the shared
     reader above. Values arrive unescaped: the raw capture kept `\'`, so a
     phrase with an apostrophe ("that one's free") could never match a
     single-quoted field — see the 1w-t note on the same fix (2026-09-25). */
  let read = 0;
  for (const file of STUDENT_VALUE_FILES) {
    const vals = readFieldStrings(file, STUDENT_VALUE_NAME_RE);
    if (!vals) continue;
    for (const v of vals) {
      read++;
      const value = straightQuotes(v.text), lower = value.toLowerCase();
      for (const m of value.matchAll(RE)) {
        if (SLANG_ALLOW.some(a => a.file === file && lower.startsWith(a.phrase, m.index))) continue;
        flag(file, v.line - 1, m[0]);
      }
    }
  }
  if (read === 0) { err('1w read no module values — the field reader has gone blind'); problems++; bad++; }

  /* i18n.js — the en: side of each key. Curly apostrophes straightened
     (straightQuotes, below): i18n.js writes ’ in ~70 en values. */
  try {
    readFileSync(join(ROOT, 'i18n.js'), 'utf8').split('\n').forEach((line, li) => {
      for (const e of line.matchAll(STUDENT_I18N_EN_RE))
        for (const m of straightQuotes(unescapeJs(e[1] ?? e[2] ?? '')).matchAll(RE)) flag('i18n.js', li, m[0]);
    });
  } catch { /* checked elsewhere */ }

  /* Spanish (2026-10-25) — SLANG_PHRASES_ES on the folded value, the same
     three sources 1w-t's Spanish sweep reads. */
  const RE_ES = new RegExp('(?<![\\p{L}\\p{N}])(?:' + SLANG_PHRASES_ES.join('|') + ')(?![\\p{L}\\p{N}])', 'gu');
  let esRead = 0;
  const sweepEs = (file, li, text) => {
    esRead++;
    const folded = foldEs(text);
    for (const m of folded.matchAll(RE_ES)) {
      if (SLANG_ALLOW_ES.some(a => a.file === file && folded.startsWith(a.phrase, m.index))) continue;
      flag(file, li, m[0]);
    }
  };
  for (const file of STUDENT_VALUE_FILES)
    for (const v of readFieldStrings(file, ES_VALUE_NAME_RE) || []) sweepEs(file, v.line - 1, v.text);
  for (const file of STUDENT_HTML_PAGES()) {
    let raw;
    try { raw = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
    for (const v of htmlDataEsValues(raw)) sweepEs(file, v.line - 1, v.text);
  }
  try {
    readFileSync(join(ROOT, 'i18n.js'), 'utf8').split('\n').forEach((line, li) => {
      for (const e of line.matchAll(STUDENT_I18N_ES_RE)) sweepEs('i18n.js', li, unescapeJs(e[1] ?? e[2] ?? ''));
    });
  } catch { /* checked elsewhere */ }
  if (esRead === 0) { err('1w read no Spanish values — the Spanish sweep has gone blind'); problems++; bad++; }

  if (bad === 0) ok(`no banned slang phrases in student-facing text (${read} module values read, ${esRead} Spanish values)`);
}

/* ════════════════════════════════════════════════════════════════════
   1w-t. TEACHER SPEAK IN STUDENT-FACING TEXT — the jargon-cut work order
   (2026-09-23) rewrote 433 hits of lesson-plan language across the site:
   edu-words (self-assessment, benchmark lap, Identify/Demonstrate/Apply),
   poster talk ("slow and clean is better than fast and buzzy, every
   time", "That's completely fine:", "Don't worry"), why-this-matters
   asides, abstract nouns (a deliberate musical decision, phrasing
   strategy, confident level) and vague prompts (How did it go?). This
   guards a relapse of the exact phrases that sweep retired.

   Shares 1w's own reader and field list (readFieldStrings with
   STUDENT_VALUE_NAME_RE; STUDENT_I18N_EN_RE for i18n.js) rather than a
   second copy. Since 2026-10-12 it also reads Spanish — see
   TEACHER_PHRASES_ES below.

   Hidden sections are exempt, the same way the audit itself excluded
   them: kind:tuning-warmup / routine / ear-spark / reflection, every
   take-to-song section while app.js's TAKE_TO_SONG_ENABLED is false (it
   was only modules 1–5, the Journey link card, before 2026-10-18), and
   any individual step with hidden:true. This walks the REAL
   parsed SETS objects (the same ones 1af/1ao already load in
   renderCheck) rather than raw text, so it can tell a hidden step's
   field value from a visible one — collectHiddenStrings() builds the
   set of every hidden step's field values, and a text-sweep match is
   skipped when its captured field value is one of them.

   The word "assessment" itself is not banned — Decision 1 kept it,
   framed as preparation ("(assessment preparation)"), so only the
   specific retired phrases below are guarded, not the word.
   ════════════════════════════════════════════════════════════════════ */
const TEACHER_PHRASES = [
  'self-assessment', 'assessment piece', 'benchmark lap', 'next layer of learning',
  'answer in a frame', 'better than fast and', "that's completely fine", 'totally normal',
  /* Widened from "that's normal!" 2026-10-11, with the four entries after
     it: the 2026-10-11 Modules 6–8 audit found the same reassurance class
     six more times in module-7.js's barre cards ("If your hand cramps,
     that's normal", "Cramping is normal;" twice, "Short tries are better
     than one long tiring session", "...better than one long, tiring
     session") plus "that's normal.)" on the Sweet Child intro. Say the
     action ("If your hand cramps, shake it loose") and drop the comfort.
     "better than one long rushed session" still appears in the Modules 1–5
     practice-routine hints, which are kind:'routine' (hidden) and so exempt.
     Narrowed 2026-10-11 (review): bare 'better than one long' also hit the
     musical "two short notes sound better than one long note", so it now
     names the session — the exact shapes the audit found, plus the
     routine's. A phrase ending in "normal" gets a closing \b when the
     regex is built (TEACHER_RE below), so "That's normally played..." is
     not a hit; that is also what let 'is normal;' / 'is normal.' widen to
     plain 'is normal' ("Buzz is normal, so...", "is normal at first"). Its
     one innocent use is allowlisted: module-13's "Restringing a guitar is
     normal maintenance". */
  "that's normal", 'cramping is normal', 'is normal',
  'better than one long session', 'better than one long tiring',
  'better than one long, tiring', 'better than one long rushed',
  /* Same class, 2026-10-11: m6w1's upstroke hint opened "It's normal for
     upstrokes to feel weaker at first." — the only use on the site, now
     reworded to the action ("Play the upstrokes lighter..."). Not bare
     "it's normal": that would hit module-10's innocent "it's normally used". */
  "it's normal for", "it's normal to",
  "you've got this", 'it will feel easy', 'confident level',
  'confident volume', 'confident pluck', 'nafme', "don't worry", "it's okay if",
  'trust the', 'quality first', 'quality over speed', 'make them your own',
  /* Widened from 'a stepping stone' 2026-09-27: the article-only match let
     module-6.js's bare step labels "Stepping stone 1 — one gap" / "...2 —
     the hard gap" ship invisibly (found in the content-style backlog
     follow-up sweep; those labels were reworded to "Rhythm step N" in the
     same sweep). Matches with or without the article now. */
  'stepping stone', "that's the point", 'phrasing strateg', 'tone parameters',
  'deliberate musical', 'expressive tool', 'i can demonstrate', 'in your own words',
  'pause and think',
];
/* "every time." after a comparison — the "slow and X is better than fast and
   Y, every time." maxim family. Matched as its own pattern since it needs the
   trailing period, not folded into the plain-substring list above. */
const TEACHER_MAXIM_RE = /\bbetter than fast and \w+,?\s*every time\./gi;
/* Anchored to the START of a field's own value (not the line) — a field that
   OPENS with a standards-verb, not one that merely contains the word
   somewhere (a step can legitimately use "identify" mid-sentence as an
   ordinary verb; it's the checklist-style opening that's the tell). */
const TEACHER_PREFIXES = [/^Demonstrate /, /^Apply /, /^Identify /];
const TEACHER_RE = new RegExp(
  '\\b(?:' + TEACHER_PHRASES.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + (/normal$/.test(p) ? '\\b' : '')).join('|') + ')',
  'gi');
/* 'trust the' guards the "trust the process" reassurance maxim, but it has
   real innocent twins — pointing a student at a tuner needle or a printed
   fret number is a literal instruction, not a pep-talk aside, and module-7's
   "Trust the one with the highest star rating" is a practice-MC DISTRACTOR
   about vetting TABs online, not reassurance to the reader at all (it's the
   wrong answer, being rejected by the card's own `explain`). Same shape as
   MC_CATCHALL_ALLOW / MC_LEAK_ALLOW: an allowlist entry excuses one
   verified-innocent occurrence, not the phrase everywhere else. Matched by
   exact position (`lower.startsWith(phrase, m.index)`), not "the value
   merely contains it somewhere", so a second, genuinely bad "trust the"
   later in the same field still fails the push. */
const TEACHER_PHRASE_ALLOW = [
  { file: 'module-1.js', phrase: 'trust the needle' },
  /* 'trust the fret numbers' (module-2.js) removed 2026-10-12: no such text
     was left anywhere, so the entry only stood ready to excuse a new one.
     The star-rating choice is scoped to `choices` — it is the distractor,
     and the same words in a hint or step text would be advice. */
  { file: 'module-7.js', field: 'choices', phrase: 'trust the one with the highest star rating' },
  /* A plain fact about guitars, not comfort to the reader. */
  { file: 'module-13.js', phrase: 'is normal maintenance' },
  /* m7w3's keyed MC offers "Buzz a little — that's normal for this shape"
     as a WRONG answer (the beginner belief being rejected, and the best
     distractor on the card). Removed 2026-10-11 while it was dead (the
     multi-line choices array was unread, and the bare file+phrase entry
     excused the phrase in every other module-7.js value); back 2026-10-12
     now that readFieldStrings reads that array — scoped by `field` this
     time, so only an answer CHOICE may say it. The Spanish twin is in
     TEACHER_PHRASE_ALLOW_ES. */
  { file: 'module-7.js', field: 'choices', phrase: "that's normal for this shape" },
  /* m2w2 Challenge 3's "(your low-E assessment piece)" label is frozen —
     Module 2 is in rule-zero-proof.mjs's FROZEN_THROUGH regime, where a step
     LABEL must match the base commit BYTE-FOR-BYTE by index (a rename would
     hide an insertion from that proof). Decision 1's "(assessment
     preparation)" retitle can't ship here until progress resets: raising
     FROZEN_THROUGH only freezes MORE modules, it never unlocks Module 2 —
     see CLAUDE.md's "Summer reset list". Scoped to `label` (2026-10-12):
     the frozen use is a step label, and the phrase in any text, hint or
     got-it is new. (The Seven Nation Army Challenge's "(your A-string
     assessment piece)" sits in a take-to-song section, which Modules 1–5
     render as the Journey card, so it is exempt as hidden, not by this.) */
  { file: 'module-2.js', field: 'label', phrase: 'assessment piece' },
];

/* Spanish reassurance (2026-10-12). 1w-t read English only, so the
   Spanish twin of every retired comfort line could survive its English
   fix: the pentatonic "Compose It in Scale Degrees" Challenge 2 hint
   (module-5.js since the 2026-10-12 swap; module-4.js when found) said
   "Simple is fine." / "Está bien si es simple." Each phrase was checked
   against every Spanish value in the site before it went in:
     · 'es normal' — one use, module-7's deliberate wrong-answer choice
       (allowlisted below by file + field). A closing boundary keeps
       "normalmente" clear.
     · 'totalmente normal' — the twin of 'totally normal'; no uses.
     · 'no te preocupes' — "don't worry"; no uses.
     · 'está bien si' — "it's okay if"; one use (that hint, reworded).
       Plain "está bien" is NOT banned: "Está bien puesto cuando…" (the
       latency slider) and "…está bien — presionar Tocar el tab… no lo
       está" (a rule about what is allowed) are literal.
     · 'tú puedes' — "you've got this", but ONLY where it ends a sentence
       ("¡Tú puedes!"): "Tú puedes elegir…" is an ordinary verb phrase.
   Matched on the accent-folded, lower-cased value (so "esta bien si" and
   "tu puedes" typed without accents are caught too), with Unicode-aware
   word edges — \b would treat "á" as a boundary. Read from every `_es`
   value in the module files, class-activities.js and config-main.js
   (readFieldStrings over STUDENT_VALUE_FILES), the `es:` side of i18n.js,
   and every data-es="…" on index.html, 404.html and the Journey pages
   (htmlDataEsValues). */
const TEACHER_PHRASES_ES = ['es normal', 'totalmente normal', 'no te preocupes', 'esta bien si'];
const foldEs = s => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const TEACHER_RE_ES = new RegExp(
  '(?<![\\p{L}\\p{N}])(?:' + TEACHER_PHRASES_ES.join('|') + '|tu puedes(?=\\s*(?:[!.?…]|$)))(?![\\p{L}\\p{N}])', 'gu');
const TEACHER_PHRASE_ALLOW_ES = [
  /* m7w3's keyed MC — the Spanish twin of the English entry above. */
  { file: 'module-7.js', field: 'choices_es', phrase: 'es normal en esta forma' },
];
const ES_VALUE_NAME_RE = /\b([A-Za-z0-9]+(?:_power)?_es)\s*:\s*/g;   // `_power_es`: the chord-version twin (caView)

const HIDDEN_SECTION_KINDS = new Set(['routine', 'ear-spark', 'reflection']);
/* app.js's TAKE_TO_SONG_ENABLED (false since 2026-10-18): off, a take-to-song
   section renders in NO module — neither the Journey card (1–5) nor its own
   steps (6–12). Read through the sandbox so 1w-t, 1af and 1ao judge the same
   switch the real renderer does; null = the constant is gone. */
const readTakeToSongSwitch = ctx => {
  try { const v = vm.runInContext('TAKE_TO_SONG_ENABLED', ctx); return typeof v === 'boolean' ? v : null; }
  catch { return null; }
};
const HIDDEN_STEP_FIELDS = [
  'text', 'hint', 'stuck', 'levelUp', 'gotItWhen', 'explain', 'label',
  'prompt', 'placeholder', 'meta', 'note', 'forward', 'subtitle', 'intro',
];
/* Keyed by FILE + value (2026-10-11 review): keyed by value alone, a
   verbatim copy of a hidden routine hint pasted into a visible card in any
   file was exempt too. A set's file is module-<moduleNum>.js — every
   module file defines only its own module's sets. */
const hiddenKey = (file, value) => `${file}\u0000${value}`;
function collectHiddenStrings(sets, journeySongsFor, takeToSongOn) {
  const out = new Set();
  let file = '';
  const add = v => out.add(hiddenKey(file, v));
  const addObj = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const f of HIDDEN_STEP_FIELDS) {
      if (typeof obj[f] === 'string') add(obj[f]);
      if (typeof obj[f + '_es'] === 'string') add(obj[f + '_es']);
    }
    for (const sub of [obj.response, obj.practice]) {
      if (!sub || typeof sub !== 'object') continue;
      for (const f of ['prompt', 'explain', 'placeholder']) {
        if (typeof sub[f] === 'string') add(sub[f]);
        if (typeof sub[f + '_es'] === 'string') add(sub[f + '_es']);
      }
      for (const f of ['choices', 'choices_es']) {
        if (Array.isArray(sub[f])) sub[f].forEach(c => { if (typeof c === 'string') add(c); });
      }
    }
  };
  const isTuning = (sec, moduleNum) => moduleNum !== 1 && sec.kind === 'tuning-warmup';
  for (const w of sets) {
    file = `module-${w.moduleNum}.js`;
    for (const stId of ['b', 'c']) {
      const stn = w.stations && w.stations[stId];
      if (!stn || !(stn.sections && stn.sections.length)) continue;   // single-flow stations hide nothing
      for (const sec of stn.sections) {
        if (isTuning(sec, w.moduleNum) || HIDDEN_SECTION_KINDS.has(sec.kind)) {
          (sec.steps || []).forEach(addObj);
          continue;
        }
        if (sec.kind === 'take-to-song' && (takeToSongOn === false || journeySongsFor(w.moduleNum).length > 0)) {
          (sec.steps || []).forEach(addObj);   // switched off (every module), or the Journey card renders instead — steps invisible
          continue;
        }
        (sec.steps || []).forEach(st => { if (st.hidden) addObj(st); });
      }
    }
  }
  return out;
}
/* The naive unescape 1w-t needs to compare a regex-captured field value
   (raw source text, backslash-escapes intact) against the same string as
   parsed by the vm sandbox (real characters) — these files only ever use
   \' \" \\ \n inside single-quoted strings, so a generic \X → X pass plus
   the \n special case covers every field this check reads. */
const unescapeJs = s => s.replace(/\\n/g, '\n').replace(/\\(.)/g, '$1');
/* Curly apostrophes read as straight ones before a phrase match
   (2026-10-11 review): i18n.js writes ’ in ~70 en values, and "that’s
   normal" there slipped past a list spelled with '. One char for one char,
   so a match index still lines up with the original value. */
const straightQuotes = s => s.replace(/[‘’]/g, "'");
/* ONE HTML-entity decoder for every check that reads HTML or an i18n/_es
   value as text (1w-t, 1bp). Hoisted 2026-10-12 the way readJsString was:
   each check had its own private copy and they had drifted — only 1w-t's
   knew &iexcl; / &iquest;. &amp; goes last, so "&amp;nbsp;" decodes to the
   text "&nbsp;", not to a space. */
const decodeHtmlEntities = s => s
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&iexcl;/g, '¡').replace(/&iquest;/g, '¿')
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&amp;/g, '&');
/* The HTML pages 1w and 1w-t read (2026-10-12): the shell and 404 page as
   well as the Journey pages — 1bp already read all three, 1w/1w-t only the
   Journey pages, so a phrase on index.html or 404.html shipped unread. */
const STUDENT_HTML_PAGES = () => ['index.html', '404.html', ...TAB_PAGES.filter(f => f.endsWith('.html'))];
/* HTML comments blanked in place (newlines kept, so a match index still
   gives the right line) — a developer note is not student text. */
const blankHtmlComments = raw => raw.replace(/<!--[\s\S]*?-->/g, c => c.replace(/[^\n]/g, ' '))
  /* …and a block comment inside an inline <script> (2026-10-25): 404.html's
     note on GitHub Pages paths ("the site lives one segment deep") is a
     developer note too. Only the comments are blanked — the script's own
     strings are still read. */
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, s => s.replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ' ')));
/* A page's English text, line by line: comments and every data-es="…"
   attribute blanked in place, curly apostrophes straightened. */
const htmlEnglishLines = raw =>
  straightQuotes(blankHtmlComments(raw).replace(/data-es="[^"]*"/g, m => m.replace(/[^\n]/g, ' '))).split('\n');
/* Every data-es="…" value on a page, decoded, with its 1-based line. Matched
   over the WHOLE page, not line by line: a value that wraps (the six Journey
   "Mapa de la canción" songmap paragraphs) never matches a per-line regex. */
const htmlDataEsValues = raw => {
  const src = blankHtmlComments(raw), lineAt = lineLookup(src);
  return [...src.matchAll(/\bdata-es="([^"]*)"/g)].map(m => ({ line: lineAt(m.index), text: decodeHtmlEntities(m[1]) }));
};

function checkTeacherSpeak(sets, journeySongsFor, takeToSongOn) {
  head('1w-t. Teacher speak in student-facing text');
  const hidden = sets && journeySongsFor ? collectHiddenStrings(sets, journeySongsFor, takeToSongOn) : new Set();
  if (!sets || !journeySongsFor) warn('1w-t: no parsed SETS available — hidden-section exemption skipped this run');
  let bad = 0;
  const flag = (file, li, phrase) => { err(`${file}:${li + 1} — "${phrase}"`); problems++; bad++; };
  /* Match the UNESCAPED value (2026-09-25). The raw capture keeps `\'`,
     so every banned phrase with an apostrophe — "don't worry", "it's okay
     if", "that's the point", "you've got this" — could never match a
     single-quoted field, and a live "Don't worry about pressing any frets
     yet" sat in Module 1's first strum card with this check green. */
  /* `parsed` is the real string (readFieldStrings unescapes); `field` lets
     an allowlist entry be scoped to one field, not the whole file. */
  const sweepParsed = (file, li, parsed, field) => {
    if (hidden.has(hiddenKey(file, parsed))) return;
    const value = straightQuotes(parsed);
    const lower = value.toLowerCase();
    const allowed = (a, at) => a.file === file && (!a.field || a.field === field) && lower.startsWith(a.phrase, at);
    for (const m of value.matchAll(TEACHER_RE)) {
      if (TEACHER_PHRASE_ALLOW.some(a => allowed(a, m.index))) continue;
      flag(file, li, m[0]);
    }
    for (const m of value.matchAll(TEACHER_MAXIM_RE)) flag(file, li, m[0]);
    for (const re of TEACHER_PREFIXES) if (re.test(value)) flag(file, li, value.slice(0, 20) + '…');
  };
  const sweepValue = (file, li, raw) => sweepParsed(file, li, unescapeJs(raw), null);
  /* Spanish: the folded value keeps one char per char of the original only
     after folding, so the allowlist is matched on the folded value too. */
  let esRead = 0;
  const sweepEs = (file, li, parsed, field) => {
    esRead++;
    if (hidden.has(hiddenKey(file, parsed))) return;
    const folded = foldEs(parsed);
    for (const m of folded.matchAll(TEACHER_RE_ES)) {
      if (TEACHER_PHRASE_ALLOW_ES.some(a => a.file === file && (!a.field || a.field === field) && folded.startsWith(a.phrase, m.index))) continue;
      flag(file, li, m[0]);
    }
  };
  /* The shell, 404 and Journey pages (STUDENT_HTML_PAGES, 2026-10-12 — the
     Journey pages only, before). English per line; Spanish over the whole
     page, because a data-es value that wraps onto a second line never
     matched the per-line regex this used to run — the six Journey songmap
     paragraphs went unread that way (htmlDataEsValues). */
  for (const file of STUDENT_HTML_PAGES()) {
    let raw;
    try { raw = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
    htmlEnglishLines(raw).forEach((line, li) => {
      for (const m of line.matchAll(TEACHER_RE)) flag(file, li, m[0]);
      for (const m of line.matchAll(TEACHER_MAXIM_RE)) flag(file, li, m[0]);
    });
    for (const v of htmlDataEsValues(raw)) sweepEs(file, v.line - 1, v.text, 'data-es');
  }

  /* Every value through readFieldStrings (2026-10-12): multi-line arrays,
     assessItems, exit-check items and template literals included. */
  let read = 0;
  for (const file of STUDENT_VALUE_FILES) {
    for (const v of readFieldStrings(file, STUDENT_VALUE_NAME_RE) || []) { read++; sweepParsed(file, v.line - 1, v.text, v.field); }
    for (const v of readFieldStrings(file, ES_VALUE_NAME_RE) || []) sweepEs(file, v.line - 1, v.text, v.field);
  }
  if (read === 0) { err('1w-t read no module values — the field reader has gone blind'); problems++; bad++; }

  try {
    readFileSync(join(ROOT, 'i18n.js'), 'utf8').split('\n').forEach((line, li) => {
      for (const e of line.matchAll(STUDENT_I18N_EN_RE)) sweepValue('i18n.js', li, e[1] ?? e[2] ?? '');
      for (const e of line.matchAll(STUDENT_I18N_ES_RE)) sweepEs('i18n.js', li, unescapeJs(e[1] ?? e[2] ?? ''), 'es');
    });
  } catch { /* checked elsewhere */ }
  if (esRead === 0) { err('1w-t read no Spanish values — the Spanish sweep has gone blind'); problems++; bad++; }

  if (bad === 0) ok(`no banned teacher-speak phrases in student-facing text (${read} module values in English, ${esRead} Spanish values)`);
}

/* ════════════════════════════════════════════════════════════════════
   1w2. JOURNEY LICK LABELS NAME THE SHAPE — the 12 "Lick N — …" tab
   cards across the six Song Journey pages used to carry a nickname
   each ("the taunt", "the dive", "the wail", "the run-up", "the
   roll-down", "the sigh", "the reach", "the lift", "the fall", "the
   climb", "the answer"). Twelve names for what are really only four
   shapes — and one of them was wrong: luna's "the fall" is the same
   down-then-back-up figure as "the roll-down" and "the taunt", not a
   fall. Renamed 2026-09-08 so a student who learns "ascending lick"
   on one page recognises it on the next.

   A free-text ban can't guard this: "the reach" is also a Finger Gym
   event and "the climb"/"the fall" are ordinary words elsewhere on
   these very pages. So pin it positively instead — every lick label
   must use one of the four approved descriptors, in both languages,
   and the total is pinned so a card can't quietly disappear.
   ════════════════════════════════════════════════════════════════════ */
const LICK_LABELS_EN = ['down and back up', 'ascending lick', 'descending lick', 'the slide-in'];
const LICK_LABELS_ES = ['baja y vuelve a subir', 'lick ascendente', 'lick descendente', 'el deslizado'];
const LICK_CARD_COUNT = 12;
function checkJourneyLickLabels() {
  head('1w2. Journey lick labels name the shape');
  const TITLE_RE = /<span class="tab-title"[^>]*data-es="([^"]*)"[^>]*>([^<]*)</g;
  const descriptor = s => s.replace(/^Lick \d+ —\s*/, '').split('&middot;')[0].trim();
  let bad = 0, seen = 0;
  for (const file of TAB_PAGES.filter(f => f.endsWith('.html'))) {
    let raw;
    try { raw = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
    raw.split('\n').forEach((line, li) => {
      for (const m of line.matchAll(TITLE_RE)) {
        const [es, en] = [m[1], m[2]];
        if (!/^Lick \d+ —/.test(en)) continue;
        seen++;
        const dEn = descriptor(en), dEs = descriptor(es);
        if (!LICK_LABELS_EN.includes(dEn)) {
          err(`${file}:${li + 1}: lick label "${dEn}" is not one of ${LICK_LABELS_EN.map(s => `"${s}"`).join(', ')} — name the shape, not a nickname`);
          problems++; bad++;
        }
        if (!LICK_LABELS_ES.includes(dEs)) {
          err(`${file}:${li + 1}: Spanish lick label "${dEs}" is not one of ${LICK_LABELS_ES.map(s => `"${s}"`).join(', ')}`);
          problems++; bad++;
        }
      }
    });
  }
  if (seen !== LICK_CARD_COUNT) {
    err(`expected ${LICK_CARD_COUNT} "Lick N — …" cards across the Journey pages, found ${seen}`);
    problems++; bad++;
  }
  if (bad === 0) ok(`${seen} Journey lick labels name their shape in both languages`);
}

/* ════════════════════════════════════════════════════════════════════
   1i. WATCH-RANGE LABELS ↔ URL TIME PARAMS — lesson links carry a
   "(M:SS–M:SS)" label (inside the anchor text or right after </a>)
   telling students what part of the video the card uses, and the URL
   often carries t=/start=(&end=) doing the seek. Editing one without
   the other shipped 20 stale labels across two sweeps; this pins them
   together. A label with no time param must start at 0:00.
   ════════════════════════════════════════════════════════════════════ */
function checkWatchRanges() {
  head('1i. Watch-range labels match URL time params');
  const toSec = (m, s) => Number(m) * 60 + Number(s);
  const fmt = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  const RANGE = /^\s*\((\d+):(\d{2})\s*[–—-]\s*(?:(\d+):(\d{2}))?[^)]*\)/;
  let ranged = 0, bad = 0;

  for (const file of [...MODULE_FILES, 'config-main.js', 'index.html']) {
    const lines = readFileSync(join(ROOT, file), 'utf8').split('\n');
    lines.forEach((line, li) => {
      const where = `${file}:${li + 1}`;
      let consumed = 0;
      for (const m of line.matchAll(/<a href="([^"]+)"[^>]*>([^<]*)<\/a>(\s*\([^)]*\))?/g)) {
        const [, href, label, after] = m;
        if (!/youtu\.be|youtube\.com/.test(href)) continue;
        // the range lives in the anchor text, or in the parens right after it
        const r = label.match(/\((\d+):(\d{2})\s*[–—-]\s*(?:(\d+):(\d{2}))?[^)]*\)/) ||
                  (after && after.match(RANGE));
        if (!r) continue;
        ranged++; consumed++;
        const start = toSec(r[1], r[2]);
        const end = r[3] !== undefined ? toSec(r[3], r[4]) : null;
        const t = href.match(/[?&](?:t|start)=(\d+)/);
        const e = href.match(/[?&]end=(\d+)/);
        const tSec = t ? Number(t[1]) : 0;
        if (tSec !== start) {
          err(`${where}: watch-range label starts at ${fmt(start)} but the URL ${t ? `seeks to t=${t[1]} (${fmt(tSec)})` : 'has no time param (starts 0:00)'} — align them`);
          problems++; bad++;
        }
        if (e && end !== null && Number(e[1]) !== end) {
          err(`${where}: watch-range label ends at ${fmt(end)} but the URL has end=${e[1]} (${fmt(Number(e[1]))}) — align them`);
          problems++; bad++;
        }
      }
      const totalRanges = (line.match(/\(\d+:\d{2}\s*[–—-]/g) || []).length;
      if (totalRanges > consumed && /youtu/.test(line)) {
        warn(`${where}: ${totalRanges - consumed} "(M:SS–…)" range(s) not attached to a YouTube anchor — can't verify against a time param`);
        warnings++;
      }
    });
  }
  if (bad === 0) ok(`${ranged} watch-range labels agree with their URLs' time params`);
}

/* ════════════════════════════════════════════════════════════════════
   1b. I18N COMPLETENESS — every module marked i18nComplete must have a
   real `_es` twin on every required student-facing field. This is what
   makes bilingual shipping automatic: once a module is flagged complete,
   it's structurally impossible to push new English-only content into it.
   See CLAUDE.md's "module/lesson content" i18n section — the field list
   here must track what app.js's tf() calls actually render (a field this
   check doesn't know about is a field a push can silently leave English).
   ════════════════════════════════════════════════════════════════════ */
function checkI18nCompleteness(manifest, allSets, reviewsByModule, moduleSongsByModule) {
  head('1b. Module-content i18n completeness');
  const completeModules = (manifest || []).filter(m => m.i18nComplete);
  if (!completeModules.length) { ok('no modules marked i18nComplete yet — nothing to enforce'); return; }

  const hasVal = v => v !== undefined && v !== null && v !== '';
  // `field` present on the English side but its `_es` twin missing/empty.
  const reqEs = (where, obj, field) => {
    if (!obj || !hasVal(obj[field])) return;
    if (!hasVal(obj[field + '_es'])) { err(`${where}: missing "${field}_es"`); problems++; }
  };
  // Array field (e.g. mc choices) — the `_es` twin must exist with the same length.
  const reqEsArray = (where, obj, field) => {
    if (!obj || !Array.isArray(obj[field]) || obj[field].length === 0) return;
    const es = obj[field + '_es'];
    if (!Array.isArray(es) || es.length !== obj[field].length)
      { err(`${where}: "${field}_es" missing or length mismatch (expected ${obj[field].length} items)`); problems++; }
  };

  for (const m of completeModules) {
    reqEs(`MODULE_MANIFEST[num=${m.num}]`, m, 'name');
    const sets = allSets.filter(s => Number(s.moduleNum) === m.num);
    if (!sets.length) { warn(`Module ${m.num} is marked i18nComplete but has no Sets loaded`); warnings++; continue; }

    for (const w of sets) {
      const where = `module-${m.num}.js · set "${w.id}"`;
      reqEs(where, w, 'unit');
      reqEs(where, w, 'skillFocus');
      reqEs(where, w, 'subtitle');
      reqEs(where, w, 'checklistSub');

      for (const stId of Object.keys(w.stations || {})) {
        const st = w.stations[stId];
        const stWhere = `${where} · station "${stId}"`;
        reqEs(stWhere, st, 'title');
        reqEs(stWhere, st, 'tabTitle');
        reqEs(stWhere, st, 'tabSub');
        const sections = st.sections || (st.steps ? [{ title: '', steps: st.steps }] : []);
        sections.forEach((sec, si) => {
          const secWhere = `${stWhere} · section ${si + 1}`;
          reqEs(secWhere, sec, 'title');
          (sec.steps || []).forEach((step, sti) => {
            const stepWhere = `${secWhere} · step ${sti + 1}`;
            reqEs(stepWhere, step, 'label');
            reqEs(stepWhere, step, 'text');
            reqEs(stepWhere, step, 'hint');
            reqEs(stepWhere, step, 'stuck');
            reqEs(stepWhere, step, 'levelUp');
            if (step.response) {
              reqEs(stepWhere, step.response, 'prompt');
              if (step.response.type === 'short') reqEs(stepWhere, step.response, 'placeholder');
              reqEs(stepWhere, step.response, 'explain');
              reqEsArray(stepWhere, step.response, 'choices');
            }
            if (step.playSeq) reqEs(stepWhere, step.playSeq, 'label');
            if (step.video) reqEs(stepWhere, step.video, 'label');
            if (step.tab) { reqEs(stepWhere, step.tab, 'caption'); reqEs(stepWhere, step.tab, 'title'); }
            if (Array.isArray(step.tabs)) {
              step.tabs.forEach((t, ti) => {
                const tWhere = `${stepWhere} · tabs[${ti}]`;
                reqEs(tWhere, t, 'caption');
                reqEs(tWhere, t, 'title');
              });
            }
          });
        });
      }

      if (Array.isArray(w.songs)) {
        w.songs.forEach((s, i) => reqEs(`${where} · song "${s && s.name || i}"`, s, 'meta'));
      }
      if (Array.isArray(w.skills)) {
        w.skills.forEach(sk => {
          const skWhere = `${where} · skill "${sk && sk.id}"`;
          reqEs(skWhere, sk, 'text');
          reqEs(skWhere, sk, 'gotItWhen');
          if (sk.practice) {
            reqEs(skWhere, sk.practice, 'prompt');
            reqEsArray(skWhere, sk.practice, 'choices');
            if (sk.practice.type === 'playSeq' || sk.practice.type === 'fretboard' || sk.practice.type === 'chord') reqEs(skWhere, sk.practice, 'label');
            if (sk.practice.type === 'mc') reqEs(skWhere, sk.practice, 'explain');
          }
        });
      }
    }

    const mr = reviewsByModule.get(m.num);
    if (mr) {
      const where = `module-${m.num}.js · MODULE_REVIEWS[${m.num}]`;
      reqEs(where, mr, 'module');
      reqEs(where, mr, 'forward');
      reqEsArray(where, mr, 'assessItems');
      if (Array.isArray(mr.skills)) {
        mr.skills.forEach(sk => reqEs(`${where} · skill "${sk && sk.id}"`, sk, 'text'));
      }
    }

    // Module-level "🎵 Songs" list (modules 2–12 only — Module 1 uses per-Set
    // `songs:` arrays instead, already covered above). Rendered by
    // buildModuleSongs() into a `.module-songs` div that gets the same
    // translate="no" gate as the Set/Module-Review panels once i18nComplete.
    const ms = moduleSongsByModule.get(m.num);
    if (Array.isArray(ms)) {
      ms.forEach((s, i) => reqEs(`module-${m.num}.js · MODULE_SONGS[${m.num}][${i}] "${s && s.name || i}"`, s, 'meta'));
    }
  }

  if (problems === 0) ok(`${completeModules.length} module${completeModules.length > 1 ? 's' : ''} marked i18nComplete — every required field has a Spanish twin`);
}

/* ════════════════════════════════════════════════════════════════════
   1d. IN-CLASS ACTIVITIES — class-activities.js loads cleanly and every
   entry (once any exist — v1 ships CLASS_ACTIVITIES empty) matches the
   schema documented at the top of that file: a permanent, unique `ca-<n>`
   id (an authoring counter, and the only permanent handle — student
   progress is keyed to it), NO `date` field (release dates live in
   Firestore config/class.activityDates, set from the teacher console — see
   app.js/teacher.js), an _es twin on every required string, any video
   referenced actually exists / isn't a placeholder, and no step carries a
   `figure`/`figureAlt`/`figureAlt_es` key — activities carry no figures
   (Jonathan, 2026-09-23).

   `number` is NO LONGER CHECKED for a 1..N run, and is optional on a new
   entry (2026-09-16): order and module placement moved to the teacher
   console's activity board (config/class.activityBoard), so the file no
   longer decides either. It survives only as the migration tiebreak for a
   class whose board hasn't been seeded yet — see caBoardOrder in app.js. A
   `number` that IS present still has to be a positive integer, since a
   string or a zero there would sort as garbage.
   ════════════════════════════════════════════════════════════════════ */
/* The steps a student on a paths activity's longest route meets (the PATHS
   note atop class-activities.js): the longest path's own steps plus the
   shared ones, in file order. Without `paths` it is the flat array. Used by
   1am and 1bb, which size an activity by what one student walks. */
function caLongestRoute(a) {
  const steps = (a && Array.isArray(a.steps)) ? a.steps : [];
  if (!a || !Array.isArray(a.paths) || !a.paths.length) return steps;
  let best = [];
  for (const p of a.paths) {
    const route = steps.filter(s => s && (!s.path || s.path === p.key));
    if (route.length > best.length) best = route;
  }
  return best;
}
function validateClassActivities() {
  head('1d. In-Class Activities data');
  let src;
  let strumSteps = 0;   // steps with a drawn strum pattern (step.strum)
  let pathActivities = 0;   // activities with `paths` (a chooser, then one path's steps + the shared ones)
  try { src = readFileSync(join(ROOT, 'class-activities.js'), 'utf8'); }
  catch { err('class-activities.js is missing'); problems++; return; }

  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  try { vm.runInContext(src, sandbox, { filename: 'class-activities.js' }); }
  catch (e) { err(`class-activities.js failed to load: ${e.message}`); problems++; return; }

  const activities = sandbox.CLASS_ACTIVITIES;
  if (!Array.isArray(activities)) { err('class-activities.js must set window.CLASS_ACTIVITIES to an array'); problems++; return; }
  if (activities.length === 0) { ok('CLASS_ACTIVITIES is empty (v1 ships empty)'); return; }

  const idRe = /^ca-\d+$/;
  const seenIds = new Set();
  const hasVal = v => v !== undefined && v !== null && v !== '';
  const reqEs = (where, obj, field) => {
    if (!obj || !hasVal(obj[field])) return;
    if (!hasVal(obj[field + '_es'])) { err(`${where}: missing "${field}_es"`); problems++; }
  };

  activities.forEach((a, i) => {
    const where = `CLASS_ACTIVITIES[${i}]`;
    if (!a || typeof a !== 'object') { err(`${where}: not an object`); problems++; return; }
    if ('date' in a) { err(`${where}: has a "date" field — release dates now live in Firestore (config/class.activityDates), not class-activities.js`); problems++; }
    if (!idRe.test(a.id || '')) { err(`${where}: id "${a.id}" doesn't match ^ca-\\d+$`); problems++; }
    else if (seenIds.has(a.id)) { err(`${where}: duplicate id "${a.id}"`); problems++; }
    else seenIds.add(a.id);
    /* An EXIT CHECK (kind:'check') carries no `number` and no `steps` — it
       never enters the teaching-order run and its body is a quiz, not a
       ladder. Everything else about it is an ordinary activity, so the id,
       the _es twins and the no-`date` rule all still apply. Its own data is
       validated by 1y below. */
    const isCheck = a.kind === 'check';
    if (isCheck) {
      if ('number' in a) { err(`${where}: kind:'check' must not carry a "number" — checks take no #N slot`); problems++; }
      if ('steps' in a) { err(`${where}: kind:'check' must not carry "steps" — the check object is the card body`); problems++; }
    } else if (a.kind !== undefined) {
      err(`${where}: unknown kind "${a.kind}" — the only kind is 'check'`); problems++;
    }
    // Optional now (see the header above), but still has to be a real
    // number if it's there — the legacy ordering fallback sorts on it.
    if (!isCheck && 'number' in a && (!Number.isInteger(a.number) || a.number < 1)) {
      err(`${where}: number "${a.number}" is not a positive integer — it is optional now, but a present one has to be a real position`); problems++;
    }
    reqEs(where, a, 'title');
    reqEs(where, a, 'intro');
    /* `journey: '<slug>'` (see the JOURNEY note atop class-activities.js)
       has to name a real tabs/<slug>.html page, and `journeyLayer` a layer
       that page actually has (counted from its layer-num spans) — a typo
       here would exempt nothing from the gate and open a 404 in a new tab. */
    if ('journey' in a) {
      const page = join(ROOT, 'tabs', `${a.journey}.html`);
      let pageSrc = null;
      try { pageSrc = readFileSync(page, 'utf8'); } catch {}
      if (typeof a.journey !== 'string' || !/^[a-z0-9-]+$/.test(a.journey) || pageSrc === null) {
        err(`${where}: journey "${a.journey}" — no tabs/${a.journey}.html Journey page exists`); problems++;
      } else if ('journeyLayer' in a) {
        const layers = [...pageSrc.matchAll(/<span class="layer-num"[^>]*>(\d+)<\/span>/g)].map(m => Number(m[1]));
        if (!Number.isInteger(a.journeyLayer) || !layers.includes(a.journeyLayer)) {
          err(`${where}: journeyLayer ${a.journeyLayer} — tabs/${a.journey}.html has layers ${layers.join(', ') || '(none found)'}`); problems++;
        }
      }
    } else if ('journeyLayer' in a) { err(`${where}: journeyLayer without journey`); problems++; }
    /* `view: 'focus'` — Focus view, one step at a time (VIEW note atop
       class-activities.js; caIsFocus in app.js). Anything else is a typo
       that would silently render the accordion. */
    if ('view' in a && a.view !== 'focus' && a.view !== 'card') { err(`${where}: view "${a.view}" — the values are 'focus' and 'card' (or leave it off)`); problems++; }
    /* A practice card needs its card object and nothing else does — the
       card's own shape is checked by 1bf. */
    if (a.view === 'card' && (!a.card || typeof a.card !== 'object')) { err(`${where}: view 'card' needs a "card" object (see CARD atop class-activities.js)`); problems++; }
    // metronome: BPM the Metro tool starts at when the card is opened (caAutoStartMetro in app.js). Same 40–220 range as the slider.
    if ('metronome' in a && !(Number.isInteger(a.metronome) && a.metronome >= 40 && a.metronome <= 220)) { err(`${where}: metronome ${JSON.stringify(a.metronome)} — a whole-number BPM from 40 to 220 (or leave it off)`); problems++; }
    if ('card' in a && a.view !== 'card') { err(`${where}: has a "card" object but view is not 'card' — it would never render`); problems++; }
    /* CHORD VERSIONS (2026-10-16, ca-34/ca-35 — caView in app.js). The power
       map's every shape is a real chord (pitches recomputed from the
       fretboard, a root + 5th named for its root); every `<field>_power`
       anywhere in the activity has its `<field>_power_es` twin and the
       reverse, because caView swaps the pair in together and a missing half
       shows the other version's words in one language; and `_power` fields
       on an activity with no map would never show. */
    {
      const pw = [];
      (function walk(v, path) {
        if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${path}[${i}]`)); return; }
        if (!v || typeof v !== 'object') return;
        for (const k of Object.keys(v)) {
          if (path === '' && (k === 'chordVersions' || k === 'keyVersions')) continue;
          const m = /^(.+)_power(_es)?$/.exec(k);
          if (m) pw.push({ path, obj: v, base: m[1], es: !!m[2], k });
          walk(v[k], `${path}.${k}`);
        }
      })(a, '');
      if ('chordVersions' in a) {
        const map = a.chordVersions && a.chordVersions.power;
        const extra = a.chordVersions && Object.keys(a.chordVersions).filter(k => k !== 'power');
        if (!map || typeof map !== 'object' || !Object.keys(map).length) { err(`${where}: chordVersions needs a non-empty "power" map ({ <chord>: { frets, note, midi } })`); problems++; }
        else Object.entries(map).forEach(([name, c]) => {
          if (!c || !Array.isArray(c.frets)) { err(`${where}: chordVersions.power['${name}'] needs frets / note / midi`); problems++; return; }
          caChordProblems(c).forEach(p => { err(`${where}: chordVersions.power['${name}']: ${p}`); problems++; });
          if (!hasVal(c.note)) { err(`${where}: chordVersions.power['${name}'] is missing "note"`); problems++; }
        });
        if (extra && extra.length) { err(`${where}: chordVersions has ${extra.join(', ')} — the only version is "power"`); problems++; }
      } else if (pw.length) { err(`${where}: has ${pw[0].k} but no chordVersions — the power text would never show`); problems++; }
      if ('chordStart' in a) {
        if (a.chordStart !== 'power' && a.chordStart !== 'full') { err(`${where}: chordStart "${a.chordStart}" — 'power' or 'full' (or leave it off for full)`); problems++; }
        else if (!('chordVersions' in a)) { err(`${where}: chordStart without chordVersions — there is no other version to start on`); problems++; }
      }
      /* BASS NOTES (2026-10-27, ca-35 — caBassSwitchHtml / pcBassMarks in
         app.js). The map is drawn only on a chord-grid practice card. It is
         keyed by the chord name the card SHOWS, so it must name every chord
         a grid section plays in every chord view (A and A5) and nothing
         else; each root is that chord's root note and each fifth the note
         7 semitones above it (any octave); each root sits in the chord's
         own shape, so a bar where the chord starts on beat 1 marks a fret
         the shape already draws. bassStart is 'on' / 'off'; bassDirections has
         its Spanish twin. */
      if ('bassNotes' in a || 'bassStart' in a || 'bassDirections' in a || 'bassDirections_es' in a) {
        const bn = a.bassNotes;
        const OPEN = { E: 40, A: 45, D: 50, G: 55, B: 59, e: 64 };
        const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
        const rootPc = name => { const m = /^([A-G])([#b♯♭]?)/.exec(String(name)); return m ? (PC[m[1]] + ({ '#': 1, '♯': 1, b: -1, '♭': -1 }[m[2]] || 0) + 12) % 12 : null; };
        const pitch = p => (Array.isArray(p) && p.length === 2 && (p[0] in OPEN) && Number.isInteger(p[1]) && p[1] >= 0) ? OPEN[p[0]] + p[1] : null;
        if (!bn || typeof bn !== 'object' || !Object.keys(bn).length) { err(`${where}: bassNotes needs a non-empty map ({ <chord>: { root: [string, fret], fifth: [string, fret] } })`); problems++; }
        else if (a.view !== 'card' || !a.card || !a.card.chordGrid) { err(`${where}: bassNotes is drawn only on a chord-grid practice card (view 'card', card.chordGrid) — here it would never show`); problems++; }
        else {
          // The shapes each view shows, by the name it shows them under.
          const shapes = new Map();
          (a.card.sections || []).filter(sec => sec.chordGrid !== false).forEach(sec => (sec.notes || []).forEach(n => {
            if (n.rest || !Array.isArray(n.frets)) return;
            shapes.set(n.note, n.frets);
            const pw = a.chordVersions && a.chordVersions.power && a.chordVersions.power[n.note];
            if (pw) shapes.set(pw.note, pw.frets);
          }));
          for (const name of shapes.keys()) if (!(name in bn)) { err(`${where}: bassNotes has no entry for ${name} — a bar of ${name} would get no bass note`); problems++; }
          Object.entries(bn).forEach(([name, b]) => {
            if (!shapes.has(name)) { err(`${where}: bassNotes['${name}'] — no chord-grid section shows a ${name}`); problems++; return; }
            const r = b && pitch(b.root), f = b && pitch(b.fifth);
            if (r === null || f === null) { err(`${where}: bassNotes['${name}'] needs root and fifth as [string, fret] (string e/B/G/D/A/E, fret a whole number)`); problems++; return; }
            if (r % 12 !== rootPc(name)) { err(`${where}: bassNotes['${name}'].root ${b.root.join(' fret ')} is not a ${String(name).replace(/[^A-G#b♯♭].*$/, '')}`); problems++; }
            if ((f - r + 120) % 12 !== 7) { err(`${where}: bassNotes['${name}'].fifth ${b.fifth.join(' fret ')} is not the 5th of the root`); problems++; }
            if (!shapes.get(name).some(([s, fr]) => s === b.root[0] && fr === b.root[1])) { err(`${where}: bassNotes['${name}'].root ${b.root.join(' fret ')} is not in the ${name} shape the card draws`); problems++; }
          });
        }
        if ('bassStart' in a && a.bassStart !== 'on' && a.bassStart !== 'off') { err(`${where}: bassStart "${a.bassStart}" — 'on' or 'off' (or leave it off for off)`); problems++; }
        if (!bn && ('bassStart' in a || 'bassDirections' in a)) { err(`${where}: bassStart / bassDirections without bassNotes — there is no bass to switch on`); problems++; }
        if (('bassDirections' in a) !== ('bassDirections_es' in a)) { err(`${where}: bassDirections and bassDirections_es come as a pair — one language would show no bass directions`); problems++; }
      }
      /* KEY VERSIONS (2026-10-16, ca-36 — caView in app.js): `key` names the
         key the data is written in, `keyVersions` the others. Each other
         key plays its own track, which must be the same record with the
         timing held — so the same bar map, anchor, tempo fields and length
         as the card's own track, or the highlight runs on the wrong bars in
         that key. Its `full` map (and its `power` map, when the activity
         has a chord switch) must name every chord the card plays, each a
         real shape, or one chord stays in the old key. */
      if ('keyVersions' in a || 'key' in a || 'keyStart' in a) {
        const kv = a.keyVersions;
        const used = new Set();
        (function names(v) {
          if (Array.isArray(v)) { v.forEach(names); return; }
          if (!v || typeof v !== 'object' || v === a.keyVersions || v === a.chordVersions) return;
          if (Array.isArray(v.frets) && hasVal(v.note)) used.add(v.note);
          Object.values(v).forEach(names);
        })(a);
        let tracks = null;
        try { tracks = loadConstObject(readFileSync(join(ROOT, 'app.js'), 'utf8'), 'SNIPPET_TRACKS'); } catch {}
        if (!hasVal(a.key) || !kv || typeof kv !== 'object' || !Object.keys(kv).length) { err(`${where}: key versions need "key" (the key the chords are written in) and a non-empty "keyVersions" map`); problems++; }
        else {
          if (kv[a.key]) { err(`${where}: keyVersions has '${a.key}', the key the data is already in`); problems++; }
          if ('keyStart' in a && a.keyStart !== a.key && !kv[a.keyStart]) { err(`${where}: keyStart '${a.keyStart}' is neither key '${a.key}' nor a keyVersions entry`); problems++; }
          const baseTr = tracks && a.card && tracks[a.card.track];
          for (const [k, v] of Object.entries(kv)) {
            const w = `${where}: keyVersions.${k}`;
            if (!v || typeof v !== 'object') { err(`${w} is not an object`); problems++; continue; }
            const tr = tracks && tracks[v.track];
            if (!tracks) { err(`${w}: could not load SNIPPET_TRACKS to check its track`); problems++; }
            else if (!tr) { err(`${w}: track '${v.track}' is not in SNIPPET_TRACKS`); problems++; }
            else if (baseTr) {
              for (const f of ['anchor', 'beatsPerBar', 'feltBpm', 'trackBpm', 'trackBpmSlow', 'durationSec'])
                if (tr[f] !== baseTr[f]) { err(`${w}: track '${v.track}' has ${f} ${tr[f]} but '${a.card.track}' has ${baseTr[f]} — a key version is the same record, timing held`); problems++; }
              if (JSON.stringify(tr.barTimes || null) !== JSON.stringify(baseTr.barTimes || null)) { err(`${w}: track '${v.track}' and '${a.card.track}' have different barTimes — the two keys must share one bar map`); problems++; }
              for (const f of ['src', 'srcSlow']) {
                const x = tr[f] && existsSync(join(ROOT, tr[f])) ? mp3DurationSec(join(ROOT, tr[f])) : null;
                const y = baseTr[f] && existsSync(join(ROOT, baseTr[f])) ? mp3DurationSec(join(ROOT, baseTr[f])) : null;
                if (x !== null && y !== null && Math.abs(x - y) > 0.25) { err(`${w}: ${tr[f]} is ${x.toFixed(2)}s but ${baseTr[f]} is ${y.toFixed(2)}s — the two keys must be the same length`); problems++; }
              }
            }
            const maps = [['full', v.full]];
            if ('chordVersions' in a) maps.push(['power', v.power]);
            else if ('power' in v) { err(`${w}: has a power map but the activity has no chordVersions — it would never show`); problems++; }
            for (const [mn, map] of maps) {
              if (!map || typeof map !== 'object') { err(`${w}: needs a "${mn}" map ({ <chord>: { frets, note, midi } })`); problems++; continue; }
              for (const name of used) if (!map[name]) { err(`${w}.${mn}: no shape for '${name}' — that chord would stay in key ${a.key}`); problems++; }
              for (const [name, c] of Object.entries(map)) {
                if (!used.has(name)) { err(`${w}.${mn}: '${name}' is not a chord the card plays`); problems++; }
                if (!c || !Array.isArray(c.frets)) { err(`${w}.${mn}['${name}'] needs frets / note / midi`); problems++; continue; }
                caChordProblems(c).forEach(pr => { err(`${w}.${mn}['${name}']: ${pr}`); problems++; });
                if (!hasVal(c.note)) { err(`${w}.${mn}['${name}'] is missing "note"`); problems++; }
              }
            }
          }
        }
      }
      for (const f of pw) {
        const twin = f.es ? `${f.base}_power` : `${f.base}_power_es`;
        if (!hasVal(f.obj[twin])) { err(`${where}${f.path}: ${f.k} has no ${twin} — write both, or the switch shows the other version's words in one language`); problems++; }
      }
    }
    /* PATHS (`paths` + `path` on steps — ca-46, 2026-11-04; the PATHS note
       atop class-activities.js, caRoute in app.js): Focus view only; two or
       more paths with unique lower-case keys, each with label / blurb and
       their Spanish twins and at least one step; every step's `path` names a
       listed path. A student's route is one path's steps plus the shared
       (untagged) ones, so the pick is what makes the card walkable. */
    const pathKeys = new Set();
    if ('paths' in a) {
      if (!Array.isArray(a.paths) || a.paths.length < 2) { err(`${where}: "paths" needs two or more paths`); problems++; }
      else {
        if (a.view !== 'focus') { err(`${where}: "paths" needs view: 'focus' — the chooser and the route are Focus-view only`); problems++; }
        a.paths.forEach((p, pi) => {
          const pWhere = `${where} · paths[${pi}]`;
          if (!p || typeof p !== 'object') { err(`${pWhere}: not an object`); problems++; return; }
          if (!/^[a-z][a-z0-9-]*$/.test(String(p.key || ''))) { err(`${pWhere}: key "${p.key}" should be lower-case letters, digits and hyphens`); problems++; }
          else if (pathKeys.has(p.key)) { err(`${pWhere}: key "${p.key}" is used twice`); problems++; }
          else pathKeys.add(p.key);
          reqEs(pWhere, p, 'label');
          reqEs(pWhere, p, 'blurb');
          if (!hasVal(p.label)) { err(`${pWhere}: a path needs a label (the chooser card's name)`); problems++; }
          const own = (Array.isArray(a.steps) ? a.steps : []).filter(s => s && s.path === p.key).length;
          if (!own) { err(`${pWhere}: path "${p.key}" has no steps — tag at least one step with path: '${p.key}'`); problems++; }
        });
        pathActivities++;
      }
    }
    if (isCheck) { /* no steps — see 1y */ }
    /* A practice card has no help ladder: `steps: []` (Jonathan,
       2026-10-07). Every other activity needs its steps. */
    else if (!Array.isArray(a.steps) || (!a.steps.length && !(a.view === 'card' && a.card))) { err(`${where}: "steps" should be a non-empty array`); problems++; }
    else {
      a.steps.forEach((s, si) => {
        const sWhere = `${where} · steps[${si}]`;
        if (!s || typeof s !== 'object') { err(`${sWhere}: not an object`); problems++; return; }
        if ('path' in s) {
          if (!('paths' in a)) { err(`${sWhere}: path "${s.path}" on an activity with no "paths"`); problems++; }
          else if (!pathKeys.has(s.path)) { err(`${sWhere}: path "${s.path}" is not one of the activity's paths (${[...pathKeys].join(', ')})`); problems++; }
        }
        reqEs(sWhere, s, 'text');
        reqEs(sWhere, s, 'label');   // optional step head ("Step 4: Tune it back")
        if ('figure' in s || 'figureAlt' in s || 'figureAlt_es' in s) {
          err(`${a.id} step ${si + 1}: activities carry no figures (2026-09-23) — delete the step or the key`); problems++;
        }
        if (s.video) {
          if (!s.video.id || /placeholder/i.test(s.video.id)) { err(`${sWhere}: video.id is missing or a placeholder — verify via oEmbed before shipping (see CLAUDE.md "Videos")`); problems++; }
          if (s.video.label) reqEs(sWhere, s.video, 'label');
        }
        /* A drawn strum pattern (step.strum, buildStrum in app.js — ca-46,
           2026-11-03): eight eighth-note slots of D / U / . / - (a stop; no card uses it), starting on a
           strum (the first sequence entry plays at once); every bar names a
           chord in `chords`; every chord's midi recomputed from its frets. */
        if (s.strum) {
          strumSteps++;
          const mWhere = `${sWhere} · strum`;
          reqEs(mWhere, s.strum, 'caption');
          if (!/^[DU][DU.\-]{7}$/.test(String(s.strum.pattern || ''))) { err(`${mWhere}: pattern "${s.strum.pattern}" must be 8 slots of D, U, . or - and start on D or U`); problems++; }
          const chords = (s.strum.chords && typeof s.strum.chords === 'object') ? s.strum.chords : {};
          if (!Array.isArray(s.strum.bars) || !s.strum.bars.length) { err(`${mWhere}: "bars" should be a non-empty array of chord names`); problems++; }
          if ('barsPerRow' in s.strum && ![1, 2, 4].includes(s.strum.barsPerRow)) { err(`${mWhere}: barsPerRow ${s.strum.barsPerRow} — 1, 2 or 4 (buildStrum draws two a row by default)`); problems++; }
          else s.strum.bars.forEach((name, bi) => { if (!chords[name]) { err(`${mWhere} · bars[${bi}]: "${name}" is not in "chords"`); problems++; } });
          Object.keys(chords).forEach(name => {
            const c = chords[name] || {};
            if (!Array.isArray(c.frets)) { err(`${mWhere} · chords.${name}: needs "frets"`); problems++; return; }
            caChordProblems({ frets: c.frets, midi: c.midi, note: name }).forEach(p => { err(`${mWhere} · chords.${name}: ${p}`); problems++; });
          });
        }
        if (s.tab) {
          const tWhere = `${sWhere} · tab`;
          reqEs(tWhere, s.tab, 'caption');
          reqEs(tWhere, s.tab, 'title');
          const strRe = /^[eBGDAE]$/;
          const checkNote = (n, where) => {
            if (!n || typeof n !== 'object') { err(`${where}: not an object`); problems++; return; }
            // A chord on one beat (a power chord — ca-29..ca-33, 2026-10-05):
            // `frets: [[string, fret], ...]` with `midi` the matching array,
            // the same shape Module 3's tabs use. Checked by caChordProblems.
            if (Array.isArray(n.frets)) {
              caChordProblems(n).forEach(p => { err(`${where}: ${p}`); problems++; });
              if (!hasVal(n.note)) { err(`${where}: missing "note"`); problems++; }
              return;
            }
            if (!strRe.test(n.string || '')) { err(`${where}: string "${n.string}" is not one of e/B/G/D/A/E`); problems++; }
            if (!Number.isInteger(n.fret) || n.fret < 0) { err(`${where}: fret "${n.fret}" is not an integer >= 0`); problems++; }
            if (!hasVal(n.note)) { err(`${where}: missing "note"`); problems++; }
            if (typeof n.midi !== 'number') { err(`${where}: midi "${n.midi}" is not numeric`); problems++; }
            checkFinger(where, n);
          };
          if (Array.isArray(s.tab.phrases)) {
            s.tab.phrases.forEach((p, pi) => {
              const pWhere = `${tWhere} · phrases[${pi}]`;
              reqEs(pWhere, p, 'label');
              (p.notes || []).forEach((n, ni) => checkNote(n, `${pWhere} · notes[${ni}]`));
            });
          } else if (Array.isArray(s.tab.notes)) {
            s.tab.notes.forEach((n, ni) => checkNote(n, `${tWhere} · notes[${ni}]`));
          }
        }
      });
    }
  });

  /* The old 1..N contiguity rule is GONE (2026-09-16). It guarded a
     teaching order the file no longer owns: the console's activity board
     does, and `number` there is only the tiebreak used to seed a board
     that has never been written. A gap in it now means nothing, and
     failing a push over one would force a pointless retype every time an
     activity is added or retired. Ids are still unique (checked above) and
     that is the one thing progress is keyed to. */
  /* Both step renderers draw step.strum through the one builder — a field
     wired into one renderer is invisible in the other (CLAUDE.md, "TWO step
     renderers"). Only checked while some step uses it. */
  if (strumSteps) {
    const appSrc = readFileSync(join(ROOT, 'app.js'), 'utf8');
    const tchSrc = readFileSync(join(ROOT, 'teacher.js'), 'utf8');
    if (!/if\(step\.strum\) parts\.push\(buildStrum\(step\.strum,/.test(appSrc)) { err('1d: caStepHtml() in app.js no longer draws step.strum with buildStrum()'); problems++; }
    if (!/if\(s\.strum && typeof buildStrum==='function'\) media\.push\(buildStrum\(s\.strum,/.test(tchSrc)) { err('1d: renderTeacherActivityDetail() in teacher.js no longer draws step.strum with buildStrum()'); problems++; }
    /* ▶ Play clicks on every strum board (2026-11-04): it opens the rail Metronome at 60 BPM
       in 4/4 and starts it. The smoke test clicks it for real; this pins the wiring. */
    const sm = appSrc.match(/function strumOpenMetro\(\)\{([\s\S]*?)\n\}/);
    if (!/class="play-seq-btn strum-clicks-btn" onclick="strumOpenMetro\(\)"/.test(appSrc)) { err('1d: buildStrum() no longer draws the ▶ Play clicks button (strum-clicks-btn → strumOpenMetro())'); problems++; }
    if (!/data-clicks="\$\{spec\.bars\.length \* 4\}"/.test(appSrc) || !/down: h\.dir === 'D'/.test(appSrc)) { err('1d: ▶ Play strum no longer carries data-clicks (4 per bar) and a down flag per strum'); problems++; }
    if (!/const nClicks = btnEl && btnEl\.dataset \? parseInt\(btnEl\.dataset\.clicks, 10\) : 0;/.test(appSrc) || !/m\.down === true \? STRUM_DOWN_GAIN : hasBeats && m\.down === false \? STRUM_UP_GAIN/.test(appSrc) || !/const STRUM_DOWN_GAIN = 1\.25;/.test(appSrc) || !/const STRUM_UP_GAIN = 0\.8;/.test(appSrc)) { err('1d: startPlaySequence() no longer clicks every beat for a data-clicks button or accents down strums'); problems++; }
    if (!/const STRUM_METRO_BPM = 60;/.test(appSrc)) { err('1d: STRUM_METRO_BPM is no longer 60 (Jonathan: Play clicks opens the metronome at 60 BPM)'); problems++; }
    if (!sm || !/setTimeout\(\(\) => \{ if\(!pop\.classList\.contains\('open'\)\) togglePopup\('metro'\); \}, 0\)/.test(sm[1]) || !/onBpmSlider\(String\(STRUM_METRO_BPM\)\)/.test(sm[1]) || !/setMetroMeter\(4\)/.test(sm[1]) || !/startMetro\(\)/.test(sm[1])) { err('1d: strumOpenMetro() must open the Metronome popup, set STRUM_METRO_BPM, put the meter on 4/4 and start it'); problems++; }
    if (!/'strum\.clicks':\s*\{ en: 'Play clicks', es: 'Tocar clics' \}/.test(readFileSync(join(ROOT, 'i18n.js'), 'utf8'))) { err('1d: i18n strum.clicks (Play clicks / Tocar clics) is missing'); problems++; }
  }
  const numbered = activities.filter(a => a && a.kind !== 'check');
  const checks = activities.length - numbered.length;
  /* Both renderers draw a paths activity through the one chooser builder
     (caPathChooserHtml) and walk the same route split (caPathSteps /
     caSharedSteps) — the student card in caCardBodyBlockHtml, the console
     preview in renderTeacherActivityDetail. A field wired into one side only
     is invisible on the other (CLAUDE.md, two renderers). */
  if (pathActivities) {
    const appSrc = readFileSync(join(ROOT, 'app.js'), 'utf8');
    const tchSrc = readFileSync(join(ROOT, 'teacher.js'), 'utf8');
    if (!/\$\{chooser \? caPathChooserHtml\(a\) : caPathRowHtml\(a\)\}/.test(appSrc)) { err('1d: caCardBodyBlockHtml() in app.js no longer draws the path chooser / the "Change path" row'); problems++; }
    if (!/const stepsHtml = \(card \|\| chooser\) \? '' : route\.map\(\(si, pos\) => caStepHtml\(a, steps\[si\], si, si === openStepIdx/.test(appSrc)) { err('1d: caCardBodyBlockHtml() in app.js no longer walks caRoute(a) with the step\'s flat index as the key'); problems++; }
    if (!/caPathChooserHtml\(a,\{preview:true\}\)/.test(tchSrc) || !/caPathSteps\(a,pathKey\)\.concat\(caSharedSteps\(a\)\)/.test(tchSrc)) { err('1d: renderTeacherActivityDetail() in teacher.js no longer draws the path chooser and walks the route by path'); problems++; }
  }
  if (problems === 0) ok(`${activities.length} class activit${activities.length === 1 ? 'y' : 'ies'} (${checks} exit check${checks === 1 ? '' : 's'}) — all valid; order lives on the console board; ${strumSteps} strum step${strumSteps === 1 ? '' : 's'}, both renderers draw them; ${pathActivities} with paths, both renderers draw the chooser`);
  checkExitChecks(activities);
  checkActivityTitleNumbers(activities);
  checkActivityDeckAnswers(activities);
}

/* ════════════════════════════════════════════════════════════════════
   1bi. A CLASS-ACTIVITY DECK SHOWS ITS ANSWER (2026-09-29). ca-11, ca-12,
   ca-17 and ca-22 all dealt the one-sided `naturals` deck — a note name and
   a "Done" button, nothing to check against — under a "7 of 7" or "five in
   a row" standard the student had no way to score. Jonathan found it on
   ca-22 step 2. Two rules:
   - every `drill: { type:'deck' }` in class-activities.js names a deck with
     a `back`, so the card can be flipped to the answer;
   - every `naturals-<string>` deck's backs are recomputed from the
     fretboard (natural notes, frets 0–12, the open note at "0 / 12"), the
     way 1y recomputes exit-check keys — a wrong fret doesn't look broken,
     it just tells a student who was right that they were wrong.
   ════════════════════════════════════════════════════════════════════ */
function checkActivityDeckAnswers(activities) {
  head('1bi. Class-activity decks show the answer');
  let DECKS;
  try { DECKS = loadConstObject(readFileSync(join(ROOT, 'app.js'), 'utf8'), 'DECKS'); }
  catch (e) { err(`could not load DECKS from app.js — 1bi cannot check this: ${e.message}`); problems++; return; }
  let bad = 0, used = 0;
  activities.forEach(a => (a && a.steps || []).forEach((st, si) => {
    const d = st && st.drill;
    if (!d || d.type !== 'deck') return;
    used++;
    const def = DECKS[d.deck];
    if (!def) return;   // an unknown id is 1f's to report
    if (!def.back) { err(`${a.id} step ${si + 1}: deck '${d.deck}' has no back — the student can't check the answer (use a two-sided deck, e.g. naturals-lowE / naturals-A)`); problems++; bad++; }
  }));
  const OPEN = { lowE: 'E', A: 'A', D: 'D', G: 'G', B: 'B', e: 'E' };
  const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  let decks = 0;
  for (const [id, def] of Object.entries(DECKS)) {
    const m = /^naturals-(lowE|A|D|G|B|e)$/.exec(id);
    if (!m) continue;
    decks++;
    const open = NAMES.indexOf(OPEN[m[1]]);
    const frets = {};
    for (let f = 0; f <= 12; f++) {
      const n = NAMES[(open + f) % 12];
      if (n.includes('#')) continue;
      (frets[n] = frets[n] || []).push(f);
    }
    const want = Object.fromEntries(Object.entries(frets).map(([n, fs]) => [n, fs.join(' / ')]));
    const seen = new Set();
    for (const c of def.cards || []) {
      seen.add(c.f);
      if (want[c.f] === undefined) { err(`DECKS['${id}']: card '${c.f}' is not a natural note on that string`); problems++; bad++; }
      else if (c.b !== want[c.f]) { err(`DECKS['${id}']: '${c.f}' says fret "${c.b}", the fretboard says "${want[c.f]}"`); problems++; bad++; }
    }
    for (const n of Object.keys(want)) if (!seen.has(n)) { err(`DECKS['${id}']: no card for ${n}`); problems++; bad++; }
  }
  if (used === 0) { err('1bi found no deck drill in class-activities.js — it cannot see what it is supposed to guard'); problems++; return; }
  if (decks === 0) { err('1bi found no naturals-<string> deck in app.js — it cannot see what it is supposed to guard'); problems++; return; }
  if (bad === 0) ok(`${used} class-activity deck drills all show their answer; ${decks} per-string note decks match the fretboard`);
}

/* ════════════════════════════════════════════════════════════════════
   1y. EXIT-CHECK DATA — every kind:'check' activity in class-activities.js
   is a self-grading assessment, which makes a typo in it worse than a typo
   anywhere else on the site: a wrong `answer` doesn't look broken, it just
   silently marks a correct student wrong and lands that score on their
   progress doc in front of the teacher.

   So this does not merely shape-check the data — it RECOMPUTES every
   answer from the fretboard. A noteName answer is checked against
   NOTE_NAMES[(OPEN[string] + fret) % 12] (the same 12-name table app.js
   uses as SD_NOTE_NAMES), and every nextNote note and answer must carry
   the midi its own string+fret implies. The choice list is checked for
   exactly one entry matching the answer, so an item can neither be
   unanswerable nor have two right answers.

   noteName answers must also be NATURALS: the choice row is the seven
   naturals A–G in fixed order (app.js SD_NATURALS), so a fret whose true
   note is a sharp has no correct button to press.

   Item `label`s are swept for the same retired slang 1w guards. 1w's own
   FIELD_RE has no `label` (widening it would re-scan every module step
   label), so the compiled regex is hoisted to module scope and reused here.
   ════════════════════════════════════════════════════════════════════ */
const EC_OPEN_MIDI = { E: 40, A: 45, D: 50, G: 55, B: 59, e: 64 };
const EC_STRING_KINDS = { lowE: 40, A: 45, D: 50, G: 55, B: 59, highE: 64 };
const EC_NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const EC_NATURALS = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
const ecNorm = n => String(n == null ? '' : n).replace(/#/g, '♯').trim();

/* A chord note in a class-activity tab or practice card (2026-10-05, the
   power-chord whole songs ca-29..ca-33): `frets: [[string, fret], ...]`
   and `midi` the matching array, in the same order. Every pitch is
   recomputed from the fretboard — a wrong midi plays a chord the tab
   doesn't show — and a two-note chord a 5th apart must be named for its
   root ("A5"). A function declaration, so the step-tab check (which runs
   before the consts above are reached) can call it; it reads no consts. */
function caChordProblems(n) {
  const OPEN = { E: 40, A: 45, D: 50, G: 55, B: 59, e: 64 };
  const NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  const out = [];
  const fr = n.frets;
  if (fr.length < 2) out.push(`frets has ${fr.length} entr${fr.length === 1 ? 'y' : 'ies'} — use string/fret for one note`);
  if (!Array.isArray(n.midi) || n.midi.length !== fr.length) { out.push(`midi must be an array with one pitch per frets entry`); return out; }
  const seen = new Set();
  fr.forEach((p, i) => {
    const [s, f] = Array.isArray(p) ? p : [];
    if (!(s in OPEN)) { out.push(`frets[${i}]: string "${s}" is not one of e/B/G/D/A/E`); return; }
    if (!Number.isInteger(f) || f < 0) { out.push(`frets[${i}]: fret "${f}" is not an integer >= 0`); return; }
    if (seen.has(s)) out.push(`frets[${i}]: string ${s} appears twice`);
    seen.add(s);
    if (n.midi[i] !== OPEN[s] + f) out.push(`midi[${i}] ${n.midi[i]} is not ${s}-string fret ${f} (${OPEN[s] + f})`);
  });
  const rootNamed = lo => {
    const want = NAMES[lo % 12] + '5';
    /* A flat spelling is the same chord — Bb5 in the key of F (ca-36),
       where A#5 would be wrong on the page. */
    const FLAT = { 'D♭': 'C♯', 'E♭': 'D♯', 'G♭': 'F♯', 'A♭': 'G♯', 'B♭': 'A♯' };
    const got = ecNorm(n.note).replace(/^([A-G])b/, '$1♭').replace(/^([A-G]♭)/, (m, f) => FLAT[f] || f);
    return got !== want ? `note "${n.note}" — a root and the 5th above it is ${want}` : null;
  };
  if (!out.length && fr.length === 2) {
    const lo = Math.min(...n.midi), hi = Math.max(...n.midi);
    if (hi - lo === 7) { const bad = rootNamed(lo); if (bad) out.push(bad); }
  }
  // The three-finger power chord the cards draw (root, 5th, root an octave up): named for its root too. An F5 carrying G5's frets read as fine before.
  if (!out.length && fr.length === 3) {
    const m3 = n.midi.slice().sort((x, y) => x - y);
    if (m3[1] - m3[0] === 7 && m3[2] - m3[0] === 12) { const bad = rootNamed(m3[0]); if (bad) out.push(bad); }
  }
  return out;
}

function checkExitChecks(activities) {
  head('1y. Exit-check data (answers recomputed from the fretboard)');
  const checks = (activities || []).filter(a => a && a.kind === 'check');
  if (!checks.length) { ok('no exit checks yet'); return; }
  let bad = 0;
  const fail = (where, msg) => { err(`${where}: ${msg}`); problems++; bad++; };

  for (const a of checks) {
    const w = `${a.id}`;
    const c = a.check;
    if (!c || typeof c !== 'object') { fail(w, 'missing a "check" object'); continue; }
    if (c.type !== 'nextNote' && c.type !== 'noteName') { fail(w, `check.type "${c.type}" is not 'nextNote' or 'noteName'`); continue; }
    if ('retake' in c && typeof c.retake !== 'boolean') fail(w, `check.retake "${c.retake}" is not a boolean`);
    const items = c.items;
    if (!Array.isArray(items) || !items.length) { fail(w, 'check.items should be a non-empty array'); continue; }
    if (items.length > 10) fail(w, `check.items has ${items.length} items — 10 is the ceiling (a check is a quick turn-in, not a test)`);

    // Slang sweep over item labels — 1w's field list can't see these.
    items.forEach((it, i) => {
      for (const f of ['label', 'label_es']) {
        if (!it || !it[f]) continue;
        for (const m of String(it[f]).matchAll(SLANG_RE)) fail(`${w} · items[${i}].${f}`, `banned phrase "${m[0]}" (see 1w)`);
      }
    });

    if (c.type === 'nextNote') {
      if ('bpm' in c && (!Number.isInteger(c.bpm) || c.bpm < 40 || c.bpm > 160))
        fail(w, `check.bpm "${c.bpm}" is not an integer 40–160`);
      const note = (n, nw) => {
        if (!n || typeof n !== 'object') { fail(nw, 'not an object'); return; }
        if (!/^[eBGDAE]$/.test(n.string || '')) { fail(nw, `string "${n.string}" is not one of e/B/G/D/A/E`); return; }
        if (!Number.isInteger(n.fret) || n.fret < 0) { fail(nw, `fret "${n.fret}" is not an integer >= 0`); return; }
        if (n.note === undefined || n.note === null || n.note === '') { fail(nw, 'missing "note"'); return; }
        if (typeof n.midi !== 'number') { fail(nw, `midi "${n.midi}" is not numeric`); return; }
        const want = EC_OPEN_MIDI[n.string] + n.fret;
        if (n.midi !== want) fail(nw, `midi ${n.midi} does not match ${n.string}-string fret ${n.fret} (should be ${want}) — the site would play a note the tab doesn't show`);
        const trueNote = EC_NOTE_NAMES[want % 12];
        if (ecNorm(n.note) !== trueNote) fail(nw, `note "${n.note}" is not ${n.string}-string fret ${n.fret} (that is ${trueNote})`);
      };
      items.forEach((it, i) => {
        const iw = `${w} · items[${i}]`;
        if (!it || typeof it !== 'object') { fail(iw, 'not an object'); return; }
        for (const f of ['label', 'label_es']) if (!it[f]) fail(iw, `missing "${f}"`);
        if (!Array.isArray(it.notes) || !it.notes.length) fail(iw, '"notes" should be a non-empty array');
        else it.notes.forEach((n, ni) => note(n, `${iw} · notes[${ni}]`));
        if (!it.answer || typeof it.answer !== 'object') { fail(iw, 'missing an "answer" note'); return; }
        note(it.answer, `${iw} · answer`);
        const ch = it.choices;
        if (!Array.isArray(ch) || ch.length < 3) { fail(iw, `"choices" needs at least 3 entries (has ${Array.isArray(ch) ? ch.length : 0})`); return; }
        const frets = new Set();
        ch.forEach((x, xi) => {
          const cw = `${iw} · choices[${xi}]`;
          if (!x || typeof x !== 'object') { fail(cw, 'not an object'); return; }
          if (!Number.isInteger(x.fret) || x.fret < 0) fail(cw, `fret "${x.fret}" is not an integer >= 0`);
          if (!x.note) fail(cw, 'missing "note"');
          // Picks are stored as the fret alone, so two choices on one fret
          // would be indistinguishable in the saved result.
          if (frets.has(x.fret)) fail(cw, `fret ${x.fret} appears twice — a pick is stored as its fret, so duplicates are ambiguous`);
          frets.add(x.fret);
        });
        const hits = ch.filter(x => x && x.fret === it.answer.fret && ecNorm(x.note) === ecNorm(it.answer.note)).length;
        if (hits !== 1) fail(iw, `${hits} of ${ch.length} choices match the answer (fret ${it.answer.fret} · ${it.answer.note}) — exactly 1 required`);
      });
    } else {
      const open = EC_STRING_KINDS[c.string];
      if (open === undefined) { fail(w, `check.string "${c.string}" is not one of lowE/A/D/G/B/highE`); continue; }
      items.forEach((it, i) => {
        const iw = `${w} · items[${i}]`;
        if (!it || typeof it !== 'object') { fail(iw, 'not an object'); return; }
        if (!Number.isInteger(it.fret) || it.fret < 0 || it.fret > 12) { fail(iw, `fret "${it.fret}" is not an integer 0–12`); return; }
        const trueNote = EC_NOTE_NAMES[(open + it.fret) % 12];
        if (!EC_NATURALS.has(trueNote))
          fail(iw, `${c.string} fret ${it.fret} is ${trueNote}, a sharp — the choice row is the seven naturals, so this item has no right button`);
        else if (ecNorm(it.answer) !== trueNote)
          fail(iw, `answer "${it.answer}" is wrong — ${c.string} fret ${it.fret} is ${trueNote}`);
      });
    }
  }
  if (bad === 0) {
    const n = checks.reduce((t, a) => t + ((a.check && a.check.items) || []).length, 0);
    ok(`${checks.length} exit check${checks.length === 1 ? '' : 's'}, ${n} question${n === 1 ? '' : 's'} — every answer key recomputed from the fretboard`);
  }
}

/* ════════════════════════════════════════════════════════════════════
   1l. SERIES NUMBERS INSIDE ACTIVITY TITLES — some activities come in a
   named series ("Finger Gym 1", "Finger Gym 2", …). That digit counts
   within the series, NOT within the course: the first Finger Gym is
   Finger Gym 1 even though the class meets it as activity #3 (Jonathan,
   2026-08-20). So it is deliberately independent of the course position,
   and this check does NOT pin the two together — an earlier version did,
   which is what pushed the series to 3..8 in the first place.

   What it does enforce is that each series reads 1, 2, 3, … : group
   titles by the words before the digit, sort, and fail on a gap, a
   duplicate, or a backwards jump. The sort is by NUMERIC ID (2026-09-16),
   not by `number` as it was — a series is authored in order, ids are
   handed out in order and never move, and the course position now lives
   on the console's activity board where this file can't see it. Inserting
   a Gym in the middle still means retyping every later Gym's digit.
   EN and ES are grouped separately, so a translated series has to stay
   in step with itself too.

   Only a number in "series position" counts — one that ends the title or
   is followed by a — / – / - / : separator. A number that is part of the
   prose ("Play 3 Chords", "Happy Birthday in 6/8") is left alone. If a
   title ever legitimately ends in a non-series number, reword it rather
   than loosening this.
   ════════════════════════════════════════════════════════════════════ */
const activityIdNum = id => { const m = /^ca-(\d+)$/.exec(String(id)); return m ? Number(m[1]) : Infinity; };
function checkActivityTitleNumbers(activities) {
  head('1l. Numbered activity series run 1..N in order');
  // A standalone integer that ends the string or hands off to a separator.
  const POS_RE = /(?:^|\s)(\d+)(?=\s*(?:[—–:-]\s|$))/;
  // series key -> [{ id, idNum, seriesNum, title }], one map per language.
  const series = new Map();
  for (const a of activities) {
    for (const field of ['title', 'title_es']) {
      const title = a[field];
      if (typeof title !== 'string') continue;
      const m = POS_RE.exec(title);
      if (!m) continue;
      const name = title.slice(0, m.index).trim();
      if (!name) continue;               // a bare "3" is prose, not a series
      const key = `${field}::${name.toLowerCase()}`;
      if (!series.has(key)) series.set(key, { field, name, entries: [] });
      series.get(key).entries.push({ id: a.id, idNum: activityIdNum(a.id), seriesNum: Number(m[1]), title });
    }
  }
  let bad = 0;
  for (const { field, name, entries } of series.values()) {
    entries.sort((x, y) => x.idNum - y.idNum);
    entries.forEach((e, i) => {
      if (e.seriesNum === i + 1) return;
      err(`${e.id}: ${field} "${e.title}" is #${i + 1} of the "${name}" series (by authoring order) but reads ${e.seriesNum} — the series has to run 1..${entries.length} (see class-activities.js header)`);
      problems++; bad++;
    });
  }
  if (bad === 0) {
    const n = series.size;
    ok(n ? `${n} numbered title series — each runs 1..N by authoring order` : 'no numbered activity title series');
  }
}

/* ════════════════════════════════════════════════════════════════════
   Shared helpers: extract a real JS value out of source text without a
   full parser, by tracking brace/paren/bracket depth and string/comment
   state char-by-char. Used by the 1e/1f/1g checks below instead of
   regexing whole object literals (which breaks on the `{param}` curly
   braces that live INSIDE i18n string values).
   ════════════════════════════════════════════════════════════════════ */
function skipStringOrComment(src, i) {
  // Called only when src[i] opens a string/comment; returns the index just
  // past it, or null if `i` isn't the start of one.
  const c = src[i], d = src[i + 1];
  if (c === "'" || c === '"' || c === '`') {
    let j = i + 1;
    while (j < src.length && src[j] !== c) { if (src[j] === '\\') j++; j++; }
    return j + 1;
  }
  if (c === '/' && d === '/') {
    let j = i + 2;
    while (j < src.length && src[j] !== '\n') j++;
    return j;
  }
  if (c === '/' && d === '*') {
    let j = i + 2;
    while (j < src.length && !(src[j] === '*' && src[j + 1] === '/')) j++;
    return j + 2;
  }
  return null;
}
// Finds `startMarker{...}` and returns the `{...}` text with braces balanced,
// ignoring braces that appear inside strings/comments.
function extractBalancedObjectText(src, startMarker) {
  const markerIdx = src.indexOf(startMarker);
  if (markerIdx < 0) return null;
  const start = src.indexOf('{', markerIdx);
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const skip = skipStringOrComment(src, i);
    if (skip !== null) { i = skip - 1; continue; }
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  return null;
}
// Evaluates a `const NAME = { ... };` object literal in isolation (no
// dependency on the rest of the file) via vm, so DECKS/EAR_POOLS/etc. get
// read the same way the browser would build them, not guessed at with regex.
function loadConstObject(src, constName) {
  const text = extractBalancedObjectText(src, `const ${constName} = `);
  if (!text) throw new Error(`could not find "const ${constName} = {...}" in source`);
  return vm.runInNewContext(`(${text})`, vm.createContext({}));
}
// Blanks out comments (line count preserved, so error locations stay
// accurate), leaving string contents untouched. A template literal's ${…}
// parts are walked as code (2026-10-25): a comment inside one is blanked
// too, and a nested template no longer ends the outer one early — the old
// skip-to-the-next-backtick lost sync at a nested template holding an
// apostrophe (teacher.js, ~640 lines read as code or string by accident).
function stripJsComments(src) {
  let i = 0;
  const code = inInterp => {     // up to the } that closes a ${…}, or the end
    let out = '', depth = 0;
    while (i < src.length) {
      const c = src[i], d = src[i + 1];
      if (c === '`') { out += tmpl(); continue; }
      if (c === "'" || c === '"') { const j = skipStringOrComment(src, i); out += src.slice(i, j); i = j; continue; }
      if (c === '/' && (d === '/' || d === '*')) { const j = Math.min(skipStringOrComment(src, i), src.length); out += src.slice(i, j).replace(/[^\n]/g, ' '); i = j; continue; }
      if (inInterp && c === '{') depth++;
      if (inInterp && c === '}' && depth-- === 0) return out;
      out += c; i++;
    }
    return out;
  };
  const tmpl = () => {           // from the opening backtick to its close
    let out = '`'; i++;
    while (i < src.length && src[i] !== '`') {
      if (src[i] === '\\') { out += src.slice(i, i + 2); i += 2; continue; }
      if (src[i] === '$' && src[i + 1] === '{') { i += 2; out += '${' + code(true) + '}'; i++; continue; }
      out += src[i++];
    }
    i++;
    return out + '`';
  };
  return code(false);
}
// Every top-level `function name(...)` / `async function name(...)`
// declaration in a classic (non-module) script. This codebase writes every
// top-level declaration flush at column 0 and every nested one indented
// (verified across all seven classic scripts) — a per-line anchor is both
// simpler and more reliable here than brace-depth tracking, which a regex
// literal containing an apostrophe (e.g. `/isn't/`) silently desyncs by
// misreading the apostrophe as a string opening.
function topLevelFunctionDecls(src) {
  const clean = stripJsComments(src);
  const decls = [];
  const re = /^(?:async\s+)?function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/gm;
  let m;
  while ((m = re.exec(clean))) decls.push({ name: m[1], index: m.index });
  return decls;
}
// Body text of ONE top-level declaration, given its start index in the
// ORIGINAL (unstripped) source — only used to byte-compare the one known
// intentional duplicate, so brace-depth tracking's rare regex-literal
// blind spot only ever risks that single comparison, never the name scan.
function functionBodyAt(src, startIndex) {
  let j = src.indexOf('(', startIndex);
  let pd = 0;
  for (; j < src.length; j++) {
    const s2 = skipStringOrComment(src, j);
    if (s2 !== null) { j = s2 - 1; continue; }
    if (src[j] === '(') pd++;
    else if (src[j] === ')') { pd--; if (pd === 0) { j++; break; } }
  }
  while (j < src.length && src[j] !== '{') j++;
  let bd = 0, k = j;
  for (; k < src.length; k++) {
    const s3 = skipStringOrComment(src, k);
    if (s3 !== null) { k = s3 - 1; continue; }
    if (src[k] === '{') bd++;
    else if (src[k] === '}') { bd--; if (bd === 0) { k++; break; } }
  }
  return src.slice(startIndex, k);
}

/* ════════════════════════════════════════════════════════════════════
   1e. I18N TABLE PARITY — the hand-written i18n.js table (app SHELL
   strings — see 1b above for module/lesson content, a separate table).
   Extracts the real I18N object by vm-executing i18n.js with minimal
   DOM/localStorage stubs, so this checks the object the browser would
   actually build, not a regex guess at where the object literal ends.
   ════════════════════════════════════════════════════════════════════ */
function loadI18nTable() {
  const src = readFileSync(join(ROOT, 'i18n.js'), 'utf8');
  const patched = src.replace('const I18N = {', 'const I18N = globalThis.__I18N_TABLE__ = {');
  if (patched === src) throw new Error('could not find "const I18N = {" — has i18n.js been restructured?');
  const doc = { documentElement: {}, querySelectorAll: () => [], addEventListener(){} };
  const sandbox = {
    document: doc,
    localStorage: { getItem(){ return null; }, setItem(){} },
    CustomEvent: function(){},
    console,
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(patched, sandbox, { filename: 'i18n.js' });
  return sandbox.__I18N_TABLE__;
}

// en uses {ord}, es uses {fret} — a deliberate exception, not a drift bug.
const I18N_PARAM_EXCEPTIONS = new Set(['diagram.noteFret']);

function checkI18nParity() {
  head('1e. i18n key parity (en/es + params)');
  let I18N;
  try { I18N = loadI18nTable(); }
  catch (e) { err(`could not load i18n.js's I18N table: ${e.message}`); problems++; return; }
  const keys = Object.keys(I18N);
  const paramsOf = s => [...new Set(String(s).match(/\{[a-zA-Z0-9_]+\}/g) || [])].sort().join('|');
  let bad = 0;
  for (const k of keys) {
    const entry = I18N[k];
    if (!entry || typeof entry !== 'object') { err(`i18n.js: '${k}' is not an {en, es} object`); problems++; bad++; continue; }
    if (typeof entry.en !== 'string' || !entry.en) { err(`i18n.js: '${k}' is missing "en"`); problems++; bad++; continue; }
    if (typeof entry.es !== 'string' || !entry.es) { err(`i18n.js: '${k}' is missing "es"`); problems++; bad++; continue; }
    if (I18N_PARAM_EXCEPTIONS.has(k)) continue;
    const pe = paramsOf(entry.en), pf = paramsOf(entry.es);
    if (pe !== pf) { err(`i18n.js: '${k}' param mismatch — en:[${pe}] es:[${pf}]`); problems++; bad++; }
  }
  if (bad === 0) ok(`${keys.length} i18n.js keys — every one has en+es and matching {param}s`);
  return I18N;
}

/* ════════════════════════════════════════════════════════════════════
   1f. I18N KEY REFERENCES — every literal t('...'), data-i18n,
   data-i18n-attr reference across the shipped shell scripts + HTML must
   resolve to a real i18n.js key (data-i18n-setlabel is exempt — it goes
   through tSetLabel() against curriculum data, not the I18N table).
   Dynamic key families (built as `t('prefix.' + someId)` at runtime, so no
   literal string for the regex below to find) are enumerated straight from
   their real sources — DECKS/EAR_POOLS ids in app.js, FRET_STRING_NAMES
   values in coach.js — instead of guessed at.
   ════════════════════════════════════════════════════════════════════ */
const I18N_SCAN_JS_FILES = ['app.js', 'coach.js', 'fab-tools.js', 'tuner.js', 'teacher.js',
  'live-quiz.js', 'guitar-diagrams.js', 'class-activities.js', 'config-main.js', 'i18n.js'];

// (stripJsComments lives in the shared-helpers block above — i18n.js's own
// top-of-file "how to add a key" doc comment uses example strings like
// data-i18n="your.key" that would otherwise false-positive as a missing key.)
function scanI18nRefs(file, KEYS, used, missing) {
  let src;
  try { src = readFileSync(join(ROOT, file), 'utf8'); } catch { return; }
  if (/\.js$/.test(file)) src = stripJsComments(src);
  const lines = src.split('\n');
  lines.forEach((ln, i) => {
    let m;
    // literal t('key') / t("key") — t(variable) / t('a'+b) calls are dynamic,
    // deliberately not matched here (nothing after the quote but the quote).
    const tRe = /(?:^|[^A-Za-z0-9_$.])t\(\s*(['"])([^'"\n]+)\1\s*[,)]/g;
    while ((m = tRe.exec(ln))) {
      const k = m[2]; used.add(k);
      if (!KEYS.has(k)) missing.push({ file, line: i + 1, key: k });
    }
    // data-i18n="key" / data-i18n-html="key" (both plain and \"-escaped, for
    // template-literal HTML built inside a .js file) — -attr/-setlabel skipped.
    const dRe = /data-i18n(?:-html)?=\\?["']([a-zA-Z0-9_.]+)\\?["']/g;
    while ((m = dRe.exec(ln))) {
      const k = m[1]; used.add(k);
      if (!KEYS.has(k)) missing.push({ file, line: i + 1, key: k });
    }
    // data-i18n-attr="attr:key;attr2:key2" (one or more attr:key pairs)
    const aRe = /data-i18n-attr=\\?["']([^"'\\]+)\\?["']/g;
    while ((m = aRe.exec(ln))) {
      m[1].split(';').forEach(pair => {
        const key = (pair.split(':')[1] || '').trim();
        if (key) { used.add(key); if (!KEYS.has(key)) missing.push({ file, line: i + 1, key }); }
      });
    }
  });
}

function checkMissingI18nKeys(I18N) {
  head('1f. i18n key references resolve');
  if (!I18N) { warn('skipped — the i18n.js table failed to load (see 1e above)'); warnings++; return; }
  const KEYS = new Set(Object.keys(I18N));

  let dynamicBad = 0;
  try {
    const DECKS = loadConstObject(readFileSync(join(ROOT, 'app.js'), 'utf8'), 'DECKS');
    for (const id of Object.keys(DECKS)) {
      const k = 'deck.' + id;
      if (!KEYS.has(k)) { err(`app.js DECKS['${id}'] has no matching i18n key '${k}'`); problems++; dynamicBad++; }
    }
  } catch (e) { warn(`could not enumerate DECKS from app.js: ${e.message}`); warnings++; }
  try {
    const EAR_POOLS = loadConstObject(readFileSync(join(ROOT, 'app.js'), 'utf8'), 'EAR_POOLS');
    for (const id of Object.keys(EAR_POOLS)) {
      const k = 'ear.' + id;
      if (!KEYS.has(k)) { err(`app.js EAR_POOLS['${id}'] has no matching i18n key '${k}'`); problems++; dynamicBad++; }
    }
  } catch (e) { warn(`could not enumerate EAR_POOLS from app.js: ${e.message}`); warnings++; }
  /* live-quiz.js's LIVE_QUIZZES stores its student-facing text as i18n KEYS
     (titleKey/promptKey/choice.key) rather than as strings, so a typo or a
     deleted key would show a student the raw key at the exact moment a whole
     class is looking at it. Enumerated from the real bank, same as DECKS and
     EAR_POOLS above — an added quiz is covered automatically. */
  /* `type` picks the question shape — missing/'mc' needs `choices`
     (each with id/key/color); 'fret' needs `strings` instead (a valid,
     de-duped guitar-diagrams kind list) and no `choices`, plus a promptKey
     whose EN and ES text both carry {note} and {string} (the live quiz's
     tIn() fills them in per-language on the projector). Any other `type`
     is an error. Structural, not just key-existence — a fret quiz that
     silently kept an mc `choices` array, or a prompt missing a param in
     just one language, wouldn't show up as a missing i18n key. */
  const LQ_VALID_STRINGS = new Set(['lowE', 'A', 'D', 'G', 'B', 'highE']);
  try {
    const LIVE_QUIZZES = loadConstObject(readFileSync(join(ROOT, 'live-quiz.js'), 'utf8'), 'LIVE_QUIZZES');
    for (const id of Object.keys(LIVE_QUIZZES)) {
      const q = LIVE_QUIZZES[id];
      const keys = [q.titleKey, q.promptKey, ...(q.choices || []).map(c => c.key)];
      for (const k of keys) {
        if (!k) { err(`live-quiz.js LIVE_QUIZZES['${id}'] is missing an i18n key (titleKey/promptKey/choice key)`); problems++; dynamicBad++; continue; }
        if (!KEYS.has(k)) { err(`live-quiz.js LIVE_QUIZZES['${id}'] references i18n key '${k}' which does not exist`); problems++; dynamicBad++; }
      }
      const type = q.type == null ? 'mc' : q.type;
      if (type === 'mc') {
        if (!Array.isArray(q.choices) || !q.choices.length) {
          err(`live-quiz.js LIVE_QUIZZES['${id}'] is type 'mc' but has no choices`); problems++; dynamicBad++;
        } else {
          for (const c of q.choices) {
            if (!c.id || !c.key || !c.color) { err(`live-quiz.js LIVE_QUIZZES['${id}'] has a choice missing id/key/color`); problems++; dynamicBad++; }
          }
        }
      } else if (type === 'fret') {
        if (q.choices) { err(`live-quiz.js LIVE_QUIZZES['${id}'] is type 'fret' but also has choices`); problems++; dynamicBad++; }
        const strings = Array.isArray(q.strings) ? q.strings : [];
        if (!strings.length) { err(`live-quiz.js LIVE_QUIZZES['${id}'] is type 'fret' but has no strings`); problems++; dynamicBad++; }
        const seen = new Set();
        for (const k2 of strings) {
          if (!LQ_VALID_STRINGS.has(k2)) { err(`live-quiz.js LIVE_QUIZZES['${id}'].strings has invalid entry '${k2}'`); problems++; dynamicBad++; }
          if (seen.has(k2)) { err(`live-quiz.js LIVE_QUIZZES['${id}'].strings has a duplicate entry '${k2}'`); problems++; dynamicBad++; }
          seen.add(k2);
        }
        const entry = I18N && q.promptKey ? I18N[q.promptKey] : null;
        if (entry) {
          for (const lang of ['en', 'es']) {
            const str = entry[lang] || '';
            if (!str.includes('{note}') || !str.includes('{string}')) {
              err(`live-quiz.js LIVE_QUIZZES['${id}'].promptKey '${q.promptKey}' (${lang}) must contain both {note} and {string}`); problems++; dynamicBad++;
            }
          }
        }
      } else {
        err(`live-quiz.js LIVE_QUIZZES['${id}'] has unknown type '${q.type}'`); problems++; dynamicBad++;
      }
    }
  } catch (e) { warn(`could not enumerate LIVE_QUIZZES from live-quiz.js: ${e.message}`); warnings++; }
  try {
    const FRET_STRING_NAMES = loadConstObject(readFileSync(join(ROOT, 'coach.js'), 'utf8'), 'FRET_STRING_NAMES');
    for (const suffix of Object.values(FRET_STRING_NAMES)) {
      const k = 'games.fret.string.' + suffix;
      if (!KEYS.has(k)) { err(`coach.js FRET_STRING_NAMES has no matching i18n key '${k}'`); problems++; dynamicBad++; }
    }
  } catch (e) { warn(`could not enumerate FRET_STRING_NAMES from coach.js: ${e.message}`); warnings++; }

  const used = new Set(), missing = [];
  const htmlFiles = ['index.html', '404.html', ...TAB_PAGES.filter(f => f.endsWith('.html'))];
  for (const f of I18N_SCAN_JS_FILES) scanI18nRefs(f, KEYS, used, missing);
  for (const f of MODULE_FILES) scanI18nRefs(f, KEYS, used, missing);
  for (const f of htmlFiles) scanI18nRefs(f, KEYS, used, missing);
  // tabs/journey.js calls t() too (journey.saving/saved/gatedTitle/…) but
  // isn't in I18N_SCAN_JS_FILES — it's the one shipped script that's neither
  // a shell script nor a Journey HTML page. Scanned on its own rather than
  // widening that list, since it's the only exception.
  scanI18nRefs('tabs/journey.js', KEYS, used, missing);

  for (const m of missing) { err(`${m.file}:${m.line} references i18n key '${m.key}' which does not exist`); problems++; }
  if (missing.length === 0 && dynamicBad === 0) {
    ok(`every i18n key reference across ${I18N_SCAN_JS_FILES.length + MODULE_FILES.length + htmlFiles.length + 1} files (+ the dynamic deck/ear/fret-string/live-quiz families) resolves`);
  }
}

/* ════════════════════════════════════════════════════════════════════
   1cb. LIVE QUIZ — a repaint keeps the countdown's real time left
   (2026-10-26 audit, MISC-1). The question HTML draws the timer at the FULL
   limit, and the stage is repainted on every answer. Without a resync right
   after the paint the projector flickered back to "20" on each answer, and an
   answer landing after "Time's up" froze it on "20" (2.5 on a fret round)
   until Reveal; the student screen did the same on a language switch, with
   its choice buttons enabled again. EXECUTES the real live-quiz.js in its own
   VM with a minimal fake DOM (the file must not depend on app.js, so none is
   loaded) and repaints every timed question view — stage mc, stage fret,
   student mc, student fret — once mid-countdown and once after time-up.
   Pinned at 8 cases so a view that stops rendering cannot drop out silently.
   ════════════════════════════════════════════════════════════════════ */
const LQ_TIMER_CASES = 8;
function checkLiveQuizTimerRepaint() {
  head('1cb. Live quiz: a repaint keeps the countdown\'s real time left');
  let bad = 0, cases = 0;
  const flag = m => { err(`1cb: ${m}`); problems++; bad++; };
  const TIME_UP = '<time up>';
  const byId = {};
  const mkEl = id => {
    const cls = new Set();
    const el = { id, textContent: '', buttons: [], kids: [],
      classList: { add: c => cls.add(c), remove: c => cls.delete(c), toggle: (c, on) => (on ? cls.add(c) : cls.delete(c)), contains: c => cls.has(c) },
      setAttribute() {}, hasAttribute: () => false, removeAttribute() {}, querySelector: () => null, querySelectorAll: () => [] };
    let html = '';
    Object.defineProperty(el, 'innerHTML', { get: () => html, set(h) {
      html = String(h);
      for (const k of el.kids) delete byId[k];
      el.kids = []; el.buttons = [];
      for (const m of html.matchAll(/<div class="lq(?:-st)?-timer" id="([^"]+)"[^>]*>([^<]*)<\/div>/g)) {
        const c = mkEl(m[1]); c.textContent = m[2]; byId[m[1]] = c; el.kids.push(m[1]);
      }
      for (const _ of html.matchAll(/class="lq-choice"/g)) el.buttons.push({ disabled: false });
    } });
    return el;
  };
  for (const id of ['lq-stage', 'lq-controls', 'live-quiz-body']) byId[id] = mkEl(id);
  let now = 1e6;
  const box = {
    console: { log() {}, warn() {}, error() {} },
    performance: { now: () => now },
    setInterval: () => 1, clearInterval() {}, setTimeout: () => 1, clearTimeout() {},
    localStorage: { getItem: () => null, setItem() {} }, sessionStorage: { getItem: () => null, setItem() {} },
    document: { hidden: false, getElementById: id => byId[id] || null,
      querySelectorAll: sel => (sel === '#live-quiz-body .lq-choice' ? byId['live-quiz-body'].buttons : []),
      addEventListener() {}, body: { classList: { add() {}, remove() {} }, appendChild() {} }, createElement: () => mkEl('x'), contains: () => false },
    t: k => (k === 'lq.timeUp' ? TIME_UP : k), tIn: k => k,
    escHtml: s => String(s), escAttr: s => String(s), applyI18n() {}, firebase: {}
  };
  box.window = { addEventListener() {} };
  try {
    vm.createContext(box);
    vm.runInContext(readFileSync(join(ROOT, 'live-quiz.js'), 'utf8'), box, { filename: 'live-quiz.js' });
    vm.runInContext('var teacherView = "livequiz";', box);
  } catch (e) { flag(`live-quiz.js would not load in the test VM: ${e.message}`); return; }
  const fretId = vm.runInContext('Object.keys(LIVE_QUIZZES).find(k => LIVE_QUIZZES[k].type === "fret") || ""', box);
  const mcId = vm.runInContext('Object.keys(LIVE_QUIZZES).find(k => (LIVE_QUIZZES[k].type || "mc") === "mc") || ""', box);
  if (!fretId || !mcId) { flag(`the bank needs one mc and one fret quiz to test (mc: ${mcId || 'none'}, fret: ${fretId || 'none'})`); return; }
  const views = [
    { name: 'stage mc', quiz: mcId, limit: 20, stage: true },
    { name: 'stage fret', quiz: fretId, limit: 2.5, stage: true },
    { name: 'student mc', quiz: mcId, limit: 20, stage: false },
    { name: 'student fret', quiz: fretId, limit: 2.5, stage: false }
  ];
  for (const v of views) {
    for (const [when, goneMs, want] of [['mid-countdown', v.limit === 20 ? 7200 : 1000, v.limit === 20 ? '13' : '1.5'], ['after time-up', v.limit * 1000 + 3000, TIME_UP]]) {
      const sess = JSON.stringify({ state: 'question', sessionId: `S-${v.name}-${when}`, qIndex: 0, quizId: v.quiz, limitSec: v.limit, target: { string: 'lowE', note: 'G' }, scores: {} });
      const timerId = v.stage ? 'lq-st-timer' : 'lq-timer';
      try {
        vm.runInContext(v.stage
          ? `lqTSession = ${sess}; lqTQOpenedAt = ${now - goneMs}; lqTAnswers = [{ sessionId: lqTSession.sessionId, qIndex: 0, uid: 'u1', name: 'A', choice: 'a' }]; lqPaintStage();`
          : `lqSession = ${sess}; lqQOpenedAt = ${now - goneMs}; lqMyAnswer = null; lqRestoring = null; lqRenderStudent();`, box);
      } catch (e) { flag(`${v.name} ${when}: the repaint threw ${e.message}`); continue; }
      cases++;
      const el = byId[timerId];
      if (!el) { flag(`${v.name} ${when}: no #${timerId} on a timed question`); continue; }
      if (el.textContent !== want) flag(`${v.name} ${when}: the repainted timer reads "${el.textContent}", want "${want === TIME_UP ? "Time's up" : want}" — re-sync the tick right after the paint (lqStageSyncTick / lqSyncTick)`);
      if (want === TIME_UP && !el.classList.contains('out')) flag(`${v.name} ${when}: the repainted timer lost its "out" colour`);
      if (want === TIME_UP && v.name === 'student mc') {
        const b = byId['live-quiz-body'].buttons;
        if (!b.length || b.some(x => !x.disabled)) flag(`student mc after time-up: ${b.filter(x => !x.disabled).length} of ${b.length} choice buttons are enabled again after the repaint`);
      }
    }
  }
  if (cases !== LQ_TIMER_CASES) flag(`ran ${cases} repaint cases, pinned at ${LQ_TIMER_CASES}`);
  if (bad === 0) ok(`${cases} timed live-quiz repaints (stage + student, mc + fret, mid-countdown + after time-up) keep the real time left`);
}

/* ════════════════════════════════════════════════════════════════════
   1g. DUPLICATE TOP-LEVEL GLOBALS — a same-named top-level function in two
   shipped classic scripts silently lets whichever loads LAST win, with no
   error (see fab-tools.js/app.js's flashClass history). Two mirrors are
   deliberate and stay allowed as long as the bodies are byte-identical
   (whitespace aside); any other repeated name, or the two known mirrors
   drifting apart, is a real bug.
   ════════════════════════════════════════════════════════════════════ */
const DUPLICATE_GLOBALS_ALLOWED = new Set(['isTuningWarmupSection']);
const CLASSIC_SCRIPTS = ['app.js', 'fab-tools.js', 'tuner.js', 'coach.js', 'teacher.js',
  'live-quiz.js', 'config-main.js', 'guitar-diagrams.js', 'class-activities.js', ...MODULE_FILES];

function checkDuplicateGlobals() {
  head('1g. Duplicate top-level globals');
  const byName = new Map();   // name → [{file, src, index}]
  for (const file of CLASSIC_SCRIPTS) {
    let src;
    try { src = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
    for (const d of topLevelFunctionDecls(src)) {
      if (!byName.has(d.name)) byName.set(d.name, []);
      byName.get(d.name).push({ file, src, index: d.index });
    }
  }
  let bad = 0;
  // Regression guard for Phase 3.8: flashClass must stay fab-tools.js-only.
  if ((byName.get('flashClass') || []).some(o => o.file === 'app.js')) {
    err("flashClass has reappeared in app.js — fab-tools.js is meant to be its only definition (loads on every page app.js does)");
    problems++; bad++;
  }
  for (const [name, occurrences] of byName) {
    if (occurrences.length < 2) continue;
    const files = occurrences.map(o => o.file);
    if (DUPLICATE_GLOBALS_ALLOWED.has(name)) {
      const bodies = new Set(occurrences.map(o => functionBodyAt(o.src, o.index).replace(/\s+/g, ' ').trim()));
      if (bodies.size > 1) {
        err(`'${name}' is mirrored in ${files.join(', ')} but the bodies no longer match — the intentional mirror has drifted`);
        problems++; bad++;
      }
      continue;
    }
    err(`'${name}' is defined as a top-level function in more than one shipped script (${files.join(', ')}) — whichever loads LAST silently wins`);
    problems++; bad++;
  }
  if (bad === 0) ok('no unexpected duplicate top-level function names across shipped classic scripts');
}

/* coach.js and teacher.js are loaded on first use (ensureCoachJs /
   ensureTeacherJs in app.js), so a function that lives only in one of them
   does not exist yet when the page first paints. An inline on*= handler in
   index.html that calls one throws a ReferenceError on the first click — the
   global safety net shows "Something went wrong", and every click after that
   fails silently. The Games button shipped exactly that way on 2026-09-08
   (toggleGames lived in coach.js). Handlers INSIDE the region a lazy script
   owns are fine: the games screen and the teacher console can only be on
   screen once their script has loaded. */
const LAZY_SCRIPTS = { 'coach.js': ['games-screen'], 'teacher.js': ['teacher-app', 'teacher-denied'] };

// [start, end) of the element whose opening tag contains `attrIndex`, by
// counting same-name open/close tags from there. Only the region roots
// (plain <div>s) are looked up this way, so no void/self-closing handling.
function elementRange(html, attrIndex) {
  const open = html.lastIndexOf('<', attrIndex);
  const tag = /^<([a-zA-Z0-9-]+)/.exec(html.slice(open))[1];
  const re = new RegExp(`<(/?)${tag}\\b`, 'g');
  re.lastIndex = open;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return [open, html.indexOf('>', m.index) + 1];
  }
  return [open, html.length];
}

function checkLazyHandlers() {
  head('1u. Inline handlers in index.html reach only into eagerly-loaded scripts');
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  const eager = new Set();
  for (const file of [...CLASSIC_SCRIPTS, 'i18n.js', 'firebase-config.js']) {
    if (LAZY_SCRIPTS[file]) continue;
    let src;
    try { src = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
    for (const d of topLevelFunctionDecls(src)) eager.add(d.name);
  }
  const lazyOnly = new Map();   // name → script file
  const safeRanges = [];        // [start, end, file]
  for (const [file, rootIds] of Object.entries(LAZY_SCRIPTS)) {
    for (const d of topLevelFunctionDecls(readFileSync(join(ROOT, file), 'utf8'))) {
      if (!eager.has(d.name)) lazyOnly.set(d.name, file);
    }
    for (const id of rootIds) {
      const i = html.indexOf(`id="${id}"`);
      if (i < 0) { err(`index.html has no #${id} — the ${file} region 1u expects is gone; update LAZY_SCRIPTS`); problems++; continue; }
      safeRanges.push([...elementRange(html, i), file]);
    }
  }
  let bad = 0;
  for (const m of html.matchAll(/\son[a-z]+="([^"]*)"/g)) {
    for (const call of m[1].matchAll(/([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g)) {
      const file = lazyOnly.get(call[1]);
      if (!file) continue;
      if (safeRanges.some(([a, b, f]) => f === file && m.index >= a && m.index < b)) continue;
      const line = html.slice(0, m.index).split('\n').length;
      err(`index.html:${line} handler calls ${call[1]}(), which exists only in lazily-loaded ${file} — define an app.js entry point that loads it first (see coachOpenLazy / toggleGames)`);
      problems++; bad++;
    }
  }
  if (bad === 0) ok('every inline handler resolves before coach.js / teacher.js have loaded');
}

/* ════════════════════════════════════════════════════════════════════
   2. LINKS — verify external YouTube / Google-Docs URLs still resolve
   ════════════════════════════════════════════════════════════════════ */
function collectUrls() {
  const urls = new Map();          // url → Set(files it appears in)
  const anchorLabels = new Map();  // youtube url → Set(anchor texts, range labels stripped)
  for (const file of [...MODULE_FILES, 'config-main.js', 'index.html']) {
    const src = readFileSync(join(ROOT, file), 'utf8');
    for (const m of src.matchAll(/https?:\/\/[^\s"'<>)]+/g)) {
      const u = m[0].replace(/[.,]+$/, '');
      if (!/youtube\.com|youtu\.be|docs\.google\.com/.test(u)) continue;
      if (!urls.has(u)) urls.set(u, new Set());
      urls.get(u).add(file);
    }
    // Anchor text for each YouTube link, so checkLinks can compare it with
    // the real title oEmbed reports (a renamed video otherwise drifts silently).
    // Only "Title – Channel" style anchors qualify — descriptive link text
    // ("a slow Dm practice jam") intentionally doesn't quote the title.
    for (const m of src.matchAll(/<a href="(https?:\/\/[^"]+)"[^>]*>([^<]+)<\/a>/g)) {
      const u = m[1];
      if (!/youtube\.com|youtu\.be/.test(u)) continue;
      const label = m[2].replace(/\\'/g, "'").replace(/\(\d+:\d{2}[^)]*\)/g, '').trim();
      if (!label || !label.includes(' – ')) continue;
      if (!anchorLabels.has(u)) anchorLabels.set(u, new Set());
      anchorLabels.get(u).add(label);
    }
  }
  return { urls, anchorLabels };
}

function youtubeId(url) {
  const m = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

async function fetchWithTimeout(url, opts = {}, ms = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { ...opts, signal: ctrl.signal, redirect: 'follow' }); }
  finally { clearTimeout(t); }
}

async function checkOne(url) {
  const id = youtubeId(url);
  try {
    if (id) {
      // oEmbed: 200 + JSON for a live public video, 401/403/404 otherwise.
      const r = await fetchWithTimeout(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
      if (r.ok) {
        const j = await r.json().catch(() => null);
        return { url, state: 'ok', title: j && j.title, author: j && j.author_name };
      }
      if (r.status === 401 || r.status === 403) return { url, state: 'private', detail: `HTTP ${r.status}` };
      return { url, state: 'dead', detail: `HTTP ${r.status}` };
    }
    // Google Docs & anything else: a HEAD that resolves is good enough.
    // Google often 200s a login page for private docs, so we only hard-fail
    // on an outright 404/410 (a deleted doc).
    const r = await fetchWithTimeout(url, { method: 'GET' });
    if (r.status === 404 || r.status === 410) return { url, state: 'dead', detail: `HTTP ${r.status}` };
    return { url, state: 'ok' };
  } catch (e) {
    return { url, state: 'error', detail: e.name === 'AbortError' ? 'timeout' : e.message };
  }
}

async function checkLinks() {
  head('2. Checking external links');
  const { urls, anchorLabels } = collectUrls();
  const list = [...urls.keys()];
  console.log(`${C.dim}  ${list.length} unique YouTube / Docs links…${C.reset}`);

  const CONCURRENCY = 12;
  const results = [];
  for (let i = 0; i < list.length; i += CONCURRENCY) {
    results.push(...await Promise.all(list.slice(i, i + CONCURRENCY).map(checkOne)));
    process.stdout.write(`${C.dim}  ${Math.min(i + CONCURRENCY, list.length)}/${list.length}\r${C.reset}`);
  }
  process.stdout.write('\n');

  const dead    = results.filter(r => r.state === 'dead');
  const priv    = results.filter(r => r.state === 'private');
  const errored = results.filter(r => r.state === 'error');

  for (const r of dead) {
    err(`DEAD: ${r.url}  (${r.detail})`);
    for (const f of urls.get(r.url)) console.log(`${C.dim}      ↳ ${f}${C.reset}`);
    problems++;
  }
  for (const r of priv) { warn(`private/blocked: ${r.url} (${r.detail}) — verify manually`); warnings++; }
  for (const r of errored) { warn(`could not reach: ${r.url} (${r.detail}) — network?`); warnings++; }

  // Title drift: the anchor text students see should still resemble the video's
  // real title (creators rename videos; two drifted titles shipped unnoticed
  // before the 2026-08-01 sweep). Warning-level — token overlap is a heuristic.
  const norm = s => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim();
  let drifted = 0;
  for (const r of results) {
    if (r.state !== 'ok' || !r.title) continue;
    for (const label of anchorLabels.get(r.url) || []) {
      const have = norm(`${r.title} ${r.author || ''}`).replace(/ /g, '');
      const toks = norm(label).split(' ').filter(w => w.length >= 3);
      if (!toks.length) continue;
      const hit = toks.filter(t => have.includes(t)).length;
      if (hit / toks.length < 0.5) {
        warn(`title drift? link text "${label}" vs actual "${r.title}" (${r.author || '?'}) — ${r.url}`);
        warnings++; drifted++;
      }
    }
  }
  if (drifted === 0) ok('anchor texts still match the videos\' real titles');

  if (dead.length === 0) ok(`no dead links (${results.length - priv.length - errored.length} reachable)`);
}

/* ════════════════════════════════════════════════════════════════════
   3. SW BUMP — make CACHE_VERSION a fingerprint of the shell files
   ════════════════════════════════════════════════════════════════════ */
/* Text files are normalised to LF before hashing. On a checkout with
   core.autocrlf=true (the Windows main checkout) git stores LF but writes
   CRLF to disk, while a worktree can hold LF — so hashing raw bytes made
   CACHE_VERSION depend on WHICH checkout ran the checks, and the two would
   overwrite each other’s bump forever. Found 2026-09-08, when a docs-only
   edit in the main checkout demanded a bump. Binary files (audio, raster
   icons) are still hashed byte-exact, so a re-exported track changes its
   fingerprint and its hash in sw.js's AUDIO_HASHES block. */
const TEXT_FOR_HASH = /\.(js|mjs|css|html|json|svg|md|txt|rules|webmanifest)$/i;
function fingerprint(files, extra = '') {
  const h = createHash('sha256');
  if (extra) h.update(extra.replace(/\r\n/g, '\n') + '\0');
  for (const f of files) {
    try {
      const raw = readFileSync(join(ROOT, f));
      h.update(f + '\0');
      h.update(TEXT_FOR_HASH.test(f)
        ? Buffer.from(raw.toString('utf8').replace(/\r\n/g, '\n'), 'utf8')
        : raw);
    }
    catch { /* file may not exist (e.g. optional icon) — skip */ }
  }
  return h.digest('hex').slice(0, 10);
}

/* Parity guard: sw.js's hand-maintained ASSETS list drifts from reality in
   two silent ways — a new shell file that never gets precached (breaks
   offline), or a stale entry for a deleted file (cache.addAll rejects and
   the whole SW install fails). Parse ASSETS out of sw.js and check both. */
/* One regex for both lists. ASSETS used [^']+ and PRECACHE_CRITICAL [^']*,
   so './' — the site root, and the first entry in both — was captured on the
   critical side and then special-cased away, and never captured on the ASSETS
   side at all. The one entry the install depends on most was the one entry
   the cross-check couldn't see. */
const SW_ENTRY_RE = /'\.\/([^']*)'/g;
const swEntries = block => [...block.matchAll(SW_ENTRY_RE)].map(x => x[1]);
function checkSwAssets(src) {
  const m = src.match(/const ASSETS = \[([\s\S]*?)\];/);
  if (!m) { err('could not find ASSETS in sw.js'); problems++; return; }
  const assets = swEntries(m[1]);
  let bad = 0;
  for (const a of assets) {
    // './' is the site root: GitHub Pages serves index.html for it.
    try { readFileSync(join(ROOT, a === '' ? 'index.html' : a)); }
    catch { err(`sw.js ASSETS lists './${a}' but the file doesn't exist — SW install would fail`); problems++; bad++; }
  }
  // Every fingerprinted shell file belongs in the precache (icons/manifest
  // are listed in ASSETS too, but SHELL_FILES is the must-have core).
  for (const f of SHELL_FILES) {
    if (SHELL_NOT_PRECACHED.includes(f)) {
      if (assets.includes(f)) { err(`'${f}' is in sw.js ASSETS but checks.mjs SHELL_NOT_PRECACHED says it stays out of the precache — drop it from one of the two lists`); problems++; bad++; }
      continue;
    }
    if (!assets.includes(f)) { err(`shell file '${f}' is missing from sw.js ASSETS — it won't be precached for offline`); problems++; bad++; }
  }
  /* A script index.html loads with a plain <script src> runs on EVERY page, so it
     cannot be "kept out of the precache": offline, every page load would ask for a
     file the cache does not hold (Friday check R2-4, trainer-site-adapter.js,
     2026-10-31). The two lists above only compare each other, so moving such a file
     onto SHELL_NOT_PRECACHED and off ASSETS in ONE edit passed every check (review
     R3-4). Comments are stripped first: index.html names coach.js and teacher.js in
     comments, and they are loaded on demand. */
  let pageScripts = [];
  try {
    const idxHtml = readFileSync(join(ROOT, 'index.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
    pageScripts = [...idxHtml.matchAll(/<script\b[^>]*\bsrc="(?!https?:|\/\/)(?:\.\/)?([^"?#]+)"/g)].map(x => x[1]);
  } catch { err('index.html could not be read \u2014 the every-page scripts cannot be checked against ASSETS'); problems++; bad++; }
  for (const f of pageScripts) {
    if (!assets.includes(f)) { err(`index.html loads '${f}' with <script src> on every page but sw.js ASSETS does not precache it${SHELL_NOT_PRECACHED.includes(f) ? ' (SHELL_NOT_PRECACHED keeps it out: that list is for files loaded on demand)' : ''} \u2014 offline, every page load would ask for a script the cache does not hold`); problems++; bad++; }
  }
  // An entry for a file that is no longer a shell file excuses nothing — remove it.
  for (const f of SHELL_NOT_PRECACHED) {
    if (!SHELL_FILES.includes(f)) { err(`checks.mjs SHELL_NOT_PRECACHED lists '${f}', which is not in SHELL_FILES — delete the entry`); problems++; bad++; }
  }
  /* PRECACHE_CRITICAL is the must-succeed tier of the install (sw.js splits
     the rest into a best-effort allSettled pass). An entry that isn't in
     ASSETS would be fetched by the install but skipped by every check above,
     including the ASSETS→disk one — so a typo there could hard-fail the
     install for the whole class with nothing to show for it. */
  /* Its own counter. Sharing `bad` meant an unrelated failure above silently
     suppressed a true "criticals fine" line, so a green run and a run whose
     criticals were never confirmed looked the same. */
  let critBad = 0;
  const cm = src.match(/const PRECACHE_CRITICAL = \[([\s\S]*?)\];/);
  if (!cm) { err('could not find PRECACHE_CRITICAL in sw.js'); problems++; critBad++; }
  else {
    const critical = swEntries(cm[1]);
    for (const c of critical) {
      if (!assets.includes(c))
        { err(`sw.js PRECACHE_CRITICAL lists './${c}' but ASSETS doesn't — the install would fetch a file nothing else checks`); problems++; critBad++; }
    }
    if (critBad === 0) ok(`${critical.length} critical precache entries all present in ASSETS`);
  }
  if (bad === 0) ok(`sw.js ASSETS ↔ shell files in sync (${assets.length} assets; ${SHELL_NOT_PRECACHED.length} shell files kept out on purpose: ${SHELL_NOT_PRECACHED.join(', ')}); all ${pageScripts.length} scripts index.html loads on every page are precached`);
}

/* Ratchet (2026-09-02 audit): a local file that shipped content REFERENCES but
   sw.js never precaches breaks offline for any student who goes offline before
   first viewing it — then self-heals on their next online view, so it is nearly
   invisible in normal testing. checkSwAssets() above only walks ASSETS→disk and
   SHELL_FILES→ASSETS, and SHELL_FILES carries no img/ or standalone-page
   entries, so this whole class slipped past it. Three were live at once:
   img/m1-note-circle-{en,es}.svg (module-1.js's tuner note-circle figure) and
   mood-chart.html (a student nav button in index.html). Walk the actual
   references rather than a hand-maintained list, so a new figure or page is
   caught the first time it ships.

   tabs/ is deliberately exempt: those pages are runtime-cached cache-first and
   fingerprinted via TAB_PAGES, not precached. Dangling references are left to
   the asset checks — this one only asks "is what we ship also cached?" */
function checkPrecacheCoverage(src) {
  const m = src.match(/const ASSETS = \[([\s\S]*?)\];/);
  if (!m) return;                     // checkSwAssets already reported the parse failure
  const assets = new Set([...m[1].matchAll(/'\.\/([^']+)'/g)].map(x => x[1]));

  const refs = new Map();             // referenced path -> first file referencing it
  /* The trailing lookahead matters: without it `label.htmlFor='…'` in
     teacher.js reads as a reference to a file called label.html. */
  const re = /(?:^|['"(\s])(?:\.\/)?(img\/[A-Za-z0-9._-]+\.(?:svg|jpg|jpeg|png|gif|webp)|[A-Za-z0-9._-]+\.html)(?![A-Za-z0-9._-])/g;
  for (const file of ['index.html', 'app.js', 'teacher.js', 'class-activities.js', ...MODULE_FILES]) {
    let text;
    try { text = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
    /* Comments masked first. class-activities.js documents its own schema in
       a 176-line header comment whose example figure path is deliberately
       fictional — reading it as a real reference would fail every push. */
    text = file.endsWith('.html')
      ? text.replace(/<!--[\s\S]*?-->/g, '')
      : maskComments(text);
    for (const r of text.matchAll(re)) if (!refs.has(r[1])) refs.set(r[1], file);
  }

  let bad = 0, missing = 0;
  for (const [p, from] of refs) {
    /* Does it exist at all? Nothing asked this before 2026-09-08: this walk
       skipped anything not on disk as "another check's job", and there was no
       other check — so a figure path with a typo would have shipped as a
       broken image in a student's card with every check green. */
    try { readFileSync(join(ROOT, p)); }
    catch {
      err(`${from} references './${p}' but no such file exists — it would ship as a broken image`);
      problems++; bad++; missing++;
      continue;
    }
    if (!assets.has(p)) {
      err(`${from} references './${p}' but sw.js ASSETS doesn't precache it — a student who goes offline before opening it gets nothing`);
      problems++; bad++;
    }
  }
  if (bad === 0) ok(`every referenced img/ file and standalone page exists and is precached (${refs.size} checked)`);
  else if (!missing) ok(`all ${refs.size} referenced files exist on disk`);
}

/* Journey pages are referenced by ~30 hand-typed 'tabs/*.html' strings across
   module files and config — none previously validated (the link checker only
   covers external URLs). A renamed/removed journey page shipped a 404 with no
   net; this catches it. */
function checkJourneyPaths() {
  let bad = 0;
  for (const file of [...MODULE_FILES, 'config-main.js']) {
    const src = readFileSync(join(ROOT, file), 'utf8');
    for (const m of src.matchAll(/tabs\/([a-z0-9-]+\.html)/g)) {
      try { readFileSync(join(ROOT, 'tabs', m[1])); }
      catch { err(`${file} references tabs/${m[1]} which does not exist`); problems++; bad++; }
    }
  }
  if (bad === 0) ok('all tabs/*.html journey references resolve');
}

/* The Firestore SDK version (currently 10.12.2) is hardcoded as a gstatic.com
   URL fragment independently in app.js, index.html, and each tabs/*.html
   page (sw.js doesn't reference it directly). Nothing else catches a page
   drifting to a different version, so diff every occurrence found. */
/* The teacher's email is the ONLY thing separating the dashboard's data
   from every student, and it is written in two places: TEACHER_EMAIL in
   firebase-config.js (which decides what the UI shows) and isTeacher() in
   firestore.rules (which decides what Firestore actually hands over). If
   they drift, the failure is silent and one-directional — the dashboard
   renders, then every read comes back empty or permission-denied.

   This cannot verify what the Firebase console has DEPLOYED; rules are
   published by hand there. It only keeps the repo self-consistent. */
function checkFirestoreRules() {
  const rulesPath = join(ROOT, 'firestore.rules');
  let rules;
  try { rules = readFileSync(rulesPath, 'utf8'); }
  catch { warn('no firestore.rules in the repo — the security rules exist only in the Firebase console, unversioned'); warnings++; return; }

  const cfg = readFileSync(join(ROOT, 'firebase-config.js'), 'utf8');
  const cfgEmail = (cfg.match(/TEACHER_EMAIL\s*=\s*['"]([^'"]+)['"]/) || [])[1];
  const ruleEmails = [...rules.matchAll(/token\.email\s*==\s*['"]([^'"]+)['"]/g)].map(m => m[1]);

  if (!cfgEmail) { warn('could not read TEACHER_EMAIL from firebase-config.js'); warnings++; return; }
  if (!ruleEmails.length) { err('firestore.rules has no teacher email check — the dashboard would be readable by any signed-in student'); problems++; return; }
  const mismatched = [...new Set(ruleEmails)].filter(e => e !== cfgEmail);
  if (mismatched.length) {
    err(`teacher email drift: firebase-config.js has "${cfgEmail}", firestore.rules has "${mismatched.join('", "')}"`);
    problems++;
  } else {
    ok(`firestore.rules teacher email matches firebase-config.js (${cfgEmail})`);
  }
  if (!/email_verified/.test(rules)) {
    warn('firestore.rules does not check email_verified — an unverified account could claim the teacher address');
    warnings++;
  }
}

function checkSdkVersion() {
  const FILES = ['app.js', 'live-quiz.js', 'sw.js', 'index.html', ...TAB_PAGES];
  const found = new Map();   // version → Set(files)
  for (const file of FILES) {
    let src;
    try { src = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
    for (const m of src.matchAll(/firebasejs\/(\d+\.\d+\.\d+)\//g)) {
      if (!found.has(m[1])) found.set(m[1], new Set());
      found.get(m[1]).add(file);
    }
  }
  if (found.size === 0) { warn('no Firestore SDK version references found'); warnings++; return; }
  if (found.size > 1) {
    err(`Firestore SDK version mismatch — ${found.size} different versions in use:`);
    for (const [v, files] of found) console.log(`${C.dim}      ${v}: ${[...files].join(', ')}${C.reset}`);
    problems++;
    return;
  }
  const [[v, files]] = found;
  ok(`Firestore SDK version consistent (${v}) across ${files.size} files`);
}

/* Bumps ONE named `const NAME = '...';` version constant in sw.js against a
   fingerprint of the given files, independently of any other constant in the
   file. Used for CACHE_VERSION (shell + img/). Audio is not versioned this way
   any more (2026-10-30): see syncAudioHashes, which keeps one stable audio
   cache and evicts per file. */
function bumpVersionConst(constName, prefix, files, src, swPath, label, extra = '') {
  const fp = fingerprint(files, extra);
  const date = new Date().toISOString().slice(0, 10);
  const want = `${prefix}-${date}-${fp}`;

  const re = new RegExp(`const ${constName} = '([^']*)';`);
  const line = src.match(re);
  if (!line) { err(`could not find ${constName} in sw.js`); problems++; return src; }
  const current = line[1];

  // The fingerprint is what matters; the date is cosmetic. Consider it current
  // if the content fingerprint already matches (ignore a date-only difference).
  const currentFp = (current.match(/-([0-9a-f]{10})$/) || [])[1];
  if (currentFp === fp) { ok(`${label} up to date (${current})`); return src; }

  if (CHECK_ONLY) {
    err(`${label} stale — files changed but ${constName} wasn't bumped`);
    console.log(`${C.dim}      is:   ${current}${C.reset}`);
    console.log(`${C.dim}      want: ${want}${C.reset}`);
    problems++;
    return src;
  }
  ok(`${label} bumped ${current} → ${want}`);
  return src.replace(line[0], `const ${constName} = '${want}';`);
}

/* sw.js's per-file audio hash map (2026-10-30). The worker keeps all audio in
   one stable cache and evicts a file only when its hash here changed or the file
   is gone, so adding a track costs students nothing. Written between the
   AUDIO_HASHES markers by tools/sw-audio-map.mjs (shared with
   tools/sw-audio-proof.mjs); --check fails when it is stale. Also guards the
   things that would quietly bring back the old purge-everything behaviour or
   vouch for the wrong bytes:
   - the cache NAMES (AUDIO_CACHE_NAME, AUDIO_HASH_CACHE_NAME in
     sw-audio-map.mjs): renaming either drops what every student holds. Read from
     the code with comments stripped, one definition each, so a commented-out old
     line cannot satisfy the pin (Phase 5 review R1-4b);
   - the one-time migration (AUDIO_MIGRATION_FP adopts the stored files as-is).
     That is only true of the tree the stored files were saved under, which is the
     fingerprint in AUDIO_CACHE's own name. So it must be '' or exactly that
     fingerprint AND still be audio/'s fingerprint. Setting it to audio/'s NEW
     fingerprint after a re-export used to pass, and adopted the old bytes under
     the new hash for good (Phase 5 review R1-3).
   The block is written with the file's own line endings (CRLF on a Windows
   checkout). */
function syncAudioHashes(src) {
  const map = audioHashMap(ROOT), n = Object.keys(map).length;
  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  const want = renderAudioBlock(map).replace(/\n/g, eol);
  const code = stripJsComments(src);
  const pin = (what, re, pinned) => {
    const all = [...code.matchAll(re)];
    if (all.length !== 1) { err(`sw.js defines ${what} ${all.length} times outside comments \u2014 it must be defined exactly once, as \`const ${what} = '...';\``); problems++; return null; }
    if (all[0][1] !== pinned) { err(`${what} is '${all[0][1]}', pinned at '${pinned}' in tools/sw-audio-map.mjs \u2014 renaming it drops what every student has downloaded, the tracks or their records (the old per-change purge); change the pin only on purpose`); problems++; }
    return all[0][1];
  };
  pin('AUDIO_CACHE', /^const AUDIO_CACHE = '([^']*)';/gm, AUDIO_CACHE_NAME);
  pin('AUDIO_HASH_CACHE', /^const AUDIO_HASH_CACHE = '([^']*)';/gm, AUDIO_HASH_CACHE_NAME);
  const migs = [...code.matchAll(/^const AUDIO_MIGRATION_FP = '([0-9a-f]*)';/gm)];
  if (migs.length !== 1) { err(`sw.js defines AUDIO_MIGRATION_FP ${migs.length} times outside comments \u2014 exactly one \`const AUDIO_MIGRATION_FP = '...';\` is needed`); problems++; }
  else {
    const fp = migs[0][1], nowFp = fingerprint(AUDIO_FILES), nameFp = AUDIO_CACHE_NAME.split('-').pop();
    if (fp && fp !== nameFp) {
      err(`AUDIO_MIGRATION_FP is '${fp}' but the stored tracks were saved under audio tree '${nameFp}' (the end of AUDIO_CACHE's name) \u2014 the migration adopts every stored track as matching AUDIO_HASHES, so it may only ever be '' or '${nameFp}', never audio/'s new fingerprint`);
      problems++;
    } else if (fp && fp !== nowFp) {
      err(`audio/ has changed since the one-time audio migration was set (AUDIO_MIGRATION_FP '${fp}', audio/ now '${nowFp}') \u2014 the migration adopts every stored track as matching AUDIO_HASHES, which is no longer true: set AUDIO_MIGRATION_FP to '' in sw.js (it has served its deploy; NOT to '${nowFp}'), then re-run`);
      problems++;
    } else ok(fp ? `audio migration still valid (audio/ unchanged since the stored tracks were saved: ${fp})` : 'audio migration retired (AUDIO_MIGRATION_FP is empty)');
  }
  const m = src.match(AUDIO_BLOCK_RE);
  if (!m) { err('sw.js has no AUDIO_HASHES:BEGIN \u2026 AUDIO_HASHES:END block'); problems++; return src; }
  if (m[0] === want) { ok(`audio hash map up to date (${n} files)`); return src; }
  if (CHECK_ONLY) {
    err('audio hash map in sw.js is stale \u2014 audio/ changed but the AUDIO_HASHES block was not regenerated');
    console.log(`${C.dim}      run node tools/checks.mjs (without --check) to write it${C.reset}`);
    problems++;
    return src;
  }
  ok(`audio hash map written (${n} files)`);
  return src.replace(m[0], () => want);
}

function bumpServiceWorker() {
  head('3. Service-worker cache version');
  const swPath = join(ROOT, 'sw.js');
  let src = readFileSync(swPath, 'utf8');
  checkJourneyPaths();
  checkSwAssets(src);
  checkPrecacheCoverage(src);
  checkSdkVersion();
  checkFirestoreRules();

  const before = src;
  /* sw.js's own code is part of the shell fingerprint (2026-10-16), with
     both version lines blanked so a bump can't feed itself. A change to how
     the worker caches (that day: 'no-cache' on a miss) must rebuild every
     visitor's cache, or a copy the old logic stored wrongly stays served
     until some unrelated shell file happens to change. */
  /* The AUDIO_HASHES block is blanked too, so an audio-only push keeps the shell
     cache's NAME. The worker still updates (its bytes changed) and its install
     re-downloads ASSETS as on any worker update; what students keep is every
     backing track that did not change. */
  const swCode = src.replace(/const CACHE_VERSION = '[^']*';/g, "const CACHE_VERSION = '';").replace(AUDIO_BLOCK_RE, '/* AUDIO_HASHES */');
  const shellFp = [...SHELL_FILES, ...IMG_FILES, ...SHEET_FILES, ...VENDOR_FILES, ...precachedExtraFiles(src)];
  src = bumpVersionConst('CACHE_VERSION', 'guitar-class', shellFp, src, swPath, 'shell cache', swCode);
  src = syncAudioHashes(src);
  if (!CHECK_ONLY && src !== before) writeFileSync(swPath, src);
  checkAudioWorker(swPath);
  checkPrecacheFingerprinted(src, shellFp);
}

/* 1ce. sw.js keeps students' downloaded backing tracks (2026-10-30).
   Reading the worker for the right words proves nothing about what it does to a
   cache, so this RUNS it: tools/sw-audio-proof.mjs boots the real sw.js (install,
   activate, fetch) against a stand-in CacheStorage and counts what survives a
   deploy that adds, re-exports and removes a track, the one-time migration, and
   the fetch paths, a rollback round trip, a 404 or foreign answer and the cache
   names; then breaks the worker 21 ways and needs every one to turn
   the proof red. The totals are pinned, so deleting a scenario or a breakage to
   get green fails here too. */
const SW_AUDIO_PROOF_PIN = { assertions: 50, scenarios: 11, mutations: 21 };
function checkAudioWorker(swPath) {
  head('1ce. sw.js keeps the audio cache (the worker is run, not read)');
  const r = spawnSync(process.execPath, [join(ROOT, 'tools', 'sw-audio-proof.mjs'), swPath], { encoding: 'utf8', timeout: 120000 });
  const lines = (r.stdout || '').trim().split('\n');
  const m = /^sw-audio-proof: (\d+) assertions in (\d+) scenarios, (\d+) of (\d+) mutations caught/.exec(lines[lines.length - 1] || '');
  if (r.status !== 0 || !m) {
    err('tools/sw-audio-proof.mjs failed' + (r.error ? ': ' + r.error.message : ''));
    for (const l of lines.slice(0, 8)) console.log(`${C.dim}      ${l}${C.reset}`);
    problems++;
    return;
  }
  const [a, s, c, n] = m.slice(1).map(Number), P = SW_AUDIO_PROOF_PIN;
  if (a !== P.assertions || s !== P.scenarios || n !== P.mutations || c !== n) {
    err(`sw-audio-proof ran ${a} assertions in ${s} scenarios and caught ${c} of ${n} breakages; pinned at ${P.assertions} / ${P.scenarios} / ${P.mutations} (all caught) — if you changed the proof on purpose, update SW_AUDIO_PROOF_PIN`);
    problems++;
    return;
  }
  ok(`${a} assertions in ${s} scenarios run against the real sw.js (add / re-export / remove a track, the one-time migration, every fetch path); ${c} of ${n} deliberate breakages each turned the proof red`);
}

/* Precached files that no list above fingerprints (2026-10-25). ASSETS also
   precaches the font and the raster icons (fonts/fraunces.woff2,
   apple-touch-icon.png, icon-*.png), and none of SHELL_FILES / IMG_FILES /
   SHEET_FILES / VENDOR_FILES named them, so a font or icon re-exported under
   the same name never changed CACHE_VERSION and returning students kept the
   old copy. Derived from ASSETS rather than added to SHELL_FILES: SHELL_FILES
   is the must-be-precached core that other checks walk, and deriving means a
   file added to ASSETS later is fingerprinted with no second list to keep.
   fingerprint() hashes these as raw bytes (they aren't TEXT_FOR_HASH). A
   missing file is skipped here; checkSwAssets() already fails on it. */
const FINGERPRINTED_ELSEWHERE = () => new Set([...SHELL_FILES, ...IMG_FILES, ...SHEET_FILES, ...VENDOR_FILES]);
function swAssetFiles(src) {
  const m = src.match(/const ASSETS = \[([\s\S]*?)\];/);
  // './' is the site root: GitHub Pages serves index.html for it.
  return m ? [...new Set(swEntries(m[1]).map(a => a === '' ? 'index.html' : a))] : [];
}
function precachedExtraFiles(src) {
  const have = FINGERPRINTED_ELSEWHERE();
  return swAssetFiles(src).filter(f => !have.has(f) && existsSync(join(ROOT, f))).sort();
}

/* ════════════════════════════════════════════════════════════════════
   1bt. EVERY PRECACHED FILE IS FINGERPRINTED — the class above, as a
   ratchet: a file in sw.js ASSETS that is not part of the CACHE_VERSION
   fingerprint can change on disk without the version changing, so the old
   copy stays in every returning student's cache. Reads the exact list
   bumpServiceWorker() hashed, so dropping a list from that call fails here.
   The count of files that only ASSETS brings in is pinned: one more means
   a new kind of precached file, worth a look; one fewer means one moved.
   ════════════════════════════════════════════════════════════════════ */
const PRECACHED_EXTRA_COUNT = 7;   // 6 + fonts/rubik-mono-one-top5.woff2 (the Top 5 medal, 2026-11-04): a font listed only in ASSETS, like fraunces.woff2
function checkPrecacheFingerprinted(src, hashed) {
  head('1bt. Every precached file is part of the cache fingerprint');
  const set = new Set(hashed);
  const assets = swAssetFiles(src);
  if (!assets.length) { err('could not read ASSETS from sw.js — fingerprint coverage NOT checked'); problems++; return; }
  // a file that isn't on disk at all is checkSwAssets()'s error, not this one
  const missing = assets.filter(f => !set.has(f) && existsSync(join(ROOT, f)));
  for (const f of missing) { err(`sw.js ASSETS precaches '${f}' but CACHE_VERSION doesn't fingerprint it — a new copy at the same name would never reach returning students`); problems++; }
  const extras = precachedExtraFiles(src);
  if (extras.length !== PRECACHED_EXTRA_COUNT) {
    err(`${extras.length} precached files are fingerprinted only because ASSETS lists them (pinned at ${PRECACHED_EXTRA_COUNT}): ${extras.join(', ')} — update PRECACHED_EXTRA_COUNT on purpose`);
    problems++;
  }
  if (!missing.length && extras.length === PRECACHED_EXTRA_COUNT)
    ok(`all ${assets.length} precached files are fingerprinted (${extras.length} via ASSETS alone: ${extras.join(', ')})`);
}

/* ════════════════════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════════════════════
   0. SYNTAX — parse every shipped .js with `node --check`.
   The site has no build step, so a syntax error in app.js/coach.js/etc.
   ships straight to the live site and bricks it on load. validateModules
   already parses module-N.js + config-main.js; this covers everything
   else (app, coach, i18n, fab-tools, tuner, teacher, firebase-config,
   sw.js, tabs/*.js). Cheap (<1s), runs in every mode incl. the
   pre-commit hook's --check --skip-links.
   ════════════════════════════════════════════════════════════════════ */
function syntaxCheck() {
  head('0. JS syntax (node --check)');
  const files = [...SHELL_FILES.filter(f => f.endsWith('.js')), 'sw.js'];
  const inline = inlineScripts();
  let bad = 0;
  for (const f of files) {
    const r = spawnSync(process.execPath, ['--check', join(ROOT, f)], { encoding: 'utf8' });
    if (r.status !== 0) {
      err(`syntax error: ${f}`);
      console.log(`${C.dim}${(r.stderr || '').trim().split('\n').slice(0, 4).join('\n')}${C.reset}`);
      bad++; problems++;
    }
  }
  /* The inline <script> blocks in the shipped HTML were checked by nothing at
     all until 2026-09-08 — not node --check, not the lookbehind scan below —
     even though a shared Journey link is exactly where an older iPhone lands,
     and those eight pages carry their whole boot in an inline block. */
  let tmp = null;
  try {
    tmp = mkdtempSync(join(tmpdir(), 'gc-inline-'));
    for (const b of inline) {
      const f = join(tmp, `s${b.n}.${b.module ? 'mjs' : 'js'}`);
      writeFileSync(f, b.code);
      const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
      if (r.status !== 0) {
        err(`syntax error: ${b.file} — inline <script> starting at line ${b.line}`);
        console.log(`${C.dim}${(r.stderr || '').trim().split('\n').slice(0, 4).join('\n')}${C.reset}`);
        bad++; problems++;
      }
    }
  } catch (e) {
    warn(`could not syntax-check inline <script> blocks (${e.message})`); warnings++;
  } finally {
    if (tmp) { try { rmSync(tmp, { recursive: true, force: true }); } catch {} }
  }
  if (!bad) ok(`${files.length} shipped .js files + ${inline.length} inline <script> blocks parse clean`);
  checkNoLookbehind(files, inline);
}

/* Every inline <script> in the shipped HTML, with the line it starts on so a
   failure can be reported against the real file. Skips src= (that's a shipped
   .js, already covered) and non-JS types like application/json. */
function inlineScripts() {
  const out = [];
  let n = 0;
  for (const f of SHELL_FILES.filter(x => x.endsWith('.html'))) {
    let src;
    try { src = readFileSync(join(ROOT, f), 'utf8'); } catch { continue; }
    for (const m of src.matchAll(/<script([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
      const attrs = m[1] || '';
      if (/\bsrc\s*=/i.test(attrs)) continue;
      const type = (attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i) || [])[1];
      if (type && !/^(module|text\/javascript|application\/javascript)$/i.test(type)) continue;
      if (!m[2].trim()) continue;
      out.push({
        file: f, n: n++, code: m[2], module: /^module$/i.test(type || ''),
        line: src.slice(0, m.index + m[0].indexOf('>') + 1).split('\n').length,
        offset: m.index + m[0].indexOf('>') + 1,
      });
    }
  }
  return out;
}

/* Blank out comments, preserving length and newlines so offsets stay exact.
   Deliberately biased toward NOT stripping: if the scanner can't tell a regex
   literal from division it leaves the text alone, because a wrong strip could
   HIDE a lookbehind, while a missed strip only risks a false positive that a
   human will read in two seconds. */
function maskComments(src) {
  const out = src.split('');
  const blank = (a, b) => { for (let k = a; k < b && k < out.length; k++) if (out[k] !== '\n') out[k] = ' '; };
  /* Stack of {t:'tmpl'} for a template literal and {t:'sub',depth} for the
     code inside its ${…}. A template can hold code that holds another
     template — app.js:2922 nests one two deep — so treating ` as a plain
     quote and scanning to the next ` closed the OUTER literal on the INNER
     one's opening backtick and put everything after it out of phase. */
  const stack = [];
  let i = 0, prev = '';
  const top = () => stack[stack.length - 1];
  const isRegexPos = () => !prev || /[({[,;:!&|?+\-*/%~^=<>]$|\b(return|typeof|instanceof|in|of|new|delete|void|case|do|else|yield|await)$/.test(prev);
  while (i < src.length) {
    const c = src[i];
    if (top() && top().t === 'tmpl') {              // inside `…`, not code
      if (c === '\\') { i += 2; continue; }
      if (c === '`') { stack.pop(); prev = 'x'; i++; continue; }
      if (c === '$' && src[i + 1] === '{') { stack.push({ t: 'sub', depth: 0 }); prev = '{'; i += 2; continue; }
      i++; continue;
    }
    if (c === '/' && src[i + 1] === '/') { const e = src.indexOf('\n', i); const z = e < 0 ? src.length : e; blank(i, z); i = z; continue; }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); const z = e < 0 ? src.length : e + 2; blank(i, z); i = z; continue; }
    if (c === '"' || c === "'") {
      const q = c; i++;
      while (i < src.length) { if (src[i] === '\\') { i += 2; continue; } if (src[i] === q || src[i] === '\n') { i++; break; } i++; }
      prev = 'x'; continue;
    }
    if (c === '`') { stack.push({ t: 'tmpl' }); i++; continue; }
    if (c === '{' && top() && top().t === 'sub') { top().depth++; prev = '{'; i++; continue; }
    if (c === '}' && top() && top().t === 'sub') {
      if (top().depth === 0) stack.pop(); else top().depth--;
      prev = '}'; i++; continue;
    }
    /* Deliberately biased toward NOT stripping: if this can't tell a regex
       literal from division it leaves the text alone, because a wrong strip
       could HIDE a lookbehind, while a missed strip only risks a false
       positive a human reads in two seconds. */
    if (c === '/' && isRegexPos()) {
      let j = i + 1, cls = false, closed = false;
      while (j < src.length) {
        const d = src[j];
        if (d === '\\') { j += 2; continue; }
        if (d === '\n') break;                      // unterminated: not a regex
        if (cls) { if (d === ']') cls = false; }
        else if (d === '[') cls = true;
        else if (d === '/') { closed = true; j++; break; }
        j++;
      }
      if (closed) { i = j; prev = 'x'; continue; }
    }
    if (!/\s/.test(c)) prev = (prev + c).slice(-12);
    i++;
  }
  return out.join('');
}
function checkNoLookbehind(files, inline = []) {
  let bad = 0;
  const flag = (where, tok) => {
    err(`${where}: regex lookbehind "${tok}" — a SyntaxError in Safari < 16.4, which stops this whole file from parsing. Capture the preceding character instead (see CHORD_RE / NOTE_SEQ_RE in app.js).`);
    problems++; bad++;
  };
  /* Comments are masked by a real scanner, not by line shape. The old
     /^\s*(\/\/|\*|\/\*)/ test both over- and under-matched: a trailing
     `// (?<=` on a line of code false-positived, and a lookbehind on a
     block-comment line that didn't start with * did too. */
  const scan = (text, where, lineBase = 1) => {
    const masked = maskComments(text);
    for (const m of masked.matchAll(/\(\?<[=!]/g))
      flag(`${where}:${lineBase - 1 + masked.slice(0, m.index).split('\n').length}`, m[0]);
  };
  for (const f of files) {
    let src;
    try { src = readFileSync(join(ROOT, f), 'utf8'); } catch { continue; }
    scan(src, f);
  }
  for (const b of inline) scan(b.code, `${b.file} (inline <script>)`, b.line);
  if (!bad) ok(`no regex lookbehind in shipped .js or inline <script> (Safari < 16.4 can't parse it)`);
}

/* ════════════════════════════════════════════════════════════════════
   0b. RENDER SMOKE TEST — actually build every set.

   Why this exists: on 2026-07-27 an i18n conversion added a t() call
   inside a callback whose parameter was already named `t`, shadowing the
   global i18n t(). buildSet() threw on all 21 sets with a songThread, so
   NO module content rendered — and every check above passed, because the
   file is syntactically valid and the module DATA is fine. The bug was
   only visible by running the renderer.

   So: load the real i18n.js + guitar-diagrams.js + module data + app.js
   in a vm against a minimal DOM stub, then call buildSet() on all 36
   sets. No jsdom dependency (the repo has no build step and no
   node_modules) — the stub only needs to be good enough for app.js to
   reach its string-building code, which is where content bugs live.

   Every way this check can end up testing NOTHING is a hard failure, not a
   warning: the harness failing to load (app.js grew a load-time dependency
   the stub doesn't cover), and the harness loading but finding no SETS or no
   buildSet() (something was renamed). Both were silent once, and the point of
   0b is to break silence. A stale stub blocking a good push is the cheaper
   mistake — extend the stub. A set that throws or renders suspiciously short
   is a hard failure too.
   ════════════════════════════════════════════════════════════════════ */
function renderCheck() {
  head('0b. Render smoke test (build every set)');

  const stubStyle = () => ({ setProperty(){}, removeProperty(){}, getPropertyValue(){ return ''; } });
  const el = () => ({
    style: stubStyle(), dataset: {}, children: [],
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    innerHTML: '', textContent: '', value: '', hidden: false, checked: false,
    addEventListener(){}, removeEventListener(){}, appendChild(){}, removeChild(){}, remove(){},
    setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){}, hasAttribute(){ return false; },
    querySelector(){ return el(); }, querySelectorAll(){ return []; }, closest(){ return null; },
    focus(){}, blur(){}, click(){}, scrollIntoView(){}, insertAdjacentHTML(){}, cloneNode(){ return el(); },
    getBoundingClientRect(){ return { top:0, left:0, width:0, height:0, bottom:0, right:0 }; },
  });
  const storage = () => ({ _d:{}, getItem(k){ return this._d[k] ?? null; }, setItem(k,v){ this._d[k]=String(v); },
                           removeItem(k){ delete this._d[k]; }, clear(){ this._d={}; } });

  const ctx = {
    console: { log(){}, warn(){}, error(){}, info(){} },
    document: {
      documentElement: el(), head: el(), body: el(),
      getElementById(){ return el(); }, querySelector(){ return el(); }, querySelectorAll(){ return []; },
      createElement(){ return el(); }, createDocumentFragment(){ return el(); },
      addEventListener(){}, removeEventListener(){},
      fonts: { ready: Promise.resolve() }, hidden: false, visibilityState: 'visible',
    },
    localStorage: storage(), sessionStorage: storage(),
    location: { hostname:'localhost', href:'http://localhost/', pathname:'/', search:'', hash:'', reload(){} },
    history: { scrollRestoration:'auto', replaceState(){}, pushState(){} },
    navigator: { userAgent:'node', language:'en', onLine:true },
    setTimeout, clearTimeout, setInterval, clearInterval,
    requestAnimationFrame: () => 0, cancelAnimationFrame(){},
    matchMedia: () => ({ matches:false, addEventListener(){}, addListener(){} }),
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    fetch: () => Promise.reject(new Error('no network in the render smoke test')),
    CustomEvent: class { constructor(t, o){ this.type = t; Object.assign(this, o || {}); } },
    Image: class {}, Audio: class { play(){ return Promise.resolve(); } pause(){} },
    AudioContext: class {
      createOscillator(){ return { connect(){}, start(){}, stop(){}, frequency:{ value:0 } }; }
      createGain(){ return { connect(){}, gain:{ value:0, setValueAtTime(){} } }; }
      close(){}
    },
    performance: { now: () => 0 },
    // Web APIs app.js touches at load time. URLSearchParams is Node's own —
    // a vm context gets no globals of its own, so it has to be handed in.
    URLSearchParams, URL, TextEncoder, TextDecoder,
    addEventListener(){}, removeEventListener(){}, dispatchEvent(){}, scrollTo(){},
    innerWidth: 1280, innerHeight: 800, devicePixelRatio: 1,
  };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;

  const FILES = ['i18n.js', 'guitar-diagrams.js', 'class-activities.js', 'config-main.js',
    ...MODULE_FILES, 'app.js'];
  try {
    vm.createContext(ctx);
    for (const f of FILES) vm.runInContext(readFileSync(join(ROOT, f), 'utf8'), ctx, { filename: f });
  } catch (e) {
    /* A hard failure, not a warning. On 2026-09-05 a new load-time
       URLSearchParams call in app.js dropped this harness, and because it
       only warned, the push stayed green with the renderer never smoke-
       tested — exactly the silence 0b exists to break. */
    err(`render harness could not load (${e.message}) — renderer NOT smoke-tested`);
    problems++;
    console.log(`${C.dim}  app.js probably gained a load-time browser dependency: add it to the stub in renderCheck()${C.reset}`);
    return;
  }

  const sets = vm.runInContext('typeof SETS !== "undefined" ? SETS : []', ctx) || [];
  const buildSet = vm.runInContext('typeof buildSet === "function" ? buildSet : null', ctx);
  if (!sets.length || !buildSet) {
    /* Also a hard failure, for the same reason as the load path above:
       renaming buildSet (or SETS) left the push green with the renderer
       never smoke-tested. Both silences now fail. */
    err(`render harness loaded but found ${sets.length ? '' : 'no SETS'}${!sets.length && !buildSet ? ' and ' : ''}${buildSet ? '' : 'no buildSet()'} — renderer NOT smoke-tested`);
    problems++;
    return;
  }

  let bad = 0;
  for (const w of sets) {
    let html;
    try {
      html = buildSet(w);
    } catch (e) {
      err(`${w.id}: buildSet() threw — ${e.message}`);
      bad++; problems++;
      continue;
    }
    // A set that renders almost nothing means the builder bailed early
    // rather than threw — just as broken from the student's side.
    if (!html || html.length < 200) {
      err(`${w.id}: rendered only ${html ? html.length : 0} chars — builder bailed early`);
      bad++; problems++;
    }
  }
  if (!bad) ok(`all ${sets.length} sets render`);
  checkStorageNamespaces(sets, buildSet, ctx);
  checkSetParts(sets, buildSet, ctx);
  checkInlineHandlersParse(sets, buildSet, ctx);
  return { sets, ctx };
}

/* ════════════════════════════════════════════════════════════════════
   1af. STORAGE NAMESPACES NEVER MOVE — the progress-key rule (app.js
   storageSections, 2026-09-12 hotfix). Every section-level key is
   `${set}-${station}-sec${gi}-${idx}`, and gi is the section's position in
   `station.sections` after excluding ONLY tuning-warmup sections — the
   convention every key in Firestore was written under since July 2026.
   Render-time hides (routine / ear-spark / reflection / empty take-to-song /
   all-steps-hidden) must never renumber gi; the first cut of Phase 3 did,
   and moved Module 2 Set 1 station B's "Play along with the note map" from
   b-sec2 to b-sec1 on the live site for a day.

   Independent of app.js: this rebuilds the expected `data-ns` list for
   every set from the raw module data with its own copy of the rule, renders
   the set through the real buildSet(), and compares the two lists exactly.
   The take-to-song emptiness rule (module has no Journey layer) is the one
   thing borrowed from the sandbox, since that table lives in app.js.
   ════════════════════════════════════════════════════════════════════ */
const RENDER_HIDDEN_KINDS = new Set(['routine', 'ear-spark', 'reflection']);
// Pinned by name so a data edit can't silently re-key a section students are
// mid-way through: set id → station → { section title: expected gi }.
const PINNED_NS = {
  // (m2w1 station C's first section is the tuning warm-up, so "A string" is
  // raw index 2 but storage index 1 — the July convention, not the raw one.)
  m2w1: { b: { 'Play along with the note map': 2 }, c: { 'Name every note on the A string (frets 0–12)': 1 } },
};
function checkStorageNamespaces(sets, buildSet, ctx) {
  head('1af. Storage namespaces (progress keys) never move');
  const journeySongsFor = vm.runInContext('typeof journeySongsFor === "function" ? journeySongsFor : null', ctx);
  if (!journeySongsFor) { err('app.js: journeySongsFor() not found — 1af cannot judge take-to-song emptiness'); problems++; return; }
  const takeToSongOn = readTakeToSongSwitch(ctx);
  if (takeToSongOn === null) { err('app.js: TAKE_TO_SONG_ENABLED not found — 1af cannot tell whether take-to-song sections render'); problems++; return; }
  let bad = 0, checked = 0;
  const isTuning = (sec, moduleNum) => moduleNum !== 1 && (sec.kind === 'tuning-warmup' || sec.title === 'Warm-up — tuning check (Module 1)');
  for (const w of sets) {
    const expected = [];
    for (const stId of ['b', 'c']) {
      const stn = w.stations && w.stations[stId];
      if (!stn) continue;
      if (!(stn.sections && stn.sections.length)) { if (stn.steps) expected.push(stId); continue; }
      let gi = -1;
      stn.sections.forEach(sec => {
        if (isTuning(sec, w.moduleNum)) return;
        gi++;                                                         // the ONLY hide that counts toward gi
        const pin = ((PINNED_NS[w.id] || {})[stId] || {})[sec.title];
        if (pin !== undefined && pin !== gi) {
          err(`${w.id} · station "${stId}": "${sec.title}" is at storage index ${gi}, pinned at ${pin} — a section was inserted/removed before it, which re-keys students' saved progress`);
          problems++; bad++;
        }
        if (RENDER_HIDDEN_KINDS.has(sec.kind)) return;
        // TAKE_TO_SONG_ENABLED false (2026-10-18): a take-to-song section
        // renders in no module. gi was counted above, so the sections after
        // it keep their keys.
        if (sec.kind === 'take-to-song' && !takeToSongOn) return;
        // On: a take-to-song section swaps in the Journey link card (always
        // renderable) only when this module has a layer to link to; with no
        // layer (module 6+) it falls back to a normal section's own "does it
        // have any steps" check below (2026-09-12 restore fix — the first
        // cut of this rule dropped these sections outright).
        if (sec.kind === 'take-to-song' && journeySongsFor(w.moduleNum).length) { expected.push(`${stId}-sec${gi}`); return; }
        if (!(sec.steps || []).some(st => !st.hidden)) return;
        expected.push(`${stId}-sec${gi}`);
      });
    }
    let html;
    try { html = buildSet(w); } catch { continue; }                    // 0b already reported the throw
    const rendered = [...html.matchAll(/<div class="stp-sec[^"]*" data-ns="([^"]+)"/g)].map(m => m[1]);
    checked++;
    if (rendered.join(' ') !== expected.join(' ')) {
      err(`${w.id}: rendered section namespaces [${rendered.join(', ')}] ≠ expected [${expected.join(', ')}] — a render-time hide is renumbering progress keys`);
      problems++; bad++;
    }
  }
  if (!bad) ok(`${checked} sets render every section under its July-convention storage namespace (${Object.keys(PINNED_NS).length} pinned by name)`);
}

/* ════════════════════════════════════════════════════════════════════
   1ao. SETS SHOWN IN TWO PARTS — `partOne` on a set and `partBreak` on
   one of its sections split a long ladder into Part 1 / Part 2 for
   DISPLAY ONLY (m4w2, 2026-09-19; see lessonParts() in app.js and the
   schema note at the top of module-2.js). Nothing moves in the data, so
   no progress key moves — 1af above proves that independently. What this
   one guards is the pair of fields themselves, where the failures are
   silent rather than loud: a break on the first renderable section
   renders a Part 1 heading over nothing; a `partBreak` with no `partOne`
   leaves Part 1 unnamed; a missing `title_es` ships an English heading to
   a Spanish reader with nothing to catch it afterwards; a part with zero
   visible steps is a pill that reads "0 of 0".

   It keeps its OWN copy of the render rule (which sections and steps a
   student actually sees), the same way 1af does, so a change in app.js
   can't quietly move what "the first renderable section" means. The last
   assertion goes the other way and reads the real rendered HTML, so
   deleting the render call fails here too.
   ════════════════════════════════════════════════════════════════════ */
// Pinned: only Module 4 Set 2 is split today. A second split set is a
// deliberate content decision — bump this in the same edit.
const PARTED_SETS_EXPECTED = 1;
function checkSetParts(sets, buildSet, ctx) {
  head('1ao. Sets shown in two parts');
  const journeySongsFor = vm.runInContext('typeof journeySongsFor === "function" ? journeySongsFor : null', ctx);
  if (!journeySongsFor) { err('app.js: journeySongsFor() not found — 1ao cannot judge take-to-song emptiness'); problems++; return; }
  const takeToSongOn = readTakeToSongSwitch(ctx);
  if (takeToSongOn === null) { err('app.js: TAKE_TO_SONG_ENABLED not found — 1ao cannot tell whether take-to-song sections render'); problems++; return; }
  const isTuning = (sec, moduleNum) => moduleNum !== 1 && (sec.kind === 'tuning-warmup' || sec.title === 'Warm-up — tuning check (Module 1)');
  /* The sections a student actually sees, in render order, each with its
     visible step count — b's sections then c's, same as buildLesson. */
  const renderable = (w) => {
    const out = [];
    for (const stId of ['b', 'c']) {
      const stn = w.stations && w.stations[stId];
      if (!stn) continue;
      if (!(stn.sections && stn.sections.length)) {
        if (stn.steps) out.push({ sec: {}, steps: (stn.steps || []).filter(st => !st.hidden).length });
        continue;
      }
      for (const sec of stn.sections) {
        if (isTuning(sec, w.moduleNum)) continue;
        if (RENDER_HIDDEN_KINDS.has(sec.kind)) continue;
        // Switched off (2026-10-18): not a section a student sees at all.
        if (sec.kind === 'take-to-song' && !takeToSongOn) continue;
        // On: a take-to-song section with a Journey layer renders the link
        // card instead of steps: it is renderable, and it contributes no
        // steps to the part's count.
        if (sec.kind === 'take-to-song' && journeySongsFor(w.moduleNum).length) { out.push({ sec, steps: 0 }); continue; }
        const n = (sec.steps || []).filter(st => !st.hidden).length;
        if (!n) continue;
        out.push({ sec, steps: n });
      }
    }
    return out;
  };
  const titled = (w, name, obj) => {
    for (const f of ['title', 'title_es']) {
      if (typeof obj[f] !== 'string' || !obj[f].trim()) {
        err(`${w.id}: ${name} has no ${f} — ${f === 'title_es' ? 'a Spanish reader would get the English heading, and nothing downstream catches that' : 'the heading would render blank'}`);
        problems++;
      }
    }
  };
  let parted = 0, bad = 0;
  for (const w of sets) {
    const allSecs = ['b', 'c'].flatMap(id => ((w.stations && w.stations[id] && w.stations[id].sections) || []));
    const breaks = allSecs.filter(sec => sec && sec.partBreak);
    if (w.partBreak) { err(`${w.id}: partBreak sits on the SET — it belongs on the section Part 2 opens at`); problems++; bad++; }
    if (!breaks.length && !w.partOne) continue;
    parted++;
    const before = problems;
    if (breaks.length > 1) { err(`${w.id}: ${breaks.length} sections carry partBreak — a set is two parts, so at most one break`); problems++; }
    if (!breaks.length) { err(`${w.id}: partOne with no partBreak — Part 2 never opens`); problems++; }
    if (breaks.length && !w.partOne) { err(`${w.id}: a section carries partBreak but the set has no partOne — Part 1 would render unnamed`); problems++; }
    if (w.partOne) titled(w, 'partOne', w.partOne);
    breaks.forEach(sec => titled(w, `partBreak on "${sec.title}"`, sec.partBreak));
    const secs = renderable(w);
    const at = secs.findIndex(x => x.sec && x.sec.partBreak);
    if (breaks.length && at < 0) {
      err(`${w.id}: the section carrying partBreak never renders (hidden kind, or every step hidden) — Part 2 would never open`); problems++;
    } else if (at === 0) {
      err(`${w.id}: partBreak sits on the set's FIRST renderable section — Part 1 would be a heading over nothing`); problems++;
    } else if (at > 0) {
      const p1 = secs.slice(0, at).reduce((n, x) => n + x.steps, 0);
      const p2 = secs.slice(at).reduce((n, x) => n + x.steps, 0);
      if (!p1 || !p2) { err(`${w.id}: Part 1 has ${p1} visible steps, Part 2 has ${p2} — a part with no steps is a pill reading "0 of 0"`); problems++; }
    }
    // And the other direction: the renderer really emits both marks.
    if (problems === before) {
      let html = '';
      try { html = buildSet(w); } catch { /* 0b already reported the throw */ }
      const ones = (html.match(/class="stp-partmark stp-partone/g) || []).length;
      const twos = (html.match(/class="stp-partmark stp-partbreak/g) || []).length;
      if (ones !== 1 || twos !== 1) {
        err(`${w.id}: data declares two parts but the ladder rendered ${ones} Part 1 heading(s) and ${twos} Part 2 divider(s) — buildLesson() stopped honouring partOne/partBreak`);
        problems++;
      }
    }
    if (problems !== before) bad++;
  }
  if (parted !== PARTED_SETS_EXPECTED) {
    err(`${parted} set${parted === 1 ? '' : 's'} declare parts, expected ${PARTED_SETS_EXPECTED} — splitting another set is a content decision, so bump PARTED_SETS_EXPECTED in the same edit`);
    problems++; bad++;
  }
  if (!bad) ok(`${parted} set shown in two parts (m4w2), both titles in both languages, neither part empty, both marks rendered`);
}

/* ════════════════════════════════════════════════════════════════════
   1bs. EVERY INLINE HANDLER IN A RENDERED SET PARSES (2026-10-25).
   A step's YouTube <a> becomes a ▶ button whose onclick carries the
   link's url and label as JS strings, inside a double-quoted attribute.
   Until this date only the label's ' was escaped, so a label that opened
   with a quote ("Let It Be" by The Beatles) ended the attribute at that
   quote: the button showed, and clicking it threw a SyntaxError. 15 links
   in Modules 4, 5, 6 and 8, in both languages, were dead that way with 0b
   green, because nothing ever parsed a handler. ytLinksToButtons() now
   passes each argument as an attribute-escaped JSON string (jsonAttrArg).

   Three parts:
   - The fixture feeds ytLinksToButtons() hostile labels (quotes, \, a
     newline, &#39; &bsol; &#92; &lt;…) and runs each handler against a
     stub: it must run, and pass the url and the label EXACTLY as written
     (loadPanel puts the label in with innerHTML, so passing it as written
     is what makes the player show what the link showed). A curriculum
     with no hostile label in it can't hide a regression.
   - The scan renders every set in English and Spanish through the real
     buildSet(), cuts each on*="…" attribute where a browser does (at the
     first matching quote), decodes its entities, and compiles it. Every
     ▶ button is also run: it must pass the label its own text shows, and
     a url with no HTML entity in it (the url goes over as written in the
     href, so &amp; there would reach YouTube as "&amp;").
   - The decoder knows only the references escAttr writes (&amp; &quot;
     &#39; &lt; &gt;) plus numeric ones and a few names, and any OTHER
     `&name` in a handler fails instead of being read wrong: a browser
     decodes every HTML5 name, and a handler that leaves one raw for it
     (&bsol; is a backslash) is one this check would otherwise misread.
   The ▶ count has a floor so the scan can't go blind; the ok line prints
   today's count.
   ════════════════════════════════════════════════════════════════════ */
const YT_BUTTONS_FLOOR = 150;   // a floor, not a pin — see the ok line for the count
function checkInlineHandlersParse(sets, buildSet, ctx) {
  head('1bs. Every inline handler in a rendered set parses');
  const ytLinksToButtons = vm.runInContext('typeof ytLinksToButtons === "function" ? ytLinksToButtons : null', ctx);
  const setLang = vm.runInContext('typeof setLang === "function" ? setLang : null', ctx);
  // A rename in app.js must fail here, not turn the check off (0b's rule).
  if (!setLang) { err('1bs cannot run — setLang() not found in i18n.js (renamed? update this check with it)'); problems++; return; }
  const KNOWN_REF = /^&(?:amp|quot|lt|gt|apos|nbsp|iexcl|iquest|#\d+|#x[0-9a-f]+);/i;
  const strange = s => (s.match(/&[A-Za-z#][A-Za-z0-9#]*;?/g) || []).filter(r => !KNOWN_REF.test(r));
  const decodeAttr = s => decodeHtmlEntities(s.replace(/&apos;/g, "'"));
  const ATTR_RE = /\son[a-z]+\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  const BTN_RE = /<button class="rp-trigger" onclick="([^"]*)"[^>]*>&#x25B6; ([^<]*?)(?: <span[^>]*>&#x2197;<\/span>)?<\/button>/g;
  const ENTITY = /&(?:[A-Za-z][A-Za-z0-9]*|#\d+|#x[0-9a-f]+);/i;
  const compiles = code => { try { new vm.Script(`(function(event){${code}\n})`); return true; } catch { return false; } };
  // Runs a ▶ handler against stubs: [what it called, url, title] or null.
  const runYt = code => {
    let got = null;
    try {
      // eslint-disable-next-line no-new-func
      new Function('loadPanel', 'window', code)((...a) => { got = ['loadPanel', a[1], a[2], a[0]]; }, { open: (...a) => { got = ['open', a[0]]; } });
    } catch { return null; }
    return got;
  };
  let bad = 0;
  if (!ytLinksToButtons) { err('app.js: ytLinksToButtons() not found — the YouTube-button escape is untested (renamed? update this check with it)'); problems++; bad++; }

  // ── Fixture: hostile labels, as authored HTML. Each must reach the
  // handler exactly as written.
  const url = 'https://www.youtube.com/watch?v=CGj85pVzRJs&t=30';
  const LABELS = [`"Q" &amp; 'A' \\ z`, 'Don&#39;t', 'Don&apos;t', 'a&bsol;b', 'a&#92;n', 'line1\nline2', 'a\rb', 'a&#10;b',
    '&lt;b&gt;x&lt;/b&gt;', 'ends in \\', 'a `b` ${c}', ' '];
  for (const ext of ytLinksToButtons ? [false, true] : []) for (const label of LABELS) {
    const out = String(ytLinksToButtons(`<a href="${url}"${ext ? ' data-ext' : ''} target="_blank">${label}</a>`));
    const m = /\sonclick="([^"]*)"/.exec(out);
    const odd = m ? strange(m[1]) : [];
    const got = m && !odd.length ? runYt(decodeAttr(m[1])) : null;
    const okay = got && got[1] === url && (ext ? got[0] === 'open' : (got[0] === 'loadPanel' && got[3] === 'youtube' && got[2] === label));
    if (!okay) {
      err(`ytLinksToButtons()${ext ? ' (data-ext)' : ''}: a label of ${JSON.stringify(label)} built ${m ? `onclick="${m[1].slice(0, 90)}"` : 'no onclick'} — ${odd.length ? `it leaves ${odd.join(' ')} raw for the browser to decode` : got ? `it passed ${JSON.stringify(got.slice(1, 3))}` : 'it does not run'}; each argument has to be escAttr(JSON.stringify(…))`);
      problems++; bad++;
    }
  }

  // ── Scan: every handler the real renderer emits, both languages.
  let handlers = 0, ytButtons = 0, ytChecked = 0;
  const failures = [], wrongArgs = [], oddRefs = [];
  try {
    for (const lang of ['en', 'es']) {
      setLang(lang);
      for (const w of sets) {
        let html = '';
        try { html = buildSet(w); } catch { continue; /* 0b already reported the throw */ }
        for (const m of html.matchAll(ATTR_RE)) {
          const raw = m[1] ?? m[2];
          const odd = strange(raw);
          if (odd.length) { oddRefs.push(`${w.id} (${lang}): ${odd.join(' ')} in ${m[0].trim().slice(0, 90)}`); continue; }
          const code = decodeAttr(raw);
          handlers++;
          if (code.includes("loadPanel('youtube'")) ytButtons++;
          if (!compiles(code)) failures.push(`${w.id} (${lang}): ${m[0].trim().slice(0, 110)}`);
        }
        for (const b of html.matchAll(BTN_RE)) {
          if (strange(b[1]).length) continue;   // reported above
          const got = runYt(decodeAttr(b[1]));
          if (!got) continue;                   // a parse failure, reported above
          const label = b[2];
          if (got[0] === 'loadPanel') ytChecked++;
          if (ENTITY.test(got[1])) wrongArgs.push(`${w.id} (${lang}): the href ${got[1]} carries an HTML entity — write the character itself (the ▶ button passes the href as written)`);
          else if (got[0] === 'loadPanel' && got[2] !== label) wrongArgs.push(`${w.id} (${lang}): the ▶ "${label.slice(0, 50)}" passes the title ${JSON.stringify(String(got[2]).slice(0, 60))}`);
        }
      }
    }
  } finally { setLang('en'); }
  for (const f of failures.slice(0, 12)) err(`handler does not parse — ${f}`);
  if (failures.length > 12) err(`…and ${failures.length - 12} more`);
  for (const f of oddRefs.slice(0, 8)) err(`handler leaves a character reference raw for the browser — ${f} (escAttr its arguments; 1bs decodes only what escAttr writes)`);
  for (const f of wrongArgs.slice(0, 8)) err(f);
  if (failures.length || oddRefs.length || wrongArgs.length) { problems++; bad++; }
  if (ytChecked !== ytButtons) {
    err(`BTN_RE checked ${ytChecked} YouTube ▶ buttons but the handler scan counted ${ytButtons} — the button markup changed and 1bs no longer checks what each one passes; update BTN_RE / the loadPanel test`);
    problems++; bad++;
  }
  if (ytButtons < YT_BUTTONS_FLOOR) {
    err(`the scan saw only ${ytButtons} YouTube ▶ buttons (floor ${YT_BUTTONS_FLOOR}) — the renderer's button markup changed and 1bs can no longer see it; update ATTR_RE / BTN_RE / the loadPanel test`);
    problems++; bad++;
  }
  if (!bad) ok(`${handlers} inline handlers across ${sets.length} sets × EN/ES all parse; all ${ytButtons} YouTube ▶ buttons pass their own label and an entity-free url; ${LABELS.length} hostile labels × 2 reach ytLinksToButtons()'s handlers as written`);
}

/* ════════════════════════════════════════════════════════════════════
   POST-PUSH: --live — confirm GitHub Pages actually deployed what we
   pushed, by comparing the live sw.js CACHE_VERSION against local.
   Catches a failed/stuck Pages build (students would silently keep the
   old cached site). Run it ~a minute after `git push`.
   ════════════════════════════════════════════════════════════════════ */
async function liveCheck() {
  head('Post-push: live-site deploy check');
  const verRe = /CACHE_VERSION\s*=\s*['"]([^'"]+)['"]/;
  const local = (readFileSync(join(ROOT, 'sw.js'), 'utf8').match(verRe) || [])[1];
  if (!local) { err('could not read local CACHE_VERSION from sw.js'); problems++; return; }
  let live;
  try {
    const res = await fetchWithTimeout(`${LIVE_SW_URL}?nocache=${Date.now()}`, { headers: { 'cache-control': 'no-cache' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    live = ((await res.text()).match(verRe) || [])[1];
  } catch (e) {
    warn(`could not fetch live sw.js (${e.message}) — check the network and retry`); warnings++;
    return 'unreachable';
  }
  if (live === local) { ok(`live site is serving this exact version (${local})`); return 'ok'; }
  err(`live CACHE_VERSION is ${live || 'unreadable'}, local is ${local}`);
  console.log(`${C.dim}      GitHub Pages may still be deploying — wait ~1–2 minutes and re-run:\n      node tools/checks.mjs --live${C.reset}`);
  problems++;
  return 'mismatch';
}

/* ════════════════════════════════════════════════════════════════════
   1ah. THE THREE VISIBILITY RULES STAY IN STEP — "can a student see this
   class activity?" is answered by three hand-kept copies that deliberately
   do NOT share code, because each reads a different source: caIsVisible()
   in app.js (the student's own globals, populated by loadClassConfig),
   teacherActivityVisible() in teacher.js (the config object the console
   already holds), and journeyIsVisible() in tabs/journey.js (the config
   journey.js fetches for itself, on pages that never load app.js).

   All three carry a comment telling the next person to change them
   together, and on 2026-09-16 two of the three were changed and one was
   not — the board's new "assigned" condition went into app.js alone. The
   result was not a cosmetic drift: un-assigning a still-dated activity
   stopped blocking the main site while still blanking all six Journey
   pages, with nothing left on In-Class Activities to clear it. The console meanwhile
   kept counting it as a blocker for every student.

   So: each copy must test every CONCEPT below, and each must have the
   pinned number of early "not visible" guards. The counts are what make
   this a real ratchet rather than a keyword sweep — adding a fifth
   condition to one copy and not the others fails the push, which is the
   exact mistake it exists to catch. Journey's count is one higher because
   it reads the two retire maps separately instead of a merged set.
   ════════════════════════════════════════════════════════════════════ */
/* journey.js's copy of "assigned" (1ah). It has no app.js to ask, so its
   guard tests the two moves itself, through local variables. Matching the
   tokens anywhere in the body passed with the variables still defined but
   dropped from the guard (2026-10-25 review), so this finds the
   `if(…activityBoardSeeded…) return false;` guard and follows the names in
   its condition back through their var/let/const lines: the guard must reach
   cfg.songLibrary AND cfg.classSongs. */
function journeyAssignedGuardOk(raw) {
  const body = stripJsComments(raw);
  const decls = {};
  for (const m of body.matchAll(/\b(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;]*);/g)) decls[m[1]] = m[2];
  let cond = null;
  for (const m of body.matchAll(/\bif\s*\(/g)) {
    let depth = 0, i = m.index + m[0].length - 1, end = -1;
    for (; i < body.length; i++) {
      if (body[i] === '(') depth++;
      else if (body[i] === ')' && --depth === 0) { end = i; break; }
    }
    if (end < 0) continue;
    const c = body.slice(m.index + m[0].length, end);
    if (c.includes('activityBoardSeeded') && /^\s*return false;/.test(body.slice(end + 1))) { cond = c; break; }
  }
  if (cond === null) return false;
  const reaches = (expr, token, seen) => {
    if (expr.includes(token)) return true;
    return [...expr.matchAll(/(?<![\w$.])[A-Za-z_$][\w$]*/g)].map(x => x[0])
      .some(id => decls[id] !== undefined && !seen.has(id) && reaches(decls[id], token, new Set([...seen, id])));
  };
  return reaches(cond, 'cfg.songLibrary', new Set()) && reaches(cond, 'cfg.classSongs', new Set());
}
function checkVisibilityParity() {
  head('1ah. caIsVisible / teacherActivityVisible / journeyIsVisible stay in step');
  const COPIES = [
    { file: 'app.js',          fn: 'caIsVisible',            guards: 4 },
    { file: 'teacher.js',      fn: 'teacherActivityVisible', guards: 4 },
    { file: 'tabs/journey.js', fn: 'journeyIsVisible',       guards: 5 },
  ];
  // Concept -> the token each copy is allowed to express it with. A copy
  // satisfies the concept if ANY of its patterns appears in its body.
  const CONCEPTS = [
    { name: 'archived/deleted', re: /retiredActivityIds|teacherActivityRetired|archivedActivities/ },
    /* Per file since 2026-10-25. "Assigned" is caBoardOrder's answer, which
       never assigns a library song or a teacher-only card — and Move to
       Songs / Move to Teacher view songs keep the card's board row for the
       trip back. teacher.js used to accept the bare activityBoardSeeded test
       here, read the raw row, and kept counting a moved card as a blocker for
       every student. So app.js and teacher.js must read the resolver itself,
       and journey.js (no app.js on those pages) must test both moves. */
    { name: 'assigned to the board (caBoardOrder: library songs and teacher-only cards never are)', re: {
      // In the guard itself, not just somewhere in the body.
      'app.js': /if\s*\(\s*!\s*caBoardView\(\)\.assigned\[a\.id\]\s*\)\s*return false;/,
      'teacher.js': /if\s*\(\s*!\s*\(\s*(?:view\s*\|\|\s*)?teacherBoardView\(cfg\)\s*\)\.assigned\[a\.id\]\s*\)\s*return false;/,
      'tabs/journey.js': { test: journeyAssignedGuardOk },
    } },
    { name: 'teacher hide toggle', re: /hiddenActivityIds|hiddenActivities/ },
    { name: 'release date', re: /caDate\(|activityDates/ },
    // 2026-10-13: the board's "Who" picker (config/class.activityStudents).
    { name: 'given to individual students', re: /caForMe\(|teacherActivityForStudent\(|journeyForStudent\(/ },
  ];
  let bad = 0;
  for (const c of COPIES) {
    let src;
    try { src = readFileSync(join(ROOT, c.file), 'utf8'); }
    catch { err(`${c.file} is missing`); problems++; bad++; continue; }
    const start = src.indexOf(`function ${c.fn}(`);
    if (start < 0) { err(`${c.file}: ${c.fn}() not found — if it was renamed, update 1ah`); problems++; bad++; continue; }
    // Body = from the opening brace to its balancing one.
    const open = src.indexOf('{', start);
    let depth = 0, end = -1;
    for (let i = open; i < src.length; i++) {
      const skip = skipStringOrComment(src, i);
      if (skip !== null) { i = skip - 1; continue; }
      if (src[i] === '{') depth++;
      else if (src[i] === '}' && --depth === 0) { end = i; break; }
    }
    if (end < 0) { err(`${c.file}: could not read ${c.fn}()'s body`); problems++; bad++; continue; }
    const body = src.slice(open, end + 1);
    for (const con of CONCEPTS) {
      const re = con.re instanceof RegExp ? con.re : con.re[c.file];
      if (!re || !re.test(body)) {
        err(`${c.file} · ${c.fn}(): never tests "${con.name}" — the other copies do, and all three have to agree on what hides an activity`);
        problems++; bad++;
      }
    }
    const guards = (body.match(/return false;/g) || []).length;
    if (guards !== c.guards) {
      err(`${c.file} · ${c.fn}(): ${guards} early "return false" guards, expected ${c.guards} — a condition was added or removed here without matching the other two copies (see 1ah)`);
      problems++; bad++;
    }
  }
  if (bad === 0) ok('all 3 visibility rules test the same 5 conditions, with matching guard counts');
}

/* ════════════════════════════════════════════════════════════════════
   1ag. CHORD RANKS COVER BOTH GAMES' DECKS — Chord Blitz (shapes, by eye)
   and Chord Detective (the same chords, by ear) both climb: a round starts
   with only the easiest chords in the deck in play and unlocks the next
   level every N right answers. Which level a chord belongs to comes from
   ONE table, CHORD_RANK, and every deck in both games derives its levels
   from it (chordDeckLevels). So a chord added to a deck without a rank
   does not look broken — chordRankOf() falls back to 1 and it quietly
   turns up on card one, which for a partial barre is the whole point of
   the climb undone. A rank left behind for a chord no longer in any deck
   is the mirror image: dead data that reads as intentional.

   Same shape as 1x (unused DECKS/EAR_POOLS ids): both directions, exact.
   Also pins that every deck can actually reach its top level inside a
   round — raising a promote-every or shortening a round would otherwise
   strand the hardest chords where no student ever meets them.
   ════════════════════════════════════════════════════════════════════ */
function checkChordBlitzRanks() {
  head("1ag. Chord difficulty ranks cover both games' decks");
  const src = readFileSync(join(ROOT, 'coach.js'), 'utf8');
  const GAMES = [
    { decks: 'CB_DECKS', cards: 'CB_CARDS', every: 'CB_PROMOTE_EVERY', label: 'Chord Blitz' },
    { decks: 'CD_DECKS', cards: 'CD_CARDS', every: 'CD_PROMOTE_EVERY', label: 'Chord Detective' },
  ];
  let rank;
  try {
    rank = loadConstObject(src, 'CHORD_RANK');
  } catch (e) {
    err(`coach.js: ${e.message}`);
    problems++;
    return;
  }
  let bad = 0;
  const inADeck = new Set();
  const summary = [];
  for (const g of GAMES) {
    let decks;
    try {
      /* Each is an array literal, so loadConstObject (which hunts for the
         first `{`) would read only its first deck — slice the array. */
      const m = src.match(new RegExp('const ' + g.decks + ' = (\\[[\\s\\S]*?\\n\\]);'));
      if (!m) throw new Error(`could not find "const ${g.decks} = [...]" in coach.js`);
      decks = vm.runInNewContext(`(${m[1]})`, vm.createContext({}));
    } catch (e) {
      err(`coach.js: ${e.message}`);
      problems++; bad++;
      continue;
    }
    for (const d of decks) {
      if (!Array.isArray(d.chords)) { err(`coach.js ${g.decks}['${d.id}'] has no chords array`); problems++; bad++; continue; }
      for (const n of d.chords) {
        inADeck.add(n);
        if (!Object.prototype.hasOwnProperty.call(rank, n)) {
          err(`coach.js CHORD_RANK has no entry for '${n}' (${g.label} deck '${d.id}') — it would silently play at level 1`);
          problems++; bad++;
        }
      }
    }
    const CARDS = Number((src.match(new RegExp('const ' + g.cards + ' = (\\d+)')) || [])[1]);
    const EVERY = Number((src.match(new RegExp('const ' + g.every + ' = (\\d+)')) || [])[1]);
    if (!CARDS || !EVERY) { err(`coach.js: ${g.cards} / ${g.every} not found`); problems++; bad++; continue; }
    for (const d of decks) {
      const levels = new Set((d.chords || []).map(n => rank[n]).filter(r => r != null)).size;
      if (!levels) continue;
      const needed = (levels - 1) * EVERY;
      if (needed >= CARDS) {
        err(`coach.js ${g.label} deck '${d.id}' has ${levels} levels — ${needed} right answers to top out, but a round is only ${CARDS} cards`);
        problems++; bad++;
      }
    }
    summary.push(`${g.label} ${decks.map(d => `${d.id}:${new Set(d.chords.map(n => rank[n])).size}`).join(' ')}`);
  }
  for (const n of Object.keys(rank)) {
    if (!inADeck.has(n)) {
      err(`coach.js CHORD_RANK['${n}'] is in no Chord Blitz or Chord Detective deck — dead rank`);
      problems++; bad++;
    }
  }
  if (bad === 0) ok(`${Object.keys(rank).length} chords ranked, every deck tops out inside its round (${summary.join(' | ')})`);
}

/* ═════════════════════════════════════════════════════════════════
   1ai. NO CONFIG WRITE SKIPS THE STALE-WRITE GUARD — teacher.js reads
   config/class once per view and computes every merge patch from that
   in-memory copy. Nothing listens to the doc, so a second console (another
   tab, the other machine) makes that copy stale, and a stale merge used to
   win silently: Firestore accepted it, the other session's change vanished,
   and neither screen said anything. teacherWriteConfig() is the fix — a
   transaction that compares config/class's `configVersion` with the one this
   tab read, and either rejects the write loudly or, for a caller that named
   the cells it depends on, lets an unrelated concurrent edit through.

   It only holds while EVERY writer goes through it. A `.set()` written
   straight onto the doc looks exactly like the fifteen that came before it
   and is invisible in review, so the detector is a flat ban: in teacher.js
   the only things allowed to touch config/class are the one `.get()` in
   loadTeacherClassConfig and the one document ref inside teacherWriteConfig
   itself. The writer count is pinned for the same reason 1ad pins its title
   counts — a sixteenth writer is fine, but it should be typed here
   deliberately, after a look at whether it can pass a `base` or needs the
   strict default.
   ═════════════════════════════════════════════════════════════════ */
const CONFIG_WRITERS = 26;   // teacherWriteConfig() call sites in teacher.js — 26th: teacherSetModuleHidden (cell-checked on each hiddenActivities row it writes), 2026-10-22; 25th: teacherSetClassSong (cell-checked on its classSongs row), 2026-10-22; 22nd/23rd: teacherSetActivityStudent (cell-checked on one student's tick) and teacherSetActivityWholeClass (strict), 2026-10-13; 24th: teacherSetSongPlace (cell-checked on its songLibrary row), 2026-10-20
function checkConfigWriteGuard() {
  head('1ai. Every config/class write goes through the stale-write guard');
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  let src;
  try { src = readFileSync(join(ROOT, 'teacher.js'), 'utf8').replace(/\r\n/g, '\n'); }
  catch { flag('teacher.js unreadable — 1ai cannot check this'); return; }

  /* The guard itself, before anything is measured against it. Each piece is
     load-bearing: without the transaction the check-then-write races, and
     without configVersion there is nothing to check. */
  const guard = (src.match(/async function teacherWriteConfig\([\s\S]*?\n}\n/) || [])[0];
  if (!guard) { flag('teacher.js: teacherWriteConfig() not found — the stale-write guard is gone'); return; }
  for (const [needle, why] of [
    ['runTransaction', 'the version check and the write must be one atomic step, or two tabs can both pass it'],
    ['configVersion', 'there is no version to compare'],
    ['teacherStaleConfigError', 'a rejected write must throw something teacherConfigSaveFailed can recognise'],
  ]) if (!guard.includes(needle)) flag(`teacher.js teacherWriteConfig(): no ${needle} — ${why}`);
  if (!/teacherConfigVersion = Number\(cfg\.configVersion\)/.test(src))
    flag('teacher.js loadTeacherClassConfig(): does not record cfg.configVersion — the guard would compare against a version this tab never read');

  // Every mention of the doc, and the two that are allowed to be there.
  src.split('\n').forEach((line, li) => {
    if (!line.includes("doc('class')")) return;
    const okGet = /\.doc\('class'\)\.get\(\)/.test(line);
    const okRef = /const ref = dbh\.collection\('config'\)\.doc\('class'\);/.test(line) && guard.includes(line.trim());
    if (!okGet && !okRef)
      flag(`teacher.js:${li + 1}: config/class touched outside teacherWriteConfig() — a write here skips the version check and would silently overwrite another console's change. "${line.trim().slice(0, 80)}"`);
  });

  const writers = (src.match(/await teacherWriteConfig\(/g) || []).length;
  if (writers !== CONFIG_WRITERS)
    flag(`teacher.js: ${writers} teacherWriteConfig() call sites, expected ${CONFIG_WRITERS} — if that is a new writer, decide whether it can name the cells it depends on (a \`base\`) or needs the strict default, then bump CONFIG_WRITERS here`);
  /* Every writer reports through the shared handler, which is the only
     thing that tells a stale rejection apart from a dropped connection.
     +1 for the function's own declaration. */
  const reporters = (src.match(/teacherConfigSaveFailed\(e,/g) || []).length;
  if (reporters !== CONFIG_WRITERS + 1)
    flag(`teacher.js: ${reporters - 1} catch blocks call teacherConfigSaveFailed(e, …), expected ${CONFIG_WRITERS} — a writer left on a bare alert() reports a stale write as a connection problem`);

  if (bad === 0) ok(`${CONFIG_WRITERS} config/class writers, all behind teacherWriteConfig() and reporting through teacherConfigSaveFailed()`);
}

/* ═════════════════════════════════════════════════════════════════
   1aj. THE ACTIVITY BOARD'S MODULE COLOURS — each module section on the
   teacher's Class activities board paints its heading a solid hue,
   hsl(--sec-h, --sec-s, --sec-wash-l), with the lightness set per palette
   on .t-board-section. Two kinds of text sit on that band: the module name
   (--text) and, in the corner, the card count (--text3, the tighter of the
   two).

   1s cannot judge any of it. Its palette is :root, and these are
   element-scoped custom properties, so `background-color:hsl(var(--sec-h),
   …)` resolves to nothing and the pair is skipped — which is exactly the
   shape of thing that drifts: "make the tint a bit stronger" moves one
   number and quietly takes the count below 4.5:1 in a palette nobody is
   looking at. So this check rebuilds all 13 washes from the stylesheet and
   scores them itself.

   The count is pinned for the same reason 1ad pins its title counts: a
   module losing its hue would otherwise just read as one fewer thing
   checked. A fourteenth module means typing 14 here, on purpose.
   ═════════════════════════════════════════════════════════════════ */
const BOARD_MODULE_HUES = 13;   // .t-board-section[data-module="1".."13"]
function checkBoardModuleColours() {
  head('1aj. Activity-board module colours');
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  let css;
  try { css = readFileSync(join(ROOT, 'styles.css'), 'utf8'); }
  catch { flag('styles.css unreadable — 1aj cannot check this'); return; }
  const map = cssRuleMap(css);

  const rootByMedia = map.get(':root');
  const secByMedia = map.get('.t-board-section');
  if (!rootByMedia || !secByMedia) { flag('styles.css: no :root or no .t-board-section rule — 1aj cannot check this'); return; }
  const darkRootKey = [...rootByMedia.keys()].find(isDarkMedia);
  const darkSecKey = [...secByMedia.keys()].find(isDarkMedia);
  if (!darkRootKey) { flag('styles.css: no dark :root block — 1aj would silently check only the light palette'); return; }
  if (!darkSecKey) { flag('styles.css: .t-board-section has no dark override — the wash lightness must flip with the palette, or one of the two is wrong'); return; }

  const base = secByMedia.get('') || new Map();
  const dark = secByMedia.get(darkSecKey) || new Map();
  const washL = { light: base.get('--sec-wash-l'), dark: dark.get('--sec-wash-l') || base.get('--sec-wash-l') };
  if (!washL.light || !washL.dark) { flag('styles.css: .t-board-section sets no --sec-wash-l — the heading wash has no lightness to check'); return; }

  const pal = {
    light: Object.fromEntries(rootByMedia.get('') || []),
    dark: { ...Object.fromEntries(rootByMedia.get('') || []), ...Object.fromEntries(rootByMedia.get(darkRootKey)) },
  };
  // Every module's own hue+saturation, falling back to .t-board-section's
  // defaults — which is what Unsorted renders with, so a missing one is a
  // real value here, not a hole.
  const mods = [];
  for (const [sel, byMedia] of map) {
    const m = /^\.t-board-section\[data-module="(\d+)"\]$/.exec(sel);
    if (!m) continue;
    const d = byMedia.get('') || new Map();
    mods.push({ num: Number(m[1]), h: d.get('--sec-h') || base.get('--sec-h'), s: d.get('--sec-s') || base.get('--sec-s') });
  }
  if (mods.length !== BOARD_MODULE_HUES)
    flag(`styles.css: ${mods.length} module hues on the activity board, expected ${BOARD_MODULE_HUES} — if a module was added or dropped, bump BOARD_MODULE_HUES here`);

  let worst = { r: Infinity };
  for (const mod of mods) {
    if (!mod.h || !mod.s) { flag(`styles.css: .t-board-section[data-module="${mod.num}"] sets no --sec-h/--sec-s and .t-board-section has no default`); continue; }
    for (const mode of ['light', 'dark']) {
      const wash = cssRGB(`hsl(${mod.h},${mod.s},${washL[mode]})`);
      if (!wash) { flag(`styles.css: module ${mod.num}'s ${mode} wash hsl(${mod.h},${mod.s},${washL[mode]}) does not parse`); continue; }
      for (const token of ['--text', '--text3']) {
        const fg = cssRGB(cssVar(`var(${token})`, pal[mode]));
        if (!fg) { flag(`styles.css: ${token} missing from the ${mode} palette`); continue; }
        const r = ratio(fg, wash);
        if (r < worst.r) worst = { r, mode, num: mod.num, token };
        if (r < 4.5)
          flag(`styles.css: module ${mod.num}'s heading — ${r.toFixed(2)}:1 in ${mode} mode (${token} on the hsl(${mod.h},${mod.s},${washL[mode]}) wash); needs 4.5. Move --sec-wash-l away from mid-gray (${mode === 'light' ? 'lighter' : 'darker'}), or drop --sec-s.`);
      }
    }
  }
  if (bad === 0) ok(`${mods.length} module washes on the activity board — every heading and count ≥ 4.5:1 in both palettes (tightest ${worst.r.toFixed(2)}:1, module ${worst.num} ${worst.token} in ${worst.mode})`);
}

/* ═════════════════════════════════════════════════════════════════
   1ak. BACKING-TRACK SNIPPETS — a class-activity step's `snippet`
   ({ track, fromBar, bars }) loops a WINDOW of a real backing-track mp3,
   placed by bar arithmetic off SNIPPET_TRACKS in app.js. None of it fails
   loudly in the room: a window past the end of the file is a play button
   that produces silence, and a typo'd track name is a card that renders
   nothing at all. Both look identical from the console board's preview
   tile, so they are checked here.

   NOT checked, deliberately: whether `bars` agrees with the step's own tab.
   There is no uniform beats-per-note convention to read it off — "the cure"
   tabs write ONE note per bar (caption "4 beats each", no `beats` field),
   while Seven Nation Army's riff writes seven notes across two bars — so a
   note count maps to bars only if the tab declares which it is, and none do.
   An earlier version of this comment claimed the check existed; it never
   did. Don't re-add it without giving tabs that declaration first, because
   the plausible-looking `notes.length / beatsPerBar` rule is wrong for
   every "the cure" snippet on the site. `fromBar` is unguardable the same
   way and for a deeper reason: only the recording knows where a section
   starts (on 2026-09-18 a chorus window sat 8 bars early, at the repeat of
   the verse, and only measuring the mp3 found it).

   Also pins the two-renderers rule for this field. buildSnippet() is called
   by caStepHtml() in app.js and renderTeacherActivityDetail() in
   teacher.js; drop either call and the day's loop is silently missing from
   one of the two places it has to be (CLAUDE.md), which is exactly how the
   ca-11 drills shipped invisible to the teacher in August.

   ANCHOR: a track's `anchor` is its first downbeat in seconds and the one
   number here that has to be measured by ear (?snipcal=1 on localhost).
   While `anchorVerified` is false this WARNS rather than fails — an
   unmeasured anchor is a snippet that starts in the wrong place, not a
   broken build, and failing the push would block the very session doing the
   measuring. It stays noisy on every push until someone flips it.
   ═════════════════════════════════════════════════════════════════ */
/* Duration of an mp3, in seconds, by walking its frame headers — no decode
   and no dependency. Layer III only, MPEG 1 / 2 / 2.5, CBR or VBR (it sums
   real frames rather than trusting the first one's bitrate).

   Used by 1ak to compare a full mix against its rhythm-down twin. Two mixes
   of the same song at the same tempo are the same performance with different
   stems muted, so they have to be the same length; a mismatch means one of
   them was trimmed or stretched differently, and THAT is the failure nobody
   can hear — both files play fine on their own, and the Guitar toggle just
   jumps the loop somewhere into the song. */
const MP3_BITRATES = {
  1: [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0],   // MPEG 1 Layer III
  2: [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160,0],       // MPEG 2/2.5 Layer III
};
const MP3_RATES = { 3: [44100,48000,32000], 2: [22050,24000,16000], 0: [11025,12000,8000] };
function mp3DurationSec(file) {
  let buf;
  try { buf = readFileSync(file); } catch { return null; }
  let i = 0;
  // Skip an ID3v2 tag if there is one (syncsafe size, 7 bits per byte).
  if (buf.length > 10 && buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33)
    i = 10 + ((buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9]);
  let samples = 0, rate = 0, frames = 0;
  while (i < buf.length - 4) {
    if (buf[i] !== 0xFF || (buf[i + 1] & 0xE0) !== 0xE0) { i++; continue; }
    const verBits = (buf[i + 1] >> 3) & 3;          // 3=MPEG1, 2=MPEG2, 0=MPEG2.5
    const layer = (buf[i + 1] >> 1) & 3;            // 1 = Layer III
    const brIdx = (buf[i + 2] >> 4) & 15;
    const srIdx = (buf[i + 2] >> 2) & 3;
    const pad = (buf[i + 2] >> 1) & 1;
    if (layer !== 1 || verBits === 1 || srIdx === 3 || brIdx === 0 || brIdx === 15) { i++; continue; }
    const sr = (MP3_RATES[verBits] || [])[srIdx];
    const br = MP3_BITRATES[verBits === 3 ? 1 : 2][brIdx] * 1000;
    if (!sr || !br) { i++; continue; }
    const spf = verBits === 3 ? 1152 : 576;         // samples per frame
    const len = Math.floor(spf / 8 * br / sr) + pad;
    if (len < 4) { i++; continue; }
    samples += spf; rate = sr; frames++;
    i += len;
  }
  return (frames && rate) ? samples / rate : null;
}
/* The source of one top-level `function name(...) { ... }`, brace-matched.
   Null when there is no such function — a caller that renames one should be
   told its check went blind, not quietly pass. Brace counting ignores braces
   inside strings, template literals and comments (skipStringOrComment). */
function jsFunctionBody(src, name) {
  const m = new RegExp(`function\\s+${name}\\s*\\(`).exec(src);
  if (!m) return null;
  let i = src.indexOf('{', m.index);
  if (i < 0) return null;
  const start = i;
  let depth = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === "'" || c === '"' || c === '`' || (c === '/' && (src[i + 1] === '/' || src[i + 1] === '*'))) {
      const skip = skipStringOrComment(src, i);
      if (skip > i) { i = skip; continue; }
    }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (!depth) return src.slice(start, i + 1); }
    i++;
  }
  return null;
}
const SNIPPET_TRACK_FIELDS = ['src', 'srcSlow',
                              'trackBpm', 'trackBpmSlow', 'feltBpm', 'beatsPerBar', 'durationSec'];
/* Gone since 2026-10-01: the site makes its own click on snippets, practice
   cards and Song Journey pages, so no track names a metronome mix. A field
   that comes back would point at a file 1bk refuses to have in audio/. */
const SNIPPET_METRONOME_FIELDS = ['srcMetronome', 'srcSlowMetronome', 'srcFullMetronome', 'srcFullSlowMetronome'];
function checkBackingSnippets() {
  head('1ak. Backing-track snippets');
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };

  let appSrc, teacherSrc, TRACKS;
  try { appSrc = readFileSync(join(ROOT, 'app.js'), 'utf8'); }
  catch { flag('app.js unreadable — 1ak cannot check this'); return; }
  try { teacherSrc = readFileSync(join(ROOT, 'teacher.js'), 'utf8'); }
  catch { flag('teacher.js unreadable — 1ak cannot check this'); return; }
  try { TRACKS = loadConstObject(appSrc, 'SNIPPET_TRACKS'); }
  catch (e) { flag(`app.js: could not load SNIPPET_TRACKS — ${e.message}`); return; }

  /* Two renderers, one builder — both sides must call it, INSIDE the
     function that renders a step and with comments stripped first. The
     first cut of this searched app.js from caStepHtml() to the end of the
     file and matched the words "see buildSnippet()" in the comment sitting
     directly above the call: deleting the call left the check green. That
     is the exact shape of dead ratchet the 2026-09-07 review found five of
     — so this one is proved by deleting each call in turn and watching it
     go red. */
  const callsBuildSnippet = (src, fnName) => {
    const body = jsFunctionBody(src, fnName);
    return body !== null && /buildSnippet\s*\(/.test(stripJsComments(body));
  };
  if (jsFunctionBody(appSrc, 'caStepHtml') === null)
    flag('app.js: no caStepHtml() found — 1ak cannot tell whether students get the snippet');
  else if (!callsBuildSnippet(appSrc, 'caStepHtml'))
    flag('app.js: caStepHtml() never calls buildSnippet() — a step\'s snippet would be invisible to students');
  if (jsFunctionBody(teacherSrc, 'renderTeacherActivityDetail') === null)
    flag('teacher.js: no renderTeacherActivityDetail() found — 1ak cannot tell whether the console preview gets the snippet');
  else if (!callsBuildSnippet(teacherSrc, 'renderTeacherActivityDetail'))
    flag('teacher.js: renderTeacherActivityDetail() never calls buildSnippet() — the console preview would not play the day\'s loop (two renderers, see CLAUDE.md)');

  // Every track is fully specified, and its files exist.
  const trackNames = Object.keys(TRACKS);
  let unverified = 0;
  for (const [name, tr] of Object.entries(TRACKS)) {
    for (const f of SNIPPET_TRACK_FIELDS) {
      if (tr[f] === undefined) { flag(`SNIPPET_TRACKS['${name}']: missing ${f}`); continue; }
      if (f.startsWith('src')) {
        if (!existsSync(join(ROOT, tr[f]))) flag(`SNIPPET_TRACKS['${name}'].${f}: ${tr[f]} does not exist`);
      } else if (!(Number(tr[f]) > 0)) {
        flag(`SNIPPET_TRACKS['${name}'].${f}: "${tr[f]}" is not a positive number`);
      }
    }
    for (const f of SNIPPET_METRONOME_FIELDS) {
      if (tr[f] !== undefined)
        flag(`SNIPPET_TRACKS['${name}'].${f}: metronome mixes are retired — the site makes the click (snipScheduleClick / pcScheduleClick), so nothing reads this path. Delete the field; a Moises metronome export is only a measuring input for tools/beat-map.py and stays out of audio/`);
    }
    /* The OPTIONAL full mix (the Guitar toggle). Both tempo tiers or neither:
       a toggle that dies the moment Slow is pressed is worse than no toggle.
       Any path declared has to point at a file that is actually there — a
       typo'd full-mix name is a Play button that 404s, and only in the one
       mode a student reaches by pressing the button that is on by default. */
    const FULL_PAIRS = [['srcFull', 'srcFullSlow']];
    for (const [fast, slow] of FULL_PAIRS) {
      if (!!tr[fast] !== !!tr[slow])
        flag(`SNIPPET_TRACKS['${name}']: has ${tr[fast] ? fast : slow} but not ${tr[fast] ? slow : fast} — a full mix needs both tempo tiers or neither, or the toggle breaks on Slow`);
    }
    /* defaultSlow (optional) opens the card on the slow tier — buildSnippet
       writes data-slow AND the turtle's aria-pressed from it, so a non-boolean
       here would light the button without moving the engine, or the reverse.
       It also has to be a tier the track can actually play: the slow sources
       are required above, but a truthy value on a track whose slow files were
       removed would open every card on a 404. */
    if (tr.defaultSlow !== undefined) {
      if (typeof tr.defaultSlow !== 'boolean')
        flag(`SNIPPET_TRACKS['${name}'].defaultSlow: ${JSON.stringify(tr.defaultSlow)} is not a boolean — buildSnippet tests it with === true, so anything else silently means "fast" for the engine while the turtle may still light up`);
      else if (tr.defaultSlow && !tr.srcSlow)
        flag(`SNIPPET_TRACKS['${name}']: defaultSlow is true but there is no srcSlow — every card on this track would open on a tier with no file`);
    }
    for (const f of FULL_PAIRS.flat()) {
      if (tr[f] && !existsSync(join(ROOT, tr[f]))) flag(`SNIPPET_TRACKS['${name}'].${f}: ${tr[f]} does not exist`);
    }
    /* A full mix and its rhythm-down twin are the same performance at the
       same tempo with different stems muted, so they are the same length.
       A mismatch means one was trimmed, stretched or count-in'd differently
       — and that is the one failure nobody can hear: both files play fine
       alone, and the Guitar toggle simply jumps the loop somewhere else in
       the song. 0.25 s of slack absorbs mp3 encoder padding (~50 ms) while
       still catching a real re-trim. */
    const TWINS = [['srcFull', 'src'], ['srcFullSlow', 'srcSlow']];
    for (const [full, plain] of TWINS) {
      if (!tr[full] || !existsSync(join(ROOT, tr[full])) || !existsSync(join(ROOT, tr[plain]))) continue;
      const a = mp3DurationSec(join(ROOT, tr[full])), b = mp3DurationSec(join(ROOT, tr[plain]));
      if (a === null || b === null) { flag(`SNIPPET_TRACKS['${name}']: could not read the length of ${a === null ? tr[full] : tr[plain]} — not a readable mp3?`); continue; }
      if (Math.abs(a - b) > 0.25)
        flag(`SNIPPET_TRACKS['${name}']: ${full} is ${a.toFixed(2)}s but ${plain} is ${b.toFixed(2)}s (${(a - b > 0 ? '+' : '')}${(a - b).toFixed(2)}s) — the two mixes must be the same performance, so the Guitar toggle would jump the loop. Re-export the full mix at the same tempo with no count-in and no re-trim.`);
    }
    /* durationSec is hand-typed and is what catches a window running off the
       end of the track, so a typo there quietly disarms that check. */
    const realDur = existsSync(join(ROOT, tr.src)) ? mp3DurationSec(join(ROOT, tr.src)) : null;
    if (realDur !== null && Math.abs(realDur - Number(tr.durationSec)) > 1.5)
      flag(`SNIPPET_TRACKS['${name}'].durationSec says ${tr.durationSec} but ${tr.src} is ${realDur.toFixed(1)}s — fix the number, it is what stops a window running past the end`);
    if (!(Number(tr.anchor) >= 0)) flag(`SNIPPET_TRACKS['${name}'].anchor: "${tr.anchor}" is not a number ≥ 0`);
    /* barTimes (optional) — a live-band track's beat map, one downbeat per
       bar on the fast file. It replaces the grid, so it has to agree with
       the fields the rest of 1ak still reads: bar 1 IS the anchor, every bar
       is within reach of the nominal length (a missed click makes a double
       bar, a doubled click a half one), and the list ends inside the file. */
    if (tr.barTimes !== undefined) {
      const bt = tr.barTimes;
      if (!Array.isArray(bt) || bt.length < 2 || bt.some(v => !(Number(v) >= 0)))
        flag(`SNIPPET_TRACKS['${name}'].barTimes: not a list of at least two times in seconds`);
      else {
        if (Math.abs(bt[0] - Number(tr.anchor)) > 0.002)
          flag(`SNIPPET_TRACKS['${name}']: barTimes[0] is ${bt[0]} but anchor is ${tr.anchor} — bar 1 is the anchor, they must agree`);
        const nominal = Number(tr.beatsPerBar) * 60 / Number(tr.feltBpm);
        for (let i = 0; i < bt.length - 1; i++) {
          const g = bt[i + 1] - bt[i];
          if (!(g > nominal * 0.7 && g < nominal * 1.4)) {
            flag(`SNIPPET_TRACKS['${name}'].barTimes: bar ${i + 1} is ${g.toFixed(3)}s against a nominal ${nominal.toFixed(3)}s — a missed or doubled click, or a list out of order; re-run tools/beat-map.py`);
            break;
          }
        }
        if (bt[bt.length - 1] > Number(tr.durationSec) + 1.5)
          flag(`SNIPPET_TRACKS['${name}'].barTimes: last downbeat ${bt[bt.length - 1]}s is past durationSec ${tr.durationSec}`);
      }
    }
    // The slow tier is DERIVED from these two, never measured separately —
    // a slow file that is not a straight time-stretch would put every
    // window on that song out by a growing amount as it plays.
    if (Number(tr.trackBpmSlow) >= Number(tr.trackBpm))
      flag(`SNIPPET_TRACKS['${name}']: trackBpmSlow (${tr.trackBpmSlow}) must be below trackBpm (${tr.trackBpm}) — the Slow toggle is the slower file`);
    if (!tr.anchorVerified) unverified++;
  }

  // Every step's snippet resolves, and its window lands inside the file.
  let src;
  try { src = readFileSync(join(ROOT, 'class-activities.js'), 'utf8'); }
  catch { flag('class-activities.js unreadable — 1ak cannot check the steps'); return; }
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  try { vm.runInContext(src, sandbox, { filename: 'class-activities.js' }); }
  catch { flag('class-activities.js failed to load — 1ak cannot check the steps'); return; }
  const activities = sandbox.CLASS_ACTIVITIES || [];

  let snippets = 0;
  for (const a of activities) {
    for (const [si, step] of (a.steps || []).entries()) {
      const sn = step && step.snippet;
      if (!sn) continue;
      snippets++;
      const where = `${a.id} step ${si + 1}`;
      const tr = TRACKS[sn.track];
      if (!tr) {
        flag(`${where}: snippet track "${sn.track}" is not in SNIPPET_TRACKS (have: ${trackNames.join(', ') || 'none'})`);
        continue;
      }
      if (!Number.isInteger(sn.fromBar) || sn.fromBar < 1)
        flag(`${where}: fromBar "${sn.fromBar}" is not a bar number — bars count from 1`);
      if (!Number.isInteger(sn.bars) || sn.bars < 1)
        flag(`${where}: bars "${sn.bars}" is not a positive whole number of bars`);
      if (sn.label === undefined || sn.label_es === undefined)
        flag(`${where}: snippet needs both label and label_es — never ship an English-only string`);
      if (!Number.isInteger(sn.fromBar) || !Number.isInteger(sn.bars)) continue;
      // The fast file is the one anchor/durationSec are measured against;
      // the slow tier is the same music, so checking one covers both.
      if (Array.isArray(tr.barTimes) && tr.barTimes.length > 1) {
        const lastBar = tr.barTimes.length - 1;   // bars that have both edges measured
        if (sn.fromBar - 1 + sn.bars > lastBar)
          flag(`${where}: bars ${sn.fromBar}–${sn.fromBar + sn.bars - 1} run past the last measured bar of ${sn.track} (bar ${lastBar}) — the loop would end on a guessed bar line`);
        continue;
      }
      const barSec = tr.beatsPerBar * 60 / tr.feltBpm;
      const end = Number(tr.anchor) + (sn.fromBar - 1 + sn.bars) * barSec;
      if (end > Number(tr.durationSec))
        flag(`${where}: bars ${sn.fromBar}–${sn.fromBar + sn.bars - 1} end at ${end.toFixed(1)}s, past the end of ${sn.track} (${tr.durationSec}s) — the loop would play silence`);
    }
  }

  if (unverified) {
    warn(`${unverified} snippet track${unverified > 1 ? 's have' : ' has'} anchorVerified:false — ${unverified > 1 ? 'their first downbeats have' : 'its first downbeat has'} not been measured, so every snippet on ${unverified > 1 ? 'those songs starts' : 'that song starts'} in the wrong place. Measure ${unverified > 1 ? 'them' : 'it'} by adding ?snipcal=1 to the URL (works on the live site too) and pressing Find the first click — see SNIPPET_TRACKS in app.js.`);
    warnings++;
  }
  /* A track whose src IS the record (`-full.mp3` — Las Mañanitas, 2026-10-14:
     the uploaded recording, no Moises stems) already plays the part; there is
     nothing for a Guitar toggle to switch to, so it isn't counted as missing. */
  const isRecord = tr => /-full\.mp3$/.test(tr.src || '') && /-full\.mp3$/.test(tr.srcSlow || '');
  const withFull = Object.values(TRACKS).filter(tr => (tr.srcFull && tr.srcFullSlow) || isRecord(tr)).length;
  if (withFull < trackNames.length) {
    warn(`${trackNames.length - withFull} of ${trackNames.length} snippet track${trackNames.length === 1 ? '' : 's'} have no full mix exported, so their cards show no Guitar toggle — students hear the rhythm-down mix only and cannot check the part they are learning against the record.`);
    warnings++;
  }
  if (bad === 0) ok(`${snippets} backing-track snippet${snippets === 1 ? '' : 's'} across ${trackNames.length} track${trackNames.length === 1 ? '' : 's'} (${withFull} with a full mix) — every window lands inside its file, both renderers build them`);
}

/* ════════════════════════════════════════════════════════════════════
   1am. ACTIVITY SIZE — practice-chunks work order, 2026-09-19, Phase 4.
   Warns (does not fail the push) when a non-check class activity has more
   than 7 steps or more than 600 words of English step text — the same
   ceiling item 3o trimmed ca-17 to (976 words / 9 steps down to 597 words
   / 7 steps). A warning, not a hard fail: a future activity might
   legitimately need more room once; the point is the same nudge 3o
   answered, not a hard wall nobody can cross.
   ════════════════════════════════════════════════════════════════════ */
function checkActivitySize() {
  head('1am. Activity size — steps and word count');
  let src;
  try { src = readFileSync(join(ROOT, 'class-activities.js'), 'utf8'); }
  catch { return; }  // reported by 1d
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  try { vm.runInContext(src, sandbox, { filename: 'class-activities.js' }); }
  catch { return; }  // reported by 1d
  const activities = sandbox.CLASS_ACTIVITIES || [];
  let flagged = 0;
  for (const a of activities) {
    if (!a || a.kind === 'check' || !Array.isArray(a.steps)) continue;
    // A paths activity (ca-46) is as long as its LONGEST route: one path's steps plus the shared ones.
    const stepCount = caLongestRoute(a).length;
    const words = caLongestRoute(a).reduce((n, s) => {
      const stripped = ((s && s.text) || '').replace(/<[^>]+>/g, ' ').trim();
      return n + (stripped ? stripped.split(/\s+/).length : 0);
    }, 0);
    if (stepCount > 7 || words > 600) {
      warn(`${a.id} ("${a.title}"): ${stepCount} steps, ${words} EN words of step text — over the 7-step/600-word guideline (item 3o's own trim target)`);
      warnings++; flagged++;
    }
  }
  if (flagged === 0) ok('every non-check class activity is within the 7-step/600-word guideline (ca-17 confirmed trimmed)');
}

/* ════════════════════════════════════════════════════════════════════
   1aq. A RHYTHM TAB THAT CLAIMS EVEN NOTES — Happy Birthday is a 3/4
   tune with a two-note pickup, and until 2026-09-20 every one of its 20
   tab phrases carried no `beats` at all, so buildTab()'s player and the
   step text's "one note per beat" together taught it as six equal
   notes. Fails the push when a step whose tab is a Happy Birthday
   phrase has no note carrying `beats`, or when such a step's own text
   still claims one note per beat.
   `kind:'check'` activities are exempt on purpose: an exit check's
   `items` are frozen (stored picks are positional), and ca-14's
   nextNote stimuli are Happy Birthday fragments.
   ════════════════════════════════════════════════════════════════════ */
function checkHappyBirthdayRhythm() {
  head('1aq. Happy Birthday tabs carry their rhythm');
  let src;
  try { src = readFileSync(join(ROOT, 'class-activities.js'), 'utf8'); }
  catch { return; }                       // reported by 1d
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  try { vm.runInContext(src, sandbox, { filename: 'class-activities.js' }); }
  catch { return; }                       // reported by 1d
  const activities = sandbox.CLASS_ACTIVITIES || [];
  /* Identify a phrase by the NOTES, not by the words around it: two of
     ca-1's tabs are captioned "Phrase C · low E string only" and never
     say the song's name, while two others inside the same activities
     ("Find the dots", "land on the dot") are fretboard drills that a
     title-based match would sweep in. A signature is exact. */
  /* 3/4 with a two-note pickup: "Hap-py" is two half-beats, "birth",
     "day" and "to" are a beat each, and the note the line lands on is
     held. A missing `beats` reads as 1. */
  const HB_RHYTHM = new Map([
    ['E0 E0 E2 E0 E5 E4',     [0.5, 0.5, 1, 1, 1, 2]],     // Phrase A
    ['E0 E0 E2 E0 E7 E5',     [0.5, 0.5, 1, 1, 1, 2]],     // Phrase B
    ['E0 E0 E12 E9 E5 E4 E2', [0.5, 0.5, 1, 1, 1, 1, 2]],  // Phrase C, low E
    ['E0 E0 A7 A4 A0 E4 E2',  [0.5, 0.5, 1, 1, 1, 1, 2]],  // Phrase C, crossing to the A string
    ['E10 E10 E9 E5 E7 E5',   [0.5, 0.5, 1, 1, 1, 2]],     // Phrase D, low E
    ['A5 A5 A4 A0 A2 A0',     [0.5, 0.5, 1, 1, 1, 2]],     // Phrase D, A string
    ['E0 E0 E2 E0',           [0.5, 0.5, 1, 1]],           // "Hap-py birth-day" — the first four notes
  ]);
  const HB_PHRASES = 20;            // pinned: every Happy Birthday tab phrase outside an exit check
  const HB = /hap-?py\s*birth-?day/i;
  const EVEN = /one note per beat|una nota por (?:pulso|tiempo)/i;
  let phrases = 0, withBeats = 0, bad = 0;
  const flag = m => { err(m); problems++; bad++; };

  for (const a of activities) {
    if (!a || a.kind === 'check' || !Array.isArray(a.steps)) continue;
    a.steps.forEach((st, si) => {
      const t = st && st.tab;
      const tabs = Array.isArray(st && st.tabs) ? st.tabs : (t ? [t] : []);
      for (const tab of tabs) {
        const groups = Array.isArray(tab.phrases)
          ? tab.phrases.map(ph => ({ label: ph.label || '', notes: ph.notes || [] }))
          : [{ label: tab.caption || '', notes: tab.notes || [] }];
        for (const g of groups) {
          if (!g.notes.length) continue;
          const sig = g.notes.map(n => `${n.string}${n.fret}`).join(' ');
          const want = HB_RHYTHM.get(sig);
          if (!want) continue;
          phrases++;
          const have = g.notes.map(n => (n && n.beats !== undefined) ? n.beats : 1);
          if (have.join(' ') === want.join(' ')) withBeats++;
          else flag(`${a.id} step ${si + 1}: the Happy Birthday phrase "${(g.label || tab.caption || '').slice(0, 46)}" is timed ${have.join(' ')} — it should be ${want.join(' ')}. Without that the player spaces the notes evenly, which is not how the tune goes.`);
        }
      }
      // …and the step's own prose must not still promise even notes.
      const prose = `${(st && st.text) || ''} ${(st && st.text_es) || ''}`;
      if (HB.test(`${prose} ${(st && st.label) || ''}`) && EVEN.test(prose))
        flag(`${a.id} step ${si + 1}: text still says "one note per beat" about Happy Birthday — name the long notes instead`);
    });
  }
  if (phrases !== HB_PHRASES)
    flag(`found ${phrases} Happy Birthday tab phrases, expected ${HB_PHRASES} — if a phrase was added or removed, update HB_PHRASES (and HB_RHYTHM if the notes are new) on purpose`);
  if (bad === 0) ok(`${phrases} Happy Birthday tab phrases, all ${withBeats} carrying their rhythm; no step still claims even notes`);
}

/* ════════════════════════════════════════════════════════════════════
   1ar. SHORT-RESPONSE BUDGET — "less typing, more playing" (Jonathan,
   2026-09-19). Modules 3-6 went from 82 typed answers to 8 on
   2026-09-20: 41 of the 82 sat in sections that no longer render, and
   33 of the 41 a student could actually see became a playing task with
   a countable success line. The 8 that remain are the ones where
   writing IS the task — two Listen steps, the mood clips, the
   four-phrase plan, compose-in-scale-degrees, map your chords, revisit
   your goal, reggae vs. rock.
   The budget only fails UPWARD. Removing one more is always fine;
   adding one back is the thing that needs a decision, so raise the
   number here on purpose when you mean to.
   2026-10-12: the pentatonic module (Module 5 since the 4↔5 swap) had
   carried one slot of slack — budget 3, real count 2 — so its budget is
   now its real 2 and the total 7.
   ════════════════════════════════════════════════════════════════════ */
const SHORT_RESPONSE_BUDGET = { 3: 0, 4: 4, 5: 2, 6: 1 };
function checkShortResponseBudget() {
  head('1ar. Short-response budget (Modules 3-6)');
  const configSrc = readFileSync(join(ROOT, 'config-main.js'), 'utf8');
  const counts = {};
  let seenAny = false;
  for (const file of MODULE_FILES) {
    const sandbox = { console };
    vm.createContext(sandbox);
    let sets;
    try {
      vm.runInContext(configSrc, sandbox, { filename: 'config-main.js' });
      vm.runInContext(readFileSync(join(ROOT, file), 'utf8'), sandbox, { filename: file });
      sets = vm.runInContext('SETS', sandbox) || [];
    } catch { continue; }                 // reported by 1
    for (const s of sets) {
      const m = Number(s && s.moduleNum);
      if (!(m in SHORT_RESPONSE_BUDGET)) continue;
      seenAny = true;
      counts[m] = counts[m] || 0;
      for (const stId of Object.keys((s && s.stations) || {})) {
        const stn = s.stations[stId];
        const secs = stn.sections || (stn.steps ? [{ steps: stn.steps }] : []);
        for (const sec of secs)
          for (const step of (sec.steps || []))
            if (step && step.response && step.response.type === 'short') counts[m]++;
      }
    }
  }
  if (!seenAny) { err('1ar found no Modules 3-6 at all — it cannot see what it is supposed to guard'); problems++; return; }
  let bad = 0;
  for (const m of Object.keys(SHORT_RESPONSE_BUDGET).map(Number).sort((a, b) => a - b)) {
    const have = counts[m] || 0, cap = SHORT_RESPONSE_BUDGET[m];
    if (have > cap) {
      err(`Module ${m}: ${have} short responses, budget is ${cap} — a typed answer was added back. If that is deliberate (writing IS the task there: goal-setting, composing, describing what you heard), raise SHORT_RESPONSE_BUDGET in checks.mjs in the same edit.`);
      problems++; bad++;
    }
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (!bad) ok(`${total} short responses across Modules 3-6, all within budget (${Object.entries(SHORT_RESPONSE_BUDGET).map(([m, c]) => `M${m}≤${c}`).join(' ')})`);
}

/* ════════════════════════════════════════════════════════════════════
   1ar2. CHALLENGE CARDS SAY WHEN YOU'VE GOT IT (2026-10-12). A Challenge
   card (a step whose label starts "Challenge") is where a set names its
   standard, and the house pattern since Module 2 is a countable
   "You've got it when: …" line after the list. The 2026-10-12 review
   found 17 Challenge cards in Modules 9-11 with none — the student was
   told what to do and never when it was done — and fixed all 17 (EN+ES).
   The five left are in Modules 3, 4, 6, 7 and 8, carried as-is.
   Same shape as 1ar: a per-module budget that only fails UPWARD. A card
   counts as missing when EITHER language lacks the line. Taking one more
   away is always fine (then lower the number here); adding a Challenge
   card without a got-it line is the thing that needs a decision.
   ════════════════════════════════════════════════════════════════════ */
const CHALLENGE_NO_GOTIT_BUDGET = { 1: 0, 2: 0, 3: 1, 4: 1, 5: 0, 6: 1, 7: 1, 8: 1, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0 };
function checkChallengeGotItBudget() {
  head('1ar2. Challenge cards without a "You\'ve got it when" line (budget)');
  const configSrc = readFileSync(join(ROOT, 'config-main.js'), 'utf8');
  const EN = /You(?:'|&#39;|’)ve got it when:/;   // the same three spellings as app.js GOT_IT_RE
  const ES = /Lo tienes cuando:/;
  const counts = {}, missing = {};
  let cards = 0;
  for (const file of MODULE_FILES) {
    const sandbox = { console };
    vm.createContext(sandbox);
    let sets;
    try {
      vm.runInContext(configSrc, sandbox, { filename: 'config-main.js' });
      vm.runInContext(readFileSync(join(ROOT, file), 'utf8'), sandbox, { filename: file });
      sets = vm.runInContext('SETS', sandbox) || [];
    } catch { continue; }                 // reported by 1
    for (const s of sets) {
      const m = Number(s && s.moduleNum);
      counts[m] = counts[m] || 0;
      for (const stId of Object.keys((s && s.stations) || {})) {
        const stn = s.stations[stId];
        const secs = stn.sections || (stn.steps ? [{ steps: stn.steps }] : []);
        secs.forEach((sec, si) => (sec.steps || []).forEach((step, i) => {
          if (!step || !/^Challenge\b/.test(step.label || '')) return;
          cards++;
          if (EN.test(step.text || '') && ES.test(step.text_es || '')) return;
          counts[m]++;
          /* Same address as 1av's card key and 1bg's path: 0-based indexes
             into the RAW sections/steps arrays (hidden ones included), not
             the 1-based numbers the student sees. */
          (missing[m] = missing[m] || []).push(`${s.id}·${stId}·sec${si}·step${i} "${step.label}"`);
        }));
      }
    }
  }
  if (!cards) { err('1ar2 found no Challenge cards at all — it cannot see what it is supposed to guard'); problems++; return; }
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  for (const m of Object.keys(CHALLENGE_NO_GOTIT_BUDGET).map(Number))
    if (!(m in counts)) flag(`1ar2: Module ${m} has a budget but no sets were read for it — the check has gone blind there`);
  const lower = [];
  for (const m of Object.keys(counts).map(Number).sort((a, b) => a - b)) {
    const have = counts[m], cap = CHALLENGE_NO_GOTIT_BUDGET[m];
    if (cap === undefined) { flag(`1ar2: Module ${m} has no entry in CHALLENGE_NO_GOTIT_BUDGET — add one (0 unless a card genuinely has no countable finish)`); continue; }
    if (have > cap) flag(`Module ${m}: ${have} Challenge card${have === 1 ? '' : 's'} without a "You've got it when:" / "Lo tienes cuando:" line, budget is ${cap} — add a countable got-it line after the list, in both languages (sec/step counted from 0 over the raw arrays, as in 1av and 1bg): ${missing[m].join('; ')}`);
    else if (have < cap) lower.push(`M${m} ${cap}→${have}`);
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (!bad) ok(`${cards} Challenge cards, ${total} without a got-it line — all within budget${lower.length ? ` (now below budget, lower it: ${lower.join(', ')})` : ''}`);
}

/* ════════════════════════════════════════════════════════════════════
   1as. THE DAILY 5 SWITCH — the "Tune and warm up first" banner was
   retired on 2026-09-19 by setting DAILY5_ENABLED = false rather than
   deleting buildDaily5() / openDaily5Here(), so flipping the constant
   brings it back. That only holds while the constant is a real boolean
   literal AND the render path it gates is still there; if someone
   deletes the banner's render branch, flipping it back to true would
   silently do nothing, which is the worst of both worlds.
   ════════════════════════════════════════════════════════════════════ */
function checkDaily5Switch() {
  head('1as. Daily 5 is switched off, not broken');
  let src;
  try { src = readFileSync(join(ROOT, 'app.js'), 'utf8'); }
  catch { err('app.js unreadable — 1as cannot check this'); problems++; return; }
  const m = src.match(/\bconst\s+DAILY5_ENABLED\s*=\s*([^;]+);/);
  if (!m) { err('DAILY5_ENABLED is gone from app.js — the Daily 5 is meant to be switched off, not deleted'); problems++; return; }
  const value = m[1].trim();
  if (value !== 'true' && value !== 'false') {
    err(`DAILY5_ENABLED is \`${value}\`, not a boolean literal — a switch you cannot read at a glance is not a switch`);
    problems++; return;
  }
  // The branch it gates has to still exist, in either state.
  const gated = /DAILY5_ENABLED\s*&&/.test(src);
  const banner = /daily5-inline/.test(src) && /daily5\.tuneWarmupHtml/.test(src) && /openDaily5Here\(\)/.test(src);
  if (!gated) { err('nothing in app.js reads DAILY5_ENABLED — the constant no longer switches anything'); problems++; return; }
  if (!banner) {
    err('the banner render path is gone (.daily5-inline / daily5.tuneWarmupHtml / openDaily5Here) — flipping DAILY5_ENABLED back to true would do nothing');
    problems++; return;
  }
  ok(`DAILY5_ENABLED = ${value}; the banner it gates is still wired, so the switch still works both ways`);
}

/* ════════════════════════════════════════════════════════════════════
   1an. BARE WATCH STEP — practice-chunks work order, 2026-09-19, Phase 4.
   Fails the push when a lesson step's text, stripped of tags and the
   link's own visible label, is under ~6 words while its hint is
   non-empty and it links a YouTube video — item 3b's exact "bare Watch:"
   shape (all the real content living in the hint, `text` just the link),
   now guarded against a relapse.
   ════════════════════════════════════════════════════════════════════ */
function checkBareWatchSteps() {
  head('1an. Bare watch steps (video link, near-empty text)');
  const configSrc = readFileSync(join(ROOT, 'config-main.js'), 'utf8');
  let bad = 0;
  for (const file of MODULE_FILES) {
    const sandbox = { console };
    vm.createContext(sandbox);
    let sets;
    try {
      vm.runInContext(configSrc, sandbox, { filename: 'config-main.js' });
      vm.runInContext(readFileSync(join(ROOT, file), 'utf8'), sandbox, { filename: file });
      sets = vm.runInContext('SETS', sandbox) || [];
    } catch { continue; }  // reported by 1 (validateModules)
    for (const s of sets) {
      if (!s || typeof s.stations !== 'object') continue;
      for (const stKey of Object.keys(s.stations)) {
        // A station is { title, sections: [...] }, not a bare array — see
        // storageSections() in app.js for the same shape.
        const sections = (s.stations[stKey] && s.stations[stKey].sections) || [];
        if (!Array.isArray(sections) || !sections.length) continue;
        sections.forEach((sec, si) => {
          (sec && sec.steps || []).forEach((step, ii) => {
            const text = (step && step.text) || '';
            if (!/(?:youtube\.com|youtu\.be)/i.test(text)) return;   // no video link at all
            if (!step.hint) return;   // 3b's shape needs the real content living in hint
            const stripped = text
              .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, ' ')   // drop the link AND its visible label
              .replace(/<[^>]+>/g, ' ')
              .trim();
            const wc = stripped ? stripped.split(/\s+/).length : 0;
            if (wc < 6) {
              err(`${file} · set "${s.id}" · ${stKey} · section ${si} · step ${ii}: text is only ${wc} word${wc === 1 ? '' : 's'} once the video link is stripped, but hint carries real content — this is the bare-Watch-step shape item 3b fixed. Add an imperative "while you watch" sentence and a countable success line to text.`);
              problems++; bad++;
            }
          });
        });
      }
    }
  }
  if (bad === 0) ok('no bare watch steps (video link with near-empty text and a non-empty hint)');
}

/* ════════════════════════════════════════════════════════════════════
   1aw. UNBALANCED <p>/</p> IN STUDENT-FACING FIELDS — a second-pass
   sweep (2026-09-20) found six `</p>` closing tags with no opening
   `<p>` anywhere in the same field, left over from an earlier edit that
   dropped the opener but not the closer. The stray tag renders
   harmlessly (browsers just close whatever paragraph context already
   exists) so nothing about it LOOKS broken, which is exactly why it
   survived — this is a mechanical class, not a wording one, so it gets
   a permanent detector rather than a one-time fix.
   ════════════════════════════════════════════════════════════════════ */
function checkUnbalancedInlineP() {
  head('1aw. Unbalanced <p>/</p> in student-facing fields');
  const FIELD_RE = new RegExp(
    '\\b(?:text|hint|stuck|levelUp|explain)(?:_es)?:\\s*\'((?:\\\\.|[^\'\\\\])*)\'', 'g');
  let checked = 0, bad = 0;
  for (const file of [...MODULE_FILES, 'class-activities.js']) {
    let lines;
    try { lines = readFileSync(join(ROOT, file), 'utf8').split('\n'); } catch { continue; }
    lines.forEach((line, li) => {
      for (const f of line.matchAll(FIELD_RE)) {
        checked++;
        const val = f[1];
        const opens = (val.match(/<p(?:\s[^>]*)?>/gi) || []).length;
        const closes = (val.match(/<\/p>/gi) || []).length;
        if (opens !== closes) {
          err(`${file}:${li + 1}: ${opens} <p> vs ${closes} </p> in the same field — a stray tag with no match`);
          problems++; bad++;
        }
      }
    });
  }
  if (bad === 0) ok(`no unbalanced <p>/</p> across ${checked} student-facing fields`);
}

/* ════════════════════════════════════════════════════════════════════
   1ax. STRUM-LINE GAP COUNT ↔ ITS OWN TEXT — a `.strum-line` renders a
   `&middot;`/`·` token for a beat the hand swings through but doesn't
   strike. Module 6's D-DU-UDU stepping stones (2026-09-20 work order)
   shipped with the wrong number of those tokens twice over: a step
   claiming "ONE strum left out" actually drew two gaps, and a step
   meant to isolate a single hard gap drew three. Neither the strum-line
   markup nor the prose is authoritative on its own, so this cross-checks
   them against each other.

   It also checks column alignment, but NOT by comparing token counts —
   "Soft Feel" (module-6.js) legitimately renders only 4 tokens
   ("D" on each numbered beat, nothing on the "+") against an 8-token
   .su-count row, spaced twice as wide so the D's still land on 1 2 3 4.
   The real invariant is CSS's: `.strum-line{white-space:pre}` renders
   both rows in the same monospace grid, so every token — dense or
   sparse — must start at a column index that is a multiple of the
   su-count row's own cell width (`&middot;` is decoded to one glyph
   first, since it is 8 raw characters for 1 rendered one). */
function checkStrumLineGaps() {
  head('1ax. Strum-line gap count and column alignment match their own text');
  const FIELD_RE = new RegExp(
    '\\b(?:text|hint|stuck|levelUp)(?:_es)?:\\s*\'((?:\\\\.|[^\'\\\\])*)\'', 'g');
  const STRUM_RE = /<div class="strum-line">([^<]*)<span class="su-count">([^<]*)<\/span><\/div>/g;
  const decode = s => s.replace(/&middot;/g, '·');
  const GAP = s => s === '·';
  // Each entry is checked against every strum-line row IN THE SAME FIELD —
  // fine while a field never mixes two different gap-count claims, which
  // is true of every field today (checked by hand, 2026-09-20).
  const CLAIMS = [
    { re: /\bONE\b(?:\s+\S+){0,4}\s+left out\b/i, n: 1 },       // "ONE strum left out"
    { re: /\bUN\b(?:\s+\S+){0,3}\s+de menos\b/i, n: 1 },         // "UN rasgueo de menos"
    { re: /\bone gap\b/i, n: 1 },
    { re: /\bun hueco\b/i, n: 1 },
    { re: /\b(?:both|two) gaps\b/i, n: 2 },
    { re: /\b(?:los )?dos huecos\b/i, n: 2 },
  ];
  const EXPECTED_STRUM_LINES = 24;   // pinned — update on purpose if one is added or removed
  let strumLines = 0, bad = 0;
  for (const file of [...MODULE_FILES, 'class-activities.js']) {
    let lines;
    try { lines = readFileSync(join(ROOT, file), 'utf8').split('\n'); } catch { continue; }
    lines.forEach((line, li) => {
      for (const f of line.matchAll(FIELD_RE)) {
        const val = f[1];
        const rows = [...val.matchAll(STRUM_RE)];
        if (!rows.length) continue;
        const claimsHere = CLAIMS.filter(c => c.re.test(val));
        for (const row of rows) {
          strumLines++;
          const strumStr = decode(row[1]);
          const countStr = decode(row[2]);
          const countTokens = [...countStr.matchAll(/\S+/g)];
          const cellWidth = countTokens.length > 1 ? countTokens[1].index - countTokens[0].index : 4;
          const tokens = [...strumStr.matchAll(/\S+/g)];
          const misaligned = tokens.some(t => (t.index - countTokens[0].index) % cellWidth !== 0);
          if (!cellWidth || misaligned || tokens.length > countTokens.length) {
            err(`${file}:${li + 1}: strum-line tokens don't land on the su-count row's own beat columns`);
            problems++; bad++;
          }
          const gaps = tokens.filter(t => GAP(t[0])).length;
          for (const c of claimsHere) {
            if (gaps !== c.n) {
              err(`${file}:${li + 1}: text claims ${c.n} gap(s) ("${c.re}") but this strum-line has ${gaps}`);
              problems++; bad++;
            }
          }
        }
      }
    });
  }
  if (strumLines !== EXPECTED_STRUM_LINES) {
    err(`found ${strumLines} .strum-line rows, expected ${EXPECTED_STRUM_LINES} — update EXPECTED_STRUM_LINES on purpose if one was added or removed`);
    problems++; bad++;
  }
  if (bad === 0) ok(`${strumLines} strum-line rows checked, gap counts and column alignment agree with their own text`);
}

/* ════════════════════════════════════════════════════════════════════
   1ay. "N BEATS EACH" CLAIMED BUT NO NOTE CARRIES IT — a tab note with
   no `beats` defaults to one click (playSequence()/buildTab() in app.js),
   so a step whose text or tab caption promises "N beats each" / "N beats
   per note" is lying to the player unless the tab actually holds each
   note for that long. "the cure" root-line tabs (ca-13/18/19) shipped
   this way on 2026-09-20 — the band snippet ran four-beat bars while the
   tab gave every note one click. Only class activities carry this claim
   today; module tabs that hold a note do so without ever putting a
   number in the prose.

   A tab can spell "N beats" two ways — one note with `beats: N`, or N
   separate same-pitch note entries in a row (ca-13/ca-18's own step 5,
   "the in-order tabs," strike each note four times rather than holding
   it) — so this merges a run of identical, beats-less notes into one
   logical note before comparing, instead of demanding the `beats` field
   literally be present.
   ════════════════════════════════════════════════════════════════════ */
function checkBeatsClaimMatchesTab() {
  head('1ay. "N beats each" claim matches the tab\'s own durations');
  let src;
  try { src = readFileSync(join(ROOT, 'class-activities.js'), 'utf8'); }
  catch { return; }                       // reported by 1d
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  try { vm.runInContext(src, sandbox, { filename: 'class-activities.js' }); }
  catch { return; }                       // reported by 1d
  const activities = sandbox.CLASS_ACTIVITIES || [];
  const CLAIM_RE = /\b(\d+)\s+beats?\s+(?:each|per note)\b|\b(\d+)\s+tiempos?\s+(?:cada (?:una|uno)|por nota)\b/i;
  const pitchKey = n => n.frets ? JSON.stringify(n.frets) : `${n.string}${n.fret}`;
  // Merge a run of same-pitch, beats-less notes into one logical duration —
  // the "strike it N times" way of spelling out N beats.
  const logicalDurations = notes => {
    const out = [];
    for (const n of notes) {
      const explicit = n && n.beats !== undefined;
      const prev = out[out.length - 1];
      if (!explicit && prev && !prev.explicit && prev.key === pitchKey(n)) prev.beats++;
      else out.push({ key: pitchKey(n), beats: explicit ? n.beats : 1, explicit });
    }
    return out.map(o => o.beats);
  };
  let checked = 0, bad = 0;
  for (const a of activities) {
    if (!a || !Array.isArray(a.steps)) continue;
    a.steps.forEach((st, si) => {
      const tabs = Array.isArray(st.tabs) ? st.tabs : (st.tab ? [st.tab] : []);
      const prose = [st.text, st.text_es, ...tabs.map(t => t.caption), ...tabs.map(t => t.caption_es)]
        .filter(Boolean).join(' ');
      const m = CLAIM_RE.exec(prose);
      if (!m || !tabs.length) return;
      const n = Number(m[1] || m[2]);
      checked++;
      const groups = tabs.flatMap(t => Array.isArray(t.phrases) ? t.phrases.map(ph => ph.notes || []) : [t.notes || []]);
      const allMatch = groups.length > 0 && groups.every(notes => notes.length > 0 && logicalDurations(notes).every(d => d === n));
      if (!allMatch) {
        err(`${a.id} step ${si + 1}: text/caption claims "${n} beats each/per note" but not every note in its tab carries beats: ${n}`);
        problems++; bad++;
      }
    });
  }
  if (bad === 0) ok(`${checked} step(s) claiming a per-note beat count all have matching tab durations`);
}

/* ════════════════════════════════════════════════════════════════════
   1az. "THE CURE" CHORUS STAYS D · F · C · G, TWICE — corrected
   2026-09-22 from an initial (wrong) 2026-09-18 reading of
   `Dm · F · Dm · F, then C · G/B · C · G/B`. The chorus is the same
   four-chord loop played through twice, not two different two-chord
   pairs each repeated — see CLAUDE.md's settled-song-facts entry. Every
   place that plays or prints the chorus's root order has to agree:
   ca-19's `snippet.fromBar === 21` chorus tab in class-activities.js,
   module-4.js's "the cure" play-along `playSeq`, and the Journey page's
   Layer 2 (root line) and Layer 3 (power chords) chorus ASCII tabs.
   The playSeq is read from module-4.js BY FILE NAME, so a module
   renumber can move it out from under the check — the 2026-10-12
   Modules 4/5 swap did exactly that — and the other places would stay
   green on their own. CURE_CHORUS_PLACES pins how many places it
   reads: the practice-card chorus sections (ca-18, ca-24, ca-30, and
   ca-44 — the lyric sheet, which plays ca-30's sections, 2026-11-03), the
   module play-along, and the Journey page's two tabs. Bump it only when a
   place is deliberately added or removed.
   ════════════════════════════════════════════════════════════════════ */
const CURE_CHORUS_PLACES = 7;
function checkCureChorusOrder() {
  head('1az. "the cure" chorus stays in root order D F C G, twice');
  let checked = 0, bad = 0;
  const EXPECTED = ['D', 'F', 'C', 'G', 'D', 'F', 'C', 'G'];

  // 1) class-activities.js — the fromBar:21 chorus tab (ca-19's "The chorus" step)
  try {
    const src = readFileSync(join(ROOT, 'class-activities.js'), 'utf8');
    const sandbox = { console };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(src, sandbox, { filename: 'class-activities.js' });
    const activities = sandbox.CLASS_ACTIVITIES || [];
    for (const a of activities) {
      if (!a || !Array.isArray(a.steps)) continue;
      a.steps.forEach((st, si) => {
        if (!st || !st.snippet || st.snippet.track !== 'the-cure' || st.snippet.fromBar !== 21) return;
        const notes = st.tab && Array.isArray(st.tab.notes) ? st.tab.notes : null;
        if (!notes) return;
        checked++;
        const roots = notes.map(n => n.note);
        if (JSON.stringify(roots) !== JSON.stringify(EXPECTED)) {
          err(`${a.id} step ${si + 1}: chorus tab roots are ${roots.join(' ')}, expected ${EXPECTED.join(' ')}`);
          problems++; bad++;
        }
      });
    }
    // …and a practice card's chorus section (bar 21 of "the cure"), whose
    // tab is one pluck per beat — so compare the roots with repeats folded.
    // A section that writes ONE lap of the loop and sets `reps` (ca-24,
    // 2026-09-30: the record plays the loop three times from bar 21) is
    // checked as that loop: D F C G, whole laps, same order.
    for (const a of activities) {
      const c = a && a.view === 'card' && a.card;
      if (!c || c.track !== 'the-cure') continue;
      (c.sections || []).forEach((sec, si) => {
        if (!sec || sec.fromBar !== 21 || !Array.isArray(sec.notes)) return;
        checked++;
        // A power chord (ca-30) names its root and a 5: "D5" is root D.
        const roots = sec.notes.map(n => Array.isArray(n.frets) ? String(n.note).replace(/5$/, '') : n.note).filter((n, i, arr) => i % 4 === 0);
        const loop = sec.reps > 1 && roots.length > 0 && roots.length % 4 === 0
          && roots.every((r, i) => r === EXPECTED[i % 4]);
        if (!loop && JSON.stringify(roots) !== JSON.stringify(EXPECTED)) {
          err(`${a.id} card section ${si + 1}: chorus roots are ${roots.join(' ')}, expected ${EXPECTED.join(' ')}`);
          problems++; bad++;
        }
      });
    }
  } catch { /* reported by 1 */ }

  // 2) module-4.js — the "the cure" play-along playSeq (last 8 of 16 entries)
  try {
    const configSrc = readFileSync(join(ROOT, 'config-main.js'), 'utf8');
    const sandbox = { console };
    vm.createContext(sandbox);
    vm.runInContext(configSrc, sandbox, { filename: 'config-main.js' });
    vm.runInContext(readFileSync(join(ROOT, 'module-4.js'), 'utf8'), sandbox, { filename: 'module-4.js' });
    const sets = vm.runInContext('typeof SETS !== "undefined" ? SETS : []', sandbox) || [];
    const CHORD_SIG = {
      D: JSON.stringify([50, 57, 62, 65]),
      F: JSON.stringify([53, 57, 60, 65]),
      C: JSON.stringify([48, 52, 55, 60, 64]),
      G: JSON.stringify([43, 47, 50, 55, 59, 67]),
    };
    const walk = node => {
      if (!node || typeof node !== 'object') return;
      if (node.playSeq && Array.isArray(node.playSeq.notes) && /the cure/i.test(node.label || '')) {
        checked++;
        const chorus = node.playSeq.notes.slice(-8);
        const got = chorus.map(n => {
          const key = JSON.stringify(n.midi);
          return Object.keys(CHORD_SIG).find(k => CHORD_SIG[k] === key) || `?(${key})`;
        });
        if (JSON.stringify(got) !== JSON.stringify(EXPECTED)) {
          err(`module-4.js "the cure" playSeq: chorus half is ${got.join(' ')}, expected ${EXPECTED.join(' ')}`);
          problems++; bad++;
        }
      }
      for (const k of Object.keys(node)) walk(node[k]);
    };
    walk(sets);
  } catch { /* reported by 1 */ }

  // 3) tabs/the-cure.html — Journey Layer 2 (root line) and Layer 3 (power chords)
  try {
    const html = readFileSync(join(ROOT, 'tabs/the-cure.html'), 'utf8');
    const grabPre = title => {
      const idx = html.indexOf(title);
      if (idx === -1) return null;
      const preOpen = '<pre class="tab-ascii">';
      const preStart = html.indexOf(preOpen, idx);
      const preEnd = html.indexOf('</pre>', preStart);
      if (preStart === -1 || preEnd === -1) return null;
      return html.slice(preStart + preOpen.length, preEnd);
    };
    const headerRows = block => block.split('\n')
      .filter(line => !line.includes('|') && line.trim())
      .map(line => line.match(/\b[A-G]m?5?\b/g) || []);

    const layer2 = grabPre('Chorus root line');
    if (layer2 != null) {
      checked++;
      const rows = headerRows(layer2).flat();
      if (JSON.stringify(rows) !== JSON.stringify(EXPECTED)) {
        err(`tabs/the-cure.html Layer 2 "Chorus root line" tab reads ${rows.join(' ')}, expected ${EXPECTED.join(' ')}`);
        problems++; bad++;
      }
    } else { err('tabs/the-cure.html: could not find the Layer 2 "Chorus root line" tab'); problems++; bad++; }

    const layer3 = grabPre('Verse and chorus power chords');
    if (layer3 != null) {
      checked++;
      const chorusRows = headerRows(layer3).filter(tokens => tokens.includes('D5'));
      const got = chorusRows.flat();
      const expected5 = EXPECTED.map(r => r + '5');
      if (JSON.stringify(got) !== JSON.stringify(expected5)) {
        err(`tabs/the-cure.html Layer 3 power-chord chorus reads ${got.join(' ')}, expected ${expected5.join(' ')}`);
        problems++; bad++;
      }
    } else { err('tabs/the-cure.html: could not find the Layer 3 power-chord tab'); problems++; bad++; }
  } catch { /* reported by 1 */ }

  if (checked === 0) { err('1az found none of "the cure" chorus tabs/playSeq — it cannot see what it is supposed to guard'); problems++; return; }
  if (checked !== CURE_CHORUS_PLACES) {
    err(`1az checked ${checked} place(s), expected ${CURE_CHORUS_PLACES} — one it guards has moved or gone (a renumbered module file, a removed card section or Journey tab). Repoint the check to it; change CURE_CHORUS_PLACES only when a place is deliberately added or removed`);
    problems++; return;
  }
  if (bad === 0) ok(`${checked} "the cure" chorus tab(s)/playSeq checked — all read D F C G, twice`);
}

/* ════════════════════════════════════════════════════════════════════
   1ba. THE SONG JOURNEY BUTTON IS IN THE LAST STEP, SO ONLY THE LAST STEP
   MAY NAME THE PAGE (Jonathan, 2026-09-25: "only at the end … for all
   class activities, even moving forward"). caStepHtml() in app.js puts an
   activity's Journey button in its last step and nowhere else, so an
   earlier step that says "open the Song Journey page (button below)"
   points at a button it doesn't have — ca-20 step 1 did exactly that
   until the same day. Scans every class activity, EN and ES, text and
   label. Also fails a step naming the page on an activity with no
   `journey:` (no button anywhere), and pins the renderer's last-step rule
   so the check can't pass against a renderer that moved the button.
   ════════════════════════════════════════════════════════════════════ */
function checkJourneyButtonLastStep() {
  head('1ba. Song Journey button only in the last step of a class activity');
  let bad = 0, withJourney = 0;
  const NAMES = /song journey|recorrido de la canci[oó]n/i;
  const strip = h => String(h || '').replace(/<[^>]+>/g, ' ');
  let activities = [];
  try {
    const src = readFileSync(join(ROOT, 'class-activities.js'), 'utf8');
    const sandbox = { console };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(src, sandbox, { filename: 'class-activities.js' });
    activities = sandbox.CLASS_ACTIVITIES || [];
  } catch { return; /* reported by 1d */ }
  for (const a of activities) {
    if (!a || !Array.isArray(a.steps)) continue;
    if (a.journey) withJourney++;
    const last = a.steps.length - 1;
    /* A practice card (view:'card') puts its Journey button on its LAST
       check, the Level up — so that check is the only place the page may be
       named, and none of its help steps may. */
    const isCard = a.view === 'card' && a.card;
    if (isCard) {
      const checks = Array.isArray(a.card.checks) ? a.card.checks : [];
      checks.forEach((c, ci) => {
        if (!c) return;
        const named = ['text', 'text_es', 'label', 'label_es'].some(f => NAMES.test(strip(c[f])));
        if (!named) return;
        if (!a.journey) { err(`${a.id} check ${ci + 1}: names the Song Journey page, but the activity has no journey: — no button renders anywhere`); problems++; bad++; }
        else if (ci !== checks.length - 1 || !c.levelUp) { err(`${a.id} check ${ci + 1}: names the Song Journey page, but a card's button renders only on its last check, the Level up`); problems++; bad++; }
      });
    }
    a.steps.forEach((st, si) => {
      if (!st) return;
      const named = ['text', 'text_es', 'label', 'label_es'].some(f => NAMES.test(strip(st[f])));
      if (!named) return;
      if (isCard) {
        err(`${a.id} help step ${si + 1}: names the Song Journey page — on a practice card the button is on the Level up check, not in the help steps`);
        problems++; bad++;
        return;
      }
      if (!a.journey) {
        err(`${a.id} step ${si + 1}: names the Song Journey page, but the activity has no journey: — no button renders anywhere`);
        problems++; bad++;
      } else if (si !== last) {
        err(`${a.id} step ${si + 1} of ${last + 1}: names the Song Journey page, but its button renders only in the LAST step — move the mention to the last step (CLAUDE.md)`);
        problems++; bad++;
      }
    });
  }
  // The renderer half: the button's one call site must be gated on the last step.
  let app = '';
  try { app = readFileSync(join(ROOT, 'app.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, ''); } catch {}
  /* Two call sites, each gated: caStepHtml's last step, and a practice
     card's last check when it is the Level up (pcChecksHtml). */
  const calls = app.match(/(?<!function )caJourneyLinkHtml\(a\)/g) || [];
  const stepGate = /if\(\s*si\s*===\s*\(a\.steps\s*\|\|\s*\[\]\)\.length\s*-\s*1\s*\)\s*parts\.push\(caJourneyLinkHtml\(a\)\)/.test(app);
  const cardGate = /if\(\s*ci\s*===\s*checks\.length\s*-\s*1\s*&&\s*c\.levelUp\s*&&\s*!preview\s*\)\s*jl\s*=\s*caJourneyLinkHtml\(a\)/.test(app);
  if (calls.length !== 2 || !stepGate || !cardGate) {
    err(`app.js: caJourneyLinkHtml(a) must be called exactly twice — in caStepHtml gated on the last step, and in pcChecksHtml gated on a card's last (Level up) check (found ${calls.length} call(s)) — the Journey button renders only at the end of an activity`);
    problems++; bad++;
  }
  if (withJourney === 0) { err('1ba found no class activity with journey: — it cannot see what it is supposed to guard'); problems++; return; }
  if (bad === 0) ok(`${withJourney} Journey-linked activit${withJourney === 1 ? 'y' : 'ies'} — the page is named only in the last step, and the button renders only there`);
}

/* ════════════════════════════════════════════════════════════════════
   1bb. FOUR STEPS, TWO LINES A PAGE — Jonathan, 2026-09-25 ("cut down to
   4 steps to teach the song", then "apply this to upcoming class
   activities as well"). Two halves:
   (a) Four steps is a SOFT rule (Jonathan, 2026-10-01: "the 4 step rule
       is a soft rule"). Every non-check class activity over four steps is
       named on one reminder line — a nudge to keep new cards short — and
       never fails the push. FOUR_STEP_LEGACY (the hard-rule pin list) is
       retired with it.
   (b) Both step renderers pass the class-activity paging default
       (CA_TAB_LINES_PER_PAGE, buildPagedTabBody in app.js) to buildTab —
       caStepHtml for students, renderTeacherActivityDetail for the
       console preview. Comments stripped, so a mention can't pass for a
       call (the 1ak lesson).
   ════════════════════════════════════════════════════════════════════ */
function checkFourStepsAndPaging() {
  head('1bb. Class activities: long tabs two lines a page (four steps: soft)');
  let bad = 0, checked = 0;
  let activities = [];
  try {
    const src = readFileSync(join(ROOT, 'class-activities.js'), 'utf8');
    const sandbox = { console };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(src, sandbox, { filename: 'class-activities.js' });
    activities = sandbox.CLASS_ACTIVITIES || [];
  } catch { return; /* reported by 1d */ }
  const over = [];
  for (const a of activities) {
    if (!a || a.kind === 'check' || !Array.isArray(a.steps)) continue;
    checked++;
    // A practice card's steps are its help ladder — counted the same way.
    const routeLen = caLongestRoute(a).length;   // a paths activity: its longest route, not the flat array
    if (routeLen > 4) over.push(`${a.id} (${routeLen})`);
  }
  if (over.length) warn(`1bb (soft rule): ${over.length} class activit${over.length === 1 ? 'y has' : 'ies have'} more than four steps — ${over.join(', ')}. Fine when Jonathan asked for it; keep new cards to four where you can.`);
  const strip = f => { try { return readFileSync(join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, ''); } catch { return ''; } };
  const app = strip('app.js'), teacher = strip('teacher.js');
  if (!/const\s+CA_TAB_LINES_PER_PAGE\s*=\s*[1-9]/.test(app)) { err('app.js: CA_TAB_LINES_PER_PAGE is missing or not a positive number'); problems++; bad++; }
  if (!/buildTab\(\s*step\.tab\s*,\s*\{[^\n]*defaultLinesPerPage\s*:\s*CA_TAB_LINES_PER_PAGE/.test(app)) { err('app.js: caStepHtml no longer passes defaultLinesPerPage: CA_TAB_LINES_PER_PAGE to buildTab — long class-activity tabs would stop paging for students'); problems++; bad++; }
  if (!/buildTab\(\s*s\.tab\s*,\s*\{[^\n]*defaultLinesPerPage\s*:\s*CA_TAB_LINES_PER_PAGE/.test(teacher)) { err('teacher.js: renderTeacherActivityDetail no longer passes defaultLinesPerPage: CA_TAB_LINES_PER_PAGE to buildTab — the console preview would stop matching the student card'); problems++; bad++; }
  if (!/function buildPagedTabBody\(spec,\s*opts\)/.test(app) || !/buildPagedTabBody\(spec,\s*opts\)/.test(app.replace(/function buildPagedTabBody\(spec,\s*opts\)/, ''))) { err('app.js: buildTab must hand its opts to buildPagedTabBody(spec, opts), or the default never reaches it'); problems++; bad++; }
  if (checked === 0) { err('1bb found no class activities — it cannot see what it is supposed to guard'); problems++; return; }
  if (bad === 0) ok(`${checked} class activities — ${checked - over.length} at four steps or fewer; both renderers page long tabs two lines at a time`);
}

/* ════════════════════════════════════════════════════════════════════
   1bc. SPANISH DIRECTIONS NAME THE SPANISH BUTTON — 2026-09-25 sweep
   found 12 class-activity steps whose text_es said "Pulsa Play", while
   the Spanish buttons read «Tocar el tab» (tab.playTab) and «Toca con la
   banda» (ca.snipPlay). A Spanish reader has no "Play" on screen. Any
   `_es` student field in the module files or class-activities.js that
   still says Play outside a link (video titles stay English) fails.

   1bd. NO PEN OR PAPER IN A CLASS ACTIVITY — the same sweep found the
   Finger Gym series (ca-2…ca-7) asking students to write their best BPM
   down and bring it to the next Gym, 7 times, against the standing
   "nothing student-facing asks for scissors, index cards or a pen" rule.
   Scoped to class-activities.js on purpose: module steps have typed
   answer boxes and notation lessons where "write" is the task, and
   module 13 really does need wire cutters or scissors — those are the
   innocent twins a site-wide list would trip on.
   ════════════════════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════════════════════
   1be. SONG JOURNEY GUITAR TOGGLE — the play-along box on a tabs/*.html
   page grows a "Record plays it / You play it" toggle when it declares
   the FULL twin of every rhythm-down file it has (tabs/journey.js
   ensurePlayer): data-audio-full, plus -slow-full when it has -slow.
   (The -metronome twins are still checked below for a page that declares
   them, but none does since 2026-10-01 — see 1bk.) journey.js renders NO toggle for a
   half-declared set, so a typo there is silent — the button just never
   appears. That is what this catches, plus a declared file that is not
   in audio/, plus a full twin whose length differs from its rhythm-down
   file (the toggle keeps currentTime, so a re-trimmed twin jumps the
   song). Pinned: the number of pages with the toggle, so one cannot drop
   off without this saying so.
   ════════════════════════════════════════════════════════════════════ */
const JOURNEY_GUITAR_PAGES = 5;   // seven-nation-army, the-cure, luna, all-along-the-watchtower, sweet-child-o-mine
function checkJourneyGuitarToggle() {
  head('1be. Song Journey Guitar toggle');
  let bad = 0, withToggle = 0;
  const flag = m => { err(m); problems++; bad++; };
  const TWINS = [['audioFull', 'audio'], ['audioFullMetronome', 'audioMetronome'],
                 ['audioSlowFull', 'audioSlow'], ['audioSlowFullMetronome', 'audioSlowMetronome']];
  const attr = k => 'data-' + k.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
  for (const page of TAB_PAGES.filter(p => p.endsWith('.html'))) {
    let src;
    try { src = readFileSync(join(ROOT, page), 'utf8'); } catch { continue; }
    const box = src.match(/<div\b[^>]*\bid="playalong-frame"[^>]*>/);
    if (!box) continue;
    const d = {};
    for (const m of box[0].matchAll(/\bdata-(audio[a-z-]*)="([^"]*)"/g))
      d[m[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = m[2];
    const declared = TWINS.filter(([full]) => d[full] !== undefined);
    if (!declared.length) continue;
    withToggle++;
    for (const [full, plain] of TWINS) {
      if (d[plain] !== undefined && d[full] === undefined)
        flag(`${page}: declares ${attr(full).replace('-full', '')}… but not ${attr(full)} — journey.js renders no Guitar toggle for a half-declared set`);
      if (d[full] !== undefined && d[plain] === undefined)
        flag(`${page}: declares ${attr(full)} with no ${attr(plain)} to be its rhythm-down twin`);
    }
    for (const [full, plain] of declared) {
      const fp = join(ROOT, 'tabs', d[full]);
      if (!existsSync(fp)) { flag(`${page}: ${attr(full)} → ${d[full]} does not exist`); continue; }
      if (d[plain] === undefined || !existsSync(join(ROOT, 'tabs', d[plain]))) continue;
      const a = mp3DurationSec(fp), b = mp3DurationSec(join(ROOT, 'tabs', d[plain]));
      if (a === null || b === null) { flag(`${page}: could not read the length of ${a === null ? d[full] : d[plain]}`); continue; }
      if (Math.abs(a - b) > 0.25)
        flag(`${page}: ${attr(full)} is ${a.toFixed(2)}s but ${attr(plain)} is ${b.toFixed(2)}s — the two mixes must be one take, or the Guitar toggle jumps the song`);
    }
  }
  if (withToggle !== JOURNEY_GUITAR_PAGES)
    flag(`${withToggle} Song Journey page(s) declare a full mix, expected ${JOURNEY_GUITAR_PAGES} — if that change is on purpose, update JOURNEY_GUITAR_PAGES`);
  if (bad === 0) ok(`${withToggle} Song Journey pages carry a complete full-mix set for the Guitar toggle, every twin the same length as its rhythm-down file`);
}

const ES_FIELD_RE = /\b(?:text|hint|stuck|levelUp|gotItWhen|explain|forward|subtitle|meta|intro|note|label|prompt|placeholder|caption|title)_es:\s*'((?:\\.|[^'\\])*)'/g;
const ES_PLAY_RE = /\bPlay\b/;
const CA_PAPER_RE = /\bwrite\b(?:\s+\w+){0,3}\s+down\b|\b(?:written down|wrote down|pencil|pen and paper|piece of paper|index cards?|scissors)\b|\ban[oó]t(?:a|as|e|en|ar|aste|ado|ada|alo|ala|alos|alas)\b|\b(?:escr[ií]bel[oa]s?|l[aá]piz|papel|tijeras|fichas)\b/i;
function checkCaButtonNamesAndPaper() {
  head('1bc/1bd. Spanish button names; no pen or paper in class activities');
  let bad = 0, esSeen = 0, caSeen = 0;
  const stripLinks = v => v.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, ' ');
  for (const file of [...MODULE_FILES, 'class-activities.js']) {
    let lines;
    try { lines = readFileSync(join(ROOT, file), 'utf8').split('\n'); } catch { continue; }
    lines.forEach((line, li) => {
      if (/^\s*(?:\/\/|\/?\*)/.test(line)) return;
      for (const f of line.matchAll(ES_FIELD_RE)) {
        esSeen++;
        if (ES_PLAY_RE.test(stripLinks(unescapeJs(f[1])))) {
          err(`${file}:${li + 1} — Spanish text says "Play"; name the Spanish button («Tocar el tab», «Toca con la banda») (1bc)`);
          problems++; bad++;
        }
      }
      if (file !== 'class-activities.js') return;
      for (const re of [STUDENT_FIELD_RE, STUDENT_LABEL_RE, ES_FIELD_RE]) {
        for (const f of line.matchAll(re)) {
          caSeen++;
          const v = unescapeJs(f[f.length - 1]);
          const m = v.match(CA_PAPER_RE);
          if (m) { err(`class-activities.js:${li + 1} — asks for pen or paper: "${m[0]}" — give it a digital deck or drop the record (1bd)`); problems++; bad++; }
        }
      }
    });
  }
  if (esSeen === 0 || caSeen === 0) { err('1bc/1bd saw no fields — the field regexes no longer match the content'); problems++; return; }
  if (bad === 0) ok(`${esSeen} Spanish fields name no "Play" button; ${caSeen} class-activity fields ask for no pen or paper`);
}

/* ════════════════════════════════════════════════════════════════════
   1bp. ENGLISH GUITAR TERMS INSIDE SPANISH TEXT. The site's Spanish for
   "power chord" is "acorde de potencia" (~150 uses). The 2026-10-11
   Spanish audit found six i18n.js values still saying "power chords"
   (Note Runner levels 13–15 and its meta line, the Watchtower Riff
   Runner hint, Riff Roulette card 12) — English sitting in the middle of
   a Spanish sentence, the class of slip nothing else reads Spanish for.
   This also bans the English string names "low E" / "high e" inside
   Spanish (the site says "Mi grave" / "mi aguda"); there were zero of
   those when this check was written, so it only guards a relapse.

   Scope — every Spanish value the site ships:
   - i18n.js: the `es` side of every key, read from the REAL I18N table
     (1e's vm load), so a value split across lines is still one string.
   - module-*.js, class-activities.js, config-main.js: every `<field>_es`
     value — a quoted string, a template literal, or an array of strings
     (choices_es, assessItems_es), on one line or many. A `_es:` whose
     value is none of those FAILS, so a new shape cannot slip past unread
     — and so does a literal joined to another literal with `+`.
   - index.html, 404.html and tabs/*.html: every data-es="…" attribute.
   Values are unescaped (unescapeJs) and entity-decoded before matching,
   and the text of a YouTube link (<a href="…youtube…">…</a>) is dropped
   first: a YouTube title is the video's real name ("What Is A Power
   Chord?" in module-3) and stays English. Comments are
   blanked, so a note ABOUT the rule (like the glossary) never trips it.
   Fix: write the Spanish term from the glossary at the top of i18n.js.
   ════════════════════════════════════════════════════════════════════ */
/* Separators widened 2026-10-11 (review): \s already covers the
   non-breaking space; U+2010-U+2015 adds the Unicode hyphens and dashes
   (a non-breaking hyphen, U+2011, let "power‑chord" read as clean),
   and `*` catches "powerchord" written as one word. */
const ES_ENGLISH_TERMS = [
  { re: /\bpower[\s\u2010-\u2015-]*chords?\b/i, fix: 'acorde(s) de potencia' },
  { re: /\b(?:low|high)[\s\u2010-\u2015-]+e\b/i, fix: 'Mi grave / mi aguda' },
];
function checkEnglishTermsInSpanish(I18N) {
  head('1bp. English guitar terms inside Spanish text');
  let bad = 0;
  const seen = { i18n: 0, content: 0, dataEs: 0 };
  /* Only a YOUTUBE link's text is exempt (2026-10-11 review) — that is the
     video's real English title. A link to one of our own pages has text we
     wrote, so it is Spanish like the rest. */
  const visible = v => v
    .replace(/<a\b[^>]*\bhref=["']https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, ' ')
    .replace(/<[^>]*>/g, ' ');
  /* Entities are decoded in EVERY value, not only data-es (2026-10-11
     review): "power&nbsp;chords" in an i18n es value read as clean. The
     decoder is the shared decodeHtmlEntities (2026-10-12), not a copy. */
  /* `where` is a function: the file:line lookup only runs on a hit. */
  const scan = (where, value) => {
    const v = visible(decodeHtmlEntities(value));
    for (const { re, fix } of ES_ENGLISH_TERMS) {
      const m = v.match(re);
      if (m) { err(`${where()} — Spanish text says "${m[0]}"; use "${fix}" (1bp)`); problems++; bad++; }
    }
  };
  const lineOf = (src, idx) => src.slice(0, idx).split('\n').length;

  /* i18n.js — the es side of the real table. */
  if (!I18N) { err('1bp: the i18n.js table failed to load (see 1e) — its Spanish was not checked'); problems++; bad++; }
  else {
    let lines = [];
    try { lines = readFileSync(join(ROOT, 'i18n.js'), 'utf8').split('\n'); } catch { /* 1e already failed */ }
    for (const [k, entry] of Object.entries(I18N)) {
      if (!entry || typeof entry.es !== 'string') continue;   // 1e reports it
      seen.i18n++;
      scan(() => `i18n.js:${lines.findIndex(l => l.includes(`'${k}'`)) + 1} '${k}'`, entry.es);
    }
  }

  /* Module content, class activities, songs config — every _es value.
     readJsString is the shared reader (hoisted above 1w, 2026-10-12). */
  /* A literal followed by `+ '…'` is a concatenation whose later pieces
     would go unread, so refuse it like any other unreadable shape. A bare
     named constant is allowed — module-13's `'…' + M13_P8_ES` appends a
     figure, whose only Spanish is an alt attribute scan() drops with the
     tag anyway — but the chain is followed past it, and a call, member or
     anything else after a `+` is refused too. */
  const concatAfter = (src, j) => {
    for (;;) {
      const plus = /^\s*\+\s*/.exec(src.slice(j, j + 200));
      if (!plus) return false;
      j += plus[0].length;
      const id = /^[A-Za-z_$][\w$]*/.exec(src.slice(j, j + 200));
      if (!id) return true;                                   // a literal, or anything else
      j += id[0].length;
      if (/^\s*[(.[`]/.test(src.slice(j, j + 50))) return true;   // a call / member / tagged template
    }
  };
  const unreadable = where => {
    err(`${where()} — 1bp cannot read this _es value (not a string or an array of strings); teach 1bp the new shape so its Spanish is checked`);
    problems++; bad++;
  };
  for (const file of [...MODULE_FILES, 'class-activities.js', 'config-main.js']) {
    let src;
    try { src = stripJsComments(readFileSync(join(ROOT, file), 'utf8')); } catch { continue; }
    for (const m of src.matchAll(/\b([A-Za-z0-9]+_es)\s*:\s*/g)) {
      let i = m.index + m[0].length;
      const where = (at = m.index) => () => `${file}:${lineOf(src, at)} ${m[1]}`;
      if (src[i] === "'" || src[i] === '"' || src[i] === '`') {
        const s = readJsString(src, i);
        if (concatAfter(src, s.end)) { unreadable(where()); continue; }
        seen.content++; scan(where(), s.text);
      } else if (src[i] === '[') {
        let depth = 0;
        for (; i < src.length; i++) {
          const c = src[i];
          if (c === "'" || c === '"' || c === '`') {
            const s = readJsString(src, i);
            if (concatAfter(src, s.end)) unreadable(where(i));
            else { seen.content++; scan(where(i), s.text); }
            i = s.end - 1; continue;
          }
          if (c === '[') depth++;
          else if (c === ']' && --depth === 0) break;
        }
      } else {
        unreadable(where());
      }
    }
  }

  /* Shell, 404 and Journey pages — data-es attributes (scan decodes). */
  for (const file of ['index.html', '404.html', ...TAB_PAGES.filter(f => f.endsWith('.html'))]) {
    let src;
    try { src = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
    for (const m of src.matchAll(/\bdata-es="([^"]*)"/g)) {
      seen.dataEs++;
      scan(() => `${file}:${lineOf(src, m.index)} data-es`, m[1]);
    }
  }

  for (const [surface, n] of Object.entries(seen))
    if (n === 0) { err(`1bp read no Spanish values from ${surface} — the scan has gone blind there`); problems++; bad++; }
  if (bad === 0) ok(`${seen.i18n} i18n.js es values, ${seen.content} content _es values and ${seen.dataEs} data-es attributes — no English "power chord" or "low E"/"high e"`);
}

/* ════════════════════════════════════════════════════════════════════
   1bf. PRACTICE CARDS (view:'card' — Jonathan, 2026-09-27). The card's
   player follows the tab note by note over the real record, so a tab that
   doesn't add up to its bars puts the highlight on the wrong note, and a
   window past the end of the file plays silence. Checked here:
   - `card.track` is a SNIPPET_TRACKS key.
   - Sections: label/caption with _es twins; fromBar/bars (and optional
     reps) whole numbers; repLabel + _es when reps > 1; back to back with
     no gap or overlap (the loop runs from a tapped section to the end);
     each note's midi is what its string + fret sound and its name matches;
     each section's beats add up to bars x the track's beatsPerBar; the
     whole window lands inside the file (or its measured bars).
   - Checks: 2–6 of them, exactly one `levelUp` and it is the last; every
     numbered check has label + text with _es twins, the Level up text.
   - Help steps carry no snippet, drill or video (the card renders their
     text and tab only), and the renderer pins: both card builders call
     caCardBodyHtml (through their shared body, caCardBodyBlockHtml), the
     console preview calls it with preview:true, and
     every silencer that stops a snippet also stops a card (pcStop).
   ════════════════════════════════════════════════════════════════════ */
function checkPracticeCards(ctx) {
  head('1bf. Practice cards');
  let bad = 0, cards = 0;
  const flag = m => { err(m); problems++; bad++; };
  let appSrc = '', teacherSrc = '', TRACKS = {};
  try { appSrc = readFileSync(join(ROOT, 'app.js'), 'utf8'); } catch { flag('app.js unreadable — 1bf cannot check this'); return; }
  try { teacherSrc = readFileSync(join(ROOT, 'teacher.js'), 'utf8'); } catch { flag('teacher.js unreadable — 1bf cannot check this'); return; }
  try { TRACKS = loadConstObject(appSrc, 'SNIPPET_TRACKS'); } catch (e) { flag(`app.js: could not load SNIPPET_TRACKS — ${e.message}`); return; }
  let activities = [];
  try {
    const src = readFileSync(join(ROOT, 'class-activities.js'), 'utf8');
    const sandbox = { console };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(src, sandbox, { filename: 'class-activities.js' });
    activities = sandbox.CLASS_ACTIVITIES || [];
  } catch { return; /* reported by 1d */ }
  const has = v => v !== undefined && v !== null && v !== '';
  const twin = (where, o, f) => {
    if (!has(o && o[f])) flag(`${where}: missing "${f}"`);
    else if (!has(o[f + '_es'])) flag(`${where}: missing "${f}_es"`);
  };
  /* Recording versions (1cc): a version is a card of its own as far as
     bars, beats and the end of the track go, so it goes through every rule
     below as a virtual activity. */
  const cardViews = [];
  for (const a of activities) {
    cardViews.push(a);
    if (a && a.view === 'card' && a.card && a.recordingVersions && typeof a.recordingVersions === 'object')
      for (const [r, v] of Object.entries(a.recordingVersions))
        cardViews.push({ ...a, id: a.id + ' [' + r + ']', card: { ...a.card, ...(v && v.card), track: v && v.track }, __rec: true });
  }
  for (const a of cardViews) {
    if (!a || a.view !== 'card' || !a.card) continue;
    if (!a.__rec) cards++;
    const c = a.card, w = a.id;
    const tr = TRACKS[c.track];
    if (!tr) { flag(`${w}: card.track "${c.track}" is not in SNIPPET_TRACKS (have: ${Object.keys(TRACKS).join(', ')})`); continue; }
    if (has(c.caption) && !has(c.caption_es)) flag(`${w}: card.caption has no caption_es`);
    const secs = Array.isArray(c.sections) ? c.sections : [];
    if (!secs.length) flag(`${w}: card.sections should be a non-empty array`);
    let nextBar = null, endBar = 0;
    secs.forEach((sec, si) => {
      const sw = `${w} · card.sections[${si}]`;
      if (!sec || typeof sec !== 'object') { flag(`${sw}: not an object`); return; }
      twin(sw, sec, 'label');
      twin(sw, sec, 'caption');
      const reps = sec.reps === undefined ? 1 : sec.reps;
      if (!Number.isInteger(sec.fromBar) || sec.fromBar < 1) { flag(`${sw}: fromBar "${sec.fromBar}" is not a bar number — bars count from 1`); return; }
      if (!Number.isInteger(sec.bars) || sec.bars < 1) { flag(`${sw}: bars "${sec.bars}" is not a positive whole number`); return; }
      if (!Number.isInteger(reps) || reps < 1) { flag(`${sw}: reps "${sec.reps}" is not a positive whole number`); return; }
      if (reps > 1) twin(sw, sec, 'repLabel');
      if (nextBar !== null && sec.fromBar !== nextBar) flag(`${sw}: starts at bar ${sec.fromBar}, but the section before it ends at bar ${nextBar - 1} — sections run back to back`);
      nextBar = sec.fromBar + sec.bars * reps;
      endBar = nextBar - 1;
      const notes = Array.isArray(sec.notes) ? sec.notes : [];
      if (!notes.length) { flag(`${sw}: notes should be a non-empty array`); return; }
      let beats = 0;
      notes.forEach((n, ni) => {
        const nw = `${sw} · notes[${ni}]`;
        if (n && n.rest === true) {
          // A rest (ca-41's verses, 2026-10-25): beats and nothing else.
          if ('string' in n || 'fret' in n || 'frets' in n || 'midi' in n || 'note' in n) flag(`${nw}: a rest carries beats only — no string, fret, frets, midi or note`);
          if (!(n.beats > 0)) flag(`${nw}: a rest needs beats (a positive number)`);
          beats += n.beats > 0 ? n.beats : 0;
          return;
        }
        if (n && Array.isArray(n.frets)) {
          // A power chord on the card (ca-29..ca-33): same checks as a step tab's chord.
          caChordProblems(n).forEach(p => flag(`${nw}: ${p}`));
          if ('beats' in n && !(n.beats > 0)) flag(`${nw}: beats "${n.beats}" is not a positive number`);
          beats += n.beats > 0 ? n.beats : 1;
          return;
        }
        if (!n || !/^[eBGDAE]$/.test(n.string || '') || !Number.isInteger(n.fret) || n.fret < 0) { flag(`${nw}: needs a string (e/B/G/D/A/E) and a whole-number fret`); return; }
        const want = EC_OPEN_MIDI[n.string] + n.fret;
        if (n.midi !== want) flag(`${nw}: midi ${n.midi} is not ${n.string}-string fret ${n.fret} (${want})`);
        if (ecNorm(n.note) !== EC_NOTE_NAMES[want % 12]) flag(`${nw}: note "${n.note}" is not ${n.string}-string fret ${n.fret} (${EC_NOTE_NAMES[want % 12]})`);
        if ('beats' in n && !(n.beats > 0)) flag(`${nw}: beats "${n.beats}" is not a positive number`);
        beats += n.beats > 0 ? n.beats : 1;
      });
      if ('rows' in sec) {
        // Notes per tab row (pcTabHtml): must account for every note, or the renderer ignores it silently.
        const okRows = Array.isArray(sec.rows) && sec.rows.length > 0 && sec.rows.every(r => Number.isInteger(r) && r > 0 && r <= 12);
        if (!okRows) flag(`${sw}: rows must be a list of whole numbers from 1 to 12 (notes per tab row)`);
        else if (sec.rows.reduce((x, y) => x + y, 0) !== (sec.notes || []).length) flag(`${sw}: rows add up to ${sec.rows.reduce((x, y) => x + y, 0)}, but the section has ${(sec.notes || []).length} notes — the tab would fall back to even rows`);
      }
      if ('rowLabels' in sec || 'rowLabels_es' in sec) {
        // A line over each row (the lyric — ca-35). pcTabHtml drops the
        // labels silently unless there is exactly one per row, and Spanish
        // needs its own list like every other display string.
        const n = Array.isArray(sec.rows) ? sec.rows.length : -1;
        for (const f of ['rowLabels', 'rowLabels_es']) {
          const v = sec[f];
          if (!Array.isArray(v) || v.length !== n || v.some(x => typeof x !== 'string' || !x.trim()))
            flag(`${sw}: ${f} must be a list of ${n < 0 ? 'strings, one per row — and the section needs rows' : `${n} non-empty strings, one per row`}`);
        }
      }
      const wantBeats = sec.bars * tr.beatsPerBar;
      if (Math.abs(beats - wantBeats) > 1e-6) flag(`${sw}: notes add up to ${beats} beats, but ${sec.bars} bar${sec.bars === 1 ? '' : 's'} of ${c.track} is ${wantBeats} — the highlight would drift off the music`);
    });
    if (secs.length && endBar) {
      if (Array.isArray(tr.barTimes) && tr.barTimes.length > 1) {
        if (endBar > tr.barTimes.length - 1) flag(`${w}: the card runs to bar ${endBar}, past the last measured bar of ${c.track} (${tr.barTimes.length - 1})`);
      } else {
        const end = Number(tr.anchor) + endBar * tr.beatsPerBar * 60 / tr.feltBpm;
        if (end > Number(tr.durationSec)) flag(`${w}: the card runs to bar ${endBar}, ${end.toFixed(1)}s — past the end of ${c.track} (${tr.durationSec}s)`);
      }
    }
    const checks = Array.isArray(c.checks) ? c.checks : [];
    if (checks.length < 2 || checks.length > 6) flag(`${w}: card.checks has ${checks.length} — a card has 2–6 checks`);
    const lvl = checks.map((x, i) => (x && x.levelUp) ? i : -1).filter(i => i >= 0);
    if (lvl.length !== 1 || lvl[0] !== checks.length - 1) flag(`${w}: card.checks needs exactly one levelUp check, and it goes last`);
    // `slot` pins a check's tick key (caCheckKey in app.js); two checks on one key would share a tick.
    const tickSlots = checks.map((x, ci) => (x && Number.isInteger(x.slot)) ? x.slot : ci);
    if (new Set(tickSlots).size !== tickSlots.length) flag(`${w}: two checks share a tick key — fix the slot numbers`);
    checks.forEach((x, ci) => {
      const cw = `${w} · card.checks[${ci}]`;
      if (!x || typeof x !== 'object') { flag(`${cw}: not an object`); return; }
      twin(cw, x, 'text');
      if (!x.levelUp) twin(cw, x, 'label');
      if ('levelUp' in x && x.levelUp !== true) flag(`${cw}: levelUp should be true or left off`);
      if ('slot' in x && !(Number.isInteger(x.slot) && x.slot >= 0)) flag(`${cw}: slot must be a whole number, 0 or more`);
      /* `card: '<id>'` — the Level up opens another practice card instead
         of the Song Journey page (caCardLinkHtml in app.js). */
      if ('card' in x) {
        const to = activities.find(b => b && b.id === x.card);
        if (!x.levelUp) flag(`${cw}: card: only renders on the Level up check`);
        else if (!to || to.view !== 'card' || !to.card) flag(`${cw}: card: '${x.card}' is not a practice card in class-activities.js — the button would never render`);
        else if (x.card === a.id) flag(`${cw}: card: points at its own activity`);
      }
    });
    (a.steps || []).forEach((st, si) => {
      if (st && (st.snippet || st.drill || st.video)) flag(`${w} help step ${si + 1}: a practice card's help steps render their text and tab only — move the ${st.snippet ? 'snippet' : st.drill ? 'drill' : 'video'} or drop it`);
    });
  }
  // Renderer pins, comments stripped (the 1ak lesson).
  const body = (src, fn) => { const b = jsFunctionBody(src, fn); return b === null ? null : stripJsComments(b); };
  // The two student card builders share one body, caCardBodyBlockHtml
  // (2026-10-25), and that body is what calls caCardBodyHtml(a).
  const blk = body(appSrc, 'caCardBodyBlockHtml');
  if (blk === null) flag('app.js: no caCardBodyBlockHtml() found — 1bf cannot tell whether students get the practice card');
  else if (!/caCardBodyHtml\(\s*a\s*\)/.test(blk)) flag('app.js: caCardBodyBlockHtml() never calls caCardBodyHtml(a) — a practice card would render empty');
  for (const fn of ['caActivityCardHtml', 'caHeroCardHtml']) {
    const b = body(appSrc, fn);
    if (b === null) flag(`app.js: no ${fn}() found — 1bf cannot tell whether students get the practice card`);
    else if (!/caCardBodyBlockHtml\(\s*a\s*,/.test(b)) flag(`app.js: ${fn}() never calls caCardBodyBlockHtml(a, …) — a practice card would render empty there`);
  }
  const tb = body(teacherSrc, 'renderTeacherActivityDetail');
  if (tb === null || !/caCardBodyHtml\(\s*a\s*,\s*\{\s*preview\s*:\s*true\s*\}\s*\)/.test(tb)) flag('teacher.js: renderTeacherActivityDetail() must call caCardBodyHtml(a,{preview:true}) — the console preview would not show the practice card');
  /* …and by RENDERING (2026-10-25). A source pin can't see a wrong
     argument (the hero passing false for `card`), an inverted `card ?` or
     a call left inside a comment — all three stayed green. So both student
     builders render a practice card, which must come out as the card
     (class="pc", no step ladder), and an ordinary activity, which must come
     out as its ladder (class="ca-steps", no card). */
  if (!ctx) flag('1bf cannot render the card builders — the 0b render context is unavailable');
  else {
    const acts = vm.runInContext('window.CLASS_ACTIVITIES || []', ctx);
    const pcA = acts.find(a => a.view === 'card' && a.card && a.kind !== 'check');
    const ladA = acts.find(a => a.view !== 'card' && a.kind !== 'check' && (a.steps || []).length);
    if (!pcA || !ladA) flag(`1bf found ${pcA ? '' : 'no practice card'}${!pcA && !ladA ? ' and ' : ''}${ladA ? '' : 'no ordinary activity'} to render`);
    else for (const fn of ['caActivityCardHtml', 'caHeroCardHtml']) {
      const draw = a => { try { return String(vm.runInContext(fn, ctx)(a, true)); } catch (e) { return `THREW ${e.message}`; } };
      const c = draw(pcA), l = draw(ladA);
      if (!/class="pc"/.test(c) || /class="ca-steps"/.test(c)) flag(`app.js: ${fn}(${pcA.id}) does not draw the practice card${c.startsWith('THREW') ? ` (${c})` : ''} — expected class="pc" and no step ladder`);
      if (!/class="ca-steps"/.test(l) || /class="pc"/.test(l)) flag(`app.js: ${fn}(${ladA.id}) does not draw its step ladder${l.startsWith('THREW') ? ` (${l})` : ''} — expected class="ca-steps" and no practice card`);
    }
  }
  for (const fn of ['stopCardAudio', 'playSequence', 'renderClassActivities']) {
    const b = body(appSrc, fn);
    if (b === null || !/\bpcStop\(\)/.test(b)) flag(`app.js: ${fn}() must call pcStop() beside snipStop() — a practice card's song would keep playing under other sound`);
  }
  if (cards === 0) { flag('1bf found no practice card — it cannot see what it is supposed to guard'); return; }
  if (bad === 0) ok(`${cards} practice card${cards === 1 ? '' : 's'} — sections add up to their bars and land inside the track, one Level up each, both renderers and every silencer wired`);
}

/* 1cc. RECORDING VERSIONS (Jonathan, 2026-10-30 — ca-26, ca-29, ca-40; caView
   in app.js). A card can play another RECORDING of its song: the Jimi
   Hendrix / Neil Young switch on the Watchtower play-alongs. The other
   recording has its own tempo, bar map, form and chord rhythm, so a version
   replaces the card's sections, not just its track. What can go wrong is
   quiet — a version whose sections run off the end of its track or add up to
   the wrong beats (1bf checks that, over every version, below), a switch
   whose pressed button is the wrong one, a Guitar switch offered on a
   recording with no full mix, a second card of the song that offers other
   recordings (one stored choice drives every card of the group). Checked
   here by RENDERING each card in each recording through the real app.js in
   the 0b context, not by finding the calls:
   - the shape: a practice card, recording / recordingGroup / label(+_es), no
     key / chord / bass versions beside it, every version has its own track
     (in SNIPPET_TRACKS, not the card's), label(+_es) and a card with sections;
   - every card of a recordingGroup offers the same recordings and default;
   - caCardBodyHtml() in each recording: pcLayout lands on that recording's
     track and sections, the switch has exactly one pressed button and it is
     the recording shown, the section chips are that recording's, and the
     Guitar switch appears only where that track has a full mix;
   - nothing stored -> the card's own recording (or recordingStart), and that
     default is Jimi on every card (Jonathan's call, 2026-10-30, pinned: a data
     edit that made Neil the opening recording would otherwise pass);
   - a version's card overrides display only: no checks / track / sheet /
     wholeSong / slowest (a version's own checks would change what each
     <id>:c<n> tick key means);
   - caTeacherRedraw() (every switch's redraw in the console): on the Teacher
     view songs tab it restarts that tab's card instead of opening the activity
     detail page (review R1-1, a switch on ca-40 threw the projector card away);
   - the Neil versions of ca-29 and ca-40 are a down-up strum on every eighth
     (Jonathan, 2026-10-30): card.everyStrum true, 16 chord names a section x 8
     sections = 128 each (pinned; computed from the notes for every every-strum
     card, Jimi's ca-29 included), and the directions line says "each strum
     has its chord name" (ca.cardStrumDirections), never "each chord is shown
     once" — read back from the render in English and Spanish;
   - a version may carry its own title / intro (+_es, both or neither); ca-40's
     Neil version must, and caTitle() / the card's intro show the recording on
     screen in both languages;
   - the renderer is wired: caView() lays recordingVersions over the card,
     caCardBodyHtml() draws caRecordingSwitchHtml().
   Pinned: 3 cards, 1 group, 2 recordings each. */
function checkRecordingVersions(ctx) {
  head('1cc. Recording versions: a card that plays another recording');
  // strum: the Neil versions of ca-29 and ca-40 draw a strum on every eighth, each with its chord name (16 x 8 sections); titled: ca-40's Neil version has its own title and intro
  const EXPECT = { cards: 3, groups: 1, start: 'jimi', strum: { 'ca-29': 128, 'ca-40': 128 }, titled: ['ca-40'],
                   lap: 'A5 A5 A5 A5 G5 G5 G5 F5 F5 F5 F5 F5 F5 G5 G5 G5' };   // the bass's chord on each of a lap's 16 eighths (A 1 + 2 + · G 3 + 4 · F + after 4 ... · G + after 3 in bar 2)
  let bad = 0, n = 0, rendered = 0, strumRenders = 0, strumNames = 0, readbacks = 0, consoleReads = 0;
  const flag = m => { err(m); problems++; bad++; };
  let appSrc = '', TRACKS = {}, activities = [];
  try { appSrc = readFileSync(join(ROOT, 'app.js'), 'utf8'); TRACKS = loadConstObject(appSrc, 'SNIPPET_TRACKS'); }
  catch (e) { flag('app.js: could not read SNIPPET_TRACKS \u2014 ' + e.message); return; }
  try {
    const src = readFileSync(join(ROOT, 'class-activities.js'), 'utf8');
    const sandbox = { console };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(src, sandbox, { filename: 'class-activities.js' });
    activities = sandbox.CLASS_ACTIVITIES || [];
  } catch { return; /* reported by 1d */ }
  const has = v => v !== undefined && v !== null && v !== '';
  const groups = {};
  for (const a of activities) {
    if (!a || !['recording', 'recordingVersions', 'recordingGroup', 'recordingStart', 'recordingLabel'].some(f => f in a)) continue;
    n++;
    const w = a.id, rv = a.recordingVersions;
    if (a.view !== 'card' || !a.card) { flag(w + ': recording versions only render on a practice card (view:\'card\')'); continue; }
    for (const f of ['keyVersions', 'chordVersions', 'bassNotes'])
      if (f in a) flag(w + ': recording versions and ' + f + ' cannot be combined \u2014 caView lays the recording over the card after the chord / key rename, so its sections would keep the old chords');
    if (!has(a.recording) || !has(a.recordingGroup) || !has(a.recordingLabel) || !has(a.recordingLabel_es)) flag(w + ': needs recording, recordingGroup, recordingLabel and recordingLabel_es');
    if ((a.recordingStart || a.recording) !== EXPECT.start) flag(w + ': opens on \'' + (a.recordingStart || a.recording) + '\', but the switch opens on \'' + EXPECT.start + '\' (Jonathan, 2026-10-30: Jimi the default) \u2014 change the pin on purpose');
    if (!rv || typeof rv !== 'object' || !Object.keys(rv).length) { flag(w + ': needs a non-empty recordingVersions map'); continue; }
    if (rv[a.recording]) flag(w + ': recordingVersions has \'' + a.recording + '\', the recording the data is already for');
    if ('recordingStart' in a && a.recordingStart !== a.recording && !rv[a.recordingStart]) flag(w + ': recordingStart \'' + a.recordingStart + '\' is neither the card\'s recording nor a recordingVersions entry');
    for (const [r, v] of Object.entries(rv)) {
      const vw = w + ' \u00b7 recordingVersions.' + r;
      if (!v || typeof v !== 'object') { flag(vw + ' is not an object'); continue; }
      if (!has(v.label) || !has(v.label_es)) flag(vw + ': needs label and label_es');
      for (const f of ['title', 'intro']) {
        if (has(v[f]) && !has(v[f + '_es'])) flag(vw + ': ' + f + ' has no ' + f + '_es');
        if (has(v[f + '_es']) && !has(v[f])) flag(vw + ': ' + f + '_es without ' + f);
      }
      if (EXPECT.titled.includes(w) && (!has(v.title) || !has(v.intro))) flag(vw + ': needs its own title and intro \u2014 the card\'s name says how it is played, and this recording is not played that way');
      for (const f of ['title', 'title_es', 'intro', 'intro_es']) {
        if (has(v[f]) && v[f] === a[f]) flag(vw + ': ' + f + ' is the card\'s own \u2014 a version carries its own only to say something else (ca-40: "1 Strum per Chord" is Jimi\'s)');
      }
      if (EXPECT.strum[w] && v.card && Array.isArray(v.card.sections)) v.card.sections.forEach((sc, si) => {
        const seq = (sc.notes || []).map(nt => nt.note).join(' ');
        if (seq !== EXPECT.lap) flag(vw + ' \u00b7 section ' + (si + 1) + ' plays \'' + seq + '\', expected \'' + EXPECT.lap + '\' (a chord on the wrong eighth is a chord change the record does not make)');
        if ((sc.notes || []).some(nt => nt.beats !== 0.5)) flag(vw + ' \u00b7 section ' + (si + 1) + ': every strum is half a beat \u2014 a down-up strum on every eighth');
      });
      if (EXPECT.strum[w] && v.card && v.card.everyStrum !== true) flag(vw + ': card.everyStrum must be true \u2014 this recording is a down-up strum on every eighth, the grid would fold A5 x4 into one name');
      if (!TRACKS[v.track]) flag(vw + ': track \'' + v.track + '\' is not in SNIPPET_TRACKS');
      else if (v.track === a.card.track) flag(vw + ': plays the same track as the card \u2014 a recording version is another track');
      if (!v.card || typeof v.card !== 'object' || !Array.isArray(v.card.sections) || !v.card.sections.length) flag(vw + ': needs a card with sections (the build at the end of class-activities.js fills it in)');
      else {
        for (const k of ['checks', 'track', 'sheet', 'sheetChords', 'sheetColumns', 'wholeSong', 'slowest']) {
          if (k in v.card) flag(vw + ': card.' + k + ' \u2014 a version changes what the card shows, not its checks or how it plays (the card\'s own ' + k + ' stays; a version\'s track is recordingVersions.' + r + '.track)');
        }
        if (has(v.card.caption) && !has(v.card.caption_es)) flag(vw + ': card.caption has no caption_es');
      }
    }
    (groups[a.recordingGroup] = groups[a.recordingGroup] || []).push(a);
  }
  const sig = a => JSON.stringify([a.recording, a.recordingStart || a.recording, Object.keys(a.recordingVersions || {}).sort(), Object.values(a.recordingVersions || {}).map(v => v && v.track)]);
  for (const [g, list] of Object.entries(groups))
    if (new Set(list.map(sig)).size > 1) flag('recordingGroup \'' + g + '\': ' + list.map(a => a.id).join(', ') + ' do not offer the same recordings and default \u2014 one stored choice drives every card of the group');

  // The renderer, by running it.
  const body = fn => { const b = jsFunctionBody(appSrc, fn); return b === null ? null : stripJsComments(b); };
  const cv = body('caView'), cb = body('caCardBodyHtml');
  if (cv === null || !/recordingVersions/.test(cv) || !/rv\.track/.test(cv)) flag('app.js: caView() must lay recordingVersions over the card and play the version\'s track \u2014 the switch would change nothing');
  if (cb === null || !/caRecordingSwitchHtml\(/.test(cb)) flag('app.js: caCardBodyHtml() must draw caRecordingSwitchHtml() \u2014 a card would have no switch');
  if (!ctx) flag('1cc cannot render the cards \u2014 the 0b render context is unavailable');
  else {
    const J = JSON.stringify;
    const acts = vm.runInContext('window.CLASS_ACTIVITIES || []', ctx);
    {
      // Said once: an every-strum card must never tell the student each chord is shown once, in either language (the render read-back below compares with this table, so a wrong string in it needs its own guard).
      const I18Nt = loadI18nTable(), SD = I18Nt['ca.cardStrumDirections'], CD = I18Nt['ca.cardChordDirections'];
      if (!SD || !CD || SD.es === CD.es || SD.en === CD.en || /shown once/i.test(SD.en) || /una sola vez/i.test(SD.es)) flag('i18n ca.cardStrumDirections says each chord is shown once (or copies ca.cardChordDirections) \u2014 on an every-strum card every strum has its name');
    }
    for (const a of acts.filter(x => x && x.recordingVersions)) {
      const g = a.recordingGroup;
      const show = (r) => {
        if (r !== null) vm.runInContext('caRecordingModes[' + J(g) + '] = ' + J(r), ctx);
        try {
          const html = String(vm.runInContext('caCardBodyHtml(CLASS_ACTIVITIES.find(x => x.id === ' + J(a.id) + '))', ctx));
          const L = vm.runInContext('(function(){ const L = pcLayout(caView(CLASS_ACTIVITIES.find(x => x.id === ' + J(a.id) + '))); return L && { track: Object.keys(SNIPPET_TRACKS).find(k => SNIPPET_TRACKS[k] === L.tr), sections: L.sections.length, first: L.sections[0].s.label }; })()', ctx);
          const text = {};
          for (const lang of ['en', 'es']) {
            try { text[lang] = vm.runInContext('(function(){ setLang(' + J(lang) + '); const x = CLASS_ACTIVITIES.find(x => x.id === ' + J(a.id) + '); const m = /<p class="pc-dir">([^<]*)<\\/p>/.exec(String(caCardBodyHtml(x))); return { title: caTitle(x), intro: tf(caView(x), \'intro\'), dir: m ? m[1] : null }; })()', ctx); }
            finally { vm.runInContext("setLang('en')", ctx); }
          }
          return { html, L, text };
        } finally { vm.runInContext('delete caRecordingModes[' + J(g) + ']', ctx); }
      };
      const want = r => r === a.recording ? { track: a.card.track, secs: a.card.sections, label: a.recordingLabel } : { track: a.recordingVersions[r].track, secs: a.recordingVersions[r].card.sections, label: a.recordingVersions[r].label };
      const cases = [[a.recording, a.recording]].concat(Object.keys(a.recordingVersions).map(r => [r, r]), [[null, a.recordingStart || a.recording]]);
      for (const [pick, shown] of cases) {
        const w = a.id + ' [' + (pick === null ? 'nothing stored' : pick) + ']';
        let out;
        try { out = show(pick); } catch (e) { flag(w + ': rendering threw ' + e.message); continue; }
        rendered++;
        const exp = want(shown), { html, L, text } = out;
        if (!L) { flag(w + ': pcLayout found no layout'); continue; }
        if (L.track !== exp.track) flag(w + ': plays track \'' + L.track + '\', expected \'' + exp.track + '\'');
        if (L.sections !== exp.secs.length) flag(w + ': ' + L.sections + ' sections, expected ' + exp.secs.length);
        if (L.first !== exp.secs[0].label) flag(w + ': first section is \'' + L.first + '\', expected \'' + exp.secs[0].label + '\'');
        const chips = (html.match(/data-sec="\d+"/g) || []).length;
        if (chips !== exp.secs.length) flag(w + ': ' + chips + ' section chips, expected ' + exp.secs.length);
        const sw = (html.match(/<div class="ca-chord-switch ca-key-switch ca-rec-switch"[\s\S]*?<\/div>/) || [''])[0];
        const pressed = [...sw.matchAll(/aria-pressed="true"[^>]*>([^<]*)</g)].map(m => m[1]);
        if (!sw) flag(w + ': no recording switch drawn');
        else if (pressed.length !== 1 || pressed[0] !== exp.label) flag(w + ': the switch shows ' + J(pressed) + ' pressed, expected ' + J([exp.label]));
        // The chord names and the directions that describe them: a strum on every eighth names every strum, so the card must not say "shown once".
        const vcard = shown === a.recording ? a.card : { ...a.card, ...a.recordingVersions[shown].card };
        const gridSecs = vcard.chordGrid ? exp.secs.filter(sc => sc.chordGrid !== false) : [];
        const allGrid = gridSecs.length > 0 && gridSecs.length === exp.secs.length;
        const names = (html.match(/class="tab-note-btn tab-chord-btn"/g) || []).length;
        if (allGrid && vcard.everyStrum) {
          const strums = gridSecs.reduce((x, sc) => x + sc.notes.filter(nt => !nt.rest).length, 0);
          strumRenders++; strumNames += names;
          if (names !== strums) flag(w + ': draws ' + names + ' chord names, expected one per strum (' + strums + ')');
          if (shown !== a.recording && EXPECT.strum[a.id] && names !== EXPECT.strum[a.id]) flag(w + ': draws ' + names + ' chord names, pinned at ' + EXPECT.strum[a.id] + ' (16 strums x 8 sections) \u2014 a lap lost a strum, or the card\'s parts changed (update the pin only for an intended content change)');
        }
        if (gridSecs.length && !allGrid && vcard.everyStrum) flag(w + ': a card with chord-grid AND single-note sections cannot be every-strum \u2014 no directions line describes it (the mixed one says each chord is shown once)');
        if (gridSecs.length && !(gridSecs.length && !allGrid && vcard.everyStrum)) {
          const dirKey = allGrid ? (vcard.everyStrum ? 'ca.cardStrumDirections' : 'ca.cardChordDirections') : 'ca.cardChordMixedDirections';
          const I18N = loadI18nTable();
          for (const lang of ['en', 'es']) {
            readbacks++;
            if (!text[lang].dir || text[lang].dir !== I18N[dirKey][lang]) flag(w + ': the ' + lang + ' directions read \'' + text[lang].dir + '\', expected ' + dirKey + ' (' + (allGrid ? (vcard.everyStrum ? 'every strum is named' : 'each chord once') : 'chords and single notes') + ')');
          }
        }
        // The title and intro follow the recording (a version-level title / intro), else they are the card's own.
        const rvv = shown === a.recording ? {} : a.recordingVersions[shown];
        for (const lang of ['en', 'es']) {
          const sfx = lang === 'es' ? '_es' : '';
          for (const f of ['title', 'intro']) {
            readbacks++;
            const want_ = has(rvv[f + sfx]) ? rvv[f + sfx] : a[f + sfx];
            if (text[lang][f] !== want_) flag(w + ': the ' + lang + ' ' + f + ' reads \'' + text[lang][f] + '\', expected \'' + want_ + '\'');
          }
        }
        const tr = TRACKS[exp.track];
        const hasFull = !!(tr && tr.srcFull && tr.srcFullSlow);
        if (/data-guitar="1"/.test(html) !== hasFull) flag(w + ': the Guitar switch is ' + (hasFull ? 'missing' : 'offered') + ' but ' + exp.track + (hasFull ? ' has' : ' has no') + ' full mix');
      }
    }
  }
  // The four switches must go through caTeacherRedraw: running it (below) proves
  // the helper, this proves they call it.
  for (const fn of ['caSetKeyMode', 'caSetRecordingMode', 'caSetChordMode', 'caSetBassMode']) {
    const sb = body(fn);
    if (sb === null) flag('app.js: ' + fn + '() not found — 1cc cannot read what its teacher-console redraw calls');
    else if (!/caTeacherRedraw\(id\)/.test(sb)) flag('app.js: ' + fn + '() must redraw the teacher console through caTeacherRedraw(id) — on Teacher view songs a switch would replace the projector card');
    else if (/renderTeacherActivityDetail\(id\)/.test(sb)) flag('app.js: ' + fn + '() still calls renderTeacherActivityDetail(id) directly — use caTeacherRedraw(id)');
  }
  if (ctx) {
    let calls = null;
    try {
      calls = vm.runInContext('(function(){ const calls = []; const oldQ = document.querySelector; const marker = { removed: false, removeAttribute(n){ if (n === \'data-tvs\') this.removed = true; } };'
        + ' document.querySelector = s => s === \'[data-tvs]\' ? marker : oldQ.call(document, s);'
        + ' globalThis.teacherView = \'tsongs\'; globalThis.renderTeacherViewSongs = () => calls.push(\'tsongs:\' + marker.removed); globalThis.renderTeacherActivityDetail = id => calls.push(\'detail:\' + id);'
        + ' try { caTeacherRedraw(\'ca-40\'); globalThis.teacherView = \'activities\'; caTeacherRedraw(\'ca-26\'); }'
        + ' finally { document.querySelector = oldQ; delete globalThis.teacherView; delete globalThis.renderTeacherViewSongs; delete globalThis.renderTeacherActivityDetail; }'
        + ' return calls; })()', ctx);
    } catch (e) { flag('caTeacherRedraw threw ' + e.message); }
    if (calls && JSON.stringify(calls) !== JSON.stringify(['tsongs:true', 'detail:ca-26'])) flag('caTeacherRedraw: expected the Teacher view songs tab to restart (after dropping its data-tvs marker) and any other console page to open the activity detail, got ' + JSON.stringify(calls));
  }
  /* The console is where ca-40 lives (Teacher view songs and the activity detail page; it is teacher-only), so what the console reads
     has to follow the recording too: teacherActivityTitle is run for real (its two functions lifted out of teacher.js into the render
     context), and the two renderers must draw the caView copy (a `const a=raw` there shows Jimi's intro over a Neil card). */
  {
    let tsrc = '';
    try { tsrc = readFileSync(join(ROOT, 'teacher.js'), 'utf8'); } catch { flag('teacher.js could not be read \u2014 1cc cannot check the console'); }
    if (tsrc) {
      for (const fn of ['renderTeacherViewSongs', 'renderTeacherActivityDetail']) {
        const tb = jsFunctionBody(tsrc, fn);
        if (tb === null || !/caView\(raw\)/.test(stripJsComments(tb))) flag('teacher.js: ' + fn + '() must draw caView(raw) \u2014 the console would show Jimi\'s title and intro over a Neil card');
      }
      const fnText = nm => { const m = new RegExp('function\\s+' + nm + '\\s*\\(').exec(tsrc), b = jsFunctionBody(tsrc, nm); return m && b ? tsrc.slice(m.index, tsrc.indexOf('{', m.index)) + b : null; };
      const lifted = ['teacherActivityRenamed', 'teacherActivityTitle'].map(fnText);
      if (ctx && lifted.some(f => !f)) flag('teacher.js: teacherActivityRenamed / teacherActivityTitle not found \u2014 1cc cannot run the console title (renamed? update this check with it)');
      else if (ctx) {
        const acts2 = vm.runInContext('window.CLASS_ACTIVITIES || []', ctx);
        for (const a of acts2.filter(x => x && x.recordingVersions)) {
          for (const r of [a.recording, ...Object.keys(a.recordingVersions)]) {
            const rvv = r === a.recording ? {} : a.recordingVersions[r];
            const want = has(rvv.title) ? rvv.title : a.title;
            let got;
            try { got = vm.runInContext('(function(){ ' + lifted.join('\n') + ' caRecordingModes[' + JSON.stringify(a.recordingGroup) + '] = ' + JSON.stringify(r) + '; try { return teacherActivityTitle(window.CLASS_ACTIVITIES.find(x => x.id === ' + JSON.stringify(a.id) + '), {}); } finally { delete caRecordingModes[' + JSON.stringify(a.recordingGroup) + ']; } })()', ctx); }
            catch (e) { flag(a.id + ' [' + r + ']: teacherActivityTitle threw ' + e.message); continue; }
            consoleReads++;
            if (got !== want) flag(a.id + ' [' + r + ']: the console title reads \'' + got + '\', expected \'' + want + '\' \u2014 a list row, the picker or the page head would name the wrong recording');
          }
        }
      }
    }
  }
  if (n !== EXPECT.cards) flag('1cc sees ' + n + ' card' + (n === 1 ? '' : 's') + ' with recording versions, expected ' + EXPECT.cards + ' (ca-26, ca-29, ca-40) \u2014 change the pin on purpose, or restore the card');
  if (Object.keys(groups).length !== EXPECT.groups) flag('1cc sees ' + Object.keys(groups).length + ' recording groups, expected ' + EXPECT.groups);
  if (bad === 0) ok(n + ' cards with recording versions, ' + rendered + ' renders (each recording + nothing stored) \u2014 right track, sections, switch and Guitar switch every time; ' + strumRenders + ' every-strum renders draw ' + strumNames + ' chord names (the Neil cards pinned at 128 each, every lap A5 x4 G5 x3 F5 x6 G5 x3); ' + readbacks + ' title / intro / directions read-backs in EN + ES; ' + consoleReads + ' console titles run through teacherActivityTitle');
}

/* 1cf. THE CLASS ROSTER SKIPS THE TEACHER'S OWN HEAR IT FIRST STUB (Friday
   check R2-1, Jonathan 2026-10-31; widened after the review, R3-1/R3-2).
   Hear It First saves the signed-in account's trainer profile into
   progress/{uid} with mergeFields, which creates the document when it is
   missing, so it follows Jonathan between machines. On the teacher's own account
   that document holds nothing a student has, and teacherFetchStudents drew it as
   a nameless row under Unassigned. It does not stay `{trainer}`: Hear It First
   runs in student mode, every student-mode page load runs swap45Commit, and that
   writes `migrations.swap45` into an unmarked document, so from the second visit
   the stub is `{trainer, migrations}`. The test is therefore "the row would be
   empty" (no name, no email, no period, no skills / responses / games / class
   activities / exit checks), not "only these keys".
   Checked by RUNNING the real teacherFetchStudents (lifted out of teacher.js)
   against a stand-in database, once for each account that could be signed in.
   The documents: two stubs (`{trainer}` and `{trainer, migrations}`), two
   students, another account's stub, and three accounts that hold something (a
   name, responses, a period). Expected, for each sign-in: the signed-in
   account's own document is skipped when it is a stub and listed when it holds
   anything; every other document is always listed; signed out, nothing is
   skipped. Pinned: 8 documents x 6 sign-ins. */
function checkRosterSkipsTrainerStub() {
  head('1cf. The class roster skips the teacher\'s own Hear It First stub');
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  let tsrc = '';
  try { tsrc = readFileSync(join(ROOT, 'teacher.js'), 'utf8'); } catch { flag('teacher.js could not be read \u2014 1cf cannot check the roster'); return; }
  const at = tsrc.indexOf('async function teacherFetchStudents(');
  const body = at < 0 ? null : jsFunctionBody(tsrc, 'teacherFetchStudents');
  if (at < 0 || body === null) { flag('teacher.js: teacherFetchStudents() not found \u2014 1cf cannot run the roster (renamed? update this check with it)'); return; }
  const fnSrc = tsrc.slice(at, tsrc.indexOf('{', at)) + body;
  const DOCS = [
    ['teacher-0', { trainer: { v: 1 } }],                                           // a stub straight after the first Hear It First save
    ['teacher-1', { trainer: { v: 1 }, migrations: { swap45: true } }],             // the same stub after the next student-mode page load (swap45Commit)
    ['stu-a', { name: 'Ana', email: 'ana@x.test', skills: { s1: 'gotit' } }],
    ['stu-b', { name: 'Ben', email: 'ben@x.test' }],
    ['other-stub', { trainer: { v: 1 }, migrations: { swap45: true } }],            // another account's stub: not the signed-in one, so listed
    ['teacher-2', { trainer: { v: 1 }, name: 'Test Student', email: 'test@x.test' }],
    ['teacher-3', { trainer: { v: 1 }, responses: { r1: 'x' } }],
    ['teacher-4', { trainer: { v: 1 }, migrations: { swap45: true }, period: '4' }],
  ];
  const STUBS = new Set(['teacher-0', 'teacher-1']);
  const roster = async (uid) => {
    const ctx = vm.createContext({ ensureDb: async () => {}, swap45Marked: () => true, swap45Remap: d => d, String, Object, Array, Promise,
      currentUser: uid ? { uid } : null,
      db: { collection: () => ({ get: async () => ({ forEach: fn => DOCS.forEach(([id, data]) => fn({ id, data: () => data })) }) }) } });
    const got = await vm.runInContext('(' + fnSrc + ')()', ctx);
    return got.map(x => x.uid);
  };
  return (async () => {
    const SIGN_INS = ['teacher-0', 'teacher-1', 'teacher-2', 'teacher-3', 'teacher-4', null];
    for (const uid of SIGN_INS) {
      const ids = await roster(uid);
      const want = DOCS.map(d => d[0]).filter(id => !(uid && id === uid && STUBS.has(id)));
      if (JSON.stringify(ids) !== JSON.stringify(want)) flag('signed in as ' + (uid || 'nobody') + ', the roster lists ' + JSON.stringify(ids) + ', expected ' + JSON.stringify(want) + (uid && STUBS.has(uid) ? ' (the signed-in account\'s own stub skipped, every other document listed)' : ' (nothing skipped: this account\'s own document holds data, or nobody is signed in)'));
    }
    if (bad === 0) ok('teacherFetchStudents run for real: ' + DOCS.length + ' documents x ' + SIGN_INS.length + ' sign-ins \u2014 the signed-in teacher\'s own stub is skipped in both shapes (before and after swap45Commit), the same uid holding a name, responses or a period is listed, other accounts\' stubs are listed, and nothing is skipped when signed out');
  })();
}

/* 1ch. SONG POPULARITY (Jonathan, 2026-11-01: a counter on the teacher dashboard
   for the extra play-along songs; "students + total opens"). A click on a
   "More Play Along songs" row adds 1 to songOpens[id] in the student's own
   progress doc (songsLibraryOpen, app.js); the console's Songs view counts
   students and opens (teacherFetchStudents + renderTeacherSongs, teacher.js).
   Run for real, not found in the source:
   - the library rows are RENDERED (songsLibraryHtml in the 0b context) and both
     buttons of every row are clicked through their own onclick: each one
     writes { songOpens: { <id>: increment(1) } } with { merge: true } to the
     signed-in student's progress doc and still opens the card;
   - the teacher account, the dev bypass and a signed-out visitor write nothing
     (and still open the card); a Core song row writes nothing;
   - teacherFetchStudents keeps only whole counts 1..1000 per song from a
     student-written map (strings, negatives, NaN, huge numbers, a non-object).
   Pinned: every library row (2 buttons each), 3 non-counted sign-ins, 8 doctored values. */
async function checkSongPopularity(ctx) {
  head('1ch. Song popularity: a Songs-page click counts once, for students only; the console reads it safely');
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  if (!ctx) { flag('1ch cannot run \u2014 the 0b render context is unavailable'); return; }
  const run = x => vm.runInContext(x, ctx);
  let rows;
  try {
    rows = run(`(() => {
      const keep = { u: currentUser, d: db, h: songsHubOpenCard, f: window.firebase, gp: isGatePreviewer };
      const lentEmail = typeof TEACHER_EMAIL === 'undefined';   // firebase-config.js is not in the 0b context
      if (lentEmail) globalThis.TEACHER_EMAIL = 'jhoffman@seq.org';
      const log = [], opened = [];
      const inc = n => ({ __inc: n });
      window.firebase = { firestore: Object.assign(() => fakeDb, { FieldValue: { increment: inc } }) };
      var fakeDb = { collection: c => ({ doc: id => ({ set: (data, opt) => { log.push({ c, id, data: JSON.parse(JSON.stringify(data)), merge: !!(opt && opt.merge) }); return Promise.resolve(); } }) }) };
      db = fakeDb;
      songsHubOpenCard = id => { opened.push(id); };
      const out = { rows: [], who: {} };
      try {
        isGatePreviewer = () => false;
        currentUser = { uid: 'stu-1', email: 'stu@x.test', displayName: 'Stu' };
        /* No HTML parser here: take each row's onclick attributes out of the
           markup and un-escape them the way the browser does before running. */
        const unAttr = v => v.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        songsLibraryHtml().split('class="song-row"').slice(1).forEach(r => {
          const handlers = [...r.matchAll(/onclick="([^"]*)"/g)].map(m => unAttr(m[1]));
          const res = handlers.map(h => { log.length = 0; opened.length = 0; new Function(h)(); return { log: log.slice(), opened: opened.slice() }; });
          out.rows.push({ n: handlers.length, res });
        });
        const lib = (window.CLASS_ACTIVITIES || []).filter(caIsLibrarySong);
        for (const [k, user, prev] of [['teacher', { uid: 't', email: TEACHER_EMAIL }, null], ['bypass', { uid: 'd', email: 'dev@x' }, true], ['signed out', null, false]]) {
          currentUser = user; isGatePreviewer = prev === null ? keep.gp : () => prev;
          log.length = 0; opened.length = 0;
          if (lib[0]) songsLibraryOpen(lib[0].id);
          out.who[k] = { writes: log.length, opened: opened.slice() };
        }
        out.lib = lib.map(a => a.id);
      } finally { currentUser = keep.u; db = keep.d; songsHubOpenCard = keep.h; if (keep.f === undefined) delete window.firebase; else window.firebase = keep.f; isGatePreviewer = keep.gp; if (lentEmail) delete globalThis.TEACHER_EMAIL; }
      return JSON.stringify(out);
    })()`);
    rows = JSON.parse(rows);
  } catch (e) { flag('1ch could not run songsLibraryHtml/songsLibraryOpen: ' + e.message); return; }
  if (!rows.lib.length) flag('no library song to test (every card with library: true hidden or retired?)');
  if (rows.rows.length !== rows.lib.length) flag(`songsLibraryHtml drew ${rows.rows.length} rows for ${rows.lib.length} library songs`);
  rows.rows.forEach((r, i) => {
    const id = rows.lib[i];
    if (r.n !== 2) flag(`library row ${i + 1} has ${r.n} buttons (want the name and Play Along)`);
    r.res.forEach((x, j) => {
      const w = x.log[0];
      const okWrite = x.log.length === 1 && w.c === 'progress' && w.id === 'stu-1' && w.merge && w.data && w.data.songOpens && Object.keys(w.data.songOpens).length === 1 && w.data.songOpens[x.opened[0]] && w.data.songOpens[x.opened[0]].__inc === 1 && Object.keys(w.data).sort().join() === 'email,name,songOpens' && w.data.email === 'stu@x.test';
      if (!okWrite) flag(`library row ${i + 1}, button ${j + 1}: wrote ${JSON.stringify(x.log)} (want exactly one { name, email, songOpens: { <id>: increment(1) } } merge-write to progress/stu-1)`);
      if (x.opened.length !== 1) flag(`library row ${i + 1}, button ${j + 1}: opened ${JSON.stringify(x.opened)} (want the card once)`);
    });
  });
  const opensIds = rows.rows.map(r => r.res[0] && r.res[0].opened[0]).sort();
  if (JSON.stringify(opensIds) !== JSON.stringify([...rows.lib].sort())) flag(`the rows open ${JSON.stringify(opensIds)}, the library holds ${JSON.stringify(rows.lib)}`);
  for (const [k, v] of Object.entries(rows.who)) {
    if (v.writes !== 0) flag(`${k}: a Songs-page click wrote ${v.writes} time(s) \u2014 only students count`);
    if (v.opened.length !== 1) flag(`${k}: the card did not open (${JSON.stringify(v.opened)})`);
  }
  /* A Core song's Play Along (songsPlayAlongBtn, the Core rows) must not count:
     render it for every Core song with a play-along and click it. */
  const core = JSON.parse(run(`(() => {
    const keepDb = db, keepH = songsHubOpenCard, keepU = currentUser, keepGp = isGatePreviewer, keepCard = songsPlayAlongCard, keepFb = window.firebase; let writes = 0, clicks = 0;
    db = { collection: () => ({ doc: () => ({ set: () => { writes++; return Promise.resolve(); } }) }) };
    window.firebase = { firestore: Object.assign(() => db, { FieldValue: { increment: n => ({ __inc: n }) } }) };
    songsHubOpenCard = () => { clicks++; }; currentUser = { uid: 'stu-1', email: 'stu@x.test' }; isGatePreviewer = () => false;
    const unAttr = v => v.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    /* A Core play-along shows only once released (dated); stand one in so the
       Core row's own button is drawn and clicked whatever today's board says. */
    const stand = (window.CLASS_ACTIVITIES || []).find(a => a.view === 'card' && !caIsLibraryCard(a));
    songsPlayAlongCard = () => stand;
    try {
      [...String(songsPlayAlongBtn('the-cure') || '').matchAll(/onclick="([^"]*)"/g)].forEach(m => new Function(unAttr(m[1]))());
    } finally { db = keepDb; songsHubOpenCard = keepH; currentUser = keepU; isGatePreviewer = keepGp; songsPlayAlongCard = keepCard; if (keepFb === undefined) delete window.firebase; else window.firebase = keepFb; }
    return JSON.stringify({ writes, clicks });
  })()`));
  if (core.clicks === 0) flag('no Core song Play Along button rendered \u2014 1ch cannot prove Core rows do not count');
  if (core.writes !== 0) flag(`clicking ${core.clicks} Core song Play Along button(s) wrote ${core.writes} count(s) \u2014 only "More Play Along songs" rows count`);
  // teacherFetchStudents keeps only sane counts.
  let tsrc = '';
  try { tsrc = readFileSync(join(ROOT, 'teacher.js'), 'utf8'); } catch { flag('teacher.js unreadable'); return; }
  const at = tsrc.indexOf('async function teacherFetchStudents(');
  const body = at < 0 ? null : jsFunctionBody(tsrc, 'teacherFetchStudents');
  if (body === null) { flag('teacherFetchStudents() not found'); return; }
  const fnSrc = tsrc.slice(at, tsrc.indexOf('{', at)) + body;
  const DOCS = [
    ['a', { name: 'A', songOpens: { 'ca-36': 3, 'ca-42': '5', 'ca-35': -2, 'ca-37': 'x', 'ca-39': 2.9, 'ca-34': 1e9, 'ca-99': NaN, 'ca-98': 0 } }],
    ['b', { name: 'B', songOpens: 'lots' }],
    ['c', { name: 'C' }],
  ];
  const vctx = vm.createContext({ ensureDb: async () => {}, swap45Marked: () => true, swap45Remap: d => d, String, Object, Array, Promise, Number, Math, currentUser: null,
    db: { collection: () => ({ get: async () => ({ forEach: fn => DOCS.forEach(([id, data]) => fn({ id, data: () => data })) }) }) } });
  const got = await vm.runInContext('(' + fnSrc + ')()', vctx);
  const so = Object.fromEntries(got.map(x => [x.uid, x.songOpens]));
  const want = { a: { 'ca-36': 3, 'ca-42': 5, 'ca-39': 2, 'ca-34': 1000 }, b: {}, c: {} };
  if (JSON.stringify(so) !== JSON.stringify(want)) flag(`teacherFetchStudents songOpens = ${JSON.stringify(so)}, want ${JSON.stringify(want)} (whole counts 1..1000 only)`);

  /* The console's Songs view itself (renderTeacherSongs) with fake rows: students
     who opened, total opens, an archived student left out, 1 vs many wording. */
  {
    const pick = name => { const m = new RegExp(`function\\s+${name}\\s*\\(`).exec(tsrc); return m ? tsrc.slice(m.index, tsrc.indexOf('{', m.index)) + jsFunctionBody(tsrc, name) : ''; };
    const fns = ['renderTeacherSongs', 'teacherActivityTitle', 'teacherActivityRenamed', 'teacherActivityRetired', 'teacherActivityDeleted', 'teacherActivityArchived'].map(pick).join('\n');
    const html = run(`(() => { ${fns}
      const box = { innerHTML: '', querySelector: () => null };
      const document = { getElementById: () => box };
      let teacherView = 'songs', activityEditId = null;
      const cfg = { archived: { 'u-arch': true } };
      const loadTeacherClassConfig = () => ({ then: f => f(cfg) });
      const allStudentsRaw = [
        { uid: 'u-a', songOpens: { 'ca-36': 5, 'ca-42': 1 }, classActivities: {} },
        { uid: 'u-b', songOpens: { 'ca-36': 3 }, classActivities: {} },
        { uid: 'u-arch', songOpens: { 'ca-36': 100, 'ca-42': 9 }, classActivities: {} },
        { uid: 'u-none', songOpens: {}, classActivities: {} } ];
      renderTeacherSongs();
      return box.innerHTML;
    })()`);
    const popOf = id => { const m = new RegExp('data-id="' + id + '"[\\s\\S]*?$').exec(''); const i = html.indexOf('<span class="t-songs-id">' + id + '</span>'); const j = html.indexOf('t-songs-pop', i); return i < 0 || j < 0 ? null : html.slice(html.indexOf('>', j) + 1, html.indexOf('</span>', j)); };
    const want = { 'ca-36': 'Opened: 2 students · 8 opens', 'ca-42': 'Opened: 1 student · 1 open', 'ca-37': 'Opened: 0 students · 0 opens' };
    for (const [id, w] of Object.entries(want)) { const got = popOf(id); if (got !== w) flag(`console Songs view, ${id}: "${got}" (want "${w}")`); }
  }

  /* The card opens whatever the write does (db not ready, Firestore not loaded,
     a write that throws, a write the rules refuse — it must carry a .catch). */
  {
    const r = JSON.parse(run(`(() => {
      const keep = { u: currentUser, d: db, h: songsHubOpenCard, f: window.firebase, gp: isGatePreviewer };
      const out = {};
      const lib = (window.CLASS_ACTIVITIES || []).filter(caIsLibrarySong);
      const inc = n => ({ __inc: n });
      try {
        isGatePreviewer = () => false; currentUser = { uid: 'stu-1', email: 'stu@x.test' };
        for (const mode of ['db null', 'no firebase', 'set throws', 'set rejects']) {
          let opened = 0, caught = false, threw = null;
          songsHubOpenCard = () => { opened++; };
          window.firebase = mode === 'no firebase' ? undefined : { firestore: Object.assign(() => db, { FieldValue: { increment: inc } }) };
          db = mode === 'db null' ? null : { collection: () => ({ doc: () => ({ set: () => {
            if (mode === 'set throws') throw new Error('sync');
            if (mode === 'set rejects') return { then() { return this; }, catch(fn) { caught = typeof fn === 'function'; return this; } };
            return { then() { return this; }, catch() { return this; } };
          } }) }) };
          try { songsLibraryOpen(lib[0].id); } catch (e) { threw = e.message; }
          out[mode] = { opened, caught, threw };
        }
      } finally { currentUser = keep.u; db = keep.d; songsHubOpenCard = keep.h; if (keep.f === undefined) delete window.firebase; else window.firebase = keep.f; isGatePreviewer = keep.gp; }
      return JSON.stringify(out);
    })()`));
    for (const [mode, v] of Object.entries(r)) {
      if (v.opened !== 1 || v.threw) flag(`${mode}: the card opened ${v.opened} time(s)${v.threw ? ', threw ' + v.threw : ''} (want once, nothing thrown)`);
      if (mode === 'set rejects' && !v.caught) flag('set rejects: the write promise has no .catch — a refused write raises the global error banner');
    }
  }
  if (bad === 0) ok(`${rows.rows.length} library rows rendered, ${rows.rows.length * 2} buttons clicked \u2014 each writes one songOpens increment(1) merge to the student's own progress doc and opens its card; the teacher, the dev bypass and a signed-out visitor write nothing; ${core.clicks} Core Play Along clicks write nothing; the console keeps 4 of 8 doctored counts (3, "5"\u21925, 2.9\u21922, 1e9\u21921000); the console Songs view draws 3 exact count lines (an archived student left out); the card opens in 4 failure modes`);
}

/* 1cd. NOTE CALL POWER CHORDS (ca-43, Jonathan 2026-10-30). The student
   STRUMS a power chord and the card is answered by its root fret. The mic used
   to wait for the exact root alone, which a strummed A5 almost never gives
   (YIN reads a strum as the root, the 5th, the octave, the note an octave
   below, or nothing), so a right strum counted 0 times in 40 on a normal
   guitar (tools/mic-sim/power-notecall.mjs). Power mode now takes the root,
   the octave and the octave BELOW the root (YIN reads a strum's root and 5th as
   that pitch from about B2 up, which is most of the neck), at
   RNW_POWER_CLARITY; single-note Note Call (ca-23) is untouched. NOT the 5th
   (Jonathan, 2026-10-31): Riff Runner's Wait Mode takes it (coachPowerTargets),
   but here a chord rooted a 5th above the card shares the card's 5th, and with
   it accepted that wrong chord counted right 7.7% / 28.9% / 100% of the time in
   the sim (0 of 1040 without it, the right-strum rows unchanged).
   Checked by EXECUTING the real app.js in the 0b context, not by finding the
   calls. The context has NO coach.js, like a student in tap mode (coach.js is
   lazy-loaded, only the mic path loads it): dealing a power card must work
   without it (the first version threw there and Start did nothing), so nothing
   from coach.js is lent to the context except, for the listening calls below,
   stubs of coachSettlePitch and friends:
   - ca-43: four steps, each drill.power on the low E and A strings, frets
     0-5 / 5-8 / 8-12 / 0-12; no other power drill; ncProgKey keeps ca-23's
     key and gives power its own ("+5");
   - the accept rule on every card of every step, naturals and all: ncTargets
     is the octave below, root and octave of each root (no 5th), ncAnswerAt agrees with an
     oracle written here for every pitch 28-80 (the exact root first, so fret 0
     and fret 12 of one note stay apart), and for single-note cards both are
     exactly what they were (p.midis, indexOf);
   - what may follow what (ncClash, ncDeal): a root a card before could still be
     ringing as is not dealt next (exact roots, power chords and single notes
     alike, as it always was; the order of chords stays unpredictable and never
     repeats a chord); an oracle over every card triple, and the real ncDeal for
     a few thousand seeded deals, with no coach.js loaded;
   - ncListen: what it hands coachSettlePitch (the targets, the clarity tiers
     only for power) and which fret an answer resolves, on the main path and
     the mic-grace path, power and single-note;
   - every ncp.* string: the real setup screens (4 toggle states x every
     level), prompt, answer reveal, hit / wrong / miss feedback and the done
     screen are rendered under a spy on ncK; each key they ask for must exist
     in English and Spanish, none may be the English, and none defined may go
     unshown.
   Pinned: 4 power steps, 18 ncp.* keys. */
function checkNoteCallPower(ctx) {
  head('1cd. Note Call power chords (ca-43): the mic takes a strum, every string it can show');
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  if (!ctx) { flag('1cd cannot run — the 0b render context is unavailable'); return; }
  const EXPECT = { power: 4, ranges: [[0, 5], [5, 8], [8, 12], [0, 12]], keys: 18 };
  const J = JSON.stringify;
  const run = x => vm.runInContext(x, ctx);
  let csrc = '';
  try { csrc = readFileSync(join(ROOT, 'coach.js'), 'utf8'); } catch { flag('coach.js could not be read — 1cd cannot check the mic rule'); return; }
  const stats = { cards: 0, answers: 0, listens: 0, keys: 0, micHits: 0, fbRenders: 0 };

  // The data.
  const acts = run('window.CLASS_ACTIVITIES || []');
  const drills = [];
  for (const a of acts) for (const st of (a.steps || [])) if (st && st.drill && st.drill.type === 'notecall') drills.push({ id: a.id, d: st.drill });
  const c43 = acts.find(a => a.id === 'ca-43');
  if (!c43) flag('ca-43 is gone — 1cd checks its four drills');
  else {
    const steps = c43.steps || [];
    if (steps.length !== EXPECT.ranges.length) flag('ca-43 has ' + steps.length + ' steps, expected ' + EXPECT.ranges.length + ' (frets 0-5, 5-8, 8-12, 0-12)');
    EXPECT.ranges.forEach(([lo, hi], i) => {
      const d = steps[i] && steps[i].drill;
      if (!d || d.type !== 'notecall' || d.power !== true || J(d.strings) !== J(['lowE', 'A']) || d.minFret !== lo || d.maxFret !== hi)
        flag('ca-43 step ' + (i + 1) + ': expected a power Note Call drill on the low E and A strings, frets ' + lo + '-' + hi + ', got ' + J(d));
    });
  }
  const powerDrills = drills.filter(x => x.d.power);
  if (powerDrills.length !== EXPECT.power || powerDrills.some(x => x.id !== 'ca-43')) flag('1cd sees ' + powerDrills.length + ' power Note Call drills (' + [...new Set(powerDrills.map(x => x.id))].join(', ') + '), expected ' + EXPECT.power + ', all in ca-43 — another one needs the same mic rule and pins');
  const singles = drills.filter(x => !x.d.power);
  if (!singles.length) flag('1cd sees no single-note Note Call drill — the "single-note is unchanged" proof below would be empty');

  // Progress keys: ca-23's saved key is unchanged; power has its own.
  const pk = pw => run('ncProgKey(' + J({ strings: ['lowE', 'A'], power: pw, minFret: 0, maxFret: 5 }) + ')');
  if (pk(false) !== 'lowE+A:0-5') flag('ncProgKey of a single-note drill is \'' + pk(false) + '\', expected \'lowE+A:0-5\' — every student\'s saved ca-23 progress would be orphaned');
  if (pk(true) !== 'lowE+A+5:0-5') flag('ncProgKey of a power drill is \'' + pk(true) + '\', expected \'lowE+A+5:0-5\' — power progress would share the single-note key');

  // The helper (coach.js is not in the context) and the real value of the clarity tiers.
  const clarM = /^const RNW_POWER_CLARITY\s*=\s*(\[[^\]]*\]);/m.exec(csrc);
  if (run('typeof coachReadFrame') !== 'undefined' || run('typeof coachPowerTargets') !== 'function') flag('1cd needs the render context to have app.js but NOT coach.js (typeof coachReadFrame is ' + run('typeof coachReadFrame') + ', coachPowerTargets ' + run('typeof coachPowerTargets') + ') \u2014 a student in tap mode has no coach.js, and Note Call must deal its cards without it');
  if (/function\s+coachPowerTargets\s*\(/.test(csrc)) flag('coach.js defines coachPowerTargets \u2014 it lives in app.js (Note Call needs it before coach.js loads), and two definitions would drift');
  if (!clarM) flag('coach.js: RNW_POWER_CLARITY not found — 1cd cannot check the clarity Note Call reads at');
  const rnwB = jsFunctionBody(csrc, 'rnwTargets');
  if (rnwB === null || !/coachPowerTargets\(/.test(stripJsComments(rnwB))) flag('coach.js: rnwTargets() must use coachPowerTargets() — Riff Runner and Note Call would drift apart (the third copy of [root, root+7, root+12])');
  const saved = [];
  const setG = (name, val) => { saved.push([name, Object.prototype.hasOwnProperty.call(ctx, name), ctx[name]]); ctx[name] = val; };
  const undo = () => { for (const [n, had, v] of saved.reverse()) { if (had) ctx[n] = v; else delete ctx[n]; } saved.length = 0; };
  try {
    if (clarM) {
      const RNW = run(clarM[1]);

      // The accept rule, on every card Note Call can deal.
      const oracle = (midis, m, power) => {
        const exact = midis.indexOf(m);
        if (exact >= 0 || !power) return exact;
        return midis.findIndex(r => [r - 12, r, r + 12].includes(m));
      };
      const MS = Array.from({ length: 53 }, (_, i) => 28 + i);
      const judge = (cfgObj, pile, label) => {
        const out = run('(function(){ const o = []; ncPool(' + J(cfgObj) + ',' + J(pile) + ').forEach(p => o.push({ p: { str: p.str, note: p.note, power: p.power, frets: p.frets, midis: p.midis }, t: ncTargets(p), a: ' + J(MS) + '.map(m => ncAnswerAt(p, m)) })); return J(o); function J(x){ return JSON.stringify(x); } })()');
        for (const c of JSON.parse(out)) {
          stats.cards++;
          const want = c.p.power ? c.p.midis.flatMap(r => [r - 12, r, r + 12]) : c.p.midis;
          if (J(c.t) !== J(want)) flag(label + ' ' + c.p.note + ' on ' + c.p.str + ': ncTargets is ' + J(c.t) + ', expected ' + J(want));
          MS.forEach((m, i) => {
            stats.answers++;
            const w = oracle(c.p.midis, m, c.p.power);
            if (c.a[i] !== w) flag(label + ' ' + c.p.note + ' on ' + c.p.str + ' (roots ' + J(c.p.midis) + '): ncAnswerAt(' + m + ') is ' + c.a[i] + ', expected ' + w + (c.p.power ? ' (a power card answers its root, octave or octave below, never its 5th, the exact root first)' : ' (a single note answers only its exact pitch)'));
          });
        }
      };
      for (const [lo, hi] of EXPECT.ranges) for (const pile of ['naturals', 'all']) judge({ strings: ['lowE', 'A'], power: true, minFret: lo, maxFret: hi }, pile, 'power ' + lo + '-' + hi + ' ' + pile + ':');
      for (const { id, d } of singles) for (const pile of ['naturals', 'all']) judge({ strings: d.strings, power: false, minFret: d.minFret != null ? d.minFret : 0, maxFret: d.maxFret != null ? d.maxFret : 5 }, pile, id + ' single-note ' + pile + ':');

      // What may follow what: a root a card before could still be ringing as is not dealt next (exact roots: a ringing strum answers only the
      // same chord, measured). An oracle written here, over every card triple, and the real ncDeal run for a few thousand seeded deals, with
      // no coach.js loaded (the first version of this change threw in ncDeal there).
      let dealOut = null;
      try { dealOut = JSON.parse(run(`(function(){
        const overlap = (p, q) => p.midis.some(a => q.midis.includes(a));
        const oracle = (p, last) => { const q1 = last[last.length - 1]; if (q1 && q1.str === p.str && q1.note === p.note) return true; return last.some(q => overlap(p, q)); };
        const cfgs = [];
        ${J(EXPECT.ranges)}.forEach(r => ['naturals', 'all'].forEach(pile => cfgs.push({ pile, cfg: { strings: ['lowE', 'A'], power: true, minFret: r[0], maxFret: r[1] } })));
        ${J(singles.map(x => ({ strings: x.d.strings, minFret: x.d.minFret != null ? x.d.minFret : 0, maxFret: x.d.maxFret != null ? x.d.maxFret : 5 })))}.forEach(c => ['naturals', 'all'].forEach(pile => cfgs.push({ pile, cfg: { strings: c.strings, power: false, minFret: c.minFret, maxFret: c.maxFret } })));
        const R = { clashCalls: 0, clashBad: [], deals: 0, forced: 0, viol: [], powerDeals: 0, powerForced: 0, dealsSingleDiff: 0 };
        let seed = 20261030; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
        const origRandom = Math.random; Math.random = rnd;
        try {
          for (const { pile, cfg } of cfgs) {
            const pool = ncPool(cfg, pile);
            for (const p of pool) for (const q1 of pool) {
              for (const last of [[], [q1]]) { R.clashCalls++; if (ncClash(p, last) !== oracle(p, last)) R.clashBad.push([cfg.power, p.note, p.str, q1.note, q1.str]); }
              for (const q2 of pool) { R.clashCalls++; if (ncClash(p, [q1, q2]) !== oracle(p, [q1, q2])) R.clashBad.push([cfg.power, p.note, p.str, q1.note + q2.note]); }
            }
            for (let round = 0; round < 300; round++) {
              const st = { mode: 'levels', seq: [], requeue: [], bag: [], cfg, L: { pile } };
              for (let i = 0; i < 10; i++) {
                if (rnd() < 0.25) st.requeue.push({ p: pool[Math.floor(rnd() * pool.length)], due: st.seq.length });
                ncDeal(st);
                const d = st.seq[st.seq.length - 1], prev = st.seq.slice(-3, -1);
                const clashes = oracle(d, prev);
                R.deals++; if (cfg.power) R.powerDeals++;
                const q1 = st.seq[st.seq.length - 2]; if (q1 && q1.str === d.str && q1.note === d.note) R.viol.push([cfg.power, d.note, d.str, 'twice in a row']);
                if (clashes) { R.forced++; if (cfg.power) R.powerForced++; if (pool.some(c => !oracle(c, prev))) R.viol.push([cfg.power, d.note, d.str, prev.map(x => x.note + x.str).join(',')]); }
              }
            }
          }
        } finally { Math.random = origRandom; }
        return JSON.stringify(R);
      })()`)); } catch (e) { flag('ncDeal / ncClash threw with no coach.js loaded: ' + e.message + ' \u2014 in tap mode coach.js never loads, so Start would do nothing'); }
      if (dealOut) {
      stats.clashCalls = dealOut.clashCalls; stats.deals = dealOut.deals; stats.forced = dealOut.forced; stats.powerDeals = dealOut.powerDeals; stats.powerForced = dealOut.powerForced;
      for (const b of dealOut.clashBad.slice(0, 3)) flag('ncClash disagrees with the oracle (' + J(b) + ') \u2014 a card could follow one whose strum is still ringing as an answer to it (or a single-note rule changed)');
      if (dealOut.clashBad.length > 3) flag('... and ' + (dealOut.clashBad.length - 3) + ' more ncClash disagreements');
      for (const v of dealOut.viol.slice(0, 3)) flag('ncDeal dealt ' + J(v) + ' though a card that does not clash was available');
      if (dealOut.viol.length > 3) flag('... and ' + (dealOut.viol.length - 3) + ' more ncDeal deals of a clashing card');
      }

      // ncListen: what it asks coachSettlePitch for, and which fret an answer resolves.
      const seen = [], resolved = [], micFlags = [];
      let reply = null;
      setG('COACH_PITCH_GATE', 0.01); setG('coachOnsetAt', 0); setG('coachMicLatencyMs', () => 0); setG('RNW_POWER_CLARITY', RNW);
      setG('coachReadFrame', () => 1);
      setG('coachSettlePitch', (st, targets, rms, floorT, clarity) => { seen.push({ targets: Array.from(targets), clarity: clarity === undefined ? 'undefined' : J(Array.from(clarity)) }); return reply; });
      setG('ncResolve', (st, i, res, info) => { resolved.push({ i, res, fret: info && info.fret }); if (res === 'hit') micFlags.push(!!(info && info.mic)); });
      const ncListen = run('ncListen');
      const cardOf = (cfgObj, note, str) => JSON.parse(run('(function(){ return JSON.stringify(ncPool(' + J(cfgObj) + ', "all").find(p => p.note === ' + J(note) + ' && p.str === ' + J(str) + ')); })()'));
      const E5 = cardOf({ strings: ['lowE', 'A'], power: true, minFret: 0, maxFret: 12 }, 'E5', 'lowE');       // roots 40 (fret 0) and 52 (fret 12)
      const A5 = cardOf({ strings: ['lowE', 'A'], power: true, minFret: 0, maxFret: 12 }, 'A5', 'A');         // roots 45 and 57
      const B5 = cardOf({ strings: ['lowE', 'A'], power: true, minFret: 0, maxFret: 12 }, 'B5', 'lowE');     // one root, 47 (fret 7): the octave below is a pitch YIN can read
      const E1 = cardOf({ strings: ['lowE', 'A'], power: false, minFret: 0, maxFret: 12 }, 'E', 'lowE');      // the same note as a single-note card
      if (!E5 || !A5 || !B5 || !E1 || J(B5.midis) !== J([47]) || J(E5.midis) !== J([40, 52]) || J(E5.frets) !== J([0, 12])) flag('1cd could not build its test cards (E5 on the low E string should have roots 40 and 52 at frets 0 and 12) — ncPool changed');
      else {
        const listen = (cfgPower, seq, idx, grace, answer) => {
          seen.length = 0; resolved.length = 0; reply = answer;
          const st = { key: 'chk', cfg: { power: cfgPower }, seq: seq.map(c => Object.assign({}, c, { res: null })), idx, graceIdx: grace, graceFrom: 1e9, readings: [], attackT: 0, heard: null };
          ncListen(st, 0);
          stats.listens++;
          return { seen: seen.slice(), resolved: resolved.slice(), st };
        };
        const tones = c => c.midis.flatMap(r => [r - 12, r, r + 12]);
        // What it asks for.
        let r1 = listen(true, [E5], 0, null, null);
        if (J(r1.seen[0] && r1.seen[0].targets) !== J(tones(E5))) flag('ncListen (power) asks coachSettlePitch for ' + J(r1.seen[0] && r1.seen[0].targets) + ', expected the octave below, root and octave of each root (no 5th) ' + J(tones(E5)));
        if (!r1.seen[0] || r1.seen[0].clarity !== J(Array.from(RNW))) flag('ncListen (power) reads at clarity ' + (r1.seen[0] && r1.seen[0].clarity) + ', expected RNW_POWER_CLARITY ' + J(Array.from(RNW)) + ' — at the single-note gate YIN finds no pitch in most strums');
        r1 = listen(false, [E1], 0, null, null);
        if (J(r1.seen[0] && r1.seen[0].targets) !== J(E1.midis) || r1.seen[0].clarity !== 'undefined') flag('ncListen (single note) asks for ' + J(r1.seen[0]) + ', expected exactly its note ' + J(E1.midis) + ' at the default clarity — ca-23 must not change');
        // The card in mic grace is listened for too.
        r1 = listen(true, [A5, E5], 1, 0, null);
        if (J(r1.seen[0] && r1.seen[0].targets) !== J(tones(E5).concat(tones(A5)))) flag('ncListen (power, mic grace) asks for ' + J(r1.seen[0] && r1.seen[0].targets) + ', expected this card\'s tones then the grace card\'s ' + J(tones(E5).concat(tones(A5))));
        // Which fret an answer resolves (the exact root first; the octave and the octave below answer the root they belong to; the 5th answers nothing).
        const hit = (pw, card, m) => { const r = listen(pw, [card], 0, null, m); return r.resolved.length ? r.resolved.map(x => x.res + '@' + x.fret).join(',') : 'none'; };
        for (const [m, want] of [[40, 'hit@0'], [28, 'hit@0'], [47, 'none'], [52, 'hit@12'], [59, 'none'], [64, 'hit@12'], [41, 'none'], [45, 'none'], [38, 'none'], [53, 'none']]) {
          const got = hit(true, E5, m);
          if (got !== want) flag('ncListen (power E5, roots at frets 0 and 12): a heard ' + m + ' resolves \'' + got + '\', expected \'' + want + '\'');
        }
        for (const [m, want] of [[40, 'hit@0'], [52, 'hit@12'], [47, 'none'], [59, 'none'], [64, 'none']]) {
          const got = hit(false, E1, m);
          if (got !== want) flag('ncListen (single-note E): a heard ' + m + ' resolves \'' + got + '\', expected \'' + want + '\' — single-note Note Call answers only its exact pitch');
        }
        // One root: the octave below it answers (the pitch a strum of its root and 5th is read as), its 5th (54) and a neighbouring pitch do not.
        for (const [m, want] of [[47, 'hit@7'], [35, 'hit@7'], [54, 'none'], [59, 'hit@7'], [34, 'none'], [36, 'none'], [46, 'none'], [48, 'none']]) {
          const got = hit(true, B5, m);
          if (got !== want) flag('ncListen (power B5, one root at fret 7): a heard ' + m + ' resolves \'' + got + '\', expected \'' + want + '\'');
        }
        // The grace path answers the OLD card with the same rule.
        for (const [pw, card, m, want] of [[true, E5, 28, 'hit@0'], [true, E5, 64, 'hit@12'], [true, E5, 47, 'none'], [true, E5, 41, 'none'], [false, E1, 47, 'none'], [false, E1, 40, 'hit@0']]) {
          const r = listen(pw, [card, pw ? A5 : cardOf({ strings: ['lowE', 'A'], power: false, minFret: 0, maxFret: 12 }, 'A', 'A')], 1, 0, m);
          const got = r.resolved.length ? r.resolved.map(x => x.i + ':' + x.res + '@' + x.fret).join(',') : 'none';
          if (got !== (want === 'none' ? 'none' : '0:' + want)) flag('ncListen (' + (pw ? 'power' : 'single note') + ', mic grace): a heard ' + m + ' for the old card resolves \'' + got + '\', expected \'' + (want === 'none' ? 'none' : '0:' + want) + '\'');
        }
        // Every hit that came from the MIC says so (the main path and the grace path), so ncResolve can name both frets of a two-fret card.
        stats.micHits = micFlags.length;
        if (!micFlags.length || micFlags.includes(false)) flag('ncListen resolved ' + micFlags.filter(x => !x).length + ' of ' + micFlags.length + ' mic hits without { mic: true } \u2014 ncResolve could not tell a heard strum from a tap, and would name one fret for a chord the mic cannot place');
      }
    }
  } finally { undo(); }

  // Every ncp.* string, rendered.
  {
    const I18N = loadI18nTable();
    const keys = new Set();
    const origNcK = ctx.ncK;
    ctx.ncK = (pw, nm) => { const k = origNcK(pw, nm); keys.add(k); return k; };
    const hadFlash = Object.prototype.hasOwnProperty.call(ctx, 'flashClass');   // fab-tools.js, not in the context: the board marks flash and nothing here looks at them
    if (!hadFlash) ctx.flashClass = () => {};
    try {
      run(`(function(){
        renderNoteCall({ type: 'notecall', power: true, strings: ['lowE', 'A'], minFret: 0, maxFret: 12 }, 'chk1', 'w');
        const st = noteCalls['chk1'];
        for (const answer of [true, false]) for (const coach of [true, false]) for (let lv = 0; lv < NC_LEVELS.length; lv++) {
          st.answer = answer; st.coach = coach; st.level = lv; st.prog.lv = NC_LEVELS.length; ncSetupHtml('chk1');
        }
        const p = Object.assign({}, ncPool(st.cfg, 'all')[0], { res: null });
        ncPromptHtml(p);
        st.key = 'chk1'; st.seq = [p]; st.idx = 0; st.requeue = [];
        ncResolve(st, 0, 'hit', { fret: p.frets[0] });
        p.res = null; ncResolve(st, 0, 'miss', { tap: { k: 'A', f: 7 } });
        p.res = null; ncResolve(st, 0, 'miss', null);
        p.res = null; ncReveal(st);
        st.lvIdx = 0; st.L = ncLevel(st, 0); st.idx = -1; st.seq = [Object.assign({}, p, { res: 'miss' })];
        ncFinish('chk1');
      })()`);
    } catch (e) { flag('rendering Note Call in power mode threw ' + e.message); }
    finally { ctx.ncK = origNcK; if (!hadFlash) delete ctx.flashClass; try { run('delete noteCalls["chk1"]'); } catch { /* best effort */ } }
    const defined = Object.keys(I18N).filter(k => k.startsWith('ncp.'));
    stats.keys = keys.size;
    for (const k of keys) {
      if (!k.startsWith('ncp.')) flag('power mode asked for \'' + k + '\' — ncK lost the power flag, the student would read the single-note wording');
      else if (!I18N[k] || !I18N[k].en || !I18N[k].es) flag('i18n ' + k + ' is missing its English or Spanish');
      else if (I18N[k].es === I18N[k].en) flag('i18n ' + k + ': the Spanish is just the English');
    }
    for (const k of defined) if (!keys.has(k)) flag('i18n ' + k + ' is defined but no Note Call power screen shows it (dead, or a screen 1cd does not reach)');
    if (defined.length !== EXPECT.keys) flag('1cd sees ' + defined.length + ' ncp.* keys, pinned at ' + EXPECT.keys + ' — a new power-mode string needs its Spanish and a screen that shows it (update the pin on purpose)');
  }
  /* What a HIT says about the fret (Friday check R1-1, Jonathan 2026-10-31;
     tightened after the review, R3-3). On a card with two frets (E5 on the low E
     string: 0 and 12) the mic cannot reliably tell the octaves apart and credited
     fret 0 when the student played fret 12, so a MIC hit now names every fret
     ("fret 0 / 12", "traste 0 / 12") and flashes both markers green on the board;
     a tap names and flashes only the fret tapped, and a card with one fret, or
     any single-note card, names and flashes its one fret. The real ncResolve (mic
     hits) and the real ncTap (taps, scored and play-along) are run on a two-fret
     power card, a one-fret power card and a two-fret single-note card, in English
     and Spanish. The text is read back AND every flashClass call is recorded, so
     the check sees which marker flashed, on which string, in which colour. */
  {
    const origGet = ctx.document.getElementById, recs = {};
    ctx.__flashes = [];
    ctx.document.getElementById = id => recs[id] || (recs[id] = Object.assign(origGet(id), { id }));
    const hadFlash2 = Object.prototype.hasOwnProperty.call(ctx, 'flashClass'), origFlash = ctx.flashClass;
    ctx.flashClass = (el, cls) => { ctx.__flashes.push((el && el.id) + '|' + cls); };
    try {
      for (const lang of ['en', 'es']) {
        run('setLang(' + J(lang) + ')');
        const o = JSON.parse(run(`(function(){
          const o = {};
          const mk = (sid, power) => { renderNoteCall({ type: 'notecall', power, strings: ['lowE', 'A'], minFret: 0, maxFret: 12 }, sid, 'w'); const st = noteCalls[sid]; st.key = sid; return st; };
          const reset = (st, card, mode) => { __flashes.length = 0; st.seq = [Object.assign({}, card, { res: null })]; st.idx = 0; st.requeue = []; st.phase = 'play'; st.mode = mode; st.locked = false; };
          const read = st => ({ t: document.getElementById('nc-fb-' + st.key).textContent, f: __flashes.slice() });
          const mic = (st, card, fret) => { reset(st, card, 'levels'); ncResolve(st, 0, 'hit', { fret, mic: true }); return read(st); };
          const tap = (st, card, fret, mode) => { reset(st, card, mode); ncTap(st.key, card.str, fret); return read(st); };
          const pw = mk('chk-fb1', true), sn = mk('chk-fb2', false);
          const two = ncPool(pw.cfg, 'all').find(c => c.frets.length === 2), one = ncPool(pw.cfg, 'all').find(c => c.frets.length === 1), sTwo = ncPool(sn.cfg, 'all').find(c => c.frets.length === 2);
          o.two = two && two.frets; o.twoStr = two && two.str; o.one = one && one.frets; o.oneStr = one && one.str; o.sTwo = sTwo && sTwo.frets; o.sTwoStr = sTwo && sTwo.str;
          if (two && one && sTwo) {
            o.micTwo = mic(pw, two, two.frets[1]);
            o.micTwo0 = mic(pw, two, two.frets[0]);
            o.tapTwo = tap(pw, two, two.frets[1], 'levels');
            o.tapTwoAnswer = tap(pw, two, two.frets[1], 'answer');
            o.micOne = mic(pw, one, one.frets[0]);
            o.micSingle = mic(sn, sTwo, sTwo.frets[1]);
          }
          delete noteCalls['chk-fb1']; delete noteCalls['chk-fb2'];
          return JSON.stringify(o);
        })()`));
        const W = lang === 'en' ? 'fret' : 'traste';
        if (!o.two || !o.one || !o.sTwo) { flag(lang + ': 1cd could not build a two-fret power card, a one-fret power card and a two-fret single-note card for the hit feedback (' + J(o) + ') — ncPool changed'); continue; }
        const both = W + ' ' + o.two.join(' / ');
        const want = (sid, str, frets) => new Set(frets.map(f => 'fgm-' + sid + '-' + str + '-' + f + '|fg-good'));
        const flashesAre = (r, set) => { const got = new Set(r.f); return got.size === set.size && [...set].every(x => got.has(x)) && r.f.every(x => set.has(x)); };
        const show = r => J(r.f);
        if (!o.micTwo.t.includes(both)) flag(lang + ': a mic hit on a two-fret power card says \'' + o.micTwo.t + '\', expected it to name both frets (\'' + both + '\')');
        if (!flashesAre(o.micTwo, want('chk-fb1', o.twoStr, o.two))) flag(lang + ': a mic hit on a two-fret power card flashes ' + show(o.micTwo) + ', expected both frets ' + J(o.two) + ' on the ' + o.twoStr + ' string, green');
        if (!o.micTwo0.t.includes(both)) flag(lang + ': a mic hit credited to fret ' + o.two[0] + ' says \'' + o.micTwo0.t + '\', expected both frets (\'' + both + '\')');
        if (!flashesAre(o.micTwo0, want('chk-fb1', o.twoStr, o.two))) flag(lang + ': a mic hit credited to fret ' + o.two[0] + ' flashes ' + show(o.micTwo0) + ', expected both frets green');
        for (const [name, r] of [['TAP (scored)', o.tapTwo], ['TAP (play-along)', o.tapTwoAnswer]]) {
          if (!r.t.includes(W + ' ' + o.two[1]) || r.t.includes(' / ')) flag(lang + ': a ' + name + ' on fret ' + o.two[1] + ' of a two-fret power card says \'' + r.t + '\', expected just that fret');
          if (!flashesAre(r, want('chk-fb1', o.twoStr, [o.two[1]]))) flag(lang + ': a ' + name + ' on fret ' + o.two[1] + ' flashes ' + show(r) + ', expected only that fret, green');
        }
        if (!o.micOne.t.includes(W + ' ' + o.one[0]) || o.micOne.t.includes(' / ')) flag(lang + ': a mic hit on a one-fret power card says \'' + o.micOne.t + '\', expected just fret ' + o.one[0]);
        if (!flashesAre(o.micOne, want('chk-fb1', o.oneStr, o.one))) flag(lang + ': a mic hit on a one-fret power card flashes ' + show(o.micOne) + ', expected only fret ' + o.one[0] + ' on the ' + o.oneStr + ' string, green');
        if (!o.micSingle.t.includes(W + ' ' + o.sTwo[1]) || o.micSingle.t.includes(' / ')) flag(lang + ': a mic hit on a single-note card says \'' + o.micSingle.t + '\', expected just fret ' + o.sTwo[1] + ' (a single note is exact)');
        if (!flashesAre(o.micSingle, want('chk-fb2', o.sTwoStr, [o.sTwo[1]]))) flag(lang + ': a mic hit on a single-note card flashes ' + show(o.micSingle) + ', expected only fret ' + o.sTwo[1] + ' on the ' + o.sTwoStr + ' string, green');
        stats.fbRenders += 6;
      }
    } catch (e) { flag('rendering the Note Call hit feedback threw ' + e.message); }
    finally { ctx.document.getElementById = origGet; delete ctx.__flashes; if (hadFlash2) ctx.flashClass = origFlash; else delete ctx.flashClass; try { run('setLang("en")'); } catch { /* best effort */ } }
  }
  if (bad === 0) ok(EXPECT.power + ' power drills on ca-43 (frets ' + EXPECT.ranges.map(r => r.join('-')).join(' / ') + '); ' + stats.cards + ' cards x 53 pitches = ' + stats.answers + ' answers match the oracle (single-note cards exactly as before); ' + stats.clashCalls + ' ncClash calls match an oracle and ' + stats.deals + ' seeded ncDeal deals (no coach.js loaded) never dealt a clashing card while a clean one existed (' + stats.powerForced + ' of ' + stats.powerDeals + ' power deals had to, every card left clashing; ' + (stats.forced - stats.powerForced) + ' of ' + (stats.deals - stats.powerDeals) + ' single-note); ' + stats.listens + ' ncListen calls (targets, clarity, main and grace fret); ' + stats.micHits + ' mic hits all flagged as the mic; ' + stats.fbRenders + ' hit-feedback renders (a mic hit on a two-fret power card names and flashes both frets; a tap, scored or play-along, a one-fret card and a single note name and flash one); ' + stats.keys + ' of ' + EXPECT.keys + ' ncp.* strings rendered, EN + ES');
}

/* 1bf2. LYRIC-SHEET CARDS (card.sheet — ca-38, Jonathan 2026-10-19). The
   card draws a chord sheet PDF and walks a dot over its chord names in
   reading order: name n is the card's n-th chord CHANGE. If the card's
   notes change (ca-38 shares ca-29's sections, so a ca-29 edit counts) the
   dot walks onto the wrong chords with nothing to say so but the console
   preview. Checked here, without opening the PDF (pdf.js does not run in
   Node; the preview compares the PDF itself):
   - the PDF exists under sheets/ and pdf.js is vendored where app.js loads it;
   - `sheetChords` is set and equals the chord changes the notes make;
   - `sheetColumns` is 1 or left out (ca-44 is the one-column sheet);
   - `sheetNamedAgain` names real sections that start on a still-ringing chord;
   - the renderer is wired: caCardBodyHtml() builds pcSheetHtml(), pcFrame()
     feeds pcSheetStrip(), pcStop() calls pcSheetStopped(). */
function checkSheetCards() {
  head('1bf2. Lyric-sheet practice cards');
  let bad = 0, n = 0;
  const flag = m => { err(m); problems++; bad++; };
  let activities = [];
  try {
    const src = readFileSync(join(ROOT, 'class-activities.js'), 'utf8');
    const sandbox = { console };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(src, sandbox, { filename: 'class-activities.js' });
    activities = sandbox.CLASS_ACTIVITIES || [];
  } catch { return; /* reported by 1d */ }
  for (const a of activities) {
    if (!a || !a.card || !a.card.sheet) continue;
    n++;
    const c = a.card, w = a.id;
    if (a.view !== 'card') flag(`${w}: card.sheet only renders on a view:'card' activity`);
    if (typeof c.sheet !== 'string' || !/^sheets\/[^/]+\.pdf$/i.test(c.sheet)) { flag(`${w}: card.sheet "${c.sheet}" should be a PDF in sheets/ (sheets/<name>.pdf)`); continue; }
    if (!existsSync(join(ROOT, c.sheet))) flag(`${w}: ${c.sheet} is not in the repo — the card would say the sheet did not load`);
    // sheetColumns (2026-11-03, ca-44): 1 = one column of chords over lyrics; left out = two columns. Any other value would read as two.
    if (c.sheetColumns !== undefined && c.sheetColumns !== 1) flag(`${w}: card.sheetColumns is ${JSON.stringify(c.sheetColumns)} — it is 1 (a one-column sheet) or left out (two columns)`);
    /* sheetNamedAgain (2026-11-03, ca-45): English section labels where the
       sheet names the first chord of EVERY lap, even when it is still
       ringing — the dot steps onto that name. Each must be a section of this
       card with at least one lap that starts on the chord still ringing
       (else the entry does nothing). */
    const again = c.sheetNamedAgain === undefined ? [] : c.sheetNamedAgain;
    if (!Array.isArray(again) || again.some(l => typeof l !== 'string')) flag(`${w}: card.sheetNamedAgain should be a list of section labels`);
    const secs = Array.isArray(c.sections) ? c.sections : [];
    if (Array.isArray(again)) for (const l of again) if (!secs.some(s => s && s.label === l)) flag(`${w}: card.sheetNamedAgain names "${l}", which is not a section of this card`);
    let changes = 0, prev = null;
    for (const s of secs) {
      const reps = Number.isInteger(s && s.reps) ? s.reps : 1;
      const named = Array.isArray(again) && again.includes(s.label);
      const first = (s.notes || [])[0];
      let ringing = 0;
      for (let r = 0; r < reps; r++) (s.notes || []).forEach((nt, ni) => {
        if (named && ni === 0 && first && !first.rest && nt.note === prev) ringing++;
        if (!nt.rest && (nt.note !== prev || (named && ni === 0))) { changes++; prev = nt.note; }
      });
      if (named && ringing === 0) flag(`${w}: card.sheetNamedAgain names "${s.label}", but no lap of it starts on the chord still ringing — every lap is a change already`);
    }
    if (!Number.isInteger(c.sheetChords)) flag(`${w}: card.sheetChords should say how many chord names the sheet has (the notes make ${changes} chord changes)`);
    else if (c.sheetChords !== changes) flag(`${w}: the notes make ${changes} chord changes but card.sheetChords is ${c.sheetChords} — the dot would walk onto the wrong chords. Fix the notes, or the sheet and this number`);
  }
  for (const f of ['vendor/pdfjs/pdf.min.js', 'vendor/pdfjs/pdf.worker.min.js']) {
    if (n && !existsSync(join(ROOT, f))) flag(`${f} is missing — no chord sheet can draw`);
  }
  let appSrc = '';
  try { appSrc = readFileSync(join(ROOT, 'app.js'), 'utf8'); } catch { flag('app.js unreadable — 1bf2 cannot check the renderer'); return; }
  const body = fn => { const b = jsFunctionBody(appSrc, fn); return b === null ? null : stripJsComments(b); };
  const pins = [['caCardBodyHtml', /pcSheetHtml\(/, 'build the sheet (pcSheetHtml)'], ['pcFrame', /pcSheetStrip\(/, 'feed "This bar" (pcSheetStrip)'], ['pcPaint', /pcSheetPaint\(/, 'move the dot (pcSheetPaint)'], ['pcStop', /pcSheetStopped\(/, 'reset the sheet (pcSheetStopped)']];
  for (const [fn, re, what] of pins) {
    const b = body(fn);
    if (b === null || !re.test(b)) flag(`app.js: ${fn}() must ${what} — a lyric-sheet card would not work`);
  }
  if (n === 0) { flag('1bf2 found no lyric-sheet card — it cannot see what it is supposed to guard'); return; }
  if (bad === 0) ok(`${n} lyric-sheet card${n === 1 ? '' : 's'} — sheet in the repo, chord count matches the notes, pdf.js vendored, renderer wired`);
}

/* 1bv. CHORD-GRID PRACTICE CARDS (card.chordGrid — Jonathan, 2026-10-26).
   The record's strumming is not consistent through a song, so a chord card's
   TAB shows each chord ONCE, where it really starts (a beat or a "+"), four
   bars to a row, and the cursor moves on the BEATS only. It is display only —
   no `notes` array changed — so what can go wrong is quiet: a card opted in
   that is really a riff (ca-31's triplets), a chord that starts between two
   eighths, a lyric line that loses its row, a "+" column that gets a
   data-beat (the cursor would land on it), or a repaint keyed on the note
   again (the cursor would step on a "+"). Checked by RENDERING and EXECUTING
   the real app.js in the 0b context, not by finding the calls:
   - the opted-in cards are exactly the eleven below (ca-31 and every
     single-note card stay out); every section of one that is not
     `chordGrid:false` holds only chords (`frets`) and rests, and every
     chord (and rest) starts on the eighth grid;
   - every lyric line (`rowLabels`) of such a section starts on a bar line,
     so pcGridRows keeps its label;
   - ca-29 renders exactly one chord-name button per STRUM (98 for its
     7 sections), data-beat sits on every BEAT column and never on a "+"
     (even columns only, counting up beat by beat, never on a faint "+"
     count cell), and an all-grid card draws no Counts switch;
   - a single-note card (ca-10) renders with no data-beat at all;
   - pcLocate + pcLocKey: on ca-29 the repaint key is the same at a beat and
     at the "+" after it, and steps once per beat; on ca-10 it still steps
     per note. */
const CHORD_GRID_BASS_CARDS = ['ca-35'];   // practice cards with an alternating-bass switch (bassNotes) — see BASS NOTES in 1bv
const CHORD_GRID_BASS_START = { 'ca-35': 'on' };   // how each opens (Jonathan, 2026-10-27: start on Alternating bass) — a decision, not a default
const CHORD_GRID_BASS_MARKS = 160;          // bass notes drawn, every bass card x chord view, bass on — see BASS NOTES in 1bv
const CHORD_GRID_HELD_LABELS = 54;   // rows (both views) that open on a held "(Chord)" — see the column-0 check below
const CHORD_GRID_CARDS = ['ca-29', 'ca-30', 'ca-32', 'ca-33', 'ca-35', 'ca-36', 'ca-37', 'ca-39', 'ca-40', 'ca-41', 'ca-42'];
function checkChordGridCards(ctx) {
  head('1bv. Chord-grid practice cards');
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  if (!ctx) { flag('1bv cannot run — the 0b render context is unavailable'); return; }
  const acts = vm.runInContext('window.CLASS_ACTIVITIES || []', ctx);
  const fn = name => vm.runInContext(`typeof ${name} === "function" ? ${name} : null`, ctx);
  const [pcChordGrid, pcGridRows, pcLayout, pcLocate, pcLocKey, caCardBodyHtml] = ['pcChordGrid', 'pcGridRows', 'pcLayout', 'pcLocate', 'pcLocKey', 'caCardBodyHtml'].map(fn);
  if (![pcChordGrid, pcGridRows, pcLayout, pcLocate, pcLocKey, caCardBodyHtml].every(Boolean)) { flag('app.js: pcChordGrid / pcGridRows / pcLayout / pcLocate / pcLocKey / caCardBodyHtml is gone — the chord grid has no renderer'); return; }
  const optedIn = acts.filter(a => a && a.card && a.card.chordGrid).map(a => a.id);
  if ([...optedIn].sort().join() !== [...CHORD_GRID_CARDS].sort().join()) flag(`the cards with card.chordGrid are [${optedIn.join(', ')}], expected [${CHORD_GRID_CARDS.join(', ')}] — turning a card on or off is a decision (the work order's table); update CHORD_GRID_CARDS in the same edit`);
  let sections = 0, events = 0, labelled = 0;
  for (const a of acts.filter(x => x && x.card && x.card.chordGrid)) {
    const L = pcLayout(a), bpb = L.tr.beatsPerBar;
    L.sections.forEach((S, si) => {
      const w = `${a.id} · ${S.s.label}`;
      if (!S.grid) { if (S.s.chordGrid !== false) flag(`${w}: not drawn as a grid, though card.chordGrid is on and the section does not opt out`); return; }
      sections++;
      S.notes.forEach((n, ni) => { if (!n.rest && !Array.isArray(n.frets)) flag(`${w}: note ${ni + 1} is a single note — a chord-grid section holds only chords and rests (put chordGrid:false on this section)`); });
      /* The fold, worked out independently: one event per run of the same chord
         name or of rests, beats adding up, and every event carrying its bar
         (the lyric sheet's "This bar" strip reads it). */
      const evs = pcChordGrid(S.notes, bpb);
      let runs = 0, prevKey = null, total = 0;
      S.notes.forEach(n => { const k = n.rest ? '\u0000rest' : n.note; if (k !== prevKey) { runs++; prevKey = k; } total += n.beats > 0 ? n.beats : 1; });
      if (evs.length !== runs) flag(`${w}: the fold makes ${evs.length} events from ${runs} runs of the same chord or rest — a rest must end a chord and never join it`);
      if (Math.abs(evs.reduce((x, e) => x + e.beats, 0) - total) > 1e-6) flag(`${w}: the folded events add up to ${evs.reduce((x, e) => x + e.beats, 0)} beats, the notes to ${total}`);
      for (const ev of evs) if (ev.bar !== Math.floor(ev.start / bpb + 1e-6)) flag(`${w}: ${ev.name || 'a rest'} says it is in bar ${ev.bar}, but it starts at beat ${ev.start} (${bpb} to a bar)`);
      for (const ev of evs) {
        events++;
        if (Math.abs(ev.start * 2 - Math.round(ev.start * 2)) > 1e-6) flag(`${w}: ${ev.rest ? 'a rest' : ev.name} starts at beat ${ev.start}, between two eighth-note columns — the grid cannot place it`);
      }
      const rl = S.s.rowLabels;
      if (Array.isArray(rl) && Array.isArray(S.s.rows) && rl.length === S.s.rows.length) {
        labelled += rl.length;
        const kept = pcGridRows(S, bpb).filter(r => r.label).length;
        if (kept !== rl.length) flag(`${w}: ${rl.length - kept} of ${rl.length} lyric lines lost their row — a line must start on a bar line to keep its label on a four-bar grid`);
      }
    });
  }
  // ca-29 as rendered.
  const c29 = acts.find(a => a.id === 'ca-29');
  const norm = html => String(html);
  if (!c29) flag('ca-29 is gone — 1bv renders it');
  else {
    let html = '';
    try { html = norm(caCardBodyHtml(c29)); } catch (e) { flag(`caCardBodyHtml(ca-29) threw: ${e.message}`); }
    const grids = html.split('class="tab-grid chord-grid"').slice(1);
    const names = (html.match(/class="tab-note-btn tab-chord-btn"/g) || []).length;
    if (grids.length !== 7) flag(`ca-29 renders ${grids.length} chord-grid rows, expected 7 (one per section: each is 2 bars)`);
    if (names !== 98) flag(`ca-29 renders ${names} chord-name buttons, expected 98 — one per strum (A5 x4, G5 x4, F5 x3, G5 x3 in each of its 7 sections; card.everyStrum)`);
    let beatsSeen = 0;
    grids.forEach((g, gi) => {
      // The first string row only: label, then one cell per column.
      const rowE = g.split('tab-str-label">e<')[1] || '';
      const cells = (rowE.split('tab-str-label">B<')[0].match(/<div class="tab-cell"[^>]*>/g) || []);
      const beats = [];
      cells.forEach((c, i) => { const m = /data-beat="(\d+)"/.exec(c); if (m) { beats.push(+m[1]); if (i % 2) flag(`ca-29 row ${gi + 1}: data-beat on column ${i} — a "+" column; the cursor would land on it`); } else if (i % 2 === 0) flag(`ca-29 row ${gi + 1}: beat column ${i} has no data-beat — the cursor would skip it`); });
      if (beats.join() !== [0, 1, 2, 3, 4, 5, 6, 7].join()) flag(`ca-29 row ${gi + 1}: data-beat runs [${beats.join(',')}], expected 0..7`);
      beatsSeen += beats.length;
      // The count row: beats carry data-beat, the faint "+" never does.
      for (const m of g.matchAll(/<div class="tab-count tab-count-held"[^>]*>/g)) if (/data-beat/.test(m[0])) flag(`ca-29 row ${gi + 1}: a "+" count cell carries data-beat`);
    });
    const attrs = (html.match(/data-beat="/g) || []).length;
    if (attrs !== 7 * 8 * 7) flag(`ca-29 renders ${attrs} data-beat attributes, expected ${7 * 8 * 7} (7 sections x 8 beats x (6 string cells + 1 count cell))`);
    if (/pc-counts/.test(html)) flag('ca-29 draws a Counts switch — a card made only of chord grids always shows its count and needs none');
    if (!/Each strum has its chord name/.test(html) || /Each chord is shown once/.test(html)) flag('ca-29 does not show the every-strum directions (ca.cardStrumDirections) \u2014 every strum has its chord name, so "each chord is shown once" would be false');
    if (c29.card.restWord !== false) flag('ca-29 lost card.restWord:false — the bar-2 rest would draw the word "Stop" again');
    if (/class="tab-rest-lab"/.test(html)) flag('ca-29 draws a rest word — the bar-2 rest is left empty (card.restWord:false)');
    if (!c29.card.everyStrum) flag("ca-29 lost card.everyStrum — the grid would fold A5 x4 into one name again");
    // The cursor: one repaint key per beat, none on a "+".
    const L = pcLayout(c29), S0 = L.sections[0], bpb = L.tr.beatsPerBar;
    const keys = [];
    for (let i = 0; i < S0.bars * bpb * 2; i++) { const loc = pcLocate(L, i / 2 / bpb); keys.push(pcLocKey(L, loc)); if (loc.beat !== Math.floor(i / 2)) flag(`pcLocate(ca-29, eighth ${i}) says beat ${loc.beat}, expected ${Math.floor(i / 2)}`); }
    for (let b = 0; b < S0.bars * bpb; b++) if (keys[2 * b] !== keys[2 * b + 1]) flag(`ca-29: the repaint key changes at the "+" after beat ${b} — the cursor would step onto a "+"`);
    if (new Set(keys).size !== S0.bars * bpb) flag(`ca-29: ${new Set(keys).size} repaint keys across ${S0.bars * bpb} beats — the cursor must step once per beat`);
  }
  /* Every opted-in card, both views where it has one, rendered: the rows are
     four bars wide, every bar after the first in a row has a bar line, and on
     each section's page data-beat on the first string runs 0..bars x beats
     once, in order, across ALL its rows (a counter that restarted on each
     row lit several rows at once and went dark after beat 15 — the reviewer's
     M19). A rest draws its word. Bar lines, rest words and the staff's
     closing edge are counted, not just present. */
  let rowsSeen = 0, restWords = 0, col0Rows = 0, heldLabels = 0;
  for (const a of acts.filter(x => x && x.card && x.card.chordGrid)) {
    for (const mode of ['full', 'power']) {
      if (mode === 'power' && !a.chordVersions) continue;
      let html = '', L = null;
      try {
        vm.runInContext(`caChordModes[${JSON.stringify(a.id)}] = ${JSON.stringify(mode)}`, ctx);
        html = String(caCardBodyHtml(a));
        // The layout of the view just rendered (the chord names differ between views).
        L = pcLayout(vm.runInContext(`caView(CLASS_ACTIVITIES.find(x => x.id === ${JSON.stringify(a.id)}))`, ctx));
      } catch (e) { flag(`caCardBodyHtml(${a.id}, ${mode}) threw: ${e.message}`); continue; }
      finally { try { vm.runInContext(`delete caChordModes[${JSON.stringify(a.id)}]`, ctx); } catch {} }
      const bpb = L.tr.beatsPerBar;
      const pages = html.split('<div class="tab-page pc-page"').slice(1);
      if (pages.length !== L.sections.length) flag(`${a.id} (${mode}): ${pages.length} section pages for ${L.sections.length} sections`);
      pages.forEach((pg, si) => {
        const S = L.sections[si];
        if (!S || !S.grid) { if (S && /chord-grid/.test(pg)) flag(`${a.id} · ${S.s.label}: a note-by-note section drew a chord grid`); return; }
        const grids = pg.split('class="tab-grid chord-grid"').slice(1);
        const need = Math.ceil(S.bars / 4);
        if (grids.length < need) flag(`${a.id} · ${S.s.label} (${mode}): ${grids.length} rows for ${S.bars} bars — four bars to a row needs at least ${need}`);
        const cols = Math.min(4, S.bars) * bpb * 2;
        const beats = [];
        grids.forEach((g, gi) => {
          rowsSeen++;
          const head = /grid-template-columns:28px repeat\((\d+),1fr\)/.exec(g);
          if (!head || +head[1] !== cols) flag(`${a.id} · ${S.s.label} row ${gi + 1}: ${head ? head[1] : '?'} columns, expected ${cols} (min(4, ${S.bars} bars) x ${bpb} beats x 2)`);
          const rowE = g.split('tab-str-label">e<')[1] || '';
          const cells = rowE.split('tab-str-label">B<')[0].match(/<div class="tab-cell[^"]*"[^>]*>/g) || [];
          if (cells.length !== cols) flag(`${a.id} · ${S.s.label} row ${gi + 1}: ${cells.length} string cells, expected ${cols}`);
          const used = cells.filter(c => !/tab-pad/.test(c)).length;
          cells.forEach((c, i) => { const m = /data-beat="(\d+)"/.exec(c); if (m) beats.push(+m[1]); else if (i % 2 === 0 && !/tab-pad/.test(c)) flag(`${a.id} · ${S.s.label} row ${gi + 1}: beat column ${i} has no data-beat`); });
          const lines = (g.match(/class="tab-bar-line"/g) || []).length;
          if (lines !== Math.ceil(used / (bpb * 2)) - 1) flag(`${a.id} · ${S.s.label} row ${gi + 1}: ${lines} bar lines for ${used / (bpb * 2)} bars — one between each pair`);
          if (!new RegExp(`class="tab-box" style="grid-column:2/${used + 2};`).test(g)) flag(`${a.id} · ${S.s.label} row ${gi + 1}: the staff does not end at the row's last bar (${used} columns)`);
          if (!/tab-chord-pad/.test(g)) flag(`${a.id} · ${S.s.label} row ${gi + 1}: no name-row pad — rows with no chord start would be shorter`);
        });
        if (beats.join() !== Array.from({ length: S.bars * bpb }, (_, i) => i).join()) flag(`${a.id} · ${S.s.label} (${mode}): data-beat runs [${beats.slice(0, 20).join(',')}${beats.length > 20 ? '…' : ''}] over ${beats.length} beats, expected 0..${S.bars * bpb - 1} once each, in order`);
        const rests = S.notes.some(n => n.rest);
        const quiet = a.card.restWord === false;   // card.restWord:false — the rest is left empty, no word (ca-29)
        // The rest word sits at the rest's own column (or at column 1 of a row that starts inside it).
        const restEvs = pcChordGrid(S.notes, bpb).filter(e => e.rest);
        pcGridRows(S, bpb).forEach((row, ri) => {
          const want = [];
          for (const e of quiet ? [] : restEvs) {
            if (e.start >= row.b0 - 1e-6 && e.start < row.b1 - 1e-6) want.push(Math.round((e.start - row.b0) * 2) + 2);
            else if (e.start < row.b0 && e.start + e.beats > row.b0 + 1e-6) want.push(2);
          }
          const got = [...(grids[ri] || '').matchAll(/class="tab-rest-lab" style="grid-row:7;grid-column:(\d+)"/g)].map(m => +m[1]);
          if (want.sort().join() !== got.sort().join()) flag(`${a.id} · ${S.s.label} (${mode}) row ${ri + 1}: rest words sit in grid columns [${got}], expected [${want}] — a rest word must sit where the rest starts`);
        });
        /* Every row opens on a label at column 0 (grid column 2): the chord that
           starts there, the rest word, or — when a chord is still ringing from
           the row before (a lyric line or a four-bar wrap that starts
           mid-chord) — that chord's name in parentheses. Worked out here from
           the fold and the rows, then read off the rendered row (CA-1: 6 of
           ca-35's 12 lyric lines opened on nothing). */
        const evs0 = pcChordGrid(S.notes, bpb);
        pcGridRows(S, bpb).forEach((row, ri) => {
          col0Rows++;
          const g = grids[ri] || '';
          const starts = evs0.find(e => Math.abs(e.start - row.b0) < 1e-6);
          const ring = starts || evs0.find(e => e.start < row.b0 - 1e-6 && e.start + e.beats > row.b0 + 1e-6);
          const btn = /class="tab-note-btn tab-chord-btn" style="grid-row:7;grid-column:2"[^>]*>([^<]*)</.exec(g);
          const rest = /class="tab-rest-lab" style="grid-row:7;grid-column:2"/.test(g);
          const where = `${a.id} · ${S.s.label} (${mode}) row ${ri + 1}`;
          if (!ring) { flag(`${where}: no chord or rest starts at or rings through the row's first beat`); return; }
          if (ring.rest) { if (!rest && !quiet) flag(`${where}: opens inside a rest but draws no rest word at column 0`); return; }
          const want = starts ? ring.name : `(${ring.name})`;
          if (!btn) flag(`${where}: opens with no chord name at column 0 — expected "${want}" (a row that starts mid-chord names the held chord in parentheses)`);
          else if (btn[1] !== want) flag(`${where}: column 0 reads "${btn[1]}", expected "${want}"`);
          else if (!starts) heldLabels++;
        });
        const words = (pg.match(/class="tab-rest-lab"/g) || []).length;
        restWords += words;
        if (quiet && words) flag(`${a.id} · ${S.s.label}: card.restWord is false but ${words} rest word(s) are drawn`);
        if (rests && !words && !quiet) flag(`${a.id} · ${S.s.label}: has a rest but draws no rest word — a silent bar would look like a held chord`);
      });
    }
  }
  /* BASS NOTES (2026-10-27, ca-35): every card with bassNotes, in every
     chord view, with the bass on and off, rendered. On: exactly one bass
     mark per bar of every grid section whose beat 1 is a chord, on the
     string and fret worked out here from the notes — the root in the first
     bar of each run of a chord, then 5th, root, 5th… until the name
     changes — and the bass directions at the end of the card's directions
     line (an open card shows no intro). Off: no mark and no bass
     directions. The Spanish view is rendered too. The total is pinned. */
  let bassMarks = 0;
  const bassCards = acts.filter(x => x && x.bassNotes);
  if (bassCards.map(x => x.id).join() !== CHORD_GRID_BASS_CARDS.join()) flag(`the cards with bassNotes are [${bassCards.map(x => x.id).join(', ')}], expected [${CHORD_GRID_BASS_CARDS.join(', ')}] — update CHORD_GRID_BASS_CARDS in the same edit`);
  for (const a of bassCards) {
    /* The card's own start (bassStart) with no choice saved: the pressed
       button and the marks follow it (review R1-4 — '|| "off"' in caBassMode
       stayed green while every render above set the mode explicitly). */
    {
      const start = a.bassStart === 'on' ? 'on' : 'off';
      if (CHORD_GRID_BASS_START[a.id] && CHORD_GRID_BASS_START[a.id] !== start) flag(`${a.id}: opens on bass ${start}, pinned at ${CHORD_GRID_BASS_START[a.id]} (Jonathan's choice) — change CHORD_GRID_BASS_START only when he asks`);
      let h = '';
      try { vm.runInContext(`delete caBassModes[${JSON.stringify(a.id)}]`, ctx); h = String(caCardBodyHtml(a)); }
      catch (e) { flag(`caCardBodyHtml(${a.id}, no saved bass choice) threw: ${e.message}`); }
      const sw0 = /class="ca-chord-switch ca-bass-switch"[\s\S]*?<\/div>/.exec(h);
      const p0 = sw0 ? [...sw0[0].matchAll(/aria-pressed="(true|false)"[^>]*onclick="caSetBassMode\([^,]*,'(on|off)'\)/g)].filter(m => m[1] === 'true').map(m => m[2]) : [];
      if (p0.join() !== start) flag(`${a.id}: with no saved choice the bass switch shows [${p0.join(', ')}] pressed, expected ${start} (bassStart)`);
      if (/tab-bass/.test(h) !== (start === 'on')) flag(`${a.id}: with no saved choice the TAB ${start === 'on' ? 'draws no' : 'draws'} bass notes, but bassStart is ${start}`);
    }
    for (const mode of ['full', 'power']) {
      if (mode === 'power' && !a.chordVersions) continue;
      for (const bass of ['on', 'off']) {
        const tag = `${a.id} (${mode}, bass ${bass})`;
        let html = '', view = null;
        try {
          vm.runInContext(`caChordModes[${JSON.stringify(a.id)}] = ${JSON.stringify(mode)}; caBassModes[${JSON.stringify(a.id)}] = ${JSON.stringify(bass)}`, ctx);
          html = String(caCardBodyHtml(a));
          view = vm.runInContext(`caView(CLASS_ACTIVITIES.find(x => x.id === ${JSON.stringify(a.id)}))`, ctx);
        } catch (e) { flag(`caCardBodyHtml(${tag}) threw: ${e.message}`); continue; }
        finally { try { vm.runInContext(`delete caChordModes[${JSON.stringify(a.id)}]; delete caBassModes[${JSON.stringify(a.id)}]`, ctx); } catch {} }
        const sw = /class="ca-chord-switch ca-bass-switch"[\s\S]*?<\/div>/.exec(html);
        const pressed = sw ? [...sw[0].matchAll(/aria-pressed="(true|false)"[^>]*onclick="caSetBassMode\([^,]*,'(on|off)'\)/g)].filter(m => m[1] === 'true').map(m => m[2]) : [];
        if (!sw) flag(`${tag}: no Strum only / Alternating bass switch`);
        else if (pressed.join() !== bass) flag(`${tag}: the switch shows [${pressed.join(', ')}] pressed, expected ${bass}`);
        const dirOf = h => { const m = /<p class="pc-dir">([\s\S]*?)<\/p>/.exec(h); return m ? m[1] : ''; };
        const esc = vm.runInContext('escHtml', ctx);
        let htmlEs = '';
        try {
          vm.runInContext(`caChordModes[${JSON.stringify(a.id)}] = ${JSON.stringify(mode)}; caBassModes[${JSON.stringify(a.id)}] = ${JSON.stringify(bass)}; setLang('es')`, ctx);
          htmlEs = String(caCardBodyHtml(a));
        } catch (e) { flag(`caCardBodyHtml(${tag}, es) threw: ${e.message}`); }
        finally { try { vm.runInContext(`setLang('en'); delete caChordModes[${JSON.stringify(a.id)}]; delete caBassModes[${JSON.stringify(a.id)}]`, ctx); } catch {} }
        for (const [sfx, h] of [['', html], ['_es', htmlEs]]) {
          const dir = dirOf(h), add = a['bassDirections' + sfx] ? esc(a['bassDirections' + sfx]) : '';
          if (bass === 'on' && (!add || !dir.endsWith(' ' + add))) flag(`${tag}${sfx}: the directions line does not end with bassDirections${sfx}`);
          if (bass === 'off' && add && dir.includes(add)) flag(`${tag}${sfx}: the directions line shows the bass directions with the bass off`);
        }
        const L = pcLayout(view), bpb = L.tr.beatsPerBar;
        const pages = html.split('<div class="tab-page pc-page"').slice(1);
        const want = [], got = [];
        L.sections.forEach((S, si) => {
          if (!S.grid) { if (/tab-bass/.test(pages[si] || '')) flag(`${tag} · ${S.s.label}: a note-by-note section drew a bass note`); return; }
          // Runs of one chord name (or of rests), worked out without the renderer.
          const runs = [];
          let pos = 0;
          S.notes.forEach(n => {
            const key = n.rest ? null : n.note, len = n.beats > 0 ? n.beats : 1, last = runs[runs.length - 1];
            if (last && last.key === key) last.beats += len; else runs.push({ key, start: pos, beats: len });
            pos += len;
          });
          if (bass === 'on') for (let m = 0; m < S.bars; m++) {
            const p = m * bpb, r = runs.find(x => x.start <= p + 1e-6 && p < x.start + x.beats - 1e-6);
            if (!r || r.key === null) continue;
            const b = a.bassNotes[r.key];
            if (!b) { flag(`${tag} · ${S.s.label}: bar ${m + 1} is ${r.key}, which has no bass note`); continue; }
            const before = m - Math.ceil(r.start / bpb - 1e-6);
            const pick = before % 2 ? b.fifth : b.root;
            want.push(`${si}:${m}:${pick[0]}${pick[1]}`);
          }
          const grids = (pages[si] || '').split('class="tab-grid chord-grid"').slice(1);
          const rows = pcGridRows(S, bpb);
          grids.forEach((g, gi) => {
            const b0 = rows[gi] ? rows[gi].b0 : NaN;
            g.split('<div class="tab-str-label">').slice(1).forEach(piece => {
              const lab = piece.slice(0, piece.indexOf('<'));
              [...piece.matchAll(/<div class="tab-cell[^"]*"[^>]*>(?:<span class="tab-fret([^"]*)">([^<]*)<\/span>)?<\/div>/g)].forEach((c, i) => {
                if (!/tab-bass/.test(c[1] || '')) return;
                const bar = (b0 + i / 2) / bpb;
                if (Math.abs(bar - Math.round(bar)) > 1e-6) flag(`${tag} · ${S.s.label} row ${gi + 1}: a bass note on column ${i}, which is not beat 1 of a bar`);
                got.push(`${si}:${Math.round(bar)}:${lab}${c[2]}`);
              });
            });
          });
        });
        const ws = [...want].sort(), gs = [...got].sort();
        if (ws.join() !== gs.join()) {
          const miss = ws.filter(x => !gs.includes(x)), extra = gs.filter(x => !ws.includes(x));
          flag(`${tag}: ${gs.length} bass notes drawn, ${ws.length} expected (section:bar:string+fret) — missing [${miss.slice(0, 6).join(' ')}${miss.length > 6 ? ' …' : ''}], unexpected [${extra.slice(0, 6).join(' ')}${extra.length > 6 ? ' …' : ''}]`);
        }
        bassMarks += gs.length;
      }
    }
  }
  if (bassMarks !== CHORD_GRID_BASS_MARKS) flag(`${bassMarks} bass notes drawn across every view, pinned at ${CHORD_GRID_BASS_MARKS} — a bar lost (or gained) its bass note, or the card's bars changed (update the pin only for an intended content change)`);
  if (heldLabels !== CHORD_GRID_HELD_LABELS) flag(`${heldLabels} rows across both views open on a held "(Chord)" label, pinned at ${CHORD_GRID_HELD_LABELS} — a row that starts mid-chord lost its label, or the cards' rows changed (update the pin only for an intended content change)`);
  // The new words are English AND Spanish (1e checks the key exists; this checks the Spanish is not the English).
  const I18N = loadI18nTable();
  for (const k of ['ca.cardChordDirections', 'ca.cardStrumDirections', 'ca.cardChordMixedDirections', 'ca.cardCountsAriaGrid', 'tab.restStop', 'ca.sheetDirections', 'ca.bassVersion', 'ca.bassOff', 'ca.bassOn']) {
    if (!I18N[k] || !I18N[k].es || I18N[k].es === I18N[k].en) flag(`i18n ${k}: the Spanish is missing or just the English`);
  }
  // Directions: all-grid, mixed and single-note cards each say their own thing.
  const dirOf = id => { const a = acts.find(x => x.id === id); return a ? (/<p class="pc-dir">([^<]*)<\/p>/.exec(String(caCardBodyHtml(a))) || [])[1] : null; };
  if (!/single notes/.test(dirOf('ca-41') || '')) flag('ca-41 (grid + single-note sections) does not say what to do in a section of single notes');
  if (/single notes/.test(dirOf('ca-29') || '')) flag('ca-29 (all grid) shows the mixed-card directions');
  if (!/Each chord is shown once/.test(dirOf('ca-40') || '')) flag('ca-40 on Jimi (one strum per chord, each chord shown once) does not show the each-chord-once directions (ca.cardChordDirections)');
  if (/Each chord is shown once/.test(dirOf('ca-10') || '')) flag('ca-10 (single notes) shows the chord-card directions');
  // The sheet's "This bar" strip is fed by the beat, and the narrow-screen guard is in the stylesheet (the real overflow test is smoke.mjs).
  try {
    const css = readFileSync(join(ROOT, 'styles.css'), 'utf8');
    if (!/\.tab-grid\.chord-grid > \*\{min-width:0\}/.test(css)) flag('styles.css: .tab-grid.chord-grid > *{min-width:0} is gone — 32 columns overflow a 390px phone (smoke.mjs measures it in a real browser)');
  } catch { flag('styles.css unreadable'); }
  // ca-41: mixed card keeps the switch for its single-note verses.
  const c41 = acts.find(a => a.id === 'ca-41');
  if (c41) { let h = ''; try { h = String(caCardBodyHtml(c41)); } catch (e) { flag(`caCardBodyHtml(ca-41) threw: ${e.message}`); } if (!/pc-counts/.test(h)) flag('ca-41 lost its Counts switch — its single-note verses still need it'); }
  // A single-note card is untouched.
  const c10 = acts.find(a => a.id === 'ca-10');
  if (!c10) flag('ca-10 is gone — 1bv renders it');
  else {
    let html = '';
    try { html = String(caCardBodyHtml(c10)); } catch (e) { flag(`caCardBodyHtml(ca-10) threw: ${e.message}`); }
    if (/data-beat|chord-grid/.test(html)) flag('ca-10 (a single-note card) renders chord-grid markup — single-note cards keep the note-by-note highlight');
    if (!/Press Play song and play along/.test(html)) flag('ca-10 lost its own directions line');
    const L = pcLayout(c10);
    const ks = new Set(); for (let i = 0; i < L.sections[0].bars * L.tr.beatsPerBar * 8; i++) ks.add(pcLocKey(L, pcLocate(L, i / 8 / L.tr.beatsPerBar)));
    if (ks.size !== L.sections[0].notes.length) flag(`ca-10: ${ks.size} repaint keys over ${L.sections[0].notes.length} notes — a single-note card must still step per note`);
  }
  if (bad === 0) ok(`${CHORD_GRID_CARDS.length} chord-grid cards (pinned) — ${sections} grid sections, ${events} chord/rest onsets all on the eighth grid, ${labelled} lyric lines keep their row; ca-29 renders 98 chord names (one per strum) and 392 data-beat on beat columns only; ${rowsSeen} grid rows across both views each 4 bars wide with their bar lines, staff edge and 0..N beat run; ${col0Rows} rows open on a label at column 0 (${heldLabels} held "(Chord)", pinned); ${restWords} rest words; ${bassMarks} alternating-bass notes (pinned) on beat 1, root / 5th as worked out from the notes, across ${CHORD_GRID_BASS_CARDS.length} bass card(s) x chord views, none with the bass off, the directions in EN + ES; the cursor steps once per beat; ca-10 untouched`);
}

/* 1by. POWER-CHORD NAMES OPEN NO POP-UP WHERE THE TWO-FINGER SHAPE IS TAUGHT
   (Jonathan, 2026-10-26). The chord library draws power chords with three
   fingers, but Module 3 Set 1 (m3w1) and Module 9's power-chord re-test
   (skill m9w0-s4: its steps and its checklist row) teach the two-finger shape,
   so there a power-chord name is plain text (POWER_CHORD_NO_POPUP and
   powerChordLinksOff() in app.js). Checked by RENDERING both sets with the real
   buildSet(), in English and Spanish, and running the real wrapChordLinksIn()
   over every step text, hint and checklist label in a small fake DOM built from
   that HTML (the real walker, skip classes and all):
   - in scope: 0 power-chord links;
   - the same elements under a set outside the scope (the control; a
     checklist row there gets that set's own skill id) link every power-chord
     name, and that total is pinned (POWER_CHORD_SCOPE_LINKS) so the
     check cannot go blind or lose its scope silently;
   - m9w0's other text keeps its chord links (the scope is one skill, not the set). */
const POWER_CHORD_SCOPE_LINKS = 107;
function checkPowerChordPopups(sets, ctx) {
  head('1by. Power-chord names open no pop-up where the two-finger shape is taught');
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  if (!ctx || !sets) { flag('1by cannot run — the 0b render context is unavailable'); return; }
  const buildSet = vm.runInContext('typeof buildSet === "function" ? buildSet : null', ctx);
  const wrap = vm.runInContext('typeof wrapChordLinksIn === "function" ? wrapChordLinksIn : null', ctx);
  if (!wrap) { flag('app.js: wrapChordLinksIn() is gone'); return; }
  const decode = s => s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&rarr;/g, '→').replace(/&middot;/g, '·').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&amp;/g, '&');
  const VOID = new Set(['br', 'img', 'input', 'hr', 'wbr', 'source', 'col', 'area', 'meta', 'link']);
  // A fake element: just what wrapChordLinksIn and its walker read.
  const mkEl = (tag, attrs, parent) => {
    const cls = (/\bclass="([^"]*)"/.exec(attrs || '') || [])[1] || '';
    const dataset = {};
    for (const m of (attrs || '').matchAll(/\bdata-([a-z-]+)="([^"]*)"/g)) dataset[m[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = decode(m[2]);
    const el = { tagName: tag.toUpperCase(), parentNode: parent, childNodes: [], dataset, _cls: cls.split(/\s+/).filter(Boolean),
      classList: { contains: c => el._cls.includes(c) },
      closest(sel) {
        const m = /^\.([\w-]+)(?:\[([\w-]+)(?:="([^"]*)")?\])?$/.exec(sel);
        if (!m) throw new Error(`1by fake DOM: unsupported selector ${sel}`);
        for (let p = el; p; p = p.parentNode) {
          if (!p.classList || !p.classList.contains(m[1])) continue;
          if (!m[2]) return p;
          const v = p.dataset[m[2].replace(/^data-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase())];
          if (v !== undefined && (m[3] === undefined || v === m[3])) return p;
        }
        return null;
      } };
    return el;
  };
  const parseInto = (root, html) => {
    let cur = root;
    for (const m of html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>|([^<]+)/g)) {
      if (m[4] !== undefined) { cur.childNodes.push({ nodeType: 3, nodeValue: decode(m[4]), parentNode: cur }); continue; }
      const tag = m[2].toLowerCase();
      if (m[1]) { if (cur !== root && cur.tagName === tag.toUpperCase()) cur = cur.parentNode; continue; }
      const el = mkEl(tag, m[3], cur);
      cur.childNodes.push(el);
      if (!VOID.has(tag) && !/\/\s*$/.test(m[3])) cur = el;
    }
  };
  // The inner HTML of the element that opens at `at` (balanced on its own tag name).
  const innerAt = (html, at, tag) => {
    const open = html.indexOf('>', at) + 1;
    const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g');
    re.lastIndex = open;
    let depth = 1, m;
    while ((m = re.exec(html))) { depth += m[1] ? -1 : 1; if (!depth) return html.slice(open, m.index); }
    return html.slice(open);
  };
  // Every text-bearing element wrapAllChordLinks feeds the linker, with its context.
  const elementsOf = (html) => {
    const out = [];
    const ctxTags = [...html.matchAll(/<li class="step[^"]*"([^>]*)>|<div class="skill-row"([^>]*)>/g)].map(m => ({ at: m.index, kind: m[1] !== undefined ? 'step' : 'skill', attrs: m[1] !== undefined ? m[1] : m[2] }));
    for (const m of html.matchAll(/<(span) class="st-text">|<(div) class="sh">|<(div) class="sk-label">|<ul class="sh-list">/g)) {
      const owner = [...ctxTags].reverse().find(c => c.at < m.index);
      if (m[0].startsWith('<ul')) {
        const list = innerAt(html, m.index, 'ul');
        for (const li of list.matchAll(/<li>/g)) out.push({ owner, inner: innerAt(list, li.index, 'li') });
      } else out.push({ owner, inner: innerAt(html, m.index, m[1] || m[2] || m[3]) });
    }
    return out;
  };
  // Run the real linker on one element placed under `setId`'s panel; returns the chord names it linked.
  const NodeFilter = { SHOW_TEXT: 4, FILTER_ACCEPT: 1, FILTER_REJECT: 2, FILTER_SKIP: 3 };
  const doc = vm.runInContext('document', ctx);
  const saved = { createTreeWalker: doc.createTreeWalker, createDocumentFragment: doc.createDocumentFragment, createElement: doc.createElement, createTextNode: doc.createTextNode, NodeFilter: ctx.NodeFilter };
  let linked = [];
  try {
    ctx.NodeFilter = NodeFilter;
    doc.createTreeWalker = (root, _show, filter) => {
      const all = [];
      const walk = n => { for (const c of n.childNodes || []) { if (c.nodeType === 3) all.push(c); else walk(c); } };
      walk(root);
      const pass = all.filter(n => filter.acceptNode(n) === NodeFilter.FILTER_ACCEPT);
      let i = 0;
      return { nextNode: () => pass[i++] || null };
    };
    doc.createDocumentFragment = () => ({ kids: [], appendChild(c) { this.kids.push(c); } });
    doc.createElement = () => ({ className: '', dataset: {}, textContent: '', addEventListener() {} });
    doc.createTextNode = t => ({ nodeValue: t });
    const replaceChild = frag => { for (const k of frag.kids) if (k.className === 'chord-link') linked.push(k.dataset.chord); };
    const isPower = c => /^[A-G][#b]?5$/.test(c);
    let inScopeEls = 0, controlLinks = 0, otherLinks = 0, langs = 0;
    const getLang = vm.runInContext('typeof getLang === "function" ? getLang : null', ctx);
    const setLang = vm.runInContext('typeof setLang === "function" ? setLang : null', ctx);
    const was = getLang ? getLang() : 'en';
    for (const lang of ['en', 'es']) {
      if (setLang) setLang(lang); else if (lang === 'es') continue;
      langs++;
      for (const setId of ['m3w1', 'm9w0']) {
        const w = sets.find(x => x.id === setId);
        if (!w) { flag(`1by: set ${setId} is gone`); continue; }
        const els = elementsOf(String(buildSet(w)));
        for (const e of els) {
          // Every element gets replaceChild, which reports the links made.
          const patch = n => { for (const c of n.childNodes || []) { if (c.nodeType !== 3) patch(c); } n.replaceChild = replaceChild; };
          const scoped = setId === 'm3w1' || (e.owner && (e.owner.kind === 'step'
            ? (/data-skills="([^"]*)"/.exec(e.owner.attrs) || [, ''])[1].split(',').includes('4')
            : /data-sid="m9w0-s4"/.test(e.owner.attrs)));
          // The real linker on this element under `sid`'s panel; returns what it linked.
          const realRun = sid => {
            const panel = mkEl('div', `class="week-panel" data-id="${sid}" data-module="${(/^m(\d+)/.exec(sid) || [])[1]}"`, null);
            // Outside the scope the checklist row is another set's too: a row
            // keeps data-sid="m9w0-s4" wherever it sits, and the scope reads it.
            const attrs = sid === setId ? e.owner && e.owner.attrs : e.owner && e.owner.attrs.replace(/data-sid="[^"]*"/, `data-sid="${sid}-s1"`);
            const owner = e.owner ? mkEl(e.owner.kind === 'step' ? 'li' : 'div', `class="${e.owner.kind === 'step' ? 'step' : 'skill-row'}"${attrs}`, panel) : panel;
            const root = mkEl('div', 'class="probe"', owner);
            parseInto(root, e.inner);
            patch(root);
            linked = [];
            wrap(root);
            return linked.slice();
          };
          const got = realRun(setId);
          if (scoped) {
            inScopeEls++;
            const p = got.filter(isPower);
            if (p.length) flag(`${setId} (${lang}): "${e.inner.replace(/<[^>]+>/g, '').slice(0, 60)}…" links ${p.join(', ')} to a pop-up — the two-finger lesson must show these as plain text (POWER_CHORD_NO_POPUP in app.js)`);
            // Control: the same element under a set outside the scope.
            controlLinks += realRun('m3w2').filter(isPower).length;
          } else otherLinks += got.length;
        }
      }
    }
    if (setLang) setLang(was);
    if (controlLinks !== POWER_CHORD_SCOPE_LINKS) flag(`1by: the in-scope text holds ${controlLinks} power-chord names that would link outside the scope, pinned at ${POWER_CHORD_SCOPE_LINKS} — a change to that text, or a linker that stopped seeing power chords (update the pin only for an intended text change)`);
    if (!otherLinks) flag('1by: m9w0 outside its power-chord re-test linked no chord at all — the scope swallowed the whole set, or the harness is blind');
    if (!bad) ok(`${inScopeEls} in-scope elements (m3w1 + the m9w0-s4 re-test, ${langs} languages) link 0 of ${controlLinks} power-chord names (pinned; the same text links all of them elsewhere); m9w0's other text keeps ${otherLinks} chord links`);
  } catch (e) {
    flag(`1by: the fake-DOM run threw — ${e.message}`);
  } finally {
    Object.assign(doc, { createTreeWalker: saved.createTreeWalker, createDocumentFragment: saved.createDocumentFragment, createElement: saved.createElement, createTextNode: saved.createTextNode });
    ctx.NodeFilter = saved.NodeFilter;
  }
}

/* 1bz. A SECOND FILE SWITCH BEFORE THE FIRST HAS LOADED KEEPS THE PLACE
   (2026-10-26 review). Since only the teacher preloads the twin, a student's
   first Guitar press reloads the file, and src= puts the element's position
   back to 0 and pauses it until loadedmetadata. A second press (Guitar again,
   or a speed change) in that gap used to read that 0 and send the song to the
   start of the window. Checked by EXECUTING both engines (snipSetTier /
   pcRetrack via pcSetGuitar) in the 0b context with an <audio> stand-in that
   behaves like the load algorithm (src= resets position, readyState and
   paused; a seek before metadata is lost): Guitar+Guitar and Guitar+Slow, in
   each engine, must end on the same bar, still playing, a Stop in the gap
   must stay stopped, and a Slow press after the Guitar file loaded and played
   ~3 s on must land on the moved place. The case count is pinned. */
const PENDING_SWITCH_CASES = 8;
function checkPendingFileSwitch(ctx) {
  head('1bz. A second file switch before the first has loaded keeps the place');
  let bad = 0, cases = 0;
  const flag = m => { err(m); problems++; bad++; };
  if (!ctx) { flag('1bz cannot run — the 0b render context is unavailable'); return; }
  const need = ['snipSetTier', 'snipToggle', 'snipStop', 'pcSetGuitar', 'pcRetrack', 'pcStop', 'pcWindow', 'snipBarsAt'];
  const missing = need.filter(n => !vm.runInContext(`typeof ${n} === "function"`, ctx));
  if (missing.length) { flag(`app.js: ${missing.join(', ')} gone — 1bz cannot drive the players`); return; }
  const savedAudio = ctx.Audio, savedRaf = ctx.requestAnimationFrame;
  class LoadAudio {
    constructor() { this.l = {}; this._src = ''; this._t = 0; this.paused = true; this.readyState = 0; this.playbackRate = 1; this.defaultPlaybackRate = 1; this.muted = false; this.seeking = false; this.ended = false; }
    get src() { return this._src; } set src(v) { this._src = v; this._t = 0; this.readyState = 0; this.paused = true; }
    get currentTime() { return this._t; } set currentTime(v) { if (this.readyState >= 1) this._t = v; }
    getAttribute(n) { return n === 'src' ? this._src : null; }
    addEventListener(t, f, o) { (this.l[t] ||= []).push({ f, once: !!(o && o.once) }); }
    removeEventListener() {}
    fire(t) { const ls = this.l[t] || []; this.l[t] = ls.filter(x => !x.once); ls.forEach(x => x.f({ type: t })); }
    play() { this.paused = false; return Promise.resolve(); } pause() { this.paused = true; } load() {}
  }
  const meta = a => { if (a.readyState === 0) { a.readyState = 1; a.fire('loadedmetadata'); } };
  const el = (dataset) => ({ dataset, isConnected: true, parentElement: null, querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; } });
  const btn = (host, pressed) => ({ closest: () => host, _p: pressed, getAttribute() { return this._p ? 'true' : 'false'; }, setAttribute(k, v) { if (k === 'aria-pressed') this._p = v === 'true'; }, classList: { add() {}, remove() {}, toggle() {} }, querySelector() { return null; }, querySelectorAll() { return []; }, innerHTML: '' });
  try {
    ctx.Audio = LoadAudio; ctx.requestAnimationFrame = () => 0;
    const track = vm.runInContext(`Object.keys(SNIPPET_TRACKS).find(k => snippetHasFull(SNIPPET_TRACKS[k]) && SNIPPET_TRACKS[k].srcSlow)`, ctx);
    if (!track) { flag('1bz: no snippet track with a full mix and a slow tier to drive'); return; }
    /* 'meta' = the pending file finishes loading; 'move' = ~3 s of play after
       it. The last case switches AFTER a load has finished: the place must be
       the moved one, not the first switch's (a pending marker left set would
       send it back there). */
    for (const steps of [['guitar', 'guitar'], ['guitar', 'slow'], ['guitar', 'stop'], ['guitar', 'meta', 'move', 'slow']]) {
      // Snippet engine.
      const card = el({ snip: JSON.stringify({ track, fromBar: 1, bars: 8 }), guitar: '' });
      ctx.__bz = { play: btn(card), gtr: btn(card, false), slow: btn(card, false) };
      vm.runInContext('snipStop(); snipToggle(__bz.play)', ctx);
      const sa = vm.runInContext('snipState.audio', ctx); sa.readyState = 1; sa.fire('loadedmetadata'); sa._t = vm.runInContext('snipState.win.start', ctx) + 7; sa.paused = false;
      let sb0 = vm.runInContext('snipBarsAt(snipState.win, snipState.audio.currentTime)', ctx);
      vm.runInContext('__bz.st = snipState', ctx);
      for (const s of steps) {
        if (s === 'meta') { meta(vm.runInContext('__bz.st.audio', ctx)); continue; }
        if (s === 'move') { vm.runInContext('__bz.st.audio', ctx)._t += 3; sb0 = vm.runInContext('snipBarsAt(snipState.win, snipState.audio.currentTime)', ctx); continue; }
        vm.runInContext(s === 'stop' ? 'snipStop()' : `snipSetTier(__bz.${s === 'guitar' ? 'gtr' : 'slow'}, ${JSON.stringify(s)})`, ctx);
      }
      meta(vm.runInContext('__bz.st.audio', ctx));
      cases++;
      if (steps.includes('stop')) { if (vm.runInContext('snipState', ctx) || !vm.runInContext('__bz.st.audio.paused', ctx)) flag(`1bz snippet ${steps.join('+')}: playing again after a Stop in the gap`); }
      else {
        const b = vm.runInContext('snipBarsAt(snipState.win, snipState.audio.currentTime)', ctx), playing = !vm.runInContext('snipState.audio.paused', ctx);
        if (Math.abs(b - sb0) > 0.02 || !playing) flag(`1bz snippet ${steps.join('+')}: was ${sb0.toFixed(2)} bars in, now ${b.toFixed(2)} (${playing ? 'playing' : 'stopped'}) — a file switch lost the place`);
      }
      vm.runInContext('snipStop()', ctx);
      // Practice-card engine.
      const root = el({ guitar: '', rate: '1', slow: '' });
      ctx.__bz.root = root; ctx.__bz.g = { closest: () => root, setAttribute() {}, querySelectorAll() { return []; } };
      vm.runInContext(`pcState = { root: __bz.root, L: { tr: SNIPPET_TRACKS[${JSON.stringify(track)}], firstBar: 1, totalBars: 16, sections: [{ s: { label: 'x' }, fromBar: 1, bars: 16, reps: 1 }] }, audio: new Audio(), win: null, timers: [], wholeSong: true, counting: false, lastBeat: -1 };
        pcState.win = pcWindow(pcState.L, false); pcState.audio.src = snippetSrc(pcState.L.tr, false, false); pcState.audio.readyState = 4; pcState.audio.currentTime = pcState.win.start + 9; pcState.audio.paused = false; __bz.pst = pcState;`, ctx);
      let pb0 = vm.runInContext('snipBarsAt(pcState.win, pcState.audio.currentTime)', ctx);
      for (const s of steps) {
        if (s === 'meta') meta(vm.runInContext('__bz.pst.audio', ctx));
        else if (s === 'move') { vm.runInContext('__bz.pst.audio', ctx)._t += 3; pb0 = vm.runInContext('snipBarsAt(pcState.win, pcState.audio.currentTime)', ctx); }
        else if (s === 'guitar') vm.runInContext('pcSetGuitar(__bz.g)', ctx);
        else if (s === 'slow') { root.dataset.slow = '1'; vm.runInContext('pcRetrack(__bz.root)', ctx); }
        else vm.runInContext('pcStop()', ctx);
      }
      meta(vm.runInContext('__bz.pst.audio', ctx));
      cases++;
      if (steps.includes('stop')) { if (vm.runInContext('pcState', ctx) || !vm.runInContext('__bz.pst.audio.paused', ctx)) flag(`1bz card ${steps.join('+')}: playing again after a Stop in the gap`); }
      else {
        const b = vm.runInContext('snipBarsAt(pcState.win, pcState.audio.currentTime)', ctx), playing = !vm.runInContext('pcState.audio.paused', ctx);
        if (Math.abs(b - pb0) > 0.02 || !playing) flag(`1bz card ${steps.join('+')}: was ${pb0.toFixed(2)} bars in, now ${b.toFixed(2)} (${playing ? 'playing' : 'stopped'}) — a file switch lost the place`);
      }
      vm.runInContext('pcStop()', ctx);
    }
    if (cases !== PENDING_SWITCH_CASES) flag(`1bz ran ${cases} cases, pinned at ${PENDING_SWITCH_CASES}`);
    if (!bad) ok(`${cases} double switches across both players (snippet + practice card: Guitar twice, Guitar then Slow, Stop in the gap, Slow after the Guitar file loaded and played on) keep the bar and the play state`);
  } catch (e) {
    flag(`1bz: driving the players threw — ${e.message}`);
  } finally {
    ctx.Audio = savedAudio; ctx.requestAnimationFrame = savedRaf;
    try { vm.runInContext('snipStop(); pcStop(); delete globalThis.__bz', ctx); } catch {}
  }
}

/* 1bq. THE SONG LIBRARY HOLDS NO CORE SONG (Jonathan, 2026-10-20: "make
   sure that the core songs are not included with the library songs because
   those have class activities"). A `library: true` card is on every
   student's Songs page and off the Class activities board (caIsLibraryCard
   in app.js). caIsLibraryCard already refuses a card tied to a Song Journey
   page, a whole-song card or a lyric sheet — so a Core card marked by
   mistake would silently drop out of the library instead of leaking into
   it. This check makes that mistake loud instead, and also catches the
   case the code cannot see: a Core song's card with no `journey` (a part
   card like ca-10 or ca-18) whose track or title names a Core song. It also
   requires `library` to be exactly true or false (false = a song the
   console can move, starting in Class activities; 2026-10-20) and never on
   an exit check, and proves the guard is wired: caIsSongCard must test
   `journey` and `wholeSong`, caIsLibraryCard must go through it, and
   caBoardOrder must filter on caIsLibraryCard with the console's moves. The
   Core rule covers `library: false` too: a moved Core card would leave its
   class activity. */
function checkSongLibrary() {
  head('1bq. The song library holds no Core song');
  let activities = [];
  try {
    const src = readFileSync(join(ROOT, 'class-activities.js'), 'utf8');
    const sandbox = { console };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(src, sandbox, { filename: 'class-activities.js' });
    activities = sandbox.CLASS_ACTIVITIES || [];
  } catch { return; /* reported by 1d */ }
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  const appSrc = readFileSync(join(ROOT, 'app.js'), 'utf8');
  const block = /const SONG_JOURNEYS = \[([\s\S]*?)\n\];/.exec(appSrc);
  const core = block ? [...block[1].matchAll(/\bid:\s*'([^']+)'/g)].map(m => m[1]) : [];
  if (core.length !== 6) { flag(`1bq expects the six Core songs in SONG_JOURNEYS, found ${core.length}`); return; }
  // Core song names as titles spell them: "the-cure" -> "the cure".
  const coreWords = core.map(id => id.replace(/-/g, ' '));
  const fold = t => String(t || '').toLowerCase().replace(/[\u2018\u2019'".,!?]/g, '').replace(/\s+/g, ' ');
  const fn = /function caIsSongCard\(a\)\{([\s\S]*?)\n\}/.exec(appSrc);
  const lfn = /function caIsLibraryCard\(a, over\)\{([\s\S]*?)\n\}/.exec(appSrc);
  if (!fn || !lfn) flag('1bq: caIsSongCard() / caIsLibraryCard() is missing from app.js — the Core-song guard is gone');
  else if (!/a\.journey/.test(fn[1]) || !/wholeSong/.test(fn[1])) flag('1bq: caIsSongCard() no longer refuses journey / wholeSong cards');
  else if (!/if\(!caIsSongCard\(a\)\) return false;/.test(lfn[1])) flag('1bq: caIsLibraryCard() no longer goes through caIsSongCard() — a console move could put a Core song in the library');
  if (!/filter\(a => a && a\.id && !caIsLibraryCard\(a, o\.songLibrary\)\)/.test(appSrc)) flag('1bq: caBoardOrder no longer skips library cards — they would land back on the Class activities board');
  let lib = 0;
  for (const a of activities) {
    if (!a || a.library === undefined) continue;
    if (a.library !== true && a.library !== false) { flag(`${a.id}: \`library\` takes only true or false (got ${JSON.stringify(a.library)})`); continue; }
    if (a.kind === 'check') { flag(`${a.id}: an exit check can't be a library song`); continue; }
    lib++;
    const track = String(a.track || (a.card && a.card.track) || '');
    const why = [];
    if (a.journey !== undefined) why.push(`journey "${a.journey}"`);
    if (a.card && a.card.wholeSong) why.push('card.wholeSong');
    if (a.card && a.card.sheet) why.push('card.sheet');
    const t = core.find(id => track === id || track.startsWith(id + '-'));
    if (t) why.push(`track "${track}"`);
    const w = coreWords.find(cw => fold(a.title).includes(cw));
    if (w) why.push(`title names "${w}"`);
    if (why.length) flag(`${a.id}: a Core song's card is marked \`library\` (${why.join(', ')}) — Core songs keep their class activities and stay out of the library`);
  }
  if (!bad) ok(`${lib} movable song${lib === 1 ? '' : 's'}, none of them a Core song; the board skips the ones on the Songs page`);
}

/* 1bn. PLAY-ALONG FIRST: WHOLE-SONG CARDS ARE FINDABLE AND NO PAGE IS BLOCKED
   (2026-10-06). A link to a song opens its whole-song practice card when
   students can open one for that layer, else the Song Journey page
   (openSongLink() in app.js, decided at the click). That only works if every
   whole-song card says which song and layer it is (`journey` + `journeyLayer`)
   and no two cards claim the same pair. A whole-song card never renders the
   Journey button (it IS the play-along), so it must not name the page. And
   the part-1 retire switch (a per-song list and a "moved" card) shipped and
   was reversed the same day — it must not come back. */
function checkJourneyRetired() {
  head('1bn. Play-along first: whole-song cards are findable and no page is blocked');
  let activities = [];
  try {
    const src = readFileSync(join(ROOT, 'class-activities.js'), 'utf8');
    const sandbox = { console };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(src, sandbox, { filename: 'class-activities.js' });
    activities = sandbox.CLASS_ACTIVITIES || [];
  } catch { return; /* reported by 1d */ }
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  const rd = f => readFileSync(join(ROOT, f), 'utf8');
  const appSrc = rd('app.js');
  const block = /const SONG_JOURNEYS = \[([\s\S]*?)\n\];/.exec(appSrc);
  const ids = block ? [...block[1].matchAll(/\bid:\s*'([^']+)'/g)].map(m => m[1]) : [];
  if (!ids.length) { flag('1bn cannot read the SONG_JOURNEYS ids from app.js'); return; }
  /* A lyric-sheet card (card.sheet — ca-38) is another view of a whole song,
     not its layer's play-along: it has no journey, so no link can pick it
     over the real one and the Journey page draws no second tab for it. */
  activities.filter(a => a && a.view === 'card' && a.card && a.card.sheet).forEach(a => {
    if (a.journey !== undefined || a.journeyLayer !== undefined) flag(`${a.id}: a lyric-sheet card (card.sheet) has no journey / journeyLayer — it would compete with the song's play-along card`);
  });
  /* A teacher-only card (teacherOnly — ca-40, 2026-10-22) is played from the
     console and, once moved to Class activities, is an ordinary card; it is never its
     layer's play-along, so like a lyric sheet it names no journey / layer.
     And it must stay off the board: caBoardOrder has to skip it, or an
     unseeded board would read it as assigned. */
  const teacherOnly = activities.filter(a => a && a.teacherOnly !== undefined);
  teacherOnly.forEach(a => {
    if (a.teacherOnly !== true) flag(`${a.id}: \`teacherOnly\` takes only true (got ${JSON.stringify(a.teacherOnly)})`);
    if (a.journey !== undefined || a.journeyLayer !== undefined) flag(`${a.id}: a teacher-only card has no journey / journeyLayer — it would compete with the song's play-along card`);
    if (a.library !== undefined) flag(`${a.id}: a teacher-only card has no \`library\` field — the console's Move to Class activities button is its only switch`);
  });
  if (teacherOnly.length && !/\.filter\(a => !caIsTeacherSong\(a, o\.classSongs\)\)/.test(appSrc)) flag('1bn: caBoardOrder no longer skips teacher-only cards (caIsTeacherSong) — students could see one');
  const cards = activities.filter(a => a && a.view === 'card' && a.card && a.card.wholeSong === true && !a.card.sheet && a.teacherOnly !== true);
  if (cards.length === 0) { flag('1bn found no whole-song card — it cannot see what it is supposed to guard'); return; }
  const NAMES_PAGE = /song journey|recorrido de la canci[oó]n/i;
  const walk = (v, path, a) => {
    if (typeof v === 'string') { if (NAMES_PAGE.test(v)) flag(`${a.id} · ${path}: a whole-song card names the Song Journey page — its button never renders ("${v.slice(0, 70)}")`); return; }
    if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${path}[${i}]`, a)); return; }
    if (v && typeof v === 'object') for (const k of Object.keys(v)) walk(v[k], path ? `${path}.${k}` : k, a);
  };
  const pairs = new Map();
  for (const a of cards) {
    if (!ids.includes(a.journey)) flag(`${a.id}: a whole-song card needs a \`journey\` that is a SONG_JOURNEYS id (got "${a.journey}")`);
    if (typeof a.journeyLayer !== 'number') flag(`${a.id}: a whole-song card needs a numeric \`journeyLayer\``);
    const key = `${a.journey}|${a.journeyLayer}`;
    if (pairs.has(key)) flag(`${pairs.get(key)} and ${a.id} are both the Layer ${a.journeyLayer} whole-song card for "${a.journey}" — a link to that layer cannot pick one`);
    else pairs.set(key, a.id);
    walk(a, '', a);
  }
  // The retire switch must not come back.
  const BANNED = ['JOURNEY_RETIRED', 'journeyRetired', 'journeyIsRetired', 'showJourneyRetired', 'journey-retired-wait', 'journey.retired'];
  for (const f of ['class-activities.js', 'app.js', 'teacher.js', 'tabs/journey.js', 'tabs/journey-theme.css', 'i18n.js']) {
    const src = rd(f);
    for (const w of BANNED) if (src.includes(w)) flag(`${f} mentions "${w}" — the per-song retire switch was reversed on 2026-10-06; do not bring it back`);
  }
  // Wiring, on comment-stripped function bodies.
  const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');
  const body = name => {
    const m = new RegExp(`function ${name}\\(`).exec(appSrc);
    if (!m) return null;
    let i = appSrc.indexOf('{', m.index), depth = 0, j = i;
    for (; j < appSrc.length; j++) { if (appSrc[j] === '{') depth++; else if (appSrc[j] === '}' && --depth === 0) break; }
    return strip(appSrc.slice(i, j + 1));
  };
  const open = body('openSongLink'), card = body('journeyLinkCardHtml'), url = body('caJourneyUrl');
  if (open === null) flag('app.js has no function openSongLink(');
  if (card === null || !/openSongLink\(/.test(card)) flag('journeyLinkCardHtml() does not call openSongLink(');
  if (url === null || !/wholeSong/.test(url)) flag('caJourneyUrl() does not read wholeSong');
  if (bad === 0) ok(`${cards.length} whole-song cards — each names its song and layer, no two share a pair, none names the page; no retire switch; openSongLink wired`);
}

/* 1bo. A FAILED PROGRESS LOAD CANNOT WIPE A MAP (2026-10-10). When
   loadProgress() fails, its catch leaves skills / responses / completed /
   classActivities / caSteps EMPTY, and the next save used to send them whole.
   Firestore's {merge:true} merges a map key by key — except an EMPTY map,
   whose bare field lands in the update mask and REPLACES the stored map with
   {}: every "I've got it", every rating, every answer, gone, from one save
   after a blocked load. flushSave() now drops an empty whole-map category
   from the payload while progressLoadFailed is set (LOAD_FAILED_EMPTY_MAPS in
   app.js). This pins it:
     - LOAD_FAILED_EMPTY_MAPS is exactly the five maps the catch empties;
     - every `payload.X =` in flushSave() is one of them, a scalar, or a
       category LOAD_DEPENDENT_SAVE_KEYS holds back whole — so a NEW map
       field cannot arrive without someone deciding which it is;
     - the payload literal carries only name/email;
     - the drop runs after the last FieldValue.delete() stamp (a map holding
       only sentinels must still go) and before the .set(payload). */
const LOAD_FAILED_MAPS_EXPECTED = ['skills', 'responses', 'completed', 'classActivities', 'caSteps'];
const PAYLOAD_SCALARS = ['lastModule', 'lastSet', 'period'];
function checkLoadFailedMaps() {
  head('1bo. A failed progress load cannot wipe a saved map');
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  let src;
  try { src = stripJsComments(readFileSync(join(ROOT, 'app.js'), 'utf8')); }
  catch { flag('app.js unreadable — 1bo cannot check this'); return; }
  const listOf = name => {
    const m = new RegExp(`const ${name}\\s*=\\s*(?:new Set\\()?\\[([^\\]]*)\\]`).exec(src);
    return m ? [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]) : null;
  };
  const maps = listOf('LOAD_FAILED_EMPTY_MAPS');
  const held = listOf('LOAD_DEPENDENT_SAVE_KEYS');
  if (!maps) { flag('app.js: no LOAD_FAILED_EMPTY_MAPS list — a save after a failed load can replace a whole map with {}'); return; }
  if (!held) { flag('app.js: no LOAD_DEPENDENT_SAVE_KEYS list — 1bo cannot classify the held-back categories'); return; }
  if (maps.length !== LOAD_FAILED_MAPS_EXPECTED.length || LOAD_FAILED_MAPS_EXPECTED.some(f => !maps.includes(f)))
    flag(`app.js: LOAD_FAILED_EMPTY_MAPS is [${maps.join(', ')}] — expected exactly [${LOAD_FAILED_MAPS_EXPECTED.join(', ')}], the maps loadProgress()'s catch empties`);
  const body = jsFunctionBody(src, 'flushSave');
  if (body === null) { flag('app.js: no flushSave() found — 1bo cannot see the payload'); return; }
  const lit = /const payload\s*=\s*\{([^}]*)\}/.exec(body);
  if (!lit) flag('app.js: flushSave() no longer builds `const payload = { … }` — 1bo cannot see it');
  else {
    const litKeys = [...lit[1].matchAll(/(\w+)\s*:/g)].map(m => m[1]);
    const extra = litKeys.filter(k => k !== 'name' && k !== 'email');
    if (extra.length) flag(`app.js: flushSave()'s payload literal carries ${extra.join(', ')} — only name/email belong there; assign a category below so 1bo can classify it`);
  }
  const fields = [...body.matchAll(/\bpayload\.(\w+)\s*=(?!=)/g)].map(m => m[1]);
  if (fields.length === 0) { flag('1bo found no `payload.X =` in flushSave() — it cannot see what it is supposed to guard'); return; }
  for (const f of new Set(fields)) {
    if (maps.includes(f) || PAYLOAD_SCALARS.includes(f) || held.includes(f)) continue;
    flag(`app.js: flushSave() sends payload.${f}, which is neither on LOAD_FAILED_EMPTY_MAPS, a held-back LOAD_DEPENDENT_SAVE_KEYS category, nor a known scalar — after a failed load an empty map there would replace the student's whole record`);
  }
  for (const f of maps) if (!fields.includes(f)) flag(`app.js: LOAD_FAILED_EMPTY_MAPS names ${f}, but flushSave() never sends payload.${f} — stale entry`);
  const drop = body.search(/if\s*\(\s*progressLoadFailed\s*\)\s*\{\s*LOAD_FAILED_EMPTY_MAPS\.forEach\([\s\S]*?Object\.keys\(\s*payload\[\s*(\w+)\s*\]\s*\)\.length\)\s*delete\s+payload\[\s*\1\s*\]/);
  const lastStamp = body.lastIndexOf('FieldValue.delete()');
  const set = body.search(/\.set\(\s*payload\b/);
  if (drop < 0) flag('app.js: flushSave() no longer drops an empty LOAD_FAILED_EMPTY_MAPS field when progressLoadFailed — one save after a failed load replaces the map with {}');
  else if (set < 0) flag('app.js: flushSave() has no .set(payload …) — 1bo cannot place the drop');
  else if (drop > set) flag('app.js: flushSave() drops the empty maps AFTER .set(payload) — too late, the empty map was already sent');
  else if (lastStamp > drop) flag('app.js: flushSave() drops the empty maps before the FieldValue.delete() sentinels are stamped — a map holding only deletes would be dropped, and an emptied delete set could slip an empty map through');
  if (bad === 0) ok(`${maps.length} whole maps dropped while empty after a failed load; ${new Set(fields).size} payload fields, every one classified`);
}

/* 1bw. A JOURNEY "I'M READY" SAVE CANNOT WIPE THE SAVED ✓s (2026-10-26).
   tabs/journey.js saves songReady.<song> as {layer: true/false} with
   {merge:true}, which overwrites every layer the save names. Until this date
   a save could go out before the read of the student's doc had painted the
   saved ✓s — the boot flush ran BEFORE the read, the 800 ms debounce beat a
   slow read, and after a failed read every click wrote — so one tick wrote
   `false` over every layer saved on another day. The page now holds saves
   until the read settles (readState), sends only the layers clicked this
   load after a failed read or from a closing tab, and every layer once the
   read is in (resumeSongPick() in app.js counts the keys as the layer
   total). Same class as 1bo, the main app's copy.
   This EXECUTES the real journey.js in a vm against a fake page (five layer
   rows), a fake clock and a fake Firestore that merges the way the real one
   does (an empty map replaces), and plays each scenario through to what
   ends up stored. The scenario count is pinned. */
const JOURNEY_SAVE_SCENARIOS = 22;
async function checkJourneyReadySave() {
  head('1bw. A Journey "I\'m ready" save cannot wipe the saved ✓s');
  let src;
  try { src = readFileSync(join(ROOT, 'tabs/journey.js'), 'utf8'); }
  catch { err('tabs/journey.js unreadable — 1bw cannot check this'); problems++; return; }
  const SONG = 'the-cure';
  const drain = async () => { for (let i = 0; i < 30; i++) await new Promise(r => setImmediate(r)); };
  const parseSel = sel => /^(\w+)?((?:\.[\w-]+)*)(?::not\(\.([\w-]+)\))?(?:\[([\w-]+)(?:="([^"]*)")?\])?$/.exec(sel);
  const mergeInto = (target, data) => {
    for (const [k, v] of Object.entries(data)) {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        if (!Object.keys(v).length) { target[k] = {}; continue; }   // Firestore: an empty map in a merge replaces
        if (!target[k] || typeof target[k] !== 'object') target[k] = {};
        mergeInto(target[k], v);
      } else target[k] = v;
    }
  };
  const copy = x => JSON.parse(JSON.stringify(x === undefined ? null : x));
  async function makePage(opts) {
    const all = [];
    class El {
      constructor(tag, cls = [], attrs = {}) {
        this.tagName = tag.toUpperCase(); this.children = []; this.parentNode = null;
        this._cls = new Set(cls); this.dataset = {}; this.attrs = {}; this.style = {};
        this.checked = false; this.hidden = false; this.textContent = ''; this._html = '';
        for (const [k, v] of Object.entries(attrs)) this.setAttribute(k, v);
        const cl = this._cls;
        this.classList = { add: c => cl.add(c), remove: c => cl.delete(c), contains: c => cl.has(c),
          toggle: (c, on) => { const v = on === undefined ? !cl.has(c) : !!on; if (v) cl.add(c); else cl.delete(c); return v; } };
        all.push(this);
      }
      get id() { return this.attrs.id || ''; }
      setAttribute(k, v) { this.attrs[k] = String(v); if (k.startsWith('data-')) this.dataset[k.slice(5).replace(/-(\w)/g, (_, c) => c.toUpperCase())] = String(v); }
      getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
      removeAttribute(k) { delete this.attrs[k]; }
      appendChild(c) { c.parentNode = this; this.children.push(c); return c; }
      insertBefore(c, ref) { c.parentNode = this; const i = ref ? this.children.indexOf(ref) : -1; if (i < 0) this.children.push(c); else this.children.splice(i, 0, c); return c; }
      removeChild(c) { this.children = this.children.filter(x => x !== c); }
      get innerHTML() { return this._html; }
      set innerHTML(v) { this._html = v; }
      get firstChild() { return this.children[0] || null; }
      addEventListener() {}
      removeEventListener() {}
      scrollIntoView() {}
      getBoundingClientRect() { return { width: 0, left: 0 }; }
      matches(sel) {
        const m = parseSel(sel); if (!m) return false;
        const [, tag, clsPart, notCls, attr, val] = m;
        if (tag && this.tagName !== tag.toUpperCase()) return false;
        for (const c of (clsPart || '').split('.').filter(Boolean)) if (!this._cls.has(c)) return false;
        if (notCls && this._cls.has(notCls)) return false;
        if (attr) { const v = this.getAttribute(attr); if (v === null || (val !== undefined && v !== val)) return false; }
        return true;
      }
      closest(sel) { let e = this; while (e && e.matches) { if (e.matches(sel)) return e; e = e.parentNode; } return null; }
      querySelectorAll(sel) { const out = []; const walk = e => { for (const c of e.children) { if (c.matches(sel)) out.push(c); walk(c); } }; walk(this); return out; }
      querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
    }
    const body = new El('body');
    body.appendChild(new El('span', ['prog-pill']));
    const boxes = {};
    for (let n = 1; n <= 5; n++) {
      const sec = body.appendChild(new El('section', n === 1 ? ['layer'] : ['layer', 'closed'], { id: 'layer-' + n }));
      sec.appendChild(new El('button', ['layer-head']));
      sec.appendChild(new El('span', ['layer-rate-chip']));
      const lb = sec.appendChild(new El('div', [], { id: 'layer-' + n + '-body' }));
      boxes[n] = lb.appendChild(new El('div', ['ready-row'], { 'data-layer': String(n) })).appendChild(new El('input', ['ready-box']));
    }
    const attached = e => { while (e) { if (e === body) return true; e = e.parentNode; } return false; };
    const document = { body, readyState: 'complete', documentElement: { clientWidth: 1366 }, head: new El('head'),
      createElement: t => new El(t), getElementById: id => all.find(e => e.id === id && attached(e)) || null,
      querySelectorAll: s => body.querySelectorAll(s), querySelector: s => body.querySelector(s), addEventListener() {} };
    let now = 0, nextId = 1; const timers = [], listeners = {}, writes = [];
    const setT = (fn, ms) => { const id = nextId++; timers.push({ id, at: now + (ms || 0), fn }); return id; };
    const clearT = id => { const i = timers.findIndex(t => t.id === id); if (i >= 0) timers.splice(i, 1); };
    const docs = { s1: copy(opts.stored), s2: copy(opts.stored2) };
    let authCb = null;
    const auth = { currentUser: null, onAuthStateChanged(cb) { authCb = cb; } };
    const snapOf = uid => ({ exists: !!docs[uid], data: () => copy(docs[uid]) });
    const doSet = (uid, data) => { writes.push({ uid, data: copy(data) }); if (!docs[uid]) docs[uid] = {}; mergeInto(docs[uid], data); };
    /* A write commits after opts.writeDelay ms, and only while its own
       student is still signed in (the security rules refuse it otherwise). */
    const commit = (uid, data) => new Promise((res, rej) => {
      const go = () => { if (!auth.currentUser || auth.currentUser.uid !== uid) return rej(new Error('permission-denied')); doSet(uid, data); res(); };
      if (opts.writeDelay) setT(go, opts.writeDelay); else go();
    });
    const refOf = uid => ({ uid,
      /* opts.readSeq: one delay per read, in order. opts.snapAtSend: the read
         returns the doc as it was when SENT (a real read can be stale). */
      get: () => new Promise((res, rej) => {
        const d = (opts.readSeq && opts.readSeq.length) ? opts.readSeq.shift() : (opts.readDelays && opts.readDelays[uid]) ?? opts.readDelay ?? 0;
        const early = opts.snapAtSend ? { exists: !!docs[uid], data: (k => () => copy(k))(copy(docs[uid])) } : null;
        setT(() => (opts.readFails || (opts.readFailsFor && opts.readFailsFor[uid])) ? rej(new Error('offline')) : res(early || snapOf(uid)), d); }),
      set: data => commit(uid, copy(data)) });
    const db = { collection: () => ({ doc: uid => refOf(uid) }),
      runTransaction: fn => Promise.resolve().then(() => { let w = null; return Promise.resolve(fn({ get: r => Promise.resolve(snapOf(r.uid)), set: (r, data) => { w = [r.uid, copy(data)]; } }))
        .then(v => w ? commit(w[0], w[1]).then(() => v) : v); }) };
    const win = { document, console, setTimeout: setT, clearTimeout: clearT, requestAnimationFrame: () => 0, cancelAnimationFrame() {},
      location: { hash: '' }, history: { scrollRestoration: 'auto', replaceState() {}, length: 1 },
      scrollTo() {}, matchMedia: () => ({ matches: false }), getComputedStyle: () => ({ paddingLeft: '0', paddingRight: '0' }),
      addEventListener: (ev, fn) => { (listeners[ev] = listeners[ev] || []).push(fn); },
      t: k => k, getLang: () => 'en', setLang() {}, applyI18n() {},
      firebase: { initializeApp() {}, auth: () => auth, firestore: () => db }, firebaseConfig: {}, TEACHER_EMAIL: 'teacher@example.com', SONG_ID: SONG };
    win.window = win;
    /* opts.sdkDelay: the Firestore SDK is a <script> that lands that many ms after it is asked for. */
    if (opts.sdkDelay) {
      const fs = win.firebase.firestore; delete win.firebase.firestore;
      document.head.appendChild = sc => { sc.remove = () => {}; setT(() => { win.firebase.firestore = fs; sc.onload(); }, opts.sdkDelay); return sc; };
    }
    vm.createContext(win);
    vm.runInContext(src, win, { filename: 'tabs/journey.js' });
    if (typeof win.readyChanged !== 'function') throw new Error('journey.js has no readyChanged() — 1bw cannot tick a layer');
    const fire = ev => (listeners[ev] || []).forEach(fn => fn({}));
    const advance = async ms => {
      const target = now + ms;
      for (;;) {
        await drain();
        timers.sort((a, b) => a.at - b.at || a.id - b.id);
        const t = timers[0];
        if (!t || t.at > target) break;
        timers.shift(); now = t.at; t.fn();
      }
      now = target; await drain();
    };
    return { writes, docs, advance,
      load: () => fire('load'), pagehide: () => fire('pagehide'),
      signIn: async uid => { auth.currentUser = { uid, email: uid + '@example.com' }; authCb(auth.currentUser); await drain(); },
      signOut: async () => { auth.currentUser = null; authCb(null); await drain(); },
      click: async (n, on = true) => { boxes[n].checked = on; win.readyChanged(boxes[n]); await drain(); },
      mutate: (uid, fn) => fn(docs[uid]),   // another tab's write, straight into the store
      saved: (uid = 's1') => (docs[uid] && docs[uid].songReady && docs[uid].songReady[SONG]) || {} };
  }
  const marked = layers => ({ migrations: { swap45: true }, songReady: { [SONG]: layers } });
  const fmt = m => JSON.stringify(Object.keys(m || {}).sort().reduce((o, k) => (o[k] = m[k], o), {}));
  const want = (p, w, uid) => [fmt(p.saved(uid)) === fmt(w), fmt(p.saved(uid))];
  const T123 = { 1: true, 2: true, 3: true, 4: false, 5: false };
  const scenarios = [
    ['boot race: a tick before sign-in, then a 3 s read', async () => {
      const p = await makePage({ stored: marked(T123), readDelay: 3000 });
      await p.click(4); p.load(); await p.signIn('s1'); await p.advance(6000);
      return want(p, { ...T123, 4: true }); }],
    ['slow read: a tick after sign-in, before the 3 s read lands', async () => {
      const p = await makePage({ stored: marked(T123), readDelay: 3000 });
      p.load(); await p.signIn('s1'); await p.advance(10); await p.click(4); await p.advance(6000);
      return want(p, { ...T123, 4: true }); }],
    ['failed read, marked doc: one tick', async () => {
      const p = await makePage({ stored: marked(T123), readFails: true });
      p.load(); await p.signIn('s1'); await p.advance(10); await p.click(4); await p.advance(3000);
      return want(p, { ...T123, 4: true }); }],
    ['failed read, unmarked (old-numbering) doc through the swap45 transaction: one tick', async () => {
      const p = await makePage({ stored: { songReady: { [SONG]: { 1: true, 2: true, 3: true, 4: false, 5: true } } }, readFails: true });
      p.load(); await p.signIn('s1'); await p.advance(10); await p.click(5); await p.advance(3000);
      return want(p, { 1: true, 2: true, 3: true, 4: true, 5: true }); }],
    ['tab closed while the read is out: the tick is kept, nothing erased', async () => {
      const p = await makePage({ stored: marked(T123), readDelay: 5000 });
      p.load(); await p.signIn('s1'); await p.advance(10); await p.click(4); p.pagehide(); await p.advance(100);
      return want(p, { ...T123, 4: true }); }],
    ['failed read: tick then untick writes only that layer', async () => {
      const p = await makePage({ stored: marked({ ...T123, 4: true }), readFails: true });
      p.load(); await p.signIn('s1'); await p.advance(10); await p.click(4, true); await p.click(4, false); await p.advance(3000);
      return want(p, T123); }],
    ['read landed: a tick writes all 5 layer keys (resumeSongPick counts them)', async () => {
      const p = await makePage({ stored: { migrations: { swap45: true } }, readDelay: 50 });
      p.load(); await p.signIn('s1'); await p.advance(200); await p.click(1); await p.advance(2000);
      return want(p, { 1: true, 2: false, 3: false, 4: false, 5: false }); }],
    ['boot tick on a new song: written once the read lands, all 5 keys', async () => {
      const p = await makePage({ stored: { migrations: { swap45: true } }, readDelay: 3000 });
      await p.click(2); p.load(); await p.signIn('s1'); await p.advance(6000);
      return want(p, { 1: false, 2: true, 3: false, 4: false, 5: false }); }],
    ['shared Chromebook: the next student\'s doc is untouched', async () => {
      const s2 = { 1: false, 2: true, 3: false, 4: false, 5: false };
      const p = await makePage({ stored: marked({ 1: true }), stored2: marked(s2), readDelay: 50, readDelays: { s2: 3000 } });
      p.load(); await p.signIn('s1'); await p.advance(200); await p.click(3); await p.advance(2000);
      await p.signOut(); await p.signIn('s2'); await p.advance(6000);
      const [ok2, got] = want(p, s2, 's2');
      return [ok2 && p.saved('s1')[3] === true, got]; }],
    ['ticks made signed out never reach the next sign-in', async () => {
      const s2 = { 1: true, 2: true, 3: false, 4: false, 5: false };
      const p = await makePage({ stored2: marked(s2), readDelay: 1000 });
      p.load(); await p.signOut(); await p.click(4); await p.signIn('s2'); await p.advance(4000);
      const [ok2, got] = want(p, s2, 's2');
      return [ok2 && p.writes.length === 0, `${got}, ${p.writes.length} write(s)`]; }],
    ['shared Chromebook: the next student ticks before their read lands', async () => {
      const s2 = { 1: true, 2: true, 3: true, 4: false, 5: false };
      const p = await makePage({ stored: marked({ 1: true }), stored2: marked(s2), readDelay: 50, readDelays: { s2: 3000 } });
      p.load(); await p.signIn('s1'); await p.advance(200); await p.signOut(); await p.signIn('s2'); await p.click(4); await p.advance(6000);
      return want(p, { ...s2, 4: true }, 's2'); }],
    ['shared Chromebook: the last student\'s ticks are cleared at sign-out', async () => {
      const p = await makePage({ stored: marked(T123), stored2: marked({ 1: true }), readDelay: 50 });
      p.load(); await p.signIn('s1'); await p.advance(200); await p.click(4); await p.advance(2000);
      await p.signOut(); await p.signIn('s2'); await p.advance(200); await p.click(2); await p.advance(2000);
      return want(p, { 1: true, 2: true, 3: false, 4: false, 5: false }, 's2'); }],
    ['slow read that then fails: a tick made while it was out is still written', async () => {
      const p = await makePage({ stored: marked(T123), readDelay: 3000, readFails: true });
      p.load(); await p.signIn('s1'); await p.advance(10); await p.click(4); await p.advance(6000);
      return want(p, { ...T123, 4: true }); }],
    ['new song, slow read: the tick waits for the read, then all 5 keys', async () => {
      const p = await makePage({ stored: { migrations: { swap45: true } }, readDelay: 3000 });
      p.load(); await p.signIn('s1'); await p.advance(10); await p.click(4); await p.advance(6000);
      return want(p, { 1: false, 2: false, 3: false, 4: true, 5: false }); }],
    ['a save refused after the student left is not retried into the next student\'s doc', async () => {
      const p = await makePage({ stored: { songReady: { [SONG]: { 1: true } } }, stored2: marked({}), readDelay: 50, readDelays: { s2: 3000 }, writeDelay: 2000 });
      p.load(); await p.signIn('s1'); await p.advance(200); await p.click(2); await p.advance(900);
      await p.signOut(); await p.signIn('s2'); await p.advance(8000);
      const got = fmt(p.saved('s2'));
      return [got === '{}', got]; }],
    ['the SDK landing after a sign-out does not bring the student back', async () => {
      const p = await makePage({ stored: marked(T123), readDelay: 50, sdkDelay: 2000 });
      p.load(); await p.signIn('s1'); await p.advance(100); await p.signOut(); await p.advance(2000);
      await p.click(4); await p.click(5); await p.advance(1000); await p.signIn('s1'); await p.advance(3000);
      return want(p, T123); }],
    ['the last student\'s read failing late does not change how the next one saves', async () => {
      const p = await makePage({ stored: marked(T123), stored2: { migrations: { swap45: true } }, readDelays: { s1: 2000, s2: 4000 }, readFailsFor: { s1: true } });
      p.load(); await p.signIn('s1'); await p.advance(100); await p.signOut(); await p.signIn('s2'); await p.advance(50); await p.click(4); await p.advance(8000);
      return want(p, { 1: false, 2: false, 3: false, 4: true, 5: false }, 's2'); }],
    ['a stale read from before a sign-out/in does not overwrite another tab\'s save', async () => {
      const p = await makePage({ stored: marked({ 1: true, 2: false, 3: false, 4: false, 5: false }), snapAtSend: true, readSeq: [5000, 6000] });
      p.load(); await p.signIn('s1'); await p.advance(100);
      p.mutate('s1', d => { d.songReady[SONG][3] = true; });
      await p.signOut(); await p.signIn('s1'); await p.advance(100); await p.click(5); await p.advance(9000);
      return want(p, { 1: true, 2: false, 3: true, 4: false, 5: true }); }],
    ['direct switch to the next student (no sign-out): the last student\'s tick stays out', async () => {
      const p = await makePage({ stored: marked(T123), stored2: marked({ 1: false, 2: false, 3: false, 4: false, 5: false }), readDelay: 50 });
      p.load(); await p.signIn('s1'); await p.advance(200); await p.click(4); await p.advance(2000);
      await p.signIn('s2'); await p.advance(1000); await p.click(5); await p.advance(2000);
      return want(p, { 1: false, 2: false, 3: false, 4: false, 5: true }, 's2'); }],
    ['a tick made signed out stays out when the next student signs in and ticks', async () => {
      const p = await makePage({ stored2: marked({ 1: false, 2: false, 3: false, 4: false, 5: false }), readDelay: 50 });
      p.load(); await p.signOut(); await p.click(4); await p.signIn('s2'); await p.advance(1000); await p.click(1); await p.advance(2000);
      return want(p, { 1: true, 2: false, 3: false, 4: false, 5: false }, 's2'); }],
    ['direct switch from a marked doc to an unmarked one whose read fails: saved in its old numbering', async () => {
      const p = await makePage({ stored: marked({ 1: true }), stored2: { songReady: { [SONG]: { 1: true } } }, readDelay: 50, readFailsFor: { s2: true } });
      p.load(); await p.signIn('s1'); await p.advance(200); await p.signIn('s2'); await p.advance(1000); await p.click(5); await p.advance(2000);
      return want(p, { 1: true, 4: true }, 's2'); }],
    ['an unmarked doc\'s Layer 4/5 ticks are shown and saved in the right numbering', async () => {
      const p = await makePage({ stored: { songReady: { [SONG]: { 1: true, 2: false, 3: false, 4: true, 5: false } } }, readDelay: 50 });
      p.load(); await p.signIn('s1'); await p.advance(200); await p.click(2); await p.advance(2000);
      return want(p, { 1: true, 2: true, 3: false, 4: true, 5: false }); }]
  ];
  let bad = 0;
  if (scenarios.length !== JOURNEY_SAVE_SCENARIOS) { err(`1bw: ${scenarios.length} scenarios, pinned at ${JOURNEY_SAVE_SCENARIOS} — bump the pin on purpose`); problems++; bad++; }
  for (const [name, run] of scenarios) {
    let res;
    try { res = await run(); } catch (e) { res = [false, `threw: ${e && e.message}`]; }
    if (!res[0]) { err(`tabs/journey.js — ${name}: stored ${res[1]}`); problems++; bad++; }
  }
  if (bad === 0) ok(`${scenarios.length} save scenarios run against tabs/journey.js — no saved ✓ erased, every layer key written once the read is in`);
}

/* 1bm. A CARD SECTION'S CAPTION COUNTS WITH ITS BADGE'S WORD (2026-10-06).
   A section with a `repLabel` shows a badge ("Lap 1 of 3"); its caption must
   count in the same word — "3 laps" under a Lap badge, "2 times" under a Time
   badge — never one word in the caption and another in the badge. Found twice
   (4 sections 2026-10-05, 8 on 2026-10-06), so it is a detector now. The badge
   words are a whitelist: a new pair has to be added here on purpose. */
const REP_BADGE_WORDS = {
  'Lap|Vuelta':    { en: 'laps?|times?', es: 'vueltas?|vez|veces', allowEn: 'laps?',  allowEs: 'vueltas?' },
  'Time|Vez':      { en: 'laps?|times?', es: 'vueltas?|vez|veces', allowEn: 'times?', allowEs: 'vez|veces' },
  'Verse|Estrofa': { en: 'laps?|times?', es: 'vueltas?|vez|veces', allowEn: null,     allowEs: null }
};
function checkCardCaptionWords() {
  head('1bm. A card section\'s caption counts with its badge\'s word');
  let activities = [];
  try {
    const src = readFileSync(join(ROOT, 'class-activities.js'), 'utf8');
    const sandbox = { console };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(src, sandbox, { filename: 'class-activities.js' });
    activities = sandbox.CLASS_ACTIVITIES || [];
  } catch { return; /* reported by 1d */ }
  let bad = 0, checked = 0;
  const flag = m => { err(m); problems++; bad++; };
  for (const a of activities) {
    if (!a || a.view !== 'card' || !a.card || !Array.isArray(a.card.sections)) continue;
    a.card.sections.forEach((sec, si) => {
      if (!sec || !sec.repLabel) return;
      checked++;
      const where = `${a.id} · card.sections[${si}]`;
      const rule = REP_BADGE_WORDS[`${sec.repLabel}|${sec.repLabel_es}`];
      if (!rule) { flag(`${where}: badge pair "${sec.repLabel}" / "${sec.repLabel_es}" is not in REP_BADGE_WORDS — add it to the table on purpose`); return; }
      const scan = (text, bannedRe, allowRe, lang) => {
        for (const m of String(text || '').matchAll(new RegExp(`\\b(${bannedRe})\\b`, 'gi'))) {
          if (allowRe && new RegExp(`^(${allowRe})$`, 'i').test(m[1])) continue;
          flag(`${where}: ${lang} caption says "${m[1]}" but the badge reads "${lang === 'English' ? sec.repLabel : sec.repLabel_es} 1 of ${sec.reps}" — one counting word per section ("${String(text).trim()}")`);
        }
      };
      scan(sec.caption, rule.en, rule.allowEn, 'English');
      scan(sec.caption_es, rule.es, rule.allowEs, 'Spanish');
    });
  }
  if (checked === 0) { err('1bm checked no card section with a repLabel — it cannot see what it is supposed to guard'); problems++; return; }
  if (bad === 0) ok(`${checked} card sections with a repeat badge — every caption counts in its badge's word, both languages`);
}

/* 1bg. REP-COUNT DOTS, EN/ES PARITY (2026-09-28 sweep). repCountFromGotIt()
   in app.js turns a "You've got it when: N ... in a row" sentence into N tap
   dots — but its regex named the phrase, not the grammar, and Spanish
   "compases SEGUIDOS" (masculine plural, the noun this site actually counts)
   wasn't one of the forms it matched, only "seguidas"/"seguido". English got
   dots, Spanish silently got none, on 14+ cards across Modules 3–6, 8 and 12
   before this was caught. Reuses the REAL regex and function straight out of
   the render context (rcCtx) rather than a second copy here, so a future
   change to the wording it accepts can't drift the two apart again — only
   the "cut the sentence out of the field" step is duplicated, which is
   simple enough that a regex-literal apostrophe can't desync it the way
   topLevelFunctionDecls's own comment warns about elsewhere in this file. */
/* Pinned (2026-09-28 double-check): a "You've got it when:" label reworded
   in ONE language used to drop the field out of the check silently — and a
   one-sided label is itself the bug (dots in one language, none in the
   other), so it fails outright now rather than being skipped. Bump when a
   card genuinely adds or removes a got-it sentence in both languages. */
const REP_COUNT_FIELDS = 420;   // 2026-11-04: ca-47 merged into ca-46 as its chunks path (-3 ca-47, -3 old ca-46, +7: full 2, chunks 3, shared 2). 2026-11-04: ca-47 step 1 loses its got-it and tip (-1). 2026-11-03: ca-47 strum pattern in chunks, four Practice steps (+4). 2026-11-03: ca-46 strum pattern, three Practice steps (+3). 2026-10-21: m3w2 three-note power chords, two appended steps (+2). 2026-10-16: Module 5 clean-up, the Lauren Bateman watch step gets a countable got-it (+1). 2026-10-16: ca-34's three power-chord step texts (text_power, +3). 2026-10-14: ca-34 rebuilt — D chord and whole-song steps (+1), then requinto intro and outro steps (+2). 2026-10-13: ca-34 Las Mañanitas, four Practice steps (+4). 2026-10-12: m6-m8 Smoke on the Water watch step + A-shape watch card get a countable got-it (+2). 2026-10-12: 17 Challenge cards in Modules 9-11 get a countable got-it (+17, see 1ar2). 2026-10-07: part cards lose their help ladders too (-8). 2026-10-07: whole-song cards lose their help ladders (-13). 2026-10-06: m12w3 melody-on-top gets a countable got-it (+1). 2026-10-05: ca-27 Luna (+1) and ca-28 Sweet Child (+2) whole songs; ca-29..ca-33 power-chord whole songs (+6). 2026-10-01: ca-13/ca-19/ca-20 as practice cards (-7), ca-25 Seven Nation Army whole song (+2), ca-21 Lines 2 and 4 restored (+2), ca-26 Watchtower whole song (+1)
function checkRepCountParity(sets, ctx) {
  head('1bg. Rep-count dots agree between English and Spanish');
  if (!ctx) { err('1bg cannot run — render context unavailable'); problems++; return; }
  const gotItRe = vm.runInContext('typeof GOT_IT_RE !== "undefined" ? GOT_IT_RE : null', ctx);
  const repCountFromGotIt = vm.runInContext('typeof repCountFromGotIt === "function" ? repCountFromGotIt : null', ctx);
  // A rename in app.js must fail here, not turn the check off (0b's rule).
  if (!gotItRe || !repCountFromGotIt) { err('1bg cannot run — GOT_IT_RE / repCountFromGotIt not found in app.js (renamed? update this check with it)'); problems++; return; }
  const extractBody = html => {
    if (typeof html !== 'string') return null;
    const m = gotItRe.exec(html);
    if (!m) return null;
    const rest = html.slice(m.index + m[0].length);
    const tagAt = rest.search(/<(?:span|a|div|img)\b/i);
    let cut = tagAt >= 0 ? tagAt : rest.length;
    const sentence = /\.(?=\s|$)/.exec(rest.slice(0, cut));
    if (sentence) cut = sentence.index + 1;
    return rest.slice(0, cut);
  };
  let bad = 0, checked = 0;
  const flag = (where, enN, esN) => {
    err(`${where}: "You've got it when" gives ${enN} tap dot${enN === 1 ? '' : 's'} in English but ${esN} in Spanish — one language names a rep count the other doesn't`);
    problems++; bad++;
  };
  const seen = new Set();
  const visit = (obj, where) => {
    if (!obj || typeof obj !== 'object' || seen.has(obj)) return;
    if (typeof obj === 'object') seen.add(obj);
    if (Array.isArray(obj)) { obj.forEach((v, i) => visit(v, `${where}[${i}]`)); return; }
    for (const k of Object.keys(obj)) {
      if (k.endsWith('_es')) continue;
      const v = obj[k];
      if (typeof v === 'string' && typeof obj[k + '_es'] === 'string') {
        const enBody = extractBody(v), esBody = extractBody(obj[k + '_es']);
        if (enBody !== null && esBody !== null) {
          checked++;
          const enN = repCountFromGotIt(enBody), esN = repCountFromGotIt(esBody);
          if (enN !== esN) flag(`${where}.${k}`, enN, esN);
        } else if (enBody !== null || esBody !== null) {
          err(`${where}.${k}: "You've got it when:" / "Lo tienes cuando:" appears in ${enBody !== null ? 'English' : 'Spanish'} only — the other language renders no got-it sentence and no dots`);
          problems++; bad++;
        }
      } else if (v && typeof v === 'object') {
        visit(v, `${where}.${k}`);
      }
    }
  };
  for (const w of (sets || [])) visit(w, w.id);
  const activities = vm.runInContext('typeof CLASS_ACTIVITIES !== "undefined" ? CLASS_ACTIVITIES : []', ctx) || [];
  for (const a of activities) visit(a, a.id);
  if (checked !== REP_COUNT_FIELDS) {
    err(`1bg: ${checked} got-it fields checked, but REP_COUNT_FIELDS pins ${REP_COUNT_FIELDS} — a got-it sentence was added, removed or reworded past GOT_IT_RE; bump the pin on purpose`);
    problems++; bad++;
  }
  if (bad === 0) ok(`${checked} "You've got it when" field${checked === 1 ? '' : 's'} checked (pinned) — English and Spanish always agree on the rep-count dots`);
}

/* 1bh. JOURNEY "SLOW (N BPM)" LABELS ↔ data-bpm-slow (2026-09-28 sweep). A
   Journey page's own #playalong-frame carries the ground truth for what its
   🐢 Slow button actually plays (data-bpm-slow); prose elsewhere on the same
   page names that same number by hand, and a track-tempo swap has twice now
   updated the frame and the page's own top note but missed a second mention
   lower down (Watchtower's Hendrix swap, "the cure"'s felt-beat click) —
   both shipped live with the wrong number until this sweep caught them. */
/* Pinned (2026-09-28 double-check): a frame that loses data-bpm-slow used
   to drop its whole page out of this check silently. Bump when a page
   gains or loses a Slow tier on purpose. */
const JOURNEY_SLOW_PAGES = 4;
function checkJourneySlowBpmLabels() {
  head('1bh. Journey "Slow (N BPM)" labels match data-bpm-slow');
  let bad = 0, pages = 0;
  const flag = m => { err(m); problems++; bad++; };
  for (const f of TAB_PAGES) {
    if (!f.endsWith('.html')) continue;
    let src;
    try { src = readFileSync(join(ROOT, f), 'utf8'); } catch { continue; }
    const m = /data-bpm-slow="(\d+)"/.exec(src);
    if (!m) continue;
    const want = m[1];
    pages++;
    // Two spellings the pages use: "Slow (60 BPM)" in any case, with a
    // plain or non-breaking space, and "Press 🐢 Slow for 100 BPM" /
    // "Lento para 100 BPM" — the latter only with the button's own capital,
    // so "play it slow at 60 BPM" prose about practice speed isn't read as
    // the tier.
    const SP = '(?:\\s|&nbsp;)';
    const res = [
      new RegExp(`(?:Slow|Lento)${SP}*\\(${SP}*(\\d+)${SP}*BPM${SP}*\\)`, 'gi'),
      new RegExp(`(?:Slow|Lento)${SP}+(?:for|para|at|a)${SP}+(\\d+)${SP}*BPM`, 'g'),
    ];
    for (const re of res) {
      let mm;
      while ((mm = re.exec(src))) {
        if (mm[1] !== want) flag(`${f}: says "${mm[0]}" but this page's Slow tier is ${want} BPM per its own data-bpm-slow`);
      }
    }
  }
  if (pages !== JOURNEY_SLOW_PAGES) {
    err(`1bh: ${pages} Journey page${pages === 1 ? '' : 's'} carry data-bpm-slow, but JOURNEY_SLOW_PAGES pins ${JOURNEY_SLOW_PAGES} — a page gained or lost its Slow tier; bump the pin on purpose`);
    problems++; bad++;
  }
  if (bad === 0) ok(`${pages} Journey page${pages === 1 ? '' : 's'} with a Slow tier (pinned) — every "Slow (N BPM)" mention matches data-bpm-slow`);
}

/* ── 1bj. Recorded guitar notes ────────────────────────────────────────
   app.js plays every pluck from GUITAR_NOTE_FILES (2026-10-01) and falls
   back to the Karplus-Strong synth for any note whose file doesn't load.
   That fallback is the point — a student offline before the first download
   still hears something — but it also means a missing or misnamed file
   fails SILENTLY: that one note just sounds synthetic, on every device,
   and nobody files a bug about a note sounding slightly worse. So: every
   semitone from GUITAR_NOTE_LOW to GUITAR_NOTE_HIGH has an entry, every
   entry's file exists, its name carries its own midi number and note
   name (so a file can't be wired to the wrong key), and the count is
   pinned. 1x covers the other direction (a guitar-note file on disk that
   nothing references). */
/* ════════════════════════════════════════════════════════════════════
   1bl. A PEEKED SET SAVES NOTHING — a locked set can be opened read-only
   (the "set-peek" preview). toggleSkill, the step Done button and the
   drill check-offs always refused to write from inside one; the three
   functions that save an ANSWER did not, until 2026-10-01: a student
   locked out of Module 3 could tap a keyed quiz choice in the preview
   and it was stored under a Module 3 key. The module regimes
   (rule-zero-proof.mjs) and the keyed-MC freeze (1ap) both rest on
   "nobody has written anything in the module above the class", so this
   pins the guard: every function that assigns into `responses[...]`
   must call isPeekedResponseKey() first, and the count of such
   functions is pinned so a new writer cannot arrive unguarded.
   ════════════════════════════════════════════════════════════════════ */
const RESPONSE_WRITERS = ['onResponseChange', 'onStepMcSelect', 'onPracticeMcSelect'];
function checkPeekSavesNothing() {
  head('1bl. A read-only set preview saves no answers');
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  let src;
  try { src = stripJsComments(readFileSync(join(ROOT, 'app.js'), 'utf8')); }
  catch { flag('app.js unreadable — 1bl cannot check this'); return; }
  if (!/function isPeekedResponseKey\s*\(/.test(src)) flag('app.js: isPeekedResponseKey() is gone — the read-only preview of a locked set can save answers again');
  for (const fn of RESPONSE_WRITERS) {
    const body = jsFunctionBody(src, fn);
    if (body === null) { flag(`app.js: no ${fn}() found — 1bl cannot tell whether it is guarded; update RESPONSE_WRITERS if it was renamed`); continue; }
    const guard = body.search(/isPeekedResponseKey\s*\(/), write = body.search(/\bresponses\s*\[[^\]]*\]\s*=[^=]/);
    if (write < 0) flag(`app.js: ${fn}() no longer writes responses[...] — drop it from RESPONSE_WRITERS`);
    else if (guard < 0 || guard > write) flag(`app.js: ${fn}() writes responses[...] without checking isPeekedResponseKey() first — a locked-out student could save an answer from the read-only preview`);
  }
  const writes = [...src.matchAll(/\bresponses\s*\[[^\]]*\]\s*=[^=]/g)].length;
  const inWriters = RESPONSE_WRITERS.reduce((n, fn) => n + [...(jsFunctionBody(src, fn) || '').matchAll(/\bresponses\s*\[[^\]]*\]\s*=[^=]/g)].length, 0);
  if (writes !== inWriters)
    flag(`app.js: ${writes} assignment(s) into responses[...] but only ${inWriters} inside the guarded writers (${RESPONSE_WRITERS.join(', ')}) — a new writer needs the isPeekedResponseKey() guard and a place on RESPONSE_WRITERS`);
  if (bad === 0) ok(`${RESPONSE_WRITERS.length} response writers, ${writes} writes — every one checks isPeekedResponseKey() first`);
}

/* ════════════════════════════════════════════════════════════════════
   1bk. THE SITE MAKES ITS OWN CLICK — no metronome mixes (2026-10-01).
   Every Metronome button used to swap to a second copy of the track with a
   Moises click baked in: 21 files, 219 MB, half of audio/. Practice cards
   never used them, "the cure"'s Song Journey page stopped on 2026-09-27,
   and from 2026-10-01 the other Song Journey pages and the step snippet
   make the click too, so the files are gone (Let It Be's one is all that is
   left — that page still swaps files, by Jonathan's call to leave the song
   alone for now).

   A Song Journey page gets its click one of two ways (tabs/journey.js):
   data-click-anchor + counted data-bpm / data-bpm-slow for a steady track,
   or data-click-bars — every bar's downbeat on the fast file — for a band
   that drifts. Those numbers are a hand-kept copy of SNIPPET_TRACKS in
   app.js (the pages have no app.js), which is the drift this guards:
     - a page with either may not ALSO name a metronome file;
     - data-click-bars rises, ends inside the file, and comes with a whole
       data-click-beats;
     - against SNIPPET_TRACKS[<page slug>]: the list IS barTimes, number
       for number — or, on a steady track, holds `anchor` and runs on at
       the track's bar length from there; data-click-anchor IS `anchor`;
       and a page with a slow tier scales by trackBpm / trackBpmSlow;
     - the number of pages making their own click is pinned;
     - audio/ holds no metronome mix but the allow-listed one. A Moises
       metronome export is a measuring input for tools/beat-map.py and
       stays out of the repo.
   ════════════════════════════════════════════════════════════════════ */
const JOURNEY_CLICK_PAGES = 5;   // the-cure (anchor), seven-nation-army, sweet-child-o-mine, all-along-the-watchtower, luna (bars)
const METRONOME_MIXES_ALLOWED = ['the-beatles-let-it-be-backing-C-71bpm-440hz-rhythm-down-metronome.mp3'];
function checkSiteMadeClick() {
  head('1bk. The site makes its own click');
  let bad = 0, clickPages = 0;
  const flag = m => { err(m); problems++; bad++; };
  let TRACKS = {};
  try { TRACKS = loadConstObject(readFileSync(join(ROOT, 'app.js'), 'utf8'), 'SNIPPET_TRACKS'); }
  catch (e) { flag(`app.js: could not load SNIPPET_TRACKS — ${e.message}`); return; }
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  for (const page of TAB_PAGES.filter(p => p.endsWith('.html'))) {
    let src;
    try { src = readFileSync(join(ROOT, page), 'utf8'); } catch { continue; }
    const box = src.match(/<div\b[^>]*\bid="playalong-frame"[^>]*>/);
    if (!box) continue;
    const d = {};
    for (const m of box[0].matchAll(/\bdata-([a-z-]+)="([^"]*)"/g)) d[m[1]] = m[2];
    const hasBars = d['click-bars'] !== undefined, hasAnchor = d['click-anchor'] !== undefined;
    if (!hasBars && !hasAnchor) continue;
    clickPages++;
    const slug = page.replace(/^.*\//, '').replace(/\.html$/, '');
    const tr = TRACKS[slug];
    for (const k of Object.keys(d)) {
      if (/^audio.*metronome$/.test(k))
        flag(`${page}: makes its own click (data-click-${hasBars ? 'bars' : 'anchor'}) but still names data-${k} — journey.js would never play that file; delete the attribute`);
    }
    if (hasBars && hasAnchor)
      flag(`${page}: declares both data-click-bars and data-click-anchor — journey.js uses the bar list and ignores the anchor; keep one`);
    if (d['audio-slow'] !== undefined) {
      const bpm = Number(d.bpm), slow = Number(d['bpm-slow']);
      if (!(bpm > 0) || !(slow > 0)) flag(`${page}: has a Slow tier but no data-bpm / data-bpm-slow — the click cannot be rescaled onto the slow file`);
      else if (tr && !near(bpm / slow, tr.trackBpm / tr.trackBpmSlow, 1e-6))
        flag(`${page}: data-bpm / data-bpm-slow is ${bpm}/${slow} but SNIPPET_TRACKS['${slug}'] stretches by ${tr.trackBpm}/${tr.trackBpmSlow} — the click would slide off the slow file`);
    }
    if (hasAnchor && !hasBars) {
      if (!tr) flag(`${page}: data-click-anchor with no SNIPPET_TRACKS['${slug}'] to check it against`);
      else if (!near(Number(d['click-anchor']), tr.anchor, 0.0005))
        flag(`${page}: data-click-anchor is ${d['click-anchor']} but SNIPPET_TRACKS['${slug}'].anchor is ${tr.anchor} — one measured number, two copies`);
    }
    if (!hasBars) continue;
    const raw = d['click-bars'].split(',');
    const bars = raw.map(Number);
    if (bars.length < 2 || bars.some(v => !Number.isFinite(v))) { flag(`${page}: data-click-bars is not a list of numbers`); continue; }
    if (!/^[1-9]\d*$/.test(d['click-beats'] || ''))
      flag(`${page}: data-click-bars needs data-click-beats (clicks per bar, a whole number) — got "${d['click-beats']}"`);
    const dip = bars.findIndex((v, i) => i > 0 && v <= bars[i - 1]);
    if (dip > 0) flag(`${page}: data-click-bars goes backwards at entry ${dip + 1} (${bars[dip - 1]} → ${bars[dip]})`);
    const audio = d.audio && join(ROOT, 'tabs', d.audio);
    const dur = audio && existsSync(audio) ? mp3DurationSec(audio) : null;
    if (dur !== null && bars[bars.length - 1] > dur)
      flag(`${page}: data-click-bars runs to ${bars[bars.length - 1]}s but ${d.audio} is ${dur.toFixed(1)}s long`);
    if (!tr) { flag(`${page}: data-click-bars with no SNIPPET_TRACKS['${slug}'] to check it against`); continue; }
    if (Array.isArray(tr.barTimes) && tr.barTimes.length > 1) {
      if (bars.length !== tr.barTimes.length)
        flag(`${page}: data-click-bars has ${bars.length} downbeats but SNIPPET_TRACKS['${slug}'].barTimes has ${tr.barTimes.length} — the page's list is a copy of that one; re-copy it`);
      else {
        const off = bars.findIndex((v, i) => !near(v, tr.barTimes[i], 0.0005));
        if (off >= 0) flag(`${page}: data-click-bars entry ${off + 1} is ${bars[off]} but barTimes has ${tr.barTimes[off]} — the page's list is a copy of SNIPPET_TRACKS['${slug}'].barTimes; re-copy it`);
      }
    } else {
      const at = bars.findIndex(v => near(v, tr.anchor, 0.0015));
      const bar = tr.beatsPerBar * 60 / tr.feltBpm;
      if (at < 0) flag(`${page}: data-click-bars never lands on SNIPPET_TRACKS['${slug}'].anchor (${tr.anchor}) — a steady track's list must pass through its one measured downbeat`);
      else {
        const off = bars.findIndex((v, i) => i > at && !near(v - bars[i - 1], bar, 0.002));
        if (off >= 0) flag(`${page}: data-click-bars entry ${off + 1} is ${(bars[off] - bars[off - 1]).toFixed(3)}s after the one before, but a bar of this steady track is ${bar.toFixed(3)}s`);
      }
    }
  }
  if (clickPages !== JOURNEY_CLICK_PAGES)
    flag(`${clickPages} Song Journey page(s) make their own click, expected ${JOURNEY_CLICK_PAGES} — if that change is on purpose, update JOURNEY_CLICK_PAGES`);
  /* snippetSrc(track, slow, guitar) lost its `metro` argument with the files.
     A caller still passing four would hand `false` to `guitar` and silently
     play the rhythm-down mix with the Guitar button lit — which is exactly
     what the two practice-card callers did in the working copy on
     2026-10-01, caught by a browser test before it was committed. */
  const appSrc = stripJsComments(readFileSync(join(ROOT, 'app.js'), 'utf8'));
  const calls = [...appSrc.matchAll(/\bsnippetSrc\(([^()]*)\)/g)];
  if (!calls.length) flag('app.js: no snippetSrc() call found — 1bk cannot check its callers');
  for (const m of calls) {
    if (m[1].split(',').length !== 3)
      flag(`app.js: snippetSrc(${m[1].trim()}) — it takes (track, slow, guitar); a fourth argument is the retired \`metro\` flag and shifts \`guitar\` out`);
  }
  let mixes = [];
  try { mixes = readdirSync(join(ROOT, 'audio')).filter(f => /metronome\.(mp3|m4a|wav|ogg)$/i.test(f)); } catch { /* no audio/ */ }
  for (const f of mixes) {
    if (!METRONOME_MIXES_ALLOWED.includes(f))
      flag(`audio/${f}: a metronome mix — the site makes its own click, so nothing plays this file. A Moises metronome export is only a measuring input for tools/beat-map.py; keep it out of the repo`);
  }
  for (const f of METRONOME_MIXES_ALLOWED) {
    if (!mixes.includes(f)) flag(`audio/${f} is on METRONOME_MIXES_ALLOWED but is not in audio/ — if its page now makes its own click, drop it from the list`);
  }
  if (bad === 0) ok(`${clickPages} Song Journey pages make their own click (pinned), every beat map agrees with SNIPPET_TRACKS; audio/ holds ${mixes.length} metronome mix (allow-listed)`);
}

const GUITAR_NOTE_COUNT = 35;
function checkGuitarNotes() {
  head('1bj. Recorded guitar notes');
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  let src, files;
  try {
    src = readFileSync(join(ROOT, 'app.js'), 'utf8');
    files = loadConstObject(src, 'GUITAR_NOTE_FILES');
  } catch (e) { flag(`could not read GUITAR_NOTE_FILES from app.js: ${e.message}`); return; }
  const range = /const GUITAR_NOTE_LOW = (\d+), GUITAR_NOTE_HIGH = (\d+);/.exec(src);
  if (!range) { flag('app.js: could not find "const GUITAR_NOTE_LOW = N, GUITAR_NOTE_HIGH = N;"'); return; }
  const lo = Number(range[1]), hi = Number(range[2]);
  const NAMES = ['c', 'cs', 'd', 'ds', 'e', 'f', 'fs', 'g', 'gs', 'a', 'as', 'b'];
  for (let m = lo; m <= hi; m++) {
    if (!files[m]) flag(`GUITAR_NOTE_FILES has no file for midi ${m} — that note plays the synth on every device`);
  }
  for (const [k, path] of Object.entries(files)) {
    const m = Number(k);
    if (m < lo || m > hi) flag(`GUITAR_NOTE_FILES[${k}] is outside GUITAR_NOTE_LOW..HIGH (${lo}–${hi}) — playNote() never reaches it`);
    const want = `audio/guitar-note-${m}-${NAMES[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}.mp3`;
    if (path !== want) flag(`GUITAR_NOTE_FILES[${k}] is '${path}' — a note's file is named for its own pitch, want '${want}'`);
    if (!existsSync(join(ROOT, path))) flag(`GUITAR_NOTE_FILES[${k}]: ${path} does not exist — that note falls back to the synth on every device`);
  }
  const n = Object.keys(files).length;
  if (n !== GUITAR_NOTE_COUNT) flag(`GUITAR_NOTE_FILES has ${n} notes, pinned at ${GUITAR_NOTE_COUNT} — bump GUITAR_NOTE_COUNT in the same edit if the range changed on purpose`);
  /* Both callers of the voice must stay on it: Riff Runner built its own
     synth buffer until this change, which is exactly how one corner of the
     site would quietly keep the old sound. */
  let coach = '';
  try { coach = stripJsComments(readFileSync(join(ROOT, 'coach.js'), 'utf8')); } catch { /* covered by 0 */ }
  if (/ksPluck(?:Cached|Buffer)\s*\(/.test(coach)) flag('coach.js builds its own synth buffer (ksPluckCached/ksPluckBuffer) — play notes through playNote() so they get the recorded guitar');
  const appCode = stripJsComments(src);
  const ksCalls = [...appCode.matchAll(/ksPluckCached\s*\(/g)].length;
  if (ksCalls !== 2) flag(`app.js has ${ksCalls} "ksPluckCached(" sites, want 2 — the definition and playNote()'s fallback. Any other caller gets the synth even when the recorded note is loaded`);
  if (bad === 0) ok(`${n} recorded guitar notes (pinned), midi ${lo}–${hi} with no gaps, every file present and named for its pitch; playNote() is the only way to a synth buffer`);
}

/* ════════════════════════════════════════════════════════════════════
   1bu. Every song plays at "the cure"'s loudness  (SOFT — warns only)

   Jonathan's standing rule (2026-10-25): every backing track plays at the
   same loudness as "the cure", so nobody in the room reaches for the volume
   between songs. tools/loudness.py does the levelling — one gain per song,
   worked out from its record-tempo full mix — and a new song goes through
   it before it ships (audio-and-snippets skill, "Backing tracks"). This
   catches a song that skipped that step: more than 1 LU from "the cure" on
   that same file is a warning, never a failure.

   Which file stands for each song lives in ONE place: this shells out to
   `tools/loudness.py --list-reference-files` rather than keeping a second
   copy of the rule. The measurement is the same one loudness.py makes
   (ffmpeg ebur128, integrated). No ffmpeg on PATH, or no Python, and the
   check says so in one line and moves on — usually the Windows machine.

   SPEED: the hooks run this on every commit, and a cold measurement of
   eleven tracks is ~30 s of decoding. So each result is cached in
   tools/.loudness-cache.json (gitignored), keyed by path, size and mtime: a
   warm run measures nothing and costs the Python call (~0.2 s), and a
   changed file is the only one re-measured. A cache that cannot be read or
   written just means measuring.
   ════════════════════════════════════════════════════════════════════ */
const LOUDNESS_TOLERANCE_LU = 1;
const LOUDNESS_CACHE = join(ROOT, 'tools', '.loudness-cache.json');
function measureLufs(file) {
  return new Promise(resolve => {
    const p = spawn('ffmpeg', ['-hide_banner', '-nostats', '-v', 'error', '-i', file, '-af',
      'ebur128=metadata=1,ametadata=mode=print:key=lavfi.r128.I:file=-', '-f', 'null', '-']);
    let tail = '';   // ebur128 prints the running value every 100 ms; the last one is the integrated loudness
    p.stdout.on('data', d => { tail = (tail + d).slice(-200); });
    p.on('error', () => resolve(null));
    p.on('close', code => {
      const m = /lavfi\.r128\.I=(-?[\d.]+)\s*$/.exec(tail);
      resolve(code === 0 && m ? Number(m[1]) : null);
    });
  });
}
async function checkBackingLoudness() {
  head('1bu. Every song plays at "the cure"\'s loudness (soft)');
  const runs = (cmd, a) => { const r = spawnSync(cmd, a, { encoding: 'utf8', timeout: 30000 }); return !r.error && r.status === 0 ? r : null; };
  if (!runs('ffmpeg', ['-hide_banner', '-version'])) {
    warn('1bu skipped: ffmpeg is not on PATH, so backing-track loudness was not measured');
    return;
  }
  let list = null;
  // Windows: python.exe is often installed per-user but not on PATH (the bare names hit the Store stub).
  const winPy = [];
  if (process.env.LOCALAPPDATA) {
    const base = join(process.env.LOCALAPPDATA, 'Programs', 'Python');
    try { for (const d of readdirSync(base).sort().reverse()) winPy.push([join(base, d, 'python.exe')]); } catch { /* no per-user Python */ }
  }
  for (const [cmd, ...pre] of [['python3'], ['python'], ['py', '-3'], ...winPy]) {
    const r = runs(cmd, [...pre, join(ROOT, 'tools', 'loudness.py'), '--list-reference-files']);
    if (r) { try { list = JSON.parse(r.stdout); break; } catch { /* try the next name */ } }
  }
  if (!list) {
    warn('1bu skipped: no Python on PATH (or in %LOCALAPPDATA%\Programs\Python) to run tools/loudness.py (it picks each song\'s file), so backing-track loudness was not measured');
    return;
  }
  if (!list.reference) {
    warn('1bu: tools/loudness.py found no "the cure" record-tempo full mix in audio/ — nothing to measure against'); warnings++;
    return;
  }
  let cache = {};
  try { cache = JSON.parse(readFileSync(LOUDNESS_CACHE, 'utf8')); } catch { /* none yet, or unreadable: measure */ }
  const files = [list.reference, ...Object.values(list.songs)];
  const keyOf = f => { try { const s = statSync(join(ROOT, f)); return `${s.size}:${s.mtimeMs}`; } catch { return null; } };
  const lufs = {}, todo = [];
  for (const f of files) {
    const k = keyOf(f);
    if (k && cache[f] && cache[f].key === k && Number.isFinite(cache[f].lufs)) lufs[f] = cache[f].lufs;
    else todo.push(f);
  }
  const workers = Math.max(1, Math.min(todo.length, cpus().length || 1));
  let next = 0, changed = false;
  await Promise.all(Array.from({ length: workers }, async () => {
    while (next < todo.length) {
      const f = todo[next++];
      const v = await measureLufs(join(ROOT, f));
      if (v === null) continue;
      lufs[f] = v;
      cache[f] = { key: keyOf(f), lufs: v };
      changed = true;
    }
  }));
  if (changed) { try { writeFileSync(LOUDNESS_CACHE, JSON.stringify(cache, null, 1) + '\n'); } catch { /* read-only: measure next time */ } }
  const ref = lufs[list.reference];
  if (ref === undefined) { warn(`1bu: could not measure ${list.reference} — nothing to measure against`); warnings++; return; }
  let off = 0;
  for (const [slug, f] of Object.entries(list.songs)) {
    if (lufs[f] === undefined) { warn(`1bu: could not measure ${f}`); warnings++; off++; continue; }
    const d = lufs[f] - ref;
    if (Math.abs(d) > LOUDNESS_TOLERANCE_LU) {
      warn(`1bu: ${slug} plays ${Math.abs(d).toFixed(1)} LU ${d > 0 ? 'louder' : 'quieter'} than "the cure" (${f}: ${lufs[f].toFixed(1)} against ${ref.toFixed(1)} LUFS) — level it with: python3 tools/loudness.py ${slug}`);
      warnings++; off++;
    }
  }
  const n = Object.keys(list.songs).length;
  if (off === 0) ok(`${n} songs within ±${LOUDNESS_TOLERANCE_LU} LU of "the cure" (${ref.toFixed(1)} LUFS), each on its record-tempo full mix (${todo.length} measured, ${files.length - todo.length} from the cache)`);
}

/* ════════════════════════════════════════════════════════════════════
   1ca. Coach and arcade verdict lines are true at 0, 1 and many
   (2026-10-26 audit, findings 20-22). A line the code CHOOSES can be false
   in a case nobody tried: "Everything was right." over a missed note, "The
   8 notes I heard all counted" over two wrong ones, "twice through" on a
   7-chord drill the 32-beat cap cuts to one pass, Note Runner's "Ladder
   complete" on the power-chord branch's last level, "1 rounds cleared",
   "1 correctas". So this RUNS coach.js (with app.js, as index.html loads
   them) in a vm and renders:
   - the Coach report over fixed takes, EN and ES: "Everything was right"
     only when every beat was right, "all counted" only when every timed
     hit was right, never "the other 1"; controls must still show both;
   - the chord card's description for 1-10 chords, EN and ES, against the
     beats the drill really has (the "then play X once more" list too);
   - Note Runner's done screen on every level (first clear and re-clear,
     EN and ES): "Ladder complete" only on the melody ladder's top level,
     "Next level" to the level the data says it opens, and an unlock line
     naming every level it opens;
   - ten arcade done screens at 0, 1 and many, EN and ES: right grammar
     ("1 cards", or "1 was" when 2 were) AND the real count in the line
     (rounds, right answers, cards, messy changes); the chord card names its
     first pass in order, and the unlock line names exactly what opened.
   It reads Note Runner's saved bests where coach.js does (games.nr.levels);
   with the wrong field every level but the first is locked and the Next
   button never draws (the first version of this check had that hole).
   Every total is pinned, so a renamed function cannot turn this into a
   check of nothing.
   ════════════════════════════════════════════════════════════════════ */
function checkCoachVerdicts() {
  head('1ca. Coach and arcade verdict lines are true at 0, 1 and many');
  const EXPECT = { reports: 20, descs: 20, nrLevels: 15, doneScreens: 88, pwLoops: 12, pwHints: 44, pwViews: 32, pwMemory: 3, pwGates: 3 };
  let bad = 0;
  const flag = m => { err(m); problems++; bad++; };
  const bodies = {};
  const el = id => ({
    id, style: { setProperty(){}, removeProperty(){}, getPropertyValue(){ return ''; } }, dataset: {}, children: [], _h: '',
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    get innerHTML(){ return this._h; }, set innerHTML(v){ this._h = v; if (id) bodies[id] = v; },
    textContent: '', value: '', hidden: false, checked: false, isConnected: true,
    addEventListener(){}, removeEventListener(){}, appendChild(){}, removeChild(){}, remove(){},
    setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){}, hasAttribute(){ return false; },
    querySelector(){ return null; }, querySelectorAll(){ return []; }, closest(){ return null; },
    focus(){}, blur(){}, click(){}, scrollIntoView(){}, insertAdjacentHTML(){}, insertAdjacentElement(){},
    cloneNode(){ return el(''); }, contains(){ return false; },
    getBoundingClientRect(){ return { top:0, left:0, width:0, height:0, bottom:0, right:0 }; },
  });
  const els = {};
  const storage = () => ({ _d:{}, getItem(k){ return this._d[k] ?? null; }, setItem(k,v){ this._d[k]=String(v); },
                           removeItem(k){ delete this._d[k]; }, clear(){ this._d={}; } });
  const param = () => ({ value: 1, setValueAtTime(){}, setTargetAtTime(){}, cancelScheduledValues(){},
                         linearRampToValueAtTime(){}, exponentialRampToValueAtTime(){} });
  const actx = {
    currentTime: 0, state: 'running', resume(){ return Promise.resolve(); }, destination: {}, sampleRate: 44100,
    createOscillator(){ return { connect(){}, start(){}, stop(){}, frequency: param() }; },
    createGain(){ return { connect(){}, disconnect(){}, context: actx, gain: param() }; },
    createBufferSource(){ return { connect(){}, playbackRate: param(), start(){}, stop(){} }; },
    createBuffer(){ return { getChannelData(){ return new Float32Array(16); } }; },
    createDynamicsCompressor(){ return { connect(){}, threshold: param(), knee: param(), ratio: param(), attack: param(), release: param() }; },
    close(){},
  };
  const ctx = {
    console: { log(){}, warn(){}, error(){}, info(){} },
    document: {
      documentElement: el(''), head: el(''), body: el(''),
      getElementById(id){ return els[id] || (els[id] = el(id)); },
      querySelector(){ return null; }, querySelectorAll(){ return []; },
      createElement(){ return el(''); }, createDocumentFragment(){ return el(''); },
      addEventListener(){}, removeEventListener(){},
      fonts: { ready: Promise.resolve() }, hidden: false, visibilityState: 'visible',
    },
    localStorage: storage(), sessionStorage: storage(),
    location: { hostname:'localhost', href:'http://localhost/', pathname:'/', search:'', hash:'', reload(){} },
    history: { scrollRestoration:'auto', replaceState(){}, pushState(){} },
    navigator: { userAgent:'node', platform:'node', language:'en', onLine:true },
    setTimeout: () => 0, clearTimeout(){}, setInterval: () => 0, clearInterval(){},
    requestAnimationFrame: () => 0, cancelAnimationFrame(){},
    matchMedia: () => ({ matches:false, addEventListener(){}, addListener(){} }),
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    fetch: () => Promise.reject(new Error('no network in 1ca')),
    CustomEvent: class { constructor(t, o){ this.type = t; Object.assign(this, o || {}); } },
    Image: class {}, Audio: class { play(){ return Promise.resolve(); } pause(){} },
    AudioContext: class { constructor(){ return actx; } },
    performance: { now: () => 0 },
    URLSearchParams, URL, TextEncoder, TextDecoder,
    addEventListener(){}, removeEventListener(){}, dispatchEvent(){}, scrollTo(){},
    innerWidth: 1366, innerHeight: 657, devicePixelRatio: 1,
  };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  const FILES = ['i18n.js', 'guitar-diagrams.js', 'class-activities.js', 'config-main.js',
    ...MODULE_FILES, 'app.js', 'fab-tools.js', 'tuner.js', 'coach.js'];
  try {
    vm.createContext(ctx);
    for (const f of FILES) vm.runInContext(readFileSync(join(ROOT, f), 'utf8'), ctx, { filename: f });
  } catch (e) { flag(`1ca: could not load coach.js with the site's scripts (${e.message}) — verdict lines NOT checked`); return; }
  const run = code => vm.runInContext(code, ctx);
  const text = id => (bodies[id] || '').replace(/<[^>]+>/g, ' ').replace(/&[#\w]+;/g, ' ').replace(/\s+/g, ' ');
  const rep = (n, s) => Array(n).fill(s);
  const right = s => s === 'ok' || s === 'oct';
  let songCounts = null;
  const counts = { reports: 0, descs: 0, nrLevels: 0, doneScreens: 0, pwLoops: 0, pwHints: 0, pwViews: 0, pwMemory: 0, pwGates: 0 };
  try {
    /* Coach report. [mode, slot states, timing offset ms, must show Great line, must show "all counted"] */
    const TAKES = [
      ['melody', [...rep(9, 'ok'), 'miss'], 0, false, false],
      ['melody', [...rep(7, 'ok'), ...rep(3, 'dim')], 0, false, false],
      ['chords', [...rep(9, 'ok'), ...rep(7, 'dim')], 0, false, false],
      ['melody', [...rep(12, 'ok'), 'miss'], 0, false, false],
      ['melody', [...rep(6, 'ok'), 'wrong', 'wrong'], 600, false, false],
      ['melody', [...rep(6, 'ok'), 'dim', 'dim'], 600, false, false],
      ['melody', rep(10, 'ok'), 0, true, false],
      ['chords', rep(16, 'ok'), 0, true, false],
      ['melody', rep(8, 'ok'), 600, false, true],
      ['melody', [...rep(14, 'ok'), 'miss', 'miss'], 0, false, false],
    ];
    for (const lang of ['en', 'es']) {
      run(`setLang(${JSON.stringify(lang)})`);
      const great = run(`t('coach.overall.great')`);
      const COUNTED = lang === 'es' ? /contaron todas/ : /all counted/;
      for (const [mode, states, devMs, wantGreat, wantCounted] of TAKES) {
        ctx.__fx = { mode, states, devMs };
        run(`coach = { mode: __fx.mode, bpm: 60, beatMs: 1000, events: [], streakKey: 'k', drillId: null, skillIds: [],
          timeouts: [], card: { isConnected: false },
          slots: __fx.states.map((st, i) => ({ label: 'A',
            chordName: __fx.mode === 'chords' ? (i < __fx.states.length / 2 ? 'C' : 'G') : undefined,
            isChange: __fx.mode === 'chords' && i === __fx.states.length / 2,
            state: st, hit: st === 'miss' ? null : { devMs: __fx.devMs, midi: 57, t: i * 1000 } })) };
          coachRenderReport(); coach = null;`);
        counts.reports++;
        const out = text('coach-body'), what = `${lang} ${mode} take [${states.join(',')}]`;
        const hasGreat = out.includes(great);
        if (hasGreat && !states.every(right)) flag(`1ca: ${what} says "${great}" with beats that were not heard right`);
        if (wantGreat && !hasGreat) flag(`1ca: ${what} — a perfect take no longer says "${great}" (control)`);
        const hasCounted = COUNTED.test(out);
        if (hasCounted && states.some(s => s !== 'miss' && !right(s))) flag(`1ca: ${what} says "${COUNTED.source}" over wrong or unclear notes`);
        if (wantCounted && !hasCounted) flag(`1ca: ${what} — an all-right late take no longer says "${COUNTED.source}" (control)`);
        if (/\b(other|otras) 1\b/.test(out)) flag(`1ca: ${what} reads "${out.match(/\b(other|otras) 1\b/)[0]}"`);
        const unheard = states.filter(s => !right(s)).length;
        if (unheard !== 1 && /\bother one\b|\bla otra no\b/.test(out)) flag(`1ca: ${what} says "the other one" with ${unheard} unheard notes`);
      }
    }
    run(`setLang('en')`);

    /* Chord card description vs the beats the drill really has, EN and ES:
       "twice through" exactly when two passes fit, every named chord is in
       the drill, and a "then play X once more" list is exactly the chords
       after the first pass. */
    const NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'Cm', 'Dm', 'Em'];
    const TWICE = /twice through|dos vueltas/;
    const THEN = /(?:then play|y luego toca) (.+?) (?:once more|una vez más)/;
    for (const lang of ['en', 'es']) {
      run(`setLang(${JSON.stringify(lang)})`);
      for (let k = 1; k <= NAMES.length; k++) {
        ctx.__btn = { dataset: { chords: JSON.stringify(NAMES.slice(0, k).map((n, i) => ({ n, m: [48 + i, 52 + i, 55 + i] }))) },
          closest(){ return null; }, parentElement: { insertAdjacentElement(){}, closest(){ return null; } } };
        run('coachOpen(__btn)');
        const desc = run('coach.desc'), beats = run('coach.slots.map(s => s.chordName)');
        run('coachClose()');
        counts.descs++;
        const what = `${lang} ${k}-chord Coach card ("${desc}")`;
        const listed = desc.split(' — ')[0].split(' → ');
        if (k > 1 && TWICE.test(desc) !== (beats.length >= 2 * 4 * k)) flag(`1ca: ${what} ${TWICE.test(desc) ? 'says' : 'lost'} "twice through" with ${beats.length} beats`);
        /* The names, in order, are the drill's first pass (8 chords at most). */
        const firstPass = [...new Set(beats.slice(0, 4 * k))].join(' → ');
        if (listed.join(' → ') !== firstPass) flag(`1ca: ${what} names ${listed.join(' → ')}, but the drill's first pass is ${firstPass}`);
        const after = [...new Set(beats.slice(4 * k))];
        const m = desc.match(THEN);
        const want = beats.length > 4 * k && beats.length < 8 * k ? after.join(' → ') : null;
        if ((m ? m[1] : null) !== want) flag(`1ca: ${what} — after the first pass the drill plays ${want || 'nothing'}`);
      }
    }
    run(`setLang('en')`);

    /* Note Runner: "Ladder complete" only on the melody ladder's top level. */
    const levels = run('NR_LEVELS.map(l => !!l.chords)');
    const top = levels.lastIndexOf(false);
    /* What each level opens, read off the data (`after`, else the level
       before). Every level is cleared, so every "Next level" button shows. */
    const opens = run('NR_LEVELS.map((_, i) => NR_LEVELS.map((l, j) => j).filter(j => (NR_LEVELS[j].after !== undefined ? NR_LEVELS[j].after : j - 1) === i))');
    run(`games.nr = { levels: {} }; NR_LEVELS.forEach((_, i) => { games.nr.levels[i] = 100; });`);
    for (const lang of ['en', 'es']) {
      run(`setLang(${JSON.stringify(lang)})`);
      const LADDER = new RegExp(run(`t('games.nr.passLadderDone')`).split(' — ')[0]);
      for (const prev of [0, 100]) {
        for (let i = 0; i < levels.length; i++) {
          run(`nr = { level: ${i}, adaptive: false, passed: true, prevBest: ${prev}, acc: 100, errs: [], playable: [], micSuspect: false, timeouts: [] };
            nrRenderDone(0, 0, 0, 0); nr = null;`);
          if (prev === 0 && lang === 'en') counts.nrLevels++;
          const html = bodies['nr-body'] || '', out = text('nr-body');
          const what = `${lang} Note Runner Level ${i + 1} (${prev ? 're-clear' : 'first clear'})`;
          if (LADDER.test(out) !== (i === top)) flag(`1ca: ${what} ${i === top ? 'lost' : 'says'} "${LADDER.source}"`);
          const next = html.match(/onclick="nrPick\((\d+)\)">[^<]*/g) || [];
          const nextTo = next.map(b => +b.match(/\d+/)[0]).filter(j => j !== i);
          const wantNext = opens[i].length ? opens[i][0] : null;
          if ((nextTo[0] ?? null) !== wantNext) flag(`1ca: ${what} Next goes to ${nextTo.length ? 'Level ' + (nextTo[0] + 1) : 'nothing'}, the data says ${wantNext == null ? 'nothing' : 'Level ' + (wantNext + 1)}`);
          if (prev === 0) {
            const status = (out.match(/[^.!]*\b(?:unlocked|desbloquead[oa]s?)\b[^.!]*!?/i) || [''])[0];
            /* The unlock line names exactly the levels this one opens. */
            const named = (status.match(/\d+/g) || []).map(Number).sort((a, b) => a - b).join(',');
            const opened = opens[i].map(j => j + 1).sort((a, b) => a - b).join(',');
            if (named !== opened) flag(`1ca: ${what} opens ${opened ? 'Level ' + opened : 'nothing'} but the unlock line ("${status.trim()}") names ${named || 'nothing'}`);
          }
        }
      }
    }
    run(`setLang('en')`);

    /* Arcade done screens at 0, 1 and many. */
    const BAD = /\b1 (rounds|rondas|were|llegaron|correctas|cards|tarjetas)\b|\b0 correcta\b/;
    for (const lang of ['en', 'es']) {
      run(`setLang(${JSON.stringify(lang)})`);
      /* `want` = [regex with one number group, the real count]: the line must
         show that count, and every number the regex finds must be it. A
         reworded line that loses the count fails too (loud, not blind). */
      const shot = (code, id, what, wants = []) => {
        run(code); counts.doneScreens++;
        const out = text(id);
        if (BAD.test(out)) flag(`1ca: ${lang} ${what} reads "${out.match(BAD)[0]}"`);
        for (const [re, n] of wants) {
          const found = [...out.matchAll(re)].map(m => +(m[1] ?? m[2]));
          if (!found.length || found.some(x => x !== n)) flag(`1ca: ${lang} ${what} shows ${found.length ? found.join('/') : 'no count'} where the real count is ${n} ("${out.slice(0, 140)}")`);
        }
      };
      const ROUNDS = /\b(\d+) (?:rounds?|rondas?)\b/g;
      const RIGHT = /\b(\d+) right\b|\baciertos: (\d+)/g;
      const CARDS = /\b(\d+) (?:cards?|tarjetas?)\b/g;
      const MESSY = /\((\d+) (?:were|was|llegaron|llegó)/g;
      for (const k of [0, 1, 2, 5]) {
        shot(`ps = { phase: 'done', round: ${k}, prevBest: 0, timeouts: [] }; psRenderDone();`, 'ps-body', `Simon, ${k} rounds`, [[ROUNDS, k]]);
        shot(`psg = { phase: 'done', round: ${k}, prevBest: 0, heard: [], timeouts: [] }; psgRenderDone();`, 'psg-body', `Simon Guitar, ${k} rounds`, [[ROUNDS, k]]);
        for (const g of ['fz', 'pd', 'ntr', 'cb', 'cd']) for (const ans of [1, 5]) {
          if (k > ans) continue;
          shot(`${g} = { phase: 'done', answered: ${ans}, correct: ${k}, score: 0, prevBest: 0, levels: [], topLevel: 1, timeouts: [], noteTimeouts: [] }; ${g}RenderDone();`,
            `${g}-body`, `${g} ${ans} answered, ${k} right`, [[RIGHT, k], [CARDS, ans]]);
        }
        if (k <= 3) {
          shot(`cc = { phase: 'done', progIdx: 0, rateIdx: 0, bpm: 60, bpc: 4, chords: ['C', 'G'], timeouts: [],
            changes: Array.from({ length: 8 }, (_, i) => ({ from: 'C', to: 'G', result: i < ${k} ? 'off' : i < ${k} + 4 ? 'ok' : 'miss' })) }; ccRenderDone();`,
            'cc-body', `Change Up, ${k} messy`, k ? [[MESSY, k]] : []);
          /* 4 good changes of 8 keeps the verdict in the band that names the messy ones. */
          if (k >= 2 && /\(1 (was|llegó)\b/.test(text('cc-body'))) flag(`1ca: ${lang} Change Up with ${k} messy changes says "${text('cc-body').match(/\(1 (was|llegó)\b/)[0]}"`);
          /* The way back to the setup screen: Change Up has loops to pick, Power Chord Switch has chords (it has no loops of its own to
             pick since 2026-10-30), so each game's done screen says its own word and never the other's. */
          const WORD_LOOP = run(`t('games.cc.pickDifferentLoop')`), WORD_CHORDS = run(`t('games.pw.pickDifferent')`);
          if (!text('cc-body').includes(WORD_LOOP) || text('cc-body').includes(WORD_CHORDS)) flag(`1ca: ${lang} Change Up's done screen does not say "${WORD_LOOP}" (or says Power Chord Switch's "${WORD_CHORDS}")`);
          /* The same done screen for Power Chord Switch, and its "pick a different
             loop" button must send you back to Power Chord Switch. */
          shot(`cc = { phase: 'done', mode: 'power', progIdx: 0, rateIdx: 2, bpm: 60, bpc: 1, chords: ['F5', 'G5'], timeouts: [],
            changes: Array.from({ length: 8 }, (_, i) => ({ from: 'F5', to: 'G5', result: i < ${k} ? 'off' : i < ${k} + 4 ? 'ok' : 'miss' })) }; ccRenderDone();`,
            'cc-body', `Power Chord Switch, ${k} messy`, k ? [[MESSY, k]] : []);
          if (!/ccSetup\(&quot;power&quot;\)/.test(bodies['cc-body'])) flag(`1ca: ${lang} Power Chord Switch's "pick a different loop" button no longer returns to Power Chord Switch`);
          if (!text('cc-body').includes(WORD_CHORDS) || text('cc-body').includes(WORD_LOOP)) flag(`1ca: ${lang} Power Chord Switch's done screen does not say "${WORD_CHORDS}" (or says Change Up's "${WORD_LOOP}") \u2014 it has no loops to pick`);
          if (WORD_CHORDS === WORD_LOOP || /loop|secuencia/i.test(WORD_CHORDS)) flag(`1ca: ${lang} games.pw.pickDifferent reads "${WORD_CHORDS}" \u2014 Power Chord Switch has chords to pick, not loops`);
        }
      }
    }
    run(`setLang('en')`);

    /* Power Chord Switch is Change Up's engine on the three-finger power
       chords (hub key 'power', ccSetup('power')). Four things must hold, and
       each is executed here, not read off the source:
       1. Every chord in every loop is the three-finger shape (fingers 1·3·4,
          root then +2 frets on the next two strings), and each loop does what
          its group's title says: "low E" loops stay on the low E string, "A
          string" loops on the A string, "jump" loops use both.
       2. The "next:" hint names the move the DIAGRAMS show (up/down, how many
          frets, or which string and fret) — worked out here from
          CHORD_DIAGRAMS, not from pwMoveHint — for every adjacent pair of
          every loop (the last chord wraps to the first), both languages, and
          1 fret never reads "1 frets".
       3. The two games never share state: Change Up lists none of the power
          loops and the other way round, each keeps its own remembered loop,
          and a best saves to games.pw (not games.cc) and is compared with
          its own game's best only.
       4. The play screen and every beat tick show that same hint. */
    const DIAG = JSON.parse(run('JSON.stringify(CHORD_DIAGRAMS)'));
    const LOOPS = JSON.parse(run('JSON.stringify(CC_POWER_PROGRESSIONS)'));
    const GROUP_IDS = JSON.parse(run('JSON.stringify(CC_POWER_GROUPS.map(g => g.id))'));
    const OPEN_LOOPS = run('CC_PROGRESSIONS.length');
    const played = n => (DIAG[n] ? DIAG[n].chord : []).filter(c => c[1] !== 'x');
    const rootOf = n => { const r = played(n)[0]; return r ? { string: r[0], fret: r[1] } : null; };
    const STR = { 6: ['low E', 'Mi grave'], 5: ['A', 'La'] };
    const hintFor = (a, b, lang) => {
      const x = rootOf(a), y = rootOf(b);
      if (!x || !y) return null;
      if (x.string !== y.string) return lang === 'en' ? `move to the ${STR[y.string][0]} string, fret ${y.fret}` : `pasa a la cuerda ${STR[y.string][1]}, traste ${y.fret}`;
      const d = y.fret - x.fret, n = Math.abs(d);
      if (!d) return '';
      return lang === 'en' ? `slide ${d > 0 ? 'up' : 'down'} ${n} ${n === 1 ? 'fret' : 'frets'}` : `${d > 0 ? 'sube' : 'baja'} ${n} ${n === 1 ? 'traste' : 'trastes'}`;
    };
    const GROUP_OK = {
      low: s => s.every(x => x === 6),
      a: s => s.every(x => x === 5),
      jump: s => s.includes(6) && s.includes(5),
      random: () => true,   // the computer's pick: its pool and every pair it can draw are proved below
    };
    const isShape = n => {
      const p = played(n);
      return p.length === 3 && p.map(c => c[2]).join(',') === '1,3,4' &&
        p[1][1] === p[0][1] + 2 && p[2][1] === p[0][1] + 2 && p[1][0] === p[0][0] - 1 && p[2][0] === p[0][0] - 2;
    };
    for (const lp of LOOPS) {
      /* A song is not a pair (2026-11-02): its walk is 22 or 12 chords with a shape of its own. Skipped here ON PURPOSE and
         proved by 1ck below (its card, its switches, its shortest walk, its hints); the other groups are checked as before. */
      if (lp.group === 'song') { counts.pwSongEntries = (counts.pwSongEntries || 0) + 1; continue; }
      counts.pwLoops++;
      const name = lp.chords.join(' – ');
      if (lp.chords.length !== 2) flag(`1ca: Power Chord Switch loop ${name} has ${lp.chords.length} chords — the game is two chords`);
      for (const n of new Set(lp.chords)) {
        if (!isShape(n)) flag(`1ca: Power Chord Switch loop ${name}: ${n} is not the three-finger power chord (fingers 1·3·4, root then +2 frets on the next two strings)`);
      }
      if (!!lp.random !== (lp.group === 'random')) flag(`1ca: Power Chord Switch loop ${name} is ${lp.random ? '' : 'not '}random but sits in group "${lp.group}"`);
      if (!GROUP_IDS.includes(lp.group)) flag(`1ca: Power Chord Switch loop ${name} is in group "${lp.group}", which has no title`);
      else if (!GROUP_OK[lp.group](lp.chords.map(n => (rootOf(n) || {}).string))) {
        flag(`1ca: Power Chord Switch loop ${name} is under "${lp.group}" but its roots are on strings ${lp.chords.map(n => (rootOf(n) || {}).string).join(',')}`);
      }
      if (lp.random) continue;   // placeholder chords: the draw itself is proved after this loop
      for (let i = 0; i < lp.chords.length; i++) {
        const a = lp.chords[i], b = lp.chords[(i + 1) % lp.chords.length];
        if (a === b) { flag(`1ca: Power Chord Switch loop ${name} holds ${a} across a change — nothing to grade`); continue; }
        for (const lang of ['en', 'es']) {
          run(`setLang(${JSON.stringify(lang)})`);
          const got = run(`pwMoveHint(${JSON.stringify(a)}, ${JSON.stringify(b)})`), want = hintFor(a, b, lang);
          counts.pwHints++;
          if (!want || got !== want) flag(`1ca: ${lang} ${a} → ${b} hint is "${got}", the diagrams say "${want}"`);
        }
      }
    }
    run(`setLang('en')`);

    /* The computer's pick: it is the FIRST choice (the game opens on it), and it
       draws ONE OF THE LISTED PAIRS in a random order (Jonathan, 2026-10-30; the
       old pool of six chords could draw four jumps the list does not teach). The
       draws are executed here: every one is a listed pair, none holds a chord
       twice, and over 3000 draws each of the 11 pairs comes up, in both orders.
       Every listed pair's hint is proved in the loop above. Change Up's Random 4
       is untouched and the two never share a best-score key. */
    if (!LOOPS[0] || !LOOPS[0].random) flag('1ca: Power Chord Switch does not open with "the computer picks" as its first choice');
    if (run('typeof CC_POWER_RANDOM_POOL') !== 'undefined') flag("1ca: CC_POWER_RANDOM_POOL is back \u2014 the computer must draw from the listed pairs, never from a pool of single chords (it could draw a pair the list does not teach)");
    const LISTED = LOOPS.filter(l => !l.random && l.group !== 'song').map(l => l.chords);
    const pairKey = d => [...d].sort().join('');
    const listedKeys = new Set(LISTED.map(pairKey));
    if (LISTED.length !== 11 || listedKeys.size !== 11) flag(`1ca: Power Chord Switch lists ${LISTED.length} pairs (${listedKeys.size} different), pinned at 11 \u2014 change the pin and the draw's maths on purpose`);
    const draws = JSON.parse(run(`ccSetup('power'); JSON.stringify(Array.from({ length: 3000 }, () => ccPickChords(CC_POWER_PROGRESSIONS[0])))`));
    counts.pwViews++;
    const seenPairs = new Set(), seenOrders = new Set();
    for (const d of draws) {
      if (d.length !== 2 || d[0] === d[1] || !listedKeys.has(pairKey(d))) { flag(`1ca: the computer drew ${JSON.stringify(d)} \u2014 it must be one of the ${LISTED.length} listed pairs, two different chords`); break; }
      seenPairs.add(pairKey(d)); seenOrders.add(d.join('>'));
    }
    counts.pwDraws = (counts.pwDraws || 0) + draws.length;
    if (seenPairs.size !== listedKeys.size || seenOrders.size !== listedKeys.size * 2) flag(`1ca: 3000 draws gave ${seenPairs.size} of ${listedKeys.size} pairs and ${seenOrders.size} of ${listedKeys.size * 2} orders \u2014 the computer's pick is not random over the listed pairs`);
    /* Again / -10 / +10 replay the pair just played (the done screen's advice names
       that pair's worst switch); only Start on the setup screen draws a new one.
       Change Up's Random 4 keeps drawing each start, and a fixed pair is its own. */
    const rc = JSON.parse(run(`(function(){
      ccSetup('power'); const rnd = CC_POWER_PROGRESSIONS[0]; cc.chords = ['G5', 'C5'];
      const kept = [], fresh = [];
      for (let i = 0; i < 80; i++){ kept.push(ccRoundChords(rnd, true).join('>')); fresh.push(ccRoundChords(rnd, false).join('>')); }
      const fixedDef = CC_POWER_PROGRESSIONS[3]; cc.chords = ['X5', 'Y5'];
      const fixed = ccRoundChords(fixedDef, true).join('>');
      ccSetup(); const four = CC_PROGRESSIONS.find(p => p.random); cc.chords = ['C', 'G', 'Am', 'F'];
      const open = []; for (let i = 0; i < 80; i++) open.push(ccRoundChords(four, true).join('>'));
      return JSON.stringify({ kept: [...new Set(kept)], fresh: [...new Set(fresh)].length, fixed, fixedWant: fixedDef.chords.join('>'), open: [...new Set(open)].length });
    })()`));
    if (JSON.stringify(rc.kept) !== '["G5>C5"]') flag(`1ca: Again in Power Chord Switch drew ${JSON.stringify(rc.kept)}, expected to replay the pair just played ["G5>C5"]`);
    if (rc.fresh < 2) flag('1ca: Start on the setup screen no longer draws a new pair each time in Power Chord Switch');
    if (rc.fixed !== rc.fixedWant) flag(`1ca: a fixed pair came back as ${rc.fixed}, expected its own ${rc.fixedWant}`);
    if (rc.open < 2) flag("1ca: Change Up's Random 4 stopped drawing new chords on Again \u2014 Change Up is unchanged");
    run(`ccSetup('power'); globalThis.__realStart = ccStart; globalThis.__arg = 'unset'; ccStart = a => { globalThis.__arg = a; }; cc.phase = 'done'; ccAgain(0); ccStart = __realStart;`);
    if (run('globalThis.__arg') !== true) flag(`1ca: ccAgain starts the next round with ccStart(${run('globalThis.__arg')}), expected ccStart(true) \u2014 Again would draw a new random pair`);
    run(`ccSetup('power')`);
    if (!/onclick="ccStart\(\)"/.test(bodies['cc-body'])) flag('1ca: the setup screen\'s Start must call ccStart() with no argument \u2014 only Start draws a new pair');
    const coachSrc = readFileSync(join(ROOT, 'coach.js'), 'utf8');
    const startBody = jsFunctionBody(coachSrc, 'ccStart');
    /* ccStart hands `again === true` to ccPrepare, which takes the round's chords from ccRoundChords (split out 2026-11-03 so 1ck can run it without a microphone). */
    const prepBody = jsFunctionBody(coachSrc, 'ccPrepare');
    if (startBody === null || prepBody === null || !/ccPrepare\(again === true\)/.test(stripJsComments(startBody)) || !/ccRoundChords\(progDef, again\)/.test(stripJsComments(prepBody))) flag('1ca: ccStart() must call ccPrepare(again === true), and ccPrepare must take its round\'s chords from ccRoundChords(progDef, again) \u2014 Again would draw a new pair, or Start would replay the old one');
    /* Change Up's Start sits in a bar that sticks to the bottom of the games
       screen (the real layout is measured in smoke.mjs at 1366x657): its 80px
       charts pushed the tempo row and Start down a 657px screen (Friday check
       R1-3, 2026-10-31). Power Chord Switch wraps Start in the same bar but is now
       laid out in two columns that fit 657px without scrolling (Jonathan,
       2026-10-31), so ITS bar is static — the sticky rule must stay unscoped
       (Change Up) and the power override must not make it sticky again. */
    const css = readFileSync(join(ROOT, 'styles.css'), 'utf8');
    if (!/#cc-body \.cc-startbar\{[^}]*position:sticky;[^}]*bottom:0;[^}]*background:var\(--bg\)/.test(css)) flag('1ca: styles.css lost #cc-body .cc-startbar{position:sticky;bottom:0;background:var(--bg)} \u2014 Change Up\'s Start would scroll off a 657px screen under the charts');
    const pwBar = css.match(/#cc-body\.cc-power \.cc-startbar\{([^}]*)\}/);
    if (!pwBar || !/position:static/.test(pwBar[1]) || /position:sticky/.test(pwBar[1])) flag('1ca: styles.css must give #cc-body.cc-power .cc-startbar{position:static} \u2014 Power Chord Switch fits 657px in two columns and does not need Start to stick');
    if (!/\.games-shell\{max-width:1240px;/.test(css)) flag('1ca: styles.css .games-shell is no longer max-width:1240px \u2014 the games stopped using the width of a 1366px screen');
    if (!/#cb-body \.cb-cols,#fz-body \.cb-cols\{display:grid;grid-template-columns:/.test(css)) flag('1ca: styles.css lost the two-column play screen of Chord Blitz and Fret Zap (.cb-cols)');
    if (!/\.lq-screen \.games-shell\{max-width:760px;/.test(css)) flag('1ca: styles.css lost .lq-screen .games-shell{max-width:760px} \u2014 the live quiz would widen with the games');
    if (!/#cc-body\.cc-open-setup \.cc-cols\{display:grid;grid-template-columns:/.test(css) || !/#cc-body\.cc-open-setup \.cc-up-groups\{display:grid;grid-template-columns:repeat\(3,/.test(css)) flag("1ca: styles.css lost Change Up's wide setup (.cc-open-setup .cc-up-groups / .cc-cols)");
    if (!/#cc-body\.cc-power \.cc-cols\{display:grid;grid-template-columns:/.test(css) || !/#cc-body\.cc-power \.cc-groups\{display:grid;grid-template-columns:repeat\(5,/.test(css) || !/#cc-body\.cc-power \.cc-groups\.cc-groups-songs\{display:block\}/.test(css)) flag('1ca: styles.css lost Power Chord Switch\'s two-column layout (.cc-cols), its five choice columns (.cc-groups: four pair groups and Songs) or the block layout of the songs view (.cc-groups-songs)');
    for (const lang of ['en', 'es']) {
      run(`setLang(${JSON.stringify(lang)})`);
      run(`ccSetup('power')`);
      if (!/<div class="cc-startbar"><button type="button" class="coach-start" onclick="ccStart\(\)">/.test(bodies['cc-body'])) flag(`1ca: ${lang} Power Chord Switch's Start is not inside .cc-startbar`);
      run(`ccSetup()`);
      if (!/<div class="cc-startbar"><button type="button" class="coach-start" onclick="ccStart\(\)">/.test(bodies['cc-body'])) flag(`1ca: ${lang} Change Up's Start is not inside the sticky .cc-startbar`);
    }
    run(`setLang('en')`);
    const four = JSON.parse(run(`ccSetup(); JSON.stringify(ccPickChords(CC_PROGRESSIONS.find(p => p.random)))`));
    if (four.length !== 4 || new Set(four).size !== 4) flag(`1ca: Change Up's Random 4 drew ${JSON.stringify(four)}`);
    if (JSON.stringify(JSON.parse(run(`JSON.stringify(ccPickChords({ chords: ['F5', 'G5'] }))`))) !== '["F5","G5"]') flag('1ca: ccPickChords changed a fixed pair');
    if (run(`ccBestKey(CC_PROGRESSIONS.find(p => p.random), 2) === ccBestKey(CC_POWER_PROGRESSIONS[0], 2)`)) flag("1ca: Change Up's Random 4 and Power Chord Switch's random pair share a best-score key");

    /* 3. Two games, one engine, no shared state. */
    const pillCount = html => (html.match(/onclick="ccPickProg\(/g) || []).length;
    const POWER_NAME = /\b[A-G][#b]?5\b/;
    for (const lang of ['en', 'es']) {
      run(`setLang(${JSON.stringify(lang)})`);
      run(`ccSetup('power')`); counts.pwViews++;
      const pw = bodies['cc-body'], pwText = text('cc-body');
      if (run('cc.mode') !== 'power') flag(`1ca: ${lang} ccSetup('power') left mode "${run('cc.mode')}"`);
      /* The pairs view lists the computer's pick and the pairs; the songs are reached by one button per song (ccPickSong) and listed in the songs view (2026-11-03). */
      const NON_SONG = LOOPS.filter(l => l.group !== 'song').length, SONG_N = LOOPS.length - NON_SONG;
      if (pillCount(pw) !== NON_SONG) flag(`1ca: ${lang} Power Chord Switch lists ${pillCount(pw)} loops on its pairs view, the data has ${NON_SONG}`);
      if ((pw.match(/onclick="ccPickSong\(/g) || []).length !== 2) flag(`1ca: ${lang} Power Chord Switch's pairs view has ${(pw.match(/onclick="ccPickSong\(/g) || []).length} song buttons, expected 2`);
      run(`ccPickProg(3); ccPickProg(${LOOPS.findIndex(l => l.group === 'song')})`);
      const songsView = bodies['cc-body'];
      if (pillCount(songsView) !== SONG_N || !/onclick="ccPickView\('pairs'\)"/.test(songsView)) flag(`1ca: ${lang} Power Chord Switch's songs view lists ${pillCount(songsView)} switches (the data has ${SONG_N}) or has no way back to the pairs`);
      run(`ccPickView('pairs')`);
      if (run('cc.progIdx') !== 3) flag(`1ca: ${lang} the songs view's back button left progIdx ${run('cc.progIdx')}, not the last pair (3)`);
      run(`ccPickProg(0)`);
      if ((pw.match(/cc-group-title/g) || []).length !== GROUP_IDS.length + 2) flag(`1ca: ${lang} Power Chord Switch shows ${(pw.match(/cc-group-title/g) || []).length} group titles, expected ${GROUP_IDS.length} loop groups + the speed row + the tempo row`);
      /* "How fast the chord switches" and the tempo buttons are the first things on
         the screen, above every loop (the big charts push anything lower off a
         657px screen), and a fresh game opens on every beat with the computer's
         pick chosen. Change Up keeps its tempo below the loops. */
      /* Every beat is the first (leftmost) speed button in Power Chord Switch, Every
         bar the first in Change Up: display order only, the index still names the
         CC_RATES entry that the remembered pick and best-score keys use. */
      const pwFirstRate = (pw.match(/ccPickRate\((\d+)\)/) || [])[1];
      if (Number(pwFirstRate) !== run('CC_BEAT_IDX')) flag(`1ca: ${lang} Power Chord Switch's first speed button is rate ${pwFirstRate}, expected Every beat (${run('CC_BEAT_IDX')}) on the far left`);
      run(`ccSetup()`);
      const cuFirstRate = (bodies['cc-body'].match(/ccPickRate\((\d+)\)/) || [])[1];
      if (Number(cuFirstRate) !== 0) flag(`1ca: ${lang} Change Up's first speed button is rate ${cuFirstRate}, expected Every bar (0) on the far left`);
      run(`ccSetup('power')`);
      const firstRate = pw.indexOf('ccPickRate('), firstProg = pw.indexOf('ccPickProg('), firstBpm = pw.indexOf('ccNudgeBpm(');
      if (firstRate < 0 || firstRate > firstProg) flag(`1ca: ${lang} Power Chord Switch's speed row is not above its chord choices`);
      if (firstBpm < 0 || firstBpm > firstProg || firstBpm < firstRate) flag(`1ca: ${lang} Power Chord Switch's tempo buttons are not between the speed row and the chord choices`);
      if (run('CC_RATES[cc.rateIdx].id') !== 'beat') flag(`1ca: ${lang} Power Chord Switch opens on speed "${run('CC_RATES[cc.rateIdx].id')}" — it must open on every beat`);
      if (run('cc.progIdx') !== 0 || !pw.includes('class="ts-btn active" onclick="ccPickProg(0)"')) flag(`1ca: ${lang} Power Chord Switch does not open with the computer's pick selected`);
      for (const g of GROUP_IDS) {
        const title = run(`t(CC_POWER_GROUPS.find(g => g.id === ${JSON.stringify(g)}).titleKey)`);
        /* text() turns every whitespace character (a no-break space too) into a plain space, so compare the title through the same step. */
        if (!pwText.includes(String(title).replace(/\s+/g, ' '))) flag(`1ca: ${lang} Power Chord Switch lost its "${title}" group`);
        /* "low E" / "Mi grave" must not break across two lines in the narrow pair columns (2026-11-01): tools/smoke.mjs measures it in a browser; this is the source pin. */
        if (g === 'low' && !/(low|Mi)\u00a0(E|grave)/.test(title)) flag(`1ca: ${lang} Power Chord Switch's "${title}" group title joins "low E" / "Mi grave" with an ordinary space — use a no-break space (\\u00a0) so the title cannot break between the two words`);
      }
      if (lang === 'es' && /power/i.test(pwText)) flag(`1ca: Spanish Power Chord Switch setup says "${pwText.match(/\S*power\S*/i)[0]}" — the glossary word is "acorde de potencia"`);
      if (!/three|tres/.test(pwText)) flag(`1ca: ${lang} Power Chord Switch setup no longer mentions the three strings`);
      run(`ccSetup()`);
      const open = bodies['cc-body'];
      if (run('cc.mode') !== 'open') flag(`1ca: ccSetup() with no argument left mode "${run('cc.mode')}" — Change Up must stay the default`);
      if (pillCount(open) !== OPEN_LOOPS) flag(`1ca: ${lang} Change Up lists ${pillCount(open)} loops, the data has ${OPEN_LOOPS}`);
      if ((open.match(/ccPickRate[(]/g) || []).length !== 3) flag(`1ca: ${lang} Change Up lists ${(open.match(/ccPickRate[(]/g) || []).length} speeds, expected its three`);
      if (open.indexOf('ccPickRate(') < open.lastIndexOf('ccPickProg(')) flag(`1ca: ${lang} Change Up's speed row moved above its loops — only Power Chord Switch puts the speed first`);
      if (open.indexOf('ccNudgeBpm(') < open.lastIndexOf('ccPickRate(')) flag(`1ca: ${lang} Change Up's tempo buttons moved above its speed row — only Power Chord Switch puts the tempo first`);
      if (POWER_NAME.test(text('cc-body'))) flag(`1ca: ${lang} Change Up shows a power chord ("${text('cc-body').match(POWER_NAME)[0]}")`);
    }
    run(`setLang('en')`);
    /* Each game remembers its own loop. */
    run(`ccSetup('power'); ccPickProg(3); ccSetup();`);
    if (run('cc.progIdx') !== 0) flag(`1ca: picking Power Chord Switch loop 4 moved Change Up's remembered loop to ${run('cc.progIdx')}`);
    run(`ccSetup('power');`);
    if (run('cc.progIdx') !== 3) flag(`1ca: Power Chord Switch forgot its remembered loop (got ${run('cc.progIdx')}, picked 3)`);
    /* ...and its own tempo and speed, including the "Again at +10 BPM" button
       (ccAgain re-starts the round, so ccStart is stubbed for that one call). */
    run(`ccSetup('power'); ccNudgeBpm(5); ccPickRate(1); globalThis.__realStart = ccStart; ccStart = () => {};
      cc.phase = 'done'; ccAgain(10); ccStart = __realStart;`);
    run(`ccSetup('power')`);
    const pwMemory = { bpm: run('cc.bpm'), rate: run('cc.rateIdx') };
    run(`ccSetup()`);
    const ccMemory = { bpm: run('cc.bpm'), rate: run('cc.rateIdx') };
    counts.pwMemory += 2;
    /* Power Chord Switch OPENS on 55 BPM (Jonathan, 2026-11-04: 5 slower than the 60 it opened on); Change Up opens on 60. A fresh session, nothing remembered. */
    const pwOpens = JSON.parse(run(`sessionStorage.removeItem('pwBpm'); sessionStorage.removeItem('ccBpm'); const __a = (ccSetup('power'), cc.bpm), __b = (ccSetup(), cc.bpm); JSON.stringify({ pw: __a, cc: __b, start: CC_POWER_START_BPM })`));
    counts.pwMemory += 1;
    if (pwOpens.pw !== 55 || pwOpens.start !== 55 || pwOpens.cc !== 60) flag(`1ca: a fresh Power Chord Switch opens on ${pwOpens.pw} BPM (CC_POWER_START_BPM ${pwOpens.start}) and Change Up on ${pwOpens.cc}; they must be 55 and 60`);
    if (pwMemory.bpm !== 70 || pwMemory.rate !== 1) flag(`1ca: Power Chord Switch reopened at ${pwMemory.bpm} BPM, speed ${pwMemory.rate}; it was set to 70 BPM (55 + 5 + the Again button's 10), speed 1 (it pwOpens on 2, every beat, so only a remembered pick gives 1)`);
    if (ccMemory.bpm !== 60 || ccMemory.rate !== 0) flag(`1ca: Change Up opened at ${ccMemory.bpm} BPM, speed ${ccMemory.rate} after Power Chord Switch's tempo was changed — it must keep its own (60, 0)`);
    /* The pitch gate each game reads strums with. ccLoop is run once per mode
       against a stubbed mic reader, and records the third argument it hands to
       coachPitchReadings: Change Up (with no mode, and with 'open') must keep
       0.55, Power Chord Switch must read with Riff Runner's RNW_POWER_CLARITY
       (tools/mic-sim/power-switch.mjs measured why). A run that never reaches
       the reader is a failure too, not a pass. */
    run(`globalThis.__orig = { rf: coachReadFrame, pr: coachPitchReadings, an: coachAnalyser, oa: coachOnsetAt, hf: coachHfRms };`);
    const gateSeen = mode => {
      run(`ccSetup(${mode === null ? '' : JSON.stringify(mode)});
        coachAnalyser = {}; coachReadFrame = () => 0.5; coachOnsetAt = 1000; coachHfRms = 0;
        globalThis.__gates = []; coachPitchReadings = (since, minEnd, gate) => { __gates.push(gate); return []; };
        Object.assign(cc, { phase: 'play', beatMs: 500, bpc: 4, slots: 8, listenStart: 1000 - coachMicLatencyMs(), gridOffset: 0,
          smoothRms: 0, smoothHf: 0, lastOnsetT: -1e9, lastPitchT: 0, lastBeat: -1,
          seq: ['F5', 'G5', 'F5', 'G5', 'F5', 'G5', 'F5', 'G5'], classes: { F5: [5, 0], G5: [7, 2] },
          changes: [{ beat: 0, from: 'F5', to: 'G5', result: null, pend: null }] });
        ccLoop();`);
      const gates = JSON.parse(run('JSON.stringify(__gates)'));
      run(`ccStop(); coachReadFrame = __orig.rf; coachPitchReadings = __orig.pr; coachAnalyser = __orig.an; coachOnsetAt = __orig.oa; coachHfRms = __orig.hf;`);
      return gates;
    };
    const POWER_GATE = JSON.stringify(JSON.parse(run('JSON.stringify(RNW_POWER_CLARITY)')));
    for (const [mode, want] of [[null, '0.55'], ['open', '0.55'], ['power', POWER_GATE]]) {
      counts.pwGates++;
      const seen = gateSeen(mode).map(g => JSON.stringify(g));
      if (!seen.length) flag(`1ca: ccLoop in mode ${JSON.stringify(mode)} never read pitch — the gate check went blind`);
      else if (seen.some(g => g !== want)) flag(`1ca: ccLoop in mode ${JSON.stringify(mode)} read pitch with gate ${seen.join(', ')}; it must be ${want}`);
    }
    /* A best saves under the game's own key and is beaten only by its own game's best. */
    const finish = (mode, bpm, saved) => {
      run(`currentUser = { uid: 'pw-check' }; games = ${JSON.stringify(saved)}; globalThis.__saves = 0; saveGames = () => { __saves++; };
        cc = { phase: 'play', mode: ${JSON.stringify(mode)}, progIdx: 0, rateIdx: ${mode === 'power' ? 2 : 0}, bpm: ${bpm}, bpc: ${mode === 'power' ? 1 : 4}, chords: ['F5', 'G5'], timeouts: [], micOn: false,
          changes: Array.from({ length: 8 }, () => ({ from: 'F5', to: 'G5', result: 'ok' })) };
        ccFinish(true);`);
      counts.pwViews++;
      return JSON.parse(run('JSON.stringify({ isNewBest: cc.isNewBest, games, saves: __saves })'));
    };
    const cleanPw = finish('power', 90, {}), cleanOpen = finish('open', 90, {});
    if (!cleanPw.games.pw || cleanPw.games.pw.bestBpm !== 90 || cleanPw.games.cc) flag(`1ca: a clean Power Chord Switch round saved ${JSON.stringify(cleanPw.games)} — expected games.pw.bestBpm 90 and no games.cc`);
    if (!cleanOpen.games.cc || cleanOpen.games.cc.bestBpm !== 90 || cleanOpen.games.pw) flag(`1ca: a clean Change Up round saved ${JSON.stringify(cleanOpen.games)} — expected games.cc.bestBpm 90 and no games.pw`);
    if (!finish('power', 90, { cc: { bestBpm: 100 } }).isNewBest) flag(`1ca: Change Up's best (100 BPM) hid a Power Chord Switch best at 90 — the two games share a record`);
    if (finish('power', 90, { pw: { bestBpm: 100 } }).isNewBest) flag(`1ca: Power Chord Switch called 90 BPM a new best over its own 100`);
    if (!finish('open', 90, { pw: { bestBpm: 100 } }).isNewBest) flag(`1ca: a Power Chord Switch best (100 BPM) hid a Change Up best at 90 — the two games share a record`);
    run(`currentUser = null; games = {};`);

    /* 4. The play screen and each beat tick carry the hint. */
    for (const lang of ['en', 'es']) {
      run(`setLang(${JSON.stringify(lang)})`);
      const nextWord = run(`t('games.common.next')`), lastOne = run(`t('games.cc.lastOne')`);
      LOOPS.forEach((lp, i) => {
        if (lp.group === 'song') return;   // a song's play screen and every beat tick are run in 1ck
        run(`ccSetup('power'); cc.progIdx = ${i}; cc.chords = ${JSON.stringify(lp.chords)}; cc.bpc = 1; cc.slots = 16;
          cc.seq = Array.from({ length: 16 }, (_, k) => cc.chords[k % cc.chords.length]);
          cc.changes = Array.from({ length: 15 }, (_, k) => ({ from: cc.seq[k], to: cc.seq[k + 1], result: null }));
          ccRenderPlay();`);
        counts.pwViews++;
        const seq = Array.from({ length: 16 }, (_, k) => lp.chords[k % lp.chords.length]);
        const shown = (bodies['cc-body'].match(/id="cc-next">([^<]*)</) || [])[1];
        const line = k => k + 1 >= 16 ? lastOne : `${nextWord} ${seq[k + 1]} — ${hintFor(seq[k], seq[k + 1], lang)}`;
        if (shown !== line(0).replace(/&/g, '&amp;')) flag(`1ca: ${lang} ${lp.chords.join('–')} play screen opens on "${shown}", expected "${line(0)}"`);
        for (let k = 0; k < 16; k++) {
          run(`ccBeatTick(${k})`);
          const got = els['cc-next'].textContent;
          if (got !== line(k)) flag(`1ca: ${lang} ${lp.chords.join('–')} beat ${k} shows "${got}", expected "${line(k)}"`);
        }
      });
    }
    /* ── 1ck. Power Chord Switch's SONG switches (2026-11-03) ──────────────────
       Each song gives one activity per DISTINCT chord switch its power-chord card
       plays (coach.js CC_POWER_PROGRESSIONS, group 'song', `ladder`): the pair
       goes back and forth 4 times (8 chords) in each of 3 rounds, every round
       faster than the last. "A switch" = two different chords one after the other
       INSIDE a section of the card's notes, either way round. NOT counted: a
       lap's wrap-around, or the step from one section to the next — the card never
       plays those as a chord change. Proved here from the data and by running coach.js:
       1. the card exists and is the song's (card.track === song);
       2. the song's entries are EXACTLY the card's distinct switches, once each
          (Sweet Child 10, "the cure" 6), with the shape rule applied;
       3. Sweet Child: the open A5 ('A5o') only next to C5, B5 and E5, the fret-5 A5
          only next to G5 (Jonathan's call, 2026-11-02), both used; A5o has the same
          pitches as A5 and is graded as A5; "the cure" uses the normal shapes only;
       4. every chord has a diagram that draws six strings;
       5. the round is 8 chords X Y X Y X Y X Y at every speed, in 3 rounds, and
          a pair's round is unchanged (the speed's own slot count);
       6. the ladder is RUN: ccPrepare gives the three tempos (base, +15, +30,
          never over the maximum), each ccStageEnd starts the next round at ITS
          tempo with a fresh set of changes, the last one finishes the game with
          all 21 changes, the BPM buttons on the play screen move only the rounds
          still to come and stay inside 40..140 (and do nothing in the last round),
          a Stop in a count-in leaves the round never played out of the report, and
          the score is the fastest round with 85% right;
       7. the "next:" hint on every beat of every entry is the move the DIAGRAMS
          show (both languages; independent of pwMoveHint);
       8. no player-facing text shows the key "A5o"; a done screen names it "A5 (open)";
       9. the computer's pick never draws a song, every song entry has its own best
          key, and the pair keys are unchanged; the songs sit at the END of the list
          so a remembered pick (an index) still names the same pair.
       Totals are pinned below. */
    const SONGS = LOOPS.map((l, i) => ({ ...l, idx: i })).filter(l => l.group === 'song');
    const SLUGS = [...new Set(SONGS.map(s => s.song))];
    const CARDS = JSON.parse(run(`JSON.stringify(CLASS_ACTIVITIES.filter(a => ${JSON.stringify([...new Set(SONGS.map(s => s.card))])}.includes(a.id)))`));
    const song = { songs: 0, entries: 0, cardSwitches: 0, hints: 0, setups: 0, dones: 0, rounds: 0, nudges: 0 };
    const baseOf = (k, s) => (s.shapes && s.shapes[k] && s.shapes[k].base) || k;
    const ukey = (a, b) => [a, b].sort().join('>');
    const cardSwitchSet = card => {
      const set = new Set();
      for (const sec of card.card.sections) {
        const seq = sec.notes.map(n => n.note);
        for (let i = 1; i < seq.length; i++) if (seq[i] !== seq[i - 1]) set.add(ukey(seq[i - 1], seq[i]));
      }
      return set;
    };
    /* The shape rule: a card switch with A5 is the open A5 ('A5o') next to C5, B5 and E5, the fret-5 A5 next to G5. */
    const shapedKey = (e, usesOpen) => {
      const [a, b] = e.split('>');
      if (!usesOpen) return e;
      const pick = (x, other) => (x === 'A5' ? (['C5', 'B5', 'E5'].includes(other) ? 'A5o' : other === 'G5' ? 'A5' : '?') : x);
      return ukey(pick(a, b), pick(b, a));
    };
    const firstSong = LOOPS.findIndex(l => l.group === 'song');
    if (!SONGS.length) flag('1ck: Power Chord Switch has no song entries (group "song")');
    if (firstSong < 0 || LOOPS.slice(firstSong).some(l => l.group !== 'song') || LOOPS.slice(0, firstSong).some(l => l.group === 'song')) flag('1ck: the songs must sit at the END of CC_POWER_PROGRESSIONS — inserting them earlier changes what a remembered pick (pwProg, an index) points at');
    const DIAG_ALL = JSON.parse(run('JSON.stringify(CHORD_DIAGRAMS)'));
    const songShape = (k, s) => (s.shapes && s.shapes[k]) || DIAG_ALL[k];
    const rootFor = (k, s) => { const sh = songShape(k, s); const r = sh && sh.chord.find(c => c[1] !== 'x'); return r ? { string: r[0], fret: r[1] } : null; };
    const fingerFret = (k, s) => { const sh = songShape(k, s); const f = sh && sh.chord.find(c => c[1] !== 'x' && c[1] > 0); return f ? f[1] : 0; };
    const songHint = (a, b, lang, s) => {
      const x = rootFor(a, s), y = rootFor(b, s);
      if (!x || !y) return null;
      const str = n => (n === 6 ? (lang === 'en' ? 'low E' : 'Mi grave') : lang === 'en' ? 'A' : 'La');
      if (y.fret === 0) return lang === 'en' ? `open ${str(y.string)} string, fingers on fret ${fingerFret(b, s)}` : `cuerda ${str(y.string)} al aire, dedos en el traste ${fingerFret(b, s)}`;
      if (x.string !== y.string || x.fret === 0) return lang === 'en' ? `move to the ${str(y.string)} string, fret ${y.fret}` : `pasa a la cuerda ${str(y.string)}, traste ${y.fret}`;
      const d = y.fret - x.fret, n = Math.abs(d);
      if (!d) return '';
      return lang === 'en' ? `slide ${d > 0 ? 'up' : 'down'} ${n} ${n === 1 ? 'fret' : 'frets'}` : `${d > 0 ? 'sube' : 'baja'} ${n} ${n === 1 ? 'traste' : 'trastes'}`;
    };
    /* Stubs for the stage machine: no microphone, no clock. Restored afterwards. */
    run(`globalThis.__ccLoop = ccLoop; globalThis.__coachCountIn = coachCountIn; globalThis.__saveGames = saveGames;
      ccLoop = () => {}; coachCountIn = (st) => { st.listenStart = 0; }; saveGames = () => {};`);
    for (const slug of SLUGS) {
      song.songs++;
      const entries = SONGS.filter(s => s.song === slug);
      const tag = `1ck: ${slug}`;
      const card = CARDS.find(c => c.id === entries[0].card);
      if (!card || !card.card || !Array.isArray(card.card.sections)) { flag(`${tag}: its card ${entries[0].card} does not exist`); continue; }
      if (card.card.track !== slug) flag(`${tag}: card ${card.id} plays track "${card.card.track}", not "${slug}"`);
      if (entries.some(e => e.card !== card.id)) flag(`${tag}: its entries name different cards`);
      const usesOpen = entries.some(e => e.shapes && e.shapes.A5o);
      const cardSet = cardSwitchSet(card); song.cardSwitches += cardSet.size;
      const want = new Set([...cardSet].map(e => shapedKey(e, usesOpen)));
      const got = entries.map(e => ukey(e.chords[0], e.chords[1]));
      for (const k of want) if (!got.includes(k)) flag(`${tag}: card ${card.id} plays ${k.replace('>', ' ↔ ')} and there is no activity for it`);
      for (const k of got) if (!want.has(k)) flag(`${tag}: the activity ${k.replace('>', ' ↔ ')} is a switch card ${card.id} never plays`);
      if (new Set(got).size !== got.length) flag(`${tag}: a switch is listed twice (${got.join(', ')})`);
      for (const e of entries) {
        song.entries++;
        const etag = `${tag} ${e.chords.join('↔')}`;
        if (e.chords.length !== 2 || e.chords[0] === e.chords[1]) flag(`${etag}: a song switch is two different chords`);
        if (!e.ladder) flag(`${etag}: not a ladder (3 rounds)`);
        for (const k of e.chords) {
          const sh = songShape(k, e);
          if (!sh || !Array.isArray(sh.chord) || sh.chord.length !== 6) flag(`${etag}: ${k} has no diagram (a shapes entry or CHORD_DIAGRAMS)`);
          if (k === 'A5o' && !(e.shapes && e.shapes.A5o)) flag(`${etag}: uses A5o without the shape`);
        }
        if (slug === 'sweet-child-o-mine') {
          const [a, b] = e.chords, other = a === 'A5o' || a === 'A5' ? b : a;
          if (e.chords.includes('A5o') && !['C5', 'B5', 'E5'].includes(other)) flag(`${etag}: the open A5 belongs only next to C5, B5 or E5`);
          if (e.chords.includes('A5') && other !== 'G5') flag(`${etag}: the fret-5 A5 belongs only next to G5`);
        } else if (e.shapes || e.chords.some(k => !DIAG_ALL[k])) flag(`${etag}: it must use the game's normal shapes only (CHORD_DIAGRAMS), no shapes of its own`);
        if (e.shapes && e.shapes.A5o) {
          const a5o = e.shapes.A5o, pitches = ch => run(`JSON.stringify(chordSpecMidis(${JSON.stringify(ch)}))`);
          if (a5o.base !== 'A5') flag(`${etag}: A5o has no base "A5"`);
          else if (pitches(a5o.chord) !== run('JSON.stringify(chordMidis("A5"))')) flag(`${etag}: the open A5 plays ${pitches(a5o.chord)}, the library A5 plays ${run('JSON.stringify(chordMidis("A5"))')}`);
        }
        /* 5. The round at every speed: 8 chords X Y X Y …, 3 rounds; the grading's pitch classes for A5o are A5's. */
        for (let r = 0; r < 3; r++) {
          const plan = JSON.parse(run(`JSON.stringify(ccRoundPlan(CC_POWER_PROGRESSIONS[${e.idx}], CC_POWER_PROGRESSIONS[${e.idx}].chords, CC_RATES[${r}]))`));
          const wantSeq = Array.from({ length: 8 }, (_, i) => e.chords[i % 2]);
          if (plan.slots !== 8 || plan.seq.join() !== wantSeq.join() || !plan.ladder || plan.rounds !== 3) flag(`${etag}: at speed ${r} the round is ${plan.slots} chords (${plan.seq.join(' ')}) in ${plan.rounds} rounds, expected 8 (${wantSeq.join(' ')}) in 3`);
          for (const k of e.chords) if (JSON.stringify(plan.classes[k]) !== JSON.stringify(plan.classes[baseOf(k, e)] || plan.classes[k])) flag(`${etag}: ${k} would be graded on ${JSON.stringify(plan.classes[k])}, not ${baseOf(k, e)}'s`);
          if (e.shapes && e.shapes.A5o) {
            const libA5 = JSON.parse(run('JSON.stringify(chordMidis("A5").map(m => ((m % 12) + 12) % 12))'));
            if (JSON.stringify(plan.classes.A5o) !== JSON.stringify(libA5)) flag(`${etag}: A5o is graded on ${JSON.stringify(plan.classes.A5o)}, A5 on ${JSON.stringify(libA5)}`);
          }
        }
        /* 6. The ladder, run: Start → round 1 → … → round 3 → done. */
        run(`setLang('en'); currentUser = { uid: 'pw-check' }; games = {}; ccSetup('power'); ccPickRate(2); ccPickProg(${e.idx}); cc.bpm = 60; ccPrepare(false); ccBeginStage();`);
        const st = () => JSON.parse(run('JSON.stringify({ stage: cc.stage, phase: cc.phase, bpms: cc.stageBpms, beatMs: cc.beatMs, n: cc.changes.length, fresh: cc.changes.every(c => c.result === null), log: cc.stageLog.length })'));
        let s0 = st();
        if (JSON.stringify(s0.bpms) !== '[60,75,90]' || s0.stage !== 0 || s0.phase !== 'countin' || s0.beatMs !== 1000 || s0.n !== 7) flag(`${etag}: Start gave ${JSON.stringify(s0)}, expected rounds at [60,75,90], round 1 counting in at 1000 ms a beat with 7 changes`);
        if (!text('cc-body').includes('Round 1 of 3 · 60 BPM')) flag(`${etag}: the count-in does not say "Round 1 of 3 · 60 BPM" (${text('cc-body').slice(0, 80)})`);
        /* The play screen's BPM buttons: only the rounds still to come, inside 40..140. */
        run(`cc.phase = 'play'; ccRenderPlay();`);
        if (!/id="cc-next-bpm">Next round: 75 BPM</.test(bodies['cc-body']) || !/onclick="ccNudgeNext\(5\)"[^>]*>\+5</.test(bodies['cc-body'])) flag(`${etag}: the play screen has no "Next round: 75 BPM" with its +5 button`);
        if (/ccNudgeNext\([-−]?5\)" disabled/.test(bodies['cc-body'])) flag(`${etag}: the BPM buttons are disabled in round 1`);
        run(`ccNudgeNext(5)`); song.nudges++;
        if (run('JSON.stringify(cc.stageBpms)') !== '[60,80,95]') flag(`${etag}: +5 on the play screen left the rounds at ${run('JSON.stringify(cc.stageBpms)')}, expected [60,80,95]`);
        if (els['cc-next-bpm'].textContent !== 'Next round: 80 BPM') flag(`${etag}: after +5 the readout says "${els['cc-next-bpm'].textContent}"`);
        run(`for (let i = 0; i < 40; i++) ccNudgeNext(5);`);
        if (Math.max(...JSON.parse(run('JSON.stringify(cc.stageBpms)'))) > 140) flag(`${etag}: the BPM buttons went past 140: ${run('JSON.stringify(cc.stageBpms)')}`);
        run(`for (let i = 0; i < 60; i++) ccNudgeNext(-5);`);
        if (Math.min(...JSON.parse(run('JSON.stringify(cc.stageBpms.slice(1))'))) < 40 || run('cc.stageBpms[0]') !== 60) flag(`${etag}: the BPM buttons went under 40, or moved the round being played: ${run('JSON.stringify(cc.stageBpms)')}`);
        run(`cc.stageBpms = [60, 75, 90];`);
        /* Round 1 → 2: this round's changes are kept, the next starts at its own tempo. */
        run(`cc.changes.forEach(c => { c.result = 'ok'; }); ccStageEnd();`);
        s0 = st(); song.rounds++;
        if (s0.stage !== 1 || s0.phase !== 'countin' || s0.beatMs !== 800 || s0.n !== 7 || !s0.fresh || s0.log !== 1) flag(`${etag}: after round 1 the state is ${JSON.stringify(s0)}, expected round 2 counting in at 800 ms a beat with 7 fresh changes and 1 round kept`);
        if (!text('cc-body').includes('Round 2 of 3 · 75 BPM')) flag(`${etag}: round 2's count-in does not say "Round 2 of 3 · 75 BPM"`);
        run(`cc.phase = 'play'; ccRenderPlay(); cc.changes.forEach((c, i) => { c.result = i === 0 ? 'miss' : 'ok'; }); ccStageEnd();`);
        s0 = st(); song.rounds++;
        if (s0.stage !== 2 || s0.beatMs !== 60000 / 90 || s0.log !== 2) flag(`${etag}: after round 2 the state is ${JSON.stringify(s0)}, expected round 3 at 90 BPM with 2 rounds kept`);
        run(`cc.phase = 'play'; ccRenderPlay();`);
        if (!/id="cc-next-bpm">Last round</.test(bodies['cc-body']) || (bodies['cc-body'].match(/ disabled>/g) || []).length !== 2) flag(`${etag}: in the last round the BPM buttons are not both disabled with "Last round" beside them`);
        run(`ccNudgeNext(5)`); song.nudges++;
        if (run('JSON.stringify(cc.stageBpms)') !== '[60,75,90]') flag(`${etag}: +5 in the last round moved ${run('JSON.stringify(cc.stageBpms)')}`);
        /* Round 3 → done: all 21 changes, scored at the fastest round with 85% right. */
        run(`cc.changes.forEach(c => { c.result = 'ok'; }); ccStageEnd();`); song.rounds++;
        const fin = JSON.parse(run('JSON.stringify({ phase: cc.phase, n: cc.changes.length, log: cc.stageLog.length, score: ccScoreBpm(), best: cc.isNewBest, saved: games.pw && games.pw.bestBpm })'));
        if (fin.phase !== 'done' || fin.n !== 21 || fin.log !== 3 || fin.score !== 90 || fin.best !== true || fin.saved !== 90) flag(`${etag}: the finished game is ${JSON.stringify(fin)}, expected done, 21 changes, 3 rounds, scored at 90 BPM and saved as the best`);
        const doneTxt = text('cc-body');
        for (const w of ['Round 1 · 60 BPM: 7 of 7', 'Round 2 · 75 BPM: 6 of 7', 'Round 3 · 90 BPM: 7 of 7', 'Again from 60 BPM']) if (!doneTxt.includes(w)) flag(`${etag}: the done screen does not say "${w}"`);
        /* Scores: round 3 not clean → round 2's tempo; no round clean → 0. */
        const score = marks => run(`cc.ladder = true; cc.stageBpms = [60, 75, 90]; cc.stageLog = ${JSON.stringify(marks)}.map((n, k) => ({ bpm: cc.stageBpms[k], changes: Array.from({ length: 7 }, (_, i) => ({ result: i < n ? 'ok' : 'miss' })) })); ccScoreBpm()`);
        if (score([7, 7, 4]) !== 75 || score([7, 5, 7]) !== 90 || score([4, 4, 4]) !== 0 || score([6, 7, 3]) !== 75) flag(`${etag}: ccScoreBpm gave ${score([7, 7, 4])}/${score([7, 5, 7])}/${score([4, 4, 4])}/${score([6, 7, 3])}, expected 75/90/0/75`);
        /* Stop during round 2's count-in: round 1 is reported, round 2 (never played) is not. */
        run(`ccSetup('power'); ccPickProg(${e.idx}); cc.bpm = 60; ccPrepare(false); ccBeginStage(); cc.changes.forEach(c => { c.result = 'ok'; }); ccStageEnd(); ccFinish(false);`);
        const early = JSON.parse(run('JSON.stringify({ n: cc.changes.length, ok: cc.changes.filter(c => c.result === "ok").length, log: cc.stageLog.length })'));
        if (early.n !== 7 || early.ok !== 7 || early.log !== 1) flag(`${etag}: a Stop in round 2's count-in reports ${JSON.stringify(early)}, expected only round 1 (7 changes, 7 right)`);
        /* Another Start gives a clean slate (Again). */
        run(`cc.phase = 'setup'; ccPrepare(true);`);
        if (run('cc.stage') !== 0 || run('cc.stageLog.length') !== 0) flag(`${etag}: Again did not start from round 1 with nothing kept`);
        run(`ccStop(); cc = null;`);
      }
      /* Screens, both languages: setup (every speed), the play screen's "next:" on every beat, the done screen. */
      for (const lang of ['en', 'es']) {
        run(`setLang(${JSON.stringify(lang)})`);
        const nextWord = run(`t('games.common.next')`), lastOne = run(`t('games.cc.lastOne')`);
        const shownName = k => run(`pwChordName(${JSON.stringify(k)})`);
        for (const e of entries) {
          const etag = `${tag} ${e.chords.join('↔')} (${lang})`;
          const title = run(`t(${JSON.stringify(e.titleKey)})`);
          for (let r = 0; r < 3; r++) {
            run(`ccSetup('power'); cc.bpm = 60; ccPickRate(${r}); ccPickProg(${e.idx})`); song.setups++;
            const setup = bodies['cc-body'], flat = text('cc-body');
            const startLabel = run(`t('games.pw.ladder.start', { n: 3 })`);
            if (!setup.includes(`${startLabel}</button>`)) flag(`${etag}, speed ${r}: the Start button does not read "${startLabel}"`);
            if (!flat.includes(String(title).replace(/\s+/g, ' '))) flag(`${etag}: the setup does not show the song's name "${title}"`);
            const ladderLine = [1, 2, 3].map(n => run(`t('games.pw.ladder.roundBpm', { n: ${n}, bpm: ${[60, 75, 90][n - 1]} })`)).join(' · ');
            if (!flat.includes(ladderLine)) flag(`${etag}: the setup does not list the three tempos ("${ladderLine}")`);
            const boxes = (setup.match(/id="cc-dia-[^"]+"/g) || []);
            if (boxes.length !== 2) flag(`${etag}: the chart preview draws ${boxes.length} boxes, a switch has 2`);
            if (/A5o/.test(flat) || (e.shapes && e.shapes.A5o && !flat.includes(shownName('A5o').replace(/\s+/g, ' ')))) flag(`${etag}: the setup shows the key "A5o", or never names it "${shownName('A5o')}"`);
          }
          run(`ccSetup('power'); ccPickRate(2); ccPickProg(${e.idx}); ccPrepare(false); ccBeginStage(); cc.phase = 'play'; ccRenderPlay();`);
          const seq = Array.from({ length: 8 }, (_, k) => e.chords[k % 2]);
          for (let k = 0; k < 8; k++) {
            run(`ccBeatTick(${k})`);
            const hint = k + 1 < 8 ? songHint(seq[k], seq[k + 1], lang, e) : null;
            const wantTxt = k + 1 >= 8 ? lastOne : `${nextWord} ${shownName(seq[k + 1])} — ${hint}`;
            if (k + 1 < 8 && !hint) flag(`${etag}: no hint worked out for ${seq[k]} → ${seq[k + 1]}`);
            if (els['cc-next'].textContent !== wantTxt) flag(`${etag} chord ${k}: "next:" shows "${els['cc-next'].textContent}", the diagrams say "${wantTxt}"`);
            if (els['cc-chord'].dataset.key !== seq[k]) flag(`${etag} chord ${k}: the big chord's key is "${els['cc-chord'].dataset.key}", expected ${seq[k]}`);
            if (/A5o/.test(els['cc-next'].textContent)) flag(`${etag} chord ${k}: "next:" shows the key "A5o"`);
            if (k + 1 < 8) song.hints++;
          }
          if (/A5o/.test(bodies['cc-body'].replace(/\s(id|data-key|onclick)="[^"]*"/g, ''))) flag(`${etag}: the play screen shows the key "A5o" (outside ids)`);
          /* Done screen: three rounds, every change missed, then a round that hurt on one switch. */
          run(`cc.phase = 'play'; cc.stageLog = [60, 75, 90].map(b => ({ bpm: b, changes: Array.from({ length: 7 }, (_, i) => ({ from: cc.seq[i], to: cc.seq[i + 1], result: 'miss' })) })); cc.changes = cc.stageLog.reduce((a, sg) => a.concat(sg.changes), []); ccRenderDone();`); song.dones++;
          const doneHtml = bodies['cc-body'], doneText = text('cc-body');
          if (/A5o/.test(doneHtml.replace(/\s(id|data-key|onclick)="[^"]*"/g, ''))) flag(`${etag}: the done screen shows the key "A5o"`);
          if (e.shapes && e.shapes.A5o && !doneText.includes(shownName('A5o').replace(/\s+/g, ' '))) flag(`${etag}: the done screen never says "${shownName('A5o')}"`);
          const roundsHtml = (doneHtml.match(/<div class="cc-rounds">(.*?)<\/div>/) || [])[1] || '';
          if ((roundsHtml.match(/<span>/g) || []).length !== 3) flag(`${etag}: the done screen lists ${(roundsHtml.match(/<span>/g) || []).length} rounds, expected 3`);
        }
      }
    }
    /* 10. Recorded takes and the clearer feedback (2026-11-03). Power Chord Switch records a consented take like the Listening Coach and Note
       Runner: one capture for the WHOLE game (started once, in round 1), saved only when the game is played to the end, never in Change Up; the one-time
       question comes first and its answer starts the game; the rules accept the take id; the teacher console names the take and does not try to measure it.
       The done screen counts what went right and wrong, and every chip carries a symbol as well as a colour. */
    song.recChecks = 0;
    run(`globalThis.__saves = []; globalThis.__starts = 0; globalThis.__orig = { micRecStop, micRecSave, micRecStart, micRecShouldAsk, micRecAbort, micRecWanted };
      /* The stand-ins keep micRec honest: a stop after coachMicOff (which aborts) finds nothing to save. */
      micRecStart = (mode) => { __starts++; micRec = { live: true, mode, n: (globalThis.__recSec || 30), srcRate: 1 }; return true; };
      micRecStop = () => { const r = micRec; micRec = null; return r; };
      micRecAbort = () => { micRec = null; };
      micRecSave = (rec, meta) => { __saves.push(meta); };`);
    const take = (mode, finish) => {
      run(`micRec = null; __saves = []; __starts = 0; setLang('en'); currentUser = { uid: 'pw-check' }; games = {}; ccSetup(${JSON.stringify(mode)}); cc.micOn = true; ccPickRate(2); ccPickProg(${mode === 'power' ? SONGS[0].idx : 1}); cc.bpm = 60; ccPrepare(false); ccBeginStage();
        cc.phase = 'play'; cc.changes.forEach(c => { c.result = 'ok'; }); ${finish}`);
      song.recChecks++;
      return JSON.parse(run('JSON.stringify({ saves: __saves, starts: __starts })'));
    };
    const full = take('power', 'ccStageEnd(); cc.phase = "play"; cc.changes.forEach(c => { c.result = "ok"; }); ccStageEnd(); cc.phase = "play"; cc.changes.forEach(c => { c.result = "ok"; }); ccStageEnd();');
    if (full.starts !== 1) flag(`1ck: a three-round game started ${full.starts} captures, expected ONE for the whole game`);
    if (full.saves.length !== 1) flag(`1ck: a game played to the end saved ${full.saves.length} takes, expected 1`);
    else {
      const m = full.saves[0];
      if (m.fields.game !== 'pw' || JSON.stringify(m.fields.stageBpms) !== '[60,75,90]' || m.fields.bpm !== 60 || m.fields.progression !== SONGS[0].chords.join('-')) flag(`1ck: the saved take's fields are ${JSON.stringify(m.fields)}`);
      if (m.expected.length !== 21 || m.expected.some(e => !Number.isFinite(e.t) || !['ok', 'off', 'miss'].includes(e.verdict) || ![0, 1, 2].includes(e.stage))) flag(`1ck: the saved take lists ${m.expected.length} changes (expected 21, each with a time, a verdict and a round)`);
      if (!Array.isArray(m.events)) flag('1ck: the saved take has no events list');
    }
    if (full.saves.length === 1 && full.saves[0].fields.complete !== true) flag('1ck: a game played to the end is not marked complete:true in the saved take');
    /* Save on Stop (2026-11-04): a Stopped game with enough audio is saved, marked complete:false; one with almost none is dropped,
       because each student has ONE take per game and a new take overwrites it. */
    run('globalThis.__recSec = 20;');
    const stopLong = take('power', 'ccFinish(false);');
    if (stopLong.saves.length !== 1 || stopLong.saves[0].fields.complete !== false) flag(`1ck: a game Stopped after 20 s of audio saved ${stopLong.saves.length} takes (complete:${stopLong.saves[0] && stopLong.saves[0].fields.complete}), expected 1 with complete:false`);
    run('globalThis.__recSec = 3;');
    if (take('power', 'ccFinish(false);').saves.length !== 0) flag('1ck: a game Stopped after 3 s of audio was saved (it would overwrite the last full take with a stub)');
    run('globalThis.__recSec = 30;');
    if (!/const MICREC_MIN_STOPPED_SEC = 10;/.test(readFileSync(join(ROOT, 'coach.js'), 'utf8'))) flag('1ck: MICREC_MIN_STOPPED_SEC is no longer 10');
    const cu = take('open', 'ccFinish(true);');
    if (cu.saves.length !== 0 || cu.starts !== 0) flag(`1ck: Change Up started ${cu.starts} captures and saved ${cu.saves.length} takes — it must never record`);
    /* The red label is on every screen of a recorded take (each screen replaces #cc-body); every round starts on a clean grid (a leftover
       gridOffset or onset time from round 1 would grade round 2 late); a ladder is always three rising tempos; and a student who said yes is not
       told "nothing is recorded" on any Power Chord Switch screen (Change Up, which never records, still says it). */
    run(`micRec = null; setLang('en'); ccSetup('power'); ccPickRate(2); ccPickProg(${SONGS[0].idx}); cc.bpm = 60; ccPrepare(false); ccBeginStage();`);
    const hasLabel = () => /id="micrec-on"/.test(bodies['cc-body']);
    const seen = [hasLabel()];
    run(`cc.phase = 'play'; ccRenderPlay();`); seen.push(hasLabel());
    run(`cc.gridOffset = 123; cc.lastOnsetT = 5; cc.smoothRms = 9; cc.smoothHf = 9; cc.lastPitchT = 7; cc.lastBeat = 11; cc.changes.forEach(c => { c.result = 'ok'; }); ccStageEnd();`);
    seen.push(hasLabel());
    run(`cc.phase = 'play'; ccRenderPlay();`); seen.push(hasLabel());
    song.recChecks++;
    if (!seen.every(Boolean)) flag(`1ck: the "Recording this take" label is missing on screen(s) ${seen.map((v, i) => (v ? '' : ['round 1 count-in', 'round 1 play', 'round 2 count-in', 'round 2 play'][i])).filter(Boolean).join(', ')} of a recorded take`);
    const fresh = run('JSON.stringify([cc.gridOffset, cc.lastOnsetT, cc.smoothRms, cc.smoothHf, cc.lastPitchT, cc.lastBeat])');
    if (fresh !== JSON.stringify([0, -1e9, 0, 0, 0, -1])) flag(`1ck: round 2 starts with a leftover grid from round 1 (gridOffset, lastOnsetT, smoothRms, smoothHf, lastPitchT, lastBeat = ${fresh})`);
    const ladders = JSON.parse(run('JSON.stringify(Array.from({ length: 21 }, (_, k) => ccLadderBpms(40 + k * 5)))'));
    song.recChecks++;
    ladders.forEach((l, k) => { if (!(l[0] < l[1] && l[1] < l[2]) || l[2] > 140 || l[0] > 40 + k * 5 || l[0] < 40) flag(`1ck: a base of ${40 + k * 5} BPM gives rounds ${l.join('/')} — three rising tempos between 40 and 140 are needed`); });
    if (JSON.stringify(ladders[0]) !== '[40,55,70]' || JSON.stringify(ladders[4]) !== '[60,75,90]' || JSON.stringify(ladders[18]) !== '[110,125,140]' || JSON.stringify(ladders[20]) !== '[110,125,140]') flag(`1ck: ladder tempos for bases 40/60/130/140 are ${[0, 4, 18, 20].map(i => ladders[i].join('/')).join(' | ')}`);
    run(`micRecWanted = () => true;`);
    const foot = (setup, kind) => {
      run(setup); song.recChecks++;
      return { html: bodies['cc-body'], flat: text('cc-body'), kind };
    };
    const footRec = String(run(`t('coach.footRec')`)).replace(/\s+/g, ' '), footNone = String(run(`t('coach.foot')`)).replace(/\s+/g, ' ');
    const screens = [
      foot(`ccSetup('power'); ccPickProg(1);`, 'Power Chord Switch setup'),
      foot(`ccSetup('power'); cc.phase = 'play'; cc.ladder = false; cc.bpm = 60; cc.rateIdx = 2; cc.bpc = 1; cc.changes = [{ from: 'F5', to: 'G5', result: 'ok' }]; ccRenderDone();`, 'Power Chord Switch done screen')
    ];
    for (const sc of screens) if (!/data-rec/.test(sc.html) || !sc.flat.includes(footRec) || sc.flat.includes(footNone)) flag(`1ck: the ${sc.kind} does not tell a student who said yes that takes are saved (data-rec, "${footRec.slice(0, 40)}…")`);
    const cuScreen = foot(`ccSetup('open');`, 'Change Up setup');
    if (/data-rec/.test(cuScreen.html) || cuScreen.flat.includes(footRec) || !cuScreen.flat.includes(footNone)) flag('1ck: Change Up never records, so its footer must keep saying nothing is recorded');
    run(`micRecWanted = __orig.micRecWanted;`);
    run('micRecStop = __orig.micRecStop; micRecSave = __orig.micRecSave; micRecStart = __orig.micRecStart; micRecAbort = __orig.micRecAbort; micRec = null;');
    /* The question first: with an unanswered consent, Start asks and does not start. */
    run("micRecShouldAsk = () => true; ccSetup('power'); ccStart(true);"); song.recChecks++;
    if (!/micRecConsent\(true,'pw'\)/.test(bodies['cc-body']) || run('cc.phase') !== 'setup') flag('1ck: Start with an unanswered consent does not ask first (or started anyway)');
    if (run('cc.pendingAgain') !== true) flag('1ck: a replay (Again) that has to ask the consent question forgets it was a replay');
    run('micRecShouldAsk = __orig.micRecShouldAsk;');
    const consentBody = jsFunctionBody(readFileSync(join(ROOT, 'coach.js'), 'utf8'), 'micRecConsent'), startSrc = jsFunctionBody(readFileSync(join(ROOT, 'coach.js'), 'utf8'), 'ccStart');
    if (!consentBody || !/game === 'pw'\) ccStart\(!!\(cc && cc\.pendingAgain\)\)/.test(consentBody)) flag("1ck: micRecConsent does not start Power Chord Switch for game 'pw' (passing on whether it was a replay)");
    const startCode = startSrc ? stripJsComments(startSrc) : '';
    if (!/if \(ccIsPower\(\) && micRecShouldAsk\(\) && ccBody\(\)\)\{/.test(startCode) || (startCode.match(/micRecShouldAsk/g) || []).length !== 1) flag('1ck: ccStart must ask the consent question for Power Chord Switch only, in one place (Change Up never records)');
    const loopCode = stripJsComments(jsFunctionBody(readFileSync(join(ROOT, 'coach.js'), 'utf8'), 'ccLoop') || '');
    if (!/if \(micRec && micRec\.live\) cc\.evLog\.push\(\{ t: at - lat, stage: cc\.stage \}\)/.test(loopCode)) flag('1ck: ccLoop no longer logs each strum heard (cc.evLog) while a take is recording');
    const rulesTxt = readFileSync(join(ROOT, 'firestore.rules'), 'utf8');
    if ((rulesTxt.match(/takeId\.matches\(request\.auth\.uid \+ '-\(coach\|nr\|pw\)'\)/g) || []).length !== 2 || /\(coach\|nr\|pw\)[^']/.test(rulesTxt.replace(/\(coach\|nr\|pw\)'\)/g, ''))) flag("1ck: firestore.rules must accept exactly the take id '<uid>-(coach|nr|pw)' on the take AND its chunks (two anchored matches, no wildcard after the id) — publish it in the console before the code writes");
    /* Evaluate-all MEASURES Power Chord Switch takes since 2026-11-04 (teacher.js micEvalTakePw): 1cl runs it. */
    /* The clearer feedback. */
    for (const lang of ['en', 'es']) {
      run(`setLang(${JSON.stringify(lang)}); ccSetup('power'); cc.phase = 'play'; cc.ladder = false; cc.bpm = 60; cc.rateIdx = 2; cc.bpc = 1;
        cc.changes = [{ from: 'F5', to: 'G5', result: 'ok' }, { from: 'G5', to: 'F5', result: 'off' }, { from: 'F5', to: 'G5', result: 'miss' }, { from: 'G5', to: 'F5', result: 'ok' }]; ccRenderDone();`); song.recChecks++;
      const html = bodies['cc-body'], flat = text('cc-body');
      const wantLine = run("t('games.cc.breakdown', { ok: 2, off: 1, miss: 1 })");
      if (!flat.includes(String(wantLine).replace(/\s+/g, ' ')) || !/\u2713 2\b/.test(wantLine) || !/\u2717 1\b/.test(wantLine) || !/\u2013 1\b/.test(wantLine)) flag(`1ck: (${lang}) the done screen does not count right / wrong chord / no strum (2 / 1 / 1): "${wantLine}"`);
      const chips = (html.match(/<span class="coach-chip [^"]*">([^<]*)</g) || []).map(x => x.replace(/^.*">/, '').replace(/<$/, ''));
      if (chips.join('|') !== '\u2713 G5|\u2717 F5|\u2013 G5|\u2713 F5') flag(`1ck: (${lang}) the done screen's chips read ${JSON.stringify(chips)}, expected ✓ G5|✗ F5|– G5|✓ F5`);
    }
    /* The big line on the play screen: every result says its symbol, the chord and the words, in both languages, and the row is there from the start. */
    for (const lang of ['en', 'es']) {
      run(`setLang(${JSON.stringify(lang)}); ccSetup('power'); ccPickRate(2); ccPickProg(1); cc.bpm = 60; ccPrepare(false); ccBeginStage(); cc.phase = 'play'; ccRenderPlay();`);
      if (!/id="cc-last"/.test(bodies['cc-body'])) flag(`1ck: (${lang}) the play screen has no big last-change line`);
      for (const [res, sym, cls] of [['ok', '\u2713', 'ok'], ['off', '\u2717', 'wrong'], ['miss', '\u2013', 'miss']]) {
        run(`cc.changes[0].result = ${JSON.stringify(res)}; ccChipRefresh(0);`); song.recChecks++;
        const got = els['cc-last'].textContent, want = run(`t('games.pw.last.${cls}', { chord: pwChordName(cc.changes[0].to) })`);
        if (got !== want || !got.startsWith(sym) || !got.includes(run('cc.changes[0].to')) || els['cc-last'].className !== 'cc-last ' + cls) flag(`1ck: (${lang}) a "${res}" change shows "${got}" in class "${els['cc-last'].className}", expected "${want}" in "cc-last ${cls}"`);
      }
    }
    run("setLang('en')");
    run(`ccLoop = globalThis.__ccLoop; coachCountIn = globalThis.__coachCountIn; saveGames = globalThis.__saveGames; currentUser = null; games = {};`);
    run(`setLang('en')`);
    /* The computer never picks a song, best keys, pair keys unchanged. */
    const songDraws = JSON.parse(run(`JSON.stringify(Array.from({ length: 2000 }, () => ccRandomPair()))`));
    const pairKeys = new Set(LOOPS.filter(l => l.group !== 'song' && !l.random).map(l => [...l.chords].sort().join()));
    if (songDraws.some(d => d.length !== 2 || !pairKeys.has([...d].sort().join()))) flag('1ck: ccRandomPair drew something that is not a listed pair (a song?)');
    const bestKeys = SONGS.map(s => run(`ccBestKey(CC_POWER_PROGRESSIONS[${s.idx}], 2)`));
    if (new Set(bestKeys).size !== SONGS.length || bestKeys.some((k, i) => k !== `ccBest:SONG:${SONGS[i].song}:${SONGS[i].chords.join('-')}:beat`)) flag(`1ck: song best-score keys are ${JSON.stringify(bestKeys)}, expected ccBest:SONG:<slug>:<a>-<b>:beat, one each`);
    const pk = run(`ccBestKey({ chords: ['F5', 'G5'] }, 2)`);
    if (pk !== 'ccBest:F5-G5:beat') flag(`1ck: a pair's best-score key changed to "${pk}" (a student's saved bests would be lost)`);
    const pairPlan = JSON.parse(run(`JSON.stringify(ccRoundPlan(CC_POWER_PROGRESSIONS[1], CC_POWER_PROGRESSIONS[1].chords, CC_RATES[1]))`));
    if (pairPlan.slots !== 12 || pairPlan.ladder || pairPlan.rounds !== 1) flag(`1ck: a pair's round changed (${pairPlan.slots} slots at "Every 2 beats", expected 12, one round)`);
    const SONG_PIN = { recChecks: 18, songs: 2, entries: 16, cardSwitches: 16, hints: 16 * 7 * 2, setups: 16 * 3 * 2, dones: 16 * 2, rounds: 16 * 3, nudges: 16 * 2 };
    for (const [k, n] of Object.entries(SONG_PIN)) if (song[k] !== n) flag(`1ck: ${song[k]} ${k}, pinned ${n} — the check went partly blind (or grew: re-pin on purpose)`);
    songCounts = song;
    run(`setLang('en'); cc = null; ccStop();`);
  } catch (e) { flag(`1ca: rendering threw (${e.message}) — a coach.js function was renamed or now needs more of the page`); return; }

  for (const [k, n] of Object.entries(EXPECT)) {
    if (counts[k] !== n) flag(`1ca: rendered ${counts[k]} ${k}, pinned ${n} — the check went partly blind (or grew: re-pin EXPECT on purpose)`);
  }
  if (bad === 0 && songCounts) { head('1ck. Power Chord Switch song switches: each activity is checked against its card and the three rounds are run'); ok(`${songCounts.songs} songs, ${songCounts.entries} switch activities (${songCounts.cardSwitches} distinct card switches, each once; Sweet Child's open A5 only next to C5/B5/E5, the fret-5 A5 only next to G5, same pitches as A5); the ladder run for every one (${songCounts.rounds} round changes: 60/75/90 BPM, 21 changes, the BPM buttons ${songCounts.nudges} times: only later rounds, 40..140, off in the last); ${songCounts.hints} "next:" hints (EN+ES) match the diagrams, ${songCounts.setups} setup and ${songCounts.dones} done screens never show the key "A5o", the computer never picks a song, best keys are per switch and the pair keys are unchanged`); }
  if (bad === 0) ok(`${counts.reports} Coach reports, ${counts.descs} chord-card descriptions, ${counts.nrLevels} Note Runner levels ×2 and ${counts.doneScreens} arcade done screens read true; Power Chord Switch: ${counts.pwLoops} loops are three-finger shapes in the right group, ${counts.pwDraws} random draws all listed pairs (11 of 11 and both orders seen), the Again button replays the pair and Start draws, Start sticks in Change Up and not in Power Chord Switch (two columns that fit 657px), Every beat is the first speed button there, the live quiz keeps its 760px shell, ${counts.pwHints} slide hints match the diagrams (EN+ES), ${counts.pwViews} screens/rounds, ${counts.pwMemory} remembered tempo/speed pairs and ${counts.pwGates} pitch gates keep it apart from Change Up`);
}

/* ════════════════════════════════════════════════════════════════════
   1cl. POWER CHORD SWITCH TAKES ARE MEASURED (2026-11-04) — teacher.js
   micEvalTakePw, what the console's "Evaluate all recordings" does with a
   saved Power Chord Switch take (coach.js ccRecMeta): per change, is there a
   strum where the SITE listened (its own window, replayed from the strums it
   logged: ccLoop's gridOffset and match), against its verdict; per round,
   its own count-in for the mic delay.
   RUN, not read. tools/mic-sim/fake-pw-take.mjs builds 18 takes (the what-if's two are described below) whose site
   verdicts come from ccLoop's rule run on the strums the site hears (not
   planted): loud and clipping; quiet; 50 and 250 ms mic delay (overtones on
   the beep pitch); cut by the 30 s cap with one window ending 100 ms past the
   end and a different lag each round; a one-round pair with a neighbour's
   guitar; every 2 beats and Stopped; no beeps (setting right, and setting
   wrong); 110-140 BPM every beat (the bpc cap binds) and 140 BPM every bar
   (the 220 ms floor binds), with strums 25 ms inside and outside the window's
   edges and one 3 ms from it; a site that hears nothing (judged on the
   beeps); the review's three cases (wrong setting both ways, late strums only
   on the changes); a pair whose strums drift to 300 ms late (the site's
   gridOffset grows far: N2/N7 of the second review), with site-heard noise
   between the raw and the shifted window edge; a strum 0.2 beat past a
   window's edge (the off-window reach); and one saved verdict flipped (the
   replay must count it). Each goes through micEvalRow, lifted out of teacher.js
   with what it calls, and:
     · every change's category (agree / detector-missed / false-hit /
       off-window / silent-miss, or dropped past the audio's end) and every
       site verdict count must be the truth's; the row's counts must be the
       per-change ones; the replayed gridOffset of every change is the site's
       (± 2 ms; the drift take puts it past 100 ms); replaying the site's rule gives its saved verdicts
       except where the truth flipped one (replayMismatch, and the sentence
       saying so in the console and the terminal);
     · every round: tempo, changes judged and dropped, where its windows were
       put (site / beeps / setting); beeps found at the planted lag ± 10 ms,
       ideal and skew ± 10 ms (none, and no skew, where they cannot be
       measured); the take's ideal and skew the same way; onsets off the
       student's grid counted exactly;
     · totals pinned (PW_EVAL_PIN): a fixture or a category that goes missing
       fails here.
   Then the console summary (teacherMicEvalHtml) is rendered on all of them,
   on three alone (1-vs-many wording: was/were, strum is/strums are) and next
   to a Coach row whose note counts must not take in the changes, and every
   round's hover (its "should be" and how its windows were placed) is read;
   micEvalText's per-round table is parsed column by column and its legend
   read; teacherMicEvaluate itself is RUN on two takes with a stubbed page;
   tools/mic-sim/eval-takes.mjs is run on one take written to a temp folder
   and must list exactly its changes that do not agree; two crafted takes (a
   change at t = 1e300, a round at 1e9 BPM — student-written, the rules do
   not check them) run in a child process with 128 MB and must finish fast and
   say what was left out; and the limits micEvalTakePw keeps (tempo, rounds,
   beats per chord) must equal coach.js's.
   THE STRUM WHAT-IF (2026-11-04; teacher.js micEvalStrumRule / Frames / Hits,
   micEvalTakePw `whatIf`, the table under Evaluate-all, "Download results"):
   the site's own strum rule replayed over the audio at its ratios and stricter
   ones. Two more takes, with answers MEASURED on the audio (fake-pw-take.mjs
   PW_WHATIF): room noise and no strums (low bursts 1.6 / 2.0 / 2.38 / 3.0 x
   the room, all graded by the site: 11 false hits; the stricter ratios must
   remove 3 / 5 / 8 of them) and soft real strums over a loud room (15 agree
   changes; the stricter ratios must lose 0 / 5 / 10). Every candidate's counts
   (false hits, removed, agree, lost, reproduced) must be the truth's; the
   rule's numbers come from coach.js (CHK_*, COACH_LVL_*, ccLoop's own condition
   is compiled and run, coachSmooth is run as it is), the candidate list starts
   at coach.js's own ratios; on every take the what-if's false hits and agree
   changes equal the row's; the summary the console table, the terminal and the
   download share is summed again independently; the table and the terminal
   text are parsed; the download carries it and no names. A copy of coach.js
   whose strum rule has changed shape makes the what-if null, which fails here.
   micEvalTake's dropped notes (a note whose window runs past the end of the
   audio is not judged, as for a change) are run on a Coach and a Note Runner
   take cut short.
   micEvalTake (Coach / Note Runner) is otherwise not run here: its rows were proved
   byte-identical by a differential when micEvalSignal was split out of it.
   ════════════════════════════════════════════════════════════════════ */
const PW_EVAL_PIN = { takes: 18, rounds: 37, changes: 285, judged: 276, dropped: 9, agree: 188, 'detector-missed': 32, 'false-hit': 22, 'off-window': 15, 'silent-miss': 19,
  mismatch: 1, gridOffsets: 276, farGridOffsets: 41, clickRounds: 29, noClickRounds: 8, siteCentred: 33, beepCentred: 3, extra: 31, htmlChecks: 5, hovers: 37, textRounds: 37, evaluateRun: 2, evalTakesLines: 4, crafted: 2,
  whatIfTakes: 18, whatIfCandidates: 72, whatIfTruth: 8, whatIfRows: 43, dropNotes: 2 };
async function checkPwTakeEvaluator() {
  head('1cl. Power Chord Switch takes: the evaluator is run on takes whose site verdicts come from ccLoop\'s own rule');
  let bad = 0;
  const fail = m => { err('1cl: ' + m); problems++; bad++; };
  let fx, extract;
  try {
    fx = await import(pathToFileURL(join(ROOT, 'tools', 'mic-sim', 'fake-pw-take.mjs')).href);
    ({ extract } = await import(pathToFileURL(join(ROOT, 'tools', 'mic-sim', 'extract.mjs')).href));
  } catch (e) { fail(`could not load tools/mic-sim/fake-pw-take.mjs or extract.mjs (${e.message})`); return; }
  const tSrc = readFileSync(join(ROOT, 'teacher.js'), 'utf8'), aSrc = readFileSync(join(ROOT, 'app.js'), 'utf8'), cSrc = readFileSync(join(ROOT, 'coach.js'), 'utf8');
  const constOf = n => { const m = cSrc.match(new RegExp('^const ' + n + '\\s*=\\s*([^;]+);', 'm')); if (!m) throw new Error('no ' + n + ' in coach.js'); return `const ${n} = ${m[1].trim()};`; };
  // a number from a (possibly several-per-line) `const A = 1, B = 2;` of coach.js
  const numOf = n => { const m = cSrc.match(new RegExp('^const [^\\n]*?\\b' + n + '\\s*=\\s*([\\d.]+)', 'm')); if (!m) throw new Error('no ' + n + ' in coach.js'); return Number(m[1]); };
  const STRUM_NUMS = { FLOOR: 'CHK_ONSET_FLOOR', RATIO: 'CHK_ONSET_RATIO', HF_FLOOR: 'CHK_HF_FLOOR', HF_RATIO: 'CHK_HF_RATIO', REFRACT: 'COACH_ONSET_REFRACT', WIN: 'COACH_LVL_WIN', HOP: 'COACH_LVL_HOP', CATCHUP: 'COACH_CATCHUP_MAX_MS' };
  const strumDeps = (src = cSrc) => ({ consts: Object.fromEntries(Object.entries(STRUM_NUMS).map(([k, n]) => [k, numOf(n)])),
    ccLoopSrc: extract(src, 'ccLoop'), readFrameSrc: extract(src, 'coachReadFrame'), smoothSrc: extract(src, 'coachSmooth') });
  const lift = names => names.map(n => (tSrc.includes('async function ' + n + '(') ? 'async ' : '') + extract(tSrc, n)).join('\n');
  const EVAL_FNS = ['micEvalSignal', 'micEvalTake', 'micEvalTakePw', 'micEvalStrumRule', 'micEvalStrumFrames', 'micEvalStrumHits', 'micEvalMicName', 'micEvalDevice', 'micEvalRow'];
  let core;
  try {
    const esc = ['escAttr', 'escHtml'].map(n => { const m = aSrc.match(new RegExp('^const ' + n + ' = .*;$', 'm')); if (!m) throw new Error('no ' + n + ' in app.js'); return m[0]; }).join('\n');
    const consts = ['COACH_PITCH_GATE', 'COACH_MIC_GAIN', 'COACH_ATTACK_SKIP', 'COACH_EVENT_TAIL', 'COACH_ONSET_REFRACT', 'COACH_MATCH_FRAC', 'COACH_MATCH_MIN_MS', 'COACH_VOTE_TOL'].map(constOf).join('\n') + '\n' +
      ['CHK_ONSET_FLOOR', 'CHK_ONSET_RATIO', 'CHK_HF_FLOOR', 'CHK_HF_RATIO', 'COACH_LVL_WIN', 'COACH_LVL_HOP', 'COACH_CATCHUP_MAX_MS'].map(n => `const ${n} = ${numOf(n)};`).join('\n') +
      // teacherMicEvaluate reads String(ccLoop / coachReadFrame / coachSmooth): the real coach.js functions, never called here
      '\n' + ['ccLoop', 'coachReadFrame', 'coachSmooth'].map(n => extract(cSrc, n)).join('\n');
    const fns = lift(EVAL_FNS.concat(['micEvalWhatIfSummary', 'micEvalWhatIfText', 'micEvalText', 'teacherMicEvalHtml', 'teacherMicWhatIfHtml', 'teacherMicOffText', 'teacherMicEvaluate']));
    /* teacherMicEvaluate's page: ctx gives the takes, their audio and the result box. */
    core = new Function('ctx', `${esc}\n${consts}\nconst coachDetectPitch = () => -1;\n` +
      'let teacherMicEvalRows = [], teacherMicEvalNames = [], teacherView = "mic", teacherMicTakes = ctx.takes || [];\n' +
      'const document = ctx.document, ensureCoachJs = async () => {}, teacherMicChunks = ctx.chunks, micTakeDate = () => null, setTimeout = f => f();\n' +
      `${fns}\nreturn { micEvalRow, micEvalText, micEvalWhatIfSummary, evaluate: teacherMicEvaluate, html: (rows, names) => { teacherMicEvalRows = rows; teacherMicEvalNames = names; return teacherMicEvalHtml(); } };`);
    core({});
  } catch (e) { fail(`could not lift the evaluator out of teacher.js (${e.message})`); return; }
  const ev = core({});
  const deps = new Function(constOf('COACH_PITCH_GATE') + constOf('COACH_MIC_GAIN') + 'return { GATE: COACH_PITCH_GATE, GAIN: COACH_MIC_GAIN, detectPitch: () => -1 };')();
  deps.strum = strumDeps();
  const CATS = ['agree', 'detector-missed', 'false-hit', 'off-window', 'silent-miss'];
  const KEY = { agree: 'agree', 'detector-missed': 'detectorMissed', 'false-hit': 'falseHit', 'off-window': 'offWindow', 'silent-miss': 'silentMiss' };
  const tot = Object.fromEntries(Object.keys(PW_EVAL_PIN).map(k => [k, 0]));
  const rows = [], names = [], takes = [];
  const near = (a, b) => a != null && b != null && Math.abs(a - b) <= 10;
  const medHi = a => { const b = a.slice().sort((p, q) => p - q); return b[Math.floor(b.length / 2)]; };

  // 1. every take against its truth
  for (const f of fx.PW_FIXTURES) {
    let take, row;
    try { take = fx.makePwTake(f); row = ev.micEvalRow('T' + String(rows.length + 1).padStart(2, '0'), take.meta, take.pcm, deps); }
    catch (e) { fail(`${f.name}: ${e.message}`); continue; }
    tot.takes++; rows.push(row); names.push(f.name); takes.push(take);
    if (row.kind !== 'pw' || row.game !== 'Switch ' + take.meta.progression) { fail(`${f.name}: micEvalRow did not measure it as a Power Chord Switch take (kind ${row.kind}, game "${row.game}")`); continue; }
    const got = new Map(row.perNote.map(n => [n.i, n.why && n.why.cat]));
    for (const c of take.truth.changes) {
      tot.changes++;
      const g = got.has(c.i) ? got.get(c.i) : 'dropped';
      if (g === 'dropped') tot.dropped++; else if (CATS.includes(g)) tot[g]++;
      if (g !== c.cat) fail(`${f.name}: change ${c.i} (round ${c.stage + 1}${c.kind ? ', ' + c.kind + ', site ' + c.verdict : ''}) came out "${g}", truth "${c.cat}"`);
      // the site's gridOffset for this change, replayed from its events (ccLoop: a quarter of the way to each strum's beat, the matched strum's own)
      const pn = row.perNote.find(n => n.i === c.i);
      if (pn && c.goff != null){ if (Math.abs(pn.gridOffsetMs - c.goff) <= 2){ tot.gridOffsets++; if (Math.abs(c.goff) > 100) tot.farGridOffsets++; } else fail(`${f.name}: change ${c.i}'s replayed gridOffset is ${pn.gridOffsetMs} ms, the site's was ${Math.round(c.goff * 10) / 10}`); }
    }
    tot.judged += row.notes.n;
    const judged = take.truth.changes.filter(c => c.cat !== 'dropped');
    if (row.notes.n !== judged.length || row.perNote.length !== judged.length || row.notes.dropped !== take.truth.changes.length - judged.length) fail(`${f.name}: ${row.notes.n} changes judged and ${row.notes.dropped} dropped, truth ${judged.length} and ${take.truth.changes.length - judged.length}`);
    for (const cat of CATS) if (row.notes[KEY[cat]] !== row.perNote.filter(n => n.why.cat === cat).length || (row.notes.why[cat] || 0) !== row.notes[KEY[cat]]) fail(`${f.name}: the row's ${KEY[cat]} (${row.notes[KEY[cat]]}) is not its per-change count`);
    const vs = { siteRight: 'ok', siteWrong: 'off', siteMiss: 'miss' };
    for (const [k, v] of Object.entries(vs)) { const want = judged.filter(c => c.verdict === v).length; if (row.notes[k] !== want) fail(`${f.name}: ${k} ${row.notes[k]}, the site's verdicts give ${want}`); }
    if (row.notes.replayMismatch !== take.truth.mismatch || row.notes.ignored !== 0) fail(`${f.name}: replaying ccLoop's rule disagrees with ${row.notes.replayMismatch} saved verdicts (truth ${take.truth.mismatch}), ${row.notes.ignored} changes ignored`);
    tot.mismatch += row.notes.replayMismatch;
    // the strum what-if: the site's own ratios first, then the stricter ones; counts agree with the row, and with the measured truth where there is one
    {
      const wi = row.whatIf, wc = fx.pwWhatIfCandidates(), st = deps.strum.consts;
      if (fx.PW_WHATIF.fullBase !== st.RATIO || fx.PW_WHATIF.hfBase !== st.HF_RATIO) fail(`${f.name}: fake-pw-take.mjs PW_WHATIF starts at ${fx.PW_WHATIF.fullBase} / ${fx.PW_WHATIF.hfBase}, coach.js's strum ratios are ${st.RATIO} / ${st.HF_RATIO}`);
      if (!wi || !Array.isArray(wi.candidates) || wi.candidates.length !== wc.length) fail(`${f.name}: the row has no strum what-if (null when coach.js's strum rule is not the shape micEvalStrumRule reads)`);
      else {
        tot.whatIfTakes++;
        wi.candidates.forEach((c, k) => {
          tot.whatIfCandidates++;
          if (c.ratio !== wc[k].ratio || c.hfRatio !== wc[k].hfRatio) fail(`${f.name}: what-if candidate ${k + 1} is ${c.ratio} / ${c.hfRatio}, want ${wc[k].ratio} / ${wc[k].hfRatio}`);
          if (c.judged !== row.notes.n || c.falseHits !== row.notes.falseHit || c.agree !== row.notes.agree || c.falseHitsRemoved > c.falseHits || c.realLost > c.agree || c.reproduced > c.judged || c.falseHitsRemoved < 0 || c.realLost < 0)
            fail(`${f.name}: what-if candidate ${c.ratio} says ${c.judged} judged / ${c.falseHits} false hits (${c.falseHitsRemoved} removed) / ${c.agree} agree (${c.realLost} lost); the row has ${row.notes.n} / ${row.notes.falseHit} / ${row.notes.agree}`);
          const tw = take.truth.whatIf && take.truth.whatIf.candidates[k];
          if (tw) {
            tot.whatIfTruth++;
            for (const key of ['judged', 'reproduced', 'falseHits', 'falseHitsRemoved', 'agree', 'realLost']) if (c[key] !== tw[key]) fail(`${f.name}: what-if at ${c.ratio} / ${c.hfRatio}: ${key} ${c[key]}, the audio's measured truth ${tw[key]}`);
            /* Strums heard in the rounds' play phase: every planted event once (a refractory of 140 ms), and at most 2 more per take: a slow rumble can
               rise again after the refractory and fire a second time (the site's rule does the same). Without the refractory it is dozens. */
            if (c.strums < tw.strums || c.strums > tw.strums + 2) fail(`${f.name}: what-if at ${c.ratio} / ${c.hfRatio} heard ${c.strums} strums; the audio has ${tw.strums} events that fire (at most 2 more are allowed)`);
          }
        });
        if (wi.candidates[0].ratio !== st.RATIO || wi.candidates[0].hfRatio !== st.HF_RATIO) fail(`${f.name}: the first what-if candidate is not the site's own ratios (${st.RATIO} / ${st.HF_RATIO})`);
      }
    }
    if (row.room.extra !== take.truth.extra) { fail(`${f.name}: ${row.room.extra} onsets off the student's grid, truth ${take.truth.extra}`); } else tot.extra += row.room.extra;
    if (row.rounds.length !== take.truth.rounds.length) { fail(`${f.name}: ${row.rounds.length} rounds, truth ${take.truth.rounds.length}`); continue; }
    take.truth.rounds.forEach((t, k) => {
      const r = row.rounds[k];
      tot.rounds++;
      if (r.centre === 'site') tot.siteCentred++; else if (r.centre === 'beeps') tot.beepCentred++;
      if (r.stage !== t.stage || r.bpm !== t.bpm || r.n !== t.n || r.dropped !== t.dropped || r.centre !== t.centre) fail(`${f.name} round ${k + 1}: ${r.n} judged / ${r.dropped} dropped at ${r.bpm} BPM, windows by ${r.centre}; truth ${t.n} / ${t.dropped} at ${t.bpm}, by ${t.centre}`);
      if (t.clicks) {
        if (r.clickFound) tot.clickRounds++;
        const measurable = take.truth.mapKnown;
        if (!r.clickFound || !near(r.clickLagMs, t.lagMs) || (measurable ? !near(r.idealMs, t.idealMs) || !near(r.skewMs, t.skewMs) : r.idealMs != null || r.skewMs != null))
          fail(`${f.name} round ${k + 1}: beeps ${r.clickFound ? 'at ' + r.clickLagMs + ' ms, ideal ' + r.idealMs + ', skew ' + r.skewMs : 'not found'}; truth ${t.lagMs} ms, ideal ${measurable ? t.idealMs : 'unmeasurable'}, skew ${measurable ? t.skewMs : 'unmeasurable'}`);
      } else {
        if (!r.clickFound) tot.noClickRounds++;
        if (r.clickFound || r.idealMs != null || r.skewMs != null) fail(`${f.name} round ${k + 1}: found beeps (${r.clickLagMs} ms) in a take with none`);
      }
    });
    const tc = take.truth.rounds.filter(t => t.clicks);
    const wantLag = tc.length ? medHi(tc.map(t => t.lagMs)) : null, mapKnown = take.truth.mapKnown;
    const wantIdeal = wantLag != null && mapKnown ? wantLag + f.map : null, wantSkew = wantIdeal != null ? wantIdeal - f.lat : null;
    if (wantIdeal == null ? row.latency.idealMs != null || row.latency.skewMs != null : !near(row.latency.idealMs, wantIdeal) || !near(row.latency.skewMs, wantSkew))
      fail(`${f.name}: the take's mic delay should be ${wantIdeal == null ? 'unmeasured' : wantIdeal + ' ms (skew ' + wantSkew + ')'}, got ${row.latency.idealMs} (skew ${row.latency.skewMs})`);
  }
  if (!rows.length) { fail('no take was measured'); return; }
  const byName = nm => rows[names.indexOf(nm)];

  // 2. the console summary: all of them, three alone, and next to a Coach row
  const sum = (rs, k) => rs.reduce((a, r) => a + r.notes[k], 0);
  const flat = h => h.replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  const pwLine = rs => {
    const n = sum(rs, 'n'), ag = sum(rs, 'agree'), dm = sum(rs, 'detectorMissed'), fh = sum(rs, 'falseHit'), ow = sum(rs, 'offWindow'), sm = sum(rs, 'silentMiss'), dr = sum(rs, 'dropped');
    return [`Power Chord Switch: ${n} chord ${n === 1 ? 'change' : 'changes'} in ${rs.length} ${rs.length === 1 ? 'recording' : 'recordings'}${dr ? ` (${dr} more came after the recording stopped, at 30 seconds or at Stop, and ${dr === 1 ? 'was' : 'were'} not checked)` : ''}.`,
      `agree on ${ag + sm} of ${n} (${ag} strummed where the site listened, ${sm} not played)`,
      `${ow} ${ow === 1 ? 'was' : 'were'} strummed just outside the site's window`,
      `${dm} ${dm === 1 ? 'strum is' : 'strums are'} where the site listened, but the site heard no strum there`,
      `On ${fh} ${fh === 1 ? 'change' : 'changes'} the site heard a strum that is not in the recording`]
      .concat(sum(rs, 'replayMismatch') ? [`On ${sum(rs, 'replayMismatch')} ${sum(rs, 'replayMismatch') === 1 ? 'change' : 'changes'} the site's own rule, run again on the strums it heard, does not give the verdict it saved.`] : []);
  };
  const coachRow = { take: 'C1', period: '3', game: 'Coach melody', device: { os: 'Windows', chromebook: false, micLabel: 'Mic' }, frame: {},
    level: { loudDb: -20, floorDb: -60, clipPct: 0 }, latency: { settingMs: 50, clickFound: false },
    notes: { n: 16, siteRight: 13, replayPresent: 14, detectorMissed: 1, silentMiss: 1, why: { counted: 13, wrong: 1, 'no-onset': 2 }, offPitch: {}, lowH1H2Db: null, secondLook: 0 } };
  const PLACED = { site: "the site's own beat", beeps: 'the beeps', setting: 'the delay setting alone' };
  const renders = [['all', rows, names, []]].concat(['pw-pair', 'pw-fast-bar', 'pw-every2-stop'].map(nm => [nm + ' alone', [byName(nm)], [nm], []]),
    [['next to a Coach row', [coachRow].concat(rows), ['coach'].concat(names), ['The site counted 13 of 16 notes right', 'for 14 of 16', 'Why 2 notes were not counted']]]);
  for (const [what, rs, nm, extra] of renders) {
    const h = ev.html(rs, nm), text = flat(h), pw = rs.filter(r => r.kind === 'pw');
    tot.htmlChecks++;
    for (const want of pwLine(pw).concat(extra)) if (!text.includes(want)) fail(`the console summary (${what}) does not say "${want}"`);
    if (!sum(pw, 'replayMismatch') && /does not give the verdict it saved/.test(text)) fail(`the console summary (${what}) says the replayed rule disagrees with the saved verdicts`);
    if (rs.length === pw.length && /notes right|notes were not counted/.test(text)) fail(`the console summary (${what}) counts chord changes as notes`);
    const trs = (h.match(/<tr><td class="nc"/g) || []).length;
    const heardNot = (h.match(/ heard, not there/g) || []).length, wantHeardNot = pw.filter(r => r.notes.falseHit).length;
    const offBeat = (h.match(/ off the beat</g) || []).length, wantOffBeat = pw.filter(r => r.notes.offWindow).length;
    if (trs !== rs.length || heardNot !== wantHeardNot || offBeat !== wantOffBeat) fail(`the console table (${what}) has ${trs} rows (want ${rs.length}), ${heardNot} "heard, not there" (want ${wantHeardNot}), ${offBeat} "off the beat" (want ${wantOffBeat})`);
    if (what !== 'all') continue;
    // every round's hover: its own "should be" (not the lag) and how its windows were placed
    pw.forEach(r => {
      const shown = !r.latency.clickFound ? '?' : r.latency.idealMs == null ? '—' : String(r.latency.idealMs);
      const cell = (h.match(new RegExp(`<td title="([^"]*)">${r.latency.settingMs} → ${shown === '?' ? '\\?' : shown}</td>`)) || [])[1];
      if (!cell) { fail(`the console table lacks ${r.take}'s delay cell "${r.latency.settingMs} → ${shown}" with a per-round hover`); return; }
      const title = flat(cell);
      r.rounds.forEach(g => {
        const want = `Round ${g.stage + 1}: ` + (g.idealMs != null ? `should be ${g.idealMs} ms` : g.clickFound ? 'beeps found, delay not measured' : 'no beeps found (speaker muted, headphones, or strums over the count-in)') + `; windows placed by ${PLACED[g.centre]}`;
        if (title.includes(want)) tot.hovers++; else fail(`${r.take}'s delay hover does not say "${want}" ("${title}")`);
      });
    });
  }

  // 2b. the what-if summary the table, the terminal and the download share: summed again here, no names
  {
    const ws = ev.micEvalWhatIfSummary(rows), pwRows = rows.filter(r => r.kind === 'pw'), nC = pwRows[0].whatIf.candidates.length;
    if (!ws || ws.takes.length !== pwRows.length || ws.candidates.length !== nC) fail(`micEvalWhatIfSummary has ${ws ? ws.takes.length : 'no'} takes of ${pwRows.length}`);
    else {
      for (let k = 0; k < nC; k++) {
        const want = { falseHitsRemoved: 0, realLost: 0, reproduced: 0 };
        pwRows.forEach(r => { for (const key of Object.keys(want)) want[key] += r.whatIf.candidates[k][key]; });
        const got = ws.totals.perCandidate[k];
        if (Object.keys(want).some(key => got[key] !== want[key])) fail(`the what-if totals at candidate ${k + 1} are ${JSON.stringify(got)}, summed again ${JSON.stringify(want)}`); else tot.whatIfRows++;
      }
      if (ws.totals.falseHits !== sum(pwRows, 'falseHit') || ws.totals.agree !== sum(pwRows, 'agree') || ws.totals.judged !== sum(pwRows, 'n')) fail(`the what-if totals (${ws.totals.falseHits} false hits, ${ws.totals.agree} agree, ${ws.totals.judged} judged) are not the rows' (${sum(pwRows, 'falseHit')}, ${sum(pwRows, 'agree')}, ${sum(pwRows, 'n')})`); else tot.whatIfRows++;
      if (/Fake Student|"fake"|uid|name/i.test(JSON.stringify(ws).replace(/"take":"T\d\d"|"game":"[^"]*"/g, ''))) fail('the what-if summary (it goes in the download) carries a name or a uid');
      // the console table: one row per take, then the totals row; every cell is "−removed · lost N"
      const html = ev.html(rows, names), cells = [...html.matchAll(new RegExp('<tr><td class="nc wf">(T\\d\\d|<b>All \\d+</b>)</td><td>(?:<b>)?(\\d+)(?:</b>)?</td><td>(?:<b>)?(\\d+)(?:</b>)?</td>((?:<td>(?:<b>)?−\\d+ · lost \\d+(?:</b>)?</td>){' + nC + '})</tr>', 'g'))];
      if (cells.length !== pwRows.length + 1) fail(`the what-if table has ${cells.length} rows, want ${pwRows.length + 1} (one per take and the totals)`);
      cells.forEach(m => {
        const t = m[1].startsWith('<b>') ? null : ws.takes.find(x => x.take === m[1]), per = t ? t.perCandidate : ws.totals.perCandidate;
        const want = per.map(c => `−${c.falseHitsRemoved} · lost ${c.realLost}`), got = [...m[4].matchAll(/−\d+ · lost \d+/g)].map(x => x[0]);
        if (+m[2] !== (t ? t.falseHits : ws.totals.falseHits) || +m[3] !== (t ? t.agree : ws.totals.agree) || want.join('|') !== got.join('|')) fail(`the what-if table row ${m[1]} reads ${m[2]} / ${m[3]} / ${got.join(' ')}; the summary has ${want.join(' ')}`); else tot.whatIfRows++;
      });
      // the terminal text: the same numbers
      const tline = ev.micEvalText(rows).split('Strum what-if')[1] || '';
      const trows = tline.split('\n').filter(l => /^(T\d\d|all) /.test(l));
      if (trows.length !== pwRows.length + 1) fail(`the terminal what-if has ${trows.length} lines, want ${pwRows.length + 1}`);
      trows.forEach(l => {
        const c = l.trim().split(/\s+/), lab = c[0], t = lab === 'all' ? null : ws.takes.find(x => x.take === lab), per = t ? t.perCandidate : ws.totals.perCandidate;
        const got = [...l.matchAll(/-(\d+) \/ lost (\d+)/g)].map(x => `${x[1]}/${x[2]}`), want = per.map(x => `${x.falseHitsRemoved}/${x.realLost}`);
        if (got.join(' ') !== want.join(' ') || +c[1] !== (t ? t.falseHits : ws.totals.falseHits) || +c[2] !== (t ? t.agree : ws.totals.agree)) fail(`the terminal what-if line "${l.trim()}" does not match the summary (${want.join(' ')})`); else tot.whatIfRows++;
      });
      if (!/ratios \(first column\)|first column is the site's own ratios/.test(ev.micEvalText(rows))) fail("the terminal what-if lost its note saying the first column is the site's own ratios");
    }
    // "Download results" carries it (and the rows, which have no names)
    if (!/function teacherMicEvalDownload\(\)\{[\s\S]*?strumWhatIf: micEvalWhatIfSummary\(teacherMicEvalRows\)[\s\S]*?rows: teacherMicEvalRows/.test(tSrc)) fail('teacherMicEvalDownload does not put the what-if summary in the file');
  }

  // 3. the terminal table: every round, column by column, and its legend
  const txt = ev.micEvalText(rows), part = txt.split('Power Chord Switch, one line per round')[1] || '';
  const COLS = ['take', 'Switch', 'prog', 'round', 'bpm', 'chg', 'agree', 'detMiss', 'false', 'offWin', 'silent', 'drop', 'centre', 'click', 'lag', 'ideal', 'skew', 'map'];
  part.split('\n').filter(l => /^T\d\d +Switch /.test(l)).forEach(l => {
    const c = Object.fromEntries(l.trim().split(/\s+/).map((v, k) => [COLS[k], v]));
    const r = rows.find(x => x.take === c.take), take = r && takes[rows.indexOf(r)], t = take && take.truth.rounds[+c.round - 1];
    if (!t) { fail(`micEvalText's round line "${l.trim()}" names no round of ${c.take}`); return; }
    const ch = take.truth.changes.filter(x => x.stage === t.stage), cn = cat => String(ch.filter(x => x.cat === cat).length);
    const num = v => v === '-' ? null : +v;
    const ok = c.bpm === String(t.bpm) && c.chg === String(t.n) && c.drop === String(t.dropped) && c.centre === t.centre &&
      c.agree === cn('agree') && c.detMiss === cn('detector-missed') && c.false === cn('false-hit') && c.offWin === cn('off-window') && c.silent === cn('silent-miss') &&
      (t.clicks ? near(num(c.lag), t.lagMs) : c.click === 'none') && (t.clicks && take.truth.mapKnown ? near(num(c.ideal), t.idealMs) && near(num(c.skew), t.skewMs) : c.ideal === '-' && c.skew === '-');
    if (ok) tot.textRounds++; else fail(`micEvalText's line for ${c.take} round ${c.round} reads "${l.trim()}"; truth: ${t.bpm} BPM, ${t.n} judged, ${['agree', 'detector-missed', 'false-hit', 'off-window', 'silent-miss'].map(cn).join('/')}, ${t.dropped} dropped, ${t.centre}, lag ${t.clicks ? t.lagMs : 'none'}, ideal ${t.idealMs}, skew ${t.skewMs}`);
  });
  rows.filter(r => r.notes.replayMismatch).forEach(r => { const want = `${r.take}: ${r.notes.replayMismatch} ${r.notes.replayMismatch === 1 ? 'change' : 'changes'} where the site's rule, run again on its own strums, does not give its saved verdict`; if (!part.split(String.fromCharCode(10)).includes(want)) fail(`micEvalText does not say "${want}"`); });
  for (const k of ['chg', 'agree', 'detMiss', 'false', 'offWin', 'silent', 'drop', 'centre']) if (!new RegExp('^' + k + ' +\\S', 'm').test(part)) fail(`micEvalText's Power Chord Switch legend lost its "${k}" line`);

  // 4. Evaluate-all, run: two takes, their audio in two chunks each, a stubbed result box
  try {
    const box = { innerHTML: '' }, pick = ['pw-pair', 'pw-every2-stop'].map(nm => takes[names.indexOf(nm)]);
    const page = core({ takes: pick.map((t, k) => Object.assign({ id: 'fake-' + k }, t.meta)), document: { getElementById: id => id === 't-mic-eval' ? box : null },
      chunks: async d => { const t = pick[+d.id.slice(5)], b = new Uint8Array(t.pcm.buffer.slice(0)), h = (b.length >> 2) << 1; return [b.subarray(0, h), b.subarray(h)]; } });
    await page.evaluate();
    const text = flat(box.innerHTML), want = pwLine(pick.map(t => rows[takes.indexOf(t)]));
    tot.evaluateRun = (box.innerHTML.match(/<tr><td class="nc"/g) || []).length;
    if (tot.evaluateRun !== 2 || /Could not measure|not measured/.test(text) || want.some(w => !text.includes(w))) fail(`"Evaluate all recordings" run on 2 Power Chord Switch takes measured ${tot.evaluateRun} (${text.slice(0, 160)}…)`);
  } catch (e) { fail(`"Evaluate all recordings" threw (${e.message})`); }

  // 5. tools/mic-sim/eval-takes.mjs on one take, on disk: the pair, and exactly its changes that do not agree
  const tmp = mkdtempSync(join(tmpdir(), 'gc-1cl-'));
  try {
    const t = takes[names.indexOf('pw-pair')], one = byName('pw-pair');
    writeFileSync(join(tmp, 'pw-pair.wav'), fx.wavBytes(t.pcm));
    writeFileSync(join(tmp, 'pw-pair.json'), JSON.stringify(t.meta));
    const r = spawnSync(process.execPath, [join(ROOT, 'tools', 'mic-sim', 'eval-takes.mjs'), tmp], { encoding: 'utf8', timeout: 120000 });
    const lineRe = new RegExp(`^T01 .*Switch ${t.meta.progression} .* ${one.notes.siteRight}/${one.notes.n} +${one.notes.replayPresent}/${one.notes.n} `, 'm');
    const listed = (r.stdout.match(new RegExp(`^T01 +Switch ${t.meta.progression} +\\d+ +(right|wrong|miss) `, 'gm')) || []).length;
    const wantListed = one.perNote.filter(n => n.why.cat !== 'agree').length;
    tot.evalTakesLines = listed;
    if (r.status !== 0 || !/Power Chord Switch, one line per round/.test(r.stdout) || !lineRe.test(r.stdout) || listed !== wantListed)
      fail(`tools/mic-sim/eval-takes.mjs on a Power Chord Switch take (exit ${r.status}): ${listed} changes listed, want the ${wantListed} that do not agree — ${(r.stderr || '').trim().split('\n').slice(-2).join(' / ')}`);
  } finally { rmSync(tmp, { recursive: true, force: true }); }

  // 6. crafted takes cannot hang the console: a child process with 128 MB and a time limit
  const pair = takes[names.indexOf('pw-pair')].meta;
  const crafted = [['a change at t = 1e300', d => { d.expected[3].t = 1e300; }, 1], ['a round at 1e9 BPM', d => { d.expected.forEach(e => { e.bpm = 1e9; }); d.stageBpms = [1e9]; d.bpm = 1e9; }, pair.expected.length]];
  for (const [what, edit, wantIgnored] of crafted) {
    const d = JSON.parse(JSON.stringify(pair)); edit(d);
    const code = `${lift(EVAL_FNS)}\nconst d = ${JSON.stringify(d).replace(/null/g, 'null')};\n` +
      'let s = 7; const pcm = new Int16Array(24000 * 20); for (let i = 0; i < pcm.length; i++){ s = (s * 1664525 + 1013904223) >>> 0; pcm[i] = (s >>> 20) - 2048; }\n' +
      `const t0 = Date.now(); const row = micEvalRow('X', d, pcm, { GATE: 0.004, GAIN: 3, detectPitch: () => -1 });\n` +
      'console.log(JSON.stringify({ ms: Date.now() - t0, ignored: row.notes.ignored, n: row.notes.n }));';
    const r = spawnSync(process.execPath, ['--max-old-space-size=128', '-'], { input: code, encoding: 'utf8', timeout: 20000 });
    let out = null; try { out = JSON.parse((r.stdout || '').trim().split('\n').pop()); } catch {}
    if (r.status === 0 && out && out.ms < 3000 && out.ignored === wantIgnored) tot.crafted++;
    else fail(`a crafted take (${what}) ${r.error && r.error.code === 'ETIMEDOUT' ? 'ran past 20 s' : r.status !== 0 ? 'crashed (' + ((r.stderr || '').match(/(heap out of memory|RangeError[^\n]*|Error[^\n]*)/) || ['exit ' + r.status])[0] + ')' : 'took ' + (out && out.ms) + ' ms / ignored ' + (out && out.ignored) + ' changes, want under 3000 ms and ' + wantIgnored}`);
  }

  // 7. the limits micEvalTakePw keeps are coach.js's
  const lim = (jsFunctionBody(tSrc, 'micEvalTakePw') || '').match(/const BPM_MIN = (\d+), BPM_MAX = (\d+), ROUNDS = (\d+), BPCS = \[([\d, ]+)\];/);
  const cc = { min: +(cSrc.match(/^const CC_BPM_MIN = (\d+), CC_BPM_MAX = (\d+);/m) || [])[1], max: +(cSrc.match(/^const CC_BPM_MIN = (\d+), CC_BPM_MAX = (\d+);/m) || [])[2],
    rounds: +(cSrc.match(/^const CC_LADDER_ROUNDS = (\d+)/m) || [])[1], bpcs: ((cSrc.match(/^const CC_RATES = \[([\s\S]*?)\n\];/m) || [])[1] || '').match(/bpc: \d+/g) };
  const bpcs = cc.bpcs ? cc.bpcs.map(s => +s.slice(5)).sort((a, b) => a - b).join(', ') : '?';
  if (!lim || +lim[1] !== cc.min || +lim[2] !== cc.max || +lim[3] !== cc.rounds || lim[4] !== bpcs) fail(`micEvalTakePw's limits (${lim ? lim.slice(1).join(' / ') : 'not found'}) are not coach.js's CC_BPM_MIN / CC_BPM_MAX / CC_LADDER_ROUNDS / CC_RATES bpc (${cc.min} / ${cc.max} / ${cc.rounds} / ${bpcs})`);

  // 8. micEvalTake (Coach / Note Runner): a note whose window runs past the end of the audio is dropped, not judged (the rule for a change)
  {
    const tmp2 = mkdtempSync(join(tmpdir(), 'gc-1cl-note-'));
    try {
      for (const mode of ['coach', 'nr']) {
        const base = join(tmp2, mode), LAG = 140;
        const r = spawnSync(process.execPath, [join(ROOT, 'tools', 'mic-sim', 'fake-take.mjs'), base, String(LAG), '25', mode], { encoding: 'utf8', timeout: 60000 });
        if (r.status !== 0) { fail(`fake-take.mjs (${mode}) exit ${r.status}: ${(r.stderr || '').trim().slice(-120)}`); continue; }
        const wav = readFileSync(base + '.wav'), meta = JSON.parse(readFileSync(base + '.json', 'utf8'));
        const all = new Int16Array(wav.buffer.slice(wav.byteOffset + 44, wav.byteOffset + wav.length)), CUT = 8900;
        const cut = all.slice(0, Math.round(CUT / 1000 * meta.sampleRate)), half = Math.min(meta.beatMs * 0.5, 400);
        const late = e => e.t + LAG + half > CUT;
        // no note may sit within 40 ms of the cut: the lag is measured, not planted
        if (meta.expected.some(e => Math.abs(e.t + LAG + half - CUT) < 40)) { fail(`fake-take (${mode}): a note's window ends within 40 ms of the cut (too close to call)`); continue; }
        const wantDrop = meta.expected.filter(late).length, wantN = meta.expected.length - wantDrop;
        const whole = ev.micEvalRow('N0', meta, all, deps), part = ev.micEvalRow('N1', meta, cut, deps);
        const lastI = Math.max(...part.perNote.map(n => n.i));
        if (whole.notes.dropped !== 0 || whole.notes.n !== meta.expected.length) fail(`${mode}: the whole take dropped ${whole.notes.dropped} notes and judged ${whole.notes.n} of ${meta.expected.length}`);
        else if (part.notes.dropped !== wantDrop || part.notes.n !== wantN || part.perNote.length !== wantN || meta.expected[lastI] && late(meta.expected[lastI])) fail(`${mode}: cut at ${CUT} ms: ${part.notes.dropped} dropped and ${part.notes.n} judged; want ${wantDrop} and ${wantN} (the last judged note is ${lastI})`);
        else if (!(part.notes.medianSnrDb > -60)) fail(`${mode}: the cut take's median level is ${part.notes.medianSnrDb} dB: notes past the end were measured as silence`);
        else tot.dropNotes++;
      }
    } finally { rmSync(tmp2, { recursive: true, force: true }); }
  }
  const noteHtml = /\$\{sum\(r => r\.notes\.dropped\)\} more \$\{sum\(r => r\.notes\.dropped\) === 1 \? 'note' : 'notes'\} came after the recording stopped/.test(tSrc);
  if (!noteHtml) fail('the console summary no longer says how many Coach / Note Runner notes came after the recording stopped');

  for (const [k, n] of Object.entries(PW_EVAL_PIN)) if (tot[k] !== n) fail(`${tot[k]} ${k}, pinned ${n} — the check went partly blind (or the fixtures changed: re-pin PW_EVAL_PIN on purpose)`);
  if (bad === 0) ok(`${tot.takes} synthetic takes, ${tot.rounds} rounds, ${tot.changes} changes: all ${tot.judged} judged ones match the truth (${tot.agree} agree, ${tot['detector-missed']} detector-missed, ${tot['false-hit']} false-hit, ${tot['off-window']} off-window, ${tot['silent-miss']} silent-miss) and ${tot.dropped} past the end are dropped; windows on the site's own beat in ${tot.siteCentred} rounds, on the beeps in ${tot.beepCentred}; beeps found in ${tot.clickRounds} of ${tot.clickRounds} rounds that have them (lag, ideal and skew within 10 ms), none in the ${tot.noClickRounds} without; ${tot.extra} off-grid onsets counted exactly; ${tot.htmlChecks} console renders, ${tot.hovers} round hovers and ${tot.textRounds} terminal round lines read; Evaluate-all run measures ${tot.evaluateRun} of 2 takes; eval-takes.mjs lists the pair's ${tot.evalTakesLines} changes that do not agree; ${tot.gridOffsets} replayed gridOffsets within 2 ms of the site's (${tot.farGridOffsets} over 100 ms); ${tot.mismatch} flipped saved verdict caught by the replay; ${tot.crafted} crafted takes finish fast in 128 MB; the limits match coach.js; strum what-if: ${tot.whatIfTakes} takes x 4 candidates (${tot.whatIfCandidates}) with counts equal to the rows', ${tot.whatIfTruth} candidates of the 2 measured room-noise / soft-strum takes equal the audio's truth, ${tot.whatIfRows} summary / table / terminal numbers re-summed; ${tot.dropNotes} of 2 Coach / Note Runner takes cut short drop the notes past the end`);
}

/* ════════════════════════════════════════════════════════════════════
   1cg. PRACTICE MINUTES (2026-11-01) — practice-minutes.js + its config + the
   rules blocks it writes under.
   The engine is RUN, not read: tools/pm-sim.mjs loads the real config and engine
   into a sandbox with a fake clock, fake <audio>, fake network and fake Firestore
   and plays sessions (what counts, the cap, offline and unload, a refusal by the
   rules, no heartbeat, the week/streak maths against an independent ISO-week
   algorithm). The count of assertions is pinned so deleting one to get green
   fails here. The rest are source pins for things a run cannot see: the rules'
   daily cap must equal the config's (a mismatch is silent — every write over the
   rule's number is refused), the heartbeat writer and the "N playing" count query
   (removed 2026-11-04) must not come back in the engine or the config (the
   heartbeats rules block stays until it is deleted in the Firebase console, and
   until then must be absent or exactly the shipped block), the minutes block must stay owner-only with
   no delete, every script tag is in place in order, every pm.* string the engine
   asks for exists in English AND Spanish (and every one is used), and the three
   hooks into app.js / index.html / journey.js are still there (the strip is ONE hidden <button id="pm-header"> in the main top bar,
   shown by PM.syncHeader() on every #user-area paint path, and caSyncTopbar() must not draw it a second time).
   The browser half (strip, recap, toast, My progress, 1366×657, both languages,
   a real <audio>) is tools/pm-e2e.mjs — it needs Chrome, so it is run by hand.
   ════════════════════════════════════════════════════════════════════ */
const PM_SIM_PIN = 273;
function checkPracticeMinutes(i18nTable) {
  head('1cg. Practice minutes: the engine is run; the rules cap, no heartbeat, wiring and strings are pinned');
  let bad = 0;
  const fail = m => { err(m); problems++; bad++; };
  const read = f => { try { return readFileSync(join(ROOT, f), 'utf8'); } catch { return null; } };
  const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  // 1. run the engine
  const r = spawnSync(process.execPath, [join(ROOT, 'tools', 'pm-sim.mjs'), '--quiet'], { encoding: 'utf8', timeout: 180000 });
  const lines = (r.stdout || '').trim().split('\n');
  const m = /pm-sim: (\d+) passed, (\d+) failed/.exec(lines[lines.length - 1] || '') || /pm-sim: (\d+) passed, (\d+) failed/.exec((r.stdout || ''));
  if (r.status !== 0 || !m) {
    fail('tools/pm-sim.mjs failed' + (r.error ? ': ' + r.error.message : ''));
    for (const l of lines.slice(-6)) console.log(`${C.dim}      ${l}${C.reset}`);
    return;
  }
  if (+m[1] !== PM_SIM_PIN || +m[2] !== 0) fail(`pm-sim ran ${m[1]} assertions (${m[2]} failed); pinned at ${PM_SIM_PIN} — if you changed the simulation on purpose, re-pin PM_SIM_PIN (never lower it to hide a deleted scenario)`);

  // 2. config shape + the rules' cap
  const cfgSrc = read('practice-minutes-config.js'), rules = read('firestore.rules');
  let cfg = null;
  try { const sb = {}; vm.createContext(sb); vm.runInContext(cfgSrc + '\n;globalThis.__C = PRACTICE_MINUTES_CONFIG;', sb); cfg = sb.__C; } catch (e) { fail('practice-minutes-config.js does not run: ' + e.message); }
  if (cfg) {
    const num = (k, lo, hi) => { if (typeof cfg[k] !== 'number' || !isFinite(cfg[k]) || cfg[k] < lo || cfg[k] > hi) fail(`config.${k} must be a number from ${lo} to ${hi} (is ${JSON.stringify(cfg[k])})`); };
    if (typeof cfg.uiOn !== 'boolean') fail('config.uiOn must be true or false');
    num('weeklyGoalMinutes', 1, 600); num('dailyCapMinutes', 1, 240);
    /* A goal above 7 days of the daily cap can never be reached: every week would say "You can't reach the goal this week" (2026-11-02 review). */
    if (typeof cfg.weeklyGoalMinutes === 'number' && typeof cfg.dailyCapMinutes === 'number' && cfg.weeklyGoalMinutes > 7 * cfg.dailyCapMinutes) fail(`config.weeklyGoalMinutes (${cfg.weeklyGoalMinutes}) is more than 7 x dailyCapMinutes (${cfg.dailyCapMinutes}): no student could ever reach the goal`);
    const dateRe = /^\d{4}-\d{2}-\d{2}$/;
    const monday = d => dateRe.test(d) && new Date(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10), 12).getDay() === 1;
    if (!Array.isArray(cfg.skipWeeks)) fail('config.skipWeeks must be a list of Monday dates');
    else {
      cfg.skipWeeks.forEach(d => { if (!monday(d)) fail(`config.skipWeeks entry ${JSON.stringify(d)} must be a Monday, 'YYYY-MM-DD'`); });
      if (new Set(cfg.skipWeeks).size !== cfg.skipWeeks.length) fail('config.skipWeeks has a repeated date');
    }
    /* Top 5 (2026-11-04): the minimum is a number of minutes from 0 to the weekly goal (a minimum above the goal would rank fewer students than the goal moment rewards). */
    if (typeof cfg.top5MinMinutes !== 'number' || !isFinite(cfg.top5MinMinutes) || cfg.top5MinMinutes < 0 || cfg.top5MinMinutes > cfg.weeklyGoalMinutes) fail(`config.top5MinMinutes must be a number from 0 to weeklyGoalMinutes (is ${JSON.stringify(cfg.top5MinMinutes)})`);
    if (cfg.semester2Start !== '' && !monday(cfg.semester2Start)) fail("config.semester2Start must be '' or a Monday, 'YYYY-MM-DD'");
    if (cfg.streakStartWeek && !/^\d{4}-W\d{2}$/.test(cfg.streakStartWeek)) fail("config.streakStartWeek must be '' or an ISO week like '2026-W48'");
    /* The goal is flat: these settings were removed on purpose and must not creep back into the config or the engine. */
    for (const k of ['meetingDays', 'defaultMeetingDays', 'noSchool', 'shortWeeks', 'semesters']) {
      if (k in cfg) fail(`practice-minutes-config.js has '${k}': the goal is flat, there are no meeting days, no-school dates or proration (work order 2026-11-01)`);
      if (new RegExp('\\b' + k + '\\b').test(strip(read('practice-minutes.js') || ''))) fail(`practice-minutes.js still reads '${k}'`);
    }
    if (/\b(calc\.meetings|normalMeetings|calc\.days)\b/.test(strip(read('practice-minutes.js') || ''))) fail('practice-minutes.js still has meeting-day maths (calc.meetings / normalMeetings / calc.days)');
    /* The heartbeat behind "N playing" was removed 2026-11-04 (nothing read it), with its pm:p:<uid> period cache. The engine
       reads PM_HOST.period() again since the Top 5 (2026-11-04, ranked by class period), so 'period' itself is no longer a
       heartbeat sign and left this list; the heartbeat words and the pm:p: cache stay banned. Comments are stripped, end-of-line
       ones too, so history notes may name it; the https:// URLs survive. */
    if ('liveMinCount' in cfg) fail("practice-minutes-config.js has 'liveMinCount': \"N playing\" and its heartbeat were removed 2026-11-04");
    const engCode = strip(read('practice-minutes.js') || '').replace(/([;,{}()\]])[ \t]+\/\/.*$/gm, '$1');
    const hbHit = /\b(?:heartbeats?|runAggregationQuery|pollLive|liveMinCount|pmSid|HEARTBEAT_MS)\b|pm:p:/i.exec(engCode);
    if (hbHit) fail(`practice-minutes.js has '${hbHit[0]}': the heartbeat writer and the "N playing" count query were removed 2026-11-04 and must not come back`);
    const cap = rules && /function dailyCapSeconds\(\)\s*\{\s*return\s+(\d+);\s*\}/.exec(rules);
    if (!cap) fail('firestore.rules: dailyCapSeconds() not found — the cap check cannot run (renamed? update this check with it)');
    else if (+cap[1] !== cfg.dailyCapMinutes * 60) fail(`firestore.rules dailyCapSeconds() is ${cap[1]} but practice-minutes-config.js dailyCapMinutes × 60 is ${cfg.dailyCapMinutes * 60}: every day above the smaller number is refused by the database. Change both, and re-publish the rules`);
  }

  // 3. the rules blocks
  if (rules) {
    // The block's own brace is the last one on its match line (the path has {params} before it).
    const block = name => { const i = rules.indexOf(`match /${name}`); if (i < 0) return null; let d = 0, j = rules.lastIndexOf('{', rules.indexOf('\n', i)); for (let k = j; k < rules.length; k++) { if (rules[k] === '{') d++; else if (rules[k] === '}') { d--; if (!d) return strip(rules.slice(i, k + 1)); } } return null; };
    /* The heartbeats block outlives its writer until Jonathan deletes it in the console (step 2). Until then it is frozen: ABSENT
       (step 2 done) or exactly the shipped block, whitespace aside. A loosened rule on a collection nothing uses would go unseen. */
    const HB_SHIPPED = "match /heartbeats/{sessionId} { allow read: if isSignedIn(); allow create, update: if isSignedIn() && sessionId.matches('^[0-9a-f]{24}$') && request.resource.data.keys().hasOnly(['period', 'lastSeen']) && request.resource.data.keys().hasAll(['period', 'lastSeen']) && request.resource.data.period in ['4', '7', 'CAS'] && request.resource.data.lastSeen == request.time; }";
    const hbMatches = (strip(rules).match(/match\s+\/heartbeats\b/g) || []).length;
    const hb = block('heartbeats/{sessionId}');
    if (hbMatches > 1 || (hbMatches === 1 && (!hb || hb.replace(/\s+/g, ' ').trim() !== HB_SHIPPED))) fail('firestore.rules: the heartbeats block may only be deleted whole (step 2 of the heartbeat removal), never edited or added to — nothing writes heartbeats since 2026-11-04');
    const mins = block('minutes/{userId}/{document=**}'), days = block('minutes/{userId}/days/{day}'), weeks = block('minutes/{userId}/weeks/{week}');
    if (!mins || !days || !weeks) fail('firestore.rules: the three minutes/{userId} blocks (tree read, days, weeks) must all be present');
    else {
      for (const [n, b] of [['tree', mins], ['days', days], ['weeks', weeks]]) {
        if (/isTeacher/.test(b)) fail(`minutes ${n} rule lets the teacher in — the spec says only that signed-in uid`);
        if (!/pmOwner\(userId\)/.test(b)) fail(`minutes ${n} rule is not owner-only (pmOwner(userId))`);
        if (/\bdelete\b|allow\s+write/.test(b)) fail(`minutes ${n} rule allows delete or blanket write`);
      }
      if (!/hasOnly\(\['seconds'\]\)/.test(days) || !/<= dailyCapSeconds\(\)/.test(days)) fail("minutes days rule must be { seconds } only and capped at dailyCapSeconds()");
      if (!/hasOnly\(\['seconds', 'goalSeconds', 'hit'\]\)/.test(weeks) || !/hit is bool/.test(weeks)) fail("minutes weeks rule must be { seconds, goalSeconds, hit } only, hit a bool");
    }
    /* The class rank (2026-11-04): ONE number per student, readable by every signed-in student, writable by its owner only. */
    /* The block is pinned WHOLE (whitespace and comments aside), like the heartbeats block: pattern checks alone let an extra
       `allow update: if isSignedIn();`, a `|| true`, or a second `match /minutesBoard/{u}` through (2026-11-04 review). It is
       the block Jonathan published to the Firebase console, so a change here is a change to what must be re-pasted. */
    const MB_SHIPPED = "match /minutesBoard/{userId} { allow read: if isSignedIn(); allow create, update: if pmOwner(userId) && request.resource.data.keys().hasOnly(['seconds']) && request.resource.data.seconds is number && request.resource.data.seconds >= 0 && request.resource.data.seconds <= 400 * dailyCapSeconds(); }";
    const mbMatches = (strip(rules).match(/match\s+\/minutesBoard\b/g) || []).length;
    const board = block('minutesBoard/{userId}');
    if (mbMatches !== 1) fail(`firestore.rules has ${mbMatches} match blocks for /minutesBoard (exactly one is allowed)`);
    else if (board && board.replace(/\s+/g, ' ').trim() !== MB_SHIPPED) fail('firestore.rules: the minutesBoard block differs from the one shipped and published. If this is on purpose, change MB_SHIPPED here with it and tell Jonathan to paste the rules again');
    if (!board) fail('firestore.rules: the minutesBoard/{userId} block (the class rank) is missing — practice-minutes.js reads and writes it');
    else {
      if (!/allow read:\s*if isSignedIn\(\)/.test(board)) fail('minutesBoard rule: read must be `if isSignedIn()` (every student reads the class to work out a rank)');
      if (/isTeacher|\bdelete\b|allow\s+write/.test(board)) fail('minutesBoard rule allows the teacher, delete or a blanket write');
      if (!/allow create, update:\s*if pmOwner\(userId\)/.test(board)) fail('minutesBoard rule: create/update must be owner-only (pmOwner(userId))');
      if (!/hasOnly\(\['seconds'\]\)/.test(board) || !/seconds is number/.test(board) || !/seconds >= 0/.test(board) || !/seconds <= 400 \* dailyCapSeconds\(\)/.test(board)) fail("minutesBoard rule must be { seconds } only, a number from 0 to 400 * dailyCapSeconds()");
    }
    /* The Top 5 board (2026-11-04, redesigned the same day: Jonathan wants NO per-period minutes tied to a name, readable by anyone): two blocks,
       pinned WHOLE like minutesBoard. The board's docs are keyed by a private random tag, never a uid; the tag lives only in the student's own
       owner-only doc minutes/{uid}/meta/board, and a write to the board must be to the doc whose id is the writer's own tag. A change to either
       block is a change Jonathan must re-paste. */
    const TAG_SHIPPED = "match /minutes/{userId}/meta/board { allow create: if pmOwner(userId) && request.resource.data.keys().hasOnly(['id']) && request.resource.data.id is string && request.resource.data.id.matches('^[0-9a-f]{32}$'); }";
    const WB_SHIPPED = "match /weekBoard/{tag} { allow read: if isSignedIn(); allow create, update: if isSignedIn() && tag == get(/databases/$(database)/documents/minutes/$(request.auth.uid)/meta/board).data.id && request.resource.data.keys().hasOnly(['week', 'period', 'seconds']) && request.resource.data.keys().hasAll(['week', 'period', 'seconds']) && request.resource.data.week is string && request.resource.data.week.matches('^[0-9]{4}-W[0-9]{2}$') && request.resource.data.period in ['4', '7', 'CAS'] && request.resource.data.seconds is number && request.resource.data.seconds >= 0 && request.resource.data.seconds <= 7 * dailyCapSeconds(); }";
    /* The rest of the minutes tree is pinned too (2026-11-04 review): a tree block of `allow read, update: if pmOwner(userId)` would let a
       student change their own tag and skip the day cap; a second `match /minutes/{u}/meta/{doc}` or a catch-all `match /{path=**}/meta/{doc}`
       would overlap the tag block. Exactly four `match /minutes/` blocks (tree read, days, weeks, the tag), the tree block whole, and no match
       that starts with a wildcard (the rules header already says "do not add a catch-all"). */
    const TREE_SHIPPED = "match /minutes/{userId}/{document=**} { allow read: if pmOwner(userId); }";
    const treeBlock = block('minutes/{userId}/{document=**}');
    if (!treeBlock || treeBlock.replace(/\s+/g, ' ').trim() !== TREE_SHIPPED) fail('firestore.rules: the minutes/{userId}/{document=**} block must be exactly `allow read: if pmOwner(userId);` (read only, owner only) — a wider one lets a student change their tag or skip the day cap');
    const minutesMatches = (strip(rules).match(/match\s+\/minutes\//g) || []).length;
    if (minutesMatches !== 4) fail(`firestore.rules has ${minutesMatches} match blocks under /minutes/ (exactly 4: the tree read, days, weeks and the Top 5 tag); update this count and TAG_SHIPPED with any new one`);
    const wildcardFirst = (strip(rules).match(/match\s+\/\{[^}]*\}/g) || []);
    if (wildcardFirst.length) fail(`firestore.rules has a match that starts with a wildcard (${wildcardFirst[0]}): a catch-all overlaps every block above it`);
    const tagMatches = (strip(rules).match(/match\s+\/minutes\/\{userId\}\/meta\b/g) || []).length;
    const tagBlock = block('minutes/{userId}/meta/board');
    if (tagMatches !== 1 || !tagBlock) fail(`firestore.rules has ${tagMatches} match blocks for minutes/{userId}/meta (exactly one is allowed: the Top 5 name tag, create-only)`);
    else if (tagBlock.replace(/\s+/g, ' ').trim() !== TAG_SHIPPED) fail('firestore.rules: the minutes/{userId}/meta/board block differs from the one shipped. If this is on purpose, change TAG_SHIPPED here with it and tell Jonathan to paste the rules again');
    const wbMatches = (strip(rules).match(/match\s+\/weekBoard\b/g) || []).length;
    const wboard = block('weekBoard/{tag}');
    if (wbMatches !== 1 || !wboard) fail(`firestore.rules has ${wbMatches} match blocks for /weekBoard (exactly one is allowed; practice-minutes.js reads and writes it for the Top 5)`);
    else if (wboard.replace(/\s+/g, ' ').trim() !== WB_SHIPPED) fail('firestore.rules: the weekBoard block differs from the one shipped. If this is on purpose, change WB_SHIPPED here with it and tell Jonathan to paste the rules again');
    /* Only for the change that INTRODUCES the blocks: while HEAD's rules do not
       have them yet, everything above them must be byte-for-byte HEAD's (the
       order was "new match blocks only"). Once they are committed this stands
       down, so later edits to older rules are judged on their own. */
    const git = spawnSync('git', ['show', 'HEAD:firestore.rules'], { cwd: ROOT, encoding: 'utf8' });
    if (git.status === 0 && git.stdout && !git.stdout.includes('PRACTICE MINUTES')) {
      const base = git.stdout.slice(0, git.stdout.lastIndexOf('  }\n}'));
      if (!rules.startsWith(base.trimEnd())) fail('firestore.rules: text above the practice-minutes blocks differs from HEAD — the order was NEW match blocks only (if an older rule was changed on purpose, that is a different change: say so)');
    }
  }

  // 4. wiring
  const idx = read('index.html') || '';
  const a = idx.indexOf('<script defer src="app.js">'), b = idx.indexOf('<script defer src="practice-minutes-config.js">'), c = idx.indexOf('<script defer src="practice-minutes.js">');
  if (!(a >= 0 && b > a && c > b)) fail('index.html must load app.js, then practice-minutes-config.js, then practice-minutes.js (the engine picks up window.PM_HOST from app.js and the config at load)');
  if (!/id="pm-progress"/.test(idx)) fail('index.html lost <div id="pm-progress"> (My progress panel host)');
  let tabs = 0;
  for (const f of readdirSync(join(ROOT, 'tabs')).filter(x => x.endsWith('.html'))) {
    const t = read('tabs/' + f), j = t.indexOf('<script src="journey.js">'), k = t.indexOf('<script src="../practice-minutes-config.js">'), e = t.indexOf('<script src="../practice-minutes.js">');
    tabs++;
    if (!(j >= 0 && k > j && e > k)) fail(`tabs/${f} must load journey.js, then ../practice-minutes-config.js, then ../practice-minutes.js (Song Journey playback is counted)`);
  }
  /* CRLF to LF first: a Windows checkout (core.autocrlf) writes app.js with CRLF, and the function-body patterns below end on a bare newline. */
  const app = strip((read('app.js') || '').replace(/\r\n/g, '\n')), jr = strip((read('tabs/journey.js') || '').replace(/\r\n/g, '\n')), eng = read('practice-minutes.js') || '';
  if (!/window\.PM_HOST\s*=\s*\{[\s\S]{0,400}?ui:\s*true/.test(app)) fail('app.js: window.PM_HOST (ui:true) is missing');
  if (!/window\.PM_HOST\s*=\s*\{[\s\S]{0,200}?ui:\s*false/.test(jr)) fail('tabs/journey.js: window.PM_HOST (ui:false) is missing — Song Journey playback would not count');
  /* The strip lives in the MAIN top bar only (2026-11-03): a hidden <button> in index.html's header, filled by
     PM.syncHeader() wherever app.js paints #user-area. It must never also be drawn in a practice card's bar. */
  const sync = /function caSyncTopbar\(\)\{[\s\S]*?\n\}\n/.exec(app);
  if (!sync) fail('app.js: caSyncTopbar() not found');
  else if (/stripHtml|onCardOpen|pm-strip/.test(sync[0])) fail('app.js caSyncTopbar(): must not draw the practice-minutes strip (PM.stripHtml / PM.onCardOpen / pm-strip) — it lives in the main top bar only, so it can never show twice');
  const hdrM = /<header class="header">[\s\S]*?<\/header>/.exec(idx);
  const hdrBtn = hdrM && /<button\b[^>]*\bid="pm-header"[^>]*>/.exec(hdrM[0]);
  if (!hdrBtn) fail('index.html: <button id="pm-header"> is missing from <header class="header"> (the practice-minutes strip)');
  else {
    if (!/\bclass="(?:[^"]*\s)?pm-strip(?:\s[^"]*)?"/.test(hdrBtn[0])) fail('index.html #pm-header must carry class pm-strip (refreshStrip() rewrites every .pm-strip)');
    if (!/\bhidden\b/.test(hdrBtn[0].replace(/"[^"]*"/g, '""'))) fail('index.html #pm-header must be hidden by default (PM.syncHeader() shows it for a signed-in student only)');
    if (!/\bonclick="toggleMyProgress\(\)"/.test(hdrBtn[0])) fail('index.html #pm-header must open My progress with onclick="toggleMyProgress()"');
    if (!/data-i18n-attr="title:pm\.openProgress"/.test(hdrBtn[0])) fail('index.html #pm-header needs its tooltip: data-i18n-attr="title:pm.openProgress"');
  }
  if (!/function toggleMyProgress\(\)\{/.test(app)) fail('app.js: toggleMyProgress() is missing (the header strip calls it)');
  /* Every place that paints #user-area must tell the strip. showApp (the signed-in app) shows it; the sign-in wall, signed out and the paused
     screen hide it (the teacher console goes through the first of them, and PM_HOST.user() is null there). */
  const paints = [...app.matchAll(/getElementById\('user-area'\)\.innerHTML\s*=[^\n]*\n([^\n]*\n)?/g)];
  if (paints.length !== 4) fail(`app.js paints #user-area in ${paints.length} places; 1cg expects 4 (sign-in, signed out, paused, showApp) — each must call PM.syncHeader(), then update this count`);
  const shows = paints.filter(m => /PM\.syncHeader\(true\)/.test(m[0])).length, hides = paints.filter(m => /PM\.syncHeader\(false\)/.test(m[0])).length;
  if (shows !== 1 || hides !== 3) fail(`app.js: after each #user-area paint PM.syncHeader() must follow — showApp true (1), the other three false (3); found ${shows} true, ${hides} false`);
  if (!/function showApp\(user\)\{[\s\S]*?PM\.syncHeader\(true\)/.test(app)) fail('app.js showApp(): PM.syncHeader(true) is missing');
  const tpaints = [...strip((read('teacher.js') || '').replace(/\r\n/g, '\n')).matchAll(/getElementById\('user-area'\)\.innerHTML\s*=[^\n]*\n([^\n]*\n)?/g)];
  if (tpaints.length !== 2 || tpaints.some(m => !/PM\.syncHeader\(false\)/.test(m[0]))) fail(`teacher.js paints #user-area in ${tpaints.length} places (expected 2); each must be followed by PM.syncHeader(false) — the console must never show the strip`);
  if (!/var HOST_STRIPS = \['pm-header', 'pm-games'\]/.test(eng) || !/function anchorStrip\(\)\{[\s\S]*?hostStrips\(\)[\s\S]*?elementFromPoint[\s\S]*?h\.contains\(hit\)\) return h;/.test(eng) || /page-topbar|ca-screen/.test(strip(eng))) fail('practice-minutes.js: the toast and recap must anchor to #pm-header or #pm-games, whichever is shown and not covered (not a practice card\'s bar)');
  if (/pm-live|pm-dot|pm\.playing/.test(strip(eng))) fail('practice-minutes.js: "N playing" (.pm-live / pm.playing) was dropped 2026-11-04 and must not come back in the strip');
  const gamesM = /<div class="games-screen" id="games-screen"[\s\S]*?<div class="games-stage">/.exec(idx);
  const gBtn = gamesM && /<button\b[^>]*\bid="pm-games"[^>]*>/.exec(gamesM[0]);
  if (!gBtn) fail('index.html: <button id="pm-games"> is missing from the Games screen\'s bar (the header strip is covered there)');
  else {
    if (!/\bclass="(?:[^"]*\s)?pm-strip(?:\s[^"]*)?"/.test(gBtn[0])) fail('index.html #pm-games must carry class pm-strip');
    if (!/\bhidden\b/.test(gBtn[0].replace(/"[^"]*"/g, '""'))) fail('index.html #pm-games must be hidden by default');
    if (!/\bonclick="toggleMyProgress\(\)"/.test(gBtn[0]) || !/data-i18n-attr="title:pm\.openProgress"/.test(gBtn[0])) fail('index.html #pm-games must open My progress (toggleMyProgress) and carry the tooltip title:pm.openProgress');
  }
  if (!/syncHeader:\s*syncHeader/.test(eng) || /onCardOpen/.test(strip(eng))) fail('practice-minutes.js: PM.syncHeader must be public and PM.onCardOpen gone');
  const mp = /function renderMyProgress\(\)\{[\s\S]*?\n\}\n/.exec(app);
  if (!mp || !/PM\.renderProgress\(document\.getElementById\('pm-progress'\)\)/.test(mp[0])) fail('app.js renderMyProgress(): PM.renderProgress(#pm-progress) is missing');
  /* Since 2026-11-03 all site work counts (no backing-track filter); the 2-minute window is pinned by pm-sim section 12. */
  if (!/HTMLMediaElement\.prototype\.play\s*=/.test(eng)) fail('practice-minutes.js: the play() observer is missing');
  if (/\.pause\(|\.play\(\)\.|\.loop\s*=|\.src\s*=|currentTime\s*=/.test(strip(eng).replace(/origPlay\.apply\(this, arguments\)/g, ''))) fail('practice-minutes.js must only WATCH playback (found a pause/play/loop/src/currentTime write)');

  // 5. strings
  if (!i18nTable) fail('i18n table did not load — pm.* strings not checked');
  else {
    const K = new Set(Object.keys(i18nTable).filter(k => k.startsWith('pm.')));
    const used = new Set(); let litCount = 0;
    for (const mm of strip(eng).matchAll(/'(pm\.[A-Za-z0-9.]+)'/g)) { litCount++; used.add(mm[1]); }
    /* A key the engine never names but index.html wires by data-i18n-attr (the header strip's tooltip) is used too. */
    for (const mm of idx.matchAll(/data-i18n-attr="([^"]*)"/g)) for (const pair of mm[1].split(';')) { const key = (pair.split(':')[1] || '').trim(); if (key.startsWith('pm.')) { litCount++; used.add(key); } }
    for (const u of used) if (!(K.has(u) || (K.has(u + '.one') && K.has(u + '.many')))) fail(`practice-minutes.js asks for i18n key '${u}' that i18n.js does not have (or has only one of .one/.many)`);
    for (const k of K) { const base = k.replace(/\.(one|many)$/, ''); if (!used.has(k) && !used.has(base)) fail(`i18n.js has '${k}' that practice-minutes.js never uses (dead string)`); }
    for (const k of K) { const e = i18nTable[k]; if (!e || !e.en || !e.es) fail(`i18n key '${k}' needs both en and es`); }
    if (!bad) console.log(`${C.dim}      ${K.size} pm.* strings, ${litCount} references, ${tabs} Journey pages${C.reset}`);
  }
  if (!bad) ok(`engine run: ${m[1]} simulation assertions pass (pinned); rules cap = config cap (${cfg ? cfg.dailyCapMinutes * 60 : '?'} s); no heartbeat or "N playing" query in the engine or config, the heartbeats rules block ${/match\s+\/heartbeats\b/.test(strip(rules || '')) ? 'unchanged' : 'gone'}; minutes rules owner-only, no delete; older rules untouched; hooks, script order and strings in place`);
}

(async function main() {
  if (LIVE_ONLY) {
    console.log(`${C.bold}Guitar Class — post-push live check${C.reset}`);
    const status = await liveCheck();
    console.log('');
    if (status === 'ok') { ok('deploy confirmed.'); return; }
    err(status === 'unreachable'
      ? 'could NOT confirm the deploy (live site unreachable) — retry when online.'
      : 'live site does not match — see above.');
    process.exit(1);
  }
  console.log(`${C.bold}Guitar Class — pre-push checks${C.reset}${CHECK_ONLY ? `  ${C.dim}(check-only)${C.reset}` : ''}`);
  syntaxCheck();
  const { sets: rcSets, ctx: rcCtx } = renderCheck() || {};
  validateModules();
  validateClassActivities();
  const i18nTable = checkI18nParity();
  checkMissingI18nKeys(i18nTable);
  checkDuplicateGlobals();
  checkLazyHandlers();
  checkWatchRanges();
  checkNumberedStrings();
  checkBlockedTabSites();
  checkNarrativeLeadIns();
  checkSlangPhrasing();
  checkTeacherSpeak(rcSets, rcCtx ? vm.runInContext('typeof journeySongsFor === "function" ? journeySongsFor : null', rcCtx) : null, rcCtx ? readTakeToSongSwitch(rcCtx) : null);
  checkJourneyLickLabels();
  checkRetiredStationWording();
  checkStationNames();
  checkGoneUiPointers();
  checkTabNoScroll();
  checkContrast();
  checkJourneyThemeDrift();
  checkFabToolsThemeDrift();
  checkJourneyPopupMarkup();
  checkJourneyTabCards();
  checkTabAsciiAlignment();
  checkTabAsciiEnglish();
  checkJourneyLayers();
  checkModuleJourneyLayers(rcSets, rcCtx);
  checkSkillJourneyLinks(rcSets, rcCtx);
  checkGateSafeNav();
  checkVisibleHelperUsage();
  checkFigureDimensions();
  checkOrphanAssets();
  checkVisibilityParity();
  checkChordBlitzRanks();
  checkConfigWriteGuard();
  checkBoardModuleColours();
  checkBackingSnippets();
  checkActivitySize();
  checkBareWatchSteps();
  checkHappyBirthdayRhythm();
  checkShortResponseBudget();
  checkChallengeGotItBudget();
  checkDaily5Switch();
  checkUnbalancedInlineP();
  checkStrumLineGaps();
  checkBeatsClaimMatchesTab();
  checkCureChorusOrder();
  checkJourneyButtonLastStep();
  checkFourStepsAndPaging();
  checkCaButtonNamesAndPaper();
  checkEnglishTermsInSpanish(i18nTable);
  checkJourneyGuitarToggle();
  checkPracticeCards(rcCtx);
  checkSheetCards();
  checkChordGridCards(rcCtx);
  checkRecordingVersions(rcCtx);
  checkNoteCallPower(rcCtx);
  await checkRosterSkipsTrainerStub();
  await checkSongPopularity(rcCtx);
  checkPowerChordPopups(rcSets, rcCtx);
  checkPendingFileSwitch(rcCtx);
  checkCardCaptionWords();
  checkJourneyRetired();
  checkSongLibrary();
  checkRepCountParity(rcSets, rcCtx);
  checkJourneySlowBpmLabels();
  checkGuitarNotes();
  checkPeekSavesNothing();
  checkLoadFailedMaps();
  await checkJourneyReadySave();
  checkSiteMadeClick();
  checkLiveQuizTimerRepaint();
  checkCoachVerdicts();
  await checkPwTakeEvaluator();
  checkPracticeMinutes(i18nTable);
  await checkBackingLoudness();
  if (!SKIP_LINKS) await checkLinks();
  else warn('skipping link check (--skip-links)');
  bumpServiceWorker();

  console.log('');
  if (problems > 0) {
    err(`${problems} problem${problems > 1 ? 's' : ''} found${warnings ? `, ${warnings} warning${warnings > 1 ? 's' : ''}` : ''} — do not push until fixed.`);
    process.exit(1);
  }
  if (warnings > 0) warn(`${warnings} warning${warnings > 1 ? 's' : ''} (non-blocking).`);
  ok('all checks passed.');
})();
