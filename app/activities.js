/* ── Deep link to ONE activity: '#class-activities/ca-15' ──
   The link Jonathan posts in Classroom for a specific exit check. Opens the
   Class activities page with that card expanded and scrolled to; the rest of
   the archive is still under it, so a mistyped or not-yet-published id is a
   note at the top of a working page rather than a dead end. Copy one from
   the teacher console's Class activities table ("Copy link"). */
let caLinkMissingId = null;   // an id from the URL that isn't on the page
function caFocusActivity(id){
  // A "Play Along now" card opens here too, from the Songs page — see
  // caIsPlayAlongOnly — and so does a pinned one, from the Keep practicing row.
  const found = (window.CLASS_ACTIVITIES || []).find(a => a.id === id && (caIsVisible(a) || caIsPlayAlongOnly(a) || caPinReachable(a)));
  caLinkMissingId = found ? null : id;
  caOpenId = found ? id : caOpenId;
  renderClassActivities();
  if(!found) return;
  /* Unless it's one of Today's cards, the card lives inside the "Unfinished
     activities" or "Completed activities" <details>. The render above
     already opened that fold around the open card (caOpenId); this keeps it
     open after the card closes. Decided after the render, from caTodayIds,
     so a finished card shown in Today (2026-11-09) doesn't open a Completed
     fold it isn't in. */
  if(!caTodayIds.includes(id)){
    if(classActivities[id] === true) caFinishedOpen = true; else caTodoOpen = true;
  }
  caScrollToActivity(id);
}
/* Bring one card to the top of whatever is actually scrolling — the .main
   pane on a laptop, the document on a phone — without this needing to know
   which. Twice on purpose: the first pass runs a frame after the cards are
   written, and the second at 350ms catches the case that made a cold deep
   link land short — arriving straight from a page load, .main's own height
   is still settling (the explore-open swap, web fonts) while the first
   scroll is animating, so it stops partway. A second scroll to a card
   already in place is a no-op. */
function caScrollToActivity(id){
  const go = () => {
    const card = document.querySelector(`.ca-card[data-id="${CSS.escape(id)}"]`);
    if(!card) return;
    /* The open card stops just under the sticky bar. The bar is one row or,
       once it no longer fits and wraps (styles.css, "Maximize the view"
       item 2), two — at any window width, not only a phone's — so measure
       it here rather than trust the CSS scroll-margin-top guess. */
    const screen = card.classList.contains('ca-solo-card') ? card.closest('.ca-screen') : null;
    const topbar = screen ? screen.querySelector('.page-topbar') : null;
    card.style.scrollMarginTop = topbar ? topbar.offsetHeight + 'px' : '';
    card.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  };
  requestAnimationFrame(go);
  setTimeout(go, 350);
}
// Which activity card is expanded, so a re-render (Mark complete, language
// switch) doesn't collapse the one the student is looking at.
let caOpenId = null;
/* The id of the Today hero: the first required PENDING card of Today's
   activities (today's and yesterday's cards — see pendingPool in
   renderClassActivities()), or with none there the newest pending card;
   null only when nothing at all is pending.
   Set fresh by renderClassActivities() each render. Read by the resume
   card (hidden while a hero is pending) and the "next up" toast. The card
   stays COLLAPSED by default like every other card (Jonathan, 2026-09-15)
   — nothing here forces it open. */
let caStartHereId = null;
/* Today's group: every visible card released today or yesterday
   (caTodayWindow; Jonathan, 2026-11-09, evening), pending ones first, then
   finished ones, shown done. No cap (CA_TODAY_MAX, 3, went with this rule).
   caTodayIds is every card in the group, the finished ones included; the
   hero is the first required pending one, not always the first card. */
let caTodayIds = [];
// Non-interactive whole-activity progress dots, drawn only for the Today
// cards — distinct from repDotsHtml (a TAPPABLE rep counter under one
// got-it-when line): this is a summary of every step in caStepDone, drawn
// once, never clicked. Checks are excluded (no per-step ticks to
// summarize), and so is a finished Today card (it shows its ✓ instead).
function caHeroDotsHtml(a){
  // A Level up's card opened in a Today card's slot (caSwap) keeps the dots.
  if(a.kind === 'check') return '';
  if(!caIsSwapIn(a) && (!caTodayIds.includes(a.id) || classActivities[a.id] === true)) return '';
  // A practice card's dots are its checks (caTickKeys), a ladder's its steps.
  const keys = caTickKeys(a);
  if(!keys.length) return '';
  const dots = keys.map(k => `<span class="ca-hero-dot${caStepDone[k] === true ? ' f' : ''}"></span>`).join('');
  return `<span class="ca-hero-dots" aria-hidden="true">${dots}</span>`;
}
// Plain text, first sentence only — html is trusted content (module/activity
// intros), so tags are stripped before hunting for the sentence break. Used
// for the hero's collapsed blurb; the full intro still shows once opened.
function caFirstSentence(html){
  const txt = (html || '').replace(/<[^>]+>/g, '');
  const m = /^(.*?[.!?])(\s|$)/.exec(txt);
  return (m ? m[1] : txt).trim();
}
/* ── Soft nudge on Mark complete (practice-chunks work order, 2026-09-19) ──
   Marking done with fewer than all steps ticked THIS SESSION shows an
   inline confirm in place of the button — never a confirm() dialog, and
   never a lock: "Keep going" just re-shows the plain button, "Mark
   complete" finishes exactly like today. caStepDone is saved to the
   student's progress (see its declaration), so a reload never wipes the
   ticks — the rule is still simply ticks < steps, always. */
let caNudgeId = null;
function caMarkClick(id){
  const a = (window.CLASS_ACTIVITIES || []).find(x => x.id === id);
  // A practice card counts its numbered checks — Level up is extra
  // (caRequiredTickKeys); a ladder counts every step.
  const req = a ? caRequiredTickKeys(a) : [];
  if(!a || classActivities[id] === true || !req.length){ caToggleComplete(id); return; }
  if(caTickCount(req) >= req.length){ caToggleComplete(id); return; }
  caNudgeId = id;
  caOpenId = id;
  renderClassActivities();
}
function caNudgeKeepGoing(){ caNudgeId = null; renderClassActivities(); }
function caNudgeConfirm(id){ caNudgeId = null; caToggleComplete(id); }
/* ── Free play, once there's nothing left pending (practice-chunks work
   order, 2026-09-19, item 2f superseded the original one-time dismissible
   strip) ── caFreePlayHeroHtml() replaces the hero card itself whenever
   pendingCount is 0 and something has actually been finished — a steady
   page state, not an event, so it needs no arm/dismiss bookkeeping: it
   shows itself exactly when there's nothing else to show, and stops the
   moment a new activity goes live and becomes the next hero. */
function caFreePlayHeroHtml(){
  return `<div class="ca-card ca-card--hero ca-freeplay-hero">
    <h3 class="ca-freeplay-title">${escHtml(t('ca.caughtUpTitle'))}</h3>
    <p class="ca-freeplay-text">${escHtml(t('ca.freePlayText'))}</p>
    <div class="ca-freeplay-actions">
      <button type="button" class="ca-mark-btn" onclick="caFreePlayTimer()">${escHtml(t('ca.freePlayTimer'))}</button>
      ${gamesAccessOn ? `<button type="button" class="btn-out" onclick="caFreePlayGames()">${escHtml(t('ca.freePlayGames'))}</button>` : ''}
    </div>
  </div>`;
}
function caFreePlayTimer(){
  if(typeof setTimerSecs === 'function') setTimerSecs(300);
  const popup = document.getElementById('timer-popup');
  if(popup && !popup.classList.contains('open') && typeof togglePopup === 'function') togglePopup('timer');
  if(typeof timerRunning !== 'undefined' && !timerRunning && typeof toggleTimer === 'function') toggleTimer();
}
// Riff Roulette specifically (Jonathan's ask) — goExploreHash('games') and
// this both call the SAME cached ensureCoachJs() promise (loadScriptsInOrder),
// so their .then callbacks run in the order they were attached: the hash
// router's openGamesScreen (which opens on 'hub') always resolves before
// this one, so gamesShow('roulette') here reliably has the last word.
function caFreePlayGames(){
  goExploreHash('games');
  ensureCoachJs().then(() => { if(typeof gamesShow === 'function') gamesShow('roulette'); }).catch(() => {});
}
function caMarkRowHtml(a, done, markLabel){
  /* An extra song (the Songs page's "More Play Along songs", caIsLibraryCard)
     has no Mark complete: it is extra, there is nothing to finish (Jonathan,
     2026-11-10: "remove mark complete from the extra songs since they're
     extra"). */
  if(caIsLibraryCard(a)) return '';
  // Focus view: Mark complete waits for the last step (Jonathan, 2026-09-27).
  // An already-complete card keeps it on every step, so it can be un-marked.
  if(caIsFocus(a) && !done && caRoutePos(a, caFocusIdx(a)) < caRoute(a).length - 1) return '';
  /* --finish: the "I'm done" buttons are green site-wide (2026-10-31, with
     "Got it — next step" and the module ladder's "Mark done"). .ca-mark-btn
     alone stays orange for its other uses (exit-check Start/Retake, the
     free-play timer). */
  if(caNudgeId !== a.id){
    return `<button type="button" class="ca-mark-btn ca-mark-btn--finish ${done ? 'done' : ''}" onclick="caMarkClick('${escAttr(a.id)}')">${escHtml(markLabel)}</button>`;
  }
  const req = caRequiredTickKeys(a);
  const total = req.length;
  const ticks = caTickCount(req);
  return `<div class="ca-nudge">
    <p class="ca-nudge-text">${escHtml(t('ca.nudgeText', {ticks, total}))}</p>
    <div class="ca-nudge-actions">
      <button type="button" class="btn-out" onclick="caNudgeKeepGoing()">${escHtml(t('ca.keepGoing'))}</button>
      <button type="button" class="ca-mark-btn ca-mark-btn--finish" onclick="caNudgeConfirm('${escAttr(a.id)}')">${escHtml(t('ca.markComplete'))}</button>
    </div>
  </div>`;
}
/* The chunk-size meta line under a collapsed card's title — how big a bite
   this is before the student opens it (practice-chunks work order,
   2026-09-19). Step count and the optional authored `minutes` are stable;
   the done count is read from caStepDone, which is saved to the
   student's progress (see the declaration) — shown only once it's above zero so a fresh card doesn't
   claim "0 done". */
