/* chrome-wall.mjs — the wall and the browser lock that every headless-Chrome tool goes through (2026-11-26).

   Why: a test page served on 127.0.0.1 gets the CLASS Firebase project's settings (firebase-config.js picks the
   practice project only on the practice host names). Before this file, ten of the fifteen headless-Chrome tools did
   not block the network, so their pages loaded the real Firebase SDK from gstatic.com and could talk to the real
   class project (closed-loop report 2026-11-26, "Fix first"). Measured on origin/main ecee6ac with this file in a
   report-only scratch copy: see /home/claude/sweep/reports/FIX-wall.md.

   THE WALL, in three parts:
   1. WALL_FLAGS go on every Chrome command line: every host name resolves to "not found" except 127.0.0.1 and
      localhost (the Playwright tools in tools/mic-sim/ serve on localhost), and no
      proxy is used (behind a proxy, as in a cloud session with HTTPS_PROXY set, Chrome sends every request to the
      proxy and the resolver rules block nothing: update-reload-loop.mjs, 2026-11-25). IP literals are refused too
      (measured 2026-11-26: a fetch to the machine's own outside address failed with these flags and went through
      with --no-proxy-server alone).
   2. wallWatch() (CDP) or wallPlaywright() records every request a page, frame, worker or service worker tries to
      send to a host that is not 127.0.0.1, localhost or [::1]. The flags stop it; the record makes the tool FAIL,
      with one line per host naming the page that asked.
   3. The same watch reads window.firebase.apps in every page (after each load, every 5 s and at the end): an app
      initialised on any project (the class project is named as such) fails the tool. The SDK cannot load through
      the wall, so an app means a copy of the SDK was served from somewhere else.
   QUIET lists the few outside files a page asks for on EVERY load, before any of the site's code runs (the
   <script>/<link> tags in the HTML): they are blocked by the flags like everything else and counted on the summary
   line, but do not fail the run, because the tools' checks were measured to hold without them (the five tools that
   had the flags before 2026-11-26 always ran without them). Nothing on QUIET may be a host that talks to a Firebase
   project or to Google sign-in; checks run quietly only what a school network that blocks gstatic.com would.

   THE LOCK: browserSlot() before Chrome starts. At most GC_BROWSER_SLOTS (default 2) headless-Chrome runs at once
   on the machine (CLAUDE.md, Jonathan 2026-11-23: "make two the default"); a third prints one line and waits.
   Slots are pid files in <tmpdir>/gc-browser-slots; a file whose process is gone (or older than 4 hours) is
   removed. Skipped on GitHub Actions (CI is set: every job is its own machine). A tool started by a tool that
   already holds a slot (GC_BROWSER_SLOT_HELD in its environment) does not take a second one.

   Never weaken the wall or a loop to make a run pass: a request the page really needs gets a local copy (vendor/)
   or a stub in the tool, never an allowed outside host.

     node tools/chrome-wall.mjs --self-test     the wall and the lock on a made-up page (Chrome; about 20 s) */
