#!/usr/bin/env node
/* site-errors-sim.mjs — the anonymous error log (2026-11-13), proved in Node.

   Runs the REAL code, no copy:
     * the logger: app/boot.js from "/* ── Error log (2026-11-13)" up to "/* ── Offline banner ──" (SITE_ERRORS
       and the safety net's two listeners, banner included), read through tools/site-src.mjs;
     * the console view: teacher-errors.js, with the real escHtml / escAttr lines from app/boot.js;
   each in a vm with a stub window, document, Cache API, Firebase auth, a stub Firestore and a virtual clock.

   What it proves, case by case (each prints ✓ or ✗):
     the exact doc for an `error` and for an `unhandledrejection`; every written doc passes a mirror of the
     siteErrors rule PARSED FROM firestore.rules (field list, types, caps), so the client and the rules
     cannot drift apart unseen; at most 5 writes per page load; the same message once; nothing written and
     nothing thrown when Firestore is missing, nobody is signed in, or the write is refused (rules not
     published: exactly ONE refused write, then silence); the queue waits for sign-in and is dropped after
     10 minutes; the stripping (emails, %40 emails, uid-like and Firestore ids, query strings, 6+ digit runs,
     the signed-in account's own name (only as written: a student named Max leaves Math.max alone), email and
     uid, before the 300-character cut too, a 5,000-character message); no written field ever holds a lone
     surrogate (half an emoji: Firestore retries such a write for ever and the progress save waits behind it);
     a doc the rules would refuse (a device clock in the year 10000) is dropped, not sent; a repeat returns
     before any scrubbing; the ResizeObserver note not logged and no banner for it; the banner before the
     logger; a logger whose parts throw never throws, never loops and leaves no unhandled rejection; the banner
     shows exactly as before. And the console view: empty state, rules not published (also when it lands after
     the teacher left the view), grouping and day counts, escaping of hostile values, docs dated after the
     latest day the rules accept hidden and counted, the "more than 1000" note only when more exist, delete
     older than 30 days (a doc ON the cutoff stays) and of the impossible dates.
   Review round 2 (2026-11-13): name words split on anything not a letter or digit, a single name word
     scrubbed only at 5+ letters and never when it is on NOT_NAMES, the email local part only at 5+
     characters or with a digit, no [[user]], NFC and accent marks; no half name left when the cut came
     before sign-in (offsets 286..299); a field that grows at the send-time scrub re-cut and sent; an error
     storm of 5,000 changing messages costs nothing after the first 100 and rawSeen stays at 100; control
     characters; and "Send a test entry", the real logger and the real view in one page: works (read back
     from the server), refused (NOT working, the log now off: reload), a failed write, no answer in 20 s, a
     failed or empty read-back, the 5 entries already used, a clock fits() refuses: never a false "works".

   Review round 3: the unfinished word goes only from a field really cut, at most 40 letters ("Loading…",
     400 letters, 400 CJK, a long file); the test's read-back compared field by field; the logger already off
     after a refused entry answers "NOT working".

   --faults plants 39 faults (one at a time, in memory) and shows each turns at least one case red.

   Usage:  node tools/site-errors-sim.mjs [--faults] [--root <site folder>] [--verbose]
   Exit 0 = every case passed (and, with --faults, every fault was caught). Node 18+, no dependencies.
   Last run: 2026-11-13 (review round 3 fixes), 161 passed, 0 failed; 39 of 39 planted faults caught.
   checks.mjs 1de runs it (no flags) on every check and fails on a non-zero exit; run it with --faults after
   any change to SITE_ERRORS, the safety net's listeners, teacher-errors.js or the siteErrors rules. */
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteSource } from './site-src.mjs';

const ARGV = process.argv.slice(2);
const opt = k => { const i = ARGV.indexOf('--' + k); return i < 0 ? null : (ARGV[i + 1] || ''); };
const ROOT = opt('root') ? resolve(opt('root')) : join(dirname(fileURLToPath(import.meta.url)), '..');
const VERBOSE = ARGV.includes('--verbose');

const APP = siteSource('app.js', ROOT);
const L0 = APP.indexOf('/* ── Error log (2026-11-13)'), L1 = APP.indexOf('/* ── Offline banner ──');
if (L0 < 0 || L1 < L0) { console.error('site-errors-sim: cannot find the error log block in app/boot.js (markers moved?)'); process.exit(2); }
const LOGGER = APP.slice(L0, L1);
const ESC = (APP.match(/^const escAttr = .*$/m) || [''])[0] + '\n' + (APP.match(/^const escHtml = .*$/m) || [''])[0];
if (!/escAttr/.test(ESC) || !/escHtml/.test(ESC)) { console.error('site-errors-sim: escHtml / escAttr not found in the app'); process.exit(2); }
const VIEW = readFileSync(join(ROOT, 'teacher-errors.js'), 'utf8');
/* The console's real list of views with no Refresh bar (teacher-core.js), so a view that drops out of it shows. */
const NO_BAR = (/^const TEACHER_NO_REFRESH_BAR_VIEWS=(\[[^\]]*\]);/m.exec(readFileSync(join(ROOT, 'teacher-core.js'), 'utf8')) || [, 'null'])[1];
if (NO_BAR === 'null') { console.error('site-errors-sim: TEACHER_NO_REFRESH_BAR_VIEWS not found in teacher-core.js'); process.exit(2); }

