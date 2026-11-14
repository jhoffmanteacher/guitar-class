/* ── Song files: Manage → "Song files" (2026-11-14) ─────────────────────
   Song recordings behind the sign-in (Jonathan, 2026-11-13; plan "Claude
   outputs/PLAN-private-song-audio-2026-11-13.md"). The site plays a private
   song from the free database, in pieces (app/songfiles.js: the store's
   format, the site's list SONG_FILES, the monthly limit). This section of
   Manage is the ONLY writer of that store.

   WHAT IT SHOWS
     - This month's song downloads (songFilesUsage/<songFileMonth()>) against
       SONG_FILES_MONTH_LIMIT, in GiB and %, and "Reset this month's count"
       (a confirm, then { bytes: 0 }).
     - One row per song: every SONG_FILES entry (the site's list) and every
       songFiles doc in the store, merged by id: id, file name, size, length,
       state, and a status (TEACHER_SF_STATUS below).
     - Upload (an .mp3 from the teacher's Mac), Verify / Verify all, Delete.

   UPLOAD. The browser reads the file, works out its SHA-256 (crypto.subtle)
   and its length (an Audio element's metadata; a file whose length cannot be
   read is refused), and looks for the SONG_FILES entry with that SHA-256 AND
   that size: the store only ever holds what the list names, and the list is
   what the site checks every download against. No match → refused, nothing
   written. Over 36,000,000 bytes (the rules' cap) → refused before it is even
   read. A match is written in this order:
     1. songFiles/{id}  { file, bytes, sha256, pieces, pieceBytes,
        durationSec, state:'uploading', uploadedAt }  (the site refuses a
        song in this state);
     2. songFiles/{id}/pieces/{i} = { i, data } for i = 0 … pieces-1, in
        order, SONG_FILE_PIECE bytes each (the last one shorter), with
        "Uploading… 3 of 16";
     3. pieces pieces … TEACHER_SF_MAX_PIECES-1 deleted (one batch): what an
        earlier, longer upload of the same id left (deleting a piece that is
        not there is no error, so nothing is read for it);
     4. the head again with state 'ready'.
   `file` is the LIST's file name (the match is by content, so a renamed
   copy on the Mac still uploads under the list's name). durationSec is the
   length this browser read, to the hundredth of a second. One upload at a
   time. Leaving Manage stops it before its next write: the head stays
   'uploading' and the section says the song is not ready.

   VERIFY reads a song back the way a Chromebook does: the head must match
   the list (state, size, SHA-256, piece count), then the read is counted
   against the month with songFileCount(db, songFileCost(bytes)) (when that
   would pass the limit, it says so and reads nothing), then
   songFileReadPieces checks every piece and the SHA-256.

   DELETE removes one song: after the teacher types its id (prompt), one batch
   deletes pieces 0 … TEACHER_SF_MAX_PIECES-1 (every piece id the rules allow)
   and the head. Nothing else.

   WRITES go only to songFiles/{id}, songFiles/{id}/pieces/{i} and
   songFilesUsage/{month}: never progress/{uid}, never config/class.
   tools/song-files-console-sim.mjs (checks.mjs 1dy) runs this file against a
   stub Firestore and checks each write against the rules' shape.

   SAFETY. Every value read from the store (an id, a file name, a size…) is
   escaped where it is drawn; buttons carry the id in data-* and one
   delegated listener on the section acts on them (nothing in an inline
   handler). A read that started before a newer read, or before one of this
   section's writes ended, never paints (teacherSfReadGen / teacherSfOpGen),
   and nothing paints once the teacher has left Manage.

   The console is not translated: English only, like the rest of it. */
