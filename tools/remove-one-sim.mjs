#!/usr/bin/env node
/* remove-one-sim.mjs — the console's "Start this student over…" and "Delete this student's data…" (teacher-remove.js)
   run against a stub Firestore (2026-11-14).

     node tools/remove-one-sim.mjs                 every case below; exit 0 = all held, 1 = a ✗ line
     node tools/remove-one-sim.mjs --root DIR      another site folder (a scratch copy with a planted fault)

   WHAT IS REAL. teacher-remove.js exactly as it ships, run in a Node vm context with the console's own
   teacher-config.js (loadTeacherClassConfig, teacherWriteConfig: the config/class read and the one writer, with its
   transaction and cell check), teacher-backup.js (the encoder and the date the download reuses), and, extracted
   unmodified: escHtml / escAttr (app/boot.js), teacherMicSaveFile (teacher-mic.js),
   teacherPmWeeksGet and teacherAbsDaysGet (teacher-students.js, the console's two minutes reads). Each part must be
   in the console script (tools/site-src.mjs), teacher-remove.js after teacher-backup.js.
   STUBBED: Firestore (a flat map of doc paths → fields: doc get / set {merge} with FieldValue.delete() / update /
   delete, collection get, where('uid','==',x), where(documentId, '>=' / '<='), batch, runTransaction), the saved file
   (an <a> whose click records the Blob), alert. Made-up data only: three students "Test 0", "Test 1", "Test 2".

   WHAT IT CHECKS (each line prints its denominator):
     counts     the dialog's list for a student with data of every kind: each kind's count and words
     delete     everything ticked goes: every path of that student's (problem reports excepted, said as kept), the
                student's cells in config/class, the allow-list key; the delete marker is written; the other two
                students' documents, config/access's other keys and config/class's other cells are byte-identical
                (the whole store compared); the ONLY write to progress/ is one delete of that student's doc, the last write
     untick     recordings unticked: the recordings are byte-identical, the rest is gone
     failure    a planted failure at the third kind (song requests): "done 2 of 7, failed at Song requests", the
                kinds before it gone, it and every kind after it untouched, no marker; read again and run again → done
     start over one write, the progressStartOver marker in config/class; nothing else in the store changes; no
                write to progress/, minutes/ or anything else
     download   one file, nothing written; it decodes back to that student's documents (N of N)
     confirm    the typed name: exact, other case, extra spaces → yes; another name, a part of it, empty → no
     escape     a hostile student name is escaped in every dialog the console draws
     status     Manage's line from the roster and config/class: "Started over <date>" (+ "not applied yet"), "Deleted <date> ·
                has a record again"; the dialogs' warning and backup sentences */
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { siteParts, siteSource } from './site-src.mjs';

const args = process.argv.slice(2);
const argOf = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const ROOT = resolve(argOf('--root') || join(dirname(fileURLToPath(import.meta.url)), '..'));
let fails = 0, passes = 0;
const ok = (cond, line) => { console.log((cond ? '  ✓ ' : '  ✗ ') + line); if(cond) passes++; else fails++; return cond; };

/* ── The real code ── */
const parts = siteParts('teacher.js', ROOT);
ok(parts.includes('teacher-remove.js') && parts.indexOf('teacher-remove.js') > parts.indexOf('teacher-backup.js') && parts.includes('teacher-config.js'),
  `teacher-remove.js is a console part after teacher-backup.js (${parts.length} parts)`);
const APP = siteSource('app.js', ROOT), CONSOLE = siteSource('teacher.js', ROOT);
function extractFn(src, name){
  const re = new RegExp('(?:^|\\n)((?:async )?function ' + name + '\\()');
  const m = re.exec(src); if(!m) throw new Error('not found: function ' + name);
  let i = src.indexOf('{', m.index + m[0].length), depth = 0, j = i;
  for(; j < src.length; j++){ if(src[j] === '{') depth++; else if(src[j] === '}'){ depth--; if(!depth) break; } }
  return src.slice(m.index, j + 1).trim();
}
const lineOf = (src, start) => { const l = src.split('\n').find(x => x.startsWith(start)); if(!l) throw new Error('not found: ' + start); return l; };
const HELPERS = [lineOf(APP, 'const escHtml = '), lineOf(APP, 'const escAttr = '),
  extractFn(CONSOLE, 'teacherMicSaveFile'), extractFn(CONSOLE, 'teacherPmWeeksGet'), extractFn(CONSOLE, 'teacherAbsDaysGet')].join('\n');
