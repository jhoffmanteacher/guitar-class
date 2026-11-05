#!/usr/bin/env node
/* Practice minutes — firestore.rules, tested against the REAL Firestore emulator
   (2026-11-01). Not part of checks.mjs: it needs Java and a few npm packages
   the repo deliberately does not carry.

   It tries every allow and deny in the minutes/{uid}/days|weeks blocks (the daily
   cap, the exact field lists, a client-chosen timestamp, another student, the
   teacher, signed out, delete, a bad id) and then re-checks one rule on each
   OLDER path to show they still behave. Last run: 66 passed, 0 failed (before the heartbeats
   section was removed 2026-11-05; it needs Java, so it has not been re-run since).

   To run it, in an empty scratch folder (NOT inside the repo):
     npm init -y
     npm i --legacy-peer-deps firebase-tools @firebase/rules-unit-testing firebase@10.12.2
     cp <repo>/tools/pm-rules-test.mjs <repo>/firestore.rules .
     # firebase.json:  { "firestore": { "rules": "firestore.rules" }, "emulators": { "firestore": { "port": 8089 }, "ui": { "enabled": false } } }
     npx firebase emulators:exec --only firestore --project demo-gc "node pm-rules-test.mjs firestore.rules"
   (Java 21 must be on PATH. Pass the rules file as the argument.) */
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { readFileSync } from 'node:fs';

const which = process.argv[2] || 'firestore.rules';
let pass = 0, fail = 0;
const t = async (name, p, expectOk) => {
  let ok;
  try { await (expectOk ? assertSucceeds(p()) : assertFails(p())); ok = true; } catch (e) { ok = false; console.log('     ', String(e.message || e).slice(0, 160)); }
  if (ok) pass++; else fail++;
  console.log((ok ? '  ✓ ' : '  ✗ ') + name);
};
const env = await initializeTestEnvironment({ projectId: 'demo-gc', firestore: { rules: readFileSync(which, 'utf8'), host: '127.0.0.1', port: 8089 } });
const FV = firebase.firestore.FieldValue, TS = firebase.firestore.Timestamp;
const A = env.authenticatedContext('uidA', { email: 'a@student.org', email_verified: true }).firestore();
const B = env.authenticatedContext('uidB', { email: 'b@student.org', email_verified: true }).firestore();
const T = env.authenticatedContext('teacher', { email: 'jhoffman@seq.org', email_verified: true }).firestore();
const N = env.unauthenticatedContext().firestore();
const day = (db, uid, d) => db.doc(`minutes/${uid}/days/${d}`);
const wk = (db, uid, w) => db.doc(`minutes/${uid}/weeks/${w}`);

