/* ── Firestore ── */
/* Did we actually read this student's doc? A failed read leaves every local
   store empty — which is indistinguishable from a brand-new student unless we
   say so. Two things key off this flag, because "empty" means "unknown", not
   "nothing there": the sequential gate stops locking (their real work is on the
   server, and a blocked school network must not wall them out of sets they
   finished weeks ago), and the derived save categories are held back so a
   session started from a blank slate can't overwrite the real record. */
let progressLoadFailed = false;

/* ── Module 4/5 swap: one-time move of saved progress (2026-10-12) ─────────
   On 2026-10-12 Modules 4 and 5 traded places (Open Chords is Module 4,
   Pentatonic is Module 5) and every id moved WITH its content: what was
   m4w1 is now m5w1, mr4-* is now mr5-*, the chords-m5 deck is chords-m4,
   and the Journey pages' Layers 4 and 5 traded places. Set numbers and the
   step/section positions inside each set did not change. A live scan that
   day found 7 progress docs holding work saved under the OLD ids (ticked
   steps, typed and graded answers, lastSet, game skill records, Journey
   "I'm ready" ticks), all of it now attached to the other module's lessons.
   The console cannot write progress/{uid} (firestore.rules: owner only), so
   each student's own browser moves its own doc, once.

   One rule every writer keeps: a doc WITHOUT migrations.swap45 holds only
   OLD-numbered data; a doc WITH it holds only NEW-numbered data.
     - loadProgress() remaps an unmarked doc in memory (swap45OnLoad) before
       anything renders, and starts swap45Commit() straight away — the
       moved fields plus the marker, or the marker alone when nothing moves.
       One marker write per student, once. A failed read commits nothing.
     - flushSave() awaits swap45Commit() before its own write, so no
       new-numbered key can merge into an unmarked doc (the next load would
       swap it the wrong way) even when the load-time commit failed. A
       student with no doc yet gets it created already marked by that first
       save; loading writes nothing for them.
     - swap45Commit() is a transaction: it re-reads the doc, does nothing if
       another tab already marked it, and otherwise REPLACES each affected
       field with its remapped copy and sets the marker in the same write.
       update() with a whole map replaces the field; set({merge:true}) would
       merge the old keys back in.
     - A failed commit leaves the stored doc unmarked and unchanged. Memory
       stays remapped, every save retries the commit first (and fails, and
       retries, like any failed save), and the next load starts again from
       the same stored doc — nothing is lost and nothing swaps twice.
     - tabs/journey.js writes songReady in the doc's own numbering, and
       teacher.js remaps unmarked docs for display only.
   swap45MapId is its own inverse, so the data alone cannot say which
   numbering a doc is in — only the marker does. The one assumption: every
   Module 4/5 key in an unmarked doc was saved BEFORE the swap went live
   (pushed 2026-10-12 14:53 PDT). Work the swap build saved between then
   and this move shipping is already new-numbered and would be swapped the
   wrong way; the docs' update times are the way to check. And one gap no
   client can close: a tab still running a build from before this one,
   holding the doc as it was before the move, merges its old-numbered maps
   back into the marked doc on its next save (CLAUDE.md, the swap section).

   Safe to remove once every doc holding Module 4/5 data or Layer 4/5 ticks
   carries migrations.swap45, or after the school year resets progress
   (summer reset). Remove the flushSave gate, the teacher.js display remap
   and the journey.js swap45 block with it. */
function swap45MapId(id){
  if(typeof id !== 'string') return id;
  const flip = d => d === '4' ? '5' : '4';
  let m = /^(practice-)?m([45])w\d/.exec(id);           // m4w1-b-sec0-1, m5w2-s3, practice-m4w1-s3, m4w1
  if(m){ const p = m[1] || ''; return p + 'm' + flip(m[2]) + id.slice(p.length + 2); }
  m = /^mr([45])(-|$)/.exec(id);                        // mr4, mr4-s1, mr5-complete, mr5-reflection
  if(m) return 'mr' + flip(m[1]) + id.slice(3);
  m = /^chords-m([45])$/.exec(id);                      // the Open Chords deck (games.dk)
  if(m) return 'chords-m' + flip(m[1]);
  return id;
}
function swap45IsMap(v){ return !!v && typeof v === 'object' && !Array.isArray(v); }
function swap45Keys(map, fn){
  const out = {};
  Object.keys(map).forEach(k => { out[fn(k)] = map[k]; });   // fn is a bijection, so no two keys collide
  return out;
}
const swap45Layer = k => k === '4' ? '5' : k === '5' ? '4' : k;
// Whole maps keyed by set / step / skill / Module Review ids.
const SWAP45_MAPS = ['skills', 'responses', 'completed', 'practiceLog'];
// games.* maps keyed by skill ids (coachSkill, drillSkill) or deck ids (dk).
const SWAP45_GAME_MAPS = ['coachSkill', 'drillSkill', 'dk'];
function swap45Marked(d){ return !!(d && d.migrations && d.migrations.swap45 === true); }
/* The doc in the other numbering — a new object; values are carried over
   untouched (a graded MC answer is its choice TEXT, and the content moved
   intact, so it still matches). Fields it does not name are left as they
   are: classActivities / caSteps / exitChecks (activity ids), streak,
   period, songReadyAt (song ids), name, email, migrations. */
