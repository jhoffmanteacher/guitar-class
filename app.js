/* Every set always opens at the top (activateSet enforces this) — but a
   reload or browser back/forward can otherwise have the browser natively
   restore its own remembered scroll position before our JS runs, undoing
   that. Same fix as tabs/journey.js: hand scroll restoration back to us. */
if('scrollRestoration' in history) history.scrollRestoration = 'manual';

/* ── Global safety net ──
   If a script throws or a promise rejects unhandled, a student shouldn't be
   left staring at a half-broken page with no idea what happened. Show one
   small, dismissable banner pointing them to a refresh (their saved progress
   lives in Firestore, so a reload is safe), and log details to the console
   for troubleshooting. Guarded so the handler can never spiral on itself. */
(function(){
  let shown = false;
  function showBanner(){
    if (shown) return; shown = true;
    try {
      const d = document.createElement('div');
      d.setAttribute('role','alert');
      d.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;'
        + 'max-width:520px;margin:0 auto;padding:12px 44px 12px 16px;border-radius:12px;'
        + 'background:#514a7d;color:#fff;font:14px/1.45 system-ui,-apple-system,sans-serif;'
        + 'box-shadow:0 6px 24px rgba(0,0,0,.28)';
      const msg = document.createElement('span');
      msg.textContent = 'Something went wrong. Your saved progress is safe — please refresh the page to keep going. ';
      const refresh = document.createElement('button');
      refresh.textContent = 'Refresh';
      refresh.style.cssText = 'margin-left:4px;padding:3px 12px;border:0;border-radius:14px;'
        + 'background:#fff;color:#514a7d;font-weight:600;cursor:pointer';
      refresh.onclick = () => location.reload();
      const close = document.createElement('button');
      close.setAttribute('aria-label','Dismiss');
      close.textContent = '×';
      close.style.cssText = 'position:absolute;top:8px;right:12px;background:none;border:0;'
        + 'color:#fff;font-size:1.25rem;line-height:1;cursor:pointer';
      close.onclick = () => d.remove();
      d.append(msg, refresh, close);
      (document.body || document.documentElement).appendChild(d);
    } catch(_) { /* never let the safety net crash */ }
  }
  window.addEventListener('error', e => { console.error('[guitar-class] error:', e.error || e.message); showBanner(); });
  window.addEventListener('unhandledrejection', e => { console.error('[guitar-class] unhandled rejection:', e.reason); showBanner(); });
})();

/* ── Offline banner ──
   sw.js already serves the cached shell while offline — this just tells the
   student why videos/saving are paused, and clears itself on reconnect.
   Mirrors the safety-net banner above (same look, same dismiss pattern). */
(function(){
  let el = null;
  function showOfflineBanner(){
    if (el) return;
    try {
      const d = document.createElement('div');
      d.setAttribute('role','status');
      d.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;'
        + 'max-width:520px;margin:0 auto;padding:12px 44px 12px 16px;border-radius:12px;'
        + 'background:#514a7d;color:#fff;font:14px/1.45 system-ui,-apple-system,sans-serif;'
        + 'box-shadow:0 6px 24px rgba(0,0,0,.28)';
      const msg = document.createElement('span');
      msg.textContent = "You're offline — practice pages still work; videos and saving resume when you reconnect.";
      const close = document.createElement('button');
      close.setAttribute('aria-label','Dismiss');
      close.textContent = '×';
      close.style.cssText = 'position:absolute;top:8px;right:12px;background:none;border:0;'
        + 'color:#fff;font-size:1.25rem;line-height:1;cursor:pointer';
      close.onclick = () => hideOfflineBanner();
      d.append(msg, close);
      (document.body || document.documentElement).appendChild(d);
      el = d;
    } catch(_) { /* never let the banner crash the page */ }
  }
  function hideOfflineBanner(){
    if (el) { el.remove(); el = null; }
  }
  window.addEventListener('offline', showOfflineBanner);
  window.addEventListener('online', hideOfflineBanner);
})();

/* ── Firebase init ── */
// The Firebase SDK + config load as separate <script>s. On some school
// networks a content filter blocks gstatic.com, so they may never arrive —
// guard against that instead of crashing the whole page silently.
let auth = null, db = null;
const firebaseReady = typeof firebase !== 'undefined' && typeof firebaseConfig !== 'undefined';
if (firebaseReady) {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  // NOTE: db (Firestore) is intentionally NOT initialized here. The Firestore
  // SDK (~100 KB) is loaded on demand by ensureDb() the first time we read or
  // write progress — i.e. only after sign-in — so the sign-in screen paints
  // without it. See index.html.
} else {
  showFirebaseLoadError();
}

/* ── Firestore SDK: load on demand ──
   Loads firebase-firestore-compat.js (once) and initializes `db`. Called
   before any read/write. signIn() pre-warms this during the Google popup so
   it's usually ready by the time onAuthStateChanged fires. */
let _firestoreLoad = null;
function loadFirestoreSdk(){
  if(_firestoreLoad) return _firestoreLoad;
  _firestoreLoad = new Promise((resolve,reject)=>{
    const s = document.createElement('script');
    s.src = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js';
    s.onload  = ()=>resolve();
    // Remove the failed tag so a later retry (flushSave's bounded backoff)
    // doesn't pile up a fresh orphaned <script> in <head> on every attempt.
    s.onerror = ()=>{ s.remove(); _firestoreLoad=null; reject(new Error('Firestore SDK failed to load')); };
    document.head.appendChild(s);
  });
  return _firestoreLoad;
}
async function ensureDb(){
  if(db) return db;
  if(!firebaseReady) return null;
  await loadFirestoreSdk();
  db = firebase.firestore();
  return db;
}
let currentUser = null;
// Scopes a per-device localStorage key to the signed-in student, so a shared
// Chromebook can't have one student's practice log or last-place bleed into
// the next student's Firestore doc. Falls back to an unscoped device bucket
// when nobody's signed in (e.g. before auth resolves).
function _uidKey(base){ return (currentUser && currentUser.uid) ? base+':'+currentUser.uid : base; }
let progress    = {};
let responses   = {};
let completed   = {};
let games       = {};   // per-game bests from the games arcade (coach.js) — its own save category
let streak      = { count:0, lastDay:null };   // site-wide practice streak, independent of any one game
let gamesAccessOn = true; // whether the Games arcade is available to THIS student (teacher-controlled; see loadClassConfig)
let accountPaused = false; // teacher put this student on hold (see loadClassConfig / showPausedScreen)
let saveTimer   = null;

/* ── Lazy module loading ──
   Module data files (module-N.js) are no longer loaded up front. Each is
   fetched on demand the first time its module is opened, then its panels are
   built into the DOM. This keeps first load light on weak Wi-Fi / slow
   Chromebooks: we parse one module's data and build one module's panels
   instead of all eight. The service worker still precaches every module file,
   so opening a not-yet-loaded module while offline keeps working. */
