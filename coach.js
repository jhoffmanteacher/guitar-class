/* ════════════════════════════════════════════════════════════════════
   Guitar Class — LISTENING COACH  (supersedes the Session G plan)

   The site hears you play and gives rubric feedback. Two entry points,
   both rendered by app.js:
     · "🎤 Listening Coach" next to every ▶ Play button — melody mode
       (data-midis = answer key)
     · "🎤 Listening Coach" under a step's chord diagrams — chord mode
       (data-chords = [{n:name, m:[midis]}])

   Flow: inline card → 4-click count-in → mic listens while the student
   plays one note/strum per beat → report card scoring FIVE criteria on a
   three-level scale (Needs work / You're getting it / Great), one plain
   sentence each:
     1. Right notes (pitch)   2. On the beat (timing)   3. Steady tempo
     4. Chord changes         5. Played it through (completion)

   Detection reuses the tuner's approach: mic → highpass/lowpass →
   AnalyserNode. Onsets come from RMS jumps (energy flux + refractory
   window); pitch from a trimmed YIN (tau capped at the guitar's range so
   it's cheap enough to run ~20×/s on a Chromebook). Pitch-class is
   compared first, octave second — an octave-off correct note still counts
   (HPS/YIN octave slips are the classic false negative).

   Honesty rules (from the Session G research): never claim a chord NAME
   from audio — chord feedback is about timing + "chord-tone" plausibility,
   hedged in the wording. A too-quiet/unclear take gets "I couldn't hear
   that clearly", never a wrong verdict. Mic runs only while a check is
   active, with a visible indicator; nothing is recorded or uploaded.

   Loaded as a plain <script> AFTER app.js and tuner.js — uses their
   globals at call time: escHtml/escAttr/beep/ordinal (app.js),
   NOTES/tunerRunning/closePopup (tuner.js / app.js).
   ════════════════════════════════════════════════════════════════════ */

/* ── Tunables ── */
const COACH_FFT           = 4096;   // analyser buffer (85ms @ 48k — enough for low E)
const COACH_PITCH_GATE    = 0.004;  // RMS floor for pitch readings
const COACH_ONSET_FLOOR   = 0.010;  // absolute RMS floor for an onset
const COACH_ONSET_RATIO   = 2.2;    // RMS must jump this × over the smoothed level
const COACH_HF_FLOOR      = 0.002;  // absolute floor for the pick-attack (HF) channel
const COACH_HF_RATIO      = 2.6;    // HF energy must jump this × over its smoothed level
/* The two forgiving "check" flows — the Listening Coach's chord and melody
   modes (coachLoop) and Change Up (ccLoop) — run their own, MORE SENSITIVE
   onset thresholds than the rhythm games. They're self-checks a student does
   solo into a Chromebook mic at a normal playing volume, and moderate strums
   were slipping under the stricter shared COACH_* floors and scoring as misses.
   Lowering the bar here is safe: both flows only grade a strum that lands near a
   scheduled beat (the ±window matchers in coachMatchEvent / ccLoop), so a
   twitchier detector doesn't invent verdicts — a stray onset with no nearby beat
   is simply ignored. The rhythm games keep the stricter COACH_* values, where an
   extra onset WOULD be a false strum. */
const CHK_ONSET_FLOOR     = 0.003;  // absolute RMS floor for a check-flow onset
const CHK_ONSET_RATIO     = 1.4;    // RMS jump over the smoothed level
const CHK_HF_FLOOR        = 0.0008; // absolute floor for the pick-attack channel
const CHK_HF_RATIO        = 1.7;    // HF jump over its smoothed level
const COACH_ONSET_REFRACT = 140;    // ms — one strum = one onset, not six
const COACH_ATTACK_SKIP   = 70;     // ms after an onset before pitch readings start —
                                    // the analyser window still holds the pick scrape
                                    // (and the PREVIOUS note) until then
const COACH_EVENT_TAIL    = 340;    // ms of pitch readings collected after an onset
const COACH_MAX_SLOTS     = 32;
const COACH_BEATS_PER_CHORD = 4;
/* Visual beat-pulse fade (listening phase only — see coachPulseFadeThreshold
   and coachMatchEvent). No audio: the mic is live the whole time the Coach
   is listening, so an audible click here (unlike Riff Runner's, which is
   keys/taps only) could bleed from the speakers back into the pitch/onset
   detector. A "tight" hit is one whose timing deviation is well inside the
   ±0.75×beatMs window coachMatchEvent already requires just to MATCH a slot
   — a fraction of that, not the whole thing, so "tight" stays meaningfully
   stricter than merely "counted". */
const COACH_PULSE_TIGHT_FRAC = 0.2;   // fraction of coach.beatMs counted as "tight" timing
/* Chromebook built-in mics commonly capture noticeably quieter than a
   MacBook's, and getUserMedia is requested with autoGainControl:false (see
   coachAcquireMicInner) — deliberately, since browser AGC pumps up the
   background noise floor right along with a quiet player, which is the
   opposite of what we want in a loud classroom. A fixed GainNode instead:
   it multiplies the whole signal by a constant, so it helps a quiet mic
   clear the ABSOLUTE floors above (COACH_PITCH_GATE, *_ONSET_FLOOR,
   *_HF_FLOOR) without weakening the RATIO checks (*_ONSET_RATIO, *_HF_RATIO)
   that actually separate a real strum from steady room noise — multiplying
   both the signal and its smoothed baseline by the same constant leaves
   their ratio unchanged. 3× is a middle-of-the-road boost: enough to lift a
   quiet Chromebook capture into the working range, unlikely to push a
   normal laptop mic into float clipping (GainNode output isn't hard-clipped
   before the analyser the way speaker playback would be). */
const COACH_MIC_GAIN = 3;

function coachFootHtml(){ return '<div class="coach-foot">&#x1F512; ' + t('coach.foot') + '</div>'; }

let coach = null;            // active check session (null = no card open)
let coachStream = null, coachCtx = null, coachAnalyser = null, coachRaf = null,
    coachFrameBuf = null;
window.coachMicLive = false; // read by app.js to silence ▶ Play while listening

/* ══════════ Opening a card ══════════ */

/* onclick target for every coach button app.js renders. */
function coachOpen(btn){
  gamesStopMic();                     // a running game owns the shared mic — evict it
                                      // cleanly (its UI resets) before coachClose()
                                      // tears the stream down
  coachClose();                       // one card at a time
  let slots, mode, desc, tabNotes = null, tabDerived = false;
  if (btn.dataset.chords){
    let chords;
    try { chords = JSON.parse(btn.dataset.chords); } catch(e){ return; }
    if (!Array.isArray(chords) || !chords.length) return;
    mode = 'chords';
    slots = coachChordSlots(chords);
    const names = chords.map(c => c.n).join(' → ');
    desc = chords.length > 1
      ? t('coach.desc.chordsMulti', {names})
      : t('coach.desc.chordsOne', {names});
  } else {
    let midis;
    try { midis = JSON.parse(btn.dataset.midis || '[]'); } catch(e){ return; }
    if (!Array.isArray(midis) || !midis.length) return;
    // Held notes ({midi,beats}) aren't one-pick-per-beat — the caller should
    // have suppressed the button already, but bail out rather than render NaNs.
    if (midis.some(m => m && typeof m === 'object' && !Array.isArray(m))) return;
    mode = 'melody';
    /* Show WHERE to play it: a real TAB spec passes through verbatim
       (data-tabnotes); bare midi drills get a derived fingering. */
    if (btn.dataset.tabnotes){
      try { tabNotes = JSON.parse(btn.dataset.tabnotes).slice(0, COACH_MAX_SLOTS); } catch(e){ tabNotes = null; }
    }
    if (!tabNotes){
      tabNotes = coachDeriveTabNotes(midis.slice(0, COACH_MAX_SLOTS));
      tabDerived = !!tabNotes;
    }
    slots = midis.slice(0, COACH_MAX_SLOTS).map(m => {
      const arr = (Array.isArray(m) ? m : [m]).map(Number);
      const root = Math.min.apply(null, arr);   // tab midi arrays aren't root-first
      return {
        midi: root,
        classes: arr.map(x => ((x % 12) + 12) % 12),
        label: coachNoteName(root),
        isChange: false, chordName: null,
        state: 'pending', hit: null
      };
    });
    const preview = slots.slice(0, 10).map(s => s.label).join('–');
    desc = t('coach.desc.melody', { count: slots.length, list: preview + (slots.length > 10 ? '…' : '') });
  }

  /* BPM: start from the sibling ▶ Play slider when there is one (shared
     reader in app.js). Capped: one hit per click, keep it humane. */
  let bpm = readGroupBpm(btn, 60);
  if (!(bpm >= 30)) bpm = 60;
  bpm = Math.min(120, bpm);

  const card = document.createElement('div');
  card.className = 'coach-card';
  card.id = 'coach-card';
  card.innerHTML =
    `<div class="coach-head">
       <span class="coach-title">&#x1F3A4; ${t('coach.title')}</span>
       <span class="coach-mic" id="coach-mic" hidden><span class="coach-mic-dot"></span>${t('coach.micOn')}</span>
       <button type="button" class="coach-x" onclick="coachClose()" aria-label="${t('coach.closeAria')}">&#x2715;</button>
     </div>
     <div class="coach-body" id="coach-body"></div>
     ${coachFootHtml()}`;
  const anchor = btn.closest('.bpm-control-group') || btn.parentElement;
  anchor.insertAdjacentElement('afterend', card);

  /* The card renders THIS tab's own board, and the page's copy of the same
     board sits directly underneath it — the listening screen showed the
     identical TAB twice (2026-07-26). Hide the page's for as long as the
     card is open; coachClose puts it back. Only when the card actually has
     a board of its own to replace it with. */
  const hiddenTabs = [];
  if (mode === 'melody' && tabNotes){
    const tabBody = anchor.closest('.tab-body');
    if (tabBody){
      /* A class, not [hidden]: .tab-board sets display:inline-block, which
         out-specifies the UA's [hidden]{display:none} — the attribute did
         nothing here. */
      tabBody.querySelectorAll(':scope > .tab-board, :scope > .tab-phrase').forEach(el => {
        if (card.contains(el)) return;
        el.classList.add('coach-dup-hidden');
        hiddenTabs.push(el);
      });
    }
  }

  coach = {
    phase: 'ready', mode, slots, desc, bpm, tabNotes, tabDerived, hiddenTabs,
    beatMs: 60000 / bpm,
    card, streakKey: 'coachStreak:' + (btn.dataset.chords || btn.dataset.midis),
    drillId: btn.dataset.chords || btn.dataset.midis,
    /* Checklist skills this drill vouches for (app.js coachSkillsAttr). The
       report writes its level to each, and the "I've got it!" gate reads it. */
    skillIds: (btn.dataset.coachskills || '').split(',').filter(Boolean),
    events: [], pending: null,
    gridOffset: 0, listenStart: 0, timeouts: [],
    smoothRms: 0, smoothHf: 0, lastOnsetT: -1e9, lastPitchT: 0,
    pulseStreak: 0, pulseMuted: false   // visual beat-pulse fade state
  };
  coachRenderReady();
  card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function coachChordSlots(chords){
  const cycles = 2;   // 1 chord: 8 strums; 2+ chords: 2 passes through the loop
  const slots = [];
  for (let c = 0; c < cycles && slots.length < COACH_MAX_SLOTS; c++){
    chords.forEach(ch => {
      for (let b = 0; b < COACH_BEATS_PER_CHORD; b++){
        if (slots.length >= COACH_MAX_SLOTS) return;
        const midis = (ch.m || []).map(Number);
        slots.push({
          midi: midis.length ? Math.min.apply(null, midis) : null,
          classes: midis.map(x => ((x % 12) + 12) % 12),
          label: b === 0 ? ch.n : '·',
          isChange: b === 0 && slots.length > 0,
          chordName: ch.n,
          state: 'pending', hit: null
        });
      }
    });
  }
  return slots;
}

function coachNoteName(midi){
  return NOTES[((midi % 12) + 12) % 12].replace('#', '♯');
}

/* Derive a fingering for a bare midi list: find the lowest 4-fret box
   (open position first) that fits EVERY note — so a Pattern-1 climb lands
   on the frets 5–8 box, not a scattered lowest-fret mapping. Notes are
   placed thickest-string-first inside the box, the way scale boxes are
   taught. Returns [{string,fret,note,midi},…] for renderTabBlock, or null
   (mini-chords / out-of-range) — then the card just shows no tab. */
function coachDeriveTabNotes(midis){
  const flat = [];
  for (const m of midis){
    if (Array.isArray(m)) return null;
    const n = Number(m);
    if (!isFinite(n) || n < 40 || n > 88) return null;
    flat.push(n);
  }
  const labels = ['e','B','G','D','A','E'];      // TAB_STRINGS order (1st → 6th)
  const opens  = [64, 59, 55, 50, 45, 40];
  const tryPos = p => {
    const out = [];
    for (const m of flat){
      let pick = null;
      for (let si = 5; si >= 0; si--){
        const fret = m - opens[si];
        if (fret >= p && fret <= p + 3){
          pick = { string: labels[si], fret, note: coachNoteName(m), midi: m };
          break;
        }
      }
      if (!pick) return null;
      out.push(pick);
    }
    return out;
  };
  for (let p = 0; p <= 12; p++){
    const out = tryPos(p);
    if (out) return out;
  }
  /* No single box fits — greedy lowest-fret fallback so SOMETHING useful shows. */
  return flat.map(m => {
    let best = null;
    for (let si = 5; si >= 0; si--){
      const fret = m - opens[si];
      if (fret >= 0 && (!best || fret < best.fret)) best = { string: labels[si], fret, note: coachNoteName(m), midi: m };
    }
    return best;
  });
}

/* The expected notes as a real TAB grid (reuses app.js's renderTabBlock —
   same board students read everywhere else, speaker buttons included). */
function coachTabHtml(){
  if (!coach || !coach.tabNotes || coach.mode !== 'melody' || typeof renderTabBlock !== 'function') return '';
  return `<div class="coach-tab">${renderTabBlock(coach.tabNotes)}` +
    (coach.tabDerived ? `<div class="coach-tab-hint">${t('coach.tabHint')}</div>` : '') +
    `</div>`;
}

/* ══════════ Card phases ══════════ */

function coachBody(){ return document.getElementById('coach-body'); }

function coachRenderReady(msg){
  if (!coach) return;
  const body = coachBody();
  if (!body) return;   // card panel isn't in the DOM (e.g. replaced by a language switch)
  coach.phase = 'ready';
  body.innerHTML =
    (msg ? `<div class="coach-note">${escHtml(msg)}</div>` : '') +
    `<div class="coach-target">${t('coach.target.label')} <strong>${escHtml(coach.desc)}</strong></div>
     ${coachTabHtml()}
     <div class="coach-bpm-row">
       <button type="button" class="tp-btn" onclick="coachNudgeBpm(-5)">&#x2212;5</button>
       <span class="coach-bpm-readout" id="coach-bpm-readout">${coach.bpm} BPM</span>
       <button type="button" class="tp-btn" onclick="coachNudgeBpm(5)">+5</button>
     </div>
     <div class="coach-tip">&#x1F92B; ${t(coach.mode === 'chords' ? 'coach.tip.readyChords' : 'coach.tip.readyMelody')}</div>
     <button type="button" class="coach-start" onclick="coachStartCheck()">&#x25B6; ${t('coach.start')}</button>`;
}

function coachNudgeBpm(d){
  if (!coach || coach.phase !== 'ready') return;
  coach.bpm = Math.min(120, Math.max(40, coach.bpm + d));
  coach.beatMs = 60000 / coach.bpm;
  const el = document.getElementById('coach-bpm-readout');
  if (el) el.textContent = coach.bpm + ' BPM';
}

async function coachStartCheck(){
  if (!coach || (coach.phase !== 'ready' && coach.phase !== 'report')) return;

  /* One mic owner at a time — the tuner hands over. */
  coachEvictTuner();

  /* The games share the mic pipeline — hand it over cleanly first. */
  if (typeof gamesStopMic === 'function') gamesStopMic();

  const session = coach;
  if (!coachStream && !(await coachAcquireMic())){
    if (coach === session) coachRenderReady(t('coach.mic.denied'));
    return;
  }
  if (coach !== session){ coachReleaseMicIfIdle(); return; }   // card closed during the prompt
  if (!coachBody()){ coachReleaseMicIfIdle(); return; }   // card panel was replaced in the DOM during the prompt (e.g. a language switch rebuilt the module panel)
  if (document.hidden){   // tab was backgrounded while the prompt was open
    coachMicOff();
    coachRenderReady(t('coach.paused.backgrounded'));
    return;
  }
  /* AFTER the guards: silence anything the site itself is playing (demo
     sequences, chord strums, metronome) — including audio started while the
     permission prompt was open — so the mic doesn't score the speakers. */
  stopAllDemoAudio();
  const micEl = document.getElementById('coach-mic');
  if (micEl) micEl.hidden = false;

  /* Fresh attempt state */
  coach.slots.forEach(s => { s.state = 'pending'; s.hit = null; });
  coach.events = []; coach.pending = null;
  coach.gridOffset = 0; coach.smoothRms = 0; coach.smoothHf = 0; coach.lastOnsetT = -1e9;
  coach.lastPulse = -1; coach.frameNo = 0; coach.lastPitchT = 0;
  coach.pulseStreak = 0; coach.pulseMuted = false;

  /* Count-in: 4 clicks, last one higher = "go". The tab stays on screen so
     the fretting hand can get in position while the clicks run. */
  coach.phase = 'countin';
  /* Same lane the listening screen uses, with the count digit sitting in the
     exact spot the note readout will appear — so the eye is already in the
     right place on beat 1 instead of hunting for what moved. */
  const firstLabel = coach.mode === 'chords'
    ? (coach.slots[0].chordName || coach.slots[0].label) : coach.slots[0].label;
  coachBody().innerHTML =
    coachChordsHtml(coach.slots[0] && coach.slots[0].chordName) +
    `<div class="coach-lane" id="coach-lane">
       <div class="coach-lane-head">
         <span class="coach-lane-now" id="coach-count">&nbsp;</span>
         <span class="coach-lane-lbl">${t('coach.lane.countIn')}</span>
         <span class="coach-lane-next">${t('games.common.next')} ${escHtml(firstLabel)}</span>
       </div>
       ${coach.mode === 'melody' ? (coachTabHtml() || coachStripHtml()) : coachStripHtml()}
     </div>`;
  coachCountIn(coach, 'coach-count', () => {
    if (!coach) return;
    coach.phase = 'listening';
    coachRenderListening();
  });

  if (coachRaf) cancelAnimationFrame(coachRaf);
  coachLoop();
}

/* Mic pipeline shared by the Coach card and Note Hunt: raw-audio capture →
   band-limit to the guitar's range (same as the tuner) → analyser.
   Returns false if the mic is denied. Single-flight: while a permission
   prompt is pending, concurrent callers await the SAME acquisition — a
   double-click can never open a second stream and orphan the first. */
/* The tuner-eviction snippet, once — four call sites had hand-copies. */
function coachEvictTuner(){
  if (typeof tunerRunning !== 'undefined' && tunerRunning && typeof closePopup === 'function'){
    closePopup('tuner');
  }
}

let coachAcquirePending = null;
function coachAcquireMic(){
  if (coachAcquirePending) return coachAcquirePending;
  coachAcquirePending = coachAcquireMicInner().finally(() => { coachAcquirePending = null; });
  return coachAcquirePending;
}
async function coachAcquireMicInner(){
  try {
    coachStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      video: false
    });
  } catch(e) {
    return false;
  }
  coachCtx = new (window.AudioContext || window.webkitAudioContext)();
  const src = coachCtx.createMediaStreamSource(coachStream);
  // Boost quiet mics (Chromebooks especially) BEFORE any thresholding —
  // see COACH_MIC_GAIN's comment for why a fixed gain beats re-enabling AGC.
  const gainNode = coachCtx.createGain();
  gainNode.gain.value = COACH_MIC_GAIN;
  const hp = coachCtx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 70; hp.Q.value = 0.7;
  const lp = coachCtx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 1500; lp.Q.value = 0.7;
  coachAnalyser = coachCtx.createAnalyser();
  coachAnalyser.fftSize = COACH_FFT;
  coachAnalyser.smoothingTimeConstant = 0;
  src.connect(gainNode); gainNode.connect(hp); hp.connect(lp); lp.connect(coachAnalyser);
  coachFrameBuf = new Float32Array(COACH_FFT);
  window.coachMicLive = true;   // cleared in coachMicOff — set/clear live in ONE pair
  return true;
}

/* A stale caller (its card/panel closed during the permission prompt) must
   not tear down the stream directly — a newer session may have adopted it via
   the shared single-flight acquisition. Defer one tick: if nothing is
   actively listening by then, the stream is orphaned and gets released. */
function coachReleaseMicIfIdle(){
  setTimeout(() => {
    const active = (coach && (coach.phase === 'countin' || coach.phase === 'listening')) ||
                   fretRunning || (cc && cc.micOn) || (sr && sr.micOn) || (rn && rn.micOn) ||
                   (nr && nr.micOn);
    if (!active) coachMicOff();
  }, 0);
}

/* One analyser read per frame, shared by all three loops (they're mutually
   exclusive). Reuses a single buffer — a fresh 16KB Float32Array per rAF
   frame is real GC pressure on a Chromebook. Returns the RMS of the newest
   ~21ms; the samples stay in coachFrameBuf for the pitch detector.
   Also computes the RMS of the first-difference signal (coachHfRms): a pick
   attack is broadband, so it jumps in this channel even while the PREVIOUS
   string is still ringing — where the full-band RMS barely moves. That
   ringing bed is exactly a scale climb, so the coach's onset detector
   checks both channels. */
let coachHfRms = 0;
function coachReadFrame(){
  coachAnalyser.getFloatTimeDomainData(coachFrameBuf);
  const N = 1024;
  let sum = 0, dsum = 0;
  for (let i = coachFrameBuf.length - N; i < coachFrameBuf.length; i++){
    const v = coachFrameBuf[i];
    sum += v * v;
    const d = v - coachFrameBuf[i - 1];
    dsum += d * d;
  }
  coachHfRms = Math.sqrt(dsum / N);
  return Math.sqrt(sum / N);
}

/* Shared 4-click count-in: schedules the beeps + count digits on state's
   beat grid, sets state.listenStart, and fires onGo after beat 4. */
function coachCountIn(state, countElId, onGo){
  const t0 = performance.now();
  state.listenStart = t0 + 4 * state.beatMs;
  if (typeof getAudioCtx === 'function'){
    const ac = getAudioCtx();
    if (ac.state === 'suspended') ac.resume();
  }
  state.timeouts.forEach(clearTimeout);
  state.timeouts = [];
  for (let i = 0; i < 4; i++){
    state.timeouts.push(setTimeout(() => {
      beep(i === 3 ? 990 : 660, 0.08);
      const el = document.getElementById(countElId);
      if (el) el.textContent = String(i + 1);
    }, Math.round(i * state.beatMs)));
  }
  state.timeouts.push(setTimeout(onGo, Math.round(4 * state.beatMs)));
}

/* Listening screen, 2026-07-26 redesign — ONE moving thing.
   Before: a red mic dot pulsing at its own 1.2s rate, a blue metronome dot
   pulsing at the tempo, a big note readout swapping every beat, and a
   12-chip strip recoloring as it graded — four animations competing, plus
   the page's copy of the same TAB right underneath the card's copy.
   Now: the TAB itself is the metronome. One green column steps across it,
   one column per beat, and darkens on the beat (the flash the metro dot
   used to carry); the big readout above just names the column the beat is
   sitting on. Chord mode gets the identical treatment with the chip strip
   as its lane. Per-note GRADING is no longer painted mid-play — it belongs
   to the report card, which still renders the full strip. */
function coachRenderListening(){
  const laneBody = coach.mode === 'melody'
    ? (coachTabHtml() || coachStripHtml())
    : coachStripHtml();
  coachBody().innerHTML =
    `${coachChordsHtml(coach.slots[0] && coach.slots[0].chordName)}
     <div class="coach-lane" id="coach-lane">
       ${coachLaneHeadHtml()}
       ${laneBody}
     </div>
     <div class="coach-lane-foot">
       <span class="rn-metro-status" id="coach-pulse-status">${t('coach.pulse.on')}</span>
     </div>
     <button type="button" class="tp-btn coach-stop" onclick="coachFinish()">&#x25A0; ${t('coach.done.button')}</button>`;
}

/* Moves the beat column and fires the one flash on the lane. Replaces the
   separate .metro-dot: the dot and the note readout were two things to
   watch, and students watched neither. */
function coachBeatRefresh(cur){
  if (!coach || !coach.card) return;
  coach.card.querySelectorAll('.coach-col').forEach(el => el.classList.remove('coach-col'));
  coach.card.querySelectorAll('.coach-lane [data-seq="' + cur + '"]')
    .forEach(el => el.classList.add('coach-col'));
  if (coach.pulseMuted) return;   // steady player — the flash fades, the column stays
  const lane = document.getElementById('coach-lane');
  if (lane){ lane.classList.add('beat'); setTimeout(() => lane.classList.remove('beat'), 90); }
}

/* Big current/next readout — same pattern as Change Up: the player needs to
   see what's coming before its beat arrives, or the chip strip alone only
   reveals a change the instant it's due, which makes every hit late by
   reaction time (visual cues need lead time the way a metronome beep
   doesn't — you can't react to a beep in advance, but you CAN read an
   upcoming label). Covers both modes: chords show the chord name, melody
   shows the note name — melody didn't have this until a real-guitar test
   found the chip strip alone made it hard to play on the beat (2026-07-22). */
/* Chord diagrams for the coach card — visible from the count-in on, so the
   fretting hand can set up the first shape before beat 1 (same reason the
   melody TAB stays up during the count-in). */
function coachChordsHtml(curName){
  if (coach.mode !== 'chords') return '';
  const names = [];
  coach.slots.forEach(s => { if (s.chordName && names.indexOf(s.chordName) < 0) names.push(s.chordName); });
  return ccDiagramsHtml(names, curName, 'coach-dia');
}

/* Lane header: what the beat column is sitting on, and what's coming.
   Always rendered now (the old coachNowHtml bailed out on single-chord and
   single-note drills, which left those checks with no readout at all).
   The lead time matters — you can react to a beep as it happens, but a
   visual cue you only see the instant it's due makes every hit late. */
function coachLaneHeadHtml(){
  const first = coach.slots[0];
  const cur = coach.mode === 'chords' ? (first.chordName || first.label) : first.label;
  const nxt = coach.mode === 'chords' ? coachNextChord(0) : (coach.slots[1] ? coach.slots[1].label : null);
  return `<div class="coach-lane-head">
            <span class="coach-lane-now" id="coach-chord">${escHtml(cur)}</span>
            <span class="coach-lane-lbl">${t(coach.mode === 'chords' ? 'coach.lane.strumNow' : 'coach.lane.playNow')}</span>
            <span class="coach-lane-next" id="coach-next">${nxt ? t('games.common.next') + ' ' + escHtml(nxt) : ''}</span>
          </div>`;
}

function coachNextChord(cur){
  const name = coach.slots[cur].chordName;
  for (let i = cur + 1; i < coach.slots.length; i++){
    if (coach.slots[i].chordName !== name) return coach.slots[i].chordName;
  }
  return null;
}

function coachStripHtml(){
  /* data-seq mirrors the TAB's beat addressing so the listening lane can
     light chord-mode's strip with the exact same column code. */
  return `<div class="coach-strip">` + coach.slots.map((s, i) =>
    `<span class="coach-chip ${s.state}" id="coach-chip-${i}" data-seq="${i}" title="${escAttr(s.chordName || s.label)}">${escHtml(s.label)}</span>`
  ).join('') + `</div>`;
}

function coachChipRefresh(i){
  /* Grading colors are the REPORT's job now (2026-07-26): recoloring chips
     under the player mid-take was the third competing animation on the
     listening screen, and it fought the beat column for attention. The
     slot's state is still recorded — coachRenderReport re-renders the whole
     strip from it a beat later. */
  if (coach.phase === 'listening') return;
  const el = document.getElementById('coach-chip-' + i);
  if (el) el.className = 'coach-chip ' + coach.slots[i].state;
}

/* Reflects coach.pulseMuted into the status text — fires once, right when
   the streak crosses the fade threshold (same pattern as Riff Runner's
   rnMetroStatusRefresh; no need to poll it every frame). */
function coachPulseStatusRefresh(){
  const el = document.getElementById('coach-pulse-status');
  if (!el || !coach) return;
  el.textContent = t(coach.pulseMuted ? 'coach.pulse.off' : 'coach.pulse.on');
  el.classList.toggle('rn-metro-off', !!coach.pulseMuted);
}

/* How many CONSECUTIVE tight-timing hits (see COACH_PULSE_TIGHT_FRAC) before
   the visual beat pulse fades out — same spirit as Riff Runner's
   RN_METRONOME_FADE_COMBO (8), but scaled to the drill length: a short
   chord/note check can have far fewer slots than a Riff Runner round (as
   few as 2 — see coachMinHeard's comment), so a flat 8 could be literally
   unreachable. Roughly half the drill, floored at 3 (mirrors coachMinHeard's
   reasoning), capped at Riff Runner's 8, and never above the slot count
   itself so the fade stays achievable even on the shortest drills. */
function coachPulseFadeThreshold(slotCount){
  return Math.min(slotCount, Math.max(3, Math.min(8, Math.ceil(slotCount * 0.5))));
}

/* ══════════ Detection loop ══════════ */

function coachLoop(){
  if (!coach || !coachAnalyser) return;
  if (!coach.card.isConnected){ coachStopAll(); return; }   // set re-rendered under us

  // No notes to score during the count-in, but keep the level trackers
  // warm (room noise, count-in beep leakage) so beat 1 starts against a
  // settled baseline — from a cold zero, the very first frame of mic hiss
  // read as an onset.
  if (coach.phase !== 'listening'){
    if (coach.phase === 'countin'){
      const r = coachReadFrame();
      coach.smoothRms = coach.smoothRms * 0.82 + r * 0.18;
      coach.smoothHf = coach.smoothHf * 0.82 + coachHfRms * 0.18;
    }
    coachRaf = requestAnimationFrame(coachLoop);
    return;
  }
  const now = performance.now();
  const rms = coachReadFrame();
  const buf = coachFrameBuf;

  {
    /* Onset: a fast jump over the smoothed level, past an absolute floor,
       outside the refractory window. Two channels: full-band RMS (clean,
       separated notes) OR the HF pick-attack channel (a new pluck over a
       still-ringing string — a scale climb — barely moves the full-band
       level, but the attack is loud and broadband in the difference signal). */
    const hf = coachHfRms;
    if (now - coach.lastOnsetT > COACH_ONSET_REFRACT &&
        ((rms > CHK_ONSET_FLOOR && rms > coach.smoothRms * CHK_ONSET_RATIO) ||
         (hf > CHK_HF_FLOOR && hf > coach.smoothHf * CHK_HF_RATIO))){
      coach.lastOnsetT = now;
      if (coach.pending) coachFinalizeEvent();
      coach.pending = { t: now, readings: [] };
    }
    coach.smoothRms = coach.smoothRms * 0.82 + rms * 0.18;
    coach.smoothHf = coach.smoothHf * 0.82 + hf * 0.18;

    /* Pitch readings (trimmed YIN, ~every 40ms) feed the pending event —
       but not until the pick attack has left the analysis window: early
       windows still hold the scrape and the previous note, and those junk
       readings were poisoning the median on real takes. */
    /* Half the usual gate here: readings start after the attack, and a
       palm-muted or lightly-plucked note has already decayed by then — the
       consensus filter below keeps low-level junk from becoming a verdict. */
    if (coach.pending && rms > COACH_PITCH_GATE * 0.5 &&
        now - coach.pending.t >= COACH_ATTACK_SKIP &&
        now - (coach.lastPitchT || 0) >= 40){
      coach.lastPitchT = now;
      /* Chords aren't cleanly periodic, so YIN's strict single-note clarity
         gate rejects most chord frames (they logged 0 pitch reads). A looser
         gate for chord mode lets it lock onto the dominant chord tone — which
         real data showed is reliably one of the chord's notes. Melody stays
         strict (accuracy matters when the exact note is the answer). */
      const f = coachDetectPitch(buf, coachCtx.sampleRate, coach.mode === 'chords' ? 0.55 : 0.22);
      if (f > 0) coach.pending.readings.push(69 + 12 * Math.log2(f / 440));
    }
    if (coach.pending && now - coach.pending.t > COACH_EVENT_TAIL) coachFinalizeEvent();

    /* Beat pulse on the current slot — on the ADAPTED grid (listenStart +
       gridOffset), the same grid the scoring reads. On the rigid grid the
       highlight drifts away from the player as gridOffset follows their
       actual timing, so the visible chord change lags the strums it's
       grading. */
    const cur = Math.floor((now - coach.listenStart - coach.gridOffset) / coach.beatMs);
    if (cur !== coach.lastPulse && cur >= 0 && cur < coach.slots.length){
      coach.lastPulse = cur;
      coachBeatRefresh(cur);
      const chordEl = document.getElementById('coach-chord');
      if (chordEl){
        const name = coach.mode === 'chords' ? coach.slots[cur].chordName : coach.slots[cur].label;
        if (chordEl.textContent !== name){
          chordEl.textContent = name;
          if (coach.mode === 'chords'){
            coach.card.querySelectorAll('.cc-dia').forEach(el => el.classList.remove('cur'));
            const dia = document.getElementById('coach-dia-' + name);
            if (dia) dia.classList.add('cur');
          }
        }
        const nextEl = document.getElementById('coach-next');
        if (nextEl){
          const nx = coach.mode === 'chords' ? coachNextChord(cur) : (coach.slots[cur + 1] ? coach.slots[cur + 1].label : null);
          nextEl.textContent = nx ? t('games.common.next') + ' ' + nx
            : (coach.mode === 'chords' ? t('coach.lastChord') : t('coach.lastNote'));
        }
      }
    }

    /* Done? Everything matched, or the window (plus grace) has passed. */
    const allHit = coach.slots.every(s => s.state !== 'pending');
    if (allHit || now > coach.listenStart + (coach.slots.length + 1.5) * coach.beatMs){
      coachFinish();
      return;
    }
  }
  coachRaf = requestAnimationFrame(coachLoop);
}

/* YIN, trimmed to the guitar's range: tau only up to ~sr/60Hz, so it's a
   fraction of the tuner's full scan — cheap enough for a Chromebook at 20Hz. */
