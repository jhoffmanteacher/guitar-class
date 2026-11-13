#!/usr/bin/env node
/* Golden snapshot: what the site SHOWS and what it SAVES (2026-11-11; rebuilt 2026-11-13 after its second review).

   Part of the whole-site rebuild plan (todo.md). checks.mjs reads source text
   and smoke.mjs looks for errors; neither can say "the rebuilt site behaves
   like the old one". This tool can. It boots a site folder in headless Chrome
   at 1366x657 with a fixed clock and a seeded Math.random, signs in through
   the dev bypass, and writes to a folder:

     data/        SETS, CLASS_ACTIVITIES and MODULE_MANIFEST as the browser holds them,
                  and the files the rebuild leaves alone, byte for byte (files/)
     dom/<lang>/  every set and Module Review panel and the left rail, each reached the
                  way a student gets there: a covering page (Songs, My progress or In
                  class) is opened by its rail button, the module is picked in the rail's
                  list and the set by its rail button (Module Review: the rail's review
                  row), so a rail button that no longer closes the page over the set is
                  caught (review R2-5). Also the Songs / In class / My progress / Games
                  screens (opened by their rail buttons), every game's first screen and
                  every In-Class Activity card with each of its steps
     nav/         every step list's Next / Back / One step / All steps walk
     keys/        for every set: every control that saves something is really used and
                  what it writes is recorded; then the "filled" state (filled/): every
                  on/off control left on, each set redrawn and recorded again
     gates/       the gates for a student who is not the dev user, at seven stages of a
                  year (two of them with ticked STEPS only, no skills: review R2-5); the
                  rail of four modules; a locked set asked for from ANOTHER set, by a
                  direct call (a deep link or the resume card) and by its rail button
     save/        what reaches the (stub) server after each of 15 student actions: ticks,
                  a skill, a rating, quiz answers, a clean rep, a Module Review, a typed
                  answer, a Module Review reflection, an activity step ticked and
                  unticked, a class period picked (review R2-4)
     play/        every game PLAYED (review R2-1), and the Listening Coach (melody and
                  chords), with a fake microphone and a fake clock: see "The games" below
     pages/<lang>/ the pages that open on their own (tabs/*.html, the Tuning Simulator,
                  the mood chart, 404)
     tools/<lang>/ the floating tools: metronome (each meter, the tempo ladder), timer
                  (each preset), recorder popup, each opened by a real click
     livequiz/    the live quiz with a made-up game: the student screen (EN + ES, opened
                  through its # link, #live-quiz) in every state, and the projector stage
     console/     the teacher console against the fake class of tools/console-layout-smoke.mjs
                  (30 made-up students): every view, every activity's tabs, three
                  students; what each Settings control writes (writes.json); and the
                  Arrange board driven for real (board.json, review R2-1): bump down and
                  up, move to a number, Move to another unit, drag onto a card, drag to
                  Built, Un-assign, hide and show a unit, rename and undo, the Who
                  picker and back to the whole class, Play Along now and on its date
     shots/       with --shots: PNGs of the sets, the filled sets, the screens, the
                  games (first screen and end), the activities, the pages, the tools, the
                  live quiz and the console
     dialogs/     every dialog that was open where a set was reached or a picture was due (its HTML;
                  dialogs.json lists them), recorded and then closed by Escape or its close button
     errors.json  every exception, console error or failed step met on the way
     failures.json the tool's own checks that failed (see "The run fails when")

   Usage:
     node tools/golden.mjs --out <dir>                snapshot this checkout
     node tools/golden.mjs --out <dir> --root <site>  snapshot another site folder
     node tools/golden.mjs --compare <dirA> <dirB>    exit 0 only if they are identical
     --en-only          English only
     --only <parts>     comma-separated: data, sets, keys, gates, save, screens, games, play,
                        activities, pages, console, tools, livequiz (snapshot one area while
                        iterating; a compare says PARTIAL)
     --shots            also write the PNGs
     --chrome <path>    Chrome/Chromium binary (or CHROME=...)
     --coverage <file>  also write which top-level functions of every part ran (Chrome's
                        precise coverage), as JSON, to <file> (outside the snapshot)
     --stall <s>        the watchdog (review R2-6): stop if no step starts, or the page does
                        not answer one call, for this many seconds (default 180)
     --timeout <min>    stop if the whole run passes this many minutes (default 150)

   Exit codes: 0 the snapshot is written and passed its own checks; 1 it is written but
   failed its own checks (failures.json; a compare refuses it); 2 could not run; 3 HUNG
   (the watchdog stopped it: "golden: ✗ HUNG … Stuck at <step>"; its Chrome is killed).

   The run fails (exit 1) when:
     - a recorded screen is not on screen: its root element (or a parent) has `hidden`, it
       draws with no size, it lies outside the window or another element covers its centre
       (review R2-2). A set picture is only taken once the set's panel is the active one and
       no page covers it; a dialog still open after Escape and its close button fails too;
     - two pictures that must differ are byte-identical (two sets, two filled sets, two live
       quiz screens, two activities, two games' first screens or end screens, two screens, two
       console views);
     - a listed write finds no control ("no such control"), in save/, console/writes.json and
       console/board.json (review R2-4), or a step of the tool itself fails (step-failed);
     - a navigation does not land (the set, the covering page, the live quiz screen).

   Determinism (review R2-3): a fixed clock (Wednesday 2026-11-11 10:00 in Los Angeles,
   whatever the machine's own zone); Math.random seeded per caller; the module files run
   in the order they were asked for, one at a time (a page script holds each module-N.js
   <script> tag until the one before it has run: SETS used to fill in network arrival order,
   which moved the Daily Review picks from run to run); the boot waits for the whole
   catalogue (_bootCatchUp) before it records anything; the scroll position is set before
   every picture (the top, or the open card at the top).

   The games (play/). A page script replaces, for that pass only: setTimeout, setInterval,
   requestAnimationFrame, requestIdleCallback and performance.now (a virtual clock the tool
   moves by hand, 30 frames a second; Date moves with it); AudioContext (a fake one whose
   analyser hands out a fixed recording, below; every sound the site plays is silent, and a
   recorded guitar note never loads, so playNote always uses its synthesized pluck);
   getUserMedia (always yes); MediaRecorder; media play(). The fixed recording: from 1 s after
   the microphone opens, every 0.55 s a plucked string or a strummed chord (E2 A2 D3 G3 B3 E4,
   E5 and A5 power chords, G, C and Em chords, then a rest), each a sum of three harmonics
   dying away in about 0.2 s, plus a faint fixed hiss. The same samples on every run.
   Each game: its card on the Games screen is clicked; its first screen is recorded; then a
   fixed student: until the game has started, a Start-like button (…Start(, …PlayAdaptive(,
   …GoReady(, …Spin() is pressed, or else the first non-exit button (at most 4 times); once
   started, a Start-like button again when the panel did not change for a second (Riff
   Roulette's card after its spin, Simon's Play again), else every other second the next
   answer-type button in turn (never an exit, Finish, Skip, Again, setup or setting button:
   a level, a deck, a tempo nudge). One tick is one virtual second, at most 60; the game ends
   early when an Again button shows. Recorded: every click with its virtual time, a
   fingerprint of the game panel after every second, the panel at the end, and what the game
   wrote to the student's `games` map and to the (stub) server. The Listening Coach: the first
   melody and the first chord Coach button in course order that shows with the lesson on
   "All steps" (its step opened by its head when closed), Start pressed, up to 60 s, the
   report recorded.
   Games LEFT OUT: Tuning Simulator (a page of its own, tuning-sim.html: its first screen is
   recorded under pages/, but nothing is played: it is driven by dragging tuning pegs, which
   this student does not do). No other game is left out; the run prints the list it played.
   Limits of the games pass (stated, not hidden): the student is fixed and simple. It does
   not play the notes a game asks for (its input is the same whatever the game asks), it
   does not press keys (Strum Hero's taps are keys or pointer presses on its lane), and it
   presses buttons by position, so a game whose answer buttons are reordered by a refactor
   (not by its data) shows as a difference. Its sounds are fake: a game that waits on a real
   audio 'ended' event gets it at the fake clock's time of the scheduled stop.

   THE CONTRACT: what a rebuild must keep for this tool to run on it.
   1. The rendered HTML itself. Every recorded view is compared byte for byte,
      so every class name, id, data- attribute and inline handler string
      (onclick="toggleStepDone(this,'w1-b-sec0-0')") is frozen with it.
   2. The page hooks the tool finds things by: .week-panel[data-id], .week-panel.active,
      .dp, li.step(.collapsed), .step-label, .stp-part-go, #nav-rail, #module-select,
      #week-pills .wpill[data-id], #rail-review-btn, #songs-hub-btn, #my-progress-btn,
      #class-activities-btn, #games-btn, #songs-screen, #class-activities-screen,
      #my-progress-screen, #games-screen, #search-panel, #games-panel, the hub cards
      [onclick="gamesShow('<key>')"], .main (the scrolling pane), .daily5-overlay,
      .tp-close, .ca-card[open], textarea.step-resp-input, textarea.reflection-ta,
      #period-btn-4, #fab-group, #fab-metro, #fab-timer, #fab-rec,
      #metro-popup [id^=meter-], #ladder-toggle, #timer-presets [id^=tp-],
      #live-quiz-screen, .lq-shell, #teacher-app, #t-side [data-view],
      #t-grid-container [data-ta-list], [data-ta-filter], [data-ta-pick], [data-ta-tab],
      [data-ta-detail], [data-open-student][data-uid], the [data-set-activity-*] /
      [data-publish-activity] / [data-unassign-activity] / [data-delete-activity]
      controls, the board's [data-ta-board-open], [data-ta-board-back],
      [data-board-section], [data-board-built], [data-board-card], [data-board-bump],
      [data-board-number], [data-move-activity], [data-set-module-hidden],
      [data-rename-activity], .t-act-title-edit, [data-rename-save], [data-rename-reset],
      [data-board-who], [data-set-activity-student], [data-activity-whole-class],
      [data-set-activity-playalong], the inline handler names in WRITERS and
      CA_WRITERS and stationStepNav, coachStartCheck(, and the localStorage key gc-lang.
   3. Names reachable from the page's global scope as classic-script globals
      (the state names are ASSIGNED to, bare):
      functions   devBypass, setLang, onModuleChange, activateSet,
                  ensureCoachJs, openSongsScreen, openClassActivitiesScreen,
                  openMyProgressScreen, openGamesScreen, gamesShow, caFocusActivity,
                  caFocusGo, setStationView, flushSave, isSetLocked, isSetComplete,
                  isModuleGateLocked, isModuleReviewLocked, classOpenThrough,
                  isGatePreviewer (replaced), maybeShowPeriodPicker, coachBody,
                  ensureTeacherJs, showTeacherApp, dayStr, lqQuiz, lqType,
                  lqTargetNotes, lqTargetIds, lqFretId, lqPcNamePool, lqPcNameOf,
                  lqPcNames, lqRenderStudent, lqPaintStage, lqPaintControls
      data        SETS, CLASS_ACTIVITIES, MODULE_MANIFEST, GAMES_META,
                  LIVE_QUIZZES, TEACHER_EMAIL
      state       completed, progress, responses, caStepDone, classActivities,
                  exitChecks, practiceLog, games, streak, currentUser, db,
                  ensureDb, firebase, studentPeriod, coach, _bootCatchUp, lqSession,
                  lqMyAnswer, lqTSession, lqTAnswers
   The code behind all of that is free.

   No network: Chrome is started so that only 127.0.0.1 resolves. What the
   site draws must not depend on whether Google's servers answered.

   Like smoke.mjs: Node 22+, Chrome or Chromium, no other dependency; one headless-Chrome
   run at a time (never beside smoke.mjs, pm-e2e.mjs, slow-load.mjs or another golden run). */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { inflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, statSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir, platform } from 'node:os';
import { join, extname, normalize, resolve, dirname, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ALL_PARTS = ['data', 'sets', 'keys', 'gates', 'save', 'screens', 'games', 'play', 'activities', 'pages', 'console', 'tools', 'livequiz'];
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* ── compare ─────────────────────────────────────────────────────────── */
function listFiles(dir, base = dir) {
  const out = [];
  for (const n of readdirSync(dir).sort()) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) out.push(...listFiles(f, base)); else out.push(relative(base, f));
  }
  return out;
}
/* Two screenshots of the same view are not always the same bytes: Chrome draws the soft edge of a letter one
   colour step lighter or darker from run to run (measured 2026-11-11: 13 to 23 pixels of 897,000, each by 1 of
   255, on four pictures of an unchanged site). Such a pair counts as the same picture: at most NOISE_PIXELS
   pixels differ and none by more than NOISE_STEP. A real change is far outside that: one shade on a background
   colour moves tens of thousands of pixels; a moved or reworded line moves thousands by large steps. The count
   of pictures accepted this way is printed, never hidden. */
const NOISE_PIXELS = 100, NOISE_STEP = 2;
function decodePng(b) {
  let p = 8, w = 0, h = 0, bd = 0, ct = 0; const idat = [];
  while (p < b.length) { const len = b.readUInt32BE(p), type = b.toString('ascii', p + 4, p + 8), data = b.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bd = data[8]; ct = data[9]; } else if (type === 'IDAT') idat.push(data); p += 12 + len; }
  const ch = ct === 6 ? 4 : ct === 2 ? 3 : ct === 0 ? 1 : ct === 4 ? 2 : 0;
  if (!ch || bd !== 8) throw new Error(`a PNG of colour type ${ct}, depth ${bd} is not one this tool reads`);
  const raw = inflateSync(Buffer.concat(idat)), stride = w * ch, out = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) { const f = raw[y * (stride + 1)], row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) { const l = x >= ch ? out[y * stride + x - ch] : 0, u = y ? out[(y - 1) * stride + x] : 0, c = (x >= ch && y) ? out[(y - 1) * stride + x - ch] : 0; let v = row[x];
      if (f === 1) v += l; else if (f === 2) v += u; else if (f === 3) v += (l + u) >> 1; else if (f === 4) { const pp = l + u - c, pa = Math.abs(pp - l), pb = Math.abs(pp - u), pc = Math.abs(pp - c); v += (pa <= pb && pa <= pc) ? l : (pb <= pc ? u : c); }
      out[y * stride + x] = v & 255; } }
  return { w, h, ch, out };
}
// How two pictures differ: { pixels, step, box } or { sizes } when they are not the same size, or { unreadable }.
function pictureDiff(x, y) {
  let A, B; try { A = decodePng(x); B = decodePng(y); } catch (e) { return { unreadable: e.message }; }
  if (A.w !== B.w || A.h !== B.h) return { sizes: `${A.w}x${A.h} and ${B.w}x${B.h}` };
  const n = Math.min(A.ch, B.ch, 3); let pixels = 0, step = 0, x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  for (let py = 0; py < A.h; py++) for (let px = 0; px < A.w; px++) { let d = 0; for (let c = 0; c < n; c++) d = Math.max(d, Math.abs(A.out[(py * A.w + px) * A.ch + c] - B.out[(py * B.w + px) * B.ch + c]));
    if (d) { pixels++; if (d > step) step = d; if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; } }
  return { pixels, step, total: A.w * A.h, box: pixels ? `x ${x0}-${x1}, y ${y0}-${y1}` : '' };
}

