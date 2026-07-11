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
const COACH_ONSET_REFRACT = 140;    // ms — one strum = one onset, not six
const COACH_EVENT_TAIL    = 240;    // ms of pitch readings collected after an onset
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
      ? `${names} — strum on every click, 4 beats each chord, twice through`
      : `${names} — one strum on every click`;
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
    desc = `${slots.length} notes: ${preview}${slots.length > 10 ? '…' : ''} — one note per click`;
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
    smoothRms: 0, lastOnsetT: -1e9
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
     <div class="coach-tip">&#x1F92B; Works best somewhere quiet, guitar close to the mic. You&rsquo;ll hear 4 count-in clicks, then play one ${noun} per click.</div>
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
  coach.gridOffset = 0; coach.smoothRms = 0; coach.lastOnsetT = -1e9;
  coach.lastPulse = -1; coach.frameNo = 0;

  /* Count-in: 4 clicks, last one higher = "go". */
  coach.phase = 'countin';
  coachBody().innerHTML = `<div class="coach-count" id="coach-count">&nbsp;</div>`;
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
                   fretRunning || (cc && cc.micOn);
    if (!active) coachMicOff();
  }, 0);
}

/* One analyser read per frame, shared by all three loops (they're mutually
   exclusive). Reuses a single buffer — a fresh 16KB Float32Array per rAF
   frame is real GC pressure on a Chromebook. Returns the RMS of the newest
   ~21ms; the samples stay in coachFrameBuf for the pitch detector. */
function coachReadFrame(){
  coachAnalyser.getFloatTimeDomainData(coachFrameBuf);
  const N = 1024;
  let sum = 0;
  for (let i = coachFrameBuf.length - N; i < coachFrameBuf.length; i++) sum += coachFrameBuf[i] * coachFrameBuf[i];
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
     ${coachStripHtml()}
     <button type="button" class="tp-btn coach-stop" onclick="coachFinish()">&#x25A0; I&rsquo;m done</button>`;
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

  // Nothing to hear during the count-in — skip the audio work entirely.
  if (coach.phase !== 'listening'){
    coachRaf = requestAnimationFrame(coachLoop);
    return;
  }
  const now = performance.now();
  const rms = coachReadFrame();
  const buf = coachFrameBuf;

  {
    /* Onset: a fast jump over the smoothed level, past an absolute floor,
       outside the refractory window. */
    if (rms > COACH_ONSET_FLOOR &&
        rms > coach.smoothRms * COACH_ONSET_RATIO &&
        now - coach.lastOnsetT > COACH_ONSET_REFRACT){
      coach.lastOnsetT = now;
      if (coach.pending) coachFinalizeEvent();
      coach.pending = { t: now, readings: [] };
    }
    coach.smoothRms = coach.smoothRms * 0.82 + rms * 0.18;

    /* Pitch readings (trimmed YIN ~ every 3rd frame) feed the pending event. */
    if (coach.pending && rms > COACH_PITCH_GATE && (coach.frameNo = (coach.frameNo || 0) + 1) % 3 === 0){
      const f = coachDetectPitch(buf, coachCtx.sampleRate);
      if (f > 0) coach.pending.readings.push(69 + 12 * Math.log2(f / 440));
    }
    if (coach.pending && now - coach.pending.t > COACH_EVENT_TAIL) coachFinalizeEvent();

    /* Beat pulse on the current slot. */
    const cur = Math.floor((now - coach.listenStart) / coach.beatMs);
    if (cur !== coach.lastPulse && cur >= 0 && cur < coach.slots.length){
      coach.lastPulse = cur;
      const prev = document.querySelector('.coach-chip.now');
      if (prev) prev.classList.remove('now');
      const el = document.getElementById('coach-chip-' + cur);
      if (el) el.classList.add('now');
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
  let midi = null;
  if (p.readings.length >= 2) midi = Math.round(tunerMedian(p.readings));
  const ev = { t: p.t, midi, devMs: null, slot: -1 };
  coach.events.push(ev);
  coachMatchEvent(ev);
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
    const classOk = ev.midi != null && s.classes.indexOf(((ev.midi % 12) + 12) % 12) >= 0;
    const score = Math.abs(dev) + (classOk ? 0 : coach.beatMs * 0.6);
    if (score < bestScore){ bestScore = score; best = i; }
  }
  if (best < 0) return;   // unmatched onset — an extra strum between beats
  const s = coach.slots[best];
  const dev = rel - best * coach.beatMs;
  ev.devMs = dev; ev.slot = best;
  if (ev.midi == null) s.state = 'dim';                 // heard it, pitch unclear
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
      `<div class="coach-note">&#x1F914; I couldn&rsquo;t hear that clearly — try again somewhere quieter, with the guitar closer to the mic, and give each ${coach.mode === 'chords' ? 'strum' : 'note'} a confident pluck.</div>
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
  else if (greats >= 2)             overall = '&#x1F4AA; Strong run — look what’s already green.';
  else                              overall = '&#x1F3B8; Good rep — every check makes the next one better.';

  /* Streak: a "clear" = perfect pitch score and nothing at Needs work. */
  const clear = crits[0].level === 3 && applicable.every(c => c.level >= 2);
  let streak = 0;
  try {
    streak = clear ? (parseInt(sessionStorage.getItem(coach.streakKey), 10) || 0) + 1 : 0;
    sessionStorage.setItem(coach.streakKey, String(streak));
  } catch(e){}
  const streakHtml = streak >= 3
    ? `<div class="coach-streak">&#x1F525; That&rsquo;s ${streak} clean runs in a row — this one&rsquo;s yours.</div>` : '';

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
    return { name, icon, level: 2, sentence: 'I heard the strums but couldn’t make out the pitches clearly — I mostly scored your timing this round, so treat the beat feedback as the real news.' };
  }
  const denom = Math.max(1, judged.length + slots.filter(s => s.state === 'miss').length);
  const r = good / denom;
  const total = slots.length;
  let level, sentence;
  const firstWrong = slots.find(s => s.state === 'wrong');
  /* A clearly-wrong note caps the score at level 2 — on a short drill one
     clunker can still leave the ratio above the "Great" bar. */
  if (r >= 0.85 && !firstWrong){
    level = 3;
    sentence = coach.mode === 'chords'
      ? `The chord tones rang true on ${good} of ${total} beats — that’s the sound we want.`
      : `Nailed ${good} of ${total} notes` + (octs ? ` (${octs} came out an octave off, which still counts).` : ' — clean run!');
  } else if (r >= 0.55){
    level = 2;
    if (firstWrong && coach.mode === 'melody'){
      const idx = slots.indexOf(firstWrong);
      sentence = `You hit ${good} of ${total} — your ${ordinal(idx + 1)} note came out ${coachNoteName(firstWrong.hit.midi)} instead of ${firstWrong.label}; slow down just for that spot.`;
    } else {
      sentence = `About ${good} of ${total} beats sounded right — you’re close; keep your eyes on the fretting hand at the tricky spot.`;
    }
  } else {
    level = 1;
    sentence = coach.mode === 'chords'
      ? `The chord sound wasn’t coming through yet — check each finger is on its tip, then strum slow and let it ring.`
      : `I only caught ${good} of ${total} notes landing — drop the BPM way down and say each note name as you play it.`;
  }
  return { name, icon, level, sentence };
}

