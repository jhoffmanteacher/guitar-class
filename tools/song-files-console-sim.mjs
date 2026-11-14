#!/usr/bin/env node
/* song-files-console-sim.mjs — Manage → "Song files" (teacher-songfiles.js, 2026-11-14), RUN in Node against a stub
   Firestore that checks every write against firestore.rules' "SONG FILES" block. checks.mjs 1dy runs it and pins
   the case count.

     node tools/song-files-console-sim.mjs            every case; exit 0 = all held, 1 = a ✗ line
     node tools/song-files-console-sim.mjs --verbose  print every case, not only the failures
     node tools/song-files-console-sim.mjs --breaks   also run the cases against broken copies of
                                                      teacher-songfiles.js: each must turn at least one case red
     node tools/song-files-console-sim.mjs --root DIR another site folder

   WHAT IS REAL. The whole console script (siteSource('teacher.js'): every teacher-*.js part, in load order) and
   app/songfiles.js (SONG_FILES, songFileReadPieces, songFileCount, songFileCost, songFileMonth, sfHex), with the
   site's own escHtml / escAttr lines from app/boot.js, in one vm context. renderTeacherManage is run for real to
   show it draws the slot and mounts the section.
   STUBBED: Firestore (doc get/set/delete, merge + increment, collection get, batch), the page (the Manage box and
   the section's element: their innerHTML is what the cases read), Audio + URL.createObjectURL (the length a made-up
   file reports), prompt / confirm, localStorage. crypto.subtle is Node's own. Made-up bytes only; no network.

   THE RULES CHECK (independent of the code under test; firestore.rules "SONG FILES"): a head at songFiles/{id}
   has exactly file, bytes, sha256, pieces, pieceBytes, durationSec, state, uploadedAt; the id matches
   ^[a-z0-9][a-z0-9-]{0,79}$; file a string of 1..200; bytes an int in 1..36,000,000; sha256 64 lower-case hex;
   pieceBytes 900000; pieces = ceil(bytes / 900000); durationSec a number in (0, 1800]; state uploading|ready;
   uploadedAt the server's time. A piece at songFiles/{id}/pieces/{p}: exactly i and data; p matches ^[0-9]{1,2}$;
   i an int 0..39 equal to p; data bytes of 1..900,000. songFilesUsage/{month}: only bytes, an int >= 0. Deletes:
   only under songFiles/ or songFilesUsage/. Anything else written is a violation; every case counts them. */
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { siteParts } from './site-src.mjs';

const args = process.argv.slice(2);
const argOf = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const ROOT = resolve(argOf('--root') || join(dirname(fileURLToPath(import.meta.url)), '..'));
const VERBOSE = args.includes('--verbose');
const BREAKS = args.includes('--breaks');
const read = f => readFileSync(join(ROOT, f), 'utf8');
const sha = b => createHash('sha256').update(b).digest('hex');
const PIECE = 900000;
const tick = () => new Promise(r => setImmediate(r));
const settle = async (n = 40) => { for(let i = 0; i < n; i++) await tick(); };

/* Made-up bytes: a fixed pseudo-random fill, the same every run. */
function bytesOf(n, seed){
  const b = new Uint8Array(n); let x = seed >>> 0 || 1;
  for(let i = 0; i < n; i++){ x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; b[i] = x & 255; }
  return b;
}