const TEACHER_SF_MAX_BYTES = 36000000;      // firestore.rules: bytes <= 36000000 (40 pieces' worth)
const TEACHER_SF_MAX_PIECES = 40;           // firestore.rules: a piece id is 0 … 39
const TEACHER_SF_MAX_SEC = 1800;            // firestore.rules: durationSec <= 1800
const TEACHER_SF_ID_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;   // firestore.rules: the doc id
const TEACHER_SF_SHA_RE = /^[0-9a-f]{64}$/;
const TEACHER_SF_STATUS = {
  match: 'on the list, uploaded, matches',
  notUp: 'on the list, not uploaded',
  stray: 'in the store, not on the list',
  differs: 'uploaded, but its size or SHA-256 is not the list’s',
  unfinished: 'upload not finished (uploading)',
};
let teacherSfHeads = null;      // Map id -> head fields from the store; null = not read yet
let teacherSfUsed = null;       // this month's count in bytes; null = not read
let teacherSfReadErr = '';      // '' | a sentence
let teacherSfReadAt = 0;
let teacherSfReadGen = 0;       // a newer read drops an older one
let teacherSfOpGen = 0;         // bumped as each write starts and ends: a read that overlapped one is read again
let teacherSfBusy = '';         // '' | 'upload' | 'verify' | 'delete' | 'reset': one at a time
let teacherSfProgress = '';     // the busy line ("Uploading… 3 of 16")
let teacherSfNote = '';         // one line after an action (plain text)
let teacherSfOpen = false;      // the list and the upload are shown (any action opens them)
const teacherSfChecks = new Map();   // id -> { ok, text }: the last Verify

