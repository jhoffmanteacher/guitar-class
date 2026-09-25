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

import { readFileSync, writeFileSync, readdirSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
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
  'index.html', '404.html', 'mood-chart.html', 'styles.css', 'i18n.js', 'guitar-diagrams.js', 'class-activities.js', 'app.js', 'fab-tools.js', 'tuner.js', 'coach.js', 'teacher.js', 'live-quiz.js', 'config-main.js',
  'firebase-config.js', 'manifest.json', 'icon.svg',
  ...MODULE_FILES,
  ...TAB_PAGES,
];

/* Backing-track audio isn't in sw.js's ASSETS precache list (they're large —
   precaching them at install would bloat the offline install), but the SW's
   fetch handler still runtime-caches them cache-first same as everything else
   same-origin. That means swapping a track's bytes at the same filename (e.g.
   re-exporting a mix) only reaches returning students once CACHE_VERSION
   changes — same reasoning as TAB_PAGES above. Fingerprint them, but keep them
   out of SHELL_FILES so checkSwAssets doesn't also demand they be precached. */
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
   ════════════════════════════════════════════════════════════════════ */
function checkHiddenStepComments() {
  head('1ae. Hidden steps carry a // ca-<n> comment');
  let bad = 0, hiddenCount = 0;
  for (const file of MODULE_FILES) {
    let lines;
    try { lines = readFileSync(join(ROOT, file), 'utf8').split('\n'); } catch { continue; }
    lines.forEach((line, li) => {
      if (!/^\s*hidden:\s*true\s*,?\s*$/.test(line)) return;
      hiddenCount++;
      const prev = (lines[li - 1] || '').trim();
      if (!/^\/\/.*\bca-\d+\b/.test(prev)) {
        err(`${file}:${li + 1}: 'hidden: true' with no "// ... ca-<n>" comment on the line above it — say which class activity now teaches this step`);
        problems++; bad++;
      }
    });
  }
  if (hiddenCount === 0) { warn('no hidden:true steps found yet — 1ae has nothing to check'); warnings++; return; }
  if (bad === 0) ok(`${hiddenCount} hidden steps all carry a // ca-<n> comment above them`);
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
   1ap. FROZEN GRADED MCs — a GRADED multiple-choice (a `response:
   { type:'mc' }` on a lesson step) persists the chosen choice's TEXT,
   not its index. Reword a choice after a student has picked it and
   their stored answer matches nothing on the card any more: it renders
   as "answered, nothing selected", and there is no way to tell from
   the data that it was ever right.

   So every graded MC in Modules 1..FROZEN_MC_THROUGH_MODULE is pinned
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
   order) precisely because nobody had reached them yet.
   ════════════════════════════════════════════════════════════════════ */
const FROZEN_MC_THROUGH_MODULE = 2;   // students are in Module 2 (Jonathan, 2026-09-19)
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
};
function gradedMcFingerprint(mc) {
  return createHash('sha256')
    .update(JSON.stringify({ choices: mc.choices, choices_es: mc.choices_es, answer: mc.answer }))
    .digest('hex').slice(0, 16);
}
function checkFrozenGradedMcs(allSets) {
  head(`1ap. Graded MC choices frozen through Module ${FROZEN_MC_THROUGH_MODULE}`);
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
          err(`${key} — "${step.label}": graded MC in Module ${w.moduleNum} is not pinned. Students may already have answered it; add its fingerprint to FROZEN_MC_FINGERPRINTS in checks.mjs.`);
          problems++; bad++;
        } else if (pinned !== fp) {
          err(`${key} — "${step.label}": FROZEN graded MC changed (${pinned} → ${fp}). Students store their pick as the choice TEXT, so every answer already given to this card is orphaned — it renders as "answered, nothing selected". Reword only with an old→new map in the renderer, or wait until progress resets for the new school year.`);
          problems++; bad++;
        }
      }));
    }
  }
  for (const key of Object.keys(FROZEN_MC_FINGERPRINTS)) {
    if (!(key in seen)) {
      err(`${key}: pinned graded MC no longer exists — a frozen card was removed or moved, which orphans its stored answers too.`);
      problems++; bad++;
    }
  }
  if (bad === 0) ok(`${Object.keys(seen).length} graded MCs in Modules 1–${FROZEN_MC_THROUGH_MODULE} match their pinned choices`);
  else console.log(`  ${C.dim}current fingerprints:\n${Object.entries(seen).map(([k, v]) => `    '${k}': '${v}',`).join('\n')}${C.reset}`);
}

