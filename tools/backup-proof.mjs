#!/usr/bin/env node
/* backup-proof.mjs — the console's "Download a backup" (teacher-backup.js) run against a stub Firestore (2026-11-13).

     node tools/backup-proof.mjs                    every case below; exit 0 = all held, 1 = a ✗ line
     node tools/backup-proof.mjs --backup FILE      run a changed copy of teacher-backup.js (a break-it copy)
     node tools/backup-proof.mjs --root DIR         another site folder

   WHAT IS REAL. teacher-backup.js exactly as it ships, found through tools/site-src.mjs (it must be a part of the
   console script, after teacher-mic.js), run in a Node vm context; with it the site's own escHtml / escAttr
   (app/boot.js), withTimeout (app/save.js), the Module 4/5 helpers swap45MapId … swap45Remap (app/save.js, only so a
   break-it copy that remaps can be planted and seen) and teacherMicSaveFile (teacher-mic.js), unmodified.
   STUBBED: Firestore (below), the page (getElementById, an <a> whose click is the "download"), URL.createObjectURL
   (it keeps the Blob: that Blob IS the saved file), localStorage, caches.keys(). The clock: any timer of 1 s or more
   runs 1000 times faster, so a hung read's 30 s ceiling takes 30 ms. Made-up data only (300 "Test Student NNN",
   fake uids); no network, no Firebase SDK, never the real project.

   THE STUB DATABASE. A flat map of doc paths → fields, holding every collection firestore.rules names: config/class,
   progress/*, minutes/{uid}/weeks/*, minutes/{uid}/days/*, minutes/{uid}/meta/board, issueReports/* (empty in the
   main case), micTakes/* + chunks, micTakesMeta/count, liveQuiz/current + answers, weekBoard/*, rankBoard/*.
   It answers doc get, collection get, orderBy(documentId) + limit + startAfter (by id), with 0–3 ms latency, and a
   fresh deep copy on every data() (so the code under test cannot change the store). Every write method (set, update,
   delete, add, batch, runTransaction) counts and throws. A failure can be planted per collection: always, or once.

   WHAT IT CHECKS (each prints a line with its denominator):
     header       complete:true, format, the file name's date, the counts per collection = the stub's (N of N)
     round-trip   every doc in the file, parsed and decoded (teacherBackupDecode), equals the stub's stored doc by an
                  independent canonical form that keeps types (Timestamp, bytes, geopoint, reference, NaN, -0, ±Inf,
                  a map with its own "__type" key), and no doc is extra or missing (N of N)
     raw          the old-numbered Module 4/5 doc is in the file as stored (its old key there, the remapped key not)
     reads        the left-out collections were never read; progress came in pages of 200 (300 → 2 pages)
     writes       zero write attempts in every case
     failures     a read failure on each collection in turn (and permission-denied, and a hung read) → status names
                  it, kind 'failed', no file, no "last backup" date; a one-off failure is retried and the file is whole
     unwritable   a value the file cannot hold → failed, no file, and the student-written key in the message is escaped
     clicks       a second click while one runs does nothing (one file, one config read)
     leave        leaving Manage mid-read → 'stopped', no file, reads stop within the workers in flight; a later run works
     reminder     never / today / 3 days / 7 days / 8 days → the line and whether it is the reminder
     panel        the row's HTML escapes the status text; Manage's head calls teacherBackupPanelHtml(). */
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { siteParts, siteSource } from './site-src.mjs';

const args = process.argv.slice(2);
const argOf = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const ROOT = resolve(argOf('--root') || join(dirname(fileURLToPath(import.meta.url)), '..'));
let fails = 0;
const ok = (cond, line) => { console.log((cond ? '  ✓ ' : '  ✗ ') + line); if(!cond) fails++; return cond; };

/* ── The real code ── */
const parts = siteParts('teacher.js', ROOT);
ok(parts.includes('teacher-backup.js') && parts.indexOf('teacher-backup.js') > parts.indexOf('teacher-mic.js'),
  `teacher-backup.js is a console part after teacher-mic.js (${parts.length} parts: ${parts.join(', ')})`);
