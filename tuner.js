/* ════════════════════════════════════════════════════════════════════
   Guitar Class — TUNER  (split out of app.js for maintainability)

   Chromatic tuner: Web Audio FFT → Harmonic Product Spectrum for a coarse
   pitch, refined by YIN, then smoothed. Loaded as a plain <script> AFTER
   app.js; all functions are global, so the onclick handlers in index.html
   and closePopup() in app.js find them at event time regardless of order.
   ════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   TUNER — HPS via Web Audio FFT + YIN smoothing
   ══════════════════════════════════════════════ */
// i18n.js loads before this file — sets text + the data-i18n key together so
// a later pure language switch (no tuner-state change) still finds it.
// translate="no" is set directly here (not left for the next setLang() call)
// since this fires many times a second while listening — an unmarked span
// mid-stream is a window Google Translate could grab if it re-scans the page.
function setToolText(el, key){ if(!el) return; el.textContent = t(key); el.setAttribute('data-i18n', key); el.setAttribute('translate','no'); el.classList.add('notranslate'); }
const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const STRING_TARGETS = { 'E2': 82.41, 'A2': 110.00, 'D3': 146.83, 'G3': 196.00, 'B3': 246.94, 'E4': 329.63 };
let tunerRunning = false, tunerStream = null, tunerCtx = null,
    tunerAnalyser = null, tunerFreqAnalyser = null, tunerRaf = null, tunerLoopTimeout = null,
    tunerHP = null, tunerLP = null,
    tunerLastNote = null, tunerSameNoteCount = 0, tunerSilenceCount = 0, tunerSmoothedFreq = 0,
    tunerTargetString = 'auto', tunerStartToken = 0,
    tunerShownCents = null, tunerInTune = false;

/* Anti-jitter layer: a short rolling-median window sits between the raw
   per-frame detections and the smoothing/display code. A single bogus frame
   (octave error, between-pluck noise) can never reach the needle — the
   median ignores it. A genuinely NEW note (several consecutive far-away
   readings) resets the window so the display still responds fast. */
/* Two-tier volume gate: YIN has its own internal quality bar (the dip
   threshold), so it can safely listen at a lower level — that's what picks
   up the quiet high strings (B, high e) without a hard pluck. HPS has no
   quality bar and will hallucinate a pitch from room noise, so it stays
   gated harder. */
const TUNER_RMS_GATE_YIN = 0.002;  // quiet decaying high strings still register
const TUNER_RMS_GATE_YIN_E4 = 0.001;  // high e is the thinnest string — needs an even lower bar than the other strings, safe because the string lock (±2 semitones of 329.63Hz) rejects stray noise that slips through
const TUNER_RMS_GATE_HPS = 0.006;  // noise-hallucination guard for HPS
const TUNER_WINDOW   = 5;       // median window (frames, ~60ms apart)
const TUNER_JUMP     = 1 / 12;  // "far away" = more than one semitone (log2)
let tunerFreqWindow = [], tunerJumpCount = 0;

function tunerMedian(arr) {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}
// Push one raw detection; returns the median-stabilised frequency to use,
// or -1 while a suspected outlier / not-yet-confirmed new note settles.
function tunerStabilise(freq) {
  if (tunerFreqWindow.length) {
    const med = tunerMedian(tunerFreqWindow);
    if (Math.abs(Math.log2(freq / med)) > TUNER_JUMP) {
      // Far from the recent consensus: outlier, or a new note starting.
      tunerJumpCount++;
      if (tunerJumpCount >= 3) {         // three agreeing frames = real new note
        tunerFreqWindow = [freq];
        tunerJumpCount = 0;
        return freq;
      }
      return -1;                          // lone outlier — swallow it
    }
  }
  tunerJumpCount = 0;
  tunerFreqWindow.push(freq);
  if (tunerFreqWindow.length > TUNER_WINDOW) tunerFreqWindow.shift();
  return tunerMedian(tunerFreqWindow);
}
function tunerResetSmoothing() {
  tunerSmoothedFreq = 0; tunerSameNoteCount = 0; tunerSilenceCount = 0; tunerLastNote = null;
  tunerFreqWindow = []; tunerJumpCount = 0;
  tunerShownCents = null; tunerInTune = false;
}

