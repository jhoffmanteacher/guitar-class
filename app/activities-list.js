/* ════════════════════════════════════════════════════════════════════
   app/activities-list.js — In-Class Activities, the list and its gate: the
   activity gate (caBlockers, applyActivityGate, CA_GATE_LOCKS), the
   tab-return re-check (classConfigSignature, its visibilitychange handler,
   flushOnHide), renderClassActivities and its folds, "Unfinished
   activities" and "Since your last visit" (caSince*). Split off
   app/activities-2.js on 2026-11-25 (Jonathan: "split files that are
   long"; activities-2.js was 2,019 lines, over the 2,000 checks.mjs 1cv
   warns at), its last three banner sections moved whole and unchanged;
   loaded right after app/activities-2.js (index.html, site-parts:app.js).
   At load this part reads caTodayStr (app/activities-2.js, loaded first);
   nothing app/activities-2.js runs at load uses a name defined here. Its
   calls into this part (renderClassActivities, caSinceRepaint) run from a
   click, a toggle or an event handler, after both parts have loaded.
   ════════════════════════════════════════════════════════════════════ */
/* ── The activity gate (Today-first work order, Phase 1, approved by
   Jonathan 2026-09-11) ──
   A visible, undone, uncleared activity — any kind, checks included — blocks
   the rest of the site: body.ca-gated is the single on/off switch, and the
   CSS it drives (styles.css) hides everything but In-Class Activities and
   Live quiz. Never
   lock on a guess, same rule as the sequential set gate: a teacher/dev
   preview and a failed progress load both read as "nothing blocking".
   An activity the teacher marked Optional (optionalActivityIds) is visible
   but never a blocker — mirrored in teacherBlockersFor (teacher.js) and
   journeyBlockers (tabs/journey.js).

   CAS students: EVERY activity is optional (Jonathan, 2026-09-22). They
   still see every card, tagged Optional, but nothing on In-Class Activities
   ever locks them out of the modules. Effective period = the teacher's
   correction || the student's own answer, the same rule as everywhere else
   (see studentPeriod). Same three places must agree: caIsOptional here,
   teacherBlockersFor, journeyBlockers. */
function caStudentIsCAS(){ return (periodOverride || studentPeriod) === 'CAS'; }
// Despite the name and its single per-activity argument, this is NOT just
// "did the teacher mark this one Optional" — it also folds in the CURRENT
// student's CAS status (ambient, via caStudentIsCAS()). A caller that wants
// only the teacher's per-activity flag needs optionalActivityIds[a.id] directly.
/* Optional by default (Jonathan, 2026-10-14): an activity whose data says
   `optional: true` (ca-34), or one given to individual students from the
   board's "Who" picker, is Optional until the teacher switches it to
   Required — which the console stores as an explicit false. Absent = the
   default. Mirrored by teacherActivityOptional (teacher.js) and
   journeyOptional (tabs/journey.js). */
function caOptionalByDefault(a){ return a.optional === true || Object.prototype.hasOwnProperty.call(activityForMe, a.id); }
function caIsOptional(a){
  if(caStudentIsCAS()) return true;
  const f = optionalActivityIds[a.id];
  return f === true || (f !== false && caOptionalByDefault(a));
}
function caBlockers(){
  if(isGatePreviewer() || progressLoadFailed) return [];
  const clears = (activityClears || {})[currentUser && currentUser.uid] || {};
  return (window.CLASS_ACTIVITIES || []).filter(a =>
    caIsVisible(a) && !caIsOptional(a) && classActivities[a.id] !== true && clears[a.id] !== true);
}
/* Manual test hook, localhost only: dev bypass IS a gate previewer
   (isGatePreviewer), so it's the one account that can never see its own
   gate — window.__forceGate lets a local session (or a driving script)
   force it on anyway to walk the gated UI. Never honored off localhost. */
/* The lock is switched off, not deleted (Jonathan, 2026-10-07: "stop
   locking the other parts of site if class activities aren't cleared").
   Pending activities no longer hide the rail, Songs, Games or the modules;
   a student with one pending still LANDS on In-Class Activities at sign-in
   (showApp). Flip this back to true to restore the lock exactly as it was —
   caBlockers(), the CSS and the redirects below are all still here. Mirrored
   by JOURNEY_GATE_LOCKS in tabs/journey.js. */
const CA_GATE_LOCKS = false;
function applyActivityGate(){
  const forced = IS_LOCALHOST && window.__forceGate;
  const wasOn = document.body.classList.contains('ca-gated');
  const on = forced || (CA_GATE_LOCKS && caBlockers().length > 0);
  document.body.classList.toggle('ca-gated', on);
  /* Off → on while the student is somewhere else (a new activity went live
     under an open Games/Songs/My progress screen — the visibilitychange
     re-check below is the usual path): the CSS hides the rail, but an
     already-open screen stays open, so walk them to In-Class Activities the same way
     routeExploreHash does for a typed hash. showApp()'s own first call
     lands here too, harmlessly — it's about to route the landing hash
     itself, and goExploreHash is a no-op when the hash already matches. */
  if(on && !wasOn && appIsOnScreen()){
    const h = exploreHashBase(location.hash);
    if(!GATE_OPEN_HASHES.includes(h)){
      if(h) gateToast(t('gate.activityFirst'));   // a bare hash is the practice view — no "wrong page" to name
      goExploreHash('class-activities');
    }
  }
}
// The redirect above must not fire from loadClassConfig()'s boot-time run —
// that lands before showApp() has rendered anything to route within; showApp
// does its own landing-hash pass right after. Only a live app gets walked.
function appIsOnScreen(){
  const app = document.getElementById('app');
  return !!app && app.style.display === 'block';
}
/* A teacher's console clear (or a new activity going live) has to reach a
   student tab that's just sitting open, not only the next reload — same
   visibilitychange re-check live-quiz.js's invite uses, and the same reason:
   nobody is staring at the site when the teacher clears someone, so the
   first chance to notice is the tab coming back to the foreground. */
/* A cheap snapshot of the fields loadClassConfig() can change, so the
   visibilitychange handler below can tell "nothing moved" from "something
   moved" and only pay for a full re-render in the second case. Before this
   (2026-09-26), every tab return rebuilt the whole open In-Class Activities
   screen unconditionally — resetting any revealDelay tab to blank, any paged
   tab to page 1, and any paused tab-player position, even when the config
   read came back byte-identical to what was already showing. */
