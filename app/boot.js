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
      // i18n.js loads before app.js and this only fires on an error event, so
      // t() is there — same as the offline banner below, which it mirrors.
      msg.setAttribute('data-i18n', 'err.body');
      msg.textContent = t('err.body');
      const refresh = document.createElement('button');
      refresh.setAttribute('data-i18n', 'err.refresh');
      refresh.textContent = t('err.refresh');
      refresh.style.cssText = 'margin-left:4px;padding:3px 12px;border:0;border-radius:14px;'
        + 'background:#fff;color:#514a7d;font-weight:600;cursor:pointer';
      /* A save still unsent when Refresh is pressed (2026-10-12) used to be
         dropped by the reload without a word. Send it first, bounded like
         Sign out (flushBeforeLeaving); if it still hasn't landed, say so and
         make the button "Refresh anyway". Anything going wrong in here — the
         error that raised this banner may have come before the save code
         even loaded — falls back to the plain reload. */
      let anyway = false;
      refresh.onclick = () => {
        let pending = false;
        try { pending = !anyway && hasUnsavedWrites(); } catch(_) {}
        if (!pending) { location.reload(); return; }
        refresh.disabled = true;
        refresh.setAttribute('data-i18n', 'save.saving');
        refresh.textContent = t('save.saving');
        flushBeforeLeaving(4000).then(saved => {
          if (saved) { location.reload(); return; }
          anyway = true;
          refresh.disabled = false;
          msg.setAttribute('data-i18n', 'save.notSavedYet');
          msg.textContent = t('save.notSavedYet');
          refresh.style.marginLeft = '8px';
          refresh.setAttribute('data-i18n', 'save.refreshAnyway');
          refresh.textContent = t('save.refreshAnyway');
        }).catch(() => location.reload());
      };
      const close = document.createElement('button');
      close.setAttribute('data-i18n-attr', 'aria-label:offline.dismiss');
      close.setAttribute('aria-label', t('offline.dismiss'));
      close.textContent = '×';
      close.style.cssText = 'position:absolute;top:8px;right:12px;background:none;border:0;'
        + 'color:#fff;font-size:1.25rem;line-height:1;cursor:pointer';
      close.onclick = () => d.remove();
      d.append(msg, refresh, close);
      (document.body || document.documentElement).appendChild(d);
    } catch(_) { /* never let the safety net crash */ }
  }
  /* "ResizeObserver loop completed with undelivered notifications" is the
     browser noting that an observer's callback resized something and the
     rest waits a frame — nothing threw and nothing is broken. It fires on
     big window resizes (entering full screen, 2026-10-13) and was putting
     this banner over a working page. Logged as a warning, no banner. */
  window.addEventListener('error', e => {
    if (!e.error && /ResizeObserver loop/.test(e.message || '')) { console.warn('[guitar-class]', e.message); return; }
    console.error('[guitar-class] error:', e.error || e.message); showBanner();
  });
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
let exitChecks  = {};   // Exit-check results: id -> { score, total, picks, at, attempts } (see caCheckBodyHtml / class-activities.js kind:'check')
let games       = {};   // per-game bests from the games arcade (coach.js) — its own save category
let streak      = { count:0, lastDay:null };   // site-wide practice streak, independent of any one game
let gamesAccessOn = true; // whether the Games arcade is available to THIS student (teacher-controlled; see loadClassConfig)
/* Consented mic recordings (coach.js micRec*): the teacher's switch and
   how many takes are saved so far. Fail CLOSED — anything short of a
   successful read of both leaves collection off, so nobody is asked. */
let micSampling = { on: false, max: 0 };
let micTakesCount = Infinity;
let accountPaused = false; // teacher put this student on hold (see loadClassConfig / showPausedScreen)
/* Which class period this student is in — 4, 7, or CAS, nothing else. Two
   halves, deliberately: `studentPeriod` is the student's own answer, living
   on their progress doc (which only they can write); `periodOverride` is
   the teacher's correction, read from config/class. They are split because
   firestore.rules gives the teacher READ-only access to progress/{uid} on
   purpose (see the comment block in that file), so the console has no way
   to fix a wrong tap in place. Effective period = override || own answer.
   See maybeShowPeriodPicker(). */
let studentPeriod = '';    // progress/{uid}.period — '4' | '7' | 'CAS' | '' (not answered yet)
let periodOverride = '';   // config/class.periodOverrides[uid] — teacher's correction, read-only here
/* Practice minutes (practice-minutes.js, settings in practice-minutes-config.js).
   The engine is page-agnostic — the Journey pages host it too — so this is the
   whole of what it asks of the main site: who is signed in (never the ?teacher
   console, and only a real Firebase user, so the localhost dev bypass counts
   nothing), the Firestore handle, and "draw the UI". `period` below is read by the Top 5 (2026-11-04): this
   week's minutes are ranked inside the student's class period. Every callback reads app state when called, so nothing here runs before
   sign-in. practice-minutes.js loads after this file and picks the object up. */