import { mkdirSync, writeFileSync, readFileSync, readdirSync, unlinkSync, statSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const WALL_FLAGS = ['--no-proxy-server', '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1 , EXCLUDE localhost'];

/* The class project's id, read from firebase-config.js so a new project id is followed; the fallback is today's. */
export const CLASS_PROJECT = (() => {
  try {
    const src = readFileSync(join(ROOT, 'firebase-config.js'), 'utf8');
    const ids = [...src.matchAll(/projectId:\s*"([^"]+)"/g)].map(m => m[1]).filter(id => !/practice/.test(id));
    if (ids.length === 1) return ids[0];
  } catch { /* the fallback */ }
  return 'guitar-class-2fd21';
})();

/* Outside files the site's HTML asks for on every load (index.html's <script defer src> tags for the Firebase SDK,
   the same tags in the Journey and Tuning Simulator pages). Prefixes, matched against the whole URL. Measured
   2026-11-26 (FIX-wall.md): what each tool asked for before the wall. Keep this list short and static-file only. */
export const QUIET = [
  'https://www.gstatic.com/firebasejs/',
];

/* index.html has booted. Behind the wall the Firebase SDK cannot load, so the sign-in wall shows its "could not
   load" screen (showFirebaseLoadError, app/boot.js), which takes the Dev bypass button's place; with the SDK, the
   button is there. A tool that waited for the button alone waited in vain behind the wall (smoke, 2026-11-26). */
export const SITE_BOOTED = `(typeof devBypass === 'function' && document.readyState === 'complete' && (!!document.getElementById('dev-bypass-btn')
  || (typeof firebase === 'undefined' && !!document.querySelector('#auth-wall [data-i18n="auth.fallbackTitle"]'))))`;

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]', '::1']);
/* Only requests that could leave the machine: data:, blob:, about:, chrome: and the like never do. */
export function outsideHost(url) {
  let u;
  try { u = new URL(url); } catch { return null; }
  if (!/^(https?|wss?|ftp):$/.test(u.protocol)) return null;
  return LOCAL_HOSTS.has(u.hostname) ? null : u.host;
}
const isQuiet = (url) => QUIET.some(p => url.startsWith(p));
/* A page is named by its path on the test server (the port changes every run); an outside page by its host. */
const pageName = (url) => {
  try { const u = new URL(url); return LOCAL_HOSTS.has(u.hostname) ? (u.pathname + u.search).slice(0, 90) : u.protocol + '//' + u.host + '/…'; }
  catch { return String(url || '?').slice(0, 90); }
};

/* What a page's window.firebase has initialised. A stub with no apps array (the console tools' fake Firestore) is []. */
const FIREBASE_PROBE = `(() => { try { const f = window.firebase, a = f && f.apps;
  if (!a || typeof a.length !== 'number') return [];
  return Array.from(a, x => String((x && x.options && x.options.projectId) || '(no projectId)')); } catch (e) { return []; } })()`;

function makeRecord(tool, opts) {
  const allow = new Set(opts.allowProjects || []);
  const hosts = new Map();      // host -> { n, answered, pages:Set }
  const quiet = new Map();      // host -> n
  const apps = new Map();       // projectId -> Set(page)
  const seen = new Set();       // requestId|url, so a request two sessions both report counts once
  let total = 0, answeredQuiet = 0;
  return {
    request(id, url, page) {
      const host = outsideHost(url);
      if (!host) { total++; return; }
      const key = id + '|' + url;
      if (seen.has(key)) return;
      seen.add(key); total++;
      if (isQuiet(url)) { quiet.set(host, (quiet.get(host) || 0) + 1); return; }
      const h = hosts.get(host) || { n: 0, answered: 0, pages: new Set() };
      h.n++; h.pages.add(pageName(page));
      hosts.set(host, h);
    },
    /* An outside request that got a reply: the flags should make this impossible; counted to show they held. */
    answered(url) {
      const host = outsideHost(url), h = host && hosts.get(host);
      if (h) h.answered++;
      else if (host && isQuiet(url)) answeredQuiet++;
    },
    firebase(ids, page) {
      for (const id of ids) if (!allow.has(id)) { const s = apps.get(id) || new Set(); s.add(pageName(page)); apps.set(id, s); }
    },
    /* Prints the verdict and returns the tool's exit code: unchanged when the wall held, at least 1 when it did not. */
    finish(code, watched) {
      const bad = [];
      for (const [host, h] of hosts) bad.push(`${tool}: ✗ wall: ${[...h.pages].join(', ')} tried to reach ${host} (${h.n} request${h.n === 1 ? '' : 's'}, ${h.answered} answered). Tests may not reach outside hosts (tools/chrome-wall.mjs).`);
      for (const [id, pages] of apps) bad.push(`${tool}: ✗ wall: ${[...pages].join(', ')} initialised Firebase for ${id}${id === CLASS_PROJECT ? ' (the CLASS project)' : ''}. Tests may not start a Firebase app (tools/chrome-wall.mjs).`);
      const q = [...quiet].map(([h, n]) => `${h} ×${n}`).join(', ') + (answeredQuiet ? ` (${answeredQuiet} ANSWERED)` : '');
      if (bad.length) { for (const l of bad) console.error(l); return code || 1; }
      console.log(`${tool}: wall ✓ no request left 127.0.0.1 (${total} requests from ${watched} pages and workers watched${q ? `; blocked as expected: ${q}` : ''}), no Firebase app started`);
      return code;
    },
    get outside() { return [...hosts].map(([host, h]) => ({ host, n: h.n, answered: h.answered, pages: [...h.pages] })); },
    get quiet() { return [...quiet].map(([host, n]) => ({ host, n })); },
    get total() { return total; },
  };
}

