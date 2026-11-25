#!/usr/bin/env node
/* Proof that the kill-switch worker (tools/kill-switch/kill-sw.js) does what
   BREAK-GLASS.md promises, and that the real sw.js takes over again after it.
   Node only, no browser, writes nothing. The approach of tools/sw-audio-proof.mjs:
   each worker's REAL text runs in its own Node vm against ONE shared stand-in
   Cache Storage and a stand-in network.

   Scenarios
     the real worker first     the real sw.js installs, fills its shell cache and
                               stores three backing tracks with their records
     kill switch takes over    installs with no download and takes over at once
                               (skipWaiting); activate deletes every
                               `guitar-class-…` shell cache, keeps the two audio
                               caches byte for byte (every key and every body),
                               leaves another site's cache alone, claims the open
                               pages and tells each window "gc-sw-activated"; it
                               has no fetch handler (every request goes to the
                               network) and handles no other event; it does not
                               unregister itself; a second activate changes nothing
     a failing Cache Storage   a cache that cannot be deleted, or caches.keys()
                               failing, does not fail the activate, and the pages
                               are still claimed and told
     the real worker comes back  installs over the kill switch, refills its shell,
                               keeps every track and record, serves a stored
                               track from the cache with no request and the shell
                               from the cache
     the open pages            the page's half (the service-worker block of
                               app/start.js, run on the takeovers above): the
                               kill switch reloads a returning tab, a first-visit
                               tab, a hard-reloaded tab and a tab claimed while it
                               loaded exactly once each, and its held message alone
                               reloads a tab it took over before the page's script
                               ran; a first visit is not
                               reloaded by its own worker; the real worker coming
                               back reloads a tab opened under the kill switch once
                               (APP-CORE-1, 2026-11-25)
     an open page with unsaved work  the same block with the REAL save code
                               (queueSave, flushSave, withTimeout from app/save.js;
                               hasUnsavedWrites, flushBeforeLeaving from app/boot.js;
                               the "online" listener of app/shell.js) on a virtual
                               clock: a takeover never reloads over a tick still
                               waiting or on the wire (a tick in the 800 ms wait is
                               sent at once; offline 7 minutes: no reload until it
                               lands), a write refused for good while online holds
                               it only until the 5-minute limit, its last try is
                               waited for (4 s at most: a stalled write does not
                               pin the tab), and a tick made during that last try
                               holds it again; an exit check opened while the
                               waiting tick is sent holds it too; back online, the
                               "online" listener re-sends what the save code gave
                               up on (APP-CORE-3, review R1-1, R1-2 and R2-2,
                               2026-11-25)
     names and tools          the kept names are the pinned ones
                               (tools/sw-audio-map.mjs) and the ones the real
                               worker executes; `checks.mjs --live` reads
                               `guitar-class-kill-switch` from it; the full
                               checks.mjs finds nothing in it to rewrite; it is a
                               plain script with no importScripts

   Then it breaks kill-sw.js on purpose, one way at a time, and requires each
   breakage to turn at least one assertion red; and the same for the "unsaved
   work" branch of the start.js block (PAGE_BREAKAGES) and for the save code it
   runs with (SAVE_BREAKAGES), so that scenario cannot go blind. --no-mutations
   runs the scenarios only (tools/plant-a-fault.mjs runs it so: a breakage's
   exact-text target is not there on a planted line). --verbose prints the first red assertion of every breakage.

   usage: node tools/kill-switch/proof.mjs [path/to/kill-sw.js] [--real path/to/sw.js] [--page path/to/app/start.js] [--verbose] [--no-mutations]
   (--page: the save code is read from the same folder: its save.js, boot.js and shell.js.)
   Last line:
     kill-switch-proof: <assertions> assertions in <scenarios> scenarios, <caught> of <breakages> start.js breakages caught, <caught> of <breakages> save-code breakages caught, <caught> of <mutations> mutations caught
   Exit 0 only when every assertion holds and every mutation is caught.
   Run it after any change to sw.js, the service-worker block of app/start.js,
   queueSave / flushSave / hasUnsavedWrites / flushBeforeLeaving, or this folder. */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { AUDIO_BLOCK_RE, AUDIO_CACHE_NAME, AUDIO_HASH_CACHE_NAME } from '../sw-audio-map.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const args = process.argv.slice(2);
const realAt = args.indexOf('--real'), pageAt = args.indexOf('--page');
const realPath = realAt >= 0 ? args[realAt + 1] : join(ROOT, 'sw.js');
const pagePath = pageAt >= 0 ? args[pageAt + 1] : join(ROOT, 'app', 'start.js');
const killPath = args.find((a, i) => !a.startsWith('--') && !(realAt >= 0 && i === realAt + 1) && !(pageAt >= 0 && i === pageAt + 1)) || join(HERE, 'kill-sw.js');
const VERBOSE = args.includes('--verbose');
const lf = s => s.replace(/\r\n/g, '\n');
const KILL_SRC = lf(readFileSync(killPath, 'utf8'));
const REAL_SRC = lf(readFileSync(realPath, 'utf8'));
/* The page's half: the service-worker block of app/start.js, up to the hash router (empty if either end moved). */
const PAGE_SRC = (() => {
  const s = lf(readFileSync(pagePath, 'utf8'));
  const a = s.indexOf("if ('serviceWorker' in navigator"), b = s.indexOf('/* ── The hash router listens');
  return a >= 0 && b > a ? s.slice(a, b) : '';
})();
/* The save code that block waits on, the real functions, read from the folder of --page: withTimeout, queueSave and
   flushSave (app/save.js), hasUnsavedWrites and flushBeforeLeaving (app/boot.js), and the "online" listener that
   re-arms a save (app/shell.js). null if any of them is not found. */
