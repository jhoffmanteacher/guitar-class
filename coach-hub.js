/* ════════════════════════════════════════════════════════════════════
   NOTE HUNT — fretboard trainer game (lives in the 🎮 Games panel).

   Opening the game from the hub starts the mic; leaving it (back, close,
   tuner, a Coach check) stops it. The game names a note ("Find G on the
   A string"), the student plays it, and the shared Coach detection
   verifies the EXACT pitch (string+fret → one midi). Wrong answers get a
   fret-distance hint ("I heard A — go 2 frets down"); octave slips get
   their own hint. A round is 10 prompts; the score counts first-try
   finds. Naturals only, frets 0–10 — the Module 9/10 fretboard-map
   territory.
   ════════════════════════════════════════════════════════════════════ */

const FRET_NATURALS = [0, 2, 4, 5, 7, 9, 11];          // C D E F G A B
// label = pure musical notation (kept as-is in every language); labelKey = a
// real word ("Open", "All 6") that needs translation — resolved at render
// time in fretRender(), never here (this table is built once at load).
const FRET_GAME_LEVELS = [
  { labelKey: 'games.fret.level.open', strings: [6,5,4,3,2,1], maxFret: 0 },
  { label: 'E · A', strings: [6,5],         maxFret: 10 },
  { label: 'D · G', strings: [4,3],         maxFret: 10 },
  { label: 'B · e', strings: [2,1],         maxFret: 10 },
  { labelKey: 'games.fret.level.all6', strings: [6,5,4,3,2,1], maxFret: 10 }
];
// String names as translation-key suffixes (games.fret.string.*) — resolved
// via fretStringName() at render time; keys stay plain data here.
const FRET_STRING_NAMES = { 6:'lowE', 5:'A', 4:'D', 3:'G', 2:'B', 1:'highE' };
function fretStringName(s){ return t('games.fret.string.' + FRET_STRING_NAMES[s]); }
const FRET_ROUND = 10;

let fretRunning = false, fretGame = null, fretRaf = null;

/* levelIdx is optional: the restart paths pass the level they want so a
   browser with sessionStorage blocked doesn't silently drop back to level 1. */
async function fretStart(levelIdx){
  if (fretRunning) return;
  coachClose();                                        // one mic owner at a time
  ccStop();
  coachEvictTuner();
  const body = document.getElementById('fret-body');
  if (!body) return;
  body.innerHTML = `<div class="coach-tip">${t('games.fret.startingMic')}</div>`;
  if (!coachStream && !(await coachAcquireMic())){
    const b2 = document.getElementById('fret-body');
    if (b2) b2.innerHTML = `<div class="coach-note">${coachMicFailMsg('games.fret.micDenied')}</div>`;
    return;
  }
  await coachEnsureRunning();
  if (!document.getElementById('fret-body')){ coachReleaseMicIfIdle(); return; }   // panel closed during the prompt
  if (document.hidden){ coachMicOff(); gamesShow('hub'); return; }   // backgrounded during the prompt
  stopAllDemoAudio();
  fretRunning = true;
  window.coachMicLive = true;   // stream may already be open from a prior owner
  let lvl = levelIdx;
  if (lvl == null){ try { lvl = parseInt(sessionStorage.getItem('fretLevel'), 10); } catch(e){} }
  if (!(lvl >= 0 && lvl < FRET_GAME_LEVELS.length)) lvl = 1;
  fretNewRound(lvl);
  if (fretRaf) cancelAnimationFrame(fretRaf);
  fretLoop();
}

function fretStop(){
  if (fretRaf){ cancelAnimationFrame(fretRaf); fretRaf = null; }
  if (fretRunning){ fretRunning = false; coachMicOff(); }
  fretGame = null;
}

/* Also the "play again" path off the done screen. A finished round has
   released the mic (see fretFinish), so starting the next one has to go back
   through fretStart to re-acquire it — otherwise the prompt renders over a
   dead analyser and the game sits there saying "Listening…" forever. */
function fretSetLevel(i){
  try { sessionStorage.setItem('fretLevel', String(i)); } catch(e){}
  if (fretRunning) fretNewRound(i);
  else fretStart(i);
}

function fretNewRound(levelIdx){
  fretGame = { level: levelIdx, tries: 0, results: [], phase: 'play',
               prompt: null, readings: [], cooldownUntil: 0, needSilence: false,
               hint: '', flash: null, lastPitchT: 0, advancing: false };
  fretNextPrompt();
}

function fretNextPrompt(){
  const g = fretGame, L = FRET_GAME_LEVELS[g.level];
  let p = null, guard = 0;
  do {
    const s = L.strings[Math.floor(Math.random() * L.strings.length)];
    const cand = [];
    for (let f = 0; f <= L.maxFret; f++){
      const m = STRING_OPEN_MIDI[s] + f;
      if (FRET_NATURALS.indexOf(((m % 12) + 12) % 12) >= 0) cand.push({ s, f, m });
    }
    p = cand[Math.floor(Math.random() * cand.length)];
  } while (g.prompt && p.m === g.prompt.m && p.s === g.prompt.s && ++guard < 20);
  p.note = coachNoteName(p.m);
  g.prompt = p;
  g.tries = 0; g.hint = ''; g.flash = null; g.readings = []; g.attackT = 0;
  g.advancing = false;
  fretRender();
}