function selectTunerString(s) {
  tunerTargetString = s;
  const noteEl = document.getElementById('tuner-note');
  if (noteEl) noteEl.classList.remove('in-tune', 'in-tune-pop');
  document.querySelectorAll('#tuner-strings .ts-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.string === s);
  });
  tunerResetSmoothing();
}

function freqToNoteInfo(freq) {
  const n    = Math.round(12 * Math.log2(freq / 440)) + 69;
  const name = NOTES[((n % 12) + 12) % 12];
  const exact = 440 * Math.pow(2, (n - 69) / 12);
  const cents = Math.round(1200 * Math.log2(freq / exact));
  return { name, cents, hz: Math.round(freq * 10) / 10 };
}

// YIN pitch detection — accurate and fast on time-domain data.
// Works well on low strings because it finds the true period directly.
// The difference-function buffer is reused across calls (no per-frame GC).
let tunerYinD = null;
function detectPitchYIN(buf, sampleRate, minRms) {
  const W = buf.length;
  const half = Math.floor(W / 2);
  // Lags longer than sampleRate/60 can only yield frequencies below 60 Hz,
  // which the final range check rejects anyway (low E is ~82 Hz) — capping
  // here cuts the scan ~5× with no accuracy loss (coach.js caps the same way).
  const maxTau = Math.min(half, Math.ceil(sampleRate / 60));

  // Silence check (lowered so sustained/decaying notes still register;
  // caller passes a lower bar still when locked to high e — see TUNER_RMS_GATE_YIN_E4)
  let rms = 0;
  for (let i = 0; i < W; i++) rms += buf[i] * buf[i];
  if (Math.sqrt(rms / W) < (minRms ?? 0.002)) return -1;

  // YIN difference function
  if (!tunerYinD || tunerYinD.length < maxTau) tunerYinD = new Float32Array(maxTau);
  const d = tunerYinD;
  d[0] = 1;
  let runSum = 0;
  for (let tau = 1; tau < maxTau; tau++) {
    let s = 0;
    for (let i = 0; i < half; i++) {
      const diff = buf[i] - buf[i + tau];
      s += diff * diff;
    }
    d[tau] = s;
    runSum += s;
    d[tau] *= tau / runSum;
  }

  // Find first dip below threshold. 0.22 is deliberately permissive so quiet
  // high-string plucks (whose dips are shallower against the noise floor)
  // still qualify — the rolling median + note-stability layers downstream
  // discard whatever marginal detections slip through.
  const threshold = 0.22;
  for (let tau = 2; tau < maxTau; tau++) {
    if (d[tau] < threshold) {
      while (tau + 1 < maxTau && d[tau + 1] < d[tau]) tau++;
      // Parabolic interpolation for sub-sample accuracy
      const x0 = tau > 1 ? d[tau - 1] : d[tau];
      const x2 = tau < maxTau - 1 ? d[tau + 1] : d[tau];
      const refined = tau + (x2 - x0) / (2 * (2 * d[tau] - x0 - x2));
      const freq = sampleRate / refined;
      return (freq >= 60 && freq <= 1400) ? freq : -1;
    }
  }
  return -1;
}