function caChunkMetaHtml(a){
  // No step count and no done count on any card since 2026-11-12 (Jonathan:
  // "remove steps"). What is left: the Optional tag, minutes if any, and the
  // Today card's progress dots (caHeroDotsHtml).
  const head = a.minutes ? [t('ca.aboutMin', {n: a.minutes})] : [];
  const dotsHtml = caHeroDotsHtml(a);
  const inner = caOptionalTagHtml(a) + head.map(escHtml).join(' &middot; ') + dotsHtml;
  return inner ? `<div class="ca-chunk-meta">${inner}</div>` : '';
}
function caCheckMetaHtml(a){
  const n = ecItems(a).length;
  if(!n) return caOptionalTagHtml(a) ? `<div class="ca-chunk-meta">${caOptionalTagHtml(a)}</div>` : '';
  return `<div class="ca-chunk-meta">${caOptionalTagHtml(a)}${escHtml(n === 1 ? t('ca.checkMeta1') : t('ca.checkMeta', {n}))}</div>`;
}
/* The "Optional" tag at the head of a card's meta line — the student-side
   half of the console's Optional switch (optionalActivityIds). Both meta
   builders above carry it, so the hero and the plain card, activity and
   check, all get it from one place. */
/* Grey edge ("ca-card--optional") for every card that shows the Optional tag
   and the student hasn't done — list cards, Today cards and exit checks alike
   (2026-11-01). Not for a CAS student: every card is optional for them, and
   fading the whole list would make nothing stand out. */
function caQuietOptional(a, done){
  return !done && !caStudentIsCAS() && caIsOptional(a);
}
function caOptionalTagHtml(a){
  if(!caIsOptional(a)) return '';
  return `<span class="ca-optional-tag" data-i18n="ca.optional" title="${escAttr(t('ca.optionalTitle'))}" data-i18n-attr="title:ca.optionalTitle">${escHtml(t('ca.optional'))}</span>`;
}
/* ── The Today hero (Chromebook rail work order, item 2f) ──────────────
   The ONE card renderClassActivities() singles out (caStartHereId) gets its
   OWN summary markup — a two-column header (text left, a step-figure
   thumbnail over a big "Start →"/"Keep going →" call-to-action right) —
   built here rather than through caActivityCardHtml/caCheckCardHtml. The
   BODY is identical to the plain card (one caCardBodyBlockHtml,
   same caCheckBodyHtml for a check), so opening it is exactly the same
   card everyone else eventually opens; only the collapsed header differs.
   Collapsed by default (Jonathan, 2026-09-15) — the CTA span carries no
   onclick of its own, so a click anywhere in the summary (thumbnail, CTA,
   title) just triggers the native <summary> toggle, same as every other
   card's collapsed row. */
function caHeroThumbHtml(a){
  const step = (a.steps || []).find(s => s.figure);
  if(!step) return '';
  // Decorative — the same image (with its real alt text) renders again once
  // the card is open, inside the actual step; a duplicate caption here would
  // just be announced twice.
  return `<span class="ca-hero-thumb"><img src="${escAttr(step.figure)}" alt="" width="640" height="244" loading="lazy"></span>`;
}
/* ── The hero card's tag line ─────────────────────────────────────────
   The label ("Today's activity" / "Unfinished") and the date are said ONCE
   above the Today group (caTodayHeadHtml, 2026-10-31, Jonathan — "one Today
   heading with the date shown once"), so a Today card keeps only what that
   heading cannot say for it: an exit check's own "Exit check" tag. Every
   other card draws no tag line at all. A Today card dated on another day
   than the heading's carries that date as a chip (2026-11-09, the chipIso
   argument of caHeroCardHtml/caHeroCheckHtml), drawn just above this tag.

   The heading is always "Today's activity", dated today (2026-11-09,
   evening: the group is today's and yesterday's cards). The OLDER wording
   it had until 2026-11-09 ("Unfinished · From <day>", a quieter band) was
   removed with its CSS and strings. */
function caStartHereTagHtml(a){
  return a.kind === 'check'
    ? `<span class="ca-start-tag ca-start-tag--check" data-i18n="check.prefix">${escHtml(t('check.prefix'))}</span>`
    : '';
}
// A Today card's own release date, when it differs from the heading's —
// the same .ca-chip the Unfinished fold's rows carry. '' draws nothing.
function caHeroChipHtml(iso){
  const label = typeof iso === 'string' ? caFormatDate(iso) : '';
  return label ? `<span class="ca-chip">${escHtml(label)}</span>` : '';
}
/* The heading over the Today group (2026-10-31): the same words a hero
   card's tag used to carry, said once for the whole group. `day` is the
   date today (2026-11-09, evening): the group holds today's and
   yesterday's cards, and yesterday's wear their own date chip. */
function caTodayHeadHtml(day){
  const dateLabel = caFormatDate(day);
  const date = dateLabel ? `<span class="ca-today-date">${escHtml(dateLabel)}</span>` : '';
  return `<div class="ca-today-head"><span class="ca-today-label" data-i18n="ca.startHere">${escHtml(t('ca.startHere'))}</span>${date}</div>`;
}
/* "#16" ahead of a card's title, quiet (2026-10-31): was "#16 - " in the
   title's own weight, which put a hyphen beside the title's em dash
   ("#17 - "the cure" — The Whole Song"). The number is the board's teaching
   order (caNumber) — only how it looks changed. */
function caNumHtml(num){
  return num ? `<span class="ca-num">#${escHtml(String(num))}</span> ` : '';
}
/* The .ca-card-body both card shapes share — the plain card and the hero
   (caActivityCardHtml / caHeroCardHtml) differ only in their <summary>.
   A practice card (view:'card') draws its own body, caCardBodyHtml, and
   keeps its steps as the help ladder inside it. */
function caCardBodyBlockHtml(a, done, focus, card){
  const openStepIdx = focus ? caFocusIdx(a)
    : caStepOpen[a.id] !== undefined ? caStepOpen[a.id] : caDefaultOpenStep(a);
  /* A paths activity (caHasPaths) before the student has picked: the chooser
     stands where the steps go, and the intro shows above it as on Step 1. */
  const chooser = !card && caChooserUp(a);
  const steps = a.steps || [];
  const route = caRoute(a);   // flat step indices on the student's route — see PATHS
  const stepsHtml = (card || chooser) ? '' : route.map((si, pos) => caStepHtml(a, steps[si], si, si === openStepIdx, caStepDone[`${a.id}:${si}`] === true, { pos, total: route.length })).join('');
  const markLabel = done ? t('ca.completed') : t('ca.markComplete');
  return `<div class="ca-card-body">
      ${card ? caCardBodyHtml(a) : caKeySwitchHtml(a) + caChordSwitchHtml(a) + caIntroHtml(a, focus, chooser ? 0 : openStepIdx)}
      ${chooser ? caPathChooserHtml(a) : caPathRowHtml(a)}
      ${stepsHtml && focus ? caFocusDotsHtml(a, openStepIdx) : ''}
      ${stepsHtml ? `<ol class="ca-steps">${stepsHtml}</ol>` : ''}
      ${chooser ? '' : caMarkRowHtml(a, done, markLabel)}
    </div>`;
}
/* The card sits under caTodayHeadHtml, which carries the label and the date —
   see caStartHereTagHtml. No 🖨 on the collapsed row any more
   (2026-10-31): the open card's bar has it (caSyncTopbar). */