function swap45Remap(d){
  if(!swap45IsMap(d)) return d;
  const out = Object.assign({}, d);
  SWAP45_MAPS.forEach(f => { if(swap45IsMap(d[f])) out[f] = swap45Keys(d[f], swap45MapId); });
  if(swap45IsMap(d.games)){
    const g = Object.assign({}, d.games);
    SWAP45_GAME_MAPS.forEach(f => { if(swap45IsMap(d.games[f])) g[f] = swap45Keys(d.games[f], swap45MapId); });
    out.games = g;
  }
  if('lastModule' in d){
    const v = d.lastModule;
    out.lastModule = v === 4 ? 5 : v === 5 ? 4 : v === '4' ? '5' : v === '5' ? '4' : v;
  }
  if('lastSet' in d) out.lastSet = swap45MapId(d.lastSet);
  if(swap45IsMap(d.songReady)){
    const s = {};
    Object.keys(d.songReady).forEach(song => {
      const v = d.songReady[song];
      s[song] = swap45IsMap(v) ? swap45Keys(v, swap45Layer) : v;
    });
    out.songReady = s;
  }
  return out;
}
function swap45Canon(v){
  if(Array.isArray(v)) return '[' + v.map(swap45Canon).join(',') + ']';
  if(v && typeof v === 'object') return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + swap45Canon(v[k])).join(',') + '}';
  return JSON.stringify(v);
}
/* The update() that moves a stored doc: each field (or games.* sub-map) the
   remap changed, whole, by field path. null when nothing moves. */
function swap45Patch(d){
  if(!swap45IsMap(d)) return null;
  const r = swap45Remap(d), patch = {};
  SWAP45_MAPS.concat(['lastModule', 'lastSet', 'songReady']).forEach(f => {
    if(f in d && swap45Canon(d[f]) !== swap45Canon(r[f])) patch[f] = r[f];
  });
  if(swap45IsMap(d.games)) SWAP45_GAME_MAPS.forEach(f => {
    if(f in d.games && swap45Canon(d.games[f]) !== swap45Canon(r.games[f])) patch['games.' + f] = r.games[f];
  });
  return Object.keys(patch).length ? patch : null;
}
let swap45Done = false;   // the stored doc is known to be in the new numbering
let _swap45P = null;      // the swap45Commit() in flight, shared by every caller
/* Make sure the stored doc is in the new numbering. Resolves at once when
   it is known to be; otherwise one transaction (shared by concurrent
   callers). Rejects on any failure, leaving the doc as it was. */
function swap45Commit(){
  if(swap45Done || !currentUser || isDevBypassUser()) return Promise.resolve();
  if(_swap45P) return _swap45P;
  const user = currentUser;
  const p = _swap45P = (async () => {
    await ensureDb();
    if(!db) throw new Error('swap45: Firestore not available');
    const ref = db.collection('progress').doc(user.uid);
    await db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      if(!snap.exists){
        // The doc this browser is about to create is born in the new numbering.
        tx.set(ref, { name:user.displayName||'', email:user.email||'', migrations:{ swap45:true } }, { merge:true });
        return;
      }
      const d = snap.data();
      if(swap45Marked(d)) return;   // another tab (or an earlier visit) already moved it
      tx.update(ref, Object.assign(swap45Patch(d) || {}, { 'migrations.swap45': true }));
    });
    if(currentUser === user) swap45Done = true;
  })().finally(() => { if(_swap45P === p) _swap45P = null; });
  return p;
}
/* loadProgress()'s half: the stored doc as this session should see it. */
function swap45OnLoad(stored){
  if(swap45Marked(stored)){ swap45Done = true; return stored; }
  if(!currentUser || isDevBypassUser()) return stored;   // never reached — dev bypass loads no doc
  /* Every unmarked doc is committed now: the move when swap45Patch has one,
     the marker alone when it doesn't. Teacher mode never loads a student
     doc; if it ever did, its first save's gate would commit instead. */
  if(!IS_TEACHER_MODE) swap45Commit().catch(e => console.warn('[guitar-class] Module 4/5 progress move not saved yet — the next save retries it', e));
  return swap45Remap(stored);
}

/* A brand-new student (no doc) and a failed read start from the same empty
   state. The signed-out branch of onAuthStateChanged keeps its own list on
   purpose, and it is not a superset of this one: it also clears the delete
   maps and the class config, but leaves lastModuleNum, lastSetId, songReady
   and songReadyAt alone and never calls restoreLocalPlace() — loadProgress
   sets all of those at the next sign-in. */
function resetLoadedProgress(){
  progress={}; lastModuleNum=1; lastSetId=null; responses={}; completed={}; classActivities={}; caStepDone={}; exitChecks={}; games={};
  streak={ count:0, lastDay:null }; practiceLog=loadLocalPracticeLog(); songReady={}; songReadyAt={}; studentPeriod=''; restoreLocalPlace();
}
async function loadProgress(){
  progressLoadFailed = false;
  swap45Done = false;
  try{
    await ensureDb();
    const doc = await db.collection('progress').doc(currentUser.uid).get();
    if(doc.exists){
      // Module 4/5 swap (2026-10-12): an unmarked doc is read in the new numbering — see swap45OnLoad.
      const data = swap45OnLoad(doc.data());
      const raw = data.skills||{};
      progress = {};
      Object.keys(raw).forEach(k=>{
        if(raw[k]===true) progress[k]='gotit';
        else if(raw[k]==='working'||raw[k]==='gotit') progress[k]=raw[k];
        else if(raw[k]==='1'||raw[k]==='2'||raw[k]==='3') progress[k]=raw[k];
        else if((k.endsWith('-reflection')||k.endsWith('-performance')) && raw[k] && typeof raw[k]==='object') progress[k]=raw[k];
        else progress[k]='none';
      });
      lastModuleNum = data.lastModule||1;
      lastSetId     = data.lastSet||null;
      responses     = data.responses || {};
      completed     = data.completed || {};
      classActivities = data.classActivities || {};
      caStepDone    = caCleanTicks(data.caSteps);
      exitChecks    = data.exitChecks || {};
      games         = data.games || {};
      streak        = data.streak || { count:0, lastDay:null };
      // practiceLog (per-skill rep history): Firestore is the source of truth
      // when signed in; fall back to the localStorage copy for older docs that
      // predate the field, then mirror back so the offline copy stays fresh.
      // (That local fallback is NOT swap45-remapped: nothing records which
      // numbering a device copy was written in, and remapping a copy this
      // code already wrote would swap it back.)
      practiceLog   = data.practiceLog || loadLocalPracticeLog();
      savePracticeLogLocal();
      songReady     = data.songReady || {};
      songReadyAt   = data.songReadyAt || {};
      studentPeriod = data.period || '';
    } else resetLoadedProgress();
  } catch(e){ progressLoadFailed=true; console.warn('[guitar-class] progress load failed — running read-only on derived data', e); resetLoadedProgress(); }
}

