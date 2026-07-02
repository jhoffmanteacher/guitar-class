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
const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const STRING_TARGETS = { 'E2': 82.41, 'A2': 110.00, 'D3': 146.83, 'G3': 196.00, 'B3': 246.94, 'E4': 329.63 };
let tunerRunning = false, tunerStream = null, tunerCtx = null,
    tunerAnalyser = null, tunerFreqAnalyser = null, tunerRaf = null,
    tunerHP = null, tunerLP = null,
    tunerLastNote = null, tunerStableCount = 0, tunerSmoothedFreq = 0,
    tunerTargetString = 'auto';

function selectTunerString(s) {
  tunerTargetString = s;
  document.querySelectorAll('#tuner-strings .ts-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.string === s);
  });
  tunerSmoothedFreq = 0; tunerStableCount = 0; tunerLastNote = null;
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
function detectPitchYIN(buf, sampleRate) {
  const W = buf.length;
  const half = Math.floor(W / 2);

  // Silence check (lowered so sustained/decaying notes still register)
  let rms = 0;
  for (let i = 0; i < W; i++) rms += buf[i] * buf[i];
  if (Math.sqrt(rms / W) < 0.004) return -1;

  // YIN difference function
  const d = new Float32Array(half);
  d[0] = 1;
  let runSum = 0;
  for (let tau = 1; tau < half; tau++) {
    let s = 0;
    for (let i = 0; i < half; i++) {
      const diff = buf[i] - buf[i + tau];
      s += diff * diff;
    }
    d[tau] = s;
    runSum += s;
    d[tau] *= tau / runSum;
  }

  // Find first dip below threshold (raised slightly to catch quieter pitches)
  const threshold = 0.15;
  for (let tau = 2; tau < half; tau++) {
    if (d[tau] < threshold) {
      while (tau + 1 < half && d[tau + 1] < d[tau]) tau++;
      // Parabolic interpolation for sub-sample accuracy
      const x0 = tau > 1 ? d[tau - 1] : d[tau];
      const x2 = tau < half - 1 ? d[tau + 1] : d[tau];
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

  let bestVal = -Infinity, bestBin = -1;
  for (let k = binMin; k <= Math.floor(binMax / numHarmonics); k++) {
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
  const refined = denom !== 0 ? bestBin - 0.5 * (next - prev) / denom : bestBin;
  const freq = refined * binHz;
  return (freq >= 60 && freq <= 1400) ? freq : -1;
}

function tunerLoop() {
  if (!tunerRunning) return;

  // Get time-domain data for YIN
  const timeBuf = new Float32Array(tunerAnalyser.fftSize);
  tunerAnalyser.getFloatTimeDomainData(timeBuf);

  // Get frequency-domain data for HPS
  const freqBuf = new Float32Array(tunerFreqAnalyser.frequencyBinCount);
  tunerFreqAnalyser.getFloatFrequencyData(freqBuf);

  // Run both detectors; prefer HPS for low strings, YIN as fallback
  const freqHPS = detectPitchHPS(freqBuf, tunerCtx.sampleRate, tunerFreqAnalyser.fftSize);
  const freqYIN = detectPitchYIN(timeBuf, tunerCtx.sampleRate);

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

  if (freq > 0) {
    // Adaptive smoothing: heavy when the new reading is near the smoothed value
    // (locked), fast when it jumps (new note played).
    if (tunerSmoothedFreq > 0) {
      const drift = Math.abs(Math.log2(freq / tunerSmoothedFreq));
      const a = drift < (1/12) ? 0.15 : 0.5;
      tunerSmoothedFreq = tunerSmoothedFreq * (1 - a) + freq * a;
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

    // Only require 1 consecutive frame on the same note before displaying.
    if (displayName === tunerLastNote) { tunerStableCount++; }
    else { tunerLastNote = displayName; tunerStableCount = 0; }

    if (tunerStableCount >= 1 || tunerTargetString !== 'auto') {
      noteEl.textContent = displayName;
      freqEl.textContent = displayHz + ' Hz';
      const clamped = Math.max(-50, Math.min(50, displayCents));
      needle.style.left = (50 + clamped) + '%';
      if (Math.abs(clamped) < 8) {
        needle.style.background = 'var(--green-text)';
        statusEl.textContent = 'In tune ✓'; statusEl.className = 'tuner-status in-tune';
      } else if (clamped > 0) {
        needle.style.background = 'var(--amber-text)';
        statusEl.textContent = 'Sharp — tune down'; statusEl.className = 'tuner-status sharp';
      } else {
        needle.style.background = 'var(--blue-text)';
        statusEl.textContent = 'Flat — tune up'; statusEl.className = 'tuner-status flat';
      }
    }
  } else {
    // No pitch this frame — keep the last reading briefly; only clear on sustained silence.
    tunerStableCount--;
    if (tunerStableCount < -8) {
      tunerStableCount = 0; tunerLastNote = null; tunerSmoothedFreq = 0;
      noteEl.textContent = '—'; freqEl.textContent = 'Play a string…';
      needle.style.left = '50%'; needle.style.background = 'var(--border2)';
      statusEl.textContent = ''; statusEl.className = 'tuner-status';
    }
  }
  setTimeout(() => { tunerRaf = requestAnimationFrame(tunerLoop); }, 60);
}

async function startTuner() {
  try {
    // Disable browser audio processing that distorts low-frequency guitar signals
    tunerStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      video: false
    });
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

    tunerRunning = true; tunerLastNote = null; tunerStableCount = 0; tunerSmoothedFreq = 0;
    document.getElementById('tuner-btn').innerHTML = '&#x23F9; Stop';
    document.getElementById('tuner-freq').textContent = 'Listening…';
    tunerLoop();
  } catch(e) {
    document.getElementById('tuner-freq').textContent = 'Mic access denied — check browser permissions';
  }
}

function stopTuner() {
  tunerRunning = false;
  if (tunerRaf)    cancelAnimationFrame(tunerRaf);
  if (tunerStream) tunerStream.getTracks().forEach(t => t.stop());
  if (tunerCtx)    tunerCtx.close();
  tunerStream = null; tunerCtx = null; tunerAnalyser = null; tunerFreqAnalyser = null;
  tunerHP = null; tunerLP = null;
  tunerLastNote = null; tunerStableCount = 0; tunerSmoothedFreq = 0;
  const noteEl = document.getElementById('tuner-note');
  const freqEl = document.getElementById('tuner-freq');
  const needle = document.getElementById('tuner-needle');
  const statusEl = document.getElementById('tuner-status');
  const btn = document.getElementById('tuner-btn');
  if (noteEl)   noteEl.textContent = '—';
  if (freqEl)   freqEl.textContent = 'Tap Start to listen';
  if (needle)   { needle.style.left = '50%'; needle.style.background = 'var(--border2)'; }
  if (statusEl) { statusEl.textContent = ''; statusEl.className = 'tuner-status'; }
  if (btn)      btn.innerHTML = '&#x25B6; Start';
}

function toggleTuner() { if (tunerRunning) stopTuner(); else startTuner(); }