const SRC = f => readFileSync(join(ROOT, f), 'utf8');

/* ── Stub Firestore ── */
const DEL = { __del: true };
const clone = v => v === undefined ? undefined : JSON.parse(JSON.stringify(v));
const canon = v => (v === null || typeof v !== 'object') ? JSON.stringify(v) : Array.isArray(v) ? '[' + v.map(canon).join(',') + ']'
  : '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
function mergeInto(dst, src){
  for(const k of Object.keys(src)){
    const v = src[k];
    if(v === DEL){ delete dst[k]; continue; }
    // An EMPTY map in a merge replaces the stored map in Firestore (app/save.js flushSave says so; review R3-6).
    if(v && typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length){ dst[k] = {}; continue; }
    if(v && typeof v === 'object' && !Array.isArray(v)){ if(!dst[k] || typeof dst[k] !== 'object' || Array.isArray(dst[k])) dst[k] = {}; mergeInto(dst[k], v); }
    else dst[k] = clone(v);
  }
  return dst;
}
const strip = v => { if(v === DEL) throw new Error('stub: delete sentinel outside a merge'); if(v && typeof v === 'object' && !Array.isArray(v)){ const o = {}; for(const k of Object.keys(v)) o[k] = strip(v[k]); return o; } return clone(v); };
function makeDb(S, plan){
  const log = [];          // every write: {op, path}
  const failed = new Set();
  const failIf = (op, path) => {
    for(const f of plan.fail || []){
      if(path.startsWith(f.prefix) && (!f.op || f.op === op) && !(f.once && failed.has(f.prefix))){ failed.add(f.prefix); const e = new Error('planted failure'); e.code = 'unavailable'; throw e; }
    }
  };
  const snap = path => ({ id: path.split('/').pop(), exists: S.has(path), data: () => clone(S.get(path)), ref: ref(path) });
  const apply = (op, path, data, opts) => {
    log.push({ op, path });
    if(op === 'delete') S.delete(path);
    else if(op === 'set') S.set(path, opts && opts.merge ? mergeInto(clone(S.get(path)) || {}, data) : strip(data));
    else if(op === 'update'){ if(!S.has(path)) throw new Error('NOT_FOUND ' + path); const cur = clone(S.get(path)); for(const k of Object.keys(data)){ if(data[k] === DEL) delete cur[k]; else cur[k] = strip(data[k]); } S.set(path, cur); }
  };
  function ref(path){
    return { path, id: path.split('/').pop(),
      get: async () => snap(path),
      set: async (d, o) => { failIf('set', path); apply('set', path, d, o); },
      update: async d => { failIf('update', path); apply('update', path, d); },
      delete: async () => { failIf('delete', path); apply('delete', path); },
      collection: sub => coll(path + '/' + sub) };
  }
  function coll(path, filters = []){
    const depth = path.split('/').length + 1;
    return {
      doc: id => ref(path + '/' + id),
      where: (f, op, v) => coll(path, filters.concat([[f, op, v]])),
      get: async () => {
        const docs = [...S.keys()].filter(k => k.startsWith(path + '/') && k.split('/').length === depth).sort().filter(k => filters.every(([f, op, v]) => {
          const x = f === '__name__' ? k.split('/').pop() : (S.get(k) || {})[f];
          return op === '==' ? x === v : op === '>=' ? x >= v : op === '<=' ? x <= v : false;
        })).map(snap);
        return { docs, size: docs.length, empty: !docs.length, forEach: fn => docs.forEach(fn) };
      },
    };
  }
  const db = {
    collection: p => coll(p),
    batch: () => { const ops = []; return { delete: r => ops.push(['delete', r.path]), set: (r, d, o) => ops.push(['set', r.path, d, o]), update: (r, d) => ops.push(['update', r.path, d]),
      commit: async () => { for(const [op, p] of ops) failIf(op, p); ops.forEach(([op, p, d, o]) => apply(op, p, d, o)); } }; },
    runTransaction: async fn => { const ops = []; await fn({ get: async r => snap(r.path), set: (r, d, o) => ops.push(['set', r.path, d, o]), update: (r, d) => ops.push(['update', r.path, d]), delete: r => ops.push(['delete', r.path]) });
      for(const [op, p] of ops) failIf(op, p); ops.forEach(([op, p, d, o]) => apply(op, p, d, o)); },
  };
  return { db, log };
}