function classConfigSignature(){
  return JSON.stringify([activityDates, activityBoard, activityBoardOn, hiddenActivityIds, activityForMe,
    retiredActivityIds, activityClears, optionalActivityIds, playAlongActivityIds, keepTodayActivityIds, activityPins, activityTitles,
    activityNumbers, periodOverride, moduleOpenThrough,
    songLibraryIds, classSongIds,   // a Move to Songs / Move to Class activities changes which cards show
    gamesAccessOn]);   // the free-play hero's Games button follows it
}
/* The local day this page last brought In-Class Activities and the search
   index up to date (its load, then each tab return). "Today" is read only at
   render time (caTodayStr: the release-date gate and Today's activities), so
   a tab left open overnight came back to an unchanged signature and kept
   yesterday's Today, missing a card dated for the new day, until a reload. A
   new day now counts as a change on the next tab return. Not inside
   classConfigSignature(): `before` is taken after midnight too. A tab that
   stays visible across midnight catches up at its next tab return. */
let caSeenDay = caTodayStr();
document.addEventListener('visibilitychange', () => {
  /* The snippet loop is closed by rAF (snipTick), and rAF stops firing in a
     hidden tab while an <audio> element keeps playing — so a backgrounded tab
     abandons the 4-bar window and plays the whole 4-minute track. On a
     Chromebook that is just switching tabs to look something up. Stop the
     band when the tab goes away; the student presses Play again.
     A Note Call round too: its clock keeps running while the tab is hidden,
     and on return it plays every missed note at once (a play-along steps
     its tempo up 8 notes at a time; a scored level marks each one a miss).
     coach.js's own handler stops it only when coach.js has loaded, and the
     default tap mode never loads it.
     One exception, in the teacher console only: a WHOLE-SONG card playing for
     the room (ca-40) keeps playing when Jonathan switches the projector's tab
     to his slides (code-hygiene rule 4). What a hidden tab does to it, since
     no rAF runs there: it plays on to the end of the FILE, not the card's
     window (1-13 s past it on ca-24..ca-40), and the card stops itself when
     the tab is shown again; the Metronome click stops (pcScheduleClick runs
     in the frame loop); hidden during the count-in, the song can come in
     about a second late (timers are throttled). A looping card or a snippet
     needs rAF to loop, so those still stop, there too; a student tab stops
     all. */
  if(document.hidden){
    snipStop();
    if(!(IS_TEACHER_MODE && pcState && pcState.wholeSong)) pcStop();
    if(typeof ncStopAll === 'function') ncStopAll();
    if(typeof chcStopAll === 'function') chcStopAll();
    if(typeof echoStopAll === 'function') echoStopAll();
    if(typeof spotStopAll === 'function') spotStopAll();
    if(typeof pcRecStopAll === 'function') pcRecStopAll();   // a practice card's take playing back (Play mine); a take being recorded stops with pcStop above
    /* Name the power chord is not stopped here (Jonathan, 2026-11-09): it has no
       clock, no sound and no mic, so a student who looks something up in another
       tab comes back to the same card and score. A hit's move-on timer just fires.
       A Card Deck round is the same kind (no clock, sound or mic) and is left as is.
       An Ear Spark round's queued notes stop (they would play to a hidden tab); the
       round stays dealt, and its Play again button plays them from the start. */
    if(typeof erStopAll === 'function') erStopAll();
    /* A student's tab also stops what plays or counts with nobody there (2026-11-25): a Play tab line (a hidden tab
       lags its timeouts, and its Stop button is out of reach), a Shuffle round's countdown (back to Start, as on every
       other way out), and a Module Review take in progress (stopped, the mic released, the take thrown away, as when
       the student leaves the review). The console keeps them: the room may still be listening (code-hygiene rule 4). */
    if(!IS_TEACHER_MODE){
      if(typeof stopPlaySeq === 'function') stopPlaySeq();
      if(typeof sdAbortAll === 'function') sdAbortAll();
      if(typeof stopAnyRec === 'function') stopAnyRec({ discard: true });
    }
    flushOnHide();
    return;
  }
  if(!currentUser || IS_TEACHER_MODE || accessLocked) return;   // accessLocked: the access screen, not the app (app/boot.js)
  const before = classConfigSignature();
  loadClassConfig().then(() => {
    const today = caTodayStr(), newDay = today !== caSeenDay;
    caSeenDay = today;
    const moved = classConfigSignature() !== before;
    if(!moved && !newDay) return;
    /* A card is open (a new day, or since 2026-11-26 a class settings change too: a date, the board, an archive, a
       pin, Open through): the redraw would stop the song the student pressed as the tab came back, reset the card's
       drill round, and rebuild a Focus step or a half-taken exit check. It waits for the card to close
       (caSinceRepaint: caCloseOpen, and caOnToggle for a card closed by its title, render then; so does any full
       render the student causes first, a Focus step tap included, caRedrawOpenCard) or for the student to come back
       to the page (openClassActivitiesScreen renders). Unless the change took the open card itself off the page
       (Archive, Delete, Hide, a later date, Who, off the board): the list is redrawn now without it, as before, and
       what the card was running stops first, as on a close. Nothing of it is half-saved: a check's answers are saved
       only by its last answer (ecSubmit), a step's tick when it is tapped. */
    const openA = caOpenId ? (window.CLASS_ACTIVITIES || []).find(x => x.id === caOpenId) : null;
    if(openA && (caIsVisible(openA) || caIsPlayAlongOnly(openA) || caIsPinOnly(openA))) caSinceRepaint = true;
    else {
      const screen = document.getElementById('class-activities-screen');
      const card = openA && screen && !screen.hidden ? document.querySelector(`.ca-card[open][data-id="${CSS.escape(openA.id)}"]`) : null;
      if(card){ stopCardAudio(); caStopRoundsIn(card); }
      refreshOpenClassActivitiesScreen();
    }
    /* The search index holds one entry per VISIBLE activity (buildSearchIndex),
       so an activity released while the tab was away stayed unfindable — and
       an archived one stayed findable — until a language switch or reload.
       A new day releases cards the same way. Drop it; ensureSearchIndex() rebuilds on the next search, and an open
       search re-runs what is in the box. */
    searchIndex = null;
    const input = document.getElementById('search-input');
    const panel = document.getElementById('search-panel');
    if(input && panel && !panel.hasAttribute('hidden') && input.value.trim().length >= 2) runSearch(input.value);
  });
});
/* Save as the tab goes out of sight, not only on pagehide (2026-10-12).
   Closing a Chromebook lid or switching apps hides the tab but often never
   fires pagehide, so a step ticked inside queueSave's 800 ms debounce was
   left waiting until the student came back — or lost with the tab. This
   sends now what the debounce would have sent anyway: flushSave() takes the
   dirty set with it (a pagehide straight after finds nothing and sends
   nothing), keeps the failed-load drop (LOAD_FAILED_EMPTY_MAPS, 1bo), and
   never sees the held-back categories — queueSave filters those before
   they are ever dirty. Nothing dirty, nothing sent. */