function coachDetectPitch(buf, sampleRate, clarity){
  clarity = clarity || 0.22;   // YIN accept threshold; higher = more permissive (chords)
  // Window scales with sample rate: at 88.2/96kHz a fixed 2048 caps maxTau
  // below low E's 82Hz period — the whole 6th string became undetectable.
  const W = Math.min(buf.length, sampleRate > 60000 ? 4096 : 2048);
  const start = buf.length - W;
  const half = Math.floor(W / 2);
  const maxTau = Math.min(half - 1, Math.ceil(sampleRate / 60));
  const d = new Float32Array(maxTau + 1);
  d[0] = 1;
  let runSum = 0;
  for (let tau = 1; tau <= maxTau; tau++){
    let s = 0;
    for (let i = 0; i < half; i++){
      const diff = buf[start + i] - buf[start + i + tau];
      s += diff * diff;
    }
    runSum += s;
    d[tau] = runSum ? s * tau / runSum : 1;
  }
  for (let tau = Math.max(2, Math.floor(sampleRate / 1400)); tau <= maxTau; tau++){
    if (d[tau] < clarity){
      while (tau + 1 <= maxTau && d[tau + 1] < d[tau]) tau++;
      const x0 = d[tau - 1], x2 = tau < maxTau ? d[tau + 1] : d[tau];
      const denom = 2 * (2 * d[tau] - x0 - x2);
      const refined = denom ? tau + (x2 - x0) / denom : tau;
      const freq = sampleRate / refined;
      return (freq >= 60 && freq <= 1400) ? freq : -1;
    }
  }
  return -1;
}

function coachFinalizeEvent(){
  const p = coach.pending;
  coach.pending = null;
  if (!p) return;
  /* Consensus median: readings must agree (within ±0.6 semitone of the
     median) to be trusted. One harmonic slip or scrape reading can't drag
     a 2-reading median to a wrong note anymore — if the readings disagree,
     the honest answer is "unclear" (dim), never a wrong verdict. */
  let midi = null;
  if (p.readings.length >= 2){
    const med = tunerMedian(p.readings);
    const tight = p.readings.filter(r => Math.abs(r - med) <= 0.6);
    if (tight.length >= 2 && tight.length * 2 >= p.readings.length){
      midi = Math.round(tunerMedian(tight));
    }
  }
  /* Chord strums are polyphonic: the pitch detector legitimately hops
     between chord tones, so single-pitch consensus is the WRONG test there
     — real strums were failing it and scoring "unclear". Keep the raw
     pitch classes; the matcher scores them as a chord-tone vote. */
  const ev = { t: p.t, midi, devMs: null, slot: -1 };
  if (coach.mode === 'chords'){
    ev.classes = p.readings.map(r => ((Math.round(r) % 12) + 12) % 12);
  }
  coach.events.push(ev);
  coachMatchEvent(ev);
}

/* Fraction of an event's pitch readings that are tones of the slot's chord. */
function coachToneShare(ev, slot){
  const cls = ev.classes || [];
  if (!cls.length) return 0;
  return cls.filter(c => slot.classes.indexOf(c) >= 0).length / cls.length;
}

/* Greedy time-window matcher: an event lands on the nearest unfilled slot
   within ±1 slot of where the grid says it should be. The grid offset then
   eases toward the student (EMA), so mild drift keeps matching — the drift
   itself is scored by the tempo criterion, local scatter by the timing one. */
function coachMatchEvent(ev){
  const rel = ev.t - coach.listenStart - coach.gridOffset;
  const guess = Math.round(rel / coach.beatMs);
  let best = -1, bestScore = Infinity;
  for (let i = Math.max(0, guess - 1); i <= Math.min(coach.slots.length - 1, guess + 1); i++){
    const s = coach.slots[i];
    if (s.state !== 'pending') continue;
    const dev = rel - i * coach.beatMs;
    if (Math.abs(dev) > coach.beatMs * 0.75) continue;
    const classOk = coach.mode === 'chords'
      ? coachToneShare(ev, s) >= 0.20
      : ev.midi != null && s.classes.indexOf(((ev.midi % 12) + 12) % 12) >= 0;
    const score = Math.abs(dev) + (classOk ? 0 : coach.beatMs * 0.6);
    if (score < bestScore){ bestScore = score; best = i; }
  }
  if (best < 0) return;   // unmatched onset — an extra strum between beats
  const s = coach.slots[best];
  const dev = rel - best * coach.beatMs;
  ev.devMs = dev; ev.slot = best;
  if (coach.mode === 'chords'){
    /* Chord-tone vote: ok when ≥20% of the readings land on chord tones — a
       clean strum easily clears that, and a laptop mic hearing a full 6-string
       chord (where the detector locks onto whichever tone is loudest) rarely
       climbs higher. "Wrong" only on strong contrary evidence — the honest
       default for a murky strum is dim, never an accusation. */
    const share = coachToneShare(ev, s);
    const n = (ev.classes || []).length;
    if (n < 1) s.state = 'dim';
    else if (share >= 0.20) s.state = 'ok';
    else if (share <= 0.10 && n >= 3) s.state = 'wrong';
    else s.state = 'dim';
  }
  else if (ev.midi == null) s.state = 'dim';            // heard it, pitch unclear
  else if (ev.midi === s.midi || s.classes.indexOf(((ev.midi % 12) + 12) % 12) >= 0){
    s.state = (coach.mode === 'melody' && ev.midi !== s.midi &&
               Math.abs(ev.midi - s.midi) % 12 === 0) ? 'oct' : 'ok';
  } else s.state = 'wrong';
  s.hit = ev;
  coach.gridOffset += dev * 0.15;
  coachChipRefresh(best);

  /* Visual beat-pulse fade: a correct AND tight-timing hit extends the
     streak; anything else (wrong, dim, or matched-but-loose timing) resets
     it. Once muted, stays muted for the rest of THIS attempt (matches Riff
     Runner — coachStartCheck resets both fields for a fresh try). */
  const onTime = (s.state === 'ok' || s.state === 'oct') && Math.abs(dev) <= coach.beatMs * COACH_PULSE_TIGHT_FRAC;
  coach.pulseStreak = onTime ? coach.pulseStreak + 1 : 0;
  if (!coach.pulseMuted && coach.pulseStreak >= coachPulseFadeThreshold(coach.slots.length)){
    coach.pulseMuted = true;
    coachPulseStatusRefresh();
  }
}

/* ══════════ Finish & score ══════════ */

function coachFinish(){
  if (!coach || (coach.phase !== 'listening' && coach.phase !== 'countin')) return;
  coach.timeouts.forEach(clearTimeout);
  coach.timeouts = [];
  if (coach.pending) coachFinalizeEvent();
  if (coachRaf){ cancelAnimationFrame(coachRaf); coachRaf = null; }
  coachMicOff();
  coach.slots.forEach((s, i) => { if (s.state === 'pending'){ s.state = 'miss'; coachChipRefresh(i); } });
  coach.phase = 'report';
  coachRenderReport();
}

function coachMicOff(){
  window.coachMicLive = false;
  if (coachStream) coachStream.getTracks().forEach(t => t.stop());
  if (coachCtx) coachCtx.close();
  coachStream = null; coachCtx = null; coachAnalyser = null;
  const micEl = document.getElementById('coach-mic');
  if (micEl) micEl.hidden = true;
}

/* How many matched slots a take needs before we trust it enough to score.
   Scales down for short drills — a 2-note vamp can only ever match 2 slots,
   so a flat floor of 3 made those drills unpassable. */
function coachMinHeard(slotCount){
  return Math.max(Math.min(3, Math.ceil(slotCount / 2)), Math.ceil(slotCount * 0.3));
}

function coachRenderReport(){
  const slots = coach.slots;
  const matched = slots.filter(s => s.hit);

  /* Too little signal → honest "couldn't hear", never a wrong verdict. */
  if (matched.length < coachMinHeard(slots.length)){
    coachBody().innerHTML =
      `<div class="coach-note">&#x1F914; ${t(coach.mode === 'chords' ? 'coach.report.couldntHearChords' : 'coach.report.couldntHearMelody')}</div>
       ${coachStripHtml()}
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="coachStartCheck()">&#x21BB; ${t('coach.tryAgain')}</button>
         <button type="button" class="tp-btn" onclick="coachClose()">${t('coach.close')}</button>
       </div>`;
    try { sessionStorage.setItem(coach.streakKey, '0'); } catch(e){}
    return;
  }

  const crits = [
    coachScorePitch(),
    coachScoreTiming(),
    coachScoreTempo(),
    coachScoreChanges(),
    coachScoreCompletion()
  ];

  const LVL = { 1: t('coach.level.needsWork'), 2: t('coach.level.gettingIt'), 3: t('coach.level.great') };
  const applicable = crits.filter(c => c.level > 0);
  const greats = applicable.filter(c => c.level === 3).length;
  const overallLevel = greats === applicable.length ? 3 : (greats >= 2 ? 2 : 1);
  let overall;
  if (greats === applicable.length) overall = '&#x1F31F; ' + t('coach.overall.great');
  else if (greats >= 2)             overall = '&#x1F4AA; ' + t('coach.overall.good');
  else                              overall = '&#x1F3B8; ' + t('coach.overall.practice');

  /* Streak: a "clear" = perfect pitch score and nothing at Needs work. */
  const clear = crits[0].level === 3 && applicable.every(c => c.level >= 2);
  let streak = 0;
  try {
    streak = clear ? (parseInt(sessionStorage.getItem(coach.streakKey), 10) || 0) + 1 : 0;
    sessionStorage.setItem(coach.streakKey, String(streak));
  } catch(e){}
  const streakHtml = streak >= 3
    ? `<div class="coach-streak">&#x1F525; ${t('coach.streak', {n: streak})}</div>` : '';

  /* Last-time-vs-this-time: read whatever's already loaded in the progress
     doc before this attempt overwrites it (same read pattern as rnBestMerged). */
  const prevCoach = (typeof games !== 'undefined' && games && games.coach && coach.drillId)
    ? games.coach[coach.drillId] : null;
  const compareHtml = prevCoach
    ? `<div class="coach-tip">${t('coach.compare', {last: LVL[prevCoach.level] || '—', now: LVL[overallLevel]})}</div>` : '';

  /* Compact per-drill result → the student's progress doc, so the next visit
     can show the line above. Skipped in dev bypass (Firestore rejects that uid). */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser() && coach.drillId){
    if (!games.coach) games.coach = {};
    const prevAttempts = (games.coach[coach.drillId] && games.coach[coach.drillId].attempts) || 0;
    games.coach[coach.drillId] = { level: overallLevel, attempts: prevAttempts + 1, at: new Date().toISOString().slice(0, 10) };
    /* Per-SKILL best, keyed by skill id rather than by drill payload — this is
       what the check-off gate in app.js reads. Best-ever, never downgraded: a
       shaky retake shouldn't take back a skill the student already earned. */
    if (coach.skillIds && coach.skillIds.length){
      if (!games.coachSkill) games.coachSkill = {};
      const today = new Date().toISOString().slice(0, 10);
      coach.skillIds.forEach(sid => {
        const prev = games.coachSkill[sid] || {};
        games.coachSkill[sid] = Object.assign({}, prev, {
          level: Math.max(prev.level || 0, overallLevel),
          last: overallLevel,
          at: today
        });
      });
    }
    saveGames();
  }

  coachBody().innerHTML =
    `<div class="coach-report"><div class="coach-overall">${overall}</div>
     ${compareHtml}
     ${coachStripHtml()}
     <div class="coach-crits">` +
    crits.map(c =>
      `<div class="coach-crit">
         <div class="coach-crit-top">
           <span class="coach-crit-name">${c.icon} ${escHtml(c.name)}</span>
           ${c.level > 0
             ? `<span class="coach-lvl lvl${c.level}">${LVL[c.level]}</span>`
             : `<span class="coach-lvl lvl0">&mdash;</span>`}
         </div>
         <div class="coach-crit-note">${escHtml(c.sentence)}</div>
       </div>`).join('') +
    `</div>
     ${streakHtml}
     <div class="coach-actions">
       <button type="button" class="coach-start" onclick="coachStartCheck()">&#x21BB; ${t('coach.tryAgain')}</button>
       <button type="button" class="tp-btn" onclick="coachClose()">${t('coach.reportDone')}</button>
     </div></div>`;
}

/* ── Criterion 1: Right notes / right chord sound ── */
function coachScorePitch(){
  const name = t(coach.mode === 'chords' ? 'coach.crit.pitch.nameChords' : 'coach.crit.pitch.nameMelody');
  const icon = '&#x1F3AF;';
  const slots = coach.slots;
  const judged = slots.filter(s => s.state === 'ok' || s.state === 'oct' || s.state === 'wrong');
  const good = slots.filter(s => s.state === 'ok' || s.state === 'oct').length;
  const octs = slots.filter(s => s.state === 'oct').length;
  const dim = slots.filter(s => s.state === 'dim').length;

  if (coach.mode === 'chords' && dim > slots.length * 0.6){
    return { name, icon, level: 2, sentence: t('coach.crit.pitch.dimChords') };
  }
  const missed = slots.filter(s => s.state === 'miss').length;
  const denom = Math.max(1, judged.length + missed);
  const r = good / denom;
  const total = slots.length;
  let level, sentence;
  const firstWrong = slots.find(s => s.state === 'wrong');
  /* When nothing was WRONG and the only losses are unheard/unclear notes,
     the likely story is volume, not fingers — quiet plucks don't reach the
     mic. Say that, instead of implying the student fretted them badly.
     (Also keeps a mostly-unheard take from scoring "Nailed 2 of 12 — clean
     run!": dim slots carry no verdict, so they're invisible to the ratio.) */
  if (coach.mode === 'melody' && !firstWrong && (dim + missed) > total * 0.5){
    const key = good === 0 ? 'coach.crit.pitch.quietMostAll'
      : good === 1 ? 'coach.crit.pitch.quietMostOne'
      : 'coach.crit.pitch.quietMostMany';
    return { name, icon, level: good > 0 ? 2 : 1,
      sentence: t(key, { good }) };
  }
  const quietOnly = !firstWrong && (missed + dim) > 0;
  /* A clearly-wrong note caps the score at level 2 — on a short drill one
     clunker can still leave the ratio above the "Great" bar. */
  if (r >= 0.85 && !firstWrong){
    level = 3;
    sentence = coach.mode === 'chords'
      ? t('coach.crit.pitch.greatChords', { good, total })
      : quietOnly
        ? t('coach.crit.pitch.greatQuietMelody', { good, total, rest: total - good })
        : (octs ? t('coach.crit.pitch.correctWithOct', { good, total, octs }) : t('coach.crit.pitch.correctPerfect', { good, total }));
  } else if (r >= 0.55){
    level = 2;
    if (firstWrong && coach.mode === 'melody'){
      const idx = slots.indexOf(firstWrong);
      /* app.js's ordinal() is English-only ("3rd") — in Spanish use the
         feminine ordinal abbreviation ("3.ª", agreeing with "nota"). */
      sentence = t('coach.crit.pitch.wrongNote', {
        good, total, ordinal: getLang() === 'es' ? (idx + 1) + '.ª' : ordinal(idx + 1),
        heard: coachNoteName(firstWrong.hit.midi), expected: firstWrong.label
      });
    } else if (quietOnly){
      sentence = t(coach.mode === 'chords' ? 'coach.crit.pitch.closeQuietChords' : 'coach.crit.pitch.closeQuietMelody', { good, total });
    } else {
      sentence = t('coach.crit.pitch.close', { good, total });
    }
  } else {
    level = 1;
    if (quietOnly){
      sentence = t(coach.mode === 'chords' ? 'coach.crit.pitch.needsQuietChords' : 'coach.crit.pitch.needsQuietMelody');
    } else {
      sentence = coach.mode === 'chords'
        ? t('coach.crit.pitch.needsChords')
        : t('coach.crit.pitch.needsMelody', { good, total });
    }
  }
  return { name, icon, level, sentence };
}

/* ── Criterion 2: On the beat ── */
function coachScoreTiming(){
  const name = t('coach.crit.timing.name'), icon = '&#x1F941;';
  const devs = coach.slots.filter(s => s.hit && s.hit.devMs != null).map(s => s.hit.devMs);
  if (devs.length < 3) return { name, icon, level: 1, sentence: t('coach.crit.timing.notEnough') };
  const onMs = Math.max(90, coach.beatMs * 0.18), closeMs = onMs * 2;
  const on = devs.filter(d => Math.abs(d) <= onMs).length;
  const close = devs.filter(d => Math.abs(d) <= closeMs).length;
  const mean = devs.reduce((a, b) => a + b, 0) / devs.length;
  const lean = Math.abs(mean) < onMs * 0.6 ? '' : (mean < 0 ? 'early' : 'late');
  let level, sentence;
  if (on / devs.length >= 0.70){
    level = 3; sentence = t('coach.crit.timing.great', { on, total: devs.length });
  } else if (close / devs.length >= 0.6){
    level = 2;
    sentence = lean
      ? t(lean === 'early' ? 'coach.crit.timing.leanEarly' : 'coach.crit.timing.leanLate')
      : t('coach.crit.timing.scattered');
  } else {
    level = 1; sentence = t('coach.crit.timing.needsWork');
  }
  return { name, icon, level, sentence };
}

/* ── Criterion 3: Steady tempo ──
   Measured from the student's own hit-to-hit intervals, NOT the grid slots:
   the matcher assigns notes to the beats they landed on, so a rush/drag is
   invisible in slot indices — but it's plain as day in the raw event times.
   A missed note shows up as a ~2-beat interval; rounding each interval to
   whole beats (vs the median) keeps one miss from corrupting the fit. */
function coachScoreTempo(){
  const name = t('coach.crit.tempo.name'), icon = '&#x23F1;';
  const ts = coach.events.filter(e => e.slot >= 0).map(e => e.t).sort((a, b) => a - b);
  if (ts.length < 6) return { name, icon, level: 2, sentence: t('coach.crit.tempo.tooShort') };
  const iois = [];
  for (let i = 1; i < ts.length; i++) iois.push(ts[i] - ts[i - 1]);
  const med = tunerMedian(iois);
  if (!(med > 0)) return { name, icon, level: 2, sentence: t('coach.crit.tempo.unclear') };
  const pos = [0];
  for (const d of iois) pos.push(pos[pos.length - 1] + Math.max(1, Math.round(d / med)));
  const pts = ts.map((t, i) => ({ x: pos[i], y: t }));
  const half = Math.floor(pts.length / 2);
  const bpmOf = arr => {
    const n = arr.length;
    const mx = arr.reduce((a, p) => a + p.x, 0) / n, my = arr.reduce((a, p) => a + p.y, 0) / n;
    let num = 0, den = 0;
    arr.forEach(p => { num += (p.x - mx) * (p.y - my); den += (p.x - mx) * (p.x - mx); });
    if (!den) return null;
    const beat = num / den;
    return beat > 0 ? 60000 / beat : null;
  };
  const b1 = bpmOf(pts.slice(0, half)), b2 = bpmOf(pts.slice(-half)), bAll = bpmOf(pts);
  if (!b1 || !b2 || !bAll) return { name, icon, level: 2, sentence: t('coach.crit.tempo.unclear') };
  const drift = Math.abs(b2 - b1) / coach.bpm;
  let level, sentence;
  if (drift <= 0.07){
    level = 3; sentence = t('coach.crit.tempo.steady', { bpm: Math.round(bAll) });
  } else if (drift <= 0.15){
    level = 2;
    sentence = t(b2 > b1 ? 'coach.crit.tempo.spedUpSlight' : 'coach.crit.tempo.slowedDownSlight', { b1: Math.round(b1), b2: Math.round(b2) });
  } else {
    level = 1;
    sentence = t(b2 > b1 ? 'coach.crit.tempo.spedUp' : 'coach.crit.tempo.slowedDown', { b1: Math.round(b1), b2: Math.round(b2) });
  }
  return { name, icon, level, sentence };
}

/* ── Criterion 4: Chord changes ── */
function coachScoreChanges(){
  const name = t('coach.crit.changes.name'), icon = '&#x1F504;';
  if (coach.mode !== 'chords'){
    return { name, icon, level: 0, sentence: t('coach.crit.changes.notApplicable') };
  }
  const bounds = coach.slots.filter(s => s.isChange);
  if (!bounds.length) return { name, icon, level: 0, sentence: t('coach.crit.changes.onlyOne') };
  const closeMs = Math.max(140, coach.beatMs * 0.24);
  const onTime = bounds.filter(s => s.hit && Math.abs(s.hit.devMs) <= closeMs && s.state !== 'wrong');
  const late = bounds.find(s => !(s.hit && Math.abs(s.hit.devMs) <= closeMs && s.state !== 'wrong'));
  const r = onTime.length / bounds.length;
  let level, sentence;
  if (r >= 0.85){
    level = 3;
    sentence = bounds.length === 1 ? t('coach.crit.changes.allOne') : t('coach.crit.changes.allMany', { n: bounds.length });
  } else if (r >= 0.5){
    level = 2;
    sentence = t('coach.crit.changes.some', { on: onTime.length, total: bounds.length, to: late ? late.chordName : t('coach.crit.changes.nextChordFallback') });
  } else {
    level = 1;
    sentence = t('coach.crit.changes.late');
  }
  return { name, icon, level, sentence };
}

/* ── Criterion 5: Played it through ── */
function coachScoreCompletion(){
  const name = t('coach.crit.completion.name'), icon = '&#x1F3C1;';
  const slots = coach.slots;
  const hitIdx = slots.map((s, i) => s.hit ? i : -1).filter(i => i >= 0);
  const coverage = hitIdx.length / slots.length;
  let maxGap = hitIdx.length ? hitIdx[0] : slots.length;
  for (let k = 1; k < hitIdx.length; k++) maxGap = Math.max(maxGap, hitIdx[k] - hitIdx[k - 1] - 1);
  const tailMiss = hitIdx.length ? slots.length - 1 - hitIdx[hitIdx.length - 1] : slots.length;
  let level, sentence;
  if (coverage >= 0.9 && maxGap <= 1){
    level = 3; sentence = t('coach.crit.completion.great');
  } else if (coverage >= 0.65 && tailMiss <= 2){
    level = 2;
    const gapAt = hitIdx.find((v, k) => k > 0 && v - hitIdx[k - 1] - 1 >= 2);
    sentence = gapAt != null
      ? t('coach.crit.completion.gapAt', { beat: gapAt + 1 })
      : t('coach.crit.completion.mostly');
  } else {
    level = 1;
    sentence = tailMiss > 2 ? t('coach.crit.completion.stoppedPartway') : t('coach.crit.completion.gaps');
  }
  return { name, icon, level, sentence };
}

/* ══════════ Teardown ══════════ */

/* Full stop: mic off, timers cleared, card removed. Safe to call anytime. */
function coachClose(){
  if (coachRaf){ cancelAnimationFrame(coachRaf); coachRaf = null; }
  if (coach){
    coach.timeouts.forEach(clearTimeout);
    (coach.hiddenTabs || []).forEach(el => el.classList.remove('coach-dup-hidden'));
    if (coach.card && coach.card.isConnected) coach.card.remove();
  }
  coachMicOff();
  coach = null;
}
function coachStopAll(){ coachClose(); }

/* Called by app.js when the tuner opens (the tuner takes the mic) and by the
   hidden-tab handler below. */
function coachInterrupt(msg){
  if (!coach) return;
  if (coach.phase === 'listening' || coach.phase === 'countin'){
    coach.timeouts.forEach(clearTimeout);
    coach.timeouts = [];
    if (coachRaf){ cancelAnimationFrame(coachRaf); coachRaf = null; }
    coachMicOff();
    coachRenderReady(msg || t('coach.interrupt.tunerTook'));
  }
}

/* Privacy + battery: the mic (and its analysis loops) never runs in a tab the
   student isn't looking at. Switching tabs or locking the phone shuts it all
   down cleanly; the student restarts with one tap when they're back. */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  coachInterrupt(t('coach.paused.backgrounded'));
  gamesStopMic();
  coachEvictTuner();
});

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

async function fretStart(){
  if (fretRunning) return;
  coachClose();                                        // one mic owner at a time
  ccStop();
  coachEvictTuner();
  const body = document.getElementById('fret-body');
  if (!body) return;
  body.innerHTML = `<div class="coach-tip">${t('games.fret.startingMic')}</div>`;
  if (!coachStream && !(await coachAcquireMic())){
    const b2 = document.getElementById('fret-body');
    if (b2) b2.innerHTML = `<div class="coach-note">${t('games.fret.micDenied')}</div>`;
    return;
  }
  if (!document.getElementById('fret-body')){ coachReleaseMicIfIdle(); return; }   // panel closed during the prompt
  if (document.hidden){ coachMicOff(); gamesShow('hub'); return; }   // backgrounded during the prompt
  stopAllDemoAudio();
  fretRunning = true;
  window.coachMicLive = true;   // stream may already be open from a prior owner
  let lvl = 1;
  try { lvl = parseInt(sessionStorage.getItem('fretLevel'), 10); } catch(e){}
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

function fretSetLevel(i){
  try { sessionStorage.setItem('fretLevel', String(i)); } catch(e){}
  fretNewRound(i);
}

function fretNewRound(levelIdx){
  fretGame = { level: levelIdx, tries: 0, results: [], phase: 'play',
               prompt: null, readings: [], cooldownUntil: 0, needSilence: false,
               hint: '', flash: null, frameNo: 0 };
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
  g.tries = 0; g.hint = ''; g.flash = null; g.readings = [];
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
    const buf = coachFrameBuf;

    /* One pluck = one answer: after judging, wait for the note to decay
       below the gate (or 1.8s, whichever first) before listening again. */
    if (g.needSilence && (rms < COACH_PITCH_GATE * 0.7 || now > g.cooldownUntil + 1800)){
      g.needSilence = false;
    }
    if (!g.needSilence && now >= g.cooldownUntil && rms > COACH_PITCH_GATE &&
        (g.frameNo = (g.frameNo || 0) + 1) % 3 === 0){
      const f = coachDetectPitch(buf, coachCtx.sampleRate);
      if (f > 0){
        g.readings.push(69 + 12 * Math.log2(f / 440));
        if (g.readings.length > 5) g.readings.shift();
        if (g.readings.length >= 4){
          const r = g.readings;
          if (Math.max.apply(null, r) - Math.min.apply(null, r) < 0.6){
            fretJudge(Math.round(tunerMedian(r)));
          }
        }
      }
    } else if (rms < COACH_PITCH_GATE * 0.5 && g.readings.length){
      g.readings = [];      // pluck decayed between readings — start fresh
    }
  }
  fretRaf = requestAnimationFrame(fretLoop);
}

/* Round over → cross-session best to the student's progress doc. Skipped in
   dev bypass (Firestore rejects that uid). Best = first-try hits out of 10;
   ties keep the earlier entry (level recorded for context, not compared). */
function fretSaveRound(g){
  if (typeof saveGames !== 'function' || !currentUser || isDevBypassUser()) return;
  const score = g.results.filter(Boolean).length;
  const old = (games.fret && games.fret.best) || 0;
  if (score > old){
    games.fret = { best: score, level: g.level, at: new Date().toISOString().slice(0, 10) };
    saveGames();
  }
}

