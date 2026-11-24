/* ══ SONG FILES — song recordings behind the sign-in (2026-11-14) ═══════════
   Jonathan, 2026-11-13: the record-derived song files, and every new song from
   now on, are not in the public audio/ folder. They are in the free Firestore
   database, in pieces, and only a signed-in account (a school account, with
   the school-accounts paste 2) may read them. The backing and jam tracks stay
   public. Plan: "Claude outputs/PLAN-private-song-audio-2026-11-13.md".

   HOW A TRACK SAYS IT IS PRIVATE. A path in SNIPPET_TRACKS (app/snippets.js)
   is 'private:<id>' instead of
   'audio/<file>.mp3', and <id> is a key of SONG_FILES below: the file's name,
   its size in bytes, its SHA-256 and its length. The site trusts the store
   only as far as this list, or (since 2026-11-14) as far as a BUILT SONG's
   doc (app/builtsongs.js): a song Jonathan adds in the console names its
   file's size and SHA-256 in its `audio` entry, the doc is teacher-written,
   rules-checked and checked again on every page (builtSongCheck), and the
   merge hands those entries to songFilesSetBuilt(). An id on both is the
   list's (the tracked list wins; the built song is left out). Either way a
   download whose size or SHA-256 differs is thrown away.

   THE STORE (firestore.rules, "SONG FILES"; written only by the console's
   Manage → Song files, teacher-songfiles.js):
     songFiles/{id}             { file, bytes, sha256, pieces, pieceBytes,
                                  durationSec, state:'ready'|'uploading',
                                  uploadedAt }
     songFiles/{id}/pieces/{i}  { i, data }  SONG_FILE_PIECE bytes each, the
                                  last one shorter
     songFilesUsage/{YYYY-MM}   { bytes }   this month's count (below)

   ONE DOWNLOAD PER CHROMEBOOK. A song the device has downloaded is kept in
   IndexedDB (database 'gc-song-files', store 'files', one record per id:
   { id, sha256, bytes, blob, savedAt }). IndexedDB, not the Cache API: sw.js
   deletes caches it does not know when a new version activates, and the
   kill switch (tools/kill-switch) clears every cache; neither touches
   IndexedDB, so a copy survives every cache-version bump. The copy is
   kept after sign-out (Jonathan's default, 2026-11-13: far fewer downloads),
   but playing it still needs someone signed in. A copy whose SHA-256 is not
   the list's (the song was re-exported) is downloaded again and replaced.

   THE MONTHLY LIMIT (Jonathan, 2026-11-13). The free plan allows 10 GiB
   downloaded a month from the database, and the class's saving uses the same
   database, so song downloads stop well before that: SONG_FILES_MONTH_LIMIT,
   6 GiB. How it is counted: before a Chromebook downloads a song it reads
   songFilesUsage/<this month> and, if the month's count plus this song's cost
   is still within the limit, adds the cost first and then downloads. The cost
   is the file's size times 4/3, because the pieces travel as base64 text; a
   download that fails after it was counted stays counted (the count can only
   run high, never low). A song already on the device costs nothing. The
   month is the UTC calendar month (the rules check it with the server's
   clock). The console's Verify counts what it reads too, and shows the
   month's count; its Reset sets it to 0.
   WHEN IT TRIPS: a song that is not on the device yet shows one line, "This
   song can't load until next month…" (sf.limit). Songs already on a device
   still play. Saving, the games, the public tracks, everything else, work as
   before: nothing else reads this counter.

   THE PLAYERS (app/snippets.js, app/cards.js) call three
   things: snippetSrc() maps a private path through songFileSrc() (the
   device copy's blob: address once it is loaded in this page, else the path
   itself); songFileNeedsLoad(src) says the file is not loaded yet; and
   songFileWaitThen(host, src, restart) shows "Loading the song… 40%" in the
   card, loads it, and presses Play again for the student when it is ready.
   Every stop path (snipStop, pcStop, so stopCardAudio and stopAllDemoAudio)
   calls songFileCancelWait() first, so a song that finishes loading after
   the student moved on never starts by itself. A public path goes through
   none of this: snippetSrc() returns it unchanged.

   A CHORD SHEET (2026-11-18, Jonathan: a Lyrics view for private songs) is a file in the same store: a pdf whose
   listed name ends in .pdf (a built song's `song.sheet`, app/builtsongs.js). A lyric-sheet card names it
   'private:<id>' in card.sheet, and app/cards-sheet.js reads it with songFileLoadBytes() (below): the same checks,
   count and device copy as a song, the Blob typed application/pdf.

   NOT ON THE SONG JOURNEY PAGES YET (2026-11-14, after review round 2): their
   player (tabs/journey.js) cannot play a private song; checks.mjs 1dx fails
   any 'private:' in tabs/. That player is its own piece of Step 2, with the
   reviewer's harness (DETAILS.md, "Step 2: the Journey player").
   tools/song-files-sim.mjs runs this file in Node. */