function flushOnHide(){
  if(!currentUser || !_dirtyKeys.size) return;
  clearTimeout(saveTimer);
  flushSave();
}
// Shared "is In-Class Activities open, and if so re-render it" check — every
// place that changes something the screen might already be showing (a period
// pick, a language switch, a gate-clearing config reload) goes through this
// one, rather than three near-identical copies of the same idiom drifting apart.
function refreshOpenClassActivitiesScreen(){
  if(typeof renderClassActivities !== 'function') return;
  const screen = document.getElementById('class-activities-screen');
  if(screen && !screen.hidden) renderClassActivities();
}
/* In-Class Activities — four groups, in this order:
     1. Today's activity      — every card dated today or yesterday, or kept
                       in Today by the console, pending first, then finished
                       (2026-11-09, evening, see pendingPool). Collapsed like
                       every other card (Jonathan, 2026-09-15): the whole point
                       of the page is seeing the day's work at a glance, and a
                       forced-open first card pushed the rest below the fold.
     2. Since your last visit — required cards released on class days with no
                       saved work (caSinceHtml, the comment above caSinceGap);
                       no group when there are none.
     3. Unfinished activities — the rest of the pending cards, in one fold
                       (caTodoGroupHtml), drawn even for a single card.
     4. Completed activities  — finished work, a closed fold
                       (caFinishedGroupHtml).
   Ends with the resume card (moved here from the practice column, see
   index.html) when the activity gate is off — once today's work is done,
   "Your practice" is the next thing on the page. */
/* PURE. The same cards, rank 0 (required) before rank 1 (optional, or cleared for this student), each rank in the
   order it came in. Display order only: caBoardOrder, the board, the gate and caIsVisible never read it. */