function fretJudge(midi){
  const g = fretGame, p = g.prompt;
  g.readings = [];
  g.needSilence = true;
  g.cooldownUntil = performance.now() + 700;
  g.tries++;
  if (midi === p.m){
    const first = g.tries === 1;
    g.results.push(first);
    g.hint = '';
    g.flash = { text: '&#x2713; ' + t(first ? 'games.fret.firstTry' : 'games.fret.gotThere', { note: escHtml(p.note) }) };
    if (g.results.length >= FRET_ROUND){
      g.phase = 'done';
      fretSaveRound(g);
      fretRender();
      return;
    }
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
  if (!g || g.phase !== 'play' || !g.prompt) return;
  const p = g.prompt;
  g.results.push(false);
  g.hint = t('games.fret.skipReveal', { fret: p.f, note: p.note, string: fretStringName(p.s) });
  g.cooldownUntil = performance.now() + 1600;
  if (g.results.length >= FRET_ROUND){ g.phase = 'done'; fretSaveRound(g); fretRender(); return; }
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
       <button type="button" class="coach-start" onclick="fretNewRound(${g.level})">&#x21BB; ${t('games.common.playAgain')}</button>` + foot;
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

/* The games live on their own full-screen "page": #games in the URL, the
   browser Back button exits, and the look is its own (arcade shell around
   a normal-theme stage so the game internals render as designed). */
function toggleGames(){
  const screen = document.getElementById('games-screen');
  if (!screen) return;
  if (screen.hasAttribute('hidden')) location.hash = 'games';
  else closeGamesScreen();
}
function openGamesScreen(){
  const screen = document.getElementById('games-screen');
  if (!screen || !screen.hasAttribute('hidden')) return;
  /* Teacher-controlled access: if games are turned off for this student, don't
     open — even via a bookmarked #games hash (the button is already hidden). */
  if (typeof gamesAccessOn !== 'undefined' && !gamesAccessOn){
    if (location.hash === '#games') location.hash = '';
    return;
  }
  /* A Coach check or the tuner may still hold the mic (coachMicLive mutes
     site audio and its analyser would grade our game sounds) — evict both
     before anything under this overlay can make noise. */
  coachClose();
  coachEvictTuner();
  if (typeof closeTopPanels === 'function') closeTopPanels('games');
  screen.removeAttribute('hidden');
  document.body.classList.add('games-open');
  const btn = document.getElementById('games-btn');
  if (btn) btn.setAttribute('aria-expanded', 'true');
  gamesShow('hub');
  /* Keyboard/screen-reader users: focus follows into the dialog (the page
     behind stays in the DOM; aria-modal on #games-screen tells AT to
     ignore it). gamesClosePanel hands focus back to the Games button. */
  const exit = screen.querySelector('.games-exit');
  if (exit) exit.focus();
}
function closeGamesScreen(){
  if (location.hash === '#games'){ location.hash = ''; return; }  // hashchange finishes the job
  gamesClosePanel();
}
function gamesClosePanel(){
  gamesStopMic();
  const screen = document.getElementById('games-screen');
  const wasOpen = screen && !screen.hasAttribute('hidden');
  if (screen) screen.setAttribute('hidden', '');
  document.body.classList.remove('games-open');
  const p = document.getElementById('games-panel');
  if (p) p.innerHTML = '';
  const btn = document.getElementById('games-btn');
  if (btn){
    btn.setAttribute('aria-expanded', 'false');
    if (wasOpen) btn.focus();   // return focus to where the dialog was opened
  }
}
window.addEventListener('hashchange', () => {
  if (location.hash === '#games') openGamesScreen();
  else gamesClosePanel();
});

/* Stops every running game (mic or not — Chord Blitz has no mic but its
   clock must die too). Called by app.js when the tuner opens, and by
   coachStartCheck when a Coach check starts. A stopped game view is a
   dead UI (it says "listening" but the mic is gone), so the panel falls
   back to the hub. */
function gamesStopMic(){
  fretStop();
  ccStop();
  cbStop();
  shStop();
  rrStop();
  srStop();
  fzStop();
  rnStop();
  nrStop();
  /* Backstop: every *Stop() above only releases the mic through its own
     micOn flag, so a state-tracking bug in any one of them (or a future
     game that forgets the pattern) could still leave window.coachMicLive
     stuck true — silently muting the metronome/demo audio for the rest of
     the session (see fab-tools.js tick()/startMetro()). This umbrella is
     called from every "leaving games/coach" path (tuner open, a Coach
     check starting, the games panel closing, tab backgrounded), so it's
     the single hard-to-miss place to force the flag straight if anything
     above missed it. coachMicOff() is itself idempotent/safe to call with
     nothing running. */
  if (window.coachMicLive) coachMicOff();
  const screen = document.getElementById('games-screen');
  const p = document.getElementById('games-panel');
  if (screen && !screen.hasAttribute('hidden') && p &&
      (document.getElementById('fret-body') || document.getElementById('cc-body') ||
       document.getElementById('cb-body') || document.getElementById('sh-body') ||
       document.getElementById('rr-body') || document.getElementById('sr-body') ||
       document.getElementById('fz-body') || document.getElementById('rn-body') ||
       document.getElementById('nr-body'))){
    gamesRenderHub(p);
  }
}

function gamesHeadHtml(title, inGame){
  return `<div class="games-game-head"><span class="games-game-title">${title}</span>` +
    (inGame ? `<button type="button" class="games-back" onclick="gamesShow('hub')">&#x2190; ${t('games.common.allGames')}</button>` : '') +
    `</div>`;
}

/* Single source of truth for the hub grid AND the guitar / no-guitar split.
   `guitar:true` = you need a real guitar in hand (mic-graded, or self-judged
   like Riff Roulette); `guitar:false` = eyes + keyboard/tap only. Order here is
   the order shown within each section. titleKey/descKey are resolved at
   render time in gamesRenderHub()'s card() — never here (this table is
   built once at load, so t() here would freeze one language in). */
const GAMES_META = [
  { key:'fret',     cls:'gc-hunt',     ico:'&#x1F3AF;', titleKey:'games.fret.title',  guitar:true,  descKey:'games.fret.desc' },
  { key:'cc',       cls:'gc-change',   ico:'&#x1F501;', titleKey:'games.cc.title',    guitar:true,  descKey:'games.cc.desc' },
  { key:'radar',    cls:'gc-radar',    ico:'&#x1F4E1;', titleKey:'games.radar.title', guitar:true,  descKey:'games.radar.desc' },
  { key:'roulette', cls:'gc-roulette', ico:'&#x1F3B0;', titleKey:'games.rr.title',    guitar:true,  descKey:'games.rr.desc' },
  { key:'noterunner', cls:'gc-noterun', ico:'&#x1F3BC;', titleKey:'games.nr.title',   guitar:true,  descKey:'games.nr.desc' },
  { key:'runner',   cls:'gc-runner',   ico:'&#x1F3C3;', titleKey:'games.riff.title',  guitar:false, descKey:'games.riff.desc' },
  { key:'blitz',    cls:'gc-blitz',    ico:'&#x26A1;',  titleKey:'games.cb.title',    guitar:false, descKey:'games.cb.desc' },
  { key:'fretzap',  cls:'gc-fretzap',  ico:'&#x1F4A5;', titleKey:'games.fz.title',    guitar:false, descKey:'games.fz.desc' },
  { key:'strum',    cls:'gc-strum',    ico:'&#x1F3B8;', titleKey:'games.sh.title',    guitar:false, descKey:'games.sh.desc' },
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

function gamesRenderHub(p){
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
  let cbBest = 0;
  try {
    for (const d of CB_DECKS){
      cbBest = Math.max(cbBest,
        parseInt(sessionStorage.getItem(cbBestKey(d.id, 'name')), 10) || 0,
        parseInt(sessionStorage.getItem(cbBestKey(d.id, 'spot')), 10) || 0);
    }
  } catch(e){}
  const cbChip = gamesBestChip(saved.cb && saved.cb.best, cbBest);
  let fzBest = 0;
  try {
    for (const d of FZ_DECKS){
      fzBest = Math.max(fzBest, parseInt(sessionStorage.getItem(fzBestKey(d.id)), 10) || 0);
    }
  } catch(e){}
  const fzChip = gamesBestChip(saved.fz && saved.fz.best, fzBest);
  let shBest = 0;
  for (const pat of SH_PATTERNS){
    const b = shBestRead(pat.id);
    if (b) shBest = Math.max(shBest, b.score);
  }
  const shChip = gamesBestChip(saved.sh && saved.sh.best, shBest);
  let srBest = 0;
  for (const pat of SH_PATTERNS){
    const b = srBestRead(pat.id);
    if (b) srBest = Math.max(srBest, b.acc);
  }
  const srChip = gamesBestChip(saved.sr && saved.sr.best, srBest, '%');
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
  /* Per-game best chips, keyed by game. */
  const chips = { fret:fretChip, cc:ccChip, blitz:cbChip, fretzap:fzChip, strum:shChip, radar:srChip, roulette:rrChip, runner:rnChip, noterunner:nrChip };
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
     ${section('&#x1F3B8; ' + t('games.hub.sectionGuitar'), GAMES_META.filter(g=>g.guitar))}
     ${section('&#x1F5B1;&#xFE0F; ' + t('games.hub.sectionNoGuitar'), GAMES_META.filter(g=>!g.guitar))}
     ${coachFootHtml()}`;
}

function gamesShow(view){
  gamesStopMic();
  const p = document.getElementById('games-panel');
  if (!p) return;
  if (view === 'hub'){
    gamesRenderHub(p);
    return;
  }
  if (view === 'fret'){
    p.innerHTML = gamesHeadHtml('&#x1F3AF; ' + t('games.fret.title'), true) + `<div id="fret-body"></div>`;
    fretStart();
    return;
  }
  if (view === 'cc'){
    p.innerHTML = gamesHeadHtml('&#x1F501; ' + t('games.cc.title'), true) + `<div id="cc-body"></div>`;
    ccSetup();
    return;
  }
  if (view === 'blitz'){
    p.innerHTML = gamesHeadHtml('&#x26A1; ' + t('games.cb.title'), true) + `<div id="cb-body"></div>`;
    cbSetup();
    return;
  }
  if (view === 'strum'){
    p.innerHTML = gamesHeadHtml('&#x1F3B8; ' + t('games.sh.title'), true) + `<div id="sh-body"></div>`;
    shSetup();
    return;
  }
  if (view === 'radar'){
    p.innerHTML = gamesHeadHtml('&#x1F4E1; ' + t('games.radar.title'), true) + `<div id="sr-body"></div>`;
    srSetup();
    return;
  }
  if (view === 'roulette'){
    p.innerHTML = gamesHeadHtml('&#x1F3B0; ' + t('games.rr.title'), true) + `<div id="rr-body"></div>`;
    rrSetup();
    return;
  }
  if (view === 'fretzap'){
    p.innerHTML = gamesHeadHtml('&#x1F4A5; ' + t('games.fz.title'), true) + `<div id="fz-body"></div>`;
    fzSetup();
    return;
  }
  if (view === 'runner'){
    p.innerHTML = gamesHeadHtml('&#x1F3C3; ' + t('games.riff.title'), true) + `<div id="rn-body"></div>`;
    rnSetup();
    return;
  }
  if (view === 'noterunner'){
    p.innerHTML = gamesHeadHtml('&#x1F3BC; ' + t('games.nr.title'), true) + `<div id="nr-body"></div>`;
    nrSetup();
    return;
  }
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

/* ════════════════════════════════════════════════════════════════════
   CHANGE UP — chord-change game. Pick a chord loop and a tempo; after a
   4-click count-in you strum ON EVERY BEAT (silent visual pulse, same as
   the Coach — a speaker click would bleed into the mic). Chords switch
   every bar; the game grades each CHANGE: did a strum land on beat 1 of
   the new bar, and does it ring like the new chord's notes (hedged, never
   a claimed chord name). Levels are the loop length: 2 chords back and
   forth → 3 → 4. Pass a round (≥85%) and it offers +10 BPM; best clean
   tempo per loop is remembered for the session.
   ════════════════════════════════════════════════════════════════════ */

const CC_PROGRESSIONS = [
  // 2 chords — back & forth
  { chords: ['Am','Em'] }, { chords: ['G','C'] }, { chords: ['A','D'] }, { chords: ['E','Am'] },
  { chords: ['C','F'] }, { chords: ['G','D'] }, { chords: ['Em','C'] }, { chords: ['Am','F'] },
  // 3 chords
  { chords: ['A','D','E'] }, { chords: ['G','C','D'] }, { chords: ['Am','C','G'] },
  { chords: ['G','D','C'] }, { chords: ['C','F','G'] }, { chords: ['Em','C','G'] }, { chords: ['D','A','G'] },
  // 4 chords
  { chords: ['C','G','Am','F'] }, { chords: ['G','D','Em','C'] }, { chords: ['Am','F','C','G'] },
  { chords: ['C','Am','F','G'] }, { chords: ['G','Em','C','D'] }, { chords: ['Em','C','G','D'] },
  // Random 4 — a fresh set of four chords is drawn each round (see ccRandomFour)
  { random: true, chords: ['C','G','D','A'] }
];
/* Pool the Random-4 mode draws four distinct chords from each round. Kept to the
   open chords students know, so any draw is playable. */
const CC_RANDOM_POOL = ['C','G','D','A','E','Am','Em','Dm','F'];
/* How often the chord switches. bpc = beats per chord; slots = chord positions
   in a round (so slots − 1 graded changes). Faster rates run fewer slots so the
   round stays a sensible length — every-bar ≈ 32 beats, every-beat ≈ 16. */
// shortKey/subKey resolved at render time in ccRenderSetup() — never here
// (this table is built once at load, so t() here would freeze one language in).
const CC_RATES = [
  { id: 'bar',  bpc: 4, slots: 8,  shortKey: 'games.cc.rate.bar',  subKey: 'games.cc.rate.barSub' },
  { id: 'half', bpc: 2, slots: 12, shortKey: 'games.cc.rate.half', subKey: 'games.cc.rate.halfSub' },
  { id: 'beat', bpc: 1, slots: 16, shortKey: 'games.cc.rate.beat', subKey: 'games.cc.rate.beatSub' }
];
const CC_BPM_MIN = 40, CC_BPM_MAX = 140;

let cc = null, ccRaf = null;

function ccStop(){
  if (ccRaf){ cancelAnimationFrame(ccRaf); ccRaf = null; }
  if (cc){
    (cc.timeouts || []).forEach(clearTimeout);
    if (cc.micOn) coachMicOff();
    cc = null;
  }
}

function ccBody(){ return document.getElementById('cc-body'); }
function ccProgLabel(prog){ return prog.chords.join(' → '); }
/* Draw four distinct chords from the pool, in random order — the Random-4 mode. */
function ccRandomFour(){
  const pool = CC_RANDOM_POOL.slice(), pick = [];
  for (let i = 0; i < 4 && pool.length; i++){
    pick.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return pick;
}
function ccBestKey(prog, rateIdx){ const rid = CC_RATES[rateIdx] ? CC_RATES[rateIdx].id : 'bar'; return 'ccBest:' + (prog.random ? 'RANDOM4' : prog.chords.join('-')) + ':' + rid; }

function ccSetup(){
  let progIdx = 0, bpm = 60, rateIdx = 0;
  try {
    progIdx = parseInt(sessionStorage.getItem('ccProg'), 10);
    bpm = parseInt(sessionStorage.getItem('ccBpm'), 10);
    rateIdx = parseInt(sessionStorage.getItem('ccRate'), 10);
  } catch(e){}
  if (!(progIdx >= 0 && progIdx < CC_PROGRESSIONS.length)) progIdx = 0;
  if (!(bpm >= CC_BPM_MIN && bpm <= CC_BPM_MAX)) bpm = 60;
  if (!(rateIdx >= 0 && rateIdx < CC_RATES.length)) rateIdx = 0;
  cc = { phase: 'setup', progIdx, rateIdx, bpm, micOn: false, timeouts: [] };
  ccRenderSetup();
}

function ccPickProg(i){
  if (!cc) return;
  cc.progIdx = i;
  try { sessionStorage.setItem('ccProg', String(i)); } catch(e){}
  ccRenderSetup();
}

function ccPickRate(i){
  if (!cc) return;
  cc.rateIdx = i;
  try { sessionStorage.setItem('ccRate', String(i)); } catch(e){}
  ccRenderSetup();
}

function ccNudgeBpm(d){
  if (!cc) return;
  cc.bpm = Math.min(CC_BPM_MAX, Math.max(CC_BPM_MIN, cc.bpm + d));
  try { sessionStorage.setItem('ccBpm', String(cc.bpm)); } catch(e){}
  const el = document.getElementById('cc-bpm-readout');
  if (el) el.textContent = cc.bpm + ' BPM';
  else ccRenderSetup();
}

function ccDiagramsHtml(chords, curName, idPrefix){
  if (typeof localChordSvg !== 'function') return '';
  const pre = idPrefix || 'cc-dia';
  const boxes = chords.map(n => {
    const svg = localChordSvg(n);
    if (!svg) return '';
    return `<div class="chord-box cc-dia${n === curName ? ' cur' : ''}" id="${pre}-${escAttr(n)}">${svg}<div class="chord-box-label">${escHtml(n)}</div></div>`;
  }).join('');
  return boxes ? `<div class="chord-diagrams cc-diagrams">${boxes}</div>` : '';
}

function ccRenderSetup(msg){
  const body = ccBody();
  if (!body || !cc) return;
  const groups = [[2, t('games.cc.group.two')], [3, t('games.cc.group.three')], [4, t('games.cc.group.four')]];
  const pills = groups.map(([len, title]) =>
    `<div class="cc-group"><div class="cc-group-title">${title}</div><div class="fret-levels">` +
    CC_PROGRESSIONS.map((pr, i) => pr.chords.length !== len ? '' :
      `<button type="button" class="ts-btn${i === cc.progIdx ? ' active' : ''}" onclick="ccPickProg(${i})">${pr.random ? '&#x1F3B2; ' + t('games.cc.randomFour') : escHtml(pr.chords.join(len === 2 ? ' ↔ ' : ' – '))}</button>`
    ).join('') + `</div></div>`
  ).join('');
  const prog = CC_PROGRESSIONS[cc.progIdx];
  const rate = CC_RATES[cc.rateIdx] || CC_RATES[0];
  let best = 0;
  try { best = parseInt(sessionStorage.getItem(ccBestKey(prog, cc.rateIdx)), 10) || 0; } catch(e){}
  const rateBtns = CC_RATES.map((r, i) =>
    `<button type="button" class="ts-btn${i === cc.rateIdx ? ' active' : ''}" onclick="ccPickRate(${i})">${escHtml(t(r.shortKey))}<span class="cc-rate-sub">${escHtml(t(r.subKey))}</span></button>`
  ).join('');
  const tipRate = t(rate.bpc === 4 ? 'games.cc.tipRate.bar'
    : rate.bpc === 2 ? 'games.cc.tipRate.half'
    : 'games.cc.tipRate.beat');
  body.innerHTML =
    (msg ? `<div class="coach-note">${escHtml(msg)}</div>` : '') +
    pills +
    `<div class="cc-group"><div class="cc-group-title">${t('games.cc.group.speedTitle')}</div><div class="fret-levels">${rateBtns}</div></div>` +
    (prog.random ? `<div class="coach-note">&#x1F3B2; ${t('games.cc.randomNote')}</div>` : ccDiagramsHtml(prog.chords, null)) +
    `<div class="coach-bpm-row">
       <button type="button" class="tp-btn" onclick="ccNudgeBpm(-5)">&#x2212;5</button>
       <span class="coach-bpm-readout" id="cc-bpm-readout">${cc.bpm} BPM</span>
       <button type="button" class="tp-btn" onclick="ccNudgeBpm(5)">+5</button>
       ${best ? `<span class="cc-best">${t('games.common.bestTodayLabel')}: ${best} BPM</span>` : ''}
     </div>
     <div class="coach-tip">&#x1F92B; ${t('games.cc.tip', { rate: tipRate })}</div>
     <button type="button" class="coach-start" onclick="ccStart()">&#x25B6; ${t('games.cc.startButton', { slots: rate.slots })}</button>
     ${coachFootHtml()}`;
}

async function ccStart(){
  if (!cc || cc.phase === 'countin' || cc.phase === 'play') return;
  coachClose();
  fretStop();
  coachEvictTuner();
  const session = cc;
  if (!coachStream && !(await coachAcquireMic())){
    if (cc === session) ccRenderSetup(t('games.cc.micDenied'));
    return;
  }
  if (cc !== session){ coachReleaseMicIfIdle(); return; }   // panel closed during the prompt
  if (document.hidden){
    coachMicOff();
    ccRenderSetup(t('games.common.pausedBackgrounded'));
    return;
  }
  cc.micOn = true;
  stopAllDemoAudio();

  const progDef = CC_PROGRESSIONS[cc.progIdx];
  const prog = progDef.random ? ccRandomFour() : progDef.chords;
  cc.chords = prog;   // the actual chords this round (Random 4 differs each start)
  const rate = CC_RATES[cc.rateIdx] || CC_RATES[0];
  cc.bpc = rate.bpc; cc.slots = rate.slots;
  cc.seq = Array.from({ length: cc.slots }, (_, i) => prog[i % prog.length]);
  cc.classes = {};
  prog.forEach(n => {
    const midis = (typeof chordMidis === 'function') ? chordMidis(n) : [];
    cc.classes[n] = midis.map(m => ((m % 12) + 12) % 12);
  });
  cc.changes = [];
  for (let s = 1; s < cc.slots; s++){
    cc.changes.push({ beat: s * cc.bpc, from: cc.seq[s - 1], to: cc.seq[s], result: null, pend: null });
  }
  cc.beatMs = 60000 / cc.bpm;
  cc.smoothRms = 0; cc.smoothHf = 0; cc.lastOnsetT = -1e9; cc.gridOffset = 0; cc.lastBeat = -1; cc.frameNo = 0;
  cc.phase = 'countin';
  ccBody().innerHTML = `<div class="coach-count" id="cc-count">&nbsp;</div>` +
    ccDiagramsHtml(prog, prog[0]);
  coachCountIn(cc, 'cc-count', () => {
    if (cc && cc.phase === 'countin'){ cc.phase = 'play'; ccRenderPlay(); }
  });
  if (ccRaf) cancelAnimationFrame(ccRaf);
  ccLoop();
}

function ccRenderPlay(){
  const body = ccBody();
  if (!body || !cc) return;
  const chips = cc.changes.map((c, i) =>
    `<span class="coach-chip pending" id="cc-chip-${i}" title="${escAttr(t('games.cc.changeTooltip', { from: c.from, to: c.to }))}">${escHtml(c.to)}</span>`
  ).join('');
  body.innerHTML =
    `<div class="cc-now">
       <div class="cc-chord" id="cc-chord">${escHtml(cc.seq[0])}</div>
       <div class="cc-next" id="cc-next">${t('games.common.next')} ${escHtml(cc.seq[1])}</div>
     </div>
     <div class="cc-beats" id="cc-beats"><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span></div>
     ${ccDiagramsHtml(cc.chords, cc.seq[0])}
     <div class="coach-strip">${chips}</div>
     <div class="coach-live"><span class="coach-live-dot"></span>${t('games.cc.strumEveryBeat')}</div>
     <button type="button" class="tp-btn coach-stop" onclick="ccFinish()">&#x25A0; ${t('games.common.stop')}</button>`;
}

function ccBeatTick(cur){
  const slotIdx = Math.floor(cur / cc.bpc), beatInBar = cur % 4;
  if (slotIdx >= cc.slots) return;
  const chordEl = document.getElementById('cc-chord');
  const nextEl = document.getElementById('cc-next');
  if (chordEl && chordEl.textContent !== cc.seq[slotIdx]){
    chordEl.textContent = cc.seq[slotIdx];
    document.querySelectorAll('.cc-dia').forEach(el => el.classList.remove('cur'));
    const dia = document.getElementById('cc-dia-' + cc.seq[slotIdx]);
    if (dia) dia.classList.add('cur');
  }
  if (nextEl) nextEl.textContent = slotIdx + 1 < cc.slots ? t('games.common.next') + ' ' + cc.seq[slotIdx + 1] : t('games.cc.lastOne');
  document.querySelectorAll('#cc-beats .cc-pip').forEach((el, i) => el.classList.toggle('on', i === beatInBar));
}

function ccChipRefresh(i){
  const el = document.getElementById('cc-chip-' + i);
  if (el) el.className = 'coach-chip ' + (cc.changes[i].result === 'ok' ? 'ok' : cc.changes[i].result === 'off' ? 'wrong' : cc.changes[i].result === 'miss' ? 'miss' : 'pending');
}

function ccResolvePend(ch){
  const p = ch.pend;
  ch.pend = null;
  let toneOk = null;
  /* Chord-tone vote (same rule as the Coach's chord checks): a strum is
     polyphonic, so readings hop between chord tones — any single-pitch
     consensus fails real strums. 'off' only on strong contrary evidence. */
  if (p.readings.length >= 3){
    const want = cc.classes[ch.to];
    const share = p.readings.filter(r => want.indexOf(((Math.round(r) % 12) + 12) % 12) >= 0).length / p.readings.length;
    toneOk = share > 0.15;
  }
  ch.result = toneOk === false ? 'off' : 'ok';    // percussive/unclear counts on timing alone
  ccChipRefresh(cc.changes.indexOf(ch));
}

function ccLoop(){
  if (!cc) return;
  if (!coachAnalyser || !ccBody()){ ccStop(); return; }  // mic taken or panel closed under us
  const now = performance.now();
  if (cc.phase === 'countin'){
    /* Warm the level trackers on room noise during the count-in — same
       cold-start guard as the Coach loop. */
    const r = coachReadFrame();
    cc.smoothRms = cc.smoothRms * 0.82 + r * 0.18;
    cc.smoothHf = cc.smoothHf * 0.82 + coachHfRms * 0.18;
  }
  if (cc.phase === 'play'){
    const rms = coachReadFrame();
    const buf = coachFrameBuf;

    /* Onset = strum (same dual-channel detector as the Coach: full-band
       jump for clean separated strums, HF pick-attack channel for a strum
       over the still-ringing previous chord — which is exactly what the
       graded beat-1-of-a-new-bar strum sounds like). */
    if ((rms > CHK_ONSET_FLOOR &&
         rms > cc.smoothRms * CHK_ONSET_RATIO ||
         coachHfRms > CHK_HF_FLOOR &&
         coachHfRms > cc.smoothHf * CHK_HF_RATIO) &&
        now - cc.lastOnsetT > COACH_ONSET_REFRACT){
      cc.lastOnsetT = now;
      const rel = now - cc.listenStart - cc.gridOffset;
      const beatIdx = Math.round(rel / cc.beatMs);
      const dev = rel - beatIdx * cc.beatMs;
      if (Math.abs(dev) < cc.beatMs * 0.5) cc.gridOffset += dev * 0.25;
      // Cap the match window at half the spacing between changes (bpc beats) so a
      // single strum can't land inside two adjacent change windows at fast rates.
      const win = Math.min(cc.beatMs * cc.bpc * 0.5, Math.max(220, cc.beatMs * 0.5));
      const ch = cc.changes.find(c => c.result === null && !c.pend &&
        Math.abs(c.beat * cc.beatMs - rel) <= win);
      if (ch) ch.pend = { t: now, readings: [] };
    }
    cc.smoothRms = cc.smoothRms * 0.82 + rms * 0.18;
    cc.smoothHf = cc.smoothHf * 0.82 + coachHfRms * 0.18;

    /* Feed pitch readings to an open change-check, then resolve it. Same
       attack skip as the Coach: the first ~70ms of a strum is scrape plus
       the old chord still ringing, not the new chord's tones. */
    const open = cc.changes.find(c => c.pend);
    if (open){
      if (rms > COACH_PITCH_GATE * 0.5 &&
          now - open.pend.t >= COACH_ATTACK_SKIP &&
          (cc.frameNo = (cc.frameNo || 0) + 1) % 3 === 0){
        // Change Up always grades chords — use the same looser YIN gate as the
        // Listening Coach's chord mode so full strums actually register.
        const f = coachDetectPitch(buf, coachCtx.sampleRate, 0.55);
        if (f > 0) open.pend.readings.push(69 + 12 * Math.log2(f / 440));
      }
      if (now - open.pend.t > COACH_EVENT_TAIL) ccResolvePend(open);
    }

    /* Overdue changes are misses. */
    const relNow = now - cc.listenStart - cc.gridOffset;
    cc.changes.forEach((c, i) => {
      if (c.result === null && !c.pend && relNow > (c.beat + 0.85) * cc.beatMs){
        c.result = 'miss';
        ccChipRefresh(i);
      }
    });

    /* Same adapted-grid rule as the Coach's pulse: the chord/beat display
       must follow the grid the scoring uses, or it drifts off the player. */
    const cur = Math.floor((now - cc.listenStart - cc.gridOffset) / cc.beatMs);
    if (cur !== cc.lastBeat && cur >= 0){ cc.lastBeat = cur; ccBeatTick(cur); }

    if (now > cc.listenStart + (cc.slots * cc.bpc + 1) * cc.beatMs){ ccFinish(); return; }
  }
  ccRaf = requestAnimationFrame(ccLoop);
}

function ccFinish(){
  if (!cc || (cc.phase !== 'play' && cc.phase !== 'countin')) return;
  cc.timeouts.forEach(clearTimeout);
  cc.timeouts = [];
  if (ccRaf){ cancelAnimationFrame(ccRaf); ccRaf = null; }
  cc.changes.forEach(c => {
    if (c.pend) ccResolvePend(c);
    if (c.result === null) c.result = 'miss';
  });
  if (cc.micOn){ coachMicOff(); cc.micOn = false; }
  cc.phase = 'done';
  ccRenderDone();
}

function ccRenderDone(){
  const body = ccBody();
  if (!body || !cc) return;
  const prog = CC_PROGRESSIONS[cc.progIdx];
  const total = cc.changes.length;
  const ok = cc.changes.filter(c => c.result === 'ok').length;
  const off = cc.changes.filter(c => c.result === 'off').length;
  const r = ok / total;

  /* Which switch hurt most? */
  const tally = {};
  cc.changes.forEach(c => {
    if (c.result !== 'ok'){
      const k = c.from + ' → ' + c.to;
      tally[k] = (tally[k] || 0) + 1;
    }
  });
  const worst = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0] || null;

  let verdict, advice;
  if (r >= 0.85){
    verdict = '&#x1F31F; ' + t('games.cc.verdict.great', { ok, total });
    advice = t('games.cc.advice.great');
    try {
      const k = ccBestKey(prog, cc.rateIdx);
      const best = parseInt(sessionStorage.getItem(k), 10) || 0;
      if (cc.bpm > best) sessionStorage.setItem(k, String(cc.bpm));
    } catch(e){}
    /* Cross-session best → the student's progress doc. Skipped in dev bypass
       (Firestore rejects that uid; the session best above still counts). */
    if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
      const old = (games.cc && games.cc.bestBpm) || 0;
      if (cc.bpm > old){
        games.cc = { bestBpm: cc.bpm, progression: prog, at: new Date().toISOString().slice(0, 10) };
        saveGames();
      }
    }
  } else if (r >= 0.5){
    const early = t(cc.bpc >= 4 ? 'games.cc.early.bar' : cc.bpc === 2 ? 'games.cc.early.half' : 'games.cc.early.beat');
    verdict = '&#x1F4AA; ' + (off ? t('games.cc.verdict.okMessy', { ok, total, off }) : t('games.cc.verdict.ok', { ok, total }));
    advice = worst ? t('games.cc.advice.practiceWorst', { worst, early }) : t('games.cc.advice.tryAgainSteady');
  } else {
    verdict = '&#x1F3B8; ' + t('games.cc.verdict.low', { ok, total });
    advice = t('games.cc.advice.low');
  }
  const chips = cc.changes.map(c =>
    `<span class="coach-chip ${c.result === 'ok' ? 'ok' : c.result === 'off' ? 'wrong' : 'miss'}">${escHtml(c.to)}</span>`
  ).join('');
  const rec = r >= 0.85 ? 'up' : r >= 0.5 ? 'same' : 'down';
  body.innerHTML =
    `<div class="coach-report"><div class="coach-overall">${verdict}</div>
     <div class="coach-strip">${chips}</div>
     <div class="coach-crit-note">${escHtml(advice)}</div>
     <div class="coach-actions">
       <button type="button" class="${rec === 'down' ? 'coach-start' : 'tp-btn'}" onclick="ccAgain(-10)">&#x2B07; ${t('games.common.bpmDown10')}</button>
       <button type="button" class="${rec === 'same' ? 'coach-start' : 'tp-btn'}" onclick="ccAgain(0)">&#x21BB; ${t('games.common.again', { bpm: cc.bpm })}</button>
       <button type="button" class="${rec === 'up' ? 'coach-start' : 'tp-btn'}" onclick="ccAgain(10)">&#x2B06; ${t('games.common.bpmUp10')}</button>
     </div>
     <button type="button" class="tp-btn cc-change-loop" onclick="ccSetup()">${t('games.cc.pickDifferentLoop')}</button>
     ${coachFootHtml()}</div>`;
}

function ccAgain(d){
  if (!cc) return;
  cc.bpm = Math.min(CC_BPM_MAX, Math.max(CC_BPM_MIN, cc.bpm + d));
  try { sessionStorage.setItem('ccBpm', String(cc.bpm)); } catch(e){}
  cc.phase = 'setup';
  ccStart();
}

/* ════════════════════════════════════════════════════════════════════
   CHORD BLITZ — 90-second chord-shape flashcard sprint. No mic and no
   guitar: pick a deck, then either name the shape you see ("Name it")
   or pick the shape for the name you see ("Spot it"). Right answers
   build a streak that multiplies points; a wrong answer shows the right
   button and the missed chord comes back a few cards later. Best per
   deck+direction is session-scoped (hub chip says "today"); the
   cross-session best goes to the progress doc via the 'games' category.
   ════════════════════════════════════════════════════════════════════ */

const CB_SECONDS = 90;
// labelKey resolved at render time in cbRenderSetup() — never here (this
// table is built once at load, so t() here would freeze one language in).
const CB_DECKS = [
  { id: 'open',  labelKey: 'games.cb.deck.open',  chords: ['E','Em','A','Am','D','Dm','G','C','F'] },
  { id: 'power', labelKey: 'games.cb.deck.power', chords: ['E5','G5','A5','C5','D5'] },
  { id: 'barre', labelKey: 'games.cb.deck.barre', chords: ['Bm','B7','F#m','C#m'] },
  { id: 'all',   labelKey: 'games.cb.deck.all',   chords: ['E','Em','A','Am','D','Dm','G','C','F','E5','G5','A5','C5','D5','Bm','B7','F#m','C#m'] }
];

let cb = null, cbTick = null;

function cbStop(){
  if (cbTick){ clearInterval(cbTick); cbTick = null; }
  document.removeEventListener('keydown', cbKeydown);
  if (cb){
    (cb.timeouts || []).forEach(clearTimeout);
    cb = null;
  }
}

function cbBody(){ return document.getElementById('cb-body'); }
function cbBestKey(deck, dir){ return 'cbBest:' + deck + ':' + dir; }
function cbDeckChords(){
  const d = CB_DECKS.find(x => x.id === cb.deck);
  return (d || CB_DECKS[0]).chords;
}

function cbSetup(){
  let deck = 'open', dir = 'name';
  try {
    deck = sessionStorage.getItem('cbDeck') || deck;
    dir = sessionStorage.getItem('cbDir') || dir;
  } catch(e){}
  if (!CB_DECKS.some(d => d.id === deck)) deck = 'open';
  if (dir !== 'name' && dir !== 'spot') dir = 'name';
  cb = { phase: 'setup', deck, dir, timeouts: [] };
  cbRenderSetup();
}

function cbPickDeck(id){
  if (!cb) return;
  cb.deck = id;
  try { sessionStorage.setItem('cbDeck', id); } catch(e){}
  cbRenderSetup();
}

function cbPickDir(d){
  if (!cb) return;
  cb.dir = d;
  try { sessionStorage.setItem('cbDir', d); } catch(e){}
  cbRenderSetup();
}

function cbRenderSetup(){
  const body = cbBody();
  if (!body || !cb) return;
  const deckPills = CB_DECKS.map(d =>
    `<button type="button" class="ts-btn${d.id === cb.deck ? ' active' : ''}" onclick="cbPickDeck('${d.id}')">${escHtml(t(d.labelKey))}</button>`
  ).join('');
  const dirPills = [['name', t('games.cb.nameIt')], ['spot', t('games.cb.spotIt')]].map(([d, label]) =>
    `<button type="button" class="ts-btn${d === cb.dir ? ' active' : ''}" onclick="cbPickDir('${d}')">${label}</button>`
  ).join('');
  let best = 0;
  try { best = parseInt(sessionStorage.getItem(cbBestKey(cb.deck, cb.dir)), 10) || 0; } catch(e){}
  body.innerHTML =
    `<div class="cc-group"><div class="cc-group-title">${t('games.common.deck')}</div><div class="fret-levels">${deckPills}</div></div>
     <div class="cc-group"><div class="cc-group-title">${t('games.cb.direction')}</div><div class="fret-levels">${dirPills}</div></div>
     <div class="coach-tip">${t('games.cb.tip')}</div>
     ${best ? `<div class="cb-setup-best">&#x1F3C6; ${t('games.common.bestTodayLabel')}: ${best}</div>` : ''}
     <button type="button" class="coach-start" onclick="cbStart()">&#x25B6; ${t('games.cb.startButton')}</button>`;
}

function cbStart(){
  if (!cb || cb.phase === 'play') return;
  coachClose(); coachEvictTuner();   // one mic/audio owner at a time
  const s = cb;
  s.phase = 'play';
  s.score = 0; s.streak = 0; s.answered = 0; s.correct = 0;
  s.cur = null; s.prev = null; s.opts = [];
  s.requeue = []; s.locked = false;
  (s.timeouts || []).forEach(clearTimeout);
  s.timeouts = [];
  s.endAt = performance.now() + CB_SECONDS * 1000;
  document.addEventListener('keydown', cbKeydown);   // laptop: 1–4 answer
  if (cbTick) clearInterval(cbTick);
  /* 200ms so the finish check can't drift a second late; display is 1Hz anyway. */
  cbTick = setInterval(cbTimerTick, 200);
  cbNext();
}

function cbTimerTick(){
  if (!cb || cb.phase !== 'play'){
    if (cbTick){ clearInterval(cbTick); cbTick = null; }
    return;
  }
  if (!cbBody()){ cbStop(); return; }   // panel swapped under us
  const left = cb.endAt - performance.now();
  const el = document.getElementById('cb-timer');
  if (el){
    el.textContent = cbFmtTime(left);
    el.classList.toggle('low', left <= 10000);
  }
  if (left <= 0) cbFinish();
}

function cbFmtTime(ms){
  const t = Math.max(0, Math.ceil(ms / 1000));
  return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
}

function cbKeydown(e){
  if (e.repeat) return;
  if (!cb || cb.phase !== 'play' || cb.locked) return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  const i = ['1', '2', '3', '4'].indexOf(e.key);
  if (i >= 0) cbAnswer(i);
}

/* A missed chord is due again 3–5 cards later; otherwise random from the
   deck. Never the same card twice in a row. */
function cbPickCard(){
  const i = cb.requeue.findIndex(q => q.due <= cb.answered && q.name !== cb.prev);
  if (i >= 0) return cb.requeue.splice(i, 1)[0].name;
  const pool = cbDeckChords().filter(n => n !== cb.prev);
  return pool[Math.floor(Math.random() * pool.length)];
}

function cbShuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

function cbOptions(correct){
  let pool = cbDeckChords().filter(n => n !== correct);
  if (pool.length < 3){   // tiny deck: borrow distractors from the full library
    const all = CB_DECKS[CB_DECKS.length - 1].chords;
    pool = pool.concat(all.filter(n => n !== correct && pool.indexOf(n) < 0));
  }
  const opts = cbShuffle(pool.slice()).slice(0, 3);
  opts.push(correct);
  return cbShuffle(opts);
}

function cbNext(){
  if (!cb || cb.phase !== 'play') return;
  const body = cbBody();
  if (!body){ cbStop(); return; }
  const s = cb;
  s.cur = cbPickCard();
  s.prev = s.cur;
  s.opts = cbOptions(s.cur);
  s.locked = false;
  const svg = n => (typeof localChordSvg === 'function' && localChordSvg(n)) || '';
  const prompt = s.dir === 'name'
    ? `<div class="cb-prompt"><div class="cb-prompt-dia">${svg(s.cur)}</div></div>`
    : `<div class="cb-prompt"><div class="cb-prompt-name">${escHtml(s.cur)}</div></div>`;
  const answers = s.opts.map((n, i) =>
    `<button type="button" class="cb-answer" id="cb-opt-${i}" onclick="cbAnswer(${i})"><span class="cb-key">${i + 1}</span>` +
    (s.dir === 'name' ? escHtml(n) : `<span class="cb-answer-dia">${svg(n)}</span>`) +
    `</button>`
  ).join('');
  const mult = Math.min(4, 1 + Math.floor(s.streak / 5));
  const left = s.endAt - performance.now();
  body.innerHTML =
    `<div class="cb-hud">
       <span class="cb-timer${left <= 10000 ? ' low' : ''}" id="cb-timer">${cbFmtTime(left)}</span>
       <span class="cb-score" id="cb-score">${t('games.common.score', { n: s.score })}</span>
       <span class="cb-streak" id="cb-streak">${s.streak >= 2 ? '&#x1F525; ' + t('games.common.inARow', { n: s.streak }) + (mult > 1 ? ' &mdash; &times;' + mult : '') : '&nbsp;'}</span>
     </div>
     ${prompt}
     <div class="cb-answers">${answers}</div>`;
}

function cbAnswer(i){
  if (!cb || cb.phase !== 'play' || cb.locked) return;
  const s = cb;
  const pick = s.opts[i];
  if (!pick) return;
  s.answered++;
  if (pick === s.cur){
    s.correct++;
    s.streak++;
    s.score += 10 * Math.min(4, 1 + Math.floor(s.streak / 5));
    if (typeof strumChord === 'function') strumChord(s.cur);   // reward: hear the chord you just named
    cbNext();
    return;
  }
  /* Wrong: show the right button for a beat (inputs locked), requeue the card. */
  s.score = Math.max(0, s.score - 5);
  s.streak = 0;
  s.requeue.push({ name: s.cur, due: s.answered + 2 + Math.floor(Math.random() * 3) });
  s.locked = true;
  const hit = document.getElementById('cb-opt-' + i);
  if (hit) hit.classList.add('wrong');
  const right = document.getElementById('cb-opt-' + s.opts.indexOf(s.cur));
  if (right) right.classList.add('reveal');
  const scoreEl = document.getElementById('cb-score');
  if (scoreEl) scoreEl.textContent = t('games.common.score', { n: s.score });
  const streakEl = document.getElementById('cb-streak');
  if (streakEl) streakEl.innerHTML = '&nbsp;';
  s.timeouts.push(setTimeout(() => {
    if (cb !== s || s.phase !== 'play') return;
    cbNext();
  }, 800));
}

function cbFinish(){
  if (!cb || cb.phase !== 'play') return;
  if (cbTick){ clearInterval(cbTick); cbTick = null; }
  cb.timeouts.forEach(clearTimeout);
  cb.timeouts = [];
  cb.phase = 'done';
  cb.prevBest = 0;
  try {
    const k = cbBestKey(cb.deck, cb.dir);
    cb.prevBest = parseInt(sessionStorage.getItem(k), 10) || 0;
    if (cb.score > cb.prevBest) sessionStorage.setItem(k, String(cb.score));
  } catch(e){}
  /* Cross-session best → the student's progress doc. Skipped in dev bypass
     (Firestore rejects that uid; the session best above still counts). */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    const old = (games.cb && games.cb.best) || 0;
    if (cb.score > old){
      games.cb = { best: cb.score, deck: cb.deck, dir: cb.dir, at: new Date().toISOString().slice(0, 10) };
      saveGames();
    }
  }
  cbRenderDone();
}

