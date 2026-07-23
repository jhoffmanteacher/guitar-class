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
  'index.html', 'styles.css', 'i18n.js', 'app.js', 'fab-tools.js', 'tuner.js', 'coach.js', 'teacher.js', 'config-main.js',
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
      if (!s.comingSoon && !s.objective)
        { warn(`${where}: no "objective" (fine for placeholders)`); warnings++; }
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
  for (const s of allSets) {
    const n = Number(s.moduleNum);
    if (!skillsByModule.has(n)) skillsByModule.set(n, []);
    const ids = (Array.isArray(s.skills) ? s.skills : []).map(sk => sk && sk.id).filter(Boolean);
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

      for (const stId of Object.keys(w.stations || {})) {
        const st = w.stations[stId];
        const stWhere = `${where} · station "${stId}"`;
        reqEs(stWhere, st, 'title');
        const sections = st.sections || (st.steps ? [{ title: '', steps: st.steps }] : []);
        sections.forEach((sec, si) => {
          const secWhere = `${stWhere} · section ${si + 1}`;
          reqEs(secWhere, sec, 'title');
          (sec.steps || []).forEach((step, sti) => {
            const stepWhere = `${secWhere} · step ${sti + 1}`;
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
            if (sk.practice.type === 'playSeq') reqEs(skWhere, sk.practice, 'label');
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
   2. LINKS — verify external YouTube / Google-Docs URLs still resolve
   ════════════════════════════════════════════════════════════════════ */
function collectUrls() {
  const urls = new Map();  // url → Set(files it appears in)
  for (const file of [...MODULE_FILES, 'config-main.js', 'index.html']) {
    const src = readFileSync(join(ROOT, file), 'utf8');
    for (const m of src.matchAll(/https?:\/\/[^\s"'<>)]+/g)) {
      const u = m[0].replace(/[.,]+$/, '');
      if (!/youtube\.com|youtu\.be|docs\.google\.com/.test(u)) continue;
      if (!urls.has(u)) urls.set(u, new Set());
      urls.get(u).add(file);
    }
  }
  return urls;
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
      if (r.ok) return { url, state: 'ok' };
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
  const urls = collectUrls();
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

  if (dead.length === 0) ok(`no dead links (${results.length - priv.length - errored.length} reachable)`);
}

/* ════════════════════════════════════════════════════════════════════
   3. SW BUMP — make CACHE_VERSION a fingerprint of the shell files
   ════════════════════════════════════════════════════════════════════ */
function fingerprint() {
  const h = createHash('sha256');
  for (const f of [...SHELL_FILES, ...AUDIO_FILES]) {
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

function bumpServiceWorker() {
  head('3. Service-worker cache version');
  const swPath = join(ROOT, 'sw.js');
  const src = readFileSync(swPath, 'utf8');
  checkJourneyPaths();
  checkSwAssets(src);
  checkSdkVersion();
  const fp = fingerprint();
  const date = new Date().toISOString().slice(0, 10);
  const want = `guitar-class-${date}-${fp}`;

  const line = src.match(/const CACHE_VERSION = '([^']*)';/);
  if (!line) { err('could not find CACHE_VERSION in sw.js'); problems++; return; }
  const current = line[1];

  // The fingerprint is what matters; the date is cosmetic. Consider it current
  // if the content fingerprint already matches (ignore a date-only difference).
  const currentFp = (current.match(/-([0-9a-f]{10})$/) || [])[1];
  if (currentFp === fp) { ok(`up to date (${current})`); return; }

  if (CHECK_ONLY) {
    err(`stale — shell files changed but CACHE_VERSION wasn't bumped`);
    console.log(`${C.dim}      is:   ${current}${C.reset}`);
    console.log(`${C.dim}      want: ${want}${C.reset}`);
    problems++;
    return;
  }
  writeFileSync(swPath, src.replace(line[0], `const CACHE_VERSION = '${want}';`));
  ok(`bumped ${current} → ${want}`);
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
  validateModules();
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