function teacherSfEntry(id){
  return (typeof SONG_FILES !== 'undefined' && Object.prototype.hasOwnProperty.call(SONG_FILES, id)) ? SONG_FILES[id] : null;
}
function teacherSfPiecesOf(bytes){ return Math.ceil(bytes / SONG_FILE_PIECE); }
/* The stored head matches the list's entry the way the site checks it (app/songfiles.js sfLoadOnce). */
function teacherSfHeadMatches(h, entry){
  return !!(h && entry && h.state === 'ready' && h.bytes === entry.bytes && h.sha256 === entry.sha256 && h.pieces === teacherSfPiecesOf(entry.bytes));
}
function teacherSfStatus(id){
  const entry = teacherSfEntry(id), h = teacherSfHeads ? teacherSfHeads.get(id) : null;
  if(!h) return 'notUp';
  if(!entry) return 'stray';
  if(h.state !== 'ready') return 'unfinished';
  return teacherSfHeadMatches(h, entry) ? 'match' : 'differs';
}
function teacherSfMb(n){ n = Number(n); return Number.isFinite(n) && n >= 0 ? (n / 1e6).toFixed(1) + ' MB' : '—'; }
function teacherSfLen(s){
  s = Number(s);
  if(!Number.isFinite(s) || s <= 0) return '—';
  const r = Math.round(s);
  return Math.floor(r / 60) + ':' + String(r % 60).padStart(2, '0');
}
function teacherSfGiB(n){ return (n / (1024 * 1024 * 1024)).toFixed(1) + ' GiB'; }
function teacherSfUsageLine(){
  const lim = teacherSfGiB(SONG_FILES_MONTH_LIMIT);
  if(teacherSfUsed == null) return `Song downloads this month (${songFileMonth()}): not read yet. Limit ${lim}.`;
  const pct = Math.round(teacherSfUsed / SONG_FILES_MONTH_LIMIT * 1000) / 10;
  return `Song downloads this month (${songFileMonth()}): ${teacherSfGiB(teacherSfUsed)} of ${lim} (${pct}%).`;
}
/* Every id: the list's, then any the store has that the list does not. */
function teacherSfIds(){
  const ids = Object.keys(typeof SONG_FILES !== 'undefined' ? SONG_FILES : {});
  if(teacherSfHeads) for(const id of teacherSfHeads.keys()) if(!ids.includes(id)) ids.push(id);
  return ids.sort();
}
function teacherSfRowHtml(id){
  const entry = teacherSfEntry(id), h = teacherSfHeads ? teacherSfHeads.get(id) : null;
  const st = teacherSfStatus(id);
  const src = h || entry || {};
  const chk = teacherSfChecks.get(id);
  const off = teacherSfBusy ? ' disabled' : '';
  const btn = (act, label) => `<button type="button" class="tg-seg-btn" data-tsf-act="${act}" data-tsf-id="${escAttr(id)}"${off}>${label}</button>`;
  return `<tr>`
    + `<td>${escHtml(id)}</td>`
    + `<td>${escHtml(String(src.file == null ? '—' : src.file))}</td>`
    + `<td style="white-space:nowrap">${escHtml(teacherSfMb(src.bytes))}</td>`
    + `<td>${escHtml(teacherSfLen(src.durationSec))}</td>`
    + `<td>${h ? escHtml(String(h.state == null ? '—' : h.state)) : '—'}</td>`
    + `<td>${escHtml(TEACHER_SF_STATUS[st])}${chk ? `<div class="tg-note">${chk.ok ? '✓ ' : '✗ '}${escHtml(chk.text)}</div>` : ''}</td>`
    + `<td style="white-space:nowrap">${entry && h ? btn('verify', 'Verify') : ''}${h ? btn('delete', 'Delete') : ''}</td></tr>`;
}
function teacherSfBlockHtml(){
  const busy = !!teacherSfBusy, off = busy ? ' disabled' : '';
  const ids = teacherSfIds();
  const listN = Object.keys(typeof SONG_FILES !== 'undefined' ? SONG_FILES : {}).length;
  const upN = teacherSfHeads ? teacherSfHeads.size : 0;
  const open = teacherSfOpen || busy;
  let html = `<div class="tg-class">
        <div class="tg-class-lbl">Song files</div>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <span style="font-size:0.8125rem;color:var(--text2)">${escHtml(teacherSfUsageLine())}</span>
          <button type="button" class="tg-seg-btn" data-tsf-act="reset"${off}>Reset this month's count</button>
          <button type="button" class="tg-seg-btn" data-tsf-act="toggle" aria-expanded="${open}"${busy ? ' disabled' : ''}>${open ? 'Hide song files' : `Show song files (${listN} on the list, ${teacherSfHeads ? upN + ' in the store' : 'store not read yet'})`}</button>
        </div>
      </div>`;
  const lines = [teacherSfReadErr, teacherSfProgress, teacherSfNote].filter(Boolean);
  if(lines.length) html += `<div class="tg-note" role="status">${lines.map(l => `<b>${escHtml(l)}</b>`).join('<br>')}</div>`;
  if(!open) return html;
  html += `<div class="tg-note">The site's song recordings, kept in the class database and played only to signed-in accounts. Upload takes an .mp3 from this computer only if it is exactly a file on the site's list (same size and SHA-256). Verify reads a song back the way a Chromebook does and counts against this month's downloads.</div>
      <div class="tg-note"><label>Upload an .mp3: <input type="file" accept=".mp3,audio/mpeg" data-tsf-file${off}></label>
        <button type="button" class="tg-seg-btn" data-tsf-act="verify-all"${off}>Verify all</button>
        <button type="button" class="tg-seg-btn" data-tsf-act="refresh"${off}>Refresh</button></div>`;
  if(!ids.length) return html + '<div class="t-loading">No song files: the site’s list is empty and the store holds none.</div>';
  return html + `<div class="tg-grid-wrap"><table class="tg-table"><thead><tr><th>Id</th><th>File</th><th>Size</th><th>Length</th><th>State</th><th>Status</th><th></th></tr></thead>`
    + `<tbody>${ids.map(teacherSfRowHtml).join('')}</tbody></table></div>`;
}
function teacherSfPaint(){
  if(teacherView !== 'manage') return;
  const el = document.getElementById('t-songfiles-block');
  if(!el) return;
  el.innerHTML = teacherSfBlockHtml();
  if(!el.dataset.bound){
    el.dataset.bound = '1';
    el.addEventListener('click', teacherSfClick);
    el.addEventListener('change', teacherSfChange);
  }
}
/* Called by renderTeacherManage after it draws: paints from memory, and reads again when that is over 15 s old. */
function teacherSongFilesMount(){
  if(!document.getElementById('t-songfiles-block')) return;
  teacherSfPaint();
  if(!teacherSfBusy && Date.now() - teacherSfReadAt > 15000) teacherSfLoad();
}
async function teacherSfLoad(){
  const gen = ++teacherSfReadGen, op = teacherSfOpGen;
  let heads, used, err = '';
  try{
    await ensureDb();
    const [snap, u] = await Promise.all([
      db.collection('songFiles').get(),
      db.collection('songFilesUsage').doc(songFileMonth()).get(),
    ]);
    heads = new Map();
    snap.docs.forEach(d => { const v = d.data(); heads.set(String(d.id), v && typeof v === 'object' ? v : {}); });
    used = u.exists ? (Number((u.data() || {}).bytes) || 0) : 0;
  }catch(e){
    err = e && e.code === 'permission-denied'
      ? 'Song files are not switched on yet: their rules are not published (firestore.rules, "SONG FILES").'
      : 'Could not read the song files. Check your connection and press Refresh.';
  }
  if(gen !== teacherSfReadGen) return;                        // a newer read owns the section
  if(teacherSfBusy) return;                                   // the write's end reads again
  if(op !== teacherSfOpGen){ teacherSfLoad(); return; }       // overlapped a write: read again
  teacherSfReadAt = Date.now();
  teacherSfReadErr = err;
  if(!err){ teacherSfHeads = heads; teacherSfUsed = used; }
  teacherSfPaint();
}
function teacherSfClick(e){
  if(teacherView !== 'manage') return;
  const b = e.target && e.target.closest ? e.target.closest('[data-tsf-act]') : null;
  if(!b || b.disabled) return;
  const act = b.dataset.tsfAct, id = b.dataset.tsfId;
  if(act === 'toggle'){ teacherSfOpen = !teacherSfOpen; teacherSfPaint(); return; }
  if(teacherSfBusy) return;
  if(act === 'refresh'){ teacherSfNote = ''; teacherSfLoad(); return; }
  if(act === 'reset'){ teacherSfReset(); return; }
  if(act === 'verify-all'){ teacherSfVerifyAll(); return; }
  if(act === 'verify'){ teacherSfVerify(String(id || '')); return; }
  if(act === 'delete'){ teacherSfDelete(String(id || '')); }
}
function teacherSfChange(e){
  const inp = e.target && e.target.closest ? e.target.closest('[data-tsf-file]') : null;
  if(!inp || teacherView !== 'manage') return;
  const f = inp.files && inp.files[0];
  if(f) teacherSfUpload(f);
}
function teacherSfStart(kind){ teacherSfBusy = kind; teacherSfOpen = true; teacherSfOpGen++; teacherSfNote = ''; teacherSfProgress = ''; teacherSfPaint(); }
function teacherSfEnd(note){
  teacherSfBusy = ''; teacherSfOpGen++; teacherSfProgress = ''; teacherSfNote = note;
  teacherSfPaint();
  if(teacherView === 'manage') teacherSfLoad();
}
function teacherSfWhy(e){
  if(e && e.code === 'permission-denied') return 'the rules refused it (are the song file rules published?)';
  return 'a connection problem (' + String((e && (e.code || e.message)) || e) + ')';
}

