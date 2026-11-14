#!/usr/bin/env node
/* The anonymous error log — the siteErrors block of firestore.rules, tested against the REAL Firestore
   emulator (2026-11-13). Modelled on tools/pm-rules-test.mjs; not part of checks.mjs (it needs Java and a
   few npm packages the repo deliberately does not carry).

   It tries every allow and deny of siteErrors/{autoId}: signed out, a student's create with the exact ten
   fields, an extra field, each field missing, each string at and over its cap, an empty message, each
   wrong type, an out-of-range or fractional line/col, a kind, lang or day the rule does not know, a doc id
   that is not 20 letters and digits, a day more than one day from the server's UTC date (two days ahead,
   a month ago, 9999-99-99, 0000-00-00, Feb 30) against yesterday, today and tomorrow allowed, a
   student's get / list / update / delete, an account with the teacher's email but email_verified false,
   the teacher's get, list, the console's two queries (newest first; older than a cutoff) and delete, and
   the teacher's update (refused). Then one case on each OLDER path (progress, config/class, liveQuiz,
   issueReports, micTakesMeta, an unmatched path) to show they still behave.

   --breaks: runs the same cases against 11 broken copies of the rules, made in memory from the file given
   (each break is one or more text replacements, each must apply exactly once), and prints how many cases each break
   turned red. Every break must turn at least one red. Found 2026-11-13: dropping hasAll ALONE changes nothing,
   because every field is also type-checked and a check on a missing field denies; hasAll stays as a second lock. (A "delete allowed" break is written as its own
   `allow delete:` line: request.resource is null on a delete, see pm-rules-test.mjs.)

   --site <repo>: also runs the REAL logger (app/boot.js SITE_ERRORS) against the emulator (since review round 2
   also: control characters land as U+FFFD and the progress save after them lands; the console's test entry
   through SITE_ERRORS.test() is read back by the teacher from the server). Firestore keeps one
   write queue per client, and a string with a lone surrogate (half an emoji) is never accepted: the SDK retries
   it for ever, and the student's progress save queued behind it never lands. The case fires the logger with
   that input (message, file, stack) and then writes progress/{uid} from the same client: the save must land.
   A control first sends the same input raw, to show the hazard is real on this emulator. Without --site that
   part counts as one failure.

   Java 21: ~/tools/java/jdk-21.0.13+9-jre (see pm-rules-test.mjs):
     export JAVA_HOME=~/tools/java/jdk-21.0.13+9-jre/Contents/Home; export PATH="$JAVA_HOME/bin:$PATH"
   In an empty scratch folder (NOT inside the repo):
     npm init -y
     npm i --cache <scratch>/npm-cache --legacy-peer-deps firebase-tools @firebase/rules-unit-testing firebase@10.12.2
     cp <repo>/tools/site-errors-rules-test.mjs <repo>/firestore.rules .
     # firebase.json:  { "firestore": { "rules": "firestore.rules" }, "emulators": { "firestore": { "port": 8091 }, "ui": { "enabled": false } } }
     npx firebase emulators:exec --only firestore --project demo-gc "node site-errors-rules-test.mjs firestore.rules --port 8091 --breaks --site <repo>"
   Exit 0 = every case passed on the real rules (and, with --breaks, every break was caught, and the real logger
   case passed).
   Last run: 2026-11-13 (review round 2 fixes; the rules unchanged since round 1), firestore.rules: 99 passed,
   0 failed; 14 of 14 breaks caught; the real logger: 6 of 6 (the raw control held the save 8 s; through the
   logger the save landed; control characters landed as U+FFFD with the save after them; the test entry read
   back by the teacher). Round 1: the real logger 4 of 4. With clean() made
   to do nothing the logger case went red (the save stayed pending); with clean() taken out of scrub() only, fits()
   dropped both docs (red: nothing sent, the save landed). The first version's 83 cases on the rules before this
   block (cda3b92, the "not published yet" state): 67 passed, 16 failed, exactly the 16 allows; not re-run since. */
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const ARGV = process.argv.slice(2);
const SITE = ARGV.includes('--site') ? ARGV[ARGV.indexOf('--site') + 1] : null;
const which = ARGV.find((a, i) => !a.startsWith('--') && !/^\d+$/.test(a) && ARGV[i - 1] !== '--site') || 'firestore.rules';
const PORT = +(ARGV[ARGV.indexOf('--port') + 1] || 0) || 8089;
/* The server checks the day against ITS UTC date: the cases are built from this machine's UTC date. */
const utcDay = n => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
const RULES = readFileSync(which, 'utf8');
/* Since 2026-11-14 firestore.rules gates the create with isSchool() (paste 2 moved in). A text without it is refused. */
if (!/function isSchool\(\)/.test(RULES)) { console.log(`\n✗ ${which} has no isSchool() (the school-accounts gate, in firestore.rules since 2026-11-14): 0 passed, 1 failed`); process.exit(1); }