function fretLoop(){
  if (!fretRunning) return;
  // Analyser gone (another feature took the mic) or panel closed under us:
  // stop cleanly instead of leaving a deaf "Listening…" UI running.
  if (!coachAnalyser || !document.getElementById('fret-body')){ fretStop(); return; }
  const g = fretGame;
  const now = performance.now();
  if (g && g.phase === 'play' && g.prompt){
    const rms = coachReadFrame();

    /* One pluck = one answer: after judging, wait for the note to decay
       below the gate (or 1.8s, whichever first) before listening again. */
    /* A right answer's (or a Skip's) reveal is counting down to the next
       prompt: judge nothing until it is up. The 700 ms cooldown ends inside
       the 900 ms reveal, so a re-pluck there was judged against the prompt
       just answered — a phantom miss and a second next-prompt timer. A note
       still ringing when the prompt changes must die or be re-plucked
       first. The onset detector below still LOGS a pluck during the reveal
       (without ending the wait): left deaf, it saw a re-pluck from just
       before the change as a new pluck on the first frame after it, since
       the smoothed level is still catching up. */
    if (g.advancing) g.needSilence = true;
    else if (g.needSilence && (rms < COACH_PITCH_GATE * 0.7 || now > g.cooldownUntil + 1800)){
      g.needSilence = false;
    }
    /* Readings are spaced by wall clock, not frame parity: the analyser
       window is ~43ms, so readings closer together than that all see the
       SAME window (and can sit inside the pick attack). >=40ms apart makes
       the 3-reading consensus span more than one window at any refresh
       rate — same spacing nrLoop uses. */
    if (!g.needSilence && now >= g.cooldownUntil && rms > COACH_PITCH_GATE){
      /* No onset detector in this loop — the first frame over the gate after
         silence IS the pluck. Readings wait out COACH_ATTACK_SKIP from there,
         same guard the Coach and Note Runner use from their onset timestamp. */
      if (!g.attackT) g.attackT = Math.max(coachOnsetAt, g.cooldownUntil);
      const m = coachSettlePitch(g, [g.prompt.m], rms, g.cooldownUntil);
      if (m != null) fretJudge(m);
    } else {
      if (rms < COACH_PITCH_GATE * 0.5){
        g.readings = [];
        g.attackT = 0;    // note died — next gate crossing is a new pluck
      }
      if (g.advancing) coachOnsetTick(g, rms, g.cooldownUntil, now >= g.cooldownUntil);   // log it, end nothing (see above)
      else coachIdleTick(g, rms, g.cooldownUntil);   // a new pluck ends the wait for silence
    }
  }
  // Re-arm only while the round is live: fretJudge/fretSkip can end it
  // mid-frame (fretFinish), and re-arming unconditionally would overwrite the
  // fretRaf that fretFinish just cleared with a live handle to a loop that's
  // already over.
  if (fretRunning) fretRaf = requestAnimationFrame(fretLoop);
}

/* Round over → cross-session best to the student's progress doc. Skipped in
   dev bypass (Firestore rejects that uid). Best = first-try hits out of 10;
   ties keep the earlier entry (level recorded for context, not compared). */
function fretSaveRound(g){
  if (typeof saveGames !== 'function' || !currentUser || isDevBypassUser()) return;
  const score = g.results.filter(Boolean).length;
  const old = (games.fret && games.fret.best) || 0;
  const isNewBest = score > old;
  if (isNewBest) games.fret = { best: score, level: g.level, at: new Date().toISOString().slice(0, 10) };
  if (score > 0) awardArcadeXp(isNewBest);   // ten Skips in a row is not a round played
}

/* Round over → save, release the mic, render the done screen. The mic-off is
   the whole point: fretLoop re-arms every frame as long as fretRunning is
   true and #fret-body exists — and the done screen renders INTO #fret-body —
   so without this the mic stays live after the last prompt, window.coachMicLive
   stays true, and that silently blocks demo audio (app.js) and mutes the
   metronome (fab-tools.js) site-wide until the panel is closed. Every other
   mic game releases at finish (ccFinish, srFinish, rnFinish, nrFinish).
   Unlike fretStop this KEEPS fretGame — the done screen renders from it. */
function fretFinish(g){
  g.phase = 'done';
  fretSaveRound(g);
  if (fretRaf){ cancelAnimationFrame(fretRaf); fretRaf = null; }
  fretRunning = false;   // clear before coachMicOff so coachReleaseMicIfIdle agrees
  coachMicOff();
  fretRender();
}

function fretJudge(midi){
  const g = fretGame, p = g.prompt;
  g.readings = [];
  g.attackT = 0;
  g.needSilence = true;
  g.cooldownUntil = performance.now() + 700;
  g.tries++;
  if (midi === p.m){
    const first = g.tries === 1;
    g.results.push(first);
    g.hint = '';
    g.flash = { text: '&#x2713; ' + t(first ? 'games.fret.firstTry' : 'games.fret.gotThere', { note: escHtml(p.note) }) };
    if (g.results.length >= FRET_ROUND){ fretFinish(g); return; }
    g.advancing = true;   // blocks a Skip press during this reveal, same guard as fretSkip's own
    fretRender();
    setTimeout(() => { if (fretGame === g && g.phase === 'play') fretNextPrompt(); }, 900);
    return;
  }
  const heard = coachNoteName(midi);
  const d = p.m - midi;
  if (d % 12 === 0){
    g.hint = t('games.fret.hintOctave', {
      heard, string: fretStringName(p.s),
      dir: t(midi > p.m ? 'games.fret.higher' : 'games.fret.lower')
    });
  } else if (Math.abs(d) <= 9){
    const dir = t(d > 0 ? 'games.fret.up' : 'games.fret.down');
    g.hint = t(Math.abs(d) > 1 ? 'games.fret.hintNearPlural' : 'games.fret.hintNearSingular', { heard, n: Math.abs(d), dir });
  } else {
    g.hint = t('games.fret.hintFar', { heard, note: p.note });
  }
  fretRender();
}

