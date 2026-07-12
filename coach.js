/* ════════════════════════════════════════════════════════════════════
   Guitar Class — LISTENING COACH  (supersedes the Session G plan)

   The site hears you play and gives rubric feedback. Two entry points,
   both rendered by app.js:
     · "🎤 Check me" next to every ▶ Play button (data-midis = answer key)
     · "🎤 Check my changes / Strum check" under a step's chord diagrams
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
const COACH_ONSET_REFRACT = 140;    // ms — one strum = one onset, not six
const COACH_ATTACK_SKIP   = 70;     // ms after an onset before pitch readings start —
                                    // the analyser window still holds the pick scrape
                                    // (and the PREVIOUS note) until then
const COACH_EVENT_TAIL    = 340;    // ms of pitch readings collected after an onset
const COACH_MAX_SLOTS     = 32;
const COACH_BEATS_PER_CHORD = 4;

const COACH_FOOT_HTML = '<div class="coach-foot">&#x1F512; Listening happens right on this device — nothing is recorded or uploaded.</div>';

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
      ? `${names} — strum on every beat, 4 beats each chord, twice through`
      : `${names} — one strum on every beat`;
  } else {
    let midis;
    try { midis = JSON.parse(btn.dataset.midis || '[]'); } catch(e){ return; }
    if (!Array.isArray(midis) || !midis.length) return;
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
    desc = `${slots.length} notes: ${preview}${slots.length > 10 ? '…' : ''} — one note per beat`;
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
       <span class="coach-title">&#x1F3A4; Listening Coach</span>
       <span class="coach-mic" id="coach-mic" hidden><span class="coach-mic-dot"></span>mic on</span>
       <button type="button" class="coach-x" onclick="coachClose()" aria-label="Close Listening Coach">&#x2715;</button>
     </div>
     <div class="coach-body" id="coach-body"></div>
     ${COACH_FOOT_HTML}`;
  const anchor = btn.closest('.bpm-control-group') || btn.parentElement;
  anchor.insertAdjacentElement('afterend', card);

  coach = {
    phase: 'ready', mode, slots, desc, bpm, tabNotes, tabDerived,
    beatMs: 60000 / bpm,
    card, streakKey: 'coachStreak:' + (btn.dataset.chords || btn.dataset.midis),
    events: [], pending: null,
    gridOffset: 0, listenStart: 0, timeouts: [],
    smoothRms: 0, smoothHf: 0, lastOnsetT: -1e9, lastPitchT: 0
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
    (coach.tabDerived ? `<div class="coach-tab-hint">One way to finger it — if the step shows a different position, use that one.</div>` : '') +
    `</div>`;
}

/* ══════════ Card phases ══════════ */

function coachBody(){ return document.getElementById('coach-body'); }

