#!/usr/bin/env node
/* Song files — the songFiles and songFilesUsage blocks of firestore.rules, tested against the REAL Firestore emulator
   (2026-11-14). Modelled on tools/song-requests-rules-test.mjs; not part of checks.mjs (it needs Java and a few npm
   packages the repo deliberately does not carry). GitHub runs it with the other rules tools on every push to main
   (.github/workflows/rules.yml).

   Song recordings behind the sign-in: songFiles/{id} (what the file is) and songFiles/{id}/pieces/{i} (its bytes, at
   most 900,000 a piece), written only by the teacher's console (teacher-songfiles.js) and read by the site
   (app/songfiles.js); songFilesUsage/{YYYY-MM}, the month's count of song downloads, which a signed-in account may only
   create for this month and raise. The cases:
     files       a signed-in account reads a file and its pieces; signed out cannot; a student cannot write, update or
                 delete either; the teacher writes the exact shape the console writes (uploading, then ready), and not:
                 an id with a capital, a space, a slash-free dot or 81 characters; an extra or a missing field; bytes 0,
                 a float, over 36,000,000; a SHA-256 in capitals or 63 long; pieceBytes other than 900,000; pieces one
                 off either way; a length of 0 or over 1,800 s; a state the site does not know; a client time; an
                 account with the teacher's email but email_verified false. The teacher deletes.
     pieces      the teacher writes a piece of 1 and of 900,000 bytes; not 0, not 900,001, not a string; an id that is
                 not its index, an index of 40, an id "abc"; an extra field. A student cannot write or delete one.
     counter     a student creates this month's at 1 and at 50,000,000; not 0, not 50,000,001, not a float, not
                 another month, not a malformed id, not with an extra field; raises it by 1 and by 50,000,000, not by
                 0, not down, not by 50,000,001; cannot delete it; the console's own write (set with merge and
                 FieldValue.increment) passes; the teacher sets it to 0 (Reset), to any month, and deletes it.
     clock       the same rules with request.time replaced by a fixed moment (songFilesNow()), at the edges of a month
                 and of a year (UTC): 2026-11-30 23:59 (2026-11 allowed, 2026-12 refused), 2026-12-01 00:00 (the
                 reverse), 2026-12-31 23:59 and 2027-01-01 00:00 (the year rolls).

   One rules text since 2026-11-14 (paste-2 day): firestore.rules, where only isSchool() accounts read and count; a
   text without isSchool() fails at once (0 passed, 1 failed). The section "who may read" checks a school account, an
   outside account the teacher allowed, an outside account not allowed and an unverified @seq.org address; the last
   two are refused (3 cases; until 2026-11-14 they also ran as "today: allowed" on the older published text).

   --breaks  runs every case against broken copies of the rules, made in memory from the file given; each break
             must turn at least one case red. Exit 1 if any is not caught.
   --port N  the emulator's port (default 8089, as the other rules tools).

   Run by hand (the file imports nothing from the repo):
     export JAVA_HOME=~/tools/java/jdk-21.0.13+9-jre/Contents/Home; export PATH="$JAVA_HOME/bin:$PATH"
     # in an empty scratch folder (NOT inside the repo):
     npm init -y
     npm i --legacy-peer-deps firebase-tools@15.36.0 @firebase/rules-unit-testing@6.0.0 firebase@10.12.2
     cp <repo>/tools/song-files-rules-test.mjs <repo>/firestore.rules .
     # firebase.json:  { "firestore": { "rules": "firestore.rules" }, "emulators": { "firestore": { "port": 8089 }, "ui": { "enabled": false } } }
     npx firebase emulators:exec --only firestore --project demo-gc "node song-files-rules-test.mjs firestore.rules --port 8089 --breaks"
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
/* One rules text since 2026-11-14: firestore.rules, with isSchool() as the student gate (G). A text without it is refused. */
if (!/function isSchool\(\)/.test(RULES)) { console.log(`\n✗ ${which} has no isSchool() (the school-accounts gate, in firestore.rules since 2026-11-14): 0 passed, 1 failed`); process.exit(1); }
const G = 'isSchool()';
const NOW_FN = 'function songFilesNow() { return request.time; }';
const PIECE = 900000;