const backupPath = argOf('--backup') ? resolve(argOf('--backup')) : join(ROOT, 'teacher-backup.js');
const BACKUP_SRC = readFileSync(backupPath, 'utf8');
const APP = siteSource('app.js', ROOT), CONSOLE = siteSource('teacher.js', ROOT);
function extractFn(src, name){
  const re = new RegExp('(?:^|\\n)((?:async )?function ' + name + '\\()');
  const m = re.exec(src); if(!m) throw new Error('not found: function ' + name);
  let i = src.indexOf('{', m.index + m[0].length), depth = 0, j = i;
  for(; j < src.length; j++){ if(src[j] === '{') depth++; else if(src[j] === '}'){ depth--; if(!depth) break; } }
  return src.slice(m.index, j + 1).trim();
}
function extractLine(src, startsWith){
  const line = src.split('\n').find(l => l.startsWith(startsWith));
  if(!line) throw new Error('not found: ' + startsWith); return line;
}
const a = APP.indexOf('function swap45MapId('), b = APP.indexOf('function swap45Canon(');
if(a < 0 || b < a) throw new Error('swap45 block not found');
const HELPERS = [
  extractLine(APP, 'const escHtml = '), extractLine(APP, 'const escAttr = '),
  extractFn(APP, 'withTimeout'), APP.slice(a, b), extractFn(CONSOLE, 'teacherMicSaveFile'),
].join('\n');
const manageFn = extractFn(CONSOLE, 'renderTeacherManage');
ok(/const head=`\s*\$\{teacherBackupPanelHtml\(\)\}/.test(manageFn), "Manage's head starts with ${teacherBackupPanelHtml()} (renderTeacherManage, teacher-manage.js)");

/* ── Stub Firestore types ── */
class Timestamp { constructor(s, n){ this.seconds = s; this.nanoseconds = n; } toMillis(){ return this.seconds * 1000 + Math.floor(this.nanoseconds / 1e6); } isEqual(o){ return o instanceof Timestamp && o.seconds === this.seconds && o.nanoseconds === this.nanoseconds; } }
class Blob_ { constructor(u8){ this._b = Uint8Array.from(u8); } static fromBase64String(s){ return new Blob_(Buffer.from(s, 'base64')); } toBase64(){ return Buffer.from(this._b).toString('base64'); } toUint8Array(){ return Uint8Array.from(this._b); } }
class GeoPoint { constructor(a, b){ this.latitude = a; this.longitude = b; } isEqual(o){ return o.latitude === this.latitude && o.longitude === this.longitude; } }
class DocumentReference { constructor(path){ this.path = path; } collection(){ throw new Error('stub ref'); } }
const F = { Timestamp, Blob: Blob_, GeoPoint, DocumentReference, doc: p => new DocumentReference(p) };

function clone(v){
  if(v === null || typeof v !== 'object') return v;
  if(v instanceof Timestamp) return new Timestamp(v.seconds, v.nanoseconds);
  if(v instanceof Blob_) return new Blob_(v._b);
  if(v instanceof GeoPoint) return new GeoPoint(v.latitude, v.longitude);
  if(v instanceof DocumentReference) return new DocumentReference(v.path);
  if(Array.isArray(v)) return v.map(clone);
  const o = {}; for(const k of Object.keys(v)) Object.defineProperty(o, k, { value: clone(v[k]), enumerable: true, writable: true, configurable: true }); return o;
}
/* An independent canonical text that keeps every type apart (not the code under test's encoder). */
function canon(v){
  if(v === null) return 'null';
  if(typeof v === 'number') return Object.is(v, -0) ? 'num(-0)' : Number.isNaN(v) ? 'num(NaN)' : 'num(' + String(v) + ')';
  if(typeof v === 'string') return 'str(' + JSON.stringify(v) + ')';
  if(typeof v === 'boolean') return 'bool(' + v + ')';
  if(v instanceof Timestamp) return `ts(${v.seconds},${v.nanoseconds})`;
  if(v instanceof Blob_) return 'bytes(' + v.toBase64() + ')';
  if(v instanceof GeoPoint) return `geo(${v.latitude},${v.longitude})`;
  if(v instanceof DocumentReference) return 'ref(' + v.path + ')';
  if(Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  // A plain object of ANY realm (the decoder's objects come from the vm context): its prototype is null or a realm's Object.prototype.
  const pr = typeof v === 'object' ? Object.getPrototypeOf(v) : undefined;
  if(pr === null || (pr && Object.getPrototypeOf(pr) === null && !(v instanceof Uint8Array)))
    return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
  return 'OTHER(' + typeof v + ')';
}

/* ── The class ── */
const NOW = Date.UTC(2026, 10, 13, 20, 0, 0);
function makeStore(opts = {}){
  const S = new Map();
  const nStudents = opts.students ?? 300;
  S.set('config/class', { gamesEnabled: true, configVersion: 41, activityDates: { 'ca-1': '2026-11-10' }, paused: { 'fake-uid-007': true },
    seededAt: new Timestamp(1762000000, 123456789), odd: { nan: NaN, negz: -0, inf: Infinity, ninf: -Infinity },
    tagged: { __type: 'timestamp', seconds: 'not really' }, list: [1, 'two', { three: new Timestamp(5, 6) }],
    loc: new GeoPoint(37.48, -122.23), ref: new DocumentReference('progress/fake-uid-001'), raw: new Blob_([0, 1, 2, 254, 255]) });
  for(let i = 1; i <= nStudents; i++){
    const uid = 'fake-uid-' + String(i).padStart(3, '0');
    const d = { name: `Test Student ${String(i).padStart(3, '0')}`, email: `student${i}@example.test`, period: i % 2 ? '4' : '7',
      skills: { 'm1w1-s1': 'gotit', 'm2w1-s2': i % 3 ? 'working' : '2' }, responses: { 'm1w1-b-sec0-0': 'Answer ' + i },
      completed: { 'm1w1': true }, lastLogin: new Timestamp(1762900000 + i, i * 1000), migrations: { swap45: true }, streak: { count: i % 9, lastDay: '2026-11-12' } };
    if(i === 17){ d.name = `<script>alert("x")</script> O'Brien "Q" & co`; d.responses['m1w1-b-sec0-1'] = '</div><img src=x onerror=alert(1)>'; }
    if(i === 42){ delete d.migrations; d.skills['m4w1-s1'] = 'gotit'; d.completed['m4w2'] = true; d.lastModule = 4; }   // OLD numbering: Module 4 = Pentatonic then
    S.set('progress/' + uid, d);
    if(i % 3) for(let w = 0; w < (i % 4) + 1; w++) S.set(`minutes/${uid}/weeks/2026-W${String(40 + w).padStart(2, '0')}`, { seconds: 60 * (i + w), goalSeconds: 3600, hit: w % 2 === 0 });
    if(i % 5 === 0){ S.set(`minutes/${uid}/days/2026-11-1${i % 10}`, { seconds: 120 }); S.set(`minutes/${uid}/meta/board`, { id: 'f'.repeat(32) }); }
  }
  for(let r = 0; r < (opts.reports ?? 0); r++) S.set('issueReports/rep-' + String(r).padStart(4, '0'), { uid: 'fake-uid-001', name: 'Test Student 001', message: 'Broken <b>' + r, createdAt: new Timestamp(1762800000 + r, 0), moduleNum: 3, setId: null, lang: 'en', email: 'student1@example.test', location: 'x', userAgent: 'ua' });
  S.set('micTakes/fake-uid-001-coach', { uid: 'fake-uid-001', mode: 'coach' }); S.set('micTakes/fake-uid-001-coach/chunks/0', { i: 0, pcm: new Blob_([1, 2]) });
  S.set('micTakesMeta/count', { n: 1 }); S.set('liveQuiz/current', { state: 'lobby' }); S.set('liveQuiz/current/answers/fake-uid-001', { uid: 'fake-uid-001' });
  S.set('weekBoard/' + 'a'.repeat(32), { week: '2026-W46', period: '4', seconds: 60 }); S.set('rankBoard/' + 'a'.repeat(32), { seconds: 600 });
  if(opts.unwritable) S.get('progress/fake-uid-003').skills['<img src=x onerror=alert(2)>'] = () => 1;
  return S;
}
// Which file collection a stored path belongs to; null = not one the backup should hold.
function collOf(path){
  const p = path.split('/');
  if(path === 'config/class') return 'config';
  if(p.length === 2 && p[0] === 'progress') return 'progress';
  if(p.length === 2 && p[0] === 'issueReports') return 'issueReports';
  if(p.length === 4 && p[0] === 'minutes' && p[2] === 'weeks') return 'minutes/{uid}/weeks';
  return null;
}
function fileKeyOf(path){ const p = path.split('/'); return collOf(path) === 'minutes/{uid}/weeks' ? p[1] + '/' + p[3] : p[p.length - 1]; }

