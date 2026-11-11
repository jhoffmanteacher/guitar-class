#!/usr/bin/env node
/* Golden snapshot: what the site SHOWS and what it SAVES (2026-11-11).

   Part of the whole-site rebuild plan (todo.md). checks.mjs reads source text
   and smoke.mjs looks for errors; neither can say "the rebuilt site behaves
   like the old one". This tool can. It boots a site folder in headless Chrome
   at 1366x657 with a fixed clock and a seeded Math.random, signs in through
   the dev bypass, and writes to a folder:

     data/        SETS, CLASS_ACTIVITIES and MODULE_MANIFEST as the browser holds them
     dom/<lang>/  the rendered HTML of every set and Module Review panel, the
                  left rail for every set, the Songs / In class / My progress /
                  Games screens, every game view and every In-Class Activity
                  card with each of its steps
     pages/<lang>/ the pages that open on their own: every Song Journey page
                  (tabs/*.html), the Tuning Simulator, the mood chart and the
                  404 page, as rendered, each with a screenshot under --shots
     tools/<lang>/ the floating tools: the metronome (each meter, the tempo
                  ladder), the timer (each preset) and the recorder popup, each
                  opened by a real click. The tuner is not opened: it shows
                  what the microphone hears.
     livequiz/    the live quiz with a made-up game: for every quiz, the
                  student screen (EN + ES) in the lobby, on a question, with an
                  answer picked, on a reveal after a right and after a wrong
                  answer, and at the end; and the projector stage in the console
                  for the same four states. No clock is shown (limitSec 0).
     console/     the teacher console (index.html?teacher=true) against the fake
                  class of tools/console-layout-smoke.mjs (30 made-up students,
                  never live data): every sidebar view, every activity's
                  Preview / Students / Settings tab, and three students' pages
     keys/        for every set: every control that saves something (done
                  buttons, checklist skills and levels, quiz choices, rep dots,
                  text boxes ...) is really used, and what it writes to the saved
                  maps and localStorage is recorded (the progress keys a rebuild
                  must keep)
     shots/       with --shots: a PNG of every set panel (English)
     errors.json  every exception, console error or failed step met on the way

   Two snapshots are then compared file by file:

     node tools/golden.mjs --out <dir>                snapshot this checkout
     node tools/golden.mjs --out <dir> --root <site>  snapshot another site folder
                                                      (the old site, or the rebuild)
     node tools/golden.mjs --compare <dirA> <dirB>    exit 0 only if they are identical
     --en-only          English only
     --only <parts>     comma-separated: data, sets, keys, screens, games, activities, pages, console, tools, livequiz
     --shots            also write PNGs of every set (English)
     --chrome <path>    Chrome/Chromium binary (or CHROME=...)

   THE CONTRACT: what a rebuild must keep for this tool to run on it.
   1. The rendered HTML itself. Every recorded view is compared byte for byte,
      so every class name, id, data- attribute and inline handler string
      (onclick="toggleStepDone(this,'w1-b-sec0-0')") is frozen with it.
   2. The page hooks the tool finds things by: .week-panel[data-id], .dp,
      li.step(.collapsed), .step-label, .stp-part-go, #nav-rail, #songs-screen,
      #class-activities-screen, #my-progress-screen, #games-screen,
      #games-panel, .ca-card[open], #fab-group, #fab-metro, #fab-timer,
      #fab-rec, #metro-popup [id^=meter-], #ladder-toggle, #timer-presets
      [id^=tp-], #live-quiz-screen, .lq-shell, #teacher-app, #t-side
      [data-view], #t-grid-container [data-ta-list], [data-ta-filter],
      [data-ta-pick], [data-ta-tab], [data-ta-detail], [data-open-student]
      [data-uid], the [data-set-activity-*] / [data-publish-activity] /
      [data-unassign-activity] / [data-delete-activity] controls, the inline
      handler names in WRITERS and CA_WRITERS and stationStepNav, and the
      localStorage key gc-lang.
   3. Names reachable from the page's global scope as classic-script globals
      (the state names are ASSIGNED to, bare):
      functions   devBypass, setLang, onModuleChange, activateSet,
                  ensureCoachJs, openSongsScreen, openClassActivitiesScreen,
                  openMyProgressScreen, openGamesScreen, openLiveQuizScreen,
                  gamesShow, caFocusActivity, caFocusGo, setStationView,
                  flushSave, isSetLocked, isSetComplete, isModuleGateLocked,
                  isModuleReviewLocked, classOpenThrough, isGatePreviewer
                  (replaced), ensureTeacherJs, showTeacherApp, dayStr, lqQuiz,
                  lqType, lqTargetNotes, lqTargetIds, lqFretId, lqPcNamePool,
                  lqPcNameOf, lqPcNames, lqRenderStudent, lqPaintStage,
                  lqPaintControls
      data        SETS, CLASS_ACTIVITIES, MODULE_MANIFEST, GAMES_META,
                  LIVE_QUIZZES, TEACHER_EMAIL
      state       completed, progress, responses, caStepDone, classActivities,
                  exitChecks, practiceLog, games, streak, currentUser, db,
                  ensureDb, firebase, lqSession, lqMyAnswer, lqTSession,
                  lqTAnswers
   The code behind all of that is free.

   No network: Chrome is started so that only 127.0.0.1 resolves. What the
   site draws must not depend on whether Google's servers answered.

   Like smoke.mjs: Node 22+, Chrome or Chromium, no other dependency; never
   run it while a smoke.mjs or pm-e2e.mjs run is going. */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, statSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir, platform } from 'node:os';
