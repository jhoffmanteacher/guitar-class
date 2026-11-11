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
     --only <parts>     comma-separated: data, sets, keys, screens, games, activities
     --shots            also write PNGs of every set (English)
     --chrome <path>    Chrome/Chromium binary (or CHROME=...)

   THE DRIVER CONTRACT. The tool drives the page through these names and
   nothing else, so a rebuild must keep them reachable from the page's global
   scope (a thin shim is fine): devBypass, setLang, onModuleChange,
   activateSet, ensureCoachJs, openSongsScreen, openClassActivitiesScreen,
   openMyProgressScreen, openGamesScreen, gamesShow, caFocusActivity,
   caFocusGo, and the data/state names SETS, CLASS_ACTIVITIES,
   MODULE_MANIFEST, GAMES_META, completed, progress, responses, caStepDone,
   classActivities, exitChecks, practiceLog, games, streak. Everything else about the code is free.

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
  console.log(bad ? `golden: ✗ the two snapshots differ in ${bad} file(s)` : `golden: ✓ the two snapshots are identical (${same} files)`);
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
const PARTS = ['data', 'sets', 'keys', 'screens', 'games', 'activities'];
const ONLY = args.includes('--only') ? (opt('--only') || '').split(',').map(x => x.trim()).filter(Boolean) : null;
if (ONLY && (!ONLY.length || ONLY.some(p => !PARTS.includes(p)))) { console.error(`golden: --only takes ${PARTS.join(', ')}`); process.exit(2); }
const ON = Object.fromEntries(PARTS.map(p => [p, !ONLY || ONLY.includes(p)]));
const outDir = resolve(OUT);
rmSync(outDir, { recursive: true, force: true }); mkdirSync(outDir, { recursive: true });
const put = (rel, text) => { const f = join(outDir, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, text); };
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
   at Wednesday 2026-11-11 10:00 local time (a running clock put a different
   millisecond into every saved timestamp), and window.__goldSeed() puts
   Math.random back to its start: it is called before every view is opened, so
   what a view draws at random does not depend on how many animation frames
   ran before it. */
const FREEZE = `(() => {
  const RealDate = Date, start = new RealDate(2026, 10, 11, 10, 0, 0).getTime();
  const now = () => start;
  function FakeDate(...a) { if (!new.target) return new RealDate(now()).toString(); return a.length ? new RealDate(...a) : new RealDate(now()); }
  FakeDate.prototype = RealDate.prototype; FakeDate.now = now; FakeDate.parse = RealDate.parse; FakeDate.UTC = RealDate.UTC;
  window.Date = FakeDate;
  let s = 0x9e3779b9;
  window.__goldSeed = () => { s = 0x9e3779b9; };
  Math.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
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
const WRITERS = ['toggleStepDone', 'toggleSkill', 'setSkillLevel', 'onStepMcSelect', 'onPracticeMcSelect', 'toggleGotIt', 'setPerformanceLevel',
  'repDotTap', 'repDotReset', 'logCleanRep', 'finishModuleReview', 'toggleTabChoice'];

const chrome = findChrome();
if (!chrome) { console.error('golden: no Chrome or Chromium found (use --chrome <path>)'); process.exit(2); }
let chromeProc = null, exitCode = 0; const cleanup = [];
const t0 = Date.now();
try {
  const prof = mkdtempSync(join(tmpdir(), 'gc-golden-chrome-'));
  const cdp = await freePort();
  chromeProc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required', '--no-first-run', '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
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
    if (ev && !NOISE.test(ev.text)) events.push(ev);
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
    await run(`${tag}:devBypass`, 'devBypass()', 500);
    await until(`${tag}: the sets loading after sign-in`, `typeof SETS !== 'undefined' ? SETS.length : 0`);
    await sleep(1500);
  };
  /* A view is recorded once it has stopped changing: two reads 200 ms apart must agree (a lyric sheet sets its
     width a moment after it opens). A game view must hold still for 2 s (calm = 10): Note Hunt shows "Starting
     the mic…" for a second or more, longer on a busy machine, before its real first screen. After 12 s a view
     is recorded as it is and the wobble is noted in errors.json. */
  const read = async (name, sel, calm = 1) => {
    let prev = await run(name, htmlExpr(sel), 0), same = 0;
    for (let i = 0; i < 60; i++) { await sleep(200); const cur = await run(name, htmlExpr(sel), 0); if (cur === prev) { if (++same >= calm) return cur; } else same = 0; prev = cur; }
    events.push({ step: name, kind: 'never-settled', text: 'the view was still changing after 12 s' });
    return prev;
  };
  const shot = async (rel) => { const r = await page.send('Page.captureScreenshot', { format: 'png' }); put(rel, Buffer.from(r.data, 'base64')); count('shots'); };

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
      }
      if (ON.games) {
        await run(`${lang}:games-open`, 'openGamesScreen()', 500);
        for (const v of views) {
          await run(`${lang}:game-${v}`, `gamesShow(${JSON.stringify(v)})`, 350);
          put(`dom/${lang}/game-${safe(v)}.html`, lines(await read(`${lang}:game-${v}:html`, '#games-panel', 10))); count('games');
        }
      }
      if (ON.activities) {
        await run(`${lang}:ca-open`, 'openClassActivitiesScreen()', 700);
        for (const a of acts) {
          await run(`${lang}:ca-${a.id}`, `caFocusActivity(${JSON.stringify(a.id)})`, 350);
          // A card that is not on the student page (teacher-only, hidden) leaves no open card: the marker is then the record.
          put(`dom/${lang}/activity-${safe(a.id)}.html`, lines(await read(`${lang}:ca-${a.id}:html`, `.ca-card[open]`))); count('activities');
          for (let i = 1; i < a.steps; i++) {
            await run(`${lang}:ca-${a.id}-step${i}`, `caFocusGo(${JSON.stringify(a.id)}, ${i})`, 200);
            put(`dom/${lang}/activity-${safe(a.id)}-step${i}.html`, lines(await read(`${lang}:ca-${a.id}-step${i}:html`, `.ca-card[open]`))); count('activitySteps');
          }
          await run(`${lang}:ca-${a.id}:close`, `(document.querySelectorAll('.ca-card[open]').forEach(c => { c.open = false; }), 1)`, 50);
        }
      }
    }
  }

  put('errors.json', JSON.stringify(events, null, 1) + '\n');
  put('meta.json', JSON.stringify({ root: ROOT, langs: LANGS, parts: PARTS.filter(p => ON[p]), counts, seconds: Math.round((Date.now() - t0) / 1000) }, null, 1) + '\n');
  console.log(`golden: ${sets.length} sets in ${modules.length} modules (${LANGS.join(' + ').toUpperCase()}): ` + Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ') + `; ${events.length} error event(s) recorded; ${Math.round((Date.now() - t0) / 1000)} s`);
  console.log(`golden: written to ${outDir}`);
} catch (e) { console.error('golden: could not run —', e && e.message); exitCode = 2; }
finally {
  if (chromeProc) { await new Promise(res => { chromeProc.once('exit', res); chromeProc.kill(); setTimeout(() => { try { chromeProc.kill('SIGKILL'); } catch { /* gone */ } res(); }, 3000); }); }
  for (const f of cleanup.reverse()) { try { f(); } catch { /* best effort */ } }
}
process.exit(exitCode);