/* ── The class: three made-up students, one with data of every kind ── */
const U = ['test-uid-0', 'test-uid-1', 'test-uid-2'];
function makeStore(name0){
  const S = new Map();
  U.forEach((u, i) => {
    S.set('progress/' + u, { name: i === 0 && name0 ? name0 : 'Test ' + i, email: `test${i}@example.test`, period: i ? '7' : '4', migrations: { swap45: true },
      completed: { 'm1w1-b-sec0-0': true, 'm1w1-b-sec0-1': true, 'm1w1-b-sec1-0': true }, responses: { 'm1w1-b-sec0-2': 'Answer ' + i, 'm1w1-b-sec0-3': 'E' },
      skills: { 'm1w1-s1': 'gotit', 'mr1': '2' }, classActivities: { 'ca-1': true }, exitChecks: { 'ca-14': { score: 3, total: 4 } },
      songReady: { 'the-cure': { 1: true } }, songReadyAt: { 'the-cure': 1 }, practiceLog: { 'm1w1-s1': { reps: 4 } }, games: { dk: { x: 3 } }, streak: { count: 2, lastDay: '2026-11-13' } });
    S.set(`minutes/${u}/days/2026-11-12`, { seconds: 300 + i }); S.set(`minutes/${u}/days/2026-11-13`, { seconds: 120 });
    S.set(`minutes/${u}/weeks/2026-W45`, { seconds: 900, goalSeconds: 3600, hit: false }); S.set(`minutes/${u}/weeks/2026-W46`, { seconds: 420, goalSeconds: 3600, hit: false });
    S.set(`minutes/${u}/meta/board`, { id: String(i).repeat(32) });
    S.set(`micTakes/${u}-coach`, { uid: u, mode: 'coach', chunks: 2 }); S.set(`micTakes/${u}-coach/chunks/0`, { i: 0, pcm: 'AAEC' }); S.set(`micTakes/${u}-coach/chunks/1`, { i: 1, pcm: 'AwQF' });
    S.set(`micTakes/${u}-nr`, { uid: u, mode: 'nr', chunks: 1 }); S.set(`micTakes/${u}-nr/chunks/0`, { i: 0, pcm: 'BgcI' });
    S.set(`songRequests/${u}_2026-W45`, { uid: u, title: 'Song A', state: 'asked' }); S.set(`songRequests/${u}_2026-W46`, { uid: u, title: 'Song B', state: 'adding' });
    S.set(`issueReports/rep-${i}`, { uid: u, message: 'Broken ' + i });
    S.set(`accessRequests/${u}`, { name: 'Test ' + i, email: `test${i}@example.test`, status: 'allowed' });
    S.set(`liveQuiz/current/answers/${u}`, { uid: u, choice: 'A' });
  });
  S.set('liveQuiz/current', { state: 'lobby', scores: {} });
  S.set('config/access', { allow: { [U[0]]: true, [U[1]]: true, 'other-outside': true } });
  S.set('config/class', { configVersion: 7, gamesEnabled: true, activityDates: { 'ca-1': '2026-11-10' },
    paused: { [U[0]]: true, [U[2]]: true }, archived: { [U[0]]: true }, periodOverrides: { [U[0]]: 'CAS', [U[1]]: '4' },
    moduleOpenThrough: { [U[0]]: 5 }, gameOverrides: { [U[0]]: false, [U[1]]: true }, activityClears: { [U[0]]: { 'ca-1': true, 'ca-2': true }, [U[1]]: { 'ca-1': true } },
    activityStudents: { 'ca-5': { [U[0]]: true, [U[1]]: true }, 'ca-6': { [U[2]]: true } } });
  return S;
}
const pathsOf = (S, uid) => [...S.keys()].filter(k => k.includes(uid)).sort();

