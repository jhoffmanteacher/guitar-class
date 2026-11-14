#!/usr/bin/env node
/* plant-a-fault.mjs — plant small mistakes in the risky code, one at a time, and list any that no tool caught
   (2026-11-14; Jonathan's plan, Wave 3 item 2: "Every week GitHub plants small mistakes in the risky code (save,
   rules, offline cache, listening) one at a time and lists any that no tool caught. A short report you can ignore
   when it is clean.").

     node tools/plant-a-fault.mjs                       every region, 20 mistakes each, seed = this ISO week
     node tools/plant-a-fault.mjs --seed 2026-W46 --per-region 30 --region save,listening
     node tools/plant-a-fault.mjs --list                print the mistakes the seed picks, run nothing
     node tools/plant-a-fault.mjs --replay <id>         plant ONE mistake in a scratch copy, run its tools there,
                                                        and leave the copy for a person to look at (--no-run: plant only)

   HOW IT WORKS. REGIONS below names the risky code (files and functions) and the tools that guard it. For each region:
     1. a scratch copy of the site is made (audio/ is linked, not copied; .git is left out) and every tool of the region
        runs on it UNMUTATED. A tool that fails there fails the whole run (exit 1): its verdicts on a mistake would mean
        nothing. Tools that compare with an earlier run (`--against`) get their baseline here.
     2. small mistakes are planted, one at a time, each in the scratch copy: flip a comparison (< to <=, === to !==),
        swap && and ||, change a number (by one when it is small, else times 2, a decimal times 1.5), remove one
        statement, negate an if / while condition, swap true and false; in the rules also delete one condition line and
        loosen isSchool() / isTeacher() to isSignedIn() in one place. Never inside a comment, a string or a template,
        and never on a line that logs (console.*). A mistake that does not even parse is not planted (the sample skips
        it). The sample is seeded: the same seed and the same code give the same mistakes (`--list` twice is
        identical), spread evenly over the kinds of mistake.
     3. for each mistake the region's tools run in order (fastest first) until one CATCHES it: the tool exits non-zero,
        prints more ✗ lines than on the clean copy, or does not finish in its time (4 x its clean time + 60 s). A tool
        that compares runs (`--against`) and answers "cannot judge this" is not a catch: the next tool runs. checks.mjs
        is run as `--check --skip-links`, and its "stale — files changed but CACHE_VERSION wasn't bumped" line, which
        any edit to a cached file prints, does not count. A mistake no tool caught GOT THROUGH.
   Each mistake has an id made from the file, the function, the kind and the changed line's text (not its number),
   so an id stays the same while the code around it moves.

   THE KNOWN FILE, tools/plant-a-fault-known.json: mistakes that got through, were read by a person, and were judged
     harmless   the change cannot change what the code does (an "equivalent" mistake: `n >= 0` vs `n > 0` where n is
                never 0, a timeout that only a hang reaches), or
     accepted   a real change that no tool needs to catch (a cosmetic wait, a retry count nobody relies on).
   A real hole in the tools is NOT listed there: it stays in the report, week after week when the sample picks it,
   until a test in the tool that should catch it is written.
   Each entry: id, region, file, where, before, after, class, reason (one line) and date. The report lists only the
   NEW mistakes that got through; known ones are counted. An entry whose mistake no longer exists (the code changed)
   is reported as stale, and an entry that a tool now catches is reported too.

   NOT IN THE WEEKLY RUN: the browser tools (tools/update-reload-loop.mjs and tools/slow-load.mjs guard the offline
   cache and the update reload, tools/smoke.mjs and tools/playalong-loop.mjs the pages); the report says so. The
   rules tests that need the Firestore emulator run only with --emu (the rules job of .github/workflows/plant-a-fault.yml).

   OPTIONS
     --seed S            any text (default: this ISO week, e.g. 2026-W46)
     --per-region K      mistakes per region (default 20)
     --region a,b        only these regions (names: --list prints them; REGIONS below)
     --list              print the region table summary and the sampled mistakes; plant nothing
     --replay ID         plant one mistake (from any region) in <scratch>/replay-ID, run its tools with their output,
                         and keep the copy; --no-run plants only
     --plant "F|OLD|NEW" a hand-made mistake (the proof's: OLD must occur once in file F), in the one --region given
     --jobs N            scratch copies run side by side (default 2); rules tests on the emulator always run one at a time
     --max-load L        wait before a new mistake while the 1-minute load is above L (default 8)
     --budget MIN        stop planting new mistakes after MIN minutes (the rest are reported "not run")
     --all-tools         run every tool on every mistake (slower; default stops at the first that catches it)
     --emu DIR --emu-port P   a folder with the rules tests' npm packages and a running emulator on port P (default
                         8089); the rules tests are copied there and run against the planted rules
     --root DIR          the site to test (default: this checkout)
     --scratch DIR       where the scratch copies go (default: a new folder under the system temp folder)
     --keep              keep the scratch copies
     --json FILE         every mistake, every tool's verdict and time
     --md FILE           the report as Markdown (also appended to $GITHUB_STEP_SUMMARY when GitHub sets it)
   Exit 0 = the run finished (mistakes that got through never fail it: this is report-only); 1 = a region's tools fail
   on the UNMUTATED tree, a tool could not be started, or a planted file could not be put back; 2 = bad arguments or
   this tool crashed. The last line is one summary line ("plant-a-fault: …"), for the annotation.
   checks.mjs 1ea checks that every file, function, constant and block named in REGIONS still exists and that the
   known file parses. Node only, no packages. */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, cpSync, symlinkSync, readdirSync, copyFileSync, mkdtempSync, appendFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join, dirname, resolve, relative, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir, loadavg } from 'node:os';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '..');
export const KNOWN_FILE = 'tools/plant-a-fault-known.json';

/* ── THE RISKY REGIONS ───────────────────────────────────────────────────────────────────────────────────────────
   targets: { file, fns: [function declarations] } | { file, block: 'unique text', label } (the { … } that follows the
   text) | { file, consts: [top-level const names] } | { file, whole: true } | { file, rules: true } (a rules text).
   tools: run in this order on every mistake (a target may name its own). notRun: the browser tools that guard this
   region and are not in the weekly run. */
