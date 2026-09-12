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

import { readFileSync, writeFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
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

  if (bad === 0) ok('inline TAB cannot scroll sideways (board, grid, columns, note-button width, wrap constant)');
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
function checkContrast() {
  head('1s. Text contrast in both palettes');
  const lum = c => {
    const [r, g, b] = c.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => { const [hi, lo] = [lum(a), lum(b)].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); };

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
  'the-cure.html': 10,
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
  { file: 'teacher.js', fn: 'setShortResponses' },
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
    if (!/\bvisible(Steps|Sections)\s*\(/.test(body)) {
      err(`${file}: ${fn}() no longer calls visibleSteps(/visibleSections( — a hidden step or section would count again`);
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
];
/* Hoisted to module scope so 1y can sweep exit-check item labels with the
   exact same list — 1w's own FIELD_RE has no `label`, and widening it would
   re-scan every module step label. matchAll clones the regex, so sharing one
   /g instance across checks carries no lastIndex state between them. */
const SLANG_RE = new RegExp(
  '\\b(?:' + SLANG_PHRASES.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b',
  'gi');
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
  const FIELD_RE =
    /\b(text|hint|stuck|levelUp|gotItWhen|explain|forward|subtitle|meta|intro|note):\s*'((?:\\.|[^'\\])*)'/g;
  for (const file of [...MODULE_FILES, 'class-activities.js']) {
    let lines;
    try { lines = readFileSync(join(ROOT, file), 'utf8').split('\n'); } catch { continue; }
    lines.forEach((line, li) => {
      for (const f of line.matchAll(FIELD_RE))
        for (const m of f[2].matchAll(RE)) flag(file, li, m[0]);
    });
  }

  /* i18n.js — the en: side of each key. */
  const EN_RE = /\ben:\s*(?:'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)")/g;
  try {
    readFileSync(join(ROOT, 'i18n.js'), 'utf8').split('\n').forEach((line, li) => {
      for (const e of line.matchAll(EN_RE))
        for (const m of (e[1] ?? e[2] ?? '').matchAll(RE)) flag('i18n.js', li, m[0]);
    });
  } catch { /* checked elsewhere */ }

  if (bad === 0) ok('no banned slang phrases in student-facing text');
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
   id (an authoring counter — NOT locked to `number`, which is the
   resequence-able teaching order and has to run 1..N), NO `date` field (release dates live in
   Firestore config/class.activityDates now, set from the teacher console —
   see app.js/teacher.js), an _es twin on every required string, and any
   figure/video referenced actually exists / isn't a placeholder.
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
  const seenNumbers = new Set();
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
    if (!isCheck) {
      if (!Number.isInteger(a.number) || a.number < 1) { err(`${where}: number "${a.number}" is not a positive integer`); problems++; }
      else if (seenNumbers.has(a.number)) { err(`${where}: duplicate number ${a.number}`); problems++; }
      else seenNumbers.add(a.number);
    }
    reqEs(where, a, 'title');
    reqEs(where, a, 'intro');
    if (isCheck) { /* no steps — see 1y */ }
    else if (!Array.isArray(a.steps) || !a.steps.length) { err(`${where}: "steps" should be a non-empty array`); problems++; }
    else {
      a.steps.forEach((s, si) => {
        const sWhere = `${where} · steps[${si}]`;
        if (!s || typeof s !== 'object') { err(`${sWhere}: not an object`); problems++; return; }
        reqEs(sWhere, s, 'text');
        reqEs(sWhere, s, 'label');   // optional step head ("Step 4: Tune it back")
        if (s.figure) {
          try { readFileSync(join(ROOT, s.figure)); }
          catch { err(`${sWhere}: figure "${s.figure}" does not exist`); problems++; }
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

  // `number` is teaching order, deliberately decoupled from the id (see the
  // header of class-activities.js) — so instead of pinning it to the id, pin
  // the SET: 1..N, no gaps. A gap is the tell that a resequence was left
  // half-done, and it would show students a jump like "#3 … #5".
  // Exit checks hold no position, so the 1..N run is over the numbered
  // activities only — a check in the middle of the file must not read as a gap.
  const numbered = activities.filter(a => a && a.kind !== 'check');
  if (seenNumbers.size === numbered.length) {
    const missing = [];
    for (let n = 1; n <= numbered.length; n++) if (!seenNumbers.has(n)) missing.push(n);
    if (missing.length) {
      err(`CLASS_ACTIVITIES: "number" must run 1..${numbered.length} with no gaps — missing ${missing.join(', ')}`);
      problems++;
    }
  }

  const checks = activities.length - numbered.length;
  if (problems === 0) ok(`${activities.length} class activit${activities.length === 1 ? 'y' : 'ies'} (${checks} exit check${checks === 1 ? '' : 's'}) — all valid, teaching order 1..${numbered.length}`);
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
   2026-08-20). So it is deliberately independent of `number`, and this
   check does NOT pin the two together — an earlier version did, which is
   what pushed the series to 3..8 in the first place.

   What it does enforce is that each series reads 1, 2, 3, … in teaching
   order: group titles by the words before the digit, sort by `number`,
   and fail on a gap, a duplicate, or a backwards jump. Inserting a Gym
   in the middle therefore still means retyping every later Gym's digit.
   EN and ES are grouped separately, so a translated series has to stay
   in step with itself too.

   Only a number in "series position" counts — one that ends the title or
   is followed by a — / – / - / : separator. A number that is part of the
   prose ("Play 3 Chords", "Happy Birthday in 6/8") is left alone. If a
   title ever legitimately ends in a non-series number, reword it rather
   than loosening this.
   ════════════════════════════════════════════════════════════════════ */
function checkActivityTitleNumbers(activities) {
  head('1l. Numbered activity series run 1..N in teaching order');
  // A standalone integer that ends the string or hands off to a separator.
  const POS_RE = /(?:^|\s)(\d+)(?=\s*(?:[—–:-]\s|$))/;
  // series key -> [{ id, number, seriesNum, title }], one map per language.
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
      series.get(key).entries.push({ id: a.id, number: a.number, seriesNum: Number(m[1]), title });
    }
  }
  let bad = 0;
  for (const { field, name, entries } of series.values()) {
    entries.sort((x, y) => x.number - y.number);
    entries.forEach((e, i) => {
      if (e.seriesNum === i + 1) return;
      err(`${e.id}: ${field} "${e.title}" is #${i + 1} of the "${name}" series (by teaching order) but reads ${e.seriesNum} — the series has to run 1..${entries.length} (see class-activities.js header)`);
      problems++; bad++;
    });
  }
  if (bad === 0) {
    const n = series.size;
    ok(n ? `${n} numbered title series — each runs 1..N in teaching order` : 'no numbered activity title series');
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
  try {
    const LIVE_QUIZZES = loadConstObject(readFileSync(join(ROOT, 'live-quiz.js'), 'utf8'), 'LIVE_QUIZZES');
    for (const id of Object.keys(LIVE_QUIZZES)) {
      const q = LIVE_QUIZZES[id];
      const keys = [q.titleKey, q.promptKey, ...(q.choices || []).map(c => c.key)];
      for (const k of keys) {
        if (!k) { err(`live-quiz.js LIVE_QUIZZES['${id}'] is missing an i18n key (titleKey/promptKey/choice key)`); problems++; dynamicBad++; continue; }
        if (!KEYS.has(k)) { err(`live-quiz.js LIVE_QUIZZES['${id}'] references i18n key '${k}' which does not exist`); problems++; dynamicBad++; }
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
  renderCheck();
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
  checkJourneyLickLabels();
  checkRetiredStationWording();
  checkStationNames();
  checkTabNoScroll();
  checkContrast();
  checkJourneyThemeDrift();
  checkJourneyTabCards();
  checkTabAsciiAlignment();
  checkJourneyLayers();
  checkGateSafeNav();
  checkVisibleHelperUsage();
  checkFigureDimensions();
  checkOrphanAssets();
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