/* ════════════════════════════════════════════════════════════════════
   MC GIVEAWAY DETECTORS (1at / 1au / 1av) — added 2026-09-20 after a
   sweep of Modules 7–13 found 47 questions a student could answer
   without knowing the material. All three walk the same surface: every
   MC in the course, graded and practice, in both languages.

   Shared helper — the strings that render on the SAME card as an MC,
   so a detector can ask "was the answer already on screen?".
     · a GRADED MC lives on a lesson step: its label, text, hint, stuck
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
        out.push({
          key: `${w.id}·${stId}·sec${si}·step${i}`, moduleNum: Number(w.moduleNum), kind: 'graded',
          label: step.label, mc: step.response,
          visible: ['label', 'text', 'hint', 'stuck', 'levelUp'].map(f => step[f] || '').join(' '),
          visible_es: ['label_es', 'text_es', 'hint_es', 'stuck_es', 'levelUp_es'].map(f => step[f] || '').join(' '),
        });
      }));
    }
    (Array.isArray(w.skills) ? w.skills : []).forEach(sk => {
      if (!sk || !sk.practice || sk.practice.type !== 'mc') return;
      out.push({
        key: `skill ${sk.id}`, moduleNum: Number(w.moduleNum), kind: 'practice',
        label: sk.text, mc: sk.practice,
        visible: `${sk.text || ''} ${sk.gotItWhen || ''}`,
        visible_es: `${sk.text_es || ''} ${sk.gotItWhen_es || ''}`,
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
   beliefs, not filler — m4w1-s6's "Never repeating anything" is the
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
   fixed: Module 1–2 graded MCs are frozen (see 1ap), and the rest were
   out of that sweep's scope. `w2·b·sec0·step0|2` is a genuine defect
   deferred to the reset — see CLAUDE.md's "Summer reset list".
   ════════════════════════════════════════════════════════════════════ */
const MC_CATCHALL_EN = /it doesn'?t matter|either [^.]{0,12}works|equally well|any [^.]{0,20}you like|whichever [^.]{0,20}(?:you like|happens)|as long as you|at random|wherever it|\bnever\b|\balways\b|can'?t be|you can'?t|it isn'?t|it can'?t|exactly the same|nothing at all|only ever|automatically|just pick one|your choice|doesn'?t play at all|can'?t tell/i;
const MC_CATCHALL_ES = /no importa|da igual|cualquier [^.]{0,25}quieras|al azar|donde sea|\bnunca\b|\bsiempre\b|jamás|no se puede|exactamente lo mismo|funciona igual/i;
const MC_CATCHALL_ALLOW = new Set([
  'w2·b·sec0·step0|2|en',        // "It doesn't matter which way" — FROZEN graded (1ap); on the Summer reset list
  'w2·b·sec0·step0|2|es',        //   same card, Spanish twin
  'skill m3w1-s3|1|en',          // "only ever hit the two strings you want" — a real beginner belief about aim
  'skill m4w1-s6|2|en',          // "Never repeating anything" — the plausible opposite of the keyed answer
  'skill m4w1-s6|2|es',          //   same card, Spanish twin
  'm4w2·b·sec1·step0|3|en',      // "They sound exactly the same" — a genuine hammer-on misconception
  'skill m5w2-s5|3|es',          // "Al azar" — a real (wrong) way students pick a practice order
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
  'mis te cada todo toda todos todas otro otra pero tambien solo entre sobre desde hasta cuerda cuerdas'
).split(' '));
const MC_LEAK_VOCAB = new Set('string strings fret frets chord chords note notes beat beats bar bars play plays played playing thumb finger fingers barre pattern scale guitar hand strum strums low high open'.split(' '));
/* Every entry here is in Modules 1–6, which the 2026-09-20 sweep did not cover
   (it ran over 7–13). They are reviewed and deliberately carried, not tuned
   away — Modules 1–2's graded MCs are frozen for the year (1ap), so two of
   them cannot be reworded until progress resets. Clearing the rest is a
   separate job; when a module gets swept, delete its entries here first and
   let the check tell you what is left. */