export const REGIONS = [
  { name: 'save',
    why: "the progress save: a fault here loses a student's work (CLAUDE.md danger zone; the save-loop header names these writers)",
    targets: [
      { file: 'app/save.js', fns: ['swap45MapId', 'swap45Keys', 'swap45Marked', 'swap45Remap', 'swap45Canon', 'swap45Patch', 'swap45Commit',
        'swap45OnLoad', 'resetLoadedProgress', 'loadProgress', 'onResponseChange', 'onStepMcSelect', 'withTimeout', 'queueSave', 'flushSave',
        'onCompleteChange', 'onClassActivityChange', 'onCaStepChange', 'bumpPracticeStreak'] },
      { file: 'app/drills.js', fns: ['logPracticeRep'] },
      { file: 'app/activities-2.js', fns: ['ecSubmit', 'flushOnHide'] },
      { file: 'app/activities.js', fns: ['caPickPath'] },
    ],
    tools: ['save-loop', 'visible-loop', 'shared-chromebook', 'checks'],
    notRun: ['smoke (the browser walk)'] },
  { name: 'cache',
    why: 'the offline cache and the update reload: a fault here leaves students on a broken or stale copy (BREAK-GLASS.md)',
    targets: [
      { file: 'sw.js', whole: true },
      { file: 'app/start.js', block: "if ('serviceWorker' in navigator", label: 'the service-worker block' },
      { file: 'app/boot.js', fns: ['swResumeTake', 'swResumeSave', 'swResumeWatch', 'swResumeScroll', 'swResumeLessonSnap', 'swResumeApply'] },
    ],
    tools: ['kill-switch', 'sw-audio', 'checks'],
    notRun: ['update-reload-loop', 'slow-load'] },
  { name: 'rules',
    why: "firestore.rules is the real security boundary: a fault here lets the wrong account read or write (danger zone)",
    targets: [
      { file: 'firestore.rules', rules: true, pairWith: 'firestore.rules.paste2', tools: ['site-errors-sim', 'song-files-console', 'pm-rules', 'rules-core', 'site-errors-rules', 'song-requests-rules', 'song-files-rules', 'live-quiz-loop', 'checks'] },
      { file: 'firestore.rules.paste2', rules: true, optional: true, pairWith: 'firestore.rules', sharedFromPair: true, tools: ['pm-rules', 'rules-core', 'site-errors-rules', 'song-requests-rules', 'song-files-rules', 'checks'] },
    ],
    tools: [] },
  { name: 'listening',
    why: 'how the games hear: a fault here grades a student wrong (coach detection is danger zone)',
    targets: [
      { file: 'coach-core.js', consts: ['COACH_FFT', 'COACH_PITCH_GATE', 'CHK_ONSET_FLOOR', 'CHK_ONSET_RATIO', 'CHK_HF_FLOOR', 'CHK_HF_RATIO',
        'CC_POWER_ONSET_RATIO', 'CC_POWER_HF_RATIO', 'COACH_ONSET_REFRACT', 'COACH_ATTACK_SKIP', 'COACH_EVENT_TAIL', 'COACH_LOOK_TAIL', 'COACH_LOOK_MIN',
        'COACH_TAIL_BEATS', 'COACH_STALL_BEATS', 'COACH_MAX_LISTEN_X', 'COACH_PULSE_TIGHT_FRAC', 'COACH_MATCH_FRAC', 'COACH_MATCH_MIN_MS',
        'COACH_ON_BEAT_FRAC', 'COACH_ON_BEAT_MIN_MS', 'COACH_MIC_GAIN', 'COACH_LVL_WIN', 'COACH_LVL_HOP', 'COACH_CATCHUP_MAX_MS', 'COACH_VOTE_SHARE',
        'COACH_VOTE_TOL', 'COACH_STANDOUT', 'COACH_STANDOUT_TARGET'] },
      { file: 'coach-core.js', fns: ['coachMatchWinMs', 'coachOnBeatMs', 'coachReadFrame', 'coachSmooth', 'coachPitchReadings', 'coachTargetShare',
        'coachOnsetTick', 'coachIdleTick', 'coachSettlePitch', 'coachLoop', 'coachDetectPitch', 'coachFinalizeEvent', 'coachMelodyVote', 'coachLookFeed',
        'coachLookPass', 'coachLookResolve', 'coachToneShare', 'coachMatchEvent', 'coachMinHeard', 'coachScorePitch', 'coachScoreTiming',
        'coachScoreTempo', 'coachScoreChanges', 'coachScoreCompletion'] },
      { file: 'coach-chords.js', consts: ['CC_GRID_STEP_CAP_MS'] },
      { file: 'coach-chords.js', fns: ['ccLoop', 'ccResolvePend', 'ccHoldFinal', 'ccFinish', 'ccLiveBpm'] },
    ],
    tools: ['tone-test', 'takes', 'change-up', 'power-switch', 'listen-chords', 'listen-melody', 'checks'],
    notRun: [] },
  { name: 'signin',
    why: 'sign-in, sign-out and the access screen: a fault here shows one student another\'s work or locks a class out',
    targets: [
      { file: 'app/start.js', block: 'auth.onAuthStateChanged(async user=>{', label: 'the sign-in callback' },
      { file: 'app/boot.js', fns: ['accessRefusedAtBoot', 'accessCheck', 'showAccessScreen', 'accessReadMine', 'accessAsk', 'accessRecheck', 'signOut', 'flushBeforeLeaving', '_uidKey'] },
    ],
    tools: ['access-sim', 'save-loop', 'shared-chromebook', 'checks'],
    notRun: ['smoke (the browser walk)'] },
  { name: 'songfiles',
    why: 'the song-files loader: a fault here plays the wrong bytes, keeps a broken copy or spends the monthly download budget',
    targets: [{ file: 'app/songfiles.js', whole: true }],
    tools: ['song-files-sim', 'song-files-console', 'checks'],
    notRun: [] },
  { name: 'console-config',
    why: "the console's one writer of config/class: a fault here loses a teacher's change or hides an activity (danger zone)",
    targets: [{ file: 'teacher-config.js', fns: ['teacherWriteConfig', 'loadTeacherClassConfig', 'teacherReadClassConfig', 'teacherConfigWritesSettled',
      'teacherConfigAt', 'teacherConfigCanon', 'teacherConfigSame', 'teacherStaleConfigError', 'teacherConfigSaveFailed'] }],
    tools: ['visible-loop', 'two-consoles', 'checks'],
    notRun: [] },
];

/* ── THE TOOLS ─────────────────────────────────────────────────────────────────────────────────────────────────────
   cmd: a Node script of the site under test and its arguments. against: the clean run adds --json=<baseline>, a
   mistake's run --against=<baseline>; `refuse` (exit 2 with that text) means "cannot judge". diff: the clean tree
   already prints ✗ lines (known faults the tool lists): a mistake is caught when the SET of ✗ lines changes.
   ignore: ✗ lines that do not count. emu: a rules test, run in the --emu folder against the planted rules text. */
