#!/usr/bin/env node
/* song-builder-sim.mjs — the Song builder's drafts (teacher-sb-core.js, Song builder Part b, 2026-11-15), RUN in Node
   against a stub Firestore that checks every write against firestore.rules. checks.mjs pins its case count.

     node tools/song-builder-sim.mjs            every case; exit 0 = all held, 1 = a ✗ line
     node tools/song-builder-sim.mjs --verbose  print every case, not only the failures
     node tools/song-builder-sim.mjs --root DIR another site folder
     node tools/song-builder-sim.mjs --breaks   also broken copies of the lyrics-sheet code (each must turn a sheet case red)

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
   Remove, another draft opened; no pdf action writes anything. THE EDGE CASES (W10, pdfEdgeCases): "+ New song" twice,
   with and without a pick being read; a draft switched, and switched back, while a pick is read; Delete (a draft, a
   published song) with the view left before it is done, and with it kept open.

   PART D (2026-11-16; teacher-sb-publish.js). Its own console and store: a made-up draft past steps 1 to 5 (its
   levelled copy stored as the Song files writer stores one) and a made-up imported song on the list (edit 3).
   PUBLISH (no listen gate since 2026-11-16: it is on as soon as nothing blocks it): each blocker said as the one
   reason (over 10 cents, said once; a drift window; a section with no name; an unsaved title; an audio id on SONG_FILES
   or another song's), each writing nothing through the button; the stored copy and the list read fresh at the press,
   inside its transaction; a record over 8 pins warns and never blocks.
   Then a first Publish with no confirm (builtSongs, the list and the draft in one transaction, in the rules' exact
   shape), the stored song equal to the draft's, the REAL student app (sim-app-page.mjs, builtSongsSync on the same
   store) showing it on the Songs page and as its card in English and Spanish; a reload; Edit with a new levelled copy (the old one kept while the published song plays it),
   republish (the old copy deleted only after the list names the new edit); Unpublish (the draft's edit number, the
   list, then the song; a later Publish counts on); leaving mid-publish; the health line; the imported song's page and
   its Export, passed by tools/built-song-check.mjs; Delete (the draft's OK / Cancel never deletes a published song;
   the typed title: the list first, then the song, the draft, its copy; the other song untouched). The rules check
   above takes builtSongs/{id} and builtSongsMeta/list as firestore.rules "BUILT SONGS" writes them.

   THE LYRICS SHEET (2026-11-18, private chord sheets P4; teacher-sb-sheet.js; sheetCases): the published song's Lyrics
   sheet row on made-up pdfs (tools/made-pdf.mjs) read by the vendored pdf.js in Node, the check run in the REAL student
   app (sim-app-page.mjs) on the song's real card: the refusals (over 5 MB, not a pdf, no text, a sheet that does not
   follow: the reason and the table) write nothing; Add (the pdf through the Song files writer, then one transaction);
   Edit and Publish keep the sheet (and Publish reads its head); Replace (a stored pdf not uploaded again, the old one
   deleted); a pdf or a song another tab changed in the gap; Check it again; Export's .pdf; Remove; both chord sets;
   Delete. --breaks runs these cases against 22 broken copies of the sheet code and of what carries the sheet.

   THE SWEEP CASES (2026-11-25; sweepCases): the Song builder findings SB-1 to SB-7 of the 2026-11-25 sweep, each case red
   on the code before its fix: edits kept through the 15-s re-read, a song switch and leaving the view; "Level it again"
   on a published song; leaving while the encoder runs; ◀ 1 beat ▶ and the drag of bar 1; a bar in thirds; the BPM bound.
   Their comment above sweepCases says more.

   THE REVIEW-ROUND-1 CASES (2026-11-25; r1Cases): two console tabs on one store (a draft saved, levelled again, published
   or deleted in one tab while the other has edits not saved yet: nothing is written over the other tab's work, no old
   recording goes back or goes live, and the line says what happened to the edit), this tab's own Import, five planted
   faults no case caught before, and the Beat step's BPM bound on the grid itself. Their comment above r1Cases says more. */
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { siteParts } from './site-src.mjs';
import { appPage } from './sim-app-page.mjs';
import { FIXTURES, withAudio, audioIdFor } from './built-songs-fixtures.mjs';
import { madePdf } from './made-pdf.mjs';

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
const DRAFT_KEYS = 'artist,audio,beat,capo,chart,imported,level,pitch,pubVer,savedAt,sheet,source,step,title,v,volume';   // sheet: 2026-11-18 (the lyrics sheet, teacher-sb-sheet.js); capo: 2026-11-20 (song.capo)
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
  /* stamp (review round 2): a store that keeps a server time on savedAt, as Firestore does, read back through toMillis
     (the drafts' and the published songs' times are compared on a reload). Off by default: the other cases compare
     stored docs with the TS marker. */
  const st = { writes: [], violations: [], reads: [], failWrite: null, stamp: false, clock: 0 };
  const stampOf = () => { st.clock = Math.max(Date.now(), st.clock + 1); const t = st.clock; return { toMillis: () => t }; };
  const apply = (op, path, data, opts, at) => {
    let next;
    if(op === 'delete') next = undefined;
    else if(opts && opts.merge){
      next = clone(S.get(path) || {});
      for(const k of Object.keys(data)) next[k] = isInc(data[k]) ? (Number(next[k]) || 0) + data[k].__inc : clone(data[k]);
    } else next = clone(data);
    const why = rulesCheck(op, path, next);
    if(why) st.violations.push(why);
    if(st.stamp && next && next.savedAt === TS) next.savedAt = at || stampOf();
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
    /* Atomic, as Firestore's: the writes wait until fn resolves, and one refused write applies none of them. */
    runTransaction: async fn => {
      const ops = [];
      const out = await fn({ get: r => r.get(), set: (r, d, o) => { ops.push([r.path, d, o]); }, update: (r, d) => { ops.push([r.path, d, { merge: true }]); } });
      await tick();
      const bad = ops.find(([p]) => st.failWrite && st.failWrite(p));
      if(bad){ const e = new Error('unavailable'); e.code = 'unavailable'; throw e; }
      /* One commit, one server time (review round 3): Firestore gives every write of a transaction the same request.time,
         so Publish's song and draft carry the same savedAt. */
      const at = st.stamp ? stampOf() : null;
      ops.forEach(([p, d, o]) => apply('set', p, d, o, at));
      return out;
    } };
  return { S, st, db, stamp: stampOf };
}

