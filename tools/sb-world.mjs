/* sb-world.mjs — the Song builder's console in a Node vm, on a VIRTUAL clock, for the closed loops
   tools/built-song-loop.mjs and tools/sb-draft-loop.mjs (2026-11-25).

   The console and its stub Firestore are those of tools/song-builder-sim.mjs (makeDb, makeConsole, the made-up
   files), copied here and changed in four ways, because those two loops need time they can move and that sim keeps
   its own copy (its pinned case count stays as it is):
     1. A virtual clock (VClock): the console's setTimeout / clearTimeout and Date run on it, so the 1.2 s save
        timers, the 600 ms retry, the 30 ms envelope timer and the 15 s re-read happen when a loop moves time,
        never on their own. Work that is really asynchronous (crypto.subtle's SHA-256, run on another thread) is
        counted while it runs (world.inflight) and waited out before the clock moves (quiesce), so a hash never
        "takes" virtual seconds.
     2. The stub Firestore answers after a virtual delay a loop chooses (opts.delay), and tells a loop about every
        write before it lands (opts.onWrite: op, path, the doc after, the doc before), so an invariant can watch the
        store as it changes. Its rules check is song-builder-sim's, written out again (never read from the code).
     3. The encoder: sbEncode is REAL (teacher-sb-core.js) and starts a made-up Worker (FakeWorker) that answers on
        the virtual clock (progress, then the bytes) unless it is terminated. sbLevel (the loudness measuring,
        teacher-sb-dsp.js) is stubbed: it awaits that real encode, then hands back made-up levelled bytes chosen by
        the record's length (LEVELLED_BY_SEC), so the same mp3 always levels to the same bytes, and the same audio id.
        sbDecode is stubbed as in the sim: a made-up 440 Hz tone of the file's length (at 32 kHz here, the lowest rate
        the builder takes, so a record is quick to measure).
     4. sbOnsetEnv (pure) is remembered per record (the same made-up tone gives the same envelope); each call still
        gets a fresh object, so nothing one console adds to it (E.track) reaches another.
   Everything else is the site's own code, unmodified: every teacher-*.js part (siteParts('teacher.js')),
   app/songfiles.js and app/builtsongs.js, i18n.js and guitar-diagrams.js, with app/boot.js's escHtml / escAttr.
   The page is inert, as in the sim (painting runs into one element whose innerHTML is counted); document-level
   listeners (the Beat step's pointerdown drag and meter clicks) are KEPT, so a loop can dispatch to them.
   Made-up data only ("Test 0"); no network. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash, webcrypto } from 'node:crypto';
import vm from 'node:vm';
import { siteParts } from './site-src.mjs';

export const sha = b => createHash('sha256').update(b).digest('hex');
export const tick = () => new Promise(r => setImmediate(r));
export const turns = async n => { for(let i = 0; i < n; i++) await tick(); };

/* ── seeded random (save-loop.mjs's) ── */
export function rng(seed){
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const mix = (a, b) => (Math.imul(a ^ 0x9E3779B9, 0x85EBCA6B) ^ Math.imul(b + 0x7F4A7C15, 0xC2B2AE35)) >>> 0;

/* ── the virtual clock ── */
export const T0_WALL = Date.UTC(2026, 10, 25, 17, 0, 0);
export class VClock {
  constructor(){ this.now = 0; this.seq = 0; this.q = []; this.errors = []; this.fired = []; this.log = null; }
  wall(){ return T0_WALL + this.now; }
  setTimeout(fn, ms, ...args){
    const id = ++this.seq, delay = Math.max(0, Number(ms) || 0);
    const t = { id, at: this.now + delay, delay, fn, args };
    let i = this.q.length; while(i > 0 && (this.q[i - 1].at > t.at)) i--;
    this.q.splice(i, 0, t);
    return id;
  }
  clearTimeout(id){ const i = this.q.findIndex(t => t.id === id); if(i >= 0) this.q.splice(i, 1); }
  sleep(ms){ return new Promise(r => this.setTimeout(r, ms)); }
  pending(){ return this.q.length; }
  /* Fire the timers due up to now+ms, in order, waiting for every piece of real work between two (quiesce). An error
     thrown by a timer is kept (clock.errors), not thrown. */
  async advance(ms, quiesce){
    const target = this.now + Math.max(0, ms);
    for(;;){
      await quiesce();
      const t = this.q[0];
      if(!t || t.at > target) break;
      this.q.shift();
      this.now = Math.max(this.now, t.at);
      this.fired.push(t.delay);
      try { t.fn(...t.args); } catch(e){ this.errors.push(e); }
    }
    await quiesce();
    this.now = target;
  }
}
export function vDateOf(clock){
  return class VDate extends Date {
    constructor(...a){ if(a.length) super(...a); else super(clock.wall()); }
    static now(){ return clock.wall(); }
  };
}

/* ── made-up files ── */
/* Made-up bytes behind a real MPEG-1 layer III frame header (192 kb/s, stereo, 32 kHz: the lowest rate the builder
   takes, so the made-up records are small to measure): sbMp3Info reads it. */
export const FS = 32000;
export function mp3Of(n, seed){
  const b = new Uint8Array(n); let x = seed >>> 0 || 1;
  for(let i = 0; i < n; i++){ x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; b[i] = x & 255; }
  b.set([0xff, 0xfb, 0xb8, 0x04], 0);
  return b;
}
export const DUR = new Map();          // sha256 of a made-up file -> its length in seconds (the stub decoder's answer)
const TONES = new Map();
export function tone(sec, fs = FS){
  const key = sec + '@' + fs;
  if(TONES.has(key)) return TONES.get(key);
  const n = Math.round(sec * fs), x = new Float32Array(n);
  for(let i = 0; i < n; i++) x[i] = 0.3 * Math.sin(2 * Math.PI * 440 * i / fs) * (1 - 0.5 * ((i / fs * 1.6) % 1));
  TONES.set(key, x); return x;
}
export const fileOf = (name, bytes, sec) => { if(sec != null) DUR.set(sha(bytes), sec); return { name, size: bytes.length, type: name.endsWith('.mp3') ? 'audio/mpeg' : 'text/plain', arrayBuffer: async () => bytes.slice().buffer }; };
/* The three originals and what each levels to (by the record's length: the stub sbLevel's choice). */
export const SRC = { A: mp3Of(400000, 3), B: mp3Of(420000, 5), C: mp3Of(300000, 9) };
export const SRC_SEC = { A: 12, B: 12.02, C: 10.5 };   // A and B within 0.05 s: a new file that keeps the beat
export const LEVELLED = { A: mp3Of(1900000, 11), B: mp3Of(1950000, 13), C: mp3Of(800000, 17) };
export const LEVELLED_BY_SEC = new Map();
for(const k of ['A', 'B', 'C']){ DUR.set(sha(SRC[k]), SRC_SEC[k]); DUR.set(sha(LEVELLED[k]), SRC_SEC[k]); LEVELLED_BY_SEC.set(tone(SRC_SEC[k]).length, LEVELLED[k]); }

/* ── the stub Firestore (song-builder-sim.mjs's, on the virtual clock) ── */
export class FakeBytes { constructor(u8){ this.u8 = Uint8Array.from(u8); } static fromUint8Array(u8){ return new FakeBytes(u8); } toUint8Array(){ return Uint8Array.from(this.u8); } }
export const TS = { __serverTime: true };
const isInc = v => v && typeof v === 'object' && typeof v.__inc === 'number';
export function clone(v){
  if(v instanceof FakeBytes) return new FakeBytes(v.u8);
  if(v === TS) return TS;
  if(Array.isArray(v)) return v.map(clone);
  if(v && typeof v === 'object'){ const o = {}; for(const k of Object.keys(v)) o[k] = clone(v[k]); return o; }
  return v;
}
/* firestore.rules "BUILT SONGS" and "SONG FILES", written out again (song-builder-sim.mjs rulesCheck). '' = allowed. */
export function rulesCheck(op, path, data){
  const p = path.split('/');
  if(op === 'delete') return (p[0] === 'songDrafts' && p.length === 2) || (p[0] === 'songFiles' && (p.length === 2 || (p.length === 4 && p[2] === 'pieces')))
    || (p[0] === 'builtSongs' && p.length === 2) || path === 'builtSongsMeta/list' ? '' : 'delete outside the builder\'s paths: ' + path;
  const keys = Object.keys(data || {}).sort().join(',');
  if(p[0] === 'songDrafts' && p.length === 2) return /^sb-[a-z0-9]{8,24}$/.test(p[1]) ? '' : 'draft id ' + p[1];
  if(p[0] === 'songFiles' && p.length === 2){
    const d = data;
    if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(p[1])) return 'head id ' + p[1];
    if(keys !== 'bytes,durationSec,file,pieceBytes,pieces,sha256,state,uploadedAt') return 'head fields ' + keys;
    if(typeof d.file !== 'string' || d.file.length < 1 || d.file.length > 200) return 'head file';
    if(!Number.isInteger(d.bytes) || d.bytes <= 0 || d.bytes > 36000000) return 'head bytes';
    if(!/^[0-9a-f]{64}$/.test(d.sha256)) return 'head sha256';
    if(d.pieceBytes !== 900000 || d.pieces !== Math.ceil(d.bytes / 900000)) return 'head pieces';
    if(typeof d.durationSec !== 'number' || !(d.durationSec > 0) || d.durationSec > 1800) return 'head durationSec';
    if(d.state !== 'uploading' && d.state !== 'ready') return 'head state';
    if(d.uploadedAt !== TS) return 'head uploadedAt is not the server time';
    return '';
  }
  if(p[0] === 'songFiles' && p.length === 4 && p[2] === 'pieces'){
    if(keys !== 'data,i' || String(data.i) !== p[3] || !(data.data instanceof FakeBytes) || data.data.u8.length < 1 || data.data.u8.length > 900000) return 'piece ' + p[3];
    return '';
  }
  if(p[0] === 'songFilesUsage' && p.length === 2) return keys === 'bytes' && Number.isInteger(data.bytes) && data.bytes >= 0 ? '' : 'usage ' + JSON.stringify(data);
  if(p[0] === 'builtSongs' && p.length === 2){
    const d = data, a = d.audio, isMap = v => !!v && typeof v === 'object' && !Array.isArray(v), num = v => typeof v === 'number' && Number.isFinite(v);
    if(!/^sb-[a-z0-9]{8,24}$/.test(p[1])) return 'builtSongs id ' + p[1];
    if(keys !== 'artist,audio,savedAt,song,title,v') return 'builtSongs fields ' + keys;
    if(!Number.isInteger(d.v) || d.v < 1 || d.v > 99) return 'builtSongs v';
    if(typeof d.title !== 'string' || d.title.trim().length < 1 || d.title.length > 120) return 'builtSongs title';
    if(typeof d.artist !== 'string' || d.artist.length > 120) return 'builtSongs artist';
    if(!isMap(a)) return 'builtSongs audio';
    const ak = Object.keys(a);
    if(ak.some(k => !['id', 'bytes', 'sha256', 'durationSec', 'centsOff', 'gainDb', 'sourceSha256'].includes(k)) || !['id', 'bytes', 'sha256', 'durationSec', 'centsOff'].every(k => ak.includes(k))) return 'builtSongs audio fields ' + ak.sort().join(',');
    if(typeof a.id !== 'string' || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(a.id)) return 'builtSongs audio.id';
    if(!Number.isInteger(a.bytes) || a.bytes <= 0 || a.bytes > 36000000) return 'builtSongs audio.bytes';
    if(typeof a.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(a.sha256)) return 'builtSongs audio.sha256';
    if(!num(a.durationSec) || a.durationSec <= 0 || a.durationSec > 1800) return 'builtSongs audio.durationSec';
    if(!num(a.centsOff) || a.centsOff < -10 || a.centsOff > 10) return 'builtSongs audio.centsOff';
    if('gainDb' in a && (!num(a.gainDb) || a.gainDb < -40 || a.gainDb > 40)) return 'builtSongs audio.gainDb';
    if('sourceSha256' in a && (typeof a.sourceSha256 !== 'string' || !/^[0-9a-f]{64}$/.test(a.sourceSha256))) return 'builtSongs audio.sourceSha256';
    if(!isMap(d.song)) return 'builtSongs song';
    if(d.savedAt !== TS) return 'builtSongs savedAt is not the server time';
    return '';
  }
  if(path === 'builtSongsMeta/list'){
    if(Object.keys(data || {}).some(k => k !== 'songs' && k !== 'updatedAt')) return 'list fields ' + keys;
    if(!data.songs || typeof data.songs !== 'object' || Array.isArray(data.songs) || Object.keys(data.songs).length > 200) return 'list songs';
    if(data.updatedAt !== TS) return 'list updatedAt is not the server time';
    return '';
  }
  return 'write outside the builder\'s paths: ' + path;
}
/* opts: { clock, delay: () => virtual ms for one answer (default 0: the next turn), onWrite(op, path, next, prev) }.
   With a clock every answer waits on it; without one, one turn of the event loop (as the sim). */
