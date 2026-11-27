/* ── Week-later checks (2026-11-27) ───────────────────────────────────────
   Jonathan, 2026-11-27 ("build this part"), after a review said nothing on the site shows whether a skill marked
   "I've got it" holds up a week later. One console view, Students → Week-later checks: a short list of (student,
   skill) pairs for one class period, each a playable skill the student marked "I've got it" at least a week ago,
   for the teacher to hear ONCE, unassisted (no backing track, no help), and mark Held / Not yet / Skip (absent),
   with Undo for the last mark and a summary of what held. NOT A GRADE, and no student sees any of it: the
   student's pages never read what this keeps, and none of it is in the class database (see STORAGE).

   WHAT "A WEEK" IS MEASURED FROM. A skill's tick carries no time: progress/{uid}.skills[id] is just 'gotit'
   (toggleSkill, app/audio-ui.js). The one saved day that bounds it is the streak's lastDay: bumpPracticeStreak
   (app/save.js) sets it to the student's own date each time they mark ANY skill "I've got it" (toggleSkill's got-it
   branch is its only caller; the streak itself is shown nowhere since the Daily 5 was switched off). So every skill
   a student has marked now was marked on or before that day, and when that day is TEACHER_SPOT_MIN_DAYS (7) or more
   whole calendar days before today (this computer's date), every one of their ticks is at least a week old. A
   student who marked anything in the last 7 days, or whose doc holds no such day, is not drawn at all; the view says
   how many of each. teacherFetchStudents (teacher-core.js) keeps the day as lastGotItDay ('' when absent or not a
   YYYY-MM-DD date). Honest limits: a session whose sign-in read failed saves its ticks but holds the streak back
   (LOAD_DEPENDENT_SAVE_KEYS, app/save.js), so a tick made in such a session is not in the day; the day is the
   student's own Chromebook date. A day per skill would let a student who ticks something every week be drawn too:
   that is a change to the student's save path (Always Reviewed), not made here.

   WHICH SKILLS (teacherSpotPlayable). Only skills a teacher can hear in about 20 seconds: a skill whose practice is
   played on the guitar (practice.type playSeq, chord or pr: the Coach gate and the tempo ladder), or whose English
   wording starts with a playing verb (Play, Fret, Strum, Switch, Keep, Hold, …) or says "and play" / "while strumming
   / picking". Left out: knowledge skills (name, explain, read, tell, …), a whole song, a verse, a backing track,
   12 bars, an audience, a TAB found online, tuning with a tuner, and Module 13 (restringing; its checklist is the
   graded assessment). The criterion shown on each row is the skill's own gotItWhen line ("You've got it when …").

   THE DRAW (teacherSpotDraw, PURE, seeded). From the students the console lists under the period filter at the top
   (one period: under All the view asks for one), the teacher's own account left out: every student who can be
   drawn, ordered by how many checks they have had (Held or Not yet; a Skip is not a check), fewest first, ties in a
   random order; the first TEACHER_SPOT_MAX (8) of them, one row each, so no student is in a list twice. For each, one
   of their playable ticked skills: the pair checked least, then a skill not already in this list, then the skill
   checked least across the class, then random. The seed is the day, the period and the draw number, and the list is
   KEPT (STORAGE) the first time it is drawn that day, so a reload the same day shows the same list; "Draw again"
   draws the next number. The size control (3 / 5 / 8, default 5, remembered per browser) shows the first 3, 5 or 8
   rows of the one list (rows marked beyond them stay on screen). A row whose student is no longer listed (archived,
   period changed, removed) is not drawn.

   STORAGE (TEACHER_SPOT_STORE: the adapter, the only code that touches where results live). No place the teacher
   can write today fits (firestore.rules, 2026-11-27): progress/{uid} is never written by the console (CLAUDE.md
   "Never"); config/class is read by every student, so per-student results there would show; config/access holds
   only the allow list; accessRequests, songRequests and the live-quiz answers take only a status, a note or a
   delete; songDrafts is the Song builder's own store (it lists every doc in it as a draft); every other teacher
   write is a shape-checked song file or a doc students read. So for now the results stay in THIS BROWSER ON THIS
   COMPUTER (localStorage TEACHER_SPOT_KEY; the view says so); Manage → "Download a backup" puts them in its file
   (teacherSpotBackupSection) and Delete in teacher-remove.js forgets a deleted student's (teacherSpotForget). A
   class-database store needs a new rules block (its draft is in the builder's report) and replaces only the
   adapter's read and write. The state: { v: 1, results: [record], lists: { period: { day, draw, rows } },
   undo: [ { list, uid, skill, result, prev } ] }, a record being { uid, skill, day, at, result, period, list, ticked,
   by: 'teacher' } (`by` so a student's own week-later prompt could add records of the same shape later).
   Two console tabs on this computer stay in step: every action reads the stored copy first and writes it straight
   back, and each button names what it acts on (a mark: the list, the student and the skill, never the row's place;
   Undo: the mark it takes back), so a click on a row another tab changed or took out does nothing and the view is
   drawn again. Names and periods are drawn escaped; nothing student-written is put in an id or a handler. */