/* ── Games access (teacher-controlled) ──
   One class-config doc (config/class) holds the whole-class master switch
   (gamesEnabled) plus a per-student override map (gameOverrides: uid → bool).
   The effective answer for THIS student: an override wins if present, else the
   class master, else ON. Only the teacher writes this doc (teacher.js); every
   student reads it. Reads that fail (offline / rules) leave games ON so a
   connection hiccup never locks a student out of the arcade. */
async function loadClassConfig(){
  /* Deliberately no upfront reset of the gate/visibility globals here — every
     one of them already carries its safe default at declaration, and this
     function reruns on every tab-visibility return (see the
     `visibilitychange` handler). Resetting them synchronously before the
     `await`s below used to open a real window, on every such call, where a
     render saw an empty board/date/hidden/retired/clears set and read the
     student as gated-with-nothing-posted or ungated-with-nothing-blocking —
     found 2026-09-26. Each field is overwritten in place once its real value
     is known, whether that's a fresh read below or the cache restore in the
     early-return/catch paths, so it now just keeps showing the last known
     good value for the length of the read instead of blanking first. */
  const openBefore = moduleOpenThrough;
  try{
    await ensureDb();
    if(!db){ restoreClassConfigFromCache(); applyActivityGate(); return; }
    const doc = await db.collection('config').doc('class').get();
    if(!doc.exists){ restoreClassConfigFromCache(); applyActivityGate(); return; }
    const d = doc.data()||{};
    /* Practice minutes: this week's goal set from the console (config/class.pmWeekGoals, { 'YYYY-Www': minutes }).
       Handed to the engine on every SUCCESSFUL read, an absent field as nothing; a failed read never gets here, so
       the engine keeps its last known map (its own localStorage copy). The engine repaints the strip if it changed. */
    try{ if(window.PM && PM.setWeekGoals) PM.setWeekGoals(d.pmWeekGoals); }catch(e){ console.warn('[guitar-class] practice minutes: this week\'s goal not applied', e); }
    // Teacher-set hold (teacher.js Manage view). Classroom management, not
    // security — the real boundary is the Firestore rules, which already
    // stop a student reading or writing anyone else's doc.
    accountPaused = (d.paused||{})[currentUser.uid] === true;
    // Teacher's period correction (teacher.js Manage view). A CAS override
    // must not fail open to '' — that would drop a CAS student's exemption
    // and let caBlockers() gate them — so it's cached like the dates and
    // the clears, not left to fail open like a cosmetic field. Unlike those,
    // it's one student's value, so the cache carries the uid: on a shared
    // Chromebook the next student must not inherit the last one's CAS.
    periodOverride = (d.periodOverrides||{})[currentUser.uid] || '';
    try{ localStorage.setItem('caPeriodOverride', JSON.stringify({uid: currentUser.uid, v: periodOverride})); }catch(e){}
    // Teacher's "Open through Module N" — see moduleOpenThrough. Only a whole
    // number 2..12 counts; anything else is no override.
    const openN = Number((d.moduleOpenThrough||{})[currentUser.uid]);
    moduleOpenThrough = (Number.isInteger(openN) && openN >= 2 && openN <= 12) ? openN : 0;
    try{ localStorage.setItem('caOpenThrough', JSON.stringify({uid: currentUser.uid, v: moduleOpenThrough})); }catch(e){}
    const ms = d.micSampling || {};
    const msMax = Number(ms.max);
    micSampling = { on: ms.on === true && msMax > 0, max: msMax > 0 ? msMax : 0 };
    if(micSampling.on){
      db.collection('micTakesMeta').doc('count').get()
        .then(c => { micTakesCount = c.exists ? (Number(c.data().n) || 0) : 0; })
        .catch(() => { micTakesCount = Infinity; });
    } else micTakesCount = Infinity;
    // An already-drawn "each take is saved" footer (coach.js) follows an
    // On/Off flip. coach.js loads lazily, so it may not be here yet.
    if(typeof micRecFootSync === 'function') micRecFootSync();
    const ov = (d.gameOverrides||{})[currentUser.uid];
    if(ov===true)       gamesAccessOn = true;
    else if(ov===false) gamesAccessOn = false;
    else                gamesAccessOn = (d.gamesEnabled!==false);   // field absent ⇒ on
    /* In-Class Activities the teacher has hidden (teacher.js Class activities
       view) — pulling something back, either because it went out early or
       because the room ran out of time. Cached, and for the same "must not
       fail open" reason as the dates, the clears and the retired map below:
       this stopped being a cosmetic field when the activity gate shipped.
       An assigned, dated, already-live activity that the teacher has hidden
       would come back on a blocked read — the cache restores the date and
       the board entry, so it reads visible again — and then BLOCK the whole
       site on a card nobody can finish, with only a per-student Clear as the
       way out. Last known beats {} here. */
    hiddenActivityIds = d.hiddenActivities || {};
    try{ localStorage.setItem('caHidden', JSON.stringify(hiddenActivityIds)); }catch(e){}
    // Release dates (teacher.js Class activities view) — the actual on/off
    // switch for an activity now that class-activities.js ships them undated.
    // Unlike hiddenActivityIds, a failed/missing read here must NOT fail
    // open (that would show every activity, dated or not, to everyone) —
    // it fails to the last successfully loaded copy in localStorage instead,
    // via restoreClassConfigFromCache() in every early-return/catch path.
    activityDates = d.activityDates || {};
    try{ localStorage.setItem('caDates', JSON.stringify(activityDates)); }catch(e){}
    // Teacher renames (teacher.js Class activities view) — id -> { en, base }.
    // This one really does fail open to {} rather than to a cache: losing a
    // rename shows the shipped title, which is a cosmetic fallback, not a
    // leak of unreleased content and not something that can gate the site.
    // See caTitle().
    activityTitles = d.activityTitles || {};
    // Teacher renumbering (same view) — id -> { n, base }. Fails open to
    // {} like the renames: losing it shows the shipped teaching order,
    // which is a cosmetic fallback. See caNumber().
    activityNumbers = d.activityNumbers || {};
    // Per-student activity-gate clears (teacher.js Class activities /
    // Students view) — uid -> { activityId -> true }, see caBlockers().
    // Same "must not fail open" rule as activityDates above: a failed read
    // here must not look like every blocker just got cleared, so it falls
    // back to the cache too rather than to {}.
    activityClears = d.activityClears || {};
    try{ localStorage.setItem('caClears', JSON.stringify(activityClears)); }catch(e){}
    /* Archived + deleted activities (teacher.js Class activities view),
       merged into one set — see retiredActivityIds. Cached like the dates
       and the clears, and for the same "must not fail open" reason: a
       blocked read that reset this to {} would bring a retired activity
       back onto In-Class Activities, and a retired activity a student can no longer see
       the point of is exactly the kind of thing that should not start
       blocking the site again on a flaky connection. */
    retiredActivityIds = Object.assign({}, d.archivedActivities || {}, d.deletedActivities || {});
    try{ localStorage.setItem('caRetired', JSON.stringify(retiredActivityIds)); }catch(e){}
    // Optional activities (teacher.js board) — see optionalActivityIds.
    optionalActivityIds = d.optionalActivities || {};
    try{ localStorage.setItem('caOptional', JSON.stringify(optionalActivityIds)); }catch(e){}
    /* Individual activities (teacher.js board "Who" picker) — see
       activityForMe. Cached, never failed open: a blocked read that reset
       this to {} would turn one student's card into a whole-class card and
       start sending everyone to it at sign-in. The cache carries the uid,
       like caPeriodOverride: on a shared Chromebook the next student gets
       every individual card read as someone else's, not the last
       student's cards. */
    activityForMe = caReduceForMe(d.activityStudents, currentUser.uid);
    try{ localStorage.setItem('caForMe', JSON.stringify({uid: currentUser.uid, v: activityForMe})); }catch(e){}
    // "Play Along now" practice cards (teacher.js board) — see playAlongActivityIds.
    playAlongActivityIds = d.playAlongActivities || {};
    try{ localStorage.setItem('caPlayAlong', JSON.stringify(playAlongActivityIds)); }catch(e){}
    // Songs moved between Class activities and the Songs page — see songLibraryIds.
    songLibraryIds = d.songLibrary || {};
    try{ localStorage.setItem('caSongLib', JSON.stringify(songLibraryIds)); }catch(e){}
    // Teacher-only cards moved to Class activities — see classSongIds.
    classSongIds = d.classSongs || {};
    try{ localStorage.setItem('caClassSongs', JSON.stringify(classSongIds)); }catch(e){}
    // "Keep practicing" pins (teacher.js board) — see activityPins.
    activityPins = caCleanPins(d.activityPins);
    try{ localStorage.setItem('caPins', JSON.stringify(activityPins)); }catch(e){}
    /* The activity board (teacher.js) — which activities are placed in the
       course, in which module, in what order. Cached, and for the same
       "must not fail open" reason as the dates: an empty board reads as
       "nothing has been placed yet" and would take every card off
       In-Class Activities,
       so a blocked read has to fall back to the last known copy rather
       than to {}. See caBoardOrder. */
    activityBoard = d.activityBoard || {};
    activityBoardOn = d.activityBoardSeeded === true;
    try{ localStorage.setItem('caBoard', JSON.stringify({on: activityBoardOn, map: activityBoard})); }catch(e){}
  }catch(e){ console.warn('[guitar-class] class config load failed — using the cached copy', e); restoreClassConfigFromCache(); /* leave games on, nothing hidden */ }
  finally{
    // Every exit, early returns included: the teacher's "Open through" may
    // have changed under a rail that's already drawn (see repaintModuleGate).
    if(moduleOpenThrough !== openBefore) repaintModuleGate();
    // Same for the teacher's games switch (the visibilitychange re-read):
    // before this only showApp() applied it, so turning games OFF mid-class
    // left a button that silently refused and ON left it hidden until a
    // reload. The boot-time run is skipped — showApp() applies it itself.
    // (A Pause is deliberately NOT applied live.)
    if(appIsOnScreen()) applyGamesAccess();
  }
  applyActivityGate();
  refreshSongsPlayAlong();   // the Songs page's Play along list reads the same board and dates
}
/* moduleOpenThrough changed under an app that may already be on screen (the
   visibilitychange re-read — the teacher set it mid-class). Redraw the two
   places the gate is drawn: renderPills() also strips .set-peek from any set
   that is now open, so a set the student was peeking at becomes writable
   without a reload. No-op before showApp() has built the rail. */