const braceEnd = (src, open) => {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { i = src.indexOf('\n', i); continue; }
    if (c === '/' && d === '*') { i = src.indexOf('*/', i) + 1; continue; }
    if (c === "'" || c === '"' || c === '`') { const q = c; for (i++; src[i] !== q; i++) if (src[i] === '\\') i++; continue; }
    if (c === '{') depth++;
    if (c === '}' && --depth === 0) return i + 1;
  }
  throw new Error('unclosed block');
};
const fnText = (src, name) => {
  const m = new RegExp(`(^|\\n)((?:async )?function ${name}\\s*\\()`).exec(src);
  if (!m) throw new Error(`no function ${name}`);
  const a = m.index + m[1].length;
  return src.slice(a, braceEnd(src, src.indexOf('{', a)));
};
const SAVE = (() => {
  try {
    const read = f => lf(readFileSync(join(dirname(pagePath), f), 'utf8'));
    const save = read('save.js'), boot = read('boot.js'), shell = read('shell.js');
    const on = shell.indexOf("window.addEventListener('online', function(){");
    const retries = (save.match(/^const SAVE_MAX_AUTO_RETRIES = (\d+);/m) || [])[1];
    if (on < 0 || !retries) return null;
    return { retries: +retries, code: [fnText(save, 'withTimeout'), fnText(save, 'queueSave'), fnText(save, 'flushSave'),
      fnText(boot, 'hasUnsavedWrites'), fnText(boot, 'flushBeforeLeaving'), shell.slice(on, braceEnd(shell, shell.indexOf('{', on))) + ');'].join('\n') };
  } catch { return null; }
})();
const BASE = 'https://class.test/guitar-class/';