// HPS via the Web Audio AnalyserNode FFT — fast because the browser does
// the FFT in native code. Multiplies downsampled magnitude spectra to pull
// out the true fundamental even when harmonics dominate (common on low strings).
function detectPitchHPS(freqData, sampleRate, fftSize) {
  const binHz = sampleRate / fftSize;
  const binMin = Math.max(1, Math.floor(60 / binHz));
  const binMax = Math.ceil(1400 / binHz);
  const numHarmonics = 5;

  // Search the FULL fundamental range (up to binMax, i.e. 1400Hz — needed to
  // reach high e at 329.63Hz). Dividing by numHarmonics here was redundant
  // with (and much stricter than) the per-harmonic `hk < freqData.length`
  // guard below, and capped the search at ~280Hz — below high e — so HPS
  // could never detect it directly and fell back on a subharmonic reading.
  let bestVal = -Infinity, bestBin = -1;
  for (let k = binMin; k <= Math.min(binMax, freqData.length - 1); k++) {
    let product = 1;
    for (let h = 1; h <= numHarmonics; h++) {
      const hk = Math.round(k * h);
      if (hk < freqData.length) {
        // freqData is dB; convert to linear magnitude
        product *= Math.pow(10, freqData[hk] / 20);
      }
    }
    if (product > bestVal) { bestVal = product; bestBin = k; }
  }
  if (bestBin < binMin) return -1;

  // Parabolic interpolation
  const prev = bestBin > 0 ? Math.pow(10, freqData[bestBin - 1] / 20) : 0;
  const curr = Math.pow(10, freqData[bestBin] / 20);
  const next = bestBin < freqData.length - 1 ? Math.pow(10, freqData[bestBin + 1] / 20) : 0;
  const denom = prev - 2 * curr + next;
  // Clamp the offset to ±0.5 bins — the only range parabolic interpolation
  // between three adjacent bins can validly land in. bestBin comes from the HPS
  // product but prev/curr/next are read off the raw spectrum, so when the raw
  // spectrum has no clean local peak there the denominator nears zero and the
  // offset lands bins away, reporting a nonsense pitch that still passes the
  // 60–1400Hz range check below.
  const offset = denom !== 0 ? Math.max(-0.5, Math.min(0.5, -0.5 * (next - prev) / denom)) : 0;
  const refined = bestBin + offset;
  const freq = refined * binHz;
  return (freq >= 60 && freq <= 1400) ? freq : -1;
}

