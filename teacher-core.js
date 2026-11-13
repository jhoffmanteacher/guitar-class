/* ════════════════════════════════════════════════════════════════════
   Guitar Class — TEACHER DASHBOARD  (split out of app.js)

   The ?teacher=true view: a skills grid + written-response reader over all
   students' Firestore docs. Loaded as a plain <script> AFTER app.js. It uses
   globals defined elsewhere (escHtml/userHeaderHtml/ensureDb/db in app.js,
   TEACHER_EMAIL in firebase-config.js, SETS from the module files); all are
   resolved at call time, so load order among the deferred scripts is fine.
   ════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   TEACHER DASHBOARD
   ══════════════════════════════════════════════ */
/* IS_TEACHER_MODE is declared in app.js, not here: app.js's auth callback
   reads it before this file is guaranteed to have loaded. */
let teacherSetId=null, allStudents=[];
/* Archived students are hidden from every dashboard view without touching
   their progress doc. allStudentsRaw holds the full roster straight from
   Firestore; allStudents is the filtered list that every existing view
   already reads, so archiving needs no changes in those views. Flip
   teacherShowArchived (Manage view) to fold them back in. */
let allStudentsRaw=[], teacherShowArchived=false;
/* ── Class period (4, 7, or CAS) ──────────────────────────────────────────
   A student's effective period is the teacher's override if there is one,
   else the student's own answer, else nothing. The two halves are stored
   apart on purpose: the student's answer is a field on their own progress
   doc, which firestore.rules lets the teacher READ but not write, so a
   correction has to land somewhere the teacher can write — config/class,
   next to paused/archived/gameOverrides. Nothing here is derived and
   stored; it is recomputed wherever it's shown.

   Named teacherStudentPeriod, not studentPeriod: app.js already declares a
   `let studentPeriod` at script scope, and both files share one global
   scope — a top-level `function studentPeriod(){}` here would collide with
   that lexical binding and throw before a single line of this file ran. */
function teacherStudentPeriod(stu, cfg){
  const ov=((cfg||teacherClassConfig)&&(cfg||teacherClassConfig).periodOverrides)||{};
  return ov[stu.uid] || stu.period || '';
}
// Is the shown period the teacher's correction rather than the student's
// own answer? Drives the "set" marker in the Manage table.
function teacherPeriodIsOverride(stu){
  const ov=(teacherClassConfig&&teacherClassConfig.periodOverrides)||{};
  return !!ov[stu.uid];
}
// Small "P4" tag beside a student's name in the Students list and on their
// detail page. Silent when the student has no period yet — an empty pill
// beside every name would read as a rendering bug rather than as "untagged",
// and the Unassigned filter is where you go looking for those.
function teacherPeriodPillHtml(stu){
  const p=teacherStudentPeriod(stu);
  const label=p==='CAS'?'CAS':p?'P'+p:'';
  return p?` <span class="stu-period" title="Class period ${escAttr(p)}">${escHtml(label)}</span>`:'';
}
/* The teacher's "Open through Module N" for one student — config/class
   .moduleOpenThrough[uid], set in the Manage view. Returns the validated
   module number (2..12) or 0 for none, the same rule app.js applies when it
   reads the value into its own `moduleOpenThrough`. Named with the teacher
   prefix because both files share one global scope and app.js owns the
   unprefixed name. */
function teacherStudentOpenThrough(stu, cfg){
  const map=((cfg||teacherClassConfig)&&(cfg||teacherClassConfig).moduleOpenThrough)||{};
  const n=Number(map[stu.uid]);
  return (Number.isInteger(n) && n>=2 && n<=12) ? n : 0;
}
/* What is actually in force for the student: their own value or the
   class-wide floor CLASS_OPEN_THROUGH (config-main.js), whichever is higher —
   the same rule as app.js classOpenThrough(). */
function teacherEffectiveOpenThrough(stu, cfg){
  return Math.max(teacherStudentOpenThrough(stu, cfg), (typeof CLASS_OPEN_THROUGH === 'number') ? CLASS_OPEN_THROUGH : 0);
}
// "Open → M4" tag beside a student's name in the Students list. Silent when
// unset, same as the period pill.
function teacherOpenThroughPillHtml(stu){
  const n=teacherStudentOpenThrough(stu);
  return n?` <span class="stu-period" title="Modules up to ${n} opened in Manage">Open &#x2192; M${n}</span>`:'';
}
// "Blocked by N" tag beside a student's name in the Students list — how many
// of today's activities/checks are currently holding them out of the rest of
// the site (see the activity gate, app.js caBlockers). Silent when there's
// nothing blocking, same reasoning as the period pill: an empty badge on
// every row would read as broken, not as "all clear". Defined here (and not
// beside teacherBlockersFor, further down) so it sits next to the pill it
// renders alongside.
function teacherBlockedBadgeHtml(stu){
  const n=teacherBlockersFor(stu, teacherClassConfig).length;
  return n?` <span class="stu-period stu-blocked" title="${n} of today's activities not yet done or cleared — In-Class Activities opens first when they sign in">Pending ${n}</span>`:'';
}
/* 'all' | '4' | '7' | 'CAS' | 'none'. Persisted per-device so a mid-period
   reload comes back to the class the teacher was actually looking at. */
let teacherPeriodFilter=(function(){
  let v=null;
  try{ v=localStorage.getItem('gc-teacher-period'); }catch(e){}
  return (v==='4'||v==='7'||v==='CAS'||v==='none') ? v : 'all';
})();
/* Every dashboard view renders from allStudents, so both roster filters
   are applied in this one place and the whole console — skills grid,
   summary cards, responses, trouble spots, students list — follows. The
   Manage view is the deliberate exception: it renders from allStudentsRaw,
   because it is where you FIX a wrong period and must show everyone. */
function teacherApplyRosterFilter(){
  const arch=(teacherClassConfig&&teacherClassConfig.archived)||{};
  const onRoster = teacherShowArchived ? [...allStudentsRaw] : allStudentsRaw.filter(s=>!arch[s.uid]);
  allStudents = teacherPeriodFilter==='all' ? onRoster
    : teacherPeriodFilter==='none' ? onRoster.filter(s=>!teacherStudentPeriod(s))
    : onRoster.filter(s=>teacherStudentPeriod(s)===teacherPeriodFilter);
  /* A filter onto nobody falls back to All — the last Unassigned student
     just got a period (and that button disappears at zero, so it couldn't
     be switched off), or a period has no one in it. Otherwise the saved
     choice sticks and every view reads "No student data yet". Skipped while
     the roster itself is empty, so a render before the first load can't
     wipe the saved choice. */
  if(teacherPeriodFilter!=='all' && !allStudents.length && onRoster.length){
    teacherPeriodFilter='all';
    try{ localStorage.setItem('gc-teacher-period', 'all'); }catch(e){}
    allStudents=onRoster;
  }
  renderTeacherPeriodFilter(onRoster);
}
/* The segmented control itself. Repainted from teacherApplyRosterFilter so
   the Unassigned count follows every override the teacher sets, and lives
   in the top bar rather than inside one view — the filter is
   class-wide, and burying it in Manage would hide it from the four views
   that actually benefit. */
function renderTeacherPeriodFilter(onRoster){
  const box=document.getElementById('t-period-filter');
  if(!box) return;
  const arch=(teacherClassConfig&&teacherClassConfig.archived)||{};
  const list=onRoster||(teacherShowArchived?allStudentsRaw:allStudentsRaw.filter(s=>!arch[s.uid]));
  const unassigned=list.filter(s=>!teacherStudentPeriod(s)).length;
  const seg=(val,label)=>`<button class="tg-seg-btn ${teacherPeriodFilter===val?'on':''}" data-set-period-filter data-period="${val}">${label}</button>`;
  // The Unassigned segment disappears at zero rather than sitting there as a
  // dead "(0)" — once everyone is tagged it is a filter onto an empty room.
  box.innerHTML=seg('all','All')+seg('4','P4')+seg('7','P7')+seg('CAS','CAS')
    +(unassigned?seg('none',`Unassigned (${unassigned})`):'');
}
function teacherSetPeriodFilter(v){
  if(v!=='all'&&v!=='4'&&v!=='7'&&v!=='CAS'&&v!=='none') return;
  teacherPeriodFilter=v;
  try{ localStorage.setItem('gc-teacher-period', v); }catch(e){}
  teacherApplyRosterFilter();
  if(teacherView==='manage') renderTeacherManage();   // Manage shows everyone, but its filter chrome still repaints
  else { renderTeacherBody(); renderTeacherSummary(); }
}
/* "Student view" button in the dashboard header. Opens the site root in a
   new tab with no ?teacher=true and no hash — same browser, same signed-in
   Firebase session, so it lands on the ordinary student app AS the teacher's
   own account. That still isn't a real student session: isGatePreviewer()
   in app.js recognizes TEACHER_EMAIL and skips the sequential set gate and
   the day's-activities gate, and there's no progress on the teacher's own
   account to show — it's for checking layout/copy/flow, not standing in for
   a specific student. */
function teacherOpenStudentView(){
  const url=new URL(window.location.href);
  url.search='';
  url.hash='';
  window.open(url.toString(), '_blank', 'noopener');
}

