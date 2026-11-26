/* chrome-wall.mjs — the wall and the browser lock that every headless-Chrome tool goes through (2026-11-26).

   Why: a test page served on 127.0.0.1 gets the CLASS Firebase project's settings (firebase-config.js picks the
   practice project only on the practice host names). Before this file, ten of the fifteen headless-Chrome tools did
   not block the network, so their pages loaded the real Firebase SDK from gstatic.com and could talk to the real
   class project (closed-loop report 2026-11-26, "Fix first"). Measured on origin/main ecee6ac with this watch in
   report-only mode (no flags, nothing failed): every one of those pages loaded the SDK from www.gstatic.com and
   started the CLASS project's app, and smoke (activities, games), trainer-e2e and song-files-e2e also sent
   requests to firestore.googleapis.com that were answered. GitHub's smoke runs did the same on every push.

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
   Slots are files in ~/.cache/gc-browser-slots (one folder per machine, whatever TMPDIR says), each holding its
   process's pid and start time; a file whose process is gone, whose pid now belongs to a later process, or that
   is older than 4 hours is removed, under a mutex so two waiters never clean the same file. While it waits, the
   tool's watchdog is fed (onWait) and the wait is not counted in its timeout. Skipped on GitHub Actions (CI is set: every job is its own machine). A tool started by a tool that
   already holds a slot (GC_BROWSER_SLOT_HELD in its environment) does not take a second one.

   Never weaken the wall or a loop to make a run pass: a request the page really needs gets a local copy (vendor/)
   or a stub in the tool, never an allowed outside host.

     node tools/chrome-wall.mjs --self-test     the wall and the lock on a made-up page (Chrome; about 20 s) */
import { mkdirSync, writeFileSync, readFileSync, readdirSync, unlinkSync, statSync, existsSync, mkdtempSync, rmSync, rmdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir, homedir } from 'node:os';
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

/* Outside files the site asks for on every load: the Firebase SDK's <script defer src> tags in index.html and the
   Song Journey pages (tabs/*.html), and the Firestore SDK file app/boot.js adds from the same folder. Prefixes,
   matched against the whole URL. Measured 2026-11-26: the only outside file the fifteen tools' pages asked for
   behind the wall. Keep this list short and static-file only. */
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

function makeRecord(tool) {
  /* hosts: host -> { n, answered, pages }; quiet: host -> n; apps: projectId -> pages; seen: requestId|url, so a
     request two sessions both report counts once. */
  const hosts = new Map();
  const quiet = new Map();
  const apps = new Map();
  const seen = new Set();
  let total = 0, answeredQuiet = 0, done = false, watchedNow = () => 0;
  const answeredIds = new Set();
  /* A tool that crashes, hangs into its watchdog or exits by a path that skips finish() still prints the verdict and
     cannot exit 0 past it: the record is read once more as the process exits (no last look at the pages then). */
  const onExit = (code) => { if (done) return; const c = rec.finish(code, watchedNow()); if (c !== code) process.exitCode = c; };
  process.on('exit', onExit);
  const rec = {
    set watchedCount(fn) { watchedNow = fn; },
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
    answered(id, url) {
      if (!url || answeredIds.has(id)) return;
      answeredIds.add(id);
      const host = outsideHost(url), h = host && hosts.get(host);
      if (h) h.answered++;
      else if (host && isQuiet(url)) answeredQuiet++;
    },
    firebase(ids, page) {
      for (const id of ids) { const s = apps.get(id) || new Set(); s.add(pageName(page)); apps.set(id, s); }
    },
    /* Prints the verdict and returns the tool's exit code: unchanged when the wall held, at least 1 when it did not. */
    finish(code, watched) {
      done = true; process.removeListener('exit', onExit);
      const bad = [];
      for (const [host, h] of hosts) bad.push(`${tool}: ✗ wall: ${[...h.pages].join(', ')} tried to reach ${host} (${h.n} request${h.n === 1 ? '' : 's'}, ${h.answered} answered). Tests may not reach outside hosts (tools/chrome-wall.mjs).`);
      for (const [id, pages] of apps) bad.push(`${tool}: ✗ wall: ${[...pages].join(', ')} initialised Firebase for ${id}${id === CLASS_PROJECT ? ' (the CLASS project)' : ''}. Tests may not start a Firebase app (tools/chrome-wall.mjs).`);
      /* A quiet file that got an ANSWER means this Chrome is not behind the flags (review R1-3): that fails too. */
      if (answeredQuiet) bad.push(`${tool}: ✗ wall: ${answeredQuiet} request${answeredQuiet === 1 ? '' : 's'} to ${[...quiet.keys()].join(', ')} got an answer: this Chrome is not behind WALL_FLAGS (tools/chrome-wall.mjs).`);
      const q = [...quiet].map(([h, n]) => `${h} ×${n}`).join(', ');
      if (bad.length) { for (const l of bad) console.error(l); return code || 1; }
      console.log(`${tool}: wall ✓ no request left 127.0.0.1 (${total} requests from ${watched} pages and workers watched${q ? `; blocked as expected: ${q}` : ''}), no Firebase app started`);
      return code;
    },
    get outside() { return [...hosts].map(([host, h]) => ({ host, n: h.n, answered: h.answered, pages: [...h.pages] })); },
    get quiet() { return [...quiet].map(([host, n]) => ({ host, n })); },
    get total() { return total; },
  };
  return rec;
}

