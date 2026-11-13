/* ── Error log view (2026-11-13) ─────────────────────────────────────────
   What the site's safety net caught on students' (and this console's)
   devices: one anonymous siteErrors/{autoId} doc per error, written by
   SITE_ERRORS in app/boot.js (at most 5 per page load, each message once).
   A doc holds kind, message, file, line, col, stack (top 3 frames), page,
   version, day, lang: no uid, no name, no time finer than the day.

   This view reads the newest TEACHER_ERRORS_READ_MAX docs (by day) dated no
   later than the latest day the rules accept (teacherErrorsLatestDay()),
   groups them by message, newest day first, and shows a count per day, the
   pages, versions and places seen, and the stack top on demand. A doc dated
   later is impossible (a wrong clock, or written by hand before the rules
   checked the day): it is left out and counted in one line, so a pile of
   them can never hide the real ones. "Delete older than 30 days" removes
   every doc whose day is before the cutoff, and every impossible one, after a
   confirm. Every value here was written by a student's device: it is
   untrusted and escaped at the point it is drawn (escHtml / escAttr), and no
   value is ever put inside an inline handler.

   Needs the siteErrors block of firestore.rules pasted into the Firebase
   console. Until then every read is refused, and the view says so. */
const TEACHER_ERRORS_READ_MAX = 1000;
const TEACHER_ERRORS_KEEP_DAYS = 30;
let teacherErrorsNote = '';      // one line shown above the list after a delete
let teacherErrorsBusy = false;   // a delete is running: a second click does nothing