function caHeroCardHtml(a, chipIso = ''){
  if(a.kind === 'check') return caHeroCheckHtml(a, chipIso);
  a = caView(a);   // power-chord version when the switch says so — see caView
  const open = caOpenId === a.id;
  const done = classActivities[a.id] === true;
  // Focus view always has exactly one step open (caFocusIdx); the accordion
  // can have none (-1).
  const focus = caIsFocus(a);
  // A practice card (view:'card') draws its own body — caCardBodyHtml — and
  // keeps its steps as the help ladder inside it.
  const card = caIsCard(a);
  const titleHtml = caNumHtml(caNumber(a)) + escHtml(caTitle(a));
  const blurb = caFirstSentence(tf(a, 'intro'));
  const doneAny = caTickCount(caTickKeys(a)) > 0;
  const ctaKey = doneAny ? 'ca.heroKeepGoing' : 'ca.heroStart';
  /* The CTA hides itself once the card is open (CSS, .ca-card--hero[open]) —
     "Start →" over an already-open step ladder reads as a second, unstarted
     thing to do (post-ship review, 2026-09-19). With no thumbnail there is
     nothing left in the right-hand column, so the column goes too rather
     than holding a 210px hole open. */
  const thumbHtml = caHeroThumbHtml(a);
  return `<details class="ca-card ca-card--hero${focus ? ' ca-card--focus' : ''}${card ? ' ca-card--practice' : ''}${caQuietOptional(a, done) ? ' ca-card--optional' : ''}" ${open ? 'open' : ''} data-id="${escAttr(a.id)}" ontoggle="caOnToggle(this)">
    <summary class="ca-card-summary ca-hero-summary" onclick="caCardMarkOpening(this)">
      <div class="ca-hero-main">
        ${caHeroChipHtml(chipIso)}${caStartHereTagHtml(a)}
        <div class="ca-hero-title">${titleHtml}</div>
        ${blurb ? `<p class="ca-hero-blurb">${escHtml(blurb)}</p>` : ''}
        ${caChunkMetaHtml(a)}
      </div>
      <div class="ca-hero-side${thumbHtml ? '' : ' ca-hero-side--cta-only'}">
        ${thumbHtml}
        <span class="ca-hero-cta">${escHtml(t(ctaKey))} &rarr;</span>
      </div>
    </summary>
    ${caCardBodyBlockHtml(a, done, focus, card)}
  </details>`;
}
// The check variant carries its own "Exit check" tag + blue band (item 2)
// rather than caCheckCardHtml's "Exit check · Title" prefix — the pill
// already says it, so the hero title is just the plain title.
function caHeroCheckHtml(a, chipIso = ''){
  const open = caOpenId === a.id;
  const blurb = caFirstSentence(tf(a, 'intro'));
  const done = classActivities[a.id] === true;
  return `<details class="ca-card ec-card ca-card--hero ca-card--hero-check${caQuietOptional(a, done) ? ' ca-card--optional' : ''}" ${open ? 'open' : ''} data-id="${escAttr(a.id)}" ontoggle="caOnToggle(this)">
    <summary class="ca-card-summary ca-hero-summary" onclick="caCardMarkOpening(this)">
      <div class="ca-hero-main">
        ${caHeroChipHtml(chipIso)}${caStartHereTagHtml(a)}
        <div class="ca-hero-title">${escHtml(caTitle(a))}</div>
        ${blurb ? `<p class="ca-hero-blurb">${escHtml(blurb)}</p>` : ''}
        ${caCheckMetaHtml(a)}
      </div>
      <div class="ca-hero-side ca-hero-side--cta-only">
        <span class="ca-hero-cta">${escHtml(t('ca.heroStartCheck'))} &rarr;</span>
      </div>
    </summary>
    <div class="ca-card-body" id="ec-body-${escAttr(a.id)}">${caCheckBodyHtml(a, {})}</div>
  </details>`;
}
// Per-step accordion state. caStepOpen maps activity id -> open step index
// (-1 = none) and is session-only. caStepDone maps "activityId:stepIndex"
// (and "activityId:c<n>" for a practice card's checks) -> true and is SAVED
// TO THE STUDENT'S PROGRESS DOC as `caSteps` (Jonathan, 2026-10-01: ticks
// must not reset each day or live on the Chromebook). loadProgress() reads
// it; every tick goes through onCaStepChange(). Read at render time by
// caActivityCardHtml, then kept in sync by direct DOM edits in
// caToggleStepOpen/caMarkStepDone so marking a step done doesn't force a full
// re-render of the card (which would cut off any playing TAB audio in other
// steps).
let caStepOpen = {};
let caStepDone = {};
function caCleanTicks(raw){
  const out = {};
  if(raw && typeof raw === 'object') Object.keys(raw).forEach(k => { if(raw[k] === true) out[k] = true; });
  return out;
}
/* Until 2026-10-01 the ticks lived in localStorage for the day
   (`caStepsToday`). Fold any still on this Chromebook into the student's
   progress once, then drop the local copy, so nobody loses today's ticks to
   the switch. */