// Analysis buffers reused every frame — allocating them per frame caused
// steady GC churn at ~16 fps (coach.js reuses coachFrameBuf for the same
// reason). Lazily (re)sized so an analyser config change can't break them.
let tunerTimeBuf = null, tunerFreqBuf = null;
function tunerLoop() {
  if (!tunerRunning) return;

  // Get time-domain data for YIN
  if (!tunerTimeBuf || tunerTimeBuf.length !== tunerAnalyser.fftSize) tunerTimeBuf = new Float32Array(tunerAnalyser.fftSize);
  const timeBuf = tunerTimeBuf;
  tunerAnalyser.getFloatTimeDomainData(timeBuf);

  // Volume gate BEFORE the detectors: between plucks the HPS would otherwise
  // happily report a "pitch" from room noise — the single biggest jitter source.
  let rmsSum = 0;
  for (let i = 0; i < timeBuf.length; i++) rmsSum += timeBuf[i] * timeBuf[i];
  const rms = Math.sqrt(rmsSum / timeBuf.length);

  // Get frequency-domain data for HPS
  if (!tunerFreqBuf || tunerFreqBuf.length !== tunerFreqAnalyser.frequencyBinCount) tunerFreqBuf = new Float32Array(tunerFreqAnalyser.frequencyBinCount);
  const freqBuf = tunerFreqBuf;
  tunerFreqAnalyser.getFloatFrequencyData(freqBuf);

  // Run both detectors; prefer HPS for low strings, YIN as fallback.
  // In the quiet zone (0.003–0.006 RMS) only YIN listens — that's where the
  // softly-plucked high strings live, and YIN's dip threshold keeps it honest.
  // Locked to high e specifically, drop the bar further still — it's the
  // thinnest string and the quietest pluck of the six, so it needs the most
  // headroom; the ±2-semitone string lock (applied below) guards against the
  // extra noise sensitivity this invites.
  const yinGate = tunerTargetString === 'E4' ? TUNER_RMS_GATE_YIN_E4 : TUNER_RMS_GATE_YIN;
  const freqHPS = rms >= TUNER_RMS_GATE_HPS ? detectPitchHPS(freqBuf, tunerCtx.sampleRate, tunerFreqAnalyser.fftSize) : -1;
  const freqYIN = rms >= yinGate ? detectPitchYIN(timeBuf, tunerCtx.sampleRate, yinGate) : -1;

  // Pick the best candidate — if both fire, prefer HPS; if HPS misses, use YIN
  let freq = -1;
  if (freqHPS > 0 && freqYIN > 0) {
    // They agree within a semitone — use HPS (more precise via interpolation)
    freq = Math.abs(Math.log2(freqHPS / freqYIN)) < (1/12) ? freqHPS : freqYIN;
  } else if (freqHPS > 0) {
    freq = freqHPS;
  } else if (freqYIN > 0) {
    freq = freqYIN;
  }

  // Per-string lock: reject pitches outside ±2 semitones of the target string,
  // and snap octave errors (common on low E/A) toward the target.
  if (freq > 0 && tunerTargetString !== 'auto') {
    const target = STRING_TARGETS[tunerTargetString];
    // Try the detected freq and its ±1 octave neighbours; keep whichever is closest to target.
    const candidates = [freq, freq * 2, freq / 2];
    let best = freq, bestDist = Math.abs(Math.log2(freq / target));
    for (const c of candidates) {
      const d = Math.abs(Math.log2(c / target));
      if (d < bestDist) { best = c; bestDist = d; }
    }
    // Reject if still further than 2 semitones from target.
    freq = bestDist < (2 / 12) ? best : -1;
  }

  const noteEl   = document.getElementById('tuner-note');
  const freqEl   = document.getElementById('tuner-freq');
  const needle   = document.getElementById('tuner-needle');
  const statusEl = document.getElementById('tuner-status');

  // Median-stabilise: lone outlier frames are swallowed here; a real new
  // note (3 consecutive far readings) resets the window and passes through.
  if (freq > 0) {
    const beforeReset = tunerFreqWindow.length;
    freq = tunerStabilise(freq);
    if (freq > 0 && tunerFreqWindow.length === 1 && beforeReset > 1) {
      tunerSmoothedFreq = 0;   // window was reset — new note, restart the EMA too
    }
  }

  if (freq > 0) {
    // Gentle smoothing on top of the median (the median already killed outliers,
    // so this only has to iron out sub-cent wobble).
    if (tunerSmoothedFreq > 0) {
      tunerSmoothedFreq = tunerSmoothedFreq * 0.75 + freq * 0.25;
    } else {
      tunerSmoothedFreq = freq;
    }

    // In string-locked mode, compute cents directly from the target so the
    // displayed note never flickers between neighbours.
    let displayName, displayCents, displayHz;
    if (tunerTargetString !== 'auto') {
      const target = STRING_TARGETS[tunerTargetString];
      displayName = tunerTargetString.replace(/\d/, '');
      displayCents = Math.round(1200 * Math.log2(tunerSmoothedFreq / target));
      displayHz = Math.round(tunerSmoothedFreq * 10) / 10;
    } else {
      const info = freqToNoteInfo(tunerSmoothedFreq);
      displayName = info.name; displayCents = info.cents; displayHz = info.hz;
    }

    // Require 2 consecutive frames on the same note name before switching the
    // display (auto mode) so the readout can't flicker between neighbours.
    // Kept separate from the silence countdown below — sharing one counter
    // meant a silent gap left this negative, so a re-plucked string had to
    // climb back up from a deficit before it re-locked (~0.45s of extra lag).
    // Counts frames seen on this name INCLUDING the one that introduced it, so
    // the >= 2 gate below is genuinely 2 frames. Starting at 0 made it 3.
    if (displayName === tunerLastNote) { tunerSameNoteCount++; }
    else { tunerLastNote = displayName; tunerSameNoteCount = 1; }
    tunerSilenceCount = 0;   // a valid reading arrived — silence countdown resets

    if (tunerSameNoteCount >= 2 || tunerTargetString !== 'auto') {
      noteEl.textContent = displayName;
      freqEl.textContent = displayHz + ' Hz';
      // Needle hysteresis: ignore sub-2-cent wiggle so the needle settles
      // instead of trembling (the CSS transition smooths what remains).
      const clamped = Math.max(-50, Math.min(50, displayCents));
      if (tunerShownCents === null || Math.abs(clamped - tunerShownCents) >= 2 ||
          (clamped === 0 && tunerShownCents !== 0)) {
        tunerShownCents = clamped;
        needle.style.left = (50 + clamped) + '%';
      }
      // Sticky in-tune band: enter green inside ±8 cents, only leave it
      // outside ±11 — hovering on the boundary no longer flickers the verdict.
      const shown = tunerShownCents;
      if (tunerInTune ? Math.abs(shown) <= 11 : Math.abs(shown) < 8) {
        if (!tunerInTune) flashClass(noteEl, 'in-tune-pop', 500);   // just locked in — little pop
        tunerInTune = true;
        noteEl.classList.add('in-tune');
        needle.style.background = 'var(--green-text)';
        setToolText(statusEl, 'tools.inTuneStatus'); statusEl.className = 'tuner-status in-tune';
      } else if (shown > 0) {
        tunerInTune = false;
        noteEl.classList.remove('in-tune', 'in-tune-pop');
        needle.style.background = 'var(--amber-text)';
        setToolText(statusEl, 'tools.tooHighSharp'); statusEl.className = 'tuner-status sharp';
      } else {
        tunerInTune = false;
        noteEl.classList.remove('in-tune', 'in-tune-pop');
        needle.style.background = 'var(--blue-text)';
        setToolText(statusEl, 'tools.tooLowFlat'); statusEl.className = 'tuner-status flat';
      }
    }
  } else {
    // No pitch this frame — keep the last reading briefly; only clear on sustained silence.
    tunerSilenceCount++;
    if (tunerSilenceCount > 8) {
      tunerResetSmoothing();
      noteEl.classList.remove('in-tune', 'in-tune-pop');
      noteEl.textContent = '—'; setToolText(freqEl, 'tools.playAString');
      needle.style.left = '50%'; needle.style.background = 'var(--border2)';
      statusEl.textContent = ''; statusEl.removeAttribute('data-i18n'); statusEl.className = 'tuner-status';
    }
  }
  /* Tracked so stopTuner can cancel it — an uncancelled timeout surviving a
     fast close-reopen would start a second loop alongside the new one. */
  tunerLoopTimeout = setTimeout(() => { tunerRaf = requestAnimationFrame(tunerLoop); }, 60);
}