function repaintModuleGate(){
  if(!document.getElementById('week-pills') || typeof lastModuleNum === 'undefined') return;
  if(!SETS.some(w=>w.moduleNum===lastModuleNum)) return;
  renderPills(lastModuleNum);
  populateModuleDropdown();
  renderProgressStrip();
}
// A student who has loaded config at least once keeps seeing that last-known
// set of release dates (and gate clears) through a later offline/blocked
// read, rather than every activity going dark or every blocker snapping back
// on. A student who has NEVER loaded config sees no activities — acceptable,
// since they also have no progress connection yet.
function restoreClassConfigFromCache(){
  try{
    const cached = JSON.parse(localStorage.getItem('caPeriodOverride') || 'null');
    if(cached && currentUser && cached.uid === currentUser.uid) periodOverride = cached.v || '';
  }catch(e){ /* ignore — periodOverride stays '' */ }
  try{
    const cached = JSON.parse(localStorage.getItem('caOpenThrough') || 'null');
    if(cached && currentUser && cached.uid === currentUser.uid) moduleOpenThrough = Number(cached.v) || 0;
  }catch(e){ /* ignore — moduleOpenThrough keeps its last value */ }
  try{
    const raw = localStorage.getItem('caDates');
    if(raw) activityDates = JSON.parse(raw) || {};
  }catch(e){ /* ignore — activityDates stays {} */ }
  try{
    const raw = localStorage.getItem('caClears');
    if(raw) activityClears = JSON.parse(raw) || {};
  }catch(e){ /* ignore — activityClears stays {} */ }
  try{
    const raw = localStorage.getItem('caRetired');
    if(raw) retiredActivityIds = JSON.parse(raw) || {};
  }catch(e){ /* ignore — retiredActivityIds stays {} */ }
  try{
    const raw = localStorage.getItem('caHidden');
    if(raw) hiddenActivityIds = JSON.parse(raw) || {};
  }catch(e){ /* ignore — hiddenActivityIds stays {} */ }
  try{
    const raw = localStorage.getItem('caOptional');
    if(raw) optionalActivityIds = JSON.parse(raw) || {};
  }catch(e){ /* ignore — optionalActivityIds stays {} */ }
  try{
    const raw = localStorage.getItem('caForMe');
    const c = raw ? JSON.parse(raw) : null;
    if(c && c.v && typeof c.v === 'object'){
      const mine = c.uid === (currentUser && currentUser.uid);
      activityForMe = {};
      Object.keys(c.v).forEach(id => { activityForMe[id] = mine ? c.v[id] === true : false; });
    }
  }catch(e){ /* ignore — activityForMe stays {} */ }
  try{
    const raw = localStorage.getItem('caPlayAlong');
    if(raw) playAlongActivityIds = JSON.parse(raw) || {};
  }catch(e){ /* ignore — playAlongActivityIds stays {} */ }
  try{
    const raw = localStorage.getItem('caSongLib');
    if(raw) songLibraryIds = JSON.parse(raw) || {};
  }catch(e){ /* ignore — songLibraryIds stays {} */ }
  try{
    const raw = localStorage.getItem('caClassSongs');
    if(raw) classSongIds = JSON.parse(raw) || {};
  }catch(e){ /* ignore — classSongIds stays {} */ }
  try{
    const raw = localStorage.getItem('caPins');
    if(raw) activityPins = caCleanPins(JSON.parse(raw));
  }catch(e){ /* ignore — activityPins stays [] */ }
  try{
    const raw = localStorage.getItem('caBoard');
    const cached = raw ? JSON.parse(raw) : null;
    if(cached && typeof cached === 'object'){ activityBoard = cached.map || {}; activityBoardOn = cached.on === true; }
  }catch(e){ /* ignore — activityBoard stays {}, unseeded */ }
}
/* Show/hide the 🎮 Games button to match this student's access, and if games
   get turned off while the arcade is open, close it. */
