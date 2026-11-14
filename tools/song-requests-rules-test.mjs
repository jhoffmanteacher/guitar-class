#!/usr/bin/env node
/* Song requests — the songRequests block of firestore.rules, tested against the REAL Firestore emulator
   (2026-11-13). Modelled on tools/rules-core-test.mjs; not part of checks.mjs (it needs Java and a few npm
   packages the repo deliberately does not carry). GitHub runs it with the other rules tools on every push to
   main (.github/workflows/rules.yml).

   One request per student per ISO week: songRequests/<uid>_<week>, create-only for students. The cases:
     create      the exact shape app/songrequests.js srSend() writes; a second request the same week (refused);
                 the id's uid not the signer's; the uid field not the signer's; the week field not the id's;
                 an extra field, a missing field, each wrong type, each cap at and over; a video id that is not
                 11 letters, digits, - or _; a url that is not the one built from the video id; a client time;
                 a state other than 'asked'; a No without a reason, two Yes with one; a week far in the past,
                 far in the future, two weeks either side; signed out
     read        a student gets and lists (where uid == theirs) their own; not another's, not the whole pile;
                 signed out; an account with the teacher's email but email_verified false
     update      a student cannot change their own (state, reason) or delete it; the teacher changes the state
                 and the note, and nothing else (a reason, a title, the uid, a state the site does not know,
                 a note over 200); the teacher deletes, and the student may then ask again the same week
     clock       the same rules with request.time replaced by a fixed moment (songRequestNow()), to test the
                 week maths at its edges: 30 minutes after a Monday 00:00 UTC (last week still accepted, next
                 week not), a day and a minute after it (last week refused), 30 minutes before the next
                 Monday (next week accepted), a day and a minute before it (refused); the year's end:
                 2026-W53 (a real week: 2026 has 53), 2027-W01, and 2027-W53 (no such week: refused), W00, W54.

   Two rules texts (2026-11-13): run it with firestore.rules (published: any signed-in account may ask) and with
   firestore.rules.paste2 (not published: only isSchool() accounts ask and read their own). The section "who may ask"
   checks a school account, an outside account the teacher allowed, an outside account not allowed and an unverified
   @seq.org address; the last two are "today: allowed" on the published text and refused on paste 2.

   --breaks  runs every case against broken copies of the rules, made in memory from the file given; each break
             must turn at least one case red. Exit 1 if any is not caught.
   --port N  the emulator's port (default 8089, as the other rules tools).

   The file imports nothing from the repo, so it runs from any folder that has the packages:
     export JAVA_HOME=~/tools/java/jdk-21.0.13+9-jre/Contents/Home; export PATH="$JAVA_HOME/bin:$PATH"
     # in an empty scratch folder (NOT inside the repo):
     npm init -y
     npm i --legacy-peer-deps firebase-tools@15.36.0 @firebase/rules-unit-testing@6.0.0 firebase@10.12.2
     cp <repo>/tools/song-requests-rules-test.mjs <repo>/firestore.rules .
     # firebase.json:  { "firestore": { "rules": "firestore.rules" }, "emulators": { "firestore": { "port": 8089 }, "ui": { "enabled": false } } }
     npx firebase emulators:exec --only firestore --project demo-gc "node song-requests-rules-test.mjs firestore.rules --port 8089 --breaks"
   The last line of each part is the summary GitHub prints: "✓ firestore.rules: N passed, 0 failed" and
   "✓ K of K breaks caught". Made-up accounts only. */
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
/* Two rules texts are tested (2026-11-13), as by tools/rules-core-test.mjs: firestore.rules, the PUBLISHED one (any
   signed-in account may ask), and firestore.rules.paste2, not published yet (the create and the student's own read
   gated by isSchool(): a verified @seq.org address, or an outside account the teacher allowed in config/access).
   The text given decides the gate (G), what an outside account that is not allowed gets, and which breaks apply. */
const SCHOOL = /function isSchool\(\)/.test(RULES);
const G = SCHOOL ? 'isSchool()' : 'isSignedIn()';
const NOW_FN = 'function songRequestNow() { return request.time; }';