function caRequiredFirst(cards, rankOf){
  return cards.filter(a => rankOf(a) === 0).concat(cards.filter(a => rankOf(a) !== 0));
}
function renderClassActivities(){
  // Every card goes through caCardOut, which notes how the open card was built for caRedrawOpenCard (app/activities.js).
  caOpenCardBuild = null;
  caOpenRec = { n: 0 };
  const bodyEl = document.getElementById('class-activities-body');
  if(!bodyEl){ caOpenRec = null; return; }
  // Recomputed below only when the list has cards; an emptied list must not
  // keep the last pass's hero, or renderResumeCard stays hidden for good.
  caStartHereId = null;
  caTodayIds = [];
  caSinceRepaint = false;   // this render reads the "Since your last visit" answer, whatever it is
  caResetRevealsIfNewDay();
  // This rebuilds every card, so a snippet playing in one of them is about to
  // be detached — and a detached <audio> keeps playing with nothing left on
  // screen to stop it. (snipTick's own isConnected guard is the backstop for
  // a card pulled out some other way; this is the one path we know about.)
  snipStop();
  pcStop();   // a practice card's song, same reason (pcFrame has the same backstop)
  /* …and a Play tab line in one of them: its Stop button and cursor would be on the old, detached card (another card
     opened by a deep link redraws the list under it). */
  stopPlaySeqIn(bodyEl);
  // Recomputed up front — the gate intro line and the resume card below both
  // read body.ca-gated, and a completion just made in THIS render pass
  // (caToggleComplete/ecSubmit, both call this) has to be reflected before
  // either of them looks at it.
  applyActivityGate();
  /* The console board (caBoardOrder) still owns the TEACHING order — the
     "#N" on a card is that order, ascending, unchanged (numbering, gating
     and deep links all key off it and must not move). What flips here
     (Jonathan, 2026-09-17) is purely the READING order on this page: newest
     module first, and within a module the most recently assigned card
     (highest board position) first — so a student lands on current work
     without scrolling past everything already behind them. Reversing
     view.sections and each section's ids does that without touching
     caBoardOrder/caNumber, which every other reader (teacher console,
     caIsVisible, deep links) still expects in course order.
     One exception (Jonathan, 2026-11-02): the CURRENT day — the newest
     visible card's date — reads lowest number first (#11 above #12), the
     order the class does them in. Everything older stays highest first.
     Only the current day's cards trade places among themselves; every other
     card keeps its slot, and module grouping is untouched. Done here, on
     `groups`, so the Unfinished fold and the Completed fold read the same
     order. The Today group is picked by release date instead (2026-11-09,
     see pendingPool below). */
  const byId = {};
  (window.CLASS_ACTIVITIES || []).forEach(a => { byId[a.id] = a; });
  const view = caBoardView();
  const groups = view.sections.slice().reverse().map(sec => ({
    sec,
    cards: sec.ids.slice().reverse().map(id => byId[id]).filter(a => a && caIsVisible(a)),
  })).filter(g => g.cards.length);
  const currentDay = groups.length ? caDate(groups[0].cards[0]) : null;
  if(currentDay){
    groups.forEach(g => {
      const today = g.cards.filter(a => caDate(a) === currentDay).reverse();
      if(today.length > 1) g.cards = g.cards.map(a => caDate(a) === currentDay ? today.shift() : a);
    });
  }
  const list = groups.reduce((acc, g) => acc.concat(g.cards), []);
  /* The one card this page shows that is NOT in `list`: a "Play Along now"
     practice card the student opened from the Songs page (caIsPlayAlongOnly).
     It renders only while it is the open card — close it and the next render
     drops it — under the Songs section's own title, so it reads as where it
     came from. It is never the hero, never in a fold, never counted. */
  /* A pinned card that isn't on the dated list (caIsPinOnly) is the same
     kind of guest: open only while it is the open card, rendered straight
     under the Keep practicing row that opened it, no heading of its own. */
  const openCard = caOpenId && byId[caOpenId];
  const playOnly = openCard && (caIsPlayAlongOnly(openCard) || caIsPinOnly(openCard)) ? openCard : null;
  /* Opened from another card's Level up (caOpenLinkedCard): it takes THAT
     card's slot instead of a Songs heading. Only while the `from` card is on
     the page — otherwise it falls back to the heading. */
  const swap = playOnly && caSwap && caSwap.to === playOnly.id && list.some(a => a.id === caSwap.from) ? caSwap : null;
  const swapIn = a => (swap && a.id === swap.from) ? playOnly : a;
  const pinOpen = playOnly && !swap && caIsPinOnly(playOnly) ? playOnly : null;
  // A library song is headed with the Songs list it came from (caIsLibrarySong).
  const playOnlyHead = playOnly && caIsLibrarySong(playOnly) ? 'hub.libraryTitle' : 'hub.playAlongTitle';
  const playOnlyHtml = playOnly && !swap && !pinOpen
    ? `<div class="ca-mod-head" role="heading" aria-level="3" data-i18n="${playOnlyHead}">${escHtml(t(playOnlyHead))}</div>${caCardOut(caActivityCardHtml, playOnly)}`
    : '';
  // The Keep practicing row (caPinRowHtml) plus, under it, a pin-only card
  // the student opened from it.
  const pinsHtml = () => caPinRowHtml(byId) + (pinOpen ? caCardOut(caActivityCardHtml, pinOpen) : '');
  // A deep link whose id isn't published (or is mistyped) says so, above the
  // archive it did open — see caFocusActivity.
  const missing = caLinkMissingId
    ? `<div class="coach-tip" data-i18n="ca.linkMissing">${escHtml(t('ca.linkMissing'))}</div>`
    : '';
  if(!list.length){
    // With a Keep practicing row up there is something to do, so the
    // "nothing here yet" line would read wrong under it.
    const pins = pinsHtml();
    bodyEl.innerHTML = missing + pins + (playOnlyHtml || (pins ? '' : `<div class="coach-tip" data-i18n="ca.empty">${escHtml(t('ca.empty'))}</div>`));
  } else {
    // Done work collapses into its own group (caFinishedGroupHtml) so the
    // list a student actually needs to act on isn't buried under everything
    // already turned in — `list` is already in reading order (newest module
    // and card first, the current day lowest number first — see above), so
    // filtering it straight through keeps that same order here. A finished
    // card that is in Today's activities is left out of the fold below.
    const finished = list.filter(a => classActivities[a.id] === true);
    // Every card starts collapsed, Do-now included — nothing is opened here.
    // caOpenId only ever becomes non-null because the student opened a card
    // (caOnActivityToggle), a deep link focused one (caFocusActivity), or a
    // toggle wants to keep its card open through the re-render; it stays
    // sticky after that, so a re-render never yanks their choice shut.
    const pendingGroups = groups
      .map(g => ({ sec: g.sec, cards: g.cards.filter(a => classActivities[a.id] !== true) }))
      .filter(g => g.cards.length);
    const pendingCount = pendingGroups.reduce((n, g) => n + g.cards.length, 0);
    /* Today's activities (Jonathan, 2026-11-09, evening: "everything with a
       date either for the current day or dated the day before; everything
       else is unfinished work"). The group is EVERY visible card released
       TODAY or YESTERDAY by the calendar (caTodayWindow) — yesterday is the
       calendar day before, not the last class day, so on a Monday only
       Monday's cards are here and Friday's are Unfinished (his pick, same
       day). No cap: it replaces "up to CA_TODAY_MAX pending cards across
       days" (the 2026-11-09 morning rule) and its "finished cards of the
       newest date only".
       1. The PENDING cards of those two days first: the required ones
          before the optional ones (and cards cleared for this student), then
          today before yesterday; today's lowest board position first (#11
          above #12, the 2026-11-02 rule), older days' highest first (byPos,
          2026-11-17). Optional cards below (Jonathan,
          2026-11-14: "fix it so the optional cards are below"); before, an
          optional card dated today sat above a required one dated yesterday.
       2. Then the FINISHED cards of those two days, below them, today
          before yesterday, in the same order (byPos): re-dating a card
          puts it back in Today for everyone, and a student who already did
          it sees it done and can play it again (2026-11-09). A finished card
          never takes a pending card's place.
       Every other pending card is in the Unfinished fold and every other
       finished one in Completed; both keep their board order.
       KEPT cards (Jonathan, 2026-11-16: the console's "Keep in Today's
       activities" tick beside the release date, caKeptInToday) count as
       today's or yesterday's on every later day too, until it is unticked:
       pending ones in the pending part, finished ones in the finished part,
       each by its own date (so below today's and yesterday's) and wearing its
       date chip. `list` holds only visible cards, so the tick never shows a
       card before its date or past Hidden, Archive, Delete or Who. */
    const isDone = a => classActivities[a.id] === true;
    const [todayDay, yesterDay] = caTodayWindow();
    const inToday = a => { const d = caDate(a); return d === todayDay || d === yesterDay || caKeptInToday(a); };
    const boardPos = {};
    let posN = 0;
    view.sections.forEach(sec => sec.ids.forEach(id => { boardPos[id] = posN++; }));
    const byDate = (x, y) => {
      const dx = caDate(x) || '', dy = caDate(y) || '';
      return dx !== dy ? (dx < dy ? 1 : -1) : 0;
    };
    /* Within one date (Jonathan, 2026-11-17, "highest number first"): today's
       cards lowest number first (#11 above #12, the order the class does
       them in); every older day highest number first, the same as the
       Unfinished and Completed folds. So yesterday's #21 and #22 under
       today's #23 read 23 | 22, then 21. caSinceMissed uses the same rule. */
    const byPos = (x, y) => caDate(x) === todayDay ? (boardPos[x.id] - boardPos[y.id]) : (boardPos[y.id] - boardPos[x.id]);
    const pendingPool = list.filter(a => !isDone(a))
      .sort((x, y) => byDate(x, y) || (Number(caIsOptional(x)) - Number(caIsOptional(y))) || byPos(x, y));
    const myClears = (activityClears || {})[currentUser && currentUser.uid] || {};
    /* 0 = required (not optional, not cleared for this student: the hero's own rule), 1 = the rest. Every pending
       list on this page puts the 0s first and keeps its own order otherwise (caRequiredFirst). */
    const rankOf = a => (caIsOptional(a) || myClears[a.id] === true) ? 1 : 0;
    let todayPending = caRequiredFirst(pendingPool.filter(inToday), rankOf);
    /* The hero (caStartHereId) stays COLLAPSED like every other card
       (Jonathan, 2026-09-15). Required and unfinished first (Jonathan,
       2026-11-12): the newest REQUIRED pending card, whatever its date (an
       older one in the Unfinished fold beats an optional card dated today);
       an optional one only when no required card is pending. A card the
       teacher cleared for this student is never the hero. caStartHereId
       answers "is anything left to do?" for the "next up" toast and the
       resume card, so it is null when nothing is pending but cleared cards. */
    const pickable = pendingPool.filter(a => myClears[a.id] !== true);
    const heroPick = pickable.find(a => !caIsOptional(a)) || pickable[0] || null;
    caStartHereId = heroPick ? heroPick.id : null;
    const todayDone = list.filter(a => isDone(a) && inToday(a)).sort((x, y) => byDate(x, y) || byPos(x, y));
    let todayCards = todayPending.concat(todayDone);
    // Every card in the group, the finished ones below included.
    caTodayIds = todayCards.map(a => a.id);
    /* The rest of the pending cards: "Since your last visit" (caSinceGroup, at the end of this file) sits between
       Today and the Unfinished fold and takes its cards out of the fold (no card shows twice); the fold keeps the
       board's reading order, module by module, with each module's required cards above its optional ones. */
    let since = null, restGroups = [];
    const placeRest = () => {
      since = pendingCount ? caSinceGroup(list, todayDay, myClears, boardPos) : null;
      const sinceIds = since ? since.ids : [];
      restGroups = pendingGroups
        .map(g => ({ sec: g.sec, cards: caRequiredFirst(g.cards.filter(a => !caTodayIds.includes(a.id) && !sinceIds.includes(a.id)), rankOf) }))
        .filter(g => g.cards.length);
    };
    placeRest();
    /* THE TOP CARD IS THE HERO (Jonathan, 2026-11-14). "Marked complete. Your next activity is at the top." must be
       true: the first pending card on the page is caStartHereId. It already is when Today holds a required card, or
       when nothing pending sits above the hero. When something would (only optional or cleared cards dated today or
       yesterday, or optional cards above it in the fold), the hero is drawn FIRST in Today's grid, with its own date
       chip, and leaves the group it would have been in. Nothing else moves. */
    const firstPending = (todayPending[0] && todayPending[0].id) || (since && since.ids[0]) || ((restGroups[0] && restGroups[0].cards[0]) || {}).id || null;
    if(heroPick && firstPending !== heroPick.id){
      todayPending = [heroPick].concat(todayPending);
      todayCards = todayPending.concat(todayDone);
      caTodayIds = todayCards.map(a => a.id);
      placeRest();
    }
    /* One heading over the group (caTodayHeadHtml), dated TODAY. A card
       released yesterday wears its own date chip (the Unfinished fold's
       .ca-chip); today's wear none. A finished card is drawn exactly as the
       Completed fold draws it (caActivityCardHtml: its ✓, its Completed
       button), minus the chip. No card dated today or yesterday → no
       heading at all; the Unfinished fold (open by default, caTodoOpen) is
       then the top of the page. */
    const chipOf = a => { const d = caDate(a); return d && d !== todayDay ? d : ''; };
    /* Side by side (Jonathan, 2026-11-10, work order Part 3): the Today cards
       sit in ONE grid, two equal columns, same order, so they read left to
       right, then down. One card keeps the full width; two or more are half
       width (--multi) and drop the hero thumbnail (styles.css). An open card
       takes the full width: the grid is on its .ca-solo-path. */
    const todayHtml = todayCards.length
      ? caTodayHeadHtml(todayDay)
        + `<div class="ca-today-grid${todayCards.length > 1 ? ' ca-today-grid--multi' : ''}">`
        + todayCards.map(a => caCardOut(isDone(a) ? caKindRowHtml : caHeroCardHtml, swapIn(a), chipOf(a))).join('')
        + `</div>`
      : '';
    let pendingHtml;
    if(!pendingCount){
      // The Today hero's caught-up state (2f) — replaces the old plain
      // ca.allDone line with the same free-play actions 1d already built.
      // Any finished card dated today still shows under it, done.
      pendingHtml = finished.length ? caFreePlayHeroHtml() + todayHtml : '';
    } else {
      // Everything else pending, minus the Today and Since cards (restGroups,
      // above), wrapped in ONE Unfinished fold (2f) — module headings
      // (plain, no progress bar; that's a Completed-only addition below) when
      // anything has been placed in a module, otherwise the flat Unsorted list
      // it always was.
      const restFlat = restGroups.reduce((acc, g) => acc.concat(g.cards), []);
      const restCount = restFlat.length;
      let restHtml = '';
      if(restCount > 0){
        /* One fold, newest first — the page's three groups are Today's
           activity / Unfinished activities / Completed activities (Jonathan,
           2026-09-23, round 2). The nested "Older (n)" fold from round 1
           (item 5) is gone with its name; module headings, when any card
           is placed in a module, do the grouping instead. */
        /* Two columns (Look 1, Part 2, Jonathan, 2026-11-17): each module's
           rows (or the flat list) sit in one .ca-todo-grid, same order, read
           left to right, then down; each row carries its kind picture. */
        const restNewest = caNewestModNum(restGroups);
        const grid = cards => `<div class="ca-todo-grid">${cards.map(a => caCardOut(caKindRowHtml, swapIn(a))).join('')}</div>`;
        const body = restGroups.some(g => g.sec.mod)
          ? restGroups.map(g => caModFoldHtml('todo', g.sec, headHtml(g.sec), grid(g.cards), g.cards, restNewest, swap)).join('')
          : grid(restFlat);
        const openInside = restFlat.some(a => a.id === caOpenId || (swap && a.id === swap.from));
        restHtml = caTodoGroupHtml(body, restCount, openInside);
      }
      pendingHtml = todayHtml + (since ? caSinceHtml(since, byId, swapIn) : '') + restHtml;
    }
    /* Module headings, EN and ES, from the ONE place the site already keeps
       a module's display name — the MODULE_MANIFEST entry caBoardOrder hands
       back on the section. Unsorted (module 0) and a section whose module
       the manifest doesn't know get no heading: there is no honest name to
       put there, and an invented one would be a second source of truth.
       (Declared after pendingHtml only because that's where it's first
       used above — hoisted, so the order here doesn't matter functionally.) */
    function headHtml(sec){
      return sec.mod
        ? `<div class="ca-mod-head" role="heading" aria-level="3" data-i18n="ca.moduleHead" data-i18n-params="${escAttr(JSON.stringify({n: sec.mod.num, mod: tf(sec.mod, 'name')}))}">${escHtml(t('ca.moduleHead', {n: sec.mod.num, mod: tf(sec.mod, 'name')}))}</div>`
        : '';
    }
    // Names how many things are actually blocking (2f) instead of the flat
    // "finish these" line — caBlockers() is the same predicate the gate
    // itself is built on, so the count can't disagree with body.ca-gated.
    const gateIntro = document.body.classList.contains('ca-gated')
      ? (() => {
          // caBlockers() bails to [] for a gate previewer (dev bypass, the
          // teacher account) — so a REAL student is only ever gated with
          // gn >= 1, but window.__forceGate (localhost only) can force the
          // gate on for exactly that same previewer, producing a real gn===0
          // this count would otherwise report dishonestly. Fall back to the
          // old generic wording for that dev-tool-only case.
          const gn = caBlockers().length;
          if(gn === 0) return `<p class="ca-gate-intro" data-i18n="today.gateIntroForced">${escHtml(t('today.gateIntroForced'))}</p>`;
          const key = gn === 1 ? 'today.gateIntro1' : 'today.gateIntro';
          const params = gn === 1 ? null : {n: gn};
          return `<p class="ca-gate-intro" data-i18n="${key}"${params ? ` data-i18n-params="${escAttr(JSON.stringify(params))}"` : ''}>${escHtml(t(key, params))}</p>`;
        })()
      : '';
    // Completed groups by module too, with a progress bar per heading
    // (2f) — a genuinely new capability (it used to be one flat list), so
    // it needs the same grouping pass pendingGroups already gets.
    // A finished card shown in Today's activities is not repeated here.
    const finishedGroups = groups
      .map(g => ({ sec: g.sec, cards: g.cards.filter(a => classActivities[a.id] === true && !caTodayIds.includes(a.id)) }))
      .filter(g => g.cards.length);
    const finishedRest = finished.filter(a => !caTodayIds.includes(a.id));
    bodyEl.innerHTML = missing + pinsHtml() + gateIntro + playOnlyHtml + pendingHtml + (finishedRest.length ? caFinishedGroupHtml(finishedGroups, finishedRest, byId, swap) : '');
  }
  caOpenRecDone();
  if(typeof applyI18n === 'function') applyI18n(bodyEl);
  caArmTabReveals(bodyEl);
  caSyncTopbar();
  // The resume card only belongs on a finished In-Class Activities page —
  // gated, or a Today hero still pending (item 2f), skip it; both checks now
  // live inside renderResumeCard() itself, since a boot-time caller
  // (restoreLastSet) invokes it independently of this render pass.
  if(document.getElementById('resume-card') && typeof renderResumeCard === 'function') renderResumeCard();
}
// Per-module progress for the Completed fold's headings (item 2f) — "N of M"
// and a thin bar, counted over every VISIBLE card ever assigned to that
// module (done + still pending), not just the finished ones sitting in THIS
// fold — so Completed's "4 of 6" and however many are left in Unfinished
// always add up to the same total.
function caModuleHeadHtml(sec, byId){
  if(!sec.mod) return '';
  const ids = sec.ids.filter(id => byId[id] && caIsVisible(byId[id]));
  const total = ids.length;
  const doneN = ids.filter(id => classActivities[id] === true).length;
  const pct = total ? Math.round(doneN / total * 100) : 0;
  const labelParams = {n: sec.mod.num, mod: tf(sec.mod, 'name')};
  const countParams = {done: doneN, total};
  return `<div class="ca-mod-head" role="heading" aria-level="3">
    <span role="heading" aria-level="3" data-i18n="ca.moduleHead" data-i18n-params="${escAttr(JSON.stringify(labelParams))}">${escHtml(t('ca.moduleHead', labelParams))}</span>
    <span class="ca-mod-bar" aria-hidden="true"><b style="width:${pct}%"></b></span>
    <span class="ca-mod-count" data-i18n="ca.moduleProgress" data-i18n-params="${escAttr(JSON.stringify(countParams))}">${escHtml(t('ca.moduleProgress', countParams))}</span>
  </div>`;
}
/* Each module's cards fold under its heading (Jonathan, 2026-11-12: "make
   the modules expandable and collapse all but the most recent module").
   Only the highest-numbered module in the fold starts open. A student's own
   open/close sticks across re-renders (caModFoldOpen, keyed by fold and
   module number), and a fold holding the open card (caOpenId) or a Level
   up swap is forced open, so a deep link never lands on a hidden card.
   Cards with no module (Unsorted) are never wrapped. */
