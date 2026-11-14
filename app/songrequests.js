/* ══════════ Song requests (2026-11-13) ══════════
   Jonathan, 2026-11-13: "can we build in a mechanism for students to request a
   song? it should ask for a link to the youtube video and two yes/no
   questions: are the lyrics appropriate and is the subject matter
   appropriate". A No still sends, with a short box where the student says why
   (a clean version exists, say). Later the same day: one request per student
   per week.

   WHERE: the top of the Songs page (renderSongsHub in app/explore.js draws
   the slot #sr-slot and calls srLoad()). One box: a line, the "Request a
   song" button (or, once this week's request is in, when the student can ask
   again), and the student's own requests with their state.

   THE DOC: songRequests/<uid>_<week>, one per student per ISO week (the week
   practice minutes uses: PM.calc, Monday first, the student's local date).
   firestore.rules "SONG REQUESTS" pins the shape, makes the doc create-only for
   students (a second request the same week is refused) and lets the teacher
   change only `state` and `note`. The page sends the 11-character video id
   and the one link built from it (srParseYouTube); pasted text is never
   stored as a link, and nothing here fetches YouTube.

   STATES the student sees: asked → "Asked", adding → "Your teacher is adding
   it", declined → "Not this one" (teacher-songrequests.js sets them).

   ON A SHARED CHROMEBOOK: the list lives in memory only (srState), tagged with
   the uid it was read for and drawn only for that uid; nothing goes to
   localStorage or sessionStorage. Sign-out reloads the page.

   NOT OPEN YET: until the rules block is published, the list read is refused
   (permission-denied) and the box says requests are not open yet, with no
   button. The dev bypass cannot send (nothing saves), as with the live game.
   A paused student never sees the Songs page (showPausedScreen), and the
   Songs button is hidden behind the activity gate (data-gate="hide"). */
const SR_LINK_MAX = 500;
const SR_WHY_MAX = 200;
const SR_TITLE_MAX = 80;
const SR_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'];
const SR_ID_RE = /^[A-Za-z0-9_-]{11}$/;

/* A pasted YouTube link → { id, url } (url = the one link this site stores),
   or null. Accepts youtube.com/watch?v=, youtu.be/, youtube.com/shorts/,
   /embed/ and /live/, on www., m. and music., with or without https://, with
   any extra parameters (si=, t=, list=, feature=). Refuses anything else: a
   scheme other than http(s), a user name or port, a host that only looks like
   YouTube, white space inside the link, a playlist or channel with no video. */
function srParseYouTube(raw){
  let s = String(raw == null ? '' : raw).trim();
  if(!s || s.length > SR_LINK_MAX || /\s/.test(s)) return null;
  if(!/^[a-z][a-z0-9+.-]*:/i.test(s)) s = 'https://' + s;
  let u;
  try{ u = new URL(s); }catch(e){ return null; }
  if(u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  if(u.username || u.password || u.port) return null;
  const host = u.hostname.toLowerCase();
  let id = '';
  if(host === 'youtu.be'){
    const m = /^\/([^/]+)\/?$/.exec(u.pathname);
    id = m ? m[1] : '';
  } else if(SR_HOSTS.includes(host)){
    if(/^\/watch\/?$/.test(u.pathname)) id = u.searchParams.get('v') || '';
    else { const m = /^\/(?:shorts|embed|live)\/([^/]+)\/?$/.exec(u.pathname); id = m ? m[1] : ''; }
  } else return null;
  if(!SR_ID_RE.test(id)) return null;
  return { id, url: 'https://www.youtube.com/watch?v=' + id };
}

/* Well-formed text only (Firestore retries a string with half an emoji for
   ever, and the save queued behind it never lands), cut to n UTF-16 units
   without splitting a pair. */
function srClean(s, n){
  s = String(s == null ? '' : s).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g, m => m.length === 2 ? m : '�')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '�').trim();
  if(s.length <= n) return s;
  s = s.slice(0, n);
  if(/[\uD800-\uDBFF]$/.test(s)) s = s.slice(0, -1);
  return s.trim();
}

/* The form's rules, as a pure function: { link, lyricsOk, topicOk, why,
   title } (each answer true, false or null for not answered) →
   { err: i18n key } or { ok: true, video, lyricsOk, topicOk, why, title }.
   A No on either question needs a why; with two Yes answers the why box is
   hidden and anything typed in it is dropped. */
