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
let teacherPmGoalNote=null;    // { week, kind: 'saving'|'saved'|'bad'|'failed'|'newweek' } — the line beside the "This week's goal" box
/* THIS WEEK'S GOAL (2026-11-09): the engine's settings plus the per-week goals the console holds (pmWeekGoals, from the one
   read of the class settings that the view makes with the weeks). PM.cfg() carries the flat goal and the cap; the map is
   cleaned by the engine's own PM.calc.cleanWeekGoals, so the table, the box and the student pages read one set of numbers. */
function teacherPmCfg(){
  const base=PM.cfg();
  return Object.assign({}, base, {weekGoals: PM.calc.cleanWeekGoals(teacherClassConfig.pmWeekGoals, base)});
}
// The goal in words, for the table's footnote. Pure: (cfg with weekGoals, week id, PM.calc).
function teacherPmGoalPhrase(c, weekId, calc){
  const flat=Math.round(c.weeklyGoalMinutes), secs=calc.goalSeconds(c, weekId), own=calc.weekGoalOf(c, weekId);
  if(calc.skipSet(c)[weekId] || secs===0) return 'none: this is a break week';
  return own===null ? `${flat} minutes` : `${secs/60} minutes, set for this week only (usually ${flat})`;
}
/* The "This week's goal (minutes)" box. Pure: (cfg with weekGoals, the week it is for, PM.calc, the note to show).
   Blank = the normal goal (its number is the placeholder); 0 = a break week; a week that skipWeeks already makes a break
   in the settings file shows that and is switched off. A text box with inputmode numeric, not type=number: no spinner
   arrows, so a value is saved once, on Enter or when the box is left, never once per click. */
function teacherPmGoalBoxHtml(c, weekId, calc, note){
  const max=calc.maxWeekGoalMinutes(c), flat=Math.round(c.weeklyGoalMinutes), own=calc.weekGoalOf(c, weekId);
  const mon=calc.weekMonday(weekId), sun=calc.addDays(mon, 6);
  const fmt=d=>d.toLocaleDateString([], {weekday:'short', month:'short', day:'numeric'});
  const noteText={saving:'Saving…', saved:'Saved', bad:`Use a whole number from 0 to ${max}, or leave the box blank.`, failed:'Not saved.', newweek:'A new week started, so the box now shows the new week.'};
  // "Saved" is said only while the box still holds what was saved: another console may have changed or cleared it since.
  const shown=note && note.week===weekId && noteText[note.kind] && (note.kind!=='saved' || note.value===(own===null?null:own));
  const note1=shown ? `<span class="pm-t-goal-state ${note.kind==='saved'?'ok':note.kind==='bad'||note.kind==='failed'?'err':''}" role="status">${escHtml(noteText[note.kind])}</span>` : '<span class="pm-t-goal-state" role="status"></span>';
  const control = calc.skipSet(c)[weekId]
    ? `<input type="text" class="pm-t-goal-in pm-t-goal-off" id="pm-t-goal-in" value="Break week (set in config)" disabled>`
    : `<input type="text" class="pm-t-goal-in" id="pm-t-goal-in" inputmode="numeric" maxlength="3" autocomplete="off" placeholder="${flat}" value="${own===null?'':own}" data-pm-goal data-week="${escAttr(weekId)}"${note && note.week===weekId && note.kind==='saving' ? ' disabled' : ''}>`;   // switched off while its own save is out: no second edit on top of it
  return `<div class="pm-t-goal"><label class="tg-class-lbl" for="pm-t-goal-in">This week’s goal (minutes)</label>${control}${note1}`+
    `<div class="tr-meta pm-t-goal-note">Week of ${escHtml(fmt(mon))} to ${escHtml(fmt(sun))}. Blank = ${flat}. 0 = break week. Goes back to ${flat} next Monday.</div></div>`;
}
function teacherPmIsTeacher(s){
  const me=(typeof currentUser!=='undefined'&&currentUser)||null;
  return (typeof TEACHER_EMAIL!=='undefined' && s.email===TEACHER_EMAIL) || !!(me && me.uid && s.uid===me.uid);
}
// Everyone whose minutes are read and ranked: the whole roster but the teacher.
function teacherPmRoster(){ return (allStudentsRaw||[]).filter(s=>s&&s.uid&&!teacherPmIsTeacher(s)); }
// The period the student side ranks a Top 5 in: the same override-first value (PM_HOST.period), 4 / 7 / CAS only.
// Own keys only: a period the student typed as 'constructor' or 'toString' is no period (hostPeriod() in the engine agrees).
function teacherPmPeriod(s){ const p=String(teacherStudentPeriod(s)||''); return Object.prototype.hasOwnProperty.call(TEACHER_PM_PERIODS,p)?p:''; }
/* The console's ONE read under minutes/: one student's weeks list, from the server. The Practice minutes view and the
   Backup (teacher-backup.js) both read through it, so checks.mjs 1cg still finds the console's one minutes read here. */
