/* ══ SONG FILES — song recordings behind the sign-in (2026-11-14) ═══════════
   Jonathan, 2026-11-13: the record-derived song files, and every new song from
   now on, are not in the public audio/ folder. They are in the free Firestore
   database, in pieces, and only a signed-in account (a school account, with
   the school-accounts paste 2) may read them. The backing and jam tracks stay
   public. Plan: "Claude outputs/PLAN-private-song-audio-2026-11-13.md".

   HOW A TRACK SAYS IT IS PRIVATE. A path in SNIPPET_TRACKS (app/snippets.js)
   or a Song Journey page's data-audio* is 'private:<id>' instead of
   'audio/<file>.mp3', and <id> is a key of SONG_FILES below: the file's name,
   its size in bytes, its SHA-256 and its length. The site trusts the store
   only as far as this list: a download whose size or SHA-256 differs is
   thrown away.

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

   THE PLAYERS (app/snippets.js, app/cards.js, tabs/journey.js) call three
   things: snippetSrc() maps a private path through songFileSrc() (the
   device copy's blob: address once it is loaded in this page, else the path
   itself); songFileNeedsLoad(src) says the file is not loaded yet; and
   songFileWaitThen(host, src, restart) shows "Loading the song… 40%" in the
   card, loads it, and presses Play again for the student when it is ready.
   Every stop path (snipStop, pcStop, so stopCardAudio and stopAllDemoAudio)
   calls songFileCancelWait() first, so a song that finishes loading after
   the student moved on never starts by itself. A public path goes through
   none of this: snippetSrc() returns it unchanged.

   A Song Journey page does not load the app parts; in Step 2 the page that
   switches loads this file too (it uses only firebase and the page's own
   loadFirestoreSdk). tools/song-files-sim.mjs runs this file in Node. */

/* SONG_FILES:BEGIN — strict JSON between the markers (tools/song-files.mjs and the Python tools read it).
   { "<id>": { "file": "<name>.mp3", "bytes": N, "sha256": "<64 hex>", "durationSec": S } } */
const SONG_FILES = {};
/* SONG_FILES:END */
const SONG_FILE_PREFIX = 'private:';
const SONG_FILE_PIECE = 900000;                    // bytes per piece (firestore.rules pins pieceBytes == 900000)
const SONG_FILES_MONTH_LIMIT = 6 * 1024 * 1024 * 1024;   // 6 GiB a month of song downloads (Jonathan, 2026-11-13)
const SONG_FILES_PARALLEL = 4;                     // pieces read at once
const SONG_FILES_IDB = 'gc-song-files';

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

/* Who is signed in, and the database. The app: currentUser and ensureDb()
   (app/boot.js). A Song Journey page: Firebase's own user and the page's
   loadFirestoreSdk() (tabs/journey.js). */
function songFileHost(){
  if(typeof ensureDb === 'function'){
    const u = typeof currentUser !== 'undefined' ? currentUser : null;
    return { user: u, db: () => ensureDb() };
  }
  let u = null;
  try { u = (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) ? firebase.auth().currentUser : null; } catch(e) {}
  return { user: u, db: () => (typeof loadFirestoreSdk === 'function' ? loadFirestoreSdk() : Promise.resolve()).then(() => firebase.firestore()) };
}