const _moduleLoads = {};           // num -> Promise (dedupes concurrent loads)
const _modulesRendered = new Set();
function loadModuleData(num){
  num = parseInt(num);
  if(_moduleLoads[num]) return _moduleLoads[num];
  _moduleLoads[num] = new Promise((resolve,reject)=>{
    const s = document.createElement('script');
    s.src = `module-${num}.js`;
    s.onload  = ()=>resolve();
    s.onerror = ()=>{ delete _moduleLoads[num]; reject(new Error('module '+num+' failed to load')); };
    document.head.appendChild(s);
  });
  return _moduleLoads[num];
}
// Once a module is marked i18nComplete, every field checks.mjs requires has a
// real Spanish twin — hide the whole panel from Google Translate so it can't
// re-translate (or mangle) our own hand-written Spanish. Modules still mid-
// translation are left alone: Google Translate keeps covering them, same as
// before phase 2 (see CLAUDE.md's i18n architecture note).
function markModulePanelTranslated(el, num){
  if(!moduleI18nComplete(num)) return;
  el.setAttribute('translate','no');
  el.classList.add('notranslate');
}
// Build (once) the set + review panels for one module and wire chord links.
async function ensureModuleRendered(num){
  num = parseInt(num);
  if(_modulesRendered.has(num)) return;
  await loadModuleData(num);
  if(_modulesRendered.has(num)) return;   // guard against a concurrent caller
  _modulesRendered.add(num);
  const c = document.getElementById('week-panels');
  SETS.filter(w=>w.moduleNum===num).forEach(w=>{
    const div=document.createElement('div');
    div.className='week-panel'; div.dataset.id=w.id; div.dataset.module=w.moduleNum;
    div.innerHTML = w.comingSoon ? buildComingSoon(w) : buildSet(w);
    markModulePanelTranslated(div, num);
    c.appendChild(div);
  });
  if(MODULE_REVIEWS[num]){
    const mr=MODULE_REVIEWS[num];
    const div=document.createElement('div');
    div.className='week-panel'; div.dataset.id=`mr${mr.moduleNum}`; div.dataset.module=mr.moduleNum;
    div.innerHTML=buildModuleReview(mr);
    markModulePanelTranslated(div, num);
    c.appendChild(div);
  }
  // Idempotent: already-wrapped spans are skipped (see CHORD_SKIP_CLASSES).
  wrapAllChordLinks();
  // A module can be rendered for the first time long after page load (lazy,
  // on first visit) — with no setLang() in between, its data-i18n spans
  // (checklist strings, panel-footer buttons, print button, module-review
  // legend) would otherwise sit unmarked and exposed to Google Translate
  // until the next language toggle. Mark them right away instead of waiting.
  if(typeof applyI18n === 'function') applyI18n(c);
}
let _dirtyKeys = new Set();   // which categories need writing: skills · place · responses · completed · games · streak · practiceLog
const escAttr = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escHtml = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ── Module-content i18n (phase 2) ──────────────────────────────────────
   Hand-written Spanish for module/lesson CONTENT (as opposed to the app
   shell, which i18n.js's t()/data-i18n already covers). Every translatable
   field on a Set/skill/song/etc. can carry a `<field>_es` twin alongside the
   English `<field>` — tf(obj, 'field') returns the Spanish twin when the
   student is in Spanish mode AND that twin exists, else the English original.
   A module with no _es fields yet behaves exactly as before (falls through
   to English, which Google Translate then covers, same as today) — modules
   translate incrementally, field by field, with no renderer changes needed
   per module. See CLAUDE.md "i18n — module/lesson content" for the full
   rules (what to translate, glossary, checks.mjs enforcement). */
function tf(obj, field){
  if(!obj) return obj;
  if(typeof getLang === 'function' && getLang()==='es'){
    const v = obj[field+'_es'];
    if(v != null && v !== '') return v;
  }
  return obj[field];
}
// True once every required field in this module is hand-translated
// (tools/checks.mjs enforces that claim) — safe to hide it from Google
// Translate entirely so the two layers can't double-translate or clash.
function moduleI18nComplete(num){
  const m = MODULE_MANIFEST.find(x=>x.num===Number(num));
  return !!(m && m.i18nComplete);
}
// Builds the signed-in user header. Escapes name/email/photoURL — Google
// account values are user-controlled and go into innerHTML.
function userHeaderHtml(user){
  const av = user.photoURL
    ? `<img src="${escAttr(user.photoURL)}" class="avatar" alt="">`
    : `<div class="avatar-init">${escHtml((user.displayName||'?')[0].toUpperCase())}</div>`;
  return `${av}<span class="user-name">${escHtml(user.displayName||user.email)}</span><button class="btn-out notranslate" onclick="signOut()" data-i18n="header.signOut" translate="no">${t('header.signOut')}</button>`;
}

/* ── Auth ── */
function showAuthError(msg){
  const el = document.getElementById('auth-error');
  if(!el) return;
  el.textContent = msg;
  el.style.display = msg ? '' : 'none';
}
// Shown when the Firebase SDK/config never loaded (e.g. blocked on school Wi-Fi).
function showFirebaseLoadError(){
  const wall = document.getElementById('auth-wall');
  if(!wall) return;
  wall.innerHTML =
    `<h1 data-i18n="auth.fallbackTitle">${t('auth.fallbackTitle')}</h1>` +
    `<p data-i18n="auth.fallbackBody">${t('auth.fallbackBody')}</p>` +
    `<button class="btn-google" onclick="location.reload()" data-i18n="auth.tryAgain">${t('auth.tryAgain')}</button>`;
  if(typeof applyI18n === 'function') applyI18n(wall);
}
function signIn(){
  showAuthError('');
  // Pre-warm the Firestore SDK while the student is in the Google popup, so it's
  // ready to load progress the moment they're back. Errors are ignored — the
  // real load attempt (ensureDb) will surface any problem.
  loadFirestoreSdk().catch(()=>{});
  auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .catch(e=>{
      // The student just closed/cancelled the popup — not an error worth nagging about.
      if(e && (e.code==='auth/popup-closed-by-user' || e.code==='auth/cancelled-popup-request')) return;
      showAuthError(t('auth.signInFailed'));
    });
}
/* Sign-out on a shared Chromebook has to be a hard reset, not a state reset.
   Two things went wrong when it wasn't:
     1. A debounced save still inside its 800 ms window was dropped — flushSave
        bails on !currentUser, so a got-it ticked right before signing out never
        reached Firestore. Flush first, while we still have a user to write as.
     2. Plenty of per-student state lives outside the variables the
        onAuthStateChanged(null) branch clears: _modulesRendered plus the built
        #week-panels DOM (so the next student saw the previous one's rendered
        answers and check-offs), drillSkillSession, and every sessionStorage
        best (sdBest / nrBestSession / rrPts / coachStreak — coach.js has no
        auth hook at all). Reloading clears the lot in one move and can't drift
        out of sync the way an ever-growing manual reset list does. */
async function signOut(){
  try { clearTimeout(saveTimer); await flushSave(); } catch(e){}
  try { sessionStorage.clear(); } catch(e){}
  try { if(auth) await auth.signOut(); } catch(e){}
  location.reload();
}

// Dev bypass is for local UI testing only. Only show/allow it when the site is
// running on localhost — never on the live (GitHub Pages) site.
const IS_LOCALHOST = ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
function devBypass(){
  if(!IS_LOCALHOST){ console.warn('Dev bypass is disabled outside localhost.'); return; }
  currentUser = {uid:'dev-user',displayName:'Dev User',email:'dev@test.local',photoURL:null};
  restoreLocalPlace();
  showApp(currentUser);
}
// Dev bypass never signs in to Firebase Auth, so Firestore rules reject any
// write under this uid — features that persist to Firestore (progress,
// skills, etc.) should hide their save affordance rather than let it silently fail.
function isDevBypassUser(){ return !!(currentUser && currentUser.uid==='dev-user'); }
if(IS_LOCALHOST){
  const _devBtn = document.getElementById('dev-bypass-btn');
  if(_devBtn) _devBtn.style.display='';
}

if(auth) auth.onAuthStateChanged(async user=>{
  if(user){
    currentUser = user;
    if(IS_TEACHER_MODE){ showTeacherApp(user); }
    else {
      await loadProgress(); await loadClassConfig();
      if(accountPaused) showPausedScreen(user); else showApp(user);
    }
  } else {
    currentUser = null; progress = {}; responses = {}; completed = {}; completedDeletes = new Set(); games = {}; streak = { count:0, lastDay:null }; gamesAccessOn = true;
    practiceLog = loadLocalPracticeLog();   // per-skill rep history: back to the local copy on sign-out
    _moduleStripStates = {};   // next user's first strip render is a first paint, not a celebration
    document.getElementById('auth-wall').style.display='block';
    document.getElementById('app').style.display='none';
    document.getElementById('teacher-app').style.display='none';
    document.getElementById('teacher-denied').style.display='none';
    document.getElementById('fab-group').style.display='none';
    document.getElementById('search-btn').style.display='none';
    document.getElementById('user-area').innerHTML=`<button class="btn-sign" onclick="signIn()" data-i18n="header.signIn">${t('header.signIn')}</button>`;
  }
});

/* Teacher put this student on hold — they authenticated fine, so this is a
   message, not an error. Progress is untouched and comes straight back when
   the hold is lifted, and the copy says so: a student who thinks their work
   is gone will panic (and go make a second account). Sign out stays reachable
   so a shared Chromebook isn't stuck on one student's paused screen. */
function showPausedScreen(user){
  document.getElementById('auth-wall').style.display='none';
  document.getElementById('app').style.display='none';
  document.getElementById('teacher-app').style.display='none';
  document.getElementById('fab-group').style.display='none';
  document.getElementById('search-btn').style.display='none';
  let el=document.getElementById('paused-screen');
  if(!el){
    el=document.createElement('div');
    el.id='paused-screen';
    el.className='paused-screen';
    document.querySelector('.wrap, main, body').appendChild(el);
  }
  el.innerHTML=
    `<div class="paused-card">`+
      `<div class="paused-icon" aria-hidden="true">&#x23F8;&#xFE0F;</div>`+
      `<h2 data-i18n="paused.title">${escHtml(t('paused.title'))}</h2>`+
      `<p data-i18n="paused.body">${escHtml(t('paused.body'))}</p>`+
      `<p class="paused-safe" data-i18n="paused.safe">${escHtml(t('paused.safe'))}</p>`+
      `<button class="btn-sign" onclick="signOut()" data-i18n="header.signOut">${escHtml(t('header.signOut'))}</button>`+
    `</div>`;
  el.style.display='block';
  document.getElementById('user-area').innerHTML=userHeaderHtml(user);
}

function showApp(user){
  document.getElementById('auth-wall').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('fab-group').style.display='flex';
  document.getElementById('search-btn').style.display='flex';
  document.getElementById('user-area').innerHTML=userHeaderHtml(user);
  renderAll();
  applyGamesAccess();
  maybeShowApp_gamesHash();
}

function maybeShowApp_gamesHash(){
  if(location.hash==='#games' && typeof openGamesScreen==='function'){ openGamesScreen(); return true; }
  if(location.hash==='#keep-practicing'){ openKeepPracticingScreen(); return true; }
  if(location.hash==='#my-progress'){ openMyProgressScreen(); return true; }
  return false;
}

/* ── Firestore ── */
async function loadProgress(){
  try{
    await ensureDb();
    const doc = await db.collection('progress').doc(currentUser.uid).get();
    if(doc.exists){
      const raw = doc.data().skills||{};
      progress = {};
      Object.keys(raw).forEach(k=>{
        if(raw[k]===true) progress[k]='gotit';
        else if(raw[k]==='working'||raw[k]==='gotit') progress[k]=raw[k];
        else if(raw[k]==='1'||raw[k]==='2'||raw[k]==='3') progress[k]=raw[k];
        else if((k.endsWith('-reflection')||k.endsWith('-performance')) && raw[k] && typeof raw[k]==='object') progress[k]=raw[k];
        else progress[k]='none';
      });
      lastModuleNum = doc.data().lastModule||1;
      lastSetId     = doc.data().lastSet||null;
      responses     = doc.data().responses || {};
      completed     = doc.data().completed || {};
      games         = doc.data().games || {};
      streak        = doc.data().streak || { count:0, lastDay:null };
      // practiceLog (per-skill rep history): Firestore is the source of truth
      // when signed in; fall back to the localStorage copy for older docs that
      // predate the field, then mirror back so the offline copy stays fresh.
      practiceLog   = doc.data().practiceLog || loadLocalPracticeLog();
      savePracticeLogLocal();
    } else { progress={}; lastModuleNum=1; lastSetId=null; responses={}; completed={}; games={}; streak={ count:0, lastDay:null }; practiceLog=loadLocalPracticeLog(); restoreLocalPlace(); }
  } catch(e){ progress={}; lastModuleNum=1; lastSetId=null; responses={}; completed={}; games={}; streak={ count:0, lastDay:null }; practiceLog=loadLocalPracticeLog(); restoreLocalPlace(); }
}

/* ── Games access (teacher-controlled) ──
   One class-config doc (config/class) holds the whole-class master switch
   (gamesEnabled) plus a per-student override map (gameOverrides: uid → bool).
   The effective answer for THIS student: an override wins if present, else the
   class master, else ON. Only the teacher writes this doc (teacher.js); every
   student reads it. Reads that fail (offline / rules) leave games ON so a
   connection hiccup never locks a student out of the arcade. */
async function loadClassConfig(){
  gamesAccessOn = true;
  accountPaused = false;
  try{
    await ensureDb();
    if(!db) return;
    const doc = await db.collection('config').doc('class').get();
    if(!doc.exists) return;
    const d = doc.data()||{};
    // Teacher-set hold (teacher.js Manage view). Classroom management, not
    // security — the real boundary is the Firestore rules, which already
    // stop a student reading or writing anyone else's doc.
    accountPaused = (d.paused||{})[currentUser.uid] === true;
    const ov = (d.gameOverrides||{})[currentUser.uid];
    if(ov===true)       gamesAccessOn = true;
    else if(ov===false) gamesAccessOn = false;
    else                gamesAccessOn = (d.gamesEnabled!==false);   // field absent ⇒ on
  }catch(e){ /* leave games on */ }
}
/* Show/hide the 🎮 Games button to match this student's access, and if games
   get turned off while the arcade is open, close it. */
function applyGamesAccess(){
  const btn = document.getElementById('games-btn');
  if(btn) btn.style.display = gamesAccessOn ? '' : 'none';
  if(!gamesAccessOn){
    const screen = document.getElementById('games-screen');
    if(screen && !screen.hasAttribute('hidden')){
      if(location.hash==='#games') location.hash='';
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
  } else {
    responses[key] = value;
  }
  saveResponses();
}
function onResponsePRBlur(key){ _prEditingKeys.delete(key); }
/* Graded in-step MC (factual, has answer:). Stores the choice TEXT (so the
   teacher dashboard reads it unchanged); recolors and reveals the explanation. */
function onStepMcSelect(key, btn){
  const choice = btn.dataset.choice;
  responses[key] = choice;
  saveResponses();
  const group = btn.closest('.step-mc-keyed');
  if(!group) return;
  group.classList.add('answered');
  group.querySelectorAll('.step-mc-opt').forEach(b=>b.classList.remove('correct','incorrect'));
  btn.classList.add(btn.dataset.correct === '1' ? 'correct' : 'incorrect');
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
function queueSave(...keys){
  if(!currentUser) return;
  keys.forEach(k=>_dirtyKeys.add(k));
  if(_dirtyKeys.has('place')) saveLocalPlace();   // local mirror, immediate
  _saveFailCount = 0;   // a fresh user action gets its own full retry budget
  clearTimeout(saveTimer);
  setSaveMsg('save.saving');
  saveTimer = setTimeout(flushSave, 800);
}
async function flushSave(){
  if(!currentUser) return;
  const keys = _dirtyKeys; _dirtyKeys = new Set();
  if(!keys.size) return;
  const payload = { name:currentUser.displayName||'', email:currentUser.email||'' };
  if(keys.has('skills'))    payload.skills    = progress;
  if(keys.has('place')){    payload.lastModule = lastModuleNum; payload.lastSet = lastSetId||null; }
  if(keys.has('responses')) payload.responses = responses;
  let sentDeletes = null;
  if(keys.has('completed')){
    // Copy, so the FieldValue.delete() sentinels never leak into local state.
    payload.completed = Object.assign({}, completed);
    if(completedDeletes.size){
      sentDeletes = [...completedDeletes];
      sentDeletes.forEach(k=>{ payload.completed[k] = firebase.firestore.FieldValue.delete(); });
    }
  }
  if(keys.has('games'))     payload.games     = games;
  if(keys.has('streak'))    payload.streak    = streak;
  if(keys.has('practiceLog')) payload.practiceLog = practiceLog;
  try{
    await ensureDb();
    await db.collection('progress').doc(currentUser.uid).set(payload,{merge:true});
    // Only now that the write landed: retire the deletes it carried. Keys
    // un-marked DURING the write stay queued for the next flush.
    if(sentDeletes) sentDeletes.forEach(k=>completedDeletes.delete(k));
    setSaveMsg('save.saved', 2000);
    _saveFailCount = 0;
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
  }
}
function saveResponses(){ queueSave('responses'); }

/* Un-marked step keys awaiting a Firestore delete. flushSave writes with
   set(…,{merge:true}), which preserves any key missing from the payload — so
   `delete completed[key]` alone never un-marks the step server-side. Each
   un-marked key is queued here, written as FieldValue.delete() on the next
   flush, and cleared only after that write lands (a failed write retries it,
   same as the dirty keys). */
let completedDeletes = new Set();
function onCompleteChange(key, isDone){
  if(isDone){ completed[key] = true; completedDeletes.delete(key); }
  else { delete completed[key]; completedDeletes.add(key); }
  saveCompleted();
}
function saveCompleted(){ queueSave('completed'); }
function saveGames(){ queueSave('games'); }   // per-game bests (games arcade, coach.js)
function saveStreak(){ queueSave('streak'); }

function saveProgress(){ queueSave('skills','place'); }

/* Site-wide practice streak, independent of any one game (see coach.js's
   rrSetDone for the same day-string / yesterday-comparison pattern applied
   to the Riff Roulette game specifically). */
function dayStr(d){
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function bumpPracticeStreak(){
  if(!currentUser || isDevBypassUser()) return;
  const today = dayStr(new Date());
  if(streak.lastDay === today) return;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  streak.count = streak.lastDay === dayStr(y) ? (streak.count || 0) + 1 : 1;
  streak.lastDay = today;
  saveStreak();
}
let _saveMsgT = null;
// `key` is an i18n key (or '' to clear) — save-ind elements are tagged
// data-i18n so a language switch mid-message (e.g. still showing "Saving…"
// when the toggle is hit) re-resolves it instead of staying stuck in
// whichever language it was first drawn in.
function setSaveMsg(key, clearAfterMs){
  clearTimeout(_saveMsgT);
  document.querySelectorAll('.save-ind').forEach(el=>{
    if(key){ el.textContent = t(key); el.setAttribute('data-i18n', key); }
    else { el.textContent = ''; el.removeAttribute('data-i18n'); }
  });
  if(clearAfterMs) _saveMsgT = setTimeout(()=>setSaveMsg(''), clearAfterMs);
}

/* ── Render ── */
let lastModuleNum = 1;
let lastSetId = null;

function renderAll(){ populateModuleDropdown(); onModuleChange(lastModuleNum||1, lastSetId); renderChordBoxes(); syncPreviewNote(); }

/* Teacher/dev accounts skip the sequential set gate (isGatePreviewer), which
   makes their view quietly different from a student's — no 🔒 anywhere. This
   badge makes that visible so preview mode can't be mistaken for student view. */
function syncPreviewNote(){
  const pn = document.getElementById('preview-note');
  if(pn) pn.hidden = !isGatePreviewer();
}

/* Chord, string-fretboard and single-note diagram renderers moved to
   guitar-diagrams.js (2026-07-26) — it loads before this file and is the
   single source shared with the teacher slide decks. chordDiagramSVG,
   CHORD_DIAGRAMS, localChordSvg, localStringSvg, localStringFretboardSvg,
   localNoteSvg, noteFullLabel and ordinal are globals from there. */
function renderChordBoxes(){} /* legacy no-op — diagrams now render inline */

/* ══════════════════════════════════════════════
   AUTO CHORD LINKS — scan step text for chord
   names, wrap them in clickable spans that load
   a chord diagram in the resource panel.
   ══════════════════════════════════════════════ */

/* MIDI base for each open string (1 = high E … 6 = low E). Adding the
   fret number gives the MIDI pitch for that fretted note. */
const STRING_OPEN_MIDI = { 6:40, 5:45, 4:50, 3:55, 2:59, 1:64 };

/* Given a chord name from CHORD_DIAGRAMS, return the MIDI pitch list
   in low→high order (string 6 to string 1), skipping muted ('x') strings. */
function chordSpecMidis(chordArr){
  return (chordArr || [])
    .slice()
    .sort((a, b) => b[0] - a[0])
    .filter(([, fret]) => fret !== 'x' && fret != null)
    .map(([str, fret]) => STRING_OPEN_MIDI[str] + Number(fret));
}
function chordMidis(chordName){
  const cfg = CHORD_DIAGRAMS[chordName];
  return cfg ? chordSpecMidis(cfg.chord) : [];
}

/* Strum a chord one string at a time. ~35ms between strings approximates
   a moderate downstrum. btnEl, when supplied, gets a brief 'playing' class. */
let chordStrumTimeouts = [];
function strumChord(chordName, btnEl){
  if(window.coachMicLive) return;  // demo audio would score itself while the Coach listens
  chordStrumTimeouts.forEach(clearTimeout);
  chordStrumTimeouts = [];
  const midis = chordMidis(chordName);
  if (!midis.length) return;
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  const stepMs = 35;
  midis.forEach((m, i) => {
    chordStrumTimeouts.push(setTimeout(() => playNote(m), i * stepMs));
  });
  if (btnEl){
    btnEl.classList.add('playing');
    chordStrumTimeouts.push(setTimeout(() => btnEl.classList.remove('playing'), midis.length * stepMs + 200));
  }
}

/* ── Inline TAB renderer ──
   spec = { caption, notes: [{ string, fret, note, midi }, ...] }
     OR  { caption, phrases: [{ label, notes: [...] }, ...] }
   string is the TAB label: 'e' (high), 'B', 'G', 'D', 'A', 'E' (low).
   Renders all 6 string lines so students see real TAB layout, with
   fret numbers placed on the relevant string and a row of clickable
   note-name buttons below that play the corresponding pitch. */
const TAB_STRINGS = ['e','B','G','D','A','E'];
function renderTabBlock(notes, seqOffset){
  if (!notes || !notes.length) return '';
  const off = seqOffset || 0;   // sequential index across phrases — the beat cursor's address
  const cols = notes.length;
  const rows = TAB_STRINGS.map(strLabel => {
    const cells = [`<div class="tab-str-label">${strLabel}</div>`];
    notes.forEach((n, ci) => {
      let fret;
      if (Array.isArray(n.frets)) {
        const hit = n.frets.find(([s]) => s === strLabel);
        if (hit) fret = hit[1];
      } else if (n.string === strLabel) {
        fret = n.fret;
      }
      if (fret !== undefined) {
        cells.push(`<div class="tab-cell" data-seq="${off + ci}"><span class="tab-fret">${escHtml(String(fret))}</span></div>`);
      } else {
        cells.push(`<div class="tab-cell" data-seq="${off + ci}"></div>`);
      }
    });
    return cells.join('');
  }).join('');
  const noteBtns = ['<div></div>'];
  notes.forEach((n, ci) => {
    const midis = (Array.isArray(n.midi) ? n.midi : [n.midi]).map(Number);
    const midisAttr = escAttr(JSON.stringify(midis));
    noteBtns.push(`<button type="button" class="tab-note-btn" data-seq="${off + ci}" data-midis="${midisAttr}" onclick="playBeat(this)" title="${escAttr(t('tab.playNote',{note:n.note}))}">${escHtml(n.note)}<span class="tab-spkr">&#x1F50A;</span></button>`);
  });
  return `
    <div class="tab-board">
      <div class="tab-grid" style="grid-template-columns:22px repeat(${cols},30px)">
        ${rows}
        ${noteBtns.join('')}
      </div>
    </div>`;
}
function buildTab(spec, opts){
  if (!spec) return '';
  const keyPrefix = (opts && opts.keyPrefix) || '';
  /* Header title: prefer explicit title; otherwise use caption as the header.
     If both are present and distinct, caption stays in the body. */
  const headTitle = (spec.title && tf(spec,'title')) || (spec.caption && tf(spec,'caption')) || t('tab.defaultTitle');
  const showCaptionInBody = !!spec.title && !!spec.caption && spec.title !== spec.caption;
  const headHtml = `<div class="tab-head"><span class="tab-icon">&#x1F3B8;</span><span class="tab-title">${escHtml(headTitle)}</span><span class="tab-kind">${t('tab.label')}</span></div>`;
  const captionHtml = showCaptionInBody ? `<div class="tab-caption">${escHtml(tf(spec,'caption'))}</div>` : '';
  /* Collect all midis (across phrases if any) so the tab play-all walks the whole melody.
     A note can carry an optional beats:N (default 1) to hold longer than one beat —
     playSequence() reads that back off the { midi, beats } shape. */
  const toSeqEntry = n => {
    const midi = Array.isArray(n.midi) ? n.midi.map(Number) : Number(n.midi);
    return (n.beats && n.beats !== 1) ? { midi, beats: n.beats } : midi;
  };
  let allMidis = [];
  if (spec.phrases && spec.phrases.length) {
    spec.phrases.forEach(p => {
      if (p.notes && p.notes.length) allMidis = allMidis.concat(p.notes.map(toSeqEntry));
    });
  } else if (spec.notes && spec.notes.length) {
    allMidis = spec.notes.map(toSeqEntry);
  }
  let controlsHtml = '';
  if (allMidis.length && keyPrefix) {
    const defBpm = spec.bpm || 60;
    const minBpm = spec.minBpm || 40;
    const maxBpm = spec.maxBpm || 120;
    const bpm = readStoredBpm(keyPrefix, defBpm);
    const midisAttr = JSON.stringify(allMidis);
    /* The coach card shows this tab's exact fingering: collect the notes
       (across phrases if any) in the same order as allMidis. */
    let allTabNotes = [];
    if (spec.phrases && spec.phrases.length) spec.phrases.forEach(p => { if (p.notes) allTabNotes = allTabNotes.concat(p.notes); });
    else if (spec.notes) allTabNotes = spec.notes.slice();
    const tabNotesJson = JSON.stringify(allTabNotes.map(n =>
      n.frets ? { frets: n.frets, note: n.note, midi: n.midi }
              : { string: n.string, fret: n.fret, note: n.note, midi: n.midi }));
    // Held notes ({midi,beats}, from toSeqEntry) aren't one-pick-per-beat
    // either — same rationale as noCoach below.
    const hasHolds = allMidis.some(n => n && typeof n === 'object' && !Array.isArray(n));
    controlsHtml = `<div class="tab-controls"><span class="bpm-control-group">` +
      `<button type="button" class="play-seq-btn" data-midis="${escAttr(midisAttr)}" onclick="playSequenceFromGroup(this)" title="${escAttr(t('tab.playTabTitle'))}">&#x25B6; ${t('tab.playTab')}</button>` +
      renderBpmControl(keyPrefix, bpm, minBpm, maxBpm) +
      // noCoach: tabs with slurred notes (hammer-ons/pull-offs) aren't
      // one-pick-per-note, so a mic check would fail correct technique.
      // suppressCoach: this step already has a chord-check Coach button —
      // don't show a second one for the tab's note sequence.
      (spec.noCoach || hasHolds || (opts && opts.suppressCoach) ? '' : coachBtnHtml(midisAttr, tabNotesJson)) +
      `</span></div>`;
  }
  if (spec.phrases && spec.phrases.length) {
    let seqOff = 0;
    const blocks = spec.phrases.map(p => {
      const block = `
      <div class="tab-phrase">
        ${p.label ? `<div class="tab-phrase-label">${escHtml(tf(p,'label'))}</div>` : ''}
        ${renderTabBlock(p.notes, seqOff)}
      </div>`;
      seqOff += (p.notes || []).length;
      return block;
    }).join('');
    return `<div class="tab">${headHtml}<div class="tab-body">${captionHtml}${controlsHtml}${blocks}</div></div>`;
  }
  const body = renderTabBlock(spec.notes);
  if (!body) return '';
  return `<div class="tab">${headHtml}<div class="tab-body">${captionHtml}${controlsHtml}${body}</div></div>`;
}

function toggleTabChoice(btn){
  const expanded = btn.classList.toggle('expanded');
  const content = btn.nextElementSibling;
  if (content && content.classList.contains('tab-choice-content')){
    content.classList.toggle('expanded', expanded);
  }
}

/* String reference patterns:
   - "low E" / "high E" (case-insensitive on low/high, captures both as one unit)
   - A letter or list of letters followed by "string"/"strings", e.g.
     "E string", "E and A strings", "E, A, and D strings"
   Letters E/A/D/G/B are case-sensitive (uppercase) to match how
   teachers write them in the modules. */
const STR_SEP = '(?:\\s*(?:,|&|\\band\\b|\\bor\\b)\\s*)+';
const STRING_PHRASE_RE_SRC = '\\b[EADGB](?:' + STR_SEP + '[EADGB])*(?:\\s+|-)strings?\\b';
const LOWHIGH_E_RE_SRC = '\\b(low|high)\\s+E\\b';
/* Standard tuning notation "E A D G B e" — six string names in order with
   lowercase e for the high E. Separators can be spaces, commas, or "·". */
const TUNING_SEP = '[\\s·,]+';
const TUNING_RE_SRC = '\\bE' + TUNING_SEP + 'A' + TUNING_SEP + 'D' + TUNING_SEP + 'G' + TUNING_SEP + 'B' + TUNING_SEP + 'e\\b';
const TUNING_LETTER_KIND = { E:'lowE', A:'A', D:'D', G:'G', B:'B', e:'highE' };

function findStringMatches(text){
  const matches = [];
  let m;

  const re1 = new RegExp(LOWHIGH_E_RE_SRC, 'gi');
  while ((m = re1.exec(text)) !== null) {
    const kind = m[1].toLowerCase() === 'low' ? 'lowE' : 'highE';
    matches.push({ start: m.index, end: m.index + m[0].length, kind });
  }

  const re2 = new RegExp(STRING_PHRASE_RE_SRC, 'gi');
  while ((m = re2.exec(text)) !== null) {
    const phraseStart = m.index;
    const phrase = m[0];
    const letterRe = /[EADGB]/g; // case-sensitive — only uppercase
    let lm;
    while ((lm = letterRe.exec(phrase)) !== null) {
      const letter = lm[0];
      const absStart = phraseStart + lm.index;
      /* Skip if already covered by a "low E" / "high E" phrase */
      if (matches.some(x => x.start <= absStart && absStart < x.end)) continue;
      const kind = letter === 'E' ? 'lowE' : letter; // ambiguous "E string" defaults to low E
      matches.push({ start: absStart, end: absStart + 1, kind });
    }
  }

  const re3 = new RegExp(TUNING_RE_SRC, 'g');
  while ((m = re3.exec(text)) !== null) {
    const phraseStart = m.index;
    const phrase = m[0];
    const letterRe = /[EADGBe]/g;
    let lm;
    while ((lm = letterRe.exec(phrase)) !== null) {
      const absStart = phraseStart + lm.index;
      if (matches.some(x => x.start <= absStart && absStart < x.end)) continue;
      matches.push({ start: absStart, end: absStart + 1, kind: TUNING_LETTER_KIND[lm[0]] });
    }
  }

  matches.sort((a,b) => a.start - b.start);
  const dedup = [];
  let lastEnd = -1;
  matches.forEach(x => {
    if (x.start >= lastEnd) { dedup.push(x); lastEnd = x.end; }
  });
  return dedup;
}

/* Longest names first so the alternation matches them before the 1-char names */
const CHORD_NAMES = ['F#m','C#m','Em','Am','Dm','Bm','B7','A5','E5','G5','D5','C5','C','G','D','A','E','F'];
const CHORD_RE = new RegExp('(^|[^A-Za-z0-9#])(' + CHORD_NAMES.join('|') + ')(?![A-Za-z0-9#])(?![ -][Ss]hape)(?![ -][Mm]inor)(?![ -][Pp]entatonic)(?![ -][Ss]cale)(?![ -][Mm]ajor[ -](?:pentatonic|scale))', 'g');
// lowercase chord name → canonical CHORD_NAMES spelling, for matching typed search queries like "g c d"
const CHORD_NAME_LOOKUP = new Map(CHORD_NAMES.map(c => [c.toLowerCase(), c]));
const CHORD_SKIP_TAGS = new Set(['A','BUTTON','SCRIPT','STYLE','TEXTAREA','INPUT','LABEL','SELECT']);
const CHORD_SKIP_CLASSES = ['skill-badge','chord-link','string-link','note-link','rp-trigger','chord-box-label','chord-diagrams','step-resp-mc-opt','tab','nolink'];

/* Natural-note fret positions on each string (frets 0–12). Used to
   auto-map sequences like "E · F · G · A · B · C · D · E" to single-note
   popups, with each letter landing on its actual fret on the contextual
   string. Positions are listed low→high so a walking sequence picks the
   next available fret above the previous one. */
const STRING_NOTE_FRETS = {
  lowE:  { E:[0,12], F:[1], G:[3], A:[5], B:[7], C:[8], D:[10] },
  A:     { A:[0,12], B:[2], C:[3], D:[5], E:[7], F:[8], G:[10] },
  D:     { D:[0,12], E:[2], F:[3], G:[5], A:[7], B:[9], C:[10] },
  G:     { G:[0,12], A:[2], B:[4], C:[5], D:[7], E:[9], F:[10] },
  B:     { B:[0,12], C:[1], D:[3], E:[5], F:[6], G:[8], A:[10] },
  highE: { E:[0,12], F:[1], G:[3], A:[5], B:[7], C:[8], D:[10] }
};

/* Sequence of 3+ standalone natural-note letters joined by " · " (middle dot).
   The lookarounds keep "G · Down-up" or chord names like "Am" from matching. */
const NOTE_SEQ_RE = /(?<![A-Za-z0-9])[A-G](?:\s*[·•]\s*[A-G](?![A-Za-z0-9])){2,}/g;
function findNoteSequenceMatches(text, stringMatches){
  const out = [];
  const re = new RegExp(NOTE_SEQ_RE.source, 'g');
  let m;
  while ((m = re.exec(text)) !== null) {
    const seqStart = m.index;
    const ctx = stringMatches
      .filter(s => s.end <= seqStart)
      .sort((a, b) => b.end - a.end)[0];
    if (!ctx) continue;
    const fretMap = STRING_NOTE_FRETS[ctx.kind];
    if (!fretMap) continue;
    let lastFret = -1;
    const letterRe = /[A-G]/g;
    let lm;
    while ((lm = letterRe.exec(m[0])) !== null) {
      const letter = lm[0];
      const positions = fretMap[letter];
      if (!positions) continue;
      const fret = positions.find(p => p > lastFret);
      if (fret === undefined) continue;
      out.push({
        start: seqStart + lm.index,
        end:   seqStart + lm.index + 1,
        kind:  ctx.kind,
        fret,
        note:  letter
      });
      lastFret = fret;
    }
  }
  return out;
}

/* Single-note references: "1st fret (F)", "5th fret (A)", "open (E)" etc.
   The letter inside parens is the NOTE — not a chord. We use the most
   recent string reference earlier in the same text as the string context. */
const NOTE_CTX_RE = /\b(?:(\d+)(?:st|nd|rd|th)?\s+fret|(open))\s*\(\s*([A-G][#b]?)\s*\)/gi;
function findNoteMatches(text, stringMatches){
  const out = [];
  const re = new RegExp(NOTE_CTX_RE.source, 'gi');
  let m;
  while ((m = re.exec(text)) !== null) {
    const fret = m[2] ? 0 : parseInt(m[1], 10);
    const note = m[3];
    /* Wrap just the note letter inside the parens, not the whole "Nth fret" phrase */
    const innerStart = m.index + m[0].indexOf(note, m[0].lastIndexOf('('));
    const innerEnd = innerStart + note.length;
    /* Find most recent string reference ending before this match */
    const ctx = stringMatches
      .filter(s => s.end <= m.index)
      .sort((a, b) => b.end - a.end)[0];
    if (!ctx) {
      /* No string context — still record so chord-detection skips this letter,
         but mark kind=null so we render plain text rather than the wrong chord. */
      out.push({ start: innerStart, end: innerEnd, kind: null, fret, note });
    } else {
      out.push({ start: innerStart, end: innerEnd, kind: ctx.kind, fret, note });
    }
  }
  return out;
}

/* Distinguish the grammatical article "A" ("A guitar…", "A hard strum…")
   from the chord/note A. The indefinite article only capitalises at the
   START of a sentence and is always followed by a lowercase word, whereas
   musical "A" refs sit mid-sentence ("switch to A in time", "F · G · A
   roots", "the A blues scale", "→A"). We keep "A major" linked since that's
   a real chord. */
function isIndefiniteArticleA(text, start, end){
  const after = text.slice(end).match(/^\s+([a-z]+)/);
  if (!after) return false;                 // followed by punctuation/capital/arrow → chord
  if (/^maj(or)?$/.test(after[1])) return false;  // "A major" is a chord, keep it
  const before = text.slice(0, start).replace(/\s+$/, '');
  return before === '' || /[.!?:;]$/.test(before);  // only at a sentence boundary
}

function wrapChordLinksIn(rootEl){
  if (!rootEl) return;
  /* Module 7 (barre chords): each step already shows accurate inline chord
     diagrams, and the shared chord library renders OPEN shapes that don't match
     the barre lesson — so skip all auto-link pop-ups inside Module 7 panels. */
  if (rootEl.closest && rootEl.closest('.week-panel[data-module="7"]')) return;
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
    acceptNode(node){
      if (!node.nodeValue || !/[A-G]/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
      let p = node.parentNode;
      while (p && p !== rootEl) {
        if (CHORD_SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.classList && CHORD_SKIP_CLASSES.some(c => p.classList.contains(c))) return NodeFilter.FILTER_REJECT;
        p = p.parentNode;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const textNodes = [];
  let n;
  while ((n = walker.nextNode())) textNodes.push(n);

  textNodes.forEach(node => {
    const text = node.nodeValue;

    /* String references first — they take priority over chord matches */
    const stringMatches = findStringMatches(text);

    /* Note references — "1st fret (F)", "open (E)" with string context */
    const noteMatches = findNoteMatches(text, stringMatches);

    /* Bare note sequences — "E · F · G · A · B · C · D · E" with string context */
    const noteSeqMatches = findNoteSequenceMatches(text, stringMatches);
    noteSeqMatches.forEach(x => noteMatches.push(x));

    /* Chord matches — skip any that overlap a string or note match */
    const chordMatches = [];
    const re = new RegExp(CHORD_RE.source, 'g');
    let m;
    while ((m = re.exec(text)) !== null) {
      const prefix = m[1], chord = m[2];
      const start = m.index + prefix.length;
      const end = start + chord.length;
      if (stringMatches.some(s => s.start < end && start < s.end)) continue;
      if (noteMatches.some(s => s.start < end && start < s.end)) continue;
      if (chord === 'A' && isIndefiniteArticleA(text, start, end)) continue;
      chordMatches.push({ start, end, chord });
    }

    if (!stringMatches.length && !chordMatches.length && !noteMatches.length) return;

    const all = [
      ...stringMatches.map(x => ({ start:x.start, end:x.end, type:'string', kind:x.kind })),
      ...noteMatches.filter(x => x.kind).map(x => ({ start:x.start, end:x.end, type:'note', kind:x.kind, fret:x.fret, note:x.note })),
      ...chordMatches.map(x => ({ start:x.start, end:x.end, type:'chord',  chord:x.chord }))
    ].sort((a,b) => a.start - b.start);

    const frag = document.createDocumentFragment();
    let cursor = 0;
    all.forEach(item => {
      if (item.start > cursor) frag.appendChild(document.createTextNode(text.slice(cursor, item.start)));
      const span = document.createElement('span');
      if (item.type === 'string') {
        span.className = 'string-link';
        span.dataset.string = item.kind;
        span.textContent = text.slice(item.start, item.end);
        span.addEventListener('click', onStringLinkClick);
        span.addEventListener('mouseenter', onStringLinkHover);
        span.addEventListener('mouseleave', hideChordPopup);
      } else if (item.type === 'note') {
        span.className = 'note-link';
        span.dataset.string = item.kind;
        span.dataset.fret = String(item.fret);
        span.dataset.note = item.note;
        span.textContent = text.slice(item.start, item.end);
        span.addEventListener('click', onNoteLinkClick);
        span.addEventListener('mouseenter', onNoteLinkHover);
        span.addEventListener('mouseleave', hideChordPopup);
      } else {
        span.className = 'chord-link';
        span.dataset.chord = item.chord;
        span.textContent = item.chord;
        span.addEventListener('click', onChordLinkClick);
        span.addEventListener('mouseenter', onChordLinkHover);
        span.addEventListener('mouseleave', hideChordPopup);
      }
      frag.appendChild(span);
      cursor = item.end;
    });
    if (cursor < text.length) frag.appendChild(document.createTextNode(text.slice(cursor)));
    node.parentNode.replaceChild(frag, node);
  });
}

function onChordLinkClick(e){
  e.preventDefault(); e.stopPropagation();
  const chord = this.dataset.chord;
  if (!chord) return;
  hideChordPopup();
  /* For chord type, the 2nd arg carries the chord NAME (loadPanel renders it locally) */
  loadPanel('chord', chord, chord, t('popup.chordDiagram'));
}

/* Floating hover preview — one shared popup element reused for every link */
let chordPopupEl = null;
function ensureChordPopup(){
  if (chordPopupEl) return chordPopupEl;
  chordPopupEl = document.createElement('div');
  chordPopupEl.className = 'chord-popup';
  document.body.appendChild(chordPopupEl);
  return chordPopupEl;
}
function positionChordPopup(popup, linkEl){
  const rect = linkEl.getBoundingClientRect();
  const popW = popup.offsetWidth || 220;
  const popH = popup.offsetHeight || 220;
  let left = rect.left + window.scrollX + (rect.width / 2) - (popW / 2);
  let top  = rect.bottom + window.scrollY + 6;
  left = Math.max(8, Math.min(left, window.scrollX + window.innerWidth - popW - 8));
  /* Flip above the link if there isn't room below */
  if (rect.bottom + popH + 12 > window.innerHeight) {
    top = rect.top + window.scrollY - popH - 6;
  }
  popup.style.left = left + 'px';
  popup.style.top  = top  + 'px';
}
function onChordLinkHover(){
  const chord = this.dataset.chord;
  if (!chord) return;
  const popup = ensureChordPopup();
  const svg = localChordSvg(chord);
  if (!svg) return;
  popup.classList.remove('wide');
  popup.innerHTML = `<div class="chord-popup-name">${chord}</div><div class="chord-popup-svg">${svg}</div><div class="chord-popup-hint">${escHtml(t('popup.clickToOpen'))}</div>`;
  popup.classList.add('visible');
  positionChordPopup(popup, this);
}
function onStringLinkClick(e){
  e.preventDefault(); e.stopPropagation();
  const kind = this.dataset.string;
  if (!kind) return;
  hideChordPopup();
  const label = STRING_LABELS[kind] || kind;
  loadPanel('string', kind, label, t('popup.openString'));
}
function onStringLinkHover(){
  const kind = this.dataset.string;
  if (!kind) return;
  const popup = ensureChordPopup();
  const svg = localStringFretboardSvg(kind);
  if (!svg) return;
  const label = STRING_LABELS[kind] || kind;
  popup.classList.add('wide');
  popup.innerHTML = `<div class="chord-popup-name">${label}</div><div class="chord-popup-svg">${svg}</div><div class="chord-popup-hint">${escHtml(t('popup.clickToOpen'))}</div>`;
  popup.classList.add('visible');
  positionChordPopup(popup, this);
}
function onNoteLinkClick(e){
  e.preventDefault(); e.stopPropagation();
  const kind = this.dataset.string;
  const fret = Number(this.dataset.fret);
  const note = this.dataset.note;
  if (!kind || isNaN(fret) || !note) return;
  hideChordPopup();
  const label = noteFullLabel(note, fret, kind);
  /* Encode payload in the URL slot as "kind|fret|note" */
  loadPanel('note', `${kind}|${fret}|${note}`, label, t('popup.singleNote'));
}
function onNoteLinkHover(){
  const kind = this.dataset.string;
  const fret = Number(this.dataset.fret);
  const note = this.dataset.note;
  if (!kind || isNaN(fret) || !note) return;
  const popup = ensureChordPopup();
  const svg = localNoteSvg(kind, fret, note);
  if (!svg) return;
  const hint = noteFullLabel(note, fret, kind);
  popup.classList.add('wide');
  popup.innerHTML = `<div class="chord-popup-name">${note}</div><div class="chord-popup-svg">${svg}</div><div class="chord-popup-hint">${escHtml(hint)} · ${escHtml(t('popup.clickToOpen'))}</div>`;
  popup.classList.add('visible');
  positionChordPopup(popup, this);
}
function hideChordPopup(){
  if (chordPopupEl) chordPopupEl.classList.remove('visible');
}
/* Hide popup if user scrolls or resizes */
window.addEventListener('scroll', hideChordPopup, true);
window.addEventListener('resize', hideChordPopup);

function wrapAllChordLinks(){
  /* Step text + per-step hints (single line and bulleted) */
  document.querySelectorAll('.dp .step .st-text').forEach(wrapChordLinksIn);
  document.querySelectorAll('.dp .step .sh').forEach(wrapChordLinksIn);
  document.querySelectorAll('.dp .step .sh-list li').forEach(wrapChordLinksIn);
  /* Step-response prompts (the question text above MC/short-answer inputs) */
  document.querySelectorAll('.dp .step .step-resp-prompt').forEach(wrapChordLinksIn);
  /* Objectives at the top of each set */
  document.querySelectorAll('.obj-card .obj-main, .obj-card .obj-sub, .obj-card .obj-set-sub, .obj-card .obj-skill-item').forEach(wrapChordLinksIn);
  /* Song list — names and meta lines often mention chords ("uses G and C") */
  document.querySelectorAll('.song-row .sname, .song-row .smeta').forEach(wrapChordLinksIn);
  /* Skills checklist — skill labels and helper text */
  document.querySelectorAll('.skill-row .sk-label, .skill-row .sk-helper').forEach(wrapChordLinksIn);
  /* Mid-module review — self-rated skill text and "play it" prompt */
  document.querySelectorAll('.mr-skill-text, .mr-play-prompt').forEach(wrapChordLinksIn);
}

// Per-module completion from the student's own progress, derived from the
// manifest (skillCount + skillIdRe) so it needs NO module data file loaded.
// state: 'none' (untouched) · 'partial' (some got-it) · 'complete' (all got-it).
function moduleCompletion(m){
  const total = m.skillCount || 0;
  if(!total) return { done:0, total:0, state:'none' };
  const re = m._skillRe || (m._skillRe = new RegExp(m.skillIdRe));
  let done = 0;
  for(const k in progress){ if(progress[k]==='gotit' && re.test(k)) done++; }
  if(done > total) done = total;
  const state = done===0 ? 'none' : (done>=total ? 'complete' : 'partial');
  return { done, total, state };
}

function populateModuleDropdown(){
  // Built from the lightweight manifest so we don't need every module's data
  // file loaded just to list the modules. Each option carries the student's
  // done count; a ✓ appears only once every skill in the module is got-it.
  // Untouched modules show just their name (no 0/N) — matches the "clean until
  // started" treatment on the set pills and progress strip.
  const sel = document.getElementById('module-select');
  const keep = sel.value;
  sel.innerHTML='';
  MODULE_MANIFEST.forEach(m=>{
    const opt = document.createElement('option');
    opt.value = m.num;
    const { done, total, state } = moduleCompletion(m);
    let tail = '';
    if(state==='complete') tail = ` · ${total}/${total} ✓`;
    else if(state==='partial') tail = ` · ${done}/${total}`;
    opt.textContent = `${t('nav.module')} ${m.num} — ${tf(m,'name')}${tail}`;
    sel.appendChild(opt);
  });
  if(keep) sel.value = keep;
}

let _moduleStripStates = {};   // num -> last seen state, to catch the just-completed moment
function celebrateModuleComplete(seg){
  flashClass(seg, 'celebrate', 1300);
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = seg.getBoundingClientRect();
  ['\u{1F3B8}','\u{1F3B5}','\u2B50','\u{1F3B6}','\u{1F3B5}','\u2728'].forEach((ch, i)=>{
    const el = document.createElement('span');
    el.className = 'celebrate-particle';
    el.textContent = ch;
    el.style.left = (r.left + r.width/2 - 9 + (i - 2.5) * 14) + 'px';
    el.style.top = (r.top - 4) + 'px';
    el.style.animationDelay = (i * 60) + 'ms';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 1900);
  });
}
/* The 8-segment module strip is gone (the Set pills live in its rail slot
   now), but this still drives the 🏆 module-complete badge — and throws the
   confetti from it the moment the current module flips to complete. */
function renderProgressStrip(){
  let currentInfo = null;
  const firstRender = Object.keys(_moduleStripStates).length === 0;
  MODULE_MANIFEST.forEach(m=>{
    const { done, total, state } = moduleCompletion(m);
    if(m.num===lastModuleNum) currentInfo = { done, total, state, num: m.num };
    // Celebrate the moment the CURRENT module flips to complete (never on first
    // paint — returning students shouldn't get confetti for last month's work).
    if(!firstRender && state==='complete' && _moduleStripStates[m.num] && _moduleStripStates[m.num] !== 'complete'
       && m.num===lastModuleNum){
      const goal = document.getElementById('rail-module-goal');
      if(goal) celebrateModuleComplete(goal);
    }
    _moduleStripStates[m.num] = state;
  });
  const goalEl = document.getElementById('rail-module-goal');
  if(goalEl){
    const earned = !!(currentInfo && currentInfo.state === 'complete');
    goalEl.classList.toggle('earned', earned);
    goalEl.title = earned
      ? `Module ${currentInfo.num} complete!`
      : 'Finish all skills to complete this module';
  }
  // Rail module progress bar — same "clean until started" rule as the pills:
  // hidden until the first skill in the module is marked got-it.
  const prog = document.getElementById('rail-mod-prog');
  if(prog){
    const show = !!(currentInfo && currentInfo.total > 0 && currentInfo.done > 0);
    prog.hidden = !show;
    if(show){
      const fill = document.getElementById('rmp-fill');
      const lbl  = document.getElementById('rmp-lbl');
      if(fill) fill.style.width = Math.round(currentInfo.done / currentInfo.total * 100) + '%';
      if(lbl)  lbl.textContent = `${currentInfo.done}/${currentInfo.total}`;
      prog.setAttribute('aria-valuemax', String(currentInfo.total));
      prog.setAttribute('aria-valuenow', String(currentInfo.done));
      prog.setAttribute('aria-valuetext', `${currentInfo.done} of ${currentInfo.total} skills`);
    }
  }
}

// Footer "Report a problem" — build the mailto at click time so the body carries
// wherever the student currently is (module + set). Returns true so the <a>'s
// default action opens the student's mail client with it prefilled.
function currentReportContext(){
  const m = MODULE_MANIFEST.find(x=>x.num===lastModuleNum);
  let loc = m ? `${t('nav.module')} ${m.num} — ${tf(m,'name')}` : `${t('nav.module')} ${lastModuleNum||1}`;
  if(lastSetId && String(lastSetId).startsWith('mr')){
    loc += `, ${t('nav.moduleReview')}`;
  } else {
    const w = SETS.find(s=>s.id===lastSetId);
    if(w) loc += `, ${tSetLabel(w.label)}`;   // module name already carries the topic
  }
  return loc;
}
function buildReportHref(a){
  const subject = t('report.subject');
  const body = currentReportContext() + ':\n\n';
  a.href = 'mailto:jhoffman@seq.org?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  return true;
}
// Footer "Report a problem" now opens an in-site form that writes to Firestore
// (issueReports collection) instead of navigating away to a mail client — but
// falls back to the mailto link above whenever a Firestore write isn't
// possible: Firebase failed to load, or the student is the dev-bypass user
// (whose uid Firestore rules reject, same convention as progress saves).
function handleReportClick(a){
  if(firebaseReady && currentUser && !isDevBypassUser()){
    openIssueModal();
    return false;
  }
  return buildReportHref(a);
}
function buildIssueModalHtml(){
  return `<div class="daily5-head"><h3 style="font:inherit;margin:0">${t('btn.reportProblem')}</h3><button type="button" class="tp-close" onclick="closeIssueModal()" aria-label="${escAttr(t('issue.closeAria'))}">&#x2715;</button></div>
    <p class="coach-tip">${escHtml(t('issue.contextLabel',{loc:currentReportContext()}))}</p>
    <textarea id="issue-text" class="reflection-ta" placeholder="${escAttr(t('issue.placeholder'))}" rows="5"></textarea>
    <div class="issue-status" id="issue-status" aria-live="polite"></div>
    <div class="issue-actions">
      <button type="button" class="panel-next-btn" id="issue-submit-btn" onclick="submitIssueReport()">${t('issue.submit')}</button>
    </div>`;
}
function openIssueModal(){
  closeIssueModal();
  const ov=document.createElement('div');
  ov.className='daily5-overlay';
  ov.id='issue-overlay';
  ov.innerHTML=`<div class="daily5-modal" role="dialog" aria-modal="true" aria-label="${escAttr(t('btn.reportProblem'))}">${buildIssueModalHtml()}</div>`;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeIssueModal(); });
  document.body.appendChild(ov);
  document.addEventListener('keydown', issueEscClose);
  const ta = document.getElementById('issue-text');
  if(ta) ta.focus();
}
function issueEscClose(e){ if(e.key==='Escape') closeIssueModal(); }
function closeIssueModal(){
  const ov=document.getElementById('issue-overlay');
  if(ov) ov.remove();
  document.removeEventListener('keydown', issueEscClose);
}
async function submitIssueReport(){
  const ta = document.getElementById('issue-text');
  const status = document.getElementById('issue-status');
  const btn = document.getElementById('issue-submit-btn');
  const message = ((ta && ta.value) || '').trim();
  if(!message){
    if(status){ status.textContent = t('issue.emptyWarn'); status.className = 'issue-status err'; }
    return;
  }
  if(btn){ btn.disabled = true; btn.textContent = t('issue.sending'); }
  if(status){ status.textContent = ''; status.className = 'issue-status'; }
  try{
    await ensureDb();
    await db.collection('issueReports').add({
      uid: currentUser.uid,
      email: currentUser.email || '',
      name: currentUser.displayName || '',
      message,
      location: currentReportContext(),
      moduleNum: lastModuleNum,
      setId: lastSetId,
      lang: getLang(),
      userAgent: navigator.userAgent,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    if(status){ status.textContent = t('issue.sent'); status.className = 'issue-status ok'; }
    if(ta) ta.disabled = true;
    if(btn) btn.remove();
    setTimeout(closeIssueModal, 2200);
  } catch(e){
    if(status){ status.textContent = t('issue.failed'); status.className = 'issue-status err'; }
    if(btn){ btn.disabled = false; btn.textContent = t('issue.submit'); }
  }
}

// Teacher (signed into the student app as the class teacher) and the localhost
// dev-bypass user can preview every set/review without working through the
// sequential gate — they're checking content, not taking the class.
function isGatePreviewer(){
  if(typeof isDevBypassUser==='function' && isDevBypassUser()) return true;
  return !!(currentUser && typeof TEACHER_EMAIL!=='undefined' && currentUser.email===TEACHER_EMAIL);
}

function isModuleReviewLocked(moduleNum){
  const sets = SETS.filter(w=>w.moduleNum===moduleNum);
  if(!sets.length) return true;
  if(isGatePreviewer()) return false;                 // teacher/dev: always open
  if(sets.some(w=>w.locked||w.comingSoon)) return true;
  const allSkills = sets.flatMap(w=>w.skills||[]);
  if(!allSkills.length) return true;
  return !allSkills.every(s=>progress[s.id]==='gotit');
}

// A set counts as "finished" once every one of its trackable skills is marked
// "I've got it!" — the same bar Module Review uses. A set that isn't built yet
// (static locked/comingSoon) never counts as finished, so it holds the gate.
function isSetComplete(w){
  if(!w || w.locked || w.comingSoon) return false;
  const skills = w.skills || [];
  if(!skills.length) return true;
  return skills.every(s=>progress[s.id]==='gotit');
}

// Has the student actually worked in this set? Any skill they've touched
// (either column of the checklist) or any step they've marked done counts.
// A locked set can't be opened, so progress inside one is proof they had
// access to it at some point.
function hasProgressIn(w){
  if(!w) return false;
  if((w.skills||[]).some(s=>progress[s.id]==='gotit' || progress[s.id]==='working')) return true;
  const prefix = w.id + '-';
  return Object.keys(completed||{}).some(k=>completed[k]===true && k.startsWith(prefix));
}

// Sequential gate: a set stays locked until the set before it (in module order)
// is finished, so students work a module in order — the same lock-until-complete
// idea as Module Review, applied to every set. The first set is always open.
//
// The gate is a HIGH-WATER MARK, not a live derivation: once a student has
// worked in a set it never re-locks. Previously this was computed purely from
// current state, so demoting one skill back to "still working on it" re-locked
// the FOLLOWING set even when that set was already finished — the checklist's
// two columns are a deliberate toggle pair, so that's an invited action (and a
// trackpad mis-tap does it). A single tap in Set 1 could hide a completed Set 2
// behind a lock while Sets 3 and 4 stayed open, and activateSet's backstop then
// refused to reopen it. Punishing honest self-correction is exactly backwards —
// we want students marking "still working on it" freely.
function isSetLocked(w){
  if(!w) return true;
  if(w.locked || w.comingSoon) return true;          // static/unbuilt stays locked for everyone
  if(isGatePreviewer()) return false;                // teacher/dev: skip the sequential gate
  const moduleSets = SETS.filter(x=>x.moduleNum===w.moduleNum);
  const idx = moduleSets.indexOf(w);
  if(idx<=0) return false;
  if(hasProgressIn(w)) return false;                 // already been here — never lock them back out
  return !isSetComplete(moduleSets[idx-1]);
}

// The set immediately before w in its module (for "finish X first" hints).
function prevSetLabel(w){
  const arr = SETS.filter(x=>x.moduleNum===w.moduleNum);
  return (arr[arr.indexOf(w)-1] || {}).label || t('nav.prevSet');
}

// Tiny transient toast for gate hints — makes its own element and self-dismisses.
let _gateToastTimer = null;
function gateToast(msg){
  let el = document.getElementById('gate-toast');
  if(!el){
    el = document.createElement('div');
    el.id = 'gate-toast';
    el.setAttribute('role','status');
    el.setAttribute('aria-live','polite');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  if(_gateToastTimer) clearTimeout(_gateToastTimer);
  _gateToastTimer = setTimeout(()=>el.classList.remove('show'), 2800);
}

async function onModuleChange(moduleNum, restoreSetId){
  moduleNum = parseInt(moduleNum);
  lastModuleNum = moduleNum;
  document.getElementById('module-select').value = moduleNum;
  // Fetch + build this module's panels on first visit before showing them.
  await ensureModuleRendered(moduleNum);
  const moduleSets = SETS.filter(w=>w.moduleNum===moduleNum);
  if(!moduleSets.length) return;   // load failed (e.g. offline + not precached)
  renderPills(moduleNum);
  renderProgressStrip();   // refresh the "you are here" indicator
  const isReviewId = restoreSetId === `mr${moduleNum}` && MODULE_REVIEWS[moduleNum];
  // The student's "frontier": the first unlocked set they haven't finished yet
  // (or the last unlocked one if they're all done). Used when there's nothing
  // valid to restore, and as the fallback if a restore target is now locked.
  const frontier = ( moduleSets.find(w=>!isSetLocked(w) && !isSetComplete(w))
                  || [...moduleSets].reverse().find(w=>!isSetLocked(w))
                  || moduleSets[0] ).id;
  let target = (restoreSetId && (moduleSets.find(w=>w.id===restoreSetId) || isReviewId))
    ? restoreSetId : frontier;
  // Never open onto a set the sequential gate has locked.
  if(!/^mr\d+$/.test(target) && isSetLocked(moduleSets.find(w=>w.id===target))) target = frontier;
  activateSet(target);
}

// Per-set completion tally from the student's own progress.
// Returns {done, total}; total is 0 for sets with no trackable skills.
function setCompletion(w){
  const skills = (w.skills && w.skills.length) ? w.skills : [];
  const done = skills.filter(s=>progress[s.id]==='gotit').length;
  return { done, total: skills.length };
}

function renderPills(moduleNum){
  const c = document.getElementById('week-pills');
  c.innerHTML='';
  const sets = SETS.filter(w=>w.moduleNum===moduleNum);
  // 4+ sets: compact the buttons so they still fit on one rail row
  c.classList.toggle('wp-many', sets.length>3);
  sets.forEach(w=>{
    const btn = document.createElement('button');
    const locked = isSetLocked(w);
    btn.className='wpill'+(locked?' locked':'');
    btn.dataset.id=w.id;
    const { done, total } = locked ? { done:0, total:0 } : setCompletion(w);
    // Label text carries data-i18n-setlabel (not just plain text) so applyI18n
    // marks it translate="no" — otherwise these freshly-created buttons are
    // never caught by the DOM walk and stay exposed to Google Translate.
    if(!locked && total>0 && done===total){
      // All skills got-it: green treatment + leading ✓.
      btn.classList.add('complete');
      btn.innerHTML = `<span class="wpill-check" aria-hidden="true">✓</span><span data-i18n-setlabel="${escAttr(w.label)}" translate="no" class="notranslate">${escHtml(tSetLabel(w.label))}</span>`;
      btn.setAttribute('aria-label', t('gate.pillAllComplete', {set: tSetLabel(w.label), total}));
    } else if(!locked && done>0){
      // Started but not finished: full name + a small fraction. Untouched sets
      // stay clean (just the name) until the first skill is marked got-it.
      const frac = document.createElement('span');
      frac.className = 'wpill-frac';
      frac.textContent = ` · ${done}/${total}`;
      btn.innerHTML = `<span data-i18n-setlabel="${escAttr(w.label)}" translate="no" class="notranslate">${escHtml(tSetLabel(w.label))}</span>`;
      btn.appendChild(frac);
      btn.setAttribute('aria-label', t('gate.pillProgress', {set: tSetLabel(w.label), done, total}));
    } else {
      btn.innerHTML = `<span data-i18n-setlabel="${escAttr(w.label)}" translate="no" class="notranslate">${escHtml(tSetLabel(w.label))}</span>`;
    }
    if(locked){
      // Sequential gate: opens once the set before it is finished. Keep the
      // pill tappable so it explains why instead of doing nothing.
      const gp = { set: tSetLabel(w.label), prev: tSetLabel(prevSetLabel(w)) };
      btn.setAttribute('aria-disabled','true');
      btn.setAttribute('aria-label', t('gate.lockedUntilAria', gp));
      btn.title = t('gate.lockedTitle', gp);
      btn.onclick = ()=> gateToast(t('gate.finishFirstLong', { set: tSetLabel(w.label), prev: tSetLabel(prevSetLabel(w)) }));
    } else {
      btn.onclick=()=>{ leaveTopPanelForSet(); lastSetId=w.id; activateSet(w.id); saveProgress(); };
    }
    c.appendChild(btn);
  });

  // Module Review pill — wraps to its own full-width row below the set buttons
  if(MODULE_REVIEWS[moduleNum]){
    const locked = isModuleReviewLocked(moduleNum);
    const rbtn = document.createElement('button');
    rbtn.className='wpill review-pill'+(locked?' locked':'');
    rbtn.dataset.id=`mr${moduleNum}`;
    rbtn.textContent=t('nav.moduleReview');
    rbtn.setAttribute('data-i18n','nav.moduleReview');
    rbtn.setAttribute('translate','no'); rbtn.classList.add('notranslate');
    rbtn.title = locked ? t('gate.reviewPreviewTitle') : '';
    rbtn.onclick=()=>{ leaveTopPanelForSet(); lastSetId=`mr${moduleNum}`; activateSet(`mr${moduleNum}`); saveProgress(); };
    c.appendChild(rbtn);
    // Sync preview/locked state onto the review's panel so its inputs disable themselves
    const panel = document.querySelector(`.week-panel[data-id="mr${moduleNum}"]`);
    if(panel) panel.classList.toggle('mr-locked', locked);
  }
}

window.addEventListener('pagehide', function(){ if(_dirtyKeys.size){ clearTimeout(saveTimer); flushSave(); } });

function activateSet(id){
  // Sequential-gate backstop: never open a set that's still locked (e.g. from a
  // stale search deep-link). Explain why and stay put. Module Review (mrN) is
  // intentionally preview-openable while locked, so it's exempt.
  if(!/^mr\d+$/.test(id)){
    const w = SETS.find(x=>x.id===id);
    if(w && isSetLocked(w)){
      gateToast(t('gate.finishFirstShort', { set: tSetLabel(w.label), prev: tSetLabel(prevSetLabel(w)) }));
      return;
    }
  }
  lastSetId = id;
  if (typeof stopAnyRec === 'function') stopAnyRec();
  // A Listening Coach check left running inline in the set/tab we're leaving
  // just goes invisible otherwise (its DOM node stays put, only hidden by
  // CSS) — the mic and its rAF loop would keep running unseen, permanently
  // muting the metronome/demo audio for the rest of the session. Closing it
  // here is a no-op when no check is open (coachClose() is safe to call
  // unconditionally — see coach.js).
  if (typeof coachClose === 'function') coachClose();
  // A Shuffle Drill's countdown interval (and any pending "next card" timer)
  // keeps running even after its panel is hidden by CSS on set-switch — it's
  // never rebuilt like a language-switch re-render, so nothing else stops
  // it. Stopping every drill here (harmless no-op for ones not mid-round)
  // is simpler than tracking which set each key belongs to.
  if(typeof shuffleDrills === 'object' && typeof sdStop === 'function'){
    Object.keys(shuffleDrills).forEach(k=>sdStop(k));
  }
  document.querySelectorAll('.wpill').forEach(b=>b.classList.toggle('active',b.dataset.id===id));
  document.querySelectorAll('.week-panel').forEach(p=>p.classList.toggle('active',p.dataset.id===id));
  renderChordBoxes();
  syncRailStations();   // refresh the rail's "This set" station switcher for the new set
  // Every set opens at the top, every time — no scroll-position memory.
  window.scrollTo(0, 0);
}

/* ── Rail station switcher ─────────────────────────────────────────────
   The per-set station tabs (Station B/C · checklist · Songs) now live in the
   left rail instead of inside each set panel. The in-panel .tabs block still
   exists in the DOM (hidden via CSS) so switchTab/switchTabById/panelFooter/
   print all keep working unchanged — these helpers just drive it and mirror
   the active state back into the rail. */
function activeWeekPanel(){ return document.querySelector('.week-panel.active'); }
function railStation(tab){
  const panel = activeWeekPanel();
  if(!panel) return;
  leaveTopPanelForSet();
  switchTabById(panel.dataset.id, tab);   // switchTab() calls syncRailStations() to reflect it
}
function syncRailStations(){
  const group = document.getElementById('rail-set-group');
  const list  = document.getElementById('rail-stations');
  if(!group || !list) return;   // teacher view / pre-init: nothing to do
  const panel = activeWeekPanel();
  const hasTabs = panel && panel.querySelector('.tabs .tabs-card');
  if(!hasTabs){ group.hidden = true; return; }   // module-review / coming-soon: no stations
  group.hidden = false;
  const wid = panel.dataset.id;
  const w = (typeof SETS !== 'undefined') ? SETS.find(s=>s.id===wid) : null;
  const label = document.getElementById('rail-set-label');
  if(label) label.textContent = t('nav.thisSet') + (w && w.label ? ' · ' + tSetLabel(w.label) : '');
  /* Single-flow sets (only station b): hide the Station C rail button and
     mirror the set's own tab labels onto the rail. applyI18n restores the
     defaults on language switch, then this override re-applies (the
     gc-langchange listener calls syncRailStations after applyI18n). */
  const single = !!(w && w.stations && w.stations.b && !w.stations.c && !w.comingSoon);
  const stC = list.querySelector('.rail-station.st-c');
  if(stC) stC.hidden = single;
  const bNum = list.querySelector('.rail-station.st-b .rs-num');
  const bTitle = list.querySelector('.rail-station.st-b .rs-title');
  const bSub = list.querySelector('.rail-station.st-b .rs-sub');
  if(bNum) bNum.textContent = single ? '1' : 'B';
  if(bTitle) bTitle.textContent = (single && w.stations.b.tabTitle) ? tf(w.stations.b,'tabTitle') : t('nav.stationBTitle');
  if(bSub) bSub.textContent = (single && w.stations.b.tabSub) ? tf(w.stations.b,'tabSub') : t('nav.stationBSub');
  const chkSubEl = list.querySelector('.rail-station.st-chk .rs-sub');
  if(chkSubEl) chkSubEl.textContent = (single && w.checklistSub) ? tf(w,'checklistSub') : t('nav.checklistSub');
  // Reflect whichever tab-panel is currently active back onto the rail buttons.
  const activePanel = panel.querySelector('.tab-panel.active');
  const activeTab = activePanel ? activePanel.id.slice(wid.length + 1) : 'station-b';
  list.querySelectorAll('.rail-station').forEach(b=>{
    const on = b.dataset.station === activeTab;
    b.classList.toggle('active', on);
    if(on) b.setAttribute('aria-current','true'); else b.removeAttribute('aria-current');
  });
}

/* "Practice" nav item: leave whatever overlay is open (Games/Songs hub/Search)
   and return to the practice view. Reuses the existing close-all helper. */
function returnToPractice(){
  if(typeof closeTopPanels === 'function') closeTopPanels();
  window.scrollTo({ top:0, behavior:'smooth' });
}

/* Set/review panels are now built per-module, on demand, by
   ensureModuleRendered() (defined near the top of this file). */

function buildSetHeader(w){
  const pill = w.title ? `<span class="obj-set-tag" data-i18n-setlabel="${escAttr(w.title)}" translate="no">${escHtml(tSetLabel(w.title))}</span>` : '';
  const crumb = w.unit ? `<span class="obj-unit">${w.unit}</span>` : '';
  return (pill || crumb) ? `<div class="obj-set">${pill}${crumb}</div>` : '';
}

function buildComingSoon(w){
  const header = buildSetHeader(w);
  const sub = w.subtitle ? `<h2 class="obj-main">${tf(w,'subtitle')}</h2>` : '';
  return `<div class="obj-card set-head">${header}${sub}</div>
  <div class="coming"><div class="big">&#x1F3B8;</div><p>${t('nav.comingSoonHtml')}</p></div>`;
}

function buildSet(w){
  // Small "Set N" pill, then the topic as the large title, then generalized
  // skill bullets (the old "I CAN…" objective line is no longer shown).
  const printBtn = `<button type="button" class="print-set-btn" onclick="printSet('${w.id}')" title="${escAttr(t('btn.printSetTitle'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7" rx="1"/></svg><span data-i18n="btn.printSet">${t('btn.printSet')}</span></button>`;
  const pill = `<div class="obj-set">${w.title ? `<span class="obj-set-tag" data-i18n-setlabel="${escAttr(w.title)}" translate="no">${escHtml(tSetLabel(w.title))}</span>` : ''}${printBtn}</div>`;
  const titleHtml = w.unit ? `<h2 class="obj-main obj-topic">${tf(w,'unit')}</h2>` : '';
  const items = (tf(w,'skillFocus')||'').split(' · ')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => `<li class="obj-skill-item">${s}</li>`)
    .join('');
  const skills = items ? `<ul class="obj-skill-list">${items}</ul>` : '';
  /* Song-thread line: each core song is built LAYER BY LAYER across the
     course (the Journey pages' shared ladder: 1 Listen · 2 Single Notes ·
     3 Power Chords · 4 Pentatonic Solo · 5 Open Chords · Luna bonus 6).
     One compact line naming which layer this set builds, names deep-linked
     to that layer on the Journey page — full detail (videos, notes) lives
     in the module's Songs list at the bottom, so this doesn't repeat it. */
  const thread = (w.songThread && w.songThread.length)
    ? (()=>{
        const entries = w.songThread;
        /* NB: don't name this callback param `t` — it would shadow the global
           i18n t() that the title string below needs. */
        const names = entries.map(song => {
          const url = song.journey ? (song.layer ? `${song.journey}#layer-${song.layer}` : song.journey) : null;
          return url
            ? `<a class="song-thread-link" href="${escAttr(url)}" target="_blank" rel="noopener" title="${escAttr(t('songs.openLayerTitle'))}">${escHtml(song.name)}</a>`
            : `<span class="song-thread-name">${escHtml(song.name)}</span>`;
        }).join(', ');
        const layers = entries.map(song => song.layer);
        const sameLayer = layers[0] != null && layers.every(l => l === layers[0]);
        const sameBonus = entries.every(song => !!song.bonus === !!entries[0].bonus);
        const lede = (sameLayer && sameBonus && entries[0].bonus) ? t('thread.bonusLayer')
          : sameLayer ? t('thread.buildsLayer', {n: layers[0]})
          : t('thread.grows');
        return `<div class="song-thread">&#x1F3B8; ${lede} ${names}</div>`;
      })()
    : '';
  /* Single-flow sets (e.g. Module 13 · String Changing): only station b
     exists — one "learn the process" card straight into the checklist, no
     Station B/C framing. The card's labels come from the set's own fields
     (tabTitle/tabSub on stations.b, checklistSub on the set, + _es twins). */
  const single = !!(w.stations && w.stations.b && !w.stations.c);
  const bTabTitle = (single && w.stations.b.tabTitle) ? tf(w.stations.b,'tabTitle') : t('nav.stationBTitle');
  const bTabSub   = (single && w.stations.b.tabSub)   ? tf(w.stations.b,'tabSub')   : t('nav.stationBSub');
  const chkSub    = (single && w.checklistSub) ? tf(w,'checklistSub') : t('nav.checklistSub');
  const stationCards = single
    ? `<button type="button" class="tabs-card tab-station-b active" onclick="switchTab(this,'${w.id}','station-b')">
          <span class="tabs-card-title"><span class="tabs-card-num">1</span>${bTabTitle}</span>
          <span class="tabs-card-sub">${bTabSub}</span>
        </button>`
    : `<button type="button" class="tabs-card tab-station-b active" onclick="switchTab(this,'${w.id}','station-b')">
          <span class="tabs-card-title"><span class="tabs-card-num">1</span>${t('nav.stationBTitle')}</span>
          <span class="tabs-card-sub">${t('nav.stationBSub')}</span>
        </button>
        <button type="button" class="tabs-card tab-station-c" onclick="switchTab(this,'${w.id}','station-c')">
          <span class="tabs-card-title"><span class="tabs-card-num">2</span>${t('nav.stationCTitle')}</span>
          <span class="tabs-card-sub">${t('nav.stationCSub')}</span>
        </button>`;
  return `<div class="obj-card set-head">${titleHtml}${pill}${skills}${thread}</div>
  <div class="tabs">
    <div class="tabs-songbar">
      ${w.songs ? `<button type="button" class="tabs-songs tab-songs" onclick="switchTab(this,'${w.id}','songs')">&#9835; ${t('nav.songs')}</button>` : ''}
    </div>
    <div class="tabs-main">
      <div class="tabs-stations-col">
        ${stationCards}
      </div>
      <div class="tabs-arrow" aria-hidden="true">&rarr;</div>
      <button type="button" class="tabs-card tab-checklist" onclick="switchTab(this,'${w.id}','checklist')">
        <span class="tabs-card-title"><span class="tabs-card-num">${single ? 2 : 3}</span>${t('nav.checklistTitle')}</span>
        <span class="tabs-card-sub">${chkSub}</span>
      </button>
    </div>
  </div>
  <div id="${w.id}-station-b" class="tab-panel tp-station-b active">${buildStations(w,'b')}${panelFooter(w,'station-b')}</div>
  ${single ? '' : `<div id="${w.id}-station-c" class="tab-panel tp-station-c">${buildStations(w,'c')}${panelFooter(w,'station-c')}</div>`}
  <div id="${w.id}-songs"    class="tab-panel tp-songs">${w.songs ? buildSongs(w) + panelFooter(w,'songs') : ''}</div>
  <div id="${w.id}-checklist" class="tab-panel tp-checklist">${buildChecklist(w)}${panelFooter(w,'checklist')}</div>`;
}

function switchTab(el,wid,tab){
  // Same reasoning as activateSet(): the tab-panel we're switching away from
  // (e.g. Station B) might be hiding a still-running inline Coach check —
  // close it so its mic doesn't keep running unseen. No-op if none is open.
  if (typeof coachClose === 'function') coachClose();
  const panel=document.querySelector(`.week-panel[data-id="${wid}"]`);
  panel.querySelectorAll('.tabs > .tabs-main .tabs-card, .tabs > .tabs-songbar > .tabs-songs').forEach(t=>t.classList.remove('active'));
  panel.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(`${wid}-${tab}`).classList.add('active');
  if(typeof syncRailStations === 'function') syncRailStations();   // mirror onto the rail switcher
}

/* Print one set as a clean one-pager (for days the Chromebooks/Wi-Fi fail).
   The @media print stylesheet does the heavy lifting — it force-shows BOTH
   station panels (regardless of which tab is open) and hides the songs/
   checklist tabs and all on-screen chrome — so this just fires the dialog. */
function printSet(wid){ window.print(); }
/* Printed handouts must show the collapsed hint/stuck/level-up prose —
   hidden fold panels don't print, so unhide them for the print pass and
   restore afterwards. */
let _printOpened = [];
window.addEventListener('beforeprint', ()=>{
  _printOpened = [...document.querySelectorAll('.step-fold-panel[hidden]')];
  _printOpened.forEach(d=>d.removeAttribute('hidden'));
});
window.addEventListener('afterprint', ()=>{
  _printOpened.forEach(d=>d.setAttribute('hidden',''));
  _printOpened = [];
});

/* Hint / Stuck? / Level up pill tapped: open that pill's panel full-width
   below the pill row. Tab-style — one panel open at a time, tapping the
   open pill closes it (Jonathan's call, 2026-07-23). */
function toggleStepFold(btn){
  const wrap = btn.closest('.step-folds');
  const panel = document.getElementById(btn.getAttribute('aria-controls'));
  if(!wrap || !panel) return;
  const willOpen = panel.hasAttribute('hidden');
  wrap.querySelectorAll('.step-fold-pill').forEach(p=>p.setAttribute('aria-expanded','false'));
  wrap.querySelectorAll('.step-fold-panel').forEach(p=>p.setAttribute('hidden',''));
  if(willOpen){
    panel.removeAttribute('hidden');
    btn.setAttribute('aria-expanded','true');
  }
}

/* Generic tuning warm-up sections are superseded by the Daily 5 (which starts
   with the tune-up) for every module except Module 1: sectionsHtml() drops
   them from the numbered list and shows a Daily 5 pointer card instead. Any
   code that maps a section index back to rendered DOM (search, teacher
   dashboard response keys) must filter with this same predicate first, or
   its indexes drift from what's actually on screen. Kept at module scope
   (not a buildStations() closure) so buildSearchIndex() can share it. */
function isTuningWarmupSection(sec, moduleNum){
  return sec.title === 'Warm-up — tuning check (Module 1)' && moduleNum !== 1;
}

/* ── Stations ── */
function buildStations(w, stationId){
  /* Focus mode is a site-wide view pref, read once per build: it only changes
     which rows the card SHOWS, never which one is `.cur` (that stays "first
     not-done step"), so the same markup serves both views and the toggle can
     flip live without a rebuild. `openNum` is set by stepsHtml() below as it
     emits the one open row, so the stepper bar can label it "Step n of m". */
  const focusMode = stationViewIsFocus();
  let openNum = 0;
  const stepsHtml=(steps,ns,numOffset=0,allowCur=true,openIfNoCur=false)=>{
   const curIdx = allowCur ? steps.findIndex((st,idx)=>completed[`${w.id}-${ns}-${idx}`]!==true) : -1;
   // Every step done → no `.cur` anywhere. Focus mode hides collapsed rows, so
   // a card with nothing open would render empty: step 1 stays open instead.
   const openIdx = curIdx >= 0 ? curIdx : (openIfNoCur ? 0 : -1);
   return steps.map((s,i)=>{
    const text=tf(s,'text').replace(/<a href="(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^"]*)"([^>]*)>([^<]*)<\/a>/g,(match,url,attrs,label)=>{
      const safe=label.replace(/'/g,"\\'");
      // data-ext links can't be embedded (official recordings block it) — open on YouTube in a new tab.
      if(/data-ext/.test(attrs)){
        return `<button class="rp-trigger" onclick="window.open('${url}','_blank','noopener')" title="${escAttr(t('panel.opensOnYouTube'))}">&#x25B6; ${label} <span style="font-size:0.6875rem;opacity:0.6">&#x2197;</span></button>`;
      }
      return `<button class="rp-trigger" onclick="loadPanel('youtube','${url}','${safe}','YouTube')">&#x25B6; ${label}</button>`;
    });
    const text2 = wrapGotItWhen(text);
    /* One-thing-per-screen: the challenge text and the DOER (play buttons,
       diagrams, TAB, responses) stay visible; supporting prose (hint, stuck,
       level-up) collapses behind a tap — never competing with the thing the
       student is supposed to do. The three pills sit in a FIXED row and the
       tapped pill's panel opens full-width BELOW the row (one at a time), so
       opening a panel never reflows the pills (fix approved 2026-07-23). */
    const folds = [];
    if(s.hint){
      const hint = tf(s,'hint');
      const bullets = hint.split(/(?<=\.(?=\s))(?=\s*[A-Z])|\n/).map(b=>b.trim()).filter(Boolean);
      const inner = bullets.length <= 1 ? `<div class="sh">${hint}</div>`
        : `<ul class="sh-list">${bullets.map(b=>`<li>${b}</li>`).join('')}</ul>`;
      folds.push({key:'hint', icon:'&#x1F4A1;', label:t('step.hint'), body:inner});
    }
    if(s.stuck) folds.push({key:'stuck', icon:'&#x1FA9C;', label:t('step.stuck'), body:`<div class="step-branch step-stuck">${tf(s,'stuck')}</div>`});
    if(s.levelUp) folds.push({key:'levelup', icon:'&#x1F336;&#xFE0F;', label:t('step.levelUp'), body:`<div class="step-branch step-levelup">${tf(s,'levelUp')}</div>`});
    const foldsHtml = folds.length ? (()=>{
      const idBase = `${w.id}-${ns}-${i}-fold`;
      const pills = folds.map(f=>`<button type="button" class="step-fold-pill step-${f.key}-fold" aria-expanded="false" aria-controls="${idBase}-${f.key}" onclick="toggleStepFold(this)">${f.icon} ${f.label}</button>`).join('');
      const panels = folds.map(f=>`<div class="step-fold-panel" id="${idBase}-${f.key}" hidden>${f.body}</div>`).join('');
      return `<div class="step-folds"><div class="step-folds-row">${pills}</div>${panels}</div>`;
    })() : '';
    const chordsHtml = (s.chords&&s.chords.length)
      ? `<div class="chord-diagrams">${s.chords.map(c=>`<div class="chord-box">${chordDiagramSVG(c)}${c.name?`<div class="chord-box-label">${c.name}</div>`:''}</div>`).join('')}</div>` + coachChordBtnRowHtml(s.chords, stepSkillIds(w, s))
      : '';
    // One step, one Listening Coach button: a step's chord-check button
    // (above) already covers this step, so the melody/tab Coach buttons
    // below stay suppressed rather than showing a second one.
    const hasChordsCoach = chordsHtml.includes('coach-chord-row');
    const playSeqHtml = s.playSeq ? (()=>{
      const ps = s.playSeq;
      const label = (ps.label && tf(ps,'label')) || t('step.playAll');
      const defBpm = ps.bpm || 60;
      const minBpm = ps.minBpm || 40;
      const maxBpm = ps.maxBpm || 120;
      const key = `bpm:${w.id}:${ns}:${i}`;
      const bpm = readStoredBpm(key, defBpm);
      const midis = JSON.stringify(ps.notes);
      // Held notes ({midi,beats}) aren't one-pick-per-beat — a mic check
      // expecting evenly picked onsets would fail correct technique.
      const hasHolds = (ps.notes || []).some(n => n && typeof n === 'object' && !Array.isArray(n));
      return ` <span class="bpm-control-group">` +
        `<button type="button" class="play-seq-btn" data-midis="${escAttr(midis)}" onclick="playSequenceFromGroup(this)" title="${escAttr(t('step.playAll'))}">&#x25B6; ${escHtml(label)}</button>` +
        renderBpmControl(key, bpm, minBpm, maxBpm) +
        (hasHolds || hasChordsCoach ? '' : coachBtnHtml(midis, null, stepSkillIds(w, s))) +
        `</span>`;
    })() : '';
    const tabHtml = s.tab ? buildTab(s.tab, { keyPrefix: `bpm:${w.id}:${ns}:${i}:tab`, suppressCoach: hasChordsCoach }) : '';
    const tabsHtml = (s.tabs && s.tabs.length)
      ? `<div class="tab-choice-group">${s.tabs.map((spec, tIdx) => {
          const title = (spec.title && tf(spec,'title')) || (spec.caption && tf(spec,'caption')) || t('tab.defaultTitle');
          return `<div class="tab-choice"><button type="button" class="tab-choice-btn" onclick="toggleTabChoice(this)"><span class="tab-choice-icon">&#x25B6;</span><span>${t('tab.showTabLabel')} ${escHtml(title)}</span></button><div class="tab-choice-content">${buildTab(spec, { keyPrefix: `bpm:${w.id}:${ns}:${i}:tab:${tIdx}`, suppressCoach: hasChordsCoach })}</div></div>`;
        }).join('')}</div>`
      : '';
    const respHtml = s.response ? (()=>{
      const key = `${w.id}-${ns}-${i}`;
      const isPR = s.response.type === 'short' && (/personal record/i.test(s.response.prompt||'') || /\bBPM\b/i.test(s.response.prompt||''));
      const stored = isPR ? prLatestValue(responses[key]) : (responses[key] || '');
      const promptHtml = s.response.prompt ? `<div class="step-resp-prompt">${escHtml(tf(s.response,'prompt'))}</div>` : '';
      const labelHtml = `<div class="step-resp-label">&#x270F;&#xFE0F; ${t('step.yourResponse')}</div>`;
      if(s.response.type === 'short'){
        const ph = s.response.placeholder ? tf(s.response,'placeholder') : t('step.answerPlaceholder');
        const prAttrs = isPR ? ` onblur="onResponsePRBlur('${key}')"` : '';
        return `<div class="step-resp">${labelHtml}${promptHtml}<textarea class="step-resp-input" rows="2" placeholder="${escAttr(ph)}" oninput="onResponseChange('${key}', this.value${isPR?', true':''})"${prAttrs}>${escHtml(stored)}</textarea></div>`;
      }
      if(s.response.type === 'mc' && Array.isArray(s.response.choices)){
        const r = s.response;
        const choicesEs = tf(r,'choices');
        // Factual MCs carry answer: (index) + explain: — render as graded buttons.
        // NOTE: `stored`/data-choice are always keyed on the ENGLISH choice text
        // (r.choices), even when the Spanish label is shown — that's the value
        // persisted in Firestore, so it must stay language-stable.
        if(typeof r.answer === 'number'){
          const ansChoice = r.choices[r.answer];
          const answered = stored !== '';
          const opts = mcOrder(r.choices, mcSeed(r)).map(ci=>{
            const c = r.choices[ci];
            let cls = 'step-mc-opt';
            if(c === ansChoice) cls += ' is-answer';
            if(answered && c === stored) cls += (c === ansChoice) ? ' correct' : ' incorrect';
            return `<button type="button" class="${cls}" data-choice="${escAttr(c)}" data-correct="${c===ansChoice?'1':'0'}" onclick="onStepMcSelect('${key}', this)"><span class="step-mc-text">${escHtml(choicesEs[ci])}</span><span class="step-mc-check">&#x2713;</span></button>`;
          }).join('');
          const explainHtml = r.explain ? `<div class="step-mc-explain">${escHtml(tf(r,'explain'))}</div>` : '';
          return `<div class="step-resp">${labelHtml}${promptHtml}<div class="step-resp-mc step-mc-keyed${answered?' answered':''}">${opts}</div>${explainHtml}</div>`;
        }
        // Reflection / observation MCs stay unkeyed — record the pick only.
        const opts = r.choices.map((c,ci)=>{
          const checked = stored===c ? 'checked' : '';
          return `<label class="step-resp-mc-opt"><input type="radio" name="resp-${key}" ${checked} onchange="onResponseChange('${key}', '${escAttr(c)}')"><span>${escHtml(choicesEs[ci])}</span></label>`;
        }).join('');
        return `<div class="step-resp">${labelHtml}${promptHtml}<div class="step-resp-mc">${opts}</div></div>`;
      }
      return '';
    })() : '';
    /* Interactive drill (shuffle self-quiz) — sits under the doer row and
       above the written response, since it IS the doing. */
    const drillHtml = s.drill ? renderShuffleDrill(s.drill, `${w.id}-${ns}-${i}`, w.id) : '';
    const doneKey = `${w.id}-${ns}-${i}`;
    const isDone = completed[doneKey] === true;
    const isCur = i === curIdx;
    const isOpen = i === openIdx;
    // Mark-done is the last row of the step.
    const doneBtn = `<div class="step-done-row"><button class="step-done-btn" type="button" aria-pressed="${isDone}" onclick="toggleStepDone(this,'${doneKey}')">${stepDoneHtml(isDone)}</button></div>`;
    const skillsAttr = (s.skills && s.skills.length) ? ` data-skills="${s.skills.join(',')}"` : '';
    const label = stepLabel(s);
    const num = numOffset + i + 1;
    const ariaLabel = t(isDone ? 'step.ariaLabelDone' : 'step.ariaLabel', { n: num, label });
    const statusIcon = isDone ? '&#x2713;' : String(num);
    if(isOpen) openNum = num;
    return `<li class="step${isDone ? ' step-done' : ''}${isCur ? ' cur' : ''}${isOpen ? '' : ' collapsed'}"${skillsAttr} data-num="${num}">`
      + `<button type="button" class="step-head" aria-expanded="${isOpen}" onclick="toggleStepOpen(this)" aria-label="${escAttr(ariaLabel)}">`
      + `<span class="step-status" aria-hidden="true">${statusIcon}</span>`
      + `<span class="step-label">${escHtml(label)}</span>`
      + `<span class="step-chev" aria-hidden="true">&#x25B6;</span>`
      + `</button>`
      + `<div class="step-detail"><span class="st-text">${text2}</span><div class="step-body">${playSeqHtml}${chordsHtml}${tabHtml}${tabsHtml}${drillHtml}${respHtml}${foldsHtml}</div>${doneBtn}</div>`
      + `</li>`;
   }).join('');
  };
  /* Generic tuning warm-up sections are superseded by the Daily 5 (which
     starts with the tune-up): render a pointer card above the numbered
     sections instead of taking a numbered slot itself. */
  const isTuningWarmup = sec => isTuningWarmupSection(sec, w.moduleNum);
  // Steps done / total for a station's progress pill — mirrors stepsHtml's ns-per-section scheme.
  const stationStepCounts = (id,s) => {
    let total=0, done=0;
    const count=(steps,ns)=>steps.forEach((st,idx)=>{
      total++;
      if(completed[`${w.id}-${ns}-${idx}`]===true) done++;
    });
    if(s.sections && s.sections.length){
      s.sections.filter(sec=>!isTuningWarmup(sec)).forEach((sec,gi)=>count(sec.steps, `${id}-sec${gi}`));
    } else if(s.steps){
      count(s.steps, id);
    }
    return {total,done};
  };
  const sectionsHtml=(sections,baseNs)=>{
    const reminder = sections.some(isTuningWarmup)
      ? `<div class="daily5-inline">${t('daily5.tuneWarmupHtml',{btn:`<button type="button" class="daily5-inline-btn" onclick="openDaily5Here()">&#x26A1; ${t('daily5.openToday')}</button>`})}</div>`
      : '';
    const real = sections.filter(sec => !isTuningWarmup(sec));
    // Sections are plain group labels now, not their own accordion — every
    // step across the whole station is a row from the start (Concept B: one
    // level of chunking, not two). `.stp-sec` still wraps each group so
    // deep links can address "section N, step K" without needing a card look.
    // Numbering runs continuously across sections (offset carries the running
    // total) even though storage keys stay section-local (`ns` + local `i`).
    // Only ONE step should be open at a time across the whole station, not
    // one per section — once an earlier section's current step has claimed
    // it, every later section (even ones with their own incomplete steps)
    // stays fully collapsed until the student works down to it.
    // Focus mode hides every section label except the one holding the open
    // step (`.sec-cur`, kept in sync by syncStationFocus() as the student
    // moves) — the heading of the group you're actually in, nothing else.
    let numOffset = 0, foundCur = false;
    const noneLeft = focusMode && !real.some((sec,gi)=>sec.steps.some((st,idx)=>completed[`${w.id}-${baseNs}-sec${gi}-${idx}`]!==true));
    return reminder + real.map((sec,gi)=>{
    const ns = `${baseNs}-sec${gi}`;
    const allowCur = !foundCur;
    const hasCur = allowCur && sec.steps.some((st,idx)=>completed[`${w.id}-${ns}-${idx}`]!==true);
    const openIfNoCur = noneLeft && gi === 0;   // whole station done → section 1, step 1 stays open
    const html = `<div class="stp-sec${(hasCur || openIfNoCur) ? ' sec-cur' : ''}">
      <div class="stp-sec-label">${tf(sec,'title')}</div>
      <ul class="steps">${stepsHtml(sec.steps, ns, numOffset, allowCur, openIfNoCur)}</ul>
    </div>`;
    if(hasCur) foundCur = true;
    numOffset += sec.steps.length;
    return html;
  }).join('');
  };
  const dp=(id,cls,badge,badgeClass,s)=>{
    const body = (s.sections && s.sections.length)
      ? sectionsHtml(s.sections, id)
      : `<ul class="steps">${stepsHtml(s.steps, id, 0, true, focusMode)}</ul>`;
    /* Stations don't have to happen in one sitting: first pass should be
       B→C (B teaches what C drills), but returning straight to C on a
       later day is spaced practice — say so, so nobody feels off-track. */
    const flexNote = (id==='c' && w.stations && w.stations.b)
      ? `<div class="st-flex-note">${t('note.firstTimeHtml',{btn:`<button type="button" class="st-note-link" onclick="switchTabById('${w.id}','station-b')">${t('nav.stationBTitle')}</button>`})}</div>`
      : '';
    const {total: stepTotal, done: stepDone} = stationStepCounts(id, s);
    const pillHtml = stepTotal > 0 ? `<span class="prog-pill" data-i18n="progress.stepsDone" data-i18n-params="${escAttr(JSON.stringify({done:stepDone,total:stepTotal}))}">${t('progress.stepsDone',{done:stepDone,total:stepTotal})}</span>` : '';
    /* Stepper bar: where-am-I counter (focus mode only) + the view toggle,
       which stays visible in BOTH views — it's the only way back to focus. */
    const countParams = {n: openNum || 1, m: stepTotal};
    const toggleKey = focusMode ? 'fm.listView' : 'fm.focusView';
    const stepperHtml = stepTotal > 0 ? `<div class="dp-stepper">`
      + `<span class="fm-count" aria-live="polite" data-i18n="fm.stepOf" data-i18n-params="${escAttr(JSON.stringify(countParams))}">${t('fm.stepOf', countParams)}</span>`
      + `<button type="button" class="fm-toggle" onclick="toggleStationView()" data-i18n="${toggleKey}">${t(toggleKey)}</button>`
      + `</div>` : '';
    /* Back/Next lives once per card at the very end: in focus mode every other
       row is display:none, so it lands directly under the open step's detail
       (no per-step copies to keep in sync). Hidden entirely in list mode. */
    const navHtml = stepTotal > 1 ? `<div class="dp-stepnav">`
      + `<button type="button" class="fm-nav fm-back" onclick="stationStepNav(this,-1)" data-i18n="fm.back"${(openNum || 1) <= 1 ? ' hidden' : ''}>${t('fm.back')}</button>`
      + `<button type="button" class="fm-nav fm-next" onclick="stationStepNav(this,1)" data-i18n="fm.next"${(openNum || 1) >= stepTotal ? ' hidden' : ''}>${t('fm.next')}</button>`
      + `</div>` : '';
    // .at-end drives whether the panel's "Next: My skills checklist" footer
    // shows in focus mode (CSS, styles.css) — only once there's no further
    // step to advance to, kept live by syncStationFocus() as the student moves.
    const atEnd = (openNum || 1) >= stepTotal;
    return `
    <div class="dp${cls}${focusMode ? ' focus' : ''}${atEnd ? ' at-end' : ''}" id="${w.id}-dp-${id}">
      <div class="dp-head"><span class="st-badge ${badgeClass}">${badge}</span><h3 class="dp-title">${tf(s,'title')}</h3>${pillHtml}</div>
      ${stepperHtml}
      ${flexNote}
      ${body}
      ${navHtml}
    </div>`;
  };
  // buildStations() is always called with an explicit stationId ('b' or
  // 'c' — confirmed by grep, both call sites pass one), so this used to
  // branch on a station-picker grid (with openSt() as its onclick handler)
  // that could never render. Removed 2026-07-26; openSt() removed with it.
  const s = stationId === 'b' ? w.stations.b : w.stations.c;
  const badge = stationId === 'b' ? t('nav.stationBTitle') : t('nav.stationCTitle');
  const badgeClass = stationId === 'b' ? 'bb' : 'bc';
  return dp(stationId, '', badge, badgeClass, s);
}