/* SONG_FILES:BEGIN — strict JSON between the markers (tools/song-files.mjs and the Python tools read it).
   { "<id>": { "file": "<name>.mp3", "bytes": N, "sha256": "<64 hex>", "durationSec": S } }
   An entry may also carry "awaitingSwitch": true (2026-11-17): the site still plays that file from audio/, and it
   is listed only so that Manage → Song files can upload and verify it before the switch. No track names it as
   'private:<id>' (checks.mjs 1dz), so nothing here ever loads it; the field changes nothing in this file's code. */
const SONG_FILES = {
  "ariel-camacho-las-mananitas-backing-a-108bpm-440hz-full": {"file":"ariel-camacho-las-mananitas-backing-A-108bpm-440hz-full.mp3","bytes":3859100,"sha256":"341305c6983591f4ea28739884af78cc95bc7383822543e698fcbe3662443ca0","durationSec":179.064},
  "ariel-camacho-las-mananitas-backing-a-90bpm-440hz-full": {"file":"ariel-camacho-las-mananitas-backing-A-90bpm-440hz-full.mp3","bytes":5156972,"sha256":"7c32d86cb6f7ad61bccc2ab804e68453228a0e128422f480700e6a352c69e849","durationSec":214.872},
  "chuy-montana-perdon-mama-backing-e-115bpm-440hz-full": {"file":"chuy-montana-perdon-mama-backing-E-115bpm-440hz-full.mp3","bytes":7236524,"sha256":"b7a139c9b69aff45860a3e2206a555af4a677c0a0100b87be13e2d8f142fd5e2","durationSec":180.912},
  "chuy-montana-perdon-mama-backing-e-96bpm-440hz-full": {"file":"chuy-montana-perdon-mama-backing-E-96bpm-440hz-full.mp3","bytes":8667884,"sha256":"d4164a4e91b5d7d54735e254659f5e4735818ec71559c7d9f186ce74638bd92d","durationSec":216.696},
  "efecto-elegante-vuelve-a-la-vida-backing-bb-120bpm-440hz-full": {"file":"efecto-elegante-vuelve-a-la-vida-backing-Bb-120bpm-440hz-full.mp3","bytes":10552365,"sha256":"449b57aed09dbdd9ddf75ba64660dd074db29456d343c5a955c093a69b4b4547","durationSec":263.808},
  "efecto-elegante-vuelve-a-la-vida-backing-bb-147bpm-440hz-full": {"file":"efecto-elegante-vuelve-a-la-vida-backing-Bb-147bpm-440hz-full.mp3","bytes":8615085,"sha256":"15a64a24e54e2f40308a80bff17b3bd327d3a3eff427982d2a2a5baf320eeb97","durationSec":215.376},
  "junior-h-ella-backing-em-155bpm-440hz-full": {"file":"junior-h-ella-backing-Em-155bpm-440hz-full.mp3","bytes":7454345,"sha256":"946774aad7344c2c68565e5e5a33143c06a6ffe7adc331e83220791fbd771cad","durationSec":310.596},
  "junior-h-ella-backing-em-185bpm-440hz-full": {"file":"junior-h-ella-backing-Em-185bpm-440hz-full.mp3","bytes":6245607,"sha256":"104e9fb071fd17bab8e232a7ab9ff0ef12f87f60467088adbcdcd77ae9700dea","durationSec":260.232},
  "lolo-felix-arsenal-efectivo-backing-a-100bpm-440hz-full": {"file":"lolo-felix-arsenal-efectivo-backing-A-100bpm-440hz-full.mp3","bytes":6188555,"sha256":"65da847206498538205e7997483a3a1e7fd17a584d16156d60be1d9d2ffad503","durationSec":257.855},
  "lolo-felix-arsenal-efectivo-backing-a-119bpm-440hz-full": {"file":"lolo-felix-arsenal-efectivo-backing-A-119bpm-440hz-full.mp3","bytes":5201127,"sha256":"c4d678ff7d507c2ed69636e26ed3de34a633c71f98306ec28bd5923405d7b42e","durationSec":216.712},
  "nirvana-smells-like-teen-spirit-backing-fm-100bpm-440hz-full": {"file":"nirvana-smells-like-teen-spirit-backing-Fm-100bpm-440hz-full.mp3","bytes":7817969,"sha256":"bd68646932ca0921af34b13b3bf782c1e86cd96e669dc5e112a3b49b14c70db9","durationSec":325.747},
  "nirvana-smells-like-teen-spirit-backing-fm-100bpm-440hz-rhythm-down": {"file":"nirvana-smells-like-teen-spirit-backing-Fm-100bpm-440hz-rhythm-down.mp3","bytes":7817969,"sha256":"6655e54d9699dd7a416c0b82dfcdfe04e868b076796f6ac370d0476a4a0e9367","durationSec":325.747},
  "nirvana-smells-like-teen-spirit-backing-fm-117bpm-440hz-full": {"file":"nirvana-smells-like-teen-spirit-backing-Fm-117bpm-440hz-full.mp3","bytes":6681956,"sha256":"1a81b2bc11163cbfdf9fe40cc7c14ca6adfd0466fbe774775e52f141c10f00fa","durationSec":278.413},
  "nirvana-smells-like-teen-spirit-backing-fm-117bpm-440hz-rhythm-down": {"file":"nirvana-smells-like-teen-spirit-backing-Fm-117bpm-440hz-rhythm-down.mp3","bytes":6681956,"sha256":"f1264128882b2c82d31e357c2ad08d860ccde46f1419c00b8993501bc97154b8","durationSec":278.413},
  "queen-dont-stop-me-now-full": {"file":"queen-dont-stop-me-now-full.mp3","bytes":6967436,"sha256":"09b3b2cbceab09d5d4a16e51a19f682d53a25c6bf3cbd2a2407b2f737ab3fb85","durationSec":214.632},
  "vicente-fernandez-madrecita-querida-backing-f-65bpm-440hz-full": {"file":"vicente-fernandez-madrecita-querida-backing-F-65bpm-440hz-full.mp3","bytes":6785401,"sha256":"294aa950f798fdabee9a11e2bc383aaa819b0c5e0f0071e5a11429515b7ac60d","durationSec":282.723},
  "vicente-fernandez-madrecita-querida-backing-f-78bpm-440hz-full": {"file":"vicente-fernandez-madrecita-querida-backing-F-78bpm-440hz-full.mp3","bytes":5654403,"sha256":"567cbd23b0702e7c6326cb0a3a333c30a7f441b28cae3aad6dd00f93474badd0","durationSec":235.598},
  "vicente-fernandez-madrecita-querida-backing-g-65bpm-440hz-full": {"file":"vicente-fernandez-madrecita-querida-backing-G-65bpm-440hz-full.mp3","bytes":6785401,"sha256":"77101063c2067429bc27428b50ff1ad4e649451b919281d7b66cf2ff4e363baf","durationSec":282.723},
  "vicente-fernandez-madrecita-querida-backing-g-78bpm-440hz-full": {"file":"vicente-fernandez-madrecita-querida-backing-G-78bpm-440hz-full.mp3","bytes":5654403,"sha256":"64a298012bf55aee36fef57cb2e51d2603d34be2aaca59aed31d0bdbcf243999","durationSec":235.598}
};
/* SONG_FILES:END */
const SONG_FILE_PREFIX = 'private:';
const SONG_FILE_PIECE = 900000;                    // bytes per piece (firestore.rules pins pieceBytes == 900000)
const SONG_FILES_MONTH_LIMIT = 6 * 1024 * 1024 * 1024;   // 6 GiB a month of song downloads (Jonathan, 2026-11-13)
const SONG_FILES_PARALLEL = 4;                     // pieces read at once
const SONG_FILES_IDB = 'gc-song-files';
const SONG_FILES_IDB_WAIT_MS = 5000;               // an IndexedDB that never answers: go on without the device copy
const SONG_FILES_LOCK_WAIT_MS = 60000;             // a tab that holds a song's lock this long (hung): go on without it