/* ── Upload ── */
/* The file's length in seconds from its metadata, or null when the browser cannot read it (15 s at most). */
function teacherSfDuration(file){
  return new Promise(resolve => {
    let url = null, a = null, done = false, timer = 0;
    const end = v => {
      if(done) return;
      done = true; clearTimeout(timer);
      try{ if(a){ a.removeAttribute('src'); a.load(); } }catch(e){}
      try{ if(url) URL.revokeObjectURL(url); }catch(e){}
      resolve(v);
    };
    try{ url = URL.createObjectURL(file); a = new Audio(); }catch(e){ end(null); return; }
    a.preload = 'metadata';
    a.addEventListener('loadedmetadata', () => end(Number.isFinite(a.duration) && a.duration > 0 ? a.duration : null));
    a.addEventListener('error', () => end(null));
    timer = setTimeout(() => end(null), 15000);
    a.src = url;
  });
}
/* The list's entry with this SHA-256 and size: its id, or null. */
function teacherSfMatch(sha, bytes){
  const list = typeof SONG_FILES !== 'undefined' ? SONG_FILES : {};
  return Object.keys(list).find(id => list[id] && list[id].sha256 === sha && list[id].bytes === bytes) || null;
}
/* The head as the rules require it (firestore.rules "SONG FILES"), or a sentence saying what is wrong. */
function teacherSfHead(id, entry, durationSec, state){
  const h = { file: String(entry.file || ''), bytes: entry.bytes, sha256: entry.sha256, pieces: teacherSfPiecesOf(entry.bytes),
    pieceBytes: SONG_FILE_PIECE, durationSec, state, uploadedAt: firebase.firestore.FieldValue.serverTimestamp() };
  if(!TEACHER_SF_ID_RE.test(id)) return 'its id on the list is not one the database takes (lower-case letters, digits and dashes, up to 80)';
  if(!h.file || h.file.length > 200) return 'its file name on the list is empty or longer than 200 letters';
  if(!Number.isInteger(h.bytes) || h.bytes <= 0 || h.bytes > TEACHER_SF_MAX_BYTES) return 'its size is over 36,000,000 bytes';
  if(!TEACHER_SF_SHA_RE.test(String(h.sha256))) return 'its SHA-256 on the list is not 64 lower-case hex letters';
  if(!(durationSec > 0 && durationSec <= TEACHER_SF_MAX_SEC)) return 'it is longer than 30 minutes';
  return h;
}
async function teacherSfUpload(file){
  if(teacherSfBusy || !file) return;
  const size = Number(file.size);
  if(!(size > 0)){ teacherSfNote = 'That file is empty. Nothing was uploaded.'; teacherSfPaint(); return; }
  if(size > TEACHER_SF_MAX_BYTES){ teacherSfNote = `That file is ${size.toLocaleString('en-US')} bytes; the most a song file may be is 36,000,000. Nothing was uploaded.`; teacherSfPaint(); return; }
  teacherSfStart('upload');
  teacherSfProgress = 'Reading the file…'; teacherSfPaint();
  let id = null, n = 0, k = -1, wrote = false;
  const stopped = () => teacherView !== 'manage';
  try{
    const buf = new Uint8Array(await file.arrayBuffer());
    const sha = sfHex(await crypto.subtle.digest('SHA-256', buf));
    id = teacherSfMatch(sha, buf.length);
    if(!id){
      teacherSfEnd(`This file is not on the site's list of song files (SHA-256 ${sha.slice(0, 12)}…, ${buf.length.toLocaleString('en-US')} bytes). Claude adds a song to the list first.`);
      return;
    }
    const entry = teacherSfEntry(id);
    const dur = await teacherSfDuration(file);
    if(dur == null){ teacherSfEnd(`This browser could not read the length of that file, so it was not uploaded. Is it a whole .mp3?`); return; }
    const durationSec = Math.round(dur * 100) / 100;
    const head = teacherSfHead(id, entry, durationSec, 'uploading');
    if(typeof head === 'string'){ teacherSfEnd(`${id} was not uploaded: ${head}.`); return; }
    if(stopped()) throw 'stop';
    n = head.pieces;
    await ensureDb();
    const ref = db.collection('songFiles').doc(id);
    wrote = true;
    await ref.set(head);
    for(k = 0; k < n; k++){
      if(stopped()) throw 'stop';
      teacherSfProgress = `Uploading ${id}… ${k + 1} of ${n}`; teacherSfPaint();
      const slice = buf.subarray(k * SONG_FILE_PIECE, Math.min(buf.length, (k + 1) * SONG_FILE_PIECE));
      await ref.collection('pieces').doc(String(k)).set({ i: k, data: firebase.firestore.Blob.fromUint8Array(slice) });
    }
    k = n;
    if(stopped()) throw 'stop';
    if(n < TEACHER_SF_MAX_PIECES){
      teacherSfProgress = `Uploading ${id}… removing pieces left by an earlier upload`; teacherSfPaint();
      const batch = db.batch();
      for(let j = n; j < TEACHER_SF_MAX_PIECES; j++) batch.delete(ref.collection('pieces').doc(String(j)));
      await batch.commit();
    }
    if(stopped()) throw 'stop';
    await ref.set(teacherSfHead(id, entry, durationSec, 'ready'));
    teacherSfChecks.delete(id);
    teacherSfEnd(`${id} uploaded: ${n} piece${n === 1 ? '' : 's'}, ${teacherSfMb(entry.bytes)}, ${teacherSfLen(durationSec)}. Press Verify to read it back.`);
  }catch(e){
    if(e === 'stop' && !wrote){ teacherSfEnd('Stopped: you left Manage before the upload started. Nothing was written.'); return; }
    if(e === 'stop'){
      teacherSfEnd(`Stopped: you left Manage during the upload. ${id} is NOT ready (it stays "uploading", which the site refuses to play). Upload it again.`);
      return;
    }
    teacherSfEnd(id
      ? `The upload of ${id} failed${k >= 0 && k < n ? ` at piece ${k + 1} of ${n}` : ''}: ${teacherSfWhy(e)}. It is NOT ready; the site will not play it. Upload it again.`
      : `Could not read that file: ${String((e && e.message) || e)}. Nothing was uploaded.`);
  }
}