window.PM_HOST = {
  ui: true,
  user: () => ((typeof IS_TEACHER_MODE !== 'undefined' && IS_TEACHER_MODE) || accountPaused) ? null : (auth && auth.currentUser) || null,
  db: () => ensureDb(),
  period: () => periodOverride || studentPeriod || ''
};
/* config/class.moduleOpenThrough[uid] — teacher's "Open through Module N"
   (teacher.js Manage view), 2..12, or 0 for no override. Opens modules
   2..N's cross-module gate (isModuleGateLocked, <= N) and every set of the
   SKIPPED modules 1..N-1 (isSetLocked, < N) — module N itself keeps its
   set-to-set order. Read-only here: nothing about it is ever written to the
   student's progress doc. Cached per uid like periodOverride, so a blocked
   read keeps the last known value instead of snapping modules shut. */
let moduleOpenThrough = 0;
/* The open-through actually in force: the student's own value or the
   class-wide floor CLASS_OPEN_THROUGH (config-main.js), whichever is higher. */
function classOpenThrough(){
  return Math.max(moduleOpenThrough || 0, (typeof CLASS_OPEN_THROUGH === 'number') ? CLASS_OPEN_THROUGH : 0);
}
let hiddenActivityIds = {}; // In-Class Activities the teacher has temporarily hidden (see loadClassConfig) — id -> true
/* Activities the teacher gave to particular students only (console board,
   "Who" picker → config/class.activityStudents, id -> { uid -> true }).
   Kept here already reduced to THIS student: id -> true (one of mine) or
   false (someone else's), so the cache never holds other students' uids.
   An id that isn't here is a whole-class card. Read by caForMe(). */
let activityForMe = {};
let activityDates = {}; // In-Class Activities release dates, teacher-set in the console (see loadClassConfig) — id -> 'YYYY-MM-DD'
let activityTitles = {}; // In-Class Activity renames, teacher-set in the console (see loadClassConfig / caTitle) — id -> { en, base }
let activityNumbers = {}; // LEGACY In-Class Activity renumbering — see caBoardOrder's fallback note; read only while activityBoard is unseeded
/* The activity board — config/class.activityBoard, written by the teacher
   console's two-column Class activities board (teacher.js). id -> { module,
   pos }: `module` is a MODULE_MANIFEST number, or 0 for the board's Unsorted
   holding pen, and `pos` is 1..N within that module. An activity with an
   entry is ASSIGNED — placed in the course, and a candidate for In-Class
   Activities once its release date arrives. One with no entry has only
   been pushed to the site; it is Built, not placed, and no student sees it.

   This is what drives BOTH the order students read the cards in and the
   "#N" number before their titles (caBoardOrder / caNumber), replacing the shipped
   `number` field and the console's old activityNumbers overrides. */
let activityBoard = {};
/* config/class.activityBoardSeeded — has the console ever written a board?
   It has to be its own flag rather than "activityBoard is non-empty",
   because those two states differ in the one case that matters: a board the
   teacher has emptied by un-assigning every card means NOTHING is placed
   (no student sees anything), while a board that was never written means
   the feature hasn't started yet and every card should keep rendering the
   way it did before. Guessing from emptiness would flip the second reading
   into the first the moment the last card came off. */
let activityBoardOn = false;
let activityClears = {}; // Per-student activity-gate clears, teacher-set in the console (see loadClassConfig / caBlockers) — uid -> { activityId -> true }
/* Activities the teacher has retired from the console — config/class's
   archivedActivities (tucked away, restorable with its date/rename/number
   intact) and deletedActivities (gone, and everything the console set for it
   wiped). Students draw no distinction between the two, so the two maps are
   MERGED into one id -> true set here; the console keeps them apart because
   that is where "can I get it back the way it was?" is answered. */
let retiredActivityIds = {};
/* Activities the teacher has marked Optional from the console —
   config/class.optionalActivities, id -> true. An optional card shows on
   In-Class Activities like any other (same date, board and Hidden rules —
   caIsVisible doesn't read this), wears an "Optional" tag, and never blocks
   the site: caBlockers() skips it. Cached like the hidden map, for the same
   "must not fail open" reason — a flaky read that reset this to {} would
   turn every optional card back into a lock. */
let optionalActivityIds = {};
/* Practice cards the teacher switched to "Play Along now" on the console
   board — config/class.playAlongActivities, id -> true (2026-10-02,
   Jonathan: "can we set some visible even if they don't have a release
   date?"). The Songs page's Play Along list shows such a card whether or
   not its date has arrived; nothing else changes — it stays off In-Class
   Activities and it never blocks (caIsVisible and caBlockers don't read
   this). See caIsPlayAlongOnly(). Cached like the other maps so a flaky
   read doesn't empty the list a student was just using. */
let playAlongActivityIds = {};
/* Where each movable song lives, set by the console's "Move to Songs" /
   "Move to Class activities" buttons (config/class.songLibrary, id -> true
   for the Songs page, false for Class activities). Overrides the card's
   `library` field — see caIsLibraryCard. Cached like the board, so a flaky
   read doesn't put a moved song back where it started. */
