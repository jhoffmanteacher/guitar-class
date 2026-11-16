/* ── Song builder: the console view (2026-11-15, Song builder Part b) ────────────────────────────────────
   Jonathan builds a Play Along song himself from an mp3, with no code push (Jonathan, 2026-11-14: "go with
   song builder"). The view sits in the sidebar after Songs (TEACHER_NAV, teacher-core.js). Left: the songs
   (search; All / Published / Drafts; "+ New song"). Right: the steps, Upload, Volume, Beat, Chart, Level,
   Preview, Publish. Upload and Volume are here, Beat in teacher-sb-beat.js (the sound measurements in
   teacher-sb-dsp.js), Chart and Level in teacher-sb-chart.js (Part c, 2026-11-16), Preview and Publish, the published
   song's page (Edit, Unpublish, Delete), Export and the health line in teacher-sb-publish.js (Part d, 2026-11-16; work
   order "Claude outputs/WORK-ORDER-song-builder.md"). A draft is seen by no student; Publish puts the song on the
   Songs page (builtSongs/{id} and builtSongsMeta/list, the docs Manage → Built songs' Import writes too).

   A DRAFT is songDrafts/{id} (firestore.rules "BUILT SONGS": teacher only; id 'sb-' + 12 lower-case letters
   and digits, the id the published song will keep). It is saved at every step ("saved just now"):
     { v: 1, title, artist, step,                 step = the furthest step reached (1-7)
       source: { name, bytes, sha256, durationSec, sampleRate, channels, kbps },   the mp3 Jonathan picked
       audio:  { id, bytes, sha256, durationSec, centsOff, gainDb, sourceSha256 } | null   the levelled copy in
               songFiles (the shape builtSongs' `audio` takes, app/builtsongs.js)
       volume: { before, after, samplePeak, truePeak, ceilingDb, encodes } | null   the measurements, LUFS / dBFS
       pitch:  { cents, peaks } | null
       beat:   { meter, bpm, anchor, pins: [{ bar, t }], tapBpm, taps, tapSpreadMs, driftOff } | null
       chart:  { text, meter, fmt, sections, left, kept, edited } | null   (teacher-sb-chart.js; { text } alone = a
               chart given at step 1 and not read yet)
       level:  { versions, start, range } | null
       listens: { sig, heard: [card section indexes] } | null   the Preview step's listens (teacher-sb-publish.js);
               they count only while sig is the song's own (a changed chart, beat, level or copy starts them over)
       pubVer: the song's last edit number on the list, kept by Unpublish so a later Publish counts on | null
       savedAt: the server's time }
   The draft keeps its id when it is published: builtSongs/{id} is the song students get, the draft is what Edit
   changes; students keep the published song until he publishes again.
   UPLOAD: an mp3 only (its frame header is read: a 32, 44.1 or 48 kHz file, the rates LAME encodes at 192k), at
   most 6:00 (SB_MAX_SEC); a title and an artist the validator takes (builtSongCheck: 1-120 / 0-120 characters,
   no " — "). NOTHING goes to the store at this step but the draft itself: the original stays on Jonathan's Mac.
   The chord chart can be given here too (pasted, or a text file), so every file goes in at once (Jonathan,
   2026-11-15: "let me put all the files in the initial upload"); it is kept as chart.text and read at step 4.
   A new file picked later replaces the draft's audio; the beat is kept when the new length is within 0.05 s of
   the old one (the work order), else cleared. Pdfs of the chords and of the tab can be picked here and at step 4
   (teacher-sb-pdf.js, 2026-11-16): they stay in this tab and are never stored.
   VOLUME: teacher-sb-dsp.js sbLevel (one gain to "the cure", a -1 dBFS limiter, 192k constant bitrate in a Worker
   running vendor/lamejs, decoded and measured again). The levelled copy goes to songFiles/{draft id}-{8 hex of its
   SHA-256} through the Song files writer (teacherSfPutFile, teacher-songfiles.js), then the draft is saved, then
   the draft's previous copy, if any, is deleted (never one a built song on builtSongsMeta/list plays). Pitch is
   shown as "N cents above / below A = 440"; over 10 cents the step says the song cannot be published and to send
   the file to Claude (Jonathan, 2026-11-14), and the later steps stay open. No manual volume (one measured gain
   per song, the site's rule).
   A resumed draft: the original is not stored, so levelling again needs the mp3 picked again (its SHA-256 is
   checked: a different file is a replacement). The levelled copy is read back from songFiles for the Beat step,
   counted against the month's song downloads like a Chromebook's read (songFileCount, app/songfiles.js).

   WRITES go only to songDrafts/{id}, songFiles/{id} and its pieces, and songFilesUsage/{month} (reading a copy
   back), and, from Publish, Unpublish and Delete (teacher-sb-publish.js), builtSongs/{id} and builtSongsMeta/list:
   never progress/{uid}, never config/class. tools/song-builder-sim.mjs runs this part against a stub
   Firestore and checks each write. "Delete draft" asks OK / Cancel (Jonathan, 2026-11-15: a draft is cheap to redo,
   so no typed title), then removes the draft and its levelled copy; a published song's "Delete…" takes its typed
   title (teacher-sb-publish.js).

   SAFETY. Every value read from the store or a file (a title, an artist, a file name) is escaped where it is
   drawn; buttons carry data-* only and one delegated listener acts on them. A read that started before a newer
   read, or before a write ended, never paints (sbReadGen / sbOpGen); nothing paints once the teacher has left the
   view, and leaving it (teacherSbLeave, called by setTeacherView) stops every sound, the encoder, and any write
   before its next step. A hidden tab stops the sounds. The console is English only. */
const SB_MAX_SEC = 360;                 // 6:00 (work order, Part b)
const SB_MAX_SRC_BYTES = 60000000;      // an mp3 this big is not a 6-minute song
const SB_STEPS = ['Upload', 'Volume', 'Beat', 'Chart', 'Level', 'Preview', 'Publish'];
const SB_BUILT_STEPS = 7;               // Parts b, c and d: every step
const SB_CURE = 'audio/olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-full.mp3';
let sbDrafts = null;                    // Map id -> draft (as stored, savedAt as ms); null = not read
let sbPublished = null;                 // Map id -> { title, artist, ver, audioId, doc, at } from builtSongsMeta/list and builtSongs
                                        //   (doc: the song as stored, savedAt left out, null when the list names a missing doc; at: savedAt in ms)
let sbReadErr = '', sbReadAt = 0, sbReadGen = 0, sbOpGen = 0;
let sbSel = null;                       // a draft id, 'new', or a published id; null = the start screen
let sbStepOn = 1;                       // the step shown
let sbFilter = 'all', sbQuery = '';
let sbBusy = '';                        // '' | 'level' | 'save' | 'delete' | 'load'
let sbProgress = '', sbNote = '';
let sbViewGen = 0;                      // bumped when the teacher leaves the view: work in flight stops
let sbNew = null;                       // the unsaved new song: { title, artist }
let sbWorker = null;
let sbPlayer = null;                    // { audio, timer, url } — "10 s of yours / of the cure"
/* The selected draft's sound, in this tab only (never stored): the original and the levelled copy. */
const sbMem = { id: null, src: null, level: null, failed: null };
//   failed = the SHA-256 of a levelled copy whose load just failed: the Beat step does not load it again by itself
//            (each try counts a download), only on a click (a step button, "10 s of yours") or a new copy
//   src   = { bytes, sha256, name, info, chans, fs, durationSec }
//   level = { bytes, sha256, chans, fs, mono, durationSec, url, E }   (E: the onset envelope, teacher-sb-beat.js)