function applyGamesAccess(){
  const btn = document.getElementById('games-btn');
  if(btn) btn.style.display = gamesAccessOn ? '' : 'none';
  if(!gamesAccessOn){
    const screen = document.getElementById('games-screen');
    if(screen && !screen.hasAttribute('hidden')){
      if(location.hash==='#games') exitExploreHash();
      if(typeof gamesClosePanel==='function') gamesClosePanel();
    }
  }
}

/* Last-place persistence (Session 4.4): Firestore is the source of truth, but
   we also stash the last module/set in localStorage so a returning student
   lands where they left off instantly — even before Firestore loads, on a
   flaky connection, or in dev-bypass mode. */
function restoreLocalPlace(){
  try{
    const m = parseInt(localStorage.getItem(_uidKey('gc-lastModule')));
    const s = localStorage.getItem(_uidKey('gc-lastSet'));
    if(m) lastModuleNum = m;
    if(s) lastSetId = s;
  }catch(e){/* localStorage may be unavailable (private mode) — ignore */}
}
function saveLocalPlace(){
  try{
    localStorage.setItem(_uidKey('gc-lastModule'), String(lastModuleNum||1));
    if(lastSetId) localStorage.setItem(_uidKey('gc-lastSet'), lastSetId);
  }catch(e){/* ignore */}
}

/* PR (personal-record BPM) response slots keep a short history instead of a
   single overwritten value, so a student (and the teacher view) can see
   progress over time. Legacy docs still have a bare scalar for these keys —
   prLatestValue() below reads either shape. */