const MC_LEAK_ALLOW = new Set([
  'w2·b·sec0·step4|high loosen peg',        // Module 1 tuner card — the MC IS the read-the-card check; FROZEN (1ap)
  'skill w2-s3|3 4 mm',                     // a string gauge; the skill label has to state it
  'skill m2w2-s6|behind middle finger',     // pre-existing Module 2 debt, outside the 7–13 sweep
  'skill m2w2-s6|menos detras dedo',        //   same card, Spanish twin
  'skill m4w2-s1|p mf f',                   // the skill label has to define p / mf / f to be teachable at all
]);
function checkMcAnswerOnCard(allSets) {
  head('1av. Keyed MC answer already printed on the same card');
  /* Strip accents BEFORE dropping punctuation — otherwise "más" becomes the two
     tokens "m" and "s" and every Spanish n-gram turns to noise. */
  const words = s => String(s || '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/<[^>]*>/g, ' ').replace(/[^a-z0-9#]+/g, ' ')
    .split(' ').filter(x => x && !MC_LEAK_STOP.has(x));
  const grams = (a, n) => { const o = []; for (let i = 0; i + n <= a.length; i++) o.push(a.slice(i, i + n).join(' ')); return o; };
  let bad = 0, allowed = 0, total = 0;
  for (const card of mcCards(allSets)) {
    for (const [lang, arr, vis] of [['en', card.mc.choices, card.visible], ['es', card.mc.choices_es, card.visible_es]]) {
      if (!Array.isArray(arr) || typeof card.mc.answer !== 'number' || !arr[card.mc.answer]) continue;
      total++;
      const visG = new Set(grams(words(vis), 3));
      if (!visG.size) continue;
      const promptG = new Set(grams(words(lang === 'es' ? card.mc.prompt_es : card.mc.prompt), 3));
      const distG = new Set(arr.filter((_, i) => i !== card.mc.answer).flatMap(c => grams(words(c), 3)));
      const leaked = grams(words(arr[card.mc.answer]), 3).filter(g =>
        visG.has(g) && !distG.has(g) && !promptG.has(g) && g.split(' ').some(t => !MC_LEAK_VOCAB.has(t)));
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
  if (bad === 0) ok(`no keyed answers printed on their own card across ${total} MC choice lists (${allowed} reviewed exceptions allowed)`);
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
function checkNumberedStrings() {
  head('1j. Numbered strings in student-facing text');
  const RE = /\b(?:string|strings|cuerda|cuerdas) [0-6]\b/gi;
  let bad = 0, anchored = 0;
  for (const file of [...MODULE_FILES, 'class-activities.js', 'i18n.js']) {
    const lines = readFileSync(join(ROOT, file), 'utf8').split('\n');
    lines.forEach((line, li) => {
      for (const m of line.matchAll(RE)) {
        const after = line.slice(m.index + m[0].length);
        const before = line.slice(Math.max(0, m.index - 12), m.index);
        if (/^ \((?:the|la|el) /.test(after)) { anchored++; continue; }   // "string 6 (the low E)" teaching anchor
        if (/(?:\b[ADGBEadgbe]|aguda|grave)\s$/.test(before)) continue;   // "the A string 4 times" — named string + a count, not a numbered string
        err(`${file}:${li + 1}: numbered string in student-facing text — "${line.slice(Math.max(0, m.index - 20), m.index + m[0].length + 20).trim()}" (use the string's name)`);
        problems++; bad++;
      }
    });
  }
  if (bad === 0) ok(`no numbered strings in student-facing text (${anchored} anchored teaching exception${anchored === 1 ? '' : 's'} allowed)`);
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
   through each palette, and fail under 4.5:1.

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
          const f = cssRGB(fgV), b = cssRGB(bgV);
          if (!f || !b) continue;
          pairs++;
          const r = ratio(f, b);
          if (r < need) {
            flag(`${name}: ${media ? media + ' { ' : ''}${sel} — ${r.toFixed(2)}:1 in ${mode} mode (${fgV} on ${bgV}); needs ${need}${why ? ` (${why})` : ''}. If the text is genuinely large, or the colour is an icon rather than a glyph, add the selector to CONTRAST_ALLOW.`);
          }
        }
      }
    }
  }
  if (!bad) ok(`${pairs} colour pairs checked across both palettes in ${files} stylesheets — all ≥ 4.5:1`);
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

/* Per-page tab-card counts, pinned. See the note where they're compared. */
const JOURNEY_TAB_COUNTS = {
  'all-along-the-watchtower.html': 10,
  'let-it-be.html': 12,
  'luna.html': 13,
  'seven-nation-army.html': 9,
  'sweet-child-o-mine.html': 12,
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
    const body = functionBodyAt(src, decls[0].index);
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
   Today-first work order, Phase 1) hides every rail .nav-btn except Today
   and Live quiz while it's on. The CSS that does it keys off
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

   Spanish is exempt by construction: the Journey scan blanks every
   data-es="…" attribute before matching (keeping line numbers intact),
   the module scan reads only the EN field names, and i18n.js is read
   through its `en:` values only.
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
     deliberately-defined site-wide terms predating this sweep (module-4/7/
     11's "Two Homes for F"; i18n.js's own tools.ladderMax metronome-ladder
     string and its module-5/6 companions), the same innocent-twin situation
     1w2's whitelist exists for. */
  'nine times out of ten', 'a hair toward the wire', 'park on just g5', 'park on the slide',
  'play it cold', 'read a lick cold', 'what will eat most of your practice time',
  'line them up like soldiers', 'disappear into it', 'pass line 100 bpm', 'rung 4',
  'read it cold', 'sight-read it cold', 'hearing it cold', 'park on just the f',
  "that one's free", 'trip up the neck', 'driving riff',
  'carries the whole job', 'holding the two bars out', 'the module bar', 'on call',
  'cold read', 'feels like a punchline', 'parked in one place',
  'rushed at first, then locked in', 'runs on autopilot', 'test the names cold',
];
/* Hoisted to module scope so 1y can sweep exit-check item labels with the
   exact same list — 1w's own FIELD_RE has no `label`, and widening it would
   re-scan every module step label. matchAll clones the regex, so sharing one
   /g instance across checks carries no lastIndex state between them. */
const SLANG_RE = new RegExp(
  '\\b(?:' + SLANG_PHRASES.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b',
  'gi');
/* Hoisted so 1w-t (below) can share the exact same field/choices/i18n
   regexes instead of a second copy that could drift from 1w's. */
const STUDENT_FIELD_RE =
  /\b(text|hint|stuck|levelUp|gotItWhen|explain|forward|subtitle|meta|intro|note|prompt|placeholder):\s*'((?:\\.|[^'\\])*)'/g;