function makeConsole(S, plan = {}){
  const { db, log } = makeDb(S, plan);
  const saved = [], alerts = [];
  const ctx = { console, setTimeout, clearTimeout, Promise, Blob: globalThis.Blob, Date, Math, JSON,
    alert: m => alerts.push(String(m)),
    URL: { createObjectURL: blob => { saved.push({ blob }); return 'blob:' + saved.length; }, revokeObjectURL(){} },
    document: { createElement: () => ({ click(){ const l = saved[saved.length - 1]; if(l) l.name = this.download; }, remove(){} }), body: { appendChild(){} }, getElementById: () => null, querySelector: () => null },
    localStorage: { getItem: () => null, setItem(){}, removeItem(){} },
    firebase: { firestore: { FieldValue: { delete: () => DEL }, FieldPath: { documentId: () => '__name__' } }, app: () => ({ options: {} }) } };
  vm.createContext(ctx);
  vm.runInContext(HELPERS + '\nlet db = null; let teacherView = "manage"; let allStudentsRaw = [];\nasync function ensureDb(){ return db; }\nfunction renderTeacherBody(){}\nfunction renderTeacherManage(){}\n', ctx, { filename: 'helpers.js' });
  for(const f of ['teacher-config.js', 'teacher-backup.js', 'teacher-remove.js']) vm.runInContext(SRC(f), ctx, { filename: f });
  ctx.__db = db; vm.runInContext('db = __db;', ctx);
  const run = code => vm.runInContext(code, ctx);
  return { ctx, log, saved, alerts, run, fn: n => run(n) };
}
const ALL = { minutes: true, recordings: true, songRequests: true, join: true, live: true, settings: true, progress: true };
/* Everything but the target student's cells, the marker and the version: config/class must be byte-identical there. */
function cfgOthers(cfg, uid){
  const c = clone(cfg); delete c.configVersion; delete c.progressDeleted; delete c.progressStartOver;
  ['paused', 'archived', 'periodOverrides', 'moduleOpenThrough', 'gameOverrides', 'activityClears'].forEach(f => { if(c[f]) delete c[f][uid]; });
  Object.values(c.activityStudents || {}).forEach(m => delete m[uid]);
  return canon(c);
}
function othersSame(before, after, uid, label){
  let n = 0, bad = [];
  for(const [k, v] of before){
    if(k.includes(uid) || k === 'config/class' || k === 'config/access') continue;
    n++;
    if(!after.has(k) || canon(after.get(k)) !== canon(v)) bad.push(k);
  }
  for(const k of after.keys()) if(!before.has(k) && !k.includes(uid) && k !== 'config/class') bad.push('new ' + k);
  ok(!bad.length, `${label}: the other students' documents are byte-identical (${n - bad.length} of ${n})${bad.length ? ': ' + bad.slice(0, 4).join(', ') : ''}`);
  ok(cfgOthers(before.get('config/class'), uid) === cfgOthers(after.get('config/class'), uid), `${label}: config/class is byte-identical apart from this student's cells, the marker and the version`);
  const accB = clone(before.get('config/access')), accA = clone(after.get('config/access')); delete accB.allow[uid]; if(accA) delete accA.allow[uid];
  ok(canon(accB) === canon(accA), `${label}: config/access's other keys are byte-identical`);
}