function cbRenderDone(){
  const body = cbBody();
  if (!body || !cb) return;
  const acc = cb.answered ? Math.round(100 * cb.correct / cb.answered) : 0;
  let bestLine = '';
  if (cb.prevBest > 0 && cb.score > cb.prevBest){
    bestLine = `<div class="cb-newbest">&#x1F3C6; ${t('games.common.newBest', { value: cb.prevBest })}</div>`;
  } else if (cb.prevBest > 0){
    bestLine = `<div class="coach-tip">${t('games.common.bestTodayLabel')}: ${cb.prevBest}.</div>`;
  }
  body.innerHTML =
    `<div class="coach-report">
       <div class="cb-done-score">${cb.score}</div>
       <div class="coach-overall">&#x26A1; ${t(cb.answered === 1 ? 'games.common.cardsAnsweredOne' : 'games.common.cardsAnsweredMany', { answered: cb.answered, correct: cb.correct, acc })}</div>
       ${bestLine}
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="cbStart()">&#x21BB; ${t('games.common.playAgain')}</button>
         <button type="button" class="tp-btn" onclick="cbSetup()">${t('games.cb.changeDeck')}</button>
       </div>
     </div>`;
}

/* ════════════════════════════════════════════════════════════════════
   FRET ZAP — 60-second fretboard-memory sprint. No mic and no guitar: a
   single dot lights up on a blank fretboard and you tap that note's NAME
   from four choices. Right answers build a streak that multiplies points;
   a wrong answer lights the right button green and the missed spot comes
   back a few cards later. Four decks climb the ladder — low strings only,
   then all six to fret 5, then naturals up to fret 12, then everything
   including the sharps (♯, the note a half-step above a letter). Best per
   deck is session-scoped (hub chip says "today"); the cross-session best
   goes to the progress doc via the 'games' category.
   ════════════════════════════════════════════════════════════════════ */

const FZ_SECONDS = 60;
// labelKey resolved at render time in fzRenderSetup() — never here (this
// table is built once at load, so t() here would freeze one language in).
const FZ_DECKS = [
  { id: 'lowEA', labelKey: 'games.fz.deck.lowEA',  strings: [6, 5],             maxFret: 5,  naturalsOnly: true },
  { id: 'first5', labelKey: 'games.fz.deck.first5', strings: [6, 5, 4, 3, 2, 1], maxFret: 5,  naturalsOnly: true },
  { id: 'to12',  labelKey: 'games.fz.deck.to12',   strings: [6, 5, 4, 3, 2, 1], maxFret: 12, naturalsOnly: true },
  { id: 'sharps', labelKey: 'games.fz.deck.sharps', strings: [6, 5, 4, 3, 2, 1], maxFret: 12, naturalsOnly: false }
];
/* localNoteSvg wants a string KIND ('lowE'…), we work in string NUMBERS. */
const FZ_NUM_TO_KIND = { 6: 'lowE', 5: 'A', 4: 'D', 3: 'G', 2: 'B', 1: 'highE' };
const FZ_NATURALS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
/* All 12 note names, using the same unicode ♯ coachNoteName returns. */
const FZ_ALL_NAMES = Array.from({ length: 12 }, (_, m) => coachNoteName(60 + m));

/* Precompute each deck's legal positions {string, fret, note}. A position's
   note = coachNoteName(open-string midi + fret); naturals decks drop any
   name carrying a ♯. Done once at load so card picks are just array reads. */
FZ_DECKS.forEach(d => {
  const pos = [];
  d.strings.forEach(str => {
    for (let f = 0; f <= d.maxFret; f++){
      const note = coachNoteName(STRING_OPEN_MIDI[str] + f);
      if (d.naturalsOnly && note.indexOf('♯') >= 0) continue;
      pos.push({ string: str, fret: f, note });
    }
  });
  d.positions = pos;
});

let fz = null, fzTick = null;

function fzStop(){
  if (fzTick){ clearInterval(fzTick); fzTick = null; }
  document.removeEventListener('keydown', fzKeydown);
  if (fz){
    (fz.timeouts || []).forEach(clearTimeout);
    fz = null;
  }
}

function fzBody(){ return document.getElementById('fz-body'); }
function fzBestKey(deck){ return 'fzBest:' + deck; }
function fzDeck(){ return FZ_DECKS.find(d => d.id === fz.deck) || FZ_DECKS[0]; }
function fzDeckPositions(){ return fzDeck().positions; }
function fzUniverse(){ return fzDeck().naturalsOnly ? FZ_NATURALS : FZ_ALL_NAMES; }
function fzPosKey(p){ return p.string + ':' + p.fret; }

function fzSetup(){
  let deck = 'lowEA';
  try { deck = sessionStorage.getItem('fzDeck') || deck; } catch(e){}
  if (!FZ_DECKS.some(d => d.id === deck)) deck = 'lowEA';
  fz = { phase: 'setup', deck, timeouts: [] };
  fzRenderSetup();
}

function fzPickDeck(id){
  if (!fz) return;
  fz.deck = id;
  try { sessionStorage.setItem('fzDeck', id); } catch(e){}
  fzRenderSetup();
}

function fzRenderSetup(){
  const body = fzBody();
  if (!body || !fz) return;
  const deckPills = FZ_DECKS.map(d =>
    `<button type="button" class="ts-btn${d.id === fz.deck ? ' active' : ''}" onclick="fzPickDeck('${d.id}')">${escHtml(t(d.labelKey))}</button>`
  ).join('');
  let best = 0;
  try { best = parseInt(sessionStorage.getItem(fzBestKey(fz.deck)), 10) || 0; } catch(e){}
  body.innerHTML =
    `<div class="cc-group"><div class="cc-group-title">${t('games.common.deck')}</div><div class="fret-levels">${deckPills}</div></div>
     <div class="coach-tip">${t('games.fz.tip')}</div>
     ${best ? `<div class="cb-setup-best">&#x1F3C6; ${t('games.common.bestTodayLabel')}: ${best}</div>` : ''}
     <button type="button" class="coach-start" onclick="fzStart()">&#x25B6; ${t('games.fz.startButton')}</button>`;
}

function fzStart(){
  if (!fz || fz.phase === 'play') return;
  coachClose(); coachEvictTuner();   // one mic/audio owner at a time
  const s = fz;
  s.phase = 'play';
  s.score = 0; s.streak = 0; s.answered = 0; s.correct = 0;
  s.cur = null; s.prevKey = null; s.opts = [];
  s.requeue = []; s.locked = false;
  (s.timeouts || []).forEach(clearTimeout);
  s.timeouts = [];
  s.endAt = performance.now() + FZ_SECONDS * 1000;
  document.addEventListener('keydown', fzKeydown);   // laptop: 1–4 answer
  if (fzTick) clearInterval(fzTick);
  /* 200ms so the finish check can't drift a second late; display is 1Hz anyway. */
  fzTick = setInterval(fzTimerTick, 200);
  fzNext();
}

function fzTimerTick(){
  if (!fz || fz.phase !== 'play'){
    if (fzTick){ clearInterval(fzTick); fzTick = null; }
    return;
  }
  if (!fzBody()){ fzStop(); return; }   // panel swapped under us
  const left = fz.endAt - performance.now();
  const el = document.getElementById('fz-timer');
  if (el){
    el.textContent = cbFmtTime(left);
    el.classList.toggle('low', left <= 10000);
  }
  if (left <= 0) fzFinish();
}

function fzKeydown(e){
  if (e.repeat) return;
  if (!fz || fz.phase !== 'play' || fz.locked) return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  const i = ['1', '2', '3', '4'].indexOf(e.key);
  if (i >= 0) fzAnswer(i);
}

/* A missed spot is due again 2–4 cards later; otherwise a random legal
   position from the deck. Never the same (string+fret) twice in a row. */
function fzPickCard(){
  const i = fz.requeue.findIndex(q => q.due <= fz.answered && fzPosKey(q.pos) !== fz.prevKey);
  if (i >= 0) return fz.requeue.splice(i, 1)[0].pos;
  const pool = fzDeckPositions().filter(p => fzPosKey(p) !== fz.prevKey);
  return pool[Math.floor(Math.random() * pool.length)];
}

function fzShuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

function fzOptions(correct){
  const pool = fzUniverse().filter(n => n !== correct);
  const opts = fzShuffle(pool.slice()).slice(0, 3);
  opts.push(correct);
  return fzShuffle(opts);
}

function fzNext(){
  if (!fz || fz.phase !== 'play') return;
  const body = fzBody();
  if (!body){ fzStop(); return; }
  const s = fz;
  s.cur = fzPickCard();
  s.prevKey = fzPosKey(s.cur);
  s.opts = fzOptions(s.cur.note);
  s.locked = false;
  /* Blank dot ('' label) so the player names it rather than reads it. */
  const svg = (typeof localNoteSvg === 'function' && localNoteSvg(FZ_NUM_TO_KIND[s.cur.string], s.cur.fret, '')) || '';
  const answers = s.opts.map((n, i) =>
    `<button type="button" class="cb-answer" id="fz-opt-${i}" onclick="fzAnswer(${i})"><span class="cb-key">${i + 1}</span>${escHtml(n)}</button>`
  ).join('');
  const mult = Math.min(4, 1 + Math.floor(s.streak / 5));
  const left = s.endAt - performance.now();
  body.innerHTML =
    `<div class="cb-hud">
       <span class="cb-timer${left <= 10000 ? ' low' : ''}" id="fz-timer">${cbFmtTime(left)}</span>
       <span class="cb-score" id="fz-score">${t('games.common.score', { n: s.score })}</span>
       <span class="cb-streak" id="fz-streak">${s.streak >= 2 ? '&#x1F525; ' + t('games.common.inARow', { n: s.streak }) + (mult > 1 ? ' &mdash; &times;' + mult : '') : '&nbsp;'}</span>
     </div>
     <div class="fz-prompt">${svg}</div>
     <div class="cb-answers">${answers}</div>`;
}

function fzAnswer(i){
  if (!fz || fz.phase !== 'play' || fz.locked) return;
  const s = fz;
  const pick = s.opts[i];
  if (!pick) return;
  s.answered++;
  if (pick === s.cur.note){
    s.correct++;
    s.streak++;
    s.score += 10 * Math.min(4, 1 + Math.floor(s.streak / 5));
    if (typeof playNote === 'function') playNote(STRING_OPEN_MIDI[s.cur.string] + s.cur.fret);   // reward: hear the note you just named
    fzNext();
    return;
  }
  /* Wrong: show the right button for a beat (inputs locked), requeue the spot. */
  s.score = Math.max(0, s.score - 5);
  s.streak = 0;
  s.requeue.push({ pos: s.cur, due: s.answered + 2 + Math.floor(Math.random() * 3) });
  s.locked = true;
  const hit = document.getElementById('fz-opt-' + i);
  if (hit) hit.classList.add('wrong');
  const right = document.getElementById('fz-opt-' + s.opts.indexOf(s.cur.note));
  if (right) right.classList.add('reveal');
  const scoreEl = document.getElementById('fz-score');
  if (scoreEl) scoreEl.textContent = t('games.common.score', { n: s.score });
  const streakEl = document.getElementById('fz-streak');
  if (streakEl) streakEl.innerHTML = '&nbsp;';
  s.timeouts.push(setTimeout(() => {
    if (fz !== s || s.phase !== 'play') return;
    fzNext();
  }, 800));
}

function fzFinish(){
  if (!fz || fz.phase !== 'play') return;
  if (fzTick){ clearInterval(fzTick); fzTick = null; }
  fz.timeouts.forEach(clearTimeout);
  fz.timeouts = [];
  fz.phase = 'done';
  fz.prevBest = 0;
  try {
    const k = fzBestKey(fz.deck);
    fz.prevBest = parseInt(sessionStorage.getItem(k), 10) || 0;
    if (fz.score > fz.prevBest) sessionStorage.setItem(k, String(fz.score));
  } catch(e){}
  /* Cross-session best → the student's progress doc. Skipped in dev bypass
     (Firestore rejects that uid; the session best above still counts). */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    const old = (games.fz && games.fz.best) || 0;
    if (fz.score > old){
      games.fz = { best: fz.score, deck: fz.deck, at: new Date().toISOString().slice(0, 10) };
      saveGames();
    }
  }
  fzRenderDone();
}

function fzRenderDone(){
  const body = fzBody();
  if (!body || !fz) return;
  const acc = fz.answered ? Math.round(100 * fz.correct / fz.answered) : 0;
  let bestLine = '';
  if (fz.prevBest > 0 && fz.score > fz.prevBest){
    bestLine = `<div class="cb-newbest">&#x1F3C6; ${t('games.common.newBest', { value: fz.prevBest })}</div>`;
  } else if (fz.prevBest > 0){
    bestLine = `<div class="coach-tip">${t('games.common.bestTodayLabel')}: ${fz.prevBest}.</div>`;
  }
  body.innerHTML =
    `<div class="coach-report">
       <div class="cb-done-score">${fz.score}</div>
       <div class="coach-overall">&#x1F4A5; ${t(fz.answered === 1 ? 'games.common.cardsAnsweredOne' : 'games.common.cardsAnsweredMany', { answered: fz.answered, correct: fz.correct, acc })}</div>
       ${bestLine}
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="fzStart()">&#x21BB; ${t('games.common.playAgain')}</button>
         <button type="button" class="tp-btn" onclick="fzSetup()">${t('games.fz.changeDeck')}</button>
       </div>
     </div>`;
}

/* ════════════════════════════════════════════════════════════════════
   STRUM HERO — one-button rhythm game for the curriculum's strumming
   patterns. Down/up arrows slide toward a hit line over an audible
   metronome; the student taps (spacebar, or the big pad) on every strum
   and gets graded on timing. No mic — the click can be loud because
   nothing is listening. Unlike the other games' performance.now grids,
   the clicks here are scheduled on the AUDIO clock (a ~25ms lookahead
   scheduler posting osc.start(t) ahead of time), so they stay steady even
   when the event loop hiccups; taps are bridged into that clock via an
   epoch pair captured at round start.
   ════════════════════════════════════════════════════════════════════ */

const SH_BARS = 8;
/* slots = one bar of eighth positions (1 + 2 + 3 + 4 +): 'D', 'U', or
   null for "hand moves, pick misses". Straight from the curriculum:
   Module 5 Set 1 (all downs), M5 Set 2 / M6 Set 1 (down-up eighths),
   M6 Set 2 (Old Faithful), M6 Set 3 (reggae chop). */
const SH_PATTERNS = [
  { id: 'downs',    labelKey: 'games.sh.pattern.downs.label',
    hintKey: 'games.sh.pattern.downs.hint',
    slots: ['D', null, 'D', null, 'D', null, 'D', null], minBpm: 50, maxBpm: 120, defBpm: 60 },
  { id: 'eighths',  labelKey: 'games.sh.pattern.eighths.label',
    hintKey: 'games.sh.pattern.eighths.hint',
    slots: ['D', 'U', 'D', 'U', 'D', 'U', 'D', 'U'], minBpm: 50, maxBpm: 120, defBpm: 70 },
  { id: 'faithful', labelKey: 'games.sh.pattern.faithful.label',
    hintKey: 'games.sh.pattern.faithful.hint',
    slots: ['D', null, 'D', 'U', null, 'U', 'D', 'U'], minBpm: 50, maxBpm: 120, defBpm: 70 },
  { id: 'reggae',   labelKey: 'games.sh.pattern.reggae.label',
    hintKey: 'games.sh.pattern.reggae.hint',
    slots: [null, 'U', null, 'U', null, 'U', null, 'U'], minBpm: 50, maxBpm: 120, defBpm: 70 }
];

let sh = null, shRaf = null;

function shStop(){
  if (shRaf){ cancelAnimationFrame(shRaf); shRaf = null; }
  document.removeEventListener('keydown', shKeydown);
  if (sh){
    if (sh.sched){ clearInterval(sh.sched); sh.sched = null; }
    (sh.timeouts || []).forEach(clearTimeout);
    sh = null;
  }
}

function shBody(){ return document.getElementById('sh-body'); }
function shBestKey(patId){ return 'shBest:' + patId; }

/* Session best per pattern is a JSON {score, bpm} — the tempo it was set
   at matters to the student ("2400 at 70 BPM"). */
function shBestRead(patId){
  try {
    const b = JSON.parse(sessionStorage.getItem(shBestKey(patId)));
    if (b && b.score > 0) return { score: Math.round(b.score), bpm: Math.round(b.bpm) || 0 };
  } catch(e){}
  return null;
}

function shSetup(){
  let patIdx = 0, bpm = 0;
  try {
    const pid = sessionStorage.getItem('shPat');
    const i = SH_PATTERNS.findIndex(p => p.id === pid);
    if (i >= 0) patIdx = i;
    bpm = parseInt(sessionStorage.getItem('shBpm'), 10) || 0;
  } catch(e){}
  const pat = SH_PATTERNS[patIdx];
  if (!(bpm >= pat.minBpm && bpm <= pat.maxBpm)) bpm = pat.defBpm;
  sh = { phase: 'setup', patIdx, bpm, timeouts: [] };
  shRenderSetup();
}

function shPickPat(i){
  if (!sh) return;
  sh.patIdx = i;
  const pat = SH_PATTERNS[i];
  try { sessionStorage.setItem('shPat', pat.id); } catch(e){}
  /* Keep the student's chosen tempo if it fits the new pattern, else the
     pattern's own default (only "all downs" differs, at 60). */
  let stored = 0;
  try { stored = parseInt(sessionStorage.getItem('shBpm'), 10) || 0; } catch(e){}
  sh.bpm = (stored >= pat.minBpm && stored <= pat.maxBpm) ? stored : pat.defBpm;
  shRenderSetup();
}

function shNudgeBpm(d){
  if (!sh) return;
  const pat = SH_PATTERNS[sh.patIdx];
  sh.bpm = Math.min(pat.maxBpm, Math.max(pat.minBpm, sh.bpm + d));
  try { sessionStorage.setItem('shBpm', String(sh.bpm)); } catch(e){}
  const el = document.getElementById('sh-bpm-readout');
  if (el) el.textContent = sh.bpm + ' BPM';
  else shRenderSetup();
}

/* The site's monospace strum notation (.strum-line, as in Module 6):
   D/U over the count row, · for the skipped positions. */
function shPatternLineHtml(pat){
  const row = pat.slots.map(d => d ? d : '<span class="su-skip">·</span>').join('   ');
  return `<div class="strum-line">${row}\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>`;
}

function shRenderSetup(msg){
  const body = shBody();
  if (!body || !sh) return;
  const pills = SH_PATTERNS.map((p, i) =>
    `<button type="button" class="ts-btn${i === sh.patIdx ? ' active' : ''}" onclick="shPickPat(${i})">${escHtml(t(p.labelKey))}</button>`
  ).join('');
  const pat = SH_PATTERNS[sh.patIdx];
  const best = shBestRead(pat.id);
  body.innerHTML =
    (msg ? `<div class="coach-note">${escHtml(msg)}</div>` : '') +
    `<div class="cc-group"><div class="cc-group-title">${t('games.sh.patternGroupTitle')}</div><div class="fret-levels">${pills}</div></div>
     ${shPatternLineHtml(pat)}
     <div class="coach-tip">${escHtml(t(pat.hintKey))}</div>
     <div class="coach-bpm-row">
       <button type="button" class="tp-btn" onclick="shNudgeBpm(-5)">&#x2212;5</button>
       <span class="coach-bpm-readout" id="sh-bpm-readout">${sh.bpm} BPM</span>
       <button type="button" class="tp-btn" onclick="shNudgeBpm(5)">+5</button>
       ${best ? `<span class="cc-best">${t('games.common.bestTodayValue', {value: best.score + (best.bpm ? ' (' + t('games.common.atBpm', {bpm: best.bpm}) + ')' : '')})}</span>` : ''}
     </div>
     <div class="coach-tip">${t('games.sh.tipArrows')}</div>
     <button type="button" class="coach-start" onclick="shStart()">${t('games.sh.startBarsButton', {bars: SH_BARS})}</button>`;
}

/* One metronome click, scheduled at an exact audio-clock time — beep()'s
   envelope recipe, parameterized with a future start. Same voice as the
   count-in (660 normal / 990 accent), but quieter. */
function shClickAt(t, accent){
  const ctx = sh.ctx;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.frequency.value = accent ? 990 : 660;
  g.gain.setValueAtTime(0.25, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  o.start(t); o.stop(t + 0.05);
}

/* Short muted-strum "chick" on every tap (filtered noise burst) so
   tapping feels like strumming, not like clicking a button. */
function shChick(){
  const ctx = sh.ctx;
  const n = Math.ceil(ctx.sampleRate * 0.04);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 1;
  const g = ctx.createGain();
  g.gain.value = 0.3;
  src.connect(bp); bp.connect(g); g.connect(ctx.destination);
  src.start();
}

/* Lookahead scheduler (the "two clocks" pattern): every ~25ms, post any
   click due in the next ~120ms at its exact audio-clock time. Clicks on
   QUARTER beats only — 4 count-in clicks (beat 4 high, like coachCountIn),
   then bars 1–8 with beat 1 of each bar accented. */
function shSchedule(){
  const s = sh;
  if (!s || (s.phase !== 'countin' && s.phase !== 'play')) return;
  const horizon = s.ctx.currentTime + 0.12;
  while (s.nextClick < 4 + SH_BARS * 4){
    const t = s.startAt + s.nextClick * s.spb;
    if (t >= horizon) break;
    const accent = s.nextClick < 4 ? s.nextClick === 3 : (s.nextClick - 4) % 4 === 0;
    shClickAt(t, accent);
    s.nextClick++;
  }
}

async function shStart(){
  if (!sh || sh.phase === 'countin' || sh.phase === 'play') return;
  if (typeof getAudioCtx !== 'function'){ shRenderSetup(t('games.sh.noSoundMsg')); return; }
  coachClose(); coachEvictTuner();   // one mic/audio owner at a time
  const s = sh;
  s.phase = 'countin';
  stopAllDemoAudio();
  const ctx = getAudioCtx();
  /* beep() assumes a running context; we schedule on the audio clock, so
     a suspended (autoplay-blocked) clock must actually be running before
     we capture the epoch — hence the await, with the usual stale guard. */
  if (ctx.state === 'suspended'){
    try { await ctx.resume(); } catch(e){}
  }
  if (sh !== s || s.phase !== 'countin') return;   // panel switched during the resume
  if (!shBody()){ shStop(); return; }

  const pat = SH_PATTERNS[s.patIdx];
  s.ctx = ctx;
  s.spb = 60 / s.bpm;                              // seconds per quarter beat
  /* Hit windows: Perfect ±70ms, Good ±140ms — capped at 45% of the
     eighth-slot spacing so neighbouring windows can't overlap at speed. */
  s.good = Math.min(0.140, 0.45 * (s.spb / 2));
  s.perfect = Math.min(0.070, s.good);
  /* Clock bridge: DOM taps arrive in performance.now() ms; clicks live on
     ctx.currentTime seconds. One epoch pair converts between them. */
  s.epoch = performance.now() - ctx.currentTime * 1000;
  s.startAt = ctx.currentTime + 0.25;              // count-in beat 1
  s.t0 = s.startAt + 4 * s.spb;                    // bar 1, beat 1
  s.notes = [];
  for (let b = 0; b < SH_BARS; b++){
    pat.slots.forEach((dir, i) => {
      if (dir) s.notes.push({ t: s.t0 + (b * 4 + i / 2) * s.spb, dir, result: null });
    });
  }
  s.score = 0; s.combo = 0; s.maxCombo = 0; s.extras = 0;
  s.errs = [];                                     // signed tap errors (s), for the early/late line
  s.sweepIdx = 0; s.lastBeat = -1; s.nextClick = 0;
  shRenderPlay();
  s.els = s.notes.map((_, i) => document.getElementById('sh-n-' + i));
  document.addEventListener('keydown', shKeydown);   // spacebar taps
  if (s.sched) clearInterval(s.sched);
  s.sched = setInterval(shSchedule, 25);
  shSchedule();
  if (shRaf) cancelAnimationFrame(shRaf);
  shLoop();
}

function shRenderPlay(){
  const body = shBody();
  if (!body || !sh) return;
  const arrows = sh.notes.map((n, i) =>
    `<span class="sh-arrow" id="sh-n-${i}"><span class="sh-arrow-glyph">${n.dir === 'D' ? '&#x2193;' : '&#x2191;'}</span><span class="sh-arrow-letter">${n.dir}</span></span>`
  ).join('');
  body.innerHTML =
    `<div class="sh-hud">
       <span class="sh-score" id="sh-score">${t('games.common.score', {n: 0})}</span>
       <span class="sh-combo" id="sh-combo">&nbsp;</span>
       <span class="sh-bar" id="sh-bar">${t('games.sh.getReady')}</span>
     </div>
     <div class="cc-beats" id="sh-beats"><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span></div>
     <div class="sh-lane" id="sh-lane"><div class="sh-hitline"></div>${arrows}<div class="sh-count" id="sh-count">&nbsp;</div></div>
     <button type="button" class="sh-pad" onpointerdown="shPadTap(event)">
       <span class="sh-pad-label">${t('games.sh.tapPadLabel')}</span>
       <span class="sh-pad-sub">${t('games.sh.tapPadSub')}</span>
     </button>
     <button type="button" class="tp-btn coach-stop" onclick="shFinish()">&#x25A0; ${t('games.common.stop')}</button>`;
}

function shKeydown(e){
  if (e.key !== ' ' && e.code !== 'Space') return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  e.preventDefault();                // space would scroll / re-click a focused button
  if (e.repeat) return;
  shTap(e.timeStamp);
}

function shPadTap(e){
  shTap(e.timeStamp);
}

function shHudRefresh(){
  const s = sh;
  const scoreEl = document.getElementById('sh-score');
  if (scoreEl) scoreEl.textContent = t('games.common.score', {n: s.score});
  const comboEl = document.getElementById('sh-combo');
  if (comboEl){
    const mult = Math.min(4, 1 + Math.floor(s.combo / 8));
    comboEl.innerHTML = s.combo >= 4
      ? '&#x1F525; ' + t('games.common.inARow', {n: s.combo}) + (mult > 1 ? ' &mdash; &times;' + mult : '')
      : '&nbsp;';
  }
}

/* One tap: bridge it onto the audio clock, match it to the nearest open
   strum slot within the Good window. Taps during the count-in are free
   practice (they still chick, they're never graded). */
function shTap(ts){
  const s = sh;
  if (!s || (s.phase !== 'countin' && s.phase !== 'play')) return;
  shChick();
  const t = (ts - s.epoch) / 1000;
  if (t < s.t0 - s.good) return;
  let best = -1, bestAbs = Infinity;
  for (let i = 0; i < s.notes.length; i++){
    const n = s.notes[i];
    if (n.result) continue;
    if (n.t - t > s.good) break;     // notes are time-sorted — the rest are too far ahead
    const a = Math.abs(n.t - t);
    if (a < bestAbs){ bestAbs = a; best = i; }
  }
  if (best >= 0 && bestAbs <= s.good){
    const n = s.notes[best];
    s.errs.push(t - n.t);
    s.combo++;
    if (s.combo > s.maxCombo) s.maxCombo = s.combo;
    const mult = Math.min(4, 1 + Math.floor(s.combo / 8));   // ×2 at 8 in a row, cap ×4
    if (bestAbs <= s.perfect){
      n.result = 'perfect';
      s.score += 100 * mult;
      if (s.els[best]) s.els[best].classList.add('hit-perfect');
    } else {
      n.result = 'good';
      s.score += 50 * mult;
      if (s.els[best]) s.els[best].classList.add('hit-good');
    }
  } else if (t >= s.t0) {
    /* Stray tap — no slot near it. Breaks the combo, small penalty.
       (Before t0 it's still the count-in: free practice, no penalty.) */
    s.extras++;
    s.combo = 0;
    s.score = Math.max(0, s.score - 10);
  }
  shHudRefresh();
}

function shLoop(){
  if (!sh) return;
  if (!shBody()){ shStop(); return; }   // panel swapped under us
  const s = sh;
  const now = s.ctx.currentTime;

  if (s.phase === 'countin'){
    const el = document.getElementById('sh-count');
    if (now >= s.t0){
      s.phase = 'play';
      if (el) el.innerHTML = '&nbsp;';
    } else if (now >= s.startAt && el){
      el.textContent = String(Math.min(4, Math.floor((now - s.startAt) / s.spb) + 1));
    }
  }

  /* Arrow positions are a pure function of the audio clock — JS transforms,
     not CSS animations (reduced-motion zeroes those). The lane shows ~2
     bars of lookahead right of the hit line. */
  const lane = document.getElementById('sh-lane');
  if (lane){
    const laneW = lane.clientWidth;
    const hitX = laneW * 0.3;
    /* Narrow lanes show 1 bar of lookahead instead of 2, or eighth-note
       arrows smear together on phones. */
    const lookBeats = laneW < 480 ? 4 : 8;
    const pxPerSec = (laneW - hitX) / (lookBeats * s.spb);
    for (let i = 0; i < s.notes.length; i++){
      const el = s.els[i];
      if (!el) continue;
      const x = hitX + (s.notes[i].t - now) * pxPerSec;
      if (x < -60 || x > laneW + 60){
        el.style.visibility = 'hidden';
      } else {
        el.style.visibility = 'visible';
        el.style.transform = 'translateX(' + x + 'px)';
      }
    }
  }

  if (s.phase === 'play'){
    /* Slots past their window (+150ms grace) become misses. */
    while (s.sweepIdx < s.notes.length && s.notes[s.sweepIdx].result) s.sweepIdx++;
    for (let i = s.sweepIdx; i < s.notes.length; i++){
      const n = s.notes[i];
      if (n.t + s.good + 0.15 > now) break;
      if (!n.result){
        n.result = 'miss';
        s.combo = 0;
        if (s.els[i]) s.els[i].classList.add('miss');
        shHudRefresh();
      }
    }

    const beat = Math.floor((now - s.t0) / s.spb);
    if (beat !== s.lastBeat && beat >= 0){
      s.lastBeat = beat;
      const bar = Math.floor(beat / 4);
      const barEl = document.getElementById('sh-bar');
      if (barEl && bar < SH_BARS) barEl.textContent = t('games.sh.barOfTotal', {bar: bar + 1, total: SH_BARS});
      document.querySelectorAll('#sh-beats .cc-pip').forEach((el, i) => el.classList.toggle('on', i === beat % 4));
    }

    if (now > s.t0 + SH_BARS * 4 * s.spb + 0.4){ shFinish(); return; }
  }
  shRaf = requestAnimationFrame(shLoop);
}

function shFinish(){
  if (!sh || (sh.phase !== 'play' && sh.phase !== 'countin')) return;
  const s = sh;
  if (s.sched){ clearInterval(s.sched); s.sched = null; }
  if (shRaf){ cancelAnimationFrame(shRaf); shRaf = null; }
  document.removeEventListener('keydown', shKeydown);
  (s.timeouts || []).forEach(clearTimeout);
  s.timeouts = [];
  s.notes.forEach(n => { if (!n.result) n.result = 'miss'; });   // early Stop: the rest never got tapped
  s.phase = 'done';
  const pat = SH_PATTERNS[s.patIdx];
  const prev = shBestRead(pat.id);
  s.prevBest = prev ? prev.score : 0;
  if (s.score > s.prevBest){
    try { sessionStorage.setItem(shBestKey(pat.id), JSON.stringify({ score: s.score, bpm: s.bpm })); } catch(e){}
  }
  /* Cross-session best → the student's progress doc. Skipped in dev bypass
     (Firestore rejects that uid; the session best above still counts). */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    const old = (games.sh && games.sh.best) || 0;
    if (s.score > old){
      games.sh = { best: s.score, pattern: pat.id, bpm: s.bpm, at: new Date().toISOString().slice(0, 10) };
      saveGames();
    }
  }
  shRenderDone();
}

function shRenderDone(){
  const body = shBody();
  if (!body || !sh) return;
  const s = sh;
  const total = s.notes.length;
  const nPerfect = s.notes.filter(n => n.result === 'perfect').length;
  const nGood = s.notes.filter(n => n.result === 'good').length;
  const nMiss = total - nPerfect - nGood;
  const acc = total ? Math.round(100 * (nPerfect + 0.5 * nGood) / total) : 0;
  const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 50 ? 1 : 0;
  const starHtml = '&#x2605;'.repeat(stars) + '&#x2606;'.repeat(3 - stars);

  let verdict, advice;
  if (stars === 3){
    verdict = t('games.sh.verdict.three', {acc});
    advice = t('games.sh.advice.three');
  } else if (stars === 2){
    verdict = t('games.sh.verdict.two', {acc});
    advice = t('games.sh.advice.two');
  } else if (stars === 1){
    verdict = t('games.sh.verdict.one', {acc});
    advice = t('games.sh.advice.one');
  } else {
    verdict = t('games.sh.verdict.zero', {acc});
    advice = t('games.sh.advice.zero');
  }

  /* Early/late bias — median signed error over the graded taps. Only
     shown with enough taps to mean something. */
  let biasLine = '';
  if (s.errs.length >= 4){
    const med = tunerMedian(s.errs) * 1000;
    if (Math.abs(med) > 25){
      biasLine = `<div class="coach-tip sh-center">${med < 0
        ? t('games.sh.biasEarly', {ms: Math.round(-med)})
        : t('games.sh.biasLate', {ms: Math.round(med)})}</div>`;
    }
  }

  let bestLine = '';
  if (s.prevBest > 0 && s.score > s.prevBest){
    bestLine = `<div class="sh-newbest">&#x1F3C6; ${t('games.sh.newBest', {prevBest: s.prevBest})}</div>`;
  } else if (s.prevBest > 0){
    bestLine = `<div class="coach-tip sh-center">${t('games.common.bestTodayValue', {value: s.prevBest})}</div>`;
  }

  const rec = stars >= 3 ? 'up' : stars >= 1 ? 'same' : 'down';
  body.innerHTML =
    `<div class="coach-report">
       <div class="sh-done-score">${s.score}</div>
       <div class="sh-stars">${starHtml}</div>
       <div class="coach-overall">&#x1F3B8; ${escHtml(verdict)}</div>
       <div class="coach-strip">
         <span class="coach-chip ok">${t('games.sh.chipPerfect', {n: nPerfect})}</span>
         <span class="coach-chip good">${t('games.sh.chipGood', {n: nGood})}</span>
         <span class="coach-chip miss">${t('games.sh.chipMiss', {n: nMiss})}</span>
         ${s.extras ? `<span class="coach-chip dim">${t('games.sh.chipExtraTaps', {n: s.extras})}</span>` : ''}
       </div>
       ${s.maxCombo >= 8 ? `<div class="coach-tip sh-center">${t('games.sh.longestStreak', {n: s.maxCombo})}</div>` : ''}
       ${biasLine}
       ${bestLine}
       <div class="coach-crit-note">${escHtml(advice)}</div>
       <div class="coach-actions">
         <button type="button" class="${rec === 'down' ? 'coach-start' : 'tp-btn'}" onclick="shAgain(-10)">&#x2B07; &minus;10 BPM</button>
         <button type="button" class="${rec === 'same' ? 'coach-start' : 'tp-btn'}" onclick="shAgain(0)">&#x21BB; ${t('games.sh.againAtBpm', {bpm: s.bpm})}</button>
         <button type="button" class="${rec === 'up' ? 'coach-start' : 'tp-btn'}" onclick="shAgain(10)">&#x2B06; +10 BPM</button>
       </div>
       <button type="button" class="tp-btn" onclick="shSetup()">${t('games.sh.changePatternButton')}</button>
     </div>`;
}

