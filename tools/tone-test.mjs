#!/usr/bin/env node
/* tone-test.mjs — the pitch detectors against made-up tones, in about a second (2026-11-13).

     node tools/tone-test.mjs              one summary line per detector; exit 1 when a pin below no longer holds
     node tools/tone-test.mjs --verbose    also the time and worst cents per detector, every wrong or missed tone
     node tools/tone-test.mjs --measure    print today's numbers as pins (to re-pin after a DELIBERATE change)
     node tools/tone-test.mjs --root=DIR   test another site folder (a scratch copy with a planted fault)

   Part of tools/checks.mjs (1cx), which runs this file and fails the push when it fails. A regression guard, not a
   spec: the pins are what the detectors do TODAY (measured 2026-11-13) plus a small margin, so an accidental edit to
   the pitch code is caught at the next commit, on the Mac and on GitHub. The deep listening tests stay in
   tools/mic-sim/ (rooms, students, real classroom takes); this one only asks "does a clean tone still read as the
   note it is".

   What it loads: the REAL functions, cut out of the site's text the way tools/mic-sim/*.mjs do it (extract.mjs on
   the whole script from tools/site-src.mjs) and run in a vm:
     coach   coachDetectPitch from the arcade script (coach-core.js), with its own `let coachYinD` line. The site calls
             it on the newest COACH_FFT (4096) samples of the analyser, after COACH_MIC_GAIN; it reads the last 2,048
             (4,096 above 60 kHz) at the gate the caller passes (0.22 when none). Both sample rates a Chromebook mic
             runs at, 48,000 and 44,100 Hz, at the default gate.
     tuner   detectPitchYIN from tuner.js, with its `let tunerYinD` line, on an 8,192-sample buffer (its analyser's
             fftSize) at 48,000 Hz, with the site's TUNER_RMS_GATE_YIN as the silence bar. The tuner's second
             detector (detectPitchHPS) reads the browser's FFT, which Node does not have: not tested here.

   The tones: every guitar note from the low E (MIDI 40, 82.4 Hz) to the 12th fret of the high e (MIDI 76,
   659.3 Hz), 37 notes (the tuner: the six open strings, its job; its 8,192-sample YIN costs 4× a coach read), each as
     sine    a pure sine
     guitar  6 harmonics (1/h), each dying away faster than the one below it, read 0.1 s after the pluck
     weak    the same with the fundamental at 0.1 of its level: a known trap for an octave-high reading
   at 3 levels (peak 0.5, 0.05 and 0.008) over a fixed noise floor (RMS 0.0005). Plus an EDGE row about 12 dB over
   its noise (coach: peak 0.003 over 0.0005; tuner: 0.006 over 0.0015), where the YIN gate decides what is heard. Plus silence and white noise at 4 levels,
   which must give no pitch. Seeded: the same tones every run.

   What it asserts, per detector and sample rate (measured today: no tone of the 3 levels is missed or read as
   another note, octave traps included, so both lists are pinned empty):
     1. every tone read as its own note (within ±50 cents) is within PIN.cents of the true pitch (today's worst
        + 0.5), and their median error is within PIN.median (today's + 0.2: a 1% sample-rate slip is 17 cents);
     2. the tones read as ANOTHER note (an octave or other harmonic slip) are exactly the pinned list;
     3. the tones that give no pitch at all are exactly the pinned list;
     4. the edge row reads exactly the pinned counts (own note / another note / no pitch, per timbre);
     5. silence and white noise give no pitch, every time.
   A list or count that changes in EITHER direction fails: a deliberate change to the detector re-pins with
   --measure, in the same commit, with the reason. */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteSource } from './site-src.mjs';
import { extract } from './mic-sim/extract.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = n => argv.includes('--' + n);
const opt = (n, d) => { const a = argv.find(x => x.startsWith('--' + n + '=')); return a ? a.slice(n.length + 3) : d; };
const ROOT = resolve(opt('root', join(HERE, '..')));
const t0 = performance.now();

