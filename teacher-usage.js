/* ── Usage (2026-11-27) ───────────────────────────────────────────────────
   Jonathan, 2026-11-27 ("build this part"), after a review said nothing on the
   site shows which tools students open or whether minutes track progress.
   One console view, Students → Usage, READ ONLY: it writes nothing anywhere
   and makes no Firestore read of its own except the Practice minutes view's
   own read, and that only on the button (below).

   1. WHICH TOOLS STUDENTS OPEN. Per tool: how many of the students the
      console lists now opened it, and how many opens in all, most to least.
      A tool nobody opened is listed at the bottom as "0 students": those are
      the ones to think about taking away. "The students the console lists" =
      allStudents (the period filter at the top, archived students left out
      unless shown) without the teacher's own account. The counts are
      toolOpens in each student's progress doc, written by the student's own
      page (app/save.js, "Usage counts", which also lists what is and is not
      counted) and read with the rest of the doc by teacherFetchStudents
      (teacher-core.js, whole counts 1..1000 per tool). Counting began on
      TEACHER_USAGE_SINCE, the day it shipped. The tool list is
      teacherUsageTools(): the fixed tools, every Arcade game
      (TEACHER_USAGE_GAMES, one row per GAMES_META key in coach-hub.js;
      checks.mjs 1fu holds the two lists equal) and every Song Journey page
      (SONG_JOURNEYS, app/shell.js). An id no tool here has is not shown.
   2. DO MINUTES TRACK PROGRESS. Per class period, each student's practice
      minutes (all time, the sum of the weeks docs the Practice minutes view
      reads: teacherPmData, teacher-students.js) beside the progress the
      console already has: skills marked "I've got it!" (teacherStudentTally,
      the Students view's number), module steps done (stepsDone,
      teacherFetchStudents) and In-Class activities marked done; and per
      period Spearman's rank correlation of minutes with each, with n.
      Minutes are not read again here: the table uses the Practice minutes
      view's last read, and when there is none this session it offers a
      button that runs that same read (teacherLoadMinutes: one read per
      student's weeks list and one of today's day record).
   Student-written values (names, periods) are escaped where they are drawn. */
const TEACHER_USAGE_SINCE='2026-11-27';
const TEACHER_USAGE_FIXED=[
  {id:'tuner', label:'Tuner', kind:'Floating tools'},
  {id:'metronome', label:'Metronome', kind:'Floating tools'},
  {id:'timer', label:'Timer', kind:'Floating tools'},
  {id:'coach', label:'Listening Coach', kind:'Listening'},
  {id:'strum-check', label:'Strum pattern check (ca-46)', kind:'Listening'},
  {id:'card-song', label:'Play-along card (a whole song)', kind:'In-Class Activities'},
  {id:'card-practice', label:'Practice card (any other card)', kind:'In-Class Activities'},
  {id:'mr-record', label:'Module Review recorder', kind:'Module Review'},
];
// One row per Arcade game, by its GAMES_META key (coach-hub.js), with its English title (i18n.js games.*.title).
const TEACHER_USAGE_GAMES=[
  ['power','Power Chord Switch'], ['fret','Note Hunt'], ['cc','Change Up'], ['radar','Strum Radar'], ['roulette','Riff Roulette'],
  ['noterunner','Note Runner'], ['fingergym','Finger Gym: The Ladder'], ['simonguitar','Pentatonic Simon Guitar Hero'],
  ['tuningsim','Tuning Simulator'], ['runner','Riff Runner'], ['blitz','Chord Blitz'], ['fretzap','Fret Zap'], ['strum','Strum Hero'],
  ['detective','Chord Detective'], ['riffid','Name That Riff'], ['simon','Pentatonic Simon'], ['patterndet','Pattern Detective'],
  ['buildchord','Build-a-Chord'],
];
function teacherUsageTools(){
  const games=TEACHER_USAGE_GAMES.map(([k, label])=>({id:'game-'+k, label, kind:'Arcade games'}));
  const journeys=(typeof SONG_JOURNEYS!=='undefined' ? SONG_JOURNEYS : []).map(sg=>{
    const m=/tabs\/([a-z0-9-]+)\.html/.exec(String(sg.url||''));
    return m ? {id:'journey-'+m[1], label:String(sg.name||m[1]), kind:'Song Journey pages'} : null;
  }).filter(Boolean);
  return TEACHER_USAGE_FIXED.concat(games, journeys);
}
/* PURE: students = [{ toolOpens }], tools = [{ id, label, kind }]. One row per tool: students who opened it (a count
   of 1 or more) and the opens in all; most students first, then most opens, then by name. */