function prLatestValue(raw){
  if(Array.isArray(raw)) return raw.length ? (raw[raw.length-1].value || '') : '';
  return raw || '';
}
const _prEditingKeys = new Set();
function onResponseChange(key, value, isPR){
  if(isPeekedResponseKey(key)) return;   // read-only preview of a locked set
  if(isPR){
    const arr = Array.isArray(responses[key]) ? responses[key].slice()
      : (responses[key] != null && responses[key] !== '' ? [{value:responses[key], date:null}] : []);
    if(_prEditingKeys.has(key) && arr.length){
      arr[arr.length-1] = {value, date:arr[arr.length-1].date};
    } else {
      arr.push({value, date:new Date().toISOString()});
      if(arr.length > 8) arr.shift();
      _prEditingKeys.add(key);
    }
    responses[key] = arr;
    /* After a failed load this history was built from nothing, so it is not
       sent (flushSave filters it out too): say so instead of a false "Saved". */
    if(progressLoadFailed){ setSaveMsg('save.notSaving'); return; }
  } else {
    responses[key] = value;
  }
  saveResponses();
}
function onResponsePRBlur(key){ _prEditingKeys.delete(key); }
/* Graded in-step MC (factual, has answer:). Stores the choice TEXT (so the
   teacher dashboard reads it unchanged); recolors and reveals the explanation. */
function onStepMcSelect(key, btn){
  if(isPeekedResponseKey(key)) return;   // read-only preview of a locked set
  const choice = btn.dataset.choice;
  responses[key] = choice;
  saveResponses();
  const group = btn.closest('.step-mc-keyed');
  if(!group) return;
  group.classList.add('answered');
  group.querySelectorAll('.step-mc-opt').forEach(b=>{ b.classList.remove('correct','incorrect'); b.setAttribute('aria-pressed', String(b === btn)); });
  const right = btn.dataset.correct === '1';
  btn.classList.add(right ? 'correct' : 'incorrect');
  // Say what the colours show: right or not, the answer, then the explain.
  const resp = group.closest('.step-resp');
  const sr = resp && resp.querySelector('.step-mc-sr');
  if(sr){
    const ans = group.querySelector('.step-mc-opt.is-answer .step-mc-text');
    const ex = resp.querySelector('.step-mc-explain');
    const said = right ? t('step.correct') : t('step.mcAnswerIs', {answer: ans ? ans.textContent : ''});
    sr.textContent = ex ? said.replace(/([^.!?])$/, '$1.') + ' ' + ex.textContent : said;
  }
}
/* ── Unified progress writer ──
   skills, last-place, responses, and completed all live in the SAME Firestore
   doc, so instead of three independent debounced writers (which could fire
   several near-simultaneous .set() calls), we mark which categories are dirty
   and flush them together in ONE write. The payload is built from live state at
   flush time, so it always sends the current values. saveProgress /
   saveResponses / saveCompleted are kept as named entry points (called from
   inline handlers and all over app.js). */
const SAVE_MAX_AUTO_RETRIES = 5;   // then give up quietly until the next user action re-arms it
let _saveFailCount = 0;
/* The flushSave() run in flight, if any — a promise that settles (never
   rejects) when it has finished, landed or not. signOut() waits on it: the
   run took the dirty keys with it, so a second flushSave() sees nothing to
   send and returns at once while the first write is still on the wire. */
let _flushP = null;
/* p, or a rejection after ms. A Firestore call on a network that accepts the
   connection and then stalls never settles (see startAuthStallTimer), so a
   button the student is waiting on gets a ceiling. The call itself is not
   cancelled — it may still land later. */
function withTimeout(p, ms){
  let timer;
  return Promise.race([p, new Promise((_, rej)=>{ timer = setTimeout(()=>rej(new Error('timeout')), ms); })])
    .finally(()=>clearTimeout(timer));
}
/* Categories whose new value is computed FROM the old one: a streak count, an
   all-time best, a rep tally. If loadProgress() never read the doc, every one
   of them restarts from zero — and because flushSave writes {merge:true},
   Firestore happily merges that zero-based leaf over the real one (streak 15 →
   1; a 10/10 arcade best → 4; 47 reps → 1). The other categories are safe to
   keep writing: skills, responses and completed are statements the student
   makes outright this session, and merge leaves every key they didn't touch
   alone — PROVIDED the map has at least one key in it. One exception inside
   responses: a PR slot is a HISTORY built from its old value (onResponseChange),
   and an array is replaced whole, so after a failed load a new PR entry would
   replace the stored history with a one-entry one. Those keys are held back
   instead (flushSave sends responses without them; onResponseChange says "Not
   saving"). An EMPTY map is the
   exception: Firestore puts the bare field in the update mask and REPLACES
   the stored map with {} (every "I've got it", every rating, gone). After a
   failed load an empty map means "unknown", not "nothing", so flushSave drops
   it from the payload — see LOAD_FAILED_EMPTY_MAPS. So we hold back only
   these four whole categories, and only until a load succeeds — skipping a
   save costs one session's streak bump; letting it through costs the record
   itself. */
const LOAD_DEPENDENT_SAVE_KEYS = new Set(['streak','games','practiceLog','exitChecks']);
/* The whole-map categories flushSave sends that a failed load leaves EMPTY
   (loadProgress's catch). Each is dropped from the payload while empty after a
   failed load — see the comment at the drop in flushSave. Pinned by checks.mjs
   1bo: a new whole-map payload field must be added here or to its list of
   fields that can't wipe a map. */