if (which.includes('orig')) {
  console.log('== existing rules, baseline');
} else {
  console.log('== minutes/{uid}/days');
  await t('own day, 600 s', () => day(A, 'uidA', '2026-11-16').set({ seconds: 600 }), true);
  await t('own day, increment merge-set (the client\'s real write)', () => day(A, 'uidA', '2026-11-17').set({ seconds: FV.increment(60) }, { merge: true }), true);
  await t('…and a second increment on the same doc', () => day(A, 'uidA', '2026-11-17').set({ seconds: FV.increment(60) }, { merge: true }), true);
  await t('exactly the cap, 1200 s', () => day(A, 'uidA', '2026-11-18').set({ seconds: 1200 }), true);
  await t('1201 s refused', () => day(A, 'uidA', '2026-11-19').set({ seconds: 1201 }), false);
  await t('an increment that pushes the stored day past the cap is refused', async () => { await day(A, 'uidA', '2026-11-20').set({ seconds: 1190 }); return day(A, 'uidA', '2026-11-20').set({ seconds: FV.increment(30) }, { merge: true }); }, false);
  await t('negative refused', () => day(A, 'uidA', '2026-11-21').set({ seconds: -5 }), false);
  await t('string seconds refused', () => day(A, 'uidA', '2026-11-22').set({ seconds: '60' }), false);
  await t('extra field refused', () => day(A, 'uidA', '2026-11-23').set({ seconds: 60, name: 'x' }), false);
  await t('missing seconds (empty doc) refused', () => day(A, 'uidA', '2026-11-24').set({}), false);
  await t('bad day id refused', () => day(A, 'uidA', 'monday').set({ seconds: 60 }), false);
  await t('another student\'s tree refused', () => day(B, 'uidA', '2026-11-16').set({ seconds: 60 }), false);
  await t('signed out refused', () => day(N, 'uidA', '2026-11-16').set({ seconds: 60 }), false);
  await t('the teacher cannot write it either', () => day(T, 'uidA', '2026-11-16').set({ seconds: 60 }), false);
  await t('no delete', () => day(A, 'uidA', '2026-11-16').delete(), false);
  console.log('== minutes/{uid}/weeks');
  await t('own week { seconds, goalSeconds, hit }', () => wk(A, 'uidA', '2026-W47').set({ seconds: 1800, goalSeconds: 1800, hit: true }), true);
  await t('own week via merge + increment', () => wk(A, 'uidA', '2026-W48').set({ seconds: FV.increment(600), goalSeconds: 1800, hit: false }, { merge: true }), true);
  await t('a merge that omits hit keeps the stored one (the client sends hit only when it must): allowed on an existing week', async () => { await wk(A, 'uidA', '2026-W52').set({ seconds: 60, goalSeconds: 1800, hit: true }); return wk(A, 'uidA', '2026-W52').set({ seconds: FV.increment(60), goalSeconds: 1800 }, { merge: true }); }, true);
  await t('…but creating a week doc without hit is refused', () => wk(A, 'uidA', '2027-W01').set({ seconds: FV.increment(60), goalSeconds: 1800 }, { merge: true }), false);
  await t('week at 7 × cap (8400)', () => wk(A, 'uidA', '2026-W49').set({ seconds: 8400, goalSeconds: 1800, hit: true }), true);
  await t('week above 8400 refused', () => wk(A, 'uidA', '2026-W50').set({ seconds: 8401, goalSeconds: 1800, hit: true }), false);
  await t('missing hit refused', () => wk(A, 'uidA', '2026-W51').set({ seconds: 60, goalSeconds: 1800 }), false);
  await t('hit not a bool refused', () => wk(A, 'uidA', '2026-W51').set({ seconds: 60, goalSeconds: 1800, hit: 'yes' }), false);
  await t('extra field refused', () => wk(A, 'uidA', '2026-W51').set({ seconds: 60, goalSeconds: 1800, hit: true, grade: 'A' }), false);
  await t('goalSeconds negative refused', () => wk(A, 'uidA', '2026-W51').set({ seconds: 60, goalSeconds: -1, hit: true }), false);
  await t('bad week id refused', () => wk(A, 'uidA', '2026-47').set({ seconds: 60, goalSeconds: 1800, hit: true }), false);
  await t('another student refused', () => wk(B, 'uidA', '2026-W47').set({ seconds: 60, goalSeconds: 1800, hit: true }), false);
  console.log('== minutes reads');
  await t('owner reads own day', () => day(A, 'uidA', '2026-11-16').get(), true);
  await t('owner lists own weeks', () => A.collection('minutes/uidA/weeks').get(), true);
  await t('owner queries own days by document id (the client\'s load)', () => A.collection('minutes/uidA/days').where(firebase.firestore.FieldPath.documentId(), '>=', '2026-11-16').get(), true);
  await t('another student cannot read', () => day(B, 'uidA', '2026-11-16').get(), false);
  await t('another student cannot list', () => B.collection('minutes/uidA/weeks').get(), false);
  await t('the teacher cannot read', () => day(T, 'uidA', '2026-11-16').get(), false);
  await t('signed out cannot read', () => day(N, 'uidA', '2026-11-16').get(), false);
  await t('nothing else under minutes is writable (minutes/uidA/other/x)', () => A.doc('minutes/uidA/other/x').set({ seconds: 1 }), false);
  await t('nor the parent doc minutes/uidA', () => A.doc('minutes/uidA').set({ seconds: 1 }), false);
  await t('heartbeats/{id} is gone: no write, no read (the block was deleted 2026-11-05)', async () => { await A.doc('heartbeats/a1b2c3d4e5f60718293a4b5c').set({ period: '7', lastSeen: FV.serverTimestamp() }); }, false);
  await t('…and a signed-in read of the collection is refused', () => B.collection('heartbeats').get(), false);
}
console.log('== existing rules still behave (baseline checks on every older path)');
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
console.log(`\n${fail ? '✗' : '✓'} ${which}: ${pass} passed, ${fail} failed`);
await env.cleanup();
process.exit(fail ? 1 : 0);
