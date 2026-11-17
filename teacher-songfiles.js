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
     - Upload (.mp3 files from the teacher's Mac: picked, or dropped on the drop zone, many at once since W21,
       2026-11-17), Verify / Verify all, Delete.

   MANY FILES (W21). Picked or dropped files go up ONE AT A TIME through the same path as one file
   (teacherSfUploadOne), so each is still taken only if it is exactly a file on the list. One progress line for
   the batch ("3 of 18: <file>"); a refused or failed file never stops the rest; at the end, how many went up
   and every file not uploaded with its reason (not on the list, wrong bytes, a connection problem…). A second
   drop while a batch runs is refused with a line; folders, files that are not .mp3 and an empty drop get one
   plain line each. Leaving Manage stops the batch as it stops one upload. Nothing is verified for the teacher:
   Verify all stays his click. A dropped file's name is untrusted and is escaped wherever it is drawn. While a
   batch runs, a drop that misses the zone is swallowed (a window listener added at the batch's start and
   removed at its end, however it ends), so the dropped file never replaces the console in the tab.

   UPLOAD. The browser reads the file, works out its SHA-256 (crypto.subtle)
   and its length (an Audio element's metadata; a file whose length cannot be
   read is refused), and looks for the SONG_FILES entry with that SHA-256 AND
   that size: Upload only ever writes what the list names, and the list is
   what the site checks every download against (since 2026-11-14 the store
   also holds BUILT songs' audio, written by Manage → Built songs' Import,
   teacher-builtsongs.js, through teacherSfPutFile below, and checked against
   that song's own `audio` entry). No match → refused, nothing
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

   A BUILT SONG'S AUDIO (not on the list) is shown as "Built song: <title>",
   checked against that song's audio entry (Verify works on it too). A Song
   builder draft's levelled copy (teacher-sb-core.js) is shown as "Song builder
   draft: <title>" once the drafts are read (Song files asks for them); Delete
   works on it as on any stray file, and the draft then asks for its mp3 again.

   DELETE removes one song: never the audio a built song on
   builtSongsMeta/list plays (that list and its songs are read fresh first;
   the refusal names the song; a list that cannot be read refuses too). Then,
   after the teacher types its id (prompt), one batch
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
  awaitNotUp: 'on the site as a public file; upload it, then it can be switched',
  awaitMatch: 'uploaded, matches; ready to switch (the site still plays the public file)',
  stray: 'in the store, not on the list',
  differs: 'uploaded, but its size or SHA-256 is not the list’s',
  unfinished: 'upload not finished (uploading)',
  built: 'Built song: ',
  draft: 'Song builder draft: ',
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
let teacherSfOpen = true;       // the list and the upload are shown: open from the start (Jonathan, 2026-11-17: he could not find the upload behind the Show button)
let teacherSfRefused = [];      // after a batch: one plain-text line per file not uploaded ("<name>: <why>")
let teacherSfDragOver = false;  // files are being dragged over the drop zone
const teacherSfChecks = new Map();   // id -> { ok, text }: the last Verify

function teacherSfEntry(id){
  if(typeof SONG_FILES !== 'undefined' && Object.prototype.hasOwnProperty.call(SONG_FILES, id)) return SONG_FILES[id];
  /* A built song's audio (Manage → Built songs, teacher-builtsongs.js): checked against that song's own audio entry,
     never on the list. The list wins an id on both. */
  const own = typeof teacherBsAudioOwner === 'function' ? teacherBsAudioOwner(id) : null;
  return own ? own.entry : null;
}
function teacherSfOnList(id){ return typeof SONG_FILES !== 'undefined' && Object.prototype.hasOwnProperty.call(SONG_FILES, id); }
function teacherSfPiecesOf(bytes){ return Math.ceil(bytes / SONG_FILE_PIECE); }
/* The stored head matches the list's entry the way the site checks it (app/songfiles.js sfLoadOnce). */
function teacherSfHeadMatches(h, entry){
  return !!(h && entry && h.state === 'ready' && h.bytes === entry.bytes && h.sha256 === entry.sha256 && h.pieces === teacherSfPiecesOf(entry.bytes));
}
/* An entry the site still plays from audio/ ("awaitingSwitch": true, app/songfiles.js): uploaded and verified like
   any listed file, only its two plain states read differently. */
function teacherSfAwaiting(id){ return teacherSfOnList(id) && SONG_FILES[id] && SONG_FILES[id].awaitingSwitch === true; }
function teacherSfStatus(id){
  const entry = teacherSfEntry(id), h = teacherSfHeads ? teacherSfHeads.get(id) : null;
  if(!h) return teacherSfAwaiting(id) ? 'awaitNotUp' : 'notUp';
  if(!entry) return typeof teacherSbAudioOwner === 'function' && teacherSbAudioOwner(id) ? 'draft' : 'stray';
  if(h.state !== 'ready') return 'unfinished';
  if(!teacherSfHeadMatches(h, entry)) return 'differs';
  return teacherSfOnList(id) ? (teacherSfAwaiting(id) ? 'awaitMatch' : 'match') : 'built';
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
    + `<td>${escHtml(TEACHER_SF_STATUS[st] + (st === 'built' ? teacherBsAudioOwner(id).title : st === 'draft' ? teacherSbAudioOwner(id).title : ''))}${chk ? `<div class="tg-note">${chk.ok ? '✓ ' : '✗ '}${escHtml(chk.text)}</div>` : ''}</td>`
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
  /* teacherSfNote may hold several lines (a batch's summary, a drop's left-out files): one <b> each. A dropped
     file's name is untrusted: every line and every refused file is escaped here. */
  const lines = [teacherSfReadErr, teacherSfProgress, ...String(teacherSfNote || '').split('\n')].filter(Boolean);
  const refused = teacherSfRefused.length ? `<ul class="tsf-refused">${teacherSfRefused.map(l => `<li>${escHtml(l)}</li>`).join('')}</ul>` : '';
  const status = lines.length || refused ? `<div class="tg-note" role="status">${lines.map(l => `<b>${escHtml(l)}</b>`).join('<br>')}${refused}</div>` : '';
  /* Closed: the lines under the title. Open: right under the drop zone, where the files were dropped. */
  if(!open) return html + status;
  /* Review A1 (2026-11-14): the monthly limit is the site's own count of honest use; the rules cannot count reads,
     so any account the rules let read can download the pieces directly. The school-accounts rules (paste 2) were
     published 2026-11-14, so that is a school account or an outside account Jonathan allowed; the line says so
     (it said "upload real songs only after paste 2" until 2026-11-17). */
  html += `<div class="tg-note">Only school accounts, and the outside accounts you allowed, can read these files. The monthly limit counts only what the site itself downloads.</div>`;
  html += `<div class="tg-note">The site's song recordings, kept in the class database and played only to signed-in accounts. Upload takes an .mp3 from this computer only if it is exactly a file on the site's list (same size and SHA-256). Verify reads a song back the way a Chromebook does and counts against this month's downloads.</div>
      <div class="tsf-drop${teacherSfDragOver ? ' tsf-drop-over' : ''}${busy ? ' tsf-drop-busy' : ''}" data-tsf-drop>
        <div class="tsf-drop-msg">${busy && teacherSfBusy === 'upload' ? 'Uploading: wait for these files to finish before dropping more.' : teacherSfDragOver ? 'Let go to upload these files.' : 'Drop .mp3 files here, as many as you like. They go up one at a time.'}</div>
        <label>Or pick them: <input type="file" accept=".mp3,audio/mpeg" multiple data-tsf-file${off}></label>
      </div>${status}
      <div class="tg-note"><button type="button" class="tg-seg-btn" data-tsf-act="verify-all"${off}>Verify all</button>
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
    /* The drop zone's handlers live on the section's element, like the two above: leaving Manage draws other
       HTML into the box, which drops this element and every listener on it. */
    el.addEventListener('dragenter', teacherSfDragEnter);
    el.addEventListener('dragover', teacherSfDragOverZone);
    el.addEventListener('dragleave', teacherSfDragLeave);
    el.addEventListener('drop', teacherSfDrop);
  }
}
/* Called by renderTeacherManage after it draws: paints from memory, and reads again when that is over 15 s old. */
function teacherSongFilesMount(){
  if(!document.getElementById('t-songfiles-block')) return;
  teacherSfDragOver = false;   // a drag that ended off the page left no dragleave behind
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
  /* A store id no list names may be a Song builder draft's levelled copy: read the drafts once, to name it. */
  if(!err && typeof teacherSbLoad === 'function' && typeof sbDrafts !== 'undefined' && !sbDrafts) teacherSbLoad();
}
function teacherSfClick(e){
  if(teacherView !== 'manage') return;
  const b = e.target && e.target.closest ? e.target.closest('[data-tsf-act]') : null;
  if(!b || b.disabled) return;
  const act = b.dataset.tsfAct, id = b.dataset.tsfId;
  if(act === 'toggle'){ teacherSfOpen = !teacherSfOpen; teacherSfPaint(); return; }
  if(teacherSfBusy) return;
  if(typeof teacherBsBusy !== 'undefined' && teacherBsBusy) return;   // a built-song import is writing (teacher-builtsongs.js)
  if(act === 'refresh'){ teacherSfNote = ''; teacherSfRefused = []; teacherSfLoad(); return; }
  if(act === 'reset'){ teacherSfReset(); return; }
  if(act === 'verify-all'){ teacherSfVerifyAll(); return; }
  if(act === 'verify'){ teacherSfVerify(String(id || '')); return; }
  if(act === 'delete'){ teacherSfDelete(String(id || '')); }
}
function teacherSfChange(e){
  const inp = e.target && e.target.closest ? e.target.closest('[data-tsf-file]') : null;
  if(!inp || teacherView !== 'manage') return;
  teacherSfTakeFiles(Array.from(inp.files || []), 0);
}

/* ── The drop zone (W21, 2026-11-17) ── */
function teacherSfIsFileDrag(e){
  const types = e && e.dataTransfer && e.dataTransfer.types;
  return !!types && Array.from(types).includes('Files');
}
function teacherSfZoneOf(e){ return e && e.target && e.target.closest ? e.target.closest('[data-tsf-drop]') : null; }
/* The drag-over look, on the zone itself (no repaint under the pointer mid-drag) and remembered for the next paint. */
function teacherSfSetOver(on){
  if(teacherSfDragOver === on) return;
  teacherSfDragOver = on;
  const el = document.getElementById('t-songfiles-block');
  const z = el && el.querySelector ? el.querySelector('[data-tsf-drop]') : null;
  if(z && z.classList){
    z.classList.toggle('tsf-drop-over', on);
    const msg = z.querySelector('.tsf-drop-msg');
    if(msg && teacherSfBusy !== 'upload') msg.textContent = on ? 'Let go to upload these files.' : 'Drop .mp3 files here, as many as you like. They go up one at a time.';
  }
}
function teacherSfDragEnter(e){
  if(!teacherSfIsFileDrag(e) || !teacherSfZoneOf(e)) return;
  e.preventDefault();
  teacherSfSetOver(true);
}
function teacherSfDragOverZone(e){
  if(!teacherSfIsFileDrag(e) || !teacherSfZoneOf(e)) return;
  e.preventDefault();
  try{ e.dataTransfer.dropEffect = 'copy'; }catch(err){}
  teacherSfSetOver(true);
}
function teacherSfDragLeave(e){
  const z = teacherSfZoneOf(e);
  if(!z) return;
  if(e.relatedTarget && z.contains && z.contains(e.relatedTarget)) return;   // moved onto a child of the zone
  teacherSfSetOver(false);
}
function teacherSfDrop(e){
  if(!teacherSfIsFileDrag(e) || !teacherSfZoneOf(e)) return;
  e.preventDefault();
  teacherSfSetOver(false);
  if(teacherView !== 'manage') return;
  /* A folder comes in as an item whose entry is a directory: counted and left out (its files are not read). The
     items are read now: the browser empties them once this handler returns. */
  const dt = e.dataTransfer, files = [];
  let folders = 0;
  const items = dt.items ? Array.from(dt.items) : [];
  if(items.length){
    for(const it of items){
      if(it.kind !== 'file') continue;
      const en = typeof it.webkitGetAsEntry === 'function' ? it.webkitGetAsEntry() : null;
      if(en && en.isDirectory){ folders++; continue; }
      const f = it.getAsFile();
      if(f) files.push(f);
    }
  } else files.push(...Array.from(dt.files || []));
  teacherSfTakeFiles(files, folders);
}
/* While a batch runs, a drop that misses the zone must not open the dropped file in this tab (that would leave the
   console mid-batch): the page takes it and does nothing. Added at a batch's start, removed at its end, whichever
   way it ends. */
function teacherSfGuardDrag(e){ if(teacherSfIsFileDrag(e)) e.preventDefault(); }
function teacherSfWindowGuard(on){
  if(typeof window === 'undefined') return;
  const f = on ? 'addEventListener' : 'removeEventListener';
  if(typeof window[f] !== 'function') return;
  window[f]('dragover', teacherSfGuardDrag);
  window[f]('drop', teacherSfGuardDrag);
}
const teacherSfIsMp3 = f => /\.mp3$/i.test(String(f && f.name || '')) || String(f && f.type || '') === 'audio/mpeg';
/* Files picked or dropped: refuses while something else runs, leaves out folders and files that are not .mp3 (a
   plain line each), then one .mp3 goes up as a single upload and two or more as a batch. */
function teacherSfTakeFiles(files, folders){
  if(teacherView !== 'manage') return;
  if(teacherSfBusy){
    teacherSfNote = teacherSfBusy === 'upload'
      ? 'One batch at a time: the files you just dropped were not taken. Drop them again when this batch has finished.'
      : 'Wait for the current action to finish, then drop the files again.';
    teacherSfPaint(); return;
  }
  if(typeof teacherBsBusy !== 'undefined' && teacherBsBusy){ teacherSfNote = 'Wait for the built-song import to finish.'; teacherSfPaint(); return; }
  const mp3 = files.filter(teacherSfIsMp3), other = files.filter(f => !teacherSfIsMp3(f));
  const pre = [];
  if(folders) pre.push(`${folders === 1 ? 'A folder was' : folders + ' folders were'} left out: open the folder and drop the .mp3 files themselves.`);
  if(other.length) pre.push(`${other.length === 1 ? '1 file was' : other.length + ' files were'} left out because ${other.length === 1 ? 'it is' : 'they are'} not .mp3: ${other.slice(0, 5).map(f => String(f.name || '?')).join(', ')}${other.length > 5 ? ` and ${other.length - 5} more` : ''}.`);
  if(!files.length && !folders) pre.push('Nothing to upload: no files came with that drop. Drag .mp3 files from your computer.');
  if(!mp3.length){ teacherSfRefused = []; teacherSfNote = pre.join('\n'); teacherSfPaint(); return; }
  if(mp3.length === 1 && !pre.length){ teacherSfUpload(mp3[0]); return; }
  teacherSfUploadFiles(mp3, pre);
}
function teacherSfStart(kind){ teacherSfBusy = kind; teacherSfOpen = true; teacherSfOpGen++; teacherSfNote = ''; teacherSfRefused = []; teacherSfProgress = ''; teacherSfPaint(); }
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
/* Write one song file into the store, in this order: the head 'uploading'; the pieces, in order, SONG_FILE_PIECE
   bytes each (the last one shorter); the pieces an earlier, longer upload of the same id left, deleted (one batch);
   the head 'ready'. Shared by Upload below (a file on the site's list) and Manage → Built songs' Import (a built
   song's own audio entry, teacher-builtsongs.js). `w` is the caller's: w.stopped() ends it before its next write
   (throws 'stop'); w.progress(text) shows a line; it fills w.wrote (the head was written), w.k and w.n (the piece
   being written, of how many). A head the rules would refuse throws { shape: <sentence> } and writes nothing. */
async function teacherSfPutFile(id, entry, buf, durationSec, w){
  const head = teacherSfHead(id, entry, durationSec, 'uploading');
  if(typeof head === 'string') throw { shape: head };
  if(w.stopped()) throw 'stop';
  const n = w.n = head.pieces;
  await ensureDb();
  const ref = db.collection('songFiles').doc(id);
  w.wrote = true;
  await ref.set(head);
  for(let k = 0; k < n; k++){
    w.k = k;
    if(w.stopped()) throw 'stop';
    w.progress(`Uploading ${id}… ${k + 1} of ${n}`);
    const slice = buf.subarray(k * SONG_FILE_PIECE, Math.min(buf.length, (k + 1) * SONG_FILE_PIECE));
    await ref.collection('pieces').doc(String(k)).set({ i: k, data: firebase.firestore.Blob.fromUint8Array(slice) });
  }
  w.k = n;
  if(w.stopped()) throw 'stop';
  if(n < TEACHER_SF_MAX_PIECES){
    w.progress(`Uploading ${id}… removing pieces left by an earlier upload`);
    const batch = db.batch();
    for(let j = n; j < TEACHER_SF_MAX_PIECES; j++) batch.delete(ref.collection('pieces').doc(String(j)));
    await batch.commit();
  }
  if(w.stopped()) throw 'stop';
  await ref.set(teacherSfHead(id, entry, durationSec, 'ready'));
}
/* A file refused on its size alone, before it is read: { note, why } or null. */
function teacherSfSizeRefusal(file){
  const size = Number(file.size);
  if(!(size > 0)) return { note: 'That file is empty. Nothing was uploaded.', why: 'the file is empty' };
  if(size > TEACHER_SF_MAX_BYTES) return { note: `That file is ${size.toLocaleString('en-US')} bytes; the most a song file may be is 36,000,000. Nothing was uploaded.`, why: `it is ${size.toLocaleString('en-US')} bytes; the most a song file may be is 36,000,000` };
  return null;
}
/* A list entry with this file name or this size (the file's bytes did not match it): its id, or null. */
function teacherSfNear(name, bytes){
  const list = typeof SONG_FILES !== 'undefined' ? SONG_FILES : {};
  const nm = String(name || '').toLowerCase();
  return Object.keys(list).find(id => list[id] && (String(list[id].file || '').toLowerCase() === nm || list[id].bytes === bytes)) || null;
}
/* One file through the upload path: the size, the read, the match on the list, the question before replacing a
   matching song, the length, the writes (teacherSfPutFile). It never starts or ends the section's busy state: its
   caller does (teacherSfUpload for one file, teacherSfUploadFiles for a batch). It never throws. Resolves
   { ok, id, note, why, stop }: `note` is the sentence a single upload ends with, `why` the short reason a batch
   lists, `stop` true when the teacher left Manage (the batch then stops). `seen` (a batch's ids so far, or null)
   refuses a second file of the same song in one batch. */
async function teacherSfUploadOne(file, progress, seen){
  const pre = teacherSfSizeRefusal(file);
  if(pre) return { ok: false, id: null, note: pre.note, why: pre.why };
  progress('Reading the file…');
  let id = null;
  const stopped = () => teacherView !== 'manage';
  const w = { stopped, wrote: false, k: -1, n: 0, progress };
  try{
    const buf = new Uint8Array(await file.arrayBuffer());
    const sha = sfHex(await crypto.subtle.digest('SHA-256', buf));
    id = teacherSfMatch(sha, buf.length);
    if(!id){
      const near = teacherSfNear(file.name, buf.length);
      const said = `SHA-256 ${sha.slice(0, 12)}…, ${buf.length.toLocaleString('en-US')} bytes`;
      return { ok: false, id: null,
        note: `This file is not on the site's list of song files (${said}). Claude adds a song to the list first.`,
        why: near ? `wrong bytes: the list has ${near} under this name or size, but this file is not that file (${said})` : `not on the site's list of song files (${said})` };
    }
    if(seen && seen.has(id)) return { ok: false, id, note: '', why: `the same song as an earlier file in this batch (${id}), which was uploaded once` };
    const entry = teacherSfEntry(id);
    /* Uploading over a song that is already there and matching (review B7): it goes back to "uploading" for the
       minutes the upload takes, and a Chromebook with no copy is refused in that time. Ask first. */
    const was = teacherSfHeads && teacherSfHeads.get(id);
    if(was && was.state === 'ready' && teacherSfHeadMatches(was, entry)
       && !confirm(`${id} is already uploaded and matches the list. Upload it again? While it uploads, Chromebooks that do not have it yet see "not ready".`)){
      return { ok: false, id, note: `Nothing uploaded: ${id} is already there and matches the list.`, why: `${id} is already there and matches the list (you chose not to upload it again)` };
    }
    const dur = await teacherSfDuration(file);
    if(dur == null) return { ok: false, id, note: `This browser could not read the length of that file, so it was not uploaded. Is it a whole .mp3?`, why: 'this browser could not read its length (is it a whole .mp3?)' };
    const durationSec = Math.round(dur * 100) / 100;
    try{ await teacherSfPutFile(id, entry, buf, durationSec, w); }
    catch(e){ if(e && e.shape) return { ok: false, id, note: `${id} was not uploaded: ${e.shape}.`, why: `${id}: ${e.shape}` }; throw e; }
    return { ok: true, id, why: '', note: `${id} uploaded: ${w.n} piece${w.n === 1 ? '' : 's'}, ${teacherSfMb(entry.bytes)}, ${teacherSfLen(durationSec)}. Press Verify to read it back.` };
  }catch(e){
    const { wrote, k, n } = w;
    if(e === 'stop' && !wrote) return { ok: false, stop: true, id, wrote, note: 'Stopped: you left Manage before the upload started. Nothing was written.' };
    if(e === 'stop') return { ok: false, stop: true, id, wrote, note: `Stopped: you left Manage during the upload. ${id} is NOT ready (it stays "uploading", which the site refuses to play). Upload it again.` };
    if(!id) return { ok: false, id, note: `Could not read that file: ${String((e && e.message) || e)}. Nothing was uploaded.`, why: `could not read the file (${String((e && e.message) || e)})` };
    const at = k >= 0 && k < n ? ` at piece ${k + 1} of ${n}` : '';
    return { ok: false, id,
      note: `The upload of ${id} failed${at}: ${teacherSfWhy(e)}. It is NOT ready; the site will not play it. Upload it again.`,
      why: `${id} failed${at}: ${teacherSfWhy(e)}. It is NOT ready; upload it again` };
  }
}
async function teacherSfUpload(file){
  if(teacherSfBusy || !file) return;
  if(typeof teacherBsBusy !== 'undefined' && teacherBsBusy){ teacherSfNote = 'Wait for the built-song import to finish.'; teacherSfPaint(); return; }
  const pre = teacherSfSizeRefusal(file);
  if(pre){ teacherSfNote = pre.note; teacherSfPaint(); return; }
  teacherSfStart('upload');
  const r = await teacherSfUploadOne(file, line => { teacherSfProgress = line; teacherSfPaint(); }, null);
  if(r.ok) teacherSfChecks.delete(r.id);
  teacherSfEnd(r.note);
}
/* Many files (W21, 2026-11-17): one at a time through teacherSfUploadOne, the same path as one file, so each is
   still taken only if it is exactly a file on the list. One progress line ("3 of 18: <file>"); a refused or
   failed file never stops the rest; leaving Manage does (the file being written stays "uploading", as with one
   upload, and the rest are not tried). The end names every file not uploaded and why. Verify all stays the
   teacher's click. `pre`: lines about what the drop left out (folders, files that are not .mp3). */