/* `choices` is an ARRAY, so the field regex above cannot see inside it — and
   until 2026-09-20 neither could 1w, which is how a banned phrase in an
   answer choice shipped while the identical phrase in its `explain` failed
   the push. Sweep every quoted string on a choices line separately. */
const STUDENT_CHOICES_RE = /\bchoices(?:_es)?:\s*\[((?:[^\]\\]|\\.)*)\]/g;
const STUDENT_I18N_EN_RE = /\ben:\s*(?:'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)")/g;
/* label: is deliberately NOT in STUDENT_FIELD_RE (see the 1w comment above —
   1w skips it on purpose, 1y sweeps exit-check item labels separately). But
   the Challenge-card assessment tag ("(assessment preparation)") and most
   Challenge titles live in `label`, so 1w-t alone also sweeps it. */
const STUDENT_LABEL_RE = /\blabel:\s*'((?:\\.|[^'\\])*)'/g;
function checkSlangPhrasing() {
  head('1w. Slang and figurative phrasing in student-facing text');
  const RE = SLANG_RE;
  let bad = 0;
  const flag = (file, li, phrase) => {
    err(`${file}:${li + 1} — "${phrase}"`);
    problems++; bad++;
  };

  /* Journey pages — English text nodes only. Blanking each data-es="…"
     in place (spaces, newlines kept) leaves every line number correct. */
  for (const file of TAB_PAGES.filter(f => f.endsWith('.html'))) {
    let raw;
    try { raw = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
    const en = raw.replace(/data-es="[^"]*"/g, m => m.replace(/[^\n]/g, ' '));
    en.split('\n').forEach((line, li) => {
      if (/^\s*<!--/.test(line)) return;
      for (const m of line.matchAll(RE)) flag(file, li, m[0]);
    });
  }

  /* Module content + class activities — the EN authoring fields only. */
  for (const file of [...MODULE_FILES, 'class-activities.js']) {
    let lines;
    try { lines = readFileSync(join(ROOT, file), 'utf8').split('\n'); } catch { continue; }
    lines.forEach((line, li) => {
      for (const f of line.matchAll(STUDENT_FIELD_RE))
        for (const m of f[2].matchAll(RE)) flag(file, li, m[0]);
      for (const c of line.matchAll(STUDENT_CHOICES_RE))
        for (const m of c[1].matchAll(RE)) flag(file, li, m[0]);
    });
  }

  /* i18n.js — the en: side of each key. */
  try {
    readFileSync(join(ROOT, 'i18n.js'), 'utf8').split('\n').forEach((line, li) => {
      for (const e of line.matchAll(STUDENT_I18N_EN_RE))
        for (const m of (e[1] ?? e[2] ?? '').matchAll(RE)) flag('i18n.js', li, m[0]);
    });
  } catch { /* checked elsewhere */ }

  if (bad === 0) ok('no banned slang phrases in student-facing text');
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

   Shares 1w's own field/choices/i18n regexes (STUDENT_FIELD_RE /
   STUDENT_CHOICES_RE / STUDENT_I18N_EN_RE) rather than a second copy.

   Hidden sections are exempt, the same way the audit itself excluded
   them: kind:tuning-warmup / routine / ear-spark / reflection, a
   take-to-song section that resolves to the Journey link card (modules
   1–5), and any individual step with hidden:true. This walks the REAL
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
  "that's normal!", "you've got this", 'it will feel easy', 'confident level',
  'confident volume', 'confident pluck', 'nafme', "don't worry", "it's okay if",
  'trust the', 'quality first', 'quality over speed', 'make them your own',
  'a stepping stone', "that's the point", 'phrasing strateg', 'tone parameters',
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
  '\\b(?:' + TEACHER_PHRASES.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')',
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
  { file: 'module-2.js', phrase: 'trust the fret numbers' },
  { file: 'module-7.js', phrase: 'trust the one with the highest star rating' },
  /* m2w2 Challenge 3's "(your low-E assessment piece)" label is frozen —
     Module 2 is in rule-zero-proof.mjs's FROZEN_THROUGH regime, where a step
     LABEL must match the base commit BYTE-FOR-BYTE by index (a rename would
     hide an insertion from that proof). Decision 1's "(assessment
     preparation)" retitle can't ship here until progress resets: raising
     FROZEN_THROUGH only freezes MORE modules, it never unlocks Module 2 —
     see CLAUDE.md's "Summer reset list". */
  { file: 'module-2.js', phrase: 'assessment piece' },
];

