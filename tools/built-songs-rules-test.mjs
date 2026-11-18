#!/usr/bin/env node
/* Built songs — the builtSongs, builtSongsMeta and songDrafts block of firestore.rules, tested against the REAL
   Firestore emulator (2026-11-14, Song builder Part a1). Modelled on tools/song-files-rules-test.mjs; not part of
   checks.mjs (it needs Java and a few npm packages the repo deliberately does not carry). GitHub runs it with the other
   rules tools on every push to main (.github/workflows/rules.yml).

   A Play Along song Jonathan builds in the console: builtSongs/{id} (what the song is: title, artist, the songFiles
   entry its audio is in, the chart), builtSongsMeta/list (the songs the Songs page lists) and songDrafts/{id} (a song
   still being built). Only the teacher writes any of them. The cases:
     read        a school account, an outside account the teacher allowed, an outside account not allowed, an
                 unverified @seq.org address, the teacher's email unverified, and signed out: each gets one built song
                 and reads the list, or is refused (the last four are). A school account cannot list builtSongs (get
                 only); the teacher lists them. Nobody but the teacher reads a draft.
     students    a school account (and an allowed outside account) cannot create, update or delete a built song, the
                 list or a draft.
     songs       the teacher writes the exact shape the console will write (create, a re-save, with and without the
                 two optional audio fields, the edges: an id of 8 and of 24, v 1 and 99, a title of 120, an empty
                 artist, bytes 36,000,000, a length of 1,800 s, centsOff 10 and -10, gainDb 40 and -40) and not: an
                 id without 'sb-', with a capital, of 7 or of 25; a missing or an extra key; v 0, 100 or a float; a
                 title of 0 or 121 or of spaces only, a title or artist that is not a string; an artist of 121; an
                 audio map with an extra key or without one of its five; an audio id not shaped like a songFiles id
                 (a capital, a dot, a slash, an underscore, a space); bytes 0, 36,000,001 or a float; a SHA-256 in
                 capitals or 63 long; a length of 0, 1,801 or a string; centsOff 10.1, -10.1 or a string; gainDb
                 40.1, -40.1, a string, a map or null; a sourceSha256 that is a number, in capitals or 63 long; song
                 not a map; a client time; the teacher's email with email_verified false. Nobody but the teacher
                 deletes a song, also one the teacher has re-saved as v 2. The teacher deletes.
     list        the teacher writes the list with 0, 1 and 200 songs; not 201, not songs as a list, not an extra key,
                 not without songs, not a client time. The teacher deletes it.
     drafts      the teacher writes a draft of any shape with an 'sb-' id, reads and deletes it; not an id without
                 'sb-' or with a capital.

   One rules text: firestore.rules, where only isSchool() accounts read; a text without isSchool() fails at once
   (0 passed, 1 failed).

   --breaks  runs every case against broken copies of the rules, made in memory from the file given; each break
             must turn at least one case red. Exit 1 if any is not caught.
   --port N  the emulator's port (default 8089, as the other rules tools).

   Run by hand (the file imports nothing from the repo):
     export JAVA_HOME=~/tools/java/jdk-21.0.13+9-jre/Contents/Home; export PATH="$JAVA_HOME/bin:$PATH"
     # in an empty scratch folder (NOT inside the repo):
     npm init -y
     npm i --legacy-peer-deps firebase-tools@15.36.0 @firebase/rules-unit-testing@6.0.0 firebase@10.12.2
     cp <repo>/tools/built-songs-rules-test.mjs <repo>/firestore.rules .
     # firebase.json:  { "firestore": { "rules": "firestore.rules" }, "emulators": { "firestore": { "port": 8089 }, "ui": { "enabled": false } } }
     npx firebase emulators:exec --only firestore --project demo-gc "node built-songs-rules-test.mjs firestore.rules --port 8089 --breaks"
   The last line of each part is the summary GitHub prints: "✓ firestore.rules: N passed, 0 failed" and
   "✓ K of K breaks caught". Made-up accounts and songs only. */
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
if (!/function isSchool\(\)/.test(RULES)) { console.log(`\n✗ ${which} has no isSchool() (the school-accounts gate, in firestore.rules since 2026-11-14): 0 passed, 1 failed`); process.exit(1); }
const G = 'isSchool()';

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
  /* The shape the console will write (Song builder): a made-up song. */
  const audio = (extra) => Object.assign({ id: 'sb-test0song1-full', bytes: 5040000, sha256: 'a'.repeat(64), durationSec: 210.5,
    centsOff: 3.2, gainDb: -1.5, sourceSha256: 'b'.repeat(64) }, extra || {});
  const song = () => ({ bpm: 96, meter: 4, bars: [{ t: 0.512 }, { t: 3.012 }], sections: [{ name: 'Verse', from: 1, to: 2 }],
    chords: [{ bar: 1, chords: ['G', 'C'] }, { bar: 2, chords: ['D'] }], lyrics: ['Test line one', 'Test line two'] });
  const doc = (extra) => Object.assign({ v: 1, title: 'Test Song 0', artist: 'Test Band', audio: audio(), song: song(),
    savedAt: FV.serverTimestamp() }, extra || {});
  const metaOf = n => { const songs = {}; for (let i = 0; i < n; i++) songs['sb-test' + String(i).padStart(5, '0')] = { title: 'Test Song ' + i, artist: '' }; return songs; };

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
  const S = (db, id) => db.collection('builtSongs').doc(id);
  const L = db => db.collection('builtSongsMeta').doc('list');
  const D = (db, id) => db.collection('songDrafts').doc(id);
  const SEED = 'sb-seeded0001';
  await env.withSecurityRulesDisabled(async c => {
    const db = c.firestore();
    await db.collection('config').doc('access').set({ allow: { outOk: true } });
    await db.collection('builtSongs').doc(SEED).set(doc({ savedAt: new Date() }));
    await db.collection('builtSongsMeta').doc('list').set({ songs: metaOf(1), updatedAt: new Date() });
    await db.collection('songDrafts').doc('sb-draft00001').set({ anything: 'Test draft', step: 2 });
  });

  say('== read: who may read');
  await t('a school account gets a built song', () => S(A, SEED).get(), true);
  await t('a school account reads the list', () => L(A).get(), true);
  await t('an outside account the teacher allowed gets a built song', () => S(OUT_OK, SEED).get(), true);
  await t('an outside account the teacher allowed reads the list', () => L(OUT_OK).get(), true);
  await t('an outside account not allowed cannot get a built song', () => S(OUT_NO, SEED).get(), false);
  await t('an outside account not allowed cannot read the list', () => L(OUT_NO).get(), false);
  await t('an unverified @seq.org address cannot get a built song', () => S(UNVER, SEED).get(), false);
  await t('an unverified @seq.org address cannot read the list', () => L(UNVER).get(), false);
  await t('the teacher\'s email unverified cannot get a built song', () => S(FAKE, SEED).get(), false);
  await t('signed out cannot get a built song', () => S(N, SEED).get(), false);
  await t('signed out cannot read the list', () => L(N).get(), false);
  await t('a school account cannot list the built songs (get only)', () => A.collection('builtSongs').get(), false);
  await t('an allowed outside account cannot list the built songs', () => OUT_OK.collection('builtSongs').get(), false);
  await t('an outside account not allowed cannot list the built songs', () => OUT_NO.collection('builtSongs').get(), false);
  await t('the teacher lists the built songs', () => T.collection('builtSongs').get(), true);
  await t('the teacher gets a built song', () => S(T, SEED).get(), true);
  await t('a school account gets an id that has no song (an empty answer)', () => S(A, 'sb-nosuchsong').get(), true);
  await t('a school account cannot read a draft', () => D(A, 'sb-draft00001').get(), false);
  await t('a school account cannot list the drafts', () => A.collection('songDrafts').get(), false);
  await t('signed out cannot read a draft', () => D(N, 'sb-draft00001').get(), false);
  await t('the teacher\'s email unverified cannot read a draft', () => D(FAKE, 'sb-draft00001').get(), false);
  await t('the teacher reads a draft', () => D(T, 'sb-draft00001').get(), true);
  await t('the teacher lists the drafts', () => T.collection('songDrafts').get(), true);

  say('== students: nobody but the teacher writes');
  for (const [who, db] of [['a school account', A], ['an allowed outside account', OUT_OK]]) {
    await t(`${who} cannot create a built song`, () => S(db, 'sb-student0001').set(doc()), false);
    await t(`${who} cannot update a built song`, () => S(db, SEED).update({ title: 'Test hacked', savedAt: FV.serverTimestamp() }), false);
    await t(`${who} cannot delete a built song`, () => S(db, SEED).delete(), false);
    await t(`${who} cannot write the list`, () => L(db).set({ songs: metaOf(2), updatedAt: FV.serverTimestamp() }), false);
    await t(`${who} cannot update the list`, () => L(db).update({ songs: {}, updatedAt: FV.serverTimestamp() }), false);
    await t(`${who} cannot delete the list`, () => L(db).delete(), false);
    await t(`${who} cannot create a draft`, () => D(db, 'sb-student0002').set({ x: 1 }), false);
    await t(`${who} cannot update a draft`, () => D(db, 'sb-draft00001').set({ x: 1 }), false);
    await t(`${who} cannot delete a draft`, () => D(db, 'sb-draft00001').delete(), false);
  }
  await t('signed out cannot create a built song', () => S(N, 'sb-signedout01').set(doc()), false);

  say('== songs: the teacher writes the console\'s shape');
  await t('the teacher creates a built song', () => S(T, 'sb-test0song1').set(doc()), true);
  await t('…and re-saves it (update, new savedAt)', () => S(T, 'sb-test0song1').update({ title: 'Test Song 0b', savedAt: FV.serverTimestamp() }), true);
  await t('…and sets it again whole (v 2)', () => S(T, 'sb-test0song1').set(doc({ v: 2 })), true);
  await t('a school account cannot delete that v 2 song', () => S(A, 'sb-test0song1').delete(), false);
  await t('an allowed outside account cannot delete that v 2 song', () => S(OUT_OK, 'sb-test0song1').delete(), false);
  await t('signed out cannot delete that v 2 song', () => S(N, 'sb-test0song1').delete(), false);
  await t('the teacher\'s email unverified cannot delete that v 2 song', () => S(FAKE, 'sb-test0song1').delete(), false);
  await t('without gainDb and sourceSha256', () => { const a = audio(); delete a.gainDb; delete a.sourceSha256; return S(T, 'sb-test0song2').set(doc({ audio: a })); }, true);
  await t('an id of 8 characters after sb-', () => S(T, 'sb-' + 'a'.repeat(8)).set(doc()), true);
  await t('an id of 24 characters after sb-', () => S(T, 'sb-' + 'a1'.repeat(12)).set(doc()), true);
  for (const [label, extra] of [
    ['v 1', { v: 1 }], ['v 99', { v: 99 }], ['a title of 1', { title: 'T' }], ['a title of 120', { title: 't'.repeat(120) }],
    ['an empty artist', { artist: '' }], ['an artist of 120', { artist: 'a'.repeat(120) }],
    ['bytes 1', { audio: audio({ bytes: 1 }) }], ['bytes 36,000,000', { audio: audio({ bytes: 36000000 }) }],
    ['a length of 1,800 s', { audio: audio({ durationSec: 1800 }) }], ['a length of 1 s (an int)', { audio: audio({ durationSec: 1 }) }],
    ['centsOff 10', { audio: audio({ centsOff: 10 }) }], ['centsOff -10', { audio: audio({ centsOff: -10 }) }], ['centsOff 0 (an int)', { audio: audio({ centsOff: 0 }) }],
    ['a title with spaces around a letter', { title: ' x ' }],
    ['gainDb 40', { audio: audio({ gainDb: 40 }) }], ['gainDb -40', { audio: audio({ gainDb: -40 }) }], ['gainDb 0 (an int)', { audio: audio({ gainDb: 0 }) }],
    ['without gainDb only', { audio: (() => { const a = audio(); delete a.gainDb; return a; })() }],
    ['without sourceSha256 only', { audio: (() => { const a = audio(); delete a.sourceSha256; return a; })() }],
    ['an empty song map', { song: {} }], ['an audio id like a songFiles id', { audio: audio({ id: 'made-up-song-full-120' }) }],
    /* song.sheet (2026-11-18, app/builtsongs.js: a chord sheet pdf in the song-file store, the card's Lyrics view):
       today's rules check the song map's shape only, so a doc with one is written with no paste. */
    ['a song with a chord sheet (song.sheet)', { song: Object.assign(song(), { sheet: { id: 'sheet-test0song1-0a1b2c3d', bytes: 120000, sha256: 'c'.repeat(64) } }) }],
    ['a song with a two-column chord sheet (song.sheet.cols 2)', { song: Object.assign(song(), { sheet: { id: 'sheet-test0song1-0a1b2c3d', bytes: 5000000, sha256: 'c'.repeat(64), cols: 2 } }) }],
  ]) await t(label, () => S(T, 'sb-edges0001').set(doc(extra)), true);
  for (const [label, id] of [['an id without sb-', 'test0song1abc'], ['an id with sb_', 'sb_test0song1'], ['an id with a capital', 'sb-Test0song1'],
    ['an id of 7 after sb-', 'sb-' + 'a'.repeat(7)], ['an id of 25 after sb-', 'sb-' + 'a'.repeat(25)], ['an id with a dash after sb-', 'sb-test-song1'],
    ['an id with SB-', 'SB-test0song1'], ['an id with text before sb-', 'xsb-test0song1']]) {
    await t('refused: ' + label, () => S(T, id).set(doc()), false);
  }
  for (const [label, extra] of [
    ['an extra key', { grade: 'A' }],
    ['v 0', { v: 0 }], ['v 100', { v: 100 }], ['v 1.5', { v: 1.5 }], ['v as a string', { v: '1' }],
    ['a title of 0', { title: '' }], ['a title of three spaces', { title: '   ' }], ['a title of a tab and a newline', { title: '\t\n' }], ['a title of 121', { title: 't'.repeat(121) }], ['a title as a list', { title: ['Test'] }],
    ['an artist of 121', { artist: 'a'.repeat(121) }], ['an artist as a list', { artist: ['Test'] }], ['an artist as a map', { artist: {} }],
    ['audio as a string', { audio: 'sb-test0song1-full' }], ['audio as a list', { audio: ['sb-test0song1-full'] }],
    ['an audio map with an extra key', { audio: audio({ url: 'https://example.com/x.mp3' }) }],
    ['an audio id with a capital', { audio: audio({ id: 'Sb-test0song1' }) }], ['an audio id with a dot', { audio: audio({ id: 'sb-test.mp3' }) }],
    ['an audio id with a slash', { audio: audio({ id: 'sb-test/song1' }) }], ['an audio id with an underscore', { audio: audio({ id: 'sb-test_song1' }) }],
    ['an audio id with a space', { audio: audio({ id: 'sb-test song1' }) }],
    ['an audio id of 81', { audio: audio({ id: 'a'.repeat(81) }) }], ['an audio id as a number', { audio: audio({ id: 12345 }) }],
    ['bytes 0', { audio: audio({ bytes: 0 }) }], ['bytes 36,000,001', { audio: audio({ bytes: 36000001 }) }], ['bytes 1.5', { audio: audio({ bytes: 1.5 }) }],
    ['a SHA-256 in capitals', { audio: audio({ sha256: 'A'.repeat(64) }) }], ['a SHA-256 of 63', { audio: audio({ sha256: 'a'.repeat(63) }) }],
    ['a SHA-256 of 65', { audio: audio({ sha256: 'a'.repeat(65) }) }],
    ['a length of 0 s', { audio: audio({ durationSec: 0 }) }], ['a length of 1,801 s', { audio: audio({ durationSec: 1801 }) }],
    ['a length as a string', { audio: audio({ durationSec: '210' }) }],
    ['centsOff 10.1', { audio: audio({ centsOff: 10.1 }) }], ['centsOff -10.1', { audio: audio({ centsOff: -10.1 }) }],
    ['centsOff 11', { audio: audio({ centsOff: 11 }) }], ['centsOff as a string', { audio: audio({ centsOff: '3' }) }],
    ['gainDb 40.1', { audio: audio({ gainDb: 40.1 }) }], ['gainDb -40.1', { audio: audio({ gainDb: -40.1 }) }],
    ['gainDb as a string', { audio: audio({ gainDb: 'x'.repeat(500) }) }], ['gainDb as a map', { audio: audio({ gainDb: { a: 1 } }) }],
    ['gainDb null', { audio: audio({ gainDb: null }) }],
    ['a sourceSha256 that is a number', { audio: audio({ sourceSha256: 12345 }) }], ['a sourceSha256 in capitals', { audio: audio({ sourceSha256: 'B'.repeat(64) }) }],
    ['a sourceSha256 of 63', { audio: audio({ sourceSha256: 'b'.repeat(63) }) }],
    ['song as a string', { song: 'Test chart' }], ['song as a list', { song: ['G', 'C'] }],
    ['a client time', { savedAt: new Date() }],
  ]) await t('refused: ' + label, () => S(T, 'sb-shape0001').set(doc(extra)), false);
  for (const k of ['v', 'title', 'artist', 'audio', 'song', 'savedAt']) {
    await t('refused: no ' + k, () => { const d = doc(); delete d[k]; return S(T, 'sb-shape0001').set(d); }, false);
  }
  for (const k of ['id', 'bytes', 'sha256', 'durationSec', 'centsOff']) {
    await t('refused: audio without ' + k, () => { const a = audio(); delete a[k]; return S(T, 'sb-shape0001').set(doc({ audio: a })); }, false);
  }
  await t('refused: a re-save with a client time', () => S(T, 'sb-test0song1').update({ title: 'Test x', savedAt: new Date() }), false);
  await t('refused: a re-save that keeps the old savedAt', () => S(T, 'sb-test0song1').update({ title: 'Test y' }), false);
  await t('refused: a re-save that moves centsOff to 12', () => S(T, 'sb-test0song1').update({ 'audio.centsOff': 12, savedAt: FV.serverTimestamp() }), false);
  await t('refused: the teacher\'s email with email_verified false writes a song', () => S(FAKE, 'sb-fake00001').set(doc()), false);
  await t('refused: the teacher\'s email unverified deletes a song', () => S(FAKE, SEED).delete(), false);
  await t('the teacher deletes a built song', () => S(T, 'sb-test0song2').delete(), true);

  say('== list: the teacher writes it');
  await t('the list with 0 songs', () => L(T).set({ songs: {}, updatedAt: FV.serverTimestamp() }), true);
  await t('the list with 1 song', () => L(T).set({ songs: metaOf(1), updatedAt: FV.serverTimestamp() }), true);
  await t('the list with 200 songs', () => L(T).set({ songs: metaOf(200), updatedAt: FV.serverTimestamp() }), true);
  await t('an update of the list', () => L(T).update({ songs: metaOf(3), updatedAt: FV.serverTimestamp() }), true);
  await t('refused: 201 songs', () => L(T).set({ songs: metaOf(201), updatedAt: FV.serverTimestamp() }), false);
  await t('refused: songs as a list', () => L(T).set({ songs: ['sb-test00000'], updatedAt: FV.serverTimestamp() }), false);
  await t('refused: an extra key', () => L(T).set({ songs: {}, updatedAt: FV.serverTimestamp(), note: 'x' }), false);
  await t('refused: no songs', () => L(T).set({ updatedAt: FV.serverTimestamp() }), false);
  await t('refused: no updatedAt', () => L(T).set({ songs: {} }), false);
  await t('refused: a client time', () => L(T).set({ songs: {}, updatedAt: new Date() }), false);
  await t('refused: the teacher\'s email unverified writes the list', () => L(FAKE).set({ songs: {}, updatedAt: FV.serverTimestamp() }), false);
  await t('refused: another doc in builtSongsMeta', () => T.collection('builtSongsMeta').doc('other').set({ songs: {}, updatedAt: FV.serverTimestamp() }), false);
  await t('the teacher deletes the list', () => L(T).delete(), true);

  say('== drafts: the teacher only');
  await t('the teacher writes a draft of any shape', () => D(T, 'sb-test0draft1').set({ step: 'beat', anything: [1, 2, 3], nested: { a: 'Test' } }), true);
  await t('…and updates it', () => D(T, 'sb-test0draft1').update({ step: 'chart' }), true);
  await t('refused: a draft id without sb-', () => D(T, 'test0draft1').set({ x: 1 }), false);
  await t('refused: a draft id with a capital', () => D(T, 'sb-Test0draft1').set({ x: 1 }), false);
  await t('refused: a draft id of 25 after sb-', () => D(T, 'sb-' + 'a'.repeat(25)).set({ x: 1 }), false);
  await t('refused: the teacher\'s email unverified writes a draft', () => D(FAKE, 'sb-fake0draft').set({ x: 1 }), false);
  await t('refused: the teacher\'s email unverified deletes a draft', () => D(FAKE, 'sb-test0draft1').delete(), false);
  await t('the teacher deletes a draft', () => D(T, 'sb-test0draft1').delete(), true);
  await env.cleanup();
  return { pass, fail, red };
}