function srCheckForm(f){
  f = f || {};
  if(!String(f.link == null ? '' : f.link).trim()) return { err: 'sr.errNoLink' };
  const video = srParseYouTube(f.link);
  if(!video) return { err: 'sr.errBadLink' };
  if(typeof f.lyricsOk !== 'boolean' || typeof f.topicOk !== 'boolean') return { err: 'sr.errAnswer' };
  const bothYes = f.lyricsOk && f.topicOk;
  const why = bothYes ? '' : srClean(f.why, SR_WHY_MAX);
  if(!bothYes && !why) return { err: 'sr.errWhy' };
  return { ok: true, video, lyricsOk: f.lyricsOk, topicOk: f.topicOk, why, title: srClean(f.title, SR_TITLE_MAX) };
}

/* This week's id ('2026-W47') and the day the next one starts, from the
   student's local date, through practice minutes' own calendar maths. */
function srWeekNow(){
  try{ return PM.calc.weekIdOf(PM.calc.ymd(new Date())); }catch(e){ return ''; }
}
function srNextWeekDay(week){
  try{
    const d = PM.calc.weekMonday(PM.calc.weekAdd(week, 1));
    return d.toLocaleDateString(getLang() === 'es' ? 'es' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }catch(e){ return ''; }
}

/* uid: whose list this is. status: idle · loading · ready · closed (the rules
   refuse the read: not published yet) · failed (a connection problem). */
let srState = { uid: '', status: 'idle', list: [] };
let srLoadGen = 0;
function srCanSend(){
  return !!(firebaseReady && currentUser && !isDevBypassUser() && !(typeof IS_TEACHER_MODE !== 'undefined' && IS_TEACHER_MODE));
}
function srMine(){
  return (currentUser && srState.uid === currentUser.uid) ? srState : { uid: '', status: 'idle', list: [] };
}
function srThisWeek(list){
  const w = srWeekNow();
  return w ? (list || []).find(r => r.week === w) || null : null;
}
function srStateLabel(state){
  return t(state === 'adding' ? 'sr.stateAdding' : state === 'declined' ? 'sr.stateDeclined' : 'sr.stateAsked');
}
/* The student's own requests, newest week first, at most SR_LIST_SHOWN (the
   box sits above the Core songs). Every value is escaped: the title and the
   note are typed text. The link is rebuilt from the video id. */
const SR_LIST_SHOWN = 5;
function srListHtml(list){
  if(!list.length) return '';
  const rows = list.slice(0, SR_LIST_SHOWN).map(r => {
    const id = SR_ID_RE.test(String(r.videoId || '')) ? r.videoId : '';
    const name = r.title ? escHtml(r.title) : escHtml(t('sr.untitled'));
    const link = id ? `<a href="${escAttr('https://www.youtube.com/watch?v=' + id)}" target="_blank" rel="noopener noreferrer">${name}</a>` : name;
    const st = r.state === 'adding' || r.state === 'declined' ? r.state : 'asked';
    const note = r.note ? `<div class="sr-note">${escHtml(t('sr.note', { note: r.note }))}</div>` : '';
    return `<li class="sr-item"><span class="sr-item-name">${link}</span><span class="sr-state sr-state-${st}">${escHtml(srStateLabel(st))}</span>${note}</li>`;
  }).join('');
  return `<div class="sr-mine-title">${escHtml(t('sr.mineTitle'))}</div><ul class="sr-list">${rows}</ul>`;
}
function srSlotHtml(){
  if(isDevBypassUser()) return `<div class="sr-line">${escHtml(t('sr.intro'))}</div><p class="coach-tip">${escHtml(t('sr.devBypass'))}</p>`;
  if(!srCanSend()) return '';
  const s = srMine();
  if(s.status === 'idle' || s.status === 'loading') return `<div class="sr-line">${escHtml(t('sr.loading'))}</div>`;
  if(s.status === 'closed') return `<div class="sr-line">${escHtml(t('sr.closed'))}</div>`;
  if(s.status === 'failed') return `<div class="sr-line">${escHtml(t('sr.loadFailed'))}</div>`;
  const mine = srThisWeek(s.list);
  const head = mine
    ? `<div class="sr-line">${escHtml(t('sr.weekUsed', { day: srNextWeekDay(mine.week) }))}</div>`
    : `<div class="sr-head"><div class="sr-line">${escHtml(t('sr.intro'))}</div><button type="button" class="panel-next-btn" id="sr-open-btn" onclick="srOpen()">${escHtml(t('sr.btn'))}</button></div>`;
  return head + srListHtml(s.list);
}
function srPaint(){
  const slot = document.getElementById('sr-slot');
  if(!slot) return;
  const html = srSlotHtml();
  slot.innerHTML = html;
  slot.hidden = !html;
}
/* Reads the student's own requests (one equality on uid: no composite index)
   and repaints the slot. A newer load drops an older one's answer. */
async function srLoad(){
  if(!srCanSend()){ srPaint(); return; }
  const uid = currentUser.uid, gen = ++srLoadGen;
  if(srState.uid !== uid) srState = { uid, status: 'loading', list: [] };
  else if(srState.status !== 'ready') srState.status = 'loading';
  srPaint();
  let list, status = 'ready';
  try{
    await ensureDb();
    const snap = await db.collection('songRequests').where('uid', '==', uid).get();
    list = [];
    snap.forEach(d => list.push(Object.assign({ id: d.id }, d.data())));
    list.sort((a, b) => String(b.week || '').localeCompare(String(a.week || '')));
  }catch(e){
    status = (e && e.code === 'permission-denied') ? 'closed' : 'failed';
  }
  if(gen !== srLoadGen || !currentUser || currentUser.uid !== uid) return;
  srState = { uid, status, list: list || (srState.uid === uid ? srState.list : []) };
  srPaint();
  return status;
}

/* ── The form ── */
let srCloseTimer = null;
function srFormHtml(){
  const yn = (name, key) => `<fieldset class="sr-q"><legend>${escHtml(t(key))}</legend>`
    + `<label class="sr-yn"><input type="radio" name="${name}" value="yes" onchange="srFormSync()"> <span>${escHtml(t('sr.yes'))}</span></label>`
    + `<label class="sr-yn"><input type="radio" name="${name}" value="no" onchange="srFormSync()"> <span>${escHtml(t('sr.no'))}</span></label></fieldset>`;
  return `<div class="daily5-head"><h3 id="sr-title" style="font:inherit;margin:0">${escHtml(t('sr.btn'))}</h3><button type="button" class="tp-close" onclick="srClose()" aria-label="${escAttr(t('sr.closeAria'))}">&#x2715;</button></div>
    <label class="sr-label" for="sr-link">${escHtml(t('sr.linkLabel'))}</label>
    <input id="sr-link" class="sr-input" type="text" inputmode="url" autocomplete="off" spellcheck="false" maxlength="${SR_LINK_MAX}" placeholder="https://www.youtube.com/watch?v=…">
    <label class="sr-label" for="sr-song">${escHtml(t('sr.songLabel'))}</label>
    <input id="sr-song" class="sr-input" type="text" autocomplete="off" maxlength="${SR_TITLE_MAX}">
    ${yn('sr-lyrics', 'sr.qLyrics')}
    ${yn('sr-topic', 'sr.qTopic')}
    <div id="sr-why-box" hidden>
      <label class="sr-label" for="sr-why">${escHtml(t('sr.whyLabel'))}</label>
      <textarea id="sr-why" class="reflection-ta" rows="3" maxlength="${SR_WHY_MAX}" placeholder="${escAttr(t('sr.whyPlaceholder'))}"></textarea>
    </div>
    <div class="issue-status" id="sr-status" aria-live="polite"></div>
    <div class="issue-actions"><button type="button" class="panel-next-btn" id="sr-send-btn" onclick="srSend()">${escHtml(t('sr.send'))}</button></div>`;
}
function srOpen(){
  if(!srCanSend()) return;
  srClose();
  const ov = document.createElement('div');
  ov.className = 'daily5-overlay';
  ov.id = 'sr-overlay';
  ov.innerHTML = `<div class="daily5-modal sr-modal" role="dialog" aria-modal="true" aria-labelledby="sr-title">${srFormHtml()}</div>`;
  ov.addEventListener('click', e => { if(e.target === ov) srClose(); });
  document.body.appendChild(ov);
  document.addEventListener('keydown', srEscClose);
  openOverlay(ov, document.getElementById('sr-link'));
}
function srEscClose(e){ if(e.key === 'Escape') srClose(); }
function srClose(){
  clearTimeout(srCloseTimer); srCloseTimer = null;
  const ov = document.getElementById('sr-overlay');
  if(!ov) return;
  ov.remove();
  document.removeEventListener('keydown', srEscClose);
  closeOverlay();
}
function srAnswer(name){
  const el = document.querySelector(`#sr-overlay input[name="${name}"]:checked`);
  return el ? el.value === 'yes' : null;
}
/* The why box shows only when either answer is No. */
function srFormSync(){
  const box = document.getElementById('sr-why-box');
  if(!box) return;
  const show = srAnswer('sr-lyrics') === false || srAnswer('sr-topic') === false;
  box.hidden = !show;
}
function srSay(key, kind, params){
  const st = document.getElementById('sr-status');
  if(st){ st.textContent = key ? t(key, params) : ''; st.className = 'issue-status' + (kind ? ' ' + kind : ''); }
}
async function srSend(){
  const linkEl = document.getElementById('sr-link');
  const btn = document.getElementById('sr-send-btn');
  if(!linkEl || !btn || btn.disabled || !srCanSend()) return;
  const f = srCheckForm({
    link: linkEl.value, lyricsOk: srAnswer('sr-lyrics'), topicOk: srAnswer('sr-topic'),
    why: (document.getElementById('sr-why') || {}).value, title: (document.getElementById('sr-song') || {}).value,
  });
  if(f.err){ srSay(f.err, 'err'); return; }
  const week = srWeekNow();
  if(!week){ srSay('sr.errFailed', 'err'); return; }
  const uid = currentUser.uid;
  const period = periodOverride || studentPeriod || '';
  const doc = {
    uid, name: srClean(currentUser.displayName, 200), email: srClean(currentUser.email, 200),
    period: ['4', '7', 'CAS'].includes(period) ? period : '',
    week, videoId: f.video.id, url: f.video.url, lyricsOk: f.lyricsOk, topicOk: f.topicOk,
    why: f.why, title: f.title, createdAt: firebase.firestore.FieldValue.serverTimestamp(), state: 'asked',
  };
  btn.disabled = true; btn.textContent = t('sr.sending');
  srSay('', '');
  /* As the problem report: no retry timer (a write cannot be cancelled, so a
     second press could only be refused as a second request this week); the
     button stays off and after 10 s the line says it is still on its way.
     `cancelled`: the form was closed or replaced. */
  const cancelled = () => !document.contains(linkEl);
  const slowT = setTimeout(() => { if(!cancelled()) srSay('sr.stillSending', ''); }, 10000);
  let err = null;
  try{
    await ensureDb();
    await db.collection('songRequests').doc(uid + '_' + week).set(doc);
  }catch(e){ err = e || new Error('failed'); }
  clearTimeout(slowT);
  if(err){
    /* Refused by the rules: this week's request is already in, the rules are
       not published yet, or this device's date is off by more than a day.
       The student's own list tells the three apart. */
    let key = 'sr.errFailed';
    if(err.code === 'permission-denied'){
      const status = await srLoad();
      key = status === 'closed' ? 'sr.closed' : srThisWeek(srMine().list) ? 'sr.errAlready' : status === 'ready' ? 'sr.errDate' : 'sr.errFailed';
    }
    if(cancelled() || !currentUser || currentUser.uid !== uid) return;
    srSay(key, 'err');
    if(key === 'sr.errFailed' || key === 'sr.errDate'){ btn.disabled = false; btn.textContent = t('sr.send'); }
    else btn.remove();
    return;
  }
  if(currentUser && currentUser.uid === uid){
    const s = srMine();
    srState = { uid, status: 'ready', list:[Object.assign({}, doc, { id: uid + '_' + week, createdAt: null })].concat(s.list.filter(r => r.week !== week)) };
    srPaint();
  }
  if(cancelled()) return;
  srSay('sr.sent', 'ok');
  btn.remove();
  ['sr-link', 'sr-song', 'sr-why'].forEach(id => { const el = document.getElementById(id); if(el) el.disabled = true; });
  document.querySelectorAll('#sr-overlay input[type="radio"]').forEach(el => { el.disabled = true; });
  clearTimeout(srCloseTimer);
  srCloseTimer = setTimeout(srClose, 2500);
}