function fretSkip(){
  const g = fretGame;
  // advancing: a correct-answer flash or an earlier Skip is already
  // counting down to the next prompt — a second press here would push a
  // phantom miss for an already-answered prompt and schedule a duplicate
  // fretNextPrompt.
  if (!g || g.phase !== 'play' || !g.prompt || g.advancing) return;
  const p = g.prompt;
  g.results.push(false);
  g.hint = t('games.fret.skipReveal', { fret: p.f, note: p.note, string: fretStringName(p.s) });
  g.cooldownUntil = performance.now() + 1600;
  g.attackT = 0;
  g.advancing = true;
  if (g.results.length >= FRET_ROUND){ fretFinish(g); return; }
  fretRender();
  setTimeout(() => { if (fretGame === g && g.phase === 'play') fretNextPrompt(); }, 1600);
}

function fretRender(){
  const body = document.getElementById('fret-body');
  if (!body || !fretGame) return;
  const g = fretGame;
  const pills = '<div class="fret-levels">' + FRET_GAME_LEVELS.map((L, i) =>
    `<button type="button" class="ts-btn${i === g.level ? ' active' : ''}" onclick="fretSetLevel(${i})">${L.labelKey ? t(L.labelKey) : L.label}</button>`
  ).join('') + '</div>';
  const dots = '<div class="fret-dots">' + Array.from({ length: FRET_ROUND }, (_, i) => {
    let cls = 'fret-dot';
    if (i < g.results.length) cls += g.results[i] ? ' hit' : ' miss';
    else if (i === g.results.length && g.phase === 'play') cls += ' cur';
    return `<span class="${cls}"></span>`;
  }).join('') + '</div>';
  const foot = coachFootHtml();

  if (g.phase === 'done'){
    const score = g.results.filter(Boolean).length;
    const msg = score >= 9 ? t('games.fret.done.great')
              : score >= 6 ? t('games.fret.done.good')
              : t('games.fret.done.keep');
    body.innerHTML = pills + dots +
      `<div class="fret-score">&#x1F3AF; ${t('games.fret.scoreLine', { score, total: FRET_ROUND })}</div>
       <div class="coach-tip">${msg}</div>
       <button type="button" class="coach-start" onclick="fretSetLevel(${g.level})">&#x21BB; ${t('games.common.playAgain')}</button>` + foot;
    return;
  }
  const p = g.prompt;
  const promptHtml = FRET_GAME_LEVELS[g.level].maxFret === 0
    ? t('games.fret.promptOpen', { string: '<strong>' + fretStringName(p.s) + '</strong>' })
    : t('games.fret.promptFind', { note: '<strong>' + escHtml(p.note) + '</strong>', string: '<strong>' + fretStringName(p.s) + '</strong>' });
  const statusHtml = g.flash
    ? `<div class="fret-flash">${g.flash.text}</div>`
    : g.hint
      ? `<div class="coach-note">${escHtml(g.hint)}</div>`
      : `<div class="fret-listen"><span class="coach-live-dot"></span>${t('games.fret.listening')}</div>`;
  body.innerHTML = pills + dots +
    `<div class="fret-prompt">${promptHtml}</div>` + statusHtml +
    `<button type="button" class="tp-btn fret-skip" onclick="fretSkip()">${t('games.fret.skip')} &#x2192;</button>` + foot;
}

/* ════════════════════════════════════════════════════════════════════
   🎮 GAMES PANEL — the games' home (button beside ⚡ Daily 5, full-width
   panel like the Daily 5 one — deliberately NOT in the floating tools
   corner: that's for tools, this is for play).

   Hub view lists the games as cards; a game view renders the game with a
   "← All games" link. Any exit path (back, ✕, tuner opening, a Coach
   check starting) goes through gamesStopMic() so the mic never lingers.
   ════════════════════════════════════════════════════════════════════ */

/* The games live on their own full-viewport page: #games in the URL, the
   browser Back button exits, and the look is its own (arcade gradient shell
   around a normal-theme stage so the game internals render as designed).
   One of the four EXPLORE_PAGES in app.js, and the only one flagged
   `overlay: true` — it covers the rail and header rather than loading into
   the main column. See that table for why. */
/* toggleGames() — the header button's handler — is defined in app.js, next
   to coachOpenLazy: the button is on the page before this file has loaded. */
function openGamesScreen(){
  const screen = document.getElementById('games-screen');
  if (!screen || !screen.hasAttribute('hidden')) return;
  /* Teacher-controlled access: if games are turned off for this student, don't
     open — even via a bookmarked #games hash (the button is already hidden). */
  if (typeof gamesAccessOn !== 'undefined' && !gamesAccessOn){
    if (location.hash === '#games') exitExploreHash();
    return;
  }
  /* A Coach check or the tuner may still hold the mic (coachMicLive mutes
     site audio and its analyser would grade our game sounds) — evict both
     before anything under this overlay can make noise. */
  coachClose();
  coachEvictTuner();
  if (typeof closeTopPanels === 'function') closeTopPanels('games');
  screen.removeAttribute('hidden');
  if (typeof syncExploreNav === 'function') syncExploreNav();
  gamesShow('hub');
  /* Keyboard/screen-reader users: focus follows into the page.
     gamesClosePanel hands focus back to the Games button. */
  const exit = screen.querySelector('.games-exit');
  if (exit) exit.focus();
}
/* `toPrevious`: the "Main site" button and Escape go back to the page Games
   was opened from (exitOverlayHash, app.js). Without it — closeTopPanels on
   the way to a set — it leaves for the lesson, as before. */
