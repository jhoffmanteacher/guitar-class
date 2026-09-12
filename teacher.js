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
      const actClear=e.target.closest('[data-set-activity-clear]');
      if(actClear){ teacherSetActivityClear(actClear.dataset.uid, actClear.dataset.id, actClear.dataset.state); return; }
      const clearAll=e.target.closest('[data-clear-all-blockers]');
      if(clearAll){ teacherClearAllBlockers(clearAll.dataset.uid); return; }
      const sortTh=e.target.closest('[data-sort-activities]');
      if(sortTh){ teacherSetActivitySort(sortTh.dataset.sortActivities); return; }
      // Rename controls sit INSIDE the title cell, which is itself the
      // data-open-activity link — so they have to be matched before it, or
      // clicking the pencil would navigate away instead of opening the editor.
      // Also inside the title cell, so it's matched before the open-detail
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
      // The number box sits inside the title cell too, and it's a live input
      // rather than a button — swallow the click so aiming at it doesn't
      // navigate to the detail page out from under the cursor. The write
      // happens on 'change', below.
      if(e.target.closest('[data-set-activity-number]')) return;
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
      const actNum=e.target.closest('[data-set-activity-number]');
      if(actNum) teacherSetActivityNumber(actNum.dataset.id, actNum.value);
    });
    // Enter saves, Escape backs out — the rename box is a one-line field in a
    // table cell, not a form, so there's no submit event to lean on.
    shell.addEventListener('keydown', e=>{
      // A number box isn't in a form either, so Enter has nothing to submit —
      // blur it, which fires the 'change' the writer above listens for.
      const numBox=e.target.closest('.t-act-num-input');
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
// Class activities table sort: which column drives the order, and which way.
// Purely local view state (not persisted) — defaults reproduce the table's
// original fixed order (newest-dated first) so switching to this UI didn't
// change anyone's expectations.
let activitySortKey='date';   // 'date' | 'number'
let activitySortDir='desc';   // 'asc' | 'desc'
function applyTeacherViewChrome(v){
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
// Jumps straight to one activity's detail page — from the Class activities
// table's title cell.
function openActivityDetail(id){
  teacherView='activities'; activityDetailId=id;
  applyTeacherViewChrome('activities');
  renderTeacherBody();
}
function backToActivitiesList(){ activityDetailId=null; renderTeacherBody(); }
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
/* opts.cached: repaint from the config already in memory instead of going
   back to Firestore.

   Only for repaints that changed NOTHING in Firestore — a sort click, opening
   or cancelling the rename box, a rejected number entry. Every repaint that
   FOLLOWS A WRITE must stay fresh, and deliberately so: the failure paths in
   teacherSetActivityHidden/Date roll their optimistic change back in memory
   and then repaint to show what Firestore actually holds, and
   teacherSetActivityNumber notes that painting before the read would pull the
   pre-write copy back over the new state. Fresh is therefore the DEFAULT, so
   a call site I misjudged costs one extra read rather than showing the
   teacher stale data.

   The win is not really the read — it is that a sort click no longer blanks
   the table to "Loading…" and waits on a network round trip to redraw rows it
   already has. */
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
function renderTeacherActivities(opts){
  const cached = !!(opts && opts.cached) && teacherClassConfigLoaded;
  const box=document.getElementById('t-grid-container');
  if(activityDetailId){ renderTeacherActivityDetail(activityDetailId); return; }
  const activities=(window.CLASS_ACTIVITIES||[]);
  if(!activities.length){
    box.innerHTML='<div class="t-loading">No activities yet — they\'ll appear here once one is pushed to the site.</div>';
    return;
  }
  if(allStudents.length===0){
    box.innerHTML='<div class="t-loading">No student data yet — students need to sign in first.</div>';
    return;
  }
  if(!cached) box.innerHTML='<div class="t-loading">Loading…</div>';
  (cached ? Promise.resolve(teacherClassConfig) : loadTeacherClassConfig()).then(cfg=>{
    if(teacherView!=='activities') return;   // switched views mid-flight
    if(!cfg) return;                         // superseded by a newer toggle
    const hidden=cfg.hiddenActivities||{};
    const dates=cfg.activityDates||{};
    // Teaching-order numbers with the console's own resequencing applied —
    // id -> 1..N, see teacherActivityNumbers below. Everything in this view
    // that shows or sorts by a number reads THIS, never a.number, or the
    // table would disagree with the students' cards the moment one is moved.
    const nums=teacherActivityNumbers(cfg);
    const today=dayStr(new Date());
    // Sortable by either column, either direction — driven by
    // activitySortKey/activitySortDir (toggled by clicking a header, see
    // teacherSetActivitySort). 'number' sorts on the resolved teaching-order
    // position, never the id (localeCompare would misorder ca-10 before ca-2). 'date' always
    // keeps dated activities ahead of undated ones regardless of direction —
    // an activity with no date isn't "earlier" or "later" than a dated one,
    // so flipping the arrow shouldn't shuffle it in among them — and
    // tiebreaks/undated activities fall back to number in the same direction.
    const dirMul = activitySortDir==='asc' ? 1 : -1;
    const sorted=[...activities].sort((a,b)=>{
      if(activitySortKey==='number') return dirMul*(nums[a.id]-nums[b.id]);
      const da=dates[a.id]||'', db=dates[b.id]||'';
      if(da && !db) return -1;
      if(!da && db) return 1;
      if(da && db) return dirMul*da.localeCompare(db) || dirMul*(nums[a.id]-nums[b.id]);
      return dirMul*(nums[a.id]-nums[b.id]);
    });
    const total=allStudents.length;
    // Checks hold no teaching-order slot, so they don't widen the range a
    // number box will accept — see caNumberMap() in app.js.
    const numberedCount=activities.filter(x=>x.kind!=='check').length;
    const rows=sorted.map(a=>{
      const isCheck=a.kind==='check';
      // A check is "done" when it has been turned in — the same
      // classActivities flag, which ecSubmit sets alongside the score, so
      // this column needs no second source of truth. What it adds is the
      // score: a 12/12 turned-in count over an average of 2.1 is the thing
      // worth seeing before the next lesson.
      const notDone=allStudents.filter(s=>isCheck
        ? !(s.exitChecks||{})[a.id]
        : (s.classActivities||{})[a.id]!==true);
      const doneCount=total-notDone.length;
      const listHtml=notDone.length
        ? notDone.map(s=>`<div style="padding:2px 0">${escHtml(s.name||'(no name)')}${s.email?` &middot; ${escHtml(s.email)}`:''}</div>`).join('')
        : `<div style="padding:2px 0">Everyone has ${isCheck?'turned this one in':'finished this one'}.</div>`;
      const results=isCheck?allStudents.map(s=>(s.exitChecks||{})[a.id]).filter(Boolean):[];
      const itemTotal=isCheck?(((a.check||{}).items)||[]).length:0;
      const avg=results.length?(results.reduce((n,r)=>n+(Number(r.score)||0),0)/results.length).toFixed(1):null;
      const doneCell=isCheck
        ? `${doneCount} / ${total} turned in${avg!==null?` &middot; avg ${avg}/${itemTotal}`:' &middot; avg —'}`
        : `${doneCount} / ${total} students`;
      const isHidden=!!hidden[a.id];
      const dateVal=dates[a.id]||'';
      const isScheduled=dateVal && dateVal>today;
      // data-id + the delegated listeners in showTeacherApp — an activity id
      // is never spliced into an inline JS string literal.
      const visBtns=
        `<button class="tg-seg-btn ${!isHidden?'on':''}" data-set-activity-hidden data-id="${escAttr(a.id)}" data-state="show">Visible</button>`+
        `<button class="tg-seg-btn ${isHidden?'on':''}" data-set-activity-hidden data-id="${escAttr(a.id)}" data-state="hide">Hidden</button>`;
      const dateNote = !dateVal
        ? ' <span style="opacity:.65;font-size:.85em">(no date — hidden from students)</span>'
        : (isScheduled ? ' <span style="opacity:.65;font-size:.85em">(scheduled)</span>' : '');
      const dateCell=`<input type="date" class="t-date-input" data-set-activity-date data-id="${escAttr(a.id)}" value="${escAttr(dateVal)}" aria-label="Release date for ${escAttr(teacherActivityTitle(a,cfg))}">${dateNote}`;
      // Same "#N - Title" form the student card (app.js) and the activity
      // detail page use, so the number reads as part of the name rather than
      // the column needing its own. Two renderings of the same thing: plain
      // text while the rename editor is open (one editable thing per cell),
      // and a live number box otherwise — typing a new position there moves
      // the activity, exactly the way the date input publishes it.
      const shown=teacherActivityTitle(a,cfg);
      // Checks take no teaching-order slot (caNumberMap filters them out), so
      // they get the student-facing "Exit check · " prefix where the number
      // would be — and no number box, because there is no position to type.
      const num=isCheck?'Exit check \u00b7 ':(nums[a.id]?`#${nums[a.id]} - `:'');
      const numCell=isCheck
        ? escHtml(num)
        : (nums[a.id]
          ? `#<input type="number" class="t-act-num-input" data-set-activity-number data-id="${escAttr(a.id)}" value="${nums[a.id]}" min="1" max="${numberedCount}" step="1" title="Teaching-order number — type a new one to move this activity" aria-label="Teaching-order number for ${escAttr(shown)}"> - `
          : '');
      const renamed=shown!==a.title;
      let titleCell;
      if(activityEditId===a.id){
        // Not wrapped in data-open-activity — a click anywhere in an open
        // editor (including a mis-aimed one) must not navigate off the row
        // and throw away what's been typed.
        titleCell=`<td class="nc">`
          +`<span class="t-act-title-lbl">${escHtml(num)}rename (English)</span>`
          +`<input type="text" class="t-act-title-edit" data-id="${escAttr(a.id)}" value="${escAttr(shown)}" maxlength="120" spellcheck="false" aria-label="Rename ${escAttr(shown)} (English)">`
          +`<span class="t-act-title-hint">Students see this right away, in English in both languages, until the Spanish twin ships in the next update.</span>`
          +`<div style="margin-top:7px;display:flex;gap:6px;flex-wrap:wrap">`
          +`<button class="tg-seg-btn on" data-rename-save data-id="${escAttr(a.id)}">Save</button>`
          +`<button class="tg-seg-btn" data-rename-cancel>Cancel</button>`
          +(renamed?`<button class="tg-seg-btn" data-rename-reset data-id="${escAttr(a.id)}">Undo rename</button>`:'')
          +`</div></td>`;
      }else{
        // The title cell doubles as a link into the activity's detail page —
        // handled by the delegated data-id listener in showTeacherApp, same
        // "clickable row, cursor:pointer only" idiom as the Students name cell.
        const renameNote=renamed
          ? `<span class="t-act-title-hint">Renamed — students see this in both languages until the Spanish twin ships. Was: ${escHtml(a.title)}</span>`
          : '';
        // The raw ca-<n> id, shown muted after the title for teacher
        // reference only (Jonathan, 2026-08-24) — students never see it, and
        // it stays put through renames and `number` resequencing since the
        // id is the one permanent handle.
        titleCell=`<td class="nc" data-open-activity data-id="${escAttr(a.id)}" style="cursor:pointer" title="${escAttr(num+shown)}">`
          +`${numCell}${escHtml(shown)} <span style="opacity:.55;font-size:.85em">(${escHtml(a.id)})</span> `
          +`<button class="t-act-pencil" data-rename-activity data-id="${escAttr(a.id)}" title="Rename this activity" aria-label="Rename ${escAttr(shown)}">&#x270E;</button>`
          +`<button class="tg-seg-btn t-act-link" data-copy-activity-link data-id="${escAttr(a.id)}" title="Copy the student link straight to this ${isCheck?'exit check':'activity'}" aria-label="Copy the student link to ${escAttr(shown)}">Copy link</button>`
          +`${renameNote}</td>`;
      }
      return `<tr${isHidden?' style="opacity:.55"':''}><td>${dateCell}</td>${titleCell}<td>${doneCell}</td>
        <td><details><summary>Who hasn't ${isCheck?'turned it in':'finished'} (${notDone.length})</summary>${listHtml}</details></td>
        <td><div class="tg-seg">${visBtns}</div></td></tr>`;
    }).join('');
    // Arrow shows only on whichever column is currently driving the sort.
    const sortArrow=key=> activitySortKey===key ? (activitySortDir==='asc'?' ▲':' ▼') : '';
    box.innerHTML=`<div class="tg-note">An activity with no date set is invisible to students — that's its normal starting state, not an error; set one here to publish it. Hidden activities disappear for students regardless of date, same as if they hadn't been pushed yet. Use Hidden to pull back something already live; un-hide any time. The &#x270E; next to a title renames the activity for everyone. Copy link gives you a URL that opens the site straight to that one activity, card already open — paste it into Classroom when you want students on a specific exit check. Type over the #number to move an activity in the teaching order — everything else renumbers around it, for students too. (That only moves the &#8220;#N&#8221; prefix: a number inside a title, like Finger Gym 2, is part of the name and stays put.) Click Date or Activity below to sort by it; click again to flip the order.</div>`+
      `<div class="t-grid-wrap t-act-wrap"><table><thead><tr>`
      +`<th class="t-sort-th" data-sort-activities="date" title="Sort by date">Date${sortArrow('date')}</th>`
      +`<th class="nc t-sort-th" data-sort-activities="number" title="Sort by activity number">Activity${sortArrow('number')}</th>`
      +`<th>Done</th><th>Not yet</th><th>Visibility</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    // Opening the editor is a full re-render, so focus has to be re-placed
    // afterwards or the pencil click would leave you looking at a box you
    // still have to click into. select() so typing replaces the old name.
    if(activityEditId){
      const inp=box.querySelector('.t-act-title-edit');
      if(inp){ inp.focus(); inp.select(); }
    }
  });
}
// Clicking a sort header: same column clicked again flips direction,
// switching columns picks a sensible default for that column (newest date
// first, lowest activity number first) rather than carrying over whatever
// direction the previous column was left on.
function teacherSetActivitySort(key){
  if(activitySortKey===key) activitySortDir = activitySortDir==='asc' ? 'desc' : 'asc';
  else { activitySortKey=key; activitySortDir = key==='date' ? 'desc' : 'asc'; }
  renderTeacherActivities({cached:true});   // sorting rows we already have
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
    await db.collection('config').doc('class').set(patch,{merge:true});
  }catch(e){
    if(had) teacherClassConfig.activityTitles[id]=prev; else delete teacherClassConfig.activityTitles[id];
    // Leave the editor exactly as it is — re-rendering here would repaint the
    // box from the server's (unchanged) copy and silently discard what was
    // typed, which on a flaky connection is the worst possible outcome.
    activityEditId=id;
    alert('Could not save that rename — check your connection and Firestore rules. What you typed is still in the box.');
    return;
  }
  if(teacherView==='activities') renderTeacherActivities();
}
/* Teaching-order numbers for the whole list, id -> 1..N, with the console's
   resequencing applied. caNumberMap() in app.js does the work and students
   read the same function through caNumber(), so a number shown here is the
   number on their card — this wrapper only feeds it the config doc this view
   already holds instead of app.js's student-side globals. (teacher.js loads
   after app.js and already leans on its helpers; unlike teacherActivityTitle
   there's nothing to fork, because the resolution rule is identical.) */
function teacherActivityNumbers(cfg){
  return caNumberMap(window.CLASS_ACTIVITIES||[], (cfg&&cfg.activityNumbers)||{});
}
/* Move an activity to position n, and renumber everything around it.

   Written as a whole-list rewrite rather than one id -> n row because the
   set has to stay 1..N with no gaps or duplicates — the same contract
   checks.mjs (1d) holds class-activities.js to. Storing just "ca-10 is now
   #4" would leave the old #4 to be resolved by a tiebreak, i.e. by luck.
   So: take the order currently on screen, pull this activity out, splice it
   back in at n, and write the result. Positions that land back on the
   shipped number are DELETED rather than stored, so the map holds only the
   rows that actually differ from the file and empties itself when the order
   is folded back into class-activities.js.

   Each row carries the shipped number it was typed against as `base`, which
   is what expires the override on that fold-in — see caNumberMap in app.js.
   Nothing is keyed to `number` (ids are), so this is safe in a way that
   renumbering ids never would be. */
async function teacherSetActivityNumber(id, value){
  /* Exit checks are excluded from the whole rewrite, not just from the row
     being moved: caNumberMap() gives them no position, so leaving one in
     `order` would splice it into the 1..N run and write it an override with
     base:NaN — a number for something that never shows one. */
  const activities=(window.CLASS_ACTIVITIES||[]).filter(x=>x.kind!=='check');
  const a=activities.find(x=>x.id===id);
  if(!a) return;
  const n=Math.round(Number(value));
  const cur=teacherActivityNumbers(teacherClassConfig);
  // Out of range, unparseable, or already there: repaint, which puts the old
  // number back in the box, and write nothing.
  if(!Number.isFinite(n) || n<1 || n>activities.length || n===cur[id]){
    if(teacherView==='activities') renderTeacherActivities({cached:true});   // nothing was written
    return;
  }
  const order=activities.slice().sort((x,y)=>cur[x.id]-cur[y.id]).filter(x=>x.id!==id);
  order.splice(n-1, 0, a);
  const prev=teacherClassConfig.activityNumbers||{};
  const next={};          // what config/class should hold afterwards
  const drop=[];          // rows to clear, because they're back on their shipped number
  order.forEach((x,i)=>{
    const pos=i+1, base=Number(x.number);
    if(pos===base){ if(Object.prototype.hasOwnProperty.call(prev,x.id)) drop.push(x.id); }
    else next[x.id]={n:pos, base};
  });
  // Overrides for ids no longer in class-activities.js (a retired activity)
  // are carried over untouched — this is a reorder, not a cleanup pass, and
  // caNumberMap ignores them anyway.
  Object.keys(prev).forEach(k=>{ if(!(k in next) && drop.indexOf(k)<0) next[k]=prev[k]; });
  teacherClassConfig.activityNumbers=next;
  try{
    await ensureDb();
    // FieldValue only exists once ensureDb has pulled in the Firestore SDK —
    // same reason every other writer in this file reaches for it in here.
    const fv=firebase.firestore.FieldValue;
    const patch={};
    Object.keys(next).forEach(k=>{ patch[k]=next[k]; });
    drop.forEach(k=>{ patch[k]=fv.delete(); });
    if(Object.keys(patch).length)
      await db.collection('config').doc('class').set({activityNumbers:patch},{merge:true});
  }catch(e){
    teacherClassConfig.activityNumbers=prev;
    alert('Could not save that order — check your connection and Firestore rules.');
  }
  // Rendering only after the write lands: renderTeacherActivities re-reads
  // config/class, so painting first would just pull the pre-write copy back
  // over the optimistic state. Same order as every other writer here.
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
  const box=document.getElementById('t-grid-container');
  const back=`<button type="button" class="stu-back" data-back-to-activities>&#x2190; All activities</button>`;
  const a=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  if(!a){ box.innerHTML=`${back}<div class="t-loading">Could not find that activity — it may have been renamed or removed.</div>`; return; }
  // A check has no steps — its detail page is a results grid, see below.
  if(a.kind==='check') return renderTeacherCheckDetail(a, back);
  const num=teacherActivityNumbers(teacherClassConfig)[a.id];
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
    <div class="stu-section-head" style="margin-top:0">${num?`#${num} - `:''}${escHtml(teacherActivityTitle(a,teacherClassConfig))} <span style="opacity:.55;font-size:.72em">(${escHtml(a.id)})</span></div>
    ${linkRow(a)}
    ${a.intro?`<div class="coach-tip" style="margin:0 2px 16px">${escHtml(a.intro)}</div>`:''}
    <div class="stu-section-head">Students</div>
    <div class="tg-note">Gate: today's activities block the rest of the site until they're done (see the Today-first work order). Clear lets one student past this one without finishing it — a sub day, a connectivity problem, work done on paper.</div>
    ${studentTable}
    <div class="stu-section-head">Preview</div>
    ${stepsHtml || '<div class="stu-empty">No steps on this activity yet.</div>'}`;
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
  const dateNote=dateVal?`Dated ${escHtml(dateVal)}`:'No date set — hidden from students';
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
    <div class="tg-note">${dateNote}. ${withRes.length} of ${allStudents.length} turned in. Checks take no #number — they never enter the teaching-order run.</div>
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
    await db.collection('config').doc('class').set(patch,{merge:true});
  }catch(e){
    // Save failed — undo the optimistic local mutation so the re-render
    // below reflects what Firestore actually holds, not what we hoped for.
    if(had) teacherClassConfig.hiddenActivities[id]=prev; else delete teacherClassConfig.hiddenActivities[id];
    alert('Could not save that change — check your connection and Firestore rules.');
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
    await db.collection('config').doc('class').set(patch,{merge:true});
  }catch(e){
    if(had) teacherClassConfig.activityDates[id]=prev; else delete teacherClassConfig.activityDates[id];
    alert('Could not save that change — check your connection and Firestore rules.');
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
function teacherActivityVisible(a, cfg, today){
  if(((cfg&&cfg.hiddenActivities)||{})[a.id]===true) return false;
  const d=((cfg&&cfg.activityDates)||{})[a.id];
  return d ? d<=today : false;
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
    await db.collection('config').doc('class').set(patch,{merge:true});
  }catch(e){
    if(had) teacherClassConfig.activityClears[uid][id]=prev; else delete teacherClassConfig.activityClears[uid][id];
    alert('Could not save that change — check your connection and Firestore rules.');
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
    await db.collection('config').doc('class').set(patch,{merge:true});
  }catch(e){
    teacherClassConfig.activityClears[uid]=prev;
    alert('Could not save that change — check your connection and Firestore rules.');
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
async function loadTeacherClassConfig(){
  const req = ++teacherClassConfigReq;
  let cfg;
  try{
    await ensureDb();
    const doc = await db.collection('config').doc('class').get();
    cfg = doc.exists ? (doc.data()||{}) : {};
  }catch(e){ cfg = {}; }
  if(!cfg.gameOverrides) cfg.gameOverrides = {};
  if(req !== teacherClassConfigReq) return null;   // a newer request is in flight — discard this one
  teacherClassConfig = cfg;
  teacherClassConfigLoaded = true;
  return teacherClassConfig;
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
    await ensureDb();
    await db.collection('config').doc('class').set({gamesEnabled:enabled},{merge:true});
  }catch(e){
    teacherClassConfig.gamesEnabled = prev;
    alert('Could not save that change — check your connection and Firestore rules.');
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
    await db.collection('config').doc('class').set(patch,{merge:true});
  }catch(e){
    if(had) teacherClassConfig.paused[uid]=prev; else delete teacherClassConfig.paused[uid];
    alert('Could not save that change — check your connection and Firestore rules.');
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
    await db.collection('config').doc('class').set(patch,{merge:true});
  }catch(e){
    if(had) teacherClassConfig.archived[uid]=prev; else delete teacherClassConfig.archived[uid];
    alert('Could not save that change — check your connection and Firestore rules.');
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
    await db.collection('config').doc('class').set(patch,{merge:true});
  }catch(e){
    if(had) teacherClassConfig.periodOverrides[uid]=prev; else delete teacherClassConfig.periodOverrides[uid];
    alert('Could not save that change — check your connection and Firestore rules.');
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
    await db.collection('config').doc('class').set(patch,{merge:true});
  }catch(e){
    if(had) teacherClassConfig.gameOverrides[uid]=prev; else delete teacherClassConfig.gameOverrides[uid];
    alert('Could not save that change — check your connection and Firestore rules.');
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
// visibleSections() is defined in app.js, loaded before this file on every
// page that includes teacher.js — buildLesson() there drops tuning-warmup
// and (Today-first work order, Phase 3) routine/ear-spark/reflection/empty
// take-to-song sections from the rendered/saved section list, so the
// section-index (gi) math here relies on that same global function rather
// than keeping its own copy (both are classic scripts sharing one global
// scope; a second definition here would silently shadow app.js's instead of
// independently verifying it).
//
// STEPS are deliberately NOT filtered through visibleSteps() here, unlike
// every student-facing counter — this view is a historical audit of what a
// student actually wrote, not a completion count, and a step that's since
// gone hidden (or sits inside a now-card-only take-to-song section) may
// still hold a real response from before it was retired. Only the SECTION
// list needs to match app.js's filtering, to keep gi (and so the key) correct.
function setShortResponses(w){
  const out=[];
  ['b','c'].forEach(stationId=>{
    const stn=w.stations&&w.stations[stationId]; if(!stn) return;
    const pushStep=(st,ns,i)=>{
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
      out.push({key:`${w.id}-${ns}-${i}`, label, isPR});
    };
    if(stn.sections) visibleSections(stn,w.moduleNum).forEach((sec,gi)=>(sec.steps||[]).forEach((st,i)=>pushStep(st,`${stationId}-sec${gi}`,i)));
    else if(stn.steps) stn.steps.forEach((st,i)=>pushStep(st,stationId,i));
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