function compare(a, b) {
  /* A snapshot that stopped half way, or two snapshots of different parts, must never earn a green tick
     (review R1-10). meta.json is written last, so a folder without one is an unfinished run. */
  const meta = d => { try { return JSON.parse(readFileSync(join(d, 'meta.json'), 'utf8')); } catch { return null; } };
  const ma = meta(a), mb = meta(b);
  if (!ma || !mb) { console.log(`golden: ✗ ${!ma ? a : b} has no meta.json: that snapshot did not finish, so there is nothing to compare`); return 1; }
  const shape = m => JSON.stringify({ parts: m.parts, langs: m.langs, shots: !!m.shots });
  if (shape(ma) !== shape(mb)) { console.log(`golden: ✗ the two snapshots were not taken the same way: A ${shape(ma)}, B ${shape(mb)}`); return 1; }
  if (ma.tool !== mb.tool) { console.log(`golden: ✗ the two snapshots were taken by different versions of this tool (A ${ma.tool || 'before 2026-11-13'}, B ${mb.tool || 'before 2026-11-13'}): take both again with one`); return 1; }
  const partial = [ALL_PARTS.filter(p => !ma.parts.includes(p)).map(p => 'no ' + p), ma.langs.length < 2 ? ['English only'] : [], ma.shots ? [] : ['no screenshots']].flat();
  const A = listFiles(a).filter(f => f !== 'meta.json'), B = listFiles(b).filter(f => f !== 'meta.json'), setB = new Set(B), setA = new Set(A);
  const onlyA = A.filter(f => !setB.has(f)), onlyB = B.filter(f => !setA.has(f)), diff = [];
  let same = 0; const noise = [];
  for (const f of A) {
    if (!setB.has(f)) continue;
    const x = readFileSync(join(a, f)), y = readFileSync(join(b, f));
    if (x.equals(y)) { same++; continue; }
    let where = '';
    if (f.endsWith('.png')) {
      const d = pictureDiff(x, y);
      if (d.pixels !== undefined && d.pixels <= NOISE_PIXELS && d.step <= NOISE_STEP) { same++; noise.push(`${f} (${d.pixels} pixel${d.pixels === 1 ? '' : 's'} by ${d.step}/255)`); continue; }
      where = d.unreadable ? `could not be read as a picture: ${d.unreadable}` : d.sizes ? `the two pictures are not the same size: ${d.sizes}` : `${d.pixels} of ${d.total} pixels differ, by up to ${d.step}/255, inside ${d.box}`;
    } else {
      const lx = x.toString('utf8').split('\n'), ly = y.toString('utf8').split('\n');
      let i = 0; while (i < lx.length && i < ly.length && lx[i] === ly[i]) i++;
      let n = 0; for (let j = 0; j < Math.max(lx.length, ly.length); j++) if (lx[j] !== ly[j]) n++;
      where = `first at line ${i + 1} (${n} line(s) differ)\n      A: ${(lx[i] ?? '(end of file)').slice(0, 200)}\n      B: ${(ly[i] ?? '(end of file)').slice(0, 200)}`;
    }
    diff.push({ f, where });
  }
  console.log(`golden: ${A.length} files in A, ${B.length} in B: ${same} identical, ${diff.length} different, ${onlyA.length} only in A, ${onlyB.length} only in B`);
  if (noise.length) { console.log(`golden: of the identical, ${noise.length} picture${noise.length === 1 ? ' is' : 's are'} the same within drawing noise (at most ${NOISE_PIXELS} pixels, each by at most ${NOISE_STEP}/255):`); for (const n of noise.slice(0, 30)) console.log(`  noise:     ${n}`); if (noise.length > 30) console.log(`  ... and ${noise.length - 30} more`); }
  for (const f of onlyA.slice(0, 30)) console.log(`  only in A: ${f}`);
  for (const f of onlyB.slice(0, 30)) console.log(`  only in B: ${f}`);
  for (const d of diff.slice(0, 40)) console.log(`  differs:   ${d.f}${d.where ? '\n      ' + d.where : ''}`);
  if (diff.length > 40) console.log(`  ... and ${diff.length - 40} more`);
  if (!A.length || !B.length) { console.log('golden: ✗ an empty snapshot proves nothing: one of the two folders holds no files'); return 1; }
  // A snapshot that failed its own checks (a hidden screen, a missing control, two sets drawn alike) proves nothing, whatever the files say.
  const own = [['A', a, ma], ['B', b, mb]].filter(([, , m]) => m.failures);
  for (const [w, d, m] of own) {
    console.log(`golden: ✗ snapshot ${w} failed ${m.failures} of its own checks (${join(d, 'failures.json')}):`);
    let list = []; try { list = JSON.parse(readFileSync(join(d, 'failures.json'), 'utf8')); } catch { /* listed in the count */ }
    for (const f of list.slice(0, 15)) console.log(`  ${w} failed: ${f.step}: ${String(f.text).slice(0, 220)}`);
    if (list.length > 15) console.log(`  ... and ${list.length - 15} more`);
  }
  const bad = diff.length + onlyA.length + onlyB.length;
  console.log(bad ? `golden: ✗ the two snapshots differ in ${bad} file(s)` : own.length ? `golden: ✗ the files are identical (${same}), but ${own.map(x => x[0]).join(' and ')} failed its own checks` : partial.length
    ? `golden: ✓ PARTIAL: the two snapshots are identical (${same} files), but this is not the whole comparison: ${partial.join(', ')}`
    : `golden: ✓ the two snapshots are identical (${same} files; every part, both languages, with screenshots)`);
  return bad || own.length ? 1 : 0;
}
if (args.includes('--compare')) {
  const i = args.indexOf('--compare'), a = args[i + 1], b = args[i + 2];
  if (!a || !b || !existsSync(a) || !existsSync(b)) { console.error('golden: --compare needs two snapshot folders that exist'); process.exit(2); }
  process.exit(compare(resolve(a), resolve(b)));
}

/* ── snapshot ────────────────────────────────────────────────────────── */
const TOOL_VERSION = '2026-11-13';
const OUT = opt('--out');
if (!OUT) { console.error('golden: give --out <dir> (a snapshot) or --compare <dirA> <dirB>'); process.exit(2); }
const ROOT = resolve(opt('--root') || HERE);
if (!existsSync(join(ROOT, 'index.html'))) { console.error(`golden: no index.html in ${ROOT}`); process.exit(2); }
const LANGS = args.includes('--en-only') ? ['en'] : ['en', 'es'];
const SHOTS = args.includes('--shots');
const PARTS = ALL_PARTS;
const ONLY = args.includes('--only') ? (opt('--only') || '').split(',').map(x => x.trim()).filter(Boolean) : null;
if (ONLY && (!ONLY.length || ONLY.some(p => !PARTS.includes(p)))) { console.error(`golden: --only takes ${PARTS.join(', ')}`); process.exit(2); }
const ON = Object.fromEntries(PARTS.map(p => [p, !ONLY || ONLY.includes(p)]));
const COVERAGE = opt('--coverage') ? resolve(opt('--coverage')) : null;
const STALL_S = Number(opt('--stall')) || 180, TIMEOUT_MIN = Number(opt('--timeout')) || 150;
const outDir = resolve(OUT);
if (COVERAGE && COVERAGE.startsWith(outDir + '/')) { console.error('golden: --coverage must write outside the snapshot folder'); process.exit(2); }
rmSync(outDir, { recursive: true, force: true }); mkdirSync(outDir, { recursive: true });
// The test server's port is different every run and the site prints its own address in places ("Student link"): written as http://site.
const put = (rel, text) => { const f = join(outDir, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, typeof text === 'string' ? text.replace(/http:\/\/127\.0\.0\.1:\d+/g, 'http://site') : text); };
const safe = s => String(s).replace(/[^A-Za-z0-9._-]+/g, '_');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.webmanifest': 'application/manifest+json' };
function findChrome() {
  const given = opt('--chrome') || process.env.CHROME;
  if (given) return given;
  const c = platform() === 'darwin'
    ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium']
    : platform() === 'win32'
      ? [process.env['ProgramFiles'] + '\\Google\\Chrome\\Application\\chrome.exe', process.env['ProgramFiles(x86)'] + '\\Google\\Chrome\\Application\\chrome.exe']
      : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  return c.find(p => p && existsSync(p));
}
const freePort = () => new Promise((res, rej) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); s.on('error', rej); });
function serve(dir) {
  const srv = createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const f = normalize(join(dir, p));
    if (!f.startsWith(dir) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': MIME[extname(f).toLowerCase()] || 'application/octet-stream' });
    res.end(readFileSync(f));
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r({ srv, port: srv.address().port })));
}

/* ── the watchdog (review R2-6) ──────────────────────────────────────── */
let chromeProc = null, exitCode = 0, stepName = 'start', stepAt = Date.now(); const cleanup = [];
const t0 = Date.now();
function hang(why) {
  console.log(`golden: ✗ HUNG (${why}). Stuck at "${stepName}"`);
  try { if (chromeProc) chromeProc.kill('SIGKILL'); } catch { /* gone */ }
  for (const f of cleanup.reverse()) { try { f(); } catch { /* best effort */ } }
  console.log('golden: its Chrome is closed; no snapshot was finished (no meta.json)');
  process.exit(3);
}
setInterval(() => {
  if (Date.now() - stepAt > STALL_S * 1000) hang(`no step started for ${STALL_S} s`);
  if (Date.now() - t0 > TIMEOUT_MIN * 60000) hang(`the run passed ${TIMEOUT_MIN} minutes`);
}, 2000).unref();
const stepStart = name => { stepName = name; stepAt = Date.now(); };

async function openPage(port) {
  const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = new Map(); const handlers = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const { res, rej, timer } = pending.get(m.id); clearTimeout(timer); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
    else if (m.method) handlers.forEach(h => h(m.method, m.params));
  };
  // Every call has a time limit: a site promise that never settles (awaitPromise) leaves the run stopped, not hanging.
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id;
    const timer = setTimeout(() => hang(`the page did not answer ${method} in ${STALL_S} s`), STALL_S * 1000);
    pending.set(i, { res, rej, timer }); ws.send(JSON.stringify({ id: i, method, params })); });
  const evalJs = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  return { send, evalJs, on: h => handlers.push(h) };
}
const NOISE = /firebase|firestore|googleapis|gstatic|google\.com|youtube|ytimg|net::ERR|Failed to fetch|ERR_|auth\/|identitytoolkit|favicon|Content Security|websocket|WebChannel|Missing or insufficient|offline|Could not reach|NotAllowedError|play\(\) request|AbortError|NotSupportedError|The play\(\)|ResizeObserver loop/i;

/* A fixed clock and a seeded Math.random, installed before any page script:
   two runs of the same site must write the same bytes. The clock stands still
   at Wednesday 2026-11-11 18:00 UTC and Chrome runs in America/Los_Angeles
   whatever the machine's own zone is (review R1-9), so it is 10:00 in the
   morning on a school day on every machine. window.__goldDateOff moves it (only
   the games pass's virtual clock does). window.__goldSeed() puts Math.random back
   to its start: it is called before every view is opened. */
function pageFreeze() {
  const RealDate = Date, start = RealDate.UTC(2026, 10, 11, 18, 0, 0);
  window.__goldDateOff = 0;
  const now = () => start + window.__goldDateOff;
  function FakeDate(...a) { if (!new.target) return new RealDate(now()).toString(); return a.length ? new RealDate(...a) : new RealDate(now()); }
  FakeDate.prototype = RealDate.prototype; FakeDate.now = now; FakeDate.parse = RealDate.parse; FakeDate.UTC = RealDate.UTC;
  window.Date = FakeDate;
  /* Math.random gives each CALLER its own fixed sequence: the value depends on the names of the three functions
     nearest the call and on how many times that same chain has asked since the last __goldSeed(). Function names,
     not file names or line numbers, so the same code cut into other files draws the same numbers. */
  const counts = new Map();
  window.__goldSeed = () => { counts.clear(); };
  const mix = t => { let a = 0x9e3779b9 ^ t.length; for (let i = 0; i < t.length; i++) { a = Math.imul(a ^ t.charCodeAt(i), 2654435761); a ^= a >>> 15; } a = Math.imul(a ^ a >>> 16, 2246822507); a = Math.imul(a ^ a >>> 13, 3266489909); return ((a ^ a >>> 16) >>> 0) / 4294967296; };
  Math.random = () => {
    const names = (new Error().stack || '').split('\n').slice(2, 5).map(l => { const m = /^\s*at (?:async )?(?:new )?([^\s(]+) \(/.exec(l); return m ? m[1] : '-'; }).join('<');
    const n = (counts.get(names) || 0) + 1; counts.set(names, n);
    return mix(names + '#' + n);
  };
  /* The module files run in the order they were asked for, one at a time (review R2-3): SETS fills as each
     module-N.js runs, and in network arrival order the Daily Review picks (srCandidates reads SETS in order)
     changed from run to run. Each module-N.js <script> is held until the one before it has loaded or failed. */
  const realAppend = Node.prototype.appendChild, queue = []; let busy = false;
  const next = () => { if (busy || !queue.length) return; const [parent, s] = queue.shift(); busy = true;
    const done = () => { s.removeEventListener('load', done); s.removeEventListener('error', done); busy = false; next(); };
    s.addEventListener('load', done); s.addEventListener('error', done); realAppend.call(parent, s); };
  Node.prototype.appendChild = function (n) {
    if (n && n.tagName === 'SCRIPT' && /(^|\/)module-\d+\.js(\?|$)/.test(n.getAttribute('src') || '')) { queue.push([this, n]); next(); return n; }
    return realAppend.call(this, n);
  };
  const desc = e => e ? (e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '')) : '(nothing)';
  /* Whether an element is really on screen: '' when it is, else why not (review R2-2). */
  window.__goldSeen = (sel) => {
    const e = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!e) return 'missing';
    const hid = e.closest('[hidden]'); if (hid) return 'hidden (the hidden attribute on ' + desc(hid) + ')';
    if (!e.getClientRects().length) return 'not drawn (display: none on it or a parent)';
    const r = e.getBoundingClientRect(); if (!r.width || !r.height) return 'drawn with no size';
    const x0 = Math.max(r.left, 0), x1 = Math.min(r.right, innerWidth), y0 = Math.max(r.top, 0), y1 = Math.min(r.bottom, innerHeight);
    if (x1 <= x0 || y1 <= y0) return 'outside the window';
    const hit = document.elementFromPoint((x0 + x1) / 2, (y0 + y1) / 2);
    if (!hit) return 'nothing is drawn at its centre';
    if (!e.contains(hit) && !hit.contains(e)) return 'covered at its centre by ' + desc(hit);
    return '';
  };
  // Which full pages are covering the set panels right now.
  window.__goldCovering = () => ['games-screen', 'search-panel', 'songs-screen', 'my-progress-screen', 'class-activities-screen', 'live-quiz-screen']
    .filter(id => { const el = document.getElementById(id); return el && !el.hasAttribute('hidden'); }).join(',');
  window.__goldOpen = id => { const el = document.getElementById(id); return !!el && !el.hasAttribute('hidden'); };
  // Open dialogs: the site's modal overlays and any other aria-modal box that is not one of the full pages.
  window.__goldDialogs = () => [...document.querySelectorAll('.daily5-overlay, [aria-modal="true"], .video-modal')]
    .filter(e => !e.closest('[hidden]') && e.getClientRects().length && !(e.closest('.daily5-overlay') && !e.classList.contains('daily5-overlay'))
      && !/^(games-screen|live-quiz-screen)$/.test(e.id) && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none')
    .map(e => (e.id || desc(e)) + ': ' + (e.getAttribute('aria-label') || (e.querySelector('[aria-label]') || {}).getAttribute?.('aria-label') || (e.textContent || '').trim().slice(0, 60)));
  window.__goldDialogHtml = () => [...document.querySelectorAll('.daily5-overlay, [aria-modal="true"], .video-modal')]
    .filter(e => !e.closest('[hidden]') && e.getClientRects().length && !(e.closest('.daily5-overlay') && !e.classList.contains('daily5-overlay')) && !/^(games-screen|live-quiz-screen)$/.test(e.id))
    .map(e => e.outerHTML).join('\n');
  window.__goldCloseDialogs = () => { document.querySelectorAll('.daily5-overlay, [aria-modal="true"], .video-modal').forEach(e => {
    if (/^(games-screen|live-quiz-screen)$/.test(e.id) || e.closest('[hidden]')) return;
    const b = e.querySelector('.tp-close, [data-close], button[aria-label*="lose"], button[aria-label*="errar"]'); if (b) b.click(); }); return 1; };
  // The scroll position before a picture: the top, or the element at the top.
  window.__goldScroll = sel => { const e = sel && document.querySelector(sel);
    if (e) e.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'instant' });
    else { document.querySelectorAll('.main').forEach(m => m.scrollTo({ top: 0, left: 0, behavior: 'instant' })); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
    return 1; };
}