/* The built songs' audio entries (id -> { file, bytes, sha256, durationSec }),
   filled ONLY by the merge in app/builtsongs.js, replaced as a whole each
   time. An id on SONG_FILES is never taken from here. A built entry whose
   bytes changed under the same id drops this page's loaded copy of it. */
let sfBuilt = {};
function songFilesSetBuilt(map){
  const next = {};
  Object.keys(map || {}).forEach(id => { if(!Object.prototype.hasOwnProperty.call(SONG_FILES, id)) next[id] = map[id]; });
  Object.keys(sfBuilt).forEach(id => {
    const was = sfBuilt[id], now = next[id];
    if(sfUrls.has(id) && (!now || now.sha256 !== was.sha256 || now.bytes !== was.bytes)){
      try { URL.revokeObjectURL(sfUrls.get(id)); } catch(e) {}
      sfUrls.delete(id);
      sfBlobs.delete(id);
    }
  });
  sfBuilt = next;
}
/* The entry a download is checked against: the list's, else a built song's. */
function songFileEntry(id){
  if(Object.prototype.hasOwnProperty.call(SONG_FILES, id)) return SONG_FILES[id];
  return Object.prototype.hasOwnProperty.call(sfBuilt, id) ? sfBuilt[id] : null;
}
/* What a stored file is, from its listed name's extension: a chord sheet is a pdf (2026-11-18, the lyric sheets of
   private songs: app/cards-sheet.js reads its bytes, songFileLoadBytes), every other file a song (mp3). The type
   goes on the Blob, so the device copy keeps it too. */
