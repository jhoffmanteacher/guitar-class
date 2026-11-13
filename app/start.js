/* ════════════════════════════════════════════════
   Service worker — light PWA / offline resilience.
   Registers on any http(s) origin (incl. Live Server's
   http://localhost and the live GitHub Pages site); skipped
   when the file is opened directly via file://. See sw.js + CLAUDE.md.
   ════════════════════════════════════════════════ */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  /* Was this page already controlled by a service worker when it loaded?
     If so, a new worker taking over means a NEW version is live (see sw.js:
     install→skipWaiting→activate→clients.claim on every push). The cached
     shell that already loaded is now stale, so reload ONCE to pick up the
     fresh code automatically — no more reloading two or three times after a
     deploy, and returning students stop sitting on old code. A page that
     came straight from the network (a first-ever visit, or a second tab
     opened while the first worker was still installing) must NOT reload:
     it already is the current version, and that would bounce the load.

     "Controlled when it loaded" is read from the navigation's own timing,
     not only from navigator.serviceWorker.controller (review R2-2): the
     first worker can claim a page that is still waiting on its scripts, so
     by the time this line runs there IS a controller, though no worker
     served the page. workerStart is 0 when no worker handled the
     navigation. Where the browser has no such entry, the controller alone
     decides, as before.

     Read NOW, while this file runs, and both listeners attached now too
     (2026-11-09): sw.js installs only the shell before it takes over, so
     the takeover can come a second or two after the page opens. Wired from
     the window "load" event, as this used to be, a takeover that beat the
     event (it waits for the Firebase scripts and every image) was missed
     and the tab stayed on the old page with the new cache behind it.
     Two signals, one reload: "controllerchange", and the "gc-sw-activated"
     message sw.js posts at the end of activate. The browser holds a
     message for a page that is still loading, so that one is heard even
     when the takeover came before this line ran. */
  const navTiming = (typeof performance !== 'undefined' && performance.getEntriesByType) ? performance.getEntriesByType('navigation')[0] : null;
  const hadController = !!navigator.serviceWorker.controller && !(navTiming && navTiming.workerStart === 0);
  /* Ask the worker for the files its install left for later (sw.js,
     precacheRest). Sent once the page has loaded, so those downloads don't
     compete with the page's own start-up. Harmless to send twice, and an
     older worker simply ignores it. */
  const askForRest = () => {
    try { if (navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({ type: 'gc-precache-rest' }); }
    catch(e) { /* best-effort: the fetch handler caches each file on first use anyway */ }
  };
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {/* offline support is best-effort */});
    askForRest();
  });
  /* ...and again when the connection or the tab comes back (review R1-6): a
     lid closed mid-fill fails the downloads in flight, and a tab that stays
     open all day has no second "load". Once the cache is complete this
     costs the worker one lookup per file and no request. */
  window.addEventListener('online', askForRest);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) askForRest(); });
  {
    const onNewWorker = () => {
      // A first visit: the worker just took control for the first time. No
      // reload, but it has only the shell so far.
      if (!hadController) { if (document.readyState === 'complete') askForRest(); else window.addEventListener('load', askForRest, { once: true }); return; }
      if (window.__swReloading) return;
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
        // Mid-sign-in. __authPopupPending (checked separately, and unbounded)
        // only covers the Google popup itself; this covers the Firestore boot
        // that follows it, which is the part that looks like a second sign-in
        // when a reload lands in it. See onAuthStateChanged.
        if (window.__authBootPending) return 'auth';
        if (window.coachMicLive) return 'mic';
        if (anyValue(recState, s => s.starting || s.recording)) return 'recording';
        // Mid-round in a Shuffle ('play') / Deck or Ear ('run') drill: the
        // round's score is only written when it finishes.
        if (anyValue(shuffleDrills, s => s.phase === 'play')) return 'drill';
        if (anyValue(deckDrills,    s => s.phase === 'run'))  return 'drill';
        if (anyValue(earDrills,     s => s.phase === 'run'))  return 'drill';
        // An exit check part-way through: its picks are in memory only until
        // the last question, and a one-try check restarted by a reload would
        // hand the student a second go (or lose the first). Still bounded by
        // SW_RELOAD_MAX_WAIT, like the drills, if one is abandoned open.
        if (Object.keys(ecRuns).length) return 'check';
        // A Note Call round in progress (ncLive): its score is only written
        // when the round ends, and a reload drops it mid-level.
        if (ncLive) return 'drill';
        if (chcLive) return 'drill';
        // A practice card counting in or playing (pcState is set from pcStart
        // until pcStop): a reload cuts the song off mid-line and drops the
        // card's speed / Guitar / Metronome switches.
        if (pcState) return 'playing';
        return null;
      };
      /* While this tab waits, the new worker holds only the shell. Ask it for
         the rest now, once, so that whenever the reload does come (up to 5
         minutes later, maybe with the Wi-Fi gone) the page it loads is all
         in the cache (review R1-1). A tab that reloads at once asks from
         its next "load" instead, after its own start-up requests. */
      let askedWhileWaiting = false;
      const waitMore = () => { if (!askedWhileWaiting) { askedWhileWaiting = true; askForRest(); } setTimeout(reload, 1500); };
      const reload = async () => {
        if (window.__authPopupPending) { waitMore(); return; }
        if (busyReason() && Date.now() - startedWaiting < SW_RELOAD_MAX_WAIT) { waitMore(); return; }
        /* A step marked done half a second ago is still inside queueSave's
           800 ms debounce (or its retry backoff) and would simply vanish —
           pagehide's flush is a Firestore write started during unload and is
           not reliably delivered. Send it now, then reload either way: one
           real attempt beats waiting on a save that may never succeed. */
        if (_dirtyKeys.size || saveTimer) {
          clearTimeout(saveTimer);
          try { await flushSave(); } catch(e){ /* reload regardless — nothing better is available */ }
        }
        /* Tell the next load this refresh was the site updating itself, so the
           wall says "Updating…" rather than walking the student back through
           the sign-in screens it shows after a real sign-in. */
        try { sessionStorage.setItem('gcSwUpdating', '1'); } catch(e) { /* storage blocked — reload anyway, just without the message */ }
        /* ...and where this tab was, so the next load can open the same
           page instead of the home page (swResumeSave, near SW_UPDATE_BOOT). */
        swResumeSave();
        location.reload();
      };
      reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onNewWorker);
    /* No guard on the message. The worker posts it once, as it takes over,
       to the pages open at that moment; the page this reload produces is not
       one of them (its request waits for the takeover to finish). A "quiet
       window" on the reloaded page was tried and removed (review R1-4): it
       could swallow the only signal of a second deploy that took over
       before this file ran. The worst case without it is one extra reload,
       never a loop. */
    navigator.serviceWorker.addEventListener('message', e => { if (e.data && e.data.type === 'gc-sw-activated') onNewWorker(); });
  }
}

