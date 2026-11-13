#!/usr/bin/env node
/* The anonymous error log — the siteErrors block of firestore.rules, tested against the REAL Firestore
   emulator (2026-11-13). Modelled on tools/pm-rules-test.mjs; not part of checks.mjs (it needs Java and a
   few npm packages the repo deliberately does not carry).

   It tries every allow and deny of siteErrors/{autoId}: signed out, a student's create with the exact ten
   fields, an extra field, each field missing, each string at and over its cap, an empty message, each
   wrong type, an out-of-range or fractional line/col, a kind, lang or day the rule does not know, a
   student's get / list / update / delete, an account with the teacher's email but email_verified false,
   the teacher's get, list, the console's two queries (newest first; older than a cutoff) and delete, and
   the teacher's update (refused). Then one case on each OLDER path (progress, config/class, liveQuiz,
   issueReports, micTakesMeta, an unmatched path) to show they still behave.

   --breaks: runs the same cases against 11 broken copies of the rules, made in memory from the file given
   (each break is one or more text replacements, each must apply exactly once), and prints how many cases each break
   turned red. Every break must turn at least one red. Found 2026-11-13: dropping hasAll ALONE changes nothing,
   because every field is also type-checked and a check on a missing field denies; hasAll stays as a second lock. (A "delete allowed" break is written as its own
   `allow delete:` line: request.resource is null on a delete, see pm-rules-test.mjs.)

   Java 21: ~/tools/java/jdk-21.0.13+9-jre (see pm-rules-test.mjs):
     export JAVA_HOME=~/tools/java/jdk-21.0.13+9-jre/Contents/Home; export PATH="$JAVA_HOME/bin:$PATH"
   In an empty scratch folder (NOT inside the repo):
     npm init -y
     npm i --cache <scratch>/npm-cache --legacy-peer-deps firebase-tools @firebase/rules-unit-testing firebase@10.12.2
     cp <repo>/tools/site-errors-rules-test.mjs <repo>/firestore.rules .
     # firebase.json:  { "firestore": { "rules": "firestore.rules" }, "emulators": { "firestore": { "port": 8091 }, "ui": { "enabled": false } } }
     npx firebase emulators:exec --only firestore --project demo-gc "node site-errors-rules-test.mjs firestore.rules --port 8091 --breaks"
   Exit 0 = every case passed on the real rules (and, with --breaks, every break was caught). */
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { readFileSync } from 'node:fs';

const ARGV = process.argv.slice(2);
const which = ARGV.find(a => !a.startsWith('--') && !/^\d+$/.test(a)) || 'firestore.rules';
const PORT = +(ARGV[ARGV.indexOf('--port') + 1] || 0) || 8089;
const RULES = readFileSync(which, 'utf8');

const FIELDS = ['kind', 'message', 'file', 'line', 'col', 'stack', 'page', 'version', 'day', 'lang'];
const good = extra => Object.assign({ kind: 'error', message: "Uncaught TypeError: Cannot read properties of undefined (reading 'length')", file: '/app/lesson.js', line: 412, col: 17,
  stack: 'at caStepHtml (/app/activities.js:120:9)\nat /app/activities.js:300:5', page: '#class-activities/ca-23 set m4w2', version: '2026-11-13-f60507df73', day: '2026-11-13', lang: 'en' }, extra || {});
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
  const A = env.authenticatedContext('uidA', { email: 'a@student.org', email_verified: true }).firestore();
  const B = env.authenticatedContext('uidB', { email: 'b@student.org', email_verified: true }).firestore();
  const T = env.authenticatedContext('teacher', { email: 'jhoffman@seq.org', email_verified: true }).firestore();
  const F = env.authenticatedContext('fakeT', { email: 'jhoffman@seq.org', email_verified: false }).firestore();
  const N = env.unauthenticatedContext().firestore();
  const col = db => db.collection('siteErrors');
  const seed = (id, d) => env.withSecurityRulesDisabled(c => c.firestore().doc('siteErrors/' + id).set(d));

  say('== siteErrors: who may create');
  await t('signed out: refused', () => col(N).add(good()), false);
  await t('a signed-in student, the exact ten fields (add, the client\'s real write)', () => col(A).add(good()), true);
  await t('…an unhandledrejection doc, in Spanish, with an empty file and stack (line 0, col 0)', () => col(B).add(good({ kind: 'rejection', file: '', stack: '', line: 0, col: 0, lang: 'es', page: '#' })), true);
  await t('the teacher\'s own console may log too', () => col(T).add(good({ page: 'console #' })), true);
  await t('a set() under a chosen id is a create too: allowed', () => col(A).doc('chosen-id').set(good()), true);

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
  ['students may read', '      allow read, delete: if isTeacher();\n    }\n  }\n}', '      allow read, delete: if isTeacher();\n      allow read: if isSignedIn();\n    }\n  }\n}'],
  ['the teacher may update', '      allow read, delete: if isTeacher();\n    }\n  }\n}', '      allow read, delete: if isTeacher();\n      allow update: if isTeacher();\n    }\n  }\n}'],
  ['students may delete', '      allow read, delete: if isTeacher();\n    }\n  }\n}', '      allow read, delete: if isTeacher();\n      allow delete: if isSignedIn();\n    }\n  }\n}'],
  ['signed-out create allowed', 'match /siteErrors/{errorId} {\n      allow create: if isSignedIn()', 'match /siteErrors/{errorId} {\n      allow create: if true'],
  ['line may be any number', 'request.resource.data.line is int', 'request.resource.data.line is number'],
  ['the day check dropped', "request.resource.data.day.matches('^[0-9]{4}-[0-9]{2}-[0-9]{2}$')", "request.resource.data.day.size() > 0"],
  ['a third language allowed', "request.resource.data.lang in ['en', 'es']", "request.resource.data.lang in ['en', 'es', 'fr']"],
  ['the kind check dropped', "request.resource.data.kind in ['error', 'rejection']", "true"],
];

console.log(`== site-errors-rules-test: ${which} on the emulator at 127.0.0.1:${PORT}`);
const real = await suite(RULES, false);
console.log(`\n${real.fail ? '✗' : '✓'} ${which}: ${real.pass} passed, ${real.fail} failed`);
let missed = 0;
if (ARGV.includes('--breaks')) {
  console.log('\n== broken copies of the rules (each must turn at least one case red)');
  for (const [name, ...pairs] of BREAKS) {
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
  console.log(`\n${missed ? '✗' : '✓'} ${BREAKS.length - missed} of ${BREAKS.length} breaks caught`);
}
process.exit(real.fail || missed ? 1 : 0);
