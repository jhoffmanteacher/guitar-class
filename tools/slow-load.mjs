#!/usr/bin/env node
/* Slow load: does the site still start when its scripts arrive late, one by one? (2026-11-11)

   Part of the whole-site rebuild (todo.md, "The shape of the rebuild", slice
   0c). app.js is cut into parts that index.html loads one after another, and
   coach.js / teacher.js into parts loaded on demand in order. One big file
   hoists every function; several files do not. So after the cut:
     - a statement in an early part that RUNS at load time and needs a
       function, `let` or `const` from a later part throws;
     - an event that fires BETWEEN two parts (a timer, a click, hashchange,
       resize, a key) can run a handler whose functions are not defined yet.
   Every other test serves from localhost, where the parts arrive almost
   together, so none of them sees the gap. This one makes the gap.

     node tools/slow-load.mjs [--root <site folder>] [--runs 20] [--max-delay 1500]
       --seed <n>        repeat a run: run i uses seed <n>+i (a failing line prints its own seed)
       --scenario <a-d>  every run uses this scenario (default: a, b, c, d in turn)
       --chrome <path>   Chrome/Chromium binary (or CHROME=...)
       --verbose         print every run and every step

   To repeat one failing run:  --seed <its seed> --scenario <its letter> --runs 1

   What it does. It serves the site folder itself and holds back EVERY script
   response (.js) by a time between 0 and --max-delay ms. The time comes from
   the run's seed and the file's path, so each file has its own delay, the
   parts arrive in every order and with gaps, and the same seed gives the same
   delays again. Chrome has no network (only 127.0.0.1 resolves), and every
   run is a fresh page in a fresh browser context (no cache, no service worker
   left from the run before). The scenarios:
     a  index.html, dev-bypass sign-in, open the first set, the In-Class
        Activities screen, the Games screen (lazy-loads the coach parts) and
        one game view (gamesShow('blitz'))
     b  index.html#class-activities/ca-21 (a deep link), same sign-in
     c  index.html?teacher=true, ensureTeacherJs(), wait for showTeacherApp
        (no sign-in to the console)
     d  as a, with a hashchange, a resize, a keydown and a click on the body
        dispatched every 100 ms from before the first script until the end:
        the top-level listeners of early parts run while later parts are
        still on their way
   The sign-in is made when the page has finished loading (every deferred
   script has run), as the site's own sign-in listener is registered at the
   very end of app.js. Scenario d is what exercises the gaps before that.

   A run fails on any uncaught exception, unhandled rejection or
   console.error that is not network noise (the NOISE rule of tools/golden.mjs,
   with its exception: a ReferenceError, TypeError, SyntaxError or RangeError
   is never noise), on a script the server could not find, and on any step
   that does not finish in 40 s.

   Exit 0: no failing run. Exit 1: at least one. Exit 2: bad arguments / no
   Chrome. Exit 3: the tool itself stalled (no step began for 120 s); it names
   the step, closes its Chrome and stops.

   Node 22+, Chrome or Chromium, no other dependency. It starts its own Chrome
   with its own profile folder (gc-slowload-chrome-*) and closes it. */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, statSync, rmSync } from 'node:fs';
