#!/usr/bin/env node
/* song-builder-sim.mjs — the Song builder's drafts (teacher-sb-core.js, Song builder Part b, 2026-11-15), RUN in Node
   against a stub Firestore that checks every write against firestore.rules. checks.mjs pins its case count.

     node tools/song-builder-sim.mjs            every case; exit 0 = all held, 1 = a ✗ line
     node tools/song-builder-sim.mjs --verbose  print every case, not only the failures
     node tools/song-builder-sim.mjs --root DIR another site folder

   WHAT IS REAL. The whole console script (siteParts('teacher.js'): every teacher-*.js part, in load order, so the Song
   files writer teacherSfPutFile and teacherBsAudioUsers are the real ones), app/songfiles.js and app/builtsongs.js,
   with the site's own escHtml / escAttr lines from app/boot.js, in one vm context. Every draft action is the real
   function: sbPickFile, sbSaveUpload, sbRunLevel, sbOpen, sbBeatFromBpm, sbDeleteDraft, sbLoadLevel.
   STUBBED: the browser's decoder and the encoder (sbDecode returns a made-up 440 Hz tone of the file's length;
   sbLevel returns made-up bytes behind a real 192k frame header: the sound itself is tools/sb-dsp-test.mjs's job),
   Firestore, the page (painting runs; its elements are inert), prompt and confirm. Made-up data only ("Test 0"); no network.

   THE RULES CHECK (written out again here, never read from the code under test): songDrafts/{id} only with an id
   ^sb-[a-z0-9]{8,24}$ (the rules check nothing else of a draft; the sim also pins the draft's own fields and that
   its audio has the builtSongs audio shape, centsOff aside: an over-10-cents draft is allowed, it cannot publish);
   songFiles/{id} heads and pieces as firestore.rules "SONG FILES"; songFilesUsage/{month} only bytes. Any other
   path written (config/class, progress/…, builtSongs, builtSongsMeta) is a violation; every case counts them.
   The stub database is the one tools/song-files-console-sim.mjs uses, cut to these paths. */
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
const read = f => readFileSync(join(ROOT, f), 'utf8');
const sha = b => createHash('sha256').update(b).digest('hex');
const tick = () => new Promise(r => setImmediate(r));
const settle = async (n = 60) => { for(let i = 0; i < n; i++) await tick(); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* Made-up bytes behind a real MPEG-1 layer III frame header (192 kb/s, 44.1 kHz, stereo): sbMp3Info reads it. */
function mp3Of(n, seed){
  const b = new Uint8Array(n); let x = seed >>> 0 || 1;
  for(let i = 0; i < n; i++){ x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; b[i] = x & 255; }
  b.set([0xff, 0xfb, 0xb0, 0x04], 0);
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
const DRAFT_KEYS = 'artist,audio,beat,pitch,savedAt,source,step,title,v,volume';
function rulesCheck(op, path, data){
  const p = path.split('/');
  if(op === 'delete') return (p[0] === 'songDrafts' && p.length === 2) || (p[0] === 'songFiles' && (p.length === 2 || (p.length === 4 && p[2] === 'pieces'))) ? '' : 'delete outside the builder\'s paths: ' + path;
  const keys = Object.keys(data || {}).sort().join(',');
  if(p[0] === 'songDrafts' && p.length === 2){
    if(!/^sb-[a-z0-9]{8,24}$/.test(p[1])) return 'draft id ' + p[1];
    return '';
  }
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
  return 'write outside the builder\'s paths: ' + path;
}
function makeDb(){
  const S = new Map();
  const st = { writes: [], violations: [], reads: [], failWrite: null };
  const apply = (op, path, data, opts) => {
    let next;
    if(op === 'delete') next = undefined;
    else if(opts && opts.merge){
      next = clone(S.get(path) || {});
      for(const k of Object.keys(data)) next[k] = isInc(data[k]) ? (Number(next[k]) || 0) + data[k].__inc : clone(data[k]);
    } else next = clone(data);
    const why = rulesCheck(op, path, next);
    if(why) st.violations.push(why);
    st.writes.push({ op, path, data: next });
    if(op === 'delete') S.delete(path); else S.set(path, next);
  };
  const snapOf = path => { const d = S.get(path); return { id: path.split('/').pop(), exists: d !== undefined, data: () => d === undefined ? undefined : clone(d), ref: docRef(path) }; };
  function docRef(path){
    return { path, id: path.split('/').pop(), collection: n => collRef(path + '/' + n),
      async get(){ st.reads.push(path); await tick(); return snapOf(path); },
      async set(d, o){ await tick(); if(st.failWrite && st.failWrite(path)){ const e = new Error('unavailable'); e.code = 'unavailable'; throw e; } apply('set', path, d, o); },
      async delete(){ await tick(); apply('delete', path); } };
  }
  function collRef(path){
    const q = { doc: id => docRef(path + '/' + id), orderBy: () => q, limit: () => q, where: () => q,
      async get(){ st.reads.push(path); const docs = [...S.keys()].filter(k => k.startsWith(path + '/') && k.slice(path.length + 1).indexOf('/') < 0).sort().map(snapOf); await tick();
        return { docs, empty: !docs.length, size: docs.length, forEach: f => docs.forEach(f) }; } };
    return q;
  }
  const db = { collection: n => collRef(n),
    batch(){ const ops = []; return { set: (r, d, o) => ops.push(['set', r.path, d, o]), update: (r, d) => ops.push(['set', r.path, d, { merge: true }]), delete: r => ops.push(['delete', r.path]),
      async commit(){ await tick(); for(const o of ops) if(o[0] !== 'delete' || S.has(o[1])) apply(o[0], o[1], o[2], o[3]); } }; },
    runTransaction: async fn => fn({ get: r => r.get(), set: (r, d, o) => r.set(d, o), update: (r, d) => r.set(d, { merge: true }) }) };
  return { S, st, db };
}

/* ── one console in a vm (a fresh one = a reload; pass the store to keep it) ── */
function makeConsole(consoleSrc, F){
  F = F || makeDb();
  const inert = () => ({ addEventListener() {}, removeEventListener() {}, querySelector: () => null, querySelectorAll: () => [], classList: { toggle() {}, add() {}, remove() {} }, style: {}, dataset: {} });
  const grid = Object.assign(inert(), { id: 't-grid-container', _html: '', paints: 0, querySelector: () => inert() });
  Object.defineProperty(grid, 'innerHTML', { get(){ return this._html; }, set(v){ this._html = String(v); this.paints++; } });
  const env = { promptAnswer: null, prompts: [], confirmAnswer: true, confirms: [] };
  const box = {
    console: { log() {}, warn() {}, error() {} }, setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {},
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, sessionStorage: { getItem: () => null, setItem() {} },
    navigator: {}, location: { hash: '', search: '', href: 'http://sim/index.html' }, addEventListener() {}, removeEventListener() {}, crypto: globalThis.crypto, Blob,
    Audio: class { addEventListener() {} pause() {} load() {} removeAttribute() {} play(){ return Promise.resolve(); } },
    URL: { createObjectURL: () => 'blob:sim', revokeObjectURL() {} },
    document: { getElementById: id => id === 't-grid-container' ? grid : null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, removeEventListener() {},
      createElement: () => inert(), body: inert(), documentElement: inert(), hidden: false },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    prompt: q => { env.prompts.push(q); return env.promptAnswer; }, confirm: q => { env.confirms.push(q); return env.confirmAnswer; }, alert() {}, scrollY: 0, scrollTo() {},
    requestAnimationFrame: () => 0, cancelAnimationFrame() {},
    firebase: { firestore: { Blob: FakeBytes, FieldValue: { serverTimestamp: () => TS, increment: n => ({ __inc: n }), delete: () => ({ __del: true }) } } },
  };
  box.window = box;
  vm.createContext(box);
  const BOOT = read('app/boot.js');
  const esc = ['escAttr', 'escHtml'].map(n => (BOOT.match(new RegExp(`^const ${n} = .*$`, 'm')) || [''])[0]).join('\n');
  vm.runInContext(esc + '\nlet db = null; let firebaseReady = true; async function ensureDb(){ return db; }\n'
    + 'const MODULE_MANIFEST = []; const CLASS_OPEN_THROUGH = 1;\nfunction __setDb(x){ db = x; }', box, { filename: 'prelude' });
  vm.runInContext(read('app/songfiles.js'), box, { filename: 'app/songfiles.js' });
  vm.runInContext(read('app/builtsongs.js'), box, { filename: 'app/builtsongs.js' });
  vm.runInContext(consoleSrc, box, { filename: 'teacher.js (all parts)' });
  vm.runInContext('__setDb', box)(F.db);
  const run = code => vm.runInContext(code, box);
  /* The browser's decoder and the encoder, stubbed (see the header). */
  box.__decode = (bytes) => { const sec = DUR.get(sha(bytes)); if(sec == null) throw { why: 'sim: no length for these bytes' }; return [tone(sec)]; };
  box.__level = async () => ({ bytes: LEVELLED.get(box.__levelNext || 'a'), gainDb: 3.21, ceilingDb: -1, before: { I: -15.71, sp: -3, tp: -2.8 }, after: { I: -12.5, sp: -1.2, tp: -1.1 }, tries: 1 });
  run('sbDecode = async (bytes, fs) => __decode(bytes, fs); sbLevel = async () => __level();');
  run("teacherView = 'songbuilder';");
  /* '+ New song' (sbClick's 'new' branch, copied: the click handler needs a real element). */
  run("function sbNewSong(){ sbStopSounds(); sbSel = 'new'; sbNew = { title: '', artist: '' }; sbStepOn = 1; sbNote = ''; sbMemFor('new'); teacherSbPaint(); }");
  return { box, F, env, run, grid };
}
const TONES = new Map();
function tone(sec){
  if(TONES.has(sec)) return TONES.get(sec);
  const fs = 44100, n = Math.round(sec * fs), x = new Float32Array(n);
  for(let i = 0; i < n; i++) x[i] = 0.3 * Math.sin(2 * Math.PI * 440 * i / fs) * (1 - 0.5 * ((i / fs * 1.6) % 1));
  TONES.set(sec, x); return x;
}
/* The made-up files: the bytes, and the length the stub decoder gives them. */
const DUR = new Map();
const fileOf = (name, bytes, sec) => { if(sec != null) DUR.set(sha(bytes), sec); return { name, size: bytes.length, type: name.endsWith('.mp3') ? 'audio/mpeg' : 'text/plain', arrayBuffer: async () => bytes.slice().buffer }; };
const SRC_A = mp3Of(400000, 3), SRC_B = mp3Of(420000, 5), SRC_C = mp3Of(300000, 9);
const LEVELLED = new Map([['a', mp3Of(1900000, 11)], ['b', mp3Of(1950000, 13)], ['c', mp3Of(800000, 17)]]);
DUR.set(sha(LEVELLED.get('a')), 24); DUR.set(sha(LEVELLED.get('b')), 24.02); DUR.set(sha(LEVELLED.get('c')), 15);

/* ── the cases ── */
async function runCases(consoleSrc){
  const out = [];
  const check = (name, ok, detail) => out.push({ name, ok: !!ok, detail: detail == null ? '' : String(detail) });
  const C = makeConsole(consoleSrc);
  const { run, F } = C;
  const writes = () => F.st.writes.length;
  const keysOf = p => [...F.S.keys()].filter(k => k.startsWith(p)).sort();
  run('renderTeacherSongBuilder()'); await settle();
  check('load: no drafts reads as an empty list, no error', run('sbDrafts instanceof Map && sbDrafts.size === 0 && sbReadErr === ""'), run('sbReadErr'));

  /* Refused before anything is saved: each writes nothing and says why in one line. */
  run("sbNewSong()"); await settle();
  const refused = [
    ['a .txt file', fileOf('notes.txt', mp3Of(1000, 1), 30), /not an mp3/],
    ['an .mp3 that is not one', fileOf('fake.mp3', new Uint8Array(5000).fill(7), 30), /not an mp3 the builder can read/],
    ['an empty .mp3', fileOf('empty.mp3', new Uint8Array(0), 30), /empty/],
    ['a song over 6:00', fileOf('long.mp3', mp3Of(9000, 21), 370), /up to 6:00/],
    ['a song under 10 s', fileOf('short.mp3', mp3Of(8000, 23), 6), /under 10 seconds/],
  ];
  for(const [what, f, re] of refused){
    const w0 = writes();
    box_set(C, '__f', f); run('sbPickFile(__f)'); await settle();
    const note = run('sbNote');
    check(`upload refused: ${what}: nothing written, one line says why`, writes() === w0 && re.test(note) && !run('sbMem.src'), note);
  }
  {
    const w0 = writes();
    run("sbNew = { title: 'Test 0', artist: 'The Test Band' }"); run('sbSaveUpload()'); await settle();
    check('upload refused: Next with no file writes nothing', writes() === w0 && /Pick the mp3 first/.test(run('sbNote')), run('sbNote'));
    box_set(C, '__f', fileOf('test-a.mp3', SRC_A, 24)); run('sbPickFile(__f)'); await settle();
    for(const [title, artist, re] of [['', 'Band', /title must be 1 to 120/], ['Song — Live', '', /cannot contain/], ['Test 0', 'A — B', /artist cannot contain/], ['x'.repeat(121), '', /1 to 120/]]){
      const w1 = writes();
      run(`sbNew = { title: ${JSON.stringify(title)}, artist: ${JSON.stringify(artist)} }`); run('sbSaveUpload()'); await settle();
      check(`upload refused: title ${JSON.stringify(title.slice(0, 12))} / artist ${JSON.stringify(artist)}: nothing written`, writes() === w1 && re.test(run('sbNote')), run('sbNote'));
    }
  }

  /* A new draft: Next saves it once, in the draft's own shape. */
  run("sbNew = { title: 'Test 0', artist: 'The Test Band' }"); run('sbSaveUpload()'); await settle();
  const id = run('sbSel');
  const dw = F.st.writes.filter(w => w.path.startsWith('songDrafts/'));
  const d0 = dw[0] && dw[0].data;
  check('new draft: Next writes songDrafts/<sb- id> once, with exactly the draft fields and the server time',
    /^sb-[a-z0-9]{12}$/.test(id) && dw.length === 1 && dw[0].path === 'songDrafts/' + id && Object.keys(d0).sort().join(',') === DRAFT_KEYS && d0.savedAt === TS && d0.v === 1 && d0.step === 2,
    dw.length + ' writes; ' + (d0 ? Object.keys(d0).sort().join(',') : 'none'));
  check('new draft: the source is the file\'s facts, not the file (no audio stored at step 1)',
    d0 && d0.source && d0.source.sha256 === sha(SRC_A) && d0.source.bytes === SRC_A.length && d0.source.durationSec === 24 && d0.source.sampleRate === 44100 && d0.source.channels === 1
    && d0.audio === null && keysOf('songFiles').length === 0, JSON.stringify(d0 && d0.source));
  check('new draft: the console opens it on step 2', run('sbStepOn') === 2 && run('sbDraft() && sbDraft().title') === 'Test 0');

  /* Volume: the levelled copy goes to songFiles first, then the draft points at it. */
  const wl = writes();
  box_set(C, '__levelNext', 'a'); run('sbRunLevel()'); await sleep(60); await settle(200);
  const lw = F.st.writes.slice(wl);
  const shaA = sha(LEVELLED.get('a')), audA = id + '-' + shaA.slice(0, 8);
  const dIdx = lw.findIndex(w => w.path === 'songDrafts/' + id), hIdx = lw.map(w => w.path).lastIndexOf('songFiles/' + audA);
  const d1 = F.S.get('songDrafts/' + id);
  check('volume: the copy is stored (head ready, 3 pieces) BEFORE the draft names it', hIdx >= 0 && dIdx > hIdx && F.S.get('songFiles/' + audA).state === 'ready' && keysOf('songFiles/' + audA + '/pieces/').length === 3,
    lw.map(w => w.path.replace(id, '<id>')).join(' → '));
  const a = d1 && d1.audio;
  check('volume: the draft\'s audio has the builtSongs shape (id <draft>-<8 hex>, bytes, sha256, length, cents, gain, source sha)',
    a && a.id === audA && a.bytes === LEVELLED.get('a').length && a.sha256 === shaA && a.durationSec === 24 && typeof a.centsOff === 'number' && Math.abs(a.centsOff) <= 10
    && a.gainDb === 3.21 && a.sourceSha256 === sha(SRC_A) && Object.keys(a).sort().join(',') === 'bytes,centsOff,durationSec,gainDb,id,sha256,sourceSha256', JSON.stringify(a));
  check('volume: the draft keeps the measurements and the pitch, step 2', d1 && d1.volume && d1.volume.after === -12.5 && d1.volume.encodes === 1 && d1.pitch && Math.abs(d1.pitch.cents) < 2 && d1.step === 2,
    JSON.stringify({ volume: d1 && d1.volume, pitch: d1 && d1.pitch }));

  /* Beat: a grid from a typed tempo is saved into the same draft (after the 1.2 s settle). */
  run('sbMem.level.E = sbOnsetEnv(sbMem.level.mono, sbMem.level.fs); sbStepOn = 3; sbBeatFromBpm(96, null);');
  await sleep(1400); await settle();
  const d2 = F.S.get('songDrafts/' + id), b = d2 && d2.beat;
  check('beat: the grid is saved in the draft (meter, bpm, bar 1, pins, step 3)', b && b.meter === '4/4' && Math.abs(b.bpm - 96) < 3 && typeof b.anchor === 'number' && Array.isArray(b.pins) && d2.step === 3 && d2.audio && d2.audio.id === audA,
    JSON.stringify(b && { meter: b.meter, bpm: b.bpm, anchor: b.anchor, pins: b.pins, step: d2.step }));

  /* A reload: a fresh console on the same store resumes the draft where it was. */
  const R = makeConsole(consoleSrc, F);
  R.run('renderTeacherSongBuilder()'); await settle();
  R.run(`sbOpen(${JSON.stringify(id)})`); await settle(200);
  check('resume: a reload lists the draft and opens it on its step, every field as saved',
    R.run('sbDrafts.size') === 1 && R.run('sbStepOn') === 3 && JSON.stringify(R.run('(({ title, artist, source, audio, beat }) => ({ title, artist, source, audio, beat }))(sbDraft())')) === JSON.stringify((({ title, artist, source, audio, beat }) => ({ title, artist, source, audio, beat }))(d2)),
    'step ' + R.run('sbStepOn'));
  check('resume: the Beat step reads the levelled copy back from songFiles (counted once)', R.run('!!(sbMem.level && sbMem.level.sha256 === sbDraft().audio.sha256)') && (F.S.get('songFiles' + 'Usage/' + R.run('songFileMonth()')) || {}).bytes > 0,
    JSON.stringify(F.S.get('songFilesUsage/' + R.run('songFileMonth()'))));

  /* A damaged copy: one try, a line that says why, and no try by itself after (each try counts a download). */
  {
    const pieceKey = keysOf('songFiles/' + audA + '/pieces/')[1];
    const keep = F.S.get(pieceKey);
    F.S.set(pieceKey, { i: keep.i, data: new FakeBytes(new Uint8Array(10)) });
    R.run('sbMem.level = null; window.__n = 0; const __c = songFileCount; songFileCount = function(){ window.__n++; return __c.apply(this, arguments); };');
    R.run('sbGoStep(3)'); await settle(200);
    for(let i = 0; i < 5; i++){ R.run('teacherSbPaint()'); await settle(60); }
    check('damaged copy: one load, the line says why, no load by itself after 5 repaints', R.run('window.__n') === 1 && /missing or damaged/.test(R.run('sbNote')) && R.run("sbBusy === ''"),
      R.run('window.__n') + ' loads; ' + R.run('sbNote'));
    R.run('sbGoStep(3)'); await settle(200);
    check('damaged copy: clicking Beat tries again (once)', R.run('window.__n') === 2, R.run('window.__n') + ' loads');
    F.S.set(pieceKey, keep);
  }

  /* A new file: levelled again; the old copy is deleted only after the draft names the new one. */
  {
    R.run(`sbStepOn = 1`);
    box_set(R, '__f', fileOf('test-b.mp3', SRC_B, 24.02)); R.run('sbPickFile(__f)'); await settle();
    check('new file, same length: the beat is kept, the draft is marked to level again', /beat is kept/.test(R.run('sbNote')) && R.run('!!sbDraft().beat') && R.run('sbDraft().replaced === true'), R.run('sbNote'));
    R.run('sbSaveUpload(2)'); await settle(100);
    const w0 = writes();
    box_set(R, '__levelNext', 'b'); R.run('sbRunLevel()'); await sleep(60); await settle(300);
    const shaB = sha(LEVELLED.get('b')), audB = id + '-' + shaB.slice(0, 8);
    const seq = F.st.writes.slice(w0).map(w => w.op + ' ' + w.path);
    const iDraft = seq.lastIndexOf('set songDrafts/' + id), iDel = seq.indexOf('delete songFiles/' + audA);
    check('new file: the new copy, then the draft, then the old copy deleted (head and pieces)', F.S.get('songDrafts/' + id).audio.id === audB && iDraft >= 0 && iDel > iDraft && keysOf('songFiles/' + audA).length === 0 && keysOf('songFiles/' + audB + '/pieces/').length === 3,
      seq.map(s => s.replace(new RegExp(id, 'g'), '<id>')).filter(s => !s.includes('/pieces/')).join(' → '));
  }

  /* Clear this step / Level it again (Jonathan, 2026-11-15): one step's work goes, the rest of the draft stays. */
  {
    const before = F.S.get('songDrafts/' + id), audB = before.audio.id;
    const w0 = writes();
    R.env.confirmAnswer = false; R.run("sbClearStep('beat')"); await settle(100);
    check('clear: Cancel clears nothing', writes() === w0 && !!F.S.get('songDrafts/' + id).beat);
    R.env.confirmAnswer = true; R.run("sbClearStep('beat')"); await settle(100);
    const c1 = F.S.get('songDrafts/' + id);
    check('clear Beat: bar 1, tempo and pins go; the levelled copy, the volume and the title stay', c1.beat === null && c1.audio && c1.audio.id === audB && c1.volume && c1.title === before.title && keysOf('songFiles/' + audB).length > 0 && /Beat step is cleared/.test(R.run('sbNote')),
      JSON.stringify({ beat: c1.beat, audio: c1.audio && c1.audio.id === audB }));
    R.run('sbMem.level.E = sbOnsetEnv(sbMem.level.mono, sbMem.level.fs); sbStepOn = 3; sbBeatFromBpm(96, null);'); await sleep(1400); await settle();
    R.run("sbClearStep('volume')"); await settle(200);
    const c2 = F.S.get('songDrafts/' + id);
    check('clear Volume: the copy is deleted from songFiles and the draft forgets it; the beat stays; back on step 2', c2.audio === null && c2.volume === null && c2.pitch === null && !!c2.beat && keysOf('songFiles/' + audB).length === 0 && R.run('sbStepOn') === 2 && !R.run('sbStepReady(sbDraft(), 3)'),
      JSON.stringify({ audio: c2.audio, beat: !!c2.beat, left: keysOf('songFiles/' + audB).length, step: R.run('sbStepOn') }));
    box_set(R, '__f', fileOf('test-b.mp3', SRC_B, 24.02)); R.run('sbStepOn = 1; sbPickFile(__f)'); await settle();
    R.run('sbGoStep(2)'); await settle(50);
    box_set(R, '__levelNext', 'b'); R.run('sbRunLevel()'); await sleep(60); await settle(300);
    const c3 = F.S.get('songDrafts/' + id);
    check('Level it again: a new copy is stored and named, the beat kept', c3.audio && c3.audio.id === audB && keysOf('songFiles/' + audB + '/pieces/').length === 3 && !!c3.beat && c3.volume,
      JSON.stringify({ audio: c3.audio && c3.audio.id, beat: !!c3.beat }));
  }

  /* Leaving the view while it levels: nothing is written after the leave. */
  {
    box_set(R, '__f', fileOf('test-c.mp3', SRC_C, 15)); R.run('sbStepOn = 1; sbPickFile(__f)'); await settle();
    R.run('sbSaveUpload(2)'); await settle(100);
    box_set(R, '__levelNext', 'c');
    const w0 = writes();
    R.run('sbRunLevel()'); R.run("teacherSbLeave(); teacherView = 'students';");
    await sleep(80); await settle(300);
    check('leaving mid-level: no write after the leave', writes() === w0, F.st.writes.slice(w0).map(w => w.path).join(', '));
    R.run("teacherView = 'songbuilder'"); await settle();
  }

  /* Delete draft: one OK / Cancel (no typed title, Jonathan 2026-11-15); OK removes the draft and its copy, nothing else. */
  {
    // A second draft that must survive.
    R.run("sbNewSong()"); await settle();
    box_set(R, '__f', fileOf('test-a.mp3', SRC_A, 24)); R.run("sbNew = { title: 'Test 1', artist: '' }; sbPickFile(__f)"); await settle();
    R.run('sbSaveUpload()'); await settle(100);
    const id2 = R.run('sbSel');
    R.run(`sbOpen(${JSON.stringify(id)})`); await settle(100);
    const w0 = writes();
    R.env.confirmAnswer = false; R.env.confirms.length = 0; R.run('sbDeleteDraft()'); await settle(100);
    const q = R.env.confirms[0] || '';
    check('delete: one OK / Cancel question that names the draft and says the mp3 on the Mac stays (no typed title)', R.env.confirms.length === 1 && q.includes('"Test 0"') && /mp3 on the Mac is not touched/.test(q) && R.env.prompts.length === 0, q);
    check('delete: Cancel deletes nothing', writes() === w0 && F.S.has('songDrafts/' + id));
    const aud = F.S.get('songDrafts/' + id).audio.id;
    R.env.confirmAnswer = true; R.run('sbDeleteDraft()'); await settle(200);
    check('delete: OK deletes the draft and its levelled copy, and leaves the other draft', !F.S.has('songDrafts/' + id) && keysOf('songFiles/' + aud).length === 0 && F.S.has('songDrafts/' + id2) && /Deleted the draft "Test 0"/.test(R.run('sbNote')),
      keysOf('songDrafts/').length + ' drafts left; ' + R.run('sbNote'));
  }

  /* A copy a built song plays is never deleted with a draft. */
  {
    const id3 = R.run('sbSel') || [...F.S.keys()].find(k => k.startsWith('songDrafts/')).slice(11);
    R.run(`sbOpen(${JSON.stringify(id3)})`); await settle(50);
    box_set(R, '__f', fileOf('test-a.mp3', SRC_A, 24)); R.run('sbPickFile(__f)'); await settle();   // a reopened draft asks for its mp3 again
    box_set(R, '__levelNext', 'a'); R.run('sbStepOn = 2; sbRunLevel()'); await sleep(60); await settle(300);
    const aud = F.S.get('songDrafts/' + id3).audio && F.S.get('songDrafts/' + id3).audio.id;
    F.S.set('builtSongsMeta/list', { songs: { 'sb-builtsongone1': 1 }, updatedAt: TS });
    F.S.set('builtSongs/sb-builtsongone1', { v: 1, title: 'Test Built', artist: '', audio: { id: aud }, song: {}, savedAt: TS });
    R.run('sbDeleteDraft()'); await settle(200);
    check('delete: a copy a published song plays stays in songFiles', aud && !F.S.has('songDrafts/' + id3) && F.S.get('songFiles/' + aud) && keysOf('songFiles/' + aud + '/pieces/').length > 0, aud);
  }

  /* A failed draft write: the line says so and the screen does not claim it saved. */
  {
    R.run("sbNewSong()"); await settle();
    box_set(R, '__f', fileOf('test-a.mp3', SRC_A, 24)); R.run("sbNew = { title: 'Test 2', artist: '' }; sbPickFile(__f)"); await settle();
    F.st.failWrite = p => p.startsWith('songDrafts/');
    R.run('sbSaveUpload()'); await settle(100);
    F.st.failWrite = null;
    check('a failed save: the line says it was not saved and the draft is not listed', /not saved/.test(R.run('sbNote')) && R.run("sbSel === 'new'") && ![...R.run('[...sbDrafts.values()].map(d => d.title)')].includes('Test 2'), R.run('sbNote'));
  }

  check('every write in the run fits the rules and the builder\'s own paths (songDrafts, songFiles, songFilesUsage)', F.st.violations.length === 0 && F.st.writes.length > 20,
    F.st.writes.length + ' writes; ' + (F.st.violations.slice(0, 3).join('; ') || 'no violation'));
  check('no write to config/class, progress/, builtSongs or builtSongsMeta', !F.st.writes.some(w => /^(config|progress|builtSongs)/.test(w.path)));
  return out;
}
function box_set(C, k, v){ C.box[k] = v; }

/* ── main ── */
const parts = siteParts('teacher.js', ROOT);
for(const p of ['teacher-sb-core.js', 'teacher-sb-beat.js', 'teacher-sb-dsp.js']) if(!parts.includes(p)){ console.log(`song-builder-sim: ${p} is not a console part (TEACHER_JS_PARTS in app/boot.js)`); process.exit(1); }
let res;
try { res = await runCases(parts.map(read).join('')); }
catch(e){ console.log('song-builder-sim: the run threw: ' + (e && e.stack || e)); process.exit(1); }
const bad = res.filter(r => !r.ok);
for(const r of res) if(VERBOSE || !r.ok) console.log(`  ${r.ok ? '✓' : '✗'} ${r.name}${r.detail ? ' — ' + r.detail : ''}`);
console.log(`song-builder-sim: ${res.length} cases, ${bad.length} failed`);
process.exit(bad.length ? 1 : 0);