/* ── The hash router listens from here on: every function it calls is defined by now ──
   pushState/go() traversals fire popstate, not hashchange — listen for both (the lastRoutedHash guard in
   routeExploreHash absorbs the browsers that fire both). */
window.addEventListener('hashchange', routeExploreHash);
window.addEventListener('popstate', routeExploreHash);

/* The access screen (app/boot.js showAccessScreen) checks again when the tab
   comes back, at most once every 30 s: "Check back later" without a timer. */
document.addEventListener('visibilitychange', () => { if(!document.hidden && accessLocked) accessRecheck(false); });

/* ── The practice-card player's keys (KEYS in app/cards.js): one keydown listener, the two that note which
   card the student last touched or tabbed into, and the pointerup that lets go of the focus a mouse or touch
   press left on a card control. Registered after audio-ui.js's role="button" Space handler, so a Space that
   handler took arrives here already cancelled. For the page's life, like the site's other keys. */
document.addEventListener('keydown', pcKeydown);
document.addEventListener('pointerdown', pcKeyNote, { capture: true, passive: true });
document.addEventListener('focusin', pcKeyNote);
document.addEventListener('pointerup', pcKeyPointerUp, { capture: true, passive: true });

/* ── Start sign-in: the LAST statement of the app script ──
   Everything above is defined by now, so the callback can use any of it. See the note where this used to be
   (above "Back where you were"). Keep it last: a statement added after it would be code the callback cannot
   count on. */