/* The CDP watch. Connects to Chrome's browser endpoint (a second client beside the tool's own) and attaches to every
   target, pausing each new one until its Network domain is on, so no request is sent unseen. A tool that opens a
   tab itself (/json/new) calls `await wall.page(t.id)` before its first navigation: the new tab's first request
   can otherwise go out before the watch has attached to it (1 run in 6 in a test, 2026-11-26). */
export async function wallWatch(cdpPort, tool, opts = {}) {
  const rec = makeRecord(tool, opts);
  let version = null;
  for (let i = 0; i < 80 && !version; i++) { try { version = await (await fetch(`http://127.0.0.1:${cdpPort}/json/version`)).json(); } catch { await sleep(250); } }
  if (!version) throw new Error('chrome-wall: Chrome did not answer on port ' + cdpPort);
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('chrome-wall: could not connect to Chrome')); });
  let id = 0, closed = false;
  const pending = new Map();
  const sessions = new Map();   // sessionId -> { type, url, ready:Promise, targetId }
  const ready = new Map();      // targetId -> Promise (Network on)
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
    if (closed) return rej(new Error('closed'));
    const i = ++id; pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  const timed = (p, ms) => Promise.race([p, sleep(ms).then(() => { throw new Error('timeout'); })]);
  let watched = 0;
  const probe = async (sid) => {
    const s = sessions.get(sid);
    if (!s || (s.type !== 'page' && s.type !== 'iframe')) return;
    try {
      const r = await timed(send('Runtime.evaluate', { expression: FIREBASE_PROBE, returnByValue: true }, sid), 3000);
      const ids = r && r.result && r.result.value;
      if (Array.isArray(ids) && ids.length) {
        const where = await timed(send('Runtime.evaluate', { expression: 'location.href', returnByValue: true }, sid), 3000).then(x => x.result.value).catch(() => s.url);
        rec.firebase(ids, where);
      }
    } catch { /* the page is between two documents or gone */ }
  };
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); return; }
    if (m.method === 'Target.attachedToTarget') {
      const sid = m.params.sessionId, ti = m.params.targetInfo;
      const ext = /^(chrome-extension|chrome|devtools):/.test(ti.url || '');
      const s = { type: ti.type, url: ti.url, targetId: ti.targetId };
      sessions.set(sid, s);
      /* Chrome's own extensions are not the site: let them run, unwatched. */
      if (ext) { send('Runtime.runIfWaitingForDebugger', {}, sid).catch(() => {}); return; }
      watched++;
      const on = Promise.all([
        send('Network.enable', {}, sid),
        send('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: true, flatten: true }, sid),
        ti.type === 'page' || ti.type === 'iframe' ? send('Page.enable', {}, sid) : null,
      ]).catch(() => {}).finally(() => send('Runtime.runIfWaitingForDebugger', {}, sid).catch(() => {}));
      ready.set(ti.targetId, on);
      return;
    }
    if (m.method === 'Target.detachedFromTarget') { sessions.delete(m.params.sessionId); return; }
    const s = m.sessionId && sessions.get(m.sessionId);
    if (m.method === 'Network.requestWillBeSent') {
      const p = m.params;
      rec.request(p.requestId, p.request.url, p.documentURL || (s && s.url) || '?');
      return;
    }
    if (m.method === 'Network.responseReceived') { rec.answered(m.params.response.url); return; }
    if (m.method === 'Network.webSocketCreated') { rec.request('ws:' + m.params.requestId, m.params.url, (s && s.url) || '?'); return; }
    if (m.method === 'Page.loadEventFired' && m.sessionId) { const sid = m.sessionId; setTimeout(() => probe(sid), 1500); }
  };
  ws.onclose = () => { closed = true; for (const p of pending.values()) p.rej(new Error('closed')); pending.clear(); };
  await send('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: true, flatten: true,
    filter: [{ type: 'browser', exclude: true }, { type: 'tab', exclude: true }, {}] });
  const poll = setInterval(() => { for (const sid of sessions.keys()) probe(sid); }, 5000);
  poll.unref();
  return {
    /* Wait until the watch is on in the tab the tool just opened (its first navigation is seen then). */
    async page(targetId) {
      for (let i = 0; i < 200 && !ready.has(targetId); i++) await sleep(10);
      await ready.get(targetId);
    },
    /* The last look at every open page, then the verdict (see makeRecord). Safe to call with Chrome already gone. */
    async finish(code) {
      clearInterval(poll);
      if (!closed) await Promise.all([...sessions.keys()].map(probe));
      try { ws.close(); } catch { /* gone */ }
      return rec.finish(code, watched);
    },
    get outside() { return rec.outside; },
    get quiet() { return rec.quiet; },
  };
}