function songFileType(entry){ return /\.pdf$/i.test((entry && entry.file) || '') ? 'application/pdf' : 'audio/mpeg'; }
function songFileId(src){
  return (typeof src === 'string' && src.indexOf(SONG_FILE_PREFIX) === 0) ? src.slice(SONG_FILE_PREFIX.length) : null;
}
/* What a download is counted as: the base64 text the pieces travel as. */
function songFileCost(bytes){ return Math.ceil(bytes * 4 / 3); }
function songFileMonth(ms){
  const d = new Date(ms == null ? Date.now() : ms);
  return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0');
}
function songFileErr(code, detail){ const e = new Error(code + (detail ? ': ' + detail : '')); e.code = code; return e; }

/* Who is signed in, and the database: currentUser and ensureDb() (app/boot.js). */
function songFileHost(){
  return { user: typeof currentUser !== 'undefined' ? currentUser : null, db: () => ensureDb() };
}

/* ── The device copy (IndexedDB) ── */
let sfDbOpen = null;
function sfIdb(){
  if(sfDbOpen) return sfDbOpen;
  sfDbOpen = new Promise(resolve => {
    let req;
    /* An open that never answers (seen when another tab holds an upgrade, or
       storage is wedged) must not leave "Loading the song… 0%" up for good:
       after SONG_FILES_IDB_WAIT_MS the page goes on with no device copy. */
    setTimeout(() => resolve(null), SONG_FILES_IDB_WAIT_MS);
    try { req = indexedDB.open(SONG_FILES_IDB, 1); } catch(e) { resolve(null); return; }
    req.onupgradeneeded = () => { try { req.result.createObjectStore('files', { keyPath: 'id' }); } catch(e) {} };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);       // private window, blocked storage: no copy, the song still plays this time
    req.onblocked = () => resolve(null);
  });
  return sfDbOpen;
}
function sfIdbDo(mode, fn){
  return sfIdb().then(db => new Promise((resolve, reject) => {
    if(!db){ resolve(null); return; }
    let tx, r;
    try { tx = db.transaction('files', mode); r = fn(tx.objectStore('files')); }
    catch(e){ reject(e); return; }
    tx.oncomplete = () => resolve(r && 'result' in r ? r.result : null);
    tx.onerror = () => reject(tx.error || (r && r.error) || new Error('IndexedDB'));
    tx.onabort = () => reject(tx.error || new Error('IndexedDB abort'));
  }));
}
function sfCopyGet(id){
  return Promise.race([sfIdbDo('readonly', s => s.get(id)).catch(() => null), new Promise(r => setTimeout(() => r(null), SONG_FILES_IDB_WAIT_MS))]);
}
function sfCopyPut(rec){ return sfIdbDo('readwrite', s => s.put(rec)); }
function sfCopyOk(rec, entry){
  return !!(rec && entry && rec.sha256 === entry.sha256 && rec.bytes === entry.bytes && rec.blob && rec.blob.size === entry.bytes);
}

