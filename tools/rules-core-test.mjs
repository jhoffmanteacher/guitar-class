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
     liveQuiz/current    and answers/{uid}: the live round's shape, session and timing conditions
     issueReports/*      the exact shape submitIssueReport() writes, the caps, teacher-only reading
     weekBoard, rankBoard  only what pm-rules-test does not already pin (the teacher's account, list)
     no rules block      a few paths with no match must stay denied
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
const TEACHER = 'jhoffman@seq.org';

async function suite(rulesText, quiet) {
  let pass = 0, fail = 0, sec = ''; const red = [];
  const env = await initializeTestEnvironment({ projectId: 'demo-gc', firestore: { rules: rulesText, host: '127.0.0.1', port: PORT } });
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
  const A = ctx('uidA', { email: 'a@student.org', email_verified: true });
  const B = ctx('uidB', { email: 'b@student.org', email_verified: true });
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
  const save = extra => Object.assign({ name: 'Ana Lopez', email: 'a@student.org', skills: { 'm1w1-b-sec0-0': true }, responses: { 'm1w1-b-sec1-2': 'G' },
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
  await t('merge with an increment (songsLibraryOpen\'s songOpens)', () => P(A, 'uidA').set({ name: 'Ana Lopez', email: 'a@student.org', songOpens: { '12': FV.increment(1) } }, { merge: true }), true);
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
  await t('an account with the teacher\'s email, unverified, still reads it (any signed-in account does)', () => FAKES[0][1].doc('config/class').get(), true);
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
  const rep = extra => Object.assign({ uid: 'uidA', email: 'a@student.org', name: 'Ana Lopez', message: 'The tab for Riptide does not scroll.', location: 'Module 4 · m4w2',
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
const CONFIG_BLOCK = 'match /config/class {\n      allow read:  if isSignedIn();\n      allow write: if isTeacher();\n    }';
const BREAKS = [
  ['progress: the owner check dropped (any signed-in account reads and writes any doc)', 'allow read, write: if isSignedIn() && request.auth.uid == userId;', 'allow read, write: if isSignedIn();'],
  ['progress: any signed-in account may read', PROGRESS_TEACHER, '      allow read: if isTeacher();\n      allow read: if isSignedIn();\n    }\n\n    /* Class-wide'],
  ['progress: the teacher may write', PROGRESS_TEACHER, '      allow read, write: if isTeacher();\n    }\n\n    /* Class-wide'],
  ['progress: the teacher may delete', PROGRESS_TEACHER, '      allow read: if isTeacher();\n      allow delete: if isTeacher();\n    }\n\n    /* Class-wide'],
  ['progress: the owner may no longer delete (a tightening must show too)', 'allow read, write: if isSignedIn() && request.auth.uid == userId;', 'allow read, create, update: if isSignedIn() && request.auth.uid == userId;'],
  ['progress: a size rule added (a tightening must show too)', 'allow read, write: if isSignedIn() && request.auth.uid == userId;', 'allow read, delete: if isSignedIn() && request.auth.uid == userId;\n      allow create, update: if isSignedIn() && request.auth.uid == userId && !request.resource.data.keys().hasAny([\'blob\']);'],
  ['config/class: a student may write', CONFIG_BLOCK, 'match /config/class {\n      allow read:  if isSignedIn();\n      allow write: if isSignedIn();\n    }'],
  ['config/class: signed-out read', CONFIG_BLOCK, 'match /config/class {\n      allow read:  if true;\n      allow write: if isTeacher();\n    }'],
  ['config/class: read by the teacher only (a tightening)', CONFIG_BLOCK, 'match /config/class {\n      allow read:  if isTeacher();\n      allow write: if isTeacher();\n    }'],
  ['config: every doc under config/ (config/{doc})', 'match /config/class {', 'match /config/{doc} {'],
  ['isTeacher(): an unverified email accepted', "\n          && request.auth.token.email_verified == true;", ';'],
  ['isTeacher(): any letter case accepted', "request.auth.token.email == 'jhoffman@seq.org'", "request.auth.token.email.lower() == 'jhoffman@seq.org'"],
  ['isTeacher(): anyone at the school accepted', "request.auth.token.email == 'jhoffman@seq.org'", "request.auth.token.email.matches('.*@seq[.]org')"],
  ['liveQuiz/current: a student may write', "match /liveQuiz/current {\n      allow read:  if isSignedIn();\n      allow write: if isTeacher();", "match /liveQuiz/current {\n      allow read:  if isSignedIn();\n      allow write: if isSignedIn();"],
  ['answers: students may list them', 'allow get: if isSignedIn() && request.auth.uid == userId;', 'allow read: if isSignedIn();'],
  ['answers: the session check dropped', '&& request.resource.data.sessionId == live().sessionId', ''],
  ['answers: hasOnly dropped (a pts field slips in)', ".keys().hasOnly(['uid','name','sessionId','qIndex','choice','ms','at'])", '.keys().size() >= 0'],
  ['answers: a student may delete their own', 'allow get: if isSignedIn() && request.auth.uid == userId;', 'allow get, delete: if isSignedIn() && request.auth.uid == userId;'],
  ['issueReports: students may read', 'allow read:   if isTeacher();\n    }', 'allow read:   if isSignedIn();\n    }'],
  ['issueReports: the uid check dropped', '&& request.resource.data.uid == request.auth.uid\n                    && request.resource.data.keys().hasOnly(\n', '&& request.resource.data.keys().hasOnly(\n'],
  ['issueReports: the message cap raised to 40000', 'request.resource.data.message.size() <= 4000', 'request.resource.data.message.size() <= 40000'],
  ['issueReports: the teacher may delete', 'allow read:   if isTeacher();\n    }', 'allow read:   if isTeacher();\n      allow delete: if isTeacher();\n    }'],
  ['a catch-all read for signed-in accounts', 'service cloud.firestore {\n  match /databases/{database}/documents {\n', 'service cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} { allow read: if request.auth != null; }\n'],
];

console.log(`== rules-core-test: ${which} on the emulator at 127.0.0.1:${PORT}`);
const real = await suite(RULES, false);
console.log(`\n${real.fail ? '✗' : '✓'} ${which}: ${real.pass} passed, ${real.fail} failed`);
let missed = 0;
if (ARGV.includes('--breaks')) {
  console.log('\n== broken copies of the rules (each must turn at least one case red)');
  for (const [name, ...pairs] of BREAKS) {
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
  console.log(`\n${missed ? '✗' : '✓'} ${BREAKS.length - missed} of ${BREAKS.length} breaks caught`);
}
process.exit(real.fail || missed ? 1 : 0);