/* The Playwright watch (tools/mic-sim/*): the same flags at launch (pass WALL_FLAGS in `args`), every request routed:
   local ones continue, outside ones are aborted inside Chrome and recorded. Call with the browser CONTEXT. */
export async function wallPlaywright(context, tool, opts = {}) {
  const rec = makeRecord(tool, opts);
  let n = 0, watched = 0;
  await context.route('**/*', (route) => {
    const req = route.request(), url = req.url();
    let page = '?';
    try { const f = req.frame(); page = f ? f.url() : '?'; } catch { /* a service worker's request has no frame */ }
    rec.request('pw' + (++n), url, page);
    return outsideHost(url) ? route.abort('blockedbyclient') : route.continue();
  });
  const pages = new Set();
  const probe = async (p) => { try { const ids = await p.evaluate(FIREBASE_PROBE); if (ids.length) rec.firebase(ids, p.url()); } catch { /* closed or navigating */ } };
  const track = (p) => { pages.add(p); watched++; p.on('load', () => setTimeout(() => probe(p), 1500)); p.on('close', () => pages.delete(p)); };
  context.pages().forEach(track);
  context.on('page', track);
  context.on('serviceworker', () => { watched++; });
  return {
    async finish(code) { await Promise.all([...pages].map(probe)); return rec.finish(code, watched); },
    get outside() { return rec.outside; },
  };
}

/* ── The lock ─────────────────────────────────────────────────────────────────────────────────────────────── */
export const SLOT_DIR = join(tmpdir(), 'gc-browser-slots');
const STALE_MS = 4 * 3600 * 1000;
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
/* The live holders, with dead or too-old pid files removed. */
export function slotHolders(dir = SLOT_DIR) {
  let names = [];
  try { names = readdirSync(dir).filter(n => /^slot-\d+\.pid$/.test(n)); } catch { return []; }
  const live = [];
  for (const n of names) {
    const f = join(dir, n);
    let txt = '', age = 0;
    try { txt = readFileSync(f, 'utf8'); age = Date.now() - statSync(f).mtimeMs; } catch { continue; }
    const pid = parseInt(txt, 10);
    if (!pid || !alive(pid) || age > STALE_MS) { try { unlinkSync(f); } catch { /* another process got there first */ } continue; }
    live.push({ file: n, pid, what: txt.trim().split(/\s+/).slice(1, 2).join('') });
  }
  return live;
}

/* Takes a browser slot (waits for one) and returns its release; it is also released when the process exits. */
export async function browserSlot(tool, opts = {}) {
  const env = opts.env || process.env;
  if (env.CI) return () => {};
  if (env.GC_BROWSER_SLOT_HELD) return () => {};
  const slots = Math.max(1, parseInt(env.GC_BROWSER_SLOTS, 10) || 2);
  const dir = opts.dir || SLOT_DIR;
  const poll = opts.pollMs || 2000;
  mkdirSync(dir, { recursive: true });
  let said = false;
  for (;;) {
    const live = slotHolders(dir);
    if (live.length < slots) {
      for (let i = 0; i < slots; i++) {
        const f = join(dir, `slot-${i}.pid`);
        try { writeFileSync(f, `${process.pid} ${tool} ${new Date().toISOString()}\n`, { flag: 'wx' }); }
        catch (e) { if (e.code === 'EEXIST') continue; throw e; }
        let gone = false;
        const release = () => { if (gone) return; gone = true; try { if (readFileSync(f, 'utf8').startsWith(process.pid + ' ')) unlinkSync(f); } catch { /* already gone */ } };
        process.once('exit', release);
        env.GC_BROWSER_SLOT_HELD = String(process.pid);
        if (said) console.error(`${tool}: got a browser slot`);
        return release;
      }
    }
    if (!said) { console.error(`${tool}: waiting for a browser slot (${slots} in use: ${live.map(h => h.what || h.pid).join(', ')}; GC_BROWSER_SLOTS=${slots})`); said = true; }
    await sleep(poll);
  }
}