export function makeDb(opts = {}){
  const S = new Map();
  const st = { writes: [], violations: [], reads: [], failWrite: null };
  const clock = opts.clock || null, delay = opts.delay || (() => 0);
  const wait = () => clock ? clock.sleep(delay()) : tick();
  const apply = (op, path, data, o) => {
    let next;
    if(op === 'delete') next = undefined;
    else if(o && o.merge){
      next = clone(S.get(path) || {});
      for(const k of Object.keys(data)) next[k] = isInc(data[k]) ? (Number(next[k]) || 0) + data[k].__inc : clone(data[k]);
    } else next = clone(data);
    const why = rulesCheck(op, path, next);
    if(why) st.violations.push(why + ' (' + path + ')');
    if(opts.onWrite) opts.onWrite(op, path, next, S.get(path));
    st.writes.push({ op, path, data: next });
    if(op === 'delete') S.delete(path); else S.set(path, next);
  };
  const snapOf = path => { const d = S.get(path); return { id: path.split('/').pop(), exists: d !== undefined, data: () => d === undefined ? undefined : clone(d), ref: docRef(path) }; };
  function docRef(path){
    return { path, id: path.split('/').pop(), collection: n => collRef(path + '/' + n),
      async get(){ st.reads.push(path); await wait(); return snapOf(path); },
      async set(d, o){ await wait(); if(st.failWrite && st.failWrite(path)){ const e = new Error('unavailable'); e.code = 'unavailable'; throw e; } apply('set', path, d, o); },
      async delete(){ await wait(); apply('delete', path); } };
  }
  function collRef(path){
    const q = { doc: id => docRef(path + '/' + id), orderBy: () => q, limit: () => q, where: () => q,
      async get(){ st.reads.push(path); await wait(); const docs = [...S.keys()].filter(k => k.startsWith(path + '/') && k.slice(path.length + 1).indexOf('/') < 0).sort().map(snapOf);
        return { docs, empty: !docs.length, size: docs.length, forEach: f => docs.forEach(f) }; } };
    return q;
  }
  const db = { collection: n => collRef(n),
    batch(){ const ops = []; return { set: (r, d, o) => ops.push(['set', r.path, d, o]), update: (r, d) => ops.push(['set', r.path, d, { merge: true }]), delete: r => ops.push(['delete', r.path]),
      async commit(){ await wait(); for(const o of ops) if(o[0] !== 'delete' || S.has(o[1])) apply(o[0], o[1], o[2], o[3]); } }; },
    runTransaction: async fn => {
      const ops = [];
      const out = await fn({ get: r => r.get(), set: (r, d, o) => { ops.push([r.path, d, o]); }, update: (r, d) => { ops.push([r.path, d, { merge: true }]); } });
      await wait();
      const bad = ops.find(([p]) => st.failWrite && st.failWrite(p));
      if(bad){ const e = new Error('unavailable'); e.code = 'unavailable'; throw e; }
      ops.forEach(([p, d, o]) => apply('set', p, d, o));
      return out;
    } };
  return { S, st, db };
}
/* A stored levelled copy: its head (ready) and its pieces, as the Song files writer leaves them. */
export function putCopy(F, audioId, bytes, durationSec){
  F.S.set('songFiles/' + audioId, { file: audioId + '.mp3', bytes: bytes.length, sha256: sha(bytes), pieces: Math.ceil(bytes.length / 900000), pieceBytes: 900000, durationSec, state: 'ready', uploadedAt: TS });
  for(let i = 0; i * 900000 < bytes.length; i++) F.S.set(`songFiles/${audioId}/pieces/${i}`, { i, data: new FakeBytes(bytes.subarray(i * 900000, (i + 1) * 900000)) });
}