function closeGamesScreen(toPrevious){
  if (location.hash === '#games'){ toPrevious ? exitOverlayHash() : exitExploreHash(); return; }  // the router finishes the job
  gamesClosePanel();
}
function gamesClosePanel(){
  // Any hash change away from '#games' (e.g. tapping "Keep practicing" or "My
  // progress" while a standalone Coach check is running) fires this via the
  // hash router in app.js, whether or not the games screen was ever open.
  // Only tear down the mic when there's actually a games panel to close —
  // otherwise this silently kills an unrelated in-progress Coach check.
  const screen = document.getElementById('games-screen');
  if (!screen || screen.hasAttribute('hidden')) return;
  gamesStopMic(true);
  screen.setAttribute('hidden', '');
  const p = document.getElementById('games-panel');
  if (p) p.innerHTML = '';
  const btn = document.getElementById('games-btn');
  if (btn) btn.focus();   // return focus to where the page was opened
  if (typeof syncExploreNav === 'function') syncExploreNav();
}
/* No hashchange listener here — routeExploreHash() in app.js drives all four
   explore pages from one place. */

/* Stops every running game (mic or not — Chord Blitz has no mic but its
   clock must die too). Called by app.js when the tuner opens, and by
   coachStartCheck when a Coach check starts. A stopped game view is a
   dead UI (it says "listening" but the mic is gone), so the panel falls
   back to the hub. `keepPanel`: the caller (gamesShow, gamesClosePanel)
   replaces the panel itself right after, so the hub isn't drawn only to be
   thrown away. */
function gamesStopMic(keepPanel){
  /* Note Call (a class-activity drill, app.js) isn't a game, but it shares
     the mic and the same "someone else needs it / tab went to the
     background" exits, so it stops here too. */
  if (typeof ncStopAll === 'function') ncStopAll();
  /* The arcade script is seven files that load one after another. Until the last of them (bcStop lives there)
     has run, no game can be running, so there is nothing more to stop; without this line the Tuner or Record
     pressed in that gap called ccStop() before its file had arrived (review R1-1, 2026-11-11). */
  if (typeof bcStop !== 'function') return;
  fretStop();
  ccStop();
  cbStop();
  shStop();
  rrStop();
  srStop();
  fzStop();
  rnStop();
  nrStop();
  cdStop();
  ntrStop();
  psStop();
  psgStop();
  pdStop();
  bcStop();
  /* Backstop: every *Stop() above only releases the mic through its own
     micOn flag, so a state-tracking bug in any one of them (or a future
     game that forgets the pattern) could still leave window.coachMicLive
     stuck true — silently muting the metronome/demo audio for the rest of
     the session (see fab-tools.js metroClickAt()/startMetro()). This umbrella
     is called from every "leaving games/coach" path (tuner open, a Coach
     check starting, the games panel closing, tab backgrounded with the mic
     live — see gamesHideStop), so it's
     the single hard-to-miss place to force the flag straight if anything
     above missed it. coachMicOff() is itself idempotent/safe to call with
     nothing running. */
  if (window.coachMicLive) coachMicOff();
  const screen = document.getElementById('games-screen');
  const p = document.getElementById('games-panel');
  if (!keepPanel && screen && !screen.hasAttribute('hidden') && p &&
      GAMES_META.some(g => g.body && document.getElementById(g.body))){
    gamesRenderHub(p);
  }
}

/* The top bar holds two exits (2026-11-01): "Main site" always, and "All
   games" (back to the hub) only while a game is on screen. Both are in
   index.html, so the language switch relabels them; this just shows or hides
   the second one. Every path that draws the hub or a game calls it. */
function gamesSyncTopbar(inGame){
  const b = document.getElementById('games-all-btn');
  if (b) b.hidden = !inGame;
}
function gamesHeadHtml(title){
  return `<div class="games-game-head"><span class="games-game-title">${title}</span></div>`;
}

/* Single source of truth for the hub grid, the guitar / no-guitar split AND
   each game's screen: `body` is the id its own code renders into (gamesShow
   builds it; gamesStopMic looks for it to know a game is on screen),
   `setup` starts it, `foot` adds the privacy footer under it, and `records`
   says that footer is on a screen that can record (micRecStart). Finger Gym
   shares Note Runner's #nr-body and engine but does not record. A game
   added here gets its screen and its stop path from this row alone.
   `guitar:true` = you need a real guitar in hand (mic-graded, or self-judged
   like Riff Roulette); `guitar:false` = eyes + keyboard/tap only. Order here is
   the order shown within each section. titleKey/descKey are resolved at
   render time in gamesRenderHub()'s card() — never here (this table is
   built once at load, so t() here would freeze one language in). */
/* One stroke icon per game, in the site's line-icon style — used BOTH on the
   hub card and in that game's heading, so the two can't drift apart. The cards
   size them at 2.25rem via .games-card-ico; the heading picks up the title's
   size. Emoji used to fill this slot, which rendered differently on every
   Chromebook and phone. */