const HIDDEN_SECTION_KINDS = new Set(['routine', 'ear-spark', 'reflection']);
const HIDDEN_STEP_FIELDS = [
  'text', 'hint', 'stuck', 'levelUp', 'gotItWhen', 'explain', 'label',
  'prompt', 'placeholder', 'meta', 'note', 'forward', 'subtitle', 'intro',
];
function collectHiddenStrings(sets, journeySongsFor) {
  const out = new Set();
  const addObj = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const f of HIDDEN_STEP_FIELDS) {
      if (typeof obj[f] === 'string') out.add(obj[f]);
      if (typeof obj[f + '_es'] === 'string') out.add(obj[f + '_es']);
    }
    for (const sub of [obj.response, obj.practice]) {
      if (!sub || typeof sub !== 'object') continue;
      for (const f of ['prompt', 'explain', 'placeholder']) {
        if (typeof sub[f] === 'string') out.add(sub[f]);
        if (typeof sub[f + '_es'] === 'string') out.add(sub[f + '_es']);
      }
      for (const f of ['choices', 'choices_es']) {
        if (Array.isArray(sub[f])) sub[f].forEach(c => { if (typeof c === 'string') out.add(c); });
      }
    }
  };
  const isTuning = (sec, moduleNum) => moduleNum !== 1 && sec.kind === 'tuning-warmup';
  for (const w of sets) {
    for (const stId of ['b', 'c']) {
      const stn = w.stations && w.stations[stId];
      if (!stn || !(stn.sections && stn.sections.length)) continue;   // single-flow stations hide nothing
      for (const sec of stn.sections) {
        if (isTuning(sec, w.moduleNum) || HIDDEN_SECTION_KINDS.has(sec.kind)) {
          (sec.steps || []).forEach(addObj);
          continue;
        }
        if (sec.kind === 'take-to-song' && journeySongsFor(w.moduleNum).length > 0) {
          (sec.steps || []).forEach(addObj);   // the Journey card renders instead — steps invisible
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

function checkTeacherSpeak(sets, journeySongsFor) {
  head('1w-t. Teacher speak in student-facing text');
  const hidden = sets && journeySongsFor ? collectHiddenStrings(sets, journeySongsFor) : new Set();
  if (!sets || !journeySongsFor) warn('1w-t: no parsed SETS available — hidden-section exemption skipped this run');
  let bad = 0;
  const flag = (file, li, phrase) => { err(`${file}:${li + 1} — "${phrase}"`); problems++; bad++; };
  const sweepValue = (file, li, value) => {
    if (hidden.has(unescapeJs(value))) return;
    const lower = value.toLowerCase();
    for (const m of value.matchAll(TEACHER_RE)) {
      if (TEACHER_PHRASE_ALLOW.some(a => a.file === file && lower.startsWith(a.phrase, m.index))) continue;
      flag(file, li, m[0]);
    }
    for (const m of value.matchAll(TEACHER_MAXIM_RE)) flag(file, li, m[0]);
    for (const re of TEACHER_PREFIXES) if (re.test(value)) flag(file, li, value.slice(0, 20) + '…');
  };

  for (const file of TAB_PAGES.filter(f => f.endsWith('.html'))) {
    let raw;
    try { raw = readFileSync(join(ROOT, file), 'utf8'); } catch { continue; }
    const en = raw.replace(/data-es="[^"]*"/g, m => m.replace(/[^\n]/g, ' '));
    en.split('\n').forEach((line, li) => {
      if (/^\s*<!--/.test(line)) return;
      for (const m of line.matchAll(TEACHER_RE)) flag(file, li, m[0]);
      for (const m of line.matchAll(TEACHER_MAXIM_RE)) flag(file, li, m[0]);
    });
  }

  for (const file of [...MODULE_FILES, 'class-activities.js']) {
    let lines;
    try { lines = readFileSync(join(ROOT, file), 'utf8').split('\n'); } catch { continue; }
    lines.forEach((line, li) => {
      for (const f of line.matchAll(STUDENT_FIELD_RE)) sweepValue(file, li, f[2]);
      for (const c of line.matchAll(STUDENT_CHOICES_RE)) sweepValue(file, li, c[1]);
      for (const l of line.matchAll(STUDENT_LABEL_RE)) sweepValue(file, li, l[1]);
    });
  }

  try {
    readFileSync(join(ROOT, 'i18n.js'), 'utf8').split('\n').forEach((line, li) => {
      for (const e of line.matchAll(STUDENT_I18N_EN_RE)) sweepValue('i18n.js', li, e[1] ?? e[2] ?? '');
    });
  } catch { /* checked elsewhere */ }

  if (bad === 0) ok('no banned teacher-speak phrases in student-facing text');
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
function validateClassActivities() {
  head('1d. In-Class Activities data');
  let src;
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
    if ('view' in a && a.view !== 'focus') { err(`${where}: view "${a.view}" — the only value is 'focus' (or leave it off)`); problems++; }
    if (isCheck) { /* no steps — see 1y */ }
    else if (!Array.isArray(a.steps) || !a.steps.length) { err(`${where}: "steps" should be a non-empty array`); problems++; }
    else {
      a.steps.forEach((s, si) => {
        const sWhere = `${where} · steps[${si}]`;
        if (!s || typeof s !== 'object') { err(`${sWhere}: not an object`); problems++; return; }
        reqEs(sWhere, s, 'text');
        reqEs(sWhere, s, 'label');   // optional step head ("Step 4: Tune it back")
        if ('figure' in s || 'figureAlt' in s || 'figureAlt_es' in s) {
          err(`${a.id} step ${si + 1}: activities carry no figures (2026-09-23) — delete the step or the key`); problems++;
        }
        if (s.video) {
          if (!s.video.id || /placeholder/i.test(s.video.id)) { err(`${sWhere}: video.id is missing or a placeholder — verify via oEmbed before shipping (see CLAUDE.md "Videos")`); problems++; }
          if (s.video.label) reqEs(sWhere, s.video, 'label');
        }
        if (s.tab) {
          const tWhere = `${sWhere} · tab`;
          reqEs(tWhere, s.tab, 'caption');
          reqEs(tWhere, s.tab, 'title');
          const strRe = /^[eBGDAE]$/;
          const checkNote = (n, where) => {
            if (!n || typeof n !== 'object') { err(`${where}: not an object`); problems++; return; }
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
  const numbered = activities.filter(a => a && a.kind !== 'check');
  const checks = activities.length - numbered.length;
  if (problems === 0) ok(`${activities.length} class activit${activities.length === 1 ? 'y' : 'ies'} (${checks} exit check${checks === 1 ? '' : 's'}) — all valid; order lives on the console board`);
  checkExitChecks(activities);
  checkActivityTitleNumbers(activities);
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
// accurate), leaving string contents untouched.
function stripJsComments(src) {
  let out = '';
  for (let i = 0; i < src.length; ) {
    const c = src[i], d = src[i + 1];
    if (c === "'" || c === '"' || c === '`') {
      const skip = skipStringOrComment(src, i);
      out += src.slice(i, skip);
      i = skip;
      continue;
    }
    if (c === '/' && d === '/') {
      let j = i;
      while (j < src.length && src[j] !== '\n') j++;
      out += ' '.repeat(j - i);
      i = j;
      continue;
    }
    if (c === '/' && d === '*') {
      let j = i + 2;
      while (j < src.length && !(src[j] === '*' && src[j + 1] === '/')) j++;
      j = Math.min(j + 2, src.length);
      out += src.slice(i, j).replace(/[^\n]/g, ' ');
      i = j;
      continue;
    }
    out += c;
    i++;
  }
  return out;
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
   icons) are still hashed byte-exact, so a re-exported track bumps the
   audio version exactly as before. */
const TEXT_FOR_HASH = /\.(js|mjs|css|html|json|svg|md|txt|rules|webmanifest)$/i;
function fingerprint(files) {
  const h = createHash('sha256');
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
    if (!assets.includes(f)) { err(`shell file '${f}' is missing from sw.js ASSETS — it won't be precached for offline`); problems++; bad++; }
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
  if (bad === 0) ok(`sw.js ASSETS ↔ shell files in sync (${assets.length} assets)`);
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
   file. Used for both CACHE_VERSION (shell + img/) and AUDIO_CACHE_VERSION
   (audio/ only) — kept separate so a routine content push doesn't bump the
   audio version and purge every student's cached backing tracks, while a
   real re-exported track still bumps it and invalidates the stale cache. */
function bumpVersionConst(constName, prefix, files, src, swPath, label) {
  const fp = fingerprint(files);
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
  src = bumpVersionConst('CACHE_VERSION', 'guitar-class', [...SHELL_FILES, ...IMG_FILES], src, swPath, 'shell cache');
  src = bumpVersionConst('AUDIO_CACHE_VERSION', 'guitar-class-audio', AUDIO_FILES, src, swPath, 'audio cache');
  if (!CHECK_ONLY && src !== before) writeFileSync(swPath, src);
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
        // A take-to-song section swaps in the Journey link card (always
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
   DISPLAY ONLY (m5w2, 2026-09-19; see lessonParts() in app.js and the
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
// Pinned: only Module 5 Set 2 is split today. A second split set is a
// deliberate content decision — bump this in the same edit.
const PARTED_SETS_EXPECTED = 1;
function checkSetParts(sets, buildSet, ctx) {
  head('1ao. Sets shown in two parts');
  const journeySongsFor = vm.runInContext('typeof journeySongsFor === "function" ? journeySongsFor : null', ctx);
  if (!journeySongsFor) { err('app.js: journeySongsFor() not found — 1ao cannot judge take-to-song emptiness'); problems++; return; }
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
        // A take-to-song section with a Journey layer renders the link
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
  if (!bad) ok(`${parted} set shown in two parts (m5w2), both titles in both languages, neither part empty, both marks rendered`);
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
function checkVisibilityParity() {
  head('1ah. caIsVisible / teacherActivityVisible / journeyIsVisible stay in step');
  const COPIES = [
    { file: 'app.js',          fn: 'caIsVisible',            guards: 3 },
    { file: 'teacher.js',      fn: 'teacherActivityVisible', guards: 3 },
    { file: 'tabs/journey.js', fn: 'journeyIsVisible',       guards: 4 },
  ];
  // Concept -> the token each copy is allowed to express it with. A copy
  // satisfies the concept if ANY of its patterns appears in its body.
  const CONCEPTS = [
    { name: 'archived/deleted', re: /retiredActivityIds|teacherActivityRetired|archivedActivities/ },
    { name: 'assigned to the board', re: /caBoardView\(\)\.assigned|activityBoardSeeded/ },
    { name: 'teacher hide toggle', re: /hiddenActivityIds|hiddenActivities/ },
    { name: 'release date', re: /caDate\(|activityDates/ },
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
      if (!con.re.test(body)) {
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
  if (bad === 0) ok('all 3 visibility rules test the same 4 conditions, with matching guard counts');
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
const CONFIG_WRITERS = 16;   // teacherWriteConfig() call sites in teacher.js
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
const SNIPPET_TRACK_FIELDS = ['src', 'srcMetronome', 'srcSlow', 'srcSlowMetronome',
                              'trackBpm', 'trackBpmSlow', 'feltBpm', 'beatsPerBar', 'durationSec'];
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
    /* The OPTIONAL full mix (the Guitar toggle). Both tempo tiers or neither:
       a toggle that dies the moment Slow is pressed is worse than no toggle.
       Same for the metronome pair on top of it. Any path declared has to
       point at a file that is actually there — a typo'd full-mix name is a
       Play button that 404s, and only in the one mode a student reaches by
       pressing the button that is on by default. */
    const FULL_PAIRS = [['srcFull', 'srcFullSlow'], ['srcFullMetronome', 'srcFullSlowMetronome']];
    for (const [fast, slow] of FULL_PAIRS) {
      if (!!tr[fast] !== !!tr[slow])
        flag(`SNIPPET_TRACKS['${name}']: has ${tr[fast] ? fast : slow} but not ${tr[fast] ? slow : fast} — a full mix needs both tempo tiers or neither, or the toggle breaks on Slow`);
    }
    if (tr.srcFullMetronome && !tr.srcFull)
      flag(`SNIPPET_TRACKS['${name}']: declares a full+metronome mix but no plain full mix — nothing can reach it`);
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
    const TWINS = [['srcFull', 'src'], ['srcFullSlow', 'srcSlow'],
                   ['srcFullMetronome', 'srcMetronome'], ['srcFullSlowMetronome', 'srcSlowMetronome']];
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
  const withFull = Object.values(TRACKS).filter(tr => tr.srcFull && tr.srcFullSlow).length;
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
    const stepCount = a.steps.length;
    const words = a.steps.reduce((n, s) => {
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
   ════════════════════════════════════════════════════════════════════ */
const SHORT_RESPONSE_BUDGET = { 3: 0, 4: 3, 5: 4, 6: 1 };
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
   module-5.js's "the cure" play-along `playSeq`, and the Journey page's
   Layer 2 (root line) and Layer 3 (power chords) chorus ASCII tabs.
   ════════════════════════════════════════════════════════════════════ */
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
  } catch { /* reported by 1 */ }

  // 2) module-5.js — the "the cure" play-along playSeq (last 8 of 16 entries)
  try {
    const configSrc = readFileSync(join(ROOT, 'config-main.js'), 'utf8');
    const sandbox = { console };
    vm.createContext(sandbox);
    vm.runInContext(configSrc, sandbox, { filename: 'config-main.js' });
    vm.runInContext(readFileSync(join(ROOT, 'module-5.js'), 'utf8'), sandbox, { filename: 'module-5.js' });
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
          err(`module-5.js "the cure" playSeq: chorus half is ${got.join(' ')}, expected ${EXPECTED.join(' ')}`);
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
    a.steps.forEach((st, si) => {
      if (!st) return;
      const named = ['text', 'text_es', 'label', 'label_es'].some(f => NAMES.test(strip(st[f])));
      if (!named) return;
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
  const calls = app.match(/(?<!function )caJourneyLinkHtml\(a\)/g) || [];
  if (calls.length !== 1 || !/if\(\s*si\s*===\s*\(a\.steps\s*\|\|\s*\[\]\)\.length\s*-\s*1\s*\)\s*parts\.push\(caJourneyLinkHtml\(a\)\)/.test(app)) {
    err(`app.js: caJourneyLinkHtml(a) must be called exactly once, inside caStepHtml gated on the last step (found ${calls.length} call(s)) — the Journey button renders only in the last step`);
    problems++; bad++;
  }
  if (withJourney === 0) { err('1ba found no class activity with journey: — it cannot see what it is supposed to guard'); problems++; return; }
  if (bad === 0) ok(`${withJourney} Journey-linked activit${withJourney === 1 ? 'y' : 'ies'} — the page is named only in the last step, and the button renders only there`);
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
  checkTeacherSpeak(rcSets, rcCtx ? vm.runInContext('typeof journeySongsFor === "function" ? journeySongsFor : null', rcCtx) : null);
  checkJourneyLickLabels();
  checkRetiredStationWording();
  checkStationNames();
  checkTabNoScroll();
  checkContrast();
  checkJourneyThemeDrift();
  checkJourneyTabCards();
  checkTabAsciiAlignment();
  checkTabAsciiEnglish();
  checkJourneyLayers();
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
  checkDaily5Switch();
  checkUnbalancedInlineP();
  checkStrumLineGaps();
  checkBeatsClaimMatchesTab();
  checkCureChorusOrder();
  checkJourneyButtonLastStep();
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