async function teacherSfUploadFiles(files, pre){
  if(teacherSfBusy || !files.length) return;
  if(typeof teacherBsBusy !== 'undefined' && teacherBsBusy){ teacherSfNote = 'Wait for the built-song import to finish.'; teacherSfPaint(); return; }
  teacherSfStart('upload');
  teacherSfWindowGuard(true);
  const N = files.length, seen = new Set(), refused = [];
  let good = 0, stop = null, stopAt = -1;
  try{
    for(let i = 0; i < N; i++){
      const name = String((files[i] && files[i].name) || 'a file');
      if(teacherView !== 'manage'){ stopAt = i; stop = { wrote: false }; break; }
      const head = `${i + 1} of ${N}: ${name}`;
      teacherSfProgress = head; teacherSfPaint();
      const r = await teacherSfUploadOne(files[i], line => { teacherSfProgress = `${head} (${line})`; teacherSfPaint(); }, seen);
      if(r.stop){ stopAt = i; stop = r; break; }
      if(r.ok){ good++; seen.add(r.id); teacherSfChecks.delete(r.id); }
      else refused.push(`${name}: ${r.why}`);
    }
  }catch(e){
    refused.push(`the batch stopped on an error: ${String((e && e.message) || e)}`);
  }finally{
    teacherSfWindowGuard(false);
  }
  const lines = pre.slice();
  if(stop){
    const left = N - stopAt;
    lines.push(`Stopped: you left Manage at file ${stopAt + 1} of ${N} (${String(files[stopAt].name || 'a file')}). ${good} of ${N} went up before that; ${left === 1 ? 'that file was' : `that file and the ${left - 1} after it were`} not uploaded.`
      + (stop.wrote && stop.id ? ` ${stop.id} is NOT ready (it stays "uploading", which the site refuses to play).` : '') + ' Drop them again.');
  } else {
    lines.push(`Uploaded ${good} of ${N} file${N === 1 ? '' : 's'}.${refused.length ? ` Not uploaded: ${refused.length} (listed below).` : ''}${good ? ' Press Verify all to read them back.' : ''}`);
  }
  teacherSfRefused = refused;   // shown under the note until the next action (teacherSfStart) or Refresh
  teacherSfEnd(lines.join('\n'));
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
/* Another write is running in this section or in Manage → Built songs (an Import uploads into the same store). */
function teacherSfOtherBusy(){ return !!teacherSfBusy || (typeof teacherBsBusy !== 'undefined' && !!teacherBsBusy); }
async function teacherSfDelete(id){
  if(teacherSfOtherBusy() || !id) return;
  /* Never the audio a built song plays (Manage → Built songs): the list of built songs is read fresh, and a file one
     of them uses is refused, naming the song. A list that cannot be read refuses too, except a REFUSED read (the
     BUILT SONGS rules not published yet: no built song can exist), which counts as no built songs. */
  if(typeof teacherBsAudioUsers === 'function'){
    let users;
    try{ users = await teacherBsAudioUsers(id); }
    catch(e){ teacherSfNote = `Nothing was deleted: could not check whether a built song plays ${id} (${teacherSfWhy(e)}).`; teacherSfPaint(); return; }
    if(users.length){ teacherSfNote = `Nothing was deleted: the built song "${users[0].title}"${users.length > 1 ? ` and ${users.length - 1} more` : ''} plays ${id}. Delete or re-import that song first.`; teacherSfPaint(); return; }
    if(teacherSfOtherBusy()) return;   // an Import or another action began during the read (review R1-5)
  }
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
