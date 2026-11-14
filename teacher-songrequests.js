/* ── Song requests view (2026-11-13) ────────────────────────────────────
   Students ask for a song from the Songs page (app/songrequests.js): a
   YouTube video, two yes/no answers (are the lyrics OK for class, is what the
   song is about OK for class), a reason when either answer is No, and an
   optional title. One doc per student per week: songRequests/<uid>_<week>.

   This view reads the newest TEACHER_SR_READ_MAX requests (createdAt, newest
   first) and groups them by video id: one block per video, newest first,
   with "N students asked", the link, and one row per request (when, student,
   period, the two answers, the reason, the title they typed, its state,
   Delete). The block's buttons set the state of every request in it:
   "Adding it", "Not this one", "Back to Asked", and "Note" (a short line the
   student sees under the state). Filter: Waiting (blocks with a request still
   "asked") or All.

   WRITES. Field-level updates only (state, note), in one batch per click; the
   rules let the teacher change nothing else. Delete removes one request,
   after a confirm; a deleted request of this week gives the student their
   turn back. While a write is out, the block's buttons are off. A read that
   started before a write finished is thrown away and read again, and an
   older read never replaces a newer one (teacherSrReadGen), so the screen
   never goes back to a state from before the click.

   THE BADGE on the sidebar item counts requests still "asked" (at most 99+),
   at the Reports badge's moments: teacherRefreshReportsBadge() calls
   teacherRefreshSongRequestsBadge() (teacher-core.js), and this view repaints
   it from what it read.

   Every value here was typed by a student (name, email, period, title, the
   reason) or comes from their doc: escaped where it is drawn (escHtml /
   escAttr); the link is rebuilt from a video id that matches the 11-character
   shape, never taken from the doc's url field; no value goes into an inline
   handler (data-* and one delegated listener).

   Needs the songRequests block of firestore.rules pasted into the Firebase
   console. Until then every read is refused, and the view says so. */
const TEACHER_SR_READ_MAX = 500;
const TEACHER_SR_BADGE_MAX = 100;     // shown as "99+" at this many
const TEACHER_SR_ID_RE = /^[A-Za-z0-9_-]{11}$/;
const TEACHER_SR_STATES = {asked:'Waiting', adding:'Adding it', declined:'Not this one'};
/* A state the rules allow ('asked' for anything else: a doc of the wrong shape counts as waiting). */
function teacherSrState(s){ return Object.prototype.hasOwnProperty.call(TEACHER_SR_STATES, s) ? s : 'asked'; }
let teacherSrDocs = null;             // the last read: [{id, ...fields}]; null = not read yet
let teacherSrFilter = 'waiting';      // 'waiting' | 'all'
let teacherSrNote = '';               // one line above the list after an action
let teacherSrReadGen = 0;             // a newer read drops an older one
let teacherSrWriteGen = 0;            // bumped when a write settles: a read that overlapped it is read again
let teacherSrWritesOpen = 0;
let teacherSrBusy = new Set();        // video ids (and doc ids) with a write out
let teacherSrBadgeReq = 0;
let teacherSrBound = false;

/* Requests → blocks by video id. Each block: the video id ('' when the doc's
   id has the wrong shape: such docs each get their own block), its requests
   newest first, the title shown (the most common one typed), how many are
   waiting, and the newest time. Blocks: newest first. Never throws on a doc
   of the wrong shape. */