const gIco = paths =>
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ' +
  'style="width:1em;height:1em;vertical-align:-0.15em">' + paths + '</svg>';

const GAME_ICO = {
  // Note Hunt — a target: find the named note on the fretboard.
  fret:       gIco('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>'),
  // Change Up — repeat arrows: switch between two chords, over and over.
  cc:         gIco('<path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>'),
  // Power Chord Switch — the three dots of the power-chord shape, with a
  // slide arrow under the fretboard: the same shape, moved.
  power:      gIco('<path d="M4 4h16"/><circle cx="7" cy="9" r="1.7" fill="currentColor" stroke="none"/><circle cx="12" cy="13" r="1.7" fill="currentColor" stroke="none"/><circle cx="17" cy="13" r="1.7" fill="currentColor" stroke="none"/><path d="M3 20h18M6 17.5 3 20l3 2.5M18 17.5l3 2.5-3 2.5"/>'),
  // Strum Radar — signal waves picking up your strum.
  radar:      gIco('<circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none"/><path d="M8.5 15.5a5 5 0 0 1 7 0"/><path d="M5 12a9.5 9.5 0 0 1 14 0"/>'),
  // Riff Roulette — a spinning wheel.
  roulette:   gIco('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M12 3v6.5M12 14.5V21M3 12h6.5M14.5 12H21"/>'),
  // Note Runner — a note travelling, speed lines behind it.
  noterunner: gIco('<circle cx="9" cy="17" r="3"/><path d="M12 17V4l7 2.5"/><path d="M2 9h3.5M2 13h2.5"/>'),
  // Riff Runner — a running figure.
  runner:     gIco('<circle cx="15.5" cy="4.5" r="2"/><path d="M14 8.5 10.5 10.5l1.5 4-3 6"/><path d="M12 14.5l4 1 1.5 5"/><path d="M14 8.5 17.5 10l3 2.5"/><path d="M10.5 10.5 6.5 12"/>'),
  // Finger Gym: The Ladder — four steps climbing, one per finger.
  fingergym:  gIco('<path d="M3 20h4v-4h4v-4h4V8h4V4"/><circle cx="5" cy="17.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="9" cy="13.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="13" cy="9.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="17" cy="5.5" r="1.2" fill="currentColor" stroke="none"/>'),
  // Chord Blitz — a lightning bolt (speed round).
  blitz:      gIco('<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>'),
  // Fret Zap — a fretboard with one fret lit up: name that note, fast.
  fretzap:    gIco('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M9 5v14M15 5v14"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/>'),
  // Strum Hero — down-strum and up-strum arrows, as they're written in music.
  strum:      gIco('<path d="M8 4v14M8 18l-3-3M8 18l3-3"/><path d="M16 20V6M16 6l-3 3M16 6l3 3"/>'),
  // Chord Detective — headphones: identify the chord by ear, no diagram shown.
  detective:  gIco('<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="2" y="13" width="5" height="7" rx="2"/><rect x="17" y="13" width="5" height="7" rx="2"/>'),
  // Name That Riff — an audio waveform: hear the riff, name the song.
  riffid:     gIco('<path d="M4 14v-4M8 17v-10M12 19v-14M16 17v-10M20 14v-4"/>'),
  // Pentatonic Simon — a 4-pad call-and-response grid.
  simon:      gIco('<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>'),
  // Pentatonic Simon Guitar Hero — the same pad grid, but the fourth pad is
  // a waveform: this one answers back through the mic.
  simonguitar: gIco('<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><path d="M13 17.5v3M16 14.5v9M19 16.5v5M21.8 18.5v1"/>'),
  // Pattern Detective — a magnifying glass over a down-strum arrow: inspect
  // the written bar, judge whether what you heard matches it.
  patterndet: gIco('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.3 15.3 21 21"/><path d="M10.5 7v7M10.5 14l-2.2-2.2M10.5 14l2.2-2.2"/>'),
  // Tuning Simulator — a tuner's tick marks with its needle at the centre.
  tuningsim:  gIco('<path d="M3 18a9 9 0 0 1 18 0"/><path d="M12 18l4-7"/><path d="M12 6V4M5.5 8.5 4 7M18.5 8.5 20 7"/><circle cx="12" cy="18" r="1.2" fill="currentColor" stroke="none"/>'),
  // Build-a-Chord — a fretboard grid with finger dots being placed.
  buildchord: gIco('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16M3 12h18"/><circle cx="6" cy="8" r="1.8" fill="currentColor" stroke="none"/><circle cx="18" cy="16" r="1.8" fill="currentColor" stroke="none"/>'),
};

/* The order here is the order of the cards on the Games page (each section keeps it).
   Power Chord Switch is first (Jonathan, 2026-11-04). */