/* ── Self-test ────────────────────────────────────────────────────────────────────────────────────────────── */
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv.includes('--self-test')) {
  const { spawn } = await import('node:child_process');
  const { createServer } = await import('node:http');
  const net = await import('node:net');
  let bad = 0;
  const ok = (cond, what) => { console.log(`${cond ? '  ✓' : '  ✗'} ${what}`); if (!cond) bad++; };
  /* The lock: two holders, a third waits, then gets a slot when one leaves; a dead pid's file is cleaned. */
  const dir = mkdtempSync(join(tmpdir(), 'gc-slot-test-'));
  const env = () => ({ GC_BROWSER_SLOTS: '2' });
  const r1 = await browserSlot('a', { dir, env: env() }), r2 = await browserSlot('b', { dir, env: env() });
  let third = false;
  const p3 = browserSlot('c', { dir, env: env(), pollMs: 100 }).then(r => { third = true; return r; });
  await sleep(400);
  ok(!third, 'a third run waits while two hold a slot');
  r1(); await sleep(400);
  ok(third, 'the third run starts once one is released');
  r2(); (await p3)();
  writeFileSync(join(dir, 'slot-0.pid'), '999999999 dead\n'); writeFileSync(join(dir, 'slot-1.pid'), '999999998 dead\n');
  const r4 = await Promise.race([browserSlot('d', { dir, env: env(), pollMs: 100 }), sleep(1000).then(() => null)]);
  ok(!!r4, 'pid files of processes that are gone are removed'); if (r4) r4();
  ok(typeof (await browserSlot('e', { dir, env: { CI: 'true', GC_BROWSER_SLOTS: '0' } })) === 'function', 'CI skips the lock');
  rmSync(dir, { recursive: true, force: true });
  /* The wall: a page that fetches an outside host, and one that starts a Firebase app. */
  const chrome = process.env.CHROME || '/usr/bin/google-chrome';
  if (!existsSync(chrome)) { console.log('chrome-wall: no Chrome (set CHROME); the wall part is not tested'); process.exit(bad ? 1 : 0); }
  const page = createServer((q, s) => { s.writeHead(200, { 'content-type': 'text/html' }); s.end(
    q.url.startsWith('/leak') ? `<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script><script>fetch('https://firestore.googleapis.com/v1/x').catch(()=>{})</script>`
    : q.url.startsWith('/init') ? `<script>window.firebase={apps:[],initializeApp(c){this.apps.push({options:c})}};firebase.initializeApp({projectId:${JSON.stringify(CLASS_PROJECT)}})</script>`
    : `<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script><p>quiet</p>`); });
  await new Promise(r => page.listen(0, '127.0.0.1', r));
  const free = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
  for (const [path, want] of [['/quiet', 0], ['/leak', 1], ['/init', 1]]) {
    const cdp = await free(), prof = mkdtempSync(join(tmpdir(), 'gc-wall-test-'));
    const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, '--no-first-run', '--disable-gpu', ...WALL_FLAGS, 'about:blank'], { stdio: 'ignore' });
    const wall = await wallWatch(cdp, 'self-test');
    const t = await (await fetch(`http://127.0.0.1:${cdp}/json/new?about:blank`, { method: 'PUT' })).json();
    await wall.page(t.id);
    const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
    ws.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url: `http://127.0.0.1:${page.address().port}${path}` } }));
    await sleep(3000);
    const code = await wall.finish(0);
    ok(code === want, `${path}: exit ${code}, expected ${want}`);
    proc.kill(); await sleep(500); rmSync(prof, { recursive: true, force: true });
  }
  page.close();
  console.log(bad ? `chrome-wall: ✗ ${bad} self-test case(s) failed` : 'chrome-wall: ✓ self-test passed');
  process.exit(bad ? 1 : 0);
}