import { tmpdir, platform } from 'node:os';
import { join, extname, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const num = (name, dflt) => { const v = opt(name); if (v == null) return dflt; const n = Number(v); if (!Number.isFinite(n) || n < 0) { console.error(`slow-load: ${name} takes a number`); process.exit(2); } return n; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const ROOT = resolve(opt('--root') || HERE);
if (!existsSync(join(ROOT, 'index.html'))) { console.error(`slow-load: no index.html in ${ROOT}`); process.exit(2); }
const RUNS = Math.max(1, Math.floor(num('--runs', 20)));
const MAX_DELAY = num('--max-delay', 1500);
const SEED = Math.floor(num('--seed', Date.now() % 1000000000));
const ONLY = opt('--scenario');
const SCENARIOS = ['a', 'b', 'c', 'd'];
if (ONLY && !SCENARIOS.includes(ONLY)) { console.error('slow-load: --scenario takes a, b, c or d'); process.exit(2); }
const VERBOSE = args.includes('--verbose');
const STEP_TIMEOUT = 40000, STALL = 120000;

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

/* The delay of one file in one run: a hash of the run's seed and the file's path, so it does not depend on the
   order the browser asks in, and the same seed holds the same file back by the same time again. */
function delayFor(seed, path) {
  const t = seed + '|' + path;
  let a = 0x9e3779b9 ^ t.length;
  for (let i = 0; i < t.length; i++) { a = Math.imul(a ^ t.charCodeAt(i), 2654435761); a ^= a >>> 15; }
  a = Math.imul(a ^ a >>> 16, 2246822507); a = Math.imul(a ^ a >>> 13, 3266489909);
  return Math.round(((a ^ a >>> 16) >>> 0) / 4294967296 * MAX_DELAY);
}
const cur = { seed: 0, missing: [], served: 0 };
function serve(dir) {
  const srv = createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const f = normalize(join(dir, p));
    const isScript = /\.m?js$/i.test(p);
    const seed = cur.seed;
    if (!f.startsWith(dir) || !existsSync(f) || !statSync(f).isFile()) {
      if (isScript) cur.missing.push(p);
      res.writeHead(404); res.end('not found'); return;
    }
    const send = () => { res.writeHead(200, { 'content-type': MIME[extname(f).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' }); res.end(readFileSync(f)); };
    if (isScript && MAX_DELAY > 0) { cur.served++; setTimeout(send, delayFor(seed, p)); } else send();
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r({ srv, port: srv.address().port })));
}
/* One CDP connection. With a session id it talks to one page through the browser's own socket. */
async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = new Map(); const handlers = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
    else if (m.method) handlers.forEach(h => h(m.method, m.params, m.sessionId));
  };
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify(sessionId ? { id: i, method, params, sessionId } : { id: i, method, params })); });
  return { send, on: h => handlers.push(h), close: () => { try { ws.close(); } catch {} } };
}
const NOISE = /firebase|firestore|googleapis|gstatic|google\.com|youtube|ytimg|net::ERR|Failed to fetch|ERR_|auth\/|identitytoolkit|favicon|Content Security|websocket|WebChannel|Missing or insufficient|offline|Could not reach|NotAllowedError|play\(\) request|AbortError|NotSupportedError|The play\(\)|ResizeObserver loop/i;

/* Scenario d: events while the scripts are still arriving. Installed before any page script. A handler that
   throws inside dispatchEvent is reported by the browser as an uncaught exception, which is what the run
   listens for. */
const EVENTS = `(() => {
  let n = 0; const keys = ['Escape', 'ArrowRight', 'ArrowLeft'];
  setInterval(() => {
    n++;
    window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL: location.href, newURL: location.href }));
    window.dispatchEvent(new Event('resize'));
    const b = document.body || document.documentElement;
    b.dispatchEvent(new KeyboardEvent('keydown', { key: keys[n % keys.length], bubbles: true, cancelable: true }));
    b.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    window.__slowLoadEvents = n;
  }, 100);
})();`;

const chrome = findChrome();
if (!chrome) { console.error('slow-load: no Chrome or Chromium found (use --chrome <path>)'); process.exit(2); }
let chromeProc = null, prof = null, exitCode = 0, site = null, browser = null;
let step = 'starting Chrome', lastProgress = Date.now();
const mark = (s) => { step = s; lastProgress = Date.now(); if (VERBOSE) console.log(`    · ${s}`); };
const shutdown = () => {
  try { if (browser) browser.close(); } catch {}
  try { if (chromeProc) chromeProc.kill('SIGKILL'); } catch {}
  try { if (site) site.srv.close(); } catch {}
  try { if (prof) rmSync(prof, { recursive: true, force: true }); } catch {}
};
const watchdog = setInterval(() => {
  if (Date.now() - lastProgress < STALL) return;
  console.log(`slow-load: ✗ HUNG: no step began for ${STALL / 1000} s. Stuck at "${step}"`);
  shutdown(); process.exit(3);
}, 1000);
watchdog.unref();