const GAMES_META = [
  /* Power Chord Switch runs Change Up's engine (ccSetup('power')) and shares
     its #cc-body, as Finger Gym shares Note Runner's #nr-body. */
  { key:'power',    cls:'gc-power',    ico:GAME_ICO.power,      titleKey:'games.pw.title',    guitar:true,  descKey:'games.pw.desc',
    body:'cc-body', setup:() => ccSetup('power') },
  { key:'fret',     cls:'gc-hunt',     ico:GAME_ICO.fret,       titleKey:'games.fret.title',  guitar:true,  descKey:'games.fret.desc',
    body:'fret-body', setup:() => fretStart() },
  { key:'cc',       cls:'gc-change',   ico:GAME_ICO.cc,         titleKey:'games.cc.title',    guitar:true,  descKey:'games.cc.desc',
    body:'cc-body', setup:() => ccSetup() },
  { key:'radar',   cls:'gc-radar',    ico:GAME_ICO.radar,      titleKey:'games.radar.title', guitar:true,  descKey:'games.radar.desc',
    body:'sr-body', setup:() => srSetup() },
  { key:'roulette', cls:'gc-roulette', ico:GAME_ICO.roulette,   titleKey:'games.rr.title',    guitar:true,  descKey:'games.rr.desc',
    body:'rr-body', setup:() => rrSetup() },
  { key:'noterunner', cls:'gc-noterun', ico:GAME_ICO.noterunner, titleKey:'games.nr.title',   guitar:true,  descKey:'games.nr.desc',
    body:'nr-body', setup:() => nrSetup(), foot:true, records:true },
  { key:'fingergym', cls:'gc-fingergym', ico:GAME_ICO.fingergym, titleKey:'games.fg.title',    guitar:true,  descKey:'games.fg.desc',
    body:'nr-body', setup:() => fgSetup(), foot:true },
  { key:'simonguitar', cls:'gc-simonguitar', ico:GAME_ICO.simonguitar, titleKey:'games.psg.title', guitar:true, descKey:'games.psg.desc',
    body:'psg-body', setup:() => psgSetup() },
  /* Tuning Simulator is a page of its own (tuning-sim.html), not a view in this panel: its
     card goes there (href), so it has no body or setup. gamesShow() and the card handler
     both send the student to the page. It lives here for now (Jonathan, 2026-11-07). */
  { key:'tuningsim', cls:'gc-tuningsim', ico:GAME_ICO.tuningsim, titleKey:'games.ts.title',  guitar:false, descKey:'games.ts.desc',
    href:'tuning-sim.html' },
  { key:'runner',   cls:'gc-runner',   ico:GAME_ICO.runner,     titleKey:'games.riff.title',  guitar:false, descKey:'games.riff.desc',
    body:'rn-body', setup:() => rnSetup() },
  { key:'blitz',    cls:'gc-blitz',    ico:GAME_ICO.blitz,      titleKey:'games.cb.title',    guitar:false, descKey:'games.cb.desc',
    body:'cb-body', setup:() => cbSetup() },
  { key:'fretzap',  cls:'gc-fretzap',  ico:GAME_ICO.fretzap,    titleKey:'games.fz.title',    guitar:false, descKey:'games.fz.desc',
    body:'fz-body', setup:() => fzSetup() },
  { key:'strum',    cls:'gc-strum',    ico:GAME_ICO.strum,      titleKey:'games.sh.title',    guitar:false, descKey:'games.sh.desc',
    body:'sh-body', setup:() => shSetup() },
  { key:'detective', cls:'gc-detective', ico:GAME_ICO.detective, titleKey:'games.cd.title',   guitar:false, descKey:'games.cd.desc',
    body:'cd-body', setup:() => cdSetup() },
  { key:'riffid',   cls:'gc-riffid',   ico:GAME_ICO.riffid,     titleKey:'games.ntr.title',   guitar:false, descKey:'games.ntr.desc',
    body:'ntr-body', setup:() => ntrSetup() },
  { key:'simon',    cls:'gc-simon',    ico:GAME_ICO.simon,      titleKey:'games.ps.title',    guitar:false, descKey:'games.ps.desc',
    body:'ps-body', setup:() => psSetup() },
  { key:'patterndet', cls:'gc-patterndet', ico:GAME_ICO.patterndet, titleKey:'games.pd.title', guitar:false, descKey:'games.pd.desc',
    body:'pd-body', setup:() => pdSetup() },
  { key:'buildchord', cls:'gc-buildchord', ico:GAME_ICO.buildchord, titleKey:'games.bc.title', guitar:false, descKey:'games.bc.desc',
    body:'bc-body', setup:() => bcSetup() },
];

/* Card chip for a game's best score. Prefers the all-time best persisted in
   the student's progress doc ("best") over this browser session's high
   ("best today") — a returning student should see their real record, not a
   blank slate. Session can still win in dev bypass / signed-out, where
   nothing persists. */
function gamesBestChip(allTime, today, unit){
  const v = Math.max(allTime || 0, today || 0);
  if (!v) return '';
  const label = (allTime || 0) >= v ? t('games.common.best') : t('games.common.bestToday');
  return `<span class="games-card-best">&#x1F3C6; ${label}: ${v}${unit || ''}</span>`;
}

/* Arcade meta-layer: XP + a daily goal + a streak of its own — separate from
   any one game's own record (Riff Roulette keeps its bespoke games.rr streak
   untouched) and from the site-wide practice streak in app.js. Lives in
   games.meta, inside the games save category (already in
   LOAD_DEPENDENT_SAVE_KEYS, so no new Firestore plumbing). Uses app.js's
   dayStr() — the student's local calendar day, same as the site-wide streak
   — not the UTC date the per-game "at" fields use, since a streak has to
   agree with the day the student actually experienced.
   Call once per finished round, win or not: flat base XP for playing, plus
   a small bonus for a new personal best. Skipped in dev bypass, same as
   every other games.* write (Firestore rejects that uid) and
   bumpPracticeStreak. */