/* ── Criterion 2: On the beat ── */
function coachScoreTiming(){
  const name = 'On the beat', icon = '&#x1F941;';
  const devs = coach.slots.filter(s => s.hit && s.hit.devMs != null).map(s => s.hit.devMs);
  if (devs.length < 3) return { name, icon, level: 1, sentence: 'Not enough hits landed to judge the beat — try again and play one hit per click, even if it’s messy.' };
  const onMs = Math.max(70, coach.beatMs * 0.12), closeMs = onMs * 2;
  const on = devs.filter(d => Math.abs(d) <= onMs).length;
  const close = devs.filter(d => Math.abs(d) <= closeMs).length;
  const mean = devs.reduce((a, b) => a + b, 0) / devs.length;
  const lean = Math.abs(mean) < onMs * 0.6 ? '' : (mean < 0 ? 'early' : 'late');
  let level, sentence;
  if (on / devs.length >= 0.75){
    level = 3; sentence = `Locked in — ${on} of ${devs.length} hits landed right on the click.`;
  } else if (close / devs.length >= 0.6){
    level = 2;
    sentence = lean
      ? `You’re a touch ${lean} on average — let the click sound first, then play with it, not at it.`
      : `Most hits were close to the click but scattered — count “1-2-3-4” out loud and it’ll tighten up.`;
  } else {
    level = 1; sentence = 'The hits and the clicks weren’t lining up yet — drop the BPM, tap your foot, and make the foot and the pick move together.';
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
  if (ts.length < 6) return { name, icon, level: 2, sentence: 'Too short a run to judge tempo drift — do a longer take and this line gets real.' };
  const iois = [];
  for (let i = 1; i < ts.length; i++) iois.push(ts[i] - ts[i - 1]);
  const med = tunerMedian(iois);
  if (!(med > 0)) return { name, icon, level: 2, sentence: 'I couldn’t get a clean tempo read on that take — try again with one confident hit per click.' };
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
  if (!b1 || !b2 || !bAll) return { name, icon, level: 2, sentence: 'I couldn’t get a clean tempo read on that take — try again with one confident hit per click.' };
  const drift = Math.abs(b2 - b1) / coach.bpm;
  let level, sentence;
  if (drift <= 0.07){
    level = 3; sentence = `You held ~${Math.round(bAll)} BPM steady the whole way through.`;
  } else if (drift <= 0.15){
    level = 2;
    sentence = `You ${b2 > b1 ? 'sped up' : 'slowed down'} a little (~${Math.round(b1)} to ~${Math.round(b2)} BPM) — totally normal; keep the count going in your head after the clicks stop.`;
  } else {
    level = 1;
    sentence = `The tempo ${b2 > b1 ? 'ran away — you went' : 'sagged — you went'} from ~${Math.round(b1)} to ~${Math.round(b2)} BPM. Rushing is normal! Tap your foot and let IT be the boss.`;
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
  if (!bounds.length) return { name, icon, level: 0, sentence: 'Only one chord here — no changes to judge. Solid strumming is the whole game on this one.' };
  const closeMs = Math.max(140, coach.beatMs * 0.24);
  const onTime = bounds.filter(s => s.hit && Math.abs(s.hit.devMs) <= closeMs && s.state !== 'wrong');
  const late = bounds.find(s => !(s.hit && Math.abs(s.hit.devMs) <= closeMs && s.state !== 'wrong'));
  const r = onTime.length / bounds.length;
  let level, sentence;
  if (r >= 0.85){
    level = 3; sentence = `All ${bounds.length === 1 ? '' : bounds.length + ' '}changes landed on time — the switch isn’t costing you the beat anymore.`;
  } else if (r >= 0.5){
    level = 2;
    sentence = `${onTime.length} of ${bounds.length} changes landed on time — the switch to ${late ? late.chordName : 'the next chord'} is the one to drill by itself.`;
  } else {
    level = 1;
    sentence = 'The changes came in late — practice just the switch: four slow beats on each chord, and start moving your fingers on beat 4.';
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
    level = 3; sentence = 'Start to finish with no stalls — that’s how you build real songs.';
  } else if (coverage >= 0.65 && tailMiss <= 2){
    level = 2;
    const gapAt = hitIdx.find((v, k) => k > 0 && v - hitIdx[k - 1] - 1 >= 2);
    sentence = gapAt != null
      ? `You got through most of it — there was a pause around beat ${gapAt + 1}; that’s the spot to loop on its own.`
      : 'You got through most of it — a couple of hits went missing, but the run kept moving. Keep that momentum.';
  } else {
    level = 1;
    sentence = tailMiss > 2
      ? 'The run stopped partway — shrink the chunk: just the first few, clean, then add one more each time.'
      : 'Lots of gaps in that run — slower and unbroken beats faster and choppy, every time.';
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
             (d > 0 ? 'up (toward the body)' : 'down (toward the headstock)') + '.';
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
    const msg = score >= 9 ? 'Fretboard on lock. Move up a level!'
              : score >= 6 ? 'Solid — the map is forming.'
              : 'Every hunt teaches the neck a little more — go again.';
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

function toggleGames(){
  const p = document.getElementById('games-panel');
  const btn = document.getElementById('games-btn');
  if (!p) return;
  const open = p.hasAttribute('hidden');
  if (open){
    if (typeof closeTopPanels === 'function') closeTopPanels('games');
    p.removeAttribute('hidden'); gamesShow('hub');
  }
  else gamesClosePanel();
  if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function gamesClosePanel(){
  gamesStopMic();
  const p = document.getElementById('games-panel');
  if (p){ p.setAttribute('hidden', ''); p.innerHTML = ''; }
  const btn = document.getElementById('games-btn');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}

/* Stops whichever game holds the mic. Called by app.js when the tuner
   opens, and by coachStartCheck when a Coach check starts. A stopped game
   view is a dead UI (it says "listening" but the mic is gone), so the
   panel falls back to the hub. */
function gamesStopMic(){
  fretStop();
  ccStop();
  const p = document.getElementById('games-panel');
  if (p && !p.hasAttribute('hidden') &&
      (document.getElementById('fret-body') || document.getElementById('cc-body'))){
    gamesRenderHub(p);
  }
}

function gamesHeadHtml(title, inGame){
  return `<div class="daily5-head"><span>${title}</span><span class="games-head-actions">` +
    (inGame ? `<button type="button" class="games-back" onclick="gamesShow('hub')">&#x2190; All games</button>` : '') +
    `<button type="button" class="tp-close" onclick="gamesClosePanel()" aria-label="Close games">&#x2715;</button></span></div>`;
}

function gamesRenderHub(p){
  p.innerHTML = gamesHeadHtml('&#x1F3AE; Games — your guitar is the controller', false) +
    `<div class="games-grid">
       <button type="button" class="games-card" onclick="gamesShow('fret')">
         <span class="games-card-ico">&#x1F3AF;</span>
         <span class="games-card-title">Note Hunt</span>
         <span class="games-card-desc">Find named notes on the fretboard — the mic checks you. Five levels, from open strings to all six.</span>
       </button>
       <button type="button" class="games-card" onclick="gamesShow('cc')">
         <span class="games-card-ico">&#x1F501;</span>
         <span class="games-card-title">Change Up</span>
         <span class="games-card-desc">Chord changes on the clock. Two chords back and forth, then three, then four — and push the tempo up.</span>
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

function ccDiagramsHtml(chords, curName){
  if (typeof localChordSvg !== 'function') return '';
  const boxes = chords.map(n => {
    const svg = localChordSvg(n);
    if (!svg) return '';
    return `<div class="chord-box cc-dia${n === curName ? ' cur' : ''}" id="cc-dia-${escAttr(n)}">${svg}<div class="chord-box-label">${escHtml(n)}</div></div>`;
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
     <div class="coach-tip">&#x1F92B; Quiet room, guitar close to the mic. 4 count-in clicks, then <strong>strum on every beat</strong> — the chord switches each bar, and beat 1 of the new bar is what I&rsquo;m grading. The pulse is silent: watch the beat dots.</div>
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
  cc.smoothRms = 0; cc.lastOnsetT = -1e9; cc.gridOffset = 0; cc.lastBeat = -1; cc.frameNo = 0;
  cc.phase = 'countin';
  ccBody().innerHTML = `<div class="coach-count" id="cc-count">&nbsp;</div>`;
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
     <div class="coach-live"><span class="coach-live-dot"></span>Strum every beat — the pulse is the dots</div>
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
  if (p.readings.length >= 2){
    const cls = ((Math.round(tunerMedian(p.readings)) % 12) + 12) % 12;
    toneOk = cc.classes[ch.to].indexOf(cls) >= 0;
  }
  ch.result = toneOk === false ? 'off' : 'ok';    // percussive/unclear counts on timing alone
  ccChipRefresh(cc.changes.indexOf(ch));
}

function ccLoop(){
  if (!cc) return;
  if (!coachAnalyser || !ccBody()){ ccStop(); return; }  // mic taken or panel closed under us
  const now = performance.now();
  if (cc.phase === 'play'){
    const rms = coachReadFrame();
    const buf = coachFrameBuf;

    /* Onset = strum (same detector as the Coach). */
    if (rms > COACH_ONSET_FLOOR &&
        rms > cc.smoothRms * COACH_ONSET_RATIO &&
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

    /* Feed pitch readings to an open change-check, then resolve it. */
    const open = cc.changes.find(c => c.pend);
    if (open){
      if (rms > COACH_PITCH_GATE && (cc.frameNo = (cc.frameNo || 0) + 1) % 3 === 0){
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

    const cur = Math.floor((now - cc.listenStart) / cc.beatMs);
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
    verdict = '&#x1F31F; ' + ok + ' of ' + total + ' changes on time — that tempo is yours.';
    advice = 'Level up: take it 10 BPM faster.';
    try {
      const k = ccBestKey(prog);
      const best = parseInt(sessionStorage.getItem(k), 10) || 0;
      if (cc.bpm > best) sessionStorage.setItem(k, String(cc.bpm));
    } catch(e){}
  } else if (r >= 0.5){
    verdict = '&#x1F4AA; ' + ok + ' of ' + total + ' changes landed' + (off ? ' (' + off + ' arrived on time but rang rough)' : '') + '.';
    advice = worst ? ('Drill just ' + worst + ' — start moving your fingers on beat 4.') : 'Run it again at this tempo and lock it in.';
  } else {
    verdict = '&#x1F3B8; ' + ok + ' of ' + total + ' — this tempo is a stretch right now.';
    advice = 'No shame in it: drop 10 BPM, and slow + clean beats fast + choppy every time.';
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