function teacherUsageRows(students, tools){
  return tools.map(t=>{
    let who=0, opens=0;
    students.forEach(s=>{ const v=Number(((s&&s.toolOpens)||{})[t.id])||0; if(v>0){ who++; opens+=v; } });
    return {id:t.id, label:t.label, kind:t.kind, students:who, opens};
  }).sort((a,b)=>(b.students-a.students)||(b.opens-a.opens)||a.label.localeCompare(b.label));
}
/* PURE: 1-based ranks, ties sharing the average of their places (so 3, 5, 5, 9 ranks 1, 2.5, 2.5, 4). */
function teacherUsageRanks(xs){
  const order=xs.map((v,i)=>[v,i]).sort((a,b)=>a[0]-b[0]);
  const r=new Array(xs.length);
  for(let i=0;i<order.length;){
    let j=i;
    while(j+1<order.length && order[j+1][0]===order[i][0]) j++;
    for(let k=i;k<=j;k++) r[order[k][1]]=(i+j)/2+1;
    i=j+1;
  }
  return r;
}
/* PURE: Spearman's rank correlation of two equal-length lists: the Pearson correlation of their ranks (right with
   ties). { n, rho } with rho null when n < 3 or when either list is all one value (flat: no order to compare). */
function teacherUsageSpearman(xs, ys){
  const n=Math.min(xs.length, ys.length);
  if(n<3) return {n, rho:null, flat:false};
  const rx=teacherUsageRanks(xs.slice(0,n)), ry=teacherUsageRanks(ys.slice(0,n));
  const mx=rx.reduce((a,v)=>a+v,0)/n, my=ry.reduce((a,v)=>a+v,0)/n;
  let sxy=0, sxx=0, syy=0;
  for(let i=0;i<n;i++){ const dx=rx[i]-mx, dy=ry[i]-my; sxy+=dx*dy; sxx+=dx*dx; syy+=dy*dy; }
  if(!sxx || !syy) return {n, rho:null, flat:true};
  return {n, rho:Math.max(-1, Math.min(1, sxy/Math.sqrt(sxx*syy)))};
}
// ρ in words, for the summary line. Sizes are the usual rough bands; the sign says which way.
function teacherUsageRhoWords(r){
  if(r.rho===null) return r.flat ? 'no order to compare (every value the same)' : `too few students (n = ${r.n})`;
  const a=Math.abs(r.rho), size=a<0.2?'little or no':a<0.4?'a weak':a<0.7?'a moderate':'a strong';
  const dir=a<0.2?'':r.rho>0?', more minutes with more progress':', more minutes with LESS progress';
  return `ρ = ${r.rho.toFixed(2)}, n = ${r.n}: ${size} link${dir}`;
}
function teacherUsageStudents(){ return (allStudents||[]).filter(s=>s&&s.uid&&!teacherPmIsTeacher(s)); }
function teacherUsageSinceLabel(){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(TEACHER_USAGE_SINCE);
  return m ? new Date(+m[1], +m[2]-1, +m[3], 12).toLocaleDateString([], {month:'short', day:'numeric', year:'numeric'}) : TEACHER_USAGE_SINCE;
}
function teacherUsageToolsHtml(students){
  const rows=teacherUsageRows(students, teacherUsageTools());
  const n=students.length;
  const used=rows.filter(r=>r.students>0), unused=rows.filter(r=>r.students===0);
  const pl=(k, one, many)=>`${k} ${k===1?one:many}`;
  const row=r=>`<tr${r.students?'':' class="us-t-zero"'}><td class="tg-name">${escHtml(r.label)}</td><td class="tg-eff">${escHtml(r.kind)}</td>`
    +`<td class="pm-t-num">${r.students ? `${pl(r.students,'student','students')} <span class="us-t-of">of ${n}</span>` : '0 students'}</td>`
    +`<td class="pm-t-num">${pl(r.opens,'open','opens')}</td></tr>`;
  const groupRow=(label, k)=>`<tr class="tg-group"><th colspan="4">${escHtml(label)} <span>(${k})</span></th></tr>`;
  return `<h3 class="us-t-head">Which tools students open</h3>`
    +`<div class="tr-meta">Counting began on ${escHtml(teacherUsageSinceLabel())}, the day it shipped: nothing before then is counted. One open = one deliberate tap that opens the tool (a reload or a link that reopens it does not count). The ${pl(n,'student','students')} the console lists now (the period filter at the top; archived students only when shown).</div>`
    +`<div class="tg-grid-wrap" data-usage-tools><table class="tg-table pm-t-table us-t-table"><thead><tr><th>Tool</th><th>Kind</th><th>Students who opened it</th><th>Opens in all</th></tr></thead><tbody>`
    +(used.length ? groupRow('Opened', used.length)+used.map(row).join('') : '')
    +(unused.length ? groupRow('Not opened by anyone yet', unused.length)+unused.map(row).join('') : '')
    +`</tbody></table></div>`
    +`<div class="tr-meta" style="margin-top:8px">Not counted: the floating tools on a Song Journey page (those pages save nothing of this), a Song Journey page opened from a bookmark or from another Journey page (only one opened from this site counts), the teacher's account, and a tap inside a set or Module Review that is still locked.</div>`;
}
/* The minutes-and-progress rows for the students shown, worked out from what the console holds. PURE apart from the
   helpers it is handed: students = [{ uid, skills, stepsDone, classActivities }], weeks = { uid: { weekId: seconds } } or
   null, tally(stu) = { got }, period(stu) = the period as a string ('' for none). */