const ARCADE_XP_BASE = 10, ARCADE_XP_BEST_BONUS = 5, ARCADE_DAILY_XP_GOAL = 30;
function awardArcadeXp(gotNewBest){
  if (!currentUser || isDevBypassUser()) return;
  const today = dayStr(new Date());
  const m = games.meta || (games.meta = { xp: 0, xpToday: 0, xpDay: null, streak: { count: 0, lastDay: null } });
  if (m.xpDay !== today){ m.xpToday = 0; m.xpDay = today; }
  const gained = ARCADE_XP_BASE + (gotNewBest ? ARCADE_XP_BEST_BONUS : 0);
  m.xp = (m.xp || 0) + gained;
  m.xpToday += gained;
  if (m.streak.lastDay !== today){
    const y = new Date();
    y.setDate(y.getDate() - 1);
    m.streak.count = m.streak.lastDay === dayStr(y) ? (m.streak.count || 0) + 1 : 1;
    m.streak.lastDay = today;
  }
  saveGames();
}

/* Meta bar shown above the hub sections: today's XP toward the daily goal,
   plus the arcade streak once it's alive (today or still winnable — same
   "alive" rule as rrStreakAlive). */
function gamesMetaBarHtml(){
  const m = (typeof games !== 'undefined' && games && games.meta) || null;
  const today = dayStr(new Date());
  const xpToday = (m && m.xpDay === today) ? (m.xpToday || 0) : 0;
  const pct = Math.min(100, Math.round(100 * xpToday / ARCADE_DAILY_XP_GOAL));
  const goalMet = xpToday >= ARCADE_DAILY_XP_GOAL;
  let streakChip = '';
  if (m && m.streak && m.streak.count > 1 && m.streak.lastDay){
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const alive = m.streak.lastDay === today || m.streak.lastDay === dayStr(y);
    if (alive) streakChip = `<span class="games-meta-streak">&#x1F525; ${t('games.meta.streak', { n: m.streak.count })}</span>`;
  }
  return `
    <div class="games-meta-bar">
      <div class="games-meta-goal">
        <span class="games-meta-label">${goalMet ? t('games.meta.goalMet') : t('games.meta.xpToday', { xp: xpToday, goal: ARCADE_DAILY_XP_GOAL })}</span>
        <div class="games-meta-bar-track"><div class="games-meta-bar-fill" style="width:${pct}%"></div></div>
      </div>
      ${streakChip}
    </div>`;
}

