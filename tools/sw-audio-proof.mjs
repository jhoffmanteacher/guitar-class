/* Proof that sw.js keeps students' downloaded backing tracks (Phase 5 of the
   2026-10-30 order). Runs the REAL sw.js text (install, activate, fetch) in a
   vm with a stand-in for the browser's CacheStorage and fetch(), and counts what
   stays in the cache after each kind of deploy:

     add a track        -> nothing is evicted
     re-export a track  -> that one file is evicted, the others stay
     remove a track     -> that one file is evicted
     the one-time migration (the first activate after this scheme shipped)
                        -> every stored file is adopted, none re-downloaded;
                           and only once
     a file with no record, once the migration is retired -> evicted, not trusted
     fetch              -> a mapped track is stored WITH its record, a miss
                           revalidates (no-cache), a query string does not split
                           one file in two, an unmapped track is never cached,
                           a cached track is never overwritten by a refetch, a
                           404 or a non-basic answer is never stored
     a rollback round trip (the worker this one replaces activates in between and
                           deletes the cache it does not know) -> a track that
                           holds newer bytes is not adopted as the old one
     the cache names    -> the values the worker EXECUTES, not the text, are the
                           pinned ones (sw-audio-map.mjs)

   Then it breaks sw.js on purpose, one way at a time (--mutations, or by
   default), and requires the scenarios to go red every time: a proof that
   passes on a broken worker proves nothing.

   usage: node tools/sw-audio-proof.mjs [path/to/sw.js] [--no-mutations]
   The last line is machine-read by tools/checks.mjs (check 1ce):
     sw-audio-proof: <assertions> assertions in <scenarios> scenarios, <caught> of <mutations> mutations caught
   Exit 0 only when every assertion holds and every mutation is caught. */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { AUDIO_BLOCK_RE, renderAudioBlock, fileHash, AUDIO_CACHE_NAME, AUDIO_HASH_CACHE_NAME } from './sw-audio-map.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const swPath = args.find(a => !a.startsWith('--')) || join(ROOT, 'sw.js');
/* LF only: a Windows checkout writes sw.js with CRLF, and every breakage below is
   written with \n (Phase 5 review R1-1). */
const BASE_SRC = readFileSync(swPath, 'utf8').replace(/\r\n/g, '\n');
const BASE = 'https://class.test/guitar-class/';

/* ── stand-ins for the browser ─────────────────────────────────────────── */
class FakeResponse {
  constructor(body, init = {}) {
    this.body = Buffer.isBuffer(body) ? body : Buffer.from(body == null ? '' : String(body));
    this.status = init.status == null ? 200 : init.status;
    this.type = init.type || 'default';
  }
  clone() { return new FakeResponse(this.body, { status: this.status, type: this.type }); }
  async arrayBuffer() { return this.body.buffer.slice(this.body.byteOffset, this.body.byteOffset + this.body.length); }
  async text() { return this.body.toString('utf8'); }
  static error() { const r = new FakeResponse('', { status: 0, type: 'error' }); return r; }
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
  constructor() { this.m = new Map(); }
  async match(r) { const e = this.m.get(keyOf(r)); return e ? e.clone() : undefined; }
  async put(r, res) { this.m.set(keyOf(r), res.clone()); }
  async delete(r) { return this.m.delete(keyOf(r)); }
  async keys() { return [...this.m.keys()].map(u => new FakeRequest(u)); }
  async add(r) { (this.adds = this.adds || []).push(keyOf(r)); (this.addModes = this.addModes || []).push(typeof r === 'string' ? 'default' : r.cache); if (this.failAdd && this.failAdd(keyOf(r))) throw new Error('add failed'); this.m.set(keyOf(r), new FakeResponse('x', { type: 'basic' })); }
  /* All or nothing, like the real one: one failure stores none of them. */
  async addAll(rs) { const before = new Map(this.m); try { for (const r of rs) await this.add(r); } catch (e) { this.m = before; throw e; } }
  has(r) { return this.m.has(keyOf(r)); }
}
class FakeStorage {
  constructor() { this.c = new Map(); }
  async open(name) { if (!this.c.has(name)) this.c.set(name, new FakeCache()); return this.c.get(name); }
  async keys() { return [...this.c.keys()]; }
  async delete(name) { return this.c.delete(name); }
  names() { return [...this.c.keys()]; }
}