/* ── one console in a vm (a fresh one = a reload; pass the store to keep it) ── */
function makeConsole(consoleSrc, F){
  F = F || makeDb();
  const inert = () => ({ addEventListener() {}, removeEventListener() {}, querySelector: () => null, querySelectorAll: () => [], classList: { toggle() {}, add() {}, remove() {} }, style: {}, dataset: {} });
  const grid = Object.assign(inert(), { id: 't-grid-container', _html: '', paints: 0, querySelector: () => inert() });
  Object.defineProperty(grid, 'innerHTML', { get(){ return this._html; }, set(v){ this._html = String(v); this.paints++; } });
  const env = { promptAnswer: null, prompts: [], confirmAnswer: true, confirms: [] };
  const docL = {};                        // the page's document listeners, kept so a case can call one (sweepCases: the drag)
  const box = {
    console: { log() {}, warn() {}, error() {} }, setTimeout, clearTimeout, setInterval: () => 0, clearInterval() {},
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, sessionStorage: { getItem: () => null, setItem() {} },
    navigator: {}, location: { hash: '', search: '', href: 'http://sim/index.html' }, addEventListener() {}, removeEventListener() {}, crypto: globalThis.crypto, Blob,
    Audio: class { addEventListener() {} pause() {} load() {} removeAttribute() {} play(){ return Promise.resolve(); } },
    URL: { createObjectURL: () => 'blob:sim', revokeObjectURL() {} },
    document: { getElementById: id => id === 't-grid-container' ? grid : null, querySelector: () => null, querySelectorAll: () => [], addEventListener: (t, f) => { (docL[t] = docL[t] || []).push(f); }, removeEventListener() {},
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
  const C = { box, F, env, run, grid, docL };
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
/* An edit number the console just made (teacherBsNextVer): from its clock, and past `prev`. */
const T0_2026 = Date.UTC(2026, 0, 1);
const freshVer = (v, prev) => Number.isInteger(v) && v > (prev || 0) && v >= Math.floor((Date.now() - T0_2026) / 1000) - 600 && v <= 1e9;
async function runCases(consoleSrc, sheetSrc){
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
  const firstSf = F.st.writes.findIndex(w => w.path.startsWith('songFiles/'));
  const dw = F.st.writes.filter((w, i) => w.path.startsWith('songDrafts/') && (firstSf < 0 || i < firstSf));
  const d0 = dw[0] && dw[0].data;
  check('new draft: Next writes songDrafts/<sb- id> once (before Volume, which now starts by itself), with exactly the draft fields and the server time',
    /^sb-[a-z0-9]{12}$/.test(id) && dw.length === 1 && dw[0].path === 'songDrafts/' + id && Object.keys(d0).sort().join(',') === DRAFT_KEYS && d0.savedAt === TS && d0.v === 1 && d0.step === 2,
    dw.length + ' writes; ' + (d0 ? Object.keys(d0).sort().join(',') : 'none'));
  check('new draft: the source is the file\'s facts, not the file (no audio stored at step 1)',
    d0 && d0.source && d0.source.sha256 === sha(SRC_A) && d0.source.bytes === SRC_A.length && d0.source.durationSec === 24 && d0.source.sampleRate === 44100 && d0.source.channels === 1
    && d0.audio === null && firstSf > F.st.writes.findIndex(w => w.path === 'songDrafts/' + id), JSON.stringify(d0 && d0.source));
  check('new draft: the console opens it on step 2', run('sbStepOn') === 2 && run('sbDraft() && sbDraft().title') === 'Test 0');

  /* Volume: the levelled copy goes to songFiles first, then the draft points at it. Volume started by itself at Next
     (sbAutoLevel), so the copy is stored by now: the order is read from its first write on. The "Level it" below levels
     the same bytes again, which no longer uploads them again (SB-2, 2026-11-25; the sweep cases check that). */
  box_set(C, '__levelNext', 'a'); run('sbRunLevel()'); await settle(200);
  const lw = F.st.writes.slice(firstSf);
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
  await pdfEdgeCases(consoleSrc, check);
  await publishCases(consoleSrc, check);
  await importCases(consoleSrc, check);
  await fixCases(consoleSrc, check);
  await cutsCases(consoleSrc, check);
  await r2Cases(consoleSrc, check);
  await r3Cases(consoleSrc, check);
  await sheetCases(consoleSrc, check, sheetSrc);
  await sweepCases(consoleSrc, check);
  await r1Cases(consoleSrc, check);
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

  /* where a power chord sits (2026-11-23): never above fret 10; an imported E5 at fret 12 moves to the A string at 7 */
  {
    const bad = [];
    let spots = 0;
    for(let pc = 0; pc < 12; pc++){
      const list = run('sbPowerSpots')(pc), name = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][pc] + '5';
      if(!list.length) bad.push(name + ': no spot');
      list.forEach(o => { spots++; const w = run('bsShapeProblem')(name, { frets: o.frets }, 'power'); if(w) bad.push(`${name} ${o.at}: ${w}`); if(o.frets.some(f => f > 10)) bad.push(`${name} ${o.at} above fret 10`); });
      const own = run('sbShapeOf')(name).power.frets;
      if(own.some(f => f > 10)) bad.push(name + ': the builder\'s own pick is above fret 10');
    }
    const high = { frets: [12, 14, 14, null, null, null] };
    const moved = JSON.stringify(run('sbPowerShapeFor')('E5', high, null).frets), movedE = JSON.stringify(run('sbPowerShapeFor')('E', high, null).frets);
    const picked = JSON.stringify(run('sbPowerShapeFor')('Em', high, { E5: 'E0' }).frets), kept = JSON.stringify(run('sbPowerShapeFor')('G', { frets: [3, 5, 5, null, null, null] }, null).frets);
    const junk = JSON.stringify(run('sbPowerShapeFor')('G', { frets: [3, 5, 5, null, null, null] }, { G5: 'A10' }).frets);
    check(`power spots: ${spots} spots for the 12 roots, every one the validator takes and none above fret 10; an imported E5 / E at fret 12 moves to the A string at 7; a pick at the Level step wins; a shape under the cap is kept; a spot that is not one is ignored`,
      !bad.length && moved === '[null,7,9,9,null,null]' && movedE === moved && picked === '[0,2,2,null,null,null]' && kept === '[3,5,5,null,null,null]' && junk === kept,
      bad.join('; ') || JSON.stringify({ moved, movedE, picked, kept, junk }));
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
  const flush = async () => { run('clearTimeout(sbSaveTimers.get(sbSel)); sbSaveTimers.delete(sbSel); sbWriteDraft(sbSel, sbDraft())'); await settle(); };   // the draft's waiting save (sbSaveSoon), made now
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
  /* where the power chords sit: a pick at the Level step is saved in the draft and is the song's power shape */
  {
    const before = run('sbLevelPaneHtml(sbDraft())'), was = JSON.stringify(run('sbSongOf(sbDraft())').chords.Bb.power.frets);
    act('level-power', { sbChord: 'Bb5', sbV: 'E18' });
    const refused = JSON.stringify(run('sbDraft().chart.powerAt || null'));
    act('level-power', { sbChord: 'Bb5', sbV: 'E6' });
    await flush(); d = stored();
    const sg = JSON.parse(JSON.stringify(run('sbSongOf(sbDraft())'))), why = run('sbSongWhy(sbDraft(), sbSel)'), now = JSON.stringify(sg.chords.Bb.power.frets);
    check('level: "Where the power chords sit" lists the card\'s power chords with only spots at fret 10 or under; Bb5 moved from the A string at 1 to the low E string at 6 is saved (chart.powerAt) and is the song\'s Bb power shape; a spot above fret 10 is refused; the song still passes',
      /Where the power chords sit/.test(before) && /data-sb-chord="Bb5" data-sb-v="E6"/.test(before) && !/data-sb-v="A10"/.test(before) && refused === 'null' && was === '[null,1,3,3,null,null]'
      && d.chart.powerAt && d.chart.powerAt.Bb5 === 'E6' && now === '[6,8,8,null,null,null]' && !why.length, JSON.stringify({ was, refused, powerAt: d.chart.powerAt, now, why }));
  }
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
    check('upload: a chart pasted at step 1 is READ when Next saves the draft (2026-11-16, fewer clicks): step 4 opens on its grid at once', !!nd && nd.chart && nd.chart.text === '[Chorus]\nC G D' && /Pick a bar to change it/.test(p4)
      && run('sbStepOn') === 4 && Array.isArray(nd.chart.sections) && nd.chart.sections.length === 1 && nd.chart.sections[0].name === 'chorus' && nd.chart.sections[0].bars.join(' ') === 'C G D',
      JSON.stringify({ chart: nd && nd.chart, step: run('sbStepOn'), read: after && after.chart && after.chart.sections && after.chart.sections.map(x => x.bars) }));
  }
  check('chart and level: every write went to songDrafts, or to songFiles from Volume starting by itself after step 1, and fits the rules (no config/class, progress/ or builtSongs write)', F2.st.violations.length === 0 && F2.st.writes.length >= 8 && F2.st.writes.every(w => /^(songDrafts|songFiles|songFilesUsage)\//.test(w.path)),
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

/* The made-up pdf.js: a file's bytes name its record; getTextContent and destroy are counted. A record's `gate` (a
   promise) holds its getTextContent until the case lets it go: the moment "a pick is still being read". */
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
      async getPage(n){ const items = rec.pages[n - 1]; return { getViewport: () => ({ convertToViewportPoint: (x, y) => [x, y], width: 612, height: 792 }), getTextContent: async () => { rec.textCalls++; await tick(); if(rec.gate) await rec.gate; return tcOf(items); } }; },
      destroy(){ rec.destroyed++; } };
    return { promise: Promise.resolve(doc) };
  },
};
async function pdfCases(consoleSrc, check){
  const F3 = makeDb(), C = makeConsole(consoleSrc, F3), { run } = C;
  C.box.pcSheetLoadPdfjs = async () => FAKE_PDFJS;      // app/cards-sheet.js is not in the console's vm
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
  check('pdf flow: no pdf action wrote anything (0 writes across 8 picks, a Remove and an open); the run\'s only writes are the new draft\'s (the draft, its chart read at once, and the copy Volume makes by itself), within the rules',
    pdfW === 0 && dw[0].path === 'songDrafts/' + nid && dw[1].path === 'songDrafts/' + nid && dw.every(w => w.path === 'songDrafts/' + nid || w.path.startsWith('songFiles/' + nid + '-')) && F3.st.violations.length === 0, JSON.stringify({ pdfWrites: pdfW, writes: dw.map(w => w.path) }));
}

/* ── Pdfs: the three edge cases (W10, 2026-11-16; the Mac's list after the pdf pane shipped): "+ New song" pressed
   twice, a draft switched while a pick of several pdfs is still being read, a draft deleted while the view is left.
   Its own console and store, the made-up pdf.js above; a `gate` holds one file's text until the case lets it go. The
   pdfs are never stored, so what could go wrong is what the tab SHOWS and HOLDS (documents, object URLs) and, worse,
   a chords pdf's text landing in another song's chart box, which Next saves into that draft. ── */
async function pdfEdgeCases(consoleSrc, check){
  const F = makeDb(), C = makeConsole(consoleSrc, F), { run } = C;
  C.box.pcSheetLoadPdfjs = async () => FAKE_PDFJS;
  let urlN = 0; const revoked = [];
  C.box.URL = { createObjectURL: () => 'blob:sim-pdf-' + (++urlN), revokeObjectURL: u => { revoked.push(u); } };
  C.box.open = () => null;                               // "Own window" (window.open): nothing to open in the vm
  const draftDoc = (title, n) => ({ v: 1, title, artist: 'Nobody', step: 4, source: { name: 'test.mp3', bytes: 400000, sha256: hex64(n), durationSec: 60, sampleRate: 44100, channels: 2, kbps: 192 },
    audio: null, volume: null, pitch: null, beat: null, chart: null, level: null, savedAt: 0 });
  const ids = { a: 'sb-edgedrafta001', b: 'sb-edgedraftb001', d: 'sb-edgedraftd001', e: 'sb-edgedrafte001', p: 'sb-edgepubsong01' };
  F.S.set('songDrafts/' + ids.a, draftDoc('Test 0 Edge A', 21)); F.S.set('songDrafts/' + ids.b, draftDoc('Test 1 Edge B', 22));
  F.S.set('songDrafts/' + ids.d, draftDoc('Test 2 Edge D', 23)); F.S.set('songDrafts/' + ids.e, draftDoc('Test 3 Edge E', 24));
  F.S.set('songDrafts/' + ids.p, draftDoc('Test 4 Edge P', 25));
  run('renderTeacherSongBuilder()'); await settle();
  const files = () => run('sbPdf.files.map(f => f.name).join(",")');
  /* Wait for the console's own state, never a fixed sleep (see settle). */
  const until = async (cond, what) => { const t0 = Date.now(); while(!cond()){ if(Date.now() - t0 > SETTLE_MAX_MS){ STUCK = STUCK || 'pdf edge cases: waited for ' + what; return; } await settle(5); } };
  const startPick = (kind, fs) => { C.box.__pdfs = fs.map(f => f.file); run(`sbPdfAdd(${JSON.stringify(kind)}, __pdfs)`); };
  const doneReading = () => until(() => run('sbPdf.reading') === 0, 'the pdf read to end');
  const gated = (name, tag, pages) => { const x = pdfOf(name, tag, pages); let go; x.rec.gate = new Promise(r => { go = r; }); x.go = () => { x.rec.gate = null; go(); }; return x; };
  const textOfAll = recs => recs.map(r => r.pages.map(p => run('sbPdfTextOf')(p)).join('\n\n'));

  /* E1: "+ New song" twice, nothing in flight */
  {
    const P = pdfOf('e1-chords.pdf', 'e1', [PAGES.oneCol]);
    run('sbNewSong()'); await settle();
    startPick('chords', [P]); await doneReading();
    const had = files() === 'e1-chords.pdf' && run('sbNew.chartText') === PAGES.oneColText;
    run('sbNewSong()'); await settle();
    const bar = run('sbPdfBarHtml()');
    check('pdf edge: "+ New song" pressed again drops the first new song\'s pdfs: none listed or held for the second one (its bar shows no chip), the document destroyed once, its chart box empty',
      had && run('sbPdf.files.length') === 0 && run('sbPdfMine().length') === 0 && !/e1-chords\.pdf/.test(bar) && P.rec.destroyed === 1 && !run('sbNew.chartText'),
      JSON.stringify({ had, files: files(), mine: run('sbPdfMine().length'), chipShown: /e1-chords\.pdf/.test(bar), destroyed: P.rec.destroyed, chartText: (run('sbNew.chartText') || '').slice(0, 30) }));
  }
  /* E2: "+ New song" again while a pick of two chords pdfs is being read, then Next on the second song */
  {
    const X = pdfOf('e2-x.pdf', 'e2x', [PAGES.oneCol]), Y = gated('e2-y.pdf', 'e2y', [PAGES.touch]);
    run('sbNewSong()'); await settle();
    startPick('chords', [X, Y]);
    await until(() => files().split(',').includes('e2-x.pdf') && Y.rec.textCalls === 1, 'the first pdf in, the second held');
    run('sbNewSong()'); await settle();
    Y.go(); await doneReading();
    const second = run('sbNew.chartText') || '', w0 = F.st.writes.length;
    C.box.__f = fileOf('test-a.mp3', SRC_A, 24); run('sbPickFile(__f)'); await settle();
    run("sbNew.title = 'Test 5 Second'; sbNew.artist = 'Nobody'");
    const before = new Set([...F.S.keys()].filter(k => k.startsWith('songDrafts/')));
    run('sbSaveUpload()'); await settle();
    const nid = ([...F.S.keys()].filter(k => k.startsWith('songDrafts/') && !before.has(k))[0] || '').slice(11), nd = nid ? F.S.get('songDrafts/' + nid) : null;
    const [yText] = textOfAll([Y.rec]);
    check('pdf edge: "+ New song" pressed while the first song\'s two chords pdfs are read: the pdf still being read lands nowhere: the second song lists no pdf, its chart box gets none of the text, and Next saves its draft with no chart; both documents destroyed once',
      second === '' && nd && nd.chart == null && run('sbPdf.files.length') === 0 && X.rec.destroyed === 1 && Y.rec.destroyed === 1 && F.st.writes.slice(w0).every(w => w.path === 'songDrafts/' + nid || w.path.startsWith('songFiles/' + nid + '-')),
      JSON.stringify({ secondBox: second.slice(0, 40), savedChart: nd ? (nd.chart && nd.chart.text === yText ? 'the held pdf\'s text' : nd.chart) : 'no draft', files: files(), destroyed: [X.rec.destroyed, Y.rec.destroyed] }));
  }
  /* E3: a draft switched during a pick of three chords pdfs (A to B): the rest of the pick lands nowhere, never on B */
  const opened = recs => recs.map(r => r.opened);
  {
    run(`sbOpen(${JSON.stringify(ids.a)})`); await settle();
    const X = pdfOf('e3-x.pdf', 'e3x', [PAGES.oneCol]), Y = gated('e3-y.pdf', 'e3y', [PAGES.oneItem]), Z = pdfOf('e3-z.pdf', 'e3z', [PAGES.touch]);
    const w0 = F.st.writes.length;
    startPick('chords', [X, Y, Z]);
    await until(() => files().split(',').includes('e3-x.pdf') && Y.rec.textCalls === 1, 'the first pdf in, the second held');
    run(`sbOpen(${JSON.stringify(ids.b)})`); await settle();
    Y.go(); await doneReading();
    /* The first pdf's text was in A's paste box at step 4, which is this tab's only (sbCh) and goes when B opens, as
       typed text does; sbChFor(A) is not asked here, since asking it would empty B's box. */
    const bDraft = run('sbDraft()'), aDraft = run(`sbDrafts.get(${JSON.stringify(ids.a)})`);
    check('pdf edge: another draft opened while three chords pdfs are read: nothing lands on it (no pdf listed, its chart box and draft untouched) nor on A\'s draft, the rest of the pick stops (the third never opened), each opened document destroyed once, nothing written',
      run('sbSel') === ids.b && run('sbPdf.files.length') === 0 && run('sbChFor(sbSel).text') == null && bDraft.chartText == null && !bDraft.dirty && aDraft.chartText == null && !aDraft.dirty && Z.rec.opened === 0
        && X.rec.destroyed === 1 && Y.rec.destroyed === 1 && F.st.writes.length === w0,
      JSON.stringify({ sel: run('sbSel'), files: files(), bBox: run('sbChFor(sbSel).text'), bText: bDraft.chartText, bDirty: !!bDraft.dirty, aText: aDraft.chartText, aDirty: !!aDraft.dirty, opened: opened([X.rec, Y.rec, Z.rec]), destroyed: [X.rec.destroyed, Y.rec.destroyed], writes: F.st.writes.length - w0 }));
  }
  /* E4: the same, but back to A before the held pdf is read (A to B to A): the pick is over, not half of it on A */
  {
    const X = pdfOf('e4-x.pdf', 'e4x', [PAGES.oneCol]), Y = gated('e4-y.pdf', 'e4y', [PAGES.oneItem]), Z = pdfOf('e4-z.pdf', 'e4z', [PAGES.touch]);
    run(`sbOpen(${JSON.stringify(ids.a)})`); await settle();
    const w0 = F.st.writes.length;
    startPick('chords', [X, Y, Z]);
    await until(() => files().split(',').includes('e4-x.pdf') && Y.rec.textCalls === 1, 'the first pdf in, the second held');
    run(`sbOpen(${JSON.stringify(ids.b)})`); await settle();
    run(`sbOpen(${JSON.stringify(ids.a)})`); await settle();
    Y.go(); await doneReading();
    const box = run('sbChFor(sbSel).text'), aDraft = run('sbDraft()');
    check('pdf edge: a draft switched away and back (A, B, A) while three chords pdfs are read: the pick is over, as when B stays open: A lists none of them (not the last two of three), its box and draft get none of their text, the third never opened, each opened document destroyed once, nothing written',
      run('sbSel') === ids.a && run('sbPdf.files.length') === 0 && box == null && aDraft.chartText == null && !aDraft.dirty && Z.rec.opened === 0 && X.rec.destroyed === 1 && Y.rec.destroyed === 1 && F.st.writes.length === w0,
      JSON.stringify({ files: files(), box: (box || '').slice(0, 40), opened: opened([X.rec, Y.rec, Z.rec]), destroyed: [X.rec.destroyed, Y.rec.destroyed, Z.rec.destroyed], writes: F.st.writes.length - w0 }));
  }
  /* E5: Delete draft, and the view left before the delete is done: the pdfs and the "Own window" URL go with the draft */
  const delCase = async (id, how) => {
    run(`sbOpen(${JSON.stringify(id)})`); await settle();
    const P = pdfOf(`e5-${how}-chords.pdf`, 'e5c' + how, [PAGES.oneCol]), T = pdfOf(`e5-${how}-tab.pdf`, 'e5t' + how, [PAGES.oneCol]);
    startPick('chords', [P]); await doneReading(); startPick('tab', [T]); await doneReading();
    run("sbPdfAct('pdf-window', { dataset: {} })");
    const url = run('sbPdf.files[sbPdf.cur] && sbPdf.files[sbPdf.cur].url'), had = files();
    return { P, T, url, had };
  };
  {
    const { P, T, url, had } = await delCase(ids.d, 'left');
    C.env.confirmAnswer = true;
    run("sbDeleteDraft(); teacherSbLeave(); teacherView = 'students';"); await settle();
    const away = { gone: !F.S.has('songDrafts/' + ids.d), files: run('sbPdf.files.length'), destroyed: [P.rec.destroyed, T.rec.destroyed], revoked: revoked.includes(url) };
    run("teacherView = 'songbuilder'"); run('teacherSbPaint()'); await settle();
    check('pdf edge: Delete draft, then the view left before the delete is done: the deleted draft\'s pdfs are let go at once, not when the view reopens: none held, each document destroyed once (still once after the view reopens), the "Own window" URL revoked',
      had === `e5-left-chords.pdf,e5-left-tab.pdf` && url && away.gone && away.files === 0 && away.destroyed.every(n => n === 1) && away.revoked && P.rec.destroyed === 1 && T.rec.destroyed === 1 && run('sbPdf.files.length') === 0,
      JSON.stringify({ had, url, away, after: [P.rec.destroyed, T.rec.destroyed] }));
  }
  /* E6: the same Delete with the view kept open (it was right before W10: a guard) */
  {
    const { P, T, url } = await delCase(ids.e, 'kept');
    run('sbDeleteDraft()'); await settle();
    check('pdf edge: Delete draft with the view open: the pdfs go with the draft (none held, each document destroyed once, the "Own window" URL revoked)',
      !F.S.has('songDrafts/' + ids.e) && run('sbSel') === null && run('sbPdf.files.length') === 0 && P.rec.destroyed === 1 && T.rec.destroyed === 1 && url && revoked.includes(url),
      JSON.stringify({ sel: run('sbSel'), files: run('sbPdf.files.length'), destroyed: [P.rec.destroyed, T.rec.destroyed], revoked: revoked.includes(url) }));
  }
  /* E7: a PUBLISHED song deleted (the typed title, teacher-sb-publish.js) with the view left mid-delete: the same */
  {
    const { P, T, url } = await delCase(ids.p, 'pub');
    run(`sbPublished.set(${JSON.stringify(ids.p)}, { title: 'Test 4 Edge P', artist: 'Nobody', ver: 1, audioId: null, doc: null, at: 0 })`);
    C.env.promptAnswer = 'Test 4 Edge P';
    run("sbDeleteSong(); teacherSbLeave(); teacherView = 'students';"); await settle();
    const away = { gone: !F.S.has('songDrafts/' + ids.p), files: run('sbPdf.files.length'), destroyed: [P.rec.destroyed, T.rec.destroyed], revoked: revoked.includes(url) };
    run("teacherView = 'songbuilder'"); run('teacherSbPaint()'); await settle();
    check('pdf edge: a published song deleted (the typed title), then the view left before the delete is done: its pdfs are let go at once (none held, each document destroyed once, the "Own window" URL revoked)',
      away.gone && away.files === 0 && away.destroyed.every(n => n === 1) && away.revoked && P.rec.destroyed === 1 && T.rec.destroyed === 1,
      JSON.stringify({ away, note: run('sbNote') }));
  }
  const named = F.st.writes.filter(w => !w.path.startsWith('songFiles/') && /\.pdf|%PDF|blob:/.test(JSON.stringify(w)));   // a songFiles write is the mp3's bytes
  check('pdf edge: every write in these cases is the builder\'s own and fits the rules; no pdf, pdf name or object URL is ever written', F.st.violations.length === 0 && F.st.writes.length > 0 && !named.length,
    F.st.writes.length + ' writes; ' + (F.st.violations.slice(0, 3).join('; ') || 'no violation') + (named.length ? '; names a pdf: ' + named.map(w => w.path).join(', ') : ''));
}

/* ── PART D (2026-11-16; teacher-sb-publish.js): Preview, Publish, Edit, Unpublish, Delete, Export, the
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
  run('window.__saves = []; teacherMicSaveFile = (name, blob) => { window.__saves.push({ name, blob }); window.__saved = { name, blob }; }');
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
    check('preview: going to step 6 saves the furthest step (one songDrafts write); the pane says to play it through once (no listen counted), the Spanish-templates line and the title as students see it (escaped), and no "does not fit" box for a steady record',
      run('sbStepOn') === 6 && F4.S.get('songDrafts/' + id).step === 6 && since(w0).filter(x => !x.includes('songFilesUsage')).join() === 'set songDrafts/' + id
      && /Play it through once before you publish/.test(pane) && /fixed English and Spanish templates/.test(pane) && pane.includes('"Test 0 Publish" - The Test Band — Play Along') && !/does not fit the builder/.test(pane),
      JSON.stringify({ step: run('sbStepOn'), writes: since(w0), once: /Play it through once/.test(pane) }));
  }
  /* D3: no listen gate (decided 2026-11-16): with the validator, the pitch and the copy passing, Publish is on at once,
     and its button is on the Preview step itself */
  {
    const why = run('sbPublishWhy(sbDraft(), sbSel)'), nav6 = run('sbStepOn = 6; sbNavHtml(sbDraft())');
    check('publish: no listen is counted or asked for: Publish is on at once, and the Preview step\'s top button is Publish itself (no Next: Publish)',
      why.length === 0 && /data-sb-act="publish"/.test(nav6) && !/data-sb-act="publish"[^>]*disabled/.test(nav6) && !/Next: Publish/.test(nav6) && !/Listen at the Preview/.test(run('sbPublishPaneHtml(sbDraft())')),
      JSON.stringify({ why, nav6: nav6.replace(/<[^>]*>/g, ' ').trim() }));
  }
  const listenThrough = async () => {};   // the listens are gone (2026-11-16); kept as a no-op so the flow reads as before
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
    run('window.__saves = []; sbExport("draft")'); await settle(100);
    const sv = run('window.__saves.find(x => /\\.json$/.test(x.name))');
    const f = sv ? JSON.parse(await sv.blob.text()) : null;
    check('export (a draft): one file, the Import shape { id, v, title, artist, audio, song }, the draft\'s own song, and builtSongCheck passes on it',
      f && Object.keys(f).sort().join() === 'artist,audio,id,song,title,v' && f.id === id && run('builtSongCheck')(f.id, { v: f.v, title: f.title, artist: f.artist, audio: f.audio, song: f.song }).length === 0
      && run('sbCanon')(f.song) === run('sbCanon(sbDocOf(sbDraft()).song)') && /^test-0-publish-sb-pubdraft0001\.json$/.test(sv.name),
      sv ? sv.name : 'nothing saved');
  }
  /* D7: a first Publish asks nothing and writes the song and the list */
  let pubDoc = null, firstAsked = -1;
  {
    const w0 = nW();
    env.confirmAnswer = false; env.confirms.length = 0;   // a confirm, if one were asked, would be answered Cancel
    run('sbPublish()'); await settle(200);
    firstAsked = env.confirms.length;
    const cancelled = firstAsked === 0;
    env.confirmAnswer = true;
    const seq = since(w0);
    const doc = F4.S.get('builtSongs/' + id), meta = F4.S.get('builtSongsMeta/list');
    pubDoc = doc;
    const bare = doc ? Object.assign({}, doc) : null; if(bare) delete bare.savedAt;
    check('publish: a first Publish (one click, no confirm) writes builtSongs/<id>, builtSongsMeta/list and the draft (in one transaction, nothing else), the song in the rules\' exact shape with the server time, the draft with its own fields',
      cancelled && seq.join(' → ') === `set builtSongs/${id} → set builtSongsMeta/list → set songDrafts/${id}` && doc && Object.keys(doc).sort().join() === 'artist,audio,savedAt,song,title,v' && doc.savedAt === TS && F4.st.violations.length === 0
      && Object.keys(F4.S.get('songDrafts/' + id)).sort().join(',') === DRAFT_KEYS && F4.S.get('songDrafts/' + id).savedAt === TS,
      JSON.stringify({ cancelled, seq, violations: F4.st.violations.slice(0, 2) }));
    check('publish: the stored song IS the draft\'s song (sorted-key compare), builtSongCheck passes on it as stored, and the list has it at a new edit number (from the clock) with the imported song kept at 3',
      bare && run('sbCanon')(bare) === run('sbCanon(sbDocOf(sbDraft()))') && run('builtSongCheck')(id, bare).length === 0 && freshVer(meta.songs[id], 3) && meta.songs[other] === 3 && Object.keys(meta.songs).length === 2 && meta.updatedAt === TS,
      JSON.stringify({ meta: meta && meta.songs }));
    check('publish: the console shows the published song\'s page (Edit, Unpublish, Delete…, Export), "2 published; all pass today\'s checks", and the step bar\'s Publish is done',
      !run('sbShowsSteps()') && /data-sb-act="edit"/.test(run('sbDetailHtml()')) && /data-sb-act="unpublish"/.test(run('sbDetailHtml()')) && /data-sb-act="delete-song"/.test(run('sbDetailHtml()')) && /data-sb-v="pub"/.test(run('sbDetailHtml()'))
      && /2 published; all pass today's checks/.test(run('sbHealthHtml()')) && /^Published "Test 0 Publish" \(edit of /.test(run('sbNote')), run('sbNote'));
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
  R.run('window.__saves = []; teacherMicSaveFile = (name, blob) => { window.__saves.push({ name, blob }); }');
  R.run('renderTeacherSongBuilder()'); await settle();
  R.run(`sbOpen(${JSON.stringify(id)})`); await settle();
  check('reload: the song is listed as Published with no "Changes not published", and opens on its page',
    /Published/.test(R.run('sbListHtml()')) && !/Changes not published/.test(R.run('sbListHtml()')) && !R.run('sbShowsSteps()') && R.run('sbPubChanged(sbDraft(), sbPublished.get(sbSel))') === false,
    R.run('sbListHtml()').slice(0, 300));
  /* D10: Edit: the steps open; a new levelled copy is made; students keep the published song; the old copy stays */
  const aidNew = id + '-' + sha(LEVELLED.get('a')).slice(0, 8);
  {
    R.run("sbPubAct('edit', { dataset: {} })"); await settle();
    const editing = R.run('sbShowsSteps()') && R.run('sbStepOn') === 4 && /editing: students keep the published song/.test(R.run('sbDetailHtml()')) && /data-sb-act="delete-song"/.test(R.run('sbDetailHtml()')) && !/data-sb-act="delete"[ >]/.test(R.run('sbDetailHtml()'));
    box_set(R, '__f', fileOf('test-c.mp3', SRC_C, 15)); R.run('sbPickFile(__f)'); await settle();
    R.run('sbGoStep(2)'); await settle();
    box_set(R, '__levelNext', 'a'); R.run('sbRunLevel()'); await settle(300);
    const doc = F4.S.get('builtSongs/' + id);
    check('edit: Edit opens the steps on Chart, its default (Delete… with the typed title, not Delete draft); levelling again stores a new copy and names it in the draft, while the published song and the copy it plays stay as they were',
      editing && R.run('sbDraft().audio.id') === aidNew && keysOf('songFiles/' + aidNew + '/pieces/').length === 3 && keysOf('songFiles/' + aid).length > 0 && JSON.stringify(doc) === JSON.stringify(pubDoc),
      JSON.stringify({ editing, draftAudio: R.run('sbDraft().audio.id'), oldKept: keysOf('songFiles/' + aid).length }));
    check('edit: the list says "Changes not published", and the change can be published (the new copy waits only for its drift check at the Beat step)', /Changes not published/.test(R.run('sbListHtml()')) && R.run('sbPublishWhy(sbDraft(), sbSel)').every(w => /Beat step/.test(w)),
      R.run('sbPublishWhy(sbDraft(), sbSel).join(" | ")'));
  }
  /* D11: publish the change: the song, the list (a new edit number), and only then the old copy goes */
  const pubVer1 = F4.S.get('builtSongsMeta/list').songs[id]; let pubVer2 = 0;
  {
    /* A new copy: its drift windows are measured at the Beat step first (review R1-6). */
    const why0 = R.run('sbPublishWhy(sbDraft(), sbSel)');
    R.run('sbGoStep(3)'); await settle();
    for(let t = 0; t < 80 && !Number.isFinite((F4.S.get('songDrafts/' + id).beat || {}).driftOff); t++) await sleep(100);
    await settle();
    check('republish after a new copy: Publish first asks for the Beat step (the drift windows were the old copy\'s), and opening it measures them on the new one', why0.some(w => /Open the Beat step once/.test(w)) && F4.S.get('songDrafts/' + id).beat.driftFor === F4.S.get('songDrafts/' + id).audio.sha256,
      JSON.stringify(why0));
    R.run('sbGoStep(6)'); await settle();
    await listenThrough(R, [[0.02, 0.5, 0.95, 1.02, 1.5, 2.0, 2.5, 2.85, 3.0, 3.5, 4.0, 4.5, 4.78, 0.03]]);
    const w0 = nW();
    R.env.confirmAnswer = true; R.env.confirms.length = 0;
    R.run('sbPublish()'); await settle(300);
    const seq = since(w0).filter(x => !x.includes('/pieces/'));
    const iSong = seq.indexOf('set builtSongs/' + id), iList = seq.indexOf('set builtSongsMeta/list'), iDel = seq.indexOf('delete songFiles/' + aid);
    pubVer2 = F4.S.get('builtSongsMeta/list').songs[id];
    const meta = F4.S.get('builtSongsMeta/list');
    check('republish: asks "Publish your changes" (saying open pages keep the old version or lose its sound until they reload), then the song and the list in one transaction (a new edit number, the imported song kept), and only then the replaced copy is deleted (head and pieces); the imported song\'s copy is untouched',
      /^Publish your changes to "Test 0 Publish"\?.*keep the old version, or lose its sound, until they reload/.test(R.env.confirms[0] || '') && iSong === 0 && iList === 1 && iDel > iList && freshVer(meta.songs[id], pubVer1) && meta.songs[other] === 3 && keysOf('songFiles/' + aid).length === 0
      && F4.S.get('builtSongs/' + id).audio.id === aidNew && keysOf('songFiles/' + oaid).length === otherCopyKeys && JSON.stringify(F4.S.get('builtSongs/' + other)) === otherDoc0,
      JSON.stringify(seq));
    check('publish: a first Publish asks nothing (0 confirms); an edit of a live song asks once (Jonathan, 2026-11-16: "go ahead")', firstAsked === 0 && R.env.confirms.length === 1,
      JSON.stringify({ firstAsked, editAsked: R.env.confirms.length }));
  }
  /* D12: Unpublish: the draft keeps the edit number, then the list, then the song; the draft and its copy stay */
  {
    const w0 = nW();
    R.env.confirmAnswer = false; R.run('sbUnpublish()'); await settle();
    const cancelled = nW() === w0;
    R.env.confirmAnswer = true; R.run('sbUnpublish()'); await settle(200);
    const seq = since(w0);
    const meta = F4.S.get('builtSongsMeta/list');
    check('unpublish: Cancel writes nothing; OK writes the draft (its edit number) first, then the list without the song, then deletes builtSongs/<id>; the draft and its copy stay; the imported song is untouched',
      cancelled && seq.join(' → ') === `set songDrafts/${id} → set builtSongsMeta/list → delete builtSongs/${id}` && F4.S.get('songDrafts/' + id).pubVer === pubVer2 && !F4.S.has('builtSongs/' + id)
      && Object.keys(meta.songs).join() === other && meta.songs[other] === 3 && keysOf('songFiles/' + aidNew + '/pieces/').length === 3 && JSON.stringify(F4.S.get('builtSongs/' + other)) === otherDoc0 && R.run('sbShowsSteps()') && R.run('sbStepOn') === 7,
      JSON.stringify({ cancelled, seq, pubVer: F4.S.get('songDrafts/' + id).pubVer, step: R.run('sbStepOn') }));
    const page = await studentSync();
    const ids = page.run(`JSON.stringify(builtSongIds())`);
    check('unpublish: the student page merges the imported song only', ids === JSON.stringify([other]), ids);
    const w1 = nW();
    R.run('sbPublish()'); await settle(200);
    check('publish after an unpublish counts on: a number past the last one, never one used before (a Chromebook keeps a song by its edit number)', freshVer(F4.S.get('builtSongsMeta/list').songs[id], pubVer2) && since(w1).join(' → ') === `set builtSongs/${id} → set builtSongsMeta/list → set songDrafts/${id}`,
      JSON.stringify({ songs: F4.S.get('builtSongsMeta/list').songs, seq: since(w1) }));
  }
  /* D13: leaving the view while Publish reads: nothing written after the leave (a change first, so Publish starts:
     the same song again is refused before it starts, review R3-7) */
  {
    R.run("sbChartSet(sbDraft(), { level: { versions: 'both', start: 'power', range: null } }, null, true)"); await settle();
    const w0 = nW();
    R.env.confirmAnswer = true;
    R.run('sbPublish()'); R.run("teacherSbLeave(); teacherView = 'students';");
    await settle(100);
    check('leaving mid-publish: nothing is written after the leave', nW() === w0 && /^Stopped: you left the Song builder/.test(R.run('sbNote')), JSON.stringify({ writes: since(w0), note: R.run('sbNote') }));
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
    R.run("window.__saves = []; sbPubAct('export', { dataset: { sbV: 'pub' } })"); await settle(100);
    const sv = R.run('window.__saves.find(x => /\\.json$/.test(x.name))'), text = sv ? await sv.blob.text() : '';
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
    check('imported song: its page has Edit, Unpublish, Delete… and Export (no draft yet: Edit and Unpublish make one); Export saves its file and tools/built-song-check.mjs passes it (exit 0)',
      /data-sb-act="edit"/.test(page) && /data-sb-act="unpublish"/.test(page) && /data-sb-act="delete-song"/.test(page) && /has no draft yet/.test(page) && tool.status === 0 && JSON.parse(text).id === other,
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

/* ── PART D, Jonathan's answers of 2026-11-16: an IMPORTED song gets Edit and Unpublish (a draft rebuilt from its
   builtSongs doc), Export saves the mp3 too, Edit gives a choice of step. Its own console and store: made-up songs from
   tools/built-songs-fixtures.mjs (fourFour, with one chord given its own voicing and a bpm with decimals, so a builder
   that put its own shapes or a rounded tempo in would show; beatMap, with its own bar times), each "imported" as Manage
   → Built songs' Import leaves it: builtSongs/{id}, the list, the stored copy, no draft. ── */
async function importCases(consoleSrc, check){
  const F6 = makeDb(), C = makeConsole(consoleSrc, F6), { run, env } = C;
  const LV = LEVELLED.get('c'), shaL = sha(LV);
  const putCopy = (F, audioId, bytes, dur) => {
    F.S.set('songFiles/' + audioId, { file: audioId + '.mp3', bytes: bytes.length, sha256: sha(bytes), pieces: Math.ceil(bytes.length / 900000), pieceBytes: 900000, durationSec: dur, state: 'ready', uploadedAt: TS });
    for(let i = 0; i * 900000 < bytes.length; i++) F.S.set(`songFiles/${audioId}/pieces/${i}`, { i, data: new FakeBytes(bytes.subarray(i * 900000, (i + 1) * 900000)) });
  };
  const imported = (name, id, mut) => {
    const f = FIXTURES[name], d = withAudio(f.doc, LV.length, shaL);
    d.audio.id = audioIdFor(id, shaL); d.audio.gainDb = 1.25; d.audio.sourceSha256 = hex64(9);
    if(mut) mut(d);
    putCopy(F6, d.audio.id, LV, d.audio.durationSec);
    F6.S.set('builtSongs/' + id, Object.assign(JSON.parse(JSON.stringify(d)), { savedAt: TS }));
    return d;
  };
  const A = FIXTURES.fourFour.id, B = FIXTURES.beatMap.id, U = 'sb-testimpunpub1';
  const docA = imported('fourFour', A, d => { d.song.chords.G.full = { frets: [3, 2, 0, 0, 3, 3] }; d.song.bpm = 96.12345; });
  const docB = imported('beatMap', B);
  const docU = imported('fourFour', U, d => { d.title = 'Test Unpublish Me'; });
  F6.S.set('builtSongsMeta/list', { songs: { [A]: 4, [B]: 2, [U]: 1 }, updatedAt: TS });
  const nW = () => F6.st.writes.length, since = w0 => F6.st.writes.slice(w0).map(w => w.op + ' ' + w.path);
  const canon = v => v === undefined ? '(none)' : run('sbCanon')(JSON.parse(JSON.stringify(v)));
  const bare = p => { const x = Object.assign({}, F6.S.get(p)); delete x.savedAt; return x; };
  run('window.__saves = []; teacherMicSaveFile = (name, blob) => { window.__saves.push({ name, blob }); };');
  run('renderTeacherSongBuilder()'); await settle();
  /* the listens are gone (2026-11-16): kept as a no-op so the flow reads as before */
  const listenAll = async () => {};   // no listens since 2026-11-16


  /* E1: the imported song's page: Edit with a choice of step, Unpublish */
  run(`sbOpen(${JSON.stringify(A)})`); await settle();
  {
    const h = run('sbDetailHtml()');
    const steps = (h.match(/data-sb-act="edit-step"/g) || []).length;
    check('imported song: its page now offers Edit (a choice of 6 steps, Chart highlighted) and Unpublish, says what a rebuilt draft cannot bring back, and has no draft yet',
      steps === 6 && /class="sb-btn small primary" data-sb-act="edit-step" data-sb-v="4"/.test(h) && /data-sb-act="unpublish"/.test(h) && /chart's original text, the taps, the loudness numbers and the original mp3/.test(h) && !F6.S.has('songDrafts/' + A),
      JSON.stringify({ steps, draft: F6.S.has('songDrafts/' + A) }));
  }
  /* E1c (2026-11-20): an imported song with a capo (song.capo) keeps it through the rebuilt draft, its save, and the
     doc that draft publishes; with no change it reads as no change; a draft with none publishes none. */
  {
    const doc = JSON.parse(JSON.stringify(F6.S.get('builtSongs/' + A))); delete doc.savedAt; doc.song.capo = 4;
    const r = run(`(() => { const p = { doc: ${JSON.stringify(doc)}, ver: 9 }; const d = sbDraftFromDoc(${JSON.stringify(A)}, p);
      const saved = sbDraftDoc(d); const out = sbDocOf(saved); const plain = sbDocOf(Object.assign({}, saved, { capo: null }));
      return { draft: d.capo, saved: saved.capo, out: out && out.song.capo, same: sbSameSong(saved, p), lost: !sbSameSong(Object.assign({}, saved, { capo: null }), p),
        plain: plain && ('capo' in plain.song), check: out ? builtSongCheck(${JSON.stringify(A)}, out).length : -1 }; })()`);
    check('capo: an imported song with song.capo 4 keeps it in the rebuilt draft, in the saved draft and in the doc it publishes (no change; dropping it IS a change), which passes builtSongCheck; a draft with no capo publishes none',
      r.draft === 4 && r.saved === 4 && r.out === 4 && r.same && r.lost && r.plain === false && r.check === 0, JSON.stringify(r));
  }
  /* E2: Edit on Beat: the draft is rebuilt and saved once; the steps say what came with the song */
  {
    const w0 = nW();
    run("sbPubAct('edit-step', { dataset: { sbV: '3' } })"); await settle();
    const d = F6.S.get('songDrafts/' + A);
    const panes = run('[sbUploadHtml(sbDraft()), sbVolumeHtml(sbDraft()), sbBeatPaneHtml(sbDraft()), sbChartPaneHtml(sbDraft())]');
    const u0 = (F6.S.get('songFilesUsage/' + run('songFileMonth()')) || {}).bytes || 0;
    run('teacherSbPaint()'); await settle();
    check('imported song, Edit on Beat: one songDrafts write (the draft fields, imported, its edit number) and the Beat step opens; nothing is loaded for it',
      since(w0).join() === 'set songDrafts/' + A && d && Object.keys(d).sort().join(',') === DRAFT_KEYS && d.imported === true && d.pubVer === 4
      && run('sbShowsSteps()') && run('sbStepOn') === 3 && ((F6.S.get('songFilesUsage/' + run('songFileMonth()')) || {}).bytes || 0) === u0,
      JSON.stringify({ writes: since(w0), keys: d && Object.keys(d).sort().join(','), step: run('sbStepOn') }));
    check('imported song: Upload says its original mp3 is not here, Volume that the levelled copy and its numbers came with the song, Beat shows the bars read-only ("came with the imported song"), Chart that its original text is not here',
      /its original mp3 is not here/.test(panes[0]) && /The levelled copy came with the imported song/.test(panes[1]) && /The bars came with the imported song/.test(panes[2]) && !/data-sb-act="tap"/.test(panes[2]) && /This chart came with the imported song/.test(panes[3]),
      JSON.stringify(panes.map(x => x.length)));
  }
  /* E3: changed nothing: the draft makes the very song that was imported; Publish keeps it, edit 5 */
  {
    check('imported song, nothing changed: the rebuilt draft makes the imported song exactly (title, artist, audio, and the song: sections, bars, lyrics, its own chord shapes, its tempo unrounded, level)',
      canon(run('sbDocOf(sbDraft())')) === canon((({ v, title, artist, audio, song }) => ({ v, title, artist, audio, song }))(docA)) && run('sbSongWhy(sbDraft(), sbSel).length') === 0,
      run('JSON.stringify(sbDocOf(sbDraft()).song.chords.G)') + ' bpm ' + run('sbDocOf(sbDraft()).song.bpm'));
    await listenAll();
    const w0 = nW();
    env.confirmAnswer = true; env.confirms.length = 0; run('sbPublish()'); await settle(200);
    const after = bare('builtSongs/' + A);
    check('imported song, Edit, change nothing, Publish pressed anyway (a direct call; the button is off): refused before it starts (review R3-7): nothing written, nothing asked, the imported song and its edit number (4) as they were',
      since(w0).length === 0 && env.confirms.length === 0 && /^Not published: nothing has changed since the published song/.test(run('sbNote')) && canon(after) === canon((({ v, title, artist, audio, song }) => ({ v, title, artist, audio, song }))(docA)) && F6.S.get('builtSongsMeta/list').songs[A] === 4,
      JSON.stringify({ seq: since(w0), note: run('sbNote'), list: F6.S.get('builtSongsMeta/list').songs }));
  }
  /* E4: a beat map kept exactly; one chord changed; only that chord differs */
  {
    run(`sbOpen(${JSON.stringify(B)})`); await settle();
    run("sbPubAct('edit', { dataset: {} })"); await settle();
    const bt = docB.song.barTimes;
    check('imported beat map: Edit opens on Chart (the default); the bar times are kept exactly, and the builder\'s own bar clock follows them',
      run('sbStepOn') === 4 && JSON.stringify(run('sbDocOf(sbDraft()).song.barTimes')) === JSON.stringify(bt) && run('sbBarTime(sbDraft().beat, 5)') === bt[4] && run('sbBarTime(sbDraft().beat, 13)') === bt[12],
      JSON.stringify({ step: run('sbStepOn'), bt: run('sbDocOf(sbDraft()).song.barTimes') }));
    run("sbChartEdit(sbDraft(), sbGridSetBar(sbDraft().chart.sections, 2, 'G'), null)"); await sleep(1400); await settle();
    await listenAll();
    run('sbPublish()'); await settle(200);
    const was = docB.song, now = bare('builtSongs/' + B).song;
    const diffKeys = [...new Set([...Object.keys(was), ...Object.keys(now)])].filter(k => canon(was[k]) !== canon(now[k]));
    const barDiff = now.bars.map((b, i) => b === was.bars[i] ? null : i).filter(x => x !== null);
    const chordDiff = [...new Set([...Object.keys(was.chords), ...Object.keys(now.chords)])].filter(k => canon(was.chords[k]) !== canon(now.chords[k]));
    check('imported beat map, Edit, one chord changed (bar 3: D → G), Publish: only that differs: bars[2], and G added to the chords (the bar times, sections, level and every other shape the same)',
      JSON.stringify(diffKeys) === '["chords","bars"]' && JSON.stringify(barDiff) === '[2]' && now.bars[2] === 'G' && JSON.stringify(chordDiff) === '["G"]' && JSON.stringify(now.barTimes) === JSON.stringify(bt) && freshVer(F6.S.get('builtSongsMeta/list').songs[B], 2),
      JSON.stringify({ diffKeys, barDiff, chordDiff }));
  }
  /* E5: Unpublish of an imported song with no draft: the draft is rebuilt and saved first, then the list, then the song */
  {
    run(`sbOpen(${JSON.stringify(U)})`); await settle();
    const w0 = nW();
    run('sbUnpublish()'); await settle(200);
    const d = F6.S.get('songDrafts/' + U);
    check('imported song, Unpublish: the rebuilt draft first (nothing thrown away: it still makes the published song), then the list, then builtSongs/<id>; its copy stays',
      since(w0).join(' → ') === `set songDrafts/${U} → set builtSongsMeta/list → delete builtSongs/${U}` && d && d.imported && d.pubVer === 1
      && canon(run('sbDocOf')(JSON.parse(JSON.stringify(d)))) === canon((({ v, title, artist, audio, song }) => ({ v, title, artist, audio, song }))(docU)) && F6.S.has('songFiles/' + docU.audio.id),
      JSON.stringify(since(w0)));
  }
  /* E6: Export: the .json and the .mp3, paired; the mp3 read from songFiles (one counted download); Import takes the pair */
  let pair = null;
  {
    run(`sbOpen(${JSON.stringify(A)})`); await settle();
    run('sbMemFor(null); window.__saves = []');
    const month = run('songFileMonth()'), u0 = (F6.S.get('songFilesUsage/' + month) || {}).bytes || 0;
    run("sbPubAct('export', { dataset: { sbV: 'pub' } })"); await settle(200);
    const saves = run('window.__saves');
    const u1 = (F6.S.get('songFilesUsage/' + month) || {}).bytes || 0;
    const j = saves.find(x => /\.json$/.test(x.name)), m = saves.find(x => /\.mp3$/.test(x.name));
    const mp3 = m ? new Uint8Array(await m.blob.arrayBuffer()) : new Uint8Array(0);
    const f = j ? JSON.parse(await j.blob.text()) : null;
    pair = { j, m, f };
    check('export: two downloads, test-song-four-<id>.json and .mp3 (the same name); the mp3 is the stored copy (its SHA-256), read from songFiles and counted once against the month',
      saves.length === 2 && j && m && j.name.replace(/\.json$/, '') === m.name.replace(/\.mp3$/, '') && j.name === 'test-song-four-' + A + '.json' && sha(mp3) === f.audio.sha256 && u1 - u0 === Math.ceil(LV.length * 4 / 3),
      JSON.stringify({ names: saves.map(x => x.name), counted: u1 - u0 }));
  }
  if(!(pair && pair.j && pair.m && pair.f)) check('export → Import: the exported pair, fed to Manage → Built songs\' Import on another store, makes the same song and the same stored copy', false, 'Export did not save a .json and an .mp3');
  else {
    const F7 = makeDb(), C7 = makeConsole(consoleSrc, F7);
    C7.run("teacherView = 'manage';");
    C7.box.__dur = pair.f.audio.durationSec;
    C7.run('teacherSfDuration = async () => __dur;');
    C7.box.__j = pair.j.blob; C7.box.__m = pair.m.blob;
    C7.run('teacherBsImport(__j, __m)');
    for(let t = 0; t < 400 && (C7.run('teacherBsBusy') !== '' || !F7.S.has('builtSongsMeta/list')); t++) await sleep(10);
    const got = F7.S.get('builtSongs/' + A); const g = got ? Object.assign({}, got) : null; if(g) delete g.savedAt;
    check('export → Import: the exported pair, fed to Manage → Built songs\' Import on another store, makes the same song and the same stored copy',
      g && canon(g) === canon(bare('builtSongs/' + A)) && F7.S.get('songFiles/' + pair.f.audio.id) && F7.S.get('songFiles/' + pair.f.audio.id).state === 'ready' && F7.S.get('songFiles/' + pair.f.audio.id).sha256 === pair.f.audio.sha256 && F7.st.violations.length === 0,
      C7.run('teacherBsNote'));
  }
  /* E7: Edit's choice of step on a song with a draft: the default is Chart; each choice opens its step */
  {
    run(`sbOpen(${JSON.stringify(B)})`); await settle();
    const got = [];
    for(const k of ['2', '5', '6', '1']){ run("sbPubAct('edit-done', { dataset: {} })"); run(`sbPubAct('edit-step', { dataset: { sbV: '${k}' } })`); await settle(); got.push(run('sbStepOn')); }
    run("sbPubAct('edit-done', { dataset: {} })"); run("sbPubAct('edit', { dataset: {} })"); await settle(); got.push(run('sbStepOn'));
    check('edit: each choice opens its step (Volume 2, Level 5, Preview 6, Upload 1) and the header\'s Edit opens Chart (4)', JSON.stringify(got) === '[2,5,6,1,4]', JSON.stringify(got));
  }
  check('imported songs: every write fits firestore.rules and none goes to config/class or progress/', F6.st.violations.length === 0 && !F6.st.writes.some(w => /^(config|progress)\//.test(w.path)),
    F6.st.writes.length + ' writes; ' + (F6.st.violations.slice(0, 3).join('; ') || 'no violation'));
}

/* ── REVIEW ROUND 1 (2026-11-16): an edit published in halves (R1-1), a new mp3 picked after levelling (R1-2), and the
   minors. Its own console and store: the made-up draft of the Part d cases, published once. ── */
async function fixCases(consoleSrc, check){
  const F8 = makeDb(), C = makeConsole(consoleSrc, F8), { run, env } = C;
  const id = 'sb-fixdraft00001', LVC = LEVELLED.get('c'), aid = id + '-' + sha(LVC).slice(0, 8);
  F8.S.set('songFiles/' + aid, { file: aid + '.mp3', bytes: LVC.length, sha256: sha(LVC), pieces: 1, pieceBytes: 900000, durationSec: 15, state: 'ready', uploadedAt: TS });
  F8.S.set(`songFiles/${aid}/pieces/0`, { i: 0, data: new FakeBytes(LVC) });
  F8.S.set('songDrafts/' + id, { v: 1, title: 'Test 0 Fix', artist: 'The Test Band', step: 7,
    source: { name: 'test-c.mp3', bytes: SRC_C.length, sha256: sha(SRC_C), durationSec: 15, sampleRate: 44100, channels: 1, kbps: 192 },
    audio: { id: aid, bytes: LVC.length, sha256: sha(LVC), durationSec: 15, centsOff: 2, gainDb: 1.5, sourceSha256: sha(SRC_C) },
    volume: { before: -14, after: -12.5, samplePeak: -1.2, truePeak: -1.1, ceilingDb: -1, encodes: 1 }, pitch: { cents: 2, peaks: 10 },
    beat: { meter: '4/4', bpm: 96, anchor: 0.5, pins: [], trackBpm: 96, trackSub: 2, driftOff: 0, pinsNeeded: 2 },
    chart: { text: '[Verse]\n| G | C |', meter: '4/4', fmt: 'bar lines', sections: [{ name: 'intro', label: 'Intro', n: null, bars: ['G'], lyrics: null },
      { name: 'verse', label: 'Verse', n: null, bars: ['G', 'C'], lyrics: null }, { name: 'chorus', label: 'Chorus', n: null, bars: ['D', 'G'], lyrics: null }], left: [], kept: [], edited: true },
    level: { versions: 'full', start: null, range: null }, listens: null, pubVer: null, savedAt: TS });
  const nW = () => F8.st.writes.length, since = w0 => F8.st.writes.slice(w0).map(w => w.op + ' ' + w.path);
  run('renderTeacherSongBuilder()'); await settle();
  run(`sbOpen(${JSON.stringify(id)})`); await settle();
  const listenAll = async () => {};   // no listens since 2026-11-16

  env.confirmAnswer = true;
  await listenAll(C);
  run('sbPublish()'); await settle(200);
  const ver1 = (F8.S.get('builtSongsMeta/list') || { songs: {} }).songs[id];
  /* R1-1: an edit whose list write is refused: nothing is published in half, and Publish stays on after a reload */
  {
    run("sbPubAct('edit-step', { dataset: { sbV: '5' } })"); await settle();
    run("sbChartSet(sbDraft(), { level: { versions: 'both', start: 'full', range: null } }, null, true)"); await settle();
    await listenAll(C);
    const doc0 = JSON.stringify(F8.S.get('builtSongs/' + id));
    F8.st.failWrite = p => p === 'builtSongsMeta/list';
    run('sbPublish()'); await settle(200);
    F8.st.failWrite = null;
    const R = makeConsole(consoleSrc, F8);
    R.run('renderTeacherSongBuilder()'); await settle();
    R.run(`sbOpen(${JSON.stringify(id)})`); await settle();
    R.run("sbPubAct('edit-step', { dataset: { sbV: '7' } })"); await settle();
    const btn = R.run('sbPublishBtnHtml(sbDraft())');
    check('R1-1: an edit whose transaction fails (the list write refused) writes nothing (builtSongs/<id> as it was, the list at the same edit) and, after a reload, Publish can be pressed again',
      JSON.stringify(F8.S.get('builtSongs/' + id)) === doc0 && F8.S.get('builtSongsMeta/list').songs[id] === ver1 && !/disabled/.test(btn) && !/no changes/.test(btn),
      JSON.stringify({ docKept: JSON.stringify(F8.S.get('builtSongs/' + id)) === doc0, list: F8.S.get('builtSongsMeta/list').songs[id], ver1, btn: btn.replace(/<[^>]*>/g, '').trim() }));
  }
  /* R1-2: a new mp3 of the same length picked at step 1: Preview and Publish wait for Volume */
  {
    const NEW = mp3Of(310000, 77);
    box_set(C, '__f', fileOf('test-new.mp3', NEW, 15));
    run('renderTeacherSongBuilder()'); await settle();
    run(`sbOpen(null); sbOpen(${JSON.stringify(id)})`); await settle();
    run("sbPubAct('edit-step', { dataset: { sbV: '1' } })"); await settle();
    run('sbPickFile(__f)'); await settle();
    const why = run('sbPublishWhy(sbDraft(), sbSel)');
    check('R1-2: after a new mp3 of the same length is picked, Preview and Publish are off and Publish says to level it first (the old copy is never published as the new song)',
      /beat is kept/.test(run('sbNote')) && !run('sbStepReady(sbDraft(), 6)') && !run('sbStepReady(sbDraft(), 7)') && why.some(w => /A new mp3 was picked: level it at step 2 first/.test(w)),
      JSON.stringify({ note: run('sbNote'), s6: run('sbStepReady(sbDraft(), 6)'), why }));
  }
  /* R1-6: levelling the new mp3 makes a new copy: the old drift number goes; the Beat step measures it again */
  {
    run('sbSaveUpload(2)'); await settle(100);
    box_set(C, '__levelNext', 'a'); run('sbRunLevel()'); await settle(300);
    const b0 = F8.S.get('songDrafts/' + id).beat, why0 = run('sbPublishWhy(sbDraft(), sbSel)');
    run('sbGoStep(3)'); await settle(100);
    for(let t = 0; t < 80 && !Number.isFinite((F8.S.get('songDrafts/' + id).beat || {}).driftOff); t++) await sleep(100);   // the Beat step's measure, then its 1.2 s save
    await settle(100);
    const b1 = F8.S.get('songDrafts/' + id).beat, why1 = run('sbPublishWhy(sbDraft(), sbSel)');
    check('R1-6: a new levelled copy clears the drift number (Publish says to open the Beat step); the Beat step measures it on the new copy and saves it with that copy\'s SHA-256',
      run('sbCopyCurrent(sbDraft())') && b0 && b0.driftOff === null && why0.some(w => /Open the Beat step once/.test(w)) && Number.isFinite(b1.driftOff) && b1.driftFor === run('sbDraft().audio.sha256') && !why1.some(w => /drift|Beat step/.test(w)),
      JSON.stringify({ b0: b0 && [b0.driftOff, b0.driftFor], b1: b1 && [b1.driftOff, String(b1.driftFor).slice(0, 8)], why0, why1 }));
  }
  /* R1-3: two tabs: A unpublishes (keeping the number in its draft), B (opened before, its draft without that number)
     publishes: never a number used before */
  {
    const B = makeConsole(consoleSrc, F8);
    B.run('renderTeacherSongBuilder()'); await settle();
    B.run(`sbOpen(${JSON.stringify(id)})`); await settle();
    B.run("sbPubAct('edit-step', { dataset: { sbV: '7' } })"); await settle();
    run('sbStepOn = 7; sbUnpublish()'); await settle(200);
    const used = F8.S.get('songDrafts/' + id).pubVer;
    B.run('sbDraft().pubVer = null');
    await listenAll(B);
    await sleep(1100);
    /* Since review R1-1 (2026-11-25) B's copy, read before A's Unpublish wrote the draft, cannot publish: nothing is
       written and the line says so. After its next read, its copy without the last number publishes. */
    const w0 = F8.st.writes.length;
    B.env.confirmAnswer = true; B.run('sbPublish()'); await settle(200);
    const refused = F8.st.writes.length === w0 && /changed in another tab/.test(B.run('sbNote'));
    const reread = B.run('sbPublished.has(' + JSON.stringify(id) + ')') === false;
    B.run('sbDraft().pubVer = null; sbStepOn = 7; sbPublish()'); await settle(200);
    const v = (F8.S.get('builtSongsMeta/list').songs || {})[id];
    check('R1-3: a Publish from another tab after an Unpublish (its draft without the last number) still takes a number never used before (and, since review R1-1, its copy read before the Unpublish publishes nothing)', refused && reread && freshVer(v, used) && v !== used, JSON.stringify({ refused, reread, used, v, note: B.run('sbNote').slice(0, 60) }));
  }
  /* R1-8: the preview card's key holds the page's language, so Español makes the card again */
  {
    C.box.CustomEvent = class { constructor(t, o){ this.type = t; Object.assign(this, o || {}); } }; C.box.dispatchEvent = () => true;   // setLang announces the change
    const k = run(`(() => { const d = sbDocOf(sbDraft()), a = sbPvKey('x', d); setLang('es'); const b = sbPvKey('x', d); setLang('en'); return [a, b]; })()`);
    check('R1-8: the preview card is made again when the page\'s language changes (its key holds the language)', k[0] !== k[1] && /\|es\|/.test(k[1]) && /\|en\|/.test(k[0]), JSON.stringify(k));
  }
  check('review fixes: every write fits firestore.rules and none goes to config/class or progress/', F8.st.violations.length === 0 && !F8.st.writes.some(w => /^(config|progress)\//.test(w.path)), (F8.st.violations.slice(0, 3).join('; ') || 'no violation'));
}

/* ── FEWER CLICKS (2026-11-16, decided by the lead on Jonathan's word "you pick the way to make things smoothest"):
   a chart given at step 1 is read when the draft is saved (C); Volume starts by itself on arriving at step 2 with the
   original in the tab (D); a new draft opens on Full chords, the whole song (F). Its own console and store. ── */
async function cutsCases(consoleSrc, check){
  const F9 = makeDb(), C = makeConsole(consoleSrc, F9), { run } = C;
  run('renderTeacherSongBuilder()'); await settle();
  let calls = 0; const level0 = C.box.__level; C.box.__level = async () => { calls++; return level0(); };
  const newSong = async (title, chart) => {
    run('sbNewSong()'); await settle();
    box_set(C, '__f', fileOf('test-a.mp3', SRC_A, 24)); run('sbPickFile(__f)'); await settle();
    run(`sbNew = { title: ${JSON.stringify(title)}, artist: 'Test Band', chartText: ${JSON.stringify(chart)} }`);
    run('sbSaveUpload()'); await settle(200);
    return run('sbSel');
  };
  const id1 = await newSong('Test Cut One', '[Verse]\nG  C\nTest words here\nD  Em\n[Chorus]\n| C | G | D | G |');
  const d1 = F9.S.get('songDrafts/' + id1);
  /* the view is chosen when step 4 is first shown, with the beat known (review R2-2), not when the chart is read */
  const view1 = run('sbChFor(sbSel).view'), shown = () => { run('sbChartPaneHtml(sbDraft())'); return run('sbChFor(sbSel).view'); };
  check('C: a chart given at step 1 is read when Next saves the draft: step 4 opens on the grid (nothing to settle: no refused line, every chord taught); the view is not chosen before step 4 shows',
    d1 && d1.chart && Array.isArray(d1.chart.sections) && d1.chart.sections.length === 2 && view1 === '' && shown() === 'grid' && run('sbStepOn') === 2,
    JSON.stringify({ secs: d1 && d1.chart && d1.chart.sections && d1.chart.sections.length, view1, view: run('sbChFor(sbSel).view') }));
  check('D: arriving at step 2 with the original in the tab levels it without a click (the copy stored, the draft names it); F: the new draft opens on Full chords, the whole song',
    calls === 1 && d1.audio && !!F9.S.get('songFiles/' + d1.audio.id) && !!d1.volume && run('sbCopyCurrent(sbDraft())') && JSON.stringify(d1.level) === JSON.stringify({ versions: 'full', start: null, range: null }),
    JSON.stringify({ calls, audio: d1.audio && d1.audio.id, level: d1.level }));
  const id2 = await newSong('Test Cut Two', '[Verse]\nG  C\ne|--3--2--0--|\nD  Bb');
  check('C: a chart with something to settle (a TAB line, a chord not taught) opens on "what was read"', shown() === 'read' && id2 !== id1, run('sbChFor(sbSel).view'));
  /* never over a chart already read or edited */
  {
    const before = JSON.stringify(F9.S.get('songDrafts/' + id2).chart.sections);
    run(`sbDraft().chartText = '[Verse]\\nA A A A'`);
    run('sbGoStep(1)'); await settle(); run('sbSaveUpload(2)'); await settle(200);
    check('C: a chart already read is never read again from step 1', JSON.stringify(F9.S.get('songDrafts/' + id2).chart.sections) === before, 'changed');
  }
  /* D: once per file: a levelling that failed waits for the button */
  {
    const n0 = calls;
    C.box.__level = async () => { calls++; throw { why: 'sim: the encoder failed' }; };
    box_set(C, '__f', fileOf('test-b.mp3', SRC_B, 24.02)); run('sbGoStep(1)'); await settle(); run('sbPickFile(__f)'); await settle();
    run('sbSaveUpload(2)'); await settle(200);
    const after1 = calls;
    run('sbGoStep(1)'); await settle(); run('sbGoStep(2)'); await settle(200);
    check('D: a levelling that failed is not started again by itself (once per file in the tab); "Level it" stays for the click',
      after1 === n0 + 1 && calls === after1 && run('sbStepOn') === 2 && /data-sb-act="level"/.test(run('sbVolumeHtml(sbDraft())')),
      JSON.stringify({ n0, after1, calls, note: run('sbNote') }));
  }
}

/* ── REVIEW ROUND 2 (2026-11-16): an Import over a song the builder published (R2-1), a chart whose bar count is not the
   recording's (R2-2), edit-with-no-change on four imported songs (R2-3), a beat map's bar count (R2-4), Delete… against
   a Publish in another tab (R2-5), Import in one transaction (R2-6), the step-1 chart read (R2-7), a draft reopened on
   Preview (R2-8), sub-millisecond bar times and a drift check of another copy (R2-9), an imported song with no gainDb
   (R2-10). Its own store, which keeps a server time on savedAt (makeDb's stamp), and several consoles on it. ── */
async function r2Cases(consoleSrc, check){
  const F = makeDb(); F.st.stamp = true;
  const C = makeConsole(consoleSrc, F), { run, env } = C;
  const LVC = LEVELLED.get('c'), shaC = sha(LVC);
  const putCopy = (audioId, bytes, dur) => {
    F.S.set('songFiles/' + audioId, { file: audioId + '.mp3', bytes: bytes.length, sha256: sha(bytes), pieces: Math.ceil(bytes.length / 900000), pieceBytes: 900000, durationSec: dur, state: 'ready', uploadedAt: TS });
    for(let i = 0; i * 900000 < bytes.length; i++) F.S.set(`songFiles/${audioId}/pieces/${i}`, { i, data: new FakeBytes(bytes.subarray(i * 900000, (i + 1) * 900000)) });
  };
  const seedDraft = (did, title, audioId) => F.S.set('songDrafts/' + did, { v: 1, title, artist: 'The Test Band', step: 7,
    source: { name: 'test-c.mp3', bytes: SRC_C.length, sha256: sha(SRC_C), durationSec: 15, sampleRate: 44100, channels: 1, kbps: 192 },
    audio: { id: audioId, bytes: LVC.length, sha256: shaC, durationSec: 15, centsOff: 2, gainDb: 1.5, sourceSha256: sha(SRC_C) },
    volume: { before: -14, after: -12.5, samplePeak: -1.2, truePeak: -1.1, ceilingDb: -1, encodes: 1 }, pitch: { cents: 2, peaks: 10 },
    beat: { meter: '4/4', bpm: 96, anchor: 0.5, pins: [], trackBpm: 96, trackSub: 2, driftOff: 0, pinsNeeded: 2 },
    chart: { text: '', meter: '4/4', fmt: 'bar lines', sections: [{ name: 'intro', label: 'Intro', n: null, bars: ['G'], lyrics: null },
      { name: 'verse', label: 'Verse', n: null, bars: ['G', 'C'], lyrics: null }, { name: 'chorus', label: 'Chorus', n: null, bars: ['D', 'G'], lyrics: null }], left: [], kept: [], edited: true },
    level: { versions: 'full', start: null, range: null }, pubVer: null, savedAt: F.stamp() });
  const bare = p => { const x = F.S.get(p); if(!x) return null; const o = JSON.parse(JSON.stringify(x)); delete o.savedAt; return o; };
  const listOf = () => (F.S.get('builtSongsMeta/list') || { songs: {} }).songs;
  const waitIdle = async (K, ms) => { const t0 = Date.now(); while(K.run('sbBusy') !== '' && Date.now() - t0 < ms) await sleep(1); };
  /* Manage → Built songs' Import, in console K (the builder's own tab, or another one), of the song file f under `fid` */
  const importIn = async (K, fid, f, bytes) => {
    K.run("teacherView = 'manage'");
    K.box.__dur = f.audio.durationSec; K.run('teacherSfDuration = async () => __dur;');
    K.box.__j = new Blob([JSON.stringify({ id: fid, v: f.v, title: f.title, artist: f.artist, audio: f.audio, song: f.song })], { type: 'application/json' });
    K.box.__m = new Blob([bytes || LVC], { type: 'audio/mpeg' });
    await K.run('teacherBsImport(__j, __m)'); await settle();
    const note = K.run('teacherBsNote');
    K.run("teacherView = 'songbuilder'");
    return note;
  };

  /* the builder's own song, published once (a first Publish: one click) */
  const id = 'sb-r2pubdraft01', aid = id + '-' + shaC.slice(0, 8);
  putCopy(aid, LVC, 15); seedDraft(id, 'Test 0 R2', aid);
  F.S.set('builtSongsMeta/list', { songs: {}, updatedAt: TS });
  run('renderTeacherSongBuilder()'); await settle();
  run(`sbOpen(${JSON.stringify(id)})`); await settle();
  env.confirmAnswer = true;
  run('sbPublish()'); await settle(200);
  const pub0 = bare('builtSongs/' + id);

  /* R2-1, this tab: Manage → Built songs imports a fixed copy of the same song (Export, Claude, Import) */
  let after1 = null;
  {
    const fixed = JSON.parse(JSON.stringify(pub0)); fixed.title = 'Test 0 R2 Fixed'; fixed.song.bars[0] = 'C';
    const note = await importIn(C, id, fixed);
    run('renderTeacherSongBuilder()'); await settle();
    const page = run('sbDetailHtml()');
    run("sbPubAct('edit', { dataset: {} })"); await settle();
    const dd = run('sbDocOf(sbDraft())'), btn = run('sbPublishBtnHtml(sbDraft())');
    run('sbPublish()'); await settle(200);                 // pressed anyway (the button says there is nothing to publish)
    after1 = bare('builtSongs/' + id);
    check('R2-1 (this tab): after an Import over a song the builder published, its page says nothing about unpublished changes; Edit starts from the IMPORTED song (a draft rebuilt from it), Publish reads "no changes", and a Publish anyway keeps the import (title, bar 1)',
      /^Imported/.test(note) && !/changes that are not published/.test(page) && dd && dd.title === 'Test 0 R2 Fixed' && dd.song.bars[0] === 'C' && /no changes/.test(btn) && /disabled/.test(btn)
      && after1 && after1.title === 'Test 0 R2 Fixed' && after1.song.bars[0] === 'C',
      JSON.stringify({ note: note.slice(0, 60), flag: /changes that are not published/.test(page), draftTitle: dd && dd.title, bar1: dd && dd.song.bars[0], btn: btn.replace(/<[^>]*>/g, ''), stored: after1 && [after1.title, after1.song.bars[0]] }));
  }
  /* R2-1, a reload: another tab imports again; this console is opened fresh */
  {
    const fixed2 = JSON.parse(JSON.stringify(after1)); fixed2.title = 'Test 0 R2 Fixed Twice'; fixed2.song.bars[1] = 'C';
    const M = makeConsole(consoleSrc, F);
    await importIn(M, id, fixed2);
    const R = makeConsole(consoleSrc, F);
    R.run('renderTeacherSongBuilder()'); await settle();
    R.run(`sbOpen(${JSON.stringify(id)})`); await settle();
    const list = R.run('sbListHtml()'), page = R.run('sbDetailHtml()'), staleWhy = R.run('sbPublishWhy(sbDraft(), sbSel)');
    R.run("sbPubAct('edit', { dataset: {} })"); await settle();
    const dd = R.run('sbDocOf(sbDraft())');
    R.env.confirmAnswer = true; R.run('sbPublish()'); await settle(200);
    const after2 = bare('builtSongs/' + id);
    check('R2-1 (a reload): a draft OLDER than the published song (imported from another tab) is not "Changes not published" in the list or on the page, and is never published (its one reason); Edit starts from the import; a Publish keeps it',
      !/Changes not published/.test(list) && !/changes that are not published/.test(page) && staleWhy.length === 1 && /imported again after this draft was saved/.test(staleWhy[0])
      && dd && dd.title === 'Test 0 R2 Fixed Twice' && dd.song.bars[1] === 'C' && after2 && after2.title === 'Test 0 R2 Fixed Twice' && after2.song.bars[1] === 'C',
      JSON.stringify({ tag: /Changes not published/.test(list), flag: /changes that are not published/.test(page), staleWhy, draftTitle: dd && dd.title, stored: after2 && [after2.title, after2.song.bars[1]] }));
  }
  /* R2-6: an Import over the LIVE song whose transaction fails: nothing changes for students, and the line says so */
  {
    const live0 = JSON.stringify(F.S.get('builtSongs/' + id)), ver0 = listOf()[id];
    const fixed3 = bare('builtSongs/' + id); fixed3.title = 'Test 0 R2 Not Saved';
    const M = makeConsole(consoleSrc, F);
    F.st.failWrite = p => p === 'builtSongsMeta/list';
    const note = await importIn(M, id, fixed3);
    F.st.failWrite = null;
    check('R2-6: an Import over a live song whose write fails changes nothing (the song and the list in ONE transaction: builtSongs/<id> as it was, the same edit number) and says students have what they had before',
      JSON.stringify(F.S.get('builtSongs/' + id)) === live0 && listOf()[id] === ver0 && /students have what they had before/.test(note) && !/students do not see it yet/.test(note),
      JSON.stringify({ docKept: JSON.stringify(F.S.get('builtSongs/' + id)) === live0, ver: [ver0, listOf()[id]], note }));
  }

  /* R2-2: a chart given at step 1 (chords over lyrics: 4 bars) against a recording of about 9 bars at 96 BPM */
  const C2 = makeConsole(consoleSrc, F);
  {
    C2.run('renderTeacherSongBuilder()'); await settle();
    C2.run('sbNewSong()'); await settle();
    box_set(C2, '__f', fileOf('test-a.mp3', SRC_A, 24)); C2.run('sbPickFile(__f)'); await settle();
    C2.run(`sbNew = { title: 'Test R2 Bars', artist: 'Test Band', chartText: ${JSON.stringify('[Verse]\nG  C\nTest words here\nD  G\nMore test words')} }`);
    C2.run('sbSaveUpload()'); await settle(200);
    C2.run('sbMem.level.E = sbOnsetEnv(sbMem.level.mono, sbMem.level.fs); sbStepOn = 3; sbBeatFromBpm(96, null);'); await sleep(1400); await settle();
    C2.run('sbGoStep(4)'); await settle();
    const rec = C2.run('sbBarsIn(sbDraft().beat, sbDraft().audio.durationSec)'), view = C2.run('sbChFor(sbSel).view'), p4 = C2.run('sbChartPaneHtml(sbDraft())');
    C2.run("sbChartAct('chart-view', { dataset: { sbV: 'grid' } })");
    const grid = C2.run('sbChartPaneHtml(sbDraft())');
    C2.run('sbGoStep(5)'); await settle(); C2.run('sbGoStep(6)'); await settle(100);
    const pv = C2.run('sbPreviewPaneHtml(sbDraft())'), pubPane = C2.run('sbPublishPaneHtml(sbDraft())'), why = C2.run('sbPublishWhy(sbDraft(), sbSel)'), btn = C2.run('sbPublishBtnHtml(sbDraft())');
    const row = (pubPane.match(/<dt>Chart<\/dt><dd>([\s\S]*?)<\/dd>/) || [, ''])[1];
    const say = /The chart makes 4 bars; the recording has about \d+/;
    check('R2-2: a step-1 chart of 4 bars against a recording of about 9: step 4 opens on "what was read" (a bar count that differs is something to settle), the grid says it too, the Preview step warns, the Publish page\'s Chart row warns "4 bars; the recording has N" instead of a ✓, and Publish stays on (it only warns)',
      rec >= 8 && view === 'read' && say.test(p4) && say.test(grid) && say.test(pv) && /4 bars; the recording has \d+/.test(row) && !/sb-ok/.test(row) && why.length === 0 && !/disabled/.test(btn) && C2.run('sbStepOn') === 6,
      JSON.stringify({ rec, view, read: say.test(p4), grid: say.test(grid), preview: say.test(pv), row: row.replace(/<[^>]*>/g, ''), why, step: C2.run('sbStepOn') }));
  }
  /* R2-9 (b): a drift check measured on another levelled copy blocks Publish */
  {
    const w = C2.run(`(() => { const keep = sbDrafts.get(sbSel), d = JSON.parse(JSON.stringify(keep)); d.beat.driftFor = '${'0'.repeat(64)}'; d.beat.driftOff = 0; sbDrafts.set(sbSel, d); try { return sbPublishWhy(d, sbSel); } finally { sbDrafts.set(sbSel, keep); } })()`);
    check('R2-9: a drift check made on another levelled copy (driftFor is not this copy\'s SHA-256) is the one reason Publish is off', w.length === 1 && /The drift check was made on another levelled copy/.test(w[0]), JSON.stringify(w));
  }
  /* R2-8: a reload opens that draft on Preview (its furthest step): nothing is downloaded until ▶ */
  {
    const id8 = C2.run('sbSel'), R8 = makeConsole(consoleSrc, F);
    R8.run('renderTeacherSongBuilder()'); await settle();
    const month = R8.run('songFileMonth()'), u0 = (F.S.get('songFilesUsage/' + month) || {}).bytes || 0, r0 = F.st.reads.length;
    R8.run(`sbOpen(${JSON.stringify(id8)})`); await settle(100);
    R8.run('teacherSbPaint()'); await settle(100);
    const u1 = (F.S.get('songFilesUsage/' + month) || {}).bytes || 0, pieces = F.st.reads.slice(r0).filter(p => /\/pieces\//.test(p)).length;
    const pane = R8.run('sbPreviewPaneHtml(sbDraft())');
    check('R2-8: a draft saved at Preview opens on Preview after a reload with nothing downloaded (no song download counted, no piece read); the card is there, and the step says the copy loads when ▶ is pressed',
      R8.run('sbStepOn') === 6 && u1 === u0 && pieces === 0 && /data-sb-pvslot/.test(pane) && /loads when you press ▶/.test(pane),
      JSON.stringify({ step: R8.run('sbStepOn'), counted: u1 - u0, pieces, slot: /data-sb-pvslot/.test(pane) }));
  }

  /* R2-3: four imported songs the validator takes that the builder writes another way; R2-10; R2-9 (a); R2-4 */
  const imported = (name, sid, mut) => {
    const f = FIXTURES[name], d = withAudio(f.doc, LVC.length, shaC);
    d.audio.id = audioIdFor(sid, shaC);
    if(mut) mut(d);
    putCopy(d.audio.id, LVC, d.audio.durationSec);
    F.S.set('builtSongs/' + sid, Object.assign(JSON.parse(JSON.stringify(d)), { savedAt: F.stamp() }));
    F.S.set('builtSongsMeta/list', { songs: Object.assign({}, listOf(), { [sid]: 3 }), updatedAt: TS });
    return d;
  };
  const four = [
    ['a level whose start is its only version', 'sb-r2startpow01', 'threeFour', d => { d.song.level = { versions: 'power', start: 'power' }; }],
    ['a section whose lyric lines are all empty', 'sb-r2emptylyr01', 'fourFour', d => { d.song.sections[0].lyrics = [{ text: '', bars: 2 }, { text: '', bars: 2 }]; }],
    ['a chord no bar plays', 'sb-r2unusedch01', 'fourFour', d => { d.song.chords.A = { full: { frets: [null, 0, 2, 2, 2, 0] }, power: { frets: [null, 0, 2, 2, null, null] } }; }],
    ['a title with a space at its end', 'sb-r2trailsp001', 'fourFour', d => { d.title = 'Test Trailing Space '; }],
  ];
  const docs = four.map(([, sid, name, mut]) => imported(name, sid, mut));
  const noGain = imported('fourFour', 'sb-r2nogain0001', d => { d.title = 'Test No Gain'; });
  const nonMs = imported('beatMap', 'sb-r2nonms00001', d => { d.song.barTimes = d.song.barTimes.map((t, i) => i ? Math.round((t + 0.0004 + i * 0.00003) * 1e6) / 1e6 : t); });
  const beatMap = imported('beatMap', 'sb-r2beatmap001');
  const R3 = makeConsole(consoleSrc, F);
  R3.run('renderTeacherSongBuilder()'); await settle();
  {
    const got = [];
    for(let i = 0; i < four.length; i++){
      const sid = four[i][1];
      R3.run(`sbOpen(${JSON.stringify(sid)})`); await settle();
      R3.run("sbPubAct('edit', { dataset: {} })"); await settle();
      got.push({ name: four[i][0], valid: run('builtSongCheck')(sid, JSON.parse(JSON.stringify(docs[i]))).length === 0, opened: R3.run('sbShowsSteps()'), changed: R3.run('sbPubChanged(sbDraft(), sbPublished.get(sbSel))'),
        btn: R3.run('sbPublishBtnHtml(sbDraft())').replace(/<[^>]*>/g, ''), tag: /Changes not published/.test((R3.run('sbListHtml()').match(new RegExp(`data-sb-pick="${sid}"[\\s\\S]*?</button>`)) || [''])[0]) });
      R3.run("sbPubAct('edit-done', { dataset: {} })");
    }
    check('R2-3: Edit with no change on four imported songs the validator takes (a level whose start is its only version, a section of empty lyric lines, a chord no bar plays, a title ending in a space): no "Changes not published", Publish reads "Published (no changes)" (no new edit number for a change students would not see)',
      got.every(g => g.valid && g.opened && g.changed === false && /no changes/.test(g.btn) && !g.tag), JSON.stringify(got));
  }
  {
    R3.run("sbOpen('sb-r2nogain0001')"); await settle();
    R3.run("sbPubAct('edit-step', { dataset: { sbV: '6' } })"); await settle();
    const pane = R3.run('sbPublishPaneHtml(sbDraft())'), recRow = (pane.match(/<dt>Recording<\/dt><dd>([\s\S]*?)<\/dd>/) || [, ''])[1];
    check('R2-10: an imported song with no gainDb: the Publish page\'s Recording row says it was levelled when its song file was made, never "−0.0 dB"', !/0\.0 dB/.test(recRow) && /levelled when its song file was made/.test(recRow) && !('gainDb' in noGain.audio), recRow.replace(/<[^>]*>/g, ''));
    R3.run("sbPubAct('edit-done', { dataset: {} })");
  }
  {
    R3.run("sbOpen('sb-r2nonms00001')"); await settle();
    R3.run("sbPubAct('edit', { dataset: {} })"); await settle();
    const bt = R3.run('sbDocOf(sbDraft()).song.barTimes');
    R3.env.confirmAnswer = true;
    R3.run("sbChartEdit(sbDraft(), sbGridSetBar(sbDraft().chart.sections, 2, 'E'), null)"); await sleep(1400); await settle();
    R3.run('sbPublish()'); await settle(200);
    const stored = (bare('builtSongs/sb-r2nonms00001') || { song: {} }).song.barTimes;
    check('R2-9: bar times that are not whole milliseconds (an imported beat map) come back bit for bit in the rebuilt draft, and an edit published keeps them so',
      nonMs.song.barTimes.some(t => Math.round(t * 1000) / 1000 !== t) && JSON.stringify(bt) === JSON.stringify(nonMs.song.barTimes) && JSON.stringify(stored) === JSON.stringify(nonMs.song.barTimes),
      JSON.stringify({ want: nonMs.song.barTimes.slice(0, 3), draft: bt && bt.slice(0, 3), stored: stored && stored.slice(0, 3) }));
  }
  {
    R3.run("sbOpen('sb-r2beatmap001')"); await settle();
    R3.run("sbPubAct('edit', { dataset: {} })"); await settle();
    /* its 13 bar times hold 12 bars, or 13 with no end time: one bar more passes the validator, two do not */
    R3.run('sbChFor(sbSel).sel = 2'); R3.run("sbChartAct('bar-add', { dataset: {} })");
    const one = R3.run('sbSongWhy(sbDraft(), sbSel)');
    R3.run("sbChartAct('bar-add', { dataset: {} })");
    const add = R3.run('sbSongWhy(sbDraft(), sbSel)');
    R3.run("sbChartAct('chart-undo', { dataset: {} })"); R3.run("sbChartAct('chart-undo', { dataset: {} })");
    R3.run('sbChFor(sbSel).sel = 2'); R3.run("sbChartAct('bar-remove', { dataset: {} })");
    const rm = R3.run('sbSongWhy(sbDraft(), sbSel)');
    R3.run("sbChartAct('chart-undo', { dataset: {} })");
    const back = R3.run('sbSongWhy(sbDraft(), sbSel)');
    await sleep(1400); await settle();
    const plain = w => w.length === 1 && /cannot gain or lose a bar here/.test(w[0]) && !/barTimes needs/.test(w.join(' '));
    check('R2-4: an imported beat-map song given two bars more, or a bar less, is refused in ONE plain sentence (it cannot gain or lose a bar here), not the validator\'s "barTimes needs…"; one bar more (no end time) passes, as the validator takes it; Undo makes it pass again',
      one.length === 0 && plain(add) && plain(rm) && back.length === 0 && beatMap.song.barTimes.length === 13, JSON.stringify({ one, add, rm, back }));
  }

  /* R2-5: Delete… in one tab while another tab's Publish of an edit waits to write: never a listed song with no audio */
  {
    const X = 'sb-r2racesong01', zid = X + '-' + shaC.slice(0, 8);
    putCopy(zid, LVC, 15); seedDraft(X, 'Test R2 Race', zid);
    const sx = run('sbSongOf')(JSON.parse(JSON.stringify(F.S.get('songDrafts/' + X))));
    F.S.set('builtSongs/' + X, { v: 1, title: 'Test R2 Race', artist: 'The Test Band', audio: JSON.parse(JSON.stringify(F.S.get('songDrafts/' + X).audio)), song: JSON.parse(JSON.stringify(sx)), savedAt: F.stamp() });
    F.S.set('builtSongsMeta/list', { songs: Object.assign({}, listOf(), { [X]: 5 }), updatedAt: TS });
    const A = makeConsole(consoleSrc, F), B = makeConsole(consoleSrc, F);
    for(const K of [A, B]){ K.run('renderTeacherSongBuilder()'); await settle(); K.run(`sbOpen(${JSON.stringify(X)})`); await settle(); }
    B.run("sbPubAct('edit-step', { dataset: { sbV: '5' } })"); await settle();
    B.run("sbChartSet(sbDraft(), { level: { versions: 'both', start: 'full', range: null } }, null, true)"); await settle();
    let release; const gate = new Promise(r => { release = r; });
    const tx0 = F.db.runTransaction; let armed = true;
    F.db.runTransaction = async fn => { if(armed){ armed = false; await gate; } return tx0(fn); };
    B.env.confirmAnswer = true; B.run('sbPublish()');
    for(let t = 0; t < 400 && armed; t++) await tick();
    A.env.promptAnswer = 'Test R2 Race'; A.run("sbPubAct('delete-song', { dataset: {} })");
    await waitIdle(A, 5000);
    release(); await waitIdle(B, 5000);
    F.db.runTransaction = tx0;
    await settle(100);
    const listed = !!listOf()[X], doc = !!F.S.get('builtSongs/' + X), head = !!F.S.get('songFiles/' + zid);
    check('R2-5: Delete… in one tab while another tab\'s Publish of an edit waits for its transaction: the Publish finds the copy gone and writes nothing, so no song is left on the list without its audio',
      !armed && !(listed && !head) && !listed && !doc && /^Not published: the levelled copy in the database is missing/.test(B.run('sbNote')) && /^Deleted "Test R2 Race"/.test(A.run('sbNote')),
      JSON.stringify({ listed, doc, head, B: B.run('sbNote').slice(0, 80), A: A.run('sbNote').slice(0, 40) }));
  }

  /* R2-7: a step-1 chart with no chords in it */
  {
    const C3 = makeConsole(consoleSrc, F);
    C3.run('renderTeacherSongBuilder()'); await settle();
    C3.run('sbNewSong()'); await settle();
    box_set(C3, '__f', fileOf('test-b.mp3', SRC_B, 24.02)); C3.run('sbPickFile(__f)'); await settle();
    C3.run("sbNew = { title: 'Test R2 No Chords', artist: '', chartText: 'Test words only here\\nand more test words' }");
    C3.run('sbSaveUpload()'); await settle(200);
    const note = C3.run('sbNote'), levelled = !!C3.run('sbDraft() && sbDraft().audio');
    check('R2-7: a chart given at step 1 with no chords in it: "No chords could be read" stays on screen after Volume has run by itself',
      levelled && /No chords could be read/.test(note) && /Levelled/.test(note), JSON.stringify({ levelled, note }));
    C3.run('sbGoStep(4)'); await settle();
    C3.run("sbChartInput({ target: { matches: q => q === '[data-sb-charttext]', value: '[Verse]\\nG C D G' } })");
    C3.run('sbGoStep(1)'); await settle();
    C3.run('sbSaveUpload(4)'); await settle(200);
    const box = C3.run('sbChFor(sbSel).text'), pane = C3.run('sbChartPaneHtml(sbDraft())'), note1 = C3.run('sbNote');
    /* a NEW step-1 text with no chords either: it is read (it changed), the read fails, and his box is still kept */
    C3.run('sbGoStep(1)'); await settle();
    C3.run("sbDraft().chartText = 'Other test words, still no chords'");
    C3.run('sbSaveUpload(4)'); await settle(200);
    const box2 = C3.run('sbChFor(sbSel).text'), note2 = C3.run('sbNote');
    check('R2-7: a chart typed at step 4 and not read yet is still in the box after step 1 is saved again (the step-1 text did not change, so it is not read again: no second "No chords could be read"), and after a changed step-1 text is read and fails',
      box === '[Verse]\nG C D G' && /G C D G<\/textarea>/.test(pane) && !/No chords could be read/.test(note1) && box2 === '[Verse]\nG C D G' && /No chords could be read/.test(note2) && C3.run('sbStepOn') === 4,
      JSON.stringify({ box, note1, box2, note2, step: C3.run('sbStepOn') }));
  }
  check('review round 2: every write fits firestore.rules and none goes to config/class or progress/', F.st.violations.length === 0 && !F.st.writes.some(w => /^(config|progress)\//.test(w.path)),
    F.st.writes.length + ' writes; ' + (F.st.violations.slice(0, 3).join('; ') || 'no violation'));
}

/* ── REVIEW ROUND 3 (2026-11-16): Publish writes the draft in its own transaction (R3-1), so a draft the builder
   published is never called stale after a change to how the builder makes a song, and an Import that came back
   unchanged keeps the draft; a stale draft shows no steps (R3-2) and its page says Edit starts from the import (R3-6);
   Import reads the audio's head in its transaction (R3-3); the ways round 2's code could break that its cases missed
   (R3-4: Unpublish and Edit of a stale draft with their copies, the Import hook, the first ▶ on a reopened Preview, a
   chord no longer counted when it is not in bar 1, and sbPubNorm against the student's card on every fixture); a
   recording one bar longer than the chart (R3-5). Its own store, with a server time on savedAt, one per commit. ── */
async function r3Cases(consoleSrc, check){
  const F = makeDb(); F.st.stamp = true;
  const LVC = LEVELLED.get('c'), shaC = sha(LVC), LVB = LEVELLED.get('b'), shaB = sha(LVB);
  const putCopy = (audioId, bytes, dur) => {
    F.S.set('songFiles/' + audioId, { file: audioId + '.mp3', bytes: bytes.length, sha256: sha(bytes), pieces: Math.ceil(bytes.length / 900000), pieceBytes: 900000, durationSec: dur, state: 'ready', uploadedAt: TS });
    for(let i = 0; i * 900000 < bytes.length; i++) F.S.set(`songFiles/${audioId}/pieces/${i}`, { i, data: new FakeBytes(bytes.subarray(i * 900000, (i + 1) * 900000)) });
  };
  const CHART_TEXT = '[Intro]\n| G |\n[Verse]\n| G | C |\n[Chorus]\n| D | G |';
  const PINS = { beat: { meter: '4/4', bpm: 96, anchor: 0.5, pins: [{ bar: 3, t: 5.5013 }, { bar: 5, t: 10.5029 }], trackBpm: 96, trackSub: 2, driftOff: 0, pinsNeeded: 3 } };
  const seedDraft = (did, title, audioId, extra) => F.S.set('songDrafts/' + did, Object.assign({ v: 1, title, artist: 'The Test Band', step: 7,
    source: { name: 'test-c.mp3', bytes: SRC_C.length, sha256: sha(SRC_C), durationSec: 15, sampleRate: 44100, channels: 1, kbps: 192 },
    audio: { id: audioId, bytes: LVC.length, sha256: shaC, durationSec: 15, centsOff: 2, gainDb: 1.5, sourceSha256: sha(SRC_C) },
    volume: { before: -14, after: -12.5, samplePeak: -1.2, truePeak: -1.1, ceilingDb: -1, encodes: 1 }, pitch: { cents: 2, peaks: 10 },
    beat: { meter: '4/4', bpm: 96, anchor: 0.5, pins: [], trackBpm: 96, trackSub: 2, driftOff: 0, pinsNeeded: 2 },
    chart: { text: CHART_TEXT, meter: '4/4', fmt: 'bar lines', sections: [{ name: 'intro', label: 'Intro', n: null, bars: ['G'], lyrics: null },
      { name: 'verse', label: 'Verse', n: null, bars: ['G', 'C'], lyrics: null }, { name: 'chorus', label: 'Chorus', n: null, bars: ['D', 'G'], lyrics: null }], left: [], kept: [], edited: true },
    level: { versions: 'full', start: null, range: null }, pubVer: null, savedAt: F.stamp() }, extra || {}));
  const bare = p => { const x = F.S.get(p); if(!x) return null; const o = JSON.parse(JSON.stringify(x)); delete o.savedAt; return o; };
  const ms = p => { const x = F.S.get(p); return x && x.savedAt && typeof x.savedAt.toMillis === 'function' ? x.savedAt.toMillis() : null; };
  const listOf = () => (F.S.get('builtSongsMeta/list') || { songs: {} }).songs;
  const waitIdle = async (K, t) => { const t0 = Date.now(); while(K.run('sbBusy') !== '' && Date.now() - t0 < t) await sleep(1); };
  const importIn = async (K, fid, f, bytes) => {
    K.run("teacherView = 'manage'");
    K.box.__dur = f.audio.durationSec; K.run('teacherSfDuration = async () => __dur;');
    K.box.__j = new Blob([JSON.stringify({ id: fid, v: f.v, title: f.title, artist: f.artist, audio: f.audio, song: f.song })], { type: 'application/json' });
    K.box.__m = new Blob([bytes || LVC], { type: 'audio/mpeg' });
    await K.run('teacherBsImport(__j, __m)'); await settle();
    const note = K.run('teacherBsNote');
    K.run("teacherView = 'songbuilder'");
    return note;
  };
  /* A song the builder published (a first Publish), in console C */
  const publishedSong = async (id, title, extra) => {
    const aid = id + '-' + shaC.slice(0, 8);
    putCopy(aid, LVC, 15); seedDraft(id, title, aid, extra);
    if(!F.S.get('builtSongsMeta/list')) F.S.set('builtSongsMeta/list', { songs: {}, updatedAt: TS });
    const C = makeConsole(consoleSrc, F), w0 = F.st.writes.length;
    C.run('renderTeacherSongBuilder()'); await settle();
    C.run(`sbOpen(${JSON.stringify(id)})`); await settle();
    C.env.confirmAnswer = true; C.run('sbPublish()'); await settle(200);
    return { C, aid, seq: F.st.writes.slice(w0).map(w => w.op + ' ' + w.path) };
  };
  /* A reload: a fresh console on the same store (`patch`: a change to the code, made before it reads) */
  const reload = async (id, patch) => {
    const R = makeConsole(consoleSrc, F);
    if(patch) R.run(patch);
    R.run('renderTeacherSongBuilder()'); await settle();
    R.run(`sbOpen(${JSON.stringify(id)})`); await settle();
    return R;
  };
  const keptOf = R => R.run(`(() => { const d = sbDraft(); return d ? { pins: (d.beat && d.beat.pins || []).length, text: d.chart && d.chart.text, volume: !!d.volume, source: !!d.source, imported: !!d.imported, fromImport: !!(d.beat && d.beat.fromImport) } : null; })()`);
  const keptAll = k => !!k && k.pins === 2 && k.text === CHART_TEXT && k.volume && k.source && !k.imported && !k.fromImport;

  /* R3-1: the draft in Publish's transaction; a reload in code that makes the song another way */
  {
    const got = [];
    const VARIANTS = [['no change', ''], ['G given another voicing (320033)', 'CHORD_DIAGRAMS.G.chord = [[6,3,2],[5,2,1],[4,0,0],[3,0,0],[2,3,3],[1,3,4]];'],
      ['bar times rounded to 0.1 ms', 'sbBarTimes = (beat, n) => { if(sbPins(beat).length < 3) return null; const o = []; for(let b = 1; b <= n + 1; b++) o.push(Math.round(sbBarTime(beat, b) * 10000) / 10000); return o; };']];
    for(let i = 0; i < VARIANTS.length; i++){
      const [what, patch] = VARIANTS[i], id = 'sb-r3pubdraft0' + i;
      const { seq } = await publishedSong(id, 'Test 3 Published ' + i, PINS);
      const R = await reload(id, patch);
      const stale = R.run('!!sbDraft().stale'), steps = R.run('sbShowsSteps()'), page = R.run('sbDetailHtml()');
      R.run("sbPubAct('edit', { dataset: {} })"); await settle();
      got.push({ what, seq: seq.join(' → ') === `set builtSongs/${id} → set builtSongsMeta/list → set songDrafts/${id}`, sameTime: ms('songDrafts/' + id) !== null && ms('songDrafts/' + id) === ms('builtSongs/' + id),
        stale, steps, staleLine: /Edit starts from the imported song/.test(page), kept: keptOf(R), editing: R.run('sbShowsSteps()') });
    }
    check('R3-1: Publish writes the draft in its own transaction (the song, the list, the draft: one server time), so after a reload, in today\'s code and in code that makes the song another way (a chord shape changed, the bar times rounded otherwise), the draft is never called stale, and Edit keeps its 2 pins, its chart text, its volume numbers and its source (3 of 3)',
      got.length === 3 && got.every(g => g.seq && g.sameTime && !g.stale && !g.steps && !g.staleLine && keptAll(g.kept) && g.editing), JSON.stringify(got));
  }
  /* R3-1: an Import that came back unchanged keeps the draft (sbSameSong is still asked when the import is newer) */
  let freshPage = '';
  {
    const id = 'sb-r3sameimp01';
    const { C } = await publishedSong(id, 'Test 3 Same', PINS);
    const same = bare('builtSongs/' + id);
    const n1 = await importIn(C, id, same);
    const here = C.run('!!sbDraft().stale');
    const M = makeConsole(consoleSrc, F);
    const n2 = await importIn(M, id, same);
    const R = await reload(id);
    const newer = ms('builtSongs/' + id) > ms('songDrafts/' + id), stale = R.run('!!sbDraft().stale');
    freshPage = R.run('sbDetailHtml()');
    R.run("sbPubAct('edit', { dataset: {} })"); await settle();
    const k = keptOf(R);
    check('R3-1: an Import that came back unchanged (the same song) keeps the builder\'s draft: not stale in the tab that imported it, nor after a reload once another tab imported it again (the import IS newer than the draft), and Edit keeps its 2 pins and its chart text',
      /^Imported/.test(n1) && /^Imported/.test(n2) && !here && newer && !stale && keptAll(k), JSON.stringify({ n1: n1.slice(0, 20), here, newer, stale, k }));
  }
  /* R3-2 and R3-6: a tab with Edit open when another tab imports a changed song */
  {
    const id = 'sb-r3twotab001';
    const { C: A } = await publishedSong(id, 'Test 3 Two Tabs');
    A.run("sbPubAct('edit', { dataset: {} })"); await settle();
    const before = A.run('sbShowsSteps()');
    const fixed = bare('builtSongs/' + id); fixed.title = 'Test 3 Two Tabs Fixed'; fixed.song.bars[0] = 'C';
    const M = makeConsole(consoleSrc, F);
    await importIn(M, id, fixed);
    A.run('teacherSbLoad()'); await settle();                    // its own read (every 15 s on a paint)
    const stale = A.run('!!sbDraft().stale'), steps = A.run('sbShowsSteps()'), page = A.run('sbDetailHtml()');
    /* the same page when the imported song fails today's checks: the builder cannot open it, so no Edit, no Unpublish */
    const pageBad = A.run("(() => { const p = sbPublished.get(sbSel), keep = p.doc; p.doc = JSON.parse(JSON.stringify(keep)); p.doc.song.bars[0] = 'Zz'; try { return sbDetailHtml(); } finally { p.doc = keep; } })()");
    A.run("sbPubAct('edit', { dataset: {} })"); await settle();
    const dd = A.run('sbDocOf(sbDraft())');
    A.run("sbChartEdit(sbDraft(), sbGridSetBar(sbDraft().chart.sections, 4, 'C'), null)"); await sleep(1400); await settle();
    A.env.confirmAnswer = true; A.run('sbPublish()'); await settle(200);
    const stored = bare('builtSongs/' + id);
    check('R3-2: a tab with Edit open when another tab imports the song shows the song\'s page (no steps) once it reads again, so nothing there publishes the older song over the import; its Edit starts from the import, and a change published from there keeps the import (its title, its bar 1)',
      before && stale && !steps && /data-sb-act="edit"/.test(page) && dd && dd.title === 'Test 3 Two Tabs Fixed' && dd.song.bars[0] === 'C' && stored && stored.title === 'Test 3 Two Tabs Fixed' && stored.song.bars[0] === 'C' && stored.song.bars[4] === 'C',
      JSON.stringify({ before, stale, steps, draft: dd && [dd.title, dd.song.bars[0]], stored: stored && [stored.title, stored.song.bars[0], stored.song.bars[4]], note: A.run('sbNote').slice(0, 60) }));
    const line = /This song was imported after your draft was last saved, so Edit starts from the imported song and replaces the draft\./;
    const bad = { line: line.test(pageBad), fails: /fails today's checks, so the builder cannot open it/.test(pageBad), edit: /data-sb-act="edit/.test(pageBad), unpublish: /data-sb-act="unpublish"/.test(pageBad) };
    check('R3-6: the page of a stale draft says in one line that Edit starts from the imported song (and replaces the draft); a draft that is not stale does not get the line; when the imported song fails today\'s checks the page says the builder cannot open it instead, with no Edit or Unpublish',
      line.test(page) && !line.test(freshPage) && /Edit opens the steps again/.test(freshPage) && !bad.line && bad.fails && !bad.edit && !bad.unpublish,
      JSON.stringify({ stale: line.test(page), fresh: line.test(freshPage), bad }));
  }
  /* R3-3: Import against Delete… in another tab: the Import's transaction waits until the Delete has removed the audio */
  {
    const id = 'sb-r3impdel001', title = 'Test 3 Import Delete';
    const { C: A, aid } = await publishedSong(id, title);
    const fixed = bare('builtSongs/' + id); fixed.title = title + ' Fixed';
    const M = makeConsole(consoleSrc, F);
    M.run("teacherView = 'manage'"); M.box.__dur = fixed.audio.durationSec; M.run('teacherSfDuration = async () => __dur;');
    M.box.__j = new Blob([JSON.stringify(Object.assign({ id }, fixed))], { type: 'application/json' }); M.box.__m = new Blob([LVC], { type: 'audio/mpeg' });
    let release; const gate = new Promise(r => { release = r; });
    const tx0 = F.db.runTransaction; let armed = true;
    F.db.runTransaction = async fn => { if(armed){ armed = false; await gate; } return tx0(fn); };
    const p = M.run('teacherBsImport(__j, __m)');
    for(const t0 = Date.now(); armed && Date.now() - t0 < 5000;) await sleep(1);
    A.env.promptAnswer = title; A.run("sbPubAct('delete-song', { dataset: {} })");
    await waitIdle(A, 5000); await settle();
    const goneFirst = !F.S.get('songFiles/' + aid);
    release(); await p; await settle(100);
    F.db.runTransaction = tx0;
    const listed = !!listOf()[id], doc = !!F.S.get('builtSongs/' + id), head = !!F.S.get('songFiles/' + aid), note = M.run('teacherBsNote');
    check('R3-3: an Import whose transaction runs after Delete… in another tab removed the song and its audio reads the audio again inside it, finds it gone and writes nothing (never a listed song with no audio), and says so',
      !armed && goneFirst && !listed && !doc && !head && /^The import failed: the audio or the lyrics sheet in the database was deleted or changed while the song was being saved/.test(note) && /students have what they had before/.test(note) && /^Deleted "Test 3 Import Delete"/.test(A.run('sbNote')),
      JSON.stringify({ goneFirst, listed, doc, head, note: note.slice(0, 90), A: A.run('sbNote').slice(0, 40) }));
  }
  /* R3-4: Unpublish and Edit of a stale draft whose own levelled copy is not the import's */
  {
    const U = 'sb-r3staleunp01', E = 'sb-r3staleedt01', info = {};
    for(const id of [U, E]){
      const { aid } = await publishedSong(id, 'Test 3 Stale ' + (id === U ? 'Unpublish' : 'Edit'));
      const fixed = bare('builtSongs/' + id); fixed.title += ' Fixed'; fixed.song.bars[0] = 'C';
      fixed.audio = { id: id + '-' + shaB.slice(0, 8), bytes: LVB.length, sha256: shaB, durationSec: 24.02, centsOff: 0 };
      const note = await importIn(makeConsole(consoleSrc, F), id, fixed, LVB);
      info[id] = { aid, bid: fixed.audio.id, title: fixed.title, note: /^Imported/.test(note) };
    }
    const R = await reload(U);
    const sU = R.run('!!sbDraft().stale');
    R.env.confirmAnswer = true; R.run('sbUnpublish()'); await settle(200);
    const dU = F.S.get('songDrafts/' + U);
    const u = { imported: info[U].note, stale: sU, title: dU && dU.title, audio: dU && dU.audio && dU.audio.id === info[U].bid, oldCopy: !!F.S.get('songFiles/' + info[U].aid), newCopy: !!F.S.get('songFiles/' + info[U].bid), listed: !!listOf()[U], doc: !!F.S.get('builtSongs/' + U) };
    check('R3-4: Unpublish of a stale draft (a builder song imported over with another levelled copy) keeps a draft rebuilt from the import (its title, its copy), never the stale one, and deletes the stale draft\'s own copy; the import\'s copy stays',
      u.imported && u.stale && u.title === info[U].title && u.audio && !u.oldCopy && u.newCopy && !u.listed && !u.doc, JSON.stringify(u));
    R.run(`sbOpen(${JSON.stringify(E)})`); await settle();
    const sE = R.run('!!sbDraft().stale'), pub0 = JSON.stringify(F.S.get('builtSongs/' + E));
    R.run("sbPubAct('edit', { dataset: {} })"); await settle();
    const dE = F.S.get('songDrafts/' + E);
    const e = { imported: info[E].note, stale: sE, title: dE && dE.title, audio: dE && dE.audio && dE.audio.id === info[E].bid, oldCopy: !!F.S.get('songFiles/' + info[E].aid), newCopy: !!F.S.get('songFiles/' + info[E].bid), pubKept: JSON.stringify(F.S.get('builtSongs/' + E)) === pub0, steps: R.run('sbShowsSteps()') };
    check('R3-4: Edit of a stale draft starts from the import (its title, its copy) and deletes the stale draft\'s own copy, which nothing on the list plays; the import\'s copy and the published song stay as they were',
      e.imported && e.stale && e.title === info[E].title && e.audio && !e.oldCopy && e.newCopy && e.pubKept && e.steps, JSON.stringify(e));
  }
  /* R3-4: an Import in the builder's own tab (teacherSbImported) while that song's Edit is open */
  {
    const id = 'sb-r3hook00001';
    const { C } = await publishedSong(id, 'Test 3 Hook');
    C.run("sbPubAct('edit', { dataset: {} })"); await settle();
    const editing0 = C.run(`sbEditing.has(${JSON.stringify(id)})`), readAt0 = C.run('sbReadAt');
    const fixed = bare('builtSongs/' + id); fixed.title = 'Test 3 Hook Fixed';
    await importIn(C, id, fixed);
    const h = { editing0, readAt0: readAt0 > 0, editing: C.run(`sbEditing.has(${JSON.stringify(id)})`), readAt: C.run('sbReadAt'), stale: C.run('!!sbDraft().stale'), title: C.run('sbPublished.get(sbSel).title') };
    const r0 = F.st.reads.length;
    C.run('renderTeacherSongBuilder()'); await settle();
    h.reread = F.st.reads.slice(r0).includes('songDrafts');
    h.steps = C.run('sbShowsSteps()');
    check('R3-4: an Import in the builder\'s own tab closes that song\'s Edit, makes the builder\'s copy the imported song, marks the older draft stale, and the builder reads the store again on its next paint',
      h.editing0 && h.readAt0 && !h.editing && h.readAt === 0 && h.stale && h.title === 'Test 3 Hook Fixed' && h.reread && !h.steps, JSON.stringify(h));
  }
  /* R3-4 (review R2-8): the first ▶ on a Preview that has no sound yet. The page is inert here, so the card is stood in
     for: a track with no src, a ▶ that counts its presses, and the preview's own record of its card. */
  {
    const id = 'sb-r3play00001', aid = id + '-' + shaC.slice(0, 8);
    putCopy(aid, LVC, 15); seedDraft(id, 'Test 3 Play', aid, { step: 6 });
    const P = makeConsole(consoleSrc, F);
    P.run('renderTeacherSongBuilder()'); await settle();
    P.run(`sbOpen(${JSON.stringify(id)})`); await settle();
    const month = P.run('songFileMonth()'), usage = () => (F.S.get('songFilesUsage/' + month) || {}).bytes || 0, u0 = usage(), r0 = F.st.reads.length;
    P.run("teacherSbPaint = () => {}; window.SNIPPET_TRACKS = {}; SNIPPET_TRACKS[SB_PV_ID] = { src: '' }; window.__clicks = 0; window.__play = { click(){ __clicks++; } }; sbPv = { id: sbSel, key: 'k', node: { contains: x => x === __play }, act: {} };");
    const press = 'sbPvCapture({ target: { closest: s => /pc-play/.test(s) ? __play : null }, stopPropagation(){}, preventDefault(){} })';
    P.run(press); await settle(100);
    const one = { step: P.run('sbStepOn'), src: P.run('SNIPPET_TRACKS[SB_PV_ID].src'), clicks: P.run('__clicks'), counted: usage() - u0, pieces: F.st.reads.slice(r0).filter(x => /\/pieces\//.test(x)).length };
    P.run(press); await settle();
    const two = { clicks: P.run('__clicks'), counted: usage() - u0 };
    check('R3-4 (R2-8\'s first ▶): on a Preview with no sound yet, the first ▶ reads the levelled copy once (one song download), puts it on the card\'s track and presses ▶ again by itself; a ▶ after that reads nothing more',
      one.step === 6 && one.src === 'blob:sim' && one.clicks === 1 && one.counted > 0 && one.pieces > 0 && two.clicks === 1 && two.counted === one.counted, JSON.stringify({ one, two }));
  }
  /* R3-4: what sbPubNorm drops never hides a change a student would see */
  {
    const K = makeConsole(consoleSrc, F);
    K.box.__fx = JSON.parse(JSON.stringify(Object.fromEntries(Object.entries(FIXTURES).map(([k, v]) => [k, withAudio(v.doc, LVC.length, shaC)]))));
    const later = K.run(`(() => {
      let seen = 0, changed = 0;
      for(const k of Object.keys(__fx)){
        const a = __fx[k], names = b => String(b).split(/\\s+/).map(t => t.split(':')[0]), first = new Set(names(a.song.bars[0]));
        for(const n of Object.keys(a.song.chords)){
          if(first.has(n) || !a.song.bars.some(b => names(b).includes(n))) continue;
          const b = JSON.parse(JSON.stringify(a)), sh = b.song.chords[n].full || b.song.chords[n].power;
          const was = JSON.stringify(sh.frets); sh.frets = sh.frets.slice().reverse();
          if(JSON.stringify(sh.frets) === was) sh.frets = sh.frets.map(f => f == null ? f : f + 1);
          seen++; if(sbCanon(sbPubNorm(a)) !== sbCanon(sbPubNorm(b))) changed++;
        }
      }
      return { seen, changed }; })()`);
    check(`R3-4: a changed shape of a chord that bar 1 does not play is a change (Publish is on for it): ${later.changed} of ${later.seen} across the fixtures`, later.seen >= 10 && later.changed === later.seen, JSON.stringify(later));
    const diff = K.run(`(() => {
      const muts = [
        d => { d.title = ' ' + d.title + ' '; }, d => { d.artist = d.artist + ' '; }, d => { d.artist = ''; },
        d => { if(d.song.level.versions !== 'both') d.song.level.start = d.song.level.versions; },
        d => { if(d.song.level.versions === 'both') d.song.level.start = d.song.level.start === 'full' ? 'power' : 'full'; },
        d => { const n = Object.keys(d.song.chords)[0], c = d.song.chords[n]; if(c.full) c.full.frets = c.full.frets.slice().reverse(); },
        d => { const n = Object.keys(d.song.chords)[0], c = d.song.chords[n]; if(c.power) c.power.frets = [null, null, null, null, 5, 7]; },
        d => { const ks = Object.keys(d.song.chords), c = d.song.chords[ks[ks.length - 1]]; if(c.full) c.full.frets = c.full.frets.slice(0, 5).concat([null]); },
        d => { for(const n of Object.keys(d.song.chords).slice(1)){ const c = d.song.chords[n]; if(c.full) c.full.frets = [null].concat(c.full.frets.slice(1)); } },
        d => { d.song.chords.Bm = { full: { frets: [null, 2, 4, 4, 3, 2] }, power: { frets: [null, 2, 4, 4, null, null] } }; },
        d => { d.song.chords.Bm = { full: { frets: [null, 2, 4, 4, 3, 3] }, power: null }; },
        d => { d.song.sections.forEach(x => { if(!x.lyrics) x.lyrics = [{ text: '', bars: x.bars }]; }); },
        d => { d.song.sections.forEach(x => { if(x.lyrics) x.lyrics = x.lyrics.map(l => ({ text: '', bars: l.bars })); }); },
        d => { d.song.sections.forEach(x => { if(x.lyrics && x.lyrics.length > 1){ const t = x.lyrics.reduce((n, l) => n + l.bars, 0); x.lyrics = [{ text: '', bars: t }]; } }); },
        d => { const x = d.song.sections.find(s => s.lyrics); if(x) x.lyrics[0].text = x.lyrics[0].text + ' '; },
        d => { d.song.bars[0] = d.song.bars[0] === '-' ? 'G' : '-'; },
        d => { d.song.range = { from: 0, to: d.song.sections.length - 1 }; },
        d => { d.song.bpm = d.song.bpm + 0.001; },
        d => { d.audio.gainDb = 1; }, d => { d.audio.sourceSha256 = 'a'.repeat(64); },
        d => { d.song.sections[0].n = 1; },
      ];
      const id = 'sb-r3fuzz00001';
      let pairs = 0, bad = [];
      for(const k of Object.keys(__fx)){
        __fx[k].audio.id = id + '-' + __fx[k].audio.sha256.slice(0, 8);
        for(let i = 0; i < muts.length; i++) for(let j = -1; j < muts.length; j++){
          const a = JSON.parse(JSON.stringify(__fx[k])), b = JSON.parse(JSON.stringify(__fx[k]));
          muts[i](b); if(j >= 0) muts[j](b);
          if(builtSongCheck(id, a).length || builtSongCheck(id, b).length) continue;
          pairs++;
          if(sbCanon(sbPubNorm(a)) === sbCanon(sbPubNorm(b)) && sbCanon(builtSongExpand(id, a)) !== sbCanon(builtSongExpand(id, b))) bad.push(k + ' ' + i + (j >= 0 ? '+' + j : ''));
        }
      }
      return { fixtures: Object.keys(__fx).length, muts: muts.length, pairs, bad: bad.length, first: bad.slice(0, 5) }; })()`);
    check(`R3-4: sbPubNorm against the student's card: of ${diff.pairs} pairs of valid songs (${diff.fixtures} fixtures × ${diff.muts} changes, alone and in pairs), ${diff.bad} that it calls the same make a different card or track (builtSongExpand)`,
      diff.pairs >= 1000 && diff.bad === 0, JSON.stringify(diff));
  }
  /* R3-5: the chart's bar count against a recording one bar longer (its end ringing out), two bars longer, one bar shorter */
  {
    const id = 'sb-r3barsoff01', aid = id + '-' + shaC.slice(0, 8);
    putCopy(aid, LVC, 15); seedDraft(id, 'Test 3 Bars', aid);
    const K = makeConsole(consoleSrc, F);
    K.run('renderTeacherSongBuilder()'); await settle();
    K.run(`sbOpen(${JSON.stringify(id)})`); await settle();
    const views = (dur, mut) => K.run(`(() => { const keep = sbDrafts.get(sbSel), d = JSON.parse(JSON.stringify(keep)); d.audio.durationSec = ${dur}; ${mut || ''} sbDrafts.set(sbSel, d);
      try { const st = sbChFor(sbSel), v0 = st.view; st.view = 'grid'; const grid = sbChartPaneHtml(d); st.view = 'read'; const read = sbChartPaneHtml(d); st.view = v0;
        const pub = sbPublishPaneHtml(d), row = (pub.match(/<dt>Chart<\\/dt><dd>([\\s\\S]*?)<\\/dd>/) || [, ''])[1];
        return { rec: d.audio && d.beat ? sbBarsIn(d.beat, d.audio.durationSec) : null, off: sbChartBarsOff(d), grid, read, preview: sbPreviewPaneHtml(d), row }; } finally { sbDrafts.set(sbSel, keep); } })()`);
    const warn = /The chart makes 5 bars; the recording has about/;
    const one = views(16.8), two = views(19), short = views(12.6), same = views(15);
    const said = v => ({ grid: warn.test(v.grid), read: warn.test(v.read), preview: warn.test(v.preview), row: /5 bars; the recording has \d+ \(this does not stop Publish\)/.test(v.row), ok: /sb-ok/.test(v.row) });
    const s1 = said(one), s2 = said(two), s0 = said(short), sS = said(same);
    check('R3-5: a recording exactly ONE bar longer than the chart (its end ringing out: 6 bars against 5) is not flagged: no warning in the grid or in "what was read" (the count reads ✓ one more), none on Preview, and the Publish page\'s Chart row has its ✓; the same holds for an exact count',
      one.rec === 6 && one.off === null && !s1.grid && !s1.read && !s1.preview && !s1.row && s1.ok && /✓ 5 bars; the recording has one more/.test(one.grid) && same.rec === 5 && !sS.grid && !sS.read && !sS.preview && sS.ok,
      JSON.stringify({ rec: one.rec, off: one.off, s1, sS }));
    const imp = views(19, 'd.chart.fromImport = true;'), noAudio = K.run(`(() => { const d = JSON.parse(JSON.stringify(sbDraft())); d.audio = null; try { return sbChartBarsOff(d); } catch(e){ return 'threw: ' + e.message; } })()`);
    check('R3-5: a recording 2 bars longer (7 against 5) is still flagged in both views, on Preview and on the Publish page\'s Chart row; a chart longer than the recording (5 against 4) in both views (the validator keeps it from Preview); never for a chart that came with an imported song, nor before the levelled copy exists',
      two.rec === 7 && two.off && two.off.rec === 7 && s2.grid && s2.read && s2.preview && s2.row && !s2.ok && short.rec === 4 && short.off && s0.grid && s0.read && imp.off === null && !warn.test(imp.grid) && noAudio === null,
      JSON.stringify({ two: [two.rec, s2], short: [short.rec, s0], imp: imp.off, noAudio }));
  }
  check('review round 3: every write fits firestore.rules and none goes to config/class or progress/', F.st.violations.length === 0 && !F.st.writes.some(w => /^(config|progress)\//.test(w.path)),
    F.st.writes.length + ' writes; ' + (F.st.violations.slice(0, 3).join('; ') || 'no violation'));
}

/* ── THE LYRICS SHEET (2026-11-18, private chord sheets P4; teacher-sb-sheet.js) ──
   Its own console and store: a made-up imported song (FIXTURES.fourFour, full chords) and one with both chord sets
   (FIXTURES.beatMap). The check itself (sbSheetJudge: pdf.js, the song's real card through builtSongExpand, pcLayout,
   caView and pcSheetAlign) runs in the REAL student app (tools/sim-app-page.mjs) with the vendored pdf.js in Node, on
   made-up one-column pdfs (Courier: chord lines, [headers], made-up words; no real lyrics), and the console calls it
   there (the same teacher-sb-sheet.js text as the console under test). Everything else is the console's own code.
   The refusals (over 5 MB, not a pdf, a pdf with no text, a sheet that does not follow) write nothing; Add (the pdf
   through the Song files writer, then one transaction: the song read again, the list's edit number, the draft); Edit
   reads "no changes" and a republish keeps song.sheet and reads its head; Replace (a stored pdf not uploaded again, the
   old one deleted); a song changed in another tab refuses; Check it again; Export's third file; Remove; Delete. */
const sheetPdf = madePdf;
/* fourFour's 23 changes: intro G C G C, verse G D Em C twice, chorus D G (C D G) x3 (its first C is the verse's last). */
const SHEET_LINES = ['G C D Em', 'Test Song Four', '[Intro]', 'G C G C', '[Verse 1]', 'G D Em C', 'Test words for a line', 'G7 D Em C', 'Test words again', '[Chorus]', 'D G C D G C', 'Test more words here', 'D G C D G'];
const SHEET_GOOD = sheetPdf(SHEET_LINES);
const SHEET_GOOD2 = sheetPdf(SHEET_LINES.map(l => l === 'G C G C' ? 'G C G7 C' : l));
const SHEET_BAD = sheetPdf(SHEET_LINES.map(l => l === 'D G C D G C' ? 'D G C D A C' : l));
const SHEET_SCAN = sheetPdf([]);
const SHEET_BOTH = sheetPdf(['[Verse]', 'E A D A E A D A', 'Test words', '[Outro]', 'E A D A']);
const pdfFileOf = (name, bytes, size) => { const f = { name, size: size == null ? bytes.length : size, reads: 0 }; f.arrayBuffer = async () => { f.reads++; return bytes.slice().buffer; }; return f; };
async function sheetCases(consoleSrc, check, sheetSrc){
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  const lib = require(join(ROOT, 'vendor/pdfjs/pdf.min.js'));
  lib.GlobalWorkerOptions.workerSrc = join(ROOT, 'vendor/pdfjs/pdf.worker.min.js');
  const app = appPage(ROOT);
  app.ctx.pdfjsLib = { GlobalWorkerOptions: {}, getDocument: src => lib.getDocument(Object.assign({ isEvalSupported: false, verbosity: 0 }, src, { data: new Uint8Array(src.data) })) };
  app.ctx.loadScriptOnce = () => Promise.resolve();
  vm.runInContext(sheetSrc, app.ctx, { filename: 'teacher-sb-sheet.js (in the student app)' });
  const judge = app.run('sbSheetJudge');
  const F = makeDb(), C = makeConsole(consoleSrc, F), { run, env } = C;
  C.box.__appJudge = (id, doc, bytes) => judge(id, JSON.parse(JSON.stringify(doc)), new Uint8Array(bytes));
  run('sbSheetJudge = (id, doc, bytes) => __appJudge(id, doc, bytes);');
  run('window.__saves = []; teacherMicSaveFile = (name, blob) => { window.__saves.push({ name, blob }); };');
  const LV = LEVELLED.get('c'), shaL = sha(LV);
  const putFile = (id, bytes, dur, file) => {
    F.S.set('songFiles/' + id, { file: file || id + '.mp3', bytes: bytes.length, sha256: sha(bytes), pieces: Math.ceil(bytes.length / 900000), pieceBytes: 900000, durationSec: dur, state: 'ready', uploadedAt: TS });
    for(let i = 0; i * 900000 < bytes.length; i++) F.S.set(`songFiles/${id}/pieces/${i}`, { i, data: new FakeBytes(bytes.subarray(i * 900000, (i + 1) * 900000)) });
  };
  const seed = (name, id) => {
    const d = withAudio(FIXTURES[name].doc, LV.length, shaL);
    d.audio.id = audioIdFor(id, shaL);
    putFile(d.audio.id, LV, d.audio.durationSec);
    F.S.set('builtSongs/' + id, Object.assign(JSON.parse(JSON.stringify(d)), { savedAt: TS }));
    return d;
  };
  const A = FIXTURES.fourFour.id, B = FIXTURES.beatMap.id;
  seed('fourFour', A); seed('beatMap', B);
  F.S.set('builtSongsMeta/list', { songs: { [A]: 3, [B]: 2 }, updatedAt: TS });
  const nW = () => F.st.writes.length, since = w0 => F.st.writes.slice(w0).map(w => w.op + ' ' + w.path);
  const sheetIdOf = b => 'sheet-' + A + '-' + sha(b).slice(0, 8);
  const waitRes = async () => { const t0 = Date.now(); for(;;){ await settle(); if(!run('sbSh.reading') && run('sbSh.res')) return; if(Date.now() - t0 > 20000) return; await sleep(5); } };
  const pick = async f => { box_set(C, '__f', f); run('sbSheetPick(__f)'); await waitRes(); return run('sbDetailHtml()'); };
  run('renderTeacherSongBuilder()'); await settle();
  run(`sbOpen(${JSON.stringify(A)})`); await settle();

  /* S1: the row on a published song's page */
  {
    const h = run('sbDetailHtml()');
    check('sheet: a published song\'s page has a Lyrics sheet row (no sheet yet, a drop zone that takes a pdf), and opening it writes nothing',
      /Lyrics sheet<\/div>/.test(h) && /No lyrics sheet\./.test(h) && /data-sb-sheet-drop/.test(h) && /data-sb-sheet-file/.test(h) && !/data-sb-act="sheet-add"/.test(h) && nW() === 0, nW() + ' writes');
  }
  /* S2-S4: refused before or while it is read: one line, nothing written, no Add */
  {
    const w0 = nW();
    const big = pdfFileOf('big.pdf', SHEET_GOOD, 5000001);
    const h1 = await pick(big);
    const h2 = await pick(pdfFileOf('notes.pdf', new TextEncoder().encode('Test notes, not a pdf at all')));
    const h3 = await pick(pdfFileOf('scan.pdf', SHEET_SCAN));
    check('sheet refused: over 5 MB (not even read), not a pdf, and a pdf with no text ("That pdf has no text (a scan or a photo). Save it as a pdf with text."): one line each, no Add, nothing written',
      big.reads === 0 && /a lyrics sheet can be at most 5 MB/.test(h1) && /That file is not a pdf\./.test(h2) && /That pdf has no text \(a scan or a photo\)\. Save it as a pdf with text\./.test(h3)
        && ![h1, h2, h3].some(h => /data-sb-act="sheet-add"/.test(h)) && nW() === w0,
      JSON.stringify({ reads: big.reads, writes: since(w0) }));
  }
  /* S5: a sheet that does not follow: the reason and the table, nothing written */
  {
    const w0 = nW();
    const h = await pick(pdfFileOf('test <b>sheet</b>.pdf', SHEET_BAD));
    run("sbSheetAct('sheet-add')"); await settle(60);   // the button is not drawn; pressed anyway, it must write nothing
    const rows = (h.match(/<tr( class="bad")?><td>/g) || []).length, bad = (h.match(/<tr class="bad">/g) || []).length;
    check('sheet refused: one that does not follow says where in one line ("Chord change 17 … the card plays G … is A"), shows the table (3 laps: ✓ ✓ ✗), offers no Add (and Add pressed anyway writes nothing), and draws the file name escaped',
      /The sheet does not follow the song\.<\/b> Chord change 17 [^<]*the card plays G, the sheet's chord \d+ is A\./.test(h) && rows === 3 && bad === 1 && !/data-sb-act="sheet-add"/.test(h)
        && /Nothing was added: send the pdf to Claude/.test(h) && /test &lt;b&gt;sheet&lt;\/b&gt;\.pdf/.test(h) && nW() === w0,
      JSON.stringify({ rows, bad, writes: since(w0), why: run('sbSh.res && sbSh.res.why') }));
  }
  /* S6: a sheet that follows: ✓ and Add, still nothing written */
  {
    const w0 = nW();
    const h = await pick(pdfFileOf('good.pdf', SHEET_GOOD));
    check('sheet: one that follows reads "The sheet follows the song: 23 chord names over 23 changes" (the 4 chord-box labels skipped, G7 = G) with one Add button, and nothing is written yet',
      /The sheet follows the song: 23 chord names over 23 changes\./.test(h) && (h.match(/data-sb-act="sheet-add"/g) || []).length === 1 && /Add to the song/.test(h) && nW() === w0,
      JSON.stringify({ line: (h.match(/The sheet follows[^<]*/) || [''])[0], writes: since(w0) }));
  }
  /* S7: Add to the song */
  const sid = sheetIdOf(SHEET_GOOD);
  {
    const w0 = nW(), ver0 = F.S.get('builtSongsMeta/list').songs[A];
    run("sbSheetAct('sheet-add')"); await settle(100);
    const seq = since(w0), doc = F.S.get('builtSongs/' + A), list = F.S.get('builtSongsMeta/list');
    const head = F.S.get('songFiles/' + sid), bare = Object.assign({}, doc); delete bare.savedAt;
    const expected = { id: sid, bytes: SHEET_GOOD.length, sha256: sha(SHEET_GOOD) };
    const idx = p => seq.indexOf(p);
    check('sheet Add: the pdf goes up through the Song files writer (head uploading, its piece, head ready: .pdf, durationSec 1), THEN one transaction writes the song with song.sheet and the list with a new edit number; nothing else; the song passes the validator and its audio is untouched',
      head && head.state === 'ready' && head.file === sid + '.pdf' && head.durationSec === 1 && head.sha256 === sha(SHEET_GOOD)
        && idx('set songFiles/' + sid) === 0 && idx(`set songFiles/${sid}/pieces/0`) > 0 && seq.lastIndexOf('set songFiles/' + sid) < idx('set builtSongs/' + A)
        && seq.slice(-2).join() === `set builtSongs/${A},set builtSongsMeta/list` && !seq.some(x => /songDrafts|config|progress/.test(x))
        && JSON.stringify(doc.song.sheet) === JSON.stringify(expected) && doc.savedAt === TS && run('builtSongCheck')(A, bare).length === 0
        && doc.audio.id === audioIdFor(A, shaL) && freshVer(list.songs[A], ver0) && list.songs[B] === 2,
      JSON.stringify({ seq: seq.filter(x => !/pieces\/([1-9]|[1-3][0-9])$/.test(x)), sheet: doc.song.sheet, ver: list.songs[A] }));
    const h = run('sbDetailHtml()'), card = run(`builtSongExpand(${JSON.stringify(A)}, sbPublished.get(${JSON.stringify(A)}).doc).activity.card`);
    check('sheet Add: the page says the song has a lyrics sheet, offers Check it again and Remove sheet, the note names the new edit, and the card a student\'s page makes has the Lyrics view of the private pdf, read loose, one column',
      /This song has a lyrics sheet<\/b>/.test(h) && /data-sb-act="sheet-check"/.test(h) && /data-sb-act="sheet-remove"/.test(h) && /^Added the lyrics sheet to "Test Song Four" \(edit/.test(run('sbNote'))
        && card.otherViews && card.otherViews.lyrics.sheet === 'private:' + sid && card.otherViews.lyrics.sheetRead === 'loose' && card.otherViews.lyrics.sheetColumns === 1,
      JSON.stringify({ note: run('sbNote'), views: card.otherViews }));
  }
  /* S8: Edit then Publish: the sheet rides along */
  {
    run("sbPubAct('edit-step', { dataset: { sbV: '6' } })"); await settle();
    const d = F.S.get('songDrafts/' + A);
    check('sheet: Edit rebuilds the draft WITH the sheet, and the unchanged song reads "Published (no changes)"',
      d && JSON.stringify(d.sheet) === JSON.stringify(F.S.get('builtSongs/' + A).song.sheet) && /Published \(no changes\)/.test(run('sbPublishBtnHtml(sbDraft())')),
      JSON.stringify({ sheet: d && d.sheet, btn: run('sbPublishBtnHtml(sbDraft())').slice(0, 120) }));
    /* The sheet's head gone: Publish refuses and writes nothing. */
    run(`sbDrafts.get(${JSON.stringify(A)}).title = 'Test Song Four Again'`);
    const keepHead = F.S.get('songFiles/' + sid); F.S.delete('songFiles/' + sid);
    let w0 = nW();
    run('sbPublish()'); await settle(100);
    const refused = nW() === w0 && /lyrics sheet is missing from the database/.test(run('sbNote'));
    F.S.set('songFiles/' + sid, keepHead);
    w0 = nW();
    run('sbPublish()'); await settle(100);
    const doc = F.S.get('builtSongs/' + A);
    check('sheet: Publish reads the sheet\'s head in its transaction (gone: refused, nothing written); a republished change keeps song.sheet',
      refused && doc.title === 'Test Song Four Again' && doc.song.sheet && doc.song.sheet.id === sid && since(w0).includes('set builtSongs/' + A),
      JSON.stringify({ refused, note: run('sbNote'), sheet: doc.song.sheet }));
    run("sbPubAct('edit-done')"); await settle();
  }
  /* S9: Replace with another pdf already in the store: not uploaded again; the draft and the song in one transaction; the old pdf deleted */
  const sid2 = sheetIdOf(SHEET_GOOD2);
  {
    await pick(pdfFileOf('good2.pdf', SHEET_GOOD2));
    const h = run('sbDetailHtml()');
    putFile(sid2, SHEET_GOOD2, 1, sid2 + '.pdf');
    const w0 = nW();
    run("sbSheetAct('sheet-add')"); await settle(100);
    const seq = since(w0), doc = F.S.get('builtSongs/' + A), d = F.S.get('songDrafts/' + A);
    check('sheet Replace: offered as "Replace the sheet with this one"; a pdf the store already holds is not uploaded again; the song, the list and the draft in one transaction with the new sheet; then the old pdf and its pieces deleted',
      /Replace the sheet with this one/.test(h) && !seq.some(x => x.startsWith('set songFiles/'))
        && seq.slice(0, 3).join() === `set builtSongs/${A},set builtSongsMeta/list,set songDrafts/${A}` && doc.song.sheet.id === sid2 && d.sheet.id === sid2 && d.savedAt === TS
        && !F.S.has('songFiles/' + sid) && !F.S.has(`songFiles/${sid}/pieces/0`) && F.S.has('songFiles/' + sid2),
      JSON.stringify({ seq: seq.filter(x => !/pieces\/([1-9]|[1-3][0-9])$/.test(x)), sheet: doc.song.sheet && doc.song.sheet.id }));
  }
  /* S9b: the pdf deleted (another tab) between its upload and the transaction: the head read inside it refuses */
  {
    await pick(pdfFileOf('good.pdf', SHEET_GOOD));
    const rt = F.db.runTransaction;
    F.db.runTransaction = async fn => { F.db.runTransaction = rt; F.S.delete('songFiles/' + sid); return rt(fn); };
    const before = JSON.stringify(F.S.get('builtSongs/' + A)), listBefore = JSON.stringify(F.S.get('builtSongsMeta/list'));
    run("sbSheetAct('sheet-add')"); await settle(100);
    F.db.runTransaction = rt;
    check('sheet Add: a pdf deleted in another tab after its upload is found gone by the read inside the transaction: the song and the list untouched, and the note says so',
      JSON.stringify(F.S.get('builtSongs/' + A)) === before && JSON.stringify(F.S.get('builtSongsMeta/list')) === listBefore && /^Not added: the sheet in the database is missing/.test(run('sbNote')),
      run('sbNote'));
    for(let j = 0; j < 40; j++) F.S.delete(`songFiles/${sid}/pieces/${j}`);
  }
  /* S10: the song changed in another tab between the read and the Add: refused, the song and the list untouched */
  {
    await pick(pdfFileOf('good.pdf', SHEET_GOOD));
    const other = JSON.parse(JSON.stringify(F.S.get('builtSongs/' + A))); other.title = 'Test Changed Elsewhere';
    F.S.set('builtSongs/' + A, other);
    const listBefore = JSON.stringify(F.S.get('builtSongsMeta/list'));
    run("sbSheetAct('sheet-add')"); await settle(100);
    const doc = F.S.get('builtSongs/' + A);
    check('sheet Add: a song another tab changed since this page read it is refused inside the transaction (the song, the list and the draft untouched) and the note says so',
      doc.title === 'Test Changed Elsewhere' && doc.song.sheet.id === sid2 && JSON.stringify(F.S.get('builtSongsMeta/list')) === listBefore && /^Not added: the song was changed in another tab/.test(run('sbNote')),
      run('sbNote'));
    other.title = 'Test Song Four Again'; F.S.set('builtSongs/' + A, other);
    run('sbReadAt = 0; teacherSbLoad()'); await settle();
    run(`sbOpen(null); sbOpen(${JSON.stringify(A)})`); await settle();
    if(F.S.has('songFiles/' + sid)){ for(let j = 0; j < 40; j++) F.S.delete(`songFiles/${sid}/pieces/${j}`); F.S.delete('songFiles/' + sid); }
  }
  /* S11: Check it again: the stored pdf read back (counted), the same check */
  {
    const used0 = (F.S.get('songFilesUsage/' + (() => { const t = new Date(); return t.getUTCFullYear() + '-' + String(t.getUTCMonth() + 1).padStart(2, '0'); })()) || { bytes: 0 }).bytes;
    run("sbSheetAct('sheet-check')"); await waitRes();
    const h = run('sbDetailHtml()');
    const used1 = (F.S.get('songFilesUsage/' + (() => { const t = new Date(); return t.getUTCFullYear() + '-' + String(t.getUTCMonth() + 1).padStart(2, '0'); })()) || { bytes: 0 }).bytes;
    check('sheet: Check it again reads the stored pdf (one counted download) and shows the same ✓, "This is the sheet the song has", with no Add',
      /The sheet follows the song: 23 chord names/.test(h) && /This is the sheet the song has\./.test(h) && !/data-sb-act="sheet-add"/.test(h) && used1 - used0 === Math.ceil(SHEET_GOOD2.length * 4 / 3),
      JSON.stringify({ used: used1 - used0, line: (h.match(/The sheet [^<]*/) || [''])[0] }));
  }
  /* S12: Export: the third file */
  {
    run("window.__saves = []; sbPubAct('export', { dataset: { sbV: 'pub' } })"); await settle(100);
    const sv = run('window.__saves.map(x => x.name)'), pdf = run('window.__saves.find(x => /\\.pdf$/.test(x.name))');
    const bytes = pdf ? new Uint8Array(await pdf.blob.arrayBuffer()) : null;
    check('sheet Export: three downloads, .json, .mp3 and the lyrics sheet\'s .pdf (its bytes the stored ones), paired by name',
      sv.length === 3 && /\.json$/.test(sv[0]) && /\.mp3$/.test(sv[1]) && /\.pdf$/.test(sv[2]) && sv[2].replace(/\.pdf$/, '') === sv[0].replace(/\.json$/, '') && bytes && sha(bytes) === sha(SHEET_GOOD2),
      JSON.stringify(sv));
  }
  /* S13: Remove sheet (Cancel writes nothing; OK: the song, the list and the draft without it, then the pdf deleted) */
  {
    env.confirmAnswer = false;
    let w0 = nW();
    run("sbSheetAct('sheet-remove')"); await settle(60);
    const cancelled = nW() === w0;
    env.confirmAnswer = true;
    w0 = nW();
    run("sbSheetAct('sheet-remove')"); await settle(100);
    const seq = since(w0), doc = F.S.get('builtSongs/' + A), d = F.S.get('songDrafts/' + A);
    check('sheet Remove: Cancel writes nothing; OK writes the song without song.sheet, the list with a new edit number and the draft with sheet null in one transaction, then deletes the pdf; the page offers the drop zone again',
      cancelled && seq.slice(0, 3).join() === `set builtSongs/${A},set builtSongsMeta/list,set songDrafts/${A}` && doc.song.sheet === undefined && d.sheet === null
        && !F.S.has('songFiles/' + sid2) && /No lyrics sheet\./.test(run('sbDetailHtml()')) && run('builtSongCheck')(A, Object.assign({}, doc, { savedAt: undefined })).length === 0,
      JSON.stringify({ cancelled, seq: seq.filter(x => !/pieces\/([1-9]|[1-3][0-9])$/.test(x)).slice(0, 6) }));
  }
  /* S14: a song with both chord sets is checked with each */
  {
    run(`sbOpen(${JSON.stringify(B)})`); await settle();
    const h = await pick(pdfFileOf('both.pdf', SHEET_BOTH));
    check('sheet: a song with full and power chords is checked against both cards ("… with full and with power chords")',
      /The sheet follows the song: 12 chord names over 12 changes, with full and with power chords\./.test(h) && run('sbSh.res.modes') === 2,
      (h.match(/The sheet [^<]*/) || [''])[0]);
    run("sbSheetAct('sheet-add')"); await settle(100);
  }
  /* S15: Delete… a song with a sheet deletes the pdf too; the other song untouched */
  {
    const bsid = 'sheet-' + B + '-' + sha(SHEET_BOTH).slice(0, 8);
    const had = F.S.has('songFiles/' + bsid);
    env.promptAnswer = 'Test Beat Map';
    run('sbDeleteSong()'); await settle(100);
    check('sheet: Delete… of a song with a lyrics sheet deletes its pdf (head and pieces) with the song; the other song and its files stay',
      had && !F.S.has('builtSongs/' + B) && !F.S.has('songFiles/' + bsid) && !F.S.has(`songFiles/${bsid}/pieces/0`) && F.S.has('builtSongs/' + A) && F.S.has('songFiles/' + audioIdFor(A, shaL)),
      JSON.stringify({ had, note: run('sbNote') }));
  }
  check('sheet: every write fits firestore.rules (songFiles heads and pieces, builtSongs, the list, drafts) and none goes to config/class or progress/',
    F.st.violations.length === 0 && !F.st.writes.some(w => /^(config|progress)\//.test(w.path)), F.st.writes.length + ' writes; ' + (F.st.violations.slice(0, 3).join('; ') || 'no violation'));
}

/* ── SWEEP 2026-11-25 (fixer "sb"; sweepCases): the Song builder findings SB-1 to SB-7, each case red on the code before
   its fix (38a3843). Every case has its own console and store, a levelled draft ("Test 0") made by the real flow; the
   consoles' timers run 20 times faster (the 1.2 s save is 60 ms), and the 600-ms retries of a waiting save are counted.
   SB-1: an edit waiting for its save, or not saved yet, while the 15-s re-read is due: a beat, "+ Bar", a typed title, a
   chords pdf's text at step 1, a new mp3; "+ Bar" then another song opened at once; "+ Bar" then the view left at once;
   and the guard (a song imported over the draft in another tab still wins over its unsaved edits, review R3-2).
   SB-2: "Level it again" on a published song: the same mp3 writes nothing to the file the song plays; other bytes go to
   their own id; a file of that id with other bytes that a listed song plays is refused. SB-3: leaving while the encoder
   runs frees the builder. SB-4: ◀ 1 beat ▶ and the drag of bar 1 (the real pointer handler) move every bar line.
   SB-5: a new chord in a bar written in thirds. SB-7: the Beat step's BPM bound is the validator's. ── */
const barsOf = d => d && d.chart && Array.isArray(d.chart.sections) ? d.chart.sections.reduce((n, s) => n + s.bars.length, 0) : -1;
async function sweepDraft(consoleSrc, F){
  const C = makeConsole(consoleSrc, F || makeDb()), { run } = C;
  C.retries = 0;
  C.box.setTimeout = (f, ms) => { if(ms === 600) C.retries++; return setTimeout(f, Math.ceil((Number(ms) || 0) / 20)); };
  run('renderTeacherSongBuilder()'); await settle();
  run('sbNewSong()'); await settle();
  box_set(C, '__f', fileOf('test-a.mp3', SRC_A, 24)); run('sbPickFile(__f)'); await settle();
  run("sbNew = { title: 'Test 0', artist: 'The Test Band' }"); run('sbSaveUpload()'); await settle(200);
  C.id = run('sbSel');
  if(!run('sbCopyCurrent(sbDraft())')){ box_set(C, '__levelNext', 'a'); run('sbRunLevel()'); await settle(200); }
  return C;
}
async function sweepCases(consoleSrc, check){
  const stores = [];
  const draft = async F => { const C = await sweepDraft(consoleSrc, F); stores.push(C.F); return C; };
  const waitSaves = async () => { await settle(); await sleep(150); await settle(); };
  const due = 'sbReadAt = Date.now() - 20000;';   // the 15-s re-read is due: the next paint reads the store again
  const chart8 = "sbReadAt = Date.now(); sbStepOn = 4; sbChartDoRead(sbDraft(), '[Verse]\\nG C D G\\n[Chorus]\\nC D G G')";
  const onScreen = C => C.run('sbDraft().chart.sections.reduce((n, s) => n + s.bars.length, 0)');
  const near = (x, y) => Math.abs(x - y) < 1e-3;
  /* SB-1: a beat */
  {
    const C = await draft(), { run, F } = C;
    run(due + ' sbMem.level.E = sbOnsetEnv(sbMem.level.mono, sbMem.level.fs); sbStepOn = 3; sbBeatFromBpm(96, null);');
    await waitSaves();
    const r0 = C.retries; await sleep(150); await settle();
    const st = F.S.get('songDrafts/' + C.id);
    check('SB-1 beat: a beat set while the 15-s re-read is due stays on screen and is stored once its save comes; the save is not tried again after that',
      st.beat && st.beat.bpm > 0 && run('!!sbDraft().beat') && C.retries === r0,
      JSON.stringify({ stored: st.beat && st.beat.bpm, onScreen: run('sbDraft().beat && sbDraft().beat.bpm'), retriesAfter: C.retries - r0 }));
  }
  /* SB-1: "+ Bar" */
  {
    const C = await draft(), { run, F } = C;
    run(chart8); await settle(200);
    const n0 = barsOf(F.S.get('songDrafts/' + C.id));
    run(due + " sbChFor(sbSel).sel = 0; sbChartAct('bar-add', { dataset: {} })"); await waitSaves();
    check('SB-1 chart: "+ Bar" made while the re-read is due stays on screen and is stored (8 bars → 9)',
      n0 === 8 && barsOf(F.S.get('songDrafts/' + C.id)) === 9 && onScreen(C) === 9, JSON.stringify({ before: n0, stored: barsOf(F.S.get('songDrafts/' + C.id)), onScreen: onScreen(C) }));
  }
  /* SB-1: a typed title */
  {
    const C = await draft(), { run, F } = C;
    run('sbStepOn = 1; ' + due + " sbInput({ target: { matches: s => s === '[data-sb-field]', dataset: { sbField: 'title' }, value: 'Test 0 Renamed' } }); teacherSbPaint();");
    await waitSaves();
    const kept = run('sbDraft().title') === 'Test 0 Renamed' && run('!!sbDraft().dirty');
    run('sbGoStep(2)'); await settle(200);
    check('SB-1 title: a title typed and not saved yet survives the re-read, and Next stores it',
      kept && F.S.get('songDrafts/' + C.id).title === 'Test 0 Renamed', JSON.stringify({ kept, onScreen: run('sbDraft().title'), stored: F.S.get('songDrafts/' + C.id).title }));
  }
  /* SB-1: a chords pdf's text at step 1 (sbPdfPutText, what a picked chords pdf does) */
  {
    const C = await draft(), { run, F } = C;
    run('sbStepOn = 1; ' + due + " sbPdfPutText('[Verse]\\nG C D G'); teacherSbPaint();"); await waitSaves();
    const kept = /G C D G/.test(run('sbDraft().chartText || ""'));
    run('sbGoStep(2)'); await settle(200);
    const ch = F.S.get('songDrafts/' + C.id).chart;
    check('SB-1 pdf text: a chords pdf\'s text put in the step-1 chart box survives the re-read, and Next stores it',
      kept && ch && /G C D G/.test(ch.text || ''), JSON.stringify({ kept, stored: ch && String(ch.text || '').slice(0, 30) }));
  }
  /* SB-1: a new mp3 for a saved draft */
  {
    const C = await draft(), { run, F } = C;
    run('sbStepOn = 1; ' + due); box_set(C, '__f', fileOf('test-b.mp3', SRC_B, 24.02)); run('sbPickFile(__f)'); await waitSaves();
    const kept = run('sbDraft().source.sha256') === sha(SRC_B) && run('!!sbDraft().dirty') && !run('sbCopyCurrent(sbDraft())');
    run('sbGoStep(2)'); await settle(300);
    check('SB-1 new mp3: a new mp3 picked for a saved draft survives the re-read (Preview and Publish wait for Volume, not the old recording), and Next stores it',
      kept && F.S.get('songDrafts/' + C.id).source.sha256 === sha(SRC_B), JSON.stringify({ kept, stored: String(F.S.get('songDrafts/' + C.id).source.sha256).slice(0, 8), mine: sha(SRC_B).slice(0, 8) }));
  }
  /* SB-1: "+ Bar", then another song opened at once */
  {
    const F = makeDb(), other = 'sb-sweepother0001';
    F.S.set('songDrafts/' + other, { v: 1, title: 'Test 1', artist: '', step: 2, source: { name: 'test-c.mp3', bytes: SRC_C.length, sha256: sha(SRC_C), durationSec: 15, sampleRate: 44100, channels: 1, kbps: 192 },
      audio: null, volume: null, pitch: null, beat: null, chart: null, level: null, pubVer: null, savedAt: TS });
    const C = await draft(F), { run } = C;
    run(chart8); await settle(200);
    run("sbChFor(sbSel).sel = 0; sbChartAct('bar-add', { dataset: {} }); sbOpen(" + JSON.stringify(other) + ');'); await settle();
    const opened = barsOf(F.S.get('songDrafts/' + C.id));
    await waitSaves();
    check('SB-1 switch: "+ Bar", then another song opened at once: the first song\'s edit is stored as the other song opens (8 bars → 9), and stays stored',
      run('sbSel') === other && opened === 9 && barsOf(F.S.get('songDrafts/' + C.id)) === 9, JSON.stringify({ sel: run('sbSel'), opened, stored: barsOf(F.S.get('songDrafts/' + C.id)) }));
  }
  /* SB-1: "+ Bar", then the view left at once */
  {
    const C = await draft(), { run, F } = C;
    run(chart8); await settle(200);
    run("sbChFor(sbSel).sel = 0; sbChartAct('bar-add', { dataset: {} }); teacherSbLeave(); teacherView = 'students';"); await waitSaves();
    const away = barsOf(F.S.get('songDrafts/' + C.id));
    run("teacherView = 'songbuilder'; " + due + ' renderTeacherSongBuilder();'); await waitSaves();
    check('SB-1 leave: "+ Bar", then the view left at once: nothing is written while away, and the edit is stored when the Song builder shows again (with a re-read due then)',
      away === 8 && barsOf(F.S.get('songDrafts/' + C.id)) === 9 && onScreen(C) === 9, JSON.stringify({ away, stored: barsOf(F.S.get('songDrafts/' + C.id)), onScreen: onScreen(C) }));
  }
  /* SB-1 guard: a song imported over the draft in another tab wins over the draft's unsaved edits (review R3-2) */
  {
    const F = makeDb(); F.st.stamp = true;
    const C = await draft(F), { run } = C;
    run(chart8); await settle(200);
    const LV = LEVELLED.get('a'), doc = withAudio(FIXTURES.fourFour.doc, LV.length, sha(LV), 24);
    doc.audio.id = audioIdFor(C.id, sha(LV)); doc.title = 'Test 0 Imported';
    F.S.set('builtSongsMeta/list', { songs: { [C.id]: 5 }, updatedAt: TS });
    F.S.set('builtSongs/' + C.id, Object.assign({}, doc, { savedAt: F.stamp() }));
    const w0 = F.st.writes.length;
    run(due + " sbChFor(sbSel).sel = 0; sbChartAct('bar-add', { dataset: {} })"); await waitSaves();
    const writes = F.st.writes.slice(w0).map(w => w.path);
    check('SB-1 guard: an edit not saved yet on a draft that a song was imported over (in another tab) is dropped by the re-read, the draft shows as stale, and nothing saves it',
      run('!!sbDraft().stale') && onScreen(C) === 8 && !writes.includes('songDrafts/' + C.id), JSON.stringify({ stale: run('!!sbDraft().stale'), onScreen: onScreen(C), writes }));
  }
  /* SB-2: "Level it again" on a published song */
  {
    const C = await draft(), { run, F } = C;
    const aud = run('sbDraft().audio.id'), a = JSON.parse(run('JSON.stringify(sbDraft().audio)'));
    F.S.set('builtSongsMeta/list', { songs: { [C.id]: 5 }, updatedAt: TS });
    F.S.set('builtSongs/' + C.id, { v: 1, title: 'Test 0', artist: 'The Test Band', audio: { id: aud, bytes: a.bytes, sha256: a.sha256, durationSec: a.durationSec, centsOff: 0 }, song: {}, savedAt: TS });
    const on = (w0, id) => F.st.writes.slice(w0).filter(w => w.path === 'songFiles/' + id || w.path.startsWith('songFiles/' + id + '/')).map(w => w.op + ' ' + w.path.slice(id.length + 10) + ' ' + ((w.data && w.data.state) || ''));
    run('sbReadAt = Date.now(); sbStepOn = 1;'); box_set(C, '__f', fileOf('test-a.mp3', SRC_A, 24)); run('sbPickFile(__f)'); await settle();
    let w0 = F.st.writes.length;
    box_set(C, '__levelNext', 'a'); run('sbStepOn = 2; sbRunLevel()'); await settle(300);
    const same = on(w0, aud);
    check('SB-2 same copy: "Level it again" with the same mp3 on a published song writes nothing to the file the song plays (stored whole already: not uploaded again); the draft still names it',
      same.length === 0 && run('sbDraft().audio.id') === aud && F.S.get('songFiles/' + aud).state === 'ready' && /not uploaded again/.test(run('sbNote')), JSON.stringify({ writes: same, note: run('sbNote') }));
    w0 = F.st.writes.length;
    const audB = C.id + '-' + sha(LEVELLED.get('b')).slice(0, 8);
    box_set(C, '__levelNext', 'b'); run('sbRunLevel()'); await settle(300);
    const other = on(w0, aud);
    check('SB-2 another copy: levelled to other bytes, the copy goes whole to its own id and the draft names it; the file the published song plays is never written or deleted',
      other.length === 0 && run('sbDraft().audio.id') === audB && F.S.get('songFiles/' + audB).state === 'ready' && F.S.get('songFiles/' + aud) && F.S.get('songFiles/' + aud).state === 'ready',
      JSON.stringify({ live: other, draft: run('sbDraft().audio.id'), newState: (F.S.get('songFiles/' + audB) || {}).state }));
    /* Review R1-2 (2026-11-25): the write order of "Level it again" with other bytes, which the "volume" case no longer
       sees (its second level is the same bytes, not uploaded again since SB-2): the new copy's head is 'ready', with
       every piece, BEFORE any draft write names it. */
    const lw = F.st.writes.slice(w0), named = lw.findIndex(w => w.path === 'songDrafts/' + C.id && w.data && w.data.audio && w.data.audio.id === audB);
    const ready = lw.map(w => w.path === 'songFiles/' + audB && w.data && w.data.state === 'ready').lastIndexOf(true);
    const pieces = lw.filter(w => w.path.startsWith('songFiles/' + audB + '/pieces/')).length;
    check('volume: "Level it again" with other bytes stores the new copy whole (head ready, every piece) BEFORE the draft names it (review R1-2)',
      ready >= 0 && named > ready && pieces >= 1 && lw.slice(ready + 1).every(w => !w.path.startsWith('songFiles/' + audB + '/pieces/')),
      lw.map(w => w.op + ' ' + w.path.replace(new RegExp(C.id, 'g'), '<id>') + (w.data && w.data.state ? ':' + w.data.state : '')).filter(s => !/\/pieces\/[1-9]/.test(s)).join(' → '));
    const audC = C.id + '-' + sha(LEVELLED.get('c')).slice(0, 8), taken = 'sb-sweepcollide01', f64 = 'f'.repeat(64);
    F.S.set('songFiles/' + audC, { file: audC + '.mp3', bytes: 5, sha256: f64, pieces: 1, pieceBytes: 900000, durationSec: 15, state: 'ready', uploadedAt: TS });
    F.S.set('builtSongsMeta/list', { songs: { [C.id]: 5, [taken]: 6 }, updatedAt: TS });
    F.S.set('builtSongs/' + taken, { v: 1, title: 'Test 9', artist: '', audio: { id: audC, bytes: 5, sha256: f64, durationSec: 15, centsOff: 0 }, song: {}, savedAt: TS });
    w0 = F.st.writes.length;
    box_set(C, '__levelNext', 'c'); run('sbRunLevel()'); await settle(300);
    const hit = on(w0, audC);
    check('SB-2 same id, other bytes: a copy whose id is already a file another published song plays, with other bytes, is refused with a line; that file is never written and the draft keeps its copy',
      hit.length === 0 && /Not levelled: the database already holds another file/.test(run('sbNote')) && run('sbDraft().audio.id') === audB && F.S.get('songFiles/' + audC).sha256 === f64,
      JSON.stringify({ writes: hit, note: run('sbNote') }));
  }
  /* SB-3: leaving while the encoder runs */
  {
    const C = await draft(), { run } = C;
    C.box.Worker = class { postMessage(){} terminate(){ this.terminated = true; } };
    C.box.URL = class { constructor(u, b){ this.href = String(b).replace(/[^/]*$/, '') + u; } static createObjectURL(){ return 'blob:sim'; } static revokeObjectURL(){} };
    run('sbLevel = async (src, fs, io) => { await io.encode([new Int16Array(8)], fs); return __level(); };');
    run('sbReadAt = Date.now(); sbStepOn = 2; sbRunLevel()');
    for(let i = 0; i < 400 && !run('!!sbWorker'); i++) await sleep(5);
    const during = run('sbBusy') === 'level' && run('!!sbWorker');
    run("teacherSbLeave(); teacherView = 'students';"); await turns(60);
    const busy = run('sbBusy'), note = run('sbNote');
    run("sbBusy = ''; teacherView = 'songbuilder';");
    check('SB-3: leaving the Song builder while the encoder runs ends the levelling as stopped: the builder is free again (not busy until a reload), and the line says so',
      during && busy === '' && /Stopped: you left the Song builder/.test(note), JSON.stringify({ during, busy, note }));
  }
  /* SB-4: ◀ 1 beat ▶ and the drag, at 120 BPM with the end pin at bar 10 (19 s) */
  const grid120 = "sbReadAt = Date.now(); sbMem.level.E = sbOnsetEnv(sbMem.level.mono, sbMem.level.fs); sbStepOn = 3; sbDraft().beat = { meter: '4/4', bpm: 120, anchor: 1, pins: [{ bar: 10, t: 19 }], driftOff: 0 };";
  const at = C => JSON.parse(C.run('JSON.stringify({ a: sbDraft().beat.anchor, b5: sbBarTime(sbDraft().beat, 5), b10: sbBarTime(sbDraft().beat, 10), bpm: sbDraft().beat.bpm })'));
  {
    const C = await draft(), { run } = C;
    run(grid120);
    const before = at(C);
    run("sbBeatAct('a+beat', { dataset: {} })"); const fwd = at(C);
    run("sbBeatAct('a-beat', { dataset: {} })"); const back = at(C);
    await waitSaves();
    check('SB-4 1 beat: "1 beat ▶" moves every bar line one beat (bar 5 9.0 → 9.5 s, bar 10 19.0 → 19.5 s, still 120 BPM; before the fix bar 5 went to 9.278 s at 123.4 BPM), and "◀ 1 beat" puts it back',
      near(before.b5, 9) && near(fwd.a, 1.5) && near(fwd.b5, 9.5) && near(fwd.b10, 19.5) && near(fwd.bpm, 120) && near(back.a, 1) && near(back.b5, 9) && near(back.b10, 19), JSON.stringify({ before, fwd, back }));
  }
  {
    const C = await draft(), { run } = C;
    run(grid120 + ' sbBtFor(sbSel).view = sbMainView(sbDraft().beat, sbDraft().audio.durationSec);');
    const W = 600, v = JSON.parse(run('JSON.stringify(sbBt.view)')), X = t => (t - v.t0) / (v.t1 - v.t0) * W;
    const drag = (from, to) => {
      const L = {};
      const cv = { dataset: { sbWave: 'main' }, getAttribute: () => '118', clientWidth: W, parentNode: { clientWidth: W }, style: {}, getContext: () => null,
        getBoundingClientRect: () => ({ left: 0, width: W }), setPointerCapture(){}, addEventListener: (t, f) => { L[t] = f; }, removeEventListener(){},
        closest: sel => /canvas\[data-sb-wave="main"\]/.test(sel) ? cv : null };
      for(const f of C.docL.pointerdown || []) f({ target: cv, clientX: X(from), pointerId: 1, preventDefault(){} });
      if(L.pointermove) L.pointermove({ clientX: X(to) });
      if(L.pointerup) L.pointerup({});
      return !!L.pointerup;
    };
    const g1 = drag(1, 1.5), big = at(C), g2 = drag(1.5, 1.53), small = at(C);
    await waitSaves();
    check('SB-4 drag: dragging bar 1 one beat later (1.0 → 1.5 s) moves every bar line one beat, as "1 beat ▶" does (bar 5 9.5 s, bar 10 19.5 s, 120 BPM); a drag under half a beat (30 ms) moves bar 1 alone (the pins stay)',
      g1 && g2 && near(big.b5, 9.5) && near(big.b10, 19.5) && near(big.bpm, 120) && near(small.a, 1.53) && near(small.b10, 19.5), JSON.stringify({ big, small }));
  }
  /* SB-5: a new chord in a bar written in thirds */
  {
    const C = await draft(), { run } = C;
    run("sbReadAt = Date.now(); sbStepOn = 4; (() => { const d = sbDraft(); d.chart = { text: '', meter: '6/8', fmt: 'the imported song', sections: [{ name: 'verse', label: 'Verse', n: null, bars: ['A:1/3 E:5/3', 'A'], lyrics: null }], left: [], kept: [], edited: true }; })();"
      + " sbChFor(sbSel).sel = 0; sbChFor(sbSel).part = 0; sbChartAct('bar-chord', { dataset: { sbChord: 'D' } });");
    const bar = run('sbDraft().chart.sections[0].bars[0]'), parts = run("JSON.stringify(bsBarParts(sbDraft().chart.sections[0].bars[0], BS_METERS['6/8'], { D: 1, E: 1, A: 1 }))");
    await waitSaves();
    check('SB-5: a new chord in a bar written in thirds (an imported 6/8 song\'s "A:1/3 E:5/3") keeps its thirds ("D:1/3 E:5/3"), a bar the validator takes', bar === 'D:1/3 E:5/3' && Array.isArray(JSON.parse(parts)), JSON.stringify({ bar, parts }));
    /* Review R1-6: the "Which part" buttons of that bar say its thirds as the chart writes them, not 0.3333333333333333. */
    const btns = [...run('sbBarPanelHtml(sbDraft(), 0)').matchAll(/data-sb-act="bar-part"[^>]*>([^<]*)</g)].map(m => m[1]);
    check('R1-6: the "Which part" buttons of a bar in thirds read "D · 1/3" and "E · 5/3" (the chart\'s own way of writing thirds)',
      btns.length === 2 && btns[0] === 'D · 1/3' && btns[1] === 'E · 5/3', JSON.stringify(btns));
  }
  /* SB-7: the Beat step's bound is the validator's */
  {
    const C = await draft(), { run } = C;
    run("sbReadAt = Date.now(); sbMem.level.E = sbOnsetEnv(sbMem.level.mono, sbMem.level.fs); sbStepOn = 3; sbBeatFromBpm(270, null);");
    const note = run('sbNote'), beat = run('!!sbDraft().beat');
    check('SB-7: the Beat step takes the BPMs a built song may have (30 to 260, builtSongCheck): 270 sets no grid, and the line says to count a faster song in two',
      !beat && /30 to 260/.test(note) && /count it in two/.test(note), JSON.stringify({ beat, note }));
  }
  const bad = stores.flatMap(F => F.st.violations), ws = stores.reduce((n, F) => n + F.st.writes.length, 0);
  check('sweep: every write of these cases fits firestore.rules and the builder\'s own paths, none to config/class or progress/',
    !bad.length && ws > 50 && !stores.some(F => F.st.writes.some(w => /^(config|progress)\//.test(w.path))), ws + ' writes; ' + (bad.slice(0, 3).join('; ') || 'no violation'));
}

/* ── REVIEW ROUND 1 of the sweep (2026-11-25; r1Cases). Two console tabs on ONE store (review R1-1, R1-3, R1-4; the
   reviewer's scenarios X2, X3, X4, X6, X7): each two-tab case is red on 7728eea. A copy of a draft in memory carries the
   draft as it was last read or written (base): a write goes through only while the store still holds it, and a re-read
   under an edit not saved yet keeps this tab's parts only where the other tab did not save that part. Then the planted
   faults no case caught (R1-5: P4 the save's stale check, P7 pins moved by bar 1's beat, P8 trunc for round, P13 the
   drag's and P14 the 30-ms measure's draft "as it is now"), and the Beat step's BPM bound on the grid itself (SB-7's
   note: a grid the validator refuses is never set). Timers run 20 times faster, as in sweepCases, unless a case says. ── */
async function r1Cases(consoleSrc, check){
  const stores = [];
  const fast = C => { C.retries = 0; C.box.setTimeout = (f, ms) => { if(ms === 600) C.retries++; return setTimeout(f, Math.ceil((Number(ms) || 0) / 20)); }; return C; };
  const tab = async F => { const C = fast(makeConsole(consoleSrc, F)); C.run('renderTeacherSongBuilder()'); await settle(); return C; };
  const draft = async F => { const C = await sweepDraft(consoleSrc, F); stores.push(C.F); return C; };
  const waitSaves = async () => { await settle(); await sleep(150); await settle(); };
  const due = 'sbReadAt = Date.now() - 20000;';   // the 15-s re-read is due: the next paint reads the store again
  const reread = async C => { C.run(due + ' teacherSbPaint();'); await settle(); await sleep(30); await settle(); };
  const typeTitle = v => `sbInput({ target: { matches: s => s === '[data-sb-field]', dataset: { sbField: 'title' }, value: ${JSON.stringify(v)} } });`;
  const chart4 = "sbReadAt = Date.now(); sbStepOn = 4; sbChartDoRead(sbDraft(), '[Verse]\\nG C D G\\n[Chorus]\\nC D G G')";
  const chord = (bar, name) => `sbChFor(sbSel).sel = ${bar}; sbChFor(sbSel).part = 0; sbChartAct('bar-chord', { dataset: { sbChord: ${JSON.stringify(name)} } });`;
  const verse = (F, id) => F.S.get('songDrafts/' + id).chart.sections[0].bars.join(' ');
  const heads = F => [...F.S.keys()].filter(k => /^songFiles\/[^/]+$/.test(k)).map(k => k.slice(10));
  const near = (x, y) => Math.abs(x - y) < 1e-3;
  /* A song tab A publishes first (its levelled copy X, of mp3 C), then tab B levels it again from the same mp3 to other
     bytes (copy Y). Returns the store, the two tabs, X and Y. editLevel: A first opens Edit and saves a change to the level. */
  const relevelled = async (aTyped, editLevel) => {
    const F = makeDb(); F.st.stamp = true; stores.push(F);
    const id = 'sb-r1pubdraft01', LVC = LEVELLED.get('c'), X = id + '-' + sha(LVC).slice(0, 8);
    F.S.set('songFiles/' + X, { file: X + '.mp3', bytes: LVC.length, sha256: sha(LVC), pieces: Math.ceil(LVC.length / 900000), pieceBytes: 900000, durationSec: 15, state: 'ready', uploadedAt: TS });
    for(let i = 0; i * 900000 < LVC.length; i++) F.S.set(`songFiles/${X}/pieces/${i}`, { i, data: new FakeBytes(LVC.subarray(i * 900000, (i + 1) * 900000)) });
    const chart = { text: '', meter: '4/4', fmt: 'chords', sections: [{ name: 'intro', label: 'Intro', n: null, bars: ['G'], lyrics: null },
      { name: 'verse', label: 'Verse 1', n: 1, bars: ['G', 'C'], lyrics: null }, { name: 'chorus', label: 'Chorus', n: null, bars: ['D', 'G:2 C:2'], lyrics: null }], left: [], kept: [], edited: true };
    F.S.set('songDrafts/' + id, { v: 1, title: 'Test 0', artist: 'The Test Band', step: 5,
      source: { name: 'test-c.mp3', bytes: SRC_C.length, sha256: sha(SRC_C), durationSec: 15, sampleRate: 44100, channels: 1, kbps: 192 },
      audio: { id: X, bytes: LVC.length, sha256: sha(LVC), durationSec: 15, centsOff: 2, gainDb: 1.5, sourceSha256: sha(SRC_C) },
      volume: { before: -14, after: -12.5, samplePeak: -1.2, truePeak: -1.1, ceilingDb: -1, encodes: 1 }, pitch: { cents: 2, peaks: 10 },
      beat: { meter: '4/4', bpm: 96, anchor: 0.5, pins: [], trackBpm: 96, trackSub: 2, driftOff: 0, pinsNeeded: 2 }, chart, level: { versions: 'full', start: null, range: null }, pubVer: null, savedAt: TS });
    const A = await tab(F);
    A.run(`sbOpen(${JSON.stringify(id)})`); await settle();
    A.env.confirmAnswer = true; A.run('sbPublish()'); await settle(200);
    const live0 = (F.S.get('builtSongs/' + id) || {}).audio;
    if(editLevel){
      A.run("sbPubAct('edit-step', { dataset: { sbV: '5' } })"); await settle(200);
      A.run("sbChartSet(sbDraft(), { level: { versions: 'both', start: 'full', range: null } }, null, true)"); await settle(200);
    }
    if(aTyped) A.run('sbStepOn = 1; ' + typeTitle(aTyped));
    const B = await tab(F);
    B.run(`sbOpen(${JSON.stringify(id)})`); await settle();
    B.run('sbStepOn = 1;'); box_set(B, '__f', fileOf('test-c.mp3', SRC_C, 15)); B.run('sbPickFile(__f)'); await settle();
    box_set(B, '__levelNext', 'b'); B.run('sbStepOn = 2; sbRunLevel()'); await settle(300);
    return { F, id, A, B, X, Y: B.run('sbDraft().audio.id'), live0: live0 && live0.id };
  };
  const XY = (r, a) => a === r.Y ? 'Y' : a === r.X ? 'X' : String(a);
  /* X3: tab A typed a title (not saved); tab B levelled the song again; A re-reads twice, presses Next, then Publish. */
  {
    const r = await relevelled('Test 0 Renamed'), { F, id, A } = r;
    await reread(A); await reread(A);
    const seen = { audio: XY(r, A.run('sbDraft().audio.id')), title: A.run('sbDraft().title'), dirty: A.run('!!sbDraft().dirty'), note: A.run('sbNote') };
    A.run('sbGoStep(2)'); await settle(200);
    const st = F.S.get('songDrafts/' + id);
    A.env.confirmAnswer = true; A.run('sbStepOn = 7; sbPublish()'); await settle(200);
    const live = F.S.get('builtSongs/' + id), dr = F.S.get('songDrafts/' + id), orphans = heads(F).filter(h => h !== live.audio.id && !(dr.audio && dr.audio.id === h));
    check('R1-1 X3 (two tabs): tab A has a title typed, not saved; tab B levels the published song again (copy Y): A\'s re-read takes Y, keeps the title and says so; Next stores both; the old copy X never goes live again under the new title, and no copy is left unnamed',
      r.Y !== r.X && r.live0 === r.X && seen.audio === 'Y' && seen.title === 'Test 0 Renamed' && seen.dirty && /changed in another tab/.test(seen.note) && /title that was not saved is kept/.test(seen.note)
      && XY(r, st.audio.id) === 'Y' && st.title === 'Test 0 Renamed' && !(live.audio.id === r.X && live.title === 'Test 0 Renamed') && !orphans.length,
      JSON.stringify({ seen: Object.assign(seen, { note: seen.note.slice(0, 160) }), stored: [XY(r, st.audio.id), st.title], live: [XY(r, live.audio.id), live.title], orphans: orphans.map(h => XY(r, h)) }));
  }
  /* X3, Next at once: no re-read between B's level and A's Next. */
  {
    const r = await relevelled('Test 0 Renamed'), { F, id, A } = r, w0 = F.st.writes.length;
    A.run('sbReadAt = Date.now(); sbGoStep(2)'); await settle(200);
    const first = { writes: F.st.writes.slice(w0).filter(w => w.path === 'songDrafts/' + id).length, stored: XY(r, F.S.get('songDrafts/' + id).audio.id), note: A.run('sbNote'), mem: XY(r, A.run('sbDraft().audio.id')), title: A.run('sbDraft().title') };
    A.run('sbGoStep(2)'); await settle(200);
    const st = F.S.get('songDrafts/' + id);
    check('R1-1 X3, Next at once (two tabs): tab A presses Next on its typed title right after tab B levelled the song again: nothing is written over B\'s copy Y and the line says the song changed in another tab; A\'s copy then names Y with the title kept, and the next Next stores both',
      first.writes === 0 && first.stored === 'Y' && /changed in another tab/.test(first.note) && first.mem === 'Y' && first.title === 'Test 0 Renamed' && XY(r, st.audio.id) === 'Y' && st.title === 'Test 0 Renamed',
      JSON.stringify(Object.assign(first, { note: first.note.slice(0, 120), stored2: [XY(r, st.audio.id), st.title] })));
  }
  /* X3, Publish from an older copy: tab A edits the level (saved), tab B levels the song again, A presses Publish. */
  {
    const r = await relevelled(null, true), { F, id, A } = r;
    const w0 = F.st.writes.length, live0 = JSON.stringify(F.S.get('builtSongs/' + id)), list0 = JSON.stringify(F.S.get('builtSongsMeta/list'));
    const could = A.run('sbPublishWhy(sbDraft(), sbSel).length === 0 && sbPubChanged(sbDraft(), sbPublished.get(sbSel))');
    A.env.confirmAnswer = true; A.run('sbReadAt = Date.now(); sbStepOn = 7; sbPublish()'); await settle(200);
    const ws = F.st.writes.slice(w0).map(w => w.op + ' ' + w.path.replace(id, '<id>'));
    check('R1-1 X3, Publish from an older copy (two tabs): tab A\'s Publish of its level change, after tab B levelled the song again, writes nothing (students keep the song, the draft keeps Y) and says the song changed in another tab; A then shows Y',
      could && !ws.length && JSON.stringify(F.S.get('builtSongs/' + id)) === live0 && JSON.stringify(F.S.get('builtSongsMeta/list')) === list0 && XY(r, F.S.get('songDrafts/' + id).audio.id) === 'Y'
      && /^Not published: this song was changed in another tab/.test(A.run('sbNote')) && XY(r, A.run('sbDraft().audio.id')) === 'Y',
      JSON.stringify({ could, writes: ws, draft: XY(r, F.S.get('songDrafts/' + id).audio.id), note: A.run('sbNote').slice(0, 90), mem: XY(r, A.run('sbDraft().audio.id')) }));
  }
  /* X3, the Lyrics sheet's Add from an older copy (the third writer of a draft, teacher-sb-sheet.js): its transaction
     writes the draft too, so it must not write tab A's copy (X) back over tab B's (Y). The pdf's check is stood in for. */
  {
    const r = await relevelled(null, false), { F, id, A } = r;
    const pdf = new Uint8Array(3000).fill(37); pdf.set(new TextEncoder().encode('%PDF-1.4 Test'), 0);
    A.box.__pdf = pdf;
    A.run(`sbSh.id = sbSel; sbSh.reading = false; sbSh.file = { name: 'test.pdf', bytes: __pdf, sha256: ${JSON.stringify(sha(pdf))}, stored: false }; sbSh.res = { ok: true, key: sbSheetKey(sbPublished.get(sbSel).doc, ${JSON.stringify(sha(pdf))}) };`);
    const live0 = JSON.stringify(F.S.get('builtSongs/' + id)), w0 = F.st.writes.length;
    A.env.confirmAnswer = true; A.run("sbReadAt = Date.now(); sbSheetAct('sheet-add')"); await settle(300);
    const ws = F.st.writes.slice(w0).filter(w => !w.path.startsWith('songFiles/sheet-')).map(w => w.op + ' ' + w.path.replace(id, '<id>'));
    check('R1-1 X3, the Lyrics sheet from an older copy (two tabs): tab A\'s Add of a lyrics sheet, after tab B levelled the song again, writes neither the song nor the draft (the draft keeps Y) and says the song changed in another tab',
      !ws.length && JSON.stringify(F.S.get('builtSongs/' + id)) === live0 && XY(r, F.S.get('songDrafts/' + id).audio.id) === 'Y' && /^Not added: this song was changed in another tab/.test(A.run('sbNote')),
      JSON.stringify({ writes: ws, draft: XY(r, F.S.get('songDrafts/' + id).audio.id), note: A.run('sbNote').slice(0, 90) }));
  }
  /* X4: a typed title left unsaved while tab A opens another song; tab B sets bar 1 = Em; A re-reads 3 times. */
  {
    const F = makeDb(); F.st.stamp = true;
    const other = 'sb-sweepother0001';
    F.S.set('songDrafts/' + other, { v: 1, title: 'Test 1', artist: '', step: 2, source: { name: 'test-c.mp3', bytes: SRC_C.length, sha256: sha(SRC_C), durationSec: 15, sampleRate: 44100, channels: 1, kbps: 192 },
      audio: null, volume: null, pitch: null, beat: null, chart: null, level: null, pubVer: null, savedAt: TS });
    const A = await draft(F), key = JSON.stringify(A.id);
    A.run(chart4); await settle(200); await waitSaves();
    A.run('sbStepOn = 1; ' + typeTitle('Test 0 typed'));
    A.run(`sbOpen(${JSON.stringify(other)})`); await settle();
    const B = await tab(F);
    B.run(`sbOpen(${key}); sbStepOn = 4;`); await settle();
    B.run(chord(0, 'Em')); await waitSaves();
    const seen = [];
    for(let i = 0; i < 3; i++){ await reread(A); seen.push(A.run(`sbDrafts.get(${key}).chart.sections[0].bars[0]`)); }
    const note = A.run('sbNote'), title = A.run(`sbDrafts.get(${key}).title`);
    A.run(`sbOpen(${key})`); await settle();
    A.run('sbGoStep(2)'); await settle(200);
    const st = F.S.get('songDrafts/' + A.id);
    check('R1-1 X4 (two tabs): tab A left a typed title on a song and opened another; tab B set bar 1 = Em there: each of A\'s 3 re-reads shows Em with the title kept, the line names the song, and A\'s Next stores both',
      seen.join() === 'Em,Em,Em' && title === 'Test 0 typed' && /"Test 0 typed" was changed in another tab/.test(note) && st.chart.sections[0].bars[0] === 'Em' && st.title === 'Test 0 typed',
      JSON.stringify({ seen, title, note: note.slice(0, 120), stored: [st.chart.sections[0].bars[0], st.title] }));
  }
  /* X2: both tabs change the chart. B saves bar 1 = Em; A then sets bar 4 = Am: with A's 15-s re-read due, and without. */
  for(const isDue of [true, false]){
    const F = makeDb(); F.st.stamp = true;
    const A = await draft(F);
    A.run(chart4); await settle(200); await waitSaves();
    const B = await tab(F);
    B.run(`sbOpen(${JSON.stringify(A.id)}); sbStepOn = 4;`); await settle();
    B.run(chord(0, 'Em')); await waitSaves();
    A.run((isDue ? due : 'sbReadAt = Date.now();') + ' ' + chord(3, 'Am')); await waitSaves(); await sleep(100); await settle();
    const st = verse(F, A.id), mine = A.run("sbDraft().chart.sections[0].bars.join(' ')"), note = A.run('sbNote');
    check(`R1-1 X2 (two tabs, ${isDue ? 'the re-read due' : 'no re-read due: the save is refused'}): tab B saved bar 1 = Em, then tab A set bar 4 = Am: B's saved chart stays stored, A shows it, and A's line says A's chart change was dropped (never a silent loss)`,
      st === 'Em C D G' && mine === st && /changed in another tab/.test(note) && /chart that was not saved is dropped/.test(note), JSON.stringify({ stored: st, onScreen: mine, note: note.slice(0, 140) }));
  }
  /* X2, other parts: B saves a new title; A sets bar 4 = Am. Both are kept. */
  for(const isDue of [true, false]){
    const F = makeDb(); F.st.stamp = true;
    const A = await draft(F);
    A.run(chart4); await settle(200); await waitSaves();
    const B = await tab(F);
    B.run(`sbOpen(${JSON.stringify(A.id)});`); await settle();
    B.run('sbStepOn = 1; ' + typeTitle('Test 0 from B') + ' sbGoStep(2);'); await settle(200); await waitSaves();
    A.run((isDue ? due : 'sbReadAt = Date.now();') + ' ' + chord(3, 'Am')); await waitSaves(); await sleep(150); await settle();
    const st = F.S.get('songDrafts/' + A.id), note = A.run('sbNote');
    check(`R1-1 X2, other parts (two tabs, ${isDue ? 'the re-read due' : 'no re-read due'}): tab B saved a new title, then tab A set bar 4 = Am: the store keeps both, A shows both, and A's line says its chart change is kept`,
      st.title === 'Test 0 from B' && verse(F, A.id) === 'G C D Am' && A.run('sbDraft().title') === 'Test 0 from B' && /chart that was not saved is kept/.test(note) && !A.run('!!sbDraft().unsaved'),
      JSON.stringify({ stored: [st.title, verse(F, A.id)], mine: A.run('sbDraft().title'), note: note.slice(0, 140) }));
  }
  /* X7 (R1-3): tab A makes an edit and leaves the view at once; tab B deletes the draft; A comes back within 15 s. */
  {
    const F = makeDb(); F.st.stamp = true;
    const A = await draft(F), aud = A.run('sbDraft().audio.id');
    A.run(chart4); await settle(200); await waitSaves();
    A.run("sbChFor(sbSel).sel = 0; sbChartAct('bar-add', { dataset: {} }); teacherSbLeave(); teacherView = 'students';");
    const B = await tab(F);
    B.run(`sbOpen(${JSON.stringify(A.id)})`); await settle();
    B.env.confirmAnswer = true; B.run('sbDeleteDraft()'); await settle(200); await sleep(100); await settle();
    const gone = !F.S.has('songDrafts/' + A.id) && !F.S.has('songFiles/' + aud), w0 = F.st.writes.length;
    A.run("teacherView = 'songbuilder'; renderTeacherSongBuilder();"); await waitSaves(); await sleep(100); await settle();
    const ws = F.st.writes.slice(w0).map(w => w.op + ' ' + w.path.replace(A.id, '<id>'));
    check('R1-3 X7 (two tabs): tab A left the view with an edit waiting; tab B deleted the draft; A comes back within 15 s of its last read: the draft is not written back (nothing names a deleted copy), it leaves A\'s list, and A\'s line says it was deleted in another tab',
      gone && !ws.length && !F.S.has('songDrafts/' + A.id) && !A.run(`sbDrafts.has(${JSON.stringify(A.id)})`) && /deleted in another tab/.test(A.run('sbNote')),
      JSON.stringify({ gone, writes: ws, note: A.run('sbNote').slice(0, 100) }));
  }
  /* One tab, as SB-1's leave case but coming back with no re-read due: the read that leaving asks for saves the edit. */
  {
    const F = makeDb(); F.st.stamp = true;
    const A = await draft(F);
    A.run(chart4); await settle(200); await waitSaves();
    A.run("sbChFor(sbSel).sel = 0; sbChartAct('bar-add', { dataset: {} }); teacherSbLeave(); teacherView = 'students';"); await waitSaves();
    const away = barsOf(F.S.get('songDrafts/' + A.id));
    A.run("teacherView = 'songbuilder'; renderTeacherSongBuilder();"); await waitSaves(); await sleep(100); await settle();
    check('R1-3, one tab: "+ Bar", the view left at once and shown again within 15 s of the last read: nothing is written while away, the edit is stored on the way back (8 bars → 9), and no line says another tab',
      away === 8 && barsOf(F.S.get('songDrafts/' + A.id)) === 9 && A.run('sbDraft().chart.sections.reduce((n, s) => n + s.bars.length, 0)') === 9 && !/another tab/.test(A.run('sbNote')),
      JSON.stringify({ away, stored: barsOf(F.S.get('songDrafts/' + A.id)), note: A.run('sbNote').slice(0, 80) }));
  }
  /* X6 (R1-4): this tab's own Import of the song as stored, over an edit not saved yet (the view left at once). */
  {
    const F = makeDb(); F.st.stamp = true;
    const A = await draft(F);
    A.run(chart4); await settle(200); await waitSaves();
    A.run("sbMem.level.E = sbOnsetEnv(sbMem.level.mono, sbMem.level.fs); sbStepOn = 3; sbBeatFromBpm(96, null);"); await waitSaves();
    const doc = A.run('sbDocOf')(JSON.parse(JSON.stringify(F.S.get('songDrafts/' + A.id))));
    A.run(chord(0, 'Em') + " teacherSbLeave(); teacherView = 'manage';");
    F.S.set('builtSongs/' + A.id, Object.assign(JSON.parse(JSON.stringify(doc)), { savedAt: F.stamp() }));
    F.S.set('builtSongsMeta/list', { songs: { [A.id]: 7 }, updatedAt: TS });
    A.box.__doc = doc; A.run(`teacherSbImported(${JSON.stringify(A.id)}, __doc, 7)`);
    A.run("teacherView = 'songbuilder'; renderTeacherSongBuilder();"); await waitSaves(); await sleep(100); await settle();
    const s1 = A.run('!!sbDraft().stale');
    await reread(A);
    check('R1-4 X6: this tab imports the song as its draft stores it, over an edit not saved yet: after the next read the draft is not stale (no "imported again", Publish and Edit work from it) and holds the stored song, not the dropped edit',
      !s1 && !A.run('!!sbDraft().stale') && !A.run('!!sbDraft().unsaved') && A.run('sbDraft().chart.sections[0].bars[0]') === 'G' && verse(F, A.id) === 'G C D G',
      JSON.stringify({ staleAfterReturn: s1, staleAfterReread: A.run('!!sbDraft().stale'), unsaved: A.run('!!sbDraft().unsaved'), bar1: A.run('sbDraft().chart.sections[0].bars[0]') }));
  }
  /* R1-5 P4: an edit waiting for its save when this tab imports a song over the draft (Manage → Built songs). */
  {
    const F = makeDb(); F.st.stamp = true;
    const A = await draft(F);
    A.run(chart4); await settle(200); await waitSaves();
    const LV = LEVELLED.get('a'), doc = withAudio(FIXTURES.fourFour.doc, LV.length, sha(LV), 24);
    doc.audio.id = audioIdFor(A.id, sha(LV)); doc.title = 'Test 0 Imported';
    F.S.set('builtSongsMeta/list', { songs: { [A.id]: 5 }, updatedAt: TS });
    F.S.set('builtSongs/' + A.id, Object.assign({}, doc, { savedAt: F.stamp() }));
    const w0 = F.st.writes.length;
    A.box.__doc = doc; A.run(`sbChFor(sbSel).sel = 0; sbChartAct('bar-add', { dataset: {} }); teacherSbImported(${JSON.stringify(A.id)}, __doc, 5);`);
    await sleep(150); await settle();
    const ws = F.st.writes.slice(w0).filter(w => w.path === 'songDrafts/' + A.id).length;
    check('R1-5 P4: an edit waiting for its save when this tab imports a song over the draft is never saved (the import wins: the save checks that the draft is stale)',
      ws === 0 && A.run('!!sbDraft().stale') && A.run('!!sbDraft().unsaved'), JSON.stringify({ draftWrites: ws, stale: A.run('!!sbDraft().stale') }));
  }
  /* The drag of bar 1 on the main waveform (the real pointer handler), as in sweepCases. */
  const grid120 = "sbReadAt = Date.now(); sbMem.level.E = sbOnsetEnv(sbMem.level.mono, sbMem.level.fs); sbStepOn = 3; sbDraft().beat = { meter: '4/4', bpm: 120, anchor: 1, pins: [{ bar: 10, t: 19 }], driftOff: 0 };";
  const dragOf = C => {
    const W = 600, v = JSON.parse(C.run('JSON.stringify(sbBt.view)')), X = t => (t - v.t0) / (v.t1 - v.t0) * W, L = {};
    const cv = { dataset: { sbWave: 'main' }, getAttribute: () => '118', clientWidth: W, parentNode: { clientWidth: W }, style: {}, getContext: () => null,
      getBoundingClientRect: () => ({ left: 0, width: W }), setPointerCapture(){}, addEventListener: (t, f) => { L[t] = f; }, removeEventListener(){},
      closest: sel => /canvas\[data-sb-wave="main"\]/.test(sel) ? cv : null };
    return { down: from => { for(const f of C.docL.pointerdown || []) f({ target: cv, clientX: X(from), pointerId: 1, preventDefault(){} }); return !!L.pointerup; },
      up: to => { if(L.pointermove) L.pointermove({ clientX: X(to) }); if(L.pointerup) L.pointerup({}); } };
  };
  /* R1-5 P7: ◀ 1 beat ▶ on a grid whose tempo drifts: each pin moves one beat where IT sits. */
  {
    const C = await draft(), { run } = C;
    run("sbReadAt = Date.now(); sbMem.level.E = sbOnsetEnv(sbMem.level.mono, sbMem.level.fs); sbStepOn = 3; sbDraft().beat = { meter: '4/4', bpm: 120, anchor: 1, pins: [{ bar: 5, t: 9 }, { bar: 10, t: 19.5 }], driftOff: 0 };");
    const b1 = run('sbBeatAt(sbDraft().beat, 1)'), b5 = run('sbBeatAt(sbDraft().beat, 5)'), b10 = run('sbBeatAt(sbDraft().beat, 10)');
    run("sbBeatAct('a+beat', { dataset: {} })");
    const g = JSON.parse(run('JSON.stringify({ a: sbDraft().beat.anchor, pins: sbDraft().beat.pins })'));
    await waitSaves();
    check('R1-5 P7: "1 beat ▶" on a grid with 3 pins and a tempo change moves bar 1 by its beat (0.5 s) and each pin by the beat where it sits (bar 5 by 0.525 s, bar 10 by 0.542 s)',
      near(b1, 0.5) && near(b5, 0.525) && Math.abs(b10 - 0.5) > 0.02 && near(g.a, 1.5) && g.pins.length === 2 && near(g.pins[0].t, 9 + b5) && near(g.pins[1].t, 19.5 + b10),
      JSON.stringify({ b1, b5, b10, g }));
  }
  /* R1-5 P8: a drag of 0.7 beat rounds to one whole beat (every bar line moves), the rest moves bar 1 alone. */
  {
    const C = await draft(), { run } = C;
    run(grid120 + ' sbBtFor(sbSel).view = sbMainView(sbDraft().beat, sbDraft().audio.durationSec);');
    const dg = dragOf(C), ok = dg.down(1); dg.up(1.35);
    const g = JSON.parse(run('JSON.stringify({ a: sbDraft().beat.anchor, pins: sbDraft().beat.pins })'));
    await waitSaves();
    check('R1-5 P8: dragging bar 1 0.7 of a beat (1.0 → 1.35 s at 120 BPM) counts as one whole beat: the pin at bar 10 moves 19.0 → 19.5 s, and bar 1 lands at 1.35 s',
      ok && near(g.a, 1.35) && g.pins.length === 1 && near(g.pins[0].t, 19.5), JSON.stringify(g));
  }
  /* R1-5 P13: a re-read that lands during the drag (it puts a new copy of the draft in memory). */
  {
    const C = await draft(), { run, F } = C;
    run(grid120 + ' sbDraft().unsaved = true; sbSaveSoon(sbSel, 0);'); await waitSaves();
    run('sbBtFor(sbSel).view = sbMainView(sbDraft().beat, sbDraft().audio.durationSec); sbDraft().__was = 1;');
    const dg = dragOf(C), ok = dg.down(1);
    await reread(C);
    const swapped = !run('sbDraft().__was');
    dg.up(1.5); await waitSaves();
    const b = F.S.get('songDrafts/' + C.id).beat;
    check('R1-5 P13: a re-read that lands while bar 1 is being dragged (a new copy of the draft in memory) does not lose the drag: the store gets bar 1 at 1.5 s and the pin at 19.5 s',
      ok && swapped && near(b.anchor, 1.5) && near(b.pins[0].t, 19.5), JSON.stringify({ swapped, anchor: b.anchor, pins: b.pins }));
  }
  /* R1-5 P14: a re-read that lands in the Beat step's first 30 ms (the beats are read, then the drift check is saved).
     This console's timers run on the real clock, so the read lands inside the 30 ms. */
  {
    const C = await draft(), { run, F } = C;
    run("sbReadAt = Date.now(); sbDraft().beat = { meter: '4/4', bpm: 120, anchor: 1, pins: [], driftOff: null }; sbDraft().unsaved = true; sbSaveSoon(sbSel, 0);"); await waitSaves();
    C.box.setTimeout = setTimeout;
    run("sbDraft().__was = 1; sbMem.level.E = null; sbStepOn = 3; " + due + ' renderTeacherSongBuilder();'); await settle();
    const order = { swapped: !run('sbDraft().__was'), measuring: !run('sbMem.level.E') };
    for(let t = 0; t < 40 && !Number.isFinite((F.S.get('songDrafts/' + C.id).beat || {}).driftOff); t++) await sleep(100);   // its 1.2 s save, on the real clock
    await settle();
    const b = F.S.get('songDrafts/' + C.id).beat;
    check('R1-5 P14: a re-read that lands while the Beat step reads the beats (its first 30 ms) does not lose the drift check measured then: it is saved, on this copy',
      order.swapped && order.measuring && Number.isFinite(b.driftOff) && b.driftFor === run('sbDraft().audio.sha256'), JSON.stringify(Object.assign(order, { driftOff: b.driftOff, driftFor: String(b.driftFor).slice(0, 8) })));
  }
  /* An edit made while a save of the same draft is in flight (the known limit of review round 1, closed 2026-11-25): the
     draft write is held at a gate on the store's transaction while the edit is made, then let go. */
  const gated = async (C, start) => {
    let release, held = 0; const gate = new Promise(r => { release = r; }), tx0 = C.F.db.runTransaction;
    C.F.db.runTransaction = async fn => { held++; await gate; return tx0(fn); };
    C.run(start);
    for(let t = 0; t < 200 && !held; t++) await sleep(5);
    return { busy: C.run('sbBusy'), held: () => held, go: () => { C.F.db.runTransaction = tx0; release(); } };
  };
  {
    const C = await draft(), { run, F } = C;
    run(grid120 + ' sbDraft().unsaved = true; sbSaveSoon(sbSel, 0);'); await waitSaves();
    run('sbBtFor(sbSel).view = sbMainView(sbDraft().beat, sbDraft().audio.durationSec);');
    run("sbBeatAct('a+half', { dataset: {} })");
    const dg = dragOf(C), ok = dg.down(1.25);
    const g = await gated(C, '0');
    dg.up(1.4);
    const during = run('sbDraft().beat.anchor');
    g.go(); await waitSaves(); await sleep(150); await settle();
    const mine = run('sbDraft().beat.anchor'), st = F.S.get('songDrafts/' + C.id).beat.anchor;
    check('R1 in flight: bar 1 dragged to 1.4 s and released while the save of the edit before it (½ beat, 1.25 s) is in flight: when that save lands the screen keeps 1.4 s, and its own save stores it',
      ok && g.busy === 'save' && g.held() >= 1 && near(during, 1.4) && near(mine, 1.4) && near(st, 1.4), JSON.stringify({ busy: g.busy, during, mine, stored: st }));
  }
  {
    const C = await draft(), { run, F } = C;
    run('sbReadAt = Date.now(); sbStepOn = 1; ' + typeTitle('Test 0 first'));
    const g = await gated(C, 'sbGoStep(2)');
    run(typeTitle('Test 0 second'));
    g.go(); await waitSaves(); await sleep(100); await settle();
    const first = { stored: F.S.get('songDrafts/' + C.id).title, mine: run('sbDraft().title'), dirty: run('!!sbDraft().dirty') };
    run('sbGoStep(1); sbGoStep(2);'); await settle(200); await waitSaves();
    check('R1 in flight: a title typed again while Next\'s save (a copy made before it) is in flight is kept on screen, still marked, and the next Next stores it',
      g.busy === 'save' && first.stored === 'Test 0 first' && first.mine === 'Test 0 second' && first.dirty && F.S.get('songDrafts/' + C.id).title === 'Test 0 second',
      JSON.stringify(Object.assign(first, { busy: g.busy, stored2: F.S.get('songDrafts/' + C.id).title })));
  }
  /* SB-7's note: the Beat step sets a grid exactly when the validator's bpm rule takes the song it makes (the song's bpm is
     the grid's, rounded: a typed 260 can fit to more, and a pin or a moved bar 1 changes it). Grids near both bounds,
     with a pin (the pins give the tempo) and without (beat.bpm, rounded to 4 places first). */
  {
    const C = await draft(), { run } = C;
    run(chart4); await settle(200); await waitSaves();
    run('sbMem.level.E = sbOnsetEnv(sbMem.level.mono, sbMem.level.fs); sbStepOn = 3;');
    const targets = [29.9994, 29.9995, 29.9996, 30, 30.0004, 120, 259.9996, 260, 260.0004, 260.00049, 260.0005, 260.0006, 260.001, 260.3];
    let n = 0, agree = 0, took = 0, refused = 0, line = '';
    const off = [];
    for(const bpm of targets) for(const pin of [false, true]){
      const beat = `{ meter: '4/4', bpm: ${bpm}, anchor: 1, pins: ${pin ? `[{ bar: 9, t: ${1 + 8 * 240 / bpm} }]` : '[]'}, driftOff: 0 }`;
      run(`sbNote = ''; sbDraft().beat = null; sbBeatSet(sbDraft(), ${beat}, null);`);
      const set = run('!!sbDraft().beat');
      if(!set && !line) line = run('sbNote');
      run(`(() => { const d = sbDraft(), b = ${beat}; b.bpm = Math.round(sbPinBpm(b) * 10000) / 10000; d.beat = b; })()`);
      const bpmBad = run('builtSongCheck(sbSel, sbDocOf(sbDraft()))').some(w => /^bpm/.test(w));
      n++; if(set === !bpmBad) agree++; else off.push(`${bpm}${pin ? ' pin' : ''}: set ${set}, validator ${bpmBad ? 'refuses' : 'takes'}`);
      if(set) took++; else refused++;
    }
    run("sbDraft().beat = { meter: '4/4', bpm: 120, anchor: 1, pins: [], driftOff: 0 };"); await waitSaves();
    check(`SB-7 grid: the Beat step sets a grid exactly when the validator's bpm rule takes the song it makes (${agree} of ${n} grids near 30 and 260, with a pin and without; ${took} set, ${refused} refused), and a refusal says the rule`,
      agree === n && took > 0 && refused > 0 && /makes [\d.]+ BPM\. A BPM from 30 to 260/.test(line) && /count it in two/.test(line), JSON.stringify({ off, line }));
  }
  const bad = stores.flatMap(F => F.st.violations), ws = stores.reduce((n, F) => n + F.st.writes.length, 0);
  check('r1: every write of these cases fits firestore.rules and the builder\'s own paths, none to config/class or progress/',
    !bad.length && ws > 50 && !stores.some(F => F.st.writes.some(w => /^(config|progress)\//.test(w.path))), ws + ' writes; ' + (bad.slice(0, 3).join('; ') || 'no violation'));
}

/* ── main ── */
const parts = siteParts('teacher.js', ROOT);
for(const p of ['teacher-sb-core.js', 'teacher-sb-beat.js', 'teacher-sb-dsp.js', 'teacher-sb-chart.js', 'teacher-sb-pdf.js', 'teacher-sb-publish.js', 'teacher-sb-sheet.js']) if(!parts.includes(p)){ console.log(`song-builder-sim: ${p} is not a console part (TEACHER_JS_PARTS in app/boot.js)`); process.exit(1); }
let res;
try { res = await runCases(parts.map(read).join(''), read('teacher-sb-sheet.js')); }
catch(e){ console.log('song-builder-sim: the run threw: ' + (e && e.stack || e)); if(STUCK) console.log(`  ✗ ${STUCK_NAME} — ${STUCK}`); process.exit(1); }
if(STUCK) res.push({ name: STUCK_NAME, ok: false, detail: STUCK });
const bad = res.filter(r => !r.ok);
for(const r of res) if(VERBOSE || !r.ok) console.log(`  ${r.ok ? '✓' : '✗'} ${r.name}${r.detail ? ' — ' + r.detail : ''}`);
console.log(`song-builder-sim: ${res.length} cases, ${bad.length} failed`);
/* --breaks (2026-11-18, the lyrics sheet): broken copies of the sheet code and of what carries the sheet; each must
   turn at least one of the sheet cases (sheetCases, run alone on its own console and store) red. */
let missed = 0;
if(args.includes('--breaks')){
  const SHEET_BREAKS = [
    ['teacher-sb-sheet.js', 'no 5 MB cap', 'if(file.size > BS_MAX_SHEET_BYTES){', 'if(false){'],
    ['teacher-sb-sheet.js', 'a file that is not a pdf is read', "if(head.indexOf('%PDF-') < 0){", 'if(false){'],
    ['teacher-sb-sheet.js', 'no "no text" line for a scan', "e && e.code === 'notext' ? SB_SHEET_NOTEXT :", 'false ? SB_SHEET_NOTEXT :'],
    ['teacher-sb-sheet.js', 'Add offered for a sheet that does not follow', "    else if(res && res.ok){", "    else if(res){"],
    ['teacher-sb-sheet.js', 'Add writes a sheet that did not pass', "if(!f || !f.bytes || sbSh.reading || !res || !res.ok ||", "if(!f || !f.bytes || sbSh.reading || !res ||"],
    ['teacher-sb-sheet.js', 'the song not read again in the transaction', "if(!now || sbCanon(sbPubNorm(now)) !== sbCanon(sbPubNorm(JSON.parse(was))))", "if(!now)"],
    ['teacher-sb-sheet.js', 'the list keeps its edit number', "      songs[id] = ver;\n      tx.set(sref,", "      tx.set(sref,"],
    ['teacher-sb-sheet.js', 'the draft not written with the song', "      if(d) tx.set(db.collection('songDrafts')", "      if(false) tx.set(db.collection('songDrafts')"],
    ['teacher-sb-sheet.js', 'a replaced or removed sheet left in the store', "    if(cur && !(sheet && sheet.id === cur.id)) await sbDeleteAudio(cur.id, null);\n", ''],
    ['teacher-sb-sheet.js', 'a stored pdf uploaded again', "if(!teacherSfHeadMatches(hs.exists ? hs.data() || {} : null, entry)) await teacherSfPutFile(sheet.id", "await teacherSfPutFile(sheet.id"],
    ['teacher-sb-sheet.js', 'the file name drawn unescaped', '<div class="sb-file-name">${escHtml(f.name)}', '<div class="sb-file-name">${f.name}'],
    ['teacher-sb-sheet.js', 'only the full chords checked', "const modes = act.chordVersions ? ['full', 'power'] : ['full'];", "const modes = ['full'];"],
    ['teacher-sb-sheet.js', 'Remove without asking', "    if(!confirm(`Remove the lyrics sheet", "    if(false && !confirm(`Remove the lyrics sheet"],
    ['teacher-sb-sheet.js', 'Check it again not counted', '    await songFileCount(db, songFileCost(sh.bytes));\n    const bytes = await songFileReadPieces(db, sh.id,', '    const bytes = await songFileReadPieces(db, sh.id,'],
    ['teacher-sb-sheet.js', 'the sheet head not read again in the transaction', "if(!teacherSfHeadMatches(hs2.exists ? hs2.data() || {} : null, entry)) throw", "if(false) throw"],
    ['teacher-sb-chart.js', 'the draft\'s sheet left out of the song (Edit / Publish drop it)', "  if(d.sheet && typeof d.sheet === 'object') song.sheet =", "  if(false) song.sheet ="],
    ['teacher-sb-publish.js', 'an imported song\'s rebuilt draft loses its sheet', "pubVer: Number(p.ver) || null, sheet: s.sheet && typeof s.sheet === 'object' ? JSON.parse(JSON.stringify(s.sheet)) : null };", "pubVer: Number(p.ver) || null, sheet: null };"],
    ['teacher-sb-publish.js', 'Publish does not read the sheet\'s head', "      if(sh){\n        const ss = await tx.get(db.collection('songFiles').doc(sh.id));", "      if(false){\n        const ss = await tx.get(db.collection('songFiles').doc(sh.id));"],
    ['teacher-sb-publish.js', 'Delete… leaves the sheet', "p.doc && p.doc.song && p.doc.song.sheet && p.doc.song.sheet.id, d && d.sheet && d.sheet.id].filter(Boolean)", "].filter(Boolean)"],
    ['teacher-sb-publish.js', 'Export leaves the pdf out', "    if(pdf) teacherMicSaveFile(base + '.pdf',", "    if(false) teacherMicSaveFile(base + '.pdf',"],
    ['teacher-sb-publish.js', 'the row missing from the published song\'s page', "    + (doc && verdict.ok && typeof sbSheetRowHtml === 'function' ? sbSheetRowHtml(id, p) : '');", "    + '';"],
    ['teacher-sb-core.js', 'the draft writer drops the sheet', "'pubVer', 'imported', 'sheet'];", "'pubVer', 'imported'];"],
  ];
  const srcs = new Map(parts.map(p => [p, read(p)]));
  console.log('\n== broken copies (each must turn at least one lyrics-sheet case red)');
  for(const [file, name, from, to] of SHEET_BREAKS){
    const src = srcs.get(file), n = src.split(from).length - 1;
    if(n !== 1){ console.log(`  ✗ ${name}: its text is in ${file} ${n} times (must be once)`); missed++; continue; }
    const broken = src.replace(from, () => to);
    const out = [], check = (nm, ok, detail) => out.push({ name: nm, ok: !!ok, detail });
    try { await sheetCases(parts.map(p => p === file ? broken : srcs.get(p)).join(''), check, file === 'teacher-sb-sheet.js' ? broken : srcs.get('teacher-sb-sheet.js')); }
    catch(e){ out.push({ name: 'threw: ' + String(e && e.message || e).slice(0, 100), ok: false }); }
    const red = out.filter(r => !r.ok);
    if(red.length) console.log(`  ✓ caught: ${name} — ${red[0].name.slice(0, 90)}`);
    else { console.log(`  ✗ NOT caught: ${name}`); missed++; }
  }
  console.log(`${missed ? '✗' : '✓'} ${SHEET_BREAKS.length - missed} of ${SHEET_BREAKS.length} breaks caught`);
}
process.exit(bad.length || missed ? 1 : 0);
