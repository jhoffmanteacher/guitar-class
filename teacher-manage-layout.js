/* ── Manage: one section at a time (2026-11-15) ──────────────────────────
   Jonathan, 2026-11-15: "fix the layout of the manage console to not have
   everything in the same view but to be more user-friendly for the
   different features of the manage button". Manage used to stack every
   feature on one long page. It now shows a row of tabs and ONE section:
     Students     the roster table and its controls (renderTeacherManage,
                  teacher-manage.js; each row's "⋯" is teacher-remove.js)
     Accounts     Accounts by sign-in domain (teacher-accounts.js,
                  #t-access-block)
     Song files   Song files (teacher-songfiles.js, #t-songfiles-block)
     Backup       Download a backup (teacher-backup.js, #t-backup)

   LAYOUT ONLY. Every section is still drawn on every Manage paint, by the
   same functions, with the same ids, reads and handlers as before; the
   sections not chosen are only `hidden`. So a job that runs in one section
   (an upload, a backup read) goes on while another section is shown: those
   still stop on leaving Manage (teacherView !== 'manage'), as before.
   Choosing a section draws nothing and reads or writes nothing in
   Firestore.

   The chosen section is remembered for this browser (localStorage, a
   convenience only: it can come back empty, and then the default shows).
   The default is Students (checks.mjs 1el pins it and renders the tabs).
   Counts on the tabs: Accounts = the requests to join waiting (the same
   number as the sidebar badge: teacherPaintAccessBadge passes it here);
   Backup = "due" while the Backup row's reminder is (teacherBackupLastLine).
   Jumps: the dashboard's "N accounts are asking to join. Open Manage"
   opens Accounts (teacherManageOpen). */
const TEACHER_MANAGE_SECTIONS = [['students', 'Students'], ['accounts', 'Accounts'], ['songs', 'Song files'], ['backup', 'Backup']];
const TEACHER_MANAGE_DEFAULT = 'students';
const TEACHER_MANAGE_KEY = 'gc-teacher-manage-section';
function teacherManageIsSection(k){ return TEACHER_MANAGE_SECTIONS.some(s => s[0] === k); }
let teacherManageSection = (function(){ let v = null; try{ v = localStorage.getItem(TEACHER_MANAGE_KEY); }catch(e){} return teacherManageIsSection(v) ? v : TEACHER_MANAGE_DEFAULT; })();
let teacherManageWaiting = '';   // the Accounts tab's count, as the sidebar badge words it ('' = none)
let teacherManageBound = false;

/* A tab's label: its name, plus the waiting count (Accounts) or "due" (Backup). */
function teacherManageTabLabelHtml(k, label){
  let extra = '';
  if(k === 'accounts' && teacherManageWaiting) extra = ` <span class="ta-tab-count">(${escHtml(teacherManageWaiting)} waiting)</span>`;
  if(k === 'backup' && typeof teacherBackupLastLine === 'function' && teacherBackupLastLine().due) extra = ' <span class="ta-tab-count" style="color:var(--amber-text);font-weight:600">due</span>';
  return escHtml(label) + extra;
}
/* The tab strip and the four sections. panes: {accounts, songs, backup} as
   renderTeacherManage builds them; students: the roster part. */
function teacherManageLayoutHtml(panes, students){
  teacherManageBind();
  const on = teacherManageSection;
  const html = Object.assign({}, panes, {students});
  const tabs = TEACHER_MANAGE_SECTIONS.map(([k, label]) => `<button type="button" role="tab" class="ta-tab${k === on ? ' on' : ''}" id="tm-tab-${k}" data-manage-tab="${k}" aria-selected="${k === on}" aria-controls="tm-pane-${k}" tabindex="${k === on ? 0 : -1}">${teacherManageTabLabelHtml(k, label)}</button>`).join('');
  return `<div class="ta-tabs" role="tablist" aria-label="Manage" data-manage-tabs>${tabs}</div>`
    + TEACHER_MANAGE_SECTIONS.map(([k]) => `<div role="tabpanel" id="tm-pane-${k}" aria-labelledby="tm-tab-${k}" data-manage-pane="${k}"${k === on ? '' : ' hidden'}>${html[k] || ''}</div>`).join('');
}
/* Shows section k (already drawn), remembers it, and moves focus to its tab when asked. */
function teacherManageShow(k, focus){
  if(!teacherManageIsSection(k)) return;
  teacherManageSection = k;
  try{ localStorage.setItem(TEACHER_MANAGE_KEY, k); }catch(e){}
  if(typeof document === 'undefined' || !document.querySelectorAll) return;
  document.querySelectorAll('#t-grid-container [data-manage-tab]').forEach(b => {
    const is = b.dataset.manageTab === k;
    b.classList.toggle('on', is); b.setAttribute('aria-selected', String(is)); b.tabIndex = is ? 0 : -1;
    if(is && focus) b.focus();
  });
  document.querySelectorAll('#t-grid-container [data-manage-pane]').forEach(p => { p.hidden = p.dataset.managePane !== k; });
}
/* A jump into Manage at section k, from anywhere in the console. */
function teacherManageOpen(k){
  if(!teacherManageIsSection(k)) k = TEACHER_MANAGE_DEFAULT;
  if(teacherView === 'manage'){ teacherManageShow(k, false); return; }
  teacherManageSection = k;
  try{ localStorage.setItem(TEACHER_MANAGE_KEY, k); }catch(e){}
  setTeacherView('manage');
}
/* Repaints the tab labels in place (a count or "due" changed). */
function teacherManagePaintTabs(){
  if(typeof document === 'undefined' || !document.querySelectorAll) return;
  document.querySelectorAll('#t-grid-container [data-manage-tab]').forEach(b => {
    const s = TEACHER_MANAGE_SECTIONS.find(x => x[0] === b.dataset.manageTab);
    if(s) b.innerHTML = teacherManageTabLabelHtml(s[0], s[1]);
  });
}
/* Called by teacherPaintAccessBadge with the badge's own wording ('' when nobody waits). */
function teacherManageSetWaiting(label){
  teacherManageWaiting = label ? String(label) : '';
  teacherManagePaintTabs();
}
/* One click and one keydown listener on the view's box, for the tab strip
   only (Left / Right / Home / End move between tabs, as on an activity's
   tabs). The box outlives every view; the strip exists only on Manage. */
function teacherManageBind(){
  if(teacherManageBound || typeof document === 'undefined' || !document.getElementById) return;
  const box = document.getElementById('t-grid-container');
  if(!box || !box.addEventListener) return;
  teacherManageBound = true;
  box.addEventListener('click', e => {
    const t = e.target && e.target.closest ? e.target.closest('[data-manage-tab]') : null;
    if(t) teacherManageShow(t.dataset.manageTab, false);
  });
  box.addEventListener('keydown', e => {
    const t = e.target && e.target.closest ? e.target.closest('[data-manage-tab]') : null;
    if(!t || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const keys = TEACHER_MANAGE_SECTIONS.map(s => s[0]), n = keys.length, i = keys.indexOf(t.dataset.manageTab);
    const j = e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : (i + (e.key === 'ArrowRight' ? 1 : n - 1)) % n;
    teacherManageShow(keys[j], true);
  });
}