const caModFoldOpen = {};
function caNewestModNum(groups){
  return groups.reduce((m, g) => (g.sec.mod && g.sec.mod.num > m) ? g.sec.mod.num : m, -Infinity);
}
/* A list row (caActivityCardHtml, or caCheckCardHtml for a check) with its
   kind picture first in the <summary> (Look 1, Part 2): the Unfinished
   fold's rows and a finished card in Today. The row itself is unchanged
   (app/cards.js is not edited); the Completed fold calls caActivityCardHtml
   directly and draws no picture. */
function caKindRowHtml(a, chipIso){
  const html = caActivityCardHtml(a, chipIso);
  return html.replace(/(<summary class="ca-card-summary"[^>]*>)/, (m) => m + caKindPicHtml(a));
}
function caModFoldHtml(fold, sec, headHtml, cardsHtml, cards, newest, swap){
  if(!sec.mod || !headHtml) return headHtml + cardsHtml;
  const key = fold + ':' + sec.mod.num;
  const holdsOpen = cards.some(a => a.id === caOpenId || (swap && a.id === swap.from));
  const open = holdsOpen || (key in caModFoldOpen ? caModFoldOpen[key] : sec.mod.num === newest);
  // The heading's own <div> becomes the <summary>: same class, same look.
  // Its heading role goes: a <summary> is the fold's button, and a role on it
  // would hide that from a screen reader. In the Completed fold the module
  // name is its own span with the heading role INSIDE the summary
  // (caModuleHeadHtml), so the outline keeps it; check 1da runs both callers.
  const summary = headHtml.replace(/^<div class="ca-mod-head"(?: role="heading" aria-level="\d")?/, '<summary class="ca-mod-head ca-mod-summary"').replace(/<\/div>$/, '</summary>');
  return `<details class="ca-mod-fold" ${open ? 'open' : ''} data-fold-key="${escAttr(key)}" ontoggle="caOnModFoldToggle(this)">${summary}${cardsHtml}</details>`;
}
function caOnModFoldToggle(details){
  caModFoldOpen[details.dataset.foldKey] = details.open;
  if(!details.open && snipState && details.contains(snipState.card)) snipStop();
  if(!details.open && pcState && details.contains(pcState.root)) pcStop();
  if(!details.open) songFileCancelWaitIn(details);     // a song still loading in it (SONG FILES)
}
/* ── "Unfinished activities" — every pending card except the Today hero,
   wrapped in ONE fold (item 2f). OPEN by default (Jonathan, 2026-10-02);
   a student who closes it keeps it closed across re-renders, same sticky
   pattern as "Completed activities" below. ── */
