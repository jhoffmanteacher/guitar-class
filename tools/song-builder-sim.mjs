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
   step, a chart given at step 1, a meter change, a reload; every write a songDrafts write.

   PDFS (2026-11-16; teacher-sb-pdf.js). THE TEXT OF A PAGE: the real sbPdfTextOf (pure) on made-up pages the tool
   lays out word by word (chords over lyrics, a line given as one item, "F" + "#m" touching, two columns, a grid of
   chord names, a one-column sheet wider than the middle, page numbers and URLs, nothing); the one-column and the
   two-column sheets also go through the real reader sbChartRead. THE FLOW (its own console and store): pdf.js is
   STUBBED (pcSheetLoadPdfjs returns a made-up library that serves the made-up pages by the file's bytes and counts
   getTextContent and destroy); sbPdfMounted runs as it is, since the vm's inert page has no pane slot and it returns
   before drawing. A chords pdf at step 1 of a new song, two in one pick at step 4, a scan, a tab pdf, the refusals,
   Remove, another draft opened; no pdf action writes anything.

   PART D (2026-11-16; teacher-sb-publish.js). Its own console and store: a made-up draft past steps 1 to 5 (its
   levelled copy stored as the Song files writer stores one) and a made-up imported song on the list (edit 3). THE
   LISTENS: the real sbPvStep / sbPvRunEnd on positions a playing card would give (a run begun mid-section, one stopped
   short, a whole play to the lap), saved in the draft with the song's signature, started over by a change. PUBLISH:
   off until the listens; every other blocker said as the one reason (over 10 cents, said once; a drift window; a
   section with no name; an unsaved title; an audio id on SONG_FILES or another song's), each writing nothing through
   the button; the stored copy and the list read fresh at the press; a record over 8 pins warns and never blocks.
   Then Cancel, OK (builtSongs then the list, in the rules' exact shape), the stored song equal to the draft's, the
   REAL student app (sim-app-page.mjs, builtSongsSync on the same store) showing it on the Songs page and as its card in
   English and Spanish; a reload; Edit with a new levelled copy (the old one kept while the published song plays it),
   republish (the old copy deleted only after the list names the new edit); Unpublish (the draft's edit number, the
   list, then the song; a later Publish counts on); leaving mid-publish; the health line; the imported song's page and
   its Export, passed by tools/built-song-check.mjs; Delete (the draft's OK / Cancel never deletes a published song;
   the typed title: the list first, then the song, the draft, its copy; the other song untouched). The rules check
   above takes builtSongs/{id} and builtSongsMeta/list as firestore.rules "BUILT SONGS" writes them. */
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
const DRAFT_KEYS = 'artist,audio,beat,chart,level,listens,pitch,pubVer,savedAt,source,step,title,v,volume';
function rulesCheck(op, path, data){
  const p = path.split('/');
  if(op === 'delete') return (p[0] === 'songDrafts' && p.length === 2) || (p[0] === 'songFiles' && (p.length === 2 || (p.length === 4 && p[2] === 'pieces')))
    || (p[0] === 'builtSongs' && p.length === 2) || path === 'builtSongsMeta/list' ? '' : 'delete outside the builder\'s paths: ' + path;
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
  /* Part d: firestore.rules "BUILT SONGS", written out again (create and update are one rule). */
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

  /* ½ beat (2026-11-16, American Girl's clicks on the "and"): bar 1 AND every pin move half a beat, so the grid keeps
     its tempo; the other way puts it back. A pin is added first when the made-up record got none. */
  {
    run("(() => { const d = sbDraft(); if(!(d.beat.pins || []).length) d.beat = Object.assign({}, d.beat, { pins: [{ bar: 5, t: Math.round(sbBarTime(d.beat, 5) * 10000) / 10000 }] }); })()");
    const g0 = JSON.parse(run('JSON.stringify({ a: sbDraft().beat.anchor, pins: sbDraft().beat.pins, bar: sbBarSec(sbDraft().beat) })'));
    run("sbBeatAct('a+half', { dataset: {} })");
    const g1 = JSON.parse(run('JSON.stringify({ a: sbDraft().beat.anchor, pins: sbDraft().beat.pins, note: sbNote })'));
    run("sbBeatAct('a-half', { dataset: {} })");
    const g2 = JSON.parse(run('JSON.stringify({ a: sbDraft().beat.anchor, pins: sbDraft().beat.pins })'));
    const half = g0.bar / 4 / 2, near = (x, y) => Math.abs(x - y) < 0.004;
    check('beat: "½ beat ▶" moves bar 1 and every pin half a beat later (same bars, same tempo), and "◀ ½ beat" puts them back',
      g0.pins.length >= 1 && near(g1.a, g0.a + half) && g1.pins.length === g0.pins.length && g1.pins.every((q, i) => q.bar === g0.pins[i].bar && near(q.t, g0.pins[i].t + half))
      && near(g2.a, g0.a) && g2.pins.every((q, i) => near(q.t, g0.pins[i].t)) && /half a beat later/.test(g1.note),
      JSON.stringify({ half, g0, g1, g2 }));
    await sleep(1400); await settle();
  }

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
    /cannot hold this record's beat/.test(pane21[0]) && /does not fit the builder: the clicks will drift/.test(pane21[0]) && !/does not fit the builder/.test(paneOk) && /about 21 pins/.test(pane21[0]) && /Send the mp3 to Claude/.test(pane21[0]) && /Beat: send to Claude/.test(pane21[1])
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
  await pdfCases(consoleSrc, check);
  await publishCases(consoleSrc, check);
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

/* ── Pdfs: the text of a page, and the flow with a made-up pdf.js ── */
/* A word on a made-up page: x = its left edge, y = its baseline (y down), 6 points a letter, 10 points high. */
const PCW = 6;
const W = (x, y, s) => ({ s, x, y, w: s.length * PCW, h: 10 });
const PAGES = {
  /* one column, chords over lyrics, a stanza gap before the chorus (36 points against 12) */
  oneCol: [W(72, 80, '[Verse]'), W(72, 92, 'G'), W(72 + 18 * PCW, 92, 'D'), W(72, 104, 'Walking down the made-up road'), W(72, 116, 'Em'), W(72 + 16 * PCW, 116, 'C'),
    W(72, 128, 'Singing all the way back home'), W(72, 164, '[Chorus]'), W(72, 176, 'C'), W(72 + 10 * PCW, 176, 'G'), W(72, 188, 'Light it up tonight')],
  oneColText: ['[Verse]', 'G'.padEnd(18) + 'D', 'Walking down the made-up road', 'Em'.padEnd(16) + 'C', 'Singing all the way back home', '', '[Chorus]', 'C'.padEnd(10) + 'G', 'Light it up tonight'].join('\n'),
  /* a whole line as ONE item with inner spaces, and one with leading spaces */
  oneItem: [W(72, 100, 'G        D        Em'), W(72, 112, 'Made-up words for the test'), W(72, 124, '    C'), W(72, 136, 'more made-up words')],
  oneItemText: ['G        D        Em', 'Made-up words for the test', '    C', 'more made-up words'].join('\n'),
  /* "F" and "#m" as two touching items */
  touch: [W(72, 100, 'F'), W(72 + PCW, 100, '#m'), W(72 + 8 * PCW, 100, 'G'), W(72, 112, 'Made-up words here')],
  touchText: 'F#m'.padEnd(8) + 'G\nMade-up words here',
  /* two columns of lyrics with chords: a verse at x 50, a chorus at x 330 */
  twoCol: (() => {
    const L =[['[Verse]'], [['G', 0], ['D', 14]], ['Walking down the road'], [['Em', 0], ['C', 12]], ['Singing on my way'], [['C', 0], ['G', 8]], ['Home again tonight']];
    const R = [['[Chorus]'], [['Am', 0], ['F', 12]], ['Under the made-up moon'], [['C', 0], ['G', 10]], ['Light it up again'], [['Dm', 0], ['E', 8]], ['Till the morning comes']];
    const out = [];
    [[L, 50], [R, 330]].forEach(([rows, x0]) => rows.forEach((r, k) => r.forEach(it => typeof it === 'string' ? out.push(W(x0, 100 + 12 * k, it)) : out.push(W(x0 + it[1] * PCW, 100 + 12 * k, it[0])))));
    return out;
  })(),
  twoColText: ['[Verse]', 'G'.padEnd(14) + 'D', 'Walking down the road', 'Em'.padEnd(12) + 'C', 'Singing on my way', 'C'.padEnd(8) + 'G', 'Home again tonight', '',
    '[Chorus]', 'Am'.padEnd(12) + 'F', 'Under the made-up moon', 'C'.padEnd(10) + 'G', 'Light it up again', 'Dm'.padEnd(8) + 'E', 'Till the morning comes'].join('\n'),
  /* a grid of chord names in four aligned columns, no lyric words: a clear gap down the middle on every row */
  gridRows: ['G D Em C', 'Am F C G', 'D A Bm G', 'E B C#m A', 'C G Am F', 'F C Dm Bb'],
  /* one column whose lyric lines cross the middle (chords far apart above them) */
  wideRows: [['G', 'D'], 'Walking down the made-up road with nothing on my mind at all', ['Em', 'C'], 'Singing all the way back home under a made-up summer sky', ['C', 'G'], 'Light it up and let the whole made-up block glow tonight'],
  /* page numbers and URLs */
  junk: [W(72, 40, 'www.example.org'), W(72, 100, 'G'), W(72 + 10 * PCW, 100, 'D'), W(72, 112, 'Some made-up words here'), W(72, 700, 'Page 2 / 3'), W(72, 712, 'https://example.org/made-up-song')],
  junkText: 'G'.padEnd(10) + 'D\nSome made-up words here',
};
PAGES.grid = PAGES.gridRows.flatMap((r, k) => r.split(' ').map((c, j) => W([72, 172, 372, 472][j], 100 + 12 * k, c)));
PAGES.wide = PAGES.wideRows.flatMap((r, k) => Array.isArray(r) ? [W(72, 100 + 12 * k, r[0]), W(400, 100 + 12 * k, r[1])] : [W(72, 100 + 12 * k, r)]);

/* The made-up pdf.js: a file's bytes name its record; getTextContent and destroy are counted. */
const PDFS = new Map();
const tcOf = items => ({ items: items.map(i => ({ str: i.s, transform: [i.h, 0, 0, i.h, i.x, i.y], width: i.w, height: i.h })) });
function pdfOf(name, tag, pages){
  const bytes = new TextEncoder().encode('%PDF-1.7\n% made-up ' + tag + '\n' + 'x'.repeat(40));
  const rec = { name, pages, opened: 0, textCalls: 0, destroyed: 0 };
  PDFS.set(sha(bytes), rec);
  return { file: { name, size: bytes.length, type: 'application/pdf', arrayBuffer: async () => bytes.slice().buffer }, rec };
}
const FAKE_PDFJS = {
  getDocument({ data }){
    const rec = PDFS.get(sha(data));
    if(!rec) return { promise: Promise.reject(Object.assign(new Error('Invalid PDF structure.'), { name: 'InvalidPDFException' })) };
    rec.opened++;
    const doc = { numPages: rec.pages.length,
      async getPage(n){ const items = rec.pages[n - 1]; return { getViewport: () => ({ convertToViewportPoint: (x, y) => [x, y], width: 612, height: 792 }), getTextContent: async () => { rec.textCalls++; await tick(); return tcOf(items); } }; },
      destroy(){ rec.destroyed++; } };
    return { promise: Promise.resolve(doc) };
  },
};
async function pdfCases(consoleSrc, check){
  const F3 = makeDb(), C = makeConsole(consoleSrc, F3), { run } = C;
  C.box.pcSheetLoadPdfjs = async () => FAKE_PDFJS;      // app/cards.js is not in the console's vm
  const textOf = run('sbPdfTextOf');
  const read = (t, m) => { const r = run('sbChartRead')(t, m || '4/4'); return { secs: r.sections.map(s => (s.name || '?') + ':' + s.bars.join(' ')).join(' / '), bad: r.bad.length, fmt: r.fmt }; };
  const norm = t => t.split('\n').map(l => l.trim().split(/\s+/).join(' '));

  /* A. the text of a page (pure) */
  {
    const t = textOf(PAGES.oneCol), r = read(t);
    check('pdf text: one column of chords over lyrics comes out line by line (each chord line before its lyric line, chords over their words, a blank line at the stanza gap); the reader takes it: verse G D Em C, chorus C G, 0 refused',
      t === PAGES.oneColText && r.secs === 'verse:G D Em C / chorus:C G' && r.bad === 0 && r.fmt === 'chords over lyrics', JSON.stringify(t) + ' | ' + JSON.stringify(r));
  }
  {
    const t = textOf(PAGES.oneItem);
    check('pdf text: a line given as ONE item keeps its inner spaces, and an item\'s leading spaces keep its place', t === PAGES.oneItemText, JSON.stringify(t));
  }
  {
    const t = textOf(PAGES.touch);
    check('pdf text: "F" and "#m" as two touching items join to "F#m" with no space', t === PAGES.touchText, JSON.stringify(t));
  }
  {
    const t = textOf(PAGES.twoCol), r = read(t);
    check('pdf text: two columns of lyrics with chords are read left column first, then the right, a blank line between; the reader takes it: verse 6 bars, chorus 6 bars, 0 refused',
      t === PAGES.twoColText && r.secs === 'verse:G D Em C C G / chorus:Am F C G Dm E' && r.bad === 0, JSON.stringify(t).slice(0, 400) + ' | ' + JSON.stringify(r));
  }
  {
    const t = textOf(PAGES.grid), got = norm(t);
    check(`pdf text: a grid of chord names in aligned columns with no lyric words is ONE column: ${PAGES.gridRows.length} rows in order, 4 chords each`, JSON.stringify(got) === JSON.stringify(PAGES.gridRows), JSON.stringify(got));
  }
  {
    const t = textOf(PAGES.wide), got = norm(t), want = PAGES.wideRows.map(r => Array.isArray(r) ? r.join(' ') : r);
    check('pdf text: a one-column sheet whose lyric lines cross the middle is not split: 6 lines in order', JSON.stringify(got) === JSON.stringify(want), JSON.stringify(got));
  }
  {
    const t = textOf(PAGES.junk);
    check('pdf text: "Page 2 / 3", a bare https URL and a bare www address are dropped; the song lines stay', t === PAGES.junkText, JSON.stringify(t));
  }
  check('pdf text: no items, null, and only blank items give \'\'', textOf([]) === '' && textOf(null) === '' && textOf([W(72, 100, '   ')]) === '', JSON.stringify([textOf([]), textOf(null)]));

  /* B. the flow */
  let pdfW = 0;
  const reading = () => run('sbPdf.reading');
  const pick = async (kind, files) => {
    const w0 = F3.st.writes.length;
    C.box.__pdfs = files.map(f => f.file || f);
    run(`sbPdfAdd(${JSON.stringify(kind)}, __pdfs)`);
    const t0 = Date.now();
    do { await settle(); } while(reading() && Date.now() - t0 < SETTLE_MAX_MS);
    pdfW += F3.st.writes.length - w0;
  };
  const otherId = 'sb-pdfotherdraft1';
  F3.S.set('songDrafts/' + otherId, { v: 1, title: 'Test 1 Other', artist: 'Nobody', step: 4, source: { name: 'test.mp3', bytes: 400000, sha256: hex64(3), durationSec: 60, sampleRate: 44100, channels: 2, kbps: 192 },
    audio: { id: otherId + '-abcdef12', bytes: 1900000, sha256: hex64(4), durationSec: 60, centsOff: 2, gainDb: 1, sourceSha256: hex64(3) }, volume: { before: -14, after: -12.5, samplePeak: -1.2, truePeak: -1.1, ceilingDb: -1, encodes: 1 },
    pitch: { cents: 2, peaks: 10 }, beat: { meter: '4/4', bpm: 96, anchor: 0.5, pins: [], trackBpm: 96, trackSub: 2, driftOff: 0, pinsNeeded: 2 }, chart: null, level: null, savedAt: 0 });
  run('renderTeacherSongBuilder()'); await settle();
  const names = () => run('sbPdf.files.map(f => f.name).join(",")');
  /* B9: a chords pdf at step 1 of a new song */
  const A = pdfOf('chords-a.pdf', 'a', [PAGES.oneCol]);
  run('sbNewSong()'); await settle();
  C.box.__f = fileOf('test-a.mp3', SRC_A, 24); run('sbPickFile(__f)'); await settle();
  run("sbNew.title = 'Test 0 Pdf'; sbNew.artist = 'Nobody'");
  await pick('chords', [A]);
  const t1 = PAGES.oneColText, note1 = run('sbNote'), inNew = run('sbNew && sbNew.chartText');
  const before = new Set([...F3.S.keys()].filter(k => k.startsWith('songDrafts/')));
  run('sbSaveUpload()'); await settle();
  const nid = ([...F3.S.keys()].filter(k => k.startsWith('songDrafts/') && !before.has(k))[0] || '').slice(11), nd = nid ? F3.S.get('songDrafts/' + nid) : null;
  check('pdf flow: a chords pdf picked on a NEW song at step 1 goes into its chart text; Next saves it as the draft\'s chart.text; the pdf follows the new draft (sbPdf.id), still listed',
    inNew === t1 && /9 lines read into the chart box \(it is read at step 4\)\./.test(note1) && nd && nd.chart && nd.chart.text === t1 && run('sbSel') === nid && run('sbPdf.id') === nid && run('sbPdfMine().length') === 1 && A.rec.textCalls === 1,
    JSON.stringify({ note: note1, inNew: inNew === t1, chart: nd && nd.chart && nd.chart.text === t1, id: run('sbPdf.id') === nid, mine: run('sbPdfMine().length') }));
  /* B10: two chords pdfs in ONE pick at step 4 land in pick order after what is there */
  run('sbGoStep(4)'); await settle();
  const B = pdfOf('chords-b.pdf', 'b', [PAGES.twoCol]), Cc = pdfOf('chords-c.pdf', 'c', [PAGES.oneItem, PAGES.touch]);
  await pick('chords', [B, Cc]);
  const paste = () => run('sbChFor(sbSel).text');
  const want10 = [t1, PAGES.twoColText, PAGES.oneItemText + '\n\n' + PAGES.touchText].join('\n\n');
  check('pdf flow: two chords pdfs in one pick at step 4 both land in the paste box, in pick order, after the text that was there (a two-page pdf\'s pages in order); the box shows', paste() === want10 && run('sbChFor(sbSel).view') === 'paste'
    && /lines read into the chart box\./.test(run('sbNote')) && names() === 'chords-a.pdf,chords-b.pdf,chords-c.pdf',
    JSON.stringify({ starts: (paste() || '').slice(0, 30), hasB: (paste() || '').includes('Under the made-up moon'), hasC: (paste() || '').includes('F#m'), files: names(), note: run('sbNote') }));
  /* B11: a scan */
  const S = pdfOf('scan.pdf', 'scan', [[], [W(500, 780, '1')]]);
  const p11 = paste();
  await pick('chords', [S]);
  const fS = run('sbPdf.files.find(f => f.name === "scan.pdf")');
  check('pdf flow: a chords pdf with no text on its pages is a picture: 0 text pages of 2, the note says so, the chart text unchanged, the pdf kept to be shown',
    fS && fS.textPages === 0 && fS.pages === 2 && /scan\.pdf is a picture \(a scan or a photo\)/.test(run('sbNote')) && paste() === p11 && S.rec.textCalls === 2, JSON.stringify({ file: fS && { textPages: fS.textPages, pages: fS.pages }, note: run('sbNote'), same: paste() === p11 }));
  /* B12: a tab pdf */
  const T = pdfOf('tab-1.pdf', 'tab1', [PAGES.oneCol]);
  await pick('tab', [T]);
  const fT = run('sbPdf.files.find(f => f.name === "tab-1.pdf")');
  check('pdf flow: a tab pdf is only shown: its text is never asked for (getTextContent 0 times), the chart text unchanged, the note says it is shown beside the chart',
    fT && fT.kind === 'tab' && T.rec.textCalls === 0 && T.rec.opened === 1 && paste() === p11 && /1 tab pdf added: shown beside the chart\./.test(run('sbNote')), JSON.stringify({ calls: T.rec.textCalls, note: run('sbNote'), same: paste() === p11 }));
  /* B13: refusals, one pick each */
  {
    const notPdf = new TextEncoder().encode('Made-up words, not a pdf at all');
    const extra = [2, 3, 4, 5].map(n => pdfOf(`tab-${n}.pdf`, 'tab' + n, [PAGES.oneCol]));
    const tries = [
      ['not a pdf', 'chords', [{ name: 'notes.pdf', size: notPdf.length, arrayBuffer: async () => notPdf.slice().buffer }], /notes\.pdf was not added: it is not a pdf\./, 5],
      ['an empty file', 'chords', [{ name: 'empty.pdf', size: 0, arrayBuffer: async () => new ArrayBuffer(0) }], /empty\.pdf was not added: it is empty/, 5],
      ['the same file twice', 'tab', [T], /tab-1\.pdf is here already\./, 5],
      ['the 9th file', 'tab', extra, /tab-5\.pdf was not added: 8 pdfs at most\./, 8],
    ];
    const off = [];
    for(const [what, kind, fs, re, n] of tries){
      const p0 = paste();
      await pick(kind, fs);
      const note = run('sbNote');
      if(!(re.test(note) && run('sbPdf.files.length') === n && paste() === p0 && !/notes\.pdf|empty\.pdf|tab-5\.pdf/.test(names()) && names().split(',').filter(x => x === 'tab-1.pdf').length === 1)) off.push(`${what}: ${note} [${names()}]`);
    }
    check(`pdf flow: refused, each with its reason in the note and nothing added: not a pdf, an empty file, the same file twice, the 9th file (SB_PDF_MAX_FILES ${run('SB_PDF_MAX_FILES')}); the 3 before the 9th are added`, !off.length && extra[3].rec.opened === 0, off.join(' ; ') || names());
  }
  /* B14: Remove */
  {
    const w0 = F3.st.writes.length, i = run('sbPdf.files.findIndex(f => f.name === "scan.pdf")');
    run(`sbPdfAct('pdf-remove', { dataset: { sbI: '${i}' } })`); await settle();
    pdfW += F3.st.writes.length - w0;
    const others = [A, B, Cc, T].map(x => x.rec.destroyed);
    check('pdf flow: Remove drops that one pdf and destroys its document; the other 7 stay, none destroyed', i >= 0 && S.rec.destroyed === 1 && run('sbPdf.files.length') === 7 && !/scan\.pdf/.test(names()) && others.every(n => n === 0) && /scan\.pdf is removed\./.test(run('sbNote')),
      JSON.stringify({ i, destroyed: S.rec.destroyed, others, files: names() }));
  }
  /* B15: another draft opened */
  {
    const kept = [A, B, Cc, T].map(x => x.rec).concat([2, 3, 4].map(n => [...PDFS.values()].find(r => r.name === `tab-${n}.pdf`)));
    const w0 = F3.st.writes.length;
    run(`sbOpen(${JSON.stringify(otherId)})`); await settle();
    pdfW += F3.st.writes.length - w0;
    const des = kept.map(r => r.destroyed);
    check(`pdf flow: opening another draft drops every pdf and destroys each document once (${kept.length} of ${kept.length}); none is shown for the other draft`, run('sbSel') === otherId && run('sbPdf.id') === otherId && run('sbPdf.files.length') === 0 && run('sbPdfMine().length') === 0 && des.every(n => n === 1),
      JSON.stringify({ id: run('sbPdf.id') === otherId, files: run('sbPdf.files.length'), destroyed: des }));
  }
  /* B16 */
  const dw = F3.st.writes;
  check('pdf flow: no pdf action wrote anything (0 writes across 8 picks, a Remove and an open); the run\'s only writes are the new draft\'s songDrafts write, within the rules',
    pdfW === 0 && dw.length === 1 && dw[0].path === 'songDrafts/' + nid && F3.st.violations.length === 0, JSON.stringify({ pdfWrites: pdfW, writes: dw.map(w => w.path) }));
}

/* ── PART D (2026-11-16; teacher-sb-publish.js): Preview's listens, Publish, Edit, Unpublish, Delete, Export, the
   health line. Its own console and store: a made-up draft that has passed steps 1 to 5 (its levelled copy stored the
   way the Song files writer stores one) and a made-up imported song on the list. Every write is checked by rulesCheck
   (firestore.rules "BUILT SONGS" written out above); the student side is the REAL app (sim-app-page.mjs) merging the
   same store through builtSongsSync. ── */
async function publishCases(consoleSrc, check){
  const F4 = makeDb(), C = makeConsole(consoleSrc, F4), { run, env } = C;
  const id = 'sb-pubdraft0001', other = 'sb-otherbuilt01';
  const LVC = LEVELLED.get('c'), LVB = LEVELLED.get('b'), aid = id + '-' + sha(LVC).slice(0, 8), oaid = other + '-' + sha(LVB).slice(0, 8);
  const putCopy = (audioId, bytes, dur) => {
    F4.S.set('songFiles/' + audioId, { file: audioId + '.mp3', bytes: bytes.length, sha256: sha(bytes), pieces: Math.ceil(bytes.length / 900000), pieceBytes: 900000, durationSec: dur, state: 'ready', uploadedAt: TS });
    for(let i = 0; i * 900000 < bytes.length; i++) F4.S.set(`songFiles/${audioId}/pieces/${i}`, { i, data: new FakeBytes(bytes.subarray(i * 900000, (i + 1) * 900000)) });
  };
  putCopy(aid, LVC, 15); putCopy(oaid, LVB, 24.02);
  const chart = { text: '[Intro]\n| G |\n[Verse 1]\nG        C\nTest words here\n[Chorus]\n| D | G C |', meter: '4/4', fmt: 'chords', sections: [
    { name: 'intro', label: 'Intro', n: null, bars: ['G'], lyrics: null },
    { name: 'verse', label: 'Verse 1', n: 1, bars: ['G', 'C'], lyrics: [{ text: 'Test <b>words</b> & "more"', bars: 2 }] },
    { name: 'chorus', label: 'Chorus', n: null, bars: ['D', 'G:2 C:2'], lyrics: null }], left: [], kept: [], edited: true };
  F4.S.set('songDrafts/' + id, { v: 1, title: 'Test 0 Publish', artist: 'The Test Band', step: 5,
    source: { name: 'test-c.mp3', bytes: SRC_C.length, sha256: sha(SRC_C), durationSec: 15, sampleRate: 44100, channels: 1, kbps: 192 },
    audio: { id: aid, bytes: LVC.length, sha256: sha(LVC), durationSec: 15, centsOff: 2, gainDb: 1.5, sourceSha256: sha(SRC_C) },
    volume: { before: -14, after: -12.5, samplePeak: -1.2, truePeak: -1.1, ceilingDb: -1, encodes: 1 }, pitch: { cents: 2, peaks: 10 },
    beat: { meter: '4/4', bpm: 96, anchor: 0.5, pins: [], trackBpm: 96, trackSub: 2, driftOff: 0, pinsNeeded: 2 }, chart, level: { versions: 'both', start: 'full', range: null }, listens: null, pubVer: null, savedAt: TS });
  /* The imported song: the same chart as the draft, its own audio, ver 3. */
  const otherSong = run('sbSongOf')(JSON.parse(JSON.stringify(F4.S.get('songDrafts/' + id))));
  F4.S.set('builtSongs/' + other, { v: 1, title: 'Test 1 Imported', artist: '', audio: { id: oaid, bytes: LVB.length, sha256: sha(LVB), durationSec: 24.02, centsOff: 0 }, song: JSON.parse(JSON.stringify(otherSong)), savedAt: TS });
  F4.S.set('builtSongsMeta/list', { songs: { [other]: 3 }, updatedAt: TS });
  const otherDoc0 = JSON.stringify(F4.S.get('builtSongs/' + other)), otherCopyKeys = 1 + Math.ceil(LVB.length / 900000);
  const nW = () => F4.st.writes.length, since = w0 => F4.st.writes.slice(w0).map(w => w.op + ' ' + w.path), keysOf = p => [...F4.S.keys()].filter(k => k.startsWith(p)).sort();
  run('teacherMicSaveFile = (name, blob) => { window.__saved = { name, blob }; }');
  run('renderTeacherSongBuilder()'); await settle();
  run(`sbOpen(${JSON.stringify(id)})`); await settle();

  /* D1: the steps are all built, and the words that said they were not are gone */
  {
    const html = run('sbDetailHtml()') + run('sbStartHtml()') + run('sbLevelPaneHtml(sbDraft())');
    const nav5 = run('sbStepOn = 5; sbNavHtml(sbDraft())');
    check('steps: Preview and Publish are open for a draft that passes the checks; no "not built", "next update" or "Coming next" left on the steps, the start screen or the Level step; step 5\'s Next reads "Next: Preview →" and is on',
      run('sbStepReady(sbDraft(), 6) && sbStepReady(sbDraft(), 7) && SB_BUILT_STEPS === 7') && !/not built|next update|Coming next|come with the Publish/.test(html + nav5) && /Next: Preview →/.test(nav5) && !/data-sb-step="6" disabled/.test(nav5) && !/data-sb-step="6"[^>]*disabled/.test(nav5),
      nav5.slice(0, 300));
    check('health line: the imported song on the list, "1 published; all pass today\'s checks"; it is listed as Published and Imported', /1 published; all pass today's checks/.test(run('sbHealthHtml()')) && /Imported/.test(run('sbListHtml()')),
      run('sbHealthHtml()'));
  }
  /* D2: Preview: the step is reached and saved; the pane */
  {
    const w0 = nW();
    run('sbGoStep(6)'); await settle(100);
    const pane = run('sbPreviewPaneHtml(sbDraft())');
    check('preview: going to step 6 saves the furthest step (one songDrafts write); the pane has the three listens, the Spanish-templates line and the title as students see it (escaped), and no "does not fit" box for a steady record',
      run('sbStepOn') === 6 && F4.S.get('songDrafts/' + id).step === 6 && since(w0).filter(x => !x.includes('songFilesUsage')).join() === 'set songDrafts/' + id
      && (pane.match(/class="sb-listen[ "]/g) || []).length === 3 && /fixed Spanish templates/.test(pane) && pane.includes('"Test 0 Publish" - The Test Band — Play Along') && !/does not fit the builder/.test(pane),
      JSON.stringify({ step: run('sbStepOn'), writes: since(w0), listens: (pane.match(/class="sb-listen[ "]/g) || []).length }));
  }
  /* D3: Publish stays off until the three listens */
  {
    const why = run('sbPublishWhy(sbDraft(), sbSel)');
    const w0 = nW();
    env.confirmAnswer = true; env.confirms.length = 0;
    run('sbPublish()'); await settle();
    check('publish: off until the three listens (the only reason left); pressing it writes nothing, asks nothing and says why; the button is disabled',
      why.length === 1 && /Listen at the Preview step/.test(why[0]) && nW() === w0 && env.confirms.length === 0 && /^Not published: Listen at the Preview step/.test(run('sbNote')) && /data-sb-act="publish" disabled/.test(run('sbPublishBtnHtml(sbDraft())')),
      JSON.stringify({ why, writes: since(w0), note: run('sbNote') }));
  }
  /* D4: the listens: a section counts only when one run of the play began at its start and reached its end */
  const listenThrough = async (Cx, seqs) => {
    Cx.run(`sbPv = { id: sbSel, key: 'sim', sig: sbListenSig(sbDocOf(sbDraft())), node: null, act: null, run: null, L: null }`);
    const ex = Cx.run('builtSongExpand(sbSel, sbDocOf(sbDraft()))');
    const L = { firstBar: ex.activity.card.sections[0].fromBar, sections: ex.activity.card.sections.map(x => ({ fromBar: x.fromBar, bars: x.bars, reps: 1 })) };
    Cx.box.__L = L;
    const heardAfter = [];
    for(const seq of seqs){
      for(const pos of seq) Cx.run(`sbPvStep(sbPv, __L, ${pos})`);
      Cx.run('sbPvRunEnd(sbPv)');                         // the play stops
      heardAfter.push(JSON.stringify(Cx.run('(sbDraft().listens && sbDraft().listens.heard) || []')));
    }
    Cx.run('sbPv = null');
    await sleep(500); await settle();
    return heardAfter;
  };
  {
    const steps = (a, b, n) => Array.from({ length: n + 1 }, (_, i) => Math.round((a + (b - a) * i / n) * 1000) / 1000);
    const h = await listenThrough(C, [
      steps(1.6, 2.95, 8),                                 // the verse from its middle: not heard
      steps(3.02, 4.6, 8),                                 // the chorus, stopped 0.4 bar before its end: not heard
      [...steps(0.02, 0.95, 6), ...steps(1.02, 2.85, 8), ...steps(3.0, 4.78, 8), 0.03],   // the whole card and the lap back: all three
    ]);
    const st = F4.S.get('songDrafts/' + id);
    check('listens: a play begun mid-section is not a listen, one stopped before the section\'s end is not, a whole play to the lap is all three; the listens are saved in the draft with the song\'s own signature',
      h[0] === '[]' && h[1] === '[]' && h[2] === '[0,1,2]' && st.listens && st.listens.heard.join() === '0,1,2' && st.listens.sig === run('sbListenSig(sbDocOf(sbDraft()))') && run('sbListensOf(sbDraft()).all'),
      JSON.stringify({ h, stored: st.listens }));
    const other4 = run(`(() => { const d = JSON.parse(JSON.stringify(sbDraft())); d.level = { versions: 'full', range: null }; return sbListensOf(d).all; })()`);
    check('listens: a change to the song (here the level) starts them over', other4 === false, String(other4));
  }
  /* D5: every other blocker, each said, each writing nothing; the "does not fit" warning is shown and blocks nothing */
  {
    const variant = mut => run(`(() => { const keep = sbDrafts.get(sbSel), d = JSON.parse(JSON.stringify(keep)); (${mut})(d); sbDrafts.set(sbSel, d); try { return sbPublishWhy(d, sbSel); } finally { sbDrafts.set(sbSel, keep); } })()`);
    const pitch = variant('d => { d.pitch.cents = 12.3; }'), pitch2 = variant('d => { d.pitch.cents = 12.3; d.audio.centsOff = 12.3; }');
    const drift = variant('d => { d.beat.driftOff = 2; }'), unnamed = variant('d => { d.chart.sections[1].name = null; }');
    const dirty = variant('d => { d.dirty = true; }'), nofit = variant('d => { d.beat.pinsNeeded = 21; }');
    run(`SONG_FILES[${JSON.stringify(aid)}] = { file: 'x.mp3', bytes: 1, sha256: '${'0'.repeat(64)}', durationSec: 1 }`);
    const listed = run('sbPublishWhy(sbDraft(), sbSel)');
    run(`delete SONG_FILES[${JSON.stringify(aid)}]`);
    run(`sbPublished.set('sb-clashsong001', { title: 'Clash', artist: '', ver: 1, doc: { audio: { id: ${JSON.stringify(aid)}, sha256: '${'1'.repeat(64)}' } } })`);
    const clash = run('sbPublishWhy(sbDraft(), sbSel)');
    run(`sbPublished.delete('sb-clashsong001')`);
    const facts = {
      pitch: pitch.length === 1 && /12\.3 cents above A = 440: a song more than 10 cents off A = 440 cannot be published\. Send the mp3 to Claude/.test(pitch[0]),
      pitchSaidOnce: pitch2.length === 1 && /cannot be published/.test(pitch2[0]),
      drift: drift.length === 1 && /2 places in the song drift more than 30 ms/.test(drift[0]),
      unnamed: unnamed.length >= 1 && /no name/.test(unnamed[0]),
      dirty: dirty.length === 1 && /not saved/.test(dirty[0]),
      listed: listed.length === 1 && /on the site's list of song files/.test(listed[0]),
      clash: clash.length === 1 && /already sb-clashsong001's, with other bytes/.test(clash[0]),
      nofitDoesNotBlock: nofit.length === 0,
    };
    const nofitPanes = run(`(() => { const keep = sbDrafts.get(sbSel), d = JSON.parse(JSON.stringify(keep)); d.beat.pinsNeeded = 21; sbDrafts.set(sbSel, d); try { return [sbPreviewPaneHtml(d), sbPublishPaneHtml(d), sbPublishBtnHtml(d)]; } finally { sbDrafts.set(sbSel, keep); } })()`);
    facts.nofitShown = nofitPanes.every((h, i) => i === 2 || /This song does not fit the builder: it cannot hold this record's beat\./.test(h)) && /This does not stop Publish/.test(nofitPanes[1]) && !/disabled/.test(nofitPanes[2]);
    check('publish blockers: over 10 cents (said once, even when the validator says it too), a drift window not pinned, a section with no name, an unsaved title, an audio id on SONG_FILES, an audio id another song plays with other bytes: each the one reason; a record over 8 pins shows "This song does not fit the builder" on Preview and Publish and blocks nothing',
      Object.values(facts).every(Boolean), JSON.stringify({ facts, pitch, drift, unnamed: unnamed.slice(0, 1), listed, clash }));
    /* the same, through the button: nothing written */
    const w0 = nW();
    run(`(() => { const keep = sbDrafts.get(sbSel), d = JSON.parse(JSON.stringify(keep)); d.pitch.cents = 12.3; sbDrafts.set(sbSel, d); window.__keep = keep; })()`);
    env.confirms.length = 0; run('sbPublish()'); await settle();
    const notePitch = run('sbNote');
    run('sbDrafts.set(sbSel, window.__keep)');
    run(`(() => { const keep = sbDrafts.get(sbSel), d = JSON.parse(JSON.stringify(keep)); d.beat.driftOff = 1; sbDrafts.set(sbSel, d); })()`);
    run('sbPublish()'); await settle();
    const noteDrift = run('sbNote');
    run('sbDrafts.set(sbSel, window.__keep)');
    check('publish blockers through the button: over 10 cents and an unpinned drift window each write nothing and ask nothing', nW() === w0 && env.confirms.length === 0 && /^Not published: The record is 12\.3 cents above/.test(notePitch) && /^Not published: 1 place in the song drifts/.test(noteDrift),
      JSON.stringify({ writes: since(w0), notePitch, noteDrift }));
    /* At the press: the stored copy and the list are read fresh. */
    const head = F4.S.get('songFiles/' + aid);
    F4.S.set('songFiles/' + aid, Object.assign({}, head, { state: 'uploading' }));
    const w1 = nW();
    run('sbPublish()'); await settle();
    const noteCopy = run('sbNote');
    F4.S.set('songFiles/' + aid, head);
    const fullList = {}; for(let i = 0; i < 200; i++) fullList['sb-filler' + String(i).padStart(5, '0')] = 1;
    const meta0 = F4.S.get('builtSongsMeta/list');
    F4.S.set('builtSongsMeta/list', { songs: fullList, updatedAt: TS });
    run('sbPublish()'); await settle();
    const noteFull = run('sbNote');
    F4.S.set('builtSongsMeta/list', meta0);
    check('publish at the press: an unfinished stored copy, and a list already holding 200 songs, each refuse with nothing written', nW() === w1 && /^Not published: the levelled copy in the database is missing, unfinished/.test(noteCopy) && /already holds 200 built songs/.test(noteFull),
      JSON.stringify({ writes: since(w1), noteCopy, noteFull }));
  }
  /* D6: Export of the draft */
  {
    run('window.__saved = null; sbExport("draft")');
    const sv = run('window.__saved');
    const f = sv ? JSON.parse(await sv.blob.text()) : null;
    check('export (a draft): one file, the Import shape { id, v, title, artist, audio, song }, the draft\'s own song, and builtSongCheck passes on it',
      f && Object.keys(f).sort().join() === 'artist,audio,id,song,title,v' && f.id === id && run('builtSongCheck')(f.id, { v: f.v, title: f.title, artist: f.artist, audio: f.audio, song: f.song }).length === 0
      && run('sbCanon')(f.song) === run('sbCanon(sbDocOf(sbDraft()).song)') && /^test-0-publish-sb-pubdraft0001\.json$/.test(sv.name),
      sv ? sv.name : 'nothing saved');
  }
  /* D7: Publish: Cancel writes nothing; OK writes the song, then the list */
  let pubDoc = null;
  {
    const w0 = nW();
    env.confirmAnswer = false; env.confirms.length = 0;
    run('sbPublish()'); await settle();
    const cancelled = nW() === w0 && env.confirms.length === 1 && /^Publish "Test 0 Publish"\? It goes on the Songs page under More Play Along songs/.test(env.confirms[0]);
    env.confirmAnswer = true;
    run('sbPublish()'); await settle(200);
    const seq = since(w0);
    const doc = F4.S.get('builtSongs/' + id), meta = F4.S.get('builtSongsMeta/list');
    pubDoc = doc;
    const bare = doc ? Object.assign({}, doc) : null; if(bare) delete bare.savedAt;
    check('publish: Cancel writes nothing; OK writes builtSongs/<id> and then builtSongsMeta/list (in that order, nothing else), the song in the rules\' exact shape with the server time',
      cancelled && seq.join(' → ') === `set builtSongs/${id} → set builtSongsMeta/list` && doc && Object.keys(doc).sort().join() === 'artist,audio,savedAt,song,title,v' && doc.savedAt === TS && F4.st.violations.length === 0,
      JSON.stringify({ cancelled, seq, violations: F4.st.violations.slice(0, 2) }));
    check('publish: the stored song IS the draft\'s song (sorted-key compare), builtSongCheck passes on it as stored, and the list has it at edit 1 with the imported song kept at 3',
      bare && run('sbCanon')(bare) === run('sbCanon(sbDocOf(sbDraft()))') && run('builtSongCheck')(id, bare).length === 0 && meta.songs[id] === 1 && meta.songs[other] === 3 && Object.keys(meta.songs).length === 2 && meta.updatedAt === TS,
      JSON.stringify({ meta: meta && meta.songs }));
    check('publish: the console shows the published song\'s page (Edit, Unpublish, Delete…, Export), "2 published; all pass today\'s checks", and the step bar\'s Publish is done',
      !run('sbShowsSteps()') && /data-sb-act="edit"/.test(run('sbDetailHtml()')) && /data-sb-act="unpublish"/.test(run('sbDetailHtml()')) && /data-sb-act="delete-song"/.test(run('sbDetailHtml()')) && /data-sb-v="pub"/.test(run('sbDetailHtml()'))
      && /2 published; all pass today's checks/.test(run('sbHealthHtml()')) && /^Published "Test 0 Publish" \(edit 1\)/.test(run('sbNote')), run('sbNote'));
  }
  /* D8: the student page: the REAL app merges the same store and draws the song on the Songs page and as its card */
  const studentSync = async () => {
    const page = appPage(ROOT);
    page.ctx.__db = F4.db;
    page.run("currentUser = { uid: 'test-student-0' }; ensureDb = async () => __db;");
    await page.run('builtSongsSync()');
    return page;
  };
  {
    const page = await studentSync();
    const facts = JSON.parse(page.run(`(() => {
      const a = CLASS_ACTIVITIES.find(x => x.id === ${JSON.stringify(id)}), o = CLASS_ACTIVITIES.find(x => x.id === ${JSON.stringify(other)});
      const out = { has: !!a, other: !!o, library: !!a && a.library === true && a.optional === true && caIsLibrarySong(a), track: !!SNIPPET_TRACKS[${JSON.stringify(id)}] && SNIPPET_TRACKS[${JSON.stringify(id)}].src === 'private:' + ${JSON.stringify(aid)} && !SNIPPET_TRACKS[${JSON.stringify(id)}].srcSlow };
      out.row = songsLibraryHtml().includes('Test 0 Publish');
      setLang('en'); const en = caCardBodyHtml(a); setLang('es'); const es = caCardBodyHtml(a); setLang('en');
      out.en = /Verse 1/.test(en) && /Chorus/.test(en) && en.includes('Test &lt;b&gt;words&lt;/b&gt; &amp; "more"') && !en.includes('<b>words</b>') && /data-one-file="1"/.test(en) && /data-rate="0.85"/.test(en);
      out.es = /Estrofa 1/.test(es) && /Coro/.test(es) && es.includes('Test &lt;b&gt;words&lt;/b&gt;');
      return JSON.stringify(out); })()`));
    check('student page: the real app (sim-app-page) merges the published song from the same store: on the Songs page list, an optional library card, its private one-file track; its card renders in English and Spanish (Verse 1 / Estrofa 1, Chorus / Coro), lyric line escaped, the four one-file stops opening on 0.85',
      Object.values(facts).every(Boolean), JSON.stringify(facts));
  }
  /* D9: a reload: the published song is found again as published, with no change pending */
  const R = makeConsole(consoleSrc, F4);
  R.run('teacherMicSaveFile = (name, blob) => { window.__saved = { name, blob }; }');
  R.run('renderTeacherSongBuilder()'); await settle();
  R.run(`sbOpen(${JSON.stringify(id)})`); await settle();
  check('reload: the song is listed as Published with no "Changes not published", opens on its page, and its listens are still all done',
    /Published/.test(R.run('sbListHtml()')) && !/Changes not published/.test(R.run('sbListHtml()')) && !R.run('sbShowsSteps()') && R.run('sbPubChanged(sbDraft(), sbPublished.get(sbSel))') === false && R.run('sbListensOf(sbDraft()).all'),
    R.run('sbListHtml()').slice(0, 300));
  /* D10: Edit: the steps open; a new levelled copy is made; students keep the published song; the old copy stays */
  const aidNew = id + '-' + sha(LEVELLED.get('a')).slice(0, 8);
  {
    R.run("sbPubAct('edit', { dataset: {} })");
    const editing = R.run('sbShowsSteps()') && R.run('sbStepOn') === 1 && /editing: students keep the published song/.test(R.run('sbDetailHtml()')) && /data-sb-act="delete-song"/.test(R.run('sbDetailHtml()')) && !/data-sb-act="delete"[ >]/.test(R.run('sbDetailHtml()'));
    box_set(R, '__f', fileOf('test-c.mp3', SRC_C, 15)); R.run('sbPickFile(__f)'); await settle();
    R.run('sbGoStep(2)'); await settle();
    box_set(R, '__levelNext', 'a'); R.run('sbRunLevel()'); await settle(300);
    const doc = F4.S.get('builtSongs/' + id);
    check('edit: Edit opens the steps (Delete… with the typed title, not Delete draft); levelling again stores a new copy and names it in the draft, while the published song and the copy it plays stay as they were',
      editing && R.run('sbDraft().audio.id') === aidNew && keysOf('songFiles/' + aidNew + '/pieces/').length === 3 && keysOf('songFiles/' + aid).length > 0 && JSON.stringify(doc) === JSON.stringify(pubDoc),
      JSON.stringify({ editing, draftAudio: R.run('sbDraft().audio.id'), oldKept: keysOf('songFiles/' + aid).length }));
    check('edit: the list says "Changes not published", the listens start over, and Publish asks for them again', /Changes not published/.test(R.run('sbListHtml()')) && !R.run('sbListensOf(sbDraft()).all') && /Listen at the Preview step/.test(R.run('sbPublishWhy(sbDraft(), sbSel).join(" ")')),
      R.run('sbPublishWhy(sbDraft(), sbSel).join(" | ")'));
  }
  /* D11: publish the change: the song, the list (edit 2), and only then the old copy goes */
  {
    R.run('sbGoStep(6)'); await settle();
    await listenThrough(R, [[0.02, 0.5, 0.95, 1.02, 1.5, 2.0, 2.5, 2.85, 3.0, 3.5, 4.0, 4.5, 4.78, 0.03]]);
    const w0 = nW();
    R.env.confirmAnswer = true; R.env.confirms.length = 0;
    R.run('sbPublish()'); await settle(300);
    const seq = since(w0).filter(x => !x.includes('/pieces/'));
    const iSong = seq.indexOf('set builtSongs/' + id), iList = seq.indexOf('set builtSongsMeta/list'), iDel = seq.indexOf('delete songFiles/' + aid);
    const meta = F4.S.get('builtSongsMeta/list');
    check('republish: asks "Publish your changes", then the song, then the list (edit 2, the imported song kept), and only then the replaced copy is deleted (head and pieces); the imported song\'s copy is untouched',
      /^Publish your changes to "Test 0 Publish"\?/.test(R.env.confirms[0] || '') && iSong === 0 && iList === 1 && iDel > iList && meta.songs[id] === 2 && meta.songs[other] === 3 && keysOf('songFiles/' + aid).length === 0
      && F4.S.get('builtSongs/' + id).audio.id === aidNew && keysOf('songFiles/' + oaid).length === otherCopyKeys && JSON.stringify(F4.S.get('builtSongs/' + other)) === otherDoc0,
      JSON.stringify(seq));
  }
  /* D12: Unpublish: the draft keeps the edit number, then the list, then the song; the draft and its copy stay */
  {
    const w0 = nW();
    R.env.confirmAnswer = false; R.run('sbUnpublish()'); await settle();
    const cancelled = nW() === w0;
    R.env.confirmAnswer = true; R.run('sbUnpublish()'); await settle(200);
    const seq = since(w0);
    const meta = F4.S.get('builtSongsMeta/list');
    check('unpublish: Cancel writes nothing; OK writes the draft (its edit number, 2) first, then the list without the song, then deletes builtSongs/<id>; the draft and its copy stay; the imported song is untouched',
      cancelled && seq.join(' → ') === `set songDrafts/${id} → set builtSongsMeta/list → delete builtSongs/${id}` && F4.S.get('songDrafts/' + id).pubVer === 2 && !F4.S.has('builtSongs/' + id)
      && Object.keys(meta.songs).join() === other && meta.songs[other] === 3 && keysOf('songFiles/' + aidNew + '/pieces/').length === 3 && JSON.stringify(F4.S.get('builtSongs/' + other)) === otherDoc0 && R.run('sbShowsSteps()') && R.run('sbStepOn') === 7,
      JSON.stringify({ cancelled, seq, pubVer: F4.S.get('songDrafts/' + id).pubVer, step: R.run('sbStepOn') }));
    const page = await studentSync();
    const ids = page.run(`JSON.stringify(builtSongIds())`);
    check('unpublish: the student page merges the imported song only', ids === JSON.stringify([other]), ids);
    const w1 = nW();
    R.run('sbPublish()'); await settle(200);
    check('publish after an unpublish counts on: edit 3, not 1 again (a Chromebook keeps a song by its edit number)', F4.S.get('builtSongsMeta/list').songs[id] === 3 && since(w1).join(' → ') === `set builtSongs/${id} → set builtSongsMeta/list`,
      JSON.stringify({ songs: F4.S.get('builtSongsMeta/list').songs, seq: since(w1) }));
  }
  /* D13: leaving the view while Publish reads: nothing written after the leave */
  {
    const w0 = nW();
    R.run('sbPublish()'); R.run("teacherSbLeave(); teacherView = 'students';");
    await settle(100);
    check('leaving mid-publish: nothing is written after the leave', nW() === w0, JSON.stringify(since(w0)));
    R.run("teacherView = 'songbuilder'"); R.run('teacherSbPaint()'); await settle();
  }
  /* D14: the health line names a song that fails today's checks (as after a validator change) */
  {
    const h = R.run(`(() => { const p = sbPublished.get(${JSON.stringify(other)}), keep = p.doc; p.doc = JSON.parse(JSON.stringify(keep)); p.doc.song.bars[0] = 'Zz'; try { return sbHealthHtml(); } finally { p.doc = keep; } })()`);
    check('health line: a published song that fails builtSongCheck today is named, with its reason', /2 published; this one fails today's checks/.test(h) && /Test 1 Imported/.test(h) && /bar 1 names/.test(h) && /2 published; all pass/.test(R.run('sbHealthHtml()')), h.slice(0, 300));
  }
  /* D15: the imported song: no draft, so no Edit or Unpublish; Export gives its file, which tools/built-song-check.mjs passes */
  {
    R.run(`sbOpen(${JSON.stringify(other)})`); await settle();
    const page = R.run('sbDetailHtml()');
    R.run("window.__saved = null; sbPubAct('export', { dataset: { sbV: 'pub' } })");
    const sv = R.run('window.__saved'), text = sv ? await sv.blob.text() : '';
    let tool = { status: -1, out: '' };
    if(text){
      const { mkdtempSync, writeFileSync, rmSync } = await import('node:fs');
      const { tmpdir } = await import('node:os');
      const { spawnSync } = await import('node:child_process');
      const dir = mkdtempSync(join(tmpdir(), 'sb-export-')), file = join(dir, sv.name);
      writeFileSync(file, text);
      const r = spawnSync(process.execPath, [join(ROOT, 'tools', 'built-song-check.mjs'), file, '--root', ROOT], { encoding: 'utf8' });
      tool = { status: r.status, out: (r.stdout || '') + (r.stderr || '') };
      rmSync(dir, { recursive: true, force: true });
    }
    check('imported song: its page has Delete… and Export but no Edit or Unpublish (it has no draft); Export saves its file and tools/built-song-check.mjs passes it (exit 0)',
      !/data-sb-act="edit"/.test(page) && !/data-sb-act="unpublish"/.test(page) && /data-sb-act="delete-song"/.test(page) && /import a new song file there/.test(page) && tool.status === 0 && JSON.parse(text).id === other,
      JSON.stringify({ status: tool.status, out: tool.out.trim().split('\n').slice(-2).join(' / ') }));
  }
  /* D16: Delete: the draft's OK / Cancel never deletes a published song; the typed title does; another song is untouched */
  {
    R.run(`sbOpen(${JSON.stringify(id)})`); await settle();
    const w0 = nW();
    R.env.confirms.length = 0; R.env.prompts.length = 0; R.env.confirmAnswer = true; R.env.promptAnswer = null;
    R.run('sbDeleteDraft()'); await settle();
    const viaDraft = nW() === w0 && R.env.confirms.length === 0 && R.env.prompts.length === 1 && /Type the title to delete it/.test(R.env.prompts[0]);
    R.env.promptAnswer = 'Test 0'; R.run("sbPubAct('delete-song', { dataset: {} })"); await settle();
    const wrong = nW() === w0 && /what you typed is not "Test 0 Publish"/.test(R.run('sbNote'));
    R.env.promptAnswer = '  Test 0 Publish '; R.run("sbPubAct('delete-song', { dataset: {} })"); await settle(300);
    const seq = since(w0).filter(x => !x.includes('/pieces/'));
    const meta = F4.S.get('builtSongsMeta/list');
    check('delete: the draft\'s Delete on a published song asks for the typed title (no OK / Cancel); Cancel and a wrong title delete nothing',
      viaDraft && wrong, JSON.stringify({ prompts: R.env.prompts.length, confirms: R.env.confirms.length, note: R.run('sbNote') }));
    check('delete: the typed title removes the list entry FIRST, then builtSongs/<id>, the draft and its copy; the imported song, its list entry and its copy are untouched; students\' progress is never written',
      seq[0] === 'set builtSongsMeta/list' && seq[1] === 'delete builtSongs/' + id && seq[2] === 'delete songDrafts/' + id && seq.includes('delete songFiles/' + aidNew) && !F4.S.has('songDrafts/' + id) && !F4.S.has('builtSongs/' + id)
      && keysOf('songFiles/' + aidNew).length === 0 && Object.keys(meta.songs).join() === other && meta.songs[other] === 3 && keysOf('songFiles/' + oaid).length === otherCopyKeys && JSON.stringify(F4.S.get('builtSongs/' + other)) === otherDoc0
      && R.run('sbSel') === null && /^Deleted "Test 0 Publish"/.test(R.run('sbNote')),
      JSON.stringify(seq));
  }
  check('part d: every write fits firestore.rules (BUILT SONGS, SONG FILES, drafts) and none goes to config/class or progress/',
    F4.st.violations.length === 0 && !F4.st.writes.some(w => /^(config|progress)\//.test(w.path)) && F4.st.writes.length >= 10,
    F4.st.writes.length + ' writes; ' + (F4.st.violations.slice(0, 3).join('; ') || 'no violation'));
}

/* ── main ── */
const parts = siteParts('teacher.js', ROOT);
for(const p of ['teacher-sb-core.js', 'teacher-sb-beat.js', 'teacher-sb-dsp.js', 'teacher-sb-chart.js', 'teacher-sb-pdf.js', 'teacher-sb-publish.js']) if(!parts.includes(p)){ console.log(`song-builder-sim: ${p} is not a console part (TEACHER_JS_PARTS in app/boot.js)`); process.exit(1); }
let res;
try { res = await runCases(parts.map(read).join('')); }
catch(e){ console.log('song-builder-sim: the run threw: ' + (e && e.stack || e)); if(STUCK) console.log(`  ✗ ${STUCK_NAME} — ${STUCK}`); process.exit(1); }
if(STUCK) res.push({ name: STUCK_NAME, ok: false, detail: STUCK });
const bad = res.filter(r => !r.ok);
for(const r of res) if(VERBOSE || !r.ok) console.log(`  ${r.ok ? '✓' : '✗'} ${r.name}${r.detail ? ' — ' + r.detail : ''}`);
console.log(`song-builder-sim: ${res.length} cases, ${bad.length} failed`);
process.exit(bad.length ? 1 : 0);