// "Mark done" ⇄ "✓ Done" — a state-and-language-dependent label, so the
// data-i18n key travels with the current state and a later pure language
// switch (no state change) still resolves to the right word.
function stepDoneHtml(isDone){
  return isDone
    ? `&#x2713; <span data-i18n="btn.doneWord" translate="no" class="notranslate">${t('btn.doneWord')}</span>`
    : `<span data-i18n="btn.markDone" translate="no" class="notranslate">${t('btn.markDone')}</span>`;
}
function toggleStepDone(btn, key){
  const li = btn.closest('.step');
  const nowDone = !li.classList.contains('step-done');
  li.classList.toggle('step-done', nowDone);
  btn.setAttribute('aria-pressed', nowDone);
  btn.innerHTML = stepDoneHtml(nowDone);
  const status = li.querySelector('.step-status');
  if(status) status.textContent = nowDone ? '✓' : (li.dataset.num || status.textContent);
  const head = li.querySelector('.step-head');
  const labelEl = li.querySelector('.step-label');
  if(head) head.setAttribute('aria-label', `Step ${li.dataset.num}${nowDone ? ', done' : ''} — ${labelEl ? labelEl.textContent : ''}`);
  // Un-marking done just updates the icon above — no forced expand/collapse.
  if(nowDone) collapseAndAdvance(li);
  onCompleteChange(key, nowDone);
  updateProgressPill(li);
}

/* ── Focus mode ("one at a time") ──────────────────────────────────────
   A site-wide view pref, not per-station: a student who wants one step on
   screen wants it everywhere. Unset = focus, so the default install opens
   on the calmer view; only an explicit 'list' opts out. */
function stationViewMode(){
  try{ return localStorage.getItem('stationView') === 'list' ? 'list' : 'focus'; }
  catch(e){ return 'focus'; }
}
function stationViewIsFocus(){ return stationViewMode() === 'focus'; }

/* Flip the pref and re-skin every card already on the page — the open step,
   the responses typed into it and any running drill all survive, so this
   never rebuilds. */
function toggleStationView(){
  const focus = !stationViewIsFocus();
  try{ localStorage.setItem('stationView', focus ? 'focus' : 'list'); }catch(e){}
  document.querySelectorAll('.dp').forEach(dp=>applyStationView(dp, focus));
  renderChordBoxes();
}
function applyStationView(dp, focus){
  dp.classList.toggle('focus', focus);
  /* Entering focus mode: land on exactly one row. List view can leave none
     open (everything collapsed → an empty card) or several ("Show me where"
     lights up every step that teaches a skill), so pick the first open one,
     or the first not-done step, and close the rest. */
  if(focus){
    const steps = [...dp.querySelectorAll('li.step')];
    const target = dp.querySelector('li.step:not(.collapsed)')
      || steps.find(li=>!li.classList.contains('step-done')) || steps[0];
    if(target){
      closeOtherStepsInDp(dp, target);
      target.classList.remove('collapsed');
      const h = target.querySelector('.step-head');
      if(h) h.setAttribute('aria-expanded','true');
    }
  }
  const toggle = dp.querySelector('.fm-toggle');
  if(toggle){
    const key = focus ? 'fm.listView' : 'fm.focusView';
    toggle.setAttribute('data-i18n', key);
    toggle.textContent = t(key);
  }
  syncStationFocus(dp);
}

/* Keep the focus-mode chrome pointed at whichever row is open: the one
   section label that shows, the "Step n of m" counter, and whether Back /
   Next are reachable. Safe (and cheap) to call in list mode too. */
function syncStationFocus(dp){
  if(!dp) return;
  const steps = [...dp.querySelectorAll('li.step')];
  const open = dp.querySelector('li.step:not(.collapsed)');
  const idx = open ? steps.indexOf(open) : -1;
  dp.querySelectorAll('.stp-sec').forEach(sec=>sec.classList.toggle('sec-cur', !!open && sec.contains(open)));
  const count = dp.querySelector('.fm-count');
  if(count){
    const params = {n: open ? (Number(open.dataset.num) || idx + 1) : 1, m: steps.length};
    count.setAttribute('data-i18n-params', JSON.stringify(params));
    count.textContent = t('fm.stepOf', params);
  }
  dp.classList.toggle('at-end', idx < 0 || idx >= steps.length - 1);
  const nav = dp.querySelector('.dp-stepnav');
  if(nav){
    const back = nav.querySelector('.fm-back'), next = nav.querySelector('.fm-next');
    if(back) back.hidden = idx <= 0;
    if(next) next.hidden = idx < 0 || idx >= steps.length - 1;
  }
}