/* ── This page's loaded files ── */
const sfUrls = new Map();       // id -> blob: address of the checked copy
const sfBlobs = new Map();      // id -> that checked copy (a Blob), for songFileLoadBytes; dropped with its address
const sfInflight = new Map();   // id -> { promise, listeners:Set }
let sfPersistAsked = false;
/* ONE COUNT, ONE REFUSAL PER SONG PER PAGE (review A2, 2026-11-14). A song is
   counted against the month at most once in a page session (key: id and
   SHA-256): a retry after a dropped connection downloads again without
   counting again. A stored file found broken after it was counted (a piece
   missing, a wrong length, a wrong SHA-256) is remembered for the page and
   refused at once on the next press, with no read and no count: the student
   sees "not ready", and a reload (after the teacher uploads it again) tries
   afresh. Not counting a retry gives a page nothing it could not already take:
   the rules cannot count reads at all (firestore.rules, SONG FILES: honest
   limits), so the counter only ever measures honest traffic.
   KNOWN (review round 2, m4): so retries after dropped downloads are free, and
   honest traffic on bad Wi-Fi can run over the count: each retry downloads
   again (or part of the song) without adding to the month. */
const sfCounted = new Set();    // id + ':' + sha256 counted in this page
const sfBroken = new Map();     // id + ':' + sha256 -> 'notready'
let sfHashedCopy = new Set();   // id + ':' + sha256 of device copies re-hashed in this page

/* A copy loaded in this page plays only while someone is signed in: after a
   sign-out the same tab asks again, and songFileLoad says "sign in". */
function songFileSrc(src){
  const id = songFileId(src);
  return (id && sfUrls.has(id) && songFileHost().user) ? sfUrls.get(id) : src;
}
function songFileNeedsLoad(src){
  const id = songFileId(src);
  return !!id && !(sfUrls.has(id) && songFileHost().user);
}

function sfHex(buf){
  const b = new Uint8Array(buf); let s = '';
  for(let i = 0; i < b.length; i++) s += (b[i] < 16 ? '0' : '') + b[i].toString(16);
  return s;
}
/* The pieces of a stored file, checked and put back together: each piece's
   index and length must be the ones its place in the file implies, every
   piece must be there, and the whole must have the expected size and
   SHA-256. Read SONG_FILES_PARALLEL at a time, in any order; each lands at
   its own offset. Also used by the console's Verify (teacher-songfiles.js). */
async function songFileReadPieces(db, id, expect, onProgress, stop){
  const n = Math.ceil(expect.bytes / SONG_FILE_PIECE);
  const out = new Uint8Array(expect.bytes);
  const ref = db.collection('songFiles').doc(id).collection('pieces');
  let next = 0, got = 0;
  const one = async () => {
    while(next < n){
      if(stop && stop()) throw songFileErr('cancelled');   // nobody waits for it any more: read no more pieces
      const k = next++;
      const snap = await ref.doc(String(k)).get();
      if(!snap.exists) throw songFileErr('missing', 'piece ' + k + ' of ' + n);
      const d = snap.data() || {};
      const bytes = d.data && typeof d.data.toUint8Array === 'function' ? d.data.toUint8Array() : null;
      const want = k < n - 1 ? SONG_FILE_PIECE : expect.bytes - SONG_FILE_PIECE * (n - 1);
      if(d.i !== k || !bytes || bytes.length !== want) throw songFileErr('bad', 'piece ' + k + ' is not the right size');
      out.set(bytes, k * SONG_FILE_PIECE);
      got += bytes.length;
      if(onProgress) onProgress(got / expect.bytes);
    }
  };
  await Promise.all(Array.from({ length: Math.min(SONG_FILES_PARALLEL, n) }, one));
  const sha = sfHex(await crypto.subtle.digest('SHA-256', out));
  if(sha !== expect.sha256) throw songFileErr('bad', 'the SHA-256 is not the list\'s');
  return out;
}
/* Add a download's cost to this month's count, unless that passes the limit.
   Returns the month's count before it, or throws 'limit'. */
