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
      ${teacherBackupPanelHtml()}
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