/* ── Verify ── */
/* Reads one song back like a Chromebook. Resolves { ok, text, limit }. */
async function teacherSfVerifyOne(id){
  const entry = teacherSfEntry(id);
  if(!entry) return { ok: false, text: 'not on the site’s list: there is nothing to check it against' };
  await ensureDb();
  const hs = await db.collection('songFiles').doc(id).get();
  const h = hs.exists ? (hs.data() || {}) : null;
  if(!h) return { ok: false, text: 'not uploaded' };
  if(h.state !== 'ready') return { ok: false, text: 'the upload did not finish (state "uploading"); upload it again' };
  if(!teacherSfHeadMatches(h, entry)) return { ok: false, text: 'the stored file is not the one on the list (size, SHA-256 or piece count); upload it again' };
  try{ await songFileCount(db, songFileCost(entry.bytes)); }
  catch(e){
    if(e && e.code === 'limit') return { ok: false, limit: true, text: `not read: reading it (${teacherSfMb(songFileCost(entry.bytes))}) would pass this month's limit of ${teacherSfGiB(SONG_FILES_MONTH_LIMIT)}. Reset the count, or wait for next month` };
    throw e;
  }
  try{
    await songFileReadPieces(db, id, entry, f => { teacherSfProgress = `Verifying ${id}… ${Math.floor(f * 100)}%`; teacherSfPaint(); });
  }catch(e){
    if(e && (e.code === 'missing' || e.code === 'bad')) return { ok: false, text: String(e.message || e.code) };
    throw e;
  }
  return { ok: true, text: `read back whole: ${teacherSfPiecesOf(entry.bytes)} pieces and the SHA-256 match the list` };
}
async function teacherSfVerifyIds(ids){
  if(teacherSfBusy) return;
  teacherSfStart('verify');
  let good = 0, done = 0, note = '';
  for(const id of ids){
    if(teacherView !== 'manage'){ note = 'Stopped: you left Manage.'; break; }
    teacherSfProgress = `Verifying ${id}…`; teacherSfPaint();
    let r;
    try{ r = await teacherSfVerifyOne(id); }
    catch(e){ r = { ok: false, text: 'could not read it: ' + teacherSfWhy(e) }; }
    teacherSfChecks.set(id, r);
    done++; if(r.ok) good++;
    if(r.limit){ note = 'Stopped: this month’s song-download limit.'; break; }
  }
  teacherSfEnd(`Verified ${good} of ${done} song file${done === 1 ? '' : 's'}${note ? '. ' + note : '.'}`);
}
function teacherSfVerify(id){ return teacherSfVerifyIds([id]); }
function teacherSfVerifyAll(){
  const ids = teacherSfIds().filter(id => teacherSfEntry(id) && teacherSfHeads && teacherSfHeads.has(id));
  if(!ids.length){ teacherSfNote = 'Nothing to verify: no song on the list is in the store.'; teacherSfPaint(); return; }
  return teacherSfVerifyIds(ids);
}