async function songFileCount(db, cost){
  const ref = db.collection('songFilesUsage').doc(songFileMonth());
  const snap = await ref.get();
  const used = snap.exists ? Number((snap.data() || {}).bytes) || 0 : 0;
  if(used + cost > SONG_FILES_MONTH_LIMIT) throw songFileErr('limit');
  /* The read passed, so the account may count; a refused count then means the
     month in the id is not the server's month: this device's date is wrong
     (review m6). The race: two Chromebooks that both read the count before
     either adds can pass the limit by up to (N - 1) x one song's cost (review
     m2); the limit sits 4 GiB under the free plan's 10 for that reason. */
  try { await ref.set({ bytes: firebase.firestore.FieldValue.increment(cost) }, { merge: true }); }
  catch(e){ if(e && e.code === 'permission-denied') throw songFileErr('clock'); throw e; }
  return used;
}
function sfFirestoreCode(e){
  const c = e && e.code;
  if(c === 'permission-denied' || c === 'unauthenticated') return 'denied';
  if(c === 'unavailable') return 'offline';
  if(c === 'missing' || c === 'bad' || c === 'notready') return 'notready';
  if(c === 'limit' || c === 'offline' || c === 'denied' || c === 'signin' || c === 'clock' || c === 'cancelled') return c;
  return 'failed';
}
/* With one lock per song across this browser's tabs (Web Locks), so two tabs
   asking for the same song download it once: the second finds the first's
   copy when the lock comes free. */