let caTodoOpen = true;
function caOnTodoToggle(details){
  caTodoOpen = details.open;
  if(!details.open && snipState && details.contains(snipState.card)) snipStop();
  if(!details.open && pcState && details.contains(pcState.root)) pcStop();
  if(!details.open) songFileCancelWaitIn(details);     // a song still loading in it (SONG FILES)
}
function caTodoGroupHtml(bodyHtml, count, openInside){
  const open = caTodoOpen || openInside;
  return `<details class="ca-todo-group" ${open ? 'open' : ''} ontoggle="caOnTodoToggle(this)">
    <summary class="ca-todo-summary">${escHtml(t('ca.stillToDoGroup', {n: count}))}</summary>
    <div class="ca-todo-body">${bodyHtml}</div>
  </details>`;
}
// Closed by default each render — caFinishedOpen carries the student's choice
// across re-renders the same way caOpenId does for a single card, so marking
// one more activity complete doesn't yank an already-open group shut. Also
// forced open when the focused/just-toggled card (caOpenId) lives in it, so
// caFocusActivity's deep link and caToggleComplete's "keep it open" both
// still land on a visible card instead of one hidden inside a closed group.
let caFinishedOpen = false;
function caFinishedGroupHtml(finishedGroups, finishedFlat, byId, swap){
  // `swap`: a Level up's target showing in its card's slot — see caCardLinkHtml.
  const swapIn = a => (swap && a.id === swap.from) ? byId[swap.to] : a;
  const open = caFinishedOpen || finishedFlat.some(a => a.id === caOpenId || (swap && a.id === swap.from));
  const newest = caNewestModNum(finishedGroups);
  const body = finishedGroups.some(g => g.sec.mod)
    ? finishedGroups.map(g => caModFoldHtml('done', g.sec, caModuleHeadHtml(g.sec, byId), g.cards.map(a => caCardOut(caActivityCardHtml, swapIn(a))).join(''), g.cards, newest, swap)).join('')
    : finishedFlat.map(a => caCardOut(caActivityCardHtml, swapIn(a))).join('');
  return `<details class="ca-finished-group" ${open ? 'open' : ''} ontoggle="caOnFinishedToggle(this)">
    <summary class="ca-finished-summary">${escHtml(t('ca.finishedGroup', {n: finishedFlat.length}))}</summary>
    <div class="ca-finished-body">${body}</div>
  </details>`;
}
function caOnFinishedToggle(details){
  caFinishedOpen = details.open;
  if(!details.open && snipState && details.contains(snipState.card)) snipStop();
  if(!details.open && pcState && details.contains(pcState.root)) pcStop();
  if(!details.open) songFileCancelWaitIn(details);     // a song still loading in it (SONG FILES)
}