/* ── the games pass's world: a virtual clock, a fake microphone, silent sound (see the header) ── */
function pageVirtualWorld() {
  const W = window, R = { st: W.setTimeout.bind(W), ct: W.clearTimeout.bind(W), raf: W.requestAnimationFrame.bind(W), caf: W.cancelAnimationFrame.bind(W),
    pnow: performance.now.bind(performance) };
  let virtual = false, vnow = 0, off = 0, seq = 0, lastFrame = 0;
  const T = new Map(), F = new Map(), FR = new Map();
  const now = () => virtual ? vnow : R.pnow() + off;
  performance.now = now;
  const call = (fn, a) => { try { if (typeof fn === 'function') fn.apply(W, a); else (0, eval)(String(fn)); } catch (e) { R.st(() => { throw e; }, 0); } };
  const arm = (id, r) => { r.real = R.st(() => { if (T.get(id) !== r) return; fire(id, r); }, Math.max(0, r.at - now())); };
  function fire(id, r) {
    if (r.every == null) T.delete(id); else r.at = virtual ? r.at + r.every : now() + r.every;
    call(r.fn, r.args);
    if (!virtual && r.every != null && T.get(id) === r) arm(id, r);
  }
  W.setTimeout = (fn, ms, ...a) => { const id = ++seq, r = { fn, args: a, at: now() + Math.max(0, Number(ms) || 0), every: null }; T.set(id, r); if (!virtual) arm(id, r); return id; };
  W.setInterval = (fn, ms, ...a) => { const id = ++seq, every = Math.max(4, Number(ms) || 0), r = { fn, args: a, at: now() + every, every }; T.set(id, r); if (!virtual) arm(id, r); return id; };
  W.clearTimeout = W.clearInterval = id => { const r = T.get(id); if (!r) return; if (r.real != null) R.ct(r.real); T.delete(id); };
  W.requestAnimationFrame = fn => { const id = ++seq; F.set(id, fn); if (!virtual) FR.set(id, R.raf(() => { FR.delete(id); if (F.get(id) !== fn) return; F.delete(id); call(fn, [now()]); })); return id; };
  W.cancelAnimationFrame = id => { F.delete(id); if (FR.has(id)) { R.caf(FR.get(id)); FR.delete(id); } };
  W.requestIdleCallback = (fn) => W.setTimeout(() => fn({ didTimeout: false, timeRemaining: () => 8 }), 1);
  W.cancelIdleCallback = id => W.clearTimeout(id);
  const ch = new MessageChannel(), waiting = []; ch.port1.onmessage = () => { const r = waiting.shift(); if (r) r(); };
  const yieldReal = () => new Promise(r => { waiting.push(r); ch.port2.postMessage(0); });
  const FRAME = 1000 / 30;
  const gv = W.__gv = {
    get virtual() { return virtual; },
    on() { if (virtual) return 1; vnow = now(); virtual = true; lastFrame = vnow;
      for (const r of T.values()) if (r.real != null) { R.ct(r.real); r.real = null; }
      for (const [id, h] of FR) { R.caf(h); FR.delete(id); }
      return 1; },
    /* Move the clock: due timers in order, a frame every 1/30 s, and after each a real turn of the event loop so every promise settles. */
    async advance(ms) {
      const end = vnow + ms; let guard = 0;
      while (vnow < end) {
        if (++guard > 200000) throw new Error('golden: the virtual clock ran 200,000 callbacks without reaching its end (a timer loop?)');
        const nextFrame = lastFrame + FRAME;
        let due = null, dueId = 0;
        for (const [id, r] of T) if (r.at <= Math.min(nextFrame, end) && (!due || r.at < due.at || (r.at === due.at && id < dueId))) { due = r; dueId = id; }
        if (due) { const step = Math.max(vnow, due.at) - vnow; vnow += step; W.__goldDateOff += step; fire(dueId, due); await yieldReal(); continue; }
        if (nextFrame > end) { W.__goldDateOff += end - vnow; vnow = end; break; }
        W.__goldDateOff += nextFrame - vnow; vnow = nextFrame; lastFrame = nextFrame;
        const fs = [...F.entries()]; F.clear();
        for (const [, fn] of fs) call(fn, [vnow]);
        await yieldReal();
      }
      return Math.round(vnow);
    },
    mic() { gv.micT0 = now(); return 1; },
    micT0: 0,
  };
  /* The fixed recording (header): a plucked string or a strummed chord every 0.55 s from 1 s after the mic opens. */
  const SR = 48000, PLAN = [[40], [45], [50], [55], [59], [64], [40, 47, 52], [45, 52, 57], [43, 47, 50, 55, 59, 67], [48, 52, 55, 60, 64], [40, 47, 52, 55, 59, 64], []];
  const chunks = new Map();
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  function computeChunk(c) {
    const out = new Float32Array(SR), t0 = c;
    for (let j = 0; j < SR; j++) {
      const t = t0 + j / SR; let v = 0;
      const kHi = Math.floor((t - 1) / 0.55);
      for (let k = Math.max(0, kHi - 2); k <= kHi; k++) {
        const notes = PLAN[k % PLAN.length];
        for (let s = 0; s < notes.length; s++) {
          const st = 1 + k * 0.55 + s * 0.012, dt = t - st;
          if (dt < 0 || dt > 1.2) continue;
          const env = 0.16 * Math.exp(-dt / 0.2) * Math.min(1, dt / 0.003), w = 2 * Math.PI * hz(notes[s]) * dt;
          v += env * (Math.sin(w) + 0.5 * Math.sin(2 * w) + 0.25 * Math.sin(3 * w));
        }
      }
      let h = (Math.imul((c * SR + j) | 0, 2654435761) ^ 0x5bd1e995) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822507) >>> 0; h ^= h >>> 13;
      out[j] = v + 0.0015 * ((h & 0xffff) / 0x8000 - 1);
    }
    return out;
  }
  const sample = i => { if (i < 0) return 0; const c = Math.floor(i / SR); let a = chunks.get(c); if (!a) { a = computeChunk(c); chunks.set(c, a); } return a[i - c * SR]; };
  const fillMic = (ctx, buf) => {
    if (!ctx._mic) { buf.fill(0); return; }
    const end = Math.floor((now() - gv.micT0) / 1000 * SR), L = buf.length;
    for (let j = 0; j < L; j++) buf[j] = sample(end - L + j);
  };
  const param = v => ({ value: v, defaultValue: v, minValue: -3.4e38, maxValue: 3.4e38, automationRate: 'a-rate',
    setValueAtTime(x) { this.value = x; return this; }, linearRampToValueAtTime(x) { this.value = x; return this; },
    exponentialRampToValueAtTime(x) { this.value = x; return this; }, setTargetAtTime(x) { this.value = x; return this; },
    setValueCurveAtTime() { return this; }, cancelScheduledValues() { return this; }, cancelAndHoldAtTime() { return this; } });
  class Node0 {
    constructor(ctx, extra) { this.context = ctx; this.numberOfInputs = 1; this.numberOfOutputs = 1; this.channelCount = 2; this.channelCountMode = 'max'; this.channelInterpretation = 'speakers'; this._l = {}; Object.assign(this, extra || {}); }
    connect(n) { return n; } disconnect() {}
    addEventListener(t, f) { (this._l[t] = this._l[t] || []).push(f); } removeEventListener(t, f) { this._l[t] = (this._l[t] || []).filter(x => x !== f); }
    dispatchEvent(ev) { (this._l[ev.type] || []).forEach(f => f.call(this, ev)); if (typeof this['on' + ev.type] === 'function') this['on' + ev.type](ev); return true; }
  }
  class Source extends Node0 {
    start(when, offset, duration) { if (this._startAt != null) return; const ctx = this.context; this._startAt = Math.max(ctx.currentTime, when || 0);
      let dur = duration;
      if (dur == null && this.buffer && !this.loop) dur = Math.max(0, this.buffer.duration - (offset || 0)) / Math.abs((this.playbackRate && this.playbackRate.value) || 1);
      if (dur != null) this._end(this._startAt + dur); }
    stop(when) { this._end(when == null || when < this.context.currentTime ? this.context.currentTime : when); }
    _end(at) { if (this._endTimer != null) W.clearTimeout(this._endTimer); this._endTimer = W.setTimeout(() => { if (this._ended) return; this._ended = true; this.dispatchEvent({ type: 'ended', target: this }); }, Math.max(0, (at - this.context.currentTime) * 1000)); }
  }
  class Analyser extends Node0 {
    constructor(ctx) { super(ctx); this._fft = 2048; this.smoothingTimeConstant = 0.8; this.minDecibels = -100; this.maxDecibels = -30; }
    get fftSize() { return this._fft; } set fftSize(v) { this._fft = v; } get frequencyBinCount() { return this._fft / 2; }
    getFloatTimeDomainData(buf) { fillMic(this.context, buf); }
    getByteTimeDomainData(buf) { const f = new Float32Array(buf.length); fillMic(this.context, f); for (let i = 0; i < buf.length; i++) buf[i] = Math.max(0, Math.min(255, Math.round(128 + f[i] * 128))); }
    getFloatFrequencyData(buf) { buf.fill(-120); } getByteFrequencyData(buf) { buf.fill(0); }
  }
  class FakeAudioContext {
    constructor(o) { this.sampleRate = (o && o.sampleRate) || SR; this._t0 = now(); this.state = 'running'; this.destination = new Node0(this, { maxChannelCount: 2 });
      this.listener = {}; this.onstatechange = null; this.audioWorklet = { addModule: () => Promise.resolve() }; this.baseLatency = 0.01; this.outputLatency = 0.02; }
    get currentTime() { return Math.max(0, (now() - this._t0) / 1000); }
    getOutputTimestamp() { return { contextTime: this.currentTime, performanceTime: now() }; }
    resume() { this.state = 'running'; return Promise.resolve(); } suspend() { this.state = 'suspended'; return Promise.resolve(); } close() { this.state = 'closed'; return Promise.resolve(); }
    addEventListener() {} removeEventListener() {}
    createGain() { return new Node0(this, { gain: param(1) }); }
    createBiquadFilter() { return new Node0(this, { type: 'lowpass', frequency: param(350), Q: param(1), gain: param(0), detune: param(0), getFrequencyResponse() {} }); }
    createOscillator() { return new Source(this, { type: 'sine', frequency: param(440), detune: param(0), setPeriodicWave() {} }); }
    createBufferSource() { return new Source(this, { buffer: null, playbackRate: param(1), detune: param(0), loop: false, loopStart: 0, loopEnd: 0 }); }
    createConstantSource() { return new Source(this, { offset: param(1) }); }
    createAnalyser() { return new Analyser(this); }
    createMediaStreamSource(stream) { this._mic = stream; return new Node0(this, { mediaStream: stream }); }
    createMediaElementSource(el) { return new Node0(this, { mediaElement: el }); }
    createMediaStreamDestination() { return new Node0(this, { stream: fakeStream() }); }
    createDynamicsCompressor() { return new Node0(this, { threshold: param(-24), knee: param(30), ratio: param(12), attack: param(0.003), release: param(0.25), reduction: 0 }); }
    createStereoPanner() { return new Node0(this, { pan: param(0) }); }
    createDelay() { return new Node0(this, { delayTime: param(0) }); }
    createWaveShaper() { return new Node0(this, { curve: null, oversample: 'none' }); }
    createConvolver() { return new Node0(this, { buffer: null, normalize: true }); }
    createChannelMerger() { return new Node0(this); } createChannelSplitter() { return new Node0(this); }
    createScriptProcessor() { return new Node0(this, { onaudioprocess: null }); }
    createPeriodicWave() { return {}; }
    createBuffer(n, len, sr) { const data = []; for (let i = 0; i < n; i++) data.push(new Float32Array(len));
      return { numberOfChannels: n, length: len, sampleRate: sr, duration: len / sr, getChannelData: i => data[i],
        copyToChannel(src, i, o) { data[i].set(src, o || 0); }, copyFromChannel(dst, i, o) { dst.set(data[i].subarray(o || 0, (o || 0) + dst.length)); } }; }
    decodeAudioData() { return new Promise(() => {}); }   // never: a recorded note never loads, playNote keeps its synthesized pluck
  }
  W.AudioContext = W.webkitAudioContext = FakeAudioContext;
  function fakeStream() {
    const track = { kind: 'audio', id: 'gold-mic', label: 'Golden fake microphone', enabled: true, muted: false, readyState: 'live', onended: null,
      stop() { this.readyState = 'ended'; }, getSettings() { return { sampleRate: SR, channelCount: 1, echoCancellation: false, autoGainControl: false, noiseSuppression: false }; },
      getConstraints() { return {}; }, getCapabilities() { return {}; }, applyConstraints() { return Promise.resolve(); }, clone() { return this; }, addEventListener() {}, removeEventListener() {} };
    return { id: 'gold-stream', active: true, getTracks: () => [track], getAudioTracks: () => [track], getVideoTracks: () => [], addEventListener() {}, removeEventListener() {}, clone() { return this; } };
  }
  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia = () => { gv.mic(); return Promise.resolve(fakeStream()); };
    navigator.mediaDevices.enumerateDevices = () => Promise.resolve([{ kind: 'audioinput', deviceId: 'gold', label: 'Golden fake microphone', groupId: 'gold' }]);
  }
  W.MediaRecorder = class { constructor(s) { this.stream = s; this.state = 'inactive'; this.mimeType = 'audio/webm'; } start() { this.state = 'recording'; }
    stop() { this.state = 'inactive'; W.setTimeout(() => { if (this.ondataavailable) this.ondataavailable({ data: new Blob([]) }); if (this.onstop) this.onstop({}); }, 0); }
    pause() {} resume() {} requestData() {} addEventListener(t, f) { this['on' + t] = f; } removeEventListener() {} static isTypeSupported() { return true; } };
  HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
  HTMLMediaElement.prototype.pause = function () {};
  const realFetch = W.fetch.bind(W);
  W.fetch = (u, o) => /\.(mp3|wav|ogg|m4a|webm)(\?|$)/i.test(String((u && u.url) || u)) ? new Promise(() => {}) : realFetch(u, o);
}

/* One tag per line, so a difference points at a line and a diff tool can read it. */
const lines = html => String(html == null ? '' : html).replace(/>\s*</g, '>\n<') + '\n';
// The snapshot of an element, read in the page: its outer HTML, or a marker when it is missing.
const htmlExpr = sel => `(() => { const e = document.querySelector(${JSON.stringify(sel)}); return e ? e.outerHTML : '(missing: ' + ${JSON.stringify(sel)} + ')'; })()`;
// The saved maps, by their driver-contract names.
const STATE = `(() => { const ls = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); ls[k] = localStorage.getItem(k); }
  return JSON.stringify({ completed, skills: progress, responses, caSteps: caStepDone, classActivities, exitChecks, practiceLog, games, streak, localStorage: ls }); })()`;
/* The controls of a set panel that save something. Each is really clicked (a
   text box is typed into) and what it writes is the record. Left out on
   purpose: anything that opens the mic, a video, a print dialog or another page. */
// The same for an open In-Class Activity card.
const CA_WRITERS = ['caFocusGotIt', 'caMarkClick', 'caPickPath', 'caSetChordMode', 'caSetRecordingMode', 'caSetKeyMode', 'caSetBassMode', 'pcSetCounts'];
const WRITERS = ['toggleStepDone', 'toggleSkill', 'setSkillLevel', 'onStepMcSelect', 'onPracticeMcSelect', 'toggleGotIt', 'setPerformanceLevel',
  'repDotTap', 'repDotReset', 'logCleanRep', 'finishModuleReview', 'toggleTabChoice'];

/* A made-up live-quiz game for one quiz, built in the page with the site's own helpers (so a target is always
   one the quiz can really ask): the four session docs a game goes through, a right answer and a wrong one. */
const LQ_DEF = `window.__goldLq = function(quizId){
  const quiz = lqQuiz(quizId), type = lqType(quiz);
  let target = null, correct, correctIds = null, wrong;
  if (type === 'mc') { correct = quiz.choices[0].id; wrong = quiz.choices[1].id; }
  else if (type === 'fret') {
    const string = quiz.strings[0], note = lqTargetNotes(quiz, string)[0];
    target = { string, note }; correctIds = lqTargetIds(quiz, target); correct = correctIds[0];
    for (let f = 0; f <= 12; f++) { const id = lqFretId(string, f); if (!correctIds.includes(id)) { wrong = id; break; } }
  } else {
    const p = lqPcNamePool(quiz.strings)[0];
    target = { string: p.string, fret: p.fret }; correct = lqPcNameOf(target); wrong = lqPcNames().find(n => n !== correct);
  }
  const lobby = { sessionId: 'lq-gold', quizId, state: 'lobby', qIndex: -1, correct: null, correctIds: null, tally: null, scores: {}, target: null,
    speedBonus: false, limitSec: 0, startedAt: null, askedAt: null, endedAt: null };
  const scores = { 'dev-user': { pts: 1000, right: 1, answered: 1, last: 1000, lastRight: true }, 'stub-uid-01': { pts: 0, right: 0, answered: 1, last: 0, lastRight: false },
    'stub-uid-02': { pts: 1000, right: 1, answered: 1, last: 1000, lastRight: true } };
  const question = Object.assign({}, lobby, { state: 'question', qIndex: 0, target });
  const reveal = Object.assign({}, question, { state: 'reveal', correct, correctIds, tally: { [correct]: 2, [wrong]: 1 }, scores });
  const ended = Object.assign({}, reveal, { state: 'ended' });
  return { correct, wrong, sessions: { lobby, question, reveal, ended } };
}; 1`;