function shAgain(d){
  if (!sh) return;
  const pat = SH_PATTERNS[sh.patIdx];
  sh.bpm = Math.min(pat.maxBpm, Math.max(pat.minBpm, sh.bpm + d));
  try { sessionStorage.setItem('shBpm', String(sh.bpm)); } catch(e){}
  sh.phase = 'setup';
  shStart();
}

/* ════════════════════════════════════════════════════════════════════
   RIFF ROULETTE — a practice spinner for the real guitar. Spin, get a
   short challenge from your current module, do it over a metronome and
   a countdown, then score yourself. Honesty is the whole game: the
   points are only worth what the practice was. No mic — the guitar in
   the student's hands is the input; the buttons are the judge. Three
   scored cards make the daily set; finishing one keeps a Firestore
   streak alive (games.rr), everything else is session-scoped like the
   other games' "today" numbers.
   ════════════════════════════════════════════════════════════════════ */

/* The card bank. Draw pool = cards whose module range contains the
   student's current module (lastModuleNum), so a challenge never asks
   for anything the class hasn't taught yet. Early-module cards age out
   (maxModule) so a Module 6 student isn't dealt open-string plucking.
   bpm null = no metronome (holds, stretches, count-your-changes cards);
   double = worth 200 instead of 100. */
const RR_CARDS = [
  /* Module 1 — open strings, thumb strums */
  { textKey: 'games.rr.card01',
    bpm: 60, secs: 30, minModule: 1, maxModule: 3 },
  { textKey: 'games.rr.card02',
    bpm: null, secs: 30, minModule: 1, maxModule: 3 },
  { textKey: 'games.rr.card03',
    bpm: null, secs: 45, minModule: 1, maxModule: 3 },
  { textKey: 'games.rr.card04',
    bpm: 60, secs: 40, minModule: 1, maxModule: 3 },
  /* Module 2 — notes on the E & A strings */
  { textKey: 'games.rr.card05',
    bpm: 60, secs: 45, minModule: 2, maxModule: 5 },
  { textKey: 'games.rr.card06',
    bpm: null, secs: 30, minModule: 2, maxModule: 5 },
  { textKey: 'games.rr.card07',
    bpm: 60, secs: 45, minModule: 2, maxModule: 5 },
  { textKey: 'games.rr.card08',
    bpm: 60, secs: 45, minModule: 2, maxModule: 5 },
  /* Module 3 — power chords, palm mute, Seven Nation Army */
  { textKey: 'games.rr.card09',
    bpm: 70, secs: 45, minModule: 3 },
  { textKey: 'games.rr.card10',
    bpm: 80, secs: 40, minModule: 3 },
  { textKey: 'games.rr.card11',
    bpm: 90, secs: 60, minModule: 3 },
  { textKey: 'games.rr.card12',
    bpm: 70, secs: 45, minModule: 3 },
  /* Module 4 — minor pentatonic Pattern 1, alternate picking */
  { textKey: 'games.rr.card13',
    bpm: 60, secs: 60, minModule: 4 },
  { textKey: 'games.rr.card14',
    bpm: 70, secs: 45, minModule: 4 },
  { textKey: 'games.rr.card15',
    bpm: 60, secs: 60, minModule: 4 },
  /* Module 5 — open chords */
  { textKey: 'games.rr.card16',
    bpm: null, secs: 60, minModule: 5 },
  { textKey: 'games.rr.card17',
    bpm: null, secs: 60, minModule: 5 },
  { textKey: 'games.rr.card18',
    bpm: 60, secs: 60, minModule: 5 },
  { textKey: 'games.rr.card19',
    bpm: null, secs: 45, minModule: 5 },
  /* Module 6 — strumming patterns, partial barres */
  { textKey: 'games.rr.card20',
    bpm: 70, secs: 60, minModule: 6 },
  { textKey: 'games.rr.card21',
    bpm: 70, secs: 45, minModule: 6 },
  { textKey: 'games.rr.card22',
    bpm: 70, secs: 60, minModule: 6 },
  { textKey: 'games.rr.card23',
    bpm: 60, secs: 45, minModule: 6 },
  /* Module 7 — full barre chords */
  { textKey: 'games.rr.card24',
    bpm: null, secs: 60, minModule: 7 },
  { textKey: 'games.rr.card25',
    bpm: null, secs: 45, minModule: 7 },
  /* Module 8 — fingerpicking */
  { textKey: 'games.rr.card26',
    bpm: 60, secs: 60, minModule: 8 },
  { textKey: 'games.rr.card27',
    bpm: 60, secs: 45, minModule: 8 },
  /* Module 9 — the full fretboard & writing TAB */
  { textKey: 'games.rr.card28',
    bpm: null, secs: 60, minModule: 9 },
  { textKey: 'games.rr.card29',
    bpm: null, secs: 45, minModule: 9 },
  /* Module 10 — scales */
  { textKey: 'games.rr.card30',
    bpm: 60, secs: 60, minModule: 10 },
  { textKey: 'games.rr.card31',
    bpm: 60, secs: 60, minModule: 10 },
  /* Module 11 — chord families */
  { textKey: 'games.rr.card32',
    bpm: null, secs: 45, minModule: 11 },
  /* Module 12 — fingerstyle */
  { textKey: 'games.rr.card33',
    bpm: 60, secs: 45, minModule: 12 },
  /* Wildcards — any module */
  { textKey: 'games.rr.card34',
    bpm: null, secs: 60, minModule: 1, double: true },
  { textKey: 'games.rr.card35',
    bpm: null, secs: 30, minModule: 1, double: true },
  { textKey: 'games.rr.card36',
    bpm: null, secs: 45, minModule: 1 },
  { textKey: 'games.rr.card37',
    bpm: null, secs: 30, minModule: 1 }
];

let rr = null;

function rrStop(){
  if (rr){
    if (rr.sched){ clearInterval(rr.sched); rr.sched = null; }
    if (rr.tick){ clearInterval(rr.tick); rr.tick = null; }
    (rr.timeouts || []).forEach(clearTimeout);
    rr = null;
  }
}

function rrBody(){ return document.getElementById('rr-body'); }

function rrNum(key){
  try { return parseInt(sessionStorage.getItem(key), 10) || 0; } catch(e){}
  return 0;
}

function rrDayStr(d){
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/* A streak is worth showing only while it's alive — kept up today or
   still winnable today (last set was yesterday). */
function rrStreakAlive(g, min){
  if (!g || !(g.streak >= (min || 2)) || !g.lastDay) return false;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return g.lastDay === rrDayStr(new Date()) || g.lastDay === rrDayStr(y);
}

function rrPool(){
  const m = (typeof lastModuleNum !== 'undefined' && lastModuleNum) || 1;
  const pool = [];
  RR_CARDS.forEach((c, i) => {
    if (c.minModule <= m && (!c.maxModule || m <= c.maxModule)) pool.push(i);
  });
  return pool;
}

function rrQueueRead(){
  try {
    const q = JSON.parse(sessionStorage.getItem('rrQueue'));
    if (Array.isArray(q)) return q.filter(e => e && RR_CARDS[e.idx]);
  } catch(e){}
  return [];
}

function rrQueueWrite(q){
  try { sessionStorage.setItem('rrQueue', JSON.stringify(q)); } catch(e){}
}

/* Deal a card: "Almost" cards come back once their spins-out counter
   runs down; otherwise random from the module pool. Never the same
   card twice in a row. */
function rrDraw(){
  let last = -1;
  try { last = parseInt(sessionStorage.getItem('rrLast'), 10); } catch(e){}
  if (isNaN(last)) last = -1;
  const q = rrQueueRead();
  q.forEach(e => e.due--);
  let pick = -1;
  const di = q.findIndex(e => e.due <= 0 && e.idx !== last);
  if (di >= 0) pick = q.splice(di, 1)[0].idx;
  rrQueueWrite(q);
  if (pick < 0){
    const pool = rrPool();
    const avail = pool.filter(i => i !== last);
    pick = avail.length ? avail[Math.floor(Math.random() * avail.length)] : pool[0];
  }
  try { sessionStorage.setItem('rrLast', String(pick)); } catch(e){}
  return pick;
}

/* Today's counters live in sessionStorage; a tab left open across
   midnight would otherwise carry yesterday's set into today — and a
   carried-over rrDone >= 3 would keep the daily set from ever completing.
   Called on view entry AND before every spin/skip (not on score: a card
   dealt at 23:59 still belongs to the day that dealt it). */
function rrDayReset(){
  const today = rrDayStr(new Date());
  let day = '';
  try { day = sessionStorage.getItem('rrDay') || ''; } catch(e){}
  if (day !== today){
    try {
      sessionStorage.setItem('rrDay', today);
      sessionStorage.removeItem('rrPts');
      sessionStorage.removeItem('rrDone');
      sessionStorage.removeItem('rrSkips');
      sessionStorage.removeItem('rrQueue');
      sessionStorage.removeItem('rrLast');
    } catch(e){}
  }
}

function rrSetup(){
  rrDayReset();
  rr = { phase: 'setup', timeouts: [] };
  rrRenderSetup();
}

function rrRenderSetup(justDone){
  const body = rrBody();
  if (!body || !rr) return;
  const pts = rrNum('rrPts'), done = rrNum('rrDone');
  const g = (typeof games !== 'undefined' && games && games.rr) || null;
  const streak = rrStreakAlive(g, 1) ? g.streak : 0;
  const chips =
    `<span class="rr-chip">&#x2B50; ${t('games.rr.chipPointsToday', {n: pts})}</span>
     <span class="rr-chip">&#x1F0CF; ${t('games.rr.chipCardsOfThree', {n: Math.min(done, 3)})}</span>
     ${streak ? `<span class="rr-chip streak">&#x1F525; ${streak === 1 ? t('games.rr.streakStartedToday') : t('games.rr.streakDays', {n: streak})}</span>` : ''}`;
  body.innerHTML =
    `<div class="coach-tip rr-center">${t('games.rr.tagline')}</div>
     <div class="rr-chips">${chips}</div>
     ${done >= 3 ? `<div class="rr-done-banner" id="rr-done-banner">&#x1F389; ${t('games.rr.doneBanner', {pts})}</div>` : ''}
     <button type="button" class="coach-start rr-spin-btn" onclick="rrSpin()">&#x1F3B0; ${t('games.rr.spinButton')}</button>`;
  if (justDone) rrCelebrate(document.getElementById('rr-done-banner'));
}

/* Small celebration over the done banner — same particles as the
   module-strip completion moment. */
function rrCelebrate(el){
  if (!el) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = el.getBoundingClientRect();
  ['\u{1F3B8}', '\u{1F3B5}', '\u2B50', '\u{1F3B6}', '\u{1F3B5}', '\u2728'].forEach((ch, i) => {
    const p = document.createElement('span');
    p.className = 'celebrate-particle';
    p.textContent = ch;
    p.style.left = (r.left + r.width / 2 - 9 + (i - 2.5) * 18) + 'px';
    p.style.top = (r.top - 4) + 'px';
    p.style.animationDelay = (i * 60) + 'ms';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1900);
  });
}

/* One-line preview for the shuffle animation — the cycling faces are
   decoration, only the final card needs to be readable. */
function rrFaceText(card){
  const text = t(card.textKey);
  return text.length > 60 ? text.slice(0, 57) + '…' : text;
}

function rrSpin(){
  if (!rr || (rr.phase !== 'setup' && rr.phase !== 'card')) return;
  rrDayReset();
  const s = rr;
  const body = rrBody();
  if (!body) return;
  s.phase = 'spin';
  s.cardIdx = rrDraw();
  (s.timeouts || []).forEach(clearTimeout);
  s.timeouts = [];
  body.innerHTML = `<div class="rr-card"><div class="rr-card-text" id="rr-face">&nbsp;</div></div>`;
  /* Shuffle: cycle card faces quickly, slowing down, then land on the
     dealt card. JS timeouts, not CSS animation, so reduced-motion users
     still see the cycle (it stays decorative either way). */
  const pool = rrPool();
  let delay = 0;
  [70, 70, 80, 90, 100, 110, 130, 150, 180].forEach(ms => {
    delay += ms;
    s.timeouts.push(setTimeout(() => {
      if (rr !== s || s.phase !== 'spin') return;
      const el = document.getElementById('rr-face');
      if (!el) return;
      const i = pool[Math.floor(Math.random() * pool.length)];
      el.textContent = rrFaceText(RR_CARDS[i]);
    }, delay));
  });
  s.timeouts.push(setTimeout(() => {
    if (rr !== s || s.phase !== 'spin') return;
    s.phase = 'card';
    rrRenderCard();
  }, delay + 200));
}

function rrRenderCard(){
  const body = rrBody();
  if (!body || !rr) return;
  const card = RR_CARDS[rr.cardIdx];
  const skipsLeft = Math.max(0, 2 - rrNum('rrSkips'));
  body.innerHTML =
    `<div class="rr-card${card.double ? ' double' : ''}">
       ${card.double ? `<div class="rr-double">&#x2B50; ${t('games.rr.doublePoints')}</div>` : ''}
       <div class="rr-card-text">${escHtml(t(card.textKey))}</div>
       <div class="rr-card-meta">
         ${card.bpm ? `<span class="rr-bpm">&#x1F3B5; ${t('games.rr.clickAtBpm', {bpm: card.bpm})}</span>` : ''}
         <span class="rr-secs">&#x23F1; ${t('games.rr.secondsLabel', {n: card.secs})}</span>
       </div>
     </div>
     <button type="button" class="coach-start" onclick="rrStart()">&#x25B6; ${t('games.common.start')}</button>
     ${skipsLeft ? `<button type="button" class="rr-skip" onclick="rrSkip()">${t('games.rr.skipCardButton', {n: skipsLeft})}</button>` : ''}`;
}

/* Two free skips a day — enough to dodge a card that doesn't fit the
   moment, not enough to fish for an easy one. */
function rrSkip(){
  if (!rr || rr.phase !== 'card') return;
  const skips = rrNum('rrSkips');
  if (skips >= 2) return;
  try { sessionStorage.setItem('rrSkips', String(skips + 1)); } catch(e){}
  rrSpin();
}

/* One metronome click at an exact audio-clock time — same lookahead
   voice as Strum Hero's, reading this game's state. */
function rrClickAt(t, accent){
  const ctx = rr.ctx;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.frequency.value = accent ? 990 : 660;
  g.gain.setValueAtTime(0.25, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  o.start(t); o.stop(t + 0.05);
}

/* Lookahead scheduler: every ~25ms, post the clicks due in the next
   ~120ms. Beat 1 of each group of 4 is accented. The beat pips ride
   this interval too — plenty smooth for a decorative pulse. */
function rrSchedule(){
  const s = rr;
  if (!s || s.phase !== 'run' || !s.ctx || !s.spb) return;   // no-metronome card: nothing to schedule
  const horizon = s.ctx.currentTime + 0.12;
  while (true){
    const t = s.startAt + s.nextClick * s.spb;
    if (t >= horizon) break;
    rrClickAt(t, s.nextClick % 4 === 0);
    s.nextClick++;
  }
  const beat = Math.floor((s.ctx.currentTime - s.startAt) / s.spb);
  if (beat !== s.lastBeat && beat >= 0){
    s.lastBeat = beat;
    document.querySelectorAll('#rr-beats .cc-pip').forEach((el, i) => el.classList.toggle('on', i === beat % 4));
  }
}

async function rrStart(){
  if (!rr || rr.phase !== 'card') return;
  coachClose(); coachEvictTuner();   // one mic/audio owner at a time
  const s = rr;
  s.phase = 'run';
  stopAllDemoAudio();
  /* The click is scheduled on the audio clock and the done-beeps use
     beep(), which assumes a running context — resume a suspended
     (autoplay-blocked) one first, with the usual stale guard. */
  if (typeof getAudioCtx === 'function'){
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended'){
      try { await ctx.resume(); } catch(e){}
    }
    if (rr !== s || s.phase !== 'run') return;   // panel switched during the resume
    s.ctx = ctx;
  }
  if (!rrBody()){ rrStop(); return; }
  const card = RR_CARDS[s.cardIdx];
  s.endAt = performance.now() + card.secs * 1000;
  rrRenderRun();
  if (card.bpm && s.ctx){
    s.spb = 60 / card.bpm;
    s.startAt = s.ctx.currentTime + 0.2;
    s.nextClick = 0;
    s.lastBeat = -1;
    if (s.sched) clearInterval(s.sched);
    s.sched = setInterval(rrSchedule, 25);
    rrSchedule();
  }
  if (s.tick) clearInterval(s.tick);
  /* 200ms so the finish check can't drift late; display is 1Hz anyway. */
  s.tick = setInterval(rrTick, 200);
  rrTick();
}

function rrRenderRun(){
  const body = rrBody();
  if (!body || !rr) return;
  const card = RR_CARDS[rr.cardIdx];
  body.innerHTML =
    `<div class="rr-card${card.double ? ' double' : ''}">
       ${card.double ? `<div class="rr-double">&#x2B50; ${t('games.rr.doublePoints')}</div>` : ''}
       <div class="rr-card-text">${escHtml(t(card.textKey))}</div>
       ${card.bpm ? `<div class="rr-card-meta"><span class="rr-bpm">&#x1F3B5; ${card.bpm} BPM</span></div>` : ''}
     </div>
     ${card.bpm ? '<div class="cc-beats" id="rr-beats"><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span></div>' : ''}
     <div class="rr-timer" id="rr-timer">${card.secs}</div>
     <div class="coach-tip rr-center">${t('games.rr.playUntilTimer')}</div>`;
}

function rrTick(){
  if (!rr || rr.phase !== 'run'){
    if (rr && rr.tick){ clearInterval(rr.tick); rr.tick = null; }
    return;
  }
  if (!rrBody()){ rrStop(); return; }   // panel swapped under us
  const left = rr.endAt - performance.now();
  const el = document.getElementById('rr-timer');
  if (el){
    el.textContent = String(Math.max(0, Math.ceil(left / 1000)));
    el.classList.toggle('low', left <= 5000);
  }
  if (left <= 0) rrTimeUp();
}

function rrTimeUp(){
  if (!rr || rr.phase !== 'run') return;
  const s = rr;
  if (s.sched){ clearInterval(s.sched); s.sched = null; }
  if (s.tick){ clearInterval(s.tick); s.tick = null; }
  s.phase = 'score';
  /* Same three done-beeps as the FAB timer — the site's "time's up". */
  if (typeof beep === 'function'){
    [0, 350, 700].forEach(d => s.timeouts.push(setTimeout(() => { if (rr === s) beep(660, 0.3); }, d)));
  }
  rrRenderScore();
}

function rrRenderScore(){
  const body = rrBody();
  if (!body || !rr) return;
  const card = RR_CARDS[rr.cardIdx];
  const worth = card.double ? 200 : 100;
  body.innerHTML =
    `<div class="rr-time-up">&#x23F0; ${t('games.rr.timeUp')}</div>
     <div class="coach-tip rr-center">${t('games.rr.scorePrompt')}</div>
     <div class="rr-score-row">
       <button type="button" class="rr-score-btn got" onclick="rrScore('got')">
         <span>&#x2705; ${t('games.rr.scoreGotLabel')}</span><span class="rr-score-sub">${t('games.rr.scorePointsSuffix', {n: worth})}</span>
       </button>
       <button type="button" class="rr-score-btn almost" onclick="rrScore('almost')">
         <span>&#x1F7E1; ${t('games.rr.scoreAlmostLabel')}</span><span class="rr-score-sub">${t('games.rr.scoreAlmostSub', {n: worth / 2})}</span>
       </button>
       <button type="button" class="rr-score-btn" onclick="rrScore('not')">
         <span>${t('games.rr.scoreNotYetLabel')}</span><span class="rr-score-sub">${t('games.rr.scoreNotYetSub')}</span>
       </button>
     </div>`;
}

function rrScore(kind){
  if (!rr || rr.phase !== 'score') return;
  const s = rr;
  const card = RR_CARDS[s.cardIdx];
  const worth = card.double ? 200 : 100;
  const pts = kind === 'got' ? worth : kind === 'almost' ? worth / 2 : 0;
  if (kind === 'almost'){
    /* Re-queued to reappear after 2–4 more spins today. */
    const q = rrQueueRead();
    q.push({ idx: s.cardIdx, due: 2 + Math.floor(Math.random() * 3) });
    rrQueueWrite(q);
  }
  const total = rrNum('rrPts') + pts;
  const done = rrNum('rrDone') + 1;
  try {
    sessionStorage.setItem('rrPts', String(total));
    sessionStorage.setItem('rrDone', String(done));
  } catch(e){}
  if (done === 3) rrSetDone(total);
  s.phase = 'setup';
  rrRenderSetup(done === 3);
}

/* Third scored card of the day = the daily set. That's the one moment
   this game touches Firestore: bump days/streak/best on games.rr.
   Skipped in dev bypass (Firestore rejects that uid; the session
   points above still count). */
function rrSetDone(ptsTotal){
  if (typeof saveGames !== 'function' || !currentUser || isDevBypassUser()) return;
  const today = rrDayStr(new Date());
  const g = games.rr || {};
  if (g.lastDay !== today){
    const y = new Date();
    y.setDate(y.getDate() - 1);
    g.streak = g.lastDay === rrDayStr(y) ? (g.streak || 0) + 1 : 1;
    g.days = (g.days || 0) + 1;
    g.lastDay = today;
  }
  if (ptsTotal > (g.best || 0)) g.best = ptsTotal;
  games.rr = g;
  saveGames();
}

/* ════════════════════════════════════════════════════════════════════
   STRUM RADAR — Strum Hero on real strings. Same curriculum patterns
   (SH_PATTERNS), but the student holds any chord and strums an actual
   guitar; the mic grades WHEN each strum lands using Change Up's onset
   detector — amplitude/attack spikes only, no pitch anywhere (ringing
   strings defeat the pitch detector; onsets don't care). Two honest
   limits, both said out loud in the UI: the mic can't tell a downstrum
   from an upstrum (arrows are arm guidance, not graded), and the click
   goes silent after the count-in (the mic would hear the speaker), so
   the beat grid eases toward the player like Change Up's does.
   ════════════════════════════════════════════════════════════════════ */

const SR_BARS = 4;                       // half of Strum Hero: one held chord tires the
                                         // fretting hand, and short rounds mean fast retries
const SR_BPM_MIN = 50, SR_BPM_MAX = 100; // above ~100, per-eighth onsets blur together

/* Setup hints are radar-specific: Strum Hero's mention the click, and
   this game's click stops after the count-in. */
const SR_HINT_KEYS = {
  downs:    'games.radar.hint.downs',
  eighths:  'games.radar.hint.eighths',
  faithful: 'games.radar.hint.faithful',
  reggae:   'games.radar.hint.reggae'
};

let sr = null, srRaf = null;

function srStop(){
  if (srRaf){ cancelAnimationFrame(srRaf); srRaf = null; }
  if (sr){
    (sr.timeouts || []).forEach(clearTimeout);
    if (sr.micOn) coachMicOff();
    sr = null;
  }
}

function srBody(){ return document.getElementById('sr-body'); }
function srBestKey(patId){ return 'srBest:' + patId; }

/* Session best per pattern is a JSON {acc, bpm} — best accuracy wins,
   higher tempo breaks the tie. */
function srBestRead(patId){
  try {
    const b = JSON.parse(sessionStorage.getItem(srBestKey(patId)));
    if (b && b.acc > 0) return { acc: Math.round(b.acc), bpm: Math.round(b.bpm) || 0 };
  } catch(e){}
  return null;
}

function srSetup(){
  let patIdx = 0, bpm = 0;
  try {
    const pid = sessionStorage.getItem('srPat');
    const i = SH_PATTERNS.findIndex(p => p.id === pid);
    if (i >= 0) patIdx = i;
    bpm = parseInt(sessionStorage.getItem('srBpm'), 10) || 0;
  } catch(e){}
  if (!(bpm >= SR_BPM_MIN && bpm <= SR_BPM_MAX)) bpm = Math.min(SR_BPM_MAX, SH_PATTERNS[patIdx].defBpm);
  sr = { phase: 'setup', patIdx, bpm, micOn: false, timeouts: [] };
  srRenderSetup();
}

function srPickPat(i){
  if (!sr) return;
  sr.patIdx = i;
  try { sessionStorage.setItem('srPat', SH_PATTERNS[i].id); } catch(e){}
  srRenderSetup();
}

function srNudgeBpm(d){
  if (!sr) return;
  sr.bpm = Math.min(SR_BPM_MAX, Math.max(SR_BPM_MIN, sr.bpm + d));
  try { sessionStorage.setItem('srBpm', String(sr.bpm)); } catch(e){}
  const el = document.getElementById('sr-bpm-readout');
  if (el) el.textContent = sr.bpm + ' BPM';
  else srRenderSetup();
}

function srRenderSetup(msg){
  const body = srBody();
  if (!body || !sr) return;
  const pills = SH_PATTERNS.map((p, i) =>
    `<button type="button" class="ts-btn${i === sr.patIdx ? ' active' : ''}" onclick="srPickPat(${i})">${escHtml(t(p.labelKey))}</button>`
  ).join('');
  const pat = SH_PATTERNS[sr.patIdx];
  const best = srBestRead(pat.id);
  body.innerHTML =
    (msg ? `<div class="coach-note">${escHtml(msg)}</div>` : '') +
    `<div class="cc-group"><div class="cc-group-title">${t('games.radar.patternGroupTitle')}</div><div class="fret-levels">${pills}</div></div>
     ${shPatternLineHtml(pat)}
     <div class="coach-tip">${escHtml(t(SR_HINT_KEYS[pat.id] || pat.hintKey))}</div>
     <div class="coach-bpm-row">
       <button type="button" class="tp-btn" onclick="srNudgeBpm(-5)">&#x2212;5</button>
       <span class="coach-bpm-readout" id="sr-bpm-readout">${sr.bpm} BPM</span>
       <button type="button" class="tp-btn" onclick="srNudgeBpm(5)">+5</button>
       ${best ? `<span class="cc-best">${t('games.common.bestTodayValue', {value: best.acc + '%' + (best.bpm ? ' (' + t('games.common.atBpm', {bpm: best.bpm}) + ')' : '')})}</span>` : ''}
     </div>
     <div class="coach-tip">&#x1F3B8; ${t('games.radar.tipHoldChord')}</div>
     <div class="coach-tip">&#x1F92B; ${t('games.radar.tipQuietRoom')}</div>
     <button type="button" class="coach-start" onclick="srStart()">${t('games.radar.startBarsButton', {bars: SR_BARS})}</button>
     ${coachFootHtml()}`;
}

/* The one bar of the pattern, big: the same D/U monospace notation as
   the setup preview, one cell per eighth position so the current cell
   can light up as the grid advances. */
function srStripHtml(pat){
  const counts = ['1','+','2','+','3','+','4','+'];
  return `<div class="sr-strip" id="sr-strip">` + pat.slots.map((d, i) =>
    `<span class="sr-slot" id="sr-slot-${i}"><span class="sr-slot-glyph${d ? '' : ' skip'}">${d || '·'}</span><span class="sr-slot-count">${counts[i]}</span></span>`
  ).join('') + `</div>`;
}

async function srStart(){
  if (!sr || sr.phase === 'countin' || sr.phase === 'play') return;
  coachClose();
  coachEvictTuner();
  const s = sr;
  const body = srBody();
  if (!body) return;
  body.innerHTML = `<div class="coach-tip sr-center">${t('games.common.startingMic')}</div>`;
  if (!coachStream && !(await coachAcquireMic())){
    if (sr === s) srRenderSetup(t('games.common.micAccessDenied'));
    return;
  }
  if (!srBody()){ coachReleaseMicIfIdle(); return; }   // panel closed during the prompt
  if (document.hidden){ coachMicOff(); gamesShow('hub'); return; }   // backgrounded during the prompt
  if (sr !== s){ coachReleaseMicIfIdle(); return; }    // a new session started under us
  stopAllDemoAudio();
  s.micOn = true;
  window.coachMicLive = true;   // stream may already be open from a prior owner

  const pat = SH_PATTERNS[s.patIdx];
  s.beatMs = 60000 / s.bpm;
  s.slotMs = s.beatMs / 2;
  /* Hit window per expected strum — wider than Strum Hero's tap windows
     because onset detection adds its own jitter, capped so neighbouring
     eighth slots can't both claim one strum. */
  s.win = Math.max(90, s.beatMs * 0.22);
  s.notes = [];
  for (let b = 0; b < SR_BARS; b++){
    pat.slots.forEach((dir, i) => {
      if (dir) s.notes.push({ t: (b * 8 + i) * s.slotMs, dir, bar: b, result: null });
    });
  }
  s.errs = [];                  // signed onset errors (ms), for the early/late line
  s.extras = 0;
  s.smoothRms = 0; s.smoothHf = 0; s.lastOnsetT = -1e9; s.gridOffset = 0; s.lastSlot = -1;
  s.phase = 'countin';
  srBody().innerHTML = `<div class="coach-count" id="sr-count">&nbsp;</div>` + srStripHtml(pat) +
    `<div class="coach-tip sr-center">${t('games.radar.tipCountInThenStrum')}</div>`;
  coachCountIn(s, 'sr-count', () => {
    if (sr === s && s.phase === 'countin'){ s.phase = 'play'; srRenderPlay(); }
  });
  if (srRaf) cancelAnimationFrame(srRaf);
  srLoop();
}

function srRenderPlay(){
  const body = srBody();
  if (!body || !sr) return;
  const pat = SH_PATTERNS[sr.patIdx];
  const chips = sr.notes.map((n, i) =>
    `<span class="coach-chip pending" id="sr-chip-${i}" title="${t('games.radar.barTooltip', {n: n.bar + 1})}">${n.dir}</span>`
  ).join('');
  body.innerHTML =
    `<div class="coach-live"><span class="coach-live-dot"></span>${t('games.radar.listeningStrumAlong')}<span class="sr-bar" id="sr-bar">${t('games.radar.barOfTotal', {bar: 1, total: SR_BARS})}</span></div>
     <div class="cc-beats" id="sr-beats"><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span></div>
     ${srStripHtml(pat)}
     <div class="coach-strip">${chips}</div>
     <div class="coach-tip sr-center">${t('games.radar.tipNoClickNow')}</div>
     <button type="button" class="tp-btn coach-stop" onclick="srFinish()">&#x25A0; ${t('games.common.stop')}</button>`;
}

function srChipRefresh(i){
  const el = document.getElementById('sr-chip-' + i);
  if (el) el.className = 'coach-chip ' + (sr.notes[i].result || 'pending');
}

/* The advancing highlight: current eighth cell in the strip, beat pips,
   bar counter — all on the adapted grid the scoring reads (same rule as
   Change Up: on the rigid grid the display drifts off the player). */
function srSlotTick(cur){
  const bar = Math.floor(cur / 8);
  if (bar >= SR_BARS) return;
  document.querySelectorAll('#sr-strip .sr-slot').forEach((el, i) => el.classList.toggle('cur', i === cur % 8));
  const barEl = document.getElementById('sr-bar');
  if (barEl) barEl.textContent = t('games.radar.barOfTotal', {bar: bar + 1, total: SR_BARS});
  document.querySelectorAll('#sr-beats .cc-pip').forEach((el, i) => el.classList.toggle('on', i === Math.floor(cur / 2) % 4));
}

function srLoop(){
  if (!sr) return;
  if (!coachAnalyser || !srBody()){ srStop(); return; }  // mic taken or panel closed under us
  const s = sr;
  const now = performance.now();
  /* Bar 1 beat 1 is a graded slot, so its ±win window reaches BACK into
     the count-in — start detecting that early or an eager (but in-window)
     first strum gets swallowed by the baseline warmers and marked a miss.
     Safe from speaker bleed: the last count-in click ends a full beat
     before this, well outside any win. The visual flip stays at listenStart. */
  const srEarly = s.phase === 'countin' && now >= s.listenStart - s.win;
  if (s.phase === 'countin' && !srEarly){
    /* Warm the level trackers on room noise during the count-in — same
       cold-start guard as the Coach loop. */
    const r = coachReadFrame();
    s.smoothRms = s.smoothRms * 0.82 + r * 0.18;
    s.smoothHf = s.smoothHf * 0.82 + coachHfRms * 0.18;
  }
  if (s.phase === 'play' || srEarly){
    const rms = coachReadFrame();
    const hf = coachHfRms;

    /* Onset = strum (Change Up's dual-channel detector, same constants:
       full-band jump for a clean strum over silence, HF pick-attack
       channel for a strum over the still-ringing previous one — which is
       every strum after the first here). The 140ms refractory still fits:
       eighths at the 100 BPM cap arrive every 300ms. */
    if ((rms > COACH_ONSET_FLOOR &&
         rms > s.smoothRms * COACH_ONSET_RATIO ||
         hf > COACH_HF_FLOOR &&
         hf > s.smoothHf * COACH_HF_RATIO) &&
        now - s.lastOnsetT > COACH_ONSET_REFRACT){
      s.lastOnsetT = now;
      const rel = now - s.listenStart - s.gridOffset;
      /* No audible reference during play, so the grid eases toward the
         player — Change Up's EMA, on the eighth grid. */
      const slotIdx = Math.round(rel / s.slotMs);
      const dev = rel - slotIdx * s.slotMs;
      if (Math.abs(dev) < s.slotMs * 0.45) s.gridOffset += dev * 0.15;
      /* Nearest unconsumed expected strum within the window; anything
         else is an extra — counted, never punished live (real rooms are
         noisy, and a squeaky chair shouldn't wreck a run). */
      let best = -1, bestAbs = Infinity;
      for (let i = 0; i < s.notes.length; i++){
        const n = s.notes[i];
        if (n.result) continue;
        if (n.t - rel > s.win) break;   // notes are time-sorted — the rest are too far ahead
        const a = Math.abs(n.t - rel);
        if (a < bestAbs){ bestAbs = a; best = i; }
      }
      if (best >= 0 && bestAbs <= s.win){
        s.notes[best].result = 'ok';
        s.errs.push(rel - s.notes[best].t);
        srChipRefresh(best);
      } else if (rel > -s.win){
        s.extras++;                     // pre-roll noise before bar 1 stays free
      }
    }
    s.smoothRms = s.smoothRms * 0.82 + rms * 0.18;
    s.smoothHf = s.smoothHf * 0.82 + hf * 0.18;

    /* Overdue strums are misses. */
    const relNow = now - s.listenStart - s.gridOffset;
    s.notes.forEach((n, i) => {
      if (!n.result && relNow > n.t + 0.7 * s.slotMs){
        n.result = 'miss';
        srChipRefresh(i);
      }
    });

    const cur = Math.floor(relNow / s.slotMs);
    if (cur !== s.lastSlot && cur >= 0){ s.lastSlot = cur; srSlotTick(cur); }

    if (now > s.listenStart + (SR_BARS * 4 + 1) * s.beatMs){ srFinish(); return; }
  }
  srRaf = requestAnimationFrame(srLoop);
}