const FIELDS = ['kind', 'message', 'file', 'line', 'col', 'stack', 'page', 'version', 'day', 'lang'];
const good = extra => Object.assign({ kind: 'error', message: "Uncaught TypeError: Cannot read properties of undefined (reading 'length')", file: '/app/lesson.js', line: 412, col: 17,
  stack: 'at caStepHtml (/app/activities.js:120:9)\nat /app/activities.js:300:5', page: '#class-activities/ca-23 set m4w2', version: '2026-11-13-f60507df73', day: utcDay(0), lang: 'en' }, extra || {});
const without = k => { const d = good(); delete d[k]; return d; };

async function suite(rulesText, quiet) {
  let pass = 0, fail = 0; const red = [];
  const env = await initializeTestEnvironment({ projectId: 'demo-gc', firestore: { rules: rulesText, host: '127.0.0.1', port: PORT } });
  await env.clearFirestore();
  const t = async (name, p, expectOk) => {
    let ok;
    try { await (expectOk ? assertSucceeds(p()) : assertFails(p())); ok = true; } catch (e) { ok = false; if (!quiet) console.log('     ', String(e.message || e).slice(0, 160)); }
    if (ok) pass++; else { fail++; red.push(name); }
    if (!quiet) console.log((ok ? '  ✓ ' : '  ✗ ') + name);
  };
  const say = s => { if (!quiet) console.log(s); };
  const FV = firebase.firestore.FieldValue;
  const A = env.authenticatedContext('uidA', { email: 'a@seq.org', email_verified: true }).firestore();
  const B = env.authenticatedContext('uidB', { email: 'b@seq.org', email_verified: true }).firestore();
  const T = env.authenticatedContext('teacher', { email: 'jhoffman@seq.org', email_verified: true }).firestore();
  const F = env.authenticatedContext('fakeT', { email: 'jhoffman@seq.org', email_verified: false }).firestore();
  const N = env.unauthenticatedContext().firestore();
  const col = db => db.collection('siteErrors');
  const seed = (id, d) => env.withSecurityRulesDisabled(c => c.firestore().doc('siteErrors/' + id).set(d));

  say('== siteErrors: who may create');
  await t('signed out: refused', () => col(N).add(good()), false);
  await t('an outside account (not @seq.org, not allowed by the teacher): refused (2026-11-13)', () => col(env.authenticatedContext('outsideX', { email: 'test9@gmail.example', email_verified: true }).firestore()).add(good()), false);
  await t('a signed-in student, the exact ten fields (add, the client\'s real write)', () => col(A).add(good()), true);
  await t('…an unhandledrejection doc, in Spanish, with an empty file and stack (line 0, col 0)', () => col(B).add(good({ kind: 'rejection', file: '', stack: '', line: 0, col: 0, lang: 'es', page: '#' })), true);
  await t('the teacher\'s own console may log too', () => col(T).add(good({ page: 'console #' })), true);
  await t('a set() under a chosen id of 20 letters and digits (the form of an auto-id): allowed', () => col(A).doc('a1B2c3D4e5F6g7H8i9J0').set(good()), true);

  say('== siteErrors: the doc id (the SDK\'s auto-ids are 20 letters and digits)');
  await t('an id that carries a name and a period (AnaLopez-uidA-period4) refused', () => col(A).doc('AnaLopez-uidA-period4').set(good()), false);
  await t('an id 1,400 characters long refused', () => col(A).doc('x'.repeat(1400)).set(good()), false);
  await t('an id of 19 letters and digits refused', () => col(A).doc('a1B2c3D4e5F6g7H8i9J').set(good()), false);
  await t('an id of 21 letters and digits refused', () => col(A).doc('a1B2c3D4e5F6g7H8i9J0x').set(good()), false);
  await t('an id of 20 with a dash in it refused', () => col(A).doc('a1B2c3D4e5-6g7H8i9J0').set(good()), false);

  say('== siteErrors: the day, against the server\'s UTC date (' + utcDay(0) + ')');
  for (const n of [-1, 0, 1]) await t(`day ${utcDay(n)} (UTC date ${n < 0 ? n : '+' + n}) accepted`, () => col(A).add(good({ day: utcDay(n) })), true);
  for (const [label, day] of [['two days ahead', utcDay(2)], ['two days back', utcDay(-2)], ['a month ago', utcDay(-30)], ['a year ahead', utcDay(366)], ['9999-99-99', '9999-99-99'], ['0000-00-00', '0000-00-00'], ['Feb 30', utcDay(0).slice(0, 4) + '-02-30'], ['month 13', utcDay(0).slice(0, 4) + '-13-01']])
    await t(`day ${day} (${label}) refused`, () => col(A).add(good({ day })), false);

  say('== siteErrors: the shape (hasOnly + hasAll)');
  await t('an extra field (uid) refused', () => col(A).add(good({ uid: 'uidA' })), false);
  await t('an extra field (name) refused', () => col(A).add(good({ name: 'Ana Lopez' })), false);
  await t('an extra field (period) refused', () => col(A).add(good({ period: '7' })), false);
  await t('an extra field (a server timestamp) refused', () => col(A).add(good({ at: FV.serverTimestamp() })), false);
  for (const k of FIELDS) await t(`missing ${k} refused`, () => col(A).add(without(k)), false);
  await t('an empty doc refused', () => col(A).add({}), false);

  say('== siteErrors: the caps (exactly at the cap accepted, one over refused)');
  for (const [k, n] of [['message', 300], ['file', 200], ['stack', 600], ['page', 120], ['version', 64]]) {
    await t(`${k} at ${n} accepted`, () => col(A).add(good({ [k]: 'x'.repeat(n) })), true);
    await t(`${k} at ${n + 1} refused`, () => col(A).add(good({ [k]: 'x'.repeat(n + 1) })), false);
  }
  await t('an empty message refused', () => col(A).add(good({ message: '' })), false);
  await t('line at 10,000,000 accepted', () => col(A).add(good({ line: 10000000 })), true);
  await t('line at 10,000,001 refused', () => col(A).add(good({ line: 10000001 })), false);
  await t('line -1 refused', () => col(A).add(good({ line: -1 })), false);
  await t('col -1 refused', () => col(A).add(good({ col: -1 })), false);
  await t('col at 10,000,001 refused', () => col(A).add(good({ col: 10000001 })), false);

  say('== siteErrors: wrong types and values');
  await t('kind "warning" refused', () => col(A).add(good({ kind: 'warning' })), false);
  await t('lang "fr" refused', () => col(A).add(good({ lang: 'fr' })), false);
  await t('day "today" refused', () => col(A).add(good({ day: 'today' })), false);
  await t('day "2026-1-1" refused', () => col(A).add(good({ day: '2026-1-1' })), false);
  await t('day with a time ("2026-11-13T10:42") refused', () => col(A).add(good({ day: '2026-11-13T10:42' })), false);
  await t('day as a timestamp refused', () => col(A).add(good({ day: FV.serverTimestamp() })), false);
  await t('message as a number refused', () => col(A).add(good({ message: 42 })), false);
  await t('file as null refused', () => col(A).add(good({ file: null })), false);
  await t('stack as an array refused', () => col(A).add(good({ stack: ['at f'] })), false);
  await t('page as a map refused', () => col(A).add(good({ page: { hash: '#' } })), false);
  await t('version as a number refused', () => col(A).add(good({ version: 20261113 })), false);
  await t('line as a string refused', () => col(A).add(good({ line: '412' })), false);
  await t('line as a fraction (1.5) refused', () => col(A).add(good({ line: 1.5 })), false);
  await t('col as a bool refused', () => col(A).add(good({ col: true })), false);
  await t('kind as a number refused', () => col(A).add(good({ kind: 1 })), false);
  await t('lang as null refused', () => col(A).add(good({ lang: null })), false);

  say('== siteErrors: read, update, delete');
  await seed('s1', good()); await seed('s2', good({ day: '2026-10-01' })); await seed('s3', good({ day: '2026-09-01' }));
  await t('a student cannot get a doc', () => col(A).doc('s1').get(), false);
  await t('a student cannot get the doc it just wrote', async () => { const r = await col(A).add(good({ message: 'mine' })); return col(A).doc(r.id).get(); }, false);
  await t('a student cannot list the collection', () => col(A).get(), false);
  await t('a student cannot run the console\'s query', () => col(A).orderBy('day', 'desc').limit(1000).get(), false);
  await t('a student cannot update a doc (set)', () => col(A).doc('s1').set(good({ message: 'changed' })), false);
  await t('a student cannot update a doc (merge)', () => col(A).doc('s1').set({ message: 'changed' }, { merge: true }), false);
  await t('a student cannot update a doc (update())', () => col(A).doc('s1').update({ message: 'changed' }), false);
  await t('a student cannot delete a doc', () => col(A).doc('s1').delete(), false);
  await t('signed out cannot get or list', async () => { try { await col(N).doc('s1').get(); } catch (e) { return col(N).get(); } throw new Error('signed-out get succeeded'); }, false);
  await t('the teacher\'s email with email_verified false cannot list', () => col(F).get(), false);
  await t('…nor delete', () => col(F).doc('s1').delete(), false);
  await t('the teacher gets a doc', () => col(T).doc('s1').get(), true);
  await t('the teacher lists the collection', () => col(T).get(), true);
  await t('the teacher runs the view\'s query (newest day first, 1000)', () => col(T).orderBy('day', 'desc').limit(1000).get(), true);
  await t('the teacher runs the delete\'s query (day before a cutoff, 400)', () => col(T).where('day', '<', '2026-10-14').limit(400).get(), true);
  await t('the teacher cannot update a doc (set)', () => col(T).doc('s1').set(good({ message: 'changed' })), false);
  await t('the teacher cannot update a doc (update())', () => col(T).doc('s1').update({ message: 'changed' }), false);
  await t('the teacher deletes a doc', () => col(T).doc('s2').delete(), true);
  await t('the teacher deletes in a batch (the view\'s Delete older than 30 days)', async () => { const b = T.batch(); b.delete(col(T).doc('s3')); return b.commit(); }, true);
  await t('a student cannot write into a subcollection under a doc', () => A.doc('siteErrors/s1/x/y').set({ a: 1 }), false);

  say('== older paths still behave');
  await t('progress: own read+write', async () => { await A.doc('progress/uidA').set({ x: 1 }); return A.doc('progress/uidA').get(); }, true);
  await t('progress: other student refused', () => B.doc('progress/uidA').get(), false);
  await t('progress: teacher reads', () => T.doc('progress/uidA').get(), true);
  await t('progress: teacher cannot write', () => T.doc('progress/uidA').set({ x: 2 }), false);
  await t('config/class: signed-in read', () => A.doc('config/class').get(), true);
  await t('config/class: an outside account (not @seq.org, not allowed) refused (2026-11-13)', () => env.authenticatedContext('outsideX', { email: 'test9@gmail.example', email_verified: true }).firestore().doc('config/class').get(), false);
  await t('config/class: student write refused', () => A.doc('config/class').set({ paused: true }), false);
  await t('config/class: teacher write', () => T.doc('config/class').set({ paused: false }), true);
  await t('liveQuiz/current: student write refused', () => A.doc('liveQuiz/current').set({ state: 'x' }), false);
  await t('issueReports: student read refused', () => A.doc('issueReports/r1').get(), false);
  await t('micTakesMeta/count: student cannot jump to 5', () => A.doc('micTakesMeta/count').set({ n: 5 }), false);
  await t('an unmatched path stays denied (foo/bar)', () => A.doc('foo/bar').set({ a: 1 }), false);

  await env.cleanup();
  return { pass, fail, red };
}

