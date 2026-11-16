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
   The stub database is the one tools/song-files-console-sim.mjs uses, cut to these paths.

   PART C (2026-11-16; teacher-sb-chart.js). THE READER on made-up charts the tool writes, one per accepted format
   (chords over lyrics, ChordPro, bar lines, Spanish headers, 3/4, 6/8, the header forms, no headers, rests and x2),
   one per refusal (TAB, a number chart, Roman numerals, an unreadable symbol, one in ChordPro, a crowded bar) and
   the folds (slash, sevenths, sus, add9, "min"): each read as written out below, "N of N". Every accepted chart, at
   Full, Power and Both, is a song builtSongCheck passes, and its card renders through the REAL caCardBodyHtml
   (tools/sim-app-page.mjs: the whole student app) with its sections and its lyric lines escaped. THE SHAPES: all 36
   (12 roots, major / minor / 5) pass the validator's shape rule. THE GRID's edits keep every section's lyric rows
   adding up to its bars. THE FLOW (its own console and store, a made-up draft with a beat): read, a refused line left
   out and typed, a chord kept, a bar split and held, a new section named, Undo, the level and a range, Clear this
   step, a chart given at step 1, a meter change, a reload; every write a songDrafts write. */
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { siteParts } from './site-src.mjs';
import { appPage } from './sim-app-page.mjs';

const args = process.argv.slice(2);
const argOf = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const ROOT = resolve(argOf('--root') || join(dirname(fileURLToPath(import.meta.url)), '..'));
const VERBOSE = args.includes('--verbose');
const read = f => readFileSync(join(ROOT, f), 'utf8');
const sha = b => createHash('sha256').update(b).digest('hex');
const tick = () => new Promise(r => setImmediate(r));
const sleep = ms => new Promise(r => setTimeout(r, ms));
/* settle(n): n turns of the event loop, AND every console has finished what it started (its sbBusy is ''), then n
   turns more for what it starts as it ends (the old copy's delete, the paint). Counting turns alone is not enough
   (2026-11-16, the Windows computer): sbPickFile, sbRunLevel (through teacherSfPutFile) and sbLoadLevel (through
   songFileReadPieces) each await a SHA-256 from crypto.subtle, which is worked out on another thread, and sbRunLevel
   a 30 ms timer; no count of turns outlasts those on every machine (measured there: 200 turns pass in about
   0.5 ms, one hash of the 1.9 MB levelled copy takes about 4 ms, some 1,200 to 1,800 turns). So never add a fixed
   sleep or a bigger count to wait for one of those: settle() waits for the work itself. A console still busy after
   SETTLE_MAX_MS never finishes (a load that starts itself again each time it fails does that): the wait is given up
   once, for the rest of the run, so each case still prints its own line, and the run ends with a failed line that
   names the console and what it was doing.
   The three sleep(1400) lines that are left wait for the builder's own 1.2 s "save once things settle" timer: a timer
   on the same clock, set earlier and shorter, so it always fires first. */