function teacherUsageMinutesRows(students, weeks, tally, period){
  return students.map(s=>{
    const w=weeks && weeks[s.uid];
    let secs=null;
    if(w){ secs=0; Object.keys(w).forEach(k=>{ secs+=Math.max(0, Number(w[k])||0); }); }
    const acts=Object.keys(s.classActivities||{}).filter(k=>s.classActivities[k]===true).length;
    return {uid:s.uid, name:s.name||s.email||String(s.uid).slice(0,8)+'…', period:String(period(s)||''),
      minutes:secs===null?null:Math.floor(secs/60), skills:tally(s).got, steps:Number(s.stepsDone)||0, acts};
  });
}
function teacherUsageMinutesHtml(students){
  const head=`<h3 class="us-t-head">Do minutes track progress?</h3>`;
  const note=`<div class="tr-meta">Practice minutes (all time, counted since Nov 1, 2026) beside skills marked “I’ve got it!”, module steps done and In-Class activities done, per class period. Minutes come from the Practice minutes view’s read; nothing new is read unless you press the button.</div>`;
  const btn=label=>`<button type="button" class="tg-seg-btn pm-t-refresh" data-usage-pm-load ${teacherPmLoading?'disabled':''}>${escHtml(label)}</button>`;
  if(!(window.PM && PM.calc)) return head+note+'<div class="t-loading">Practice minutes did not load on this page. Reload to try again.</div>';
  if(teacherPmLoading && !teacherPmData) return head+note+'<div class="t-loading" data-usage-pm>Reading practice minutes…</div>';
  if(!teacherPmData){
    const why = teacherPmError==='denied' ? 'The Firestore rules that let this console read practice minutes are not published.'
      : teacherPmError==='failed' ? 'Could not read practice minutes.' : 'Practice minutes have not been read yet this session.';
    return head+note+`<div class="pm-t-bar" data-usage-pm><span class="pm-t-when">${escHtml(why)}</span>${btn('Read practice minutes')}</div>`;
  }
  const universe=teacherSkillUniverse();
  // The period as the Practice minutes view groups it: the teacher's override first, else the student's own answer (escaped below).
  const rows=teacherUsageMinutesRows(students, teacherPmData.weeks, s=>teacherStudentTally(s, universe), s=>String(teacherStudentPeriod(s)||''));
  const atD=new Date(teacherPmData.at);
  const at=atD.toLocaleString([], {weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
  const bar=`<div class="pm-t-bar" data-usage-pm><span class="pm-t-when">Practice minutes as of ${escHtml(at)}${teacherPmLoading?' · refreshing…':''}</span>${btn('Read practice minutes again')}</div>`;
  const perRank=p=>p==='4'?4:p==='7'?7:p==='CAS'?8:!p?Infinity:9;
  const periods=[...new Set(rows.map(r=>r.period))].sort((a,b)=>(perRank(a)-perRank(b))||(a<b?-1:a>b?1:0));
  const perLabel=p=>!p?'No period':p==='CAS'?'CAS':'Period '+p;
  const fmt=v=>v===null?'—':String(v);
  let body='', summary='';
  periods.forEach(p=>{
    const list=rows.filter(r=>r.period===p).sort((a,b)=>((b.minutes===null?-1:b.minutes)-(a.minutes===null?-1:a.minutes))||a.name.localeCompare(b.name, undefined, {sensitivity:'base'}));
    const withMin=list.filter(r=>r.minutes!==null);
    const mins=withMin.map(r=>r.minutes);
    const rs=[['skills', 'skills got'], ['steps', 'steps done'], ['acts', 'activities done']].map(([k, label])=>({label, r:teacherUsageSpearman(mins, withMin.map(r=>r[k]))}));
    body+=`<tr class="tg-group"><th colspan="5">${escHtml(perLabel(p))} <span>(${list.length})</span></th></tr>`
      +list.map(r=>`<tr><td class="tg-name" title="${escAttr(r.name)}">${escHtml(r.name)}</td><td class="pm-t-num">${r.minutes===null?'— <span class="us-t-of">not read</span>':`${r.minutes} min`}</td><td class="pm-t-num">${fmt(r.skills)}</td><td class="pm-t-num">${fmt(r.steps)}</td><td class="pm-t-num">${fmt(r.acts)}</td></tr>`).join('');
    summary+=`<li data-usage-rho="${escAttr(p)}"><strong>${escHtml(perLabel(p))}</strong> (${list.length} ${list.length===1?'student':'students'}${list.length>withMin.length?`, ${list.length-withMin.length} with no minutes read`:''}): minutes and ${rs.map(x=>`${escHtml(x.label)} ${escHtml(teacherUsageRhoWords(x.r))}`).join('; ')}.</li>`;
  });
  const table=`<div class="tg-grid-wrap" data-usage-minutes><table class="tg-table pm-t-table us-t-table"><thead><tr><th>Student</th><th>Minutes (all time)</th><th>Skills “I’ve got it!”</th><th>Steps done</th><th>Activities done</th></tr></thead><tbody>${body}</tbody></table></div>`;
  const meaning=`<div class="tr-meta us-t-meaning">ρ (Spearman) compares the ORDER of the students in a period: +1 means more minutes always came with more progress, 0 means no link, −1 the reverse. It says the two go together, not that one causes the other. With few students one or two can swing it a lot: under about 10, read it as a hint at most. Minutes are time the site counted while a student was active on it, not time on a guitar, and they began on Nov 1; skills and steps count the whole year, so a student who did a lot before November has progress without minutes.</div>`;
  return head+note+bar+`<ul class="us-t-rho">${summary}</ul>`+meaning+table;
}
let teacherUsageBound=false;
function renderTeacherUsage(){
  const box=document.getElementById('t-grid-container');
  if(!box) return;
  if(!teacherUsageBound){ box.addEventListener('click', teacherUsageClick); teacherUsageBound=true; }
  const students=teacherUsageStudents();
  if(!students.length){ box.innerHTML='<div class="t-loading" data-tview="usage">No students to show yet.</div>'; return; }
  box.innerHTML=`<div data-tview="usage">${teacherUsageToolsHtml(students)}${teacherUsageMinutesHtml(students)}</div>`;
}
function teacherUsageClick(e){
  if(teacherView!=='usage') return;
  if(e.target.closest('[data-usage-pm-load]')) teacherUsageLoadMinutes();
}
/* The Practice minutes view's own read (teacherLoadMinutes), run from here; this view draws again when it ends. */
async function teacherUsageLoadMinutes(){
  if(teacherPmLoading) return;
  teacherPmError='';
  const p=teacherLoadMinutes();
  if(teacherView==='usage') renderTeacherUsage();
  try{ await p; }catch(e){ /* the read records its own failure (teacherPmError) */ }
  if(teacherView==='usage') renderTeacherUsage();
}