async function startTuner() {
  // Closing the popup while getUserMedia is still pending must not leave a
  // live mic stream orphaned. Each call claims a token; stopTuner() bumps it,
  // so a stream that resolves after close is recognised as stale below and
  // stopped immediately instead of being wired up into a "closed" tuner.
  const myStartToken = ++tunerStartToken;
  // One mic owner at a time: a 90-second self-recording in progress stops here
  // rather than running alongside the tuner. Guarded — stopAnyRec lives in
  // app.js, which journey pages don't load.
  if (typeof stopAnyRec === 'function') stopAnyRec();
  try {
    // Disable browser audio processing that distorts low-frequency guitar signals
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      video: false
    });
    if (myStartToken !== tunerStartToken) {
      // Popup was closed (or reopened) while the mic permission prompt was
      // pending — this stream is stale, never got wired up. Stop it now.
      stream.getTracks().forEach(t => t.stop());
      return;
    }
    tunerStream = stream;
    tunerCtx = new (window.AudioContext || window.webkitAudioContext)();
    const src = tunerCtx.createMediaStreamSource(tunerStream);

    // Bandpass via highpass (kills sub-bass rumble / AC hum) into lowpass
    // (kills cymbal-like hiss and high inharmonic content). Restricts the
    // signal to the guitar's useful range before pitch detection.
    tunerHP = tunerCtx.createBiquadFilter();
    tunerHP.type = 'highpass'; tunerHP.frequency.value = 70;  tunerHP.Q.value = 0.7;
    tunerLP = tunerCtx.createBiquadFilter();
    tunerLP.type = 'lowpass';  tunerLP.frequency.value = 1500; tunerLP.Q.value = 0.7;

    // Time-domain analyser for YIN (large buffer = better low-freq resolution)
    tunerAnalyser = tunerCtx.createAnalyser();
    tunerAnalyser.fftSize = 8192;
    tunerAnalyser.smoothingTimeConstant = 0;

    // Frequency-domain analyser for HPS (separate node, same source)
    tunerFreqAnalyser = tunerCtx.createAnalyser();
    tunerFreqAnalyser.fftSize = 8192;
    tunerFreqAnalyser.smoothingTimeConstant = 0.5;

    src.connect(tunerHP);
    tunerHP.connect(tunerLP);
    tunerLP.connect(tunerAnalyser);
    tunerLP.connect(tunerFreqAnalyser);

    tunerRunning = true; tunerResetSmoothing();
    setToolText(document.getElementById('tuner-freq'), 'tools.listening');
    tunerLoop();
  } catch(e) {
    setToolText(document.getElementById('tuner-freq'), 'tools.micDenied');
  }
}

