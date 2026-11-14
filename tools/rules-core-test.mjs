#!/usr/bin/env node
/* The core paths of firestore.rules, tested against the REAL Firestore emulator (2026-11-13).
   Not part of checks.mjs: like tools/pm-rules-test.mjs it needs Java and a few npm packages the repo
   deliberately does not carry. GitHub runs both tools on every push to main (.github/workflows/rules.yml).

   pm-rules-test.mjs covers practice minutes, the boards and the mic takes in depth, and the older paths
   with one case each. This tool covers those older paths in depth:
     the teacher check   isTeacher(): the exact email, email_verified false / missing / a string,
                         another letter case, a look-alike address
     progress/{uid}      each student's saved work: owner, another student, signed out, the teacher
                         (reads, list, the backup's paged query; never writes), create / merge /
                         transaction / update / delete, wrong types, a huge doc, a subcollection
     config/class        the class settings: who reads, who writes, the console's transaction,
                         a student's write, a signed-out read, other docs under config/
     config/access       the outside accounts allowed in (2026-11-13): teacher-only, the shape, no delete,
                         and two console tabs merging different accounts at once (both must land)
     accessRequests/*    "ask your teacher to let me in" (2026-11-13): one per account, the token's own name and
                         email, the server time, status 'asked' only; the teacher's decisions; 500 waiting
     isSchool()          (2026-11-13) every class-wide read for school accounts, allowed outside accounts, the
                         teacher, and 15 refused shapes (look-alike domains, unverified, no email, anonymous,
                         a uid that is a prefix of an allowed one, …); the list changing, empty and missing (a
                         test-only probe block, added in memory, tells a plain false from an evaluation error)
     liveQuiz/current    and answers/{uid}: the live round's shape, session and timing conditions
     issueReports/*      the exact shape submitIssueReport() writes, the caps, teacher-only reading
     weekBoard, rankBoard  only what pm-rules-test does not already pin (the teacher's account, list)
     no rules block      a few paths with no match must stay denied
   The made-up students are @seq.org accounts since 2026-11-13 (the school-accounts rule); an outside account is a
   made-up gmail.example address.
   Every case pins what the rules do TODAY, allows and denies alike. Where a rule has no shape or size
   check, a case named "today: …" pins that as a fact, so that tightening it later turns that case red
   and is seen as a deliberate change (a firestore.rules change also needs a console paste).

   --breaks  runs the same cases against broken copies of the rules, made in memory from the file
             given; each break must turn at least one case red. Exit 1 if any is not caught.
   --port N  the emulator's port (default 8089, as pm-rules-test.mjs).

   The file imports nothing from the repo, so it runs from any folder that has the packages:
     export JAVA_HOME=~/tools/java/jdk-21.0.13+9-jre/Contents/Home; export PATH="$JAVA_HOME/bin:$PATH"
     # in an empty scratch folder (NOT inside the repo):
     npm init -y
     npm i --legacy-peer-deps firebase-tools@15.36.0 @firebase/rules-unit-testing@6.0.0 firebase@10.12.2
     cp <repo>/tools/rules-core-test.mjs <repo>/firestore.rules .
     # firebase.json:  { "firestore": { "rules": "firestore.rules" }, "emulators": { "firestore": { "port": 8089 }, "ui": { "enabled": false } } }
     npx firebase emulators:exec --only firestore --project demo-gc "node rules-core-test.mjs firestore.rules --port 8089 --breaks"
   Exit 0 = every case passed on the real rules (and, with --breaks, every break was caught).
   One rules text since 2026-11-14 (paste-2 day): firestore.rules, where isSchool() gates the class-wide reads and
   student writes; a text without isSchool() fails at once (0 passed, 1 failed). Until then a second file held that
   paste and this tool ran on both; the cases that pinned the older published text ("today (paste 1): …", 4 of them)
   now state the refusal, and every break applies.
   The last line of each part is the summary GitHub prints: "✓ firestore.rules: N passed, 0 failed" and
   "✓ K of K breaks caught". */
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { readFileSync } from 'node:fs';

const ARGV = process.argv.slice(2);
const portAt = ARGV.indexOf('--port');
const which = ARGV.find((a, i) => !a.startsWith('--') && i !== portAt + 1) || 'firestore.rules';
const PORT = (portAt >= 0 && +ARGV[portAt + 1]) || 8089;
const RULES = readFileSync(which, 'utf8');
/* One rules text since 2026-11-14 (paste-2 day): firestore.rules, with every class-wide read and student write gated by
   isSchool(). A text without isSchool() is refused at once, so an edit that drops the gate cannot pass as older rules. */
if (!/function isSchool\(\)/.test(RULES)) { console.log(`\n✗ ${which} has no isSchool() (the school-accounts gate, in firestore.rules since 2026-11-14): 0 passed, 1 failed`); process.exit(1); }
const TEACHER = 'jhoffman@seq.org';

