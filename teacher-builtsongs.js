/* ── Built songs: Manage → "Built songs" (2026-11-14, Song builder Part a2) ──────────────────────────────
   A Play Along song that lives in the class database instead of the code (app/builtsongs.js has the format,
   the validator and how every page merges them; firestore.rules "BUILT SONGS" the shape). Until the Song
   builder screens exist (Parts b to d), a song comes in here: Claude prepares two files with
   `tools/new-playalong.mjs` (the song file .json and its levelled .mp3) and Jonathan imports them.

   WHAT IT SHOWS: one row per song on builtSongsMeta/list: its title, artist, length, edit number and the
   validator's verdict TODAY (builtSongCheck, the same function every student page runs: "passes", or the first
   reason it is refused and how many more), and Import.

   IMPORT. Jonathan picks the song file (.json: { id, v, title, artist, audio, song }) and its .mp3. Checked
   first, before anything is written (a refused file writes nothing and says why in one line):
     - the .json reads as one object with exactly those six fields, at most 1 MB;
     - builtSongCheck(id, doc) passes; its audio id is not on SONG_FILES (the tracked list wins); no other built
       song uses that audio id with other bytes; the list has room (at most 200 songs, the rules' cap);
     - the .mp3's size and SHA-256 are the file's `audio` entry, and its length (as this browser reads it) is
       within 0.5 s of audio.durationSec.
   Then, in this order:
     1. the audio goes into songFiles/{audio.id} through the Song files writer (teacherSfPutFile in
        teacher-songfiles.js: head 'uploading', the pieces, stale pieces removed, head 'ready'), skipped when the
        store already holds that file, ready and matching;
     2. builtSongs/{id} = { v, title, artist, audio, song, savedAt: the server's time };
     3. builtSongsMeta/list: in a transaction, songs[id] goes up by one (its EDIT number: what tells every page
        to fetch the song again), every other entry kept as it was, updatedAt the server's time.
   Importing the same id again replaces that song. One import at a time (and never during a Song files action).
   Leaving Manage stops it before its next write; a stop or a failure after step 1 leaves the audio stored and
   the song not (or not yet) on the list, and says so.
   Students see it on their next sign-in or tab return (app/start.js); this console's own Songs view at once
   (builtSongsSync()).

   NOT HERE (later parts): Publish / Edit / Unpublish / Delete of a song (Part d); Hidden in the Songs view
   (config/class.hiddenActivities, the existing writer) is the off switch until then. A built song is never
   moved to Class activities (teacher-songs.js shows no such button for an 'sb-' id).

   WRITES go only to songFiles/{id} and its pieces (through teacher-songfiles.js), builtSongs/{id} and
   builtSongsMeta/list: never progress/{uid}, never config/class. tools/song-files-console-sim.mjs runs this
   file against a stub Firestore that checks every write against the rules' shape.

   SAFETY. Every value read from a file or the store (a title, an artist, an id, a reason) is escaped where it is
   drawn; buttons carry nothing but data-* and one delegated listener acts on them. A read that started before a
   newer read, or before this section's write ended, never paints (teacherBsReadGen / teacherBsOpGen), and
   nothing paints once the teacher has left Manage. English only, like the rest of the console. */
const TEACHER_BS_MAX_JSON = 1000000;
let teacherBsSongs = null;     // Map id -> { ver, doc } read from the store (doc null: the list names it, the doc is missing); null = not read
let teacherBsReadErr = '';
let teacherBsReadAt = 0;
let teacherBsReadGen = 0;
let teacherBsOpGen = 0;
let teacherBsBusy = '';        // '' | 'import'
let teacherBsProgress = '';
let teacherBsNote = '';
const teacherBsPicked = { json: null, mp3: null };