/* ── The device copy (IndexedDB) ── */
let sfDbOpen = null;
function sfIdb(){
  if(sfDbOpen) return sfDbOpen;
  sfDbOpen = new Promise(resolve => {
    let req;
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
function sfCopyGet(id){ return sfIdbDo('readonly', s => s.get(id)).catch(() => null); }
function sfCopyPut(rec){ return sfIdbDo('readwrite', s => s.put(rec)); }
function sfCopyOk(rec, entry){
  return !!(rec && entry && rec.sha256 === entry.sha256 && rec.bytes === entry.bytes && rec.blob && rec.blob.size === entry.bytes);
}

/* ── This page's loaded files ── */
const sfUrls = new Map();       // id -> blob: address of the checked copy
const sfInflight = new Map();   // id -> { promise, listeners:Set }
let sfPersistAsked = false;

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
async function songFileReadPieces(db, id, expect, onProgress){
  const n = Math.ceil(expect.bytes / SONG_FILE_PIECE);
  const out = new Uint8Array(expect.bytes);
  const ref = db.collection('songFiles').doc(id).collection('pieces');
  let next = 0, got = 0;
  const one = async () => {
    while(next < n){
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
  await ref.set({ bytes: firebase.firestore.FieldValue.increment(cost) }, { merge: true });
  return used;
}
function sfFirestoreCode(e){
  const c = e && e.code;
  if(c === 'permission-denied' || c === 'unauthenticated') return 'denied';
  if(c === 'unavailable') return 'offline';
  if(c === 'missing' || c === 'bad' || c === 'limit' || c === 'offline' || c === 'denied' || c === 'signin') return c;
  return 'failed';
}
/* With one lock per song across this browser's tabs (Web Locks), so two tabs
   asking for the same song download it once: the second finds the first's
   copy when the lock comes free. */
function sfWithLock(id, fn){
  try {
    if(typeof navigator !== 'undefined' && navigator.locks && navigator.locks.request)
      return navigator.locks.request('gc-song-file:' + id, fn);
  } catch(e) {}
  return fn();
}
async function sfLoadOnce(id, entry, progress){
  const fromCopy = async () => {
    const rec = await sfCopyGet(id);
    return sfCopyOk(rec, entry) ? rec.blob : null;
  };
  let blob = await fromCopy();
  if(blob) return blob;
  return sfWithLock(id, async () => {
    const again = await fromCopy();           // another tab finished while this one waited
    if(again) return again;
    if(typeof navigator !== 'undefined' && navigator.onLine === false) throw songFileErr('offline');
    const host = songFileHost();
    const db = await host.db();
    if(!db) throw songFileErr('failed', 'no database');
    const head = await db.collection('songFiles').doc(id).get();
    const h = head.exists ? head.data() || {} : null;
    if(!h || h.state !== 'ready' || h.bytes !== entry.bytes || h.sha256 !== entry.sha256 || h.pieces !== Math.ceil(entry.bytes / SONG_FILE_PIECE))
      throw songFileErr('missing', h ? 'the stored file is not the one on the list' : 'not uploaded');
    await songFileCount(db, songFileCost(entry.bytes));
    const bytes = await songFileReadPieces(db, id, entry, progress);
    const b = new Blob([bytes], { type: 'audio/mpeg' });
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
function songFileLoad(id, onProgress){
  if(!songFileHost().user) return Promise.reject(songFileErr('signin'));
  if(sfUrls.has(id)) return Promise.resolve(sfUrls.get(id));
  const entry = SONG_FILES[id];
  if(!entry) return Promise.reject(songFileErr('missing', 'not on the list'));
  let job = sfInflight.get(id);
  if(!job){
    const listeners = new Set();
    const promise = sfLoadOnce(id, entry, f => listeners.forEach(fn => { try { fn(f); } catch(e) {} }))
      .then(blob => {
        const url = URL.createObjectURL(blob);
        sfUrls.set(id, url);
        return url;
      }, e => { throw songFileErr(sfFirestoreCode(e), e && e.message); })
      .finally(() => sfInflight.delete(id));
    job = { promise, listeners };
    sfInflight.set(id, job);
  }
  if(onProgress) job.listeners.add(onProgress);
  return job.promise;
}

/* ── The line a card shows while it waits, or instead of playing ── */
const SONG_FILE_LINE_KEYS = { loading: 'sf.loading', signin: 'sf.signIn', denied: 'sf.notAllowed', limit: 'sf.limit', offline: 'sf.offline', missing: 'sf.failed', bad: 'sf.failed', failed: 'sf.failed' };
/* Where the line goes: a practice card's own status line (.pc-status); in a
   snippet card or a Song Journey box, a .sf-line made the first time a
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
let sfWait = null;              // { host, token } — the one card waiting for its song
function songFileCancelWait(){
  if(!sfWait) return;
  const w = sfWait;
  sfWait = null;
  songFileShow(w.host, '');
}
/* The card `host` asked for `src` (a private path not loaded yet). Show the
   loading line, load it, and call restart() — the same press again — once it
   is here, if this is still the card waiting and it is still on the page.
   Any stop (songFileCancelWait) or another card's wait cancels the restart. */
function songFileWaitThen(host, src, restart){
  const id = songFileId(src);
  songFileCancelWait();
  const token = {};
  sfWait = { host, token };
  const mine = () => sfWait && sfWait.token === token;
  songFileShow(host, 'loading', 0);
  songFileLoad(id, f => { if(mine()) songFileShow(host, 'loading', f); }).then(() => {
    if(!mine()) return;
    sfWait = null;
    songFileShow(host, '');
    if(host.isConnected) restart();
  }, e => {
    if(!mine()) return;
    sfWait = null;
    songFileShow(host, (e && e.code) || 'failed');
  });
}