const failures = [];
try {
  prof = mkdtempSync(join(tmpdir(), 'gc-slowload-chrome-'));
  const cdp = await freePort();
  chromeProc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required', '--no-first-run', '--disable-gpu', '--hide-scrollbars',
    '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1', 'about:blank'], { stdio: 'ignore' });
  let version = null;
  for (let i = 0; i < 60 && !version; i++) { try { version = await (await fetch(`http://127.0.0.1:${cdp}/json/version`)).json(); } catch { await sleep(250); } }
  if (!version) throw new Error('Chrome did not open its debugging port in 15 s');
  browser = await connect(version.webSocketDebuggerUrl);
  site = await serve(ROOT);
  const base = `http://127.0.0.1:${site.port}`;
  console.log(`slow-load: ${ROOT}: ${RUNS} load(s), every script held back 0-${MAX_DELAY} ms, seed ${SEED}`);

  /* The page events of every run arrive on the one browser socket: routed by session id. */
  let onPage = null;
  browser.on((method, params, sessionId) => { if (onPage && sessionId === onPage.sessionId) onPage.fn(method, params); });

  for (let i = 0; i < RUNS; i++) {
    const scenario = ONLY || SCENARIOS[i % SCENARIOS.length], seed = SEED + i;
    const tag = `run ${i + 1}/${RUNS} seed ${seed} scenario ${scenario}`;
    mark(`${tag}: opening a fresh page`);
    cur.seed = seed; cur.missing = []; cur.served = 0;
    const errors = []; const t0 = Date.now();
    const { browserContextId } = await browser.send('Target.createBrowserContext');
    const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank', browserContextId });
    const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true });
    const send = (m, p) => browser.send(m, p, sessionId);
    onPage = { sessionId, fn: (method, p) => {
      let ev = null;
      if (method === 'Runtime.exceptionThrown') { const d = p.exceptionDetails; ev = { step, kind: 'exception', text: String((d.exception && (d.exception.description || d.exception.value)) || d.text).split('\n')[0] + (d.url ? ` (${String(d.url).replace(base + '/', '')}:${d.lineNumber + 1})` : '') }; }
      else if (method === 'Runtime.consoleAPICalled' && p.type === 'error') ev = { step, kind: 'console.error', text: p.args.map(a => a.value ?? a.description ?? '').join(' ').split('\n')[0].slice(0, 300) };
      // Network noise is dropped, but never a broken name or type (the rule of tools/golden.mjs).
      if (ev && (!NOISE.test(ev.text) || /ReferenceError|TypeError|SyntaxError|RangeError/.test(ev.text))) errors.push(ev);
    } };
    const evalJs = async (expression) => {
      const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error(String((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text).split('\n')[0]);
      return r.result.value;
    };
    const until = async (name, expr) => {
      mark(`${tag}: ${name}`);
      const end = Date.now() + STEP_TIMEOUT; let why = '';
      while (Date.now() < end) {
        try { if (await evalJs(expr)) return; why = ''; } catch (e) { why = e.message; }
        await sleep(100);
      }
      throw Object.assign(new Error(`timed out after ${STEP_TIMEOUT / 1000} s${why ? ' (' + why + ')' : ''}`), { stepName: name });
    };
    const act = async (name, expr) => {
      mark(`${tag}: ${name}`);
      const r = await Promise.race([evalJs(expr).then(() => null, e => e), sleep(STEP_TIMEOUT).then(() => new Error(`timed out after ${STEP_TIMEOUT / 1000} s`))]);
      if (r) throw Object.assign(r, { stepName: name });
    };
    const shortStep = () => step.replace(tag + ': ', '');
    try {
      await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
      await send('Network.setCacheDisabled', { cacheDisabled: true });
      await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 657, deviceScaleFactor: 1, mobile: false });
      if (scenario === 'd') await send('Page.addScriptToEvaluateOnNewDocument', { source: EVENTS });
      const url = scenario === 'b' ? `${base}/index.html#class-activities/ca-21` : scenario === 'c' ? `${base}/index.html?teacher=true` : `${base}/index.html`;
      mark(`${tag}: the page's scripts loading`);
      await send('Page.navigate', { url });
      if (scenario === 'c') {
        await until(`the page's scripts loading`, `location.pathname.endsWith('index.html') && typeof ensureTeacherJs === 'function' && document.readyState === 'complete'`);
        await act('ensureTeacherJs()', `ensureTeacherJs().then(() => 1)`);
        await until(`showTeacherApp defined`, `typeof showTeacherApp === 'function'`);
      } else {
        await until(`the page's scripts loading`, `location.pathname.endsWith('index.html') && typeof devBypass === 'function' && document.readyState === 'complete'`);
        if (scenario === 'd') await until('the events firing', `window.__slowLoadEvents > 0`);
        await act('devBypass()', `devBypass(); 1`);
        await until('the site showing the app', `(() => { const a = document.getElementById('app'); return !!a && getComputedStyle(a).display !== 'none'; })()`);
        await until('the sets loading after sign-in', `typeof SETS !== 'undefined' && SETS.length > 0`);
        if (scenario === 'b') {
          await until('the deep link opening In-Class Activities', `(() => { const s = document.getElementById('class-activities-screen'); return !!s && getComputedStyle(s).display !== 'none' && location.hash.indexOf('class-activities') >= 0; })()`);
        } else {
          await act('activateSet(first set)', `activateSet(SETS[0].id); 1`);
          await act('openClassActivitiesScreen()', `openClassActivitiesScreen(); 1`);
          await act('ensureCoachJs() then openGamesScreen()', `ensureCoachJs().then(() => { openGamesScreen(); return 1; })`);
          await act(`gamesShow('blitz')`, `gamesShow('blitz'); 1`);
        }
      }
      // Late timers and the last event ticks.
      mark(`${tag}: settling`); await sleep(800);
    } catch (e) {
      errors.push({ step: `${tag}: ${e.stepName || shortStep()}`, kind: 'step-failed', text: String(e.message).split('\n')[0].slice(0, 300) });
    }
    for (const m of cur.missing) errors.push({ step, kind: 'script-not-found', text: `the server has no ${m}` });
    onPage = null;
    try { await browser.send('Target.closeTarget', { targetId }); await browser.send('Target.disposeBrowserContext', { browserContextId }); } catch {}
    if (!cur.served) errors.push({ step, kind: 'step-failed', text: 'the page asked for no script at all: nothing was tested' });
    // The same error from every 100 ms tick is one finding.
    const seen = new Set(), distinct = [];
    for (const ev of errors) { const s = ev.step.replace(tag + ': ', ''); const k = ev.kind + '|' + ev.text; if (seen.has(k)) continue; seen.add(k); distinct.push({ ...ev, step: s }); }
    if (distinct.length) {
      failures.push({ seed, scenario, distinct });
      const f = distinct[0];
      console.log(`  ✗ seed ${seed} scenario ${scenario} step "${f.step}": ${f.kind}: ${f.text}${distinct.length > 1 ? ` (+${distinct.length - 1} more)` : ''}`);
      for (const x of distinct.slice(1)) console.log(`      also at "${x.step}": ${x.kind}: ${x.text}`);
    } else if (VERBOSE) console.log(`  ✓ seed ${seed} scenario ${scenario} (${cur.served} scripts, ${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  }
  if (failures.length) { console.log(`✗ slow-load: ${failures.length} of ${RUNS} loads failed`); exitCode = 1; }
  else console.log(`✓ slow-load: ${RUNS} loads, 0 errors`);
} catch (e) {
  console.log(`slow-load: ✗ the tool itself failed at "${step}": ${e && e.message}`);
  exitCode = 1;
} finally {
  clearInterval(watchdog);
  shutdown();
}
process.exit(exitCode);