function sfWithLock(id, fn){
  try {
    if(typeof navigator !== 'undefined' && navigator.locks && navigator.locks.request){
      /* A tab that hung holding the lock (review m5) must not leave this one on
         "Loading… 0%": after SONG_FILES_LOCK_WAIT_MS it goes on without the lock
         (at worst a second download of the song). KNOWN (review round 2, m5): a
         download slower than 60 s in another tab is treated the same way, so
         this tab downloads and counts it again; and a hung tab costs the
         others 60 s of "Loading… 0%" first. */
      const opts = (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? { signal: AbortSignal.timeout(SONG_FILES_LOCK_WAIT_MS) } : {};
      return navigator.locks.request('gc-song-file:' + id, opts, fn).catch(e => {
        if(e && (e.name === 'AbortError' || e.name === 'TimeoutError')) return fn();
        throw e;
      });
    }
  } catch(e) {}
  return fn();
}
/* wanted(): someone still waits for this song. A load nobody waits for any
   more (the card asked for another tempo or mix, or stopped) ends before it
   counts, and reads no more pieces (review round 2, m6). */
async function sfLoadOnce(id, entry, progress, wanted){
  const gone = () => !!wanted && !wanted();
  const key = id + ':' + entry.sha256;
  /* A device copy is trusted by its label and size, and re-hashed the first
     time a page plays it (review m4: about 20 ms for 15 MB on a Mac, measured
     2026-11-14; a slow Chromebook stays well under a second). A copy that does
     not hash to the list's SHA-256 is downloaded again and replaced. */
  const fromCopy = async () => {
    const rec = await sfCopyGet(id);
    if(!sfCopyOk(rec, entry)) return null;
    if(!sfHashedCopy.has(key)){
      let sha = '';
      try { sha = sfHex(await crypto.subtle.digest('SHA-256', await rec.blob.arrayBuffer())); } catch(e) { return null; }
      if(sha !== entry.sha256) return null;
      sfHashedCopy.add(key);
    }
    return rec.blob;
  };
  let blob = await fromCopy();
  if(blob) return blob;
  /* Checked after the device copy (review round 2, m1): a good copy on the
     device plays even if this page once found the stored file broken. */
  if(sfBroken.has(key)) throw songFileErr('notready', 'broken earlier in this page');
  return sfWithLock(id, async () => {
    const again = await fromCopy();           // another tab finished while this one waited
    if(again) return again;
    if(gone()) throw songFileErr('cancelled');
    if(typeof navigator !== 'undefined' && navigator.onLine === false) throw songFileErr('offline');
    const host = songFileHost();
    const db = await host.db();
    if(!db) throw songFileErr('failed', 'no database');
    const head = await db.collection('songFiles').doc(id).get();
    const h = head.exists ? head.data() || {} : null;
    if(!h || h.state !== 'ready' || h.bytes !== entry.bytes || h.sha256 !== entry.sha256 || h.pieces !== Math.ceil(entry.bytes / SONG_FILE_PIECE))
      throw songFileErr('missing', h ? 'the stored file is not the one on the list' : 'not uploaded');
    if(gone()) throw songFileErr('cancelled');
    if(!sfCounted.has(key)){
      await songFileCount(db, songFileCost(entry.bytes));
      sfCounted.add(key);
    }
    let bytes;
    try { bytes = await songFileReadPieces(db, id, entry, progress, gone); }
    catch(e){
      if(e && (e.code === 'missing' || e.code === 'bad')) sfBroken.set(key, 'notready');
      throw e;
    }
    const b = new Blob([bytes], { type: songFileType(entry) });
    /* A full device (QuotaExceededError) or blocked storage: play it from
       memory this time; the next page load downloads it again. */
    try {
      await sfCopyPut({ id, sha256: entry.sha256, bytes: entry.bytes, blob: b, savedAt: Date.now() });
      if(!sfPersistAsked && typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist){
        sfPersistAsked = true;
        navigator.storage.persist().catch(() => {});
      }
    } catch(e) {}
    return b;
  });
}
/* Load one song for this page: resolves to its blob: address, or rejects
   with an Error whose .code is the line to show: signin, denied, limit,
   offline, missing, bad or failed. One load per song at a time in a page;
   every caller gets the same promise, and each caller's onProgress (0..1)
   is told as pieces arrive. */
/* `waiter` (from songFileWaitThen): a card that may give up. The load goes on
   while any caller still wants it; a plain call (no waiter) always does. The
   returned promise carries release(), which the waiter calls when it gives up. */
function songFileLoad(id, onProgress, waiter){
  if(!songFileHost().user) return Promise.reject(songFileErr('signin'));
  if(sfUrls.has(id)) return Promise.resolve(sfUrls.get(id));
  const entry = songFileEntry(id);
  if(!entry) return Promise.reject(songFileErr('notready', 'not on the list'));
  let job = sfInflight.get(id);
  if(!job){
    const listeners = new Set();
    const j = { listeners, waiters: 0, direct: 0 };
    j.promise = sfLoadOnce(id, entry, f => listeners.forEach(fn => { try { fn(f); } catch(e) {} }), () => j.direct > 0 || j.waiters > 0)
      .then(blob => {
        const url = URL.createObjectURL(blob);
        sfUrls.set(id, url);
        sfBlobs.set(id, blob);
        return url;
      }, e => { throw songFileErr(sfFirestoreCode(e), e && e.message); })
      .finally(() => { if(sfInflight.get(id) === j) sfInflight.delete(id); });
    job = j;
    sfInflight.set(id, job);
  }
  if(onProgress) job.listeners.add(onProgress);
  const p = job.promise.then(u => u);
  if(waiter){
    job.waiters++;
    let held = true;
    p.release = () => { if(held){ held = false; job.waiters--; if(onProgress) job.listeners.delete(onProgress); } };
  } else { job.direct++; p.release = () => {}; }
  return p;
}

/* A file's BYTES for this page (2026-11-18, the lyric sheets of private songs). pdf.js cannot read a blob: address
   here: index.html's CSP has no blob: in connect-src, so it is handed the bytes (getDocument({ data }), as the
   console's pdfs are, teacher-sb-pdf.js). The same load as songFileLoad: the same sign-in rule, the same in-flight
   job (a sheet asked for twice at once downloads once), the same checks, the device copy and the monthly count.
   Each call gives a fresh copy: pdf.js takes over the buffer it is handed. Rejects with songFileLoad's codes. */
async function songFileLoadBytes(id){
  await songFileLoad(id);
  const b = sfBlobs.get(id);
  if(!b) throw songFileErr('failed', 'the loaded copy was let go');
  return new Uint8Array(await b.arrayBuffer());
}

/* ── The line a card shows while it waits, or instead of playing ── */
/* notready (not uploaded, an unfinished upload, a broken stored file, no
   loader on the page) asks for nothing: another press would not help. Only
   failed (a dropped connection, an unknown error) says to press again. */
const SONG_FILE_LINE_KEYS = { loading: 'sf.loading', signin: 'sf.signIn', denied: 'sf.notAllowed', limit: 'sf.limit', offline: 'sf.offline', notready: 'sf.notReady', clock: 'sf.clock', failed: 'sf.failed' };
/* Where the line goes: a practice card's own status line (.pc-status); in a
   snippet card, a .sf-line made the first time a
   private song is pressed (a public card never gets one). */
function songFileLineEl(host, make){
  if(!host) return null;
  const pc = host.querySelector('.pc-status');
  if(pc) return pc;
  let el = host.querySelector('.sf-line');
  if(!el && make){
    el = document.createElement('div');
    el.className = 'sf-line';
    el.setAttribute('role', 'status');
    const after = host.querySelector('.snip-controls');
    if(after && after.parentNode) after.parentNode.insertBefore(el, after.nextSibling);
    else host.appendChild(el);
  }
  return el;
}
function songFileShow(host, code, frac){
  const key = code ? SONG_FILE_LINE_KEYS[code] || 'sf.failed' : '';
  const el = songFileLineEl(host, !!key);
  if(!el) return;
  if(!key){ el.innerHTML = ''; return; }
  const params = code === 'loading' ? { pct: Math.max(0, Math.min(99, Math.floor((frac || 0) * 100))) } : null;
  const span = document.createElement('span');
  span.className = 'sf-msg sf-' + code;
  span.setAttribute('data-i18n', key);
  if(params) span.setAttribute('data-i18n-params', JSON.stringify(params));
  span.textContent = t(key, params || undefined);
  el.innerHTML = '';
  el.appendChild(span);
}
let sfWait = null;              // { host, token, ui, restart, load } — the one card waiting for its song
function songFileCancelWait(){
  if(!sfWait) return;
  const w = sfWait;
  sfWait = null;
  if(w.load && w.load.release) w.load.release();   // nobody else waiting: the load ends before it counts or reads more
  songFileShow(w.host, '');
  if(w.ui && w.ui.done) try { w.ui.done(); } catch(e) {}
}
/* A fold, a step or a card is closing (app/activities-2.js, beside each
   snipStop / pcStop it already makes): cancel a song still loading in it. */
function songFileCancelWaitIn(el){
  if(sfWait && el && typeof el.contains === 'function' && el.contains(sfWait.host)) songFileCancelWait();
}
function songFileWaitingFor(host){ return !!(sfWait && sfWait.host === host); }
/* The card changed its tempo or mix while its song loads (review round 2, m6):
   press it again now, so it waits for the file it wants NOW. The old wait is
   cancelled by that press (a stop), and its load, if nobody else wants it,
   ends before it counts or reads more pieces. */
function songFileRedoWait(host){
  if(!sfWait || sfWait.host !== host) return false;
  const r = sfWait.restart;
  songFileCancelWait();
  r();
  return true;
}
/* The card is still where the student can see it: on the page, laid out, not
   inside a closed <details>, [hidden] or [inert]. A song never starts by
   itself anywhere else (review B1). */
function songFileHostShown(host){
  if(!host || !host.isConnected) return false;
  if(typeof host.closest === 'function' && host.closest('details:not([open]), [hidden], [inert]')) return false;
  if(typeof host.getClientRects === 'function' && !host.getClientRects().length) return false;
  return true;
}
/* The card `host` asked for `src` (a private path not loaded yet). Show the
   loading line, load it, and call restart() — the same press again — once it
   is here, if this is still the card waiting and it is still on the page.
   Any stop (songFileCancelWait) or another card's wait cancels the restart. */
/* `ui` (optional): { wait(), done() } — the player's own button while it
   waits (Stop shows; a press cancels), put back when the wait ends by a
   cancel, a failure or the restart. */
function songFileWaitThen(host, src, restart, ui){
  const id = songFileId(src);
  songFileCancelWait();
  const token = {};
  const w = sfWait = { host, token, ui, restart, load: null };
  const mine = () => sfWait && sfWait.token === token;
  songFileShow(host, 'loading', 0);
  if(ui && ui.wait) try { ui.wait(); } catch(e) {}
  const end = () => { sfWait = null; if(ui && ui.done) try { ui.done(); } catch(e) {} };
  w.load = songFileLoad(id, f => { if(mine()) songFileShow(host, 'loading', f); }, true);
  w.load.then(() => {
    if(!mine()) return;
    end();
    songFileShow(host, '');
    if(songFileHostShown(host)) restart();
  }, e => {
    if(!mine()) return;
    end();
    const code = (e && e.code) || 'failed';
    songFileShow(host, code);
  });
}