function sbIsDraftId(id){ return typeof id === 'string' && /^sb-[a-z0-9]{8,24}$/.test(id); }
function sbNewId(){
  const a = 'abcdefghijklmnopqrstuvwxyz0123456789', r = new Uint8Array(12);
  crypto.getRandomValues(r);
  return 'sb-' + Array.from(r, v => a[v % 36]).join('');
}
function sbStopped(gen){ return gen !== sbViewGen || teacherView !== 'songbuilder'; }
function sbWhen(ms){
  if(!ms) return 'not saved yet';
  const s = Math.round((Date.now() - ms) / 1000);
  if(s < 45) return 'saved just now';
  if(s < 3600) return `saved ${Math.round(s / 60)} min ago`;
  return 'saved ' + new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function sbLen(s){ return typeof teacherSfLen === 'function' ? teacherSfLen(s) : String(Math.round(s)) + ' s'; }
function sbMb(n){ return (Number(n) / 1e6).toFixed(1) + ' MB'; }
/* What the validator says of a title and an artist (app/builtsongs.js builtSongCheck's own rules): '' when fine. */
function sbTitleWhy(title, artist){
  if(!bsText(title, 1, 120)) return 'The title must be 1 to 120 characters of plain text.';
  if(title.indexOf(BS_SEP) >= 0) return 'The title cannot contain " — " (a long dash between spaces): the Songs page cuts names there.';
  if(typeof artist !== 'string' || artist.length > 120 || BS_CTRL_RE.test(artist)) return 'The artist must be 0 to 120 characters of plain text.';
  if(artist.indexOf(BS_SEP) >= 0) return 'The artist cannot contain " — " (a long dash between spaces).';
  return '';
}
function sbStudentsSee(title, artist){
  const t = String(title || '').trim() || 'Title';
  return `"${t}"${String(artist || '').trim() ? ' - ' + String(artist).trim() : ''} — Play Along`;
}
function sbCentsLine(c){
  if(c == null || !Number.isFinite(c)) return 'could not be read';
  const r = Math.round(Math.abs(c) * 10) / 10;
  return r < 0.5 ? 'on A = 440' : `${r} cent${r === 1 ? '' : 's'} ${c > 0 ? 'above' : 'below'} A = 440`;
}
function sbPitchBlocked(d){ return !!(d && d.pitch && Number.isFinite(d.pitch.cents) && Math.abs(d.pitch.cents) > SB_MAX_CENTS); }
function sbDraft(){ return sbIsDraftId(sbSel) && sbDrafts ? sbDrafts.get(sbSel) || null : null; }

/* ── Reading the drafts and the published songs ── */
async function teacherSbLoad(){
  const gen = ++sbReadGen, op = sbOpGen;
  let drafts = null, pub = null, err = '';
  try{
    await ensureDb();
    const snap = await db.collection('songDrafts').get();
    drafts = new Map();
    snap.forEach(doc => {
      const d = Object.assign({}, doc.data() || {});
      d.savedAt = d.savedAt && typeof d.savedAt.toMillis === 'function' ? d.savedAt.toMillis() : 0;
      if(sbIsDraftId(doc.id)) drafts.set(doc.id, d);
    });
    pub = new Map();
    try{
      const meta = await db.collection('builtSongsMeta').doc('list').get();
      const list = bsListOf(meta.exists ? meta.data() : null);
      await Promise.all(Object.keys(list).map(async id => {
        const s = await db.collection('builtSongs').doc(id).get();
        const d = s.exists ? Object.assign({}, s.data() || {}) : null;
        const at = d && d.savedAt && typeof d.savedAt.toMillis === 'function' ? d.savedAt.toMillis() : 0;
        if(d) delete d.savedAt;
        pub.set(id, { title: String((d && d.title) || id), artist: String((d && d.artist) || ''), ver: list[id], audioId: d && d.audio && d.audio.id, doc: d, at });
      }));
    }catch(e){ if(!(e && e.code === 'permission-denied')) throw e; }
  }catch(e){
    err = e && e.code === 'permission-denied'
      ? 'The Song builder is not switched on yet: its rules are not published (firestore.rules, "BUILT SONGS").'
      : 'Could not read the songs. Check your connection and press Refresh.';
  }
  if(gen !== sbReadGen) return;
  if(op !== sbOpGen){ teacherSbLoad(); return; }
  sbReadAt = Date.now(); sbReadErr = err;
  if(!err){ sbDrafts = drafts; sbPublished = pub; }
  teacherSbPaint();
  if(teacherView === 'manage' && typeof teacherSfPaint === 'function') teacherSfPaint();
}
/* For Manage → Song files: the draft whose levelled copy is `audioId`, { title } or null. */
function teacherSbAudioOwner(audioId){
  if(!sbDrafts) return null;
  for(const [, d] of sbDrafts) if(d.audio && d.audio.id === audioId) return { title: String(d.title || '') };
  return null;
}

/* ── Painting ── */
function renderTeacherSongBuilder(){
  const box = document.getElementById('t-grid-container');
  if(!box) return;
  box.innerHTML = `<div class="sb-root" data-sb-root>${sbViewHtml()}</div>`;
  const root = box.querySelector('[data-sb-root]');
  root.addEventListener('click', sbClick);
  root.addEventListener('input', sbInput);
  root.addEventListener('change', sbChange);
  sbBindKeys();
  if(typeof sbPdfMounted === 'function') sbPdfMounted(root);
  const steps = sbShowsSteps();
  if(steps && sbStepOn === 3 && typeof sbBeatMounted === 'function') sbBeatMounted();
  if(steps && sbStepOn === 4 && typeof sbChartMounted === 'function') sbChartMounted();
  /* The Preview step's card is put in after the paint (and kept across repaints while it plays); off it, it goes. */
  if(steps && sbStepOn === 6 && typeof sbPreviewMounted === 'function') sbPreviewMounted(root);
  else if(typeof sbPreviewStop === 'function') sbPreviewStop(true);
  if(!sbBusy && (!sbDrafts || Date.now() - sbReadAt > 15000) && !sbReadErr) teacherSbLoad();
}
function teacherSbPaint(){ if(teacherView === 'songbuilder') renderTeacherSongBuilder(); }
/* With a pdf shown beside the chart (teacher-sb-pdf.js) the song list gives its column to it. */
function sbViewHtml(){
  const pdf = typeof sbPdfPaneOn === 'function' && sbPdfPaneOn();
  return `<div class="ta-split${pdf ? ' sb-pdfopen' : ''}">${sbListHtml()}<section class="ta-detail" data-sb-detail>${sbDetailHtml()}</section>${pdf ? '<aside class="sb-pdfslot" data-sb-pdfslot aria-label="The pdf"></aside>' : ''}</div>`;
}
/* One row per song: a draft (with its published song, p, when it has one) or a published song with no draft (one
   that came in through Manage → Built songs' Import). `pub` says whether students have it. */
function sbRows(){
  const rows = [];
  if(sbDrafts) for(const [id, d] of sbDrafts){ const p = sbPublished ? sbPublished.get(id) || null : null; rows.push({ id, kind: 'draft', pub: !!p, title: String(d.title || ''), artist: String(d.artist || ''), d, p }); }
  if(sbPublished) for(const [id, p] of sbPublished) if(!(sbDrafts && sbDrafts.has(id))) rows.push({ id, kind: 'pub', pub: true, title: p.title, artist: p.artist, p });
  return rows.sort((a, b) => a.title.localeCompare(b.title));
}
/* The steps show for a draft that is not published, for a new song, and for a published song being edited (Edit);
   a published song otherwise shows its own page (teacher-sb-publish.js). */
function sbShowsSteps(){
  if(sbSel === null) return false;
  if(sbSel === 'new') return true;
  const pub = sbPublished && sbPublished.has(sbSel), d = sbDraft();
  return !!d && (!pub || (typeof sbEditing !== 'undefined' && sbEditing.has(sbSel)));
}
function sbListHtml(){
  const all = sbRows(), q = sbQuery.trim().toLowerCase();
  const nPub = all.filter(r => r.pub).length, nDraft = all.length - nPub;
  const rows = all.filter(r => (sbFilter === 'all' || (sbFilter === 'pub') === r.pub) && (!q || (r.title + ' ' + r.artist).toLowerCase().includes(q)));
  const off = sbBusy ? ' disabled' : '';
  const rowHtml = r => {
    let tags = '', sub = '';
    if(r.pub){
      const v = typeof sbPubVerdict === 'function' ? sbPubVerdict(r.id, r.p) : { ok: true };
      const changed = r.kind === 'draft' && typeof sbPubChanged === 'function' && sbPubChanged(r.d, r.p);
      tags = '<span class="ta-tag ta-tag-sched">Published</span>' + (changed ? '<span class="ta-tag ta-tag-warn">Changes not published</span>' : '')
        + (v.ok ? '' : '<span class="ta-tag ta-tag-warn">Fails today\'s checks</span>') + (r.kind === 'pub' ? '<span class="ta-tag ta-tag-off">Imported</span>' : '');
      sub = `On the Songs page · edit ${escHtml(String(r.p.ver))}`;
    }
    else {
      const d = r.d, step = Math.min(SB_BUILT_STEPS, Math.max(1, Number(d.step) || 1));
      tags = '<span class="ta-tag ta-tag-off">Draft</span>'
        + (sbPitchBlocked(d) ? '<span class="ta-tag ta-tag-warn">Pitch: send to Claude</span>' : '')
        + (d && d.beat && sbBeatTooMuch(d.beat.pinsNeeded) ? '<span class="ta-tag ta-tag-warn">Beat: send to Claude</span>' : '')
        + (d.beat && d.beat.driftOff > 0 ? '<span class="ta-tag ta-tag-warn">Check the beat</span>' : '');
      sub = `Step ${step} of 7 · ${SB_STEPS[step - 1]} · ${escHtml(sbWhen(d.savedAt))}`;
    }
    return `<button type="button" class="ta-row${r.id === sbSel ? ' is-sel' : ''}" data-sb-pick="${escAttr(r.id)}"${off}><div class="ta-row-main"><div class="ta-row-top">${tags}</div>`
      + `<div class="ta-row-title">${escHtml(r.title || 'Untitled')}${r.artist ? ` <span class="sb-li-artist">· ${escHtml(r.artist)}</span>` : ''}</div><div class="ta-row-done">${sub}</div></div></button>`;
  };
  const body = !sbDrafts ? `<div class="ta-list-empty">${escHtml(sbReadErr || 'Loading…')}</div>`
    : rows.length ? rows.map(rowHtml).join('')
    : all.length ? '<div class="ta-list-empty">No song matches.</div>'
    : '<div class="ta-list-empty">No songs built yet. Start one with <b>New song</b>: you need the mp3.</div>';
  return `<aside class="ta-list"><div class="ta-list-head"><div class="ta-list-top"><span class="ta-list-title" role="heading" aria-level="3">Song builder</span>`
    + `<button type="button" class="tg-seg-btn ta-board-btn" data-sb-act="new"${off}>+ New song</button></div>`
    + (typeof sbHealthHtml === 'function' ? sbHealthHtml() : '')
    + (all.length ? `<input class="ta-search" data-sb-search placeholder="Search songs" aria-label="Search songs" value="${escAttr(sbQuery)}">`
      + `<div class="ta-filters">${[['all', 'All', all.length], ['pub', 'Published', nPub], ['draft', 'Drafts', nDraft]].map(([k, l, n]) => `<button type="button" class="ta-filter" data-sb-filter="${k}" aria-pressed="${sbFilter === k}">${l} ${n}</button>`).join('')}</div>` : '')
    + `</div><div class="ta-list-body">${body}</div></aside>`;
}
function sbStatusHtml(){
  const lines = [sbProgress, sbNote].filter(Boolean);
  return lines.length ? `<div class="sb-status" role="status" data-sb-status>${lines.map(l => escHtml(l)).join('<br>')}</div>` : '<div class="sb-status" role="status" data-sb-status hidden></div>';
}
function sbDetailHtml(){
  if(sbSel === null) return sbStartHtml();
  const pub = sbSel !== 'new' && sbPublished ? sbPublished.get(sbSel) || null : null;
  if(pub && !sbShowsSteps()) return sbPublishedHtml(sbSel);
  const d = sbSel === 'new' ? null : sbDraft();
  if(sbSel !== 'new' && !d) return sbStartHtml();
  const title = d ? d.title : (sbNew && sbNew.title) || '', artist = d ? d.artist : (sbNew && sbNew.artist) || '';
  const off = sbBusy ? ' disabled' : '';
  const meta = !d ? 'Song builder · New song · not saved yet'
    : pub ? `Song builder · Published (edit ${escHtml(String(pub.ver))}) · editing: students keep the published song until you publish again · <span data-sb-saved>${escHtml(sbWhen(d.savedAt))}</span> · <button type="button" class="sb-linkbtn" data-sb-act="edit-done"${off}>← The published song</button>`
    : `Song builder · Draft · <span data-sb-saved>${escHtml(sbWhen(d.savedAt))}</span>`;
  const nav = sbNavHtml(d);
  /* A published song is deleted with its typed title (teacher-sb-publish.js); a draft with one OK / Cancel. */
  const del = !d ? '' : pub ? `<button type="button" class="tg-seg-btn ta-act-btn t-act-danger" data-sb-act="delete-song"${off}>Delete…</button>`
    : `<button type="button" class="tg-seg-btn ta-act-btn t-act-danger" data-sb-act="delete"${off}>Delete draft</button>`;
  return `<div class="ta-dhead"><div class="ta-meta">${meta}</div><div class="ta-title-row"><h2 class="ta-title">${escHtml(title || 'New song')} <span class="ta-title-id">${escHtml(artist || '')}</span></h2>`
    + `<div class="ta-actions">${nav}${del}</div></div></div>`
    + sbStepsHtml(d) + sbStatusHtml()
    + (sbStepOn === 1 ? sbUploadHtml(d) : sbStepOn === 2 ? sbVolumeHtml(d) : sbStepOn === 3 ? sbBeatPaneHtml(d) : sbStepOn === 4 ? sbChartPaneHtml(d)
      : sbStepOn === 5 ? sbLevelPaneHtml(d) : sbStepOn === 6 ? sbPreviewPaneHtml(d) : sbPublishPaneHtml(d));
}
function sbStartHtml(){
  return sbStatusHtml() + `<div class="sb-empty"><h3>Build a play-along from an mp3</h3>
    <p class="sb-note">For a song a student asks for. One screen per step, and you check each one. Nothing reaches students until the song is published.</p>
    <ol class="sb-how"><li><span><b>Upload the mp3.</b> Kept behind the school sign-in, never on the public site.</span></li><li><span><b>Volume.</b> Measured and set to match "the cure".</span></li>
    <li><span><b>Beat.</b> Tap along, then check the bars sit on the music.</span></li><li><span><b>Chart.</b> Paste the chords; it builds the grid, and you set what is true.</span></li>
    <li><span><b>Level.</b> Full chords, power chords, or both.</span></li><li><span><b>Preview, then Publish.</b> Hear the real card, then put it on the Songs page.</span></li></ol>
    <button type="button" class="sb-btn primary big" data-sb-act="new"${sbBusy ? ' disabled' : ''}>+ New song</button></div>`;
}
/* The step bar: steps 2 and 3 open once the one before is done; the Chart step opens as soon as the draft exists
   (Jonathan, 2026-11-15: the chart while other things are being worked on); Level once a chart is read; Preview and
   Publish once the song passes the checks a student's page runs (sbSongWhy). Publish itself has more conditions
   (sbPublishWhy, teacher-sb-publish.js). */
function sbHasChart(d){ return !!(d && d.chart && Array.isArray(d.chart.sections) && d.chart.sections.length); }
function sbStepReady(d, k){
  if(k === 1) return true;
  if(k === 2 || k === 4) return !!d;
  if(k === 3) return !!(d && d.audio && d.volume);
  if(k === 5) return sbHasChart(d);
  if(k === 6 || k === 7) return !!(sbHasChart(d) && d.level && d.beat && d.audio) && !sbSongWhy(d, sbSel).length;
  return false;
}
function sbStepsHtml(d){
  return `<div class="sb-steps" role="tablist" aria-label="Steps">` + SB_STEPS.map((s, i) => {
    const k = i + 1, ready = sbStepReady(d, k), built = k <= SB_BUILT_STEPS;
    const done = d && ((k === 1) || (k === 2 && d.audio && d.volume) || (k === 3 && d.beat && d.beat.anchor != null) || (k === 4 && sbHasChart(d)) || (k === 5 && sbHasChart(d) && d.level && d.beat && d.audio && !sbSongWhy(d, sbSel).length)
      || (k === 6 && ready && sbListensOf(d).all) || (k === 7 && ready && sbPublished && sbPublished.has(sbSel) && !sbPubChanged(d, sbPublished.get(sbSel))));
    const warn = (k === 2 && sbPitchBlocked(d)) || (k === 3 && d && d.beat && d.beat.driftOff > 0) || (k === 4 && sbHasChart(d) && sbChartOpen(d, sbChartReadOf(d)).n > 0);
    const cls = (done ? ' done' : '') + (k === sbStepOn ? ' on' : '') + (warn ? ' warn' : '');
    const why = !built ? ' title="Not built yet: it comes in a later update"' : !ready ? ' title="Finish the step before it first"' : '';
    return `<button type="button" class="sb-step${cls}" role="tab" aria-selected="${k === sbStepOn}" data-sb-step="${k}"${ready && built && !sbBusy ? '' : ' disabled'}${why}><span class="sb-n">${warn ? '!' : done && k !== sbStepOn ? '✓' : k}</span>${s}</button>`;
  }).join('') + `</div>`;
}
function sbNavHtml(d){
  const off = sbBusy ? ' disabled' : '';
  if(sbStepOn === 1) return `<button type="button" class="sb-btn primary" data-sb-act="next1"${off}>Next: Volume →</button>`;
  if(sbStepOn === 2) return `<button type="button" class="sb-btn" data-sb-step="1"${off}>← Upload</button><button type="button" class="sb-btn primary" data-sb-step="3"${off || !sbStepReady(d, 3) ? ' disabled' : ''}>Next: Beat →</button>`;
  if(sbStepOn === 3) return `<button type="button" class="sb-btn" data-sb-step="2"${off}>← Volume</button><button type="button" class="sb-btn primary" data-sb-step="4"${off}>Next: Chart →</button>`;
  if(sbStepOn === 4) return `<button type="button" class="sb-btn" data-sb-step="3"${off || !sbStepReady(d, 3) ? ' disabled' : ''}>← Beat</button><button type="button" class="sb-btn primary" data-sb-step="5"${off || !sbStepReady(d, 5) ? ' disabled' : ''}>Next: Level →</button>`;
  if(sbStepOn === 5) return `<button type="button" class="sb-btn" data-sb-step="4"${off}>← Chart</button><button type="button" class="sb-btn primary" data-sb-step="6"${off || !sbStepReady(d, 6) ? ' disabled' : ''}${sbStepReady(d, 6) ? '' : ' title="The song does not pass the checks yet: the box below says why"'}>Next: Preview →</button>`;
  if(sbStepOn === 6) return `<button type="button" class="sb-btn" data-sb-step="5"${off}>← Level</button><button type="button" class="sb-btn primary" data-sb-step="7"${off || !sbStepReady(d, 7) ? ' disabled' : ''}>Next: Publish →</button>`;
  return `<button type="button" class="sb-btn" data-sb-step="6"${off || !sbStepReady(d, 6) ? ' disabled' : ''}>← Preview</button>${sbPublishBtnHtml(d)}`;
}
const SB_LOCK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
const SB_FILE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
function sbUploadHtml(d){
  const src = sbMem.id === (d ? sbSel : 'new') ? sbMem.src : null;
  const s = src ? sbSourceOf(src) : (d && d.source) || null;   // the stored shape: src.bytes is the file itself
  const title = d ? d.title : (sbNew && sbNew.title) || '', artist = d ? d.artist : (sbNew && sbNew.artist) || '';
  const off = sbBusy ? ' disabled' : '';
  const file = s ? `<div class="sb-file"><div class="sb-file-ic">${SB_FILE_ICON}</div><div class="sb-file-body"><div class="sb-file-name">${escHtml(String(s.name || 'song.mp3'))}</div>`
      + `<div class="sb-file-meta">${escHtml(sbLen(s.durationSec))} · ${escHtml(sbMb(s.bytes))}${s.kbps ? ` · ${escHtml(String(s.kbps))} kbps` : ''}${s.sampleRate ? ` · ${escHtml(String(s.sampleRate / 1000))} kHz` : ''}${s.channels ? ` · ${s.channels === 1 ? 'mono' : 'stereo'}` : ''}</div>`
      + `${!src && d ? '<div class="sb-hint">The original stays on your Mac. To level it again, pick the same mp3 again.</div>' : ''}</div></div>` : '';
  return `<div class="sb-lock">${SB_LOCK_ICON}<div><b>Kept behind the school sign-in.</b> The next step makes a levelled copy of the mp3 and saves it in the class database, which only signed-in class accounts can read. It is <b>never</b> put in the public GitHub site. Your original stays on your Mac.</div></div>
  <div class="sb-cols c3">
    <div>
      <div class="sb-h">The recording</div>
      ${file}
      <label class="sb-drop"><input type="file" accept=".mp3,audio/mpeg" data-sb-file${off}><span><b>${s ? 'Pick another mp3' : 'Pick the mp3'}</b> (up to 6 minutes)</span></label>
      <div class="sb-hint">A new file later replaces this one; the beat is kept when the length is the same.</div>
      <div class="sb-fields">
        <div class="sb-field"><label for="sb-title">Song title</label><input id="sb-title" class="sb-input" data-sb-field="title" maxlength="120" value="${escAttr(title)}"${off}></div>
        <div class="sb-field"><label for="sb-artist">Artist</label><input id="sb-artist" class="sb-input" data-sb-field="artist" maxlength="120" value="${escAttr(artist)}"${off}></div>
      </div>
      <div class="sb-hint">Students will see: <b data-sb-see>${escHtml(sbStudentsSee(title, artist))}</b> (Spanish: <i>Toca con la canción</i>).</div>
    </div>
    <div>
      ${sbHasChart(d) ? '<div class="sb-hint">The chord chart is read already: it is at step 4.</div>' : `<div class="sb-field sb-chartfield"><label for="sb-chart1">The chord chart, if you have it now (it is read at step 4)</label>
        <textarea id="sb-chart1" class="sb-pastebox sb-pastebox-small" data-sb-charttext spellcheck="false" maxlength="20000" placeholder="Paste chords over the words, ChordPro, or bars between | lines"${off}>${escHtml(d ? (d.chartText != null ? d.chartText : (d.chart && d.chart.text) || '') : (sbNew && sbNew.chartText) || '')}</textarea>
        <label class="sb-btn small sb-filebtn">Or pick a text file<input type="file" accept=".txt,.pro,.cho,.crd,.chordpro,.chopro,text/plain" data-sb-chartfile${off}></label></div>`}
      ${typeof sbPdfBarHtml === 'function' ? sbPdfBarHtml() : ''}
      <div class="sb-h">What the page does with it</div>
      <ul class="sb-note sb-list">
        <li>Measures how loud it is and makes one copy at the site's volume ("the cure"), at 192k (next step).</li>
        <li>Plays slower speeds from that one copy, pitch kept: Slowest, Slower, Slow, Normal.</li>
        <li>Checks the tuning: a record more than 10 cents off A = 440 goes to Claude instead.</li>
      </ul>
    </div>
  </div>
  <p class="sb-note sb-stepnote">Step 1 of 7. ${d && sbPublished && sbPublished.has(sbSel) ? 'Students keep the published song until you publish again.' : 'Nothing reaches students until you publish.'}</p>`;
}
function sbVolumeHtml(d){
  const v = d && d.volume, a = d && d.audio, p = d && d.pitch;
  const src = sbMem.id === sbSel ? sbMem.src : null;
  const off = sbBusy ? ' disabled' : '';
  if(!v || !a){
    const need = !src
      ? `<p class="sb-note">The original is not in this tab. Pick the same mp3 again (step 1) to level it.</p><button type="button" class="sb-btn" data-sb-step="1"${off}>← Pick the mp3</button>`
      : `<p class="sb-note">Measures the record, makes one copy at the site's volume ("the cure", ${SB_TARGET_LUFS.toFixed(1)} LUFS) with a limiter so it never clips, encodes it at 192k and saves it behind the school sign-in. About a minute for a 3-minute song.</p><button type="button" class="sb-btn primary" data-sb-act="level"${off}>Level it</button>`;
    return `<div class="sb-box"><div class="sb-h">How loud is it?</div>${need}</div>`;
  }
  const pos = l => Math.max(2, Math.min(98, (l + 30) / 30 * 100));   // -30 .. 0 LUFS across the bar
  const ref = pos(SB_TARGET_LUFS), yours = pos(v.before);
  const gain = a.gainDb, dir = v.before > SB_TARGET_LUFS ? 'louder, so the copy is turned down' : 'quieter, so the copy is turned up (the limiter keeps it from clipping)';
  const blocked = sbPitchBlocked(d);
  return `<div class="sb-cols c3">
    <div>
      <div class="sb-h">How loud is it?</div>
      <p class="sb-note">Every backing track on the site plays as loud as <b>"the cure"</b>. This record is ${dir}.</p>
      <div class="sb-meter" aria-hidden="true">
        <div class="arrow" style="left:${Math.min(ref, yours)}%;width:${Math.abs(yours - ref)}%"></div>
        <div class="mk ref bot" style="left:${ref}%"><span>the cure ${SB_TARGET_LUFS.toFixed(1)}</span></div>
        <div class="mk yours top" style="left:${yours}%"><span>yours ${v.before.toFixed(1)}</span></div>
        <span class="sb-meter-l">quieter</span><span class="sb-meter-r">louder</span>
      </div>
      <div class="sb-row sb-volrow">
        <div><div class="sb-hint">Volume for this song</div><div class="sb-big">${gain >= 0 ? '+' : '−'}${Math.abs(gain).toFixed(1)} dB</div></div>
        <div class="sb-row"><button type="button" class="sb-btn small" data-sb-act="play-yours"${off}>▶ 10 s of yours</button><button type="button" class="sb-btn small" data-sb-act="play-cure"${off}>▶ 10 s of the cure</button><button type="button" class="sb-btn small" data-sb-act="play-stop">■ Stop</button></div>
      </div>
      <div class="sb-row">${src ? `<button type="button" class="sb-btn small" data-sb-act="level"${off}>Level it again</button>` : `<button type="button" class="sb-btn small" data-sb-step="1"${off} title="The original is not stored: pick the same mp3 again, then level it">← Pick the mp3 to level again</button>`}<button type="button" class="sb-btn small" data-sb-act="clear-volume"${off}>Clear this step</button></div>
      ${blocked ? `<div class="sb-flag red"><span class="fi">!</span><div class="sb-flag-body"><b>This record is ${escHtml(sbCentsLine(p.cents))}.</b> A song more than 10 cents off cannot be published. Send the mp3 to Claude, who shifts it to A = 440 and sends it back. You can still try the other steps.</div></div>` : ''}
    </div>
    <div class="sb-box tint">
      <div class="sb-h">Measured</div>
      <dl class="sb-kv">
        <dt>Loudness</dt><dd>${v.before.toFixed(1)} LUFS (whole song)</dd>
        <dt>Target</dt><dd>${SB_TARGET_LUFS.toFixed(1)} LUFS, the cure</dd>
        <dt>Levelled copy</dt><dd>${v.after.toFixed(1)} LUFS <span class="sb-ok">OK</span></dd>
        <dt>Loudest peak</dt><dd>${v.samplePeak.toFixed(1)} dB (true peak ${v.truePeak.toFixed(1)}) <span class="sb-ok">OK</span></dd>
        <dt>Pitch</dt><dd>${escHtml(sbCentsLine(p && p.cents))} ${blocked ? '<span class="sb-bad">over 10 cents</span>' : '<span class="sb-ok">OK</span>'}</dd>
        <dt>Stored</dt><dd>${escHtml(sbMb(a.bytes))}, ${escHtml(sbLen(a.durationSec))}, 192k</dd>
      </dl>
      <p class="sb-hint">One number for the whole song.${src ? '' : ' The original mp3 is not stored: to level again, pick it again on step 1.'}</p>
    </div>
  </div>`;
}

/* ── Events ── */
function sbClick(e){
  const t = e.target && e.target.closest ? e.target : null;
  if(!t || teacherView !== 'songbuilder') return;
  const pick = t.closest('[data-sb-pick]');
  if(pick && !pick.disabled){ sbOpen(pick.dataset.sbPick); return; }
  const f = t.closest('[data-sb-filter]');
  if(f){ sbFilter = f.dataset.sbFilter; teacherSbPaint(); return; }
  const st = t.closest('[data-sb-step]');
  if(st && !st.disabled){ sbGoStep(Number(st.dataset.sbStep)); return; }
  const b = t.closest('[data-sb-act]');
  if(!b || b.disabled) return;
  const act = b.dataset.sbAct;
  if(act === 'new'){ if(sbBusy) return; sbStopSounds(); sbSel = 'new'; sbNew = { title: '', artist: '' }; sbStepOn = 1; sbNote = ''; sbMemFor('new'); teacherSbPaint(); return; }
  if(act === 'next1'){ sbSaveUpload(); return; }
  if(act === 'level'){ sbRunLevel(); return; }
  if(act === 'delete'){ sbDeleteDraft(); return; }
  if(typeof sbPubAct === 'function' && sbPubAct(act, b)) return;
  if(act === 'clear-volume'){ sbClearStep('volume'); return; }
  if(act === 'clear-beat'){ sbClearStep('beat'); return; }
  if(act === 'clear-chart'){ sbClearStep('chart'); return; }
  if(typeof sbPdfAct === 'function' && sbPdfAct(act, b)) return;
  if(typeof sbChartAct === 'function' && sbChartAct(act, b)) return;
  if(act === 'play-yours'){ sbPlayTen('yours'); return; }
  if(act === 'play-cure'){ sbPlayTen('cure'); return; }
  if(act === 'play-stop'){ sbStopTen(); return; }
  if(typeof sbBeatAct === 'function') sbBeatAct(act, b);
}
function sbInput(e){
  const t = e.target;
  if(t.matches('[data-sb-search]')){
    sbQuery = t.value;
    const pos = t.selectionStart;
    teacherSbPaint();
    const n = document.querySelector('[data-sb-search]'); if(n){ n.focus(); try{ n.setSelectionRange(pos, pos); }catch(err){} }
    return;
  }
  if(t.matches('[data-sb-field]')){
    const d = sbDraft(), obj = d || sbNew;
    if(!obj) return;
    obj[t.dataset.sbField] = t.value;
    if(d) d.dirty = true;
    const see = document.querySelector('[data-sb-see]'); if(see) see.textContent = sbStudentsSee(obj.title, obj.artist);
    return;
  }
  if(typeof sbChartInput === 'function' && sbChartInput(e)) return;
  if(typeof sbBeatInput === 'function') sbBeatInput(e);
}
function sbChange(e){
  const t = e.target;
  if(t.matches('[data-sb-file]')){ const f = t.files && t.files[0]; if(f) sbPickFile(f); return; }
  if(typeof sbPdfChange === 'function' && sbPdfChange(e)) return;
  if(typeof sbChartChange === 'function' && sbChartChange(e)) return;
  if(typeof sbBeatChange === 'function') sbBeatChange(e);
}
let sbKeysBound = false;
function sbBindKeys(){
  if(sbKeysBound) return;
  sbKeysBound = true;
  document.addEventListener('keydown', sbKey);
  document.addEventListener('visibilitychange', sbOnHidden);
}
function sbKey(e){
  if(teacherView !== 'songbuilder') return;
  if(typeof sbBeatKey === 'function') sbBeatKey(e);
}
function sbOnHidden(){ if(document.hidden) sbStopSounds(); }
/* Leaving the view (setTeacherView): every sound stops, the encoder is ended, a write in flight stops before its
   next step (sbStopped), and nothing paints. */
function teacherSbLeave(){
  sbViewGen++;
  sbStopSounds();
  if(typeof sbPreviewStop === 'function') sbPreviewStop(true);   // the preview card leaves the page's activity list too
  if(sbWorker){ try{ sbWorker.terminate(); }catch(e){} sbWorker = null; }
  if(typeof sbPdfLeave === 'function') sbPdfLeave();
}
function sbStopSounds(){
  sbStopTen();
  if(typeof sbBeatStop === 'function') sbBeatStop();
  if(typeof sbPreviewStop === 'function') sbPreviewStop(false);   // the preview card's song (only that card's: never a global stopper)
}
function sbMemFor(id){
  if(sbMem.id === id) return;
  if(sbMem.level && sbMem.level.url){ try{ URL.revokeObjectURL(sbMem.level.url); }catch(e){} }
  sbMem.id = id; sbMem.src = null; sbMem.level = null; sbMem.failed = null;
}
function sbOpen(id){
  if(sbBusy || id === sbSel) return;
  sbStopSounds();
  if(typeof sbEditing !== 'undefined') sbEditing.clear();   // a published song opens on its own page again
  sbSel = id; sbNote = ''; sbNew = null;
  const d = sbDraft();
  sbStepOn = d ? Math.max(1, Math.min(SB_BUILT_STEPS, Number(d.step) || 1)) : 1;
  while(d && sbStepOn > 1 && !sbStepReady(d, sbStepOn)) sbStepOn--;   // a step that is not open (the checks changed): the last one that is
  sbMemFor(id);
  teacherSbPaint();
}
function sbGoStep(k){
  const d = sbDraft();
  if(sbBusy || k < 1 || k > SB_BUILT_STEPS || !sbStepReady(d, k)) return;
  if(k !== 1 && d && d.dirty){ sbSaveUpload(k); return; }
  sbStopSounds();
  sbMem.failed = null;                    // a step click is a deliberate try: the Beat step may load the copy again
  sbStepOn = k; sbNote = '';
  /* Preview and Publish are the furthest steps: reaching one is saved, so the list says where the draft is. */
  if(k >= 6 && d && (Number(d.step) || 1) < k){ sbWriteDraft(sbSel, Object.assign(d, { step: k })); return; }
  teacherSbPaint();
}

/* ── Step 1: the file ── */
async function sbPickFile(file){
  if(sbBusy) return;
  const gen = sbViewGen, forId = sbSel;
  if(!/\.mp3$/i.test(file.name || '') && file.type !== 'audio/mpeg'){ sbNote = 'That is not an mp3. Pick an .mp3 file.'; teacherSbPaint(); return; }
  if(!(file.size > 0) || file.size > SB_MAX_SRC_BYTES){ sbNote = `That file is ${file.size > 0 ? sbMb(file.size) : 'empty'}; a 6-minute mp3 is far smaller. Nothing was read.`; teacherSbPaint(); return; }
  sbBusy = 'load'; sbProgress = 'Reading the mp3…'; sbNote = ''; teacherSbPaint();
  try{
    const bytes = new Uint8Array(await file.arrayBuffer());
    const info = sbMp3Info(bytes);
    if(!info) throw { why: 'This file is not an mp3 the builder can read (no MPEG layer III frame at its start).' };
    if(!SB_RATES.includes(info.sampleRate)) throw { why: `This mp3 is ${info.sampleRate / 1000} kHz; the builder takes 32, 44.1 or 48 kHz. Send it to Claude.` };
    const sha = sfHex(await crypto.subtle.digest('SHA-256', bytes));
    sbProgress = 'Decoding…'; teacherSbPaint();
    const chans = await sbDecode(bytes, info.sampleRate);
    const durationSec = Math.round(chans[0].length / info.sampleRate * 1000) / 1000;
    if(durationSec > SB_MAX_SEC) throw { why: `This song is ${sbLen(durationSec)} long; the builder takes songs up to 6:00. Send it to Claude.` };
    if(durationSec < 10) throw { why: 'This mp3 is under 10 seconds long.' };
    if(sbStopped(gen) || sbSel !== forId) return;
    sbMemFor(forId);
    sbMem.src = { bytes, sha256: sha, name: String(file.name || 'song.mp3').slice(0, 200), info, chans, fs: info.sampleRate, durationSec };
    const d = sbDraft();
    if(d){
      const same = d.source && d.source.sha256 === sha;
      if(!same){
        const keepBeat = d.source && Math.abs(d.source.durationSec - durationSec) <= 0.05;
        d.source = sbSourceOf(sbMem.src);
        d.volume = null; d.pitch = null;
        if(!keepBeat) d.beat = null;
        d.replaced = true;                 // the levelled copy is the old file's until Volume runs again
        d.dirty = true;
        sbNote = keepBeat ? 'New file: level it again on the next step; the beat is kept (same length).' : 'New file: level it again on the next step. Its length differs, so the beat starts over.';
      } else sbNote = 'The same mp3 as before.';
    } else sbNote = '';
  }catch(e){
    sbNote = e && e.why ? e.why : 'Could not read that file: ' + String((e && e.message) || e);
  }finally{
    sbBusy = ''; sbProgress = '';
    if(!sbStopped(gen)) teacherSbPaint();
  }
}
function sbSourceOf(s){ return { name: s.name, bytes: s.bytes.length, sha256: s.sha256, durationSec: s.durationSec, sampleRate: s.fs, channels: s.chans.length, kbps: s.info.kbps }; }
/* Next on step 1 (or a step click with unsaved title edits): the draft is saved, created the first time. */
async function sbSaveUpload(goTo){
  if(sbBusy) return;
  const d = sbDraft();
  const obj = d || sbNew || {};
  const title = String(obj.title || '').trim(), artist = String(obj.artist || '').trim();
  const why = sbTitleWhy(title, artist);
  if(why){ sbNote = why; teacherSbPaint(); return; }
  if(!d && !(sbMem.id === 'new' && sbMem.src)){ sbNote = 'Pick the mp3 first.'; teacherSbPaint(); return; }
  if(d && !d.source && !sbMem.src){ sbNote = 'Pick the mp3 first.'; teacherSbPaint(); return; }
  let id = sbSel;
  const draft = d ? Object.assign({}, d, { title, artist }) : { v: 1, title, artist, step: 1, source: sbSourceOf(sbMem.src), audio: null, volume: null, pitch: null, beat: null, chart: null, level: null };
  /* A chart given at this step (pasted or picked) is kept as its text, for step 4 to read; never over a chart
     that has been read already. */
  if(typeof obj.chartText === 'string' && !sbHasChart(draft)) draft.chart = obj.chartText.trim() ? { text: obj.chartText.replace(/\r\n?/g, '\n').slice(0, 20000) } : null;
  if(!d){ id = sbNewId(); }
  draft.step = Math.max(Number(draft.step) || 1, 2);   // step 1 is done once the draft is saved
  const ok = await sbWriteDraft(id, draft);
  if(!ok) return;
  if(!d){ sbMem.id = id; sbSel = id; sbNew = null; if(typeof sbPdfRename === 'function') sbPdfRename('new', id); }
  sbStepOn = goTo || 2;
  if(!sbStepReady(sbDraft(), sbStepOn)) sbStepOn = 2;
  teacherSbPaint();
}
/* The one draft writer. Saves the fields a draft has, with the server's time, and keeps the copy in memory. */
function sbDraftDoc(d){
  const keep = ['v', 'title', 'artist', 'step', 'source', 'audio', 'volume', 'pitch', 'beat', 'chart', 'level', 'listens', 'pubVer'];
  const out = {};
  keep.forEach(k => { out[k] = d[k] === undefined ? null : d[k]; });
  out.v = 1;
  return JSON.parse(JSON.stringify(out));      // plain values only (no undefined, no Infinity: those become null)
}
async function sbWriteDraft(id, d){
  const gen = sbViewGen;
  if(!sbIsDraftId(id)){ sbNote = 'That draft id is not one the database takes.'; teacherSbPaint(); return false; }
  sbBusy = 'save'; sbOpGen++; sbProgress = 'Saving…';
  teacherSbPaint();
  try{
    await ensureDb();
    if(sbStopped(gen)) throw 'stop';
    const doc = sbDraftDoc(d);
    await db.collection('songDrafts').doc(id).set(Object.assign({}, doc, { savedAt: firebase.firestore.FieldValue.serverTimestamp() }));
    if(!sbDrafts) sbDrafts = new Map();
    sbDrafts.set(id, Object.assign(doc, { savedAt: Date.now() }));
    sbNote = sbNote && /New file|same mp3/.test(sbNote) ? sbNote : '';
    return true;
  }catch(e){
    sbNote = e === 'stop' ? 'Stopped: you left the Song builder. The draft was not saved.' : 'The draft was not saved: ' + (typeof teacherSfWhy === 'function' ? teacherSfWhy(e) : String((e && (e.code || e.message)) || e)) + '.';
    return false;
  }finally{
    sbBusy = ''; sbProgress = ''; sbOpGen++;
    if(!sbStopped(gen)) teacherSbPaint();
  }
}

/* ── Decoding and encoding (the browser's own decoder; vendor/lamejs in a Worker) ── */
async function sbDecode(bytes, fs){
  const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const ctx = new Ctx(2, 1, fs);
  const buf = await ctx.decodeAudioData(bytes.slice().buffer);
  if(buf.sampleRate !== fs) throw { why: `this browser decoded the file at ${buf.sampleRate} Hz, not ${fs}` };
  const out = [];
  for(let c = 0; c < Math.min(2, buf.numberOfChannels); c++) out.push(buf.getChannelData(c));
  return out;
}
function sbEncode(chans, fs, onProgress){
  return new Promise((resolve, reject) => {
    const lame = new URL('vendor/lamejs/lame.min.js', location.href).href;
    const code = `importScripts(${JSON.stringify(lame)});
onmessage = function(e){ try{
  var d = e.data, n = d.ch[0].length, enc = new lamejs.Mp3Encoder(d.ch.length, d.fs, d.kbps), parts = [], total = 0, B = 1152 * 32;
  function put(b){ if(b.length){ var u = new Uint8Array(b.length); for(var j = 0; j < b.length; j++) u[j] = b[j] & 255; parts.push(u); total += u.length; } }
  for(var i = 0, k = 0; i < n; i += B, k++){
    put(d.ch.length === 2 ? enc.encodeBuffer(d.ch[0].subarray(i, i + B), d.ch[1].subarray(i, i + B)) : enc.encodeBuffer(d.ch[0].subarray(i, i + B)));
    if(k % 20 === 0) postMessage({ p: i / n });
  }
  put(enc.flush());
  var out = new Uint8Array(total), at = 0;
  for(var p = 0; p < parts.length; p++){ out.set(parts[p], at); at += parts[p].length; }
  postMessage({ done: out }, [out.buffer]);
} catch(err){ postMessage({ err: String((err && err.message) || err) }); } };`;
    let url = null, w = null;
    try{ url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' })); w = new Worker(url); }
    catch(e){ if(url) URL.revokeObjectURL(url); reject({ why: 'this browser could not start the encoder (' + String((e && e.message) || e) + ')' }); return; }
    sbWorker = w;
    const end = () => { try{ w.terminate(); }catch(e){} if(sbWorker === w) sbWorker = null; URL.revokeObjectURL(url); };
    w.onmessage = ev => {
      const m = ev.data || {};
      if(m.p != null){ if(onProgress) onProgress(m.p); return; }
      end();
      if(m.done) resolve(m.done); else reject({ why: 'the encoder stopped: ' + (m.err || 'no reason given') });
    };
    w.onerror = ev => { end(); reject({ why: 'the encoder could not load (' + String((ev && ev.message) || 'vendor/lamejs') + ')' }); };
    w.postMessage({ ch: chans, fs, kbps: SB_KBPS }, chans.map(c => c.buffer));
  });
}

/* ── Step 2: Volume ── */
async function sbRunLevel(){
  const d = sbDraft();
  if(sbBusy || !d || !sbMem.src || sbMem.id !== sbSel) return;
  const gen = sbViewGen, id = sbSel, src = sbMem.src;
  sbStopSounds();
  sbBusy = 'level'; sbOpGen++; sbNote = ''; sbProgress = 'Measuring the record…'; teacherSbPaint();
  const say = line => { sbProgress = line; const el = document.querySelector('[data-sb-status]'); if(el && !sbStopped(gen)){ el.hidden = false; el.textContent = line; } };
  const w = { stopped: () => sbStopped(gen), wrote: false, k: -1, n: 0, progress: say };
  let step = 'measure';
  try{
    await new Promise(r => setTimeout(r, 30));
    const pitch = sbCents(sbMono(src.chans), src.fs);
    const t0 = Date.now();
    const lv = await sbLevel(src.chans, src.fs, {
      encode: (ch, fs) => sbEncode(ch, fs, p => say(`Encoding at 192k… ${Math.floor(p * 100)}%`)),
      decode: (bytes, fs) => sbDecode(bytes, fs),
      progress: line => say(line),
      stopped: () => sbStopped(gen),
    });
    if(sbStopped(gen)) throw 'stop';
    const sha = sfHex(await crypto.subtle.digest('SHA-256', lv.bytes));
    const level = await sbDecode(lv.bytes, src.fs);
    const durationSec = Math.round(level[0].length / src.fs * 100) / 100;
    const audioId = id + '-' + sha.slice(0, 8);
    const audio = { id: audioId, bytes: lv.bytes.length, sha256: sha, durationSec, centsOff: pitch.cents == null ? 0 : Math.round(pitch.cents * 10) / 10,
      gainDb: Math.round(lv.gainDb * 100) / 100, sourceSha256: src.sha256 };
    step = 'upload';
    await teacherSfPutFile(audioId, { file: audioId + '.mp3', bytes: audio.bytes, sha256: sha }, lv.bytes, durationSec, w);
    if(sbStopped(gen)) throw 'stop';
    step = 'draft';
    const old = d.audio && d.audio.id !== audioId ? d.audio.id : null;
    const next = Object.assign({}, d, { audio, pitch: { cents: pitch.cents == null ? null : Math.round(pitch.cents * 100) / 100, peaks: pitch.n },
      volume: { before: Math.round(lv.before.I * 100) / 100, after: Math.round(lv.after.I * 100) / 100, samplePeak: Math.round(lv.after.sp * 100) / 100,
        truePeak: Math.round(lv.after.tp * 100) / 100, ceilingDb: Math.round(lv.ceilingDb * 100) / 100, encodes: lv.tries, seconds: Math.round((Date.now() - t0) / 100) / 10 },
      step: Math.max(2, Number(d.step) || 1) });
    delete next.replaced;
    if(next.beat && Math.abs((d.audio ? d.audio.durationSec : durationSec) - durationSec) > 0.05 && d.replaced) next.beat = null;
    sbBusy = '';
    const saved = await sbWriteDraft(id, next);
    if(!saved) return;
    sbMem.level = { bytes: lv.bytes, sha256: sha, chans: level, fs: src.fs, mono: sbMono(level), durationSec, url: null, E: null };
    if(old) await sbDeleteAudio(old, gen);
    sbNote = `Levelled: ${audio.gainDb >= 0 ? '+' : ''}${audio.gainDb.toFixed(1)} dB, ${sbMb(audio.bytes)} saved in ${w.n} piece${w.n === 1 ? '' : 's'}.`;
  }catch(e){
    const where = step === 'upload' ? (w.wrote ? ' The copy did NOT finish uploading; press Level it again.' : '') : step === 'draft' ? ' The copy is stored but the draft was not saved; press Level it again.' : '';
    if(e === 'stop') sbNote = 'Stopped: you left the Song builder.' + where;
    else if(e && e.shape) sbNote = 'Not saved: ' + e.shape + '.';
    else if(e && e.why) sbNote = 'Not levelled: ' + e.why + '.';
    else sbNote = 'Not levelled: ' + (typeof teacherSfWhy === 'function' ? teacherSfWhy(e) : String((e && (e.code || e.message)) || e)) + '.' + where;
  }finally{
    sbBusy = ''; sbProgress = ''; sbOpGen++;
    if(!sbStopped(gen)) teacherSbPaint();
  }
}
/* A levelled copy nobody uses any more: deleted, unless a built song on the list plays it. */
async function sbDeleteAudio(audioId, gen){
  try{
    if(typeof teacherBsAudioUsers === 'function'){ const users = await teacherBsAudioUsers(audioId); if(users.length) return; }
    if(gen != null && sbStopped(gen)) return;
    await ensureDb();
    const ref = db.collection('songFiles').doc(audioId), batch = db.batch();
    for(let j = 0; j < TEACHER_SF_MAX_PIECES; j++) batch.delete(ref.collection('pieces').doc(String(j)));
    batch.delete(ref);
    await batch.commit();
  }catch(e){ /* left in the store: Manage → Song files lists it and can delete it */ }
}
/* The levelled copy for the Beat step: in this tab already, or read back from songFiles (counted like a
   Chromebook's read). Resolves true when sbMem.level is ready. */
async function sbLoadLevel(){
  const d = sbDraft();
  if(!d || !d.audio) return false;
  if(sbMem.id === sbSel && sbMem.level && sbMem.level.sha256 === d.audio.sha256) return true;
  if(sbBusy) return false;
  const gen = sbViewGen, id = sbSel, a = d.audio;
  sbBusy = 'load'; sbProgress = 'Loading the levelled copy…'; teacherSbPaint();
  try{
    await ensureDb();
    await songFileCount(db, songFileCost(a.bytes));
    const bytes = await songFileReadPieces(db, a.id, { bytes: a.bytes, sha256: a.sha256 }, f => { sbProgress = `Loading the levelled copy… ${Math.floor(f * 100)}%`; const el = document.querySelector('[data-sb-status]'); if(el){ el.hidden = false; el.textContent = sbProgress; } }, () => sbStopped(gen));
    const fs = (d.source && d.source.sampleRate) || (sbMp3Info(bytes) || {}).sampleRate || 44100;
    const chans = await sbDecode(bytes, fs);
    if(sbStopped(gen) || sbSel !== id) return false;
    sbMemFor(id);
    sbMem.level = { bytes, sha256: a.sha256, chans, fs, mono: sbMono(chans), durationSec: a.durationSec, url: null, E: null };
    return true;
  }catch(e){
    if(sbMem.id === id) sbMem.failed = a.sha256;
    const c = e && e.code;
    sbNote = c === 'limit' ? 'The levelled copy cannot load: this month\'s song downloads are at the limit (Manage → Song files).'
      : c === 'missing' || c === 'bad' ? 'The levelled copy is missing or damaged in the database. Pick the mp3 again (step 1) and level it again.'
      : 'Could not load the levelled copy: ' + (typeof teacherSfWhy === 'function' ? teacherSfWhy(e) : String((e && (e.code || e.message)) || e)) + '. Click the step\'s name above to try again.';
    return false;
  }finally{
    sbBusy = ''; sbProgress = '';
    if(!sbStopped(gen)) teacherSbPaint();
  }
}

/* ── "10 s of yours" / "10 s of the cure" ── */
function sbPlayTen(which){
  sbStopTen();
  let url = null, src;
  if(which === 'cure') src = SB_CURE;
  else {
    const lv = sbMem.id === sbSel && sbMem.level;
    if(!lv){ sbLoadLevel().then(ok => { if(ok) sbPlayTen('yours'); }); return; }
    if(!lv.url) lv.url = URL.createObjectURL(new Blob([lv.bytes], { type: 'audio/mpeg' }));
    src = lv.url;
  }
  const a = new Audio(src);
  const start = which === 'cure' ? 30 : Math.max(0, ((sbMem.level && sbMem.level.durationSec) || 60) * 0.4);
  a.addEventListener('loadedmetadata', () => { try{ a.currentTime = Math.min(start, Math.max(0, a.duration - 10)); }catch(e){} a.play().catch(() => {}); }, { once: true });
  sbPlayer = { audio: a, url, timer: setTimeout(sbStopTen, 10500) };
}
function sbStopTen(){
  if(!sbPlayer) return;
  clearTimeout(sbPlayer.timer);
  try{ sbPlayer.audio.pause(); sbPlayer.audio.removeAttribute('src'); sbPlayer.audio.load(); }catch(e){}
  sbPlayer = null;
}

/* ── Clear this step (Jonathan, 2026-11-15: "at any step if i want to clear what it had done instead of starting
   over"). Volume: the levelled copy, the measurements and the pitch go (the copy is deleted from songFiles after the
   draft no longer names it; never one a built song plays); the beat is kept, since the same mp3 levelled again has
   the same length. Beat: bar 1, the tempo, the pins and the taps go. Chart: the grid, the sections and the level go;
   the pasted text stays. The title, the file's facts and the other steps stay. One OK / Cancel, as Delete draft. ── */
async function sbClearStep(which){
  const d = sbDraft();
  if(sbBusy || !d) return;
  const q = which === 'volume' ? 'Clear the Volume step? The levelled copy is deleted; the beat you set is kept. Level it again to make a new copy.'
    : which === 'chart' ? 'Clear the Chart step? The grid, the sections and the level go; the text you pasted stays in the box to read again.'
    : 'Clear the Beat step? Bar 1, the tempo and the pins go. Tap or type the tempo again to set a new grid.';
  if(!confirm(q)) return;
  const id = sbSel, gen = sbViewGen;
  sbStopSounds();
  const bt = typeof sbBtFor === 'function' ? sbBtFor(id) : null;
  if(bt){ clearTimeout(bt.saveTimer); bt.taps = []; bt.fit = null; bt.drift = null; }
  const old = which === 'volume' && d.audio ? d.audio.id : null;
  if(which === 'chart' && typeof sbChFor === 'function'){ const st = sbChFor(id); clearTimeout(st.saveTimer); st.view = 'paste'; st.sel = null; st.undo = []; st.text = null; }
  const next = which === 'volume' ? Object.assign({}, d, { audio: null, volume: null, pitch: null, step: 2 })
    : which === 'chart' ? Object.assign({}, d, { chart: d.chart && d.chart.text ? { text: d.chart.text } : null, level: null, step: 4 })
    : Object.assign({}, d, { beat: null, step: 3 });
  const ok = await sbWriteDraft(id, next);
  if(!ok) return;
  if(which === 'volume'){ if(sbMem.id === id){ sbMem.level = null; sbMem.failed = null; } sbStepOn = 2; }
  if(old) await sbDeleteAudio(old, gen);
  if(which === 'chart') sbStepOn = 4;
  sbNote = which === 'volume' ? 'The Volume step is cleared.' : which === 'chart' ? 'The Chart step is cleared.' : 'The Beat step is cleared.';
  if(!sbStopped(gen)) teacherSbPaint();
}

/* ── Delete draft ── */
async function sbDeleteDraft(){
  const d = sbDraft();
  if(sbBusy || !d) return;
  /* A published song is never deleted by the draft's OK / Cancel: it takes the typed title (teacher-sb-publish.js). */
  if(sbPublished && sbPublished.has(sbSel)){ if(typeof sbDeleteSong === 'function') sbDeleteSong(); return; }
  const id = sbSel, title = String(d.title || '');
  if(!confirm(`Delete the draft "${title}"? Its levelled copy in the database goes too. Your mp3 on the Mac is not touched.`)) return;
  const gen = sbViewGen;
  sbStopSounds();
  sbBusy = 'delete'; sbOpGen++; sbProgress = 'Deleting…'; teacherSbPaint();
  try{
    await ensureDb();
    await db.collection('songDrafts').doc(id).delete();
    sbDrafts.delete(id);
    if(d.audio && d.audio.id) await sbDeleteAudio(d.audio.id, null);
    sbMemFor(null); sbSel = null;
    sbNote = `Deleted the draft "${title}".`;
  }catch(e){
    sbNote = 'Nothing was deleted: ' + (typeof teacherSfWhy === 'function' ? teacherSfWhy(e) : String((e && (e.code || e.message)) || e)) + '.';
  }finally{
    sbBusy = ''; sbProgress = ''; sbOpGen++;
    if(!sbStopped(gen)) teacherSbPaint();
  }
}