function srFinish(){
  if (!sr || (sr.phase !== 'play' && sr.phase !== 'countin')) return;
  const s = sr;
  if (srRaf){ cancelAnimationFrame(srRaf); srRaf = null; }
  s.timeouts.forEach(clearTimeout);
  s.timeouts = [];
  s.notes.forEach(n => { if (!n.result) n.result = 'miss'; });   // early Stop: the rest never landed
  if (s.micOn){ coachMicOff(); s.micOn = false; }
  s.phase = 'done';
  const pat = SH_PATTERNS[s.patIdx];
  const total = s.notes.length;
  const hits = s.notes.filter(n => n.result === 'ok').length;
  s.acc = total ? Math.round(100 * hits / total) : 0;
  s.prevBest = srBestRead(pat.id);
  if (s.acc > 0 && (!s.prevBest || s.acc > s.prevBest.acc ||
      (s.acc === s.prevBest.acc && s.bpm > s.prevBest.bpm))){
    try { sessionStorage.setItem(srBestKey(pat.id), JSON.stringify({ acc: s.acc, bpm: s.bpm })); } catch(e){}
  }
  /* Cross-session best → the student's progress doc. Skipped in dev bypass
     (Firestore rejects that uid; the session best above still counts). */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    const old = (games.sr && games.sr.best) || 0;
    if (s.acc > old){
      games.sr = { best: s.acc, pattern: pat.id, bpm: s.bpm, at: new Date().toISOString().slice(0, 10) };
      saveGames();
    }
  }
  srRenderDone();
}

function srRenderDone(){
  const body = srBody();
  if (!body || !sr) return;
  const s = sr;
  const total = s.notes.length;
  const hits = s.notes.filter(n => n.result === 'ok').length;
  const misses = total - hits;
  /* More forgiving stars than Strum Hero — the detector adds its own
     noise, and a real room adds more. */
  const stars = s.acc >= 85 ? 3 : s.acc >= 65 ? 2 : s.acc >= 40 ? 1 : 0;
  const starHtml = '&#x2605;'.repeat(stars) + '&#x2606;'.repeat(3 - stars);

  let verdict, advice;
  if (stars === 3){
    verdict = t('games.radar.verdict.three', {acc: s.acc});
    advice = t('games.radar.advice.three');
  } else if (stars === 2){
    verdict = t('games.radar.verdict.two', {acc: s.acc});
    advice = t('games.radar.advice.two');
  } else if (stars === 1){
    verdict = t('games.radar.verdict.one', {acc: s.acc});
    advice = t('games.radar.advice.one');
  } else {
    verdict = t('games.radar.verdict.zero', {acc: s.acc});
    advice = t('games.radar.advice.zero');
  }

  /* Early/late bias — median signed error over the landed strums. Only
     shown with enough strums to mean something. */
  let biasLine = '';
  if (s.errs.length >= 4){
    const med = tunerMedian(s.errs);
    if (Math.abs(med) > 25){
      biasLine = `<div class="coach-tip sr-center">${med < 0
        ? t('games.radar.biasEarly', {ms: Math.round(-med)})
        : t('games.radar.biasLate', {ms: Math.round(med)})}</div>`;
    }
  }

  let bestLine = '';
  if (s.prevBest && s.acc > s.prevBest.acc){
    bestLine = `<div class="sh-newbest">&#x1F3C6; ${t('games.radar.newBest', {prevBest: s.prevBest.acc + '%'})}</div>`;
  } else if (s.prevBest){
    bestLine = `<div class="coach-tip sr-center">${t('games.common.bestTodayValue', {value: s.prevBest.acc + '%' + (s.prevBest.bpm ? ' (' + t('games.common.atBpm', {bpm: s.prevBest.bpm}) + ')' : '')})}</div>`;
  }

  const rec = stars >= 3 ? 'up' : stars >= 1 ? 'same' : 'down';
  body.innerHTML =
    `<div class="coach-report">
       <div class="sh-stars">${starHtml}</div>
       <div class="coach-overall">&#x1F4E1; ${escHtml(verdict)}</div>
       <div class="coach-strip">
         <span class="coach-chip ok">${t('games.radar.chipHit', {n: hits})}</span>
         <span class="coach-chip miss">${t('games.radar.chipMiss', {n: misses})}</span>
         ${s.extras ? `<span class="coach-chip dim">${t('games.radar.chipExtraStrums', {n: s.extras})}</span>` : ''}
       </div>
       ${biasLine}
       ${bestLine}
       <div class="coach-crit-note">${escHtml(advice)}</div>
       <div class="coach-actions">
         <button type="button" class="${rec === 'down' ? 'coach-start' : 'tp-btn'}" onclick="srAgain(-10)">&#x2B07; &minus;10 BPM</button>
         <button type="button" class="${rec === 'same' ? 'coach-start' : 'tp-btn'}" onclick="srAgain(0)">&#x21BB; ${t('games.radar.againAtBpm', {bpm: s.bpm})}</button>
         <button type="button" class="${rec === 'up' ? 'coach-start' : 'tp-btn'}" onclick="srAgain(10)">&#x2B06; +10 BPM</button>
       </div>
       <button type="button" class="tp-btn" onclick="srSetup()">${t('games.radar.changePatternButton')}</button>
     </div>`;
}

function srAgain(d){
  if (!sr) return;
  sr.bpm = Math.min(SR_BPM_MAX, Math.max(SR_BPM_MIN, sr.bpm + d));
  try { sessionStorage.setItem('srBpm', String(sr.bpm)); } catch(e){}
  sr.phase = 'setup';
  srStart();
}

/* ════════════════════════════════════════════════════════════════════
   RIFF RUNNER — the class songs as a scrolling-TAB lane game. Six lanes
   are the six strings, drawn like real TAB (thin high e on top, thick
   low E on the bottom); fret numbers slide toward a hit line and the
   student presses that string's key (1–6) — or taps its lane — as each
   one crosses. A hit PLAYS that note through the plucked-string synth,
   so playing well means hearing the riff; a miss plays nothing. Songs
   unlock in order and each song has three speed levels; both unlock at
   90% accuracy. Same audio-clock scheduling as Strum Hero: a lookahead
   scheduler keeps the click steady, taps are bridged in via an epoch
   pair. No mic.
   ════════════════════════════════════════════════════════════════════ */

const RN_TIERS = [
  { pct: 0.6, labelKey: 'games.riff.tier.slow' },
  { pct: 0.8, labelKey: 'games.riff.tier.medium' },
  { pct: 1,   labelKey: 'games.riff.tier.full' }
];

/* Riff data extracted from the site's OWN journey-page tabs (never from
   memory — tabs/seven-nation-army.html, all-along-the-watchtower.html,
   luna.html, sweet-child-o-mine.html). notes = [string, fret, beat,
   label]: string 6 = low E, beat counts from lap start. Beats follow the
   site's TEACHING rhythm, not the records': Seven Nation Army is taught
   as straight quarter notes (the journey page defers the real syncopation
   to external TAB), and Luna's beats are 6/8 DOWNBEATS felt in 2 — its
   bpm is downbeat BPM and its bars are 2 beats. "Sweet Child" substitutes
   the Layer-2 verse bass roots because the intro arpeggio is not tabbed
   anywhere on this site. Extra fields beyond {id,title,hint,bpm,notes}:
   sub (song-card line), bpb (beats per bar), loopBeats (lap length,
   including the closing rest), laps (times through per round). */
const RN_SONGS = [
  { id: 'sna', title: '"Seven Nation Army"',
    subKey: 'games.riff.song.sna.sub',
    hintKey: 'games.riff.song.sna.hint',
    bpm: 60, bpb: 4, loopBeats: 8, laps: 4,
    notes: [[6,7,0,'B'],[6,7,1,'B'],[6,10,2,'D'],[6,7,3,'B'],[6,5,4,'A'],[6,3,5,'G'],[6,2,6,'F#']] },
  { id: 'watchtower', title: '"All Along the Watchtower"',
    subKey: 'games.riff.song.watchtower.sub',
    hintKey: 'games.riff.song.watchtower.hint',
    bpm: 80, bpb: 4, loopBeats: 8, laps: 4,
    notes: [[6,5,0,'A5'],[6,3,2,'G5'],[6,1,4,'F5'],[6,3,6,'G5']] },
  { id: 'luna', title: '"Luna"',
    subKey: 'games.riff.song.luna.sub',
    hintKey: 'games.riff.song.luna.hint',
    bpm: 80, bpb: 2, loopBeats: 8, laps: 4,
    notes: [[6,1,0,'F'],[6,1,1,'F'],[5,0,2,'Am'],[5,0,3,'Am'],[6,10,4,'D'],[6,13,5,'F'],[5,10,6,'G']] },
  { id: 'sweetchild', title: '"Sweet Child O’ Mine"',
    subKey: 'games.riff.song.sweetchild.sub',
    hintKey: 'games.riff.song.sweetchild.hint',
    bpm: 60, bpb: 4, loopBeats: 16, laps: 2,
    notes: [[5,5,0,'D'],[5,3,4,'C'],[6,3,8,'G'],[5,5,12,'D']] }
];

let rn = null, rnRaf = null;

function rnStop(){
  if (rnRaf){ cancelAnimationFrame(rnRaf); rnRaf = null; }
  document.removeEventListener('keydown', rnKeydown);
  if (rn){
    if (rn.sched){ clearInterval(rn.sched); rn.sched = null; }
    rnHearStop();
    if (rn.micOn){ rn.micOn = false; coachMicOff(); }   // Wait Mode owned the mic
    (rn.timeouts || []).forEach(clearTimeout);
    rn = null;
  }
}

function rnBody(){ return document.getElementById('rn-body'); }
function rnBestKey(songId){ return 'rnBest:' + songId; }

/* Session best per song: JSON {acc, tier} — best accuracy ever, plus the
   highest speed level CLEARED at 90%+ (-1 = none yet). */
function rnBestSession(songId){
  try {
    const b = JSON.parse(sessionStorage.getItem(rnBestKey(songId)));
    if (b && b.acc > 0) return { acc: Math.round(b.acc), tier: typeof b.tier === 'number' ? b.tier : -1 };
  } catch(e){}
  return null;
}

/* Unlocks read the max of the session best and the Firestore best, so a
   signed-in student keeps unlocks across days and a dev-bypass session
   (which never loads Firestore) still progresses within the session. */
function rnBestMerged(songId){
  const sess = rnBestSession(songId);
  let fs = null;
  if (typeof games !== 'undefined' && games && games.rn && games.rn.songs){
    const g = games.rn.songs[songId];
    if (g && g.acc > 0) fs = { acc: Math.round(g.acc), tier: typeof g.tier === 'number' ? g.tier : -1 };
  }
  if (!sess) return fs;
  if (!fs) return sess;
  return { acc: Math.max(sess.acc, fs.acc), tier: Math.max(sess.tier, fs.tier) };
}

function rnSongUnlocked(i){
  if (i === 0) return true;
  const b = rnBestMerged(RN_SONGS[i - 1].id);
  return !!b && b.tier >= 2;
}

function rnTierUnlocked(songId, t){
  if (t === 0) return true;
  const b = rnBestMerged(songId);
  return !!b && b.tier >= t - 1;
}

function rnTierBpm(song, t){ return Math.round(song.bpm * RN_TIERS[t].pct); }
function rnTierName(tier){
  const keys = ['games.riff.tier.slowCleared', 'games.riff.tier.mediumCleared', 'games.riff.tier.fullCleared'];
  return keys[tier] ? t(keys[tier]) : '';
}

function rnSetup(){
  rn = { phase: 'select', songIdx: 0, tier: 0, timeouts: [], pv: null, guitar: false, micOn: false };
  try {
    const sid = sessionStorage.getItem('rnSong');
    const i = RN_SONGS.findIndex(sg => sg.id === sid);
    if (i >= 0 && rnSongUnlocked(i)) rn.songIdx = i;
    rn.guitar = sessionStorage.getItem('rnMode') === 'guitar';
  } catch(e){}
  rnRenderSelect();
}

function rnShowSelect(){
  if (!rn) return;
  rnHearStop();
  rn.phase = 'select';
  rnRenderSelect();
}

function rnRenderSelect(){
  const body = rnBody();
  if (!body || !rn) return;
  const cards = RN_SONGS.map((song, i) => {
    const unlocked = rnSongUnlocked(i);
    const b = rnBestMerged(song.id);
    let meta;
    if (!unlocked){
      meta = `<span class="rn-song-lock">&#x1F512; ${t('games.riff.clearToUnlock', {title: escHtml(RN_SONGS[i - 1].title)})}</span>`;
    } else if (b){
      meta = `<span class="rn-song-best">${t('games.riff.bestPercent', {pct: b.acc})}${b.tier >= 0 ? ' &middot; ' + t('games.riff.clearedTier', {tier: rnTierName(b.tier)}) : ''}</span>`;
    } else {
      meta = `<span class="rn-song-best dim">${t('games.riff.notPlayedYet')}</span>`;
    }
    return `<button type="button" class="rn-song${unlocked ? '' : ' locked'}" ${unlocked ? `onclick="rnPick(${i})"` : 'disabled'}>
       <span class="rn-song-title">${escHtml(song.title)}</span>
       <span class="rn-song-sub">${escHtml(t(song.subKey))}</span>
       ${meta}
     </button>`;
  }).join('');
  body.innerHTML =
    `<div class="coach-tip rn-center">${t('games.riff.tipHowToPlay')}</div>
     <div class="rn-songs">${cards}</div>`;
}

function rnPick(i){
  if (!rn || !rnSongUnlocked(i)) return;
  rnHearStop();
  rn.songIdx = i;
  const song = RN_SONGS[i];
  try { sessionStorage.setItem('rnSong', song.id); } catch(e){}
  /* Default to the fastest speed level the student has unlocked. */
  let t = 0;
  while (t < 2 && rnTierUnlocked(song.id, t + 1)) t++;
  rn.tier = t;
  rn.phase = 'ready';
  rnRenderReady();
}

function rnPickTier(t){
  if (!rn || rn.phase !== 'ready') return;
  const song = RN_SONGS[rn.songIdx];
  /* Wait Mode is a practice aid, so every speed is open — the whole point is
     to build up from slow to full tempo. The timed Keys game keeps its ladder. */
  if (!rn.guitar && !rnTierUnlocked(song.id, t)) return;
  rnHearStop();
  rn.tier = t;
  rnRenderReady();
}

function rnRenderReady(msg){
  const body = rnBody();
  if (!body || !rn) return;
  const song = RN_SONGS[rn.songIdx];
  let anyLocked = false;
  const pills = RN_TIERS.map((tr, ti) => {
    const un = rnTierUnlocked(song.id, ti);
    if (!un) anyLocked = true;
    return `<button type="button" class="ts-btn${ti === rn.tier ? ' active' : ''}${un ? '' : ' rn-locked'}" ${un ? `onclick="rnPickTier(${ti})"` : 'disabled'}>${t(tr.labelKey)} &middot; ${rnTierBpm(song, ti)} BPM</button>`;
  }).join('');
  const b = rnBestMerged(song.id);
  /* Mode toggle: "Keys / tap" is the timed groove game; "My guitar" is Wait
     Mode — the tab holds each note until you actually play it, no clock. */
  const modeToggle =
    `<div class="cc-group"><div class="cc-group-title">${t('games.riff.howToPlayTitle')}</div>
       <div class="fret-levels rn-modes">
         <button type="button" class="ts-btn${rn.guitar ? '' : ' active'}" onclick="rnSetMode(false)">&#x2328;&#xFE0F; ${t('games.riff.modeKeysTap')}</button>
         <button type="button" class="ts-btn${rn.guitar ? ' active' : ''}" onclick="rnSetMode(true)">&#x1F3B8; ${t('games.riff.modeMyGuitar')}</button>
       </div></div>`;
  const keysUi =
    `<div class="cc-group"><div class="cc-group-title">${t('games.riff.speedLevelTitle')}</div><div class="fret-levels">${pills}</div></div>
     ${anyLocked ? `<div class="coach-tip rn-center">${t('games.riff.tipUnlockNext')}</div>` : ''}
     ${b ? `<div class="coach-tip rn-center">${t('games.riff.bestPercent', {pct: b.acc})}${b.tier >= 0 ? ' &middot; ' + t('games.riff.clearedTier', {tier: rnTierName(b.tier)}) : ''}.</div>` : ''}
     <div class="coach-tip rn-center">${t('games.riff.tipKeysLegend')}</div>`;
  const guitarUi =
    `<div class="coach-tip rn-center">&#x1F3B8; ${t('games.wait.modeDescriptionHtml')}</div>`;
  body.innerHTML =
    (msg ? `<div class="coach-note">${escHtml(msg)}</div>` : '') +
    `<div class="rn-ready-title">${escHtml(song.title)}</div>
     <div class="coach-tip rn-center">${escHtml(t(song.hintKey))}</div>
     ${modeToggle}
     ${rn.guitar ? guitarUi : keysUi}
     <div class="coach-actions">
       <button type="button" class="tp-btn" id="rn-hear" onclick="rnHear()">&#x1F50A; ${t('games.riff.hearItButton')}</button>
       <button type="button" class="tp-btn" onclick="rnShowSelect()">&#x2190; ${t('games.riff.allSongsButton')}</button>
     </div>
     <button type="button" class="coach-start" onclick="rnStart()">${rn.guitar ? '&#x1F3B8; ' + t('games.riff.startPlayItButton') : '&#x25B6; ' + t('games.common.start')}</button>`;
}

/* Toggle timed-keys vs. guitar Wait Mode from the ready screen. */
function rnSetMode(guitar){
  if (!rn || rn.phase !== 'ready') return;
  rnHearStop();
  rn.guitar = !!guitar;
  try { sessionStorage.setItem('rnMode', rn.guitar ? 'guitar' : 'keys'); } catch(e){}
  rnRenderReady();
}

/* playNote's Karplus-Strong pluck, parameterized with a future audio-clock
   start time so "Hear it" can schedule the whole riff ahead. Returns the
   source so an early Stop can silence notes that haven't sounded yet. */
function rnPluckAt(midi, t){
  const ctx = getAudioCtx();
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
  src.connect(g); g.connect(ctx.destination);
  src.start(t);
  return src;
}

/* "Hear it" — the teaching moment: play one lap of the riff through the
   synth at the chosen speed, scheduled on the audio clock. Free and
   repeatable; the button toggles. */
async function rnHear(){
  const s = rn;
  if (!s || s.phase !== 'ready') return;
  if (s.pv){ rnHearStop(); return; }
  if (typeof getAudioCtx !== 'function') return;
  stopAllDemoAudio();
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended'){
    try { await ctx.resume(); } catch(e){}
  }
  if (rn !== s || s.phase !== 'ready' || s.pv) return;   // switched during the resume
  if (!rnBody()){ rnStop(); return; }
  const song = RN_SONGS[s.songIdx];
  const spb = 60 / rnTierBpm(song, s.tier);
  s.pv = { ctx, spb, notes: song.notes, idx: 0, srcs: [],
           startAt: ctx.currentTime + 0.15, sched: setInterval(rnPvSchedule, 25) };
  rnPvSchedule();
  const btn = document.getElementById('rn-hear');
  if (btn) btn.innerHTML = '&#x25A0; ' + t('games.common.stop');
  /* The auto-stop belongs to THIS preview — guard on its identity and let
     rnHearStop clear it, or a timer from an earlier, manually-stopped
     preview would silence a later one mid-riff. */
  const pv = s.pv;
  pv.autoStop = setTimeout(() => { if (rn === s && s.pv === pv) rnHearStop(); },
    (0.15 + song.loopBeats * spb + 1.6) * 1000);
  s.timeouts.push(pv.autoStop);
}

function rnPvSchedule(){
  const s = rn;
  if (!s || !s.pv) return;
  const pv = s.pv;
  const horizon = pv.ctx.currentTime + 0.12;
  while (pv.idx < pv.notes.length){
    const nt = pv.notes[pv.idx];
    const t = pv.startAt + nt[2] * pv.spb;
    if (t >= horizon) break;
    pv.srcs.push(rnPluckAt(STRING_OPEN_MIDI[nt[0]] + nt[1], t));
    pv.idx++;
  }
  if (pv.idx >= pv.notes.length && pv.sched){ clearInterval(pv.sched); pv.sched = null; }
}

function rnHearStop(){
  const s = rn;
  if (!s || !s.pv) return;
  if (s.pv.autoStop) clearTimeout(s.pv.autoStop);
  if (s.pv.sched) clearInterval(s.pv.sched);
  s.pv.srcs.forEach(src => { try { src.stop(); } catch(e){} });
  s.pv = null;
  const btn = document.getElementById('rn-hear');
  if (btn) btn.innerHTML = '&#x1F50A; ' + t('games.riff.hearItButton');
}

/* One metronome click at an exact audio-clock time — Strum Hero's voice
   (660 normal / 990 accent), but softer during play so the plucked riff
   notes stay on top of the pulse. */
function rnClickAt(t, accent, loud){
  const ctx = rn.ctx;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.frequency.value = accent ? 990 : 660;
  g.gain.setValueAtTime(loud ? 0.25 : 0.12, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  o.start(t); o.stop(t + 0.05);
}

/* Combo streak at which the click fades out for the rest of the round — the
   student's timing has clearly locked onto the tempo on its own, so the
   crutch backs off. Reuses the exact threshold the score multiplier already
   steps up at (see rnPress/rnHudRefresh's "×2 at 8 in a row"), rather than
   inventing a fresh number — the HUD already taught the student what "8 in
   a row" means. No mic is involved in this game (keys/taps only), so an
   audible click can safely keep running right up to that point with zero
   risk of being picked up as a false "note" the way it would in a
   mic-graded drill (see coachLoop/srLoop/nrLoop, which deliberately never
   play a click during graded listening for exactly that reason). */
const RN_METRONOME_FADE_COMBO = 8;

/* Lookahead scheduler (the "two clocks" pattern, same as Strum Hero):
   every ~25ms, post any click due in the next ~120ms at its exact
   audio-clock time. 4 count-in clicks (beat 4 high, like coachCountIn),
   then a quiet pulse with beat 1 of each bar accented — until the student's
   combo crosses RN_METRONOME_FADE_COMBO, after which play-phase clicks go
   silent (the count-in always stays audible; s.nextClick bookkeeping still
   advances either way so the schedule itself doesn't drift). */
function rnSchedule(){
  const s = rn;
  if (!s || (s.phase !== 'countin' && s.phase !== 'play')) return;
  const horizon = s.ctx.currentTime + 0.12;
  while (s.nextClick < 4 + s.totalBeats){
    const t = s.startAt + s.nextClick * s.spb;
    if (t >= horizon) break;
    const countin = s.nextClick < 4;
    if (countin || !s.clickMuted){
      rnClickAt(t, countin ? s.nextClick === 3 : (s.nextClick - 4) % s.bpb === 0, countin);
    }
    s.nextClick++;
  }
}

async function rnStart(){
  if (!rn || rn.phase === 'countin' || rn.phase === 'play' || rn.phase === 'wait') return;
  if (rn.guitar) return rnwStart();   // Wait Mode: untimed, mic-graded
  if (typeof getAudioCtx !== 'function'){ rnRenderReady(t('games.riff.noSoundMsg')); return; }
  coachClose(); coachEvictTuner();   // one mic/audio owner at a time
  rnHearStop();
  const s = rn;
  s.phase = 'countin';
  stopAllDemoAudio();
  const ctx = getAudioCtx();
  /* We schedule on the audio clock, so a suspended (autoplay-blocked)
     clock must actually be running before we capture the epoch — hence
     the await, with the usual stale guard. */
  if (ctx.state === 'suspended'){
    try { await ctx.resume(); } catch(e){}
  }
  if (rn !== s || s.phase !== 'countin') return;   // panel switched during the resume
  if (!rnBody()){ rnStop(); return; }

  const song = RN_SONGS[s.songIdx];
  s.ctx = ctx;
  s.bpm = rnTierBpm(song, s.tier);
  s.spb = 60 / s.bpm;                              // seconds per beat (Luna: per downbeat)
  s.bpb = song.bpb;
  s.totalBeats = song.loopBeats * song.laps;
  s.totalBars = s.totalBeats / s.bpb;
  /* Clock bridge: DOM presses arrive in performance.now() ms; clicks live
     on ctx.currentTime seconds. One epoch pair converts between them. */
  s.epoch = performance.now() - ctx.currentTime * 1000;
  s.startAt = ctx.currentTime + 0.25;              // count-in beat 1
  s.t0 = s.startAt + 4 * s.spb;                    // lap 1, beat 1
  s.notes = [];
  for (let lap = 0; lap < song.laps; lap++){
    song.notes.forEach(nt => s.notes.push({
      string: nt[0], fret: nt[1], label: nt[3] || '',
      t: s.t0 + (lap * song.loopBeats + nt[2]) * s.spb, result: null
    }));
  }
  /* Hit windows: Perfect ±70ms, Good ±140ms — capped at 45% of the
     smallest gap between consecutive notes at this tempo, so neighbouring
     windows can't overlap. */
  let minGap = Infinity;
  for (let i = 1; i < s.notes.length; i++) minGap = Math.min(minGap, s.notes[i].t - s.notes[i - 1].t);
  s.good = Math.min(0.140, 0.45 * minGap);
  s.perfect = Math.min(0.070, s.good);
  s.score = 0; s.combo = 0; s.maxCombo = 0; s.extras = 0;
  s.errs = [];                                     // signed press errors (s), for the early/late line
  s.sweepIdx = 0; s.lastBeat = -1; s.nextClick = 0;
  s.clickMuted = false; s.tightCombo = 0;           // fresh round: click starts on every time
  rnRenderPlay();
  s.els = s.notes.map((_, i) => document.getElementById('rn-n-' + i));
  s.laneEls = {};
  for (let k = 1; k <= 6; k++) s.laneEls[k] = document.getElementById('rn-lane-' + k);
  document.addEventListener('keydown', rnKeydown);   // keys 1–6 = strings 1–6
  if (s.sched) clearInterval(s.sched);
  s.sched = setInterval(rnSchedule, 25);
  rnSchedule();
  if (rnRaf) cancelAnimationFrame(rnRaf);
  rnLoop();
}

function rnRenderPlay(){
  const body = rnBody();
  if (!body || !rn) return;
  const s = rn;
  const names = { 1: 'e', 2: 'B', 3: 'G', 4: 'D', 5: 'A', 6: 'E' };
  const lanes = [];
  for (let str = 1; str <= 6; str++){
    const toks = s.notes.map((n, i) => n.string !== str ? '' :
      `<span class="rn-token" id="rn-n-${i}">${n.label ? `<span class="rn-token-label">${escHtml(n.label)}</span>` : ''}<span class="rn-token-fret">${n.fret}</span></span>`
    ).join('');
    lanes.push(`<div class="rn-lane" id="rn-lane-${str}" onpointerdown="rnLaneTap(${str}, event)"><span class="rn-lane-name">${str} ${names[str]}</span>${toks}</div>`);
  }
  body.innerHTML =
    `<div class="sh-hud">
       <span class="sh-score" id="rn-score">${t('games.common.score', {n: 0})}</span>
       <span class="sh-combo" id="rn-combo">&nbsp;</span>
       <span class="rn-metro-status" id="rn-metro-status">${t('games.riff.metroOn')}</span>
       <span class="sh-bar" id="rn-bar">${t('games.riff.getReady')}</span>
     </div>
     <div class="cc-beats" id="rn-beats">${'<span class="cc-pip"></span>'.repeat(s.bpb)}</div>
     <div class="rn-track" id="rn-track">${lanes.join('')}<div class="rn-hitline"></div><div class="rn-count" id="rn-count">&nbsp;</div></div>
     <div class="coach-tip rn-center">${t('games.riff.tipPressString')}</div>
     <button type="button" class="tp-btn coach-stop" onclick="rnFinish()">&#x25A0; ${t('games.common.stop')}</button>`;
}
/* Reflects s.clickMuted into the HUD (fires once, right when the fade
   happens — no need to poll it every frame). */
function rnMetroStatusRefresh(){
  const el = document.getElementById('rn-metro-status');
  if (!el || !rn) return;
  el.textContent = t(rn.clickMuted ? 'games.riff.metroOff' : 'games.riff.metroOn');
  el.classList.toggle('rn-metro-off', !!rn.clickMuted);
}

function rnKeydown(e){
  if (e.key.length !== 1 || e.key < '1' || e.key > '6') return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (e.repeat) return;
  rnPress(parseInt(e.key, 10), e.timeStamp);
}

function rnLaneTap(str, e){
  rnPress(str, e.timeStamp);
}

function rnHudRefresh(){
  const s = rn;
  const scoreEl = document.getElementById('rn-score');
  if (scoreEl) scoreEl.textContent = t('games.common.score', {n: s.score});
  const comboEl = document.getElementById('rn-combo');
  if (comboEl){
    const mult = Math.min(4, 1 + Math.floor(s.combo / 8));
    comboEl.innerHTML = s.combo >= 4
      ? '&#x1F525; ' + t('games.common.inARow', {n: s.combo}) + (mult > 1 ? ' &mdash; &times;' + mult : '')
      : '&nbsp;';
  }
}

/* Brief amber pulse on a lane after a wrong-string or stray press. */
function rnLaneFlash(str){
  const s = rn;
  const el = s && s.laneEls && s.laneEls[str];
  if (!el) return;
  el.classList.add('wrong');
  s.timeouts.push(setTimeout(() => {
    if (rn === s && s.laneEls[str]) s.laneEls[str].classList.remove('wrong');
  }, 180));
}

/* One press: bridge it onto the audio clock, then match it against open
   tokens. A press only ever HITS tokens on its own string — pressing a
   different string while a token is crossing kills that token (miss, no
   score) and flashes the pressed lane, so mashing all six keys can't win.
   A hit sounds the note through the synth; a miss stays silent. */
function rnPress(str, ts){
  const s = rn;
  if (!s || (s.phase !== 'countin' && s.phase !== 'play')) return;
  const t = (ts - s.epoch) / 1000;
  if (t < s.t0 - s.good) return;         // still the count-in: free
  let best = -1, bestAbs = Infinity, near = -1, nearAbs = Infinity;
  for (let i = 0; i < s.notes.length; i++){
    const n = s.notes[i];
    if (n.result) continue;
    if (n.t - t > s.good) break;         // time-sorted — the rest are too far ahead
    const a = Math.abs(n.t - t);
    if (a > s.good) continue;
    if (a < nearAbs){ nearAbs = a; near = i; }
    if (n.string === str && a < bestAbs){ bestAbs = a; best = i; }
  }
  if (best >= 0){
    const n = s.notes[best];
    if (typeof playNote === 'function') playNote(STRING_OPEN_MIDI[n.string] + n.fret);   // the reward: the riff itself
    s.errs.push(t - n.t);
    s.combo++;
    if (s.combo > s.maxCombo) s.maxCombo = s.combo;
    const mult = Math.min(4, 1 + Math.floor(s.combo / 8));   // ×2 at 8 in a row, cap ×4
    if (bestAbs <= s.perfect){
      n.result = 'perfect';
      s.score += 100 * mult;
      if (s.els[best]) s.els[best].classList.add('hit-perfect');
      /* Metronome fade: only PERFECT presses (the tight window) build the
         streak — a "good" is still a hit, but not tight enough timing to
         start trusting the student without the click. */
      s.tightCombo++;
      if (!s.clickMuted && s.tightCombo >= RN_METRONOME_FADE_COMBO){
        s.clickMuted = true;
        rnMetroStatusRefresh();
      }
    } else {
      n.result = 'good';
      s.score += 50 * mult;
      if (s.els[best]) s.els[best].classList.add('hit-good');
      s.tightCombo = 0;
    }
  } else if (near >= 0){
    const n = s.notes[near];             // wrong string while a token was in its window
    n.result = 'miss';
    s.combo = 0; s.tightCombo = 0;
    if (s.els[near]) s.els[near].classList.add('miss');
    rnLaneFlash(str);
  } else if (t >= s.t0){
    s.extras++;                          // stray press, nothing near: small penalty
    s.combo = 0; s.tightCombo = 0;
    s.score = Math.max(0, s.score - 10);
    rnLaneFlash(str);
  }
  rnHudRefresh();
}

function rnLoop(){
  if (!rn) return;
  if (!rnBody()){ rnStop(); return; }   // panel swapped under us
  const s = rn;
  const now = s.ctx.currentTime;

  if (s.phase === 'countin'){
    const el = document.getElementById('rn-count');
    if (now >= s.t0){
      s.phase = 'play';
      if (el) el.innerHTML = '&nbsp;';
    } else if (now >= s.startAt && el){
      el.textContent = String(Math.min(4, Math.floor((now - s.startAt) / s.spb) + 1));
    }
  }

  /* Token positions are a pure function of the audio clock — JS transforms,
     not CSS animations (reduced-motion zeroes those). Wide tracks show 2
     bars of lookahead right of the hit line, narrow ones 1 bar. */
  const track = document.getElementById('rn-track');
  if (track){
    const w = track.clientWidth;
    const hitX = w * 0.22;
    const lookBeats = (w < 480 ? 1 : 2) * s.bpb;
    const pxPerSec = (w - hitX) / (lookBeats * s.spb);
    for (let i = 0; i < s.notes.length; i++){
      const el = s.els[i];
      if (!el) continue;
      const x = hitX + (s.notes[i].t - now) * pxPerSec;
      if (x < -40 || x > w + 40){
        el.style.visibility = 'hidden';
      } else {
        el.style.visibility = 'visible';
        el.style.transform = 'translateX(' + x + 'px)';
      }
    }
  }

  if (s.phase === 'play'){
    /* Tokens past their window (+150ms grace) become misses — silently:
       no sound for a missed note IS the feedback. */
    while (s.sweepIdx < s.notes.length && s.notes[s.sweepIdx].result) s.sweepIdx++;
    for (let i = s.sweepIdx; i < s.notes.length; i++){
      const n = s.notes[i];
      if (n.t + s.good + 0.15 > now) break;
      if (!n.result){
        n.result = 'miss';
        s.combo = 0; s.tightCombo = 0;
        if (s.els[i]) s.els[i].classList.add('miss');
        rnHudRefresh();
      }
    }

    const beat = Math.floor((now - s.t0) / s.spb);
    if (beat !== s.lastBeat && beat >= 0){
      s.lastBeat = beat;
      const bar = Math.floor(beat / s.bpb);
      const barEl = document.getElementById('rn-bar');
      if (barEl && bar < s.totalBars) barEl.textContent = t('games.riff.barOfTotal', {bar: bar + 1, total: s.totalBars});
      document.querySelectorAll('#rn-beats .cc-pip').forEach((el, i) => el.classList.toggle('on', i === beat % s.bpb));
    }

    if (now > s.t0 + s.totalBeats * s.spb + 0.4){ rnFinish(); return; }
  }
  rnRaf = requestAnimationFrame(rnLoop);
}

function rnFinish(){
  if (!rn || (rn.phase !== 'play' && rn.phase !== 'countin')) return;
  const s = rn;
  if (s.sched){ clearInterval(s.sched); s.sched = null; }
  if (rnRaf){ cancelAnimationFrame(rnRaf); rnRaf = null; }
  document.removeEventListener('keydown', rnKeydown);
  (s.timeouts || []).forEach(clearTimeout);
  s.timeouts = [];
  s.notes.forEach(n => { if (!n.result) n.result = 'miss'; });   // early Stop: the rest never got pressed
  s.phase = 'done';
  const song = RN_SONGS[s.songIdx];
  const total = s.notes.length;
  const nPerfect = s.notes.filter(n => n.result === 'perfect').length;
  const nGood = s.notes.filter(n => n.result === 'good').length;
  s.acc = total ? Math.round(100 * (nPerfect + 0.5 * nGood) / total) : 0;
  const cleared = s.acc >= 90 ? s.tier : -1;
  const prev = rnBestMerged(song.id) || { acc: 0, tier: -1 };
  s.prevSess = rnBestSession(song.id);
  s.newTier = cleared >= 0 && cleared > prev.tier && s.tier < 2;
  s.newSong = cleared === 2 && prev.tier < 2 && s.songIdx < RN_SONGS.length - 1;
  if (s.acc > (s.prevSess ? s.prevSess.acc : 0) || cleared > (s.prevSess ? s.prevSess.tier : -1)){
    const old = s.prevSess || { acc: 0, tier: -1 };
    try {
      sessionStorage.setItem(rnBestKey(song.id),
        JSON.stringify({ acc: Math.max(old.acc, s.acc), tier: Math.max(old.tier, cleared) }));
    } catch(e){}
  }
  /* Cross-session best + unlocks → the student's progress doc. Skipped in
     dev bypass (Firestore rejects that uid; the session best still counts). */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    const g = (games.rn && games.rn.songs && games.rn.songs[song.id]) || { acc: 0, tier: -1 };
    if (s.acc > g.acc || cleared > g.tier){
      if (!games.rn) games.rn = { songs: {} };
      if (!games.rn.songs) games.rn.songs = {};
      games.rn.songs[song.id] = { acc: Math.max(g.acc, s.acc), tier: Math.max(g.tier, cleared) };
      games.rn.at = new Date().toISOString().slice(0, 10);
      saveGames();
    }
  }
  rnRenderDone();
}

