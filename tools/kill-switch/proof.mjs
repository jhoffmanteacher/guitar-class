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
     names and tools           the kept names are the pinned ones
                               (tools/sw-audio-map.mjs) and the ones the real
                               worker executes; `checks.mjs --live` reads
                               `guitar-class-kill-switch` from it; the full
                               checks.mjs finds nothing in it to rewrite; it is a
                               plain script with no importScripts

   Then it breaks kill-sw.js on purpose, one way at a time, and requires each
   breakage to turn at least one assertion red. --verbose prints the first red
   assertion of every breakage.

   usage: node tools/kill-switch/proof.mjs [path/to/kill-sw.js] [--real path/to/sw.js] [--verbose] [--no-mutations]
   Last line:
     kill-switch-proof: <assertions> assertions in <scenarios> scenarios, <caught> of <mutations> mutations caught
   Exit 0 only when every assertion holds and every mutation is caught.
   Run it after any change to sw.js, the service-worker block of app/start.js,
   or this folder. */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { AUDIO_BLOCK_RE, AUDIO_CACHE_NAME, AUDIO_HASH_CACHE_NAME } from '../sw-audio-map.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const args = process.argv.slice(2);
const realAt = args.indexOf('--real');
const realPath = realAt >= 0 ? args[realAt + 1] : join(ROOT, 'sw.js');
const killPath = args.find((a, i) => !a.startsWith('--') && !(realAt >= 0 && i === realAt + 1)) || join(HERE, 'kill-sw.js');
const VERBOSE = args.includes('--verbose');
const lf = s => s.replace(/\r\n/g, '\n');
const KILL_SRC = lf(readFileSync(killPath, 'utf8'));
const REAL_SRC = lf(readFileSync(realPath, 'utf8'));
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

/* ── the scenarios ─────────────────────────────────────────────────────── */
async function runScenarios(killSrc) {
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
  {
    const real2 = boot(REAL_SRC, st);
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

const summarise = rows => ({ total: rows.length, failed: rows.filter(r => !r[2]), scenarios: new Set(rows.map(r => r[0])).size });
const base = summarise(await runScenarios(KILL_SRC));
for (const [s, what] of base.failed) console.log(`  ✗ [${s}] ${what}`);
let problems = base.failed.length, caught = 0, ran = 0;
if (!args.includes('--no-mutations')) {
  for (const [name, from, to] of MUTATIONS) {
    ran++;
    const pairs = Array.isArray(from) ? from : [[from, to]];
    let src = KILL_SRC, bad = null;
    for (const [f, t] of pairs) {
      const n = src.split(f).length - 1;
      if (n !== 1) { bad = `its target text occurs ${n} times, expected 1: ${JSON.stringify(f.slice(0, 70))}`; break; }
      src = src.replace(f, () => t);
    }
    if (bad) { console.log(`  ✗ mutation "${name}": ${bad} — update the proof`); problems++; continue; }
    let red;
    try { red = summarise(await runScenarios(src)).failed; } catch (e) { red = [['throw', e.message, false]]; }
    if (red.length) { caught++; if (VERBOSE) console.log(`  caught "${name}": ✗ [${red[0][0]}] ${red[0][1]}${red.length > 1 ? ` (+${red.length - 1} more)` : ''}`); }
    else { console.log(`  ✗ mutation "${name}" was NOT caught: every assertion still passed on a broken kill switch`); problems++; }
  }
}
console.log(`kill-switch-proof: ${base.total} assertions in ${base.scenarios} scenarios, ${caught} of ${ran} mutations caught${problems ? ` — ${problems} problem(s)` : ''}`);
process.exit(problems ? 1 : 0);