/* The CDP watch. Connects to Chrome's browser endpoint (a second client beside the tool's own) and attaches to every
   target, pausing each new one until its Network domain is on, so no request is sent unseen. A tool that opens a
   tab itself (/json/new) calls `await wall.page(t.id)` before its first navigation: the new tab's first request
   can otherwise go out before the watch has attached to it (1 run in 6 in a test, 2026-11-26). */
export async function wallWatch(cdpPort, tool) {
  const rec = makeRecord(tool);
  let version = null;
  for (let i = 0; i < 80 && !version; i++) { try { version = await (await fetch(`http://127.0.0.1:${cdpPort}/json/version`)).json(); } catch { await sleep(250); } }
  if (!version) throw new Error('chrome-wall: Chrome did not answer on port ' + cdpPort);
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('chrome-wall: could not connect to Chrome')); });
  let id = 0, closed = false;
  const pending = new Map();
  /* sessions: sessionId -> { type, url, targetId }; ready: targetId -> a promise, Network on; net: requestId ->
     { hops, extra (ExtraInfo replies), ended, url (the last hop's) }. */
  const sessions = new Map();
  const ready = new Map();
  const net = new Map();
  const settle = (id) => {
    const n = net.get(id);
    if (!n || !n.ended || !n.hops || n.extra < n.hops) return;
    net.delete(id);
    if (outsideHost(n.url)) rec.answered(id, n.url);
  };
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
    if (closed) return rej(new Error('closed'));
    const i = ++id; pending.set(i, { res, rej });
    ws.send(JSON.stringify({ id: i, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  const timed = (p, ms) => Promise.race([p, sleep(ms).then(() => { throw new Error('timeout'); })]);
  let watched = 0;
  rec.watchedCount = () => watched;
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
        /* A page's frames and dedicated workers are attached here; its service worker is not: the browser-level
           attach below already watches it, and a second paused attach left the site's worker never installing
           (update-reload-loop hung at "waiting for the worker to control the page", 2026-11-26). */
        send('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: true, flatten: true, filter: [{ type: 'service_worker', exclude: true }, {}] }, sid),
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
      const n = net.get(p.requestId) || { hops: 0, extra: 0, ended: false };
      n.hops++; n.url = p.request.url; net.set(p.requestId, n); settle(p.requestId);
      return;
    }
    /* Was the LAST hop of a request answered? responseReceived says so with its URL, but is missing when Chrome
       blocks the body (a script served as text/html). responseReceivedExtraInfo is sent for every reply off the
       wire, redirects included, in any order with the other events: once the request has ended, it was answered
       when there are as many of them as hops (a local 302 whose next hop is blocked has one fewer; review R2-4). */
    if (m.method === 'Network.responseReceived') { rec.answered(m.params.requestId, m.params.response.url); return; }
    if (m.method === 'Network.responseReceivedExtraInfo') {
      const n = net.get(m.params.requestId) || { hops: 0, extra: 0, ended: false };
      n.extra++; net.set(m.params.requestId, n); settle(m.params.requestId);
      return;
    }
    if (m.method === 'Network.loadingFinished' || m.method === 'Network.loadingFailed') {
      const n = net.get(m.params.requestId);
      if (n) { n.ended = true; settle(m.params.requestId); }
      return;
    }
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
export async function wallPlaywright(context, tool) {
  const rec = makeRecord(tool);
  let n = 0, watched = 0;
  rec.watchedCount = () => watched;
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
/* One folder per machine, under the home folder, so sessions with different TMPDIRs share it (review R1-5). */
export const SLOT_DIR = join(homedir(), '.cache', 'gc-browser-slots');
const STALE_MS = 4 * 3600 * 1000, MUTEX_STALE_MS = 10000;
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
/* When a process started (ms), from `ps -o lstart=` (macOS and Linux; seconds only), or null where there is no ps
   (Windows: the pid alone decides there). A slot file stores its holder's start, so a pid the system gave to another
   process later does not keep a phantom slot (review R1-4). */
export function processStart(pid) {
  /* GC_SLOT_NO_PS: the self-test plays a machine without ps (Windows) with it. */
  if (process.env.GC_SLOT_NO_PS) return null;
  try {
    const r = spawnSync('ps', ['-o', 'lstart=', '-p', String(pid)], { encoding: 'utf8', timeout: 3000 });
    const t = Date.parse(String(r.stdout || '').trim());
    return r.status === 0 && Number.isFinite(t) ? t : null;
  } catch { return null; }
}
const OWN_START = Math.round(Date.now() - process.uptime() * 1000);
/* A slot file: "<pid> <start ms or -> <tool> <iso time>". */
const holderAlive = (txt, age) => {
  const [pidS, startS] = txt.trim().split(/\s+/), pid = parseInt(pidS, 10);
  if (!pid || age > STALE_MS || !alive(pid)) return false;
  const want = Number(startS);
  if (!Number.isFinite(want)) return true;
  const now = processStart(pid);
  return now === null || Math.abs(now - want) < 3000;
};
/* The live holders, with dead, reused-pid or too-old slot files removed. Call it inside withMutex(). */
export function slotHolders(dir = SLOT_DIR, raceMs = 0) {
  let names = [];
  try { names = readdirSync(dir).filter(n => /^slot-\d+\.pid$/.test(n)); } catch { return []; }
  const live = [];
  for (const n of names) {
    const f = join(dir, n);
    let txt = '', age = 0;
    try { txt = readFileSync(f, 'utf8'); age = Date.now() - statSync(f).mtimeMs; } catch { continue; }
    if (!holderAlive(txt, age)) {
      /* GC_SLOT_RACE_MS (the self-test only) holds the read-then-delete window open, so the race is played for sure. */
      if (raceMs) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, raceMs);
      try { unlinkSync(f); } catch { /* gone already */ }
      continue;
    }
    const w = txt.trim().split(/\s+/);
    live.push({ file: n, pid: parseInt(w[0], 10), what: w[2] || w[0] });
  }
  return live;
}
/* Cleaning stale files and taking a slot happen under one mutex (an atomic mkdir), so two waiters can never both
   read the same dead file, one replace it and the other delete the new one (review R1-4: that gave three runs).
   A mutex left by a process killed inside these few milliseconds is taken over after 10 s. */
async function withMutex(dir, fn) {
  const m = join(dir, '.mutex');
  for (;;) {
    try { mkdirSync(m); break; }
    catch (e) {
      if (e.code !== 'EEXIST') throw e;
      try { if (Date.now() - statSync(m).mtimeMs > MUTEX_STALE_MS) rmdirSync(m); } catch { /* released meanwhile */ }
      await sleep(25 + Math.random() * 50);
    }
  }
  try { return fn(); } finally { try { rmdirSync(m); } catch { /* best effort */ } }
}

/* Takes a browser slot (waits for one) and returns its release; it is also released when the process exits.
   opts.onWait(ms waited so far) is called before every poll while it waits: a tool's stall watchdog marks progress
   there, and the time spent waiting is left out of its whole-run timeout (review R1-1: a queued third run reported
   HUNG instead of waiting). The release function carries .waitedMs. */
export async function browserSlot(tool, opts = {}) {
  const env = opts.env || process.env;
  const none = Object.assign(() => {}, { waitedMs: 0 });
  if (env.CI) return none;
  if (env.GC_BROWSER_SLOT_HELD) return none;
  const slots = Math.max(1, parseInt(env.GC_BROWSER_SLOTS, 10) || 2);
  const dir = opts.dir || SLOT_DIR;
  const poll = opts.pollMs || 2000;
  /* The start time as ps reports it for this pid, so another process's check agrees: a run started as
     `bash -c 'sleep 5; node …'` keeps bash's pid and start time, 5 s before node's own (review R2-3). The uptime
     value only where there is no ps. */
  const start = opts.start === undefined ? (processStart(process.pid) ?? OWN_START) : opts.start;
  /* It gives up after GC_BROWSER_SLOT_MAX_WAIT minutes (default 45: longer than any run's own timeout) with exit 3,
     naming who holds the slots; while it waits it says so again every 60 s (review R2-2). */
  const maxWait = opts.maxWaitMs || (Number(env.GC_BROWSER_SLOT_MAX_WAIT) > 0 ? Number(env.GC_BROWSER_SLOT_MAX_WAIT) * 60000 : 45 * 60000);
  const sayEvery = opts.sayEveryMs || 60000;
  mkdirSync(dir, { recursive: true });
  let said = false, saidAt = 0;
  const t0 = Date.now();
  for (;;) {
    const got = await withMutex(dir, () => {
      const live = slotHolders(dir, Number(env.GC_SLOT_RACE_MS) || 0);
      if (live.length >= slots) return { live };
      for (let i = 0; i < slots; i++) {
        const f = join(dir, `slot-${i}.pid`);
        try { writeFileSync(f, `${process.pid} ${start === null ? '-' : start} ${tool} ${new Date().toISOString()}\n`, { flag: 'wx' }); }
        catch (e) { if (e.code === 'EEXIST') continue; throw e; }
        return { f };
      }
      return { live };
    });
    if (got.f) {
      const f = got.f, mine = `${process.pid} ${start === null ? '-' : start} `;
      let gone = false;
      const release = () => { if (gone) return; gone = true; try { if (readFileSync(f, 'utf8').startsWith(mine)) unlinkSync(f); } catch { /* already gone */ } };
      process.once('exit', release);
      env.GC_BROWSER_SLOT_HELD = String(process.pid);
      release.waitedMs = Date.now() - t0;
      if (said) console.error(`${tool}: got a browser slot after ${Math.round(release.waitedMs / 1000)} s`);
      return release;
    }
    const waited = Date.now() - t0, who = got.live.map(h => h.what).join(', ');
    if (waited >= maxWait) {
      console.error(`${tool}: ✗ gave up waiting for a browser slot after ${Math.round(waited / 60000)} min (GC_BROWSER_SLOT_MAX_WAIT); held by: ${who}`);
      process.exit(3);
    }
    if (!said || Date.now() - saidAt >= sayEvery) {
      console.error(`${tool}: waiting for a browser slot${said ? ` (${Math.round(waited / 1000)} s so far)` : ''} (${slots} in use: ${who}; GC_BROWSER_SLOTS=${slots})`);
      said = true; saidAt = Date.now();
    }
    if (opts.onWait) opts.onWait(waited);
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
  /* A live process holds its slot; a live pid whose start time is not the one written (a reused pid) does not. */
  const holder = spawn(process.execPath, ['-e', 'setTimeout(() => {}, 60000)'], { stdio: 'ignore' });
  await sleep(1500);
  const hs = processStart(holder.pid), noPs = hs === null;
  if (noPs) console.log('  - no ps here (Windows, or GC_SLOT_NO_PS): slot files carry no start time, the pid alone decides; the reused-pid and bash cases are skipped');
  else ok(true, `the start time of a live process is read (${new Date(hs).toISOString()})`);
  const hsTxt = noPs ? '-' : hs;
  writeFileSync(join(dir, 'slot-0.pid'), `${holder.pid} ${hsTxt} fake-holder x\n`); writeFileSync(join(dir, 'slot-1.pid'), `${holder.pid} ${hsTxt} fake-holder x\n`);
  const waits = [];
  let r5 = null;
  const p5 = browserSlot('f', { dir, env: env(), pollMs: 100, onWait: ms => waits.push(ms) }).then(r => { r5 = r; });
  await sleep(700);
  ok(!r5 && waits.length >= 3 && waits.every((w, i) => !i || w >= waits[i - 1]), `a live holder keeps its slot, and the waiter's onWait ran on every poll (${waits.length} calls)`);
  if (noPs) { writeFileSync(join(dir, 'slot-1.pid'), '999999995 - gone x\n'); await sleep(400); ok(!!r5, 'with no ps, a holder whose pid is gone frees its slot'); }
  else {
    writeFileSync(join(dir, 'slot-1.pid'), `${holder.pid} ${hs - 60000} reused-pid x\n`);
    await sleep(400);
    ok(!!r5 && r5.waitedMs >= 600, `a pid now owned by a later process frees its slot (waited ${r5 ? r5.waitedMs : '?'} ms, carried on the release)`);
  }
  if (r5) r5();
  holder.kill();
  await p5;
  /* review R2-3: a run started as bash -c 'sleep 3; node …' keeps bash's pid and start time; it must keep its slot. */
  if (!noPs && process.platform !== 'win32') {
    rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
    const held = join(dir, 'held.txt'), hold = join(dir, 'hold.mjs');
    writeFileSync(hold, `import { browserSlot } from ${JSON.stringify(fileURLToPath(import.meta.url))};
      import { writeFileSync } from 'node:fs';
      await browserSlot('bash-holder', { dir: ${JSON.stringify(dir)}, env: { GC_BROWSER_SLOTS: '1' } });
      writeFileSync(${JSON.stringify(held)}, 'held'); await new Promise(r => setTimeout(r, 8000));`);
    const bh = spawn('bash', ['-c', `sleep 3; ${JSON.stringify(process.execPath)} ${JSON.stringify(hold)}`], { stdio: 'ignore' });
    for (let k = 0; k < 100 && !existsSync(held); k++) await sleep(100);
    let stole = null;
    const p6 = browserSlot('second', { dir, env: { GC_BROWSER_SLOTS: '1' }, pollMs: 100 }).then(r => { stole = Date.now(); return r; });
    await sleep(2000);
    ok(existsSync(held) && stole === null, `a holder started as bash -c 'sleep 3; node …' keeps its slot (a second run waits${stole ? ': it took the slot' : ''})`);
    bh.kill(); (await p6)();
  }
  /* review R2-2: a run that cannot get a slot gives up after the maximum wait with exit 3 and names the holders. */
  {
    rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'slot-0.pid'), `${process.pid} ${noPs ? '-' : processStart(process.pid)} the-holder x\n`);
    const gw = join(dir, 'giveup.mjs');
    writeFileSync(gw, `import { browserSlot } from ${JSON.stringify(fileURLToPath(import.meta.url))};
      await browserSlot('waiter', { dir: ${JSON.stringify(dir)}, env: { GC_BROWSER_SLOTS: '1' }, pollMs: 100, maxWaitMs: 1500, sayEveryMs: 500 });`);
    const r = await new Promise(res => { let e = ''; const c = spawn(process.execPath, [gw], { stdio: ['ignore', 'ignore', 'pipe'] }); const kill = setTimeout(() => c.kill(), 8000); c.stderr.on('data', d => { e += d; }); c.on('exit', code => { clearTimeout(kill); res({ code, e }); }); });
    const repeats = (r.e.match(/waiting for a browser slot \(\d+ s so far\)/g) || []).length;
    ok(r.code === 3 && /gave up waiting for a browser slot .*held by: the-holder/.test(r.e) && repeats >= 1, `a run that waits too long exits 3 naming the holder, and repeated its waiting line ${repeats} time(s) with the time waited`);
  }
  /* The race (review R1-4): eight processes start at once against two DEAD slot files; never more than two hold. */
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'slot-0.pid'), '999999997 1 dead x\n'); writeFileSync(join(dir, 'slot-1.pid'), '999999996 1 dead x\n');
  const log = join(dir, 'log.txt'), child = join(dir, 'child.mjs'), go = Date.now() + 1500;
  writeFileSync(child, `import { browserSlot } from ${JSON.stringify(fileURLToPath(import.meta.url))};
    import { appendFileSync } from 'node:fs';
    while (Date.now() < ${go}) await new Promise(r => setTimeout(r, 1));
    const rel = await browserSlot('race', { dir: ${JSON.stringify(dir)}, env: { GC_BROWSER_SLOTS: '2', GC_SLOT_RACE_MS: '200' }, pollMs: 20 });
    appendFileSync(${JSON.stringify(log)}, process.hrtime.bigint() + ' +\\n');
    await new Promise(r => setTimeout(r, 250));
    appendFileSync(${JSON.stringify(log)}, process.hrtime.bigint() + ' -\\n');
    rel();`);
  await Promise.all(Array.from({ length: 8 }, () => new Promise(res => spawn(process.execPath, [child], { stdio: 'ignore' }).on('exit', res))));
  const ev = readFileSync(log, 'utf8').trim().split('\n').map(l => l.split(' ')).sort((x, y) => (BigInt(x[0]) < BigInt(y[0]) ? -1 : 1));
  let cur = 0, most = 0; for (const [, k] of ev) { cur += k === '+' ? 1 : -1; most = Math.max(most, cur); }
  ok(ev.length === 16 && most <= 2, `8 runs started at once over 2 dead slot files: ${ev.length / 2} ran, at most ${most} at a time`);
  rmSync(dir, { recursive: true, force: true });
  /* One lock folder whatever TMPDIR says (review R1-5): a run with another TMPDIR sees the same folder. */
  const other = await new Promise(res => { let o = ''; const c = spawn(process.execPath, ['--input-type=module', '-e', `import { SLOT_DIR } from ${JSON.stringify(fileURLToPath(import.meta.url))}; console.log(SLOT_DIR)`], { env: { ...process.env, TMPDIR: '/var/tmp/elsewhere', TEMP: 'C:\\elsewhere', TMP: 'C:\\elsewhere' }, stdio: ['ignore', 'pipe', 'ignore'] }); c.stdout.on('data', d => { o += d; }); c.on('exit', () => res(o.trim())); });
  ok(other === SLOT_DIR && !SLOT_DIR.startsWith(tmpdir()), `the lock folder is ${SLOT_DIR}, the same with another TMPDIR`);
  /* The wall: a page that fetches an outside host, and one that starts a Firebase app. */
  const chrome = process.env.CHROME || '/usr/bin/google-chrome';
  if (!existsSync(chrome)) { console.log('chrome-wall: no Chrome (set CHROME); the wall part is not tested'); process.exit(bad ? 1 : 0); }
  const page = createServer((q, s) => {
    if (q.url.startsWith('/redir.js')) { s.writeHead(302, { location: 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js' }); return s.end(); }
    if (q.url.startsWith('/q.js')) { s.writeHead(200, { 'content-type': 'text/javascript' }); return s.end('window.q = 1;'); }
    if (q.url.startsWith('/sw-out.js')) { s.writeHead(200, { 'content-type': 'text/javascript' }); return s.end(`self.addEventListener('install', e => e.waitUntil(fetch('https://firestore.googleapis.com/v1/sw').catch(() => {})))`); }
    if (q.url.startsWith('/sw-in.js')) { s.writeHead(200, { 'content-type': 'text/javascript' }); return s.end(`self.addEventListener('install', e => e.waitUntil(caches.open('t').then(c => c.add('/quiet')))); self.addEventListener('activate', e => e.waitUntil(clients.claim()))`); }
    s.writeHead(200, { 'content-type': 'text/html' }); s.end(
    q.url.startsWith('/sw-page') ? `<script>navigator.serviceWorker.register(${JSON.stringify(q.url.includes('out') ? '/sw-out.js' : '/sw-in.js')}).then(r => navigator.serviceWorker.ready).then(() => { document.title = 'sw ready'; })</script>`
    : q.url.startsWith('/leak') ? `<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script><script>fetch('https://firestore.googleapis.com/v1/x').catch(()=>{})</script>`
    : q.url.startsWith('/redir-page') ? `<script src="/redir.js"></script><p>a local 302 to gstatic.com</p>`
    : q.url.startsWith('/quiet-answered') ? `<script src="http://quiet.test:${page.address().port}/q.js"></script><p>open</p>`
    : q.url.startsWith('/init') ? `<script>window.firebase={apps:[],initializeApp(c){this.apps.push({options:c})}};firebase.initializeApp({projectId:${JSON.stringify(CLASS_PROJECT)}})</script>`
    : `<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script><p>quiet</p>`); });
  await new Promise(r => page.listen(0, '127.0.0.1', r));
  const free = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
  for (const [path, want] of [['/quiet', 0], ['/leak', 1], ['/init', 1], ['/sw-page-in', 0], ['/sw-page-out', 1], ['/quiet-answered', 1], ['/redir-page', 0]]) {
    const cdp = await free(), prof = mkdtempSync(join(tmpdir(), 'gc-wall-test-'));
    /* /quiet-answered: a Chrome WITHOUT the flags whose resolver lets a quiet-listed host through to this server
       (review R1-3): the quiet file gets an answer, and that must fail the run. */
    const open = path === '/quiet-answered';
    if (open) QUIET.push(`http://quiet.test:${page.address().port}/`);
    const flags = open ? ['--no-proxy-server', '--host-resolver-rules=MAP quiet.test 127.0.0.1'] : WALL_FLAGS;
    const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, '--no-first-run', '--disable-gpu', ...flags, 'about:blank'], { stdio: 'ignore' });
    const wall = await wallWatch(cdp, 'self-test');
    const t = await (await fetch(`http://127.0.0.1:${cdp}/json/new?about:blank`, { method: 'PUT' })).json();
    await wall.page(t.id);
    const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
    ws.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url: `http://127.0.0.1:${page.address().port}${path}` } }));
    await sleep(3000);
    if (path.startsWith('/sw-page')) {
      const title = (await (await fetch(`http://127.0.0.1:${cdp}/json/list`)).json()).find(x => x.id === t.id).title;
      ok(title === 'sw ready', `${path}: the service worker installed and activated under the watch (page title "${title}")`);
    }
    const code = await wall.finish(0);
    ok(code === want, `${path}: exit ${code}, expected ${want}`);
    proc.kill(); await sleep(500); rmSync(prof, { recursive: true, force: true });
  }
  /* A tool that leaves by process.exit(0) without finish(): the exit hook still prints the verdict and exits 1. */
  {
    const dir2 = mkdtempSync(join(tmpdir(), 'gc-wall-exit-')), script = join(dir2, 'child.mjs'), port = await free();
    writeFileSync(script, `import { spawn } from 'node:child_process';
      import { WALL_FLAGS, wallWatch } from ${JSON.stringify(fileURLToPath(import.meta.url))};
      const proc = spawn(${JSON.stringify(chrome)}, ['--headless=new', '--remote-debugging-port=${port}', '--user-data-dir=${join(dir2, 'prof')}', '--no-first-run', '--disable-gpu', ...WALL_FLAGS, 'about:blank'], { stdio: 'ignore' });
      const wall = await wallWatch(${port}, 'exit-test');
      const t = await (await fetch('http://127.0.0.1:${port}/json/new?about:blank', { method: 'PUT' })).json();
      await wall.page(t.id);
      const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
      ws.send(JSON.stringify({ id: 1, method: 'Page.navigate', params: { url: 'http://127.0.0.1:${page.address().port}/leak' } }));
      await new Promise(r => setTimeout(r, 3000));
      proc.kill();
      process.exit(0);`);
    const r = await new Promise(res => { const c = spawn(process.execPath, [script], { stdio: ['ignore', 'pipe', 'pipe'] }); let err = ''; c.stderr.on('data', d => { err += d; }); c.on('exit', code => res({ code, err })); });
    ok(r.code === 1 && /exit-test: ✗ wall: \/leak tried to reach firestore\.googleapis\.com/.test(r.err), `process.exit(0) without finish(): exit ${r.code}, the wall line ${/✗ wall/.test(r.err) ? 'printed' : 'MISSING'}`);
    await sleep(500); rmSync(dir2, { recursive: true, force: true });
  }
  page.close();
  console.log(bad ? `chrome-wall: ✗ ${bad} self-test case(s) failed` : 'chrome-wall: ✓ self-test passed');
  process.exit(bad ? 1 : 0);
}