const TEACHER_SPOT_MIN_DAYS=7;
const TEACHER_SPOT_SIZES=[3, 5, 8];
const TEACHER_SPOT_MAX=8;
const TEACHER_SPOT_MAX_RESULTS=5000;
const TEACHER_SPOT_UNDO_MAX=20;
const TEACHER_SPOT_KEY='gc-teacher-spotcheck-v1';
const TEACHER_SPOT_SIZE_KEY='gc-teacher-spotcheck-size';
const TEACHER_SPOT_RESULTS=['held', 'notyet', 'skip'];
const TEACHER_SPOT_LABEL={held:'Held', notyet:'Not yet', skip:'Skip (absent)'};
const TEACHER_SPOT_PERIODS=['4', '7', 'CAS', 'none'];
const TEACHER_SPOT_PLAYED=['playSeq', 'chord', 'pr'];
const TEACHER_SPOT_PLAY_RE=/^(?:RE-TEST:\s*)?(?:I can\s+)?(?:play|fret|strum|switch|keep|hold|mute|pluck|fingerpick|form|bar|press|accent|alternate|comp|echo|skip|change|move|add|perform)\b|\band play\b|\bwhile (?:strumming|picking)\b/i;
const TEACHER_SPOT_LONG_RE=/whole song|all the way through|start to finish|full verse|\bverse of\b|for an audience|backing track|12-bar|online|\btuner\b/i;

/* ── Pure helpers ── */
function teacherSpotPlayable(sk, moduleNum){
  if(!sk || Number(moduleNum)===13) return false;
  const text=String(sk.text||'');
  if(TEACHER_SPOT_LONG_RE.test(text)) return false;
  const type=sk.practice && sk.practice.type;
  return TEACHER_SPOT_PLAYED.includes(type) || TEACHER_SPOT_PLAY_RE.test(text);
}
// Every skill in the loaded sets, by id: its English wording, its criterion, where it sits, and whether it can be drawn.
function teacherSpotSkillInfo(sets){
  const out={};
  (sets||[]).forEach(w=>{
    (w.skills||[]).forEach(sk=>{
      if(!sk || !sk.id || out[sk.id]) return;
      const num=Number(w.moduleNum)||0;
      out[sk.id]={id:sk.id, text:String(sk.text||sk.id), gotItWhen:String(sk.gotItWhen||''), moduleNum:num,
        module:String(w.module||''), set:String(w.label||w.title||''), playable:teacherSpotPlayable(sk, num)};
    });
  });
  return out;
}
function teacherSpotDayStr(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2, '0')+'-'+String(d.getDate()).padStart(2, '0'); }
// A YYYY-MM-DD day as a whole day number (days since 1970-01-01), or null when it is not a real date.
function teacherSpotDayNum(s){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s||''));
  if(!m) return null;
  const t=Date.UTC(+m[1], +m[2]-1, +m[3]), d=new Date(t);
  if(d.getUTCFullYear()!==+m[1] || d.getUTCMonth()!==+m[2]-1 || d.getUTCDate()!==+m[3]) return null;
  return Math.round(t/86400000);
}
function teacherSpotDaysSince(day, today){
  const a=teacherSpotDayNum(day), b=teacherSpotDayNum(today);
  return (a===null || b===null) ? null : b-a;
}
/* PURE: students = [{ uid, skills, lastGotItDay }]. pool: the students who can be drawn today, each with their
   playable ticked skills (sorted) and their day; recent / noDay / none: the uids of those who cannot, and why. */
