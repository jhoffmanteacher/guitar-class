#!/usr/bin/env node
/* Practice minutes — firestore.rules, tested against the REAL Firestore emulator
   (2026-11-01). Not part of checks.mjs: it needs Java and a few npm packages
   the repo deliberately does not carry.

   It tries every allow and deny in the minutes/{uid}/days|weeks blocks (the daily
   cap, the exact field lists, another student, the teacher, signed out, delete, a bad id),
   in minutes/{uid}/meta/board (the private tag), weekBoard/{tag} (the Top 5) and
   rankBoard/{tag} (the class rank): the shape of each doc, the caps, writing under someone
   else's tag, no uid or name in a board doc, no delete, and minutesBoard having no rules.
   It also tries the recorded takes (micTakes/{uid}-{coach|nr|pw}, who may save one and only while the
   teacher has collection on), their audio chunks (the size cap, the exact fields, written before the take
   doc exists), that only the teacher reads or deletes them, and the micTakesMeta/count counter.
   Then it re-checks one rule on each OLDER path to show they still behave.
   2026-11-06: the teacher may READ minutes/{uid}/weeks/* (the console's Practice minutes view) and
   nothing else under minutes/ — a "minutes/{uid}/weeks: the teacher reads" section pins it.
   Last run: 2026-11-06, 191 passed, 0 failed (179 before the teacher-weeks section). Three scratch breaks of the
   2026-11-06 rule each turned cases red: the new read line dropped (2 red), a teacher read on the whole tree (6 red),
   a teacher write on weeks (3 red). Earlier (2026-11-05, 179 passed, 0 failed): The rules were also broken in scratch copies and every
   break turned at least one case red: the board rules 12 ways (tag check dropped on weekBoard and on
   rankBoard, a uid field allowed on each, minutesBoard back, tag updatable, tag readable by all,
   delete allowed on each of three, period 5, a 500-day cap), and the recording rules 16 ways (the
   collection switch dropped on a take and on a chunk, any take or chunk id, no uid check, takes or
   chunks readable by students, a student delete, the size cap raised, any chunk fields, no bytes
   check, a fourth game name, a string "true" counted as on, the counter taking any increase, any
   first value, or a public read). (49 passed before the board cases, 66 with the heartbeats
   section before that.) KNOWN LENIENCY it pins: a chunk with no `i` is accepted (hasOnly lists the
   allowed fields, it does not require them); the console reads chunks by document id, so nothing
   depends on `i`. Tightening it would be a firestore.rules change and a console paste.
   A "delete allowed" break written as one `allow ..., delete: if ... && request.resource...` line is
   not a real break (request.resource is null on a delete, so the condition errors and denies):
   write it as a separate `allow delete: if ...` line.
   The Mac has no Homebrew and no system Java. Java 21 lives at ~/tools/java/jdk-21.0.13+9-jre (a
   Temurin JRE from adoptium.net, sha256 checked; the tarball and its checksum are in
   ~/tools/java/download). Use it without installing anything:
     export JAVA_HOME=~/tools/java/jdk-21.0.13+9-jre/Contents/Home; export PATH="$JAVA_HOME/bin:$PATH"
   If npm fails with EACCES in ~/.npm/_cacache, add `--cache <scratch>/npm-cache`.

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
const C = env.authenticatedContext('uidC', { email: 'c@student.org', email_verified: true }).firestore();
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
  await t('the teacher cannot read a day', () => day(T, 'uidA', '2026-11-16').get(), false);
  console.log('== minutes/{uid}/weeks: the teacher reads (2026-11-06, the console\'s Practice minutes view) and nothing else');
  await t('the teacher reads another student\'s week doc', () => wk(T, 'uidA', '2026-W47').get(), true);
  await t('the teacher lists a student\'s weeks (the console\'s real read, from the server)', () => T.collection('minutes/uidA/weeks').get(), true);
  await t('the teacher cannot list a student\'s days', () => T.collection('minutes/uidA/days').get(), false);
  await t('the teacher cannot read meta/board (the tag)', () => T.doc('minutes/uidA/meta/board').get(), false);
  await t('the teacher cannot write a week doc', () => wk(T, 'uidA', '2026-W47').set({ seconds: 60, goalSeconds: 3600, hit: false }), false);
  await t('the teacher cannot increment a week doc', () => wk(T, 'uidA', '2026-W47').set({ seconds: FV.increment(60) }, { merge: true }), false);
  await t('the teacher cannot delete a week doc', () => wk(T, 'uidA', '2026-W47').delete(), false);
  await t('another student cannot read a week doc', () => wk(B, 'uidA', '2026-W47').get(), false);
  await t('signed out cannot read a week doc', () => wk(N, 'uidA', '2026-W47').get(), false);
  await t('an account with the teacher\'s email but email_verified false cannot read a week', () => env.authenticatedContext('fakeT', { email: 'jhoffman@seq.org', email_verified: false }).firestore().doc('minutes/uidA/weeks/2026-W47').get(), false);
  await t('the teacher cannot read the parent doc minutes/uidA', () => T.doc('minutes/uidA').get(), false);
  await t('the teacher cannot read some other subcollection (minutes/uidA/other/x)', () => T.doc('minutes/uidA/other/x').get(), false);
  await t('signed out cannot read', () => day(N, 'uidA', '2026-11-16').get(), false);
  await t('nothing else under minutes is writable (minutes/uidA/other/x)', () => A.doc('minutes/uidA/other/x').set({ seconds: 1 }), false);
  await t('nor the parent doc minutes/uidA', () => A.doc('minutes/uidA').set({ seconds: 1 }), false);
  await t('heartbeats/{id} is gone: a signed-in write is refused (the block was deleted 2026-11-05)', async () => { await A.doc('heartbeats/a1b2c3d4e5f60718293a4b5c').set({ period: '7', lastSeen: FV.serverTimestamp() }); }, false);
  await t('…and a signed-in read of the collection is refused', () => B.collection('heartbeats').get(), false);

  /* The private tag, the Top 5 (weekBoard) and the class rank (rankBoard). Added 2026-11-05.
     The point of these rules is Jonathan's standing rule: nothing readable by every signed-in
     account may tie a uid, name or email to minutes or a period. So besides the allows, every
     way of putting a uid in a board doc, or of writing under someone else's tag, must be refused.
     uidC never gets a tag until the KNOWN LIMIT tests at the very end. */
  const TAGA = 'a1b2c3d4e5f60718293a4b5c6d7e8f90', TAGB = '0123456789abcdef0123456789abcdef', TAGC = 'fedcba9876543210fedcba9876543210';
  const META = (db, uid) => db.doc(`minutes/${uid}/meta/board`);
  const WB = (db, tag) => db.doc(`weekBoard/${tag}`);
  const RB = (db, tag) => db.doc(`rankBoard/${tag}`);
  console.log('== minutes/{uid}/meta/board (the private name tag)');
  await t('a tag with a capital letter refused', () => META(B, 'uidB').set({ id: TAGA.toUpperCase() }), false);
  await t('31 characters refused', () => META(B, 'uidB').set({ id: TAGB.slice(0, 31) }), false);
  await t('33 characters refused', () => META(B, 'uidB').set({ id: TAGB + '0' }), false);
  await t('a non-hex letter (g) refused', () => META(B, 'uidB').set({ id: 'g' + TAGB.slice(1) }), false);
  await t('a number, not a string, refused', () => META(B, 'uidB').set({ id: 12345678901234567890 }), false);
  await t('an extra field (uid beside the tag) refused', () => META(B, 'uidB').set({ id: TAGB, uid: 'uidB' }), false);
  await t('an empty doc refused', () => META(B, 'uidB').set({}), false);
  await t('A creates its own tag (32 lowercase hex)', () => META(A, 'uidA').set({ id: TAGA }), true);
  await t('B creates its own tag', () => META(B, 'uidB').set({ id: TAGB }), true);
  await t('the tag cannot be changed (create-only)', () => META(A, 'uidA').set({ id: TAGC }), false);
  await t('the tag cannot be deleted', () => META(A, 'uidA').delete(), false);
  await t('A reads its own tag', () => META(A, 'uidA').get(), true);
  await t('another student cannot read A\'s tag', () => META(B, 'uidA').get(), false);
  await t('the teacher cannot read it', () => META(T, 'uidA').get(), false);
  await t('signed out cannot read it', () => META(N, 'uidA').get(), false);
  await t('B cannot create a tag in uidC\'s tree', () => META(B, 'uidC').set({ id: TAGC }), false);
  await t('the teacher cannot create one for uidC', () => META(T, 'uidC').set({ id: TAGC }), false);
  await t('signed out cannot create one', () => META(N, 'uidC').set({ id: TAGC }), false);

  console.log('== weekBoard/{tag}  { week, period, seconds }');
  await t('A writes under its own tag', () => WB(A, TAGA).set({ week: '2026-W45', period: '7', seconds: 600 }), true);
  await t('…and a new week overwrites it (update)', () => WB(A, TAGA).set({ week: '2026-W46', period: '7', seconds: 60 }), true);
  await t('period 4', () => WB(A, TAGA).set({ week: '2026-W46', period: '4', seconds: 60 }), true);
  await t('period CAS', () => WB(A, TAGA).set({ week: '2026-W46', period: 'CAS', seconds: 60 }), true);
  await t('0 seconds', () => WB(A, TAGA).set({ week: '2026-W46', period: '7', seconds: 0 }), true);
  await t('exactly 7 × the daily cap (8400)', () => WB(A, TAGA).set({ week: '2026-W46', period: '7', seconds: 8400 }), true);
  await t('8401 refused', () => WB(A, TAGA).set({ week: '2026-W46', period: '7', seconds: 8401 }), false);
  await t('negative refused', () => WB(A, TAGA).set({ week: '2026-W46', period: '7', seconds: -1 }), false);
  await t('seconds as a string refused', () => WB(A, TAGA).set({ week: '2026-W46', period: '7', seconds: '60' }), false);
  await t('a period the site does not know (5) refused', () => WB(A, TAGA).set({ week: '2026-W46', period: '5', seconds: 60 }), false);
  await t('a period that is a number (7) refused', () => WB(A, TAGA).set({ week: '2026-W46', period: 7, seconds: 60 }), false);
  await t('a bad week id (2026-46) refused', () => WB(A, TAGA).set({ week: '2026-46', period: '7', seconds: 60 }), false);
  await t('a missing period refused', () => WB(A, TAGA).set({ week: '2026-W46', seconds: 60 }), false);
  await t('a uid beside the three fields refused', () => WB(A, TAGA).set({ week: '2026-W46', period: '7', seconds: 60, uid: 'uidA' }), false);
  await t('a name beside the three fields refused', () => WB(A, TAGA).set({ week: '2026-W46', period: '7', seconds: 60, name: 'Ana' }), false);
  await t('B cannot write under A\'s tag', () => WB(B, TAGA).set({ week: '2026-W46', period: '7', seconds: 60 }), false);
  await t('B writes under its own tag', () => WB(B, TAGB).set({ week: '2026-W46', period: '4', seconds: 120 }), true);
  await t('uidC has no tag: a write under any tag refused', () => WB(C, TAGC).set({ week: '2026-W46', period: '7', seconds: 60 }), false);
  await t('the teacher has no tag: refused', () => WB(T, TAGC).set({ week: '2026-W46', period: '7', seconds: 60 }), false);
  await t('signed out refused', () => WB(N, TAGA).set({ week: '2026-W46', period: '7', seconds: 60 }), false);
  await t('no delete (A on its own tag)', () => WB(A, TAGA).delete(), false);
  await t('B reads A\'s entry (every signed-in account reads the board)', () => WB(B, TAGA).get(), true);
  await t('the site\'s query: one week + one period', () => C.collection('weekBoard').where('week', '==', '2026-W46').where('period', '==', '7').get(), true);
  await t('a whole-collection list by a signed-in account', () => C.collection('weekBoard').get(), true);
  await t('signed out cannot read the board', () => WB(N, TAGA).get(), false);
  await t('signed out cannot list the board', () => N.collection('weekBoard').get(), false);

  console.log('== rankBoard/{tag}  { seconds }');
  await t('A writes under its own tag', () => RB(A, TAGA).set({ seconds: 3600 }), true);
  await t('…and updates it', () => RB(A, TAGA).set({ seconds: 7200 }), true);
  await t('exactly 400 × the daily cap (480000)', () => RB(A, TAGA).set({ seconds: 480000 }), true);
  await t('480001 refused', () => RB(A, TAGA).set({ seconds: 480001 }), false);
  await t('negative refused', () => RB(A, TAGA).set({ seconds: -1 }), false);
  await t('seconds as a string refused', () => RB(A, TAGA).set({ seconds: '60' }), false);
  await t('an empty doc refused', () => RB(A, TAGA).set({}), false);
  await t('a uid beside seconds refused', () => RB(A, TAGA).set({ seconds: 60, uid: 'uidA' }), false);
  await t('a week field (the weekBoard shape) refused', () => RB(A, TAGA).set({ seconds: 60, week: '2026-W46' }), false);
  await t('B cannot write under A\'s tag', () => RB(B, TAGA).set({ seconds: 60 }), false);
  await t('B writes under its own tag', () => RB(B, TAGB).set({ seconds: 500 }), true);
  await t('uidC has no tag: refused', () => RB(C, TAGC).set({ seconds: 60 }), false);
  await t('the teacher has no tag: refused', () => RB(T, TAGC).set({ seconds: 60 }), false);
  await t('signed out refused', () => RB(N, TAGA).set({ seconds: 60 }), false);
  await t('no delete', () => RB(A, TAGA).delete(), false);
  await t('every signed-in account reads the whole collection (how a rank is worked out)', () => C.collection('rankBoard').get(), true);
  await t('signed out cannot list it', () => N.collection('rankBoard').get(), false);

  console.log('== minutesBoard/{uid} has no rules block any more (uid -> minutes must not exist)');
  await t('a write under the uid is refused', () => A.doc('minutesBoard/uidA').set({ seconds: 60 }), false);
  await t('a write under the tag is refused', () => A.doc(`minutesBoard/${TAGA}`).set({ seconds: 60 }), false);
  await t('a read of another student\'s doc is refused', () => B.doc('minutesBoard/uidA').get(), false);
  await t('a list is refused', () => B.collection('minutesBoard').get(), false);
  await t('the teacher cannot write it', () => T.doc('minutesBoard/uidA').set({ seconds: 60 }), false);

  console.log('== KNOWN LIMIT (documented in firestore.rules): a tag cannot be proven unique');
  /* If someone builds the create-only reverse index boardTags/{tag}, these two turn false: flip them then. */
  await t('uidC may create its meta doc with ANOTHER student\'s tag (A\'s)', () => META(C, 'uidC').set({ id: TAGA }), true);
  await t('…and then overwrite A\'s Top 5 entry (A\'s page repairs it on its next write)', () => WB(C, TAGA).set({ week: '2026-W46', period: '7', seconds: 1 }), true);

  /* Recorded takes (coach.js micRecSaveNow), their audio chunks and the take counter. Added 2026-11-05. The app writes the chunks FIRST and the take
     doc last, and the take doc is the only place a student's id, name and period sit next to the audio, so: who may write what, only while the teacher
     has collection switched on (config/class.micSampling.on === true), never read back by a student, deleted only by the teacher. The take doc has
     no field list on purpose (the saved readings of 2026-11-05 needed no rules change): the case with per-change readings pins that. */
  const sampling = on => env.withSecurityRulesDisabled(c => c.firestore().doc('config/class').set(on === undefined ? { paused: false } : { micSampling: on }));
  const TAKE = (db, id) => db.doc(`micTakes/${id}`);
  const CHUNK = (db, id, i) => db.doc(`micTakes/${id}/chunks/${i}`);
  const bytes = n => firebase.firestore.Blob.fromUint8Array(new Uint8Array(n));
  const take = (uid, extra) => Object.assign({ uid, name: 'Fake Student', period: '3', mode: 'pw', game: 'pw', complete: true, durationSec: 29.5, chunks: 1, bytes: 1000,
    expected: [{ i: 0, t: 1000.5, from: 'G5', to: 'C5', stage: 0, bpm: 60, verdict: 'ok', readings: [] }, { i: 1, t: 2000, from: 'C5', to: 'G5', stage: 0, bpm: 60, verdict: 'miss', readings: null },
      { i: 2, t: 3000, from: 'G5', to: 'C5', stage: 0, bpm: 60, verdict: 'ok', readings: [48.01, 47.98, 48.02, 48] }], events: [{ t: 990.2, stage: 0 }] }, extra || {});
  await sampling({ on: true });
  console.log('== micTakes/{uid}-{coach|nr|pw}: who may save a take (collection on)');
  await t('A saves its own Power Chord Switch take, with per-change readings (null, [] and numbers: no rules change was needed)', () => TAKE(A, 'uidA-pw').set(take('uidA')), true);
  await t('…and its next take overwrites it (one take per student per game)', () => TAKE(A, 'uidA-pw').set(take('uidA', { complete: false })), true);
  await t('a Listening Coach take (-coach)', () => TAKE(A, 'uidA-coach').set(take('uidA', { mode: 'coach' })), true);
  await t('a Note Runner take (-nr)', () => TAKE(A, 'uidA-nr').set(take('uidA', { mode: 'nr' })), true);
  await t('an unknown game (-xx) refused', () => TAKE(A, 'uidA-xx').set(take('uidA')), false);
  await t('a game name with something after it (-pwx) refused: the whole id must match', () => TAKE(A, 'uidA-pwx').set(take('uidA')), false);
  await t('no game at all (uidA) refused', () => TAKE(A, 'uidA').set(take('uidA')), false);
  await t('an id with nothing after the dash (uidA-) refused', () => TAKE(A, 'uidA-').set(take('uidA')), false);
  await t('B cannot save under A\'s id', () => TAKE(B, 'uidA-pw').set(take('uidB')), false);
  await t('A cannot save under B\'s id', () => TAKE(A, 'uidB-pw').set(take('uidA')), false);
  await t('an id that only ENDS with the writer\'s uid (xuidA-pw) refused', () => TAKE(A, 'xuidA-pw').set(take('uidA')), false);
  await t('the id is right but uid in the doc is another student\'s refused', () => TAKE(A, 'uidA-pw').set(take('uidB')), false);
  await t('the id is right but the doc has no uid refused', () => TAKE(A, 'uidA-pw').set({ mode: 'pw' }), false);
  await t('signed out refused', () => TAKE(N, 'uidA-pw').set(take('uidA')), false);

  console.log('== micTakes: the teacher switches collection on and off (config/class.micSampling.on)');
  await sampling({ on: false });
  await t('on:false: A\'s take refused', () => TAKE(A, 'uidA-pw').set(take('uidA')), false);
  await sampling({ on: 'true' });
  await t('on:"true" (a string, not true) refused', () => TAKE(A, 'uidA-pw').set(take('uidA')), false);
  await sampling({});
  await t('micSampling with no "on" refused', () => TAKE(A, 'uidA-pw').set(take('uidA')), false);
  await sampling();
  await t('config/class with no micSampling at all refused', () => TAKE(A, 'uidA-pw').set(take('uidA')), false);
  await env.withSecurityRulesDisabled(c => c.firestore().doc('config/class').delete());
  await t('no config/class document at all refused', () => TAKE(A, 'uidA-pw').set(take('uidA')), false);
  await sampling({ on: false });
  await t('on:false: a chunk is refused too', () => CHUNK(A, 'uidA-pw', 0).set({ i: 0, pcm: bytes(1000) }), false);
  await sampling({ on: true });
  await t('on:true again: the take is accepted', () => TAKE(A, 'uidA-pw').set(take('uidA')), true);

  console.log('== micTakes/{id}/chunks/{i}: the audio');
  await t('A writes chunk 0 of its take', () => CHUNK(A, 'uidA-pw', 0).set({ i: 0, pcm: bytes(1000) }), true);
  await t('…the app writes chunks BEFORE the take doc: a chunk under a take that does not exist yet is accepted', () => CHUNK(B, 'uidB-nr', 0).set({ i: 0, pcm: bytes(1000) }), true);   // uidB-nr is never created as a take doc
  await t('…and overwrites it (update)', () => CHUNK(A, 'uidA-pw', 0).set({ i: 0, pcm: bytes(2000) }), true);
  await t('chunk 1 and 2 (a 30 s take is three)', async () => { await CHUNK(A, 'uidA-pw', 1).set({ i: 1, pcm: bytes(1000) }); return CHUNK(A, 'uidA-pw', 2).set({ i: 2, pcm: bytes(1000) }); }, true);
  await t('exactly 750000 bytes (the cap; the app sends 600000)', () => CHUNK(A, 'uidA-pw', 3).set({ i: 3, pcm: bytes(750000) }), true);
  await t('750001 bytes refused', () => CHUNK(A, 'uidA-pw', 4).set({ i: 4, pcm: bytes(750001) }), false);
  await t('an extra field (the uid) refused', () => CHUNK(A, 'uidA-pw', 5).set({ i: 5, pcm: bytes(10), uid: 'uidA' }), false);
  await t('KNOWN LENIENCY: no i is accepted (hasOnly lists the allowed fields, it does not require them; the console reads chunks by document id, never by i)', () => CHUNK(A, 'uidA-pw', 5).set({ pcm: bytes(10) }), true);
  await t('no pcm refused', () => CHUNK(A, 'uidA-pw', 5).set({ i: 5 }), false);
  await t('pcm as a string, not bytes, refused', () => CHUNK(A, 'uidA-pw', 5).set({ i: 5, pcm: 'AAAA' }), false);
  await t('B cannot write a chunk under A\'s take', () => CHUNK(B, 'uidA-pw', 5).set({ i: 5, pcm: bytes(10) }), false);
  await t('an unknown game under A\'s own uid (uidA-xx) refused', () => CHUNK(A, 'uidA-xx', 0).set({ i: 0, pcm: bytes(10) }), false);
  await t('signed out refused', () => CHUNK(N, 'uidA-pw', 5).set({ i: 5, pcm: bytes(10) }), false);

  console.log('== micTakes: only the teacher reads or deletes');
  await t('A cannot read its own take back', () => TAKE(A, 'uidA-pw').get(), false);
  await t('B cannot read A\'s take', () => TAKE(B, 'uidA-pw').get(), false);
  await t('a student cannot list the takes', () => A.collection('micTakes').get(), false);
  await t('signed out cannot read a take', () => TAKE(N, 'uidA-pw').get(), false);
  await t('A cannot read its own audio back', () => CHUNK(A, 'uidA-pw', 0).get(), false);
  await t('a student cannot list the chunks', () => A.collection('micTakes/uidA-pw/chunks').get(), false);
  await t('A cannot delete its own take', () => TAKE(A, 'uidA-pw').delete(), false);
  await t('A cannot delete its own chunk', () => CHUNK(A, 'uidA-pw', 0).delete(), false);
  await t('the teacher reads a take', () => TAKE(T, 'uidA-pw').get(), true);
  await t('the teacher lists the takes', () => T.collection('micTakes').get(), true);
  await t('the teacher reads a chunk', () => CHUNK(T, 'uidA-pw', 0).get(), true);
  await t('the teacher lists the chunks', () => T.collection('micTakes/uidA-pw/chunks').get(), true);
  await t('the teacher deletes a chunk', () => CHUNK(T, 'uidA-pw', 1).delete(), true);
  await t('the teacher deletes a take', () => TAKE(T, 'uidA-coach').delete(), true);
  await sampling({ on: false });
  await t('the teacher can still read and delete with collection off', async () => { await TAKE(T, 'uidA-nr').get(); return TAKE(T, 'uidA-nr').delete(); }, true);
  await sampling({ on: true });

  console.log('== micTakesMeta/count: the "how many takes so far" counter');
  await env.withSecurityRulesDisabled(c => c.firestore().doc('micTakesMeta/count').delete());
  await t('every signed-in account reads it (when missing too)', () => A.doc('micTakesMeta/count').get(), true);
  await t('signed out cannot read it', () => N.doc('micTakesMeta/count').get(), false);
  await t('a student cannot create it at 5', () => A.doc('micTakesMeta/count').set({ n: 5 }), false);
  await t('a student cannot create it at 2', () => A.doc('micTakesMeta/count').set({ n: 2 }), false);
  await t('a student creates it at 1', () => A.doc('micTakesMeta/count').set({ n: 1 }), true);
  await t('another student adds exactly 1 (2)', () => B.doc('micTakesMeta/count').set({ n: 2 }), true);
  await t('a jump to 4 refused', () => B.doc('micTakesMeta/count').set({ n: 4 }), false);
  await t('staying at 2 refused', () => B.doc('micTakesMeta/count').set({ n: 2 }), false);
  await t('going back down to 1 refused', () => B.doc('micTakesMeta/count').set({ n: 1 }), false);
  await t('an extra field refused', () => B.doc('micTakesMeta/count').set({ n: 3, uid: 'uidB' }), false);
  await t('signed out cannot add', () => N.doc('micTakesMeta/count').set({ n: 3 }), false);
  await t('the teacher sets it to 40 (any number)', () => T.doc('micTakesMeta/count').set({ n: 40 }), true);
  await t('the teacher resets it to 0 ("Reset counter")', () => T.doc('micTakesMeta/count').set({ n: 0 }), true);
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