export const TOOLS = {
  'save-loop':          { cmd: ['tools/save-loop.mjs'] },
  'visible-loop':       { cmd: ['tools/visible-loop.mjs'] },
  'shared-chromebook':  { cmd: ['tools/shared-chromebook-loop.mjs'] },
  'two-consoles':       { cmd: ['tools/two-consoles-loop.mjs'], diff: true, cleanExit: [0, 1] },
  'access-sim':         { cmd: ['tools/access-sim.mjs'] },
  'kill-switch':        { cmd: ['tools/kill-switch/proof.mjs'] },
  'sw-audio':           { cmd: ['tools/sw-audio-proof.mjs'] },
  'tone-test':          { cmd: ['tools/tone-test.mjs'] },
  'song-files-sim':     { cmd: ['tools/song-files-sim.mjs'] },
  'song-files-console': { cmd: ['tools/song-files-console-sim.mjs'] },
  'site-errors-sim':    { cmd: ['tools/site-errors-sim.mjs'] },
  'live-quiz-loop':     { cmd: ['tools/live-quiz-loop.mjs'] },
  'takes':              { cmd: ['tools/mic-sim/closed-loop.mjs', '--takes-only'], against: true },
  'change-up':          { cmd: ['tools/mic-sim/closed-loop.mjs', '--game=changeup', '--students=beginner,wrongFret,neverMoves', '--rooms=quiet', '--bpm=90', '--seeds=1', '--no-takes'], against: true },
  'power-switch':       { cmd: ['tools/mic-sim/closed-loop.mjs', '--students=beginner,wrongFret,neverMoves', '--rooms=quiet', '--seeds=1', '--no-takes'], against: true },
  'listen-chords':      { cmd: ['tools/mic-sim/listen-loop.mjs', '--game=chords', '--rooms=quiet'], against: true },
  'listen-melody':      { cmd: ['tools/mic-sim/listen-loop.mjs', '--game=melody', '--rooms=quiet'], against: true },
  'checks':             { cmd: ['tools/checks.mjs', '--check', '--skip-links'], ignore: [/stale — files changed but \w+ wasn't bumped/, /\d+ problems? found.*do not push/], exitOnlyWithoutIgnored: true },
  'pm-rules':           { emu: 'tools/pm-rules-test.mjs' },
  'rules-core':         { emu: 'tools/rules-core-test.mjs' },
  'site-errors-rules':  { emu: 'tools/site-errors-rules-test.mjs', site: true },
  'song-requests-rules': { emu: 'tools/song-requests-rules-test.mjs' },
  'song-files-rules':   { emu: 'tools/song-files-rules-test.mjs' },
};
/* "Cannot judge this": the tool says so (a changed detector, other takes), or its own text rewrite of the site (the
   older grading rules it replays the takes with, tools/mic-sim/candidates.mjs) no longer finds the line it rewrites. */
const REFUSE_RE = /CANNOT JUDGE|NOT THE SAME|not the same command|not comparable|candidates: (expected this line|no )/i;

const OPS = {   // kind of mistake -> plain words
  compare: 'flip a comparison', logic: 'swap && and ||', number: 'change a number', remove: 'remove one statement',
  negate: 'negate a condition', bool: 'swap true and false', 'rules-line': 'delete one rules condition line',
  'rules-gate': 'loosen a gate to isSignedIn()', plant: 'a hand-made mistake (--plant)',
};
const OP_ORDER = ['compare', 'logic', 'number', 'remove', 'negate', 'bool', 'rules-line', 'rules-gate'];

/* ── A small tokenizer: enough of JavaScript (and of the rules language) to never touch a comment, a string, a
   template or a regex, and to match brackets. ── */
const PUNCT = ['>>>=', '...', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=', '=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.',
  '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '**', '<<', '>>'];
const KW_BEFORE_EXPR = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await']);
const WS = /[\s\u00a0\ufeff\u2028\u2029]/;
function skipString(s, i) { const q = s[i]; let j = i + 1; while (j < s.length) { const c = s[j]; if (c === '\\') { j += 2; continue; } if (c === q) return j + 1; if (c === '\n') return j; j++; } return j; }
function skipRegex(s, i) { let j = i + 1, cls = false; while (j < s.length) { const c = s[j]; if (c === '\\') { j += 2; continue; } if (c === '\n') return j; if (cls) { if (c === ']') cls = false; } else if (c === '[') cls = true; else if (c === '/') { j++; while (j < s.length && /[a-z]/i.test(s[j])) j++; return j; } j++; } return j; }
function skipComment(s, i) { if (s[i + 1] === '/') { const e = s.indexOf('\n', i); return e < 0 ? s.length : e; } const e = s.indexOf('*/', i + 2); return e < 0 ? s.length : e + 2; }
function skipTemplate(s, i) { let j = i + 1; while (j < s.length) { const c = s[j]; if (c === '\\') { j += 2; continue; } if (c === '`') return j + 1; if (c === '$' && s[j + 1] === '{') { j = skipCodeToBrace(s, j + 2); continue; } j++; } return j; }
/* Inside ${ … }: code up to the matching }, with strings, templates, comments and (by the previous character) regexes. */
function skipCodeToBrace(s, j) {
  let depth = 0, prev = '(';
  while (j < s.length) {
    const c = s[j];
    if (WS.test(c)) { j++; continue; }
    if (c === '/' && (s[j + 1] === '/' || s[j + 1] === '*')) { j = skipComment(s, j); continue; }
    if (c === '"' || c === "'") { j = skipString(s, j); prev = 'a'; continue; }
    if (c === '`') { j = skipTemplate(s, j); prev = 'a'; continue; }
    if (c === '/' && /[(,=:[!&|?{};+\-*%<>~^]/.test(prev)) { j = skipRegex(s, j); prev = 'a'; continue; }
    if (c === '{') depth++;
    else if (c === '}') { if (depth === 0) return j + 1; depth--; }
    prev = /[\w$)\]]/.test(c) ? 'a' : c;
    j++;
  }
  return j;
}
function regexAllowed(p) {
  if (!p) return true;
  if (p.type === 'name') return KW_BEFORE_EXPR.has(p.v);
  if (p.type !== 'punct') return false;
  return p.v !== ')' && p.v !== ']';
}
export function tokenize(src, mode = 'js') {
  const toks = [];
  let i = 0, prev = null;
  const n = src.length;
  const add = (type, a, b) => { const t = { type, a, b, v: src.slice(a, b) }; toks.push(t); if (type !== 'comment') prev = t; };
  while (i < n) {
    const c = src[i];
    if (WS.test(c)) { i++; continue; }
    if (c === '/' && (src[i + 1] === '/' || src[i + 1] === '*')) { const b = skipComment(src, i); add('comment', i, b); i = b; continue; }
    if (c === '"' || c === "'") { const b = skipString(src, i); add('str', i, b); i = b; continue; }
    if (c === '`' && mode === 'js') { const b = skipTemplate(src, i); add('tmpl', i, b); i = b; continue; }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
      const m = /^(?:0[xXbBoO][0-9a-fA-F_]+n?|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d+)?n?)/.exec(src.slice(i, i + 64));
      add('num', i, i + m[0].length); i += m[0].length; continue;
    }
    if (/[A-Za-z_$\u0080-\uffff]/.test(c)) { let b = i + 1; while (b < n && /[\w$\u0080-\uffff]/.test(src[b]) && !WS.test(src[b])) b++; add('name', i, b); i = b; continue; }
    if (c === '/' && mode === 'js' && regexAllowed(prev)) { const b = skipRegex(src, i); add('regex', i, b); i = b; continue; }
    let p = PUNCT.find(x => src.startsWith(x, i)) || c;
    if (p === '?.' && /[0-9]/.test(src[i + 2] || '')) p = '?';
    add('punct', i, i + p.length); i += p.length;
  }
  return toks;
}
const OPEN = { '(': ')', '[': ']', '{': '}' };
/* The index of the token closing the bracket at code[i] (code = tokens without comments), or -1. */
function matchClose(code, i) {
  let depth = 0;
  for (let j = i; j < code.length; j++) {
    const v = code[j].type === 'punct' ? code[j].v : '';
    if (v in OPEN) depth++;
    else if (v === ')' || v === ']' || v === '}') { depth--; if (depth === 0) return j; if (depth < 0) return -1; }
  }
  return -1;
}

/* ── Reading a file of the site: tokens, lines, and the code ranges a target names ── */
const fileCache = new Map();
function loadFile(root, file, mode) {
  const key = root + '\0' + file + '\0' + mode;
  if (fileCache.has(key)) return fileCache.get(key);
  const path = join(root, file);
  if (!existsSync(path)) { fileCache.set(key, null); return null; }
  const src = readFileSync(path, 'utf8');
  const toks = tokenize(src, mode);
  const code = toks.filter(t => t.type !== 'comment');
  const nl = []; for (let i = 0; i < src.length; i++) if (src[i] === '\n') nl.push(i);
  const lineOf = off => { let lo = 0, hi = nl.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (nl[mid] < off) lo = mid + 1; else hi = mid; } return lo + 1; };
  const lineStart = off => { const k = src.lastIndexOf('\n', off - 1); return k + 1; };
  const lineEnd = off => { const k = src.indexOf('\n', off); return k < 0 ? src.length : k; };
  let bal = 0; for (const t of code) if (t.type === 'punct') { if (t.v in OPEN) bal++; else if (t.v === ')' || t.v === ']' || t.v === '}') bal--; }
  const f = { file, src, toks, code, lineOf, lineStart, lineEnd, balanced: bal === 0, mode };
  fileCache.set(key, f);
  return f;
}
function depthMap(code) { const d = new Array(code.length); let k = 0; for (let i = 0; i < code.length; i++) { const v = code[i].type === 'punct' ? code[i].v : ''; if (v === ')' || v === ']' || v === '}') k--; d[i] = k; if (v in OPEN) k++; } return d; }

/* Each target -> [{ scope, from, to }] token-index ranges (in f.code, exclusive) or a problem text. */
function targetRanges(f, t) {
  const out = [], problems = [];
  if (t.whole || t.rules) out.push({ scope: '(file)', from: -1, to: f.code.length });
  for (const name of t.fns || []) {
    const hits = [];
    for (let i = 0; i + 1 < f.code.length; i++) if (f.code[i].v === 'function' && f.code[i + 1].type === 'name' && f.code[i + 1].v === name) hits.push(i);
    if (hits.length !== 1) { problems.push(hits.length ? `${t.file} ${name}(), which is declared ${hits.length} times` : `${t.file} ${name}(), which is gone`); continue; }
    let j = hits[0] + 2;
    if (f.code[j]?.v !== '(') { problems.push(`${t.file} ${name}(), which no longer reads as a function`); continue; }
    j = matchClose(f.code, j);
    const open = j + 1;
    if (j < 0 || f.code[open]?.v !== '{') { problems.push(`${t.file} ${name}(), which no longer reads as a function`); continue; }
    const close = matchClose(f.code, open);
    if (close < 0) { problems.push(`${t.file} ${name}(), whose body does not close`); continue; }
    out.push({ scope: name + '()', from: open, to: close });
  }
  if (t.block) {
    const at = f.src.indexOf(t.block);
    if (at < 0 || f.src.indexOf(t.block, at + 1) >= 0) problems.push(`${t.file} the block starting "${t.block}", which is ${at < 0 ? 'gone' : 'there more than once'}`);
    else {
      const open = f.code.findIndex(x => x.a >= at && x.v === '{');
      const close = open < 0 ? -1 : matchClose(f.code, open);
      if (close < 0) problems.push(`${t.file} the block starting "${t.block}", which no longer has a { … } after it`);
      else out.push({ scope: t.label || t.block, from: open, to: close });
    }
  }
  if (t.consts) {
    const d = depthMap(f.code);
    for (const name of t.consts) {
      let at = -1;
      for (let i = 1; i + 1 < f.code.length; i++) if (d[i] === 0 && f.code[i].v === name && f.code[i + 1].v === '=' && (f.code[i - 1].v === 'const' || f.code[i - 1].v === ',')) { at = i; break; }
      if (at < 0) { problems.push(`${t.file} the constant ${name}, which is gone`); continue; }
      let e = at + 2; while (e < f.code.length && !(d[e] === 0 && (f.code[e].v === ',' || f.code[e].v === ';'))) e++;
      out.push({ scope: name, from: at + 1, to: e });
    }
  }
  return { ranges: out, problems };
}