function gamesRenderHub(p){
  gamesSyncTopbar(false);
  const saved = (typeof games !== 'undefined' && games) || {};
  let ccBest = 0;
  try {
    for (const pr of CC_PROGRESSIONS){
      for (let ri = 0; ri < CC_RATES.length; ri++){
        ccBest = Math.max(ccBest, parseInt(sessionStorage.getItem(ccBestKey(pr, ri)), 10) || 0);
      }
    }
  } catch(e){}
  const ccChip = gamesBestChip(saved.cc && saved.cc.bestBpm, ccBest, ' BPM');
  let pwBest = 0;
  try {
    for (const pr of CC_POWER_PROGRESSIONS){
      for (let ri = 0; ri < CC_RATES.length; ri++){
        pwBest = Math.max(pwBest, parseInt(sessionStorage.getItem(ccBestKey(pr, ri)), 10) || 0);
      }
    }
  } catch(e){}
  const pwChip = gamesBestChip(saved.pw && saved.pw.bestBpm, pwBest, ' BPM');
  let cbBest = 0;
  try {
    for (const d of CB_DECKS){
      cbBest = Math.max(cbBest,
        parseInt(sessionStorage.getItem(cbBestKey(d.id, 'name')), 10) || 0,
        parseInt(sessionStorage.getItem(cbBestKey(d.id, 'spot')), 10) || 0);
    }
  } catch(e){}
  const cbChip = gamesBestChip(cbSavedBest(saved), cbBest);
  let fzBest = 0;
  try {
    for (const d of FZ_DECKS){
      fzBest = Math.max(fzBest, parseInt(sessionStorage.getItem(fzBestKey(d.id)), 10) || 0);
    }
  } catch(e){}
  const fzChip = gamesBestChip(saved.fz && saved.fz.best, fzBest);
  let shBest = 0, shAllTime = 0;
  for (const pat of SH_PATTERNS){
    const b = shBestRead(pat.id);
    if (b) shBest = Math.max(shBest, b.score);
    // games.sh is keyed by pattern id (shFinish saves games.sh[pat.id].best),
    // not a single top-level .best — read the same shape it's written in.
    const sb = saved.sh && saved.sh[pat.id] && saved.sh[pat.id].best;
    if (sb) shAllTime = Math.max(shAllTime, sb);
  }
  const shChip = gamesBestChip(shAllTime, shBest);
  let srBest = 0, srAllTime = 0;
  for (const pat of SH_PATTERNS){
    const b = srBestRead(pat.id);
    if (b) srBest = Math.max(srBest, b.acc);
    const sb = saved.sr && saved.sr[pat.id] && saved.sr[pat.id].best;
    if (sb) srAllTime = Math.max(srAllTime, sb);
  }
  const srChip = gamesBestChip(srAllTime, srBest, '%');
  const fretChip = saved.fret && saved.fret.best
    ? `<span class="games-card-best">&#x1F3C6; ${t('games.fret.bestChip', { best: saved.fret.best, total: FRET_ROUND })}</span>` : '';
  let rrChip = '';
  const rrG = (typeof games !== 'undefined' && games && games.rr) || null;
  if (rrStreakAlive(rrG)){
    rrChip = `<span class="games-card-best">&#x1F525; ${t('games.rr.streakChip', { n: rrG.streak })}</span>`;
  } else {
    let rrPts = 0, rrDay = '';
    try {
      rrPts = parseInt(sessionStorage.getItem('rrPts'), 10) || 0;
      rrDay = sessionStorage.getItem('rrDay') || '';
    } catch(e){}
    if (rrPts > 0 && rrDay === rrDayStr(new Date())) rrChip = `<span class="games-card-best">&#x2B50; ${t('games.rr.pointsToday', { n: rrPts })}</span>`;
  }
  let rnBest = 0;
  for (const sg of RN_SONGS){
    const b = rnBestSession(sg.id);
    if (b) rnBest = Math.max(rnBest, b.acc);
  }
  let rnAllTime = 0;
  if (saved.rn && saved.rn.songs){
    for (const id in saved.rn.songs) rnAllTime = Math.max(rnAllTime, saved.rn.songs[id].acc || 0);
  }
  const rnChip = gamesBestChip(rnAllTime, rnBest, '%');
  let nrSess = 0;
  for (let i = 0; i < NR_LEVELS.length; i++) nrSess = Math.max(nrSess, nrBestSession(i));
  let nrAllTime = 0;
  if (saved.nr && saved.nr.levels){
    for (const k in saved.nr.levels) nrAllTime = Math.max(nrAllTime, saved.nr.levels[k] || 0);
  }
  const nrChip = gamesBestChip(nrAllTime, nrSess, '%');
  const fgChip = gamesBestChip(fgTopBpm(true), fgTopBpm(false), ' BPM');
  let cdBest = 0;
  try {
    for (const d of CD_DECKS){
      cdBest = Math.max(cdBest, parseInt(sessionStorage.getItem(cdBestKey(d.id)), 10) || 0);
    }
  } catch(e){}
  const cdChip = gamesBestChip(cdSavedBest(saved), cdBest);
  let ntrBest = 0;
  try { ntrBest = parseInt(sessionStorage.getItem('ntrBest'), 10) || 0; } catch(e){}
  const ntrChip = gamesBestChip(saved.ntr && saved.ntr.best, ntrBest);
  let psBest = 0;
  try { psBest = parseInt(sessionStorage.getItem('psBest'), 10) || 0; } catch(e){}
  const psChip = gamesBestChip(saved.ps && saved.ps.best, psBest);
  let psgBest = 0;
  try { psgBest = parseInt(sessionStorage.getItem('psgBest'), 10) || 0; } catch(e){}
  const psgChip = gamesBestChip(saved.psg && saved.psg.best, psgBest);
  let pdBest = 0;
  try { pdBest = parseInt(sessionStorage.getItem('pdBest'), 10) || 0; } catch(e){}
  const pdChip = gamesBestChip(saved.pd && saved.pd.best, pdBest);
  let bcBest = 0;
  try {
    for (const d of BC_DECKS){
      bcBest = Math.max(bcBest, parseInt(sessionStorage.getItem(bcBestKey(d.id)), 10) || 0);
    }
  } catch(e){}
  const bcChip = gamesBestChip(saved.bc && saved.bc.best, bcBest);
  /* Per-game best chips, keyed by game. */
  const chips = { fret:fretChip, cc:ccChip, power:pwChip, blitz:cbChip, fretzap:fzChip, strum:shChip, radar:srChip, roulette:rrChip, runner:rnChip, noterunner:nrChip, fingergym:fgChip, detective:cdChip, riffid:ntrChip, simon:psChip, simonguitar:psgChip, patterndet:pdChip, buildchord:bcChip };
  const card = g => `
       <button type="button" class="games-card ${g.cls}" onclick="gamesShow('${g.key}')">
         <span class="games-card-ico">${g.ico}</span>
         <span class="games-card-title">${t(g.titleKey)}</span>
         <span class="games-card-desc">${t(g.descKey)}</span>
         ${chips[g.key] || ''}
       </button>`;
  const section = (label, list) =>
    `<div class="games-section-head">${label}</div>
     <div class="games-grid">${list.map(card).join('')}</div>`;
  p.innerHTML =
    `<div class="games-tagline">${t('games.hub.tagline')}</div>
     ${gamesMetaBarHtml()}
     ${section('&#x1F3B8; ' + t('games.hub.sectionGuitar'), GAMES_META.filter(g=>g.guitar))}
     ${section('&#x1F5B1;&#xFE0F; ' + t('games.hub.sectionNoGuitar'), GAMES_META.filter(g=>!g.guitar))}
     ${coachFootHtml()}`;
}

function gamesShow(view){
  gamesStopMic(true);
  const p = document.getElementById('games-panel');
  if (!p) return;
  if (view === 'hub'){
    gamesRenderHub(p);
    return;
  }
  const g = GAMES_META.find(x => x.key === view);
  if (!g) return;
  if (g.href){ location.href = g.href; return; }
  gamesSyncTopbar(true);
  p.innerHTML = gamesHeadHtml(g.ico + ' ' + t(g.titleKey)) + `<div id="${g.body}"></div>` + (g.foot ? coachFootHtml(g.records) : '');
  g.setup();
}

/* Language switch while the games screen is open: everything here is built
   at render time through t(), so re-render. Mid-game state can't survive an
   innerHTML rebuild, so any open game returns to the hub (which also stops
   the mic via gamesShow → gamesStopMic) — switching language mid-round is
   rare, and a report card stuck in the old language would be worse. */
window.addEventListener('gc-langchange', function(){
  const screen = document.getElementById('games-screen');
  if (screen && !screen.hasAttribute('hidden')) gamesShow('hub');
});