const BREAKS = [
  ['hasOnly dropped (any extra field)', ".keys().hasOnly(['kind', 'message', 'file', 'line', 'col', 'stack', 'page', 'version', 'day', 'lang'])", ".keys().size() >= 0"],
  /* hasAll alone is NOT a break: every one of the ten fields also has a type check, and a type check on a missing
     field is an evaluation error, which denies. So it is dropped TOGETHER with one field's checks here. */
  ['hasAll and the version checks dropped (version may be missing)', ".keys().hasAll(['kind', 'message', 'file', 'line', 'col', 'stack', 'page', 'version', 'day', 'lang'])\n            && request.resource.data.kind in", ".keys().size() >= 0\n            && request.resource.data.kind in",
    "            && request.resource.data.version is string\n            && request.resource.data.version.size() <= 64\n", ""],
  ['message cap raised to 3000', 'request.resource.data.message.size() <= 300', 'request.resource.data.message.size() <= 3000'],
  /* These three are anchored on the block's own last rule line and the line above it, not on the end of the file:
     the siteErrors block stopped being the last block on 2026-11-13 (song requests), and all three then found 0. */
  ['students may read', "            && request.resource.data.lang in ['en', 'es'];\n      allow read, delete: if isTeacher();\n    }\n", "            && request.resource.data.lang in ['en', 'es'];\n      allow read, delete: if isTeacher();\n      allow read: if isSignedIn();\n    }\n"],
  ['the teacher may update', "            && request.resource.data.lang in ['en', 'es'];\n      allow read, delete: if isTeacher();\n    }\n", "            && request.resource.data.lang in ['en', 'es'];\n      allow read, delete: if isTeacher();\n      allow update: if isTeacher();\n    }\n"],
  ['students may delete', "            && request.resource.data.lang in ['en', 'es'];\n      allow read, delete: if isTeacher();\n    }\n", "            && request.resource.data.lang in ['en', 'es'];\n      allow read, delete: if isTeacher();\n      allow delete: if isSignedIn();\n    }\n"],
  ['signed-out create allowed', 'allow create: if isSchool()\n            && errorId', 'allow create: if true\n            && errorId'],
  ['an outside account that is not allowed may create (left on isSignedIn())', 'allow create: if isSchool()\n            && errorId', 'allow create: if isSignedIn()\n            && errorId'],
  ['line may be any number', 'request.resource.data.line is int', 'request.resource.data.line is number'],
  ['the day check dropped', "request.resource.data.day.matches('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')", "request.resource.data.day.size() > 0"],
  ['a third language allowed', "request.resource.data.lang in ['en', 'es']", "request.resource.data.lang in ['en', 'es', 'fr']"],
  ['the kind check dropped', "request.resource.data.kind in ['error', 'rejection']", "true"],
  ['the doc id check dropped', "            && errorId.matches('^[A-Za-z0-9]{20}$')\n", ''],
  ['the day window dropped', '            && siteErrorDayNear(request.resource.data.day)\n', ''],
  ['the day window two days wide', "&& stated <= utcDay + duration.value(1, 'd');", "&& stated <= utcDay + duration.value(2, 'd');"],
];