/* ── counts ── */
console.log('counts');
{
  const S = makeStore(), c = makeConsole(S);
  const inv = await c.fn('teacherRemoveRead')(U[0]);
  const L = c.fn('trmKindLines')(inv, U[0]);
  const want = { progress: 1, minutes: 4, recordings: 2, songRequests: 2, join: 2, live: 1, settings: 7 };
  const got = Object.keys(want).filter(k => L[k] && L[k].n === want[k]);
  ok(got.length === 7, `each kind's count for Test 0 (${got.length} of 7): ${Object.keys(want).map(k => k + '=' + (L[k] && L[k].n)).join(' ')}`);
  ok(/3 steps done, 2 answers, 2 ratings and got-its, 1 in-class activity, 1 exit check/.test(L.progress.text), 'saved work: ' + L.progress.text);
  ok(/2 days and 2 weeks/.test(L.minutes.text) && /2 recordings \(3 audio pieces\)/.test(L.recordings.text) && /2 song requests/.test(L.songRequests.text), `minutes, recordings, requests: ${L.minutes.text} · ${L.recordings.text} · ${L.songRequests.text}`);
  ok(/paused/.test(L.settings.text) && /archived/.test(L.settings.text) && /\(CAS\)/.test(L.settings.text) && /Module 5/.test(L.settings.text) && /games off/.test(L.settings.text) && /2 activity clears/.test(L.settings.text) && /1 individual card/.test(L.settings.text), 'settings: ' + L.settings.text);
  ok(inv.reports.length === 1, `problem reports read and kept: ${inv.reports.length} of 1`);
  ok(c.log.length === 0, `reading wrote nothing (${c.log.length} writes)`);
}

/* ── delete everything ── */
console.log('delete');
{
  const S = makeStore(), before = new Map([...S].map(([k, v]) => [k, clone(v)])), c = makeConsole(S);
  const inv = await c.fn('teacherRemoveRead')(U[0]);
  const r = await c.fn('teacherRemoveRun')(U[0], inv, ALL);
  ok(r.ok && r.done === 7 && r.total === 7, 'result: ' + r.text);
  const left = pathsOf(S, U[0]);
  ok(!left.length, `no path names Test 0 any more (left: ${left.join(', ') || 'none'})`);
  ok(S.has('issueReports/rep-0') && canon(S.get('issueReports/rep-0')) === canon(before.get('issueReports/rep-0')), "Test 0's problem report is kept, byte-identical (nobody may delete one)");
  const cfg = S.get('config/class');
  ok(!(U[0] in (cfg.paused || {})) && !(U[0] in (cfg.archived || {})) && !(U[0] in (cfg.periodOverrides || {})) && !(U[0] in (cfg.moduleOpenThrough || {}))
    && !(U[0] in (cfg.gameOverrides || {})) && !(U[0] in (cfg.activityClears || {})) && !(U[0] in (cfg.activityStudents['ca-5'] || {})), "Test 0's 7 cells in config/class removed");
  ok(Number(cfg.progressDeleted && cfg.progressDeleted[U[0]]) > 0 && Object.keys(cfg.progressDeleted).length === 1, `the delete marker: progressDeleted holds one uid and a time (${JSON.stringify(cfg.progressDeleted)})`);
  ok(!(U[0] in S.get('config/access').allow), 'the allow-list key removed');
  othersSame(before, S, U[0], 'delete');
  const prog = c.log.filter(w => w.path.startsWith('progress/'));
  ok(prog.length === 1 && prog[0].op === 'delete' && prog[0].path === 'progress/' + U[0] && c.log[c.log.length - 1] === prog[0],
    `the only write to progress/ is one delete of Test 0's doc, the last write (${prog.length} progress writes of ${c.log.length})`);
  const order = []; c.log.forEach(w => { const k = w.path.split('/')[0]; if(order[order.length - 1] !== k) order.push(k); });
  ok(order.join(' ') === 'minutes micTakes songRequests accessRequests config liveQuiz config progress', 'the order: ' + order.join(' → '));
  const chunkFirst = ['coach', 'nr'].every(m => c.log.findIndex(w => w.path.startsWith(`micTakes/${U[0]}-${m}/chunks/`)) < c.log.findIndex(w => w.path === `micTakes/${U[0]}-${m}`));
  ok(chunkFirst, 'each recording\'s audio pieces go before the take');
}