async function showTeacherApp(user){
  document.getElementById('auth-wall').style.display='none';
  document.getElementById('app').style.display='none';
  if(user.email!==TEACHER_EMAIL){
    document.getElementById('teacher-denied').style.display='block';
    document.getElementById('user-area').innerHTML=userHeaderHtml(user);
    if(window.PM) PM.syncHeader(false);   // the console never shows the practice-minutes strip
    return;
  }
  document.getElementById('teacher-app').style.display='block';
  document.getElementById('user-area').innerHTML=userHeaderHtml(user);
  if(window.PM) PM.syncHeader(false);   // same: hidden on the console (PM_HOST.user() is null there too)
  /* The site's own reload for an update: open the view the console was on,
     not the default one (app.js "Back where you were after an update").
     HERE, before the sidebar below goes live: the module files load for
     several seconds further down, and a click made during that wait must
     stand. Applied after it, the restore put the teacher back on the old
     view a few seconds after they had picked a new one (review R1-1). */
  const resumed=teacherResumeApply(typeof swResumeTake==='function' ? swResumeTake(user, true) : null);
  /* The sidebar (Layout A, 2026-11-08) — one button per view, grouped, built
     from TEACHER_NAV. It replaced the row of view buttons that used to sit
     above the content (index.html's static three plus ten injected here).
     Same data-view values, same setTeacherView; a delegated click on the
     shell (below) does the switching. Guarded so re-entering teacher mode
     doesn't build it twice. Its units tree (#t-side-tree) is empty here and
     is filled by teacherPaintSideTree once the class settings have loaded. */
  const side=document.getElementById('t-side');
  if(side && !side.querySelector('[data-view]')) side.innerHTML=teacherNavHtml();
  /* Class-period filter and Refresh, in the slim top bar beside Student
     view. The filter narrows the roster every view renders from rather than
     switching views; renderTeacherPeriodFilter fills it in once the roster
     has loaded. Refresh re-reads student progress (teacherRefreshStudents)
     and says how old the progress on screen is. */
  const tools=document.getElementById('t-topbar-tools');
  if(tools && !document.getElementById('t-period-filter')){
    tools.insertAdjacentHTML('afterbegin', `<div class="tg-seg t-period-filter" id="t-period-filter" role="group" aria-label="Filter by class period"></div>`
      +`<span id="t-refresh-bar" class="t-refresh-bar">`
      +`<span class="tg-seg"><button type="button" class="tg-seg-btn" data-refresh-students title="Read every student's progress again: Done counts, who hasn't finished, Pending">Refresh</button></span>`
      +`<span data-refresh-when></span></span>`);
  }
  // Two extra legend rows for the skills grid's got-it markers — the plain
  // green check (index.html's static legend) doesn't distinguish a Coach
  // pass or a gate override from a self-declared "I've got it!". Inserted
  // here rather than in index.html so the whole feature stays in this file;
  // guarded the same way as the sidebar above.
  const legend=document.getElementById('t-legend');
  if(legend && !legend.querySelector('[data-leg="coach-verified"]')){
    legend.insertAdjacentHTML('beforeend', `<div class="t-leg" data-leg="coach-verified"><span class="tck yes" style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border:2px solid var(--blue-text)">${TCK_CHECK_SVG}</span> Listening Coach verified</div>`);
  }
  if(legend && !legend.querySelector('[data-leg="deck-verified"]')){
    legend.insertAdjacentHTML('beforeend', `<div class="t-leg" data-leg="deck-verified" title="The skill's shuffle deck was passed at 90% or better within the time limit — the app checked it, not the honor system."><span class="tck yes" style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border:2px solid var(--green-text)">${TCK_CHECK_SVG}</span> Shuffle-deck verified</div>`);
  }
  if(legend && !legend.querySelector('[data-leg="coach-override"]')){
    legend.insertAdjacentHTML('beforeend', `<div class="t-leg" data-leg="coach-override" title="Marked without a passing Listening Coach check or a qualifying deck run — for Coach skills usually a mic or room issue, not a sign the student can't play it."><span class="tck yes" style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border:2px dashed var(--text3)">${TCK_CHECK_SVG}</span> Marked without a Coach pass / deck run</div>`);
  }
  // Students-view clicks (a roster row, the skills grid's name cell, the
  // detail page's back link) go through data-uid + one delegated listener
  // instead of building onclick="…('uid')" strings, so a Firestore uid is
  // never interpolated into an inline JS string literal. Bound to the
  // stable outer shell, not #t-grid-container — that element's innerHTML
  // gets replaced on every render, but the shell doesn't, so the guard
  // here is obviously correct rather than subtly correct.
  const shell=document.getElementById('teacher-app');
  if(shell && !shell.dataset.delegated){
    shell.dataset.delegated='1';
    shell.addEventListener('click', e=>{
      // The units tree under Class activities: a row shows that unit, the arrow folds the tree.
      const sideUnit=e.target.closest('#t-side [data-side-unit]');
      if(sideUnit){ teacherOpenUnitFromSide(sideUnit.dataset.sideUnit); return; }
      if(e.target.closest('#t-side [data-side-fold]')){ teacherToggleSideTree(); return; }
      const navBtn=e.target.closest('#t-side [data-view]');
      if(navBtn){ setTeacherView(navBtn.dataset.view); return; }
      // ── Class activities: the list + tabbed detail ──
      // An open More menu closes on any click outside it, and after a pick
      // inside it (the item's own handler below still runs).
      document.querySelectorAll('#teacher-app details[data-ta-more][open]').forEach(d=>{
        if(!d.contains(e.target) || e.target.closest('.ta-more-item')) d.open=false;
      });
      const taPick=e.target.closest('[data-ta-pick]');
      if(taPick){ teacherPickActivity(taPick.dataset.id); return; }
      const taFilter=e.target.closest('[data-ta-filter]');
      if(taFilter){ teacherSetActivityFilter(taFilter.dataset.taFilter); return; }
      const taUnit=e.target.closest('[data-ta-unit]');
      if(taUnit){ teacherToggleUnit(taUnit.dataset.taUnit); return; }
      const taTab=e.target.closest('[data-ta-tab]');
      if(taTab){ teacherSetDetailTab(taTab.dataset.taTab); return; }
      if(e.target.closest('[data-ta-board-open]')){ teacherOpenArrangeBoard(); return; }
      if(e.target.closest('[data-ta-board-back]')){ teacherCloseArrangeBoard(); return; }
      const taGoto=e.target.closest('[data-ta-goto-view]');
      if(taGoto){ setTeacherView(taGoto.dataset.taGotoView); return; }
      const taRename=e.target.closest('[data-ta-rename]');
      if(taRename){ activityEditId=taRename.dataset.id; teacherSetDetailTab('settings'); teacherRenderRenameView(); return; }
      if(e.target.closest('[data-refresh-students]')){ teacherRefreshStudents({manual:true}); teacherRefreshReportsBadge(); return; }
      if(e.target.closest('[data-back-to-students]')){ backToStudentsRoster(); return; }
      const pmSort=e.target.closest('[data-pm-sort]');
      if(pmSort){ teacherSetMinutesSort(pmSort.dataset.pmSort); return; }
      if(e.target.closest('[data-pm-refresh]')){ if(!teacherPmLoading){ teacherPmError=''; teacherLoadMinutes(); } return; }
      const games=e.target.closest('[data-set-games]');
      if(games){ teacherSetStudentGames(games.dataset.uid, games.dataset.state); return; }
      if(e.target.closest('[data-toggle-archived]')){ teacherToggleShowArchived(); return; }
      if(e.target.closest('[data-open-all-through]')){ teacherOpenAllThrough(); return; }
      const manageSort=e.target.closest('[data-manage-sort]');
      if(manageSort){ teacherSetManageSort(manageSort.dataset.manageSort, manageSort.dataset.value); return; }
      const paused=e.target.closest('[data-set-paused]');
      if(paused){ teacherSetStudentPaused(paused.dataset.uid, paused.dataset.state); return; }
      const archived=e.target.closest('[data-set-archived]');
      if(archived){ teacherSetStudentArchived(archived.dataset.uid, archived.dataset.state); return; }
      const periodFilter=e.target.closest('[data-set-period-filter]');
      if(periodFilter){ teacherSetPeriodFilter(periodFilter.dataset.period); return; }
      const period=e.target.closest('[data-set-period]');
      if(period){ teacherSetStudentPeriod(period.dataset.uid, period.dataset.value); return; }
      const actHidden=e.target.closest('[data-set-activity-hidden]');
      if(actHidden){ teacherSetActivityHidden(actHidden.dataset.id, actHidden.dataset.state); return; }
      // Sits inside the section heading, which is the fold toggle — matched
      // here, ahead of data-board-fold below, so it doesn't also fold.
      const modHidden=e.target.closest('[data-set-module-hidden]');
      if(modHidden){ teacherSetModuleHidden(modHidden.dataset.module, modHidden.dataset.state); return; }
      const tvsPick=e.target.closest('[data-tvs-pick]');
      if(tvsPick){ teacherViewSongPick(tvsPick.dataset.id); return; }
      const tvsShare=e.target.closest('[data-tvs-share]');
      if(tvsShare){ teacherSetClassSong(tvsShare.dataset.id, tvsShare.dataset.state==='class'); return; }
      const songPlace=e.target.closest('[data-set-song-place]');
      if(songPlace){ teacherSetSongPlace(songPlace.dataset.id, songPlace.dataset.state); return; }
      const actOpt=e.target.closest('[data-set-activity-optional]');
      if(actOpt){ teacherSetActivityOptional(actOpt.dataset.id, actOpt.dataset.state); return; }
      const actPlay=e.target.closest('[data-set-activity-playalong]');
      if(actPlay){ teacherSetActivityPlayAlong(actPlay.dataset.id, actPlay.dataset.state); return; }
      const actWhole=e.target.closest('[data-activity-whole-class]');
      if(actWhole){ teacherSetActivityWholeClass(actWhole.dataset.id); return; }
      const actPin=e.target.closest('[data-set-activity-pin]');
      if(actPin){ teacherSetActivityPin(actPin.dataset.id, actPin.dataset.state); return; }
      const actArch=e.target.closest('[data-set-activity-archived]');
      if(actArch){ teacherSetActivityArchived(actArch.dataset.id, actArch.dataset.state); return; }
      const actDel=e.target.closest('[data-delete-activity]');
      if(actDel){ teacherDeleteActivity(actDel.dataset.id); return; }
      const actClear=e.target.closest('[data-set-activity-clear]');
      if(actClear){ teacherSetActivityClear(actClear.dataset.uid, actClear.dataset.id, actClear.dataset.state); return; }
      const focusToggle=e.target.closest('[data-ta-focus-toggle]');
      if(focusToggle){ taFocusPreviewOn[focusToggle.dataset.id]=!taFocusPreviewOn[focusToggle.dataset.id]; renderTeacherActivityDetail(focusToggle.dataset.id); return; }
      const focusGo=e.target.closest('[data-ta-focus-go]');
      if(focusGo){ taFocusPreviewIdx[focusGo.dataset.id]=Number(focusGo.dataset.idx); renderTeacherActivityDetail(focusGo.dataset.id); return; }
      const focusPath=e.target.closest('[data-ta-focus-path]');
      if(focusPath){ taFocusPreviewPath[focusPath.dataset.id]=focusPath.dataset.key; taFocusPreviewIdx[focusPath.dataset.id]=0; renderTeacherActivityDetail(focusPath.dataset.id); return; }
      const clearAll=e.target.closest('[data-clear-all-blockers]');
      if(clearAll){ teacherClearAllBlockers(clearAll.dataset.uid); return; }
      // ── The activity board (renderTeacherActivities) ──
      const pub=e.target.closest('[data-publish-activity]');
      // Publish now / Unpublish both go through the ordinary date writer —
      // the date IS the publish switch, these are just its two shortcuts.
      if(pub){ teacherSetActivityDate(pub.dataset.id, pub.dataset.state==='now' ? dayStr(new Date()) : ''); return; }
      const unassign=e.target.closest('[data-unassign-activity]');
      if(unassign){ teacherUnassignActivity(unassign.dataset.id); return; }
      const bump=e.target.closest('[data-board-bump]');
      if(bump){ teacherBoardBump(bump.dataset.id, bump.dataset.dir); return; }
      const fold=e.target.closest('[data-board-fold]');
      if(fold){ teacherBoardFold(fold.dataset.module); return; }
      if(e.target.closest('[data-board-flip]')){ teacherBoardFlipDir(); return; }
      // The sort select is a live input on the board's own chrome — swallow
      // the click so it can't fall through to anything behind it.
      if(e.target.closest('[data-board-sort]')) return;
      // Rename controls sit INSIDE the title line, which is itself the
      // data-open-activity link — so they have to be matched before it, or
      // clicking the pencil would navigate away instead of opening the editor.
      // Also inside the title line, so it's matched before the open-detail
      // link below for the same reason the rename controls are.
      const actLink=e.target.closest('[data-copy-activity-link]');
      if(actLink){ teacherCopyActivityLink(actLink.dataset.id, actLink); return; }
      const actRename=e.target.closest('[data-rename-activity]');
      if(actRename){ activityEditId=actRename.dataset.id; teacherRenderRenameView(); return; }
      if(e.target.closest('[data-rename-cancel]')){ activityEditId=null; teacherRenderRenameView(); return; }
      const actSave=e.target.closest('[data-rename-save]');
      if(actSave){ teacherSaveActivityTitle(actSave.dataset.id); return; }
      const actReset=e.target.closest('[data-rename-reset]');
      if(actReset){ teacherSetActivityTitle(actReset.dataset.id, ''); return; }
      // The # box and the Move-to select are live inputs sitting on the same
      // card as the open-detail title — swallow the click so aiming at one
      // doesn't navigate to the detail page out from under the cursor. Their
      // writes happen on 'change', below.
      if(e.target.closest('[data-board-number]') || e.target.closest('[data-move-activity]')) return;
      const openAct=e.target.closest('[data-open-activity]');
      if(openAct){ openActivityDetail(openAct.dataset.id); return; }
      if(e.target.closest('[data-back-to-activities]')){ backToActivitiesList(); return; }
      const open=e.target.closest('[data-open-student]');
      if(open) openStudentDetail(open.dataset.uid);
    });
    // Same delegation pattern as the click listener above, on the same stable
    // shell — the date <input> in renderTeacherActivities re-renders often,
    // this listener doesn't need to.
    shell.addEventListener('change', e=>{
      // A release date typed from the keyboard waits for blur or Enter (see
      // teacherCommitActivityDate); a pick from the calendar has no keystroke
      // behind it and saves at once, as it always did.
      const actDate=e.target.closest('[data-set-activity-date]');
      if(actDate){ if(!actDate.dataset.typing) teacherCommitActivityDate(actDate); return; }
      const actNum=e.target.closest('[data-board-number]');
      if(actNum){ teacherMoveActivityToNumber(actNum.dataset.id, actNum.value); return; }
      // "Assign to…" / "Move to…" — both append at the end of the section
      // they name, same as dropping a card on a section's empty space.
      const moveSel=e.target.closest('[data-move-activity]');
      if(moveSel && moveSel.value!==''){ teacherMoveActivity(moveSel.dataset.id, Number(moveSel.value), null); return; }
      const sortSel=e.target.closest('[data-board-sort]');
      if(sortSel){ teacherBoardSetSort(sortSel.value); return; }
      const openSel=e.target.closest('[data-set-open-through]');
      if(openSel){ teacherSetStudentOpenThrough(openSel.dataset.uid, openSel.value); return; }
      // Practice minutes: "This week's goal (minutes)" saves when Enter blurs the box or it is left.
      const pmGoal=e.target.closest('[data-pm-goal]');
      if(pmGoal){ if(pmGoal.isConnected) teacherSetPmWeekGoal(pmGoal.dataset.week, pmGoal.value); return; }   // a box a repaint removed saves nothing, like the release-date box
      const whoBox=e.target.closest('[data-set-activity-student]');
      if(whoBox){ teacherSetActivityStudent(whoBox.dataset.id, whoBox.dataset.uid, whoBox.checked); return; }
    });
    // The Class activities list's search box: repaint the rows on every key.
    shell.addEventListener('input', e=>{
      const q=e.target && typeof e.target.closest==='function' && e.target.closest('[data-ta-search]');
      if(q){ activityListQuery=q.value; teacherPaintActivityList(true); }
    });
    /* An <details> in the board remembers whether it was open across the
       next re-render — the board repaints on every write, and an Archived
       list that snapped shut each time would be unusable. `toggle` doesn't
       bubble, hence the capture phase. */
    shell.addEventListener('toggle', e=>{
      if(!e.target || typeof e.target.closest!=='function') return;
      // Matched on the target itself, before the Archived check: a done list
      // inside an archived card sits INSIDE a [data-board-arch] details, so
      // closest() from it would find the archive fold instead.
      if(e.target.matches('[data-board-done]')){ boardDoneOpen[e.target.dataset.key]=!!e.target.open; return; }
      if(e.target.matches('[data-board-who]')){
        const id=e.target.dataset.id;
        boardWhoOpen[id]=!!e.target.open;
        // A closed picker is drawn without its student list — fill it now.
        const slot=e.target.open && e.target.querySelector('[data-who-boxes]');
        const a=slot && !slot.childElementCount && (window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
        if(a) slot.innerHTML=teacherWhoBoxesHtml(a, teacherClassConfig);
        return;
      }
      if(e.target.matches('[data-board-help]')){ boardHelpOpen=!!e.target.open; return; }
      const arch=e.target.closest('[data-board-arch]');
      if(arch) teacherBoardArchToggle(arch.dataset.module, arch.open);
    }, true);
    /* Leaving a release-date box saves what was typed in it (focusout, not
       blur — blur doesn't bubble to this listener). Moving between the
       box's own month/day/year fields stays inside the box and fires
       nothing. A box removed by a repaint is skipped: its half-typed value
       is gone from the screen, and saving it unseen is the bug this fixes. */
    shell.addEventListener('focusout', e=>{
      const dateBox=e.target && typeof e.target.closest==='function' && e.target.closest('[data-set-activity-date]');
      if(dateBox && dateBox.isConnected) teacherCommitActivityDate(dateBox);
    });
    /* Coming back to this tab: re-read student progress (on the views that
       redraw cheaply) and the new-reports count, and start or stop the
       once-a-minute timer — it doesn't run while the tab is hidden. Bound
       here, inside the run-once block, so a second showTeacherApp can't
       add a second listener. */
    document.addEventListener('visibilitychange', ()=>{
      teacherSyncAutoRefresh();
      if(document.hidden) return;
      if(Date.now()-teacherStudentsAt > 15000) teacherRefreshStudents();
      teacherRefreshReportsBadge();
      // Practice minutes left on screen overnight: repainting runs its day check (a read from an earlier day reads again).
      if(teacherView==='minutes') renderTeacherMinutes();
    });
    /* Drag and drop for the board. Bound to the same stable shell for the
       same reason as the click listener — the board's innerHTML is replaced
       on every render, so per-card listeners would have to be re-bound. */
    shell.addEventListener('dragstart', teacherBoardDragStart);
    shell.addEventListener('dragover',  teacherBoardDragOver);
    shell.addEventListener('dragenter', teacherBoardDragOver);
    shell.addEventListener('drop',      teacherBoardDrop);
    shell.addEventListener('dragend',   teacherBoardDragEnd);
    // ...and the dragend that never arrives — see teacherBoardStaleDragCheck.
    document.addEventListener('mousemove', teacherBoardStaleDragCheck, {capture:true, passive:true});
    document.addEventListener('mousedown', teacherBoardStaleDragCheck, true);
    // Enter saves, Escape backs out — the rename box is a one-line field in a
    // table cell, not a form, so there's no submit event to lean on.
    shell.addEventListener('keydown', e=>{
      // The detail's tab strip: Left / Right / Home / End move between tabs.
      const tabKey=e.target.closest && e.target.closest('[data-ta-tab]');
      if(tabKey && ['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
        e.preventDefault();
        const i=TA_TABS.indexOf(tabKey.dataset.taTab), n=TA_TABS.length;
        const j=e.key==='Home'?0:e.key==='End'?n-1:(i+(e.key==='ArrowRight'?1:n-1))%n;
        teacherSetDetailTab(TA_TABS[j], true);
        return;
      }
      if(e.key==='Escape'){ const m=document.querySelector('#teacher-app details[data-ta-more][open]'); if(m){ m.open=false; const sm=m.querySelector('summary'); if(sm) sm.focus(); return; } }
      // Release date: Enter saves, Escape puts the saved date back, and any
      // key that edits the value marks the box as being typed in, so the
      // per-keystroke 'change' events above don't save half a date.
      const dateBox=e.target.closest('[data-set-activity-date]');
      if(dateBox){
        if(e.key==='Enter'){ e.preventDefault(); teacherCommitActivityDate(dateBox); }
        else if(e.key==='Escape'){ dateBox.value=teacherSavedActivityDate(dateBox.dataset.id); delete dateBox.dataset.typing; }
        else if(/^\d$/.test(e.key) || ['Backspace','Delete','ArrowUp','ArrowDown','PageUp','PageDown','Home','End'].includes(e.key)) dateBox.dataset.typing='1';
        return;
      }
      // The Practice minutes goal box: Enter blurs it (which fires the 'change' above), Escape puts the saved value back.
      const pmGoalBox=e.target.closest('[data-pm-goal]');
      if(pmGoalBox){
        if(e.key==='Enter'){ e.preventDefault(); pmGoalBox.blur(); }
        else if(e.key==='Escape'){ e.preventDefault(); pmGoalBox.value=pmGoalBox.defaultValue; pmGoalBox.blur(); }
        return;
      }
      // A number box isn't in a form either, so Enter has nothing to submit —
      // blur it, which fires the 'change' the writer above listens for.
      const numBox=e.target.closest('.t-board-num');
      if(numBox){ if(e.key==='Enter'){ e.preventDefault(); numBox.blur(); } return; }
      const box=e.target.closest('.t-act-title-edit');
      if(!box) return;
      if(e.key==='Enter'){ e.preventDefault(); teacherSaveActivityTitle(box.dataset.id); }
      else if(e.key==='Escape'){ e.preventDefault(); activityEditId=null; teacherRenderRenameView(); }
    });
  }
  // The teacher grid spans every set, so load all module data first. Sequential
  // keeps SETS in module order so the week tabs render 1→8 left to right.
  // A module that fails to load silently shrinks the skill universe and
  // inflates every percentage below, so failures are logged and surfaced
  // rather than swallowed.
  const moduleLoadErrors=[];
  for(const m of MODULE_MANIFEST){
    try{ await loadModuleData(m.num); }
    catch(e){ console.warn(`Teacher dashboard: failed to load skill data for Module ${m.num}`, e); moduleLoadErrors.push(m.num); }
  }
  showTeacherLoadWarning(moduleLoadErrors);
  renderTeacherSetTabs();
  const firstSet=SETS.find(w=>!w.locked&&w.skills&&w.skills.length>0);
  if(firstSet){ teacherSetId=firstSet.id; activateTeacherSetTab(firstSet.id); }
  // The skills grid's set from before an update reload: only now do the sets exist to check it against.
  const resumedSet=resumed && typeof resumed.set==='string' && SETS.find(w=>w.id===resumed.set && !w.locked && w.skills && w.skills.length>0);
  if(resumedSet){ teacherSetId=resumedSet.id; renderTeacherSetTabs(); }
  /* Mark the view the console is on in the sidebar: Class activities, the one
     restored above, or one clicked while the modules loaded. An activity
     opened from Songs or a student's page keeps THAT item lit
     (openActivityDetail does the same). */
  applyTeacherViewChrome(teacherView==='activities' && teacherActivityScreen()==='detail' ? (activityDetailFrom==='songs' ? 'songs' : 'students') : teacherView);
  const firstPaint=loadAllStudents();
  /* The scroll position from before an update reload. Its 8 seconds start
     only now that the roster is on screen (the module files and the roster
     can take longer than that on their own: review R2-4); the watcher has
     been running since the top, so a click or scroll during the load has
     already cancelled it. */
  if(resumed && resumed.watch){
    const y=Number(resumed.y)||0, w=resumed.watch;
    Promise.resolve(firstPaint).catch(()=>{}).then(()=>{ if(y>0 && !w.touched) swResumeScroll(()=>window, ()=>y, w, null); else w.off(); });
  }
}
/* ── Back where you were after an update (2026-11-09) ─────────────────────
   app.js writes a note just before the site reloads itself for a new version
   and hands it back on the next load (swResumeSave / swResumeTake). These two
   are the console's half: which view, which student or activity, which of
   the three Class activities screens, the detail tab, the list filter, the
   skills grid's set, the Teacher view song, and the scroll position (set
   after the first paint, once the page is tall enough again, for up to 8
   seconds, and dropped the moment the teacher clicks or scrolls:
   swResumeScroll in app.js).
   Everything read back is checked against what exists now; anything that
   does not fit is dropped and that part opens as it normally would. It
   restores what is on screen only: nothing here writes to Firestore.
   teacherResumeApply returns the note it used (or null) so showTeacherApp
   can set the skills grid's set once the module data has loaded, and start
   the scroll after the first paint (note.watch: the "did they touch the
   page" watcher, started here so it covers the whole load). */
function teacherResumeSnapshot(){
  return {
    view: teacherView, uid: studentDetailUid,
    act: activityDetailId, pick: activityListPickId, from: activityDetailFrom, fromUid: activityDetailFromUid,
    board: activityBoardMode, tab: activityDetailTab, filter: activityListFilter,
    song: teacherViewSongId, set: teacherSetId, y: Math.round(window.scrollY) || 0
  };
}
function teacherResumeApply(t){
  if(!t || typeof t!=='object') return null;
  const views=TEACHER_NAV.flatMap(g=>g.items.map(i=>i[0]));
  if(!views.includes(t.view)) return null;
  const acts=window.CLASS_ACTIVITIES||[];
  const actId=id=>(typeof id==='string' && acts.some(a=>a.id===id)) ? id : null;
  const str=v=>(typeof v==='string' && v) ? v : null;
  teacherView=t.view;
  // A student's page. An unknown uid is safe: renderTeacherStudentDetail says so and offers the roster.
  studentDetailUid = t.view==='students' ? str(t.uid) : null;
  if(TA_TABS.includes(t.tab)) activityDetailTab=t.tab;
  if(TA_FILTERS.some(([k])=>k===t.filter)) activityListFilter=t.filter;
  if(t.view==='activities'){
    activityListPickId=actId(t.pick);
    activityDetailId=actId(t.act);
    activityBoardMode=t.board===true;
    /* An activity opened from Songs or from a student's page shows alone with
       a Back button (teacherActivityScreen 'detail'); Back needs to know
       where it came from. Anything that does not add up is the plain list. */
    const from=(t.from==='songs' || (t.from==='student' && str(t.fromUid))) && activityDetailId ? t.from : 'activities';
    activityDetailFrom=from;
    activityDetailFromUid = from==='student' ? str(t.fromUid) : null;
    if(from==='activities' && !activityBoardMode) activityDetailId=activityListPickId || activityDetailId;
  }
  if(str(t.song)) teacherViewSongId=t.song;   // renderTeacherViewSongs falls back to the first song if it is gone
  if(typeof swResumeWatch==='function' && typeof swResumeScroll==='function') t.watch=swResumeWatch();
  return t;
}

// A prior version stacked all 13 modules as one row each — always tall,
// however few sets a module had. This renders a single "Module: [dropdown]"
// row plus a pill row for ONLY the currently-selected module's sets, so the
// student table below starts right after two short rows instead of 13.
function renderTeacherSetTabs(){
  const c=document.getElementById('t-week-tabs'); c.innerHTML='';
  const modsWithSets=MODULE_MANIFEST.filter(m=>SETS.some(w=>w.moduleNum===m.num&&w.skills&&w.skills.length>0));
  if(modsWithSets.length===0) return;
  const curSet=SETS.find(w=>w.id===teacherSetId);
  const curModNum=curSet?curSet.moduleNum:modsWithSets[0].num;

  const selectWrap=document.createElement('div');
  selectWrap.className='module-select-wrap';
  const label=document.createElement('label');
  label.className='module-select-label';
  label.htmlFor='t-module-select';
  label.textContent='Module';
  const select=document.createElement('select');
  select.className='module-select';
  select.id='t-module-select';
  modsWithSets.forEach(m=>{
    const opt=document.createElement('option');
    opt.value=m.num;
    opt.textContent=`M${m.num} · ${m.name}`;
    if(m.num===curModNum) opt.selected=true;
    select.appendChild(opt);
  });
  select.onchange=()=>{
    const modNum=Number(select.value);
    const modSets=SETS.filter(w=>w.moduleNum===modNum&&w.skills&&w.skills.length>0);
    const target=modSets.find(w=>!w.locked)||modSets[0];
    if(target) teacherSetId=target.id;
    renderTeacherSetTabs();
    renderTeacherBody();
  };
  selectWrap.appendChild(label); selectWrap.appendChild(select);
  c.appendChild(selectWrap);

  const group=document.createElement('div');
  group.className='t-week-group';
  const modSets=SETS.filter(w=>w.moduleNum===curModNum&&w.skills&&w.skills.length>0);
  modSets.forEach(w=>{
    const btn=document.createElement('button');
    btn.className='t-wtab'+(w.locked?' locked':'')+(w.id===teacherSetId?' on':'');
    btn.textContent=w.label; btn.dataset.id=w.id;
    if(!w.locked) btn.onclick=()=>{ teacherSetId=w.id; activateTeacherSetTab(w.id); renderTeacherBody(); };
    group.appendChild(btn);
  });
  c.appendChild(group);
}
function activateTeacherSetTab(id){ document.querySelectorAll('.t-wtab').forEach(b=>b.classList.toggle('on',b.dataset.id===id)); }

// Shown above the summary cards when one or more modules failed to load in
// showTeacherApp — a plain sibling node (not inside #t-summary, which
// renderTeacherSummary overwrites wholesale) so it survives every re-render.
function showTeacherLoadWarning(moduleNums){
  const existing=document.getElementById('t-load-warning');
  if(existing) existing.remove();
  if(!moduleNums||!moduleNums.length) return;
  const summaryEl=document.getElementById('t-summary');
  if(!summaryEl) return;
  const label=moduleNums.length===1?`Module ${moduleNums[0]}`:`Modules ${moduleNums.join(', ')}`;
  summaryEl.insertAdjacentHTML('beforebegin', `<div id="t-load-warning" class="t-loading"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4"/><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none"/></svg> ${escHtml(label)} skill data failed to load — counts and percentages below may be incomplete. Check the browser console for details, or reload.</div>`);
}

/* Every student's progress doc, read once and mapped to the shape every view
   reads. Shared by the first load and by teacherRefreshStudents. Throws on
   a failed read — the callers decide what that means for the screen. */
async function teacherFetchStudents(){
  await ensureDb();
  const snap=await db.collection('progress').get();
  const out=[];
  /* Hear It First saves the signed-in account's trainer profile into
     progress/{uid} with mergeFields, which creates the document when it is
     missing. On the teacher's own account that document holds nothing a student
     has, and the roster drew it as a nameless row under Unassigned (Friday check
     R2-1, 2026-10-31). It is not just {trainer}: Hear It First runs in student
     mode, every student-mode page load runs swap45Commit, and that adds
     `migrations.swap45` to an unmarked document, so from the second visit it is
     {trainer, migrations} (review R3-1). So the test is what the roster would
     DRAW: the signed-in teacher's own document is skipped when it has no name,
     email or period and nothing in skills, responses, games, classActivities or
     exitChecks. A document that holds any of those (a test-student account) is
     still listed, and so is every other account. */
  const myUid=(typeof currentUser!=='undefined'&&currentUser&&currentUser.uid)||'';
  const rowIsEmpty=d=>!String(d.name||'')&&!String(d.email||'')&&!d.period
    &&['skills','responses','games','classActivities','exitChecks'].every(k=>!Object.keys(d[k]||{}).length);
  snap.forEach(doc=>{
      /* Module 4/5 swap (2026-10-12): a doc whose student has not opened the
         site since the swap is still in the OLD numbering (its Module 4 work
         sits under the ids Module 5 uses now). Read it in the new numbering —
         IN MEMORY ONLY: the console never writes progress/{uid}; the
         student's own browser moves the stored doc (swap45Remap /
         swap45Commit in app.js, which always loads before this file). Remove
         with them. */
      const data=swap45Marked(doc.data())?doc.data():swap45Remap(doc.data());
      if(myUid&&doc.id===myUid&&rowIsEmpty(data)) return;
      const raw=data.skills||{};
      const skills={};
      Object.keys(raw).forEach(k=>{
        if(raw[k]===true) skills[k]='gotit';
        else if(raw[k]==='working'||raw[k]==='gotit') skills[k]=raw[k];
        else if(raw[k]==='1'||raw[k]==='2'||raw[k]==='3') skills[k]=raw[k];
        else if((k.endsWith('-reflection')||k.endsWith('-performance')) && raw[k] && typeof raw[k]==='object') skills[k]=raw[k];
        else skills[k]='none';
      });
      const gamesData=data.games||{};
      // name/email are coerced to strings: firestore.rules doesn't type-check
      // progress/{uid}, and the roster sorts call .localeCompare() on them —
      // one student writing a number there would blank every view.
      // songOpens (app.js songsLibraryOpen): student-written, and the rules
      // don't type-check progress/{uid} — keep only whole counts 1..1000 per
      // song, so a doctored doc adds at most 1000 to a song's opens (and 1 to
      // its students).
      const opensRaw=(data.songOpens&&typeof data.songOpens==='object')?data.songOpens:{};
      const songOpens={};
      Object.keys(opensRaw).forEach(k=>{ const n=Math.floor(Number(opensRaw[k])); if(Number.isFinite(n)&&n>0) songOpens[k]=Math.min(n,1000); });
      out.push({uid:doc.id,skills,name:String(data.name||''),email:String(data.email||''),responses:data.responses||{},coachSkill:gamesData.coachSkill||{},drillSkill:gamesData.drillSkill||{},classActivities:data.classActivities||{},exitChecks:data.exitChecks||{},period:data.period||'',songOpens,
        // Step ticks (caSteps, `<id>:<n>`), only to tell "started" from "not started" on an
        // activity's Students tab — keys are tested with startsWith, never shown.
        caSteps:(data.caSteps&&typeof data.caSteps==='object')?data.caSteps:{}});
  });
  return out;
}
async function loadAllStudents(){
  teacherRefreshing=true; teacherPaintRefreshBar();
  try{
    allStudentsRaw=await teacherFetchStudents();
    // Pause/archive flags live in config/class, so it has to be in hand
    // before the roster is filtered — otherwise the first paint shows
    // archived students and then blinks them away.
    await loadTeacherClassConfig();
    teacherApplyRosterFilter();
  } catch(e){
    teacherRefreshing=false; teacherRefreshFailed=true; teacherPaintRefreshBar();
    document.getElementById('t-grid-container').innerHTML='<div class="t-loading">Could not load student data. Check your Firebase security rules.</div>';
    return;
  }
  teacherRefreshing=false; teacherRefreshFailed=false;
  teacherStudentsAt=Date.now();
  // Rendering is deliberately OUTSIDE the fetch try/catch above — a bug in
  // renderTeacherBody/renderTeacherSummary shouldn't be reported to the
  // teacher as a Firestore permissions problem, which sends debugging in
  // the wrong direction entirely.
  try{
    renderTeacherBody(); renderTeacherSummary();
  } catch(e){
    console.error('Teacher dashboard render failed:', e);
    document.getElementById('t-grid-container').innerHTML='<div class="t-loading">Something went wrong displaying this data. Check the browser console for details.</div>';
  }
  teacherPaintRefreshBar();
  teacherRefreshReportsBadge();
}

/* ── Keeping student progress current (2026-10-12) ──────────────────────
   loadAllStudents ran once, at page load, so every Done count, "who hasn't
   finished" list and Pending badge was as old as the tab — a console opened
   before the bell said nobody had finished anything all period. Now the
   roster is read again:
     - by the Refresh button beside the period filter, on any view that
       shows student progress;
     - when this tab comes back to the front (visibilitychange), on the
       views that redraw cheaply (TEACHER_AUTO_REFRESH_VIEWS);
     - about once a minute while Class activities (the board or an
       activity's page) is open and the tab is visible — the screen that is
       up during class. The timer stops on every other view and while the
       tab is hidden.
   One read at a time. A read that lands while the teacher is mid-drag,
   typing in a box, has the rename box open or is selecting text is thrown
   away rather than painted over that work; the next tick tries again. The
   activity board repaints from the config already in hand (no extra
   config read, nothing written), and an activity's page repaints only its
   Students block, so a song or drill playing in its Preview keeps going.

   Cost: each refresh reads every progress doc once (one read per student),
   so the timer is about 60 reads a minute per 60 students, only while the
   board is on screen. */
const TEACHER_REFRESH_MS=60000;
const TEACHER_AUTO_REFRESH_VIEWS=['activities','students','skills','responses','trouble'];
// Views where student progress isn't on screen at all — no Refresh bar.
const TEACHER_NO_REFRESH_BAR_VIEWS=['livequiz','mic','reports','tsongs','minutes'];   // minutes: its own Refresh (renderTeacherMinutes)
let teacherStudentsAt=0;          // when the roster on screen was read (ms); 0 = not yet
let teacherRefreshing=false;      // a read is out — no overlapping fetches
let teacherRefreshFailed=false;   // the last read failed; the screen shows the older roster
let teacherAutoRefreshTimer=null;
/* Would repainting now throw away something the teacher is in the middle
   of? A drag, the rename box, focus in any input/select (a release date
   half typed, a # box, a Move-to list), or a text selection in the body
   (copying names out of a "who hasn't finished" list). Returns what is in
   the way, '' for nothing, so the Refresh button can say why it did nothing. */
function teacherRefreshBlocker(){
  if(boardDragId) return 'a card is being dragged';
  // The rename box only while it is on screen: a box left open on a tab that
  // is now hidden used to block every refresh, the button's too, unseen.
  const edit=activityEditId ? document.querySelector('#t-grid-container .t-act-title-edit') : null;
  if(edit && edit.getClientRects().length) return 'a rename is open (Save or Cancel it)';
  const ae=document.activeElement;
  // The list's search box is the exception: a refresh repaints the rows
  // under it, never the box itself.
  if(ae && /^(INPUT|SELECT|TEXTAREA)$/.test(ae.tagName) && ae.closest('#teacher-app') && !ae.matches('[data-ta-search]')) return 'a box is being typed in (click outside it)';
  const sel=window.getSelection ? window.getSelection() : null;
  const grid=document.getElementById('t-grid-container');
  if(sel && !sel.isCollapsed && grid && sel.anchorNode && grid.contains(sel.anchorNode)) return 'text is selected';
  return '';
}
/* A Refresh click that was held back says why, in the bar, for a few
   seconds. The minute timer is held back silently, as before. */
let teacherRefreshHeld='', teacherRefreshHeldTimer=null;
function teacherNoteRefreshHeld(why){
  teacherRefreshHeld=why;
  clearTimeout(teacherRefreshHeldTimer);
  teacherRefreshHeldTimer=setTimeout(()=>{ teacherRefreshHeld=''; teacherPaintRefreshBar(); }, 8000);
  teacherPaintRefreshBar();
}
async function teacherRefreshStudents(opts){
  const manual=!!(opts&&opts.manual);
  if(teacherRefreshing) return;
  if(!manual && (document.hidden || !TEACHER_AUTO_REFRESH_VIEWS.includes(teacherView))) return;
  // The first load never landed (it painted an error) — run it again, whole.
  if(!teacherStudentsAt){ if(manual) loadAllStudents(); return; }
  const why=teacherRefreshBlocker();
  if(why){ if(manual) teacherNoteRefreshHeld(why); return; }
  teacherRefreshing=true; teacherPaintRefreshBar();
  let fresh=null;
  try{ fresh=await teacherFetchStudents(); }
  catch(e){ console.warn('[guitar-class] student progress refresh failed', e); }
  teacherRefreshing=false;
  teacherRefreshFailed=!fresh;
  // Failed, or something started while the read was out: keep the screen
  // (and its "as of" time) exactly as it is.
  const whyAfter = fresh ? teacherRefreshBlocker() : '';
  if(!fresh || whyAfter){ if(manual && whyAfter) teacherNoteRefreshHeld(whyAfter); else teacherPaintRefreshBar(); return; }
  allStudentsRaw=fresh;
  teacherApplyRosterFilter();
  teacherStudentsAt=Date.now();
  // A refresh that landed (the button's or the timer's) ends any "Not refreshed" note.
  teacherRefreshHeld=''; clearTimeout(teacherRefreshHeldTimer);
  try{
    renderTeacherSummary();
    if(teacherView==='activities'){
      // The board repaints whole. The list and an activity repaint the
      // list's rows and the Students boxes only — never the Preview, where a
      // song or drill may be playing. The button re-reads the class
      // settings too, like any write's repaint; the timer and tab-return
      // paint over the config already in hand.
      if(activityBoardMode) renderTeacherActivities(manual ? undefined : {cached:true});
      else if(manual) renderTeacherActivities();
      else { teacherPaintActivityList(false); if(activityDetailId) teacherRepaintActivityStudents(activityDetailId); }
    } else if(!TEACHER_NO_REFRESH_BAR_VIEWS.includes(teacherView)){
      // A student's page scrolls to the top when it's drawn (it's built for
      // opening one); a refresh keeps the teacher's place.
      const y=window.scrollY;
      renderTeacherBody();
      window.scrollTo({top:y});
    }
  }catch(e){ console.error('Teacher dashboard refresh render failed:', e); }
  teacherPaintRefreshBar();
}
/* An activity's page: repaint the [data-ta-live] boxes only — the Students
   tab's counts and its block (teacherActivityGridHtml), and for an exit
   check its turned-in line too (teacherCheckLiveParts) — plus the count on
   the Students tab itself. The Preview is left alone. */
function teacherRepaintActivityStudents(id){
  const box=document.getElementById('t-grid-container');
  const a=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  if(!box || !a) return;
  const parts = a.kind==='check' ? teacherCheckLiveParts(a) : {grid: teacherActivityGridHtml(a)};
  parts.counts=teacherActivityCountsHtml(a);
  Object.keys(parts).forEach(k=>{
    const el=box.querySelector(`[data-ta-live="${k}"]`);
    if(el) el.innerHTML=parts[k];
  });
  const lab=box.querySelector('[data-ta-students-label]');
  if(lab) lab.innerHTML=teacherStudentsTabLabelHtml(a);
}
/* Start or stop the once-a-minute timer to match the view and the tab's
   visibility, and repaint the bar. Called from renderTeacherBody (every view
   change goes through it) and from the visibilitychange listener. */
function teacherSyncAutoRefresh(){
  const want = teacherView==='activities' && !document.hidden;
  if(want && !teacherAutoRefreshTimer){
    teacherAutoRefreshTimer=setInterval(()=>{
      // A Refresh click or a tab return a moment ago already did this tick's work.
      if(Date.now()-teacherStudentsAt < TEACHER_REFRESH_MS-5000) return;
      teacherRefreshStudents();
      teacherRefreshReportsBadge();
    }, TEACHER_REFRESH_MS);
  } else if(!want && teacherAutoRefreshTimer){
    clearInterval(teacherAutoRefreshTimer);
    teacherAutoRefreshTimer=null;
  }
  teacherPaintRefreshBar();
}
// The bar beside the period filter: Refresh, and how old the progress on screen is.
function teacherPaintRefreshBar(){
  const bar=document.getElementById('t-refresh-bar');
  if(!bar) return;
  bar.style.display = TEACHER_NO_REFRESH_BAR_VIEWS.includes(teacherView) ? 'none' : 'inline-flex';
  const btn=bar.querySelector('[data-refresh-students]');
  if(btn) btn.disabled=teacherRefreshing;
  const when=bar.querySelector('[data-refresh-when]');
  if(!when) return;
  const at=teacherStudentsAt ? new Date(teacherStudentsAt).toLocaleTimeString([], {hour:'numeric', minute:'2-digit', second:'2-digit'}) : '';
  when.textContent = !teacherStudentsAt
    ? (teacherRefreshing ? 'Loading student progress…' : teacherRefreshFailed ? 'Could not load student progress.' : '')
    : teacherRefreshing ? `Student progress as of ${at} · refreshing…`
    : teacherRefreshHeld ? `Not refreshed: ${teacherRefreshHeld} · showing progress as of ${at}`
    : teacherRefreshFailed ? `Could not refresh — showing progress as of ${at}`
    : `Student progress as of ${at}` + (teacherView==='activities' ? ' · refreshes every minute' : '');
}

/* ── Reports: how many are new (2026-10-12) ─────────────────────────────
   A badge on the Reports button counting reports filed since the newest one
   this console has shown. "Seen" is that report's createdAt, kept in
   localStorage as exact {seconds, nanoseconds} — milliseconds would round
   the newest report down and count it as new forever. Storage can throw
   (blocked site data, some private windows), so every touch is wrapped and
   an in-memory copy stands in for the rest of the session. Never stored
   ⇒ every report counts as new, until Reports is opened once.

   The count is a query for createdAt > seen, so it costs one read per NEW
   report (a minimum of one), not one per report. */
const TEACHER_REPORTS_SEEN_KEY='gc-teacher-reports-seen';
const TEACHER_REPORTS_BADGE_MAX=100;   // shown as "99+" at this many
let teacherReportsSeenMem=null;
let teacherReportsBadgeReq=0;          // a newer count (or opening Reports) drops an older one in flight
function teacherReportsSeen(){
  let v=null;
  try{ v=JSON.parse(localStorage.getItem(TEACHER_REPORTS_SEEN_KEY)||'null'); }catch(e){ v=null; }
  v=v||teacherReportsSeenMem;
  return (v && Number.isInteger(v.s) && Number.isInteger(v.n)) ? v : null;
}
function teacherMarkReportsSeen(ts){
  if(!ts || typeof ts.seconds!=='number' || typeof ts.nanoseconds!=='number') return;
  const cur=teacherReportsSeen();
  if(cur && (cur.s>ts.seconds || (cur.s===ts.seconds && cur.n>=ts.nanoseconds))) return;   // never moves backwards
  const v={s:ts.seconds, n:ts.nanoseconds};
  teacherReportsSeenMem=v;
  try{ localStorage.setItem(TEACHER_REPORTS_SEEN_KEY, JSON.stringify(v)); }catch(e){}
}
async function teacherRefreshReportsBadge(){
  const req=++teacherReportsBadgeReq;
  let n;
  try{
    await ensureDb();
    const seen=teacherReportsSeen();
    let q=db.collection('issueReports');
    if(seen) q=q.where('createdAt','>',new firebase.firestore.Timestamp(seen.s, seen.n));
    const snap=await q.orderBy('createdAt','desc').limit(TEACHER_REPORTS_BADGE_MAX).get();
    n=snap.size;
  }catch(e){
    console.warn('[guitar-class] could not count new reports', e);
    return;   // leave whatever badge is up
  }
  if(req!==teacherReportsBadgeReq) return;
  teacherPaintReportsBadge(n);
}
function teacherPaintReportsBadge(n){
  const btn=document.querySelector('#t-side [data-view="reports"]');
  if(!btn) return;
  let b=btn.querySelector('.t-reports-badge');
  if(!n){
    if(b) b.remove();
    btn.removeAttribute('aria-label');
    return;
  }
  const label = n>=TEACHER_REPORTS_BADGE_MAX ? `${TEACHER_REPORTS_BADGE_MAX-1}+` : String(n);
  if(!b){
    b=document.createElement('span');
    b.className='stu-period stu-blocked t-reports-badge';
    b.setAttribute('aria-hidden','true');   // the button's aria-label says it in words
    btn.appendChild(b);
  }
  b.textContent=label;
  b.title=`${label} new since you last opened Reports`;
  btn.setAttribute('aria-label', `Reports, ${label} new`);
}

function renderTeacherSummary(){
  const w=SETS.find(x=>x.id===teacherSetId); if(!w||!w.skills||!w.skills.length) return;
  const total=allStudents.length;
  const complete=allStudents.filter(s=>w.skills.every(sk=>s.skills[sk.id]==='gotit')).length;
  const none=allStudents.filter(s=>w.skills.every(sk=>!s.skills[sk.id]||s.skills[sk.id]==='none')).length;
  const inprog=total-complete-none;
  document.getElementById('t-summary').innerHTML=`
    <div class="t-scard"><div class="t-scard-lbl">Students</div><div class="t-scard-val">${total}</div></div>
    <div class="t-scard"><div class="t-scard-lbl">All done</div><div class="t-scard-val">${complete}</div></div>
    <div class="t-scard"><div class="t-scard-lbl">In progress</div><div class="t-scard-val">${inprog}</div></div>
    <div class="t-scard"><div class="t-scard-lbl">Not started</div><div class="t-scard-val">${none}</div></div>`;
}

/* Shared tck icon markup (✓ / ○ / –) for a skill status — used by the skills
   grid below and by the Students detail page's skill list, so both render
   identical DOM instead of two copies of the same three SVGs drifting apart. */
const TCK_CHECK_SVG=`<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const TCK_WORK_SVG=`<svg width="9" height="9" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="1.8"/></svg>`;
const TCK_MINUS_SVG=`<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M3 6h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
// games.coachSkill[id].level / .last are 1/2/3 — same three tiers coach.js
// shows the student (coach.level.needsWork/gettingIt/great in i18n.js).
// Mirrored here in plain English rather than through t(): the teacher
// dashboard has no i18n wiring anywhere else in this file (it's gated to a
// single TEACHER_EMAIL account), so adding it just for these two tooltips
// would be new, inconsistent scope rather than following existing pattern.
const COACH_LEVEL_LABEL={1:'Needs work',2:'You’re getting it',3:'Great'};
function coachLevelLabel(n){ return COACH_LEVEL_LABEL[n]||null; }
/* A "gotit" cell can mean three different things underneath — plain
   self-declared (no Coach data), a Listening Coach pass, or a checklist-gate
   override (student clicked "Mark it anyway" because the mic/room wasn't
   cooperating). All three still read as a normal green checkmark — the
   distinction is a border treatment plus a tooltip, not a different color,
   so an override never LOOKS like a failure or a lesser checkmark; it's
   informational for the teacher, not a mark against the student (see
   coachGateMarkAnyway in app.js). coachRec is the student's
   games.coachSkill[skillId] record, or undefined/null for a plain self-check.

   `level` is best-ever, never downgraded (coach.js: Math.max(prev.level||0,
   overallLevel)) — but `override` IS a one-way flag that coachGateMarkAnyway
   sets and nothing ever clears, even once a later real Coach pass updates
   level/last/at on the same record (Object.assign keeps the old override
   key). So a stale override must never outrank a qualifying level: check
   level against the same COACH_GATE_MIN_LEVEL (2 = "Good") app.js uses to
   let a skill past the gate FIRST, and only fall back to the override
   marker when the record hasn't reached that bar. */
/* Same one-way-override caveat applies to games.drillSkill records (app.js
   drillGateMarkAnyway / sdRecordSkillBest): `best` only ever goes up, but
   `override` is never cleared even after a later qualifying run. So a
   qualifying best must outrank a stale override — check best FIRST.

   Both thresholds are READ FROM app.js (loaded first) rather than copied
   here. This file used to carry its own drill-gate constant of 9, under a
   "keep in sync with app.js DRILL_GATE_MIN" comment naming a constant that
   does not exist: app.js scales DRILL_GATE_PCT (0.9) by each drill's own
   `rounds`. The two agree only while every shuffle drill uses rounds:10, so
   the first drill with a different count would verify for the student and
   still read as unverified on this dashboard. */
function teacherDrillGate(sid){
  const hit = skillDrillStep(sid);
  const rounds = (hit && hit.drill && hit.drill.rounds) || SD_ROUNDS;
  return { min: drillGateThreshold(sid), rounds };
}
function tckSpanHtml(status, coachRec, drillRec, sid){
  /* Lazy: skillDrillStep() walks every set, and this function runs once per
     student per skill (30 students x ~25 skills on the grid). Only a skill
     that actually HAS a drill record ever needs the numbers. */
  let _gate = null;
  const drillGate = () => (_gate || (_gate = teacherDrillGate(sid)));
  if(status==='gotit'){
    if(coachRec && coachRec.level>=COACH_GATE_MIN_LEVEL){
      const lvl=coachLevelLabel(coachRec.level)||'checked';
      const dateStr=coachRec.at||'';
      const title=`Listening Coach verified — ${lvl}${dateStr?(' · '+dateStr):''}`;
      return `<span class="tck yes" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:2px solid var(--blue-text)" title="${escAttr(title)}">${TCK_CHECK_SVG}</span>`;
    }
    if(drillRec && (drillRec.best||0)>=drillGate().min){
      const dateStr=drillRec.at||'';
      const title=`Shuffle-deck verified — ${drillRec.best} of ${drillGate().rounds} within the time limit${dateStr?(' · '+dateStr):''}`;
      return `<span class="tck yes" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:2px solid var(--green-text)" title="${escAttr(title)}">${TCK_CHECK_SVG}</span>`;
    }
    if(coachRec && coachRec.override){
      const dateStr=coachRec.overrideAt||coachRec.at||'';
      const priorLevel=coachLevelLabel(coachRec.level);
      const priorPart=priorLevel?` Last Listening Coach attempt: ${priorLevel}.`:'';
      const title=`Marked "I’ve got it!" without a passing Listening Coach check${dateStr?(' on '+dateStr):''}.${priorPart} This usually means the mic or the room wasn’t cooperating, not that the student can’t play it — worth a quick check-in if you’re not sure.`;
      return `<span class="tck yes" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:2px dashed var(--text3)" title="${escAttr(title)}">${TCK_CHECK_SVG}</span>`;
    }
    if(drillRec && drillRec.override){
      const dateStr=drillRec.overrideAt||drillRec.at||'';
      const priorPart=(drillRec.best||0)?` Best deck run so far: ${drillRec.best} of ${drillGate().rounds}.`:' No deck run recorded.';
      const title=`Marked "I’ve got it!" without a ${drillGate().min}-of-${drillGate().rounds} shuffle-deck run${dateStr?(' on '+dateStr):''}.${priorPart} The deck takes under a minute — worth a quick check-in if you’re not sure.`;
      return `<span class="tck yes" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:2px dashed var(--text3)" title="${escAttr(title)}">${TCK_CHECK_SVG}</span>`;
    }
    return `<span class="tck yes" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px">${TCK_CHECK_SVG}</span>`;
  }
  if(status==='working') return `<span class="tck" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:var(--amber-bg);color:var(--amber-text)">${TCK_WORK_SVG}</span>`;
  return `<span class="tck no" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px">${TCK_MINUS_SVG}</span>`;
}

function renderTeacherGrid(){
  renderTeacherSummary();
  const w=SETS.find(x=>x.id===teacherSetId);
  if(!w||!w.skills||w.skills.length===0){ document.getElementById('t-grid-container').innerHTML='<div class="t-loading">No skills for this set yet.</div>'; return; }
  if(allStudents.length===0){ document.getElementById('t-grid-container').innerHTML='<div class="t-loading">No student data yet — students need to sign in and check off skills first.</div>'; return; }
  // Decorate-sort-undecorate: each student's "gotit" count used to be
  // recomputed from scratch by every comparison the sort made, then a third
  // time per row below — O(n log n) skill-filters on a table redrawn on
  // essentially every teacher-console navigation. Compute it once per
  // student instead, reused for both the ordering and the Progress pill.
  const doneCounts=new Map(allStudents.map(stu=>[stu.uid, w.skills.filter(s=>stu.skills[s.id]==='gotit').length]));
  const sorted=[...allStudents].sort((a,b)=>doneCounts.get(b.uid)-doneCounts.get(a.uid));
  const headerCells=w.skills.map(s=>`<th title="${escAttr(s.text)}">${escHtml(abbreviate(s.text))}</th>`).join('');
  const rows=sorted.map(stu=>{
    const done=doneCounts.get(stu.uid);
    const total=w.skills.length;
    const pct=Math.round(done/total*100);
    const pillClass=pct===100?'pp-hi':pct>=50?'pp-mid':'pp-lo';
    const displayName=stu.name||stu.email||stu.uid.slice(0,8)+'…';
    const cells=w.skills.map(s=>`<td>${tckSpanHtml(stu.skills[s.id]||'none', stu.coachSkill&&stu.coachSkill[s.id], stu.drillSkill&&stu.drillSkill[s.id], s.id)}</td>`).join('');
    // The name cell doubles as a link into the Students detail page — handled
    // by the delegated data-uid listener in showTeacherApp. cursor:pointer is
    // the only visual cue, by design: a restrained "clickable row", not a link.
    return `<tr><td class="nc" data-open-student data-uid="${escAttr(stu.uid)}" style="cursor:pointer" title="${escAttr(displayName)}">${escHtml(displayName)}</td>${cells}<td><span class="ppill ${pillClass}">${done} / ${total}</span></td></tr>`;
  }).join('');
  document.getElementById('t-grid-container').innerHTML=`<div class="t-grid-wrap"><table><thead><tr><th class="nc">Student</th>${headerCells}<th>Progress</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function abbreviate(text){ const words=text.split(' '); if(words.length<=4) return text; return words.slice(0,3).join(' ')+'…'; }

/* ── Teacher views: skill grid ⇄ responses ⇄ games ⇄ trouble ⇄ Students
   (Session 6.2, extended for the Students view; one sidebar since Layout A,
   2026-11-08) ── Read-only. Uses
   the same one-shot student fetch (no extra reads). Students has two
   screens (roster / one student's detail); studentDetailUid tracks which
   one renderTeacherBody shows, kept separate from teacherView so a name
   click in the skills grid can jump straight to a student's detail without
   a view flag of its own. */
/* The console opens on Class activities — the list and an activity's
   preview are what get used before and during a period, where the skills
   grid is a look-back. showTeacherApp marks it in the sidebar
   (applyTeacherViewChrome) once the sidebar is built. */
let teacherView='activities';
let studentDetailUid=null;
// Which activity's detail is showing in the Class activities view — same
// "list vs. one detail page" split as studentDetailUid above, its own flag
// so a title click in the activities table can drill in without a view
// flag of its own either.
let activityDetailId=null;
// Which row (if any) currently has its rename box open. Purely local view
// state, cleared on every save/cancel and whenever the tab is re-entered. It
// stays open, typed text and all, while another detail tab is up.
let activityEditId=null;
/* Focus-view activities (view:'focus') default their preview to a full step
   list — a fast pre-class read of everything at once. "Preview as student"
   switches THIS SAME detail page to the real one-step-at-a-time shape
   instead: numbered step buttons, one step on screen, a Next button. Purely
   local view state (id -> on/off, id -> current step index), never
   persisted and never touching caStepDone/classActivities — a teacher
   stepping through a preview marks nothing done for real. */
let taFocusPreviewOn={};
let taFocusPreviewIdx={};
let taFocusPreviewPath={};   // id -> path key picked in the preview (paths activities); first path when unset
/* ── Archive / Delete (Class activities view) ──────────────────────────
   Two console-only ways to take an activity out of circulation, both stored
   on config/class like every other knob in this view:

     archivedActivities  id -> true   Tucked away. Students stop seeing it
                                      (In-Class Activities, both groups) and it stops
                                      gating the site, but its release date,
                                      rename, teaching-order number and
                                      per-student clears are all kept, so
                                      Restore puts it back exactly as it was,
                                      except a pin: Archive unpins.
     deletedActivities   id -> true   Gone. Same student-side effect, plus
                                      everything this console ever set for
                                      it is wiped on the way out. Restore
                                      brings back a BLANK activity: undated,
                                      un-renamed, at its shipped number —
                                      i.e. invisible until it's published
                                      again from scratch.

   What neither can touch, and the note in the table says so: the card
   itself ships in class-activities.js, so only a git push really removes
   it; and students' completion records live on their own progress docs,
   which the teacher cannot write (firestore.rules) and which are grade
   data worth keeping regardless — archive a semester's work and the Done
   counts are still there when you restore it.

   The two are mutually exclusive by construction — each writer clears the
   other flag — so a row is live, archived or deleted, never two at once.

   On the board, an ARCHIVED card stays inside its own module, folded into
   that section's "Archived (N)" disclosure — it still holds its place, so
   Restore puts it back where it was. A DELETED one is taken off the board
   as well, so it lands back in Built with everything else unplaced. */
/* ── The sidebar (Layout A, 2026-11-08) ──────────────────────────────────
   Four groups, in Jonathan's order. Every entry is a view renderTeacherBody
   already knows; nothing here decides what a view shows. There is no
   "Modules" item (his call). The icons are the ones the old top-bar buttons
   carried; Skills grid had none and got a small grid. Class activities
   alone has a tree of units under it (teacherSideTreeRows, 2026-11-09). */
const TEACHER_NAV_ICON={
  activities:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3h6v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/><path d="m9 13 2 2 4-4"/>',
  songs:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  tsongs:'<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/><path d="m10 8 5 2.5-5 2.5z"/>',
  livequiz:'<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
  students:'<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>',
  skills:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="m14.5 17.5 2 2 4-4"/>',
  trouble:'<path d="M5 3v18"/><path d="M5 4h11l-3 4 3 4H5"/>',
  minutes:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 2h6"/>',
  responses:'<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
  manage:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  games:'<rect x="2.5" y="6.5" width="19" height="11" rx="5.5"/><path d="M7 9.5v3M5.5 11h3"/><circle cx="15.7" cy="10.7" r="0.95" fill="currentColor" stroke="none"/><circle cx="17.6" cy="12.6" r="0.95" fill="currentColor" stroke="none"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  errors:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none"/>',
  reports:'<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4"/><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none"/>',
};
const TEACHER_NAV=[
  {group:'Teach', items:[['activities','Class activities'],['songs','Songs'],['tsongs','Teacher view songs'],['livequiz','Live In-Class Games']]},
  {group:'Students', items:[['students','Students'],['skills','Skills grid'],['trouble','Trouble spots'],['minutes','Practice minutes'],['responses','Responses']]},
  {group:'Set up', items:[['manage','Manage'],['games','Games']]},
  {group:'Tools', items:[['mic','Mic recordings'],['errors','Error log'],['reports','Reports']]},
];
/* The units tree under Class activities (2026-11-09). One row per group the
   Class activities list shows: "Built, not assigned" first, then the units
   newest first, then Unsorted. A click shows that unit in the list
   (teacherOpenUnitFromSide). It is the only item with a tree and it writes
   nothing. Open or folded is remembered per browser; it starts open. */
let teacherSideTreeOpen=true;
try{ teacherSideTreeOpen=localStorage.getItem('teacherSideTree')!=='0'; }catch(e){}
function teacherNavItemHtml(v, label){
  const btn=`<button type="button" class="t-vt t-side-item" data-view="${v}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${TEACHER_NAV_ICON[v]||''}</svg><span class="t-side-label">${escHtml(label)}</span></button>`;
  if(v!=='activities') return btn;
  // The fold arrow sits beside the item, never inside it (a button in a button is invalid).
  return `<div class="t-side-row">${btn}<button type="button" class="t-side-fold" data-side-fold aria-controls="t-side-tree" aria-expanded="${teacherSideTreeOpen}" aria-label="${teacherSideTreeOpen?'Hide units':'Show units'}" title="${teacherSideTreeOpen?'Hide units':'Show units'}"><span class="t-side-caret" aria-hidden="true"></span></button></div>`
    +`<div class="t-side-tree" id="t-side-tree" role="group" aria-label="Units"${teacherSideTreeOpen?'':' hidden'}></div>`;
}
function teacherNavHtml(){
  return TEACHER_NAV.map(g=>`<div class="t-side-group" role="group" aria-label="${escAttr(g.group)}"><div class="t-side-head" aria-hidden="true">${escHtml(g.group)}</div>`
    +g.items.map(([v,label])=>teacherNavItemHtml(v, label)).join('')
    +`</div>`).join('');
}
/* The tree's rows, from the list's own groups so the two cannot disagree:
   Built first, then every other group in the list's order, each with the
   count the list's heading shows. */
function teacherSideTreeRows(model){
  const groups=model.groups;
  return groups.filter(g=>g.key==='built').concat(groups.filter(g=>g.key!=='built')).map(g=>({
    key:g.key,
    label:g.key==='built' ? 'Built, not assigned' : String(g.label).replace(' — ', ' · '),
    title:g.label,
    n:g.ids.length,
  }));
}
let teacherSideTreeLast=null;
/* Repaints the rows. Cheap to call often: it writes only when the HTML
   changed. The highlighted row is the one group the list shows open on its
   Units screen with nothing typed in the search box. */
function teacherPaintSideTree(model){
  const host=document.getElementById('t-side-tree');
  if(!host || !teacherClassConfigLoaded || !teacherClassConfig) return;
  if(!model) model=teacherActivityListModel(teacherClassConfig);
  let on=null;
  if(teacherView==='activities' && teacherActivityScreen()==='split' && activityListFilter==='units' && !activityListQuery.trim()){
    const open=teacherUnitOpenMap(model, '');
    const shown=model.groups.filter(g=>open[g.key]);
    if(shown.length===1) on=shown[0].key;
    // Several open: the picked card's unit, if it is one of them.
    else { const pg=activityDetailId && shown.find(g=>g.ids.includes(activityDetailId)); if(pg) on=pg.key; }
  }
  const html=teacherSideTreeRows(model).map(r=>`<button type="button" class="t-side-sub${r.key===on?' on':''}" data-side-unit="${escAttr(r.key)}" title="${escAttr(r.title)}"${r.key===on?' aria-current="true"':''}><span class="t-side-sub-name">${escHtml(r.label)}</span><span class="t-side-sub-n">${r.n}</span></button>`).join('');
  if(html===teacherSideTreeLast && host.childNodes.length) return;
  teacherSideTreeLast=html;
  host.innerHTML=html;
}
function teacherToggleSideTree(){
  teacherSideTreeOpen=!teacherSideTreeOpen;
  try{ localStorage.setItem('teacherSideTree', teacherSideTreeOpen?'1':'0'); }catch(e){}
  const tree=document.getElementById('t-side-tree'); if(tree) tree.hidden=!teacherSideTreeOpen;
  const f=document.querySelector('#t-side [data-side-fold]');
  if(f){
    f.setAttribute('aria-expanded', String(teacherSideTreeOpen));
    f.setAttribute('aria-label', teacherSideTreeOpen?'Hide units':'Show units');
    f.title=teacherSideTreeOpen?'Hide units':'Show units';
  }
}
/* Marks the sidebar item for view v: .on for the look, aria-current="page"
   for screen readers (only the current item carries it). */
function applyTeacherViewChrome(v){
  document.querySelectorAll('.t-vt').forEach(b=>{
    const on=b.dataset.view===v;
    b.classList.toggle('on',on);
    if(on) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');
  });
  const legend=document.getElementById('t-legend'); if(legend) legend.style.display = v==='skills' ? '' : 'none';
  // Only the skills grid is per-set: every other view hides the set tabs
  // and the skill summary.
  const classWide = v!=='skills';
  const tabs=document.getElementById('t-week-tabs'); if(tabs) tabs.style.display = classWide ? 'none' : '';
  const summ=document.getElementById('t-summary'); if(summ) summ.style.display = classWide ? 'none' : '';
  // Which tree row is lit depends on the view.
  teacherPaintSideTree();
}
function setTeacherView(v){
  // A jump to a unit that never got painted must not fire on a later visit.
  if(v!=='activities') activityListJump=null;
  // The Teacher view songs card plays the record — leaving the tab stops it.
  // So does an activity's Preview (a song, a snippet, a TAB sequence).
  // So does the detail screen (opened from Songs or a student's page) when
  // the sidebar or a tree row brings back the list.
  const leavingDetail = teacherView==='activities' && teacherActivityScreen()==='detail';
  if(((teacherView==='tsongs' && v!=='tsongs') || (teacherView==='activities' && v!=='activities') || leavingDetail) && typeof stopCardAudio==='function') stopCardAudio();
  teacherView=v;
  if(v==='students') studentDetailUid=null; // clicking the tab always starts back at the roster
  // Songs always starts back at its list, nothing mid-rename. An activity
  // picked in the Class activities list stays picked for the way back.
  if(v==='songs'){ if(activityDetailFrom!=='activities') activityDetailId=null; activityEditId=null; }
  /* Class activities opens on its list + detail split. The activity picked
     there stays picked when you come back to the tab; one opened from
     somewhere else (Songs, a student's page) does not — the list's own pick
     (activityListPickId) comes back instead. */
  if(v==='activities'){
    activityDetailId=activityListPickId;
    activityDetailFrom='activities'; activityBoardMode=false; activityEditId=null;
  }
  applyTeacherViewChrome(v);
  renderTeacherBody();
}
// Jumps straight to a student's detail page — from a roster row or a name
// cell in the skills grid — without going through the Students tab click.
function openStudentDetail(uid){
  // Back from an activity opened on this student's page: its Preview may be playing.
  if(teacherView==='activities' && typeof stopCardAudio==='function') stopCardAudio();
  teacherView='students'; studentDetailUid=uid;
  applyTeacherViewChrome('students');
  renderTeacherBody();
}
function backToStudentsRoster(){ studentDetailUid=null; renderTeacherBody(); }
/* ── Class activities: which screen is up (Layout A, 2026-11-08) ─────────
   Three screens share teacherView 'activities':
     'split'  the list (left) and the picked activity (right, in tabs) — the
              default, and what the tab always opens on;
     'board'  "Arrange board": the full drag-and-drop board, unchanged,
              with a Back to list button;
     'detail' the tabbed detail alone, with a Back button — an activity
              opened from somewhere else (a Songs row, a student's "Blocked
              by" row), so Back returns there.
   activityDetailId is the picked activity in 'split' and the one shown in
   'detail'. It survives a trip to the board, so Back to list lands on it.
   activityListPickId is the split's pick alone: opening a card from Songs
   or a student's page overwrites activityDetailId, not this, so the list
   still has its pick when the teacher comes back to it. */
let activityBoardMode=false;
let activityListPickId=null;
let activityDetailFromUid=null;    // the student page an activity was opened from
/* Which list the detail page was opened from: 'activities' (the list or the
   board), 'songs' (the Songs view) or 'student' (a "Blocked by" row on
   activityDetailFromUid's page). Back returns there and that tab stays lit. */
let activityDetailFrom='activities';
function teacherActivityScreen(){
  if(activityBoardMode) return 'board';
  return (activityDetailId && activityDetailFrom!=='activities') ? 'detail' : 'split';
}
/* Where the board was scrolled when a card on it was opened, so Arrange
   board lands back there. */
let activityListScrollY = 0;
let restoreActivityScroll = false;
/* Opens one activity — from a card on the board (its title or Preview), a
   Songs row, or a "Blocked by" row on a student's page. From the board it
   lands in the split view with that card picked; from anywhere else on the
   tabbed detail alone, with Back. Opening is the one moment the window
   scrolls to the top: the detail pages re-render in place (a tab, a
   Preview-as-student toggle, a Clear), and jumping mid-grid is its own bug.
   window, not a scroll pane: the dashboard is a plain long page. */
function openActivityDetail(id){
  const from = teacherView==='songs' ? 'songs' : (teacherView==='students' && studentDetailUid) ? 'student' : 'activities';
  if(teacherView==='activities' && activityBoardMode) activityListScrollY=window.scrollY;
  activityDetailFrom=from;
  activityDetailFromUid = from==='student' ? studentDetailUid : null;
  activityBoardMode=false; activityEditId=null;
  teacherView='activities'; activityDetailId=id;
  if(from==='activities'){
    activityListPickId=id;
    /* From the board's Preview: the list shows the card's unit, the way a
       sidebar tree click shows one unit (every unit set, only this one open),
       so a fold the tree or the teacher set can't hide the card's row and the
       tree's lit row follows it. */
    if(teacherClassConfigLoaded && teacherClassConfig){
      const groups=teacherActivityListModel(teacherClassConfig).groups, g=groups.find(x=>x.ids.includes(id));
      if(g){ groups.forEach(x=>{ activityUnitOpen[x.key]=(x.key===g.key); }); }
    }
  }
  applyTeacherViewChrome(from==='songs' ? 'songs' : from==='student' ? 'students' : 'activities');
  renderTeacherBody();
  window.scrollTo({top:0});
}
function backToActivitiesList(){
  const from=activityDetailFrom, uid=activityDetailFromUid;
  activityDetailFrom='activities'; activityDetailFromUid=null;
  if(from==='songs'){ activityDetailId=null; setTeacherView('songs'); window.scrollTo({top:0}); return; }
  if(from==='student' && uid){ activityDetailId=null; openStudentDetail(uid); return; }
  activityBoardMode=false;
  renderTeacherBody();
}
/* Arrange board / Back to list. The board is today's full board, drawn by
   renderTeacherActivities exactly as before; the list's picked activity is
   kept for the way back. */
function teacherOpenArrangeBoard(){
  // The board has no Preview: whatever the picked card was playing stops.
  if(typeof stopCardAudio==='function') stopCardAudio();
  // From an activity opened elsewhere (Songs, a student): the board belongs to Class activities.
  if(activityDetailFrom!=='activities'){ activityDetailFrom='activities'; activityDetailFromUid=null; activityDetailId=activityListPickId; applyTeacherViewChrome('activities'); }
  activityBoardMode=true; activityEditId=null;
  if(activityListScrollY) restoreActivityScroll=true;
  renderTeacherActivities();
}
function teacherCloseArrangeBoard(){
  activityBoardMode=false; activityEditId=null;
  activityListScrollY=window.scrollY;
  renderTeacherActivities({cached:true});
  window.scrollTo({top:0});
}
function renderTeacherBody(){
  teacherSyncAutoRefresh();   // the progress timer runs on Class activities only
  if(teacherView==='games') renderTeacherGames();
  else if(teacherView==='responses') renderTeacherResponses();
  else if(teacherView==='trouble') renderTeacherTrouble();
  else if(teacherView==='students') studentDetailUid ? renderTeacherStudentDetail(studentDetailUid) : renderTeacherStudents();
  else if(teacherView==='minutes') renderTeacherMinutes();
  else if(teacherView==='manage') renderTeacherManage();
  else if(teacherView==='activities') renderTeacherActivities();
  else if(teacherView==='songs') renderTeacherSongs();
  else if(teacherView==='tsongs') renderTeacherViewSongs();
  else if(teacherView==='reports') renderTeacherReports();
  else if(teacherView==='mic') renderTeacherMic();
  else if(teacherView==='errors') renderTeacherErrors();
  else if(teacherView==='livequiz'){ if(typeof renderTeacherLiveQuiz==='function') renderTeacherLiveQuiz(); }
  else renderTeacherGrid();
}

/* ── Trouble spots (class-wide, all loaded modules) ──────────────────────
   Uses only allStudents (already fully loaded for the skills grid) — no new
   Firestore reads. Ranks skills by lowest percent-of-class-has-it-as-gotit,
   skipping skills no student has touched yet (nothing to spotlight there),
   plus a per-module average completion bar. */
function renderTeacherTrouble(){
  const box=document.getElementById('t-grid-container');
  if(allStudents.length===0){ box.innerHTML='<div class="t-loading">No student data yet — students need to sign in and check off skills first.</div>'; return; }
  const total=allStudents.length;

  const modBars=MODULE_MANIFEST.map(m=>{
    const ids=[];
    SETS.forEach(w=>{ if(w.moduleNum===m.num && w.skills) w.skills.forEach(sk=>ids.push(sk.id)); });
    if(!ids.length) return '';
    let gotit=0;
    allStudents.forEach(s=>ids.forEach(id=>{ if(s.skills[id]==='gotit') gotit++; }));
    const pct=Math.round(gotit/(ids.length*total)*100);
    const pillClass=pct>=70?'pp-hi':pct>=40?'pp-mid':'pp-lo';
    const fill=pct>=70?'var(--green-text)':pct>=40?'var(--amber-text)':'#a32d2d';
    return `<div class="t-scard" style="margin-bottom:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px">
        <div class="t-scard-lbl" style="margin-bottom:0" title="${escAttr(m.name)}">Module ${m.num} — ${escHtml(abbreviate(m.name))}</div>
        <span class="ppill ${pillClass}">${pct}%</span>
      </div>
      <div style="height:6px;border-radius:4px;background:var(--bg2);overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${fill};border-radius:4px"></div>
      </div>
    </div>`;
  }).join('');

  const skillRows=[];
  SETS.forEach(w=>{
    if(!w.skills||!w.skills.length) return;
    const modName=(MODULE_MANIFEST.find(m=>m.num===w.moduleNum)||{}).name||('Module '+w.moduleNum);
    w.skills.forEach(sk=>{
      let gotit=0, started=0;
      allStudents.forEach(s=>{
        const st=s.skills[sk.id];
        if(st==='gotit') gotit++;
        if(st==='gotit'||st==='working') started++;
      });
      if(started===0) return; // no one has touched it yet — not a trouble spot
      skillRows.push({ text:sk.text, where:`${modName} · ${w.label}`, pct:Math.round(gotit/total*100) });
    });
  });
  skillRows.sort((a,b)=>a.pct-b.pct);
  const worst=skillRows.slice(0,20);
  const skillTable = worst.length
    ? `<div class="t-grid-wrap"><table><thead><tr><th class="nc">Skill</th><th>Where</th><th>Class has it</th></tr></thead><tbody>${
        worst.map(r=>{
          const pillClass=r.pct>=70?'pp-hi':r.pct>=40?'pp-mid':'pp-lo';
          return `<tr><td class="nc" title="${escAttr(r.text)}">${escHtml(abbreviate(r.text))}</td><td>${escHtml(r.where)}</td><td><span class="ppill ${pillClass}">${r.pct}%</span></td></tr>`;
        }).join('')
      }</tbody></table></div>`
    : '<div class="t-loading">No skills have been started by anyone yet.</div>';

  box.innerHTML = `
    <div class="tr-meta">Per-module average completion, then the class's least-mastered skills (lowest first) — skills no one has started yet are left out so the list stays focused.</div>
    ${modBars}
    <div class="t-scard-lbl" style="margin:16px 0 8px">Least-mastered skills</div>
    ${skillTable}`;
}