function stopTuner() {
  tunerStartToken++;   // invalidate any startTuner() call still awaiting getUserMedia
  tunerRunning = false;
  if (tunerLoopTimeout){ clearTimeout(tunerLoopTimeout); tunerLoopTimeout = null; }
  if (tunerRaf)    cancelAnimationFrame(tunerRaf);
  if (tunerStream) tunerStream.getTracks().forEach(t => t.stop());
  if (tunerCtx)    tunerCtx.close();
  tunerStream = null; tunerCtx = null; tunerAnalyser = null; tunerFreqAnalyser = null;
  tunerHP = null; tunerLP = null;
  tunerResetSmoothing();
  const noteEl = document.getElementById('tuner-note');
  const freqEl = document.getElementById('tuner-freq');
  const needle = document.getElementById('tuner-needle');
  const statusEl = document.getElementById('tuner-status');
  if (noteEl)   { noteEl.textContent = '—'; noteEl.classList.remove('in-tune', 'in-tune-pop'); }
  if (freqEl)   setToolText(freqEl, 'tools.playAString');
  if (needle)   { needle.style.left = '50%'; needle.style.background = 'var(--border2)'; }
  if (statusEl) { statusEl.textContent = ''; statusEl.removeAttribute('data-i18n'); statusEl.className = 'tuner-status'; }
}

/* No Start/Stop button — opening the tuner popup starts listening, closing it
   stops (wired in app.js togglePopup/closePopup). */

/* Privacy + battery: the mic never keeps running in a tab the student isn't
   looking at. Lives HERE (not just in coach.js's visibilitychange handler,
   which only index.html loads) so the six Journey pages get it too. Goes
   through closePopup — the normal stop path — so the popup slides shut and
   the readout resets exactly as a manual close would. Idempotent: on
   index.html coach.js's handler may also run (coachEvictTuner), but whichever
   fires second sees tunerRunning already false and does nothing. */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden || !tunerRunning) return;
  if (typeof closePopup === 'function') closePopup('tuner');
  else stopTuner();   // fab-tools.js missing (shouldn't happen) — still drop the mic
});
