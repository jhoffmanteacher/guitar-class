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
const IS_TEACHER_MODE=new URLSearchParams(window.location.search).has('teacher');
let teacherSetId=null, allStudents=[];

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
    toggle.insertAdjacentHTML('beforeend', `<button class="t-vt" data-view="trouble" onclick="setTeacherView('trouble')">&#x1FA79; Trouble spots</button>`);
  }
  if(toggle && !toggle.querySelector('[data-view="students"]')){
    toggle.insertAdjacentHTML('beforeend', `<button class="t-vt" data-view="students" onclick="setTeacherView('students')">&#x1F464; Students</button>`);
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
  if(legend && !legend.querySelector('[data-leg="coach-override"]')){
    legend.insertAdjacentHTML('beforeend', `<div class="t-leg" data-leg="coach-override" title="Marked without a passing Listening Coach check — usually a mic or room issue, not a sign the student can't play it."><span class="tck yes" style="display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border:2px dashed var(--text3)">${TCK_CHECK_SVG}</span> Marked without a Coach pass</div>`);
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
      const open=e.target.closest('[data-open-student]');
      if(open) openStudentDetail(open.dataset.uid);
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

function renderTeacherSetTabs(){
  const c=document.getElementById('t-week-tabs'); c.innerHTML='';
  SETS.forEach(w=>{
    if(!w.skills||w.skills.length===0) return;
    const btn=document.createElement('button');
    btn.className='t-wtab'+(w.locked?' locked':'')+(w.id===teacherSetId?' on':'');
    btn.textContent=w.label; btn.dataset.id=w.id;
    if(!w.locked) btn.onclick=()=>{ teacherSetId=w.id; activateTeacherSetTab(w.id); renderTeacherBody(); };
    c.appendChild(btn);
  });
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
  summaryEl.insertAdjacentHTML('beforebegin', `<div id="t-load-warning" class="t-loading">&#x26A0;&#xFE0F; ${escHtml(label)} skill data failed to load — counts and percentages below may be incomplete. Check the browser console for details, or reload.</div>`);
}

async function loadAllStudents(){
  try{
    await ensureDb();
    const snap=await db.collection('progress').get();
    allStudents=[];
    snap.forEach(doc=>{
      const raw=doc.data().skills||{};
      const skills={};
      Object.keys(raw).forEach(k=>{
        if(raw[k]===true) skills[k]='gotit';
        else if(raw[k]==='working'||raw[k]==='gotit') skills[k]=raw[k];
        else skills[k]='none';
      });
      const gamesData=doc.data().games||{};
      allStudents.push({uid:doc.id,skills,name:doc.data().name||'',email:doc.data().email||'',responses:doc.data().responses||{},coachSkill:gamesData.coachSkill||{}});
    });
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
  const w=SETS.find(x=>x.id===teacherSetId); if(!w||!w.skills) return;
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
const TEACHER_COACH_GATE_MIN_LEVEL=2; // keep in sync with app.js COACH_GATE_MIN_LEVEL
function tckSpanHtml(status, coachRec){
  if(status==='gotit'){
    if(coachRec && coachRec.level>=TEACHER_COACH_GATE_MIN_LEVEL){
      const lvl=coachLevelLabel(coachRec.level)||'checked';
      const dateStr=coachRec.at||'';
      const title=`Listening Coach verified — ${lvl}${dateStr?(' · '+dateStr):''}`;
      return `<span class="tck yes" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:2px solid var(--blue-text)" title="${escAttr(title)}">${TCK_CHECK_SVG}</span>`;
    }
    if(coachRec && coachRec.override){
      const dateStr=coachRec.overrideAt||coachRec.at||'';
      const priorLevel=coachLevelLabel(coachRec.level);
      const priorPart=priorLevel?` Last Listening Coach attempt: ${priorLevel}.`:'';
      const title=`Marked "I’ve got it!" without a passing Listening Coach check${dateStr?(' on '+dateStr):''}.${priorPart} This usually means the mic or the room wasn’t cooperating, not that the student can’t play it — worth a quick check-in if you’re not sure.`;
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
  const sorted=[...allStudents].sort((a,b)=>w.skills.filter(s=>b.skills[s.id]==='gotit').length-w.skills.filter(s=>a.skills[s.id]==='gotit').length);
  const headerCells=w.skills.map(s=>`<th title="${escAttr(s.text)}">${escHtml(abbreviate(s.text))}</th>`).join('');
  const rows=sorted.map(stu=>{
    const done=w.skills.filter(s=>stu.skills[s.id]==='gotit').length;
    const total=w.skills.length;
    const pct=Math.round(done/total*100);
    const pillClass=pct===100?'pp-hi':pct>=50?'pp-mid':'pp-lo';
    const displayName=stu.name||stu.email||stu.uid.slice(0,8)+'…';
    const cells=w.skills.map(s=>`<td>${tckSpanHtml(stu.skills[s.id]||'none', stu.coachSkill&&stu.coachSkill[s.id])}</td>`).join('');
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
function applyTeacherViewChrome(v){
  document.querySelectorAll('.t-vt').forEach(b=>b.classList.toggle('on',b.dataset.view===v));
  const legend=document.getElementById('t-legend'); if(legend) legend.style.display = v==='skills' ? '' : 'none';
  // Games, Trouble-spots and Students are all class-wide, not per-week —
  // hide the week tabs and the skill summary while any of them is showing.
  const classWide = v==='games'||v==='trouble'||v==='students';
  const tabs=document.getElementById('t-week-tabs'); if(tabs) tabs.style.display = classWide ? 'none' : '';
  const summ=document.getElementById('t-summary'); if(summ) summ.style.display = classWide ? 'none' : '';
}
function setTeacherView(v){
  teacherView=v;
  if(v==='students') studentDetailUid=null; // clicking the tab always starts back at the roster
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
function renderTeacherBody(){
  if(teacherView==='games') renderTeacherGames();
  else if(teacherView==='responses') renderTeacherResponses();
  else if(teacherView==='trouble') renderTeacherTrouble();
  else if(teacherView==='students') studentDetailUid ? renderTeacherStudentDetail(studentDetailUid) : renderTeacherStudents();
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
  return teacherClassConfig;
}
function renderTeacherGames(){
  const box=document.getElementById('t-grid-container');
  box.innerHTML='<div class="t-loading">Loading game settings…</div>';
  loadTeacherClassConfig().then(cfg=>{
    if(!cfg) return;   // superseded by a newer toggle — leave the newer render's DOM alone
    const classOn = cfg.gamesEnabled!==false;
    const ov = cfg.gameOverrides||{};
    const classCtl=`
      <div class="tg-class">
        <div class="tg-class-lbl">🎮 Games for the whole class</div>
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
        `<td class="tg-eff">${effective?'🎮 available':'— hidden'}</td></tr>`;
    }).join('');
    box.innerHTML=classCtl+
      `<div class="tg-grid-wrap"><table class="tg-table"><thead><tr><th>Student</th><th>Games access</th><th>Right now</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  });
}
async function teacherSetClassGames(enabled){
  teacherClassConfig.gamesEnabled=enabled;
  try{
    await ensureDb();
    await db.collection('config').doc('class').set({gamesEnabled:enabled},{merge:true});
  }catch(e){ alert('Could not save that change — check your connection and Firestore rules.'); }
  renderTeacherGames();
}
async function teacherSetStudentGames(uid, state){
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    if(!teacherClassConfig.gameOverrides) teacherClassConfig.gameOverrides={};
    let patch;
    if(state==='default'){ patch={gameOverrides:{[uid]:fv.delete()}}; delete teacherClassConfig.gameOverrides[uid]; }
    else { const val=state==='on'; patch={gameOverrides:{[uid]:val}}; teacherClassConfig.gameOverrides[uid]=val; }
    await db.collection('config').doc('class').set(patch,{merge:true});
  }catch(e){ alert('Could not save that change — check your connection and Firestore rules.'); }
  renderTeacherGames();
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
// Mirrors app.js's isTuningWarmupSection() — sectionsHtml() there drops the
// generic tuning warm-up section from the rendered/saved section list for
// every module except 1, so the section-index math here must match or the
// -sec{n} keys built below point at the wrong prompt.
function isTuningWarmupSection(sec, moduleNum){
  return sec.title === 'Warm-up — tuning check (Module 1)' && moduleNum !== 1;
}
function setShortResponses(w){
  const out=[];
  ['b','c'].forEach(stationId=>{
    const stn=w.stations&&w.stations[stationId]; if(!stn) return;
    const pushStep=(st,ns,i)=>{
      if(!st.response||st.response.type!=='short') return;
      const prompt=st.response.prompt||'';
      const isPR=/personal record/i.test(prompt)||/\bBPM\b/i.test(prompt);
      let label;
      const chal=(st.text||'').match(/Challenge\s*\d+\s*[—–-]\s*([^:(]+)/);
      const ph=st.response.placeholder||'';
      if(isPR) label=chal?('PR — '+chal[1].trim()):'Personal record (BPM)';
      else if(/wrap-?up|reflect/i.test(st.text||'')) label='Wrap-up reflection';
      else if(prompt) label=prompt.replace(/\s+/g,' ').slice(0,70);
      else if(ph && !/^e\.g\./i.test(ph)) label=ph.replace(/\s+/g,' ').slice(0,70); // placeholder is the question, not an example
      else label=chal?chal[1].trim():'Written response';
      out.push({key:`${w.id}-${ns}-${i}`, label, isPR});
    };
    if(stn.sections) stn.sections.filter(sec=>!isTuningWarmupSection(sec,w.moduleNum)).forEach((sec,gi)=>(sec.steps||[]).forEach((st,i)=>pushStep(st,`${stationId}-sec${gi}`,i)));
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
        return `<div class="tr-item"><span class="tr-pr">&#x1F3AF; ${escHtml(sl.label)}</span><span class="tr-prval">${n?escHtml(n)+' BPM':escHtml(latest)}</span>${trendHtml}</div>`;
      }
      const val=(stu.responses&&stu.responses[sl.key]||'').trim();
      if(!val) return '';
      return `<div class="tr-item"><span class="tr-lbl">&#x270D; ${escHtml(sl.label)}</span><span class="tr-txt">${escHtml(val)}</span></div>`;
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
  const rows=allStudents.map(stu=>({stu, tally:teacherStudentTally(stu, universe)})).sort((a,b)=>(b.tally.furthest-a.tally.furthest)||(b.tally.total-a.tally.total));
  const studentsCount=allStudents.length;
  const avgPct=Math.round(rows.reduce((a,r)=>a+r.tally.total,0)/(studentsCount*universe.total)*100);
  const furthestStu=rows[0].stu;
  const notStarted=rows.filter(r=>r.tally.total===0).length;
  const scard=`<div class="t-summary" style="margin-top:0">
      <div class="t-scard"><div class="t-scard-lbl">Students</div><div class="t-scard-val">${studentsCount}</div></div>
      <div class="t-scard"><div class="t-scard-lbl">Class average</div><div class="t-scard-val">${avgPct}%</div></div>
      <div class="t-scard"><div class="t-scard-lbl">Furthest along</div><div class="t-scard-val" style="font-size:1.0625rem;line-height:1.5rem" title="${escAttr(furthestStu.name||furthestStu.email||furthestStu.uid)}">${escHtml(furthestStu.name||furthestStu.email||furthestStu.uid.slice(0,8)+'…')}</div></div>
      <div class="t-scard"><div class="t-scard-lbl">Not started yet</div><div class="t-scard-val">${notStarted}</div></div>
    </div>`;
  const rowsHtml=rows.map(({stu,tally})=>{
    const displayName=stu.name||stu.email||stu.uid.slice(0,8)+'…';
    const rightLbl = tally.furthest===0
      ? `<span class="stu-mod">&mdash;</span><span class="stu-count">0 / ${universe.total}</span>`
      : `<span class="stu-mod">M${tally.furthest}</span><span class="stu-count">${tally.total} / ${universe.total}</span>`;
    return `<button type="button" class="stu-row" data-open-student data-uid="${escAttr(stu.uid)}">
        <div class="stu-name" title="${escAttr(displayName)}">${escHtml(displayName)}</div>
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
  const stu=allStudents.find(s=>s.uid===uid);
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
          return `<div class="tr-item"><span class="tr-pr">&#x1F3AF; ${escHtml(sl.label)}</span><span class="tr-prval">${n?escHtml(n)+' BPM':escHtml(latest)}</span>${trendHtml}</div>`;
        }
        const val=(stu.responses&&stu.responses[sl.key]||'').trim();
        if(!val) return '';
        return `<div class="tr-item"><span class="tr-lbl">&#x270D; ${escHtml(sl.label)}</span><span class="tr-txt">${escHtml(val)}</span></div>`;
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

  // Every skill, grouped by module then set — only modules this student has touched.
  let skillsHtml='';
  universe.modules.forEach(m=>{
    const touched=m.ids.some(id=>stu.skills[id]==='gotit'||stu.skills[id]==='working');
    if(!touched) return;
    skillsHtml+=`<div class="stu-section-head">Module ${m.num} — ${escHtml(m.name)}</div>`;
    SETS.forEach(w=>{
      if(w.moduleNum!==m.num || !w.skills || !w.skills.length) return;
      skillsHtml+=`<div class="stu-set-head">${escHtml(w.label)}</div>`;
      w.skills.forEach(sk=>{ skillsHtml+=`<div class="stu-skill-row">${tckSpanHtml(stu.skills[sk.id]||'none', stu.coachSkill&&stu.coachSkill[sk.id])}<span>${escHtml(sk.text)}</span></div>`; });
    });
  });
  if(!skillsHtml) skillsHtml='<div class="stu-empty">No skills started yet.</div>';

  box.innerHTML = `
    ${back}
    <div class="stu-detail-name">${escHtml(displayName)}</div>
    <div class="stu-detail-email">${escHtml(email)}</div>
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

    <div class="stu-section-head">Module-by-module progress</div>
    ${modRows}

    <div class="stu-section-head">Skills</div>
    ${skillsHtml}
  `;
  window.scrollTo({top:0});
}