/* ── The stub db ── */
function makeDb(S, plan = {}){
  const st = { writes: 0, reads: [], queries: 0, failedOnce: new Set(), hooks: [] };
  const wr = () => { st.writes++; throw new Error('stub: write refused'); };
  const lat = () => new Promise(r => setTimeout(r, Math.floor(Math.random() * 4)));
  const failFor = coll => {
    const f = plan.fail && plan.fail[coll];
    if(!f) return null;
    if(f.once){ if(st.failedOnce.has(coll)) return null; st.failedOnce.add(coll); }
    if(f.hang) return 'hang';
    const e = new Error(f.code || 'unavailable'); e.code = f.code || 'unavailable'; return e;
  };
  const snapOf = (path) => ({ id: path.split('/').pop(), exists: S.has(path), data: () => S.has(path) ? clone(S.get(path)) : undefined, ref: { path } });
  const read = async (coll, path, fn) => {
    st.reads.push(path);
    for(const h of st.hooks) h(st.reads.length, path);
    const f = failFor(coll);
    if(f === 'hang') return new Promise(() => {});
    await lat();
    if(f) throw f;
    return fn();
  };
  const collGroupOf = path => { const p = path.split('/'); return p.length === 3 && p[0] === 'minutes' && p[2] === 'weeks' ? 'minutes/{uid}/weeks' : path; };
  function collection(path){
    const childrenOf = () => [...S.keys()].filter(k => k.startsWith(path + '/') && k.split('/').length === path.split('/').length + 1).sort();
    const query = (q) => ({
      orderBy(f){ if(f !== '__name__') throw new Error('stub orders by id only'); return query({ ...q, ordered: true }); },
      limit(n){ return query({ ...q, limit: n }); },
      startAfter(s){ return query({ ...q, after: typeof s === 'string' ? s : s.id }); },
      where(){ throw new Error('stub: no where'); },
      get(){ st.queries++; return read(collGroupOf(path), path, () => {
        let ids = childrenOf();
        if(q.after != null) ids = ids.filter(k => k.split('/').pop() > q.after);
        if(q.limit) ids = ids.slice(0, q.limit);
        const docs = ids.map(snapOf);
        return { docs, size: docs.length, empty: !docs.length, forEach: fn => docs.forEach(fn) };
      }); },
      add: wr, onSnapshot: wr,
    });
    const c = query({});
    c.doc = id => {
      const dp = path + '/' + id;
      return { path: dp, id, get(){ return read(dp === 'config/class' ? 'config/class' : dp, dp, () => snapOf(dp)); }, collection: sub => collection(dp + '/' + sub), set: wr, update: wr, delete: wr, onSnapshot: wr };
    };
    return c;
  }
  const db = { collection, doc: p => { throw new Error('stub: db.doc'); }, batch: () => { st.writes++; return { set: wr, update: wr, delete: wr, commit: wr }; }, runTransaction: async () => wr() };
  return { db, st };
}

