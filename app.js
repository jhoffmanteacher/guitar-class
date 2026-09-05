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
      msg.setAttribute('data-i18n', 'offline.body');   // setLang's applyI18n(document) sweep retranslates a banner that's up during a language switch
      msg.textContent = t('offline.body');
      const close = document.createElement('button');
      close.setAttribute('data-i18n-attr', 'aria-label:offline.dismiss');
      close.setAttribute('aria-label', t('offline.dismiss'));
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
let classActivities = {};   // In-Class Activities completion: id → true (own top-level Firestore field, not a `completed` key — see the work order this shipped from)
let games       = {};   // per-game bests from the games arcade (coach.js) — its own save category
let streak      = { count:0, lastDay:null };   // site-wide practice streak, independent of any one game
let gamesAccessOn = true; // whether the Games arcade is available to THIS student (teacher-controlled; see loadClassConfig)
let accountPaused = false; // teacher put this student on hold (see loadClassConfig / showPausedScreen)
let hiddenActivityIds = {}; // In-Class Activities the teacher has temporarily hidden (see loadClassConfig) — id -> true
let activityDates = {}; // In-Class Activities release dates, teacher-set in the console (see loadClassConfig) — id -> 'YYYY-MM-DD'
let activityTitles = {}; // In-Class Activity renames, teacher-set in the console (see loadClassConfig / caTitle) — id -> { en, base }
let activityNumbers = {}; // In-Class Activity renumbering, teacher-set in the console (see loadClassConfig / caNumber) — id -> { n, base }
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
    // Drop the promise so a later visit retries — and remove the failed tag
    // with it, or every retry orphans another dead <script> in <head>
    // (loadFirestoreSdk does the same for the same reason).
    s.onerror = ()=>{ s.remove(); delete _moduleLoads[num]; reject(new Error('module '+num+' failed to load')); };
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
let _dirtyKeys = new Set();   // which categories need writing: skills · place · responses · completed · classActivities · games · streak · practiceLog
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
  /* Re-entrancy guard. A second click is never useful and is sometimes
     destructive: a second signInWithPopup while the first is still open makes
     Firebase reject the FIRST one with auth/cancelled-popup-request, so the
     student's completed sign-in is thrown away and they have to start over —
     the "it signed me in and then made me do it again" report. The header
     button and the wall button both land here, and both are reachable while a
     sign-in is already in flight. */
  if(window.__authPopupPending || currentUser) return;
  showAuthError('');
  // Pre-warm the Firestore SDK while the student is in the Google popup, so it's
  // ready to load progress the moment they're back. Errors are ignored — the
  // real load attempt (ensureDb) will surface any problem.
  loadFirestoreSdk().catch(()=>{});
  // Flag read by the service-worker update handler at the bottom of this file:
  // a post-deploy auto-reload while the Google popup is open destroys the
  // pending signInWithPopup promise, so the student finishes the popup and
  // lands back on the sign-in wall having signed in for nothing. The reload
  // waits for this.
  window.__authPopupPending = true;
  try{
    auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .catch(e=>{
        // The student just closed/cancelled the popup — not an error worth nagging about.
        if(e && (e.code==='auth/popup-closed-by-user' || e.code==='auth/cancelled-popup-request')) return;
        showAuthError(t('auth.signInFailed'));
      })
      .finally(()=>{ window.__authPopupPending = false; });
  } catch(e){
    // Nothing attached the .finally() above, so clear the flag here or the
    // guard would lock the button out for the rest of the visit.
    window.__authPopupPending = false;
    showAuthError(t('auth.signInFailed'));
  }
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

/* Which mode is this page in? Both flags live here, in the first script that
   needs them.

   IS_TEACHER_MODE used to be declared in teacher.js, which loads AFTER app.js
   — and the auth callback below reads it bare. That made every student's
   sign-in depend on teacher.js having arrived: one dropped request on school
   Wi-Fi and the callback threw a ReferenceError for the whole class, leaving
   them on "Signed in — loading…" forever (the stall prompt's reload just
   repeats it). Declaring it here means the student path never depends on the
   teacher script at all. */
const IS_TEACHER_MODE = new URLSearchParams(window.location.search).has('teacher');
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

/* The auth wall has two states (index.html): a button-free note
   (#auth-checking) and the Sign in with Google buttons (#auth-signin). The
   note is the default and the buttons appear only once Firebase has actually
   answered "signed out".

   Both directions exist to stop a student signing in twice:
   - Before this split the sign-in wall was the default on every page load, so
     the automatic post-deploy reload (service worker, bottom of this file)
     flashed it at students whose session was about to restore fine.
   - And a "signed in" answer is not the end of it — showApp() only runs after
     loadProgress() + loadClassConfig(), i.e. a ~100 KB Firestore SDK download
     and two reads. On school Wi-Fi that leaves the student looking at a live
     Sign in with Google button for 5-15 seconds AFTER they finished the Google
     popup, which is exactly when they click it again. So the signed-in branch
     of onAuthStateChanged puts the wall back into the note state
     ('auth.loading') before it awaits anything.

   The 6 s timer is a safety net: if onAuthStateChanged somehow never fires (it
   always should once the SDK is up), the student still gets a sign-in button
   rather than an eternal note. showFirebaseLoadError() replaces the whole
   wall, so the blocked-SDK path is unaffected. */
function setAuthWallChecking(key){
  const c = document.getElementById('auth-checking');
  const p = document.getElementById('auth-checking-msg');
  const s = document.getElementById('auth-signin');
  // Retag for i18n as well as retitle, so a language switch mid-load re-renders
  // the line that's actually showing rather than snapping back to 'auth.checking'.
  if(p){ p.setAttribute('data-i18n', key); p.textContent = t(key); }
  if(c) c.hidden = false;
  if(s) s.hidden = true;
  clearAuthStallTimer();   // whichever wait this is, it starts over
}
function revealAuthWallSignIn(){
  const c = document.getElementById('auth-checking');
  const s = document.getElementById('auth-signin');
  clearAuthStallTimer();
  if(c) c.hidden = true;
  if(s) s.hidden = false;
}

/* Escape hatch for a wait that stops being normal. Hiding the sign-in button
   during the post-sign-in load is what fixes the double sign-in, but it leaves
   the student with no button at all — and loadProgress() can wait indefinitely,
   because a Firestore get() on a network that accepts connections and then
   stalls retries forever rather than rejecting. So after 20 s, offer a reload.
   Reloading is safe here and always the right move: the sign-in is already
   persisted (they come back signed in, not to the wall), and progress writes
   go through a debounce that has nothing queued this early. 20 s is well past
   a slow-but-working school-Wi-Fi load, so a student who is merely waiting
   never sees it. */
let _authStallTimer = null;
function startAuthStallTimer(){
  clearTimeout(_authStallTimer);
  _authStallTimer = setTimeout(()=>{
    const el = document.getElementById('auth-stalled');
    // showFirebaseLoadError() rewrites the whole wall, so the node can be gone.
    if(el) el.hidden = false;
  }, 20000);
}
function clearAuthStallTimer(){
  clearTimeout(_authStallTimer); _authStallTimer = null;
  const el = document.getElementById('auth-stalled');
  if(el) el.hidden = true;
}
let _authRevealTimer = firebaseReady ? setTimeout(revealAuthWallSignIn, 6000) : null;
if(!firebaseReady) revealAuthWallSignIn();   // wall content is being replaced anyway — don't strand the checking note