/* ── The mistakes in one target ── */
const COMPARE = { '<': '<=', '<=': '<', '>': '>=', '>=': '>', '===': '!==', '!==': '===', '==': '!=', '!=': '==' };
const NO_REMOVE_START = new Set(['if', 'for', 'while', 'else', 'const', 'let', 'var', 'function', 'try', 'catch', 'finally', 'switch', 'case', 'default',
  'break', 'continue', 'do', 'async', 'class', 'console', 'import', 'export']);
function newNumber(text) {
  const clean = text.replace(/_/g, '');
  if (/^0[xXbBoO]|n$/.test(clean)) return null;
  const v = Number(clean);
  if (!Number.isFinite(v)) return null;
  if (Number.isInteger(v) && !/[.eE]/.test(clean)) return String(Math.abs(v) <= 16 ? v + 1 : v * 2);
  return String(Number((v * 1.5).toPrecision(6)));
}
function mistakesIn(f, range, region, target) {
  const out = [];
  const { code, src } = f;
  const isLog = tok => /\bconsole\.(log|warn|error|info|debug)\b/.test(src.slice(f.lineStart(tok.a), f.lineEnd(tok.a)));
  const add = (op, a, b, rep) => out.push({ region: region.name, file: f.file, scope: range.scope, op, a, b, rep, target });
  const lo = range.from + 1, hi = range.to;
  for (let i = lo; i < hi; i++) {
    const t = code[i];
    if (isLog(t)) continue;
    if (t.type === 'punct' && COMPARE[t.v]) add('compare', t.a, t.b, COMPARE[t.v]);
    else if (t.type === 'punct' && (t.v === '&&' || t.v === '||')) add('logic', t.a, t.b, t.v === '&&' ? '||' : '&&');
    else if (t.type === 'num') { const nv = newNumber(t.v); if (nv != null && nv !== t.v) add('number', t.a, t.b, nv); }
    else if (t.type === 'name' && (t.v === 'true' || t.v === 'false')) add('bool', t.a, t.b, t.v === 'true' ? 'false' : 'true');
    else if (f.mode === 'js' && t.type === 'name' && (t.v === 'if' || t.v === 'while') && code[i + 1]?.v === '(') {
      const c = matchClose(code, i + 1);
      if (c > 0 && c < hi) { const a = code[i + 1].b, b = code[c].a; add('negate', a, b, '!(' + src.slice(a, b) + ')'); }
    }
    if (f.mode === 'rules' && t.type === 'name' && (t.v === 'isSchool' || t.v === 'isTeacher') && code[i + 1]?.v === '(' && code[i - 1]?.v !== 'function') add('rules-gate', t.a, t.b, 'isSignedIn');
    /* remove one statement: it starts its line, follows ; { or }, and ends with ; at its own depth within 12 lines */
    if (f.mode === 'js' && i > lo && t.type === 'name' && !NO_REMOVE_START.has(t.v)) {
      const p = code[i - 1];
      if (f.lineOf(p.a) < f.lineOf(t.a) && (p.v === ';' || p.v === '{' || p.v === '}')) {
        let depth = 0, e = -1;
        for (let j = i; j < hi; j++) {
          const v = code[j].type === 'punct' ? code[j].v : '';
          if (v in OPEN) depth++;
          else if (v === ')' || v === ']' || v === '}') { depth--; if (depth < 0) break; }
          else if (v === ';' && depth === 0) { e = j; break; }
        }
        if (e > 0 && f.lineOf(code[e].a) - f.lineOf(t.a) <= 12 && !(t.v === 'return' && e === i + 1 && code[e + 1]?.v === '}' && e + 1 === hi)) {
          const text = src.slice(t.a, code[e].b);
          add('remove', t.a, code[e].b, text.replace(/[^\n]/g, ''));
        }
      }
    }
  }
  if (f.mode === 'rules') {
    /* delete one condition line: a line that starts with && or ||, brackets balanced on it (a trailing ; is kept) */
    const seen = new Set();
    for (let i = lo; i < hi; i++) {
      const t = code[i];
      if (t.type !== 'punct' || (t.v !== '&&' && t.v !== '||')) continue;
      const ls = f.lineStart(t.a), le = f.lineEnd(t.a);
      if (seen.has(ls) || src.slice(ls, t.a).trim() !== '') continue;
      seen.add(ls);
      const lineToks = code.filter(x => x.a >= ls && x.b <= le);
      let bal = 0; for (const x of lineToks) if (x.type === 'punct') { if (x.v in OPEN) bal++; else if (x.v === ')' || x.v === ']' || x.v === '}') bal--; }
      if (bal !== 0) continue;
      const last = lineToks[lineToks.length - 1];
      add('rules-line', ls, le, last && last.v === ';' ? src.slice(ls, t.a) + ';' : '');
    }
  }
  return out;
}

/* ── Ids, the lines a mistake touches, and whether the planted file still parses ── */
const norm = s => s.replace(/\s+/g, ' ').trim();
function describe(f, m) {
  const L0 = f.lineStart(m.a), L1 = f.lineEnd(Math.max(m.a, m.b - 1));
  const before = f.src.slice(L0, L1);
  const after = f.src.slice(L0, m.a) + m.rep + f.src.slice(m.b, L1);
  return { line: f.lineOf(m.a), before, after };
}
const oneLine = s => { const x = s.split('\n').map(l => l.trim()).filter(Boolean).join(' ⏎ '); return x.length > 220 ? x.slice(0, 217) + '…' : (x || '(nothing: the line is gone)'); };
function finishMistakes(f, list) {
  const occ = new Map();
  for (const m of list) {
    const d = describe(f, m);
    m.line = d.line; m.before = oneLine(d.before); m.after = oneLine(d.after);
    const base = [m.file, m.scope, m.op, norm(d.before), norm(d.after)].join('\n');
    const n = occ.get(base) || 0; occ.set(base, n + 1);
    m.id = createHash('sha1').update(base + '\n' + n).digest('hex').slice(0, 10);
  }
  return list;
}
function parses(f, m) {
  if (f.mode !== 'js') return true;
  const text = f.src.slice(0, m.a) + m.rep + f.src.slice(m.b);
  try { new vm.Script(text, { filename: f.file }); return true; } catch { return false; }
}

/* Every mistake of a region (deterministic, in file order), and the table's problems. */
export function regionMistakes(root, region) {
  const all = [], problems = [];
  for (const t of region.targets) {
    const mode = t.rules ? 'rules' : 'js';
    const f = loadFile(root, t.file, mode);
    if (!f) { if (!t.optional) problems.push(`${t.file}, which is gone`); continue; }
    if (!f.balanced) { problems.push(`${t.file}, whose brackets this tool cannot match (its tokenizer lost its place: fix the tokenizer)`); continue; }
    const { ranges, problems: p } = targetRanges(f, t);
    problems.push(...p);
    const list = [];
    const seen = new Set();
    for (const r of ranges) for (const m of mistakesIn(f, r, region, t)) { const k = m.a + ':' + m.b + ':' + m.op; if (!seen.has(k)) { seen.add(k); list.push(m); } }
    list.sort((x, y) => x.a - y.a || x.b - y.b || x.op.localeCompare(y.op));
    if (t.pairWith) pairRules(f, loadFile(root, t.pairWith, 'rules'), list);
    /* paste 2's shared lines are already planted, in both texts, from firestore.rules: keep only its own lines */
    all.push(...finishMistakes(f, t.sharedFromPair ? list.filter(m => !m.pair) : list));
  }
  return { all, problems };
}
/* The two rules texts (firestore.rules and the unpublished paste 2) must stay in step (checks.mjs 1dt compares their
   TEXT), so a mistake in one alone is always caught by that text compare, which says nothing about what the rules
   tests would see. A mistake on a line the two texts share is therefore planted in BOTH (the same line, by its
   position among identical lines), and the emulator tests run on both: what is left to catch it is behaviour. */
