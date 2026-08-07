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

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
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
  'index.html', '404.html', 'styles.css', 'i18n.js', 'guitar-diagrams.js', 'class-activities.js', 'app.js', 'fab-tools.js', 'tuner.js', 'coach.js', 'teacher.js', 'config-main.js',
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
  return allSets;
}

/* ════════════════════════════════════════════════════════════════════
   1c. NOTE "beats" SHAPE — tab.notes and playSeq.notes entries may
   optionally carry { beats: N } (or, for tab notes, a bare beats field
   alongside string/fret/midi) so a demo can hold a note longer than one
   beat. Default is 1 and every existing entry omits it, so this only
   fires on the new field — nothing else about note shape is checked.
   ════════════════════════════════════════════════════════════════════ */
function validateNoteBeats(allSets) {
  head('1c. Note "beats" field shape');
  const checkBeats = (where, n) => {
    if (!n || typeof n !== 'object' || Array.isArray(n)) return;
    if (n.beats !== undefined && !(typeof n.beats === 'number' && n.beats > 0))
      { err(`${where}: "beats" should be a positive number`); problems++; }
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

  if (problems === 0) ok('all note "beats" fields (where present) are valid');
}

/* ════════════════════════════════════════════════════════════════════
   1h. MC ANSWER-LENGTH TELLS — a keyed choice that is markedly the
   longest lets students guess without knowing the material. Two sweeps
   (2026-07-31, 2026-08-01) found and fixed this class by hand; this
   makes it structural. Flags any 3+-choice MC, in EITHER language,
   whose keyed answer is strictly longest, ≥1.3× the runner-up, and
   ≥8 characters longer. Fix by trimming the keyed answer or giving a
   distractor the same level of detail — not by padding with filler.
   ════════════════════════════════════════════════════════════════════ */
function checkMcAnswerTells(allSets) {
  head('1h. MC answer-length tells');
  const RATIO = 1.3, MIN_DIFF = 8;
  let total = 0, bad = 0;

  const checkLang = (choices, answer, where, lang) => {
    const lens = choices.map(c => String(c).length);
    const key = lens[answer];
    const second = Math.max(...lens.filter((_, i) => i !== answer));
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
   schema documented at the top of that file: permanent id shape locked to
   the number (`ca-<number>`), NO `date` field (release dates live in
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
    if (!Number.isInteger(a.number) || a.number < 1) { err(`${where}: number "${a.number}" is not a positive integer`); problems++; }
    else if (seenNumbers.has(a.number)) { err(`${where}: duplicate number ${a.number}`); problems++; }
    else seenNumbers.add(a.number);
    if (idRe.test(a.id || '') && Number.isInteger(a.number) && a.id !== `ca-${a.number}`) {
      err(`${where}: id "${a.id}" must equal "ca-" + number ("ca-${a.number}")`); problems++;
    }
    reqEs(where, a, 'title');
    reqEs(where, a, 'intro');
    if (!Array.isArray(a.steps) || !a.steps.length) { err(`${where}: "steps" should be a non-empty array`); problems++; }
    else {
      a.steps.forEach((s, si) => {
        const sWhere = `${where} · steps[${si}]`;
        if (!s || typeof s !== 'object') { err(`${sWhere}: not an object`); problems++; return; }
        reqEs(sWhere, s, 'text');
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

  if (problems === 0) ok(`${activities.length} class activit${activities.length === 1 ? 'y' : 'ies'} — all valid`);
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
  'guitar-diagrams.js', 'class-activities.js', 'config-main.js', 'i18n.js'];

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

  for (const m of missing) { err(`${m.file}:${m.line} references i18n key '${m.key}' which does not exist`); problems++; }
  if (missing.length === 0 && dynamicBad === 0) {
    ok(`every i18n key reference across ${I18N_SCAN_JS_FILES.length + MODULE_FILES.length + htmlFiles.length} files (+ the dynamic deck/ear/fret-string families) resolves`);
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
  'config-main.js', 'guitar-diagrams.js', 'class-activities.js', ...MODULE_FILES];

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
function fingerprint(files) {
  const h = createHash('sha256');
  for (const f of files) {
    try { h.update(f + '\0'); h.update(readFileSync(join(ROOT, f))); }
    catch { /* file may not exist (e.g. optional icon) — skip */ }
  }
  return h.digest('hex').slice(0, 10);
}

/* Parity guard: sw.js's hand-maintained ASSETS list drifts from reality in
   two silent ways — a new shell file that never gets precached (breaks
   offline), or a stale entry for a deleted file (cache.addAll rejects and
   the whole SW install fails). Parse ASSETS out of sw.js and check both. */
function checkSwAssets(src) {
  const m = src.match(/const ASSETS = \[([\s\S]*?)\];/);
  if (!m) { err('could not find ASSETS in sw.js'); problems++; return; }
  const assets = [...m[1].matchAll(/'\.\/([^']+)'/g)].map(x => x[1]);
  let bad = 0;
  for (const a of assets) {
    try { readFileSync(join(ROOT, a)); }
    catch { err(`sw.js ASSETS lists './${a}' but the file doesn't exist — SW install would fail`); problems++; bad++; }
  }
  // Every fingerprinted shell file belongs in the precache (icons/manifest
  // are listed in ASSETS too, but SHELL_FILES is the must-have core).
  for (const f of SHELL_FILES) {
    if (!assets.includes(f)) { err(`shell file '${f}' is missing from sw.js ASSETS — it won't be precached for offline`); problems++; bad++; }
  }
  if (bad === 0) ok(`sw.js ASSETS ↔ shell files in sync (${assets.length} assets)`);
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
  const FILES = ['app.js', 'sw.js', 'index.html', ...TAB_PAGES];
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
  let bad = 0;
  for (const f of files) {
    const r = spawnSync(process.execPath, ['--check', join(ROOT, f)], { encoding: 'utf8' });
    if (r.status !== 0) {
      err(`syntax error: ${f}`);
      console.log(`${C.dim}${(r.stderr || '').trim().split('\n').slice(0, 4).join('\n')}${C.reset}`);
      bad++; problems++;
    }
  }
  if (!bad) ok(`${files.length} shipped .js files parse clean`);
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

   If app.js grows a load-time dependency the stub doesn't cover, this
   reports "harness could not load" as a WARNING rather than failing the
   push — a stale harness must never block a good push. A set that throws
   or renders suspiciously short IS a hard failure.
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
    warn(`render harness could not load (${e.message}) — renderer NOT smoke-tested`);
    console.log(`${C.dim}  if app.js gained a new load-time browser dependency, extend the stub in renderCheck()${C.reset}`);
    warnings++;
    return;
  }

  const sets = vm.runInContext('typeof SETS !== "undefined" ? SETS : []', ctx) || [];
  const buildSet = vm.runInContext('typeof buildSet === "function" ? buildSet : null', ctx);
  if (!sets.length || !buildSet) {
    warn('render harness loaded but found no SETS/buildSet — renderer NOT smoke-tested');
    warnings++;
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
  checkWatchRanges();
  checkNumberedStrings();
  checkBlockedTabSites();
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