const LOAD_FAILED_EMPTY_MAPS = ['skills','responses','completed','classActivities','caSteps'];
function queueSave(...keys){
  if(!currentUser) return;
  keys.forEach(k=>{ if(!(progressLoadFailed && LOAD_DEPENDENT_SAVE_KEYS.has(k))) _dirtyKeys.add(k); });
  // Everything asked for was held back — say so rather than flash a false
  // "Saved ✓" (or arm a flush with nothing in it).
  if(!_dirtyKeys.size){ setSaveMsg('save.notSaving'); return; }
  if(_dirtyKeys.has('place')) saveLocalPlace();   // local mirror, immediate
  /* Dev bypass never signs in to Firebase Auth, so every Firestore write under
     that uid is rejected by the rules — arming a flush only buys five failed
     retries and a "save failed" flash. Say plainly that nothing is being saved
     (the local place mirror above still runs, which is what devBypass's
     restoreLocalPlace() reads back). */
  if(isDevBypassUser()){ _dirtyKeys.clear(); setSaveMsg('save.notSaving'); return; }
  _saveFailCount = 0;   // a fresh user action gets its own full retry budget
  clearTimeout(saveTimer);
  setSaveMsg('save.saving');
  saveTimer = setTimeout(flushSave, 800);
}
async function flushSave(){
  if(!currentUser) return;
  const keys = _dirtyKeys; _dirtyKeys = new Set();
  if(!keys.size) return;
  let flushDone;
  const thisFlush = _flushP = new Promise(r=>{ flushDone = r; });
  /* Each category is sent WHOLE, not just the keys this tab touched. What
     that does and doesn't cost, since the audit's phrasing overstated it:
     Firestore's {merge:true} merges a map field key by key (which is exactly
     why removing one needs the FieldValue.delete() sentinels below — omitting
     it would not remove it). So a second tab's ADDED keys are never lost. The
     one real exposure is a key BOTH tabs hold: this tab's copy, read when it
     loaded, overwrites the other tab's newer value. Fixing that properly means
     tracking dirtiness per key rather than per category — a change to the save
     path, not a comment. Left alone deliberately. */
  const payload = { name:currentUser.displayName||'', email:currentUser.email||'' };
  if(keys.has('skills'))    payload.skills    = progress;
  if(keys.has('place')){    payload.lastModule = lastModuleNum; payload.lastSet = lastSetId||null; }
  /* After a failed load a PR history (an array) was built from nothing:
     sending it would replace the stored history whole, so it is held back.
     The student's other answers in this save still go. */
  if(keys.has('responses')) payload.responses = progressLoadFailed
    ? Object.fromEntries(Object.entries(responses).filter(([, v])=>!Array.isArray(v)))
    : responses;
  let sentDeletes = null;
  let sentCaDeletes = null;
  let sentStepDeletes = null;
  // Copies, so the FieldValue.delete() sentinels stamped in below never leak
  // into local state.
  if(keys.has('completed'))       payload.completed       = Object.assign({}, completed);
  if(keys.has('classActivities')) payload.classActivities = Object.assign({}, classActivities);
  if(keys.has('caSteps'))         payload.caSteps         = Object.assign({}, caStepDone);
  // Whole map, {merge:true} as everywhere else. No delete path: a student
  // never removes an exit-check result, only adds or (on a retake) replaces one.
  if(keys.has('exitChecks')) payload.exitChecks = exitChecks;
  if(keys.has('games'))     payload.games     = games;
  if(keys.has('streak'))    payload.streak    = streak;
  if(keys.has('practiceLog')) payload.practiceLog = practiceLog;
  if(keys.has('period'))    payload.period    = studentPeriod;
  try{
    await ensureDb();
    /* Module 4/5 swap (2026-10-12): this write must never land on a doc
       still in the old numbering, or the next load swaps its new keys the
       wrong way — so the move (or, for a doc with nothing to move, just its
       marker) lands first. Resolves at once after the first success; a
       rejection is an ordinary failed save, retried below. See swap45Commit. */
    await swap45Commit();
    /* The delete sentinels are stamped in HERE, after ensureDb(), and not
       where the payload is assembled: `firebase.firestore` doesn't exist
       until the Firestore SDK has actually loaded, so building them earlier
       threw a TypeError from OUTSIDE this try — an unhandled rejection that
       raised the global "Something went wrong" banner instead of the ordinary
       save-failed retry. Un-marking a step with the SDK still unloaded (a
       first visit that went offline, or a blocked CDN) was enough to do it. */
    // Each entry is [key, seq] — see completedDeletes for why the seq rides along.
    if(payload.completed && completedDeletes.size){
      sentDeletes = [...completedDeletes];
      sentDeletes.forEach(([k])=>{ payload.completed[k] = firebase.firestore.FieldValue.delete(); });
    }
    if(payload.classActivities && classActivitiesDeletes.size){
      sentCaDeletes = [...classActivitiesDeletes];
      sentCaDeletes.forEach(([k])=>{ payload.classActivities[k] = firebase.firestore.FieldValue.delete(); });
    }
    if(payload.caSteps && caStepDeletes.size){
      sentStepDeletes = [...caStepDeletes];
      sentStepDeletes.forEach(([k])=>{ payload.caSteps[k] = firebase.firestore.FieldValue.delete(); });
    }
    /* A failed load left these maps empty, and an empty map sent with
       {merge:true} REPLACES the server's map instead of merging into it (the
       bare field lands in the update mask). So after a failed load, an empty
       whole-map category is dropped here — last, after the delete sentinels
       are stamped, so a map holding only sentinels (a step ticked and
       un-ticked this session) still goes, and a re-tick that emptied the
       delete set during the await above can't slip an empty map through.
       A NON-empty map is the student's own new work, and merge keeps the
       rest. checks.mjs 1bo pins this list against every whole-map payload
       field in this function. */
    if(progressLoadFailed){
      LOAD_FAILED_EMPTY_MAPS.forEach(f=>{
        if(payload[f] && !Object.keys(payload[f]).length) delete payload[f];
      });
    }
    await db.collection('progress').doc(currentUser.uid).set(payload,{merge:true});
    // Only now that the write landed: retire the deletes it carried — each
    // one only if it is still the SAME un-mark this write sent. A key
    // re-ticked and un-ticked again during the write has a newer seq and
    // stays queued for the next flush.
    const retire = (sent, queue)=>{ if(sent) sent.forEach(([k, seq])=>{ if(queue.get(k) === seq) queue.delete(k); }); };
    retire(sentDeletes, completedDeletes);
    retire(sentCaDeletes, classActivitiesDeletes);
    retire(sentStepDeletes, caStepDeletes);
    setSaveMsg('save.saved', 2000);
    _saveFailCount = 0;
    /* A period save landing closes the picker and refreshes the gate — win
       here rather than only in periodPick's own synchronous await, so a
       DELAYED auto-retry (this function, called again by its own catch
       branch below) also clears a modal that periodPick already gave up on
       and left showing "answer didn't save, try again". */
    if(keys.has('period') && document.getElementById('period-overlay')){
      closePeriodPicker();
      refreshOpenClassActivitiesScreen();
      applyActivityGate();   // picking CAS lifts the gate even off this screen
    }
  } catch(e){
    keys.forEach(k=>_dirtyKeys.add(k));   // keep dirty so the next save retries
    _saveFailCount++;
    clearTimeout(saveTimer);
    if(_saveFailCount <= SAVE_MAX_AUTO_RETRIES){
      setSaveMsg('save.failed');
      saveTimer = setTimeout(flushSave, 3000);
    } else {
      // Stop auto-retrying (a persistently rejected write — e.g. dev-bypass
      // mode, or a blocked account — would otherwise loop forever). The
      // dirty keys stay queued; the next real save (queueSave) resets the
      // counter and tries again.
      setSaveMsg('save.notSaving');
    }
  } finally {
    flushDone();
    if(_flushP === thisFlush) _flushP = null;
  }
}
function saveResponses(){ queueSave('responses'); }