function teacherPmWeeksGet(s){ return db.collection('minutes').doc(s.uid).collection('weeks').get({source:'server'}); }
async function teacherLoadMinutes(){
  const gen=++teacherPmGen;
  const roster=teacherPmRoster();
  teacherPmLoading=true;
  if(teacherPmGoalNote && teacherPmGoalNote.kind!=='saving') teacherPmGoalNote=null;   // "Saved" / "Not saved." belong to the moment they were said
  if(teacherView==='minutes') renderTeacherMinutes();
  // The class settings are read with the weeks, once per open / Refresh (this week's goal lives there). Its answer is awaited below.
  const settingsRead=loadTeacherClassConfig();
  const out={};
  let next=0, stop=false;
  const worker=async()=>{
    while(!stop && next<roster.length){
      const s=roster[next++];
      const snap=await withTimeout(teacherPmWeeksGet(s), TEACHER_PM_READ_MS);
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
  // A failed read is recorded as teacherClassConfigReadOk=false and never rejects; one that stalls gets the weeks read's ceiling and ends the load like a stalled weeks read (Refresh retries).
  try{ await withTimeout(settingsRead, TEACHER_PM_READ_MS); }catch(e){ err=err||e; }
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
function renderTeacherMinutes(force){
  const box=document.getElementById('t-grid-container');
  if(!box) return;
  /* A half-typed goal is not painted away (2026-11-09 review): a load finishing, a tab return or a sort click repainted the whole view and
     took the text with it. The box is committed by Enter or by leaving it ('change' -> a save -> a repaint made with force), so a repaint
     waits for that. Only the goal box's own writer paints with force. */
  const typing=document.activeElement;
  if(!force && typing && typeof typing.matches==='function' && typing.matches('[data-pm-goal]') && typing.value!==typing.defaultValue) return;
  // The engine on this page may be an older copy (practice-minutes.js is precached, teacher.js is not): every function the view calls must be there.
  if(!(window.PM && PM.calc && PM.calc.rankPlace && PM.calc.cleanWeekGoals && PM.calc.weekGoalOf && PM.calc.maxWeekGoalMinutes)){ box.innerHTML='<div class="t-loading">Practice minutes did not load on this page. Reload to try again.</div>'; return; }
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
  /* This week's goal: the engine's settings with the goals set from this console. The box is for the CURRENT week (the one a student
     is in now), shown whenever the class settings were read; the table works every week out with the same tc, so a week with its own
     goal is judged by it and the others by the flat one, exactly as each student's own page does. */
  const tc=teacherPmCfg(), nowWeek=PM.calc.weekIdOf(nowYmd);
  const goalBox=teacherClassConfigReadOk ? teacherPmGoalBoxHtml(tc, nowWeek, PM.calc, teacherPmGoalNote) : '';
  // Refused with nothing read yet: the rules are not published. A refusal AFTER a good read keeps the table ("Could not refresh").
  if(teacherPmError==='denied' && !teacherPmData){ box.innerHTML=head+goalBox+'<div class="t-loading" data-pm-denied>Publish the new Firestore rules to see practice minutes (Firebase console → Firestore → Rules).</div>'; return; }
  if(!teacherPmData){ box.innerHTML=head+goalBox; return; }
  // Without the class settings the goal of this week is unknown, and the table's goals, hits and streaks would be a confident wrong answer.
  if(!teacherClassConfigReadOk){ box.innerHTML=head+`<div class="t-loading" data-pm-settings-failed>${teacherPmLoading?'Reading the class settings…':'Could not read the class settings, so this week’s goal is not known and the table is not shown. Press Refresh to try again.'}</div>`; return; }
  const shown=allStudents.filter(s=>s&&s.uid&&!teacherPmIsTeacher(s)&&teacherPmData.weeks[s.uid]);
  if(!shown.length){ box.innerHTML=head+goalBox+'<div class="t-loading">No students to show.</div>'; return; }
  const rows=teacherPmCompute(roster.filter(s=>teacherPmData.weeks[s.uid]).map(s=>({uid:s.uid, period:teacherPmPeriod(s)})), teacherPmData.weeks, tc, PM.calc.ymd(atD), PM.calc);   // as of the read, like the stamp
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
  const c=tc, tableWeek=PM.calc.weekIdOf(PM.calc.ymd(atD));   // the week the table's "This week" column is: the read's own day
  box.innerHTML=head+goalBox+
    `<div class="tg-grid-wrap" data-tview="minutes"><table class="tg-table pm-t-table"><thead><tr><th>Student</th><th>Period</th><th>This week</th><th>Last week</th><th>Streak</th><th>All time</th><th>Class rank</th><th>Top 5</th></tr></thead><tbody>${body}</tbody></table></div>`+
    `<div class="tr-meta" style="margin-top:10px">This week: minutes / goal (Monday to Sunday). The goal this week: ${escHtml(teacherPmGoalPhrase(c, tableWeek, PM.calc))}. ✓ = goal hit; "break" = a week off, no goal. Class rank counts every student with at least 1 minute, whatever the period filter shows. Top 5 is inside the student's period, this week; "—" = under ${Math.round(+c.top5MinMinutes||0)} minutes this week. A student's own screen reads the rank from a board that can trail by a few minutes and counts only students who have opened the site since Nov 5, so their rank may differ slightly from this one. This one is the true number.</div>`;
}
function teacherSetMinutesSort(v){
  if(v!=='week' && v!=='all' && v!=='name') return;
  teacherPmSort=v;
  if(teacherView==='minutes') renderTeacherMinutes();
}
/* THIS WEEK'S GOAL — the one write the Practice minutes view makes (2026-11-09; Jonathan: "the edit would be for the week only,
   then the next week would reset back to 60"). It stays OUTSIDE the view's read-only block on purpose: checks.mjs 1cg bans any
   write inside that block and allows this one function, by name, to write config/class.pmWeekGoals and nothing else.
   One cell, { pmWeekGoals: { '2026-W46': 30 } }, written through teacherWriteConfig() CELL-CHECKED on that cell (the same shape as
   teacherSetStudentPeriod): another console's unrelated edit goes through, a change to this week's goal made elsewhere refuses.
   A blank box clears the cell with FieldValue.delete(), so config/class gets no row for a week that was never changed. Old weeks
   stay in the map on purpose: they are what keeps a past streak judged by the goal that week had. The value is a whole number
   from 0 to the engine's PM.calc.maxWeekGoalMinutes (7 x the daily cap); anything else writes nothing. 0 = a break week.
   The week is the one the box was drawn for (data-week); if a new week has started since, nothing is written. */
async function teacherSetPmWeekGoal(weekId, raw){
  if(!(window.PM && PM.calc && PM.calc.cleanWeekGoals && PM.calc.maxWeekGoalMinutes && PM.calc.weekIdOf && PM.calc.skipSet) || !/^\d{4}-W\d{2}$/.test(String(weekId))) return;
  const calc=PM.calc, c=PM.cfg(), max=calc.maxWeekGoalMinutes(c), thisWeek=calc.weekIdOf(calc.ymd(new Date()));
  // Every repaint made here is forced: it is the box's own answer to what was just typed, and the typed box is the one being committed.
  const note=(kind, week, value)=>{ teacherPmGoalNote={week:week||weekId, kind, value}; if(teacherView==='minutes') renderTeacherMinutes(true); };
  if(weekId!==thisWeek){ note('newweek', thisWeek); return; }
  if(calc.skipSet(c)[weekId]) return;   // a break set in the settings file: the box is switched off
  /* The last read of the class settings failed (the copy is {}, its version 0): a write worked out from it would be refused as "another tab" or,
     for a clear, do nothing and say nothing. The view is about to draw its "Could not read the class settings" line; the box is gone with it. */
  if(!teacherClassConfigReadOk){ if(teacherView==='minutes') renderTeacherMinutes(true); return; }
  const text=String(raw==null?'':raw).trim(), clear=text==='';
  if(!clear && !(/^[0-9]{1,3}$/.test(text) && Number(text)<=max)){ note('bad'); return; }
  const n=clear ? undefined : Number(text);
  const cfg=teacherClassConfig;
  if(!cfg.pmWeekGoals || typeof cfg.pmWeekGoals!=='object' || Array.isArray(cfg.pmWeekGoals)) cfg.pmWeekGoals={};
  const had=Object.prototype.hasOwnProperty.call(cfg.pmWeekGoals, weekId), prev=cfg.pmWeekGoals[weekId];
  if(clear ? !had : (had && prev===n)){ teacherPmGoalNote=null; if(teacherView==='minutes') renderTeacherMinutes(true); return; }   // nothing to change
  if(clear) delete cfg.pmWeekGoals[weekId]; else cfg.pmWeekGoals[weekId]=n;
  note('saving');
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const patch = clear ? {pmWeekGoals:{[weekId]:fv.delete()}} : {pmWeekGoals:{[weekId]:n}};
    await teacherWriteConfig(patch, {['pmWeekGoals.'+weekId]: had?prev:undefined});
    note('saved', weekId, clear ? null : n);
  }catch(e){
    const goals=teacherClassConfig.pmWeekGoals || (teacherClassConfig.pmWeekGoals={});
    if(had) goals[weekId]=prev; else delete goals[weekId];
    note('failed');
    teacherConfigSaveFailed(e, 'Could not save this week’s goal — check your connection and Firestore rules.');
  }
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