/* ── The pins: what the detectors do today (2026-11-13). Re-pin only after a deliberate change, with --measure. ── */
const PIN = {
  'coach@48000': { cents: 14.5, median: 0.3, wrong: [], missed: [], edge: 'sine 24/13/0, guitar 26/11/0, weak 27/1/9' },
  'coach@44100': { cents: 26, median: 0.4, wrong: [], missed: [], edge: 'sine 26/11/0, guitar 29/8/0, weak 24/3/10' },
  'tuner@48000': { cents: 6.5, median: 0.3, wrong: [], missed: [], edge: 'sine 4/2/0, guitar 4/0/2, weak 1/0/5' },
};

/* ── Load the real detectors ── */
function lineOf(src, re, what) {
  const m = re.exec(src);
  if (!m) { console.log(`tone-test: ✗ ${what} not found in the site code`); process.exit(1); }
  return m[0];
}
function load(src, fnName, stateRe, constNames = []) {
  const parts = [lineOf(src, stateRe, `the line that declares ${fnName}'s buffer`)];
  for (const c of constNames) parts.push(lineOf(src, new RegExp(`^const ${c}\\s*=[^;]*;`, 'm'), c));
  parts.push(extract(src, fnName));
  parts.push(`;globalThis.__fn = ${fnName};` + constNames.map(c => `globalThis.${c} = ${c};`).join(''));
  const ctx = { Float32Array, Math, Array, Number };
  vm.createContext(ctx);
  vm.runInContext(parts.join('\n'), ctx, { filename: fnName + '.js' });
  return ctx;
}
const coachSrc = siteSource('coach.js', ROOT);
const tunerSrc = readFileSync(join(ROOT, 'tuner.js'), 'utf8');
const COACH = load(coachSrc, 'coachDetectPitch', /^let coachYinD\b[^;]*;/m);
const TUNER = load(tunerSrc, 'detectPitchYIN', /^let tunerYinD\b[^;]*;/m, ['TUNER_RMS_GATE_YIN']);
const COACH_FFT = +(/^const COACH_FFT\s*=\s*(\d+)/m.exec(coachSrc) || [])[1];
if (!(COACH_FFT > 0)) { console.log('tone-test: ✗ COACH_FFT not found in the arcade script'); process.exit(1); }

const ALL_NOTES = Array.from({ length: 37 }, (_, i) => 40 + i);   // low E (MIDI 40) .. high e 12th fret (MIDI 76)
const OPEN_STRINGS = [40, 45, 50, 55, 59, 64];                    // the tuner's job; its 8,192-sample YIN is 4× the work
const DETECTORS = [
  { id: 'coach@48000', sr: 48000, len: COACH_FFT, notes: ALL_NOTES, quietRuns: 4, edge: { peak: 0.003, noise: 0.0005 }, read: buf => COACH.__fn(buf, 48000) },
  { id: 'coach@44100', sr: 44100, len: COACH_FFT, notes: ALL_NOTES, quietRuns: 4, edge: { peak: 0.003, noise: 0.0005 }, read: buf => COACH.__fn(buf, 44100) },
  /* The tuner's edge is louder, with louder noise (same ratio): at peak 0.003 its RMS silence bar (0.002), not YIN, decides. */
  { id: 'tuner@48000', sr: 48000, len: 8192, notes: OPEN_STRINGS, quietRuns: 2, edge: { peak: 0.006, noise: 0.0015 }, read: buf => TUNER.__fn(buf, 48000, TUNER.TUNER_RMS_GATE_YIN) },
];