/* Every break applies (until 2026-11-14 a text without isSchool() skipped the one that leaves the gate on isSignedIn()). */
const ACTIVE_BREAKS = BREAKS;
console.log(`== site-errors-rules-test: ${which} on the emulator at 127.0.0.1:${PORT} (isSchool() gates the create; ${ACTIVE_BREAKS.length} breaks)`);
const real = await suite(RULES, false);
console.log(`\n${real.fail ? '✗' : '✓'} ${which}: ${real.pass} passed, ${real.fail} failed`);
let missed = 0;
if (ARGV.includes('--breaks')) {
  console.log('\n== broken copies of the rules (each must turn at least one case red)');
  for (const [name, ...pairs] of ACTIVE_BREAKS) {
    let broken = RULES, bad = '';
    for (let i = 0; i < pairs.length; i += 2) {
      const n = broken.split(pairs[i]).length - 1;
      if (n !== 1) { bad = `the text to break is found ${n} times (must be 1): ${pairs[i].slice(0, 60)}`; break; }
      broken = broken.replace(pairs[i], () => pairs[i + 1]);
    }
    if (bad) { console.log(`  ✗ ${name}: ${bad}`); missed++; continue; }
    const r = await suite(broken, true);
    if (r.fail) console.log(`  ✓ caught: ${name} — ${r.fail} red: ${r.red.slice(0, 3).join(' | ')}${r.red.length > 3 ? ' | …' : ''}`);
    else { console.log(`  ✗ NOT caught: ${name}`); missed++; }
  }
  console.log(`\n${missed ? '✗' : '✓'} ${ACTIVE_BREAKS.length - missed} of ${ACTIVE_BREAKS.length} breaks caught`);
}