/* ── "Since your last visit" (Jonathan, 2026-11-13: a catch-up aid for a
   student coming back after days with no saved work; version B of the
   mock-ups, "a group inside the list", with his changes) ──────────────────
   WHAT COUNTS, exactly (checks.mjs 1ds runs caSinceGap / caSinceMissed over
   a table of made-up histories):
     · a CLASS DAY is a release date on the board (activityDates) of a card
       THIS student can see (caIsVisible: assigned, not Hidden, not archived,
       given to them, dated and arrived);
     · SAVED WORK on a day = a practice-minutes day record for that day,
       minutes/{uid}/days/{date} (practice-minutes.js): the engine writes one
       for every day the student was signed in and working on the site (any
       click, playback, mic or sound counts a second). The progress document
       keeps no dates for activities (classActivities is id -> true), so
       there is nothing better to read there;
     · the LAST VISIT is the newest day with saved work BEFORE today, looked
       for in the last CA_SINCE_WINDOW_DAYS days. Today never counts, so
       working today (finishing one of these cards) does not end the group;
     · the MISSED class days are every class day after the last visit and
       before today (none of them has saved work, by definition, so they are
       "in a row"). TWO or more → the group shows;
     · it lists the cards released on the missed days that are visible,
       REQUIRED (not Optional, not CAS, not cleared by the teacher for this
       student) and not done, minus any card already in Today's activity
       (today's and yesterday's cards stay there, unchanged), newest date
       first, within one date HIGHEST board position first (Jonathan,
       2026-11-17, "highest number first": every day before today reads
       highest first, as in Today and the folds; until then lowest first).
       Nothing left to list → no group.
   No saved work found in the window, a failed read, a failed progress
   load, the teacher's account → no group: the page is exactly today's.
   The group never says "absent" (the site keeps no attendance: a student in
   the room with a dead Chromebook has no saved work either).
   DISPLAY ONLY: caIsVisible, caBlockers, caBoardOrder, the gate, the hero
   (caStartHereId), Today's activity and where a student lands are
   untouched. The group's cards are taken OUT of the Unfinished fold (it
   then holds the rest: older cards, optional and cleared ones), so no card
   shows twice; a finished card leaves the group for Completed exactly as it
   leaves the fold.
   THE READ: one query per student per day: the day records from
   CA_SINCE_WINDOW_DAYS (14) days ago up to yesterday, oldest first (a
   descending key scan is refused, so no orderBy desc + limit 1): at most 14
   documents, about 10 for a student who works every school day, none for one
   who was away the whole time. Kept in memory only,
   keyed by uid and day: no storage key, so the next student on a shared
   Chromebook can never see it. The first render goes out without the group;
   when the answer brings one it paints once (or, with a card open, when
   "All activities" closes it). */
const CA_SINCE_WINDOW_DAYS = 14;
const CA_SINCE_RETRY_MS = 5 * 60 * 1000;
let caSinceRead = null;      // { key: 'uid|YYYY-MM-DD', state: 'loading'|'ok'|'failed', at, last }
let caSinceRepaint = false;  // the answer (or a new day or a class settings change, the tab-return handler) came while a card was open: repaint when it closes
/* PURE. The class days with no saved work: every date in `dates` after
   `last` and before `today`, once each, oldest first. Fewer than two → null. */