/* The fixed student of the games pass (header, "The games"). Page-side; the tool calls __goldPlayTick() once per virtual second. */
function pagePlayer() {
  const H = t => { let a = 0xdeadbeef ^ t.length, c = 0x41c6ce57 ^ t.length; for (let i = 0; i < t.length; i++) { const ch = t.charCodeAt(i); a = Math.imul(a ^ ch, 2654435761); c = Math.imul(c ^ ch, 1597334677); }
    return (a >>> 0).toString(16).padStart(8, '0') + (c >>> 0).toString(16).padStart(8, '0') + ':' + t.length; };
  const flat = (o, pre = '', out = {}) => { for (const k of Object.keys(o || {})) { const v = o[k]; if (v && typeof v === 'object' && !Array.isArray(v)) flat(v, pre + k + '.', out); else out[pre + k] = JSON.stringify(v); } return out; };
  const diff = (a, b) => { const A = flat(a), B = flat(b), d = {}; for (const k in B) if (A[k] !== B[k]) d[k] = B[k]; for (const k in A) if (!(k in B)) d[k] = '(removed)'; return d; };
  const EXIT = /gamesShow\(|coachClose\(|Finish\(|Skip\(|Again\(|Setup\(|RenderHome\(|ShowSelect\(|games-exit|micRecRevoke\(/;
  const START = /(Start|PlayAdaptive|GoReady|Spin)\(|coachStartCheck\(/;
  // Settings, not answers: a level, a deck, a tempo nudge. Pressed mid-round they restart or retune the game.
  const SETTING = /Set(Level|Mode)\(|Pick(Deck|Dir|Rate|Prog|Song|Pat|Tier)?\(|NudgeBpm\(|LiveBpm\(|NudgeNext\(|DoneNudge\(|micRecConsent\(/;
  const oc = b => b.getAttribute('onclick') || ('[' + (b.className || '') + '] ' + (b.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40));
  const shown = b => b.getClientRects().length && !b.disabled && !b.closest('[hidden]') && b.getAttribute('aria-disabled') !== 'true';
  window.__goldPlayBegin = (key, rootSel) => {
    window.__goldSeed();
    // A game whose card starts it at once (Note Hunt: its setup IS fretStart()) has no Start button to press.
    const meta = typeof GAMES_META !== 'undefined' && GAMES_META.find(x => x.key === key), self = !!(meta && meta.setup && /Start\(/.test(String(meta.setup)));
    window.__gp = { key, rootSel, t0: performance.now(), tick: 0, started: self, startTick: self ? 0 : -1, selfStarted: self, pre: 0, clicks: [], marks: [], ended: '',
      gamesBefore: JSON.parse(JSON.stringify(typeof games !== 'undefined' ? games : {})) };
    return 1;
  };
  window.__goldPlayTick = async () => {
    const g = window.__gp, root = document.querySelector(g.rootSel);
    if (!root) { g.ended = 'its panel is gone'; return { done: true, why: g.ended }; }
    const list = [...root.querySelectorAll('button, [onclick]')].filter(b => shown(b) && !b.closest('.games-head'));
    let pick = null;
    if (!g.started) {
      pick = list.find(b => START.test(oc(b)));
      if (pick) { g.started = true; g.startTick = g.tick; }
      else if (g.pre < 4) { pick = list.find(b => !EXIT.test(oc(b))) || null; if (pick) g.pre++; }
    } else if (g.tick - g.startTick > 2 && list.some(b => /Again\(/.test(oc(b)))) {
      g.ended = 'results';
    } else if (g.marks.length >= 2 && g.marks[g.marks.length - 1] === g.marks[g.marks.length - 2] && list.some(b => START.test(oc(b)))) {
      // Nothing moved for a second and a Start-like button shows (Riff Roulette's card after its spin, Simon's Play again): press it.
      pick = list.find(b => START.test(oc(b)));
    } else if ((g.tick - g.startTick) % 2 === 1) {
      const ans = list.filter(b => !EXIT.test(oc(b)) && !START.test(oc(b)) && !SETTING.test(oc(b)));
      if (ans.length) pick = ans[((g.tick - g.startTick) >> 1) % ans.length];
    }
    if (g.ended) return { done: true, why: g.ended };
    if (pick) { g.clicks.push({ at: Math.round(performance.now() - g.t0), what: oc(pick) }); pick.click(); }
    await window.__gv.advance(1000);
    g.tick++;
    const r = document.querySelector(g.rootSel);
    g.marks.push(r ? H(r.innerHTML) : '(gone)');
    return { done: false };
  };
  window.__goldPlayEnd = async () => {
    const g = window.__gp;
    return { clicks: g.clicks, marks: g.marks, ended: g.ended || 'after ' + g.tick + ' s', startedAt: g.startTick, startedByItsCard: g.selfStarted,
      gamesWrote: diff(g.gamesBefore, typeof games !== 'undefined' ? games : {}) };
  };
  window.__goldFlat = flat;
}

const chrome = findChrome();
if (!chrome) { console.error('golden: no Chrome or Chromium found (use --chrome <path>)'); process.exit(2); }
try {
  const prof = mkdtempSync(join(tmpdir(), 'gc-golden-chrome-'));
  const cdp = await freePort();
  chromeProc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required', '--no-first-run', '--disable-gpu', '--hide-scrollbars', '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1', 'about:blank'], { stdio: 'ignore', env: { ...process.env, TZ: 'America/Los_Angeles' } });
  cleanup.push(() => rmSync(prof, { recursive: true, force: true }));
  for (let i = 0; i < 60; i++) { try { await fetch(`http://127.0.0.1:${cdp}/json/version`); break; } catch { await sleep(250); } }
  const site = await serve(ROOT); cleanup.push(() => site.srv.close());
  const base = `http://127.0.0.1:${site.port}`;
  console.log(`golden: snapshot of ${ROOT} (parts: ${PARTS.filter(p => ON[p]).join(', ')}) …`);

  const page = await openPage(cdp);
  const events = [], failures = [], counts = {}, dialogLog = {};
  const count = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
  const fail = (step, text) => { failures.push({ step, text }); events.push({ step, kind: 'FAILED', text }); console.log(`golden: ✗ ${step}: ${String(text).slice(0, 240)}`); };
  page.on((method, p) => {
    let ev = null;
    if (method === 'Runtime.exceptionThrown') { const d = p.exceptionDetails; ev = { step: stepName, kind: 'exception', text: String((d.exception && (d.exception.description || d.exception.value)) || d.text).split('\n')[0] }; }
    else if (method === 'Runtime.consoleAPICalled' && p.type === 'error') ev = { step: stepName, kind: 'console.error', text: p.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300) };
    // Network noise is dropped, but never a broken name or type: "openYoutubeOverlay is not defined" holds a noise word and is a real fault (review R1-12).
    if (ev && (!NOISE.test(ev.text) || (ev.kind === 'exception' && /ReferenceError|TypeError|SyntaxError|RangeError/.test(ev.text)))) events.push(ev);
  });
  await page.send('Runtime.enable'); await page.send('Page.enable');
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 657, deviceScaleFactor: 1, mobile: false });
  await page.send('Page.addScriptToEvaluateOnNewDocument', { source: `(${pageFreeze.toString()})()` });

  /* Coverage (--coverage): which top-level functions of each part ran. Taken before every navigation, since a
     new document drops the old one's scripts. */
  const covRan = new Map(), covAll = new Map();
  if (COVERAGE) { await page.send('Profiler.enable'); await page.send('Profiler.startPreciseCoverage', { callCount: true, detailed: false }); }
  const covTake = async () => {
    if (!COVERAGE) return;
    const { result } = await page.send('Profiler.takePreciseCoverage');
    for (const s of result) {
      let file; try { file = new URL(s.url).pathname.replace(/^\//, ''); } catch { continue; }
      if (!/\.js$/.test(file) || file.startsWith('tools/')) continue;
      const fns = s.functions.filter(f => f.ranges.length && f.ranges[0].startOffset > 0);   // the script itself starts at 0
      const top = fns.filter(f => !fns.some(g => g !== f && g.ranges[0].startOffset < f.ranges[0].startOffset && g.ranges[0].endOffset >= f.ranges[0].endOffset));
      if (!covAll.has(file)) covAll.set(file, new Map()); if (!covRan.has(file)) covRan.set(file, new Set());
      for (const f of top) { const k = f.ranges[0].startOffset; covAll.get(file).set(k, f.functionName || '(anonymous)'); if (f.ranges[0].count > 0) covRan.get(file).add(k); }
    }
  };

  const run = async (name, expr, wait = 150) => {
    stepStart(name);
    try { if (wait) await page.evalJs('window.__goldSeed && window.__goldSeed()'); const v = await page.evalJs(expr); if (wait) await sleep(wait); return v; }
    catch (e) { const text = String(e.message).split('\n')[0].slice(0, 300); events.push({ step: name, kind: 'step-failed', text }); failures.push({ step: name, text: 'step-failed: ' + text }); console.log(`golden: ✗ ${name}: ${text}`); return null; }
  };
  const until = async (what, expr) => {
    let last = null, held = 0, why = '';
    for (let i = 0; i < 160 && held < 4; i++) {
      await sleep(250); stepStart(what);
      let v = 0; try { v = await page.evalJs(expr); why = ''; } catch (e) { v = 0; why = String(e.message).split('\n')[0]; }
      if (v && v === last) held++; else held = 0;
      last = v;
    }
    if (held < 4) throw new Error(`${what} did not happen in 40 s (last read ${JSON.stringify(last)}${why ? ', ' + why : ''})`);
  };
  // Wait for a value; a navigation that does not land is a failure of the run, not a hang.
  const untilEq = async (what, expr, want, secs = 12) => {
    let v;
    for (let i = 0; i < secs * 10; i++) { stepStart(what); try { v = await page.evalJs(expr); } catch (e) { v = 'error: ' + String(e.message).split('\n')[0]; } if (v === want) return true; await sleep(100); }
    fail(what, `did not happen in ${secs} s (wanted ${JSON.stringify(want)}, last read ${JSON.stringify(v)})`); return false;
  };
  const boot = async (tag) => {
    await covTake();
    stepStart(`${tag}: navigate`);
    await page.send('Page.navigate', { url: `${base}/index.html` });
    await until(`${tag}: the page's scripts loading`, `typeof devBypass === 'function' && document.readyState === 'complete' && location.pathname === '/index.html'`);
    // Without the fixed clock and the per-caller random numbers nothing recorded can be compared: stop rather than record.
    if (!(await page.evalJs(`typeof window.__goldSeed === 'function' && Date.now() === Date.now() && new Date().toISOString()`).catch(() => false))) throw new Error(`${tag}: the fixed clock did not install in the page`);
    await run(`${tag}:devBypass`, 'devBypass()', 500);
    await until(`${tag}: the sets loading after sign-in`, `typeof SETS !== 'undefined' ? SETS.length : 0`);
    // A fixed point (review R2-3): the whole catalogue has loaded and the boot's own catch-up redraw has run.
    await run(`${tag}:catalogue`, `(typeof _bootCatchUp !== 'undefined' && _bootCatchUp) ? Promise.resolve(_bootCatchUp).then(() => 1, () => 1) : 1`, 0);
    await sleep(1500);
  };
  /* A view is recorded once it has stopped changing: `calm` + 1 reads 200 ms apart must agree. After 12 s it is
     recorded as it is and the wobble is noted in errors.json. With `see` the view must also be on screen. */
  const read = async (name, sel, calm = 1, see = true) => {
    let prev = await run(name, htmlExpr(sel), 0), same = 0, settled = false;
    for (let i = 0; i < 60; i++) { await sleep(200); const cur = await run(name, htmlExpr(sel), 0); if (cur === prev) { if (++same >= calm) { settled = true; break; } } else same = 0; prev = cur; }
    if (!settled) events.push({ step: name, kind: 'never-settled', text: 'the view was still changing after 12 s' });
    if (see) { const why = await run(name + ':on-screen', `__goldSeen(${JSON.stringify(sel)})`, 0); if (why) fail(name, `${sel} is not on screen: ${why}`); }
    return prev;
  };
  // Dialogs open where a picture is due: recorded (dialogs.json), then closed by Escape or their close button; one that stays open fails.
  const closeDialogs = async (rel) => {
    const open = (await run(`dialogs ${rel}`, '__goldDialogs()', 0)) || [];
    if (!open.length) return;
    dialogLog[rel] = open;
    put(`dialogs/${safe(rel)}.html`, lines(await run(`dialogs ${rel}:html`, '__goldDialogHtml()', 0)));
    await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await sleep(200);
    if (((await run(`dialogs ${rel}`, '__goldDialogs()', 0)) || []).length) { await run(`dialogs ${rel}:close`, '__goldCloseDialogs()', 0); await sleep(250); }
    const still = (await run(`dialogs ${rel}`, '__goldDialogs()', 0)) || [];
    if (still.length) fail(`shot ${rel}`, `a dialog is still open over the picture after Escape and its close button: ${still.join(' | ')}`);
  };
  /* A screenshot is kept once it has stopped changing. The scroll position is set first (the top, or `scrollTo` at
     the top), open dialogs are closed (recorded), running animations are put at a fixed point. Up to 8 s. */
  const shot = async (rel, scrollTo = null, dialogs = true) => {
    if (dialogs) await closeDialogs(rel);
    await run(`shot ${rel}:scroll`, `__goldScroll(${JSON.stringify(scrollTo)})`, 0);
    try { await page.evalJs(`(document.getAnimations ? document.getAnimations() : []).forEach(a => { try { a.finish(); } catch (e) { try { a.currentTime = 0; a.pause(); } catch (e2) {} } }); 1`); } catch { /* the page is between two documents */ }
    stepStart('shot ' + rel);
    let prev = (await page.send('Page.captureScreenshot', { format: 'png' })).data, same = 0;
    for (let i = 0; i < 40; i++) { await sleep(200); const cur = (await page.send('Page.captureScreenshot', { format: 'png' })).data; if (cur === prev) { if (++same >= 3) { put(rel, Buffer.from(prev, 'base64')); count('shots'); return; } } else same = 0; prev = cur; }
    events.push({ step: 'shot ' + rel, kind: 'never-settled', text: 'the picture was still changing after 8 s' });
    put(rel, Buffer.from(prev, 'base64')); count('shots');
  };
  const clickExpr = sel => `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) throw new Error('no such control: ' + ${JSON.stringify(sel)}); e.click(); return 1; })()`;

  /* ── student navigation (review R2-5): rail buttons, the rail's module list, set buttons ── */
  const COVERS = [['#songs-hub-btn', 'songs-screen'], ['#my-progress-btn', 'my-progress-screen'], ['#class-activities-btn', 'class-activities-screen']];
  let coverTurn = 0;
  const cover = async (tag) => {
    const [btn, scr] = COVERS[coverTurn++ % COVERS.length];
    await run(`${tag}:cover`, clickExpr(btn), 0);
    return untilEq(`${tag}: ${scr} opening from its rail button`, `__goldOpen(${JSON.stringify(scr)})`, true);
  };
  const pickModule = async (tag, m, ids) => {
    await run(`${tag}:module-${m}`, `(() => { const s = document.getElementById('module-select'); if (!s) throw new Error('no such control: #module-select'); s.value = ${JSON.stringify(String(m))}; s.dispatchEvent(new Event('change', { bubbles: true })); return 1; })()`, 0);
    await untilEq(`${tag}: module ${m}'s set buttons in the rail`, `(ids => ids.every(id => document.querySelector('#week-pills .wpill[data-id="' + id + '"]')) && !!document.querySelector('.week-panel[data-id="' + ids[0] + '"]'))(${JSON.stringify(ids)})`, true, 20);
    await untilEq(`${tag}: module ${m} chosen with no page covering the sets`, '__goldCovering()', '');
  };
  // A set by its rail button (a Module Review by the rail's review row). 'none' when the module has no Module Review row.
  const pickSet = async (tag, id) => {
    if (/^mr\d+$/.test(id)) {
      const has = await run(`${tag}:review-row`, `(b => !!b && !b.hidden && b.dataset.moduleNum === ${JSON.stringify(id.slice(2))})(document.getElementById('rail-review-btn'))`, 0);
      if (!has) return 'none';
      await run(`${tag}:click`, clickExpr('#rail-review-btn'), 0);
    } else await run(`${tag}:click`, clickExpr(`#week-pills .wpill[data-id="${id}"]`), 0);
    const ok = await untilEq(`${tag}: ${id} showing after its rail button`, `(document.querySelector('.week-panel.active') || { dataset: {} }).dataset.id || ''`, id);
    await untilEq(`${tag}: no page covering ${id}`, '__goldCovering()', '');
    return ok ? 'ok' : 'failed';
  };
  const moduleIds = m => [...sets.filter(x => x.m === m).map(x => x.id), `mr${m}`];

  await boot('boot');
  const sets = (await run('list-sets', `SETS.map(s => ({ id: s.id, m: s.moduleNum }))`, 0)) || [];
  const modules = [...new Set(sets.map(s => s.m).filter(Boolean))].sort((a, b) => a - b);
  if (!sets.length) throw new Error('the page booted with no SETS: nothing to snapshot');

  if (ON.data) {
    // Functions cannot be compared as data; their source text can. SETS is sorted by module (sets keep their order inside one).
    const dump = name => `JSON.stringify(${name}, (k, v) => typeof v === 'function' ? 'function: ' + String(v) : v, 1)`;
    for (const [file, name] of [['sets', '[...SETS].sort((a, b) => a.moduleNum - b.moduleNum)'], ['class-activities', 'CLASS_ACTIVITIES'], ['module-manifest', 'MODULE_MANIFEST']]) {
      const j = await run('data:' + name, dump(name), 0);
      put(`data/${file}.json`, (j || '(missing)') + '\n'); count('data');
    }
    // The order SETS filled in (review R2-3: it must be the same on every run).
    put('data/sets-order.json', JSON.stringify(sets.map(s => s.id)) + '\n'); count('data');
    put('data/index-head.html', lines(await read('data:head', 'head', 3, false))); count('data');
    /* The files the rebuild leaves alone (todo.md, "Do not refactor"), byte for byte. */
    const KEEP = ['i18n.js', 'styles.css', 'firestore.rules', 'class-activities.js', 'config-main.js', 'guitar-diagrams.js', 'practice-minutes-config.js', 'practice-minutes.js',
      'live-quiz.js', 'fab-tools.js', 'tuner.js', 'manifest.json', ...readdirSync(ROOT).filter(f => /^module-\d+\.js$/.test(f) || /^trainer-.*\.js$/.test(f)).sort(),
      ...readdirSync(join(ROOT, 'tabs')).sort().map(f => 'tabs/' + f)];
    for (const f of KEEP) { put(`files/${f}`, existsSync(join(ROOT, f)) ? readFileSync(join(ROOT, f)) : '(missing)'); count('filesKept'); }
  }

  if (ON.sets) for (const lang of LANGS) {
    await run(`${lang}:lang`, `setLang('${lang}')`, 600);
    for (const m of modules) {
      await cover(`${lang}:module-${m}`);
      await pickModule(`${lang}:module-${m}`, m, moduleIds(m).filter(x => !/^mr/.test(x)));
      for (const id of moduleIds(m)) {
        const tag = `${lang}:set-${id}`;
        await cover(tag);
        const how = await pickSet(tag, id);
        if (how === 'none') {
          // No Module Review row in the rail for this module: the marker is the record (and the covering page is closed by hand).
          put(`dom/${lang}/set-${safe(id)}.html`, `(no Module Review row in the rail for module ${m})\n`);
          await run(`${tag}:uncover`, `(leaveTopPanelForSet(), 1)`, 300);
          continue;
        }
        await closeDialogs(`dom/${lang}/set-${safe(id)}`);
        put(`dom/${lang}/set-${safe(id)}.html`, lines(await read(`${tag}:html`, `.week-panel[data-id="${id}"]`)));
        put(`dom/${lang}/rail-${safe(id)}.html`, lines(await read(`${tag}:rail`, '#nav-rail')));
        count('panels'); count('rails');
        if (SHOTS && lang === 'en') await shot(`shots/set-${safe(id)}.png`);
      }
    }
  }

  if (ON.sets) {
    /* Its own pass, on a fresh page, after every picture of a set is taken: the clicks below re-skin every card
       on the page, and done between two screenshots they left the next one half way through a change. */
    await boot('nav');
    await run('nav:lang', `setLang('en')`, 600);
    for (const m of modules) {
      await run(`nav:module-${m}`, `onModuleChange(${m})`, 300);
      for (const id of moduleIds(m)) {
        await run(`nav:set-${id}`, `activateSet(${JSON.stringify(id)})`, 150);
        /* Next to the end, Back to the start, then the One step / All steps switch both ways: which steps are
           open after every click (review R1-5: a Next that went backwards changed no HTML at rest). */
        const nav = await run(`nav:${id}`, `(() => { const p = document.querySelector('.week-panel[data-id=${JSON.stringify(id)}]'); if (!p) return null;
          return [...p.querySelectorAll('.dp')].map((dp, di) => {
            const steps = () => [...dp.querySelectorAll('li.step')];
            const open = () => steps().map((s, i) => s.classList.contains('collapsed') ? -1 : i).filter(i => i >= 0).join(',') + (dp.classList.contains('pd-showing') ? ' (part divider)' : '');
            const go = dir => { if (dp.classList.contains('pd-showing')) { const k = dp.querySelector('.stp-part-go'); if (k) { k.click(); return true; } }
              const b = dp.querySelector('[onclick^="stationStepNav(this,' + dir + ')"]'); if (!b) return false; b.click(); return true; };
            const out = { list: di, steps: steps().length, hasNext: !!dp.querySelector('[onclick^="stationStepNav(this,1)"]'), start: open(), next: [], back: [] };
            for (let k = 0; k < steps().length + 4; k++) { if (!go(1)) break; out.next.push(open()); }
            for (let k = 0; k < steps().length + 4; k++) { if (!go(-1)) break; out.back.push(open()); }
            if (typeof setStationView === 'function') { setStationView(false); out.allSteps = open(); setStationView(true); out.oneStep = open(); }
            return out; }); })()`, 50);
        put(`nav/set-${safe(id)}.json`, JSON.stringify(nav, null, 1) + '\n'); count('navWalks');
      }
    }
  }

  if (ON.keys) {
    /* A fresh page, English. Every control of every set that saves something
       (WRITERS, and every text box) is used for real; what it adds to or
       changes in the saved maps and localStorage is the record. An on/off
       control is then clicked back, and "restored" says whether everything
       returned to what it was. A dialog a click opens is recorded and closed. */
    await boot('keys');
    await run('keys:lang', `setLang('en')`, 600);
    await run('keys:def', `window.__goldKeys = function(id){
      const S = () => (${STATE});
      const panel = document.querySelector('.week-panel[data-id="' + id + '"]');
      if (!panel) return null;
      const flat = j => { const o = JSON.parse(j), out = {}; for (const c in o) for (const k in (o[c] || {})) out[c + '/' + k] = JSON.stringify(o[c][k]); return out; };
      const TOGGLES = /^(toggleStepDone|toggleSkill|toggleGotIt)\\(/;
      const H = t => { let a = 0xdeadbeef ^ t.length, c = 0x41c6ce57 ^ t.length; for (let i = 0; i < t.length; i++) { const ch = t.charCodeAt(i); a = Math.imul(a ^ ch, 2654435761); c = Math.imul(c ^ ch, 1597334677); }
        return (a >>> 0).toString(16).padStart(8, '0') + (c >>> 0).toString(16).padStart(8, '0') + ':' + t.length; };
      const SEL = ${JSON.stringify(WRITERS.map(w => `[onclick^="${w}("]`).join(', ') + ', textarea, input[type="text"]')};
      const n = panel.querySelectorAll(SEL).length, out = [];
      for (let i = 0; i < n; i++) {
        // Re-read each time: a click may redraw the step and replace the elements after it.
        const b = panel.querySelectorAll(SEL)[i];
        if (!b) { out.push({ i, gone: true }); continue; }
        const li = b.closest('.step'), lab = li && li.querySelector('.step-label');
        const h = b.getAttribute('onclick') || '', typed = !h;
        const before = S(); let err = null, mid = null;
        try {
          if (typed) { b.value = 'golden test'; ['input', 'change', 'blur'].forEach(t => b.dispatchEvent(new Event(t, { bubbles: true }))); }
          else b.click();
        } catch (e) { err = String(e && e.message); }
        mid = S();
        const rec = { i, what: typed ? 'typed: ' + (b.getAttribute('oninput') || b.getAttribute('onchange') || b.getAttribute('onblur') || b.id || b.className) : h, step: lab ? lab.textContent.trim() : '' };
        const dl = __goldDialogs(); if (dl.length) { rec.dialog = dl; __goldCloseDialogs(); }
        if (!typed && TOGGLES.test(h)) {
          const again = panel.querySelectorAll(SEL)[i];
          try { again && again.click(); } catch (e) { err = err || String(e && e.message); }
          const dl2 = __goldDialogs(); if (dl2.length) { rec.dialogBack = dl2; __goldCloseDialogs(); }
          rec.restored = S() === before;
        }
        const A = flat(before), M = flat(mid), wrote = {};
        for (const k in M) if (A[k] !== M[k]) wrote[k] = M[k];
        for (const k in A) if (!(k in M)) wrote[k] = '(removed)';
        rec.wrote = wrote; if (err) rec.error = err;
        const box = (panel.querySelectorAll(SEL)[i] || b).closest('.step, .sk-row, .skill-row, .practice-panel, .tab-panel') || panel;
        rec.drew = H(box.outerHTML);
        out.push(rec);
      }
      if (panel.querySelectorAll(SEL).length !== n) out.push({ note: 'the panel ended with ' + panel.querySelectorAll(SEL).length + ' controls, it began with ' + n });
      return out;
    }; 1`, 0);
    for (const m of modules) {
      await run(`keys:module-${m}`, `onModuleChange(${m})`, 300);
      for (const id of moduleIds(m)) {
        await run(`keys:set-${id}`, `activateSet(${JSON.stringify(id)})`, 150);
        const r = await run(`keys:click-${id}`, `window.__goldKeys(${JSON.stringify(id)})`, 100);
        put(`keys/set-${safe(id)}.json`, JSON.stringify(r, null, 1) + '\n');
        count('keySets'); count('controlsUsed', (r || []).filter(x => x.what).length); count('writes', (r || []).reduce((n, x) => n + Object.keys(x.wrote || {}).length, 0));
      }
    }
  }

  if (ON.keys) {
    /* The filled state (review R1-3). Every on/off control is switched ON and left on, the page is redrawn from its
       saved maps (a language switch there and back rebuilds every panel), and each set, reached the student's way,
       its rail and My progress are recorded as a student who has done the work sees them. */
    for (const m of modules) {
      await run(`filled:module-${m}`, `onModuleChange(${m})`, 250);
      for (const id of moduleIds(m)) {
        await run(`filled:set-${id}`, `activateSet(${JSON.stringify(id)})`, 100);
        await run(`filled:on-${id}`, `(() => { const p = document.querySelector('.week-panel[data-id=${JSON.stringify(id)}]'); if (!p) return 0; const SEL = '[onclick^="toggleStepDone("], [onclick^="toggleSkill("], [onclick^="toggleGotIt("]';
          const n = p.querySelectorAll(SEL).length; const dl = []; for (let i = 0; i < n; i++) { const b = p.querySelectorAll(SEL)[i]; if (b) b.click(); const d = __goldDialogs(); if (d.length) { dl.push(...d); __goldCloseDialogs(); } } return { n, dialogs: dl }; })()`, 50);
      }
    }
    await run('filled:redraw-es', `setLang('es')`, 700);
    await run('filled:redraw-en', `setLang('en')`, 700);
    for (const m of modules) {
      await cover(`filled:module-${m}`);
      await pickModule(`filled:module-${m}`, m, moduleIds(m).filter(x => !/^mr/.test(x)));
      for (const id of moduleIds(m)) {
        const tag = `filled:set-${id}`;
        await cover(tag);
        if ((await pickSet(tag, id)) === 'none') { put(`filled/set-${safe(id)}.html`, `(no Module Review row in the rail for module ${m})\n`); await run(`${tag}:uncover`, `(leaveTopPanelForSet(), 1)`, 300); continue; }
        await closeDialogs(`filled/set-${safe(id)}`);
        put(`filled/set-${safe(id)}.html`, lines(await read(`${tag}:html`, `.week-panel[data-id="${id}"]`)));
        put(`filled/rail-${safe(id)}.html`, lines(await read(`${tag}:rail`, '#nav-rail'))); count('filledPanels');
        if (SHOTS) await shot(`shots/filled-set-${safe(id)}.png`);
      }
    }
    await run('filled:my-progress', clickExpr('#my-progress-btn'), 800);
    await untilEq('filled: My progress opening from its rail button', `__goldOpen('my-progress-screen')`, true);
    put('filled/screen-my-progress.html', lines(await read('filled:my-progress:html', '#my-progress-screen', 2))); count('filledPanels');
    if (SHOTS) await shot('shots/filled-my-progress.png');
    put('filled/state.json', (await run('filled:state', `JSON.stringify(JSON.parse(${STATE}), null, 1)`, 0)) + '\n');
  }

  if (ON.gates) {
    /* The gates, for a student who is NOT the dev user (review R1-2). isGatePreviewer is made to answer "no", the
       saved maps are set to seven stages of a student's year, and for each stage the record is which sets, module
       gates and Module Reviews are locked, and the rail of four modules around the gate as that student sees it. */
    await boot('gates');
    await run('gates:lang', `setLang('en')`, 600);
    await run('gates:student', `(isGatePreviewer = () => false, 1)`, 0);
    /* The class setting "open through Module K" leaves every set up to K open, so the stages are counted from K.
       Two stages hold ticked STEPS only, no skills (review R2-5): a set a student has started, by a skill or a
       step, is never locked again. */
    const STAGES = `(() => { const got = ws => Object.fromEntries(ws.flatMap(w => (w.skills || []).map(k => [k.id, 'gotit']))); const mod = n => SETS.filter(w => w.moduleNum === n);
      const K = Math.max(1, classOpenThrough()), upTo = n => SETS.filter(w => w.moduleNum <= n);
      const step = w => w ? { [w.id + '-b-sec0-0']: true } : {};
      return { 'new-student': [{}, {}], 'all-open-modules-done': [got(upTo(K)), {}], 'first-set-of-next-module-done': [got([...upTo(K), ...mod(K + 1).slice(0, 1)]), {}],
        'next-module-done': [got(upTo(K + 1)), {}],
        'one-skill-started-further-on': [Object.assign(got(upTo(K)), Object.fromEntries(mod(K + 3).slice(0, 1).flatMap(w => (w.skills || []).slice(0, 1).map(k => [k.id, 'working'])))), {}],
        'one-step-ticked-in-the-second-set-of-the-next-module': [got(upTo(K)), step(mod(K + 1)[1])],
        'one-step-ticked-two-modules-on': [got(upTo(K)), step(mod(K + 2)[0])] }; })()`;
    const gateModules = (await run('gates:modules', `(() => { const K = Math.max(1, classOpenThrough()); return [K, K + 1, K + 2, K + 3].filter(n => SETS.some(w => w.moduleNum === n)); })()`, 0)) || [];
    for (const stage of (await run('gates:stages', `Object.keys(${STAGES})`, 0)) || []) {
      await run(`gates:${stage}`, `((s) => { progress = s[0]; completed = s[1]; return 1; })(${STAGES}[${JSON.stringify(stage)}])`, 0);
      const locks = await run(`gates:${stage}:locks`, `(S => JSON.stringify({ completed: Object.keys(completed), sets: S.map(w => [w.id, isSetLocked(w)]), moduleGate: MODULE_MANIFEST.map(m => [m.num, isModuleGateLocked(m.num)]),
        moduleReview: MODULE_MANIFEST.map(m => [m.num, isModuleReviewLocked(m.num)]), setComplete: S.map(w => [w.id, isSetComplete(w)]) }, null, 1))([...SETS].sort((a, b) => a.moduleNum - b.moduleNum))`, 0);
      put(`gates/${stage}.json`, locks + '\n'); count('gateStages');
      for (const m of gateModules) {
        await run(`gates:${stage}:module-${m}`, `onModuleChange(${m})`, 300);
        put(`gates/${stage}-rail-module-${m}.html`, lines(await read(`gates:${stage}:rail-${m}`, '#nav-rail'))); count('gateRails');
      }
      /* A locked set, asked for from ANOTHER set (review R2-5: from itself the test was blind): by a direct call
         (what a deep link or the resume card does: the gate must bounce it) and by its rail button (a preview). */
      const firstLocked = await run(`gates:${stage}:first-locked`, `([...SETS].sort((a, b) => a.moduleNum - b.moduleNum).find(w => isSetLocked(w) && !(w.locked || w.comingSoon)) || {}).id || null`, 0);
      if (firstLocked) {
        const home = await run(`gates:${stage}:home`, `(w => w ? { id: w.id, m: w.moduleNum, ids: SETS.filter(x => x.moduleNum === w.moduleNum).map(x => x.id) } : null)([...SETS].sort((a, b) => a.moduleNum - b.moduleNum).find(w => !isSetLocked(w) && w.id !== ${JSON.stringify(firstLocked)}))`, 0);
        if (!home) { fail(`gates:${stage}`, 'no open set to start the locked-set test from'); continue; }
        await pickModule(`gates:${stage}:home`, home.m, home.ids);
        await pickSet(`gates:${stage}:home`, home.id);
        const before = await run(`gates:${stage}:bounce`, `(() => { const was = (document.querySelector('.week-panel.active') || {}).dataset; activateSet(${JSON.stringify(firstLocked)}); const now = (document.querySelector('.week-panel.active') || {}).dataset;
          return JSON.stringify({ asked: ${JSON.stringify(firstLocked)}, activeBefore: was && was.id, activeAfter: now && now.id }); })()`, 250);
        const b = JSON.parse(before || 'null');
        if (b && b.activeBefore === firstLocked) fail(`gates:${stage}:bounce`, `the set asked for (${firstLocked}) was already the active one, so the test is blind`);
        const lm = await run(`gates:${stage}:locked-module`, `(w => ({ m: w.moduleNum, ids: SETS.filter(x => x.moduleNum === w.moduleNum).map(x => x.id) }))(SETS.find(w => w.id === ${JSON.stringify(firstLocked)}))`, 0);
        await pickModule(`gates:${stage}:peek`, lm.m, lm.ids);
        await run(`gates:${stage}:peek-click`, clickExpr(`#week-pills .wpill[data-id="${firstLocked}"]`), 300);
        const peek = await run(`gates:${stage}:peek-state`, `(() => { const p = document.querySelector('.week-panel[data-id=${JSON.stringify(firstLocked)}]'); const pill = document.querySelector('#week-pills .wpill[data-id=${JSON.stringify(firstLocked)}]');
          return JSON.stringify({ active: !!p && p.classList.contains('active'), peek: !!p && p.classList.contains('set-peek'), pill: pill ? pill.className : null, activeSet: (document.querySelector('.week-panel.active') || { dataset: {} }).dataset.id || null }); })()`, 0);
        put(`gates/${stage}-locked-set.json`, JSON.stringify({ bounce: b, peekByRailButton: JSON.parse(peek || 'null') }, null, 1) + '\n'); count('gateStages');
      }
    }
  }

  if (ON.screens || ON.games || ON.activities) {
    await boot('screens');
    await run('load-coach', `ensureCoachJs()`, 1500);
    const views = ON.games ? ((await run('games-meta', `(typeof GAMES_META !== 'undefined') ? GAMES_META.filter(g => !g.href).map(g => g.key) : []`, 0)) || []) : [];
    const acts = ON.activities ? ((await run('ca-list', `CLASS_ACTIVITIES.map(a => ({ id: a.id, steps: (a.steps || []).length }))`, 0)) || []) : [];
    for (const lang of LANGS) {
      await run(`${lang}:lang2`, `setLang('${lang}')`, 600);
      // Each screen by its rail button, the way a student opens it (review R2-2: Songs was recorded hidden).
      if (ON.screens) for (const [name, btn, sel] of [['songs', '#songs-hub-btn', '#songs-screen'], ['class-activities', '#class-activities-btn', '#class-activities-screen'],
        ['my-progress', '#my-progress-btn', '#my-progress-screen'], ['games-hub', '#games-btn', '#games-screen']]) {
        if (!(await run(`${lang}:screen-${name}:open?`, `__goldOpen(${JSON.stringify(sel.slice(1))})`, 0))) await run(`${lang}:screen-${name}`, clickExpr(btn), 800);
        await untilEq(`${lang}: ${name} opening from its rail button`, `__goldOpen(${JSON.stringify(sel.slice(1))})`, true);
        put(`dom/${lang}/screen-${name}.html`, lines(await read(`${lang}:screen-${name}:html`, sel))); count('screens');
        if (SHOTS && lang === 'en') await shot(`shots/screen-${name}.png`);
      }
      if (ON.games) {
        if (!(await run(`${lang}:games-open?`, `__goldOpen('games-screen')`, 0))) await run(`${lang}:games-open`, clickExpr('#games-btn'), 600);
        await untilEq(`${lang}: Games opening from its rail button`, `__goldOpen('games-screen')`, true);
        for (const v of views) {
          await run(`${lang}:game-${v}:hub`, `(gamesShow('hub'), 1)`, 200);
          await run(`${lang}:game-${v}`, clickExpr(`#games-panel [onclick="gamesShow('${v}')"]`), 350);
          put(`dom/${lang}/game-${safe(v)}.html`, lines(await read(`${lang}:game-${v}:html`, '#games-panel', 10))); count('games');
        }
        await run(`${lang}:games-close`, `(gamesShow('hub'), 1)`, 200);
      }
      if (ON.activities) {
        if (!(await run(`${lang}:ca-open?`, `__goldOpen('class-activities-screen')`, 0))) await run(`${lang}:ca-open`, clickExpr('#class-activities-btn'), 700);
        await untilEq(`${lang}: In class opening from its rail button`, `__goldOpen('class-activities-screen')`, true);
        for (const a of acts) {
          await run(`${lang}:ca-${a.id}`, `caFocusActivity(${JSON.stringify(a.id)})`, 350);
          // A card that is not on the student page (teacher-only, hidden) leaves no open card: the marker is then the record, and no picture.
          const has = await run(`${lang}:ca-${a.id}:has`, `!!document.querySelector('.ca-card[open]')`, 0);
          put(`dom/${lang}/activity-${safe(a.id)}.html`, lines(await read(`${lang}:ca-${a.id}:html`, `.ca-card[open]`, 4, !!has))); count(has ? 'activities' : 'activitiesNotOnThePage');
          if (SHOTS && lang === 'en' && has) await shot(`shots/activity-${safe(a.id)}.png`, '.ca-card[open]');
          for (let i = 1; i < a.steps && has; i++) {
            await run(`${lang}:ca-${a.id}-step${i}`, `caFocusGo(${JSON.stringify(a.id)}, ${i})`, 200);
            put(`dom/${lang}/activity-${safe(a.id)}-step${i}.html`, lines(await read(`${lang}:ca-${a.id}-step${i}:html`, `.ca-card[open]`, 2))); count('activitySteps');
          }
          await run(`${lang}:ca-${a.id}:close`, `(document.querySelectorAll('.ca-card[open]').forEach(c => { c.open = false; }), 1)`, 50);
        }
      }
    }
  }

  if (ON.activities) {
    /* What an In-Class Activity SAVES (review R1-4). A fresh page, English: every activity is opened and each of its
       saving controls is really clicked, 450 ms apart (Got it ignores a second click inside 400 ms); the record is
       what each click writes and a fingerprint of the card as it stands afterwards. */
    await boot('ca-keys');
    await run('ca-keys:lang', `setLang('en')`, 600);
    await run('ca-keys:open', clickExpr('#class-activities-btn'), 700);
    await run('ca-keys:def', `window.__goldCa = async function(id){
      const S = () => (${STATE});
      const flat = j => { const o = JSON.parse(j), out = {}; for (const c in o) for (const k in (o[c] || {})) out[c + '/' + k] = JSON.stringify(o[c][k]); return out; };
      const H = t => { let a = 0xdeadbeef ^ t.length, c = 0x41c6ce57 ^ t.length; for (let i = 0; i < t.length; i++) { const ch = t.charCodeAt(i); a = Math.imul(a ^ ch, 2654435761); c = Math.imul(c ^ ch, 1597334677); }
        return (a >>> 0).toString(16).padStart(8, '0') + (c >>> 0).toString(16).padStart(8, '0') + ':' + t.length; };
      const SEL = ${JSON.stringify(CA_WRITERS.map(w => `[onclick^="${w}("]`).join(', '))};
      const card = () => document.querySelector('.ca-card[open]');
      if (!card()) return [{ note: 'no open card' }];
      const out = [], n0 = card().querySelectorAll(SEL).length;
      for (let i = 0; i < 60; i++) {
        const c = card(); if (!c) { out.push({ i, note: 'the card closed' }); break; }
        const list = c.querySelectorAll(SEL); if (i >= list.length) break;
        const b = list[i], what = b.getAttribute('onclick'), before = S(); let err = null;
        try { b.click(); } catch (e) { err = String(e && e.message); }
        await new Promise(r => setTimeout(r, 450));
        const A = flat(before), M = flat(S()), wrote = {};
        for (const k in M) if (A[k] !== M[k]) wrote[k] = M[k];
        for (const k in A) if (!(k in M)) wrote[k] = '(removed)';
        const rec = { i, what, wrote, drew: card() ? H(card().outerHTML) : '(closed)' }; if (err) rec.error = err;
        out.push(rec);
      }
      out.push({ note: 'began with ' + n0 + ' controls' });
      return out;
    }; 1`, 0);
    for (const a of (await run('ca-keys:list', `CLASS_ACTIVITIES.map(a => ({ id: a.id }))`, 0)) || []) {
      await run(`ca-keys:${a.id}`, `caFocusActivity(${JSON.stringify(a.id)})`, 400);
      const r = await run(`ca-keys:${a.id}:click`, `window.__goldCa(${JSON.stringify(a.id)})`, 100);
      put(`keys/activity-${safe(a.id)}.json`, JSON.stringify(r, null, 1) + '\n');
      count('activityControlsUsed', (r || []).filter(x => x.what).length); count('activityWrites', (r || []).reduce((n, x) => n + Object.keys(x.wrote || {}).length, 0));
      await run(`ca-keys:${a.id}:close`, `(document.querySelectorAll('.ca-card[open]').forEach(c => { c.open = false; }), 1)`, 50);
    }
    put('keys/activities-state.json', (await run('ca-keys:state', `JSON.stringify(JSON.parse(${STATE}), null, 1)`, 0)) + '\n');
  }

  const STUB = (() => {
    const src = readFileSync(join(HERE, 'tools', 'console-layout-smoke.mjs'), 'utf8');
    const m = /const STUB = String\.raw`([\s\S]*?)`;\n\nasync function main/.exec(src);
    if (!m) throw new Error('could not find the STUB in tools/console-layout-smoke.mjs');
    return m[1];
  })();
  const goldStudent = `(currentUser = { uid: 'gold-student', displayName: 'Gold Student', email: 'gold-student@example.test', photoURL: null }, 1)`;

  if (ON.save) {
    /* What reaches Firestore (review R1-1). The console smoke test's in-memory Firestore stands in for the server,
       the signed-in user becomes a made-up student (not the dev user, so queueSave arms and flushSave sends), and
       after each real action flushSave() is awaited and the student's document is recorded as the server holds it.
       An action that finds no control fails the run (review R2-4). */
    await boot('save');
    await run('save:lang', `setLang('en')`, 600);
    await run('save:stub', STUB, 100);
    await run('save:student', goldStudent, 0);
    const doc = () => run('save:doc', `(async () => { await flushSave(); await new Promise(r => setTimeout(r, 50)); return JSON.stringify(__store.get('progress/gold-student') || null, null, 1); })()`, 50);
    const log = [];
    /* Each control is taken from the first set that has one; n picks the n-th such control in that set. `how`
       'click' clicks it, 'type' types into it (input, change, blur). The set it came from is part of the record. */
    await run('save:def', `window.__goldAct = async function(sel, n, how){
      const order = [...SETS].sort((a, b) => a.moduleNum - b.moduleNum), ids = [];
      order.forEach((w, i) => { ids.push([w.moduleNum, w.id]); if (!order[i + 1] || order[i + 1].moduleNum !== w.moduleNum) ids.push([w.moduleNum, 'mr' + w.moduleNum]); });
      let at = null;
      for (const [m, id] of ids) {
        if (m !== at) { onModuleChange(m); at = m; await new Promise(r => setTimeout(r, 300)); }
        activateSet(id);
        const b = document.querySelectorAll('.week-panel[data-id="' + id + '"] ' + sel)[n || 0];
        if (!b) continue;
        if (how === 'type') { b.value = 'golden typed answer'; ['input', 'change', 'blur'].forEach(t => b.dispatchEvent(new Event(t, { bubbles: true }))); return id + ': typed into ' + (b.getAttribute('oninput') || b.className); }
        b.click(); return id + ': ' + b.getAttribute('onclick');
      }
      return 'no such control: no set has ' + sel;
    }; 1`, 0);
    const ACTIONS = [['tick a step', '[onclick^="toggleStepDone("]', 0], ['tick a second step', '[onclick^="toggleStepDone("]', 1], ['un-tick the first step', '[onclick^="toggleStepDone("]', 0],
      ['mark a skill', '[onclick^="toggleSkill("]', 0], ['rate a skill', '[onclick^="setSkillLevel("]', 0], ['answer a quiz question', '[onclick^="onStepMcSelect("]', 0],
      ['answer a practice question', '[onclick^="onPracticeMcSelect("]', 0], ['log a clean rep', '[onclick^="logCleanRep("]', 0], ['finish a Module Review', '[onclick^="finishModuleReview("]', 0],
      ['type an answer', 'textarea.step-resp-input', 0, 'type'], ['save a Module Review reflection', 'textarea.reflection-ta', 0, 'type']];
    for (const [name, sel, n, how] of ACTIONS) {
      const what = await run(`save:${name}`, `window.__goldAct(${JSON.stringify(sel)}, ${n}, ${JSON.stringify(how || 'click')})`, 200);
      if (!what || /^no such control/.test(what)) fail(`save:${name}`, what || 'the action did not run');
      const d = await run(`save:${name}:dialogs`, `(d => { if (d.length) __goldCloseDialogs(); return d; })(__goldDialogs())`, 100);
      log.push({ action: name, control: what, dialogs: d && d.length ? d : undefined, serverDoc: JSON.parse((await doc()) || 'null') });
    }
    // An In-Class Activity step: ticked by Got it, and the last step ticked then unticked (a second Got it on the last step takes it back).
    await run('save:ca-open', clickExpr('#class-activities-btn'), 700);
    const caAct = async (name, expr) => {
      const what = await run(`save:${name}`, expr, 600);
      if (!what || /^no such control/.test(what)) fail(`save:${name}`, what || 'the action did not run');
      log.push({ action: name, control: what, serverDoc: JSON.parse((await doc()) || 'null') });
    };
    await caAct('Got it on an activity step', `(() => { for (const a of CLASS_ACTIVITIES) { caFocusActivity(a.id); const b = document.querySelector('.ca-card[open] [onclick^="caFocusGotIt("]');
      if (b) { b.click(); return a.id + ': ' + b.getAttribute('onclick'); } document.querySelectorAll('.ca-card[open]').forEach(c => { c.open = false; }); } return 'no such control: no activity has a Got it button'; })()`);
    /* The first activity (course data order) whose open card, for this student, shows Got it on its LAST step. Cards
       are closed first: asking for the card that is already open closes it. */
    const ladder = await run('save:ladder', `(() => { const close = () => document.querySelectorAll('.ca-card[open]').forEach(c => { c.open = false; });
      for (const a of CLASS_ACTIVITIES) { const n = (a.steps || []).length; if (n < 2) continue; close(); caFocusActivity(a.id); caFocusGo(a.id, n - 1);
        const want = "caFocusGotIt('" + a.id + "'," + (n - 1) + ")";
        if ([...document.querySelectorAll('.ca-card[open] [onclick^="caFocusGotIt("]')].some(b => b.getAttribute('onclick') === want)) return { id: a.id, last: n - 1 }; }
      close(); return null; })()`, 200);
    if (!ladder) fail('save:untick', 'no such control: no activity shows Got it on its last step');
    else {
      const lastGotIt = `(() => { const want = "caFocusGotIt('${ladder.id}',${ladder.last})"; const b = [...document.querySelectorAll('.ca-card[open] [onclick^="caFocusGotIt("]')].find(x => x.getAttribute('onclick') === want); if (!b) return 'no such control: no Got it on the last step of ${ladder.id}'; b.click(); return ${JSON.stringify(ladder.id)} + ': ' + b.getAttribute('onclick'); })()`;
      // The card may re-open on its first open step a moment after it is asked for: go to the last step first, as a student taps it.
      await caAct('tick the last step of an activity', `(caFocusGo(${JSON.stringify(ladder.id)}, ${ladder.last}), ${lastGotIt})`);
      await caAct('untick that step', `(caFocusGo(${JSON.stringify(ladder.id)}, ${ladder.last}), ${lastGotIt})`);
    }
    // A class period, picked in the picker a student who has not answered sees.
    await caAct('pick a class period', `(async () => { studentPeriod = ''; if (!maybeShowPeriodPicker()) return 'no such control: the period picker did not open'; const b = document.getElementById('period-btn-4'); if (!b) return 'no such control: #period-btn-4';
      b.click(); await new Promise(r => setTimeout(r, 400)); return 'period-btn-4: ' + b.getAttribute('onclick') + (document.getElementById('period-overlay') ? ' (the picker stayed open)' : ''); })()`);
    put('save/server-doc-after-each-action.json', JSON.stringify(log, null, 1) + '\n'); count('savesRecorded', log.length);
  }

  if (ON.play) {
    /* The games, played (review R2-1): see "The games" in the header. A fresh page with the virtual world; the made-up
       student and the stub server, so what a game saves reaches __store. Once the clock is virtual it only moves when
       this pass moves it, so nothing here waits on real time. */
    const vw = await page.send('Page.addScriptToEvaluateOnNewDocument', { source: `(${pageVirtualWorld.toString()})()` });
    await boot('play');
    await page.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: vw.identifier });
    if (!(await run('play:world', `typeof __gv === 'object' && AudioContext.name === 'FakeAudioContext'`, 0))) throw new Error('play: the virtual world did not install');
    await run('play:lang', `setLang('en')`, 600);
    await run('play:coach', `ensureCoachJs()`, 1000);
    await run('play:stub', STUB, 100);
    await run('play:student', goldStudent, 0);
    await run('play:player', `(${pagePlayer.toString()})(), 1`, 0);
    await run('play:games-open', clickExpr('#games-btn'), 800);
    await untilEq('play: Games opening from its rail button', `__goldOpen('games-screen')`, true);
    const left = (await run('play:left-out', `GAMES_META.filter(g => g.href).map(g => g.key + ' (' + g.href + ')')`, 0)) || [];
    const keysToPlay = (await run('play:list', `GAMES_META.filter(g => !g.href).map(g => g.key)`, 0)) || [];
    console.log(`golden: play: ${keysToPlay.length} games to play (${keysToPlay.join(', ')}); LEFT OUT: ${left.join(', ') || 'none'} (a page of its own, played by dragging pegs: not driven)`);
    put('play/left-out.json', JSON.stringify(left, null, 1) + '\n');
    await run('play:virtual', '__gv.on()', 0);
    const serverGames = () => run('play:server', `(async () => { await flushSave(); return JSON.stringify(((__store.get('progress/gold-student') || {}).games) || null); })()`, 0);
    const playOne = async (name, rootSel, endSel) => {
      await run(`play:${name}:intro`, '__gv.advance(1500)', 0);
      put(`play/${name}-first-screen.html`, lines(await run(`play:${name}:first`, htmlExpr(rootSel), 0)));
      if (SHOTS) await shot(`shots/play-${name}-first.png`, null, false);
      await run(`play:${name}:begin`, `__goldPlayBegin(${JSON.stringify(name)}, ${JSON.stringify(rootSel)})`, 0);
      let r = null;
      for (let s = 0; s < 60; s++) { r = await run(`play:${name}:${s}s`, '__goldPlayTick()', 0); if (!r || r.done) break; }
      put(`play/${name}-end.html`, lines(await run(`play:${name}:end`, htmlExpr(endSel || rootSel), 0)));
      if (SHOTS) await shot(`shots/play-${name}-end.png`, null, false);
      const res = await run(`play:${name}:result`, '__goldPlayEnd()', 0);
      if (res && !res.startedByItsCard && !res.clicks.some(c => /(Start|PlayAdaptive|GoReady|Spin)\(|coachStartCheck\(/.test(c.what))) fail(`play:${name}`, 'no Start-like button was ever pressed (clicks: ' + JSON.stringify(res.clicks.slice(0, 6)) + ')');
      return res;
    };
    for (const key of keysToPlay) {
      await run(`play:${key}:hub`, `(gamesShow('hub'), 1)`, 0);
      await run(`play:${key}:hub-settle`, '__gv.advance(500)', 0);
      await run(`play:${key}:card`, clickExpr(`#games-panel [onclick="gamesShow('${key}')"]`), 0);
      const res = await playOne(key, '#games-panel');
      await run(`play:${key}:leave`, `(gamesShow('hub'), 1)`, 0);
      await run(`play:${key}:after`, '__gv.advance(3000)', 0);
      put(`play/${safe(key)}.json`, JSON.stringify({ ...res, serverGames: JSON.parse((await serverGames()) || 'null') }, null, 1) + '\n'); count('gamesPlayed');
    }
    /* The Listening Coach: the first melody and the first chord Coach button a student can see (its step open) in course order. */
    await run('play:games-close', `(gamesShow('hub'), typeof closeGamesScreen === 'function' && closeGamesScreen(), 1)`, 0);
    await run('play:games-close-settle', '__gv.advance(1000)', 0);
    for (const [kind, sel] of [['melody', '.coach-btn[data-midis]'], ['chords', '.coach-btn[data-chords]']]) {
      const where = await run(`play:coach-${kind}:find`, `(async () => { const order = [...SETS].sort((a, b) => a.moduleNum - b.moduleNum);
        // "All steps" (the switch a student has at the top of the lesson), so a Coach button in a later step shows.
        for (const w of order) { if (lastModuleNum !== w.moduleNum) { onModuleChange(w.moduleNum); await __gv.advance(400); } activateSet(w.id); setStationView(false); await __gv.advance(100);
          let b = null;
          for (const x of document.querySelectorAll('.week-panel[data-id="' + w.id + '"] ${sel}')) {
            // A Coach button in a closed step: open the step by its head, as a student does.
            const li = x.closest('li.step'), head = li && li.classList.contains('collapsed') && li.querySelector('.step-head');
            if (!x.getClientRects().length && head) { head.click(); await __gv.advance(200); }
            if (x.getClientRects().length) { b = x; break; }
          }
          if (b) { b.scrollIntoView({ block: 'center', behavior: 'instant' }); b.click(); await __gv.advance(800); return w.id; } }
        return null; })()`, 0);
      if (!where) { fail(`play:coach-${kind}`, `no set has ${sel}`); continue; }
      if (!(await run(`play:coach-${kind}:open`, `!!coachBody()`, 0))) { fail(`play:coach-${kind}`, 'the Coach did not open from its button in ' + where); continue; }
      const res = await playOne(`coach-${kind}`, '#coach-body');
      put(`play/coach-${kind}.json`, JSON.stringify({ set: where, ...res, phase: await run(`play:coach-${kind}:phase`, `coach ? coach.phase : null`, 0), serverGames: JSON.parse((await serverGames()) || 'null') }, null, 1) + '\n'); count('coachPlayed');
      await run(`play:coach-${kind}:close`, `(typeof coachClose === 'function' && coachClose(), setStationView(true), 1)`, 0);
      await run(`play:coach-${kind}:settle`, '__gv.advance(2000)', 0);
    }
    put('play/state.json', (await run('play:state', `JSON.stringify(JSON.parse(${STATE}), null, 1)`, 0)) + '\n');
  }

  if (ON.tools) {
    await boot('tools');
    for (const lang of LANGS) {
      await run(`${lang}:tools-lang`, `setLang('${lang}')`, 600);
      const rec = async name => { put(`tools/${lang}/${name}.html`, lines(await read(`${lang}:tools-${name}:html`, '#fab-group', 2))); count('tools'); if (SHOTS && lang === 'en') await shot(`shots/tools-${name}.png`, null, false); };
      await run(`${lang}:tools-metro`, clickExpr('#fab-metro'), 250); await rec('metro');
      for (const id of (await run(`${lang}:tools-meters`, `[...document.querySelectorAll('#metro-popup [id^="meter-"]')].map(e => e.id)`, 0)) || []) {
        await run(`${lang}:tools-${id}`, clickExpr('#' + id), 150); await rec('metro-' + id);
      }
      await run(`${lang}:tools-ladder`, clickExpr('#ladder-toggle'), 200); await rec('metro-ladder-on');
      await run(`${lang}:tools-ladder-off`, clickExpr('#ladder-toggle'), 200); await rec('metro-ladder-off');
      await run(`${lang}:tools-timer`, clickExpr('#fab-timer'), 250); await rec('timer');
      for (const id of (await run(`${lang}:tools-presets`, `[...document.querySelectorAll('#timer-presets [id^="tp-"]')].map(e => e.id)`, 0)) || []) {
        await run(`${lang}:tools-${id}`, clickExpr('#' + id), 150); await rec('timer-' + id);
      }
      await run(`${lang}:tools-rec`, clickExpr('#fab-rec'), 300); await rec('rec');
      await run(`${lang}:tools-rec-close`, clickExpr('#fab-rec'), 200); await rec('closed');
    }
  }

  if (ON.livequiz) {
    await boot('livequiz');
    await run('lq:def', LQ_DEF, 0);
    const quizzes = (await run('lq:list', `Object.keys(LIVE_QUIZZES)`, 0)) || [];
    // [file name, session state, the student's own pick: none, the right answer or the wrong one]
    const VIEWS = [['lobby', 'lobby', null], ['question', 'question', null], ['question-picked', 'question', 'correct'], ['reveal-right', 'reveal', 'correct'],
      ['reveal-wrong', 'reveal', 'wrong'], ['reveal-no-answer', 'reveal', null], ['ended', 'ended', null]];
    for (const lang of LANGS) {
      await run(`${lang}:lq-lang`, `setLang('${lang}')`, 600);
      // Through the router, as the invite and the banner open it (review R2-2: the screen was recorded hidden).
      await run(`${lang}:lq-open`, `(location.hash = '#live-quiz', 1)`, 500);
      await untilEq(`${lang}: the live quiz screen opening from #live-quiz`, `__goldOpen('live-quiz-screen')`, true);
      for (const q of quizzes) for (const [name, state, pick] of VIEWS) {
        await run(`${lang}:lq-${q}-${name}`, `(() => { const g = __goldLq(${JSON.stringify(q)}); lqSession = g.sessions[${JSON.stringify(state)}];
          lqMyAnswer = ${pick ? `{ qIndex: 0, choice: g.${pick} }` : 'null'}; lqRenderStudent(); return 1; })()`, 150);
        put(`livequiz/${lang}/student-${safe(q)}-${name}.html`, lines(await read(`${lang}:lq-${q}-${name}:html`, '#live-quiz-screen'))); count('liveQuizStudent');
        if (SHOTS && lang === 'en') await shot(`shots/livequiz-student-${safe(q)}-${name}.png`, null, false);
      }
      await run(`${lang}:lq-clear`, `(lqSession = null, lqMyAnswer = null, lqRenderStudent(), 1)`, 100);
      await run(`${lang}:lq-close`, `(history.back(), 1)`, 500);
    }
  }

  if (ON.pages) {
    /* The pages that are files of their own. Which ones exist is read from the site folder, so a page a rebuild
       drops or adds shows up as a missing or extra file. They take their language from localStorage 'gc-lang'. */
    const files = [...readdirSync(join(ROOT, 'tabs')).filter(f => f.endsWith('.html')).sort().map(f => 'tabs/' + f),
      ...readdirSync(ROOT).filter(f => f.endsWith('.html') && f !== 'index.html').sort()];
    for (const lang of LANGS) for (const f of files) {
      const name = safe(f.replace(/\.html$/, ''));
      await run(`${lang}:page-${name}:lang`, `(localStorage.setItem('gc-lang', '${lang}'), 1)`, 0);
      await covTake();
      stepStart(`${lang}:page-${name}`);
      await page.send('Page.navigate', { url: `${base}/${f}` });
      try { await until(`${lang}: ${f} loading`, `document.readyState === 'complete' && location.pathname.endsWith(${JSON.stringify('/' + f)})`); }
      catch (e) { events.push({ step: `${lang}:page-${name}`, kind: 'step-failed', text: e.message }); failures.push({ step: `${lang}:page-${name}`, text: e.message }); }
      put(`pages/${lang}/${name}.html`, lines(await read(`${lang}:page-${name}:html`, 'body', 3, false))); count('pages');
      if (SHOTS) await shot(`shots/${lang}-page-${name}.png`, null, false);
    }
    await covTake();
    await page.send('Page.navigate', { url: `${base}/index.html` });
    await sleep(500);
    await run('pages:lang-back', `(localStorage.setItem('gc-lang', 'en'), 1)`, 0);
  }

  if (ON.console || ON.livequiz) {
    /* The teacher console, against the fake class the console smoke test already uses: its STUB (an in-memory
       Firestore, 30 made-up students, a seeded board) is read out of that file, so there is one copy of it. */
    await covTake();
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
    stepStart('console: navigate');
    await page.send('Page.navigate', { url: `${base}/index.html?teacher=true` });
    await until('console: the page loading', `typeof ensureTeacherJs === 'function' && typeof CLASS_ACTIVITIES !== 'undefined' && location.search === '?teacher=true'`);
    await run('console:load', 'ensureTeacherJs()', 300);
    await until('console: teacher.js loading', `typeof showTeacherApp === 'function'`);
    await run('console:stub', STUB, 100);
    await run('console:show', `showTeacherApp({ uid: 'stub-teacher', email: TEACHER_EMAIL, displayName: 'Teacher' }).then(() => 1)`, 300);
    await until('console: the activities list', `!!document.querySelector('#t-grid-container [data-ta-list]')`);
    if (ON.livequiz) {
      // The projector stage, in the console's Live quiz view, for the same made-up game.
      await run('lq-stage:def', LQ_DEF, 0);
      await run('lq-stage:view', clickExpr('#t-side [data-view="livequiz"]'), 500);
      for (const q of (await run('lq-stage:list', `Object.keys(LIVE_QUIZZES)`, 0)) || []) for (const state of ['lobby', 'question', 'reveal', 'ended']) {
        await run(`lq-stage:${q}-${state}`, `(() => { lqTSession = __goldLq(${JSON.stringify(q)}).sessions[${JSON.stringify(state)}]; lqTAnswers = []; lqPaintStage(); if (typeof lqPaintControls === 'function') lqPaintControls(); return 1; })()`, 150);
        put(`livequiz/stage-${safe(q)}-${state}.html`, lines(await read(`lq-stage:${q}-${state}:html`, '.lq-shell'))); count('liveQuizStage');
        if (SHOTS) await shot(`shots/livequiz-stage-${safe(q)}-${state}.png`, null, false);
      }
      await run('lq-stage:clear', `(lqTSession = null, lqPaintStage(), typeof lqPaintControls === 'function' && lqPaintControls(), 1)`, 150);
    }
    if (ON.console) {
      const views = (await run('console:views', `[...document.querySelectorAll('#t-side [data-view]')].map(b => b.dataset.view)`, 0)) || [];
      for (const v of views) {
        await run(`console:view-${v}`, clickExpr(`#t-side [data-view=${JSON.stringify(v)}]`), 300);
        put(`console/view-${safe(v)}.html`, lines(await read(`console:view-${v}:html`, '#teacher-app', 3))); count('consoleViews');
        if (SHOTS) await shot(`shots/console-view-${safe(v)}.png`, null, false);
      }
      await run('console:activities', clickExpr('#t-side [data-view="activities"]'), 400);
      // Every way the list can be filtered, then "All" so every activity has a row to pick.
      const filters = (await run('console:filters', `[...document.querySelectorAll('[data-ta-filter]')].map(b => b.dataset.taFilter)`, 0)) || [];
      for (const f of [...filters.filter(x => x !== 'all'), 'all']) {
        await run(`console:filter-${f}`, clickExpr(`[data-ta-filter=${JSON.stringify(f)}]`), 250);
        put(`console/list-${safe(f)}.html`, lines(await read(`console:filter-${f}:html`, '[data-ta-list]'))); count('consoleLists');
      }
      const rows = (await run('console:rows', `[...new Set([...document.querySelectorAll('[data-ta-pick]')].map(r => r.dataset.id))]`, 0)) || [];
      for (const id of rows) {
        await run(`console:pick-${id}`, clickExpr(`[data-ta-pick][data-id=${JSON.stringify(id)}]`), 250);
        const tabs = (await run(`console:tabs-${id}`, `[...document.querySelectorAll('[data-ta-tab]')].map(t => t.dataset.taTab)`, 0)) || [];
        for (const tab of tabs) {
          await run(`console:${id}:${tab}`, clickExpr(`[data-ta-tab=${JSON.stringify(tab)}]`), 150);
          put(`console/activity-${safe(id)}-${safe(tab)}.html`, lines(await read(`console:${id}:${tab}:html`, '[data-ta-detail]', 4))); count('consoleActivityTabs');
        }
      }
      for (const uid of ['stub-uid-01', 'stub-uid-13', 'stub-uid-25']) {
        await run(`console:students`, clickExpr('#t-side [data-view="students"]'), 400);
        await run(`console:student-${uid}`, clickExpr(`[data-open-student][data-uid="${uid}"]`), 400);
        put(`console/student-${uid}.html`, lines(await read(`console:student-${uid}:html`, '#teacher-app', 3))); count('consoleStudents');
      }
      const cfg = () => run('console:cfg', `JSON.stringify(__store.get('config/class'))`, 0);
      const flatten = (o, pre = '', out = {}) => { for (const k of Object.keys(o || {})) { const v = o[k]; if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, pre + k + '.', out); else out[pre + k] = JSON.stringify(v); } return out; };
      const changedSince = (before, after) => { const c = {}; for (const k in after) if (before[k] !== after[k]) c[k] = after[k]; for (const k in before) if (!(k in after)) c[k] = '(removed)'; return c; };
      /* What the console WRITES (review R1-7). On one activity's Settings tab each control is really clicked, and
         config/class is recorded after every click. Un-assign runs before Archive (review R2-4: archiving removed the
         control first), and a control that is not there fails the run. */
      const cid = 'ca-21', writes = [];
      await run('console:w-view', clickExpr('#t-side [data-view="activities"]'), 400);
      await run('console:w-all', clickExpr('[data-ta-filter="all"]'), 250);
      for (const [name, sel, how] of [['hide', `[data-set-activity-hidden][data-state="hide"]`], ['show', `[data-set-activity-hidden][data-state="show"]`], ['optional', `[data-set-activity-optional][data-state="optional"]`],
        ['required', `[data-set-activity-optional][data-state="required"]`], ['pin', `[data-set-activity-pin][data-state="on"]`], ['unpin', `[data-set-activity-pin][data-state="off"]`],
        ['clear the gate for one student', `[data-set-activity-clear]`], ['set the release date', `[data-set-activity-date]`, 'date'], ['unpublish', `[data-publish-activity]`],
        ['un-assign', `[data-unassign-activity]`], ['archive', `[data-set-activity-archived]`], ['delete', `[data-delete-activity]`]]) {
        // Re-open the activity's Settings tab each time: a write may redraw the detail or move the row.
        await run(`console:w-pick:${name}`, `(() => { const r = document.querySelector('[data-ta-pick][data-id="${cid}"]'); if (r) r.click(); const t = document.querySelector('[data-ta-tab="settings"]'); if (t) t.click(); return !!r; })()`, 250);
        const before = flatten(JSON.parse((await cfg()) || '{}'));
        const did = await run(`console:w:${name}`, `(() => { const e = document.querySelector('[data-ta-detail] ' + ${JSON.stringify(sel)}); if (!e) return 'no such control';
          ${how === 'date' ? `e.value = '2026-12-01'; e.dispatchEvent(new Event('change', { bubbles: true })); return 'set to 2026-12-01';` : `e.click(); return 'clicked';`} })()`, 500);
        if (did !== 'clicked' && did !== 'set to 2026-12-01') fail(`console:w:${name}`, `${did || 'the action did not run'} (${sel} on ${cid}'s Settings tab)`);
        writes.push({ action: name, did, changed: changedSince(before, flatten(JSON.parse((await cfg()) || '{}'))) });
      }
      put('console/writes.json', JSON.stringify(writes, null, 1) + '\n'); count('consoleWrites', writes.length);

      /* The Arrange board and the other activity writers, driven for real (review R2-1). Each action finds its
         control on the board as it stands (the first that fits), acts the way a teacher does (a click, a typed
         number, a picked option, a drag), and the record is what config/class gained and a fingerprint of the
         board after it. A control that is not there fails the run. */
      await run('console:board-view', clickExpr('#t-side [data-view="activities"]'), 400);
      await run('console:board-def', `window.__goldBoard = {
        H: t => { let a = 0xdeadbeef ^ t.length, c = 0x41c6ce57 ^ t.length; for (let i = 0; i < t.length; i++) { const ch = t.charCodeAt(i); a = Math.imul(a ^ ch, 2654435761); c = Math.imul(c ^ ch, 1597334677); }
          return (a >>> 0).toString(16).padStart(8, '0') + (c >>> 0).toString(16).padStart(8, '0') + ':' + t.length; },
        // The cards a teacher can move: an archived card sits in its own fold and is not draggable.
        sections: () => [...document.querySelectorAll('[data-board-section]')].map(s => ({ s, cards: [...s.querySelectorAll('[data-board-card][draggable="true"]')] })),
        drag(card, target, below) { const dt = new DataTransfer(); const r = target.getBoundingClientRect(); const o = { bubbles: true, cancelable: true, dataTransfer: dt, clientX: r.left + 10, clientY: below ? r.bottom - 3 : r.top + 3 };
          card.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: dt }));
          target.dispatchEvent(new DragEvent('dragenter', o)); target.dispatchEvent(new DragEvent('dragover', o)); target.dispatchEvent(new DragEvent('drop', o));
          card.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt })); },
        order: () => [...document.querySelectorAll('[data-board-section]')].map(s => s.dataset.module + ': ' + [...s.querySelectorAll('[data-board-card]')].map(c => c.dataset.id).join(' ')).join(' | ')
      }; 1`, 0);
      const BOARD = [
        ['open the board', `(() => { const b = document.querySelector('[data-ta-board-open]'); if (!b) return 'no such control: [data-ta-board-open]'; b.click(); return 'clicked'; })()`],
        ['bump a card down', `(() => { const sec = __goldBoard.sections().find(x => x.cards.length >= 3); const b = sec && sec.cards[0].querySelector('[data-board-bump][data-dir="down"]'); if (!b) return 'no such control: [data-board-bump][data-dir="down"]'; window.__gbId = b.dataset.id; b.click(); return 'bumped ' + b.dataset.id + ' down'; })()`],
        ['bump it back up', `(() => { const b = document.querySelector('[data-board-bump][data-dir="up"][data-id="' + window.__gbId + '"]'); if (!b) return 'no such control: [data-board-bump][data-dir="up"] on ' + window.__gbId; b.click(); return 'bumped ' + window.__gbId + ' up'; })()`],
        ['move a card to number 3', `(() => { const sec = __goldBoard.sections().find(x => x.cards.length >= 4); const i = sec && sec.cards[sec.cards.length - 1].querySelector('[data-board-number]'); if (!i) return 'no such control: [data-board-number]'; i.value = '3'; i.dispatchEvent(new Event('change', { bubbles: true })); return 'moved ' + i.dataset.id + ' to 3'; })()`],
        ['move a card to another unit', `(() => { const s = [...document.querySelectorAll('[data-board-card] [data-move-activity]')].find(x => [...x.options].some(o => o.value !== '' && !o.selected)); if (!s) return 'no such control: [data-move-activity]';
          const o = [...s.options].filter(o => o.value !== '' && !o.selected)[1] || [...s.options].filter(o => o.value !== '' && !o.selected)[0]; s.value = o.value; s.dispatchEvent(new Event('change', { bubbles: true })); return 'moved ' + s.dataset.id + ' to unit ' + o.value; })()`],
        ['drag a card onto another card', `(() => { const secs = __goldBoard.sections().filter(x => x.cards.length >= 3); if (secs.length < 2) return 'no such control: two units with 3 cards'; const card = secs[0].cards[0], target = secs[1].cards[1];
          __goldBoard.drag(card, target, true); return 'dragged ' + card.dataset.id + ' below ' + target.dataset.id; })()`],
        ['drag a card inside its unit', `(() => { const sec = __goldBoard.sections().find(x => x.cards.length >= 4); if (!sec) return 'no such control: a unit with 4 cards'; const card = sec.cards[sec.cards.length - 1], target = sec.cards[0];
          __goldBoard.drag(card, target, false); return 'dragged ' + card.dataset.id + ' above ' + target.dataset.id; })()`],
        ['drag a card to Built', `(() => { const built = document.querySelector('[data-board-built]'); const sec = __goldBoard.sections().find(x => x.cards.length >= 2); if (!built || !sec) return 'no such control: [data-board-built]'; const card = sec.cards[sec.cards.length - 1];
          __goldBoard.drag(card, built, false); return 'dragged ' + card.dataset.id + ' to Built'; })()`],
        ['un-assign a card', `(() => { const b = document.querySelector('[data-board-section] [data-unassign-activity]'); if (!b) return 'no such control: [data-unassign-activity]'; b.click(); return 'un-assigned ' + b.dataset.id; })()`],
        ['hide a unit', `(() => { const b = document.querySelector('[data-set-module-hidden][data-state="hide"]'); if (!b) return 'no such control: [data-set-module-hidden][data-state="hide"]'; window.__gbMod = b.dataset.module; b.click(); return 'hid unit ' + b.dataset.module; })()`],
        ['show the unit again', `(() => { const b = document.querySelector('[data-set-module-hidden][data-state="show"][data-module="' + window.__gbMod + '"]'); if (!b) return 'no such control: [data-set-module-hidden][data-state="show"] for unit ' + window.__gbMod; b.click(); return 'showed unit ' + window.__gbMod; })()`],
        ['open the rename box', `(() => { const b = document.querySelector('[data-board-card] [data-rename-activity]'); if (!b) return 'no such control: [data-rename-activity]'; window.__gbRen = b.dataset.id; b.click(); return 'renaming ' + b.dataset.id; })()`],
        ['rename it', `(() => { const i = document.querySelector('.t-act-title-edit[data-id="' + window.__gbRen + '"]'), s = document.querySelector('[data-rename-save][data-id="' + window.__gbRen + '"]'); if (!i || !s) return 'no such control: .t-act-title-edit / [data-rename-save] for ' + window.__gbRen;
          i.value = 'Golden renamed activity'; s.click(); return 'renamed ' + window.__gbRen; })()`],
        ['open the rename box again', `(() => { const p = document.querySelector('[data-rename-activity][data-id="' + window.__gbRen + '"]'); if (!p) return 'no such control: [data-rename-activity] for ' + window.__gbRen; p.click(); return 'renaming ' + window.__gbRen; })()`],
        ['undo the rename', `(() => { const b = document.querySelector('[data-rename-reset][data-id="' + window.__gbRen + '"]'); if (!b) return 'no such control: [data-rename-reset] for ' + window.__gbRen; b.click(); return 'reset ' + window.__gbRen; })()`],
        ['open the Who picker and pick a student', `(() => { const d = document.querySelector('[data-board-who]'); if (!d) return 'no such control: [data-board-who]'; window.__gbWho = d.dataset.id; d.open = true; d.dispatchEvent(new Event('toggle'));
          const c = d.querySelector('[data-set-activity-student]:not(:checked)'); if (!c) return 'no such control: [data-set-activity-student] in the Who picker of ' + d.dataset.id; c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); return 'picked ' + c.dataset.uid + ' for ' + d.dataset.id; })()`],
        ['back to the whole class', `(() => { let d = document.querySelector('[data-board-who][data-id="' + window.__gbWho + '"]'); if (d && !d.open) { d.open = true; d.dispatchEvent(new Event('toggle')); } d = document.querySelector('[data-board-who][data-id="' + window.__gbWho + '"]');
          const b = (d && d.querySelector('[data-activity-whole-class]')) || document.querySelector('[data-activity-whole-class][data-id="' + window.__gbWho + '"]'); if (!b) return 'no such control: [data-activity-whole-class] for ' + window.__gbWho; b.click(); return 'whole class for ' + window.__gbWho; })()`],
        ['close the board', `(() => { const b = document.querySelector('[data-ta-board-back]'); if (!b) return 'no such control: [data-ta-board-back]'; b.click(); return 'clicked'; })()`],
        ['Play Along now', `(() => { for (const r of document.querySelectorAll('[data-ta-pick]')) { r.click(); const t = document.querySelector('[data-ta-tab="settings"]'); if (t) t.click();
            const b = document.querySelector('[data-ta-detail] [data-set-activity-playalong][data-state="now"]'); if (b) { window.__gbPa = b.dataset.id; b.click(); return 'Play Along now for ' + b.dataset.id; } }
          return 'no such control: [data-set-activity-playalong] on any activity'; })()`],
        ['Play Along on its date', `(() => { const r = document.querySelector('[data-ta-pick][data-id="' + window.__gbPa + '"]'); if (r) r.click(); const t = document.querySelector('[data-ta-tab="settings"]'); if (t) t.click();
          const b = document.querySelector('[data-ta-detail] [data-set-activity-playalong][data-state="date"]'); if (!b) return 'no such control: [data-set-activity-playalong][data-state="date"] for ' + window.__gbPa; b.click(); return 'Play Along on its date for ' + window.__gbPa; })()`],
      ];
      const board = [];
      for (const [name, expr] of BOARD) {
        const before = flatten(JSON.parse((await cfg()) || '{}'));
        const did = await run(`console:board:${name}`, expr, 700);
        if (!did || /^no such control/.test(did)) fail(`console:board:${name}`, did || 'the action did not run');
        const after = flatten(JSON.parse((await cfg()) || '{}'));
        const seen = await run(`console:board:${name}:seen`, `({ order: __goldBoard.order(), board: __goldBoard.H((document.querySelector('#t-grid-container') || document.body).innerHTML) })`, 0);
        board.push({ action: name, did, changed: changedSince(before, after), ...(seen || {}) });
      }
      put('console/board.json', JSON.stringify(board, null, 1) + '\n'); count('boardActions', board.length);
      put('console/store.json', (await run('console:store', `JSON.stringify([...__store.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1), null, 1)`, 0)) + '\n');
    }
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 657, deviceScaleFactor: 1, mobile: false });
  }

  /* Pictures that must differ (review R2-2: 49 set pictures were one picture of the In class screen). */
  if (SHOTS && existsSync(join(outDir, 'shots'))) {
    // Each group holds pictures of DIFFERENT things (two sets, two games' first screens …), never two states of one.
    const groups = [[/^set-/, 'sets'], [/^filled-set-/, 'filled sets'], [/^livequiz-student-/, 'live quiz screens'], [/^activity-/, 'activities'],
      [/^play-.*-first\.png$/, 'games (first screens)'], [/^play-.*-end\.png$/, 'games (end screens)'], [/^screen-/, 'screens'], [/^console-view-/, 'console views']];
    const files = readdirSync(join(outDir, 'shots')).filter(f => f.endsWith('.png'));
    for (const [re, what] of groups) {
      const byHash = new Map();
      for (const f of files.filter(f => re.test(f))) {
        const h = createHash('sha1').update(readFileSync(join(outDir, 'shots', f))).digest('hex');
        if (!byHash.has(h)) byHash.set(h, []); byHash.get(h).push(f);
      }
      for (const [, fs] of byHash) if (fs.length > 1) fail(`pictures of ${what}`, `${fs.length} pictures that must differ are byte-identical: ${fs.slice(0, 6).join(', ')}${fs.length > 6 ? ' …' : ''}`);
      count('pictureGroupsChecked');
    }
  }

  if (Object.keys(dialogLog).length) put('dialogs.json', JSON.stringify(dialogLog, null, 1) + '\n');
  if (COVERAGE) {
    await covTake();
    const report = {};
    for (const [file, all] of [...covAll].sort()) { const ran = covRan.get(file) || new Set(); report[file] = { ran: ran.size, of: all.size, notRun: [...all].filter(([k]) => !ran.has(k)).map(([, n]) => n).sort() }; }
    writeFileSync(COVERAGE, JSON.stringify(report, null, 1) + '\n');
    for (const f of ['teacher-activities.js', 'coach-runner.js', 'coach-chords.js', 'coach-core.js']) if (report[f]) console.log(`golden: coverage ${f}: ${report[f].ran} of ${report[f].of} top-level functions ran`);
  }
  put('errors.json', JSON.stringify(events, null, 1) + '\n');
  put('failures.json', JSON.stringify(failures, null, 1) + '\n');
  put('meta.json', JSON.stringify({ tool: TOOL_VERSION, root: ROOT, langs: LANGS, parts: PARTS.filter(p => ON[p]), shots: SHOTS, failures: failures.length, counts, seconds: Math.round((Date.now() - t0) / 1000) }, null, 1) + '\n');
  console.log(`golden: ${sets.length} sets in ${modules.length} modules (${LANGS.join(' + ').toUpperCase()}): ` + Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ') + `; ${events.length} error event(s) recorded; ${Math.round((Date.now() - t0) / 1000)} s`);
  console.log(`golden: written to ${outDir}`);
  if (failures.length) { console.log(`golden: ✗ the snapshot failed ${failures.length} of its own checks (failures.json): a compare will refuse it`); exitCode = 1; }
  else console.log('golden: ✓ the snapshot passed its own checks');
} catch (e) { console.error('golden: could not run —', e && e.message); exitCode = 2; }
finally {
  if (chromeProc) { await new Promise(res => { chromeProc.once('exit', res); chromeProc.kill(); setTimeout(() => { try { chromeProc.kill('SIGKILL'); } catch { /* gone */ } res(); }, 3000); }); }
  for (const f of cleanup.reverse()) { try { f(); } catch { /* best effort */ } }
}
process.exit(exitCode);