/* The month id app/songfiles.js uses: the UTC year and month, 'YYYY-MM'. */
const monthOf = ms => { const d = new Date(ms); return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0'); };
const atClock = (rules, iso) => {
  const d = new Date(iso);
  const pin = `function songFilesNow() { return timestamp.date(${d.getUTCFullYear()}, ${d.getUTCMonth() + 1}, ${d.getUTCDate()}) + duration.value(${d.getUTCHours() * 60 + d.getUTCMinutes()}, 'm'); }`;
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
  const Blob = firebase.firestore.Blob;
  const bytes = n => Blob.fromUint8Array(new Uint8Array(n).fill(7));
  /* The shape teacher-songfiles.js writes. */
  const head = (extra) => Object.assign({ file: 'made-up-song-full-120.mp3', bytes: 2 * PIECE + 5, sha256: 'a'.repeat(64),
    pieces: 3, pieceBytes: PIECE, durationSec: 181.5, state: 'ready', uploadedAt: FV.serverTimestamp() }, extra || {});

  {
    const env = await initializeTestEnvironment({ projectId: 'demo-gc', firestore: { rules: rulesText, host: '127.0.0.1', port: PORT } });
    await env.clearFirestore();
    const ctx = (uid, token) => env.authenticatedContext(uid, token).firestore();
    const A = ctx('uidA', { email: 'uida@seq.org', email_verified: true });
    const T = ctx('teacher', { email: TEACHER, email_verified: true });
    const FAKE = ctx('fake', { email: TEACHER, email_verified: false });
    const OUT_OK = ctx('outOk', { email: 'someone@gmail.com', email_verified: true });
    const OUT_NO = ctx('outNo', { email: 'stranger@gmail.com', email_verified: true });
    const UNVER = ctx('unver', { email: 'unver@seq.org', email_verified: false });
    const N = env.unauthenticatedContext().firestore();
    const F = (db, id) => db.collection('songFiles').doc(id);
    const P = (db, id, i) => db.collection('songFiles').doc(id).collection('pieces').doc(String(i));
    const U = (db, m) => db.collection('songFilesUsage').doc(m);
    const M = monthOf(Date.now()), Mprev = monthOf(Date.now() - 40 * 86400000), Mnext = monthOf(Date.now() + 40 * 86400000);
    await env.withSecurityRulesDisabled(async c => {
      const db = c.firestore();
      await db.collection('config').doc('access').set({ allow: { outOk: true } });
      await db.collection('songFiles').doc('seeded').set(head({ uploadedAt: new Date() }));
      await db.collection('songFiles').doc('seeded').collection('pieces').doc('0').set({ i: 0, data: bytes(10) });
      await db.collection('songFilesUsage').doc(M).set({ bytes: 1000 });
    });

    say('== files: who may read');
    await t('a school account reads a file', () => F(A, 'seeded').get(), true);
    await t('a school account reads a piece', () => P(A, 'seeded', 0).get(), true);
    await t('a school account lists the files', () => A.collection('songFiles').get(), true);
    await t('a school account reads this month\'s counter', () => U(A, M).get(), true);
    await t('a school account lists the counter collection (the console and the site read one doc; listing is allowed too)', () => A.collection('songFilesUsage').get(), true);
    await t('signed out cannot list the counter collection', () => N.collection('songFilesUsage').get(), false);
    await t('signed out cannot read a file', () => F(N, 'seeded').get(), false);
    await t('signed out cannot read a piece', () => P(N, 'seeded', 0).get(), false);
    await t('signed out cannot read the counter', () => U(N, M).get(), false);
    await t('an outside account the teacher allowed reads a piece', () => P(OUT_OK, 'seeded', 0).get(), true);
    await t('an outside account not allowed cannot read a piece', () => P(OUT_NO, 'seeded', 0).get(), false);
    await t('an unverified @seq.org address cannot read a file', () => F(UNVER, 'seeded').get(), false);
    await t('an outside account not allowed cannot raise the counter', () => U(OUT_NO, M).set({ bytes: FV.increment(5) }, { merge: true }), false);

    say('== files: the teacher writes, nobody else');
    await t('the teacher writes a file as uploading', () => F(T, 'made-up-song-full-120').set(head({ state: 'uploading' })), true);
    await t('…then as ready', () => F(T, 'made-up-song-full-120').set(head()), true);
    await t('a one-piece file (5 bytes)', () => F(T, 'tiny').set(head({ bytes: 5, pieces: 1 })), true);
    await t('a file of exactly 40 pieces (36,000,000 bytes)', () => F(T, 'big').set(head({ bytes: 36000000, pieces: 40 })), true);
    await t('a student cannot write a file', () => F(A, 'made-up-student').set(head()), false);
    await t('a student cannot update a file', () => F(A, 'seeded').update({ state: 'uploading', uploadedAt: FV.serverTimestamp() }), false);
    await t('a student cannot delete a file', () => F(A, 'seeded').delete(), false);
    await t('the teacher\'s email with email_verified false cannot write a file', () => F(FAKE, 'fake-file').set(head()), false);
    for (const [label, id] of [['an id with a capital', 'Made-up'], ['an id with a space', 'made up'], ['an id with a dot', 'made.up'], ['an id starting with a dash', '-made'], ['an id of 81 characters', 'a'.repeat(81)]]) {
      await t('refused: ' + label, () => F(T, id).set(head()), false);
    }
    await t('an id of 80 characters', () => F(T, 'a'.repeat(80)).set(head()), true);
    for (const [label, extra] of [
      ['an extra field', { grade: 'A' }],
      ['bytes 0', { bytes: 0, pieces: 0 }], ['bytes as a float', { bytes: 1800000.5, pieces: 3 }],
      ['bytes over 36,000,000 (41 pieces)', { bytes: 36000001, pieces: 41 }],
      ['a SHA-256 in capitals', { sha256: 'A'.repeat(64) }], ['a SHA-256 of 63', { sha256: 'a'.repeat(63) }], ['a SHA-256 that is not hex', { sha256: 'g'.repeat(64) }],
      ['pieceBytes 1,000,000', { pieceBytes: 1000000 }],
      ['pieces one too few', { pieces: 2 }], ['pieces one too many', { pieces: 4 }],
      ['a length of 0 s', { durationSec: 0 }], ['a length of 1,801 s', { durationSec: 1801 }], ['a length as a string', { durationSec: '180' }],
      ['a state the site does not know', { state: 'done' }],
      ['a client time', { uploadedAt: new Date() }],
      ['an empty file name', { file: '' }], ['a file name of 201', { file: 'f'.repeat(201) }],
    ]) await t('refused: ' + label, () => F(T, 'shape-test').set(head(extra)), false);
    for (const k of ['file', 'bytes', 'sha256', 'pieces', 'pieceBytes', 'durationSec', 'state', 'uploadedAt']) {
      await t('refused: no ' + k, () => { const d = head(); delete d[k]; return F(T, 'shape-test').set(d); }, false);
    }

    say('== pieces');
    await t('the teacher writes piece 0 of 900,000 bytes', () => P(T, 'made-up-song-full-120', 0).set({ i: 0, data: bytes(PIECE) }), true);
    await t('the teacher writes piece 39 of 1 byte', () => P(T, 'made-up-song-full-120', 39).set({ i: 39, data: bytes(1) }), true);
    await t('refused: a piece of 900,001 bytes', () => P(T, 'made-up-song-full-120', 1).set({ i: 1, data: bytes(PIECE + 1) }), false);
    await t('refused: an empty piece', () => P(T, 'made-up-song-full-120', 1).set({ i: 1, data: bytes(0) }), false);
    await t('refused: data as a string', () => P(T, 'made-up-song-full-120', 1).set({ i: 1, data: 'abc' }), false);
    await t('refused: an index that is not the id', () => P(T, 'made-up-song-full-120', 1).set({ i: 2, data: bytes(5) }), false);
    await t('refused: index 40', () => P(T, 'made-up-song-full-120', 40).set({ i: 40, data: bytes(5) }), false);
    await t('refused: an id "abc"', () => P(T, 'made-up-song-full-120', 'abc').set({ i: 0, data: bytes(5) }), false);
    await t('refused: an id "01"', () => P(T, 'made-up-song-full-120', '01').set({ i: 1, data: bytes(5) }), false);
    await t('refused: an extra field', () => P(T, 'made-up-song-full-120', 1).set({ i: 1, data: bytes(5), note: 'x' }), false);
    await t('refused: no index', () => P(T, 'made-up-song-full-120', 1).set({ data: bytes(5) }), false);
    await t('a student cannot write a piece', () => P(A, 'seeded', 1).set({ i: 1, data: bytes(5) }), false);
    await t('a student cannot overwrite a piece', () => P(A, 'seeded', 0).set({ i: 0, data: bytes(5) }), false);
    await t('a student cannot delete a piece', () => P(A, 'seeded', 0).delete(), false);
    await t('the teacher deletes a piece', () => P(T, 'made-up-song-full-120', 39).delete(), true);
    await t('the teacher deletes a file', () => F(T, 'tiny').delete(), true);

    say('== counter: a student');
    const B = ctx('uidB', { email: 'uidb@seq.org', email_verified: true });
    await t('refused: create the next month', () => U(B, Mnext).set({ bytes: 5 }), false);
    await t('refused: create last month', () => U(B, Mprev).set({ bytes: 5 }), false);
    await t('refused: a malformed month id', () => U(B, M.replace('-', '')).set({ bytes: 5 }), false);
    await env.withSecurityRulesDisabled(async c => { await c.firestore().collection('songFilesUsage').doc(M).delete(); });
    await t('refused: create this month at 0', () => U(B, M).set({ bytes: 0 }), false);
    await t('refused: create this month at 50,000,001', () => U(B, M).set({ bytes: 50000001 }), false);
    await t('refused: create this month as a float', () => U(B, M).set({ bytes: 1.5 }), false);
    await t('refused: create with an extra field', () => U(B, M).set({ bytes: 5, who: 'uidB' }), false);
    await t('create this month at 50,000,000', () => U(B, M).set({ bytes: 50000000 }), true);
    await env.withSecurityRulesDisabled(async c => { await c.firestore().collection('songFilesUsage').doc(M).delete(); });
    await t('the site\'s own first count (merge + increment) creates it', () => U(B, M).set({ bytes: FV.increment(1234) }, { merge: true }), true);
    await t('…and the next raises it', () => U(A, M).set({ bytes: FV.increment(50000000) }, { merge: true }), true);
    await t('raise by 1', () => U(A, M).update({ bytes: FV.increment(1) }), true);
    await t('refused: raise by 0', () => U(A, M).update({ bytes: FV.increment(0) }), false);
    await t('refused: lower it', () => U(A, M).update({ bytes: FV.increment(-1) }), false);
    await t('refused: set it to 1', () => U(A, M).set({ bytes: 1 }), false);
    await t('refused: raise by 50,000,001', () => U(A, M).update({ bytes: FV.increment(50000001) }), false);
    await t('refused: raise with an extra field', () => U(A, M).set({ bytes: FV.increment(5), x: 1 }, { merge: true }), false);
    await t('refused: a student deletes it', () => U(A, M).delete(), false);
    await t('refused: signed out raises it', () => U(N, M).set({ bytes: FV.increment(5) }, { merge: true }), false);

    say('== counter: the teacher');
    await t('the teacher resets it to 0', () => U(T, M).set({ bytes: 0 }), true);
    await t('the teacher sets last month\'s', () => U(T, Mprev).set({ bytes: 7 }), true);
    await t('refused: a student raises last month\'s (it exists)', () => U(A, Mprev).update({ bytes: FV.increment(5) }), false);
    await t('refused: the teacher sets it below 0', () => U(T, M).set({ bytes: -1 }), false);
    await t('refused: the teacher adds a field', () => U(T, M).set({ bytes: 0, note: 'x' }), false);
    await t('the teacher deletes it', () => U(T, M).delete(), true);
    await t('refused: the unverified teacher email resets it', () => U(FAKE, Mprev).set({ bytes: 0 }), false);
    await env.cleanup();
  }

  /* ── the month at its edges, with request.time pinned ── */
  const clockCases = [
    ['2026-11-30T23:59:00Z', 'the last minute of November 2026 (UTC)', [['2026-11', true], ['2026-12', false]]],
    ['2026-12-01T00:00:00Z', 'the first minute of December 2026', [['2026-11', false], ['2026-12', true]]],
    ['2026-12-31T23:59:00Z', 'the last minute of 2026', [['2026-12', true], ['2027-01', false]]],
    ['2027-01-01T00:00:00Z', 'the first minute of 2027', [['2026-12', false], ['2027-01', true], ['2026-01', false]]],
  ];
  for (const [iso, label, months] of clockCases) {
    say(`== clock: ${label}`);
    const rt = atClock(rulesText, iso);
    if (!rt) { await t('songFilesNow() is in the rules once, so the clock can be pinned', () => Promise.reject(new Error('not found')), true); continue; }
    let env;
    try { env = await initializeTestEnvironment({ projectId: 'demo-gc', firestore: { rules: rt, host: '127.0.0.1', port: PORT } }); }
    catch (e) { await t(`the pinned-clock rules load (${iso})`, () => Promise.reject(e), true); continue; }
    await env.clearFirestore();
    const db = env.authenticatedContext('uidZ', { email: 'uidz@seq.org', email_verified: true }).firestore();
    for (const [m, allowed] of months) {
      await t(`${iso}: ${m} ${allowed ? 'allowed' : 'refused'}`, () => db.collection('songFilesUsage').doc(m).set({ bytes: 5 }), allowed);
    }
    await env.cleanup();
  }
  return { pass, fail, red };
}

/* Each break: [name, old text, new text, …]. The old text must occur exactly once in the rules file. */
const BREAKS = [
  ['every account reads the files (gate dropped)', `    match /songFiles/{fileId} {\n      allow read: if ${G};`, '    match /songFiles/{fileId} {\n      allow read: if true;'],
  ['every account reads the pieces (gate dropped)', `        allow read: if ${G};\n        allow create, update: if isTeacher()\n              && pieceId`, '        allow read: if true;\n        allow create, update: if isTeacher()\n              && pieceId'],
  ['a student writes a file', "      allow create, update: if isTeacher()\n            && fileId.matches", `      allow create, update: if ${G}\n            && fileId.matches`],
  ['a student writes a piece', "        allow create, update: if isTeacher()\n              && pieceId.matches", `        allow create, update: if ${G}\n              && pieceId.matches`],
  ['a student deletes a file', "            && request.resource.data.uploadedAt == request.time;\n      allow delete: if isTeacher();", `            && request.resource.data.uploadedAt == request.time;\n      allow delete: if ${G};`],
  ['a student deletes a piece', "              && request.resource.data.data.size() <= 900000;\n        allow delete: if isTeacher();", `              && request.resource.data.data.size() <= 900000;\n        allow delete: if ${G};`],
  ['the id shape loosened', "fileId.matches('^[a-z0-9][a-z0-9-]{0,79}$')", "fileId.matches('^.{1,200}$')"],
  ['hasOnly dropped on the file', "            && request.resource.data.keys().hasOnly(['file', 'bytes', 'sha256', 'pieces', 'pieceBytes', 'durationSec', 'state', 'uploadedAt'])\n", ''],
  /* No break drops the file's hasAll: every one of its eight fields is also checked by name below it, so a missing
     field is refused either way (that mutant changes nothing; the 'no <field>' cases above hold the behaviour). */
  ['the size cap raised', 'request.resource.data.bytes <= 36000000', 'request.resource.data.bytes <= 360000000'],
  ['the SHA-256 shape loosened', "request.resource.data.sha256.matches('^[0-9a-f]{64}$')", "request.resource.data.sha256.matches('^[0-9a-fA-F]{63,64}$')"],
  ['pieces not tied to the bytes', "            && request.resource.data.pieces == math.ceil(request.resource.data.bytes / 900000.0)\n", ''],
  ['the piece size not pinned', "            && request.resource.data.pieceBytes == 900000\n", ''],
  ['any state', "request.resource.data.state in ['uploading', 'ready']", 'request.resource.data.state is string'],
  ['a client time accepted', "            && request.resource.data.uploadedAt == request.time;", ';'],
  ['the length cap dropped', "            && request.resource.data.durationSec <= 1800\n", ''],
  ['a piece over 900,000 bytes', 'request.resource.data.data.size() <= 900000;', 'request.resource.data.data.size() <= 1000000;'],
  ['an empty piece', "              && request.resource.data.data.size() >= 1\n", ''],
  ['a piece not tied to its id', "              && string(request.resource.data.i) == pieceId\n", ''],
  ['a piece index past 39', "              && request.resource.data.i < 40\n", ''],
  ['hasOnly dropped on a piece', "              && request.resource.data.keys().hasOnly(['i', 'data'])\n", ''],
  ['any month counted (this month not required on create)', "      allow create: if " + G + "\n            && songFilesThisMonth(month)\n", "      allow create: if " + G + "\n"],
  ['any month raised (this month not required on update)', "      allow update: if " + G + "\n            && songFilesThisMonth(month)\n", "      allow update: if " + G + "\n"],
  ['the month maths reads the year only', "          && int(month[5:7]) == songFilesNow().month();", ';'],
  ['a student creates the counter at 0', "            && request.resource.data.bytes >= 1\n            && request.resource.data.bytes <= 50000000;", "            && request.resource.data.bytes >= 0\n            && request.resource.data.bytes <= 50000000;"],
  ['a student may lower the counter', 'request.resource.data.bytes > resource.data.bytes\n', 'request.resource.data.bytes >= 0\n'],
  ['a student may raise it without end', 'request.resource.data.bytes <= resource.data.bytes + 50000000;', 'request.resource.data.bytes >= 0;'],
  ['a student may add a field to the counter', "            && songFilesThisMonth(month)\n            && request.resource.data.keys().hasOnly(['bytes'])\n            && request.resource.data.bytes is int\n            && request.resource.data.bytes > resource", "            && songFilesThisMonth(month)\n            && request.resource.data.bytes is int\n            && request.resource.data.bytes > resource"],
  ['a student deletes the counter', "            && request.resource.data.bytes >= 0;\n      allow delete: if isTeacher();", `            && request.resource.data.bytes >= 0;\n      allow delete: if ${G};`],
  ['the counter collection cannot be listed (get only; a tightening must show too)', `    match /songFilesUsage/{month} {\n      allow read: if ${G};`, `    match /songFilesUsage/{month} {\n      allow get: if ${G};`],
  ['the counter readable signed out', `    match /songFilesUsage/{month} {\n      allow read: if ${G};`, '    match /songFilesUsage/{month} {\n      allow read: if true;'],
  ['the teacher may not reset (a tightening must show too)', "      allow create, update: if isTeacher()\n            && request.resource.data.keys().hasOnly(['bytes'])\n            && request.resource.data.bytes is int\n            && request.resource.data.bytes >= 0;", "      allow create, update: if false;"],
  ['the teacher may not write a file (a tightening must show too)', "      allow create, update: if isTeacher()\n            && fileId.matches", "      allow create, update: if false\n            && fileId.matches"],
];

console.log(`== song-files-rules-test: ${which} (student gate ${G}) on the emulator at 127.0.0.1:${PORT}`);
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