/* ── untick recordings ── */
console.log('untick');
{
  const S = makeStore(), before = new Map([...S].map(([k, v]) => [k, clone(v)])), c = makeConsole(S);
  const inv = await c.fn('teacherRemoveRead')(U[0]);
  const r = await c.fn('teacherRemoveRun')(U[0], inv, { ...ALL, recordings: false });
  ok(r.ok && r.total === 6, 'result: ' + r.text);
  const takes = [...before.keys()].filter(k => k.startsWith(`micTakes/${U[0]}`));
  const same = takes.filter(k => S.has(k) && canon(S.get(k)) === canon(before.get(k)));
  ok(takes.length === 5 && same.length === 5, `the recordings are byte-identical (${same.length} of ${takes.length} docs)`);
  const rest = pathsOf(S, U[0]).filter(k => !k.startsWith('micTakes/'));
  ok(!rest.length, `everything else of Test 0's is gone (${rest.length} left)`);
  othersSame(before, S, U[0], 'untick');
}

/* ── a planted failure at the third kind ── */
console.log('failure');
{
  const S = makeStore(), before = new Map([...S].map(([k, v]) => [k, clone(v)])), c = makeConsole(S, { fail: [{ prefix: 'songRequests/', op: 'delete' }] });
  const inv = await c.fn('teacherRemoveRead')(U[0]);
  const r = await c.fn('teacherRemoveRun')(U[0], inv, ALL);
  ok(!r.ok && r.done === 2 && r.total === 7 && r.at === 'Song requests' && /done 2 of 7 kinds, failed at Song requests/.test(r.text), 'result: ' + r.text);
  ok(!pathsOf(S, U[0]).some(k => k.startsWith('minutes/') || k.startsWith('micTakes/')), 'the two kinds before it are gone');
  const untouched = [...before.keys()].filter(k => k.includes(U[0]) && !k.startsWith('minutes/') && !k.startsWith('micTakes/'));
  const same = untouched.filter(k => S.has(k) && canon(S.get(k)) === canon(before.get(k)));
  ok(same.length === untouched.length, `it and every kind after it untouched (${same.length} of ${untouched.length} docs)`);
  ok(cfgOthers(before.get('config/class'), '-') === cfgOthers(S.get('config/class'), '-'), 'config/class untouched: no cells removed, no marker');
  ok(U[0] in S.get('config/access').allow, 'the allow-list key still there');
  // Read again and run again, the failure gone.
  const c2 = makeConsole(S);
  const inv2 = await c2.fn('teacherRemoveRead')(U[0]);
  const L2 = c2.fn('trmKindLines')(inv2, U[0]);
  const ticks = {}; Object.keys(ALL).forEach(k => { ticks[k] = L2[k].n > 0; });
  ok(!ticks.minutes && !ticks.recordings && ticks.songRequests && ticks.progress, `the second read ticks only what is left (${Object.keys(ticks).filter(k => ticks[k]).join(', ')})`);
  const r2 = await c2.fn('teacherRemoveRun')(U[0], inv2, ticks);
  ok(r2.ok && r2.done === 5, 'the re-run: ' + r2.text);
  ok(!pathsOf(S, U[0]).length, `after the re-run nothing of Test 0's is left (${pathsOf(S, U[0]).length})`);
  othersSame(before, S, U[0], 'failure + re-run');
}