if(auth) auth.onAuthStateChanged(async user=>{
  clearTimeout(_authRevealTimer);
  if(user){
    /* A DIFFERENT student, with no signed-out answer in between (Firebase
       reports B straight over A — another tab's sign-in on a shared
       Chromebook). Everything the null branch below guards against applies
       here too, plus a pending save of A's that would now go out under B's
       uid. Same hard reset, same loop guard: after the reload currentUser
       starts null. Leave currentUser alone so no flush can write A's work
       into B's doc.
       This reloads even while signOut() is running. It used to stand aside
       ("signOut reloads itself"), but signOut() no longer always does: when
       its wait runs out unsaved it stays on A's screen with the "not saved"
       notice — now with Firebase signed in as B, every later save of A's
       refused under B's credentials, and "Sign out anyway" signing B out.
       A's queued work can't be sent under B either way. _authUserSwapped
       stops that signOut(), once its wait ends, from signing B out of every
       tab in the moment before this page goes. */
    if(currentUser && !isDevBypassUser() && currentUser.uid !== user.uid){
      _authUserSwapped = true;
      try { sessionStorage.clear(); } catch(e){}
      location.reload();
      return;
    }
    currentUser = user;
    // They're in — but showApp() is still two Firestore round trips away.
    // Take BOTH sign-in buttons off the screen NOW, before the awaits below,
    // or the student spends that whole wait looking at a sign-in page they
    // just came back from and signs in a second time. See setAuthWallChecking().
    // The header goes straight to the real user header rather than blank: their
    // own name appearing is the clearest possible "it worked, stop clicking",
    // and it's the same markup showApp()/showTeacherApp() is about to write.
    /* The sign-in is NOT over when the popup closes. __authPopupPending clears
       the instant signInWithPopup resolves, but showApp() is still a ~100 KB
       Firestore SDK download and two reads away — 5-15 s on school Wi-Fi, and
       a new service worker takes over inside that time (a few seconds since
       the shell-first install of 2026-11-09; it used to be 5-15 s itself).
       A post-deploy reload landing in that window throws the finished sign-in
       away and replays the whole sequence: the "it signed me in twice" report.
       The reload at the bottom of this file waits on this flag, bounded by its
       own 5-minute cap so a Firestore read that never returns still can't pin
       a tab to the old build for the rest of the day. */
    window.__authBootPending = true;
    setAuthWallChecking(SW_UPDATE_BOOT ? 'auth.updating' : 'auth.loading');
    document.getElementById('user-area').innerHTML = userHeaderHtml(user);
    if(window.PM) PM.syncHeader(false);   // hidden until showApp: no app behind it yet, and never on the teacher console
    startAuthStallTimer();   // ...but don't strand them there if the load never finishes
    try{
      if(IS_TEACHER_MODE){ await ensureTeacherJs(); showTeacherApp(user); clearAuthStallTimer(); }
      else {
        await loadProgress(); caAdoptLocalTicks(); await loadClassConfig();
        clearAuthStallTimer();   // cleared here, not inside showApp/showPausedScreen, so every exit from the wait is covered
        /* An account the rules refused (not @seq.org, not allowed by the
           teacher): the access screen instead of the site. Decided from the
           two reads above, no read of its own (accessRefusedAtBoot in
           app/boot.js). */
        if(accessRefusedAtBoot(user)) showAccessScreen(user);
        else if(accountPaused) showPausedScreen(user); else showApp(user);
      }
    } finally {
      // finally, not after the branch: a throw in there must not leave the flag
      // set, or the tab would sit on old code until the 5-minute cap expires.
      window.__authBootPending = false;
    }
  } else {
    /* Signed out from ANOTHER tab (or the session ended under us) while this
       one was showing a student. The resets below don't reach the built
       #week-panels DOM (_modulesRendered keeps it), so the next student to
       sign in on this tab would see — and, through toggleStepDone /
       saveReflection reading that DOM, save into their own doc — the last
       student's ticks and typed answers. Same hard reset signOut() does.
       Can't loop: after the reload currentUser starts null. signOut()'s own
       path skips this (it reloads itself), and so does the dev bypass, which
       never signed in to Firebase. */
    if(currentUser && !isDevBypassUser() && !_signOutReloading){
      try { sessionStorage.clear(); } catch(e){}
      location.reload();
      return;
    }
    window.__authBootPending = false;
    currentUser = null; progress = {}; responses = {}; completed = {}; completedDeletes = new Map(); classActivities = {}; classActivitiesDeletes = new Map(); caStepDone = {}; caStepDeletes = new Map(); exitChecks = {}; games = {}; streak = { count:0, lastDay:null }; gamesAccessOn = true; micSampling = { on: false, max: 0 }; micTakesCount = Infinity; studentPeriod = ''; periodOverride = ''; moduleOpenThrough = 0; hiddenActivityIds = {}; activityForMe = {}; activityDates = {}; activityTitles = {}; activityNumbers = {}; activityBoard = {}; activityBoardOn = false; activityClears = {}; retiredActivityIds = {}; optionalActivityIds = {}; activityPins = []; songLibraryIds = {}; classSongIds = {}; progressLoadFailed = false;
    document.body.classList.remove('ca-gated');   // next sign-in recomputes it fresh — don't leave a stale gate showing over the sign-in wall
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
    if(window.PM) PM.syncHeader(false);   // signed out: the practice-minutes strip goes with the student
  }
});