/* ISO week ('2026-W47') of a moment, by its UTC date (practice minutes' weekIdOf, in UTC). */
function weekOf(ms){
  const d = new Date(ms); const day = (d.getUTCDay() + 6) % 7;
  const thu = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) + (3 - day) * 86400000;
  const y = new Date(thu).getUTCFullYear();
  return y + '-W' + String(Math.floor((thu - Date.UTC(y, 0, 1)) / 86400000 / 7) + 1).padStart(2, '0');
}
const DAY = 86400000;
/* A rules text with request.time pinned to `iso` for the week maths. */
const atClock = (rules, iso) => {
  const d = new Date(iso);
  const pin = `function songRequestNow() { return timestamp.date(${d.getUTCFullYear()}, ${d.getUTCMonth() + 1}, ${d.getUTCDate()}) + duration.value(${d.getUTCHours() * 60 + d.getUTCMinutes()}, 'm'); }`;
  return rules.split(NOW_FN).length === 2 ? rules.replace(NOW_FN, () => pin) : null;
};

async function suite(rulesText, quiet) {
  let pass = 0, fail = 0, sec = ''; const red = [];
  const t = async (name, p, expect) => {
    let ok, why = '';
    try { await (expect ? assertSucceeds(p()) : assertFails(p())); ok = true; }
    catch (e) { ok = false; why = String(e.message || e).slice(0, 160); }
    if (ok) pass++; else { fail++; red.push(sec + ': ' + name); }
    if (!quiet) { if (!ok) console.log('     ', why); console.log(ok ? '  ✓ ' + name : '  ✗ ' + sec + ': ' + name); }
  };
  const say = s => { sec = s.replace(/^== /, '').replace(/ \(.*$/, ''); if (!quiet) console.log(s); };
  const FV = firebase.firestore.FieldValue;
  /* The shape srSend() writes (app/songrequests.js). */
  const doc = (uid, week, extra) => Object.assign({ uid, name: 'Test Student ' + uid, email: uid + '@seq.org', period: '4', week,
    videoId: 'dQw4w9WgXcQ', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', lyricsOk: true, topicOk: true, why: '', title: 'Made-up Song — Test Band',
    createdAt: FV.serverTimestamp(), state: 'asked' }, extra || {});

  /* ── the real clock ── */
  {
    const env = await initializeTestEnvironment({ projectId: 'demo-gc', firestore: { rules: rulesText, host: '127.0.0.1', port: PORT } });
    await env.clearFirestore();
    const ctx = (uid, token) => env.authenticatedContext(uid, token).firestore();
    const S = {};
    for (const u of ['uidA', 'uidB', 'uidC', 'uidD', 'uidE', 'uidF', 'uidG', 'uidH']) S[u] = ctx(u, { email: u + '@seq.org', email_verified: true });
    const T = ctx('teacher', { email: TEACHER, email_verified: true });
    const FAKE = ctx('fake', { email: TEACHER, email_verified: false });
    const N = env.unauthenticatedContext().firestore();
    const R = (db, id) => db.collection('songRequests').doc(id);
    const W = weekOf(Date.now()), W2 = weekOf(Date.now() + 14 * DAY), Wm2 = weekOf(Date.now() - 14 * DAY);
    const A = S.uidA, B = S.uidB, C = S.uidC;

    say(`== create: the student's own request this week (${W})`);
    await t('signed out cannot create one', () => R(N, 'uidA_' + W).set(doc('uidA', W)), false);
    for (const [label, extra] of [
      ['an extra field (a made-up grade)', { grade: 'A' }],
      ['the uid field set to another student', { uid: 'uidB' }],
      ['the week field not the id\'s week', { week: W2 }],
      ['name as a number', { name: 5 }], ['name of 201 characters', { name: 'n'.repeat(201) }],
      ['email of 201 characters', { email: 'e'.repeat(201) }],
      ['a classmate\'s email (forged identity, R1-1)', { email: 'uidB@seq.org' }], ['the email in another letter case', { email: 'UIDA@seq.org' }], ['an empty email', { email: '' }], ['a period the site does not know (5)', { period: '5' }],
      ['a 10-character video id', { videoId: 'dQw4w9WgXc', url: 'https://www.youtube.com/watch?v=dQw4w9WgXc' }],
      ['a 12-character video id', { videoId: 'dQw4w9WgXcQQ', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQQ' }],
      ['a video id with a $', { videoId: 'dQw4w9WgX$Q', url: 'https://www.youtube.com/watch?v=dQw4w9WgX$Q' }],
      ['a video id with a quote and a <', { videoId: 'dQw4"<9WgXc', url: 'https://www.youtube.com/watch?v=dQw4"<9WgXc' }],
      ['a url on another host', { url: 'https://evil.example/watch?v=dQw4w9WgXcQ' }],
      ['a url with extra parameters', { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1' }],
      ['a url for another video', { url: 'https://www.youtube.com/watch?v=aaaaaaaaaaa' }],
      ['a javascript: url', { url: 'javascript:alert(1)' }],
      ['lyricsOk as the string "yes"', { lyricsOk: 'yes' }], ['topicOk as 1', { topicOk: 1 }],
      ['the reason as a number', { lyricsOk: false, why: 7 }],
      ['a No without a reason', { lyricsOk: false, why: '' }], ['a No with a reason of one space (R1-3)', { lyricsOk: false, why: ' ' }],
      ['a No with a reason of spaces, a tab and newlines', { topicOk: false, why: ' \t\r\n \n' }], ['the other No without a reason', { topicOk: false, why: '' }],
      ['two Yes with a reason', { why: 'because' }],
      ['a reason of 201 characters', { lyricsOk: false, why: 'w'.repeat(201) }],
      ['a title of 81 characters', { title: 't'.repeat(81) }], ['the title as null', { title: null }],
      ['a time from the device (not the server\'s)', { createdAt: new Date() }],
      ['state "adding"', { state: 'adding' }], ['state "declined"', { state: 'declined' }],
    ]) await t(`refused: ${label}`, () => R(A, 'uidA_' + W).set(doc('uidA', W, extra)), false);
    const noKey = doc('uidA', W); delete noKey.title;
    await t('refused: a field missing (title)', () => R(A, 'uidA_' + W).set(noKey), false);
    await t('refused: an id with another student\'s uid', () => R(A, 'uidB_' + W).set(doc('uidA', W)), false);
    await t('refused: another student\'s uid in the id AND the uid field', () => R(A, 'uidB_' + W).set(doc('uidB', W)), false);
    await t('refused: an id with no week', () => R(A, 'uidA').set(doc('uidA', W)), false);
    await t('refused: an id with something after the week (uidA_<W>x, R1-2)', () => R(A, 'uidA_' + W + 'x').set(doc('uidA', W)), false);
    await t('refused: an id with the week twice (uidA_<W>_<W>)', () => R(A, 'uidA_' + W + '_' + W).set(doc('uidA', W)), false);
    await t('refused: an auto id (add)', () => A.collection('songRequests').add(doc('uidA', W)), false);
    for (const [label, wk] of [['far in the past (2020-W01)', '2020-W01'], ['far in the future (2099-W01)', '2099-W01'], [`two weeks ahead (${W2})`, W2], [`two weeks back (${Wm2})`, Wm2], ['week 00', W.slice(0, 5) + 'W00'], ['week 54', W.slice(0, 5) + 'W54'], ['not a week (2026-11-13)', '2026-11-13']])
      await t(`refused: a week ${label}`, () => R(A, 'uidA_' + wk).set(doc('uidA', wk)), false);
    await t('allowed: the student\'s own request, two Yes, no reason, the token\'s own email', () => R(A, 'uidA_' + W).set(doc('uidA', W, { email: 'uidA@seq.org' })), true);
    await t('refused: a SECOND request the same week (set over it)', () => R(A, 'uidA_' + W).set(doc('uidA', W, { videoId: 'aaaaaaaaaaa', url: 'https://www.youtube.com/watch?v=aaaaaaaaaaa' })), false);
    await t('refused: a second request the same week (update)', () => R(A, 'uidA_' + W).update({ videoId: 'aaaaaaaaaaa', url: 'https://www.youtube.com/watch?v=aaaaaaaaaaa' }), false);
    await t('allowed: a No on the lyrics with a reason (200 characters, the cap)', () => R(B, 'uidB_' + W).set(doc('uidB', W, { lyricsOk: false, why: 'w'.repeat(200) })), true);
    await t('today: a name that is a classmate\'s is allowed (free text; the console never shows it as the identity)', () => R(S.uidE, 'uidE_' + W).set(doc('uidE', W, { name: 'Test Student uidA', videoId: 'a-b_c-d_e-F', url: 'https://www.youtube.com/watch?v=a-b_c-d_e-F', period: '7' })), true);
    await t('allowed: a No on the subject, title 80 characters, empty name and period', () => R(C, 'uidC_' + W).set(doc('uidC', W, { topicOk: false, why: 'There is a radio edit.', title: 't'.repeat(80), name: '', period: '' })), true);
    await t('allowed: a No with a reason over two lines (\'line one\\nline two\', review R2-4)', () => R(S.uidG, 'uidG_' + W).set(doc('uidG', W, { lyricsOk: false, why: 'line one\nline two' })), true);
    await t('allowed: a No with a reason that starts with a newline and spaces (the page trims; the rule allows)', () => R(S.uidH, 'uidH_' + W).set(doc('uidH', W, { topicOk: false, why: '\n  clean version' })), true);
    await t('refused: a forged email from a token whose email is not verified (review R2-4)', () => R(ctx('uidV', { email: 'uidV@seq.org', email_verified: false }), 'uidV_' + W).set(doc('uidV', W, { email: 'uidB@seq.org' })), false);
    await t('allowed: both No, a reason, period CAS, empty title', () => R(S.uidD, 'uidD_' + W).set(doc('uidD', W, { lyricsOk: false, topicOk: false, why: 'Clean version.', title: '', period: 'CAS' })), true);

    say('== read: each student their own; the teacher all');
    await t('the student gets their own', () => R(A, 'uidA_' + W).get(), true);
    await t('the student lists their own (where uid == theirs, the page\'s query)', () => A.collection('songRequests').where('uid', '==', 'uidA').get(), true);
    await t('the student cannot get another student\'s', () => R(A, 'uidB_' + W).get(), false);
    await t('the student cannot list another student\'s (where uid == theirs)', () => A.collection('songRequests').where('uid', '==', 'uidB').get(), false);
    await t('the student cannot list the whole pile', () => A.collection('songRequests').get(), false);
    await t('signed out cannot get one', () => R(N, 'uidA_' + W).get(), false);
    await t('the teacher lists all, newest first (the console\'s read)', () => T.collection('songRequests').orderBy('createdAt', 'desc').limit(500).get(), true);
    await t('the teacher counts the waiting ones (the badge\'s query)', () => T.collection('songRequests').where('state', '==', 'asked').limit(100).get(), true);
    await t('the teacher\'s email with email_verified false cannot list', () => FAKE.collection('songRequests').get(), false);

    say(`== who may ask (${SCHOOL ? 'paste 2: isSchool()' : 'published: isSignedIn()'})`);
    const OUT = ctx('outsideO', { email: 'test.outside@gmail.example', email_verified: true });
    const OK_OUT = ctx('outsideK', { email: 'test.allowed@gmail.example', email_verified: true });
    const UNVER = ctx('uidU', { email: 'uidU@seq.org', email_verified: false });
    await env.withSecurityRulesDisabled(c => c.firestore().doc('config/access').set({ allow: { outsideK: true, outsideO: false } }));
    await t('a school account (verified @seq.org) asks', () => R(S.uidF, 'uidF_' + W).set(doc('uidF', W, { email: 'uidF@seq.org' })), true);
    await t('…and lists its own', () => S.uidF.collection('songRequests').where('uid', '==', 'uidF').get(), true);
    await t(`an outside account the teacher allowed (config/access) asks`, () => R(OK_OUT, 'outsideK_' + W).set(doc('outsideK', W, { email: 'test.allowed@gmail.example', period: 'CAS' })), true);
    await t('…and lists its own', () => OK_OUT.collection('songRequests').where('uid', '==', 'outsideK').get(), true);
    await t(`${SCHOOL ? 'refused' : 'today (published): allowed'}: an outside account NOT allowed (its entry is false) asks`, () => R(OUT, 'outsideO_' + W).set(doc('outsideO', W, { email: 'test.outside@gmail.example' })), !SCHOOL);
    await t(`${SCHOOL ? 'refused' : 'today (published): allowed'}: an @seq.org address that is not verified asks`, () => R(UNVER, 'uidU_' + W).set(doc('uidU', W)), !SCHOOL);
    await env.withSecurityRulesDisabled(c => c.firestore().doc('songRequests/outsideO_' + W).set(Object.assign(doc('outsideO', W), { createdAt: new Date() })));
    await t(`${SCHOOL ? 'refused' : 'today (published): allowed'}: the outside account NOT allowed reads its own request`, () => OUT.collection('songRequests').where('uid', '==', 'outsideO').get(), !SCHOOL);
    await env.withSecurityRulesDisabled(c => c.firestore().doc('config/access').delete());
    await t(`${SCHOOL ? 'refused' : 'today (published): allowed'}: with no config/access at all, the allowed account's own read`, () => OK_OUT.collection('songRequests').where('uid', '==', 'outsideK').get(), !SCHOOL);
    await t('the teacher still reads all (no allow list needed)', () => T.collection('songRequests').get(), true);

    say('== update and delete: only the teacher, only the state and the note');
    await t('the student cannot change their own state', () => R(A, 'uidA_' + W).update({ state: 'adding' }), false);
    await t('the student cannot change their own reason', () => R(B, 'uidB_' + W).update({ why: 'changed' }), false);
    await t('the student cannot add a note', () => R(A, 'uidA_' + W).update({ note: 'hi' }), false);
    await t('the student cannot delete their own', () => R(A, 'uidA_' + W).delete(), false);
    await t('the student cannot delete their own after the teacher set "declined" (R1-2)', async () => { await env.withSecurityRulesDisabled(c => c.firestore().doc('songRequests/uidD_' + W).update({ state: 'declined' })); return R(S.uidD, 'uidD_' + W).delete(); }, false);
    await t('another student cannot delete it', () => R(B, 'uidA_' + W).delete(), false);
    await t('the teacher sets "adding"', () => R(T, 'uidA_' + W).update({ state: 'adding' }), true);
    await t('the student cannot delete their own once it is "adding" (review R2-4)', () => R(A, 'uidA_' + W).delete(), false);
    await t('the teacher sets "declined" on two in one batch (a block)', () => { const b = T.batch(); b.update(R(T, 'uidB_' + W), { state: 'declined' }); b.update(R(T, 'uidC_' + W), { state: 'declined' }); return b.commit(); }, true);
    await t('the teacher sets it back to "asked"', () => R(T, 'uidB_' + W).update({ state: 'asked' }), true);
    await t('the teacher adds a note (200 characters)', () => R(T, 'uidA_' + W).update({ note: 'n'.repeat(200) }), true);
    await t('the teacher empties the note', () => R(T, 'uidA_' + W).update({ note: '' }), true);
    await t('the teacher cannot write a note of 201 characters', () => R(T, 'uidA_' + W).update({ note: 'n'.repeat(201) }), false);
    await t('the teacher cannot write a note as a number', () => R(T, 'uidA_' + W).update({ note: 5 }), false);
    await t('the teacher cannot set a state the site does not know ("done")', () => R(T, 'uidA_' + W).update({ state: 'done' }), false);
    await t('the teacher cannot change the reason', () => R(T, 'uidB_' + W).update({ why: 'changed' }), false);
    await t('the teacher cannot change the title', () => R(T, 'uidA_' + W).update({ title: 'changed' }), false);
    await t('the teacher cannot change the name (R1-2)', () => R(T, 'uidA_' + W).update({ name: 'Someone Else' }), false);
    await t('the teacher cannot change the email (R1-2)', () => R(T, 'uidA_' + W).update({ email: 'uidB@seq.org' }), false);
    await t('the teacher cannot change the state AND the uid', () => R(T, 'uidA_' + W).update({ state: 'adding', uid: 'uidB' }), false);
    await t('the teacher cannot change the video', () => R(T, 'uidA_' + W).update({ videoId: 'aaaaaaaaaaa', url: 'https://www.youtube.com/watch?v=aaaaaaaaaaa' }), false);
    await t('today: the teacher\'s account may create its own request, like any signed-in account', () => R(T, 'teacher_' + W).set(doc('teacher', W, { email: TEACHER })), true);
    await t('…but not one under a student\'s uid', () => R(T, 'uidF_' + W).set(doc('uidF', W)), false);
    await t('the teacher\'s email with email_verified false cannot set a state', () => R(FAKE, 'uidA_' + W).update({ state: 'declined' }), false);
    await t('the teacher deletes uidA\'s request', () => R(T, 'uidA_' + W).delete(), true);
    await t('…and uidA may ask again the same week', () => R(A, 'uidA_' + W).set(doc('uidA', W, { videoId: 'bbbbbbbbbbb', url: 'https://www.youtube.com/watch?v=bbbbbbbbbbb' })), true);
    await t('…and that one used the turn again', () => R(A, 'uidA_' + W).set(doc('uidA', W)), false);
    await env.cleanup();
  }

  /* ── the week maths at its edges, with request.time pinned ── */
  const clockCases = [
    // [the moment (UTC), [week, allowed?], …]
    ['2026-11-16T00:30:00Z', 'Monday 00:30 UTC of 2026-W47 (Sunday evening in California)', [['2026-W46', true], ['2026-W47', true], ['2026-W48', false], ['2026-W45', false]]],
    ['2026-11-17T00:01:00Z', 'a day and a minute after that Monday began', [['2026-W46', false], ['2026-W47', true]]],
    ['2026-11-22T23:30:00Z', '30 minutes before 2026-W48 begins (UTC)', [['2026-W48', true], ['2026-W47', true], ['2026-W49', false]]],
    ['2026-11-21T23:59:00Z', 'a day and a minute before 2026-W48 begins', [['2026-W48', false], ['2026-W47', true]]],
    ['2026-12-31T12:00:00Z', 'New Year\'s Eve 2026 (2026 has a week 53)', [['2026-W53', true], ['2027-W01', false], ['2026-W52', false]]],
    ['2027-01-04T00:30:00Z', 'the first Monday of 2027', [['2027-W01', true], ['2026-W53', true], ['2026-W52', false]]],
    ['2028-01-03T12:00:00Z', 'the first Monday of 2028 (2027 has NO week 53)', [['2028-W01', true], ['2027-W53', false], ['2027-W52', true]]],
  ];
  for (const [iso, label, weeks] of clockCases) {
    say(`== clock: ${label}`);
    const rt = atClock(rulesText, iso);
    if (!rt) { await t(`songRequestNow() is in the rules once, so the clock can be pinned`, () => Promise.reject(new Error('not found')), true); continue; }
    let env;
    try { env = await initializeTestEnvironment({ projectId: 'demo-gc', firestore: { rules: rt, host: '127.0.0.1', port: PORT } }); }
    catch (e) { await t(`the pinned-clock rules load (${iso})`, () => Promise.reject(e), true); continue; }
    await env.clearFirestore();
    const db = env.authenticatedContext('uidZ', { email: 'uidZ@seq.org', email_verified: true }).firestore();
    for (const [wk, allowed] of weeks) {
      await t(`${iso}: ${wk} ${allowed ? 'allowed' : 'refused'}`, () => db.collection('songRequests').doc('uidZ_' + wk).set(Object.assign(doc('uidZ', wk), { createdAt: FV.serverTimestamp() })), allowed);
    }
    await env.cleanup();
  }
  return { pass, fail, red };
}

/* Each break: [name, old text, new text, …]. The old text must occur exactly once in the rules file. */
const BREAKS = [
  ['a student may update (create-only dropped)', "      allow update: if isTeacher()\n            && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['state', 'note'])", "      allow update: if isSignedIn()\n            && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['state', 'note'])"],
  ['the id is not tied to the signer and the week', "            && requestId == request.auth.uid + '_' + request.resource.data.week\n", ''],
  ['the email is not tied to the sign-in token (R1-1)', "            && request.resource.data.email == request.auth.token.email\n", ''],
  ['the reason rule loses (?s): a reason over two lines refused (review R2 plant p3)', "request.resource.data.why.matches('(?s).*[^ \\t\\r\\n].*')", "request.resource.data.why.matches('.*[^ \\t\\r\\n].*')"],
  ['the reason must START with a non-space (review R2 plant p8)', "request.resource.data.why.matches('(?s).*[^ \\t\\r\\n].*')", "request.resource.data.why.matches('(?s)[^ \\t\\r\\n].*')"],
  ['a student may delete their own once "adding" (review R2 plant p5)', "    match /songRequests/{requestId} {\n", "    match /songRequests/{requestId} {\n      allow delete: if request.auth != null && resource.data.uid == request.auth.uid && resource.data.state == 'adding';\n"],
  ['a reason of only spaces accepted (R1-3)', "request.resource.data.why.matches('(?s).*[^ \\t\\r\\n].*')", 'request.resource.data.why.size() > 0'],
  ['the id only has to START with uid_week (R1-2, plant m1)', "            && requestId == request.auth.uid + '_' + request.resource.data.week\n", "            && requestId.matches(request.auth.uid + '_' + request.resource.data.week + '.*')\n"],
  ['a student may delete a declined request (R1-2, plant m2)', "    match /songRequests/{requestId} {\n", "    match /songRequests/{requestId} {\n      allow delete: if request.auth != null && resource.data.uid == request.auth.uid && resource.data.state == 'declined';\n"],
  ['the teacher may change the name and email (R1-2, plant m3)', ".diff(resource.data).affectedKeys().hasOnly(['state', 'note'])", ".diff(resource.data).affectedKeys().hasOnly(['state', 'note', 'name', 'email'])"],
  ['the uid field is not checked', "            && request.resource.data.uid == request.auth.uid\n            && request.resource.data.week is string", "            && request.resource.data.week is string"],
  ['any week accepted (the week check dropped)', "            && songRequestWeekOk(request.resource.data.week)\n", ''],
  ['the week window widened to two weeks ahead', "songRequestNow() < monday + duration.value(8, 'd')", "songRequestNow() < monday + duration.value(15, 'd')"],
  ['the week window narrowed (no day either side)', "songRequestNow() >= monday - duration.value(1, 'd')", "songRequestNow() >= monday"],
  ['the weekday maths off by one', "jan4.dayOfWeek() - 1", "jan4.dayOfWeek()"],
  ['the Thursday-in-the-year check dropped (2027-W53 accepted)', "          && (monday + duration.value(3, 'd')).year() == y\n", '\n'],
  ['hasOnly dropped (an extra field slips in)', "            && request.resource.data.keys().hasOnly(['uid', 'name', 'email', 'period', 'week', 'videoId', 'url', 'lyricsOk', 'topicOk', 'why', 'title', 'createdAt', 'state'])\n", ''],
  ['the url is not pinned to the video id', "            && request.resource.data.url == 'https://www.youtube.com/watch?v=' + request.resource.data.videoId\n", ''],
  ['the video id shape loosened', "request.resource.data.videoId.matches('^[A-Za-z0-9_-]{11}$')", "request.resource.data.videoId.matches('^.{10,12}$')"],
  ['a No needs no reason', "|| ((!request.resource.data.lyricsOk || !request.resource.data.topicOk) && request.resource.data.why.matches('(?s).*[^ \\t\\r\\n].*')))", "|| (!request.resource.data.lyricsOk || !request.resource.data.topicOk))"],
  ['the reason cap raised to 2000', 'request.resource.data.why.size() <= 200', 'request.resource.data.why.size() <= 2000'],
  ['the title cap raised to 800', 'request.resource.data.title.size() <= 80', 'request.resource.data.title.size() <= 800'],
  ['the server time not required', "            && request.resource.data.createdAt == request.time\n", ''],
  ['a student may create any state', "            && request.resource.data.state == 'asked';", ';'],
  ['every signed-in account reads every request', `allow read: if ${G} && resource.data.uid == request.auth.uid;`, 'allow read: if isSignedIn();'],
  ...(SCHOOL ? [
    ['paste 2: the create gate back to isSignedIn() (an outside account not allowed may ask)', '      allow create: if isSchool()\n            && request.resource.data.keys().hasOnly([\'uid\', \'name\', \'email\', \'period\', \'week\'', '      allow create: if isSignedIn()\n            && request.resource.data.keys().hasOnly([\'uid\', \'name\', \'email\', \'period\', \'week\''],
    ['paste 2: the own-read gate back to isSignedIn()', 'allow read: if isSchool() && resource.data.uid == request.auth.uid;', 'allow read: if isSignedIn() && resource.data.uid == request.auth.uid;'],
  ] : []),
  ['the teacher may change any field', ".diff(resource.data).affectedKeys().hasOnly(['state', 'note'])", ".diff(resource.data).affectedKeys().size() >= 0"],
  ['the teacher may set any state', "request.resource.data.state in ['asked', 'adding', 'declined']\n            && (!('note'", "request.resource.data.state is string\n            && (!('note'"],
  ['the teacher may not delete (a tightening must show too)', "allow read, delete: if isTeacher();\n      allow update: if isTeacher()\n            && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['state', 'note'])", "allow read: if isTeacher();\n      allow update: if isTeacher()\n            && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['state', 'note'])"],
  ['the teacher may not read (a tightening must show too)', "allow read, delete: if isTeacher();\n      allow update: if isTeacher()\n            && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['state', 'note'])", "allow delete: if isTeacher();\n      allow update: if isTeacher()\n            && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['state', 'note'])"],
];

console.log(`== song-requests-rules-test: ${which} (student gate ${G}) on the emulator at 127.0.0.1:${PORT}`);
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