function coachRenderReady(msg){
  if (!coach) return;
  coach.phase = 'ready';
  const noun = coach.mode === 'chords' ? 'strum' : 'note';
  coachBody().innerHTML =
    (msg ? `<div class="coach-note">${escHtml(msg)}</div>` : '') +
    `<div class="coach-target">You&rsquo;ll play: <strong>${escHtml(coach.desc)}</strong></div>
     ${coachTabHtml()}
     <div class="coach-bpm-row">
       <button type="button" class="tp-btn" onclick="coachNudgeBpm(-5)">&#x2212;5</button>
       <span class="coach-bpm-readout" id="coach-bpm-readout">${coach.bpm} BPM</span>
       <button type="button" class="tp-btn" onclick="coachNudgeBpm(5)">+5</button>
     </div>
     <div class="coach-tip">&#x1F92B; Works best somewhere quiet, guitar close to the mic. You&rsquo;ll hear 4 count-in clicks, then the click goes silent while I listen — keep counting in your head and play one ${noun} per beat.</div>
     <button type="button" class="coach-start" onclick="coachStartCheck()">&#x25B6; Start the check</button>`;
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
    if (coach === session) coachRenderReady('Mic access denied — check browser permissions, then try again.');
    return;
  }
  if (coach !== session){ coachReleaseMicIfIdle(); return; }   // card closed during the prompt
  if (document.hidden){   // tab was backgrounded while the prompt was open
    coachMicOff();
    coachRenderReady('Paused — this tab went to the background, so the mic switched off. Start the check again when you\'re back.');
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

  /* Count-in: 4 clicks, last one higher = "go". The tab stays on screen so
     the fretting hand can get in position while the clicks run. */
  coach.phase = 'countin';
  coachBody().innerHTML = `<div class="coach-count" id="coach-count">&nbsp;</div>` + coachTabHtml() +
    coachChordsHtml(coach.slots[0] && coach.slots[0].chordName);
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
  const hp = coachCtx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 70; hp.Q.value = 0.7;
  const lp = coachCtx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 1500; lp.Q.value = 0.7;
  coachAnalyser = coachCtx.createAnalyser();
  coachAnalyser.fftSize = COACH_FFT;
  coachAnalyser.smoothingTimeConstant = 0;
  src.connect(hp); hp.connect(lp); lp.connect(coachAnalyser);
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
                   fretRunning || (cc && cc.micOn) || (sr && sr.micOn);
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

function coachRenderListening(){
  coachBody().innerHTML =
    `<div class="coach-live"><span class="coach-live-dot"></span>Listening — play now!</div>
     ${coachTabHtml()}
     ${coachNowHtml()}
     ${coachChordsHtml(coach.slots[0] && coach.slots[0].chordName)}
     ${coachStripHtml()}
     <button type="button" class="tp-btn coach-stop" onclick="coachFinish()">&#x25A0; I&rsquo;m done</button>`;
}

/* Big current-chord readout for multi-chord checks (same pattern as Change
   Up): the player needs to see the NEXT chord before its beat arrives — the
   chip strip alone only reveals a change the instant it's due, which makes
   every switch late by reaction time. */
/* Chord diagrams for the coach card — visible from the count-in on, so the
   fretting hand can set up the first shape before beat 1 (same reason the
   melody TAB stays up during the count-in). */
function coachChordsHtml(curName){
  if (coach.mode !== 'chords') return '';
  const names = [];
  coach.slots.forEach(s => { if (s.chordName && names.indexOf(s.chordName) < 0) names.push(s.chordName); });
  return ccDiagramsHtml(names, curName, 'coach-dia');
}

function coachNowHtml(){
  if (coach.mode !== 'chords' || !coach.slots.some(s => s.isChange)) return '';
  return `<div class="cc-now"><div class="cc-chord" id="coach-chord">${escHtml(coach.slots[0].chordName)}</div>` +
         `<div class="cc-next" id="coach-next">next: ${escHtml(coachNextChord(0) || '')}</div></div>`;
}

function coachNextChord(cur){
  const name = coach.slots[cur].chordName;
  for (let i = cur + 1; i < coach.slots.length; i++){
    if (coach.slots[i].chordName !== name) return coach.slots[i].chordName;
  }
  return null;
}

function coachStripHtml(){
  return `<div class="coach-strip">` + coach.slots.map((s, i) =>
    `<span class="coach-chip ${s.state}" id="coach-chip-${i}" title="${escAttr(s.chordName || s.label)}">${escHtml(s.label)}</span>`
  ).join('') + `</div>`;
}

function coachChipRefresh(i){
  const el = document.getElementById('coach-chip-' + i);
  if (el) el.className = 'coach-chip ' + coach.slots[i].state;
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
        ((rms > COACH_ONSET_FLOOR && rms > coach.smoothRms * COACH_ONSET_RATIO) ||
         (hf > COACH_HF_FLOOR && hf > coach.smoothHf * COACH_HF_RATIO))){
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
      const f = coachDetectPitch(buf, coachCtx.sampleRate);
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
      const prev = document.querySelector('.coach-chip.now');
      if (prev) prev.classList.remove('now');
      const el = document.getElementById('coach-chip-' + cur);
      if (el) el.classList.add('now');
      const chordEl = document.getElementById('coach-chord');
      if (chordEl){
        const name = coach.slots[cur].chordName;
        if (chordEl.textContent !== name){
          chordEl.textContent = name;
          coach.card.querySelectorAll('.cc-dia').forEach(el => el.classList.remove('cur'));
          const dia = document.getElementById('coach-dia-' + name);
          if (dia) dia.classList.add('cur');
        }
        const nextEl = document.getElementById('coach-next');
        if (nextEl){
          const nx = coachNextChord(cur);
          nextEl.textContent = nx ? 'next: ' + nx : 'last chord — let the sound keep ringing';
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
function coachDetectPitch(buf, sampleRate){
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
    if (d[tau] < 0.22){
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
      ? coachToneShare(ev, s) >= 0.34
      : ev.midi != null && s.classes.indexOf(((ev.midi % 12) + 12) % 12) >= 0;
    const score = Math.abs(dev) + (classOk ? 0 : coach.beatMs * 0.6);
    if (score < bestScore){ bestScore = score; best = i; }
  }
  if (best < 0) return;   // unmatched onset — an extra strum between beats
  const s = coach.slots[best];
  const dev = rel - best * coach.beatMs;
  ev.devMs = dev; ev.slot = best;
  if (coach.mode === 'chords'){
    /* Chord-tone vote: ok when a third of the readings land on chord tones
       (a clean strum easily clears that; detector noise doesn't sink it).
       "Wrong" only on strong contrary evidence — the honest default for a
       murky strum is dim, never an accusation. */
    const share = coachToneShare(ev, s);
    const n = (ev.classes || []).length;
    if (n < 2) s.state = 'dim';
    else if (share >= 0.34) s.state = 'ok';
    else if (share <= 0.15 && n >= 3) s.state = 'wrong';
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
      `<div class="coach-note">&#x1F914; I couldn&rsquo;t hear that clearly — try again somewhere quieter, with the guitar closer to the mic, and ${coach.mode === 'chords' ? 'strum each chord' : 'pick each note'} firmly.</div>
       ${coachStripHtml()}
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="coachStartCheck()">&#x21BB; Try again</button>
         <button type="button" class="tp-btn" onclick="coachClose()">Close</button>
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

  const LVL = { 1: 'Needs work', 2: 'You’re getting it', 3: 'Great' };
  const applicable = crits.filter(c => c.level > 0);
  const greats = applicable.filter(c => c.level === 3).length;
  let overall;
  if (greats === applicable.length) overall = '&#x1F31F; That was great — seriously.';
  else if (greats >= 2)             overall = '&#x1F4AA; Good try — look how much is already green.';
  else                              overall = '&#x1F3B8; Good practice — every check makes the next one better.';

  /* Streak: a "clear" = perfect pitch score and nothing at Needs work. */
  const clear = crits[0].level === 3 && applicable.every(c => c.level >= 2);
  let streak = 0;
  try {
    streak = clear ? (parseInt(sessionStorage.getItem(coach.streakKey), 10) || 0) + 1 : 0;
    sessionStorage.setItem(coach.streakKey, String(streak));
  } catch(e){}
  const streakHtml = streak >= 3
    ? `<div class="coach-streak">&#x1F525; That&rsquo;s ${streak} clean tries in a row — you&rsquo;ve got this one.</div>` : '';

  coachBody().innerHTML =
    `<div class="coach-report"><div class="coach-overall">${overall}</div>
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
       <button type="button" class="coach-start" onclick="coachStartCheck()">&#x21BB; Try again</button>
       <button type="button" class="tp-btn" onclick="coachClose()">Done</button>
     </div></div>`;
}

/* ── Criterion 1: Right notes / right chord sound ── */
function coachScorePitch(){
  const name = coach.mode === 'chords' ? 'Right chord sound' : 'Right notes';
  const icon = '&#x1F3AF;';
  const slots = coach.slots;
  const judged = slots.filter(s => s.state === 'ok' || s.state === 'oct' || s.state === 'wrong');
  const good = slots.filter(s => s.state === 'ok' || s.state === 'oct').length;
  const octs = slots.filter(s => s.state === 'oct').length;
  const dim = slots.filter(s => s.state === 'dim').length;

  if (coach.mode === 'chords' && dim > slots.length * 0.6){
    return { name, icon, level: 2, sentence: 'I heard the strums but couldn’t make out the pitches clearly — I mostly scored your timing this round, so the beat feedback is the important part.' };
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
    const lead = good === 0 ? 'Most'
      : good === 1 ? 'The one note I heard clearly was right, but most'
      : `The ${good} notes I heard clearly were right, but most`;
    return { name, icon, level: good > 0 ? 2 : 1,
      sentence: `${lead} of your notes didn’t reach the mic — usually that’s uneven volume, not your fingers. Pluck every note at the same confident level, closer to the mic.` };
  }
  const quietOnly = !firstWrong && (missed + dim) > 0;
  /* A clearly-wrong note caps the score at level 2 — on a short drill one
     clunker can still leave the ratio above the "Great" bar. */
  if (r >= 0.85 && !firstWrong){
    level = 3;
    sentence = coach.mode === 'chords'
      ? `The chord tones rang true on ${good} of ${total} beats — that’s the sound we want.`
      : quietOnly
        ? `You played every note I heard correctly — ${good} of ${total}; the other ${total - good === 1 ? 'one' : total - good} didn’t reach the mic, so keep every pluck at the same confident volume.`
        : `${good} of ${total} notes correct` + (octs ? ` (${octs} came out an octave off, which still counts).` : ' — a perfect run!');
  } else if (r >= 0.55){
    level = 2;
    if (firstWrong && coach.mode === 'melody'){
      const idx = slots.indexOf(firstWrong);
      sentence = `You hit ${good} of ${total} — your ${ordinal(idx + 1)} note came out ${coachNoteName(firstWrong.hit.midi)} instead of ${firstWrong.label}; slow down just for that spot.`;
    } else if (quietOnly){
      sentence = coach.mode === 'chords'
        ? `Every strum I heard clearly sounded right — ${good} of ${total} — but the mic didn’t hear the rest. That’s usually volume, not your fingers: keep every strum at the same confident level.`
        : `Every note I heard clearly was right — ${good} of ${total} — but the mic didn’t hear the rest. That’s usually volume, not your fingers: give every note the same confident pluck.`;
    } else {
      sentence = `About ${good} of ${total} beats sounded right — you’re close; keep your eyes on the fretting hand at the tricky spot.`;
    }
  } else {
    level = 1;
    if (quietOnly){
      sentence = coach.mode === 'chords'
        ? `What I heard clearly sounded right, but most strums didn’t reach the mic — that’s usually a volume problem. Strum every beat at the same confident level, closer to the mic.`
        : `The notes I heard clearly were right, but most didn’t reach the mic — that’s usually a volume problem. Pluck every note at the same confident level, closer to the mic.`;
    } else {
      sentence = coach.mode === 'chords'
        ? `The mic wasn’t picking up the chord sound yet — check each finger is on its tip, then strum slowly and let the sound keep ringing.`
        : `I only caught ${good} of ${total} notes landing — drop the BPM way down and say each note name as you play it.`;
    }
  }
  return { name, icon, level, sentence };
}

/* ── Criterion 2: On the beat ── */
function coachScoreTiming(){
  const name = 'On the beat', icon = '&#x1F941;';
  const devs = coach.slots.filter(s => s.hit && s.hit.devMs != null).map(s => s.hit.devMs);
  if (devs.length < 3) return { name, icon, level: 1, sentence: 'Not enough hits landed to judge the beat — try again and play one hit per beat, even if it’s messy.' };
  const onMs = Math.max(70, coach.beatMs * 0.12), closeMs = onMs * 2;
  const on = devs.filter(d => Math.abs(d) <= onMs).length;
  const close = devs.filter(d => Math.abs(d) <= closeMs).length;
  const mean = devs.reduce((a, b) => a + b, 0) / devs.length;
  const lean = Math.abs(mean) < onMs * 0.6 ? '' : (mean < 0 ? 'early' : 'late');
  let level, sentence;
  if (on / devs.length >= 0.75){
    level = 3; sentence = `Right on time — ${on} of ${devs.length} notes landed exactly on the beat.`;
  } else if (close / devs.length >= 0.6){
    level = 2;
    sentence = lean
      ? `You’re slightly ${lean} on average — keep the count-in’s speed going in your head and it’ll get steadier.`
      : `Most notes were close to the beat but scattered — count “1-2-3-4” out loud and it’ll get steadier.`;
  } else {
    level = 1; sentence = 'The hits and the beat weren’t lining up yet — drop the BPM, tap your foot, and make the foot and the pick move together.';
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
  const name = 'Steady tempo', icon = '&#x23F1;';
  const ts = coach.events.filter(e => e.slot >= 0).map(e => e.t).sort((a, b) => a - b);
  if (ts.length < 6) return { name, icon, level: 2, sentence: 'Too short a try to judge tempo drift — play a longer try and this feedback will mean more.' };
  const iois = [];
  for (let i = 1; i < ts.length; i++) iois.push(ts[i] - ts[i - 1]);
  const med = tunerMedian(iois);
  if (!(med > 0)) return { name, icon, level: 2, sentence: 'I couldn’t get a clear tempo reading on that try — go again with one confident hit per beat.' };
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
  if (!b1 || !b2 || !bAll) return { name, icon, level: 2, sentence: 'I couldn’t get a clear tempo reading on that try — go again with one confident hit per beat.' };
  const drift = Math.abs(b2 - b1) / coach.bpm;
  let level, sentence;
  if (drift <= 0.07){
    level = 3; sentence = `You held ~${Math.round(bAll)} BPM steady the whole way through.`;
  } else if (drift <= 0.15){
    level = 2;
    sentence = `You ${b2 > b1 ? 'sped up' : 'slowed down'} a little (~${Math.round(b1)} to ~${Math.round(b2)} BPM) — totally normal; keep the count going in your head after the clicks stop.`;
  } else {
    level = 1;
    sentence = `You ${b2 > b1 ? 'sped up' : 'slowed down'} — from ~${Math.round(b1)} to ~${Math.round(b2)} BPM. That’s normal! Tap your foot and follow your foot.`;
  }
  return { name, icon, level, sentence };
}

/* ── Criterion 4: Chord changes ── */
function coachScoreChanges(){
  const name = 'Chord changes', icon = '&#x1F504;';
  if (coach.mode !== 'chords'){
    return { name, icon, level: 0, sentence: 'No chord changes in this drill — run a Check on a chord step to light this one up.' };
  }
  const bounds = coach.slots.filter(s => s.isChange);
  if (!bounds.length) return { name, icon, level: 0, sentence: 'Only one chord here — no changes to judge. Steady strumming is all that matters on this one.' };
  const closeMs = Math.max(140, coach.beatMs * 0.24);
  const onTime = bounds.filter(s => s.hit && Math.abs(s.hit.devMs) <= closeMs && s.state !== 'wrong');
  const late = bounds.find(s => !(s.hit && Math.abs(s.hit.devMs) <= closeMs && s.state !== 'wrong'));
  const r = onTime.length / bounds.length;
  let level, sentence;
  if (r >= 0.85){
    level = 3; sentence = `All ${bounds.length === 1 ? '' : bounds.length + ' '}changes landed on time — the chord change no longer makes you miss the beat.`;
  } else if (r >= 0.5){
    level = 2;
    sentence = `${onTime.length} of ${bounds.length} changes landed on time — the change to ${late ? late.chordName : 'the next chord'} is the one to practice by itself.`;
  } else {
    level = 1;
    sentence = 'The changes came in late — practice just the change: four slow beats on each chord, and start moving your fingers on beat 4.';
  }
  return { name, icon, level, sentence };
}

/* ── Criterion 5: Played it through ── */
function coachScoreCompletion(){
  const name = 'Played it through', icon = '&#x1F3C1;';
  const slots = coach.slots;
  const hitIdx = slots.map((s, i) => s.hit ? i : -1).filter(i => i >= 0);
  const coverage = hitIdx.length / slots.length;
  let maxGap = hitIdx.length ? hitIdx[0] : slots.length;
  for (let k = 1; k < hitIdx.length; k++) maxGap = Math.max(maxGap, hitIdx[k] - hitIdx[k - 1] - 1);
  const tailMiss = hitIdx.length ? slots.length - 1 - hitIdx[hitIdx.length - 1] : slots.length;
  let level, sentence;
  if (coverage >= 0.9 && maxGap <= 1){
    level = 3; sentence = 'Start to finish with no stops — that’s how you build real songs.';
  } else if (coverage >= 0.65 && tailMiss <= 2){
    level = 2;
    const gapAt = hitIdx.find((v, k) => k > 0 && v - hitIdx[k - 1] - 1 >= 2);
    sentence = gapAt != null
      ? `You got through most of it — there was a pause around beat ${gapAt + 1}; that’s the spot to loop on its own.`
      : 'You got through most of it — a couple of hits didn’t reach the mic (quieter plucks, usually), but the run kept moving. Keep every note at the same volume.';
  } else {
    level = 1;
    sentence = tailMiss > 2
      ? 'You stopped partway — make the chunk smaller: play just the first few notes cleanly, then add one more each time.'
      : 'Lots of gaps in that try — slow and smooth is better than fast and messy, every time.';
  }
  return { name, icon, level, sentence };
}

/* ══════════ Teardown ══════════ */

/* Full stop: mic off, timers cleared, card removed. Safe to call anytime. */
function coachClose(){
  if (coachRaf){ cancelAnimationFrame(coachRaf); coachRaf = null; }
  if (coach){
    coach.timeouts.forEach(clearTimeout);
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
    coachRenderReady(msg || 'The tuner took over the mic — tune up, then start the check again.');
  }
}

/* Privacy + battery: the mic (and its analysis loops) never runs in a tab the
   student isn't looking at. Switching tabs or locking the phone shuts it all
   down cleanly; the student restarts with one tap when they're back. */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  coachInterrupt('Paused — this tab went to the background, so the mic switched off. Start the check again when you\'re back.');
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
const FRET_GAME_LEVELS = [
  { label: 'Open',  strings: [6,5,4,3,2,1], maxFret: 0 },
  { label: 'E · A', strings: [6,5],         maxFret: 10 },
  { label: 'D · G', strings: [4,3],         maxFret: 10 },
  { label: 'B · e', strings: [2,1],         maxFret: 10 },
  { label: 'All 6', strings: [6,5,4,3,2,1], maxFret: 10 }
];
const FRET_STRING_NAMES = { 6:'low E', 5:'A', 4:'D', 3:'G', 2:'B', 1:'high e' };
const FRET_ROUND = 10;

let fretRunning = false, fretGame = null, fretRaf = null;

async function fretStart(){
  if (fretRunning) return;
  coachClose();                                        // one mic owner at a time
  ccStop();
  coachEvictTuner();
  const body = document.getElementById('fret-body');
  if (!body) return;
  body.innerHTML = '<div class="coach-tip">Starting the mic…</div>';
  if (!coachStream && !(await coachAcquireMic())){
    const b2 = document.getElementById('fret-body');
    if (b2) b2.innerHTML = '<div class="coach-note">Mic access denied — check browser permissions, then close and reopen Note Hunt.</div>';
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
    g.flash = { text: '&#x2713; ' + escHtml(p.note) + (first ? ' — first try!' : ' — got there!') };
    if (g.results.length >= FRET_ROUND){
      g.phase = 'done';
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
    g.hint = 'That’s ' + heard + ' too — but an octave ' + (midi > p.m ? 'higher' : 'lower') +
             '. Find it on the ' + FRET_STRING_NAMES[p.s] + ' string.';
  } else if (Math.abs(d) <= 9){
    g.hint = 'I heard ' + heard + ' — go ' + Math.abs(d) + ' fret' + (Math.abs(d) > 1 ? 's' : '') + ' ' +
             (d > 0 ? 'up (toward the body — the round part)' : 'down (toward the headstock — the top, where the tuning pegs are)') + '.';
  } else {
    g.hint = 'I heard ' + heard + ' — you’re hunting ' + p.note + '. Keep going!';
  }
  fretRender();
}

function fretSkip(){
  const g = fretGame;
  if (!g || g.phase !== 'play' || !g.prompt) return;
  const p = g.prompt;
  g.results.push(false);
  g.hint = 'It was fret ' + p.f + ' — ' + p.note + ' on the ' + FRET_STRING_NAMES[p.s] + ' string.';
  g.cooldownUntil = performance.now() + 1600;
  if (g.results.length >= FRET_ROUND){ g.phase = 'done'; fretRender(); return; }
  fretRender();
  setTimeout(() => { if (fretGame === g && g.phase === 'play') fretNextPrompt(); }, 1600);
}

function fretRender(){
  const body = document.getElementById('fret-body');
  if (!body || !fretGame) return;
  const g = fretGame;
  const pills = '<div class="fret-levels">' + FRET_GAME_LEVELS.map((L, i) =>
    `<button type="button" class="ts-btn${i === g.level ? ' active' : ''}" onclick="fretSetLevel(${i})">${L.label}</button>`
  ).join('') + '</div>';
  const dots = '<div class="fret-dots">' + Array.from({ length: FRET_ROUND }, (_, i) => {
    let cls = 'fret-dot';
    if (i < g.results.length) cls += g.results[i] ? ' hit' : ' miss';
    else if (i === g.results.length && g.phase === 'play') cls += ' cur';
    return `<span class="${cls}"></span>`;
  }).join('') + '</div>';
  const foot = COACH_FOOT_HTML;

  if (g.phase === 'done'){
    const score = g.results.filter(Boolean).length;
    const msg = score >= 9 ? 'You know the fretboard! Try a harder level.'
              : score >= 6 ? 'Nice — you’re learning the fretboard.'
              : 'Every round teaches you the fretboard a little more — go again.';
    body.innerHTML = pills + dots +
      `<div class="fret-score">&#x1F3AF; ${score} of ${FRET_ROUND} first try</div>
       <div class="coach-tip">${msg}</div>
       <button type="button" class="coach-start" onclick="fretNewRound(${g.level})">&#x21BB; Play again</button>` + foot;
    return;
  }
  const p = g.prompt;
  const promptHtml = FRET_GAME_LEVELS[g.level].maxFret === 0
    ? `Play the open <strong>${FRET_STRING_NAMES[p.s]}</strong> string`
    : `Find <strong>${escHtml(p.note)}</strong> on the <strong>${FRET_STRING_NAMES[p.s]}</strong> string`;
  const statusHtml = g.flash
    ? `<div class="fret-flash">${g.flash.text}</div>`
    : g.hint
      ? `<div class="coach-note">${escHtml(g.hint)}</div>`
      : `<div class="fret-listen"><span class="coach-live-dot"></span>Listening&hellip;</div>`;
  body.innerHTML = pills + dots +
    `<div class="fret-prompt">${promptHtml}</div>` + statusHtml +
    `<button type="button" class="tp-btn fret-skip" onclick="fretSkip()">Skip &#x2192;</button>` + foot;
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
  const screen = document.getElementById('games-screen');
  const p = document.getElementById('games-panel');
  if (screen && !screen.hasAttribute('hidden') && p &&
      (document.getElementById('fret-body') || document.getElementById('cc-body') ||
       document.getElementById('cb-body') || document.getElementById('sh-body') ||
       document.getElementById('rr-body') || document.getElementById('sr-body') ||
       document.getElementById('fz-body'))){
    gamesRenderHub(p);
  }
}

function gamesHeadHtml(title, inGame){
  return `<div class="games-game-head"><span class="games-game-title">${title}</span>` +
    (inGame ? `<button type="button" class="games-back" onclick="gamesShow('hub')">&#x2190; All games</button>` : '') +
    `</div>`;
}

function gamesRenderHub(p){
  let ccBest = 0;
  try {
    for (const pr of CC_PROGRESSIONS){
      ccBest = Math.max(ccBest, parseInt(sessionStorage.getItem(ccBestKey(pr)), 10) || 0);
    }
  } catch(e){}
  const ccChip = ccBest ? `<span class="games-card-best">&#x1F3C6; best today: ${ccBest} BPM</span>` : '';
  let cbBest = 0;
  try {
    for (const d of CB_DECKS){
      cbBest = Math.max(cbBest,
        parseInt(sessionStorage.getItem(cbBestKey(d.id, 'name')), 10) || 0,
        parseInt(sessionStorage.getItem(cbBestKey(d.id, 'spot')), 10) || 0);
    }
  } catch(e){}
  const cbChip = cbBest ? `<span class="games-card-best">&#x1F3C6; best today: ${cbBest}</span>` : '';
  let fzBest = 0;
  try {
    for (const d of FZ_DECKS){
      fzBest = Math.max(fzBest, parseInt(sessionStorage.getItem(fzBestKey(d.id)), 10) || 0);
    }
  } catch(e){}
  const fzChip = fzBest ? `<span class="games-card-best">&#x1F3C6; best today: ${fzBest}</span>` : '';
  let shBest = 0;
  for (const pat of SH_PATTERNS){
    const b = shBestRead(pat.id);
    if (b) shBest = Math.max(shBest, b.score);
  }
  const shChip = shBest ? `<span class="games-card-best">&#x1F3C6; best today: ${shBest}</span>` : '';
  let srBest = 0;
  for (const pat of SH_PATTERNS){
    const b = srBestRead(pat.id);
    if (b) srBest = Math.max(srBest, b.acc);
  }
  const srChip = srBest ? `<span class="games-card-best">&#x1F3C6; best today: ${srBest}%</span>` : '';
  let rrChip = '';
  const rrG = (typeof games !== 'undefined' && games && games.rr) || null;
  if (rrStreakAlive(rrG)){
    rrChip = `<span class="games-card-best">&#x1F525; ${rrG.streak}-day streak</span>`;
  } else {
    let rrPts = 0, rrDay = '';
    try {
      rrPts = parseInt(sessionStorage.getItem('rrPts'), 10) || 0;
      rrDay = sessionStorage.getItem('rrDay') || '';
    } catch(e){}
    if (rrPts > 0 && rrDay === rrDayStr(new Date())) rrChip = `<span class="games-card-best">&#x2B50; ${rrPts} points today</span>`;
  }
  p.innerHTML =
    `<div class="games-tagline">Some games listen to your guitar. Others just need your eyes and a tapping finger.</div>
     <div class="games-grid">
       <button type="button" class="games-card gc-hunt" onclick="gamesShow('fret')">
         <span class="games-card-ico">&#x1F3AF;</span>
         <span class="games-card-title">Note Hunt</span>
         <span class="games-card-desc">Find named notes on the fretboard — the mic checks you. Five levels, from open strings to all six.</span>
       </button>
       <button type="button" class="games-card gc-change" onclick="gamesShow('cc')">
         <span class="games-card-ico">&#x1F501;</span>
         <span class="games-card-title">Change Up</span>
         <span class="games-card-desc">Change chords in time with the beat — two chords, then three, then four. Go faster each round.</span>
         ${ccChip}
       </button>
       <button type="button" class="games-card gc-blitz" onclick="gamesShow('blitz')">
         <span class="games-card-ico">&#x26A1;</span>
         <span class="games-card-title">Chord Blitz</span>
         <span class="games-card-desc">90 seconds, how many chord shapes can you name? No guitar needed — this one trains your eyes.</span>
         ${cbChip}
       </button>
       <button type="button" class="games-card gc-fretzap" onclick="gamesShow('fretzap')">
         <span class="games-card-ico">&#x1F4A5;</span>
         <span class="games-card-title">Fret Zap</span>
         <span class="games-card-desc">A dot lights up on the fretboard — name that note before the clock runs out. Pure neck memory, no guitar needed.</span>
         ${fzChip}
       </button>
       <button type="button" class="games-card gc-strum" onclick="gamesShow('strum')">
         <span class="games-card-ico">&#x1F3B8;</span>
         <span class="games-card-title">Strum Hero</span>
         <span class="games-card-desc">Tap the strums in time — down-up arrows on a scrolling lane. Your rhythm, graded.</span>
         ${shChip}
       </button>
       <button type="button" class="games-card gc-radar" onclick="gamesShow('radar')">
         <span class="games-card-ico">&#x1F4E1;</span>
         <span class="games-card-title">Strum Radar</span>
         <span class="games-card-desc">Strum a real pattern on your real guitar — the mic checks your timing, not your notes.</span>
         ${srChip}
       </button>
       <button type="button" class="games-card gc-roulette" onclick="gamesShow('roulette')">
         <span class="games-card-ico">&#x1F3B0;</span>
         <span class="games-card-title">Riff Roulette</span>
         <span class="games-card-desc">Spin for a short real-guitar challenge matched to what you&rsquo;ve learned so far. Score yourself honestly — you are the judge.</span>
         ${rrChip}
       </button>
     </div>
     ${COACH_FOOT_HTML}`;
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
    p.innerHTML = gamesHeadHtml('&#x1F3AF; Note Hunt', true) + `<div id="fret-body"></div>`;
    fretStart();
    return;
  }
  if (view === 'cc'){
    p.innerHTML = gamesHeadHtml('&#x1F501; Change Up', true) + `<div id="cc-body"></div>`;
    ccSetup();
    return;
  }
  if (view === 'blitz'){
    p.innerHTML = gamesHeadHtml('&#x26A1; Chord Blitz', true) + `<div id="cb-body"></div>`;
    cbSetup();
    return;
  }
  if (view === 'strum'){
    p.innerHTML = gamesHeadHtml('&#x1F3B8; Strum Hero', true) + `<div id="sh-body"></div>`;
    shSetup();
    return;
  }
  if (view === 'radar'){
    p.innerHTML = gamesHeadHtml('&#x1F4E1; Strum Radar', true) + `<div id="sr-body"></div>`;
    srSetup();
    return;
  }
  if (view === 'roulette'){
    p.innerHTML = gamesHeadHtml('&#x1F3B0; Riff Roulette', true) + `<div id="rr-body"></div>`;
    rrSetup();
    return;
  }
  if (view === 'fretzap'){
    p.innerHTML = gamesHeadHtml('&#x1F4A5; Fret Zap', true) + `<div id="fz-body"></div>`;
    fzSetup();
    return;
  }
}

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
  { chords: ['Am','Em'] }, { chords: ['G','C'] }, { chords: ['A','D'] }, { chords: ['E','Am'] },
  { chords: ['A','D','E'] }, { chords: ['G','C','D'] }, { chords: ['Am','C','G'] },
  { chords: ['C','G','Am','F'] }, { chords: ['G','D','Em','C'] }, { chords: ['Am','F','C','G'] }
];
const CC_BARS = 8;                 // 8 bars ≈ 7 graded changes per round
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
function ccBestKey(prog){ return 'ccBest:' + prog.chords.join('-'); }

function ccSetup(){
  let progIdx = 0, bpm = 60;
  try {
    progIdx = parseInt(sessionStorage.getItem('ccProg'), 10);
    bpm = parseInt(sessionStorage.getItem('ccBpm'), 10);
  } catch(e){}
  if (!(progIdx >= 0 && progIdx < CC_PROGRESSIONS.length)) progIdx = 0;
  if (!(bpm >= CC_BPM_MIN && bpm <= CC_BPM_MAX)) bpm = 60;
  cc = { phase: 'setup', progIdx, bpm, micOn: false, timeouts: [] };
  ccRenderSetup();
}

function ccPickProg(i){
  if (!cc) return;
  cc.progIdx = i;
  try { sessionStorage.setItem('ccProg', String(i)); } catch(e){}
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
  const groups = [[2, '2 chords — back & forth'], [3, '3 chords'], [4, '4 chords']];
  const pills = groups.map(([len, title]) =>
    `<div class="cc-group"><div class="cc-group-title">${title}</div><div class="fret-levels">` +
    CC_PROGRESSIONS.map((pr, i) => pr.chords.length !== len ? '' :
      `<button type="button" class="ts-btn${i === cc.progIdx ? ' active' : ''}" onclick="ccPickProg(${i})">${escHtml(pr.chords.join(len === 2 ? ' ↔ ' : ' – '))}</button>`
    ).join('') + `</div></div>`
  ).join('');
  const prog = CC_PROGRESSIONS[cc.progIdx];
  let best = 0;
  try { best = parseInt(sessionStorage.getItem(ccBestKey(prog)), 10) || 0; } catch(e){}
  body.innerHTML =
    (msg ? `<div class="coach-note">${escHtml(msg)}</div>` : '') +
    pills +
    ccDiagramsHtml(prog.chords, null) +
    `<div class="coach-bpm-row">
       <button type="button" class="tp-btn" onclick="ccNudgeBpm(-5)">&#x2212;5</button>
       <span class="coach-bpm-readout" id="cc-bpm-readout">${cc.bpm} BPM</span>
       <button type="button" class="tp-btn" onclick="ccNudgeBpm(5)">+5</button>
       ${best ? `<span class="cc-best">Best today: ${best} BPM</span>` : ''}
     </div>
     <div class="coach-tip">&#x1F92B; Quiet room, guitar close to the mic. 4 count-in clicks, then <strong>strum on every beat</strong> — the chord switches each bar (one group of 4 beats), and beat 1 of the new bar is what I&rsquo;m grading. The click is silent: watch the beat dots.</div>
     <button type="button" class="coach-start" onclick="ccStart()">&#x25B6; Start &mdash; ${CC_BARS} bars</button>
     ${COACH_FOOT_HTML}`;
}

async function ccStart(){
  if (!cc || cc.phase === 'countin' || cc.phase === 'play') return;
  coachClose();
  fretStop();
  coachEvictTuner();
  const session = cc;
  if (!coachStream && !(await coachAcquireMic())){
    if (cc === session) ccRenderSetup('Mic access denied — check browser permissions, then try again.');
    return;
  }
  if (cc !== session){ coachReleaseMicIfIdle(); return; }   // panel closed during the prompt
  if (document.hidden){
    coachMicOff();
    ccRenderSetup('Paused — this tab went to the background, so the mic switched off. Start again when you\'re back.');
    return;
  }
  cc.micOn = true;
  stopAllDemoAudio();

  const prog = CC_PROGRESSIONS[cc.progIdx].chords;
  cc.bars = Array.from({ length: CC_BARS }, (_, i) => prog[i % prog.length]);
  cc.classes = {};
  prog.forEach(n => {
    const midis = (typeof chordMidis === 'function') ? chordMidis(n) : [];
    cc.classes[n] = midis.map(m => ((m % 12) + 12) % 12);
  });
  cc.changes = [];
  for (let b = 1; b < CC_BARS; b++){
    cc.changes.push({ beat: b * 4, from: cc.bars[b - 1], to: cc.bars[b], result: null, pend: null });
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
    `<span class="coach-chip pending" id="cc-chip-${i}" title="${escAttr(c.from + ' to ' + c.to)}">${escHtml(c.to)}</span>`
  ).join('');
  body.innerHTML =
    `<div class="cc-now">
       <div class="cc-chord" id="cc-chord">${escHtml(cc.bars[0])}</div>
       <div class="cc-next" id="cc-next">next: ${escHtml(cc.bars[1])}</div>
     </div>
     <div class="cc-beats" id="cc-beats"><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span></div>
     ${ccDiagramsHtml(CC_PROGRESSIONS[cc.progIdx].chords, cc.bars[0])}
     <div class="coach-strip">${chips}</div>
     <div class="coach-live"><span class="coach-live-dot"></span>Strum every beat — the dots show the beat</div>
     <button type="button" class="tp-btn coach-stop" onclick="ccFinish()">&#x25A0; Stop</button>`;
}

function ccBeatTick(cur){
  const bar = Math.floor(cur / 4), beatInBar = cur % 4;
  if (bar >= CC_BARS) return;
  const chordEl = document.getElementById('cc-chord');
  const nextEl = document.getElementById('cc-next');
  if (chordEl && chordEl.textContent !== cc.bars[bar]){
    chordEl.textContent = cc.bars[bar];
    document.querySelectorAll('.cc-dia').forEach(el => el.classList.remove('cur'));
    const dia = document.getElementById('cc-dia-' + cc.bars[bar]);
    if (dia) dia.classList.add('cur');
  }
  if (nextEl) nextEl.textContent = bar + 1 < CC_BARS ? 'next: ' + cc.bars[bar + 1] : 'last bar!';
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
    if ((rms > COACH_ONSET_FLOOR &&
         rms > cc.smoothRms * COACH_ONSET_RATIO ||
         coachHfRms > COACH_HF_FLOOR &&
         coachHfRms > cc.smoothHf * COACH_HF_RATIO) &&
        now - cc.lastOnsetT > COACH_ONSET_REFRACT){
      cc.lastOnsetT = now;
      const rel = now - cc.listenStart - cc.gridOffset;
      const beatIdx = Math.round(rel / cc.beatMs);
      const dev = rel - beatIdx * cc.beatMs;
      if (Math.abs(dev) < cc.beatMs * 0.45) cc.gridOffset += dev * 0.15;
      const win = Math.max(140, cc.beatMs * 0.3);
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
        const f = coachDetectPitch(buf, coachCtx.sampleRate);
        if (f > 0) open.pend.readings.push(69 + 12 * Math.log2(f / 440));
      }
      if (now - open.pend.t > COACH_EVENT_TAIL) ccResolvePend(open);
    }

    /* Overdue changes are misses. */
    const relNow = now - cc.listenStart - cc.gridOffset;
    cc.changes.forEach((c, i) => {
      if (c.result === null && !c.pend && relNow > (c.beat + 0.7) * cc.beatMs){
        c.result = 'miss';
        ccChipRefresh(i);
      }
    });

    /* Same adapted-grid rule as the Coach's pulse: the chord/beat display
       must follow the grid the scoring uses, or it drifts off the player. */
    const cur = Math.floor((now - cc.listenStart - cc.gridOffset) / cc.beatMs);
    if (cur !== cc.lastBeat && cur >= 0){ cc.lastBeat = cur; ccBeatTick(cur); }

    if (now > cc.listenStart + (CC_BARS * 4 + 1) * cc.beatMs){ ccFinish(); return; }
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
    verdict = '&#x1F31F; ' + ok + ' of ' + total + ' changes on time — you can play at that speed now.';
    advice = 'Level up: try it 10 BPM faster.';
    try {
      const k = ccBestKey(prog);
      const best = parseInt(sessionStorage.getItem(k), 10) || 0;
      if (cc.bpm > best) sessionStorage.setItem(k, String(cc.bpm));
    } catch(e){}
  } else if (r >= 0.5){
    verdict = '&#x1F4AA; ' + ok + ' of ' + total + ' changes worked' + (off ? ' (' + off + ' were on time but sounded messy)' : '') + '.';
    advice = worst ? ('Practice just ' + worst + ' on its own — start moving your fingers on beat 4.') : 'Try it again at this speed until it feels steady.';
  } else {
    verdict = '&#x1F3B8; ' + ok + ' of ' + total + ' — this speed is too fast for now.';
    advice = 'That’s completely fine: drop 10 BPM — slow and smooth is better than fast and messy, every time.';
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
       <button type="button" class="${rec === 'down' ? 'coach-start' : 'tp-btn'}" onclick="ccAgain(-10)">&#x2B07; &minus;10 BPM</button>
       <button type="button" class="${rec === 'same' ? 'coach-start' : 'tp-btn'}" onclick="ccAgain(0)">&#x21BB; Again at ${cc.bpm}</button>
       <button type="button" class="${rec === 'up' ? 'coach-start' : 'tp-btn'}" onclick="ccAgain(10)">&#x2B06; +10 BPM</button>
     </div>
     <button type="button" class="tp-btn cc-change-loop" onclick="ccSetup()">Pick a different loop</button>
     ${COACH_FOOT_HTML}</div>`;
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
const CB_DECKS = [
  { id: 'open',  label: 'Open chords',    chords: ['E','Em','A','Am','D','Dm','G','C','F'] },
  { id: 'power', label: 'Power chords',   chords: ['E5','G5','A5','C5','D5'] },
  { id: 'barre', label: 'Partial barres', chords: ['Bm','B7','F#m','C#m'] },
  { id: 'all',   label: 'Everything',     chords: ['E','Em','A','Am','D','Dm','G','C','F','E5','G5','A5','C5','D5','Bm','B7','F#m','C#m'] }
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
    `<button type="button" class="ts-btn${d.id === cb.deck ? ' active' : ''}" onclick="cbPickDeck('${d.id}')">${escHtml(d.label)}</button>`
  ).join('');
  const dirPills = [['name', 'Name it'], ['spot', 'Spot it']].map(([d, label]) =>
    `<button type="button" class="ts-btn${d === cb.dir ? ' active' : ''}" onclick="cbPickDir('${d}')">${label}</button>`
  ).join('');
  let best = 0;
  try { best = parseInt(sessionStorage.getItem(cbBestKey(cb.deck, cb.dir)), 10) || 0; } catch(e){}
  body.innerHTML =
    `<div class="cc-group"><div class="cc-group-title">Deck</div><div class="fret-levels">${deckPills}</div></div>
     <div class="cc-group"><div class="cc-group-title">Direction</div><div class="fret-levels">${dirPills}</div></div>
     <div class="coach-tip"><strong>Name it</strong>: you see a chord shape, you pick its name. <strong>Spot it</strong>: you see a name, you pick the shape. Right answers build a streak — every 5 in a row is worth more points. Miss one and the right answer lights up green, then that chord comes back later. On a laptop, keys 1&ndash;4 answer.</div>
     ${best ? `<div class="cb-setup-best">&#x1F3C6; Best today: ${best}</div>` : ''}
     <button type="button" class="coach-start" onclick="cbStart()">&#x25B6; Start &mdash; 90 seconds</button>`;
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
       <span class="cb-score" id="cb-score">Score: ${s.score}</span>
       <span class="cb-streak" id="cb-streak">${s.streak >= 2 ? '&#x1F525; ' + s.streak + ' in a row' + (mult > 1 ? ' &mdash; &times;' + mult : '') : '&nbsp;'}</span>
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
  if (scoreEl) scoreEl.textContent = 'Score: ' + s.score;
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
    bestLine = `<div class="cb-newbest">&#x1F3C6; New best! Your old best today was ${cb.prevBest}.</div>`;
  } else if (cb.prevBest > 0){
    bestLine = `<div class="coach-tip">Best today: ${cb.prevBest}.</div>`;
  }
  body.innerHTML =
    `<div class="coach-report">
       <div class="cb-done-score">${cb.score}</div>
       <div class="coach-overall">&#x26A1; ${cb.answered} card${cb.answered === 1 ? '' : 's'} answered &mdash; ${cb.correct} right (${acc}%).</div>
       ${bestLine}
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="cbStart()">&#x21BB; Play again</button>
         <button type="button" class="tp-btn" onclick="cbSetup()">Change deck</button>
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
const FZ_DECKS = [
  { id: 'lowEA', label: 'Low strings (E & A)', strings: [6, 5],             maxFret: 5,  naturalsOnly: true },
  { id: 'first5', label: 'All strings, 0–5',   strings: [6, 5, 4, 3, 2, 1], maxFret: 5,  naturalsOnly: true },
  { id: 'to12',  label: 'Naturals to 12',      strings: [6, 5, 4, 3, 2, 1], maxFret: 12, naturalsOnly: true },
  { id: 'sharps', label: 'Everything',         strings: [6, 5, 4, 3, 2, 1], maxFret: 12, naturalsOnly: false }
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
    `<button type="button" class="ts-btn${d.id === fz.deck ? ' active' : ''}" onclick="fzPickDeck('${d.id}')">${escHtml(d.label)}</button>`
  ).join('');
  let best = 0;
  try { best = parseInt(sessionStorage.getItem(fzBestKey(fz.deck)), 10) || 0; } catch(e){}
  body.innerHTML =
    `<div class="cc-group"><div class="cc-group-title">Deck</div><div class="fret-levels">${deckPills}</div></div>
     <div class="coach-tip">A dot lights up on the fretboard — a diagram of the guitar neck — and you tap that note's <strong>name</strong> from four choices. Right answers build a streak: every 5 in a row is worth more points. Miss one and the right answer lights up green, then that spot comes back later. Higher decks add more strings, more frets, and the sharps and naturals (a <strong>natural</strong> is a plain letter with no sharp; a <strong>sharp</strong>, written ♯, is the note one fret above a letter). On a laptop, keys 1&ndash;4 answer.</div>
     ${best ? `<div class="cb-setup-best">&#x1F3C6; Best today: ${best}</div>` : ''}
     <button type="button" class="coach-start" onclick="fzStart()">&#x25B6; Start &mdash; 60 seconds</button>`;
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
       <span class="cb-score" id="fz-score">Score: ${s.score}</span>
       <span class="cb-streak" id="fz-streak">${s.streak >= 2 ? '&#x1F525; ' + s.streak + ' in a row' + (mult > 1 ? ' &mdash; &times;' + mult : '') : '&nbsp;'}</span>
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
  if (scoreEl) scoreEl.textContent = 'Score: ' + s.score;
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
    bestLine = `<div class="cb-newbest">&#x1F3C6; New best! Your old best today was ${fz.prevBest}.</div>`;
  } else if (fz.prevBest > 0){
    bestLine = `<div class="coach-tip">Best today: ${fz.prevBest}.</div>`;
  }
  body.innerHTML =
    `<div class="coach-report">
       <div class="cb-done-score">${fz.score}</div>
       <div class="coach-overall">&#x1F4A5; ${fz.answered} card${fz.answered === 1 ? '' : 's'} answered &mdash; ${fz.correct} right (${acc}%).</div>
       ${bestLine}
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="fzStart()">&#x21BB; Play again</button>
         <button type="button" class="tp-btn" onclick="fzSetup()">Change deck</button>
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
  { id: 'downs',    label: 'All downstrums',
    hint: 'One downstrum on every beat: 1, 2, 3, 4. Count along with the click.',
    slots: ['D', null, 'D', null, 'D', null, 'D', null], minBpm: 50, maxBpm: 120, defBpm: 60 },
  { id: 'eighths',  label: 'Down-up eighths',
    hint: 'Down on every beat, up on every "+". Your hand never stops moving.',
    slots: ['D', 'U', 'D', 'U', 'D', 'U', 'D', 'U'], minBpm: 50, maxBpm: 120, defBpm: 70 },
  { id: 'faithful', label: 'Old Faithful (D-DU-UDU)',
    hint: 'Down, down-up, up-down-up. On the dots your hand still swings — it just misses the strings.',
    slots: ['D', null, 'D', 'U', null, 'U', 'D', 'U'], minBpm: 50, maxBpm: 120, defBpm: 70 },
  { id: 'reggae',   label: 'Reggae chop',
    hint: 'Upstrums only, on every "+". Stay silent on the beat — the click plays it for you.',
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
    `<button type="button" class="ts-btn${i === sh.patIdx ? ' active' : ''}" onclick="shPickPat(${i})">${escHtml(p.label)}</button>`
  ).join('');
  const pat = SH_PATTERNS[sh.patIdx];
  const best = shBestRead(pat.id);
  body.innerHTML =
    (msg ? `<div class="coach-note">${escHtml(msg)}</div>` : '') +
    `<div class="cc-group"><div class="cc-group-title">Pattern</div><div class="fret-levels">${pills}</div></div>
     ${shPatternLineHtml(pat)}
     <div class="coach-tip">${escHtml(pat.hint)}</div>
     <div class="coach-bpm-row">
       <button type="button" class="tp-btn" onclick="shNudgeBpm(-5)">&#x2212;5</button>
       <span class="coach-bpm-readout" id="sh-bpm-readout">${sh.bpm} BPM</span>
       <button type="button" class="tp-btn" onclick="shNudgeBpm(5)">+5</button>
       ${best ? `<span class="cc-best">Best today: ${best.score}${best.bpm ? ' (at ' + best.bpm + ' BPM)' : ''}</span>` : ''}
     </div>
     <div class="coach-tip">Arrows slide toward the line — tap right when each arrow reaches it. Tap the big pad, or press the spacebar. &#x2193; is a downstrum, &#x2191; is an upstrum. 4 clicks count you in.</div>
     <button type="button" class="coach-start" onclick="shStart()">&#x25B6; Start &mdash; ${SH_BARS} bars</button>`;
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
  if (typeof getAudioCtx !== 'function'){ shRenderSetup('Sound isn’t available in this browser, and this game needs the click.'); return; }
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
       <span class="sh-score" id="sh-score">Score: 0</span>
       <span class="sh-combo" id="sh-combo">&nbsp;</span>
       <span class="sh-bar" id="sh-bar">get ready&hellip;</span>
     </div>
     <div class="cc-beats" id="sh-beats"><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span></div>
     <div class="sh-lane" id="sh-lane"><div class="sh-hitline"></div>${arrows}<div class="sh-count" id="sh-count">&nbsp;</div></div>
     <button type="button" class="sh-pad" onpointerdown="shPadTap(event)">
       <span class="sh-pad-label">TAP</span>
       <span class="sh-pad-sub">or press the spacebar</span>
     </button>
     <button type="button" class="tp-btn coach-stop" onclick="shFinish()">&#x25A0; Stop</button>`;
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
  if (scoreEl) scoreEl.textContent = 'Score: ' + s.score;
  const comboEl = document.getElementById('sh-combo');
  if (comboEl){
    const mult = Math.min(4, 1 + Math.floor(s.combo / 8));
    comboEl.innerHTML = s.combo >= 4
      ? '&#x1F525; ' + s.combo + ' in a row' + (mult > 1 ? ' &mdash; &times;' + mult : '')
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
      if (barEl && bar < SH_BARS) barEl.textContent = 'bar ' + (bar + 1) + '/' + SH_BARS;
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
    verdict = acc + '% on time — your strumming hand keeps a steady beat.';
    advice = 'Level up: try it 10 BPM faster.';
  } else if (stars === 2){
    verdict = acc + '% on time — this pattern is almost yours.';
    advice = 'One more round at this speed and it will feel easy.';
  } else if (stars === 1){
    verdict = acc + '% on time — keep going, the pattern is starting to land on the beat.';
    advice = 'Say the pattern out loud while you tap: it really helps.';
  } else {
    verdict = acc + '% on time — this speed is too fast for now.';
    advice = 'That’s completely fine: drop 10 BPM — slow and steady builds the skill.';
  }

  /* Early/late bias — median signed error over the graded taps. Only
     shown with enough taps to mean something. */
  let biasLine = '';
  if (s.errs.length >= 4){
    const med = tunerMedian(s.errs) * 1000;
    if (Math.abs(med) > 25){
      biasLine = `<div class="coach-tip sh-center">${med < 0
        ? 'You tap a little early (about ' + Math.round(-med) + 'ms) — wait for the click.'
        : 'You tap a little late (about ' + Math.round(med) + 'ms) — move with the click.'}</div>`;
    }
  }

  let bestLine = '';
  if (s.prevBest > 0 && s.score > s.prevBest){
    bestLine = `<div class="sh-newbest">&#x1F3C6; New best! Your old best today was ${s.prevBest}.</div>`;
  } else if (s.prevBest > 0){
    bestLine = `<div class="coach-tip sh-center">Best today: ${s.prevBest}.</div>`;
  }

  const rec = stars >= 3 ? 'up' : stars >= 1 ? 'same' : 'down';
  body.innerHTML =
    `<div class="coach-report">
       <div class="sh-done-score">${s.score}</div>
       <div class="sh-stars">${starHtml}</div>
       <div class="coach-overall">&#x1F3B8; ${escHtml(verdict)}</div>
       <div class="coach-strip">
         <span class="coach-chip ok">Perfect ${nPerfect}</span>
         <span class="coach-chip good">Good ${nGood}</span>
         <span class="coach-chip miss">Miss ${nMiss}</span>
         ${s.extras ? `<span class="coach-chip dim">Extra taps ${s.extras}</span>` : ''}
       </div>
       ${s.maxCombo >= 8 ? `<div class="coach-tip sh-center">Longest streak: ${s.maxCombo} in a row.</div>` : ''}
       ${biasLine}
       ${bestLine}
       <div class="coach-crit-note">${escHtml(advice)}</div>
       <div class="coach-actions">
         <button type="button" class="${rec === 'down' ? 'coach-start' : 'tp-btn'}" onclick="shAgain(-10)">&#x2B07; &minus;10 BPM</button>
         <button type="button" class="${rec === 'same' ? 'coach-start' : 'tp-btn'}" onclick="shAgain(0)">&#x21BB; Again at ${s.bpm}</button>
         <button type="button" class="${rec === 'up' ? 'coach-start' : 'tp-btn'}" onclick="shAgain(10)">&#x2B06; +10 BPM</button>
       </div>
       <button type="button" class="tp-btn" onclick="shSetup()">Change pattern</button>
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
  { text: 'Strum all 6 strings slowly with your thumb, one strum per click. Make every strum soft and even.',
    bpm: 60, secs: 30, minModule: 1, maxModule: 3 },
  { text: 'Pluck only the A string (5th string) 8 times, counting "1-2-3-4, 1-2-3-4" out loud.',
    bpm: null, secs: 30, minModule: 1, maxModule: 3 },
  { text: 'Say the string names from thickest to thinnest — E, A, D, G, B, E — and pluck each string as you say it. Do the whole trip 3 times.',
    bpm: null, secs: 45, minModule: 1, maxModule: 3 },
  { text: 'Pluck the low E string (the thickest one) 4 times, then the A string 4 times, then D, then G. Stay with the click.',
    bpm: 60, secs: 40, minModule: 1, maxModule: 3 },
  /* Module 2 — notes on the E & A strings */
  { text: 'On the low E string, play frets 0-1-2-3 going up, then 3-2-1-0 coming back. One note per click, over and over.',
    bpm: 60, secs: 45, minModule: 2, maxModule: 5 },
  { text: 'Find G on the low E string (fret 3) and play it 5 times. Let every note ring — no buzz.',
    bpm: null, secs: 30, minModule: 2, maxModule: 5 },
  { text: 'Walk E-F-G on the low E string (open, fret 1, fret 3) up and back, one note per click.',
    bpm: 60, secs: 45, minModule: 2, maxModule: 5 },
  { text: 'On the A string, play A-B-C (open, fret 2, fret 3) up and back, one note per click.',
    bpm: 60, secs: 45, minModule: 2, maxModule: 5 },
  /* Module 3 — power chords, palm mute, Seven Nation Army */
  { text: 'Play E5 for 4 clicks, then A5 for 4 clicks. Keep switching until the timer ends.',
    bpm: 70, secs: 45, minModule: 3 },
  { text: 'Palm mute E5 (rest the side of your strumming hand on the strings, right by the bridge) and play 8 short chugs per group of 4 clicks.',
    bpm: 80, secs: 40, minModule: 3 },
  { text: 'Play the Seven Nation Army riff 4 times in a row without stopping. Stay with the click.',
    bpm: 90, secs: 60, minModule: 3 },
  { text: 'Power-chord ladder: E5 → G5 → A5, one strum each, 2 clicks per chord — then come back down.',
    bpm: 70, secs: 45, minModule: 3 },
  /* Module 4 — minor pentatonic Pattern 1, alternate picking */
  { text: 'Play minor pentatonic Pattern 1 going up, one note per click. Strict alternate picking: down-up-down-up.',
    bpm: 60, secs: 60, minModule: 4 },
  { text: 'Loop the first 4 notes of Pattern 1 with alternate picking. Keep the down-up motion steady the whole time.',
    bpm: 70, secs: 45, minModule: 4 },
  { text: 'Play Pattern 1 up AND back down without stopping. Miss a note? Keep going — do not restart.',
    bpm: 60, secs: 60, minModule: 4 },
  /* Module 5 — open chords */
  { text: 'Em to Am, one strum each: switch as many times as you can. Count your clean changes out loud.',
    bpm: null, secs: 60, minModule: 5 },
  { text: 'G to C, one strum each: switch as many times as you can before the timer ends.',
    bpm: null, secs: 60, minModule: 5 },
  { text: 'Loop Em → C → G with 4 downstrums on each chord. Strum on the click.',
    bpm: 60, secs: 60, minModule: 5 },
  { text: 'Simplified F chord: press it, strum once, lift your whole hand off, put it back. Repeat until the timer ends.',
    bpm: null, secs: 45, minModule: 5 },
  /* Module 6 — strumming patterns, partial barres */
  { text: 'Strum D-DU-UDU on Em, over and over. Your hand keeps swinging on the skips — it just misses the strings.',
    bpm: 70, secs: 60, minModule: 6 },
  { text: 'Reggae chop on Em: upstrums only, on every "+" between the clicks. Stay silent on the beat itself.',
    bpm: 70, secs: 45, minModule: 6 },
  { text: 'G to C with down-up eighths: D-U-D-U-D-U-D-U on each chord, then switch chords without stopping your hand.',
    bpm: 70, secs: 60, minModule: 6 },
  { text: 'Bm to Am, one strum each, switching every 4 clicks. Use the small Bm (top 4 strings only).',
    bpm: 60, secs: 45, minModule: 6 },
  /* Module 7 — full barre chords */
  { text: 'Full F barre chord: press, strum once, hold for about 4 seconds, then relax your hand completely. Repeat until the timer ends.',
    bpm: null, secs: 60, minModule: 7 },
  { text: 'Make the E-shape barre at fret 1 (that is F), then slide the whole shape up 3 frets and back, strumming once at each stop.',
    bpm: null, secs: 45, minModule: 7 },
  /* Module 8 — fingerpicking */
  { text: 'Fingerpick Am: thumb plays string 5, then your first, second, and third fingers play strings 3, 2, 1 — one at a time, one note per click.',
    bpm: 60, secs: 60, minModule: 8 },
  { text: 'Hold Em and let your thumb walk: string 6, string 4, string 6, string 4 — one pluck per click, steady like a heartbeat.',
    bpm: 60, secs: 45, minModule: 8 },
  /* Module 9 — the full fretboard & writing TAB */
  { text: 'Pick a dot fret — 3, 5, 7, or 9. Pluck that fret on all 6 strings, thickest to thinnest, saying each note’s name out loud as you go. Made the trip? Pick a new dot fret and go again.',
    bpm: null, secs: 60, minModule: 9 },
  { text: 'Play the first four notes of the Seven Nation Army riff, then say each one the way you’d write it in TAB — string, then fret (like “A string, fret 7”). Play it once more to check yourself.',
    bpm: null, secs: 45, minModule: 9 },
  /* Module 10 — scales */
  { text: 'Build a major scale up the low E string starting at fret 3 (that’s G) with the recipe W-W-H-W-W-W-H — a whole step (W) is 2 frets, a half step (H) is 1. One note per click.',
    bpm: 60, secs: 60, minModule: 10 },
  { text: 'Play minor pentatonic box 1 at fret 5, up and back, one note per click. Then say the key (A minor) and its relative major — the major key that shares its notes, 3 frets up (C).',
    bpm: 60, secs: 60, minModule: 10 },
  /* Module 11 — chord families */
  { text: 'Say the chord family of C major out loud — C, Dm, Em, F, G, Am — then strum the I, IV, and V (C, F, G) once each. A chord family = the main chords built from a key’s own notes.',
    bpm: null, secs: 45, minModule: 11 },
  /* Module 12 — fingerstyle */
  { text: 'Fret a C chord and let your thumb walk: alternate between the A string and the D string, one bass note per click, without stopping. That steady thumb is the engine of Travis picking.',
    bpm: 60, secs: 45, minModule: 12 },
  /* Wildcards — any module */
  { text: 'Play anything you have learned, without stopping, until the timer ends. Mess up? Keep going anyway.',
    bpm: null, secs: 60, minModule: 1, double: true },
  { text: 'Eyes closed: play one note or one chord you know 8 times, by feel only.',
    bpm: null, secs: 30, minModule: 1, double: true },
  { text: 'Stand up and play anything you know until the timer ends. Standing changes how the guitar sits — go slower if you need to.',
    bpm: null, secs: 45, minModule: 1 },
  { text: 'Whisper mode: play anything you know as SOFTLY as you can. Quiet takes more control than loud.',
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
    `<span class="rr-chip">&#x2B50; ${pts} points today</span>
     <span class="rr-chip">&#x1F0CF; ${Math.min(done, 3)} of 3 cards</span>
     ${streak ? `<span class="rr-chip streak">&#x1F525; ${streak === 1 ? 'streak started today' : streak + '-day streak'}</span>` : ''}`;
  body.innerHTML =
    `<div class="coach-tip rr-center">Spin. Do the card for real, on your guitar. Score yourself honestly.</div>
     <div class="rr-chips">${chips}</div>
     ${done >= 3 ? `<div class="rr-done-banner" id="rr-done-banner">&#x1F389; Today&rsquo;s set is done — ${pts} points. Extra spins still count.</div>` : ''}
     <button type="button" class="coach-start rr-spin-btn" onclick="rrSpin()">&#x1F3B0; SPIN</button>`;
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
  return card.text.length > 60 ? card.text.slice(0, 57) + '…' : card.text;
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
       ${card.double ? '<div class="rr-double">&#x2B50; Double points</div>' : ''}
       <div class="rr-card-text">${escHtml(card.text)}</div>
       <div class="rr-card-meta">
         ${card.bpm ? `<span class="rr-bpm">&#x1F3B5; click at ${card.bpm} BPM</span>` : ''}
         <span class="rr-secs">&#x23F1; ${card.secs} seconds</span>
       </div>
     </div>
     <button type="button" class="coach-start" onclick="rrStart()">&#x25B6; Start</button>
     ${skipsLeft ? `<button type="button" class="rr-skip" onclick="rrSkip()">Skip this card (${skipsLeft} skip${skipsLeft === 1 ? '' : 's'} left today)</button>` : ''}`;
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
       ${card.double ? '<div class="rr-double">&#x2B50; Double points</div>' : ''}
       <div class="rr-card-text">${escHtml(card.text)}</div>
       ${card.bpm ? `<div class="rr-card-meta"><span class="rr-bpm">&#x1F3B5; ${card.bpm} BPM</span></div>` : ''}
     </div>
     ${card.bpm ? '<div class="cc-beats" id="rr-beats"><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span></div>' : ''}
     <div class="rr-timer" id="rr-timer">${card.secs}</div>
     <div class="coach-tip rr-center">Play until the timer ends — you score it yourself after.</div>`;
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
    `<div class="rr-time-up">&#x23F0; Time!</div>
     <div class="coach-tip rr-center">How did it go? Score yourself honestly — honest answers help you get better faster.</div>
     <div class="rr-score-row">
       <button type="button" class="rr-score-btn got" onclick="rrScore('got')">
         <span>&#x2705; Got it</span><span class="rr-score-sub">+${worth} points</span>
       </button>
       <button type="button" class="rr-score-btn almost" onclick="rrScore('almost')">
         <span>&#x1F7E1; Almost</span><span class="rr-score-sub">+${worth / 2} — this card comes back later</span>
       </button>
       <button type="button" class="rr-score-btn" onclick="rrScore('not')">
         <span>Not yet</span><span class="rr-score-sub">+0 — that is okay, try this card another day</span>
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
const SR_HINTS = {
  downs:    'One downstrum on every beat: 1, 2, 3, 4. Count out loud — it helps your arm stay steady on the beat.',
  eighths:  'Down on every beat, up on every "+". Your arm never stops moving.',
  faithful: 'Down, down-up, up-down-up. On the dots your arm still swings — it just misses the strings.',
  reggae:   'Strum only on every "+". Stay silent on the beat — count it in your head.'
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
    `<button type="button" class="ts-btn${i === sr.patIdx ? ' active' : ''}" onclick="srPickPat(${i})">${escHtml(p.label)}</button>`
  ).join('');
  const pat = SH_PATTERNS[sr.patIdx];
  const best = srBestRead(pat.id);
  body.innerHTML =
    (msg ? `<div class="coach-note">${escHtml(msg)}</div>` : '') +
    `<div class="cc-group"><div class="cc-group-title">Pattern</div><div class="fret-levels">${pills}</div></div>
     ${shPatternLineHtml(pat)}
     <div class="coach-tip">${escHtml(SR_HINTS[pat.id] || pat.hint)}</div>
     <div class="coach-bpm-row">
       <button type="button" class="tp-btn" onclick="srNudgeBpm(-5)">&#x2212;5</button>
       <span class="coach-bpm-readout" id="sr-bpm-readout">${sr.bpm} BPM</span>
       <button type="button" class="tp-btn" onclick="srNudgeBpm(5)">+5</button>
       ${best ? `<span class="cc-best">Best today: ${best.acc}%${best.bpm ? ' (at ' + best.bpm + ' BPM)' : ''}</span>` : ''}
     </div>
     <div class="coach-tip">&#x1F3B8; Hold any chord you know — Em is a good choice. The radar listens to your timing, not your notes. And it hears WHEN you strum, not which way — follow the arrows with your arm anyway, they matter for the feel.</div>
     <div class="coach-tip">&#x1F92B; Quiet room, guitar close to the mic. 4 count-in clicks, then the click goes silent — it can&rsquo;t sound while the mic listens — so keep the beat with your foot or in your head.</div>
     <button type="button" class="coach-start" onclick="srStart()">&#x25B6; Start &mdash; ${SR_BARS} bars</button>
     ${COACH_FOOT_HTML}`;
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
  body.innerHTML = '<div class="coach-tip sr-center">Starting the mic…</div>';
  if (!coachStream && !(await coachAcquireMic())){
    if (sr === s) srRenderSetup('Mic access denied — check browser permissions, then try again.');
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
    `<div class="coach-tip sr-center">4 clicks, then strum — the click goes quiet while the mic listens.</div>`;
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
    `<span class="coach-chip pending" id="sr-chip-${i}" title="bar ${n.bar + 1}">${n.dir}</span>`
  ).join('');
  body.innerHTML =
    `<div class="coach-live"><span class="coach-live-dot"></span>Listening — strum along<span class="sr-bar" id="sr-bar">bar 1/${SR_BARS}</span></div>
     <div class="cc-beats" id="sr-beats"><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span></div>
     ${srStripHtml(pat)}
     <div class="coach-strip">${chips}</div>
     <div class="coach-tip sr-center">No click now — keep the count-in&rsquo;s beat going with your foot.</div>
     <button type="button" class="tp-btn coach-stop" onclick="srFinish()">&#x25A0; Stop</button>`;
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
  if (barEl) barEl.textContent = 'bar ' + (bar + 1) + '/' + SR_BARS;
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
    verdict = s.acc + '% of strums on the beat — your strumming arm is steady on real strings.';
    advice = 'Level up: try it 5 BPM faster, or switch chords each bar on your own.';
  } else if (stars === 2){
    verdict = s.acc + '% on the beat — this pattern is almost yours.';
    advice = 'One more round at this speed and it will feel easy.';
  } else if (stars === 1){
    verdict = s.acc + '% on the beat — the pattern is starting to land.';
    advice = 'Say the pattern out loud while you strum — it really helps.';
  } else {
    verdict = s.acc + '% — the radar barely heard the pattern.';
    advice = 'Two easy fixes: move closer to the mic and strum a little harder, or drop 10 BPM.';
  }

  /* Early/late bias — median signed error over the landed strums. Only
     shown with enough strums to mean something. */
  let biasLine = '';
  if (s.errs.length >= 4){
    const med = tunerMedian(s.errs);
    if (Math.abs(med) > 25){
      biasLine = `<div class="coach-tip sr-center">${med < 0
        ? 'You strum a little early (about ' + Math.round(-med) + 'ms) — relax and wait for the beat.'
        : 'You strum a little late (about ' + Math.round(med) + 'ms) — move with the beat.'}</div>`;
    }
  }

  let bestLine = '';
  if (s.prevBest && s.acc > s.prevBest.acc){
    bestLine = `<div class="sh-newbest">&#x1F3C6; New best! Your old best today was ${s.prevBest.acc}%.</div>`;
  } else if (s.prevBest){
    bestLine = `<div class="coach-tip sr-center">Best today: ${s.prevBest.acc}%${s.prevBest.bpm ? ' (at ' + s.prevBest.bpm + ' BPM)' : ''}.</div>`;
  }

  const rec = stars >= 3 ? 'up' : stars >= 1 ? 'same' : 'down';
  body.innerHTML =
    `<div class="coach-report">
       <div class="sh-stars">${starHtml}</div>
       <div class="coach-overall">&#x1F4E1; ${escHtml(verdict)}</div>
       <div class="coach-strip">
         <span class="coach-chip ok">Hit ${hits}</span>
         <span class="coach-chip miss">Miss ${misses}</span>
         ${s.extras ? `<span class="coach-chip dim">Extra strums ${s.extras}</span>` : ''}
       </div>
       ${biasLine}
       ${bestLine}
       <div class="coach-crit-note">${escHtml(advice)}</div>
       <div class="coach-actions">
         <button type="button" class="${rec === 'down' ? 'coach-start' : 'tp-btn'}" onclick="srAgain(-10)">&#x2B07; &minus;10 BPM</button>
         <button type="button" class="${rec === 'same' ? 'coach-start' : 'tp-btn'}" onclick="srAgain(0)">&#x21BB; Again at ${s.bpm}</button>
         <button type="button" class="${rec === 'up' ? 'coach-start' : 'tp-btn'}" onclick="srAgain(10)">&#x2B06; +10 BPM</button>
       </div>
       <button type="button" class="tp-btn" onclick="srSetup()">Change pattern</button>
     </div>`;
}

function srAgain(d){
  if (!sr) return;
  sr.bpm = Math.min(SR_BPM_MAX, Math.max(SR_BPM_MIN, sr.bpm + d));
  try { sessionStorage.setItem('srBpm', String(sr.bpm)); } catch(e){}
  sr.phase = 'setup';
  srStart();
}