function rnRenderDone(){
  const body = rnBody();
  if (!body || !rn) return;
  const s = rn;
  const song = RN_SONGS[s.songIdx];
  const total = s.notes.length;
  const nPerfect = s.notes.filter(n => n.result === 'perfect').length;
  const nGood = s.notes.filter(n => n.result === 'good').length;
  const nMiss = total - nPerfect - nGood;
  const stars = s.acc >= 90 ? 3 : s.acc >= 70 ? 2 : s.acc >= 50 ? 1 : 0;
  const starHtml = '&#x2605;'.repeat(stars) + '&#x2606;'.repeat(3 - stars);

  let verdict, advice;
  if (stars === 3){
    verdict = t('games.riff.verdict.three', {acc: s.acc});
    advice = s.tier < 2 ? t('games.riff.advice.threeMore') : t('games.riff.advice.threeMax');
  } else if (stars === 2){
    verdict = t('games.riff.verdict.two', {acc: s.acc});
    advice = t('games.riff.advice.two');
  } else if (stars === 1){
    verdict = t('games.riff.verdict.one', {acc: s.acc});
    advice = t('games.riff.advice.one');
  } else {
    verdict = t('games.riff.verdict.zero', {acc: s.acc});
    advice = s.tier > 0
      ? t('games.riff.advice.zeroSlower')
      : t('games.riff.advice.zeroHearIt');
  }

  /* Early/late bias — median signed error over the graded presses. Only
     shown with enough presses to mean something. */
  let biasLine = '';
  if (s.errs.length >= 4){
    const med = tunerMedian(s.errs) * 1000;
    if (Math.abs(med) > 25){
      biasLine = `<div class="coach-tip rn-center">${med < 0
        ? t('games.riff.biasEarly', {ms: Math.round(-med)})
        : t('games.riff.biasLate', {ms: Math.round(med)})}</div>`;
    }
  }

  let bestLine = '';
  const pb = s.prevSess ? s.prevSess.acc : 0;
  if (pb > 0 && s.acc > pb){
    bestLine = `<div class="sh-newbest">&#x1F3C6; ${t('games.riff.newBest', {prevBest: pb + '%'})}</div>`;
  } else if (pb > 0){
    bestLine = `<div class="coach-tip rn-center">${t('games.common.bestTodayValue', {value: pb + '%'})}</div>`;
  }

  let unlockHtml = '';
  if (s.newSong){
    unlockHtml = `<div class="rn-unlock" id="rn-unlock">&#x1F513; ${t('games.riff.newSongUnlocked', {title: escHtml(RN_SONGS[s.songIdx + 1].title)})}</div>`;
  } else if (s.newTier){
    unlockHtml = `<div class="rn-unlock" id="rn-unlock">&#x1F513; ${t('games.riff.newTierUnlocked', {tier: escHtml(t(RN_TIERS[s.tier + 1].labelKey)), bpm: rnTierBpm(song, s.tier + 1)})}</div>`;
  }

  const canUp = s.tier < 2 && rnTierUnlocked(song.id, s.tier + 1);
  const rec = stars >= 3 ? (canUp ? 'up' : 'same') : stars >= 1 ? 'same' : (s.tier > 0 ? 'down' : 'same');
  body.innerHTML =
    `<div class="coach-report">
       <div class="sh-done-score">${s.score}</div>
       <div class="sh-stars">${starHtml}</div>
       <div class="coach-overall">&#x1F3C3; ${escHtml(verdict)}</div>
       <div class="coach-strip">
         <span class="coach-chip ok">${t('games.riff.chipPerfect', {n: nPerfect})}</span>
         <span class="coach-chip good">${t('games.riff.chipGood', {n: nGood})}</span>
         <span class="coach-chip miss">${t('games.riff.chipMiss', {n: nMiss})}</span>
         ${s.extras ? `<span class="coach-chip dim">${t('games.riff.chipExtraPresses', {n: s.extras})}</span>` : ''}
       </div>
       ${s.maxCombo >= 8 ? `<div class="coach-tip rn-center">${t('games.riff.longestStreak', {n: s.maxCombo})}</div>` : ''}
       ${biasLine}
       ${bestLine}
       ${unlockHtml}
       ${stars === 3 ? `<div class="coach-tip rn-center">&#x1F3B8; ${t('games.riff.tipPlayOnRealGuitar')}</div>` : ''}
       <div class="coach-crit-note">${escHtml(advice)}</div>
       <div class="coach-actions">
         ${s.tier > 0 ? `<button type="button" class="${rec === 'down' ? 'coach-start' : 'tp-btn'}" onclick="rnAgain(-1)">&#x2B07; ${t('games.riff.slowerButton')}</button>` : ''}
         <button type="button" class="${rec === 'same' ? 'coach-start' : 'tp-btn'}" onclick="rnAgain(0)">&#x21BB; ${t('games.common.again', { bpm: rnTierBpm(song, s.tier) })}</button>
         ${canUp ? `<button type="button" class="${rec === 'up' ? 'coach-start' : 'tp-btn'}" onclick="rnAgain(1)">&#x2B06; ${t('games.riff.fasterButton')}</button>` : ''}
       </div>
       ${s.songIdx < RN_SONGS.length - 1 && rnSongUnlocked(s.songIdx + 1) ? `<button type="button" class="tp-btn" onclick="rnPick(${s.songIdx + 1})">${t('games.riff.nextSongButton')} &#x2192;</button>` : ''}
       <button type="button" class="tp-btn" onclick="rnShowSelect()">&#x2190; ${t('games.riff.allSongsButton')}</button>
     </div>`;
  if (s.newSong || s.newTier) rrCelebrate(document.getElementById('rn-unlock'));
}

function rnAgain(d){
  if (!rn) return;
  const song = RN_SONGS[rn.songIdx];
  const t = Math.min(2, Math.max(0, rn.tier + d));
  if (rnTierUnlocked(song.id, t)) rn.tier = t;
  rn.phase = 'ready';
  rnStart();
}

/* ════════════════════════════════════════════════════════════════════
   RIFF RUNNER — WAIT MODE (guitar). Play the riff on a real guitar, one
   note at a time, at your own pace — no clock. The mic must HEAR the
   right pitch before the tab moves to the next note, so there's nothing
   to fall behind on. (Dropped the metronome/count-in this mode shipped
   with originally — real-guitar testing found it confusing: the click
   implied a fixed rhythm to match, but the tab was already waiting on
   pitch, not time, so the two signals fought each other. The timed Keys
   game is where tempo/rhythm practice lives.) Idea from PickHero's Wait
   Mode. Reuses the coach's mic pipeline + trimmed-YIN detector
   (coachDetectPitch, the same one Note Hunt grades single notes with)
   for listening. Practice aid — no score, no unlocks; the timed Keys
   game still owns scoring and progression. One pass through the riff's
   notes.
   ════════════════════════════════════════════════════════════════════ */

/* Friendly spoken name for a string, e.g. 6 → "low E", 1 → "high e". */
const RNW_STRING_SAY_KEYS = { 6: 'games.wait.string.lowE', 5: 'games.wait.string.a', 4: 'games.wait.string.d',
  3: 'games.wait.string.g', 2: 'games.wait.string.b', 1: 'games.wait.string.highE' };
function rnwWhere(n){
  const string = t(RNW_STRING_SAY_KEYS[n.string]);
  return n.fret === 0 ? t('games.wait.stringOpen', {string}) : t('games.wait.stringFret', {string, fret: n.fret});
}

async function rnwStart(){
  const song = RN_SONGS[rn.songIdx];
  const body = rnBody();
  if (!body) return;
  /* One mic owner at a time — hand the pipeline over cleanly. */
  coachClose(); ccStop(); coachEvictTuner();
  rnHearStop();
  if (rn.sched){ clearInterval(rn.sched); rn.sched = null; }
  const s = rn;
  s.phase = 'wait';
  body.innerHTML = `<div class="coach-tip rn-center">${t('games.common.startingMic')}</div>`;
  if (!coachStream && !(await coachAcquireMic())){
    if (rn === s){ s.phase = 'ready'; rnRenderReady(t('games.common.micAccessDenied')); }
    return;
  }
  if (rn !== s || !rnBody()){ coachReleaseMicIfIdle(); return; }   // panel closed during the prompt
  if (document.hidden){
    coachMicOff();
    s.phase = 'ready';
    rnRenderReady(t('games.wait.pausedBackground'));
    return;
  }
  stopAllDemoAudio();
  s.micOn = true;
  window.coachMicLive = true;
  /* One pass through the riff's notes (no laps — laps are the timed groove).
     beat = each note's beat within the pass, kept only so the tab can space
     notes visually like the riff's rhythm shape — no clock enforces it. */
  s.wait = {
    notes: song.notes.map(nt => ({ string: nt[0], fret: nt[1], label: nt[3] || '',
      midi: STRING_OPEN_MIDI[nt[0]] + nt[1], beat: nt[2], result: null })),
    cur: 0, tries: 0, firstTry: 0, readings: [],
    needSilence: false, cooldownUntil: 0, frameNo: 0, hint: '', heard: ''
  };
  rnwRender();
  if (rnRaf) cancelAnimationFrame(rnRaf);
  rnwLoop();
}

function rnwRender(){
  const body = rnBody();
  if (!body || !rn || !rn.wait) return;
  const w = rn.wait;
  const names = { 1: 'e', 2: 'B', 3: 'G', 4: 'D', 5: 'A', 6: 'E' };
  const lanes = [];
  for (let str = 1; str <= 6; str++){
    const toks = w.notes.map((n, i) => n.string !== str ? '' :
      `<span class="rn-token rnw-token" id="rnw-n-${i}">${n.label ? `<span class="rn-token-label">${escHtml(n.label)}</span>` : ''}<span class="rn-token-fret">${n.fret}</span></span>`
    ).join('');
    lanes.push(`<div class="rn-lane" id="rnw-lane-${str}"><span class="rn-lane-name">${str} ${names[str]}</span>${toks}</div>`);
  }
  const cur = w.notes[w.cur];
  body.innerHTML =
    `<div class="sh-hud">
       <span class="sh-score">${t('games.wait.noteOfTotal', {n: Math.min(w.cur + 1, w.notes.length), total: w.notes.length})}</span>
       <span class="sh-bar rnw-live" id="rnw-live"><span class="coach-live-dot"></span>${t('games.wait.playWheneverReady')}</span>
     </div>
     <div class="rn-track rnw-track" id="rnw-track">${lanes.join('')}<div class="rn-hitline"></div></div>
     <div class="rnw-target" id="rnw-target">
       <div class="rnw-target-note">${t('games.wait.playNoteHtml', {note: escHtml(cur.label || coachNoteName(cur.midi))})}</div>
       <div class="rnw-target-where">${escHtml(rnwWhere(cur))}</div>
     </div>
     <div class="rnw-feedback" id="rnw-feedback">&nbsp;</div>
     <div class="coach-actions">
       <button type="button" class="tp-btn" onclick="rnwSkip()">${t('games.wait.skipNoteButton')} &#x2192;</button>
       <button type="button" class="tp-btn coach-stop" onclick="rnwFinish()">&#x25A0; ${t('games.common.stop')}</button>
     </div>`;
  rnwPositionTokens(false);
}

/* Slide the lane so the current target sits on the purple hit line; past notes
   to its left, upcoming ones to its right. Spacing is proportional to the notes'
   BEAT gaps (no clock enforces them — it's just so the tab reads like the
   riff's rhythm shape) — a note two beats away sits twice as far as a note
   one beat away. Pure JS transform (reduced-motion just gets no CSS
   transition — see the stylesheet). */
function rnwPositionTokens(animate){
  const w = rn && rn.wait;
  const track = document.getElementById('rnw-track');
  if (!w || !track) return;
  const tw = track.clientWidth;
  const hitX = tw * 0.22;
  const pxPerBeat = Math.max(40, Math.min(92, (tw - hitX) / 5));   // ~5 beats visible ahead
  const curBeat = w.notes[w.cur] ? w.notes[w.cur].beat : 0;
  for (let i = 0; i < w.notes.length; i++){
    const el = document.getElementById('rnw-n-' + i);
    if (!el) continue;
    const x = hitX + (w.notes[i].beat - curBeat) * pxPerBeat;
    if (x < -50 || x > tw + 50){ el.style.visibility = 'hidden'; continue; }
    el.style.visibility = 'visible';
    el.classList.toggle('rnw-cur', i === w.cur && !w.notes[i].result);
    el.classList.toggle('rnw-past', i < w.cur || !!w.notes[i].result);
    el.style.transform = 'translateX(' + x + 'px)';
  }
}

function rnwLoop(){
  if (!rn || rn.phase !== 'wait') return;
  if (!coachAnalyser || !document.getElementById('rnw-track')){ rnStop(); return; }
  const w = rn.wait;
  const now = performance.now();

  const rms = coachReadFrame();
  const buf = coachFrameBuf;
  /* One pluck = one answer: after a reading, wait for the note to decay
     (or 1.8s) before listening again — same gate Note Hunt uses. */
  if (w.needSilence && (rms < COACH_PITCH_GATE * 0.7 || now > w.cooldownUntil + 1800)){
    w.needSilence = false;
  }
  if (!w.needSilence && now >= w.cooldownUntil && rms > COACH_PITCH_GATE &&
      (w.frameNo = (w.frameNo || 0) + 1) % 3 === 0){
    const f = coachDetectPitch(buf, coachCtx.sampleRate);
    if (f > 0){
      w.readings.push(69 + 12 * Math.log2(f / 440));
      if (w.readings.length > 5) w.readings.shift();
      if (w.readings.length >= 4){
        const r = w.readings;
        if (Math.max.apply(null, r) - Math.min.apply(null, r) < 0.6){
          rnwJudge(Math.round(tunerMedian(r)));
        }
      }
    }
  } else if (rms < COACH_PITCH_GATE * 0.5 && w.readings.length){
    w.readings = [];   // pluck decayed mid-reading — start fresh
  }
  rnRaf = requestAnimationFrame(rnwLoop);
}

function rnwJudge(midi){
  const w = rn.wait, n = w.notes[w.cur];
  w.readings = [];
  w.needSilence = true;
  w.cooldownUntil = performance.now() + 350;
  w.tries++;
  if (midi === n.midi){                      // correct note — advance
    n.result = w.tries === 1 ? 'first' : 'ok';
    if (w.tries === 1) w.firstTry++;
    /* No note playback: at tempo the student is already playing it, so the
       synth would clash with their own guitar. Just confirm and move on. */
    rnwFeedback('&#x2713; ' + escHtml(n.label || coachNoteName(n.midi)), 'ok');
    const el = document.getElementById('rnw-n-' + w.cur);
    if (el) el.classList.add('rnw-hit');
    rn.timeouts.push(setTimeout(rnwAdvance, 220));
    return;
  }
  const heard = coachNoteName(midi);
  const d = n.midi - midi;
  if (d % 12 === 0){
    const key = midi > n.midi ? 'games.wait.octaveHigh' : 'games.wait.octaveLow';
    rnwFeedback(t(key, {where: escHtml(rnwWhere(n))}), 'near');
  } else if (Math.abs(d) <= 9){
    const plural = Math.abs(d) > 1;
    const key = d > 0
      ? (plural ? 'games.wait.nearFretUpPlural' : 'games.wait.nearFretUpSingular')
      : (plural ? 'games.wait.nearFretDownPlural' : 'games.wait.nearFretDownSingular');
    rnwFeedback(t(key, {heard: escHtml(heard), n: Math.abs(d)}), 'near');
  } else {
    rnwFeedback(t('games.wait.nearFarOff', {heard: escHtml(heard), target: escHtml(n.label || coachNoteName(n.midi))}), 'near');
  }
}

function rnwFeedback(html, cls){
  const el = document.getElementById('rnw-feedback');
  if (el){ el.innerHTML = html; el.className = 'rnw-feedback ' + (cls || ''); }
}

function rnwAdvance(){
  if (!rn || rn.phase !== 'wait') return;
  const w = rn.wait;
  w.cur++;
  w.tries = 0;
  w.readings = [];
  if (w.cur >= w.notes.length){ rnwFinish(); return; }
  /* Update the target readout + slide the lane; don't re-render the whole
     panel so the mic loop and lane keep running smoothly. */
  const n = w.notes[w.cur];
  const tEl = document.getElementById('rnw-target');
  if (tEl) tEl.innerHTML =
    `<div class="rnw-target-note">${t('games.wait.playNoteHtml', {note: escHtml(n.label || coachNoteName(n.midi))})}</div>
     <div class="rnw-target-where">${escHtml(rnwWhere(n))}</div>`;
  const hud = document.querySelector('#rn-body .sh-score');
  if (hud) hud.textContent = t('games.wait.noteOfTotal', {n: w.cur + 1, total: w.notes.length});
  rnwFeedback('&nbsp;', '');
  rnwPositionTokens(true);
}

function rnwSkip(){
  if (!rn || rn.phase !== 'wait') return;
  const w = rn.wait, n = w.notes[w.cur];
  if (n && !n.result) n.result = 'skip';
  rnwAdvance();
}

function rnwFinish(){
  if (!rn || rn.phase !== 'wait') return;
  if (rnRaf){ cancelAnimationFrame(rnRaf); rnRaf = null; }
  const w = rn.wait;
  (rn.timeouts || []).forEach(clearTimeout);
  rn.timeouts = [];
  if (rn.micOn){ rn.micOn = false; coachMicOff(); }
  rn.phase = 'done';
  const played = w.notes.filter(n => n.result && n.result !== 'skip').length;
  const total = w.notes.length;
  const first = w.firstTry;
  let verdict, advice;
  if (played === total && first === total){
    verdict = t('games.wait.verdict.allFirstTry');
    advice = t('games.wait.advice.allFirstTry');
  } else if (played === total){
    verdict = t('games.wait.verdict.allPlayed', {first, total});
    advice = t('games.wait.advice.allPlayed');
  } else {
    verdict = t('games.wait.verdict.partial', {played, total});
    advice = t('games.wait.advice.partial');
  }
  const body = rnBody();
  if (!body) return;
  body.innerHTML =
    `<div class="coach-report">
       <div class="coach-overall">&#x1F3B8; ${escHtml(verdict)}</div>
       <div class="coach-crit-note">${escHtml(advice)}</div>
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="rnwAgain()">&#x21BB; ${t('games.wait.playAgainButton')}</button>
         <button type="button" class="tp-btn" onclick="rnGoReady()">&#x2699;&#xFE0F; ${t('games.wait.modeButton')}</button>
       </div>
       ${rn.songIdx < RN_SONGS.length - 1 && rnSongUnlocked(rn.songIdx + 1) ? `<button type="button" class="tp-btn" onclick="rnPick(${rn.songIdx + 1})">${t('games.riff.nextSongButton')} &#x2192;</button>` : ''}
       <button type="button" class="tp-btn" onclick="rnShowSelect()">&#x2190; ${t('games.riff.allSongsButton')}</button>
     </div>`;
}

function rnwAgain(){
  if (!rn) return;
  rn.phase = 'ready';
  rnwStart();
}

/* Back to the ready screen (speed + mode chooser) from a Wait-Mode result. */
function rnGoReady(){
  if (!rn) return;
  rn.phase = 'ready';
  rnRenderReady();
}

/* ════════════════════════════════════════════════════════════════════
   NOTE RUNNER — a Guitar-Hero-style note ladder for the low E and A
   strings through fret 12. Each level GENERATES a fresh exercise (never
   the same twice): fret ranges widen 0–3 → 5 → 7 → 12 while rhythms
   ramp from straight quarters through halves/wholes/rests and eighths
   to sixteenth bursts. Two TAB-style lanes (Riff Runner's track, cut
   to A over low E) scroll toward the hit line and the student plays
   each note on a REAL guitar: the Coach's onset + YIN pipeline grades
   pitch AND timing against a FIXED beat grid — this is the timed game,
   so no adaptive drift; the scrolling track itself is the beat anchor
   (Strum Radar's silent-click grid has no visual anchor, hence its
   easing — this one does, hence none).
   Speaker audio during grading would bleed into the mic (see Strum
   Radar's design note), so the count-in clicks, then goes SILENT — the
   scrolling notes and pulsing beat pips carry the tempo. No synth
   reward on hits either; the reward is the student's own guitar.
   A per-device mic-latency offset (nrMicOffset, localStorage — it's a
   property of the MACHINE, so it outlives the session) shifts every
   onset earlier before grading: classroom Chromebooks hear a pick
   ~40–120ms after it happens, which would grade honest playing as
   "late" forever. Default 70ms; the ready screen has the slider.
   ════════════════════════════════════════════════════════════════════ */

const NR_PASS = 80;   // % accuracy that clears a level and unlocks the next

/* Rhythm tiers: each pattern is one 4/4 bar as [beat, durBeats] events.
   A gap between events is space; beats listed in 'rests' additionally get
   a visible rest glyph (a written rest the student should count through
   reads differently from mid-phrase emptiness). */
const NR_RHYTHMS = {
  q:   { nameKey: 'games.nr.tier.q', patterns: [
          { ev: [[0,1],[1,1],[2,1],[3,1]] } ] },
  long:{ nameKey: 'games.nr.tier.long', patterns: [
          { ev: [[0,2],[2,1],[3,1]] },
          { ev: [[0,1],[1,1],[2,2]] },
          { ev: [[0,4]] },
          { ev: [[0,1],[2,1],[3,1]], rests: [1] },
          { ev: [[0,1],[1,1],[3,1]], rests: [2] },
          { ev: [[0,2],[2,2]] } ] },
  e8:  { nameKey: 'games.nr.tier.e8', patterns: [
          { ev: [[0,.5],[.5,.5],[1,1],[2,1],[3,1]] },
          { ev: [[0,1],[1,.5],[1.5,.5],[2,1],[3,1]] },
          { ev: [[0,1],[1,1],[2,.5],[2.5,.5],[3,1]] },
          { ev: [[0,1],[1,1],[2,1],[3,.5],[3.5,.5]] } ] },
  e8s: { nameKey: 'games.nr.tier.e8s', patterns: [
          { ev: [[0,.5],[.5,.5],[1,.5],[1.5,.5],[2,1],[3,1]] },
          { ev: [[0,.5],[.5,.5],[1,1],[2,.5],[2.5,.5],[3,1]] },
          { ev: [[0,.5],[.5,.5],[1,.5],[1.5,.5],[2,.5],[2.5,.5],[3,1]] },
          { ev: [[0,1],[1,.5],[1.5,.5],[2,1],[3,.5],[3.5,.5]] },
          { ev: [[0,.5],[.5,.5],[1,1],[3,1]], rests: [2] } ] },
  s16: { nameKey: 'games.nr.tier.s16', patterns: [
          { ev: [[0,.25],[.25,.25],[.5,.5],[1,1],[2,1],[3,1]] },
          { ev: [[0,1],[1,.25],[1.25,.25],[1.5,.5],[2,1],[3,1]] },
          { ev: [[0,.5],[.5,.5],[1,1],[2,.25],[2.25,.25],[2.5,.5],[3,1]] },
          { ev: [[0,.25],[.25,.25],[.5,.25],[.75,.25],[1,1],[2,1],[3,1]] } ] }
};

/* The ladder. strings use the site's numbering (6 = low E, 5 = A);
   tiers are drawn easy→hard across the round's bars. Tempos stay modest:
   above ~85 BPM the eighth/sixteenth gaps close on the onset detector's
   refractory window (COACH_ONSET_REFRACT). */
const NR_LEVELS = [
  { nameKey:'games.nr.lv1',  strings:[6],   maxFret:3,  tiers:['q'],             bpm:72, bars:4 },
  { nameKey:'games.nr.lv2',  strings:[5],   maxFret:3,  tiers:['q'],             bpm:72, bars:4 },
  { nameKey:'games.nr.lv3',  strings:[6,5], maxFret:3,  tiers:['q'],             bpm:76, bars:4 },
  { nameKey:'games.nr.lv4',  strings:[6,5], maxFret:3,  tiers:['long'],          bpm:76, bars:4 },
  { nameKey:'games.nr.lv5',  strings:[6,5], maxFret:5,  tiers:['q','long'],      bpm:80, bars:4 },
  { nameKey:'games.nr.lv6',  strings:[6,5], maxFret:3,  tiers:['e8'],            bpm:66, bars:4 },
  { nameKey:'games.nr.lv7',  strings:[6,5], maxFret:5,  tiers:['e8'],            bpm:72, bars:4 },
  { nameKey:'games.nr.lv8',  strings:[6,5], maxFret:7,  tiers:['q','long','e8'], bpm:80, bars:4 },
  { nameKey:'games.nr.lv9',  strings:[6,5], maxFret:7,  tiers:['e8s'],           bpm:72, bars:4 },
  { nameKey:'games.nr.lv10', strings:[6,5], maxFret:12, tiers:['q','long','e8'], bpm:84, bars:4 },
  { nameKey:'games.nr.lv11', strings:[6,5], maxFret:12, tiers:['e8s'],           bpm:76, bars:4 },
  { nameKey:'games.nr.lv12', strings:[6,5], maxFret:12, tiers:['e8s','s16'],     bpm:63, bars:4 },
  /* Power-chord branch: chords:true switches the generator to power-chord
     shapes rooted on the E and A strings (maxFret bounds the ROOT) and the
     grader to the Coach's chord-tone vote — single-pitch consensus is the
     wrong test for a strum (see coachFinalizeEvent's note). chordHold =
     beats before the chord may change, so lines chug like real power-chord
     riffs instead of shape-hopping every strum. `after` reroutes the
     unlock: clearing level 5 (index 4, both strings to fret 5) opens this
     branch — power chords shouldn't have to wait behind sixteenth notes.
     Within the branch, levels chain normally. */
  { nameKey:'games.nr.lv13', strings:[6,5], maxFret:3, tiers:['q','long'], bpm:66, bars:4, chords:true, chordHold:4, after:4 },
  { nameKey:'games.nr.lv14', strings:[6,5], maxFret:7, tiers:['q','long'], bpm:72, bars:4, chords:true, chordHold:2 },
  { nameKey:'games.nr.lv15', strings:[6,5], maxFret:5, tiers:['e8s'],      bpm:66, bars:4, chords:true, chordHold:4 }
];

/* ── Adaptive mode — the game's front door is ONE Play button ──
   The stage order walks the melody ladder with the power-chord branch
   interleaved right after its level-5 prerequisite, so chords start
   showing up mid-journey instead of after sixteenth notes. Results move
   the student along it: ≥90% steps up a stage, <65% steps back one
   (unless the round smells like a MIC problem — an unclear-heavy round
   means the machine couldn't hear, not that the student can't play),
   anything between stays put. The full level picker survives behind a
   "practice a specific skill" door for targeted work (and for pointing
   the whole class at one thing).
   Weak spots: every missed or wrong-note position bumps a small score in
   a per-student map ('string:fret', 'c:'-prefixed for chords); the
   generator re-deals live weak spots ~⅓ of the time, and clean hits pay
   the score back down until the entry retires. Map + stage persist in
   games.nr for signed-in students. */
const NR_ADAPT_ORDER = [0, 1, 2, 3, 4, 12, 5, 6, 13, 7, 8, 14, 9, 10, 11];
const NR_UP_PCT = 90, NR_DOWN_PCT = 65;

let nr = null, nrRaf = null;
let nrOffsetMs = null;   // lazy-read from localStorage on first use
let nrWeakMap = null;    // hydrated once per page from games.nr.weak

function nrWeak(){
  if (!nrWeakMap){
    nrWeakMap = {};
    if (typeof games !== 'undefined' && games && games.nr && games.nr.weak){
      for (const k in games.nr.weak){
        const v = games.nr.weak[k] | 0;
        if (v > 0) nrWeakMap[k] = Math.min(6, v);
      }
    }
  }
  return nrWeakMap;
}
function nrWeakKey(n){ return (n.chord ? 'c:' : '') + n.string + ':' + n.fret; }

function nrStagePos(){
  let p = -1;
  try { p = parseInt(sessionStorage.getItem('nrStagePos'), 10); } catch(e){}
  if (!(p >= 0) && typeof games !== 'undefined' && games && games.nr &&
      typeof games.nr.stage === 'number'){
    p = games.nr.stage;
  }
  return Math.max(0, Math.min(NR_ADAPT_ORDER.length - 1, p >= 0 ? p : 0));
}
function nrSetStagePos(p){
  try { sessionStorage.setItem('nrStagePos', String(p)); } catch(e){}
}

function nrBody(){ return document.getElementById('nr-body'); }
function nrBestKey(i){ return 'nrBest:' + i; }

function nrOffset(){
  if (nrOffsetMs === null){
    let v = NaN;
    try { v = parseInt(localStorage.getItem('nrMicOffset'), 10); } catch(e){}
    nrOffsetMs = (v >= 0 && v <= 250) ? v : 70;
  }
  return nrOffsetMs;
}
function nrSetOffset(v){
  nrOffsetMs = Math.max(0, Math.min(250, parseInt(v, 10) || 0));
  try { localStorage.setItem('nrMicOffset', String(nrOffsetMs)); } catch(e){}
  const el = document.getElementById('nr-off-lbl');
  if (el) el.textContent = nrOffsetMs + ' ms';
}

/* Session best per level (accuracy %), merged with the Firestore best the
   same way Riff Runner merges — so unlocks survive across days for a
   signed-in student and still progress within a dev-bypass session. */
function nrBestSession(i){
  let v = 0;
  try { v = parseInt(sessionStorage.getItem(nrBestKey(i)), 10) || 0; } catch(e){}
  return v;
}
function nrBestMerged(i){
  let fs = 0;
  if (typeof games !== 'undefined' && games && games.nr && games.nr.levels){
    fs = games.nr.levels[i] || 0;
  }
  return Math.max(nrBestSession(i), fs);
}
/* Which level must be cleared before level i opens (see `after` above). */
function nrReq(i){
  const a = NR_LEVELS[i].after;
  return a !== undefined ? a : i - 1;
}
function nrUnlocked(i){ return i === 0 || nrBestMerged(nrReq(i)) >= NR_PASS; }

function nrStop(){
  if (nrRaf){ cancelAnimationFrame(nrRaf); nrRaf = null; }
  if (nr){
    nrHearStop();
    (nr.timeouts || []).forEach(clearTimeout);
    if (nr.micOn){ nr.micOn = false; coachMicOff(); }
    nr = null;
  }
}

function nrSetup(){
  nr = { phase: 'home', level: 0, timeouts: [], pv: null, micOn: false };
  nrRenderHome();
}

/* ── Home: one big Play button + where you are on the journey ── */
function nrRenderHome(){
  const body = nrBody();
  if (!body || !nr) return;
  nrHearStop();
  nr.phase = 'home';
  const pos = nrStagePos();
  const lv = NR_LEVELS[NR_ADAPT_ORDER[pos]];
  body.innerHTML =
    `<div class="coach-tip rn-center">${t('games.nr.homeIntro')}</div>
     <div class="nr-stage rn-center"><strong>${t('games.nr.homeStage', {n: pos + 1, total: NR_ADAPT_ORDER.length})}</strong> &mdash; ${t(lv.nameKey)}<br>
       <span class="rn-song-sub">${nrLevelMeta(lv)}</span></div>
     <div class="rn-center"><button type="button" class="coach-start nr-play" onclick="nrPlayAdaptive()">&#x1F3B8; ${t('games.nr.playButton')}</button></div>
     <div class="nr-slider"><label for="nr-off">${t('games.nr.offsetLabel')}</label>
       <input type="range" id="nr-off" min="0" max="250" step="10" value="${nrOffset()}" oninput="nrSetOffset(this.value)">
       <span id="nr-off-lbl">${nrOffset()} ms</span></div>
     <div class="coach-tip rn-center">${t('games.nr.offsetTip')}</div>
     <div class="rn-center"><button type="button" class="tp-btn" onclick="nrShowSelect()">&#x1F3AF; ${t('games.nr.practiceDoor')}</button></div>`;
}