/* Back / Next: move the open row across the WHOLE card (sections included)
   without touching done state — reading ahead isn't the same as finishing. */
function stationStepNav(btn, dir){
  const dp = btn.closest('.dp');
  if(!dp) return;
  const steps = [...dp.querySelectorAll('li.step')];
  const open = dp.querySelector('li.step:not(.collapsed)');
  const idx = open ? steps.indexOf(open) : -1;
  const target = idx < 0 ? steps[0] : steps[idx + dir];
  if(!target) return;
  expandStepEl(target);
  nudgeStepIntoView(target, true);
}

/* Collapsing a taller open step ABOVE this one shortens the page, which
   can yank the just-opened step up under the sticky header. After layout
   settles, nudge it back into view — scroll-margin-top (styles.css) makes
   scrollIntoView land below the header, not at viewport top. `force` also
   pulls a step that landed BELOW the fold up (Back/Next navigation). */
function nudgeStepIntoView(li, force){
  if(!li) return;
  requestAnimationFrame(()=>{
    const hdr = document.querySelector('.header');
    const hdrH = hdr ? hdr.offsetHeight : 0;
    const top = li.getBoundingClientRect().top;
    if(top < hdrH || (force && top > window.innerHeight - 80)) li.scrollIntoView({block:'start'});
  });
}

// Close every other step in the whole card, leaving `keep` untouched. Card-wide,
// not per-section: two sections could each hold an open step otherwise, which is
// exactly one step too many in either view.
function closeOtherStepsInDp(root, keep){
  if(!root) return;
  root.querySelectorAll('li.step').forEach(other=>{
    if(other===keep) return;
    other.classList.add('collapsed');
    const h = other.querySelector('.step-head');
    if(h) h.setAttribute('aria-expanded','false');
  });
}
// A step always lives inside a .dp; the ul fallback just keeps this honest.
function stepScope(li){ return li.closest('.dp') || li.closest('ul.steps'); }

function toggleStepOpen(btn){
  const li = btn.closest('.step');
  const dp = li.closest('.dp');
  const willOpen = li.classList.contains('collapsed');
  /* In focus mode the head is the open step's HEADING, not a collapse
     control — closing it would leave the card blank, so taps no-op. */
  if(!willOpen && dp && dp.classList.contains('focus')) return;
  closeOtherStepsInDp(stepScope(li), li);
  li.classList.toggle('collapsed', !willOpen);
  btn.setAttribute('aria-expanded', String(willOpen));
  syncStationFocus(dp);
  renderChordBoxes();
  if(willOpen) nudgeStepIntoView(li);
}

/* Deep links (search, "Show me where") land on a collapsed row — open it in
   place. `keepOthers` lets one caller (showSkillLesson in list view) light up
   several rows at once; everything else keeps the single-open rule. */
function expandStepEl(li, keepOthers){
  if(!li) return;
  if(!keepOthers) closeOtherStepsInDp(stepScope(li), li);
  li.classList.remove('collapsed');
  const head = li.querySelector('.step-head');
  if(head) head.setAttribute('aria-expanded','true');
  syncStationFocus(li.closest('.dp'));
  renderChordBoxes();
}

// Mark done: collapse this row, drop its .cur badge, and open the next not-done step.
function collapseAndAdvance(li){
  const dp = li.closest('.dp');
  const scope = stepScope(li);
  const steps = scope ? [...scope.querySelectorAll('li.step')] : [li];
  // `.cur` is "the resume point", so exactly one row wears it card-wide —
  // marking a step done out of order used to leave a second one behind.
  steps.forEach(st=>st.classList.remove('cur'));
  // Card-wide, so finishing a section's last step advances into the next one
  // instead of dead-ending at the section boundary.
  const next = steps.slice(steps.indexOf(li)+1).find(sib=>!sib.classList.contains('step-done'));
  const focus = !!dp && dp.classList.contains('focus');
  // Nothing left to advance to: focus mode would go blank, so the finished
  // step stays open with its ✓. List mode collapses it as it always has.
  if(next || !focus){
    li.classList.add('collapsed');
    const head = li.querySelector('.step-head');
    if(head) head.setAttribute('aria-expanded','false');
  }
  if(next){
    next.classList.remove('collapsed');
    next.classList.add('cur');
    const nh = next.querySelector('.step-head');
    if(nh) nh.setAttribute('aria-expanded','true');
    if(focus) nudgeStepIntoView(next);
  }
  syncStationFocus(dp);
  renderChordBoxes();
}

function updateProgressPill(li){
  const dp = li.closest('.dp');
  const pill = dp && dp.querySelector('.prog-pill');
  if(!pill) return;
  const total = dp.querySelectorAll('li.step').length;
  const done = dp.querySelectorAll('li.step.step-done').length;
  pill.setAttribute('data-i18n-params', JSON.stringify({done, total}));
  pill.textContent = t('progress.stepsDone', {done, total});
}

/* ── Songs ── */
function diffLabel(level){
  return level===1 ? t('songs.diff1') : level===2 ? t('songs.diff2') : level===3 ? t('songs.diff3') : '';
}
function diffDotsHtml(level){
  if(!level) return '';
  const lbl = diffLabel(level);
  const filled = '●'.repeat(level);            // ●
  const empty  = '○'.repeat(Math.max(0,3-level)); // ○
  const title = `${t('songs.difficulty')}: ${lbl}`;
  return `<span class="song-diff diff-${level}" title="${escAttr(title)}" aria-label="${escAttr(title)}">${filled}<span class="song-diff-empty">${empty}</span></span> `;
}
function songVidButtonsHtml(s, onclickFor){
  const vids = [];
  if(s.originalUrl) vids.push(`<button class="song-vid-btn" onclick="${onclickFor('original')}" title="${escAttr(t('songs.opensYoutube'))}"><span class="svb-play">&#x25B6;</span>${t('songs.original')} <span style="font-size:0.6875rem;opacity:0.6">&#x2197;</span></button>`);
  if(s.tutorialUrl) vids.push(`<button class="song-vid-btn tut" onclick="${onclickFor('tutorial')}"><span class="svb-play">&#x25B6;</span>${t('songs.tutorial')}</button>`);
  if(s.backingUrl) vids.push(`<button class="song-vid-btn" onclick="${onclickFor('backing')}" title="${escAttr(t('songs.jamTrackTitle'))}"><span class="svb-play">&#x25B6;</span>&#x1F3B5; ${t('songs.backingTrack')}${s.backingKey?` (${s.backingKey})`:''}</button>`);
  return vids;
}
function buildSongs(w){
  const rows=w.songs.map((s,i)=>{
    const nameEl = s.url ? `<button class="rp-trigger" onclick="loadSong('${w.id}',${i})">${s.name}</button>` : s.name;
    const vids = songVidButtonsHtml(s, kind=>`loadSongVid('${w.id}',${i},'${kind}')`);
    // Song Journey pages are same-origin (tabs/*.html), opened in a new tab so app state stays put.
    if(s.journeyUrl) vids.push(`<button class="song-vid-btn" onclick="window.open('${s.journeyUrl}','_blank','noopener')" title="${escAttr(t('songs.oneSongLayers'))}">&#x1F9F5; ${t('songs.songJourney')}</button>`);
    const vidsEl = vids.length ? `<div class="song-vids">${vids.join('')}</div>` : '';
    return `<div class="song-row"><div class="dot ${s.core?'dc':'dch'}"></div><div><div class="sname">${nameEl}</div><div class="smeta">${diffDotsHtml(s.level)}${tf(s,'meta')}</div></div>${vidsEl}<span class="stag ${s.core?'stag-core':''}"${vids.length?'':' style="margin-left:auto"'}>${s.type}</span></div>`;
  }).join('');
  const requestSlot = `<div class="song-row song-request"><div class="song-request-ico">&#x1F3A4;</div><div><div class="sname">${t('songs.yourPick')}</div><div class="smeta">${t('songs.yourPickBody')}</div></div></div>`;
  const diffLegend = `<div class="leg"><span class="song-diff diff-1">&#x25CF;<span class="song-diff-empty">&#x25CB;&#x25CB;</span></span>&#x2192;<span class="song-diff diff-3">&#x25CF;&#x25CF;&#x25CF;</span> ${t('songs.diffLegend')}</div>`;
  return `<div class="legend"><div class="leg"><div class="dot dc" style="margin-top:0"></div>${t('songs.core')}</div><div class="leg"><div class="dot dch" style="margin-top:0"></div>${t('songs.choice')}</div>${diffLegend}</div><div class="card">${rows}${requestSlot}</div>`;
}

function loadSong(wid, idx){
  const w=SETS.find(x=>x.id===wid); if(!w) return;
  const s=w.songs[idx]; if(!s||!s.url) return;
  loadPanel('youtube', s.url, s.name, s.type);
}

/* THE song-video launcher — every song list (per-set, Songs hub)
   routes through this so the kind dispatch and subtitles can't drift. */
function openSongVid(s, kind){
  if(!s) return;
  if(kind==='journey'){ if(s.journeyUrl) window.open(s.journeyUrl, '_blank', 'noopener'); return; }
  if(kind==='original'){ if(s.originalUrl) window.open(s.originalUrl, '_blank', 'noopener'); return; }
  if(kind==='backing'){ if(s.backingUrl) loadPanel(/\.(mp3|m4a|ogg|wav)(\?|$)/i.test(s.backingUrl)?'audio':'youtube', s.backingUrl, s.name, t('songs.backingTrackHint')); return; }
  if(s.tutorialUrl) loadPanel('youtube', s.tutorialUrl, s.name, t('songs.tutorial'));
}
function loadSongVid(wid, idx, kind){
  const w=SETS.find(x=>x.id===wid); if(!w) return;
  openSongVid(w.songs[idx], kind);
}
/* ── 10-Minute Routine card (module review) + Daily 5 panel ──
   Both assemble themselves from the module's already-loaded SETS data, so
   future content edits propagate automatically. Read-only: no Firebase writes. */
function stripTags(html){
  const d=document.createElement('div');
  // Insert a space at block/line-break boundaries before flattening, so a
  // lead-in ending in ":" doesn't abut the first <li> in one-line previews
  // ("…(every session): When you're not…" — not "…(every session):When…").
  d.innerHTML=(html||'').replace(/<\/?(?:p|div|li|ol|ul|h[1-6]|tr|table|blockquote|br|hr)\b[^>]*>/gi, '$& ');
  return (d.textContent||'').replace(/\s+/g,' ').trim();
}
function truncateText(s, n){ if(s.length<=n) return s; const cut=s.slice(0,n); return cut.slice(0, Math.max(cut.lastIndexOf(' '), n-20))+'…'; }
// Short one-line label for a step's collapsed checklist row.
// Every step now carries a hand-written label/label_es (enforced by
// checks.mjs for i18nComplete modules) — the derivation below is only a
// fallback so a future unlabeled step still gets a usable header instead
// of a blank row.
function stepLabel(s){
  const lbl = (tf(s,'label') || '').trim();
  if(lbl) return lbl;
  const plain = stripTags(tf(s,'text') || '').trim();
  if(!plain && s.response && s.response.prompt) return truncateText(stripTags(tf(s.response,'prompt')), 60);
  // English "Challenge N — X:" / Spanish "Reto N — X:" both strip down to just X.
  const challengeMatch = plain.match(/^(?:Challenge|Reto)\s*\d*\s*[—-]\s*([^:]+):/);
  if(challengeMatch) return truncateText(challengeMatch[1].trim(), 60);
  // "Lead-in (aside): directions…" → just the lead-in, aside dropped.
  const leadIn = plain.match(/^([^:.!?]{3,60}?)(?:\s*\([^)]*\))?\s*:\s/);
  if(leadIn) return truncateText(leadIn[1].trim(), 60);
  return truncateText(plain, 60);
}
// Every step in a module, in document order, with its set + section context.
function moduleStepsFlat(moduleNum){
  const out=[];
  SETS.filter(w=>w.moduleNum===moduleNum && !w.comingSoon).forEach(w=>{
    ['b','c'].forEach(st=>{
      const stn=w.stations && w.stations[st]; if(!stn) return;
      const sections=stn.sections || (stn.steps ? [{title:'', steps:stn.steps}] : []);
      sections.forEach(sec=>(sec.steps||[]).forEach(step=>out.push({set:w, station:st, secTitle:sec.title||'', step})));
    });
  });
  return out;
}
function routinePlaySeq(ps, key){
  const bpm=readStoredBpm(key, ps.bpm||60);
  const hasHolds = (ps.notes || []).some(n => n && typeof n === 'object' && !Array.isArray(n));
  return `<span class="bpm-control-group">`+
    `<button type="button" class="play-seq-btn" data-midis="${escAttr(JSON.stringify(ps.notes))}" onclick="playSequenceFromGroup(this)" title="${escAttr(t('routine.playIt'))}">&#x25B6; ${escHtml((ps.label && tf(ps,'label')) || t('routine.playIt'))}</button>`+
    renderBpmControl(key, bpm, ps.minBpm||40, ps.maxBpm||120)+(hasHolds ? '' : coachBtnHtml(JSON.stringify(ps.notes)))+`</span>`;
}
function buildModuleRoutine(moduleNum){
  const steps=moduleStepsFlat(moduleNum);
  if(!steps.length) return '';
  const sets=SETS.filter(w=>w.moduleNum===moduleNum && !w.comingSoon);
  // Skill drill: the LAST set's first playSeq step (latest material = the
  // "hardest drill" heuristic), walking back set by set if needed.
  let drill=null;
  for(let i=sets.length-1; i>=0 && !drill; i--){
    drill=steps.find(x=>x.set===sets[i] && x.step.playSeq)||null;
  }
  // Chord / scale work: first step with a chords: spec; else the module's
  // first playSeq that isn't already the drill.
  let chordWork=steps.find(x=>x.step.chords && x.step.chords.length)||null;
  if(!chordWork){ chordWork=steps.find(x=>x.step.playSeq && x!==drill)||null; }
  // Song: the most recent "Take It to a Song" step.
  const songSteps=steps.filter(x=>/take it to a song/i.test(x.secTitle) || /take it to a song/i.test(x.step.text||''));
  const song=songSteps.length ? songSteps[songSteps.length-1] : null;
  const wu=WARMUP_BANK[moduleNum % WARMUP_BANK.length];
  const li=(mins, title, body)=>`<li class="routine-item"><span class="routine-min">${mins} min</span><div class="routine-body"><strong>${title}</strong> ${body}</div></li>`;
  const setLink=(x)=>`<button type="button" class="mr-review-link" onclick="goToSet('${x.set.id}')" title="${escAttr(t('routine.openThisSet'))}">&#8617; ${escHtml(x.set.label)}</button>`;
  let items='';
  items+=li(1,t('routine.tuneUp'),t('routine.tuneUpBody'));
  items+=li(1,t('routine.fingerGym'),`&mdash; ${escHtml(tf(wu,'text'))}<br>${routinePlaySeq(wu, `bpm:routine:${moduleNum}:wu`)}`);
  if(drill) items+=li(3,t('routine.skillDrill'),`&mdash; ${escHtml(truncateText(stripTags(tf(drill.step,'text')),180))} ${setLink(drill)}<br>${routinePlaySeq(drill.step.playSeq, `bpm:routine:${moduleNum}:drill`)}`);
  if(chordWork && chordWork!==drill){
    const c=chordWork.step;
    const inner=c.chords && c.chords.length
      ? `&mdash; ${escHtml(truncateText(stripTags(tf(c,'text')),180))} ${setLink(chordWork)}<div class="chord-diagrams">${c.chords.map(ch=>`<div class="chord-box">${chordDiagramSVG(ch)}${ch.name?`<div class="chord-box-label">${ch.name}</div>`:''}</div>`).join('')}</div>`
      : `&mdash; ${escHtml(truncateText(stripTags(tf(c,'text')),180))} ${setLink(chordWork)}<br>${routinePlaySeq(c.playSeq, `bpm:routine:${moduleNum}:chords`)}`;
    items+=li(3,t('routine.chordScaleWork'),inner);
  }
  if(song) items+=li(2,t('routine.song'),`&mdash; ${escHtml(truncateText(stripTags(tf(song.step,'text')),220))} ${setLink(song)}`);
  return `<div class="routine-card">
    <div class="routine-head">
      <span class="routine-title">&#x1F552; ${t('routine.title')}</span>
      <button type="button" class="routine-print-btn" onclick="printRoutine()" title="${escAttr(t('routine.printTitle'))}">&#x1F5A8; ${t('routine.print')}</button>
    </div>
    <ol class="routine-list">${items}</ol>
    <div class="routine-foot">${t('routine.foot')}</div>
  </div>`;
}
function printRoutine(){
  document.body.classList.add('print-routine');
  const done=()=>{ document.body.classList.remove('print-routine'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
}
/* Daily 5 — today's 5-minute warm-up for the current module. Same drill for
   everyone on the same date (rotated by day of year). Read-only. */
function dayOfYear(){ const now=new Date(); return Math.floor((now-new Date(now.getFullYear(),0,0))/86400000); }
function buildDaily5(){
  const num=parseInt(document.getElementById('module-select').value)||1;
  const doy=dayOfYear();
  const wu=WARMUP_BANK[doy % WARMUP_BANK.length];
  const seqSteps=moduleStepsFlat(num).filter(x=>x.step.playSeq);
  const pick=seqSteps.length ? seqSteps[doy % seqSteps.length] : null;
  const li=(mins,title,body)=>`<li class="routine-item"><span class="routine-min">${mins} min</span><div class="routine-body"><strong>${title}</strong> ${body}</div></li>`;
  let items='';
  items+=li(1,t('routine.tuneUp'),t('daily5.tuneUpBody'));
  items+=li(2,t('daily5.warmUp'),`&mdash; ${escHtml(tf(wu,'text'))}<br>${routinePlaySeq(wu,'bpm:daily5:wu')}`);
  if(pick) items+=li(2,t('daily5.todaysDrill'),`&mdash; ${t('daily5.fromModule',{num, set: tSetLabel(pick.set.label)})} ${escHtml(truncateText(stripTags(tf(pick.step,'text')),160))}<br>${routinePlaySeq(pick.step.playSeq,'bpm:daily5:drill')}`);
  const streakChip = streak.count > 1
    ? `<span class="games-card-best">&#x1F525; ${t('daily5.streak',{n:streak.count})}</span>` : '';
  return `<div class="daily5-head"><div style="display:flex;align-items:center;gap:8px"><h3 style="font:inherit;margin:0">&#x26A1; ${t('daily5.title')}</h3>${streakChip}</div><button type="button" class="tp-close" onclick="closeDaily5()" aria-label="${escAttr(t('daily5.closeAria'))}">&#x2715;</button></div>
    <ol class="routine-list">${items}</ol>`;
}
/* Station C's warm-up card opens the Daily 5 as a popup over the activities —
   close it and you're exactly where you left off, no scrolling to the top. */
function openDaily5Here(){
  closeDaily5();
  const ov=document.createElement('div');
  ov.className='daily5-overlay';
  ov.id='daily5-overlay';
  ov.innerHTML=`<div class="daily5-modal" role="dialog" aria-modal="true" aria-label="${escAttr(t('daily5.title'))}">${buildDaily5()}</div>`;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeDaily5(); });
  document.body.appendChild(ov);
  document.addEventListener('keydown', daily5EscClose);
}
function daily5EscClose(e){ if(e.key==='Escape') closeDaily5(); }
function closeDaily5(){
  const ov=document.getElementById('daily5-overlay');
  if(ov) ov.remove();
  document.removeEventListener('keydown', daily5EscClose);
}

/* ── Module Review (self-assessment) ── */
function buildModuleReview(mr){
  const savedKey=`mr${mr.moduleNum}-reflection`;
  const saved=progress[savedKey]||{};
  const perfKey=`mr${mr.moduleNum}-performance`;
  const perf=progress[perfKey]||{};
  const mrId=`mr${mr.moduleNum}`;
  let qNum = 0;
  const rows=mr.skills.map(s=>{
    qNum++;
    const lvl=progress[s.id];
    const btn=(n)=>`<button class="mr-rb lvl${n}${lvl===String(n)?' active':''}" onclick="setSkillLevel('${s.id}','${mrId}','${n}')">${n}</button>`;
    const reviewLink = s.set
      ? `<button type="button" class="mr-review-link" onclick="goToSet('${s.set}')" title="${escAttr(t('review.backToLesson'))}">&#8617; ${t('review.reviewThis')}</button>`
      : '';
    return `<div class="mr-row">
      <div class="mr-skill-text"><span class="mr-q-num">${qNum}.</span> ${tf(s,'text')}${reviewLink}</div>
      <div class="mr-rating">${btn(1)}${btn(2)}${btn(3)}</div>
    </div>`;
  }).join('');
  const clickedNum = ++qNum;
  const hardNum = ++qNum;
  const playNum = ++qNum;
  const pLvl=perf.level;
  const pBtn=(n)=>`<button class="mr-rb lvl${n}${pLvl===String(n)?' active':''}" onclick="setPerformanceLevel(${mr.moduleNum},'${n}')">${n}</button>`;
  const playHtml=`<div class="mr-play">
      <span class="mr-play-tag">&#x1F3B8; <span class="mr-q-num">${playNum}.</span> ${t('review.playRecord')}</span>
      <div class="mr-play-prompt">${t('review.playPrompt')}</div>
      <label class="mr-play-label" for="${mrId}-song">${t('review.songIPlayed')}</label>
      <input type="text" id="${mrId}-song" class="mr-play-song" oninput="savePerformance(${mr.moduleNum})" value="${escAttr(perf.song||'')}">
      <div class="mr-rec" data-module="${mr.moduleNum}">
        <div class="mr-rec-body" id="${mrId}-rec-body">${renderRecBody(String(mr.moduleNum))}</div>
      </div>
      <div class="mr-play-rate">
        <span class="mr-play-rate-label">${t('review.howDidItGo')}</span>
        <div class="mr-rating">${pBtn(1)}${pBtn(2)}${pBtn(3)}</div>
      </div>
    </div>`;
  const assessItemsEs = tf(mr,'assessItems');
  const assessBody = (mr.assessItems && mr.assessItems.length)
    ? `${t('review.assessBodyItems')}<ul class="mr-assess-list">${mr.assessItems.map((i,ii)=>`<li>${assessItemsEs[ii]}</li>`).join('')}</ul>`
    : t('review.assessBodyDflt');
  const performanceHtml=`<div class="mr-assess-box">
      <div class="mr-assess-head"><span class="mr-assess-icon">&#x1F4DD;</span> ${t('review.assessHead',{n:mr.moduleNum})}</div>
      <div class="mr-assess-body">${assessBody}</div>
      <div class="mr-rec mr-assess-rec" data-module="${mr.moduleNum}">
        <div class="mr-assess-rec-tag">&#x1F399; ${t('review.assessRecTag')}</div>
        <div class="mr-rec-body" id="${mrId}a-rec-body">${renderRecBody(`${mr.moduleNum}a`)}</div>
      </div>
      <div class="mr-assess-signup">
        <span class="mr-assess-signup-icon">&#x1F64B;</span>
        <div class="mr-assess-signup-text"><strong>${t('review.assessSignupHead')}</strong> ${t('review.assessSignupBody',{n:mr.moduleNum})}</div>
      </div>
    </div>`;
  const forwardHtml = mr.forward
    ? `<div class="ablock mr-forward" style="margin-top:12px"><div class="albl">&#x1F517; ${t('review.whyMatters')}</div><div class="atxt">${tf(mr,'forward')}</div></div>`
    : '';
  return `
    ${buildModuleRoutine(mr.moduleNum)}
    <div class="mr-locked-banner">
      <span class="mr-locked-banner-icon">&#x1F512;</span>
      <div><strong>${t('review.previewOnly')}</strong> ${t('review.previewBodyHtml')}</div>
    </div>
    <div class="obj-card">
      <span class="mr-tag">${t('review.tag',{n:mr.moduleNum})}</span>
      <h2 class="obj-main">${tf(mr,'module')}</h2>
      <div class="obj-sub">${t('review.rateReflect')}</div>
    </div>
    <div class="mr-skills">${rows}</div>
    <div class="mr-legend">
      <span class="mr-legend-item"><span class="mr-legend-dot lvl1"></span>1 = <span data-i18n="skill.stillLearning">${t('skill.stillLearning')}</span></span>
      <span class="mr-legend-item"><span class="mr-legend-dot lvl2"></span>2 = <span data-i18n="skill.gettingIt">${t('skill.gettingIt')}</span></span>
      <span class="mr-legend-item"><span class="mr-legend-dot lvl3"></span>3 = <span data-i18n="skill.gotItShort">${t('skill.gotItShort')}</span></span>
    </div>
    <div class="ablock" style="margin-top:18px">
      <div class="albl"><span class="mr-q-num">${clickedNum}.</span> ${t('review.whatClicked')}</div>
      <textarea id="${mrId}-clicked" class="reflection-ta" placeholder="${escAttr(t('review.whatClickedPh'))}" oninput="saveReflection(${mr.moduleNum})">${escHtml(saved.clicked||'')}</textarea>
    </div>
    <div class="ablock" style="margin-top:12px">
      <div class="albl"><span class="mr-q-num">${hardNum}.</span> ${t('review.whatsHard')}</div>
      <textarea id="${mrId}-hard" class="reflection-ta" placeholder="${escAttr(t('review.whatsHardPh'))}" oninput="saveReflection(${mr.moduleNum})">${escHtml(saved.hard||'')}</textarea>
    </div>
    ${playHtml}
    ${performanceHtml}
    ${forwardHtml}
    <div class="ablock" style="margin-top:12px">
      <div class="albl">${t('assess.standards')}</div>
      <div>${mr.standards.map(s=>`<span class="spill">${s}</span>`).join('')}</div>
    </div>
    <div class="save-ind" id="${mrId}-save-ind" style="margin-top:10px" aria-live="polite"></div>`;
}

/* Jump from a module-review skill back to the lesson set that teaches it. */
function goToSet(setId){
  lastSetId = setId;
  activateSet(setId);
  saveProgress();
  const pill = document.querySelector(`.wpill[data-id="${setId}"]`);
  if(pill) pill.scrollIntoView({block:'nearest', inline:'nearest'});
  // activateSet() already restored this set's scroll (or top on first open).
}

function isReviewPanelLocked(mrId){
  const panel = document.querySelector(`.week-panel[data-id="${mrId}"]`);
  return !!(panel && panel.classList.contains('mr-locked'));
}

function saveReflection(moduleNum){
  if(isReviewPanelLocked(`mr${moduleNum}`)) return;
  const clicked=document.getElementById(`mr${moduleNum}-clicked`).value;
  const hard=document.getElementById(`mr${moduleNum}-hard`).value;
  const key=`mr${moduleNum}-reflection`;
  progress[key]={clicked,hard};
  saveProgress();
}

function setSkillLevel(sid, mrId, level){
  if(isReviewPanelLocked(mrId)) return;
  progress[sid] = (progress[sid] === level) ? 'none' : level;
  const lvl = progress[sid];
  document.querySelectorAll(`.week-panel[data-id="${mrId}"] .mr-row`).forEach(row=>{
    const btns = row.querySelectorAll('.mr-rb');
    if(!btns.length) return;
    const onclick = btns[0].getAttribute('onclick') || '';
    if(!onclick.includes(`'${sid}'`)) return;
    btns.forEach(b=>{
      const n = b.classList.contains('lvl1') ? '1' : b.classList.contains('lvl2') ? '2' : '3';
      b.classList.toggle('active', lvl === n);
    });
  });
  saveProgress();
}

function savePerformance(moduleNum){
  if(isReviewPanelLocked(`mr${moduleNum}`)) return;
  const key=`mr${moduleNum}-performance`;
  const songEl=document.getElementById(`mr${moduleNum}-song`);
  const cur=progress[key]||{};
  progress[key]={song:songEl?songEl.value:'', level:cur.level||null};
  saveProgress();
}

function setPerformanceLevel(moduleNum, level){
  if(isReviewPanelLocked(`mr${moduleNum}`)) return;
  const key=`mr${moduleNum}-performance`;
  const cur=progress[key]||{};
  const newLvl=(cur.level===level)?null:level;
  progress[key]={song:cur.song||'', level:newLvl};
  const rate=document.querySelector(`.week-panel[data-id="mr${moduleNum}"] .mr-play-rate .mr-rating`);
  if(rate){
    rate.querySelectorAll('.mr-rb').forEach(b=>{
      const n=b.classList.contains('lvl1')?'1':b.classList.contains('lvl2')?'2':'3';
      b.classList.toggle('active', newLvl===n);
    });
  }
  saveProgress();
}

/* ══════════════════════════════════════════════
   RECORD YOURSELF — MediaRecorder
   One in-memory state object per recorder SLOT. A slot is a string key:
   the module number ("3") for the "Play it & Record it!" widget, and
   "<n>a" ("3a") for the assessment practice-run widget in the same panel.
   Two slots in one panel record independently.
   ══════════════════════════════════════════════ */
const recState = {};
const REC_MAX_SECS = 90;

/* Renders the current state of one recorder slot.
   Recordings are kept only in-memory for the current browser tab —
   nothing is uploaded. Students can play back and Download. */
function renderRecBody(slot){
  const s = recState[slot] || {};
  if (s.recording){
    return `<div class="mr-rec-active">
      <span class="mr-rec-dot"></span>
      <span class="mr-rec-time" id="mr${slot}-rec-time">0:00</span>
      <button type="button" class="mr-rec-stop" onclick="stopRec('${slot}')">&#x25A0; ${t('rec.stop')}</button>
      <span class="mr-rec-max">${t('rec.max',{s:REC_MAX_SECS})}</span>
    </div>`;
  }
  if (s.pendingBlobUrl){
    return `<div class="mr-rec-preview">
      <audio controls src="${s.pendingBlobUrl}" class="mr-rec-audio"></audio>
      <div class="mr-rec-actions">
        <button type="button" class="mr-rec-btn" onclick="downloadRec('${slot}')">&#x2B07; ${t('rec.download')}</button>
        <button type="button" class="mr-rec-btn" onclick="discardRec('${slot}')">&#x21BB; ${t('rec.rerecord')}</button>
      </div>
      <div class="mr-rec-status">${t('rec.listenBack')}</div>
    </div>`;
  }
  return `<div class="mr-rec-idle">
    <button type="button" class="mr-rec-btn primary" onclick="startRec('${slot}')">&#x1F399; ${t('rec.record')}</button>
    <span class="mr-rec-help">${t('rec.help',{s:REC_MAX_SECS})}</span>
  </div>`;
}

function refreshRecUI(slot){
  const host = document.getElementById(`mr${slot}-rec-body`);
  if (!host) return;
  host.innerHTML = renderRecBody(slot);
}