/* ── One console context ── */
function makeConsole(S, plan = {}){
  const { db, st } = makeDb(S, plan);
  const store = new Map(Object.entries(plan.ls || {}));
  const saved = [];
  const els = {};
  const el = id => (els[id] ||= { id, disabled: false, textContent: '', style: {} });
  ['t-backup-btn', 't-backup-status', 't-backup-last'].forEach(el);
  const fastTimeout = (fn, ms, ...r) => setTimeout(fn, ms >= 1000 ? ms / 1000 : ms, ...r);
  const ctx = {
    console,
    setTimeout: fastTimeout, clearTimeout,
    Blob: globalThis.Blob,
    URL: { createObjectURL: blob => { saved.push({ blob }); return 'blob:stub-' + saved.length; }, revokeObjectURL(){} },
    document: {
      getElementById: id => els[id] || null,
      createElement: () => ({ click(){ const last = saved[saved.length - 1]; if(last) last.name = this.download; }, remove(){}, set href(v){ this._h = v; }, get href(){ return this._h; } }),
      body: { appendChild(){} },
    },
    localStorage: { getItem: k => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
    caches: { keys: async () => ['guitar-class-audio-2026-10-30-ff9e913a6d', 'guitar-class-audio-hashes', 'guitar-class-2026-11-13-abc123'] },
    firebase: { firestore: { Timestamp, Blob: Blob_, GeoPoint, DocumentReference, FieldPath: { documentId: () => '__name__' } }, app: () => ({ options: { projectId: 'stub-project' } }) },
  };
  vm.createContext(ctx);
  vm.runInContext(HELPERS + '\nlet db = null; let teacherView = "manage";\nasync function ensureDb(){ return db; }\n', ctx, { filename: 'helpers.js' });
  vm.runInContext(BACKUP_SRC, ctx, { filename: 'teacher-backup.js' });
  ctx.__db = db;
  vm.runInContext('db = __db;', ctx);
  const run = code => vm.runInContext(code, ctx);
  return { ctx, st, saved, store, els, run, setView: v => run(`teacherView = ${JSON.stringify(v)}`) };
}
const state = c => c.run('teacherBackupState');
const fileOf = async c => { const f = c.saved[c.saved.length - 1]; return f ? { name: f.name, type: f.blob.type, text: await f.blob.text() } : null; };

/* ══ 1. The main case: 300 students, every type, an empty collection ══ */
console.log('\n1. A whole backup (300 students, issueReports empty, every Firestore type)');
{
  const S = makeStore({ students: 300, reports: 0 });
  const c = makeConsole(S);
  await c.run('teacherBackupStart()');
  const s = state(c);
  ok(s.kind === 'saved', `state: ${s.kind} — "${s.text}"`);
  ok(c.saved.length === 1, `files saved: ${c.saved.length} of 1`);
  const f = await fileOf(c);
  ok(f && /^guitar-class-backup-\d{4}-\d{2}-\d{2}\.json$/.test(f.name), `file name ${f && f.name}`);
  ok(f && f.type === 'application/json', `Blob type ${f && f.type}`);
  const j = JSON.parse(f.text);
  const keys = Object.keys(j);
  ok(keys[0] === 'format' && keys[keys.length - 1] === 'collections', `header first, collections last (${keys.join(', ')})`);
  ok(j.format === 'guitar-class-backup' && j.formatVersion === 1 && j.complete === true, `format ${j.format} v${j.formatVersion}, complete ${j.complete}`);
  ok(j.date === f.name.slice(20, 30), `header date ${j.date} = the file name's`);
  ok(j.site === 'guitar-class-2026-11-13-abc123' && j.project === 'stub-project', `site ${j.site}, project ${j.project}`);
  // Counts vs the stub
  const want = { config: 0, progress: 0, 'minutes/{uid}/weeks': 0, issueReports: 0 };
  for(const p of S.keys()){ const k = collOf(p); if(k) want[k]++; }
  let countOk = 0;
  for(const k of Object.keys(want)){ if(j.counts[k] === want[k] && Object.keys(j.collections[k] || {}).length === want[k]) countOk++; else console.log(`     ${k}: header ${j.counts[k]}, file ${Object.keys(j.collections[k] || {}).length}, stub ${want[k]}`); }
  ok(countOk === 4 && Object.keys(j.counts).length === 4, `header counts = stub counts for ${countOk} of 4 collections (${Object.entries(want).map(([k, v]) => k + ' ' + v).join(', ')})`);
  ok(want.issueReports === 0 && j.collections.issueReports && !Object.keys(j.collections.issueReports).length, 'the empty collection (issueReports) is in the file, empty, count 0');
  // Round trip
  let same = 0, total = 0; const bad = [];
  for(const p of S.keys()){
    const k = collOf(p); if(!k) continue; total++;
    const got = j.collections[k] && j.collections[k][fileKeyOf(p)];
    let dec; try{ dec = vm.runInContext('teacherBackupDecode', c.ctx)(got, F); }catch(e){ dec = 'ERR ' + e.message; }
    if(got !== undefined && canon(dec) === canon(S.get(p))) same++; else bad.push(p);
  }
  let fileDocs = 0; for(const k of Object.keys(j.collections)) fileDocs += Object.keys(j.collections[k]).length;
  ok(same === total && fileDocs === total, `round-trip: ${same} of ${total} docs equal the stub after parse + decode (types kept); ${fileDocs} docs in the file${bad.length ? ' — first bad: ' + bad.slice(0, 3).join(', ') : ''}`);
  const cfg = j.collections.config.class;
  ok(cfg && cfg.seededAt.__type === 'timestamp' && cfg.seededAt.seconds === 1762000000 && cfg.seededAt.nanoseconds === 123456789, `a timestamp is written tagged: ${JSON.stringify(cfg && cfg.seededAt)}`);
  ok(cfg && cfg.tagged.__type === 'map' && cfg.tagged.value.__type === 'timestamp', 'a stored map with its own "__type" key is wrapped, not mistaken for a timestamp');
  const nm = j.collections.progress['fake-uid-017'].name;
  ok(nm === `<script>alert("x")</script> O'Brien "Q" & co`, `the <script>/quotes name is in the file byte for byte: ${JSON.stringify(nm)}`);
  // Raw, not remapped
  const raw42 = j.collections.progress['fake-uid-042'];
  const remapped = vm.runInContext('swap45Remap', c.ctx)(clone(S.get('progress/fake-uid-042')));
  ok(Object.keys(remapped.skills).includes('m5w1-s1') && !Object.keys(remapped.skills).includes('m4w1-s1'), "the console's roster would read fake-uid-042 remapped (skills m4w1-s1 → m5w1-s1)");
  ok(raw42 && 'm4w1-s1' in raw42.skills && !('m5w1-s1' in raw42.skills) && raw42.completed.m4w2 === true && raw42.lastModule === 4 && !('migrations' in raw42),
    'the file holds fake-uid-042 RAW: skills m4w1-s1, completed m4w2, lastModule 4, no migrations marker');
  // Reads
  const left = c.st.reads.filter(p => /^(micTakes|micTakesMeta|liveQuiz|weekBoard|rankBoard)/.test(p) || /\/(days|meta)(\/|$)/.test(p));
  ok(left.length === 0, `left-out collections read: ${left.length} (of ${c.st.reads.length} reads)`);
  const progPages = c.st.reads.filter(p => p === 'progress').length;
  ok(progPages === 2, `progress read in ${progPages} pages of at most 200 for 300 students`);
  const weekReads = c.st.reads.filter(p => /^minutes\/[^/]+\/weeks$/.test(p)).length;
  ok(weekReads === 300, `practice-minutes weeks read once per student: ${weekReads} of 300`);
  ok(c.st.writes === 0, `write attempts: ${c.st.writes}`);
  ok(Number(c.store.get('gc-teacher-backup-last')) > 0, 'the "last backup" date is kept in localStorage');
  ok(/300 students/.test(s.text) && /0 problem reports/.test(s.text), 'the saved line counts 300 students and 0 problem reports');
}

/* ══ 2. Paging another collection: 405 problem reports ══ */
console.log('\n2. 405 problem reports, 3 students (paging past 200 twice)');
{
  const S = makeStore({ students: 3, reports: 405 });
  const c = makeConsole(S);
  await c.run('teacherBackupStart()');
  const j = JSON.parse((await fileOf(c)).text);
  const n = Object.keys(j.collections.issueReports).length;
  ok(state(c).kind === 'saved' && j.counts.issueReports === 405 && n === 405, `issueReports: header ${j.counts.issueReports}, file ${n}, stub 405`);
  const pages = c.st.reads.filter(p => p === 'issueReports').length;
  ok(pages === 3, `issueReports read in ${pages} pages`);
  const r = j.collections.issueReports['rep-0404'];
  ok(r && r.createdAt.__type === 'timestamp' && r.createdAt.seconds === 1762800404, 'a report\'s createdAt is a tagged timestamp');
  ok(c.st.writes === 0, `write attempts: ${c.st.writes}`);
}

/* ══ 3. A read failure on each collection in turn ══ */
console.log('\n3. Read failures: each collection in turn, never a file');
for(const [coll, code, label] of [
  ['config/class', 'unavailable', 'class settings'], ['progress', 'unavailable', 'saved work'],
  ['minutes/{uid}/weeks', 'unavailable', 'practice minutes'], ['issueReports', 'unavailable', 'problem reports'],
  ['progress', 'permission-denied', 'saved work'], ['config/class', 'hang', 'class settings'],
]){
  const S = makeStore({ students: 40, reports: 3 });
  const c = makeConsole(S, { fail: { [coll]: code === 'hang' ? { hang: true } : { code } } });
  await c.run('teacherBackupStart()');
  const s = state(c);
  const tries = c.st.reads.filter(p => coll === 'minutes/{uid}/weeks' ? /\/weeks$/.test(p) : p === coll).length;
  const why = code === 'hang' ? 'timeout' : code;
  ok(s.kind === 'failed' && s.text.includes(label) && s.text.includes(why) && /Nothing was saved/.test(s.text) && c.saved.length === 0 && !c.store.has('gc-teacher-backup-last') && c.st.writes === 0,
    `${coll} ${code}: ${s.kind}, files ${c.saved.length}, tries ${tries}, writes ${c.st.writes} — "${s.text.slice(0, 90)}…"`);
  if(code === 'permission-denied') ok(tries === 1, `permission-denied is not retried (${tries} try)`);
  if(code === 'unavailable' && coll === 'progress') ok(tries === 2, `unavailable is retried once (${tries} tries)`);
  ok(c.els['t-backup-btn'].disabled === false && c.els['t-backup-status'].textContent === s.text, 'the button is free again and the status element shows the line');
}
{
  const S = makeStore({ students: 40, reports: 3 });
  const c = makeConsole(S, { fail: { progress: { once: true } } });
  await c.run('teacherBackupStart()');
  const j = JSON.parse((await fileOf(c)).text);
  ok(state(c).kind === 'saved' && j.counts.progress === 40 && j.complete === true, `a one-off failure on progress is retried: ${state(c).kind}, ${j.counts.progress} of 40 students`);
}

/* ══ 4. A value the file cannot hold ══ */
console.log('\n4. An unwritable value');
{
  const S = makeStore({ students: 5, unwritable: true });
  const c = makeConsole(S);
  await c.run('teacherBackupStart()');
  const s = state(c);
  ok(s.kind === 'failed' && c.saved.length === 0 && /saved work/.test(s.text), `${s.kind}, files ${c.saved.length} — "${s.text.slice(0, 120)}…"`);
  const html = c.run('teacherBackupPanelHtml()');
  ok(!html.includes('<img src=x') && html.includes('&lt;img src=x'), 'the student-written key in the message is escaped in the row\'s HTML');
}

/* ══ 5. A second click ══ */
console.log('\n5. A second click while one runs');
{
  const S = makeStore({ students: 60 });
  const c = makeConsole(S);
  const p1 = c.run('teacherBackupStart()');
  const p2 = c.run('teacherBackupStart()');
  await new Promise(r => setTimeout(r, 5));
  const p3 = c.run('teacherBackupStart()');
  ok(c.els['t-backup-btn'].disabled === true, 'the button is disabled while it reads');
  await Promise.all([p1, p2, p3]);
  ok(c.saved.length === 1 && c.st.reads.filter(p => p === 'config/class').length === 1 && state(c).kind === 'saved', `three clicks → files ${c.saved.length}, config reads ${c.st.reads.filter(p => p === 'config/class').length}`);
}

/* ══ 6. Leaving Manage mid-read ══ */
console.log('\n6. Leaving Manage mid-read');
{
  const S = makeStore({ students: 300 });
  const c = makeConsole(S);
  let flippedAt = 0;
  c.st.hooks.push((n, path) => { if(!flippedAt && /\/weeks$/.test(path) && c.st.reads.filter(p => /\/weeks$/.test(p)).length === 87){ flippedAt = n; c.setView('students'); } });
  await c.run('teacherBackupStart()');
  const s = state(c);
  const after = c.st.reads.length - flippedAt;
  ok(s.kind === 'stopped' && c.saved.length === 0 && !c.store.has('gc-teacher-backup-last'), `${s.kind}, files ${c.saved.length} — "${s.text}"`);
  ok(after <= 0, `reads started after leaving: ${after} (the read in flight when the view changed is the last)`);
  c.setView('manage');
  await c.run('teacherBackupStart()');
  ok(state(c).kind === 'saved' && c.saved.length === 1, `back on Manage, a new click saves a whole file (${state(c).kind})`);
  ok(c.st.writes === 0, `write attempts: ${c.st.writes}`);
}

/* ══ 7. The reminder line ══ */
console.log('\n7. "Last backup" line');
{
  const day = 86400000;
  const cases = [['never', null, true, /No backup has been downloaded/], ['today', NOW - 3600000, false, /Last backup: today\.$/],
    ['3 days', NOW - 3 * day, false, /Last backup: 3 days ago\.$/], ['7 days', NOW - 7 * day, false, /Last backup: 7 days ago\.$/],
    ['8 days', NOW - 8 * day, true, /Last backup: 8 days ago\. Time to download a new one\./], ['1 day', NOW - day, false, /1 day ago\.$/]];
  for(const [label, at, due, re] of cases){
    const c = makeConsole(makeStore({ students: 1 }), { ls: at == null ? {} : { 'gc-teacher-backup-last': String(at) } });
    const r = c.run(`teacherBackupLastLine(${NOW})`);
    ok(r.due === due && re.test(r.text), `${label}: due ${r.due} — "${r.text}"`);
  }
  const c = makeConsole(makeStore({ students: 1 }), { ls: { 'gc-teacher-backup-last': 'garbage' } });
  ok(c.run(`teacherBackupLastLine(${NOW})`).due === true, 'an unreadable stored date counts as never');
  const c2 = makeConsole(makeStore({ students: 1 }));
  c2.ctx.localStorage = { getItem(){ throw new Error('blocked'); }, setItem(){ throw new Error('blocked'); } };
  ok(c2.run(`teacherBackupLastLine(${NOW})`).due === true, 'localStorage that throws counts as never (no exception)');
}

console.log(fails ? `\nbackup-proof: ✗ ${fails} check(s) failed` : '\nbackup-proof: ✓ every check held');
process.exit(fails ? 1 : 0);