/* ── one service-worker "version" running against a shared storage ────── */
function boot(swSrc, storage, server) {
  const handlers = {}, calls = [];
  const posted = [];
  const self = { location: new URL('sw.js', BASE), addEventListener: (t, f) => { handlers[t] = f; }, skipWaiting: async () => { calls.push({ skipWaiting: true }); }, clients: { claim: async () => {}, matchAll: async () => [{ postMessage: m => posted.push(m) }, { postMessage: m => posted.push(m) }] } };
  const fetchStub = async (req, init = {}) => {
    const url = new URL(typeof req === 'string' ? req : req.url, BASE);
    const range = typeof req !== 'string' && req.headers && req.headers.has('range');
    calls.push({ path: url.pathname.replace(new URL(BASE).pathname, ''), cache: init.cache || 'default', range: !!range, query: url.search });
    const body = server[url.pathname.replace(new URL(BASE).pathname, '')];
    if (body == null) return new FakeResponse('', { status: 404, type: 'basic' });
    if (typeof body === 'object' && !Buffer.isBuffer(body)) return new FakeResponse(body.body == null ? '' : body.body, { status: body.status == null ? 200 : body.status, type: body.type || 'basic' });
    return new FakeResponse(body, { status: range ? 206 : 200, type: 'basic' });
  };
  const ctx = vm.createContext({ self, caches: storage, fetch: fetchStub, Response: FakeResponse, Request: FakeRequest, URL, Promise, console });
  vm.runInContext(swSrc, ctx);
  const read = expr => vm.runInContext(expr, ctx);
  return {
    read, calls, posted,
    async message(data) { const ps = []; handlers.message({ data, waitUntil: p => ps.push(p) }); await Promise.all(ps); return ps.length; },
    async activate() { const ps = []; handlers.activate({ waitUntil: p => ps.push(p) }); await Promise.all(ps); },
    async install() { const ps = []; handlers.install({ waitUntil: p => ps.push(p) }); await Promise.all(ps); },
    async get(path, { range = false, mode = 'no-cors' } = {}) {
      const ps = []; let answered = null;
      handlers.fetch({ request: new FakeRequest(path, { mode, headers: range ? { Range: 'bytes=0-' } : {} }), respondWith: p => { answered = p; }, waitUntil: p => ps.push(p) });
      const res = answered ? await answered : null;
      await Promise.all(ps);
      return { handled: !!answered, res };
    },
  };
}

/* sw.js as it would be built for this audio map: the AUDIO_HASHES block
   rendered from it, the migration fingerprint as given ('' = retired). */
function swFor(map, mig, src = BASE_SRC) {
  return src.replace(AUDIO_BLOCK_RE, () => renderAudioBlock(map)).replace(/const AUDIO_MIGRATION_FP = '[^']*';/, `const AUDIO_MIGRATION_FP = '${mig}';`);
}
const bytes = s => Buffer.from(s);
const mapOf = files => Object.fromEntries(Object.entries(files).map(([p, b]) => [p, fileHash(b)]));
const keyFor = p => new URL(p, BASE).origin + new URL(p, BASE).pathname;

/* A storage where the previous deploy's worker already stored `files` and
   (unless `noRecords`) their records, the way storeAudio writes them. */
async function stored(files, { noRecords = false, swSrc } = {}) {
  const st = new FakeStorage();
  const probe = boot(swSrc || swFor(mapOf(files), ''), st, {});
  const audio = await st.open(probe.read('AUDIO_CACHE')), hashes = await st.open(probe.read('AUDIO_HASH_CACHE'));
  for (const [p, b] of Object.entries(files)) {
    await audio.put(keyFor(p), new FakeResponse(b, { type: 'basic' }));
    if (!noRecords) await hashes.put(keyFor(p), new FakeResponse(fileHash(b)));
  }
  return st;
}
const present = async (st, sw, p) => (await st.open(sw.read('AUDIO_CACHE'))).has(keyFor(p));
const record = async (st, sw, p) => { const r = await (await st.open(sw.read('AUDIO_HASH_CACHE'))).match(keyFor(p)); return r ? r.text() : null; };