let songLibraryIds = {};
/* Teacher-only cards the console has moved to Class activities
   (config/class.classSongs, id -> true — the "Move to Class activities"
   button on the console's Teacher view songs tab). A moved one is an
   ordinary class activity: on the board, assigned and dated like any other
   — see caIsTeacherSong. Cached like songLibraryIds. */
let classSongIds = {};
/* The "Keep practicing" row at the top of In-Class Activities —
   config/class.activityPins, an ORDERED array of activity ids, at most
   CA_PINS_MAX (2026-10-10, Jonathan: he reuses some cards on many days —
   the song play-along cards, ca-23 — and wants them one click away without
   re-dating anything). A pin stands in for the release date for THAT ROW
   ONLY: the card still has to be placed on the board, not Hidden, not
   archived/deleted, and not an exit check (caPinReachable). It is not read
   by caIsVisible or by any blocker rule, so a pin never puts a card on the
   dated list, never counts as one of Today's activities and never gates anyone; it
   writes no completion data. Cached like the other maps. */
let activityPins = [];
const CA_PINS_MAX = 4;
let saveTimer   = null;

/* ── Lazy module loading ──
   Module data files (module-N.js) are no longer loaded up front. Each is
   fetched on demand the first time its module is opened, then its panels are
   built into the DOM. This keeps first load light on weak Wi-Fi / slow
   Chromebooks: we parse one module's data and build one module's panels
   instead of all eight. The service worker still caches every module file
   (after the first page load following an update: sw.js precacheRest), so
   opening a not-yet-loaded module while offline keeps working. */
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
/* ── Deferred scripts: loaded on first use, not on every page load ──
   index.html used to ship 1.29 MB of first-party JS before the auth wall
   could do anything, and two of the biggest pieces are things most page
   loads never touch: coach.js (375 KB — the games arcade and the Listening
   Coach, first needed on a click) and teacher.js (99 KB — meaningful only
   with ?teacher). On a school Chromebook's first visit that is most of the
   wait, and it is spent on code the student may never run.

   coach.js is still cached by the service worker (sw.js precacheRest fills it
   in after the first page load following an update), so its deferred fetch
   is a cache hit for anyone who has loaded the site before, online or off.
   teacher.js is NOT (2026-10-12 — sw.js ASSETS leaves it out so students
   don't re-download it on every deploy; checks.mjs SHELL_NOT_PRECACHED):
   the console's first load fetches it from the network, and the fetch
   handler caches it from then on.

   Safe because every OTHER reference to these files across app.js is
   `typeof x === 'function'` guarded, and each of those is a teardown call
   (coachClose, gamesStopMic, gamesClosePanel, coachInterrupt,
   gamesResetForUser): with the script unloaded there is nothing running to
   tear down, so skipping is the correct behaviour, not a silent failure.
   The render-time helpers the step ladder calls unguarded — coachBtnHtml,
   coachChordBtnRowHtml, coachSkillsAttr, coachSkillBest — all live in THIS
   file, so the renderer never depends on coach.js at all. What's left is
   the handful of entry points below, which load it and then act. */
const _lazyScripts = {};
function loadScriptOnce(src){
  if(_lazyScripts[src]) return _lazyScripts[src];
  _lazyScripts[src] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    // Same retry shape as loadModuleData: drop the promise AND the dead tag,
    // so a later attempt isn't stuck on a failed load.
    s.onerror = () => { s.remove(); delete _lazyScripts[src]; reject(new Error(src + ' failed to load')); };
    document.head.appendChild(s);
  });
  return _lazyScripts[src];
}
/* The files that make up the arcade script and the console script, in load order (each script was cut
   into parts on 2026-11-11, tools/split-site.mjs). tools/site-src.mjs reads these two
   lines, so each stays ONE line that starts the line, and neither name may appear in any other comment. */
const COACH_JS_PARTS = ['coach-core.js', 'coach-hub.js', 'coach-chords.js', 'coach-ear.js', 'coach-strum.js', 'coach-runner.js', 'coach-more.js'];
const TEACHER_JS_PARTS = ['teacher-core.js', 'teacher-activities.js', 'teacher-songs.js', 'teacher-config.js', 'teacher-manage.js', 'teacher-mic.js', 'teacher-students.js'];
/* One after another, each only when the one before it has run: a later part uses what an earlier part defines.
   Every file keeps its own loadScriptOnce promise, so a part that failed to load is the only one fetched again
   on the next try, and a part that already ran never runs twice (a second run would redeclare its consts). */