/* ── stand-ins for the browser ─────────────────────────────────────────── */
class FakeResponse {
  constructor(body, init = {}) {
    this.body = Buffer.isBuffer(body) ? body : Buffer.from(body == null ? '' : String(body));
    this.status = init.status == null ? 200 : init.status;
    this.type = init.type || 'default';
  }
  clone() { return new FakeResponse(this.body, { status: this.status, type: this.type }); }
  async text() { return this.body.toString('utf8'); }
  static error() { return new FakeResponse('', { status: 0, type: 'error' }); }
}
class FakeRequest {
  constructor(input, init = {}) {
    this.url = new URL(typeof input === 'string' ? input : input.url, BASE).href;
    this.method = init.method || 'GET';
    this.mode = init.mode || 'no-cors';
    this.cache = init.cache || 'default';
    const h = new Map(Object.entries(init.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
    this.headers = { has: k => h.has(String(k).toLowerCase()) };
  }
}
const keyOf = r => new URL(typeof r === 'string' ? r : r.url, BASE).href;
class FakeCache {
  constructor(storage) { this.m = new Map(); this.storage = storage; }
  async match(r) { const e = this.m.get(keyOf(r)); return e ? e.clone() : undefined; }
  async put(r, res) { this.m.set(keyOf(r), res.clone()); }
  async delete(r) { return this.m.delete(keyOf(r)); }
  async keys() { return [...this.m.keys()].map(u => new FakeRequest(u)); }
  async add(r) {
    const res = await this.storage.net(typeof r === 'string' ? new FakeRequest(r) : r, { cache: typeof r === 'string' ? 'default' : r.cache });
    if (!res || res.status !== 200) throw new Error('add failed');
    this.m.set(keyOf(r), res);
  }
  async addAll(rs) { const before = new Map(this.m); try { for (const r of rs) await this.add(r); } catch (e) { this.m = before; throw e; } }
}
class FakeStorage {
  constructor() { this.c = new Map(); this.net = null; this.failDelete = null; this.failKeys = false; }
  async open(name) { if (!this.c.has(name)) this.c.set(name, new FakeCache(this)); return this.c.get(name); }
  async keys() { if (this.failKeys) throw new Error('keys failed'); return [...this.c.keys()]; }
  /* caches.match(): any cache, in the order they were opened. */
  async match(r) { for (const c of this.c.values()) { const hit = await c.match(r); if (hit) return hit; } return undefined; }
  async delete(name) { if (this.failDelete && this.failDelete(name)) throw new Error('delete failed'); return this.c.delete(name); }
  names() { return [...this.c.keys()].sort(); }
  /* Every cache, every key, every body: the "byte-identical" the audio caches must keep. */
  snapshot(names) {
    const out = {};
    for (const n of names) { const c = this.c.get(n); out[n] = c ? [...c.m.entries()].map(([k, r]) => `${k} ${r.status} ${r.body.toString('base64')}`).sort() : null; }
    return JSON.stringify(out);
  }
}

/* One worker version against the shared storage. The network answers every
   same-origin path with `net:<path>` (206 for a Range request). */
function boot(src, storage) {
  const handlers = {}, events = [], posted = [], calls = [];
  let unregistered = 0;
  const registration = { unregister: async () => { unregistered++; return true; } };
  const self = {
    location: new URL('sw.js', BASE),
    addEventListener: (t, f) => { (handlers[t] = handlers[t] || []).push(f); },
    registration,
    skipWaiting: async () => { events.push('skipWaiting'); },
    clients: {
      claim: async () => { events.push('claim'); },
      matchAll: async o => (o && o.type === 'window') ? [{ postMessage: m => posted.push(m) }, { postMessage: m => posted.push(m) }] : [],
    },
  };
  const net = async (req, init = {}) => {
    const r = typeof req === 'string' ? new FakeRequest(req) : req;
    const path = new URL(r.url).pathname.replace(new URL(BASE).pathname, '');
    calls.push({ path, cache: init.cache || 'default', range: r.headers.has('range') });
    return new FakeResponse(`net:${path}`, { status: r.headers.has('range') ? 206 : 200, type: 'basic' });
  };
  storage.net = net;
  const ctx = vm.createContext({ self, caches: storage, fetch: net, Response: FakeResponse, Request: FakeRequest, URL, Promise, console });
  vm.runInContext(src, ctx, { filename: 'worker.js' });
  const fire = async (type, extra = {}) => {
    const ps = [];
    for (const f of handlers[type] || []) f({ ...extra, waitUntil: p => ps.push(p) });
    await Promise.all(ps);
    return ps.length;
  };
  return {
    handlers, events, posted, calls, read: e => vm.runInContext(e, ctx),
    get unregistered() { return unregistered; },
    use() { storage.net = net; },
    install: () => fire('install'),
    activate: () => fire('activate'),
    message: data => fire('message', { data }),
    /* A request as the page makes it: did any fetch handler answer it, and with what? */
    async get(path, { range = false, mode = 'no-cors', method = 'GET' } = {}) {
      let answered = null; const ps = [];
      for (const f of handlers.fetch || []) f({ request: new FakeRequest(path, { mode, method, headers: range ? { Range: 'bytes=0-' } : {} }), respondWith: p => { answered = p; }, waitUntil: p => ps.push(p) });
      const res = answered ? await answered : null;
      await Promise.all(ps);
      return { handled: !!answered, res };
    },
  };
}

/* One open page running the real service-worker block of app/start.js, as the browser holds it when that block runs:
   its controller, the navigation's workerStart (0 = no worker served it) and the registration's active worker (a hard
   reload: no controller while the site's worker is active). A worker is one ServiceWorker object per page, as in a
   browser. Nothing unsaved and nothing busy, so the reload goes straight through (what it waits for: unsavedPage
   below for unsaved work, tools/update-reload-loop.mjs in a browser for the rest). */
const tick = () => new Promise(r => setTimeout(r, 0));
function openPage(pageSrc, { controller = null, workerStart = 0, active = null } = {}) {
  const listeners = {}, objects = new Map();
  let reloads = 0;
  const sw = w => {
    if (!w) return null;
    if (!objects.has(w)) objects.set(w, { asked: [], postMessage(m) { this.asked.push(m); } });
    return objects.get(w);
  };
  const container = {
    controller: sw(controller),
    addEventListener: (t, f) => { (listeners[t] = listeners[t] || []).push(f); },
    register: async () => ({}),
    getRegistration: async () => (active ? { active: sw(active) } : undefined),
  };
  const ctx = vm.createContext({ Promise, Date, Object, Set, setTimeout, clearTimeout, console,
    navigator: { serviceWorker: container }, location: { protocol: 'https:', reload: () => { reloads++; } },
    performance: { getEntriesByType: () => [{ workerStart }] },
    window: { addEventListener() {} }, document: { readyState: 'complete', hidden: false, addEventListener() {} },
    sessionStorage: { setItem() {} }, swResumeSave() {},
    hasUnsavedWrites: () => false, flushBeforeLeaving: async () => true, _flushP: null, _dirtyKeys: new Set(), saveTimer: null, flushSave: async () => {},
    recState: {}, shuffleDrills: {}, deckDrills: {}, earDrills: {}, ecRuns: {}, ncLive: null, chcLive: null, pcState: null });
  vm.runInContext(pageSrc, ctx, { filename: 'app/start.js' });
  const tell = w => { for (const m of w.posted.slice(0, 1)) for (const f of listeners.message || []) f({ type: 'message', data: m }); };
  return {
    sw, get reloads() { return reloads; },
    /* Worker w takes over: a page its registration already controls gets "controllerchange" as w activates, one it
       does not control only through w's claim(); then the message w posted to its windows, which reaches only a page
       it now controls. */
    async takeover(w) {
      if (container.controller || w.events.includes('claim')) {
        container.controller = sw(w);
        for (const f of listeners.controllerchange || []) f({ type: 'controllerchange' });
        tell(w);
      }
      await tick();
    },
    /* The message of a takeover that came before the block ran, held by the browser until the page could hear it. */
    async heldMessage(w) { tell(w); await tick(); },
  };
}

/* One open page with work to save, on a virtual clock: the start.js block and the real save code (SAVE above). The
   student ticks steps (sc.ticks, ms; each a key of `completed`); a write is answered sc.rtt ms after it is sent
   (default 300), held while offline (sc.offline windows: Firestore sends it when the connection is back, and the
   "online" event fires as each window ends), refused while sc.refuse says so ('always', or 'untilTold': until 10 s
   after the first "Not saving"), and a write still out when the page reloads never arrives. sc.txMs: the swap45
   transaction before every write; sc.txFailsOffline: it fails at once while offline (so flushSave gives up);
   sc.stallAfter: a write sent from that time on is never answered (a stalled connection).
   sc.busy windows: an exit check open. sc.tickInLastTry: a tick that many ms after the first write sent once "Not
   saving" was shown (the last try at the time limit). sc.look: times to note the reloads and saves so far. A new worker
   takes over at sc.takeAt, with both signals. */
async function unsavedPage(pageSrc, sc, saveCode = SAVE.code) {
  let now = 0, seq = 0, ctx = null;
  const timers = new Map();
  const setT = (fn, ms) => { const id = ++seq; timers.set(id, { at: now + (ms || 0), fn }); return id; };
  const sleep = ms => new Promise(r => setT(r, ms));
  const settle = async () => { for (let k = 0; k < 30; k++) await new Promise(r => setImmediate(r)); };
  const within = (ws, t) => (ws || []).some(([a, b]) => t >= a && t < b);
  const st = { reloads: [], landed: new Set(), told: [], ticks: [], overBusy: false, seen: {}, lastTry: null };
  const refused = () => sc.refuse === 'always' || (sc.refuse === 'untilTold' && !(st.told.length && now >= st.told[0] + 10000));
  const swL = {}, winL = {};
  const worker = () => ({ postMessage() {} });
  const nav = { serviceWorker: { controller: worker(), addEventListener(t, f) { (swL[t] = swL[t] || []).push(f); }, register: async () => ({}) },
    get onLine() { return !within(sc.offline, now); } };
  const tickNow = () => {
    if (st.reloads.length) return;
    const k = 'k' + now;
    ctx.completed[k] = true; st.ticks.push([k, now]); ctx.__save.queueSave('completed');
  };
  const doc = { async set(payload) {
    if (sc.tickInLastTry != null && st.told.length && st.lastTry == null) { st.lastTry = now; setT(tickNow, sc.tickInLastTry); }
    const sent = Object.keys(payload.completed || {});
    if (sc.stallAfter != null && now >= sc.stallAfter) await new Promise(() => {});
    await sleep(sc.rtt || 300);
    while (within(sc.offline, now)) await sleep(250);
    if (refused()) throw Object.assign(new Error('refused'), { code: 'unavailable' });
    if (st.reloads.length) return;
    sent.forEach(k => st.landed.add(k));
  } };
  const db = { collection: () => ({ doc: () => doc }) };
  ctx = vm.createContext({ Promise, Object, Set, Map, Array, Error, JSON, Math, console,
    setTimeout: setT, clearTimeout: id => { timers.delete(id); }, Date: { now: () => now }, navigator: nav,
    location: { protocol: 'https:', reload() { st.reloads.push(now); if (Object.keys(ctx.ecRuns).length) st.overBusy = true; } },
    performance: { getEntriesByType: () => [{ workerStart: 5 }] },
    window: { addEventListener(t, f) { (winL[t] = winL[t] || []).push(f); } },
    document: { readyState: 'complete', hidden: false, addEventListener() {}, getElementById: () => null },
    sessionStorage: { setItem() {} }, swResumeSave() {},
    recState: {}, shuffleDrills: {}, deckDrills: {}, earDrills: {}, ecRuns: {}, ncLive: null, chcLive: null, pcState: null,
    currentUser: { uid: 'test-0', displayName: 'Test 0', email: 'test0@example.test' },
    progress: {}, responses: {}, completed: {}, classActivities: {}, caStepDone: {}, exitChecks: {}, games: {}, streak: {}, practiceLog: {},
    studentPeriod: '4', lastModuleNum: 1, lastSetId: null, progressLoadFailed: false,
    completedDeletes: new Map(), classActivitiesDeletes: new Map(), caStepDeletes: new Map(),
    LOAD_DEPENDENT_SAVE_KEYS: new Set(), LOAD_FAILED_EMPTY_MAPS: [],
    setSaveMsg(k) { if (k === 'save.notSaving') st.told.push(now); },
    progressLoadRetryNoteChange() {}, isDevBypassUser: () => false, saveLocalPlace() {},
    closePeriodPicker() {}, refreshOpenClassActivitiesScreen() {}, applyActivityGate() {},
    ensureDb: async () => db, db, firebase: { firestore: { FieldValue: { delete: () => null } } },
    swap45Commit: async () => {
      if (sc.txMs) await sleep(sc.txMs);
      if (sc.txFailsOffline && !nav.onLine) { await sleep(50); throw Object.assign(new Error('offline'), { code: 'unavailable' }); }
    } });
  vm.runInContext(`let _dirtyKeys = new Set(); let saveTimer = null; let _flushP = null; let _saveFailCount = 0; const SAVE_MAX_AUTO_RETRIES = ${SAVE.retries};
${saveCode}
globalThis.__save = { queueSave, get fails() { return _saveFailCount; } };`, ctx, { filename: 'save-code.js' });
  vm.runInContext(pageSrc, ctx, { filename: 'app/start.js' });
  for (const [, b] of sc.offline || []) setT(() => { for (const f of winL.online || []) f({ type: 'online' }); }, b);
  for (const t of sc.ticks || []) setT(tickNow, t);
  for (const [a, b] of sc.busy || []) { setT(() => { ctx.ecRuns.x = {}; }, a); setT(() => { delete ctx.ecRuns.x; }, b); }
  for (const t of sc.look || []) setT(() => { st.seen[t] = { reloads: st.reloads.length, landed: st.landed.size, fails: ctx.__save.fails }; }, t);
  setT(() => {
    nav.serviceWorker.controller = worker();
    for (const f of swL.controllerchange || []) f({ type: 'controllerchange' });
    for (const f of swL.message || []) f({ type: 'message', data: { type: 'gc-sw-activated' } });
  }, sc.takeAt);
  const end = sc.until || 900000;
  for (;;) {
    await settle();
    let next = null;
    for (const [id, t] of timers) if (t.at <= end && (!next || t.at < next[1].at)) next = [id, t];
    if (!next) break;
    timers.delete(next[0]);
    now = Math.max(now, next[1].at);
    next[1].fn();
  }
  const lost = st.ticks.filter(([k]) => !st.landed.has(k));
  const at = st.reloads.length ? st.reloads[0] : Infinity;
  return { ...st, lost: lost.map(([k]) => k), untold: lost.filter(([, t]) => !st.told.some(x => x >= t && x <= at)).map(([k]) => k) };
}

/* ── the scenarios ─────────────────────────────────────────────────────── */
async function runScenarios(killSrc, pageSrc = PAGE_SRC, { unsaved = true, saveCode = SAVE && SAVE.code } = {}) {
  const out = [];
  let scenario = '';
  const check = (what, cond) => out.push([scenario, what, !!cond]);
  const live = (src) => (src.match(/CACHE_VERSION\s*=\s*['"]([^'"]+)['"]/) || [])[1];   // tools/checks.mjs liveCheck's own expression

  scenario = 'the real worker first';
  const st = new FakeStorage();
  const real1 = boot(REAL_SRC, st);
  await real1.install();
  await real1.activate();
  await real1.message({ type: 'gc-precache-rest' });
  const REAL_VERSION = real1.read('CACHE_VERSION'), REAL_AUDIO = real1.read('AUDIO_CACHE'), REAL_HASHES = real1.read('AUDIO_HASH_CACHE');
  const tracks = Object.keys(real1.read('AUDIO_HASHES')).filter(p => /backing/.test(p)).slice(0, 3);
  for (const p of tracks) await real1.get(p);
  await real1.get(tracks[0], { range: true });
  const shellCount = (await st.open(REAL_VERSION)).m.size;
  check('the real shell cache is filled (more than 60 files)', shellCount > 60);
  check('three tracks are stored, each with its record', (await st.open(REAL_AUDIO)).m.size === 3 && (await st.open(REAL_HASHES)).m.size === 3);
  /* What a Chromebook can also hold: an older shell cache the real worker never saw, and another site's cache on the same github.io address. */
  await (await st.open('guitar-class-v2-2026-06-13')).put('index.html', new FakeResponse('old shell', { type: 'basic' }));
  await (await st.open('english-intensive-v3')).put('https://class.test/english-intensive/index.html', new FakeResponse('other site', { type: 'basic' }));
  const audioBefore = st.snapshot([REAL_AUDIO, REAL_HASHES]);
  const otherBefore = st.snapshot(['english-intensive-v3']);

  scenario = 'kill switch takes over';
  let kill;
  try { kill = boot(killSrc, st); } catch (e) { check(`the kill switch runs at all (${e.message})`, false); return out; }
  check('it listens to install and activate only (no fetch, message or other handler)', Object.keys(kill.handlers).sort().join(',') === 'activate,install');
  let threw = null;
  try { await kill.install(); } catch (e) { threw = e; }
  check('install does not fail', !threw);
  check('install takes over at once (skipWaiting)', kill.events.includes('skipWaiting'));
  check('install downloads nothing', kill.calls.length === 0);
  check('install changes no cache', st.names().join() === [REAL_AUDIO, REAL_HASHES, REAL_VERSION, 'english-intensive-v3', 'guitar-class-v2-2026-06-13'].sort().join());
  threw = null;
  try { await kill.activate(); } catch (e) { threw = e; }
  check('activate does not fail', !threw);
  check('the real shell cache is deleted', !st.names().includes(REAL_VERSION));
  check('an older shell cache is deleted', !st.names().includes('guitar-class-v2-2026-06-13'));
  check('no guitar-class cache is left but the two audio caches', st.names().filter(n => /^guitar-class-/.test(n)).sort().join() === [REAL_AUDIO, REAL_HASHES].sort().join());
  check('the audio cache and its records are byte-identical', st.snapshot([REAL_AUDIO, REAL_HASHES]) === audioBefore);
  check("another site's cache is left alone", st.snapshot(['english-intensive-v3']) === otherBefore);
  check('the open pages are claimed', kill.events.includes('claim'));
  check('every open window is told a new worker took over (gc-sw-activated)', kill.posted.length === 2 && kill.posted.every(m => m && m.type === 'gc-sw-activated'));
  check('it does not unregister itself', kill.unregistered === 0);
  check('activate downloads nothing', kill.calls.length === 0);
  /* Every kind of request a page makes: none may be answered by the worker. */
  const reqs = [['./', { mode: 'navigate' }], ['index.html', { mode: 'navigate' }], ['?teacher', { mode: 'navigate' }], ['styles.css', {}], ['app/start.js', {}],
    ['tabs/the-cure.html', { mode: 'navigate' }], [tracks[0], {}], [tracks[0], { range: true }], [tracks[1], { range: true }],
    ['https://firestore.googleapis.com/v1/x', { method: 'POST' }], ['https://www.gstatic.com/firebasejs/x.js', {}]];
  let answered = 0;
  for (const [p, o] of reqs) if ((await kill.get(p, o)).handled) answered++;
  check(`no request is answered by the worker (${reqs.length} kinds: pages, shell, tracks, Range, cross-origin)`, !kill.handlers.fetch && answered === 0);
  check('a "gc-precache-rest" message from the page starts nothing', (await kill.message({ type: 'gc-precache-rest' })) === 0 && kill.calls.length === 0);
  try { await kill.activate(); } catch { /* counted just below */ }
  check('a second activate changes nothing', st.snapshot([REAL_AUDIO, REAL_HASHES]) === audioBefore && st.names().filter(n => /^guitar-class-/.test(n)).length === 2);

  scenario = 'a failing Cache Storage';
  {
    const s2 = new FakeStorage();
    await (await s2.open('guitar-class-2026-01-01-0123456789')).put('index.html', new FakeResponse('x', { type: 'basic' }));
    await (await s2.open('guitar-class-2026-01-02-abcdefabcd')).put('index.html', new FakeResponse('y', { type: 'basic' }));
    s2.failDelete = n => n === 'guitar-class-2026-01-01-0123456789';
    const k2 = boot(killSrc, s2);
    let bad = null;
    try { await k2.install(); await k2.activate(); } catch (e) { bad = e; }
    check('a cache that cannot be deleted does not fail the activate', !bad);
    check('...the other shell cache is still deleted', !s2.names().includes('guitar-class-2026-01-02-abcdefabcd'));
    check('...the pages are still claimed and told', k2.events.includes('claim') && k2.posted.length === 2);
    const s3 = new FakeStorage(); s3.failKeys = true;
    const k3 = boot(killSrc, s3);
    bad = null;
    try { await k3.install(); await k3.activate(); } catch (e) { bad = e; }
    check('caches.keys() failing does not fail the activate, and the pages are still claimed', !bad && k3.events.includes('claim') && k3.posted.length === 2);
    const s4 = new FakeStorage();
    const k4 = boot(killSrc, s4);
    bad = null;
    try { await k4.install(); await k4.activate(); } catch (e) { bad = e; }
    check('a Chromebook with no caches at all: nothing fails and no cache is created', !bad && s4.names().length === 0);
  }

  scenario = 'the real worker comes back';
  let realBack = null;
  {
    const real2 = realBack = boot(REAL_SRC, st);
    let bad = null;
    try { await real2.install(); await real2.activate(); } catch (e) { bad = e; }
    check('it installs and activates over the kill switch', !bad && real2.events.includes('skipWaiting') && real2.events.includes('claim'));
    const critical = real2.read('PRECACHE_CRITICAL');
    const shell = await st.open(REAL_VERSION);
    check('its shell cache is refilled (every PRECACHE_CRITICAL file, downloaded with cache:reload)', critical.every(u => shell.m.has(keyOf(u))) && real2.calls.filter(c => c.cache === 'reload').length >= critical.length);
    check('the open windows are told again (one reload each, by the page)', real2.posted.length === 2 && real2.posted.every(m => m.type === 'gc-sw-activated'));
    check('every track and record is still there', st.snapshot([REAL_AUDIO, REAL_HASHES]) === audioBefore);
    const n = real2.calls.length;
    const hit = await real2.get(tracks[1]);
    check('a stored track is served from the cache with no request', hit.handled && (await hit.res.text()) === `net:${tracks[1]}` && real2.calls.length === n);
    const rangeHit = await real2.get(tracks[0], { range: true });
    check('...and for a Range request (what <audio> sends)', rangeHit.handled && rangeHit.res.status === 200 && real2.calls.length === n);
    const page = await real2.get('index.html', { mode: 'navigate' });
    check('the shell is served from the cache again', page.handled && (await page.res.text()) === 'net:index.html');
  }

  /* BREAK-GLASS.md (b): open tabs reload once when the kill switch takes over, and once more when the real worker comes
     back. That is app/start.js's half, run here on the takeovers above (each worker's own claim and message). */
  scenario = 'the open pages';
  {
    let runs = !!pageSrc;
    try { if (runs) openPage(pageSrc); } catch { runs = false; }
    check('the service-worker block of app/start.js is found and runs', runs);
    if (runs) {
      const returning = openPage(pageSrc, { controller: real1, workerStart: 12 });
      /* A first visit (or cleared site data, a guest session): no worker, no registration. */
      const first = openPage(pageSrc);
      /* A hard reload (Ctrl+Shift+R) bypasses the worker: no controller, though the real worker is active. */
      const hard = openPage(pageSrc, { active: real1 });
      /* Claimed by the first worker while it still loaded (start.js, review R2-2): a controller, but no worker served it. */
      const claimedEarly = openPage(pageSrc, { controller: real1, workerStart: 0 });
      await tick();
      await first.takeover(real1);
      await claimedEarly.heldMessage(real1);
      check('a first visit: its own worker taking over does not reload it', first.reloads === 0);
      check('...and that worker is asked for the rest of its files (gc-precache-rest)', first.sw(real1).asked.some(m => m && m.type === 'gc-precache-rest'));
      check('a page claimed while it loaded: that worker\'s held message does not reload it', claimedEarly.reloads === 0);
      for (const p of [returning, first, hard, claimedEarly]) await p.takeover(kill);
      check('the kill switch reloads a returning student\'s tab exactly once (two signals, one reload)', returning.reloads === 1);
      check('...a first-visit tab exactly once: a later worker is a new version (APP-CORE-1)', first.reloads === 1);
      check('...a hard-reloaded tab exactly once: the first worker to take it over is already a new version', hard.reloads === 1);
      check('...a tab claimed while it loaded exactly once', claimedEarly.reloads === 1);
      /* Served by the real worker, and the kill switch took over before the block ran: its "controllerchange" came before
         any listener, so the held message is the only signal (why sw.js posts it). */
      const beaten = openPage(pageSrc, { controller: kill, workerStart: 12 });
      await beaten.heldMessage(kill);
      check('a takeover that came before the page\'s script ran: its held message alone reloads the tab once', beaten.reloads === 1);
      /* Opened while the kill switch was live: no fetch handler, so no worker served it (workerStart 0), yet it controls it. */
      const underKill = openPage(pageSrc, { controller: kill, workerStart: 0 });
      await tick();
      if (realBack) await underKill.takeover(realBack);
      check('the real worker coming back reloads a tab opened under the kill switch exactly once', underKill.reloads === 1);
    }
  }

  /* APP-CORE-3 (2026-11-25): the update reload never goes over work not saved yet, except work the save code gave up
     on while online, and then only after the 5-minute limit and one last try. Run by no browser tool: under the dev
     bypass, which tools/update-reload-loop.mjs uses, queueSave clears its dirty set at once (review R1-1). */
  scenario = 'an open page with unsaved work';
  if (unsaved) {
    check('the save code is found (queueSave, flushSave, withTimeout, hasUnsavedWrites, flushBeforeLeaving, the "online" listener)', !!SAVE);
    if (SAVE && pageSrc) {
      const P = async sc => { try { return await unsavedPage(pageSrc, sc, saveCode); } catch (e) { return { failed: e.message }; } };
      const one = r => !!r.reloads && r.reloads.length === 1;
      const kept = r => one(r) && !r.lost.length;
      let r = await P({ ticks: [0], takeAt: 300 });
      check('a tick still in the 800 ms wait, online: sent at once, saved, then one reload within a second', kept(r) && r.reloads[0] - 300 < 1000);
      r = await P({ ticks: [0], takeAt: 900, txMs: 2000 });
      check('a write already on the wire at the takeover (a 2 s transaction first): saved, then one reload', kept(r));
      r = await P({ ticks: [0], takeAt: 300, offline: [[0, 60000]], busy: [[30300, 90300]] });
      check('offline 60 s with a tick waiting, an exit check open from 30 to 90 s: saved, one reload, not over the check', kept(r) && !r.overBusy);
      r = await P({ ticks: [0], takeAt: 300, offline: [[0, 420000]], look: [390300] });
      check('offline 7 minutes with a tick waiting: no reload and nothing saved at 6.5 minutes; back online, saved, then one reload',
        r.seen && r.seen[390300] && r.seen[390300].reloads === 0 && r.seen[390300].landed === 0 && kept(r) && r.reloads[0] >= 420000);
      r = await P({ ticks: [0], takeAt: 1200, offline: [[0, 60000]] });
      check('offline with the write already on the wire, back at 60 s: saved, then one reload', kept(r));
      r = await P({ ticks: [0], takeAt: 300, offline: [[0, 420000]], txFailsOffline: true, look: [390300] });
      check('offline 7 minutes and every save fails at once (the save code gives up): no reload at 6.5 minutes; back online, saved, then one reload',
        r.seen && r.seen[390300] && r.seen[390300].reloads === 0 && r.seen[390300].fails > SAVE.retries && kept(r));
      /* Review R2-2c: back online BEFORE the 5-minute limit, only the "online" listener of app/shell.js re-sends work the
         save code gave up on; without it the tab waits for the limit's last try (a reload near 5 minutes). */
      r = await P({ ticks: [0], takeAt: 300, offline: [[0, 120000]], txFailsOffline: true, look: [119000] });
      check('offline 2 minutes and every save fails at once: back online, the "online" listener re-sends it at once; saved, then one reload within 10 s',
        r.seen && r.seen[119000] && r.seen[119000].reloads === 0 && r.seen[119000].fails > SAVE.retries && kept(r) && r.reloads[0] < 130000);
      /* Review R2-2a: the tick sent at once is followed by reload(), which looks at the busy states again: an exit check
         opened while that write was out holds the reload too. */
      r = await P({ ticks: [0], takeAt: 300, txMs: 2000, busy: [[1000, 30000]] });
      check('an exit check opened while the waiting tick is being sent: saved, then one reload after the check, not over it', kept(r) && !r.overBusy && r.reloads[0] >= 30000);
      r = await P({ ticks: [0], takeAt: 300, refuse: 'always', look: [120300] });
      check('a write refused for good while online: "Not saving" shown, no reload at 2 minutes, one reload at the 5-minute limit',
        one(r) && r.seen[120300] && r.seen[120300].reloads === 0 && r.told.length && r.told[0] < r.reloads[0] && r.reloads[0] >= 300300 && r.reloads[0] < 310300);
      r = await P({ ticks: [1000], takeAt: 1200, refuse: 'untilTold' });
      check('refused while online until after "Not saving": the last try at the 5-minute limit is waited for, saved, then one reload', kept(r) && r.reloads[0] >= 301200);
      /* Review R1-2: the new tick re-arms the save code (queueSave resets the count), so it is not given up on. */
      r = await P({ ticks: [1000], takeAt: 1200, rtt: 2500, refuse: 'untilTold', tickInLastTry: 300 });
      check('...and a tick made during that last try (its write still out when the last try lands): both saved, then one reload', kept(r) && r.ticks.length === 2);
      /* Review R2-2b: the last try waits SW_RELOAD_SAVE_WAIT (4 s), never longer: a write that never answers does not pin the tab. */
      r = await P({ ticks: [0], takeAt: 300, refuse: 'always', stallAfter: 200000 });
      check('a write refused for good, and the last try stalls (never answered): one reload about 4 s after the 5-minute limit',
        one(r) && r.told.length && r.reloads[0] >= 304300 && r.reloads[0] < 312300);
      r = await P({ takeAt: 100 });
      check('nothing unsaved: one reload at once', one(r) && r.reloads[0] === 100);
    }
  }

  scenario = 'names and tools';
  {
    const keep = kill.read('KEEP_CACHES');
    check('the kept names are the pinned ones (tools/sw-audio-map.mjs)', Array.isArray(keep) && keep.length === 2 && keep.includes(AUDIO_CACHE_NAME) && keep.includes(AUDIO_HASH_CACHE_NAME));
    check('the kept names are the ones the real sw.js executes', keep.includes(REAL_AUDIO) && keep.includes(REAL_HASHES));
    check('the real shell cache name is one the kill switch deletes', kill.read('SITE_CACHE').test(REAL_VERSION) && !keep.includes(REAL_VERSION));
    check('checks.mjs --live reads "guitar-class-kill-switch" from it', live(killSrc) === 'guitar-class-kill-switch' && live(killSrc) !== live(REAL_SRC));
    check('the full checks.mjs finds no version line or audio block to rewrite in it', !/const CACHE_VERSION = '[^']*';/.test(killSrc) && !AUDIO_BLOCK_RE.test(killSrc));
    check('a plain script: compiles on its own, no importScripts, no module syntax', (() => { try { new vm.Script(killSrc); return !/\bimportScripts\s*\(|^\s*(import|export)\s/m.test(killSrc); } catch { return false; } })());
  }
  return out;
}

/* ── deliberate breakages of kill-sw.js: each must turn an assertion red ── */
const MUTATIONS = [
  ['deletes the audio cache', '.filter(n => SITE_CACHE.test(n) && !KEEP_CACHES.includes(n))', '.filter(n => SITE_CACHE.test(n))'],
  ['does not claim the open pages', 'try { await self.clients.claim(); }', 'try { }'],
  ['serves from the cache (a fetch handler)', "self.addEventListener('install', event => {", "self.addEventListener('fetch', event => { event.respondWith(caches.match(event.request).then(r => r || fetch(event.request))); });\nself.addEventListener('install', event => {"],
  ['throws in activate', "self.addEventListener('activate', event => {", "self.addEventListener('activate', event => { throw new Error('boom');"],
  ['does not take over at once', 'event.waitUntil(self.skipWaiting());', 'event.waitUntil(Promise.resolve());'],
  ['keeps the shell caches', '.map(n => caches.delete(n).catch(() => false))', '.map(n => Promise.resolve(n))'],
  ["deletes another site's caches", '.filter(n => SITE_CACHE.test(n) && !KEEP_CACHES.includes(n))', '.filter(n => !KEEP_CACHES.includes(n))'],
  ['does not tell the pages', "for (const c of list) c.postMessage({ type: 'gc-sw-activated', version: CACHE_VERSION });", ''],
  ['a failed delete stops the activate', [
    ['    try {\n      const names = await caches.keys();', '    {\n      const names = await caches.keys();'],
    ['    } catch { /* Cache Storage unavailable: nothing to delete */ }', '    }'],
    ['.map(n => caches.delete(n).catch(() => false))', '.map(n => caches.delete(n))'],
  ]],
  ['unregisters itself', 'try { await self.clients.claim(); }', 'try { await self.clients.claim(); await self.registration.unregister(); }'],
  ['the install downloads the shell', 'event.waitUntil(self.skipWaiting());', "event.waitUntil(caches.open('guitar-class-x').then(c => c.addAll(['./index.html'])).then(() => self.skipWaiting()));"],
  ['the kept audio cache name drifts', "'guitar-class-audio-2026-10-30-ff9e913a6d'", "'guitar-class-audio-v2'"],
  ['the version line is a const (the full checks.mjs would rewrite it)', "let CACHE_VERSION = 'guitar-class-kill-switch';", "const CACHE_VERSION = 'guitar-class-kill-switch';"],
  ['answers the page\'s fill message', "self.addEventListener('install', event => {", "self.addEventListener('message', event => { event.waitUntil(caches.open('guitar-class-x')); });\nself.addEventListener('install', event => {"],
];

/* ── deliberate breakages of the "unsaved work" branch of the start.js block: each must turn an assertion red ── */
const PAGE_BREAKAGES = [
  ['reloads over unsaved work (APP-CORE-3)', 'if (hasUnsavedWrites()) {', 'if (false) {'],
  ['treats all unsaved work as given up', 'const gaveUp = !_flushP && _saveFailCount > SAVE_MAX_AUTO_RETRIES && navigator.onLine !== false;', 'const gaveUp = true;'],
  ['never gives up on a refused write', 'const gaveUp = !_flushP && _saveFailCount > SAVE_MAX_AUTO_RETRIES && navigator.onLine !== false;', 'const gaveUp = false;'],
  ['gives up offline too', 'const gaveUp = !_flushP && _saveFailCount > SAVE_MAX_AUTO_RETRIES && navigator.onLine !== false;', 'const gaveUp = !_flushP && _saveFailCount > SAVE_MAX_AUTO_RETRIES;'],
  ['does not wait for the last try', 'await flushBeforeLeaving(SW_RELOAD_SAVE_WAIT);', 'flushBeforeLeaving(SW_RELOAD_SAVE_WAIT);'],
  ['leaves a tick in the 800 ms wait to its timer', 'if (!_flushP && !_saveFailCount && await flushBeforeLeaving(SW_RELOAD_SAVE_WAIT)) return reload();', ''],
  ['reloads over a tick made during the last try (R1-2)', 'if (_saveFailCount <= SAVE_MAX_AUTO_RETRIES && hasUnsavedWrites()) return reload();', ''],
  ['reloads right after sending the waiting tick, without looking at the busy states again (R2-2a)', 'if (!_flushP && !_saveFailCount && await flushBeforeLeaving(SW_RELOAD_SAVE_WAIT)) return reload();', 'if (!_flushP && !_saveFailCount && await flushBeforeLeaving(SW_RELOAD_SAVE_WAIT)) { location.reload(); return; }'],
  ['no time limit on the last try (R2-2b)', 'await flushBeforeLeaving(SW_RELOAD_SAVE_WAIT);', 'await flushBeforeLeaving(1e9);'],
];
/* ── and of the save code it runs with (SAVE above): each must turn an assertion red ── */
const SAVE_BREAKAGES = [
  ['no "online" listener in app/shell.js (R2-2c)', "window.addEventListener('online', function(){", '(function(){'],
];

const summarise = rows => ({ total: rows.length, failed: rows.filter(r => !r[2]), scenarios: new Set(rows.map(r => r[0])).size });
const base = summarise(await runScenarios(KILL_SRC));
for (const [s, what] of base.failed) console.log(`  ✗ [${s}] ${what}`);
let problems = base.failed.length;
/* Plants each breakage in a copy of src and runs the scenarios on it; returns how many turned an assertion red. */
const breakEach = async (list, src0, run, what) => {
  let n = 0;
  for (const [name, from, to] of list) {
    const pairs = Array.isArray(from) ? from : [[from, to]];
    let src = src0, bad = null;
    for (const [f, t] of pairs) {
      const k = src.split(f).length - 1;
      if (k !== 1) { bad = `its target text occurs ${k} times, expected 1: ${JSON.stringify(f.slice(0, 70))}`; break; }
      src = src.replace(f, () => t);
    }
    if (bad) { console.log(`  ✗ ${what} "${name}": ${bad} — update the proof`); problems++; continue; }
    let red;
    try { red = summarise(await run(src)).failed; } catch (e) { red = [['throw', e.message, false]]; }
    if (red.length) { n++; if (VERBOSE) console.log(`  caught "${name}": ✗ [${red[0][0]}] ${red[0][1]}${red.length > 1 ? ` (+${red.length - 1} more)` : ''}`); }
    else { console.log(`  ✗ ${what} "${name}" was NOT caught: every assertion still passed`); problems++; }
  }
  return n;
};
let caught = 0, pageCaught = 0, saveCaught = 0;
const noMut = args.includes('--no-mutations');
const ran = noMut ? 0 : MUTATIONS.length, pageRan = noMut ? 0 : PAGE_BREAKAGES.length, saveRan = noMut || !SAVE ? 0 : SAVE_BREAKAGES.length;
if (ran) {
  /* A broken kill switch cannot change what the save code does: those runs leave the unsaved-work scenario out. */
  caught = await breakEach(MUTATIONS, KILL_SRC, src => runScenarios(src, PAGE_SRC, { unsaved: false }), 'mutation');
  pageCaught = await breakEach(PAGE_BREAKAGES, PAGE_SRC, src => runScenarios(KILL_SRC, src), 'start.js breakage');
  if (saveRan) saveCaught = await breakEach(SAVE_BREAKAGES, SAVE.code, src => runScenarios(KILL_SRC, PAGE_SRC, { saveCode: src }), 'save-code breakage');
}
console.log(`kill-switch-proof: ${base.total} assertions in ${base.scenarios} scenarios, ${pageCaught} of ${pageRan} start.js breakages caught, ${saveCaught} of ${saveRan} save-code breakages caught, ${caught} of ${ran} mutations caught${problems ? ` — ${problems} problem(s)` : ''}`);
process.exit(problems ? 1 : 0);
