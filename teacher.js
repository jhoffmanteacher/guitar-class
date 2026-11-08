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
  /* The sidebar (Layout A, 2026-11-08) — one button per view, grouped, built
     from TEACHER_NAV. It replaced the row of view buttons that used to sit
     above the content (index.html's static three plus ten injected here).
     Same data-view values, same setTeacherView; a delegated click on the
     shell (below) does the switching. Guarded so re-entering teacher mode
     doesn't build it twice. */
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
      const navBtn=e.target.closest('#t-side [data-view]');
      if(navBtn){ setTeacherView(navBtn.dataset.view); return; }
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
      const whoBox=e.target.closest('[data-set-activity-student]');
      if(whoBox){ teacherSetActivityStudent(whoBox.dataset.id, whoBox.dataset.uid, whoBox.checked); return; }
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
  // Mark the view the console opens on (Class activities) in the sidebar.
  applyTeacherViewChrome(teacherView);
  loadAllStudents();
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
      out.push({uid:doc.id,skills,name:String(data.name||''),email:String(data.email||''),responses:data.responses||{},coachSkill:gamesData.coachSkill||{},drillSkill:gamesData.drillSkill||{},classActivities:data.classActivities||{},exitChecks:data.exitChecks||{},period:data.period||'',songOpens});
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
   (copying names out of a "who hasn't finished" list). */
function teacherRefreshSafe(){
  if(boardDragId) return false;
  if(activityEditId) return false;
  const ae=document.activeElement;
  if(ae && /^(INPUT|SELECT|TEXTAREA)$/.test(ae.tagName) && ae.closest('#teacher-app')) return false;
  const sel=window.getSelection ? window.getSelection() : null;
  const grid=document.getElementById('t-grid-container');
  if(sel && !sel.isCollapsed && grid && sel.anchorNode && grid.contains(sel.anchorNode)) return false;
  return true;
}
async function teacherRefreshStudents(opts){
  const manual=!!(opts&&opts.manual);
  if(teacherRefreshing) return;
  if(!manual && (document.hidden || !TEACHER_AUTO_REFRESH_VIEWS.includes(teacherView))) return;
  // The first load never landed (it painted an error) — run it again, whole.
  if(!teacherStudentsAt){ if(manual) loadAllStudents(); return; }
  if(!teacherRefreshSafe()) return;
  teacherRefreshing=true; teacherPaintRefreshBar();
  let fresh=null;
  try{ fresh=await teacherFetchStudents(); }
  catch(e){ console.warn('[guitar-class] student progress refresh failed', e); }
  teacherRefreshing=false;
  teacherRefreshFailed=!fresh;
  // Failed, or something started while the read was out: keep the screen
  // (and its "as of" time) exactly as it is.
  if(!fresh || !teacherRefreshSafe()){ teacherPaintRefreshBar(); return; }
  allStudentsRaw=fresh;
  teacherApplyRosterFilter();
  teacherStudentsAt=Date.now();
  try{
    renderTeacherSummary();
    if(teacherView==='activities'){
      if(activityDetailId) teacherRepaintActivityStudents(activityDetailId);
      // The button re-reads the class settings too, like any write's repaint;
      // the timer and tab-return paint over the config already in hand.
      else renderTeacherActivities(manual ? undefined : {cached:true});
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
   block (teacherActivityGridHtml), and for an exit check its turned-in line
   too (teacherCheckLiveParts). The Preview under them is left alone. */
function teacherRepaintActivityStudents(id){
  const box=document.getElementById('t-grid-container');
  const a=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  if(!box || !a) return;
  const parts = a.kind==='check' ? teacherCheckLiveParts(a) : {grid: teacherActivityGridHtml(a)};
  Object.keys(parts).forEach(k=>{
    const el=box.querySelector(`[data-ta-live="${k}"]`);
    if(el) el.innerHTML=parts[k];
  });
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
/* The console opens on Class activities — the board is what gets touched
   before and during a period, where the skills grid is a look-back.
   showTeacherApp marks it in the sidebar (applyTeacherViewChrome) once the
   sidebar is built. */
let teacherView='activities';
let studentDetailUid=null;
// Which activity's detail is showing in the Class activities view — same
// "list vs. one detail page" split as studentDetailUid above, its own flag
// so a title click in the activities table can drill in without a view
// flag of its own either.
let activityDetailId=null;
// Which row (if any) currently has its rename box open. Purely local view
// state, cleared on every save/cancel and whenever the tab is re-entered.
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
   carried; Skills grid had none and got a small grid. */
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
  reports:'<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4"/><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none"/>',
};
const TEACHER_NAV=[
  {group:'Teach', items:[['activities','Class activities'],['songs','Songs'],['tsongs','Teacher view songs'],['livequiz','Live quiz']]},
  {group:'Students', items:[['students','Students'],['skills','Skills grid'],['trouble','Trouble spots'],['minutes','Practice minutes'],['responses','Responses']]},
  {group:'Set up', items:[['manage','Manage'],['games','Games']]},
  {group:'Tools', items:[['mic','Mic recordings'],['reports','Reports']]},
];
function teacherNavHtml(){
  return TEACHER_NAV.map(g=>`<div class="t-side-group" role="group" aria-label="${escAttr(g.group)}"><div class="t-side-head" aria-hidden="true">${escHtml(g.group)}</div>`
    +g.items.map(([v,label])=>`<button type="button" class="t-vt t-side-item" data-view="${v}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${TEACHER_NAV_ICON[v]||''}</svg><span class="t-side-label">${escHtml(label)}</span></button>`).join('')
    +`</div>`).join('');
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
}
function setTeacherView(v){
  // The Teacher view songs card plays the record — leaving the tab stops it.
  if(teacherView==='tsongs' && v!=='tsongs' && typeof stopCardAudio==='function') stopCardAudio();
  teacherView=v;
  if(v==='students') studentDetailUid=null; // clicking the tab always starts back at the roster
  if(v==='activities'||v==='songs'){ activityDetailId=null; activityEditId=null; } // same — the tab always starts back at the list, nothing mid-rename
  applyTeacherViewChrome(v);
  renderTeacherBody();
}
// Jumps straight to a student's detail page — from a roster row or a name
// cell in the skills grid — without going through the Students tab click.
function openStudentDetail(uid){
  teacherView='students'; studentDetailUid=uid;
  applyTeacherViewChrome('students');
  renderTeacherBody();
}
function backToStudentsRoster(){ studentDetailUid=null; renderTeacherBody(); }
/* Where the Class activities table was scrolled when a title was clicked, so
   Back can put you down on the row you left rather than the top of a long
   list. Only meaningful coming FROM that table — a "Blocked by" row on a
   student's page opens the same detail with no row to return to. */
let activityListScrollY = 0;
let restoreActivityScroll = false;
/* Jumps straight to one activity's detail page — from the Class activities
   table's title cell, or a "Blocked by" row on a student's page.

   The scroll reset is the whole reason clicking a title looked broken. The
   table is usually taller than the window, so a row low in it is clicked
   from a scrolled page — and the detail page that replaces it is taller than
   the window too (one row per student), so the browser has nothing to clamp
   the scroll back to. Without this you stay parked at the same offset,
   looking at the middle of a student table that reads just like the one you
   just clicked in. renderTeacherStudentDetail has ended with the same line
   since it was written; this was the copy that was missing.

   It lives HERE rather than at the end of the two detail renderers because
   those re-render in place — a Preview-as-student toggle, a period filter
   change, the Students part after every per-student Clear — and jumping to the top mid-way down a 60-row
   grid is its own bug. Opening is the only moment the scroll should move.
   window, not a scroll pane: the dashboard is a plain long page, and #app
   (which does have its own pane — scrollPane() in app.js) is hidden the
   whole time teacher mode is up. */
/* Which list the detail page was opened from — 'songs' when it came from the
   Songs view, so Back returns there and that tab stays lit. */
let activityDetailFrom='activities';
function openActivityDetail(id){
  activityListScrollY = (teacherView==='activities' && !activityDetailId) ? window.scrollY : 0;
  activityDetailFrom = (teacherView==='songs') ? 'songs' : 'activities';
  teacherView='activities'; activityDetailId=id;
  applyTeacherViewChrome(activityDetailFrom);
  renderTeacherBody();   // synchronous for a detail page — renderTeacherActivities returns early before its config promise
  window.scrollTo({top:0});
}
function backToActivitiesList(){
  activityDetailId=null;
  if(activityDetailFrom==='songs'){ activityDetailFrom='activities'; setTeacherView('songs'); window.scrollTo({top:0}); return; }
  restoreActivityScroll=true;   // the table paints from a promise — see renderTeacherActivities
  renderTeacherBody();
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

/* ── Class activities (teacher-only) ── One row per In-Class Activity, dated
   ones newest first then undated ones, with a done count, an expandable
   "who hasn't finished" list, a release-date input, and a Visible/Hidden
   toggle. Reads classActivities off the SAME student docs the Students tab
   already fetched (loadAllStudents) — no second Firestore read path for
   completion data.

   class-activities.js ships every entry undated — the date <input> here IS
   the publish switch: app.js's caIsVisible() hides an activity from students
   until config/class.activityDates has an id -> 'YYYY-MM-DD' entry for it
   whose date has arrived, so "no date set" (the state every new activity
   arrives in) is normal, not an error, and gets its own note rather than
   reading like a blank/broken cell. Clearing the input unsets the date and
   the activity goes dark again.

   The hide toggle lives in config/class.hiddenActivities (id -> true), same
   doc, same teacher-writes/students-read rule, same reason: git push is the
   permanent content-publish path, this toggle only exists to pull back
   something already dated, temporarily. It's independent of the date — a
   dated-but-hidden activity, and an undated one, both read the same to a
   student (invisible), but the two knobs don't affect each other.

   This table lists every activity regardless of date — deliberate, so a
   future or not-yet-dated activity can be pushed and reviewed here ahead of
   its lesson. See loadClassConfig() in app.js for the student-facing read. */
/* ── The link a student can be handed ──
   '#class-activities/ca-15' opens the Class activities page with that one
   card expanded and scrolled to (caFocusActivity in app.js) — the URL to
   paste into Classroom next to "do this exit check". Built off
   pathname, never location.href, so the console's own ?teacher=true doesn't
   ride along into a student's link. */
function activityStudentLink(id){
  return location.origin + location.pathname + '#class-activities/' + encodeURIComponent(id);
}
function teacherCopyActivityLink(id, btn){
  const url = activityStudentLink(id);
  const flash = ok => {
    if(!btn) return;
    const was = btn.textContent;
    btn.textContent = ok ? 'Copied \u2713' : 'Copy failed';
    setTimeout(() => { btn.textContent = was; }, 1400);
  };
  /* navigator.clipboard needs a secure context — https or localhost, which
     covers the live site and Live Server. The prompt() fallback is for
     anything else (a file:// open, an older browser): the teacher still gets
     the URL, just with a manual Ctrl+C. */
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(() => flash(true), () => window.prompt('Copy this link:', url));
    return;
  }
  window.prompt('Copy this link:', url);
}
/* ── Board state (view-only, not persisted) ─────────────────────────────
   Which sections are folded shut, which "Archived (N)" disclosures are
   open, and which card a drag is currently carrying. Same convention as
   activityEditId above: it lives for as long as the tab is open and starts
   fresh on re-entry, because none of it is worth a Firestore round trip. */
let boardSectionClosed={};     // module number -> true; undefined = never touched, default open
let boardArchOpen={};          // module number (or 'built') -> true
// Which "who hasn't finished (N)" lists are open, keyed '<activity id>|<period
// label>' (one list per period on each card). Same reason as boardArchOpen:
// every toggle, date or move repaints the board, and a list that snapped shut
// each time had to be re-opened after every click.
let boardDoneOpen={};
let boardWhoOpen={};   // id -> true while that card's "Who" picker is open, so a tick doesn't snap it shut
// "How this page works" — kept open across repaints too, now that the board
// also repaints on its own (teacherRefreshStudents) while it's being read.
let boardHelpOpen=false;
let boardDragId=null;          // the id a drag is carrying — never in dataTransfer
/* ── How the board is SHOWN (Jonathan, 2026-09-16) ──────────────────────
   Sorting here is the teacher's view and nothing else: it never writes, and
   students always read the course order the board holds. The `#N` on a card
   is its real position either way, so a descending view reads 9, 8, 7 …

   Descending is the DEFAULT, on both axes: the newest module at the top and
   the newest activity at the top of it, because the work being set up is
   almost always the most recent and scrolling past a semester to reach it
   was the whole complaint. Ascending is one click away.

   Unsorted is pinned LAST regardless of direction (Jonathan, 2026-10-20;
   it was pinned first) — it is the tray of cards not yet placed in the
   course, not a module with a number, so it sits below the modules rather
   than at whichever end the sort happens to put module 0. Display only:
   students' order and #numbers come from caBoardOrder, untouched. */
let boardSortKey='order';      // 'order' | 'date' | 'title' | 'done'
let boardSortDir='desc';       // 'desc' = newest/highest first
/* Everything that MOVES a card counts positions in the board's own
   ascending order (teacherBoardModuleIds), but the screen is descending by
   default — so "drop this above that one" and "▲" both mean the OPPOSITE
   position from the one the maths would reach for. These two are the single
   place that mismatch is resolved; every mover goes through them.

   boardCanReorder(): dragging to a position and ▲▼ only make sense while
   the list on screen IS the board order. Sorted by date or name, "above"
   names no position at all, so those affordances are withdrawn rather than
   left to do something arbitrary — a drop then just moves the card into
   the section, and the # box (which names a position outright) still works. */
function boardDescending(){ return boardSortDir==='desc'; }
function boardCanReorder(){ return boardSortKey==='order'; }
// The migration is a one-shot write, but renderTeacherActivities can paint
// several times before it lands (a view switch, a language change). One
// in-flight guard so it is attempted once per session, not once per paint.
let boardMigrating=false;

/* The board's read of config/class, in the shape app.js's caBoardOrder
   hands back. Deliberately the SAME function students read through
   (caBoardView in app.js), fed this file's config object instead of app.js's
   student-side globals — same split as caTitle/teacherActivityTitle, and the
   reason the console's #N can't drift from the one on a student's card. */
function teacherBoardView(cfg){
  const retired=Object.assign({}, (cfg&&cfg.archivedActivities)||{}, (cfg&&cfg.deletedActivities)||{});
  return caBoardOrder(window.CLASS_ACTIVITIES||[], (cfg&&cfg.activityBoard)||{}, {
    retired,
    legacyNumbers:(cfg&&cfg.activityNumbers)||{},
    seeded: !!(cfg&&cfg.activityBoardSeeded),
    songLibrary: (cfg&&cfg.songLibrary)||{},
    classSongs: (cfg&&cfg.classSongs)||{},
  });
}
/* Every id currently placed in one module, in board order, archived rows
   INCLUDED — the ordering primitive every writer below splices against. An
   archived card keeps its slot inside its module precisely so Restore puts
   it back where it was, so it has to be in this list even though it never
   renders in the live run of cards. */
function teacherBoardModuleIds(cfg, module, board){
  /* Ordered by caBoardOrder itself (app.js, loaded before this file — the
     same function teacherBoardView reads), so the tie-break the console
     splices against is the one students' #N comes from: pos, then the
     legacy number, then the id. A copy of its comparator here had already
     drifted (pos -> id). `retired: {}` keeps archived rows IN each module's
     ids, interleaved at their own slot, and `seeded: true` takes only the
     cards that have a board entry — exactly this list's contract.
     `board` overrides cfg.activityBoard (the board writers plan against a
     board that isn't the one on cfg). */
  const b=board||(cfg&&cfg.activityBoard)||{};
  const view=caBoardOrder(window.CLASS_ACTIVITIES||[], b, {
    retired:{},
    legacyNumbers:(cfg&&cfg.activityNumbers)||{},
    seeded:true,
    songLibrary:(cfg&&cfg.songLibrary)||{},
    classSongs:(cfg&&cfg.classSongs)||{},
  });
  const sec=view.sections.find(x=>x.module===Number(module));
  return sec ? sec.ids.slice() : [];
}
function teacherActivityIdNum(a){ const m=/^ca-(\d+)$/.exec(String(a&&a.id)); return m?Number(m[1]):Infinity; }
/* One line saying where a card sits, for the two detail pages. Reads the
   same board view students' #N comes from, so the detail page can't
   disagree with the board that linked to it. */
function teacherActivityPlace(id){
  const cfg=teacherClassConfig;
  const a=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  /* Songs-page songs and teacher-only cards are off the board whatever row
     they left behind (caBoardOrder), so ask about them first \u2014 the raw
     activityBoard row called every library song "not assigned, no student
     sees it". Neither one can gate, so their Clear buttons do nothing. */
  const noGate=' It is never on the board and never sends anyone to In-Class Activities, so the Clear buttons below change nothing.';
  if(a && caIsLibraryCard(a, cfg.songLibrary||{})){
    const off=teacherActivityDeleted(id,cfg)?'deleted':teacherActivityArchived(id,cfg)?'archived':(cfg.hiddenActivities||{})[id]===true?'Hidden':'';
    return (off
      ? `A Songs-page song, ${off} \u2014 no student sees it.`
      : 'A Songs-page song \u2014 every student can open it from the Songs page, under More Play Along songs.')+noGate;
  }
  if(a && caIsTeacherSong(a, cfg.classSongs||{}))
    return 'A Teacher view songs card \u2014 no student sees it until you use Move to Class activities.'+noGate;
  const view=teacherBoardView(cfg);
  if(!view.assigned[id]) return 'Built \u2014 not assigned to a module yet, so no student sees it.';
  const sec=view.sections.find(s=>s.ids.includes(id)||s.retiredIds.includes(id));
  const mn=sec?sec.module:0;
  const manifest=(typeof MODULE_MANIFEST!=='undefined')?MODULE_MANIFEST:[];
  const mod=manifest.find(m=>m.num===mn);
  const where=mn===0?'Unsorted':(mod?`Module ${mn} \u2014 ${mod.name}`:`Module ${mn}`);
  if(teacherActivityDeleted(id,cfg)) return `${where} \u00b7 deleted \u2014 no number, and students don't see it.`;
  if(teacherActivityArchived(id,cfg)) return `${where} \u00b7 archived \u2014 no number, and students don't see it.`;
  const n=view.number[id];
  return n ? `${where} \u00b7 #${n}` : `${where} \u00b7 no number \u2014 exit checks never take a #N slot.`;
}

/* ── One-time migration: place what's already published ─────────────────
   Runs on the first board render where config/class has never held a board
   (activityBoardSeeded absent — NOT "activityBoard is empty", which is a
   board the teacher emptied on purpose; see activityBoardOn in app.js).

   What lands: every activity that already has a release date, in the order
   students are reading them RIGHT NOW — the shipped `number` with the
   console's old activityNumbers overrides applied. Seeding by date instead
   would have been simpler and wrong: those overrides ARE the teaching order
   Jonathan typed, and a date-ordered board would have shuffled it on the
   first load (Jonathan, 2026-09-16). Everything undated stays in Built.

   All of it goes into module 0, the Unsorted pen, to be dragged into real
   modules from the board — the one thing the old data genuinely cannot
   answer is which module an activity belongs to. */
async function teacherMigrateActivityBoard(cfg){
  if(boardMigrating || !cfg || cfg.activityBoardSeeded) return false;
  // Never seed off a config we didn't actually read — see
  // teacherClassConfigReadOk. This is the one write in the file that is
  // destructive when handed an empty object.
  if(!teacherClassConfigReadOk) return false;
  boardMigrating=true;
  const dates=cfg.activityDates||{};
  const ov=cfg.activityNumbers||{};
  const shipped=a=>{ const n=Number(a.number); return Number.isFinite(n)?n:Infinity; };
  const legacyN=a=>{ const o=ov[a.id]; return (o&&Number.isFinite(Number(o.n))&&Number(o.base)===shipped(a))?Number(o.n):shipped(a); };
  const board={};
  (window.CLASS_ACTIVITIES||[]).filter(a=>dates[a.id])
    .sort((x,y)=>(legacyN(x)-legacyN(y))||(shipped(x)-shipped(y))||(teacherActivityIdNum(x)-teacherActivityIdNum(y)))
    .forEach((a,i)=>{ board[a.id]={module:0, pos:i+1}; });
  // Same queue as Move/Unassign/Delete — this is a fourth board writer, and
  // nothing structurally rules out it racing one of the other three (found
  // in the 2026-09-27 review of that fix: the migration is only PRACTICALLY
  // safe because no board rows exist to click Move/Unassign/Delete on yet,
  // not because anything enforces it).
  const release=await waitBoardWriteTurn();
  try{
    // Strict (no base): this replaces the board wholesale, so any other
    // write since this tab's read is a reason to stop and look.
    await teacherWriteConfig({activityBoard:board, activityBoardSeeded:true});
  }catch(e){
    boardMigrating=false;
    teacherConfigSaveFailed(e, 'Could not set up the activity board — check your connection and Firestore rules.');
    return false;
  }finally{
    release();
  }
  cfg.activityBoard=board;
  cfg.activityBoardSeeded=true;
  console.log('[guitar-class] activity board created — placed '+Object.keys(board).length
    +' published activit'+(Object.keys(board).length===1?'y':'ies')+' in Unsorted: '
    +Object.keys(board).sort((x,y)=>board[x].pos-board[y].pos).join(', '));
  return true;
}

/* ── Class activities: the board ────────────────────────────────────────
   Two columns. LEFT, "Built": every activity that has been pushed to the
   site but not yet placed in the course — newest first, because the one
   just pushed is the one being placed. RIGHT, "Assigned": the cards that
   ARE placed, grouped by module and ordered inside each module, which is
   exactly the order (and the #N numbering) students read.

   Dragging a Built card into a module assigns it; dragging one back to
   Built un-assigns it. Every keyboard/touch path to the same move exists
   beside the drag — the "Assign to"/"Move to" selects, the ▲▼ buttons, and
   the # box — because a drag is the only affordance here that a Chromebook
   trackpad, a phone and a screen reader all handle differently.

   PUBLISHING is still the release date, unchanged: config/class.activityDates
   and app.js's caIsVisible(). Assigned is a second, independent condition,
   not a replacement — a card goes live for students when it is assigned AND
   its date has arrived AND it isn't hidden AND it isn't archived/deleted.

   opts.cached: repaint from the config already in memory instead of going
   back to Firestore. Only for repaints that changed NOTHING in Firestore —
   folding a section, opening or cancelling the rename box, a rejected #
   entry. Every repaint that FOLLOWS A WRITE stays fresh, deliberately: the
   failure paths below roll their optimistic change back in memory and then
   repaint to show what Firestore actually holds, and painting before the
   read would pull the pre-write copy back over the new state. Fresh is the
   DEFAULT, so a call site misjudged costs one extra read rather than
   showing the teacher stale data. Two more cached callers: the three board
   writers paint their optimistic board BEFORE their write (the fresh repaint
   after it still follows), and the student-progress auto-refresh repaints
   new done counts over the config already in hand (teacherRefreshStudents). */
function renderTeacherActivities(opts){
  const cached = !!(opts && opts.cached) && teacherClassConfigLoaded;
  const box=document.getElementById('t-grid-container');
  if(activityDetailId){ renderTeacherActivityDetail(activityDetailId); return; }
  const allActivities=window.CLASS_ACTIVITIES||[];
  if(!allActivities.length){
    box.innerHTML='<div class="t-loading">No activities yet — they\'ll appear here once one is pushed to the site.</div>';
    return;
  }
  // No early return on an empty roster: only the done counts need students,
  // and each card already says "No student data yet." (doneSummary). The
  // first day of a school year, before anyone signs in, is exactly when the
  // first activity has to be placed, dated and published.
  // A re-render over a board that's already on screen (every toggle on it —
  // Optional, Hidden, a date, Archive — ends in one) keeps the old board up
  // while the config re-reads, and lands back at the same scroll position.
  // Swapping in the one-line "Loading…" box first collapsed the page, so the
  // browser clamped the scroll to the top on every click.
  const keepY = box.querySelector('.t-board') ? window.scrollY : null;
  if(!cached && keepY===null) box.innerHTML='<div class="t-loading">Loading…</div>';
  (cached ? Promise.resolve(teacherClassConfig) : loadTeacherClassConfig()).then(async cfg=>{
    if(teacherView!=='activities') return;   // switched views mid-flight
    if(!cfg) return;                         // superseded by a newer toggle
    // An activity's page opened mid-flight. It starts no config read of its
    // own, so this one is still the newest and would paint the board over it.
    if(activityDetailId) return;
    // First ever board render: place what's already published, then paint.
    if(!cfg.activityBoardSeeded && !boardMigrating){
      if(!teacherClassConfigReadOk){
        box.innerHTML='<div class="t-loading">Could not read the class settings, so the activity board hasn\'t been set up yet — check your connection and reload.</div>';
        return;
      }
      const done=await teacherMigrateActivityBoard(cfg);
      if(teacherView!=='activities' || activityDetailId) return;
      if(!done && !cfg.activityBoardSeeded){
        box.innerHTML='<div class="t-loading">Could not set up the activity board — reload to try again.</div>';
        return;
      }
    }
    // Library songs aren't class activities — the Songs view manages them.
    // Read against this config: a song can be moved either way (songBtn).
    // Teacher-only cards neither — the Teacher view songs tab has them,
    // until its Move to Class activities brings one here.
    const activities=allActivities.filter(a=>!caIsLibraryCard(a, cfg.songLibrary||{}) && !caIsTeacherSong(a, cfg.classSongs||{}));
    const hidden=cfg.hiddenActivities||{};
    const optional=cfg.optionalActivities||{};
    const playAlong=cfg.playAlongActivities||{};
    const pins=teacherActivityPins(cfg);
    const dates=cfg.activityDates||{};
    const today=dayStr(new Date());
    const view=teacherBoardView(cfg);
    const nums=view.number;
    const byId={}; activities.forEach(a=>{ byId[a.id]=a; });
    const manifest=(typeof MODULE_MANIFEST!=='undefined')?MODULE_MANIFEST:[];

    /* ── Shared card parts ──────────────────────────────────────────── */
    // How many students have finished this one, and who hasn't — broken out
    // by period so the number can't be misread as the whole class when the
    // dashboard's period filter (t-period-filter) is narrowed to P4, P7,
    // CAS, or Unassigned. Deliberately reads the FULL roster (allStudentsRaw, minus
    // archived) rather than `allStudents`, which follows that filter — this
    // card is meant to answer "who's done" for the whole class regardless of
    // whatever the teacher is currently looking at elsewhere on the page.
    // Reads the SAME student docs the Students tab already fetched
    // (loadAllStudents) — no second Firestore read path for completion data.
    const doneSummaryRoster=(teacherShowArchived?allStudentsRaw:allStudentsRaw.filter(s=>!((cfg.archived||{})[s.uid])));
    const doneSummary=a=>{
      const isCheck=a.kind==='check';
      const forIt=doneSummaryRoster.filter(s=>teacherActivityForStudent(a,s.uid,cfg));
      const groups=[['4','P4'],['7','P7'],['CAS','CAS'],['','Unassigned']]
        .map(([val,label])=>({label, students:forIt.filter(s=>teacherStudentPeriod(s)===val)}))
        .filter(g=>g.students.length);
      const rows=groups.map(g=>{
        const notDone=g.students.filter(s=>isCheck
          ? !(s.exitChecks||{})[a.id]
          : (s.classActivities||{})[a.id]!==true);
        const doneCount=g.students.length-notDone.length;
        const listHtml=notDone.length
          ? notDone.map(s=>`<div style="padding:2px 0">${escHtml(s.name||'(no name)')}${s.email?` &middot; ${escHtml(s.email)}`:''}</div>`).join('')
          : `<div style="padding:2px 0">Everyone has ${isCheck?'turned this one in':'finished this one'}.</div>`;
        const results=isCheck?g.students.map(s=>(s.exitChecks||{})[a.id]).filter(Boolean):[];
        const itemTotal=isCheck?(((a.check||{}).items)||[]).length:0;
        const avg=results.length?(results.reduce((n,r)=>n+(Number(r.score)||0),0)/results.length).toFixed(1):null;
        const head=isCheck
          ? `${g.label}: ${doneCount} / ${g.students.length} turned in${avg!==null?` &middot; avg ${avg}/${itemTotal}`:' &middot; avg —'}`
          : `${g.label}: ${doneCount} / ${g.students.length} done`;
        const openKey=a.id+'|'+g.label;
        return `<div class="t-board-done-row"><strong>${head}</strong> &middot; <details data-board-done data-key="${escAttr(openKey)}"${boardDoneOpen[openKey]?' open':''}><summary>who hasn't ${isCheck?'turned it in':'finished'} (${notDone.length})</summary>${listHtml}</details></div>`;
      }).join('');
      return `<div class="t-board-done">${rows||'<div class="t-board-done-row">No student data yet.</div>'}</div>`;
    };
    // Title line: the rename editor when it's open on this card, otherwise
    // the name + pencil + id + Copy link. The whole line is the link into
    // the detail page, so the buttons inside it are matched FIRST by the
    // delegated click listener (see showTeacherApp).
    const titleBlock=a=>{
      const shown=teacherActivityTitle(a,cfg);
      const renamed=teacherActivityRenamed(a,cfg);
      if(activityEditId===a.id){
        return `<div class="t-board-title">`
          +`<span class="t-act-title-lbl">rename (English)</span>`
          +`<input type="text" class="t-act-title-edit" data-id="${escAttr(a.id)}" value="${escAttr(shown)}" maxlength="120" spellcheck="false" aria-label="Rename ${escAttr(shown)} (English)">`
          +`<span class="t-act-title-hint">Students see this right away, in English in both languages, until the Spanish twin ships in the next update.</span>`
          +`<div style="margin-top:7px;display:flex;gap:6px;flex-wrap:wrap">`
          +`<button class="tg-seg-btn on" data-rename-save data-id="${escAttr(a.id)}">Save</button>`
          +`<button class="tg-seg-btn" data-rename-cancel>Cancel</button>`
          +(renamed?`<button class="tg-seg-btn" data-rename-reset data-id="${escAttr(a.id)}">Undo rename</button>`:'')
          +`</div></div>`;
      }
      const prefix=a.kind==='check'?'Exit check · ':'';
      return `<div class="t-board-title" data-open-activity data-id="${escAttr(a.id)}" title="${escAttr(prefix+shown)}">`
        +`${escHtml(prefix)}<span class="t-board-name">${escHtml(shown)}</span> `
        +`<span class="t-board-id">(${escHtml(a.id)})</span> `
        +`<button class="t-act-pencil" data-rename-activity data-id="${escAttr(a.id)}" title="Rename this activity" aria-label="Rename ${escAttr(shown)}">&#x270E;</button>`
        +`<button class="tg-seg-btn t-act-link" data-copy-activity-link data-id="${escAttr(a.id)}" title="Copy the student link straight to this ${a.kind==='check'?'exit check':'activity'}" aria-label="Copy the student link to ${escAttr(shown)}">Copy link</button>`
        +(renamed?`<span class="t-act-title-hint">Renamed — students see this in both languages until the Spanish twin ships. Was: ${escHtml(a.title)}</span>`:'')
        +`</div>`;
    };
    /* Publish controls, driven entirely by activityDates[id] — there is no
       separate published flag. Three states, and the button that leaves each
       one: undated (Publish now writes today, or schedule a day), scheduled
       (change the day, or Unpublish), live (Unpublish). All three go through
       the existing teacherSetActivityDate writer; '' clears. */
    const publishBlock=a=>{
      const dateVal=dates[a.id]||'';
      const isHidden=hidden[a.id]===true;
      // max: the calendar greys out the years teacherCommitActivityDate refuses.
      const dateInput=`<input type="date" class="t-date-input" data-set-activity-date data-id="${escAttr(a.id)}" value="${escAttr(dateVal)}" max="${new Date().getFullYear()+1}-12-31" aria-label="Release date for ${escAttr(teacherActivityTitle(a,cfg))}">`;
      const pubNow=`<button class="tg-seg-btn" data-publish-activity data-id="${escAttr(a.id)}" data-state="now" title="Publish today — students see it as soon as they reload">Publish now</button>`;
      const unpub=`<button class="tg-seg-btn" data-publish-activity data-id="${escAttr(a.id)}" data-state="off" title="Clear the release date — students stop seeing it">Unpublish</button>`;
      let status, controls;
      if(!dateVal){ status=`<span class="t-board-status">Not published</span>`; controls=pubNow+` <span class="t-board-sched">or schedule ${dateInput}</span>`; }
      else if(dateVal>today){ status=`<span class="t-board-status t-board-sched-on">Scheduled ${escHtml(dateVal)}</span>`; controls=dateInput+' '+unpub; }
      /* A live card's date is editable too (Jonathan, 2026-09-16). It used
         to render read-only, which meant moving something already out to
         students to a different day took Unpublish → re-date — two writes,
         and a window where the card vanished from In-Class Activities in
         between. Typing
         a new day straight into the box is one write either way: a past
         date just re-dates it, a future one pulls it back to Scheduled. */
      else { status=`<span class="t-board-status ${isHidden?'t-board-hidden-on':'t-board-live'}">${isHidden?'Hidden':'Live'}</span>`; controls=dateInput+' '+unpub; }
      return `<div class="t-board-publish">${status}<span class="t-board-pubctl">${controls}</span></div>`;
    };
    const visSeg=a=>{
      const isHidden=hidden[a.id]===true;
      return `<div class="tg-seg">`
        +`<button class="tg-seg-btn ${!isHidden?'on':''}" data-set-activity-hidden data-id="${escAttr(a.id)}" data-state="show">Visible</button>`
        +`<button class="tg-seg-btn ${isHidden?'on':''}" data-set-activity-hidden data-id="${escAttr(a.id)}" data-state="hide">Hidden</button></div>`;
    };
    // Required: until it's done or cleared, In-Class Activities opens first
    // at sign-in (the activity gate's lock is off — CA_GATE_LOCKS in app.js);
    // Optional still shows, tagged "Optional", but never does. Independent
    // of Visible/Hidden — see teacherSetActivityOptional.
    const optSeg=a=>{
      const isOpt=teacherActivityOptional(a.id,cfg);
      return `<div class="tg-seg">`
        +`<button class="tg-seg-btn ${!isOpt?'on':''}" data-set-activity-optional data-id="${escAttr(a.id)}" data-state="required" title="Until students finish this (or you clear it for them), In-Class Activities opens first when they sign in. Nothing else is locked.">Required</button>`
        +`<button class="tg-seg-btn ${isOpt?'on':''}" data-set-activity-optional data-id="${escAttr(a.id)}" data-state="optional" title="Students see it, tagged Optional, but it never opens first when they sign in">Optional</button></div>`;
    };
    // Practice cards only (view:'card'): when the Songs page's Play Along
    // list shows this card. "By date" is the rule every card follows — listed
    // once its release date arrives. "Now" lists it there today, dated or
    // not, and changes nothing else: it stays off In-Class Activities and
    // never blocks. See teacherSetActivityPlayAlong.
    const playSeg=a=>{
      if(a.view!=='card') return '';
      const isOn=playAlong[a.id]===true;
      return `<div class="tg-seg">`
        +`<button class="tg-seg-btn ${!isOn?'on':''}" data-set-activity-playalong data-id="${escAttr(a.id)}" data-state="date" title="Songs page lists this card under Play Along once its release date arrives">Play Along by date</button>`
        +`<button class="tg-seg-btn ${isOn?'on':''}" data-set-activity-playalong data-id="${escAttr(a.id)}" data-state="now" title="Songs page lists this card under Play Along now, with or without a release date. It stays off In-Class Activities and never blocks.">Play Along now</button></div>`;
    };
    // The Keep practicing row (config/class.activityPins): a pinned card is
    // one click away for students at the top of In-Class Activities, with
    // or without a release date. Exit checks are never pinnable. See
    // teacherSetActivityPin.
    const pinBtn=a=>{
      if(a.kind==='check') return '';
      const at=pins.indexOf(a.id);
      return `<div class="tg-seg">`
        +`<button class="tg-seg-btn ${at<0?'on':''}" data-set-activity-pin data-id="${escAttr(a.id)}" data-state="off" title="Not on the Keep practicing row at the top of students' In-Class Activities page">Not pinned</button>`
        +`<button class="tg-seg-btn ${at>=0?'on':''}" data-set-activity-pin data-id="${escAttr(a.id)}" data-state="on" title="On the Keep practicing row at the top of students' In-Class Activities page — no release date needed. It never blocks and never counts as one of today's activities. ${TEACHER_PINS_MAX} at most.">${at>=0?`Pinned ${at+1} of ${TEACHER_PINS_MAX}`:'Pin'}</button></div>`;
    };
    /* Who: the whole class (the default), or only the students ticked here
       — config/class.activityStudents, id -> { uid -> true }. Students
       nobody ticked never see the card, aren't sent to it at sign-in, and
       aren't counted in its done list. See teacherSetActivityStudent. */
    const whoPicker=a=>{
      const n=Object.keys(teacherActivityStudents(a.id,cfg)).length;
      const sum=n?`Only ${n} student${n===1?'':'s'}`:'Whole class';
      return `<details class="t-who${n?' t-who-on':''}" data-board-who data-id="${escAttr(a.id)}"${boardWhoOpen[a.id]?' open':''}>`
        +`<summary title="Who this activity is for">Who: ${sum}</summary>`
        +`<div class="t-who-body"><div class="t-who-note">Tick students to give this activity to them only. Nobody ticked = the whole class.</div>`
        +(n?`<div class="tg-seg"><button class="tg-seg-btn" data-activity-whole-class data-id="${escAttr(a.id)}">Back to whole class</button></div>`:'')
        +`<div data-who-boxes>${boardWhoOpen[a.id]?teacherWhoBoxesHtml(a,cfg):''}</div></div></details>`;
    };
    // A movable song (caIsSongCard) can go to the Songs page instead — see
    // teacherSetSongPlace. Its board slot is kept for the trip back.
    const songBtn=a=>caIsSongCard(a)
      ? `<button class="tg-seg-btn" data-set-song-place data-id="${escAttr(a.id)}" data-state="songs" title="Take this off the board and put it on every student's Songs page, under More Play Along songs">Move to Songs</button>`
      // A teacher-only card moved here goes back the same way — see
      // teacherSetClassSong. Its board slot is kept for the next trip.
      : a.teacherOnly===true
      ? `<button class="tg-seg-btn" data-tvs-share data-id="${escAttr(a.id)}" data-state="teacher" title="Take this off the board and students' In-Class Activities, back to the Teacher view songs tab only">Move to Teacher view songs</button>`
      : '';
    // Where a card can be sent without a drag. Used as "Assign to" in Built
    // and "Move to" in Assigned; both append at the end of the section they
    // name, which is what a drag onto empty space does too.
    const moveSelect=(a,label,curModule)=>{
      const opts=[`<option value="">${escHtml(label)}</option>`,`<option value="0"${curModule===0?' disabled':''}>Unsorted</option>`]
        .concat(manifest.map(m=>`<option value="${m.num}"${curModule===m.num?' disabled':''}>Module ${m.num} — ${escHtml(m.name)}</option>`));
      return `<select class="t-board-move" data-move-activity data-id="${escAttr(a.id)}" aria-label="${escAttr(label+' '+teacherActivityTitle(a,cfg))}">${opts.join('')}</select>`;
    };

    /* ── Left column: Built ─────────────────────────────────────────── */
    // Newest id first by default (boardSortDir 'desc'), like everything else
    // on the board — the card just pushed is the one being placed.
    const dirMul = boardSortDir==='desc' ? -1 : 1;
    const builtAll=activities.filter(a=>!view.assigned[a.id])
      .sort((x,y)=>dirMul*(teacherActivityIdNum(x)-teacherActivityIdNum(y)));
    const builtCard=a=>{
      const isRetired=teacherActivityRetired(a.id,cfg);
      const strays=[];
      if(dates[a.id]) strays.push(`release date ${escHtml(dates[a.id])}`);
      if(hidden[a.id]===true) strays.push('Hidden');
      if(optional[a.id]===true) strays.push('Optional');
      if(optional[a.id]===false) strays.push('Required');
      if(pins.includes(a.id)) strays.push('Pinned');
      return `<div class="t-board-card${isRetired?' t-board-retired':''}"${isRetired?'':' draggable="true"'} data-board-card data-id="${escAttr(a.id)}">`
        +`<div class="t-board-row">${isRetired?'':'<span class="t-board-grip" aria-hidden="true">&#x2630;</span>'}${titleBlock(a)}</div>`
        // A leftover date or Hidden flag on an unplaced card decides nothing
        // on its own (unassigned already means invisible), so it's stated,
        // not offered — the controls for it appear once the card is placed.
        +(strays.length?`<div class="t-board-stray">Carries: ${strays.join(' &middot; ')} — no effect until it's assigned.</div>`:'')
        /* A retired card in Built is offered Restore, NOT "Assign to…": it is
           out of the course, and placing it somewhere while it's still
           archived would put it straight into that module's Archived list —
           a move with no visible effect. Restore first, then place it. This
           is also the ONLY route back for something archived while it was
           unassigned, which is where every archived-and-never-placed
           activity lives. */
        +(isRetired
          ? `<div class="t-board-stray">${teacherActivityDeleted(a.id,cfg)?'Deleted':'Archived'} — out of the course. Restore it to place it again.</div>`
            +`<div class="t-board-ctl">`
            +`<button class="tg-seg-btn" data-set-activity-archived data-id="${escAttr(a.id)}" data-state="restore" title="${escAttr(teacherActivityDeleted(a.id,cfg)?'Put this activity back — it returns blank, ready to place and publish':'Put this activity back, with its date and name')}">Restore</button>`
            +(teacherActivityDeleted(a.id,cfg)?'':`<button class="tg-seg-btn t-act-danger" data-delete-activity data-id="${escAttr(a.id)}" title="Clear this activity's date, name and gate clears too">Delete</button>`)
            +`<button class="tg-seg-btn" data-open-activity data-id="${escAttr(a.id)}">Preview</button></div>`
          : `<div class="t-board-ctl">${moveSelect(a,'Assign to…',null)}`
            +`<button class="tg-seg-btn" data-open-activity data-id="${escAttr(a.id)}">Preview</button>`
            +songBtn(a)
            +`<span class="t-board-ctl-sp">`
            +`<button class="tg-seg-btn" data-set-activity-archived data-id="${escAttr(a.id)}" data-state="archive" title="Retire this activity without ever placing it">Archive</button>`
            +`<button class="tg-seg-btn t-act-danger" data-delete-activity data-id="${escAttr(a.id)}" title="Retire it AND clear its date, name and gate clears">Delete</button>`
            +`</span></div>`)
        +`</div>`;
    };
    const builtLive=builtAll.filter(a=>!teacherActivityRetired(a.id,cfg));
    const builtRetired=builtAll.filter(a=>teacherActivityRetired(a.id,cfg));
    const builtHtml=`<section class="t-board-built" data-board-built>`
      +`<div class="t-board-head">Built (${builtLive.length})</div>`
      +`<div class="t-board-hint">Pushed to the site, not placed in the course yet. Students see none of these.</div>`
      +(builtLive.length?builtLive.map(builtCard).join(''):`<div class="t-board-empty">Everything built has been placed.</div>`)
      +(builtRetired.length
        ? `<details class="t-board-arch" ${boardArchOpen.built?'open':''} data-board-arch data-module="built"><summary>Archived / deleted (${builtRetired.length})</summary>${builtRetired.map(builtCard).join('')}</details>`
        : '')
      +`</section>`;

    /* ── Right column: Assigned ─────────────────────────────────────── */
    const assignedCard=a=>{
      const isRetired=teacherActivityRetired(a.id,cfg);
      const isCheck=a.kind==='check';
      const n=nums[a.id];
      // Checks never take a #N slot, and a retired card has dropped out of
      // the run (Jonathan, 2026-09-16) — neither gets a box to type in.
      const numBox=(isCheck||isRetired||!n)
        ? `<span class="t-board-nonum">${isCheck?'Check':'—'}</span>`
        : `<span class="t-board-hash">#<input type="number" class="t-board-num" data-board-number data-id="${escAttr(a.id)}" value="${n}" min="1" step="1" title="Position in the course — type a new one to move this activity" aria-label="Position for ${escAttr(teacherActivityTitle(a,cfg))}"></span>`;
      const curModule=Number(((cfg.activityBoard||{})[a.id]||{}).module)||0;
      const retireBtns=teacherActivityDeleted(a.id,cfg)
        ? `<button class="tg-seg-btn" data-set-activity-archived data-id="${escAttr(a.id)}" data-state="restore" title="Put this activity back — it returns undated, so set a date to publish it again">Restore</button>`
        : (teacherActivityArchived(a.id,cfg)
          ? `<button class="tg-seg-btn" data-set-activity-archived data-id="${escAttr(a.id)}" data-state="restore" title="Put this activity back in this module, where it was, with its date and name">Restore</button>`
            +`<button class="tg-seg-btn t-act-danger" data-delete-activity data-id="${escAttr(a.id)}" title="Clear this activity's date, name and gate clears, and take it off the board">Delete</button>`
          : `<button class="tg-seg-btn" data-set-activity-archived data-id="${escAttr(a.id)}" data-state="archive" title="Take this off students' In-Class Activities page but keep its place, date and name">Archive</button>`);
      const moveBtns=(isRetired || !boardCanReorder()) ? '' :
        `<button class="tg-seg-btn" data-board-bump data-id="${escAttr(a.id)}" data-dir="up" title="Move up within this module" aria-label="Move up">&#x25B2;</button>`
        +`<button class="tg-seg-btn" data-board-bump data-id="${escAttr(a.id)}" data-dir="down" title="Move down within this module" aria-label="Move down">&#x25BC;</button>`;
      // Not draggable once retired: every other move control is hidden on
      // these, and a stray drag would rewrite the very slot Restore uses to
      // put the card back where it was.
      return `<div class="t-board-card${isRetired?' t-board-retired':''}${hidden[a.id]===true?' t-board-dim':''}"${isRetired?'':' draggable="true"'} data-board-card data-id="${escAttr(a.id)}">`
        +`<div class="t-board-row">${isRetired?'':'<span class="t-board-grip" aria-hidden="true">&#x2630;</span>'}${numBox}${titleBlock(a)}</div>`
        +(isRetired
          ? `<div class="t-board-stray">${teacherActivityDeleted(a.id,cfg)?'Deleted':'Archived'} — students don't see it and it holds no number. Restore puts it back here.</div>`
          : publishBlock(a)+`<div class="t-board-ctl">${visSeg(a)}${optSeg(a)}${playSeg(a)}${pinBtn(a)}${whoPicker(a)}${moveSelect(a,'Move to…',curModule)}${moveBtns}${songBtn(a)}</div>`)
        /* Footer: what this card IS (how many have done it) and the actions
           that take it out of the run, behind a hairline — so the row above,
           which is what gets used every day, reads as the card's controls
           and these read as the ones you reach for rarely. */
        +`<div class="t-board-ctl t-board-foot">${doneSummary(a)}`
        +`<span class="t-board-ctl-sp"><button class="tg-seg-btn" data-open-activity data-id="${escAttr(a.id)}">Preview</button>`
        +`<button class="tg-seg-btn" data-copy-activity-link data-id="${escAttr(a.id)}">Copy link</button>`
        +(isRetired?'':`<button class="tg-seg-btn" data-unassign-activity data-id="${escAttr(a.id)}" title="Send this back to Built — it keeps its date and name">Un-assign</button>`)
        +retireBtns+`</span></div>`
        +`</div>`;
    };
    /* Card order INSIDE a section. 'order' is the board's own order, which
       is the one students read; the other keys are a way of looking through
       the list and never leave this screen. Nothing here writes, and `#N` on
       each card stays its real position whichever way the list is pointed. */
    const sortIds=ids=>{
      const arr=ids.slice();
      if(boardSortKey==='order') return dirMul<0 ? arr.reverse() : arr;
      // The students each card's own counts read (doneSummary): the whole
      // roster minus archived, and only those the card is for — not the
      // period-filtered allStudents, or the order disagrees with the numbers.
      const doneMemo={};
      const doneOf=id=>{
        const a=byId[id]; if(!a) return 0;
        if(doneMemo[id]!==undefined) return doneMemo[id];
        const forIt=doneSummaryRoster.filter(s=>teacherActivityForStudent(a,s.uid,cfg));
        return (doneMemo[id]=a.kind==='check'
          ? forIt.filter(s=>(s.exitChecks||{})[id]).length
          : forIt.filter(s=>(s.classActivities||{})[id]===true).length);
      };
      const cmp=(x,y)=>{
        if(boardSortKey==='date'){
          const dx=dates[x]||'', dy=dates[y]||'';
          // An undated card isn't "earlier" or "later" than a dated one, so
          // it sinks to the bottom whichever way the arrow points — same
          // rule the old Class activities table used.
          if(dx && !dy) return -1;
          if(!dx && dy) return 1;
          return dirMul*dx.localeCompare(dy);
        }
        if(boardSortKey==='title')
          return dirMul*String(teacherActivityTitle(byId[x]||{},cfg)).localeCompare(String(teacherActivityTitle(byId[y]||{},cfg)));
        return dirMul*(doneOf(x)-doneOf(y));
      };
      return arr.sort((x,y)=>cmp(x,y) || (teacherActivityIdNum(byId[x]||{})-teacherActivityIdNum(byId[y]||{})));
    };
    /* One block per section that HOLDS something. An empty module used to
       render as a drop target, which meant scrolling past eleven "Drop an
       activity here" boxes to reach the one module in use (Jonathan,
       2026-09-16); "Assign to…" / "Move to…" still list every module, so
       nothing became unreachable. A module appears the moment it has a card. */
    const sectionsById={}; view.sections.forEach(sec=>{ sectionsById[sec.module]=sec; });
    const holds=mn=>{ const s=sectionsById[mn]; return !!(s && (s.ids.length || s.retiredIds.length)); };
    const sectionHtml=mn=>{
      const sec=sectionsById[mn]||{module:mn, ids:[], retiredIds:[]};
      const mod=manifest.find(m=>m.num===mn);
      const label=mn===0?'Unsorted':`Module ${mn} — ${escHtml(mod?mod.name:'(unknown module)')}`;
      const closed=boardSectionClosed[mn]===true;
      const cards=sortIds(sec.ids).map(id=>byId[id]).filter(Boolean).map(assignedCard).join('');
      const arch=sortIds(sec.retiredIds).map(id=>byId[id]).filter(Boolean);
      // Hide / Show the whole group in one write (teacherSetModuleHidden).
      // "Show all" only once every live card in it is already Hidden.
      const allHidden=sec.ids.length>0 && sec.ids.every(id=>hidden[id]===true);
      const groupBtn=sec.ids.length
        ? `<button class="tg-seg-btn t-board-grouphide" data-set-module-hidden data-module="${mn}" data-state="${allHidden?'show':'hide'}" title="${allHidden?'Set every card in this group to Visible':'Set every card in this group to Hidden — any one can still be set back to Visible on its own'}">${allHidden?'Show all':'Hide all'}</button>`
        : '';
      return `<div class="t-board-section${closed?' t-board-closed':''}" data-board-section data-module="${mn}">`
        +`<div class="t-board-sechead" data-board-fold data-module="${mn}">`
        +`<span class="t-board-caret" aria-hidden="true"></span><span>${label}</span>`
        +`<span class="t-board-count">${sec.ids.length}</span>${groupBtn}</div>`
        +`<div class="t-board-secbody">`
        +(cards||`<div class="t-board-empty">Drop an activity here, or use “Assign to…”.</div>`)
        +(arch.length?`<details class="t-board-arch" ${boardArchOpen[mn]?'open':''} data-board-arch data-module="${mn}"><summary>Archived (${arch.length})</summary>${arch.map(assignedCard).join('')}</details>`:'')
        +`</div></div>`;
    };
    // The modules that hold something, highest number first by default,
    // then Unsorted pinned last (see boardSortKey).
    const moduleNums=manifest.map(m=>m.num)
      .concat(Object.keys(sectionsById).map(Number).filter(mn=>mn!==0 && !manifest.some(m=>m.num===mn)))
      .filter(holds).sort((x,y)=>dirMul*(x-y));
    const sectionOrder=moduleNums.concat(holds(0)?[0]:[]);
    const assignedCount=view.sections.reduce((n,sec)=>n+sec.ids.length,0);
    const hiddenModules=manifest.length-moduleNums.filter(mn=>manifest.some(m=>m.num===mn)).length;
    const SORT_LABELS={order:'Course order', date:'Release date', title:'Name', done:'How many done'};
    const sortBar=`<div class="t-board-sortbar">`
      +`<label class="t-board-sortlbl" for="t-board-sort">Sort</label>`
      +`<select class="t-board-move" id="t-board-sort" data-board-sort aria-label="Sort the board (your view only)">`
      +Object.keys(SORT_LABELS).map(k=>`<option value="${k}"${boardSortKey===k?' selected':''}>${escHtml(SORT_LABELS[k])}</option>`).join('')
      +`</select>`
      +`<button class="tg-seg-btn" data-board-flip title="${escAttr(boardSortDir==='desc'?'Highest first — click for lowest first':'Lowest first — click for highest first')}" aria-label="Reverse the order">${boardSortDir==='desc'?'\u2193 Highest first':'\u2191 Lowest first'}</button>`
      +`<span class="t-board-sortnote">Your view only — students always read the course order.${boardCanReorder()?'':' Switch back to Course order to drag cards into position.'}</span>`
      +`</div>`;
    const assignedHtml=`<section class="t-board-assigned">`
      +`<div class="t-board-head">Assigned to students (${assignedCount})</div>`
      +`<div class="t-board-hint">This is the order students read them in, and where the #numbers come from.`
      +(hiddenModules>0?` ${hiddenModules} empty module${hiddenModules===1?'' :'s'} not shown — use “Assign to…” on a card to put something in one.`:'')
      +`</div>`
      +sortBar
      +sectionOrder.map(sectionHtml).join('')
      +`</section>`;

    /* What students' Keep practicing row holds right now, in pin order —
       the console's preview of it, and the one place to unpin a card that
       has no controls of its own any more (archived, or sent back to Built).
       A pin that students can't see says why. */
    const pinsHtml=(()=>{
      const why=id=>{
        const a=byId[id];
        if(!a){
          // Not on this board, but still in the code: Move to Songs and Move
          // to Teacher view songs keep the pin.
          const raw=allActivities.find(x=>x.id===id);
          if(raw && caIsLibraryCard(raw, cfg.songLibrary||{})) return 'moved to Songs';
          if(raw && caIsTeacherSong(raw, cfg.classSongs||{})) return 'Teacher view songs only';
          return 'not on the site';
        }
        if(teacherActivityRetired(id,cfg)) return teacherActivityDeleted(id,cfg)?'deleted':'archived';
        if(!view.assigned[id]) return 'not assigned';
        if(hidden[id]===true) return 'Hidden';
        return '';
      };
      const chips=pins.map((id,i)=>{
        const a=byId[id]||allActivities.find(x=>x.id===id), off=why(id);
        return `<span class="t-pin-chip${off?' t-pin-off':''}">${i+1}. ${escHtml(a?teacherActivityTitle(a,cfg):id)}${off?` <em>(${escHtml(off)} — students don't see it)</em>`:''}`
          +` <button class="tg-seg-btn" data-set-activity-pin data-id="${escAttr(id)}" data-state="off" aria-label="Unpin ${escAttr(a?teacherActivityTitle(a,cfg):id)}">Unpin</button></span>`;
      }).join('');
      return `<div class="tg-note t-pins-note"><strong>Keep practicing row (${pins.length} of ${TEACHER_PINS_MAX}):</strong> `
        +(pins.length?chips:`empty — students see no row. Use <strong>Pin</strong> on an assigned card to add one.`)
        +`</div>`;
    })();

    /* The Built column is its own scroller (sticky, max-height, overflow-y in
       styles.css), so keepY alone doesn't hold its place: every repaint —
       the once-a-minute refresh included — would throw it back to the top
       while the teacher is scrolling it for a card. Read it here, at the
       moment of the swap, not before the config read above. Assigned grows
       with the page, so the window's keepY already covers it. */
    const oldBuilt=box.querySelector('[data-board-built]');
    const builtTop=oldBuilt ? oldBuilt.scrollTop : 0;
    // The window's place is read here too: an older repaint handed a newer
    // read's config (loadTeacherClassConfig) paints just after that one, and
    // the keepY it took when it started can be a scroll the teacher has left.
    const paintY=oldBuilt ? window.scrollY : keepY;
    box.innerHTML=`<div class="tg-note">Drag a built activity into a module to assign it. It goes live for students on its release date.</div>`
      +pinsHtml
      +`<details class="tg-help" data-board-help${boardHelpOpen?' open':''}><summary>How this page works</summary>`
      +`<div class="tg-note">A card shows to students only when all four are true: it is <strong>assigned</strong> to a module here, its <strong>release date</strong> has arrived, it is not <strong>Hidden</strong>, and it is not <strong>Archived</strong>. Publish now dates it today; scheduling a later day holds it until then; Unpublish clears the date. A card's date stays editable once it's live, so you can move it to another day without unpublishing first — type a future day and it goes back to Scheduled. Use Hidden to pull back something already live, then un-hide any time — the date and the Hidden switch are independent, either one hides. <strong>Hide all</strong> on a module's heading sets every card in it to Hidden at once (<strong>Show all</strong> undoes it); after that, any one card can still be set back to Visible on its own.<br><br>`
      +`<strong>Required / Optional</strong> decides whether a live card sends students to In-Class Activities when they sign in. Neither one locks any part of the site. Until a student finishes a Required card (the default) or you clear it for them, In-Class Activities opens first when they sign in, Today's activity shows it ahead of Optional cards, and the console marks them Pending. An Optional card still shows, tagged “Optional”, and students can still do it and mark it done, but it never opens first and never counts as Pending. Switch it either way at any time.<br><br>`
      +`<strong>Archive</strong> takes a card off students' In-Class Activities page for good but keeps its place in its module, its date and its name, so Restore puts it back exactly where it was (unpinned, if it was pinned). Archived cards hold no #number, so the ones after them count down by one. <strong>Delete</strong> also clears the date, rename and per-student gate clears, and takes the card off the board entirely — it comes back in Built, blank, to be placed and published from scratch. Neither one removes the activity from the site's code (only an update does) and neither touches what students have already finished, so the Done counts survive both.<br><br>`
      +`<strong>Pin</strong> puts an assigned card on the <strong>Keep practicing</strong> row at the top of students' In-Class Activities page, up to ${TEACHER_PINS_MAX} cards, in the order you pinned them — for a card you reuse on many days, so you don't have to re-date it. A pin needs no release date. It never blocks the site and never counts as one of today's activities, and a pinned card stays on the row on the days it is also one of today's activities. Hidden, Archive and Delete still win (Archive and Delete also unpin, and Restore does not pin it again). Students' Done marks are untouched.<br><br>`
      +`<strong>Un-assign</strong> sends a card back to Built without clearing anything. The &#x270E; renames an activity for everyone, in both languages, until the Spanish twin ships. Copy link gives you a URL that opens the site straight to that one activity, card already open — paste it into Classroom. Type over a <strong>#number</strong> to move a card to that position; a number inside a title, like Finger Gym 2, is part of the name and stays put.</div></details>`
      +`<div class="t-board">${builtHtml}${assignedHtml}</div>`;
    // Before the rename box's focus() below, so focus can still scroll it into view.
    if(builtTop){ const nb=box.querySelector('[data-board-built]'); if(nb) nb.scrollTop=builtTop; }
    // Opening the editor is a full re-render, so focus has to be re-placed
    // afterwards or the pencil click would leave you looking at a box you
    // still have to click into. select() so typing replaces the old name.
    if(activityEditId){
      const inp=box.querySelector('.t-act-title-edit');
      if(inp){ inp.focus(); inp.select(); }
    }
    // Back from a detail page: land where the card was. Done here, not in
    // backToActivitiesList, because the board paints from this promise —
    // scrolling before it resolves would only hit the one-line "Loading…"
    // box, which has nowhere to scroll to.
    if(restoreActivityScroll){ restoreActivityScroll=false; window.scrollTo({top:activityListScrollY}); }
    else if(paintY!==null) window.scrollTo({top:paintY});
  });
}
function teacherBoardFold(module){
  const mn=Number(module);
  boardSectionClosed[mn]=!boardSectionClosed[mn];
  renderTeacherActivities({cached:true});   // a fold over cards we already have
}
// Both write nothing — see the boardSortKey comment. Repaint from cache.
function teacherBoardSetSort(key){ boardSortKey=key; renderTeacherActivities({cached:true}); }
function teacherBoardFlipDir(){ boardSortDir = boardSortDir==='desc' ? 'asc' : 'desc'; renderTeacherActivities({cached:true}); }
function teacherBoardArchToggle(key, open){ boardArchOpen[key]=!!open; }

/* ── The one writer every move goes through ─────────────────────────────
   A drag, an "Assign to"/"Move to" pick, a ▲▼ bump and a typed #number all
   end here, so there is exactly one place that knows how to keep `pos`
   contiguous — the same reason the old teacherSetActivityNumber rewrote the
   whole run instead of storing "ca-10 is now #4" and leaving the rest to a
   tiebreak.

   pos is 1-based within the TARGET module, counted after the card has been
   taken out of wherever it was; null appends. Both the section it leaves
   and the one it joins are re-packed 1..N, and only rows whose entry
   actually changed are sent — a move inside Module 3 never rewrites
   Module 7. */
/* Serializes the three board writers that re-pack a module (Move, Unassign,
   Delete) — found 2026-09-27. Each computes its patch from teacherClassConfig
   synchronously, then awaits a STRICT teacherWriteConfig() write, so two
   rapid clicks (a fast drag, a double-tap on ▲, or a Move overlapping a
   Delete's confirm landing) can both finish their synchronous half before
   either write resolves and bumps teacherConfigVersion. The second write
   then reads the still-stale version, and the transaction refuses it as a
   conflict — the tab's OWN prior move, not another session, tripping the
   stale-write guard on itself. Chaining every board write through one queue
   (whether it succeeds or fails) makes write B wait for write A to actually
   land first, so B computes and sends against the version A left behind
   instead of the one that was already true when both started. This does not
   touch teacherWriteConfig()'s own strict-vs-cell-checked contract — it only
   stops the caller from creating the race in the first place. */
/* Synchronous on purpose, up to its first await: reading the current gate
   and installing this call's own replacement have to happen before any
   other queued caller's turn can run, or two calls issued back to back
   would both capture the same "previous" gate and still race. Resolves
   (never rejects) once it's this call's turn, handing back the function
   that releases the NEXT caller once this write has fully settled —
   success or failure, so one failed write can't wedge the queue shut. */
let _boardWriteGate = Promise.resolve();
function waitBoardWriteTurn(){
  const mine = _boardWriteGate;
  let release;
  _boardWriteGate = new Promise(r => { release = r; });
  return mine.catch(() => {}).then(() => release);
}
/* The queue alone was not enough (2026-10-10): each writer still worked out
   its patch BEFORE waiting its turn, from a board that already carried the
   optimistic result of the write queued ahead of it. If that write failed,
   the queued one sent a patch built on a move that never happened. So the
   three re-packing writers now apply their optimistic board straight away
   (the UI follows the click at once, as before) but work out the patch they
   SEND only once it is their turn, from the board as it stands then.

   "As it stands then" has to exclude this writer's own optimism. Every
   writer settles the board when its write ends — the computed board on
   success, the base it started from on failure — and bumps boardSettled
   while still holding the gate. So at a writer's turn: if nothing settled
   since its click (it was first in line), the board before its own
   optimism (`prev`) is the confirmed one; otherwise the writer ahead of it
   just settled the board, wiping every queued optimism including its own,
   and the live board IS the confirmed one. A config reload in between
   (renderTeacherActivities re-reads after each write) hands back a fresh
   object straight from Firestore, which is confirmed by definition. */
let boardSettled = 0;
function teacherBoardTurnBase(cfg, prev, seq0){
  const live = teacherClassConfig || cfg;
  const base = (live === cfg && boardSettled === seq0) ? prev : (live.activityBoard || {});
  return { live, base };
}
// Ends a board writer's turn. Called inside the gate, before release().
function teacherBoardSettle(live, board){
  live.activityBoard = board;
  boardSettled++;
}
async function teacherMoveActivity(id, module, pos){
  const cfg=teacherClassConfig;
  const a=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  if(!a) return;
  const mn=Number(module)||0;
  /* The board this move leads to, worked out from `board`, and the rows of
     it that differ. Run twice: once now for the optimistic repaint, and
     again at the gate from the confirmed board — that second one is sent. */
  const plan=board=>{
    const from=board[id] ? (Number(board[id].module)||0) : null;
    const target=teacherBoardModuleIds(cfg,mn,board).filter(x=>x!==id);
    const at=(pos===null||pos===undefined) ? target.length : Math.max(0, Math.min(target.length, Math.round(pos)-1));
    target.splice(at,0,id);
    const next={};
    Object.keys(board).forEach(k=>{ next[k]=board[k]; });
    target.forEach((x,i)=>{ next[x]={module:mn, pos:i+1}; });
    if(from!==null && from!==mn) teacherBoardModuleIds(cfg,from,board).filter(x=>x!==id).forEach((x,i)=>{ next[x]={module:from, pos:i+1}; });
    // Only what actually moved. An unchanged row re-sent would cost nothing
    // but noise, and the patch is easier to read in the console when it names
    // exactly the cards that moved.
    const patch={};
    Object.keys(next).forEach(k=>{
      const p=board[k];
      if(!p || Number(p.module)!==next[k].module || Number(p.pos)!==next[k].pos) patch[k]=next[k];
    });
    return {next, patch};
  };
  const prev=cfg.activityBoard||{};
  const opt=plan(prev);
  if(!Object.keys(opt.patch).length){ renderTeacherActivities({cached:true}); return; }
  cfg.activityBoard=opt.next;   // optimistic — the click shows at once
  /* ...which it only does if something paints it. The repaint after the
     write (finally, below) is a whole Firestore round trip away, and until
     2026-10-12 nothing painted before it: a dropped card sat where it was for
     a second or two, which read as a failed drop and invited a second drag.
     Cached, because this paints the in-memory board — the optimistic one. */
  if(teacherView==='activities') renderTeacherActivities({cached:true});
  const seq0=boardSettled;
  const release=await waitBoardWriteTurn();
  const {live, base}=teacherBoardTurnBase(cfg, prev, seq0);
  const {next, patch}=plan(base);
  try{
    // The write ahead of this one already put the card here: nothing to send.
    if(!Object.keys(patch).length){ teacherBoardSettle(live, base); return; }
    live.activityBoard=next;
    /* Strict (no base): `pos` is re-packed 1..N from the copy of the board
       this tab holds, so a base one move out of date writes a run with a
       duplicate or a hole in it — and nothing downstream would notice. */
    await teacherWriteConfig({activityBoard:patch});
    teacherBoardSettle(live, next);
  }catch(e){
    teacherBoardSettle(live, base);
    teacherConfigSaveFailed(e, 'Could not save that move — check your connection and Firestore rules.');
  }finally{
    release();
    if(teacherView==='activities') renderTeacherActivities();
  }
}
/* Back to Built. The entry goes away and the module it left is re-packed;
   the release date, the rename and the Hidden flag are deliberately left
   alone — they are independent knobs, and a card un-assigned by accident
   should come back with its settings when it's dropped in again. */
async function teacherUnassignActivity(id){
  const cfg=teacherClassConfig;
  // Same two-pass shape as teacherMoveActivity: optimistic now, sent from
  // the confirmed board at the gate.
  const plan=board=>{
    const from=Number(board[id].module)||0;
    const next={};
    Object.keys(board).forEach(k=>{ if(k!==id) next[k]=board[k]; });
    const patch={};
    teacherBoardModuleIds(cfg,from,board).filter(x=>x!==id).forEach((x,i)=>{
      next[x]={module:from, pos:i+1};
      const p=board[x];
      if(!p || Number(p.module)!==from || Number(p.pos)!==i+1) patch[x]=next[x];
    });
    return {next, patch};
  };
  const prev=cfg.activityBoard||{};
  if(!prev[id]) return;
  cfg.activityBoard=plan(prev).next;   // optimistic
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // and shown now — see teacherMoveActivity
  const seq0=boardSettled;
  const release=await waitBoardWriteTurn();
  const {live, base}=teacherBoardTurnBase(cfg, prev, seq0);
  try{
    // A write queued ahead of this one already took it off the board.
    if(!base[id]){ teacherBoardSettle(live, base); return; }
    const {next, patch}=plan(base);
    live.activityBoard=next;
    await ensureDb();   // for FieldValue — teacherWriteConfig calls it again, cached
    const fv=firebase.firestore.FieldValue;
    patch[id]=fv.delete();
    // Strict, same re-packing reason as teacherMoveActivity.
    await teacherWriteConfig({activityBoard:patch});
    teacherBoardSettle(live, next);
  }catch(e){
    teacherBoardSettle(live, base);
    teacherConfigSaveFailed(e, 'Could not un-assign that activity — check your connection and Firestore rules.');
  }finally{
    release();
    if(teacherView==='activities') renderTeacherActivities();
  }
}
// ▲ / ▼ — one place within the card's own module. The keyboard and touch
// equivalent of a short drag; anything further is the "Move to" select.
function teacherBoardBump(id, dir){
  const cfg=teacherClassConfig;
  const e=(cfg.activityBoard||{})[id];
  if(!e) return;
  const mn=Number(e.module)||0;
  const all=teacherBoardModuleIds(cfg,mn);
  /* Step over the cards the teacher can SEE in the run, not over the raw
     board list: that list deliberately includes archived rows (they hold
     their slot for Restore), and they render in a separate collapsed list.
     Counting them would make the first press of ▲ next to an archived card
     a dead click that still wrote to Firestore. */
  const live=all.filter(x=>!teacherActivityRetired(x,cfg));
  const li=live.indexOf(id);
  // ▲ means "up the screen". The list runs the other way when the view is
  // descending, so the step has to flip with it — see boardDescending().
  const up = boardDescending() ? dir!=='up' : dir==='up';
  const lj=up?li-1:li+1;
  if(li<0 || lj<0 || lj>=live.length){ renderTeacherActivities({cached:true}); return; }  // already at the end
  // Translate back to a position in the full list: land immediately before
  // the live neighbour when moving up, immediately after it when moving down.
  const nb=live[lj];
  const rest=all.filter(x=>x!==id);
  const ni=rest.indexOf(nb);
  if(ni<0){ renderTeacherActivities({cached:true}); return; }
  teacherMoveActivity(id, mn, up ? ni+1 : ni+2);
}
/* Typing a position into a card's # box. "#n" means the slot the card that
   currently shows #n is sitting in: the typed card lands in THAT card's
   module, just before it when moving up the list and just after it when
   moving down — the same result as dragging it there, which is the point of
   having both. Out of range, unparseable or unchanged repaints from cache
   (putting the old number back in the box) and writes nothing. */
function teacherMoveActivityToNumber(id, value){
  const cfg=teacherClassConfig;
  const view=teacherBoardView(cfg);
  const ordered=[];
  view.sections.forEach(sec=>sec.ids.forEach(x=>{ if(view.number[x]) ordered.push(x); }));
  const cur=view.number[id];
  const n=Math.round(Number(value));
  if(!Number.isFinite(n) || n<1 || n>ordered.length || !cur || n===cur){
    renderTeacherActivities({cached:true});   // nothing was written
    return;
  }
  const targetId=ordered[n-1];
  const tmod=Number(((cfg.activityBoard||{})[targetId]||{}).module)||0;
  const tlist=teacherBoardModuleIds(cfg,tmod).filter(x=>x!==id);
  const ti=tlist.indexOf(targetId);
  if(ti<0){ renderTeacherActivities({cached:true}); return; }
  teacherMoveActivity(id, tmod, n>cur ? ti+2 : ti+1);
}

/* ── Drag and drop ──────────────────────────────────────────────────────
   HTML5 DnD, delegated on the same stable shell the click listener uses
   (showTeacherApp), because the board's innerHTML is replaced on every
   render and per-card listeners would have to be re-bound each time. The
   dragged id lives in a module-level variable rather than dataTransfer:
   dataTransfer's contents are unreadable during dragover in most browsers,
   and the drop indicator has to know what it's carrying to draw itself.

   No touch drag — a touchstart-based reimplementation of DnD is a lot of
   code to maintain for a board that already has "Assign to…", "Move to…"
   and ▲▼ doing the same three jobs. */
function teacherBoardClearDropMarks(){
  document.querySelectorAll('.t-board-drop-before,.t-board-drop-after,.t-board-drop-in')
    .forEach(el=>el.classList.remove('t-board-drop-before','t-board-drop-after','t-board-drop-in'));
}
// e.target on a stray drag elsewhere in the console (a text selection, a
// dragged link) can be a node without .closest — every board handler checks
// for it before reaching for an ancestor.
function boardEl(e){ return (e && e.target && typeof e.target.closest==='function') ? e.target : null; }
function teacherBoardDragStart(e){
  const t=boardEl(e); if(!t) return;
  const card=t.closest('[data-board-card]');
  if(!card) return;
  boardDragId=card.dataset.id;
  card.classList.add('t-board-dragging');
  // Chrome refuses to start a drag at all unless something is set here.
  try{ e.dataTransfer.setData('text/plain', card.dataset.id); e.dataTransfer.effectAllowed='move'; }catch(err){}
}
function teacherBoardDragEnd(){
  boardDragId=null;
  document.querySelectorAll('.t-board-dragging').forEach(el=>el.classList.remove('t-board-dragging'));
  teacherBoardClearDropMarks();
}
/* A repaint that lands mid-drag (a typed date's write, a Refresh) replaces
   the card being dragged. Its dragend then fires on a node that is no longer
   in the page, so it reaches neither the shell nor the document, and a drop
   outside a target fires no drop either — boardDragId stayed set, and with
   it teacherRefreshSafe skipped every auto-refresh (and a stray text drag
   over the board would carry that card) until the next successful drop.
   The browser sends no mouse events while a drag runs, so a mouse event
   that arrives with no .t-board-dragging card left in the page means the
   drag is over. A live drag's card still has the class, so it's untouched —
   a refresh during a real drag is still skipped. Bound once, beside the
   shell's drag listeners. */
function teacherBoardStaleDragCheck(){
  if(boardDragId && !document.querySelector('.t-board-dragging')) teacherBoardDragEnd();
}
function teacherBoardDragOver(e){
  if(!boardDragId) return;
  const t=boardEl(e); if(!t) return;
  const section=t.closest('[data-board-section]');
  const built=t.closest('[data-board-built]');
  if(!section && !built) return;
  e.preventDefault();                       // without this the drop never fires
  try{ e.dataTransfer.dropEffect='move'; }catch(err){}
  teacherBoardClearDropMarks();
  if(built){
    // Un-assign has no position to choose, so the whole column lights up.
    built.classList.add('t-board-drop-in');
    return;
  }
  const over=t.closest('[data-board-card]');
  // Over a card: the line goes above or below it depending on which half
  // the cursor is in, the ordinary list-reorder idiom. Over the header or
  // the empty space under the cards: append, so the section itself lights up.
  // Under a non-course-order sort the drop can only add the card to the
  // module, so the whole section lights up instead of drawing a line at a
  // position that would be thrown away (boardCanReorder).
  if(over && over.dataset.id!==boardDragId && section.contains(over) && boardCanReorder()){
    const r=over.getBoundingClientRect();
    over.classList.add(e.clientY < r.top + r.height/2 ? 't-board-drop-before' : 't-board-drop-after');
  } else {
    section.classList.add('t-board-drop-in');
  }
}
function teacherBoardDrop(e){
  const id=boardDragId;
  if(!id) return;
  const t=boardEl(e); if(!t) return;
  const section=t.closest('[data-board-section]');
  const built=t.closest('[data-board-built]');
  if(!section && !built) return;
  e.preventDefault();
  teacherBoardClearDropMarks();
  boardDragId=null;
  if(built){ teacherUnassignActivity(id); return; }
  const mn=Number(section.dataset.module)||0;
  const over=t.closest('[data-board-card]');
  /* A drop that names no position — on the section's header or its empty
     space — means "put this in this module", and that appends to the end of
     the module's course order whichever way the view happens to be pointed.
     An earlier cut flipped this to position 1 under a descending view, which
     silently renumbered every card in the module on a drop the teacher
     thought was a plain "add it here". Only a drop ON a card names a
     position, and that one does follow the view (below). */
  const append=()=>teacherMoveActivity(id, mn, null);
  /* Sorted by date/name/done, the list on screen is not the course order, so
     no drop inside it names a position. Dropping a card back into the module
     it already sits in is then a no-op rather than a silent re-pack — an
     aborted drag must not be a write. */
  if(!boardCanReorder()){
    const cur=(teacherClassConfig.activityBoard||{})[id];
    if(cur && (Number(cur.module)||0)===mn){ renderTeacherActivities({cached:true}); return; }
    append(); return;
  }
  // Let go on its own card: nothing moved, so nothing is written — same as
  // the aborted drag above. append() here would send it to the end of the
  // module and renumber every card after it.
  if(over && over.dataset.id===id){ renderTeacherActivities({cached:true}); return; }
  if(!over || !section.contains(over)){ append(); return; }
  // pos is counted in the target module AFTER the dragged card is removed,
  // which is exactly what teacherMoveActivity does with it.
  const list=teacherBoardModuleIds(teacherClassConfig, mn).filter(x=>x!==id);
  const idx=list.indexOf(over.dataset.id);
  if(idx<0){ append(); return; }
  const r=over.getBoundingClientRect();
  // Above the midpoint means "before this card" on screen. In a descending
  // view that is AFTER it in course order — see boardDescending().
  const above=e.clientY < r.top + r.height/2;
  const before=boardDescending() ? !above : above;
  teacherMoveActivity(id, mn, before ? idx+1 : idx+2);
}
/* The name to SHOW for an activity in the console: the teacher's rename if
   one is live, otherwise the title class-activities.js ships. Deliberately
   mirrors caTitle() in app.js rather than sharing it — app.js's copy reads
   the student-side `activityTitles` global, this one reads the config object
   the activities table already has in hand, and both apply the same `base`
   staleness rule (see caTitle's comment for what `base` buys us). If that
   rule changes, change it in both. */
/* The rename's `base` is the shipped title it was typed over, so compare it
   with the RAW activity's title. The detail page passes the caView() copy,
   whose title is the Power chords one (title_power) in Power mode, and that
   never matched: the list showed the rename and the page head the shipped
   title. Without a rename, return the title of the view on screen
   (caView: the Power chords title in Power mode — ca-34 opens there), so the
   board, pins and sort read what the detail page and students read. Mirrors
   caTitle() in app.js, in English like the rest of the console. */
function teacherActivityTitle(a, cfg){
  const raw=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===a.id)||a;
  if(teacherActivityRenamed(raw, cfg)) return cfg.activityTitles[raw.id].en;
  return (typeof caView==='function' ? caView(raw) : raw).title;
}
/* A live rename: one stored against the shipped title it was typed over.
   Not "the shown title differs from a.title" — in Power mode the view title
   differs with no rename at all, and that offered an Undo rename for nothing. */
function teacherActivityRenamed(a, cfg){
  const raw=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===a.id)||a;
  const o=((cfg&&cfg.activityTitles)||{})[raw.id];
  return !!(o && o.en && o.base===raw.title);
}
// Read the open editor's box and hand it to the writer. Split out from
// teacherSetActivityTitle so Enter, the Save button and a future affordance
// all reach the same value without each re-finding the input.
function teacherSaveActivityTitle(id){
  const inp=document.querySelector(`.t-act-title-edit[data-id="${CSS.escape(id)}"]`);
  // The Songs view edits only the song's NAME and hands the rest of the
  // title (" — Play Along") back on data-suffix, so the card keeps it.
  const name=inp ? inp.value.trim() : '';
  teacherSetActivityTitle(id, name ? name+((inp && inp.dataset.suffix)||'') : '');
}
// The rename editor lives in two views — the Class activities board and the
// Songs list — and the same handlers open, close and save it in both.
function teacherRenderRenameView(){
  if(teacherView==='songs') renderTeacherSongs();
  else renderTeacherActivities({cached:true});
}
/* Write (or clear) a rename. Same optimistic-then-roll-back write shape as
   teacherSetActivityHidden/Date above, against a third map on the same doc.

   Two cases clear the override outright rather than storing it: an empty box,
   and a value equal to the shipped title (either chord version's) — both mean "no rename", and storing
   either would leave a row in config/class that does nothing but has to be
   reasoned about later.

   `base` freezes the shipped title this rename was typed against, which is
   what lets the override expire by itself once the name is folded into
   class-activities.js properly. caTitle() in app.js enforces it. */
async function teacherSetActivityTitle(id, value){
  const a=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  if(!a) return;
  const name=String(value||'').trim().slice(0,120);
  // The editor opens holding the title on screen, which in Power mode is the
  // Power chords one: saving it unchanged is "no rename" too, or Full-mode
  // students would get the Power chords title as a rename.
  const viewTitle=typeof caView==='function' ? caView(a).title : a.title;
  const clear=!name || name===a.title || name===viewTitle || (!!a.title_power && name===a.title_power);
  if(!teacherClassConfig.activityTitles) teacherClassConfig.activityTitles={};
  const had=Object.prototype.hasOwnProperty.call(teacherClassConfig.activityTitles, id);
  const prev=teacherClassConfig.activityTitles[id];
  if(clear) delete teacherClassConfig.activityTitles[id];
  else teacherClassConfig.activityTitles[id]={en:name, base:a.title};
  activityEditId=null;
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const patch = clear ? {activityTitles:{[id]:fv.delete()}} : {activityTitles:{[id]:{en:name, base:a.title}}};
    await teacherWriteConfig(patch, {['activityTitles.'+id]: had?prev:undefined});
  }catch(e){
    if(had) teacherClassConfig.activityTitles[id]=prev; else delete teacherClassConfig.activityTitles[id];
    // Leave the editor exactly as it is — re-rendering here would repaint the
    // box from the server's (unchanged) copy and silently discard what was
    // typed, which on a flaky connection is the worst possible outcome.
    activityEditId=id;
    teacherConfigSaveFailed(e, 'Could not save that rename — check your connection and Firestore rules. What you typed is still in the box.', {keepEditor:true});
    return;
  }
  if(teacherView==='activities') renderTeacherActivities();
  else if(teacherView==='songs') renderTeacherSongs();
}
// One activity's full content, read-only — the actual "click to go to the
// activity" destination. Built straight from window.CLASS_ACTIVITIES (the
// same source the student-facing card in app.js reads), not from
// caActivityCardHtml() in app.js: that renderer is wired to the signed-in
// student's OWN classActivities/caStepDone/caOpenId state and to #app being
// visible (its video button opens the in-page YouTube panel, which lives
// inside #app — hidden the whole time the teacher dashboard is up). A
// teacher previewing a student's activity shouldn't touch either, so this is
// its own small renderer: plain step list, a real YouTube link instead of
// the in-page panel, no "mark complete" affordance. Reuses existing
// classes(.stu-back/.stu-section-head/.tr-card/.coach-tip/.step-figure) so
// it needs no CSS of its own. English-only, like the rest of teacher.js —
// activity titles/text aren't run through tf() here either.
/* The same shareable link as the table's Copy link button, spelled out on
   the detail page so it can be read (and pasted by hand) as well as copied. */
const linkRow=a=>`<div class="tg-note">Student link: <code>${escHtml(activityStudentLink(a.id))}</code> `
  +`<button class="tg-seg-btn t-act-link" data-copy-activity-link data-id="${escAttr(a.id)}">Copy link</button></div>`;
/* Done | Not done, side by side, for one activity or exit check (Jonathan,
   2026-10-02: "a list of who is done and who is not done for each
   activity … two columns"). Same done test as the table under it —
   classActivities[id], or for an exit check a turned-in result — and it
   follows the console's period filter like every other view. A cleared
   student is still not done; the tag says why they aren't blocked. The
   period tag shows only on All, where the classes are mixed. */
function teacherDoneRollHtml(a, students, isDone){
  if(!students.length) return '';
  isDone=isDone||(s=>(s.classActivities||{})[a.id]===true);
  const clears=teacherClassConfig.activityClears||{};
  const showPer=teacherPeriodFilter==='all';
  const name=(s,cleared)=>{
    const p=teacherStudentPeriod(s);
    const per=showPer&&p?` <span class="ta-roll-tag">${p==='CAS'?'CAS':'P'+escHtml(p)}</span>`:'';
    const cl=cleared?' <span class="ta-roll-tag">cleared</span>':'';
    return `<li>${escHtml(s.name||s.email||'(no name)')}${per}${cl}</li>`;
  };
  const done=students.filter(isDone);
  const not=students.filter(s=>!isDone(s));
  const col=(cls,head,list,empty,cleared)=>`<div class="ta-roll-col ${cls}"><div class="ta-roll-head">${head} (${list.length})</div>`
    +(list.length?`<ul>${list.map(s=>name(s,cleared&&!!((clears[s.uid]||{})[a.id]))).join('')}</ul>`:`<div class="ta-roll-empty">${empty}</div>`)+'</div>';
  return `<div class="ta-roll">${col('ta-roll-done','Done',done,'Nobody yet.',false)}${col('ta-roll-not','Not done',not,'Everyone is done.',true)}</div>`;
}
/* The Students block of a regular activity's detail page: the Done / Not
   done roll, the gate note and the per-student table. Its own function, and
   its own [data-ta-live] box on the page, so the student-progress refresh
   (teacherRefreshStudents) can repaint just this part — re-rendering the
   whole page would stop a song or drill playing in the Preview below it.

   Per-student status + gate clear (Today-first work order, Phase 1) — same
   uid -> { activityId -> true } map, and the same Clear toggle, as the
   exit-check grid (renderTeacherCheckDetail). Sorted by name, not by
   done/not-done, so a teacher looking for one student doesn't have to scan
   two groups. */
function teacherActivityGridHtml(a){
  const clearsMap=teacherClassConfig.activityClears||{};
  // An individual activity (the board's "Who" picker) lists only its students.
  const sortedStudents=allStudents.filter(s=>teacherActivityForStudent(a,s.uid,teacherClassConfig))
    .sort((x,y)=>String(x.name||x.email||'').localeCompare(String(y.name||y.email||'')));
  const studentRows=sortedStudents.map(s=>{
    const done=(s.classActivities||{})[a.id]===true;
    const cleared=!!((clearsMap[s.uid]||{})[a.id]);
    return `<tr><td class="nc">${escHtml(s.name||s.email||'(no name)')}</td>
      <td>${done?'Done ✓':'Not yet'}</td>
      ${teacherStudentPeriod(s)==='CAS'?TEACHER_CAS_GATE_CELL:`<td><button class="tg-seg-btn ${cleared?'on':''}" data-set-activity-clear data-uid="${escAttr(s.uid)}" data-id="${escAttr(a.id)}" data-state="${cleared?'unclear':'clear'}" title="Lets this student past the gate without finishing.">${cleared?'Cleared':'Clear'}</button></td>`}</tr>`;
  }).join('');
  const studentTable=sortedStudents.length
    ? `<div class="t-grid-wrap"><table><thead><tr><th class="nc">Student</th><th>Status</th><th>Gate</th></tr></thead><tbody>${studentRows}</tbody></table></div>`
    : '<div class="t-loading">No student data yet — students need to sign in first.</div>';
  return teacherDoneRollHtml(a, sortedStudents)
    +`<div class="tg-note">Gate: until a student finishes a Required activity, In-Class Activities opens first when they sign in. Nothing else on the site is locked. Clear lets one student skip this one at sign-in without finishing it — a sub day, a connectivity problem, work done on paper.</div>`
    +studentTable;
}
function renderTeacherActivityDetail(id){
  const box=document.getElementById('t-grid-container');
  const back=`<button type="button" class="stu-back" data-back-to-activities>&#x2190; ${activityDetailFrom==='songs'?'All songs':'All activities'}</button>`;
  const raw=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  if(!raw){ box.innerHTML=`${back}<div class="t-loading">Could not find that activity — it may have been renamed or removed.</div>`; return; }
  /* The Full chords / Power chords switch (chordVersions — caView in app.js):
     the preview draws the version the switch shows, through the same
     transform the student card uses, so the two can't disagree. */
  const a=typeof caView==='function'?caView(raw):raw;
  // A check has no steps — its detail page is a results grid, see below.
  if(a.kind==='check') return renderTeacherCheckDetail(a, back);
  // Where this card sits in the course, straight off the board — "Module 3
  // · #7", or the reason it has no number. Same view students' #N comes
  // from (caBoardOrder), so the two can't disagree.
  const place=teacherActivityPlace(a.id);
  /* One step's inner content — shared by the full-list preview and the
     "Preview as student" single-step view below, so the two can't drift. */
  const stepInnerHtml=(s,si,pos)=>{
    const media=[];
    /* width/height: see caStepHtml() in app.js — same 640x244 board, and
       checks.mjs (1v) fails the push if the two renderers disagree. */
    if(s.figure) media.push(`<span class="step-figure"><img src="${escAttr(s.figure)}" alt="${escAttr(s.figureAlt||'')}" width="640" height="244"></span>`);
    if(s.video && s.video.id){
      const url=`https://www.youtube.com/watch?v=${encodeURIComponent(s.video.id)}${s.video.start?`&start=${Number(s.video.start)}`:''}`;
      const vLabel=s.video.label?escHtml(s.video.label):'Watch video';
      // A real link, not the loadPanel()/rp-trigger in-app YouTube panel —
      // that panel's markup lives inside #app, which teacher mode never shows.
      media.push(`<a class="rp-trigger" href="${escAttr(url)}" target="_blank" rel="noopener">&#x25B6; ${vLabel}</a>`);
    }
    // suppressCoach: the Listening Coach mic-check button opens a panel
    // that's also inside #app — pointless (and confusing) to show here.
    // noRevealDelay: the preview has no arming pass (caArmTabReveals runs
    // off renderClassActivities, which this screen never calls) and
    // Jonathan wants to see the board immediately when checking an
    // activity, not wait out the same delay a student would.
    // defaultLinesPerPage: same two-rows-a-page default the student card uses.
    if(s.tab) media.push(buildTab(s.tab,{keyPrefix:`bpm:ca-preview:${a.id}:${si}:tab`,suppressCoach:true,noRevealDelay:true,defaultLinesPerPage:CA_TAB_LINES_PER_PAGE}));
    // The drawn strum pattern (step.strum) — same builder as caStepHtml().
    if(s.strum && typeof buildStrum==='function') media.push(buildStrum(s.strum,{keyPrefix:`bpm:ca-preview:${a.id}:${si}:strum`}));
    /* The backing-track snippet, from the SAME builder the student card uses
       (buildSnippet in app.js, loaded before this file) — a step field with
       one renderer can't go invisible on one side of it, which is the whole
       point of the two-renderers rule. Nothing here needs #app: it is an
       <audio> element, unlike the YouTube panel above. It plays for real, so
       Jonathan can hear the day's loop before class. */
    if(s.snippet && typeof buildSnippet==='function') media.push(buildSnippet(s.snippet, { hasTab: !!s.tab }));
    // Drills are playable in the preview — this is where the day's activity
    // gets checked before class, and a quiz you can't try isn't previewed.
    // Own key namespace (`ca-preview-…`) so a drill open here and the same
    // one in the student panel don't share state; sdSaveBest/dkSaveBest skip
    // the write in teacher mode, so a teacher trying it doesn't file a best
    // score on their own doc. No teardown needed on the way out: sdTick
    // stops itself once its box leaves the DOM.
    if(s.drill && typeof renderShuffleDrill==='function') media.push(renderShuffleDrill(s.drill,`ca-preview-${a.id}-s${si}`,null));
    // Step head mirrors caStepHtml()/caStepHeadText() in app.js — "Step 4",
    // or "Step 4: Tune it back" when the step carries an optional label.
    // English only, like the rest of this preview.
    // `pos` is the step's place on its route (paths); the flat `si` keys everything else.
    const head=`Step ${(pos===undefined?si:pos)+1}${s.label?`: ${escHtml(s.label)}`:''}`;
    return `<div class="tr-name">${head}</div>${wrapGotItWhen(s.text||'')}${media.join('')}`;
  };
  /* Paths (`paths` — caRoute / caPathChooserHtml in app.js, 2026-11-04): the
     full list shows the chooser students see first (its Start buttons do
     nothing here), then every step grouped under its path, the shared tail
     last, each numbered the way its path's route reads it ("Step 3" is the
     third step a student on that path meets). Without paths it is the plain
     flat list, as before. */
  const hasPaths=typeof caHasPaths==='function'&&caHasPaths(a);
  const stepCard=(s,si,pos)=>`<div class="tr-card ca-prev-step" style="margin-bottom:12px">${stepInnerHtml(s,si,pos)}</div>`;
  const stepsHtml=!hasPaths?(a.steps||[]).map((s,si)=>stepCard(s,si,si)).join('')
    :(()=>{
      const steps=a.steps||[];
      const shared=caSharedSteps(a);
      const chooser=`<div class="tg-note">Students pick a path first. This is the chooser they see (its buttons do nothing here):</div><div class="ca-prev-paths">${caPathChooserHtml(a,{preview:true})}</div>`;
      const groups=a.paths.map(p=>{
        const own=caPathSteps(a,p.key);
        return `<div class="stu-section-head">Path: ${escHtml(p.label||p.key)} <span style="opacity:.55;font-size:.72em">(${own.length} step${own.length===1?'':'s'}, then the shared ones)</span></div>`
          +own.map((si,pos)=>stepCard(steps[si],si,pos)).join('');
      }).join('');
      const longest=Math.max(0,...a.paths.map(p=>caPathSteps(a,p.key).length));
      const tail=shared.length?`<div class="stu-section-head">Then, on every path</div>`
        +shared.map((si,k)=>`<div class="tg-note" style="margin:0 0 4px">Step ${longest+k+1} on the longest path; ${a.paths.map(p=>`${escHtml(p.label||p.key)}: step ${caPathSteps(a,p.key).length+k+1}`).join(', ')}.</div>`+stepCard(steps[si],si,longest+k)).join(''):'';
      return chooser+groups+tail;
    })();
  /* "Preview as student" (2026-09-29): the same steps, shown the real way a
     focus-view activity shows them — one on screen, numbered step buttons
     above it, Previous/Next below. Local-only index (taFocusPreviewIdx), no
     locking on earlier steps being "done" — there's no real progress here to
     gate on, and a teacher checking step 3 shouldn't have to fake-complete
     1 and 2 first. */
  const focusPreviewHtml=()=>{
    const steps=a.steps||[];
    /* Paths: a local-only path pick (taFocusPreviewPath, the first path by
       default) and the route it gives — the same caPathSteps / caSharedSteps
       split the student card walks. `cur` is a ROUTE position here. */
    const pathKey=hasPaths?(a.paths.find(p=>p.key===taFocusPreviewPath[a.id])||a.paths[0]).key:'';
    const route=hasPaths?caPathSteps(a,pathKey).concat(caSharedSteps(a)):steps.map((s,si)=>si);
    const n=route.length;
    const cur=Math.min(Math.max(taFocusPreviewIdx[a.id]||0,0),Math.max(n-1,0));
    const pathPick=hasPaths?`<div class="tg-seg" style="margin-bottom:10px">${a.paths.map(p=>`<button type="button" class="tg-seg-btn${p.key===pathKey?' on':''}" data-ta-focus-path data-id="${escAttr(a.id)}" data-key="${escAttr(p.key)}" aria-pressed="${p.key===pathKey}">Path: ${escHtml(p.label||p.key)}</button>`).join('')}</div>`:'';
    const pips=route.map((si,pos)=>`<button type="button" class="ca-focus-dot${pos===cur?' is-now':''}" data-ta-focus-go data-id="${escAttr(a.id)}" data-idx="${pos}" title="Step ${pos+1}${steps[si].label?`: ${escAttr(steps[si].label)}`:''}">${pos+1}</button>`).join('');
    const last=cur>=n-1;
    const back=cur>0?`<button type="button" class="ca-focus-back" data-ta-focus-go data-id="${escAttr(a.id)}" data-idx="${cur-1}">&#x25C0; Previous</button>`:'';
    const next=`<button type="button" class="ca-focus-next" data-ta-focus-go data-id="${escAttr(a.id)}" data-idx="${last?cur:cur+1}">${last?'Last step':'Next step &#x25B6;'}</button>`;
    return pathPick+`<div class="ca-focus-dots" role="group" aria-label="Steps" style="margin-bottom:10px">${pips}</div>`
      + `<div class="tr-card ca-prev-step">${n?stepInnerHtml(steps[route[cur]],route[cur],cur):'No steps on this activity yet.'}</div>`
      + `<div class="ca-focus-nav">${back}${next}</div>`;
  };
  box.innerHTML=`${back}
    <div class="stu-section-head" style="margin-top:0">${escHtml(teacherActivityTitle(a,teacherClassConfig))} <span style="opacity:.55;font-size:.72em">(${escHtml(a.id)})</span></div>
    <div class="tg-note">${escHtml(place)}</div>
    ${teacherRetiredBanner(a.id)}
    ${teacherOptionalBanner(a.id)}
    ${linkRow(a)}
    ${a.intro?`<div class="coach-tip" style="margin:0 2px 16px">${escHtml(a.intro)}</div>`:''}
    ${/* Focus view is activity-level presentation, not a step field — the
         preview DEFAULTS to showing every step (that's what a fast pre-class
         check wants), so the note says how students actually see them, and
         "Preview as student" switches this same page to the real
         one-step-at-a-time shape (focusPreviewHtml, above) — a local-only
         toggle, nothing saved. See caIsFocus in app.js. */
       a.view==='focus'?`<div class="tg-note">Focus view: students see one step at a time, with numbered step buttons above it and a "Got it — next step" button under it. A step opens only after the one before it is marked done. ${taFocusPreviewOn[a.id]?'Previewing one step at a time below.':'The preview below shows every step.'} <button type="button" class="tg-seg-btn" data-ta-focus-toggle data-id="${escAttr(a.id)}">${taFocusPreviewOn[a.id]?'Show full list':'Preview as student'}</button></div>`:''}
    ${/* `metronome: <bpm>` (ca-21): tapping the card open starts each
         student's own Metro tool at that tempo — caAutoStartMetro() in
         app.js, which runs only on a real tap, never on a re-render or a
         Copy-link deep link. Said here because nothing in the preview shows
         it, and this preview never starts audio on its own. */
       a.metronome?`<div class="tg-note">Metronome: when a student taps this activity open, the Metro tool on their device starts at ${escHtml(String(Number(a.metronome)))} BPM in 4/4, one click per beat. They can stop it or change the tempo. It does not start when they arrive from a Copy link URL, and it does not start in this preview.</div>`:''}
    ${/* Practice card (view:'card'): the preview IS the student card —
         caCardBodyHtml() in app.js, the one body renderer both sides call
         (same shape as an exit check's caCheckBodyHtml), so it can't drift.
         The song plays for real; ticks here save nothing. */ typeof caIsCard==='function'&&caIsCard(a)?`<div class="tg-note">Practice card: students see this one screen — Play song, the tab, and the checks. The card counts as done once every numbered check is ticked; Level up is extra. Ticks in this preview are not saved.</div>`:''}
    <div class="stu-section-head">Students</div>
    <div data-ta-live="grid">${teacherActivityGridHtml(a)}</div>
    <div class="stu-section-head">Preview</div>
    ${/* A practice card draws its own switch inside caCardBodyHtml. */ typeof caIsCard==='function'&&caIsCard(a)?'':(typeof caKeySwitchHtml==='function'?caKeySwitchHtml(a):'')+(typeof caChordSwitchHtml==='function'?caChordSwitchHtml(a):'')}
    ${typeof caIsCard==='function'&&caIsCard(a) ? caCardBodyHtml(a,{preview:true})
      : (a.view==='focus' && taFocusPreviewOn[a.id]) ? focusPreviewHtml()
      : (stepsHtml || '<div class="stu-empty">No steps on this activity yet.</div>')}
    ${(()=>{ /* A Level up that opens another card (caCardLinkHtml in app.js) — name it here, since the preview card renders no link. */
      const lu=typeof caIsCard==='function'&&caIsCard(a)?((a.card.checks||[]).slice(-1)[0]||{}):{};
      const to=lu.levelUp&&lu.card?(window.CLASS_ACTIVITIES||[]).find(x=>x.id===lu.card):null;
      return to?`<div class="tg-note">Level up button opens ${escHtml(to.id)} · ${escHtml(to.title||'')} — shown to students once that card is released or set to Play Along now. Before its date it opens in place of this card, and closing it brings this card back.</div>`:'';
    })()}
    ${caJourneyUrl(a)?`<div class="ca-journey-row"><a class="jl-song-btn" href="${escAttr(caJourneyUrl(a))}" target="_blank" rel="noopener">${escHtml(t('ca.openJourney',{song:(SONG_JOURNEYS.find(s=>s.id===a.journey)||{}).name||''}))} &#x2197;</a></div>`:''}`;
}
/* An exit check's detail page: who turned it in, what they picked, and
   which question the room missed. Deliberately NOT the plain step list
   above — a check has no steps, and the thing worth reading before the
   next lesson is the "Missed by" row.

   The preview at the bottom calls caCheckBodyHtml() in app.js, the same
   renderer the student card uses. Picks made there are graded and shown
   but written nowhere (ecSubmit bails on IS_TEACHER_MODE), so previewing
   is not turning in.

   The parts that read student progress — the "N of M turned in" line, the
   roll and the results grid — are built by teacherCheckLiveParts() and sit
   in their own [data-ta-live] boxes, so the student-progress refresh can
   repaint them without rebuilding the preview (and wiping its picks). */
function renderTeacherCheckDetail(a, back){
  const box=document.getElementById('t-grid-container');
  const live=teacherCheckLiveParts(a);
  box.innerHTML=`${back}
    <div class="stu-section-head" style="margin-top:0">Exit check &middot; ${escHtml(teacherActivityTitle(a,teacherClassConfig))} <span style="opacity:.55;font-size:.72em">(${escHtml(a.id)})</span></div>
    ${teacherRetiredBanner(a.id)}
    ${teacherOptionalBanner(a.id)}
    <div class="tg-note" data-ta-live="note">${live.note}</div>
    ${linkRow(a)}
    ${a.intro?`<div class="coach-tip" style="margin:0 2px 16px">${escHtml(a.intro)}</div>`:''}
    <div data-ta-live="grid">${live.grid}</div>
    <div class="stu-section-head">Preview</div>
    <div class="tg-note">Try the check yourself — nothing you pick here is saved.</div>
    <div id="ec-preview-body-${escAttr(a.id)}">${caCheckBodyHtml(a,{preview:true,keyPrefix:'ca-preview'})}</div>`;
}
function teacherCheckLiveParts(a){
  const c=a.check||{};
  const items=c.items||[];
  const dates=(teacherClassConfig&&teacherClassConfig.activityDates)||{};
  const dateVal=dates[a.id]||'';
  const dateNote=teacherActivityRetired(a.id,teacherClassConfig)
    ? (teacherActivityDeleted(a.id,teacherClassConfig)?'Deleted — hidden from students':'Archived — hidden from students')
    : (dateVal?`Dated ${escHtml(dateVal)}`:'No date set — hidden from students');
  // Item headings: the fret run for nextNote, the fret itself for noteName.
  const heads=items.map((it,i)=>c.type==='nextNote'
    ? `Q${i+1}: ${escHtml((it.notes||[]).map(n=>n.fret).join(' '))} &rarr; ${escHtml(String(it.answer.fret))}`
    : `Q${i+1}: fret ${escHtml(String(it.fret))} = ${escHtml(it.answer)}`);
  const withRes=[], without=[];
  allStudents.forEach(s=>{
    const r=(s.exitChecks||{})[a.id];
    if(r) withRes.push({s,r}); else without.push(s);
  });
  const byName=(x,y)=>String(x.s?x.s.name:x.name||'').localeCompare(String(y.s?y.s.name:y.name||''));
  withRes.sort(byName); without.sort((x,y)=>String(x.name||'').localeCompare(String(y.name||'')));
  // Per-item miss counts across submitted students only — a student who
  // hasn't turned it in hasn't missed anything.
  const missed=items.map(()=>0);
  withRes.forEach(({r})=>{
    ecGrade(a,r.picks).rows.forEach((row,i)=>{ if(!row.ok) missed[i]++; });
  });
  const cell=ok=>`<span class="tck yes" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:2px solid var(--${ok?'green':'amber'}-text);color:var(--${ok?'green':'amber'}-text)">${ok?TCK_CHECK_SVG:TCK_MINUS_SVG}</span>`;
  // Gate clear (Today-first work order, Phase 1) — same uid -> { activityId
  // -> true } map, and the same toggle, as the regular-activity grid above
  // (renderTeacherActivityDetail). A student who hasn't turned the check in
  // yet can still be cleared — a sub day, a connectivity problem — so it's
  // its own column rather than folded into the score cells.
  const clearsMap=teacherClassConfig.activityClears||{};
  const clearCell=s=>{
    if(teacherStudentPeriod(s)==='CAS') return TEACHER_CAS_GATE_CELL;
    const cleared=!!((clearsMap[s.uid]||{})[a.id]);
    return `<td><button class="tg-seg-btn ${cleared?'on':''}" data-set-activity-clear data-uid="${escAttr(s.uid)}" data-id="${escAttr(a.id)}" data-state="${cleared?'unclear':'clear'}" title="Lets this student past the gate without finishing.">${cleared?'Cleared':'Clear'}</button></td>`;
  };
  const bodyRows=withRes.map(({s,r})=>{
    const g=ecGrade(a,r.picks);
    const cells=g.rows.map(row=>`<td style="text-align:center">${cell(row.ok)}<div style="font-size:.72em;opacity:.7">${escHtml(row.pick||'—')}</div></td>`).join('');
    return `<tr><td class="nc">${escHtml(s.name||s.email||'(no name)')}</td><td>${Number(r.score)||0}/${Number(r.total)||0}</td><td>${escHtml(r.at||'')}</td>${cells}${clearCell(s)}</tr>`;
  }).join('');
  const missRow=withRes.length
    ? `<tr><td class="nc" style="font-style:italic">Missed by</td><td colspan="2"></td>`
      +missed.map(m=>`<td style="text-align:center">${m}</td>`).join('')+`<td></td></tr>`
    : '';
  const noneRows=without.map(s=>`<tr style="opacity:.55"><td class="nc">${escHtml(s.name||s.email||'(no name)')}</td><td colspan="${2+items.length}">not turned in</td>${clearCell(s)}</tr>`).join('');
  const table=allStudents.length
    ? `<div class="t-grid-wrap"><table><thead><tr><th class="nc">Student</th><th>Score</th><th>Date</th>${heads.map(h=>`<th>${h}</th>`).join('')}<th>Gate</th></tr></thead>`
      +`<tbody>${bodyRows}${missRow}${noneRows}</tbody></table></div>`
    : '<div class="t-loading">No student data yet — students need to sign in first.</div>';
  return {
    note: `${escHtml(teacherActivityPlace(a.id))} ${dateNote}. ${withRes.length} of ${allStudents.length} turned in. Checks take no #number — they never enter the course's numbered run.`,
    grid: teacherDoneRollHtml(a, [...allStudents].sort((x,y)=>String(x.name||x.email||'').localeCompare(String(y.name||y.email||''))), s=>!!(s.exitChecks||{})[a.id])
      +table,
  };
}
async function teacherSetActivityHidden(id, state){
  const on = state==='hide';
  if(!teacherClassConfig.hiddenActivities) teacherClassConfig.hiddenActivities={};
  const had = Object.prototype.hasOwnProperty.call(teacherClassConfig.hiddenActivities, id);
  const prev = teacherClassConfig.hiddenActivities[id];
  if(on) teacherClassConfig.hiddenActivities[id]=true; else delete teacherClassConfig.hiddenActivities[id];
  /* Painted now from the copy just changed, like teacherMoveActivity: the
     read after the write waits while any of this tab's writes are out
     (loadTeacherClassConfig), so a run of quick toggles showed nothing
     until the last one landed. */
  if(teacherView==='activities') renderTeacherActivities({cached:true});
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    // Clear the flag rather than writing false, so config/class doesn't
    // accumulate a row per activity that was ever hidden.
    const patch = on ? {hiddenActivities:{[id]:true}} : {hiddenActivities:{[id]:fv.delete()}};
    await teacherWriteConfig(patch, {['hiddenActivities.'+id]: had?prev:undefined});
  }catch(e){
    // Save failed — undo the optimistic local mutation so the re-render
    // below reflects what Firestore actually holds, not what we hoped for.
    if(had) teacherClassConfig.hiddenActivities[id]=prev; else delete teacherClassConfig.hiddenActivities[id];
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
  else if(teacherView==='songs') renderTeacherSongs();
}
/* The Hide all / Show all button on a board section's heading: the same
   hiddenActivities flag teacherSetActivityHidden writes, for every live card
   in that module group at once, in ONE write. It writes the cards' own flags
   and nothing about the group, so any one card can be set back with its own
   Visible / Hidden switch afterwards. Archived / deleted cards in the group
   are left alone. Cell-checked on each card's row it touches — a card someone
   else re-hid or un-hid in the meantime refuses the whole write. */
async function teacherSetModuleHidden(module, state){
  const mn=Number(module);
  const on = state==='hide';
  const sec=teacherBoardView(teacherClassConfig).sections.find(s=>s.module===mn);
  const ids=sec ? sec.ids.slice() : [];
  if(!ids.length) return;
  if(!teacherClassConfig.hiddenActivities) teacherClassConfig.hiddenActivities={};
  const map=teacherClassConfig.hiddenActivities;
  const before={};
  ids.forEach(id=>{ before[id]={had:Object.prototype.hasOwnProperty.call(map,id), prev:map[id]}; });
  ids.forEach(id=>{ if(on) map[id]=true; else delete map[id]; });
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const rows={}, base={};
    ids.forEach(id=>{
      rows[id] = on ? true : fv.delete();
      base['hiddenActivities.'+id] = before[id].had ? before[id].prev : undefined;
    });
    await teacherWriteConfig({hiddenActivities:rows}, base);
  }catch(e){
    // Save failed — put every card's flag back as it was before the click.
    ids.forEach(id=>{ if(before[id].had) map[id]=before[id].prev; else delete map[id]; });
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
}
/* Required / Optional — config/class.optionalActivities (id -> true). An
   optional activity is still visible to students (caIsVisible ignores this
   map) but never blocks the site (caBlockers, teacherBlockersFor,
   journeyBlockers). Same write shape as teacherSetActivityHidden:
   cell-checked, flag cleared rather than written false. */
async function teacherSetActivityOptional(id, state){
  const on = state==='optional';
  if(!teacherClassConfig.optionalActivities) teacherClassConfig.optionalActivities={};
  const had = Object.prototype.hasOwnProperty.call(teacherClassConfig.optionalActivities, id);
  const prev = teacherClassConfig.optionalActivities[id];
  /* The flag is stored only when it differs from the default
     (teacherActivityOptionalByDefault): true for Optional on a card that is
     Required by default, false for Required on one that is Optional by
     default. Matching the default clears it. */
  const keep = on!==teacherActivityOptionalByDefault(id, teacherClassConfig);
  if(keep) teacherClassConfig.optionalActivities[id]=on; else delete teacherClassConfig.optionalActivities[id];
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const patch = {optionalActivities:{[id]: keep ? on : fv.delete()}};
    // activityStudents too: `keep` came from it (a card given to individual
    // students is Optional by default), so a Who change from another console
    // since this tab's read has to refuse, not store the wrong flag.
    await teacherWriteConfig(patch, {['optionalActivities.'+id]: had?prev:undefined, ['activityStudents.'+id]: (teacherClassConfig.activityStudents||{})[id]});
  }catch(e){
    if(had) teacherClassConfig.optionalActivities[id]=prev; else delete teacherClassConfig.optionalActivities[id];
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
}
/* Who — config/class.activityStudents (id -> { uid -> true }). One tick is
   one cell, so the write is cell-checked on that cell, same shape as
   teacherSetActivityOptional; an unticked student's key is deleted rather
   than written false, and the last untick leaves an empty map, which every
   reader takes as "whole class". Students read it in caForMe (app.js) and
   journeyForStudent (tabs/journey.js); teacherBlockersFor here. Nothing in
   progress/{uid} is touched. */
async function teacherSetActivityStudent(id, uid, on){
  if(!id || !uid) return;
  if(!teacherClassConfig.activityStudents) teacherClassConfig.activityStudents={};
  const map=teacherClassConfig.activityStudents;
  const who=(map[id] && typeof map[id]==='object') ? map[id] : (map[id]={});
  const had=Object.prototype.hasOwnProperty.call(who, uid);
  const prev=who[uid];
  if(on) who[uid]=true; else delete who[uid];
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const patch={activityStudents:{[id]:{[uid]: on ? true : fv.delete()}}};
    await teacherWriteConfig(patch, {['activityStudents.'+id+'.'+uid]: had?prev:undefined});
  }catch(e){
    if(had) who[uid]=prev; else delete who[uid];
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
}
/* "Back to whole class" — drops the activity's whole entry. Strict write
   (no base): it clears ticks this tab may not have seen. */
async function teacherSetActivityWholeClass(id){
  const map=teacherClassConfig.activityStudents||{};
  if(!map[id]) return;
  const prev=map[id];
  delete map[id];
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    await teacherWriteConfig({activityStudents:{[id]:fv.delete()}});
  }catch(e){
    map[id]=prev;
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
}
/* Play Along by date / now — config/class.playAlongActivities (id -> true),
   practice cards only. "Now" puts the card in the Songs page's Play Along
   list without a release date (app.js caIsPlayAlongOnly); it does not make
   the card visible on In-Class Activities and it is not read by any of the
   three blocker rules, so it can never gate anyone. Hidden, Archive and
   Delete still win. Same write shape as teacherSetActivityOptional:
   cell-checked, flag cleared rather than written false. */
async function teacherSetActivityPlayAlong(id, state){
  const on = state==='now';
  if(!teacherClassConfig.playAlongActivities) teacherClassConfig.playAlongActivities={};
  const had = Object.prototype.hasOwnProperty.call(teacherClassConfig.playAlongActivities, id);
  const prev = teacherClassConfig.playAlongActivities[id];
  if(on) teacherClassConfig.playAlongActivities[id]=true; else delete teacherClassConfig.playAlongActivities[id];
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const patch = on ? {playAlongActivities:{[id]:true}} : {playAlongActivities:{[id]:fv.delete()}};
    await teacherWriteConfig(patch, {['playAlongActivities.'+id]: had?prev:undefined});
  }catch(e){
    if(had) teacherClassConfig.playAlongActivities[id]=prev; else delete teacherClassConfig.playAlongActivities[id];
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
}
/* Keep practicing pins — config/class.activityPins, an ORDERED array of at
   most TEACHER_PINS_MAX activity ids (app.js CA_PINS_MAX, caPinRowHtml).
   Students get one button per pin at the top of In-Class Activities, in
   this order, with or without a release date; a pin is never read by
   caIsVisible or by any of the three blocker rules, so it can't gate
   anyone or count as one of today's cards. Hidden, Archive, Delete and
   "not assigned" still win on the student side.

   An array, not an id -> true map like its neighbours, because the ORDER is
   the point and four is a hard limit — so the write replaces the whole
   array, and it is cell-checked on the whole array: a concurrent pin or
   unpin from another console refuses rather than being overwritten, while
   an unrelated edit (a date, Hidden) goes through. */
const TEACHER_PINS_MAX = 4;
function teacherActivityPins(cfg){
  const v = cfg && cfg.activityPins;
  return Array.isArray(v) ? v.filter(x=>typeof x==='string' && x) : [];
}
async function teacherSetActivityPin(id, state){
  const cfg = teacherClassConfig;
  const had = Object.prototype.hasOwnProperty.call(cfg,'activityPins');
  const prev = cfg.activityPins;
  const cur = teacherActivityPins(cfg);
  let next;
  if(state==='on'){
    if(cur.includes(id)) return;
    if(cur.length>=TEACHER_PINS_MAX){
      alert('Keep practicing holds '+TEACHER_PINS_MAX+' cards at most. Unpin one first.');
      return;
    }
    next = cur.concat(id);
  } else {
    if(!cur.includes(id)) return;
    next = cur.filter(x=>x!==id);
  }
  cfg.activityPins = next;
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    await teacherWriteConfig({activityPins: next}, {activityPins: had?prev:undefined});
  }catch(e){
    if(had) cfg.activityPins=prev; else delete cfg.activityPins;
    teacherConfigSaveFailed(e, 'Could not save that pin — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
}
/* ── Typing a release date (2026-10-12) ──────────────────────────────────
   Chrome fires 'change' on a date box after EVERY keystroke that leaves a
   complete date, not once at the end. Checked in headless Chrome over CDP
   the same day, with the box holding 2026-10-12:
     retype the day as 25    -> change 2026-10-02, then 2026-10-25
     retype the year as 2027 -> change 0002-10-12, 0020-10-12, 0202-10-12,
                                then 2027-10-12
   Each of those was a write. 2026-10-02 and 0002-10-12 are in the past, so a
   scheduled card went LIVE for students mid-keystroke, and the repaint after
   that write threw away the box being typed in.

   So a typed date is saved once — on Enter or on leaving the box — and a
   year more than one away from this one is refused (the box goes back to the
   saved date and says why), since no real release date is in 0202. A pick
   from the calendar has no keystroke behind it (no data-typing flag), so it
   still saves the moment it's made. */
function teacherSavedActivityDate(id){
  return ((teacherClassConfig&&teacherClassConfig.activityDates)||{})[id]||'';
}
function teacherCommitActivityDate(box){
  if(!box) return;
  delete box.dataset.typing;
  const id=box.dataset.id;
  const saved=teacherSavedActivityDate(id);
  const value=box.value;
  if(value===saved) return;   // nothing changed (or Enter then leaving the box — saved once)
  if(!value){
    // '' is either a cleared box (unpublish, as before) or a half-filled one
    // (a field blanked with Backspace) — the box reports the second as badInput.
    if(box.validity && box.validity.badInput){ teacherRejectActivityDate(box, saved, 'That date is not complete — nothing was saved.'); return; }
  } else {
    // The whole year, not its first four characters: the box takes up to six
    // year digits, and '20277-10-12' read as 2027 passed here and was then
    // dropped without a word by teacherSetActivityDate's format check.
    const y=Number(value.split('-')[0]), now=new Date().getFullYear();
    if(!(y>=now-1 && y<=now+1)){ teacherRejectActivityDate(box, saved, `Year ${y} is not right — use ${now-1} to ${now+1}. Nothing was saved.`); return; }
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value)){ teacherRejectActivityDate(box, saved, 'That date is not complete — nothing was saved.'); return; }
  }
  teacherSetActivityDate(id, value);
}
/* Put the saved date back and say why, beside the box. Red is the site's
   error colour (--red-text, as on the issue-report form's error line). It
   clears on the next edit, or after a few seconds. */
function teacherRejectActivityDate(box, saved, msg){
  box.value=saved;
  box.setAttribute('aria-invalid','true');
  box.style.outline='2px solid var(--red-text)';
  const old=box.parentNode && box.parentNode.querySelector('.t-date-err');
  if(old) old.remove();
  const note=document.createElement('span');
  note.className='t-date-err';
  note.setAttribute('role','alert');
  note.style.cssText='color:var(--red-text);font-size:0.8125rem;margin-left:6px';
  note.textContent=msg;
  box.insertAdjacentElement('afterend', note);
  const clear=()=>{ box.removeAttribute('aria-invalid'); box.style.outline=''; note.remove(); };
  box.addEventListener('input', clear, {once:true});
  setTimeout(clear, 6000);
}
// The actual publish switch for an activity — see the schema note at the top
// of renderTeacherActivities. Mirrors teacherSetActivityHidden's write shape
// exactly, just against a different map on the same doc.
async function teacherSetActivityDate(id, value){
  const dateRe=/^\d{4}-\d{2}-\d{2}$/;
  if(value && !dateRe.test(value)) return;   // malformed <input> value — ignore rather than write garbage
  if(!teacherClassConfig.activityDates) teacherClassConfig.activityDates={};
  const had = Object.prototype.hasOwnProperty.call(teacherClassConfig.activityDates, id);
  const prev = teacherClassConfig.activityDates[id];
  if(value) teacherClassConfig.activityDates[id]=value; else delete teacherClassConfig.activityDates[id];
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    // Clear the field rather than writing '', so config/class doesn't
    // accumulate a row per activity that was ever dated then un-dated.
    const patch = value ? {activityDates:{[id]:value}} : {activityDates:{[id]:fv.delete()}};
    await teacherWriteConfig(patch, {['activityDates.'+id]: had?prev:undefined});
  }catch(e){
    if(had) teacherClassConfig.activityDates[id]=prev; else delete teacherClassConfig.activityDates[id];
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
}

/* ── Archive / Delete an activity ───────────────────────────────────────
   Schema, the difference between the two, and what neither can reach: the
   Archive / Delete block above renderTeacherActivities.

   Both mirror teacherSetActivityHidden's write shape — optimistic local
   mutation, one merge patch, roll the mutation back and say so if the write
   fails — just across several maps instead of one. */
async function teacherSetActivityArchived(id, state){
  const on = state==='archive';
  const cfg = teacherClassConfig;
  if(!cfg.archivedActivities) cfg.archivedActivities={};
  if(!cfg.deletedActivities) cfg.deletedActivities={};
  const hadA=Object.prototype.hasOwnProperty.call(cfg.archivedActivities,id), prevA=cfg.archivedActivities[id];
  const hadD=Object.prototype.hasOwnProperty.call(cfg.deletedActivities,id),  prevD=cfg.deletedActivities[id];
  if(on) cfg.archivedActivities[id]=true; else delete cfg.archivedActivities[id];
  // Restoring reaches BOTH maps on purpose: one Restore button serves an
  // archived row and a deleted one, so it has to clear whichever flag is set.
  delete cfg.deletedActivities[id];
  // Archiving also unpins, the way Delete does: students never see an
  // archived card, so a pin on one only held one of the TEACHER_PINS_MAX
  // slots for nothing. Restore does not put the pin back.
  const pinsHad=Object.prototype.hasOwnProperty.call(cfg,'activityPins'), pinsPrev=cfg.activityPins;
  const pinsBefore=teacherActivityPins(cfg);
  const unpin=on && pinsBefore.includes(id);
  if(unpin) cfg.activityPins=pinsBefore.filter(x=>x!==id);
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const patch={
      archivedActivities:{[id]: on ? true : fv.delete()},
      deletedActivities:{[id]: fv.delete()}
    };
    const base={
      ['archivedActivities.'+id]: hadA?prevA:undefined,
      ['deletedActivities.'+id]:  hadD?prevD:undefined
    };
    // Still cell-checked, not strict: the new pin array is worked out from
    // the pin array alone, so naming that whole array in `base` (exactly
    // what teacherSetActivityPin does) is enough — a pin or unpin from
    // another console refuses, an unrelated edit still goes through.
    if(unpin){
      patch.activityPins=pinsBefore.filter(x=>x!==id);
      base.activityPins=pinsHad?pinsPrev:undefined;
    }
    await teacherWriteConfig(patch, base);
  }catch(e){
    if(hadA) cfg.archivedActivities[id]=prevA; else delete cfg.archivedActivities[id];
    if(hadD) cfg.deletedActivities[id]=prevD; else delete cfg.deletedActivities[id];
    if(unpin){ if(pinsHad) cfg.activityPins=pinsPrev; else delete cfg.activityPins; }
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
  else if(teacherView==='songs') renderTeacherSongs();
}
/* ── Songs view (Jonathan, 2026-10-20: "manage these songs from a different
   area of the teacher console instead of the class activities part") ──
   The Songs page's "More Play Along songs" library — every card
   caIsLibraryCard (app.js) accepts, Core songs never among them. Those
   cards are not on the Class activities board at all (caBoardOrder skips
   them), so this is the only place they are managed. One row per song:
   Visible / Hidden (the same hiddenActivities flag the board writes), how
   many students have checked off the whole card, Preview and Copy link.
   No dates, no module, no #N, no Who: every student gets every song. An
   archived or deleted one (from before this view existed) shows Restore. */
function renderTeacherSongs(){
  const box=document.getElementById('t-grid-container');
  const intro=`<div class="t-songs-intro">Every song here is on every student&rsquo;s Songs page, under <strong>More Play Along songs</strong>. Hidden takes a song off that list, and the pencil renames one. <strong>Opened</strong> counts clicks on a song&rsquo;s row on the Songs page since Nov 1, 2026: how many students, and how many times in all. Core songs are not here &mdash; they open from their own rows on the Songs page and are managed in Class activities.</div>`;
  if(!box.querySelector('.t-songs')) box.innerHTML='<div class="t-loading">Loading…</div>';
  loadTeacherClassConfig().then(cfg=>{
    if(teacherView!=='songs') return;   // switched views mid-flight
    if(!cfg) return;                    // superseded by a newer read
    const songs=(window.CLASS_ACTIVITIES||[]).filter(a=>caIsLibraryCard(a, cfg.songLibrary||{}));
    if(!songs.length){ box.innerHTML=intro+'<div class="t-loading">No songs here yet. Use <strong>Move to Songs</strong> on a song in Class activities, or push a card with <code>library: true</code>.</div>'; return; }
    const hidden=cfg.hiddenActivities||{};
    const roster=allStudentsRaw.filter(s=>!((cfg.archived||{})[s.uid]));
    const short=a=>teacherActivityTitle(a,cfg).split(' — ')[0];
    // Two cards for one song show their full titles (same rule as the Songs page).
    const name=a=>songs.filter(b=>short(b)===short(a)).length>1 ? teacherActivityTitle(a,cfg) : short(a);
    songs.sort((x,y)=>name(x).localeCompare(name(y)));
    const rows=songs.map(a=>{
      const retired=teacherActivityRetired(a.id,cfg);
      const isHidden=hidden[a.id]===true;
      const done=roster.filter(s=>(s.classActivities||{})[a.id]===true).length;
      // Popularity (songsLibraryOpen, app.js): students who opened it from the
      // Songs page, and the total opens. Only clicks since 2026-11-01 count.
      const openers=roster.filter(s=>((s.songOpens||{})[a.id]||0)>0);
      const opens=openers.reduce((n,s)=>n+s.songOpens[a.id],0);
      const popTxt=`${openers.length} ${openers.length===1?'student':'students'} \u00b7 ${opens} ${opens===1?'open':'opens'}`;
      const status=retired
        ? `<span class="t-songs-off">${teacherActivityDeleted(a.id,cfg)?'Deleted':'Archived'} &mdash; not on the Songs page</span>`
          +`<button class="tg-seg-btn" data-set-activity-archived data-id="${escAttr(a.id)}" data-state="restore">Restore</button>`
        : `<div class="tg-seg">`
          +`<button class="tg-seg-btn ${!isHidden?'on':''}" data-set-activity-hidden data-id="${escAttr(a.id)}" data-state="show" title="On every student's Songs page">Visible</button>`
          +`<button class="tg-seg-btn ${isHidden?'on':''}" data-set-activity-hidden data-id="${escAttr(a.id)}" data-state="hide" title="Off the Songs page for everyone">Hidden</button></div>`;
      // Rename: the box holds the name the Songs page shows; the rest of the
      // card title (" — Play Along") rides along on data-suffix so the card
      // keeps it. Same activityTitles rename as the Class activities board.
      const full=teacherActivityTitle(a,cfg);
      const suffix=name(a)===full ? '' : full.slice(name(a).length);
      const renamed=teacherActivityRenamed(a,cfg);
      if(activityEditId===a.id){
        return `<div class="t-board-card t-songs-row">`
          +`<span class="t-act-title-lbl">rename</span>`
          +`<input type="text" class="t-act-title-edit" data-id="${escAttr(a.id)}" data-suffix="${escAttr(suffix)}" value="${escAttr(name(a))}" maxlength="100" spellcheck="false" aria-label="Rename ${escAttr(name(a))}">`
          +`<span class="t-act-title-hint">Students see this name right away, on the Songs page and on the card, in both languages.${renamed?` Was: ${escHtml(a.title.split(' — ')[0])}`:''}</span>`
          +`<div style="margin-top:7px;display:flex;gap:6px;flex-wrap:wrap">`
          +`<button class="tg-seg-btn on" data-rename-save data-id="${escAttr(a.id)}">Save</button>`
          +`<button class="tg-seg-btn" data-rename-cancel>Cancel</button>`
          +(renamed?`<button class="tg-seg-btn" data-rename-reset data-id="${escAttr(a.id)}">Undo rename</button>`:'')
          +`</div></div>`;
      }
      return `<div class="t-board-card t-songs-row${(isHidden||retired)?' t-board-dim':''}">`
        +`<div class="t-board-row"><span class="t-songs-name">${escHtml(name(a))}</span> <button class="t-act-pencil" data-rename-activity data-id="${escAttr(a.id)}" title="Rename this song" aria-label="Rename ${escAttr(name(a))}">&#x270E;</button><span class="t-songs-id">${escHtml(a.id)}</span>`
        +`<span class="t-songs-done">${roster.length?`${done} of ${roster.length} students done`:'No student data yet'}</span>`
        +(roster.length?`<span class="t-songs-pop" title="Students who opened this song from the Songs page, and how many times in all (since Nov 1, 2026)">Opened: ${popTxt}</span>`:'')+`</div>`
        +`<div class="t-board-ctl">${status}<span class="t-board-ctl-sp">`
        +`<button class="tg-seg-btn" data-open-activity data-id="${escAttr(a.id)}">Preview</button>`
        +`<button class="tg-seg-btn" data-copy-activity-link data-id="${escAttr(a.id)}">Copy link</button>`
        +`<button class="tg-seg-btn" data-set-song-place data-id="${escAttr(a.id)}" data-state="activities" title="Take this off the Songs page and put it back on the Class activities board — in its old slot if it had one, otherwise in Built">Move to Class activities</button></span></div>`
        +`</div>`;
    }).join('');
    box.innerHTML=intro+`<div class="t-songs">${rows}</div>`;
    // Opening the editor is a full re-render — put the cursor in the box.
    if(activityEditId){
      const inp=box.querySelector('.t-act-title-edit');
      if(inp){ inp.focus(); inp.select(); }
    }
  });
}
/* ── Teacher view songs (Jonathan, 2026-10-22: "make it only visible to
   me … add a teacher console page 'teacher view songs' and put it on there
   so I can pull it up for the whole class. add a button to assign it to the
   whole class from there as an option"; later the same day: "i'd like to be
   able to move a song to class activities instead of to the songs page") ──
   Every `teacherOnly: true` card (caIsTeacherSong in app.js), played right
   here for the projector: the real practice card from caCardBodyHtml (the
   one body renderer the student card and the Class activities preview
   share), so the room sees exactly what a student would. Ticks here save
   nothing. One song on screen at a time; a row of buttons above it picks
   which when there is more than one.

   "Move to Class activities" writes config/class.classSongs[id] = true,
   which puts the card on the Class activities board (in Built, or its old
   slot) as an ordinary activity — Jonathan assigns and dates it there;
   "Teacher only" deletes the row. A moved card stays listed here, so it can
   still be played for the room and moved back. The share row repaints on
   its own, so the song keeps playing while you click it. */
let teacherViewSongId=null;
function teacherViewSongs(){ return (window.CLASS_ACTIVITIES||[]).filter(a=>a.teacherOnly===true); }
function teacherViewSongShareHtml(a, cfg){
  const shared=((cfg&&cfg.classSongs)||{})[a.id]===true;
  return `<div class="tg-seg">`
    +`<button class="tg-seg-btn ${!shared?'on':''}" data-tvs-share data-id="${escAttr(a.id)}" data-state="teacher" title="Only on this tab. Students do not see it.">Teacher only</button>`
    +`<button class="tg-seg-btn ${shared?'on':''}" data-tvs-share data-id="${escAttr(a.id)}" data-state="class" title="Put it on the Class activities board, where you assign it to a module and date it like any activity">Move to Class activities</button></div>`
    +`<span class="t-songs-off" style="margin-left:10px">${shared?'On the Class activities board. Students see it once you assign it to a module and its date arrives.':'Students do not see this song.'}</span>`;
}
function renderTeacherViewSongs(){
  const box=document.getElementById('t-grid-container');
  const songs=teacherViewSongs();
  if(!songs.length){ box.innerHTML='<div class="t-loading">No teacher-only songs yet. A card with <code>teacherOnly: true</code> shows up here.</div>'; return; }
  if(!songs.some(a=>a.id===teacherViewSongId)) teacherViewSongId=songs[0].id;
  if(!box.querySelector('[data-tvs]')) box.innerHTML='<div class="t-loading">Loading…</div>';
  loadTeacherClassConfig().then(cfg=>{
    if(teacherView!=='tsongs') return;   // switched views mid-flight
    if(!cfg) return;                     // superseded by a newer read
    const raw=songs.find(a=>a.id===teacherViewSongId);
    const a=typeof caView==='function'?caView(raw):raw;
    const picker=songs.length>1
      ? `<div class="tg-seg" style="margin-bottom:12px">${songs.map(x=>`<button class="tg-seg-btn ${x.id===raw.id?'on':''}" data-tvs-pick data-id="${escAttr(x.id)}">${escHtml(teacherActivityTitle(x,cfg))}</button>`).join('')}</div>`
      : '';
    // Same card already up (a config re-read): leave it, so the song keeps
    // playing; only the share row is repainted.
    const cur=box.querySelector('[data-tvs]');
    if(cur && cur.dataset.tvs===raw.id){
      const ctl=box.querySelector('[data-tvs-ctl]');
      if(ctl) ctl.innerHTML=teacherViewSongShareHtml(raw, cfg);
      return;
    }
    if(typeof stopCardAudio==='function') stopCardAudio();
    box.innerHTML=`<div data-tvs="${escAttr(raw.id)}">`
      +`<div class="t-songs-intro">Songs only you can see, to play for the whole class. Students see one only after you move it to Class activities and assign it there.</div>`
      +picker
      +`<div class="stu-section-head" style="margin-top:0">${escHtml(teacherActivityTitle(raw,cfg))} <span style="opacity:.55;font-size:.72em">(${escHtml(raw.id)})</span></div>`
      +`<div data-tvs-ctl style="display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin:0 2px 14px">${teacherViewSongShareHtml(raw, cfg)}</div>`
      +(a.intro?`<div class="coach-tip" style="margin:0 2px 16px">${escHtml(a.intro)}</div>`:'')
      +caCardBodyHtml(a,{preview:true})
      +`</div>`;
  });
}
function teacherViewSongPick(id){
  if(id===teacherViewSongId) return;
  teacherViewSongId=id;
  renderTeacherViewSongs();
}
/* Move a teacher-only card to Class activities, or take it back —
   config/class.classSongs, id -> true; "Teacher only" deletes the row.
   Nothing else is touched: a board slot, date, Hidden and Who all stay, so
   a card moved back and forth lands where it was.
   Cell-checked on that one row, like teacherSetSongPlace. Students'
   progress is never written. */
async function teacherSetClassSong(id, on){
  const a=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  if(!a || a.teacherOnly!==true) return;
  if(!teacherClassConfig.classSongs) teacherClassConfig.classSongs={};
  const map=teacherClassConfig.classSongs;
  const had=Object.prototype.hasOwnProperty.call(map, id);
  const prev=map[id];
  if((prev===true)===on) return;
  if(on) map[id]=true; else delete map[id];
  const ctl=document.querySelector('[data-tvs-ctl]');
  if(ctl) ctl.innerHTML=teacherViewSongShareHtml(a, teacherClassConfig);   // shown now
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    await teacherWriteConfig({classSongs:{[id]: on ? true : fv.delete()}}, {['classSongs.'+id]: had?prev:undefined});
  }catch(e){
    if(had) map[id]=prev; else delete map[id];
    teacherConfigSaveFailed(e, 'Could not move that song — check your connection and Firestore rules.');
  }
  if(teacherView==='tsongs') renderTeacherViewSongs();
  else if(teacherView==='activities') renderTeacherActivities();
}
/* Move a song (caIsSongCard in app.js) between Class activities and the
   Songs page — config/class.songLibrary, id -> true (Songs) / false (Class
   activities). Matching the card's own `library` field clears the row, so
   the doc only holds real moves. Cell-checked on that one row. Nothing else
   is touched: the board slot, date, Hidden and Who all stay, so a song
   moved back lands where it was. Students' progress is never written. */
async function teacherSetSongPlace(id, where){
  const a=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  if(!a || !caIsSongCard(a)) return;
  const toSongs = where==='songs';
  if(!teacherClassConfig.songLibrary) teacherClassConfig.songLibrary={};
  const map=teacherClassConfig.songLibrary;
  const had=Object.prototype.hasOwnProperty.call(map, id);
  const prev=map[id];
  const clear = toSongs===(a.library===true);
  if(clear) delete map[id]; else map[id]=toSongs;
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    await teacherWriteConfig({songLibrary:{[id]: clear ? fv.delete() : toSongs}}, {['songLibrary.'+id]: had?prev:undefined});
  }catch(e){
    if(had) map[id]=prev; else delete map[id];
    teacherConfigSaveFailed(e, 'Could not move that song — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
  else if(teacherView==='songs') renderTeacherSongs();
}
/* Delete = archive, plus wipe every console setting this activity has. The
   wipe is the whole point of having a second button: it is what makes a
   restored activity start over (undated, so invisible until it is published
   again) rather than snap back onto In-Class Activities the moment the flag comes off.

   Confirmed first, because unlike Archive it throws away work — a release
   date, a rename, a place on the board, a set of per-student gate clears.
   Deliberately NOT touching students' progress docs: the teacher has no
   write there (firestore.rules), and a completion record is grade data. */
async function teacherDeleteActivity(id){
  const cfg = teacherClassConfig;
  const a = (window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  const shown = a ? teacherActivityTitle(a,cfg) : id;
  if(!window.confirm(
    'Delete \u201c'+shown+'\u201d?\n\n'
    +'Students stop seeing it, and its release date, rename, place on the board and per-student gate clears are all cleared.\n\n'
    +'You can bring it back from the Built column\u2019s \u201cArchived / deleted\u201d list, but it comes back blank \u2014 unplaced and undated, so you would assign and publish it again from scratch.\n\n'
    +'What stays either way: the activity itself (it ships in the site\u2019s code, so only a code update really removes it) and every student\u2019s record of having finished it.\n\n'
    +'To tuck it away and keep its settings, cancel and use Archive instead.')) return;
  // activityBoard is in the list because Delete un-places the card as well:
  // a restored one comes back in Built, blank, to be placed and published
  // from scratch. Archive deliberately does NOT touch it — that's the whole
  // difference between the two, and why Restore-from-archive puts the card
  // back in its own module at its own position.
  const MAPS=['archivedActivities','deletedActivities','hiddenActivities','optionalActivities','playAlongActivities','activityStudents','activityDates','activityTitles','activityNumbers','activityBoard'];
  MAPS.forEach(m=>{ if(!cfg[m]) cfg[m]={}; });
  if(!cfg.activityClears) cfg.activityClears={};
  const clears=cfg.activityClears;
  // Only the uids that actually hold a clear for THIS activity — activityClears
  // is uid -> { activityId -> true }, so the patch has to name each uid's row.
  const clearUids=Object.keys(clears).filter(uid=>clears[uid] && Object.prototype.hasOwnProperty.call(clears[uid],id));
  const before={}, beforeClears={};
  MAPS.forEach(m=>{ before[m]=Object.prototype.hasOwnProperty.call(cfg[m],id) ? cfg[m][id] : undefined; });
  clearUids.forEach(uid=>{ beforeClears[uid]=clears[uid][id]; });
  /* Taking the card off the board leaves a hole in its module's 1..N run,
     so the survivors are re-packed in the same write — same contract every
     other board writer keeps (teacherMoveActivity), including its two
     passes: the board shown now is optimistic, and the re-pack SENT is
     worked out again at the gate from the confirmed board (see
     teacherBoardTurnBase). The board is replaced, never edited in place, so
     the `prev` a queued writer holds can't change under it. */
  const plan=board=>{
    const next={}, repack={};
    Object.keys(board).forEach(k=>{ if(k!==id) next[k]=board[k]; });
    const entry=board[id];
    if(entry){
      const from=Number(entry.module)||0;
      teacherBoardModuleIds(cfg,from,board).filter(x=>x!==id).forEach((x,i)=>{
        const p=board[x];
        if(!p || Number(p.pos)!==i+1) repack[x]=next[x]={module:from, pos:i+1};
      });
    }
    return {next, repack};
  };
  const prev=cfg.activityBoard;
  cfg.deletedActivities[id]=true;
  MAPS.filter(m=>m!=='deletedActivities' && m!=='activityBoard').forEach(m=>{ delete cfg[m][id]; });
  cfg.activityBoard=plan(prev).next;   // optimistic
  clearUids.forEach(uid=>{ delete clears[uid][id]; });
  const seq0=boardSettled;
  const pinsHad=Object.prototype.hasOwnProperty.call(cfg,'activityPins'), pinsPrev=cfg.activityPins;
  const pinsBefore=teacherActivityPins(cfg);
  if(pinsBefore.includes(id)) cfg.activityPins=pinsBefore.filter(x=>x!==id);
  // A deleted row leaves the table, so an open rename box on it would be
  // editing something that is no longer there. Cleared before the optimistic
  // repaint below so that paint doesn't draw the editor on the deleted card.
  if(activityEditId===id) activityEditId=null;
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherMoveActivity
  const release=await waitBoardWriteTurn();
  const {live, base}=teacherBoardTurnBase(cfg, prev, seq0);
  const {next, repack}=plan(base);
  live.activityBoard=next;
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const patch={deletedActivities:{[id]:true}};
    MAPS.filter(m=>m!=='deletedActivities').forEach(m=>{ patch[m]={[id]:fv.delete()}; });
    Object.keys(repack).forEach(k=>{ patch.activityBoard[k]=repack[k]; });
    if(clearUids.length){
      patch.activityClears={};
      clearUids.forEach(uid=>{ patch.activityClears[uid]={[id]:fv.delete()}; });
    }
    // Delete wipes everything the console set for the card, its pin too.
    if(pinsBefore.includes(id)) patch.activityPins=pinsBefore.filter(x=>x!==id);
    // Strict (no base): like a move, this re-packs the module the card
    // leaves, so it depends on more of the board than the patch names.
    await teacherWriteConfig(patch);
    teacherBoardSettle(live, next);
  }catch(e){
    MAPS.filter(m=>m!=='activityBoard').forEach(m=>{ if(before[m]===undefined) delete cfg[m][id]; else cfg[m][id]=before[m]; });
    teacherBoardSettle(live, base);
    clearUids.forEach(uid=>{ clears[uid][id]=beforeClears[uid]; });
    if(pinsHad) cfg.activityPins=pinsPrev; else delete cfg.activityPins;
    teacherConfigSaveFailed(e, 'Could not delete that activity — check your connection and Firestore rules.');
  }finally{
    release();
  }
  if(teacherView==='activities') renderTeacherActivities();
}

/* ── Per-student activity-gate clears (Today-first work order, Phase 1) ──
   config/class.activityClears: uid -> { activityId -> true }. Lets a student
   past the gate (app.js caBlockers) without finishing a specific activity —
   a sub day, a connectivity problem, a kid who did the work on paper. Same
   doc, same teacher-writes/student-reads rule as hiddenActivities/
   activityDates/gameOverrides above; no firestore.rules change needed.

   teacherActivityVisible/teacherBlockersFor mirror caIsVisible/caBlockers in
   app.js, deliberately NOT shared with them: those read app.js's own
   `activityDates`/`hiddenActivityIds` globals, which only loadClassConfig()
   (the STUDENT boot path) ever populates — a teacher session never calls it,
   so those globals would read as empty here. This reads straight off the
   student's own doc (allStudents) and the config object this file already
   has in hand. If the visibility rule ever changes, change it in both. */
function teacherActivityVisible(a, cfg, today, uid, view){
  if(teacherActivityRetired(a.id, cfg)) return false;   // archived/deleted — see caIsVisible in app.js
  // Not placed on the board = not in the course. Same condition, same
  // position, as the assigned check in caIsVisible() — without it the
  // console keeps counting an un-assigned card as a blocker ("Blocked by N",
  // the per-student gate list, Clear all) for students it no longer blocks.
  // Read through the board resolver students use (teacherBoardView ->
  // caBoardOrder), not the raw activityBoard row: Move to Songs and Move to
  // Teacher view songs keep the row for the trip back, and caBoardOrder
  // never assigns a library song or a teacher-only card. `view` lets
  // teacherBlockersFor work the board out once per student.
  if(!(view||teacherBoardView(cfg)).assigned[a.id]) return false;
  if(((cfg&&cfg.hiddenActivities)||{})[a.id]===true) return false;
  // Given to other students only (the board's "Who" picker) — caForMe in app.js.
  if(uid!==undefined && !teacherActivityForStudent(a,uid,cfg)) return false;
  const d=((cfg&&cfg.activityDates)||{})[a.id];
  return d ? d<=today : false;
}
// The one place the two retire maps are read together — everything that only
// cares "is this still in circulation?" goes through here.
function teacherActivityArchived(id, cfg){ return ((cfg&&cfg.archivedActivities)||{})[id]===true; }
function teacherActivityDeleted(id, cfg){ return ((cfg&&cfg.deletedActivities)||{})[id]===true; }
function teacherActivityRetired(id, cfg){ return teacherActivityArchived(id,cfg) || teacherActivityDeleted(id,cfg); }
/* Both detail pages are reachable from a shown archived/deleted row, and
   everything else on them (a release date, a per-student Clear, "students
   block on this") reads as if the activity were still in play. One banner
   up top, so the page can't quietly contradict the table. */
function teacherRetiredBanner(id){
  const cfg=teacherClassConfig;
  if(!teacherActivityRetired(id,cfg)) return '';
  const del=teacherActivityDeleted(id,cfg);
  return `<div class="tg-note"><strong>${del?'Deleted':'Archived'}.</strong> Students don't see this activity and it doesn't gate the site${del?' — and its date, rename, place on the board and gate clears have been cleared':''}. Restore it from the Class activities board${del?' — it\'s in Built, under “Archived / deleted”':' — it\'s under “Archived” inside its module'}.</div>`;
}
// The Gate column for a CAS student on the activity/check detail grids:
// every activity is optional for CAS (teacherBlockersFor), so a Clear
// button there would do nothing.
const TEACHER_CAS_GATE_CELL='<td><span class="stu-period" title="CAS students are never sent to an activity first — every activity is optional for them.">CAS · optional</span></td>';
/* Individual activities — mirrors caForMe (app.js) and journeyForStudent
   (tabs/journey.js). The ticked students, as uid -> true; {} = whole class. */
function teacherActivityStudents(id, cfg){
  const who=((cfg&&cfg.activityStudents)||{})[id];
  const out={};
  if(who && typeof who==='object') Object.keys(who).forEach(u=>{ if(who[u]===true) out[u]=true; });
  return out;
}
function teacherActivityForStudent(a, uid, cfg){
  const who=teacherActivityStudents(a.id, cfg);
  return !Object.keys(who).length || who[uid]===true;
}
/* The board's Who picker list: one checkbox per student, by period. Drawn
   only while that card's picker is open (boardWhoOpen) — closed, it was ~60
   checkboxes on every card that nobody could see, rebuilt on every repaint
   and every minute's refresh. Opening one fills it in place (the toggle
   listener in showTeacherApp); a repaint redraws an open one in full. */
function teacherWhoBoxesHtml(a, cfg){
  const picked=teacherActivityStudents(a.id,cfg);
  const arch=cfg.archived||{};
  const roster=allStudentsRaw.filter(s=>!arch[s.uid] || picked[s.uid])
    .slice().sort((x,y)=>(x.name||x.email||'').localeCompare(y.name||y.email||'', undefined, {sensitivity:'base'}));
  const perLabel=p=>!p?'No period':p==='CAS'?'CAS':'Period '+p;
  const groups={};
  roster.forEach(s=>{ const p=teacherStudentPeriod(s)||''; (groups[p]=groups[p]||[]).push(s); });
  const order=['4','7','CAS',''].filter(p=>groups[p]);
  const boxes=order.map(p=>`<div class="t-who-group"><div class="t-who-head">${escHtml(perLabel(p))}</div>`
    +groups[p].map(s=>`<label class="t-who-row"><input type="checkbox" data-set-activity-student data-id="${escAttr(a.id)}" data-uid="${escAttr(s.uid)}"${picked[s.uid]?' checked':''}> ${escHtml(s.name||s.email||s.uid.slice(0,8)+'…')}</label>`).join('')
    +`</div>`).join('');
  return boxes||'<div class="t-who-note">No students yet.</div>';
}
/* Optional = the board switch (stored true / false), else the default:
   Optional when the data says `optional: true` or the card is given to
   individual students (Jonathan, 2026-10-14). Mirrors caIsOptional. */
function teacherActivityOptionalByDefault(id, cfg){
  const a=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  return !!(a && a.optional===true) || Object.keys(teacherActivityStudents(id,cfg)).length>0;
}
function teacherActivityOptional(id, cfg){
  const f=((cfg&&cfg.optionalActivities)||{})[id];
  return f===true || (f!==false && teacherActivityOptionalByDefault(id,cfg));
}
function teacherBlockersFor(stu, cfg){
  const today=dayStr(new Date());
  const clears=((cfg&&cfg.activityClears)||{})[stu.uid]||{};
  // CAS students: every activity is optional, so nothing blocks — mirrors
  // caStudentIsCAS() in app.js. Effective period via the shared helper, same
  // formula teacherStudentPeriod() uses at every other call site.
  if(teacherStudentPeriod(stu, cfg)==='CAS') return [];
  const view=teacherBoardView(cfg);
  // Optional activities never block — mirrors caBlockers() in app.js.
  return (window.CLASS_ACTIVITIES||[]).filter(a=>
    teacherActivityVisible(a,cfg,today,stu.uid,view) &&!teacherActivityOptional(a.id,cfg) && (stu.classActivities||{})[a.id]!==true && clears[a.id]!==true);
}
/* The detail pages' Gate column reads as if the activity blocks. When it's
   Optional it doesn't, so say so above the grid rather than leave a column
   of Clear buttons that do nothing students can see. */
function teacherOptionalBanner(id){
  if(!teacherActivityOptional(id, teacherClassConfig)) return '';
  return `<div class="tg-note"><strong>Optional.</strong> Students see this one, tagged “Optional”, but it never sends them to In-Class Activities when they sign in, so the Clear buttons below change nothing for now. Switch it back to Required on the Class activities board.</div>`;
}
async function teacherSetActivityClear(uid, id, state){
  const on=state==='clear';
  if(!teacherClassConfig.activityClears) teacherClassConfig.activityClears={};
  if(!teacherClassConfig.activityClears[uid]) teacherClassConfig.activityClears[uid]={};
  const had=Object.prototype.hasOwnProperty.call(teacherClassConfig.activityClears[uid], id);
  const prev=teacherClassConfig.activityClears[uid][id];
  if(on) teacherClassConfig.activityClears[uid][id]=true; else delete teacherClassConfig.activityClears[uid][id];
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const patch=on ? {activityClears:{[uid]:{[id]:true}}} : {activityClears:{[uid]:{[id]:fv.delete()}}};
    await teacherWriteConfig(patch, {['activityClears.'+uid+'.'+id]: had?prev:undefined});
  }catch(e){
    if(had) teacherClassConfig.activityClears[uid][id]=prev; else delete teacherClassConfig.activityClears[uid][id];
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  // activityDetailId outlives a switch to the Students tab (only the
  // Activities tab resets it), so check the view too — a Clear on a
  // student's page must repaint that page, not jump to the last activity.
  // On an activity's page only the Students part repaints (the Clear buttons
  // live there): rebuilding the whole page stopped a song playing in its
  // Preview and wiped an exit check's preview picks.
  if(teacherView==='activities' && activityDetailId) teacherRepaintActivityStudents(activityDetailId);
  else if(teacherView==='students') studentDetailUid ? renderTeacherStudentDetail(studentDetailUid) : renderTeacherStudents();
}
// "Clear all" on a student's detail page — every CURRENT blocker for them,
// in one write. Recomputed at click time rather than reusing whatever list
// last rendered, so a stale page (another tab just marked one done) can't
// clear something that already stopped blocking.
async function teacherClearAllBlockers(uid){
  const stu=allStudents.find(s=>s.uid===uid) || (allStudentsRaw||[]).find(s=>s.uid===uid);
  if(!stu) return;
  const blockers=teacherBlockersFor(stu, teacherClassConfig);
  if(!blockers.length) return;
  if(!teacherClassConfig.activityClears) teacherClassConfig.activityClears={};
  if(!teacherClassConfig.activityClears[uid]) teacherClassConfig.activityClears[uid]={};
  const prev={...teacherClassConfig.activityClears[uid]};
  blockers.forEach(a=>{ teacherClassConfig.activityClears[uid][a.id]=true; });
  try{
    await ensureDb();
    const patch={activityClears:{[uid]:{}}};
    blockers.forEach(a=>{ patch.activityClears[uid][a.id]=true; });
    /* Strict (no base): which activities are blocking is read off the dates,
       the hidden and archived maps and the board all at once — far more of
       the doc than this patch names. */
    await teacherWriteConfig(patch);
  }catch(e){
    teacherClassConfig.activityClears[uid]=prev;
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='students') studentDetailUid ? renderTeacherStudentDetail(studentDetailUid) : renderTeacherStudents();
}

/* ── Games access (teacher control) ──────────────────────────────────────
   One class-config doc, config/class, holds the whole-class master switch
   (gamesEnabled) and a per-student override map (gameOverrides: uid → bool;
   true = force on, false = force off, absent = follow the class). The teacher
   owns this doc; students only read it (app.js loadClassConfig). Effective
   access per student: override wins if present, else the class master. */
let teacherClassConfig = { gamesEnabled:true, gameOverrides:{} };
// Toggling a student's setting quickly (Default → On → Off) fires overlapping
// reads of config/class, and they can resolve out of order — an earlier one
// landing last would overwrite both teacherClassConfig and the repainted rows
// with a stale value, showing "On" while Firestore holds false. Every call
// takes a ticket; only the most recently issued one may touch state. An older
// one is handed the NEWEST read's result instead of its own (2026-10-25: it
// used to get null, and a caller whose view nothing else repaints — Manage,
// Games, Songs, Mic — stayed on "Loading…"; a diverged write's own reload was
// the usual newer read).
let teacherClassConfigReq = 0;
let teacherClassConfigLatest = null;   // the promise of the newest read
/* Has a real config ever landed? teacherClassConfig starts as a DEFAULT
   ({gamesEnabled:true, gameOverrides:{}}) with none of the activity maps, so
   a cached repaint before the first load would silently paint every activity
   as visible and undated. Cached paints fall back to a fresh read until this
   is true. */
let teacherClassConfigLoaded = false;
/* Did the LAST completed read actually reach Firestore? A failed read
   returns {} — indistinguishable, by its contents alone, from a class whose
   config doc is genuinely empty. Every view in this file was happy with that
   (a missing gamesEnabled just means "on"), but the activity board's
   one-time migration is not: it reads activityDates to decide what to place,
   so a failed read would seed an EMPTY board, write activityBoardSeeded, and
   take every activity off every student's In-Class Activities page — with the ordering
   work gone and no way to tell it apart from a deliberate empty board. So
   the read's success is recorded explicitly rather than inferred. */
let teacherClassConfigReadOk = false;
function loadTeacherClassConfig(){
  return (teacherClassConfigLatest = teacherReadClassConfig());
}
async function teacherReadClassConfig(){
  const req = ++teacherClassConfigReq;
  const writeSeq = teacherConfigWriteSeq, writesOpen = teacherConfigWritesOpen;
  let cfg, ok = false;
  try{
    await ensureDb();
    const doc = await db.collection('config').doc('class').get();
    cfg = doc.exists ? (doc.data()||{}) : {};
    ok = true;                      // a doc that doesn't exist yet still counts: we reached Firestore and it said so
  }catch(e){ cfg = {}; }
  if(!cfg.gameOverrides) cfg.gameOverrides = {};
  if(req !== teacherClassConfigReq) return teacherClassConfigLatest;   // a newer read is out — its answer, not this one
  /* One of this tab's own writes was open, or started, while this read was
     out, so it may hold the doc from BEFORE that write. Taken, it replaced
     the copy the write's optimistic change lives in, and the write then
     stamped its new configVersion on it — so the guard waved the next write
     through on a stale copy (a queued board move re-packed `pos` off a board
     missing the move before it). Wait for the writes, then read again. */
  if(ok && (writesOpen || teacherConfigWritesOpen || writeSeq !== teacherConfigWriteSeq)){
    await teacherConfigWritesSettled();
    return req === teacherClassConfigReq ? loadTeacherClassConfig() : teacherClassConfigLatest;
  }
  teacherClassConfig = cfg;
  teacherClassConfigLoaded = true;
  teacherClassConfigReadOk = ok;
  teacherConfigVersion = Number(cfg.configVersion) || 0;
  teacherConfigOwnVersions.clear();   // no write overlapped this read, so it holds them all
  return teacherClassConfig;
}

/* ── Stale writes to config/class fail loudly ───────────────────────
   Every writer in this file is read-modify-write: it works out a merge patch
   from `teacherClassConfig`, the copy this tab read when its view last
   loaded. Nothing listens to the doc, so that copy goes stale the moment
   another console writes it — a second tab, the laptop beside the projector
   machine, the other OS. Until now a stale write simply won: Firestore
   merged it without complaint, whatever the other session had done was
   gone, and nothing on either screen said so.

   The board is where that corrupts data rather than just losing a click. A
   move re-packs `pos` 1..N across a whole module from the board this tab
   holds, so a base one move out of date writes a run with a duplicate or a
   hole in it — and the board renders that without complaint too.

   So config/class carries `configVersion`, a counter every write through
   here bumps inside a transaction, and `teacherConfigVersion` is the one
   this tab read. Equal means nothing has changed since — write. Unequal
   means somebody else wrote, and what happens next is the caller's call:

     STRICT (no `base` given) — any other write at all is a reason to stop.
       For anything derived from more of the doc than it names: the board
       writers, Delete (which re-packs), Clear all.
     CELL-CHECKED (`base`: the values this write was worked out from, with
       `undefined` for "was absent") — the patch is compared against what is
       live now, cell by cell. Untouched cells mean the other session's edit
       was unrelated, so the write goes through; a cell that moved underneath
       us throws and the caller rolls back and says so.

   Both, not one: strict everywhere would reject hiding an activity here
   because a period was corrected there, and a false alarm every time two
   tabs are open is what teaches Jonathan to click through the one that
   matters. Cell-checked everywhere would let a board write computed from a
   stale board through, which is the bug this whole block exists for — so
   omitting `base` is the SAFE default, and a future writer that forgets one
   gets the strict treatment rather than none.

   Paths are dotted. Activity ids (`ca-<n>`) and Firestore uids contain no
   dots, which is what makes that spelling safe here. */
let teacherConfigVersion = 0;
// This tab's writes: how many have started, and how many are still out —
// loadTeacherClassConfig won't take a read that overlapped one.
let teacherConfigWriteSeq = 0, teacherConfigWritesOpen = 0, teacherConfigIdleWaiters = [];
// Versions this tab's own writes made that its version hasn't reached yet
// (the end of teacherWriteConfig). Every writer changes the copy before it
// writes, so the copy already holds each of them.
let teacherConfigOwnVersions = new Set();
function teacherConfigWritesSettled() {
  return teacherConfigWritesOpen ? new Promise(r => teacherConfigIdleWaiters.push(r)) : Promise.resolve();
}
function teacherConfigAt(obj, path) {
  let cur = obj;
  const parts = String(path).split('.');
  for (let i = 0; i < parts.length; i++) {
    if (cur === null || typeof cur !== 'object' || !Object.prototype.hasOwnProperty.call(cur, parts[i])) return undefined;
    cur = cur[parts[i]];
  }
  return cur;
}
/* config/class holds strings, numbers, booleans, arrays (the pin order) and
   maps — the board's {module,pos} pairs, a card's Who list (uid -> true). A
   map compares by its keys sorted: Firestore hands keys back sorted while
   this tab's copy keeps the order they were ticked in, and plain
   JSON.stringify called {u9,u1} and {u1,u9} different, so a Required click
   refused as "stale" over nothing. Arrays keep their order. `undefined` —
   the cell was absent — is its own case, so it can't equal another absent
   value by accident. */
function teacherConfigCanon(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(teacherConfigCanon).join(',') + ']';
  return '{' + Object.keys(v).filter(k => v[k] !== undefined).sort()
    .map(k => JSON.stringify(k) + ':' + teacherConfigCanon(v[k])).join(',') + '}';
}
function teacherConfigSame(a, b) {
  if (a === undefined || b === undefined) return a === b;
  return teacherConfigCanon(a) === teacherConfigCanon(b);
}
async function teacherWriteConfig(patch, base) {
  const dbh = await ensureDb();
  if (!dbh) throw new Error('Firestore is not available');
  const ref = dbh.collection('config').doc('class');
  let wrote = 0, diverged = false;
  teacherConfigWriteSeq++; teacherConfigWritesOpen++;
  try {
    await dbh.runTransaction(async t => {
      // Re-read inside the transaction on every attempt — Firestore may run
      // this function more than once, and the second run has to judge the
      // doc as it is then, not as the first run found it.
      const snap = await t.get(ref);
      const live = snap.exists ? (snap.data() || {}) : {};
      const liveV = Number(live.configVersion) || 0;
      diverged = liveV !== teacherConfigVersion;
      if (diverged) {
        // An empty `base` is strict too: "this write depends on nothing in the
        // doc" is never true of a writer here, so it reads as one that forgot.
        if (!base || !Object.keys(base).length) throw teacherStaleConfigError(null);
        const moved = Object.keys(base).filter(k => !teacherConfigSame(teacherConfigAt(live, k), base[k]));
        if (moved.length) throw teacherStaleConfigError(moved);
      }
      wrote = liveV + 1;
      t.set(ref, Object.assign({}, patch, { configVersion: wrote }), { merge: true });
    });
  } finally {
    if (--teacherConfigWritesOpen === 0) { const w = teacherConfigIdleWaiters; teacherConfigIdleWaiters = []; w.forEach(r => r()); }
  }
  /* The version moves on only through versions this tab wrote itself, in
     whatever order its writes come back. A diverged write landed on top of
     a version this copy may not hold. When the gap is this tab's own
     overlapping writes, the version catches up as each returns. When it is
     another console's, the version stops below it: stamping `wrote` there
     let a board move already on its way pass the check and re-pack `pos`
     from a board missing that change (duplicate #positions in a two-console
     simulation). The reload below then brings version and copy up together. */
  teacherConfigOwnVersions.add(wrote);
  while (teacherConfigOwnVersions.has(teacherConfigVersion + 1)) teacherConfigOwnVersions.delete(++teacherConfigVersion);
  if (teacherClassConfig) teacherClassConfig.configVersion = teacherConfigVersion;
  if (diverged && teacherConfigVersion < wrote) {
    /* The patch was safe, but this tab is still missing whatever the other
       session changed, and its version was left behind on purpose (above),
       so until this lands a strict write refuses rather than sail through
       on a copy that isn't current. Awaited, not fired and forgotten: the
       caller repaints as soon as we return, and it should repaint from the
       merged truth. */
    await loadTeacherClassConfig();
  }
}
function teacherStaleConfigError(paths) {
  const e = new Error('config/class moved underneath this tab'
    + (paths ? ', at: ' + paths.join(', ') : ' (strict writer — any concurrent write refuses)'));
  e.staleConfig = true;
  return e;
}
/* The one place a failed config write is reported. A stale rejection is a
   different event from a dropped connection and has to read like one:
   nothing was saved, the other session's newer copy is intact, and this
   page is about to repaint from it. Everything else keeps the caller's own
   wording — those messages name the thing that didn't save. */
function teacherConfigSaveFailed(e, msg, opts) {
  if (e && e.staleConfig) {
    /* `keepEditor` — the rename box. Repainting it would pull the server's
       (unchanged) title back over what was typed, which is the one failure
       this file has always refused to cause; the config is still refreshed
       underneath, so the next repaint is honest. */
    const keep = !!(opts && opts.keepEditor);
    console.warn('[guitar-class] stale write blocked — ' + e.message);
    alert('Nothing was saved.\n\n'
      + 'The class settings changed after this page loaded — another tab, or another computer. '
      + 'What you just clicked was worked out from the older copy, so saving it could have quietly undone that change.\n\n'
      + (keep
          ? 'What you typed is still in the box — have a look at what changed, then save it again.'
          : 'This page is loading the current settings now. Have a look, then make the change again.'));
    loadTeacherClassConfig().then(cfg => { if (cfg && !keep) renderTeacherBody(); });
    return;
  }
  alert(msg);
}
/* Manage and Games repaint after every per-student click. A table already on
   screen stays up while the config re-reads, and the scroll is put back after
   the swap: painting the one-line "Loading…" box first shrank the page, so the
   browser threw the teacher back to the top on every click (the board's fix,
   renderTeacherActivities). data-tview marks whose table it is, because both
   views share .tg-table. */
function renderTeacherGames(){
  const box=document.getElementById('t-grid-container');
  if(!box.querySelector('[data-tview="games"]')) box.innerHTML='<div class="t-loading">Loading game settings…</div>';
  loadTeacherClassConfig().then(cfg=>{
    if(teacherView!=='games') return;   // teacher switched views while the get was in flight — don't stomp the current view's DOM
    if(!cfg) return;   // superseded by a newer toggle — leave the newer render's DOM alone
    /* A failed read leaves cfg = {} (loadTeacherClassConfig's catch), which
       renders as all-defaults with nothing to say so — "nobody is paused",
       "games on for everyone" — and this is the screen classroom decisions
       get made from. renderTeacherActivities already refuses to draw the
       board on a bad read; do the same here rather than show a confident
       wrong answer. */
    if(!teacherClassConfigReadOk){
      box.innerHTML='<div class="t-loading">Could not read the class settings — check your connection and reload. Nothing below would be accurate, so it isn\'t shown.</div>';
      return;
    }
    const classOn = cfg.gamesEnabled!==false;
    const ov = cfg.gameOverrides||{};
    const classCtl=`
      <div class="tg-class">
        <div class="tg-class-lbl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="6.5" width="19" height="11" rx="5.5"/><path d="M7 9.5v3M5.5 11h3"/><circle cx="15.7" cy="10.7" r="0.95" fill="currentColor" stroke="none"/><circle cx="17.6" cy="12.6" r="0.95" fill="currentColor" stroke="none"/></svg> Games for the whole class</div>
        <div class="tg-seg">
          <button class="tg-seg-btn ${classOn?'on':''}" onclick="teacherSetClassGames(true)">On</button>
          <button class="tg-seg-btn ${!classOn?'on':''}" onclick="teacherSetClassGames(false)">Off</button>
        </div>
      </div>
      <div class="tg-note">“Off” hides the Games button for everyone. Use the list below to override individual students (“Default” follows the class switch). Changes take effect the next time a student loads the site.</div>`;
    if(allStudents.length===0){ box.innerHTML=classCtl+'<div class="t-loading">No students yet — they’ll appear here once they sign in.</div>'; return; }
    const sorted=[...allStudents].sort((a,b)=>(a.name||a.email||a.uid).localeCompare(b.name||b.email||b.uid));
    const rows=sorted.map(stu=>{
      const name=stu.name||stu.email||stu.uid.slice(0,8)+'…';
      const v=ov[stu.uid];                                   // true / false / undefined
      const state=v===true?'on':v===false?'off':'default';
      const effective=v===true?true:v===false?false:classOn;
      // data-uid + the delegated listener in showTeacherApp, same as the
      // Students view — a Firestore uid is never spliced into an inline JS
      // string literal.
      const seg=(s,label)=>`<button class="tg-seg-btn ${state===s?'on':''}" data-set-games data-uid="${escAttr(stu.uid)}" data-state="${s}">${label}</button>`;
      return `<tr><td class="tg-name" title="${escAttr(name)}">${escHtml(name)}</td>`+
        `<td><div class="tg-seg">${seg('default','Default')}${seg('on','On')}${seg('off','Off')}</div></td>`+
        `<td class="tg-eff">${effective?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="6.5" width="19" height="11" rx="5.5"/><path d="M7 9.5v3M5.5 11h3"/><circle cx="15.7" cy="10.7" r="0.95" fill="currentColor" stroke="none"/><circle cx="17.6" cy="12.6" r="0.95" fill="currentColor" stroke="none"/></svg> available':'— hidden'}</td></tr>`;
    }).join('');
    // Read at the swap, not before the config read: the teacher may have scrolled since.
    const keepY=box.querySelector('[data-tview="games"]') ? window.scrollY : null;
    box.innerHTML=classCtl+
      `<div class="tg-grid-wrap" data-tview="games"><table class="tg-table"><thead><tr><th>Student</th><th>Games access</th><th>Right now</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    if(keepY!==null) window.scrollTo({top:keepY});
  });
}
async function teacherSetClassGames(enabled){
  const prev = teacherClassConfig.gamesEnabled;
  teacherClassConfig.gamesEnabled=enabled;
  try{
    await teacherWriteConfig({gamesEnabled:enabled}, {gamesEnabled: prev});
  }catch(e){
    teacherClassConfig.gamesEnabled = prev;
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='games') renderTeacherGames();   // skip if the view changed while the save was in flight
}
/* ── Manage view: pause + archive ───────────────────────────────────────
   Both live in config/class next to gameOverrides, as uid → true maps.
   That matters for two reasons: the teacher can already write config/class
   under the existing Firestore rules (student docs are read-only to the
   teacher), and neither action touches a student's progress doc — so
   nothing here can destroy work, and both are reversible.

   Pause is enforced in app.js at sign-in (see loadClassConfig). It is a
   classroom-management tool, not a security boundary: a student who opens
   DevTools can bypass a client-side check. Anything that must be
   *enforced* belongs in the Firestore rules. */
/* Manage table order, persisted per device like the period filter:
   group 'period' (each class together, untagged last) or 'all' (one list),
   and name 'first' or 'last'. In 'last' mode the name column reads
   "Last, First" so the column you scan matches the order it is in. */
let teacherManageGroup=(function(){ let v=null; try{ v=localStorage.getItem('gc-teacher-manage-group'); }catch(e){} return v==='all'?'all':'period'; })();
let teacherManageNameBy=(function(){ let v=null; try{ v=localStorage.getItem('gc-teacher-manage-name'); }catch(e){} return v==='last'?'last':'first'; })();
function teacherSetManageSort(kind, value){
  if(kind==='group' && (value==='period'||value==='all')){
    teacherManageGroup=value;
    try{ localStorage.setItem('gc-teacher-manage-group', value); }catch(e){}
  }else if(kind==='name' && (value==='first'||value==='last')){
    teacherManageNameBy=value;
    try{ localStorage.setItem('gc-teacher-manage-name', value); }catch(e){}
  }else return;
  if(teacherView==='manage') renderTeacherManage();
}
/* A name with one word, or an email/uid standing in for one, has no last
   name to split off — it sorts and displays as it is. */
function teacherNameParts(s){
  const raw=(s.name||'').trim();
  if(!raw) return null;
  const words=raw.split(/\s+/);
  if(words.length<2) return null;
  return {first:words.slice(0,-1).join(' '), last:words[words.length-1]};
}
// Keeps its table on screen across a re-read — see renderTeacherGames.
function renderTeacherManage(){
  const box=document.getElementById('t-grid-container');
  if(!box.querySelector('[data-tview="manage"]')) box.innerHTML='<div class="t-loading">Loading student settings…</div>';
  loadTeacherClassConfig().then(cfg=>{
    if(teacherView!=='manage') return;   // switched views mid-flight — don't stomp the new view's DOM
    if(!cfg) return;                     // superseded by a newer toggle
    /* A failed read leaves cfg = {} (loadTeacherClassConfig's catch), which
       renders as all-defaults with nothing to say so — "nobody is paused",
       "games on for everyone" — and this is the screen classroom decisions
       get made from. renderTeacherActivities already refuses to draw the
       board on a bad read; do the same here rather than show a confident
       wrong answer. */
    if(!teacherClassConfigReadOk){
      box.innerHTML='<div class="t-loading">Could not read the class settings — check your connection and reload. Nothing below would be accurate, so it isn\'t shown.</div>';
      return;
    }
    teacherApplyRosterFilter();
    const paused=cfg.paused||{}, arch=cfg.archived||{};
    const archCount=allStudentsRaw.filter(s=>arch[s.uid]).length;
    const pausedCount=allStudentsRaw.filter(s=>paused[s.uid]).length;
    const head=`
      <div class="tg-class">
        <div class="tg-class-lbl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg> Student access</div>
        <div class="tg-seg">
          <button class="tg-seg-btn ${teacherShowArchived?'on':''}" data-toggle-archived>${teacherShowArchived?'Hiding nothing':'Show archived'}${archCount?` (${archCount})`:''}</button>
        </div>
      </div>
      <div class="tg-class">
        <div class="tg-class-lbl">Sort</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
        <div class="tg-seg">
          <button class="tg-seg-btn ${teacherManageGroup==='period'?'on':''}" data-manage-sort="group" data-value="period">By period</button>
          <button class="tg-seg-btn ${teacherManageGroup==='all'?'on':''}" data-manage-sort="group" data-value="all">Everyone</button>
        </div>
        <div class="tg-seg">
          <button class="tg-seg-btn ${teacherManageNameBy==='first'?'on':''}" data-manage-sort="name" data-value="first">First name</button>
          <button class="tg-seg-btn ${teacherManageNameBy==='last'?'on':''}" data-manage-sort="name" data-value="last">Last name</button>
        </div>
        </div>
      </div>
      <div class="tg-class">
        <div class="tg-class-lbl">Open everyone through</div>
        <div class="tg-seg">
          <select id="t-open-all-select" style="max-width:220px">${MODULE_MANIFEST.filter(m=>m.num>=2 && m.num<=12).map(m=>`<option value="${m.num}"${m.num===Math.max(3,CLASS_OPEN_THROUGH+1)?' selected':''}>Module ${m.num} — ${escHtml(m.name)}</option>`).join('')}</select>
          <button class="tg-seg-btn" data-open-all-through>Open for all</button>
        </div>
      </div>
      <div class="tg-note"><strong>Paused</strong> students can sign in but see a "your access is paused" message instead of the site — use it for a temporary hold, then un-pause. <strong>Archived</strong> students are hidden from every dashboard view; their work is kept and comes back if you restore them. Pausing takes effect the next time that student loads the site. <strong>Period</strong> is whatever the student picked when they first signed in — set 4, 7, or CAS here to correct a wrong tap, or Auto to go back to their own answer. <strong>Open through</strong> lets one student skip ahead: every module up to the one you pick opens (all sets in the modules before it, Set 1 of the one you pick), without marking anything done. Auto removes it. Modules they've already worked in stay open either way.${CLASS_OPEN_THROUGH>1?` <strong>Class-wide:</strong> every student is already open through Module ${CLASS_OPEN_THROUGH} and starts there (CLASS_OPEN_THROUGH in config-main.js), so Auto means Module ${CLASS_OPEN_THROUGH}.`:''} This list always shows everyone, whatever the period filter above is set to.</div>`;
    if(allStudentsRaw.length===0){ box.innerHTML=head+'<div class="t-loading">No students yet — they’ll appear here once they sign in.</div>'; return; }
    const nameOf=s=>(s.name||s.email||s.uid);
    const byLast=teacherManageNameBy==='last';
    const shownName=s=>{ const p=byLast&&teacherNameParts(s); return p?`${p.last}, ${p.first}`:(s.name||s.email||s.uid.slice(0,8)+'…'); };
    const nameKey=s=>{ const p=byLast&&teacherNameParts(s); return p?p.last+' '+p.first:nameOf(s); };
    const byName=(a,b)=>nameKey(a).localeCompare(nameKey(b), undefined, {sensitivity:'base'});
    // "By period": period first, then name — the table you scan when a
    // student says "I'm in 4th, not 7th", so each class groups together.
    // Ranked numerically rather than by localeCompare: untagged students sort
    // LAST, and a sentinel string wouldn't get that (ICU collation puts
    // punctuation ahead of digits, so '~' landed them first).
    const grouped=teacherManageGroup==='period';
    // Exact values only, then the period text: a typed-in junk period ('04', 'constructor') is its own group after CAS, never NaN or interleaved.
    const perOf=s=>String(teacherStudentPeriod(s)||'');
    const perRank=s=>{ const p=perOf(s); return p==='4'?4 : p==='7'?7 : p==='CAS'?8 : !p?Infinity : 9; };
    const perCmp=(a,b)=>(perRank(a)-perRank(b)) || (perOf(a)<perOf(b)?-1:perOf(a)>perOf(b)?1:0);
    const list=(teacherShowArchived?allStudentsRaw:allStudentsRaw.filter(s=>!arch[s.uid]))
      .sort((a,b)=>(grouped?perCmp(a,b):0)||byName(a,b));
    if(list.length===0){ box.innerHTML=head+'<div class="t-loading">Every student is archived. Use “Show archived” to bring them back.</div>'; return; }
    const perLabel=p=>!p?'No period':p==='CAS'?'CAS':'Period '+p;
    // Object.create(null) + String(): a period the student typed as 'constructor' would read an inherited key, and the number 4 a group apart from '4'.
    const perCount=Object.create(null); list.forEach(s=>{ const k=String(teacherStudentPeriod(s)||''); perCount[k]=(perCount[k]||0)+1; });
    let lastGroup=null;
    const rows=list.map(stu=>{
      const name=shownName(stu);
      // A heading row each time the period changes — keyed on the
      // EFFECTIVE period, so correcting one moves the student under it.
      const g=String(teacherStudentPeriod(stu)||'');
      // Escaped: g is the student's own answer when no override is set, and
      // firestore.rules doesn't check what a student writes to progress/{uid}.
      const groupRow=(grouped && g!==lastGroup)?`<tr class="tg-group"><th colspan="6">${escHtml(perLabel(g))} <span>(${perCount[g]})</span></th></tr>`:'';
      lastGroup=g;
      const isPaused=!!paused[stu.uid], isArch=!!arch[stu.uid];
      // data-uid + the delegated listener in showTeacherApp — a Firestore
      // uid is never spliced into an inline JS string literal.
      const pauseBtns=
        `<button class="tg-seg-btn ${!isPaused?'on':''}" data-set-paused data-uid="${escAttr(stu.uid)}" data-state="active">Active</button>`+
        `<button class="tg-seg-btn ${isPaused?'on':''}" data-set-paused data-uid="${escAttr(stu.uid)}" data-state="paused">Paused</button>`;
      const archBtn=`<button class="tg-seg-btn ${isArch?'on':''}" data-set-archived data-uid="${escAttr(stu.uid)}" data-state="${isArch?'restore':'archive'}">${isArch?'Restore':'Archive'}</button>`;
      /* Period: 4 · 7 · CAS · Auto. "Auto" clears the override and falls
         back to whatever the student answered for themselves — which is
         why the highlighted button is the EFFECTIVE period either way, and
         the "set" marker beside it is what tells you the value is yours
         rather than theirs. Same data-uid + delegated listener as its
         neighbours. */
      const per=teacherStudentPeriod(stu), perSet=teacherPeriodIsOverride(stu);
      const perBtn=(v,label)=>`<button class="tg-seg-btn ${per===v?'on':''}" data-set-period data-uid="${escAttr(stu.uid)}" data-value="${v}">${label}</button>`;
      const periodCell=`<div class="tg-seg">${perBtn('4','4')}${perBtn('7','7')}${perBtn('CAS','CAS')}`+
        `<button class="tg-seg-btn ${perSet?'':'on'}" data-set-period data-uid="${escAttr(stu.uid)}" data-value="auto" title="Use the student's own answer">Auto</button></div>`+
        (perSet?`<span class="tg-set-mark" title="You set this period — the student answered ${escAttr(stu.period||'nothing')}">set</span>`:'');
      /* Open through: Auto · Module 2 … Module 12. Module 1 is always open
         and Module 13 sits outside the chain, so neither is offered. Same
         data-uid + delegated listener as its neighbours, on 'change'. */
      const openN=teacherStudentOpenThrough(stu);
      const openOpts=MODULE_MANIFEST.filter(m=>m.num>=2 && m.num<=12)
        .map(m=>`<option value="${m.num}"${openN===m.num?' selected':''}>Module ${m.num} — ${escHtml(m.name)}</option>`).join('');
      const openCell=`<select class="tg-open-through" data-set-open-through data-uid="${escAttr(stu.uid)}" style="max-width:220px"><option value="auto"${openN?'':' selected'}>Auto${CLASS_OPEN_THROUGH>1?' (Module '+CLASS_OPEN_THROUGH+')':''}</option>${openOpts}</select>`;
      const archIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="3" y="6" width="18" height="4" rx="1"/><path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9"/><path d="M10 14h4"/></svg>';
      const pauseIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
      const status=isArch?`${archIco} archived`:isPaused?`${pauseIco} paused`:'&#x2713; active';
      return groupRow+`<tr${isArch?' style="opacity:.55"':''}><td class="tg-name tg-name-wide" title="${escAttr(name)}">${escHtml(name)}</td>`+
        `<td class="tg-period">${periodCell}</td>`+
        `<td>${openCell}</td>`+
        `<td><div class="tg-seg">${pauseBtns}</div></td>`+
        `<td><div class="tg-seg">${archBtn}</div></td>`+
        `<td class="tg-eff">${status}</td></tr>`;
    }).join('');
    const summary=(pausedCount||archCount)
      ? `<div class="tg-note">${pausedCount} paused · ${archCount} archived</div>` : '';
    const keepY=box.querySelector('[data-tview="manage"]') ? window.scrollY : null;
    box.innerHTML=head+
      `<div class="tg-grid-wrap" data-tview="manage"><table class="tg-table"><thead><tr><th>Student</th><th>Period</th><th>Open through</th><th>Access</th><th>Roster</th><th>Right now</th></tr></thead><tbody>${rows}</tbody></table></div>`+summary;
    if(keepY!==null) window.scrollTo({top:keepY});
  });
}
async function teacherSetStudentPaused(uid, state){
  const on = state==='paused';
  if(!teacherClassConfig.paused) teacherClassConfig.paused={};
  const had = Object.prototype.hasOwnProperty.call(teacherClassConfig.paused, uid);
  const prev = teacherClassConfig.paused[uid];
  if(on) teacherClassConfig.paused[uid]=true; else delete teacherClassConfig.paused[uid];
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    // Clear the flag rather than writing false, so config/class doesn't
    // accumulate a row per student who was ever paused.
    const patch = on ? {paused:{[uid]:true}} : {paused:{[uid]:fv.delete()}};
    await teacherWriteConfig(patch, {['paused.'+uid]: had?prev:undefined});
  }catch(e){
    if(had) teacherClassConfig.paused[uid]=prev; else delete teacherClassConfig.paused[uid];
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='manage') renderTeacherManage();
}
async function teacherSetStudentArchived(uid, state){
  const on = state==='archive';
  if(!teacherClassConfig.archived) teacherClassConfig.archived={};
  const had = Object.prototype.hasOwnProperty.call(teacherClassConfig.archived, uid);
  const prev = teacherClassConfig.archived[uid];
  if(on) teacherClassConfig.archived[uid]=true; else delete teacherClassConfig.archived[uid];
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const patch = on ? {archived:{[uid]:true}} : {archived:{[uid]:fv.delete()}};
    await teacherWriteConfig(patch, {['archived.'+uid]: had?prev:undefined});
  }catch(e){
    if(had) teacherClassConfig.archived[uid]=prev; else delete teacherClassConfig.archived[uid];
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  teacherApplyRosterFilter();
  if(teacherView==='manage') renderTeacherManage();
  else renderTeacherBody();   // roster changed under whichever view is showing
}
/* Structurally identical to teacherSetStudentArchived above — optimistic
   local mutation, one merge write to config/class, roll back and say so on
   a throw. 'auto' clears the key with FieldValue.delete() rather than
   writing '' or null, so config/class doesn't accumulate a dead row for
   every student whose period was ever corrected (and so the read side's
   `override || own answer` fallback works by absence, not by a falsy
   sentinel it would also have to know about). */
async function teacherSetStudentPeriod(uid, value){
  const clear = value==='auto';
  if(!clear && value!=='4' && value!=='7' && value!=='CAS') return;
  if(!teacherClassConfig.periodOverrides) teacherClassConfig.periodOverrides={};
  const had = Object.prototype.hasOwnProperty.call(teacherClassConfig.periodOverrides, uid);
  const prev = teacherClassConfig.periodOverrides[uid];
  if(clear) delete teacherClassConfig.periodOverrides[uid];
  else teacherClassConfig.periodOverrides[uid]=value;
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const patch = clear ? {periodOverrides:{[uid]:fv.delete()}} : {periodOverrides:{[uid]:value}};
    await teacherWriteConfig(patch, {['periodOverrides.'+uid]: had?prev:undefined});
  }catch(e){
    if(had) teacherClassConfig.periodOverrides[uid]=prev; else delete teacherClassConfig.periodOverrides[uid];
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  teacherApplyRosterFilter();
  if(teacherView==='manage') renderTeacherManage();
  else renderTeacherBody();   // roster changed under whichever view is showing
}
/* Copy of teacherSetStudentPeriod above, for config/class.moduleOpenThrough.
   'auto' deletes the key (FieldValue.delete(), never null or ''), so the
   student side reads "no override" by absence. Never touches progress/{uid}
   — the teacher can't write it, and the override marks nothing done. */
async function teacherSetStudentOpenThrough(uid, value){
  const clear = value==='auto';
  const n = Number(value);
  if(!clear && !(Number.isInteger(n) && n>=2 && n<=12)) return;
  if(!teacherClassConfig.moduleOpenThrough) teacherClassConfig.moduleOpenThrough={};
  const had = Object.prototype.hasOwnProperty.call(teacherClassConfig.moduleOpenThrough, uid);
  const prev = teacherClassConfig.moduleOpenThrough[uid];
  if(clear) delete teacherClassConfig.moduleOpenThrough[uid];
  else teacherClassConfig.moduleOpenThrough[uid]=n;
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const patch = clear ? {moduleOpenThrough:{[uid]:fv.delete()}} : {moduleOpenThrough:{[uid]:n}};
    await teacherWriteConfig(patch, {['moduleOpenThrough.'+uid]: had?prev:undefined});
  }catch(e){
    if(had) teacherClassConfig.moduleOpenThrough[uid]=prev; else delete teacherClassConfig.moduleOpenThrough[uid];
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='manage') renderTeacherManage();
  else renderTeacherBody();
}
/* "Open everyone through Module N" — the per-student moduleOpenThrough write
   applied to every non-archived student in one patch. A student already
   opened further keeps their higher value (this never lowers anyone).
   Strict write (no base): it is derived from the whole roster. */
async function teacherOpenAllThrough(){
  const sel=document.getElementById('t-open-all-select');
  const n=Number(sel&&sel.value);
  if(!(Number.isInteger(n) && n>=2 && n<=12)) return;
  const arch=(teacherClassConfig&&teacherClassConfig.archived)||{};
  const targets=allStudentsRaw.filter(s=>!arch[s.uid] && teacherStudentOpenThrough(s)<n);
  if(!targets.length){ alert('Everyone is already open through Module '+n+' or further.'); return; }
  // n===2 would read "Modules 1–1": name the one earlier module on its own.
  const earlier = n===2 ? 'Module 1' : 'Modules 1–'+(n-1);
  if(!confirm('Open every set of '+earlier+' and Module '+n+' from Set 1, for '+targets.length+' student'+(targets.length===1?'':'s')+'? Students who sign in for the first time later are not included. Nothing is marked done; you can set any student back to Auto.')) return;
  const prev=Object.assign({}, teacherClassConfig.moduleOpenThrough||{});
  const map={}; targets.forEach(s=>{ map[s.uid]=n; });
  teacherClassConfig.moduleOpenThrough=Object.assign({}, prev, map);
  try{
    await ensureDb();
    await teacherWriteConfig({moduleOpenThrough:map});
  }catch(e){
    teacherClassConfig.moduleOpenThrough=prev;
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='manage') renderTeacherManage();
  else renderTeacherBody();
}
function teacherToggleShowArchived(){
  teacherShowArchived=!teacherShowArchived;
  teacherApplyRosterFilter();
  if(teacherView==='manage') renderTeacherManage();
}
async function teacherSetStudentGames(uid, state){
  if(!teacherClassConfig.gameOverrides) teacherClassConfig.gameOverrides={};
  const had = Object.prototype.hasOwnProperty.call(teacherClassConfig.gameOverrides, uid);
  const prev = teacherClassConfig.gameOverrides[uid];
  if(state==='default') delete teacherClassConfig.gameOverrides[uid];
  else teacherClassConfig.gameOverrides[uid] = state==='on';
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const patch = state==='default'
      ? {gameOverrides:{[uid]:fv.delete()}}
      : {gameOverrides:{[uid]:state==='on'}};
    await teacherWriteConfig(patch, {['gameOverrides.'+uid]: had?prev:undefined});
  }catch(e){
    if(had) teacherClassConfig.gameOverrides[uid]=prev; else delete teacherClassConfig.gameOverrides[uid];
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='games') renderTeacherGames();   // skip if the view changed while the save was in flight
}

/* PR (BPM) slots store a capped {value,date} history now; older saved docs
   still have a bare scalar for these keys — normalize both to an array.
   Shared by renderTeacherResponses (per-set, every student) and
   renderTeacherStudentDetail (per-student, every set) so both read PR
   trends identically. Non-object array entries are dropped: the student
   writes this doc, and a null entry would throw on `.value`. */
function prEntries(raw){
  if(Array.isArray(raw)) return raw.filter(e=>e&&typeof e==='object');
  if(raw!=null && String(raw).trim()!=='') return [{value:raw, date:null}];
  return [];
}
function prNum(v){ const m=String(v).match(/\d{2,3}/); return m?m[0]:null; }
/* One written response, for the Responses view and a student's own page —
   a PR (BPM) slot with its last three values, or a text answer; '' when
   the student wrote nothing there. One copy, so the two screens can't drift. */
function teacherResponseItemHtml(stu, sl){
  if(sl.isPR){
    const entries=prEntries(stu.responses&&stu.responses[sl.key]);
    if(!entries.length) return '';
    const latest=String(entries[entries.length-1].value||'').trim();
    if(!latest) return '';
    const n=prNum(latest);
    const trendHtml = entries.length>1
      ? `<span class="tr-lbl" style="opacity:.7">${entries.slice(-3).map(e=>escHtml(prNum(e.value)||e.value)).join(' &#x2192; ')}</span>` : '';
    return `<div class="tr-item"><span class="tr-pr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none"/></svg> ${escHtml(sl.label)}</span><span class="tr-prval">${n?escHtml(n)+' BPM':escHtml(latest)}</span>${trendHtml}</div>`;
  }
  const rv=stu.responses&&stu.responses[sl.key]; const val=String(rv==null?'':rv).trim();
  if(!val) return '';
  return `<div class="tr-item"><span class="tr-lbl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg> ${escHtml(sl.label)}</span><span class="tr-txt">${escHtml(val)}</span></div>`;
}

/* Enumerate every short free-text response slot in a set, in display order,
   rebuilding the exact keys the student app saves under
   (`${set}-${station}[-sec{n}]-${stepIndex}`). Tags PR (BPM) prompts. */
// storageSections() / isRenderableSection() are defined in app.js, loaded
// before this file on every page that includes teacher.js. This view walks
// EVERY storage section (all but tuning-warmup — the one hide baked into the
// keys, see storageSections' comment), not just the ones the ladder renders:
// it is a historical audit of what a student actually wrote, and the
// Checkpoint / Wrap-Up / Practice Routine prompts students answered in
// Modules 1–2 are still real responses after those sections were retired
// from the ladder (Today-first, Phase 3). A slot in a section the ladder no
// longer shows — or a step that has since gone `hidden` — is tagged
// `retired` and its label says so, so Jonathan can tell an old answer from a
// prompt students can still reach. gi comes from the pair, never from the
// position in a filtered list, so the rebuilt key matches what was saved.
function setShortResponses(w){
  const out=[];
  ['b','c'].forEach(stationId=>{
    const stn=w.stations&&w.stations[stationId]; if(!stn) return;
    const pushStep=(st,ns,i,retired)=>{
      if(!st.response||st.response.type!=='short') return;
      const prompt=st.response.prompt||'';
      const isPR=/personal record/i.test(prompt)||/\bBPM\b/i.test(prompt);
      let label;
      // The "Challenge N — Title" prefix lives in step.label now (text opens
      // straight into directions per the current content-authoring
      // convention) — match against label, not text, or this never fires.
      const chal=(st.label||'').match(/Challenge\s*\d+\s*[—–-]\s*([^:(]+)/);
      const ph=st.response.placeholder||'';
      if(isPR) label=chal?('PR — '+chal[1].trim()):'Personal record (BPM)';
      // "Station Wrap-Up" split into a mid-set "Checkpoint" and an end-of-set
      // "Wrap-Up" when the B/C stations merged into one ladder — match both, or
      // 32 of these slots silently fall through to the generic label below.
      else if(/wrap-?up|checkpoint|reflect/i.test(st.text||'')) label='Wrap-up reflection';
      else if(prompt) label=prompt.replace(/\s+/g,' ').slice(0,70);
      else if(ph && !/^e\.g\./i.test(ph)) label=ph.replace(/\s+/g,' ').slice(0,70); // placeholder is the question, not an example
      else label=chal?chal[1].trim():'Written response';
      if(retired) label+=' (retired)';
      out.push({key:`${w.id}-${ns}-${i}`, label, isPR, retired:!!retired});
    };
    if(stn.sections) storageSections(stn,w.moduleNum).forEach(({sec,gi})=>{
      const secRetired=!isRenderableSection(sec,w.moduleNum);
      /* A step can be unreachable even when its SECTION still renders: with
         TAKE_TO_SONG_ENABLED on, a take-to-song section in a module with a
         Journey layer renders the link card INSTEAD of its steps, so
         isRenderableSection() is true while visibleSteps() is empty (off, as
         it is since 2026-10-18, both say no and the whole section is tagged
         retired). Tag off the steps the ladder actually shows, or those
         slots read as live and Jonathan can't tell "nobody has done this
         yet" from "this prompt left the course". */
      const live=new Set(visibleSteps(sec,w.moduleNum).map(p=>p.idx));
      (sec.steps||[]).forEach((st,i)=>pushStep(st,`${stationId}-sec${gi}`,i,secRetired||st.hidden===true||!live.has(i)));
    });
    else if(stn.steps) stn.steps.forEach((st,i)=>pushStep(st,stationId,i,st.hidden===true));
  });
  return out;
}
function renderTeacherResponses(){
  const w=SETS.find(x=>x.id===teacherSetId);
  const box=document.getElementById('t-grid-container');
  if(!w){ box.innerHTML='<div class="t-loading">Pick a set.</div>'; return; }
  if(allStudents.length===0){ box.innerHTML='<div class="t-loading">No student data yet — students need to sign in and write a response first.</div>'; return; }
  const slots=setShortResponses(w);
  if(slots.length===0){ box.innerHTML='<div class="t-loading">This set has no written-response prompts.</div>'; return; }
  const sorted=[...allStudents].sort((a,b)=>(a.name||a.email||a.uid).localeCompare(b.name||b.email||b.uid));
  let withAny=0;
  const cards=sorted.map(stu=>{
    const items=slots.map(sl=>teacherResponseItemHtml(stu, sl)).filter(Boolean).join('');
    if(!items) return '';
    withAny++;
    const name=stu.name||stu.email||stu.uid.slice(0,8)+'…';
    return `<div class="tr-card"><div class="tr-name">${escHtml(name)}</div>${items}</div>`;
  }).filter(Boolean).join('');
  box.innerHTML = withAny
    ? `<div class="tr-meta">${withAny} of ${allStudents.length} students have written something for ${escHtml(w.label)} · sorted by name</div><div class="tr-list">${cards}</div>`
    : `<div class="t-loading">No one has written a response for ${escHtml(w.label)} yet.</div>`;
}

/* ── Reports view — student-filed issue reports (read-only) ──────────────
   issueReports (app.js submitIssueReport) is write-only from the student
   side — firestore.rules grants the teacher a read, but until now nothing
   read it back, so a filed report was only visible in the Firebase console.
   One Firestore read per view-open; not cached, since nothing else here is. */
async function renderTeacherReports(){
  const box=document.getElementById('t-grid-container');
  box.innerHTML='<div class="t-loading">Loading reports…</div>';
  let snap;
  try{
    await ensureDb();
    snap=await db.collection('issueReports').orderBy('createdAt','desc').limit(50).get();
  } catch(e){
    // Same stale-view guard as the success path below — without it a failing
    // read paints this error over whichever view the teacher switched to.
    if(teacherView==='reports') box.innerHTML='<div class="t-loading">Could not load reports. Check your Firebase security rules.</div>';
    return;
  }
  if(teacherView!=='reports') return;   // teacher switched views while the read was in flight
  /* On screen now, so they're seen: remember the newest one's createdAt and
     clear the badge (see teacherRefreshReportsBadge). Bumping the request
     counter drops a count that was already in flight from before. */
  teacherReportsBadgeReq++;
  if(!snap.empty) teacherMarkReportsSeen(snap.docs[0].data().createdAt);
  teacherPaintReportsBadge(0);
  if(snap.empty){ box.innerHTML='<div class="t-loading">No issue reports yet.</div>'; return; }
  const rows=snap.docs.map(doc=>{
    const d=doc.data();
    const when=(d.createdAt&&d.createdAt.toDate) ? d.createdAt.toDate().toLocaleString() : '—';
    const who=d.name||d.email||d.uid||'—';
    return `<tr><td class="nc" title="${escAttr(who)}">${escHtml(who)}</td><td>${escHtml(when)}</td><td>${escHtml(d.location||'')}</td><td>${escHtml(d.message||'')}</td></tr>`;
  }).join('');
  box.innerHTML=`<div class="t-grid-wrap"><table><thead><tr><th class="nc">Student</th><th>When</th><th>Where</th><th>Message</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

/* ── Mic recordings view ────────────────────────────────────────────────
   Real classroom audio for tuning the mic listening (coach.js micRec*).
   Off until switched on here. While on, a student starting a Listening
   Coach check or a Note Runner round is asked ONCE per device "Save this
   take as a recording to help your teacher make this feature better?" —
   only a "Yes, save it" device records, with a red "Recording this take
   for your teacher" label showing the whole time. It stops asking once
   `max` takes are saved (micTakesMeta/count).

   Each take is micTakes/<uid>-<coach|nr|pw>: the metadata on the doc, the
   audio (24 kHz 16-bit mono, at most 30 s) in chunks/{i}. Download WAV
   puts the chunks back together into a .wav right here in the browser;
   Download data is the doc as JSON (what was expected and when, what the
   mic heard, the verdicts, the device). Needs the micTakes rules pasted
   into the Firebase console — see firestore.rules. */
let teacherMicTakes = [];
/* A take's saved time as a Date, or null. Students write these docs and the
   micTakes rule checks only the id and uid, so savedAt can be a plain map
   whose toDate / toMillis is not a function — calling it would throw and
   leave the whole view on "Loading…". */
function micTakeDate(d){
  const t = d && d.savedAt;
  return t && typeof t.toDate === 'function' ? t.toDate() : null;
}
/* The take's expected notes: an array of objects, whatever was written
   (a non-array, or a null entry, threw on .filter / e.verdict). */
function micTakeExpected(d){
  return Array.isArray(d && d.expected) ? d.expected.filter(e => e && typeof e === 'object') : [];
}
async function renderTeacherMic(){
  const box=document.getElementById('t-grid-container');
  box.innerHTML='<div class="t-loading">Loading mic recordings…</div>';
  const cfg = await loadTeacherClassConfig();
  if(teacherView!=='mic' || !cfg) return;
  if(!teacherClassConfigReadOk){
    box.innerHTML='<div class="t-loading">Could not read the class settings — check your connection and reload.</div>';
    return;
  }
  let count = 0, takes = [], readErr = '';
  try{
    await ensureDb();
    const c = await db.collection('micTakesMeta').doc('count').get();
    count = c.exists ? (Number(c.data().n) || 0) : 0;
    const snap = await db.collection('micTakes').get();
    takes = snap.docs.map(d => Object.assign({ id: d.id }, d.data()));
    takes.sort((a,b) => ((micTakeDate(b) || 0) - (micTakeDate(a) || 0)));
  }catch(e){
    readErr = 'Could not load the recordings. If you have not yet pasted the new firestore.rules into the Firebase console (Firestore Database → Rules → Publish), do that first.';
  }
  if(teacherView!=='mic') return;
  teacherMicTakes = takes;
  const ms = cfg.micSampling || {};
  const on = ms.on === true;
  const max = Number(ms.max) > 0 ? Number(ms.max) : 40;
  const ctl = `
    <div class="tg-class">
      <div class="tg-class-lbl">&#x1F399;&#xFE0F; Collect mic recordings</div>
      <div class="tg-seg">
        <button class="tg-seg-btn ${on?'on':''}" onclick="teacherSetMicSampling(true)">On</button>
        <button class="tg-seg-btn ${!on?'on':''}" onclick="teacherSetMicSampling(false)">Off</button>
      </div>
    </div>
    <div class="tg-note">
      Stop after <input type="number" id="t-mic-max" min="1" max="500" value="${max}" style="width:5em"> takes
      <button class="tg-seg-btn" onclick="teacherSetMicSampling(${on})">Save</button>
      · Collected so far: <b>${count}</b>
      <button class="tg-seg-btn" onclick="teacherResetMicCount()">Reset counter</button>
    </div>
    <div class="tg-note">When this is on, each student is asked once per device before a Listening Coach check, a Note Runner round or a Power Chord Switch game. Only students who say “Yes, save it” are recorded, with a red label on screen while it records. Each student keeps one take per game; a newer take replaces it. Students load the setting when they open the site.</div>`;
  if(readErr){ box.innerHTML = ctl + `<div class="t-loading">${escHtml(readErr)}</div>`; return; }
  if(!takes.length){ box.innerHTML = ctl + '<div class="t-loading">No recordings yet.</div>'; return; }
  const rows = takes.map((d, i) => {
    const saved = micTakeDate(d), when = saved ? saved.toLocaleString() : '—';
    const game = d.mode === 'nr' ? 'Note Runner' + (d.level != null ? ' · level ' + (Number(d.level) + 1) : '')
               : d.mode === 'pw' ? 'Power Chord Switch' + (d.progression ? ' · ' + d.progression : '')
                                 : 'Listening Coach' + (d.coachMode ? ' · ' + d.coachMode : '');
    const exp = micTakeExpected(d);
    const right = exp.filter(e => ['ok','oct','perfect','good'].indexOf(e.verdict) >= 0).length;
    return `<tr><td class="nc" title="${escAttr(d.name || d.uid || '')}">${escHtml(d.name || (d.uid || '').slice(0,8))}</td>`+
      `<td>${escHtml(d.period || '')}</td><td>${escHtml(game)}</td><td>${escHtml(String(d.bpm || ''))}</td>`+
      `<td>${escHtml(String(d.durationSec || ''))} s</td><td>${right} / ${exp.length}</td><td>${escHtml(when)}</td>`+
      `<td><button class="tg-seg-btn" onclick="teacherMicDownloadWav(${i})">Download WAV</button> `+
      `<button class="tg-seg-btn" onclick="teacherMicDownloadJson(${i})">Download data</button> `+
      `<button class="tg-seg-btn" onclick="teacherMicDelete(${i})">Delete</button></td></tr>`;
  }).join('');
  box.innerHTML = ctl + `<div class="t-grid-wrap"><table><thead><tr><th class="nc">Student</th><th>Period</th><th>Game</th><th>BPM</th><th>Length</th><th>Counted right</th><th>Saved</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="tg-note" style="margin-top:16px"><button class="tp-btn" id="t-mic-dl-all" style="flex:none;padding:8px 16px;margin-right:10px" onclick="teacherMicDownloadAll()">Download all (${takes.length})</button>
      One .zip with every recording's WAV and data, named the same as the buttons above.</div>
    <div class="tg-note" style="margin-top:8px"><button class="tp-btn primary" style="flex:none;padding:8px 16px;margin-right:10px" onclick="teacherMicEvaluate()">Evaluate all recordings</button>
      Measures every recording: how loud the mic is, the real mic delay, and whether each note the site missed is in the audio. About a minute; nothing is changed.</div>
    <div id="t-mic-eval">${teacherMicEvalRows.length ? teacherMicEvalHtml() : ''}</div>`;
}
async function teacherSetMicSampling(on){
  const el = document.getElementById('t-mic-max');
  const max = Math.max(1, Math.min(500, Math.round(Number(el && el.value) || 40)));
  const prev = (teacherClassConfig || {}).micSampling;
  try{
    await teacherWriteConfig({ micSampling: { on: !!on, max } },
      { 'micSampling.on': prev ? prev.on : undefined, 'micSampling.max': prev ? prev.max : undefined });
    if(teacherClassConfig) teacherClassConfig.micSampling = { on: !!on, max };
  }catch(e){
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='mic') renderTeacherMic();
}
async function teacherResetMicCount(){
  if(!confirm('Set the count of collected takes back to 0? The recordings themselves are kept. Students will be asked again only on devices that have not answered yet.')) return;
  try{
    await ensureDb();
    await db.collection('micTakesMeta').doc('count').set({ n: 0 });
  }catch(e){ alert('Could not reset the counter — check your connection and Firestore rules.'); }
  if(teacherView==='mic') renderTeacherMic();
}
function teacherMicSaveFile(name, blob){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function teacherMicFileBase(d){
  const who = String(d.name || d.uid || 'student').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const saved = micTakeDate(d);
  const when = saved ? saved.toISOString().slice(0, 16).replace(/[:T]/g, '-') : 'take';
  return `mic-${d.mode || 'take'}-${who}-${when}`;
}
function teacherMicJsonable(v){
  if(v && typeof v.toDate === 'function') return v.toDate().toISOString();
  if(Array.isArray(v)) return v.map(teacherMicJsonable);
  if(v && typeof v === 'object'){ const o = {}; Object.keys(v).forEach(k => o[k] = teacherMicJsonable(v[k])); return o; }
  return v;
}
function teacherMicDownloadJson(i){
  const d = teacherMicTakes[i]; if(!d) return;
  teacherMicSaveFile(teacherMicFileBase(d) + '.json',
    new Blob([JSON.stringify(teacherMicJsonable(d), null, 2)], { type: 'application/json' }));
}
/* A take's audio chunks, in order (the raw 16-bit PCM bytes). Read side by
   side, not one round trip after another: Download all and Evaluate all call
   this once per take. `chunks` is off the student-written take doc, so it is
   bounded before it sizes anything — a real take is at most 30 s, three
   chunks (coach.js MICREC_MAX_SEC / MICREC_CHUNK). */
const TEACHER_MIC_MAX_CHUNKS = 16;
async function teacherMicChunks(d){
  await ensureDb();
  const ref = db.collection('micTakes').doc(d.id).collection('chunks');
  const n = Math.max(0, Math.ceil(Number(d.chunks) || 0));
  if(n > TEACHER_MIC_MAX_CHUNKS) throw new Error(n + ' chunks is more than one take can hold');
  return Promise.all(Array.from({ length: n }, async (_, k) => {
    const c = await ref.doc(String(k)).get();
    if(!c.exists) throw new Error('chunk ' + k + ' missing');
    return c.data().pcm.toUint8Array();
  }));
}
// The chunks back together, behind a 44-byte WAV header (16-bit mono PCM).
async function teacherMicWavBlob(d){
  const parts = await teacherMicChunks(d);
  const len = parts.reduce((a, p) => a + p.length, 0);
  const rate = d.sampleRate || 24000;
  const h = new DataView(new ArrayBuffer(44));
  const str = (o, s) => { for(let k = 0; k < s.length; k++) h.setUint8(o + k, s.charCodeAt(k)); };
  str(0, 'RIFF'); h.setUint32(4, 36 + len, true); str(8, 'WAVE');
  str(12, 'fmt '); h.setUint32(16, 16, true); h.setUint16(20, 1, true); h.setUint16(22, 1, true);
  h.setUint32(24, rate, true); h.setUint32(28, rate * 2, true); h.setUint16(32, 2, true); h.setUint16(34, 16, true);
  str(36, 'data'); h.setUint32(40, len, true);
  return new Blob([h.buffer].concat(parts), { type: 'audio/wav' });
}
async function teacherMicDownloadWav(i){
  const d = teacherMicTakes[i]; if(!d) return;
  try{
    teacherMicSaveFile(teacherMicFileBase(d) + '.wav', await teacherMicWavBlob(d));
  }catch(e){ alert('Could not download that recording — ' + (e && e.message ? e.message : 'check your connection.')); }
}

/* "Download all": every take's WAV + data in ONE .zip, the same file names
   the per-row buttons use, so tools/mic-sim/anon-takes.mjs reads the
   unzipped folder as-is (pairs share a base name). One file instead of two
   clicks per row, and no "allow multiple downloads" prompt.
   The zip is "stored" (no compression — WAV barely compresses and it keeps
   this dependency-free): local header + data per file, then the central
   directory, then the end record. Names are UTF-8 (flag bit 11). */
let teacherMicCrcTable = null;
function teacherMicCrc32(u8){
  if(!teacherMicCrcTable){
    teacherMicCrcTable = new Uint32Array(256);
    for(let n = 0; n < 256; n++){ let c = n; for(let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; teacherMicCrcTable[n] = c >>> 0; }
  }
  let c = 0xFFFFFFFF;
  for(let i = 0; i < u8.length; i++) c = teacherMicCrcTable[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
// files: [{ name, data: Uint8Array }] -> Blob (application/zip)
function teacherMicZip(files){
  const enc = new TextEncoder(), now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const out = [], cen = [];
  let off = 0;
  for(const f of files){
    const nm = enc.encode(f.name), crc = teacherMicCrc32(f.data), sz = f.data.length;
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
    lh.setUint16(8, 0, true); lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true);
    lh.setUint32(14, crc, true); lh.setUint32(18, sz, true); lh.setUint32(22, sz, true);
    lh.setUint16(26, nm.length, true); lh.setUint16(28, 0, true);
    out.push(lh.buffer, nm, f.data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
    ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true); ch.setUint16(12, dosTime, true); ch.setUint16(14, dosDate, true);
    ch.setUint32(16, crc, true); ch.setUint32(20, sz, true); ch.setUint32(24, sz, true);
    ch.setUint16(28, nm.length, true); ch.setUint32(42, off, true);
    cen.push(ch.buffer, nm);
    off += 30 + nm.length + sz;
  }
  const cenLen = cen.reduce((a, p) => a + (p.byteLength != null ? p.byteLength : p.length), 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, cenLen, true); end.setUint32(16, off, true);
  return new Blob(out.concat(cen, [end.buffer]), { type: 'application/zip' });
}
async function teacherMicDownloadAll(){
  const takes = teacherMicTakes.slice();
  if(!takes.length) return;
  const btn = document.getElementById('t-mic-dl-all');
  const label = btn ? btn.textContent : '';
  const files = [], used = {};
  try{
    for(let i = 0; i < takes.length; i++){
      if(btn){ btn.disabled = true; btn.textContent = `Packing ${i + 1} of ${takes.length}…`; }
      const d = takes[i];
      let base = teacherMicFileBase(d), k = 2;
      while(used[base]) base = teacherMicFileBase(d) + '-' + (k++);
      used[base] = true;
      const wav = new Uint8Array(await (await teacherMicWavBlob(d)).arrayBuffer());
      files.push({ name: base + '.wav', data: wav });
      files.push({ name: base + '.json', data: new TextEncoder().encode(JSON.stringify(teacherMicJsonable(d), null, 2)) });
    }
    const day = new Date().toISOString().slice(0, 10);
    teacherMicSaveFile(`mic-recordings-${day}.zip`, teacherMicZip(files));
  }catch(e){
    alert('Could not download all the recordings — ' + (e && e.message ? e.message : 'check your connection.'));
  }
  if(btn){ btn.disabled = false; btn.textContent = label; }
}
async function teacherMicDelete(i){
  const d = teacherMicTakes[i]; if(!d) return;
  if(!confirm(`Delete ${d.name || 'this student'}’s ${d.mode === 'nr' ? 'Note Runner' : d.mode === 'pw' ? 'Power Chord Switch' : 'Listening Coach'} recording? This cannot be undone.`)) return;
  try{
    await ensureDb();
    const ref = db.collection('micTakes').doc(d.id);
    const chunks = await ref.collection('chunks').get();
    for(const c of chunks.docs) await c.ref.delete();
    await ref.delete();
  }catch(e){ alert('Could not delete that recording — check your connection and Firestore rules.'); }
  if(teacherView==='mic') renderTeacherMic();
}

/* ── Mic recordings: evaluation ─────────────────────────────────────────
   Shared with tools/mic-sim/eval-takes.mjs, which runs these same functions
   (pulled out of this file) on downloaded WAV + JSON pairs. `deps` carries what comes
   from the site itself, so both runners judge with the SAME code the site
   listens with:
     deps.detectPitch  coachDetectPitch, extracted from coach.js
     deps.GATE         COACH_PITCH_GATE   (RMS floor for a pitch reading)
     deps.GAIN         COACH_MIC_GAIN     (the fixed boost before the gate)
     deps.ATTACK_SKIP / EVENT_TAIL / REFRACT / MATCH_FRAC / MATCH_MIN_MS /
       VOTE_TOL        the COACH_* constants of the same names, for
                       micEvalWhy (defaults inside it if a runner omits them)

   What one take tells us (micTakes/<uid>-<coach|nr|pw>, see coach.js micRec*; a pw take — Power Chord Switch — is measured by micEvalTakePw below, which reads strums, not notes):
   the RAW mic from the count-in to the end, 24 kHz 16-bit mono, plus every
   expected note (time + verdict the site gave) and every event the site
   heard. Times in the JSON are performance.now() made relative to the
   recording's start; event times are "played" = arrival - micLatencyMs.

   The four count-in beeps (660, 660, 660, 990 Hz, 80 ms, through the
   Chromebook's own speaker) are in the recording. A student who plays on
   the click they HEAR lands in the recording exactly where the click
   landed, because both went speaker/guitar -> air -> mic. So the clicks
   give, per device:
     clickLagMs  where the clicks landed vs when they were scheduled
     mapMs       site's clock vs the recording's, measured on the notes the
                 site detected (it also folds in the detector's own delay)
     idealMs     the micLatencyMs that would make an on-click note score
                 dead on the beat   = clickLagMs + mapMs
     skewMs      what the site actually did to an on-click note
                 (+ = called it late) = idealMs - micLatencyMs
   And per expected note: the audio is replayed through the site's own
   filters + gate + YIN, so a note the site missed can be split into
   "the note is clearly in the audio" (a detector problem) and "it isn't"
   (the student didn't play it, or the mic didn't pick it up). */

/* What every take is read for the same way, whatever the game (micEvalTake,
   micEvalTakePw): the samples as floats, the levels, the pick attacks
   (onsets) and a tone meter (Goertzel). tools/mic-sim/eval-takes.mjs and
   checks.mjs 1cl lift this out together with the two evaluators. */
function micEvalSignal(pcm, R, deps){
  const N = pcm.length;
  const x = new Float32Array(N);
  for (let i = 0; i < N; i++) x[i] = pcm[i] / 32768;
  const ms2s = ms => Math.round(ms / 1000 * R);
  const s2ms = s => s / R * 1000;
  const dB = v => 20 * Math.log10(Math.max(v, 1e-9));
  const r1 = v => v == null || !isFinite(v) ? null : Math.round(v * 10) / 10;
  const pct = (a, q) => { if (!a.length) return null; const b = Array.from(a).sort((p, q2) => p - q2); return b[Math.min(b.length - 1, Math.floor(q * b.length))]; };

  /* ── levels: 20 ms RMS every 5 ms ── */
  const HOP = ms2s(5), WL = ms2s(20);
  const nH = Math.max(0, Math.floor((N - WL) / HOP));
  const env = new Float32Array(nH), hf = new Float32Array(nH);
  let mean = 0, peak = 0, clip = 0;
  for (let i = 0; i < N; i++){ const v = x[i]; mean += v; const a = Math.abs(v); if (a > peak) peak = a; if (a >= 0.999) clip++; }
  mean /= N || 1;
  for (let h = 0; h < nH; h++){
    let s = 0, ds = 0;
    const a = h * HOP;
    for (let i = a; i < a + WL; i++){ const v = x[i] - mean; s += v * v; if (i){ const dd = x[i] - x[i - 1]; ds += dd * dd; } }
    env[h] = Math.sqrt(s / WL); hf[h] = Math.sqrt(ds / WL);
  }
  const envDb = Array.from(env, dB);
  const level = {
    floorDb: r1(pct(envDb, 0.10)), medianDb: r1(pct(envDb, 0.5)), loudDb: r1(pct(envDb, 0.99)),
    peakDb: r1(dB(peak)), clipPct: r1(100 * clip / (N || 1)), dcOffset: Math.round(mean * 1e4) / 1e4,
    // how far the loud bits clear the site's pitch gate after its fixed gain
    gateHeadroomDb: r1(pct(envDb, 0.99) - dB(deps.GATE / deps.GAIN)),
    floorGateDb: r1(pct(envDb, 0.10) - dB(deps.GATE / deps.GAIN))
  };

  /* ── onsets: jumps in the first-difference level (a pick attack is broadband) ── */
  const hfFloor = pct(hf, 0.2) || 1e-6;
  const onsets = [];
  let base = hf[0] || 0, lastOn = -1e9;
  for (let h = 1; h < nH; h++){
    const v = hf[h];
    if (v > base * 2.2 && v > hfFloor * 4 && (h - lastOn) * 5 > 70){
      // the window is 20 ms wide: find the first 1 ms inside it where the jump starts
      const ref = Math.max(base, hfFloor), a = h * HOP, m1 = ms2s(1);
      let at = a + WL - m1;
      for (let s = a; s + m1 <= a + WL; s += m1){
        let ds = 0; for (let i = Math.max(1, s); i < s + m1; i++){ const dd = x[i] - x[i - 1]; ds += dd * dd; }
        if (Math.sqrt(ds / m1) > ref * 3){ at = s; break; }
      }
      onsets.push({ ms: s2ms(at), str: v / ref }); lastOn = h;
    }
    base += (v - base) * 0.12;
  }

  function tone(f, centreS, halfS){
    // sinusoid amplitude at f over [centre-half, centre+half] (Goertzel)
    const a = Math.max(0, centreS - halfS), b = Math.min(N, centreS + halfS);
    if (b - a < 16) return 0;
    const w = 2 * Math.PI * f / R, c = 2 * Math.cos(w);
    let s1 = 0, s2 = 0;
    for (let i = a; i < b; i++){ const s0 = x[i] + c * s1 - s2; s2 = s1; s1 = s0; }
    const re = s1 - s2 * Math.cos(w), im = s2 * Math.sin(w);
    return 2 * Math.sqrt(re * re + im * im) / (b - a);
  }
  return { x, N, env, nH, level, onsets, tone };
}

function micEvalTake(pcm, R, d, deps){
  const { x, N, env, nH, level, onsets, tone } = micEvalSignal(pcm, R, deps);
  const ms2s = ms => Math.round(ms / 1000 * R);
  const s2ms = s => s / R * 1000;
  const dB = v => 20 * Math.log10(Math.max(v, 1e-9));
  const r1 = v => v == null || !isFinite(v) ? null : Math.round(v * 10) / 10;
  const pct = (a, q) => { if (!a.length) return null; const b = Array.from(a).sort((p, q2) => p - q2); return b[Math.min(b.length - 1, Math.floor(q * b.length))]; };
  const med = a => pct(a, 0.5);
  const lat = Number(d.micLatencyMs) || 0;
  const beat = Number(d.beatMs) || (d.bpm ? 60000 / d.bpm : 0);
  // Inline, not micTakeExpected(): tools/mic-sim/eval-takes.mjs lifts this
  // function out on its own. A null entry threw on e.t below.
  const expected = Array.isArray(d.expected) ? d.expected.filter(e => e && typeof e === 'object') : [];
  const events = Array.isArray(d.events) ? d.events : [];

  /* ── count-in clicks ── */
  const clicks = { found: false };
  /* Clicks 2-4 only (2026-10-16). The FIRST click is scheduled ~0.1 s
     after micRecStart, and on the 10-16 Chromebooks it lands in the first
     ~200 ms of the recording, which is still near-silent (the capture is
     warming up) — so requiring all four beeps failed on every take, and
     the best-scoring "candidate" became a played E5/B5 (659/988 Hz, the
     beep pitches) seconds later. Now:
       · the search only runs where the clicks can be: click 1 between
         100 ms early and 600 ms late on the Coach's schedule (Note
         Runner: its four clicks end before its first note);
       · each of clicks 2, 3, 4 must stand > CLICK_EACH x its OWN tone's
         background (median of that tone over the count-in) — a per-beep
         test, no overall ratio, so one loud beep can't carry two missing
         ones;
       · and their onsets must agree to within CLICK_JITTER ms.
     Click 1 is measured and reported (`first`) when it is in the audio,
     never required. A take with no clicks (fake-take.mjs clicks=0) stays
     found: false. */
  const CLICK_EACH = 4, CLICK_JITTER = 40;
  if (beat > 0){
    const e0 = expected[0] && expected[0].t;
    const halfS = ms2s(20), stepS = ms2s(4), B = ms2s(beat);
    const fOf = j => j === 3 ? 990 : 660;
    // each tone's background over the count-in (and a beat past it)
    const bgEnd = Math.min(N, ms2s((e0 != null ? e0 : 4 * beat) + beat));
    const bg = [660, 990].map(f => { const v = []; for (let s = 0; s + 2 * halfS < bgEnd; s += ms2s(20)) v.push(tone(f, s + halfS, halfS)); return med(v) || 1e-9; });
    const bgOf = j => j === 3 ? bg[1] : bg[0];
    // click 1's arrival, on the recording's clock
    let lo, hi;
    if (d.mode !== 'nr' && e0 != null){ lo = ms2s(e0 - 4 * beat - 100); hi = ms2s(e0 - 4 * beat + 600); }
    else { lo = -B; hi = e0 != null ? ms2s(e0 + 600) - 4 * B : ms2s(1500); }
    lo = Math.max(lo, -B + 1); hi = Math.min(hi, N - 3 * B - 2 * halfS);
    let best = null;
    for (let c = lo; c <= hi; c += stepS){
      const k = [1, 2, 3].map(j => tone(fOf(j), c + j * B + halfS, halfS) / bgOf(j));
      const v = Math.min(...k);
      if (!best || v > best.v) best = { c, v, k };
    }
    if (best){
      const e0c = e0;
      const lagC = d.mode !== 'nr' && e0c != null ? s2ms(best.c) - (e0c - 4 * beat) : null;
      const first = best.c >= 0 ? r1(tone(660, best.c + halfS, halfS) / bg[0]) : null;
      clicks.snrDb = r1(dB(best.v));
      // each click's onset: first 2 ms step where its tone passes half its own peak
      const onsetOf = j => {
        const f = fOf(j), c0 = best.c + j * B;
        let pk = 0; const prof = [];
        for (let s = c0 - ms2s(60); s < c0 + ms2s(100); s += ms2s(2)){ const v = tone(f, s, ms2s(5)); prof.push([s, v]); if (v > pk) pk = v; }
        const hit = prof.find(p => p[1] >= pk * 0.5);
        return s2ms(hit ? hit[0] : c0) - j * beat;
      };
      const ons = [1, 2, 3].map(onsetOf);
      const jitter = Math.max(...ons) - Math.min(...ons);
      // why it was or wasn't found — eval-takes prints this per take
      clicks.diag = { bestMs: r1(s2ms(best.c)), each: best.k.map(r1), first, jitterMs: r1(jitter),
        lagC: lagC == null ? null : r1(lagC), firstNoteMs: e0c != null ? r1(e0c) : null };
      if (best.k.every(v => v > CLICK_EACH) && jitter <= CLICK_JITTER){
        const c0ms = med(ons);
        clicks.found = true;
        clicks.audioMs = r1(c0ms);
        clicks.jitterMs = r1(jitter);
        clicks.ampDb = r1(dB(Math.max(...[1, 2, 3].map(j => tone(fOf(j), best.c + j * B + halfS, halfS)))));
        // when the first click was scheduled, on the recording's clock
        if (e0 != null){
          if (d.mode === 'nr'){
            // Note Runner's first note can sit after beat 1: try each half beat
            let bestL = null;
            for (let j = 0; j <= 32; j++){
              const L = c0ms - (e0 - (4 + j / 2) * beat);
              if (bestL == null || Math.abs(L - 120) < Math.abs(bestL - 120)) bestL = L;
            }
            clicks.lagMs = r1(bestL);
          } else clicks.lagMs = r1(c0ms - (e0 - 4 * beat));
        }
      }
    }
  }

  /* ── the site's clock vs the recording's, from the events it heard ── */
  const nearOnset = (ms, win) => {
    let b = null;
    for (const o of onsets){ const dd = Math.abs(o.ms - ms); if (dd <= win && (!b || dd < Math.abs(b.ms - ms))) b = o; }
    return b;
  };
  const maps = [];
  events.forEach(ev => { if (ev.t == null) return; const o = nearOnset(ev.t + lat, 120); if (o) maps.push(ev.t + lat - o.ms); });
  const mapMs = maps.length >= 3 ? med(maps) : null;
  const latency = { settingMs: lat, clickFound: clicks.found, clickSnrDb: clicks.snrDb == null ? null : clicks.snrDb,
    clickAmpDb: clicks.ampDb == null ? null : clicks.ampDb, clickJitterMs: clicks.jitterMs == null ? null : clicks.jitterMs,
    clickLagMs: clicks.lagMs == null ? null : clicks.lagMs, mapMs: r1(mapMs), mapN: maps.length, clickDiag: clicks.diag || null };
  if (clicks.lagMs != null && mapMs != null){
    latency.idealMs = r1(clicks.lagMs + mapMs);
    latency.skewMs = r1(clicks.lagMs + mapMs - lat);
  }

  /* ── replay each expected note through the site's filters + gate + YIN ── */
  // 2x up to 48 kHz (what the live analyser runs at), then gain + 70 Hz HP + 1500 Hz LP
  const R2 = R * 2, y = new Float32Array(N * 2);
  for (let i = 0; i < N; i++){ const a = x[i], b = i + 1 < N ? x[i + 1] : a; y[2 * i] = a; y[2 * i + 1] = (a + b) / 2; }
  function biquad(buf, type, f0, Q){
    const w = 2 * Math.PI * f0 / R2, al = Math.sin(w) / (2 * Q), cw = Math.cos(w);
    let b0, b1, b2;
    if (type === 'hp'){ b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0; } else { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = b0; }
    const a0 = 1 + al, a1 = -2 * cw, a2 = 1 - al;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < buf.length; i++){
      const v = buf[i], o = (b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
      x2 = x1; x1 = v; y2 = y1; y1 = o; buf[i] = o;
    }
  }
  for (let i = 0; i < y.length; i++) y[i] *= deps.GAIN;
  biquad(y, 'hp', 70, 0.7); biquad(y, 'lp', 1500, 0.7);
  const FW = 2048;
  function readings(fromMs, toMs){
    const out = [];
    for (let t = fromMs; t <= toMs; t += 15){
      const end = Math.round((t + 42.7) / 1000 * R2);
      if (end > y.length || end - FW < 0) continue;
      let s = 0; for (let i = end - 1024; i < end; i++) s += y[i] * y[i];
      if (Math.sqrt(s / 1024) <= deps.GATE) continue;
      const f = deps.detectPitch(y, R2, 0.22, end);
      if (f > 0) out.push(69 + 12 * Math.log2(f / 440));
    }
    return out;
  }
  /* The Coach's own reading schedule: one 2048-sample window ending every
     `step` ms from `fromEnd` to `toEnd` (recording ms), gated at half
     COACH_PITCH_GATE the way coachLoop gates its readings. */
  function siteReadings(fromEnd, toEnd, step, times){
    const out = [];
    for (let t = fromEnd; t <= toEnd; t += step){
      const end = Math.round(t / 1000 * R2);
      if (end > y.length || end - FW < 0) continue;
      let s = 0; for (let i = end - 1024; i < end; i++) s += y[i] * y[i];
      if (Math.sqrt(s / 1024) <= deps.GATE * 0.5) continue;
      const f = deps.detectPitch(y, R2, 0.22, end);
      if (f > 0){ out.push(69 + 12 * Math.log2(f / 440)); if (times) times.push(t); }
    }
    return out;
  }
  const VERD = { ok: 'right', oct: 'right', perfect: 'right', good: 'right', wrong: 'wrong', pitch: 'wrong', dim: 'unclear', miss: 'miss' };
  // where an on-the-click note lands in the recording
  const offs = clicks.lagMs != null ? clicks.lagMs : (mapMs != null ? lat - mapMs : lat);
  const floorDb = level.floorDb;
  const notes = [];
  /* A note whose window runs past the end of the audio (the 30 s cap, or Stop)
     is not judged: `dropped`, the rule micEvalTakePw keeps for a change. Real
     takes (2026-11-04) had 42 of 64 Note Runner notes past the cap, which
     read as "no pluck" and gave a median level of -141.6 dB. */
  const endMs = s2ms(N);
  let dropped = 0;
  expected.forEach((e, i) => {
    if (e.t == null) return;
    const want = e.t + offs;
    const half = Math.min(beat ? beat * 0.5 : 300, 400);
    if (want + half > endMs){ dropped++; return; }
    let o = null;
    for (const on of onsets){ const dd = on.ms - want; if (dd >= -half && dd < half && (!o || Math.abs(dd) < Math.abs(o.ms - want))) o = on; }
    const at = o ? o.ms : want;
    let pk = 0; for (let h = Math.floor(at / 5); h < Math.floor((at + 150) / 5) && h < nH; h++) if (h >= 0 && env[h] > pk) pk = env[h];
    const rd = readings(at + 30, at + Math.min(beat ? beat * 0.9 : 500, 500));
    let site = VERD[e.verdict] || e.verdict || '?';
    if (site === 'wrong' && e.unclear) site = 'unclear';
    const chord = !!(e.chord || (e.midis && e.midis.length > 1 && d.coachMode === 'chords'));
    const rec = { i, site, played: !!o, secondLook: !!e.secondLook, onsetMs: o ? r1(o.ms - want) : null, snrDb: r1(dB(pk) - floorDb), n: rd.length,
      heard: rd.length ? r1(med(rd)) : null };
    // what the site itself had for this note: the event it matched here
    const sev = d.mode === 'nr'
      ? events.filter(ev => ev.t != null && Math.abs(ev.t - e.t) < (beat || 600) / 2).sort((a, b) => Math.abs(a.t - e.t) - Math.abs(b.t - e.t))[0]
      : events.find(ev => ev.slot === i);
    const srd = sev && Array.isArray(sev.readings) ? sev.readings : [];
    rec.siteN = srd.length;
    rec.siteHeard = srd.length ? r1(med(srd)) : null;
    if (chord){
      const cls = (e.midis && e.midis.length ? e.midis : [e.midi, e.midi + 7]).filter(m => m != null).map(m => ((m % 12) + 12) % 12);
      const share = rd.length ? rd.filter(r => cls.indexOf(((Math.round(r) % 12) + 12) % 12) >= 0).length / rd.length : 0;
      rec.chord = true; rec.share = Math.round(share * 100) / 100;
      rec.replay = rd.length < 2 ? 'none' : share >= 0.2 ? 'present' : 'other';
    } else if (e.midi != null){
      const T = e.midi;
      const ex = rd.filter(r => Math.abs(r - T) <= 0.5), oc = rd.filter(r => Math.abs(r - T - 12) <= 0.5);
      rec.midi = T;
      rec.exact = rd.length ? Math.round(ex.length / rd.length * 100) / 100 : 0;
      rec.oct = rd.length ? Math.round(oc.length / rd.length * 100) / 100 : 0;
      const near = ex.map(r => r - T).concat(oc.map(r => r - T - 12));
      rec.cents = near.length ? Math.round(100 * med(near)) : null;
      rec.replay = rd.length < 2 ? 'none' : rec.exact + rec.oct >= 0.5 ? 'present' : rec.exact + rec.oct >= 0.2 ? 'mixed' : 'other';
      /* An ESTIMATE of the 2026-10-14 "second look" proposal, which was
         never built (the one coach.js got on 2026-10-16 is COACH_LOOK_TAIL —
         a different window and rule; tools/mic-sim/whatif-tail.mjs models
         that one): what it would do with a note it called
         unclear: the same window — from
         the matched event's attack + 70 ms to 3/4 of a beat (at most
         600 ms) past the beat, or the event's own 340 ms if later — read
         on the Coach's 40 ms schedule; right when the note or its octave
         is at least half of at least 3 readings. */
      if (d.mode !== 'nr' && site === 'unclear'){
        const m0 = mapMs != null ? mapMs : 0;
        const beatA = e.t + (Number(d.gridOffsetMs) || 0) + lat - m0;
        const hitA = sev && sev.t != null ? sev.t + lat - m0 : beatA;
        const lk = siteReadings(hitA + 70, Math.max(beatA + Math.min((beat || 600) * 0.75, 600), hitA + 340), 40);
        const share = lk.length ? lk.filter(r => Math.abs(r - T) <= 0.6 || Math.abs(r - T - 12) <= 0.6).length / lk.length : 0;
        rec.look = { n: lk.length, share: Math.round(share * 100) / 100, pass: lk.length >= 3 && share >= 0.5 };
      }
      // low strings: fundamental vs 2nd harmonic, straight off the raw mic
      if (T < 52 && o && rd.length >= 2){
        const f0 = 440 * Math.pow(2, (T - 69) / 12), c = ms2s(at + 90);
        const h1 = tone(f0, c, ms2s(42)), h2 = tone(2 * f0, c, ms2s(42));
        rec.h1h2Db = r1(dB(h1) - dB(h2));
      }
    } else return;
    rec.why = micEvalWhy(e, i, site, chord, sev);
    notes.push(rec);
  });

  /* WHY a note the site did not count ended up with too few readings
     (2026-10-16 work order, Phase 1). Both the consensus median and
     coachMelodyVote need >= 2 readings, so the question is where the
     readings went. One category per not-counted note:
       no-onset         no site event (onset) anywhere in the slot's match
                        window — `audio` says whether the recording has a
                        pick attack there that the site's detector missed
       onset-elsewhere  a site event is in the window but went to another
                        slot / stayed unmatched / (Note Runner) sat outside
                        the ±goodMs timing window — or `refract`: the
                        recording's attack fell inside COACH_ONSET_REFRACT
                        of an earlier site onset, which swallowed it
       readings-cut     the matched event had < 2 readings in its own
                        window (ATTACK_SKIP..EVENT_TAIL after arrival)
       vote-failed      >= 2 readings, but consensus and the vote both
                        failed; `share` = fraction on the target (or octave)
     and `counted` / `wrong` for the rest. For every category the replay
     also reads the audio on the site's own schedule (40 ms, half gate,
     YIN 0.22): `winN` inside the event's window, `lateN` / `lateHit` in
     the 400 ms after it (stopping short of the next beat), so "would a
     longer tail have helped" is answered from the audio, not a guess.
     Site clock -> recording: arrival = t + micLatencyMs, minus mapMs. */
  function micEvalWhy(e, i, site, chord, sevAny){
    const m0 = mapMs != null ? mapMs : 0;
    const toRec = siteArrival => siteArrival - m0;
    const nr = d.mode === 'nr';
    const SKIP = deps.ATTACK_SKIP || 70, TAIL = deps.EVENT_TAIL || 340, REFR = deps.REFRACT || 140;
    const TOL = deps.VOTE_TOL || 0.6;
    const winMs = nr ? (Number(d.goodMs) || 160)
      : (beat ? Math.min(beat, Math.max(beat * (deps.MATCH_FRAC || 0.9), deps.MATCH_MIN_MS || 320)) : 320);
    const beatSite = e.t + (nr ? 0 : (Number(d.gridOffsetMs) || 0));   // "played" clock
    const targets = chord ? null : (e.midis && e.midis.length ? e.midis : [e.midi]).filter(m => m != null);
    const onTarget = r => chord
      ? (() => { const cls = (e.midis && e.midis.length ? e.midis : [e.midi, e.midi + 7]).filter(m => m != null).map(m => ((m % 12) + 12) % 12);
          return cls.indexOf(((Math.round(r) % 12) + 12) % 12) >= 0; })()
      : targets.some(m => Math.abs(r - m) <= TOL || Math.abs(r - m - 12) <= TOL);
    // the event this note was graded on
    let sev = null;
    if (nr){
      sev = events.filter(ev => ev.t != null && Math.abs(ev.t - e.t) <= winMs)
        .sort((a, b) => Math.abs(a.t - e.t) - Math.abs(b.t - e.t))[0] || null;
    } else sev = sevAny || null;
    const out = { cat: site === 'right' ? 'counted' : site === 'wrong' ? 'wrong' : null };
    // the window the readings came from (or would have), on the recording's clock
    let hitA;
    if (sev){
      hitA = toRec(sev.t + lat);
      // the recording's own pick attack nearest the site's onset: + = the
      // site fired BEFORE the attack (its window opened on the room)
      let ao = null;
      for (const on of onsets){ const dd = on.ms - hitA; if (Math.abs(dd) <= 250 && (!ao || Math.abs(dd) < Math.abs(ao.ms - hitA))) ao = on; }
      out.attackOffMs = ao ? r1(ao.ms - hitA) : null;
    } else {
      const beatA = toRec(beatSite + lat);
      let ao = null;
      for (const on of onsets){ const dd = on.ms - beatA; if (Math.abs(dd) <= winMs && (!ao || Math.abs(dd) < Math.abs(ao.ms - beatA))) ao = on; }
      out.audio = !!ao;
      hitA = ao ? ao.ms : beatA;
      if (ao) out.audioDevMs = r1(ao.ms - beatA);
    }
    // stop short of the NEXT written note's arrival (Note Runner has rests
    // and half-beat notes, so its own time, not one beat on)
    const e2 = expected[i + 1];
    const nextA = e2 && e2.t != null ? toRec(e2.t + (nr ? 0 : (Number(d.gridOffsetMs) || 0)) + lat) - 60
      : hitA + TAIL + 400;
    const win = siteReadings(hitA + SKIP, hitA + TAIL, 40);
    const lateT = [];
    const late = siteReadings(hitA + TAIL + 40, Math.min(hitA + TAIL + 400, nextA), 40, lateT);
    // [ms after the tail, midi] — for tools/mic-sim/whatif-tail.mjs
    out.lateR = late.map((m, k) => [Math.round(lateT[k] - hitA - TAIL), Math.round(m * 100) / 100]);
    out.siteN = sev && Array.isArray(sev.readings) ? sev.readings.length : 0;
    out.graded = !!sev;
    if (sev && Array.isArray(sev.readings)) out.siteR = sev.readings.slice();
    out.winN = win.length;
    out.lateN = late.length;
    out.lateHit = late.filter(onTarget).length;
    if (sev && Array.isArray(sev.readings) && sev.readings.length){
      out.share = Math.round(sev.readings.filter(onTarget).length / sev.readings.length * 100) / 100;
    }
    if (out.cat) return out;
    if (sev){
      out.cat = out.siteN >= 2 ? 'vote-failed' : 'readings-cut';
      return out;
    }
    // no event graded this note: is there one nearby that went elsewhere?
    const reach = nr ? Math.max(winMs, (beat || 600) / 2) : winMs;
    const near = events.filter(ev => ev.t != null && Math.abs(ev.t - beatSite) <= reach)
      .sort((a, b) => Math.abs(a.t - beatSite) - Math.abs(b.t - beatSite))[0];
    if (near){
      out.cat = 'onset-elsewhere';
      out.detail = nr ? 'outside timing window' : (near.slot >= 0 ? 'slot ' + near.slot : 'unmatched');
      out.devMs = r1(near.t - beatSite);
      out.nearN = Array.isArray(near.readings) ? near.readings.length : 0;
      return out;
    }
    if (out.audio){
      // the recording's attack, back on the site's arrival clock
      const aoSite = hitA + m0;
      const prev = events.filter(ev => ev.t != null && aoSite - (ev.t + lat) > 0 && aoSite - (ev.t + lat) <= REFR);
      if (prev.length){ out.cat = 'onset-elsewhere'; out.detail = 'refract'; return out; }
    }
    out.cat = 'no-onset';
    return out;
  }

  const cnt = f => notes.filter(f).length;
  const strong = n => n.played && n.snrDb != null && n.snrDb >= 15;
  const lowNotes = notes.filter(n => n.h1h2Db != null);
  const extra = onsets.filter(on => !expected.some(e => e.t != null && Math.abs(e.t + offs - on.ms) < Math.max(150, (beat || 600) * 0.35))).length;
  const startMs = expected.length && expected[0].t != null ? expected[0].t + offs : 0;
  const playMs = Math.max(1, s2ms(N) - startMs);
  const summary = {
    n: notes.length, dropped,
    siteRight: cnt(n => n.site === 'right'), siteWrong: cnt(n => n.site === 'wrong'),
    siteUnclear: cnt(n => n.site === 'unclear'), siteMiss: cnt(n => n.site === 'miss'),
    replayPresent: cnt(n => n.replay === 'present'),
    // the site said not-right, but the note is clearly in the audio, loud
    detectorMissed: cnt(n => n.site !== 'right' && n.replay === 'present' && strong(n)),
    // the site said right, the replay can't find it
    siteRightReplayNot: cnt(n => n.site === 'right' && n.replay !== 'present'),
    // a steady pitch, but not the written one: how far off, in semitones
    // (one offset over and over = an out-of-tune guitar or a wrong string;
    // scattered = wrong frets, or a neighbour's guitar)
    offPitch: (() => {
      const h = {};
      notes.forEach(n => { if (n.midi != null && n.replay === 'other' && n.heard != null && n.n >= 3){ const k = Math.round(n.heard - n.midi); h[k] = (h[k] || 0) + 1; } });
      return h;
    })(),
    unclearSiteReadings: med(notes.filter(n => n.site === 'unclear').map(n => n.siteN)),
    presentSiteReadings: med(notes.filter(n => n.site === 'unclear' && n.replay === 'present').map(n => n.siteN)),
    // no new pick attack anywhere near the note: nothing was played there
    silentMiss: cnt(n => (n.site === 'miss' || n.site === 'unclear') && !n.played && n.replay !== 'present'),
    // counted right by the second look (coach.js COACH_LOOK_TAIL, 2026-10-16;
    // takes saved before then never carry it)
    secondLook: cnt(n => n.secondLook),
    // what a second look WOULD do with this take's unclear notes (estimate only):
    // count right (and of those, how many the replay also finds clearly)
    lookWould: cnt(n => n.look && n.look.pass),
    lookWouldPresent: cnt(n => n.look && n.look.pass && n.replay === 'present'),
    // micEvalWhy's category for every note: counted / wrong / no-onset /
    // onset-elsewhere / readings-cut / vote-failed
    why: notes.reduce((h, n) => { const c = n.why && n.why.cat || '?'; h[c] = (h[c] || 0) + 1; return h; }, {}),
    octDominant: cnt(n => n.oct > n.exact && n.oct >= 0.3),
    medianSnrDb: r1(med(notes.filter(n => n.snrDb != null).map(n => n.snrDb))),
    medianCents: (() => { const c = notes.filter(n => n.cents != null).map(n => n.cents); return c.length ? med(c) : null; })(),
    medianAbsOnsetMs: r1(med(notes.filter(n => n.onsetMs != null).map(n => Math.abs(n.onsetMs)))),
    lowH1H2Db: r1(med(lowNotes.map(n => n.h1h2Db))), lowN: lowNotes.length
  };
  return {
    level, latency, notes: summary, perNote: notes,
    room: { extraOnsetsPerMin: Math.round(extra / playMs * 60000), onsets: onsets.length }
  };
}

/* The site's own strum rule, replayed over a recording (a WHAT-IF: nothing
   here changes how the game grades). Lifted from coach.js at run time, never
   copied by hand: deps.strum = { consts, ccLoopSrc, readFrameSrc, smoothSrc }
     consts         CHK_ONSET_FLOOR / _RATIO, CHK_HF_FLOOR / _RATIO,
                    COACH_ONSET_REFRACT, COACH_LVL_WIN, COACH_LVL_HOP,
                    COACH_CATCHUP_MAX_MS, as FLOOR RATIO HF_FLOOR HF_RATIO
                    REFRACT WIN HOP CATCHUP
     ccLoopSrc      the text of ccLoop: its `if ((rms > ... ) && at - ... >
                    COACH_ONSET_REFRACT)` condition is compiled and RUN here,
                    with the two ratios passed in
     readFrameSrc   the text of coachReadFrame: the easing's base and step
                    (coachSmoothA = 1 - Math.pow(b, dt / step)) and the arrival
                    fraction are read from it; the window arithmetic (RMS and
                    first-difference level of 1024 samples every 512, the
                    loudest window of the frame's fresh audio) is written out
                    in micEvalStrumFrames, and the source must still contain
                    every line it mirrors, or this returns null
     smoothSrc      the text of coachSmooth, run as it is
   Returns null when coach.js no longer has the shape this expects (checks.mjs
   1cl turns red then), so a what-if is never run against a rule it did not
   read. What it cannot know: the student's real frame times (it uses a steady
   frame every d.frameMeanMs) and the analyser's own 48 kHz samples (the take is
   24 kHz; the window length is scaled, the first-difference level is not). */
function micEvalStrumRule(sp){
  if (!sp || !sp.consts || !sp.ccLoopSrc || !sp.readFrameSrc || !sp.smoothSrc) return null;
  const c = sp.consts;
  for (const k of ['FLOOR', 'RATIO', 'HF_FLOOR', 'HF_RATIO', 'REFRACT', 'WIN', 'HOP', 'CATCHUP']) if (!(Number(c[k]) > 0)) return null;
  const lp = String(sp.ccLoopSrc), rf = String(sp.readFrameSrc);
  // (\u007b is the opening brace: a bare one in this regex would confuse the tools that lift this function out by counting braces)
  const cond = lp.match(/if \((\(rms > CHK_ONSET_FLOOR[\s\S]*?COACH_ONSET_REFRACT)\)\u007b/);
  if (!cond || /\/\/|\/\*/.test(cond[1])) return null;
  // what ccLoop does after the condition holds, and the order of it
  if (!/cc\.lastOnsetT = at;/.test(lp) || lp.indexOf('coachSmooth(cc, rms, coachHfRms);') < lp.indexOf('cc.lastOnsetT = at;')) return null;
  const alpha = rf.match(/coachSmoothA = 1 - Math\.pow\(([\d.]+), dt \/ ([\d.]+)\)/);
  const arrive = rf.match(/w\.rms >= rms \* ([\d.]+) \|\| w\.hf >= hf \* \1\)/);
  for (const need of ['Math.sqrt(sum / N)', 'Math.sqrt(dsum / N)', 'const d = v - buf[i - 1];', 'sum += v * v;', 'dsum += d * d;',
    'end > L - fresh + COACH_LVL_HOP && end - N >= 1', 'gapMs <= COACH_CATCHUP_MAX_MS', 'fresh = Math.round(gapMs / 1000 * sr)',
    'const dt = Math.max(0, Math.min(gapMs, 1000));']) if (rf.indexOf(need) < 0) return null;
  if (!alpha || !arrive) return null;
  let fires, smoothFn;
  try {
    // ccLoop's condition names onsetRatio / hfRatio since 2026-11-05 (Power Chord Switch has its own); the CHK_* names are supplied too, for an older text of it
    fires = new Function('rms', 'coachHfRms', 'cc', 'at', 'CHK_ONSET_FLOOR', 'CHK_ONSET_RATIO', 'CHK_HF_FLOOR', 'CHK_HF_RATIO', 'COACH_ONSET_REFRACT', 'onsetRatio', 'hfRatio', 'return ' + cond[1] + ';');
    smoothFn = new Function('let coachSmoothA = 0;\n' + sp.smoothSrc + '\nreturn function(st, r, h, a){ coachSmoothA = a; coachSmooth(st, r, h); };')();
  } catch (e){ return null; }
  const base = Number(alpha[1]), step = Number(alpha[2]);
  return {
    FLOOR: Number(c.FLOOR), RATIO: Number(c.RATIO), HF_FLOOR: Number(c.HF_FLOOR), HF_RATIO: Number(c.HF_RATIO), REFRACT: Number(c.REFRACT),
    WIN: Number(c.WIN), HOP: Number(c.HOP), CATCHUP: Number(c.CATCHUP), ARRIVE: Number(arrive[1]),
    // does the frame (rms, hf, at ms) make an onset, with these two ratios, given this loop's levels
    fires: (rms, hf, st, at, ratio, hfRatio) => !!fires(rms, hf, st, at, c.FLOOR, ratio, c.HF_FLOOR, hfRatio, c.REFRACT, ratio, hfRatio),
    smooth: (st, rms, hf, dtMs) => smoothFn(st, rms, hf, 1 - Math.pow(base, dtMs / step))
  };
}

/* The levels the site's loop would have read from this recording: one frame
   every frameMs, each the loudest of the 1024-sample (at the analyser's rate)
   windows, one every 512, that end in the audio since the last frame
   (coachReadFrame), and the moment its jump arrived (the oldest window already
   near the frame's peak). x = the take as floats at R; srcRate = the
   analyser's rate. Independent of the ratios: computed once per take. */
function micEvalStrumFrames(x, R, srcRate, frameMs, rule){
  const k = R / srcRate, N = Math.max(8, Math.round(rule.WIN * k)), HOP = Math.max(1, Math.round(rule.HOP * k));
  const step = Math.max(1, Math.round(frameMs / 1000 * R));
  const fresh = frameMs <= rule.CATCHUP ? Math.round(frameMs / 1000 * R) : 0;
  const dt = Math.min(frameMs, 1000);
  const frames = [];
  for (let L = step; L <= x.length; L += step){
    let rms = 0, hf = 0;
    const wins = [];
    for (let end = L; end === L || (end > L - fresh + HOP && end - N >= 1); end -= HOP){
      if (end - N < 1) break;
      let sum = 0, dsum = 0;
      for (let i = end - N; i < end; i++){ const v = x[i]; sum += v * v; const d = v - x[i - 1]; dsum += d * d; }
      const w = { end, rms: Math.sqrt(sum / N), hf: Math.sqrt(dsum / N) };
      wins.push(w);
      if (w.rms > rms) rms = w.rms;
      if (w.hf > hf) hf = w.hf;
    }
    if (!wins.length) continue;
    let arr = wins[0];
    for (let j = wins.length - 1; j >= 0; j--){ const w = wins[j]; if (w.rms >= rms * rule.ARRIVE || w.hf >= hf * rule.ARRIVE){ arr = w; break; } }
    frames.push({ at: arr.end / R * 1000, rms, hf, dt });
  }
  return frames;
}

/* The strums (recording ms) the site's rule would have heard at these two ratios. */
function micEvalStrumHits(frames, rule, ratio, hfRatio){
  const st = { smoothRms: 0, smoothHf: 0, lastOnsetT: -1e9 }, out = [];
  for (const f of frames){
    if (rule.fires(f.rms, f.hf, st, f.at, ratio, hfRatio)){ st.lastOnsetT = f.at; out.push(f.at); }
    rule.smooth(st, f.rms, f.hf, f.dt);
  }
  return out;
}

/* A Power Chord Switch take (micTakes/<uid>-pw, coach.js ccRecMeta). Takes saved
   from 2026-11-05 hold each change's pitch readings (expected[].readings); only
   the `pitch` column below reads them, older takes have none, and the measurement
   itself is what the audio says on its own:
   was there a strum where the site listened for each change, against the
   site's verdict. Same row shape as micEvalTake (the console table and
   eval-takes read both), plus `kind: 'pw'` and `rounds`.
   A song switch is three rounds (`stage` 0..2), each at its own tempo (`bpm`
   on every change) and with its own count-in; a pair is one round. Round k's
   listen start is its first change's due time minus `bpc` beats (coach.js
   ccBeginStage: change s is due s x bpc beats after it, from s = 1); its four
   beeps were scheduled 4..1 beats before that.
     - Mic delay: beeps 2-4 of each round, found the way micEvalTake finds them
       (each > CLICK_EACH x its own tone's background, onsets within
       CLICK_JITTER), give where they landed (lag); the site's events against
       the audio's attacks give the site's clock vs the recording's (map, the
       whole take); ideal = lag + map, as in micEvalTake; skew = ideal - the
       saved micLatencyMs. Beeps can be missing: speaker muted, headphones, or
       a student strumming over the count-in.
     - The site's own window, replayed: ccLoop takes a strum for the first open
       change with |its beat - rel| <= win (inclusive), rel = played time -
       listenStart - gridOffset, win = half a beat, at least 220 ms, at most
       half the gap between changes; gridOffset moves a quarter of the way to
       each strum's nearest beat, by at most the take's gridStepCapMs (none saved = uncapped; from 0 each round), AFTER rel is taken. Every
       strum it heard is in `events` (played time), so the match and the
       gridOffset are run again here, and on the recording the window sits at
       due + gridOffset + micLatencyMs - map. With no map (fewer than 3 heard
       strums found in the audio) the window is centred on the beeps' lag, else
       on the setting: `rounds[].centre` says which ('site' / 'beeps' / 'setting').
     - Per change, against the site's verdict:
         agree            site ok/off, a strum in its window
         false-hit        site ok/off, no strum in it (a chord left ringing, noise)
         detector-missed  site miss, but a strum in it
         off-window       site miss, none in it, but a strum (in the audio, or
                          heard by the site) up to a quarter beat outside it (never
                          past half the gap between changes), or that near the
                          beat the student heard (the beeps): played early or
                          late, or the delay setting put the window off the strum
         silent-miss      site miss, nothing near (not played, or further off)
       `replayMismatch` counts changes where the replayed match and the saved
       verdict disagree (0 unless the site's rule and this copy differ).
     - A change whose window runs past the end of the audio (the 30 s cap, or a
       Stop) is not judged: `dropped`.
     - Every number here was written by the student's browser and is not checked
       by the rules: a change with an impossible time, round or tempo (outside
       coach.js CC_POWER_BPM_MIN..CC_BPM_MAX, CC_LADDER_ROUNDS, CC_RATES' bpc; checks.mjs
       1cl pins these copies) is left out and counted in `ignored`; a change of a round the student retimed while
       playing (`retimed: true`, coach.js ccLiveBpm) is left out and counted in `retimed`, which is not bad data. No loop then runs
       on a saved number alone: the grid loop stops at the number of beats the
       changes span, the replay is events x a binary search, and the per-change
       searches grow with changes x (onsets + events) — onsets are capped by the
       30 s of audio, changes and events by the size of a Firestore document
       (1 MB), so a crafted take is slow at worst, never endless.
   Whether a strum was the RIGHT chord is not measured here.
   `whatIf` (only when deps.strum is given; see micEvalStrumRule): the site's own
   strum rule replayed over the audio at the shared ratios older takes were graded with and at stricter ones
   (full-band 1.8 / 2.2 / 2.6, the HF ratio scaled the same), each replayed
   strum put back on the site's clock and matched to the changes the way ccLoop
   does. Per candidate: falseHitsRemoved (a false-hit change that no longer has a
   strum) and realLost (an agree change that no longer has one); `reproduced` =
   changes where the replay at that ratio hears what the site heard (the
   current-ratio row says how far the replay can be trusted). Measurement only.
   `strumRatio` { full, hf, saved }: the ratios the take was graded with (saved: from its own fields; else the
   shared ones, as every older take). `whatIfSkipped`: it was graded with other ratios than the replay starts
   from (Power Chord Switch's own: 2.2 / 2.67 from 2026-11-05, 1.8 / 2.19 from 2026-11-07), so it has no `whatIf`.
   `pitch` (null for a take saved before 2026-11-05, which has no expected[].readings):
   what "no readable pitch, no tick" would do, from the pitch readings each change's chord
   check had (coach.js ccResolvePend). The site grades a strum right on timing alone when it
   got under 3 readings; the rule would not tick those. Of the changes graded right: `withPitch`
   (3+ readings, kept) and `timingOnly` (under 3, would lose the tick); of those timing-only
   ones `realLost` are changes the recording agrees were strummed and `falseHitsRemoved` are
   false hits (noise, a chord left ringing). `falseHits` and `agree` are the same denominators
   as the strum what-if's. `unknown` = graded right with no usable readings list. A wrong
   verdict already needs 3+ readings, so the rule never touches those. Measurement only.
   Proved on synthetic takes with known answers: tools/mic-sim/fake-pw-take.mjs,
   checks.mjs 1cl. */
function micEvalTakePw(pcm, R, d, deps){
  const { x, N, env, nH, level, onsets, tone } = micEvalSignal(pcm, R, deps);
  const ms2s = ms => Math.round(ms / 1000 * R);
  const s2ms = s => s / R * 1000;
  const dB = v => 20 * Math.log10(Math.max(v, 1e-9));
  const r1 = v => v == null || !isFinite(v) ? null : Math.round(v * 10) / 10;
  const pct = (a, q) => { if (!a.length) return null; const b = Array.from(a).sort((p, q2) => p - q2); return b[Math.min(b.length - 1, Math.floor(q * b.length))]; };
  const med = a => pct(a, 0.5);
  const num = v => typeof v === 'number' && isFinite(v);
  const BPM_MIN = 10, BPM_MAX = 140, ROUNDS = 3, BPCS = [1, 2, 4];
  /* The most the site's grid moved for one strum (coach.js CC_GRID_STEP_CAP_MS): saved in the take since 2026-11-07 (ccRecMeta gridStepCapMs). A take without it
     was graded on the uncapped grid, so it is replayed uncapped, or the console would judge it on a grid the site did not use. */
  const gridCap = num(d.gridStepCapMs) && d.gridStepCapMs >= 0 && d.gridStepCapMs <= 10000 ? d.gridStepCapMs : Infinity;
  const endMs = s2ms(N);
  /* A change can fall long after the saved audio ends: the audio is capped at 30 s, and a 3-round song switch at
     BPM_MIN is 3 x (4 + 32 + 1) beats x 6 s = 666 s. Those are `dropped` (came after the recording stopped), not bad data. */
  const LATE_MS = ROUNDS * (4 + 8 * 4 + 1) * 60000 / BPM_MIN;
  const inSpan = t => num(t) && t >= -60000 && t <= endMs + LATE_MS;
  const lat = num(d.micLatencyMs) && Math.abs(d.micLatencyMs) <= 5000 ? d.micLatencyMs : 0;
  const bpc = BPCS.indexOf(d.bpc) >= 0 ? d.bpc : 0;
  const stageBpms = Array.isArray(d.stageBpms) ? d.stageBpms : [];
  const stageOf = o => o.stage == null ? 0 : o.stage;
  let ignored = 0, retimed = 0;
  const expected = [];
  (Array.isArray(d.expected) ? d.expected : []).forEach((e, k) => {
    if (!e || typeof e !== 'object') return;
    const st = stageOf(e);
    // a round whose tempo the student changed while playing (coach.js ccLiveBpm) has no single beat grid to replay: left out and counted as `retimed`, not as bad data
    if (e.retimed === true){ retimed++; return; }
    if (!bpc || !inSpan(e.t) || !Number.isInteger(st) || st < 0 || st >= ROUNDS){ ignored++; return; }
    expected.push({ e, k, stage: st });
  });
  const events = (Array.isArray(d.events) ? d.events : []).filter(ev => ev && typeof ev === 'object' && inSpan(ev.t));

  /* ── the rounds, from the changes' stages ── */
  const byStage = {};
  expected.forEach(c => { (byStage[c.stage] = byStage[c.stage] || []).push(c); });
  const rounds = [];
  Object.keys(byStage).map(Number).sort((a, b) => a - b).forEach(stage => {
    const list = byStage[stage].sort((a, b) => a.e.t - b.e.t);
    const bpm = Number(list[0].e.bpm) || Number(stageBpms[stage]) || Number(d.bpm) || 0;
    if (!(bpm >= BPM_MIN && bpm <= BPM_MAX)){ ignored += list.length; return; }
    const beat = 60000 / bpm;
    rounds.push({ stage, bpm, beat, list, listen: list[0].e.t - bpc * beat, win: Math.min(beat * bpc * 0.5, Math.max(220, beat * 0.5)), clicks: { found: false } });
  });

  /* ── each round's count-in ── */
  const CLICK_EACH = 4, CLICK_JITTER = 40;
  const halfS = ms2s(20), stepS = ms2s(4);
  const fOf = j => j === 3 ? 990 : 660;
  rounds.forEach(rd => {
    const B = ms2s(rd.beat), c1 = rd.listen - 4 * rd.beat;
    // each tone's background over this count-in only (the last round's chord may still ring into it)
    const bgA = Math.max(0, ms2s(c1 - 200)), bgB = Math.min(N, ms2s(rd.listen + 200));
    const bg = [660, 990].map(f => { const v = []; for (let s = bgA; s + 2 * halfS < bgB; s += ms2s(20)) v.push(tone(f, s + halfS, halfS)); return med(v) || 1e-9; });
    const bgOf = j => j === 3 ? bg[1] : bg[0];
    // beep 1's arrival: 100 ms early to 600 ms late on its schedule
    const lo = Math.max(ms2s(c1 - 100), -B + 1), hi = Math.min(ms2s(c1 + 600), N - 3 * B - 2 * halfS);
    let best = null;
    for (let c = lo; c <= hi; c += stepS){
      const k = [1, 2, 3].map(j => tone(fOf(j), c + j * B + halfS, halfS) / bgOf(j));
      const v = Math.min(...k);
      if (!best || v > best.v) best = { c, v, k };
    }
    if (!best) return;
    // each beep's onset: first 2 ms step where its tone passes half its own peak
    const onsetOf = j => {
      const f = fOf(j), c0 = best.c + j * B;
      let pk = 0; const prof = [];
      for (let s = c0 - ms2s(60); s < c0 + ms2s(100); s += ms2s(2)){ const v = tone(f, s, ms2s(5)); prof.push([s, v]); if (v > pk) pk = v; }
      const hit = prof.find(p => p[1] >= pk * 0.5);
      return s2ms(hit ? hit[0] : c0) - j * rd.beat;
    };
    const ons = [1, 2, 3].map(onsetOf);
    const jitter = Math.max(...ons) - Math.min(...ons);
    rd.clicks = { found: false, snrDb: r1(dB(best.v)), each: best.k.map(r1), jitterMs: r1(jitter) };
    if (best.k.every(v => v > CLICK_EACH) && jitter <= CLICK_JITTER){
      rd.clicks.found = true;
      rd.clicks.lagMs = r1(med(ons) - c1);
      rd.clicks.ampDb = r1(dB(Math.max(...[1, 2, 3].map(j => tone(fOf(j), best.c + j * B + halfS, halfS)))));
    }
  });

  /* ── the site's clock vs the recording's, from the strums it heard ── */
  const nearOnset = (ms, win) => {
    let b = null;
    for (const o of onsets){ const dd = Math.abs(o.ms - ms); if (dd <= win && (!b || dd < Math.abs(b.ms - ms))) b = o; }
    return b;
  };
  const maps = [];
  events.forEach(ev => { const o = nearOnset(ev.t + lat, 120); if (o) maps.push(ev.t + lat - o.ms); });
  const mapMs = maps.length >= 3 ? med(maps) : null;
  const lags = rounds.filter(rd => rd.clicks.found).map(rd => rd.clicks.lagMs);
  const takeLag = lags.length ? med(lags) : null;

  /* ── ccLoop's matching, replayed on the strums it heard ── */
  // evs = [{ t: played ms }] of one round, in time order; returns the strum each change took and the gridOffset after every strum
  const matchRound = (rd, evs) => {
    const at = rd.list.map(c => c.e.t - rd.listen);        // each change's c.beat * beatMs
    const match = rd.list.map(() => null);
    const timeline = [];                                    // [played, gridOffset after it]
    let goff = 0;
    evs.forEach(ev => {
      const rel = ev.t - rd.listen - goff;
      // the first open change within win of rel (the list is in time order; at most a few qualify)
      let lo = 0, hi = at.length;
      while (lo < hi){ const m = (lo + hi) >> 1; if (at[m] < rel - rd.win) lo = m + 1; else hi = m; }
      for (let k = lo, n = 0; k < at.length && at[k] <= rel + rd.win && n < 8; k++, n++){
        if (!match[k]){ match[k] = { t: ev.t, goff }; break; }
      }
      const dev = rel - Math.round(rel / rd.beat) * rd.beat;
      if (Math.abs(dev) < rd.beat * 0.5) goff += Math.max(-gridCap, Math.min(gridCap, dev * 0.25));
      timeline.push([ev.t, goff]);
    });
    return { match, timeline };
  };
  rounds.forEach(rd => {
    const evs = events.filter(ev => stageOf(ev) === rd.stage).sort((a, b) => a.t - b.t);
    const m = matchRound(rd, evs);
    rd.match = m.match; rd.timeline = m.timeline; rd.evs = evs;
  });

  /* ── every change: a strum where the site listened, against its verdict ── */
  const notes = [], judged = [];
  rounds.forEach((rd, rk) => {
    // the student's grid (the beeps): this round's, else the take's, else the setting less the map
    rd.offs = rd.clicks.found ? rd.clicks.lagMs : takeLag != null ? takeLag : (mapMs != null ? lat - mapMs : lat);
    rd.centre = mapMs != null ? 'site' : rd.clicks.found || takeLag != null ? 'beeps' : 'setting';
    rd.shift = rd.centre === 'site' ? lat - mapMs : rd.offs;       // recording ms = the site's played ms + shift
    const half = rd.win, gap = bpc * rd.beat, reach = Math.min(gap / 2, half + rd.beat / 4);
    const out = dd => Math.abs(dd) > half && Math.abs(dd) <= reach;
    rd.dropped = 0;
    rd.list.forEach(({ e, k }, idx) => {
      // the gridOffset the site judged this change with: its strum's, else the one after every strum before the window opened
      let goff = 0;
      if (rd.match[idx]) goff = rd.match[idx].goff;
      else for (const p of rd.timeline){ if (p[0] < e.t - half) goff = p[1]; else break; }
      const siteAt = e.t + goff;                            // the window's centre on the site's "played" clock
      const want = rd.centre === 'site' ? siteAt + lat - mapMs : e.t + rd.offs;
      if (want + half > endMs){ rd.dropped++; return; }
      let o = null;
      for (const on of onsets){ const dd = on.ms - want; if (Math.abs(dd) <= half && (!o || Math.abs(dd) < Math.abs(o.ms - want))) o = on; }
      const at = o ? o.ms : want;
      let pk = 0; for (let h = Math.floor(at / 5); h < Math.floor((at + 150) / 5) && h < nH; h++) if (h >= 0 && env[h] > pk) pk = env[h];
      const site = e.verdict === 'ok' ? 'right' : e.verdict === 'off' ? 'wrong' : 'miss';
      const heard = site !== 'miss';
      let cat = o ? (heard ? 'agree' : 'detector-missed') : heard ? 'false-hit' : 'silent-miss';
      if (cat === 'silent-miss'){
        const heardBeat = rd.clicks.found || takeLag != null ? e.t + rd.offs : null;
        if (onsets.some(on => out(on.ms - want) || (heardBeat != null && Math.abs(on.ms - want) > half && Math.abs(on.ms - heardBeat) <= reach)) ||
            rd.evs.some(ev => out(ev.t - siteAt))) cat = 'off-window';
      }
      judged.push({ rk, idx, cat, site, rn: Array.isArray(e.readings) ? e.readings.length : null, saved: 'readings' in e });
      notes.push({ i: num(e.i) ? e.i : k, stage: rd.stage, site, played: !!o, onsetMs: o ? r1(o.ms - want) : null,
        snrDb: r1(dB(pk) - level.floorDb), replay: o ? 'present' : 'none', siteHeard: !!rd.match[idx], gridOffsetMs: r1(goff), why: { cat } });
    });
  });
  /* ── pitch rule: "no readable pitch, no tick", from the readings the take saved (null for an older take) ── */
  let pitch = null;
  if (judged.some(j => j.saved)){
    const right = judged.filter(j => j.site === 'right'), known = right.filter(j => j.rn != null), low = list => list.filter(j => j.rn < 3);
    pitch = { right: right.length, withPitch: known.length - low(known).length, timingOnly: low(known).length, unknown: right.length - known.length,
      falseHits: judged.filter(j => j.cat === 'false-hit').length, agree: judged.filter(j => j.cat === 'agree').length,
      falseHitsRemoved: low(known.filter(j => j.cat === 'false-hit')).length, realLost: low(known.filter(j => j.cat === 'agree')).length };
  }
  /* ── what-if: the site's strum rule, replayed on the audio, at the shared ratios older takes were graded with and stricter ones ── */
  let whatIf = null;
  const rule = judged.length ? micEvalStrumRule(deps.strum) : null;
  /* The strum ratios this take was graded with: saved in the take from 2026-11-05 (coach.js ccRecMeta; Power Chord Switch uses its own, stricter
     ones), else the shared ones, which is what every older take was graded with. The what-if replays STRICTER ratios than the take's own, from the
     shared ones: a take graded with other ratios is left out of it (`whatIfSkipped`) rather than replayed as if it had been graded with those. */
  const sc = deps.strum && deps.strum.consts;
  const ratioOf = v => num(v) && v >= 1 && v <= 10 ? v : null;
  const ownFull = ratioOf(d.onsetRatio), ownHf = ratioOf(d.hfRatio);
  const strumRatio = ownFull && ownHf ? { full: ownFull, hf: ownHf, saved: true }
    : sc && Number(sc.RATIO) > 0 ? { full: Number(sc.RATIO), hf: Number(sc.HF_RATIO), saved: false } : null;
  const whatIfSkipped = !!(strumRatio && strumRatio.saved && sc && (Math.abs(strumRatio.full - Number(sc.RATIO)) > 1e-9 || Math.abs(strumRatio.hf - Number(sc.HF_RATIO)) > 1e-9));
  if (rule && !whatIfSkipped){
    const srcRate = num(d.srcSampleRate) && d.srcSampleRate >= 8000 && d.srcSampleRate <= 192000 ? d.srcSampleRate : 48000;
    const frameMs = num(d.frameMeanMs) && d.frameMeanMs > 0 ? Math.min(150, Math.max(1000 / 60, d.frameMeanMs)) : 50;
    const frames = micEvalStrumFrames(x, R, srcRate, frameMs, rule);
    // a round's play phase on the site's clock: from its listen start to the next round's count-in
    rounds.forEach((rd, k) => { rd.end = k + 1 < rounds.length ? rounds[k + 1].listen - 4 * rounds[k + 1].beat : Infinity; });
    const ratios = [rule.RATIO].concat([1.8, 2.2, 2.6].filter(v => v > rule.RATIO));
    const candidates = ratios.map(ratio => {
      const hfRatio = Math.round(rule.HF_RATIO * ratio / rule.RATIO * 100) / 100;
      const hits = micEvalStrumHits(frames, rule, ratio, hfRatio);
      const evsBy = rounds.map(() => []);
      hits.forEach(r => {
        for (let k = 0; k < rounds.length; k++){
          const p = r - rounds[k].shift;
          if (p >= rounds[k].listen && p < rounds[k].end){ evsBy[k].push({ t: p }); break; }
        }
      });
      const matches = rounds.map((rd, k) => matchRound(rd, evsBy[k]).match);
      const c = { ratio, hfRatio, strums: evsBy.reduce((a, l) => a + l.length, 0), judged: judged.length, reproduced: 0, falseHits: 0, falseHitsRemoved: 0, agree: 0, realLost: 0 };
      judged.forEach(j => {
        const fires = !!matches[j.rk][j.idx];
        if (fires === (j.site !== 'miss')) c.reproduced++;
        if (j.cat === 'false-hit'){ c.falseHits++; if (!fires) c.falseHitsRemoved++; }
        if (j.cat === 'agree'){ c.agree++; if (!fires) c.realLost++; }
      });
      return c;
    });
    whatIf = { frameMs: Math.round(frameMs * 10) / 10, srcRate, frames: frames.length, candidates };
  }
  const cnt = f => notes.filter(f).length;
  const roundRows = rounds.map(rd => {
    const ns = notes.filter(n => n.stage === rd.stage), c = cat => ns.filter(n => n.why.cat === cat).length;
    const out = { stage: rd.stage, bpm: rd.bpm, n: ns.length, dropped: rd.dropped, centre: rd.centre,
      agree: c('agree'), detectorMissed: c('detector-missed'), falseHit: c('false-hit'), offWindow: c('off-window'), silentMiss: c('silent-miss'),
      clickFound: rd.clicks.found, clickSnrDb: rd.clicks.snrDb == null ? null : rd.clicks.snrDb,
      clickLagMs: rd.clicks.found ? rd.clicks.lagMs : null, clickDiag: rd.clicks.each ? { each: rd.clicks.each, jitterMs: rd.clicks.jitterMs } : null,
      idealMs: null, skewMs: null };
    if (out.clickLagMs != null && mapMs != null){ out.idealMs = r1(out.clickLagMs + mapMs); out.skewMs = r1(out.clickLagMs + mapMs - lat); }
    return out;
  });
  const withClicks = rounds.filter(rd => rd.clicks.found);
  const snrs = (withClicks.length ? withClicks : rounds).map(rd => rd.clicks.snrDb).filter(v => v != null);
  const latency = { settingMs: lat, clickFound: withClicks.length > 0, clickSnrDb: snrs.length ? r1(med(snrs)) : null,
    clickAmpDb: withClicks.length ? r1(med(withClicks.map(rd => rd.clicks.ampDb))) : null,
    clickJitterMs: withClicks.length ? r1(med(withClicks.map(rd => rd.clicks.jitterMs))) : null,
    clickLagMs: r1(takeLag), mapMs: r1(mapMs), mapN: maps.length, clickDiag: null,
    roundsWithClicks: withClicks.length, rounds: rounds.length };
  if (takeLag != null && mapMs != null){
    latency.idealMs = r1(takeLag + mapMs);
    latency.skewMs = r1(takeLag + mapMs - lat);
  }
  const summary = {
    n: notes.length,
    siteRight: cnt(n => n.site === 'right'), siteWrong: cnt(n => n.site === 'wrong'), siteUnclear: 0, siteMiss: cnt(n => n.site === 'miss'),
    replayPresent: cnt(n => n.played),
    agree: cnt(n => n.why.cat === 'agree'),
    // the site said miss, but there is a strum in its window
    detectorMissed: cnt(n => n.why.cat === 'detector-missed'),
    // the site heard a strum (ok or off), its window in the recording has none
    falseHit: cnt(n => n.why.cat === 'false-hit'),
    // the site said miss: the strum was just outside its window (too early or late)
    offWindow: cnt(n => n.why.cat === 'off-window'),
    // the site said miss and nothing is near: not played
    silentMiss: cnt(n => n.why.cat === 'silent-miss'),
    dropped: rounds.reduce((a, rd) => a + rd.dropped, 0),
    ignored,
    retimed,
    replayMismatch: cnt(n => n.siteHeard !== (n.site !== 'miss')),
    siteRightReplayNot: cnt(n => n.site === 'right' && !n.played),
    offPitch: {}, unclearSiteReadings: null, presentSiteReadings: null, secondLook: 0, lookWould: 0, lookWouldPresent: 0,
    why: notes.reduce((h, n) => { h[n.why.cat] = (h[n.why.cat] || 0) + 1; return h; }, {}),
    octDominant: 0,
    medianSnrDb: r1(med(notes.filter(n => n.played && n.snrDb != null).map(n => n.snrDb))),
    medianCents: null,
    medianAbsOnsetMs: r1(med(notes.filter(n => n.onsetMs != null).map(n => Math.abs(n.onsetMs)))),
    lowH1H2Db: null, lowN: 0
  };
  // strums and beeps on no beat of the student's grid (other guitars, noise); at most every beat of every change
  const grid = [];
  rounds.forEach(rd => {
    const last = rd.list[rd.list.length - 1].e.t, tol = Math.max(150, rd.beat * 0.35), maxM = rd.list.length * bpc + 4;
    for (let m = -4; m <= maxM && rd.listen + m * rd.beat <= last + (bpc - 0.5) * rd.beat; m++) grid.push([rd.listen + m * rd.beat + rd.offs, tol]);
  });
  const extra = onsets.filter(on => !grid.some(g => Math.abs(g[0] - on.ms) < g[1])).length;
  const startMs = rounds.length ? rounds[0].listen - 4 * rounds[0].beat + rounds[0].offs : 0;
  const playMs = Math.max(1, endMs - startMs);
  return {
    kind: 'pw', level, latency, notes: summary, perNote: notes, rounds: roundRows, whatIf, whatIfSkipped, strumRatio, pitch,
    room: { extraOnsetsPerMin: Math.round(extra / playMs * 60000), extra, onsets: onsets.length }
  };
}

// The device, from what the take recorded about itself.
/* The download is "no names", but a Bluetooth mic is often labelled with
   its owner's ("Maria's AirPods", or Spanish-style "AirPods de María") —
   keep the device, drop the owner. The Spanish strip needs a CAPITALISED
   word after "de" (case-sensitive, no i flag): Windows' own Spanish labels
   use a lower-case "de" phrase ("Matriz de micrófonos (Realtek…)") that is
   the device, not a person. A trailing "(…)" device note is kept. EVERY
   such run goes (g flag): macOS in Spanish labels a mic "Micrófono de
   MacBook Pro de José Luis", and stripping only the first run left the
   owner's name behind. The cost is "MacBook Pro" too — a capitalised
   "de X" can't be told from a name. */
function micEvalMicName(label){
  return String(label || '')
    .replace(/^.*?['’]s\s+/i, '')
    .replace(/\s+de\s+\p{Lu}[^\s()]*(?:\s+\p{Lu}[^\s()]*)*/gu, '');
}
function micEvalDevice(d){
  const ua = String(d.userAgent || '');
  const cros = ua.match(/CrOS \S+ ([\d.]+)/), chrome = ua.match(/Chrome\/(\d+)/);
  const os = cros ? 'ChromeOS ' + cros[1] : /Windows/.test(ua) ? 'Windows' : /iPad|iPhone/.test(ua) ? 'iOS' : /Mac OS X/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /Linux/.test(ua) ? 'Linux' : '?';
  return { os, chromebook: !!cros, chrome: chrome ? +chrome[1] : null, micLabel: micEvalMicName(d.micLabel), srcRate: d.srcSampleRate || null };
}

/* One take -> one row: device + game + the analysis. No names, no uid —
   this row is what leaves the teacher's machine. */
function micEvalRow(label, d, pcm, deps){
  const a = d.mode === 'pw' ? micEvalTakePw(pcm, d.sampleRate || 24000, d, deps) : micEvalTake(pcm, d.sampleRate || 24000, d, deps);
  return Object.assign({
    take: label, period: d.period || '', savedAt: d.savedAt || null,
    game: d.mode === 'nr' ? 'Note Runner L' + ((d.level | 0) + 1) + (d.chords ? ' chords' : '') : d.mode === 'pw' ? 'Switch ' + (d.progression || '') : 'Coach ' + (d.coachMode || ''),
    bpm: d.bpm || null, durationSec: d.durationSec || null, lang: d.lang || '',
    device: micEvalDevice(d), frame: { meanMs: d.frameMeanMs == null ? null : d.frameMeanMs, maxMs: d.frameMaxMs == null ? null : d.frameMaxMs }
  }, a);
}

/* The strum what-if (micEvalTakePw `whatIf`), summed: one line per Power Chord
   Switch take, one column per candidate ratio, and the totals. Used by the
   console table, the download and the terminal. No names: the take labels only. */
function micEvalWhatIfSummary(rows){
  const pw = rows.filter(r => r.kind === 'pw' && r.whatIf && r.whatIf.candidates && r.whatIf.candidates.length);
  if (!pw.length) return null;
  const skipped = rows.filter(r => r.kind === 'pw' && r.whatIfSkipped).length;
  const cands = pw[0].whatIf.candidates.map(c => ({ ratio: c.ratio, hfRatio: c.hfRatio }));
  const same = pw.filter(r => r.whatIf.candidates.length === cands.length && r.whatIf.candidates.every((c, k) => c.ratio === cands[k].ratio && c.hfRatio === cands[k].hfRatio));
  const sum = (list, k, f) => list.reduce((a, r) => a + (r.whatIf.candidates[k][f] || 0), 0);
  const per = (r, k) => { const c = r.whatIf.candidates[k]; return { falseHitsRemoved: c.falseHitsRemoved, realLost: c.realLost, reproduced: c.reproduced, strums: c.strums }; };
  return {
    skipped,
    candidates: cands,
    takes: same.map(r => ({ take: r.take, game: r.game, frameMs: r.whatIf.frameMs, judged: r.whatIf.candidates[0].judged,
      falseHits: r.whatIf.candidates[0].falseHits, agree: r.whatIf.candidates[0].agree, perCandidate: cands.map((c, k) => per(r, k)) })),
    totals: { takes: same.length, judged: sum(same, 0, 'judged'), falseHits: sum(same, 0, 'falseHits'), agree: sum(same, 0, 'agree'),
      perCandidate: cands.map((c, k) => ({ falseHitsRemoved: sum(same, k, 'falseHitsRemoved'), realLost: sum(same, k, 'realLost'), reproduced: sum(same, k, 'reproduced') })) }
  };
}
function micEvalWhatIfText(rows){
  const w = micEvalWhatIfSummary(rows);
  const sk = rows.filter(r => r.kind === 'pw' && r.whatIfSkipped), skRatios = [...new Set(sk.map(r => r.strumRatio ? r.strumRatio.full + ' / ' + r.strumRatio.hf : '?'))].join(' and ');
  const skNote = !sk.length ? '' : `${sk.length} Power Chord Switch ${sk.length === 1 ? 'take was' : 'takes were'} graded with strum ratios ${skRatios}, not the shared ones the strum what-if starts from, so ${sk.length === 1 ? 'it is' : 'they are'} left out of it.`;
  if (!w) return skNote ? '\n\nStrum what-if: ' + skNote : '';
  const pad = (v, n) => { const t = v == null ? '-' : String(v); return t.length >= n ? t : t + ' '.repeat(n - t.length); };
  const head = [pad('take', 5), pad('false', 6), pad('agree', 6)].concat(w.candidates.map(c => pad('x' + c.ratio + '/' + c.hfRatio, 14))).join(' ');
  const line = (label, f, a, cs) => [pad(label, 5), pad(f, 6), pad(a, 6)].concat(cs.map(c => pad('-' + c.falseHitsRemoved + ' / lost ' + c.realLost, 14))).join(' ');
  return '\n\nStrum what-if (measurement only, the game does not change): the site\'s own strum rule replayed on each Power Chord Switch recording at the shared ratios (first column) and stricter ones, full-band ratio / HF ratio. Takes graded with other ratios are not in it.\n' +
    [head].concat(w.takes.map(t => line(t.take, t.falseHits, t.agree, t.perCandidate)), line('all', w.totals.falseHits, w.totals.agree, w.totals.perCandidate)).join('\n') + `

false       changes the site graded right or wrong where the recording has no strum
agree       changes the site and the recording agree were strummed
-N          of the false hits, N would not fire at that ratio (no strum left in the window)
lost M      of the agree changes, M would no longer fire (a real strum, now too soft for the rule)
The first column is the shared ratios these takes were graded with: ${w.totals.perCandidate[0].reproduced} of ${w.totals.judged} changes get the same yes/no there as the site gave (the replay's own error: its frame times and sample rate are assumed).` + (skNote ? '\n' + skNote : '');
}

/* The pitch rule (micEvalTakePw `pitch`), summed: one line per Power Chord Switch take that saved its readings, and the totals. Takes saved before
   2026-11-05 have none: `without` counts them. Used by the console table, the download and the terminal. No names: the take labels only. */
function micEvalPitchSummary(rows){
  const pw = rows.filter(r => r.kind === 'pw'), has = pw.filter(r => r.pitch);
  if (!has.length) return null;
  const F = ['right', 'withPitch', 'timingOnly', 'unknown', 'falseHits', 'agree', 'falseHitsRemoved', 'realLost'];
  const pick = p => { const o = {}; F.forEach(k => { o[k] = p[k] || 0; }); return o; };
  const totals = { takes: has.length }; F.forEach(k => { totals[k] = has.reduce((a, r) => a + (r.pitch[k] || 0), 0); });
  return { rule: 'a change the site graded right on timing alone (under 3 pitch readings) would not be ticked', without: pw.length - has.length,
    takes: has.map(r => Object.assign({ take: r.take, game: r.game }, pick(r.pitch))), totals };
}
function micEvalPitchText(rows){
  const w = micEvalPitchSummary(rows);
  if (!w) return '';
  const pad = (v, n) => { const t = v == null ? '-' : String(v); return t.length >= n ? t : t + ' '.repeat(n - t.length); };
  const line = (label, t) => [pad(label, 5), pad(t.right, 6), pad(t.withPitch, 6), pad(t.timingOnly, 7), pad(t.falseHits, 6), pad(t.agree, 6), pad('-' + t.falseHitsRemoved + ' / lost ' + t.realLost, 14)].join(' ');
  const head = [pad('take', 5), pad('right', 6), pad('tone', 6), pad('timing', 7), pad('false', 6), pad('agree', 6), pad('no pitch, no tick', 14)].join(' ');
  return '\n\nPitch-rule what-if (measurement only, the game does not change): "no readable pitch, no tick" = a change the site graded right on timing alone (under 3 pitch readings) would not count. From the readings each take saved' +
    (w.without ? `; ${w.without} Power Chord Switch ${w.without === 1 ? 'take has' : 'takes have'} none (saved before 2026-11-05) and ${w.without === 1 ? 'is' : 'are'} left out` : '') + '.\n' +
    [head].concat(w.takes.map(t => line(t.take, t)), line('all', w.totals)).join('\n') + `

right       changes the site graded right
tone        of those, 3 or more pitch readings (the rule keeps them)
timing      of those, under 3 readings: they passed on timing alone (the rule would not tick them)
false       changes the site graded where the recording has no strum (counted as in the strum what-if)
agree       changes the site and the recording agree were strummed (counted as in the strum what-if)
-N          of the false hits, N were graded right on timing alone: the rule would remove those ticks
lost M      of the agree changes, M were graded right on timing alone: real strums that would lose their tick${w.totals.unknown ? `
${w.totals.unknown} changes graded right have no usable readings list and are in none of those counts.` : ''}`;
}

// A plain-text table of the rows, for the console / terminal.
function micEvalText(rows){
  const pad = (v, w) => { const s = v == null ? '-' : String(v); return s.length >= w ? s.slice(0, w) : s + ' '.repeat(w - s.length); };
  const cols = [['take', 5], ['per', 4], ['game', 16], ['os', 18], ['mic', 22], ['fps', 4], ['floor', 6], ['loud', 6], ['clip%', 5],
    ['click', 6], ['lag', 5], ['ideal', 6], ['skew', 5], ['right', 6], ['inAud', 6], ['detMiss', 7], ['silent', 6], ['oct', 4], ['snr', 5], ['cents', 5], ['h1h2', 5], ['xtra/m', 6]];
  const head = cols.map(c => pad(c[0], c[1])).join(' ');
  const lines = rows.map(r => [
    r.take, r.period, r.game, r.device.os, r.device.micLabel, r.frame.meanMs ? Math.round(1000 / r.frame.meanMs) : null,
    r.level.floorDb, r.level.loudDb, r.level.clipPct,
    r.latency.clickFound ? r.latency.clickSnrDb : 'none', r.latency.clickLagMs, r.latency.idealMs, r.latency.skewMs,
    r.notes.siteRight + '/' + r.notes.n, r.notes.replayPresent + '/' + r.notes.n, r.notes.detectorMissed, r.notes.silentMiss, r.notes.octDominant,
    r.notes.medianSnrDb, r.notes.medianCents, r.notes.lowH1H2Db, r.room.extraOnsetsPerMin
  ].map((v, k) => pad(v, cols[k][1])).join(' '));
  // Power Chord Switch rows (micEvalTakePw) get a second table, one line per round
  const pw = rows.filter(r => r.kind === 'pw');
  const pwCols = [['take', 5], ['game', 16], ['round', 5], ['bpm', 4], ['chg', 4], ['agree', 5], ['detMiss', 7], ['false', 5], ['offWin', 6], ['silent', 6], ['drop', 4],
    ['centre', 7], ['click', 6], ['lag', 5], ['ideal', 6], ['skew', 6], ['map', 5]];
  const pwOdd = pw.filter(r => r.notes.ignored || r.notes.retimed || r.notes.replayMismatch).map(r => r.take + ': ' +
    [r.notes.ignored ? r.notes.ignored + (r.notes.ignored === 1 ? ' change' : ' changes') + ' ignored (impossible time, round or tempo in the saved data)' : '',
      r.notes.retimed ? r.notes.retimed + (r.notes.retimed === 1 ? ' change' : ' changes') + ' left out (the student changed the tempo while playing)' : '',
      r.notes.replayMismatch ? r.notes.replayMismatch + (r.notes.replayMismatch === 1 ? ' change' : ' changes') + " where the site's rule, run again on its own strums, does not give its saved verdict" : ''].filter(Boolean).join('; '));
  const pwText = !pw.length ? '' : '\n\nPower Chord Switch, one line per round (in the table above, its "notes" are chord changes; inAud = a strum in the site\'s window):\n' +
    [pwCols.map(c => pad(c[0], c[1])).join(' ')].concat(...pw.map(r => (r.rounds || []).map(g => [
      r.take, r.game, g.stage + 1, g.bpm, g.n, g.agree, g.detectorMissed, g.falseHit, g.offWindow, g.silentMiss, g.dropped,
      g.centre, g.clickFound ? g.clickSnrDb : 'none', g.clickLagMs, g.idealMs, g.skewMs, r.latency.mapMs
    ].map((v, k) => pad(v, pwCols[k][1])).join(' ')))).concat(pwOdd).join('\n') + `

chg         changes judged (the site's verdict against the recording)
agree       the site heard a strum (right or wrong chord) and there is one in its window
detMiss     the site said no strum, but there is one in its window
false       the site heard a strum, but its window in the recording has none (a chord left ringing, noise)
offWin      the site said no strum; one is just outside its window, or near the beat the student heard (early, late, or the delay setting is off)
silent      no strum near the change (not played, or further off)
drop        changes past the end of the recording (the 30 s cap, or Stop): not judged
centre      where the site's window was put on the recording: site = its own beat, replayed from the strums it heard
            (needs 3 strums found in the audio); beeps = the count-in's lag; setting = the delay setting alone
click/lag/ideal/skew  as above, from this round's own count-in ("none": speaker muted, headphones, or strums over the count-in);
            map = the site's clock vs the recording's, whole take`;
  return [head].concat(lines).join('\n') + `

floor/loud  raw mic level, dBFS (10th / 99th percentile of 20 ms windows)
click       count-in beeps found in the recording: how far above the background (dB); "none" = speaker muted or headphones
lag         where the beeps landed vs when they were scheduled (ms)
ideal       the mic-delay setting that would score an on-the-click note dead on the beat (ms)
skew        what the site did to an on-the-click note with the student's actual setting (+ = called it late)
right       notes the site counted right / notes expected
inAud       notes the replay (site's own filters + YIN) finds clearly in the audio
detMiss     site said not-right, but the note is loud and clearly in the audio
silent      site said miss/unclear, no pick attack near the note and the note isn't ringing (not played)
oct         notes where the octave above outvoted the real note
snr         median note level above the room floor (dB)
cents       median tuning of the notes heard (cents off the written note)
h1h2        low-string notes: fundamental vs 2nd harmonic (dB; very negative = the mic loses the low end)
xtra/m      onsets per minute that are not near any expected note (other guitars, noise)` + pwText + micEvalWhatIfText(rows) + micEvalPitchText(rows);
}

/* "Evaluate all recordings": every take through micEvalRow with the site's
   own coachDetectPitch / COACH_PITCH_GATE / COACH_MIC_GAIN (coach.js, loaded
   on demand). Names show on this screen only; "Download results" is the
   rows alone — no audio, no names (takes are T01, T02…). */
let teacherMicEvalRows = [], teacherMicEvalNames = [];
async function teacherMicEvaluate(){
  const box = document.getElementById('t-mic-eval');
  if(!box) return;
  try{ await ensureCoachJs(); }
  catch(e){ box.innerHTML = '<div class="t-loading">Could not load the listening code — check your connection and try again.</div>'; return; }
  const deps = { detectPitch: coachDetectPitch, GATE: COACH_PITCH_GATE, GAIN: COACH_MIC_GAIN,
    ATTACK_SKIP: COACH_ATTACK_SKIP, EVENT_TAIL: COACH_EVENT_TAIL, REFRACT: COACH_ONSET_REFRACT,
    MATCH_FRAC: COACH_MATCH_FRAC, MATCH_MIN_MS: COACH_MATCH_MIN_MS, VOTE_TOL: COACH_VOTE_TOL,
    // the site's own strum rule, for the what-if (micEvalStrumRule): its constants and the text of the three functions, read at run time
    strum: { consts: { FLOOR: CHK_ONSET_FLOOR, RATIO: CHK_ONSET_RATIO, HF_FLOOR: CHK_HF_FLOOR, HF_RATIO: CHK_HF_RATIO, REFRACT: COACH_ONSET_REFRACT,
      WIN: COACH_LVL_WIN, HOP: COACH_LVL_HOP, CATCHUP: COACH_CATCHUP_MAX_MS }, ccLoopSrc: String(ccLoop), readFrameSrc: String(coachReadFrame), smoothSrc: String(coachSmooth) } };
  /* Every take: micEvalRow measures a Power Chord Switch take with micEvalTakePw (strums against the site's verdicts), the rest with micEvalTake. */
  const takes = teacherMicTakes.slice();
  const rows = [], names = [], fails = [];
  for(let k = 0; k < takes.length; k++){
    const d = takes[k], label = 'T' + String(k + 1).padStart(2, '0');
    const live = document.getElementById('t-mic-eval');
    if(teacherView !== 'mic' || !live) return;      // left the view: stop
    live.innerHTML = `<div class="t-loading">Measuring recording ${k + 1} of ${takes.length}…</div>`;
    try{
      const parts = await teacherMicChunks(d);
      const len = parts.reduce((a, p) => a + p.length, 0);
      const bytes = new Uint8Array(len); let o = 0;
      parts.forEach(p => { bytes.set(p, o); o += p.length; });
      const saved = micTakeDate(d);
      const meta = Object.assign({}, d, { savedAt: saved ? saved.toISOString() : null });
      rows.push(micEvalRow(label, meta, new Int16Array(bytes.buffer, 0, len >> 1), deps));
      names.push(d.name || (d.uid || '').slice(0, 8));
    }catch(e){ fails.push((d.name || label) + ': ' + (e && e.message ? e.message : 'could not read')); }
    await new Promise(r => setTimeout(r, 0));          // let the screen update between takes
  }
  teacherMicEvalRows = rows; teacherMicEvalNames = names;
  const live = document.getElementById('t-mic-eval');
  if(live) live.innerHTML = teacherMicEvalHtml() + (fails.length ? `<div class="tg-note">Could not measure: ${escHtml(fails.join('; '))}</div>` : '');
}
function teacherMicEvalHtml(){
  const rows = teacherMicEvalRows;
  if(!rows.length) return '<div class="t-loading">No recordings to measure.</div>';
  const med = a => { const b = a.filter(v => v != null && isFinite(v)).sort((p, q) => p - q), h = b.length >> 1; return !b.length ? null : b.length % 2 ? b[h] : Math.round((b[h - 1] + b[h]) * 5) / 10; };
  // Power Chord Switch rows (micEvalTakePw) count chord changes, not notes: their own lines below
  const noteRows = rows.filter(r => r.kind !== 'pw'), pwRows = rows.filter(r => r.kind === 'pw');
  const sum = f => noteRows.reduce((a, r) => a + (f(r) || 0), 0);
  const n = sum(r => r.notes.n), right = sum(r => r.notes.siteRight), inAud = sum(r => r.notes.replayPresent);
  const detMiss = sum(r => r.notes.detectorMissed), silent = sum(r => r.notes.silentMiss);
  const withClicks = rows.filter(r => r.latency.idealMs != null);
  const cbooks = rows.filter(r => r.device.chromebook).length;
  const clipped = rows.filter(r => r.level.clipPct > 0.01).length;
  const v = x => x == null ? '—' : escHtml(String(x));
  const lines = [`${rows.length} recordings, ${cbooks} of them on a Chromebook.`];
  if(noteRows.length) lines.push(
    `The site counted <b>${right}</b> of ${n} notes right. The notes are clearly in the recordings for <b>${inAud}</b> of ${n}.`,
    `<b>${detMiss}</b> ${detMiss === 1 ? 'note was' : 'notes were'} clearly played and loud, but the site did not count ${detMiss === 1 ? 'it' : 'them'} right. <b>${silent}</b> missed ${silent === 1 ? 'note was' : 'notes were'} not played at all.` +
    (sum(r => r.notes.dropped) ? ` ${sum(r => r.notes.dropped)} more ${sum(r => r.notes.dropped) === 1 ? 'note' : 'notes'} came after the recording stopped (30 seconds, or Stop) and ${sum(r => r.notes.dropped) === 1 ? 'was' : 'were'} not checked.` : ''));
  if(pwRows.length){
    const pw = f => pwRows.reduce((a, r) => a + (f(r) || 0), 0);
    const pn = pw(r => r.notes.n), agree = pw(r => r.notes.agree), pMiss = pw(r => r.notes.detectorMissed);
    const pFalse = pw(r => r.notes.falseHit), pSilent = pw(r => r.notes.silentMiss), pDrop = pw(r => r.notes.dropped);
    const pOff = pw(r => r.notes.offWindow), pIgn = pw(r => r.notes.ignored), pRet = pw(r => r.notes.retimed), pOdd = pw(r => r.notes.replayMismatch);
    lines.push(`Power Chord Switch: ${pn} chord ${pn === 1 ? 'change' : 'changes'} in ${pwRows.length} ${pwRows.length === 1 ? 'recording' : 'recordings'}` +
      (pDrop ? ` (${pDrop} more came after the recording stopped, at 30 seconds or at Stop, and ${pDrop === 1 ? 'was' : 'were'} not checked)` : '') +
      (pIgn ? ` (${pIgn} more ${pIgn === 1 ? 'was' : 'were'} left out: the saved time, round or tempo is impossible)` : '') +
      (pRet ? ` (${pRet} more ${pRet === 1 ? 'was' : 'were'} left out: the student changed the tempo while playing)` : '') +
      `. The site and the recording agree on <b>${agree + pSilent}</b> of ${pn} (${agree} strummed where the site listened, ${pSilent} not played). ` +
      `<b>${pOff}</b> ${pOff === 1 ? 'was' : 'were'} strummed just outside the site's window (early, late, or the delay setting is off), so the site said missed. ` +
      `<b>${pMiss}</b> ${pMiss === 1 ? 'strum is' : 'strums are'} where the site listened, but the site heard no strum there. ` +
      `On <b>${pFalse}</b> ${pFalse === 1 ? 'change' : 'changes'} the site heard a strum that is not in the recording (a chord left ringing, or noise).` +
      (pOdd ? ` On ${pOdd} ${pOdd === 1 ? 'change' : 'changes'} the site's own rule, run again on the strums it heard, does not give the verdict it saved.` : ''));
  }
  lines.push(
    withClicks.length
      ? `Mic delay: the count-in beeps were heard in ${withClicks.length} recordings. The delay setting in use was ${v(med(withClicks.map(r => r.latency.settingMs)))} ms; the recordings say it should be about <b>${v(med(withClicks.map(r => r.latency.idealMs)))} ms</b>.`
      : `Mic delay: the count-in beeps were not heard in any recording (speaker muted or headphones${pwRows.length ? ', or in Power Chord Switch strumming over the count-in' : ''}), so the delay could not be measured.`,
    `Loudest notes: ${v(med(rows.map(r => r.level.loudDb)))} dB (0 is the maximum). ${clipped ? `<b>${clipped}</b> recordings were too loud and clipped.` : 'None clipped.'}`
  );
  // micEvalWhy's categories, summed — why the notes the site did not count weren't counted
  const why = k => sum(r => (r.notes.why || {})[k]);
  const notCounted = n - right - why('wrong');
  if(notCounted > 0){
    lines.push(`Why ${notCounted} ${notCounted === 1 ? 'note was' : 'notes were'} not counted (unclear or missed): ` +
      `<b>${why('readings-cut')}</b> heard, but fewer than 2 pitch readings in the time the site listens to each note · ` +
      `<b>${why('onset-elsewhere')}</b> heard, but too far off the beat or taken by another note · ` +
      `<b>${why('no-onset')}</b> no pluck heard at all · ` +
      `<b>${why('vote-failed')}</b> enough readings, but they did not agree on the note.`);
  }
  const looked = sum(r => r.notes.secondLook);
  if(looked) lines.push(`<b>${looked}</b> ${looked === 1 ? 'note was' : 'notes were'} counted right by the second look (the site listened a little longer to a note it could not read at first).`);
  const tr = rows.map((r, i) => {
    const nb = r.notes, L = r.latency, isPw = r.kind === 'pw';
    // a Power Chord Switch row: each round's own "should be" and where its windows were put, on hover; the strums the site heard that the
    // recording does not have; the strums just outside the site's window
    const placed = { site: "the site's own beat", beeps: 'the beeps', setting: 'the delay setting alone' };
    const perRound = isPw ? ` title="${escAttr((r.rounds || []).map(g => 'Round ' + (g.stage + 1) + ': ' +
      (g.idealMs != null ? 'should be ' + g.idealMs + ' ms' : g.clickFound ? 'beeps found, delay not measured' : 'no beeps found (speaker muted, headphones, or strums over the count-in)') +
      '; windows placed by ' + (placed[g.centre] || '?')).join(' · '))}"` : '';
    const falseHit = isPw && nb.falseHit ? ` · <b>${nb.falseHit}</b> heard, not there` : '';
    const offWin = isPw && nb.offWindow ? ` · <b>${nb.offWindow}</b> off the beat` : '';
    return `<tr><td class="nc" title="${escAttr(teacherMicEvalNames[i] || '')}">${escHtml(r.take + ' · ' + (teacherMicEvalNames[i] || ''))}</td>`+
      `<td>${escHtml(r.game)}</td><td title="${escAttr(r.device.micLabel)}">${escHtml(r.device.chromebook ? 'Chromebook' : r.device.os)}</td>`+
      `<td>${v(r.level.loudDb)} / ${v(r.level.floorDb)}${r.level.clipPct > 0.01 ? ' <b>clipped</b>' : ''}</td>`+
      `<td${perRound}>${L.clickFound ? v(L.settingMs) + ' → ' + v(L.idealMs) : v(L.settingMs) + ' → ?'}</td>`+
      `<td>${nb.siteRight} / ${nb.n}</td><td>${nb.replayPresent} / ${nb.n}${falseHit}</td><td>${nb.detectorMissed}${offWin}</td><td>${nb.silentMiss}</td>`+
      `<td>${teacherMicOffText(nb.offPitch)}</td><td>${v(nb.lowH1H2Db)}</td></tr>`;
  }).join('');
  return `<div class="tg-note" style="margin-top:8px">${lines.join('<br>')}</div>
    <div class="t-grid-wrap"><table><thead><tr><th class="nc">Take</th><th>Game</th><th>Device</th><th>Loud / room (dB)</th><th>Delay set → should be (ms)</th><th>Site counted right</th><th>In the recording</th><th>Played, not counted</th><th>Not played</th><th>Heard instead</th><th>Low strings (dB)</th></tr></thead><tbody>${tr}</tbody></table></div>${teacherMicWhatIfHtml(rows)}${teacherMicPitchHtml(rows)}
    <div class="tg-note"><button class="tp-btn primary" style="flex:none;padding:8px 16px;margin-right:10px" onclick="teacherMicEvalDownload()">Download results</button>
      The file has the measurements only — no audio and no names. <br>
      <i>In the recording</i>: the site's own pitch detection, run again on the saved audio, finds the note clearly. <i>Played, not counted</i>: a loud, clear note the site did not count right. <i>Not played</i>: the site said missed and there is no note there. <i>Heard instead</i>: notes that rang clearly but at a different pitch — "−1 ×6" means six notes came out one semitone low (the same number again and again usually means the guitar is out of tune). <i>Delay</i>: "?" means the count-in beeps were not in the recording (speaker muted or headphones). <i>Low strings</i>: the low note's own pitch against the octave above it — very negative means this mic loses the low end.${pwRows.length ? `<br>
      <i>Power Chord Switch</i> rows count chord changes, not notes. <i>In the recording</i>: a strum inside the site's own window for the change (about half a beat around the beat as the site was tracking it; which chord was strummed is not checked); "heard, not there": the site heard a strum its window in the recording does not have. <i>Played, not counted</i>: a strum in the site's window that the site did not hear; "off the beat": a strum just outside the window, or near the beat the student heard, so the site said missed (played early or late, or the delay setting is off). <i>Not played</i>: no strum near the change. <i>Delay</i>: hover it to see each round's, and how its windows were placed; "no beeps found" can also mean the student strummed over the count-in.` : ''}</div>`;
}
/* The strum what-if as a small table (micEvalWhatIfSummary): per Power Chord Switch take and ratio, "-N" false hits that would not fire and "lost M" real strums that would stop firing. */
function teacherMicWhatIfHtml(rows){
  const w = micEvalWhatIfSummary(rows);
  const sk = rows.filter(r => r.kind === 'pw' && r.whatIfSkipped), skRatios = [...new Set(sk.map(r => r.strumRatio ? r.strumRatio.full + ' / ' + r.strumRatio.hf : '?'))].join(' and ');
  const skNote = !sk.length ? '' : `${sk.length} Power Chord Switch ${sk.length === 1 ? 'take was' : 'takes were'} graded with strum ratios ${escHtml(skRatios)}, not the shared ones the strum what-if starts from, so ${sk.length === 1 ? 'it is' : 'they are'} left out of it.`;
  if(!w) return skNote ? `<div class="tg-note" style="margin-top:10px"><b>Strum what-if</b> — ${skNote}</div>` : '';
  const cell = c => `<td>−${c.falseHitsRemoved} · lost ${c.realLost}</td>`;
  const body = w.takes.map(t => `<tr><td class="nc wf">${escHtml(t.take)}</td><td>${t.falseHits}</td><td>${t.agree}</td>${t.perCandidate.map(cell).join('')}</tr>`).join('') +
    `<tr><td class="nc wf"><b>All ${w.totals.takes}</b></td><td><b>${w.totals.falseHits}</b></td><td><b>${w.totals.agree}</b></td>${w.totals.perCandidate.map(c => `<td><b>−${c.falseHitsRemoved} · lost ${c.realLost}</b></td>`).join('')}</tr>`;
  const t0 = w.totals.perCandidate[0];
  return `<div class="tg-note" style="margin-top:10px"><b>Strum what-if</b> (measurement only; the game does not change). The site's own strum rule, run again on each Power Chord Switch recording at the shared ratio it was graded with and at stricter ones. Takes graded with other ratios are left out.
    <i>−N</i>: false hits (the site heard a strum the recording does not have) that would no longer fire. <i>lost M</i>: real strums (the site and the recording agree) that would stop firing.</div>
    <div class="t-grid-wrap"><table><thead><tr><th class="nc">Take</th><th>False hits</th><th>Real strums</th>${w.candidates.map((c, k) => `<th>${k ? 'Ratio' : 'Shared ratio'} ${c.ratio} (HF ${c.hfRatio})</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>
    <div class="tg-note">At the shared ratio these takes were graded with, the replay gives the same yes/no as the site on ${t0.reproduced} of ${w.totals.judged} changes; the rest is the replay's own error (it assumes steady frame times and the 48 kHz rate).${skNote ? ' ' + skNote : ''}</div>`;
}
/* The pitch rule as a small table (micEvalPitchSummary), under the strum what-if: per Power Chord Switch take that saved its readings, how many changes the
   site graded right with 3+ readings and on timing alone, and what "no readable pitch, no tick" would remove or cost. */
function teacherMicPitchHtml(rows){
  const w = micEvalPitchSummary(rows);
  if(!w) return '';
  const cells = t => `<td>${t.right}</td><td>${t.withPitch}</td><td>${t.timingOnly}</td><td>${t.falseHits}</td><td>${t.agree}</td>`;
  const body = w.takes.map(t => `<tr><td class="nc wf">${escHtml(t.take)}</td>${cells(t)}<td>−${t.falseHitsRemoved} · lost ${t.realLost}</td></tr>`).join('') +
    `<tr><td class="nc wf"><b>All ${w.totals.takes}</b></td>${cells(w.totals).replace(/<td>(\d+)<\/td>/g, '<td><b>$1</b></td>')}<td><b>−${w.totals.falseHitsRemoved} · lost ${w.totals.realLost}</b></td></tr>`;
  return `<div class="tg-note" style="margin-top:10px"><b>Pitch-rule what-if</b> (measurement only; the game does not change). "No readable pitch, no tick": a change the site graded right on timing alone, with under 3 pitch readings, would not count.
    <i>−N</i>: false hits that were graded right on timing alone, so their ticks would go. <i>lost M</i>: real strums (the site and the recording agree) that were graded right on timing alone and would lose their tick.${w.without ? ` ${w.without} Power Chord Switch ${w.without === 1 ? 'take has' : 'takes have'} no readings (saved before 2026-11-05) and ${w.without === 1 ? 'is' : 'are'} left out.` : ''}</div>
    <div class="t-grid-wrap"><table><thead><tr><th class="nc">Take</th><th>Graded right</th><th>3+ readings</th><th>Timing alone</th><th>False hits</th><th>Real strums</th><th>No pitch, no tick</th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function teacherMicOffText(h){
  const ks = Object.keys(h || {}).sort((a, b) => h[b] - h[a]);
  if(!ks.length) return '—';
  return ks.slice(0, 2).map(k => (k > 0 ? '+' : k < 0 ? '−' : '') + Math.abs(k) + ' ×' + h[k]).join(', ');
}
function teacherMicEvalDownload(){
  if(!teacherMicEvalRows.length) return;
  teacherMicSaveFile('mic-eval-' + new Date().toISOString().slice(0, 10) + '.json',
    new Blob([JSON.stringify({ generated: new Date().toISOString(), takes: teacherMicEvalRows.length, strumWhatIf: micEvalWhatIfSummary(teacherMicEvalRows), strumWhatIfSkipped: teacherMicEvalRows.filter(r => r.kind === 'pw' && r.whatIfSkipped).length, pitchRule: micEvalPitchSummary(teacherMicEvalRows), rows: teacherMicEvalRows }, null, 1)], { type: 'application/json' }));
}

/* ── Students view (roster bar chart + per-student detail) ───────────────
   Class-wide, like Trouble spots — no new Firestore reads, just a different
   slice of the already-loaded allStudents. A bar is always rendered by the
   same three helpers (axis header, tick overlay, fill) fed a "skill-id
   universe" spanning the whole 13-module course. The axis is proportional
   to each module's real skillCount, not evenly spaced per module, so a
   heavy module like Open Chords (24 skills) visibly takes more of the bar
   than String Changing (4) — that's why tick/label positions are a running
   skill-count total computed in JS, not a fixed per-column CSS width. */
function teacherSkillUniverse(){
  const modules=MODULE_MANIFEST.map(m=>{
    const ids=[];
    SETS.forEach(w=>{ if(w.moduleNum===m.num && w.skills) w.skills.forEach(sk=>ids.push(sk.id)); });
    return {num:m.num, name:m.name, ids};
  });
  const total=modules.reduce((a,m)=>a+m.ids.length,0);
  return {modules, total};
}
function teacherStudentTally(stu, universe){
  let got=0, working=0, furthest=0;
  universe.modules.forEach(m=>{
    let mGot=0, mWork=0;
    m.ids.forEach(id=>{ const st=stu.skills[id]; if(st==='gotit') mGot++; else if(st==='working') mWork++; });
    got+=mGot; working+=mWork;
    if(mGot+mWork>0) furthest=m.num; // modules are ascending, so the last touched one wins
  });
  return {got, working, total:got+working, furthest};
}
/* ── Module Review self-ratings (student detail only) ────────────────────
   The cross-module gate in app.js (isModuleGateLocked) needs TWO things
   before the next module opens: every built set in the module complete,
   AND every Module Review row rated 1–3. Set skills are visible all over
   this dashboard; the mrN rows were visible on no teacher screen at all —
   so the single most common reason a student sits stuck ("finished every
   set, never rated the review") had no signal anywhere, and the only way
   to find it was the Firebase console.

   Deliberately NOT folded into teacherSkillUniverse(): that universe drives
   the roster bar's axis, its boundary ticks, the N / total count and
   `furthest`. Folding ~90 review rows into it would shift every student's
   bar and quietly redefine what the roster chart measures. This is an
   additive block instead — nothing else on any screen changes. */
function teacherReviewUniverse(){
  return MODULE_MANIFEST.map(m=>{
    const mr=MODULE_REVIEWS[m.num];
    return {num:m.num, name:m.name, skills:(mr&&mr.skills)||[]};
  }).filter(x=>x.skills.length);
}
// Rated means 1, 2 or 3 — the same three string values isModuleGateLocked
// accepts. Anything else (undefined, '', 'none') is an unrated row.
function isRated(v){ return v==='1'||v==='2'||v==='3'; }
function teacherReviewTally(stu, skills){
  let rated=0;
  skills.forEach(s=>{ if(isRated(stu.skills[s.id])) rated++; });
  return {rated, total:skills.length};
}
/* Rating chip: 1/2/3 or the same – used for an untouched skill. Level 1 gets
   the neutral --bg3/--text2 treatment rather than red, for the reason spelled
   out on modRows below — this is a self-paced course and "still learning" is
   a legitimate place to be, not a failing grade. */
const MR_LEVEL_LABEL={'1':'1 — still learning','2':'2 — getting it','3':'3 — got it'};
function trkSpanHtml(v){
  const base='display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;font-size:0.75rem;font-weight:600;border-radius:6px';
  if(!isRated(v)) return `<span class="tck no" style="${base}" title="Not rated yet">${TCK_MINUS_SVG}</span>`;
  const skin = v==='3' ? 'background:var(--green-bg);color:var(--green-text)'
             : v==='2' ? 'background:var(--amber-bg);color:var(--amber-text)'
             : 'background:var(--bg3);color:var(--text2)';
  return `<span style="${base};${skin}" title="${escAttr(MR_LEVEL_LABEL[v])}">${escHtml(v)}</span>`;
}
/* Display hint only — isModuleGateLocked in app.js remains the source of
   truth, and is not reimplemented here (its high-water-mark rules are
   deliberately forgiving in ways a read-only dashboard doesn't need). This
   answers one narrow question: has this student finished every built set in
   the module, not yet started the next one, and left review rows unrated? If
   so, those rows are what's holding the next module shut. The "hasn't started
   the next one" half matters — a student already working in Module N+1 got in
   somehow, so flagging their old review rows as a blocker would be a lie. */
function teacherReviewIsBlocking(stu, moduleNum, tally){
  if(tally.rated>=tally.total) return false;
  const nextNum=moduleNum+1;
  if(nextNum>12) return false;                       // Module 13 sits outside the chain
  if(teacherEffectiveOpenThrough(stu)>=nextNum) return false;   // the teacher opened the next module in Manage (or class-wide)
  const mySets=SETS.filter(w=>w.moduleNum===moduleNum && !w.locked && !w.comingSoon);
  if(!mySets.length) return false;
  const allDone=mySets.every(w=>(w.skills||[]).every(sk=>stu.skills[sk.id]==='gotit'));
  if(!allDone) return false;
  const nextSets=SETS.filter(w=>w.moduleNum===nextNum);
  if(!nextSets.length) return false;                 // nothing built there to be locked out of
  const startedNext=nextSets.some(w=>(w.skills||[]).some(sk=>{
    const st=stu.skills[sk.id]; return st==='gotit'||st==='working';
  }));
  return !startedNext;
}
function teacherAxisHeaderHtml(universe){
  const total=universe.total||1; let acc=0;
  const nums=universe.modules.map(m=>{ const mid=(acc+m.ids.length/2)/total*100; acc+=m.ids.length; return `<div class="stu-axis-num" style="left:${mid}%">${m.num}</div>`; }).join('');
  return `<div class="stu-axis"><div></div><div class="stu-axis-track">${nums}</div><div></div></div>`;
}
function teacherTicksHtml(universe){
  const total=universe.total||1; let acc=0;
  // one boundary tick after each module except the last
  const ticks=universe.modules.slice(0,-1).map(m=>{ acc+=m.ids.length; return `<div class="stu-tick" style="left:${acc/total*100}%"></div>`; }).join('');
  return `<div class="stu-ticks">${ticks}</div>`;
}
function teacherBarFillHtml(got,working,total,extraClass){
  const t=total||1;
  return `<div class="stu-track ${extraClass||''}">
      <div class="stu-fill-got" style="width:${got/t*100}%"></div>
      <div class="stu-fill-work" style="left:${got/t*100}%;width:${working/t*100}%"></div>
    </div>`;
}
/* The label at the right end of a student's bar: the furthest module they've
   started, then skills FINISHED ("I've got it!", the green fill) out of the
   whole course. "Still working on it" skills are the amber fill and are NOT
   in the number. One helper for the roster row and the student's own page so
   the two can't disagree again: until 2026-10-12 the roster counted finished
   only (since a838c60) while the page added the amber ones, so the same
   student read "34 / 120" on one screen and "41 / 120" on the other, and
   neither said which. The cell keeps its width (--rightcol, 110px / 78px on
   a phone); the meaning goes in the title and in the captions under the
   bars. `tally.total` (got + working) is still what "Not started yet" and
   "Furthest along" test — that is "touched anything", not this count. */
function teacherStudentCountHtml(tally, universe){
  const tip=[`Finished: ${tally.got} of ${universe.total} skills marked "I've got it!" (green).`];
  if(tally.working) tip.push(`Not counted: ${tally.working} still being worked on (amber).`);
  if(tally.furthest) tip.push(`M${tally.furthest} is the furthest module they've started.`);
  const mod=tally.furthest===0?'&mdash;':'M'+tally.furthest;
  return `<div class="stu-right" title="${escAttr(tip.join(' '))}"><span class="stu-mod">${mod}</span><span class="stu-count">${tally.got} / ${universe.total}</span></div>`;
}
/* ── Practice minutes (2026-11-06) ───────────────────────────────────────
   Every student's practice minutes, streak, class rank and Top 5 place, for
   the teacher only (Jonathan: "where do I see students' minutes and rank?").
   READ ONLY: it reads minutes/{uid}/weeks/* for each student on the roster
   (firestore.rules lets the teacher's account read those docs and nothing
   else under minutes/) and writes nothing anywhere. It never reads days,
   meta/board (the private tag), rankBoard or weekBoard: rank and Top 5 are
   worked out here from the weeks docs, with the engine's own pure maths
   (PM.calc.status, PM.calc.rankPlace, PM.calc.top5Place), so a student's
   numbers can't be worked out two ways.
   Read when the view opens and on its Refresh button only: no timer, no
   listener. The result is kept in memory until Refresh. Cost: one read per
   weeks doc, about (students × weeks since 2026-11-01) per open/Refresh.
   Server reads only (an offline get() answers empty from the cache).
   Ranks count the whole roster (archived students too: their pages still
   publish to the student-side boards), whatever the period filter shows.
   The teacher's own account is never read or ranked. */
const TEACHER_PM_CONCURRENCY=10;
const TEACHER_PM_READ_MS=20000;   // one student's weeks read that has not answered by then fails the whole read (Refresh retries)
const TEACHER_PM_PERIODS={'4':true,'7':true,'CAS':true};
let teacherPmSort='week';      // 'week' | 'all' | 'name' — This week is the default (pinned in checks.mjs 1cg)
let teacherPmData=null;        // { at, weeks: { uid: { 'YYYY-Www': seconds } } } — the last good read
let teacherPmLoading=false;
let teacherPmError='';         // '' | 'denied' (rules not published) | 'failed'
let teacherPmGen=0;            // a newer read drops an older one
function teacherPmIsTeacher(s){
  const me=(typeof currentUser!=='undefined'&&currentUser)||null;
  return (typeof TEACHER_EMAIL!=='undefined' && s.email===TEACHER_EMAIL) || !!(me && me.uid && s.uid===me.uid);
}
// Everyone whose minutes are read and ranked: the whole roster but the teacher.
function teacherPmRoster(){ return (allStudentsRaw||[]).filter(s=>s&&s.uid&&!teacherPmIsTeacher(s)); }
// The period the student side ranks a Top 5 in: the same override-first value (PM_HOST.period), 4 / 7 / CAS only.
// Own keys only: a period the student typed as 'constructor' or 'toString' is no period (hostPeriod() in the engine agrees).
function teacherPmPeriod(s){ const p=String(teacherStudentPeriod(s)||''); return Object.prototype.hasOwnProperty.call(TEACHER_PM_PERIODS,p)?p:''; }
async function teacherLoadMinutes(){
  const gen=++teacherPmGen;
  const roster=teacherPmRoster();
  teacherPmLoading=true;
  if(teacherView==='minutes') renderTeacherMinutes();
  const out={};
  let next=0, stop=false;
  const worker=async()=>{
    while(!stop && next<roster.length){
      const s=roster[next++];
      const snap=await withTimeout(db.collection('minutes').doc(s.uid).collection('weeks').get({source:'server'}), TEACHER_PM_READ_MS);
      const m={};
      snap.forEach(d=>{ if(/^\d{4}-W\d{2}$/.test(d.id)) m[d.id]=Math.max(0, +((d.data()||{}).seconds)||0); });
      out[s.uid]=m;
    }
  };
  let err=null;
  try{
    await ensureDb();
    if(!db) throw new Error('no db');
    await Promise.all(Array.from({length:Math.min(TEACHER_PM_CONCURRENCY, roster.length)}, ()=>worker().catch(e=>{ stop=true; throw e; })));
  }catch(e){ err=e; }
  if(gen!==teacherPmGen) return;
  teacherPmLoading=false;
  if(err){
    teacherPmError=(err&&err.code==='permission-denied')?'denied':'failed';
    if(teacherPmError==='failed') console.warn('[guitar-class] practice minutes read failed', err);
  } else {
    teacherPmError='';
    teacherPmData={at:Date.now(), weeks:out};
  }
  if(teacherView==='minutes') renderTeacherMinutes();
}
/* The numbers for every student read, worked out the way their own page does.
   PURE: students = [{uid, period}] (period already 4 / 7 / CAS or ''), weeks =
   { uid: { weekId: seconds } }, c = PM.cfg(), today = 'YYYY-MM-DD'. checks.mjs
   1cg runs it against the engine's own functions. Returns { uid: row }. */
function teacherPmCompute(students, weeks, c, today, calc){
  const cur=calc.weekIdOf(today), prev=calc.weekAdd(cur,-1);
  const rows={};
  students.forEach(s=>{
    const w=weeks[s.uid]||{};
    let all=0; Object.keys(w).forEach(k=>{ all+=w[k]||0; });
    rows[s.uid]={uid:s.uid, period:s.period, status:calc.status(c, w, today), all, week:w[cur]||0, last:w[prev]||0};
  });
  const list=students.map(s=>rows[s.uid]);
  // Class rank: everyone else with at least one minute; total = students with at least one minute.
  const ranked=list.filter(r=>r.all>=60);
  list.forEach(r=>{ r.rank=calc.rankPlace(r.all, ranked.filter(o=>o!==r).map(o=>o.all)); r.rankTotal=ranked.length; });
  // Top 5: this week's seconds of the others in the same period.
  list.forEach(r=>{ r.top5=r.period ? calc.top5Place(c, r.week, list.filter(o=>o!==r && o.period===r.period).map(o=>o.week)) : null; });
  return rows;
}
function teacherPmRowCells(r){
  const mins=s=>Math.floor((s||0)/60);
  const wk=r.status.week;
  const week = wk.isBreak
    ? `${mins(wk.secs)} min <span class="pm-t-break">· break</span>`
    : `${mins(wk.secs)} / ${mins(wk.goal)} min${wk.hit?' <span class="pm-t-hit" title="Goal hit">✓</span>':''}`;
  const rank = r.rank.n===null ? '—' : `${r.rank.n} / ${r.rankTotal}`;
  const top5 = !r.top5 ? '' : r.top5.under ? '<span title="Under the Top 5 minimum this week">—</span>' : r.top5.top ? `<span class="pm-t-top5">#${r.top5.n}</span>` : '';
  return `<td class="pm-t-num">${week}</td><td class="pm-t-num">${mins(r.last)} min</td><td class="pm-t-num">${r.status.streak} ${r.status.streak===1?'week':'weeks'}</td><td class="pm-t-num">${mins(r.all)} min</td><td class="pm-t-num">${rank}</td><td class="pm-t-num">${top5}</td>`;
}
function renderTeacherMinutes(){
  const box=document.getElementById('t-grid-container');
  if(!box) return;
  if(!(window.PM && PM.calc && PM.calc.rankPlace)){ box.innerHTML='<div class="t-loading">Practice minutes did not load on this page. Reload to try again.</div>'; return; }
  // The student list is not in yet (the first progress read is out): nothing to read minutes for. loadAllStudents repaints this view.
  if(!teacherStudentsAt){ box.innerHTML=`<div class="t-loading">${teacherRefreshFailed?'Could not load the student list.':'Loading the student list…'}</div>`; return; }
  const roster=teacherPmRoster();
  /* Read now: on the first open, when the roster has students the last read did not cover, or when the last read is from
     an earlier day (a console left open over a weekend would otherwise show Friday's week as this one). Never after a
     failure (Refresh retries). */
  const nowYmd=PM.calc.ymd(new Date());
  if(!teacherPmLoading && !teacherPmError && (!teacherPmData || PM.calc.ymd(new Date(teacherPmData.at))!==nowYmd || roster.some(s=>!teacherPmData.weeks[s.uid]))){ teacherLoadMinutes(); return; }
  const seg=(v,label)=>`<button class="tg-seg-btn ${teacherPmSort===v?'on':''}" data-pm-sort="${v}">${label}</button>`;
  // "3:58 PM" today; "Fri, Nov 6, 3:58 PM" from an earlier day (kept after a failed refresh), so old numbers never pass for today's.
  const atD=teacherPmData ? new Date(teacherPmData.at) : null;
  const at=!atD ? '' : PM.calc.ymd(atD)===nowYmd ? atD.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'}) : atD.toLocaleString([], {weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
  const when = teacherPmLoading ? (teacherPmData ? `Practice minutes as of ${at} · refreshing…` : 'Loading practice minutes…')
    : teacherPmError ? (teacherPmData ? `Could not refresh — showing practice minutes as of ${at}` : teacherPmError==='failed' ? 'Could not load practice minutes.' : '')
    : teacherPmData ? `Practice minutes as of ${at}` : '';
  const head=`<div class="pm-t-bar"><span class="tg-class-lbl">Sort</span><div class="tg-seg">${seg('week','This week')}${seg('all','All time')}${seg('name','Name')}</div>`+
    `<button type="button" class="tg-seg-btn pm-t-refresh" data-pm-refresh ${teacherPmLoading?'disabled':''}>Refresh</button><span class="pm-t-when" data-pm-when>${escHtml(when)}</span></div>`;
  // Refused with nothing read yet: the rules are not published. A refusal AFTER a good read keeps the table ("Could not refresh").
  if(teacherPmError==='denied' && !teacherPmData){ box.innerHTML=head+'<div class="t-loading" data-pm-denied>Publish the new Firestore rules to see practice minutes (Firebase console → Firestore → Rules).</div>'; return; }
  if(!teacherPmData){ box.innerHTML=head; return; }
  const shown=allStudents.filter(s=>s&&s.uid&&!teacherPmIsTeacher(s)&&teacherPmData.weeks[s.uid]);
  if(!shown.length){ box.innerHTML=head+'<div class="t-loading">No students to show.</div>'; return; }
  const rows=teacherPmCompute(roster.filter(s=>teacherPmData.weeks[s.uid]).map(s=>({uid:s.uid, period:teacherPmPeriod(s)})), teacherPmData.weeks, PM.cfg(), PM.calc.ymd(atD), PM.calc);   // as of the read, like the stamp
  const nameOf=s=>s.name||s.email||s.uid.slice(0,8)+'…';
  const byName=(a,b)=>nameOf(a).localeCompare(nameOf(b), undefined, {sensitivity:'base'});
  const perOf=s=>String(teacherStudentPeriod(s)||'');   // a string always: a period stored as the number 4 joins '4', not a group of its own
  // Exact values only: '04' or ' 4' (typed by the student) is its own group after CAS, never interleaved with Period 4.
  const perRank=s=>{ const p=perOf(s); return p==='4'?4 : p==='7'?7 : p==='CAS'?8 : !p?Infinity : 9; };
  const perCmp=(a,b)=>(perRank(a)-perRank(b)) || (perOf(a)<perOf(b)?-1:perOf(a)>perOf(b)?1:0);
  const key=s=>teacherPmSort==='all' ? rows[s.uid].all : rows[s.uid].week;
  const list=shown.slice().sort((a,b)=>perCmp(a,b) || (teacherPmSort==='name' ? 0 : key(b)-key(a)) || byName(a,b));
  const perLabel=p=>!p?'No period':p==='CAS'?'CAS':'Period '+p;
  const perCount=Object.create(null); list.forEach(s=>{ const k=perOf(s); perCount[k]=(perCount[k]||0)+1; });
  let lastGroup=null;
  const body=list.map(stu=>{
    const g=perOf(stu);
    // Escaped: g is the student's own answer when no override is set.
    const groupRow=g!==lastGroup?`<tr class="tg-group"><th colspan="8">${escHtml(perLabel(g))} <span>(${perCount[g]})</span></th></tr>`:'';
    lastGroup=g;
    const name=nameOf(stu), p=g;
    return `${groupRow}<tr data-pm-uid="${escAttr(stu.uid)}"><td class="tg-name" title="${escAttr(name)}">${escHtml(name)}</td><td class="tg-eff">${p?escHtml(p==='CAS'?'CAS':'P'+p):'—'}</td>${teacherPmRowCells(rows[stu.uid])}</tr>`;
  }).join('');
  const c=PM.cfg();
  box.innerHTML=head+
    `<div class="tg-grid-wrap" data-tview="minutes"><table class="tg-table pm-t-table"><thead><tr><th>Student</th><th>Period</th><th>This week</th><th>Last week</th><th>Streak</th><th>All time</th><th>Class rank</th><th>Top 5</th></tr></thead><tbody>${body}</tbody></table></div>`+
    `<div class="tr-meta" style="margin-top:10px">This week: minutes / the ${Math.round(c.weeklyGoalMinutes)}-minute goal (Monday to Sunday); ✓ = goal hit; "break" = a week off, no goal. Class rank counts every student with at least 1 minute, whatever the period filter shows. Top 5 is inside the student's period, this week; "—" = under ${Math.round(+c.top5MinMinutes||0)} minutes this week. A student's own screen reads the rank from a board that can trail by a few minutes and counts only students who have opened the site since Nov 5, so their rank may differ slightly from this one. This one is the true number.</div>`;
}
function teacherSetMinutesSort(v){
  if(v!=='week' && v!=='all' && v!=='name') return;
  teacherPmSort=v;
  if(teacherView==='minutes') renderTeacherMinutes();
}

function renderTeacherStudents(){
  const box=document.getElementById('t-grid-container');
  if(allStudents.length===0){ box.innerHTML='<div class="t-loading">No student data yet — students need to sign in and check off skills first.</div>'; return; }
  const universe=teacherSkillUniverse();
  if(universe.total===0){
    // No skill data loaded at all (e.g. module files failed to load) — guards
    // the division below, since there's no meaningful axis to draw either way.
    box.innerHTML='<div class="t-loading">No skills have been loaded yet.</div>';
    return;
  }
  // Furthest module reached first (that's what the "Furthest along" card below
  // reads off rows[0]), skills checked off as the tie-break within a module.
  const rows=allStudents.map(stu=>({stu, tally:teacherStudentTally(stu, universe)})).sort((a,b)=>(b.tally.furthest-a.tally.furthest)||(b.tally.got-a.tally.got));
  const studentsCount=allStudents.length;
  const avgPct=Math.round(rows.reduce((a,r)=>a+r.tally.got,0)/(studentsCount*universe.total)*100);
  const furthestStu=rows[0].stu;
  const notStarted=rows.filter(r=>r.tally.total===0).length;
  // Nobody has checked anything off yet → rows[0] is an arbitrary student;
  // show the same &mdash; the per-row labels use rather than naming one.
  const furthestVal=rows[0].tally.total>0
    ? `<div class="t-scard-val" style="font-size:1.0625rem;line-height:1.5rem" title="${escAttr(furthestStu.name||furthestStu.email||furthestStu.uid)}">${escHtml(furthestStu.name||furthestStu.email||furthestStu.uid.slice(0,8)+'…')}</div>`
    : `<div class="t-scard-val">&mdash;</div>`;
  const scard=`<div class="t-summary" style="margin-top:0">
      <div class="t-scard"><div class="t-scard-lbl">Students</div><div class="t-scard-val">${studentsCount}</div></div>
      <div class="t-scard" title="Average share of the course's skills each student has finished. Skills still being worked on are not counted."><div class="t-scard-lbl">Class average</div><div class="t-scard-val">${avgPct}%</div></div>
      <div class="t-scard"><div class="t-scard-lbl">Furthest along</div>${furthestVal}</div>
      <div class="t-scard"><div class="t-scard-lbl">Not started yet</div><div class="t-scard-val">${notStarted}</div></div>
    </div>`;
  const rowsHtml=rows.map(({stu,tally})=>{
    const displayName=stu.name||stu.email||stu.uid.slice(0,8)+'…';
    return `<button type="button" class="stu-row" data-open-student data-uid="${escAttr(stu.uid)}">
        <div class="stu-name" title="${escAttr(displayName)}">${escHtml(displayName)}${teacherPeriodPillHtml(stu)}${teacherOpenThroughPillHtml(stu)}${teacherBlockedBadgeHtml(stu)}</div>
        ${teacherBarFillHtml(tally.got,tally.working,universe.total)}
        ${teacherStudentCountHtml(tally, universe)}
      </button>`;
  }).join('');
  box.innerHTML = `${scard}
    <div class="t-grid-wrap" style="border:0;overflow:visible">
      <div class="stu-chart">
        ${teacherAxisHeaderHtml(universe)}
        <div class="stu-rows">
          ${teacherTicksHtml(universe)}
          ${rowsHtml}
        </div>
      </div>
    </div>
    <div class="tr-meta" style="margin-top:10px">Each bar spans the full 13-module course. Tick marks are module boundaries. Green is skills finished; amber is skills still being worked on. On the right: the furthest module started, then skills finished out of the whole course — "M5 34 / ${universe.total}" means 34 finished, with Module 5 the furthest started. Amber skills are not in that number. Click a student to see their work.</div>`;
}

function renderTeacherStudentDetail(uid){
  const box=document.getElementById('t-grid-container');
  // Fall back to the unfiltered roster: this is an explicit uid lookup, not
  // a list render, so a period/archive filter change while this page is
  // open must not make a present student read as "removed".
  const stu=allStudents.find(s=>s.uid===uid) || (allStudentsRaw||[]).find(s=>s.uid===uid);
  const back=`<button type="button" class="stu-back" data-back-to-students>&#x2190; All students</button>`;
  if(!stu){ box.innerHTML=`${back}<div class="t-loading">Could not find that student — they may have signed out or been removed.</div>`; return; }
  const universe=teacherSkillUniverse();
  const tally=teacherStudentTally(stu, universe);
  const displayName=stu.name||stu.email||stu.uid.slice(0,8)+'…';
  const email=stu.email||'(no email on file)';
  const openThrough=teacherStudentOpenThrough(stu);

  // Written responses — every response across every set, grouped by module then set.
  let responsesHtml=''; let anyResponse=false;
  MODULE_MANIFEST.forEach(m=>{
    let moduleBlock='';
    SETS.forEach(w=>{
      if(w.moduleNum!==m.num) return;
      const slots=setShortResponses(w);
      if(!slots.length) return;
      const items=slots.map(sl=>teacherResponseItemHtml(stu, sl)).filter(Boolean).join('');
      if(!items) return;
      anyResponse=true;
      moduleBlock+=`<div class="tr-card"><div class="tr-name">${escHtml(w.label)}</div>${items}</div>`;
    });
    if(moduleBlock) responsesHtml+=`<div class="stu-section-head" style="margin-top:${responsesHtml?'22px':'0'}">Module ${m.num} — ${escHtml(m.name)}</div>${moduleBlock}`;
  });
  if(!anyResponse) responsesHtml=`<div class="stu-empty">Hasn't written anything yet.</div>`;

  // Module-by-module progress (13 rows) — same t-scard idiom as Trouble spots'
  // per-module bars, but fraction-based (7 / 21) since this is one student's
  // got+working mix, not a class-wide completion percent.
  //
  // A module with zero skills touched (no gotit, no working) is one the
  // student simply HASN'T REACHED YET — this is a student-paced course, so
  // nobody is "behind" by definition. The percentage-based pp-hi/pp-mid/pp-lo
  // logic below would otherwise score that as 0% and paint it pp-lo (red),
  // which reads as "failing this module" instead of "not started". Same
  // distinction renderTeacherGrid's `.tck no` draws for an untouched skill,
  // and the reason renderTeacherTrouble skips untouched skills entirely
  // rather than counting them against the class. Here we can't skip the row
  // (all 13 modules always render), so it gets the neutral `pp-none`
  // treatment instead — muted --text2 on --bg2/--bg3, no red. The bar below
  // needs no matching special-case: with got=working=0 both fills are
  // already 0%-wide, so it already shows as the plain --bg2 track.
  const modRows=universe.modules.map(m=>{
    let got=0, working=0;
    m.ids.forEach(id=>{ const st=stu.skills[id]; if(st==='gotit') got++; else if(st==='working') working++; });
    const total=m.ids.length, done=got+working;
    const pct=total?Math.round(done/total*100):0;
    const pillClass=done===0?'pp-none':(pct===100?'pp-hi':pct>=50?'pp-mid':'pp-lo');
    return `<div class="t-scard" style="margin-bottom:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px">
        <div class="t-scard-lbl" style="margin-bottom:0" title="${escAttr(m.name)}">Module ${m.num} — ${escHtml(abbreviate(m.name))}</div>
        <span class="ppill ${pillClass}">${done} / ${total}</span>
      </div>
      <div class="stu-track" style="height:6px;border-radius:4px">
        <div class="stu-fill-got" style="width:${total?got/total*100:0}%"></div>
        <div class="stu-fill-work" style="left:${total?got/total*100:0}%;width:${total?working/total*100:0}%"></div>
      </div>
    </div>`;
  }).join('');

  // Module Review self-ratings — one card per module the student has reached.
  // "Reached" is the same touched test the Skills list below uses (any set
  // skill marked got-it or still-working), widened to include a module where
  // they've rated a review row but touched no set, so a review can never be
  // rendered invisible by the very rows that are missing.
  let reviewsHtml='';
  teacherReviewUniverse().forEach(rm=>{
    const skillMod=universe.modules.find(m=>m.num===rm.num);
    const touchedSets=!!(skillMod&&skillMod.ids.some(id=>stu.skills[id]==='gotit'||stu.skills[id]==='working'));
    const tally=teacherReviewTally(stu, rm.skills);
    if(!touchedSets && !tally.rated) return;
    const blocking=teacherReviewIsBlocking(stu, rm.num, tally);
    const pillClass=tally.rated===tally.total?'pp-hi':(blocking?'pp-lo':(tally.rated?'pp-mid':'pp-none'));
    const flag=blocking
      ? `<div class="tg-note" style="margin:0 0 8px">Every set in this module is done, but ${tally.total-tally.rated} review row${tally.total-tally.rated===1?'':'s'} ${tally.total-tally.rated===1?'is':'are'} unrated — that's what's keeping Module ${rm.num+1} shut.</div>`
      : '';
    const rows=rm.skills.map(sk=>
      `<div class="stu-skill-row">${trkSpanHtml(stu.skills[sk.id])}<span>${escHtml(sk.text)}</span></div>`).join('');
    reviewsHtml+=`<div class="t-scard" style="margin-bottom:8px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px">
        <div class="t-scard-lbl" style="margin-bottom:0" title="${escAttr(rm.name)}">Module ${rm.num} — ${escHtml(abbreviate(rm.name))}</div>
        <span class="ppill ${pillClass}">${tally.rated} / ${tally.total} rated</span>
      </div>
      ${flag}${rows}
    </div>`;
  });
  const reviewsNote=reviewsHtml
    ? `<div class="tg-note">A module's next module stays locked until every set in it is complete <strong>and</strong> every row here is rated 1–3. These rows appear on no other screen, so an unrated review is the usual reason a student says they're stuck.</div>`
    : '';
  if(!reviewsHtml) reviewsHtml=`<div class="stu-empty">Hasn't reached a Module Review yet.</div>`;

  // Every skill, grouped by module then set — only modules this student has touched.
  let skillsHtml='';
  universe.modules.forEach(m=>{
    const touched=m.ids.some(id=>stu.skills[id]==='gotit'||stu.skills[id]==='working');
    if(!touched) return;
    skillsHtml+=`<div class="stu-section-head">Module ${m.num} — ${escHtml(m.name)}</div>`;
    SETS.forEach(w=>{
      if(w.moduleNum!==m.num || !w.skills || !w.skills.length) return;
      skillsHtml+=`<div class="stu-set-head">${escHtml(w.label)}</div>`;
      w.skills.forEach(sk=>{ skillsHtml+=`<div class="stu-skill-row">${tckSpanHtml(stu.skills[sk.id]||'none', stu.coachSkill&&stu.coachSkill[sk.id], stu.drillSkill&&stu.drillSkill[sk.id], sk.id)}<span>${escHtml(sk.text)}</span></div>`; });
    });
  });
  if(!skillsHtml) skillsHtml='<div class="stu-empty">No skills started yet.</div>';

  /* Exit checks this student has turned in. Skipped entirely when the map
     is empty, rather than showing an empty heading on every student who
     hasn't met one yet. An id with no activity left in class-activities.js
     still prints — a retired check's score is a real thing they earned. */
  const ecEntries=Object.keys(stu.exitChecks||{}).map(id=>{
    const a=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
    const r=stu.exitChecks[id]||{};
    return {id, name:a?teacherActivityTitle(a,teacherClassConfig):id, r};
  }).sort((x,y)=>String(y.r.at||'').localeCompare(String(x.r.at||'')));
  const exitChecksHtml=ecEntries.length
    ? `<div class="stu-section-head">Exit checks</div>`
      +ecEntries.map(e=>`<div class="tr-card"><div class="tr-name">Exit check &middot; ${escHtml(e.name)}</div>`
        +`${Number(e.r.score)||0}/${Number(e.r.total)||0}${e.r.at?` &mdash; ${escHtml(e.r.at)}`:''}`
        +`${Number(e.r.attempts)>1?` <span style="opacity:.6">(${Number(e.r.attempts)} attempts)</span>`:''}</div>`).join('')
    : '';

  // Today's activity gate (Today-first work order, Phase 1) — shown first,
  // ahead of the module chart: a blocked student is the thing that needs
  // acting on right now, and Clear all + a per-activity Clear both reach the
  // same teacherSetActivityClear/teacherClearAllBlockers writers the
  // activity/check detail pages use.
  const blockers=teacherBlockersFor(stu, teacherClassConfig);
  const gateHtml=blockers.length
    ? `<div class="stu-section-head" style="margin-top:0">Today's activity</div>
       <div class="tg-note">${blockers.length} not yet done or cleared — In-Class Activities opens first when they sign in. Nothing else is locked.
         <button type="button" class="tg-seg-btn" data-clear-all-blockers data-uid="${escAttr(stu.uid)}" style="margin-left:8px">Clear all</button>
       </div>
       <div class="t-grid-wrap"><table><thead><tr><th class="nc">Activity</th><th>Gate</th></tr></thead><tbody>
         ${blockers.map(a=>`<tr><td class="nc" data-open-activity data-id="${escAttr(a.id)}" style="cursor:pointer">${escHtml(teacherActivityTitle(a,teacherClassConfig))}</td>`
           +`<td><button type="button" class="tg-seg-btn" data-set-activity-clear data-uid="${escAttr(stu.uid)}" data-id="${escAttr(a.id)}" data-state="clear" title="Lets this student past the gate without finishing.">Clear</button></td></tr>`).join('')}
       </tbody></table></div>`
    : '';

  // Says in words what the number beside the bar is (teacherStudentCountHtml:
  // finished only, the same number as this student's roster row). The
  // Module-by-module rows further down deliberately count finished AND still
  // working, so with any amber skills they add up to more than this — say so
  // here rather than leave two totals on one page that don't match.
  const countCaption = tally.total===0
    ? 'No skills started yet.'
    : `Finished: ${tally.got} of ${universe.total} skills (green).`
      +(tally.working?` Still working on ${tally.working} more (amber) — not counted in the ${tally.got}. The Module-by-module progress rows below count both.`:'');

  box.innerHTML = `
    ${back}
    <div class="stu-detail-name">${escHtml(displayName)}${teacherPeriodPillHtml(stu)}${teacherBlockedBadgeHtml(stu)}</div>
    <div class="stu-detail-email">${escHtml(email)}</div>
    ${openThrough?`<div class="tg-note" style="margin:6px 0 12px">Open through Module ${openThrough} (set in Manage).</div>`:''}
    ${gateHtml}
    <div class="stu-chart" style="margin-bottom:22px">
      ${teacherAxisHeaderHtml(universe)}
      <div class="stu-rows">
        ${teacherTicksHtml(universe)}
        <div style="padding:2px 0">
          <div style="display:grid;grid-template-columns:var(--namecol) 1fr var(--rightcol);column-gap:var(--gap);align-items:center">
            <div></div>
            ${teacherBarFillHtml(tally.got,tally.working,universe.total,'stu-big-track')}
            ${teacherStudentCountHtml(tally, universe)}
          </div>
        </div>
      </div>
      <div class="tr-meta" style="margin:6px 0 0">${countCaption}</div>
    </div>

    <div class="stu-section-head" style="margin-top:0">Written responses</div>
    ${responsesHtml}
    ${exitChecksHtml}

    <div class="stu-section-head">Module-by-module progress</div>
    ${modRows}

    <div class="stu-section-head">Module Review self-ratings</div>
    ${reviewsNote}${reviewsHtml}

    <div class="stu-section-head">Skills</div>
    ${skillsHtml}
  `;
  window.scrollTo({top:0});
}