/* ── The tones ── */
function rng(seed) { return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296); }
const NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nameOf = m => NOTE[m % 12] + (Math.floor(m / 12) - 1);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const KINDS = ['sine', 'guitar', 'weak'];
const LEVELS = [0.5, 0.05, 0.008];   // peak, after the mic gain: the accuracy rows L1-L3
const EDGE = 3;                      // the edge row's index (its level and noise are per detector: DETECTORS[].edge)
const NOISE_RMS = 0.0005;
const LEN = 8192;                    // the longest buffer any detector reads; a shorter one reads the newest samples
function gauss(r) { let u = 0; for (let i = 0; i < 6; i++) u += r(); return (u - 3) * Math.SQRT2; }   // ~N(0,1)
/* One tone, LEN samples, 0.1 s after the pluck. Each harmonic is a rotating phasor with a per-sample decay. */
function tone(kind, m, li, sr, level, noise) {
  const f = hz(m), r = rng(1 + 1000 * KINDS.indexOf(kind) + 100 * li + m), buf = new Float64Array(LEN);
  const H = kind === 'sine' ? 1 : 6;
  for (let h = 1; h <= H; h++) {
    const amp = (kind === 'weak' && h === 1 ? 0.1 : 1) / h, decayS = 1.2 / h;   // the 6th harmonic dies 6× as fast
    const w = 2 * Math.PI * f * h / sr, ph = r() * 2 * Math.PI, start = 0.1 * sr;
    const k = Math.exp(-1 / (decayS * sr));
    let a = amp * Math.exp(-start / (decayS * sr)), re = Math.cos(w * start + ph), im = Math.sin(w * start + ph);
    const c = Math.cos(w), s = Math.sin(w);
    for (let i = 0; i < LEN; i++) {
      buf[i] += a * im;
      const nre = re * c - im * s; im = re * s + im * c; re = nre; a *= k;
    }
  }
  let peak = 0;
  for (let i = 0; i < LEN; i++) peak = Math.max(peak, Math.abs(buf[i]));
  const out = new Float32Array(LEN);
  for (let i = 0; i < LEN; i++) out[i] = buf[i] / peak * level + noise * gauss(r);
  return out;
}
const tones = new Map();   // `${sr} ${kind} ${li} ${m}` → buffer, shared by the detectors that run at that rate
function toneAt(kind, m, li, sr, level, noise) {
  const k = `${sr} ${kind} ${li} ${m} ${level} ${noise}`;
  if (!tones.has(k)) tones.set(k, tone(kind, m, li, sr, level, noise));
  return tones.get(k);
}
/* A list of tone ids, compacted per timbre and level ("weak L3: *" = all of that row) so a pin stays short. */
function compact(ids, notes) {
  const rows = new Map();
  for (const id of ids) { const [kind, lv, rest] = id.split(' '); const key = `${kind} ${lv}`; if (!rows.has(key)) rows.set(key, []); rows.get(key).push(rest); }
  return [...rows].map(([k, v]) => `${k}: ${v.length === notes.length ? '*' : v.join(' ')}`);
}

