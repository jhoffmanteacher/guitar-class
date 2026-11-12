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
  return `<div class="tg-note"><strong>${del?'Deleted':'Archived'}.</strong> Students don't see this activity and it doesn't gate the site${del?' — and its date, rename, place on the board and gate clears have been cleared':''}. Restore it in this activity's Settings tab, or on Arrange board${del?' — it\'s in Built, under “Archived / deleted”':' — it\'s under “Archived” inside its unit'}.</div>`;
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
  return `<div class="tg-note"><strong>Optional.</strong> Students see this one, tagged “Optional”, but it never sends them to In-Class Activities when they sign in, so the Clear buttons below change nothing for now. Switch it back to Required in the Settings tab.</div>`;
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
  // activityDetailId outlives a switch to the Students tab (the Class
  // activities list keeps its pick), so check the view too — a Clear on a
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