function caSinceGap(dates, last, today){
  if(typeof last !== 'string' || typeof today !== 'string' || !last || last >= today) return null;
  const days = Array.from(new Set((dates || []).filter(d => typeof d === 'string' && d > last && d < today))).sort();
  return days.length >= 2 ? days : null;
}
/* PURE. o = { today, last, cards: [{ id, date, required, done, inToday, pos }] }
   (cards = every card the student can see). Returns { last, days, ids } —
   ids newest date first, then highest board position — or null. */
function caSinceMissed(o){
  const cards = (o && o.cards) || [];
  const days = caSinceGap(cards.map(c => c.date), o && o.last, o && o.today);
  if(!days) return null;
  const ids = cards.filter(c => c.required && !c.done && !c.inToday && days.includes(c.date))
    .sort((x, y) => x.date !== y.date ? (x.date < y.date ? 1 : -1) : (y.pos - x.pos))
    .map(c => c.id);
  return ids.length ? { last: o.last, days, ids } : null;
}
// The first day the read looks at: CA_SINCE_WINDOW_DAYS before `today`, at noon (daylight saving).
function caSinceFrom(today){
  const [y, m, d] = today.split('-').map(Number);
  return dayStr(new Date(y, m - 1, d - CA_SINCE_WINDOW_DAYS, 12));
}
/* The last day with saved work before `today`, or null (none, not read yet,
   or nothing to read for this account). Starts the read when needed. */
function caSinceLastVisit(today){
  if(!currentUser || !currentUser.uid || progressLoadFailed) return null;
  const from = caSinceFrom(today);
  /* The localhost dev bypass has no Firestore: window.__caWorkDays (an array
     of 'YYYY-MM-DD', localhost only) stands in for the day records, so a
     preview or a driving script can walk the group. */
  if(isDevBypassUser()){
    const w = IS_LOCALHOST && Array.isArray(window.__caWorkDays) ? window.__caWorkDays : [];
    return w.filter(d => typeof d === 'string' && d >= from && d < today).sort().pop() || null;
  }
  if(IS_TEACHER_MODE || isGatePreviewer()) return null;
  const key = currentUser.uid + '|' + today;
  const r = caSinceRead;
  if(r && r.key === key && r.state === 'ok') return r.last;
  if(!r || r.key !== key || (r.state === 'failed' && Date.now() - r.at > CA_SINCE_RETRY_MS)) caSinceLoad(key, currentUser.uid, from, today);
  return null;
}
// One query: the day records from `from` up to (not including) `today`; the newest is the last visit.
function caSinceQuery(d, uid, from, today){
  const docId = firebase.firestore.FieldPath.documentId();
  return d.collection('minutes').doc(uid).collection('days')
    .where(docId, '>=', from).where(docId, '<', today)
    .get({ source: 'server' })   // offline, a cache read answers EMPTY (see practice-minutes.js load): no answer beats a wrong one
    .then(snap => {
      let last = null;
      snap.forEach(doc => { if(/^\d{4}-\d{2}-\d{2}$/.test(doc.id) && doc.id >= from && doc.id < today && (!last || doc.id > last)) last = doc.id; });
      return last;
    });
}
function caSinceLoad(key, uid, from, today){
  const r = caSinceRead = { key, state: 'loading', at: Date.now(), last: null };
  Promise.resolve(typeof ensureDb === 'function' ? ensureDb() : null).then(d => {
    if(!d) throw new Error('no Firestore');
    return caSinceQuery(d, uid, from, today);
  }).then(last => {
    if(caSinceRead !== r) return;   // another student, or another day, since
    r.state = 'ok'; r.last = last; r.at = Date.now();
    if(last) caSinceRepaintNow();
  }).catch(() => {
    if(caSinceRead === r){ r.state = 'failed'; r.at = Date.now(); }
  });
}
/* Paint the answer: now if the In class list is on screen with no card
   open; with a card open, when "All activities" closes it (caCloseOpen) or
   at the next render, so a playing card is never rebuilt under the student. */
function caSinceRepaintNow(){
  const screen = document.getElementById('class-activities-screen');
  if(!screen || screen.hidden) return;   // the next render of the page reads it
  if(caOpenId){ caSinceRepaint = true; return; }
  renderClassActivities();
}
/* The group for this render, or null. `list` = the visible cards; called
   after caTodayIds is set. */
function caSinceGroup(list, today, clears, boardPos){
  const last = caSinceLastVisit(today);
  if(!last) return null;
  return caSinceMissed({ today, last, cards: list.map(a => ({
    id: a.id, date: caDate(a), required: !caIsOptional(a) && clears[a.id] !== true,
    done: classActivities[a.id] === true, inToday: caTodayIds.includes(a.id), pos: boardPos[a.id] })) });
}
/* The group's markup: "Since your last visit · <the last day with saved
   work>", one line, then the cards, newest first. The top card is a hero
   card (its Start button); the others are list rows, each with its date. */
function caSinceHtml(since, byId, swapIn){
  const cards = since.ids.map(id => byId[id]).filter(Boolean);
  if(!cards.length) return '';
  const n = cards.length;
  const noteKey = n === 1 ? 'ca.sinceNote1' : 'ca.sinceNote';
  const noteParams = n === 1 ? null : { n };
  const date = caFormatDate(since.last);
  return `<section class="ca-since" aria-labelledby="ca-since-lbl"><div class="ca-today-head" role="heading" aria-level="3"><span class="ca-today-label" id="ca-since-lbl" data-i18n="ca.sinceTitle">${escHtml(t('ca.sinceTitle'))}</span>${date ? `<span class="ca-today-date">${escHtml(date)}</span>` : ''}</div>`
    + `<p class="ca-since-note" data-i18n="${noteKey}"${noteParams ? ` data-i18n-params="${escAttr(JSON.stringify(noteParams))}"` : ''}>${escHtml(t(noteKey, noteParams))}</p>`
    + cards.map((a, i) => i === 0 ? caCardOut(caHeroCardHtml, swapIn(a), caDate(a) || '') : caCardOut(caActivityCardHtml, swapIn(a))).join('')
    + `</section>`;
}

/* The unfinished-activities reminder popup (maybeShowCaReminder) was retired
   2026-09-11 (Today-first work order, Phase 1) — landing on In-Class
   Activities replaces it, and the activity gate makes it redundant besides. Deleted rather than
   stubbed, per CLAUDE.md; see git history for the old implementation. */