/* ── the scenarios ─────────────────────────────────────────────────────── */
async function runScenarios(swSrcOf) {
  const out = [];   // [scenario, assertion, ok]
  let scenario = '';
  const check = (what, cond) => out.push([scenario, what, !!cond]);
  const A = bytes('track A v1'), B = bytes('track B v1'), B2 = bytes('track B v2 re-exported'), C = bytes('track C new');
  const all = { 'audio/a.mp3': A, 'audio/b.mp3': B };

  scenario = 'add a track';
  {
    const st = await stored(all);
    const sw = boot(swSrcOf(mapOf({ ...all, 'audio/c.mp3': C }), ''), st, {});
    await sw.activate();
    check('a.mp3 kept', await present(st, sw, 'audio/a.mp3'));
    check('b.mp3 kept', await present(st, sw, 'audio/b.mp3'));
    check('records kept (a)', (await record(st, sw, 'audio/a.mp3')) === fileHash(A));
  }

  scenario = 're-export a track';
  {
    const st = await stored(all);
    const sw = boot(swSrcOf(mapOf({ 'audio/a.mp3': A, 'audio/b.mp3': B2 }), ''), st, {});
    await sw.activate();
    check('b.mp3 (changed) evicted', !(await present(st, sw, 'audio/b.mp3')));
    check('b.mp3 record removed', (await record(st, sw, 'audio/b.mp3')) === null);
    check('a.mp3 (unchanged) kept', await present(st, sw, 'audio/a.mp3'));
  }

  scenario = 'remove a track';
  {
    const st = await stored(all);
    const sw = boot(swSrcOf(mapOf({ 'audio/a.mp3': A }), ''), st, {});
    await sw.activate();
    check('b.mp3 (gone from audio/) evicted', !(await present(st, sw, 'audio/b.mp3')));
    check('b.mp3 record removed', (await record(st, sw, 'audio/b.mp3')) === null);
    check('a.mp3 kept', await present(st, sw, 'audio/a.mp3'));
  }

  scenario = 'one-time migration';
  {
    const st = await stored(all, { noRecords: true });
    const sw = boot(swSrcOf(mapOf(all), 'ff9e913a6d'), st, {});
    await sw.activate();
    check('a.mp3 adopted, not evicted', await present(st, sw, 'audio/a.mp3'));
    check('b.mp3 adopted, not evicted', await present(st, sw, 'audio/b.mp3'));
    check('adopted files got their records', (await record(st, sw, 'audio/a.mp3')) === fileHash(A) && (await record(st, sw, 'audio/b.mp3')) === fileHash(B));
    check('nothing was fetched', sw.calls.length === 0);
    // The deploy after: b re-exported. The migration must NOT adopt again.
    const sw2 = boot(swSrcOf(mapOf({ 'audio/a.mp3': A, 'audio/b.mp3': B2 }), 'ff9e913a6d'), st, {});
    await sw2.activate();
    check('after the marker, a re-exported b is evicted (adopted only once)', !(await present(st, sw2, 'audio/b.mp3')));
    check('after the marker, a is still kept', await present(st, sw2, 'audio/a.mp3'));
    // A file stored with no record after the migration (a crash between the two writes) is not trusted either.
    await (await st.open(sw2.read('AUDIO_CACHE'))).put(keyFor('audio/c.mp3'), new FakeResponse(C, { type: 'basic' }));
    const sw3 = boot(swSrcOf(mapOf({ 'audio/a.mp3': A, 'audio/b.mp3': B2, 'audio/c.mp3': C }), 'ff9e913a6d'), st, {});
    await sw3.activate();
    check('after the marker, a file stored with no record is evicted (adopted only once)', !(await present(st, sw3, 'audio/c.mp3')));
  }

  scenario = 'retired migration';
  {
    const st = await stored(all, { noRecords: true });
    const sw = boot(swSrcOf(mapOf(all), ''), st, {});
    await sw.activate();
    check('a file with no record is evicted, not trusted (a)', !(await present(st, sw, 'audio/a.mp3')));
    check('a file with no record is evicted, not trusted (b)', !(await present(st, sw, 'audio/b.mp3')));
  }

  scenario = 'activate housekeeping';
  {
    const st = await stored(all);
    for (const n of ['guitar-class-2026-10-01-old', 'guitar-class-audio-2026-09-01-oldname']) await st.open(n);
    const hashes = await st.open('guitar-class-audio-hashes');
    await hashes.put(keyFor('audio/ghost.mp3'), new FakeResponse('deadbeef00'));
    const sw = boot(swSrcOf(mapOf(all), ''), st, {});
    await sw.activate();
    check('an old shell cache is deleted', !st.names().includes('guitar-class-2026-10-01-old'));
    check('an old per-change audio cache is deleted', !st.names().includes('guitar-class-audio-2026-09-01-oldname'));
    check('the stable audio cache is kept', st.names().includes(sw.read('AUDIO_CACHE')));
    check('a record with no file is removed', (await record(st, sw, 'audio/ghost.mp3')) === null);
  }

  scenario = 'fetch a track';
  {
    const map = mapOf({ 'audio/a.mp3': A, 'audio/b.mp3': B });
    const st = new FakeStorage();
    const sw = boot(swSrcOf(map, ''), st, { 'audio/a.mp3': A, 'audio/b.mp3': B, 'audio/unmapped.mp3': bytes('x'), 'index.html': bytes('<html>') });
    await sw.activate();
    const miss = await sw.get('audio/a.mp3');
    check('a miss is answered with the file', miss.handled && (await miss.res.text()) === 'track A v1');
    check('a miss revalidates (cache: no-cache)', sw.calls.length === 1 && sw.calls[0].cache === 'no-cache');
    check('the file is stored', await present(st, sw, 'audio/a.mp3'));
    check('its record is stored with the MAP hash', (await record(st, sw, 'audio/a.mp3')) === map['audio/a.mp3']);
    const n = sw.calls.length;
    const hit = await sw.get('audio/a.mp3');
    check('a hit is answered from the cache', hit.handled && (await hit.res.text()) === 'track A v1');
    // A refetch must never replace a stored track: the record vouches for the bytes stored by the no-cache miss.
    const sw2 = boot(swSrcOf(map, ''), st, { 'audio/a.mp3': bytes('track A STALE copy from the HTTP cache') });
    await sw2.activate();
    await sw2.get('audio/a.mp3');
    const kept = await (await st.open(sw2.read('AUDIO_CACHE'))).match(keyFor('audio/a.mp3'));
    check('a hit is not overwritten by a refetch (the stored bytes stay the ones the record vouches for)', kept && (await kept.text()) === 'track A v1');
    // Range request (what <audio> sends): a miss goes to the network and fills the cache with the whole file.
    const rangeMiss = await sw.get('audio/b.mp3', { range: true });
    check('a range miss is answered (206 from the network)', rangeMiss.handled && rangeMiss.res.status === 206);
    check('the background fill is a full-file no-cache fetch with no Range header', sw.calls.some(c => c.path === 'audio/b.mp3' && !c.range && c.cache === 'no-cache'));
    check('the range fill stored the track with its record', (await present(st, sw, 'audio/b.mp3')) && (await record(st, sw, 'audio/b.mp3')) === map['audio/b.mp3']);
    const rangeHit = await sw.get('audio/b.mp3', { range: true });
    check('a range hit is the cached whole file (200)', rangeHit.handled && rangeHit.res.status === 200);
    // A cache-buster must not make a second entry.
    const before = (await st.open(sw.read('AUDIO_CACHE'))).m.size;
    await sw.get('audio/a.mp3?v=123');
    check('a query string does not add an entry', (await st.open(sw.read('AUDIO_CACHE'))).m.size === before);
    // A track the build has no hash for is left to the browser.
    const un = await sw.get('audio/unmapped.mp3');
    check('an unmapped track is not intercepted', !un.handled);
    const un2 = await sw.get('audio/unmapped.mp3', { range: true });
    check('an unmapped track is not intercepted (range)', !un2.handled);
    check('an unmapped track is cached nowhere', !(await present(st, sw, 'audio/unmapped.mp3')));
    // Not audio: the shell cache, as before.
    const shell = await sw.get('index.html');
    check('a shell file goes to the shell cache, not the audio cache', shell.handled && (await st.open(sw.read('CACHE_VERSION'))).has(keyFor('index.html')) && !(await present(st, sw, 'index.html')));
  }

  scenario = 'rollback round trip';
  {
    // D1: the first activate after this scheme ships adopts what students already hold.
    const st = await stored(all, { noRecords: true });
    const sw1 = boot(swSrcOf(mapOf(all), 'ff9e913a6d'), st, {});
    await sw1.activate();
    // D2: b is re-exported and the migration is retired; the next play stores the NEW bytes with their record.
    const sw2 = boot(swSrcOf(mapOf({ 'audio/a.mp3': A, 'audio/b.mp3': B2 }), ''), st, { 'audio/b.mp3': B2 });
    await sw2.activate();
    await sw2.get('audio/b.mp3');
    check('after the re-export b holds the new bytes, with their record', (await present(st, sw2, 'audio/b.mp3')) && (await record(st, sw2, 'audio/b.mp3')) === fileHash(B2));
    // D3: rolled back to the worker this one replaces. Its activate deletes every cache it does not know, which
    // is the records cache; it keeps the audio cache (its own AUDIO_CACHE_VERSION is that cache's name).
    await st.delete(sw2.read('AUDIO_HASH_CACHE'));
    // D4: rolled forward to the first state (audio/ back to the first tree, the migration armed again).
    const sw4 = boot(swSrcOf(mapOf(all), 'ff9e913a6d'), st, {});
    await sw4.activate();
    check('after a rollback round trip the newer b is NOT adopted as the old b', !(await present(st, sw4, 'audio/b.mp3')));
    check('the marker survived the rollback (it is kept in the audio cache)', (await (await st.open(sw4.read('AUDIO_CACHE'))).match(sw4.read('AUDIO_MARKER'))) !== undefined);
  }

  scenario = 'a failed or foreign answer is never stored';
  {
    const map = mapOf({ 'audio/a.mp3': A, 'audio/b.mp3': B });
    const st = new FakeStorage();
    const server = { 'audio/a.mp3': { status: 404, body: 'not found' }, 'audio/b.mp3': { status: 200, type: 'opaque', body: 'x' } };
    const sw = boot(swSrcOf(map, ''), st, server);
    await sw.activate();
    const r404 = await sw.get('audio/a.mp3');
    check('a 404 for a mapped track is passed on', r404.handled && r404.res.status === 404);
    check('a 404 is not stored (the file)', !(await present(st, sw, 'audio/a.mp3')));
    check('a 404 is not stored (its record)', (await record(st, sw, 'audio/a.mp3')) === null);
    await sw.get('audio/a.mp3', { range: true });
    check('a 404 on the range path is not stored either', !(await present(st, sw, 'audio/a.mp3')));
    await sw.get('audio/b.mp3');
    check('a non-basic answer is not stored', !(await present(st, sw, 'audio/b.mp3')));
    await sw.get('audio/b.mp3', { range: true });
    check('a non-basic answer on the range path is not stored either', !(await present(st, sw, 'audio/b.mp3')));
  }

  scenario = 'cache names';
  {
    const sw = boot(swSrcOf(mapOf(all), ''), new FakeStorage(), {});
    check('AUDIO_CACHE, as the worker executes it, is the live name byte for byte', sw.read('AUDIO_CACHE') === AUDIO_CACHE_NAME);
    check('AUDIO_HASH_CACHE, as the worker executes it, is the pinned name', sw.read('AUDIO_HASH_CACHE') === AUDIO_HASH_CACHE_NAME);
  }

  scenario = 'install';
  {
    const st = new FakeStorage();
    const sw = boot(swSrcOf(mapOf(all), ''), st, {});
    await sw.install();
    const shell = await st.open(sw.read('CACHE_VERSION'));
    /* Shell first (2026-11-09): the install stores the critical list and nothing
       else, then takes over; the page asks for the rest with a message. */
    const critical = sw.read('PRECACHE_CRITICAL'), assets = sw.read('ASSETS');
    const rest = assets.filter(u => !critical.includes(u));
    check('install stores exactly the critical shell files', shell.m.size === new Set(critical.map(keyOf)).size && critical.every(u => shell.has(u)));
    check('every install download bypasses the HTTP cache', shell.addModes.length === critical.length && shell.addModes.every(m => m === 'reload'));
    check('install takes over without waiting for the rest', sw.calls.some(c => c.skipWaiting) && rest.length > 60 && !rest.some(u => shell.has(u)));
    check('install leaves the audio caches alone', !st.names().includes(sw.read('AUDIO_CACHE')) || (await st.open(sw.read('AUDIO_CACHE'))).m.size === 0);
    await sw.activate();
    check('activate tells every open page a new version took over', sw.posted.length === 2 && sw.posted.every(m => m && m.type === 'gc-sw-activated'));
    check('activate does not download the rest itself (it would hold every fetch)', !rest.some(u => shell.has(u)));
    /* The reloaded page has already fetched one of the rest; one other fails. */
    await shell.put(rest[0], new FakeResponse('page', { type: 'basic' }));
    shell.adds = []; shell.addModes = [];
    shell.failAdd = k => k === keyOf(rest[1]);
    check('an unrelated message starts nothing', (await sw.message({ type: 'something-else' })) === 0 && shell.adds.length === 0);
    const held = await sw.message({ type: 'gc-precache-rest' });
    check('the page\'s message is kept alive until the rest is in', held === 1);
    check('the rest is filled, a failed file is skipped and does not stop the others', rest.slice(2).every(u => shell.has(u)) && !shell.has(rest[1]));
    check('a file the page already fetched is not downloaded again', !shell.adds.includes(keyOf(rest[0])) && (await (await shell.match(rest[0])).text()) === 'page');
    check('the shell is not downloaded a second time', !critical.some(u => shell.adds.includes(keyOf(u))));
    check('every fill download bypasses the HTTP cache', shell.addModes.length === rest.length - 1 && shell.addModes.every(m => m === 'reload'));
    shell.adds = []; shell.failAdd = null;
    await sw.message({ type: 'gc-precache-rest' });
    check('the next page load retries only what is missing', shell.adds.length === 1 && shell.adds[0] === keyOf(rest[1]) && shell.has(rest[1]));
    /* Two messages at once (two tabs): one run, nothing fetched twice. */
    const st2 = new FakeStorage(), sw2 = boot(swSrcOf(mapOf(all), ''), st2, {});
    await sw2.install();
    await Promise.all([sw2.message({ type: 'gc-precache-rest' }), sw2.message({ type: 'gc-precache-rest' })]);
    const shell2 = await st2.open(sw2.read('CACHE_VERSION'));
    const restAdds = (shell2.adds || []).filter(k => !critical.map(keyOf).includes(k));
    check('two pages asking at once download each file once', restAdds.length === rest.length && new Set(restAdds).size === rest.length);
    /* A page that is not in the cache yet (a Journey page before the fill reaches it) must not come from the HTTP cache (review R1-2). */
    const nav = sw2.calls.length;
    await (await st2.open(sw2.read('CACHE_VERSION'))).delete('tabs/the-cure.html');
    await sw2.get('tabs/the-cure.html', { mode: 'navigate' });
    const navCalls = sw2.calls.slice(nav).filter(c => c.path === 'tabs/the-cure.html');
    check('a page that is not cached yet is revalidated, not read from the HTTP cache', navCalls.length === 1 && navCalls[0].cache === 'no-cache');
    /* More failures than downloads at once (a school filter blocking a folder): every other file still lands. */
    const st3 = new FakeStorage(), sw3 = boot(swSrcOf(mapOf(all), ''), st3, {});
    await sw3.install();
    const shell3 = await st3.open(sw3.read('CACHE_VERSION'));
    const blocked = rest.slice(0, 9).map(keyOf);
    shell3.failAdd = k => blocked.includes(k);
    await sw3.message({ type: 'gc-precache-rest' });
    check('nine failed files do not stop the other files', rest.slice(9).every(u => shell3.has(u)) && !rest.slice(0, 9).some(u => shell3.has(u)));
    /* One shell file fails: the install must fail whole and must not take over (the browser retries it on the next visit). */
    const st4 = new FakeStorage(), sw4 = boot(swSrcOf(mapOf(all), ''), st4, {});
    const shell4 = await st4.open(sw4.read('CACHE_VERSION'));
    shell4.failAdd = k => k === keyOf(critical[critical.length - 1]);
    let rejected = false;
    try { await sw4.install(); } catch { rejected = true; }
    check('a shell file that fails to download fails the install, and the worker does not take over', rejected && !sw4.calls.some(c => c.skipWaiting) && shell4.m.size === 0);
    /* Every script index.html loads on every page is in the install (review R1-1). */
    const pageScripts = [...readFileSync(join(ROOT, 'index.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '').matchAll(/<script\b[^>]*\bsrc="(?!https?:|\/\/)(?:\.\/)?([^"?#]+)"/g)].map(x => './' + x[1]);
    check('every script index.html loads on every page is in the install', pageScripts.length >= 12 && pageScripts.every(u => critical.includes(u)));
  }
  return out;
}

/* ── deliberate breakages: each must turn at least one assertion red ──── */
const MUTATIONS = [
  /* Shell-first install and the fill that follows it (2026-11-09). */
  ['the install downloads every file again before taking over', "return cache.addAll(PRECACHE_CRITICAL.map(u => new Request(u, { cache: 'reload' })));", "return cache.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' })));"],
  ['the install never takes over', ".then(() => self.skipWaiting())", ""],
  ['the open pages are not told', "for (const c of list) c.postMessage({ type: 'gc-sw-activated', version: CACHE_VERSION });", ""],
  ['the fill answers any message', "if (event.data && event.data.type === 'gc-precache-rest') event.waitUntil(precacheRest());", "event.waitUntil(precacheRest());"],
  ['the install reads through the HTTP cache', "return cache.addAll(PRECACHE_CRITICAL.map(u => new Request(u, { cache: 'reload' })));", "return cache.addAll(PRECACHE_CRITICAL.map(u => new Request(u)));"],
  ['the shell is best-effort (a failed shell file still takes over)', "return cache.addAll(PRECACHE_CRITICAL.map(u => new Request(u, { cache: 'reload' })));", "return Promise.allSettled(PRECACHE_CRITICAL.map(u => cache.add(new Request(u, { cache: 'reload' }))));"],
  ['the fill reads through the HTTP cache', "          await cache.add(new Request(u, { cache: 'reload' }));", "          await cache.add(new Request(u));"],
  ['a failed file ends its download slot', "        } catch { /* offline, a 404, a full disk: first use fetches it, the next page load retries */ }", "        } catch { return; }"],
  ['an every-page script is left out of the install', "  './trainer-site-adapter.js'\n];", "];"],
  ['a page that is not cached yet is read through the HTTP cache', "const fresh = !cached;", "const fresh = !cached && req.mode !== 'navigate';"],
  ['the fill is not kept alive', "if (event.data && event.data.type === 'gc-precache-rest') event.waitUntil(precacheRest());", "if (event.data && event.data.type === 'gc-precache-rest') precacheRest();"],
  ['the fill downloads files the page already has', "          if (await cache.match(u)) continue;\n", ""],
  ['one failed file stops the fill', "        } catch { /* offline, a 404, a full disk: first use fetches it, the next page load retries */ }", "        } finally { }"],
  ['two fills run at once', "  if (precacheRestRun) return precacheRestRun;\n", ""],
  ['a stale record never evicts', "if (rec) keep = (await rec.text()) === info.hash;", "if (rec) keep = true;"],
  ['the migration does not adopt', "else if (migrating) { await hashes.put(req.url, new Response(info.hash)); keep = true; }", "else if (false) { keep = true; }"],
  ['nothing is ever evicted', "if (!keep) { await audio.delete(req); await hashes.delete(req.url); }", "if (!keep) { }"],
  ['everything is evicted', "let keep = false;\n    if (info) {", "let keep = false;\n    if (false) {"],
  ['the migration marker is not written', "if (migrating) await audio.put(AUDIO_MARKER, new Response('1'));", ""],
  ['orphan records are not cleaned', "if (!(await audio.match(req.url))) await hashes.delete(req);", ""],
  ['the marker is evicted as if it were a track', "    if (req.url === AUDIO_MARKER) continue;   // the marker is not a track\n", ""],
  /* The design this review replaced: the marker kept next to the records, where the worker being replaced deletes it. */
  ['the marker is kept next to the records again (the old design)', [
    ["const migrating = !!AUDIO_MIGRATION_FP && !(await audio.match(AUDIO_MARKER));", "const migrating = !!AUDIO_MIGRATION_FP && !(await hashes.match(AUDIO_MARKER));"],
    ["if (migrating) await audio.put(AUDIO_MARKER, new Response('1'));", "if (migrating) await hashes.put(AUDIO_MARKER, new Response('1'));"],
    ["    if (!(await audio.match(req.url))) await hashes.delete(req);", "    if (req.url !== AUDIO_MARKER && !(await audio.match(req.url))) await hashes.delete(req);"],
    ["    if (req.url === AUDIO_MARKER) continue;   // the marker is not a track\n", ""],
  ]],
  ['a non-200 answer is stored (range path)', "if (res && res.status === 200 && res.type === 'basic') await storeAudio(audioFile, res);", "if (res && res.type === 'basic') await storeAudio(audioFile, res);"],
  ['a non-200 answer is stored (main path)', "if (res && res.status === 200 && res.type === 'basic') {", "if (res && res.type === 'basic') {"],
  ['a non-basic answer is stored (range path)', "if (res && res.status === 200 && res.type === 'basic') await storeAudio(audioFile, res);", "if (res && res.status === 200) await storeAudio(audioFile, res);"],
  ['a non-basic answer is stored (main path)', "if (res && res.status === 200 && res.type === 'basic') {", "if (res && res.status === 200) {"],
  ['AUDIO_CACHE is renamed', "const AUDIO_CACHE = 'guitar-class-audio-2026-10-30-ff9e913a6d';", "const AUDIO_CACHE = 'guitar-class-audio-v2';"],
  ['AUDIO_HASH_CACHE is renamed', "const AUDIO_HASH_CACHE = 'guitar-class-audio-hashes';", "const AUDIO_HASH_CACHE = 'guitar-class-audio-records';"],
  ['the cache key keeps the query', "key: url.origin + url.pathname", "key: url.href"],
  ['a stored track has no record', "await hashes.put(info.key, new Response(info.hash));\n}", "}"],
  ['an unmapped track is cached', "if (isAudio && !audioFile) return;", ""],
  ['activate deletes the stable audio cache', "k !== CACHE_VERSION && k !== AUDIO_CACHE && k !== AUDIO_HASH_CACHE", "k !== CACHE_VERSION"],
  ['a hit is refetched and stored over (the old behaviour)', "if (cached && audioFile) return cached;", ""],
  ['a miss does not revalidate', "const res = await fetch(audioFile.key, { cache: 'no-cache' });", "const res = await fetch(audioFile.key);"],
  ['reconcile is not run at activate', ".then(() => reconcileAudio().catch(() => {}))", ""],
];

function summarise(rows) {
  const failed = rows.filter(r => !r[2]);
  return { total: rows.length, failed, scenarios: new Set(rows.map(r => r[0])).size };
}

const base = summarise(await runScenarios(swFor));
for (const [s, what] of base.failed.map(r => [r[0], r[1]])) console.log(`  ✗ [${s}] ${what}`);
let problems = base.failed.length;

let caught = 0, ranMutations = 0;
if (!args.includes('--no-mutations')) {
  for (const [name, from, to] of MUTATIONS) {
    ranMutations++;
    const pairs = Array.isArray(from) ? from : [[from, to]];
    let mutated = BASE_SRC, bad = null;
    for (const [f, t] of pairs) {
      const n = mutated.split(f).length - 1;
      if (n !== 1) { bad = `its target text occurs ${n} times in sw.js, expected 1: ${JSON.stringify(f.slice(0, 70))}`; break; }
      mutated = mutated.replace(f, () => t);
    }
    if (bad) { console.log(`  ✗ mutation "${name}": ${bad} — update the proof`); problems++; continue; }
    let red;
    try { red = summarise(await runScenarios((map, mig) => swFor(map, mig, mutated))).failed; }
    catch (e) { red = [['throw', e.message, false]]; }
    if (red.length) caught++;
    else { console.log(`  ✗ mutation "${name}" was NOT caught: every assertion still passed on a broken worker`); problems++; }
  }
}

console.log(`sw-audio-proof: ${base.total} assertions in ${base.scenarios} scenarios, ${caught} of ${ranMutations} mutations caught${problems ? ` — ${problems} problem(s)` : ''}`);
process.exit(problems ? 1 : 0);
