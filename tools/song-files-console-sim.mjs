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
   only under songFiles/ or songFilesUsage/. BUILT SONGS (2026-11-14): builtSongs/{id} has exactly v, title,
   artist, audio, song, savedAt in the rules' shape (the id ^sb-[a-z0-9]{8,24}$, audio's fields and ranges,
   centsOff -10..10, savedAt the server's time); builtSongsMeta/list exactly songs (at most 200) and updatedAt (the
   server's time). Anything else written is a violation; every case counts them.

   MANAGE → BUILT SONGS (teacher-builtsongs.js, Song builder Part a2; app/builtsongs.js is loaded for the validator):
   the slot is drawn and mounted with Song files; an Import writes the audio (3 pieces, ready), then the song, then
   the list (edit 1), in that order; importing again replaces the song, skips the stored audio, raises the edit,
   keeps the other songs and drops the list's bad keys; eight refused files (not JSON, an extra field, two validator
   rules, an .mp3 of another size (not even read), other bytes, a length 2 s off, an audio id on SONG_FILES) and an
   audio id another song uses with other bytes each write nothing and say why in one line; one import at a time;
   leaving Manage stops it; Song files names a built song's audio ("Built song: <title>", escaped) and its Delete is
   refused while a listed song plays it; a stored song the validator refuses shows ✗ and its reason.

   MANY FILES AND THE DROP ZONE (W21, 2026-11-17; four made-up files bat-a … bat-d): 3 good files picked in the
   file box (multiple) go up one file at a time with one progress line ("2 of 3: bat-b.mp3") and nothing verified;
   a good, a not-listed (an <img …> name, drawn as text) and a good: the two go up and the end names the third;
   wrong bytes under a listed name say "wrong bytes"; a failure in the middle never stops the rest; a second drop
   during a batch is refused with a line and writes nothing; leaving Manage stops the batch at the file being
   written; the window drop guard is on only during a batch; a folder, a file that is not .mp3 and an empty drop
   get one line each.

   AWAITING SWITCH (2026-11-17, private song audio step 2; bat-a and bat-b flagged "awaitingSwitch": true, bat-c
   not): before upload an awaiting row reads "on the site as a public file; upload it, then it can be switched";
   its upload is accepted and its head is the rules' shape; uploaded, it reads "uploaded, matches; ready to switch";
   a file not on the list and an awaiting name with one byte changed are refused and write nothing; Verify all over
   awaiting-uploaded, awaiting-not-uploaded and an ordinary uploaded entry reads back the two uploaded ones. */
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { FIXTURES, withAudio, audioIdFor, importFile } from './built-songs-fixtures.mjs';
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
  /* BUILT SONGS (firestore.rules, 2026-11-14), written out again here. */
  if(p[0] === 'builtSongs' && p.length === 2){
    const d = data, a = d.audio || {};
    if(!/^sb-[a-z0-9]{8,24}$/.test(p[1])) return 'built song id ' + p[1];
    if(keys !== 'artist,audio,savedAt,song,title,v') return 'built song fields ' + keys;
    if(!Number.isInteger(d.v) || d.v < 1 || d.v > 99) return 'built song v';
    if(typeof d.title !== 'string' || !d.title.trim().length || d.title.length > 120) return 'built song title';
    if(typeof d.artist !== 'string' || d.artist.length > 120) return 'built song artist';
    const ak = Object.keys(a);
    if(!ak.every(k => ['id', 'bytes', 'sha256', 'durationSec', 'centsOff', 'gainDb', 'sourceSha256'].includes(k)) || !['id', 'bytes', 'sha256', 'durationSec', 'centsOff'].every(k => ak.includes(k))) return 'built song audio fields ' + ak.sort().join(',');
    if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(a.id) || !Number.isInteger(a.bytes) || a.bytes <= 0 || a.bytes > 36000000 || !/^[0-9a-f]{64}$/.test(a.sha256)) return 'built song audio id/bytes/sha256';
    if(typeof a.durationSec !== 'number' || !(a.durationSec > 0) || a.durationSec > 1800) return 'built song audio durationSec';
    if(typeof a.centsOff !== 'number' || a.centsOff < -10 || a.centsOff > 10) return 'built song audio centsOff';
    if('gainDb' in a && (typeof a.gainDb !== 'number' || a.gainDb < -40 || a.gainDb > 40)) return 'built song audio gainDb';
    if('sourceSha256' in a && !/^[0-9a-f]{64}$/.test(a.sourceSha256)) return 'built song audio sourceSha256';
    if(!d.song || typeof d.song !== 'object' || Array.isArray(d.song)) return 'built song song';
    if(d.savedAt !== TS) return 'built song savedAt is not the server time';
    return '';
  }
  if(p[0] === 'builtSongsMeta' && p[1] === 'list' && p.length === 2){
    if(keys !== 'songs,updatedAt') return 'built songs list fields ' + keys;
    if(!data.songs || typeof data.songs !== 'object' || Object.keys(data.songs).length > 200) return 'built songs list songs';
    if(data.updatedAt !== TS) return 'built songs list updatedAt is not the server time';
    return '';
  }
  return 'write outside the song files: ' + path;
}
function makeDb(){
  const S = new Map();
  const st = { writes: [], violations: [], reads: [], pieceReads: 0, hooks: [], delay: {}, failWrite: null, failRead: {} };
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
      async get(){ st.reads.push(path); if(/\/pieces\//.test(path)) st.pieceReads++; await lat(path); if(st.failRead[path]){ const e = new Error(st.failRead[path]); e.code = st.failRead[path]; throw e; } return snapOf(path); },
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
  els['t-builtsongs-block'] = mkEl('t-builtsongs-block');
  const env = { promptAnswer: null, confirmAnswer: true, prompts: [], durations: new Map(), urlN: 0, audioMade: 0, win: [] };
  class Audio {
    constructor(){ this.l = {}; env.audioMade++; }
    addEventListener(t, f){ this.l[t] = f; }
    removeAttribute(){} load(){}
    set src(u){ const d = env.durations.get(u); setTimeout(() => { if(d == null || Number.isNaN(d)){ this.l.error && this.l.error(); } else { this.duration = d; this.l.loadedmetadata && this.l.loadedmetadata(); } }, 1); }
  }
  const box = {
    console: { log() {}, warn() {}, error() {} }, setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {},
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, sessionStorage: { getItem: () => null, setItem() {} },
    navigator: {}, location: { hash: '', search: '' }, crypto: globalThis.crypto, Blob, Audio,
    // window listeners are counted (W21: the batch's drop guard must be gone however the batch ends)
    addEventListener(t, f){ env.win.push([t, f]); },
    removeEventListener(t, f){ const i = env.win.findIndex(x => x[0] === t && x[1] === f); if(i >= 0) env.win.splice(i, 1); },
    URL: { createObjectURL(f){ const u = 'blob:sim/' + (++env.urlN); env.durations.set(u, f && f.__dur); return u; }, revokeObjectURL() {} },
    // The section's element exists only while the Manage HTML painted into the box holds its slot.
    document: { getElementById: id => (id === 't-songfiles-block' || id === 't-builtsongs-block') ? (els['t-grid-container']._html.includes(`id="${id}"`) ? els[id] : null) : (els[id] || null),
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
  vm.runInContext(read('app/builtsongs.js'), box, { filename: 'app/builtsongs.js' });   // the validator and bsListOf the console's Import uses
  // The sim's own list: whatever the site ships on SONG_FILES is cleared, so a real entry never changes a case (review B3).
  vm.runInContext('for (const k of Object.keys(SONG_FILES)) delete SONG_FILES[k];', box);
  vm.runInContext(consoleSrc, box, { filename: 'teacher.js (all parts)' });
  vm.runInContext('__setDb', box)(F.db);
  const run = code => vm.runInContext(code, box);
  return { box, F, els, env, run, block: els['t-songfiles-block'], bblock: els['t-builtsongs-block'], grid: els['t-grid-container'] };
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
    await settle(150);   // the delete reads the built songs' list first (teacherBsAudioUsers)
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
    ok(/Only school accounts, and the outside accounts you allowed, can read these files\. The monthly limit counts only what the site itself downloads\./.test(html) && !/paste 2/.test(html), 'the section says who can read the files and what the limit counts (review A1; the paste-2 warning went when paste 2 was published)');
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

  /* ── Many files at once and the drop zone (W21, 2026-11-17) ── */
  const BATCH = ['bat-a', 'bat-b', 'bat-c', 'bat-d'].map((id, i) => ({ id, bytes: bytesOf(1500 + i * 100, 300 + i) }));
  const regBatch = c => { for(const s of BATCH) c.run(`SONG_FILES['${s.id}'] = { file: '${s.id}.mp3', bytes: ${s.bytes.length}, sha256: '${sha(s.bytes)}', durationSec: 4 };`); };
  const B = id => BATCH.find(s => s.id === id);
  const bfile = (id, name, bytes) => fileOf(bytes || B(id).bytes, 4, name || id + '.mp3');
  const stateOf = (c, id) => (c.F.S.get('songFiles/' + id) || {}).state;
  const idle = async c => { for(let i = 0; i < 3000 && c.run('teacherSfBusy'); i++) await new Promise(r => setTimeout(r, 2)); await settle(); };
  const zoneT = { closest: sel => sel === '[data-tsf-drop]' ? zoneT : null };
  const dropEv = (files, folders = 0) => {
    const items = files.map(f => ({ kind: 'file', webkitGetAsEntry: () => ({ isDirectory: false }), getAsFile: () => f }))
      .concat(Array.from({ length: folders }, () => ({ kind: 'file', webkitGetAsEntry: () => ({ isDirectory: true }), getAsFile: () => ({ name: 'folder', size: 0 }) })));
    const ev = { prevented: 0, target: zoneT, dataTransfer: { types: ['Files'], items, files }, preventDefault(){ ev.prevented++; } };
    return ev;
  };
  const drop = (c, ev) => { for(const fn of c.block.listeners.drop || []) fn(ev); return ev; };
  const idsWritten = c => c.F.st.writes.map(w => w.path.split('/')[1]).filter((x, i, a) => i === 0 || x !== a[i - 1]).join(',');
  const refusedLis = c => (c.block._html.match(/<li>[^<]*<\/li>/g) || []);

  /* batch: 3 good files, picked in the file box (multiple) */
  c = makeConsole(consoleSrc); register(c); regBatch(c);
  await managed(c);
  c.run('teacherSfOpen = true; teacherSfPaint()');
  {
    ok(/<input type="file"[^>]*\smultiple\s[^>]*data-tsf-file/.test(c.block._html) && /data-tsf-drop/.test(c.block._html), 'batch: the file box takes many files (multiple) and sits in a drop zone');
    const w0 = c.env.win.length; let during = -1;
    c.F.st.hooks.push(w => { if(during < 0 && w.path === 'songFiles/bat-b') during = c.env.win.length; });
    const inp = { files: ['bat-a', 'bat-b', 'bat-c'].map(id => bfile(id)) };
    for(const fn of c.block.listeners.change || []) fn({ target: { closest: sel => sel === '[data-tsf-file]' ? inp : null } });
    await idle(c);
    ok(['bat-a', 'bat-b', 'bat-c'].every(id => stateOf(c, id) === 'ready') && idsWritten(c) === 'bat-a,bat-b,bat-c',
      `batch of 3: all 3 ready, written one file at a time, in order (${idsWritten(c)})`);
    const P = c.block.paints.join('\n');
    ok(['1 of 3: bat-a.mp3', '2 of 3: bat-b.mp3', '3 of 3: bat-c.mp3'].every(s => P.includes(s)), 'batch of 3: one progress line for the batch ("2 of 3: bat-b.mp3")');
    ok(/Uploaded 3 of 3 files\. Press Verify all to read them back\./.test(c.block._html) && !refusedLis(c).length, 'batch of 3: the end says "Uploaded 3 of 3 files" and lists no refusal');
    ok(c.F.st.pieceReads === 0 && !c.F.st.writes.some(w => w.path.startsWith('songFilesUsage/')) && c.run('teacherSfChecks.size') === 0, `batch of 3: nothing is verified for the teacher (${c.F.st.pieceReads} piece reads)`);
    ok(during === w0 + 2 && c.env.win.length === w0, `batch of 3: the off-zone drop guard is on during the batch (+${during - w0}) and gone after (${c.env.win.length - w0} left)`);
  }
  done(c);

  /* batch: a good, a not-listed (an untrusted name) and a good; then wrong bytes under a listed name */
  c = makeConsole(consoleSrc); register(c); regBatch(c);
  await managed(c);
  {
    const evil = '<img src=x onerror=alert(1)>.mp3';
    c.run('teacherSfTakeFiles')([bfile('bat-a'), fileOf(bytesOf(1234, 77), 4, evil), bfile('bat-c')], 0);
    await idle(c);
    ok(stateOf(c, 'bat-a') === 'ready' && stateOf(c, 'bat-c') === 'ready' && idsWritten(c) === 'bat-a,bat-c', `good, not listed, good: the two good ones go up, the other writes nothing (${idsWritten(c)})`);
    const lis = refusedLis(c);
    ok(/Uploaded 2 of 3 files\. Not uploaded: 1 \(listed below\)/.test(c.block._html) && lis.length === 1 && lis[0].includes('&lt;img src=x onerror=alert(1)&gt;.mp3: not on the site'),
      `good, not listed, good: the end says 2 of 3 and names the refused file and why (${JSON.stringify(lis[0] || '')})`);
    ok(!c.block.paints.some(p => /<img/i.test(p)), 'good, not listed, good: the dropped file\'s name is drawn as text in every paint');
    const alt = Uint8Array.from(B('bat-b').bytes); alt[3] ^= 1;
    c.run('teacherSfTakeFiles')([bfile('bat-b', 'bat-b.mp3', alt), bfile('bat-d')], 0);
    await idle(c);
    const l2 = refusedLis(c);
    ok(!c.F.S.has('songFiles/bat-b') && stateOf(c, 'bat-d') === 'ready' && l2.length === 1 && /^<li>bat-b\.mp3: wrong bytes: the list has bat-b /.test(l2[0]) && /Uploaded 1 of 2 files/.test(c.block._html),
      `wrong bytes under a listed name: refused as "wrong bytes", the next file still goes up (${JSON.stringify((l2[0] || '').slice(0, 60))})`);
  }
  done(c);

  /* batch: a failure in the middle */
  c = makeConsole(consoleSrc); register(c); regBatch(c);
  await managed(c);
  {
    c.F.st.failWrite = path => path === 'songFiles/bat-b/pieces/0';
    c.run('teacherSfTakeFiles')(['bat-a', 'bat-b', 'bat-c'].map(id => bfile(id)), 0);
    await idle(c);
    const lis = refusedLis(c);
    ok(stateOf(c, 'bat-a') === 'ready' && stateOf(c, 'bat-b') === 'uploading' && stateOf(c, 'bat-c') === 'ready', `failure in the middle: the files after it still go up; the failed one stays "uploading" (${['bat-a', 'bat-b', 'bat-c'].map(id => stateOf(c, id)).join(', ')})`);
    ok(/Uploaded 2 of 3 files/.test(c.block._html) && lis.length === 1 && /bat-b\.mp3: bat-b failed at piece 1 of 1: a connection problem \(unavailable\)\. It is NOT ready/.test(lis[0]),
      `failure in the middle: the end names it as a connection problem (${JSON.stringify(lis[0] || '')})`);
  }
  done(c);

  /* batch: a second drop while the first runs */
  c = makeConsole(consoleSrc); register(c); regBatch(c);
  await managed(c);
  {
    const e1 = drop(c, dropEv(['bat-a', 'bat-b', 'bat-c'].map(id => bfile(id))));
    await settle(3);
    const busy = c.run('teacherSfBusy');
    const e2 = drop(c, dropEv([bfile('bat-d'), bfile('bat-a', 'again.mp3')]));
    const said = /One batch at a time: the files you just dropped were not taken/.test(c.block._html);
    await idle(c);
    ok(busy === 'upload' && said && e1.prevented > 0 && e2.prevented > 0, `second drop during a batch: refused with a line (busy "${busy}", the line ${said ? 'shown' : 'missing'})`);
    ok(!c.F.st.writes.some(w => /bat-d/.test(w.path)) && ['bat-a', 'bat-b', 'bat-c'].every(id => stateOf(c, id) === 'ready') && /Uploaded 3 of 3 files/.test(c.block._html),
      'second drop during a batch: none of its files is written, and the first batch finishes whole');
  }
  done(c);

  /* batch: leaving Manage stops it */
  c = makeConsole(consoleSrc); register(c); regBatch(c);
  await managed(c);
  {
    const w0 = c.env.win.length;
    let left = false;
    c.F.st.hooks.push(w => { if(!left && w.path === 'songFiles/bat-b/pieces/0'){ left = true; c.run(`teacherView = 'students'`); } });
    drop(c, dropEv(['bat-a', 'bat-b', 'bat-c'].map(id => bfile(id))));
    await idle(c);
    ok(left && stateOf(c, 'bat-a') === 'ready' && stateOf(c, 'bat-b') === 'uploading' && !c.F.st.writes.some(w => /bat-c/.test(w.path)) && c.run('teacherSfBusy') === '',
      `leave mid-batch: writing stops at the file being written (it stays "uploading"); the rest are not tried (${idsWritten(c)})`);
    ok(c.env.win.length === w0, `leave mid-batch: the off-zone drop guard is removed (${c.env.win.length - w0} left)`);
    const n = c.F.st.writes.length;
    await c.run(`teacherView = 'manage'`); await c.run('renderTeacherManage()'); await settle();
    ok(/Stopped: you left Manage at file 2 of 3 \(bat-b\.mp3\)\. 1 of 3 went up before that/.test(c.block._html) && /bat-b is NOT ready/.test(c.block._html) && c.F.st.writes.length === n,
      'leave mid-batch: back on Manage, the section says where it stopped and that bat-b is not ready; nothing more written');
  }
  done(c);

  /* the drop zone: a folder, a file that is not .mp3, an empty drop; then all three with two .mp3 files */
  c = makeConsole(consoleSrc); register(c); regBatch(c);
  await managed(c);
  {
    const txt = { name: 'notes.txt', size: 10, type: 'text/plain', reads: 0, arrayBuffer: async () => { txt.reads++; return new ArrayBuffer(10); } };
    drop(c, dropEv([], 1)); await settle();
    ok(/<b>A folder was left out: open the folder and drop the \.mp3 files themselves\.<\/b>/.test(c.block._html) && c.F.st.writes.length === 0, 'drop: a folder gets one plain line, nothing written');
    drop(c, dropEv([txt])); await settle();
    ok(/1 file was left out because it is not \.mp3: notes\.txt\./.test(c.block._html) && txt.reads === 0 && c.F.st.writes.length === 0, `drop: a file that is not .mp3 gets one line and is not read (${txt.reads} reads)`);
    drop(c, dropEv([])); await settle();
    ok(/Nothing to upload: no files came with that drop/.test(c.block._html) && c.F.st.writes.length === 0, 'drop: 0 files gets one line');
    drop(c, dropEv([bfile('bat-a'), txt, bfile('bat-b')], 1));
    await idle(c);
    const bs = (c.block._html.match(/role="status">([\s\S]*?)<\/div>/) || [, ''])[1].match(/<b>[^<]*<\/b>/g) || [];
    ok(stateOf(c, 'bat-a') === 'ready' && stateOf(c, 'bat-b') === 'ready' && txt.reads === 0 && bs.length === 3 && /folder/.test(bs[0]) && /not \.mp3/.test(bs[1]) && /Uploaded 2 of 2 files/.test(bs[2]),
      `drop: two .mp3 files, a text file and a folder: the two go up; one line each for what was left out (${bs.length} lines)`);
  }
  done(c);

  /* ── AWAITING SWITCH (2026-11-17, private song audio step 2): a list entry the site still plays from audio/
     ("awaitingSwitch": true) uploads and verifies like any listed file; only its two plain states read differently. */
  const regAwait = c => { for(const id of ['bat-a', 'bat-b']) c.run(`SONG_FILES['${id}'].awaitingSwitch = true;`); };
  const rowHtml = (c, id) => ((c.block._html.match(/<tr>[\s\S]*?<\/tr>/g) || []).find(r => r.includes(`<td>${id}</td>`)) || '');
  const AW_NOT = /on the site as a public file; upload it, then it can be switched/;
  const AW_OK = /uploaded, matches; ready to switch \(the site still plays the public file\)/;

  /* awaiting: an upload of an awaiting entry is accepted, the head is the rules' shape, the row says so */
  c = makeConsole(consoleSrc); register(c); regBatch(c); regAwait(c);
  await managed(c);
  c.run('teacherSfOpen = true; teacherSfPaint()');
  {
    ok(AW_NOT.test(rowHtml(c, 'bat-a')) && AW_NOT.test(rowHtml(c, 'bat-b')) && /on the list, not uploaded/.test(rowHtml(c, 'bat-c')) && !AW_NOT.test(rowHtml(c, 'bat-c')),
      'awaiting: before upload, an awaiting entry reads "on the site as a public file; upload it, then it can be switched" (an ordinary one: "on the list, not uploaded")');
    c.run('teacherSfTakeFiles')([bfile('bat-a')], 0);
    await idle(c);
    const h = c.F.S.get('songFiles/bat-a') || {};
    ok(h.state === 'ready' && h.bytes === B('bat-a').bytes.length && h.sha256 === sha(B('bat-a').bytes) && !('awaitingSwitch' in h) && c.F.st.violations.length === 0 && c.F.st.writes.every(w => w.path.startsWith('songFiles/bat-a')),
      `awaiting: an upload of an awaiting entry is accepted, ready, its head in the rules' shape (no awaitingSwitch in it; ${c.F.st.violations.length} violations)`);
    ok(AW_OK.test(rowHtml(c, 'bat-a')) && AW_NOT.test(rowHtml(c, 'bat-b')), 'awaiting: uploaded, the row reads "uploaded, matches; ready to switch (the site still plays the public file)"');
  }
  done(c);

  /* awaiting: a file that is not on the list is refused with awaiting entries on it, and writes nothing */
  c = makeConsole(consoleSrc); register(c); regBatch(c); regAwait(c);
  await managed(c);
  {
    const near = Uint8Array.from(B('bat-a').bytes); near[10] ^= 1;
    c.run('teacherSfTakeFiles')([fileOf(bytesOf(1777, 91), 4, 'stranger.mp3'), bfile('bat-a', 'bat-a.mp3', near)], 0);
    await idle(c);
    const lis = refusedLis(c);
    ok(c.F.st.writes.length === 0 && lis.length === 2 && /stranger\.mp3: not on the site/.test(lis[0]) && /bat-a\.mp3: wrong bytes/.test(lis[1]) && AW_NOT.test(rowHtml(c, 'bat-a')),
      `awaiting: a file not on the list, and an awaiting entry's name with one byte changed, are refused and write nothing (${c.F.st.writes.length} writes, ${lis.length} refusals)`);
  }
  done(c);

  /* awaiting: Verify all over awaiting-uploaded, awaiting-not-uploaded and an ordinary entry */
  c = makeConsole(consoleSrc); register(c); regBatch(c); regAwait(c);
  await managed(c);
  c.run('teacherSfOpen = true; teacherSfPaint()');
  {
    c.run('teacherSfTakeFiles')([bfile('bat-a'), bfile('bat-c')], 0);
    await idle(c);
    const pr0 = c.F.st.pieceReads;
    await c.run('teacherSfVerifyAll')(); await settle();
    const ck = id => c.run(`teacherSfChecks.get(${JSON.stringify(id)})`) || null;
    ok(ck('bat-a') && ck('bat-a').ok === true && ck('bat-c') && ck('bat-c').ok === true && !ck('bat-b') && c.F.st.pieceReads - pr0 === 2,
      `verify all, mixed: the uploaded awaiting entry and the uploaded ordinary one read back whole, the awaiting one not uploaded is not read (${c.F.st.pieceReads - pr0} piece reads)`);
    ok(/Verified 2 of 2/.test(c.block._html) && AW_OK.test(rowHtml(c, 'bat-a')) && /✓/.test(rowHtml(c, 'bat-a')) && AW_NOT.test(rowHtml(c, 'bat-b')) && /on the list, uploaded, matches/.test(rowHtml(c, 'bat-c')),
      'verify all, mixed: "Verified 2 of 2"; bat-a ✓ and ready to switch, bat-b still to upload, the ordinary bat-c "on the list, uploaded, matches"');
  }
  done(c);

  /* ── Manage → Built songs: Import (teacher-builtsongs.js, Song builder Part a2) ── */
  const BID = FIXTURES.fourFour.id, BAID = audioIdFor(BID, SONG_SHA);
  const bdoc = (() => { const d = withAudio(FIXTURES.fourFour.doc, SONG_BYTES, SONG_SHA, 125.5); d.audio.id = BAID; d.audio.gainDb = 2.5; return d; })();
  const jsonOf = (obj, raw) => { const t = raw != null ? raw : JSON.stringify(obj); return { name: 'song.json', size: t.length, text: async () => t }; };
  const importNow = async (c, j, m) => { await c.run('teacherBsImport')(j, m); await settle(150); };

  /* hook */
  c = makeConsole(consoleSrc); register(c);
  await managed(c);
  {
    ok(c.grid._html.includes('id="t-builtsongs-block"') && /Built songs/.test(c.bblock._html), 'built: Manage draws the <div id="t-builtsongs-block"> slot and paints the section');
    const src = c.run('renderTeacherManage.toString()');
    const nSf = (src.match(/teacherSongFilesMount\(\)/g) || []).length, nBs = (src.match(/teacherBuiltSongsMount\(\)/g) || []).length;
    ok(nSf >= 1 && nBs === nSf, `built: every Manage paint that mounts Song files mounts Built songs too (${nBs} of ${nSf})`);
    ok(/No built songs yet/.test(c.bblock._html) && c.F.st.writes.length === 0, 'built: an empty list says so, and opening Manage writes nothing');
    c.run(`teacherBsPicked.json = { name: 'a.json' }; teacherBsPicked.mp3 = { name: 'a.mp3' }; teacherBsPaint()`);
    ok(c.run('teacherBsPicked.json === null && teacherBsPicked.mp3 === null') && /data-tbs-act="import" disabled/.test(c.bblock._html), 'built: a repaint (its pickers drawn empty) lets go of the files picked before it, and Import is off');
  }
  done(c);

  /* import: the audio, the song, the list, in that order, each in the rules' shape */
  c = makeConsole(consoleSrc); register(c);
  await managed(c);
  {
    await importNow(c, jsonOf(importFile(BID, bdoc)), fileOf(SONG, 125.5));
    const w = c.F.st.writes, paths = w.map(x => x.path);
    const iSong = paths.indexOf('builtSongs/' + BID), iList = paths.indexOf('builtSongsMeta/list'), iReady = paths.lastIndexOf('songFiles/' + BAID);
    ok(iSong > 0 && iList > iSong && iReady >= 0 && iReady < iSong && (c.F.S.get('songFiles/' + BAID) || {}).state === 'ready' && [0, 1, 2].every(k => c.F.S.has(`songFiles/${BAID}/pieces/${k}`)),
      `import: the audio (3 pieces, ready) first, then builtSongs/${BID}, then the list (${w.length} writes)`);
    const d = c.F.S.get('builtSongs/' + BID) || {};
    ok(JSON.stringify(d.song) === JSON.stringify(bdoc.song) && JSON.stringify(d.audio) === JSON.stringify(bdoc.audio) && d.title === bdoc.title && d.v === 1, 'import: the song doc holds the file\'s chart and audio entry unchanged');
    const __l1 = (c.F.S.get('builtSongsMeta/list') || {}).songs || {}; const __fresh = (v, prev) => Number.isInteger(v) && v > (prev || 0) && v >= Math.floor((Date.now() - Date.UTC(2026, 0, 1)) / 1000) - 600 && v <= 1e9; ok(Object.keys(__l1).join() === BID && __fresh(__l1[BID], 0), 'import: the list names the song at a new edit number (from the clock, teacherBsNextVer)');
    ok(/Imported (&quot;|")Test Song Four(&quot;|") \(edit of /.test(c.bblock._html), 'import: the section says it was imported, with the time of the edit');
    // again: the same id replaces the song; the audio already stored and matching is not uploaded again; another song on the list is kept
    c.F.S.set('builtSongsMeta/list', { songs: { [BID]: 1, 'sb-othersong1': 4, 'BAD KEY': 2, 'sb-badvalue1': 'x' }, updatedAt: TS });
    const n0 = c.F.st.writes.length;
    const again = JSON.parse(JSON.stringify(bdoc)); again.title = 'Test Song Four, fixed';
    await importNow(c, jsonOf(importFile(BID, again)), fileOf(SONG, 125.5));
    const w2 = c.F.st.writes.slice(n0);
    ok(!w2.some(x => /^songFiles\//.test(x.path)) && (c.F.S.get('builtSongs/' + BID) || {}).title === 'Test Song Four, fixed', `import again: the song is replaced and the stored audio is not uploaded again (${w2.length} writes)`);
    { const __l2 = (c.F.S.get('builtSongsMeta/list') || {}).songs || {}; ok(Object.keys(__l2).sort().join() === [BID, 'sb-othersong1'].sort().join() && (v => Number.isInteger(v) && v > 1 && v >= Math.floor((Date.now() - Date.UTC(2026, 0, 1)) / 1000) - 600)(__l2[BID]) && __l2['sb-othersong1'] === 4, 'import again: a newer edit number; another song on the list is kept; a key or a value the page would refuse is dropped'); }
  }
  done(c);

  /* refusals: nothing written, one line */
  {
    const cases = [
      ['not JSON', () => jsonOf(null, '{ not json'), SONG, 125.5],
      ['a field a song does not take', () => jsonOf(Object.assign(importFile(BID, bdoc), { extra: 1 })), SONG, 125.5],
      ['centsOff 11 (the validator)', () => { const d = JSON.parse(JSON.stringify(bdoc)); d.audio.centsOff = 11; return jsonOf(importFile(BID, d)); }, SONG, 125.5],
      ['a section gap (the validator)', () => { const d = JSON.parse(JSON.stringify(bdoc)); d.song.sections[1].from = 6; return jsonOf(importFile(BID, d)); }, SONG, 125.5],
      ['an .mp3 of another size', () => jsonOf(importFile(BID, bdoc)), OTHER, 125.5],
      ['an .mp3 of the right size with other bytes', () => jsonOf(importFile(BID, bdoc)), (() => { const b = Uint8Array.from(SONG); b[5] ^= 1; return b; })(), 125.5],
      ['an .mp3 whose length is 2 s off', () => jsonOf(importFile(BID, bdoc)), SONG, 127.5],
      ['an audio id on SONG_FILES', () => { const d = JSON.parse(JSON.stringify(bdoc)); d.audio.id = 'test-song'; return jsonOf(importFile(BID, d)); }, SONG, 125.5],
    ];
    for(const [name, mk, bytes, dur] of cases){
      c = makeConsole(consoleSrc); register(c);
      await managed(c);
      const mp3 = fileOf(bytes, dur);
      await importNow(c, mk(), mp3);
      const note = (c.bblock._html.match(/<b>([^<]*)<\/b>/) || [, ''])[1];
      // A file of the wrong size is refused before it is even read (the size is on the file's entry).
      if(bytes.length !== SONG_BYTES) ok(mp3.reads === 0, `import refused (${name}): the .mp3 is not read (${mp3.reads} reads)`);
      ok(c.F.st.writes.length === 0 && /^Nothing was imported: /.test(note) && !/<br>/.test((c.bblock._html.match(/role="status">([\s\S]*?)<\/div>/) || [, ''])[1]), `import refused (${name}): nothing written, one line (${c.F.st.writes.length} writes; ${JSON.stringify(note.slice(0, 70))})`);
      done(c);
    }
  }

  /* another built song's audio id with other bytes; one import at a time; leaving Manage stops it */
  c = makeConsole(consoleSrc); register(c);
  c.F.S.set('builtSongsMeta/list', { songs: { 'sb-firstsong1': 1 }, updatedAt: TS });
  c.F.S.set('builtSongs/sb-firstsong1', Object.assign(JSON.parse(JSON.stringify(bdoc)), { audio: Object.assign({}, bdoc.audio, { sha256: 'd'.repeat(64) }), savedAt: TS }));
  await managed(c); await c.run('teacherBsLoad()'); await settle(60);
  {
    await importNow(c, jsonOf(importFile(BID, bdoc)), fileOf(SONG, 125.5));
    ok(c.F.st.writes.length === 0 && /already sb-firstsong1&#39;s|already sb-firstsong1's/.test(c.bblock._html), `import refused: its audio id is another built song's with other bytes (${c.F.st.writes.length} writes)`);
  }
  done(c);
  c = makeConsole(consoleSrc); register(c);
  await managed(c);
  {
    const p1 = c.run('teacherBsImport')(jsonOf(importFile(BID, bdoc)), fileOf(SONG, 125.5));
    await settle(2);
    const other = JSON.parse(JSON.stringify(bdoc)); other.title = 'Second import';
    await c.run('teacherBsImport')(jsonOf(importFile('sb-secondimport', other)), fileOf(SONG, 125.5));
    await p1; await settle(150);
    ok(!c.F.S.has('builtSongs/sb-secondimport') && c.F.S.has('builtSongs/' + BID), 'one import at a time: a second Import during the first writes nothing');
  }
  done(c);
  c = makeConsole(consoleSrc); register(c);
  await managed(c);
  {
    let left = false;
    c.F.st.hooks.push(w => { if(!left && w.path === `songFiles/${BAID}/pieces/0`){ left = true; c.run(`teacherView = 'students'`); } });
    await importNow(c, jsonOf(importFile(BID, bdoc)), fileOf(SONG, 125.5));
    ok(left && !c.F.S.has('builtSongs/' + BID) && !c.F.S.has('builtSongsMeta/list') && (c.F.S.get('songFiles/' + BAID) || {}).state === 'uploading', 'leave mid-import: writing stops; the song and the list are not written; the audio stays not ready');
  }
  done(c);

  /* Before the BUILT SONGS rules are published (review R1-4): the list's read is refused. Delete works as on main;
     Import is refused up front and writes nothing. Any other failure of that read still stops a Delete. */
  c = makeConsole(consoleSrc); register(c); seedOther(c);
  c.F.st.failRead['builtSongsMeta/list'] = 'permission-denied';
  await uploaded(c);
  {
    await c.run('teacherBsLoad()'); await settle(60);
    const n0 = c.F.st.writes.length;
    await importNow(c, jsonOf(importFile(BID, bdoc)), fileOf(SONG, 125.5));
    const note = (c.bblock._html.match(/<b>(Nothing was imported:[^<]*)<\/b>/) || [, ''])[1];
    ok(c.F.st.writes.length === n0 && /^Nothing was imported: built songs are not switched on yet/.test(note), `before the rules: Import is refused up front, nothing written (${c.F.st.writes.length - n0} writes; ${JSON.stringify(note.slice(0, 60))})`);
    c.env.promptAnswer = 'test-song';
    await c.run('teacherSfDelete')('test-song'); await settle(150);
    ok(!c.F.S.has('songFiles/test-song') && c.F.S.has('songFiles/other-song'), 'before the rules: a refused read of the built-songs list counts as none, and Delete deletes as on main');
    c.F.st.failRead['builtSongsMeta/list'] = 'unavailable';
    const n1 = c.F.st.writes.length;
    c.env.promptAnswer = 'other-song';
    await c.run('teacherSfDelete')('other-song'); await settle(150);
    ok(c.F.st.writes.length === n1 && c.F.S.has('songFiles/other-song') && /could not check whether a built song plays other-song/.test(c.block._html), 'a list read that FAILS (not refused) still stops a Delete, which says so');
  }
  done(c);
  /* An Import that begins while Delete reads the list stops the Delete (review R1-5). */
  c = makeConsole(consoleSrc); register(c); seedOther(c);
  await uploaded(c);
  {
    c.env.promptAnswer = 'test-song'; c.env.prompts.length = 0;
    const n0 = c.F.st.writes.length;
    const pd = c.run('teacherSfDelete')('test-song');
    c.run(`teacherBsBusy = 'import'`);
    await pd; await settle(150);
    c.run(`teacherBsBusy = ''`);
    ok(c.F.st.writes.length === n0 && c.F.S.has('songFiles/test-song') && c.env.prompts.length === 0, `an Import that starts during Delete's check stops the Delete before it asks (${c.F.st.writes.length - n0} writes, ${c.env.prompts.length} prompts)`);
  }
  done(c);

  /* Song files: a built song's audio is named, and its Delete is refused */
  c = makeConsole(consoleSrc); register(c);
  await managed(c);
  await importNow(c, jsonOf(importFile(BID, Object.assign(JSON.parse(JSON.stringify(bdoc)), { title: 'Test <b>bold</b> & co' }))), fileOf(SONG, 125.5));
  {
    await c.run('teacherSfLoad()'); await c.run('teacherBsLoad()'); await settle(80);
    c.run('teacherSfOpen = true; teacherSfPaint()');
    const row = c.block._html.split('<tr').find(r => r.includes(`<td>${BAID}</td>`)) || '';
    ok(/Built song: Test &lt;b&gt;bold&lt;\/b&gt; &amp; co/.test(row) && !/not on the list/.test(row), 'song files: a built song\'s audio reads "Built song: <title>", escaped, not "not on the list"');
    ok(/Test &lt;b&gt;bold&lt;\/b&gt; &amp; co/.test(c.bblock._html) && !/<b>bold/.test(c.bblock._html) && /✓ passes today/.test(c.bblock._html), 'built: the list row is escaped and says the song passes today\'s checks');
    const n0 = c.F.st.writes.length;
    c.env.promptAnswer = BAID;
    await c.run('teacherSfDelete')(BAID); await settle(150);
    ok(c.F.st.writes.length === n0 && c.F.S.has('songFiles/' + BAID) && /Nothing was deleted: the built song &quot;Test &lt;b&gt;bold|Nothing was deleted: the built song "Test &lt;b&gt;bold/.test(c.block._html), `song files: Delete of a built song's audio is refused and names the song (${c.F.st.writes.length - n0} writes)`);
    c.F.S.set('builtSongsMeta/list', { songs: {}, updatedAt: TS });
    await c.run('teacherSfDelete')(BAID); await settle(150);
    ok(!c.F.S.has('songFiles/' + BAID), 'song files: once no song on the list uses it, the typed id deletes it');
    c.F.S.set('builtSongs/sb-brokenstore', { v: 1, title: 'Test broken', artist: '', audio: Object.assign({}, bdoc.audio, { centsOff: 30 }), song: bdoc.song, savedAt: TS });
    c.F.S.set('builtSongsMeta/list', { songs: { 'sb-brokenstore': 1 }, updatedAt: TS });
    await c.run('teacherBsLoad()'); await settle(80);
    ok(/✗ audio\.centsOff is 30/.test(c.bblock._html), 'built: a stored song the validator refuses shows ✗ and its first reason');
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
const partOk = order && !sw.includes('teacher-songfiles.js') && parts.includes('teacher-builtsongs.js') && !sw.includes('teacher-builtsongs.js');
if(!partOk) console.log(`  ✗ part: teacher-songfiles.js must load after teacher-songrequests.js (${order}) and stay out of sw.js (${!sw.includes('teacher-songfiles.js')}); teacher-builtsongs.js must be a console part (${parts.includes('teacher-builtsongs.js')}) and stay out of sw.js (${!sw.includes('teacher-builtsongs.js')})`);
const cases = res.cases + 1, failed = res.fails + (partOk ? 0 : 1);
console.log(`song-files-console-sim: ${cases} cases, ${failed} failed`);

if(BREAKS){
  const MUT = [
    ['Delete does not look again for an Import after its check', "    if(teacherSfOtherBusy()) return;   // an Import or another action began during the read (review R1-5)\n", ""],
    ['a built song\'s audio deleted anyway', "    if(users.length){ teacherSfNote", "    if(false){ teacherSfNote"],
    ['a built song\'s audio drawn as stray', "  return teacherSfOnList(id) ? (teacherSfAwaiting(id) ? 'awaitMatch' : 'match') : 'built';", "  return teacherSfOnList(id) ? (teacherSfAwaiting(id) ? 'awaitMatch' : 'match') : 'stray';"],
    ['no list match: any file uploads as the first entry', "return Object.keys(list).find(id => list[id] && list[id].sha256 === sha && list[id].bytes === bytes) || null;", "return Object.keys(list)[0] || null;"],
    ['no size cap before reading', 'if(size > TEACHER_SF_MAX_BYTES) return {', 'if(false) return {'],
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
    // W21 (2026-11-17): many files at once and the drop zone
    ['the file box takes only its first file', "teacherSfTakeFiles(Array.from(inp.files || []), 0);", "const f = inp.files && inp.files[0]; if(f) teacherSfUpload(f);"],
    ['a batch stops at the first refused file', "else refused.push(`${name}: ${r.why}`);", "else { refused.push(`${name}: ${r.why}`); break; }"],
    ['a batch writes its files all at once', "const r = await teacherSfUploadOne(files[i],", "const r = teacherSfUploadOne(files[i],"],
    ['the progress line without the count', "const head = `${i + 1} of ${N}: ${name}`;", "const head = name;"],
    ['a second drop during a batch gets no line', "  if(teacherSfBusy){\n    teacherSfNote = teacherSfBusy === 'upload'", "  if(false){\n    teacherSfNote = teacherSfBusy === 'upload'"],
    ['leaving Manage does not stop the batch', "if(r.stop){ stopAt = i; stop = r; break; }", "if(r.stop){ continue; }"],
    ['the off-zone drop guard left on', "  }finally{\n    teacherSfWindowGuard(false);\n  }", "  }finally{\n  }"],
    ['a refused file\'s name drawn unescaped', "`<li>${escHtml(l)}</li>`", "`<li>${l}</li>`"],
    ['the batch verifies on its own', "  teacherSfEnd(lines.join('\\n'));\n}", "  teacherSfEnd(lines.join('\\n')); teacherSfVerifyAll();\n}"],
    ['a file that is not .mp3 is taken', "const mp3 = files.filter(teacherSfIsMp3),", "const mp3 = files.slice(),"],
    ['a folder is not named', "if(folders) pre.push(", "if(false) pre.push("],
    ['wrong bytes reported as not on the list', "why: near ? `wrong bytes:", "why: false ? `wrong bytes:"],
    // AWAITING SWITCH (2026-11-17)
    ['an awaiting entry drawn as an ordinary one before upload', "if(!h) return teacherSfAwaiting(id) ? 'awaitNotUp' : 'notUp';", "if(!h) return 'notUp';"],
    ['an awaiting entry drawn as an ordinary one once uploaded', "(teacherSfAwaiting(id) ? 'awaitMatch' : 'match')", "'match'"],
    ['every entry drawn as awaiting', "SONG_FILES[id].awaitingSwitch === true; }", "true; }"],
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
  /* Manage → Built songs (teacher-builtsongs.js): each fault must turn a case red too. */
  const BS = partSrc.get('teacher-builtsongs.js') || '';
  const BMUT = [
    ['Import without the validator', "  const why = builtSongCheck(id, doc);\n  if(why.length){", "  const why = [];\n  if(why.length){"],
    ['Import without the SHA-256 check', "if(sha !== a.sha256){ teacherBsEnd(", "if(false){ teacherBsEnd("],
    ['Import without the size check', "if(mp3File.size !== a.bytes){", "if(false){"],
    ['Import without the length check', "if(dur == null || Math.abs(dur - a.durationSec) > 0.5){", "if(dur == null){"],
    ['an audio id on SONG_FILES imported', "if(typeof SONG_FILES !== 'undefined' && Object.prototype.hasOwnProperty.call(SONG_FILES, a.id)){ teacherBsRefuse(", "if(false){ teacherBsRefuse("],
    ['another song\'s audio id taken', "if(oid !== id && o.doc && o.doc.audio && o.doc.audio.id === a.id && o.doc.audio.sha256 !== a.sha256){ teacherBsRefuse(", "if(false){ teacherBsRefuse("],
    ['the list written before the song', "    step = 'song';", "    step = 'song'; await db.collection('builtSongsMeta').doc('list').set({ songs: { [id]: 1 }, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });"],
    ['the edit number not raised', "ver = (songs[id] || 0) + 1;", "ver = 1;"],
    ['other songs dropped from the list', "      songs[id] = ver;\n      tx.set(ref, { songs,", "      tx.set(ref, { songs: { [id]: ver },"],
    ['the audio uploaded again when it is stored', "if(!teacherSfHeadMatches(h, entry)) await teacherSfPutFile(", "await teacherSfPutFile("],
    ['leaving Manage does not stop the import', "  const stopped = () => teacherView !== 'manage';\n  const w = { stopped, wrote: false, k: -1, n: 0, progress: line => { teacherBsProgress", "  const stopped = () => false;\n  const w = { stopped, wrote: false, k: -1, n: 0, progress: line => { teacherBsProgress"],
    ['two imports at once', "  if(teacherBsBusy || !jsonFile || !mp3File) return;", "  if(!jsonFile || !mp3File) return;"],
    ['a title drawn unescaped', "<td>${escHtml(String(d.title == null ? '—' : d.title))}</td>", "<td>${String(d.title == null ? '—' : d.title)}</td>"],
    ['Import before the rules are published', "  if(teacherBsDenied){ teacherBsRefuse(", "  if(false){ teacherBsRefuse("],
    ['a refused list read stops every Delete', "  catch(e){ if(e && e.code === 'permission-denied') return []; throw e; }", "  catch(e){ throw e; }"],
    ['a repaint keeps files the pickers no longer show', "  if(!teacherBsBusy) teacherBsPicked.json = teacherBsPicked.mp3 = null;\n", ""],
    ['the stored song not checked in the list', "  const why = builtSongCheck(id, s.doc);", "  const why = [];"],
  ];
  const bsWith = src => parts.map(p => p === 'teacher-builtsongs.js' ? src : partSrc.get(p)).join('');
  let bcaught = 0;
  for(const [name, from, to] of BMUT){
    const n = BS.split(from).length - 1;
    if(n !== 1){ console.log(`  ✗ break "${name}": its text is in teacher-builtsongs.js ${n} times (must be once)`); continue; }
    let r;
    try { r = await runCases(bsWith(BS.replace(from, to))); } catch(e){ r = { fails: 1, lines: ['  (threw: ' + (e && e.message) + ')'] }; }
    if(r.fails > 0){ bcaught++; console.log(`  ✓ break caught: ${name} (${r.fails} red)`); }
    else console.log(`  ✗ break NOT caught: ${name}`);
  }
  const all = MUT.length + BMUT.length, got = caught + bcaught;
  console.log(`${got === all ? '✓' : '✗'} ${got} of ${all} breaks caught (${caught} of ${MUT.length} in teacher-songfiles.js, ${bcaught} of ${BMUT.length} in teacher-builtsongs.js)`);
  if(got !== all) process.exit(1);
}
process.exit(failed ? 1 : 0);