/* ── The real logger writing through the emulator (last: the control leaves a write that never lands) ── */
let logFail = 0;
{
  console.log('\n== the real logger (app/boot.js SITE_ERRORS): hostile text never holds up the progress save');
  if (!SITE) { console.log('  ✗ not run: pass --site <repo> (the folder holding app/boot.js)'); logFail++; }
  else {
    firebase.firestore.setLogLevel('silent');
    const env = await initializeTestEnvironment({ projectId: 'demo-gc', firestore: { rules: RULES, host: '127.0.0.1', port: PORT } });
    await env.clearFirestore();
    const within = (p, ms) => Promise.race([p.then(() => 'landed', e => 'refused: ' + (e.code || e.message)), new Promise(r => setTimeout(() => r('pending'), ms))]);
    const LONE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/;
    const check = (name, cond, detail) => { console.log((cond ? '  ✓ ' : '  ✗ ') + name + (detail ? '  (' + detail + ')' : '')); if (!cond) logFail++; };
    const C = env.authenticatedContext('uidCtl', { email: 'c@seq.org', email_verified: true }).firestore();
    const ctl = C.collection('siteErrors').add(good({ message: 'Unexpected token in "great job \uD83D"' }));
    const ctlSave = C.doc('progress/uidCtl').set({ x: 1 });
    const cs = await within(ctlSave, 8000);
    check('control: the same text sent RAW holds the progress save queued after it (the hazard is real here)', cs === 'pending', 'progress save ' + cs + ' after 8 s');
    void ctl;

    const D = env.authenticatedContext('uidLog', { email: 'd@seq.org', email_verified: true }).firestore();
    const src = readFileSync(join(SITE, 'app', 'boot.js'), 'utf8');
    const L0 = src.indexOf('/* ── Error log (2026-11-13)'), L1 = src.indexOf('/* ── Global safety net ──');
    const sent = [], landed = [];
    const ctx = { console: { error() {}, warn() {}, log() {} }, setTimeout, clearTimeout, getLang: () => 'en', location: { origin: 'https://gc.example', hash: '#songs' },
      auth: { currentUser: { uid: 'uidLog', email: 'd@seq.org', displayName: 'Dee Test' } },
      /* Copied into a plain object of THIS realm: the SDK refuses an object made in the vm's realm. */
      db: { collection: n => ({ add: d => { const doc = { ...d }; sent.push(doc); const p = D.collection(n).add(doc); p.then(r => landed.push(r.id), () => {}); return p; } }) } };
    vm.createContext(ctx);
    vm.runInContext('var lastSetId = "m4w2", IS_TEACHER_MODE = false;\n' + src.slice(L0, L1) + '\n;globalThis.__SE = SITE_ERRORS;', ctx);
    ctx.__SE.report('error', { message: 'Unexpected token in "great job \uD83D"', filename: 'https://gc.example/app/x\uD83D.js', lineno: 3, colno: 4, error: { stack: 'E\n    at f\uD83D (https://gc.example/app/a.js:1:2)' } });
    ctx.__SE.report('rejection', { reason: 'a\uDE00b' });
    for (let i = 0; i < 50 && sent.length < 1; i++) await new Promise(r => setTimeout(r, 100));
    const save = await within(D.doc('progress/uidLog').set({ x: 2 }), 10000);
    check('the logger sent its doc, then the progress save from the same client landed', sent.length >= 1 && save === 'landed', `${sent.length} sent, progress save ${save}`);
    for (let i = 0; i < 100 && landed.length < 2; i++) await new Promise(r => setTimeout(r, 100));
    check('both log docs landed', landed.length === 2, `${landed.length} landed`);
    let stored = [];
    await env.withSecurityRulesDisabled(async c => { stored = (await c.firestore().collection('siteErrors').get()).docs.map(d => d.data()); });
    const strs = stored.flatMap(d => Object.values(d).filter(v => typeof v === 'string'));
    check('no stored field holds a lone surrogate; the halves read U+FFFD', stored.length === 2 && !strs.some(v => LONE.test(v)) && stored.some(d => d.message === 'Unexpected token in "great job \uFFFD"') && stored.some(d => d.message === 'a\uFFFDb'), stored.map(d => JSON.stringify(d.message)).join(' | '));

    /* Review round 2: a fresh logger on a fresh client (the same boot.js slice). */
    const loggerOn = (client, user) => {
      const out = { sent: [], landed: [] };
      const c2 = { console: { error() {}, warn() {}, log() {} }, setTimeout, clearTimeout, getLang: () => 'en', location: { origin: 'https://gc.example', hash: '#errors' },
        auth: { currentUser: user },
        db: { collection: n => ({ add: d => { const doc = { ...d }; out.sent.push(doc); const p = client.collection(n).add(doc); p.then(r => out.landed.push(r.id), () => {}); return p; } }) } };
      vm.createContext(c2);
      vm.runInContext('var lastSetId = "", IS_TEACHER_MODE = true;\n' + src.slice(L0, L1) + '\n;globalThis.__SE = SITE_ERRORS;', c2);
      out.se = c2.__SE;
      return out;
    };
    /* R2-8: C0 controls and U+FFFE / U+FFFF, which Node's transport takes, become U+FFFD before they are sent. */
    const E = env.authenticatedContext('uidC0', { email: 'e@seq.org', email_verified: true }).firestore();
    const lc = loggerOn(E, { uid: 'uidC0', email: 'e@seq.org', displayName: 'Eve Quill' });
    lc.se.report('error', { message: 'a\u0000b\u0007c\u000Bd\u001Fe\uFFFEf\uFFFFg\th', filename: 'https://gc.example/app/x\u0001.js', lineno: 1, colno: 2 });
    for (let i = 0; i < 50 && lc.sent.length < 1; i++) await new Promise(r => setTimeout(r, 100));
    const saveC0 = await within(E.doc('progress/uidC0').set({ x: 3 }), 10000);
    for (let i = 0; i < 50 && lc.landed.length < 1; i++) await new Promise(r => setTimeout(r, 100));
    let c0 = null;
    await env.withSecurityRulesDisabled(async c => { const snap = await c.firestore().collection('siteErrors').doc(lc.landed[0] || 'none').get(); c0 = snap.exists ? snap.data() : null; });
    check('control characters (NUL, BEL, VT, US, U+FFFE, U+FFFF): the entry lands as U+FFFD, tab kept, and the progress save queued after it lands', c0 && c0.message === 'a\uFFFDb\uFFFDc\uFFFDd\uFFFDe\uFFFDf\uFFFDg\th' && c0.file === '/app/x\uFFFD.js' && saveC0 === 'landed', `${lc.sent.length} sent, stored ${c0 && JSON.stringify(c0.message)}, progress save ${saveC0}`);
    /* R2-1: the console's test, from the teacher's own client: SITE_ERRORS.test() sends, the read-back the
       console makes (get from the server, by the id add() gave) finds the same doc. */
    const TT = env.authenticatedContext('teacher', { email: 'jhoffman@seq.org', email_verified: true }).firestore();
    const lt = loggerOn(TT, { uid: 'teacher', email: 'jhoffman@seq.org', displayName: 'Jonathan Hoffman' });
    const tr = await Promise.race([lt.se.test(), new Promise(r => setTimeout(() => r({ state: 'timeout' }), 15000))]);
    let back = null;
    if (tr.state === 'sent' && tr.id) { try { const snap = await TT.collection('siteErrors').doc(tr.id).get({ source: 'server' }); back = snap.exists ? snap.data() : 'missing'; } catch (e) { back = 'read failed: ' + (e.code || e.message); } }
    const same = back && typeof back === 'object' && Object.keys(tr.doc).length === Object.keys(back).length && Object.keys(tr.doc).every(k => back[k] === tr.doc[k]);
    check('"Send a test entry": test() answers "sent" with an id; the teacher reads it back from the server, field for field', tr.state === 'sent' && same && back.message === lt.se.TEST_MESSAGE, `${tr.state}, read back ${typeof back === 'object' ? JSON.stringify(back && back.message) : back}`);
  }
  console.log(`\n${logFail ? '✗' : '✓'} the real logger: ${logFail} failed`);
}
process.exit(real.fail || missed || logFail ? 1 : 0);