/* Un-marked step keys awaiting a Firestore delete. flushSave writes with
   set(…,{merge:true}), which preserves any key missing from the payload — so
   `delete completed[key]` alone never un-marks the step server-side. Each
   un-marked key is queued here, written as FieldValue.delete() on the next
   flush, and cleared only after that write lands (a failed write retries it,
   same as the dirty keys).
   A Map of key → the seq of the un-mark that queued it, not a Set: untick,
   re-tick, untick again while the first delete's write is still in flight
   (2 s+ on school Wi-Fi) used to let that first write's success retire the
   SECOND un-mark too — the next flush then carried no delete, the re-tick's
   `true` stood on the server, and the step came back done at next sign-in.
   flushSave now retires an entry only if its seq still matches. */
let _deleteSeq = 0;
let completedDeletes = new Map();
function onCompleteChange(key, isDone){
  if(isDone){ completed[key] = true; completedDeletes.delete(key); }
  else { delete completed[key]; completedDeletes.set(key, ++_deleteSeq); }
  saveCompleted();
}
function saveCompleted(){ queueSave('completed'); }

// Same shape as completed/completedDeletes/onCompleteChange/saveCompleted
// above, for In-Class Activities' own top-level Firestore field.
let classActivitiesDeletes = new Map();
function onClassActivityChange(id, isDone){
  if(isDone){ classActivities[id] = true; classActivitiesDeletes.delete(id); }
  else { delete classActivities[id]; classActivitiesDeletes.set(id, ++_deleteSeq); }
  saveClassActivities();
}
function saveClassActivities(){ queueSave('classActivities'); }
/* Class-activity step and practice-card check ticks ("ca-18:0", "ca-18:c2"):
   the student's own top-level `caSteps` field, same set/delete shape as
   classActivities above. Kept in Firestore, not on the Chromebook, so they
   follow the student to any device and never reset (Jonathan, 2026-10-01). */
let caStepDeletes = new Map();
function onCaStepChange(key, isDone){
  if(isDone){ caStepDone[key] = true; caStepDeletes.delete(key); }
  else { delete caStepDone[key]; caStepDeletes.set(key, ++_deleteSeq); }
  queueSave('caSteps');
}
function saveExitChecks(){ queueSave('exitChecks'); }
function saveGames(){ queueSave('games'); }   // per-game bests (games arcade, coach.js)
function saveStreak(){ queueSave('streak'); }

function saveProgress(){ queueSave('skills','place'); }

/* Site-wide practice streak, independent of any one game (coach-strum.js's
   rrSetDone applies the same day-string rule to Riff Roulette). Weekends never
   break it: dayStreakContinues, app/boot.js (Jonathan, 2026-11-13). */
function dayStr(d){
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function bumpPracticeStreak(){
  if(!currentUser || isDevBypassUser()) return;
  const today = dayStr(new Date());
  if(streak.lastDay === today) return;
  streak.count = dayStreakContinues(streak.lastDay, today) ? (streak.count || 0) + 1 : 1;
  streak.lastDay = today;
  saveStreak();
}
let _saveMsgT = null;
// `key` is an i18n key (or '' to clear) — save-ind elements are tagged
// data-i18n so a language switch mid-message (e.g. still showing "Saving…"
// when the toggle is hit) re-resolves it instead of staying stuck in
// whichever language it was first drawn in.
function setSaveMsg(key, clearAfterMs){
  /* "Saved ✓" only when nothing is left to send: a write that lands while a
     newer change is still waiting out the debounce has not saved THAT one,
     and the next flush will report it either way. */
  if(key === 'save.saved' && _dirtyKeys.size){ key = 'save.saving'; clearAfterMs = 0; }
  clearTimeout(_saveMsgT);
  document.querySelectorAll('.save-ind').forEach(el=>{
    if(key){ el.textContent = t(key); el.setAttribute('data-i18n', key); }
    else { el.textContent = ''; el.removeAttribute('data-i18n'); }
  });
  if(clearAfterMs) _saveMsgT = setTimeout(()=>setSaveMsg(''), clearAfterMs);
}