const _lazyGroups = {};
function loadScriptsInOrder(list){
  const key = list.join('|');
  /* One promise per list, handed to every caller (callers rely on their .then callbacks running in the order
     they were attached: the Games router before Riff Roulette's own). A failed load forgets it, so the next
     call tries again. */
  if(!_lazyGroups[key]) _lazyGroups[key] = list.reduce((p, src) => p.then(() => loadScriptOnce(src)), Promise.resolve())
    .catch(e => { delete _lazyGroups[key]; throw e; });
  return _lazyGroups[key];
}
function ensureCoachJs(){ return loadScriptsInOrder(COACH_JS_PARTS); }
function ensureTeacherJs(){ return loadScriptsInOrder(TEACHER_JS_PARTS); }
/* Every ▶ Listening Coach button in generated markup calls this instead of
   coachOpen directly — it's the one entry point that exists before coach.js
   does. Keeps the element, not just its data, so coachOpen sees exactly what
   it always saw. */
function coachOpenLazy(btn){
  ensureCoachJs()
    .then(() => coachOpen(btn))
    .catch(() => { if(typeof gateToast === 'function') gateToast(t('coach.loadFailed')); });
}
/* The header's Games button. It lives HERE, not in coach.js, for the same
   reason as coachOpenLazy: the button exists on every page load and coach.js
   does not. When toggleGames was defined in coach.js, the first click on
   Games threw a ReferenceError — the global safety net put up "Something
   went wrong", and every later click threw silently (the banner shows once),
   so Games looked dead until a reload (2026-09-08). Opening goes through the
   hash router, which loads coach.js and then calls openGamesScreen; closing
   only happens with the screen open, by which point coach.js is loaded.
   checks.mjs 1u fails the push on any other inline handler in index.html
   that reaches into a lazily-loaded script. */