const CA_STEPS_LEGACY_KEY = 'caStepsToday';
function caAdoptLocalTicks(){
  if(!currentUser || progressLoadFailed || isDevBypassUser()) return;
  try{
    const k = _uidKey(CA_STEPS_LEGACY_KEY);
    const saved = JSON.parse(localStorage.getItem(k) || 'null');
    localStorage.removeItem(k);
    const done = saved && saved.done && typeof saved.done === 'object' ? saved.done : {};
    const add = Object.keys(done).filter(key => done[key] === true && caStepDone[key] !== true);
    add.forEach(key => { caStepDone[key] = true; });
    if(add.length) queueSave('caSteps');
  }catch(e){ /* storage unavailable or bad JSON — nothing to adopt */ }
}
let caRevealsDay = null;   // whose day the revealed-tab set belongs to
function caLocalDay(){
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
/* Called first thing by renderClassActivities. The ticks themselves no
   longer reset; only a tab the last student (or yesterday) waited out starts
   hidden again. */
function caResetRevealsIfNewDay(){
  const who = ((currentUser && currentUser.uid) || '') + '|' + caLocalDay();
  if(caRevealsDay === who) return;
  caRevealsDay = who;
  if(typeof caRevealedTabs !== 'undefined') caRevealedTabs.clear();
}
// The first not-done step on the student's route (a flat index), -1 = all done.
function caDefaultOpenStep(a){
  const route = caRoute(a);
  for(const i of route) if(caStepDone[`${a.id}:${i}`] !== true) return i;
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
function caStepHeadText(step, si, total){
  // `total` only in Focus view (caIsFocus) — "Step 3 of 6", since the other
  // five steps are off screen there and the count is the only map left.
  const n = total ? t('ca.focusStepOf', {n: si + 1, total}) : t('ca.stepLabel', {n: si + 1});
  const label = step && step.label ? tf(step, 'label') : '';
  return label ? `${n}: ${label}` : n;
}
/* `si` is the step's FLAT index in a.steps — every key (ticks, BPM, drill
   state) hangs off it. `opts.pos` / `opts.total` are where the step sits on
   the student's ROUTE (caRoute): the same thing except on a paths activity,
   where the head reads "Step 2 of 6" by route, not by file position. */
function caStepHtml(a, step, si, isOpen, isDone, opts){
  const parts = [];
  const focus = caIsFocus(a);
  const pos = (opts && opts.pos !== undefined) ? opts.pos : si;
  const total = (opts && opts.total) || (a.steps || []).length;
  /* width/height reserve the figure's box before the SVG arrives — without
     them the card jumps as each one loads. Every img/ca-*.svg is drawn on the
     same 640x244 board; checks.mjs (1v) fails the push if one isn't, and if
     this line and renderTeacherActivityDetail() in teacher.js ever disagree.
     TWO RENDERERS — patch both (CLAUDE.md). */
  if(step.figure) parts.push(`<span class="step-figure"><img src="${escAttr(step.figure)}" alt="${escAttr(step.figureAlt ? tf(step, 'figureAlt') : '')}" width="640" height="244"></span>`);
  if(step.video && step.video.id){
    const url = `https://www.youtube.com/watch?v=${encodeURIComponent(step.video.id)}${step.video.start ? `&start=${Number(step.video.start)}` : ''}`;
    const vLabel = step.video.label ? escHtml(tf(step.video, 'label')) : escHtml(t('ca.watchVideo'));
    parts.push(`<button type="button" class="rp-trigger" onclick="loadPanel('youtube','${escAttr(url)}','${escAttr(t('nav.classActivities'))}','YouTube')">&#x25B6; ${vLabel}</button>`);
  }
  // defaultLinesPerPage: a long tab shows two rows at a time (buildPagedTabBody).
  if(step.tab) parts.push(buildTab(step.tab, { keyPrefix: `bpm:ca:${a.id}:${si}:tab`, defaultLinesPerPage: CA_TAB_LINES_PER_PAGE }));
  /* A drawn strum pattern (step.strum, ca-46) — ONE builder, buildStrum(),
     shared with renderTeacherActivityDetail() in teacher.js. */
  if(step.strum) parts.push(buildStrum(step.strum, { keyPrefix: `bpm:ca:${a.id}:${si}:strum` }));
  /* Right under the tab on purpose: the snippet is those same bars played by
     the band, so the two read as one pair. ONE builder, shared with
     teacher.js's renderTeacherActivityDetail() — see buildSnippet(). */
  if(step.snippet) parts.push(buildSnippet(step.snippet, { hasTab: !!step.tab }));
  /* Same step-level drill widgets the module sets get (shuffle/deck/ear) —
     activities replace paper self-quizzes the same way module steps do. The
     key namespace is `<activityId>-s<i>`, which can't collide with the
     module keys (`<setId>-<ns>-<i>`) sharing these state maps. No `wid`:
     that's a module set id, used only for the peek check (a missing one
     reads as "not peeking", which is right — activities have no peek mode)
     and for the skill check-off, which activity drills don't offer since
     `drill.skill` is a module skill id and activities have none. */
  if(step.drill) parts.push(renderShuffleDrill(step.drill, `${a.id}-s${si}`, null));
  // The Journey door lives in the LAST step and nowhere else (see caJourneyLinkHtml).
  if(si === (a.steps || []).length - 1) parts.push(caJourneyLinkHtml(a));
  // Step text is first-party authored HTML, same trust level as module step
  // content — trusted (not escHtml'd). Since 2026-11-10 an activity step is
  // one plain line (no list, no got-it label); wrapGotItWhen() reads its
  // count and puts the tap dots under it.
  /* `|| ''`: a label + drill step (ca-23) has no text at all, and
     wrapGotItWhen passes a non-string straight through — so the template
     printed the word "undefined" under every step label (2026-09-30). */
  // The one-line opt-in below: the step has no got-it label, so its whole line's count makes the dots.
  const detailHtml = `${wrapGotItWhen(tf(step,'text') || '', {
      key: `ca:${a.id}:${si}`, isDone, closestSel: '.ca-step', btnSel: focus ? '.ca-focus-next' : '.ca-step-donebtn', id: a.id, extra: si,
      wholeLine: true,
    })}${parts.join('')}`
    + (focus ? caFocusNavHtml(a, si, isDone)
      : `<div class="ca-step-done-row"><button type="button" class="ca-step-donebtn${isDone ? ' is-done' : ''}" onclick="caMarkStepDone(this,'${escAttr(a.id)}',${si})">${stepDoneHtml(isDone)}</button></div>`);
  /* Focus view: the head is a plain label, not the accordion toggle — there
     is nothing to collapse into, the dots and the nav buttons move between
     steps. Same classes, so the print sheet reads the same either way. */
  if(focus){
    return `<li class="ca-step${isDone ? ' ca-step-done' : ''}${isOpen ? '' : ' ca-step-collapsed'}" data-idx="${si}">`
      + `<div class="ca-step-head ca-step-head--focus" tabindex="-1">`
      + `<span class="ca-step-status" aria-hidden="true">${caStepStatusHtml(pos + 1, isDone)}</span>`
      + `<span class="ca-step-label">${escHtml(caStepHeadText(step, pos, total))}</span>`
      + `</div>`
      + `<div class="ca-step-detail">${detailHtml}</div>`
      + `</li>`;
  }
  return `<li class="ca-step${isDone ? ' ca-step-done' : ''}${isOpen ? '' : ' ca-step-collapsed'}" data-idx="${si}">`
    + `<button type="button" class="ca-step-head" aria-expanded="${isOpen}" onclick="caToggleStepOpen(this)">`
    + `<span class="ca-step-status" aria-hidden="true">${caStepStatusHtml(pos + 1, isDone)}</span>`
    + `<span class="ca-step-label">${escHtml(caStepHeadText(step, pos))}</span>`
    + `<span class="ca-step-chev" aria-hidden="true">&#9656;</span>`
    + `</button>`
    + `<div class="ca-step-detail">${detailHtml}</div>`
    + `</li>`;
}
/* ── Focus view (`view: 'focus'` on an activity — Jonathan, 2026-09-25) ──
   The same step ladder, shown one step at a time: a row of numbered step
   buttons over the card (done = green ✓, current = filled), only the current
   step on screen, and a "Got it — next step" button under it in place of
   Mark done. Presentation only — the steps, the ids, the saved ticks in
   caStepDone and the Mark complete row are exactly what the accordion uses,
   so an activity can be switched in or out of Focus view at any time
   without touching anyone's progress.

   Moving forward is gated on the ticks: a step button is live up to the
   first step not yet marked done, so a student can go back to anything
   they've done but can't open the full song before the verse. Every move
   re-renders through caFocusActivity (the deep-link path), which keeps the
   card open, opens whichever fold it sits in and scrolls its top into view
   — and stopCardAudio() first, because the step that was playing is about
   to leave the screen. Print is unaffected: printActivity() uncollapses
   every step, and the dots and nav are print:none. */
function caIsFocus(a){ return !!(a && a.view === 'focus'); }
/* ── PATHS (`paths` on a Focus-view activity — Jonathan, 2026-11-04: "merge
   them into one activity where the user picks the path they'd like to take
   with a preview of each") ──
   One activity, two (or more) ways through its first steps. The data stays
   ONE flat `steps` array: a step tagged `path: '<key>'` belongs to that path,
   an untagged step is shared and comes after whichever path was taken (the
   tail). `paths: [{ key, label, label_es, blurb, blurb_es }]` names the
   choices. Every tick, BPM and drill key still hangs off the step's flat
   index, so a step keeps its tick whichever way it is reached and switching
   paths loses nothing.

   The student's ROUTE (caRoute) is the flat indices of the shared steps plus
   the chosen path's own, in file order; Focus view walks the route, and the
   head reads "Step 2 of 6" by route position. Before a choice the card shows
   the CHOOSER (caPathChooserHtml) in place of the steps: one card per path
   with its label, blurb, the first drawn strum of that path (buildStrum with
   no controls) and its step names, then the shared steps, and a Start
   button. The pick is saved with the step ticks — the key
   `<id>:path:<key>` in caSteps (caPickPath), so it follows the student to
   any Chromebook and reloads with them. "Change path" (caPathRowHtml) clears
   it and brings the chooser back; ticks stay. Counts shown before a choice
   (the collapsed card's "N steps", the hero dots) use the first path.

   Both renderers: the console preview (renderTeacherActivityDetail in
   teacher.js) draws the same chooser and groups the step list by path.
   checks.mjs 1d validates `paths` / `path`; 1bb counts the longest route. */
function caHasPaths(a){ return !!(a && Array.isArray(a.paths) && a.paths.length); }
function caPathKey(a){
  if(!caHasPaths(a)) return '';
  const p = a.paths.find(x => caStepDone[`${a.id}:path:${x.key}`] === true);
  return p ? p.key : '';
}
function caChooserUp(a){ return caHasPaths(a) && !caPathKey(a) && !caIsCard(a); }
// The flat indices of the steps on the student's route, in file order.
function caRoute(a){
  const steps = (a && a.steps) || [];
  if(!caHasPaths(a)) return steps.map((s, i) => i);
  const key = caPathKey(a) || a.paths[0].key;
  return steps.map((s, i) => (!s.path || s.path === key) ? i : -1).filter(i => i >= 0);
}
function caRoutePos(a, si){ return caRoute(a).indexOf(si); }
// The flat indices of one path's own steps, and of the shared tail.
function caPathSteps(a, key){ return ((a && a.steps) || []).map((s, i) => s.path === key ? i : -1).filter(i => i >= 0); }
function caSharedSteps(a){ return ((a && a.steps) || []).map((s, i) => !s.path ? i : -1).filter(i => i >= 0); }
function caPickPath(id, key){
  const a = (window.CLASS_ACTIVITIES || []).find(x => x.id === id);
  if(!a || !caHasPaths(a)) return;
  if(IS_TEACHER_MODE) return;   // the console preview picks nothing for real (its buttons are disabled too)
  stopCardAudio();
  a.paths.forEach(p => {
    const k = `${id}:path:${p.key}`;
    const want = key !== null && key !== undefined && p.key === key;
    if((caStepDone[k] === true) !== want) onCaStepChange(k, want);
  });
  delete caStepOpen[id];   // land on the route's first not-done step
  caRevealedTabs.clear();
  caOpenId = id;
  renderClassActivities();
  caScrollToActivity(id);
}
function caPathChooserHtml(a, opts){
  const inert = !!(opts && opts.preview);   // the console preview: Start buttons shown, disabled
  const steps = a.steps || [];
  const shared = caSharedSteps(a);
  const cards = a.paths.map(p => {
    const own = caPathSteps(a, p.key);
    const pv = own.map(i => steps[i]).find(s => s && s.strum);
    const board = pv ? `<div class="ca-path-preview">${buildStrum(pv.strum, {})}</div>` : '';   // silent: no keyPrefix, so no buttons
    // The step names as the heads will read them, without the "Step N:" part.
    const li = (i, pos, cls) => `<li${cls ? ` class="${cls}"` : ''}>${escHtml((steps[i] && steps[i].label) ? tf(steps[i], 'label') : t('ca.stepLabel', {n: pos + 1}))}</li>`;
    const list = own.map((i, pos) => li(i, pos, '')).concat(shared.map((i, k) => li(i, own.length + k, 'ca-path-shared'))).join('');
    const n = own.length + shared.length;
    return `<div class="ca-path">
      <div class="ca-path-head"><span class="ca-path-name">${escHtml(tf(p, 'label'))}</span><span class="ca-path-count">${escHtml(n === 1 ? t('ca.stepCount1') : t('ca.stepCount', {n}))}</span></div>
      ${p.blurb ? `<p class="ca-path-blurb">${escHtml(tf(p, 'blurb'))}</p>` : ''}
      ${board}
      <ol class="ca-path-steps">${list}</ol>
      <button type="button" class="ca-focus-next ca-path-start"${inert ? ' disabled' : ''} onclick="caPickPath(${jsonAttrArg(a.id)},${jsonAttrArg(p.key)})">${escHtml(t('ca.pathStart'))} &#x25B6;</button>
    </div>`;
  }).join('');
  return `<div class="ca-paths"><p class="ca-paths-title">${escHtml(t('ca.pathPick'))}</p><div class="ca-paths-grid">${cards}</div></div>`;
}
// "Path: In chunks · Change path" over the steps of a paths activity.
function caPathRowHtml(a){
  if(!caHasPaths(a) || caChooserUp(a) || caIsCard(a)) return '';
  const p = a.paths.find(x => x.key === caPathKey(a));
  if(!p) return '';
  return `<div class="ca-path-row"><span class="ca-path-current">${escHtml(t('ca.pathCurrent', {name: tf(p, 'label')}))}</span><button type="button" class="ca-path-change" onclick="caPickPath(${jsonAttrArg(a.id)},null)">${escHtml(t('ca.pathChange'))}</button></div>`;
}
// The step on screen (a flat index): the one the student last moved to, else
// the first not-done step on the route, else (all done) the route's last step.
function caFocusIdx(a){
  const route = caRoute(a);
  const cur = caStepOpen[a.id];
  if(cur !== undefined && route.includes(cur)) return cur;
  const next = caDefaultOpenStep(a);
  return next >= 0 ? next : (route.length ? route[route.length - 1] : -1);
}
/* The intro on a Focus-view card shows with Step 1 only (Jonathan,
   2026-10-10: "maximize the view for class activities on chromebook
   screen"). It is the one line linking to last class; from Step 2 on it
   only pushed the step's TAB further down a 657px screen (ca-17's is three
   lines, 57px). So it is always rendered, and from Step 2 on it carries
   .ca-intro-later, which styles.css hides on SCREEN on the open card only
   (.ca-solo-card). Printing re-renders nothing — it just uncollapses the
   steps already on the page — so leaving the paragraph out of the markup
   instead dropped it from the handout of any Focus card with a tick on it
   (a closed card's openStepIdx is its first undone step), and from every
   print made from the open card past Step 1. The accordion keeps it. */
function caIntroHtml(a, focus, openStepIdx){
  const intro = tf(a, 'intro');
  if(!intro) return '';
  const later = focus && openStepIdx !== 0;
  return `<p class="coach-tip${later ? ' ca-intro-later' : ''}">${escHtml(intro)}</p>`;
}
function caFocusDotsHtml(a, cur){
  const steps = a.steps || [];
  const route = caRoute(a);
  const reach = caDefaultOpenStep(a);   // first not-done step (flat); -1 = all done
  const reachPos = route.indexOf(reach);
  const dots = route.map((si, pos) => {
    const st = steps[si];
    const done = caStepDone[`${a.id}:${si}`] === true;
    // A finished activity never re-locks: once the activity is complete,
    // every step button stays open, whatever its saved ticks say.
    const locked = classActivities[a.id] !== true && reachPos >= 0 && pos > reachPos;
    const cls = `ca-focus-dot${done ? ' is-done' : ''}${si === cur ? ' is-now' : ''}`;
    const label = escAttr(caStepHeadText(st, pos, route.length));
    return `<button type="button" class="${cls}" onclick="caFocusGo('${escAttr(a.id)}',${si})"`
      + `${si === cur ? ' aria-current="step"' : ''}${locked ? ` disabled title="${escAttr(t('ca.focusLocked'))}"` : ` title="${label}"`}`
      + ` aria-label="${label}">${done ? '&#x2713; ' : ''}${pos + 1}</button>`;
  }).join('');
  return `<div class="ca-focus-dots" role="group" aria-label="${escAttr(t('ca.focusDotsAria'))}">${dots}</div>`;
}
function caFocusNavHtml(a, si, isDone){
  const id = escAttr(a.id);
  const route = caRoute(a);
  const pos = route.indexOf(si);
  const last = pos >= route.length - 1;
  const back = pos > 0
    ? `<button type="button" class="ca-focus-back" onclick="caFocusGo('${id}',${route[pos - 1]})">&#x25C0; ${escHtml(t('ca.stepLabel', {n: pos}))}</button>`
    : '';
  const label = isDone ? (last ? `&#x2713; ${escHtml(t('ca.focusDone'))}` : `${escHtml(t('ca.focusGoNext'))} &#x25B6;`)
    : (last ? escHtml(t('ca.focusLast')) : `${escHtml(t('ca.focusNext'))} &#x25B6;`);
  return `<div class="ca-focus-nav">${back}<button type="button" class="ca-focus-next${isDone ? ' is-done' : ''}" onclick="caFocusGotIt('${id}',${si})">${label}</button></div>`;
}
function caFocusGo(id, si){
  stopCardAudio();
  // A real step move restarts that step's reveal countdown. "Done" on the
  // LAST step re-renders the same step, and must not blank its tab again.
  const fa = (window.CLASS_ACTIVITIES || []).find(x => x.id === id);
  if(!fa || caFocusIdx(fa) !== si) caRevealedTabs.clear();
  caStepOpen[id] = si;
  /* Not caFocusActivity(): that also forces the Unfinished/Completed fold
     open for good (caTodoOpen = true), which is right for a deep link but
     wrong here — stepping through the Today hero left the Unfinished fold
     open after "All activities". The card is already open and on screen;
     renderClassActivities() keeps its fold open while it's inside one. */
  caOpenId = id;
  renderClassActivities();
  caScrollToActivity(id);
  // The button pressed went with the old markup — give focus to the step
  // now on screen (tabindex="-1" head) so Tab carries on from there.
  const head = document.querySelector(`.ca-card[data-id="${CSS.escape(id)}"] .ca-step:not(.ca-step-collapsed) .ca-step-head--focus`);
  if(head) head.focus({preventScroll: true});
}
// "Got it": tick the step (the same caStepDone the accordion's Mark done
// writes) and move to the next one. On an already-done step it just moves
// on; on the LAST step it toggles, so a mistaken tap can be taken back.
// A second activation inside 400 ms is ignored: the first re-renders the
// card, and where steps share a layout (ca-23) the second tap of a double
// tap lands on the NEXT step's button and would tick that step too.
let caFocusGotItAt = 0;
function caFocusGotIt(id, si){
  const a = (window.CLASS_ACTIVITIES || []).find(x => x.id === id);
  if(!a) return;
  const now = performance.now();
  if(now - caFocusGotItAt < 400) return;
  caFocusGotItAt = now;
  const key = `${id}:${si}`;
  const route = caRoute(a);
  const pos = route.indexOf(si);
  const last = pos >= route.length - 1;
  const next = last ? si : route[pos + 1];
  if(caStepDone[key] === true){
    if(last) onCaStepChange(key, false);
    caFocusGo(id, next);
    return;
  }
  onCaStepChange(key, true);
  caFocusGo(id, next);
}
/* An activity that names a Song Journey page (`journey: '<slug>'`, see the
   JOURNEY note atop class-activities.js) gets a link button under its steps
   — the same .jl-song-btn the module ladder's Take-it-to-a-song card uses,
   opening tabs/<slug>.html (#layer-<n> when `journeyLayer` is set) in a new
   tab. journey.js leaves that page ungated while this activity is pending;
   the button is just the door. TWO RENDERERS — teacher.js's
   renderTeacherActivityDetail() shows the same button in the console
   preview (as a plain link there, since the preview lives outside #app). */
function caJourneyUrl(a){
  if(a.card && a.card.wholeSong) return '';   // the card IS the play-along
  if(songsPlayAlongCard(a.journey)) return '';   // students can open it — play-along first
  const sg = a.journey && SONG_JOURNEYS.find(s => s.id === a.journey);
  if(!sg) return '';
  /* The return address rides in the hash after the layer (navigability
     work order 2026-09-23, item 1): journey.js reads `from=` for its
     "Back to class site" link, so a student sent from this card lands
     back ON this card (the #class-activities/<id> deep link) rather than
     on a second copy of the home page. Hash, not a query string — sw.js
     matches precache entries by full URL, so `?from=` would miss the
     cache and, offline, fall back to the app shell. */
  return journeyHref(sg.url, a.journeyLayer ? Number(a.journeyLayer) : 0, `class-activities/${a.id}`);
}
/* One builder for every Journey-page link the site opens: tabs/<slug>.html
   + '#layer-N' (when a layer is named) + '&from=<hash without #>' (when
   there is somewhere specific to come back to). journey.js splits the
   hash on '&' — see openFromHash / journeyReturn there. */
function journeyHref(url, layer, from){
  const parts = [];
  if(layer) parts.push(`layer-${layer}`);
  if(from) parts.push(`from=${encodeURIComponent(from)}`);
  return url + (parts.length ? '#' + parts.join('&') : '');
}
/* The `from` for a Journey link opened from wherever the student is now:
   the page's own hash without the '#' — 'songs', 'class-activities',
   'class-activities/ca-20' — so "Back to class site" lands back on it
   (2026-10-12). '' on the practice view, which needs no address: the bare
   site reopens the last set by itself (lastSet). */
function journeyFromHere(){ return (location.hash || '').slice(1); }
function caJourneyLinkHtml(a){
  const url = caJourneyUrl(a);
  if(!url) return '';
  const sg = SONG_JOURNEYS.find(s => s.id === a.journey);
  return `<div class="ca-journey-row"><button type="button" class="jl-song-btn" onclick="window.open('${escAttr(url)}','_blank','noopener')">${escHtml(t('ca.openJourney', { song: sg.name }))} &#x2197;</button></div>`;
}
/* A button on card `from` that opens another class activity's card — a
   Level up's `card: '<id>'`. Shown once the target is released or set to
   Play Along now; nothing renders before that, so it never leads to "not
   posted yet". A released target opens where it sits in the list. One that
   is only Play Along now SWAPS INTO THE SLOT of the card the button is on
   (caSwap, read by renderClassActivities): no Songs heading, nothing added
   to the list, and closing it puts `from` back (Jonathan, 2026-10-06 — the
   card isn't assigned yet, so it mustn't show up as an entry on the page). */
let caSwap = null;   // { from, to } while a Level up's target is open in `from`'s slot
// Live only while the swapped-in card is the one open: a caSwap left over
// after the card closed (or another card opened) must not keep marking it.
function caIsSwapIn(a){ return !!(caSwap && a && caSwap.to === a.id && caOpenId === a.id); }
function caCardLinkHtml(from, id){
  const b = (window.CLASS_ACTIVITIES || []).find(x => x.id === id);
  if(!b || !(caIsVisible(b) || caIsPlayAlongOnly(b))) return '';
  return `<div class="ca-journey-row"><button type="button" class="jl-song-btn" onclick="caOpenLinkedCard(${jsonAttrArg(from)},${jsonAttrArg(id)})">${escHtml(t('ca.openCard', { title: caTitle(b) }))} &#x2192;</button></div>`;
}
function caOpenLinkedCard(from, id){
  const b = (window.CLASS_ACTIVITIES || []).find(x => x.id === id);
  caSwap = b && !caIsVisible(b) ? { from, to: id } : null;
  goExploreHash('class-activities/' + id);
}
/* The Journey button renders in an activity's LAST step only — every
   activity, current and future (Jonathan, 2026-09-25). caStepHtml() adds it
   to the last step's body whatever that step's text says; there is no copy
   at the top of the card and none in earlier steps. A button above Step 1
   sent students to the song page before they had done the work it caps.
   The step text has to agree: checks.mjs 1ba fails the push when an
   earlier step names the Song Journey page, since that step would be
   pointing at a button it doesn't have. */
/* ── Practice card (`view: 'card'` — Jonathan, 2026-09-27) ─────────────
   The activity as ONE screen instead of a step ladder: the song's tab with
   one "Play song" button that drives it, three or four checkboxes, and the
   step ladder folded away under "More practice help". Built after students
   were doing the directly-taught part of a lesson and stopping there — the
   slides now teach the rungs, and the card is what they practise with.

   Data (see the CARD note atop class-activities.js):
     card: { track, caption, sections: [{ label, caption, fromBar, bars,
             reps?, repLabel?, notes }], checks: [{ label, text } …,
             { levelUp: true, text }] }
   `steps` stay on the activity as the help ladder — ordinary steps,
   rendered read-only (no Mark done) under the help button.

   ONE body renderer, like an exit check: caCardBodyHtml() draws the card
   for the student AND for the console preview (renderTeacherActivityDetail
   passes { preview:true }), so the two-renderers rule has nothing to fall
   into. Preview ticks are DOM-only and never complete anything.

   The player is the snippet engine's arithmetic (snippetWindow /
   snipBarsAt / snipTimeAtBars, one `anchor` per song) over a window that
   runs from the first section to the end of the last. Three differences
   from a step snippet, all Jonathan's calls from the mockup rounds:
   - Every start gets a four-click count-in — Play song as well as a
     tapped section (Jonathan, 2026-09-29: Play song used to drop straight
     into the track with nothing to lead in on). Tapping a section starts
     the song THERE, and the loop comes back to that section — tapping
     Chorus loops the chorus. The count-in plays whether or not Metronome
     is on; a lap of the loop does not count in again. A `wholeSong` card
     does not loop: it stops at the end of the song (Jonathan, 2026-10-02).
   - The tab follows the song note by note (`.beat-now`, the TAB player's
     own cursor), one page per section, honouring each note's `beats`, so
     an uneven riff (Seven Nation Army) is followed as written. A section
     with `reps` shows its notes once and a "Verse 1 of 2" badge. A chord
     card (`card.chordGrid`) is the exception: its cursor sits on the BEATS
     and each chord is drawn once — see CHORD GRID.
   - The Metronome is a click the SITE makes on every counted beat — there
     are no metronome mixes in audio/. Moises clicked "the cure" at the
     file's 144 BPM, twice the 72 the room counts; this click is always the
     counted beat (feltBpm / beatsPerBar in SNIPPET_TRACKS), on both tiers.
     It is scheduled on the AudioContext a few ms ahead, offset by
     snipLatency() so it lands where the music is HEARD, not decoded.
   The speed control is a Slower / Normal switch (the slow and fast files),
   starting on Slower because every card's first checks are on Slower.

   A card is COMPLETE when the student presses its Mark complete button
   (caToggleComplete, like a ladder's last step). Until 2026-11-10 it had a
   checklist and was complete when every numbered check was ticked (pcCheck,
   ticks under `<id>:c<n>` in caStepDone); Jonathan: "get rid of the
   checklists on the activities. only have mark complete or next step". The
   checks stay in the data, saved ticks stay in progress, nothing reads them
   (caTickKeys). */
/* ── Chord versions: one activity, two ways to play it ──
   Jonathan, 2026-10-16: "add power chords as an option to the las mananitas
   activities. don't add activities but make a toggle switch to switch
   between a power chord version and a full chord version."

   An activity opts in with `chordVersions: { power: { <chord>: <shape> } }`
   (ca-34, ca-35). The card then shows a Full chords / Power chords switch,
   and in power mode every renderer draws caView(a) instead of `a`:
     - every chord note (`frets` + a `note` the map names) becomes the mapped
       shape, keeping its `beats`;
     - every "[A]"-style chord mark in a string (lyric rows, phrase labels)
       is renamed to the mapped chord, "[A5]";
     - any field with a `_power` twin (`text_power`, `label_power_es`,
       `caption_power`, `intro_power`…) replaces the base field.
   Nothing else moves: same id, same steps, same checks, same tick keys,
   same beats, so progress is shared by both versions and a student can
   switch mid-song. The choice is a per-viewer convenience in localStorage
   (`caChordModes`, { id: 'power' | 'full' }). Until a student picks, the
   card opens on `chordStart` ('power' on ca-34 and ca-35 — Jonathan,
   2026-10-16: "have it default to the power chord version to start"),
   else Full. ONE transform, called at
   the top of caHeroCardHtml, caActivityCardHtml, caCardBodyHtml and
   teacher.js's renderTeacherActivityDetail, so the two renderers can't
   disagree. checks.mjs 1d validates the map and the `_power` twins. */
const CA_CHORD_MODES_KEY = 'caChordModes';
let caChordModes = (() => {
  try { const v = JSON.parse(localStorage.getItem(CA_CHORD_MODES_KEY) || '{}'); return v && typeof v === 'object' ? v : {}; }
  catch(e) { return {}; }
})();
function caHasChordVersions(a){ return !!(a && a.chordVersions && a.chordVersions.power && typeof a.chordVersions.power === 'object'); }
function caChordMode(a){
  if(!caHasChordVersions(a)) return 'full';
  const m = caChordModes[a.id] || a.chordStart;
  return m === 'power' ? 'power' : 'full';
}
/* ── Key versions: one activity, two keys ──
   Jonathan, 2026-10-16, for Madrecita Querida (ca-36): "Do F and G with a
   toggle switch. Default to G." The record is in F, so full chords would be
   F and Bb barres; a second copy of the record raised to G gives open G, C
   and D7. An activity opts in with
     key: 'G',                         // the key its chords are written in
     keyStart: 'G',                    // optional: the key it opens on
     keyVersions: { F: { track, full: { <chord>: <shape> },
                                power: { <chord>: <shape> } } }
   and the card shows a Key of G / Key of F switch beside the chord switch.
   In another key caView swaps every chord through that key's `full` map
   (or its `power` map when the chord switch says Power chords), renames the
   "[G]" marks the same way, and plays the key's own `track` — the same
   record pitch-shifted with the timing held, so its bar map is identical
   (checks.mjs 1d pins that). Same id, checks and tick keys in every key.
   The choice is per viewer in localStorage (`caKeyModes`, { id: key }),
   like the chord switch. */
const CA_KEY_MODES_KEY = 'caKeyModes';
let caKeyModes = (() => {
  try { const v = JSON.parse(localStorage.getItem(CA_KEY_MODES_KEY) || '{}'); return v && typeof v === 'object' ? v : {}; }
  catch(e) { return {}; }
})();
function caHasKeyVersions(a){ return !!(a && a.key && a.keyVersions && typeof a.keyVersions === 'object' && Object.keys(a.keyVersions).length); }
function caKeyList(a){ return caHasKeyVersions(a) ? [a.key].concat(Object.keys(a.keyVersions)) : []; }
function caKeyMode(a){
  if(!caHasKeyVersions(a)) return null;
  const k = caKeyModes[a.id] || a.keyStart || a.key;
  return caKeyList(a).includes(k) ? k : a.key;
}
/* ── Recording versions: one activity, two recordings of the song ──
   Jonathan, 2026-10-30, for All Along the Watchtower: "a toggle switch to
   switch between the Neil Young track and the Jimi Hendrix track. Make Jimi
   the default. The timing will change based on the selection." Unlike a key
   version (the same record moved, so the same bar map), a different
   RECORDING has its own tempo, bars, form and chord rhythm, so a version
   carries everything that depends on the track:
     recording: 'jimi',                 // the recording the data above is written for
     recordingLabel: 'Jimi Hendrix', recordingLabel_es: 'Jimi Hendrix',
     recordingGroup: 'all-along-the-watchtower',   // one choice for every card of the song
     recordingStart: 'jimi',            // optional: the one it opens on
     recordingVersions: { neil: { label, label_es, track,
                                  card: { sections, caption, ... } } }
   caView lays the version's `card` fields over the activity's own and plays
   its `track`; the checks, tick keys and id are the activity's, unchanged.
   A version may also carry `title`, `title_es`, `intro` and `intro_es` beside
   `label` / `track` (not inside `card`), for a card whose name or blurb
   describes the recording (ca-40: Jimi's is "1 Strum per Chord", Neil's is
   "Down-Up Strum"). caView lays them over the activity too, so caTitle() and
   every renderer that reads the view show the recording on screen; the board,
   pins and the console's list rows read caTitle / teacherActivityTitle, so they
   follow the chosen recording the same way (as title_power does for ca-34).
   Known limit, the same trade title_power makes: a teacher rename is one title
   for the whole card (`activityTitles[id] = { en, base }`, base = the card's own
   title), so a rename typed on the Neil title shows on Jimi as well, and typing
   a version's own title on the other recording is stored as a rename, not
   cleared. The search index reads the card's own (Jimi) intro and title words.
   The choice is per viewer in localStorage (`caRecordingModes`, { group:
   recording }), like the key and chord switches. */
const CA_RECORDING_MODES_KEY = 'caRecordingModes';
let caRecordingModes = (() => {
  try { const v = JSON.parse(localStorage.getItem(CA_RECORDING_MODES_KEY) || '{}'); return v && typeof v === 'object' ? v : {}; }
  catch(e) { return {}; }
})();
function caHasRecordingVersions(a){ return !!(a && a.recording && a.recordingGroup && a.recordingVersions && typeof a.recordingVersions === 'object' && Object.keys(a.recordingVersions).length); }
function caRecordingList(a){ return caHasRecordingVersions(a) ? [a.recording].concat(Object.keys(a.recordingVersions)) : []; }
function caRecordingMode(a){
  if(!caHasRecordingVersions(a)) return null;
  const r = caRecordingModes[a.recordingGroup] || a.recordingStart || a.recording;
  return caRecordingList(a).includes(r) ? r : a.recording;
}
const caChordViews = new WeakMap();   // raw activity -> Map('<key>|<mode>' -> view)
function caView(a){
  if(!a || a.__chordView) return a;
  const power = caChordMode(a) === 'power';
  const k = caKeyMode(a);
  const kv = (k && k !== a.key) ? a.keyVersions[k] : null;
  const bass = caBassMode(a) === 'on';   // alternating bass — see BASS NOTES below
  const rec = caRecordingMode(a);
  const rv = (rec && rec !== a.recording) ? a.recordingVersions[rec] : null;
  if(!power && !kv && !bass && !rv) return a;
  const combo = (kv ? k : '') + '|' + (power ? 'power' : 'full') + (bass ? '|bass' : '') + (rv ? '|rec:' + rec : '');
  let byCombo = caChordViews.get(a);
  if(!byCombo){ byCombo = new Map(); caChordViews.set(a, byCombo); }
  const hit = byCombo.get(combo);
  if(hit) return hit;
  const map = kv ? ((power ? kv.power : kv.full) || {}) : (power ? a.chordVersions.power : {});
  const keys = Object.keys(map).sort((x, y) => y.length - x.length);
  const re = keys.length ? new RegExp('\\[(' + keys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\]', 'g') : null;
  const walk = v => {
    if(typeof v === 'string') return re ? v.replace(re, (m, k) => `[${map[k].note}]`) : v;
    if(Array.isArray(v)) return v.map(walk);
    if(v && typeof v === 'object'){
      // The maps themselves are data, not content: never rename inside them.
      if(v === a.chordVersions || v === a.keyVersions || v === a.bassNotes || v === a.recordingVersions) return v;
      if(Array.isArray(v.frets) && Object.prototype.hasOwnProperty.call(map, v.note)){
        const c = map[v.note];
        return { ...v, frets: c.frets.map(f => f.slice()), midi: c.midi.slice(), note: c.note };
      }
      const out = {};
      Object.keys(v).forEach(k => { out[k] = walk(v[k]); });
      if(power) Object.keys(v).forEach(k => {
        const m = /^(.+)_power(_es)?$/.exec(k);
        if(m) out[m[1] + (m[2] || '')] = out[k];
      });
      return out;
    }
    return v;
  };
  const view = walk(a);
  if(kv && view.card) view.card = { ...view.card, track: kv.track };
  if(rv && view.card) view.card = { ...view.card, ...rv.card, track: rv.track };   // the recording's own bars, form and rhythm
  if(rv) ['title', 'title_es', 'intro', 'intro_es'].forEach(f => { if(rv[f]) view[f] = rv[f]; });   // its own name and blurb, where it has them (ca-40)
  if(bass && view.card) view.card = { ...view.card, __bass: a.bassNotes };
  view.__chordView = true;
  byCombo.set(combo, view);
  return view;
}
function caKeySwitchHtml(a){
  if(!caHasKeyVersions(a)) return '';
  const cur = caKeyMode(a);
  const id = escAttr(a.id);
  return `<div class="ca-chord-switch ca-key-switch" role="group" aria-label="${escAttr(t('ca.keyVersion'))}">`
    + caKeyList(a).map(k => `<button type="button" class="snip-toggle${k === cur ? ' on' : ''}" aria-pressed="${k === cur ? 'true' : 'false'}" onclick="caSetKeyMode('${id}','${escAttr(k)}')">${escHtml(t('ca.keyOf', {key: k}))}</button>`).join('')
    + `</div>`;
}
/* Redraw in the other key — same shape as caSetChordMode below. */
function caSetKeyMode(id, k){
  const a = (window.CLASS_ACTIVITIES || []).find(x => x.id === id);
  if(!a || !caKeyList(a).includes(k) || caKeyMode(a) === k) return;
  caKeyModes[id] = k;
  try { localStorage.setItem(CA_KEY_MODES_KEY, JSON.stringify(caKeyModes)); } catch(e) {}
  stopCardAudio();
  if(IS_TEACHER_MODE && caTeacherRedraw(id)) return;
  caOpenId = id;
  renderClassActivities();
}
function caRecordingSwitchHtml(a){
  if(!caHasRecordingVersions(a)) return '';
  const cur = caRecordingMode(a);
  const label = r => r === a.recording ? tf(a, 'recordingLabel') : tf(a.recordingVersions[r], 'label');
  return `<div class="ca-chord-switch ca-key-switch ca-rec-switch" role="group" aria-label="${escAttr(t('ca.recordingVersion'))}">`
    + caRecordingList(a).map(r => `<button type="button" class="snip-toggle${r === cur ? ' on' : ''}" aria-pressed="${r === cur ? 'true' : 'false'}" onclick="caSetRecordingMode(${jsonAttrArg(a.id)},${jsonAttrArg(r)})">${escHtml(label(r))}</button>`).join('')
    + `</div>`;
}
/* Redraw a card in the teacher console after one of its switches. The Teacher
   view songs tab (renderTeacherViewSongs, teacher.js) draws its own card and
   leaves a card that is already up alone on a config re-read, so it is told
   to start over; any other console page is the activity's detail page. Without
   this a switch on ca-40 swapped the room's projector card for the Class
   activities detail page (review R1-1, 2026-10-30). Used by all four switches. */
function caTeacherRedraw(id){
  if(typeof teacherView !== 'undefined' && teacherView === 'tsongs' && typeof renderTeacherViewSongs === 'function'){
    const cur = document.querySelector('[data-tvs]');
    if(cur) cur.removeAttribute('data-tvs');
    renderTeacherViewSongs();
    return true;
  }
  if(typeof renderTeacherActivityDetail === 'function'){ renderTeacherActivityDetail(id); return true; }
  return false;
}
/* Redraw with the other recording — same shape as caSetKeyMode. The choice
   belongs to the song (recordingGroup), so every card of it follows. */
function caSetRecordingMode(id, r){
  const a = (window.CLASS_ACTIVITIES || []).find(x => x.id === id);
  if(!a || !caRecordingList(a).includes(r) || caRecordingMode(a) === r) return;
  caRecordingModes[a.recordingGroup] = r;
  try { localStorage.setItem(CA_RECORDING_MODES_KEY, JSON.stringify(caRecordingModes)); } catch(e) {}
  stopCardAudio();
  if(IS_TEACHER_MODE && caTeacherRedraw(id)) return;
  caOpenId = id;
  renderClassActivities();
}
function caChordSwitchHtml(a){
  if(!caHasChordVersions(a)) return '';
  const p = caChordMode(a) === 'power';
  const id = escAttr(a.id);
  return `<div class="ca-chord-switch" role="group" aria-label="${escAttr(t('ca.chordVersion'))}">`
    + `<button type="button" class="snip-toggle${p ? '' : ' on'}" aria-pressed="${p ? 'false' : 'true'}" onclick="caSetChordMode('${id}','full')">${escHtml(t('ca.chordFull'))}</button>`
    + `<button type="button" class="snip-toggle${p ? ' on' : ''}" aria-pressed="${p ? 'true' : 'false'}" onclick="caSetChordMode('${id}','power')">${escHtml(t('ca.chordPower'))}</button>`
    + `</div>`;
}
/* Redraw in the other version. stopCardAudio first: the tab or song that
   was playing belongs to markup about to be replaced. Not the full sweep —
   a metronome the student started stays on (see the two silencers). */
function caSetChordMode(id, mode){
  const want = mode === 'power' ? 'power' : 'full';
  const a = (window.CLASS_ACTIVITIES || []).find(x => x.id === id);
  if(a && caChordMode(a) === want) return;
  caChordModes[id] = want;   // stored either way: the card's own start may be 'power'
  try { localStorage.setItem(CA_CHORD_MODES_KEY, JSON.stringify(caChordModes)); } catch(e) {}
  stopCardAudio();
  if(IS_TEACHER_MODE && caTeacherRedraw(id)) return;
  caOpenId = id;
  renderClassActivities();
}
/* ── BASS NOTES: Strum only / Alternating bass ──
   Jonathan, 2026-10-27: "las mananitas play along needs alternate bass note
   option toggle switch" — draw the bass notes in the TAB, open on
   Alternating bass, in both chord versions (ca-35).

   A practice card opts in with
     bassNotes: { <chord name as shown>: { root: [string, fret],
                                           fifth: [string, fret] } }
     bassStart: 'on' | 'off'           // optional: how it opens (else off)
     bassDirections / bassDirections_es  // added to the card's directions when on
   keyed by the name the card SHOWS, so the power view looks up A5, not A.
   (The directions line, not the intro: an open practice card shows no
   intro — only the closed card's one-sentence blurb.) With the bass on,
   caView hands the map to the chord grid as `card.__bass`, and
   caCardBodyHtml adds bassDirections to its directions line;
   renderChordGridRow then draws, on beat 1
   of every bar, the one bass note to pick: the root in the first bar of a
   chord, the 5th in the next, back and forth until the chord changes (a
   new chord starts again on its root). In a bar where the chord itself
   starts on beat 1, its fret on that string is the bass note and is marked,
   not drawn twice (the chord's own fret wins in renderChordGridRow). The
   mark is purple AND underlined (styles.css) — colour alone would vanish
   under the cursor. A rest gets no bass note; a note-by-note section
   (chordGrid:false) is never touched. Display only: no `notes` change, so the
   audio, the beats, the checks and the tick keys are the same both ways.
   The choice is per viewer in localStorage (`caBassModes`, { id: 'on' |
   'off' }), like the chord switch. checks.mjs 1d validates the map (every
   chord the card shows, each note the chord's real root / 5th) and 1bv
   counts the drawn notes in every view. */
const CA_BASS_MODES_KEY = 'caBassModes';
let caBassModes = (() => {
  try { const v = JSON.parse(localStorage.getItem(CA_BASS_MODES_KEY) || '{}'); return v && typeof v === 'object' ? v : {}; }
  catch(e) { return {}; }
})();
function caHasBass(a){ return !!(a && caIsCard(a) && a.bassNotes && typeof a.bassNotes === 'object' && Object.keys(a.bassNotes).length); }
function caBassMode(a){
  if(!caHasBass(a)) return null;
  const m = caBassModes[a.id] || a.bassStart;
  return m === 'on' ? 'on' : 'off';
}
function caBassSwitchHtml(a){
  if(!caHasBass(a)) return '';
  const on = caBassMode(a) === 'on';
  const id = jsonAttrArg(a.id);
  return `<div class="ca-chord-switch ca-bass-switch" role="group" aria-label="${escAttr(t('ca.bassVersion'))}">`
    + `<button type="button" class="snip-toggle${on ? '' : ' on'}" aria-pressed="${on ? 'false' : 'true'}" onclick="caSetBassMode(${id},'off')">${escHtml(t('ca.bassOff'))}</button>`
    + `<button type="button" class="snip-toggle${on ? ' on' : ''}" aria-pressed="${on ? 'true' : 'false'}" onclick="caSetBassMode(${id},'on')">${escHtml(t('ca.bassOn'))}</button>`
    + `</div>`;
}
/* Redraw with or without the bass — same shape as caSetChordMode above. */
function caSetBassMode(id, mode){
  const want = mode === 'on' ? 'on' : 'off';
  const a = (window.CLASS_ACTIVITIES || []).find(x => x.id === id);
  if(!a || caBassMode(a) === want) return;
  caBassModes[id] = want;   // stored either way: the card's own start may be 'on'
  try { localStorage.setItem(CA_BASS_MODES_KEY, JSON.stringify(caBassModes)); } catch(e) {}
  stopCardAudio();
  if(IS_TEACHER_MODE && caTeacherRedraw(id)) return;
  caOpenId = id;
  renderClassActivities();
}
/* The bass note on beat 1 of each bar of one grid row: { <column>: { s, f } }
   — string and fret. Pure: no DOM. */
function pcBassMarks(events, row, bpb, bass){
  const out = {};
  if(!bass) return out;
  const used = Math.round((row.b1 - row.b0) * 2);
  for(let c = 0; c < used; c += bpb * 2){
    const pos = row.b0 + c / 2;
    const ev = events.find(e => !e.rest && e.start <= pos + 1e-6 && pos < e.start + e.beats - 1e-6);
    const b = ev && bass[ev.name];
    if(!b) continue;
    const k = Math.round(pos / bpb) - Math.ceil(ev.start / bpb - 1e-6);   // bars of this chord before this one
    const pick = k % 2 ? b.fifth : b.root;
    out[c] = { s: pick[0], f: pick[1] };
  }
  return out;
}
function caIsCard(a){ return !!(a && a.view === 'card' && a.card); }
function caCardChecks(a){ return (a && a.card && Array.isArray(a.card.checks)) ? a.card.checks : []; }
/* A check's tick key. Positional by default; `slot: n` pins it to the key it
   had before earlier checks were removed, so a saved tick stays on its own
   box (ca-25 lost its first two checks, 2026-10-07). */
function caCheckKey(a, c, ci){ return `${a.id}:c${(c && Number.isInteger(c.slot)) ? c.slot : ci}`; }
/* The ticks an activity counts: a ladder's steps. Every "n of m done" reader
   goes through these two so they can't disagree about what finishing means.
   A practice card counts NONE since 2026-11-10 (Jonathan: "get rid of the
   checklists on the activities. only have mark complete or next step"): it
   has no checklist, and its Mark complete button finishes it outright (no
   nudge, no "n of m"). Its checks stay in the data, and ticks a student saved
   (`<id>:c<n>`) stay in their progress; nothing reads them now. */
function caTickKeys(a){
  if(caIsCard(a)) return [];
  // A paths activity counts the steps on the student's route (caRoute).
  return caRoute(a).map(si => `${a.id}:${si}`);
}
function caRequiredTickKeys(a){
  return caTickKeys(a);
}
function caTickCount(keys){ return keys.filter(k => caStepDone[k] === true).length; }