const SETTLE_MAX_MS = 20000;
const CONSOLES = [];
let STUCK = '';
const STUCK_NAME = `a console never finished what it started (still busy after ${SETTLE_MAX_MS / 1000} s; the waits after that were not waited out)`;
const busyNow = () => CONSOLES.map((C, i) => ({ i, busy: C.run('sbBusy'), progress: C.run('sbProgress') })).filter(c => c.busy !== '');
const turns = async n => { for(let i = 0; i < n; i++) await tick(); };
async function settle(n = 60){
  const t0 = Date.now();
  let waited = false;
  for(;;){
    await turns(n);
    const busy = busyNow();
    if(busy.length){
      if(STUCK) return;
      if(Date.now() - t0 > SETTLE_MAX_MS){ STUCK = busy.map(c => `console ${c.i}: sbBusy '${c.busy}', "${c.progress}"`).join('; '); return; }
      waited = true;
      await sleep(1);
      continue;
    }
    if(!waited) return;
    waited = false;
  }
}

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
const DRAFT_KEYS = 'artist,audio,beat,chart,level,pitch,savedAt,source,step,title,v,volume';
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
  for(const f of ['i18n.js', 'guitar-diagrams.js']) vm.runInContext(read(f), box, { filename: f });   // the section names' words and the chord shapes (Part c)
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
  const C = { box, F, env, run, grid };
  CONSOLES.push(C);                       // settle() waits for every console's sbBusy
  return C;
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
  box_set(C, '__levelNext', 'a'); run('sbRunLevel()'); await settle(200);
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

  /* The beat track's own numbers are saved with the grid, so a reload finds the same track; and how many pins the
     record needs (2026-11-15). The made-up record is steady: no "send to Claude" on the step or in the list. */
  check('beat: the track (trackBpm, trackSub) and the pins the record needs are saved with the grid', b && Number.isFinite(b.trackBpm) && [1, 2, 3, 4, 6].includes(b.trackSub) && Number.isFinite(b.pinsNeeded) && b.pinsNeeded <= run('SB_PINS_MAX'),
    JSON.stringify(b && { trackBpm: b.trackBpm, trackSub: b.trackSub, pinsNeeded: b.pinsNeeded }));
  const paneOk = run('sbBeatPaneHtml(sbDraft())'), listOk = run('sbListHtml()');
  /* The same draft, as a record that needs 21 pins: the step says to send the mp3 to Claude, the list tags it, and
     nothing is written by showing it. */
  const writesBefore = writes();
  const pane21 = run('(() => { const d = sbDraft(), keep = [d.beat.pinsNeeded, sbBt.need]; d.beat.pinsNeeded = 21; sbBt.need = { pins: 21, worstMs: 400 }; const out = [sbBeatPaneHtml(d), sbListHtml()]; d.beat.pinsNeeded = keep[0]; sbBt.need = keep[1]; return out; })()');
  check('beat: a record that needs more pins than SB_PINS_MAX: the step says to send the mp3 to Claude and the list says "Beat: send to Claude"; a steady record shows neither',
    /cannot hold this record's beat/.test(pane21[0]) && /about 21 pins/.test(pane21[0]) && /Send the mp3 to Claude/.test(pane21[0]) && /Beat: send to Claude/.test(pane21[1])
    && !/cannot hold this record's beat/.test(paneOk) && !/Beat: send to Claude/.test(listOk) && writes() === writesBefore,
    JSON.stringify({ step21: /cannot hold this record's beat/.test(pane21[0]), list21: /Beat: send to Claude/.test(pane21[1]), stepSteady: /cannot hold this record's beat/.test(paneOk), listSteady: /Beat: send to Claude/.test(listOk) }));

  /* A reload: a fresh console on the same store resumes the draft where it was. */
  const R = makeConsole(consoleSrc, F);
  R.run('renderTeacherSongBuilder()'); await settle();
  R.run(`sbOpen(${JSON.stringify(id)})`); await settle(200);
  check('resume: a reload lists the draft and opens it on its step, every field as saved',
    R.run('sbDrafts.size') === 1 && R.run('sbStepOn') === 3 && JSON.stringify(R.run('(({ title, artist, source, audio, beat }) => ({ title, artist, source, audio, beat }))(sbDraft())')) === JSON.stringify((({ title, artist, source, audio, beat }) => ({ title, artist, source, audio, beat }))(d2)),
    'step ' + R.run('sbStepOn'));
  check('resume: the Beat step reads the levelled copy back from songFiles (counted once)', R.run('!!(sbMem.level && sbMem.level.sha256 === sbDraft().audio.sha256)') && (F.S.get('songFiles' + 'Usage/' + R.run('songFileMonth()')) || {}).bytes > 0,
    JSON.stringify(F.S.get('songFilesUsage/' + R.run('songFileMonth()'))));

  /* The reloaded console makes the beat track again from the saved tempo and division: the same track, so the same
     drift windows as the console that set the grid. */
  R.run('sbMem.level.E = sbOnsetEnv(sbMem.level.mono, sbMem.level.fs); sbBeatTrack(sbMem.level, sbDraft().beat);');
  const trA = run('JSON.stringify([sbMem.level.E.track.bpm, sbMem.level.E.track.sub, sbDrift(sbMem.level.E, sbDraft().beat, sbDraft().audio.durationSec)])');
  const trB = R.run('JSON.stringify([sbMem.level.E.track.bpm, sbMem.level.E.track.sub, sbDrift(sbMem.level.E, sbDraft().beat, sbDraft().audio.durationSec)])');
  check('resume: the reloaded console finds the same beat track (tempo, division, every drift window)', trA === trB && JSON.parse(trA)[2].length >= 2, trA === trB ? JSON.parse(trA).slice(0, 2).join(' BPM, the beat in ') : `${trA.slice(0, 200)} / ${trB.slice(0, 200)}`);

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
    box_set(R, '__levelNext', 'b'); R.run('sbRunLevel()'); await settle(300);
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
    box_set(R, '__levelNext', 'b'); R.run('sbRunLevel()'); await settle(300);
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
    await settle(300);
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
    box_set(R, '__levelNext', 'a'); R.run('sbStepOn = 2; sbRunLevel()'); await settle(300);
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
  await chartCases(consoleSrc, check);
  return out;
}
function box_set(C, k, v){ C.box[k] = v; }