/* ── start over ── */
console.log('start over');
{
  const S = makeStore(), before = new Map([...S].map(([k, v]) => [k, clone(v)])), c = makeConsole(S);
  const at = await c.fn('trmWriteMarker')('progressStartOver', U[0]);
  ok(c.log.length === 1 && c.log[0].path === 'config/class' && c.log[0].op === 'set', `one write, to config/class (${c.log.map(w => w.op + ' ' + w.path).join(', ')})`);
  ok(S.get('config/class').progressStartOver[U[0]] === at && Object.keys(S.get('config/class').progressStartOver).length === 1, 'the marker: progressStartOver holds one uid and a time');
  const changed = [...before.keys()].filter(k => k !== 'config/class' && canon(S.get(k)) !== canon(before.get(k)));
  ok(!changed.length, `every other document is byte-identical, Test 0's progress and minutes included (${before.size - 1 - changed.length} of ${before.size - 1})`);
  const cb = clone(before.get('config/class')), ca = clone(S.get('config/class')); delete cb.configVersion; delete ca.configVersion; delete ca.progressStartOver;
  ok(canon(cb) === canon(ca), "config/class: only the marker and the version moved");
  const later = await c.fn('trmWriteMarker')('progressStartOver', U[0]);
  ok(later > at, `a second Start over writes a later time (${later} > ${at})`);
}

/* ── the download ── */
console.log('download');
{
  const S = makeStore(), c = makeConsole(S);
  const inv = await c.fn('teacherRemoveRead')(U[0]);
  await c.fn('teacherRemoveDownload')(U[0], inv);
  ok(c.saved.length === 1 && /^guitar-class-student-test-uid-\d{4}-\d{2}-\d{2}\.json$/.test(c.saved[0].name || ''), `one file saved (${c.saved.map(s => s.name).join(', ')})`);
  ok(c.log.length === 0, `nothing written (${c.log.length} writes)`);
  const f = JSON.parse(await c.saved[0].blob.text()), col = f.collections;
  const dec = c.fn('teacherBackupDecode');
  const checks = [
    ['progress', canon(dec(col.progress[U[0]])) === canon(S.get('progress/' + U[0]))],
    ['2 days', Object.keys(col.minutesDays).length === 2 && canon(dec(col.minutesDays['2026-11-12'])) === canon(S.get(`minutes/${U[0]}/days/2026-11-12`))],
    ['2 weeks', Object.keys(col.minutesWeeks).length === 2],
    ['2 takes, 3 pieces', Object.keys(col.micTakes).length === 2 && Object.keys(col.micTakes[U[0] + '-coach'].chunks).length === 2 && Object.keys(col.micTakes[U[0] + '-nr'].chunks).length === 1],
    ['2 song requests', Object.keys(col.songRequests).length === 2],
    ['1 problem report', Object.keys(col.issueReports).length === 1],
    ['the request to join', !!col.accessRequest && col.allowListed === true],
    ['the live answer', !!col.liveQuizAnswer],
    ['7 config/class cells', Object.keys(col.configClassCells).length === 7],
    ['no other student', !JSON.stringify(f).includes(U[1]) && !JSON.stringify(f).includes(U[2])],
  ];
  const good = checks.filter(x => x[1]);
  ok(good.length === checks.length, `the file decodes back to Test 0's documents (${good.length} of ${checks.length})${good.length < checks.length ? ': missing ' + checks.filter(x => !x[1]).map(x => x[0]).join(', ') : ''}`);
}