function nrPlayAdaptive(){
  if (!nr || (nr.phase !== 'home' && nr.phase !== 'done')) return;
  nr.adaptive = true;
  nr.stagePos = nrStagePos();
  nr.level = NR_ADAPT_ORDER[nr.stagePos];
  nr.phase = 'ready';
  nrStart();
}

/* ── Level select ── */

function nrLevelMeta(lv){
  const topTier = NR_RHYTHMS[lv.tiers[lv.tiers.length - 1]];
  if (lv.chords)
    return `${t('games.nr.meta.pcRoots', {n: lv.maxFret})} &middot; ${t(topTier.nameKey)} &middot; ${lv.bpm} BPM`;
  const strings = lv.strings.length === 2 ? t('games.nr.meta.stringsBoth')
    : lv.strings[0] === 6 ? t('games.nr.meta.stringsE') : t('games.nr.meta.stringsA');
  return `${strings} &middot; ${t('games.nr.meta.frets', {n: lv.maxFret})} &middot; ${t(topTier.nameKey)} &middot; ${lv.bpm} BPM`;
}

function nrRenderSelect(){
  const body = nrBody();
  if (!body || !nr) return;
  const cards = NR_LEVELS.map((lv, i) => {
    const un = nrUnlocked(i);
    const b = nrBestMerged(i);
    let meta;
    if (!un){
      meta = `<span class="rn-song-lock">&#x1F512; ${t('games.nr.clearToUnlock', {pct: NR_PASS, n: nrReq(i) + 1})}</span>`;
    } else if (b > 0){
      meta = `<span class="rn-song-best">${t('games.nr.bestPercent', {pct: b})}${b >= NR_PASS ? ' &middot; ' + t('games.nr.clearedFlag') : ''}</span>`;
    } else {
      meta = `<span class="rn-song-best dim">${t('games.nr.notPlayedYet')}</span>`;
    }
    return `<button type="button" class="rn-song${un ? '' : ' locked'}" ${un ? `onclick="nrPick(${i})"` : 'disabled'}>
       <span class="rn-song-title">${t('games.nr.levelChip', {n: i + 1})} — ${t(lv.nameKey)}</span>
       <span class="rn-song-sub">${nrLevelMeta(lv)}</span>
       ${meta}</button>`;
  }).join('');
  body.innerHTML =
    `<div class="coach-tip rn-center">${t('games.nr.tipHowToPlay')}</div>
     <div class="rn-songs">${cards}</div>
     <div class="rn-center"><button type="button" class="tp-btn" onclick="nrRenderHome()">&#x2190; ${t('games.nr.homeButton')}</button></div>`;
}

function nrShowSelect(){
  if (!nr) return;
  nrHearStop();
  nr.phase = 'select';
  nrRenderSelect();
}

function nrPick(i){
  if (!nr || !nrUnlocked(i)) return;
  nrHearStop();
  nr.adaptive = false;   // the practice door: the student chose this level
  nr.level = i;
  nr.phase = 'ready';
  nrRenderReady();
}

function nrRenderReady(msg){
  const body = nrBody();
  if (!body || !nr) return;
  const lv = NR_LEVELS[nr.level];
  const tiers = lv.tiers.map(k => t(NR_RHYTHMS[k].nameKey)).join(' + ');
  const b = nrBestMerged(nr.level);
  body.innerHTML =
    `${msg ? `<div class="coach-tip rn-center">${msg}</div>` : ''}
     <div class="coach-tip rn-center"><strong>${t('games.nr.levelChip', {n: nr.level + 1})} — ${t(NR_LEVELS[nr.level].nameKey)}</strong><br>
       ${nrLevelMeta(lv)} &middot; ${t('games.nr.readyBars', {bars: lv.bars})}<br>
       ${t('games.nr.readyRhythms', {list: tiers, pct: NR_PASS})}</div>
     ${b > 0 ? `<div class="coach-tip rn-center">${t('games.nr.bestPercent', {pct: b})}</div>` : ''}
     <div class="rn-center">
       <button type="button" class="tp-btn" id="nr-hear" onclick="nrHear()">&#x1F50A; ${t('games.nr.hearButton')}</button>
       <button type="button" class="tp-btn" onclick="nrShowSelect()">&#x2190; ${t('games.nr.allLevelsButton')}</button>
     </div>
     <div class="rn-center"><button type="button" class="coach-start" onclick="nrStart()">&#x1F3B8; ${t('games.nr.startButton')}</button></div>
     <div class="nr-slider"><label for="nr-off">${t('games.nr.offsetLabel')}</label>
       <input type="range" id="nr-off" min="0" max="250" step="10" value="${nrOffset()}" oninput="nrSetOffset(this.value)">
       <span id="nr-off-lbl">${nrOffset()} ms</span></div>
     <div class="coach-tip rn-center">${t('games.nr.offsetTip')}</div>
     <div class="coach-tip rn-center">${t('games.nr.clickNote')}</div>`;
}

/* ── "Hear an example" — one generated round through the pluck synth,
   scheduled on the audio clock (rnPluckAt is Riff Runner's). ── */

function nrHear(){
  const s = nr;
  if (!s || s.phase !== 'ready') return;
  if (s.pv){ nrHearStop(); return; }
  if (typeof getAudioCtx !== 'function') return;
  stopAllDemoAudio();
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended'){ try { ctx.resume(); } catch(e){} }
  const lv = NR_LEVELS[s.level];
  const spb = 60 / lv.bpm;
  const notes = nrGen(lv).filter(n => !n.rest);
  const startAt = ctx.currentTime + 0.2;
  /* A chord token previews as root + fifth + octave — the power-chord sound. */
  s.pv = { srcs: notes.flatMap(n => (n.chord ? [0, 7, 12] : [0])
    .map(iv => rnPluckAt(n.midi + iv, startAt + n.beat * spb))) };
  const btn = document.getElementById('nr-hear');
  if (btn) btn.innerHTML = '&#x25A0; ' + t('games.common.stop');
  const pv = s.pv;
  pv.autoStop = setTimeout(() => { if (nr === s && s.pv === pv) nrHearStop(); },
    (0.2 + lv.bars * 4 * spb + 1.6) * 1000);
  s.timeouts.push(pv.autoStop);
}

function nrHearStop(){
  if (!nr || !nr.pv) return;
  clearTimeout(nr.pv.autoStop);
  nr.pv.srcs.forEach(src => { try { src.stop(); } catch(e){} });
  nr.pv = null;
  const btn = document.getElementById('nr-hear');
  if (btn) btn.innerHTML = '&#x1F50A; ' + t('games.nr.hearButton');
}

/* ── Exercise generator: a random walk over the level's note pool.
   Mostly small steps (±1–3 frets in pitch order), never more than two
   repeats of the same note, starting near the bottom of the pool —
   playable lines rather than fret-number lottery.
   Power-chord levels walk the same way over ROOT positions, but the
   chord only changes every chordHold beats (each strum inside a hold
   window repeats the shape — that's what a power-chord riff is), and
   every event carries chord:true + a display name (root + "5"). ── */
function nrGen(lv){
  const pool = [];
  lv.strings.forEach(str => {
    for (let f = 0; f <= lv.maxFret; f++)
      pool.push({ string: str, fret: f, midi: STRING_OPEN_MIDI[str] + f });
  });
  pool.sort((a, b) => a.midi - b.midi || b.string - a.string);

  const walk = (idx, same) => {
    let next = idx, tries = 0;
    do {
      const step = [0, 1, -1, 1, -1, 2, -2, 3, -3][Math.floor(Math.random() * 9)];
      next = Math.max(0, Math.min(pool.length - 1, idx + step));
      tries++;
    } while (tries < 6 && next === idx && same >= 2);
    return next;
  };

  /* Weak-spot re-dealing: ~¼ of picks swap in a position the student has
     been missing (see the adaptive-mode note above NR_ADAPT_ORDER) when
     one lives inside this pool. The walk resumes FROM the weak spot so
     the line stays melodic around it — which also means its neighbours
     recur, so the effective dose is higher than the swap rate; don't
     raise this without playing a round. */
  const wk = nrWeak();
  const weakSwap = (curIdx, chord) => {
    if (Math.random() >= 0.25) return curIdx;
    const cands = [];
    for (let i = 0; i < pool.length; i++){
      if (wk[(chord ? 'c:' : '') + pool[i].string + ':' + pool[i].fret] > 0) cands.push(i);
    }
    return cands.length ? cands[Math.floor(Math.random() * cands.length)] : curIdx;
  };

  /* Chord levels: one pool position per hold window, decided up front. */
  let windows = null;
  if (lv.chords){
    const nWin = Math.ceil(lv.bars * 4 / lv.chordHold);
    windows = [];
    let wIdx = Math.floor(Math.random() * Math.min(4, pool.length));
    let wSame = 0;
    for (let wn = 0; wn < nWin; wn++){
      wIdx = weakSwap(wIdx, true);
      windows.push(pool[wIdx]);
      const next = walk(wIdx, wSame);
      wSame = next === wIdx ? wSame + 1 : 0;
      wIdx = next;
    }
  }

  const notes = [];
  let idx = Math.floor(Math.random() * Math.min(4, pool.length));
  let same = 0;
  for (let b = 0; b < lv.bars; b++){
    /* easy tiers in the early bars, the harder ones later */
    const tier = NR_RHYTHMS[lv.tiers[Math.min(lv.tiers.length - 1,
      Math.floor(b * lv.tiers.length / lv.bars))]];
    const pat = tier.patterns[Math.floor(Math.random() * tier.patterns.length)];
    (pat.rests || []).forEach(beat => notes.push({ rest: true, beat: b * 4 + beat }));
    pat.ev.forEach(ev => {
      const beat = b * 4 + ev[0];
      if (lv.chords){
        const c = windows[Math.floor(beat / lv.chordHold)];
        notes.push({ string: c.string, fret: c.fret, midi: c.midi, chord: true,
                     name: coachNoteName(c.midi) + '5', beat, dur: ev[1] });
        return;
      }
      idx = weakSwap(idx, false);
      const cur = pool[idx];
      notes.push({ string: cur.string, fret: cur.fret, midi: cur.midi,
                   beat, dur: ev[1] });
      const next = walk(idx, same);
      same = next === idx ? same + 1 : 0;
      idx = next;
    });
  }
  notes.sort((a, b) => a.beat - b.beat);
  return notes;
}

/* ── The round ── */

async function nrStart(){
  if (!nr || nr.phase !== 'ready') return;
  const s = nr;
  const body = nrBody();
  if (!body) return;
  coachClose();
  coachEvictTuner();
  nrHearStop();
  body.innerHTML = `<div class="coach-tip rn-center">${t('games.common.startingMic')}</div>`;
  if (!coachStream && !(await coachAcquireMic())){
    if (nr === s){ s.phase = 'ready'; nrRenderReady(t('games.common.micAccessDenied')); }
    return;
  }
  if (nr !== s || !nrBody()){ coachReleaseMicIfIdle(); return; }
  if (document.hidden){
    coachMicOff();
    s.phase = 'ready';
    nrRenderReady(t('games.wait.pausedBackground'));
    return;
  }
  stopAllDemoAudio();
  s.micOn = true;
  window.coachMicLive = true;

  const lv = NR_LEVELS[s.level];
  s.phase = 'countin';
  s.chordMode = !!lv.chords;
  s.beatMs = 60000 / lv.bpm;
  s.totalBeats = lv.bars * 4;
  s.notes = nrGen(lv);
  s.playable = s.notes.filter(n => !n.rest);

  /* Hit windows, in ms: wider than Riff Runner's key windows (onset
     detection adds its own jitter — same reasoning as Strum Radar's),
     capped below half the smallest gap so neighbours can't both claim
     one pluck. */
  let minGap = Infinity;
  for (let i = 1; i < s.playable.length; i++)
    minGap = Math.min(minGap, (s.playable[i].beat - s.playable[i - 1].beat) * s.beatMs);
  s.goodMs = Math.min(180, 0.45 * minGap);
  s.perfectMs = Math.min(90, s.goodMs * 0.55);

  s.score = 0; s.combo = 0; s.maxCombo = 0;
  s.errs = [];
  s.sweepIdx = 0; s.lastBeat = -1;
  s.smoothRms = 0; s.smoothHf = 0; s.lastOnsetT = -1e9; s.lastPitchT = 0; s.pending = null;

  nrRenderPlay();
  s.els = s.notes.map((_, i) => document.getElementById('nr-n-' + i));
  /* coachCountIn beeps 4 clicks and sets s.listenStart = beat 1. The
     clicks stop there — see the header comment. */
  coachCountIn(s, 'nr-count', () => {
    if (nr === s && s.phase === 'countin') s.phase = 'play';
  });
  s.playable.forEach(n => { n.t = s.listenStart + n.beat * s.beatMs; n.result = null; });
  if (nrRaf) cancelAnimationFrame(nrRaf);
  nrLoop();
}

function nrRenderPlay(){
  const body = nrBody();
  if (!body || !nr) return;
  const s = nr;
  /* All six strings draw, like real TAB (thin high e on top, low E on the
     bottom — Riff Runner's layout), even though this game only writes to
     strings 5 and 6: reading two lines floating in space is a habit the
     real page never asks for. */
  const names = { 1: 'e', 2: 'B', 3: 'G', 4: 'D', 5: 'A', 6: 'E' };
  const lanes = [1, 2, 3, 4, 5, 6].map(str => {
    const toks = s.notes.map((n, i) => {
      if (n.rest || n.string !== str) return '';   // rests render once, below the lanes
      /* Chord tokens ride the ROOT string's lane: fret number in the circle
         (where the root goes), chord name above — the shape is always
         root + two-frets-up one string down, so that fully specifies it. */
      return `<span class="rn-token nr-token${n.chord ? ' nr-chord' : ''}" id="nr-n-${i}"><span class="rn-token-label">${n.chord ? n.name : coachNoteName(n.midi)}</span><span class="rn-token-fret">${n.fret}</span>${n.dur > 1 ? '<span class="nr-tail"></span>' : ''}</span>`;
    }).join('');
    return `<div class="rn-lane nr-lane"><span class="rn-lane-name">${str} ${names[str]}</span>${toks}</div>`;
  });
  /* rests live between the lanes, on the track itself */
  const rests = s.notes.map((n, i) => n.rest
    ? `<span class="rn-token nr-token nr-rest" id="nr-n-${i}"><span class="rn-token-fret">&#x1D13D;</span></span>` : '').join('');
  body.innerHTML =
    `<div class="sh-hud">
       <span class="sh-score" id="nr-score">${t('games.common.score', {n: 0})}</span>
       <span class="sh-combo" id="nr-combo">&nbsp;</span>
       <span class="sh-bar" id="nr-bar">${t('games.nr.getReady')}</span>
     </div>
     <div class="cc-beats" id="nr-beats">${'<span class="cc-pip"></span>'.repeat(4)}</div>
     <div class="rn-track nr-track" id="nr-track">${lanes.join('')}${rests}<div class="rn-hitline"></div><div class="rn-count" id="nr-count">&nbsp;</div></div>
     <div class="coach-tip rn-center">${t('games.nr.tipPlay')}</div>
     <button type="button" class="tp-btn coach-stop" onclick="nrFinish()">&#x25A0; ${t('games.common.stop')}</button>`;
}

function nrLoop(){
  const s = nr;
  if (!s || (s.phase !== 'countin' && s.phase !== 'play')) return;
  if (!nrBody() || !document.getElementById('nr-track')){ nrStop(); return; }
  const now = performance.now();

  /* count-in digits are drawn by coachCountIn's timeouts; clear on go */
  if (s.phase === 'play' && !s.countCleared){
    s.countCleared = true;
    const el = document.getElementById('nr-count');
    if (el) el.innerHTML = '&nbsp;';
  }

  /* ── mic: the Coach's dual-channel onset detector + YIN readings.
     Runs through the count-in too (trackers warm against room noise and
     beep leakage, same as coachLoop) — but grading only ever matches
     onsets that land inside a note's window, so count-in noodling and
     the count-in beeps themselves are free. ── */
  if (coachAnalyser){
    const rms = coachReadFrame();
    const hf = coachHfRms;
    if (now - s.lastOnsetT > COACH_ONSET_REFRACT &&
        ((rms > CHK_ONSET_FLOOR && rms > s.smoothRms * CHK_ONSET_RATIO) ||
         (hf > CHK_HF_FLOOR && hf > s.smoothHf * CHK_HF_RATIO))){
      s.lastOnsetT = now;
      if (s.pending) nrFinalizeEvent();
      s.pending = { t: now, readings: [] };
    }
    s.smoothRms = s.smoothRms * 0.82 + rms * 0.18;
    s.smoothHf = s.smoothHf * 0.82 + hf * 0.18;
    if (s.pending && rms > COACH_PITCH_GATE * 0.5 &&
        now - s.pending.t >= COACH_ATTACK_SKIP &&
        now - s.lastPitchT >= 40){
      s.lastPitchT = now;
      /* Chord levels loosen YIN's clarity gate the way the Coach's chord
         mode does — a strum isn't cleanly periodic, and the tone vote
         below is what keeps loose readings from becoming wrong verdicts. */
      const f = coachDetectPitch(coachFrameBuf, coachCtx.sampleRate, s.chordMode ? 0.55 : 0.22);
      if (f > 0) s.pending.readings.push(69 + 12 * Math.log2(f / 440));
    }
    if (s.pending && now - s.pending.t > COACH_EVENT_TAIL) nrFinalizeEvent();
  }

  /* ── token scroll: pure function of the clock (JS transforms, not CSS
     animations — reduced-motion zeroes those). ── */
  const track = document.getElementById('nr-track');
  if (track){
    const w = track.clientWidth;
    const hitX = w * 0.22;
    const lookBeats = w < 480 ? 4 : 8;
    const pxPerMs = (w - hitX) / (lookBeats * s.beatMs);
    for (let i = 0; i < s.notes.length; i++){
      const el = s.els[i];
      if (!el) continue;
      const n = s.notes[i];
      const tt = n.rest ? s.listenStart + n.beat * s.beatMs : n.t;
      const x = hitX + (tt - now) * pxPerMs;
      if (x < -80 || x > w + 40){
        el.style.visibility = 'hidden';
      } else {
        el.style.visibility = 'visible';
        el.style.transform = 'translateX(' + x + 'px)';
        if (n.dur > 1){
          const tail = el.querySelector('.nr-tail');
          if (tail) tail.style.width = ((n.dur - 1) * s.beatMs * pxPerMs) + 'px';
        }
      }
    }
  }

  if (s.phase === 'play'){
    /* Notes past their window become misses — but only after the event
       tail has had its chance to finalize a pluck that landed late in
       the window (+COACH_EVENT_TAIL, not Riff Runner's 150ms). */
    while (s.sweepIdx < s.playable.length && s.playable[s.sweepIdx].result) s.sweepIdx++;
    for (let i = s.sweepIdx; i < s.playable.length; i++){
      const n = s.playable[i];
      if (n.t + s.goodMs + COACH_EVENT_TAIL + 60 > now) break;
      if (!n.result){
        n.result = 'miss';
        s.combo = 0;
        nrMark(n, 'miss');
        nrHud();
      }
    }
    const beat = Math.floor((now - s.listenStart) / s.beatMs);
    if (beat !== s.lastBeat && beat >= 0){
      s.lastBeat = beat;
      const bar = Math.floor(beat / 4);
      const barEl = document.getElementById('nr-bar');
      if (barEl && bar < NR_LEVELS[s.level].bars)
        barEl.textContent = t('games.nr.barOfTotal', {bar: bar + 1, total: NR_LEVELS[s.level].bars});
      document.querySelectorAll('#nr-beats .cc-pip').forEach((el, i) =>
        el.classList.toggle('on', i === ((beat % 4) + 4) % 4));
    }
    if (now > s.listenStart + s.totalBeats * s.beatMs + COACH_EVENT_TAIL + 300){ nrFinish(); return; }
  }
  nrRaf = requestAnimationFrame(nrLoop);
}

function nrMark(n, cls){
  const i = nr.notes.indexOf(n);
  const el = i >= 0 && nr.els[i];
  if (el) el.classList.add(cls);
}

/* ── Hit celebrations (the Guitar-Hero sparkle) ──
   A perfect throws a spark burst at the hit line on that note's lane; a
   good gets a soft expanding ring; stepping the combo multiplier (×2 at
   8 in a row, up to ×4) pops the new multiplier over the track. Pure
   CSS animations on throwaway elements — spawned here, removed on a
   timer, hidden entirely under prefers-reduced-motion (the grade marks
   on the tokens carry the same information without motion). */
function nrBurst(n, kind){
  const s = nr;
  const track = document.getElementById('nr-track');
  const i = s ? s.notes.indexOf(n) : -1;
  const el = i >= 0 && s.els[i];
  if (!track || !el || !el.parentElement) return;
  const b = document.createElement('span');
  b.className = 'nr-burst ' + kind;
  b.style.left = (track.clientWidth * 0.22) + 'px';
  b.style.top = (el.parentElement.offsetTop + el.parentElement.offsetHeight / 2) + 'px';
  track.appendChild(b);
  s.timeouts.push(setTimeout(() => b.remove(), 650));
}
function nrComboPop(mult){
  const s = nr;
  const track = document.getElementById('nr-track');
  if (!s || !track) return;
  const b = document.createElement('span');
  b.className = 'nr-combo-pop';
  b.textContent = '×' + mult;
  track.appendChild(b);
  s.timeouts.push(setTimeout(() => b.remove(), 950));
}

/* An event finished collecting readings: consensus pitch (the Coach's
   tight-median filter — "unclear" is honest, a wrong verdict isn't),
   then match against the one open note whose window it landed in. */
function nrFinalizeEvent(){
  const s = nr;
  if (!s) return;
  const p = s.pending;
  s.pending = null;
  if (!p || (s.phase !== 'play' && s.phase !== 'countin')) return;
  let midi = null;
  if (p.readings.length >= 2){
    const med = tunerMedian(p.readings);
    const tight = p.readings.filter(r => Math.abs(r - med) <= 0.6);
    if (tight.length >= 2 && tight.length * 2 >= p.readings.length){
      midi = Math.round(tunerMedian(tight));
    }
  }
  /* Onset time, minus the device's mic latency. */
  const tEv = p.t - nrOffset();
  if (tEv < s.listenStart - s.goodMs) return;   // count-in: free
  let best = -1, bestAbs = Infinity;
  for (let i = 0; i < s.playable.length; i++){
    const n = s.playable[i];
    if (n.result) continue;
    if (n.t - tEv > s.goodMs) break;            // time-sorted — rest are ahead
    const a = Math.abs(n.t - tEv);
    if (a <= s.goodMs && a < bestAbs){ bestAbs = a; best = i; }
  }
  if (best < 0) return;   // stray onset with no note nearby: ignored, the
                          // same bargain the check flows strike (see CHK_*)
  const n = s.playable[best];
  /* Right note? Melody: exact midi — or the octave above, because a
     Chromebook mic often hears the low strings' 2nd harmonic louder than
     the fundamental (the same physics behind tuner.js's octave guard).
     Chords: the Coach's chord-tone vote — what fraction of the strum's
     raw pitch readings are tones of the chord (root or fifth; the
     detector legitimately hops between them, so single-pitch consensus
     would fail honest strums — see coachFinalizeEvent). */
  let pitchOk, unclear;
  if (n.chord){
    const want = [((n.midi % 12) + 12) % 12, ((n.midi + 7) % 12) % 12];
    const cls = p.readings.map(r => ((Math.round(r) % 12) + 12) % 12);
    pitchOk = cls.length >= 2 &&
      cls.filter(c => want.indexOf(c) >= 0).length / cls.length >= 0.20;
    unclear = cls.length < 2;          // heard a strum, no usable pitch reads
  } else {
    pitchOk = midi !== null && (midi === n.midi || midi === n.midi + 12);
    unclear = midi === null;           // heard a pluck, consensus failed
  }
  s.errs.push((tEv - n.t) / 1000);
  if (pitchOk){
    const prevMult = Math.min(4, 1 + Math.floor(s.combo / 8));
    s.combo++;
    if (s.combo > s.maxCombo) s.maxCombo = s.combo;
    const mult = Math.min(4, 1 + Math.floor(s.combo / 8));
    if (bestAbs <= s.perfectMs){
      n.result = 'perfect'; s.score += 100 * mult; nrMark(n, 'hit-perfect');
      nrBurst(n, 'nr-burst-perfect');
    } else {
      n.result = 'good'; s.score += 50 * mult; nrMark(n, 'hit-good');
      nrBurst(n, 'nr-burst-good');
    }
    if (mult > prevMult) nrComboPop(mult);
  } else {
    /* On the beat but the wrong (or unclear) note: half credit, amber.
       The unclear flag feeds the mic-problem guard in nrFinish. */
    n.result = 'pitch'; n.unclear = unclear;
    s.combo = 0; s.score += 20; nrMark(n, 'nr-hit-pitch');
  }
  nrHud();
}

function nrHud(){
  const s = nr;
  const sc = document.getElementById('nr-score');
  if (sc) sc.textContent = t('games.common.score', {n: s.score});
  const cb = document.getElementById('nr-combo');
  if (cb){
    const mult = Math.min(4, 1 + Math.floor(s.combo / 8));
    cb.innerHTML = s.combo >= 3
      ? '&#x1F525; ' + t('games.common.inARow', {n: s.combo}) + (mult > 1 ? ' &mdash; &times;' + mult : '')
      : '&nbsp;';
  }
}

function nrFinish(){
  if (!nr || (nr.phase !== 'play' && nr.phase !== 'countin')) return;
  const s = nr;
  if (nrRaf){ cancelAnimationFrame(nrRaf); nrRaf = null; }
  (s.timeouts || []).forEach(clearTimeout);
  s.timeouts = [];
  if (s.pending) nrFinalizeEvent();
  if (s.micOn){ s.micOn = false; coachMicOff(); }
  s.playable.forEach(n => { if (!n.result) n.result = 'miss'; });   // early Stop
  s.phase = 'done';

  const total = s.playable.length;
  const nPerfect = s.playable.filter(n => n.result === 'perfect').length;
  const nGood = s.playable.filter(n => n.result === 'good').length;
  const nPitch = s.playable.filter(n => n.result === 'pitch').length;
  s.acc = total ? Math.round(100 * (nPerfect + nGood) / total) : 0;
  s.passed = s.acc >= NR_PASS;
  s.prevBest = nrBestMerged(s.level);

  /* Weak-map upkeep: misses and wrong notes charge a position up; clean
     hits pay it back down until the entry retires. */
  const wk = nrWeak();
  let wkChanged = false;
  s.playable.forEach(n => {
    const k = nrWeakKey(n);
    if (n.result === 'miss' || n.result === 'pitch'){
      wk[k] = Math.min(6, (wk[k] || 0) + 2); wkChanged = true;
    } else if (wk[k]){
      wk[k] -= 1; wkChanged = true;
      if (wk[k] <= 0) delete wk[k];
    }
  });

  /* Adaptive stage move. An unclear-heavy round is a MIC problem, not a
     student problem — hold the stage and say so instead of demoting. */
  s.micSuspect = false;
  if (s.adaptive){
    const unclear = s.playable.filter(n => n.result === 'pitch' && n.unclear).length;
    s.micSuspect = total > 0 && unclear >= Math.max(3, Math.round(total * 0.4));
    let move = 0;
    if (s.acc >= NR_UP_PCT) move = 1;
    else if (s.acc < NR_DOWN_PCT && !s.micSuspect) move = -1;
    s.stageWas = s.stagePos;
    s.stagePos = Math.max(0, Math.min(NR_ADAPT_ORDER.length - 1, s.stagePos + move));
    s.stageMove = s.stagePos - s.stageWas;
    nrSetStagePos(s.stagePos);
  }

  if (s.acc > nrBestSession(s.level)){
    try { sessionStorage.setItem(nrBestKey(s.level), String(s.acc)); } catch(e){}
  }
  /* Cross-session best + unlocks + adaptive stage + weak map → the
     student's progress doc. Skipped in dev bypass (Firestore rejects that
     uid; sessionStorage still carries the session). */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    if (!games.nr) games.nr = {};
    if (!games.nr.levels) games.nr.levels = {};
    let dirty = false;
    if (s.acc > (games.nr.levels[s.level] || 0)){ games.nr.levels[s.level] = s.acc; dirty = true; }
    if (s.adaptive && games.nr.stage !== s.stagePos){ games.nr.stage = s.stagePos; dirty = true; }
    if (wkChanged){ games.nr.weak = wk; dirty = true; }
    if (dirty){
      games.nr.at = new Date().toISOString().slice(0, 10);
      saveGames();
    }
  }
  nrRenderDone(nPerfect, nGood, nPitch, total);
}

function nrRenderDone(nPerfect, nGood, nPitch, total){
  const body = nrBody();
  if (!body || !nr) return;
  const s = nr;
  const nxt = s.level + 1 < NR_LEVELS.length ? s.level + 1 : -1;
  /* "Unlocked!" only when THIS clear is what opened the next level — a
     re-clear (or a level whose successor unlocks off a different branch
     point, see `after`) gets the plain cleared line instead. */
  const firstClear = s.passed && s.prevBest < NR_PASS;
  const justUnlocked = !s.adaptive && nxt >= 0 && firstClear && nrReq(nxt) === s.level;
  const nextOpen = nxt >= 0 && nrUnlocked(nxt);

  let statusLine, banner = justUnlocked;
  if (s.adaptive){
    /* Adaptive verdict: where the journey goes next, and why. */
    const atTop = s.stageWas === NR_ADAPT_ORDER.length - 1;
    const hereName = t(NR_LEVELS[NR_ADAPT_ORDER[s.stagePos]].nameKey);
    if (s.micSuspect){
      statusLine = t('games.nr.micSuspect');
    } else if (s.stageMove > 0){
      statusLine = t('games.nr.stageUp', {name: hereName});
      banner = true;
    } else if (s.acc >= NR_UP_PCT && atTop){
      statusLine = t('games.nr.stageTop');
      banner = true;
    } else if (s.stageMove < 0){
      statusLine = t('games.nr.stageDown', {name: hereName});
    } else {
      statusLine = t('games.nr.stageStay');
    }
  } else if (s.passed){
    statusLine = justUnlocked ? t('games.nr.passUnlocked', {n: nxt + 1})
      : nxt < 0 ? t('games.nr.passLadderDone')
      : t('games.nr.passCleared');
  } else {
    statusLine = t('games.nr.failLine', {pct: NR_PASS});
  }

  /* What's coming back around — the top weak spots the next rounds will
     re-deal (shown in adaptive mode, where re-dealing is the promise). */
  let weakLine = '';
  if (s.adaptive){
    const wk = nrWeak();
    const seen = [];
    Object.keys(wk).filter(k => wk[k] >= 2).sort((a, b) => wk[b] - wk[a]).forEach(k => {
      const parts = k.split(':');
      const chord = parts[0] === 'c';
      const str = +parts[chord ? 1 : 0], fret = +parts[chord ? 2 : 1];
      const name = coachNoteName(STRING_OPEN_MIDI[str] + fret) + (chord ? '5' : '') +
        ' (' + t('games.nr.fretN', {n: fret}) + ')';
      if (seen.indexOf(name) < 0) seen.push(name);
    });
    if (seen.length){
      weakLine = `<div class="coach-tip rn-center">${t('games.nr.weakLine', {list: seen.slice(0, 3).join(' · ')})}</div>`;
    }
  }

  /* Early/late bias — median signed error, only with enough hits to
     mean something (same bar Riff Runner uses). */
  let biasLine = '';
  if (s.errs.length >= 4){
    const med = tunerMedian(s.errs) * 1000;
    if (Math.abs(med) > 25){
      biasLine = `<div class="coach-tip rn-center">${med < 0
        ? t('games.nr.biasEarly', {ms: Math.round(-med)})
        : t('games.nr.biasLate', {ms: Math.round(med)})}</div>`;
    } else {
      biasLine = `<div class="coach-tip rn-center">${t('games.nr.biasTight')}</div>`;
    }
  }

  const marks = s.playable.map(n => {
    const cls = n.result === 'perfect' ? 'p' : n.result === 'good' ? 'g' : n.result === 'pitch' ? 'a' : 'm';
    const sym = n.result === 'perfect' ? '&#x2605;' : n.result === 'good' ? '&#x2713;' : n.result === 'pitch' ? '~' : '&middot;';
    return `<span class="nr-mark ${cls}" title="${escAttr((n.chord ? n.name : coachNoteName(n.midi)) + ' — ' + t('games.nr.fretN', {n: n.fret}))}">${sym}</span>`;
  }).join('');

  let bestLine = '';
  if (s.prevBest > 0 && s.acc > s.prevBest){
    bestLine = `<div class="sh-newbest">&#x1F3C6; ${t('games.nr.newBest', {prevBest: s.prevBest + '%'})}</div>`;
  }

  const buttons = s.adaptive
    ? `<button type="button" class="coach-start" onclick="nrPlayAdaptive()">&#x1F3B8; ${t('games.nr.nextRoundButton')}</button>
       <button type="button" class="tp-btn" onclick="nrRenderHome()">&#x2190; ${t('games.nr.homeButton')}</button>`
    : `<button type="button" class="coach-start" onclick="nrPick(${s.level})">&#x21BB; ${t('games.nr.tryAgainButton')}</button>
       ${nextOpen ? `<button type="button" class="coach-start" onclick="nrPick(${nxt})">${t('games.nr.nextLevelButton')} &#x2192;</button>` : ''}
       <button type="button" class="tp-btn" onclick="nrShowSelect()">&#x2190; ${t('games.nr.allLevelsButton')}</button>`;
  body.innerHTML =
    `<div class="nr-acc ${s.passed ? 'pass' : ''}">${s.acc}%</div>
     <div class="coach-tip rn-center">${t('games.nr.resLine', {hits: nPerfect + nGood, total, perfects: nPerfect})}${nPitch ? ' ' + t('games.nr.resPitch', {n: nPitch}) : ''}</div>
     ${banner ? `<div class="rn-unlock">&#x1F513; ${statusLine}</div>` : `<div class="coach-tip rn-center">${statusLine}</div>`}
     ${bestLine}
     <div class="nr-marks">${marks}</div>
     ${biasLine}
     ${weakLine}
     <div class="rn-center">${buttons}</div>`;
}