/* ── A mirror of the siteErrors rule, parsed from firestore.rules (not typed in here) ── */
const RULES = readFileSync(join(ROOT, 'firestore.rules'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const rb = (() => { const i = RULES.indexOf('match /siteErrors/{errorId}'); if (i < 0) return null; let d = 0; for (let k = RULES.indexOf('{', RULES.indexOf('\n', i) - 2); k < RULES.length; k++) { if (RULES[k] === '{') d++; else if (RULES[k] === '}') { d--; if (!d) return RULES.slice(i, k + 1); } } return null; })();
if (!rb) { console.error('site-errors-sim: no siteErrors block in firestore.rules'); process.exit(2); }
const R = {
  only: JSON.parse((/hasOnly\((\[[^\]]*\])\)/.exec(rb) || [, 'null'])[1].replace(/'/g, '"')),
  all: JSON.parse((/hasAll\((\[[^\]]*\])\)/.exec(rb) || [, 'null'])[1].replace(/'/g, '"')),
  caps: Object.fromEntries([...rb.matchAll(/data\.(\w+)\.size\(\) <= (\d+)/g)].map(m => [m[1], +m[2]])),
  strings: [...rb.matchAll(/data\.(\w+) is string/g)].map(m => m[1]),
  ints: [...rb.matchAll(/data\.(\w+) is int/g)].map(m => m[1]),
  intMax: Object.fromEntries([...rb.matchAll(/data\.(\w+) <= (\d+)\n/g)].map(m => [m[1], +m[2]])),
  kinds: JSON.parse((/data\.kind in (\[[^\]]*\])/.exec(rb) || [, 'null'])[1].replace(/'/g, '"')),
  langs: JSON.parse((/data\.lang in (\[[^\]]*\])/.exec(rb) || [, 'null'])[1].replace(/'/g, '"')),
  day: new RegExp((/data\.day\.matches\('([^']*)'\)/.exec(rb) || [, '^$'])[1]),
  dayNear: /&& siteErrorDayNear\(request\.resource\.data\.day\)/.test(rb) && /duration\.value\(1, 'd'\)[\s\S]*duration\.value\(1, 'd'\)/.test(rb),
  createSignedIn: /allow create: if isSignedIn\(\)\n/.test(rb),
};
if (!R.only || !R.all || R.only.length !== 10 || !R.kinds || !R.langs || Object.keys(R.caps).length !== 5 || R.ints.length !== 2 || R.strings.length !== 6 || !R.dayNear || !R.createSignedIn) { console.error('site-errors-sim: could not read the siteErrors rule (fields, caps, 6 string types, kinds, langs, the day window, a create for any signed-in account): ' + JSON.stringify(R)); process.exit(2); }
const LONE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/;
const utcDay = n => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
function rulesRefuse(doc) {
  const why = [];
  const keys = Object.keys(doc).sort();
  if (keys.join() !== [...R.only].sort().join()) why.push('fields ' + keys.join());
  for (const k of R.strings) if (typeof doc[k] !== 'string') why.push(k + ' not a string');
  /* size() in the rules counts UTF-16 units (an emoji is 2), as String.length does. */
  for (const [k, n] of Object.entries(R.caps)) if (typeof doc[k] === 'string' && doc[k].length > n) why.push(`${k} ${doc[k].length} > ${n}`);
  for (const k of R.strings) if (typeof doc[k] === 'string' && LONE.test(doc[k])) why.push(k + ' holds a lone surrogate (Firestore retries it for ever)');
  if (typeof doc.day === 'string' && R.day.test(doc.day) && ![utcDay(-1), utcDay(0), utcDay(1)].includes(doc.day)) why.push('day ' + doc.day + ' not within a day of the UTC date');
  if (typeof doc.message === 'string' && !doc.message.length) why.push('message empty');
  for (const k of R.ints) if (!Number.isInteger(doc[k]) || doc[k] < 0 || doc[k] > (R.intMax[k] || 1e7)) why.push(k + ' not an int in range');
  if (!R.kinds.includes(doc.kind)) why.push('kind ' + doc.kind);
  if (!R.langs.includes(doc.lang)) why.push('lang ' + doc.lang);
  if (!R.day.test(doc.day || '')) why.push('day ' + doc.day);
  return why;
}

const today = (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); })();
const tick = async (n = 6) => { for (let i = 0; i < n; i++) await new Promise(r => setImmediate(r)); };
let unhandled = 0, CURRENT = null;
/* A rejection the logger left unhandled would, in a browser, fire the page's own unhandledrejection
   listener (which calls the logger again): bridge it, so a loop shows up as more writes. */
process.on('unhandledRejection', reason => { unhandled++; if (CURRENT && CURRENT.listeners.unhandledrejection) { try { CURRENT.listeners.unhandledrejection({ reason }); } catch { CURRENT.threw++; } } });

const USER = { uid: 'Xy7Qp2LmN8rT4vW1zA3bC5dE6fG9', email: 'ana.lopez@seq.org', displayName: 'Ana Lopez' };

function makePage(code, o = {}) {
  const clock = { now: 0, seq: 0, timers: [] };
  const p = { writes: [], adds: 0, banners: 0, listeners: {}, consoleErr: 0, consoleWarn: 0, consoleOther: 0, threw: 0, clock, order: [], originReads: 0, wallNow: o.wallNow };
  const el = () => ({ style: {}, setAttribute() {}, append() {}, remove() {}, textContent: '' });
  const ctx = {
    window: { addEventListener: (t, fn) => { p.listeners[t] = fn; } },
    document: { createElement: el, body: { appendChild: () => { p.banners++; p.order.push('banner'); } }, documentElement: { appendChild: () => { p.banners++; p.order.push('banner'); } } },
    console: { error: () => { p.consoleErr++; }, warn: () => { p.consoleWarn++; }, log: () => { p.consoleOther++; }, info: () => { p.consoleOther++; } },
    t: k => k,
    setTimeout: (fn, ms) => { const id = ++clock.seq; clock.timers.push({ id, at: clock.now + (ms || 0), fn }); return id; },
    clearTimeout: id => { clock.timers = clock.timers.filter(x => x.id !== id); },
    getLang: () => { p.order.push('logger'); return (o.getLang || (() => o.lang || 'en'))(); },
  };
  /* The device's wall clock: real, unless p.wallNow is set (a device whose clock is wrong). */
  ctx.Date = class extends Date { constructor(...a) { if (a.length) super(...a); else if (p.wallNow != null) super(p.wallNow); else super(); } static now() { return p.wallNow != null ? p.wallNow : Date.now(); } };
  if (o.location !== undefined) Object.defineProperty(ctx, 'location', o.location); else ctx.location = { get origin() { p.originReads++; return 'https://gc.example'; }, hash: o.hash !== undefined ? o.hash : '#class-activities/ca-23' };
  ctx.caches = o.caches !== undefined ? o.caches : { keys: async () => ['guitar-class-2026-11-13-f60507df73', 'guitar-class-audio-2026-10-30-ff9e913a6d', 'guitar-class-audio-hashes'] };
  vm.createContext(ctx);
  vm.runInContext(`var auth = null, db = null, lastSetId = ${JSON.stringify(o.set === undefined ? 'm4w2' : o.set)}, IS_TEACHER_MODE = ${!!o.teacher};\n` + code, ctx, { filename: 'boot.js(error log)' });
  ctx.auth = o.auth !== undefined ? o.auth : { currentUser: USER };
  p.ctx = ctx;
  p.dbMode = o.db === undefined ? 'ok' : o.db;
  p.makeDb = mode => mode === null ? null : { collection: name => ({ add: doc => {
    p.adds++; p.writes.push({ name, doc: JSON.parse(JSON.stringify(doc)) });
    if (mode === 'throw') throw new Error('add threw');
    if (mode === 'refuse') return Promise.reject(Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied', name: 'FirebaseError' }));
    if (mode === 'hang') return new Promise(() => {});
    return Promise.resolve({ id: 'auto' + p.adds });
  } }) };
  ctx.db = p.makeDb(p.dbMode);
  p.fire = (type, ev) => { try { p.listeners[type === 'error' ? 'error' : 'unhandledrejection'](ev); } catch { p.threw++; } };
  p.err = (message, extra) => p.fire('error', Object.assign({ message, filename: 'https://gc.example/app/lesson.js', lineno: 10, colno: 2, error: { stack: 'Error: ' + message + '\n    at f (https://gc.example/app/lesson.js:10:2)' } }, extra || {}));
  p.advance = async ms => { const end = clock.now + ms; for (;;) { await tick(); const due = clock.timers.filter(x => x.at <= end).sort((a, b) => a.at - b.at)[0]; if (!due) break; clock.timers = clock.timers.filter(x => x !== due); clock.now = due.at; try { due.fn(); } catch { p.threw++; } } clock.now = end; await tick(); };
  CURRENT = p;
  return p;
}

let pass = 0, fail = 0;
const failed = [];
function ok(name, cond, detail) {
  if (cond) pass++; else { fail++; failed.push(name + (detail ? ' — ' + detail : '')); }
  if (VERBOSE || !QUIET) console.log((cond ? '  ✓ ' : '  ✗ ') + name + (!cond && detail ? '\n      ' + detail : ''));
}
let QUIET = false;
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

async function runAll(LOG, VIEWSRC) {
  pass = 0; fail = 0; failed.length = 0; unhandled = 0;
  const say = s => { if (!QUIET) console.log(s); };

  say('== the exact doc: an error event');
  {
    const p = makePage(LOG);
    p.fire('error', { message: "Uncaught TypeError: Cannot read properties of undefined (reading 'length')", filename: 'https://gc.example/app/lesson.js?v=3', lineno: 412, colno: 17,
      error: { stack: "TypeError: Cannot read properties of undefined (reading 'length')\n    at caStepHtml (https://gc.example/app/activities.js:120:9)\n    at https://gc.example/app/activities.js:300:5\n    at Array.map (<anonymous>)\n    at renderX (https://gc.example/app/lesson.js:412:17)" } });
    await p.advance(10);
    const want = { kind: 'error', message: "Uncaught TypeError: Cannot read properties of undefined (reading 'length')", file: '/app/lesson.js', line: 412, col: 17,
      stack: 'at caStepHtml (/app/activities.js:120:9)\nat /app/activities.js:300:5\nat Array.map (<anonymous>)', page: '#class-activities/ca-23 set m4w2', version: '2026-11-13-f60507df73', day: today, lang: 'en' };
    const got = p.writes[0] && p.writes[0].doc;
    if (!QUIET) console.log('     written: ' + JSON.stringify(got));
    ok('one write, to siteErrors', p.adds === 1 && p.writes[0].name === 'siteErrors', `adds ${p.adds}`);
    ok('the doc is exactly the expected one (10 fields, query and origin stripped, top 3 frames)', eq(got, want), JSON.stringify(got));
    ok('the doc passes the siteErrors rule (mirror parsed from firestore.rules)', got && !rulesRefuse(got).length, got && rulesRefuse(got).join('; '));
    ok('the banner showed, once, as before', p.banners === 1 && p.consoleErr === 1, `banners ${p.banners}, console.error ${p.consoleErr}`);
  }

  say('== the exact doc: an unhandled rejection (a Firestore error, in Spanish)');
  {
    const p = makePage(LOG, { lang: 'es', hash: '#songs', set: null });
    const reason = Object.assign(new Error('Missing or insufficient permissions.'), { name: 'FirebaseError', code: 'permission-denied',
      stack: 'FirebaseError: Missing or insufficient permissions.\n    at https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js:1:2345\n    at loadClassConfig (https://gc.example/app/save.js:88:3)' });
    p.fire('rejection', { reason });
    await p.advance(10);
    const want = { kind: 'rejection', message: 'FirebaseError: Missing or insufficient permissions. [permission-denied]', file: 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js', line: 1, col: 2345,
      stack: 'at https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js:1:2345\nat loadClassConfig (/app/save.js:88:3)', page: '#songs', version: '2026-11-13-f60507df73', day: today, lang: 'es' };
    const got = p.writes[0] && p.writes[0].doc;
    if (!QUIET) console.log('     written: ' + JSON.stringify(got));
    ok('the doc is exactly the expected one (file/line/col from the stack\'s top frame)', eq(got, want), JSON.stringify(got));
    ok('it passes the rule mirror', got && !rulesRefuse(got).length, got && rulesRefuse(got).join('; '));
    ok('the banner showed, once', p.banners === 1);
    p.fire('rejection', { reason: 'just a string' });
    p.fire('rejection', { reason: null });
    p.fire('rejection', { reason: { some: 'object' } });
    await p.advance(10);
    ok('a string, a null and a plain-object reason: 3 more docs, each passes the rule', p.adds === 4 && p.writes.slice(1).every(w => !rulesRefuse(w.doc).length), p.writes.slice(1).map(w => w.doc.message).join(' | '));
    ok('…their messages: the string, "Rejected with null", "Rejected with object"', eq(p.writes.slice(1).map(w => w.doc.message), ['just a string', 'Rejected with null', 'Rejected with object']), p.writes.slice(1).map(w => w.doc.message).join(' | '));
    const q = makePage(LOG, { teacher: true, hash: '', set: null }); q.err('console boom'); await q.advance(10);
    ok('in the teacher console the page reads "console #"', q.writes[0] && q.writes[0].doc.page === 'console #', q.writes[0] && q.writes[0].doc.page);
  }

  say('== bounded: at most 5 writes per page load, each message once');
  {
    const p = makePage(LOG);
    for (let i = 0; i < 8; i++) p.err('distinct error number ' + i);
    await p.advance(10);
    ok('8 distinct errors → 5 writes', p.adds === 5, `adds ${p.adds}`);
    ok('…the banner still showed once, and every error still went to the console', p.banners === 1 && p.consoleErr === 8, `banners ${p.banners}, console.error ${p.consoleErr}`);
    const q = makePage(LOG);
    q.err('same message'); q.err('same message'); q.err('same message');
    q.fire('rejection', { reason: 'same message' });
    await q.advance(10);
    ok('the same message 3 times as an error → 1 write; as a rejection → 1 more (2 in all)', q.adds === 2, `adds ${q.adds}`);
    const r = makePage(LOG);
    r.err('Cannot read ana.lopez@seq.org'); r.err('Cannot read bob.smith@seq.org');
    await r.advance(10);
    ok('two messages that differ only by a scrubbed email count as one', r.adds === 1, `adds ${r.adds}`);
  }

  say('== never before Firestore is ready; queued, then written or dropped');
  {
    const p = makePage(LOG, { db: null });
    p.err('early one'); p.err('early two');
    await p.advance(30000);
    ok('Firestore not loaded: nothing written, nothing thrown', p.adds === 0 && p.threw === 0, `adds ${p.adds}, threw ${p.threw}`);
    ok('…one re-check timer pending, never more', p.clock.timers.length === 1, `timers ${p.clock.timers.length}`);
    p.ctx.db = p.makeDb('ok');
    await p.advance(5000);
    ok('the app loads Firestore → both queued errors are written within 5 s', p.adds === 2, `adds ${p.adds}`);
    ok('…and no timer is left', p.clock.timers.filter(t => t.at > p.clock.now).length === 0 || p.clock.timers.every(t => t.at - p.clock.now <= 3000), `timers ${p.clock.timers.length}`);

    const q = makePage(LOG, { auth: { currentUser: null } });
    q.err('before sign-in');
    await q.advance(20000);
    ok('nobody signed in (Firestore loaded): nothing written', q.adds === 0, `adds ${q.adds}`);
    q.ctx.auth = { currentUser: USER };
    await q.advance(5000);
    ok('signs in → written', q.adds === 1, `adds ${q.adds}`);

    const r = makePage(LOG, { db: null, auth: null });
    r.err('never ready');
    await r.advance(10 * 60 * 1000 + 6000);
    ok('never ready for 10 minutes: nothing written and the re-check timer is gone', r.adds === 0 && r.clock.timers.length === 0, `adds ${r.adds}, timers ${r.clock.timers.length}`);
    r.ctx.db = r.makeDb('ok'); r.ctx.auth = { currentUser: USER };
    await r.advance(60000);
    ok('…ready afterwards: the dropped entry is NOT written', r.adds === 0, `adds ${r.adds}`);
    r.err('a new one once ready');
    await r.advance(10);
    ok('…a new error once ready is written (1)', r.adds === 1, `adds ${r.adds}`);
  }

  say('== rules not published: the write is refused once, silently, then the log stops');
  {
    const p = makePage(LOG, { db: 'refuse' });
    p.err('one'); p.err('two'); p.err('three');
    await p.advance(10);
    p.err('four'); p.err('five');
    await p.advance(60000);
    ok('5 errors → exactly 1 write attempted', p.adds === 1, `adds ${p.adds}`);
    ok('…no unhandled rejection, nothing thrown', unhandled === 0 && p.threw === 0, `unhandled ${unhandled}, threw ${p.threw}`);
    ok('…nothing on the console but the safety net\'s own 5 lines', p.consoleErr === 5 && p.consoleWarn === 0 && p.consoleOther === 0, `error ${p.consoleErr}, warn ${p.consoleWarn}, other ${p.consoleOther}`);
    ok('…the banner showed once', p.banners === 1);
    const q = makePage(LOG, { db: 'throw' });
    q.err('one'); q.err('two'); await q.advance(10);
    ok('add() itself throws: 1 attempt, nothing thrown out of the listener', q.adds === 1 && q.threw === 0, `adds ${q.adds}, threw ${q.threw}`);
    const r = makePage(LOG, { db: 'hang' });
    r.err('one'); r.err('two'); await r.advance(60000);
    ok('offline (a write that never lands): 1 write sent, the next waits behind it, nothing thrown', r.adds === 1 && r.threw === 0, `adds ${r.adds}`);
  }

  say('== what is stripped before writing');
  {
    const cases = [
      ['an email address', 'Failed for ana.lopez@seq.org and bob_7@gmail.com today', m => !/@/.test(m) && (m.match(/\[email\]/g) || []).length === 2],
      ['an email written %40', 'GET /users/carla.r%40seq.org/doc failed', m => !/%40|carla/.test(m) && /\[email\]/.test(m)],
      ['a Firebase uid (28 letters and digits)', 'No document progress/Qz8Lm2Np5Rt7Vw9Xa1Bc3De4Fg6H', m => m === 'No document progress/[id]'],
      ['a Firestore auto id (20)', 'doc a1B2c3D4e5F6g7H8i9J0 missing', m => m === 'doc [id] missing'],
      ['a 32-hex tag', 'tag a1b2c3d4e5f60718293a4b5c6d7e8f90 refused', m => m === 'tag [id] refused'],
      ['…but a long code name with no digit is kept', 'renderTeacherStudentDetailPanel is not defined', m => m === 'renderTeacherStudentDetailPanel is not defined'],
      ['a URL query string', 'Failed to fetch https://api.example.com/a?key=SECRETKEY&user=ana', m => m === 'Failed to fetch https://api.example.com/a?[query]'],
      ['a run of 6+ digits (a timestamp, a student number)', 'at 1731500000000 for student 4401234', m => m === 'at [n] for student [n]'],
      ['the signed-in student\'s own name, whole words, only as written', "Unexpected 'Ana Lopez' in notes by Lopez; lopez, banana and Banana stay", m => m === "Unexpected '[user]' in notes by [user]; lopez, banana and Banana stay"],
      ['…a 3-letter name word alone (Ana) now STAYS (review R2-4: only 5+ letter name words go alone)', "Unexpected 'Ana' in notes", m => m === "Unexpected 'Ana' in notes"],
      ['…a 5-letter name word alone (Lopez) still goes', "Unexpected 'Lopez' in notes", m => m === "Unexpected '[user]' in notes"],
      ['the signed-in student\'s email local part, any case', 'key ana.lopez not found, nor ANA.LOPEZ', m => m === 'key [user] not found, nor [user]'],
    ];
    for (const [name, input, test] of cases) {
      const p = makePage(LOG); p.err(input); await p.advance(10);
      const m = p.writes[0] && p.writes[0].doc.message;
      if (!QUIET) console.log(`     ${JSON.stringify(input)} → ${JSON.stringify(m)}`);
      ok(name, m != null && test(m), JSON.stringify(m));
    }
    {
      const big = 'x'.repeat(2500) + ' ana.lopez@seq.org ' + 'y'.repeat(2500);
      const p = makePage(LOG); p.err(big, { error: { stack: ('    at f (https://gc.example/app/a.js?' + 'z'.repeat(400) + '=1:1:1)\n').repeat(5) } }); await p.advance(10);
      const d = p.writes[0] && p.writes[0].doc;
      ok('a 5,000-character message → 300 characters ending in …, the rule accepts it', d && d.message.length === 300 && d.message.endsWith('…') && !rulesRefuse(d).length, d && `${d.message.length} chars; ${rulesRefuse(d).join('; ')}`);
      ok('…a long stack is cut to the 600 cap, its query strings gone', d && d.stack.length <= 600 && !/z{20}/.test(d.stack), d && `${d.stack.length} chars`);
    }
    {
      const p = makePage(LOG); p.err('x', { filename: 'https://gc.example/app/boot.js?token=abc123&email=x@y.com#frag' }); await p.advance(10);
      ok('the file loses its query and fragment: /app/boot.js', p.writes[0] && p.writes[0].doc.file === '/app/boot.js', p.writes[0] && p.writes[0].doc.file);
      const s = makePage(LOG); s.err('y', { error: { stack: 'Error: y\n    at f (https://gc.example/app/x.js?v=99&id=7:10:4)' } }); await s.advance(10);
      ok('a stack frame keeps its line:col after its query is cut', s.writes[0] && s.writes[0].doc.stack === 'at f (/app/x.js?[query]:10:4)', s.writes[0] && s.writes[0].doc.stack);
      const h = makePage(LOG, { hash: '#search?q=ana@seq.org&x=1' }); h.err('z'); await h.advance(10);
      ok('the page drops what follows ? in the hash', h.writes[0] && h.writes[0].doc.page === '#search set m4w2', h.writes[0] && h.writes[0].doc.page);
      const u = makePage(LOG); u.err('uid Xy7Qp2LmN8rT4vW1zA3bC5dE6fG9 and ' + USER.uid.toLowerCase()); await u.advance(10);
      const md = u.writes[0] && u.writes[0].doc.message;
      ok('the signed-in uid never reaches the doc', md && !md.toLowerCase().includes(USER.uid.toLowerCase()), md);
      const all = [p, s, h, u].flatMap(x => x.writes.map(w => JSON.stringify(w.doc)));
      ok('no written doc holds the uid, the email, or the name', all.every(j => !j.includes(USER.uid) && !j.includes('ana.lopez@') && !/Ana Lopez/i.test(j)), '');
    }
  }

  say('== a name that is also a word (the scrub must not tell whose error it is)');
  {
    const who = name => ({ auth: { currentUser: { uid: 'Xy7Qp2LmN8rT4vW1zA3bC5dE6fG9', email: 'x1@seq.org', displayName: name } } });
    const run = async (name, msg, stack) => { const p = makePage(LOG, who(name)); p.err(msg, stack ? { error: { stack } } : undefined); await p.advance(10); return p.writes[0] && p.writes[0].doc; };
    let d = await run('Max Rivera', "Cannot read properties of undefined (reading 'max')", 'TypeError: x\n    at Math.max (<anonymous>)\n    at songKey (https://gc.example/app/tab.js:1:2)');
    ok("Max: 'max' in the message and Math.max in the stack are untouched", d && d.message === "Cannot read properties of undefined (reading 'max')" && d.stack === 'at Math.max (<anonymous>)\nat songKey (/app/tab.js:1:2)', d && JSON.stringify([d.message, d.stack]));
    d = await run('Max Rivera', 'Unexpected Max in Rivera notes; Max Rivera');
    ok('…"Rivera" (6 letters) and "Max Rivera" as written are scrubbed; "Max" alone (3 letters) stays', d && d.message === 'Unexpected Max in [user] notes; [user]', d && d.message);
    d = await run('Will Chen', 'The play() request will fail; Will Chen typed it');
    ok('Will: the word "will" stays, the name "Will Chen" goes', d && d.message === 'The play() request will fail; [user] typed it', d && d.message);
    d = await run('Amy Songs', 'Bad Songs row', 'TypeError: x\n    at songsKey (https://gc.example/app/songs.js:1:2)\n    at openSongsLink (https://gc.example/app/explore.js:3:4)');
    ok('Amy Songs: songsKey, /app/songs.js and openSongsLink stay; "Songs" as written goes', d && d.message === 'Bad [user] row' && d.stack === 'at songsKey (/app/songs.js:1:2)\nat openSongsLink (/app/explore.js:3:4)', d && JSON.stringify([d.message, d.stack]));
  }

  say('== half a name never survives the 300-character cut');
  {
    const p = makePage(LOG); p.err('y'.repeat(294) + ' Lopez tail'); await p.advance(10);
    const m = p.writes[0] && p.writes[0].doc.message;
    ok("'y'×294 + ' Lopez tail' → no 'Lop' left (the name is scrubbed before the cut)", m && m.length <= 300 && !/Lop/i.test(m), JSON.stringify(m && m.slice(-12)));
    const q = makePage(LOG, { auth: { currentUser: null } }); q.err('Unexpected Lopez in notes'); await q.advance(10);
    q.ctx.auth = { currentUser: USER }; await q.advance(6000);
    ok('an error from before sign-in is scrubbed at send time, once someone signs in', q.writes[0] && q.writes[0].doc.message === 'Unexpected [user] in notes', q.writes[0] && q.writes[0].doc.message);
  }

  say('== review round 2: name words, the stop-list, the email local part, tokens, accents (R2-3, R2-4, R2-7)');
  {
    const who = (name, email) => ({ auth: { currentUser: { uid: 'Xy7Qp2LmN8rT4vW1zA3bC5dE6fG9', email: email || 'x1@seq.org', displayName: name } } });
    const cases = [
      ['"Smith, Max": the comma no longer glues Smith to it (Smith goes, Max is 3 letters and stays)', 'Smith, Max', null, 'Smith typed it; Max too', '[user] typed it; Max too'],
      ["\"Mary-Jane O'Brien\": split at - and ' (Brien goes; Mary and Jane are 4 letters and stay; the whole name goes)", "Mary-Jane O'Brien", null, "Mary and Jane and Brien; Mary-Jane O'Brien", 'Mary and Jane and [user]; [user]'],
      ["\"Mariana-Isabel O'Donnell\": every 5+ letter part goes", "Mariana-Isabel O'Donnell", null, 'Mariana, Isabel, Donnell', '[user], [user], [user]'],
      ['Will Page: "Will not load. Page crashed" unchanged', 'Will Page', null, 'Will not load. Page crashed', 'Will not load. Page crashed'],
      ['May Long: "Fri May 14 2027" unchanged', 'May Long', null, 'Fri May 14 2027', 'Fri May 14 2027'],
      ['Promise King: Promise.all stays (on the stop-list), the whole name goes', 'Promise King', null, 'Promise.all is not iterable; Promise King', 'Promise.all is not iterable; [user]'],
      ['Audio Kingston: the stop-list is case-blind (Audio stays), Kingston goes', 'Audio Kingston', null, 'Audio failed for Kingston', 'Audio failed for [user]'],
      ['max@…: Math.max stays (a 3-letter local part with no digit)', 'Zed Quill', 'max@seq.org', 'Math.max failed', 'Math.max failed'],
      ['msmith27@…: a local part with a digit still goes, any case', 'Zed Quill', 'msmith27@seq.org', 'key msmith27 or MSMITH27 missing', 'key [user] or [user] missing'],
      ['lopez@…: a 5-character local part still goes, any case', 'Zed Quill', 'lopez@seq.org', 'LOPEZ not found', '[user] not found'],
      ['a lower-case name "max smith": smith and the whole name go, Math.max stays', 'max smith', null, 'Math.max of smith; max smith', 'Math.max of [user]; [user]'],
      ['email local part "email": an earlier [email] is never rewritten (no [[user]])', 'Zed Quill', 'email@seq.org', 'bad email in [email] and [id]', 'bad [user] in [email] and [id]'],
      ['display name "user": an earlier [user] is never rewritten, at report time or send time', 'user', null, 'user said [user] [n] [query]', '[user] said [user] [n] [query]'],
      ['an NFC name, the text in NFD (José Peña): the whole name goes, no accent left', 'Jos\u00e9 Pe\u00f1a', null, 'by Jose\u0301 Pen\u0303a today', 'by [user] today'],
      ['an NFD name, the text in NFC: the whole name goes', 'Jose\u0301 Pe\u00f1a', null, 'by Jos\u00e9 Pe\u00f1a today', 'by [user] today'],
      ['a combining mark after a name word (Lopez + U+0308, no precomposed form): the mark goes with it', 'Maria Lopez', null, 'Lopez\u0308 x', '[user] x'],
    ];
    for (const [name, dn, email, msg, want] of cases) {
      const p = makePage(LOG, who(dn, email)); p.err(msg); await p.advance(10);
      const m = p.writes[0] && p.writes[0].doc.message;
      if (!QUIET) console.log(`     ${JSON.stringify(dn)} ${JSON.stringify(msg)} → ${JSON.stringify(m)}`);
      ok(name, m === want, JSON.stringify(m) + ' (want ' + JSON.stringify(want) + ')');
    }
  }

  say('== review round 2: half a name never survives a cut made while signed out (R2-5), a field that grows is re-cut (R2-6c)');
  {
    const left = [];
    for (let off = 286; off <= 299; off++) {
      const p = makePage(LOG, { auth: { currentUser: null } });
      p.err('y'.repeat(off) + ' Maximiliano Fernandez tail');
      await p.advance(10);
      p.ctx.auth = { currentUser: { uid: 'Xy7Qp2LmN8rT4vW1zA3bC5dE6fG9', email: 'x1@seq.org', displayName: 'Maximiliano Fernandez' } };
      await p.advance(6000);
      const m = p.writes[0] ? p.writes[0].doc.message.replace(/^y+/, '') : null;
      const frag = m == null || ['Maximiliano', 'Fernandez'].some(w => { for (let k = 3; k <= w.length; k++) if (m.includes(w.slice(0, k))) return true; return false; });
      if (frag) left.push(off + ': ' + JSON.stringify(m));
    }
    ok('"Maximiliano Fernandez" starting at each offset 286..299, reported signed out, sent after sign-in: 14 of 14 written with no fragment of 3+ letters of either word', !left.length, left.join(' | '));
    /* R3-1: only a field that was really cut loses its unfinished word, and never more than 40 letters. */
    const lateOne = async (msg, extra) => { const x = makePage(LOG, { auth: { currentUser: null } }); x.err(msg, extra); await x.advance(10); x.ctx.auth = { currentUser: USER }; await x.advance(6000); return x.writes[0] && x.writes[0].doc; };
    let r3 = await lateOne('Loading…');
    ok('R3-1 "Loading…" (never cut), reported signed out: sent as "Loading…"', r3 && r3.message === 'Loading…', r3 && JSON.stringify(r3.message));
    r3 = await lateOne('a'.repeat(400));
    ok('R3-1 400 letters with no space, cut while signed out: at most 40 letters go (259 a\'s and …)', r3 && r3.message === 'a'.repeat(259) + '…', r3 && `${r3.message.length} chars`);
    r3 = await lateOne('\u4e2d'.repeat(400));
    ok('R3-1 400 CJK characters, cut while signed out: at most 40 go (259 and …)', r3 && r3.message === '\u4e2d'.repeat(259) + '…', r3 && `${r3.message.length} chars`);
    r3 = await lateOne('x', { filename: 'https://gc.example/' + 'a'.repeat(230) + '.js' });
    ok('R3-1 a 234-character file (after the origin goes) cut while signed out: at most 40 letters go ("/", 158 a\'s and …)', r3 && r3.file === '/' + 'a'.repeat(158) + '…', r3 && `${r3.file.length} chars: ${JSON.stringify(r3.file.slice(0, 8))}`);
    r3 = await lateOne('x', { filename: 'https://gc.example/app/lesson.js' });
    ok('R3-1 a short file reported signed out keeps its whole name', r3 && r3.file === '/app/lesson.js', r3 && r3.file);
    const q = makePage(LOG, { auth: { currentUser: null } });
    q.err('Lopez '.repeat(60));
    await q.advance(10);
    q.ctx.auth = { currentUser: USER };
    await q.advance(6000);
    const d = q.writes[0] && q.writes[0].doc;
    ok("'Lopez ' x 60 reported signed out ([user] is longer than Lopez, so the scrub at send time grows it past 300): re-cut and SENT, not dropped", q.adds === 1 && d.message.length <= 300 && d.message.endsWith('…') && /\[user\]/.test(d.message) && !/Lop/.test(d.message) && !rulesRefuse(d).length, d ? `${d.message.length} chars, ${rulesRefuse(d).join('; ')}` : `adds ${q.adds}`);
  }

  say('== review round 2: an error storm whose text keeps changing (R2-2, R2-6b)');
  {
    const p = makePage(LOG);
    const at = i => 'Failed to load audio/take-' + (1731500000000 + i) + '.mp3';
    for (let i = 0; i < 49; i++) p.err(at(i));
    p.err('A different failure');
    for (let i = 50; i < 100; i++) p.err(at(i));
    const after100 = p.originReads;
    const t0 = process.hrtime.bigint();
    for (let i = 100; i < 5000; i++) p.err(at(i));
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    p.err('A third failure');
    await p.advance(10);
    const st = vm.runInContext('SITE_ERRORS.stats()', p.ctx);
    if (!QUIET) console.log(`     the 4,900 events after the first 100: ${ms.toFixed(1)} ms in all; origin read ${after100} times for the first 100, ${p.originReads - after100} after`);
    ok('the first 100 behave as before: the timestamps scrub to one entry, the different failure is a second (2 writes)', p.adds === 2 && p.writes[0].doc.message === 'Failed to load audio/take-[n].mp3' && p.writes[1].doc.message === 'A different failure', p.writes.map(w => w.doc.message).join(' | '));
    ok('the 4,900 after them are never scrubbed (the origin is read 0 more times), and a new message after 100 is not logged', after100 > 0 && p.originReads === after100 && p.adds === 2, `origin reads: first 100 ${after100}, after ${p.originReads - after100}; adds ${p.adds}`);
    ok('rawSeen holds 100 after 5,002 different raw messages, never more', st.rawSeen === 100, JSON.stringify(st));
  }

  say('== review round 2: control characters (R2-8)');
  {
    const p = makePage(LOG); p.err('a\u0000b\u0007c\u000Bd\u001Fe\uFFFEf\uFFFFg\th\ni\rj', { filename: 'https://gc.example/app/x\u0001.js' }); await p.advance(10);
    const d = p.writes[0] && p.writes[0].doc;
    ok('NUL, BEL, VT, US, U+FFFE, U+FFFF → U+FFFD; tab, line feed, carriage return kept; in the file too; the rule mirror accepts it', d && d.message === 'a\uFFFDb\uFFFDc\uFFFDd\uFFFDe\uFFFDf\uFFFDg\th\ni\rj' && d.file === '/app/x\uFFFD.js' && !rulesRefuse(d).length, d && JSON.stringify([d.message, d.file]));
  }

  say('== a message over the 1,000-character pre-cut');
  {
    const p = makePage(LOG); p.err('q'.repeat(4500)); await p.advance(10);
    const m = p.writes[0] && p.writes[0].doc.message;
    ok("4,500 q's with no space → 299 q's and … (not \"(no message)\")", m === 'q'.repeat(299) + '…', JSON.stringify(m && m.slice(0, 20)));
    const q = makePage(LOG); q.err('a'.repeat(990) + 'bob.smith@seq.org'); await q.advance(10);
    const n = q.writes[0] && q.writes[0].doc.message;
    ok('…an email cut in half at the pre-cut, with no space: none of it survives', n != null && !/bob|@/.test(n), JSON.stringify(n && n.slice(-20)));
  }

  say('== a repeat is turned away before any scrubbing');
  {
    const p = makePage(LOG);
    p.err('a'.repeat(4000)); const once = p.originReads;
    for (let i = 0; i < 50; i++) p.err('a'.repeat(4000));
    await p.advance(10);
    ok('the same long message 51 times: scrubbed once (the origin is read ' + once + ' times for the first, ' + (p.originReads - once) + ' more after)', once > 0 && p.originReads === once && p.adds === 1, `first ${once}, after ${p.originReads - once}, adds ${p.adds}`);
  }

  say('== no written field ever holds a lone surrogate (half an emoji)');
  {
    const all = [];
    const run = async (o, msg, extra) => { const p = makePage(LOG, o); p.err(msg, extra); await p.advance(10); all.push(...p.writes.map(w => w.doc)); return p.writes[0] && p.writes[0].doc; };
    let d = await run({}, 'Unexpected token in "great job \uD83D"');
    ok('a lone high surrogate in the message → written, as U+FFFD', d && d.message === 'Unexpected token in "great job \uFFFD"', d && JSON.stringify(d.message));
    d = await run({}, 'a\uDE00b and 😀 kept');
    ok('a lone low surrogate → U+FFFD, a whole emoji kept', d && d.message === 'a\uFFFDb and 😀 kept', d && JSON.stringify(d.message));
    d = await run({}, 'x', { error: { stack: 'E\n    at f\uD83D (https://gc.example/a.js:1:2)' } });
    ok('…in the stack', d && d.stack === 'at f\uFFFD (/a.js:1:2)', d && JSON.stringify(d.stack));
    d = await run({}, 'y'.repeat(298) + '😀😀');
    ok('the 300 cut landing inside an emoji: 298 y\'s, …, no half emoji', d && d.message === 'y'.repeat(298) + '…', d && JSON.stringify(d.message.slice(-4)));
    d = await run({}, ('z'.repeat(9) + ' ').repeat(99) + 'zzzzzzzzz😀 tail tail');
    ok('the 1,000 pre-cut landing inside an emoji', d && !LONE.test(d.message), d && JSON.stringify(d.message.slice(-4)));
    d = await run({}, 'q'.repeat(999) + '😀tail');
    ok('…with no space in the text', d && !LONE.test(d.message), d && JSON.stringify(d.message.slice(-4)));
    d = await run({}, 'x', { filename: 'https://gc.example/app/x\uD83D.js' });
    ok('…in the file', d && d.file === '/app/x\uFFFD.js', d && JSON.stringify(d.file));
    d = await run({ hash: '#songs/\uD83D', set: 'm4w2\uDE00' }, 'x');
    ok('…in the page (hash and set id)', d && d.page === '#songs/ set m4w2', d && JSON.stringify(d.page));
    d = await run({ caches: { keys: async () => ['guitar-class-2026-11-13-f60507df73\uD83D'] } }, 'x');
    ok('…in the version (a cache name that is not ours is ignored)', d && d.version === 'none', d && JSON.stringify(d.version));
    ok(`all ${all.length} docs written here: no field holds a lone surrogate, every one passes the rule mirror`, all.length === 9 && all.every(x => !Object.values(x).some(v => typeof v === 'string' && LONE.test(v)) && !rulesRefuse(x).length), all.map(x => rulesRefuse(x).join(',')).join(' | '));
  }

  say('== a doc the rules would refuse is dropped, never sent');
  {
    const p = makePage(LOG, { wallNow: Date.UTC(10000, 0, 2, 12) });
    p.err('clock in the year 10000'); p.err('another one');
    await p.advance(10);
    ok('a device clock in the year 10000 (day "10000-01-02"): nothing sent, nothing thrown, banner shown', p.adds === 0 && p.threw === 0 && p.banners === 1, `adds ${p.adds}, threw ${p.threw}`);
    p.wallNow = null; p.err('clock fixed');
    await p.advance(10);
    ok('…the log is not turned off by a drop: the next good doc is written', p.adds === 1 && p.writes[0].doc.message === 'clock fixed' && !rulesRefuse(p.writes[0].doc).length, `adds ${p.adds}`);
    const q = makePage(LOG); q.err('x', { lineno: 99999999, colno: -0 }); await q.advance(10);
    ok('line 99,999,999 and col -0 → written as 0 and 0 (inside the rules\' range, an int)', q.writes[0] && q.writes[0].doc.line === 0 && Object.is(q.writes[0].doc.col, 0), q.writes[0] && JSON.stringify([q.writes[0].doc.line, q.writes[0].doc.col]));
    const r = makePage(LOG, { set: 'm4w2 <b>' }); r.err('x'); await r.advance(10);
    ok('a set id with a space and a tag → only its letters, digits, - and _', r.writes[0] && r.writes[0].doc.page === '#class-activities/ca-23 set m4w2b', r.writes[0] && r.writes[0].doc.page);
  }

  say('== the banner comes first');
  {
    const p = makePage(LOG); p.err('first'); await p.advance(10);
    ok('the banner is drawn before the logger runs', p.order[0] === 'banner' && p.order.includes('logger'), p.order.join(','));
  }

  say('== the ResizeObserver note is not logged (and still shows no banner)');
  {
    const p = makePage(LOG);
    p.fire('error', { message: 'ResizeObserver loop completed with undelivered notifications.', error: null });
    await p.advance(10);
    ok('no write, no banner, one console.warn', p.adds === 0 && p.banners === 0 && p.consoleWarn === 1, `adds ${p.adds}, banners ${p.banners}, warn ${p.consoleWarn}`);
    p.fire('error', { message: 'ResizeObserver loop limit exceeded', error: new Error('real') });
    await p.advance(10);
    ok('…the same words WITH a thrown error are a real error: banner and a write, as the banner rule already did', p.adds === 1 && p.banners === 1, `adds ${p.adds}, banners ${p.banners}`);
  }

  say('== a logger whose parts throw: never throws, never loops, nothing left unhandled');
  {
    const before = unhandled;
    const a = makePage(LOG, { getLang: () => { throw new Error('i18n broken'); } }); a.err('x'); await a.advance(10);
    ok('getLang throws → still written, lang "en"', a.adds === 1 && a.writes[0].doc.lang === 'en' && a.threw === 0);
    const b = makePage(LOG, { caches: { keys: () => { throw new Error('no cache api'); } } }); b.err('x'); await b.advance(10);
    ok('caches.keys throws → written with version "unknown"', b.adds === 1 && b.writes[0].doc.version === 'unknown', b.writes[0] && b.writes[0].doc.version);
    const c = makePage(LOG, { caches: { keys: () => new Promise(() => {}) } }); c.err('x'); await c.advance(2900);
    ok('caches.keys never answers → nothing yet at 2.9 s', c.adds === 0);
    await c.advance(200);
    ok('…written at 3 s with version "unknown"', c.adds === 1 && c.writes[0].doc.version === 'unknown');
    const d = makePage(LOG, { caches: null }); d.err('x'); await d.advance(10);
    ok('no Cache API at all → "unknown"', d.adds === 1 && d.writes[0].doc.version === 'unknown');
    const e = makePage(LOG, { caches: { keys: async () => [] } }); e.err('x'); await e.advance(10);
    ok('no shell cache yet (a first visit) → "none"', e.adds === 1 && e.writes[0].doc.version === 'none');
    const f = makePage(LOG, { caches: { keys: async () => ['guitar-class-2026-11-12-aaaaaaaaaa', 'guitar-class-2026-11-13-bbbbbbbbbb'] } }); f.err('x'); await f.advance(10);
    ok('two shell caches (an update mid-way) → the newest, marked " +1"', f.adds === 1 && f.writes[0].doc.version === '2026-11-13-bbbbbbbbbb +1', f.writes[0] && f.writes[0].doc.version);
    const g = makePage(LOG, { auth: { get currentUser() { throw new Error('auth broken'); } } }); g.err('x'); await g.advance(60000);
    ok('auth.currentUser throws → nothing written, nothing thrown, banner shown', g.adds === 0 && g.threw === 0 && g.banners === 1, `adds ${g.adds}, threw ${g.threw}`);
    const h = makePage(LOG, { location: { get() { throw new Error('location broken'); }, configurable: true } }); h.err('x'); await h.advance(10);
    ok('location throws → still written (page "#"), banner shown, nothing thrown', h.adds === 1 && h.writes[0].doc.page === '# set m4w2' && h.banners === 1 && h.threw === 0, h.writes[0] && h.writes[0].doc.page);
    const i = makePage(LOG); i.fire('error', {}); i.fire('rejection', {}); await i.advance(10);
    ok('events with nothing in them ({}): nothing thrown, 2 docs ("(no message)" and "Rejected with undefined"), both pass the rule', i.threw === 0 && i.adds === 2 && i.writes.every(w => !rulesRefuse(w.doc).length), `threw ${i.threw}, adds ${i.adds}: ` + i.writes.map(w => w.doc.message).join(' | '));
    const j = makePage(LOG, { db: 'refuse' });
    for (let k = 0; k < 40; k++) j.err('storm ' + k);
    await j.advance(60000);
    ok('40 errors with the write refused: 1 write attempt in all (no loop through unhandledrejection)', j.adds === 1, `adds ${j.adds}`);
    ok('…and not one unhandled rejection anywhere in this section', unhandled === before, `unhandled ${unhandled - before}`);
  }

  if (VIEWSRC == null) return;
  say('== the console view (teacher-errors.js)');
  const view = (docs, o = {}) => {
    const box = { innerHTML: '' }, refresh = [];
    const deleted = [];
    const mk = list => ({ empty: !list.length, docs: list.map((d, i) => ({ data: () => d, ref: { id: 'd' + i, d } })) });
    let store = docs.slice();
    /* A query honours every where() operator, orderBy and limit, as Firestore does (a stub that ignored
       the operator once let a "<=" delete pass). */
    const OPS = { '<': (a, b) => a < b, '<=': (a, b) => a <= b, '>': (a, b) => a > b, '>=': (a, b) => a >= b, '==': (a, b) => a === b };
    const query = (wh = [], ord = null) => ({
      where: (f, op, v) => { if (!OPS[op]) throw new Error('stub: operator ' + op); return query([...wh, [f, op, v]], ord); },
      orderBy: (f, dir) => query(wh, [f, dir]),
      limit: n => ({ get: async () => {
        reads.push(wh.map(w => w.join(' ')).join(' & ') + (ord ? ' order ' + ord.join(' ') : ''));
        if (o.denied) throw Object.assign(new Error('denied'), { code: 'permission-denied' }); if (o.offline) throw new Error('unavailable');
        let list = store.filter(d => wh.every(([f, op, v]) => typeof d[f] === typeof v && OPS[op](d[f], v)));
        if (ord) list = list.slice().sort((a, b) => (a[ord[0]] < b[ord[0]] ? 1 : a[ord[0]] > b[ord[0]] ? -1 : 0) * (ord[1] === 'desc' ? 1 : -1));
        return mk(list.slice(0, n));
      } }),
    });
    const reads = [];
    const db = { collection: () => query(), batch: () => { const ops = []; return { delete: r => ops.push(r), commit: async () => { for (const r of ops) { store = store.filter(x => x !== r.d); deleted.push(r.d); } } }; } };
    const ctx = { document: { getElementById: id => id === 't-grid-container' ? box : null }, teacherView: o.viewNow || 'errors', ensureDb: async () => db, db, confirm: m => { confirms.push(m); return o.confirm !== false; }, console };
    const confirms = [];
    vm.createContext(ctx);
    vm.runInContext(ESC + '\nvar teacherView = ' + JSON.stringify(o.viewNow || 'errors') + ';\nconst TEACHER_NO_REFRESH_BAR_VIEWS = ' + NO_BAR + ';\n' + VIEWSRC, ctx, { filename: 'teacher-errors.js' });
    return { ctx, box, deleted, store: () => store, reads, confirms };
  };
  const D = (o) => Object.assign({ kind: 'error', message: 'A', file: '/app/a.js', line: 1, col: 2, stack: 'at f (/app/a.js:1:2)', page: '#songs set m4w2', version: '2026-11-13-f60507df73', day: '2026-11-13', lang: 'en' }, o);
  const latest = utcDay(1);
  {
    const v = view([]); await vm.runInContext('renderTeacherErrors()', v.ctx);
    ok('empty: "No errors logged."', v.box.innerHTML.includes('No errors logged.'));
    ok('the Refresh bar is hidden on this view (errors is in the no-refresh-bar list)', vm.runInContext('TEACHER_NO_REFRESH_BAR_VIEWS.includes("errors")', v.ctx));
    const w = view([], { denied: true }); await vm.runInContext('renderTeacherErrors()', w.ctx);
    ok('rules not published (permission-denied): says so, with the paste steps', /rules are not published/.test(w.box.innerHTML) && /Rules → Publish/.test(w.box.innerHTML), w.box.innerHTML.slice(0, 120));
    const x = view([], { offline: true }); await vm.runInContext('renderTeacherErrors()', x.ctx);
    ok('any other read failure: "Could not load", with Refresh', /Could not load the error log/.test(x.box.innerHTML));
    const y = view([], { offline: true, viewNow: 'mic' }); y.box.innerHTML = 'MIC VIEW'; await vm.runInContext('renderTeacherErrors()', y.ctx);
    ok('a failed read that lands after the teacher switched views paints nothing over the other view', !/Could not load/.test(y.box.innerHTML), y.box.innerHTML.slice(0, 80));
  }
  {
    const junk = Array.from({ length: 1000 }, (_, i) => D({ day: '9999-99-99', message: 'junk ' + (i % 3) }));
    const real = [D({ message: 'REAL today', day: utcDay(0) }), D({ message: 'REAL tomorrow (the latest day the rules accept)', day: latest })];
    const v = view([...junk, D({ message: 'two days ahead', day: utcDay(2) }), ...real]); await vm.runInContext('renderTeacherErrors()', v.ctx);
    const h = v.box.innerHTML;
    ok('1,001 docs dated after ' + latest + ' (a wrong clock, 9999-99-99): none shown, the real ones are', !/junk|two days ahead/.test(h) && h.includes('REAL today') && h.includes('REAL tomorrow'), h.slice(0, 200));
    ok('…one plain line says they were hidden', h.includes('1000 or more entries with an impossible date (after ' + latest + ') were hidden.'), (h.match(/[^>]*impossible date[^<]*/) || [''])[0]);
    ok('…the read is day <= ' + latest + ', newest first (one field: no composite index)', v.reads[0] === 'day <= ' + latest + ' order day desc', v.reads.join(' | '));
    await vm.runInContext('teacherErrorsDeleteOld()', v.ctx); await tick();
    ok('"Delete older than 30 days" also deletes the 1,001 impossible ones, and keeps both real ones', v.deleted.length === 1001 && v.store().length === 2, `deleted ${v.deleted.length}, left ${v.store().length}`);
    ok('…its confirm says so', /and every one with an impossible date \(after /.test(v.confirms[0] || ''), v.confirms[0]);
    ok('…the view then has no hidden-entries line', !/impossible date/.test(v.box.innerHTML), '');
    const w = view([D({ day: utcDay(2), message: 'one ahead' }), D({})]); await vm.runInContext('renderTeacherErrors()', w.ctx);
    ok('exactly one hidden: "1 entry … was hidden"', w.box.innerHTML.includes('1 entry with an impossible date (after ' + latest + ') was hidden.'), (w.box.innerHTML.match(/[^>]*impossible date[^<]*/) || [''])[0]);
  }
  {
    const v = view(Array.from({ length: 1000 }, () => D({}))); await vm.runInContext('renderTeacherErrors()', v.ctx);
    ok('exactly 1,000 logged: no "more than" note, the total reads 1000', !/More than/.test(v.box.innerHTML) && v.box.innerHTML.includes('<td>1000</td>'));
    const w = view(Array.from({ length: 1001 }, () => D({}))); await vm.runInContext('renderTeacherErrors()', w.ctx);
    ok('1,001 logged: the "more than 1000" note, and 1000 counted', /More than 1000 are logged/.test(w.box.innerHTML) && w.box.innerHTML.includes('<td>1000</td>'), (w.box.innerHTML.match(/More than[^<]*/) || [''])[0]);
  }
  {
    const docs = [D({}), D({}), D({}), D({ day: '2026-11-12', page: '#games', version: '2026-11-12-aaaaaaaaaa' }), D({ message: 'B', day: '2026-11-12', kind: 'rejection' }), D({ message: 'B', day: '2026-11-12', kind: 'rejection', lang: 'es' }), D({ message: 'C', day: '2026-11-01' })];
    const v = view(docs); await vm.runInContext('renderTeacherErrors()', v.ctx);
    const g = JSON.parse(vm.runInContext(`JSON.stringify(teacherErrorGroups(${JSON.stringify(docs)}).map(g=>({m:g.message,k:g.kind,t:g.total,n:g.newest,days:[...g.days]})))`, v.ctx));
    if (!QUIET) console.log('     groups: ' + JSON.stringify(g));
    ok('grouped by message: A ×4, B ×2, C ×1, newest day first', eq(g.map(x => [x.m, x.t, x.n]), [['A', 4, '2026-11-13'], ['B', 2, '2026-11-12'], ['C', 1, '2026-11-01']]), JSON.stringify(g));
    ok('…A per day: 2026-11-13 ×3, 2026-11-12 ×1', eq(g[0].days, [['2026-11-13', 3], ['2026-11-12', 1]]));
    const h = v.box.innerHTML;
    ok('the table shows the counts, pages and versions seen', h.includes('2026-11-13 <b>×3</b>') && h.includes('#games <b>×1</b>') && h.includes('2026-11-12-aaaaaaaaaa <b>×1</b>') && h.includes('Unhandled promise rejection'));
    ok('the stack top is behind a <details> (on demand)', /<details><summary>Stack top \(1\)<\/summary><pre[^>]*>at f \(\/app\/a\.js:1:2\)/.test(h));
    ok('A comes before B before C in the table', h.indexOf('<b>A</b>') < h.indexOf('<b>B</b>') && h.indexOf('<b>B</b>') < h.indexOf('<b>C</b>'));
  }
  {
    const evil = '<img src=x onerror=alert(1)>';
    const docs = [D({ message: evil, page: '"><script>alert(2)</script>', version: "'\"><svg onload=alert(3)>", stack: '</pre><img src=y onerror=alert(4)>', file: '<b>f</b>', lang: '<i>' }), { message: { toString: null }, line: 'x', day: 7 }, null, 'junk'];
    const v = view(docs.filter(d => d && typeof d === 'object' && d.day !== 7)); await vm.runInContext('renderTeacherErrors()', v.ctx);
    const h = v.box.innerHTML;
    ok('hostile message, page, version, stack, file, lang: no live tag reaches the page', !/<img|<script|<svg|<b>f<\/b>|<i>/.test(h) && h.includes('&lt;img src=x onerror=alert(1)&gt;'), h.slice(0, 200));
    let threw = false; try { vm.runInContext(`teacherErrorsHtml(${JSON.stringify([{ message: 5, line: 'x', day: 7 }, null, 'junk', { kind: 'rejection' }])})`, v.ctx); } catch (e) { threw = String(e); }
    ok('docs of the wrong shape (numbers, null, a string, missing fields) do not throw', !threw, threw);
    const handlers = (h.match(/on[a-z]+="[^"]*"/g) || []);
    ok('every inline handler in the view carries no value: ' + handlers.length + ' found, all from a fixed list', handlers.length > 0 && handlers.every(x => /^onclick="(renderTeacherErrors|teacherErrorsDeleteOld|teacherErrorsSendTest)\(\)"$/.test(x)), handlers.join(' '));
  }
  {
    const cutoff = vm.runInContext('teacherErrorsDay(30)', view([]).ctx);
    const old = D({ day: '2020-01-01', message: 'old' }), recent = D({ day: today, message: 'new' }), onCutoff = D({ day: cutoff, message: 'exactly 30 days' });
    const many = Array.from({ length: 900 }, (_, i) => D({ day: '2021-02-03', message: 'bulk ' + i }));
    const v = view([old, recent, onCutoff, ...many]);
    await vm.runInContext('teacherErrorsDeleteOld()', v.ctx);
    ok(`delete older than 30 days (before ${cutoff}): the 901 old docs go, in batches of 400; the recent one and the one ON the cutoff stay`, v.deleted.length === 901 && v.store().length === 2 && v.store().includes(recent) && v.store().includes(onCutoff), `deleted ${v.deleted.length}, left ${v.store().map(d => d.day).join(',')}`);
    await tick();
    ok('…the view then says how many', v.box.innerHTML.includes('Deleted 901 errors from before ' + cutoff + ' or after ' + latest + '.'), v.box.innerHTML.slice(0, 300));
    const w = view([old, recent], { confirm: false });
    await vm.runInContext('teacherErrorsDeleteOld()', w.ctx);
    ok('Cancel on the confirm deletes nothing', w.deleted.length === 0 && w.store().length === 2);
    const x = view([D({})], { viewNow: 'mic' });
    await vm.runInContext('renderTeacherErrors()', x.ctx);
    ok('a read that lands after the teacher switched views paints nothing', !x.box.innerHTML.includes('<table'), x.box.innerHTML.slice(0, 80));
  }

  say('== "Send a test entry" (R2-1): the real logger and the real view in one page');
  /* The console page: the logger (its safety net too) and the view in one vm, sharing one stub Firestore that
     stores what add() accepts, reads it back by id, and answers the view's queries. */
  const consolePage = (o = {}) => {
    const p = makePage(LOG, { teacher: true, hash: '#errors', set: null });
    const box = { innerHTML: '' }, store = [], gets = [];
    let n = 0;
    const OPS = { '<': (a, b) => a < b, '<=': (a, b) => a <= b, '>': (a, b) => a > b, '==': (a, b) => a === b };
    const query = (wh = [], ord = null) => ({
      where: (f, op, v) => query([...wh, [f, op, v]], ord), orderBy: (f, dir) => query(wh, [f, dir]),
      limit: k => ({ get: async () => {
        if (o.denyRead) throw Object.assign(new Error('denied'), { code: 'permission-denied' });
        let list = store.filter(x => wh.every(([f, op, v]) => typeof x.data[f] === typeof v && OPS[op](x.data[f], v)));
        if (ord) list = list.slice().sort((a, b) => (a.data.day < b.data.day ? 1 : a.data.day > b.data.day ? -1 : 0));
        list = list.slice(0, k);
        return { empty: !list.length, docs: list.map(x => ({ data: () => x.data, ref: x })) };
      } }),
    });
    p.ctx.db = {
      collection: name => Object.assign(query(), {
        add: doc => {
          p.adds++; p.writes.push({ name, doc: JSON.parse(JSON.stringify(doc)) });
          const mode = o.add || 'ok';
          if (mode === 'refuse') return Promise.reject(Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' }));
          if (mode === 'fail') return Promise.reject(Object.assign(new Error('Failed to get document because the client is offline.'), { code: 'unavailable' }));
          if (mode === 'hang') return new Promise(() => {});
          const id = 'Te5tId' + String(++n).padStart(14, '0');
          if (mode !== 'lost') store.push({ id, data: JSON.parse(JSON.stringify(doc)) });
          return Promise.resolve({ id });
        },
        doc: id => ({ get: async opts => { gets.push(opts); if (o.readFail) throw Object.assign(new Error('offline'), { code: 'unavailable' }); const x = store.find(d => d.id === id); return { exists: !!x, data: () => x && (o.alter ? Object.assign({}, x.data, { line: x.data.line + 1 }) : x.data) }; } }),
      }),
      batch: () => { const ops = []; return { delete: r => ops.push(r), commit: async () => { for (const r of ops) store.splice(store.indexOf(r), 1); } }; },
    };
    Object.assign(p.ctx, { ensureDb: async () => p.ctx.db, confirm: () => true });
    p.ctx.document.getElementById = id => id === 't-grid-container' ? box : null;
    vm.runInContext(ESC + '\nvar teacherView = "errors";\n' + VIEWSRC, p.ctx, { filename: 'teacher-errors.js' });
    p.press = async () => { const pr = vm.runInContext('teacherErrorsSendTest()', p.ctx); await p.advance(25000); await pr; await p.advance(10); return box.innerHTML; };
    Object.assign(p, { box, store, gets });
    return p;
  };
  const TEST_MSG = 'Error log test (sent from the console)';
  {
    const p = consolePage();
    await vm.runInContext('renderTeacherErrors()', p.ctx);
    ok('before the test: "No errors logged." and the "Send a test entry" button', p.box.innerHTML.includes('No errors logged.') && p.box.innerHTML.includes('onclick="teacherErrorsSendTest()">Send a test entry</button>'));
    const h = await p.press();
    ok('the log works: "The log works: the test entry was saved and read back."', h.includes('The log works: the test entry was saved and read back.'), h.slice(0, 300));
    ok('…it went through the logger: ONE add(), the message as the logger sends it, the 10 fields, the rule mirror accepts it', p.adds === 1 && p.writes[0].name === 'siteErrors' && p.writes[0].doc.message === TEST_MSG && p.writes[0].doc.page === 'console #errors' && !rulesRefuse(p.writes[0].doc).length, JSON.stringify(p.writes[0] && p.writes[0].doc));
    ok('…read back from the SERVER (source: server), by the id add() returned', p.gets.length === 1 && p.gets[0] && p.gets[0].source === 'server', JSON.stringify(p.gets));
    ok('…the list then shows it, marked as a test entry', h.includes('<b>' + TEST_MSG + '</b> <i>(a test entry, from "Send a test entry")</i>'), h.slice(0, 600));
    ok('…it used one of the 5 entries of this page load', vm.runInContext('SITE_ERRORS.stats().used', p.ctx) === 1);
    const h2 = await p.press();
    ok('a second press on the same page: "could not be checked: a test entry was already sent", reload; no second write', h2.includes('The log could not be checked: a test entry was already sent from this page.') && /Reload the console before testing again/.test(h2) && p.adds === 1, h2.slice(0, 300));
    p.store.push({ id: 'realOne', data: { kind: 'error', message: 'A real one', file: '', line: 0, col: 0, stack: '', page: '#', version: 'v', day: utcDay(0), lang: 'en' } });
    await vm.runInContext('teacherErrorsDeleteOld()', p.ctx); await p.advance(10);
    ok('"Delete older than 30 days" deletes the test entry too (and keeps a real one from today)', p.store.length === 1 && p.store[0].id === 'realOne' && p.box.innerHTML.includes('Deleted 1 test entry.'), `left ${p.store.map(x => x.id).join(',')}; ` + (p.box.innerHTML.match(/Deleted[^<]*|Nothing[^<]*/) || [''])[0]);
  }
  {
    const p = consolePage({ add: 'refuse', denyRead: true });
    const h = await p.press();
    ok('the rules refuse the write: "The log is NOT working: the test entry was refused (…not published, or do not match…)"', h.includes('The log is NOT working: the test entry was refused (the rules for the error log are not published, or do not match this version of the site).'), h.slice(0, 300));
    ok('…and it says the log is now off on this console page: "reload the console before testing again"', h.includes('The error log is now off on this console page: reload the console before testing again.'), h.slice(0, 400));
    ok('…the answer still shows when the list read is refused too', /rules are not published/.test(h), h.slice(0, 400));
    p.err('a real console error after the refused test'); await p.advance(10);
    ok('…which is true: a real error afterwards is not written (1 write in all)', p.adds === 1, `adds ${p.adds}`);
    const h2 = await p.press();
    ok('…a second press: the logger is off after a refused entry, so "The log is NOT working" again (R3-3), with the reload line, never "works"', h2.includes('The log is NOT working: an earlier entry from this console page (this test entry was not sent) was refused (the rules for the error log are not published, or do not match this version of the site).') && h2.includes('reload the console before testing again') && !/The log works/.test(h2) && p.adds === 1, h2.slice(0, 300));
    const q = consolePage({ add: 'refuse', denyRead: true });
    q.err('a real console error before the button'); await q.advance(10);
    const hq = await q.press();
    ok('R3-3 a real console error refused BEFORE the button is pressed: "The log is NOT working", reload — not "could not be checked"', hq.includes('The log is NOT working: an earlier entry from this console page (this test entry was not sent) was refused') && hq.includes('reload the console before testing again') && !/could not be checked/.test(hq) && q.adds === 1, `adds ${q.adds}; ` + hq.slice(0, 300));
  }
  {
    const p = consolePage({ add: 'fail' });
    const h = await p.press();
    ok('a connection failure on the write: "The log could not be checked: the write failed (unavailable)…", with the reload line', h.includes('The log could not be checked: the write failed (unavailable), a connection problem.') && h.includes('reload the console before testing again'), h.slice(0, 300));
    const q = consolePage({ add: 'hang' });
    const hq = await q.press();
    ok('no answer at all (offline): after 20 s "could not be checked: no answer from Firestore within 20 seconds"', hq.includes('The log could not be checked: no answer from Firestore within 20 seconds, a connection problem.'), hq.slice(0, 300));
    const r = consolePage({ readFail: true });
    const hr = await r.press();
    ok('saved, but the read-back fails: "could not be checked", never "works"', hr.includes('The log could not be checked: the test entry was saved, but reading it back failed (unavailable).') && !/The log works/.test(hr), hr.slice(0, 300));
    const l = consolePage({ add: 'lost' });
    const hl = await l.press();
    ok('add() answers but the entry is not on the server: "could not be checked: … not there when read back", never "works"', hl.includes('The log could not be checked: the test entry was saved, but it was not there when read back.') && !/The log works/.test(hl), hl.slice(0, 300));
    const a = consolePage({ alter: true });
    const ha = await a.press();
    ok('R3-2 the entry read back with one field changed (line + 1): "could not be checked: the test entry read back is not the one sent", never "works"', ha.includes('The log could not be checked: the test entry read back is not the one sent.') && !/The log works/.test(ha), ha.slice(0, 300));
    const ha2 = await p.press();
    ok('R3-3 the logger off after a write that failed for another reason (unavailable): still "could not be checked", with the code', ha2.includes('The log could not be checked: the logger had already turned itself off on this page, after a write failed (unavailable).') && !/NOT working/.test(ha2), ha2.slice(0, 300));
  }
  {
    const p = consolePage();
    for (let i = 0; i < 5; i++) p.err('console error ' + i);
    await p.advance(10);
    const h = await p.press();
    ok('the 5 entries of this page load already used: no 6th write, "could not be checked: … already sent the 5 entries", reload — never "works"', p.adds === 5 && h.includes('The log could not be checked: this page has already sent the 5 entries one page load may send. Reload the console before testing again.') && !/The log works/.test(h), `adds ${p.adds}; ` + h.slice(0, 300));
    const w = consolePage({});
    w.wallNow = Date.UTC(10000, 0, 2, 12);
    const hw = await w.press();
    ok("this computer's clock in the year 10000: fits() drops the entry, nothing sent, \"could not be checked\"", w.adds === 0 && hw.includes("The log could not be checked: the test entry was not sent: it would not fit the error log's rules (is this computer's date right?)."), `adds ${w.adds}; ` + hw.slice(0, 300));
  }
}

/* ── Planted faults: each must turn at least one case red ── */
const FAULTS = [
  ['the ResizeObserver note logged', 'L', "console.warn('[guitar-class]', e.message); return; }", "console.warn('[guitar-class]', e.message); SITE_ERRORS.report('error', e); return; }"],
  ['the cap raised from 5 to 50', 'L', 'const MAX = 5,', 'const MAX = 50,'],
  ['the email scrub removed', 'L', "s = s.replace(/[A-Za-z0-9._%+-]+(?:@|%40)", "if(0) s = s.replace(/[A-Za-z0-9._%+-]+(?:@|%40)"],
  ['a refused write does not stop the log', 'L', "er => { stop(er); fin(e, { state: 'failed', code: offCode }); });", "er => { fin(e, { state: 'failed', code: offCode }); next(); });"],
  ['the once-per-message check removed', 'L', "if(seen.has(key)) return 'repeat';", ''],
  ['ready() no longer waits for Firestore', 'L', 'return !!(db && auth && auth.currentUser);', 'return !!(auth && auth.currentUser);'],
  ['the uid / id scrub removed', 'L', "s = s.replace(/[A-Za-z0-9]{20,}/g", "if(0) s = s.replace(/[A-Za-z0-9]{20,}/g"],
  ['the query-string scrub removed', 'L', "s = s.replace(/\\?(?=", "if(0) s = s.replace(/\\?(?="],
  ['the signed-in account scrub removed', 'L', "if(who) for(const k of", "if(0) for(const k of"],
  ['the 10-minute give-up removed', 'L', "if(polls >= POLL_TRIES){ for(const e of queue.splice(0)) fin(e, { state: 'not-ready' }); return; }", ''],
  ['several writes in flight at once', 'L', 'if(off || sending || !queue.length) return;', 'if(off || !queue.length) return;'],
  ['the view stops escaping the message', 'V', '<b>${escHtml(g.message)}</b>', '<b>${g.message}</b>'],
  ['clean() keeps lone surrogates', 'L', "m => m.length === 2 ? m : '\\uFFFD'", 'm => m'],
  ['clean() no longer called by scrub()', 'L', '    s = clean(s);\n', ''],
  ['fits() never drops a doc', 'L', "if(!fits(d)){ fin(e, { state: 'dropped' }); next(); return; }", ''],
  ['the raw repeat check removed', 'L', "if(rawSeen.has(rawKey)) return 'repeat';", ''],
  ['the display name matched in any case again', 'L', "[asWritten, 'gu']", "[asWritten, 'giu']"],
  ['the account not scrubbed before the cut', 'L', 'const who = whoScrub();\n      const doc', 'const who = null;\n      const doc'],
  ['the pre-cut drops the last "word" even with no space', 'L', 's = /\\s/.test(s) ?', 's = true ?'],
  ['the view reads impossible dates too', 'V', ".where('day', '<=', latest).orderBy", '.orderBy'],
  ['the delete skips impossible dates', 'V', "[['day', '<', cutoff], ['day', '>', latest]]", "[['day', '<', cutoff]]"],
  /* Review round 2 (2026-11-13). */
  ['R2-1 the test button says "works" without reading the entry back', 'V', "  if(!r.id) return cannot(", "  return 'The log works: the test entry was saved and read back.';\n  if(!r.id) return cannot("],
  ['R2-1 the test is written by a console-only writer, not the logger', 'V', '    SITE_ERRORS.test(),', "    ensureDb().then(d => d.collection('siteErrors').add({ message: 'Error log test (sent from the console)' })).then(ref => ({ state: 'sent', id: ref.id, doc: { message: 'Error log test (sent from the console)' } })),"],
  ['R2-2 a storm of changing messages is scrubbed for ever (no else return)', 'L', "if(rawSeen.size < 100) rawSeen.add(rawKey); else return 'storm';", 'if(rawSeen.size < 100) rawSeen.add(rawKey);'],
  ['R2-6b rawSeen grows without a cap', 'L', "if(rawSeen.size < 100) rawSeen.add(rawKey); else return 'storm';", 'rawSeen.add(rawKey);'],
  ['R2-3 the name split on spaces only', 'L', 'name.split(/[^\\p{L}\\p{N}\\p{M}]+/u)', 'name.split(/\\s+/)'],
  ['R2-4 the 5-letter floor for a single name word removed', 'L', ".length >= 5 && !NOT_NAMES.has(", ".length >= 1 && !NOT_NAMES.has("],
  ['R2-4 the NOT_NAMES stop-list ignored', 'L', '&& !NOT_NAMES.has(w.toLowerCase())', ''],
  ['R2-4 the email local part scrubbed at any length again', 'L', "if(local.length >= 5 || /\\d/.test(local)) add(anyCase, local);", 'add(anyCase, local);'],
  ['R2-5 the unfinished word before … kept at send time', 'L', 'who(e.late && e.cut.includes(k) ? dropCutWord(d[k]) : d[k])', 'who(d[k])'],
  ['R2-6c the send-time scrub not re-cut (fits() then drops the doc)', 'L', 'd[k] = cut(who(e.late && e.cut.includes(k) ? dropCutWord(d[k]) : d[k]), CAP[k]);', 'd[k] = who(e.late && e.cut.includes(k) ? dropCutWord(d[k]) : d[k]);'],
  /* Review round 3 (2026-11-13). */
  ['R3-1 the unfinished word dropped from a field that was never cut', 'L', 'e.late && e.cut.includes(k) ? dropCutWord', 'e.late ? dropCutWord'],
  ['R3-1 the unfinished word dropped with no 40-letter limit', 'L', '[\\p{L}\\p{N}\\p{M}]{1,40}$/u', '[\\p{L}\\p{N}\\p{M}]+$/u'],
  ['R3-2 the read-back not compared field by field', 'V', 'Object.keys(sent).every(k => got[k] === sent[k])', 'true'],
  ['R3-3 the logger off after a refused entry reads "could not be checked"', 'V', "if(code === 'permission-denied') return REFUSED('an earlier entry", "if(false) return REFUSED('an earlier entry"],
  ['R2-7 earlier tokens scrubbed again ([[user]])', 'L', 'i % 2 ? part : res.reduce(', 'res.reduce('],
  ['R2-7 the text not put in NFC before matching', 'L', "String(s).normalize('NFC').split(TOKEN)", 'String(s).split(TOKEN)'],
  ['R2-7 an accent mark after a scrubbed name left behind', 'L', "')\\\\p{M}*(?![", "')(?!["],
  ['R2-8 clean() keeps C0 controls and U+FFFE / U+FFFF', 'L', ".replace(/[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\uFFFE\\uFFFF]/g, '\\uFFFD')", ".replace(/(?!)/g, '')"],
];

console.log('site-errors-sim: the error log in app/boot.js (' + LOGGER.split('\n').length + ' lines) and teacher-errors.js (' + VIEW.split('\n').length + ' lines); rule mirror: ' + R.only.length + ' fields, ' + Object.keys(R.caps).length + ' caps, from ' + join(ROOT, 'firestore.rules'));
await runAll(LOGGER, VIEW);
const realFail = fail, realPass = pass, realFailed = failed.slice();
console.log(`\n${realFail ? '✗' : '✓'} ${realPass} passed, ${realFail} failed` + (realFailed.length ? '\n  ' + realFailed.join('\n  ') : ''));
let faultsMissed = 0;
if (ARGV.includes('--faults')) {
  console.log('\n== planted faults (each must turn at least one case red)');
  QUIET = !VERBOSE;
  for (const [name, which, from, to] of FAULTS) {
    const src = which === 'L' ? LOGGER : VIEW;
    const n = src.split(from).length - 1;
    if (n !== 1) { console.log(`  ✗ ${name}: the text to break is found ${n} times (must be 1) — update the fault`); faultsMissed++; continue; }
    const bad = src.replace(from, () => to);
    await runAll(which === 'L' ? bad : LOGGER, which === 'V' ? bad : VIEW);
    if (fail) console.log(`  ✓ caught: ${name} — ${fail} red, first: ✗ ${failed[0].replace(/\s+/g, ' ').slice(0, 300)}`);
    else { console.log(`  ✗ NOT caught: ${name}`); faultsMissed++; }
  }
  console.log(`\n${faultsMissed ? '✗' : '✓'} ${FAULTS.length - faultsMissed} of ${FAULTS.length} planted faults caught`);
}
process.exit(realFail || faultsMissed ? 1 : 0);