function toggleGames(){
  const screen = document.getElementById('games-screen');
  if (!screen) return;
  if (screen.hasAttribute('hidden')) goExploreHash('games');
  else if (typeof closeGamesScreen === 'function') closeGamesScreen();
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
let _dirtyKeys = new Set();   // which categories need writing: skills · place · responses · completed · classActivities · games · streak · practiceLog · period
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
  return `${av}<span class="user-name" title="${escAttr(user.displayName||user.email)}">${escHtml(user.displayName||user.email)}</span><button class="btn-out notranslate" onclick="signOut()" data-i18n="header.signOut" translate="no">${t('header.signOut')}</button>`;
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
let _signOutReloading = false;   // signOut() reloads itself — the auth listener's signed-out (null) reload stands aside
let _signOutBusy = false;        // a second click during the bounded wait is not a second sign-out
let _authUserSwapped = false;    // another tab signed a different student in — this page is already reloading as them
async function signOut(anyway){
  if(_signOutBusy) return;
  _signOutBusy = true;
  _signOutReloading = true;
  /* A write already in flight empties the dirty set, so flushSave() alone
     would return at once and the reload below would drop it — wait for that
     one first, then flush whatever is left. Bounded (4 s): on a network that
     accepts the connection and then stalls, set() never settles, and Sign
     out must still sign out. See flushBeforeLeaving. "Sign out anyway"
     skips the wait: the student has just been told, and a second silent
     4 s would read as the button not working. */
  const saved = anyway ? false : await flushBeforeLeaving(4000);
  // Someone else signed in during the wait: the auth listener has already
  // reloaded the page, and auth.signOut() now would sign THEM out.
  if(_authUserSwapped) return;
  /* Still not saved when the wait ran out (offline, or a stalled write):
     reloading now would throw that work away without a word. Say so and
     stay signed in — Firestore keeps the write queued and sends it by
     itself on reconnect. "Sign out anyway" is the way out for a shared
     Chromebook that has to move on to the next student. */
  if(!saved && !anyway && currentUser){
    _signOutReloading = false;
    _signOutBusy = false;
    showUnsavedNotice('save.signOutAnyway', () => signOut(true));
    return;
  }
  try { sessionStorage.clear(); } catch(e){}
  try { if(auth) await auth.signOut(); } catch(e){}
  location.reload();
}
/* Is any of the student's work not yet confirmed by Firestore? A category
   still dirty (inside queueSave's 800 ms debounce, waiting out a retry, or
   put back by a failed write) or a write still on the wire (_flushP). */
function hasUnsavedWrites(){
  return _dirtyKeys.size > 0 || !!_flushP;
}
/* Send what is pending now and wait for it, at most `ms` — the shared step
   before anything that reloads the page (Sign out, the error banner's
   Refresh). Resolves true when nothing is left unsaved. Never rejects.
   flushSave() itself keeps every save rule (the failed-load drop, the
   held-back categories); this only decides how long to wait. */
async function flushBeforeLeaving(ms){
  clearTimeout(saveTimer);
  try {
    await withTimeout((async()=>{ if(_flushP) await _flushP; await flushSave(); })(), ms);
  } catch(e){}
  return !hasUnsavedWrites();
}
/* "Not saved yet" with a way out — shown when a sign-out's bounded wait ends
   with work still unsaved. Same look as the safety-net banner at the top of
   this file, but at the TOP of the screen: offline is the usual reason, and
   the offline banner already holds the bottom. */
function showUnsavedNotice(anywayKey, onAnyway){
  const old = document.getElementById('unsaved-notice');
  if(old) old.remove();
  const d = document.createElement('div');
  d.id = 'unsaved-notice';
  d.setAttribute('role', 'alert');
  d.style.cssText = 'position:fixed;left:12px;right:12px;top:12px;z-index:99999;'
    + 'max-width:520px;margin:0 auto;padding:12px 44px 12px 16px;border-radius:12px;'
    + 'background:#514a7d;color:#fff;font:14px/1.45 system-ui,-apple-system,sans-serif;'
    + 'box-shadow:0 6px 24px rgba(0,0,0,.28)';
  const msg = document.createElement('span');
  msg.setAttribute('data-i18n', 'save.notSavedYet');
  msg.textContent = t('save.notSavedYet');
  const go = document.createElement('button');
  go.type = 'button';
  go.setAttribute('data-i18n', anywayKey);
  go.textContent = t(anywayKey);
  go.style.cssText = 'margin-left:8px;padding:3px 12px;border:0;border-radius:14px;'
    + 'background:#fff;color:#514a7d;font-weight:600;cursor:pointer';
  go.onclick = () => { d.remove(); onAnyway(); };
  const close = document.createElement('button');
  close.type = 'button';
  close.setAttribute('data-i18n-attr', 'aria-label:offline.dismiss');
  close.setAttribute('aria-label', t('offline.dismiss'));
  close.textContent = '×';
  close.style.cssText = 'position:absolute;top:8px;right:12px;background:none;border:0;'
    + 'color:#fff;font-size:1.25rem;line-height:1;cursor:pointer';
  close.onclick = () => d.remove();
  d.append(msg, go, close);
  document.body.appendChild(d);
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
/* ?snipcal=1 turns on the backing-track snippet's calibration panel, which is
   how a track's `anchor` (its first downbeat) gets measured — see
   SNIPPET_TRACKS. Deliberately NOT localhost-only, unlike the dev bypass and
   __forceGate: those hand out access, this shows a number. Gating it to
   localhost meant the one measurement the feature still needs could not be
   taken on the deployed site, which is where Jonathan was actually standing
   (2026-09-18). A student cannot reach it without typing the query param. */
/* Read from the hash's query part as well as location.search. This site is
   hash-routed, so the natural thing to type onto a URL that already ends in
   `#class-activities` puts the param in the FRAGMENT, where location.search
   never sees it — which is exactly what happened, and the panel simply never
   appeared (2026-09-18). Both shapes work now:
     …/index.html?snipcal=1#class-activities
     …/index.html#class-activities?snipcal=1
   Captured once at load into window.__snipCal / __snipLat, because the app
   rewrites the hash as the student navigates and a param living there would
   otherwise vanish mid-session. */
function snipUrlParam(name){
  /* Scan the WHOLE href rather than parsing location.search, because every
     way of typing this onto a real URL has now failed once:
       ?snipcal=1                      — the shape that always worked
       #class-activities?snipcal=1     — hash-routed site, search is empty
       ?teacher=true?snipcal=1         — console URL already has a query, so
                                         the second ? makes URLSearchParams
                                         read the value as "true?snipcal=1"
     A delimiter-anchored match accepts all of them, and still won't match a
     longer name that merely ends in this one. */
  const m = new RegExp('[?&#]' + name + '=([^&#]*)').exec(window.location.href || '');
  if(!m) return null;
  // A stray % throws URIError, and this runs at load: keep the raw text.
  try { return decodeURIComponent(m[1]); } catch(e){ return m[1]; }
}
if(snipUrlParam('snipcal') === '1'){
  window.__snipCal = true;
  const raw = snipUrlParam('lat');
  if(raw !== null && raw.trim() !== ''){
    const ms = Number(raw);
    if(isFinite(ms) && ms >= 0) window.__snipLat = ms / 1000;
  }
}
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
/* Was this page load OUR OWN post-deploy reload (service worker, bottom of
   this file)? Then say so. Without this the wall replays "Checking your
   sign-in…" → "Signed in — loading your progress…" exactly as it does after a
   real sign-in, so a routine update reads as the site making you sign in a
   second time — which is what it gets reported as. sessionStorage is per-tab
   and signOut() clears it, so the flag can't leak to another tab or to the
   next student on a shared Chromebook. */
const SW_UPDATE_BOOT = (()=>{
  try{
    if(sessionStorage.getItem('gcSwUpdating') !== '1') return false;
    sessionStorage.removeItem('gcSwUpdating');   // consumed — a later manual reload is not an update
    return true;
  }catch(e){ return false; }
})();
if(SW_UPDATE_BOOT) setAuthWallChecking('auth.updating');

/* ── Back where you were after an update (2026-11-09) ─────────────────────
   The site reloads itself when a new version takes over (bottom of this
   file). A reload used to open the home page — In-Class Activities, or the
   console's Class activities list — whatever the tab had been showing
   ("it reloads back to a different view", Jonathan). So the reload leaves a
   note of where the tab was (swResumeSave), and the next load reads it once
   and opens the same place (showApp here, showTeacherApp in teacher.js).

   What comes back: the page (lesson, In class, Songs, My progress: the
   address keeps those), the lesson or checklist panel of the set, the step
   that was open in it with its Hint / Stuck? folds (the same snapshot a
   language switch keeps: snapshotLessonState), where the page was scrolled,
   and on the console the view, the picked activity or student, its tab and
   the board. What does not: anything the reload already waits for (a
   drill, a recording, an exit check: see busyReason below), text typed
   into a box but not yet saved, and the small states inside a card (a
   search, an In class card's open step or TAB page, the board's sort) and
   In class's two folds ("Completed activities" opens closed again; the
   scroll then goes as far down as the shorter page reaches).

   The person wins: the next load is slow (the new version's files are
   still arriving), and anything they click, type or scroll before the
   restore lands cancels the rest of it (swResumeWatch).

   The note is only ever used by the load it was written for:
     - it is read and deleted while this file runs, on every load, and is
       dropped unless that load is the update's own reload (SW_UPDATE_BOOT);
     - it names the account, and the first sign-in of the load takes it, so
       the next student on a shared Chromebook can never open someone
       else's place (signOut() also clears sessionStorage);
     - it is per tab (sessionStorage) and goes stale after 10 minutes.
   It sets nothing a student could not reach by clicking: the set and module
   still come from the saved progress, and the activity gate still runs. */
const SW_RESUME_KEY = 'gcSwResume';
let swResumeNote = (()=>{
  try{
    const raw = sessionStorage.getItem(SW_RESUME_KEY);
    sessionStorage.removeItem(SW_RESUME_KEY);
    if(!SW_UPDATE_BOOT || !raw) return null;
    const v = JSON.parse(raw);
    return (v && typeof v === 'object' && typeof v.uid === 'string' && Date.now() - v.at < 10 * 60 * 1000) ? v : null;
  }catch(e){ return null; }
})();
/* The note for this sign-in, or null. One use: whoever signs in first after
   the reload takes it, and it only fits the same account on the same kind of
   page (the site or the ?teacher console). */
function swResumeTake(user, teacher){
  const v = swResumeNote;
  swResumeNote = null;
  if(!v || !user || v.uid !== user.uid || !!v.teacher !== !!teacher) return null;
  const part = teacher ? v.t : v.s;
  return (part && typeof part === 'object') ? part : null;
}
/* True only while showApp routes the address a note is about to put back
   (2026-11-12): the page that opens leaves the scroll to swResumeApply
   (caFocusActivity skips its scroll to the card). */
let swResumeRouting = false;
function swResumeSave(){
  try{
    // Nobody signed in, or the app is not on screen (the sign-in wall, a paused account): nothing to come back to.
    if(!currentUser || accountPaused) return;
    const note = { at: Date.now(), uid: currentUser.uid, teacher: IS_TEACHER_MODE };
    if(IS_TEACHER_MODE){
      if(typeof teacherResumeSnapshot !== 'function') return;
      note.t = teacherResumeSnapshot();
    } else {
      if(document.getElementById('app').style.display !== 'block') return;
      const panel = activeWeekPanel();
      // A locked set opened to preview is never restored (activateSet: a peek leaves nothing behind).
      const peek = !!(panel && panel.classList.contains('set-peek'));
      // The row being read (null while an in-column page has the lesson swapped out: practiceScrollTop has its place).
      const anchor = (panel && !peek) ? lessonScrollAnchor() : null;
      note.s = {
        hash: location.hash,
        set: (panel && !peek) ? panel.dataset.id : null,
        checklist: !!(panel && !peek && panel.classList.contains('on-checklist')),
        lesson: (panel && !peek) ? snapshotLessonState(panel) : null,
        key: (anchor && anchor.key) || null,
        top: anchor ? Math.round(anchor.top) || 0 : 0,
        y: Math.round(paneScrollTop()) || 0,
        py: Math.round(practiceScrollTop) || 0
      };
    }
    sessionStorage.setItem(SW_RESUME_KEY, JSON.stringify(note));
  }catch(e){ /* storage blocked or full: the reload still happens, onto the home page as before */ }
}
/* Did the person do anything since the reload? One watcher per restore,
   started before any waiting: a click, a key, a wheel or a touch means they
   have moved on, and the restore stops there. off() removes the listeners;
   it runs on the first event and when the restore finishes. */
function swResumeWatch(){
  const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  const w = { touched: false, off(){ evs.forEach(ev => window.removeEventListener(ev, on, true)); } };
  function on(){ w.touched = true; w.off(); }
  evs.forEach(ev => window.addEventListener(ev, on, { passive: true, capture: true }));
  return w;
}
/* Put a scroll position back. The page is still filling in when this runs
   (module files, Songs and My progress wait for every module, the console
   waits for its roster), and a page that is still short clamps the scroll.
   So: look every 250 ms for up to 8 s, set the position whenever the page is
   tall enough and is not already there (or, once the page has stopped
   growing, as far down as it reaches), and stop for good the moment the
   person touches the page, moves it themselves, or the address changes
   (hash: the address this position belongs to; null on the console). getPane and target are read fresh each time
   (scrollPane() changes with the page height; target() returns the wanted
   scrollTop, or null for "not yet"). */
const SW_RESUME_SCROLL_MS = 8000;
function swResumeScroll(getPane, target, w, hash){
  const t0 = Date.now();
  // What this loop last set, and how tall the page was then; and how long the page has been the same height.
  let setTo = null, setAtHeight = 0, lastHeight = -1, steadySince = t0;
  const tick = () => {
    if(w.touched) return;
    // Another page now (the browser's Back button fires no click or key): this position belongs to the page that was left.
    if(hash != null && location.hash !== hash){ w.off(); return; }
    const late = Date.now() - t0 > SW_RESUME_SCROLL_MS;
    try {
      const pane = getPane();
      const el = pane === window ? document.scrollingElement : pane;
      const y = target();
      if(el && y != null && y > 0){
        const cur = pane === window ? window.scrollY : pane.scrollTop;
        const max = el.scrollHeight - el.clientHeight;
        if(el.scrollHeight !== lastHeight){ lastHeight = el.scrollHeight; steadySince = Date.now(); }
        /* The position moved off what was set here while the page stayed the
           same height: the person moved it some way this watcher cannot see
           (dragging the window's scrollbar fires no pointer event). Theirs. */
        if(setTo != null && el.scrollHeight === setAtHeight && Math.abs(cur - setTo) > 2){ w.off(); return; }
        /* Reachable: go there. Not reachable and the page has stopped growing
           for a second (or time is up): the page came back shorter (a fold
           that is closed again), so go as far as it reaches. */
        const to = max >= y - 1 ? y : ((late || Date.now() - steadySince >= 1000) ? Math.max(0, max) : null);
        if(to != null && Math.abs(cur - to) > 2){ pane.scrollTo({ top: to }); setTo = to; setAtHeight = el.scrollHeight; }
        else if(to != null && setTo == null){ setTo = cur; setAtHeight = el.scrollHeight; }
      }
    } catch(e) { /* pane gone: leave the page where it is */ }
    if(late){ w.off(); return; }
    setTimeout(tick, 250);
  };
  tick();
}
/* The lesson snapshot as it came back from storage: the three lists
   restoreLessonState reads, strings only, or null. */
function swResumeLessonSnap(v){
  if(!v || typeof v !== 'object') return null;
  const strs = a => Array.isArray(a) ? a.filter(x => typeof x === 'string') : [];
  return { open: strs(v.open), folds: strs(v.folds), tabs: strs(v.tabs), pdSeen: v.pdSeen === true, pdShowing: v.pdShowing === true };
}
/* The student half. Runs after showApp has drawn the saved set and routed
   the address, once the module's panels exist (renderAll → onModuleChange is
   async: it may still be fetching the module file). */
function swResumeApply(s){
  const w = swResumeWatch();
  const y = Number(s.y) || 0, py = Number(s.py) || 0, top = Number(s.top) || 0;
  // They clicked or scrolled while something was loading, or went to another page: leave everything as they have it.
  const gone = () => w.touched || location.hash !== s.hash;
  const sameSet = panel => !!panel && typeof s.set === 'string' && panel.dataset.id === s.set;
  (async () => {
    await _bootModuleChange;
    if(gone()){ w.off(); return; }
    let panel = activeWeekPanel();
    /* No set on screen: the module file did not arrive (onModuleChange said
       so in a toast). A bare address would leave an empty lesson pane, so
       open the home page, which needs no module, as a normal visit would. */
    if(!panel && !location.hash){ w.off(); goExploreHash('class-activities'); return; }
    /* Their own set came up as a locked preview. At boot that can be a wrong
       guess: the gate holds while the module BEFORE this one has not loaded
       (isModuleGateLocked), and the catch-up in renderAll corrects it once
       every module is in. Wait for that, once, before giving up on the set. */
    if(sameSet(panel) && panel.classList.contains('set-peek') && _bootCatchUp){
      try { await _bootCatchUp; } catch(e) { /* a module failed to load: the set stays a preview */ }
      if(gone()){ w.off(); return; }
      panel = activeWeekPanel();
    }
    // A different set came back (the saved place moved, or the set really is locked now): the lesson opens at its top.
    const lessonBack = sameSet(panel) && !panel.classList.contains('set-peek');
    if(lessonBack){
      const snap = swResumeLessonSnap(s.lesson);
      // One-at-a-time view shows one step: a note written in list view (the pref was flipped in another tab) keeps its first.
      if(snap && panel.querySelector('.dp.focus')) snap.open = snap.open.slice(0, 1);
      restoreLessonState(panel, snap);
      if(s.checklist === true && document.getElementById(`${s.set}-checklist`)) switchTabById(s.set, 'checklist', true);
    }
    /* An in-column page (In class, Songs, My progress) has swapped the lesson
       out: y is that page's scroll and does not depend on the set behind it;
       py is the lesson's place for the way back (syncExploreNav puts
       practiceScrollTop back when the page closes). */
    if(document.body.classList.contains('explore-open')){
      if(lessonBack) practiceScrollTop = py;
      swResumeScroll(scrollPane, () => y, w, s.hash);
      return;
    }
    if(!lessonBack){ w.off(); return; }
    /* The lesson itself: by the row that was being read, not by scrollTop
       (restoreLessonScroll's rule: the same scrollTop lands somewhere else
       when the rows above are a different height). Falls back to y. */
    const key = typeof s.key === 'string' ? s.key : null;
    swResumeScroll(scrollPane, () => {
      const tp = key && document.querySelector('#week-panels .week-panel.active .tab-panel.active');
      const li = tp ? [...tp.querySelectorAll('li.step')].find(x => x.dataset.key === key) : null;
      if(!li || !li.getClientRects().length) return y;
      return paneScrollTop() + li.getBoundingClientRect().top - top;
    }, w, s.hash);
  })().catch(() => { w.off(); /* never let a restore break the page it is restoring */ });
}

let _authRevealTimer = firebaseReady ? setTimeout(revealAuthWallSignIn, 6000) : null;
if(!firebaseReady) revealAuthWallSignIn();   // wall content is being replaced anyway — don't strand the checking note

/* Sign-in is started at the very END of this script (see the last lines of the file), not here: its callback
   uses functions from the whole file (loadProgress, showApp, ensureTeacherJs…), and once the file is cut into
   parts that load one after another, a session Firebase restores quickly could call back before the later
   parts have run. Moved 2026-11-11; nothing between here and the end of the file depends on it. */

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
  if(window.PM) PM.syncHeader(false);   // a paused student has no My progress to open
}

function showApp(user){
  document.getElementById('auth-wall').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('fab-group').style.display='flex';
  document.getElementById('search-btn').style.display='flex';
  document.getElementById('user-area').innerHTML=userHeaderHtml(user);
  if(window.PM) PM.syncHeader(true);   // practice minutes in the top bar (uiOn, a student, not the console)
  renderAll();
  applyGamesAccess();
  // The activity gate (see caBlockers/applyActivityGate) — computed before
  // the landing-hash decision below, since a gated student's bookmarked hash
  // has to be overridden by it.
  applyActivityGate();
  // In-Class Activities is the home page (Today-first work order, Phase 1): a fresh or
  // bookmarked-bare visit lands there. A hash that's already present — an
  // explore page, or one this router doesn't own — is left for
  // routeExploreHash to resolve, same as always.
  // A student with a pending activity lands there whatever the hash says —
  // the "pops up on login" half of the activity gate, kept when the lock
  // itself was switched off (CA_GATE_LOCKS, 2026-10-07).
  // Except a student coming BACK from a Song Journey page ("Back to class
  // site" when the tab can't just close): that link names the card they came
  // from, and sending them somewhere else is the opposite of "back".
  // Honoured ONCE per page load: document.referrer never changes, so on a
  // shared Chromebook a sign-out and the next student's sign-in in the same
  // tab (showApp runs per sign-in) would otherwise inherit the exemption.
  let fromJourney = false;
  if(!journeyReturnSeen){
    journeyReturnSeen = true;
    try { const r = new URL(document.referrer); fromJourney = r.origin === location.origin && /\/tabs\/[^/]+\.html$/.test(r.pathname); } catch(e) {}
  }
  /* Except the site's own reload for an update (swResumeTake, 2026-11-09):
     that is not a visit or a sign-in, so the student stays on the page they
     were on, the lesson included (a bare address). The address is the same
     one the note recorded, or the note is ignored. With the gate's lock on,
     routeExploreHash below still sends a gated student to In-Class
     Activities. */
  let resume = swResumeTake(user, false);
  if(resume && resume.hash !== location.hash) resume = null;
  if(!resume && (!location.hash ||
     (caBlockers().length > 0 && !fromJourney && !GATE_OPEN_HASHES.includes(exploreHashBase(location.hash))))){
    goExploreHash('class-activities');
  }
  swResumeRouting = !!resume;
  try { routeExploreHash(); } finally { swResumeRouting = false; }
  if(resume) swResumeApply(resume);
  // The period question blocks the whole app, so it still gets first crack
  // at the screen on sign-in.
  maybeShowPeriodPicker();
  // One long-lived listener on the live-quiz session doc, so a game the
  // teacher starts mid-period reaches a student who's had the site open all
  // along. Guarded: live-quiz.js is a separate deferred script.
  if(typeof lqStartListening === 'function') lqStartListening();
}

/* Set by showApp the first time it looks at document.referrer — see fromJourney. */
let journeyReturnSeen = false;