/* ── the console ── */
/* opts: { db (makeDb), clock (VClock; without one the vm gets Node's own timers and Date), seed (getRandomValues),
   encodeMs: () => virtual ms one encode takes (default 3000), level: a replacement for the stub sbLevel }.
   Returns { box, run, grid, world: { inflight, workers, listeners }, quiesce }. */
const ENV_MEMO = new WeakMap();
const sourceCache = new Map();
export function makeConsole(root, opts = {}){
  const read = f => { const k = root + '\n' + f; if(!sourceCache.has(k)) sourceCache.set(k, readFileSync(join(root, f), 'utf8')); return sourceCache.get(k); };
  const clock = opts.clock || null;
  const world = { inflight: 0, workers: [], listeners: {}, encodeMs: opts.encodeMs || (() => 3000) };
  const inert = () => ({ addEventListener() {}, removeEventListener() {}, querySelector: () => null, querySelectorAll: () => [], classList: { toggle() {}, add() {}, remove() {} }, style: {}, dataset: {} });
  const grid = Object.assign(inert(), { id: 't-grid-container', _html: '', paints: 0, querySelector: () => inert() });
  Object.defineProperty(grid, 'innerHTML', { get(){ return this._html; }, set(v){ this._html = String(v); this.paints++; } });
  const r = rng(opts.seed || 1);
  const cryptoBox = {
    subtle: { digest: async (alg, data) => { world.inflight++; try { return await webcrypto.subtle.digest(alg, data); } finally { world.inflight--; } } },
    getRandomValues: a => { for(let i = 0; i < a.length; i++) a[i] = Math.floor(r() * 256); return a; },
  };
  class FakeWorker {
    constructor(url){ this.url = url; this.terminated = false; this.done = false; this.timers = []; this.onmessage = null; this.onerror = null; world.workers.push(this); }
    postMessage(){
      if(!clock){ queueMicrotask(() => { if(!this.terminated && this.onmessage){ this.done = true; this.onmessage({ data: { done: new Uint8Array(16) } }); } }); return; }
      const total = Math.max(1, world.encodeMs());
      [0.3, 0.7].forEach(p => this.timers.push(clock.setTimeout(() => { if(!this.terminated && this.onmessage) this.onmessage({ data: { p } }); }, total * p)));
      this.timers.push(clock.setTimeout(() => { if(!this.terminated && this.onmessage){ this.done = true; this.onmessage({ data: { done: new Uint8Array(16) } }); } }, total));
    }
    terminate(){ this.terminated = true; if(clock) this.timers.forEach(id => clock.clearTimeout(id)); }
  }
  class BoxURL extends URL { static createObjectURL(){ return 'blob:sim'; } static revokeObjectURL(){} }
  const box = {
    console: { log() {}, warn() {}, error() {} },
    setTimeout: clock ? (fn, ms, ...a) => clock.setTimeout(fn, ms, ...a) : setTimeout,
    clearTimeout: clock ? id => clock.clearTimeout(id) : clearTimeout,
    setInterval: () => 0, clearInterval() {},
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, sessionStorage: { getItem: () => null, setItem() {} },
    navigator: {}, location: { hash: '', search: '', href: 'http://sim/index.html' }, addEventListener() {}, removeEventListener() {}, crypto: cryptoBox, Blob,
    Audio: class { addEventListener() {} pause() {} load() {} removeAttribute() {} play(){ return Promise.resolve(); } },
    URL: BoxURL, Worker: FakeWorker,
    document: { getElementById: id => id === 't-grid-container' ? grid : null, querySelector: () => null, querySelectorAll: () => [],
      addEventListener: (type, fn) => { (world.listeners[type] = world.listeners[type] || []).push(fn); }, removeEventListener() {},
      createElement: () => inert(), body: inert(), documentElement: inert(), hidden: false },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    prompt: () => null, confirm: () => true, alert() {}, scrollY: 0, scrollTo() {},
    requestAnimationFrame: () => 0, cancelAnimationFrame() {},
    firebase: { firestore: { Blob: FakeBytes, FieldValue: { serverTimestamp: () => TS, increment: n => ({ __inc: n }), delete: () => ({ __del: true }) } } },
  };
  if(clock) box.Date = vDateOf(clock);
  box.window = box;
  vm.createContext(box);
  if(clock) vm.runInContext('Date = window.Date;', box);   // the context's own Date is replaced by the virtual one
  const BOOT = read('app/boot.js');
  const esc = ['escAttr', 'escHtml'].map(n => (BOOT.match(new RegExp(`^const ${n} = .*$`, 'm')) || [''])[0]).join('\n');
  vm.runInContext(esc + '\nlet db = null; let firebaseReady = true; async function ensureDb(){ return db; }\n'
    + 'const MODULE_MANIFEST = []; const CLASS_OPEN_THROUGH = 1;\nfunction __setDb(x){ db = x; }', box, { filename: 'prelude' });
  for(const f of ['i18n.js', 'guitar-diagrams.js', 'app/songfiles.js', 'app/builtsongs.js']) vm.runInContext(read(f), box, { filename: f });
  for(const f of siteParts('teacher.js', root)) vm.runInContext(read(f), box, { filename: f });
  const run = code => vm.runInContext(code, box);
  if(opts.db) run('__setDb')(opts.db);
  /* The browser's decoder and the loudness measuring, stubbed (see the header). */
  box.__decode = (bytes, fs) => { const sec = DUR.get(sha(bytes)); if(sec == null) throw { why: 'sim: no length for these bytes' }; return [tone(sec, fs)]; };
  box.__level = opts.level || (async (chans, fs, io) => {
    if(io.progress) io.progress('Encoding at 192k (try 1)…', 0);
    await io.encode(chans, fs);
    if(io.stopped()) throw 'stop';
    const bytes = LEVELLED_BY_SEC.get(chans[0].length);
    if(!bytes) throw { why: 'sim: no levelled copy for a record of this length' };
    await io.decode(bytes, fs);
    return { bytes, gainDb: 3.21, ceilingDb: -1, before: { I: -15.71, sp: -3, tp: -2.8 }, after: { I: -12.5, sp: -1.2, tp: -1.1 }, tries: 1 };
  });
  const realEnv = run('sbOnsetEnv');
  box.__env = (mono, fs) => { let m = ENV_MEMO.get(mono); if(!m || m.fs !== fs){ m = { fs, E: realEnv(mono, fs) }; ENV_MEMO.set(mono, m); } const E = m.E; return { env: E.env, low: E.low, fps: E.fps, t0: E.t0 }; };
  run('sbDecode = async (bytes, fs) => __decode(bytes, fs); sbLevel = (src, fs, io) => __level(src, fs, io); sbOnsetEnv = (mono, fs) => __env(mono, fs);');
  run("teacherView = 'songbuilder';");
  /* Wait out every piece of real work (SHA-256 on another thread) and the turns after it; the virtual clock does not move. */
  const quiesce = async () => { for(let k = 0; k < 2000; k++){ await turns(4); if(!world.inflight){ await turns(4); if(!world.inflight) return; } else await new Promise(r => setTimeout(r, 1)); } };
  return { box, run, grid, world, quiesce, clock, FakeWorker };
}