async function suite(rulesText, quiet) {
  let pass = 0, fail = 0, sec = ''; const red = [];
  /* A test-only probe block, added in memory to every copy under test (never to the file): zzProbe/{x} may be read
     exactly when isSchool() is a plain FALSE. An evaluation error inside isSchool() makes !isSchool() an error too, which
     denies, so the probe tells "refused by false" from "refused by an error" (the emulator's message cannot: it prints
     "evaluation error" for any exists() on a missing document). Skipped for a copy that has no isSchool(). */
  const probe = /function isSchool\(\)/.test(rulesText) ? '    match /zzProbe/{x} { allow read: if !isSchool(); }\n' : '';
  const at = rulesText.lastIndexOf('  }\n}');
  const env = await initializeTestEnvironment({ projectId: 'demo-gc', firestore: { rules: rulesText.slice(0, at) + probe + rulesText.slice(at), host: '127.0.0.1', port: PORT } });
  await env.clearFirestore();
  /* expect: true = allowed, false = refused by the rules (PERMISSION_DENIED),
     'invalid' = refused by Firestore itself with some other error (a size limit, not a rule). */
  const t = async (name, p, expect) => {
    let ok, why = '';
    try {
      if (expect === 'invalid') {
        let err = null;
        try { await p(); } catch (e) { err = e; }
        if (!err) throw new Error('Expected Firestore to refuse it, but it succeeded.');
        if (/permission/i.test(String(err.code || '') + ' ' + String(err.message || ''))) throw new Error('Expected a non-rules error, got PERMISSION_DENIED: ' + err.message);
        why = ' (refused with ' + String(err.code || '') + ': ' + String(err.message || '').slice(0, 100) + ')';
      } else await (expect ? assertSucceeds(p()) : assertFails(p()));
      ok = true;
    } catch (e) { ok = false; why = String(e.message || e).slice(0, 160); }
    /* A red case carries its section, so a GitHub annotation (which lists only the red lines) says where it is. */
    if (ok) pass++; else { fail++; red.push(sec + ': ' + name); }
    if (!quiet) { if (!ok) console.log('     ', why); console.log(ok ? '  ✓ ' + name + why : '  ✗ ' + sec + ': ' + name); }
  };
  const say = s => { sec = s.replace(/^== /, '').replace(/ \(.*$/, ''); if (!quiet) console.log(s); };
  const FV = firebase.firestore.FieldValue, byId = firebase.firestore.FieldPath.documentId();
  const ctx = (uid, token) => env.authenticatedContext(uid, token).firestore();
  const A = ctx('uidA', { email: 'a@seq.org', email_verified: true });
  const B = ctx('uidB', { email: 'b@seq.org', email_verified: true });
  const T = ctx('teacher', { email: TEACHER, email_verified: true });
  const N = env.unauthenticatedContext().firestore();
  /* Accounts that look like the teacher and must not pass isTeacher(). */
  const FAKES = [
    ['email_verified false', ctx('fake1', { email: TEACHER, email_verified: false })],
    ['no email_verified claim', ctx('fake2', { email: TEACHER })],
    ['email_verified as the string "true"', ctx('fake3', { email: TEACHER, email_verified: 'true' })],
    ['another letter case (JHoffman@seq.org)', ctx('fake4', { email: 'JHoffman@seq.org', email_verified: true })],
    ['all capitals (JHOFFMAN@SEQ.ORG)', ctx('fake5', { email: TEACHER.toUpperCase(), email_verified: true })],
    ['a trailing space', ctx('fake6', { email: TEACHER + ' ', email_verified: true })],
    ['a look-alike domain (jhoffman@seq.org.example.com)', ctx('fake7', { email: TEACHER + '.example.com', email_verified: true })],
    ['another address at the school (someone@seq.org)', ctx('fake8', { email: 'someone@seq.org', email_verified: true })],
    ['no email at all', ctx('fake9', {})],
  ];
  const admin = fn => env.withSecurityRulesDisabled(c => fn(c.firestore()));
  const P = (db, uid) => db.doc(`progress/${uid}`);
  /* The shape flushSave() sends (app/save.js), trimmed. */
  const save = extra => Object.assign({ name: 'Ana Lopez', email: 'a@seq.org', skills: { 'm1w1-b-sec0-0': true }, responses: { 'm1w1-b-sec1-2': 'G' },
    completed: { m1w1: true }, games: { coach: { best: 12 } }, streak: { n: 3, last: '2026-11-12' }, practiceLog: [{ d: '2026-11-12', m: 10 }], migrations: { swap45: true } }, extra || {});

  /* ── the teacher check ─────────────────────────────────────────────── */
  say('== isTeacher(): the real teacher account (jhoffman@seq.org, email_verified true)');
  await admin(db => db.doc('progress/uidA').set(save()));
  await admin(db => db.doc('issueReports/seed1').set({ uid: 'uidA', message: 'seed' }));
  await t('reads a student\'s progress', () => P(T, 'uidA').get(), true);
  await t('reads the issue reports', () => T.collection('issueReports').get(), true);
  await t('writes config/class', () => T.doc('config/class').set({ paused: false }, { merge: true }), true);
  say('== isTeacher(): accounts that look like the teacher are refused (progress read, issue-report list, config/class write)');
  for (const [label, db] of FAKES) {
    await t(`${label}: cannot read a student's progress`, () => P(db, 'uidA').get(), false);
    await t(`${label}: cannot list the issue reports`, () => db.collection('issueReports').get(), false);
    await t(`${label}: cannot write config/class`, () => db.doc('config/class').set({ paused: true }, { merge: true }), false);
  }

  /* ── progress/{uid} ─────────────────────────────────────────────────── */
  say('== progress/{uid}: the owner');
  await admin(db => db.doc('progress/uidA').delete());
  await t('creates their own doc (set)', () => P(A, 'uidA').set(save()), true);
  await t('reads it back', () => P(A, 'uidA').get(), true);
  await t('merge-set, the client\'s real save (flushSave)', () => P(A, 'uidA').set(save({ skills: { 'm1w1-b-sec0-1': true } }), { merge: true }), true);
  await t('merge with an increment (songsLibraryOpen\'s songOpens)', () => P(A, 'uidA').set({ name: 'Ana Lopez', email: 'a@seq.org', songOpens: { '12': FV.increment(1) } }, { merge: true }), true);
  await t('a transaction that reads then merges (the Module 4/5 swap, swap45)', () => A.runTransaction(async tx => { const s = await tx.get(P(A, 'uidA')); tx.set(P(A, 'uidA'), { migrations: { swap45: true }, seen: s.exists }, { merge: true }); }), true);
  await t('update() of one field', () => P(A, 'uidA').update({ 'streak.n': 4 }), true);
  await t('today: an owner may DELETE their own progress doc (write includes delete)', () => P(A, 'uidA').delete(), true);
  await t('…and create it again from nothing', () => P(A, 'uidA').set(save()), true);
  say('== progress/{uid}: today the owner\'s writes have NO shape, type or size check');
  await t('today: an owner may write any field (a made-up grade)', () => P(A, 'uidA').set({ grade: 'A+', pts: 1e9 }, { merge: true }), true);
  await t('today: an owner may write a known field with the wrong type (skills as a string)', () => P(A, 'uidA').set({ skills: 'all of them' }, { merge: true }), true);
  await t('today: an owner may put ANOTHER uid in a uid field of their own doc', () => P(A, 'uidA').set({ uid: 'uidB' }, { merge: true }), true);
  await t('today: an owner may put any name and email in their own doc (the console shows them)', () => P(A, 'uidA').set({ name: 'Jonathan Hoffman', email: TEACHER }, { merge: true }), true);
  await t('today: an owner may replace the whole doc with an empty one', () => P(A, 'uidA').set({}), true);
  await t('today: an owner may write a huge doc (a 900,000-character string; no size rule)', () => P(A, 'uidA').set({ blob: 'x'.repeat(900000) }), true);
  await t('a doc over 1 MiB is refused by Firestore itself, not by a rule (1,100,000 characters)', () => P(A, 'uidA').set({ blob: 'x'.repeat(1100000) }), 'invalid');
  await P(A, 'uidA').set(save());
  say('== progress/{uid}: another student');
  await t('cannot read it', () => P(B, 'uidA').get(), false);
  await t('cannot create or overwrite it (set)', () => P(B, 'uidA').set(save({ name: 'B' })), false);
  await t('cannot merge into it', () => P(B, 'uidA').set({ skills: {} }, { merge: true }), false);
  await t('cannot update() it', () => P(B, 'uidA').update({ 'streak.n': 0 }), false);
  await t('cannot delete it', () => P(B, 'uidA').delete(), false);
  await t('cannot list the progress collection', () => B.collection('progress').get(), false);
  await t('cannot run a query filtered to their own id on the collection either', () => B.collection('progress').where(byId, '==', 'uidA').get(), false);
  await t('cannot create a doc for a uid that has none yet (uidZ)', () => P(B, 'uidZ').set(save()), false);
  say('== progress/{uid}: signed out');
  await t('cannot read', () => P(N, 'uidA').get(), false);
  await t('cannot write', () => P(N, 'uidA').set(save()), false);
  await t('cannot list', () => N.collection('progress').get(), false);
  say('== progress/{uid}: the teacher reads every doc and writes none (the console never writes progress)');
  await t('reads one doc', () => P(T, 'uidA').get(), true);
  await t('lists the whole collection (teacherFetchStudents)', () => T.collection('progress').get(), true);
  await t('runs the backup\'s paged query (orderBy document id, limit, startAfter)', () => T.collection('progress').orderBy(byId).startAfter('a').limit(200).get(), true);
  await t('cannot overwrite a student\'s doc (set)', () => P(T, 'uidA').set(save({ name: 'x' })), false);
  await t('cannot merge into it', () => P(T, 'uidA').set({ skills: {} }, { merge: true }), false);
  await t('cannot update() it', () => P(T, 'uidA').update({ 'streak.n': 0 }), false);
  await t('cannot delete it', () => P(T, 'uidA').delete(), false);
  await t('cannot create a doc for another uid', () => P(T, 'uidZ').set(save()), false);
  await t('today: the teacher\'s account may write ITS OWN progress doc (the owner rule, like any student)', () => P(T, 'teacher').set(save({ name: 'Teacher' })), true);
  say('== progress/{uid}: nothing below a progress doc has rules');
  await t('the owner cannot write a subcollection doc (progress/uidA/notes/n1)', () => A.doc('progress/uidA/notes/n1').set({ a: 1 }), false);
  await t('the owner cannot read one', () => A.doc('progress/uidA/notes/n1').get(), false);
  await t('the teacher cannot read one', () => T.doc('progress/uidA/notes/n1').get(), false);

  /* ── config/class ───────────────────────────────────────────────────── */
  say('== config/class: who reads');
  await admin(db => db.doc('config/class').set({ paused: false, gamesEnabled: true, configVersion: 5 }));
  await t('a signed-in student reads it (loadClassConfig)', () => A.doc('config/class').get(), true);
  await t('the teacher reads it', () => T.doc('config/class').get(), true);
  await t('an account with the teacher\'s email, unverified, cannot read it (not a verified school address; until 2026-11-14 the published text let it read)', () => FAKES[0][1].doc('config/class').get(), false);
  await t('signed out cannot read it', () => N.doc('config/class').get(), false);
  await t('a student cannot list the config collection', () => A.collection('config').get(), false);
  say('== config/class: only the teacher writes');
  await t('a student cannot overwrite it (set)', () => A.doc('config/class').set({ paused: true }), false);
  await t('a student cannot merge one field (paused)', () => A.doc('config/class').set({ paused: true }, { merge: true }), false);
  await t('a student cannot give themselves games (gameOverrides.uidA)', () => A.doc('config/class').set({ gameOverrides: { uidA: true } }, { merge: true }), false);
  await t('a student cannot update() it', () => A.doc('config/class').update({ paused: true }), false);
  await t('a student cannot delete it', () => A.doc('config/class').delete(), false);
  await t('signed out cannot write it', () => N.doc('config/class').set({ paused: true }, { merge: true }), false);
  await t('the teacher\'s transaction (teacherWriteConfig: read, then merge with configVersion + 1)', () => T.runTransaction(async tx => { const s = await tx.get(T.doc('config/class')); tx.set(T.doc('config/class'), { paused: false, configVersion: (s.data().configVersion || 0) + 1 }, { merge: true }); }), true);
  await t('the teacher\'s update() of one field', () => T.doc('config/class').update({ 'micSampling.on': false }), true);
  await t('today: configVersion is not enforced (the teacher may set it backwards, the hand-repair path)', () => T.doc('config/class').set({ configVersion: 1 }, { merge: true }), true);
  await t('today: the teacher may write any shape (no field list on config/class)', () => T.doc('config/class').set({ madeUp: [1, 2, 3] }, { merge: true }), true);
  await t('today: the teacher may DELETE config/class (write includes delete)', () => T.doc('config/class').delete(), true);
  await t('…and create it again', () => T.doc('config/class').set({ paused: false, configVersion: 1 }), true);
  say('== config/{other}: only the class doc has rules');
  await t('a student cannot read config/other', () => A.doc('config/other').get(), false);
  await t('the teacher cannot read config/other', () => T.doc('config/other').get(), false);
  await t('the teacher cannot write config/other', () => T.doc('config/other').set({ a: 1 }), false);

  /* ── config/access: the outside accounts allowed in (2026-11-13) ──── */
  const ACC = db => db.doc('config/access');
  const T2 = ctx('teacher', { email: TEACHER, email_verified: true });   // a second console tab: the same account, its own client
  const merge1 = (db, uid, on) => ACC(db).set({ allow: { [uid]: on ? true : FV.delete() } }, { merge: true });
  const allowNow = async () => { let d = null; await admin(async db => { const s = await ACC(db).get(); d = s.exists ? (s.data().allow || {}) : null; }); return d; };
  const expectAllow = async (want) => { const got = await allowNow(); const g = JSON.stringify(got && Object.keys(got).sort()), w = JSON.stringify(want.slice().sort()); if (g !== w) throw new Error('allow holds ' + g + ', expected ' + w); };
  say('== config/access: only the teacher reads and writes it');
  await admin(db => ACC(db).delete());
  await t('the teacher reads it while it does not exist yet (the console\'s first read)', () => ACC(T).get(), true);
  await t('the teacher creates it with one account (the console\'s merge write)', () => merge1(T, 'outsideX', true), true);
  await t('the teacher reads it', () => ACC(T).get(), true);
  await t('the teacher switches one account off (FieldValue.delete, merged)', async () => { await merge1(T, 'outsideY', true); await merge1(T, 'outsideY', false); await expectAllow(['outsideX']); }, true);
  await t('two console tabs switching DIFFERENT accounts at the same moment: both land (each merges one key)', async () => { await Promise.all([merge1(T, 'outsideP', true), merge1(T2, 'outsideQ', true)]); await expectAllow(['outsideP', 'outsideQ', 'outsideX']); }, true);
  await t('…and switching two off at the same moment: both go', async () => { await Promise.all([merge1(T, 'outsideP', false), merge1(T2, 'outsideQ', false)]); await expectAllow(['outsideX']); }, true);
  await t('why the console never writes the whole document: a whole set() from one tab drops the other tab\'s account', async () => { await merge1(T, 'outsideP', true); await ACC(T2).set({ allow: { outsideQ: true } }); await expectAllow(['outsideQ']); await ACC(T).set({ allow: { outsideX: true } }); }, true);
  await t('a teacher write with another field beside allow refused', () => ACC(T).set({ allow: {}, note: 'x' }, { merge: true }), false);
  await t('allow as a list, not a map, refused', () => ACC(T).set({ allow: ['outsideX'] }), false);
  await t('an empty document (no allow field) refused', () => ACC(T).set({}), false);
  await t('the teacher cannot delete it (switch every account off instead)', () => ACC(T).delete(), false);
  await t('a student cannot read it', () => ACC(A).get(), false);
  await t('a student cannot add themselves (merge)', () => merge1(A, 'uidA', true), false);
  await t('a student cannot overwrite it', () => ACC(A).set({ allow: { uidA: true } }), false);
  await t('signed out cannot read it', () => ACC(N).get(), false);
  await t('an account with the teacher\'s email, unverified, cannot read it', () => ACC(FAKES[0][1]).get(), false);
  await t('an account with the teacher\'s email, unverified, cannot add itself', () => merge1(FAKES[0][1], 'fake1', true), false);

  /* ── accessRequests/{uid}: "Ask your teacher to let me in" (2026-11-13) ── */
  const OUT_TOKEN = { email: 'test0@gmail.example', email_verified: true, name: 'Test 0' };
  const O = ctx('outsideO', OUT_TOKEN);
  const O2 = ctx('outsideO2', { email: 'test1@gmail.example', email_verified: true, name: 'Test 1' });
  const REQ = (db, uid) => db.doc(`accessRequests/${uid}`);
  const ask = (extra, tok) => Object.assign({ name: (tok || OUT_TOKEN).name, email: (tok || OUT_TOKEN).email, at: FV.serverTimestamp(), status: 'asked' }, extra || {});
  say('== accessRequests/{uid}: an outside account asks once');
  await t('status "allowed" refused (the asker can only ask)', () => REQ(O, 'outsideO').set(ask({ status: 'allowed' })), false);
  await t('a name that is not the sign-in token\'s refused', () => REQ(O, 'outsideO').set(ask({ name: 'Jonathan Hoffman' })), false);
  await t('an email that is not the sign-in token\'s refused', () => REQ(O, 'outsideO').set(ask({ email: 'jhoffman@seq.org' })), false);
  await t('a time made on the device refused (must be the server\'s)', () => REQ(O, 'outsideO').set(ask({ at: new Date() })), false);
  await t('an extra field refused (period)', () => REQ(O, 'outsideO').set(ask({ period: 'CAS' })), false);
  await t('a missing status refused', () => { const d = ask(); delete d.status; return REQ(O, 'outsideO').set(d); }, false);
  await t('a request under another uid refused', () => REQ(O, 'outsideO2').set(ask()), false);
  await t('signed out refused', () => REQ(N, 'outsideO').set(ask()), false);
  await t('an UNVERIFIED email refused (email_verified false), even with the token\'s own name and address', () => REQ(ctx('unverAsk', { email: 'test5@gmail.example', email_verified: false, name: 'Test 5' }), 'unverAsk').set(ask({}, { name: 'Test 5', email: 'test5@gmail.example' })), false);
  await t('no email_verified claim refused', () => REQ(ctx('noVerAsk', { email: 'test6@gmail.example', name: 'Test 6' }), 'noVerAsk').set(ask({}, { name: 'Test 6', email: 'test6@gmail.example' })), false);
  await t('email_verified as the string "true" refused', () => REQ(ctx('strVerAsk', { email: 'test7@gmail.example', email_verified: 'true', name: 'Test 7' }), 'strVerAsk').set(ask({}, { name: 'Test 7', email: 'test7@gmail.example' })), false);
  await t('a token marked verified but with no email address refused (the email must not be empty)', () => REQ(ctx('noMailVer', { email_verified: true, name: 'Test 9' }), 'noMailVer').set({ name: 'Test 9', email: '', at: FV.serverTimestamp(), status: 'asked' }), false);
  await t('an account with no email at all (anonymous) refused', () => REQ(ctx('anon1', { firebase: { sign_in_provider: 'anonymous' } }), 'anon1').set({ name: '', email: '', at: FV.serverTimestamp(), status: 'asked' }), false);
  await t('the asker creates its request (the page\'s exact write)', () => REQ(O, 'outsideO').set(ask()), true);
  await t('…a second create (set again) refused: one request per account', () => REQ(O, 'outsideO').set(ask()), false);
  await t('…a merge into it refused (no update)', () => REQ(O, 'outsideO').set({ status: 'allowed' }, { merge: true }), false);
  await t('…update() of the name refused', () => REQ(O, 'outsideO').update({ name: 'Someone Else' }), false);
  await t('…the asker cannot delete it (and ask again)', () => REQ(O, 'outsideO').delete(), false);
  await t('the asker gets its own request back (the page shows "asked")', () => REQ(O, 'outsideO').get(), true);
  await t('another account cannot get it', () => REQ(O2, 'outsideO').get(), false);
  await t('the asker cannot list the requests', () => O.collection('accessRequests').get(), false);
  await t('a school student cannot list them', () => A.collection('accessRequests').get(), false);
  await t('a school student cannot get one', () => REQ(A, 'outsideO').get(), false);
  await t('signed out cannot get one', () => REQ(N, 'outsideO').get(), false);
  say('== accessRequests: what the sign-in token may carry');
  const nameTok = (uid, name) => ctx(uid, { email: uid + '@gmail.example', email_verified: true, name });
  await t('no name claim: the request carries an empty name', () => REQ(ctx('noName', { email: 'noname@gmail.example', email_verified: true }), 'noName').set({ name: '', email: 'noname@gmail.example', at: FV.serverTimestamp(), status: 'asked' }), true);
  await t('a 200-character name accepted', () => REQ(nameTok('long200', 'n'.repeat(200)), 'long200').set(ask({}, { name: 'n'.repeat(200), email: 'long200@gmail.example' })), true);
  await t('a 201-character name refused (the cap)', () => REQ(nameTok('long201', 'n'.repeat(201)), 'long201').set(ask({}, { name: 'n'.repeat(201), email: 'long201@gmail.example' })), false);
  await t('a 321-character email refused (the cap)', () => { const e = 'e'.repeat(307) + '@gmail.example'; return REQ(ctx('longMail', { email: e, email_verified: true, name: 'Test 2' }), 'longMail').set(ask({}, { name: 'Test 2', email: e })); }, false);
  await t('markup, right-to-left and control characters in a name are stored as sent (the console escapes them)', () => { const nm = '<img src=x onerror=alert(1)>\u202Eevil\u0007'; return REQ(nameTok('markup1', nm), 'markup1').set(ask({}, { name: nm, email: 'markup1@gmail.example' })); }, true);
  say('== accessRequests: the teacher decides');
  await t('the teacher lists the requests', () => T.collection('accessRequests').get(), true);
  await t('the teacher runs the console\'s list query (newest 200, any status; one field, no composite index)', () => T.collection('accessRequests').orderBy('at', 'desc').limit(200).get(), true);
  await t('the teacher runs the console\'s waiting-list query (status asked, at most 200; equality only, no composite index)', () => T.collection('accessRequests').where('status', '==', 'asked').limit(200).get(), true);
  await t('the teacher runs the badge\'s count query (waiting ones, at most 100; equality only, no composite index)', () => T.collection('accessRequests').where('status', '==', 'asked').limit(100).get(), true);
  await t('the teacher declines one (status only)', () => REQ(T, 'outsideO').update({ status: 'declined' }), true);
  await t('…the asker reads "declined"', async () => { const s = await REQ(O, 'outsideO').get(); if (s.data().status !== 'declined') throw new Error('status ' + s.data().status); }, true);
  await t('…and cannot ask again', () => REQ(O, 'outsideO').set(ask()), false);
  await t('the teacher changes a declined one to allowed', () => REQ(T, 'outsideO').update({ status: 'allowed' }), true);
  await t('the teacher cannot change the name in a request', () => REQ(T, 'outsideO').update({ name: 'x' }), false);
  await t('the teacher cannot set a status other than allowed / declined', () => REQ(T, 'outsideO').update({ status: 'maybe' }), false);
  await t('the teacher cannot set it back to "asked"', () => REQ(T, 'outsideO').update({ status: 'asked' }), false);
  await t('the teacher cannot create one (only an asker files its own)', () => REQ(T, 'outsideZ').set(ask()), false);
  await t('an unverified teacher-email account cannot list them', () => FAKES[0][1].collection('accessRequests').get(), false);
  await t('an unverified teacher-email account cannot decide one', () => REQ(FAKES[0][1], 'outsideO').update({ status: 'allowed' }), false);
  await t('the teacher deletes one (Delete: the line goes, that account may ask again)', () => REQ(T, 'markup1').delete(), true);
  await t('the console\'s Delete on an ANSWERED request (status allowed): the request goes, config/access is not touched', async () => {
    await admin(db => db.doc('config/access').set({ allow: { outsideO: true } }));
    await REQ(T, 'outsideO').delete();
    let a = null, r = null; await admin(async db => { a = (await db.doc('config/access').get()).data(); r = (await db.doc('accessRequests/outsideO').get()).exists; });
    if (r || !a || a.allow.outsideO !== true) throw new Error('request ' + r + ', allow ' + JSON.stringify(a));
    await admin(db => db.doc('config/access').delete());
  }, true);
  await t('…after a delete, that account may ask again', () => REQ(nameTok('markup1', 'Test 3'), 'markup1').set(ask({}, { name: 'Test 3', email: 'markup1@gmail.example' })), true);
  await t('500 waiting requests: the console\'s list query reads the newest 200, the badge query 100', async () => {
    await admin(async db => { for (let i = 0; i < 50; i++) { const b = db.batch(); for (let j = 0; j < 10; j++) b.set(db.doc(`accessRequests/spam${i}x${j}`), { name: 'Spam', email: 's@x.example', at: new Date(Date.now() - (i * 10 + j) * 1000), status: 'asked' }); await b.commit(); } });
    const s = await T.collection('accessRequests').orderBy('at', 'desc').limit(200).get();
    const c = await T.collection('accessRequests').where('status', '==', 'asked').limit(100).get();
    if (s.size !== 200 || c.size !== 100) throw new Error('read ' + s.size + ' and ' + c.size);
  }, true);

  /* ── liveQuiz/current and its answers ───────────────────────────────── */
  const LQ = db => db.doc('liveQuiz/current');
  const ANS = (db, uid) => db.doc(`liveQuiz/current/answers/${uid}`);
  const ans = (uid, extra) => Object.assign({ uid, name: 'Ana Lopez', sessionId: 's1', qIndex: 2, choice: 'a', ms: 1500, at: FV.serverTimestamp() }, extra || {});
  say('== liveQuiz/current: every signed-in account reads, only the teacher writes');
  await t('the teacher starts a game (a full set)', () => LQ(T).set({ state: 'lobby', sessionId: 's1', qIndex: -1 }), true);
  await t('a student reads it', () => LQ(A).get(), true);
  await t('signed out cannot read it', () => LQ(N).get(), false);
  await t('a student cannot write it (set)', () => LQ(A).set({ state: 'reveal' }), false);
  await t('a student cannot merge into it (their own score)', () => LQ(A).set({ scores: { uidA: 9999 } }, { merge: true }), false);
  await t('a student cannot delete it', () => LQ(A).delete(), false);
  await t('an unverified teacher-email account cannot write it', () => LQ(FAKES[0][1]).set({ state: 'off' }, { merge: true }), false);
  await t('a student cannot read liveQuiz/other (only "current" has rules)', () => A.doc('liveQuiz/other').get(), false);
  say('== liveQuiz/current/answers/{uid}: the lobby');
  await t('the "I\'m here" write (qIndex -1, choice null) in the lobby', () => ANS(A, 'uidA').set(ans('uidA', { qIndex: -1, choice: null, ms: 0 })), true);
  await t('a real answer while the lobby is open refused (qIndex 2)', () => ANS(A, 'uidA').set(ans('uidA')), false);
  await t('the teacher opens question 2', () => LQ(T).set({ state: 'question', qIndex: 2 }, { mergeFields: ['state', 'qIndex'] }), true);
  say('== liveQuiz/current/answers/{uid}: an open question');
  await t('the student\'s answer (lqWriteAnswer\'s exact shape)', () => ANS(A, 'uidA').set(ans('uidA')), true);
  await t('…overwritten the same round (update)', () => ANS(A, 'uidA').set(ans('uidA', { choice: 'b' })), true);
  await t('a fractional ms (1.5) is accepted (ms is a number, not an int, on purpose)', () => ANS(A, 'uidA').set(ans('uidA', { ms: 1.5 })), true);
  await t('ms 0 accepted', () => ANS(A, 'uidA').set(ans('uidA', { ms: 0 })), true);
  await t('a 60-character name accepted', () => ANS(A, 'uidA').set(ans('uidA', { name: 'n'.repeat(60) })), true);
  await t('a 64-character choice accepted', () => ANS(A, 'uidA').set(ans('uidA', { choice: 'c'.repeat(64) })), true);
  await t('today: `at` may be missing (hasOnly lists the allowed fields, it does not require them)', () => { const d = ans('uidA'); delete d.at; return ANS(A, 'uidA').set(d); }, true);
  await t('today: `at` may be any value (the rule does not check it; a client-made time is accepted)', () => ANS(A, 'uidA').set(ans('uidA', { at: 'whenever' })), true);
  await t('a stale question (qIndex 1) refused', () => ANS(A, 'uidA').set(ans('uidA', { qIndex: 1 })), false);
  await t('the lobby write (qIndex -1) refused once a question is open', () => ANS(A, 'uidA').set(ans('uidA', { qIndex: -1, choice: null })), false);
  await t('another session\'s answer refused', () => ANS(A, 'uidA').set(ans('uidA', { sessionId: 's0' })), false);
  await t('an extra field (pts) refused', () => ANS(A, 'uidA').set(ans('uidA', { pts: 1000 })), false);
  await t('a 61-character name refused', () => ANS(A, 'uidA').set(ans('uidA', { name: 'n'.repeat(61) })), false);
  await t('a name that is not a string refused', () => ANS(A, 'uidA').set(ans('uidA', { name: 7 })), false);
  await t('a missing name refused', () => { const d = ans('uidA'); delete d.name; return ANS(A, 'uidA').set(d); }, false);
  await t('ms -1 refused', () => ANS(A, 'uidA').set(ans('uidA', { ms: -1 })), false);
  await t('ms as a string refused', () => ANS(A, 'uidA').set(ans('uidA', { ms: '1500' })), false);
  await t('qIndex as a string refused', () => ANS(A, 'uidA').set(ans('uidA', { qIndex: '2' })), false);
  await t('qIndex 2.5 refused (an int is required)', () => ANS(A, 'uidA').set(ans('uidA', { qIndex: 2.5 })), false);
  await t('a 65-character choice refused', () => ANS(A, 'uidA').set(ans('uidA', { choice: 'c'.repeat(65) })), false);
  await t('a choice that is a number refused', () => ANS(A, 'uidA').set(ans('uidA', { choice: 1 })), false);
  await t('another uid inside the doc refused', () => ANS(A, 'uidA').set(ans('uidB')), false);
  await t('B cannot answer under A\'s id', () => ANS(B, 'uidA').set(ans('uidA')), false);
  await t('signed out cannot answer', () => ANS(N, 'uidA').set(ans('uidA')), false);
  await t('the teacher cannot write a student\'s answer', () => ANS(T, 'uidA').set(ans('uidA')), false);
  say('== liveQuiz/current/answers/{uid}: who reads and deletes');
  await t('a student gets their own answer back (lqRestoreMyAnswer)', () => ANS(A, 'uidA').get(), true);
  await t('a student cannot get another student\'s answer', () => ANS(B, 'uidA').get(), false);
  await t('a student cannot list the answers (the whole game)', () => A.collection('liveQuiz/current/answers').get(), false);
  await t('a student cannot delete their own answer (a free retry)', () => ANS(A, 'uidA').delete(), false);
  await t('signed out cannot get an answer', () => ANS(N, 'uidA').get(), false);
  await t('the teacher lists the answers (the wall)', () => T.collection('liveQuiz/current/answers').get(), true);
  await t('an unverified teacher-email account cannot list them', () => FAKES[0][1].collection('liveQuiz/current/answers').get(), false);
  await t('the teacher reveals (state reveal)', () => LQ(T).set({ state: 'reveal', correct: 'a' }, { mergeFields: ['state', 'correct'] }), true);
  await t('an answer after the reveal refused', () => ANS(A, 'uidA').set(ans('uidA')), false);
  await t('the teacher deletes an answer', () => ANS(T, 'uidA').delete(), true);
  await t('the teacher deletes the game doc', () => LQ(T).delete(), true);
  await t('with no liveQuiz/current doc at all, an answer is refused', () => ANS(A, 'uidA').set(ans('uidA')), false);

  /* ── issueReports ───────────────────────────────────────────────────── */
  const rep = extra => Object.assign({ uid: 'uidA', email: 'a@seq.org', name: 'Ana Lopez', message: 'The tab for Riptide does not scroll.', location: 'Module 4 · m4w2',
    moduleNum: 4, setId: 'm4w2', lang: 'en', userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0)', createdAt: FV.serverTimestamp() }, extra || {});
  const IR = db => db.collection('issueReports');
  say('== issueReports: a student files one (the exact shape submitIssueReport() writes)');
  await t('add() with the real shape', () => IR(A).add(rep()), true);
  await t('setId null accepted', () => IR(A).add(rep({ setId: null })), true);
  await t('a 4000-character message accepted', () => IR(A).add(rep({ message: 'm'.repeat(4000) })), true);
  await t('today: createdAt may be missing (hasOnly does not require it)', () => { const d = rep(); delete d.createdAt; return IR(A).add(d); }, true);
  await t('today: createdAt may be any value (not checked; a string here)', () => IR(A).add(rep({ createdAt: 'yesterday' })), true);
  await t('a missing setId refused (the client always sends it, null or a string; reading a missing field is an error, which denies)', () => { const d = rep(); delete d.setId; return IR(A).add(d); }, false);
  await t('a 4001-character message refused', () => IR(A).add(rep({ message: 'm'.repeat(4001) })), false);
  await t('an empty message refused', () => IR(A).add(rep({ message: '' })), false);
  await t('another student\'s uid refused', () => IR(A).add(rep({ uid: 'uidB' })), false);
  await t('an extra field refused (period)', () => IR(A).add(rep({ period: '7' })), false);
  await t('a 201-character name refused', () => IR(A).add(rep({ name: 'n'.repeat(201) })), false);
  await t('a 201-character email refused', () => IR(A).add(rep({ email: 'e'.repeat(201) })), false);
  await t('a 201-character location refused', () => IR(A).add(rep({ location: 'l'.repeat(201) })), false);
  await t('an 11-character lang refused', () => IR(A).add(rep({ lang: 'l'.repeat(11) })), false);
  await t('a 501-character userAgent refused', () => IR(A).add(rep({ userAgent: 'u'.repeat(501) })), false);
  await t('a 101-character setId refused', () => IR(A).add(rep({ setId: 's'.repeat(101) })), false);
  await t('moduleNum as a string refused', () => IR(A).add(rep({ moduleNum: '4' })), false);
  await t('a missing location refused', () => { const d = rep(); delete d.location; return IR(A).add(d); }, false);
  await t('signed out refused', () => IR(N).add(rep()), false);
  say('== issueReports: teacher-eyes-only, and nobody edits or deletes one');
  await admin(db => db.doc('issueReports/r1').set(rep({ createdAt: new Date('2026-11-12T10:00:00Z') })));
  await t('the student who filed it cannot read it back', () => A.doc('issueReports/r1').get(), false);
  await t('a student cannot list the reports', () => IR(A).get(), false);
  await t('signed out cannot read one', () => N.doc('issueReports/r1').get(), false);
  await t('the teacher reads one', () => T.doc('issueReports/r1').get(), true);
  await t('the teacher runs the console\'s query (newest 50)', () => IR(T).orderBy('createdAt', 'desc').limit(50).get(), true);
  await t('the student cannot edit their report', () => A.doc('issueReports/r1').set(rep({ message: 'changed' })), false);
  await t('the student cannot delete it', () => A.doc('issueReports/r1').delete(), false);
  await t('the teacher cannot edit a report', () => T.doc('issueReports/r1').update({ message: 'changed' }), false);
  await t('today: the teacher cannot delete a report either (no delete rule for anyone)', () => T.doc('issueReports/r1').delete(), false);

  /* ── weekBoard / rankBoard: only what pm-rules-test.mjs does not pin ── */
  say('== weekBoard / rankBoard (pm-rules-test.mjs covers them in depth; these are the teacher\'s account and single gets)');
  await admin(db => db.doc('weekBoard/0123456789abcdef0123456789abcdef').set({ week: '2026-W46', period: '7', seconds: 60 }));
  await admin(db => db.doc('rankBoard/0123456789abcdef0123456789abcdef').set({ seconds: 600 }));
  await t('the teacher\'s account reads the Top 5 board like any signed-in account', () => T.collection('weekBoard').get(), true);
  await t('the teacher\'s account reads the class rank like any signed-in account', () => T.collection('rankBoard').get(), true);
  await t('signed out cannot get one rankBoard doc', () => N.doc('rankBoard/0123456789abcdef0123456789abcdef').get(), false);
  await t('the teacher cannot delete a weekBoard doc', () => T.doc('weekBoard/0123456789abcdef0123456789abcdef').delete(), false);
  await t('the teacher cannot delete a rankBoard doc', () => T.doc('rankBoard/0123456789abcdef0123456789abcdef').delete(), false);
  await t('the teacher cannot write a rankBoard doc (no tag of their own)', () => T.doc('rankBoard/0123456789abcdef0123456789abcdef').set({ seconds: 0 }), false);

  {
    /* ── isSchool(): who reads the class-wide documents (2026-11-13) ──── */
    const SCHOOL_READS = [
      ['config/class', db => db.doc('config/class').get()],
      ['liveQuiz/current', db => db.doc('liveQuiz/current').get()],
      ['its own live-quiz answer (get)', (db, uid) => db.doc(`liveQuiz/current/answers/${uid}`).get()],
      ['micTakesMeta/count', db => db.doc('micTakesMeta/count').get()],
      ['the Top 5 board (weekBoard list)', db => db.collection('weekBoard').get()],
      ['the class rank (rankBoard list)', db => db.collection('rankBoard').get()],
    ];
    await admin(async db => { await db.doc('config/class').set({ paused: false }); await db.doc('liveQuiz/current').set({ state: 'lobby', sessionId: 's9', qIndex: -1 }); await db.doc('micTakesMeta/count').set({ n: 1 }); await db.doc('config/access').set({ allow: { allowedU: true, notTrueU: 'yes' } }); });
    /* Until 2026-11-14 the published text had no isSchool(), and these three read "today (paste 1): an outside account
       reads / writes …" (allowed). Since paste 2 moved into firestore.rules they state the refusal. */
    say('== isSchool(): an outside account that is not on the list (the three former "today (paste 1)" cases)');
    const OUT1 = ctx('outside1', { email: 'test8@gmail.example', email_verified: true });
    await t('an outside account not on the list cannot read config/class', () => OUT1.doc('config/class').get(), false);
    await t('an outside account not on the list cannot write its own progress', () => OUT1.doc('progress/outside1').set({ name: 'Test 8' }, { merge: true }), false);
    await t('an outside account not on the list cannot read the Top 5 board', () => OUT1.collection('weekBoard').get(), false);
    const readsFor = async (label, uid, token, ok) => {
      const db = ctx(uid, token);
      for (const [what, fn] of SCHOOL_READS) await t(`${label}: ${ok ? 'reads' : 'cannot read'} ${what}`, () => fn(db, uid), ok);
    };
    say('== isSchool(): school accounts read every class-wide document');
    await readsFor('a school student (test0@seq.org, verified)', 'school0', { email: 'test0@seq.org', email_verified: true }, true);
    await readsFor('a school address in capitals (TEST1@SEQ.ORG, verified)', 'school1', { email: 'TEST1@SEQ.ORG', email_verified: true }, true);
    await readsFor('the teacher', 'teacher', { email: TEACHER, email_verified: true }, true);
    say('== isSchool(): an outside account the teacher allowed (config/access) reads them');
    await readsFor('an allowed outside account (allowedU, test2@gmail.example)', 'allowedU', { email: 'test2@gmail.example', email_verified: true }, true);
    await readsFor('an allowed uid with no email claim at all', 'allowedU', {}, true);
    say('== isSchool(): every other account is refused');
    const REFUSED = [
      ['a look-alike domain (a@seq.org.evil.com)', 'look1', { email: 'a@seq.org.evil.com', email_verified: true }],
      ['another domain ending in seq.org (a@notseq.org)', 'look2', { email: 'a@notseq.org', email_verified: true }],
      ['seq.org before the @ (a+seq.org@gmail.com)', 'look3', { email: 'a+seq.org@gmail.com', email_verified: true }],
      ['a dash for the dot (a@seq-org)', 'look4', { email: 'a@seq-org', email_verified: true }],
      ['a sub-domain (a@mail.seq.org)', 'look5', { email: 'a@mail.seq.org', email_verified: true }],
      ['nothing before the @ (@seq.org)', 'look6', { email: '@seq.org', email_verified: true }],
      ['an unverified @seq.org address', 'unver1', { email: 'test3@seq.org', email_verified: false }],
      ['an @seq.org address with email_verified as the string "true"', 'unver2', { email: 'test4@seq.org', email_verified: 'true' }],
      ['an @seq.org address with no email_verified claim', 'unver3', { email: 'test5@seq.org' }],
      ['no email claim (not on the list)', 'noMail', {}],
      ['an anonymous account', 'anon2', { firebase: { sign_in_provider: 'anonymous' } }],
      ['a gmail account not on the list', 'outside9', { email: 'test6@gmail.example', email_verified: true }],
      ['a uid that is a PREFIX of an allowed one (allowed)', 'allowed', { email: 'test7@gmail.example', email_verified: true }],
      ['a uid that an allowed one is a prefix of (allowedUX)', 'allowedUX', { email: 'test8@gmail.example', email_verified: true }],
      ['a uid whose entry is "yes", not true (notTrueU)', 'notTrueU', { email: 'test9@gmail.example', email_verified: true }],
    ];
    for (const [label, uid, token] of REFUSED) await readsFor(label, uid, token, false);
    say('== isSchool(): the list changes');
    const OUTSIDER = ctx('allowedU', { email: 'test2@gmail.example', email_verified: true });
    await t('the teacher removes allowedU (the console\'s merge delete)', () => T.doc('config/access').set({ allow: { allowedU: FV.delete() } }, { merge: true }), true);
    await t('…its next read of config/class is refused', () => OUTSIDER.doc('config/class').get(), false);
    await t('the teacher allows it again', () => T.doc('config/access').set({ allow: { allowedU: true } }, { merge: true }), true);
    await t('…and it reads again', () => OUTSIDER.doc('config/class').get(), true);
    await admin(db => db.doc('config/access').set({ allow: {} }));
    await t('an EMPTY list (allow: {}): the outside account is refused', () => OUTSIDER.doc('config/class').get(), false);
    await t('…a school account still reads', () => ctx('school0', { email: 'test0@seq.org', email_verified: true }).doc('config/class').get(), true);
    await admin(db => db.doc('config/access').delete());
    await t('NO config/access document: the outside account is refused', () => OUTSIDER.doc('config/class').get(), false);
    await t('…and isSchool() is a plain false for it, not an evaluation error (the probe !isSchool() lets it read)', () => OUTSIDER.doc('zzProbe/p').get(), true);
    await t('…a school account still reads', () => ctx('school0', { email: 'test0@seq.org', email_verified: true }).doc('config/class').get(), true);
    await t('…the teacher still reads', () => T.doc('config/class').get(), true);
    await t('…an account with no email claim: a plain false too (probe)', () => ctx('noMail', {}).doc('zzProbe/p').get(), true);
    await t('…a school account: the probe is refused (isSchool() is true)', () => ctx('school0', { email: 'test0@seq.org', email_verified: true }).doc('zzProbe/p').get(), false);
    await admin(db => db.doc('config/access').set({ allow: {} }));
    await t('an EMPTY list: a plain false too (probe)', () => OUTSIDER.doc('zzProbe/p').get(), true);
    await admin(db => db.doc('config/access').delete());
    await t('an outside account that is not allowed may still ASK (accessRequests is the one door)', () => ctx('outside9', { email: 'test6@gmail.example', email_verified: true, name: 'Test 6' }).doc('accessRequests/outside9').set({ name: 'Test 6', email: 'test6@gmail.example', at: FV.serverTimestamp(), status: 'asked' }), true);

    /* ── stricter writes (2026-11-13): an outside account that is not allowed writes NOTHING but its own request ── */
    say('== isSchool() on writes: a refused outside account writes nothing but its request; an allowed one and a school one write');
    await admin(async db => {
      await db.doc('config/access').set({ allow: { allowedW: true } });
      await db.doc('config/class').set({ micSampling: { on: true, max: 40 } });
      await db.doc('liveQuiz/current').set({ state: 'lobby', sessionId: 'sW', qIndex: -1 });
      await db.doc('micTakesMeta/count').delete();
    });
    const WRITERS = [
      ['create its own progress doc (the first save)', (db, u) => db.doc(`progress/${u}`).set({ name: 'Test', email: 'x', skills: {} }, { merge: true })],
      ['read its own progress doc', (db, u) => db.doc(`progress/${u}`).get()],
      ['send the live-quiz "I\'m here" (lobby)', (db, u) => db.doc(`liveQuiz/current/answers/${u}`).set({ uid: u, name: 'Test', sessionId: 'sW', qIndex: -1, choice: null, ms: 0, at: FV.serverTimestamp() })],
      ['file an issue report', (db, u) => db.collection('issueReports').add({ uid: u, email: 'x', name: 'Test', message: 'm', location: 'l', moduleNum: 1, setId: null, lang: 'en', userAgent: 'u', createdAt: FV.serverTimestamp() })],
      ['save a mic take (collection on)', (db, u) => db.doc(`micTakes/${u}-pw`).set({ uid: u, mode: 'pw' })],
      ['save a mic take\'s audio chunk', (db, u) => db.doc(`micTakes/${u}-pw/chunks/0`).set({ i: 0, pcm: firebase.firestore.Blob.fromUint8Array(new Uint8Array(10)) })],
      ['add 1 to the take counter (no read first: the write alone is tried)', async (db, u) => { let n = 0; await admin(async d => { const s = await d.doc('micTakesMeta/count').get(); n = s.exists ? s.data().n : 0; }); return db.doc('micTakesMeta/count').set({ n: n + 1 }); }],
      ['write a practice day', (db, u) => db.doc(`minutes/${u}/days/2026-11-13`).set({ seconds: 60 })],
      ['read its own practice weeks', (db, u) => db.collection(`minutes/${u}/weeks`).get()],
      ['make its Top 5 name tag', (db, u) => db.doc(`minutes/${u}/meta/board`).set({ id: (u + '0'.repeat(32)).replace(/[^0-9a-f]/g, '0').slice(0, 32) })],
      ['write its Top 5 entry', (db, u) => db.doc(`weekBoard/${(u + '0'.repeat(32)).replace(/[^0-9a-f]/g, '0').slice(0, 32)}`).set({ week: '2026-W46', period: 'CAS', seconds: 60 })],
      ['write its class-rank entry', (db, u) => db.doc(`rankBoard/${(u + '0'.repeat(32)).replace(/[^0-9a-f]/g, '0').slice(0, 32)}`).set({ seconds: 60 })],
      ['log an error (siteErrors)', (db, u) => db.collection('siteErrors').add({ kind: 'error', message: 'm', file: '', line: 0, col: 0, stack: '', page: '#', version: 'v', day: new Date().toISOString().slice(0, 10), lang: 'en' })],
    ];
    /* Tags: a refused account can never make one, so its board writes are tried under a tag an admin made for it (the
       board write is then refused by isSchool(), not by a missing tag). */
    const writesFor = async (label, uid, token, ok) => {
      const db = ctx(uid, token);
      if (!ok) await admin(d => d.doc(`minutes/${uid}/meta/board`).set({ id: (uid + '0'.repeat(32)).replace(/[^0-9a-f]/g, '0').slice(0, 32) }));
      for (const [what, fn] of WRITERS) await t(`${label}: ${ok ? 'may' : 'may NOT'} ${what}`, () => fn(db, uid), ok);
    };
    await writesFor('a refused outside account (test9@gmail.example)', 'outsideW', { email: 'test9@gmail.example', email_verified: true }, false);
    await writesFor('an allowed outside account', 'allowedW', { email: 'test8@gmail.example', email_verified: true }, true);
    await writesFor('a school account', 'schoolW', { email: 'test7@seq.org', email_verified: true }, true);
    await t('…the refused account may still ASK (its one door)', () => ctx('outsideW', { email: 'test9@gmail.example', email_verified: true, name: 'Test 9' }).doc('accessRequests/outsideW').set({ name: 'Test 9', email: 'test9@gmail.example', at: FV.serverTimestamp(), status: 'asked' }), true);
    await t('…and once the teacher allows it, its first save lands', async () => { await T.doc('config/access').set({ allow: { outsideW: true } }, { merge: true }); return ctx('outsideW', { email: 'test9@gmail.example', email_verified: true }).doc('progress/outsideW').set({ name: 'Test 9' }, { merge: true }); }, true);
  }

  /* ── paths with no rules block ──────────────────────────────────────── */
  say('== paths with no rules block stay denied (no catch-all)');
  for (const [label, db] of [['a student', A], ['the teacher', T]]) {
    await t(`${label} cannot read foo/bar`, () => db.doc('foo/bar').get(), false);
    await t(`${label} cannot write foo/bar`, () => db.doc('foo/bar').set({ a: 1 }), false);
    await t(`${label} cannot write users/uidA`, () => db.doc('users/uidA').set({ a: 1 }), false);
    await t(`${label} cannot list a collection with no rules (students)`, () => db.collection('students').get(), false);
  }

  await env.cleanup();
  return { pass, fail, red };
}

/* Each break: [name, old text, new text, …]. The old text must occur exactly once in the rules file. */
const PROGRESS_TEACHER = '      allow read: if isTeacher();\n    }\n\n    /* Class-wide';
const CONFIG_BLOCK = 'match /config/class {\n      allow read:  if isSchool();\n      allow write: if isTeacher();\n    }';
const BREAKS = [
  ['progress: the owner check dropped (any signed-in account reads and writes any doc)', 'allow read, write: if isSchool() && request.auth.uid == userId;', 'allow read, write: if isSchool();'],
  ['progress: any signed-in account may read', PROGRESS_TEACHER, '      allow read: if isTeacher();\n      allow read: if isSignedIn();\n    }\n\n    /* Class-wide'],
  ['progress: the teacher may write', PROGRESS_TEACHER, '      allow read, write: if isTeacher();\n    }\n\n    /* Class-wide'],
  ['progress: the teacher may delete', PROGRESS_TEACHER, '      allow read: if isTeacher();\n      allow delete: if isTeacher();\n    }\n\n    /* Class-wide'],
  ['progress: the owner may no longer delete (a tightening must show too)', 'allow read, write: if isSchool() && request.auth.uid == userId;', 'allow read, create, update: if isSchool() && request.auth.uid == userId;'],
  ['progress: a size rule added (a tightening must show too)', 'allow read, write: if isSchool() && request.auth.uid == userId;', 'allow read, delete: if isSchool() && request.auth.uid == userId;\n      allow create, update: if isSchool() && request.auth.uid == userId && !request.resource.data.keys().hasAny([\'blob\']);'],
  ['config/class: a student may write', CONFIG_BLOCK, 'match /config/class {\n      allow read:  if isSchool();\n      allow write: if isSignedIn();\n    }'],
  ['config/class: signed-out read', CONFIG_BLOCK, 'match /config/class {\n      allow read:  if true;\n      allow write: if isTeacher();\n    }'],
  ['config/class: read by the teacher only (a tightening)', CONFIG_BLOCK, 'match /config/class {\n      allow read:  if isTeacher();\n      allow write: if isTeacher();\n    }'],
  ['config: every doc under config/ (config/{doc})', 'match /config/class {', 'match /config/{doc} {'],
  ['config/access: any signed-in account may read the list', 'match /config/access {\n      allow read: if isTeacher();', 'match /config/access {\n      allow read: if isSignedIn();'],
  ['config/access: a student may add themselves', 'allow create, update: if isTeacher()\n            && request.resource.data.keys().hasOnly([\'allow\'])', 'allow create, update: if isSignedIn()\n            && request.resource.data.keys().hasOnly([\'allow\'])'],
  ['config/access: the shape check dropped', "            && request.resource.data.keys().hasOnly(['allow'])\n            && request.resource.data.allow is map;", ';'],
  ['config/access: the teacher may delete it', 'match /config/access {\n      allow read: if isTeacher();', 'match /config/access {\n      allow read, delete: if isTeacher();'],
  ['accessRequests: the asker may set its own status', "&& request.resource.data.status == 'asked';", "&& request.resource.data.status is string;"],
  ['accessRequests: the name check against the token dropped', "            && request.resource.data.name == request.auth.token.get('name', '')\n", ''],
  ['accessRequests: the email check against the token dropped', "            && request.resource.data.email == request.auth.token.get('email', '')\n", ''],
  ['accessRequests: the server-time check dropped', '            && request.resource.data.at == request.time\n', ''],
  ['accessRequests: the name cap dropped', "            && request.resource.data.name.size() <= 200\n            && request.resource.data.name == request.auth.token", "            && request.resource.data.name == request.auth.token"],
  ['accessRequests: the asker may update (ask again)', 'match /accessRequests/{userId} {\n      allow get: if isSignedIn() && request.auth.uid == userId;', 'match /accessRequests/{userId} {\n      allow get: if isSignedIn() && request.auth.uid == userId;\n      allow update: if isSignedIn() && request.auth.uid == userId;'],
  ['accessRequests: any signed-in account may list them', 'match /accessRequests/{userId} {\n      allow get: if isSignedIn() && request.auth.uid == userId;', 'match /accessRequests/{userId} {\n      allow read: if isSignedIn();'],
  ['accessRequests: the teacher may rewrite a request', "request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status'])", 'true'],
  ['isSchool(): the address pattern unanchored', "matches('^[^@]+@seq[.]org$')", "matches('.*@seq[.]org.*')"],
  ['isSchool(): the dot not escaped', "matches('^[^@]+@seq[.]org$')", "matches('^[^@]+@seq.org$')"],
  ['isSchool(): email_verified dropped', "request.auth.token.get('email_verified', false) == true\n               && ", ''],
  ['isSchool(): lower() dropped (a tightening: capitals refused)', "request.auth.token.get('email', '').lower().matches(", "request.auth.token.get('email', '').matches("],
  ['isSchool(): the allow list matches everything', ".data.get('allow', {}).get(request.auth.uid, false) == true", ".data.get('allow', {}).size() >= 0"],
  ['isSchool(): any value in the list counts (not only true)', ".data.get('allow', {}).get(request.auth.uid, false) == true", ".data.get('allow', {}).get(request.auth.uid, false) != false"],
  ['isSchool(): exists() dropped (a missing list is an evaluation error)', "(exists(/databases/$(database)/documents/config/access)\n                  && get(", "(get("],
  ['config/class read left on isSignedIn()', "match /config/class {\n      allow read:  if isSchool();", "match /config/class {\n      allow read:  if isSignedIn();"],
  ['liveQuiz/current read left on isSignedIn()', "match /liveQuiz/current {\n      allow read:  if isSchool();", "match /liveQuiz/current {\n      allow read:  if isSignedIn();"],
  ['answers own get left on isSignedIn()', "allow get: if isSchool() && request.auth.uid == userId;", "allow get: if isSignedIn() && request.auth.uid == userId;"],
  ['micTakesMeta/count read left on isSignedIn()', "allow read:   if isSchool();\n      allow create: if isTeacher()", "allow read:   if isSignedIn();\n      allow create: if isTeacher()"],
  ['weekBoard read left on isSignedIn()', "match /weekBoard/{tag} {\n      allow read: if isSchool();", "match /weekBoard/{tag} {\n      allow read: if isSignedIn();"],
  ['rankBoard read left on isSignedIn()', "match /rankBoard/{tag} {\n      allow read: if isSchool();", "match /rankBoard/{tag} {\n      allow read: if isSignedIn();"],
  ['progress writes left on isSignedIn()', 'allow read, write: if isSchool() && request.auth.uid == userId;', 'allow read, write: if isSignedIn() && request.auth.uid == userId;'],
  ['answers writes left on isSignedIn()', "allow create, update: if isSchool()\n              && request.auth.uid == userId", "allow create, update: if isSignedIn()\n              && request.auth.uid == userId"],
  ['issueReports create left on isSignedIn()', "allow create: if isSchool()\n                    && request.resource.data.uid == request.auth.uid", "allow create: if isSignedIn()\n                    && request.resource.data.uid == request.auth.uid"],
  ['micTakes create left on isSignedIn()', "allow create, update: if isSchool()\n                            && takeId.matches(", "allow create, update: if isSignedIn()\n                            && takeId.matches("],
  ['micTakes chunk create left on isSignedIn()', "allow create, update: if isSchool()\n                              && takeId.matches(", "allow create, update: if isSignedIn()\n                              && takeId.matches("],
  ['micTakesMeta student add left on isSignedIn()', "allow create: if isTeacher()\n                    || (isSchool()", "allow create: if isTeacher()\n                    || (isSignedIn()"],
  ['pmOwner() left on isSignedIn() (minutes, the tag)', "return isSchool() && request.auth.uid == userId;\n    }\n    match /minutes/", "return isSignedIn() && request.auth.uid == userId;\n    }\n    match /minutes/"],
  ['weekBoard write left on isSignedIn()', "allow create, update: if isSchool()\n            && tag == get(/databases/$(database)/documents/minutes/$(request.auth.uid)/meta/board).data.id\n            && request.resource.data.keys().hasOnly(['week'", "allow create, update: if isSignedIn()\n            && tag == get(/databases/$(database)/documents/minutes/$(request.auth.uid)/meta/board).data.id\n            && request.resource.data.keys().hasOnly(['week'"],
  ['rankBoard write left on isSignedIn()', "allow create, update: if isSchool()\n            && tag == get(/databases/$(database)/documents/minutes/$(request.auth.uid)/meta/board).data.id\n            && request.resource.data.keys().hasOnly(['seconds'])", "allow create, update: if isSignedIn()\n            && tag == get(/databases/$(database)/documents/minutes/$(request.auth.uid)/meta/board).data.id\n            && request.resource.data.keys().hasOnly(['seconds'])"],
  ['siteErrors create left on isSignedIn()', "allow create: if isSchool()\n            && errorId.matches(", "allow create: if isSignedIn()\n            && errorId.matches("],
  /* The review's planted faults (2026-11-13, review round 1, f1-f7; f6 "hasAll dropped" is not a fault: every field is also checked). */
  ['accessRequests: the asker may delete its own (and ask again)', 'match /accessRequests/{userId} {\n      allow get: if isSignedIn() && request.auth.uid == userId;', 'match /accessRequests/{userId} {\n      allow get: if isSignedIn() && request.auth.uid == userId;\n      allow delete: if isSignedIn() && request.auth.uid == userId;'],
  ['accessRequests: the teacher may set any status', "&& request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status'])\n            && request.resource.data.status in ['allowed', 'declined'];", "&& request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']);"],
  ['accessRequests: anyone may get any request', 'match /accessRequests/{userId} {\n      allow get: if isSignedIn() && request.auth.uid == userId;', 'match /accessRequests/{userId} {\n      allow get: if isSignedIn();'],
  ['answers: anyone may get any answer', 'allow read, delete: if isTeacher();\n        allow get: if isSchool() && request.auth.uid == userId;', 'allow read, delete: if isTeacher();\n        allow get: if isSchool();'],
  ['accessRequests: the email may be empty', '            && request.resource.data.email.size() > 0\n', ''],
  ['config/access: school accounts may read the list', 'match /config/access {\n      allow read: if isTeacher();', 'match /config/access {\n      allow read: if isSchool() || isSignedIn();'],
  ['accessRequests: the email_verified check dropped', "            && request.auth.token.get('email_verified', false) == true\n            && request.resource.data.at == request.time", "            && request.resource.data.at == request.time"],
  ['isTeacher(): an unverified email accepted', "\n          && request.auth.token.email_verified == true;", ';'],
  ['isTeacher(): any letter case accepted', "request.auth.token.email == 'jhoffman@seq.org'", "request.auth.token.email.lower() == 'jhoffman@seq.org'"],
  ['isTeacher(): anyone at the school accepted', "request.auth.token.email == 'jhoffman@seq.org'", "request.auth.token.email.matches('.*@seq[.]org')"],
  ['liveQuiz/current: a student may write', "match /liveQuiz/current {\n      allow read:  if isSchool();\n      allow write: if isTeacher();", "match /liveQuiz/current {\n      allow read:  if isSchool();\n      allow write: if isSignedIn();"],
  ['answers: students may list them', 'allow read, delete: if isTeacher();\n        allow get: if isSchool() && request.auth.uid == userId;', 'allow read, delete: if isTeacher();\n        allow read: if isSignedIn();'],
  ['answers: the session check dropped', '&& request.resource.data.sessionId == live().sessionId', ''],
  ['answers: hasOnly dropped (a pts field slips in)', ".keys().hasOnly(['uid','name','sessionId','qIndex','choice','ms','at'])", '.keys().size() >= 0'],
  ['answers: a student may delete their own', 'allow read, delete: if isTeacher();\n        allow get: if isSchool() && request.auth.uid == userId;', 'allow read, delete: if isTeacher();\n        allow get, delete: if isSchool() && request.auth.uid == userId;'],
  ['issueReports: students may read', 'allow read:   if isTeacher();\n    }', 'allow read:   if isSignedIn();\n    }'],
  ['issueReports: the uid check dropped', '&& request.resource.data.uid == request.auth.uid\n                    && request.resource.data.keys().hasOnly(\n', '&& request.resource.data.keys().hasOnly(\n'],
  ['issueReports: the message cap raised to 40000', 'request.resource.data.message.size() <= 4000', 'request.resource.data.message.size() <= 40000'],
  ['issueReports: the teacher may delete', 'allow read:   if isTeacher();\n    }', 'allow read:   if isTeacher();\n      allow delete: if isTeacher();\n    }'],
  ['a catch-all read for signed-in accounts', 'service cloud.firestore {\n  match /databases/{database}/documents {\n', 'service cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} { allow read: if request.auth != null; }\n'],
];

/* Every break applies (until 2026-11-14 a text without isSchool() skipped the gate's breaks; there is no such text now). */
const ACTIVE_BREAKS = BREAKS;
console.log(`== rules-core-test: ${which} on the emulator at 127.0.0.1:${PORT} (isSchool() gates the class-wide reads and student writes; ${ACTIVE_BREAKS.length} breaks)`);
const real = await suite(RULES, false);
console.log(`\n${real.fail ? '✗' : '✓'} ${which}: ${real.pass} passed, ${real.fail} failed`);
let missed = 0;
if (ARGV.includes('--breaks')) {
  console.log('\n== broken copies of the rules (each must turn at least one case red)');
  for (const [name, ...pairs] of ACTIVE_BREAKS) {
    let broken = RULES, bad = '';
    for (let i = 0; i < pairs.length; i += 2) {
      const n = broken.split(pairs[i]).length - 1;
      if (n !== 1) { bad = `the text to break is found ${n} times (must be 1): ${JSON.stringify(pairs[i].slice(0, 60))}`; break; }
      broken = broken.replace(pairs[i], () => pairs[i + 1]);
    }
    if (bad) { console.log(`  ✗ ${name}: ${bad}`); missed++; continue; }
    let r;
    try { r = await suite(broken, true); } catch (e) { console.log(`  ✗ ${name}: the broken rules did not load (${String(e.message || e).slice(0, 120)})`); missed++; continue; }
    if (r.fail) console.log(`  ✓ caught: ${name} — ${r.fail} red: ${r.red.slice(0, 3).join(' | ')}${r.red.length > 3 ? ' | …' : ''}`);
    else { console.log(`  ✗ NOT caught: ${name}`); missed++; }
  }
  console.log(`\n${missed ? '✗' : '✓'} ${ACTIVE_BREAKS.length - missed} of ${ACTIVE_BREAKS.length} breaks caught`);
}
process.exit(real.fail || missed ? 1 : 0);