import { join, extname, normalize, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ALL_PARTS = ['data', 'sets', 'keys', 'gates', 'save', 'screens', 'games', 'activities', 'pages', 'console', 'tools', 'livequiz'];
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
function compare(a, b) {
  /* A snapshot that stopped half way, or two snapshots of different parts, must never earn a green tick
     (review R1-10). meta.json is written last, so a folder without one is an unfinished run. */
  const meta = d => { try { return JSON.parse(readFileSync(join(d, 'meta.json'), 'utf8')); } catch { return null; } };
  const ma = meta(a), mb = meta(b);
  if (!ma || !mb) { console.log(`golden: ✗ ${!ma ? a : b} has no meta.json: that snapshot did not finish, so there is nothing to compare`); return 1; }
  const shape = m => JSON.stringify({ parts: m.parts, langs: m.langs, shots: !!m.shots });
  if (shape(ma) !== shape(mb)) { console.log(`golden: ✗ the two snapshots were not taken the same way: A ${shape(ma)}, B ${shape(mb)}`); return 1; }
  const partial = [ALL_PARTS.filter(p => !ma.parts.includes(p)).map(p => 'no ' + p), ma.langs.length < 2 ? ['English only'] : [], ma.shots ? [] : ['no screenshots']].flat();
  const A = listFiles(a).filter(f => f !== 'meta.json'), B = listFiles(b).filter(f => f !== 'meta.json'), setB = new Set(B), setA = new Set(A);
  const onlyA = A.filter(f => !setB.has(f)), onlyB = B.filter(f => !setA.has(f)), diff = [];
  let same = 0;
  for (const f of A) {
    if (!setB.has(f)) continue;
    const x = readFileSync(join(a, f)), y = readFileSync(join(b, f));
    if (x.equals(y)) { same++; continue; }
    let where = '';
    if (!f.endsWith('.png')) {
      const lx = x.toString('utf8').split('\n'), ly = y.toString('utf8').split('\n');
      let i = 0; while (i < lx.length && i < ly.length && lx[i] === ly[i]) i++;
      let n = 0; for (let j = 0; j < Math.max(lx.length, ly.length); j++) if (lx[j] !== ly[j]) n++;
      where = `first at line ${i + 1} (${n} line(s) differ)\n      A: ${(lx[i] ?? '(end of file)').slice(0, 200)}\n      B: ${(ly[i] ?? '(end of file)').slice(0, 200)}`;
    }
    diff.push({ f, where });
  }
  console.log(`golden: ${A.length} files in A, ${B.length} in B: ${same} identical, ${diff.length} different, ${onlyA.length} only in A, ${onlyB.length} only in B`);
  for (const f of onlyA.slice(0, 30)) console.log(`  only in A: ${f}`);
  for (const f of onlyB.slice(0, 30)) console.log(`  only in B: ${f}`);
  for (const d of diff.slice(0, 40)) console.log(`  differs:   ${d.f}${d.where ? '\n      ' + d.where : ''}`);
  if (diff.length > 40) console.log(`  ... and ${diff.length - 40} more`);
  if (!A.length || !B.length) { console.log('golden: ✗ an empty snapshot proves nothing: one of the two folders holds no files'); return 1; }
  const bad = diff.length + onlyA.length + onlyB.length;
  console.log(bad ? `golden: ✗ the two snapshots differ in ${bad} file(s)` : partial.length
    ? `golden: ✓ PARTIAL: the two snapshots are identical (${same} files), but this is not the whole comparison: ${partial.join(', ')}`
    : `golden: ✓ the two snapshots are identical (${same} files; every part, both languages, with screenshots)`);
  return bad ? 1 : 0;
}
if (args.includes('--compare')) {
  const i = args.indexOf('--compare'), a = args[i + 1], b = args[i + 2];
  if (!a || !b || !existsSync(a) || !existsSync(b)) { console.error('golden: --compare needs two snapshot folders that exist'); process.exit(2); }
  process.exit(compare(resolve(a), resolve(b)));
}

/* ── snapshot ────────────────────────────────────────────────────────── */
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
const outDir = resolve(OUT);
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
async function openPage(port) {
  const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = new Map(); const handlers = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
    else if (m.method) handlers.forEach(h => h(m.method, m.params));
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
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
   at Wednesday 2026-11-11 18:00 UTC (a running clock put a different
   millisecond into every saved timestamp) and Chrome is started in the
   America/Los_Angeles time zone whatever the machine's own is (review R1-9: the
   same site gave 36 different files under TZ=UTC), so it is 10:00 in the
   morning on a school day on every machine; and window.__goldSeed() puts
   Math.random back to its start: it is called before every view is opened, so
   what a view draws at random does not depend on how many animation frames
   ran before it. */
const FREEZE = `(() => {
  const RealDate = Date, start = RealDate.UTC(2026, 10, 11, 18, 0, 0);
  const now = () => start;
  function FakeDate(...a) { if (!new.target) return new RealDate(now()).toString(); return a.length ? new RealDate(...a) : new RealDate(now()); }
  FakeDate.prototype = RealDate.prototype; FakeDate.now = now; FakeDate.parse = RealDate.parse; FakeDate.UTC = RealDate.UTC;
  window.Date = FakeDate;
  /* Math.random gives each CALLER its own fixed sequence: the value depends on the names of the three functions
     nearest the call and on how many times that same chain has asked since the last __goldSeed(), not on how
     many other things drew a number first. One shared sequence made "Keep it sharp" pick different skills from
     run to run (whichever timer fired first got the first number). Function names, not file names or line
     numbers, so the same code cut into other files draws the same numbers. */
  const counts = new Map();
  window.__goldSeed = () => { counts.clear(); };
  const mix = t => { let a = 0x9e3779b9 ^ t.length; for (let i = 0; i < t.length; i++) { a = Math.imul(a ^ t.charCodeAt(i), 2654435761); a ^= a >>> 15; } a = Math.imul(a ^ a >>> 16, 2246822507); a = Math.imul(a ^ a >>> 13, 3266489909); return ((a ^ a >>> 16) >>> 0) / 4294967296; };
  Math.random = () => {
    const names = (new Error().stack || '').split('\\n').slice(2, 5).map(l => { const m = /^\\s*at (?:async )?(?:new )?([^\\s(]+) \\(/.exec(l); return m ? m[1] : '-'; }).join('<');
    const n = (counts.get(names) || 0) + 1; counts.set(names, n);
    return mix(names + '#' + n);
  };
})();`;

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

const chrome = findChrome();
if (!chrome) { console.error('golden: no Chrome or Chromium found (use --chrome <path>)'); process.exit(2); }
let chromeProc = null, exitCode = 0; const cleanup = [];
const t0 = Date.now();
try {
  const prof = mkdtempSync(join(tmpdir(), 'gc-golden-chrome-'));
  const cdp = await freePort();
  chromeProc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required', '--no-first-run', '--disable-gpu', '--hide-scrollbars', '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1', 'about:blank'], { stdio: 'ignore', env: { ...process.env, TZ: 'America/Los_Angeles' } });
  cleanup.push(() => rmSync(prof, { recursive: true, force: true }));
  for (let i = 0; i < 60; i++) { try { await fetch(`http://127.0.0.1:${cdp}/json/version`); break; } catch { await sleep(250); } }
  const site = await serve(ROOT); cleanup.push(() => site.srv.close());
  const base = `http://127.0.0.1:${site.port}`;
  console.log(`golden: snapshot of ${ROOT} …`);

  const page = await openPage(cdp);
  let step = 'boot'; const events = []; const counts = {};
  const count = (k, n = 1) => { counts[k] = (counts[k] || 0) + n; };
  page.on((method, p) => {
    let ev = null;
    if (method === 'Runtime.exceptionThrown') { const d = p.exceptionDetails; ev = { step, kind: 'exception', text: String((d.exception && (d.exception.description || d.exception.value)) || d.text).split('\n')[0] }; }
    else if (method === 'Runtime.consoleAPICalled' && p.type === 'error') ev = { step, kind: 'console.error', text: p.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300) };
    // Network noise is dropped, but never a broken name or type: "openYoutubeOverlay is not defined" holds a noise word and is a real fault (review R1-12).
    if (ev && (!NOISE.test(ev.text) || (ev.kind === 'exception' && /ReferenceError|TypeError|SyntaxError|RangeError/.test(ev.text)))) events.push(ev);
  });
  await page.send('Runtime.enable'); await page.send('Page.enable');
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 657, deviceScaleFactor: 1, mobile: false });
  await page.send('Page.addScriptToEvaluateOnNewDocument', { source: FREEZE });
  const run = async (name, expr, wait = 150) => {
    step = name;
    try { if (wait) await page.evalJs('window.__goldSeed && window.__goldSeed()'); const v = await page.evalJs(expr); if (wait) await sleep(wait); return v; }
    catch (e) { events.push({ step: name, kind: 'step-failed', text: String(e.message).split('\n')[0].slice(0, 300) }); return null; }
  };
  /* Boot: wait for the page's own scripts, not for a load event (the blank start page fires one too, and a
     busy machine then found devBypass not yet defined). Then sign in, and wait until SETS (filled as the
     module files arrive after sign-in) has held the same non-zero length for a second. */
  const until = async (what, expr) => {
    let last = null, held = 0, why = '';
    for (let i = 0; i < 160 && held < 4; i++) {
      await sleep(250);
      let v = 0; try { v = await page.evalJs(expr); why = ''; } catch (e) { v = 0; why = String(e.message).split('\n')[0]; }
      if (v && v === last) held++; else held = 0;
      last = v;
    }
    if (held < 4) throw new Error(`${what} did not happen in 40 s (last read ${JSON.stringify(last)}${why ? ', ' + why : ''})`);
  };
  const boot = async (tag) => {
    await page.send('Page.navigate', { url: `${base}/index.html` });
    await until(`${tag}: the page's scripts loading`, `typeof devBypass === 'function' && document.readyState === 'complete'`);
    // Without the fixed clock and the per-caller random numbers nothing recorded can be compared: stop rather than record.
    if (!(await page.evalJs(`typeof window.__goldSeed === 'function' && Date.now() === Date.now() && new Date().toISOString()`).catch(() => false))) throw new Error(`${tag}: the fixed clock did not install in the page`);
    await run(`${tag}:devBypass`, 'devBypass()', 500);
    await until(`${tag}: the sets loading after sign-in`, `typeof SETS !== 'undefined' ? SETS.length : 0`);
    await sleep(1500);
  };
  /* A view is recorded once it has stopped changing: two reads 200 ms apart must agree (a lyric sheet sets its
     width a moment after it opens; an activity card must hold still for 0.8 s, calm = 4). A game view must hold still for 2 s (calm = 10): Note Hunt shows "Starting
     the mic…" for a second or more, longer on a busy machine, before its real first screen. After 12 s a view
     is recorded as it is and the wobble is noted in errors.json. */
  const read = async (name, sel, calm = 1) => {
    let prev = await run(name, htmlExpr(sel), 0), same = 0;
    for (let i = 0; i < 60; i++) { await sleep(200); const cur = await run(name, htmlExpr(sel), 0); if (cur === prev) { if (++same >= calm) return cur; } else same = 0; prev = cur; }
    events.push({ step: name, kind: 'never-settled', text: 'the view was still changing after 12 s' });
    return prev;
  };
  /* A screenshot is kept once two taken 150 ms apart are the same picture: a view whose HTML has settled can
     still be half way through a fade or a scroll. After 3 s it is kept as it is and noted in errors.json. */
  const shot = async (rel) => {
    // Running animations are put at a fixed point first: one that ends is jumped to its end, one that loops is held at its start.
    try { await page.evalJs(`(document.getAnimations ? document.getAnimations() : []).forEach(a => { try { a.finish(); } catch (e) { try { a.currentTime = 0; a.pause(); } catch (e2) {} } }); 1`); } catch { /* the page is between two documents */ }
    let prev = (await page.send('Page.captureScreenshot', { format: 'png' })).data;
    for (let i = 0; i < 20; i++) { await sleep(150); const cur = (await page.send('Page.captureScreenshot', { format: 'png' })).data; if (cur === prev) { prev = cur; put(rel, Buffer.from(prev, 'base64')); count('shots'); return; } prev = cur; }
    events.push({ step: 'shot ' + rel, kind: 'never-settled', text: 'the picture was still changing after 3 s' });
    put(rel, Buffer.from(prev, 'base64')); count('shots');
  };

  await boot('boot');
  const sets = (await run('list-sets', `SETS.map(s => ({ id: s.id, m: s.moduleNum }))`, 0)) || [];
  const modules = [...new Set(sets.map(s => s.m).filter(Boolean))].sort((a, b) => a - b);
  if (!sets.length) throw new Error('the page booted with no SETS: nothing to snapshot');

  if (ON.data) {
    // Functions cannot be compared as data; their source text can. SETS fills in the order the module files arrive, so it is sorted by module (sets keep their order inside one).
    const dump = name => `JSON.stringify(${name}, (k, v) => typeof v === 'function' ? 'function: ' + String(v) : v, 1)`;
    for (const [file, name] of [['sets', '[...SETS].sort((a, b) => a.moduleNum - b.moduleNum)'], ['class-activities', 'CLASS_ACTIVITIES'], ['module-manifest', 'MODULE_MANIFEST']]) {
      const j = await run('data:' + name, dump(name), 0);
      put(`data/${file}.json`, (j || '(missing)') + '\n'); count('data');
    }
  }

  if (ON.data) {
    // The page's <head> as it stands after boot (title, manifest, font links, the scripts the page pulled in).
    put('data/index-head.html', lines(await read('data:head', 'head', 3))); count('data');
    /* The files the rebuild leaves alone (todo.md, "Do not refactor"), byte for byte: the tables every string,
       style and rule comes from. A changed Spanish string that only shows after a click is caught here. */
    const KEEP = ['i18n.js', 'styles.css', 'firestore.rules', 'class-activities.js', 'config-main.js', 'guitar-diagrams.js', 'practice-minutes-config.js', 'practice-minutes.js',
      'live-quiz.js', 'fab-tools.js', 'tuner.js', 'manifest.json', ...readdirSync(ROOT).filter(f => /^module-\d+\.js$/.test(f) || /^trainer-.*\.js$/.test(f)).sort(),
      ...readdirSync(join(ROOT, 'tabs')).sort().map(f => 'tabs/' + f)];
    for (const f of KEEP) { put(`files/${f}`, existsSync(join(ROOT, f)) ? readFileSync(join(ROOT, f)) : '(missing)'); count('filesKept'); }
  }

  if (ON.sets) for (const lang of LANGS) {
    await run(`${lang}:lang`, `setLang('${lang}')`, 600);
    for (const m of modules) {
      await run(`${lang}:module-${m}`, `onModuleChange(${m})`, 300);
      for (const id of [...sets.filter(x => x.m === m).map(x => x.id), `mr${m}`]) {
        await run(`${lang}:set-${id}`, `activateSet(${JSON.stringify(id)})`, 150);
        put(`dom/${lang}/set-${safe(id)}.html`, lines(await read(`${lang}:set-${id}:html`, `.week-panel[data-id="${id}"]`)));
        put(`dom/${lang}/rail-${safe(id)}.html`, lines(await read(`${lang}:rail-${id}:html`, '#nav-rail')));
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
      for (const id of [...sets.filter(x => x.m === m).map(x => x.id), `mr${m}`]) {
        await run(`nav:set-${id}`, `activateSet(${JSON.stringify(id)})`, 150);
        /* Next to the end, Back to the start, then the One step / All steps switch both ways: which steps are
           open after every click (review R1-5: a Next that went backwards changed no HTML at rest). */
        const nav = await run(`nav:${id}`, `(() => { const p = document.querySelector('.week-panel[data-id=${JSON.stringify(id)}]'); if (!p) return null;
          // One walk per step list (.dp) in the panel. The buttons are clicked whether or not their tab is the one showing.
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
       returned to what it was. */
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
        if (!typed && TOGGLES.test(h)) {
          const again = panel.querySelectorAll(SEL)[i];
          try { again && again.click(); } catch (e) { err = err || String(e && e.message); }
          rec.restored = S() === before;
        }
        const A = flat(before), M = flat(mid), wrote = {};
        for (const k in M) if (A[k] !== M[k]) wrote[k] = M[k];
        for (const k in A) if (!(k in M)) wrote[k] = '(removed)';
        rec.wrote = wrote; if (err) rec.error = err;
        // What the click drew: a short fingerprint of the step (or the control's own block) as it stands right after it.
        const box = (panel.querySelectorAll(SEL)[i] || b).closest('.step, .sk-row, .skill-row, .practice-panel, .tab-panel') || panel;
        rec.drew = H(box.outerHTML);
        out.push(rec);
      }
      if (panel.querySelectorAll(SEL).length !== n) out.push({ note: 'the panel ended with ' + panel.querySelectorAll(SEL).length + ' controls, it began with ' + n });
      return out;
    }; 1`, 0);
    for (const m of modules) {
      await run(`keys:module-${m}`, `onModuleChange(${m})`, 300);
      for (const id of [...sets.filter(x => x.m === m).map(x => x.id), `mr${m}`]) {
        await run(`keys:set-${id}`, `activateSet(${JSON.stringify(id)})`, 150);
        const r = await run(`keys:click-${id}`, `window.__goldKeys(${JSON.stringify(id)})`, 100);
        put(`keys/set-${safe(id)}.json`, JSON.stringify(r, null, 1) + '\n');
        count('keySets'); count('controlsUsed', (r || []).filter(x => x.what).length); count('writes', (r || []).reduce((n, x) => n + Object.keys(x.wrote || {}).length, 0));
      }
    }
  }

  if (ON.keys) {
    /* The filled state (review R1-3: saved ticks that never showed again changed nothing the tool looked at).
       The page now holds every answer the pass above gave. Every on/off control is switched ON and left on, the
       page is redrawn from its saved maps (a language switch there and back rebuilds every panel), and each set,
       its rail and My progress are recorded as a student who has done the work sees them. */
    for (const m of modules) {
      await run(`filled:module-${m}`, `onModuleChange(${m})`, 250);
      for (const id of [...sets.filter(x => x.m === m).map(x => x.id), `mr${m}`]) {
        await run(`filled:set-${id}`, `activateSet(${JSON.stringify(id)})`, 100);
        await run(`filled:on-${id}`, `(() => { const p = document.querySelector('.week-panel[data-id=${JSON.stringify(id)}]'); if (!p) return 0; const SEL = '[onclick^="toggleStepDone("], [onclick^="toggleSkill("], [onclick^="toggleGotIt("]';
          const n = p.querySelectorAll(SEL).length; for (let i = 0; i < n; i++) { const b = p.querySelectorAll(SEL)[i]; if (b) b.click(); } return n; })()`, 50);
      }
    }
    await run('filled:redraw-es', `setLang('es')`, 700);
    await run('filled:redraw-en', `setLang('en')`, 700);
    for (const m of modules) {
      await run(`filled:module2-${m}`, `onModuleChange(${m})`, 300);
      for (const id of [...sets.filter(x => x.m === m).map(x => x.id), `mr${m}`]) {
        await run(`filled:set2-${id}`, `activateSet(${JSON.stringify(id)})`, 150);
        put(`filled/set-${safe(id)}.html`, lines(await read(`filled:set-${id}:html`, `.week-panel[data-id="${id}"]`)));
        put(`filled/rail-${safe(id)}.html`, lines(await read(`filled:rail-${id}:html`, '#nav-rail'))); count('filledPanels');
        if (SHOTS) await shot(`shots/filled-set-${safe(id)}.png`);
      }
    }
    await run('filled:my-progress', 'openMyProgressScreen()', 800);
    put('filled/screen-my-progress.html', lines(await read('filled:my-progress:html', '#my-progress-screen', 2))); count('filledPanels');
    if (SHOTS) await shot('shots/filled-my-progress.png');
    put('filled/state.json', (await run('filled:state', `JSON.stringify(JSON.parse(${STATE}), null, 1)`, 0)) + '\n');
  }

  if (ON.gates) {
    /* The gates, for a student who is NOT the dev user (review R1-2: the dev bypass skips every gate, so a set
       gate that locked everyone changed nothing). isGatePreviewer is made to answer "no", the skills map is set
       to five stages of a student's year, and for each stage the record is which sets, module gates and Module
       Reviews are locked, and the rail of four modules around the gate as that student sees it. */
    await boot('gates');
    await run('gates:lang', `setLang('en')`, 600);
    await run('gates:student', `(isGatePreviewer = () => false, 1)`, 0);
    /* The class setting "open through Module K" leaves every set up to K open, so the stages are counted from
       K: nothing done; everything through K done; then the first set of K+1; then all of K+1; and one skill
       only started two modules further on (a set a student has started is never locked again). */
    const STAGES = `(() => { const got = ws => Object.fromEntries(ws.flatMap(w => (w.skills || []).map(k => [k.id, 'gotit']))); const mod = n => SETS.filter(w => w.moduleNum === n);
      const K = Math.max(1, classOpenThrough()), upTo = n => SETS.filter(w => w.moduleNum <= n);
      return { 'new-student': {}, 'all-open-modules-done': got(upTo(K)), 'first-set-of-next-module-done': got([...upTo(K), ...mod(K + 1).slice(0, 1)]), 'next-module-done': got(upTo(K + 1)),
        'one-skill-started-further-on': Object.assign(got(upTo(K)), Object.fromEntries(mod(K + 3).slice(0, 1).flatMap(w => (w.skills || []).slice(0, 1).map(k => [k.id, 'working'])))) }; })()`;
    const gateModules = (await run('gates:modules', `(() => { const K = Math.max(1, classOpenThrough()); return [K, K + 1, K + 2, K + 3].filter(n => SETS.some(w => w.moduleNum === n)); })()`, 0)) || [];
    for (const stage of (await run('gates:stages', `Object.keys(${STAGES})`, 0)) || []) {
      await run(`gates:${stage}`, `(progress = ${STAGES}[${JSON.stringify(stage)}], completed = {}, 1)`, 0);
      const locks = await run(`gates:${stage}:locks`, `(S => JSON.stringify({ sets: S.map(w => [w.id, isSetLocked(w)]), moduleGate: MODULE_MANIFEST.map(m => [m.num, isModuleGateLocked(m.num)]),
        moduleReview: MODULE_MANIFEST.map(m => [m.num, isModuleReviewLocked(m.num)]), setComplete: S.map(w => [w.id, isSetComplete(w)]) }, null, 1))([...SETS].sort((a, b) => a.moduleNum - b.moduleNum))`, 0);
      put(`gates/${stage}.json`, locks + '\n'); count('gateStages');
      for (const m of gateModules) {
        await run(`gates:${stage}:module-${m}`, `onModuleChange(${m})`, 300);
        put(`gates/${stage}-rail-module-${m}.html`, lines(await read(`gates:${stage}:rail-${m}`, '#nav-rail'))); count('gateRails');
      }
      // A locked set, opened the two ways a student can: a plain click (bounced by the gate) and the read-only preview.
      const firstLocked = await run(`gates:${stage}:first-locked`, `([...SETS].sort((a, b) => a.moduleNum - b.moduleNum).find(w => isSetLocked(w) && !(w.locked || w.comingSoon)) || {}).id || null`, 0);
      if (firstLocked) {
        await run(`gates:${stage}:module-of-locked`, `onModuleChange(SETS.find(w => w.id === ${JSON.stringify(firstLocked)}).moduleNum)`, 300);
        const before = await run(`gates:${stage}:bounce`, `(() => { const was = (document.querySelector('.week-panel.active') || {}).dataset; activateSet(${JSON.stringify(firstLocked)}); const now = (document.querySelector('.week-panel.active') || {}).dataset;
          return JSON.stringify({ asked: ${JSON.stringify(firstLocked)}, activeBefore: was && was.id, activeAfter: now && now.id }); })()`, 200);
        await run(`gates:${stage}:peek`, `activateSet(${JSON.stringify(firstLocked)}, { peek: true })`, 250);
        const peek = await run(`gates:${stage}:peek-state`, `(() => { const p = document.querySelector('.week-panel[data-id=${JSON.stringify(firstLocked)}]'); return JSON.stringify({ active: !!p && p.classList.contains('active'), peek: !!p && p.classList.contains('set-peek') }); })()`, 0);
        put(`gates/${stage}-locked-set.json`, JSON.stringify({ bounce: JSON.parse(before || 'null'), peek: JSON.parse(peek || 'null') }, null, 1) + '\n'); count('gateStages');
      }
    }
  }

  if (ON.screens || ON.games || ON.activities) {
    await boot('screens');
    await run('load-coach', `ensureCoachJs()`, 1500);
    const views = ON.games ? ((await run('games-meta', `(typeof GAMES_META !== 'undefined') ? GAMES_META.filter(g => !g.href).map(g => g.view || g.id || g.key) : []`, 0)) || []) : [];
    const acts = ON.activities ? ((await run('ca-list', `CLASS_ACTIVITIES.map(a => ({ id: a.id, steps: (a.steps || []).length }))`, 0)) || []) : [];
    for (const lang of LANGS) {
      await run(`${lang}:lang2`, `setLang('${lang}')`, 600);
      if (ON.screens) for (const [name, expr, sel] of [['songs', 'openSongsScreen()', '#songs-screen'], ['class-activities', 'openClassActivitiesScreen()', '#class-activities-screen'],
        ['my-progress', 'openMyProgressScreen()', '#my-progress-screen'], ['games-hub', 'openGamesScreen()', '#games-screen']]) {
        await run(`${lang}:screen-${name}`, expr, 800);
        put(`dom/${lang}/screen-${name}.html`, lines(await read(`${lang}:screen-${name}:html`, sel))); count('screens');
        if (SHOTS && lang === 'en') await shot(`shots/screen-${name}.png`);
      }
      if (ON.games) {
        await run(`${lang}:games-open`, 'openGamesScreen()', 500);
        for (const v of views) {
          await run(`${lang}:game-${v}`, `gamesShow(${JSON.stringify(v)})`, 350);
          put(`dom/${lang}/game-${safe(v)}.html`, lines(await read(`${lang}:game-${v}:html`, '#games-panel', 10))); count('games');
          if (SHOTS && lang === 'en') await shot(`shots/game-${safe(v)}.png`);
        }
      }
      if (ON.activities) {
        await run(`${lang}:ca-open`, 'openClassActivitiesScreen()', 700);
        for (const a of acts) {
          await run(`${lang}:ca-${a.id}`, `caFocusActivity(${JSON.stringify(a.id)})`, 350);
          // A card that is not on the student page (teacher-only, hidden) leaves no open card: the marker is then the record.
          put(`dom/${lang}/activity-${safe(a.id)}.html`, lines(await read(`${lang}:ca-${a.id}:html`, `.ca-card[open]`, 4))); count('activities');
          if (SHOTS && lang === 'en') await shot(`shots/activity-${safe(a.id)}.png`);
          for (let i = 1; i < a.steps; i++) {
            await run(`${lang}:ca-${a.id}-step${i}`, `caFocusGo(${JSON.stringify(a.id)}, ${i})`, 200);
            put(`dom/${lang}/activity-${safe(a.id)}-step${i}.html`, lines(await read(`${lang}:ca-${a.id}-step${i}:html`, `.ca-card[open]`, 2))); count('activitySteps');
          }
          await run(`${lang}:ca-${a.id}:close`, `(document.querySelectorAll('.ca-card[open]').forEach(c => { c.open = false; }), 1)`, 50);
        }
      }
    }
  }

  if (ON.activities) {
    /* What an In-Class Activity SAVES (review R1-4: a Got it tick saved under a key nothing reads changed
       nothing the tool looked at). A fresh page, English: every activity is opened and each of its saving
       controls is really clicked, 450 ms apart (Got it ignores a second click inside 400 ms); the record is
       what each click writes and a fingerprint of the card as it stands afterwards. */
    await boot('ca-keys');
    await run('ca-keys:lang', `setLang('en')`, 600);
    await run('ca-keys:open', 'openClassActivitiesScreen()', 700);
    await run('ca-keys:def', `window.__goldCa = async function(id){
      const S = () => (${STATE});
      const flat = j => { const o = JSON.parse(j), out = {}; for (const c in o) for (const k in (o[c] || {})) out[c + '/' + k] = JSON.stringify(o[c][k]); return out; };
      const H = t => { let a = 0xdeadbeef ^ t.length, c = 0x41c6ce57 ^ t.length; for (let i = 0; i < t.length; i++) { const ch = t.charCodeAt(i); a = Math.imul(a ^ ch, 2654435761); c = Math.imul(c ^ ch, 1597334677); }
        return (a >>> 0).toString(16).padStart(8, '0') + (c >>> 0).toString(16).padStart(8, '0') + ':' + t.length; };
      const SEL = ${JSON.stringify(CA_WRITERS.map(w => `[onclick^="${w}("]`).join(', '))};
      const card = () => document.querySelector('.ca-card[open]');
      if (!card()) return [{ note: 'no open card' }];
      const out = [], n0 = card().querySelectorAll(SEL).length;
      // A click may redraw the card and add or remove controls (Got it moves to the next step): walk by position, up to 60 clicks.
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

  if (ON.save) {
    /* What reaches Firestore (review R1-1: the dev user never saves, so a payload written to the wrong field
       changed nothing). The console smoke test's in-memory Firestore stands in for the server, the signed-in
       user becomes a made-up student (not the dev user, so queueSave arms and flushSave sends), and after each
       real click flushSave() is awaited and the student's document is recorded as the server would hold it. */
    const src = readFileSync(join(HERE, 'tools', 'console-layout-smoke.mjs'), 'utf8');
    const m = /const STUB = String\.raw`([\s\S]*?)`;\n\nasync function main/.exec(src);
    if (!m) throw new Error('could not find the STUB in tools/console-layout-smoke.mjs');
    await boot('save');
    await run('save:lang', `setLang('en')`, 600);
    await run('save:stub', m[1], 100);
    await run('save:student', `(currentUser = { uid: 'gold-student', displayName: 'Gold Student', email: 'gold-student@example.test', photoURL: null }, 1)`, 0);
    const doc = () => run('save:doc', `(async () => { await flushSave(); await new Promise(r => setTimeout(r, 50)); return JSON.stringify(__store.get('progress/gold-student') || null, null, 1); })()`, 50);
    const log = [];
    /* Each control is taken from the first set that has one (not every set has a rating row or a clean-rep
       button); n picks the n-th such control in that set. The set it came from is part of the record. */
    await run('save:def', `window.__goldClick = async function(sel, n){
      // In course order (SETS itself fills in the order the module files arrive), each module's sets and then its Module Review.
      const order = [...SETS].sort((a, b) => a.moduleNum - b.moduleNum), ids = [];
      order.forEach((w, i) => { ids.push([w.moduleNum, w.id]); if (!order[i + 1] || order[i + 1].moduleNum !== w.moduleNum) ids.push([w.moduleNum, 'mr' + w.moduleNum]); });
      // A module's panels are drawn a moment after the module is chosen: wait for it, as a student would.
      let at = null;
      for (const [m, id] of ids) {
        if (m !== at) { onModuleChange(m); at = m; await new Promise(r => setTimeout(r, 300)); }
        activateSet(id);
        const b = document.querySelectorAll('.week-panel[data-id="' + id + '"] ' + sel)[n || 0];
        if (b) { b.click(); return id + ': ' + b.getAttribute('onclick'); }
      }
      throw new Error('no set has ' + sel);
    }; 1`, 0);
    for (const [name, sel, n] of [['tick a step', '[onclick^="toggleStepDone("]', 0], ['tick a second step', '[onclick^="toggleStepDone("]', 1], ['un-tick the first step', '[onclick^="toggleStepDone("]', 0],
      ['mark a skill', '[onclick^="toggleSkill("]', 0], ['rate a skill', '[onclick^="setSkillLevel("]', 0], ['answer a quiz question', '[onclick^="onStepMcSelect("]', 0],
      ['answer a practice question', '[onclick^="onPracticeMcSelect("]', 0], ['log a clean rep', '[onclick^="logCleanRep("]', 0], ['finish a Module Review', '[onclick^="finishModuleReview("]', 0]]) {
      const what = await run(`save:${name}`, `window.__goldClick(${JSON.stringify(sel)}, ${n})`, 200);
      log.push({ action: name, control: what, serverDoc: JSON.parse((await doc()) || 'null') });
    }
    // An In-Class Activity tick and a finished activity, through the same save path.
    await run('save:ca-open', 'openClassActivitiesScreen()', 700);
    // The first activity whose open card has a Got it button.
    const what = await run('save:ca-got-it', `(() => { for (const a of CLASS_ACTIVITIES) { caFocusActivity(a.id); const b = document.querySelector('.ca-card[open] [onclick^="caFocusGotIt("]');
      if (b) { b.click(); return a.id + ': ' + b.getAttribute('onclick'); } document.querySelectorAll('.ca-card[open]').forEach(c => { c.open = false; }); } throw new Error('no activity has a Got it button'); })()`, 600);
    log.push({ action: 'Got it on an activity step', control: what, serverDoc: JSON.parse((await doc()) || 'null') });
    put('save/server-doc-after-each-action.json', JSON.stringify(log, null, 1) + '\n'); count('savesRecorded', log.length);
  }

  if (ON.tools) {
    await boot('tools');
    const click = sel => `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) throw new Error('no ' + ${JSON.stringify(sel)}); e.click(); return 1; })()`;
    for (const lang of LANGS) {
      await run(`${lang}:tools-lang`, `setLang('${lang}')`, 600);
      const rec = async name => { put(`tools/${lang}/${name}.html`, lines(await read(`${lang}:tools-${name}:html`, '#fab-group', 2))); count('tools'); if (SHOTS && lang === 'en') await shot(`shots/tools-${name}.png`); };
      await run(`${lang}:tools-metro`, click('#fab-metro'), 250); await rec('metro');
      for (const id of (await run(`${lang}:tools-meters`, `[...document.querySelectorAll('#metro-popup [id^="meter-"]')].map(e => e.id)`, 0)) || []) {
        await run(`${lang}:tools-${id}`, click('#' + id), 150); await rec('metro-' + id);
      }
      await run(`${lang}:tools-ladder`, click('#ladder-toggle'), 200); await rec('metro-ladder-on');
      await run(`${lang}:tools-ladder-off`, click('#ladder-toggle'), 200); await rec('metro-ladder-off');
      await run(`${lang}:tools-timer`, click('#fab-timer'), 250); await rec('timer');
      for (const id of (await run(`${lang}:tools-presets`, `[...document.querySelectorAll('#timer-presets [id^="tp-"]')].map(e => e.id)`, 0)) || []) {
        await run(`${lang}:tools-${id}`, click('#' + id), 150); await rec('timer-' + id);
      }
      await run(`${lang}:tools-rec`, click('#fab-rec'), 300); await rec('rec');
      await run(`${lang}:tools-rec-close`, click('#fab-rec'), 200); await rec('closed');
    }
  }

  if (ON.livequiz) {
    await boot('livequiz');
    await run('lq:def', LQ_DEF, 0);
    const quizzes = (await run('lq:list', `Object.keys(LIVE_QUIZZES)`, 0)) || [];
    await run('lq:open', `openLiveQuizScreen()`, 400);
    // [file name, session state, the student's own pick: none, the right answer or the wrong one]
    const VIEWS = [['lobby', 'lobby', null], ['question', 'question', null], ['question-picked', 'question', 'correct'], ['reveal-right', 'reveal', 'correct'],
      ['reveal-wrong', 'reveal', 'wrong'], ['reveal-no-answer', 'reveal', null], ['ended', 'ended', null]];
    for (const lang of LANGS) {
      await run(`${lang}:lq-lang`, `setLang('${lang}')`, 600);
      for (const q of quizzes) for (const [name, state, pick] of VIEWS) {
        await run(`${lang}:lq-${q}-${name}`, `(() => { const g = __goldLq(${JSON.stringify(q)}); lqSession = g.sessions[${JSON.stringify(state)}];
          lqMyAnswer = ${pick ? `{ qIndex: 0, choice: g.${pick} }` : 'null'}; lqRenderStudent(); return 1; })()`, 150);
        put(`livequiz/${lang}/student-${safe(q)}-${name}.html`, lines(await read(`${lang}:lq-${q}-${name}:html`, '#live-quiz-screen'))); count('liveQuizStudent');
        if (SHOTS && lang === 'en') await shot(`shots/livequiz-student-${safe(q)}-${name}.png`);
      }
    }
    await run('lq:clear', `(lqSession = null, lqMyAnswer = null, lqRenderStudent(), 1)`, 100);
  }

  if (ON.pages) {
    /* The pages that are files of their own. Which ones exist is read from the site folder, so a page a rebuild
       drops or adds shows up as a missing or extra file. They take their language from localStorage 'gc-lang'. */
    const files = [...readdirSync(join(ROOT, 'tabs')).filter(f => f.endsWith('.html')).sort().map(f => 'tabs/' + f),
      ...readdirSync(ROOT).filter(f => f.endsWith('.html') && f !== 'index.html').sort()];
    for (const lang of LANGS) for (const f of files) {
      const name = safe(f.replace(/\.html$/, ''));
      await run(`${lang}:page-${name}:lang`, `(localStorage.setItem('gc-lang', '${lang}'), 1)`, 0);
      await page.send('Page.navigate', { url: `${base}/${f}` });
      try { await until(`${lang}: ${f} loading`, `document.readyState === 'complete' && location.pathname.endsWith(${JSON.stringify('/' + f)})`); }
      catch (e) { events.push({ step: `${lang}:page-${name}`, kind: 'step-failed', text: e.message }); }
      put(`pages/${lang}/${name}.html`, lines(await read(`${lang}:page-${name}:html`, 'body', 3))); count('pages');
      if (SHOTS) await shot(`shots/${lang}-page-${name}.png`);
    }
    await page.send('Page.navigate', { url: `${base}/index.html` });
    await sleep(500);
    await run('pages:lang-back', `(localStorage.setItem('gc-lang', 'en'), 1)`, 0);
  }

  if (ON.console || ON.livequiz) {
    /* The teacher console, against the fake class the console smoke test already uses: its STUB (an in-memory
       Firestore, 30 made-up students, a seeded board) is read out of that file, so there is one copy of it. */
    const src = readFileSync(join(HERE, 'tools', 'console-layout-smoke.mjs'), 'utf8');
    const m = /const STUB = String\.raw`([\s\S]*?)`;\n\nasync function main/.exec(src);
    if (!m) throw new Error('could not find the STUB in tools/console-layout-smoke.mjs');
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
    await page.send('Page.navigate', { url: `${base}/index.html?teacher=true` });
    await until('console: the page loading', `typeof ensureTeacherJs === 'function' && typeof CLASS_ACTIVITIES !== 'undefined' && location.search === '?teacher=true'`);
    await run('console:load', 'ensureTeacherJs()', 300);
    await until('console: teacher.js loading', `typeof showTeacherApp === 'function'`);
    await run('console:stub', m[1], 100);
    await run('console:show', `showTeacherApp({ uid: 'stub-teacher', email: TEACHER_EMAIL, displayName: 'Teacher' }).then(() => 1)`, 300);
    await until('console: the activities list', `!!document.querySelector('#t-grid-container [data-ta-list]')`);
    if (ON.livequiz) {
      // The projector stage, in the console's Live quiz view, for the same made-up game.
      await run('lq-stage:def', LQ_DEF, 0);
      await run('lq-stage:view', `document.querySelector('#t-side [data-view="livequiz"]').click()`, 500);
      for (const q of (await run('lq-stage:list', `Object.keys(LIVE_QUIZZES)`, 0)) || []) for (const state of ['lobby', 'question', 'reveal', 'ended']) {
        await run(`lq-stage:${q}-${state}`, `(() => { lqTSession = __goldLq(${JSON.stringify(q)}).sessions[${JSON.stringify(state)}]; lqTAnswers = []; lqPaintStage(); if (typeof lqPaintControls === 'function') lqPaintControls(); return 1; })()`, 150);
        put(`livequiz/stage-${safe(q)}-${state}.html`, lines(await read(`lq-stage:${q}-${state}:html`, '.lq-shell'))); count('liveQuizStage');
        if (SHOTS) await shot(`shots/livequiz-stage-${safe(q)}-${state}.png`);
      }
      await run('lq-stage:clear', `(lqTSession = null, lqPaintStage(), typeof lqPaintControls === 'function' && lqPaintControls(), 1)`, 150);
    }
    if (ON.console) {
    const views = (await run('console:views', `[...document.querySelectorAll('#t-side [data-view]')].map(b => b.dataset.view)`, 0)) || [];
    for (const v of views) {
      await run(`console:view-${v}`, `document.querySelector('#t-side [data-view=${JSON.stringify(v)}]').click()`, 300);
      put(`console/view-${safe(v)}.html`, lines(await read(`console:view-${v}:html`, '#teacher-app', 3))); count('consoleViews');
      if (SHOTS) await shot(`shots/console-view-${safe(v)}.png`);
    }
    await run('console:activities', `document.querySelector('#t-side [data-view="activities"]').click()`, 400);
    // Every way the list can be filtered, then "All" so every activity has a row to pick.
    const filters = (await run('console:filters', `[...document.querySelectorAll('[data-ta-filter]')].map(b => b.dataset.taFilter)`, 0)) || [];
    for (const f of [...filters.filter(x => x !== 'all'), 'all']) {
      await run(`console:filter-${f}`, `document.querySelector('[data-ta-filter=${JSON.stringify(f)}]').click()`, 250);
      put(`console/list-${safe(f)}.html`, lines(await read(`console:filter-${f}:html`, '[data-ta-list]'))); count('consoleLists');
    }
    const rows = (await run('console:rows', `[...new Set([...document.querySelectorAll('[data-ta-pick]')].map(r => r.dataset.id))]`, 0)) || [];
    for (const id of rows) {
      await run(`console:pick-${id}`, `document.querySelector('[data-ta-pick][data-id=${JSON.stringify(id)}]').click()`, 250);
      const tabs = (await run(`console:tabs-${id}`, `[...document.querySelectorAll('[data-ta-tab]')].map(t => t.dataset.taTab)`, 0)) || [];
      for (const tab of tabs) {
        await run(`console:${id}:${tab}`, `document.querySelector('[data-ta-tab=${JSON.stringify(tab)}]').click()`, 150);
        put(`console/activity-${safe(id)}-${safe(tab)}.html`, lines(await read(`console:${id}:${tab}:html`, '[data-ta-detail]', 4))); count('consoleActivityTabs');
      }
    }
    for (const uid of ['stub-uid-01', 'stub-uid-13', 'stub-uid-25']) {
      await run(`console:students`, `document.querySelector('#t-side [data-view="students"]').click()`, 400);
      await run(`console:student-${uid}`, `document.querySelector('[data-open-student][data-uid="${uid}"]').click()`, 400);
      put(`console/student-${uid}.html`, lines(await read(`console:student-${uid}:html`, '#teacher-app', 3))); count('consoleStudents');
    }
    }
    if (ON.console) {
      /* What the console WRITES (review R1-7: an Optional switch that hid the activity instead changed nothing,
         because the store was read once after read-only clicks). On one activity's Settings tab each control is
         really clicked, and config/class is recorded after every click. */
      const cid = 'ca-21', writes = [];
      const cfg = () => run('console:cfg', `JSON.stringify(__store.get('config/class'))`, 0);
      await run('console:w-view', `document.querySelector('#t-side [data-view="activities"]').click()`, 400);
      await run('console:w-all', `document.querySelector('[data-ta-filter="all"]').click()`, 250);
      const flatten = (o, pre = '', out = {}) => { for (const k of Object.keys(o || {})) { const v = o[k]; if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, pre + k + '.', out); else out[pre + k] = JSON.stringify(v); } return out; };
      for (const [name, sel, how] of [['hide', `[data-set-activity-hidden][data-state="hide"]`], ['show', `[data-set-activity-hidden][data-state="show"]`], ['optional', `[data-set-activity-optional][data-state="optional"]`],
        ['required', `[data-set-activity-optional][data-state="required"]`], ['pin', `[data-set-activity-pin][data-state="on"]`], ['unpin', `[data-set-activity-pin][data-state="off"]`],
        ['clear the gate for one student', `[data-set-activity-clear]`], ['set the release date', `[data-set-activity-date]`, 'date'], ['unpublish', `[data-publish-activity]`],
        ['archive', `[data-set-activity-archived]`], ['un-assign', `[data-unassign-activity]`], ['delete', `[data-delete-activity]`]]) {
        // Re-open the activity's Settings tab each time: a write may redraw the detail or move the row.
        await run(`console:w-pick:${name}`, `(() => { const r = document.querySelector('[data-ta-pick][data-id="${cid}"]'); if (r) r.click(); const t = document.querySelector('[data-ta-tab="settings"]'); if (t) t.click(); return !!r; })()`, 250);
        const before = flatten(JSON.parse((await cfg()) || '{}'));
        const did = await run(`console:w:${name}`, `(() => { const e = document.querySelector('[data-ta-detail] ' + ${JSON.stringify(sel)}); if (!e) return 'no such control';
          ${how === 'date' ? `e.value = '2026-12-01'; e.dispatchEvent(new Event('change', { bubbles: true })); return 'set to 2026-12-01';` : `e.click(); return 'clicked';`} })()`, 500);
        const after = flatten(JSON.parse((await cfg()) || '{}')), changed = {};
        for (const k in after) if (before[k] !== after[k]) changed[k] = after[k];
        for (const k in before) if (!(k in after)) changed[k] = '(removed)';
        writes.push({ action: name, did, changed });
      }
      put('console/writes.json', JSON.stringify(writes, null, 1) + '\n'); count('consoleWrites', writes.length);
    }
    if (ON.console) put('console/store.json', (await run('console:store', `JSON.stringify([...__store.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1), null, 1)`, 0)) + '\n');
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 657, deviceScaleFactor: 1, mobile: false });
  }

  put('errors.json', JSON.stringify(events, null, 1) + '\n');
  put('meta.json', JSON.stringify({ root: ROOT, langs: LANGS, parts: PARTS.filter(p => ON[p]), shots: SHOTS, counts, seconds: Math.round((Date.now() - t0) / 1000) }, null, 1) + '\n');
  console.log(`golden: ${sets.length} sets in ${modules.length} modules (${LANGS.join(' + ').toUpperCase()}): ` + Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ') + `; ${events.length} error event(s) recorded; ${Math.round((Date.now() - t0) / 1000)} s`);
  console.log(`golden: written to ${outDir}`);
} catch (e) { console.error('golden: could not run —', e && e.message); exitCode = 2; }
finally {
  if (chromeProc) { await new Promise(res => { chromeProc.once('exit', res); chromeProc.kill(); setTimeout(() => { try { chromeProc.kill('SIGKILL'); } catch { /* gone */ } res(); }, 3000); }); }
  for (const f of cleanup.reverse()) { try { f(); } catch { /* best effort */ } }
}
process.exit(exitCode);
