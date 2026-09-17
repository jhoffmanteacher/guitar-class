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
/* ── Class period (4 or 7) ───────────────────────────────────────────────
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
function teacherStudentPeriod(stu){
  const ov=(teacherClassConfig&&teacherClassConfig.periodOverrides)||{};
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
  return p?` <span class="stu-period" title="Class period ${escAttr(p)}">P${escHtml(p)}</span>`:'';
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
  return n?` <span class="stu-period stu-blocked" title="${n} today's activit${n===1?'y':'ies'} not yet done or cleared">Blocked by ${n}</span>`:'';
}
/* 'all' | '4' | '7' | 'none'. Persisted per-device so a mid-period reload
   comes back to the class the teacher was actually looking at. */
let teacherPeriodFilter=(function(){
  let v=null;
  try{ v=localStorage.getItem('gc-teacher-period'); }catch(e){}
  return (v==='4'||v==='7'||v==='none') ? v : 'all';
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
  renderTeacherPeriodFilter(onRoster);
}
/* The segmented control itself. Repainted from teacherApplyRosterFilter so
   the Unassigned count follows every override the teacher sets, and lives
   beside the view toggle rather than inside one view — the filter is
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
  box.innerHTML=seg('all','All')+seg('4','P4')+seg('7','P7')
    +(unassigned?seg('none',`Unassigned (${unassigned})`):'');
}
function teacherSetPeriodFilter(v){
  if(v!=='all'&&v!=='4'&&v!=='7'&&v!=='none') return;
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
    return;
  }
  document.getElementById('teacher-app').style.display='block';
  document.getElementById('user-area').innerHTML=userHeaderHtml(user);
  // "Trouble spots" is a class-wide view, not per-set — added here (rather than
  // in index.html) so the whole feature stays contained to this file. Guarded
  // so re-entering teacher mode doesn't insert it twice.
  const toggle=document.getElementById('t-viewtoggle');
  if(toggle && !toggle.querySelector('[data-view="trouble"]')){
    toggle.insertAdjacentHTML('beforeend', `<button class="t-vt" data-view="trouble" onclick="setTeacherView('trouble')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 3v18"/><path d="M5 4h11l-3 4 3 4H5"/></svg> Trouble spots</button>`);
  }
  if(toggle && !toggle.querySelector('[data-view="students"]')){
    toggle.insertAdjacentHTML('beforeend', `<button class="t-vt" data-view="students" onclick="setTeacherView('students')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg> Students</button>`);
  }
  if(toggle && !toggle.querySelector('[data-view="manage"]')){
    toggle.insertAdjacentHTML('beforeend', `<button class="t-vt" data-view="manage" onclick="setTeacherView('manage')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg> Manage</button>`);
  }
  if(toggle && !toggle.querySelector('[data-view="activities"]')){
    toggle.insertAdjacentHTML('beforeend', `<button class="t-vt" data-view="activities" onclick="setTeacherView('activities')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3h6v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"/><path d="m9 13 2 2 4-4"/></svg> Class activities</button>`);
  }
  // Live quiz — the whole-class game (live-quiz.js). Injected here like its
  // neighbours so the feature stays in one file; the render call in
  // renderTeacherBody is guarded because that file loads separately.
  if(toggle && !toggle.querySelector('[data-view="livequiz"]')){
    toggle.insertAdjacentHTML('beforeend', `<button class="t-vt" data-view="livequiz" onclick="setTeacherView('livequiz')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg> Live quiz</button>`);
  }
  if(toggle && !toggle.querySelector('[data-view="reports"]')){
    toggle.insertAdjacentHTML('beforeend', `<button class="t-vt" data-view="reports" onclick="setTeacherView('reports')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4"/><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none"/></svg> Reports</button>`);
  }
  /* Class-period filter — a sibling of the view toggle, not a member of it:
     it narrows the roster every view renders from rather than switching
     views, so it must not pick up .t-vt's aria-pressed group behaviour.
     Injected here like its neighbours, and filled in by
     renderTeacherPeriodFilter once the roster has loaded. */
  if(toggle && !document.getElementById('t-period-filter')){
    toggle.insertAdjacentHTML('afterend', `<div class="tg-seg t-period-filter" id="t-period-filter" role="group" aria-label="Filter by class period"></div>`);
  }
  // Two extra legend rows for the skills grid's got-it markers — the plain
  // green check (index.html's static legend) doesn't distinguish a Coach
  // pass or a gate override from a self-declared "I've got it!". Inserted
  // here rather than in index.html so the whole feature stays in this file;
  // guarded the same way as the view-toggle buttons above.
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
      if(e.target.closest('[data-back-to-students]')){ backToStudentsRoster(); return; }
      const games=e.target.closest('[data-set-games]');
      if(games){ teacherSetStudentGames(games.dataset.uid, games.dataset.state); return; }
      if(e.target.closest('[data-toggle-archived]')){ teacherToggleShowArchived(); return; }
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
      const actArch=e.target.closest('[data-set-activity-archived]');
      if(actArch){ teacherSetActivityArchived(actArch.dataset.id, actArch.dataset.state); return; }
      const actDel=e.target.closest('[data-delete-activity]');
      if(actDel){ teacherDeleteActivity(actDel.dataset.id); return; }
      const actClear=e.target.closest('[data-set-activity-clear]');
      if(actClear){ teacherSetActivityClear(actClear.dataset.uid, actClear.dataset.id, actClear.dataset.state); return; }
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
      if(actRename){ activityEditId=actRename.dataset.id; renderTeacherActivities({cached:true}); return; }
      if(e.target.closest('[data-rename-cancel]')){ activityEditId=null; renderTeacherActivities({cached:true}); return; }
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
      const actDate=e.target.closest('[data-set-activity-date]');
      if(actDate){ teacherSetActivityDate(actDate.dataset.id, actDate.value); return; }
      const actNum=e.target.closest('[data-board-number]');
      if(actNum){ teacherMoveActivityToNumber(actNum.dataset.id, actNum.value); return; }
      // "Assign to…" / "Move to…" — both append at the end of the section
      // they name, same as dropping a card on a section's empty space.
      const moveSel=e.target.closest('[data-move-activity]');
      if(moveSel && moveSel.value!==''){ teacherMoveActivity(moveSel.dataset.id, Number(moveSel.value), null); return; }
      const sortSel=e.target.closest('[data-board-sort]');
      if(sortSel){ teacherBoardSetSort(sortSel.value); return; }
    });
    /* An <details> in the board remembers whether it was open across the
       next re-render — the board repaints on every write, and an Archived
       list that snapped shut each time would be unusable. `toggle` doesn't
       bubble, hence the capture phase. */
    shell.addEventListener('toggle', e=>{
      if(!e.target || typeof e.target.closest!=='function') return;
      const arch=e.target.closest('[data-board-arch]');
      if(arch) teacherBoardArchToggle(arch.dataset.module, arch.open);
    }, true);
    /* Drag and drop for the board. Bound to the same stable shell for the
       same reason as the click listener — the board's innerHTML is replaced
       on every render, so per-card listeners would have to be re-bound. */
    shell.addEventListener('dragstart', teacherBoardDragStart);
    shell.addEventListener('dragover',  teacherBoardDragOver);
    shell.addEventListener('dragenter', teacherBoardDragOver);
    shell.addEventListener('drop',      teacherBoardDrop);
    shell.addEventListener('dragend',   teacherBoardDragEnd);
    // Enter saves, Escape backs out — the rename box is a one-line field in a
    // table cell, not a form, so there's no submit event to lean on.
    shell.addEventListener('keydown', e=>{
      // A number box isn't in a form either, so Enter has nothing to submit —
      // blur it, which fires the 'change' the writer above listens for.
      const numBox=e.target.closest('.t-board-num');
      if(numBox){ if(e.key==='Enter'){ e.preventDefault(); numBox.blur(); } return; }
      const box=e.target.closest('.t-act-title-edit');
      if(!box) return;
      if(e.key==='Enter'){ e.preventDefault(); teacherSaveActivityTitle(box.dataset.id); }
      else if(e.key==='Escape'){ e.preventDefault(); activityEditId=null; renderTeacherActivities({cached:true}); }
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

async function loadAllStudents(){
  try{
    await ensureDb();
    const snap=await db.collection('progress').get();
    allStudentsRaw=[];
    snap.forEach(doc=>{
      const raw=doc.data().skills||{};
      const skills={};
      Object.keys(raw).forEach(k=>{
        if(raw[k]===true) skills[k]='gotit';
        else if(raw[k]==='working'||raw[k]==='gotit') skills[k]=raw[k];
        else if(raw[k]==='1'||raw[k]==='2'||raw[k]==='3') skills[k]=raw[k];
        else if((k.endsWith('-reflection')||k.endsWith('-performance')) && raw[k] && typeof raw[k]==='object') skills[k]=raw[k];
        else skills[k]='none';
      });
      const gamesData=doc.data().games||{};
      allStudentsRaw.push({uid:doc.id,skills,name:doc.data().name||'',email:doc.data().email||'',responses:doc.data().responses||{},coachSkill:gamesData.coachSkill||{},drillSkill:gamesData.drillSkill||{},classActivities:doc.data().classActivities||{},exitChecks:doc.data().exitChecks||{},period:doc.data().period||''});
    });
    // Pause/archive flags live in config/class, so it has to be in hand
    // before the roster is filtered — otherwise the first paint shows
    // archived students and then blinks them away.
    await loadTeacherClassConfig();
    teacherApplyRosterFilter();
  } catch(e){
    document.getElementById('t-grid-container').innerHTML='<div class="t-loading">Could not load student data. Check your Firebase security rules.</div>';
    return;
  }
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

/* ── Teacher view toggle: skill grid ⇄ responses ⇄ games ⇄ trouble ⇄
   Students (Session 6.2, extended for the Students view) ── Read-only. Uses
   the same one-shot student fetch (no extra reads). Students has two
   screens (roster / one student's detail); studentDetailUid tracks which
   one renderTeacherBody shows, kept separate from teacherView so a name
   click in the skills grid can jump straight to a student's detail without
   a view flag of its own. */
let teacherView='skills';
let studentDetailUid=null;
// Which activity's detail is showing in the Class activities view — same
// "list vs. one detail page" split as studentDetailUid above, its own flag
// so a title click in the activities table can drill in without a view
// flag of its own either.
let activityDetailId=null;
// Which row (if any) currently has its rename box open. Purely local view
// state, cleared on every save/cancel and whenever the tab is re-entered.
let activityEditId=null;
/* ── Archive / Delete (Class activities view) ──────────────────────────
   Two console-only ways to take an activity out of circulation, both stored
   on config/class like every other knob in this view:

     archivedActivities  id -> true   Tucked away. Students stop seeing it
                                      (In-Class Activities, both groups) and it stops
                                      gating the site, but its release date,
                                      rename, teaching-order number and
                                      per-student clears are all kept, so
                                      Restore puts it back exactly as it was.
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
/* The Class activities board is the one teacher view that wants the whole
   window — two columns of cards, where .t-main's 900px reading column left
   most of a 1366px Chromebook empty. Everything else here is a table or a
   page of text and stays centred, so this is a body class rather than a
   change to .t-main. Off for the activity DETAIL pages too: those are
   reading, not laying out. */
function setBoardWide(on){ document.body.classList.toggle('t-wide', !!on); }
function applyTeacherViewChrome(v){
  if(v!=='activities') setBoardWide(false);
  document.querySelectorAll('.t-vt').forEach(b=>b.classList.toggle('on',b.dataset.view===v));
  const legend=document.getElementById('t-legend'); if(legend) legend.style.display = v==='skills' ? '' : 'none';
  // Games, Trouble-spots and Students are all class-wide, not per-week —
  // hide the week tabs and the skill summary while any of them is showing.
  const classWide = v==='games'||v==='trouble'||v==='students'||v==='manage'||v==='activities'||v==='reports'||v==='livequiz';
  const tabs=document.getElementById('t-week-tabs'); if(tabs) tabs.style.display = classWide ? 'none' : '';
  const summ=document.getElementById('t-summary'); if(summ) summ.style.display = classWide ? 'none' : '';
}
function setTeacherView(v){
  teacherView=v;
  if(v==='students') studentDetailUid=null; // clicking the tab always starts back at the roster
  if(v==='activities'){ activityDetailId=null; activityEditId=null; } // same — the tab always starts back at the list, nothing mid-rename
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
   those re-render in place — teacherSetActivityClear repaints the page on
   every per-student Clear, and jumping to the top mid-way down a 60-row
   grid is its own bug. Opening is the only moment the scroll should move.
   window, not a scroll pane: the dashboard is a plain long page, and #app
   (which does have its own pane — scrollPane() in app.js) is hidden the
   whole time teacher mode is up. */
function openActivityDetail(id){
  activityListScrollY = (teacherView==='activities' && !activityDetailId) ? window.scrollY : 0;
  teacherView='activities'; activityDetailId=id;
  applyTeacherViewChrome('activities');
  renderTeacherBody();   // synchronous for a detail page — renderTeacherActivities returns early before its config promise
  window.scrollTo({top:0});
}
function backToActivitiesList(){
  activityDetailId=null;
  restoreActivityScroll=true;   // the table paints from a promise — see renderTeacherActivities
  renderTeacherBody();
}
function renderTeacherBody(){
  if(teacherView==='games') renderTeacherGames();
  else if(teacherView==='responses') renderTeacherResponses();
  else if(teacherView==='trouble') renderTeacherTrouble();
  else if(teacherView==='students') studentDetailUid ? renderTeacherStudentDetail(studentDetailUid) : renderTeacherStudents();
  else if(teacherView==='manage') renderTeacherManage();
  else if(teacherView==='activities') renderTeacherActivities();
  else if(teacherView==='reports') renderTeacherReports();
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
let boardDragId=null;          // the id a drag is carrying — never in dataTransfer
/* ── How the board is SHOWN (Jonathan, 2026-09-16) ──────────────────────
   Sorting here is the teacher's view and nothing else: it never writes, and
   students always read the course order the board holds. The `#N` on a card
   is its real position either way, so a descending view reads 9, 8, 7 …

   Descending is the DEFAULT, on both axes: the newest module at the top and
   the newest activity at the top of it, because the work being set up is
   almost always the most recent and scrolling past a semester to reach it
   was the whole complaint. Ascending is one click away.

   Unsorted is pinned first regardless of direction — it is the tray of
   cards not yet placed in the course, not a module with a number, so it
   belongs where it will be noticed rather than at whichever end the sort
   happens to put module 0. */
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
  });
}
/* Every id currently placed in one module, in board order, archived rows
   INCLUDED — the ordering primitive every writer below splices against. An
   archived card keeps its slot inside its module precisely so Restore puts
   it back where it was, so it has to be in this list even though it never
   renders in the live run of cards. */
function teacherBoardModuleIds(cfg, module){
  const b=(cfg&&cfg.activityBoard)||{};
  return (window.CLASS_ACTIVITIES||[]).filter(a=>b[a.id] && (Number(b[a.id].module)||0)===Number(module))
    .sort((x,y)=>{
      const px=Number(b[x.id].pos), py=Number(b[y.id].pos);
      return ((Number.isFinite(px)?px:Infinity)-(Number.isFinite(py)?py:Infinity))
        || (teacherActivityIdNum(x)-teacherActivityIdNum(y));
    })
    .map(a=>a.id);
}
function teacherActivityIdNum(a){ const m=/^ca-(\d+)$/.exec(String(a&&a.id)); return m?Number(m[1]):Infinity; }
/* One line saying where a card sits, for the two detail pages. Reads the
   same board view students' #N comes from, so the detail page can't
   disagree with the board that linked to it. */
function teacherActivityPlace(id){
  const cfg=teacherClassConfig;
  const e=(cfg.activityBoard||{})[id];
  if(!e) return 'Built \u2014 not assigned to a module yet, so no student sees it.';
  const mn=Number(e.module)||0;
  const manifest=(typeof MODULE_MANIFEST!=='undefined')?MODULE_MANIFEST:[];
  const mod=manifest.find(m=>m.num===mn);
  const where=mn===0?'Unsorted':(mod?`Module ${mn} \u2014 ${mod.name}`:`Module ${mn}`);
  if(teacherActivityDeleted(id,cfg)) return `${where} \u00b7 deleted \u2014 no number, and students don't see it.`;
  if(teacherActivityArchived(id,cfg)) return `${where} \u00b7 archived \u2014 no number, and students don't see it.`;
  const n=teacherBoardView(cfg).number[id];
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
  try{
    // Strict (no base): this replaces the board wholesale, so any other
    // write since this tab's read is a reason to stop and look.
    await teacherWriteConfig({activityBoard:board, activityBoardSeeded:true});
  }catch(e){
    boardMigrating=false;
    teacherConfigSaveFailed(e, 'Could not set up the activity board — check your connection and Firestore rules.');
    return false;
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
   showing the teacher stale data. */
function renderTeacherActivities(opts){
  const cached = !!(opts && opts.cached) && teacherClassConfigLoaded;
  const box=document.getElementById('t-grid-container');
  if(activityDetailId){ renderTeacherActivityDetail(activityDetailId); return; }
  const activities=(window.CLASS_ACTIVITIES||[]);
  if(!activities.length){
    setBoardWide(false);
    box.innerHTML='<div class="t-loading">No activities yet — they\'ll appear here once one is pushed to the site.</div>';
    return;
  }
  if(allStudents.length===0){
    setBoardWide(false);
    box.innerHTML='<div class="t-loading">No student data yet — students need to sign in first.</div>';
    return;
  }
  if(!cached) box.innerHTML='<div class="t-loading">Loading…</div>';
  (cached ? Promise.resolve(teacherClassConfig) : loadTeacherClassConfig()).then(async cfg=>{
    if(teacherView!=='activities') return;   // switched views mid-flight
    if(!cfg) return;                         // superseded by a newer toggle
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
    const hidden=cfg.hiddenActivities||{};
    const dates=cfg.activityDates||{};
    const today=dayStr(new Date());
    const view=teacherBoardView(cfg);
    const nums=view.number;
    const byId={}; activities.forEach(a=>{ byId[a.id]=a; });
    const manifest=(typeof MODULE_MANIFEST!=='undefined')?MODULE_MANIFEST:[];

    /* ── Shared card parts ──────────────────────────────────────────── */
    // How many students have finished this one, and who hasn't — broken out
    // by period so the number can't be misread as the whole class when the
    // dashboard's period filter (t-period-filter) is narrowed to P4, P7, or
    // Unassigned. Deliberately reads the FULL roster (allStudentsRaw, minus
    // archived) rather than `allStudents`, which follows that filter — this
    // card is meant to answer "who's done" for the whole class regardless of
    // whatever the teacher is currently looking at elsewhere on the page.
    // Reads the SAME student docs the Students tab already fetched
    // (loadAllStudents) — no second Firestore read path for completion data.
    const doneSummaryRoster=(teacherShowArchived?allStudentsRaw:allStudentsRaw.filter(s=>!((cfg.archived||{})[s.uid])));
    const doneSummary=a=>{
      const isCheck=a.kind==='check';
      const groups=[['4','P4'],['7','P7'],['','Unassigned']]
        .map(([val,label])=>({label, students:doneSummaryRoster.filter(s=>teacherStudentPeriod(s)===val)}))
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
        return `<div class="t-board-done-row"><strong>${head}</strong> &middot; <details><summary>who hasn't ${isCheck?'turned it in':'finished'} (${notDone.length})</summary>${listHtml}</details></div>`;
      }).join('');
      return `<div class="t-board-done">${rows||'<div class="t-board-done-row">No student data yet.</div>'}</div>`;
    };
    // Title line: the rename editor when it's open on this card, otherwise
    // the name + pencil + id + Copy link. The whole line is the link into
    // the detail page, so the buttons inside it are matched FIRST by the
    // delegated click listener (see showTeacherApp).
    const titleBlock=a=>{
      const shown=teacherActivityTitle(a,cfg);
      const renamed=shown!==a.title;
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
      const dateInput=`<input type="date" class="t-date-input" data-set-activity-date data-id="${escAttr(a.id)}" value="${escAttr(dateVal)}" aria-label="Release date for ${escAttr(teacherActivityTitle(a,cfg))}">`;
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
          : publishBlock(a)+`<div class="t-board-ctl">${visSeg(a)}${moveSelect(a,'Move to…',curModule)}${moveBtns}</div>`)
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
      const doneOf=id=>{
        const a=byId[id]; if(!a) return 0;
        return a.kind==='check'
          ? allStudents.filter(s=>(s.exitChecks||{})[id]).length
          : allStudents.filter(s=>(s.classActivities||{})[id]===true).length;
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
      return `<div class="t-board-section${closed?' t-board-closed':''}" data-board-section data-module="${mn}">`
        +`<div class="t-board-sechead" data-board-fold data-module="${mn}">`
        +`<span class="t-board-caret" aria-hidden="true"></span><span>${label}</span>`
        +`<span class="t-board-count">${sec.ids.length}</span></div>`
        +`<div class="t-board-secbody">`
        +(cards||`<div class="t-board-empty">Drop an activity here, or use “Assign to…”.</div>`)
        +(arch.length?`<details class="t-board-arch" ${boardArchOpen[mn]?'open':''} data-board-arch data-module="${mn}"><summary>Archived (${arch.length})</summary>${arch.map(assignedCard).join('')}</details>`:'')
        +`</div></div>`;
    };
    // Unsorted pinned first (see boardSortKey), then the modules that hold
    // something, highest number first by default.
    const moduleNums=manifest.map(m=>m.num)
      .concat(Object.keys(sectionsById).map(Number).filter(mn=>mn!==0 && !manifest.some(m=>m.num===mn)))
      .filter(holds).sort((x,y)=>dirMul*(x-y));
    const sectionOrder=(holds(0)?[0]:[]).concat(moduleNums);
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

    setBoardWide(true);
    box.innerHTML=`<div class="tg-note">Drag a built activity into a module to assign it. It goes live for students on its release date.</div>`
      +`<details class="tg-help"><summary>How this page works</summary>`
      +`<div class="tg-note">A card shows to students only when all four are true: it is <strong>assigned</strong> to a module here, its <strong>release date</strong> has arrived, it is not <strong>Hidden</strong>, and it is not <strong>Archived</strong>. Publish now dates it today; scheduling a later day holds it until then; Unpublish clears the date. A card's date stays editable once it's live, so you can move it to another day without unpublishing first — type a future day and it goes back to Scheduled. Use Hidden to pull back something already live, then un-hide any time — the date and the Hidden switch are independent, either one hides.<br><br>`
      +`<strong>Archive</strong> takes a card off students' In-Class Activities page for good but keeps its place in its module, its date and its name, so Restore puts it back exactly where it was. Archived cards hold no #number, so the ones after them count down by one. <strong>Delete</strong> also clears the date, rename and per-student gate clears, and takes the card off the board entirely — it comes back in Built, blank, to be placed and published from scratch. Neither one removes the activity from the site's code (only an update does) and neither touches what students have already finished, so the Done counts survive both.<br><br>`
      +`<strong>Un-assign</strong> sends a card back to Built without clearing anything. The &#x270E; renames an activity for everyone, in both languages, until the Spanish twin ships. Copy link gives you a URL that opens the site straight to that one activity, card already open — paste it into Classroom. Type over a <strong>#number</strong> to move a card to that position; a number inside a title, like Finger Gym 2, is part of the name and stays put.</div></details>`
      +`<div class="t-board">${builtHtml}${assignedHtml}</div>`;
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
async function teacherMoveActivity(id, module, pos){
  const cfg=teacherClassConfig;
  const a=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  if(!a) return;
  const mn=Number(module)||0;
  const prev=cfg.activityBoard||{};
  const from=prev[id] ? (Number(prev[id].module)||0) : null;
  const target=teacherBoardModuleIds(cfg,mn).filter(x=>x!==id);
  const at=(pos===null||pos===undefined) ? target.length : Math.max(0, Math.min(target.length, Math.round(pos)-1));
  target.splice(at,0,id);
  const next={};
  Object.keys(prev).forEach(k=>{ next[k]=prev[k]; });
  target.forEach((x,i)=>{ next[x]={module:mn, pos:i+1}; });
  if(from!==null && from!==mn) teacherBoardModuleIds(cfg,from).filter(x=>x!==id).forEach((x,i)=>{ next[x]={module:from, pos:i+1}; });
  // Only what actually moved. An unchanged row re-sent would cost nothing
  // but noise, and the patch is easier to read in the console when it names
  // exactly the cards that moved.
  const patch={};
  Object.keys(next).forEach(k=>{
    const p=prev[k];
    if(!p || Number(p.module)!==next[k].module || Number(p.pos)!==next[k].pos) patch[k]=next[k];
  });
  if(!Object.keys(patch).length){ renderTeacherActivities({cached:true}); return; }
  cfg.activityBoard=next;
  try{
    /* Strict (no base): `pos` is re-packed 1..N from the copy of the board
       this tab holds, so a base one move out of date writes a run with a
       duplicate or a hole in it — and nothing downstream would notice. */
    await teacherWriteConfig({activityBoard:patch});
  }catch(e){
    cfg.activityBoard=prev;
    teacherConfigSaveFailed(e, 'Could not save that move — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
}
/* Back to Built. The entry goes away and the module it left is re-packed;
   the release date, the rename and the Hidden flag are deliberately left
   alone — they are independent knobs, and a card un-assigned by accident
   should come back with its settings when it's dropped in again. */
async function teacherUnassignActivity(id){
  const cfg=teacherClassConfig;
  const prev=cfg.activityBoard||{};
  if(!prev[id]) return;
  const from=Number(prev[id].module)||0;
  const next={};
  Object.keys(prev).forEach(k=>{ if(k!==id) next[k]=prev[k]; });
  const patch={};
  teacherBoardModuleIds(cfg,from).filter(x=>x!==id).forEach((x,i)=>{
    next[x]={module:from, pos:i+1};
    const p=prev[x];
    if(!p || Number(p.module)!==from || Number(p.pos)!==i+1) patch[x]=next[x];
  });
  cfg.activityBoard=next;
  try{
    await ensureDb();   // for FieldValue — teacherWriteConfig calls it again, cached
    const fv=firebase.firestore.FieldValue;
    patch[id]=fv.delete();
    // Strict, same re-packing reason as teacherMoveActivity.
    await teacherWriteConfig({activityBoard:patch});
  }catch(e){
    cfg.activityBoard=prev;
    teacherConfigSaveFailed(e, 'Could not un-assign that activity — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
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
  if(!over || over.dataset.id===id || !section.contains(over)){ append(); return; }
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
function teacherActivityTitle(a, cfg){
  const o=((cfg&&cfg.activityTitles)||{})[a.id];
  return (o && o.en && o.base===a.title) ? o.en : a.title;
}
// Read the open editor's box and hand it to the writer. Split out from
// teacherSetActivityTitle so Enter, the Save button and a future affordance
// all reach the same value without each re-finding the input.
function teacherSaveActivityTitle(id){
  const inp=document.querySelector(`.t-act-title-edit[data-id="${CSS.escape(id)}"]`);
  teacherSetActivityTitle(id, inp ? inp.value : '');
}
/* Write (or clear) a rename. Same optimistic-then-roll-back write shape as
   teacherSetActivityHidden/Date above, against a third map on the same doc.

   Two cases clear the override outright rather than storing it: an empty box,
   and a value equal to the shipped title — both mean "no rename", and storing
   either would leave a row in config/class that does nothing but has to be
   reasoned about later.

   `base` freezes the shipped title this rename was typed against, which is
   what lets the override expire by itself once the name is folded into
   class-activities.js properly. caTitle() in app.js enforces it. */
async function teacherSetActivityTitle(id, value){
  const a=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  if(!a) return;
  const name=String(value||'').trim().slice(0,120);
  const clear=!name || name===a.title;
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
function renderTeacherActivityDetail(id){
  setBoardWide(false);
  const box=document.getElementById('t-grid-container');
  const back=`<button type="button" class="stu-back" data-back-to-activities>&#x2190; All activities</button>`;
  const a=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  if(!a){ box.innerHTML=`${back}<div class="t-loading">Could not find that activity — it may have been renamed or removed.</div>`; return; }
  // A check has no steps — its detail page is a results grid, see below.
  if(a.kind==='check') return renderTeacherCheckDetail(a, back);
  // Where this card sits in the course, straight off the board — "Module 3
  // · #7", or the reason it has no number. Same view students' #N comes
  // from (caBoardOrder), so the two can't disagree.
  const place=teacherActivityPlace(a.id);
  const stepsHtml=(a.steps||[]).map((s,si)=>{
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
    if(s.tab) media.push(buildTab(s.tab,{keyPrefix:`bpm:ca-preview:${a.id}:${si}:tab`,suppressCoach:true}));
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
    const head=`Step ${si+1}${s.label?`: ${escHtml(s.label)}`:''}`;
    return `<div class="tr-card ca-prev-step" style="margin-bottom:12px"><div class="tr-name">${head}</div>${wrapGotItWhen(s.text||'')}${media.join('')}</div>`;
  }).join('');
  // Per-student status + gate clear (Today-first work order, Phase 1) — same
  // uid -> { activityId -> true } map, and the same Clear toggle, as the
  // exit-check grid below (renderTeacherCheckDetail). Sorted by name, not by
  // done/not-done, so a teacher looking for one student doesn't have to
  // scan two groups.
  const clearsMap=teacherClassConfig.activityClears||{};
  const sortedStudents=[...allStudents].sort((x,y)=>String(x.name||x.email||'').localeCompare(String(y.name||y.email||'')));
  const studentRows=sortedStudents.map(s=>{
    const done=(s.classActivities||{})[a.id]===true;
    const cleared=!!((clearsMap[s.uid]||{})[a.id]);
    return `<tr><td class="nc">${escHtml(s.name||s.email||'(no name)')}</td>
      <td>${done?'Done ✓':'Not yet'}</td>
      <td><button class="tg-seg-btn ${cleared?'on':''}" data-set-activity-clear data-uid="${escAttr(s.uid)}" data-id="${escAttr(a.id)}" data-state="${cleared?'unclear':'clear'}" title="Lets this student past the gate without finishing.">${cleared?'Cleared':'Clear'}</button></td></tr>`;
  }).join('');
  const studentTable=sortedStudents.length
    ? `<div class="t-grid-wrap"><table><thead><tr><th class="nc">Student</th><th>Status</th><th>Gate</th></tr></thead><tbody>${studentRows}</tbody></table></div>`
    : '<div class="t-loading">No student data yet — students need to sign in first.</div>';
  box.innerHTML=`${back}
    <div class="stu-section-head" style="margin-top:0">${escHtml(teacherActivityTitle(a,teacherClassConfig))} <span style="opacity:.55;font-size:.72em">(${escHtml(a.id)})</span></div>
    <div class="tg-note">${escHtml(place)}</div>
    ${teacherRetiredBanner(a.id)}
    ${linkRow(a)}
    ${a.intro?`<div class="coach-tip" style="margin:0 2px 16px">${escHtml(a.intro)}</div>`:''}
    <div class="stu-section-head">Students</div>
    <div class="tg-note">Gate: today's activities block the rest of the site until they're done (see the Today-first work order). Clear lets one student past this one without finishing it — a sub day, a connectivity problem, work done on paper.</div>
    ${studentTable}
    <div class="stu-section-head">Preview</div>
    ${stepsHtml || '<div class="stu-empty">No steps on this activity yet.</div>'}
    ${caJourneyUrl(a)?`<div class="ca-journey-row"><a class="jl-song-btn" href="${escAttr(caJourneyUrl(a))}" target="_blank" rel="noopener">${escHtml(t('ca.openJourney',{song:(SONG_JOURNEYS.find(s=>s.id===a.journey)||{}).name||''}))} &#x2197;</a> <span class="tg-note" style="display:inline">— this page stays open behind the gate while the activity is pending.</span></div>`:''}`;
}
/* An exit check's detail page: who turned it in, what they picked, and
   which question the room missed. Deliberately NOT the plain step list
   above — a check has no steps, and the thing worth reading before the
   next lesson is the "Missed by" row.

   The preview at the bottom calls caCheckBodyHtml() in app.js, the same
   renderer the student card uses. Picks made there are graded and shown
   but written nowhere (ecSubmit bails on IS_TEACHER_MODE), so previewing
   is not turning in. */
function renderTeacherCheckDetail(a, back){
  const box=document.getElementById('t-grid-container');
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
  const clearCell=uid=>{
    const cleared=!!((clearsMap[uid]||{})[a.id]);
    return `<td><button class="tg-seg-btn ${cleared?'on':''}" data-set-activity-clear data-uid="${escAttr(uid)}" data-id="${escAttr(a.id)}" data-state="${cleared?'unclear':'clear'}" title="Lets this student past the gate without finishing.">${cleared?'Cleared':'Clear'}</button></td>`;
  };
  const bodyRows=withRes.map(({s,r})=>{
    const g=ecGrade(a,r.picks);
    const cells=g.rows.map(row=>`<td style="text-align:center">${cell(row.ok)}<div style="font-size:.72em;opacity:.7">${escHtml(row.pick||'—')}</div></td>`).join('');
    return `<tr><td class="nc">${escHtml(s.name||s.email||'(no name)')}</td><td>${r.score}/${r.total}</td><td>${escHtml(r.at||'')}</td>${cells}${clearCell(s.uid)}</tr>`;
  }).join('');
  const missRow=withRes.length
    ? `<tr><td class="nc" style="font-style:italic">Missed by</td><td colspan="2"></td>`
      +missed.map(m=>`<td style="text-align:center">${m}</td>`).join('')+`<td></td></tr>`
    : '';
  const noneRows=without.map(s=>`<tr style="opacity:.55"><td class="nc">${escHtml(s.name||s.email||'(no name)')}</td><td colspan="${2+items.length}">not turned in</td>${clearCell(s.uid)}</tr>`).join('');
  const table=allStudents.length
    ? `<div class="t-grid-wrap"><table><thead><tr><th class="nc">Student</th><th>Score</th><th>Date</th>${heads.map(h=>`<th>${h}</th>`).join('')}<th>Gate</th></tr></thead>`
      +`<tbody>${bodyRows}${missRow}${noneRows}</tbody></table></div>`
    : '<div class="t-loading">No student data yet — students need to sign in first.</div>';
  box.innerHTML=`${back}
    <div class="stu-section-head" style="margin-top:0">Exit check &middot; ${escHtml(teacherActivityTitle(a,teacherClassConfig))} <span style="opacity:.55;font-size:.72em">(${escHtml(a.id)})</span></div>
    ${teacherRetiredBanner(a.id)}
    <div class="tg-note">${escHtml(teacherActivityPlace(a.id))} ${dateNote}. ${withRes.length} of ${allStudents.length} turned in. Checks take no #number — they never enter the course's numbered run.</div>
    ${linkRow(a)}
    ${a.intro?`<div class="coach-tip" style="margin:0 2px 16px">${escHtml(a.intro)}</div>`:''}
    ${table}
    <div class="stu-section-head">Preview</div>
    <div class="tg-note">Try the check yourself — nothing you pick here is saved.</div>
    <div id="ec-preview-body-${escAttr(a.id)}">${caCheckBodyHtml(a,{preview:true,keyPrefix:'ca-preview'})}</div>`;
}
async function teacherSetActivityHidden(id, state){
  const on = state==='hide';
  if(!teacherClassConfig.hiddenActivities) teacherClassConfig.hiddenActivities={};
  const had = Object.prototype.hasOwnProperty.call(teacherClassConfig.hiddenActivities, id);
  const prev = teacherClassConfig.hiddenActivities[id];
  if(on) teacherClassConfig.hiddenActivities[id]=true; else delete teacherClassConfig.hiddenActivities[id];
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
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    await teacherWriteConfig({
      archivedActivities:{[id]: on ? true : fv.delete()},
      deletedActivities:{[id]: fv.delete()}
    }, {
      ['archivedActivities.'+id]: hadA?prevA:undefined,
      ['deletedActivities.'+id]:  hadD?prevD:undefined
    });
  }catch(e){
    if(hadA) cfg.archivedActivities[id]=prevA; else delete cfg.archivedActivities[id];
    if(hadD) cfg.deletedActivities[id]=prevD; else delete cfg.deletedActivities[id];
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
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
  const MAPS=['archivedActivities','deletedActivities','hiddenActivities','activityDates','activityTitles','activityNumbers','activityBoard'];
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
     other board writer keeps (teacherMoveActivity). Computed BEFORE the
     entry is deleted, since teacherBoardModuleIds reads the board. */
  const boardEntry=cfg.activityBoard[id];
  const repack={};
  if(boardEntry){
    const from=Number(boardEntry.module)||0;
    teacherBoardModuleIds(cfg,from).filter(x=>x!==id).forEach((x,i)=>{
      const p=cfg.activityBoard[x];
      if(!p || Number(p.pos)!==i+1) repack[x]={module:from, pos:i+1};
    });
  }
  const beforeRepack={};
  Object.keys(repack).forEach(k=>{ beforeRepack[k]=cfg.activityBoard[k]; });
  cfg.deletedActivities[id]=true;
  MAPS.filter(m=>m!=='deletedActivities').forEach(m=>{ delete cfg[m][id]; });
  Object.keys(repack).forEach(k=>{ cfg.activityBoard[k]=repack[k]; });
  clearUids.forEach(uid=>{ delete clears[uid][id]; });
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
    // Strict (no base): like a move, this re-packs the module the card
    // leaves, so it depends on more of the board than the patch names.
    await teacherWriteConfig(patch);
  }catch(e){
    MAPS.forEach(m=>{ if(before[m]===undefined) delete cfg[m][id]; else cfg[m][id]=before[m]; });
    Object.keys(beforeRepack).forEach(k=>{ if(beforeRepack[k]===undefined) delete cfg.activityBoard[k]; else cfg.activityBoard[k]=beforeRepack[k]; });
    clearUids.forEach(uid=>{ clears[uid][id]=beforeClears[uid]; });
    teacherConfigSaveFailed(e, 'Could not delete that activity — check your connection and Firestore rules.');
  }
  // A deleted row leaves the table, so an open rename box on it would be
  // editing something that is no longer there.
  if(activityEditId===id) activityEditId=null;
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
function teacherActivityVisible(a, cfg, today){
  if(teacherActivityRetired(a.id, cfg)) return false;   // archived/deleted — see caIsVisible in app.js
  // Not placed on the board = not in the course. Same condition, same
  // position, as the assigned check in caIsVisible() — without it the
  // console keeps counting an un-assigned card as a blocker ("Blocked by N",
  // the per-student gate list, Clear all) for students it no longer blocks.
  if(cfg && cfg.activityBoardSeeded && !((cfg.activityBoard||{})[a.id])) return false;
  if(((cfg&&cfg.hiddenActivities)||{})[a.id]===true) return false;
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
function teacherBlockersFor(stu, cfg){
  const today=dayStr(new Date());
  const clears=((cfg&&cfg.activityClears)||{})[stu.uid]||{};
  return (window.CLASS_ACTIVITIES||[]).filter(a=>
    teacherActivityVisible(a,cfg,today) && (stu.classActivities||{})[a.id]!==true && clears[a.id]!==true);
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
  if(activityDetailId) renderTeacherActivityDetail(activityDetailId);
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
// takes a ticket; only the most recently issued one may touch state or return
// a config to render from. A stale response resolves to null and is dropped.
let teacherClassConfigReq = 0;
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
async function loadTeacherClassConfig(){
  const req = ++teacherClassConfigReq;
  let cfg, ok = false;
  try{
    await ensureDb();
    const doc = await db.collection('config').doc('class').get();
    cfg = doc.exists ? (doc.data()||{}) : {};
    ok = true;                      // a doc that doesn't exist yet still counts: we reached Firestore and it said so
  }catch(e){ cfg = {}; }
  if(!cfg.gameOverrides) cfg.gameOverrides = {};
  if(req !== teacherClassConfigReq) return null;   // a newer request is in flight — discard this one
  teacherClassConfig = cfg;
  teacherClassConfigLoaded = true;
  teacherClassConfigReadOk = ok;
  teacherConfigVersion = Number(cfg.configVersion) || 0;
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
function teacherConfigAt(obj, path) {
  let cur = obj;
  const parts = String(path).split('.');
  for (let i = 0; i < parts.length; i++) {
    if (cur === null || typeof cur !== 'object' || !Object.prototype.hasOwnProperty.call(cur, parts[i])) return undefined;
    cur = cur[parts[i]];
  }
  return cur;
}
/* config/class holds strings, numbers, booleans and the board's {module,pos}
   pairs, so JSON compares them exactly. `undefined` — the cell was absent —
   is its own case, because JSON.stringify gives undefined back for it and
   would then equal any other absent value by accident. */
function teacherConfigSame(a, b) {
  if (a === undefined || b === undefined) return a === b;
  return JSON.stringify(a) === JSON.stringify(b);
}
async function teacherWriteConfig(patch, base) {
  const dbh = await ensureDb();
  if (!dbh) throw new Error('Firestore is not available');
  const ref = dbh.collection('config').doc('class');
  let wrote = 0, diverged = false;
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
  teacherConfigVersion = wrote;
  if (teacherClassConfig) teacherClassConfig.configVersion = wrote;
  if (diverged) {
    /* The patch was safe, but this tab is still missing whatever the other
       session changed — and the version number now claims it is current, so
       the next write would sail through its check on a copy that isn't.
       Awaited, not fired and forgotten: the caller repaints as soon as we
       return, and it should repaint from the merged truth. */
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
function renderTeacherGames(){
  const box=document.getElementById('t-grid-container');
  box.innerHTML='<div class="t-loading">Loading game settings…</div>';
  loadTeacherClassConfig().then(cfg=>{
    if(teacherView!=='games') return;   // teacher switched views while the get was in flight — don't stomp the current view's DOM
    if(!cfg) return;   // superseded by a newer toggle — leave the newer render's DOM alone
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
    box.innerHTML=classCtl+
      `<div class="tg-grid-wrap"><table class="tg-table"><thead><tr><th>Student</th><th>Games access</th><th>Right now</th></tr></thead><tbody>${rows}</tbody></table></div>`;
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
function renderTeacherManage(){
  const box=document.getElementById('t-grid-container');
  box.innerHTML='<div class="t-loading">Loading student settings…</div>';
  loadTeacherClassConfig().then(cfg=>{
    if(teacherView!=='manage') return;   // switched views mid-flight — don't stomp the new view's DOM
    if(!cfg) return;                     // superseded by a newer toggle
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
      <div class="tg-note"><strong>Paused</strong> students can sign in but see a "your access is paused" message instead of the site — use it for a temporary hold, then un-pause. <strong>Archived</strong> students are hidden from every dashboard view; their work is kept and comes back if you restore them. Pausing takes effect the next time that student loads the site. <strong>Period</strong> is whatever the student picked when they first signed in — set 4 or 7 here to correct a wrong tap, or Auto to go back to their own answer. This list always shows everyone, whatever the period filter above is set to.</div>`;
    if(allStudentsRaw.length===0){ box.innerHTML=head+'<div class="t-loading">No students yet — they’ll appear here once they sign in.</div>'; return; }
    const nameOf=s=>(s.name||s.email||s.uid);
    // Period first, then name — this is the table you scan when a student
    // says "I'm in 4th, not 7th", so the two classes group together.
    // Ranked numerically rather than by localeCompare: untagged students sort
    // LAST, and a sentinel string wouldn't get that (ICU collation puts
    // punctuation ahead of digits, so '~' landed them first).
    const perRank=s=>{ const p=teacherStudentPeriod(s); return p?Number(p):Infinity; };
    const list=(teacherShowArchived?allStudentsRaw:allStudentsRaw.filter(s=>!arch[s.uid]))
      .sort((a,b)=>(perRank(a)-perRank(b))||nameOf(a).localeCompare(nameOf(b)));
    if(list.length===0){ box.innerHTML=head+'<div class="t-loading">Every student is archived. Use “Show archived” to bring them back.</div>'; return; }
    const rows=list.map(stu=>{
      const name=stu.name||stu.email||stu.uid.slice(0,8)+'…';
      const isPaused=!!paused[stu.uid], isArch=!!arch[stu.uid];
      // data-uid + the delegated listener in showTeacherApp — a Firestore
      // uid is never spliced into an inline JS string literal.
      const pauseBtns=
        `<button class="tg-seg-btn ${!isPaused?'on':''}" data-set-paused data-uid="${escAttr(stu.uid)}" data-state="active">Active</button>`+
        `<button class="tg-seg-btn ${isPaused?'on':''}" data-set-paused data-uid="${escAttr(stu.uid)}" data-state="paused">Paused</button>`;
      const archBtn=`<button class="tg-seg-btn ${isArch?'on':''}" data-set-archived data-uid="${escAttr(stu.uid)}" data-state="${isArch?'restore':'archive'}">${isArch?'Restore':'Archive'}</button>`;
      /* Period: 4 · 7 · Auto. "Auto" clears the override and falls back to
         whatever the student answered for themselves — which is why the
         highlighted button is the EFFECTIVE period either way, and the
         "set" marker beside it is what tells you the value is yours rather
         than theirs. Same data-uid + delegated listener as its neighbours. */
      const per=teacherStudentPeriod(stu), perSet=teacherPeriodIsOverride(stu);
      const perBtn=(v,label)=>`<button class="tg-seg-btn ${per===v?'on':''}" data-set-period data-uid="${escAttr(stu.uid)}" data-value="${v}">${label}</button>`;
      const periodCell=`<div class="tg-seg">${perBtn('4','4')}${perBtn('7','7')}`+
        `<button class="tg-seg-btn ${perSet?'':'on'}" data-set-period data-uid="${escAttr(stu.uid)}" data-value="auto" title="Use the student's own answer">Auto</button></div>`+
        (perSet?`<span class="tg-set-mark" title="You set this period — the student answered ${escAttr(stu.period||'nothing')}">set</span>`:'');
      const archIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="3" y="6" width="18" height="4" rx="1"/><path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9"/><path d="M10 14h4"/></svg>';
      const pauseIco='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
      const status=isArch?`${archIco} archived`:isPaused?`${pauseIco} paused`:'&#x2713; active';
      return `<tr${isArch?' style="opacity:.55"':''}><td class="tg-name" title="${escAttr(name)}">${escHtml(name)}</td>`+
        `<td class="tg-period">${periodCell}</td>`+
        `<td><div class="tg-seg">${pauseBtns}</div></td>`+
        `<td><div class="tg-seg">${archBtn}</div></td>`+
        `<td class="tg-eff">${status}</td></tr>`;
    }).join('');
    const summary=(pausedCount||archCount)
      ? `<div class="tg-note">${pausedCount} paused · ${archCount} archived</div>` : '';
    box.innerHTML=head+
      `<div class="tg-grid-wrap"><table class="tg-table"><thead><tr><th>Student</th><th>Period</th><th>Access</th><th>Roster</th><th>Right now</th></tr></thead><tbody>${rows}</tbody></table></div>`+summary;
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
  if(!clear && value!=='4' && value!=='7') return;
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
   trends identically. */
function prEntries(raw){
  if(Array.isArray(raw)) return raw;
  if(raw!=null && String(raw).trim()!=='') return [{value:raw, date:null}];
  return [];
}
function prNum(v){ const m=String(v).match(/\d{2,3}/); return m?m[0]:null; }

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
      (sec.steps||[]).forEach((st,i)=>pushStep(st,`${stationId}-sec${gi}`,i,secRetired||st.hidden===true));
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
    const items=slots.map(sl=>{
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
      const val=(stu.responses&&stu.responses[sl.key]||'').trim();
      if(!val) return '';
      return `<div class="tr-item"><span class="tr-lbl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg> ${escHtml(sl.label)}</span><span class="tr-txt">${escHtml(val)}</span></div>`;
    }).filter(Boolean).join('');
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
  if(snap.empty){ box.innerHTML='<div class="t-loading">No issue reports yet.</div>'; return; }
  const rows=snap.docs.map(doc=>{
    const d=doc.data();
    const when=(d.createdAt&&d.createdAt.toDate) ? d.createdAt.toDate().toLocaleString() : '—';
    const who=d.name||d.email||d.uid||'—';
    return `<tr><td class="nc" title="${escAttr(who)}">${escHtml(who)}</td><td>${escHtml(when)}</td><td>${escHtml(d.location||'')}</td><td>${escHtml(d.message||'')}</td></tr>`;
  }).join('');
  box.innerHTML=`<div class="t-grid-wrap"><table><thead><tr><th class="nc">Student</th><th>When</th><th>Where</th><th>Message</th></tr></thead><tbody>${rows}</tbody></table></div>`;
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
      <div class="t-scard"><div class="t-scard-lbl">Class average</div><div class="t-scard-val">${avgPct}%</div></div>
      <div class="t-scard"><div class="t-scard-lbl">Furthest along</div>${furthestVal}</div>
      <div class="t-scard"><div class="t-scard-lbl">Not started yet</div><div class="t-scard-val">${notStarted}</div></div>
    </div>`;
  const rowsHtml=rows.map(({stu,tally})=>{
    const displayName=stu.name||stu.email||stu.uid.slice(0,8)+'…';
    const rightLbl = tally.furthest===0
      ? `<span class="stu-mod">&mdash;</span><span class="stu-count">0 / ${universe.total}</span>`
      : `<span class="stu-mod">M${tally.furthest}</span><span class="stu-count">${tally.got} / ${universe.total}</span>`;
    return `<button type="button" class="stu-row" data-open-student data-uid="${escAttr(stu.uid)}">
        <div class="stu-name" title="${escAttr(displayName)}">${escHtml(displayName)}${teacherPeriodPillHtml(stu)}${teacherBlockedBadgeHtml(stu)}</div>
        ${teacherBarFillHtml(tally.got,tally.working,universe.total)}
        <div class="stu-right">${rightLbl}</div>
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
    <div class="tr-meta" style="margin-top:10px">Each bar spans the full 13-module course. Tick marks are module boundaries. Click a student to see their work.</div>`;
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

  // Written responses — every response across every set, grouped by module then set.
  let responsesHtml=''; let anyResponse=false;
  MODULE_MANIFEST.forEach(m=>{
    let moduleBlock='';
    SETS.forEach(w=>{
      if(w.moduleNum!==m.num) return;
      const slots=setShortResponses(w);
      if(!slots.length) return;
      const items=slots.map(sl=>{
        if(sl.isPR){
          const entries=prEntries(stu.responses&&stu.responses[sl.key]);
          if(!entries.length) return '';
          const latest=String(entries[entries.length-1].value||'').trim();
          if(!latest) return '';
          const n=prNum(latest);
          const trendHtml=entries.length>1
            ? `<span class="tr-lbl" style="opacity:.7">${entries.slice(-3).map(e=>escHtml(prNum(e.value)||e.value)).join(' &#x2192; ')}</span>` : '';
          return `<div class="tr-item"><span class="tr-pr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none"/></svg> ${escHtml(sl.label)}</span><span class="tr-prval">${n?escHtml(n)+' BPM':escHtml(latest)}</span>${trendHtml}</div>`;
        }
        const val=(stu.responses&&stu.responses[sl.key]||'').trim();
        if(!val) return '';
        return `<div class="tr-item"><span class="tr-lbl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg> ${escHtml(sl.label)}</span><span class="tr-txt">${escHtml(val)}</span></div>`;
      }).filter(Boolean).join('');
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
        +`${e.r.score}/${e.r.total}${e.r.at?` &mdash; ${escHtml(e.r.at)}`:''}`
        +`${Number(e.r.attempts)>1?` <span style="opacity:.6">(${Number(e.r.attempts)} attempts)</span>`:''}</div>`).join('')
    : '';

  // Today's activity gate (Today-first work order, Phase 1) — shown first,
  // ahead of the module chart: a blocked student is the thing that needs
  // acting on right now, and Clear all + a per-activity Clear both reach the
  // same teacherSetActivityClear/teacherClearAllBlockers writers the
  // activity/check detail pages use.
  const blockers=teacherBlockersFor(stu, teacherClassConfig);
  const gateHtml=blockers.length
    ? `<div class="stu-section-head" style="margin-top:0">Today's activity gate</div>
       <div class="tg-note">Blocked by ${blockers.length} — not yet done or cleared.
         <button type="button" class="tg-seg-btn" data-clear-all-blockers data-uid="${escAttr(stu.uid)}" style="margin-left:8px">Clear all</button>
       </div>
       <div class="t-grid-wrap"><table><thead><tr><th class="nc">Activity</th><th>Gate</th></tr></thead><tbody>
         ${blockers.map(a=>`<tr><td class="nc" data-open-activity data-id="${escAttr(a.id)}" style="cursor:pointer">${escHtml(teacherActivityTitle(a,teacherClassConfig))}</td>`
           +`<td><button type="button" class="tg-seg-btn" data-set-activity-clear data-uid="${escAttr(stu.uid)}" data-id="${escAttr(a.id)}" data-state="clear" title="Lets this student past the gate without finishing.">Clear</button></td></tr>`).join('')}
       </tbody></table></div>`
    : '';

  box.innerHTML = `
    ${back}
    <div class="stu-detail-name">${escHtml(displayName)}${teacherPeriodPillHtml(stu)}${teacherBlockedBadgeHtml(stu)}</div>
    <div class="stu-detail-email">${escHtml(email)}</div>
    ${gateHtml}
    <div class="stu-chart" style="margin-bottom:22px">
      ${teacherAxisHeaderHtml(universe)}
      <div class="stu-rows">
        ${teacherTicksHtml(universe)}
        <div style="padding:2px 0">
          <div style="display:grid;grid-template-columns:var(--namecol) 1fr var(--rightcol);column-gap:var(--gap);align-items:center">
            <div></div>
            ${teacherBarFillHtml(tally.got,tally.working,universe.total,'stu-big-track')}
            <div class="stu-right">${tally.furthest===0?'<span class="stu-mod">&mdash;</span>':'<span class="stu-mod">M'+tally.furthest+'</span>'}<span class="stu-count">${tally.total} / ${universe.total}</span></div>
          </div>
        </div>
      </div>
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