function teacherSpotPool(students, info, today){
  const pool=[], recent=[], noDay=[], none=[];
  (students||[]).forEach(s=>{
    const sk=s.skills||{};
    const skills=Object.keys(sk).filter(id=>sk[id]==='gotit' && info[id] && info[id].playable).sort();
    const d=teacherSpotDaysSince(s.lastGotItDay, today);
    if(!skills.length) none.push(s.uid);
    else if(d===null) noDay.push(s.uid);
    else if(d<TEACHER_SPOT_MIN_DAYS) recent.push(s.uid);
    else pool.push({uid:s.uid, skills, day:String(s.lastGotItDay)});
  });
  return {pool, recent, noDay, none};
}
// How many checks (Held or Not yet) each student, each pair and each skill has had.
function teacherSpotCounts(results){
  const stu={}, pair={}, skill={};
  (results||[]).forEach(r=>{
    if(r.result!=='held' && r.result!=='notyet') return;
    stu[r.uid]=(stu[r.uid]||0)+1;
    pair[r.uid+'|'+r.skill]=(pair[r.uid+'|'+r.skill]||0)+1;
    skill[r.skill]=(skill[r.skill]||0)+1;
  });
  return {stu, pair, skill};
}
function teacherSpotHash(str){
  let h=2166136261>>>0;
  for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h, 16777619)>>>0; }
  return h>>>0;
}
// A small seeded generator (mulberry32): the same seed gives the same numbers, on any computer.
function teacherSpotRng(seed){
  let a=teacherSpotHash(String(seed))||1;
  return ()=>{
    a=(a+0x6D2B79F5)>>>0;
    let t=a;
    t=Math.imul(t^(t>>>15), t|1);
    t^=t+Math.imul(t^(t>>>7), t|61);
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}
/* PURE: up to max rows [{ uid, skill, day }] from the pool, in the order the header gives (THE DRAW). The pool is
   sorted by uid first, so the order the roster came in changes nothing. */
function teacherSpotDraw(pool, results, seed, max){
  const rnd=teacherSpotRng(seed), c=teacherSpotCounts(results);
  const byId=(a, b)=>(a<b?-1:a>b?1:0);
  const studs=(pool||[]).slice().sort((a, b)=>byId(a.uid, b.uid)).map(p=>({p, k:rnd()}))
    .sort((a, b)=>((c.stu[a.p.uid]||0)-(c.stu[b.p.uid]||0)) || (a.k-b.k) || byId(a.p.uid, b.p.uid));
  const used=new Set(), rows=[];
  for(const {p} of studs){
    if(rows.length>=max) break;
    if(!p.skills.length) continue;
    const opts=p.skills.map(id=>({id, k:rnd()})).sort((a, b)=>((c.pair[p.uid+'|'+a.id]||0)-(c.pair[p.uid+'|'+b.id]||0))
      || ((used.has(a.id)?1:0)-(used.has(b.id)?1:0)) || ((c.skill[a.id]||0)-(c.skill[b.id]||0)) || (a.k-b.k) || byId(a.id, b.id));
    used.add(opts[0].id);
    rows.push({uid:p.uid, skill:opts[0].id, day:p.day});
  }
  return rows;
}
function teacherSpotListId(period, L){ return L.day+'|'+period+'|'+L.draw; }
function teacherSpotEmpty(){ return {v:1, results:[], lists:{}, undo:[]}; }
/* The stored state, checked field by field (anything else is dropped): a hand-edited or older value never breaks
   the view. */
function teacherSpotClean(raw){
  const out=teacherSpotEmpty();
  if(!raw || typeof raw!=='object' || raw.v!==1) return out;
  const str=(v, max)=>typeof v==='string' && v.length>0 && v.length<=(max||200);
  const rec=r=>r && str(r.uid) && str(r.skill) && TEACHER_SPOT_RESULTS.includes(r.result) && teacherSpotDayNum(r.day)!==null && Number.isFinite(r.at);
  const keep=r=>({uid:r.uid, skill:r.skill, day:r.day, at:r.at, result:r.result, period:str(r.period, 8)?r.period:'',
    list:str(r.list, 400)?r.list:'', ticked:str(r.ticked, 10)?r.ticked:'', by:'teacher'});
  if(Array.isArray(raw.results)) out.results=raw.results.filter(rec).map(keep).slice(-TEACHER_SPOT_MAX_RESULTS);
  if(raw.lists && typeof raw.lists==='object'){
    TEACHER_SPOT_PERIODS.forEach(p=>{
      const L=raw.lists[p];
      if(!L || teacherSpotDayNum(L.day)===null || !Number.isInteger(L.draw) || L.draw<0 || !Array.isArray(L.rows)) return;
      out.lists[p]={day:L.day, draw:L.draw, rows:L.rows.filter(r=>r && str(r.uid) && str(r.skill)).slice(0, TEACHER_SPOT_MAX)
        .map(r=>({uid:r.uid, skill:r.skill, day:str(r.day, 10)?r.day:''}))};
    });
  }
  if(Array.isArray(raw.undo)) out.undo=raw.undo.filter(u=>u && str(u.list, 400) && str(u.uid) && str(u.skill) && TEACHER_SPOT_RESULTS.includes(u.result)
    && (u.prev===null || rec(u.prev))).map(u=>({list:u.list, uid:u.uid, skill:u.skill, result:u.result, prev:u.prev ? keep(u.prev) : null})).slice(-TEACHER_SPOT_UNDO_MAX);
  return out;
}
/* PURE: the state after marking one row of list `list` with `result` at time `now`. Marking a row again replaces its
   mark (Undo puts the one before back); marking it with the mark it has changes nothing. */
function teacherSpotMark(state, list, row, result, period, now){
  if(!TEACHER_SPOT_RESULTS.includes(result)) return state;
  const same=r=>r.list===list && r.uid===row.uid && r.skill===row.skill;
  const i=state.results.findIndex(same);
  const prev=i>=0 ? state.results[i] : null;
  if(prev && prev.result===result) return state;
  const rec={uid:row.uid, skill:row.skill, day:teacherSpotDayStr(new Date(now)), at:now, result, period:String(period||''), list, ticked:String(row.day||''), by:'teacher'};
  const results=i>=0 ? state.results.map((r, k)=>k===i ? rec : r) : state.results.concat([rec]);
  const undo=state.undo.concat([{list, uid:row.uid, skill:row.skill, result, prev}]).slice(-TEACHER_SPOT_UNDO_MAX);
  return Object.assign({}, state, {results:results.slice(-TEACHER_SPOT_MAX_RESULTS), undo});
}
// PURE: the state with the last mark taken back (the row's mark before it, or none).
function teacherSpotUndo(state){
  if(!state.undo.length) return state;
  const u=state.undo[state.undo.length-1];
  const same=r=>r.list===u.list && r.uid===u.uid && r.skill===u.skill;
  const i=state.results.findIndex(same);
  let results=state.results;
  if(u.prev) results=i>=0 ? results.map((r, k)=>k===i ? u.prev : r) : results.concat([u.prev]);
  else if(i>=0) results=results.filter((r, k)=>k!==i);
  return Object.assign({}, state, {results, undo:state.undo.slice(0, -1)});
}
// PURE: the state with everything about one student taken out (results, list rows, undo steps).
function teacherSpotWithout(state, uid){
  const lists={};
  Object.keys(state.lists).forEach(p=>{ const L=state.lists[p]; lists[p]=Object.assign({}, L, {rows:L.rows.filter(r=>r.uid!==uid)}); });
  return Object.assign({}, state, {results:state.results.filter(r=>r.uid!==uid), lists,
    undo:state.undo.filter(u=>u.uid!==uid)});
}
/* PURE: the summary for the students in `uids` (a Set): checks done (Held + Not yet), held, skipped as absent, per
   module, and the skills with the most Not yet (at most 5). */
function teacherSpotSummary(results, uids, info){
  const mine=(results||[]).filter(r=>uids.has(r.uid));
  const checked=mine.filter(r=>r.result==='held' || r.result==='notyet');
  const held=checked.filter(r=>r.result==='held').length;
  const skipped=mine.filter(r=>r.result==='skip').length;
  const byMod={}, bySkill={};
  checked.forEach(r=>{
    const m=(info[r.skill]||{}).moduleNum||0;
    const e=byMod[m]||(byMod[m]={held:0, total:0});
    e.total++; if(r.result==='held') e.held++;
    const s=bySkill[r.skill]||(bySkill[r.skill]={skill:r.skill, held:0, notyet:0});
    s[r.result]++;
  });
  const failed=Object.keys(bySkill).map(k=>bySkill[k]).filter(e=>e.notyet>0)
    .sort((a, b)=>(b.notyet-a.notyet) || (a.held-b.held) || (a.skill<b.skill?-1:a.skill>b.skill?1:0)).slice(0, 5);
  return {checks:checked.length, held, skipped, byMod, failed};
}

/* ══ STORAGE ADAPTER: this browser's localStorage on this computer (see STORAGE in the header) ══
   read() → the state (checked); write(state, isMark) → true when kept. No way of not keeping is silent; the view says
   each one (teacherSpotWarnHtml, review R2-4):
   - storage blocked (getItem throws): the state lives in this tab's memory until a reload;
   - a write refused (setItem throws: the store is full; the console shares the student site's 5 MB on this
     computer): from then on this tab's memory is what the view shows, until a write goes through again;
   - a stored value this code cannot read (not JSON, not v:1, no results list): opening the view never overwrites it.
     The view's own drawing (the day's list, Draw again) stays in memory, and only the teacher's next mark (isMark)
     first copies the old text to TEACHER_SPOT_BACKUP_KEY (one generation: it replaces an older copy), then starts a
     fresh store. When that copy cannot be written, nothing is replaced. */
const TEACHER_SPOT_BACKUP_KEY=TEACHER_SPOT_KEY+'-unreadable';
let teacherSpotMemory=null, teacherSpotStoreOk=true, teacherSpotWriteFailed=false, teacherSpotUnreadable=null;
const TEACHER_SPOT_STORE={
  where:'device',
  read(){
    let raw;
    try{ raw=localStorage.getItem(TEACHER_SPOT_KEY); teacherSpotStoreOk=true; }
    catch(e){ teacherSpotStoreOk=false; return teacherSpotClean(teacherSpotMemory); }
    let parsed=null, bad=false;
    if(raw){ try{ parsed=JSON.parse(raw); }catch(e){ bad=true; } }
    if(raw && !bad && !(parsed && typeof parsed==='object' && parsed.v===1 && Array.isArray(parsed.results))) bad=true;
    teacherSpotUnreadable=bad ? raw : null;
    return teacherSpotClean(bad || teacherSpotWriteFailed ? teacherSpotMemory : parsed);
  },
  write(state, isMark){
    teacherSpotMemory=state;
    if(teacherSpotUnreadable!==null && !isMark) return false;
    try{
      if(teacherSpotUnreadable!==null) localStorage.setItem(TEACHER_SPOT_BACKUP_KEY, teacherSpotUnreadable);
      localStorage.setItem(TEACHER_SPOT_KEY, JSON.stringify(state));
      teacherSpotStoreOk=true; teacherSpotWriteFailed=false; teacherSpotUnreadable=null;
      return true;
    }catch(e){ teacherSpotWriteFailed=true; return false; }
  },
};
/* For teacher-remove.js: a deleted student's results go with their saved work, from this computer. */
function teacherSpotForget(uid){
  const st=TEACHER_SPOT_STORE.read();
  const hits=st.results.filter(r=>r.uid===uid).length;
  if(hits || st.undo.some(u=>u.uid===uid) || Object.keys(st.lists).some(p=>st.lists[p].rows.some(r=>r.uid===uid))) TEACHER_SPOT_STORE.write(teacherSpotWithout(st, uid));
  return hits;
}
function teacherSpotStudentResults(uid){ return TEACHER_SPOT_STORE.read().results.filter(r=>r.uid===uid); }
/* For teacher-backup.js: the results this computer keeps, for the backup file (null when there are none). */
function teacherSpotBackupSection(){
  const st=TEACHER_SPOT_STORE.read();
  if(!st.results.length) return null;
  return {kept:'this browser on the computer that made the backup (localStorage '+TEACHER_SPOT_KEY+')',
    note:'Week-later checks (teacher-spotcheck.js): the teacher’s Held / Not yet / Skip marks. Not in the class database, not a grade.',
    count:st.results.length, results:st.results};
}

/* ── The view ── */
let teacherSpotBound=false, teacherSpotSaid='';
function teacherSpotSize(){
  let v=5;
  try{ v=Number(localStorage.getItem(TEACHER_SPOT_SIZE_KEY))||5; }catch(e){ v=5; }
  return TEACHER_SPOT_SIZES.includes(v) ? v : 5;
}
function teacherSpotStudents(){ return (allStudents||[]).filter(s=>s && s.uid && !teacherPmIsTeacher(s)); }
function teacherSpotPeriodLabel(p){ return p==='CAS' ? 'CAS' : p==='none' ? 'Unassigned' : 'Period '+p; }
function teacherSpotNameOf(uid){
  const s=(allStudentsRaw||[]).find(x=>x.uid===uid);
  return s ? String(s.name || s.email || String(uid).slice(0, 8)+'…') : String(uid).slice(0, 8)+'…';
}
function teacherSpotDayLabel(day){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(day||''));
  return m ? new Date(+m[1], +m[2]-1, +m[3], 12).toLocaleDateString([], {weekday:'short', month:'short', day:'numeric'}) : '';
}
// Today's list for this period, drawn and kept the first time it is asked for (a list with no rows is not kept).
function teacherSpotList(st, per, today, pool){
  const L=st.lists[per];
  if(L && L.day===today && L.rows.length) return {st, L};
  const draw=(L && L.day===today) ? L.draw : 0;
  const rows=teacherSpotDraw(pool, st.results, today+'|'+per+'|'+draw, TEACHER_SPOT_MAX);
  const NL={day:today, draw, rows};
  if(!rows.length) return {st, L:NL};
  const next=Object.assign({}, st, {lists:Object.assign({}, st.lists, {[per]:NL})});
  TEACHER_SPOT_STORE.write(next);
  return {st:next, L:NL};
}
function teacherSpotHeadHtml(info){
  const ids=Object.keys(info), play=ids.filter(id=>info[id].playable).length;
  return `<h3 class="us-t-head">Week-later checks</h3>`
    +`<div class="sc-t-howto" data-spot-howto>Ask each student to play the skill once: no backing track, no help, no second try. Then mark what you heard.</div>`
    +`<div class="tr-meta">Each row is a skill the student marked “I’ve got it” at least a week ago. A week is counted from the last day the student marked ANY skill “I’ve got it”: the site saves that day, not one for each skill, so a student who marked anything in the last ${TEACHER_SPOT_MIN_DAYS} days is not drawn yet. Only skills you can hear in about 20 seconds are drawn (${play} of ${ids.length} skills: playing, fretting, strumming and the like); knowledge skills, whole songs and verses, backing tracks, tuning with a tuner and Module 13 are left out. The criterion under each skill is its own “You’ve got it when” line.</div>`;
}
function teacherSpotListHtml(st, per, students, info, today){
  const {pool, recent, noDay, none}=teacherSpotPool(students, info, today);
  const got=teacherSpotList(st, per, today, pool);
  st=got.st;
  const L=got.L, listId=teacherSpotListId(per, L), size=teacherSpotSize();
  const pl=(k, one, many)=>`${k} ${k===1?one:many}`;
  const why=[recent.length ? `${pl(recent.length, 'student', 'students')} marked a skill in the last ${TEACHER_SPOT_MIN_DAYS} days` : '',
    noDay.length ? `${pl(noDay.length, 'student has', 'students have')} no saved day for a tick` : '',
    none.length ? `${pl(none.length, 'student has', 'students have')} no playable skill marked “I’ve got it”` : ''].filter(Boolean).join('; ');
  const meta=`<div class="tr-meta" data-spot-pool="${pool.length}">${escHtml(teacherSpotPeriodLabel(per))}: ${pool.length} of ${pl(students.length, 'student', 'students')} can be drawn today${why ? ` (${escHtml(why)})` : ''}.</div>`;
  const last=st.undo.length ? st.undo[st.undo.length-1] : null;
  const undoLabel=last ? `Undo “${TEACHER_SPOT_LABEL[last.result]}” for ${teacherSpotNameOf(last.uid)}` : 'Undo last mark';
  const bar=`<div class="pm-t-bar sc-t-bar"><span class="tg-class-lbl">List size</span><div class="tg-seg" role="group" aria-label="List size">`
    +TEACHER_SPOT_SIZES.map(n=>`<button type="button" class="tg-seg-btn${n===size?' on':''}" data-spot-size="${n}" aria-pressed="${n===size}">${n}</button>`).join('')+`</div>`
    +`<button type="button" class="tg-seg-btn sc-t-btn" data-spot-again${pool.length?'':' disabled'}>Draw again</button>`
    +`<button type="button" class="tg-seg-btn sc-t-btn" data-spot-undo${last ? ` data-spot-list="${escAttr(last.list)}" data-spot-uid="${escAttr(last.uid)}" data-spot-skill="${escAttr(last.skill)}" data-spot-mark="${escAttr(last.result)}"` : ' disabled'}>${escHtml(undoLabel)}</button>`
    +(teacherSpotSaid ? `<span class="pm-t-when" data-spot-said>${escHtml(teacherSpotSaid)}</span>` : '')+`</div>`;
  if(!pool.length){
    return meta+bar+`<div class="t-loading sc-t-empty" data-spot-empty>No ticks older than a week yet in ${escHtml(teacherSpotPeriodLabel(per))}: nobody here has a playable skill marked “I’ve got it” ${TEACHER_SPOT_MIN_DAYS} or more days ago with nothing marked since. Try again on another day.</div>`;
  }
  const listed=new Set(students.map(s=>s.uid));
  const marks={};
  st.results.forEach(r=>{ if(r.list===listId) marks[r.uid+'|'+r.skill]=r.result; });
  const rows=L.rows.map((r, i)=>({r, i})).filter(x=>listed.has(x.r.uid) && (x.i<size || marks[x.r.uid+'|'+x.r.skill]));
  if(!rows.length) return meta+bar+`<div class="t-loading" data-spot-gone>Nobody on today’s list is in ${escHtml(teacherSpotPeriodLabel(per))} any more (archived, moved to another period or removed). “Draw again” makes a new list.</div>`;
  const stuById={};
  students.forEach(s=>{ stuById[s.uid]=s; });
  const body=rows.map(({r}, n)=>{
    const sk=info[r.skill]||{text:r.skill, gotItWhen:'', moduleNum:0, module:'', set:''};
    const mark=marks[r.uid+'|'+r.skill]||'';
    const name=teacherSpotNameOf(r.uid);
    const since=teacherSpotDaysSince(r.day, today);
    const gone=!(stuById[r.uid] && (stuById[r.uid].skills||{})[r.skill]==='gotit');
    const where=`Module ${sk.moduleNum}${sk.module ? ' · '+sk.module : ''}${sk.set ? ' · '+sk.set : ''}`;
    const btn=k=>`<button type="button" class="tg-seg-btn sc-t-mark sc-t-mark-${k}${mark===k?' on':''}" data-spot-mark="${k}" data-spot-uid="${escAttr(r.uid)}" data-spot-skill="${escAttr(r.skill)}" data-spot-list="${escAttr(listId)}" aria-pressed="${mark===k}">${escHtml(TEACHER_SPOT_LABEL[k])}</button>`;
    return `<tr class="sc-t-row${mark ? ' sc-t-is-'+mark : ''}" data-spot-row data-spot-uid="${escAttr(r.uid)}" data-spot-skill="${escAttr(r.skill)}" data-spot-state="${mark||'open'}">`
      +`<td class="pm-t-num sc-t-n">${n+1}</td>`
      +`<td class="tg-name sc-t-who" title="${escAttr(name)}">${escHtml(name)}</td>`
      +`<td class="sc-t-skill"><div class="sc-t-text">${escHtml(sk.text)}</div><div class="sc-t-where">${escHtml(where)}</div>`
      +(sk.gotItWhen ? `<div class="sc-t-crit" data-spot-crit><span>You’ve got it when</span> ${escHtml(sk.gotItWhen)}</div>` : '')+`</td>`
      +`<td class="sc-t-when">on or before ${escHtml(teacherSpotDayLabel(r.day))}<span class="us-t-of">${since===null ? '' : pl(since, 'day', 'days')+' ago'}${gone ? ' · not marked any more' : ''}</span></td>`
      +`<td class="sc-t-marks"><div class="tg-seg sc-t-seg" role="group" aria-label="${escAttr('Result for '+name)}">${TEACHER_SPOT_RESULTS.map(btn).join('')}</div></td></tr>`;
  }).join('');
  const done=rows.filter(x=>marks[x.r.uid+'|'+x.r.skill]).length;
  const listHead=`<div class="tr-meta sc-t-listhead">Today’s list, ${escHtml(teacherSpotDayLabel(L.day))}${L.draw ? ` (draw ${L.draw+1})` : ''}: ${done} of ${rows.length} marked. The same list comes back all day; “Draw again” makes a new one.</div>`;
  return meta+bar+listHead+`<div class="tg-grid-wrap" data-spot-list-box><table class="tg-table sc-t-table"><thead><tr><th>#</th><th>Student</th><th>Skill, and what counts</th><th>Marked “I’ve got it”</th><th>What you heard</th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function teacherSpotSummaryHtml(st, students, info, per){
  const uids=new Set(students.map(s=>s.uid));
  const s=teacherSpotSummary(st.results, uids, info);
  const scope=per==='all' ? 'every student listed' : teacherSpotPeriodLabel(per);
  const head=`<h3 class="us-t-head">Results so far <span class="us-t-of">(${escHtml(scope)}, every day so far)</span></h3>`;
  if(!s.checks && !s.skipped) return head+`<div class="tr-meta" data-spot-summary="0">No checks marked yet.</div>`;
  const pct=(a, b)=>b ? Math.round(100*a/b)+'%' : '—';
  const line=`<div class="sc-t-sumline" data-spot-summary="${s.checks}" data-spot-held="${s.held}" data-spot-skipped="${s.skipped}"><strong>${s.checks}</strong> ${s.checks===1?'check':'checks'} done: held <strong>${s.held} of ${s.checks}</strong> (${pct(s.held, s.checks)})${s.skipped ? `, and ${s.skipped} skipped as absent` : ''}.</div>`;
  const mods=Object.keys(s.byMod).map(Number).sort((a, b)=>a-b);
  const modName=n=>{ const m=(typeof MODULE_MANIFEST!=='undefined' ? MODULE_MANIFEST : []).find(x=>x.num===n); return m ? m.name : ''; };
  const modTable=mods.length ? `<div class="tg-grid-wrap"><table class="tg-table sc-t-sum" data-spot-bymod><thead><tr><th>Module</th><th>Held</th><th>Checked</th><th>Held %</th></tr></thead><tbody>`
    +mods.map(n=>{ const e=s.byMod[n]; return `<tr data-spot-mod="${n}"><td class="tg-name">Module ${n}${modName(n) ? ' · '+escHtml(modName(n)) : ''}</td><td class="pm-t-num">${e.held}</td><td class="pm-t-num">${e.total}</td><td class="pm-t-num">${pct(e.held, e.total)}</td></tr>`; }).join('')
    +`</tbody></table></div>` : '';
  const failed=s.failed.length ? `<div class="sc-t-subhead">Failed most</div><ul class="us-t-rho" data-spot-failed>`
    +s.failed.map(e=>{ const sk=info[e.skill]||{text:e.skill, moduleNum:0}; return `<li data-spot-fail="${escAttr(e.skill)}">${escHtml(sk.text)} <span class="us-t-of">(Module ${sk.moduleNum})</span>: not yet ${e.notyet} of ${e.notyet+e.held}</li>`; }).join('')+`</ul>`
    : `<div class="tr-meta">No skill has failed a check yet.</div>`;
  return head+line+modTable+failed;
}
// The plain line at the top when this browser is not keeping the marks, or holds results it cannot read (STORAGE ADAPTER).
function teacherSpotWarnHtml(){
  const k=!teacherSpotStoreOk ? 'blocked' : teacherSpotWriteFailed ? 'full' : teacherSpotUnreadable!==null ? 'unreadable' : '';
  if(!k) return '';
  const say={blocked:'Not saved: this browser is not keeping anything (its storage is turned off). The marks on this page last only until it is reloaded.',
    full:'Not saved: this browser would not keep the last mark (its storage is full). The marks on this page last only until it is reloaded; each new mark tries again.',
    unreadable:`The week-later results saved in this browser could not be read, so they are left as they are. Your next mark keeps a copy of them (localStorage ${TEACHER_SPOT_BACKUP_KEY}) and starts a fresh record.`}[k];
  return `<div class="sc-t-warn" data-spot-warn="${k}" role="status">${escHtml(say)}</div>`;
}
function teacherSpotFootHtml(){
  const kept=!teacherSpotStoreOk ? 'This browser is not keeping anything (its storage is blocked): marks last only until this page is reloaded.'
    : teacherSpotWriteFailed ? 'This browser could not keep the last marks (its storage is full): they last only until this page is reloaded.'
    : teacherSpotUnreadable!==null ? 'Nothing new is kept in this browser until your next mark: the results saved here could not be read (see the top).'
    : 'Results are kept in this browser on this computer only, not in the class database: another computer or browser does not see them. Manage → “Download a backup” puts them in its file.';
  return `<div class="tr-meta sc-t-foot" data-spot-foot>${kept} Not a grade: nothing here feeds a grade, and students never see these results.</div>`;
}
function renderTeacherSpotcheck(){
  const box=document.getElementById('t-grid-container');
  if(!box) return;
  if(!teacherSpotBound){ box.addEventListener('click', teacherSpotClick); teacherSpotBound=true; }
  const info=teacherSpotSkillInfo(typeof SETS!=='undefined' ? SETS : []);
  const students=teacherSpotStudents();
  const per=teacherPeriodFilter, today=teacherSpotDayStr(new Date());
  let st=TEACHER_SPOT_STORE.read();
  let mid;
  if(!Object.keys(info).length) mid=`<div class="t-loading" data-spot-wait>The module skills have not loaded yet. They load with the console; reload if this stays.</div>`;
  else if(!students.length) mid=`<div class="t-loading">No students to show yet.</div>`;
  else if(per==='all'){
    const have=TEACHER_SPOT_PERIODS.filter(p=>students.some(s=>(teacherStudentPeriod(s)||'none')===p));
    mid=`<div class="pm-t-bar sc-t-pick" data-spot-pick><span class="pm-t-when">The list is drawn for one class at a time. Pick a period (the same as the filter at the top):</span>`
      +have.map(p=>`<button type="button" class="tg-seg-btn sc-t-btn" data-spot-period="${escAttr(p)}">${escHtml(teacherSpotPeriodLabel(p))}</button>`).join('')+`</div>`;
  } else {
    mid=teacherSpotListHtml(st, per, students, info, today);
    st=TEACHER_SPOT_STORE.read();
  }
  const sum=Object.keys(info).length && students.length ? teacherSpotSummaryHtml(st, students, info, per) : '';
  box.innerHTML=`<div data-tview="spotcheck">${teacherSpotHeadHtml(info)}${teacherSpotWarnHtml()}${mid}${sum}${teacherSpotFootHtml()}</div>`;
}
function teacherSpotClick(e){
  if(teacherView!=='spotcheck') return;
  const u=e.target.closest('[data-spot-undo]');
  if(u){ teacherSpotDoUndo(u.dataset); return; }
  const m=e.target.closest('[data-spot-mark]');
  if(m){ teacherSpotDoMark(m.dataset.spotList, m.dataset.spotUid, m.dataset.spotSkill, m.dataset.spotMark); return; }
  const sz=e.target.closest('[data-spot-size]');
  if(sz){
    const n=Number(sz.dataset.spotSize);
    if(TEACHER_SPOT_SIZES.includes(n)){ try{ localStorage.setItem(TEACHER_SPOT_SIZE_KEY, String(n)); }catch(err){ /* not remembered: 5 next time */ } }
    teacherSpotSaid=''; renderTeacherSpotcheck(); return;
  }
  if(e.target.closest('[data-spot-again]')){ teacherSpotAgain(); return; }
  const p=e.target.closest('[data-spot-period]');
  if(p && TEACHER_SPOT_PERIODS.includes(p.dataset.spotPeriod)) teacherSetPeriodFilter(p.dataset.spotPeriod);
}
/* A mark: only on today's list for this period, the one the button was drawn from (a page left open past midnight
   draws a new list rather than mark a row of the old one), and only on the row of that student and skill, found by
   both, never by its place: another tab may have deleted a student since this page was drawn, which takes their row
   out and moves every row under it up (review R2-3). A row that is gone marks nothing; the view is drawn again. */
const TEACHER_SPOT_STALE='Nothing marked: today’s list changed since this page was drawn (another tab, or a new day). This is the list as it is now.';
function teacherSpotDoMark(listId, uid, skill, result){
  const st=TEACHER_SPOT_STORE.read(), per=teacherPeriodFilter, L=st.lists[per];
  const today=teacherSpotDayStr(new Date());
  const row=L && L.rows.find(r=>r.uid===uid && r.skill===skill);
  if(!L || L.day!==today || teacherSpotListId(per, L)!==listId || !row || !TEACHER_SPOT_RESULTS.includes(result)){ teacherSpotSaid=TEACHER_SPOT_STALE; renderTeacherSpotcheck(); return; }
  const next=teacherSpotMark(st, listId, row, result, per, Date.now());
  if(next!==st) TEACHER_SPOT_STORE.write(next, true);
  teacherSpotSaid='';
  renderTeacherSpotcheck();
}
/* Undo takes back the mark its button names (want: the button's data), and only while that is still the last one:
   another tab may have marked since this page was drawn. */
function teacherSpotDoUndo(want){
  const st=TEACHER_SPOT_STORE.read();
  const u=st.undo.length ? st.undo[st.undo.length-1] : null;
  if(!u || !want || u.list!==want.spotList || u.uid!==want.spotUid || u.skill!==want.spotSkill || u.result!==want.spotMark){
    teacherSpotSaid='Nothing undone: the last mark changed since this page was drawn (another tab). The Undo button now names the last mark.';
    renderTeacherSpotcheck(); return;
  }
  TEACHER_SPOT_STORE.write(teacherSpotUndo(st));
  teacherSpotSaid=`Undone: “${TEACHER_SPOT_LABEL[u.result]}” for ${teacherSpotNameOf(u.uid)}${u.prev ? ` (back to “${TEACHER_SPOT_LABEL[u.prev.result]}”)` : ''}.`;
  renderTeacherSpotcheck();
}
function teacherSpotAgain(){
  const per=teacherPeriodFilter;
  if(!TEACHER_SPOT_PERIODS.includes(per)) return;
  const st=TEACHER_SPOT_STORE.read(), today=teacherSpotDayStr(new Date());
  const info=teacherSpotSkillInfo(typeof SETS!=='undefined' ? SETS : []);
  const {pool}=teacherSpotPool(teacherSpotStudents(), info, today);
  if(!pool.length){ renderTeacherSpotcheck(); return; }
  const L=st.lists[per];
  const draw=(L && L.day===today) ? L.draw+1 : 0;
  const rows=teacherSpotDraw(pool, st.results, today+'|'+per+'|'+draw, TEACHER_SPOT_MAX);
  TEACHER_SPOT_STORE.write(Object.assign({}, st, {lists:Object.assign({}, st.lists, {[per]:{day:today, draw, rows}})}));
  teacherSpotSaid='';
  renderTeacherSpotcheck();
}