/* YYYY-MM-DD, this computer's date, n days before today. */
function teacherErrorsDay(n){
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
/* The latest day firestore.rules "ERROR LOG" accepts: tomorrow by the UTC
   date (the rules allow a device's date one day either side of it). */
function teacherErrorsLatestDay(){
  return new Date(Date.now() + 86400000).toISOString().slice(0, 10);
}
/* Groups docs by kind + message. Each group: the newest day, the total, a
   count per day (newest first), and the distinct pages, versions, places
   (file:line:col), languages and stack tops, each with its count. Groups are
   newest day first, then the biggest. Every field is coerced to a string or
   number here, so a doc of the wrong shape cannot throw. */
function teacherErrorGroups(docs){
  const by = new Map();
  const bump = (m, k) => m.set(k, (m.get(k) || 0) + 1);
  for(const raw of docs || []){
    const d = raw && typeof raw === 'object' ? raw : {};
    const kind = d.kind === 'rejection' ? 'rejection' : 'error';
    const msg = String(d.message == null ? '' : d.message);
    const key = kind + '\u0000' + msg;
    let g = by.get(key);
    if(!g){ g = { kind, message: msg, total: 0, newest: '', days: new Map(), pages: new Map(), versions: new Map(), places: new Map(), langs: new Map(), stacks: new Map() }; by.set(key, g); }
    const day = String(d.day == null ? '' : d.day);
    g.total++;
    if(day > g.newest) g.newest = day;
    bump(g.days, day || '—');
    bump(g.pages, String(d.page == null ? '' : d.page) || '—');
    bump(g.versions, String(d.version == null ? '' : d.version) || '—');
    const file = String(d.file == null ? '' : d.file);
    bump(g.places, file ? file + ':' + (Number(d.line) || 0) + ':' + (Number(d.col) || 0) : '—');
    bump(g.langs, String(d.lang == null ? '' : d.lang) || '—');
    const st = String(d.stack == null ? '' : d.stack);
    if(st) bump(g.stacks, st);
  }
  return [...by.values()].sort((a, b) => (a.newest < b.newest ? 1 : a.newest > b.newest ? -1 : b.total - a.total));
}
/* "a ×3 · b ×1": a count map, biggest first, at most `max` entries. */
function teacherErrorsCounts(m, max, byKeyDesc){
  const list = [...m.entries()].sort(byKeyDesc ? (a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0) : (a, b) => b[1] - a[1]);
  const shown = list.slice(0, max).map(([k, n]) => `${escHtml(k)} <b>×${n}</b>`).join(' · ');
  return list.length > max ? `${shown} · <i>+${list.length - max} more</i>` : shown;
}
function teacherErrorsHtml(docs, more, future, latest){
  const groups = teacherErrorGroups(docs);
  const head = `<div class="tg-note">
      <button class="tg-seg-btn" onclick="renderTeacherErrors()">Refresh</button>
      <button class="tg-seg-btn" onclick="teacherErrorsDeleteOld()">Delete older than ${TEACHER_ERRORS_KEEP_DAYS} days</button>
    </div>
    <div class="tg-note">Errors the site hit on students' devices (and on this console), with no names: at most 5 per page load, each message once per load. A count is page loads that hit it.${more ? ` More than ${TEACHER_ERRORS_READ_MAX} are logged: only the newest ${TEACHER_ERRORS_READ_MAX} are counted here, so the counts on the oldest day shown may be low.` : ''}</div>`
    + (future ? `<div class="tg-note">${future >= TEACHER_ERRORS_READ_MAX ? `${TEACHER_ERRORS_READ_MAX} or more entries` : future === 1 ? '1 entry' : `${future} entries`} with an impossible date (after ${escHtml(latest || '')}) ${future === 1 ? 'was' : 'were'} hidden. "Delete older than ${TEACHER_ERRORS_KEEP_DAYS} days" deletes them too.</div>` : '')
    + (teacherErrorsNote ? `<div class="tg-note"><b>${escHtml(teacherErrorsNote)}</b></div>` : '');
  if(!groups.length) return head + '<div class="t-loading">No errors logged.</div>';
  const rows = groups.map(g => {
    const stacks = [...g.stacks.entries()].sort((a, b) => b[1] - a[1]);
    const stackCell = stacks.length
      ? `<details><summary>Stack top (${stacks.length})</summary>${stacks.slice(0, 5).map(([s, n]) => `<pre style="white-space:pre-wrap;word-break:break-all;margin:6px 0;font-size:12px">${escHtml(s)}${stacks.length > 1 ? `\n<b>×${n}</b>` : ''}</pre>`).join('')}${stacks.length > 5 ? `<i>+${stacks.length - 5} more</i>` : ''}</details>`
      : '—';
    return `<tr><td style="max-width:420px;word-break:break-word"><b>${escHtml(g.message)}</b><br><span class="tg-note">${g.kind === 'rejection' ? 'Unhandled promise rejection' : 'Error'} · ${teacherErrorsCounts(g.places, 3)}</span></td>`
      + `<td>${g.total}</td>`
      + `<td style="white-space:nowrap">${teacherErrorsCounts(g.days, 7, true).split(' · ').join('<br>')}</td>`
      + `<td style="word-break:break-word">${teacherErrorsCounts(g.pages, 5)}</td>`
      + `<td style="word-break:break-word">${teacherErrorsCounts(g.versions, 4)}<br><span class="tg-note">${teacherErrorsCounts(g.langs, 2)}</span></td>`
      + `<td style="max-width:360px">${stackCell}</td></tr>`;
  }).join('');
  return head + `<div class="t-grid-wrap"><table><thead><tr><th>Message</th><th>Total</th><th>Days</th><th>Pages</th><th>Versions · language</th><th>Stack</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
/* A refused read or delete before the rules are published comes back as
   permission-denied; anything else is a connection problem. */
function teacherErrorsFailHtml(e, what){
  if(e && e.code === 'permission-denied'){
    return '<div class="t-loading">The error log is not switched on yet: its rules are not published. Paste firestore.rules into the Firebase console (Firestore Database → Rules → Publish), then press Refresh.</div>';
  }
  return `<div class="t-loading">Could not ${escHtml(what)} the error log. Check your connection and press Refresh.</div>`
    + '<div class="tg-note"><button class="tg-seg-btn" onclick="renderTeacherErrors()">Refresh</button></div>';
}
async function renderTeacherErrors(){
  const box = document.getElementById('t-grid-container');
  if(!box) return;
  box.innerHTML = '<div class="t-loading">Loading the error log…</div>';
  let docs, more = false, future = 0;
  const latest = teacherErrorsLatestDay();
  try{
    await ensureDb();
    /* One more than shown, to know whether more exist. A range and an
       orderBy on the same field (day) need no composite index. */
    const [snap, fut] = await Promise.all([
      db.collection('siteErrors').where('day', '<=', latest).orderBy('day', 'desc').limit(TEACHER_ERRORS_READ_MAX + 1).get(),
      db.collection('siteErrors').where('day', '>', latest).limit(TEACHER_ERRORS_READ_MAX).get(),
    ]);
    more = snap.docs.length > TEACHER_ERRORS_READ_MAX;
    docs = snap.docs.slice(0, TEACHER_ERRORS_READ_MAX).map(d => d.data());
    future = fut.docs.length;
  }catch(e){
    // Same stale-view guard as the success path: a late failure must not paint over another view.
    if(teacherView === 'errors') box.innerHTML = teacherErrorsFailHtml(e, 'load');
    return;
  }
  if(teacherView !== 'errors') return;
  box.innerHTML = teacherErrorsHtml(docs, more, future, latest);
  teacherErrorsNote = '';   // said once
}
/* Deletes every doc whose day is before today minus 30 days, then every doc
   dated after the latest day the rules accept (an impossible date), 400 at a
   time (a batch holds at most 500), for at most 50 rounds (20,000 docs) each. */
async function teacherErrorsDeleteOld(){
  if(teacherErrorsBusy) return;
  const cutoff = teacherErrorsDay(TEACHER_ERRORS_KEEP_DAYS), latest = teacherErrorsLatestDay();
  if(!confirm(`Delete every logged error from before ${cutoff}, and every one with an impossible date (after ${latest})? This cannot be undone.`)) return;
  teacherErrorsBusy = true;
  let n = 0;
  try{
    await ensureDb();
    for(const [op, day] of [['<', cutoff], ['>', latest]]){
      for(let round = 0; round < 50; round++){
        const snap = await db.collection('siteErrors').where('day', op, day).limit(400).get();
        if(snap.empty) break;
        const batch = db.batch();
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        n += snap.docs.length;
      }
    }
    teacherErrorsNote = n ? `Deleted ${n} error${n === 1 ? '' : 's'} from before ${cutoff} or after ${latest}.` : `Nothing from before ${cutoff} or after ${latest} to delete.`;
  }catch(e){
    teacherErrorsBusy = false;
    teacherErrorsNote = n ? `Deleted ${n}, then the delete stopped. Press the button again to finish.` : '';
    const box = document.getElementById('t-grid-container');
    if(teacherView === 'errors' && box) box.innerHTML = (teacherErrorsNote ? `<div class="tg-note"><b>${escHtml(teacherErrorsNote)}</b></div>` : '') + teacherErrorsFailHtml(e, 'delete from');
    teacherErrorsNote = '';
    return;
  }
  teacherErrorsBusy = false;
  if(teacherView === 'errors') renderTeacherErrors();
}