if(auth) auth.onAuthStateChanged(async user=>{
  clearTimeout(_authRevealTimer);
  if(user){
    currentUser = user;
    // They're in — but showApp() is still two Firestore round trips away.
    // Take BOTH sign-in buttons off the screen NOW, before the awaits below,
    // or the student spends that whole wait looking at a sign-in page they
    // just came back from and signs in a second time. See setAuthWallChecking().
    // The header goes straight to the real user header rather than blank: their
    // own name appearing is the clearest possible "it worked, stop clicking",
    // and it's the same markup showApp()/showTeacherApp() is about to write.
    setAuthWallChecking('auth.loading');
    document.getElementById('user-area').innerHTML = userHeaderHtml(user);
    startAuthStallTimer();   // ...but don't strand them there if the load never finishes
    if(IS_TEACHER_MODE){ showTeacherApp(user); clearAuthStallTimer(); }
    else {
      await loadProgress(); await loadClassConfig();
      clearAuthStallTimer();   // cleared here, not inside showApp/showPausedScreen, so every exit from the wait is covered
      if(accountPaused) showPausedScreen(user); else showApp(user);
    }
  } else {
    currentUser = null; progress = {}; responses = {}; completed = {}; completedDeletes = new Set(); classActivities = {}; classActivitiesDeletes = new Set(); games = {}; streak = { count:0, lastDay:null }; gamesAccessOn = true; hiddenActivityIds = {}; activityDates = {}; activityTitles = {}; activityNumbers = {}; progressLoadFailed = false;
    if(typeof gamesResetForUser === 'function') gamesResetForUser();   // Note Runner's module caches must not leak into the next signed-in user
    if(typeof lqStopListening === 'function') lqStopListening();       // and the live-quiz listener must not keep firing under the next student
    practiceLog = loadLocalPracticeLog();   // per-skill rep history: back to the local copy on sign-out
    _moduleStripStates = {};   // next user's first strip render is a first paint, not a celebration
    revealAuthWallSignIn();   // a real "signed out" answer — checking is over, show the buttons
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
      `<div class="paused-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;display:block;margin:0 auto"><circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/></svg></div>`+
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
  maybeShowCaReminder();
  // One long-lived listener on the live-quiz session doc, so a game the
  // teacher starts mid-period reaches a student who's had the site open all
  // along. Guarded: live-quiz.js is a separate deferred script.
  if(typeof lqStartListening === 'function') lqStartListening();
}

/* A bookmarked/reloaded explore-page URL (#games, #songs, #keep-practicing,
   #daily-review, #my-progress) opens that page once the app is on screen. */
function maybeShowApp_gamesHash(){
  routeExploreHash();
}

/* ── Firestore ── */
/* Did we actually read this student's doc? A failed read leaves every local
   store empty — which is indistinguishable from a brand-new student unless we
   say so. Two things key off this flag, because "empty" means "unknown", not
   "nothing there": the sequential gate stops locking (their real work is on the
   server, and a blocked school network must not wall them out of sets they
   finished weeks ago), and the derived save categories are held back so a
   session started from a blank slate can't overwrite the real record. */
let progressLoadFailed = false;
async function loadProgress(){
  progressLoadFailed = false;
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
      classActivities = doc.data().classActivities || {};
      games         = doc.data().games || {};
      streak        = doc.data().streak || { count:0, lastDay:null };
      // practiceLog (per-skill rep history): Firestore is the source of truth
      // when signed in; fall back to the localStorage copy for older docs that
      // predate the field, then mirror back so the offline copy stays fresh.
      practiceLog   = doc.data().practiceLog || loadLocalPracticeLog();
      savePracticeLogLocal();
      songReady     = doc.data().songReady || {};
      songReadyAt   = doc.data().songReadyAt || {};
    } else { progress={}; lastModuleNum=1; lastSetId=null; responses={}; completed={}; classActivities={}; games={}; streak={ count:0, lastDay:null }; practiceLog=loadLocalPracticeLog(); songReady={}; songReadyAt={}; restoreLocalPlace(); }
  } catch(e){ progressLoadFailed=true; console.warn('[guitar-class] progress load failed — running read-only on derived data', e); progress={}; lastModuleNum=1; lastSetId=null; responses={}; completed={}; classActivities={}; games={}; streak={ count:0, lastDay:null }; practiceLog=loadLocalPracticeLog(); songReady={}; songReadyAt={}; restoreLocalPlace(); }
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
  hiddenActivityIds = {};
  activityDates = {};
  activityTitles = {};
  activityNumbers = {};
  try{
    await ensureDb();
    if(!db){ restoreActivityDatesFromCache(); return; }
    const doc = await db.collection('config').doc('class').get();
    if(!doc.exists){ restoreActivityDatesFromCache(); return; }
    const d = doc.data()||{};
    // Teacher-set hold (teacher.js Manage view). Classroom management, not
    // security — the real boundary is the Firestore rules, which already
    // stop a student reading or writing anyone else's doc.
    accountPaused = (d.paused||{})[currentUser.uid] === true;
    const ov = (d.gameOverrides||{})[currentUser.uid];
    if(ov===true)       gamesAccessOn = true;
    else if(ov===false) gamesAccessOn = false;
    else                gamesAccessOn = (d.gamesEnabled!==false);   // field absent ⇒ on
    // In-Class Activities the teacher has hidden (teacher.js Class activities
    // view) — a rare, temporary override for something pushed early. A doc
    // that's missing or fails to load leaves this {} (fail open: a student
    // sees the activity), same convention as gamesAccessOn above.
    hiddenActivityIds = d.hiddenActivities || {};
    // Release dates (teacher.js Class activities view) — the actual on/off
    // switch for an activity now that class-activities.js ships them undated.
    // Unlike hiddenActivityIds, a failed/missing read here must NOT fail
    // open (that would show every activity, dated or not, to everyone) —
    // it fails to the last successfully loaded copy in localStorage instead,
    // via restoreActivityDatesFromCache() in every early-return/catch path.
    activityDates = d.activityDates || {};
    try{ localStorage.setItem('caDates', JSON.stringify(activityDates)); }catch(e){}
    // Teacher renames (teacher.js Class activities view) — id -> { en, base }.
    // Fails open to {} like hiddenActivityIds rather than to a cache like the
    // dates: losing a rename shows the shipped title, which is a cosmetic
    // fallback, not a leak of unreleased content. See caTitle().
    activityTitles = d.activityTitles || {};
    // Teacher renumbering (same view) — id -> { n, base }. Fails open to
    // {} like the renames: losing it shows the shipped teaching order,
    // which is a cosmetic fallback. See caNumber().
    activityNumbers = d.activityNumbers || {};
  }catch(e){ restoreActivityDatesFromCache(); /* leave games on, nothing hidden */ }
}
// A student who has loaded config at least once keeps seeing that last-known
// set of release dates through a later offline/blocked read, rather than
// every activity going dark. A student who has NEVER loaded config sees no
// activities — acceptable, since they also have no progress connection yet.
function restoreActivityDatesFromCache(){
  try{
    const raw = localStorage.getItem('caDates');
    if(raw) activityDates = JSON.parse(raw) || {};
  }catch(e){ /* ignore — activityDates stays {} */ }
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
/* Categories whose new value is computed FROM the old one: a streak count, an
   all-time best, a rep tally. If loadProgress() never read the doc, every one
   of them restarts from zero — and because flushSave writes {merge:true},
   Firestore happily merges that zero-based leaf over the real one (streak 15 →
   1; a 10/10 arcade best → 4; 47 reps → 1). The other categories are safe to
   keep writing: skills, responses and completed are statements the student
   makes outright this session, and merge leaves every key they didn't touch
   alone. So we hold back only these three, and only until a load succeeds —
   skipping a save costs one session's streak bump; letting it through costs
   the record itself. */
const LOAD_DEPENDENT_SAVE_KEYS = new Set(['streak','games','practiceLog']);
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
  const payload = { name:currentUser.displayName||'', email:currentUser.email||'' };
  if(keys.has('skills'))    payload.skills    = progress;
  if(keys.has('place')){    payload.lastModule = lastModuleNum; payload.lastSet = lastSetId||null; }
  if(keys.has('responses')) payload.responses = responses;
  let sentDeletes = null;
  let sentCaDeletes = null;
  // Copies, so the FieldValue.delete() sentinels stamped in below never leak
  // into local state.
  if(keys.has('completed'))       payload.completed       = Object.assign({}, completed);
  if(keys.has('classActivities')) payload.classActivities = Object.assign({}, classActivities);
  if(keys.has('games'))     payload.games     = games;
  if(keys.has('streak'))    payload.streak    = streak;
  if(keys.has('practiceLog')) payload.practiceLog = practiceLog;
  try{
    await ensureDb();
    /* The delete sentinels are stamped in HERE, after ensureDb(), and not
       where the payload is assembled: `firebase.firestore` doesn't exist
       until the Firestore SDK has actually loaded, so building them earlier
       threw a TypeError from OUTSIDE this try — an unhandled rejection that
       raised the global "Something went wrong" banner instead of the ordinary
       save-failed retry. Un-marking a step with the SDK still unloaded (a
       first visit that went offline, or a blocked CDN) was enough to do it. */
    if(payload.completed && completedDeletes.size){
      sentDeletes = [...completedDeletes];
      sentDeletes.forEach(k=>{ payload.completed[k] = firebase.firestore.FieldValue.delete(); });
    }
    if(payload.classActivities && classActivitiesDeletes.size){
      sentCaDeletes = [...classActivitiesDeletes];
      sentCaDeletes.forEach(k=>{ payload.classActivities[k] = firebase.firestore.FieldValue.delete(); });
    }
    await db.collection('progress').doc(currentUser.uid).set(payload,{merge:true});
    // Only now that the write landed: retire the deletes it carried. Keys
    // un-marked DURING the write stay queued for the next flush.
    if(sentDeletes) sentDeletes.forEach(k=>completedDeletes.delete(k));
    if(sentCaDeletes) sentCaDeletes.forEach(k=>classActivitiesDeletes.delete(k));
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

// Same shape as completed/completedDeletes/onCompleteChange/saveCompleted
// above, for In-Class Activities' own top-level Firestore field.
let classActivitiesDeletes = new Set();
function onClassActivityChange(id, isDone){
  if(isDone){ classActivities[id] = true; classActivitiesDeletes.delete(id); }
  else { delete classActivities[id]; classActivitiesDeletes.add(id); }
  saveClassActivities();
}
function saveClassActivities(){ queueSave('classActivities'); }
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
/* Song Journey readiness, read-only here: written by tabs/journey.js into the
   same progress doc (songReady[songId] = {layer: bool}, songReadyAt[songId] =
   ms). The resume card is the only consumer — never write these from app.js. */
let songReady = {};
let songReadyAt = {};

let _fullModuleDataQueued = false;
function renderAll(){
  populateModuleDropdown();
  onModuleChange(lastModuleNum||1, lastSetId);
  renderChordBoxes();
  syncPreviewNote();
  // The dropdown's 🔒 lock marker (isModuleGateLocked) judges "previous
  // module complete" from that module's own SETS/MODULE_REVIEWS data — lazy-
  // loaded per module (ensureModuleRendered), so right after login only the
  // CURRENT module (if that) has loaded. An unloaded previous module reads
  // as "nothing built yet" and holds the gate, so a fresh page load can
  // flash 🔒 on modules that are actually done. Every module-N.js is already
  // service-worker precached, so loading them all costs no extra network
  // round trip — queue it once and redraw the dropdown when it lands so any
  // wrong guess corrects itself without the student having to touch anything.
  if(!_fullModuleDataQueued){
    _fullModuleDataQueued = true;
    ensureAllModuleData().then(()=> populateModuleDropdown());
  }
}

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
  const vg = chordGain(midis.length, true);
  midis.forEach((m, i) => {
    chordStrumTimeouts.push(setTimeout(() => playNote(m, vg), i * stepMs));
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
   note-name buttons below that play the corresponding pitch. A note may
   also carry `finger` (1-4, the fretting finger): then the button under
   that column shows the finger in a circle INSTEAD of the note name —
   the Finger Gym convention (see renderTabSystem). */
const TAB_STRINGS = ['e','B','G','D','A','E'];
/* Notes per system before the TAB wraps onto a new staff. The board never
   scrolls sideways: a phrase longer than this breaks into stacked systems the
   way printed TAB breaks into lines. Rows in one tab are balanced
   (rows = ceil(N/TAB_MAX_COLS), perRow = ceil(N/rows)) and every system in a
   tab uses the same column count, so fret spacing lines up row to row. */
const TAB_MAX_COLS = 8;
/* One six-line system: the six string rows, the note-name row under them, and
   the staff box (an absolutely-positioned grid child, so it spans the six
   string rows without occupying a cell and can't be knocked out of line by a
   padded column or a chord cell). `cols` is the column count every system in
   this tab shares; a short final chunk pads with empty cells that carry no
   data-seq, so the beat cursor never lands on one. */
function renderTabSystem(chunk, off, cols){
  const rows = TAB_STRINGS.map(strLabel => {
    const cells = [`<div class="tab-str-label">${strLabel}</div>`];
    chunk.forEach((n, ci) => {
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
    for (let pi = chunk.length; pi < cols; pi++) cells.push('<div class="tab-cell"></div>');
    return cells.join('');
  }).join('');
  const noteBtns = ['<div></div>'];
  chunk.forEach((n, ci) => {
    const midis = (Array.isArray(n.midi) ? n.midi : [n.midi]).map(Number);
    const midisAttr = escAttr(JSON.stringify(midis));
    /* A note carrying `finger` (1-4) shows the FINGER in a light-purple circle
       under the staff instead of its note name — the Finger Gym convention
       Jonathan settled on for the teacher deck (2026-08-26): fret on the line,
       finger circled below, no note names. The button still plays the pitch
       and its tooltip still names the note; `note` stays in the data for the
       Coach card. No speaker glyph inside a circle — it would stretch it on
       hover; the tooltip and the hover ring are the affordance there. */
    const hasFinger = n.finger != null;
    const label = hasFinger
      ? `<span class="tab-finger">${escHtml(String(n.finger))}</span>`
      : `${escHtml(n.note)}<span class="tab-spkr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 8a5 5 0 0 1 0 8"/></svg></span>`;
    const tip = hasFinger ? t('tab.playFinger',{n:n.finger, note:n.note}) : t('tab.playNote',{note:n.note});
    noteBtns.push(`<button type="button" class="tab-note-btn${hasFinger ? ' has-finger' : ''}" data-seq="${off + ci}" data-midis="${midisAttr}" onclick="playBeat(this)" title="${escAttr(tip)}" aria-label="${escAttr(tip)}">${label}</button>`);
  });
  for (let pi = chunk.length; pi < cols; pi++) noteBtns.push('<div></div>');
  return `
      <div class="tab-grid" style="grid-template-columns:34px repeat(${cols},1fr)">
        <div class="tab-box" style="grid-column:2/${cols + 2};grid-row:1/7"></div>
        ${rows}
        ${noteBtns.join('')}
      </div>`;
}
function renderTabBlock(notes, seqOffset, padTo){
  if (!notes || !notes.length) return '';
  const off = seqOffset || 0;   // sequential index across phrases and systems — the beat cursor's address
  /* padTo: the note count of the longest phrase in this tab. Every phrase in a
     multi-phrase tab is laid out on the same column grid, so short phrases get
     trailing empty columns instead of a ragged right edge — the string lines
     just run on to the end, the way printed TAB does. When the widest phrase is
     itself long enough to wrap, perRow comes from its split and the short
     phrase pads to that. */
  const widest = Math.max(notes.length, padTo || 0);
  const perRow = Math.ceil(widest / Math.ceil(widest / TAB_MAX_COLS));
  const grids = [];
  for (let s = 0; s < notes.length; s += perRow) {
    grids.push(renderTabSystem(notes.slice(s, s + perRow), off + s, perRow));
  }
  return `
    <div class="tab-board">${grids.join('')}
    </div>`;
}
function buildTab(spec, opts){
  if (!spec) return '';
  const keyPrefix = (opts && opts.keyPrefix) || '';
  /* Header title: prefer explicit title; otherwise use caption as the header.
     If both are present and distinct, caption stays in the body. */
  const headTitle = (spec.title && tf(spec,'title')) || (spec.caption && tf(spec,'caption')) || t('tab.defaultTitle');
  const showCaptionInBody = !!spec.title && !!spec.caption && spec.title !== spec.caption;
  const headHtml = `<div class="tab-head"><span class="tab-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></span><span class="tab-title">${escHtml(headTitle)}</span><span class="tab-kind">${t('tab.label')}</span></div>`;
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
    const widest = spec.phrases.reduce((m, p) => Math.max(m, (p.notes || []).length), 0);
    const blocks = spec.phrases.map(p => {
      const block = `
      <div class="tab-phrase">
        ${p.label ? `<div class="tab-phrase-label">${escHtml(tf(p,'label'))}</div>` : ''}
        ${renderTabBlock(p.notes, seqOff, widest)}
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
   The lookarounds keep "G · Down-up" or chord names like "Am" from matching.
   The leading boundary is a CAPTURED character rather than a lookbehind
   (group 1, exactly as CHORD_RE does it): regex lookbehind is a parse error
   in Safari before 16.4, and a parse error in this file takes the whole app
   down on an older iPhone — including the error banner meant to explain it.
   Callers skip past m[1] and read the sequence from m[2]. */
const NOTE_SEQ_RE = /(^|[^A-Za-z0-9])([A-G](?:\s*[·•]\s*[A-G](?![A-Za-z0-9])){2,})/g;
function findNoteSequenceMatches(text, stringMatches){
  const out = [];
  const re = new RegExp(NOTE_SEQ_RE.source, 'g');
  let m;
  while ((m = re.exec(text)) !== null) {
    const seq = m[2];
    const seqStart = m.index + m[1].length;
    const ctx = stringMatches
      .filter(s => s.end <= seqStart)
      .sort((a, b) => b.end - a.end)[0];
    if (!ctx) continue;
    const fretMap = STRING_NOTE_FRETS[ctx.kind];
    if (!fretMap) continue;
    let lastFret = -1;
    const letterRe = /[A-G]/g;
    let lm;
    while ((lm = letterRe.exec(seq)) !== null) {
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
  document.querySelectorAll('.obj-card .obj-main, .obj-card .obj-sub, .obj-card .obj-set-sub, .obj-card .obj-skill-item, .set-about .obj-skill-item').forEach(wrapChordLinksIn);
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
    if(isModuleGateLocked(m.num)) tail += ' · 🔒';
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
      ? t('nav.moduleComplete', { n: currentInfo.num })
      : t('nav.moduleGoalTitle');
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
      prog.setAttribute('aria-valuetext', t('nav.moduleProgValue', { done: currentInfo.done, total: currentInfo.total }));
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
/* Smooth scrolling is motion, and the CSS `prefers-reduced-motion` blanket
   in styles.css cannot reach a scroll the code starts itself. Every
   scrollIntoView on the site goes through this, so "reduce motion" in the OS
   means an instant jump rather than a slide. (coach.js reads this too; the
   one call on the Journey pages inlines the same check, because those pages
   don't load app.js.) */
function scrollBehavior(){
  return (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 'auto' : 'smooth';
}

/* ══════════ Shared modal plumbing ══════════
   Six overlays (report a problem, Daily 5, module assessment, the Coach and
   drill check-off gates, the class-activity reminder) declare
   role="dialog" aria-modal="true" — a promise to assistive tech that the
   rest of the page is unavailable while they're up. Only one of them was
   keeping it: five never moved focus in, none moved it back, and nothing
   marked the page behind them inert. A student on a keyboard who hit the
   check-off gate kept focus on the step underneath, could Tab through the
   whole page behind the dim, and landed on <body> when it closed.

   openOverlay/closeOverlay do the three things every dialog owes: move
   focus in, keep Tab inside, put focus back where it came from. The Escape
   handling each overlay already had is left alone. The header sits outside
   #app, so both are marked inert — matching how the rail drawer already
   does it on narrow screens. */
let _overlayReturnFocus = null;
const OVERLAY_FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
function _overlayBehind(){
  return [document.getElementById('app'), document.querySelector('header.header')].filter(Boolean);
}
function openOverlay(ov, firstFocus){
  _overlayReturnFocus = document.activeElement;
  _overlayBehind().forEach(el => { el.inert = true; });
  ov.addEventListener('keydown', overlayTrapTab);
  const target = firstFocus || ov.querySelector(OVERLAY_FOCUSABLE);
  // preventScroll: focusing a control inside a fixed overlay must not scroll
  // the page underneath it back to the top.
  if(target && target.focus) { try{ target.focus({preventScroll:true}); }catch(e){ target.focus(); } }
}
function closeOverlay(){
  _overlayBehind().forEach(el => { el.inert = false; });
  const back = _overlayReturnFocus;
  _overlayReturnFocus = null;
  // The element may have been re-rendered away while the dialog was open
  // (marking a skill rebuilds its row), so check it's still in the document.
  if(back && document.contains(back) && back.focus){
    try{ back.focus({preventScroll:true}); }catch(e){ back.focus(); }
  }
}
function overlayTrapTab(e){
  if(e.key !== 'Tab') return;
  const items = [...e.currentTarget.querySelectorAll(OVERLAY_FOCUSABLE)]
    .filter(el => el.offsetWidth || el.offsetHeight || el === document.activeElement);
  if(!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
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
  openOverlay(ov, document.getElementById('issue-text'));
}
function issueEscClose(e){ if(e.key==='Escape') closeIssueModal(); }
function closeIssueModal(){
  const ov=document.getElementById('issue-overlay');
  if(!ov) return;
  ov.remove();
  document.removeEventListener('keydown', issueEscClose);
  closeOverlay();
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

// Cross-module gate: a module's Set 1 stays locked until the PREVIOUS module
// is fully done — every built set complete AND every Module Review
// self-rating row rated. Module 13 (String Changing) sits outside the chain
// entirely: it's a single-flow module, always open, blocks nothing. Existing
// progress anywhere in a module (any set skill, any step, any review rating)
// keeps that module open for good — same never-re-lock principle as
// hasProgressIn/isSetLocked below.
function isModuleGateLocked(moduleNum){
  if(moduleNum <= 1) return false;                 // Module 1 is the start
  if(moduleNum === 13) return false;               // String Changing: outside the chain, always open
  if(isGatePreviewer()) return false;
  if(progressLoadFailed) return false;             // never re-lock on a guess
  // Existing progress anywhere in THIS module keeps it open (never re-lock)
  const mySets = SETS.filter(w=>w.moduleNum===moduleNum);
  if(mySets.some(w=>hasProgressIn(w))) return false;
  const myMr = MODULE_REVIEWS[moduleNum];
  if(myMr && (myMr.skills||[]).some(s=>{ const v=progress[s.id]; return v==='1'||v==='2'||v==='3'; })) return false;
  // Previous module: every BUILT set complete...
  const prevNum = moduleNum - 1;
  const prevSets = SETS.filter(w=>w.moduleNum===prevNum && !w.locked && !w.comingSoon);
  if(!prevSets.length) return true;                // nothing built to complete yet — hold the gate
  if(!prevSets.every(w=>isSetComplete(w))) return true;
  // ...and every Module Review self-rating row rated (if a review exists)
  const mr = MODULE_REVIEWS[prevNum];
  if(mr && (mr.skills||[]).length){
    return !(mr.skills.every(s=>{ const v=progress[s.id]; return v==='1'||v==='2'||v==='3'; }));
  }
  return false;
}

// Sequential gate: a set stays locked until the set before it (in module order)
// is finished, so students work a module in order — the same lock-until-complete
// idea as Module Review, applied to every set. The first set of a module is
// gated on the PREVIOUS MODULE being fully done (isModuleGateLocked) instead —
// see that function's own header for what "fully done" means and the Module 13
// carve-out.
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
  if(progressLoadFailed) return false;               // we don't know what they've done — never re-lock on a guess
  const moduleSets = SETS.filter(x=>x.moduleNum===w.moduleNum);
  const idx = moduleSets.indexOf(w);
  if(hasProgressIn(w)) return false;                 // already been here — never lock them back out
  if(idx<=0) return isModuleGateLocked(w.moduleNum); // first set: gated on the PREVIOUS MODULE
  return !isSetComplete(moduleSets[idx-1]);
}

// The set immediately before w in its module (for "finish X first" hints).
function prevSetLabel(w){
  const arr = SETS.filter(x=>x.moduleNum===w.moduleNum);
  return (arr[arr.indexOf(w)-1] || {}).label || t('nav.prevSet');
}

// True when w is a module's Set 1 held closed by the cross-module gate (not
// the ordinary in-module set-to-set gate) — the case that gets module-flavored
// gate strings ("finish Module N") instead of set-flavored ones ("finish Set 1").
function isModuleGateCase(w){
  if(!w) return false;
  const moduleSets = SETS.filter(x=>x.moduleNum===w.moduleNum);
  return moduleSets.indexOf(w)<=0 && isModuleGateLocked(w.moduleNum);
}

// {num, mod} for the module-flavored gate strings — the previous module's
// number and localized name.
function prevModuleGateParams(w){
  const num = w.moduleNum - 1;
  const m = MODULE_MANIFEST.find(x=>x.num===num);
  return { num, mod: m ? tf(m,'name') : '' };
}

// Is this set's panel currently open in read-only peek mode? DOM-derived
// (the 'set-peek' class on its .week-panel) rather than a tracked variable —
// same reasoning as syncExploreNav. Every write path reachable from inside a
// set panel (toggleSkill, toggleStepDone, drill best-score saves) checks this
// before touching progress/completed/games, so a peek can never leave a mark
// even if the CSS pointer-events:none disable is bypassed by keyboard input
// or future markup drift.
function isSetPeeking(wid){
  const p = document.querySelector(`.week-panel[data-id="${CSS.escape(wid)}"]`);
  return !!(p && p.classList.contains('set-peek'));
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

/* Every module change takes a ticket; only the most recently issued one may
   touch state after its await (same pattern as teacher.js's
   loadTeacherClassConfig). ensureModuleRendered fetches a <script>, so two
   overlapping calls resolve in file-size order, not call order: renderAll fires
   onModuleChange(1, …) un-awaited, the student picks Module 7 before module-1.js
   lands, the smaller module-7.js wins the race — and then Module 1's
   continuation repaints the pills and activates a Module 1 set underneath a
   dropdown reading "Module 7". A stale ticket now just bails. */
let _moduleChangeReq = 0;
async function onModuleChange(moduleNum, restoreSetId){
  moduleNum = parseInt(moduleNum);
  const req = ++_moduleChangeReq;
  const prevModuleNum = lastModuleNum, prevSetId = lastSetId;
  lastModuleNum = moduleNum;
  // Drop a last-set id belonging to the module we're leaving. The dropdown's
  // onchange calls saveProgress() without awaiting us, so a flush landing
  // before activateSet would otherwise persist the new module paired with the
  // old module's set id — a pair that restores to nothing next login.
  if(lastSetId !== `mr${moduleNum}` && !SETS.some(w=>w.id===lastSetId && w.moduleNum===moduleNum)) lastSetId = null;
  document.getElementById('module-select').value = moduleNum;
  // Fetch + build this module's panels on first visit before showing them.
  try{
    await ensureModuleRendered(moduleNum);
  }catch(e){
    // module-N.js never arrived (offline + not precached, or a bad deploy).
    // Bail quietly back to the module still on screen rather than let the
    // rejection escape into the global safety net's "Something went wrong"
    // banner over a blank pane — this call is fired un-awaited from renderAll,
    // the dropdown's onchange and songHubGoModule, so nothing else catches it.
    console.warn('[guitar-class] module '+moduleNum+' failed to load', e);
    if(req === _moduleChangeReq){
      lastModuleNum = prevModuleNum; lastSetId = prevSetId;
      const sel = document.getElementById('module-select');
      if(sel) sel.value = prevModuleNum;
      /* Say something. Swallowing the rejection removed the only signal a
         student used to get here (the global unhandledrejection banner), and
         on the very first render there is no module already on screen to fall
         back to — so without this they'd sit looking at an empty pane with no
         explanation and no retry. Re-picking the same module in the dropdown
         fires no change event, so the toast has to name the retry. */
      gateToast(t('module.loadFailed'));
    }
    return;
  }
  if(req !== _moduleChangeReq) return;   // a newer module change is in flight — leave its DOM alone
  const moduleSets = SETS.filter(w=>w.moduleNum===moduleNum);
  if(!moduleSets.length) return;   // file loaded but defined no sets
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
  // A fully-locked module's only reachable target is its module-gated Set 1
  // (the frontier resolver above can't find anything else unlocked) — open
  // it read-only instead of letting activateSet's backstop bounce off it and
  // leave a dead screen.
  const tw = moduleSets.find(w=>w.id===target);
  if(tw && isSetLocked(tw)) activateSet(target, {peek:true});
  else activateSet(target);
  // First completed render of the session: the restored set is on screen and
  // its data is loaded, so the resume card can finally compute step counts.
  if(!_resumeCardBuilt){ _resumeCardBuilt = true; renderResumeCard(); }
}

// Per-set completion tally from the student's own progress.
// Returns {done, total}; total is 0 for sets with no trackable skills.
function setCompletion(w){
  const skills = (w.skills && w.skills.length) ? w.skills : [];
  const done = skills.filter(s=>progress[s.id]==='gotit').length;
  return { done, total: skills.length };
}

/* ── "Pick up where you left off" resume card ──
   One card above the set panels, filled once per page load (onModuleChange's
   first completed run), so a student sitting back down lands on a one-tap
   route back to exactly where they stopped — the lesson ladder or the
   checklist in their current set, and the Song Journey they touched most
   recently.
   Session-only: dismissing or using it removes it until the next page load,
   which on a class Chromebook means the next class period. Read-only over
   `completed` / `songReady` — it never writes progress. */
const SONG_JOURNEYS = [
  { id:'seven-nation-army',        name:'Seven Nation Army',        url:'tabs/seven-nation-army.html' },
  { id:'all-along-the-watchtower', name:'All Along the Watchtower', url:'tabs/all-along-the-watchtower.html' },
  { id:'sweet-child-o-mine',       name:'Sweet Child O\u2019 Mine', url:'tabs/sweet-child-o-mine.html' },
  { id:'luna',                     name:'Luna',                     url:'tabs/luna.html' },
  { id:'let-it-be',                name:'Let It Be',                url:'tabs/let-it-be.html' },
  { id:'the-cure',                 name:'the cure',                 url:'tabs/the-cure.html' },
];
let _resumeCardBuilt = false;    // build once per page load…
let _resumeCardClosed = false;   // …and never resurrect after dismiss/use

/* Steps done / total across a set's whole lesson ladder — a standalone twin of
   buildLesson's lessonStepCounts (same ns-per-section key scheme, same
   tuning-warm-up exclusion), kept separate because the resume card runs before
   any panel is built. If the key scheme ever changes, change both. */
function resumeLessonCounts(w){
  let total=0, done=0;
  const count=(steps,ns)=>steps.forEach((st,idx)=>{
    total++;
    if(completed[`${w.id}-${ns}-${idx}`]===true) done++;
  });
  ['b','c'].forEach(stationId=>{
    const s = w.stations && w.stations[stationId];
    if(!s) return;
    if(s.sections && s.sections.length){
      s.sections.filter(sec=>!isTuningWarmupSection(sec, w.moduleNum))
        .forEach((sec,gi)=>count(sec.steps, `${stationId}-sec${gi}`));
    } else if(s.steps){
      count(s.steps, stationId);
    }
  });
  return total ? { total, done } : null;
}

/* The module row's target: the lesson ladder while it still has steps left,
   else the skills checklist. null for module reviews / coming-soon panels —
   those restore on their own and have no tabs to point at. */
function resumeModuleTarget(){
  const panel = activeWeekPanel();
  if(!panel) return null;
  const w = SETS.find(x=>x.id===panel.dataset.id);
  if(!w || w.comingSoon) return null;
  const p = resumeLessonCounts(w);
  if(!p) return null;
  return (p.done < p.total)
    ? { w, lesson:true, tab:LESSON_TAB, done:p.done, total:p.total }
    : { w, lesson:false, tab:'checklist' };
}

/* The song row: the most recently touched Journey that still has unchecked
   layers. Docs from before the songReadyAt stamp existed sort as 0 and fall
   back to canonical song order — still a sensible pick, just not recency. */
function resumeSongPick(){
  const c = SONG_JOURNEYS.map(sj=>{
    const map = songReady && songReady[sj.id];
    if(!map) return null;
    const keys = Object.keys(map);
    if(!keys.length) return null;
    const ready = keys.filter(k=>map[k]===true).length;
    return { song:sj, ready, total:keys.length, at:(songReadyAt && songReadyAt[sj.id]) || 0 };
  }).filter(Boolean).filter(x=>x.ready < x.total);
  if(!c.length) return null;
  c.sort((a,b)=>b.at-a.at);
  return c[0];
}

function renderResumeCard(){
  const host = document.getElementById('resume-card');
  if(!host || _resumeCardClosed) return;
  const song = resumeSongPick();
  // Day-one students (no step checked anywhere, no song touched) skip the
  // card entirely — "resume" would be noise on a first visit.
  const anyProgress = Object.keys(completed||{}).some(k=>completed[k]===true);
  const mod = anyProgress ? resumeModuleTarget() : null;
  if(!mod && !song){ host.hidden = true; host.innerHTML=''; return; }
  const rows = [];
  if(mod){
    const meta = mod.lesson
      ? `${t('nav.lessonTitle')} · ${t('progress.stepsDone',{done:mod.done,total:mod.total})}`
      : t('resume.checklistNext');
    rows.push(`<div class="resume-row">
      <div class="resume-what"><strong>${escHtml(tSetLabel(mod.w.label))}</strong><span class="resume-meta">${escHtml(meta)}</span></div>
      <button type="button" class="resume-go" onclick="resumeGoModule('${escAttr(mod.w.id)}','${escAttr(mod.tab)}')">${t('resume.continue')}</button>
    </div>`);
  }
  if(song){
    rows.push(`<div class="resume-row">
      <div class="resume-what"><strong>${escHtml(song.song.name)}</strong><span class="resume-meta">${escHtml(t('journey.progPill',{ready:song.ready,n:song.total}))}</span></div>
      <button type="button" class="resume-go" onclick="resumeGoSong('${escAttr(song.song.url)}')">${t('resume.open')}</button>
    </div>`);
  }
  host.innerHTML = `<div class="resume-head">
      <span class="resume-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 2h6"/></svg> ${t('resume.title')}</span>
      <button type="button" class="resume-close" onclick="dismissResumeCard()" aria-label="${escAttr(t('resume.dismiss'))}" title="${escAttr(t('resume.dismiss'))}">&times;</button>
    </div>${rows.join('')}`;
  host.hidden = false;
}

function dismissResumeCard(){
  _resumeCardClosed = true;
  const host = document.getElementById('resume-card');
  if(host){ host.hidden = true; host.innerHTML=''; }
}
function resumeGoModule(setId, tab){
  dismissResumeCard();
  switchTabById(setId, tab);
}
function resumeGoSong(url){
  dismissResumeCard();
  window.open(url, '_blank', 'noopener');
}

function renderPills(moduleNum){
  const c = document.getElementById('week-pills');
  c.innerHTML='';
  const sets = SETS.filter(w=>w.moduleNum===moduleNum);
  // 4+ sets: compact the buttons so they still fit on one rail row
  c.classList.toggle('wp-many', sets.length>3);
  // A set that just became genuinely unlocked (finished the one before it,
  // possibly in another tab) sheds any leftover peek state from before —
  // otherwise the panel would still fail-safe as read-only after the real
  // unlock. A still-locked set keeps whatever peek state activateSet gave it.
  sets.forEach(w=>{
    if(!isSetLocked(w)){
      const p = document.querySelector(`.week-panel[data-id="${w.id}"]`);
      if(p) p.classList.remove('set-peek');
    }
  });
  // The pill rail is rebuilt from scratch below and normally highlights
  // lastSetId — but a peek never touches lastSetId (nothing about a peek is
  // persisted), so the peeked pill would lose its "you are here" highlight on
  // any unrelated re-render (language switch, a skill toggled in another
  // tab). Derive it from the DOM instead: whichever panel is both .active and
  // .set-peek is the one being previewed right now.
  const peekedPanel = document.querySelector('.week-panel.active.set-peek');
  const peekedId = peekedPanel ? peekedPanel.dataset.id : null;
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
      // Static locked/comingSoon sets have nothing built yet — no preview,
      // same "explain why" toast as always. Only the sequential gate (a set
      // whose predecessor just isn't finished yet) offers a peek — same
      // idiom as the Module Review preview.
      const staticClosed = !!(w.locked || w.comingSoon);
      const gp = { set: tSetLabel(w.label), prev: tSetLabel(prevSetLabel(w)) };
      if(staticClosed){
        btn.setAttribute('aria-disabled','true');
        btn.setAttribute('aria-label', t('gate.lockedUntilAria', gp));
        btn.title = t('gate.lockedTitle', gp);
        btn.onclick = ()=> gateToast(t('gate.finishFirstLong', gp));
      } else if(isModuleGateCase(w)){
        const mgp = prevModuleGateParams(w);
        btn.setAttribute('aria-label', t('gate.peekPillTitleModule', mgp));
        btn.title = t('gate.peekPillTitleModule', mgp);
        btn.onclick = ()=>{ leaveTopPanelForSet(); activateSet(w.id, {peek:true}); };
      } else {
        btn.setAttribute('aria-label', t('gate.peekPillTitle', gp));
        btn.title = t('gate.peekPillTitle', gp);
        btn.onclick = ()=>{ leaveTopPanelForSet(); activateSet(w.id, {peek:true}); };
      }
    } else {
      btn.onclick=()=>{ leaveTopPanelForSet(); lastSetId=w.id; activateSet(w.id); saveProgress(); };
    }
    btn.classList.toggle('active', btn.dataset.id===(peekedId || lastSetId));
    c.appendChild(btn);
  });

  // Module Review pill — wraps to its own full-width row below the set buttons
  if(MODULE_REVIEWS[moduleNum]){
    const locked = isModuleReviewLocked(moduleNum);
    const rbtn = document.createElement('button');
    rbtn.className='wpill review-pill'+(locked?' locked':'')+(!locked&&isMrComplete(moduleNum)?' complete':'');
    rbtn.dataset.id=`mr${moduleNum}`;
    rbtn.textContent=t('nav.moduleReview');
    rbtn.setAttribute('data-i18n','nav.moduleReview');
    rbtn.setAttribute('translate','no'); rbtn.classList.add('notranslate');
    rbtn.title = locked ? t('gate.reviewPreviewTitle') : '';
    rbtn.onclick=()=>{ leaveTopPanelForSet(); lastSetId=`mr${moduleNum}`; activateSet(`mr${moduleNum}`); saveProgress(); };
    rbtn.classList.toggle('active', rbtn.dataset.id===lastSetId);
    c.appendChild(rbtn);
    // Sync preview/locked state onto the review's panel so its inputs disable themselves
    const panel = document.querySelector(`.week-panel[data-id="mr${moduleNum}"]`);
    if(panel) panel.classList.toggle('mr-locked', locked);
  }
}

window.addEventListener('pagehide', function(){ if(_dirtyKeys.size){ clearTimeout(saveTimer); flushSave(); } });

function activateSet(id, opts){
  // opts.peek: open a locked set read-only instead of bouncing off the gate
  // (renderPills' locked-pill onclick uses this). A peek must leave nothing
  // behind — no lastSetId, no saveProgress — so a reload always restores the
  // student to their real frontier, never the set they were just previewing.
  // Static locked/comingSoon sets have nothing built to preview — peek only
  // ever applies to the sequential gate (see renderPills' matching check).
  const isMr = /^mr\d+$/.test(id);
  const w = isMr ? null : SETS.find(x=>x.id===id);
  const peek = !!(opts && opts.peek) && !!w && !(w.locked || w.comingSoon);
  // Sequential-gate backstop: never open a set that's still locked (e.g. from a
  // stale search deep-link) UNLESS this is an intentional peek. Module Review
  // (mrN) is intentionally preview-openable while locked, so it's exempt too.
  if(w && isSetLocked(w) && !peek){
    gateToast(isModuleGateCase(w)
      ? t('gate.finishFirstShortModule', { set: tSetLabel(w.label), ...prevModuleGateParams(w) })
      : t('gate.finishFirstShort', { set: tSetLabel(w.label), prev: tSetLabel(prevSetLabel(w)) }));
    return;
  }
  if(!peek) lastSetId = id;
  if (typeof stopAnyRec === 'function') stopAnyRec({keepFab:true});
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
  document.querySelectorAll('.week-panel').forEach(p=>{
    const isTarget = p.dataset.id===id;
    p.classList.toggle('active', isTarget);
    if(isTarget) p.classList.toggle('set-peek', peek);
  });
  renderChordBoxes();
  syncRailStations();   // refresh the rail's "This set" station switcher for the new set
  // Every set opens at the top, every time — no scroll-position memory.
  scrollPaneTop();
  // Opening the Module Review pops the assessment heads-up (once per visit).
  if(isMr) maybeShowMrAssess(parseInt(id.slice(2),10));
}

/* ── Rail set switcher ─────────────────────────────────────────────────
   The per-set switcher (the lesson ladder · the checklist) lives in the left
   rail. It is the ONLY switcher — the in-panel tab bar it replaced is gone —
   so these helpers drive switchTabById() and mirror the active panel back
   onto the rail buttons. */
/* The one tab-panel suffix the merged ladder lives under. Kept as 'station-b'
   rather than renamed: every stored deep link, every `${wid}-station-b` lookup
   and the print stylesheet already address it, and the id is invisible to
   students. Changing it would buy nothing and break all three. */
const LESSON_TAB = 'station-b';
function activeWeekPanel(){ return document.querySelector('.week-panel.active'); }
/* The lesson's rail sub-label was a hardcoded "Watch · Listen · Practice"
   while the set's own panel header could say something else — Module 1 Set 1
   reads "…Reflect" (nothing is played in that set; the skills are all "I can
   describe…"), and Module 9 Set 1 reads "Where do I start?". Both are
   deliberate, so mirror the set's own wording instead of flattening it: take
   whatever follows the em-dash in "Computer station — X" (same shape in both
   languages, so no per-language parsing), falling back to the generic label
   for a title that carries no dash. Read through tf(), so a language switch
   re-derives it — same pattern as the single-flow tabSub override below, and
   as the B→C seam divider in buildLesson(). */
function lessonSubLabel(w){
  const raw = (w && w.stations && w.stations.b && w.stations.b.title) ? tf(w.stations.b, 'title') : '';
  const i = raw.indexOf('—');
  const tail = i >= 0 ? raw.slice(i + 1).trim() : '';
  return tail || t('nav.lessonSub');
}
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
  // Module-review and coming-soon panels carry no .tab-panel, so there is
  // nothing for the rail's "This set" group to switch between.
  const hasPanels = panel && panel.querySelector('.tab-panel');
  if(!hasPanels){ group.hidden = true; return; }
  group.hidden = false;
  const wid = panel.dataset.id;
  const w = (typeof SETS !== 'undefined') ? SETS.find(s=>s.id===wid) : null;
  const label = document.getElementById('rail-set-label');
  if(label) label.textContent = t('nav.thisSet') + (w && w.label ? ' · ' + tSetLabel(w.label) : '');
  /* Single-flow sets (only station b) mirror the set's own tab labels onto the
     rail. applyI18n restores the defaults on language switch, then this
     override re-applies (the gc-langchange listener calls syncRailStations
     after applyI18n). */
  const single = !!(w && w.stations && w.stations.b && !w.stations.c && !w.comingSoon);
  const bTitle = list.querySelector('.rail-station.st-b .rs-title');
  const bSub = list.querySelector('.rail-station.st-b .rs-sub');
  if(bTitle) bTitle.textContent = (single && w.stations.b.tabTitle) ? tf(w.stations.b,'tabTitle') : t('nav.lessonTitle');
  if(bSub) bSub.textContent = (single && w.stations.b.tabSub) ? tf(w.stations.b,'tabSub') : lessonSubLabel(w);
  const chkSubEl = list.querySelector('.rail-station.st-chk .rs-sub');
  if(chkSubEl) chkSubEl.textContent = (single && w.checklistSub) ? tf(w,'checklistSub') : t('nav.checklistSub');
  // Reflect whichever tab-panel is currently active back onto the rail buttons.
  const activePanel = panel.querySelector('.tab-panel.active');
  const activeTab = activePanel ? activePanel.id.slice(wid.length + 1) : LESSON_TAB;
  list.querySelectorAll('.rail-station').forEach(b=>{
    const on = b.dataset.station === activeTab;
    b.classList.toggle('active', on);
    if(on) b.setAttribute('aria-current','true'); else b.removeAttribute('aria-current');
  });
}

/* ── Explore pages: Games · Songs · Keep practicing · My progress ──
   All four share the plumbing — one hash each (browser Back exits), one
   router, one close path, and the rail item lights up while its page is open.
   They differ in one axis only, `overlay`:
     overlay: false (Songs · Keep practicing · My progress) — loads INTO the
       main column, replacing #week-panels while the rail and header stay put,
       so a student can hop between them the way they hop between sets.
     overlay: true (Games) — takes the whole viewport, covering rail and
       header. Jonathan asked for this on 2026-07-28, the day after the three
       screens were unified: the arcade is a place you go, not a page you
       browse, and the rail's practice scaffolding is noise once you're
       playing.
   Anything new in this group joins the table below and picks one of those two,
   rather than inventing a third. */
const EXPLORE_PAGES = [
  { hash: '#games',           screen: 'games-screen',           btn: 'games-btn', overlay: true },
  { hash: '#songs',           screen: 'songs-screen',           btn: 'songs-hub-btn' },
  { hash: '#keep-practicing', screen: 'keep-practicing-screen', btn: 'keep-practicing-btn' },
  { hash: '#daily-review',    screen: 'sr-screen',              btn: 'sr-btn' },
  { hash: '#my-progress',     screen: 'my-progress-screen',     btn: 'my-progress-btn' },
  { hash: '#class-activities', screen: 'class-activities-screen', btn: 'class-activities-btn' },
  /* The second overlay, and the one place the choice isn't about browsing
     comfort: a student answering a live question must not be able to
     half-see (or mis-tap into) the set panels underneath. */
  { hash: '#live-quiz',       screen: 'live-quiz-screen',       btn: 'live-quiz-btn', overlay: true },
];
/* Single source of truth for "which explore page is showing": reads the DOM
   rather than tracking state, so it stays right no matter which path opened
   or closed a page (click, hash, Back button, teacher turning games off). */
let practiceScrollTop = 0;
function syncExploreNav(){
  const open = EXPLORE_PAGES.find(p => {
    const el = document.getElementById(p.screen);
    return el && !el.hasAttribute('hidden');
  });
  /* In-column pages hide #week-panels: the practice view is swapped OUT, not
     covered up, so .main would otherwise clamp its scroll to the short explore
     page and lose the student's place in a long set. Stash it on the way in,
     put it back on the way out. An overlay page (Games) leaves the practice
     view mounted underneath, so it needs neither — just a locked body scroll
     so the page behind it can't rubber-band. */
  const inColumn = !!open && !open.overlay;
  const wasOpen = document.body.classList.contains('explore-open');
  document.body.classList.toggle('explore-open', inColumn);
  document.body.classList.toggle('games-open', !!open && !!open.overlay);
  /* Set the position AFTER the class toggle, and read scrollPane() fresh:
     showing/hiding a screen changes .main's height, which decides both
     whether it scrolls at all and how far. (Don't defer this to a
     requestAnimationFrame — those don't run in a background tab, so the
     student would come back to a page that hadn't restored itself.) */
  if(inColumn !== wasOpen) scrollPane().scrollTo({ top: inColumn ? 0 : practiceScrollTop });
  const activeId = open ? open.btn : 'practice-nav-btn';
  [...EXPLORE_PAGES.map(p => p.btn), 'practice-nav-btn'].forEach(id => {
    const b = document.getElementById(id);
    if(!b) return;
    const on = id === activeId;
    b.classList.toggle('active', on);
    if(on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    // Only the overlay page's button carries aria-expanded (see index.html);
    // the in-column ones are navigation, not disclosure, so leave them alone.
    if(b.hasAttribute('aria-expanded')) b.setAttribute('aria-expanded', String(on));
  });
}

/* ── Back-button history for the explore pages ─────────────────────────────
   Opening a page pushes ONE history entry; the on-page ✕ / "Back to practice"
   walks back through every entry this visit pushed. Before this, closing a
   page *pushed* an empty '#' on top of the entry that had opened it, so the
   student's next Back tap re-opened the page they had just closed — the
   "Back doesn't take me to the page I was on" bug.

   The depth rides along in history.state rather than in a module-level
   counter, so it stays honest when the student mixes the browser's own
   Back/Forward buttons with the on-page ones. An entry we didn't push (a
   bookmarked or reloaded '#songs' URL) reports depth 0 and exits by
   rewriting the URL in place — never push a '#' the student has to Back
   through twice. */
function exploreDepth(){ return (history.state && history.state.xDepth) || 0; }

/* Open an explore page. pushState rather than `location.hash =` so the entry
   can carry its depth; pushState fires no event, so route by hand. */
function goExploreHash(hash){
  const h = '#' + hash;
  if(location.hash === h) return;
  history.pushState({ xDepth: exploreDepth() + 1 }, '', h);
  routeExploreHash();
}

/* Leave the explore pages and land back on the practice view. */
function exitExploreHash(){
  const d = exploreDepth();
  if(d > 0){ history.go(-d); return; }   // async: popstate → routeExploreHash()
  history.replaceState(null, '', location.pathname + location.search);
  routeExploreHash();
}

/* Hash router for all the pages. Closes the others FIRST (through their
   panel-only close fns, which don't touch the hash — the hash is already
   whatever we're routing to), then opens the target. */
let lastRoutedHash = null;
const EXPLORE_HASHES = ['', '#games', '#songs', '#keep-practicing', '#daily-review', '#my-progress', '#class-activities', '#live-quiz', '#search'];
function routeExploreHash(){
  const h = location.hash;
  // A hash this router doesn't own (e.g. #main-content from the skip link)
  // must fall through untouched — otherwise it would close every explore
  // panel + search out from under whatever the student was reading.
  if(!EXPLORE_HASHES.includes(h)) return;
  /* A back/forward across a hash-only entry fires popstate *and* hashchange
     in most browsers, and goExploreHash routes by hand on top of that.
     Routing is idempotent, but the scroll stash below is not — so bail on a
     repeat of the hash we already routed to. */
  if(h === lastRoutedHash) return;
  lastRoutedHash = h;
  /* Remember the student's place in the set BEFORE anything is shown or
     hidden — once a screen is in the flow, .main's scrollTop has already
     been shifted by scroll anchoring and no longer means what it says.
     Overlay pages don't take the practice view out of the flow, so there's
     nothing to stash for them (and arriving at Songs *from* Games still reads
     the live practice scrollTop, which is exactly the right one). */
  if(!document.body.classList.contains('explore-open') && EXPLORE_PAGES.some(p => p.hash === h && !p.overlay)){
    practiceScrollTop = paneScrollTop();
  }
  if(h !== '#games' && typeof gamesClosePanel === 'function') gamesClosePanel();
  if(h !== '#songs') songsClosePanel();
  if(h !== '#keep-practicing') kpClosePanel();
  if(h !== '#daily-review') srClosePanel();
  if(h !== '#my-progress') mpClosePanel();
  if(h !== '#class-activities') caClosePanel();
  if(h !== '#live-quiz' && typeof lqClosePanel === 'function') lqClosePanel();
  if(h !== '#search') searchClosePanel();
  if(h === '#games' && typeof openGamesScreen === 'function') openGamesScreen();
  else if(h === '#songs') openSongsScreen();
  else if(h === '#keep-practicing') openKeepPracticingScreen();
  else if(h === '#daily-review') openDailyReviewScreen();
  else if(h === '#my-progress') openMyProgressScreen();
  else if(h === '#class-activities') openClassActivitiesScreen();
  else if(h === '#live-quiz' && typeof openLiveQuizScreen === 'function') openLiveQuizScreen();
  else if(h === '#search') openSearchPanel();
  syncExploreNav();
}
/* The skip link's default #main-content jump would drop a foreign hash into
   the history — exitExploreHash's history.go(-d) can then land on it, and
   routeExploreHash (correctly, above) ignores hashes it doesn't own, which
   left a ✕ click dead until pressed a second time. Focus the target
   directly instead: same destination, no history entry. */
document.querySelector('.skip-link')?.addEventListener('click', e => {
  e.preventDefault();
  const m = document.getElementById('main-content');
  if(m) m.focus();
});
window.addEventListener('hashchange', routeExploreHash);
/* pushState/go() traversals fire popstate, not hashchange — listen for both
   (the lastRoutedHash guard above absorbs the browsers that fire both). */
window.addEventListener('popstate', routeExploreHash);

/* "Practice" nav item: leave whatever explore page or panel is open and
   return to the practice view. Reuses the existing close-all helper. */
function returnToPractice(){
  // Leaving an explore page restores the student's place in the set
  // (syncExploreNav); a plain "Practice" click with nothing open still
  // means "take me back to the top". Games counts as an explore page here
  // even though it's an overlay — it never moved the practice view, so
  // scrolling it to the top on the way out would lose the student's place.
  const fromExplore = document.body.classList.contains('explore-open')
    || document.body.classList.contains('games-open');
  if(typeof closeTopPanels === 'function') closeTopPanels();
  if(!fromExplore) scrollPaneTop(true);
}

/* Set/review panels are now built per-module, on demand, by
   ensureModuleRendered() (defined near the top of this file). */

function buildComingSoon(w){
  const setTag = w.title ? `<span class="obj-set-tag" data-i18n-setlabel="${escAttr(w.title)}" translate="no">${escHtml(tSetLabel(w.title))}</span>` : '';
  const titleSpan = w.unit ? `<span class="set-eyebrow-title">${w.unit}</span>` : '';
  const eyebrow = (setTag || titleSpan) ? `<div class="set-eyebrow">${setTag}${titleSpan}</div>` : '';
  const sub = w.subtitle ? `<p class="obj-sub">${tf(w,'subtitle')}</p>` : '';
  return `${eyebrow}${sub}
  <div class="coming"><div class="big"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div><p>${t('nav.comingSoonHtml')}</p></div>`;
}

function buildSet(w){
  // Compact eyebrow line — "Set N" pill, topic, Print — carries identity;
  // skill bullets and the song-thread link fold behind "About this set"
  // (the old "I CAN…" objective line is no longer shown).
  const printBtn = `<button type="button" class="print-set-btn" onclick="printSet('${w.id}')" title="${escAttr(t('btn.printSetTitle'))}" aria-label="${escAttr(t('btn.printSet'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7" rx="1"/></svg></button>`;
  const setTag = w.title ? `<span class="obj-set-tag" data-i18n-setlabel="${escAttr(w.title)}" translate="no">${escHtml(tSetLabel(w.title))}</span>` : '';
  const titleSpan = w.unit ? `<span class="set-eyebrow-title">${tf(w,'unit')}</span>` : '';
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
        return `<div class="song-thread"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> ${lede} ${names}</div>`;
      })()
    : '';
  const about = (skills || thread) ? `<details class="set-about"><summary>${t('set.about')}</summary><div class="set-about-panel">${skills}${thread}</div></details>` : '';
  const eyebrow = `<div class="set-eyebrow">${setTag}${titleSpan}${about}${printBtn}</div>`;
  // Always in the DOM (like mr-locked-banner), shown only when the panel
  // carries .set-peek — so it needs no rebuild to appear/disappear as the
  // gate state changes, only the class toggle renderPills/activateSet do.
  const peekBanner = `<div class="set-peek-banner">
      <span class="set-peek-banner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></span>
      <div>${isModuleGateCase(w) ? t('gate.peekBannerModule', prevModuleGateParams(w)) : t('gate.peekBanner', { prev: tSetLabel(prevSetLabel(w)) })}</div>
    </div>`;
  /* A set is two panels now: the lesson ladder and the skills checklist. The
     in-panel tab bar that used to switch between them was hidden site-wide
     when the rail took over the job — it survived only as a place to hang an
     .active class nobody could see, so it's gone and switchTabById() drives
     the panels directly. The per-set Songs tab went with it: it was reachable
     only from that hidden bar, and the Songs hub (rail → Songs) already lists
     every song it did, Module 1's included, with the same play buttons. */
  return `${peekBanner}${eyebrow}
  <div id="${w.id}-${LESSON_TAB}" class="tab-panel tp-station-b active">${buildLesson(w)}${panelFooter(w,LESSON_TAB)}</div>
  <div id="${w.id}-checklist" class="tab-panel tp-checklist">${buildChecklist(w)}${panelFooter(w,'checklist')}</div>`;
}

/* Print one set as a clean one-pager (for days the Chromebooks/Wi-Fi fail).
   The @media print stylesheet does the heavy lifting — it force-shows the
   lesson ladder and the checklist (regardless of which tab is open) and hides
   the songs tab and all on-screen chrome — so this just fires the dialog. */
function printSet(wid){ window.print(); }
/* Printed handouts must show the collapsed hint/stuck/level-up prose —
   hidden fold panels don't print, so unhide them for the print pass and
   restore afterwards. */
let _printOpened = [];
// Same problem for the "About this set" disclosure: a closed <details>
// prints nothing, so a printed set sheet would silently lose its objectives
// and song-thread line unless it's forced open for the print pass.
let _printOpenedDetails = [];
window.addEventListener('beforeprint', ()=>{
  _printOpened = [...document.querySelectorAll('.step-fold-panel[hidden]')];
  _printOpened.forEach(d=>d.removeAttribute('hidden'));
  _printOpenedDetails = [...document.querySelectorAll('.set-about:not([open])')];
  _printOpenedDetails.forEach(d=>d.setAttribute('open',''));
});
window.addEventListener('afterprint', ()=>{
  _printOpened.forEach(d=>d.setAttribute('hidden',''));
  _printOpened = [];
  _printOpenedDetails.forEach(d=>d.removeAttribute('open'));
  _printOpenedDetails = [];
});

/* "About this set" now overlays content as a dropdown from the sticky
   eyebrow band, so it needs the same click-away/Escape idiom as the FAB tool
   popups (fab-tools.js) — native <details> doesn't close on outside click. */
document.addEventListener('click', e=>{
  const path = e.composedPath();
  document.querySelectorAll('.set-about[open]').forEach(d=>{
    if(!path.includes(d)) d.removeAttribute('open');
  });
});
document.addEventListener('keydown', e=>{
  if(e.key !== 'Escape') return;
  document.querySelectorAll('.set-about[open]').forEach(d=>d.removeAttribute('open'));
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
   (not a buildLesson() closure) so buildSearchIndex() can share it.

   Matched on the section's own `kind` tag, NOT on its title. Because the
   filter runs BEFORE sections are numbered, every stored progress key in
   these sets (`${set}-b-sec{gi}-{i}`) is a post-filter index — so a copy edit
   to the title alone used to shift every later section's namespace by one in
   27 sets across 11 modules, quietly moving students' done-marks, MC picks
   and written responses onto the wrong steps. The title is now free to
   change. The title clause stays as a backstop for a section that somehow
   ships without the tag; checks.mjs (1r) fails the push when the tag and the
   title disagree in either direction, so the two can't drift apart. */
function isTuningWarmupSection(sec, moduleNum){
  if(moduleNum === 1) return false;
  return sec.kind === 'tuning-warmup' || sec.title === 'Warm-up — tuning check (Module 1)';
}

/* The bolt that marks the Daily 5 and the Ear Spark cards. Lives here rather
   than in module data: an icon is presentation, so a card can't ship with the
   wrong one, and re-styling every bolt is a one-line change. */
const ICO_BOLT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ' +
  'style="width:1em;height:1em;vertical-align:-0.15em"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>';

/* Ear Spark — the optional ear-training bonus at the end of a ladder. Matched
   on the English title the same way isTuningWarmupSection() does, so the _es
   twin and any future translation come along for free. The step's own lead-in
   is matched on the untranslated `text` for the same reason. */
function isEarSparkSection(sec){
  return sec.title === 'Ear Spark — optional ear bonus';
}
function isEarSparkStep(s){
  return /^Ear Spark \(/.test(s.text || '');
}

/* The chili that marks the spicy optional level-up card (Module 7's Sweet
   Child intro riff). Same rule as ICO_BOLT: the icon is presentation, so it
   lives here — module data stays plain text. */
const ICO_CHILI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ' +
  'style="width:1em;height:1em;vertical-align:-0.15em">' +
  '<path d="M16.5 7.5c1.2-.4 2.1-1.3 2.5-2.5"/>' +
  '<path d="M19 5c1 0 2-.3 2.7-1"/>' +
  '<path d="M16.5 7.5c2 .8 3 2.8 2.4 5.4-.7 3.2-3.4 6.3-7.4 7.9-3.2 1.3-6.5 1.2-8.5-.3 2.6-.2 4.6-1.2 6-2.9 1-1.2 1.6-2.7 2-4.5.5-2.6 2.2-4.8 5.5-5.6z"/></svg>';

/* Spicy level-up — the optional harder-goal card. Matched on the English
   title/text the same way isEarSparkSection()/isEarSparkStep() are, so the
   _es twin and any future translation come along for free. */
function isSpicyLevelUpSection(sec){
  return /^Level-up — the "Sweet Child/.test(sec.title || '');
}
function isSpicyLevelUpStep(s){
  return /^Learn the most famous riff/.test(s.text || '');
}

/* ── The lesson ladder ──
   The classroom no longer runs a three-group B/C rotation — one group is with
   the teacher, one is on the site — so a set's job here is a single, linear
   work block. Stations B and C are therefore MERGED IN DISPLAY ONLY: B's
   sections then C's (document order), one continuous run of step numbers, one
   `.dp` card. The data layer is untouched — every step key still carries its
   own station's namespace (`${w.id}-b-sec{gi}-{i}` / `${w.id}-c-sec{gi}-{i}`),
   so no student loses a checkmark. `stations.b` / `stations.c` in the module
   files are unchanged. */
function buildLesson(w){
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
    const text=((isEarSparkStep(s) ? ICO_BOLT + ' ' : isSpicyLevelUpStep(s) ? ICO_CHILI + ' ' : '') + tf(s,'text')).replace(/<a href="(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^"]*)"([^>]*)>([^<]*)<\/a>/g,(match,url,attrs,label)=>{
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
      /* Split a multi-sentence hint into bullets: after a full stop that is
         followed by whitespace and then a capital (or ¿/¡), and at newlines.
         Done by marking the split points and splitting on the marker, rather
         than with a lookbehind — Safari before 16.4 can't parse a lookbehind
         literal, and this file failing to parse takes the whole app down on
         an older iPhone. U+0000 can't occur in authored content. */
      const SPLIT_MARK = '\u0000';
      const bullets = hint
        .replace(/\.(?=\s+[A-ZÁÉÍÓÚÜÑ¿¡])/g, '.' + SPLIT_MARK)
        .split(/\u0000|\n/)
        .map(b=>b.trim()).filter(Boolean);
      const inner = bullets.length <= 1 ? `<div class="sh">${hint}</div>`
        : `<ul class="sh-list">${bullets.map(b=>`<li>${b}</li>`).join('')}</ul>`;
      folds.push({key:'hint', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.4 1 2.5h6c0-1.1.3-1.9 1-2.5A6 6 0 0 0 12 3z"/></svg>', label:t('step.hint'), body:inner});
    }
    if(s.stuck) folds.push({key:'stuck', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2 1.8-2 3.5"/><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none"/></svg>', label:t('step.stuck'), body:`<div class="step-branch step-stuck">${tf(s,'stuck')}</div>`});
    if(s.levelUp) folds.push({key:'levelup', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>', label:t('step.levelUp'), body:`<div class="step-branch step-levelup">${tf(s,'levelUp')}</div>`});
    const foldsHtml = folds.length ? (()=>{
      const idBase = `${w.id}-${ns}-${i}-fold`;
      const pills = folds.map(f=>`<button type="button" class="step-fold-pill step-${f.key}-fold" aria-expanded="false" aria-controls="${idBase}-${f.key}" onclick="toggleStepFold(this)">${f.icon} ${f.label}</button>`).join('');
      const panels = folds.map(f=>`<div class="step-fold-panel" id="${idBase}-${f.key}" hidden>${f.body}</div>`).join('');
      return `<div class="step-folds"><div class="step-folds-row">${pills}</div>${panels}</div>`;
    })() : '';
    const chordsHtml = (s.chords&&s.chords.length)
      ? `<div class="chord-diagrams">${s.chords.map(c=>`<div class="chord-box">${chordDiagramSVG(c)}${c.name?`<div class="chord-box-label">${escHtml(tf(c,'name'))}</div>`:''}</div>`).join('')}</div>` + coachChordBtnRowHtml(s.chords, stepSkillIds(w, s))
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
      const labelHtml = `<div class="step-resp-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg> ${t('step.yourResponse')}</div>`;
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
          return `<label class="step-resp-mc-opt"><input type="radio" name="resp-${key}" ${checked} data-choice="${escAttr(c)}" onchange="onResponseChange('${key}', this.dataset.choice)"><span>${escHtml(choicesEs[ci])}</span></label>`;
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
    const doneBtn = `<div class="step-done-row"><button class="step-done-btn${isDone ? ' is-done' : ''}" type="button" aria-pressed="${isDone}" onclick="toggleStepDone(this,'${doneKey}')">${stepDoneHtml(isDone)}</button></div>`;
    const skillsAttr = (s.skills && s.skills.length) ? ` data-skills="${s.skills.join(',')}"` : '';
    const label = stepLabel(s);
    const num = numOffset + i + 1;
    const ariaLabel = t(isDone ? 'step.ariaLabelDone' : 'step.ariaLabel', { n: num, label });
    const statusIcon = isDone ? '&#x2713;' : String(num);
    if(isOpen) openNum = num;
    const curAttr = isCur ? ' aria-current="step"' : '';
    return `<li class="step${isDone ? ' step-done' : ''}${isCur ? ' cur' : ''}${isOpen ? '' : ' collapsed'}"${skillsAttr} data-num="${num}">`
      + `<button type="button" class="step-head" aria-expanded="${isOpen}" onclick="toggleStepOpen(this)" aria-label="${escAttr(ariaLabel)}"${curAttr}>`
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
  /* Every renderable section of the whole ladder, in order, each carrying the
     storage namespace its steps are keyed under. A station with flat `steps:`
     (no sections) becomes one untitled pseudo-section whose ns is the bare
     station letter — exactly the key shape stepsHtml() already wrote for it. */
  const groups = ['b','c'].map(id => ({ id, s: w.stations && w.stations[id] })).filter(g => !!g.s)
    .map(g => ({
      ...g,
      secs: (g.s.sections && g.s.sections.length)
        ? g.s.sections.filter(sec => !isTuningWarmup(sec)).map((sec,gi) => ({ sec, ns: `${g.id}-sec${gi}` }))
        : (g.s.steps ? [{ sec: { title:'', steps: g.s.steps }, ns: g.id }] : [])
    }));
  const flat = groups.flatMap(g => g.secs);
  // Steps done / total for the ladder's progress pill — mirrors stepsHtml's
  // ns-per-section scheme, now summed across BOTH stations (one card, one pill).
  const lessonStepCounts = () => {
    let total=0, done=0;
    flat.forEach(({sec,ns}) => sec.steps.forEach((st,idx)=>{
      total++;
      if(completed[`${w.id}-${ns}-${idx}`]===true) done++;
    }));
    return {total,done};
  };
  /* The B→C seam. Station-level titles ("Computer station — …" / "Practice
     station — …") are no longer rendered — the room has no stations to name —
     but the practice half's title carries real content ("melodies & TAB",
     "requinto texture & your performance pattern"), so the seam keeps it:
     whatever follows the em-dash, same shape in both languages (so no
     per-language parsing), read through tf() so a language switch re-derives
     it. Same trick as lessonSubLabel() on the rail. */
  const stationTail = s => {
    const raw = (s && s.title) ? (tf(s,'title') || '') : '';
    const k = raw.indexOf('—');
    return k >= 0 ? raw.slice(k + 1).trim() : '';
  };
  const dividerHtml = s => {
    const tail = stationTail(s);
    return `<div class="stp-divider"><span class="stp-divider-label">${escHtml(t('lesson.nowPractice'))}${tail ? ' — ' + escHtml(tail) : ''}</span></div>`;
  };
  const ladderHtml=()=>{
    const reminder = groups.some(g => (g.s.sections||[]).some(isTuningWarmup))
      ? `<div class="daily5-inline">${t('daily5.tuneWarmupHtml',{btn:`<button type="button" class="daily5-inline-btn" onclick="openDaily5Here()">${ICO_BOLT} ${t('daily5.openToday')}</button>`})}</div>`
      : '';
    // Sections are plain group labels now, not their own accordion — every
    // step in the whole ladder is a row from the start (Concept B: one level
    // of chunking, not two). `.stp-sec` still wraps each group so deep links
    // can address "station S, section N, step K" — hence data-ns, which is the
    // section's storage namespace and the only stable handle now that DOM
    // position spans two stations.
    // Numbering runs continuously across sections AND across the old B→C
    // boundary (offset carries the running total) even though storage keys
    // stay section-local (`ns` + local `i`).
    // Only ONE step should be open at a time across the whole LADDER, not one
    // per section and not one per station — once an earlier section's current
    // step has claimed it, every later section (even ones with their own
    // incomplete steps) stays fully collapsed until the student works down.
    // Focus mode hides every section label except the one holding the open
    // step (`.sec-cur`, kept in sync by syncStationFocus() as the student
    // moves) — the heading of the group you're actually in, nothing else.
    const noneLeft = focusMode && !flat.some(({sec,ns}) => sec.steps.some((st,idx)=>completed[`${w.id}-${ns}-${idx}`]!==true));
    let numOffset = 0, foundCur = false, curNs = null;
    const rendered = new Map();
    flat.forEach(({sec,ns}, k)=>{
      const allowCur = !foundCur;
      const hasCur = allowCur && sec.steps.some((st,idx)=>completed[`${w.id}-${ns}-${idx}`]!==true);
      const openIfNoCur = noneLeft && k === 0;   // whole ladder done → section 1, step 1 stays open
      if(hasCur || openIfNoCur) curNs = ns;
      const title = tf(sec,'title');
      const html = `<div class="stp-sec${(hasCur || openIfNoCur) ? ' sec-cur' : ''}" data-ns="${escAttr(ns)}">
      ${title ? `<div class="stp-sec-label">${isEarSparkSection(sec) ? ICO_BOLT + ' ' : isSpicyLevelUpSection(sec) ? ICO_CHILI + ' ' : ''}${title}</div>` : ''}
      <ul class="steps">${stepsHtml(sec.steps, ns, numOffset, allowCur, openIfNoCur)}</ul>
    </div>`;
      if(hasCur) foundCur = true;
      numOffset += sec.steps.length;
      rendered.set(ns, html);
    });
    /* One wrapper per station so the seam divider can hide itself in focus
       mode until the student is actually in the practice half (syncStationFocus
       toggles .div-cur) — a lone divider floating above a hidden step reads as
       a heading for nothing. */
    /* .div-cur has to be baked in, not left to syncStationFocus(): a fresh
       render is the common case (every set open, every language switch) and a
       student resuming inside the practice half would otherwise get a seam
       that only appears once they touch something. */
    return reminder + groups.map(g =>
      `<div class="stp-group${g.secs.some(({ns}) => ns === curNs) ? ' div-cur' : ''}" data-group="${g.id}">`
      + (g.id === 'c' ? dividerHtml(g.s) : '')
      + g.secs.map(({ns}) => rendered.get(ns)).join('')
      + `</div>`).join('');
  };
  /* Single-flow sets (e.g. Module 13 · String Changing) have no practice half
     to merge, so they keep their own process title on the card; merged sets
     show no station title at all (the seam divider carries C's words). */
  const single = !(w.stations && w.stations.c);
  const body = ladderHtml();
  const {total: stepTotal, done: stepDone} = lessonStepCounts();
  const pillHtml = stepTotal > 0 ? `<span class="prog-pill-wrap">`
    + `<span class="prog-pill" data-i18n="progress.stepsDone" data-i18n-params="${escAttr(JSON.stringify({done:stepDone,total:stepTotal}))}">${t('progress.stepsDone',{done:stepDone,total:stepTotal})}</span>`
    + `<span class="prog-mini"><i style="width:${Math.round(stepDone/stepTotal*100)}%"></i></span>`
    + `</span>` : '';
  const titleHtml = (single && w.stations.b && w.stations.b.title) ? `<h3 class="dp-title">${tf(w.stations.b,'title')}</h3>` : '';
  const headHtml = (titleHtml || pillHtml) ? `<div class="dp-head">${titleHtml}${pillHtml}</div>` : '';
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
    <div class="dp${focusMode ? ' focus' : ''}${atEnd ? ' at-end' : ''}" id="${w.id}-dp-b">
      ${headHtml}
      ${stepperHtml}
      ${body}
      ${navHtml}
    </div>`;
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
  if(btn.closest('.week-panel.set-peek')) return;   // read-only preview — no writes
  const li = btn.closest('.step');
  const nowDone = !li.classList.contains('step-done');
  li.classList.toggle('step-done', nowDone);
  btn.classList.toggle('is-done', nowDone);
  btn.setAttribute('aria-pressed', nowDone);
  btn.innerHTML = stepDoneHtml(nowDone);
  const status = li.querySelector('.step-status');
  if(status) status.textContent = nowDone ? '✓' : (li.dataset.num || status.textContent);
  const head = li.querySelector('.step-head');
  const labelEl = li.querySelector('.step-label');
  if(head) head.setAttribute('aria-label', t(nowDone ? 'step.ariaLabelDone' : 'step.ariaLabel', { n: li.dataset.num, label: labelEl ? labelEl.textContent : '' }));
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
  // Same rule one level up: in focus mode the B→C seam divider only shows
  // while the open step is in the practice half it introduces.
  dp.querySelectorAll('.stp-group').forEach(g=>g.classList.toggle('div-cur', !!open && g.contains(open)));
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
    /* The lesson scrolls inside .main now, so "hidden at the top" means
       behind the sticky set band at the top of THAT scrollport, not behind
       the header — the header sits above the scrollport entirely. */
    const eyebrow = document.querySelector('.week-panel.active .set-eyebrow');
    const coverTo = eyebrow ? eyebrow.getBoundingClientRect().bottom : hdrH;
    const top = li.getBoundingClientRect().top;
    if(top < coverTo || (force && top > window.innerHeight - 80)) li.scrollIntoView({block:'start'});
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
  steps.forEach(st=>{
    st.classList.remove('cur');
    const h = st.querySelector('.step-head');
    if(h) h.removeAttribute('aria-current');
  });
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
    if(nh){ nh.setAttribute('aria-expanded','true'); nh.setAttribute('aria-current','step'); }
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
  const mini = dp.querySelector('.prog-mini i');
  if(mini) mini.style.width = `${Math.round(total ? done/total*100 : 0)}%`;
}

/* ── Songs ── */
/* Song-list badge ("Core" / "Choice" / "Focus" / "Supp"). The type lives in the
   module data as an English keyword, so it has to go through i18n here or the
   badge stays English in Español mode — which it did site-wide until 2026-08-08.
   Unknown types fall back to the raw keyword rather than rendering blank. */
function songTypeLabel(type, core){
  const key = { Core: 'hub.tagCore', Choice: 'hub.tagChoice',
                Focus: 'hub.tagFocus', Supp: 'hub.tagSupp' }[type];
  if(key) return t(key);
  return type || t(core ? 'hub.tagCore' : 'hub.tagChoice');
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
      ? `&mdash; ${escHtml(truncateText(stripTags(tf(c,'text')),180))} ${setLink(chordWork)}<div class="chord-diagrams">${c.chords.map(ch=>`<div class="chord-box">${chordDiagramSVG(ch)}${ch.name?`<div class="chord-box-label">${escHtml(tf(ch,'name'))}</div>`:''}</div>`).join('')}</div>`
      : `&mdash; ${escHtml(truncateText(stripTags(tf(c,'text')),180))} ${setLink(chordWork)}<br>${routinePlaySeq(c.playSeq, `bpm:routine:${moduleNum}:chords`)}`;
    items+=li(3,t('routine.chordScaleWork'),inner);
  }
  if(song) items+=li(2,t('routine.song'),`&mdash; ${escHtml(truncateText(stripTags(tf(song.step,'text')),220))} ${setLink(song)}`);
  return `<div class="routine-card">
    <div class="routine-head">
      <span class="routine-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 3"/><path d="M9 3h6M12 3v2"/></svg> ${t('routine.title')}</span>
      <button type="button" class="routine-print-btn" onclick="printRoutine()" title="${escAttr(t('routine.printTitle'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7" rx="1"/></svg> ${t('routine.print')}</button>
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
  const y=new Date(); y.setDate(y.getDate()-1);
  const streakAlive = streak.lastDay===dayStr(new Date()) || streak.lastDay===dayStr(y);
  const streakChip = (streak.count > 1 && streakAlive)
    ? `<span class="games-card-best">&#x1F525; ${t('daily5.streak',{n:streak.count})}</span>` : '';
  return `<div class="daily5-head"><div style="display:flex;align-items:center;gap:8px"><h3 style="font:inherit;margin:0">${ICO_BOLT} ${t('daily5.title')}</h3>${streakChip}</div><button type="button" class="tp-close" onclick="closeDaily5()" aria-label="${escAttr(t('daily5.closeAria'))}">&#x2715;</button></div>
    <ol class="routine-list">${items}</ol>`;
}
/* The ladder's warm-up card opens the Daily 5 as a popup over the activities —
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
  openOverlay(ov);
}
function daily5EscClose(e){ if(e.key==='Escape') closeDaily5(); }
function closeDaily5(){
  const ov=document.getElementById('daily5-overlay');
  if(!ov) return;
  ov.remove();
  document.removeEventListener('keydown', daily5EscClose);
  closeOverlay();
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
      <span class="mr-play-tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> <span class="mr-q-num">${playNum}.</span> ${t('review.playRecord')}</span>
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
      <div class="mr-assess-head"><span class="mr-assess-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v-.5a1.5 1.5 0 0 1 3 0V3"/><path d="M8 9h8M8 13h8M8 17h5"/></svg></span> ${t('review.assessHead',{n:mr.moduleNum})}</div>
      <div class="mr-assess-body">${assessBody}</div>
      <div class="mr-rec mr-assess-rec" data-module="${mr.moduleNum}">
        <div class="mr-assess-rec-tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4M9 21h6"/></svg> ${t('review.assessRecTag')}</div>
        <div class="mr-rec-body" id="${mrId}a-rec-body">${renderRecBody(`${mr.moduleNum}a`)}</div>
      </div>
      <div class="mr-assess-signup">
        <span class="mr-assess-signup-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4M16 3v4"/><path d="M9 15l2 2 4-4"/></svg></span>
        <div class="mr-assess-signup-text"><strong>${t('review.assessSignupHead')}</strong> ${t('review.assessSignupBody',{n:mr.moduleNum})}</div>
      </div>
    </div>`;
  const forwardHtml = mr.forward
    ? `<div class="ablock mr-forward" style="margin-top:12px"><div class="albl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M9 15l6-6"/><path d="M8 12l-1.5 1.5a3.5 3.5 0 0 0 5 5L13 17"/><path d="M16 12l1.5-1.5a3.5 3.5 0 0 0-5-5L11 7"/></svg> ${t('review.whyMatters')}</div><div class="atxt">${tf(mr,'forward')}</div></div>`
    : '';
  return `
    ${buildModuleRoutine(mr.moduleNum)}
    <div class="mr-locked-banner">
      <span class="mr-locked-banner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></span>
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
    <div class="mr-done${isMrComplete(mr.moduleNum)?' is-done':''}" id="${mrId}-done">${buildMrDoneInner(mr.moduleNum)}</div>
    <div class="save-ind" id="${mrId}-save-ind" style="margin-top:10px" aria-live="polite"></div>`;
}

/* ── The review's finish line: "I've finished this review" ──
   The panel used to just stop. A student could rate every row, write both
   reflections, and get no signal that they were done or that the next module
   was now theirs — the only way on was to notice the dropdown had un-locked.
   The button is enabled by the SAME condition the cross-module gate uses
   (every self-rating row rated — see isModuleGateLocked), so what it promises
   and what actually unlocks can't drift apart.
   The mrN-complete key it writes is a DISPLAY state only: nothing gates on it.
   That's deliberate — students who finished a review before this button
   existed must never be sent back to press it, and a gate that could be
   un-pressed is a gate that can re-lock someone out of work they finished. */
function mrRowsLeft(moduleNum){
  const mr = MODULE_REVIEWS[moduleNum];
  if(!mr) return 0;
  return (mr.skills||[]).filter(s=>{ const v=progress[s.id]; return !(v==='1'||v==='2'||v==='3'); }).length;
}
/* Stored as 'gotit' rather than true: loadProgress() normalizes any value it
   doesn't recognize down to 'none', and 'gotit' round-trips through both it
   and the teacher console's copy of the same normalizer. */
function isMrComplete(moduleNum){ return progress[`mr${moduleNum}-complete`]==='gotit'; }
/* The module after this one, or null at the end of the course. Module 13
   (String Changing) IS a legitimate "next" here — it sits outside the
   sequential gate, not outside the course; it just has no review of its own. */
function nextModuleAfter(moduleNum){
  return (typeof MODULE_MANIFEST!=='undefined' ? MODULE_MANIFEST.find(m=>m.num===moduleNum+1) : null) || null;
}
function buildMrDoneInner(moduleNum){
  const left = mrRowsLeft(moduleNum);
  const done = isMrComplete(moduleNum);
  const next = nextModuleAfter(moduleNum);
  const nextLine = next
    ? t('review.doneNext', { num: next.num, mod: escHtml(tf(next,'name')) })
    : t('review.doneLast');
  const head = done ? t('review.doneTitleDone', { n: moduleNum })
             : left ? t('review.doneTitleTodo')
                    : t('review.doneTitleReady');
  const body = left ? t('review.doneLeft', { n: left }) : nextLine;
  const btn = done
    ? (next ? `<button type="button" class="panel-next-btn mr-done-btn" onclick="goToNextModule(${moduleNum})">${escHtml(t('review.doneGo',{num:next.num}))} &rarr;</button>` : '')
    : `<button type="button" class="panel-next-btn mr-done-btn"${left?' disabled':''} onclick="finishModuleReview(${moduleNum})">${escHtml(t('review.doneBtn'))} &rarr;</button>`;
  return `<div class="mr-done-text">
      <div class="mr-done-head">${done?'<span class="mr-done-check" aria-hidden="true">&#10003;</span> ':''}${head}</div>
      <div class="mr-done-body">${body}</div>
    </div>${btn}`;
}
/* Re-render the card in place — the last unrated row becoming rated is what
   flips the button on, and that happens without rebuilding the panel. */
function syncMrDone(moduleNum){
  const el = document.getElementById(`mr${moduleNum}-done`);
  if(!el) return;
  el.classList.toggle('is-done', isMrComplete(moduleNum));
  el.innerHTML = buildMrDoneInner(moduleNum);
}
function finishModuleReview(moduleNum){
  if(isReviewPanelLocked(`mr${moduleNum}`)) return;   // preview panel — not theirs to finish
  const left = mrRowsLeft(moduleNum);
  if(left){ gateToast(t('review.doneLeftToast',{n:left})); return; }
  progress[`mr${moduleNum}-complete`]='gotit';
  saveProgress();
  syncMrDone(moduleNum);
  renderPills(moduleNum);              // the review pill goes green
  gateToast(t('review.doneToast',{n:moduleNum}));
  goToNextModule(moduleNum);
}
/* Move the student on. Same path the module dropdown takes, so everything
   that hangs off a module change (panels, pills, resume card) still runs. */
function goToNextModule(moduleNum){
  const next = nextModuleAfter(moduleNum);
  if(!next) return;                    // last module: the card says so, no button
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(next.num);
  onModuleChange(next.num);
  saveProgress();
}

/* ── Assessment pop-up, every time the review is opened ──
   The assessment box itself stays where it has always been, at the bottom of
   the review panel — this fires whenever the student opens the panel, so the
   in-person assessment can't be scrolled past unseen. Deliberately NOT
   once-per-visit (Jonathan's call, 2026-08-13): the point is that every trip
   to the review restates what the assessment asks for. Skipped on a locked
   (preview) panel — the review isn't theirs to take yet. */
function maybeShowMrAssess(moduleNum){
  const mr = MODULE_REVIEWS[moduleNum];
  if(!mr) return;
  if(isReviewPanelLocked(`mr${moduleNum}`)) return;
  closeMrAssess();   // never stack two overlays on the same id
  const ov = document.createElement('div');
  ov.className = 'daily5-overlay';
  ov.id = 'mr-assess-overlay';
  ov.dataset.module = moduleNum;   // so setLang can rebuild the body in place
  ov.innerHTML = `<div class="daily5-modal mr-assess-modal" role="dialog" aria-modal="true" aria-label="${escAttr(t('review.assessHead',{n:moduleNum}))}">${buildMrAssessPop(moduleNum)}</div>`;
  ov.addEventListener('click', e => { if(e.target === ov) closeMrAssess(); });
  document.body.appendChild(ov);
  document.addEventListener('keydown', mrAssessEscClose);
  openOverlay(ov);
}
/* Modal body, split out so a language switch can re-render it in place —
   same treatment setLang gives the Daily 5 overlay. */
function buildMrAssessPop(moduleNum){
  const mr = MODULE_REVIEWS[moduleNum];
  const itemsTf = tf(mr,'assessItems');
  const body = (mr.assessItems && mr.assessItems.length)
    ? `<p>${t('review.assessPopIntro',{n:moduleNum})}</p><ul class="mr-assess-list">${mr.assessItems.map((i,ii)=>`<li>${itemsTf[ii]}</li>`).join('')}</ul>`
    : `<p>${t('review.assessPopIntroDflt',{n:moduleNum})}</p>`;
  return `<div class="daily5-head"><h3 style="font:inherit;margin:0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:16px;height:16px;vertical-align:-2px;margin-right:2px"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v-.5a1.5 1.5 0 0 1 3 0V3"/><path d="M8 9h8M8 13h8M8 17h5"/></svg> ${t('review.assessHead',{n:moduleNum})}</h3>
      <button type="button" class="tp-close" onclick="closeMrAssess()" aria-label="${escAttr(t('gate.closeAria'))}">&#x2715;</button></div>
    <div class="mr-assess-pop-body">${body}<p class="mr-assess-pop-note">${t('review.assessPopNote')}</p></div>
    <div class="mr-assess-actions">
      <button type="button" class="mr-assess-later" onclick="closeMrAssess()">${escHtml(t('review.assessPopLater'))}</button>
    </div>`;
}
function mrAssessEscClose(e){ if(e.key === 'Escape') closeMrAssess(); }
function closeMrAssess(){
  const ov = document.getElementById('mr-assess-overlay');
  if(!ov) return;
  ov.remove();
  document.removeEventListener('keydown', mrAssessEscClose);
  closeOverlay();
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
  // Rating the last mrN row can be the exact action that finishes a module
  // and unlocks the next one's Set 1 — same live-refresh toggleSkill already
  // does for the plain got-it gate, so the 🔒 (dropdown) and peek banner
  // (pill rail) drop without a reload.
  renderPills(lastModuleNum);
  populateModuleDropdown();
  // ...and the finish-line card at the bottom of this very panel: rating the
  // last row is what enables its button.
  if(/^mr\d+$/.test(mrId)) syncMrDone(Number(mrId.slice(2)));
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
    <button type="button" class="mr-rec-btn primary" onclick="startRec('${slot}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4M9 21h6"/></svg> ${t('rec.record')}</button>
    <span class="mr-rec-help">${t('rec.help',{s:REC_MAX_SECS})}</span>
  </div>`;
}

function refreshRecUI(slot){
  const host = document.getElementById(`mr${slot}-rec-body`);
  if (!host) return;
  host.innerHTML = renderRecBody(slot);
  // The rail recorder tile pulses red while its slot is recording, visible
  // even with the popup closed — mirrors the timer FAB's done-flash cue.
  if (slot === 'fab'){
    const fab = document.getElementById('fab-rec');
    if (fab) fab.classList.toggle('rec-live', !!(recState.fab && recState.fab.recording));
  }
}

async function startRec(slot){
  if (!navigator.mediaDevices || !window.MediaRecorder){
    alert(t('rec.noSupport'));
    return;
  }
  // Re-entry guard: a second tap while getUserMedia's permission prompt is
  // still up (or while already recording) would overwrite recState[slot]
  // below and orphan the first stream — mic stays live with nothing left
  // holding a reference to stop it.
  if (recState[slot] && (recState[slot].starting || recState[slot].recording)) return;
  if (recState[slot] && recState[slot].pendingBlobUrl) URL.revokeObjectURL(recState[slot].pendingBlobUrl);
  // One mic owner at a time (the tuner/Coach/games all evict each other the
  // same way): recording alongside the Coach's processing-off stream would
  // put two sessions with conflicting constraints on the same device.
  if (typeof coachInterrupt === 'function') coachInterrupt();
  if (typeof gamesStopMic === 'function') gamesStopMic();
  if (typeof stopTuner === 'function') stopTuner();
  recState[slot] = { starting: true };
  const pending = recState[slot];
  let stream = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    // The slot was cleared (stopAnyRec) or restarted while the permission
    // prompt was up — release the just-granted stream and bow out quietly.
    if (recState[slot] !== pending){
      stream.getTracks().forEach(tr => tr.stop());
      return;
    }
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
    // Also reached when the MediaRecorder constructor or start() throws
    // AFTER the mic was granted — release the stream, or it stays live with
    // no UI and no recState entry left to stop it.
    if (stream) stream.getTracks().forEach(tr => tr.stop());
    const s = recState[slot];
    // Only clean up (and alert about) an entry this invocation owns — the
    // slot may have been cleared by stopAnyRec during the permission prompt
    // and even restarted by a fresh tap since.
    if (s && (s === pending || s.stream === stream)){
      if (s.timerInterval) clearInterval(s.timerInterval);
      if (s.autoStopTimeout) clearTimeout(s.autoStopTimeout);
      delete recState[slot];
      refreshRecUI(slot);
      alert(t('rec.micFail', {err: err.message || err.name || 'permission denied'}));
    }
  }
}

function stopRec(slot){
  const s = recState[slot];
  if (!s || !s.recorder) return;
  if (s.recorder.state !== 'inactive') s.recorder.stop();
}

/* Navigating away mid-recording would otherwise leave the mic live for up
   to REC_MAX_SECS — every other mic feature on the site stops on navigation,
   so the recorder does too. Called from activateSet (which passes keepFab:
   the rail recorder is a persistent site-wide tool with a pulsing tile —
   switching sets to read a chord chart mid-take shouldn't truncate it) and,
   without options, from startTuner/coachOpen (those need the mic itself, so
   every slot stops, fab included). */
function stopAnyRec(opts){
  Object.keys(recState).forEach(m => {
    if (opts && opts.keepFab && m === 'fab') return;
    const s = recState[m];
    if (!s) return;
    if (s.recording) stopRec(m);
    // A slot still waiting on getUserMedia has no recorder to stop — drop
    // the entry so the slot isn't stuck in `starting` forever; startRec sees
    // the swap and releases the stream if permission is granted later.
    else if (s.starting){ delete recState[m]; refreshRecUI(m); }
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
        <div class="sk-helper" id="gi-${s.id}" hidden><strong class="got-it-lab" data-i18n="skill.youveGotItWhen">${t('skill.youveGotItWhen')}</strong>${tf(s,'gotItWhen')}</div>` : '';
    const practiceBtn = s.practice ? `
        <button type="button" class="sk-practice-btn" onclick="togglePracticePanel('${s.id}', this)" aria-expanded="false" aria-controls="pp-${s.id}"><span class="sk-practice-btn-arrow">▸</span> ${t('step.practiceThis')}</button>` : '';
    const skillNum = (s.id.match(/-s(\d+)$/) || [])[1];
    const whereBtn = (skillNum && skillTaughtStation(w, Number(skillNum)))
      ? `<button type="button" class="sk-where-btn" onclick="showSkillLesson('${w.id}', ${skillNum})" title="${escAttr(t('skill.jumpToSteps'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.3"/></svg> <span data-i18n="skill.showMeWhere">${t('skill.showMeWhere')}</span></button>` : '';
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
      `<div class="chord-box">${chordDiagramSVG(c)}${c.name ? `<div class="chord-box-label">${escHtml(tf(c,'name'))}</div>` : ''}</div>`).join('');
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
    /* Structured tempo ladder: {type:'pr', prompt, unit:'BPM'|'count',
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
  if(typeof srCheckComplete === 'function') srCheckComplete();
  if(typeof srRefreshIfOpen === 'function') srRefreshIfOpen();
}
function logCleanRep(sid, btnEl){
  logPracticeRep(sid);
  if(btnEl) flashClass(btnEl, 'rep-logged', 500);
}

/* ── tempo ladder helpers (practice.type === 'pr') ──
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
  // Teacher mode is previewing a student's activity, not practising: the
  // session best above is enough, nothing is filed on the teacher's own doc.
  if(!currentUser || (typeof isDevBypassUser === 'function' && isDevBypassUser())) return;
  if(IS_TEACHER_MODE) return;
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
      (best ? `<div class="sdr-best"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M7 5H4.5A2.5 2.5 0 0 0 7 8.5"/><path d="M17 5h2.5A2.5 2.5 0 0 1 17 8.5"/><path d="M12 13v3"/><path d="M9 20h6"/><path d="M9.5 20 10 16h4l.5 4"/></svg> ${escHtml(t('drill.best', { n: best, total: c.rounds }))}</div>` : '') +
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
  // A peeked set stays playable (the drill itself is view/practice content),
  // but the round's result must not persist — same invariant as toggleSkill.
  if(!isSetPeeking(c.wid)){
    sdSaveBest(c, st.inTime);
    sdRecordSkillBest(c, st.inTime);
  }

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
   would freeze a real answer in place, which is the bug, not the fix.
   Ratified narrow (Jonathan, 2026-08-04): pin genuine catch-alls only;
   ordinary compound answers shuffle. */
const MC_PINNED = /^(all|none|both|neither)\s+of\b|^(none|all)$/i;
/* Catch-alls the regex can't classify without over-matching ordinary answers
   ("All three notes at once, as a chord" in module-9 is a real distractor,
   not a summary). Content-coupled: reword one of these choices in module
   data and this entry must change with it — nothing enforces the link. */
const MC_PINNED_EXACT = new Set([
  'All three show note sequences',                     // module-5
  "Anywhere — the thumb doesn't affect your fingers",  // module-2
]);
function mcHash(str){
  let h = 2166136261;
  for(let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mcSeed(r){ return (r.prompt || '') + '|' + (r.choices || []).join('|'); }
/* Returns the ORIGINAL indices of `choices`, in display order. */
function mcOrder(choices, seedStr){
  if(!Array.isArray(choices) || choices.length < 3) return (choices||[]).map((c,i)=>i);
  const pinned = choices.map(c => {
    const s = String(c).trim();
    return MC_PINNED.test(s) || MC_PINNED_EXACT.has(s);
  });
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
  'naturals-plus': { kicker:'deck.kNote', hint:'deck.hFindNote',
    cards:[{f:'A'},{f:'B'},{f:'C'},{f:'D'},{f:'E'},{f:'F'},{f:'G'},{f:'F#'},{f:'Bb'}] },
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
  if(IS_TEACHER_MODE) return;   // preview, not practice — see sdSaveBest
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
      `<button type="button" class="sdr-start" onclick="dkStart('${key}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="4" y="7" width="12" height="15" rx="2"/><rect x="8" y="3" width="12" height="15" rx="2"/></svg> ${escHtml(t('deck.start'))}</button>` +
      (best ? `<div class="sdr-best"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M7 5H4.5A2.5 2.5 0 0 0 7 8.5"/><path d="M17 5h2.5A2.5 2.5 0 0 1 17 8.5"/><path d="M12 13v3"/><path d="M9 20h6"/><path d="M9.5 20 10 16h4l.5 4"/></svg> ${escHtml(t('deck.best', { n: best, total }))}</div>` : '') +
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
      /* role/tabindex only while it IS clickable (an unflipped card): the
   delegated Enter/Space handler below picks up any [role="button"], and a
   flipped card has no onclick to reach. The Start button underneath does
   the same job, so this is about the card being the obvious big target. */
      `<div class="dkr-card${st.shown ? ' flipped' : ''}"${st.shown ? '' : ` role="button" tabindex="0" onclick="dkFlip('${key}')"`}>` +
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
  else {
    // Only requeue if at least one other card can land between this draw and
    // the redeal — otherwise (a miss on the last card of the pass) there's
    // nothing to interpose and splicing here would redeal it immediately.
    const remaining = st.deck.length - st.i - 1;
    if(remaining > 0) st.deck.splice(Math.min(st.deck.length, st.i + 3), 0, c);
  }
  st.i++; st.shown = false;
  if(st.i >= st.deck.length){ st.phase='done'; if(!isSetPeeking(st.cfg.wid)) dkSaveBest(st.cfg.id, st.hit); dkBox(key).innerHTML = dkDoneHtml(key); }
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
  // A-string vs D-string bass under Am (module-8.js, m8w2 Station C) — a
  // 2-option pool, same shape as the binary-choice style of lowEFrets, just
  // with 2 distinct values instead of 6.
  amBassAD:    { midis:[45,50], labels:['A','D'], kicker:'ear.kBassString' }
};
const earDrills = {};
function erBox(key){ return document.getElementById('err-' + key); }
function erStop(key){
  const st = earDrills[key];
  if(st && st.timeouts) st.timeouts.forEach(clearTimeout);
}
function erStopAll(){
  Object.keys(earDrills).forEach(erStop);
}
function renderEarDrill(drill, key, wid){
  const pool = EAR_POOLS[drill.pool];
  if(!pool) return '';
  erStop(key);   // a re-render (new set, language toggle) must not leave the old card's notes playing
  // skill: optional, same job as the Shuffle/Deck drills' cfg.skill — a
  // clean reveal (every note named right) offers the check-off inline
  // instead of sending the student to the checklist tab to do it from memory.
  earDrills[key] = { phase:'setup', cfg:{ pool, poolId: drill.pool, draw: drill.draw || 5, skill: drill.skill || null, wid }, timeouts: [] };
  return `<div class="sdr err" id="err-${escAttr(key)}">${erSetupHtml(key)}</div>`;
}
function erHead(key, right){
  const st = earDrills[key];
  return `<div class="sdr-head"><span>${ICO_BOLT} ${escHtml(t('ear.' + st.cfg.poolId))}</span>` +
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
  (st.timeouts || []).forEach(clearTimeout);
  st.timeouts = [];
  st.seq.forEach((n, i) => st.timeouts.push(setTimeout(() => playNote(st.cfg.pool.midis[n]), i * 1100)));
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
    <button type="button" class="review-sr-link" onclick="goExploreHash('daily-review')"><span data-i18n="sr.title">${t('sr.title')}</span> &rarr;</button>
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
    row.scrollIntoView({ behavior: scrollBehavior(), block:'center' });
    flashClass(row, 'review-flash', 1800);
    // Keyboard path: closing the Daily Review page bounced focus back to the
    // rail button (srClosePanel) — move it to the row we just jumped to.
    row.setAttribute('tabindex','-1');
    row.focus({ preventScroll:true });
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
    <div class="daily5-head"><h3 style="font:inherit;margin:0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:16px;height:16px;vertical-align:-2px;margin-right:2px"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4M9 21h6"/></svg> ${t('gate.title')}</h3>
      <button type="button" class="tp-close" onclick="closeCoachGate()" aria-label="${escAttr(t('gate.closeAria'))}">&#x2715;</button></div>
    ${sk ? `<p class="coach-tip">${escHtml(tf(sk,'text'))}</p>` : ''}
    <p class="coach-tip">${escHtml(t('gate.body'))}</p>
    <div class="issue-actions">
      <button type="button" class="panel-next-btn" onclick="coachGatePractice('${escAttr(sid)}','${escAttr(wid)}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:14px;height:14px;vertical-align:-2px;margin-right:2px"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4M9 21h6"/></svg> ${t('gate.practice')}</button>
      <button type="button" class="tp-btn" onclick="coachGateMarkAnyway('${escAttr(sid)}','${escAttr(wid)}')">${t('gate.markAnyway')}</button>
    </div>`;
  ov.addEventListener('click', e => { if(e.target === ov) closeCoachGate(); });
  document.body.appendChild(ov);
  document.addEventListener('keydown', coachGateEscClose);
  openOverlay(ov);
}
function coachGateEscClose(e){ if(e.key === 'Escape') closeCoachGate(); }
function closeCoachGate(){
  const ov = document.getElementById('coach-gate-overlay');
  if(!ov) return;
  ov.remove();
  document.removeEventListener('keydown', coachGateEscClose);
  closeOverlay();
}
/* "Practice it now" → close the gate and open that skill's practice panel,
   where the Listening Coach button lives. The gate can open from any set
   tab (the ladder offers inline check-offs), but the practice panel lives in
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
  panel.scrollIntoView({block:'center', behavior: scrollBehavior()});
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
const DRILL_GATE_PCT = 0.9;    // matches the deck's own ≥90% check-off offer
let drillSkillSession = {};    // sid → best this session (covers dev-bypass / signed-out)
/* The gate threshold as a raw hit-count, scaled to the drill's own rounds
   (falls back to SD_ROUNDS if the skill isn't drill-gated — callers only use
   this after confirming skillIsDrillGated(sid)). Was a bare "9" that only
   happened to equal 90% because every shuffle drill today uses rounds:10 —
   a future drill with fewer rounds would make the old constant unreachable
   even on a perfect run. */
function drillGateThreshold(sid){
  const hit = skillDrillStep(sid);
  const rounds = (hit && hit.drill.rounds) || SD_ROUNDS;
  return Math.ceil(rounds * DRILL_GATE_PCT);
}
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
    <div class="daily5-head"><h3 style="font:inherit;margin:0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:16px;height:16px;vertical-align:-2px;margin-right:2px"><rect x="4" y="7" width="12" height="15" rx="2"/><rect x="8" y="3" width="12" height="15" rx="2"/></svg> ${t('dgate.title')}</h3>
      <button type="button" class="tp-close" onclick="closeDrillGate()" aria-label="${escAttr(t('gate.closeAria'))}">&#x2715;</button></div>
    ${sk ? `<p class="coach-tip">${escHtml(tf(sk,'text'))}</p>` : ''}
    <p class="coach-tip">${escHtml(t('dgate.body'))}</p>
    <div class="issue-actions">
      <button type="button" class="panel-next-btn" onclick="drillGatePractice('${escAttr(sid)}','${escAttr(wid)}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:14px;height:14px;vertical-align:-2px;margin-right:2px"><rect x="4" y="7" width="12" height="15" rx="2"/><rect x="8" y="3" width="12" height="15" rx="2"/></svg> ${t('dgate.goto')}</button>
      <button type="button" class="tp-btn" onclick="drillGateMarkAnyway('${escAttr(sid)}','${escAttr(wid)}')">${t('gate.markAnyway')}</button>
    </div>`;
  ov.addEventListener('click', e => { if(e.target === ov) closeDrillGate(); });
  document.body.appendChild(ov);
  document.addEventListener('keydown', drillGateEscClose);
  openOverlay(ov);
}
function drillGateEscClose(e){ if(e.key === 'Escape') closeDrillGate(); }
function closeDrillGate(){
  const ov = document.getElementById('drill-gate-overlay');
  if(!ov) return;
  ov.remove();
  document.removeEventListener('keydown', drillGateEscClose);
  closeOverlay();
}
/* "Take me to the deck" → switch to the station tab that holds it, expand
   the step if it's collapsed, and scroll the deck into view. */
function drillGatePractice(sid, wid){
  closeDrillGate();
  const hit = skillDrillStep(sid);
  const useWid = (hit && hit.w.id) || wid;
  /* switchTabById resolves `${wid}-${tab}`, and the lesson panel is
     `${wid}-station-b`. Passing the bare station letter looked up an id that
     does not exist, so the tab never switched and the scroll below silently
     targeted a display:none element. */
  switchTabById(useWid, LESSON_TAB, true);
  const box = document.querySelector(`.week-panel[data-id="${useWid}"] .sdr[data-skill="${CSS.escape(sid)}"]`);
  if(!box){
    /* Never dead-end the student: land them on the ladder at least. */
    const stn = document.getElementById(`${useWid}-${LESSON_TAB}`);
    if(stn) stn.scrollIntoView({ block:'start', behavior: scrollBehavior() });
    return;
  }
  const li = box.closest('li.step');
  if(li && li.classList.contains('collapsed')){
    const head = li.querySelector('.step-head');
    if(head) head.click();
  }
  setTimeout(()=>{
    box.scrollIntoView({ block:'center', behavior: scrollBehavior() });
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
      overrideAt: dayStr(new Date())
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
  // A peeked set is read-only — this single guard covers every path that
  // reaches toggleSkill: the checklist cells directly, plus the drill
  // check-off buttons and both gate modals' "Mark it anyway", which all call
  // this function rather than writing progress themselves.
  if(isSetPeeking(wid)) return false;
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
      if(!drillGateBypass && !coachGateBypass && skillIsDrillGated(sid) && drillGateBest(sid) < drillGateThreshold(sid)){
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
        const thread = w.songThread[(done - 1) % w.songThread.length];
        echoEl.textContent = thread.layer
          ? t(thread.bonus ? 'songs.echoLayerBonus' : 'songs.echoLayer', { name: thread.name, layer: thread.layer })
          : t('songs.echoPlain', { name: thread.name });
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
function rebuildModuleContentPanels(){
  document.querySelectorAll('#week-panels .week-panel').forEach(panel=>{
    const wid = panel.dataset.id;
    const num = Number(panel.dataset.module);
    const w = SETS.find(x=>x.id===wid);
    const mr = MODULE_REVIEWS[num];
    if(w && wid===w.id){
      // Remember which tab was open so rebuilding doesn't bounce the
      // student back to the lesson ladder.
      const activeEl = panel.querySelector('.tab-panel.active');
      const activeSuffix = activeEl ? activeEl.id.slice(wid.length+1) : null;
      panel.innerHTML = w.comingSoon ? buildComingSoon(w) : buildSet(w);
      if(activeSuffix && activeSuffix !== LESSON_TAB){
        const targetPanel = document.getElementById(`${wid}-${activeSuffix}`);
        if(targetPanel){
          panel.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
          targetPanel.classList.add('active');
        }
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
  // Rebuild the resume card in the new language (no-op if dismissed/unused).
  if(_resumeCardBuilt && !_resumeCardClosed) renderResumeCard();
  if(typeof syncRailStations === 'function') syncRailStations();
  if(typeof populateModuleDropdown === 'function') populateModuleDropdown();
  rebuildModuleContentPanels();
  /* The explore pages are hash-based (toggling twice would churn the
     browser history), so an open one just re-renders its body in place —
     the topbar labels are data-i18n-tagged and already re-translated. */
  const songsScreen = document.getElementById('songs-screen');
  if(songsScreen && !songsScreen.hidden && typeof renderSongsHub === 'function') renderSongsHub();
  const kpScreen = document.getElementById('keep-practicing-screen');
  if(kpScreen && !kpScreen.hidden && typeof renderKeepPracticing === 'function') renderKeepPracticing();
  const srScreen = document.getElementById('sr-screen');
  if(srScreen && !srScreen.hidden && typeof renderDailyReview === 'function') renderDailyReview();
  const mpScreen = document.getElementById('my-progress-screen');
  if(mpScreen && !mpScreen.hidden && typeof renderMyProgress === 'function') renderMyProgress();
  const caScreen = document.getElementById('class-activities-screen');
  if(caScreen && !caScreen.hidden && typeof renderClassActivities === 'function') renderClassActivities();
  // A live Daily 5 overlay just rebuilds its modal body in place.
  const d5 = document.querySelector('#daily5-overlay .daily5-modal');
  if(d5 && typeof buildDaily5 === 'function'){
    d5.setAttribute('aria-label', t('daily5.title'));
    d5.innerHTML = buildDaily5();
  }
  // Same for an open module-review assessment pop-up.
  const mrOv = document.getElementById('mr-assess-overlay');
  if(mrOv && typeof buildMrAssessPop === 'function'){
    const n = parseInt(mrOv.dataset.module, 10);
    const modal = mrOv.querySelector('.mr-assess-modal');
    if(modal){
      modal.setAttribute('aria-label', t('review.assessHead',{n}));
      modal.innerHTML = buildMrAssessPop(n);
    }
  }
  // The rail Recorder popup body bakes t() results in with no data-i18n tags
  // (renderRecBody), and #mrfab-rec-body sits outside the module panels the
  // rebuild above covers — re-render it in place or it stays half-English.
  // Idle-only, same guard as togglePopup: rebuilding mid-recording or during
  // a listen-back would reset the timer display / stop the <audio> at 0:00.
  if (!recState.fab) refreshRecUI('fab');
});

/* ══════════════════════════════════════════════
   FLOATING TOOLS — Metronome & Timer
   ══════════════════════════════════════════════ */
let audioCtx=null;
function getAudioCtx(){ if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)(); return audioCtx; }
function beep(freq,dur,gain){ const ctx=getAudioCtx(); const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value=freq; g.gain.setValueAtTime(gain==null?0.4:gain,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur); o.start(); o.stop(ctx.currentTime+dur); }
/* Every synthesized pluck goes through one shared bus, so a single gain
   node can silence notes that are already sounding — see killRingingPlucks. */
let pluckBus = null;
function getPluckBus(){
  const ctx = getAudioCtx();
  if(!pluckBus || pluckBus.context !== ctx){
    pluckBus = ctx.createGain();
    pluckBus.gain.value = 1;
    pluckBus.connect(ctx.destination);
  }
  return pluckBus;
}
/* Cancelling the timeouts that schedule notes isn't enough to stop the sound:
   a note struck a moment ago already has its whole tail committed to an
   AudioBufferSourceNode and will keep ringing into a live mic. Duck the bus
   instead, then reopen it for whatever gets played next. */
function killRingingPlucks(){
  if(!pluckBus) return;
  const ctx = pluckBus.context, now = ctx.currentTime;
  pluckBus.gain.cancelScheduledValues(now);
  pluckBus.gain.setValueAtTime(pluckBus.gain.value, now);
  pluckBus.gain.linearRampToValueAtTime(0, now + 0.02);   // short fade, not a hard cut — a cut clicks
  pluckBus.gain.setValueAtTime(1, now + 0.03);
}
/* Karplus-Strong plucked-string synthesis: a short noise burst is fed into a
   feedback delay line whose length equals one period of the target pitch. A
   lowpass in the loop makes harmonics decay over time — high notes fade faster
   than low notes, like a real guitar string. midi=69 → A4 (440Hz).

   The delay line is tuned to a FRACTIONAL length. An integer-only line can
   only sound pitches that divide the sample rate evenly, which ran as much as
   37 cents sharp in the high register — a third of a semitone, on a site where
   students train their ears against these notes. The leftover fraction goes
   through a first-order allpass, which delays without dulling the tone the way
   plain interpolation would.

   Bare Karplus-Strong sounds synthetic mostly because of what it leaves out,
   so three things get added on top: a pick-position comb, the click of the
   pick itself, and a pair of body resonances. */
const PLUCK_VOICE_GAIN = 0.45;   // every buffer is peak-normalized, so this alone sets note level
function ksPluckBuffer(ctx, midi){
  const sr = ctx.sampleRate;
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const bright = Math.min(1, Math.max(0, (midi - 40) / 48));   // 0 at the low E, 1 at the top of the range
  /* Loop filter is a two-tap FIR (1-b, b): b = 0.5 is the classic averager,
     lower b damps less and rings brighter. Its group delay is exactly b
     samples, which the tuning below has to account for. */
  const b = 0.44 + 0.06 * bright;
  /* Loop gain, nudged closer to 1 down low so a wound bass string sustains
     like one instead of dying off with the trebles. */
  const decay = 0.9884 - 0.0052 * bright;
  /* Total loop delay has to equal one period; the loop filter already supplies
     b samples of it, so the delay line carries the rest. */
  let target = Math.max(2.1, sr / freq - b);
  let len = Math.floor(target), frac = target - len;
  /* An allpass is least accurate — and rings longest — as its delay nears
     zero, so borrow a whole sample to keep the fraction off the floor. */
  if (frac < 0.1 && len > 2){ len -= 1; frac += 1; }
  const ap = (1 - frac) / (1 + frac);
  /* Excitation: white noise, lowpassed to take the fizz off the attack. */
  const ring = new Float32Array(len);
  let prev = 0;
  for (let i = 0; i < len; i++){
    prev = 0.5 * ((Math.random() * 2 - 1) + prev);
    ring[i] = prev;
  }
  /* Pick position. Plucking a fifth of the way along a string kills every
     harmonic with a node at that point — this comb is most of what separates
     a picked guitar from a generic plucked tone. Removing the mean afterwards
     matters too: DC sails through the loop filter untouched and turns into a
     thump plus wasted headroom. */
  const pick = Math.max(1, Math.round(0.19 * len));
  const exc = new Float32Array(len);
  let sum = 0;
  for (let i = 0; i < len; i++){
    exc[i] = ring[i] - ring[(i - pick + len) % len];
    sum += exc[i];
  }
  const dc = sum / len;
  for (let i = 0; i < len; i++) ring[i] = exc[i] - dc;
  /* Render only as long as the note can still be heard. A high E is silent
     inside half a second, so a flat 1.5s buffer was mostly wasted work. */
  const total = Math.floor(sr * Math.min(2.0, Math.max(0.45,
    Math.log(0.002) / (freq * Math.log(decay)))));
  const buffer = ctx.createBuffer(1, total, sr);
  const data = buffer.getChannelData(0);
  let idx = 0, lpPrev = 0, apIn = 0, apOut = 0;
  for (let i = 0; i < total; i++){
    const out = ring[idx];
    data[i] = out;
    const lp = (1 - b) * out + b * lpPrev;  // loop filter (worth b samples of delay)
    lpPrev = out;
    const y = ap * lp + apIn - ap * apOut;  // allpass carries the fractional remainder
    apIn = lp; apOut = y;
    ring[idx] = decay * y;
    idx = (idx + 1) % len;
  }
  /* The pick striking the string — a few ms of bright noise the string model
     itself can't produce. */
  const clickN = Math.min(total, Math.floor(sr * 0.004));
  for (let i = 0; i < clickN; i++){
    data[i] += (Math.random() * 2 - 1) * 0.28 * Math.pow(1 - i / clickN, 3);
  }
  /* The box: the Helmholtz air resonance and the main top resonance, as two
     cheap 2-pole resonators mixed in under the string. Low mix — this is the
     difference between "warm" and "boomy". */
  const body = new Float32Array(total);
  for (let k = 0; k < 2; k++){
    const f0 = k ? 214 : 102, q = k ? 11 : 14, mix = k ? 0.32 : 0.5;
    const w = 2 * Math.PI * f0 / sr, r = Math.exp(-w / (2 * q));
    const a1 = 2 * r * Math.cos(w), a2 = -r * r, gg = (1 - r) * Math.sin(w);
    let y1 = 0, y2 = 0;
    for (let i = 0; i < total; i++){
      const y = gg * data[i] + a1 * y1 + a2 * y2;
      y2 = y1; y1 = y;
      body[i] += mix * y;
    }
  }
  /* Normalize to a known peak so PLUCK_VOICE_GAIN is the only thing deciding
     loudness — otherwise the body mix would make level depend on pitch. */
  let peak = 0;
  for (let i = 0; i < total; i++){
    data[i] = data[i] * 0.86 + body[i];
    const a = Math.abs(data[i]);
    if (a > peak) peak = a;
  }
  if (peak > 0){ for (let i = 0; i < total; i++) data[i] /= peak; }
  /* A low string is still at ~15% amplitude when the buffer ends; stopping
     there mid-waveform is an audible click. Ramp the last few ms to nothing. */
  const fade = Math.min(total, Math.floor(sr * 0.04));
  for (let i = 0; i < fade; i++){
    data[total - fade + i] *= 1 - i / fade;
  }
  return buffer;
}
/* Rendering a note is now ~5 passes over as much as 2s of audio, which is a
   visible hitch on a school Chromebook when a six-note chord lands. Cache the
   buffers — an AudioBuffer can back any number of sources. Two variants per
   pitch, alternated, so a repeated note isn't audibly identical each time;
   the cap keeps a long TAB from holding tens of MB (a 2s buffer is ~384KB). */
const PLUCK_CACHE_MAX = 24;
let pluckCache = new Map(), pluckVariant = 0;
function ksPluckCached(ctx, midi){
  const key = ctx.sampleRate + ':' + midi + ':' + (pluckVariant++ & 1);
  let buf = pluckCache.get(key);
  if (buf){                        // refresh recency: re-inserting moves it to the end
    pluckCache.delete(key);
  } else {
    buf = ksPluckBuffer(ctx, midi);
  }
  pluckCache.set(key, buf);
  while (pluckCache.size > PLUCK_CACHE_MAX) pluckCache.delete(pluckCache.keys().next().value);
  return buf;
}
/* Reusable single-note player. gain defaults to a single note's level; callers
   sounding several notes at once pass it down so the sum stays in headroom. */
function playNote(midi, gain, when){
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  const src = ctx.createBufferSource();
  src.buffer = ksPluckCached(ctx, midi);
  const g = ctx.createGain();
  g.gain.value = (gain == null) ? PLUCK_VOICE_GAIN : gain;
  src.connect(g);
  g.connect(getPluckBus());
  src.start(when || 0);   // optional audio-clock start time; 0 = now
}
/* Six notes struck together at full level peaked around 1.5 and clipped on the
   attack. Struck at once their peaks pile up, so split by √n; spread across a
   strum they barely overlap, and √n would leave the strum quieter than a
   single note. */
function chordGain(n, strummed){
  n = Math.max(1, n);
  return PLUCK_VOICE_GAIN / Math.pow(n, strummed ? 0.25 : 0.5);
}
/* Play one TAB beat: 1 midi = single note, N midis = chord, all at once. */
function playBeat(btnEl){
  if(window.coachMicLive) return;  // demo audio would score itself while the Coach listens
  let midis = [];
  try { midis = JSON.parse(btnEl.dataset.midis || '[]'); } catch (e) { return; }
  const g = chordGain(midis.length);
  midis.forEach(m => playNote(Number(m), g));
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
  erStopAll();
  killRingingPlucks();   // the timeouts above only stop notes that haven't sounded yet
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
      const list = Array.isArray(pitches) ? pitches : [pitches];
      const vg = chordGain(list.length);
      list.forEach(x => playNote(Number(x), vg));
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
    btnEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M9 5v14M15 5v14"/></svg> ' + escHtml(t('tools.stop'));
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
  return `<button type="button" class="coach-btn" data-midis="${escAttr(midisJson)}"${tabAttr}${coachSkillsAttr(skillIds)} onclick="coachOpen(this)" title="${escAttr(t('coach.btnTitle'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4M9 21h6"/></svg> <span data-i18n="coach.btn">${t('coach.btn')}</span></button>`;
}
/* Chord steps: build [{n:name, m:[midis]}] from the step's own diagram
   specs (same fret math as chordMidis — frets are absolute). */
function coachChordBtnRowHtml(chords, skillIds){
  const spec = (chords||[]).filter(c=>c && c.name && Array.isArray(c.chord)).map(c=>({
    n: tf(c,'name'),
    m: chordSpecMidis(c.chord)
  })).filter(c=>c.m.length);
  if(!spec.length) return '';
  return `<div class="coach-chord-row"><button type="button" class="coach-btn" data-chords="${escAttr(JSON.stringify(spec))}"${coachSkillsAttr(skillIds)} onclick="coachOpen(this)" title="${escAttr(t('coach.chordBtnTitle'))}" data-i18n-attr="title:coach.chordBtnTitle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4M9 21h6"/></svg> <span data-i18n="coach.btn">${t('coach.btn')}</span></button></div>`;
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
  // The closed drawer is only transform-hidden — its ~13 controls stay
  // tabbable and in the a11y tree at narrow widths without this.
  const railEl = document.getElementById('nav-rail');
  if(railEl && isNarrowLayout()) railEl.inert = !open;
}
function toggleRail(){ setRailOpen(!document.body.classList.contains('rail-open')); }
function closeRail(){ setRailOpen(false); }
// Stamp the closed state once at load — setRailOpen is the only writer of
// `inert`, so without this a narrow first paint keeps the transform-hidden
// drawer's ~13 controls tabbable until the drawer has been toggled once.
setRailOpen(false);
window.addEventListener('resize', () => {
  const railEl = document.getElementById('nav-rail');
  if(!isNarrowLayout()){
    closeRail();
    if(railEl) railEl.inert = false;
  } else if(railEl && !document.body.classList.contains('rail-open')){
    // Wide→narrow (window resize, tablet rotate): the drawer is closed but
    // was last stamped at a wide width, where setRailOpen skips the inert
    // write — stamp it now or its controls stay tabbable while hidden.
    railEl.inert = true;
  }
});
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
/* Where focus was before the video viewer opened, so clearPanel can put it
   back (see loadPanel). */
let viewerReturnFocus = null;
function loadPanel(type,url,title,subtitle){
  const overlay=document.getElementById('video-overlay');
  const content=document.getElementById('rp-content');
  const wrap=document.getElementById('rp-iframe-wrap');
  const meta=document.getElementById('rp-meta');
  const newtab=document.getElementById('rp-newtab');
  const close=document.getElementById('rp-close');
  overlay.hidden=false;
  /* Move focus into the player and remember where it came from. Without this a
     keyboard user activating a video link keeps focus behind the viewer and
     tabs through the rest of the step — quiz buttons, got-it checkboxes —
     before ever reaching Close. Focus the CONTAINER, not the close button, so
     the next Tab lands on "Open in new tab" and the whole dialog is reachable
     going forward. No focus trap: this player is deliberately non-modal (it's
     draggable and the page stays usable behind it), so Tab must be able to
     leave. */
  viewerReturnFocus = document.activeElement;
  const modal = overlay.querySelector('.video-modal');
  if(modal) modal.focus();
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
      // end= is embed-only and a soft stop — the player pauses there, but the student can still scrub past it
      const endMatch=url.match(/[?&]end=(\d+)/);
      embedUrl=`https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1${tMatch?`&start=${tMatch[1]}`:''}${endMatch?`&end=${endMatch[1]}`:''}`;
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
      wrap.innerHTML = `<div class="rp-chord-err" data-i18n="rp.noDiagram" data-i18n-params="${escAttr(JSON.stringify({note:note||''}))}">${escHtml(t('rp.noDiagram',{note:note||''}))}</div>`;
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
  /* Hand focus back to whatever opened the player. The document.contains guard
     matters: the trigger usually lives in step HTML that gets re-rendered on a
     language switch or a set change, so the element we saved may be detached —
     focusing it then would silently drop focus to <body>. */
  if(viewerReturnFocus && document.contains(viewerReturnFocus)) viewerReturnFocus.focus();
  viewerReturnFocus = null;
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

/* "Keep going" footer for each set tab-panel: the bottom of a long ladder
   used to be a dead end — you had to scroll back up to continue. */
function panelFooter(w, tab){
  const btn = (labelHtml, onclick) =>
    `<button type="button" class="panel-next-btn" onclick="${onclick}">${labelHtml} &rarr;</button>`;
  const span = key => `<span data-i18n="${key}">${escHtml(t(key))}</span>`;
  let inner = '';
  if(tab === LESSON_TAB){
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

/* Switch a set's panel from anywhere — the rail, the footer buttons, skill
   jumps, search deep links. The single entry point since the hidden tab bar
   was removed; the rail reads the active state back off .tab-panel.active. */
function switchTabById(wid, tab, keepScroll){
  const panel = document.getElementById(`${wid}-${tab}`);
  const wrap = panel && panel.closest('.week-panel');
  if(!wrap) return;
  // Same reasoning as activateSet(): the panel we're leaving might be hiding a
  // still-running inline Coach check — close it so its mic doesn't keep running
  // unseen. Ditto a Shuffle Drill, whose interval survives display:none.
  if(typeof coachClose === 'function') coachClose();
  if(typeof shuffleDrills === 'object' && typeof sdStop === 'function'){
    Object.keys(shuffleDrills).forEach(k=>sdStop(k));
  }
  wrap.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  panel.classList.add('active');
  if(typeof syncRailStations === 'function') syncRailStations();   // mirror onto the rail
  /* Scroll the panel we just opened to the top. This used to target the tab
     bar and fall back to the panel — but the bar was display:none, so
     scrollIntoView() silently did nothing and "Next: My skills checklist" at
     the bottom of a long ladder left the student stranded at the bottom. */
  if(!keepScroll) panel.scrollIntoView({ block: 'start', behavior: scrollBehavior() });
}

/* Does any step in this set teach set-skill number n (and if so, in which
   half of the ladder)? Steps tag themselves with skills:[n] in the module
   data. The letter is now only used as a "yes, it's taught here" answer —
   both halves render into the same panel. */
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

/* Checklist "Show me where": switch to the lesson ladder, expand the sections
   holding the skill's steps, scroll there and flash them. */
function showSkillLesson(wid, n){
  const w = SETS.find(x => x.id === wid);
  if(!w) return;
  if(!skillTaughtStation(w, Number(n))) return;
  switchTabById(wid, LESSON_TAB, true);
  const panel = document.getElementById(`${wid}-${LESSON_TAB}`);
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
  matches[0].scrollIntoView({ block: 'center', behavior: scrollBehavior() });
}

/* Deep-link to one step (used by search results): activate module + set,
   open the lesson ladder, scroll + flash the step. Addressed by the section's
   STORAGE namespace (`b-sec3`, `c-sec0`, or a bare `b` for a section-less
   station), never by DOM position: the ladder now runs both stations' sections
   through one panel, so position no longer identifies a section. */
async function jumpToStep(moduleNum, wid, station, secIdx, stepIdx){
  if(await gatedJumpGuard(moduleNum, wid)) return;
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(moduleNum);
  await onModuleChange(moduleNum, wid);
  saveProgress();
  switchTabById(wid, LESSON_TAB, true);
  const panel = document.getElementById(`${wid}-${LESSON_TAB}`);
  if(!panel) return;
  const sec = panel.querySelector(`.stp-sec[data-ns="${station}-sec${secIdx}"]`)
           || panel.querySelector(`.stp-sec[data-ns="${station}"]`);
  const li = sec ? sec.querySelectorAll('li.step')[stepIdx] : null;
  if(li){
    expandStepEl(li);
    flashClass(li, 'step-flash', 2600);
    li.scrollIntoView({ block: 'center', behavior: scrollBehavior() });
  }
}

/* ── Scroll pane ──
   The reading column is its own scroll container (.main / #main-content, see
   "Two panes, two scrollbars" in styles.css), so window.scrollTo no longer
   moves the lesson — the document itself never scrolls while the app shell is
   up. Everything that used to scroll "the page" goes through here instead.
   Falls back to the window for the teacher dashboard and the auth wall, which
   live outside the locked shell and still scroll normally. */
function scrollPane(){
  const m = document.getElementById('main-content');
  return (m && m.scrollHeight > m.clientHeight) ? m : window;
}
function scrollPaneTop(smooth){
  scrollPane().scrollTo({ top:0, behavior: smooth ? 'smooth' : 'auto' });
}
/* Where the reading pane is right now — window has scrollY, .main scrollTop. */
function paneScrollTop(){
  const p = scrollPane();
  return (p === window) ? window.scrollY : p.scrollTop;
}

/* ── Back to top ── */
function initBackToTop(){
  const btn = document.getElementById('back-to-top');
  if(!btn) return;
  const main = document.getElementById('main-content');
  const onScroll = () => {
    const y = main ? main.scrollTop : window.scrollY;
    btn.classList.toggle('show', y > 600);
  };
  /* capture:true — the scroll events that matter now fire on .main, and
     scroll doesn't bubble, so a listener bound to window only sees them on
     the way down. */
  window.addEventListener('scroll', onScroll, { passive: true, capture: true });
}
initBackToTop();

/* ── Top-bar panels (Songs hub · Search) — one open at a time, and they
      close Games too so the top of the page stays tidy. (The Daily 5 is a
      popup opened from the lesson ladder now, not a top-bar panel.) ── */
function closeTopPanels(except){
  /* Hash-based full pages close through their own close fns (which clear
     the URL hash); plain drop-over panels just get hidden. */
  const SCREEN_IDS = { games: 'games-screen', 'songs-hub': 'songs-screen', 'keep-practicing': 'keep-practicing-screen', 'daily-review': 'sr-screen', 'my-progress': 'my-progress-screen', 'class-activities': 'class-activities-screen', 'live-quiz': 'live-quiz-screen' };
  ['games', 'songs-hub', 'search', 'keep-practicing', 'daily-review', 'my-progress', 'class-activities', 'live-quiz'].forEach(k => {
    if(k === except) return;
    const p = document.getElementById(SCREEN_IDS[k] || k + '-panel');
    if(p && !p.hasAttribute('hidden')){
      if(k === 'games' && typeof closeGamesScreen === 'function'){ closeGamesScreen(); return; }
      if(k === 'songs-hub'){ closeSongsScreen(); return; }
      if(k === 'keep-practicing'){ closeKeepPracticingScreen(); return; }
      if(k === 'daily-review'){ closeDailyReviewScreen(); return; }
      if(k === 'my-progress'){ closeMyProgressScreen(); return; }
      if(k === 'class-activities'){ closeClassActivitiesScreen(); return; }
      if(k === 'live-quiz' && typeof closeLiveQuizScreen === 'function'){ closeLiveQuizScreen(); return; }
      if(k === 'search'){ closeSearchPanel(); return; }
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
  const covering = ['games-screen', 'search-panel', 'songs-screen', 'keep-practicing-screen', 'sr-screen', 'my-progress-screen', 'class-activities-screen', 'live-quiz-screen']
    .some(id => { const el = document.getElementById(id); return el && !el.hasAttribute('hidden'); });
  if(!covering) return;
  practiceScrollTop = 0;   // the async popstate below would otherwise restore the OLD set's scroll offset after activateSet scrolls to top
  closeTopPanels('');
  scrollPaneTop(true);
}

/* Load every module's data (not its panels) — the Songs hub and search
   need the whole catalogue. Modules are small and the SW precaches them.
   Resolves true only when EVERY module actually loaded — Daily Review uses
   that to avoid persisting a picks snapshot computed from a partial
   catalogue (a script that 404'd on flaky wifi). Other callers ignore it. */
function ensureAllModuleData(){
  return Promise.all(MODULE_MANIFEST.map(m => loadModuleData(m.num).then(() => true).catch(() => false)))
    .then(flags => flags.every(Boolean));
}

/* ── ♪ Songs hub: every song on the site, deduped, core six first ──
   An explore page in the main column (#songs), like its three rail
   neighbours — see EXPLORE_PAGES. */
function toggleSongsHub(){
  const screen = document.getElementById('songs-screen');
  if(!screen) return;
  if(screen.hasAttribute('hidden')) goExploreHash('songs');
  else closeSongsScreen();
}
function closeSongsScreen(){
  if(location.hash === '#songs'){ exitExploreHash(); return; }  // the router finishes the job
  songsClosePanel();
}
function songsClosePanel(){
  const screen = document.getElementById('songs-screen');
  const wasOpen = screen && !screen.hasAttribute('hidden');
  if(screen) screen.setAttribute('hidden', '');
  const btn = document.getElementById('songs-hub-btn');
  if(btn && wasOpen) btn.focus();   // return focus to where the page was opened
  syncExploreNav();
}
function openSongsScreen(){
  const screen = document.getElementById('songs-screen');
  if(!screen || !screen.hasAttribute('hidden')) return;
  closeTopPanels('songs-hub');
  screen.removeAttribute('hidden');
  syncExploreNav();
  const exit = screen.querySelector('.page-exit');
  if(exit) exit.focus();
  renderSongsHub();
}
async function renderSongsHub(){
  const p = document.getElementById('songs-screen-body');
  if(!p) return;
  p.innerHTML = `<div class="coach-tip">${t('hub.loading')}</div>`;
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
    if(sg.journeyUrl) vids.push(`<button class="song-vid-btn journey" onclick="songsHubVid(${idx},'journey')" title="${escAttr(t('songs.oneSongLayers'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M5 8c0 6 14 2 14 8"/></svg> ${t('songs.songJourney')}</button>`);
    if(sg.tutorialUrl) vids.push(`<button class="song-vid-btn tut" onclick="songsHubVid(${idx},'tutorial')"><span class="svb-play">&#x25B6;</span>${t('songs.tutorial')}</button>`);
    if(sg.backingUrl) vids.push(`<button class="song-vid-btn" onclick="songsHubVid(${idx},'backing')"><span class="svb-play">&#x25B6;</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> ${t('hub.backing')}${sg.backingKey ? ` (${escHtml(sg.backingKey)})` : ''}</button>`);
    if(sg.originalUrl) vids.push(`<button class="song-vid-btn" onclick="songsHubVid(${idx},'original')" title="${escAttr(t('songs.opensYoutube'))}"><span class="svb-play">&#x25B6;</span>${t('songs.original')} <span style="font-size:0.6875rem;opacity:0.6">&#x2197;</span></button>`);
    // The six pinned rows sit directly under the "Core songs" section header,
    // where the tag would just repeat it — suppress there only; Focus songs
    // (core:true, type:'Focus') still show their tag inside the choice groups.
    const tagHtml = isCoreSix(e) ? '' : `<span class="stag ${sg.core ? 'stag-core' : ''}">${escHtml(songTypeLabel(sg.type, sg.core))}</span>`;
    return `<div class="song-row"><div class="dot ${sg.core ? 'dc' : 'dch'}"></div>
      <div class="song-name-col"><div class="sname">${escHtml(sg.name)}</div>${sg.meta ? `<div class="smeta">${escHtml(tf(sg, 'meta'))}</div>` : ''}</div>
      ${vids.length ? `<div class="song-vids">${vids.join('')}</div>` : ''}
      ${tagHtml}</div>`;
  };
  const renderRows = list => list.map(row).join('');
  const coreHtml = `<div class="sh-sec-title">${t('hub.coreTitle')}</div><div class="card">${renderRows(coreEntries)}</div>`;
  const groupsHtml = `<div class="sh-sec-title">${t('hub.choiceTitle')}</div>` + groups.map((g, gi) =>
    `<div class="sh-group${gi === 0 ? ' open' : ''}"><button type="button" class="sh-group-head" aria-expanded="${gi === 0}" onclick="toggleHubGroup(this)"><span>${g.title}</span><span class="sh-group-sub">${g.sub}</span><span class="sh-group-count">${t('hub.groupCount', {n: g.entries.length})}</span></button><div class="sh-group-body">${renderRows(g.entries)}</div></div>`).join('');
  const requestHtml = requestEntries.length ? `<div class="card">${renderRows(requestEntries)}</div>` : '';
  p.innerHTML = `<div class="legend"><div class="leg"><div class="dot dc" style="margin-top:0"></div>${t('hub.legendCore')}</div><div class="leg"><div class="dot dch" style="margin-top:0"></div>${t('hub.legendChoice')}</div></div>
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

/* Fold case AND accents, so a student typing "cancion", "pentatonica" or
   "MI GRAVE" finds "canción", "pentatónica" and "Mi grave". Half the site is
   in Spanish and nobody reaches for the accent key on a Chromebook.
   Length-preserving on purpose — the highlighter maps folded match offsets
   straight back onto the raw text, so one character in must be one character
   out. Anything that would change length (İ, emoji) is left alone. */
const _foldCharCache = new Map();
function foldChar(ch){
  let v = _foldCharCache.get(ch);
  if(v === undefined){
    const lo = ch.toLowerCase();
    if(lo.length !== ch.length) v = ch;
    else {
      const n = lo.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      v = n.length === ch.length ? n : lo;
    }
    _foldCharCache.set(ch, v);
  }
  return v;
}
function searchFold(s){
  let out = '';
  const str = s || '';
  for(let i = 0; i < str.length; i++) out += foldChar(str[i]);
  return out;
}
/* Does `term` start a word in `hay`? A hit at a word boundary is what the
   student meant; one buried mid-word ("am" inside "frame") usually isn't. */
function foldWordStart(hay, term){
  let i = hay.indexOf(term);
  while(i !== -1){
    if(i === 0 || !/[a-z0-9]/.test(hay[i - 1])) return true;
    i = hay.indexOf(term, i + 1);
  }
  return false;
}
/* Every entry carries `hay` (everything worth matching, folded) and `title`
   (the name-ish part, for ranking). `text` stays the display string. */
// A query typed in either language has to match regardless of which
// language the UI is currently showing, so hay always folds in BOTH the
// English and Spanish variant of a field — not just the one tf() would
// display. bothLangs() is the hay-only counterpart to tf()'s display pick.
function bothLangs(obj, field){
  if(!obj) return '';
  return [obj[field], obj[field + '_es']].filter(Boolean).join(' ');
}
function searchEntry(e){
  const mod = (typeof MODULE_MANIFEST !== 'undefined' && MODULE_MANIFEST.find(m => m.num === e.moduleNum)) || null;
  const modName = mod ? bothLangs(mod, 'name') : '';
  e.title = e.title || '';
  e.fTitle = searchFold(e.title);
  e.hay = searchFold([e.text, e.hayExtra, e.title, e.label, e.secTitle, modName, 'module ' + e.moduleNum, 'módulo ' + e.moduleNum].filter(Boolean).join(' '));
  return e;
}

let searchIndex = null;
async function buildSearchIndex(){
  await ensureAllModuleData();
  const ix = [];
  SETS.forEach(w => {
    if(w.comingSoon) return;
    // tf() picks the _es twin when the student is in Spanish mode (falling
    // back to English where no twin exists yet) — without it, Spanish-mode
    // search only ever matched English-only indexed text. hayExtra carries
    // the OTHER language's raw text so a query matches either language
    // regardless of which one tf() is currently displaying.
    if(w.unit) ix.push(searchEntry({ kind: 'set', moduleNum: w.moduleNum, wid: w.id, label: w.label, title: [w.label, tf(w, 'unit')].filter(Boolean).join(' '), text: tf(w, 'unit'), hayExtra: bothLangs(w, 'unit') }));
    (w.skills || []).forEach(sk => {
      const num = (sk.id.match(/-s(\d+)$/) || [])[1];
      ix.push(searchEntry({ kind: 'skill', moduleNum: w.moduleNum, wid: w.id, label: w.label, title: tf(sk, 'text'), text: tf(sk, 'text'), skillNum: num ? Number(num) : null, hayExtra: bothLangs(sk, 'text') }));
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
        const hayExtra = [stripTags(step.text_es || ''), stripTags(step.label_es || ''), sec.title_es || ''].filter(Boolean).join(' ');
        // secTitle is the always-English title (it feeds `hay`, which must
        // match English queries in either language); secLabel is what the
        // result line SHOWS, so it goes through tf(). The index is thrown away
        // and rebuilt on gc-langchange, so a stale language can't stick.
        if(text) ix.push(searchEntry({ kind: 'step', moduleNum: w.moduleNum, wid: w.id, label: w.label, station: st, secIdx, stepIdx, secTitle: sec.title || '', secLabel: tf(sec, 'title') || '', title: stripTags(tf(step, 'label') || '') || (sec.title || ''), text, hayExtra }));
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
    const hayExtra = [bothLangs(song, 'meta'), bothLangs(song, 'name')].filter(Boolean).join(' ');
    const entry = searchEntry({ kind: 'song', moduleNum, wid, title: song.name, text: song.name + (metaTextShown ? ' ' + metaTextShown : ''), chords: [...chords], hayExtra });
    songSeen.set(song.name, entry);
    ix.push(entry);
  };
  SETS.forEach(w => { if(w.moduleNum === 1 && w.songs) w.songs.forEach(sg => indexSong(sg, 1, w.id)); });
  const MS2 = globalThis.MODULE_SONGS || {};
  Object.keys(MS2).forEach(m => (MS2[m] || []).forEach(sg => indexSong(sg, Number(m), null)));
  return ix;
}
/* The search panel is routed like the explore pages (#search), so the phone's
   Back gesture closes it instead of leaving the site. toggleSearch stays the
   name the header button and the panel's ✕ call. */
function toggleSearch(){
  const p = document.getElementById('search-panel');
  if(!p) return;
  if(p.hasAttribute('hidden')) goExploreHash('search');
  else closeSearchPanel();
}
function closeSearchPanel(){
  if(location.hash === '#search'){ exitExploreHash(); return; }  // the router finishes the job
  searchClosePanel();
}
function searchClosePanel(){
  const p = document.getElementById('search-panel');
  if(!p || p.hasAttribute('hidden')) return;
  p.setAttribute('hidden', '');
  const btn = document.getElementById('search-btn');
  if(btn){ btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
}
async function openSearchPanel(){
  const p = document.getElementById('search-panel');
  const btn = document.getElementById('search-btn');
  if(!p || !p.hasAttribute('hidden')) return;
  closeTopPanels('search');
  p.removeAttribute('hidden');
  if(btn) btn.setAttribute('aria-expanded', 'true');
  p.innerHTML = `<div class="daily5-head"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.7-4.7"/></svg> <span data-i18n="search.title">${escHtml(t('search.title'))}</span></span><button type="button" class="tp-close" onclick="toggleSearch()" aria-label="${escAttr(t('search.closeAria'))}" data-i18n-attr="aria-label:search.closeAria">&#x2715;</button></div>
    <input type="search" class="search-input" id="search-input" placeholder="${escAttr(t('search.placeholder'))}" oninput="onSearchInput(this.value)" onkeydown="if(event.key==='Escape'){event.preventDefault();closeSearchPanel();}" aria-label="${escAttr(t('search.ariaLabel'))}" data-i18n-attr="placeholder:search.placeholder;aria-label:search.ariaLabel">
    <div id="search-results" class="search-results" aria-live="polite"><div class="coach-tip" data-i18n="search.gettingReady">${escHtml(t('search.gettingReady'))}</div></div>`;
  const input = document.getElementById('search-input');
  if(input) input.focus();
  if(!searchIndex) searchIndex = await buildSearchIndex();
  const res = document.getElementById('search-results');
  // The student may have already typed a query while the index was still
  // loading (a real wait on slow Wi-Fi/Chromebooks, since this fetches every
  // not-yet-loaded module file) — onSearchInput's runSearch bailed out with
  // no index and never retried, so re-run their query now instead of
  // clobbering it with the generic intro tip.
  const liveQuery = document.getElementById('search-input');
  if(liveQuery && liveQuery.value.trim().length >= 2) runSearch(liveQuery.value);
  else if(res && res.querySelector('.coach-tip')) res.innerHTML = `<div class="coach-tip" data-i18n="search.intro" data-i18n-params="${escAttr(JSON.stringify({n:MODULE_MANIFEST.length}))}">${escHtml(t('search.intro',{n:MODULE_MANIFEST.length}))}</div>`;
}

/* Typing on a Chromebook fires oninput per keystroke; re-scanning the whole
   index on each one made the box feel sticky. One pass per pause instead. */
let _searchTimer = null;
function onSearchInput(v){
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(() => runSearch(v), 120);
}

/* Wrap every matched term in the snippet. Offsets come from the folded copy,
   which is length-preserving (see foldChar), so they map straight back onto
   the raw text and the accents survive in what the student reads. */
function searchHighlight(raw, terms){
  const f = searchFold(raw);
  const ranges = [];
  terms.forEach(term => {
    if(term.length < 2) return;
    let i = f.indexOf(term);
    while(i !== -1){ ranges.push([i, i + term.length]); i = f.indexOf(term, i + term.length); }
  });
  if(!ranges.length) return escHtml(raw);
  ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  // Merge overlapping/touching runs so "chord" inside "chord chart" doesn't
  // come out as two <mark>s with a seam down the middle.
  const merged = [];
  for(const r of ranges){
    const last = merged[merged.length - 1];
    if(last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }
  let out = '', at = 0;
  for(const [s, e] of merged){
    out += escHtml(raw.slice(at, s)) + '<mark class="search-mark">' + escHtml(raw.slice(s, e)) + '</mark>';
    at = e;
  }
  return out + escHtml(raw.slice(at));
}

function runSearch(q){
  const res = document.getElementById('search-results');
  if(!res || !searchIndex) return;
  const rawQ = (q || '').trim();
  q = searchFold(rawQ);
  if(q.length < 2){ res.innerHTML = `<div class="coach-tip">${escHtml(t('search.typeMore'))}</div>`; return; }
  // Commas are how people actually write a chord list ("g, c, d").
  const terms = q.split(/[\s,]+/).filter(Boolean);
  /* "G C D" — a list of known chord names — asks "what can I play with just
     these shapes?" rather than a text search. Match songs whose whole indexed
     chord set is covered by the chords the student named (knowing G, C, D
     gets you a song that uses G and C, but not one that also needs Em). Needs
     2+ terms so an ordinary word that happens to share a chord's spelling
     (e.g. "am") doesn't get hijacked. */
  const isChordQuery = terms.length >= 2 && terms.every(t => CHORD_NAME_LOOKUP.has(t));
  let scored = [];
  let loose = false;
  if(isChordQuery){
    const known = new Set(terms.map(t => CHORD_NAME_LOOKUP.get(t)));
    for(const e of searchIndex){
      if(e.kind !== 'song' || !e.chords || !e.chords.length) continue;
      if(!e.chords.every(c => known.has(c))) continue;
      scored.push({ e, score: e.chords.length });
    }
  } else {
    /* Rank rather than take-the-first-400: the old loop broke out of the scan
       as soon as it had 400 hits, so a common word like "chord" never reached
       the later modules at all. The index is a few thousand short strings —
       scanning all of it costs under a millisecond. */
    const KIND_BONUS = { song: 3, skill: 2, set: 2, step: 0 };
    const rank = (e, needAll) => {
      const hay = e.hay, ttl = e.fTitle;
      const hits = terms.filter(t => hay.includes(t)).length;
      if(needAll ? hits < terms.length : hits === 0) return -1;
      let s = hits * 2;
      if(ttl === q) s += 14;                                  // the student typed the name
      else if(ttl.startsWith(q)) s += 8;
      else if(ttl.includes(q)) s += 5;
      if(hay.includes(q)) s += 3;                             // all terms together, in order
      if(terms.every(t => foldWordStart(ttl, t))) s += 3;
      else if(terms.every(t => foldWordStart(hay, t))) s += 2; // whole words beat mid-word
      s += KIND_BONUS[e.kind] || 0;
      return s;
    };
    for(const e of searchIndex){
      const s = rank(e, true);
      if(s >= 0) scored.push({ e, score: s });
    }
    /* Nothing matched every word — usually one extra or misspelt word in an
       otherwise fine query. Show the best partial matches instead of a dead
       end, and say that's what they are. */
    if(!scored.length && terms.length > 1){
      loose = true;
      for(const e of searchIndex){
        const s = rank(e, false);
        if(s >= 0) scored.push({ e, score: s });
      }
    }
  }
  scored.sort((a, b) => b.score - a.score || a.e.moduleNum - b.e.moduleNum || a.e.kind.localeCompare(b.e.kind));
  const LIMIT = 25;
  const total = scored.length;
  const top = scored.slice(0, LIMIT);
  if(!top.length){
    res.innerHTML = isChordQuery
      ? `<div class="coach-tip">${escHtml(t('search.noChordSongs',{chords:terms.join(', ').toUpperCase()}))}</div>`
      : `<div class="coach-tip">${escHtml(t('search.noMatches',{q:rawQ}))}</div>`;
    return;
  }
  const snippet = (text) => {
    const f = searchFold(text);
    // Centre on the FIRST term that actually appears, not blindly on terms[0].
    let at = -1;
    for(const term of terms){ const i = f.indexOf(term); if(i !== -1 && (at === -1 || i < at)) at = i; }
    const start = Math.max(0, at - 30);
    let cut = text.slice(start, start + 110);
    let html = searchHighlight(cut, terms);
    if(start > 0) html = '…' + html;
    if(start + 110 < text.length) html += '…';
    return html;
  };
  const head = loose
    ? `<div class="search-count search-loose">${escHtml(t('search.loose',{q:rawQ}))}</div>`
    : `<div class="search-count">${escHtml(total > LIMIT ? t('search.countCapped',{shown:LIMIT, n:total}) : t('search.count',{n:total}))}</div>`;
  res.innerHTML = head + top.map(({e}) => {
    const where = e.kind === 'song'
      ? t('search.whereSong', {n:e.moduleNum})
      : t('search.whereSet', {n:e.moduleNum, label:escHtml(e.label || '')}) +
        (e.kind === 'step' && e.secLabel ? t('search.whereSection', {section:escHtml(e.secLabel)}) : e.kind === 'skill' ? t('search.whereSkill') : '');
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
  gateToast(isModuleGateCase(w)
    ? t('gate.unlocksAfterModule', { set: tSetLabel(w.label), ...prevModuleGateParams(w) })
    : t('gate.unlocksAfter', { set: tSetLabel(w.label), prev: tSetLabel(prevSetLabel(w)) }));
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
  if(screen.hasAttribute('hidden')) goExploreHash('keep-practicing');
  else closeKeepPracticingScreen();
}
function openKeepPracticingScreen(){
  const screen = document.getElementById('keep-practicing-screen');
  if(!screen || !screen.hasAttribute('hidden')) return;
  closeTopPanels('keep-practicing');
  screen.removeAttribute('hidden');
  syncExploreNav();
  /* Focus follows into the page; kpClosePanel hands it back to the button. */
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
  if(location.hash === '#keep-practicing'){ exitExploreHash(); return; }  // the router finishes the job
  kpClosePanel();
}
function kpClosePanel(){
  const screen = document.getElementById('keep-practicing-screen');
  const wasOpen = screen && !screen.hasAttribute('hidden');
  if(screen) screen.setAttribute('hidden', '');
  const btn = document.getElementById('keep-practicing-btn');
  if(btn && wasOpen) btn.focus();   // return focus to where the page was opened
  syncExploreNav();
}

/* ── 🗓️ Daily Review (spaced review): its own full-screen page — #daily-review
   in the URL, same pattern as Keep practicing above. Four already-earned
   skills (progress==='gotit'), preferring ones outside the module the
   student is currently in (those are already in rotation) and weighted
   toward whichever has gone longest without a rep. This is the retention
   fix for "learned it in Module 3, lost it by Module 9" — deliberately
   named "Daily Review", not "warm-up" (WARMUP_BANK/daily5.* already own
   that word for the Daily 5 finger-gym). */
function srCandidates(){
  const all = [];
  SETS.forEach(w => (w.skills || []).forEach(s => {
    if(!s.practice || progress[s.id] !== 'gotit') return;
    const e = practiceLog[s.id];
    all.push({ sid: s.id, moduleNum: w.moduleNum, last: (e && e.last) || 0 });
  }));
  const outside = all.filter(c => c.moduleNum !== lastModuleNum);
  const pool = outside.length >= 4 ? outside : all;
  return pool.sort((a, b) => a.last - b.last).slice(0, 4).map(c => c.sid);
}
// Reads today's already-stored snapshot without computing a new one — safe
// to call before every module is loaded into SETS (srCandidates() needs the
// full catalogue to know what's "outside the current module"). Returns []
// when nothing's stored yet for today; the snapshot is only ever first
// computed by srLoadTodayIds(), from renderDailyReview(), which awaits
// ensureAllModuleData() first. Stale ids (module IS loaded, skill gone —
// content changed under the snapshot) are dropped; ids from modules not yet
// in SETS are kept — daysSinceLastRep reads practiceLog, which doesn't need
// the module file, and dropping them would let srCheckComplete's no-arg
// path judge "all reviewed" against just the loaded subset and burn the
// once-a-day bonus early.
function srStoredTodayIds(){
  const today = dayStr(new Date());
  let stored = null;
  try{ stored = JSON.parse(localStorage.getItem(_uidKey('gc-srPicks'))); }catch(e){}
  if(!(stored && stored.day === today && Array.isArray(stored.ids))) return [];
  const loaded = new Set(SETS.map(w => w.moduleNum));
  return stored.ids.filter(sid => {
    if(skillById(sid)) return true;
    const m = /^m(\d+)/.exec(sid);
    return !!m && !loaded.has(+m[1]);
  });
}
// Today's picks are stable all day (no reshuffling as they're completed) —
// stashed per-student in localStorage, keyed on the calendar day so a new
// day naturally recomputes. Ids that no longer resolve to a skill (content
// changed under a stale snapshot) are dropped, not replaced mid-day. A short
// snapshot (fewer than 4 — the student hadn't earned enough skills when the
// page was first opened today) does top up from fresh candidates, otherwise
// day 1 would freeze "Nothing to review yet" until midnight no matter how
// many skills were earned that afternoon; already-stored picks stay put, and
// a page already completed today (bonus banked) stops growing. Only call
// this after ensureAllModuleData() — srCandidates() reads SETS directly,
// which otherwise may hold just the student's current module. canPersist:
// false skips the localStorage write — used when a module file failed to
// load, so a picks list computed from a partial catalogue can't get locked
// in for the day (same poisoning class the logPracticeRep path guards).
function srLoadTodayIds(canPersist){
  const today = dayStr(new Date());
  let stored = null;
  try{ stored = JSON.parse(localStorage.getItem(_uidKey('gc-srPicks'))); }catch(e){}
  let ids = (stored && stored.day === today && Array.isArray(stored.ids))
    ? stored.ids.filter(sid => skillById(sid))
    : null;
  if(ids === null || (ids.length < 4 && games.srBonusDay !== today)){
    const have = new Set(ids || []);
    const fresh = srCandidates().filter(sid => !have.has(sid));
    ids = (ids || []).concat(fresh).slice(0, 4);
  }
  if(canPersist !== false){
    try{ localStorage.setItem(_uidKey('gc-srPicks'), JSON.stringify({ day: today, ids })); }catch(e){}
  }
  return ids;
}
function srSkillWith(sid){
  for(const w of (SETS || [])){
    const hit = (w.skills || []).find(x => x.id === sid);
    if(hit) return { s: hit, w };
  }
  return null;
}
function srDaysLabel(sid){
  const d = daysSinceLastRep(sid);
  if(d < 0) return { key:'sr.neverSince', params:null };
  // n === 1 gets its own key — "1 days ago" / "hace 1 días" reads broken in
  // both languages (same singular split as rep.lastYesterday).
  return d === 1 ? { key:'sr.daysAgo1', params:null } : { key:'sr.daysAgo', params:{n:d} };
}
// All 4 picks reviewed today → +10 XP into the arcade meta-layer, once per
// day. Called both after every logged rep and on every Daily Review page
// open/render, so the bonus lands whether or not the student is looking at
// the page when they finish the fourth one. Without an explicit `ids` (the
// logPracticeRep path — any rep, anywhere on the site, not just Daily
// Review), this must NOT be the thing that first computes today's snapshot:
// srCandidates() needs every module loaded into SETS to know what's outside
// the student's current one, and logPracticeRep never awaits that. Reading
// only what's already stored means a rep logged before the student has ever
// opened Daily Review today is simply a no-op here — the snapshot gets
// created correctly, once, from renderDailyReview()'s awaited call instead.
function srCheckComplete(ids){
  // Same guard as bumpPracticeStreak/awardArcadeXp — the dev-bypass uid is
  // rejected by the Firestore rules, so skip the write (and the XP) rather
  // than let queueSave retry a doomed save.
  if(!currentUser || (typeof isDevBypassUser === 'function' && isDevBypassUser())) return;
  ids = ids || srStoredTodayIds();
  if(!ids.length || !ids.every(sid => daysSinceLastRep(sid) === 0)) return;
  const today = dayStr(new Date());
  if(games.srBonusDay === today) return;
  // Don't burn the once-a-day flag unless the XP can actually land — if
  // coach.js failed to load, leave it unclaimed so a later render retries.
  if(typeof awardArcadeXp !== 'function') return;
  games.srBonusDay = today;
  saveGames();
  awardArcadeXp(false);
}
function srRefreshIfOpen(){
  const screen = document.getElementById('sr-screen');
  if(screen && !screen.hasAttribute('hidden') && typeof renderDailyReview === 'function') renderDailyReview();
}
// Closes the full-screen page first — reviewJump scrolls/flashes a row
// underneath it, which the student can't see while the page still covers it.
function srPracticeThis(sid, wid){
  // Closing goes through exitExploreHash → an async popstate that restores
  // practiceScrollTop (stashed when this page opened) — which would land on
  // top of reviewJump's scrollIntoView. Same race leaveTopPanelForSet
  // defends against, same fix: the jump owns the scroll now.
  practiceScrollTop = 0;
  closeDailyReviewScreen();
  reviewJump(sid, wid);
}
function toggleDailyReview(){
  const screen = document.getElementById('sr-screen');
  if(!screen) return;
  if(screen.hasAttribute('hidden')) goExploreHash('daily-review');
  else closeDailyReviewScreen();
}
function openDailyReviewScreen(){
  const screen = document.getElementById('sr-screen');
  if(!screen || !screen.hasAttribute('hidden')) return;
  closeTopPanels('daily-review');
  screen.removeAttribute('hidden');
  syncExploreNav();
  const exit = screen.querySelector('.page-exit');
  if(exit) exit.focus();
  renderDailyReview();
}
async function renderDailyReview(){
  const bodyEl = document.getElementById('sr-screen-body');
  if(!bodyEl) return;
  bodyEl.innerHTML = `<div class="coach-tip">${t('kp.loading')}</div>`;
  const catalogueComplete = await ensureAllModuleData();
  const ids = srLoadTodayIds(catalogueComplete);
  srCheckComplete(ids);
  if(!ids.length){
    bodyEl.innerHTML = `<div class="coach-tip" data-i18n="sr.empty">${t('sr.empty')}</div>`;
    return;
  }
  const picks = ids.map(srSkillWith).filter(Boolean);
  const doneCount = picks.filter(p => daysSinceLastRep(p.s.id) === 0).length;
  const allDone = doneCount >= picks.length;
  const progressParams = { done: doneCount, total: picks.length };
  const rows = picks.map(p => {
    const doneToday = daysSinceLastRep(p.s.id) === 0;
    const m = MODULE_MANIFEST.find(x => x.num === p.w.moduleNum);
    const modLabel = `${t('nav.module')} ${p.w.moduleNum}${m ? ` — ${escHtml(tf(m,'name'))}` : ''} &middot; ${escHtml(tSetLabel(p.w.label))}`;
    // The recency chip is redundant with the "Reviewed today" badge once a
    // pick is done — omit it there rather than show "0 days ago".
    const last = srDaysLabel(p.s.id);
    const whenHtml = doneToday ? '' : `<span class="sr-card-when" data-i18n="${last.key}"${last.params ? ` data-i18n-params='${escAttr(JSON.stringify(last.params))}'` : ''}>${t(last.key, last.params)}</span>`;
    return `<div class="sr-card${doneToday ? ' sr-done' : ''}">
      <div class="sr-card-main">
        <div class="sr-card-text">${tf(p.s,'text')}</div>
        <div class="sr-card-meta">
          <span class="sr-card-mod">${modLabel}</span>
          ${whenHtml}
        </div>
      </div>
      ${doneToday
        ? `<span class="sr-card-check" data-i18n="sr.doneToday">${t('sr.doneToday')}</span>`
        : `<button type="button" class="sr-go-btn" onclick="srPracticeThis('${p.s.id}','${p.w.id}')" data-i18n="sr.go">${t('sr.go')}</button>`}
    </div>`;
  }).join('');
  bodyEl.innerHTML =
    `<div class="sr-tagline" data-i18n="sr.tagline">${t('sr.tagline')}</div>
    <div class="sr-progress" data-i18n="sr.progress" data-i18n-params='${escAttr(JSON.stringify(progressParams))}'>${t('sr.progress', progressParams)}</div>
    ${allDone ? `<div class="sr-alldone" data-i18n="sr.allDone">${t('sr.allDone')}</div>` : ''}
    <div class="sr-cards">${rows}</div>`;
}
function closeDailyReviewScreen(){
  if(location.hash === '#daily-review'){ exitExploreHash(); return; }  // the router finishes the job
  srClosePanel();
}
function srClosePanel(){
  const screen = document.getElementById('sr-screen');
  const wasOpen = screen && !screen.hasAttribute('hidden');
  if(screen) screen.setAttribute('hidden', '');
  const btn = document.getElementById('sr-btn');
  if(btn && wasOpen) btn.focus();   // return focus to where the page was opened
  syncExploreNav();
}

/* ── 📊 My progress: done/total for every module + a total mastered count.
      Full-screen page like Keep practicing — #my-progress, Back exits. ── */
function toggleMyProgress(){
  const screen = document.getElementById('my-progress-screen');
  if(!screen) return;
  if(screen.hasAttribute('hidden')) goExploreHash('my-progress');
  else closeMyProgressScreen();
}
function openMyProgressScreen(){
  const screen = document.getElementById('my-progress-screen');
  if(!screen || !screen.hasAttribute('hidden')) return;
  closeTopPanels('my-progress');
  screen.removeAttribute('hidden');
  syncExploreNav();
  const exit = screen.querySelector('.page-exit');
  if(exit) exit.focus();
  renderMyProgress();
}
function closeMyProgressScreen(){
  if(location.hash === '#my-progress'){ exitExploreHash(); return; }  // the router finishes the job
  mpClosePanel();
}
function mpClosePanel(){
  const screen = document.getElementById('my-progress-screen');
  const wasOpen = screen && !screen.hasAttribute('hidden');
  if(screen) screen.setAttribute('hidden', '');
  const btn = document.getElementById('my-progress-btn');
  if(btn && wasOpen) btn.focus();   // return focus to where the page was opened
  syncExploreNav();
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
  const totalPct = totalAll ? Math.round(totalDone / totalAll * 100) : 0;
  const overallRow = `<div style="padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:0.875rem;font-weight:600">${t('progress.overall')}</div>
      <div class="prog-wrap"><div class="prog-row"><div class="prog-bg"><div class="prog-fill" style="width:${totalPct}%"></div></div><div class="prog-lbl">${totalDone} / ${totalAll}</div></div></div>
    </div>`;
  bodyEl.innerHTML = `<div class="coach-tip" data-i18n="progress.skillsMastered" data-i18n-params="${escAttr(JSON.stringify({done:totalDone,total:totalAll,modules:MODULE_MANIFEST.length}))}">${t('progress.skillsMastered',{done:totalDone,total:totalAll,modules:MODULE_MANIFEST.length})}</div>
    <div class="card">${overallRow}${rows}</div>`;
  if(typeof applyI18n === 'function') applyI18n(bodyEl);
}

/* ── ✓ In-Class Activities: teacher-curated, day-specific work pushed out
   alongside the self-paced modules ── An explore page in the main column
   (#class-activities), same plumbing as its rail neighbours above (see
   EXPLORE_PAGES). An activity is LIVE the moment its entry is on main —
   there is no toggle — and activities never retire; this page is a
   permanent archive, newest first. Own lightweight renderer (not the .dp
   station-card builder — see the work order this shipped from): activities
   are simple enough that reusing the station machinery would drag in focus
   mode, the footer gate and stepper logic for no benefit. */
function toggleClassActivities(){
  const screen = document.getElementById('class-activities-screen');
  if(!screen) return;
  if(screen.hasAttribute('hidden')) goExploreHash('class-activities');
  else closeClassActivitiesScreen();
}
function closeClassActivitiesScreen(){
  if(location.hash === '#class-activities'){ exitExploreHash(); return; }  // the router finishes the job
  caClosePanel();
}
function caClosePanel(){
  const screen = document.getElementById('class-activities-screen');
  const wasOpen = screen && !screen.hasAttribute('hidden');
  if(screen) screen.setAttribute('hidden', '');
  const btn = document.getElementById('class-activities-btn');
  if(btn && wasOpen) btn.focus();   // return focus to where the page was opened
  /* A Shuffle Drill in an activity step keeps its countdown interval (and any
     pending "next card" timeout) running once this screen is merely hidden —
     nothing rebuilds it on the way out. Same teardown, and same reasoning, as
     the set-switch in switchTabById; a no-op for drills not mid-round. */
  if(typeof shuffleDrills === 'object' && typeof sdStop === 'function'){
    Object.keys(shuffleDrills).forEach(k => sdStop(k));
  }
  syncExploreNav();
}
function openClassActivitiesScreen(){
  const screen = document.getElementById('class-activities-screen');
  if(!screen || !screen.hasAttribute('hidden')) return;
  closeTopPanels('class-activities');
  screen.removeAttribute('hidden');
  syncExploreNav();
  const exit = screen.querySelector('.page-exit');
  if(exit) exit.focus();
  renderClassActivities();
}
// Which activity card is expanded, so a re-render (Mark complete, language
// switch) doesn't collapse the one the student is looking at.
let caOpenId = null;
// Per-step accordion state — session-only (no Firestore, no localStorage;
// resets on reload by design, unlike the module-step checklist). caStepOpen
// maps activity id -> open step index (-1 = none); caStepDone maps
// "activityId:stepIndex" -> true. Read at render time by caActivityCardHtml,
// then kept in sync by direct DOM edits in caToggleStepOpen/caMarkStepDone so
// marking a step done doesn't force a full re-render of the card (which would
// cut off any playing TAB audio in other steps).
let caStepOpen = {};
let caStepDone = {};
function caDefaultOpenStep(a){
  const steps = a.steps || [];
  for(let i=0;i<steps.length;i++) if(caStepDone[`${a.id}:${i}`] !== true) return i;
  return -1;
}
function caStepStatusHtml(n, isDone){ return isDone ? '&#x2713;' : String(n); }
function caFormatDate(iso){
  if(!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if(isNaN(d)) return iso;
  const lang = (typeof getLang === 'function' && getLang() === 'es') ? 'es' : 'en';
  return d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { weekday:'short', month:'numeric', day:'numeric' });
}
/* "Step 4" on its own, or "Step 4: Tune it back" when the step carries an
   optional `label`/`label_es`. The label is what makes a collapsed ladder
   scannable — a student looking for the tuning stop shouldn't have to open
   four steps to find it. Plain text, escaped, no markup. Mirrored in
   teacher.js's renderTeacherActivityDetail() (two renderers, see CLAUDE.md). */
function caStepHeadText(step, si){
  const n = t('ca.stepLabel', {n: si + 1});
  const label = step && step.label ? tf(step, 'label') : '';
  return label ? `${n}: ${label}` : n;
}
function caStepHtml(a, step, si, isOpen, isDone){
  const parts = [];
  if(step.figure) parts.push(`<span class="step-figure"><img src="${escAttr(step.figure)}" alt=""></span>`);
  if(step.video && step.video.id){
    const url = `https://www.youtube.com/watch?v=${encodeURIComponent(step.video.id)}${step.video.start ? `&start=${Number(step.video.start)}` : ''}`;
    const vLabel = step.video.label ? escHtml(tf(step.video, 'label')) : escHtml(t('ca.watchVideo'));
    parts.push(`<button type="button" class="rp-trigger" onclick="loadPanel('youtube','${escAttr(url)}','${escAttr(t('nav.classActivities'))}','YouTube')">&#x25B6; ${vLabel}</button>`);
  }
  if(step.tab) parts.push(buildTab(step.tab, { keyPrefix: `bpm:ca:${a.id}:${si}:tab` }));
  /* Same step-level drill widgets the module sets get (shuffle/deck/ear) —
     activities replace paper self-quizzes the same way module steps do. The
     key namespace is `<activityId>-s<i>`, which can't collide with the
     module keys (`<setId>-<ns>-<i>`) sharing these state maps. No `wid`:
     that's a module set id, used only for the peek check (a missing one
     reads as "not peeking", which is right — activities have no peek mode)
     and for the skill check-off, which activity drills don't offer since
     `drill.skill` is a module skill id and activities have none. */
  if(step.drill) parts.push(renderShuffleDrill(step.drill, `${a.id}-s${si}`, null));
  // Step text is first-party authored HTML, same trust level as module step
  // content — trusted (not escHtml'd) so <ol>/<ul> markup renders per the
  // house list rule, and wrapGotItWhen() can style the got-it-when sentence.
  const detailHtml = `${wrapGotItWhen(tf(step,'text'))}${parts.join('')}`
    + `<div class="ca-step-done-row"><button type="button" class="ca-step-donebtn${isDone ? ' is-done' : ''}" onclick="caMarkStepDone(this,'${escAttr(a.id)}',${si})">${stepDoneHtml(isDone)}</button></div>`;
  return `<li class="ca-step${isDone ? ' ca-step-done' : ''}${isOpen ? '' : ' ca-step-collapsed'}" data-idx="${si}">`
    + `<button type="button" class="ca-step-head" aria-expanded="${isOpen}" onclick="caToggleStepOpen(this)">`
    + `<span class="ca-step-status" aria-hidden="true">${caStepStatusHtml(si + 1, isDone)}</span>`
    + `<span class="ca-step-label">${escHtml(caStepHeadText(step, si))}</span>`
    + `<span class="ca-step-chev" aria-hidden="true">&#9656;</span>`
    + `</button>`
    + `<div class="ca-step-detail">${detailHtml}</div>`
    + `</li>`;
}
function caActivityCardHtml(a){
  const done = classActivities[a.id] === true;
  const open = caOpenId === a.id;
  const openStepIdx = caStepOpen[a.id] !== undefined ? caStepOpen[a.id] : caDefaultOpenStep(a);
  const stepsHtml = (a.steps || []).map((s, si) => caStepHtml(a, s, si, si === openStepIdx, caStepDone[`${a.id}:${si}`] === true)).join('');
  const markLabel = done ? t('ca.completed') : t('ca.markComplete');
  const num = caNumber(a);
  const titleHtml = (num ? `#${num} - ` : '') + escHtml(caTitle(a));
  // Undated activities only reach a screen under dev bypass (caIsVisible
  // gates students on the date) — but an empty chip renders as a stray amber
  // dash, on the printed handout as much as on screen, so skip it entirely.
  const dateLabel = caFormatDate(caDate(a));
  return `<details class="ca-card" ${open ? 'open' : ''} data-id="${escAttr(a.id)}" ontoggle="caOnToggle(this)">
    <summary class="ca-card-summary">
      ${dateLabel ? `<span class="ca-chip">${escHtml(dateLabel)}</span>` : ''}
      <span class="ca-card-title">${titleHtml}</span>
      ${done ? `<span class="ca-done-mark" aria-hidden="true">${TCK_CHECK_SVG_INLINE}</span>` : ''}
      <button type="button" class="ca-print-btn" onclick="printActivity(event,'${escAttr(a.id)}')" title="${escAttr(t('ca.printTitle'))}" aria-label="${escAttr(t('ca.print'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7" rx="1"/></svg></button>
    </summary>
    <div class="ca-card-body">
      <p class="coach-tip">${escHtml(tf(a,'intro'))}</p>
      ${stepsHtml ? `<ol class="ca-steps">${stepsHtml}</ol>` : ''}
      <button type="button" class="ca-mark-btn ${done ? 'done' : ''}" onclick="caToggleComplete('${escAttr(a.id)}')">${escHtml(markLabel)}</button>
    </div>
  </details>`;
}
/* Print ONE activity as a handout — the paper version of the circuit, for
   days the Chromebooks or the Wi-Fi fail, or for a sub who wants it on a
   clipboard. Same shape as printRoutine(): a body class scopes the @media
   print rules to the one card, restored on afterprint.

   Two bits of state have to be forced open and put back, because a closed
   <details> and a collapsed step both print nothing: the card itself, and
   the step accordion (only one step is ever open on screen — a handout that
   printed just that one would be worse than useless). afterprint fires on
   cancel as well as on a real print, so the restore runs either way; it's
   `once` so a second print doesn't stack listeners. */
function printActivity(ev, id){
  // The button lives inside the <summary>, whose default action toggles the
  // card — swallow it or printing would also collapse what we just opened.
  if(ev){ ev.preventDefault(); ev.stopPropagation(); }
  const card = document.querySelector(`.ca-card[data-id="${CSS.escape(id)}"]`);
  if(!card) return;
  const wasOpen = card.open;
  const collapsed = Array.from(card.querySelectorAll('.ca-step.ca-step-collapsed'));
  card.open = true;
  collapsed.forEach(li => li.classList.remove('ca-step-collapsed'));
  card.classList.add('ca-print-target');
  document.body.classList.add('print-activity');
  const done = () => {
    document.body.classList.remove('print-activity');
    card.classList.remove('ca-print-target');
    collapsed.forEach(li => li.classList.add('ca-step-collapsed'));
    card.open = wasOpen;
  };
  window.addEventListener('afterprint', done, { once: true });
  window.print();
}
// The .dp card builder's ✓ glyph, borrowed as a plain inline SVG so this
// renderer doesn't have to pull in station-card CSS classes for one icon.
const TCK_CHECK_SVG_INLINE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:14px;height:14px"><path d="M5 12l5 5L19 7"/></svg>';
function caOnToggle(details){
  caOpenId = details.open ? details.dataset.id : (caOpenId === details.dataset.id ? null : caOpenId);
}
// Steps within one activity are a single-open accordion, independent of the
// module-station .dp builder's own step/focus-mode machinery (deliberately —
// see class-activities.js's schema comment). Pure DOM edits, no re-render, so
// a step toggle can't cut off audio playing in a sibling step's TAB player.
function caToggleStepOpen(btn){
  const li = btn.closest('.ca-step');
  const list = li.closest('.ca-steps');
  const willOpen = li.classList.contains('ca-step-collapsed');
  list.querySelectorAll('.ca-step').forEach(other => {
    if(other === li) return;
    other.classList.add('ca-step-collapsed');
    const h = other.querySelector('.ca-step-head');
    if(h) h.setAttribute('aria-expanded', 'false');
  });
  li.classList.toggle('ca-step-collapsed', !willOpen);
  btn.setAttribute('aria-expanded', String(willOpen));
  const activityId = list.closest('.ca-card').dataset.id;
  caStepOpen[activityId] = willOpen ? Number(li.dataset.idx) : -1;
}
// Mark this step done, then collapse it and open the next not-done step —
// same "collapse and advance" feel as the module-step checklist, but
// scoped to one flat step list (no sections/focus-mode) and never saved.
function caMarkStepDone(btn, id, si){
  const key = `${id}:${si}`;
  const nowDone = caStepDone[key] !== true;
  caStepDone[key] = nowDone;
  const li = btn.closest('.ca-step');
  li.classList.toggle('ca-step-done', nowDone);
  btn.classList.toggle('is-done', nowDone);
  btn.innerHTML = stepDoneHtml(nowDone);
  const status = li.querySelector('.ca-step-status');
  if(status) status.innerHTML = caStepStatusHtml(si + 1, nowDone);
  if(!nowDone) return;   // unmarking just restores the number/label above
  li.classList.add('ca-step-collapsed');
  const head = li.querySelector('.ca-step-head');
  if(head) head.setAttribute('aria-expanded', 'false');
  const list = li.closest('.ca-steps');
  const siblings = [...list.querySelectorAll('.ca-step')];
  const next = siblings.slice(siblings.indexOf(li) + 1).find(s => !s.classList.contains('ca-step-done'));
  caStepOpen[id] = next ? Number(next.dataset.idx) : -1;
  if(next){
    next.classList.remove('ca-step-collapsed');
    const nh = next.querySelector('.ca-step-head');
    if(nh) nh.setAttribute('aria-expanded', 'true');
    next.scrollIntoView({behavior: scrollBehavior(), block: 'nearest'});
  }
}
function caToggleComplete(id){
  const isDone = classActivities[id] === true;
  onClassActivityChange(id, !isDone);
  caOpenId = id;   // keep the card open through the re-render
  renderClassActivities();
}
// The teacher-console release date for this activity, or null if unset —
// see activityDates in loadClassConfig(). class-activities.js entries carry
// no date field of their own anymore; this is the only place that resolves one.
function caDate(a){ return activityDates[a.id] || null; }
/* The activity's display title, with a teacher rename applied if one is live.
   Renames are typed in the console (teacher.js) and land in
   config/class.activityTitles as { en, base } — see loadClassConfig().

   `base` is the SHIPPED title the rename was typed against, and it's what
   makes a rename a temporary patch instead of a permanent shadow: the
   override only applies while the shipped title still equals `base`. So the
   loop is — Jonathan renames in the console (live immediately, English in
   both languages, which is the honest cost of an instant rename by someone
   who doesn't write Spanish); the next code session folds that name into
   class-activities.js as a proper title/title_es pair; the shipped title now
   differs from `base`, the override silently expires, and Spanish students
   get real Spanish. No cleanup write to Firestore needed, and no way for a
   forgotten override to keep an English name pinned over a translated one.

   `es` is honoured if it's ever set, so a future console field for it (or a
   hand-written doc edit) works without touching this. */
function caTitle(a){
  const o = activityTitles[a.id];
  if(o && o.en && o.base === a.title){
    return (typeof getLang === 'function' && getLang()==='es' && o.es) ? o.es : o.en;
  }
  return tf(a,'title');
}
/* ── Teaching-order numbers ──
   `number` in class-activities.js is the teaching order the class actually
   runs in, and it drives the "#N - " prefix students read. The teacher can
   resequence it from the console (teacher.js Class activities view), which
   lands in config/class.activityNumbers as id -> { n, base }.

   `base` is the SHIPPED number the renumbering was typed against, and it
   plays exactly the role it plays for renames (see caTitle): the override
   applies only while the shipped number still equals `base`, so folding the
   new order into class-activities.js expires it by itself — no Firestore
   cleanup, and no forgotten override quietly shadowing a hand-set order.

   caNumberMap() takes the whole list rather than one activity because the
   thing being resolved is an ORDER, not a value: it sorts by the effective
   number and hands back positions 1..N. That normalisation is what keeps the
   prefix honest through a partial expiry — if a push folds in some of the
   overrides and not others, the raw numbers can briefly collide or leave a
   gap, and students would otherwise see two #5s. Ties break on the shipped
   number, then the id, so the result is stable across renders and clients.
   Exported plainly (not a closure) because teacher.js calls it too, with the
   config doc it already has in hand instead of this file's student-side
   globals — same split as caTitle/teacherActivityTitle, minus the copy. */
function caNumberMap(activities, overrides){
  const ov = overrides || {};
  const shipped = a => { const n = Number(a.number); return Number.isFinite(n) ? n : Infinity; };
  const effective = a => {
    const o = ov[a.id];
    return (o && Number.isFinite(Number(o.n)) && Number(o.base) === shipped(a)) ? Number(o.n) : shipped(a);
  };
  const map = {};
  [...(activities||[])]
    .sort((x, y) => (effective(x) - effective(y)) || (shipped(x) - shipped(y)) || String(x.id).localeCompare(String(y.id)))
    .forEach((a, i) => { map[a.id] = i + 1; });
  return map;
}
// The map is rebuilt only when activityNumbers is REPLACED (loadClassConfig
// assigns a fresh object every time, and so does the sign-out reset), not on
// every card — renderClassActivities' comparator alone would otherwise sort
// the whole list once per comparison.
let caNumberCache = null;
function caNumber(a){
  if(!caNumberCache || caNumberCache.src !== activityNumbers)
    caNumberCache = { src: activityNumbers, map: caNumberMap(window.CLASS_ACTIVITIES || [], activityNumbers) };
  return caNumberCache.map[a.id] || Number(a.number) || 0;
}
/* An activity is visible to students once its console-set release date has
   arrived (local calendar day) — same "hidden until it happens" default as
   the reminder popup below, so an activity with no date set yet (every
   activity's starting state) or a future one doesn't leak to students who
   click ahead. The teacher-only hide toggle (hiddenActivityIds, see
   loadClassConfig()) is independent and can hide/reveal on top of this.
   Dev-bypass users skip the date gate — the whole point of that mode is
   previewing UI that isn't live yet. */
function caIsVisible(a){
  if(hiddenActivityIds[a.id] === true) return false;
  if(isDevBypassUser()) return true;
  const d = caDate(a);
  return d ? d <= dayStr(new Date()) : false;
}
function renderClassActivities(){
  const bodyEl = document.getElementById('class-activities-body');
  if(!bodyEl) return;
  // Everything in this list is visible, hence dated — except under dev
  // bypass, where caIsVisible skips the date gate and caDate(a) can be null.
  // Treat null as '' so an undated entry sinks to the bottom of the sort
  // instead of localeCompare throwing on a non-string.
  const list = (window.CLASS_ACTIVITIES || []).filter(caIsVisible)
    .sort((a, b) => (caDate(b) || '').localeCompare(caDate(a) || '') || (caNumber(b) - caNumber(a)));
  if(!list.length){
    bodyEl.innerHTML = `<div class="coach-tip" data-i18n="ca.empty">${escHtml(t('ca.empty'))}</div>`;
  } else {
    bodyEl.innerHTML = list.map(caActivityCardHtml).join('');
  }
  if(typeof applyI18n === 'function') applyI18n(bodyEl);
}

/* ── Reminder popup: unfinished activities, once per visit ──
   Shown only after a successful progress load for a signed-in, non-dev
   student — an empty classActivities from a failed load is indistinguishable
   from "nothing done yet", so we can't tell a real gap from a read error. */
function maybeShowCaReminder(){
  if(progressLoadFailed || isDevBypassUser()) return;
  const pending = (window.CLASS_ACTIVITIES || []).filter(a => classActivities[a.id] !== true && caIsVisible(a));
  if(!pending.length) return;
  try{ if(sessionStorage.getItem('caReminderShown') === '1') return; }catch(e){}
  const shown = pending.slice().sort((a, b) => (caDate(b) || '').localeCompare(caDate(a) || '')).slice(0, 5);
  const more = pending.length - shown.length;
  const itemsHtml = shown.map(a => `<li><span class="ca-chip">${escHtml(caFormatDate(caDate(a)))}</span> ${escHtml(caTitle(a))}</li>`).join('');
  const ov = document.createElement('div');
  ov.className = 'daily5-overlay ca-reminder-overlay';
  ov.id = 'ca-reminder-overlay';
  ov.innerHTML = `<div class="daily5-modal ca-reminder-modal" role="dialog" aria-modal="true" aria-label="${escAttr(t('ca.reminderTitle'))}">
    <div class="daily5-head"><h3 style="font:inherit;margin:0">${escHtml(t('ca.reminderTitle'))}</h3>
      <button type="button" class="tp-close" onclick="closeCaReminder()" aria-label="${escAttr(t('gate.closeAria'))}">&#x2715;</button></div>
    <ul class="ca-reminder-list">${itemsHtml}${more > 0 ? `<li class="ca-reminder-more">${escHtml(t('ca.reminderMore',{n:more}))}</li>` : ''}</ul>
    <div class="issue-actions">
      <button type="button" class="ca-mark-btn" onclick="caReminderGo()">${escHtml(t('ca.reminderGo'))}</button>
      <button type="button" class="tp-btn" onclick="closeCaReminder()">${escHtml(t('ca.reminderLater'))}</button>
    </div>`;
  ov.addEventListener('click', e => { if(e.target === ov) closeCaReminder(); });
  document.body.appendChild(ov);
  document.addEventListener('keydown', caReminderEscClose);
  openOverlay(ov);
  try{ sessionStorage.setItem('caReminderShown', '1'); }catch(e){}
}
function caReminderEscClose(e){ if(e.key === 'Escape') closeCaReminder(); }
function closeCaReminder(){
  const ov = document.getElementById('ca-reminder-overlay');
  if(!ov) return;
  ov.remove();
  document.removeEventListener('keydown', caReminderEscClose);
  closeOverlay();
}
function caReminderGo(){
  closeCaReminder();
  goExploreHash('class-activities');
}

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
      /* Everything the reload must not walk over. Jonathan pushes during
         class, so this fires while students are mid-task — and a reload here
         costs whatever is still only in memory.

         Waits, but not forever: a drill left open on an abandoned Chromebook
         would otherwise pin that tab to the old build for the rest of the
         day. The sign-in popup is the one unbounded case — reloading the
         opener destroys the pending signInWithPopup promise, so the student
         finishes the popup and lands back on the sign-in wall, forced to
         sign in a second time. */
      const SW_RELOAD_MAX_WAIT = 5 * 60 * 1000;
      const startedWaiting = Date.now();
      const anyValue = (obj, fn) => Object.keys(obj || {}).some(k => obj[k] && fn(obj[k]));
      const busyReason = () => {
        // A live mic check / count-in (coach.js), or a take still recording:
        // a MediaRecorder blob lives in memory until the student keeps it.
        if (window.coachMicLive) return 'mic';
        if (anyValue(recState, s => s.starting || s.recording)) return 'recording';
        // Mid-round in a Shuffle ('play') / Deck or Ear ('run') drill: the
        // round's score is only written when it finishes.
        if (anyValue(shuffleDrills, s => s.phase === 'play')) return 'drill';
        if (anyValue(deckDrills,    s => s.phase === 'run'))  return 'drill';
        if (anyValue(earDrills,     s => s.phase === 'run'))  return 'drill';
        return null;
      };
      const reload = async () => {
        if (window.__authPopupPending) { setTimeout(reload, 1500); return; }
        if (busyReason() && Date.now() - startedWaiting < SW_RELOAD_MAX_WAIT) { setTimeout(reload, 1500); return; }
        /* A step marked done half a second ago is still inside queueSave's
           800 ms debounce (or its retry backoff) and would simply vanish —
           pagehide's flush is a Firestore write started during unload and is
           not reliably delivered. Send it now, then reload either way: one
           real attempt beats waiting on a save that may never succeed. */
        if (_dirtyKeys.size || saveTimer) {
          clearTimeout(saveTimer);
          try { await flushSave(); } catch(e){ /* reload regardless — nothing better is available */ }
        }
        location.reload();
      };
      reload();
    });
  });
}