function pairRules(f, g, list) {
  if (!g) return;
  const linesOf = h => { const out = []; let at = 0; for (const l of h.src.split('\n')) { out.push({ at, text: l }); at += l.length + 1; } return out; };
  const fl = linesOf(f), gl = linesOf(g);
  for (const m of list) {
    const ls = f.lineStart(m.a), le = f.lineEnd(Math.max(m.a, m.b - 1));
    if (f.src.slice(ls, le).includes('\n')) continue;
    const text = f.src.slice(ls, le);
    const mine = fl.filter(x => x.text === text), theirs = gl.filter(x => x.text === text);
    if (!theirs.length || mine.length !== theirs.length) continue;
    const k = mine.findIndex(x => x.at === ls);
    m.pair = { file: g.file, a: theirs[k].at + (m.a - ls), b: theirs[k].at + (m.b - ls), rep: m.rep };
  }
}

/* For checks.mjs 1ea: every name in the table exists, the tools exist, and the known file parses. */
export function tableProblems(root = REPO) {
  fileCache.clear();
  const out = [];
  for (const r of REGIONS) {
    out.push(...regionMistakes(root, r).problems.map(p => `plant-a-fault's region table names ${p} (region ${r.name})`));
    for (const name of [...r.tools, ...r.targets.flatMap(t => t.tools || [])]) {
      const tool = TOOLS[name];
      if (!tool) { out.push(`plant-a-fault's region table (${r.name}) names the tool "${name}", which TOOLS does not define`); continue; }
      const file = tool.emu || tool.cmd[0];
      if (!existsSync(join(root, file))) out.push(`plant-a-fault's TOOLS names ${file}, which is gone`);
    }
  }
  try { readKnown(root); } catch (e) { out.push(`${KNOWN_FILE} does not parse: ${e.message}`); }
  return out;
}
const KNOWN_CLASSES = new Set(['harmless', 'accepted']);
export function readKnown(root = REPO) {
  const path = join(root, KNOWN_FILE);
  if (!existsSync(path)) return [];
  const j = JSON.parse(readFileSync(path, 'utf8'));
  if (!j || !Array.isArray(j.entries)) throw new Error('no "entries" list');
  const ids = new Set();
  for (const [i, e] of j.entries.entries()) {
    for (const k of ['id', 'region', 'file', 'before', 'after', 'class', 'reason', 'date']) if (typeof e[k] !== 'string' || !e[k]) throw new Error(`entry ${i + 1} has no "${k}"`);
    if (!KNOWN_CLASSES.has(e.class)) throw new Error(`entry ${i + 1} (${e.id}): class "${e.class}" is not harmless or accepted`);
    if (!/^\d{4}-\d\d-\d\d$/.test(e.date)) throw new Error(`entry ${i + 1} (${e.id}): date "${e.date}" is not YYYY-MM-DD`);
    if (ids.has(e.id)) throw new Error(`entry ${i + 1}: id ${e.id} is listed twice`);
    ids.add(e.id);
  }
  return j.entries;
}

/* ── The seeded sample: even over the kinds of mistake, skipping any that would not parse ── */
function prng(text) { let s = createHash('sha256').update(String(text)).digest().readUInt32LE(0); return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function shuffle(a, rnd) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export function sample(root, region, all, k, seed) {
  const groups = OP_ORDER.map(op => shuffle(all.filter(m => m.op === op), prng(`${seed}|${region.name}|${op}`))).filter(g => g.length);
  const out = []; let unparsable = 0;
  while (out.length < k && groups.some(g => g.length)) {
    for (const g of groups) {
      if (out.length >= k) break;
      while (g.length) {
        const m = g.shift();
        if (parses(loadFile(root, m.file, m.target.rules ? 'rules' : 'js'), m)) { out.push(m); break; }
        unparsable++;
      }
    }
  }
  out.sort((x, y) => x.file.localeCompare(y.file) || x.a - y.a || x.op.localeCompare(y.op));
  return { picked: out, unparsable };
}
function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
  const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return `${t.getUTCFullYear()}-W${String(Math.ceil(((t - y0) / 86400000 + 1) / 7)).padStart(2, '0')}`;
}

/* ── Scratch copies of the site ── */
const SKIP_TOP = new Set(['.git', 'node_modules', 'Claude outputs', 'screens', 'song-journey-build', '.DS_Store']);
function makeScratch(root, dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const e of readdirSync(root)) {
    if (SKIP_TOP.has(e)) continue;
    if (e === 'audio') { symlinkSync(join(root, 'audio'), join(dir, 'audio'), 'dir'); continue; }
    cpSync(join(root, e), join(dir, e), { recursive: true, filter: s => { const r = relative(root, s).split('\\').join('/'); return !r.startsWith('.claude/worktrees') && !r.includes('node_modules'); } });
  }
}