async function startRec(slot){
  if (!navigator.mediaDevices || !window.MediaRecorder){
    alert(t('rec.noSupport'));
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    recorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
      const s = recState[slot] || {};
      s.recording = false;
      s.pendingBlob = blob;
      s.pendingBlobUrl = URL.createObjectURL(blob);
      s.statusMsg = '';
      if (s.timerInterval){ clearInterval(s.timerInterval); s.timerInterval = null; }
      if (s.autoStopTimeout){ clearTimeout(s.autoStopTimeout); s.autoStopTimeout = null; }
      recState[slot] = s;
      refreshRecUI(slot);
    };
    const start = Date.now();
    recState[slot] = {
      recording: true,
      recorder,
      stream,
      startedAt: start,
      timerInterval: setInterval(() => {
        const el = document.getElementById(`mr${slot}-rec-time`);
        if (!el) return;
        const sec = Math.floor((Date.now() - start) / 1000);
        el.textContent = `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
      }, 250),
      autoStopTimeout: setTimeout(() => stopRec(slot), REC_MAX_SECS * 1000)
    };
    recorder.start();
    refreshRecUI(slot);
  } catch (err) {
    alert(t('rec.micFail', {err: err.message || err.name || 'permission denied'}));
  }
}

function stopRec(slot){
  const s = recState[slot];
  if (!s || !s.recorder) return;
  if (s.recorder.state !== 'inactive') s.recorder.stop();
}

/* Navigating away mid-recording would otherwise leave the mic live for up
   to REC_MAX_SECS — every other mic feature on the site stops on navigation,
   so the recorder does too. Called from activateSet. */
function stopAnyRec(){
  Object.keys(recState).forEach(m => {
    if (recState[m] && recState[m].recording) stopRec(m);
  });
}

function discardRec(slot){
  const s = recState[slot];
  if (s && s.pendingBlobUrl) URL.revokeObjectURL(s.pendingBlobUrl);
  delete recState[slot];
  refreshRecUI(slot);
}

function downloadRec(slot){
  const s = recState[slot];
  if (!s || !s.pendingBlobUrl) return;
  const a = document.createElement('a');
  a.href = s.pendingBlobUrl;
  a.download = `guitar-class-mr${slot}-${new Date().toISOString().slice(0,10)}.webm`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ── Checklist ── */
function buildChecklist(w){
  if(!w.skills||w.skills.length===0) return `<p style="font-size:0.9375rem;color:var(--text2);padding:12px 0">${t('skill.noneListed')}</p>`;
  const done=w.skills.filter(s=>progress[s.id]==='gotit').length;
  const pct=Math.round(done/w.skills.length*100);
  const wkSvg=`<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" stroke="var(--amber-text)" stroke-width="1.5"/><path d="M6 4v2.2l1.4 1.4" stroke="var(--amber-text)" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  const giSvg=`<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="var(--green-text)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const rows=w.skills.map((s,i)=>{
    const st=progress[s.id]||'none';
    const skillText = tf(s,'text');
    const helper = s.gotItWhen ? `
        <button type="button" class="sk-toggle" onclick="toggleGotIt('${s.id}', this)" aria-expanded="false" aria-controls="gi-${s.id}"><span class="sk-toggle-arrow">▾</span> <span data-i18n="skill.whatDoesThisLookLike">${t('skill.whatDoesThisLookLike')}</span></button>
        <div class="sk-helper" id="gi-${s.id}" hidden><strong data-i18n="skill.youveGotItWhen">${t('skill.youveGotItWhen')}</strong> ${tf(s,'gotItWhen')}</div>` : '';
    const practiceBtn = s.practice ? `
        <button type="button" class="sk-practice-btn" onclick="togglePracticePanel('${s.id}', this)" aria-expanded="false" aria-controls="pp-${s.id}"><span class="sk-practice-btn-arrow">▸</span> ${t('step.practiceThis')}</button>` : '';
    const skillNum = (s.id.match(/-s(\d+)$/) || [])[1];
    const whereBtn = (skillNum && skillTaughtStation(w, Number(skillNum)))
      ? `<button type="button" class="sk-where-btn" onclick="showSkillLesson('${w.id}', ${skillNum})" title="${escAttr(t('skill.jumpToSteps'))}">&#x1F4CD; <span data-i18n="skill.showMeWhere">${t('skill.showMeWhere')}</span></button>` : '';
    const practicePanel = s.practice ? renderPracticePanel(s.practice, s.id, w.id) : '';
    return `<div class="skill-row" data-sid="${escAttr(s.id)}">
      <div class="sktxt"><div class="sn" style="flex-shrink:0;margin-top:0;margin-right:8px">${i+1}</div><div class="sk-body"><div class="sk-label">${skillText}</div>${helper}${practiceBtn}${whereBtn}</div></div>
      <div class="skchk-cell working-col${st==='working'?' active':''}" role="button" tabindex="0" aria-pressed="${st==='working'}" aria-label="${escAttr(t('skill.ariaStillWorking',{skill:skillText}))}" onclick="toggleSkill('${s.id}','${w.id}','working')" title="Still working on it" data-i18n-attr="title:skill.stillWorking"><div class="skbox">${st==='working'?wkSvg:''}</div></div>
      <div class="skchk-cell gotit-col${st==='gotit'?' active':''}" role="button" tabindex="0" aria-pressed="${st==='gotit'}" aria-label="${escAttr(t('skill.ariaGotIt',{skill:skillText}))}" onclick="toggleSkill('${s.id}','${w.id}','gotit')" title="I've got it!" data-i18n-attr="title:skill.gotIt"><div class="skbox">${st==='gotit'?giSvg:''}</div></div>
      ${practicePanel}
    </div>`;
  }).join('');
  return `<div class="review-slot" id="rc-${w.id}">${reviewCardHtml()}</div>
  <div class="cl-intro" data-i18n="skill.checklistIntro">${t('skill.checklistIntro')}</div>
  <div class="cl-grid-wrap">
    <div class="cl-header"><div class="cl-header-skill" data-i18n="skill.clHeaderSkill">${t('skill.clHeaderSkill')}</div><div class="cl-header-working" data-i18n-html="skill.clHeaderWorkingHtml">${t('skill.clHeaderWorkingHtml')}</div><div class="cl-header-gotit" data-i18n-html="skill.clHeaderGotItHtml">${t('skill.clHeaderGotItHtml')}</div></div>
    ${rows}
  </div>
  <div class="prog-wrap"><div class="prog-row"><div class="prog-bg"><div class="prog-fill" id="pf-${w.id}" style="width:${pct}%"></div></div><div class="prog-lbl" id="pl-${w.id}">${done} / ${w.skills.length}</div></div></div>
  <div class="song-echo" id="se-${w.id}" aria-live="polite"></div>
  <div class="save-ind" id="si-${w.id}" aria-live="polite"></div>`;
}

/* ── Toggle "What does this look like?" helper ── */
function toggleGotIt(sid, btn){
  const panel = document.getElementById('gi-'+sid);
  if(!panel) return;
  const isOpen = !panel.hasAttribute('hidden');
  if(isOpen){
    panel.setAttribute('hidden','');
    btn.setAttribute('aria-expanded','false');
  } else {
    panel.removeAttribute('hidden');
    btn.setAttribute('aria-expanded','true');
  }
}

/* ── Per-skill practice panel ── */
/* The playSeq row (▶ Play button + BPM slider + optional Listening Coach) is
   shared by the 'playSeq' panel and the 'fretboard' panel (which keeps the
   listen-through as a helper under the game). */
function playSeqControlsHtml(practice, skillId){
  const label = (practice.label && tf(practice,'label')) || t('step.playAll');
  const defBpm = practice.bpm || 60;
  const minBpm = practice.minBpm || 40;
  const maxBpm = practice.maxBpm || 120;
  const key = `bpm:practice:${skillId}`;
  const bpm = readStoredBpm(key, defBpm);
  const midis = JSON.stringify(practice.notes || []);
  const hasHolds = (practice.notes || []).some(n => n && typeof n === 'object' && !Array.isArray(n));
  return `<div class="bpm-control-group">` +
    `<button type="button" class="play-seq-btn" data-midis="${escAttr(midis)}" onclick="playSequenceFromGroup(this)" title="${escAttr(t('step.playAll'))}">&#x25B6; ${escHtml(label)}</button>` +
    renderBpmControl(key, bpm, minBpm, maxBpm) +
    (hasHolds ? '' : coachBtnHtml(midis, null, skillId)) +
  `</div>`;
}
function renderPracticePanel(practice, skillId, wid){
  if(!practice || !practice.type) return '';
  if(practice.type === 'playSeq'){
    return `<div class="sk-practice-panel" id="pp-${skillId}" hidden>` +
      `<div class="sk-practice-title">${t('step.practiceThis')}</div>` +
      renderRepStrip(skillId) +
      playSeqControlsHtml(practice, skillId) +
      `<div class="rep-actions"><button type="button" class="rep-log-btn" onclick="logCleanRep('${skillId}', this)">&#x2713; <span data-i18n="rep.logClean">${t('rep.logClean')}</span></button></div>` +
    `</div>`;
  }
  if(practice.type === 'fretboard'){
    /* Find-the-Note game: practice.string 'lowE' | 'A' | 'both' (see fgBoardSvg). */
    // A rebuild (language switch, panel re-render) puts the setup screen back
    // on top of whatever round was in flight — drop the stale state so the
    // student starts fresh, like the shuffle/deck/ear drills reset theirs.
    delete fretGames[skillId];
    const kind = practice.string || 'lowE';
    const e = practiceLog[skillId];
    const bestHtml = (e && e.best != null)
      ? `<span data-i18n="fret.best" data-i18n-params='{"n":${e.best},"total":${FG_ROUND}}'>${t('fret.best',{n:e.best,total:FG_ROUND})}</span>` : '';
    const playRow = (practice.notes && practice.notes.length) ? playSeqControlsHtml(practice, skillId) : '';
    return `<div class="sk-practice-panel" id="pp-${skillId}" hidden>` +
      `<div class="sk-practice-title">${t('step.practiceThis')}</div>` +
      renderRepStrip(skillId) +
      `<div class="fg-wrap" id="fg-${skillId}" data-kind="${escAttr(kind)}">` +
        `<div class="fg-head">` +
          `<div class="fg-status">` +
            `<span class="fg-intro" data-i18n-html="fret.introHtml" data-i18n-params='{"total":${FG_ROUND}}'>${t('fret.introHtml',{total:FG_ROUND})}</span>` +
            `<button type="button" class="fg-start-btn" onclick="fgStart('${skillId}')" data-i18n="fret.startRound">${t('fret.startRound')}</button>` +
          `</div>` +
          `<div class="fg-best">${bestHtml}</div>` +
        `</div>` +
        `<div class="fg-board">${fgBoardSvg(skillId, kind)}</div>` +
        `<div class="fg-fb"></div>` +
      `</div>` +
      playRow +
    `</div>`;
  }
  if(practice.type === 'chord' && Array.isArray(practice.chords)){
    /* Chord drill: diagram(s) via the existing chordDiagramSVG renderer +
       Listening Coach chord check + self-reported clean-rep logging.
       Schema: {type:'chord', chords:[{name, chord:[[string,fret,finger]…],
       position}], label} — same chord spec shape as station-step s.chords. */
    // Trusted HTML, same as step text: fields — module data is repo-authored.
    const promptHtml = practice.label ? `<div class="sk-practice-prompt">${tf(practice,'label')}</div>` : '';
    const boxes = practice.chords.map(c =>
      `<div class="chord-box">${chordDiagramSVG(c)}${c.name ? `<div class="chord-box-label">${escHtml(c.name)}</div>` : ''}</div>`).join('');
    return `<div class="sk-practice-panel" id="pp-${skillId}" hidden>` +
      `<div class="sk-practice-title">${t('step.practiceThis')}</div>` +
      renderRepStrip(skillId) +
      promptHtml +
      `<div class="chord-diagrams">${boxes}</div>` +
      coachChordBtnRowHtml(practice.chords, skillId) +
      `<div class="rep-actions"><button type="button" class="rep-log-btn" onclick="logCleanRep('${skillId}', this)">&#x2713; <span data-i18n="rep.logClean">${t('rep.logClean')}</span></button></div>` +
    `</div>`;
  }
  if(practice.type === 'pr'){
    /* Structured PR ladder: {type:'pr', prompt, unit:'BPM'|'count',
       placeholder}. Persists through the SAME path as the regex-promoted PR
       steps — responses[`practice-<skillId>`] as an 8-entry {value,date}
       history via onResponseChange(key, value, true) — but declared in data,
       no prompt-text heuristic. Committing a new value (blur) logs one rep. */
    const key = `practice-${skillId}`;
    const unit = practice.unit === 'count' ? 'count' : 'BPM';
    const unitKey = unit === 'count' ? 'pr.unitCount' : 'pr.unitBpm';
    const latest = prLatestValue(responses[key]);
    // Trusted HTML, same as step text: fields — module data is repo-authored.
    const promptHtml = practice.prompt ? `<div class="sk-practice-prompt">${tf(practice,'prompt')}</div>` : '';
    const ph = practice.placeholder ? tf(practice,'placeholder') : t('step.answerPlaceholder');
    return `<div class="sk-practice-panel" id="pp-${skillId}" hidden>` +
      `<div class="sk-practice-title">${t('step.practiceThis')}</div>` +
      renderRepStrip(skillId) +
      promptHtml +
      `<div class="pr-input-row">` +
        `<input type="text" inputmode="numeric" class="pr-input" placeholder="${escAttr(ph)}" value="${escAttr(latest)}" aria-label="${escAttr(t('pr.inputAria'))}" oninput="onResponseChange('${key}', this.value, true)" onblur="onPracticePrBlur('${skillId}')">` +
        `<span class="pr-unit" data-i18n="${unitKey}">${t(unitKey)}</span>` +
      `</div>` +
      `<div class="pr-stats" id="pr-stats-${skillId}" data-unit="${unit}">${prStatsInner(skillId, unit)}</div>` +
    `</div>`;
  }
  if(practice.type === 'mc' && Array.isArray(practice.choices)){
    const key = `practice-${skillId}`;
    const storedRaw = responses[key];
    const storedIdx = (storedRaw === '' || storedRaw == null) ? -1 : parseInt(storedRaw, 10);
    const ansIdx = (typeof practice.answer === 'number') ? practice.answer : -1;
    const choicesEs = tf(practice,'choices');
    /* Display order is shuffled, but data-idx / storedIdx stay ORIGINAL
       indices — this panel persists the index, not the choice text. */
    const opts = mcOrder(practice.choices, mcSeed(practice)).map(idx=>{
      let cls = 'sk-practice-mc-opt';
      if(storedIdx === idx){
        cls += (idx === ansIdx) ? ' correct' : ' incorrect';
      }
      return `<button type="button" class="${cls}" data-idx="${idx}" onclick="onPracticeMcSelect('${skillId}', ${idx}, ${ansIdx}, this)"><span>${escHtml(choicesEs[idx])}</span></button>`;
    }).join('');
    let feedbackHtml = '';
    if(storedIdx >= 0){
      if(storedIdx === ansIdx){
        feedbackHtml = `<div class="sk-practice-feedback correct">${t('step.correct')}</div>`;
      } else {
        feedbackHtml = `<div class="sk-practice-feedback incorrect">${t('step.notQuite')}</div>`;
      }
    } else {
      feedbackHtml = `<div class="sk-practice-feedback"></div>`;
    }
    // Trusted HTML, same as step text: fields — module data is repo-authored.
    // (choices stay text-only — they're short button labels, escaped above.)
    const promptHtml = practice.prompt ? `<div class="sk-practice-prompt">${tf(practice,'prompt')}</div>` : '';
    const explainHtml = practice.explain
      ? `<div class="sk-practice-explain"${storedIdx >= 0 ? '' : ' hidden'}>${tf(practice,'explain')}</div>` : '';
    return `<div class="sk-practice-panel" id="pp-${skillId}" hidden>` +
      `<div class="sk-practice-title">${t('step.practiceThis')}</div>` +
      renderRepStrip(skillId) +
      promptHtml +
      `<div class="sk-practice-mc" id="pp-mc-${skillId}">${opts}</div>` +
      feedbackHtml +
      explainHtml +
    `</div>`;
  }
  return '';
}
function togglePracticePanel(sid, btn){
  const panel = document.getElementById('pp-'+sid);
  if(!panel) return;
  const isOpen = !panel.hasAttribute('hidden');
  if(isOpen){
    panel.setAttribute('hidden','');
    btn.setAttribute('aria-expanded','false');
  } else {
    panel.removeAttribute('hidden');
    btn.setAttribute('aria-expanded','true');
  }
}
function onPracticeMcSelect(skillId, idx, ansIdx, btnEl){
  const key = `practice-${skillId}`;
  responses[key] = String(idx);
  saveResponses();
  const group = document.getElementById('pp-mc-'+skillId);
  if(group){
    group.querySelectorAll('.sk-practice-mc-opt').forEach(b=>{
      b.classList.remove('correct','incorrect');
    });
  }
  btnEl.classList.add(idx === ansIdx ? 'correct' : 'incorrect');
  const panel = document.getElementById('pp-'+skillId);
  if(panel){
    const fb = panel.querySelector('.sk-practice-feedback');
    if(fb){
      fb.classList.remove('correct','incorrect');
      if(idx === ansIdx){
        fb.classList.add('correct');
        fb.textContent = t('step.correct');
      } else {
        fb.classList.add('incorrect');
        fb.textContent = t('step.notQuite');
      }
    }
  }
  // Any pick reveals the explanation (if the practice carries one) — same
  // behavior as the station-step graded MCs.
  if(panel){
    const ex = panel.querySelector('.sk-practice-explain');
    if(ex) ex.removeAttribute('hidden');
  }
  // A correct pick counts as one practice rep (feeds the rep strip + review card).
  if(idx === ansIdx) logPracticeRep(skillId);
}

/* ══════════════════════════════════════════════════════════════════════
   Practice rep tracking, Find-the-Note fretboard game, chord/PR practice
   panels, and the "Keep it sharp" spaced-review card.
   Persistence: practiceLog is its own category in the unified Firestore
   writer (queueSave/flushSave, top-level key `practiceLog`), with a
   localStorage mirror (key: practiceLog) that is ALWAYS written too — it
   is the store in dev-bypass mode and the fallback when a signed-in doc
   predates the field. loadProgress() prefers the Firestore value.
   ══════════════════════════════════════════════════════════════════════ */

/* ── Practice log: { [skillId]: {reps, todayCount, lastDay, last, best} } ── */
const REP_GOAL = 3;   // gentle daily target per skill — no timers, just dots
function loadLocalPracticeLog(){
  try{ return JSON.parse(localStorage.getItem(_uidKey('practiceLog'))) || {}; }catch(e){ return {}; }
}
let practiceLog = loadLocalPracticeLog();
function savePracticeLogLocal(){
  try{ localStorage.setItem(_uidKey('practiceLog'), JSON.stringify(practiceLog)); }catch(e){}
}
function savePracticeLog(){
  savePracticeLogLocal();   // offline/dev-bypass copy, always
  // Firestore write-through — but not for the dev-bypass user, whose uid the
  // Firestore rules reject (same guard pattern as bumpPracticeStreak).
  if(currentUser && !isDevBypassUser()) queueSave('practiceLog');
}
function repsToday(sid){
  const e = practiceLog[sid];
  return (e && e.lastDay === dayStr(new Date())) ? (e.todayCount || 0) : 0;
}
/* Whole-day distance from the last logged rep: 0 = today, 1 = yesterday,
   -1 = never practiced. Day-boundary based so "1 day ago" flips at midnight,
   not 24h after the rep. */
function daysSinceLastRep(sid){
  const e = practiceLog[sid];
  if(!e || !e.last) return -1;
  const a = new Date(); a.setHours(0,0,0,0);
  const b = new Date(e.last); b.setHours(0,0,0,0);
  return Math.max(0, Math.round((a - b) / 86400000));
}
function lastPracticedLabel(sid){
  const d = daysSinceLastRep(sid);
  if(d < 0)  return { key:'rep.lastNever',     params:null };
  if(d === 0) return { key:'rep.lastToday',     params:null };
  if(d === 1) return { key:'rep.lastYesterday', params:null };
  return { key:'rep.lastDays', params:{n:d} };
}
function logPracticeRep(sid, opts){
  const today = dayStr(new Date());
  const e = practiceLog[sid] || (practiceLog[sid] = { reps:0 });
  if(e.lastDay !== today){ e.lastDay = today; e.todayCount = 0; }
  e.reps = (e.reps || 0) + 1;
  e.todayCount = (e.todayCount || 0) + 1;
  e.last = Date.now();
  if(opts && typeof opts.best === 'number') e.best = Math.max(e.best || 0, opts.best);
  savePracticeLog();
  refreshRepStrips(sid);
  refreshReviewCards();
}
function logCleanRep(sid, btnEl){
  logPracticeRep(sid);
  if(btnEl) flashClass(btnEl, 'rep-logged', 500);
}

/* ── PR ladder helpers (practice.type === 'pr') ──
   The stored shape is the standard PR history array ({value,date}×≤8, see
   onResponseChange) under responses[`practice-<skillId>`]; these render it. */
function prHistoryValues(key){
  const raw = responses[key];
  if(Array.isArray(raw)) return raw.map(e => String(e && e.value != null ? e.value : '').trim()).filter(v => v !== '');
  return (raw != null && String(raw).trim() !== '') ? [String(raw).trim()] : [];
}
function prStatsInner(sid, unit){
  const vals = prHistoryValues(`practice-${sid}`);
  if(!vals.length) return `<span class="pr-none" data-i18n="pr.noneYet">${t('pr.noneYet')}</span>`;
  const unitTxt = t(unit === 'count' ? 'pr.unitCount' : 'pr.unitBpm');
  const latest = `${escHtml(vals[vals.length - 1])}&nbsp;${unitTxt}`;
  const nums = vals.map(v => parseFloat(v)).filter(n => !isNaN(n));
  const bestHtml = nums.length
    ? `<span class="rep-sep" aria-hidden="true">·</span><span class="pr-best">${t('pr.best', {v: `${escHtml(String(Math.max(...nums)))}&nbsp;${unitTxt}`})}</span>` : '';
  const histHtml = vals.length > 1
    ? `<span class="rep-sep" aria-hidden="true">·</span><span class="pr-history" title="${escAttr(t('pr.historyTitle'))}">${vals.map(escHtml).join(' &rarr; ')}</span>` : '';
  return `<span class="pr-latest">${t('pr.latest', {v: latest})}</span>` + bestHtml + histHtml;
}
/* Blur commits the edit session (same as the step PR textareas). If this
   session created/filled an entry, that's one practice rep. */
function onPracticePrBlur(sid){
  const key = `practice-${sid}`;
  const wasEditing = _prEditingKeys.has(key);
  onResponsePRBlur(key);
  const raw = responses[key];
  const lastVal = Array.isArray(raw) && raw.length ? String(raw[raw.length - 1].value || '').trim() : '';
  if(wasEditing && lastVal) logPracticeRep(sid);
  const el = document.getElementById('pr-stats-' + sid);
  if(el){
    el.innerHTML = prStatsInner(sid, el.dataset.unit === 'count' ? 'count' : 'BPM');
    if(typeof applyI18n === 'function') applyI18n(el);
  }
}

/* ── Rep strip: "Reps today: n of 3" dots · total · last practiced ── */
function repStripInner(sid){
  const e = practiceLog[sid] || {};
  const today = repsToday(sid);
  const total = e.reps || 0;
  const dots = Array.from({length: REP_GOAL}, (_, i) =>
    `<span class="rep-dot${i < today ? ' filled' : ''}"></span>`).join('');
  const last = lastPracticedLabel(sid);
  const goalMet = today >= REP_GOAL;
  return `<span class="rep-dots" aria-hidden="true">${dots}</span>` +
    `<span class="rep-count" data-i18n="rep.today" data-i18n-params='{"n":${today},"goal":${REP_GOAL}}'>${t('rep.today',{n:today,goal:REP_GOAL})}</span>` +
    (goalMet ? `<span class="rep-goal-note" data-i18n="rep.goalMet">${t('rep.goalMet')}</span>` : '') +
    `<span class="rep-sep" aria-hidden="true">·</span>` +
    `<span class="rep-total" data-i18n="rep.total" data-i18n-params='{"n":${total}}'>${t('rep.total',{n:total})}</span>` +
    `<span class="rep-sep" aria-hidden="true">·</span>` +
    `<span class="rep-last" data-i18n="${last.key}"${last.params ? ` data-i18n-params='${escAttr(JSON.stringify(last.params))}'` : ''}>${t(last.key, last.params)}</span>`;
}
function renderRepStrip(sid){
  const goalMet = repsToday(sid) >= REP_GOAL;
  return `<div class="rep-strip${goalMet ? ' rep-goal-met' : ''}" data-sid="${escAttr(sid)}">${repStripInner(sid)}</div>`;
}
function refreshRepStrips(sid){
  document.querySelectorAll(`.rep-strip[data-sid="${CSS.escape(sid)}"]`).forEach(el=>{
    el.innerHTML = repStripInner(sid);
    el.classList.toggle('rep-goal-met', repsToday(sid) >= REP_GOAL);
    if(typeof applyI18n === 'function') applyI18n(el);
  });
}

/* ── Find-the-Note game (practice.type === 'fretboard') ──
   practice.string: 'lowE' | 'A' | 'D' | 'G' | 'B' | 'highE' (single-string
   board) | 'both' (low E + A, prompts alternate) | 'all' (all six strings,
   each prompt picks a random string). Frets 0–12, natural notes only. A
   round = 5 prompts; a prompt scores if the FIRST click is right (wrong
   clicks flash red and let the student keep hunting — no timers, no
   lockout). Round end logs one rep and keeps a best score. */
const FG_ROUND = 5;
const FG_NATURALS = {
  lowE:  {0:'E',1:'F',3:'G',5:'A',7:'B',8:'C',10:'D',12:'E'},
  A:     {0:'A',2:'B',3:'C',5:'D',7:'E',8:'F',10:'G',12:'A'},
  D:     {0:'D',2:'E',3:'F',5:'G',7:'A',9:'B',10:'C',12:'D'},
  G:     {0:'G',2:'A',4:'B',5:'C',7:'D',9:'E',10:'F',12:'G'},
  B:     {0:'B',1:'C',3:'D',5:'E',6:'F',8:'G',10:'A',12:'B'},
  highE: {0:'E',1:'F',3:'G',5:'A',7:'B',8:'C',10:'D',12:'E'}
};
const FRET_STRING_KEY = { lowE:'fret.stringLowE', A:'fret.stringA', D:'fret.stringD', G:'fret.stringG', B:'fret.stringB', highE:'fret.stringHighE' };
/* Multi-string boards draw high strings on top (string 1 → 6), matching
   every other horizontal fretboard diagram on the site. */
function fgStringsFor(kind){
  if(kind === 'both') return ['A','lowE'];
  if(kind === 'all')  return ['highE','B','G','D','A','lowE'];
  return [kind];
}
function fgShuffle(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
const fretGames = {};

/* Clickable fretboard board — one row per string (1 for a single-string
   kind, 2 for 'both', 6 for 'all'). Same visual vocabulary as the reference
   fretboard (localStringFretboardSvg): nut, fret wires, inlay dots, fret
   numbers — prominent string lines and a transparent hit zone per
   string × fret. Rows compact themselves when there are 3+ strings so the
   'all' board still fits a Chromebook column. */
function fgBoardSvg(sid, kind){
  const strs = fgStringsFor(kind).filter(k => FG_NATURALS[k]);
  if(!strs.length) return '';
  const n = strs.length, multi = n > 1, compact = n >= 3;
  const W = 600, padR = 8, openW = 44, maxF = 12;
  const padL = multi ? 54 : 8;               // room for string labels on multi-string boards
  const rowGap = compact ? 24 : 34;
  const rowPad = compact ? 12 : 16;
  const mR     = compact ? 10.5 : 13;        // feedback-marker radius
  const mFont  = compact ? 10.5 : 11.5;
  const topY = compact ? 22 : 28;
  const stringYs = strs.map((_, i) => topY + i * rowGap);
  const wireTop = stringYs[0] - rowPad, wireBot = stringYs[n - 1] + rowPad;
  const numY = wireBot + (compact ? 16 : 18), H = numY + 8;
  const nutX = padL + openW;
  const fretW = (W - padL - padR - openW) / maxF;
  const colX = f => f === 0 ? padL : nutX + (f - 1) * fretW;
  const colW = f => f === 0 ? openW : fretW;
  const cx   = f => f === 0 ? padL + openW / 2 : nutX + (f - 0.5) * fretW;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" class="fg-svg" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">`;
  /* Inlay dots (below the lowest string so they read as fretboard markers) */
  FRETBOARD_INLAYS.forEach(f => {
    s += `<circle cx="${cx(f)}" cy="${wireBot + 1}" r="2.5" fill="var(--text3)" opacity="0.35"/>`;
    if(f === 12) s += `<circle cx="${cx(f)}" cy="${wireTop - 1}" r="2.5" fill="var(--text3)" opacity="0.35"/>`;
  });
  /* Fret wires + nut */
  for(let f = 1; f <= maxF; f++){
    const x = nutX + f * fretW;
    s += `<line x1="${x}" y1="${wireTop + 2}" x2="${x}" y2="${wireBot - 2}" stroke="var(--text3)" stroke-width="0.8"/>`;
  }
  s += `<rect x="${nutX - 2}" y="${wireTop}" width="4" height="${wireBot - wireTop}" fill="var(--text)" rx="1"/>`;
  /* The strings (+ labels when there's more than one) */
  strs.forEach((k, i) => {
    const y = stringYs[i];
    s += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="var(--green-text)" stroke-width="2.2"/>`;
    if(multi) s += `<text x="${padL - 6}" y="${y}" text-anchor="end" dominant-baseline="central" font-size="9" font-weight="600" fill="var(--green-text)">${escHtml(t(FRET_STRING_KEY[k]))}</text>`;
  });
  /* Fret numbers */
  for(let f = 0; f <= maxF; f++){
    s += `<text x="${cx(f)}" y="${numY}" text-anchor="middle" font-size="9" fill="var(--text2)">${f}</text>`;
  }
  /* Feedback markers (hidden until a click) + hit zones on top */
  strs.forEach((k, i) => {
    const y = stringYs[i], map = FG_NATURALS[k];
    for(let f = 0; f <= maxF; f++){
      s += `<g class="fg-marker" id="fgm-${sid}-${k}-${f}">` +
        `<circle cx="${cx(f)}" cy="${y}" r="${mR}"/>` +
        `<text x="${cx(f)}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${mFont}" font-weight="700">${map[f] || '&#x2715;'}</text>` +
      `</g>`;
    }
  });
  strs.forEach((k, i) => {
    const bandTop = multi ? stringYs[i] - rowGap / 2 : wireTop - 8;
    const bandH   = multi ? rowGap : (wireBot - wireTop) + 16;
    for(let f = 0; f <= maxF; f++){
      s += `<rect class="fg-hit" x="${colX(f)}" y="${bandTop}" width="${colW(f)}" height="${bandH}" rx="6" onclick="fgClick('${sid}','${k}',${f})" aria-label="${escAttr(t(FRET_STRING_KEY[k]))} — ${escAttr(t('fret.fretN',{n:f}))}"><title>${escHtml(t('fret.fretN',{n:f}))}</title></rect>`;
    }
  });
  return s + '</svg>';
}
/* Prompts: per-string shuffled note pools. 'both' strictly alternates its
   two strings; 'all' picks a random string per prompt. */
function fgStart(sid){
  const wrap = document.getElementById('fg-' + sid);
  if(!wrap) return;
  const kind = wrap.dataset.kind || 'lowE';
  const strs = fgStringsFor(kind).filter(k => FG_NATURALS[k]);
  if(!strs.length) return;
  const pools = {};
  const refill = k => fgShuffle([...new Set(Object.values(FG_NATURALS[k]))]);
  strs.forEach(k => { pools[k] = refill(k); });
  const prompts = [];
  for(let i = 0; i < FG_ROUND; i++){
    const k = kind === 'all'
      ? strs[Math.floor(Math.random() * strs.length)]
      : strs[i % strs.length];
    if(!pools[k].length) pools[k] = refill(k);
    prompts.push({ str: k, note: pools[k].pop() });
  }
  fretGames[sid] = { kind, prompts, idx: 0, score: 0, missed: false, done: false, locked: false };
  fgRenderPrompt(sid);
}
function fgRenderPrompt(sid){
  const st = fretGames[sid];
  const wrap = document.getElementById('fg-' + sid);
  if(!st || !wrap) return;
  st.locked = false;   // fresh prompt on screen — re-enable clicks (guards the 650ms transition below)
  const p = st.prompts[st.idx];
  const pp = { note: p.note, string: t(FRET_STRING_KEY[p.str] || 'fret.stringLowE') };
  const cp = { i: st.idx + 1, total: FG_ROUND };
  wrap.querySelector('.fg-status').innerHTML =
    `<span class="fg-prompt" data-i18n-html="fret.findPromptHtml" data-i18n-params='${escAttr(JSON.stringify(pp))}'>${t('fret.findPromptHtml', pp)}</span>` +
    `<span class="fg-count" data-i18n="fret.promptCount" data-i18n-params='${escAttr(JSON.stringify(cp))}'>${t('fret.promptCount', cp)}</span>`;
  wrap.querySelector('.fg-fb').innerHTML = '';
}
function fgClick(sid, strKind, fret){
  const st = fretGames[sid];
  const wrap = document.getElementById('fg-' + sid);
  if(!st || st.done || st.locked || !wrap) return;
  const p = st.prompts[st.idx];
  const fb = wrap.querySelector('.fg-fb');
  const marker = document.getElementById(`fgm-${sid}-${strKind}-${fret}`);
  if(strKind === p.str && (FG_NATURALS[strKind] || {})[fret] === p.note){
    if(!st.missed) st.score++;
    st.missed = false;
    st.locked = true;   // hold input until the next prompt renders, so a click during the transition isn't scored against the wrong prompt
    if(marker) flashClass(marker, 'fg-good', 650);
    fb.innerHTML = `<span class="fg-fb-good" data-i18n="fret.gotIt">${t('fret.gotIt')}</span>`;
    st.idx++;
    if(st.idx >= FG_ROUND){
      st.done = true;
      setTimeout(()=>fgEnd(sid), 650);
    } else {
      setTimeout(()=>{ if(fretGames[sid] === st && !st.done) fgRenderPrompt(sid); }, 650);
    }
  } else {
    st.missed = true;
    if(marker) flashClass(marker, 'fg-bad', 650);
    fb.innerHTML = `<span class="fg-fb-bad" data-i18n="fret.notThatOne">${t('fret.notThatOne')}</span>`;
  }
}
function fgEnd(sid){
  const st = fretGames[sid];
  const wrap = document.getElementById('fg-' + sid);
  if(!st || !wrap) return;
  const praiseKey = st.score >= 4 ? 'fret.praiseHigh' : (st.score >= 3 ? 'fret.praiseMid' : 'fret.praiseLow');
  wrap.querySelector('.fg-status').innerHTML =
    `<span class="fg-score">${t('fret.roundScore',{score:st.score,total:FG_ROUND})} &mdash; ${t(praiseKey)}</span>` +
    `<button type="button" class="fg-start-btn" onclick="fgStart('${sid}')" data-i18n="fret.playAgain">${t('fret.playAgain')}</button>`;
  wrap.querySelector('.fg-fb').innerHTML = '';
  logPracticeRep(sid, { best: st.score });
  const e = practiceLog[sid];
  wrap.querySelector('.fg-best').innerHTML =
    `<span data-i18n="fret.best" data-i18n-params='{"n":${e.best},"total":${FG_ROUND}}'>${t('fret.best',{n:e.best,total:FG_ROUND})}</span>`;
}

/* ── Shuffle Drill (step.drill, type 'shuffle') ──────────────────────────
   The digital twin of the paper shuffle self-quiz. A shuffled deck of frets
   is dealt one card at a time; the student says the note out loud AND taps
   it; the 3-second limit is the standard the Set 1 check-off tests.

   Module-data schema:
     drill: { type:'shuffle', string:'lowE'|'A'|…, rounds:10, seconds:3,
              maxFret:12, pile:'naturals'|'sharps', skill:'m2w1-s3' }

   Design calls (Jonathan, 2026-07-25):
   - TAP THE NOTE NAME, not 4-choice and not the mic. The whole pile is on
     screen (7 naturals, or 12 with sharps), so it stays recall rather than
     a 1-in-4 guess — Fret Zap already owns the multiple-choice version.
   - Running out of clock does NOT end the card: the ring turns red and
     counts up, and a right-but-late answer lands as "slow", not wrong.
     Only IN-TIME answers count toward the 10 — the 3-second standard stays
     intact without the drill snatching the card away mid-thought.
   - A miss OR a slow one is re-dealt 2–4 cards later: the paper move of
     tossing that slip back into the pile.
   - Best in-time score persists in the `games` save category
     (games.sd['<string>:<pile>']); at 90% the results screen offers the
     skill check-off instead of making them go hunt the checklist tab.
   State lives in `shuffleDrills[stepKey]`; a language switch rebuilds the
   module panels, which resets any in-flight round (same as the arcade). */
const SD_ROUNDS = 10;
const SD_LIMIT = 3;               // seconds — the check-off standard
const SD_NOTE_NAMES = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const SD_NATURALS = ['A','B','C','D','E','F','G'];
const SD_OPEN_MIDI = { lowE:40, A:45, D:50, G:55, B:59, highE:64 };
const SD_RING_LEN = 201;          // 2πr for the r=32 countdown ring
const SD_SLOW_MS = 2000;          // a hit this slow still lands in "drill these"
const shuffleDrills = {};

function sdNoteAt(kind, fret){ return SD_NOTE_NAMES[(SD_OPEN_MIDI[kind] + fret) % 12]; }
function sdStringName(kind){ return t(FRET_STRING_KEY[kind] || 'fret.stringLowE'); }
function sdBox(key){ return document.getElementById('sdr-' + key); }
function sdPileKey(c){ return c.string + ':' + c.pile; }
function sdSessionKey(c){ return 'sdBest:' + sdPileKey(c); }
/* Best = the higher of this browser session and the persisted all-time best,
   same rule the arcade cards use (a returning student sees their record, and
   dev-bypass/signed-out still gets a number). */
function sdBest(c){
  let s = 0;
  try { s = parseInt(sessionStorage.getItem(sdSessionKey(c)), 10) || 0; } catch(e){}
  return Math.max(s, ((games && games.sd) || {})[sdPileKey(c)] || 0);
}
function sdSaveBest(c, n){
  try {
    if((parseInt(sessionStorage.getItem(sdSessionKey(c)), 10) || 0) < n) sessionStorage.setItem(sdSessionKey(c), String(n));
  } catch(e){}
  // Firestore rejects the dev-bypass uid — session best above still counts.
  if(!currentUser || (typeof isDevBypassUser === 'function' && isDevBypassUser())) return;
  if(!games.sd) games.sd = {};
  if((games.sd[sdPileKey(c)] || 0) >= n) return;
  games.sd[sdPileKey(c)] = n;
  games.sd.at = dayStr(new Date());
  saveGames();
}
function sdShuffle(a){
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/* Legal frets for the pile: the naturals pile drops every fret whose note
   carries a ♯, so the answer row stays one Chromebook line wide. */
function sdFrets(c){
  const out = [];
  for(let f = 0; f <= c.maxFret; f++){
    if(c.pile === 'naturals' && sdNoteAt(c.string, f).indexOf('♯') >= 0) continue;
    out.push(f);
  }
  return out;
}
function sdAnswerNames(c){ return c.pile === 'naturals' ? SD_NATURALS.slice() : SD_NOTE_NAMES.slice(); }

/* Called from stepsHtml — registers state and returns the setup screen. */
function renderShuffleDrill(drill, key, wid){
  /* Dispatcher for every step-level drill widget. 'shuffle' deals frets on
     one string (below); 'deck' deals any small card pile; 'ear' deals a
     hidden sequence and plays it. All three replaced a paper drill. */
  if(drill && drill.type === 'deck') return renderDeckDrill(drill, key, wid);
  if(drill && drill.type === 'ear')  return renderEarDrill(drill, key, wid);
  if(!drill || drill.type !== 'shuffle') return '';
  const prev = shuffleDrills[key];
  if(prev && prev.tick) clearInterval(prev.tick);
  // A round in flight schedules a setTimeout (sdAnswer → sdNext) that would
  // otherwise fire against this freshly-rebuilt (differently-shaped) state
  // and throw — cancel it along with the tick.
  if(prev && prev.pending) clearTimeout(prev.pending);
  shuffleDrills[key] = {
    phase: 'setup', tick: null, pending: null,
    cfg: {
      string:  drill.string || 'lowE',
      rounds:  drill.rounds || SD_ROUNDS,
      seconds: drill.seconds || SD_LIMIT,
      maxFret: drill.maxFret != null ? drill.maxFret : 12,
      /* A student's last pile choice sticks across a rebuild (language
         switch, tab revisit) — only the round itself resets. */
      pile:    (prev && prev.cfg && prev.cfg.pile) || drill.pile || 'naturals',
      skill:   drill.skill || null,
      wid:     wid
    }
  };
  // data-skill lets the shuffle-deck check-off gate find and scroll to this
  // deck from the checklist tab (drillGatePractice).
  const skillAttr = drill.skill ? ` data-skill="${escAttr(drill.skill)}"` : '';
  return `<div class="sdr" id="sdr-${escAttr(key)}"${skillAttr}>${sdSetupHtml(key)}</div>`;
}

function sdHeadHtml(key, right){
  const c = shuffleDrills[key].cfg;
  return `<div class="sdr-head">` +
    `<span>${escHtml(t('drill.head', { string: sdStringName(c.string), max: c.maxFret }))}</span>` +
    `<span class="sdr-meta">${escHtml(right)}</span></div>`;
}

function sdSetupHtml(key){
  const st = shuffleDrills[key];
  if(!st) return '';
  const c = st.cfg;
  const best = sdBest(c);
  const pill = (id, label) =>
    `<button type="button" class="sdr-pill${c.pile === id ? ' active' : ''}" onclick="sdPickPile('${key}','${id}')">${escHtml(label)}</button>`;
  return sdHeadHtml(key, t('drill.headMeta', { n: c.rounds, s: c.seconds })) +
    `<div class="sdr-body">` +
      `<div class="sdr-intro">${escHtml(t('drill.intro'))}</div>` +
      `<div class="sdr-pills">${pill('naturals', t('drill.pileNaturals'))}${pill('sharps', t('drill.pileSharps'))}</div>` +
      `<button type="button" class="sdr-start" onclick="sdStart('${key}')">&#x25B6; ${escHtml(t('drill.start'))}</button>` +
      (best ? `<div class="sdr-best">&#x1F3C6; ${escHtml(t('drill.best', { n: best, total: c.rounds }))}</div>` : '') +
    `</div>`;
}

function sdPickPile(key, pile){
  const st = shuffleDrills[key], box = sdBox(key);
  if(!st || !box) return;
  st.cfg.pile = pile;
  box.innerHTML = sdSetupHtml(key);
}

function sdStart(key){
  const st = shuffleDrills[key], box = sdBox(key);
  if(!st || !box) return;
  // A previous round's pending "advance to next card" timeout could still be
  // in flight if Start/Again was clicked right after answering — cancel it
  // so it doesn't fire mid-new-round against the state we're about to reset.
  if(st.pending){ clearTimeout(st.pending); st.pending = null; }
  st.phase = 'play';
  st.round = 0; st.inTime = 0;
  st.results = []; st.requeue = []; st.deck = sdShuffle(sdFrets(st.cfg));
  st.locked = false;
  sdNext(key);
}

/* A missed/slow fret comes back 2–4 cards later; otherwise deal off the
   shuffled deck, reshuffling a fresh one when it runs out. */
function sdDraw(st){
  const due = st.requeue.findIndex(q => q.due <= st.round);
  if(due >= 0) return st.requeue.splice(due, 1)[0].fret;
  if(!st.deck.length) st.deck = sdShuffle(sdFrets(st.cfg));
  return st.deck.pop();
}

function sdNext(key){
  const st = shuffleDrills[key], box = sdBox(key);
  if(!st || !box) return sdStop(key);
  if(st.round >= st.cfg.rounds) return sdFinish(key);
  st.round++;
  st.cur = { fret: sdDraw(st), at: performance.now() };
  st.locked = false;
  box.innerHTML = sdPlayHtml(key);
  if(st.tick) clearInterval(st.tick);
  st.tick = setInterval(() => sdTick(key), 80);
}

function sdStop(key){
  const st = shuffleDrills[key];
  if(st && st.tick){ clearInterval(st.tick); st.tick = null; }
  if(st && st.pending){ clearTimeout(st.pending); st.pending = null; }
}

function sdPlayHtml(key){
  const st = shuffleDrills[key], c = st.cfg;
  const notes = sdAnswerNames(c).map(n =>
    `<button type="button" class="sdr-note${n.indexOf('♯') >= 0 ? ' sharp' : ''}" data-note="${escAttr(n)}" onclick="sdAnswer('${key}','${escAttr(n)}')">${escHtml(n)}</button>`
  ).join('');
  return sdHeadHtml(key, t('drill.round', { n: st.round, total: c.rounds })) +
    `<div class="sdr-body">` +
      `<div class="sdr-stage">` +
        `<div class="sdr-card" id="sdr-card-${key}">` +
          `<span class="sdr-card-kicker">${escHtml(t('drill.fret'))}</span>` +
          `<span class="sdr-card-fret">${st.cur.fret}</span>` +
        `</div>` +
        `<div class="sdr-ring" id="sdr-ring-${key}">` +
          `<svg width="74" height="74" viewBox="0 0 74 74" aria-hidden="true">` +
            `<circle cx="37" cy="37" r="32" fill="none" stroke="var(--border2)" stroke-width="6"></circle>` +
            `<circle cx="37" cy="37" r="32" fill="none" stroke="var(--purple-accent)" stroke-width="6" stroke-linecap="round" id="sdr-arc-${key}" stroke-dasharray="${SD_RING_LEN}" stroke-dashoffset="0"></circle>` +
          `</svg>` +
          `<span class="sdr-ring-num" id="sdr-num-${key}">${c.seconds}</span>` +
        `</div>` +
      `</div>` +
      `<div class="sdr-fb" id="sdr-fb-${key}" role="status" aria-live="polite">&nbsp;</div>` +
      `<div class="sdr-notes">${notes}</div>` +
    `</div>`;
}

/* Ring: drains over the limit, then turns red and counts UP — the card is
   never snatched away, but "you're past three seconds" is unmissable. */
function sdTick(key){
  const st = shuffleDrills[key];
  if(!st || st.phase !== 'play') return sdStop(key);
  if(!sdBox(key)) return sdStop(key);          // panel rebuilt under us
  if(st.locked) return;
  const limit = st.cfg.seconds * 1000;
  const gone = performance.now() - st.cur.at;
  const arc = document.getElementById('sdr-arc-' + key);
  const num = document.getElementById('sdr-num-' + key);
  const ring = document.getElementById('sdr-ring-' + key);
  const over = gone >= limit;
  if(arc) arc.setAttribute('stroke-dashoffset', String(SD_RING_LEN * Math.min(1, gone / limit)));
  if(num) num.textContent = over ? (gone / 1000).toFixed(1) : String(Math.ceil((limit - gone) / 1000));
  if(ring) ring.classList.toggle('over', over);
}

function sdAnswer(key, pick){
  const st = shuffleDrills[key];
  if(!st || st.phase !== 'play' || st.locked) return;
  const c = st.cfg;
  const ms = performance.now() - st.cur.at;
  const right = sdNoteAt(c.string, st.cur.fret);
  const ok = pick === right;
  const inTime = ok && ms <= c.seconds * 1000;
  st.locked = true;
  sdStop(key);
  st.results.push({ fret: st.cur.fret, note: right, ok: ok, inTime: inTime, ms: ms });
  if(inTime) st.inTime++;
  else st.requeue.push({ fret: st.cur.fret, due: st.round + 2 + Math.floor(Math.random() * 3) });

  const card = document.getElementById('sdr-card-' + key);
  const fb = document.getElementById('sdr-fb-' + key);
  if(card) card.classList.add(inTime ? 'hit' : (ok ? 'slow' : 'miss'));
  const box = sdBox(key);
  if(box) box.querySelectorAll('.sdr-note').forEach(b => {
    const n = b.getAttribute('data-note');
    if(n === right) b.classList.add('correct');
    else if(n === pick) b.classList.add('wrong');
  });
  if(fb){
    fb.className = 'sdr-fb ' + (inTime ? 'hit' : (ok ? 'slow' : 'miss'));
    fb.textContent = inTime
      ? t('drill.fbHit', { note: right, s: (ms / 1000).toFixed(1) })
      : ok
        ? t('drill.fbSlow', { note: right, s: (ms / 1000).toFixed(1), limit: c.seconds })
        : t('drill.fbMiss', { pick: pick, fret: st.cur.fret, note: right });
  }
  // The reward for a right answer is hearing the note you just named.
  if(ok && typeof playNote === 'function') playNote(SD_OPEN_MIDI[c.string] + st.cur.fret);
  st.pending = setTimeout(() => { st.pending = null; sdNext(key); }, inTime ? 620 : 1500);
}

function sdFinish(key){
  const st = shuffleDrills[key], box = sdBox(key);
  if(!st || !box) return sdStop(key);
  st.phase = 'done';
  sdStop(key);
  const c = st.cfg;
  sdSaveBest(c, st.inTime);
  sdRecordSkillBest(c, st.inTime);

  /* "Drill these next" — every fret that was wrong, late, or just sluggish,
     worst first. This is the thing paper slips could never tell them. */
  const bad = {};
  st.results.forEach(r => {
    if(r.ok && r.inTime && r.ms <= SD_SLOW_MS) return;
    const e = bad[r.fret] || (bad[r.fret] = { fret: r.fret, note: r.note, misses: 0, slow: false });
    if(!r.ok) e.misses++; else e.slow = true;
  });
  const list = Object.keys(bad).map(k => bad[k])
    .sort((a, b) => (b.misses - a.misses) || (a.fret - b.fret));
  const hits = st.results.filter(r => r.ok);
  const avg = hits.length ? (hits.reduce((s, r) => s + r.ms, 0) / hits.length / 1000).toFixed(1) : '—';
  const pct = st.inTime / c.rounds;
  const verdict = pct >= 0.9 ? { cls:'good', key:'drill.verdictGood' }
                : pct >= 0.7 ? { cls:'mid',  key:'drill.verdictMid' }
                             : { cls:'mid',  key:'drill.verdictLow' };
  const rows = list.length
    ? list.map(b => `<div class="sdr-drill-row"><b>${escHtml(t('drill.rowFret', { fret: b.fret, note: b.note }))}</b>` +
        `<span>${escHtml(b.misses ? t('drill.rowMiss', { n: b.misses }) : t('drill.rowSlow'))}</span></div>`).join('')
    : `<div class="sdr-drill-row"><b>${escHtml(t('drill.clean'))}</b><span>${escHtml(t('drill.cleanNext'))}</span></div>`;
  const canCheck = c.skill && pct >= 0.9 && progress[c.skill] !== 'gotit';
  const checkHtml = canCheck
    ? `<button type="button" class="sdr-checkoff" onclick="sdCheckOff('${key}')">&#x2713; ${escHtml(t('drill.checkOff'))}</button>`
    : '';
  box.innerHTML = sdHeadHtml(key, t('drill.round', { n: c.rounds, total: c.rounds })) +
    `<div class="sdr-body">` +
      `<div class="sdr-score">${escHtml(t('drill.score', { n: st.inTime, total: c.rounds }))}</div>` +
      `<div class="sdr-score-sub">${escHtml(t('drill.scoreSub', { s: c.seconds, avg: avg }))}</div>` +
      `<div class="sdr-verdict ${verdict.cls}">${escHtml(t(verdict.key))}</div>` +
      `<div class="sdr-drill"><div class="sdr-drill-title">${escHtml(t('drill.drillTitle'))}</div>${rows}</div>` +
      checkHtml +
      `<div class="sdr-actions">` +
        `<button type="button" class="sdr-start" onclick="sdStart('${key}')">&#x21BB; ${escHtml(t('drill.again'))}</button>` +
        `<button type="button" class="sdr-btn2" onclick="sdBackToSetup('${key}')">${escHtml(t('drill.changePile'))}</button>` +
      `</div>` +
    `</div>`;
}

function sdBackToSetup(key){
  const st = shuffleDrills[key], box = sdBox(key);
  if(!st || !box) return;
  sdStop(key);
  st.phase = 'setup';
  box.innerHTML = sdSetupHtml(key);
}

/* 9-of-10 earns the offer to check the skill off right here, rather than
   sending them to the checklist tab to do it from memory. */
function sdCheckOff(key){
  const st = shuffleDrills[key];
  if(!st || !st.cfg.skill) return;
  if(progress[st.cfg.skill] !== 'gotit' && typeof toggleSkill === 'function'){
    if(toggleSkill(st.cfg.skill, st.cfg.wid, 'gotit') === false) return;   // coach gate opened instead — button stays live for a retry
  }
  const box = sdBox(key);
  const btn = box && box.querySelector('.sdr-checkoff');
  if(btn){
    btn.textContent = '✓ ' + t('drill.checkedOff');
    btn.classList.add('done');
    btn.disabled = true;
  }
}

/* ── "You've got it when:" gets its own typographic slot ─────────────────
   Jonathan, 2026-07-26, looking at a swept Challenge card: the success
   standard ran on from the last bullet in the same size and colour, so the
   card didn't "read cleanly." He weighed giving it a bullet against giving
   it a different treatment and chose the treatment (option B2 of the
   mockup): a thin rule pulls it off the left margin and out of the list's
   flow, the standard itself is italic and one shade quieter.

   That preserves his 2026-07-25 call — the standard stays OUTSIDE the list,
   "where it reads as a promise rather than a step" — while still separating
   it visually. Bulleting it would have reversed that.

   Done at render time on purpose. Wrapping it in the module data would mean
   editing ~195 cards × EN and ES, and every card written afterwards would
   have to remember the span. Here it is one regex, both languages, and
   restyling later (or dropping it) is a CSS change with no content sweep.

   Only the FIRST match is wrapped, and only up to the end of that sentence,
   so anything after it — a "No score —" note, a bonus line, a Song Journey
   link, a step-figure image — stays outside the rule, exactly where R4 puts
   it. Cards without the phrase are returned untouched. */
const GOT_IT_RE = /(You&#39;ve got it when:|You've got it when:|You’ve got it when:|Lo tienes cuando:)/;
function wrapGotItWhen(html){
  if(typeof html !== 'string') return html;
  const m = GOT_IT_RE.exec(html);
  if(!m) return html;
  const head = html.slice(0, m.index);
  const rest = html.slice(m.index + m[0].length);
  /* Stop at the first sentence end that is followed by more content, or at
     the first tag that starts the trailing matter — whichever comes first. */
  const tagAt = rest.search(/<(?:span|a|div|img)\b/i);
  let cut = rest.length;
  if(tagAt >= 0) cut = tagAt;
  const sentence = /\.(?=\s|$)/.exec(rest.slice(0, cut));
  if(sentence) cut = sentence.index + 1;
  const body = rest.slice(0, cut);
  const tail = rest.slice(cut);
  return head +
    `<span class="got-it"><span class="got-it-lab">${m[0]}</span>${body}</span>` +
    tail;
}

/* ── Multiple-choice answer shuffle ──────────────────────────────────────
   Jonathan, 2026-07-26: "the quiz correct answer choices should be
   randomized. right now the correct answers are always the first one."

   Measured across all 237 graded MCs before this landed: the correct
   choice sat at position 1 in 34% of questions, position 2 in 50%,
   position 3 in 14%, and position 4 in just 2%. A student who simply
   never picked the last option was right 98% of the time.

   The order is DETERMINISTIC, seeded from the question's own English text
   — not Math.random(). That matters for three reasons:
   - The choice list re-renders constantly (tab switch, language toggle,
     a re-render after answering). A fresh random order each time would
     make the options jump under the student's finger.
   - A student who answers, leaves, and comes back must see the same
     arrangement, or their highlighted answer looks like it moved.
   - Jonathan sees the same order the class does, so "look at the third
     one" still works on the projector. (He chose this over a per-student
     shuffle for exactly that reason, 2026-07-26.)

   Seeding on the English text, never the Spanish, keeps the order
   identical in both languages — the ES label rides along on the original
   index, same as the persisted value does.

   Catch-all options ("All of them", "All of the pick", "None") are pinned
   to their original slot and the rest shuffle around them, so a question
   whose last option summarises the others still reads correctly. The
   pattern deliberately does NOT pin ordinary answers that merely start
   with "All"/"Both" ("All 6 strings", "Both on E string") — pinning those
   would freeze a real answer in place, which is the bug, not the fix. */
const MC_PINNED = /^(all|none|both|neither)\s+of\b|^(none|all)$/i;
function mcHash(str){
  let h = 2166136261;
  for(let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mcSeed(r){ return (r.prompt || '') + '|' + (r.choices || []).join('|'); }
/* Returns the ORIGINAL indices of `choices`, in display order. */
function mcOrder(choices, seedStr){
  if(!Array.isArray(choices) || choices.length < 3) return (choices||[]).map((c,i)=>i);
  const pinned = choices.map(c => MC_PINNED.test(String(c).trim()));
  const movable = [];
  choices.forEach((c,i)=>{ if(!pinned[i]) movable.push(i); });
  let s = mcHash(seedStr) || 1;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  for(let i = movable.length - 1; i > 0; i--){
    const j = Math.floor(rnd() * (i + 1));
    const tmp = movable[i]; movable[i] = movable[j]; movable[j] = tmp;
  }
  let m = 0;
  return choices.map((c,i) => pinned[i] ? i : movable[m++]);
}

/* ── Card Deck drill (step.drill, type 'deck') ───────────────────────────
   The digital twin of the paper flashcard/slip drills — the same job the
   Shuffle Drill above does for frets, generalised to any small pile.

   Module-data schema:
     drill: { type:'deck', deck:'numerals-C', rounds:<int>, skill:'m11w1-s2' }

   Design calls (Jonathan, 2026-07-26 — "there are things like this that
   require paper. can they be made digital?"):
   - TWO-SIDED decks keep the paper move that matters: the back is hidden
     until the student taps, so "answer out loud before checking" survives.
     One-sided decks just deal a prompt and take a self-report.
   - Self-report, not auto-grading. What's being checked is whether they
     PLAYED the chord — the app can't see that, and a 4-choice quiz would
     turn recall into recognition. Fret Zap already owns multiple choice.
   - "Put it back" re-deals that card 3 cards later: the paper move of
     tossing the slip back into the pile. Only first-try hits score.
   - Best run persists in the `games` save category (games.dk['<deckId>']);
     at 100% the results screen offers the skill check-off inline.
   Decks live here rather than in module data so the ES twin comes from
   i18n instead of being duplicated card-for-card in every module file. */
const DECKS = {
  'numerals-C': { kicker:'deck.kNumeral', back:'deck.kChord', hint:'deck.hPlayIt',
    cards:[{f:'I',b:'C'},{f:'ii',b:'Dm'},{f:'iii',b:'Em'},{f:'IV',b:'F'},{f:'V',b:'G'},{f:'vi',b:'Am'}] },
  'numerals-letitbe': { kicker:'deck.kNumeral', back:'deck.kChord', hint:'deck.hPlayIt',
    cards:[{f:'I',b:'C'},{f:'V',b:'G'},{f:'vi',b:'Am'},{f:'IV',b:'F'}] },
  'relative-pairs': { kicker:'deck.kMajorKey', back:'deck.kRelMinor', hint:'deck.hSayIt',
    cards:[{f:'C',b:'Am'},{f:'G',b:'Em'},{f:'F',b:'Dm'},{f:'D',b:'Bm'},{f:'A',b:'F#m'}] },
  'minor-keys-box1': { kicker:'deck.kKey', back:'deck.kBoxFret', hint:'deck.hFindBox',
    cards:[{f:'Am',b:'5'},{f:'Gm',b:'3'},{f:'Bm',b:'7'},{f:'Dm',b:'10'}] },
  'naturals': { kicker:'deck.kNote', hint:'deck.hFindNote',
    cards:[{f:'A'},{f:'B'},{f:'C'},{f:'D'},{f:'E'},{f:'F'},{f:'G'}] },
  'keys-IIVV': { kicker:'deck.kKey', hint:'deck.hPlayIIVV',
    cards:[{f:'G'},{f:'A'},{f:'C'},{f:'D'},{f:'E'}] },
  'key-inventory': { kicker:'deck.kChordSet', back:'deck.kKey', hint:'deck.hNameKey',
    cards:[{f:'G · C · D · Em',b:'G'},{f:'C · F · G · Am',b:'C'},{f:'D · G · A · Bm',b:'D'},{f:'Am · F · G · C',b:'C / Am'}] },
  'power-chord-shapes': { kicker:'deck.kPlayChord', hint:'deck.hPlayChord', cards:[{f:'A5'},{f:'G5'},{f:'C5'},{f:'D5'}] },
  'e5-vs-emajor': { kicker:'deck.kPlayChord', hint:'deck.hPlayChord', cards:[{f:'E5'},{f:'E'},{f:'E5'},{f:'E'}] },
  'chords-group1': { kicker:'deck.kChordName', hint:'deck.hPlayIt', cards:[{f:'C'},{f:'G'},{f:'Am'},{f:'F'}] },
  'chords-m5': { kicker:'deck.kChordName', hint:'deck.hPlayIt', cards:[{f:'C'},{f:'G'},{f:'Am'},{f:'F'},{f:'D'},{f:'A'},{f:'Em'},{f:'Bm'},{f:'Dm'},{f:'G/B'}] }
};
const deckDrills = {};
function dkBox(key){ return document.getElementById('dkr-' + key); }
function dkShuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const x=a[i]; a[i]=a[j]; a[j]=x; } return a; }
function dkBest(id){
  let s=0; try{ s=parseInt(sessionStorage.getItem('dkBest:'+id),10)||0; }catch(e){}
  return Math.max(s, ((games && games.dk) || {})[id] || 0);
}
function dkSaveBest(id, n){
  try{ if((parseInt(sessionStorage.getItem('dkBest:'+id),10)||0) < n) sessionStorage.setItem('dkBest:'+id, String(n)); }catch(e){}
  if(!currentUser || (typeof isDevBypassUser === 'function' && isDevBypassUser())) return;
  if(!games.dk) games.dk = {};
  if((games.dk[id]||0) >= n) return;
  games.dk[id] = n;
  games.dk.at = dayStr(new Date());   // mirrors games.sd.at — last-practised stamp
  if(typeof saveGames === 'function') saveGames();
}
function renderDeckDrill(drill, key, wid){
  const def = DECKS[drill.deck];
  if(!def) return '';
  deckDrills[key] = { phase:'setup', cfg:{ id:drill.deck, def, skill:drill.skill||null, wid } };
  return `<div class="sdr dkr" id="dkr-${escAttr(key)}">${dkSetupHtml(key)}</div>`;
}
function dkHead(key, right){
  const st = deckDrills[key];
  return `<div class="sdr-head"><span>${escHtml(t('deck.' + st.cfg.id))}</span>` +
    `<span class="sdr-meta">${escHtml(right)}</span></div>`;
}
function dkSetupHtml(key){
  const st = deckDrills[key]; if(!st) return '';
  const total = st.cfg.def.cards.length, best = dkBest(st.cfg.id);
  return dkHead(key, t('deck.headMeta', { n: total })) +
    `<div class="sdr-body">` +
      `<div class="sdr-intro">${escHtml(t(st.cfg.def.back ? 'deck.introTwo' : 'deck.introOne'))}</div>` +
      `<button type="button" class="sdr-start" onclick="dkStart('${key}')">&#x1F0CF; ${escHtml(t('deck.start'))}</button>` +
      (best ? `<div class="sdr-best">&#x1F3C6; ${escHtml(t('deck.best', { n: best, total }))}</div>` : '') +
    `</div>`;
}
function dkStart(key){
  const st = deckDrills[key]; if(!st) return;
  st.phase='run'; st.deck = dkShuffle(st.cfg.def.cards); st.i=0; st.hit=0;
  st.total = st.cfg.def.cards.length; st.shown=false;
  st.seen = new Set();   // cards already presented once — a later "Had it" doesn't count toward the first-try score
  dkBox(key).innerHTML = dkRunHtml(key);
}
function dkRunHtml(key){
  const st = deckDrills[key], def = st.cfg.def, c = st.deck[st.i];
  const front = st.shown && def.back ? c.b : c.f;
  const kicker = st.shown && def.back ? def.back : def.kicker;
  const sub = st.shown && def.back ? c.f : '';
  return dkHead(key, t('deck.cardOf', { n: st.i + 1, total: st.deck.length })) +
    `<div class="sdr-body">` +
      `<div class="dkr-card${st.shown ? ' flipped' : ''}"${st.shown ? '' : ` onclick="dkFlip('${key}')"`}>` +
        `<div class="sdr-card-kicker">${escHtml(t(kicker))}</div>` +
        `<div class="dkr-face">${escHtml(front)}</div>` +
        (sub ? `<div class="dkr-sub">${escHtml(sub)}</div>` : '') +
      `</div>` +
      (st.shown
        ? `<div class="dkr-row">` +
            `<button type="button" class="dkr-btn good" onclick="dkNext('${key}',1)">&#x2713; ${escHtml(t('deck.hadIt'))}</button>` +
            `<button type="button" class="dkr-btn again" onclick="dkNext('${key}',0)">&#x21BB; ${escHtml(t('deck.putBack'))}</button>` +
          `</div>`
        : `<div class="dkr-prompt">${escHtml(t(def.hint))}</div>` +
          `<button type="button" class="sdr-start" onclick="dkFlip('${key}')">${escHtml(t(def.back ? 'deck.check' : 'deck.done'))}</button>`) +
    `</div>`;
}
function dkFlip(key){
  const st = deckDrills[key]; if(!st || st.shown) return;
  st.shown = true; dkBox(key).innerHTML = dkRunHtml(key);
}
function dkNext(key, ok){
  const st = deckDrills[key]; if(!st) return;
  const c = st.deck[st.i];
  const firstTry = !st.seen.has(c);
  st.seen.add(c);
  if(ok){ if(firstTry) st.hit++; }
  else { st.deck.splice(Math.min(st.deck.length, st.i + 3), 0, c); }
  st.i++; st.shown = false;
  if(st.i >= st.deck.length){ st.phase='done'; dkSaveBest(st.cfg.id, st.hit); dkBox(key).innerHTML = dkDoneHtml(key); }
  else dkBox(key).innerHTML = dkRunHtml(key);
}
function dkDoneHtml(key){
  const st = deckDrills[key], clean = st.hit === st.total;
  const canCheck = clean && st.cfg.skill && progress[st.cfg.skill] !== 'gotit';
  return dkHead(key, t('deck.done')) +
    `<div class="sdr-body">` +
      `<div class="sdr-score">${st.hit} / ${st.total}</div>` +
      `<div class="sdr-score-sub">${escHtml(t('deck.scoreSub'))}</div>` +
      `<div class="sdr-verdict ${clean ? 'good' : 'mid'}">${escHtml(t(clean ? 'deck.verdictGood' : 'deck.verdictMid'))}</div>` +
      `<div class="dkr-row">` +
        `<button type="button" class="dkr-btn" onclick="dkStart('${key}')">&#x21BB; ${escHtml(t('deck.again'))}</button>` +
        (canCheck ? `<button type="button" class="dkr-btn good sdr-checkoff" onclick="dkCheckOff('${key}')">${escHtml(t('drill.checkOff'))}</button>` : '') +
      `</div>` +
    `</div>`;
}
function dkCheckOff(key){
  const st = deckDrills[key]; if(!st || !st.cfg.skill) return;
  if(progress[st.cfg.skill] !== 'gotit' && typeof toggleSkill === 'function'){
    if(toggleSkill(st.cfg.skill, st.cfg.wid, 'gotit') === false) return;   // coach gate opened instead — button stays live for a retry
  }
  const btn = dkBox(key) && dkBox(key).querySelector('.sdr-checkoff');
  if(btn){ btn.textContent = '✓ ' + t('drill.checkedOff'); btn.classList.add('done'); btn.disabled = true; }
}

/* ── Ear Spark drill (step.drill, type 'ear') ────────────────────────────
   Replaces the "shuffle six paper slips, record yourself, play it back a
   few minutes later" Ear Sparks. The deck draws a hidden sequence and
   plays it through the same Karplus-Strong playNote() the TAB players use,
   so there is nothing to write down, nothing to record, and no waiting.

   Module-data schema:
     drill: { type:'ear', pool:'openStrings'|'lowEFrets', draw:5, skill:null }

   Design calls (Jonathan, 2026-07-26):
   - The sequence is never shown before the reveal — that hiddenness IS the
     drill, and it's the one thing paper slips were actually providing.
   - Replay is unlimited and unscored. This is an optional 2-minute ear
     bonus, not a check-off; pressure belongs in the Shuffle Drill.
   - Answers go in as taps in order, with undo, so a student who hears
     note 4 first isn't forced to guess note 1 to get there. */
const EAR_POOLS = {
  openStrings: { midis:[40,45,50,55,59,64], labels:['E','A','D','G','B','e'], kicker:'ear.kString' },
  lowEFrets:   { midis:[40,41,42,43,44,45], labels:['0','1','2','3','4','5'], kicker:'ear.kFret' },
  // A-string vs D-string bass under Am (module-8.js, m8w1 Station C) — a
  // 2-option pool, same shape as the binary-choice style of lowEFrets, just
  // with 2 distinct values instead of 6.
  amBassAD:    { midis:[45,50], labels:['A','D'], kicker:'ear.kBassString' }
};
const earDrills = {};
function erBox(key){ return document.getElementById('err-' + key); }
function renderEarDrill(drill, key, wid){
  const pool = EAR_POOLS[drill.pool];
  if(!pool) return '';
  // skill: optional, same job as the Shuffle/Deck drills' cfg.skill — a
  // clean reveal (every note named right) offers the check-off inline
  // instead of sending the student to the checklist tab to do it from memory.
  earDrills[key] = { phase:'setup', cfg:{ pool, poolId: drill.pool, draw: drill.draw || 5, skill: drill.skill || null, wid } };
  return `<div class="sdr err" id="err-${escAttr(key)}">${erSetupHtml(key)}</div>`;
}
function erHead(key, right){
  const st = earDrills[key];
  return `<div class="sdr-head"><span>&#x26A1; ${escHtml(t('ear.' + st.cfg.poolId))}</span>` +
    `<span class="sdr-meta">${escHtml(right)}</span></div>`;
}
function erSetupHtml(key){
  const st = earDrills[key]; if(!st) return '';
  return erHead(key, t('ear.headMeta', { n: st.cfg.draw })) +
    `<div class="sdr-body">` +
      `<div class="sdr-intro">${escHtml(t('ear.intro', { n: st.cfg.draw }))}</div>` +
      `<button type="button" class="sdr-start" onclick="erStart('${key}')">&#x25B6; ${escHtml(t('ear.start'))}</button>` +
    `</div>`;
}
function erStart(key){
  const st = earDrills[key]; if(!st) return;
  const pool = st.cfg.pool, idx = [];
  for(let i=0;i<st.cfg.draw;i++) idx.push(Math.floor(Math.random()*pool.midis.length));
  st.phase='run'; st.seq = idx; st.guesses = new Array(st.cfg.draw).fill(null); st.revealed = false;
  erBox(key).innerHTML = erRunHtml(key);
  erPlay(key);
}
function erPlay(key){
  const st = earDrills[key]; if(!st) return;
  if(typeof stopAllDemoAudio === 'function') stopAllDemoAudio();
  st.seq.forEach((n, i) => setTimeout(() => playNote(st.cfg.pool.midis[n]), i * 1100));
}
function erRunHtml(key){
  const st = earDrills[key], pool = st.cfg.pool;
  const slots = st.seq.map((n, i) => {
    const g = st.guesses[i];
    let cls = 'err-slot';
    if(st.revealed) cls += (g === n ? ' correct' : ' wrong');
    else if(g != null) cls += ' filled';
    return `<div class="${cls}">${escHtml(st.revealed ? pool.labels[n] : (g != null ? pool.labels[g] : ''))}</div>`;
  }).join('');
  if(st.revealed){
    const right = st.seq.filter((n, i) => st.guesses[i] === n).length;
    const clean = right === st.cfg.draw;
    const canCheck = clean && st.cfg.skill && progress[st.cfg.skill] !== 'gotit';
    return erHead(key, t('ear.revealed')) +
      `<div class="sdr-body"><div class="err-slots">${slots}</div>` +
        `<div class="sdr-score">${right} / ${st.cfg.draw}</div>` +
        `<div class="sdr-score-sub">${escHtml(t('ear.scoreSub'))}</div>` +
        `<div class="dkr-row">` +
          `<button type="button" class="dkr-btn" onclick="erPlay('${key}')">&#x25B6; ${escHtml(t('ear.hearAgain'))}</button>` +
          `<button type="button" class="dkr-btn" onclick="erStart('${key}')">&#x21BB; ${escHtml(t('ear.dealMore'))}</button>` +
          (canCheck ? `<button type="button" class="dkr-btn good sdr-checkoff" onclick="erCheckOff('${key}')">${escHtml(t('drill.checkOff'))}</button>` : '') +
        `</div></div>`;
  }
  const filled = st.guesses.filter(g => g != null).length;
  const pads = pool.labels.map((l, i) =>
    `<button type="button" class="sdr-note" onclick="erGuess('${key}',${i})">${escHtml(l)}</button>`).join('');
  return erHead(key, t('ear.named', { n: filled, total: st.cfg.draw })) +
    `<div class="sdr-body"><div class="err-slots">${slots}</div>` +
      `<div class="err-pads">${pads}</div>` +
      `<div class="dkr-row">` +
        `<button type="button" class="dkr-btn" onclick="erPlay('${key}')">&#x25B6; ${escHtml(t('ear.playAgain'))}</button>` +
        `<button type="button" class="dkr-btn" onclick="erUndo('${key}')">&#x2190; ${escHtml(t('ear.undo'))}</button>` +
        (filled === st.cfg.draw ? `<button type="button" class="dkr-btn good" onclick="erReveal('${key}')">${escHtml(t('ear.check'))}</button>` : '') +
      `</div>` +
      `<div class="dkr-prompt">${escHtml(t('ear.' + pool.kicker.split('.')[1] + 'Hint'))}</div>` +
    `</div>`;
}
function erGuess(key, i){
  const st = earDrills[key]; if(!st || st.revealed) return;
  const slot = st.guesses.indexOf(null);
  if(slot < 0) return;
  st.guesses[slot] = i; erBox(key).innerHTML = erRunHtml(key);
}
function erUndo(key){
  const st = earDrills[key]; if(!st || st.revealed) return;
  let last = -1;
  st.guesses.forEach((g, i) => { if(g != null) last = i; });
  if(last < 0) return;
  st.guesses[last] = null; erBox(key).innerHTML = erRunHtml(key);
}
function erReveal(key){
  const st = earDrills[key]; if(!st) return;
  st.revealed = true; erBox(key).innerHTML = erRunHtml(key);
}
/* 100%-clean reveal earns the offer to check the skill off right here,
   the same "no memory trip to the checklist tab" move as sdCheckOff/
   dkCheckOff use for the other two drill types. */
function erCheckOff(key){
  const st = earDrills[key];
  if(!st || !st.cfg.skill) return;
  if(progress[st.cfg.skill] !== 'gotit' && typeof toggleSkill === 'function'){
    if(toggleSkill(st.cfg.skill, st.cfg.wid, 'gotit') === false) return;   // coach gate opened instead — button stays live for a retry
  }
  const box = erBox(key);
  const btn = box && box.querySelector('.sdr-checkoff');
  if(btn){
    btn.textContent = '✓ ' + t('drill.checkedOff');
    btn.classList.add('done');
    btn.disabled = true;
  }
}

/* ── "Keep it sharp" spaced-review card ──
   Up to 3 skills marked "I've got it!" (that have a practice panel), oldest
   last-practice first; anything already practiced today is considered sharp.
   Rendered at the top of every set's checklist. */
function reviewCandidates(){
  const out = [];
  SETS.forEach(w => (w.skills || []).forEach(s => {
    if(!s.practice || progress[s.id] !== 'gotit') return;
    if(daysSinceLastRep(s.id) === 0) return;   // practiced today — sharp
    const e = practiceLog[s.id];
    out.push({ s, w, last: (e && e.last) || 0 });
  }));
  out.sort((a, b) => a.last - b.last);
  return out.slice(0, 3);
}
function reviewCardHtml(){
  const cands = reviewCandidates();
  if(!cands.length) return '';
  const items = cands.map(c => {
    const last = lastPracticedLabel(c.s.id);
    return `<div class="review-item">
      <div class="review-item-main">
        <div class="review-item-text">${tf(c.s,'text')}</div>
        <div class="review-item-when" data-i18n="${last.key}"${last.params ? ` data-i18n-params='${escAttr(JSON.stringify(last.params))}'` : ''}>${t(last.key, last.params)}</div>
      </div>
      <button type="button" class="review-go-btn" onclick="reviewJump('${c.s.id}','${c.w.id}')">&#x21BB; <span data-i18n="review.practiceAgain">${t('review.practiceAgain')}</span></button>
    </div>`;
  }).join('');
  return `<div class="review-card">
    <div class="review-head"><span aria-hidden="true">&#x2726;</span><span data-i18n="review.title">${t('review.title')}</span></div>
    <div class="review-explainer" data-i18n="review.explainer">${t('review.explainer')}</div>
    <div class="review-items">${items}</div>
  </div>`;
}
function refreshReviewCards(){
  const html = reviewCardHtml();
  document.querySelectorAll('.review-slot').forEach(el => {
    el.innerHTML = html;
    if(typeof applyI18n === 'function') applyI18n(el);
  });
}
/* "Practice again" → jump to that skill's row and open its practice panel.
   Review cards can point cross-module (Search / Songs hub load every module's
   data into SETS without rendering its panels), so activate the target module
   first — same pattern as searchGoSkill/jumpToStep — or activateSet lands on
   a panel that was never built and the lesson area goes blank. */
async function reviewJump(sid, wid){
  const w = SETS.find(x => x.id === wid);
  if(!w) return;
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(w.moduleNum);
  await onModuleChange(w.moduleNum, wid);
  saveProgress();
  activateSet(wid);
  switchTabById(wid, 'checklist', true);
  const row = document.querySelector(`.week-panel[data-id="${wid}"] .skill-row[data-sid="${CSS.escape(sid)}"]`);
  if(!row) return;
  const btn = row.querySelector('.sk-practice-btn');
  const panel = document.getElementById('pp-' + sid);
  if(btn && panel && panel.hasAttribute('hidden')) togglePracticePanel(sid, btn);
  setTimeout(()=>{
    row.scrollIntoView({ behavior:'smooth', block:'center' });
    flashClass(row, 'review-flash', 1800);
  }, 60);
}

/* ── Toggle skill ── */
function openCoachGate(sid, wid){
  closeCoachGate();
  const sk = skillById(sid);
  const ov = document.createElement('div');
  ov.className = 'daily5-overlay';
  ov.id = 'coach-gate-overlay';
  ov.innerHTML = `<div class="daily5-modal" role="dialog" aria-modal="true" aria-label="${escAttr(t('gate.title'))}">
    <div class="daily5-head"><h3 style="font:inherit;margin:0">&#x1F3A4; ${t('gate.title')}</h3>
      <button type="button" class="tp-close" onclick="closeCoachGate()" aria-label="${escAttr(t('gate.closeAria'))}">&#x2715;</button></div>
    ${sk ? `<p class="coach-tip">${escHtml(tf(sk,'text'))}</p>` : ''}
    <p class="coach-tip">${escHtml(t('gate.body'))}</p>
    <div class="issue-actions">
      <button type="button" class="panel-next-btn" onclick="coachGatePractice('${escAttr(sid)}','${escAttr(wid)}')">${t('gate.practice')}</button>
      <button type="button" class="tp-btn" onclick="coachGateMarkAnyway('${escAttr(sid)}','${escAttr(wid)}')">${t('gate.markAnyway')}</button>
    </div>`;
  ov.addEventListener('click', e => { if(e.target === ov) closeCoachGate(); });
  document.body.appendChild(ov);
  document.addEventListener('keydown', coachGateEscClose);
}
function coachGateEscClose(e){ if(e.key === 'Escape') closeCoachGate(); }
function closeCoachGate(){
  const ov = document.getElementById('coach-gate-overlay');
  if(ov) ov.remove();
  document.removeEventListener('keydown', coachGateEscClose);
}
/* "Practice it now" → close the gate and open that skill's practice panel,
   where the Listening Coach button lives. The gate can open from any station
   tab (Station C offers inline check-offs), but the practice panel lives in
   the checklist tab — switch there first or everything below happens inside
   display:none. */
function coachGatePractice(sid, wid){
  closeCoachGate();
  const panel = document.getElementById('pp-'+sid);
  if(!panel) return;
  if(wid) switchTabById(wid, 'checklist', true);
  panel.removeAttribute('hidden');
  const btn = document.querySelector(`[aria-controls="pp-${CSS.escape(sid)}"]`);
  if(btn) btn.setAttribute('aria-expanded','true');
  panel.scrollIntoView({block:'center', behavior:'smooth'});
  const coachBtn = panel.querySelector('.coach-btn');
  if(coachBtn) flashClass(coachBtn, 'gate-attn', 1200);
}
/* ══════════ Shuffle-deck check-off gate ══════════
   A skill that has its own shuffle deck (a step with drill:{type:'shuffle',
   skill: sid} in the same set) asks for a 9-of-10 deck run before "I've got
   it!" can be set — the deck IS the skill ("name any fret instantly"), so a
   pass is proof, not extra homework. Same SOFT-gate philosophy as the Coach
   gate below: "Mark it anyway" always works and records the override for the
   teacher view — never a punishment, just visibility. A qualifying run earned
   ANY way opens the gate: this browser session, the per-skill best in
   games.drillSkill, or the pile bests in games.sd — that last one matters
   because two decks can be the same drill (m2w1-s3 and m3w1-s4 both deal the
   A string), and a student who already proved a string shouldn't re-prove it
   one module later. */
const DRILL_GATE_MIN = 9;      // of 10 — matches the deck's own ≥90% check-off offer
let drillSkillSession = {};    // sid → best this session (covers dev-bypass / signed-out)
function skillDrillStep(sid){
  for(const w of (SETS||[])){
    for(const stId of ['b','c']){
      const stn = w.stations && w.stations[stId];
      if(!stn) continue;
      const sections = stn.sections || (stn.steps ? [{steps: stn.steps}] : []);
      for(const sec of sections){
        for(const s of (sec.steps||[])){
          if(s.drill && s.drill.type === 'shuffle' && s.drill.skill === sid)
            return { w: w, station: stId, drill: s.drill };
        }
      }
    }
  }
  return null;
}
function skillIsDrillGated(sid){ return !!skillDrillStep(sid); }
function drillGateBest(sid){
  const rec = (typeof games !== 'undefined' && games && games.drillSkill) ? games.drillSkill[sid] : null;
  let best = Math.max(drillSkillSession[sid] || 0, (rec && rec.best) || 0);
  const hit = skillDrillStep(sid);
  if(hit){
    const str = hit.drill.string || 'lowE';
    best = Math.max(best,
      sdBest({ string: str, pile: 'naturals' }),
      sdBest({ string: str, pile: 'sharps' }));
  }
  return best;
}
/* Per-skill deck best — written on every finished run of a skill-bound deck,
   so the teacher view can tell a deck-verified got-it from a self-declared
   one (games.drillSkill[sid] = { best, at, override? }). */
function sdRecordSkillBest(c, n){
  if(!c || !c.skill) return;
  drillSkillSession[c.skill] = Math.max(drillSkillSession[c.skill] || 0, n);
  if(!currentUser || (typeof isDevBypassUser === 'function' && isDevBypassUser())) return;
  if(!games.drillSkill) games.drillSkill = {};
  const prev = games.drillSkill[c.skill] || {};
  if((prev.best || 0) >= n) return;
  games.drillSkill[c.skill] = Object.assign({}, prev, { best: n, at: dayStr(new Date()) });
  saveGames();
}
let drillGateBypass = false;
function openDrillGate(sid, wid){
  closeDrillGate();
  const sk = skillById(sid);
  const ov = document.createElement('div');
  ov.className = 'daily5-overlay';
  ov.id = 'drill-gate-overlay';
  ov.innerHTML = `<div class="daily5-modal" role="dialog" aria-modal="true" aria-label="${escAttr(t('dgate.title'))}">
    <div class="daily5-head"><h3 style="font:inherit;margin:0">&#x1F0CF; ${t('dgate.title')}</h3>
      <button type="button" class="tp-close" onclick="closeDrillGate()" aria-label="${escAttr(t('gate.closeAria'))}">&#x2715;</button></div>
    ${sk ? `<p class="coach-tip">${escHtml(tf(sk,'text'))}</p>` : ''}
    <p class="coach-tip">${escHtml(t('dgate.body'))}</p>
    <div class="issue-actions">
      <button type="button" class="panel-next-btn" onclick="drillGatePractice('${escAttr(sid)}','${escAttr(wid)}')">${t('dgate.goto')}</button>
      <button type="button" class="tp-btn" onclick="drillGateMarkAnyway('${escAttr(sid)}','${escAttr(wid)}')">${t('gate.markAnyway')}</button>
    </div>`;
  ov.addEventListener('click', e => { if(e.target === ov) closeDrillGate(); });
  document.body.appendChild(ov);
  document.addEventListener('keydown', drillGateEscClose);
}
function drillGateEscClose(e){ if(e.key === 'Escape') closeDrillGate(); }
function closeDrillGate(){
  const ov = document.getElementById('drill-gate-overlay');
  if(ov) ov.remove();
  document.removeEventListener('keydown', drillGateEscClose);
}
/* "Take me to the deck" → switch to the station tab that holds it, expand
   the step if it's collapsed, and scroll the deck into view. */
function drillGatePractice(sid, wid){
  closeDrillGate();
  const hit = skillDrillStep(sid);
  const useWid = (hit && hit.w.id) || wid;
  if(hit) switchTabById(useWid, hit.station, true);
  const box = document.querySelector(`.week-panel[data-id="${useWid}"] .sdr[data-skill="${CSS.escape(sid)}"]`);
  if(!box) return;
  const li = box.closest('li.step');
  if(li && li.classList.contains('collapsed')){
    const head = li.querySelector('.step-head');
    if(head) head.click();
  }
  setTimeout(()=>{
    box.scrollIntoView({ block:'center', behavior:'smooth' });
    flashClass(box, 'gate-attn', 1200);
  }, 60);
}
/* "Mark it anyway" → honour the student's call, but record the override so
   the teacher can see the got-it had no deck run behind it. */
function drillGateMarkAnyway(sid, wid){
  closeDrillGate();
  if(typeof games !== 'undefined' && games){
    if(!games.drillSkill) games.drillSkill = {};
    const prev = games.drillSkill[sid] || {};
    games.drillSkill[sid] = Object.assign({}, prev, {
      best: prev.best || 0,
      override: true,
      overrideAt: dayStr(new Date())
    });
    if(typeof saveGames === 'function' && currentUser && !isDevBypassUser()) saveGames();
  }
  drillGateBypass = true;
  toggleSkill(sid, wid, 'gotit');
  drillGateBypass = false;
}

/* "Mark it anyway" → honour the student's call, but record the override so
   the teacher can see the got-it had no Coach take behind it. */
function coachGateMarkAnyway(sid, wid){
  closeCoachGate();
  if(typeof games !== 'undefined' && games){
    if(!games.coachSkill) games.coachSkill = {};
    const prev = games.coachSkill[sid] || {};
    games.coachSkill[sid] = Object.assign({}, prev, {
      level: prev.level || 0,
      override: true,
      overrideAt: new Date().toISOString().slice(0,10)
    });
    if(typeof saveGames === 'function' && currentUser && !isDevBypassUser()) saveGames();
  }
  coachGateBypass = true;
  toggleSkill(sid, wid, 'gotit');
  coachGateBypass = false;
}

/* ══════════ Listening Coach check-off gate ══════════
   A skill whose practice drill is mic-checkable (playSeq / chord) asks for a
   Coach take at 💪 Good or better before "I've got it!" can be set. It is a
   SOFT gate on purpose: a dead Chromebook mic or a loud room must never trap
   a student who really can play it, so the modal always offers "Mark it
   anyway" — and records that they took it, so the teacher view can tell a
   Coach-backed got-it from a self-declared one. Skills practiced by mc / pr /
   fretboard drills are never Coach-gated — the mic can't hear a multiple-
   choice answer — but a few of those have their own shuffle deck and go
   through the deck gate above instead. */
const COACH_GATE_MIN_LEVEL = 2;      // 1 Needs work · 2 Good · 3 Great
function skillById(sid){
  for(const w of (SETS||[])){
    const hit = (w.skills||[]).find(x => x.id === sid);
    if(hit) return hit;
  }
  return null;
}
function skillIsCoachGated(sid){
  const sk = skillById(sid);
  const type = sk && sk.practice && sk.practice.type;
  return type === 'playSeq' || type === 'chord';
}
function coachSkillBest(sid){
  const rec = (typeof games !== 'undefined' && games && games.coachSkill) ? games.coachSkill[sid] : null;
  return (rec && rec.level) || 0;
}
/* Set while the student confirms "Mark it anyway" so the re-entry into
   toggleSkill skips the gate exactly once. */
let coachGateBypass = false;
function toggleSkill(sid, wid, which){
  const cur = progress[sid]||'none';
  if(which==='working'){
    if(cur==='gotit') progress[sid]='working';
    else if(cur==='working') progress[sid]='none';
    else progress[sid]='working';
  } else {
    if(cur==='gotit') progress[sid]='working';
    else {
      if(!coachGateBypass && skillIsCoachGated(sid) && coachSkillBest(sid) < COACH_GATE_MIN_LEVEL){
        openCoachGate(sid, wid);
        return false;
      }
      if(!drillGateBypass && !coachGateBypass && skillIsDrillGated(sid) && drillGateBest(sid) < DRILL_GATE_MIN){
        openDrillGate(sid, wid);
        return false;
      }
      coachGateBypass = false;
      progress[sid]='gotit'; bumpPracticeStreak();
    }
  }
  const wkSvg=`<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" stroke="var(--amber-text)" stroke-width="1.5"/><path d="M6 4v2.2l1.4 1.4" stroke="var(--amber-text)" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  const giSvg=`<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="var(--green-text)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const w=SETS.find(x=>x.id===wid);
  document.querySelectorAll(`.week-panel[data-id="${wid}"] .skill-row[data-sid="${CSS.escape(sid)}"]`).forEach(row=>{
    const wkCell = row.querySelector('.working-col');
    const giCell = row.querySelector('.gotit-col');
    if(!wkCell||!giCell) return;
    const st = progress[sid]||'none';
    wkCell.classList.toggle('active', st==='working');
    giCell.classList.toggle('active', st==='gotit');
    wkCell.setAttribute('aria-pressed', st==='working');
    giCell.setAttribute('aria-pressed', st==='gotit');
    wkCell.querySelector('.skbox').innerHTML = st==='working' ? wkSvg : '';
    giCell.querySelector('.skbox').innerHTML = st==='gotit'   ? giSvg : '';
  });
  if(w){
    const done=w.skills.filter(s=>progress[s.id]==='gotit').length;
    const pct=Math.round(done/w.skills.length*100);
    document.querySelectorAll(`#pf-${wid}`).forEach(el=>el.style.width=pct+'%');
    document.querySelectorAll(`#pl-${wid}`).forEach(el=>el.textContent=done+' / '+w.skills.length);
    // Song-thread echo: a fresh "I've got it!" in a badged set names the song
    // that just grew (rotates through the set's songs).
    if(progress[sid]==='gotit' && w.songThread && w.songThread.length){
      const echoEl = document.getElementById('se-'+wid);
      if(echoEl){
        const t = w.songThread[(done - 1) % w.songThread.length];
        echoEl.textContent = t.layer
          ? `\u{1F3B8} You just built more of ${t.name} — that\u2019s ${t.bonus ? 'Bonus ' : ''}Layer ${t.layer} work.`
          : `\u{1F3B8} You can now play more of ${t.name}.`;
        echoEl.classList.add('show');
        clearTimeout(echoEl._echoT);
        echoEl._echoT = setTimeout(()=>{ echoEl.classList.remove('show'); }, 5000);
      }
    }
  }
  renderPills(lastModuleNum);
  document.querySelectorAll('.wpill').forEach(b=>{if(b.dataset.id===wid)b.classList.add('active');});
  // Live-update the module dropdown counts + progress strip so marking a skill
  // reflects immediately without leaving the set.
  populateModuleDropdown();
  renderProgressStrip();
  refreshReviewCards();   // "Keep it sharp" card reacts to got-it changes
  saveProgress();
  return true;
}

/* ── Translate toggle ── */
// Every layer is hand-written now: the shell (i18n.js), module/lesson
// content (_es twins read through tf()), the games arcade + Listening
// Coach (coach.js via t()), and the Song Journey pages (data-es). The
// Google Translate widget is gone — a language switch is just setLang(),
// and the gc-langchange listener below refreshes the dynamic panels.
function syncTranslateBtn(){
  const btn = document.getElementById('btn-translate');
  const lbl = document.getElementById('translate-label');
  const es = getLang() === 'es';
  if(btn) btn.classList.toggle('active', es);
  if(lbl) lbl.textContent = es ? 'English' : 'Español';
}
function toggleTranslate(){
  setLang(getLang() === 'es' ? 'en' : 'es');
  syncTranslateBtn();
}
// Restore the button to the saved language on load (i18n.js already
// restored the strings themselves before app.js ran).
document.addEventListener('DOMContentLoaded', syncTranslateBtn);
// Shell re-renders that build strings dynamically (rebuilt on navigation,
// not tagged with data-i18n) need an explicit refresh on a pure language
// toggle — applyI18n's DOM walk (already run by setLang) only reaches
// elements tagged with data-i18n and can't help these.
// Module-content panels (Set / Module Review / module-level Songs) are built
// ONCE per module and cached (see ensureModuleRendered/_modulesRendered) — a
// language toggle after that first build won't reach their baked-in text on
// its own, unlike the shell strings above (which re-resolve live through
// t()). Rebuild each already-rendered module's panels from source data so
// any _es fields available get picked up (a module still mid-translation
// just falls back to English again, same as before this rebuild existed).
// Cheap: only touches modules the student actually opened this session.
const TAB_SUFFIX_SELECTOR = {
  'station-b': '.tab-station-b', 'station-c': '.tab-station-c',
  'songs': '.tab-songs', 'checklist': '.tab-checklist'
};
function rebuildModuleContentPanels(){
  document.querySelectorAll('#week-panels .week-panel').forEach(panel=>{
    const wid = panel.dataset.id;
    const num = Number(panel.dataset.module);
    const w = SETS.find(x=>x.id===wid);
    const mr = MODULE_REVIEWS[num];
    if(w && wid===w.id){
      // Remember which tab was open so rebuilding doesn't bounce the
      // student back to Station B.
      const activeEl = panel.querySelector('.tab-panel.active');
      const activeSuffix = activeEl ? activeEl.id.slice(wid.length+1) : null;
      panel.innerHTML = w.comingSoon ? buildComingSoon(w) : buildSet(w);
      if(activeSuffix && activeSuffix !== 'station-b'){
        panel.querySelectorAll('.tabs > .tabs-main .tabs-card, .tabs > .tabs-songbar > .tabs-songs').forEach(t=>t.classList.remove('active'));
        panel.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
        const targetPanel = document.getElementById(`${wid}-${activeSuffix}`);
        const targetBtn = TAB_SUFFIX_SELECTOR[activeSuffix] ? panel.querySelector(TAB_SUFFIX_SELECTOR[activeSuffix]) : null;
        if(targetPanel) targetPanel.classList.add('active');
        if(targetBtn) targetBtn.classList.add('active');
      }
    } else if(mr && wid===`mr${num}`){
      panel.innerHTML = buildModuleReview(mr);
    } else {
      return;
    }
    markModulePanelTranslated(panel, num);
  });
  if(typeof wrapAllChordLinks === 'function') wrapAllChordLinks();
  if(typeof applyI18n === 'function'){
    const c = document.getElementById('week-panels');
    if(c) applyI18n(c);
  }
}
window.addEventListener('gc-langchange', function(){
  // buildSearchIndex() now bakes in the CURRENT language via tf() — without
  // invalidating the cache here, a student who opened search before
  // switching to Spanish would keep matching only the stale English index.
  if(typeof searchIndex !== 'undefined') searchIndex = null;
  if(typeof lastModuleNum !== 'undefined' && document.getElementById('week-pills')) renderPills(lastModuleNum);
  if(typeof syncRailStations === 'function') syncRailStations();
  if(typeof populateModuleDropdown === 'function') populateModuleDropdown();
  rebuildModuleContentPanels();
  // Closed→reopen trick for the drop-over panels built at open time.
  if(document.getElementById('songs-hub-overlay') && typeof toggleSongsHub === 'function'){
    toggleSongsHub(); toggleSongsHub();
  }
  /* The full-page screens are hash-based (toggling twice would churn the
     browser history), so an open one just re-renders its body in place —
     the topbar labels are data-i18n-tagged and already re-translated. */
  const kpScreen = document.getElementById('keep-practicing-screen');
  if(kpScreen && !kpScreen.hidden && typeof renderKeepPracticing === 'function') renderKeepPracticing();
  const mpScreen = document.getElementById('my-progress-screen');
  if(mpScreen && !mpScreen.hidden && typeof renderMyProgress === 'function') renderMyProgress();
  // A live Daily 5 overlay just rebuilds its modal body in place.
  const d5 = document.querySelector('#daily5-overlay .daily5-modal');
  if(d5 && typeof buildDaily5 === 'function'){
    d5.setAttribute('aria-label', t('daily5.title'));
    d5.innerHTML = buildDaily5();
  }
});

/* ══════════════════════════════════════════════
   FLOATING TOOLS — Metronome & Timer
   ══════════════════════════════════════════════ */
let audioCtx=null;
function getAudioCtx(){ if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)(); return audioCtx; }
function beep(freq,dur,gain){ const ctx=getAudioCtx(); const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value=freq; g.gain.setValueAtTime(gain==null?0.4:gain,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur); o.start(); o.stop(ctx.currentTime+dur); }
/* Reusable single-note player. Karplus-Strong plucked-string
   synthesis: a short noise burst is fed into a feedback delay
   line whose length equals one period of the target pitch. A
   one-pole lowpass in the loop causes harmonics to decay over
   time — high notes fade faster than low notes, like a real
   guitar string. midi=69 → A4 (440Hz). */
function playNote(midi){
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const sr = ctx.sampleRate;
  const period = Math.max(2, Math.floor(sr / freq));
  const total = Math.floor(sr * 1.5);
  const ring = new Float32Array(period);
  let prev = 0;
  for (let i = 0; i < period; i++){
    const noise = Math.random() * 2 - 1;
    prev = 0.5 * (noise + prev);
    ring[i] = prev;
  }
  const buffer = ctx.createBuffer(1, total, sr);
  const data = buffer.getChannelData(0);
  const decay = 0.984;
  let idx = 0;
  for (let i = 0; i < total; i++){
    data[i] = ring[idx];
    const next = (idx + 1) % period;
    ring[idx] = decay * 0.5 * (ring[idx] + ring[next]);
    idx = next;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const g = ctx.createGain();
  g.gain.value = 0.6;
  src.connect(g);
  g.connect(ctx.destination);
  src.start();
}
/* Play one TAB beat: 1 midi = single note, N midis = chord, all at once. */
function playBeat(btnEl){
  if(window.coachMicLive) return;  // demo audio would score itself while the Coach listens
  let midis = [];
  try { midis = JSON.parse(btnEl.dataset.midis || '[]'); } catch (e) { return; }
  midis.forEach(m => playNote(Number(m)));
}
let playSeqState = null;
function stopPlaySeq(){
  if(!playSeqState) return;
  playSeqState.timeouts.forEach(clearTimeout);
  if(playSeqState.btn){
    playSeqState.btn.innerHTML = playSeqState.idleHtml || ('&#x25B6; ' + escHtml(t('step.playAll')));
    playSeqState.btn.classList.remove('playing');
  }
  if(playSeqState.tabRoot){
    playSeqState.tabRoot.querySelectorAll('.beat-now').forEach(el=>el.classList.remove('beat-now'));
  }
  playSeqState = null;
}
/* Kill every site-generated sound (demo sequences, chord strums, metronome
   click). The Coach/games call this when the mic goes live so the analyser
   never scores the speakers. */
function stopAllDemoAudio(){
  stopPlaySeq();
  chordStrumTimeouts.forEach(clearTimeout);
  chordStrumTimeouts = [];
  // clearing the strum timeouts also cancels their '.playing' cleanup — sweep it
  document.querySelectorAll('.playing').forEach(el => el.classList.remove('playing'));
  // metroRunning/stopMetro live in fab-tools.js (always loaded alongside
  // app.js on index.html) — guarded for robustness, not because it's optional.
  if(typeof metroRunning !== 'undefined' && metroRunning) stopMetro();
}
function playSequence(midis, bpm, btnEl){
  if(playSeqState){
    const wasSame = playSeqState.btn === btnEl;
    stopPlaySeq();                 // the STOP half of the toggle must work even mid-check
    if(wasSame) return;
  }
  if(window.coachMicLive) return;  // but no NEW demo audio while the Coach listens
  const interval = 60000 / (bpm || 60);
  /* Beat cursor: when the button lives inside a TAB, highlight the sounding
     column — the moving thing is the thing making noise (Ableton's rule). */
  const tabRoot = btnEl ? btnEl.closest('.tab') : null;
  /* Each entry is normally a bare midi number or an array of midis (a
     chord/dyad played on one beat). It can also be { midi, beats } so a
     note can hold longer than one beat — e.g. Watchtower's roots held
     two full beats instead of one. Bare entries default to beats:1, so
     every existing sequence schedules exactly as before. */
  let cursor = 0;
  const timeouts = midis.map((m, i) => {
    const hasBeats = m && typeof m === 'object' && !Array.isArray(m);
    const pitches = hasBeats ? m.midi : m;
    const beats = (hasBeats && m.beats > 0) ? m.beats : 1;
    const at = cursor;
    cursor += beats * interval;
    return setTimeout(() => {
      (Array.isArray(pitches) ? pitches : [pitches]).forEach(x => playNote(Number(x)));
      if(tabRoot){
        tabRoot.querySelectorAll('.beat-now').forEach(el=>el.classList.remove('beat-now'));
        tabRoot.querySelectorAll(`[data-seq="${i}"]`).forEach(el=>el.classList.add('beat-now'));
      }
    }, at);
  });
  timeouts.push(setTimeout(stopPlaySeq, cursor));
  const idleHtml = btnEl ? btnEl.innerHTML : null;
  playSeqState = { timeouts, btn: btnEl, idleHtml, tabRoot };
  if(btnEl){
    btnEl.innerHTML = '&#x23F8; ' + escHtml(t('tools.stop'));
    btnEl.classList.add('playing');
  }
}
/* ── BPM slider helpers ── */
function readStoredBpm(key, defBpm){
  if(!key) return defBpm;
  try{
    const v = localStorage.getItem(key);
    if(v != null){
      const n = parseInt(v, 10);
      if(!isNaN(n)) return n;
    }
  }catch(e){}
  return defBpm;
}
function renderBpmControl(key, value, minBpm, maxBpm){
  const min = minBpm || 40;
  const max = maxBpm || 120;
  const v = Math.max(min, Math.min(max, value || 60));
  return `<span class="bpm-control">` +
    `<input type="range" class="bpm-slider" min="${min}" max="${max}" step="1" value="${v}" data-key="${escAttr(key)}" aria-label="${escAttr(t('tools.tempoBpm'))}" oninput="onBpmSliderChange(this)">` +
    `<span class="bpm-readout">${v} BPM</span>` +
  `</span>`;
}
function onBpmSliderChange(slider){
  const readout = slider.parentNode && slider.parentNode.querySelector('.bpm-readout');
  if(readout) readout.textContent = slider.value + ' BPM';
  const key = slider.dataset.key;
  if(key){
    try{ localStorage.setItem(key, slider.value); }catch(e){}
  }
}
/* Read the BPM slider that shares a .bpm-control-group with this button.
   Single reader for the group markup contract — playSequenceFromGroup and
   the Listening Coach's coachOpen both use it. */
function readGroupBpm(btn, def){
  const group = btn.closest('.bpm-control-group');
  const slider = group ? group.querySelector('.bpm-slider') : null;
  const bpm = slider ? parseInt(slider.value, 10) : NaN;
  return isNaN(bpm) ? (def || 60) : bpm;
}
function playSequenceFromGroup(btn){
  let midis;
  try{ midis = JSON.parse(btn.dataset.midis); }catch(e){ return; }
  if(!Array.isArray(midis) || !midis.length) return;
  playSequence(midis, readGroupBpm(btn), btn);
}
/* ── Listening Coach hooks — coach.js owns the card/scoring; these just
      emit the buttons next to playable content. midisJson is the same
      JSON string the sibling ▶ Play button carries. tabNotesJson, when the
      caller has a real TAB spec, carries [{string,fret,note,midi},…] so the
      coach card can show WHERE to play each note; without it coach.js
      derives a fingering itself. ── */
/* Which checklist skills a drill can vouch for. coach.js writes each take's
   level back to these ids (games.coachSkill) and the check-off gate in
   toggleSkill reads it. Note the attribute name: a step <li> already carries
   data-skills holding skill NUMBERS, so the button uses data-coachskills
   holding full skill IDs. Omit for drills that belong to no single skill. */
function coachSkillsAttr(skillIds){
  const ids = Array.isArray(skillIds) ? skillIds : (skillIds ? [skillIds] : []);
  return ids.length ? ` data-coachskills="${escAttr(ids.join(','))}"` : '';
}
/* Step → the ids of the skills that step teaches (step.skills holds numbers). */
function stepSkillIds(w, step){
  if(!w || !step || !step.skills) return [];
  return step.skills.map(n => `${w.id}-s${n}`);
}
function coachBtnHtml(midisJson, tabNotesJson, skillIds){
  const tabAttr = tabNotesJson ? ` data-tabnotes="${escAttr(tabNotesJson)}"` : '';
  return `<button type="button" class="coach-btn" data-midis="${escAttr(midisJson)}"${tabAttr}${coachSkillsAttr(skillIds)} onclick="coachOpen(this)" title="${escAttr(t('coach.btnTitle'))}">&#x1F3A4; <span data-i18n="coach.btn">${t('coach.btn')}</span></button>`;
}
/* Chord steps: build [{n:name, m:[midis]}] from the step's own diagram
   specs (same fret math as chordMidis — frets are absolute). */
function coachChordBtnRowHtml(chords, skillIds){
  const spec = (chords||[]).filter(c=>c && c.name && Array.isArray(c.chord)).map(c=>({
    n: c.name,
    m: chordSpecMidis(c.chord)
  })).filter(c=>c.m.length);
  if(!spec.length) return '';
  return `<div class="coach-chord-row"><button type="button" class="coach-btn" data-chords="${escAttr(JSON.stringify(spec))}"${coachSkillsAttr(skillIds)} onclick="coachOpen(this)" title="4 count-in clicks, then strum on every beat — the mic listens and gives feedback">&#x1F3A4; <span data-i18n="coach.btn">${t('coach.btn')}</span></button></div>`;
}
/* One-shot animation helper: restart a CSS animation class even if it's
   already applied (remove → force reflow → add), then clear it after ms. */
function flashClass(el, cls, ms){
  if(!el) return;
  el.classList.remove(cls); void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(()=>el.classList.remove(cls), ms);
}
// Escape closes the video/games overlays (a11y). Tool-popup closing
// (metronome/timer/tuner) is handled by fab-tools.js's own Escape listener.
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape') return;
  const vo=document.getElementById('video-overlay'); if(vo&&!vo.hidden) clearPanel();
  const gs=document.getElementById('games-screen'); if(gs&&!gs.hasAttribute('hidden')&&typeof closeGamesScreen==='function') closeGamesScreen();
  if(document.body.classList.contains('rail-open')) closeRail();
});

/* Keep --hdr in sync with the header's real rendered height — on narrow
   screens the title can wrap to two lines, and the drawer/backdrop below
   position themselves off this variable, so a stale 70px would leave a gap
   or an overlap. */
function syncHeaderHeight(){
  const h = document.querySelector('.header');
  if(h) document.documentElement.style.setProperty('--hdr', h.offsetHeight + 'px');
}
window.addEventListener('resize', syncHeaderHeight);
syncHeaderHeight();
if(document.fonts && document.fonts.ready) document.fonts.ready.then(syncHeaderHeight);

/* ── Mobile nav drawer: below 760px the rail slides in as an overlay instead
   of stacking in the page flow (see styles.css @media(max-width:760px)). ── */
function isNarrowLayout(){ return window.matchMedia('(max-width:760px)').matches; }
function setRailOpen(open){
  document.body.classList.toggle('rail-open', open);
  const btn = document.getElementById('rail-toggle-btn');
  if(btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
}
function toggleRail(){ setRailOpen(!document.body.classList.contains('rail-open')); }
function closeRail(){ setRailOpen(false); }
window.addEventListener('resize', () => { if(!isNarrowLayout()) closeRail(); });
// Picking a station or an Explore item shows the main content — close the
// drawer so students actually see it instead of the nav still covering it.
document.getElementById('nav-rail')?.addEventListener('click', e => {
  if(!isNarrowLayout()) return;
  if(e.target.closest('.rail-station, .nav-btn')) closeRail();
});
// Keyboard activation for non-<button> controls that carry role="button"
// (the skill checkboxes and station cards are <div>s for layout reasons).
// Enter or Space fires their click, so keyboard-only students can mark skills
// and open stations. Space is prevented from scrolling the page.
document.addEventListener('keydown',e=>{
  if(e.key!=='Enter'&&e.key!==' '&&e.key!=='Spacebar') return;
  const el=e.target.closest('[role="button"]');
  if(!el||el.tagName==='BUTTON'||el.tagName==='A') return;
  e.preventDefault();
  el.click();
});

/* ── Resource viewer (floating mini-player) ──
   Same loadPanel(type,url,title,subtitle) contract as the old side panel,
   so every rp-trigger / song / chord-link call site works unchanged — the
   content opens in a draggable floating card and the page stays usable,
   so a step's questions are visible while its video plays. */
function loadPanel(type,url,title,subtitle){
  const overlay=document.getElementById('video-overlay');
  const content=document.getElementById('rp-content');
  const wrap=document.getElementById('rp-iframe-wrap');
  const meta=document.getElementById('rp-meta');
  const newtab=document.getElementById('rp-newtab');
  const close=document.getElementById('rp-close');
  overlay.hidden=false;
  document.body.classList.add('viewer-open');   // hides the FAB pills (they covered the player's controls)
  clampViewer(overlay);   // a drag on a bigger window could strand it off-screen
  content.classList.add('visible'); newtab.classList.add('visible'); close.classList.add('visible');
  newtab.href=url;
  meta.innerHTML=`<div class="rp-meta-title">${title}</div><div class="rp-meta-sub">${subtitle}</div>`;
  if(type==='youtube'){
    let embedUrl=url;
    const ytMatch=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if(ytMatch){
      // carry a ?t=/&start= timestamp into the embed so timed links land right
      const tMatch=url.match(/[?&](?:t|start)=(\d+)/);
      embedUrl=`https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1${tMatch?`&start=${tMatch[1]}`:''}`;
    }
    wrap.className='rp-iframe-wrap rp-youtube';
    // Some videos (age-restricted / label-limited) only play on YouTube itself,
    // and embed failures can't be detected cross-origin — always offer the out.
    wrap.innerHTML=`<div class="rp-video-box"><iframe src="${embedUrl}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div>
      <div class="rp-embed-fallback">${t('panel.embedFallbackHtml',{link:`<a href="${escAttr(url)}" target="_blank" rel="noopener">${escHtml(t('panel.watchThere'))} &#x2197;</a>`})}</div>`;
  } else if(type==='audio'){
    // Local backing track — an <audio> player that loops on its own.
    wrap.className='rp-iframe-wrap rp-audio';
    wrap.innerHTML=`<div class="rp-audio-box"><audio src="${escAttr(url)}" controls loop autoplay preload="none"></audio></div>`;
  } else if(type==='pdf'){
    wrap.className='rp-iframe-wrap rp-doc';
    wrap.innerHTML=`<iframe src="${url}"></iframe>`;
  } else if(type==='gdoc'){
    const embedUrl=url.includes('/preview')?url:url.replace(/\/edit.*$/,'/preview');
    wrap.className='rp-iframe-wrap rp-doc';
    wrap.innerHTML=`<iframe src="${embedUrl}"></iframe>`;
  } else if(type==='chord'){
    /* For chord type, `url` carries the chord NAME — render the diagram locally */
    const chordName = url;
    wrap.className='rp-iframe-wrap rp-chord';
    const svg = localChordSvg(chordName);
    if (svg){
      const hasAudio = chordMidis(chordName).length > 0;
      const playBtn = hasAudio
        ? `<button type="button" class="rp-chord-play" onclick="strumChord('${escAttr(chordName)}', this)" title="${escAttr(t('panel.strumChord'))}" data-i18n-attr="title:panel.strumChord">&#x25B6; <span data-i18n="panel.playChord">${escHtml(t('panel.playChord'))}</span></button>`
        : '';
      wrap.innerHTML = `<div class="rp-chord-svg">${svg}</div>${playBtn}`;
      newtab.classList.remove('visible'); // local render — no external URL to open
    } else {
      wrap.innerHTML = `<div class="rp-chord-err" data-i18n="panel.noDiagram" data-i18n-params="${escAttr(JSON.stringify({name:chordName}))}">${escHtml(t('panel.noDiagram',{name:chordName}))}</div>`;
      newtab.classList.remove('visible');
    }
  } else if(type==='string'){
    /* For string type, `url` carries the string KIND (lowE/A/D/G/B/highE) */
    const kind = url;
    wrap.className='rp-iframe-wrap rp-chord wide';
    const svg = localStringFretboardSvg(kind);
    if (svg){
      wrap.innerHTML = `<div class="rp-chord-svg">${svg}</div>`;
      newtab.classList.remove('visible');
    } else {
      wrap.innerHTML = `<div class="rp-chord-err">Unknown string: ${escHtml(kind)}</div>`;
      newtab.classList.remove('visible');
    }
  } else if(type==='note'){
    /* For note type, `url` carries "kind|fret|note" */
    const [kind, fretStr, note] = String(url).split('|');
    const fret = Number(fretStr);
    wrap.className='rp-iframe-wrap rp-chord wide';
    const svg = localNoteSvg(kind, fret, note);
    if (svg){
      wrap.innerHTML = `<div class="rp-chord-svg">${svg}</div>`;
      newtab.classList.remove('visible');
    } else {
      wrap.innerHTML = `<div class="rp-chord-err">No diagram for ${escHtml(note||'')}</div>`;
      newtab.classList.remove('visible');
    }
  }
}
function clearPanel(){
  const overlay=document.getElementById('video-overlay');
  const content=document.getElementById('rp-content');
  const wrap=document.getElementById('rp-iframe-wrap');
  const newtab=document.getElementById('rp-newtab');
  const close=document.getElementById('rp-close');
  content.classList.remove('visible'); newtab.classList.remove('visible'); close.classList.remove('visible');
  wrap.className='rp-iframe-wrap'; wrap.innerHTML='';   // removing the iframe stops playback
  if(overlay) overlay.hidden=true;
  document.body.classList.remove('viewer-open');
}

/* Keep the mini-player inside the viewport (after drags / window resizes). */
function clampViewer(box){
  if(!box || !box.style.left) return;   // never dragged — still CSS-docked bottom-right
  const w=box.offsetWidth||480, headroom=60;
  box.style.left=Math.min(Math.max(parseFloat(box.style.left),8),Math.max(8,window.innerWidth-w-8))+'px';
  box.style.top=Math.min(Math.max(parseFloat(box.style.top),8),Math.max(8,window.innerHeight-headroom))+'px';
}

/* Drag the mini-player by its header so it can sit wherever it doesn't
   block the step being read. First drag converts the CSS right/bottom
   docking into explicit left/top. While dragging, the iframe stops
   swallowing pointer events (.dragging CSS). */
(function(){
  const box=document.getElementById('video-overlay');
  if(!box) return;
  const head=box.querySelector('.vm-head');
  if(!head) return;
  let dragging=false,dx=0,dy=0;
  function start(x,y,target){
    if(target.closest('button,a')) return false;
    const r=box.getBoundingClientRect();
    box.style.left=r.left+'px'; box.style.top=r.top+'px';
    box.style.right='auto'; box.style.bottom='auto';
    dx=x-r.left; dy=y-r.top;
    dragging=true;
    box.classList.add('dragging');
    document.body.style.userSelect='none';
    return true;
  }
  function move(x,y){
    if(!dragging) return;
    box.style.left=Math.min(Math.max(x-dx,8),Math.max(8,window.innerWidth-box.offsetWidth-8))+'px';
    box.style.top=Math.min(Math.max(y-dy,8),Math.max(8,window.innerHeight-60))+'px';
  }
  function end(){
    if(!dragging) return;
    dragging=false;
    box.classList.remove('dragging');
    document.body.style.userSelect='';
  }
  const onMouseMove=e=>move(e.clientX,e.clientY);
  const onTouchMove=e=>{ e.preventDefault(); move(e.touches[0].clientX,e.touches[0].clientY); };
  function attach(){
    document.addEventListener('mousemove',onMouseMove);
    document.addEventListener('mouseup',endDrag);
    document.addEventListener('touchmove',onTouchMove,{passive:false});
    document.addEventListener('touchend',endDrag);
  }
  function endDrag(){
    end();
    document.removeEventListener('mousemove',onMouseMove);
    document.removeEventListener('mouseup',endDrag);
    document.removeEventListener('touchmove',onTouchMove);
    document.removeEventListener('touchend',endDrag);
  }
  head.addEventListener('mousedown',e=>{ if(start(e.clientX,e.clientY,e.target)){ e.preventDefault(); attach(); } });
  head.addEventListener('touchstart',e=>{ if(start(e.touches[0].clientX,e.touches[0].clientY,e.target)){ e.preventDefault(); attach(); } },{passive:false});
  window.addEventListener('resize',()=>clampViewer(box));
})();

/* ══════════════════════════════════════════════
   NAVIGATION — panel footers, back-to-top,
   checklist→lesson jumps, Songs hub, site search
   ══════════════════════════════════════════════ */

/* "Keep going" footer for each set tab-panel: the bottom of a long station
   used to be a dead end — you had to scroll back up to continue. */
function panelFooter(w, tab){
  const btn = (labelHtml, onclick) =>
    `<button type="button" class="panel-next-btn" onclick="${onclick}">${labelHtml} &rarr;</button>`;
  const span = key => `<span data-i18n="${key}">${escHtml(t(key))}</span>`;
  let inner = '';
  if(tab === 'station-b'){
    // Single-flow sets have no Station C — the process goes straight to the checklist.
    inner = (w.stations && !w.stations.c)
      ? btn(span('btn.nextChecklist'), `switchTabById('${w.id}','checklist')`)
      : btn(span('btn.nextStationC'), `switchTabById('${w.id}','station-c')`);
  } else if(tab === 'station-c' || tab === 'songs'){
    inner = btn(span('btn.nextChecklist'), `switchTabById('${w.id}','checklist')`);
  } else if(tab === 'checklist'){
    const sets = SETS.filter(x => x.moduleNum === w.moduleNum && !x.comingSoon);
    const i = sets.findIndex(x => x.id === w.id);
    if(i >= 0 && i < sets.length - 1){
      const next = sets[i + 1];
      const labelHtml = next.label
        ? `<span data-i18n-setlabel="${escAttr(next.label)}">${escHtml(tSetLabel(next.label))}</span>`
        : span('btn.theNextSet');
      inner = btn(`${span('btn.next')} ${labelHtml}`, `goToSet('${next.id}')`);
    } else if(MODULE_REVIEWS[w.moduleNum]){
      inner = btn(span('btn.nextModuleReview'), `goToSet('mr${w.moduleNum}')`);
    }
  }
  return inner ? `<div class="panel-next">${inner}</div>` : '';
}

/* Switch a set's tab from anywhere (footer buttons, skill jumps) by finding
   the real tabs-card button so active-state styling stays consistent. */
function switchTabById(wid, tab, keepScroll){
  const panel = document.getElementById(`${wid}-${tab}`);
  if(!panel) return;
  const wrap = panel.closest('.week-panel');
  const cardBtn = wrap && wrap.querySelector(tab === 'songs' ? '.tabs-songs' : `.tabs-card.tab-${tab}`);
  if(cardBtn) switchTab(cardBtn, wid, tab);
  if(!keepScroll){
    const tabs = wrap && wrap.querySelector('.tabs');
    (tabs || panel).scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
}

/* Which station (if any) teaches set-skill number n? Steps tag themselves
   with skills:[n] in the module data. */
function skillTaughtStation(w, n){
  for(const st of ['b','c']){
    const stn = w.stations && w.stations[st];
    if(!stn) continue;
    const sections = stn.sections || (stn.steps ? [{steps: stn.steps}] : []);
    for(const sec of sections){
      if((sec.steps || []).some(step => (step.skills || []).includes(n))) return st;
    }
  }
  return null;
}

/* Checklist "Show me where": switch to the station that teaches the skill,
   expand the sections holding its steps, scroll there and flash them. */
function showSkillLesson(wid, n){
  const w = SETS.find(x => x.id === wid);
  if(!w) return;
  const st = skillTaughtStation(w, Number(n));
  if(!st) return;
  switchTabById(wid, `station-${st}`, true);
  const panel = document.getElementById(`${wid}-station-${st}`);
  if(!panel) return;
  const matches = [...panel.querySelectorAll('li.step[data-skills]')]
    .filter(li => li.dataset.skills.split(',').includes(String(n)));
  if(!matches.length) return;
  /* Focus mode shows exactly one row, so "show me where" points at the first
     step that teaches the skill; list view still lights up all of them. */
  const dp = matches[0].closest('.dp');
  const targets = (dp && dp.classList.contains('focus')) ? matches.slice(0, 1) : matches;
  targets.forEach((li, i) => {
    expandStepEl(li, i > 0);
    flashClass(li, 'step-flash', 2600);
  });
  matches[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
}

/* Deep-link to one step (used by search results): activate module + set,
   switch to its station tab, scroll + flash the step. */
async function jumpToStep(moduleNum, wid, station, secIdx, stepIdx){
  if(await gatedJumpGuard(moduleNum, wid)) return;
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(moduleNum);
  await onModuleChange(moduleNum, wid);
  saveProgress();
  switchTabById(wid, `station-${station}`, true);
  const panel = document.getElementById(`${wid}-station-${station}`);
  if(!panel) return;
  const sections = panel.querySelectorAll('.stp-sec');
  let li = null;
  if(sections.length && sections[secIdx]){
    li = sections[secIdx].querySelectorAll('li.step')[stepIdx];
  } else {
    li = panel.querySelectorAll('li.step')[stepIdx];
  }
  if(li){
    expandStepEl(li);
    flashClass(li, 'step-flash', 2600);
    li.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}

/* ── Back to top ── */
function initBackToTop(){
  const btn = document.getElementById('back-to-top');
  if(!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
}
initBackToTop();

/* ── Top-bar panels (Songs hub · Search) — one open at a time, and they
      close Games too so the top of the page stays tidy. (The Daily 5 is a
      popup opened from Station C now, not a top-bar panel.) ── */
function closeTopPanels(except){
  /* Hash-based full pages close through their own close fns (which clear
     the URL hash); plain drop-over panels just get hidden. */
  const SCREEN_IDS = { games: 'games-screen', 'keep-practicing': 'keep-practicing-screen', 'my-progress': 'my-progress-screen' };
  ['games', 'songs-hub', 'search', 'keep-practicing', 'my-progress'].forEach(k => {
    if(k === except) return;
    if(k === 'songs-hub'){
      if(document.getElementById('songs-hub-overlay') && typeof closeSongsHub === 'function') closeSongsHub();
      return;
    }
    const p = document.getElementById(SCREEN_IDS[k] || k + '-panel');
    if(p && !p.hasAttribute('hidden')){
      if(k === 'games' && typeof closeGamesScreen === 'function'){ closeGamesScreen(); return; }
      if(k === 'keep-practicing'){ closeKeepPracticingScreen(); return; }
      if(k === 'my-progress'){ closeMyProgressScreen(); return; }
      p.setAttribute('hidden', '');
      const b = document.getElementById(k + '-btn');
      if(b) b.setAttribute('aria-expanded', 'false');
    }
  });
}

/* Picking a Set or Module review from the rail while Songs/Search/Games is
   open used to silently switch the set underneath the still-open panel — the
   click "did nothing" as far as the student could see. Close whichever panel
   is covering the page and scroll up so the new set is actually visible. */
function leaveTopPanelForSet(){
  const covering = ['games-screen', 'search-panel', 'keep-practicing-screen', 'my-progress-screen']
    .some(id => { const el = document.getElementById(id); return el && !el.hasAttribute('hidden'); })
    || !!document.getElementById('songs-hub-overlay');
  if(!covering) return;
  closeTopPanels('');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* Load every module's data (not its panels) — the Songs hub and search
   need the whole catalogue. Modules are small and the SW precaches them. */
function ensureAllModuleData(){
  return Promise.all(MODULE_MANIFEST.map(m => loadModuleData(m.num).catch(() => {})));
}

/* ── ♪ Songs hub: every song on the site, deduped, core six first ──
   Opens as a centered popup overlay (same .daily5-overlay/.daily5-modal
   shell as the Report-a-problem and Daily 5 popups), not a drop-over panel —
   so it's never left stranded at the top of the page when a student is
   scrolled deep into a practice set. */
function songsHubEscClose(e){ if(e.key === 'Escape') closeSongsHub(); }
function closeSongsHub(){
  const ov = document.getElementById('songs-hub-overlay');
  if(ov) ov.remove();
  document.removeEventListener('keydown', songsHubEscClose);
  const btn = document.getElementById('songs-hub-btn');
  if(btn) btn.setAttribute('aria-expanded', 'false');
}
async function toggleSongsHub(){
  if(document.getElementById('songs-hub-overlay')){ closeSongsHub(); return; }
  const btn = document.getElementById('songs-hub-btn');
  closeTopPanels('songs-hub');
  const ov = document.createElement('div');
  ov.className = 'daily5-overlay';
  ov.id = 'songs-hub-overlay';
  ov.innerHTML = `<div class="daily5-modal" id="songs-hub-panel" role="dialog" aria-modal="true" aria-label="${escAttr(t('hub.allSongs'))}"><div class="daily5-head"><span>&#x266A; ${t('hub.allSongs')}</span><button type="button" class="tp-close" onclick="closeSongsHub()" aria-label="${escAttr(t('hub.closeAria'))}">&#x2715;</button></div><div class="coach-tip">${t('hub.loading')}</div></div>`;
  ov.addEventListener('click', e => { if(e.target === ov) closeSongsHub(); });
  document.body.appendChild(ov);
  document.addEventListener('keydown', songsHubEscClose);
  if(btn) btn.setAttribute('aria-expanded', 'true');
  const p = document.getElementById('songs-hub-panel');
  await ensureAllModuleData();
  const byName = new Map();
  const noteSong = (song, moduleNum) => {
    const e = byName.get(song.name) || { song, modules: new Set() };
    e.modules.add(moduleNum);
    if(song.journeyUrl && !e.song.journeyUrl) e.song = song;
    byName.set(song.name, e);
  };
  SETS.filter(w => w.moduleNum === 1 && w.songs).forEach(w => w.songs.forEach(sg => noteSong(sg, 1)));
  const MS = globalThis.MODULE_SONGS || {};
  Object.keys(MS).forEach(m => MS[m].forEach(sg => noteSong(sg, Number(m))));
  const entries = [...byName.values()];
  entries.sort((a, b) => (b.song.core === true) - (a.song.core === true) || a.song.name.localeCompare(b.song.name));
  /* Two-tier layout (2026-07-23): the six Core thread songs pinned in their
     own card on top, then the Choice menu split into collapsible difficulty
     groups by the module where each song FIRST appears. Jonathan picked the
     difficulty axis over language grouping after a mockup comparison.
     Module Focus songs (core:true, type:'Focus') live inside the groups and
     keep their tag; the student-request row (request:true) renders last. */
  const isCoreSix = e => e.song.core === true && e.song.type !== 'Focus';
  const firstMod = e => Math.min(...e.modules);
  const coreEntries = entries.filter(isCoreSix);
  const requestEntries = entries.filter(e => !isCoreSix(e) && e.song.request === true);
  const rest = entries.filter(e => !isCoreSix(e) && e.song.request !== true);
  const groups = [
    { title: t('hub.groupRiffs'),  sub: t('hub.groupStart', {a: 1, b: 4}),  match: e => firstMod(e) <= 4 },
    { title: t('hub.groupChords'), sub: t('hub.groupStart', {a: 5, b: 8}),  match: e => firstMod(e) >= 5 && firstMod(e) <= 8 },
    { title: t('hub.groupAdv'),    sub: t('hub.groupStart', {a: 9, b: 12}), match: e => firstMod(e) >= 9 },
  ].map(g => ({ ...g, entries: rest.filter(g.match) })).filter(g => g.entries.length);
  const ordered = [...coreEntries, ...groups.flatMap(g => g.entries), ...requestEntries];
  songsHubList = ordered.map(e => e.song);
  let rowIdx = 0;
  const row = (e) => {
    const idx = rowIdx++;
    const sg = e.song;
    /* Index-based handlers: song names with apostrophes (Sweet Child O'
       Mine…) break when inlined into onclick. */
    const vids = [];
    if(sg.journeyUrl) vids.push(`<button class="song-vid-btn" onclick="songsHubVid(${idx},'journey')" title="${escAttr(t('songs.oneSongLayers'))}">&#x1F9F5; ${t('songs.songJourney')}</button>`);
    if(sg.tutorialUrl) vids.push(`<button class="song-vid-btn tut" onclick="songsHubVid(${idx},'tutorial')"><span class="svb-play">&#x25B6;</span>${t('songs.tutorial')}</button>`);
    if(sg.backingUrl) vids.push(`<button class="song-vid-btn" onclick="songsHubVid(${idx},'backing')"><span class="svb-play">&#x25B6;</span>&#x1F3B5; ${t('hub.backing')}${sg.backingKey ? ` (${escHtml(sg.backingKey)})` : ''}</button>`);
    if(sg.originalUrl) vids.push(`<button class="song-vid-btn" onclick="songsHubVid(${idx},'original')" title="${escAttr(t('songs.opensYoutube'))}"><span class="svb-play">&#x25B6;</span>${t('songs.original')} <span style="font-size:0.6875rem;opacity:0.6">&#x2197;</span></button>`);
    return `<div class="song-row"><div class="dot ${sg.core ? 'dc' : 'dch'}"></div>
      <div><div class="sname">${escHtml(sg.name)}</div>${sg.meta ? `<div class="smeta">${escHtml(sg.meta)}</div>` : ''}</div>
      ${vids.length ? `<div class="song-vids">${vids.join('')}</div>` : ''}
      <span class="stag ${sg.core ? 'stag-core' : ''}">${escHtml(sg.type || t(sg.core ? 'hub.tagCore' : 'hub.tagChoice'))}</span></div>`;
  };
  const renderRows = list => list.map(row).join('');
  const coreHtml = `<div class="sh-sec-title">${t('hub.coreTitle')}</div><div class="card">${renderRows(coreEntries)}</div>`;
  const groupsHtml = `<div class="sh-sec-title">${t('hub.choiceTitle')}</div>` + groups.map((g, gi) =>
    `<div class="sh-group${gi === 0 ? ' open' : ''}"><button type="button" class="sh-group-head" aria-expanded="${gi === 0}" onclick="toggleHubGroup(this)"><span>${g.title}</span><span class="sh-group-sub">${g.sub}</span><span class="sh-group-count">${t('hub.groupCount', {n: g.entries.length})}</span></button><div class="sh-group-body">${renderRows(g.entries)}</div></div>`).join('');
  const requestHtml = requestEntries.length ? `<div class="card">${renderRows(requestEntries)}</div>` : '';
  p.innerHTML = `<div class="daily5-head"><span>&#x266A; ${t('hub.allSongs')}</span><button type="button" class="tp-close" onclick="closeSongsHub()" aria-label="${escAttr(t('hub.closeAria'))}">&#x2715;</button></div>
    <div class="legend"><div class="leg"><div class="dot dc" style="margin-top:0"></div>${t('hub.legendCore')}</div><div class="leg"><div class="dot dch" style="margin-top:0"></div>${t('hub.legendChoice')}</div></div>
    ${coreHtml}${groupsHtml}${requestHtml}`;
}

/* Songs-hub difficulty group open/close (header button). */
function toggleHubGroup(btn){
  const g = btn.closest('.sh-group');
  if(!g) return;
  const open = g.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(open));
}
let songsHubList = [];
function songsHubVid(idx, kind){
  openSongVid(songsHubList[idx], kind);
}
async function songHubGoModule(m){
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(m);
  await onModuleChange(m);
  saveProgress();
  closeTopPanels('');
  // onModuleChange → activateSet restored the target set's scroll (top if new).
}

/* ── 🔍 Site search: steps, skills, and set titles across all modules ── */
let searchIndex = null;
async function buildSearchIndex(){
  await ensureAllModuleData();
  const ix = [];
  SETS.forEach(w => {
    if(w.comingSoon) return;
    // tf() picks the _es twin when the student is in Spanish mode (falling
    // back to English where no twin exists yet) — without it, Spanish-mode
    // search only ever matched English-only indexed text.
    if(w.unit) ix.push({ kind: 'set', moduleNum: w.moduleNum, wid: w.id, label: w.label, text: tf(w, 'unit') });
    (w.skills || []).forEach(sk => {
      const num = (sk.id.match(/-s(\d+)$/) || [])[1];
      ix.push({ kind: 'skill', moduleNum: w.moduleNum, wid: w.id, label: w.label, text: tf(sk, 'text'), skillNum: num ? Number(num) : null });
    });
    ['b', 'c'].forEach(st => {
      const stn = w.stations && w.stations[st];
      if(!stn) return;
      const rawSections = stn.sections || (stn.steps ? [{title: '', steps: stn.steps}] : []);
      // Must mirror sectionsHtml()'s filtering — jumpToStep() indexes into
      // the rendered `.stp-sec` DOM, which drops tuning-warmup sections.
      const sections = rawSections.filter(sec => !isTuningWarmupSection(sec, w.moduleNum));
      sections.forEach((sec, secIdx) => (sec.steps || []).forEach((step, stepIdx) => {
        const text = stripTags(tf(step, 'text') || '');
        if(text) ix.push({ kind: 'step', moduleNum: w.moduleNum, wid: w.id, label: w.label, station: st, secIdx, stepIdx, secTitle: sec.title || '', text });
      }));
    });
  });
  /* Songs — also indexed by the chords named in their meta text, so a query
     like "G C D" can find every song playable with just those shapes.
     Module 1's songs live on SETS; modules 2+ live in MODULE_SONGS. Dedup by
     name (a song taught in multiple modules only needs one entry to search). */
  const songSeen = new Map();
  const indexSong = (song, moduleNum, wid) => {
    if(!song || !song.name) return;
    // Chord names are matched against the always-English `meta` (chord
    // symbols aren't translated), but the indexed/displayed text uses
    // tf() so Spanish-mode search matches the meta_es wording too.
    const metaText = song.meta || '';
    const metaTextShown = tf(song, 'meta') || '';
    const chords = new Set();
    const re = new RegExp(CHORD_RE.source, 'g');
    let m;
    while((m = re.exec(metaText)) !== null) chords.add(m[2]);
    const existing = songSeen.get(song.name);
    if(existing){
      /* Same song taught again in a later module (e.g. Module 1's "Listen"
         intro vs. its full chord chart in Module 6/7) — merge in any chords
         found there instead of letting the earlier, often chordless, entry
         permanently hide the song from chord-based search. */
      chords.forEach(c => { if(!existing.chords.includes(c)) existing.chords.push(c); });
      return;
    }
    const entry = { kind: 'song', moduleNum, wid, text: song.name + (metaTextShown ? ' ' + metaTextShown : ''), chords: [...chords] };
    songSeen.set(song.name, entry);
    ix.push(entry);
  };
  SETS.forEach(w => { if(w.moduleNum === 1 && w.songs) w.songs.forEach(sg => indexSong(sg, 1, w.id)); });
  const MS2 = globalThis.MODULE_SONGS || {};
  Object.keys(MS2).forEach(m => (MS2[m] || []).forEach(sg => indexSong(sg, Number(m), null)));
  return ix;
}
async function toggleSearch(){
  const p = document.getElementById('search-panel');
  const btn = document.getElementById('search-btn');
  if(!p) return;
  const open = p.hasAttribute('hidden');
  if(!open){ p.setAttribute('hidden', ''); if(btn) btn.setAttribute('aria-expanded', 'false'); return; }
  closeTopPanels('search');
  p.removeAttribute('hidden');
  if(btn) btn.setAttribute('aria-expanded', 'true');
  p.innerHTML = `<div class="daily5-head"><span>&#x1F50D; <span data-i18n="search.title">${escHtml(t('search.title'))}</span></span><button type="button" class="tp-close" onclick="toggleSearch()" aria-label="${escAttr(t('search.closeAria'))}" data-i18n-attr="aria-label:search.closeAria">&#x2715;</button></div>
    <input type="search" class="search-input" id="search-input" placeholder="${escAttr(t('search.placeholder'))}" oninput="runSearch(this.value)" aria-label="${escAttr(t('search.ariaLabel'))}" data-i18n-attr="placeholder:search.placeholder;aria-label:search.ariaLabel">
    <div id="search-results" class="search-results"><div class="coach-tip" data-i18n="search.gettingReady">${escHtml(t('search.gettingReady'))}</div></div>`;
  const input = document.getElementById('search-input');
  if(input) input.focus();
  if(!searchIndex) searchIndex = await buildSearchIndex();
  const res = document.getElementById('search-results');
  if(res && res.querySelector('.coach-tip')) res.innerHTML = `<div class="coach-tip" data-i18n="search.intro" data-i18n-params="${escAttr(JSON.stringify({n:MODULE_MANIFEST.length}))}">${escHtml(t('search.intro',{n:MODULE_MANIFEST.length}))}</div>`;
}
function runSearch(q){
  const res = document.getElementById('search-results');
  if(!res || !searchIndex) return;
  q = (q || '').trim().toLowerCase();
  if(q.length < 2){ res.innerHTML = `<div class="coach-tip">${escHtml(t('search.typeMore'))}</div>`; return; }
  const terms = q.split(/\s+/).filter(Boolean);
  /* "G C D" — a space-separated list of known chord names — asks "what can I
     play with just these shapes?" rather than a text search. Match songs
     whose whole indexed chord set is covered by the chords the student named
     (a student who knows only G, C, D can play a song that uses G and C, but
     not one that also needs Em). Needs 2+ terms so an ordinary word that
     happens to share a chord's spelling (e.g. "am") doesn't get hijacked. */
  const isChordQuery = terms.length >= 2 && terms.every(t => CHORD_NAME_LOOKUP.has(t));
  const scored = [];
  if(isChordQuery){
    const known = new Set(terms.map(t => CHORD_NAME_LOOKUP.get(t)));
    for(const e of searchIndex){
      if(e.kind !== 'song' || !e.chords || !e.chords.length) continue;
      if(!e.chords.every(c => known.has(c))) continue;
      scored.push({ e, score: e.chords.length });
      if(scored.length > 400) break;
    }
  } else {
    for(const e of searchIndex){
      const hay = e.text.toLowerCase();
      if(!terms.every(t => hay.includes(t))) continue;
      scored.push({ e, score: (e.kind === 'skill' ? 2 : e.kind === 'set' ? 1 : 0) + (hay.indexOf(terms[0]) < 40 ? 1 : 0) });
      if(scored.length > 400) break;
    }
  }
  scored.sort((a, b) => b.score - a.score || a.e.moduleNum - b.e.moduleNum);
  const top = scored.slice(0, 25);
  if(!top.length){
    res.innerHTML = isChordQuery
      ? `<div class="coach-tip">${escHtml(t('search.noChordSongs',{chords:terms.join(', ').toUpperCase()}))}</div>`
      : `<div class="coach-tip">${escHtml(t('search.noMatches',{q}))}</div>`;
    return;
  }
  const snippet = (text) => {
    const at = text.toLowerCase().indexOf(terms[0]);
    const start = Math.max(0, at - 30);
    let cut = text.slice(start, start + 110);
    if(start > 0) cut = '…' + cut;
    if(start + 110 < text.length) cut += '…';
    return escHtml(cut);
  };
  res.innerHTML = top.map(({e}) => {
    const where = e.kind === 'song'
      ? t('search.whereSong', {n:e.moduleNum})
      : t('search.whereSet', {n:e.moduleNum, label:escHtml(e.label || '')}) +
        (e.kind === 'step' ? t('search.whereStation', {station:e.station.toUpperCase()}) : e.kind === 'skill' ? t('search.whereSkill') : '');
    const onclick = e.kind === 'step'
      ? `searchGo(${e.moduleNum},'${e.wid}','${e.station}',${e.secIdx},${e.stepIdx})`
      : e.kind === 'skill' && e.skillNum != null
        ? `searchGoSkill(${e.moduleNum},'${e.wid}',${e.skillNum})`
        : e.kind === 'song'
          ? (e.wid ? `searchGoSet(${e.moduleNum},'${e.wid}')` : `songHubGoModule(${e.moduleNum})`)
          : `searchGoSet(${e.moduleNum},'${e.wid}')`;
    return `<button type="button" class="search-hit" onclick="${onclick}">
      <span class="search-hit-where">${where}</span>
      <span class="search-hit-text">${snippet(e.text)}</span>
    </button>`;
  }).join('');
}
async function searchGo(moduleNum, wid, station, secIdx, stepIdx){
  closeTopPanels('');
  await jumpToStep(moduleNum, wid, station, secIdx, stepIdx);
}
// Search / deep-link guard: if the jump target is gated, land the student on
// the module (their frontier) and tell them why, rather than trying to reveal a
// hidden locked panel. Returns true when it handled a locked target.
async function gatedJumpGuard(moduleNum, wid){
  const w = SETS.find(x => x.id === wid);
  if(!(w && isSetLocked(w))) return false;
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(moduleNum);
  await onModuleChange(moduleNum);
  saveProgress();
  gateToast(t('gate.unlocksAfter', { set: tSetLabel(w.label), prev: tSetLabel(prevSetLabel(w)) }));
  return true;
}
async function searchGoSkill(moduleNum, wid, skillNum){
  closeTopPanels('');
  if(await gatedJumpGuard(moduleNum, wid)) return;
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(moduleNum);
  await onModuleChange(moduleNum, wid);
  saveProgress();
  const w = SETS.find(x => x.id === wid);
  if(w && skillTaughtStation(w, skillNum)) showSkillLesson(wid, skillNum);
  else switchTabById(wid, 'checklist');
}
async function searchGoSet(moduleNum, wid){
  closeTopPanels('');
  if(await gatedJumpGuard(moduleNum, wid)) return;
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(moduleNum);
  await onModuleChange(moduleNum, wid);
  saveProgress();
  // onModuleChange → activateSet restored the target set's scroll (top if new).
}

/* ── 🔁 Keep practicing: every skill marked "still working on it", grouped
   by module, with a jump link back to that skill ── */
/* ── 🔁 Keep practicing: its own full-screen page — #keep-practicing in the
      URL, browser Back exits (the games-screen pattern, in the site's normal
      look). Decision + full-page treatment for My progress: 2026-07-23. ── */
function toggleKeepPracticing(){
  const screen = document.getElementById('keep-practicing-screen');
  if(!screen) return;
  if(screen.hasAttribute('hidden')) location.hash = 'keep-practicing';
  else closeKeepPracticingScreen();
}
function openKeepPracticingScreen(){
  const screen = document.getElementById('keep-practicing-screen');
  if(!screen || !screen.hasAttribute('hidden')) return;
  closeTopPanels('keep-practicing');
  screen.removeAttribute('hidden');
  document.body.classList.add('page-screen-open');
  const btn = document.getElementById('keep-practicing-btn');
  if(btn) btn.setAttribute('aria-expanded', 'true');
  /* Focus follows into the dialog; kpClosePanel hands it back to the button. */
  const exit = screen.querySelector('.page-exit');
  if(exit) exit.focus();
  renderKeepPracticing();
}
async function renderKeepPracticing(){
  const bodyEl = document.getElementById('keep-practicing-body');
  if(!bodyEl) return;
  bodyEl.innerHTML = `<div class="coach-tip">${t('kp.loading')}</div>`;
  await ensureAllModuleData();
  const byModule = new Map();
  SETS.forEach(w => {
    (w.skills || []).forEach(sk => {
      if(progress[sk.id] !== 'working') return;
      const num = (sk.id.match(/-s(\d+)$/) || [])[1];
      if(!num) return;
      const g = byModule.get(w.moduleNum) || [];
      g.push({ wid: w.id, setLabel: tSetLabel(w.label), skillNum: Number(num), text: tf(sk,'text') });
      byModule.set(w.moduleNum, g);
    });
  });
  const modNums = [...byModule.keys()].sort((a, b) => a - b);
  if(!modNums.length){
    bodyEl.innerHTML = `<div class="coach-tip">${t('kp.emptyHtml')}</div>`;
    return;
  }
  bodyEl.innerHTML = modNums.map(mn => {
    const m = MODULE_MANIFEST.find(x => x.num === mn);
    const rows = byModule.get(mn).map(it =>
      `<button type="button" class="search-hit" onclick="searchGoSkill(${mn},'${it.wid}',${it.skillNum})">
        <span class="search-hit-where">${escHtml(it.setLabel || '')}</span>
        <span class="search-hit-text">${escHtml(it.text)}</span>
      </button>`).join('');
    return `<div class="rail-sec-label" style="margin:16px 0 6px">${t('nav.module')} ${mn}${m ? ` — ${escHtml(tf(m,'name'))}` : ''}</div>
      <div class="search-results" style="max-height:none">${rows}</div>`;
  }).join('');
}
function closeKeepPracticingScreen(){
  if(location.hash === '#keep-practicing'){ location.hash = ''; return; }  // hashchange finishes the job
  kpClosePanel();
}
function kpClosePanel(){
  const screen = document.getElementById('keep-practicing-screen');
  const wasOpen = screen && !screen.hasAttribute('hidden');
  if(screen) screen.setAttribute('hidden', '');
  if(!document.querySelector('.page-screen:not([hidden])')) document.body.classList.remove('page-screen-open');
  const btn = document.getElementById('keep-practicing-btn');
  if(btn){
    btn.setAttribute('aria-expanded', 'false');
    if(wasOpen) btn.focus();   // return focus to where the dialog was opened
  }
}

/* ── 📊 My progress: done/total for every module + a total mastered count.
      Full-screen page like Keep practicing — #my-progress, Back exits. ── */
function toggleMyProgress(){
  const screen = document.getElementById('my-progress-screen');
  if(!screen) return;
  if(screen.hasAttribute('hidden')) location.hash = 'my-progress';
  else closeMyProgressScreen();
}
function openMyProgressScreen(){
  const screen = document.getElementById('my-progress-screen');
  if(!screen || !screen.hasAttribute('hidden')) return;
  closeTopPanels('my-progress');
  screen.removeAttribute('hidden');
  document.body.classList.add('page-screen-open');
  const btn = document.getElementById('my-progress-btn');
  if(btn) btn.setAttribute('aria-expanded', 'true');
  const exit = screen.querySelector('.page-exit');
  if(exit) exit.focus();
  renderMyProgress();
}
function closeMyProgressScreen(){
  if(location.hash === '#my-progress'){ location.hash = ''; return; }  // hashchange finishes the job
  mpClosePanel();
}
function mpClosePanel(){
  const screen = document.getElementById('my-progress-screen');
  const wasOpen = screen && !screen.hasAttribute('hidden');
  if(screen) screen.setAttribute('hidden', '');
  if(!document.querySelector('.page-screen:not([hidden])')) document.body.classList.remove('page-screen-open');
  const btn = document.getElementById('my-progress-btn');
  if(btn){
    btn.setAttribute('aria-expanded', 'false');
    if(wasOpen) btn.focus();
  }
}
function renderMyProgress(){
  const bodyEl = document.getElementById('my-progress-body');
  if(!bodyEl) return;
  let totalDone = 0, totalAll = 0;
  const rows = MODULE_MANIFEST.map(m => {
    const { done, total } = moduleCompletion(m);
    totalDone += done; totalAll += total;
    const pct = total ? Math.round(done / total * 100) : 0;
    return `<div style="padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:0.875rem;font-weight:600">${t('nav.module')} ${m.num} — ${escHtml(tf(m,'name'))}</div>
      <div class="prog-wrap"><div class="prog-row"><div class="prog-bg"><div class="prog-fill" style="width:${pct}%"></div></div><div class="prog-lbl">${done} / ${total}</div></div></div>
    </div>`;
  }).join('');
  bodyEl.innerHTML = `<div class="coach-tip" data-i18n="progress.skillsMastered" data-i18n-params="${escAttr(JSON.stringify({done:totalDone,total:totalAll,modules:MODULE_MANIFEST.length}))}">${t('progress.skillsMastered',{done:totalDone,total:totalAll,modules:MODULE_MANIFEST.length})}</div>
    <div class="card">${rows}</div>`;
  if(typeof applyI18n === 'function') applyI18n(bodyEl);
}

/* Hash router for the two full-page screens (the games arcade has its own
   listener in coach.js; its else-branch close is a safe no-op here). */
window.addEventListener('hashchange', () => {
  if(location.hash === '#keep-practicing') openKeepPracticingScreen();
  else kpClosePanel();
  if(location.hash === '#my-progress') openMyProgressScreen();
  else mpClosePanel();
});

/* ════════════════════════════════════════════════
   Service worker — light PWA / offline resilience.
   Registers on any http(s) origin (incl. Live Server's
   http://localhost and the live GitHub Pages site); skipped
   when the file is opened directly via file://. See sw.js + CLAUDE.md.
   ════════════════════════════════════════════════ */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    /* Was this page already controlled by a service worker when it loaded?
       If so, a later "controllerchange" means a NEW version just took over
       (see sw.js: install→skipWaiting→activate→clients.claim on every push).
       The cached shell that already loaded is now stale, so reload ONCE to
       pick up the fresh code automatically — no more reloading two or three
       times after a deploy, and returning students stop sitting on old code.
       A first-ever visit has no controller yet, so it must NOT reload (that
       would bounce the very first load). */
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').catch(() => {/* offline support is best-effort */});
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || window.__swReloading) return;
      window.__swReloading = true;
      const reload = () => {
        // Don't yank the page out from under a live mic check / count-in.
        if (window.coachMicLive) { setTimeout(reload, 1500); return; }
        location.reload();
      };
      reload();
    });
  });
}