/* ── Run ── */
let failures = 0;
const fail = s => { failures++; console.log('  ✗ ' + s); };
const measured = {};
const summary = [];
for (const D of DETECTORS) {
  const tD = performance.now();
  let inTune = 0, worst = 0, worstAt = '', total = 0;
  const wrong = [], missed = [], worstBy = {}, errs = [], edge = {};
  for (const kind of KINDS) {
    for (let li = 0; li <= EDGE; li++) {
      for (const m of D.notes) {
        const [level, noise] = li === EDGE ? [D.edge.peak, D.edge.noise] : [LEVELS[li], NOISE_RMS];
        const buf = toneAt(kind, m, li, D.sr, level, noise);
        const f = D.read(buf.subarray(LEN - D.len));
        if (li === EDGE) {
          /* The edge row only counts: own note / another note / no pitch. Its tones sit about 12 dB over their noise,
             where the YIN gate (0.22) decides, so a changed gate moves these counts (halved: they go silent). */
          const e = edge[kind] || (edge[kind] = [0, 0, 0]);
          e[!(f > 0) ? 2 : Math.abs(1200 * Math.log2(f / hz(m))) > 50 ? 1 : 0]++;
          continue;
        }
        const id = `${kind} L${li + 1} ${nameOf(m)}`;
        total++;
        if (!(f > 0)) { missed.push(id); continue; }
        const c = 1200 * Math.log2(f / hz(m));
        if (Math.abs(c) > 50) { wrong.push(`${id} → ${c > 0 ? '+' : ''}${Math.round(c)}c`); continue; }
        inTune++;
        errs.push(Math.abs(c));
        if (Math.abs(c) > worst) { worst = Math.abs(c); worstAt = id; }
        worstBy[kind] = Math.max(worstBy[kind] || 0, Math.abs(c));
      }
    }
  }
  errs.sort((x, y) => x - y);
  const median = errs.length ? errs[errs.length >> 1] : 0;
  let quiet = 0, quietBad = 0;
  for (let k = 0; k < D.quietRuns; k++) {
    const silent = new Float32Array(D.len);
    quiet++;
    const fs = D.read(silent);
    if (fs > 0) { quietBad++; fail(`${D.id}: silence read as ${fs.toFixed(1)} Hz`); }
    for (const lvl of [0.001, 0.01, 0.1, 0.5]) {
      const r = rng(7000 + k * 31 + Math.round(lvl * 1000)), b = new Float32Array(D.len);
      for (let i = 0; i < D.len; i++) b[i] = lvl * gauss(r);
      const f = D.read(b);
      quiet++;
      if (f > 0) { quietBad++; fail(`${D.id}: white noise (RMS ${lvl}) read as ${f.toFixed(1)} Hz`); }
    }
  }
  const cm = compact(missed, D.notes);
  const edgeStr = KINDS.map(k => `${k} ${edge[k].join('/')}`).join(', ');
  measured[D.id] = { cents: worst, median, wrong, missed: cm, edge: edgeStr };
  const P = PIN[D.id];
  if (!flag('measure')) {
    if (worst > P.cents) fail(`${D.id}: a tone read as its own note is ${worst.toFixed(2)} cents off (${worstAt}); pinned at most ${P.cents}`);
    if (median > P.median) fail(`${D.id}: the median error of the tones read as their own note is ${median.toFixed(2)} cents; pinned at most ${P.median}`);
    const diff = (have, want, what) => {
      const add = have.filter(x => !want.includes(x)), gone = want.filter(x => !have.includes(x));
      const few = l => l.slice(0, 6).join('; ') + (l.length > 6 ? `; … ${l.length - 6} more (--verbose lists all)` : '');
      if (add.length || gone.length) fail(`${D.id}: the ${what} changed (${have.length} now, ${want.length} pinned)` + (add.length ? `; new: ${few(add)}` : '') + (gone.length ? `; no longer: ${few(gone)}` : ''));
    };
    diff(wrong, P.wrong, 'tones read as another note');
    diff(cm, P.missed, 'tones with no pitch');
    if (edgeStr !== P.edge) fail(`${D.id}: the edge row (peak ${D.edge.peak} over noise ${D.edge.noise}, own note / another note / no pitch per timbre) reads ${edgeStr}; pinned ${P.edge}`);
  }
  summary.push(`${D.id}: ${inTune}/${total} tones read as their note, worst ${worst.toFixed(2)}c (pin ${P.cents}), median ${median.toFixed(2)}c (pin ${P.median}); ${wrong.length} as another note, ${missed.length} no pitch; edge row ${edgeStr}; ${quiet - quietBad}/${quiet} silence + noise gave no pitch`);
  if (flag('verbose')) {
    console.log(`  ${D.id}: ${Math.round(performance.now() - tD)} ms; worst cents by timbre ${JSON.stringify(Object.fromEntries(Object.entries(worstBy).map(([k, v]) => [k, +v.toFixed(2)])))}`);
    for (const w of wrong) console.log(`    another note: ${w}`);
    for (const w of cm) console.log(`    no pitch: ${w}`);
  }
}
if (flag('measure')) {
  /* The margin: 0.5 cent over today's worst, rounded up to a tenth. */
  for (const v of Object.values(measured)) { v.cents = Math.ceil((v.cents + 0.5) * 10) / 10; v.median = Math.ceil((v.median + 0.2) * 10) / 10; }
  console.log('const PIN = ' + JSON.stringify(measured, null, 2).replace(/"(\w+)":/g, '$1:') + ';');
}
const ms = Math.round(performance.now() - t0);
console.log(`tone-test: ${failures ? '✗ ' + failures + ' failed' : '✓'} — ${summary.join(' · ')} (${ms} ms)`);
/* exitCode, not process.exit(): on Node 24 under load, exiting while V8 still runs a background GC deadlocked the
   process twice in 2026-11-13 runs (main thread joining a GC worker parked on a collection barrier). Letting the
   event loop drain ends it the normal way. */
process.exitCode = failures && !flag('measure') ? 1 : 0;