/* ── Running one tool ── */
const live = new Set();
function run(cmd, args, cwd, timeoutMs) {
  return new Promise(res => {
    const t0 = Date.now();
    let out = '', done = false, timedOut = false, child;
    const finish = r => { if (done) return; done = true; clearTimeout(timer); live.delete(child); res({ ...r, out, secs: (Date.now() - t0) / 1000, timedOut }); };
    try { child = spawn(cmd, args, { cwd, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' } }); }
    catch (e) { return res({ code: null, startError: e.message, out: '', secs: 0 }); }
    live.add(child);
    const take = c => { out += c.toString('utf8'); if (out.length > 4e6) out = out.slice(-2e6); };
    child.stdout.on('data', take); child.stderr.on('data', take);
    const timer = setTimeout(() => { timedOut = true; killTree(child); }, timeoutMs);
    child.on('error', e => finish({ code: null, startError: e.message }));
    child.on('close', (code, signal) => finish({ code, signal }));
  });
}
function killTree(child) { try { process.kill(-child.pid, 'SIGKILL'); } catch { try { child.kill('SIGKILL'); } catch { /* gone */ } } }
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { for (const c of live) killTree(c); process.exit(130); });
const plain = s => s.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '');
const xLines = (out, tool) => plain(out).split('\n').filter(l => /✗/.test(l) && !(tool.ignore || []).some(r => r.test(l))).map(l => l.replace(/\d+(\.\d+)? ?(s|ms)\b/g, '#').trim());

let emuLock = Promise.resolve();
function withEmuLock(fn) { const p = emuLock.then(fn, fn); emuLock = p.catch(() => {}); return p; }

/* One tool on one scratch copy. mode: 'clean' (records the baseline) or 'mutant'. Returns { verdict, … }:
   verdict 'pass' | 'caught' | 'timeout' | 'refused' | 'skipped' | 'start-failed'. */
async function runTool(name, ctx, scratch, mode, rulesFile) {
  const tool = TOOLS[name];
  const key = name + (tool.emu ? ':' + rulesFile : '');
  const base = ctx.baseline.get(key);
  const timeoutMs = mode === 'clean' ? 30 * 60000 : Math.max(90, 4 * (base?.secs || 60) + 60) * 1000;
  let r;
  if (tool.emu) {
    if (!ctx.emu) return { tool: name, verdict: 'skipped', why: 'no --emu' };
    r = await withEmuLock(async () => {
      copyFileSync(join(scratch, tool.emu), join(ctx.emu, basename(tool.emu)));
      /* Under another name: the emulator watches its own firestore.rules (firebase.json) and would reload it in the
         middle of a test, over the rules the test loaded itself. The tests read the gate from the text, not the name. */
      const planted = 'planted-' + basename(rulesFile);
      copyFileSync(join(scratch, rulesFile), join(ctx.emu, planted));
      /* Empty the emulator first: a test may leave documents behind (pm-rules-test run twice in a row fails 4 cases
         on its own leftovers), and its next run would then "catch" every mistake. The rules tests use project demo-gc. */
      try { await fetch(`http://127.0.0.1:${ctx.emuPort}/emulator/v1/projects/demo-gc/databases/(default)/documents`, { method: 'DELETE' }); }
      catch (e) { return { code: null, startError: `the emulator on port ${ctx.emuPort} does not answer (${e.message}); run under firebase emulators:exec`, out: '', secs: 0 }; }
      const args = [basename(tool.emu), planted, '--port', String(ctx.emuPort)];
      if (tool.site) args.push('--site', scratch);
      return run(process.execPath, args, ctx.emu, timeoutMs);
    });
  } else {
    const args = [join(scratch, tool.cmd[0]), ...tool.cmd.slice(1)];
    if (tool.against) args.push(mode === 'clean' ? `--json=${join(ctx.baseDir, name + '.json')}` : `--against=${join(ctx.baseDir, name + '.json')}`);
    r = await run(process.execPath, args, scratch, timeoutMs);
  }
  const lines = xLines(r.out, tool);
  const res = { tool: name + (tool.emu ? ` (${rulesFile})` : ''), exit: r.code, secs: Math.round(r.secs * 10) / 10 };
  if (r.startError) return { ...res, verdict: 'start-failed', why: r.startError };
  if (r.timedOut) return { ...res, verdict: 'timeout', why: `no result after ${Math.round(timeoutMs / 1000)} s` };
  if (mode === 'clean') {
    const okExit = (tool.cleanExit || [0]).includes(r.code);
    const ignoredOnly = tool.exitOnlyWithoutIgnored && r.code !== 0 && plain(r.out).split('\n').some(l => (tool.ignore || []).some(x => x.test(l))) && !lines.length;
    ctx.baseline.set(key, { secs: r.secs, lines: new Set(lines), count: lines.length });
    if (!okExit && !ignoredOnly) return { ...res, verdict: 'caught', first: lines.slice(0, 6), tail: plain(r.out).trim().split('\n').slice(-12) };
    return { ...res, verdict: 'pass' };
  }
  const fresh = lines.filter(l => !base?.lines.has(l));
  if (tool.against && r.code === 2 && REFUSE_RE.test(r.out)) return { ...res, verdict: 'refused', why: (plain(r.out).split('\n').find(l => REFUSE_RE.test(l)) || '').trim().slice(0, 160) };
  let caught;
  if (tool.diff) caught = fresh.length > 0 || lines.length !== base.count || !(tool.cleanExit || [0]).includes(r.code);
  else if (tool.exitOnlyWithoutIgnored) caught = lines.length > base.count || (r.code !== 0 && !plain(r.out).split('\n').some(l => (tool.ignore || []).some(x => x.test(l))));
  else caught = r.code !== 0 || lines.length > base.count;
  return { ...res, verdict: caught ? 'caught' : 'pass', first: caught ? (fresh.length ? fresh : lines).slice(0, 3) : undefined };
}
const CAUGHT = new Set(['caught', 'timeout']);
const toolsFor = (region, m) => (m.target.tools || region.tools);

/* ── Planting one mistake, running its tools, putting the file back ── */
async function runMistake(m, region, ctx, scratch, allTools) {
  const path = join(scratch, m.file);
  const original = readFileSync(path, 'utf8');
  const f = loadFile(ctx.root, m.file, m.target.rules ? 'rules' : 'js');
  if (original !== f.src) throw new Error(`the scratch copy of ${m.file} is not the site's (a mistake was not put back?)`);
  const planted = [[m.file, original]];
  writeFileSync(path, f.src.slice(0, m.a) + m.rep + f.src.slice(m.b));
  if (m.pair) {
    const g = loadFile(ctx.root, m.pair.file, 'rules');
    planted.push([m.pair.file, g.src]);
    writeFileSync(join(scratch, m.pair.file), g.src.slice(0, m.pair.a) + m.pair.rep + g.src.slice(m.pair.b));
  }
  const results = [];
  try {
    run: for (const name of toolsFor(region, m)) {
      for (const file of TOOLS[name].emu ? planted.map(p => p[0]) : [m.file]) {
        const r = await runTool(name, ctx, scratch, 'mutant', file);
        results.push(r);
        if (r.verdict === 'start-failed') ctx.startFailures.push(`${r.tool}: ${r.why}`);
        if (CAUGHT.has(r.verdict) && !allTools) break run;
      }
    }
  } finally {
    for (const [file, text] of planted) {
      writeFileSync(join(scratch, file), text);
      if (readFileSync(join(scratch, file), 'utf8') !== text) ctx.restoreFailures.push(`${scratch}/${file}`);
    }
  }
  const by = results.find(r => CAUGHT.has(r.verdict));
  return { caught: !!by, caughtBy: by ? by.tool + (by.verdict === 'timeout' ? ' (did not finish: counted as caught)' : '') : null, results };
}

/* ── The report ── */
function report(ctx, regions, outcomes, known, stale, cleanFail, notRunBudget) {
  const L = [];
  const all = outcomes.filter(o => o.res);
  const got = all.filter(o => !o.res.caught);
  const knownById = new Map(known.map(e => [e.id, e]));
  const fresh = got.filter(o => !knownById.has(o.m.id));
  const again = got.filter(o => knownById.has(o.m.id));
  const nowCaught = all.filter(o => o.res.caught && knownById.has(o.m.id));
  L.push(`plant-a-fault · seed ${ctx.seed} · ${ctx.perRegion} per region · regions: ${regions.map(r => r.name).join(', ')}`);
  L.push('');
  for (const c of cleanFail) {
    L.push(`✗ ${c.region}: its tools FAIL ON THE UNMUTATED TREE, so nothing was planted there. Fix the tool or the site first.`);
    for (const r of c.bad) { L.push(`    ${r.tool}: exit ${r.exit}${r.why ? ' (' + r.why + ')' : ''}`); for (const l of (r.first && r.first.length ? r.first : r.tail || []).slice(0, 8)) L.push('      ' + l); }
  }
  if (cleanFail.length) L.push('');
  const caughtN = all.length - got.length;
  if (!fresh.length) L.push(`Planted ${all.length} small mistake${all.length === 1 ? '' : 's'} in the risky code; the tools caught ${caughtN}. Nothing new got through${got.length ? ` (${got.length} that got through were read before: see below)` : ''}.`);
  else L.push(`Planted ${all.length} small mistake${all.length === 1 ? '' : 's'} in the risky code; the tools caught ${caughtN}. ${fresh.length} got through and ${fresh.length === 1 ? 'is' : 'are'} new this week:`);
  fresh.forEach((o, i) => {
    const m = o.m;
    L.push('');
    L.push(` ${i + 1}. [${m.region}] ${m.file}:${m.line} in ${m.scope}: ${OPS[m.op]}${m.pair ? ` (planted in ${m.pair.file} too, the same line)` : ''}`);
    L.push(`      before: ${m.before}`);
    L.push(`      after:  ${m.after}`);
    const ran = o.res.results.map(r => r.tool + (r.verdict === 'refused' ? ' (cannot judge this)' : r.verdict === 'skipped' ? ' (not run: ' + r.why + ')' : '')).join(', ');
    L.push(`      tools run: ${ran}; none caught it`);
    L.push(`      replay: node tools/plant-a-fault.mjs --replay ${m.id}${m.plantSpec ? ` --region ${m.region} --plant '${m.plantSpec}'` : ''}`);
  });
  if (again.length) {
    const by = {}; for (const o of again) { const c = knownById.get(o.m.id).class; by[c] = (by[c] || 0) + 1; }
    L.push('');
    L.push(`Also got through, already read (${KNOWN_FILE}): ${Object.entries(by).map(([c, n]) => `${n} ${c}`).join(', ')}.`);
  }
  for (const o of nowCaught) {
    const e = knownById.get(o.m.id);
    L.push(`Listed as ${e.class} in the known file but CAUGHT this week by ${o.res.caughtBy}: ${o.m.id} (${o.m.file}:${o.m.line}). Read the entry again: a tool sees a difference.`);
  }
  if (stale.length) { L.push(''); L.push(`Stale entries in the known file (the code they name has changed; take them out): ${stale.length}: ${stale.map(e => `${e.id} (${e.file}: ${e.before.slice(0, 60)})`).join('; ')}`); }
  if (notRunBudget) { L.push(''); L.push(`${notRunBudget} sampled mistakes were not planted: the time budget (--budget ${ctx.budgetMin} min) ran out.`); }
  L.push('');
  L.push('By region (caught of planted):');
  for (const r of regions) {
    const os = all.filter(o => o.m.region === r.name);
    if (cleanFail.some(c => c.region === r.name)) { L.push(`  ${r.name.padEnd(15)} not run: its tools fail on the unmutated tree`); continue; }
    const g = os.filter(o => !o.res.caught), n = g.filter(o => !knownById.has(o.m.id)).length;
    const mins = ctx.regionSecs[r.name] ? ` · ${(ctx.regionSecs[r.name] / 60).toFixed(1)} min` : '';
    L.push(`  ${r.name.padEnd(15)} ${String(os.length - g.length).padStart(3)} of ${String(os.length).padEnd(3)}${g.length ? ` (${g.length} got through: ${n} new, ${g.length - n} known)` : ''}${mins}`);
  }
  /* A tool that fails the same way on every mistake is failing on something else (left-over state, a clock): its
     catches mean nothing. Seen once (pm-rules-test on an emulator it had already written to). */
  for (const r of regions) {
    const firsts = all.filter(o => o.m.region === r.name && o.res.caught).map(o => { const c = o.res.results.find(x => CAUGHT.has(x.verdict)); return c.tool + ' ' + (c.first || []).join(' | '); });
    if (firsts.length >= 5 && firsts.every(x => x === firsts[0])) L.push(`! ${r.name}: all ${firsts.length} catches are the same tool failing the same way (${firsts[0].slice(0, 160)}): read one with --replay before trusting them.`);
  }
  const notRun = [...new Set(regions.flatMap(r => r.notRun || []))];
  if (notRun.length) L.push(`Not exercised (browser tools are not in the weekly run): ${notRun.join(', ')}.`);
  if (regions.some(r => r.name === 'rules') && !ctx.emu) L.push('Not exercised: the rules tests on the Firestore emulator (no --emu): only the Node tools and checks.mjs judged the rules.');
  for (const s of ctx.startFailures) L.push(`✗ a tool could not be started: ${s}`);
  for (const s of ctx.restoreFailures) L.push(`✗ a planted file could not be put back: ${s}`);
  L.push('');
  const problems = cleanFail.length + ctx.startFailures.length + ctx.restoreFailures.length;
  L.push(`plant-a-fault: ${all.length} planted, ${caughtN} caught, ${fresh.length} new got through, ${again.length} known got through, ${stale.length} stale` +
    (problems ? `, ${cleanFail.length} region(s) failing on the clean tree, ${ctx.startFailures.length + ctx.restoreFailures.length} tool problem(s)` : '') + ` · seed ${ctx.seed}`);
  return { text: L.join('\n'), fresh, problems };
}

/* ── Main ── */
async function main() {
  const argv = process.argv.slice(2);
  const val = n => { const i = argv.indexOf(n); if (i < 0) return null; const v = argv[i + 1]; if (v == null || v.startsWith('--')) bad(`${n} needs a value`); return v; };
  const bad = m => { console.error('plant-a-fault: ' + m); process.exit(2); };
  const KNOWN_FLAGS = new Set(['--seed', '--per-region', '--region', '--list', '--replay', '--no-run', '--plant', '--jobs', '--max-load', '--budget', '--all-tools', '--emu', '--emu-port', '--root', '--scratch', '--keep', '--json', '--md', '--help']);
  for (const a of argv) if (a.startsWith('--') && !KNOWN_FLAGS.has(a)) bad(`unknown option ${a} (see the header of tools/plant-a-fault.mjs)`);
  if (argv.includes('--help')) { console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0]); return 0; }
  const root = resolve(val('--root') || REPO);
  const seed = val('--seed') || isoWeek();
  const perRegion = +(val('--per-region') || 20);
  if (!(perRegion > 0)) bad('--per-region takes a positive number');
  const jobs = +(val('--jobs') || 2), maxLoad = +(val('--max-load') || 8), budgetMin = val('--budget') == null ? 0 : +val('--budget');
  const regionNames = val('--region') ? val('--region').split(',') : null;
  for (const n of regionNames || []) if (!REGIONS.some(r => r.name === n)) bad(`no region "${n}" (regions: ${REGIONS.map(r => r.name).join(', ')})`);
  const regions = REGIONS.filter(r => !regionNames || regionNames.includes(r.name));
  const emu = val('--emu') ? resolve(val('--emu')) : null;
  if (emu && !existsSync(join(emu, 'node_modules', '@firebase', 'rules-unit-testing'))) bad(`--emu ${emu} has no node_modules/@firebase/rules-unit-testing (the rules tests' packages: see the header of tools/rules-core-test.mjs)`);
  const ctx = { root, seed, perRegion, emu, emuPort: +(val('--emu-port') || 8089), baseline: new Map(), startFailures: [], restoreFailures: [], regionSecs: {}, budgetMin };

  /* every mistake of every region in the run */
  const table = [];
  for (const r of regions) { const { all, problems } = regionMistakes(root, r); if (problems.length) { for (const p of problems) console.error(`✗ plant-a-fault's region table names ${p} (region ${r.name})`); return 1; } table.push({ region: r, all }); }

  /* the hand-made mistake (--plant "file|old|new") */
  const plantSpec = val('--plant');
  if (plantSpec) {
    if (!regionNames || regionNames.length !== 1) bad('--plant needs exactly one --region');
    const [file, old, neu] = plantSpec.split('|');
    if (file == null || old == null || neu == null) bad('--plant takes "file|old text|new text"');
    const r = regions[0];
    const target = r.targets.find(t => t.file === file);
    if (!target) bad(`--plant: ${file} is not a file of region ${r.name}`);
    const f = loadFile(root, file, target.rules ? 'rules' : 'js');
    const at = f.src.indexOf(old);
    if (at < 0 || f.src.indexOf(old, at + 1) >= 0) bad(`--plant: "${old}" must occur exactly once in ${file} (found ${at < 0 ? 0 : 'more than 1'})`);
    const m = finishMistakes(f, [{ region: r.name, file, scope: '(hand-made)', op: 'plant', a: at, b: at + old.length, rep: neu, target }])[0];
    m.plantSpec = plantSpec; table[0].all = [m]; table[0].plant = true;
  }

  /* --replay: find the mistake in any region */
  const replayId = val('--replay');
  if (replayId) {
    let hit = null, hitRegion = null;
    for (const r of REGIONS) { const { all } = regionMistakes(root, r); const m = all.find(x => x.id === replayId); if (m) { hit = m; hitRegion = r; break; } }
    if (!hit && plantSpec && table[0].all[0].id === replayId) { hit = table[0].all[0]; hitRegion = regions[0]; }
    if (!hit) bad(`no mistake has the id ${replayId} in today's code (the code may have changed: run --list with the seed that found it)`);
    const scratch = resolve(val('--scratch') || join(tmpdir(), 'plant-a-fault'), 'replay-' + replayId);
    makeScratch(root, scratch);
    const f = loadFile(root, hit.file, hit.target.rules ? 'rules' : 'js');
    writeFileSync(join(scratch, hit.file), f.src.slice(0, hit.a) + hit.rep + f.src.slice(hit.b));
    writeFileSync(join(scratch, 'PLANTED.txt'), `plant-a-fault ${hit.id} (${hitRegion.name})\n${hit.file}:${hit.line} in ${hit.scope}: ${OPS[hit.op]}\nbefore: ${hit.before}\nafter:  ${hit.after}\n`);
    console.log(`Planted ${hit.id} in a copy of the site: ${scratch}`);
    console.log(`  ${hit.file}:${hit.line} in ${hit.scope}: ${OPS[hit.op]}`);
    console.log(`  before: ${hit.before}`);
    console.log(`  after:  ${hit.after}`);
    const tools = toolsFor(hitRegion, hit);
    console.log(`Its region's tools: ${tools.join(', ')}. Run one there as: cd ${scratch} && node ${(TOOLS[tools[0]].cmd || [TOOLS[tools[0]].emu]).join(' ')}`);
    if (argv.includes('--no-run')) return 0;
    const clean = resolve(scratch + '-clean');
    makeScratch(root, clean);
    ctx.baseDir = join(clean, '.plant-a-fault-baseline'); mkdirSync(ctx.baseDir, { recursive: true });
    for (const name of tools) {
      const c = await runTool(name, ctx, clean, 'clean', hit.file);
      if (c.verdict !== 'pass') { console.log(`  ${name}: fails on the UNMUTATED copy too (exit ${c.exit}): its verdict means nothing`); continue; }
      const r = await runTool(name, ctx, scratch, 'mutant', hit.file);
      console.log(`  ${r.tool}: ${r.verdict === 'caught' ? 'CAUGHT it' : r.verdict === 'timeout' ? 'did not finish (counted as caught)' : r.verdict === 'refused' ? 'cannot judge this (' + r.why + ')' : r.verdict === 'skipped' ? 'not run (' + r.why + ')' : 'passed: did not catch it'} (exit ${r.exit}, ${r.secs} s)${r.first ? '\n      ' + r.first.join('\n      ') : ''}`);
    }
    rmSync(clean, { recursive: true, force: true });
    console.log(`The copy is left at ${scratch} (delete it when done).`);
    return 0;
  }

  /* the sample */
  const plan = [];
  for (const { region, all, plant } of table) {
    const s = plant ? { picked: all, unparsable: 0 } : sample(root, region, all, perRegion, seed);
    plan.push({ region, all, picked: s.picked, unparsable: s.unparsable });
  }
  if (argv.includes('--list')) {
    console.log(`plant-a-fault --list · seed ${seed} · ${perRegion} per region`);
    for (const p of plan) {
      const byOp = {}; for (const m of p.all) byOp[m.op] = (byOp[m.op] || 0) + 1;
      console.log(`\n${p.region.name}: ${p.all.length} possible mistakes (${Object.entries(byOp).map(([k, v]) => `${v} ${k}`).join(', ')}); ${p.picked.length} picked${p.unparsable ? `, ${p.unparsable} skipped (would not parse)` : ''}; tools: ${[...new Set(p.region.targets.flatMap(t => t.tools || []).concat(p.region.tools))].join(', ')}`);
      for (const m of p.picked) console.log(`  ${m.id}  ${m.file}:${m.line} ${m.scope} · ${m.op}${m.pair ? ' · in ' + m.pair.file + ' too' : ''}\n      - ${m.before}\n      + ${m.after}`);
    }
    return 0;
  }

  /* the known file */
  let known;
  try { known = readKnown(root); } catch (e) { console.error(`✗ ${KNOWN_FILE} does not parse: ${e.message}`); return 1; }
  const runRegions = new Set(regions.map(r => r.name));
  const allIds = new Set(plan.flatMap(p => p.all.map(m => m.id)));
  const stale = plantSpec ? [] : known.filter(e => runRegions.has(e.region) && !allIds.has(e.id));

  /* scratch copies */
  const scratchBase = val('--scratch') ? resolve(val('--scratch')) : mkdtempSync(join(tmpdir(), 'plant-a-fault-'));
  mkdirSync(scratchBase, { recursive: true });
  ctx.baseDir = join(scratchBase, 'baseline'); mkdirSync(ctx.baseDir, { recursive: true });
  const workers = Array.from({ length: Math.max(1, jobs) }, (_, i) => join(scratchBase, 'copy-' + (i + 1)));
  for (const w of workers) makeScratch(root, w);
  const t0 = Date.now();
  const cleanFail = [], outcomes = [];
  const jsonOut = val('--json');
  const writeJson = () => { if (jsonOut) writeFileSync(jsonOut, JSON.stringify({ seed, perRegion, regionSecs: ctx.regionSecs, cleanFail, stale,
    mistakes: outcomes.map(o => ({ id: o.m.id, region: o.m.region, file: o.m.file, line: o.m.line, scope: o.m.scope, op: o.m.op, before: o.m.before, after: o.m.after,
      pair: o.m.pair ? o.m.pair.file : null, caught: o.res.caught, caughtBy: o.res.caughtBy, known: (known.find(e => e.id === o.m.id) || {}).class || null, results: o.res.results })) }, null, 1)); };
  let notRunBudget = 0;
  const log = s => process.stderr.write(s + '\n');

  for (const p of plan) {
    const r = p.region, rt0 = Date.now();
    /* 1. every tool of the region on the clean copy (each tool once per run; a rules test once per rules text) */
    const needs = [];
    for (const t of r.targets) for (const name of (t.tools || r.tools)) { const key = name + (TOOLS[name].emu ? ':' + t.file : ''); if (!needs.some(n => n.key === key) && !(t.optional && !existsSync(join(root, t.file)))) needs.push({ name, key, file: t.file }); }
    const bad = [];
    const q = needs.filter(n => !ctx.baseline.has(n.key));
    await Promise.all(workers.map(async w => { while (q.length) { const n = q.shift(); const c = await runTool(n.name, ctx, w, 'clean', n.file); log(`  clean ${r.name}: ${c.tool} ${c.verdict === 'pass' ? 'passes' : c.verdict === 'caught' ? 'FAILS' : c.verdict} (${c.secs} s)`); if (c.verdict !== 'pass' && c.verdict !== 'skipped') bad.push(c); if (c.verdict === 'start-failed') ctx.startFailures.push(`${c.tool}: ${c.why}`); } }));
    if (bad.length) { cleanFail.push({ region: r.name, bad }); ctx.regionSecs[r.name] = (Date.now() - rt0) / 1000; continue; }
    /* 2. the mistakes, a few at a time */
    const queue = [...p.picked];
    let done = 0;
    const emuOnly = p.picked.length && p.picked.every(m => toolsFor(r, m).some(n => TOOLS[n].emu));
    const ws = emuOnly && ctx.emu ? workers.slice(0, Math.min(workers.length, 2)) : workers;
    await Promise.all(ws.map(async w => {
      while (queue.length) {
        if (budgetMin && (Date.now() - t0) / 60000 > budgetMin) { notRunBudget += queue.length; queue.length = 0; break; }
        while (loadavg()[0] > maxLoad) await new Promise(res => setTimeout(res, 5000));
        const m = queue.shift();
        const res = await runMistake(m, r, ctx, w, argv.includes('--all-tools'));
        outcomes.push({ m, res });
        done++;
        log(`  [${r.name} ${done}/${p.picked.length}] ${m.id} ${m.file}:${m.line} ${m.op}: ${res.caught ? 'caught by ' + res.caughtBy : 'GOT THROUGH'} (${res.results.map(x => x.tool + ' ' + x.secs + 's').join(', ')})`);
      }
    }));
    ctx.regionSecs[r.name] = (Date.now() - rt0) / 1000;
    log(`  region ${r.name} done in ${(ctx.regionSecs[r.name] / 60).toFixed(1)} min`);
    writeJson();
  }
  outcomes.sort((x, y) => REGIONS.findIndex(r => r.name === x.m.region) - REGIONS.findIndex(r => r.name === y.m.region) || x.m.file.localeCompare(y.m.file) || x.m.a - y.m.a);
  const rep = report(ctx, regions, outcomes, known, stale, cleanFail, notRunBudget);
  console.log(rep.text);
  writeJson();
  const md = '```\n' + rep.text + '\n```\n';
  if (val('--md')) writeFileSync(val('--md'), md);
  if (process.env.GITHUB_STEP_SUMMARY) { try { appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### Plant a fault: ${regions.map(r => r.name).join(', ')}\n\n` + md); } catch { /* best effort */ } }
  if (!argv.includes('--keep') && !val('--scratch')) rmSync(scratchBase, { recursive: true, force: true });
  else if (!argv.includes('--keep')) for (const w of workers) rmSync(w, { recursive: true, force: true });
  return rep.problems ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then(code => process.exit(code), e => { console.error('plant-a-fault: the tool itself failed: ' + (e && e.stack || e)); process.exit(2); });
}