/* The built song whose audio is `audioId`, for the Song files rows: { title, entry } or null. */
function teacherBsAudioOwner(audioId){
  if(!teacherBsSongs) return null;
  for(const [, s] of teacherBsSongs){
    const a = s.doc && s.doc.audio;
    if(a && a.id === audioId && typeof a.bytes === 'number' && typeof a.sha256 === 'string')
      return { title: String(s.doc.title || ''), entry: { file: audioId + '.mp3', bytes: a.bytes, sha256: a.sha256, durationSec: a.durationSec } };
  }
  return null;
}
/* Every song on the list whose audio is `audioId`, read fresh from the store (Song files' Delete asks this). */
async function teacherBsAudioUsers(audioId){
  await ensureDb();
  const meta = await db.collection('builtSongsMeta').doc('list').get();
  const ids = Object.keys(bsListOf(meta.exists ? meta.data() : null));
  const out = [];
  for(const id of ids){
    const snap = await db.collection('builtSongs').doc(id).get();
    const d = snap.exists ? snap.data() || {} : null;
    if(d && d.audio && d.audio.id === audioId) out.push({ id, title: String(d.title || id) });
  }
  return out;
}
function teacherBsVerdict(id, s){
  if(!s.doc) return { ok: false, text: 'the list names it, but its song is not in the database' };
  const why = builtSongCheck(id, s.doc);
  const a = s.doc.audio || {};
  if(!why.length && typeof SONG_FILES !== 'undefined' && Object.prototype.hasOwnProperty.call(SONG_FILES, a.id)) why.push(`its audio id ${a.id} is on the site's list of song files (the list wins)`);
  if(!why.length && teacherBsSongs) for(const [oid, o] of teacherBsSongs){
    if(oid < id && o.doc && o.doc.audio && o.doc.audio.id === a.id && o.doc.audio.sha256 !== a.sha256){ why.push(`its audio id ${a.id} is ${oid}'s, with other bytes`); break; }
  }
  return why.length ? { ok: false, text: why[0] + (why.length > 1 ? ` (and ${why.length - 1} more)` : '') } : { ok: true, text: 'passes today’s checks' };
}
function teacherBsRowHtml(id){
  const s = teacherBsSongs.get(id), d = s.doc || {}, v = teacherBsVerdict(id, s);
  return `<tr><td>${escHtml(String(d.title == null ? '—' : d.title))}</td><td>${escHtml(String(d.artist || ''))}</td>`
    + `<td>${escHtml(teacherSfLen(d.audio && d.audio.durationSec))}</td><td>${escHtml(String(s.ver))}</td><td>${escHtml(id)}</td>`
    + `<td>${v.ok ? '✓ ' : '✗ '}${escHtml(v.text)}</td></tr>`;
}
function teacherBsBlockHtml(){
  const busy = !!teacherBsBusy, off = busy ? ' disabled' : '';
  const ids = teacherBsSongs ? [...teacherBsSongs.keys()].sort() : [];
  let html = `<div class="tg-class"><div class="tg-class-lbl">Built songs</div>
      <span style="font-size:0.8125rem;color:var(--text2)">${teacherBsSongs ? `${ids.length} on the Songs page list` : 'Not read yet.'}</span>
      <button type="button" class="tg-seg-btn" data-tbs-act="refresh"${off}>Refresh</button></div>`;
  const lines = [teacherBsReadErr, teacherBsProgress, teacherBsNote].filter(Boolean);
  if(lines.length) html += `<div class="tg-note" role="status">${lines.map(l => `<b>${escHtml(l)}</b>`).join('<br>')}</div>`;
  html += `<div class="tg-note">Play Along songs kept in the class database: every student sees them under Songs → More Play Along songs, with no code push. Import takes a song file (.json) and its .mp3 that Claude prepared; importing the same song again replaces it. Hidden in the Songs view takes one off the list.</div>
      <div class="tg-note"><label>Song file (.json): <input type="file" accept=".json,application/json" data-tbs-file="json"${off}></label>
        <label>Its .mp3: <input type="file" accept=".mp3,audio/mpeg" data-tbs-file="mp3"${off}></label>
        <button type="button" class="tg-seg-btn" data-tbs-act="import"${busy || !teacherBsPicked.json || !teacherBsPicked.mp3 ? ' disabled' : ''}>Import</button></div>`;
  if(!teacherBsSongs) return html;
  if(!ids.length) return html + '<div class="t-loading">No built songs yet.</div>';
  return html + `<div class="tg-grid-wrap"><table class="tg-table"><thead><tr><th>Title</th><th>Artist</th><th>Length</th><th>Edit</th><th>Id</th><th>Check</th></tr></thead>`
    + `<tbody>${ids.map(teacherBsRowHtml).join('')}</tbody></table></div>`;
}
function teacherBsPaint(){
  if(teacherView !== 'manage') return;
  const el = document.getElementById('t-builtsongs-block');
  if(!el) return;
  /* A repaint draws the two file pickers empty, so the files picked before it are let go too: Import never takes
     files the screen no longer shows (during an import its files are already read). */
  if(!teacherBsBusy) teacherBsPicked.json = teacherBsPicked.mp3 = null;
  el.innerHTML = teacherBsBlockHtml();
  if(!el.dataset.bound){
    el.dataset.bound = '1';
    el.addEventListener('click', teacherBsClick);
    el.addEventListener('change', teacherBsChange);
  }
}
/* Called by renderTeacherManage after it draws: paints from memory, and reads again when that is over 15 s old. */
function teacherBuiltSongsMount(){
  if(!document.getElementById('t-builtsongs-block')) return;
  teacherBsPaint();
  if(!teacherBsBusy && Date.now() - teacherBsReadAt > 15000) teacherBsLoad();
}
/* The app's merge finished (app/builtsongs.js bsRepaint): the Song files rows name a built song's audio. */
function teacherBsOnMerged(){ if(teacherView === 'manage' && typeof teacherSfPaint === 'function') teacherSfPaint(); }
async function teacherBsLoad(){
  const gen = ++teacherBsReadGen, op = teacherBsOpGen;
  let songs = null, err = '';
  try{
    await ensureDb();
    const meta = await db.collection('builtSongsMeta').doc('list').get();
    const list = bsListOf(meta.exists ? meta.data() : null);
    songs = new Map();
    await Promise.all(Object.keys(list).map(async id => {
      const snap = await db.collection('builtSongs').doc(id).get();
      const d = snap.exists ? Object.assign({}, snap.data()) : null;
      if(d) delete d.savedAt;
      songs.set(id, { ver: list[id], doc: d });
    }));
  }catch(e){
    err = e && e.code === 'permission-denied'
      ? 'Built songs are not switched on yet: their rules are not published (firestore.rules, "BUILT SONGS").'
      : 'Could not read the built songs. Check your connection and press Refresh.';
  }
  if(gen !== teacherBsReadGen) return;                        // a newer read owns the section
  if(teacherBsBusy) return;                                   // the import's end reads again
  if(op !== teacherBsOpGen){ teacherBsLoad(); return; }       // overlapped a write: read again
  teacherBsReadAt = Date.now();
  teacherBsReadErr = err;
  if(!err) teacherBsSongs = songs;
  teacherBsPaint();
  if(typeof teacherSfPaint === 'function') teacherSfPaint();  // the Song files rows name each built song's audio
}
function teacherBsClick(e){
  if(teacherView !== 'manage') return;
  const b = e.target && e.target.closest ? e.target.closest('[data-tbs-act]') : null;
  if(!b || b.disabled || teacherBsBusy) return;
  const act = b.dataset.tbsAct;
  if(act === 'refresh'){ teacherBsNote = ''; teacherBsLoad(); return; }
  if(act === 'import') teacherBsImport(teacherBsPicked.json, teacherBsPicked.mp3);
}
function teacherBsChange(e){
  const inp = e.target && e.target.closest ? e.target.closest('[data-tbs-file]') : null;
  if(!inp || teacherView !== 'manage') return;
  teacherBsPicked[inp.dataset.tbsFile === 'mp3' ? 'mp3' : 'json'] = (inp.files && inp.files[0]) || null;
  teacherBsNote = '';
  const btn = document.querySelector('#t-builtsongs-block [data-tbs-act="import"]');
  if(btn) btn.disabled = !!teacherBsBusy || !teacherBsPicked.json || !teacherBsPicked.mp3;
}
function teacherBsStart(){ teacherBsBusy = 'import'; teacherBsOpGen++; teacherBsNote = ''; teacherBsProgress = ''; teacherBsPaint(); }
function teacherBsEnd(note){
  teacherBsBusy = ''; teacherBsOpGen++; teacherBsProgress = ''; teacherBsNote = note;
  teacherBsPaint();
  if(teacherView === 'manage'){
    teacherBsLoad();
    if(typeof teacherSfLoad === 'function' && !teacherSfBusy) teacherSfLoad();   // Song files shows the audio it may have stored
  }
}
/* A file refused before anything is written: one line, nothing else. */
function teacherBsRefuse(line){ teacherBsNote = 'Nothing was imported: ' + line; teacherBsPaint(); }