/* ── Delete one song ── */
async function teacherSfDelete(id){
  if(teacherSfBusy || !id) return;
  const typed = prompt(`Delete the song file "${id}" from the database? Its pieces and its entry go; the site cannot play it until it is uploaded again. Type its id to delete it:`, '');
  if(typed === null) return;
  if(String(typed).trim() !== id){ teacherSfNote = `Nothing was deleted: what you typed is not "${id}".`; teacherSfPaint(); return; }
  teacherSfStart('delete');
  teacherSfProgress = `Deleting ${id}…`; teacherSfPaint();
  try{
    await ensureDb();
    const ref = db.collection('songFiles').doc(id);
    const batch = db.batch();
    for(let j = 0; j < TEACHER_SF_MAX_PIECES; j++) batch.delete(ref.collection('pieces').doc(String(j)));
    batch.delete(ref);
    await batch.commit();
    teacherSfChecks.delete(id);
    if(teacherSfHeads) teacherSfHeads.delete(id);
    teacherSfEnd(`${id} deleted.`);
  }catch(e){
    teacherSfEnd(`Nothing was deleted: ${teacherSfWhy(e)}.`);
  }
}

/* ── Reset this month's count ── */
async function teacherSfReset(){
  if(teacherSfBusy) return;
  const month = songFileMonth();
  if(!confirm(`Set this month's count of song downloads (${month}) back to 0? Chromebooks that were refused a song can then download it again.`)) return;
  teacherSfStart('reset');
  try{
    await ensureDb();
    await db.collection('songFilesUsage').doc(month).set({ bytes: 0 });
    teacherSfUsed = 0;
    teacherSfEnd(`This month's count is back to 0.`);
  }catch(e){
    teacherSfEnd(`The count was not reset: ${teacherSfWhy(e)}.`);
  }
}
