/* ── Accounts by sign-in domain (2026-11-13) ─────────────────────────────
   Who may use the class site once the rules let in only school accounts
   (firestore.rules isSchool(): a verified @seq.org address, OR an account on
   the allow list config/access). Jonathan, 2026-11-13: outside accounts in
   CAS are fine, and his own test accounts go through the same list; no uid
   is written in the repo.

   A block at the top of Manage, three lists:
     1. Asking to join   accessRequests/{uid}: an account that is not let in
                         pressed "Ask your teacher to let me in". Allow /
                         Decline / Delete. Two reads (review R1-6): every
                         WAITING one (status 'asked', up to 200, the badge's
                         own query), and the newest 200 of any status for the
                         answered list, so answered ones never hide a
                         waiting one.
     2. Already using the site, not @seq.org   roster accounts (progress
                         docs, teacherFetchStudents) whose saved email is not
                         @seq.org: an Allow switch each, and "Allow all in
                         CAS". The period is the student's own answer (or
                         the teacher's correction): it only helps choose.
                         Nothing here decides access from a period.
     3. Allowed, not in the roster   entries of config/access nobody above
                         explains (a test account that never saved): Remove.
   Plus a badge on the Manage item and a line at the top of the dashboard
   while any request is waiting (teacherRefreshAccessBadge: on console open,
   Refresh, coming back to the tab and the once-a-minute tick, the same
   moments as the Reports badge, which calls it).

   Decline and Delete do different things (Jonathan's lead, review R1-4):
   Decline SILENCES an account (its request stays, marked declined, and it
   cannot ask again); Delete removes the line and LETS IT ASK AGAIN (so it is
   not the button for an account that keeps asking). Delete asks first with a
   plain confirm, the same as deleting one mic recording (teacher-mic.js), and
   deletes accessRequests/{uid} only: the allow list does not change.
   Switching an account to "Locked out" (the roster row, or Remove) also marks
   its request declined, if it has one (review R1-7): otherwise its screen
   would say "asked, check back later" for good and it could not ask again.

   Reads vs writes (.claude/rules/teacher-console.md, review R1-2): a read
   that overlapped one of this tab's writes never replaces what the write
   left; it is dropped and the lists are read again once the writes settle.

   The count line is worked out from the roster the console loaded; the
   block shows when ("roster as of"), and its Refresh reads the roster again
   too (review R1-8b).

   Writes: config/access only ever by MERGING single keys (set with
   { merge: true }, FieldValue.delete() to remove), never a whole-document
   set, so two console tabs switching different accounts both land
   (tools/rules-core-test.mjs proves it on the emulator). config/class is
   not touched (its writes go only through teacherWriteConfig()).
   accessRequests: update({ status }) and delete() only.

   Every name and email here was written by a stranger (a Google account's
   own name): cleaned of control and direction characters, cut to a length,
   and escaped at the point it is drawn. No value goes into an inline
   handler: data-uid + one listener on the block.

   Before the rules for config/access and accessRequests are pasted, every
   read here is refused, and the block says so instead of showing an empty
   list. */
const TEACHER_ACCESS_REQ_MAX = 200;     // newest requests read for the list
const TEACHER_ACCESS_BADGE_MAX = 100;   // waiting requests counted for the badge ("99+")
const TEACHER_ACCESS_SCHOOL_RE = /^[^@]+@seq\.org$/i;   // mirrors firestore.rules isSchool()'s pattern
let teacherAccessAllow = null;          // { uid: true } from config/access; null = not read
let teacherAccessAllowErr = '';         // '' | 'denied' | 'failed'
let teacherAccessReqs = null;           // [{ uid, name, email, at, status }] newest first; null = not read
let teacherAccessReqErr = '';
let teacherAccessAt = 0;                // when both were last read
let teacherAccessLoading = null;        // the read in flight
let teacherAccessNote = '';             // one line after a write
let teacherAccessBusy = false;          // a write is running: a second click does nothing
let teacherAccessBadgeReq = 0;
let teacherAccessWriteGen = 0;          // bumped as each write starts: a read that began before it is stale
let teacherAccessReadOwed = false;      // a read was dropped as stale: read again once the writes settle