function teacherSrGroups(docs){
  const by = new Map();
  (docs || []).forEach((raw, i) => {
    const d = raw && typeof raw === 'object' ? raw : {};
    const vid = TEACHER_SR_ID_RE.test(String(d.videoId || '')) ? String(d.videoId) : '';
    const key = vid || ('bad:' + i);
    let g = by.get(key);
    if(!g){ g = {key, videoId:vid, rows:[], waiting:0, newest:0}; by.set(key, g); }
    g.rows.push(d);
    if(teacherSrState(d.state) === 'asked') g.waiting++;
    const ms = teacherSrMs(d.createdAt);
    if(ms > g.newest) g.newest = ms;
  });
  const out = [...by.values()];
  out.forEach(g => {
    g.rows.sort((a, b) => teacherSrMs(b.createdAt) - teacherSrMs(a.createdAt));
    const n = new Map();
    g.rows.forEach(r => { const tt = String(r.title || '').trim(); if(tt) n.set(tt, (n.get(tt) || 0) + 1); });
    g.title = [...n.entries()].sort((a, b) => b[1] - a[1])[0];
    g.title = g.title ? g.title[0] : '';
  });
  return out.sort((a, b) => b.newest - a.newest);
}
function teacherSrMs(ts){
  try{ return ts && typeof ts.toMillis === 'function' ? ts.toMillis() : (ts && typeof ts.seconds === 'number' ? ts.seconds * 1000 : 0); }catch(e){ return 0; }
}
function teacherSrWhen(ts){
  const ms = teacherSrMs(ts);
  return ms ? new Date(ms).toLocaleString([], {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'}) : '—';
}
/* A Yes, or a No that stands out. */
function teacherSrAnswerHtml(v){
  return v === true ? '<span class="tsr-yes">Yes</span>' : v === false ? '<span class="tsr-no">No</span>' : '<span class="tsr-yes">—</span>';
}
/* Who asked: the roster's name for the doc's uid (the console's loaded
   students, archived ones too), else the doc's email. NEVER the doc's own
   `name` field (review R1-1). The roster name is progress/{uid}.name, which a
   student can write too (review R2-1), so it is a label, not proof: the doc's
   EMAIL is the one value firestore.rules ties to the sign-in token, and it is
   always shown beside the name (teacherSrWhoHtml, teacherSrDeleteText). */
function teacherSrWho(d, fallback){
  const uid = String((d && d.uid) || '');
  let roster = [];
  try{ roster = (typeof allStudentsRaw !== 'undefined' && Array.isArray(allStudentsRaw) && allStudentsRaw.length) ? allStudentsRaw : ((typeof allStudents !== 'undefined' && Array.isArray(allStudents)) ? allStudents : []); }catch(e){ roster = []; }
  const stu = uid ? roster.find(x => x && x.uid === uid) : null;
  return String((stu && (stu.name || stu.email)) || (d && d.email) || fallback);
}
/* The row's Student cell: the name, and the token-tied email on a second
   line whenever it is not the text already shown. */
function teacherSrWhoHtml(d){
  const who = teacherSrWho(d, '—'), email = String((d && d.email) || '');
  return escHtml(who) + (email && email !== who ? `<div class="tsr-email">${escHtml(email)}</div>` : '');
}
/* Delete's confirm (plain text): the name and the email both. */
function teacherSrDeleteText(d, thisWeek){
  const who = teacherSrWho(d, 'this student'), email = String((d && d.email) || '');
  const whoFull = email && email !== who ? `${who} (${email})` : who;
  const what = String((d && d.title) || '').trim() || 'YouTube video ' + String((d && d.videoId) || '');
  return `Delete ${whoFull}'s request (${what})? This cannot be undone.${thisWeek ? ` It is from this week, so ${who} can ask for a song again this week.` : ''}`;
}
/* A reason that is only white space or invisible characters (zero-width
   spaces and joiners, word joiner, Hangul fillers, BOM…) is no reason
   (review R2-2). */
const TEACHER_SR_INVISIBLE = /[\s\u00AD\u115F\u1160\u180E\u200B-\u200F\u2060-\u2064\u2800\u3164\uFEFF\uFFA0]/g;
function teacherSrReason(d){
  const raw = String((d && d.why) == null ? '' : d.why);
  return raw.replace(TEACHER_SR_INVISIBLE, '') ? raw.trim() : '';
}
function teacherSrStateLabel(s){ return TEACHER_SR_STATES[teacherSrState(s)]; }
/* One request's row. */
function teacherSrRowHtml(d){
  const why = teacherSrReason(d);
  const anyNo = d.lyricsOk === false || d.topicOk === false;
  const busy = teacherSrBusy.has(String(d.id || ''));
  return `<tr${anyNo ? ' class="tsr-row-no"' : ''}>`
    + `<td style="white-space:nowrap">${escHtml(teacherSrWhen(d.createdAt))}</td>`
    + `<td class="nc" title="${escAttr(String(d.email || ''))}">${teacherSrWhoHtml(d)}</td>`
    + `<td>${escHtml(String(d.period || '—'))}</td>`
    + `<td>${teacherSrAnswerHtml(d.lyricsOk)}</td>`
    + `<td>${teacherSrAnswerHtml(d.topicOk)}</td>`
    + `<td class="tsr-why">${why ? escHtml(why) : (anyNo ? '<i>no reason given</i>' : '')}</td>`
    + `<td class="tsr-why">${escHtml(String(d.title || ''))}</td>`
    + `<td style="white-space:nowrap">${escHtml(teacherSrStateLabel(d.state))}${d.note ? `<div class="tg-note">Note: ${escHtml(String(d.note))}</div>` : ''}</td>`
    + `<td><button type="button" class="tg-seg-btn" data-tsr-act="delete" data-tsr-id="${escAttr(String(d.id || ''))}"${busy ? ' disabled' : ''}>Delete</button></td></tr>`;
}
function teacherSrGroupHtml(g){
  const n = g.rows.length;
  const link = g.videoId ? 'https://www.youtube.com/watch?v=' + g.videoId : '';
  const name = g.title || (g.videoId ? 'YouTube video ' + g.videoId : 'A request with no valid video');
  const states = new Set(g.rows.map(r => teacherSrStateLabel(r.state)));
  const stateLine = states.size === 1 ? [...states][0] : 'Mixed: ' + [...states].join(', ');
  const busy = teacherSrBusy.has(g.key);
  const btn = (act, label) => `<button type="button" class="tg-seg-btn" data-tsr-act="${act}" data-tsr-key="${escAttr(g.key)}"${busy ? ' disabled' : ''}>${label}</button>`;
  return `<div class="tsr-group${g.waiting ? ' tsr-waiting' : ''}">`
    + `<div class="tsr-head"><div class="tsr-title">${link ? `<a href="${escAttr(link)}" target="_blank" rel="noopener noreferrer">${escHtml(name)}</a>` : escHtml(name)}`
    + ` <span class="tsr-count">${n === 1 ? '1 student asked' : `${n} students asked`}</span></div>`
    + `<div class="tsr-state">${escHtml(stateLine)}</div>`
    + `<div class="tsr-actions">${btn('adding', 'Adding it')}${btn('declined', 'Not this one')}${btn('asked', 'Back to Asked')}${btn('note', n === 1 ? 'Note to the student' : 'Note to the students')}</div></div>`
    + `<div class="t-grid-wrap"><table><thead><tr><th>When</th><th class="nc">Student</th><th>Period</th><th>Lyrics OK?</th><th>Subject OK?</th><th>Why they still want it</th><th>Title they typed</th><th>State</th><th></th></tr></thead>`
    + `<tbody>${g.rows.map(teacherSrRowHtml).join('')}</tbody></table></div></div>`;
}
function teacherSrHtml(docs){
  const groups = teacherSrGroups(docs);
  const waitingN = (docs || []).filter(d => d && teacherSrState(d.state) === 'asked').length;
  const shown = teacherSrFilter === 'all' ? groups : groups.filter(g => g.waiting);
  const seg = (f, label) => `<button type="button" class="tg-seg-btn${teacherSrFilter === f ? ' on' : ''}" data-tsr-filter="${f}" aria-pressed="${teacherSrFilter === f}">${label}</button>`;
  const head = `<div class="tg-note">${seg('waiting', `Waiting (${waitingN})`)}${seg('all', `All (${(docs || []).length})`)} <button type="button" class="tg-seg-btn" data-tsr-act="refresh">Refresh</button></div>`
    + `<div class="tg-note">Songs students asked for, one per student per week. A block's buttons set every request in it; the student sees the state on their Songs page. Delete gives a student this week's turn back.${(docs || []).length >= TEACHER_SR_READ_MAX ? ` Only the newest ${TEACHER_SR_READ_MAX} are shown.` : ''}</div>`
    + (teacherSrNote ? `<div class="tg-note"><b>${escHtml(teacherSrNote)}</b></div>` : '');
  if(!shown.length) return head + `<div class="t-loading">${teacherSrFilter === 'all' ? 'No song requests yet.' : 'No song requests waiting.'}</div>`;
  return head + shown.map(teacherSrGroupHtml).join('');
}
function teacherSrPaint(){
  const box = document.getElementById('t-grid-container');
  if(!box || teacherView !== 'songrequests' || !teacherSrDocs) return;
  box.innerHTML = teacherSrHtml(teacherSrDocs);
  teacherPaintSongRequestsBadge(teacherSrDocs.filter(d => d && teacherSrState(d.state) === 'asked').length);
}
function teacherSrFailHtml(e){
  if(e && e.code === 'permission-denied'){
    return '<div class="t-loading">Song requests are not switched on yet: their rules are not published. Paste firestore.rules into the Firebase console (Firestore Database → Rules → Publish), then press Refresh.</div>'
      + '<div class="tg-note"><button type="button" class="tg-seg-btn" data-tsr-act="refresh">Refresh</button></div>';
  }
  return '<div class="t-loading">Could not load the song requests. Check your connection and press Refresh.</div>'
    + '<div class="tg-note"><button type="button" class="tg-seg-btn" data-tsr-act="refresh">Refresh</button></div>';
}
async function renderTeacherSongRequests(){
  const box = document.getElementById('t-grid-container');
  if(!box) return;
  if(!teacherSrBound){ box.addEventListener('click', teacherSrClick); teacherSrBound = true; }
  if(teacherSrDocs && teacherView === 'songrequests') teacherSrPaint();
  else box.innerHTML = '<div class="t-loading">Loading song requests…</div>';
  const gen = ++teacherSrReadGen, wgen = teacherSrWriteGen;
  let docs;
  try{
    await ensureDb();
    const snap = await db.collection('songRequests').orderBy('createdAt', 'desc').limit(TEACHER_SR_READ_MAX).get();
    docs = snap.docs.map(d => Object.assign({}, d.data(), {id: d.id}));
  }catch(e){
    if(gen !== teacherSrReadGen) return;
    if(teacherView === 'songrequests') box.innerHTML = teacherSrFailHtml(e);
    return;
  }
  if(gen !== teacherSrReadGen) return;                 // a newer read owns the screen
  if(teacherSrWritesOpen) return;                      // the write's end reads again
  if(wgen !== teacherSrWriteGen){ renderTeacherSongRequests(); return; }   // overlapped a write: its result may be older than the screen
  teacherSrDocs = docs;
  if(teacherView === 'songrequests') teacherSrPaint();
}
function teacherSrClick(e){
  if(teacherView !== 'songrequests') return;
  const f = e.target.closest('[data-tsr-filter]');
  if(f){ teacherSrFilter = f.dataset.tsrFilter === 'all' ? 'all' : 'waiting'; teacherSrNote = ''; teacherSrPaint(); return; }
  const b = e.target.closest('[data-tsr-act]');
  if(!b || b.disabled) return;
  const act = b.dataset.tsrAct;
  if(act === 'refresh'){ teacherSrNote = ''; renderTeacherSongRequests(); return; }
  if(act === 'delete'){ teacherSrDelete(b.dataset.tsrId); return; }
  if(act === 'note'){ teacherSrSetNote(b.dataset.tsrKey); return; }
  if(Object.prototype.hasOwnProperty.call(TEACHER_SR_STATES, act)) teacherSrSetState(b.dataset.tsrKey, act);
}
function teacherSrGroupOf(key){
  return teacherSrGroups(teacherSrDocs || []).find(g => g.key === key) || null;
}
/* One batch of field-level updates for a block's requests; `fields` is
   {state} or {note}. The local copy changes only after the batch lands. */
async function teacherSrWrite(key, rows, fields, done){
  if(!rows.length) return;
  teacherSrBusy.add(key); teacherSrWritesOpen++;
  teacherSrPaint();
  let err = null;
  try{
    await ensureDb();
    const batch = db.batch();
    rows.forEach(r => batch.update(db.collection('songRequests').doc(String(r.id)), fields));
    await batch.commit();
  }catch(e){ err = e || new Error('failed'); }
  teacherSrBusy.delete(key); teacherSrWritesOpen--; teacherSrWriteGen++;
  if(!err){
    const ids = new Set(rows.map(r => String(r.id)));
    (teacherSrDocs || []).forEach(d => { if(ids.has(String(d.id))) Object.assign(d, fields); });
    teacherSrNote = done;
  } else {
    teacherSrNote = 'Nothing was saved: ' + (err.code === 'permission-denied' ? 'the rules refused it (are the song request rules published?)'
      : err.code === 'not-found' ? 'a request in this block was deleted meanwhile (the list is read again)'
      : 'a connection problem (' + String(err.code || err.message || err) + ')') + '.';
  }
  teacherSrPaint();
  if(!teacherSrWritesOpen && teacherView === 'songrequests') renderTeacherSongRequests();
}
function teacherSrSetState(key, state){
  const g = teacherSrGroupOf(key);
  if(!g || teacherSrBusy.has(key)) return;
  const rows = g.rows.filter(r => r.id && r.state !== state);
  if(!rows.length){ teacherSrNote = `Already "${teacherSrStateLabel(state)}".`; teacherSrPaint(); return; }
  teacherSrWrite(key, rows, {state}, `${rows.length === 1 ? '1 request' : rows.length + ' requests'} set to "${teacherSrStateLabel(state)}".`);
}
function teacherSrSetNote(key){
  const g = teacherSrGroupOf(key);
  if(!g || teacherSrBusy.has(key)) return;
  const cur = (g.rows.find(r => r.note) || {}).note || '';
  const typed = prompt(`A short note the student${g.rows.length === 1 ? '' : 's'} will see under the state (at most 200 letters; empty removes it):`, String(cur));
  if(typed === null) return;
  const note = srClean(typed, 200);   // app/songrequests.js: well-formed text, cut without splitting an emoji
  const rows = g.rows.filter(r => r.id && (r.note || '') !== note);
  if(!rows.length) return;
  teacherSrWrite(key, rows, {note}, note ? 'Note saved.' : 'Note removed.');
}
async function teacherSrDelete(id){
  const d = (teacherSrDocs || []).find(x => String(x.id) === String(id));
  if(!d || teacherSrBusy.has(String(id))) return;
  let thisWeek = false;
  try{ thisWeek = d.week === PM.calc.weekIdOf(PM.calc.ymd(new Date())); }catch(e){}
  if(!confirm(teacherSrDeleteText(d, thisWeek))) return;
  teacherSrBusy.add(String(id)); teacherSrWritesOpen++;
  teacherSrPaint();
  let err = null;
  try{
    await ensureDb();
    await db.collection('songRequests').doc(String(id)).delete();
  }catch(e){ err = e || new Error('failed'); }
  teacherSrBusy.delete(String(id)); teacherSrWritesOpen--; teacherSrWriteGen++;
  if(!err){
    teacherSrDocs = (teacherSrDocs || []).filter(x => String(x.id) !== String(id));
    teacherSrNote = 'Request deleted.';
  } else {
    teacherSrNote = 'Nothing was deleted: ' + (err.code === 'permission-denied' ? 'the rules refused it' : 'a connection problem (' + String(err.code || err.message || err) + ')') + '.';
  }
  teacherSrPaint();
  if(!teacherSrWritesOpen && teacherView === 'songrequests') renderTeacherSongRequests();
}

/* ── The sidebar badge: requests still waiting ── */
async function teacherRefreshSongRequestsBadge(){
  const req = ++teacherSrBadgeReq;
  let n;
  try{
    await ensureDb();
    const snap = await db.collection('songRequests').where('state', '==', 'asked').limit(TEACHER_SR_BADGE_MAX).get();
    n = snap.size;
  }catch(e){
    console.warn('[guitar-class] could not count song requests', e);
    return;   // leave whatever badge is up
  }
  if(req !== teacherSrBadgeReq) return;
  teacherPaintSongRequestsBadge(n);
}
function teacherPaintSongRequestsBadge(n){
  teacherSrBadgeReq++;   // what is on screen now wins over a count in flight
  const btn = document.querySelector('#t-side [data-view="songrequests"]');
  if(!btn) return;
  let b = btn.querySelector('.t-reports-badge');
  if(!n){
    if(b) b.remove();
    btn.removeAttribute('aria-label');
    return;
  }
  const label = n >= TEACHER_SR_BADGE_MAX ? `${TEACHER_SR_BADGE_MAX - 1}+` : String(n);
  if(!b){
    b = document.createElement('span');
    b.className = 'stu-period stu-blocked t-reports-badge';
    b.setAttribute('aria-hidden', 'true');   // the button's aria-label says it in words
    btn.appendChild(b);
  }
  b.textContent = label;
  b.title = `${label} song request${label === '1' ? '' : 's'} waiting`;
  btn.setAttribute('aria-label', `Song requests, ${label} waiting`);
}