/* ── the stub Firestore ── */
class FakeBytes { constructor(u8){ this.u8 = Uint8Array.from(u8); } static fromUint8Array(u8){ return new FakeBytes(u8); } toUint8Array(){ return Uint8Array.from(this.u8); } }
const TS = { __serverTime: true };
const isInc = v => v && typeof v === 'object' && typeof v.__inc === 'number';
function clone(v){
  if(v instanceof FakeBytes) return new FakeBytes(v.u8);
  if(v === TS) return TS;
  if(Array.isArray(v)) return v.map(clone);
  if(v && typeof v === 'object'){ const o = {}; for(const k of Object.keys(v)) o[k] = clone(v[k]); return o; }
  return v;
}
/* The rules, written out again here (never read from the code under test). Returns '' or what is wrong. */
function rulesCheck(op, path, data){
  const p = path.split('/');
  if(op === 'delete') return (p[0] === 'songFiles' && (p.length === 2 || (p.length === 4 && p[2] === 'pieces'))) || (p[0] === 'songFilesUsage' && p.length === 2) ? '' : 'delete outside the song files: ' + path;
  const keys = Object.keys(data || {}).sort().join(',');
  if(p[0] === 'songFiles' && p.length === 2){
    const d = data, id = p[1];
    if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(id)) return 'head id ' + id;
    if(keys !== 'bytes,durationSec,file,pieceBytes,pieces,sha256,state,uploadedAt') return 'head fields ' + keys;
    if(typeof d.file !== 'string' || d.file.length < 1 || d.file.length > 200) return 'head file';
    if(!Number.isInteger(d.bytes) || d.bytes <= 0 || d.bytes > 36000000) return 'head bytes';
    if(typeof d.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(d.sha256)) return 'head sha256';
    if(d.pieceBytes !== 900000) return 'head pieceBytes';
    if(!Number.isInteger(d.pieces) || d.pieces !== Math.ceil(d.bytes / 900000)) return 'head pieces';
    if(typeof d.durationSec !== 'number' || !(d.durationSec > 0) || d.durationSec > 1800) return 'head durationSec';
    if(d.state !== 'uploading' && d.state !== 'ready') return 'head state';
    if(d.uploadedAt !== TS) return 'head uploadedAt is not the server time';
    return '';
  }
  if(p[0] === 'songFiles' && p.length === 4 && p[2] === 'pieces'){
    const d = data, pid = p[3];
    if(!/^[0-9]{1,2}$/.test(pid)) return 'piece id ' + pid;
    if(keys !== 'data,i') return 'piece fields ' + keys;
    if(!Number.isInteger(d.i) || d.i < 0 || d.i >= 40 || String(d.i) !== pid) return 'piece i ' + d.i + ' at ' + pid;
    if(!(d.data instanceof FakeBytes) || d.data.u8.length < 1 || d.data.u8.length > 900000) return 'piece data';
    return '';
  }
  if(p[0] === 'songFilesUsage' && p.length === 2){
    if(keys !== 'bytes' || !Number.isInteger(data.bytes) || data.bytes < 0) return 'usage ' + JSON.stringify(data);
    return '';
  }
  return 'write outside the song files: ' + path;
}
function makeDb(){
  const S = new Map();
  const st = { writes: [], violations: [], reads: [], pieceReads: 0, hooks: [], delay: {}, failWrite: null };
  const lat = async path => { const ms = st.delay[path]; if(ms) await new Promise(r => setTimeout(r, ms)); else await tick(); };
  const apply = (op, path, data, opts) => {
    let next;
    if(op === 'delete'){ next = undefined; }
    else if(opts && opts.merge){
      next = clone(S.get(path) || {});
      for(const k of Object.keys(data)) next[k] = isInc(data[k]) ? (Number(next[k]) || 0) + data[k].__inc : clone(data[k]);
    } else next = clone(data);
    const why = rulesCheck(op, path, next);
    if(why) st.violations.push(why);
    st.writes.push({ op, path, data: next });
    if(op === 'delete') S.delete(path); else S.set(path, next);
    for(const h of st.hooks) h({ op, path, data: next });
  };
  const snapOf = path => { const d = S.get(path); return { id: path.split('/').pop(), exists: d !== undefined, data: () => d === undefined ? undefined : clone(d), ref: docRef(path) }; };
  function docRef(path){
    return {
      path, id: path.split('/').pop(),
      collection: n => collRef(path + '/' + n),
      async get(){ st.reads.push(path); if(/\/pieces\//.test(path)) st.pieceReads++; await lat(path); return snapOf(path); },
      async set(d, o){ await tick(); if(st.failWrite && st.failWrite(path)){ const e = new Error('unavailable'); e.code = 'unavailable'; throw e; } apply('set', path, d, o); },
      async delete(){ await tick(); apply('delete', path); },
    };
  }
  function collRef(path){
    const q = {
      doc: id => docRef(path + '/' + id),
      orderBy: () => q, limit: () => q, where: () => q,
      async get(){
        st.reads.push(path);
        const docs = [...S.keys()].filter(k => k.startsWith(path + '/') && k.slice(path.length + 1).indexOf('/') < 0).sort().map(snapOf);
        await lat(path);
        return { docs, empty: !docs.length, size: docs.length, forEach: f => docs.forEach(f) };
      },
    };
    return q;
  }
  const db = {
    collection: n => collRef(n),
    batch(){
      const ops = [];
      return { set: (r, d, o) => ops.push(['set', r.path, d, o]), update: (r, d) => ops.push(['set', r.path, d, { merge: true }]), delete: r => ops.push(['delete', r.path]),
        async commit(){ await tick(); for(const o of ops) apply(o[0], o[1], o[2], o[3]); } };
    },
    runTransaction: async fn => fn({ get: r => r.get(), set: (r, d, o) => r.set(d, o), update: (r, d) => r.set(d, { merge: true }) }),
  };
  return { S, st, db };
}

/* ── one console in a vm ── */
function makeConsole(consoleSrc){
  const F = makeDb();
  const els = {};
  const mkEl = id => {
    const el = { id, dataset: {}, listeners: {}, paints: [], _html: '',
      addEventListener(type, fn){ (this.listeners[type] = this.listeners[type] || []).push(fn); },
      querySelector: () => null, querySelectorAll: () => [] };
    Object.defineProperty(el, 'innerHTML', { get(){ return this._html; }, set(v){ this._html = String(v); this.paints.push(this._html); } });
    return el;
  };
  els['t-grid-container'] = mkEl('t-grid-container');
  els['t-songfiles-block'] = mkEl('t-songfiles-block');
  const env = { promptAnswer: null, confirmAnswer: true, prompts: [], durations: new Map(), urlN: 0, audioMade: 0 };
  class Audio {
    constructor(){ this.l = {}; env.audioMade++; }
    addEventListener(t, f){ this.l[t] = f; }
    removeAttribute(){} load(){}
    set src(u){ const d = env.durations.get(u); setTimeout(() => { if(d == null || Number.isNaN(d)){ this.l.error && this.l.error(); } else { this.duration = d; this.l.loadedmetadata && this.l.loadedmetadata(); } }, 1); }
  }
  const box = {
    console: { log() {}, warn() {}, error() {} }, setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {},
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, sessionStorage: { getItem: () => null, setItem() {} },
    navigator: {}, location: { hash: '', search: '' }, addEventListener() {}, crypto: globalThis.crypto, Blob, Audio,
    URL: { createObjectURL(f){ const u = 'blob:sim/' + (++env.urlN); env.durations.set(u, f && f.__dur); return u; }, revokeObjectURL() {} },
    // The section's element exists only while the Manage HTML painted into the box holds its slot.
    document: { getElementById: id => id === 't-songfiles-block' ? (els['t-grid-container']._html.includes('id="t-songfiles-block"') ? els[id] : null) : (els[id] || null),
      querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, createElement: () => ({ addEventListener() {}, setAttribute() {}, appendChild() {}, style: {} }),
      body: { appendChild() {} }, documentElement: { style: {} } },
    prompt: q => { env.prompts.push(q); return env.promptAnswer; }, confirm: () => env.confirmAnswer, alert() {},
    scrollY: 0, scrollTo() {},
    firebase: { firestore: { Blob: FakeBytes, FieldValue: { serverTimestamp: () => TS, increment: n => ({ __inc: n }), delete: () => ({ __del: true }) } } },
  };
  box.window = box;
  vm.createContext(box);
  const BOOT = read('app/boot.js');
  const esc = ['escAttr', 'escHtml'].map(n => (BOOT.match(new RegExp(`^const ${n} = .*$`, 'm')) || [''])[0]).join('\n');
  vm.runInContext(esc + '\nlet db = null; let firebaseReady = true; async function ensureDb(){ return db; }\n'
    + 'const MODULE_MANIFEST = []; const CLASS_OPEN_THROUGH = 1;\nfunction __setDb(x){ db = x; }', box, { filename: 'prelude' });
  vm.runInContext(read('app/songfiles.js'), box, { filename: 'app/songfiles.js' });
  // The sim's own list: whatever the site ships on SONG_FILES is cleared, so a real entry never changes a case (review B3).
  vm.runInContext('for (const k of Object.keys(SONG_FILES)) delete SONG_FILES[k];', box);
  vm.runInContext(consoleSrc, box, { filename: 'teacher.js (all parts)' });
  vm.runInContext('__setDb', box)(F.db);
  const run = code => vm.runInContext(code, box);
  return { box, F, els, env, run, block: els['t-songfiles-block'], grid: els['t-grid-container'] };
}

/* ── the made-up songs ── */
const SONG_BYTES = 2000123;
const SONG = bytesOf(SONG_BYTES, 7);
const SONG_SHA = sha(SONG);
const OTHER = bytesOf(1000, 11);
const fileOf = (bytes, dur, name) => { const f = { name: name || 'x.mp3', size: bytes.length, __dur: dur, reads: 0 };
  f.arrayBuffer = async () => { f.reads++; return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length); }; return f; };
function register(c){
  c.run(`SONG_FILES['test-song'] = { file: 'test-song.mp3', bytes: ${SONG_BYTES}, sha256: '${SONG_SHA}', durationSec: 125.5 };
         SONG_FILES['other-song'] = { file: 'other-song.mp3', bytes: ${OTHER.length}, sha256: '${sha(OTHER)}', durationSec: 3 };`);
}
function seedOther(c){
  c.F.S.set('songFiles/other-song', { file: 'other-song.mp3', bytes: OTHER.length, sha256: sha(OTHER), pieces: 1, pieceBytes: PIECE, durationSec: 3, state: 'ready', uploadedAt: TS });
  c.F.S.set('songFiles/other-song/pieces/0', { i: 0, data: new FakeBytes(OTHER) });
}
const MONTH = () => { const d = new Date(); return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0'); };
async function managed(c){
  c.run(`teacherView = 'manage'; allStudentsRaw = [{ uid: 'stub-uid-1', name: 'Test 0' }];`);
  await c.run('renderTeacherManage()');
  await settle();
}
async function uploaded(c){
  await managed(c);
  await c.run('teacherSfUpload')(fileOf(SONG, 125.5));
  await settle(60);
}

/* ── the cases ── */
async function runCases(consoleSrc){
  let cases = 0, fails = 0; const lines = [];
  const ok = (cond, line) => { cases++; if(!cond) fails++; if(!cond || VERBOSE) lines.push((cond ? '  ✓ ' : '  ✗ ') + line); return cond; };
  const allViolations = [];
  const done = c => { allViolations.push(...c.F.st.violations); };
  let c;

  /* hook: Manage draws the slot and the section */
  c = makeConsole(consoleSrc); register(c);
  await managed(c);
  ok(c.grid._html.includes('id="t-songfiles-block"'), 'hook: renderTeacherManage draws the <div id="t-songfiles-block"> slot');
  ok(/Song files/.test(c.block._html) && /Song downloads this month/.test(c.block._html), 'hook: the section is painted into the slot (title and the month line)');
  {
    const src = c.run('renderTeacherManage.toString()');
    const nAcc = (src.match(/teacherAccessMount\(\)/g) || []).length, nSf = (src.match(/teacherSongFilesMount\(\)/g) || []).length;
    ok(nAcc >= 1 && nSf === nAcc, `hook: every Manage paint that mounts the access block mounts Song files too (${nSf} of ${nAcc})`);
  }
  ok(c.F.st.writes.length === 0, `hook: opening Manage writes nothing (${c.F.st.writes.length} writes)`);
  done(c);

  /* upload over a song that is already there and matching: asked first (review B7) */
  c = makeConsole(consoleSrc); register(c);
  await uploaded(c);
  {
    await c.run('teacherSfLoad()'); await settle();
    const n0 = c.F.st.writes.length;
    c.env.confirmAnswer = false;
    await c.run('teacherSfUpload')(fileOf(SONG, 125.5)); await settle(60);
    ok(c.F.st.writes.length === n0 && /already there and matches/.test(c.block._html), `re-upload of a matching song, answered No: nothing written (${c.F.st.writes.length - n0} writes)`);
    c.env.confirmAnswer = true;
    await c.run('teacherSfUpload')(fileOf(SONG, 125.5)); await settle(60);
    ok(c.F.st.writes.length > n0 && (c.F.S.get('songFiles/test-song') || {}).state === 'ready', 're-upload answered Yes: uploaded again, ready');
  }
  done(c);

  /* upload: 3 pieces, uploading → ready, stale pieces 3..5 removed */
  c = makeConsole(consoleSrc); register(c);
  c.F.S.set('songFiles/test-song', { file: 'test-song.mp3', bytes: 5 * PIECE + 10, sha256: 'b'.repeat(64), pieces: 6, pieceBytes: PIECE, durationSec: 300, state: 'ready', uploadedAt: TS });
  for(let k = 0; k < 6; k++) c.F.S.set('songFiles/test-song/pieces/' + k, { i: k, data: new FakeBytes(bytesOf(k < 5 ? 10 : 10, 100 + k)) });
  seedOther(c);
  await uploaded(c);
  {
    const W = c.F.st.writes;
    const sets = W.filter(w => w.op === 'set');
    const pieceSets = sets.filter(w => /\/pieces\//.test(w.path));
    ok(pieceSets.length === 3 && pieceSets.map(w => w.path.split('/').pop()).join(',') === '0,1,2', `upload: exactly 3 piece writes, in order (${pieceSets.map(w => w.path.split('/').pop()).join(',')})`);
    const lens = pieceSets.map(w => w.data.data.u8.length);
    ok(lens.join(',') === '900000,900000,200123', `upload: piece sizes ${lens.join(', ')}`);
    const joined = Buffer.concat(pieceSets.map(w => Buffer.from(w.data.data.u8)));
    ok(joined.length === SONG_BYTES && sha(joined) === SONG_SHA, `upload: the pieces put together are the file byte for byte (${joined.length} bytes, SHA-256 ${sha(joined) === SONG_SHA ? 'matches' : 'differs'})`);
    const heads = W.filter(w => w.path === 'songFiles/test-song');
    ok(heads.length === 2 && heads[0].data.state === 'uploading' && heads[1].data.state === 'ready' && W[0].path === 'songFiles/test-song' && W[W.length - 1].path === 'songFiles/test-song',
      `upload: the head is the first write ('uploading') and the last ('ready') (${heads.map(h => h.data.state).join(' → ')}; ${W.length} writes)`);
    const h = c.F.S.get('songFiles/test-song') || {};
    ok(h.bytes === SONG_BYTES && h.sha256 === SONG_SHA && h.pieces === 3 && h.pieceBytes === PIECE && h.durationSec === 125.5 && h.file === 'test-song.mp3' && h.state === 'ready',
      `upload: the stored head (${JSON.stringify({ bytes: h.bytes, pieces: h.pieces, durationSec: h.durationSec, file: h.file, state: h.state })})`);
    const left = [3, 4, 5].filter(k => c.F.S.has('songFiles/test-song/pieces/' + k));
    const pieceDeletes = W.filter(w => w.op === 'delete').map(w => w.path);
    ok(!left.length && [0, 1, 2].every(k => c.F.S.has('songFiles/test-song/pieces/' + k)), `upload: stale pieces 3..5 from the earlier longer upload are gone (${left.length} left), 0..2 kept`);
    ok(pieceDeletes.every(p => /^songFiles\/test-song\/pieces\/([3-9]|[1-3][0-9])$/.test(p)) && W.findIndex(w => w.op === 'delete') > W.findIndex(w => w.path.endsWith('/pieces/2')),
      `upload: the deletes are pieces 3..39 of this song only, after the last piece (${pieceDeletes.length} deletes)`);
    ok(c.F.S.has('songFiles/other-song') && c.F.S.has('songFiles/other-song/pieces/0'), 'upload: the other song is untouched');
    ok(c.F.st.pieceReads === 0, `upload: no piece was read (${c.F.st.pieceReads})`);
    ok(c.block.paints.some(p => /Uploading test-song… 3 of 3/.test(p)), 'upload: the progress line reached "Uploading test-song… 3 of 3"');
    ok(/on the list, uploaded, matches/.test(c.block._html), 'upload: the row then says "on the list, uploaded, matches"');
    ok(c.F.st.violations.length === 0, `upload: every write meets the rules' shape (${W.length} writes, ${c.F.st.violations.length} violations${c.F.st.violations.length ? ': ' + c.F.st.violations.slice(0, 3).join('; ') : ''})`);
  }
  done(c);

  /* refusals: not on the list, over the cap, unreadable length */
  c = makeConsole(consoleSrc); register(c);
  await managed(c);
  {
    const odd = bytesOf(5000, 99);
    await c.run('teacherSfUpload')(fileOf(odd, 10)); await settle();
    ok(c.F.st.writes.length === 0, `not on the list: nothing written (${c.F.st.writes.length})`);
    ok(/not on the site(&#39;|'|’)s list of song files/.test(c.block._html) && c.block._html.includes(sha(odd).slice(0, 12)) && /5,000 bytes/.test(c.block._html) && /Claude adds a song to the list first/.test(c.block._html),
      'not on the list: the sentence names the SHA-256 and the size');
    const near = new Uint8Array(SONG_BYTES); near.set(SONG); near[0] ^= 1;
    await c.run('teacherSfUpload')(fileOf(near, 10)); await settle();
    ok(c.F.st.writes.length === 0, `same size, one byte different: nothing written (${c.F.st.writes.length})`);
    const big = { name: 'big.mp3', size: 36000001, __dur: 100, reads: 0 }; big.arrayBuffer = async () => { big.reads++; return new ArrayBuffer(0); };
    await c.run('teacherSfUpload')(big); await settle();
    ok(c.F.st.writes.length === 0 && big.reads === 0 && /36,000,000/.test(c.block._html), `over the cap (36,000,001 bytes): nothing written, the file not even read (${big.reads} reads), the line names the cap`);
    await c.run('teacherSfUpload')(fileOf(SONG, NaN)); await settle(60);
    ok(c.F.st.writes.length === 0 && /could not read the length/.test(c.block._html), `a length the browser cannot read: nothing written (${c.F.st.writes.length})`);
  }
  done(c);

  /* one upload at a time */
  c = makeConsole(consoleSrc); register(c); seedOther(c);
  c.F.S.delete('songFiles/other-song'); c.F.S.delete('songFiles/other-song/pieces/0');
  await managed(c);
  {
    const p1 = c.run('teacherSfUpload')(fileOf(SONG, 125.5));
    const p2 = c.run('teacherSfUpload')(fileOf(OTHER, 3));
    await Promise.all([p1, p2]); await settle(60);
    ok(!c.F.S.has('songFiles/other-song') && c.F.st.writes.every(w => w.path.startsWith('songFiles/test-song')), `one upload at a time: a second file picked while one uploads writes nothing (${c.F.st.writes.filter(w => !w.path.startsWith('songFiles/test-song')).length} of its writes)`);
  }
  done(c);

  /* verify: passes, counts the month; a flipped byte; a missing piece; the limit */
  c = makeConsole(consoleSrc); register(c);
  await uploaded(c);
  {
    const cost = Math.ceil(SONG_BYTES * 4 / 3);
    c.F.S.set('songFilesUsage/' + MONTH(), { bytes: 1000 });
    const before = c.F.st.writes.length, pr0 = c.F.st.pieceReads;
    await c.run('teacherSfVerify')('test-song'); await settle();
    const chk = c.run('teacherSfChecks.get("test-song")') || {};
    ok(chk.ok === true && /✓/.test(c.block._html), `verify: the uploaded file reads back whole (${JSON.stringify(chk.text)})`);
    ok(c.F.st.pieceReads - pr0 === 3, `verify: read 3 pieces (${c.F.st.pieceReads - pr0})`);
    const used = (c.F.S.get('songFilesUsage/' + MONTH()) || {}).bytes;
    ok(used === 1000 + cost, `verify: the month's count rose by the cost, once (${used} = 1000 + ${cost})`);
    const usageWrites = c.F.st.writes.slice(before).filter(w => w.path.startsWith('songFilesUsage/'));
    ok(usageWrites.length === 1 && c.F.st.writes.slice(before).every(w => w.path.startsWith('songFilesUsage/')), `verify: its only write is the count (${c.F.st.writes.length - before} writes)`);

    const p1 = c.F.S.get('songFiles/test-song/pieces/1'); const u = p1.data.u8; u[12345] ^= 0x40;
    await c.run('teacherSfVerify')('test-song'); await settle();
    const bad = c.run('teacherSfChecks.get("test-song")') || {};
    ok(bad.ok === false && /SHA-256/.test(bad.text) && /✗/.test(c.block._html), `verify: one flipped byte fails (${JSON.stringify(bad.text)})`);
    u[12345] ^= 0x40;

    c.F.S.delete('songFiles/test-song/pieces/2');
    await c.run('teacherSfVerify')('test-song'); await settle();
    const miss = c.run('teacherSfChecks.get("test-song")') || {};
    ok(miss.ok === false && /missing/.test(miss.text), `verify: a missing piece fails (${JSON.stringify(miss.text)})`);

    const LIMIT = c.run('SONG_FILES_MONTH_LIMIT');
    c.F.S.set('songFilesUsage/' + MONTH(), { bytes: LIMIT - cost + 1 });
    const pr = c.F.st.pieceReads, w0 = c.F.st.writes.length;
    await c.run('teacherSfVerify')('test-song'); await settle();
    const lim = c.run('teacherSfChecks.get("test-song")') || {};
    ok(lim.ok === false && /limit/.test(lim.text) && c.F.st.pieceReads === pr && c.F.st.writes.length === w0 && c.F.S.get('songFilesUsage/' + MONTH()).bytes === LIMIT - cost + 1,
      `verify: one byte over the month's limit says so, reads no piece and counts nothing (${JSON.stringify(lim.text)})`);
    ok(/Song downloads this month \(\d{4}-\d{2}\): 6\.0 GiB of 6\.0 GiB \(100%\)/.test(c.block._html), 'verify: the month line shows GiB with one decimal and %');
  }
  done(c);

  /* verify all, and the limit stops it */
  c = makeConsole(consoleSrc); register(c); seedOther(c);
  await uploaded(c);
  {
    await c.run('teacherSfVerifyAll')(); await settle();
    const a = c.run('teacherSfChecks.get("test-song")') || {}, b = c.run('teacherSfChecks.get("other-song")') || {};
    ok(a.ok === true && b.ok === true && /Verified 2 of 2/.test(c.block._html), 'verify all: both songs on the list and in the store read back whole ("Verified 2 of 2")');
  }
  done(c);

  /* delete */
  c = makeConsole(consoleSrc); register(c); seedOther(c);
  await uploaded(c);
  {
    const w0 = c.F.st.writes.length;
    c.env.promptAnswer = 'test-son';
    await c.run('teacherSfDelete')('test-song'); await settle();
    ok(c.F.st.writes.length === w0 && c.F.S.has('songFiles/test-song') && /Nothing was deleted/.test(c.block._html), `delete: a typed id that is not the song's deletes nothing (${c.F.st.writes.length - w0} writes)`);
    c.env.promptAnswer = null;
    await c.run('teacherSfDelete')('test-song'); await settle();
    ok(c.F.st.writes.length === w0 && c.F.S.has('songFiles/test-song'), 'delete: Cancel deletes nothing');
    c.env.promptAnswer = 'test-song';
    // through the delegated listener, as a click on the row's button
    const btn = { disabled: false, dataset: { tsfAct: 'delete', tsfId: 'test-song' } };
    for(const fn of c.block.listeners.click || []) fn({ target: { closest: sel => sel === '[data-tsf-act]' ? btn : null } });
    await settle();
    const dels = c.F.st.writes.slice(w0);
    ok(!c.F.S.has('songFiles/test-song') && ![0, 1, 2].some(k => c.F.S.has('songFiles/test-song/pieces/' + k)), 'delete: the typed id deletes the head and every piece (clicked through the delegated listener)');
    ok(dels.length > 0 && dels.every(w => w.op === 'delete' && /^songFiles\/test-song(\/pieces\/\d+)?$/.test(w.path)) && c.F.S.has('songFiles/other-song') && c.F.S.has('songFiles/other-song/pieces/0'),
      `delete: only that song's docs (${dels.length} deletes, the other song kept)`);
  }
  done(c);

  /* leaving Manage mid-upload */
  c = makeConsole(consoleSrc); register(c);
  await managed(c);
  {
    let left = false;
    c.F.st.hooks.push(w => { if(!left && w.path === 'songFiles/test-song/pieces/0'){ left = true; c.run(`teacherView = 'students'`); } });
    await c.run('teacherSfUpload')(fileOf(SONG, 125.5)); await settle(60);
    const n = c.F.st.writes.length;
    const h = c.F.S.get('songFiles/test-song') || {};
    ok(left && n === 2 && h.state === 'uploading', `leave mid-upload: writing stops (${n} writes: the head and piece 0), the head stays 'uploading'`);
    const paintsAfter = c.block.paints.length;
    await c.run(`teacherView = 'manage'`); await c.run('renderTeacherManage()'); await settle();
    ok(/NOT ready/.test(c.block._html) && c.F.st.writes.length === n && c.block.paints.length > paintsAfter, 'leave mid-upload: back on Manage, the section says the song is not ready, and nothing more was written');
  }
  done(c);

  /* escaping */
  c = makeConsole(consoleSrc); register(c);
  c.F.S.set('songFiles/evil-song', { file: '<img src=x onerror=alert(1)>', bytes: '<b>9</b>', sha256: 'x', pieces: 1, pieceBytes: PIECE, durationSec: '<i>', state: '<script>alert(2)</script>', uploadedAt: TS });
  c.F.S.set('songFiles/x"><svg onload=alert(3)>', { file: 'a.mp3', bytes: 1, sha256: 'x', pieces: 1, pieceBytes: PIECE, durationSec: 1, state: 'ready', uploadedAt: TS });
  await managed(c);
  c.run('teacherSfOpen = true; teacherSfPaint()');
  {
    const html = c.block._html;
    ok(!/<img|<script|<svg|<b>|<i>/i.test(html) && html.includes('&lt;img src=x onerror=alert(1)&gt;') && html.includes('&lt;script&gt;'), 'escape: a stored file name <img src=x onerror=alert(1)> and state <script> are drawn as text');
    ok(!html.includes('"><svg') && html.includes('data-tsf-id="x&quot;&gt;&lt;svg onload=alert(3)&gt;"'), 'escape: a stored doc id with "><svg …> is escaped in its data-tsf-id');
    ok(!/\son[a-z]+="/i.test(html.replace(/&[a-z#0-9]+;/g, '')) , 'escape: the section has no inline on…= handler');
    ok(/in the store, not on the list/.test(html), 'list: a store doc that is not on the list says so');
    ok(/Upload real songs only after the school-accounts rules \(paste 2\) are published/.test(html), 'the section says to upload real songs only after paste 2 is published (review A1)');
    // A Verify result's text is drawn as text too (review B, minor 3).
    c.run(`teacherSfChecks.set('test-song', { ok: false, text: '<img src=x onerror=alert(4)>' }); teacherSfPaint()`);
    const h2 = c.block._html;
    ok(!/<img/i.test(h2) && h2.includes('&lt;img src=x onerror=alert(4)&gt;'), 'escape: a Verify result\'s text is drawn as text');
    // A read that lands while a write is under way does not replace what the section shows (review B, minor 3).
    const before = c.run('teacherSfHeads');
    c.run(`teacherSfBusy = 'upload'`);
    await c.run('teacherSfLoad()');
    ok(c.run('teacherSfHeads') === before, 'a read that finishes during an upload does not replace the list (the write\'s end reads again)');
    c.run(`teacherSfBusy = ''`);
  }
  done(c);

  /* the list's statuses */
  c = makeConsole(consoleSrc); register(c);
  c.run(`SONG_FILES['third-song'] = { file: 'third.mp3', bytes: 1000, sha256: '${'c'.repeat(64)}', durationSec: 5 };`);
  c.F.S.set('songFiles/test-song', { file: 'test-song.mp3', bytes: SONG_BYTES, sha256: SONG_SHA, pieces: 3, pieceBytes: PIECE, durationSec: 125.5, state: 'uploading', uploadedAt: TS });
  c.F.S.set('songFiles/third-song', { file: 'third.mp3', bytes: 1001, sha256: 'c'.repeat(64), pieces: 1, pieceBytes: PIECE, durationSec: 5, state: 'ready', uploadedAt: TS });
  await managed(c);
  c.run('teacherSfOpen = true; teacherSfPaint()');
  {
    const html = c.block._html;
    const rows = html.split('<tr').slice(2);
    const rowOf = id => rows.find(r => r.includes(`<td>${id}</td>`)) || '';
    ok(/upload not finished \(uploading\)/.test(rowOf('test-song')), 'list: an unfinished upload says "upload not finished (uploading)"');
    ok(/on the list, not uploaded/.test(rowOf('other-song')), 'list: a list entry not in the store says "on the list, not uploaded"');
    ok(/uploaded, but its size or SHA-256 is not the list/.test(rowOf('third-song')), 'list: a stored file of another size says "uploaded, but its size or SHA-256 is not the list\'s"');
    ok(rows.length === 3 && /2\.0 MB/.test(rowOf('test-song')) && /2:06/.test(rowOf('test-song')), `list: 3 rows; size in MB and length m:ss (${rows.length} rows)`);
  }
  done(c);

  /* reset */
  c = makeConsole(consoleSrc); register(c);
  c.F.S.set('songFilesUsage/' + MONTH(), { bytes: 123456789 });
  await managed(c);
  {
    c.env.confirmAnswer = false;
    await c.run('teacherSfReset')(); await settle();
    ok(c.F.st.writes.length === 0, 'reset: Cancel writes nothing');
    c.env.confirmAnswer = true;
    await c.run('teacherSfReset')(); await settle();
    const w = c.F.st.writes;
    ok(w.length === 1 && w[0].path === 'songFilesUsage/' + MONTH() && w[0].data.bytes === 0 && Object.keys(w[0].data).join() === 'bytes', `reset: one write, { bytes: 0 } on this month (${JSON.stringify(w.map(x => [x.path, x.data]))})`);
    ok(/0\.0 GiB of 6\.0 GiB \(0%\)/.test(c.block._html), 'reset: the month line shows 0.0 GiB (0%)');
  }
  done(c);

  /* a stale read never paints over a newer one */
  c = makeConsole(consoleSrc); register(c);
  await managed(c);
  {
    c.F.S.set('songFiles/old-only', { file: 'old.mp3', bytes: 1, sha256: 'x', pieces: 1, pieceBytes: PIECE, durationSec: 1, state: 'ready', uploadedAt: TS });
    c.F.st.delay['songFiles'] = 30;
    const slow = c.run('teacherSfLoad()');
    await settle(5);
    c.F.S.delete('songFiles/old-only');
    c.F.S.set('songFiles/new-only', { file: 'new.mp3', bytes: 1, sha256: 'x', pieces: 1, pieceBytes: PIECE, durationSec: 1, state: 'ready', uploadedAt: TS });
    c.F.st.delay['songFiles'] = 0;
    await c.run('teacherSfLoad()');
    await slow; await settle();
    const ids = c.run('[...teacherSfHeads.keys()].join(",")');
    ok(ids === 'new-only', `stale read: the older, slower read does not replace the newer (${ids})`);
    c.run(`teacherView = 'students'`);
    const n = c.block.paints.length;
    await c.run('teacherSfLoad()'); await settle();
    ok(c.block.paints.length === n, 'stale read: a read that lands after the teacher left Manage paints nothing');
  }
  done(c);

  ok(allViolations.length === 0, `rules: every write in every case meets firestore.rules' shape (${allViolations.length} violations${allViolations.length ? ': ' + allViolations.slice(0, 3).join('; ') : ''})`);
  return { cases, fails, lines };
}

/* ── main ── */
const parts = siteParts('teacher.js', ROOT);
const partSrc = new Map(parts.map(p => [p, read(p)]));
if(!parts.includes('teacher-songfiles.js')){ console.log('song-files-console-sim: teacher-songfiles.js is not a console part (TEACHER_JS_PARTS in app/boot.js)'); process.exit(1); }
const consoleWith = sf => parts.map(p => p === 'teacher-songfiles.js' ? sf : partSrc.get(p)).join('');
const SF = partSrc.get('teacher-songfiles.js');

let res;
try { res = await runCases(consoleWith(SF)); }
catch(e){ console.log('song-files-console-sim: the code would not run: ' + (e && e.stack || e)); process.exit(1); }
for(const l of res.lines) console.log(l);
const order = parts.indexOf('teacher-songfiles.js') > parts.indexOf('teacher-songrequests.js');
const sw = read('sw.js');
const partOk = order && !sw.includes('teacher-songfiles.js');
if(!partOk) console.log(`  ✗ part: teacher-songfiles.js must load after teacher-songrequests.js (${order}) and stay out of sw.js (${!sw.includes('teacher-songfiles.js')})`);
const cases = res.cases + 1, failed = res.fails + (partOk ? 0 : 1);
console.log(`song-files-console-sim: ${cases} cases, ${failed} failed`);

if(BREAKS){
  const MUT = [
    ['no list match: any file uploads as the first entry', "return Object.keys(list).find(id => list[id] && list[id].sha256 === sha && list[id].bytes === bytes) || null;", "return Object.keys(list)[0] || null;"],
    ['no size cap before reading', 'if(size > TEACHER_SF_MAX_BYTES){', 'if(false){'],
    ['stale pieces kept', 'for(let j = n; j < TEACHER_SF_MAX_PIECES; j++) batch.delete(', 'for(let j = n; j < n; j++) batch.delete('],
    ['the head written ready from the start', "const head = teacherSfHead(id, entry, durationSec, 'uploading');", "const head = teacherSfHead(id, entry, durationSec, 'ready');"],
    ['a piece one byte short', 'Math.min(buf.length, (k + 1) * SONG_FILE_PIECE)', 'Math.min(buf.length, (k + 1) * SONG_FILE_PIECE - 1)'],
    ['uploadedAt dropped from the head', 'durationSec, state, uploadedAt: firebase.firestore.FieldValue.serverTimestamp() };', 'durationSec, state };'],
    ['the file name not escaped', "`<td>${escHtml(String(src.file == null ? '—' : src.file))}</td>`", "`<td>${String(src.file == null ? '—' : src.file)}</td>`"],
    ['the id not escaped in data-tsf-id', 'data-tsf-id="${escAttr(id)}"', 'data-tsf-id="${id}"'],
    ['Verify not counted', 'try{ await songFileCount(db, songFileCost(entry.bytes)); }', 'try{ }'],
    ['Delete without the typed id', "if(String(typed).trim() !== id){", 'if(false){'],
    ['Delete takes every song', "const ref = db.collection('songFiles').doc(id);\n    const batch = db.batch();", "const ref = db.collection('songFiles').doc(id);\n    const batch = db.batch(); batch.delete(db.collection('songFiles').doc('other-song'));"],
    ['leaving Manage does not stop the upload', "const stopped = () => teacherView !== 'manage';", 'const stopped = () => false;'],
    ['an older read paints over a newer one', "if(gen !== teacherSfReadGen) return;                        // a newer read owns the section\n", ''],
    ['paints after leaving Manage', "function teacherSfPaint(){\n  if(teacherView !== 'manage') return;", 'function teacherSfPaint(){'],
    ['Reset writes the wrong shape', "set({ bytes: 0 });", "set({ bytes: 0, at: 1 });"],
    ['a re-upload over a matching song is not asked first', "    if(was && was.state === 'ready' && teacherSfHeadMatches(was, entry)", "    if(false"],
    ['a Verify result drawn unescaped (review B minor 3)', "${escHtml(chk.text)}", "${chk.text}"],
    ['a read paints over a write (review B minor 3)', "  if(teacherSfBusy) return;                                   // the write's end reads again\n", ''],
    ['one upload at a time dropped', "async function teacherSfUpload(file){\n  if(teacherSfBusy || !file) return;", "async function teacherSfUpload(file){\n  if(!file) return;"],
  ];
  let caught = 0;
  for(const [name, from, to] of MUT){
    const n = SF.split(from).length - 1;
    if(n !== 1){ console.log(`  ✗ break "${name}": its text is in teacher-songfiles.js ${n} times (must be once)`); continue; }
    let r;
    try { r = await runCases(consoleWith(SF.replace(from, to))); } catch(e){ r = { fails: 1, lines: ['  (threw: ' + (e && e.message) + ')'] }; }
    if(r.fails > 0){ caught++; console.log(`  ✓ break caught: ${name} (${r.fails} red${VERBOSE ? ': ' + r.lines.filter(l => /✗/.test(l)).slice(0, 2).join(' | ').trim() : ''})`); }
    else console.log(`  ✗ break NOT caught: ${name}`);
  }
  console.log(`${caught === MUT.length ? '✓' : '✗'} ${caught} of ${MUT.length} breaks caught`);
  if(caught !== MUT.length) process.exit(1);
}
process.exit(failed ? 1 : 0);