/* Each break: [name, old text, new text, …]. The old text must occur exactly once in the rules file.
   No break drops the two hasAll lines, "audio is map", "title is string", "durationSec is number", "centsOff is
   number" or "gainDb is number": each is a mutant the rules cannot tell apart (every field hasAll names is also read
   by name below it, and a missing field, a non-map's keys(), a non-string's trim() and a string compared with a
   number are each an error, which refuses the write either way). The 'no <key>', 'audio without <key>', 'audio as a
   string', 'a title as a list', 'a length as a string', 'centsOff as a string' and 'gainDb as a string / a map /
   null' cases above hold that behaviour. */
const P = '            && request.resource.data.';
const BREAKS = [
  ['every account gets a built song (gate dropped)', `    match /builtSongs/{songId} {\n      allow get: if ${G};`, '    match /builtSongs/{songId} {\n      allow get: if true;'],
  ['a school account lists the built songs (get widened to read)', `    match /builtSongs/{songId} {\n      allow get: if ${G};`, `    match /builtSongs/{songId} {\n      allow read: if ${G};`],
  ['every account lists the built songs', `    match /builtSongs/{songId} {\n      allow get: if ${G};\n      allow read: if isTeacher();`, `    match /builtSongs/{songId} {\n      allow get: if ${G};\n      allow read: if isSignedIn();`],
  ['a student writes a built song', "      allow create, update: if isTeacher()\n            && songId.matches", `      allow create, update: if ${G}\n            && songId.matches`],
  ['anyone deletes a song re-saved as v 2 (review R1-5, P5)', "            && request.resource.data.savedAt == request.time;\n      allow delete: if isTeacher();", "            && request.resource.data.savedAt == request.time;\n      allow delete: if isTeacher() || resource.data.v > 1;"],
  ['a student deletes a built song', "            && request.resource.data.savedAt == request.time;\n      allow delete: if isTeacher();", `            && request.resource.data.savedAt == request.time;\n      allow delete: if ${G};`],
  ['the list readable by every account', `    match /builtSongsMeta/list {\n      allow read: if ${G};`, '    match /builtSongsMeta/list {\n      allow read: if true;'],
  ['a student writes the list', "      allow create, update: if isTeacher()\n            && request.resource.data.keys().hasOnly(['songs', 'updatedAt'])", `      allow create, update: if ${G}\n            && request.resource.data.keys().hasOnly(['songs', 'updatedAt'])`],
  ['a student deletes the list', "            && request.resource.data.updatedAt == request.time;\n      allow delete: if isTeacher();", `            && request.resource.data.updatedAt == request.time;\n      allow delete: if ${G};`],
  ['a student reads a draft', "    match /songDrafts/{draftId} {\n      allow read, delete: if isTeacher();", `    match /songDrafts/{draftId} {\n      allow read, delete: if ${G};`],
  ['a student writes a draft', "      allow create, update: if isTeacher()\n            && draftId.matches", `      allow create, update: if ${G}\n            && draftId.matches`],
  ['the song id needs no sb-', "songId.matches('^sb-[a-z0-9]{8,24}$')", "songId.matches('^[a-z0-9-]{8,27}$')"],
  ['the song id takes capitals', "songId.matches('^sb-[a-z0-9]{8,24}$')", "songId.matches('^sb-[a-zA-Z0-9]{8,24}$')"],
  ['the song id takes 7', "songId.matches('^sb-[a-z0-9]{8,24}$')", "songId.matches('^sb-[a-z0-9]{7,24}$')"],
  ['the song id takes 25', "songId.matches('^sb-[a-z0-9]{8,24}$')", "songId.matches('^sb-[a-z0-9]{8,25}$')"],
  ['the song id check dropped', "\n            && songId.matches('^sb-[a-z0-9]{8,24}$')", ''],
  ['the draft id check dropped', "\n            && draftId.matches('^sb-[a-z0-9]{8,24}$')", ''],
  ['the draft id takes capitals', "draftId.matches('^sb-[a-z0-9]{8,24}$')", "draftId.matches('^sb-[a-zA-Z0-9]{8,24}$')"],
  ['hasOnly dropped on the song', `${P}keys().hasOnly(['v', 'title', 'artist', 'audio', 'song', 'savedAt'])\n`, ''],
  ['v not an int', `${P}v is int\n`, ''],
  ['v from 0', `${P}v >= 1\n`, ''],
  ['v past 99', `${P}v <= 99\n`, ''],
  ['an empty title', `${P}title.trim().size() >= 1\n`, ''],
  ['a title of spaces (trim dropped)', 'request.resource.data.title.trim().size() >= 1', 'request.resource.data.title.size() >= 1'],
  ['the title cap dropped', `${P}title.size() <= 120\n`, ''],
  ['the title cap 121', 'request.resource.data.title.size() <= 120', 'request.resource.data.title.size() <= 121'],
  ['the artist not a string', `${P}artist is string\n`, ''],
  ['the artist cap dropped', `${P}artist.size() <= 120\n`, ''],
  ['hasOnly dropped on audio', `${P}audio.keys().hasOnly(['id', 'bytes', 'sha256', 'durationSec', 'centsOff', 'gainDb', 'sourceSha256'])\n`, ''],
  ['audio takes a url', "audio.keys().hasOnly(['id', 'bytes', 'sha256', 'durationSec', 'centsOff', 'gainDb', 'sourceSha256'])", "audio.keys().hasOnly(['id', 'bytes', 'sha256', 'durationSec', 'centsOff', 'gainDb', 'sourceSha256', 'url'])"],
  ['the audio id check dropped', `${P}audio.id.matches('^[a-z0-9][a-z0-9-]{0,79}$')\n`, ''],
  ['the audio id loosened', "audio.id.matches('^[a-z0-9][a-z0-9-]{0,79}$')", "audio.id.matches('^.{1,200}$')"],
  ['the audio id takes a slash (review R1-5, P6)', "audio.id.matches('^[a-z0-9][a-z0-9-]{0,79}$')", "audio.id.matches('^[a-z0-9][a-z0-9/-]{0,79}$')"],
  ['bytes not an int', `${P}audio.bytes is int\n`, ''],
  ['bytes from 0', `${P}audio.bytes > 0\n`, ''],
  ['the size cap dropped', `${P}audio.bytes <= 36000000\n`, ''],
  ['the size cap raised by 1', 'request.resource.data.audio.bytes <= 36000000', 'request.resource.data.audio.bytes <= 36000001'],
  ['the SHA-256 check dropped', `${P}audio.sha256.matches('^[0-9a-f]{64}$')\n`, ''],
  ['the SHA-256 takes capitals', "audio.sha256.matches('^[0-9a-f]{64}$')", "audio.sha256.matches('^[0-9a-fA-F]{64}$')"],
  ['the SHA-256 takes 63', "audio.sha256.matches('^[0-9a-f]{64}$')", "audio.sha256.matches('^[0-9a-f]{63,64}$')"],
  ['a length of 0', `${P}audio.durationSec > 0\n`, ''],
  ['the length cap dropped', `${P}audio.durationSec <= 1800\n`, ''],
  ['centsOff not a number and unbounded', `${P}audio.centsOff is number\n${P}audio.centsOff >= -10\n${P}audio.centsOff <= 10\n`, ''],
  ['centsOff below -10', `${P}audio.centsOff >= -10\n`, ''],
  ['centsOff above 10', `${P}audio.centsOff <= 10\n`, ''],
  ['centsOff to 10.5', 'request.resource.data.audio.centsOff <= 10\n', 'request.resource.data.audio.centsOff <= 10.5\n'],
  ['centsOff from -10.5', 'request.resource.data.audio.centsOff >= -10\n', 'request.resource.data.audio.centsOff >= -10.5\n'],
  ['gainDb unchecked', "            && (!('gainDb' in request.resource.data.audio)\n                || (request.resource.data.audio.gainDb is number\n                    && request.resource.data.audio.gainDb >= -40\n                    && request.resource.data.audio.gainDb <= 40))\n", ''],
  ['gainDb below -40', 'request.resource.data.audio.gainDb >= -40', 'request.resource.data.audio.gainDb >= -400'],
  ['gainDb above 40', 'request.resource.data.audio.gainDb <= 40)', 'request.resource.data.audio.gainDb <= 400)'],
  ['gainDb required (a tightening must show too)', "(!('gainDb' in request.resource.data.audio)\n                || (", "(false\n                || ("],
  ['sourceSha256 unchecked', "            && (!('sourceSha256' in request.resource.data.audio)\n                || request.resource.data.audio.sourceSha256.matches('^[0-9a-f]{64}$'))\n", ''],
  ['sourceSha256 takes capitals', "audio.sourceSha256.matches('^[0-9a-f]{64}$')", "audio.sourceSha256.matches('^[0-9a-fA-F]{64}$')"],
  ['sourceSha256 required (a tightening must show too)', "(!('sourceSha256' in request.resource.data.audio)\n                || request", "(false\n                || request"],
  ['song not a map', `${P}song is map\n`, ''],
  ['a client time on a song', "\n            && request.resource.data.savedAt == request.time;", ';'],
  ['hasOnly dropped on the list', "\n            && request.resource.data.keys().hasOnly(['songs', 'updatedAt'])", ''],
  ['songs not a map', `${P}songs is map\n`, ''],
  ['the list cap dropped', `${P}songs.size() <= 200\n`, ''],
  ['the list cap 201', 'request.resource.data.songs.size() <= 200', 'request.resource.data.songs.size() <= 201'],
  ['a client time on the list', "\n            && request.resource.data.updatedAt == request.time;", ';'],
  ['the teacher may not write a song (a tightening must show too)', "      allow create, update: if isTeacher()\n            && songId.matches", "      allow create, update: if false\n            && songId.matches"],
  ['the teacher may not list the songs (a tightening must show too)', `      allow get: if ${G};\n      allow read: if isTeacher();`, `      allow get: if ${G};\n      allow read: if false;`],
  ['the teacher may not write the list (a tightening must show too)', "      allow create, update: if isTeacher()\n            && request.resource.data.keys().hasOnly(['songs', 'updatedAt'])", "      allow create, update: if false\n            && request.resource.data.keys().hasOnly(['songs', 'updatedAt'])"],
  ['the teacher may not read a draft (a tightening must show too)', "    match /songDrafts/{draftId} {\n      allow read, delete: if isTeacher();", "    match /songDrafts/{draftId} {\n      allow delete: if isTeacher();"],
  ['the teacher may not delete a song (a tightening must show too)', "            && request.resource.data.savedAt == request.time;\n      allow delete: if isTeacher();", "            && request.resource.data.savedAt == request.time;\n      allow delete: if false;"],
];

console.log(`== built-songs-rules-test: ${which} (student gate ${G}) on the emulator at 127.0.0.1:${PORT}`);
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