/* ── Part c: the chart reader, the shapes, the grid, the level ── */
/* Made-up charts. `secs`: each section as "name n:bars"; `first`: the first bars as written; `lyr`: lyric lines kept. */
const CHARTS = {
  'chords over lyrics': { meter: '4/4', fmt: 'chords over lyrics', bars: 21, chords: 'G D Em C', lyr: 3,
    secs: 'intro:4 verse 1:4 chorus:4 verse 2:4 chorus 2:4 ending:1',
    text: 'Made-up Song - Nobody\n\n[Intro]\nG    D    Em    C\n\n[Verse 1]\nG                 D\nWalking on the made-up street\nEm              C\nhumming in the <b>summer</b> heat & "rain"\n\n[Chorus]\nC          G             D            Em\nLight them up, let the whole block glow\n\n[Verse 2]  (same chords as Verse 1)\n\n[Chorus]\n\n[Ending]\nG' },
  'ChordPro': { meter: '4/4', fmt: 'ChordPro', bars: 7, chords: 'G D Em C', lyr: 3, secs: 'verse:4 chorus:3',
    text: '{title: Made-up Song}\n{artist: Nobody}\n{start_of_verse}\n[G]Walking down the [D]road\n[Em]All the way [C]home\n{end_of_verse}\n{soc}\n[C]Sing it [G]loud [D]now\n{eoc}' },
  'bar lines': { meter: '4/4', fmt: 'bar lines', bars: 14, chords: 'G D Em C', lyr: 0, secs: 'intro:4 verse:8 outro:2', first: 'G|D|Em:2 C:2|Em:2 C:2',
    text: 'Intro: | G | D | Em C | % |\n[Verse]\n| G | G | D | D | x2\n[Outro]\n| G | N.C. |' },
  'Spanish headers': { meter: '4/4', fmt: 'chords over lyrics', bars: 15, chords: 'Am G F E Dm', lyr: 2, secs: 'intro:2 verse 1:4 chorus:6 bridge:2 ending:1',
    text: 'INTRO\nAm  G\n\nVerso 1\nAm          G\nUna linea de prueba\nF           E\notra linea\n\nCORO x2\nF  G  Am\n\nPuente\nDm  E\n\nFinal\nAm' },
  '3/4, two chords in a bar': { meter: '3/4', fmt: 'bar lines', bars: 4, chords: 'C G F', lyr: 0, secs: 'verse:4', first: 'C|G:2 C:1|F|G', text: '[Verse]\n| C | G C | F | G |' },
  '6/8, two chords in a bar': { meter: '6/8', fmt: 'bar lines', bars: 4, chords: 'Am G E', lyr: 0, secs: 'verse:4', first: 'Am|G:1 Am:1|Am|E', text: '[Verse]\n| Am | G Am | Am | E |' },
  'header forms': { meter: '4/4', fmt: 'chords over lyrics', bars: 10, chords: 'G D C Em', lyr: 0, secs: 'verse 1:2 chorus:2 bridge:2 chorus 2:2 outro:2',
    text: 'Verse 1:\nG D\nCHORUS\nC G\nBridge\nEm C\nLast chorus\nC G\nOutro: G D' },
  'no headers': { meter: '4/4', fmt: 'chords over lyrics', bars: 8, chords: 'G D Em C', lyr: 1, secs: '?:8', text: 'G  D  Em  C\nsome words here\nG  D  C  C' },
  'rests and x2': { meter: '4/4', fmt: 'chords over lyrics', bars: 8, chords: 'E5 G5 A5', lyr: 0, secs: 'riff:8', first: 'E5|G5|A5|-|E5', text: '[Riff]\nE5 G5 A5 N.C. x2' },
};
const REFUSED = {
  'TAB': { text: '[Verse]\nG D\ne|-----3-----2--|\nB|--0-----0-----|\ne|--3--2--0--|\n--3--2--0--2--', bad: [[3, 'tab'], [4, 'tab'], [5, 'tab'], [6, 'tab']], bars: 2 },
  'a number chart': { text: '[Verse]\nG D\n1 4 5 1', bad: [[3, 'numbers']], bars: 2 },
  'Roman numerals': { text: '[Verse]\nG D\nI IV V vi', bad: [[3, 'numbers']], bars: 2 },
  'an unreadable symbol': { text: '[Verse]\nG Bdim Em C\nC G', bad: [[2, 'symbol', 'Bdim']], bars: 2 },
  'an unreadable symbol in ChordPro': { text: '[Verse]\n[G]la la [G7#9]la\n[C]la', bad: [[2, 'symbol', 'G7#9']], bars: 1 },
  'a crowded bar': { text: '[Verse]\n| G | D |\n| G D Em C Am |', bad: [[3, 'crowded']], bars: 2 },
  'words are not chords': { text: '[Verse]\nG D\nA long road home', bad: [], bars: 2 },
};
const FOLDS = { text: '[Verse]\nG/B  G7  Am7  Cmaj7  Dsus4  Cadd9  Emin  B♭  (G)  F#m7', names: 'G G Am C D C Em Bb G F#m', folds: 'G/B>G G7>G Am7>Am Cmaj7>C Dsus4>D Cadd9>C Emin>Em F#m7>F#m' };
const hex64 = n => { let x = n * 2654435761 >>> 0, o = ''; while(o.length < 64){ x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; o += (x >>> 0).toString(16).padStart(8, '0'); } return o.slice(0, 64); };
async function chartCases(consoleSrc, check){
  const F2 = makeDb(), C = makeConsole(consoleSrc, F2), { run } = C;
  const sbRead = run('sbChartRead'), secLabel = s => (s.name ? s.name + (s.n ? ' ' + s.n : '') : '?') + ':' + s.bars.length;
  /* the reader */
  let ok = 0; const off = [];
  const reads = {};
  for(const [name, f] of Object.entries(CHARTS)){
    const r = sbRead(f.text, f.meter); reads[name] = r;
    const got = { fmt: r.fmt, bars: r.sections.reduce((n, s) => n + s.bars.length, 0), chords: r.chords.join(' '), secs: r.sections.map(secLabel).join(' '), lyr: r.sections.reduce((n, s) => n + (s.lyrics ? s.lyrics.filter(l => l.text).length : 0), 0), bad: r.bad.length };
    const first = f.first ? r.sections[0].bars.slice(0, f.first.split('|').length).join('|') === f.first : true;
    const rowsOk = r.sections.every(s => !s.lyrics || s.lyrics.reduce((n, l) => n + l.bars, 0) === s.bars.length);
    if(got.fmt === f.fmt && got.bars === f.bars && got.chords === f.chords && got.secs === f.secs && got.lyr === f.lyr && got.bad === 0 && first && rowsOk) ok++; else off.push(name + ': ' + JSON.stringify(got));
  }
  for(const [name, f] of Object.entries(REFUSED)){
    const r = sbRead(f.text, '4/4'), bars = r.sections.reduce((n, s) => n + s.bars.length, 0);
    const same = r.bad.length === f.bad.length && f.bad.every((b, i) => r.bad[i].line === b[0] && r.bad[i].why === b[1] && (b[2] == null || r.bad[i].sym === b[2])) && bars === f.bars;
    if(same) ok++; else off.push(name + ': ' + JSON.stringify({ bad: r.bad.map(b => [b.line, b.why, b.sym]), bars }));
  }
  {
    const r = sbRead(FOLDS.text, '4/4'), names = r.sections[0] ? r.sections[0].bars.join(' ') : '', folds = r.folds.map(x => x.from + '>' + x.to).join(' ');
    if(names === FOLDS.names && folds === FOLDS.folds && !r.bad.length) ok++; else off.push('folds: ' + names + ' | ' + folds);
  }
  const total = Object.keys(CHARTS).length + Object.keys(REFUSED).length + 1;
  check(`chart reader: ${total} of ${total} made-up charts read as expected (${Object.keys(CHARTS).length} accepted formats, ${Object.keys(REFUSED).length} refusals, the folds)`, ok === total, off.join(' ; ').slice(0, 900) || `${ok} of ${total}`);

  /* the shapes */
  {
    const bad = [];
    for(const root of ['C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']) for(const q of ['', 'm', '5']){
      const n = root + q, sh = run('sbShapeOf')(n);
      const pf = sh ? run('bsShapeProblem')(n, sh.full, 'full') : 'no shape', pp = sh ? run('bsShapeProblem')(n, sh.power, 'power') : 'no shape';
      if(pf || pp) bad.push(`${n}: ${pf || pp}`);
    }
    const g = run('sbShapeOf')('G'), bb = run('sbShapeOf')('Bb'), fs = run('sbShapeOf')('F#m');
    check('shapes: 39 of 39 chord names (13 spellings of the 12 roots, major / minor / 5) get a full and a power shape the validator takes; G is the site\'s open G and taught, Bb and F#m are flagged not taught',
      !bad.length && JSON.stringify(g.full.frets) === '[3,2,0,0,0,3]' && g.taught && g.how === 'site' && !bb.taught && bb.how === 'barre' && !fs.taught, bad.join('; ') || JSON.stringify({ G: g.full.frets, Bb: bb.full.frets, 'F#m': fs.full.frets, Bb5: bb.power.frets }));
  }

  /* every accepted chart is a song the validator passes, and renders as the real card */
  {
    const page = appPage(ROOT);
    const audio = { id: 'sb-fixture00001-abcdef12', bytes: 1900000, sha256: hex64(7), durationSec: 1500, centsOff: 2, gainDb: 1.5, sourceSha256: hex64(8) };
    let n = 0, pass = 0, rendered = 0; const why = [];
    for(const [name, f] of Object.entries(CHARTS)){
      const sections = JSON.parse(JSON.stringify(reads[name].sections)); sections.forEach(s => { if(!s.name) s.name = 'verse'; });
      for(const lv of [{ versions: 'full' }, { versions: 'power' }, { versions: 'both', start: 'power' }]){
        n++;
        const d = { title: 'Test 0 ' + name, artist: 'Nobody', audio, beat: { meter: f.meter, bpm: 100, anchor: 0.5, pins: [] }, chart: { meter: f.meter, sections }, level: lv };
        const w = run('sbSongWhy')(d, 'sb-fixture00001');
        if(w.length){ why.push(`${name} [${lv.versions}]: ${w[0]}`); continue; }
        pass++;
        const doc = JSON.parse(JSON.stringify({ v: 1, title: d.title, artist: d.artist, audio, song: run('sbSongOf')(d) }));
        page.ctx.__doc = doc;
        const html = page.run(`(() => { const ex = builtSongExpand('sb-fixture00001', __doc); CLASS_ACTIVITIES = CLASS_ACTIVITIES.filter(a => a.id !== 'sb-fixture00001').concat([ex.activity]); SNIPPET_TRACKS['sb-fixture00001'] = ex.track; return String(caCardBodyHtml(ex.activity) || ''); })()`);
        const lyricOk = name !== 'chords over lyrics' || (html.includes('&lt;b&gt;summer&lt;/b&gt;') && !html.includes('<b>summer</b>'));
        /* Each chord shows by the name its level plays: the full name, or the root + 5 on the power level. */
        const shown = c => lv.versions === 'full' ? c : c.replace(/(m|5)$/, '') + '5';
        const secsOk = sections.every(x => html.includes(run('bsSectionLabel')({ name: x.name, n: x.n || undefined }, 'en')));
        if(html.length > 500 && lyricOk && secsOk && reads[name].chords.every(c => html.includes('>' + shown(c) + '<'))) rendered++; else why.push(`${name} [${lv.versions}]: the card did not render as expected (${html.length} chars; sections ${secsOk}; missing ${reads[name].chords.filter(c => !html.includes('>' + shown(c) + '<')).join(' ')})`);
      }
    }
    check(`chart to song: ${n} of ${n} (the ${Object.keys(CHARTS).length} accepted charts at Full, Power and Both) pass builtSongCheck and render through caCardBodyHtml, lyric lines escaped`, pass === n && rendered === n, why.join(' ; ').slice(0, 700) || `${pass} pass, ${rendered} rendered`);
  }

  /* the grid's edits */
  {
    const base = reads['chords over lyrics'].sections, G = n => run(n);
    const sum = secs => secs.reduce((n, s) => n + s.bars.length, 0), rows = secs => secs.every(s => !s.lyrics || s.lyrics.reduce((n, l) => n + l.bars, 0) === s.bars.length);
    const a = G('sbGridAddBar')(base, 5), b = G('sbGridRemoveBar')(base, 5), c = G('sbGridSplit')(base, 6), e1 = G('sbGridEdge')(base, 2, -1), e2 = G('sbGridEdge')(base, 2, 1), j = G('sbGridJoin')(base, 2), sw = G('sbGridSwap')(base, 'Em', 'Am'), sb = G('sbGridSetBar')(base, 0, 'G:2 C:2');
    const facts = { add: sum(a) === 22 && a[1].bars[2] === a[1].bars[1] && rows(a), remove: sum(b) === 20 && rows(b), split: c.length === base.length + 1 && c[2].name === null && c[1].bars.length === 2 && c[2].bars.length === 2 && rows(c),
      earlier: e1[1].bars.length === 3 && e1[2].bars.length === 5 && rows(e1), later: e2[1].bars.length === 5 && e2[2].bars.length === 3 && rows(e2), join: j.length === base.length - 1 && j[1].bars.length === 8 && rows(j),
      swap: !run('sbChartChords')(sw).includes('Em') && run('sbChartChords')(sw).includes('Am'), set: sb[0].bars[0] === 'G:2 C:2', untouched: sum(base) === 21 && base[1].bars.length === 4 };
    check('grid: + Bar, Remove bar, a new section, an edge earlier and later, Join, Swap and a split bar each do what they say; every section\'s lyric rows still add up to its bars; the chart they started from is not changed', Object.values(facts).every(Boolean), JSON.stringify(facts));
  }

  /* the flow, on a made-up draft with a beat (its own console and store) */
  const id = 'sb-chartdraft001';
  F2.S.set('songDrafts/' + id, { v: 1, title: 'Test 0 Chart', artist: 'Nobody', step: 3, source: { name: 'test.mp3', bytes: 400000, sha256: hex64(1), durationSec: 60, sampleRate: 44100, channels: 2, kbps: 192 },
    audio: { id: id + '-abcdef12', bytes: 1900000, sha256: hex64(2), durationSec: 60, centsOff: 2, gainDb: 1, sourceSha256: hex64(1) }, volume: { before: -14, after: -12.5, samplePeak: -1.2, truePeak: -1.1, ceilingDb: -1, encodes: 1 },
    pitch: { cents: 2, peaks: 10 }, beat: { meter: '4/4', bpm: 96, anchor: 0.5, pins: [], trackBpm: 96, trackSub: 2, driftOff: 0, pinsNeeded: 2 }, chart: null, level: null, savedAt: 0 });
  F2.S.get('songDrafts/' + id).step = 4;      // it opens on the Chart step (the Beat step would read the levelled copy back, which this draft does not have)
  run('renderTeacherSongBuilder()'); await settle();
  run(`sbOpen(${JSON.stringify(id)})`); await settle();
  const stored = () => F2.S.get('songDrafts/' + id), nW = () => F2.st.writes.length;
  const flush = async () => { run('if(sbCh){ clearTimeout(sbCh.saveTimer); } sbWriteDraft(sbSel, sbDraft())'); await settle(); };
  const act = (a, ds) => run(`sbChartAct(${JSON.stringify(a)}, { dataset: ${JSON.stringify(ds || {})} })`);
  run('sbGoStep(4)'); await settle();
  check('chart: step 4 opens with nothing read (the paste box); Level waits for a chart', run('sbStepOn') === 4 && /data-sb-charttext/.test(run('sbChartPaneHtml(sbDraft())')) && !run('sbStepReady(sbDraft(), 5)') && run('sbStepReady(sbDraft(), 4)'), 'step ' + run('sbStepOn'));
  const TEXT = '[Verse]\nG  D\nwords here\nEm  Bb\ne|--3--2--0--|';
  const w0 = nW();
  run(`sbChartDoRead(sbDraft(), ${JSON.stringify(TEXT)})`); await settle();
  let d = stored();
  const pane = run('sbChartPaneHtml(sbDraft())');
  check('chart: reading saves the chart in the draft at once (one songDrafts write): its text, 1 section, 4 bars, step 4; the step shows what was read, the refused TAB line, the chord not taught and the bar count against the recording',
    nW() === w0 + 1 && d.chart && d.chart.text === TEXT && d.chart.sections.length === 1 && d.chart.sections[0].name === 'verse' && d.chart.sections[0].bars.join(' ') === 'G D Em Bb' && d.step === 4 && d.chart.meter === '4/4'
    && /Read as chords over lyrics/.test(pane) && /Line 5 could not be read/.test(pane) && /looks like TAB/.test(pane) && /Bb is a chord the class has not been taught/.test(pane) && /The chart makes 4 bars; the recording has about 23/.test(pane),
    JSON.stringify({ writes: nW() - w0, chart: d.chart && { n: d.chart.sections.length, bars: d.chart.sections[0] && d.chart.sections[0].bars, step: d.step, meter: d.chart.meter },
      pane: [/Read as chords over lyrics/, /Line 5 could not be read/, /looks like TAB/, /Bb is a chord the class has not been taught/, /The chart makes 4 bars; the recording has about 23/].map(re => re.test(pane)) }));
  check('chart: with a refused line and an untaught chord open, the step is marked "!" and says 2 things are open', run('sbChartOpen(sbDraft(), sbChartReadOf(sbDraft())).n') === 2 && /sb-step[^"]*warn[^>]*data-sb-step="4"/.test(run('sbStepsHtml(sbDraft())')), String(run('sbChartOpen(sbDraft(), sbChartReadOf(sbDraft())).n')));
  act('chart-leave', { sbLine: '5' }); act('chart-keep', { sbChord: 'Bb' });
  await sleep(1400); await settle();
  d = stored();
  check('chart: "Leave it out" and "Keep Bb" are saved once things settle (1.2 s), and nothing is open any more', JSON.stringify(d.chart.left) === '[5]' && JSON.stringify(d.chart.kept) === '["Bb"]' && run('sbChartOpen(sbDraft(), sbChartReadOf(sbDraft())).n') === 0 && /Line 5 is left out/.test(run('sbChartPaneHtml(sbDraft())')),
    JSON.stringify({ left: d.chart.left, kept: d.chart.kept }));
  run('sbChartLine(sbDraft(), 5, "C  G")'); await settle();
  d = stored();
  check('chart: "Type its chords" puts the typed chords in that line and reads the chart again: 6 bars, no refused line; chords that cannot be read are refused with a line', d.chart.sections[0].bars.join(' ') === 'G D Em Bb C G' && run('sbChartReadOf(sbDraft()).bad.length') === 0
    && (run('sbChartLine(sbDraft(), 3, "Bdim X")'), /not chords the builder reads/.test(run('sbNote'))) && stored().chart.sections[0].bars.length === 6, d.chart.sections[0].bars.join(' ') + ' | ' + run('sbNote'));
  /* the grid */
  act('chart-view', { sbV: 'grid' }); act('bar-pick', { sbG: '1' }); act('bar-split', { sbSplit: '2+2' }); act('bar-part', { sbPart: '1' }); act('bar-chord', { sbChord: 'Am' });
  const afterSplit = run('sbDraft().chart.sections[0].bars[1]');
  act('bar-add', {}); act('bar-pick', { sbG: '4' }); act('sec-split', {});
  const gridPane = run('sbChartPaneHtml(sbDraft())');
  const unnamed = run('sbSongWhy(sbDraft(), sbSel)');
  run(`sbChartChange({ target: { matches: q => q === '[data-sb-secname]', value: 'chorus', dataset: {} } })`);
  await flush(); d = stored();
  check('grid: a bar split 2 + 2 with Am on its second half, + Bar, and a new section from bar 5: 7 bars in 2 sections; the new section has no name until one is picked (the song is refused until then); all saved, the chart marked edited',
    afterSplit === 'D:2 Am:2' && d.chart.sections.length === 2 && d.chart.sections[0].bars.join('|') === 'G|D:2 Am:2|D:2 Am:2|Em' && d.chart.sections[1].bars.join('|') === 'Bb|C|G' && d.chart.sections[1].name === 'chorus' && d.chart.edited === true
    && /pick a name/.test(gridPane) && unnamed.length === 1 && /no name/.test(unnamed[0]), JSON.stringify({ afterSplit, secs: d.chart.sections.map(x => [x.name, x.bars.join('|')]), unnamed }));
  act('bar-pick', { sbG: '0' }); act('bar-chord', { sbChord: '' });
  const rested = run('sbDraft().chart.sections[0].bars[0]');
  act('chart-undo', {});
  check('grid: a rest, then Undo: the bar is G again', rested === '-' && run('sbDraft().chart.sections[0].bars[0]') === 'G', rested + ' → ' + run('sbDraft().chart.sections[0].bars[0]'));
  /* the level */
  run('sbGoStep(5)'); await settle();
  act('level-versions', { sbV: 'both' }); act('level-start', { sbV: 'power' }); act('level-range', { sbV: 'range' });
  run(`sbChartChange({ target: { matches: q => q === '[data-sb-range]', value: '1', dataset: { sbRange: 'from' } } })`);
  await flush(); d = stored();
  const lvPane = run('sbLevelPaneHtml(sbDraft())'), songWhy = run('sbSongWhy(sbDraft(), sbSel)'), song = JSON.parse(JSON.stringify(run('sbSongOf(sbDraft())')));
  check('level: Both, opening on Power chords, sections 2 to 2: saved in the draft (step 5); the song it makes passes builtSongCheck and the step says so; its bars, sections, range and shapes are the chart\'s',
    d.level.versions === 'both' && d.level.start === 'power' && JSON.stringify(d.level.range) === '{"from":1,"to":1}' && d.step === 5 && !songWhy.length && /passes every check/.test(lvPane) && song.bars.length === 7 && song.sections.length === 2 && song.sections[1].from === 5
    && JSON.stringify(song.range) === '{"from":1,"to":1}' && JSON.stringify(song.level) === '{"versions":"both","start":"power"}' && Object.keys(song.chords).sort().join(' ') === 'Am Bb C D Em G' && song.bpm === 96 && song.anchor === 0.5,
    JSON.stringify({ level: d.level, step: d.step, why: songWhy, bars: song.bars.length, chords: Object.keys(song.chords) }));
  /* too many bars for the recording: the validator's own line */
  {
    const many = '[Verse]\n' + Array.from({ length: 7 }, () => 'G D Em C').join('\n');
    run(`(() => { const d = sbDraft(); d.__keep = d.chart; d.chart = Object.assign({}, d.chart, { sections: sbChartRead(${JSON.stringify(many)}, '4/4').sections }); })()`);
    const w = run('sbSongWhy(sbDraft(), sbSel)');
    run('(() => { const d = sbDraft(); d.chart = d.__keep; delete d.__keep; })()');
    check('level: a chart with more bars than the recording has room for (28 against 23) is refused with the validator\'s own line', w.length >= 1 && /past the end of the file/.test(w.join(' ')), w.join(' | ').slice(0, 200));
  }
  /* a reload */
  {
    const R = makeConsole(consoleSrc, F2);
    R.run('renderTeacherSongBuilder()'); await settle();
    R.run(`sbOpen(${JSON.stringify(id)})`); await settle();
    check('resume: a reload opens the draft on the Level step with the same chart and level, and the grid shows (the chart was edited by hand)', R.run('sbStepOn') === 5 && JSON.stringify(R.run('sbDraft().chart')) === JSON.stringify(d.chart) && JSON.stringify(R.run('sbDraft().level')) === JSON.stringify(d.level)
      && (R.run('sbGoStep(4)'), /data-sb-act="bar-pick"/.test(R.run('sbChartPaneHtml(sbDraft())'))), 'step ' + R.run('sbStepOn'));
  }
  /* the meter changes at the Beat step */
  {
    run('sbGoStep(4)'); await settle();
    run(`(() => { const d = sbDraft(); d.beat = Object.assign({}, d.beat, { meter: '3/4' }); })()`);
    run('sbChartMounted()'); await settle();
    const kept = run('sbDraft().chart.meter'), flag = /this chart was read in 4\/4/.test(run('sbChartPaneHtml(sbDraft())'));
    C.env.confirmAnswer = true;
    run('sbChartDoRead(sbDraft(), "[Verse]\\n| C | G C | F | G |")'); await settle();
    run(`(() => { const d = sbDraft(); d.beat = Object.assign({}, d.beat, { meter: '4/4' }); })()`);
    run('sbChartMounted()'); await settle();
    d = stored();
    check('meter: a chart edited by hand is NOT read again when the beat\'s meter changes (the step says to read it again); one not edited is read again by itself in the new meter', kept === '4/4' && flag && d.chart.meter === '4/4' && d.chart.sections[0].bars.join('|') === 'C|G:2 C:2|F|G' && d.chart.edited === false,
      JSON.stringify({ kept, flag, now: d.chart.meter, bars: d.chart.sections[0].bars }));
  }
  /* Clear this step */
  {
    C.env.confirmAnswer = true;
    run("sbClearStep('chart')"); await settle(120);
    d = stored();
    check('clear: Clear this step (Chart) drops the grid, the sections and the level, keeps the pasted text, and the paste box shows it', d.chart && Object.keys(d.chart).join() === 'text' && d.level === null && d.beat && d.audio && run('sbStepOn') === 4 && /data-sb-charttext[^>]*>\[Verse\]/.test(run('sbChartPaneHtml(sbDraft())')),
      JSON.stringify({ chart: d.chart && Object.keys(d.chart), level: d.level }));
  }
  /* the chart given at step 1, with the mp3 */
  {
    run('sbNewSong()');
    box_set(C, '__f', fileOf('test-a.mp3', SRC_A, 24)); run('sbPickFile(__f)'); await settle();
    run(`sbNew.title = 'Test 0 With Chart'; sbNew.artist = 'Nobody'; sbChartInput({ target: { matches: q => q === '[data-sb-charttext]', value: '[Chorus]\\nC G D' } })`);
    const before = new Set([...F2.S.keys()].filter(k => k.startsWith('songDrafts/')));
    run('sbSaveUpload()'); await settle();
    const nid = [...F2.S.keys()].filter(k => k.startsWith('songDrafts/') && !before.has(k))[0], nd = nid ? F2.S.get(nid) : null;
    run('sbGoStep(4)'); await settle();
    const p4 = run('sbChartPaneHtml(sbDraft())');
    run('sbChartAct("chart-read", { dataset: {} })'); await settle();
    const after = nid ? F2.S.get(nid) : null;
    check('upload: a chart pasted at step 1 is saved with the new draft as its text; step 4 is open at once with it in the box (before the record is levelled), and Read the chart reads it', !!nd && JSON.stringify(nd.chart) === '{"text":"[Chorus]\\nC G D"}' && nd.audio === null
      && run('sbStepOn') === 4 && /data-sb-charttext[^>]*>\[Chorus\]/.test(p4) && /4 beats a bar until/.test(p4) && !!after && after.chart.sections.length === 1 && after.chart.sections[0].name === 'chorus' && after.chart.sections[0].bars.join(' ') === 'C G D',
      JSON.stringify({ chart: nd && nd.chart, step: run('sbStepOn'), read: after && after.chart && after.chart.sections && after.chart.sections.map(x => x.bars) }));
  }
  check('chart and level: every write went to songDrafts and fits the rules (no songFiles, config/class, progress/ or builtSongs write)', F2.st.violations.length === 0 && F2.st.writes.length >= 8 && F2.st.writes.every(w => w.path.startsWith('songDrafts/')),
    F2.st.writes.length + ' writes; ' + (F2.st.violations.slice(0, 2).join('; ') || [...new Set(F2.st.writes.map(w => w.path.split('/')[0]))].join(', ')));
}

/* ── main ── */
const parts = siteParts('teacher.js', ROOT);
for(const p of ['teacher-sb-core.js', 'teacher-sb-beat.js', 'teacher-sb-dsp.js', 'teacher-sb-chart.js']) if(!parts.includes(p)){ console.log(`song-builder-sim: ${p} is not a console part (TEACHER_JS_PARTS in app/boot.js)`); process.exit(1); }
let res;
try { res = await runCases(parts.map(read).join('')); }
catch(e){ console.log('song-builder-sim: the run threw: ' + (e && e.stack || e)); if(STUCK) console.log(`  ✗ ${STUCK_NAME} — ${STUCK}`); process.exit(1); }
if(STUCK) res.push({ name: STUCK_NAME, ok: false, detail: STUCK });
const bad = res.filter(r => !r.ok);
for(const r of res) if(VERBOSE || !r.ok) console.log(`  ${r.ok ? '✓' : '✗'} ${r.name}${r.detail ? ' — ' + r.detail : ''}`);
console.log(`song-builder-sim: ${res.length} cases, ${bad.length} failed`);
process.exit(bad.length ? 1 : 0);