/* ── the typed name, escaping, the waiting line ── */
console.log('confirm, escape, status');
{
  const S = makeStore('<img src=x onerror=alert(1)> O\'Brien "Q"'), c = makeConsole(S);
  c.run(`trm = {uid:'${U[0]}', name:'Test Zero', mode:'delete', phase:'ready', ticks:{}, typed:''}`);
  const cases = [['Test Zero', true], ['test zero', true], ['  Test   Zero ', true], ['Test Zer', false], ['Test One', false], ['', false]];
  const right = cases.filter(([t, want]) => { c.run(`trm.typed = ${JSON.stringify(t)}`); return c.fn('trmConfirmed')() === want; });
  ok(right.length === cases.length, `the typed name (${right.length} of ${cases.length} cases)`);
  const inv = await c.fn('teacherRemoveRead')(U[0]);
  c.ctx.__inv = inv;
  const name = S.get('progress/' + U[0]).name;
  let raw = 0, shown = 0;
  for(const [mode, phase] of [['menu', 'idle'], ['delete', 'ready'], ['over', 'ready'], ['delete', 'running'], ['delete', 'done'], ['over', 'done']]){
    c.run(`trm = {uid:'${U[0]}', name:${JSON.stringify(name)}, mode:'${mode}', phase:'${phase}', inv:__inv, ticks:{progress:true}, typed:'', result:{ok:true,text:'Done.'}}`);
    const html = c.fn('trmBodyHtml')();
    shown++; if(html.includes('<img')) raw++;
  }
  ok(raw === 0, `a hostile name is escaped in every dialog (${shown - raw} of ${shown})`);
  const stA = (applied, over, del) => c.fn('teacherRemoveStatusHtml')({ uid: U[0], startOverApplied: applied }, { progressStartOver: over ? { [U[0]]: over } : {}, progressDeleted: del ? { [U[0]]: del } : {} });
  const W = [
    [s => /Started over/.test(s) && /not applied yet \(it happens at their next sign-in on the main site\)/.test(s), stA(0, 1000, 0)],
    [s => /Started over/.test(s) && /not applied yet/.test(s), stA(500, 1000, 0)],
    [s => /Started over/.test(s) && !/not applied yet/.test(s), stA(1000, 1000, 0)],
    [s => /Deleted .* · has a record again/.test(s) && !/Started over/.test(s), stA(0, 0, 2000)],
    [s => /Deleted/.test(s) && !/Started over/.test(s), stA(0, 1000, 2000)],   // a later Delete replaces the Start over (review R3-1)
    [s => /Deleted/.test(s) && /Started over .* · not applied yet/.test(s), stA(0, 3000, 2000)],   // a Start over pressed after the Delete still shows
    [s => s === '', stA(0, 0, 0)],
  ];
  ok(W.every(([f, h]) => f(h)), `Manage's status from what it already loads: "Started over <date>" (+ "not applied yet" while startOverApplied is older or absent), "Deleted <date> · has a record again", nothing without a marker (${W.filter(([f, h]) => f(h)).length} of ${W.length})`);
}

/* ── the warnings and the name fallback ── */
console.log('warnings, names');
{
  const S = makeStore(), c = makeConsole(S);
  const inv = await c.fn('teacherRemoveRead')(U[0]);
  c.ctx.__inv = inv;
  c.run(`trm = {uid:'${U[0]}', name:'Test 0', mode:'delete', phase:'ready', inv:__inv, ticks:{progress:true}, typed:''}`);
  const hd = c.fn('trmBodyHtml')();
  c.run(`trm.mode = 'over'`);
  const ho = c.fn('trmBodyHtml')();
  const WARN = 'Do this when the student is not using the site.</strong> A page they already have open keeps its old copy and saves it again; if their work comes back, press this again.';
  ok(hd.includes(WARN) && ho.includes(WARN) && hd.indexOf(WARN) < hd.indexOf('trm-typed') && ho.indexOf(WARN) < ho.indexOf('trm-typed'), 'both dialogs say, above the typed name: do this when the student is not using the site; an open page saves its old copy again; press this again');
  ok([hd, ho].every(h => /one stolen teacher sign-in could delete every student in seconds/.test(h) && /Download a backup first/.test(h) && /this page cannot put a student back/.test(h)), 'both dialogs: a backup first is the only protection, and this page cannot put a student back');
  ok(!/Last saved/.test(hd + ho), 'no "Last saved" line (the console has no trustworthy last-activity value)');
  ok(/sign in on the main site/.test(ho) && /Song Journey page on its own does not do it/.test(ho), 'Start over says it happens at their next sign-in on the main site, not on a Song Journey page alone');
  ok(c.fn('trmNameOf')({ uid: 'x-uid', name: '', email: '' }) === 'x-uid' && c.fn('trmNameOf')({ uid: 'x', name: '', email: 'e@x.test' }) === 'e@x.test', 'a row with no name confirms with its email, or its uid');
}

console.log(`remove-one-sim: ${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