function teacherAccessIsSchool(email){ return TEACHER_ACCESS_SCHOOL_RE.test(String(email || '').trim()); }
/* A stranger's text, made safe to SHOW (escaping still happens at the
   interpolation point): control characters, the direction overrides and
   isolates (U+202A-202E, U+2066-2069, U+200E/F) become nothing, so a name
   cannot flip the row around it; then cut to `max` characters. */
function teacherAccessClean(s, max){
  const t = String(s == null ? '' : s).replace(/[\u0000-\u001F\u007F-\u009F\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '').trim();
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}
function teacherAccessWhen(ms){
  if(!ms) return '';
  try { return new Date(ms).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch(e){ return ''; }
}
function teacherAccessErrOf(e){ return e && e.code === 'permission-denied' ? 'denied' : 'failed'; }
/* Why a write failed, in words. "Not pasted" only when the READS were refused
   too (the rules for these documents do not exist yet); a refused write after
   good reads is the database refusing that one change (review R1-3). */
function teacherAccessWhy(e){
  if(e && e.code === 'permission-denied')
    return teacherAccessAllowErr === 'denied' ? 'the rules for the allow list are not pasted yet.' : 'the database refused this change. Press Refresh and look again.';
  return 'check your connection and try again.';
}
function teacherAccessReqOf(doc){
  const d = doc.data() || {};
  const at = d.at && typeof d.at.toMillis === 'function' ? d.at.toMillis() : 0;
  const st = d.status === 'allowed' || d.status === 'declined' ? d.status : 'asked';
  return { uid: doc.id, name: String(d.name == null ? '' : d.name), email: String(d.email == null ? '' : d.email), at, status: st };
}

function teacherAccessLoad(){
  if(teacherAccessLoading) return teacherAccessLoading;
  teacherAccessLoading = (async () => {
    await ensureDb();
    const gen = teacherAccessWriteGen;
    const [a, r, w] = await Promise.allSettled([
      db.collection('config').doc('access').get(),
      db.collection('accessRequests').orderBy('at', 'desc').limit(TEACHER_ACCESS_REQ_MAX).get(),
      db.collection('accessRequests').where('status', '==', 'asked').limit(TEACHER_ACCESS_REQ_MAX).get(),
    ]);
    /* A write started while this read was out: what it left is newer than
       anything here. Keep it, and read again when the writes settle. */
    if(gen !== teacherAccessWriteGen || teacherAccessBusy){
      if(teacherAccessBusy){ teacherAccessReadOwed = true; return 'stale'; }   // the write's end reads again
      return 'again';                                                           // the write is over: read again now
    }
    if(a.status === 'fulfilled'){
      const raw = a.value.exists ? ((a.value.data() || {}).allow || {}) : {};
      const m = {};
      Object.keys(raw && typeof raw === 'object' ? raw : {}).forEach(k => { if(raw[k] === true) m[k] = true; });
      teacherAccessAllow = m; teacherAccessAllowErr = '';
    } else { teacherAccessAllowErr = teacherAccessErrOf(a.reason); console.warn('[guitar-class] could not read config/access', a.reason); }
    if(r.status === 'fulfilled' && w.status === 'fulfilled'){
      const by = new Map();
      w.value.forEach(doc => { const q = teacherAccessReqOf(doc); by.set(q.uid, q); });
      r.value.forEach(doc => { const q = teacherAccessReqOf(doc); if(!by.has(q.uid)) by.set(q.uid, q); });
      teacherAccessReqs = [...by.values()].sort((x, y) => y.at - x.at);
      teacherAccessReqErr = '';
    } else { const why = r.status === 'rejected' ? r.reason : w.reason; teacherAccessReqErr = teacherAccessErrOf(why); console.warn('[guitar-class] could not read accessRequests', why); }
    teacherAccessAt = Date.now();
    return 'ok';
  })().catch(e => { teacherAccessAllowErr = teacherAccessReqErr = teacherAccessErrOf(e); return 'failed'; })
    /* A stale read hands its callers the NEWER read's promise (never "nothing"), so whatever they paint is current. */
    .then(res => { teacherAccessLoading = null; if(res === 'again') return teacherAccessLoad(); });
  return teacherAccessLoading;
}

/* Everything the block shows, worked out from the roster, the class settings
   (for the period) and the two reads. Pure: no DOM, no Firestore. */
function teacherAccessModel(students, cfg, allow, reqs){
  const roster = (students || []).filter(s => s && s.uid);
  const school = roster.filter(s => teacherAccessIsSchool(s.email));
  const outside = roster.filter(s => !teacherAccessIsSchool(s.email));
  const allowed = allow || {};
  const reqBy = {};
  (reqs || []).forEach(r => { reqBy[r.uid] = r; });
  const inRoster = {};
  roster.forEach(s => { inRoster[s.uid] = true; });
  const rows = outside.map(s => ({ uid: s.uid, name: s.name, email: s.email, period: String(teacherStudentPeriod(s, cfg) || ''), allowed: !!allowed[s.uid], req: reqBy[s.uid] || null }));
  const strays = Object.keys(allowed).filter(u => !inRoster[u] && !reqBy[u]);
  return {
    total: roster.length, school: school.length, outside: rows.length,
    outsideAllowed: rows.filter(r => r.allowed).length,
    lockedOut: rows.filter(r => !r.allowed).length,
    rows, strays,
    /* Exactly the badge's set (status 'asked'), allowed or not, so the badge never counts a request with no row (review R2-3). */
    waiting: (reqs || []).filter(r => r.status === 'asked'),
    decided: (reqs || []).filter(r => r.status !== 'asked'),
    casToAllow: rows.filter(r => !r.allowed && r.period === 'CAS').map(r => r.uid),
  };
}

function teacherAccessBlockHtml(){
  const head = '<div class="tg-class-lbl">Accounts by sign-in domain</div>';
  if(!allStudentsRaw) return `<div class="tg-note">${head} Loading…</div>`;
  if(teacherAccessAllowErr === 'denied' || teacherAccessReqErr === 'denied')
    return `<div class="tg-note">${head} The allow list cannot be read yet: the rules for it (config/access and accessRequests) are not pasted into the Firebase console. Everyone who can sign in still uses the site as before.</div>`;
  if(teacherAccessAllowErr || teacherAccessReqErr)
    return `<div class="tg-note">${head} Could not read the allow list. Check your connection and press Refresh. <button class="tg-seg-btn" data-access-refresh>Refresh</button></div>`;
  if(teacherAccessAllow === null || teacherAccessReqs === null) return `<div class="tg-note">${head} Loading…</div>`;
  const m = teacherAccessModel(allStudentsRaw, teacherClassConfig, teacherAccessAllow, teacherAccessReqs);
  const nm = (s, fallback) => { const c = teacherAccessClean(s, 80); return c ? `<bdi title="${escAttr(teacherAccessClean(s, 300))}">${escHtml(c)}</bdi>` : `<i>${escHtml(fallback)}</i>`; };
  const em = s => { const c = teacherAccessClean(s, 80); return c ? `<bdi title="${escAttr(teacherAccessClean(s, 320))}">${escHtml(c)}</bdi>` : '<i>no email saved</i>'; };
  const idCell = uid => `<code class="tg-acc-id">${escHtml(uid)}</code>`;
  const per = p => !p ? 'No period' : p === 'CAS' ? 'CAS' : (p === '4' || p === '7') ? 'Period ' + p : escHtml(teacherAccessClean(p, 12));
  const btn = (label, attr, uid, on) => `<button class="tg-seg-btn${on ? ' on' : ''}" ${attr} data-uid="${escAttr(uid)}"${teacherAccessBusy ? ' disabled' : ''}>${label}</button>`;
  const lines = [];
  const rosterAt = (typeof teacherStudentsAt !== 'undefined' && teacherStudentsAt) ? new Date(teacherStudentsAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';
  lines.push(`${m.total} roster account${m.total === 1 ? '' : 's'}: ${m.school} @seq.org, ${m.outside} not. Of those ${m.outside}: ${m.outsideAllowed} allowed, ${m.lockedOut} would be locked out once the rules let in only school accounts.`);
  lines.push(` <span>(Roster as of ${escHtml(rosterAt || 'the console\'s first load')}. Refresh below reads the roster and the lists again.)</span>`);
  let html = `<div class="tg-note tg-access" data-access-block>${head}<div>${lines.join('')}</div>`;
  if(teacherAccessNote) html += `<div><strong>${escHtml(teacherAccessNote)}</strong></div>`;
  /* 1. waiting requests */
  html += `<h4>Asking to join (${m.waiting.length})</h4>`;
  html += m.waiting.length
    ? `<table class="tg-table"><thead><tr><th>Name</th><th>Email</th><th>Asked</th><th>Account id</th><th></th></tr></thead><tbody>` + m.waiting.map(r =>
        `<tr><td>${nm(r.name, 'no name')}</td><td>${em(r.email)}${teacherAccessIsSchool(r.email) ? ' <strong>This is a school address: a school account should never need to ask. Check before you allow it.</strong>' : ''}</td><td>${escHtml(teacherAccessWhen(r.at))}</td><td>${idCell(r.uid)}</td>`
        + `<td><div class="tg-seg">${btn('Allow', 'data-access-decide data-state="allowed"', r.uid, false)}${btn('Decline', 'data-access-decide data-state="declined"', r.uid, false)}${btn('Delete', 'data-access-del', r.uid, false)}</div></td></tr>`).join('') + `</tbody></table>`
    : '<div>Nobody is waiting.</div>';
  if(m.waiting.length >= TEACHER_ACCESS_REQ_MAX) html += `<div>Showing ${TEACHER_ACCESS_REQ_MAX} of the waiting requests: answer some and press Refresh for the rest.</div>`;
  /* 2. roster accounts that are not @seq.org */
  html += `<h4>Already using the site, not @seq.org (${m.rows.length})</h4>`;
  if(m.rows.length){
    html += m.casToAllow.length ? `<div>${btn(`Allow all ${m.casToAllow.length} in CAS`, 'data-access-allow-cas', '', false)} The period is what the student picked (or your correction): check the names before you allow them.</div>` : '';
    html += `<table class="tg-table"><thead><tr><th>Name</th><th>Email</th><th>Period</th><th>Account id</th><th>Access</th></tr></thead><tbody>` + m.rows.map(r =>
      `<tr><td>${nm(r.name, 'no name')}</td><td>${em(r.email)}</td><td>${per(r.period)}</td><td>${idCell(r.uid)}</td>`
      + `<td><div class="tg-seg">${btn('Allowed', 'data-access-set data-state="on"', r.uid, r.allowed)}${btn('Locked out', 'data-access-set data-state="off"', r.uid, !r.allowed)}</div></td></tr>`).join('') + `</tbody></table>`;
  } else html += '<div>Every roster account is @seq.org.</div>';
  /* 3. decided requests, and allowed accounts nobody above explains */
  const decided = m.decided.filter(r => !m.rows.some(x => x.uid === r.uid));
  if(decided.length){
    html += `<h4>Answered requests (${decided.length})</h4><table class="tg-table"><thead><tr><th>Name</th><th>Email</th><th>Asked</th><th>Account id</th><th>Access</th></tr></thead><tbody>` + decided.map(r => {
      const on = !!teacherAccessAllow[r.uid];
      return `<tr><td>${nm(r.name, 'no name')}</td><td>${em(r.email)}</td><td>${escHtml(teacherAccessWhen(r.at))}</td><td>${idCell(r.uid)}</td>`
        + `<td><div class="tg-seg">${btn('Allowed', 'data-access-decide data-state="allowed"', r.uid, on)}${btn('Declined', 'data-access-decide data-state="declined"', r.uid, !on)}${btn('Delete', 'data-access-del', r.uid, false)}</div></td></tr>`;
    }).join('') + `</tbody></table>`;
  }
  if(m.strays.length){
    html += `<h4>Allowed, not in the roster (${m.strays.length})</h4><div>Accounts on the allow list that have not saved anything yet (a test account, say).</div><table class="tg-table"><tbody>`
      + m.strays.map(u => `<tr><td>${idCell(u)}</td><td>${btn('Remove', 'data-access-set data-state="off"', u, false)}</td></tr>`).join('') + `</tbody></table>`;
  }
  html += `<div>@seq.org accounts always get in. An account that is not @seq.org gets in only when it is Allowed here. Email is what each student's own page saved; an account with no saved email is listed as not @seq.org. <button class="tg-seg-btn" data-access-refresh>Refresh</button></div></div>`;
  return html;
}

/* A write is over: if a read was dropped while it ran, read again now. */
function teacherAccessWriteDone(){
  teacherAccessBusy = false;
  if(teacherAccessReadOwed){ teacherAccessReadOwed = false; teacherAccessLoad().then(() => { teacherAccessPaint(); teacherRefreshAccessBadge(); }); }
}
function teacherAccessWriteStart(){ teacherAccessBusy = true; teacherAccessWriteGen++; teacherAccessNote = ''; teacherAccessPaint(); }
/* Called by renderTeacherManage after it draws: fills the placeholder from
   what is in memory, then reads again when that is over 15 s old. */
function teacherAccessMount(){
  const el = document.getElementById('t-access-block');
  if(!el) return;
  teacherAccessPaint();
  if(!teacherAccessLoading && Date.now() - teacherAccessAt > 15000) teacherAccessLoad().then(teacherAccessPaint);
}
function teacherAccessPaint(){
  const el = document.getElementById('t-access-block');
  if(!el || teacherView !== 'manage') return;
  el.innerHTML = teacherAccessBlockHtml();
  if(!el.dataset.bound){
    el.dataset.bound = '1';
    el.addEventListener('click', e => {
      const t = e.target && e.target.closest ? e.target : null;
      if(!t) return;
      const set = t.closest('[data-access-set]');
      if(set){ teacherAccessSet([set.dataset.uid], set.dataset.state === 'on'); return; }
      const dec = t.closest('[data-access-decide]');
      if(dec){ teacherAccessDecide(dec.dataset.uid, dec.dataset.state); return; }
      if(t.closest('[data-access-allow-cas]')){ teacherAccessAllowCas(); return; }
      const del = t.closest('[data-access-del]');
      if(del){ teacherAccessDeleteRequest(del.dataset.uid); return; }
      if(t.closest('[data-access-refresh]')){ teacherAccessRefreshAll(); }
    });
  }
}

/* The block's Refresh: the allow list, the requests AND the roster the count line is worked out from. */
function teacherAccessRefreshAll(){
  teacherAccessNote = '';
  const roster = (typeof teacherRefreshStudents === 'function') ? Promise.resolve(teacherRefreshStudents({ manual: true })).catch(() => {}) : Promise.resolve();
  Promise.all([teacherAccessLoad(), roster]).then(() => { teacherAccessPaint(); teacherRefreshAccessBadge(); });
}
/* One merge write to config/access, one key per account: allow.<uid> = true,
   or FieldValue.delete() to switch it off. */
async function teacherAccessWrite(uids, on){
  await ensureDb();
  const fv = firebase.firestore.FieldValue;
  const allow = {};
  uids.forEach(u => { allow[u] = on ? true : fv.delete(); });
  await db.collection('config').doc('access').set({ allow }, { merge: true });
  uids.forEach(u => { if(on) teacherAccessAllow[u] = true; else delete teacherAccessAllow[u]; });
}
async function teacherAccessSet(uids, on){
  if(teacherAccessBusy || !uids.length || !teacherAccessAllow) return;
  /* Locked out: only the accounts that ARE on the list are written (a merge
     holding nothing but deletes, before the list exists, is refused: review
     R1-3); and each one's request, if it has one not yet declined, is marked
     declined (review R1-7). */
  const write = on ? uids : uids.filter(u => teacherAccessAllow[u]);
  const decline = on ? [] : (teacherAccessReqs || []).filter(x => x.status !== 'declined' && uids.includes(x.uid));
  if(!write.length && !decline.length) return;
  teacherAccessWriteStart();
  let step = 'list';
  try{
    if(write.length) await teacherAccessWrite(write, on);
    step = 'requests';
    /* An account allowed from the roster list that had also asked: its
       request says "allowed" too, so it leaves the waiting list and the badge.
       A request this tab has not read yet (it came in while the block was
       open) is looked up first (review R2-3). */
    if(on) for(const u of uids){
      let r = (teacherAccessReqs || []).find(x => x.uid === u);
      if(!r){
        const snap = await db.collection('accessRequests').doc(u).get();
        if(snap.exists){ r = teacherAccessReqOf(snap); if(teacherAccessReqs) teacherAccessReqs.push(r); }
      }
      if(r && r.status === 'asked'){
        await db.collection('accessRequests').doc(u).update({ status: 'allowed' });
        r.status = 'allowed';
      }
    }
    for(const r of decline){
      await db.collection('accessRequests').doc(r.uid).update({ status: 'declined' });
      r.status = 'declined';
    }
    teacherAccessNote = (on ? 'Allowed ' : 'Locked out ') + uids.length + ' account' + (uids.length === 1 ? '' : 's') + '.';
  }catch(e){
    console.warn('[guitar-class] access change failed', e);
    teacherAccessNote = step === 'list'
      ? 'Nothing was saved: ' + teacherAccessWhy(e)
      : (on ? 'Allowed, but its request could not be marked allowed, so it is still listed under Asking to join: press Allow there to clear it. ' : 'Locked out, but a request could not be marked declined, so that student\'s screen still says it is waiting: ') + teacherAccessWhy(e);
  }
  teacherAccessWriteDone();
  teacherAccessPaint();
  teacherRefreshAccessBadge();
}
/* Allow: the allow list first (that is what lets the account in), then the
   request's status (what the asker's screen says). Decline: the status, and
   off the allow list if it was on it. */
async function teacherAccessDecide(uid, state){
  if(teacherAccessBusy || !uid || !teacherAccessAllow || (state !== 'allowed' && state !== 'declined')) return;
  teacherAccessWriteStart();
  try{
    if(state === 'allowed') await teacherAccessWrite([uid], true);
    else if(teacherAccessAllow[uid]) await teacherAccessWrite([uid], false);
    const req = (teacherAccessReqs || []).find(r => r.uid === uid);
    if(req && req.status !== state){
      await db.collection('accessRequests').doc(uid).update({ status: state });
      req.status = state;
    }
    teacherAccessNote = state === 'allowed' ? 'Allowed. The student gets in when their page checks again (a click on "Check again", or coming back to the tab).' : 'Declined. That account stays locked out and cannot ask again (unless you Delete its request).';
  }catch(e){
    console.warn('[guitar-class] access decision failed', e);
    teacherAccessNote = 'Not fully saved: ' + teacherAccessWhy(e);
  }
  teacherAccessWriteDone();
  teacherAccessPaint();
  teacherRefreshAccessBadge();
}
/* Delete one request (accessRequests/{uid}), after a plain confirm. Never
   touches the allow list. */
async function teacherAccessDeleteRequest(uid){
  if(teacherAccessBusy || !uid) return;
  const req = (teacherAccessReqs || []).find(r => r.uid === uid);
  if(!req) return;
  const who = teacherAccessClean(req.name, 80) || teacherAccessClean(req.email, 80) || 'this account';
  if(!confirm(`Delete the request from ${who}?\n\nThis does not change whether the account is allowed. It may ask again.\nTo stop this account asking again, press Decline and leave the request.`)) return;
  teacherAccessWriteStart();
  try{
    await ensureDb();
    await db.collection('accessRequests').doc(uid).delete();
    teacherAccessReqs = (teacherAccessReqs || []).filter(r => r.uid !== uid);
    teacherAccessNote = 'Request deleted. The allow list did not change.';
  }catch(e){
    console.warn('[guitar-class] access request delete failed', e);
    teacherAccessNote = 'Not deleted: ' + teacherAccessWhy(e);
  }
  teacherAccessWriteDone();
  teacherAccessPaint();
  teacherRefreshAccessBadge();
}
function teacherAccessAllowCas(){
  if(!teacherAccessAllow) return;
  const m = teacherAccessModel(allStudentsRaw, teacherClassConfig, teacherAccessAllow, teacherAccessReqs);
  if(!m.casToAllow.length) return;
  if(!confirm(`Allow ${m.casToAllow.length} account${m.casToAllow.length === 1 ? '' : 's'} listed in CAS that ${m.casToAllow.length === 1 ? 'is' : 'are'} not @seq.org?\n\nA student picks their own period, so check the names in the list first.`)) return;
  teacherAccessSet(m.casToAllow, true);
}

/* The waiting count: a badge on Manage and a line above the dashboard. One
   query, equality only (no composite index), at most TEACHER_ACCESS_BADGE_MAX
   documents read. A failed or refused read leaves things as they are. */
async function teacherRefreshAccessBadge(){
  const req = ++teacherAccessBadgeReq;
  let n;
  try{
    await ensureDb();
    const snap = await db.collection('accessRequests').where('status', '==', 'asked').limit(TEACHER_ACCESS_BADGE_MAX).get();
    n = snap.size;
  }catch(e){ return; }
  if(req !== teacherAccessBadgeReq) return;
  teacherPaintAccessBadge(n);
}
function teacherPaintAccessBadge(n){
  const label = n >= TEACHER_ACCESS_BADGE_MAX ? `${TEACHER_ACCESS_BADGE_MAX - 1}+` : String(n);
  const btn = document.querySelector('#t-side [data-view="manage"]');
  if(btn){
    let b = btn.querySelector('.t-access-badge');
    if(!n){ if(b) b.remove(); btn.removeAttribute('aria-label'); }
    else {
      if(!b){ b = document.createElement('span'); b.className = 'stu-period stu-blocked t-access-badge'; b.setAttribute('aria-hidden', 'true'); btn.appendChild(b); }
      b.textContent = label;
      b.title = `${label} asking to join`;
      btn.setAttribute('aria-label', `Manage, ${label} asking to join`);
    }
  }
  let line = document.getElementById('t-access-alert');
  const summ = document.getElementById('t-summary');
  if(!n){ if(line) line.remove(); return; }
  if(!line && summ && summ.parentNode){
    line = document.createElement('div');
    line.id = 't-access-alert';
    line.className = 'tg-note';
    line.setAttribute('role', 'status');
    summ.parentNode.insertBefore(line, summ);
    line.addEventListener('click', e => { if(e.target && e.target.closest && e.target.closest('[data-access-open]')) setTeacherView('manage'); });
  }
  if(line) line.innerHTML = `<strong>${escHtml(label)} account${n === 1 ? ' is' : 's are'} asking to join.</strong> <button class="tg-seg-btn" data-access-open>Open Manage</button>`;
}