/* ── Import ── */
async function teacherBsImport(jsonFile, mp3File){
  if(teacherBsBusy || !jsonFile || !mp3File) return;
  if(typeof teacherSfBusy !== 'undefined' && teacherSfBusy){ teacherBsRefuse('a Song files action is still running. Try again when it ends.'); return; }
  if(!(jsonFile.size > 0) || jsonFile.size > TEACHER_BS_MAX_JSON){ teacherBsRefuse('the song file is empty or over 1 MB.'); return; }
  let f;
  try{ f = JSON.parse(await jsonFile.text()); }catch(e){ teacherBsRefuse('the song file is not JSON (' + String((e && e.message) || e).slice(0, 80) + ').'); return; }
  if(!f || typeof f !== 'object' || Array.isArray(f)){ teacherBsRefuse('the song file is not one JSON object.'); return; }
  const extra = Object.keys(f).filter(k => !['id', 'v', 'title', 'artist', 'audio', 'song'].includes(k));
  if(extra.length){ teacherBsRefuse(`the song file has field(s) a song does not take: ${extra.slice(0, 4).join(', ')}.`); return; }
  const id = f.id, doc = { v: f.v, title: f.title, artist: f.artist, audio: f.audio, song: f.song };
  const why = builtSongCheck(id, doc);
  if(why.length){ teacherBsRefuse(why[0] + (why.length > 1 ? ` (and ${why.length - 1} more)` : '') + '.'); return; }
  const a = doc.audio;
  if(typeof SONG_FILES !== 'undefined' && Object.prototype.hasOwnProperty.call(SONG_FILES, a.id)){ teacherBsRefuse(`its audio id ${a.id} is on the site's list of song files.`); return; }
  if(teacherBsSongs) for(const [oid, o] of teacherBsSongs){
    if(oid !== id && o.doc && o.doc.audio && o.doc.audio.id === a.id && o.doc.audio.sha256 !== a.sha256){ teacherBsRefuse(`its audio id ${a.id} is already ${oid}'s, with other bytes.`); return; }
  }
  if(teacherBsSongs && !teacherBsSongs.has(id) && teacherBsSongs.size >= BS_MAX_SONGS){ teacherBsRefuse(`the list already holds ${BS_MAX_SONGS} songs, the most it can.`); return; }
  if(mp3File.size !== a.bytes){ teacherBsRefuse(`the .mp3 is ${Number(mp3File.size).toLocaleString('en-US')} bytes; the song file says ${a.bytes.toLocaleString('en-US')}. Is it the .mp3 that came with it?`); return; }
  teacherBsStart();
  teacherBsProgress = 'Reading the .mp3…'; teacherBsPaint();
  const stopped = () => teacherView !== 'manage';
  const w = { stopped, wrote: false, k: -1, n: 0, progress: line => { teacherBsProgress = line; teacherBsPaint(); } };
  let step = 'audio';
  try{
    const buf = new Uint8Array(await mp3File.arrayBuffer());
    const sha = sfHex(await crypto.subtle.digest('SHA-256', buf));
    if(sha !== a.sha256){ teacherBsEnd(`Nothing was imported: the .mp3's SHA-256 (${sha.slice(0, 12)}…) is not the song file's. Is it the .mp3 that came with it?`); return; }
    const dur = await teacherSfDuration(mp3File);
    if(dur == null || Math.abs(dur - a.durationSec) > 0.5){ teacherBsEnd(`Nothing was imported: this browser reads the .mp3 as ${dur == null ? 'no length at all' : teacherSfLen(dur)}, the song file says ${teacherSfLen(a.durationSec)}.`); return; }
    const entry = { file: a.id + '.mp3', bytes: a.bytes, sha256: a.sha256 };
    await ensureDb();
    if(stopped()) throw 'stop';
    const hs = await db.collection('songFiles').doc(a.id).get();
    const h = hs.exists ? hs.data() || {} : null;
    if(!teacherSfHeadMatches(h, entry)) await teacherSfPutFile(a.id, entry, buf, Math.round(a.durationSec * 100) / 100, w);
    if(stopped()) throw 'stop';
    step = 'song';
    teacherBsProgress = `Saving ${doc.title}…`; teacherBsPaint();
    await db.collection('builtSongs').doc(id).set({ v: doc.v, title: doc.title, artist: doc.artist, audio: a, song: doc.song, savedAt: firebase.firestore.FieldValue.serverTimestamp() });
    if(stopped()) throw 'stop';
    step = 'list';
    const ref = db.collection('builtSongsMeta').doc('list');
    let ver = 0;
    await db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      const songs = bsListOf(snap.exists ? snap.data() : null);
      ver = (songs[id] || 0) + 1;
      songs[id] = ver;
      tx.set(ref, { songs, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    });
    teacherBsPicked.json = teacherBsPicked.mp3 = null;
    teacherBsEnd(`Imported "${doc.title}" (edit ${ver}). Students see it under Songs → More Play Along songs on their next sign-in or when they come back to the tab.`);
    if(typeof builtSongsSync === 'function') builtSongsSync();
  }catch(e){
    if(e && e.shape){ teacherBsEnd(`Nothing was imported: ${e.shape}.`); return; }
    const where = step === 'audio'
      ? (w.wrote ? ` The audio is NOT ready (its upload stopped${w.k >= 0 && w.k < w.n ? ` at piece ${w.k + 1} of ${w.n}` : ''}); the song was not added.` : ' Nothing was written.')
      : step === 'song' ? ' The audio is stored; the song was not saved. Import again.'
      : ' The audio and the song are stored, but the Songs page list was not updated, so students do not see it yet. Import again.';
    if(e === 'stop'){ teacherBsEnd('Stopped: you left Manage.' + where); return; }
    teacherBsEnd(`The import failed: ${typeof teacherSfWhy === 'function' ? teacherSfWhy(e) : String((e && (e.code || e.message)) || e)}.${where}`);
  }
}
