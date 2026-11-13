#!/usr/bin/env node
/* tone-test.mjs — the pitch detectors against made-up tones, in a few seconds (2026-11-13).

     node tools/tone-test.mjs              one summary line per detector; exit 1 when a pin below no longer holds
     node tools/tone-test.mjs --verbose    also the time and worst cents per detector, every wrong or missed tone
     node tools/tone-test.mjs --measure    print today's numbers as pins (to re-pin after a DELIBERATE change)
     node tools/tone-test.mjs --root=DIR   test another site folder (a scratch copy with a planted fault)
     node tools/tone-test.mjs --perturb=4096 --pseed=1   the same with every sample nudged (pins must still hold)

   Part of tools/checks.mjs (1cx), which runs this file and fails the push when it fails. A regression guard, not a
   spec: the pins are what the detectors do TODAY (measured 2026-11-13) plus a small margin, so an accidental edit to
   the pitch code is caught at the next commit, on the Mac and on GitHub. The deep listening tests stay in
   tools/mic-sim/ (rooms, students, real classroom takes); this one only asks "does a clean tone still read as the
   note it is".

   What it loads: the REAL functions, cut out of the site's text the way tools/mic-sim/*.mjs do it (extract.mjs on
   the whole script from tools/site-src.mjs) and run in a vm, called the ways the site calls them:
     coach   coachDetectPitch from the arcade script (coach-core.js), with its own `let coachYinD` line, on the newest
             COACH_FFT samples (read from the source). At 48,000 and 44,100 Hz (Chromebook mics) and 96,000 Hz (where
             the site switches to a 4,096-sample window). At the default gate (single notes), at the Listening Coach's
             chord gate and at RNW_POWER_CLARITY's two tiers (both read from the source), and with `end` (the slow-
             Chromebook catch-up in coachPitchReadings reads older windows of the same buffer).
     tuner   detectPitchYIN from tuner.js, with its `let tunerYinD` line, on a buffer of its analyser's fftSize (read
             from the source) at 48,000 Hz, at TUNER_RMS_GATE_YIN and, for the high e, TUNER_RMS_GATE_YIN_E4. Its
             second detector (detectPitchHPS) reads the browser's FFT, which Node does not have: not tested here.
   Not tested: what happens BEFORE the detector (the mic gain and the 70-1,500 Hz filters) and the tuner's default
   silence bar for a caller that passes none (the site always passes one).

   The tones: every guitar note from the low E (MIDI 40, 82.4 Hz) to the 12th fret of the high e (MIDI 76,
   659.3 Hz), plus four above the neck (740 to 1,245 Hz, inside the detectors' 1,400 Hz range), each as
     sine    a pure sine
     guitar  6 harmonics (1/h), each dying away faster than the one below it, read 0.1 s after the pluck
     weak    the same with the fundamental at 0.1 of its level: a known trap for an octave-high reading
   ACCURACY rows: 3 levels (peak 0.5, 0.05 and 0.008) over a fixed noise floor (RMS 0.0005). Coach at 48 kHz: all 41
   notes; 44.1 kHz: the open strings and the 4 high tones; 96 kHz: the low E and A strings; tuner: the open strings.
   COUNT rows: tones about 12 dB over their noise, where the YIN gate decides what is heard (coach: peak 0.003 over
   0.0005; tuner: 0.006 over 0.0015, all 37 notes, where a 5% change to its threshold shows), and a quiet high e at the
   tuner's high-e silence bar. Plus silence and white noise at 4 levels, which must give no pitch.
   Seeded: the same tones every run. A float perturbation of ±4,096 ulps on every sample (--perturb, 5 seeds on
   2026-11-13) moved no pin.

   What it asserts (measured today: no accuracy tone is missed or read as another note, octave traps included):
     1. every accuracy tone read as its own note (within ±50 cents) is within PIN.cents of the true pitch (today's
        worst + 0.5), and their median error is within PIN.median (today's + 0.2: a 1% sample-rate slip is 17 cents);
     2. the accuracy tones read as ANOTHER note (an octave or other harmonic slip) are exactly the pinned list;
     3. the accuracy tones that give no pitch at all are exactly the pinned list;
     4. each count row reads exactly the pinned counts (own note / another note / no pitch, per timbre);
     5. a read with `end` equals a read of the buffer cut at `end`;
     6. silence and white noise give no pitch, every time.
   A list or count that changes in EITHER direction fails. --measure prints each moved pin as old → new, and a loud
   line when more tones are missed or misread, so a regression is never re-pinned quietly. */
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
/* --perturb=N [--pseed=S]: multiply every sample by 1 ± N float32 ulps (seeded), to show the pins do not sit on a
   rounding edge (another CPU, another Node): run it with a few seeds and N=4096 after any re-pin. */
const PERTURB = +opt('perturb', 0), PSEED = +opt('pseed', 0);
const t0 = performance.now();
const REPIN_HINT = 'Changed the pitch code on purpose? Run the mic-sim closed loop first (tools/mic-sim/README.md), then re-pin with --measure and give the reason in the commit.';

/* ── The pins: what the detectors do today (2026-11-13). Re-pin only after a deliberate change, with --measure. ──
   cents / median: the worst and the median error of the accuracy tones read as their own note.
   wrong / missed: the accuracy tones read as another note / with no pitch (missed: per timbre and level, '*' = all).
   counts: per count row, own note / another note / no pitch for each timbre. */
const PIN = {
  'coach@48000': { cents: 14.5, median: 0.4, wrong: [], missed: [], counts: {
    'edge': 'sine 28/13/0, guitar 30/11/0, weak 30/2/9',
    'edge@0.55': 'sine 28/13/0, guitar 27/14/0, weak 37/4/0',
    'edge@[0.22,0.45]': 'sine 28/13/0, guitar 30/11/0, weak 37/4/0' } },
  'coach@44100': { cents: 26, median: 0.6, wrong: [], missed: [], counts: {
    'edge': 'sine 26/11/0, guitar 29/8/0, weak 24/3/10' } },
  'coach@96000': { cents: 18.3, median: 0.4, wrong: [], missed: [], counts: {} },
  'tuner@48000': { cents: 6.5, median: 0.3, wrong: [], missed: [], counts: {
    'edge': 'sine 26/11/0, guitar 28/0/9, weak 8/0/29',
    'quiet high e': 'sine 1/0/0, guitar 1/0/0, weak 0/0/1',
    'quieter high e': 'sine 1/0/0, guitar 0/0/1, weak 0/0/1' } },
};

/* ── Load the real detectors and the values the site calls them with ── */
const die = s => { console.log(`tone-test: ✗ ${s}`); console.log(REPIN_HINT); process.exit(1); };
function grab(src, re, what) { const m = re.exec(src); if (!m) die(`${what} not found in the site code`); return m; }
function load(src, fnName, stateRe, constNames = []) {
  const parts = [grab(src, stateRe, `the line that declares ${fnName}'s buffer`)[0]];
  for (const c of constNames) parts.push(grab(src, new RegExp(`^const ${c}\\s*=[^;]*;`, 'm'), c)[0]);
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
const TUNER = load(tunerSrc, 'detectPitchYIN', /^let tunerYinD\b[^;]*;/m, ['TUNER_RMS_GATE_YIN', 'TUNER_RMS_GATE_YIN_E4']);
const COACH_FFT = +grab(coachSrc, /^const COACH_FFT\s*=\s*(\d+)/m, 'COACH_FFT')[1];
const TUNER_FFT = +grab(tunerSrc, /tunerAnalyser\.fftSize\s*=\s*(\d+)/, "the tuner analyser's fftSize")[1];
/* The other gates the site passes: the Listening Coach's chord mode (coach-core.js, `coach.mode === 'chords' ? 0.55
   : 0.22`) and Riff Runner / Power Chord Switch's two-tier list (RNW_POWER_CLARITY), both read from the source. */
const CHORD_GATE = +grab(coachSrc, /coachPitchReadings\([^)]*coach\.mode === 'chords' \? ([\d.]+) :/, "the Listening Coach's chord-mode gate")[1];
const POWER_GATES = JSON.parse(grab(coachSrc, /^const RNW_POWER_CLARITY\s*=\s*(\[[\d.,\s]+\]);/m, 'RNW_POWER_CLARITY')[1]);

/* ── The tones ── */
function rng(seed) { return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296); }
const NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nameOf = m => NOTE[m % 12] + (Math.floor(m / 12) - 1);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
const KINDS = ['sine', 'guitar', 'weak'];
const LEVELS = [0.5, 0.05, 0.008];   // peak, after the mic gain: the accuracy rows L1-L3
const NOISE_RMS = 0.0005;
const LEN = 8192;                    // the longest buffer any detector reads; a shorter one reads the newest samples
const GUITAR = Array.from({ length: 37 }, (_, i) => 40 + i);   // low E (MIDI 40) .. high e 12th fret (MIDI 76)
const HIGH = [78, 81, 84, 87];       // 740, 880, 1047, 1245 Hz: above the neck, still inside the detectors' 1,400 Hz range
const OPEN_STRINGS = [40, 45, 50, 55, 59, 64];
function gauss(r) { let u = 0; for (let i = 0; i < 6; i++) u += r(); return (u - 3) * Math.SQRT2; }   // ~N(0,1)
/* One tone, LEN samples, 0.1 s after the pluck. Each harmonic is a rotating phasor with a per-sample decay.
   `row` only seeds the phases and the noise, so two rows at the same level are still different tones. */
function tone(kind, m, row, sr, level, noise) {
  const f = hz(m), r = rng(1 + 1000 * KINDS.indexOf(kind) + 100 * row + m), buf = new Float64Array(LEN);
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
  if (PERTURB) { const pr = rng(424242 + PSEED + m * 7 + row * 13 + KINDS.indexOf(kind) * 101 + sr); for (let i = 0; i < LEN; i++) out[i] *= 1 + PERTURB * 5.96e-8 * (pr() * 2 - 1); }
  return out;
}
const tones = new Map();
function toneAt(kind, m, row, sr, level, noise) {
  const k = `${sr} ${kind} ${row} ${m} ${level} ${noise}`;
  if (!tones.has(k)) tones.set(k, tone(kind, m, row, sr, level, noise));
  return tones.get(k);
}
/* A list of tone ids, compacted per timbre and level ("weak L3: *" = all of that row) so a pin stays short. */
function compact(ids, notes) {
  const rows = new Map();
  for (const id of ids) { const [kind, lv, rest] = id.split(' '); const key = `${kind} ${lv}`; if (!rows.has(key)) rows.set(key, []); rows.get(key).push(rest); }
  return [...rows].map(([k, v]) => `${k}: ${v.length === notes.length ? '*' : v.join(' ')}`);
}

/* ── The detectors, as the site calls them ──
   acc:    the accuracy notes (levels L1-L3)
   counts: rows near a gate, pinned as counts. Each: notes, peak, noise, the read, and the row number that seeds it.
   The coach reads the newest `len` samples; the site's catch-up reads an older window of the same buffer through
   `end` (coachPitchReadings), checked separately below. */
const coachRead = (sr, clarity) => buf => COACH.__fn(buf, sr, clarity);
const tunerRead = gate => buf => TUNER.__fn(buf, 48000, gate);
const COACH_EDGE = { peak: 0.003, noise: 0.0005 };
const DETECTORS = [
  { id: 'coach@48000', sr: 48000, len: COACH_FFT, acc: [...GUITAR, ...HIGH], quietRuns: 4, read: coachRead(48000),
    counts: [
      { key: 'edge', notes: [...GUITAR, ...HIGH], ...COACH_EDGE, row: 3, read: coachRead(48000) },
      /* The same tones at the gates the chord games pass: a lost or ignored caller gate moves these. */
      { key: `edge@${CHORD_GATE}`, notes: [...GUITAR, ...HIGH], ...COACH_EDGE, row: 3, read: coachRead(48000, CHORD_GATE) },
      { key: `edge@${JSON.stringify(POWER_GATES)}`, notes: [...GUITAR, ...HIGH], ...COACH_EDGE, row: 3, read: coachRead(48000, POWER_GATES) },
    ] },
  /* 44.1 kHz: the open strings and the high tones only (the full neck runs at 48 kHz; kept short for time). */
  { id: 'coach@44100', sr: 44100, len: COACH_FFT, acc: [...OPEN_STRINGS, ...HIGH], quietRuns: 2, read: coachRead(44100),
    counts: [{ key: 'edge', notes: GUITAR, ...COACH_EDGE, row: 3, read: coachRead(44100) }] },
  /* 96 kHz: the site switches to a 4,096-sample window above 60 kHz, because a fixed 2,048 made the whole low E
     string undetectable there (coach-core.js, the comment above `const W`). The low E and A strings. */
  { id: 'coach@96000', sr: 96000, len: COACH_FFT, acc: [40, 41, 43, 45], quietRuns: 1, read: coachRead(96000), counts: [] },
  { id: 'tuner@48000', sr: 48000, len: TUNER_FFT, acc: OPEN_STRINGS, quietRuns: 1, read: tunerRead(TUNER.TUNER_RMS_GATE_YIN),
    counts: [
      /* Louder, with louder noise (same ratio) than the coach's edge: at peak 0.003 its RMS silence bar, not YIN,
         would decide. All 37 notes: a 5% change to its YIN threshold moves this row. */
      { key: 'edge', notes: GUITAR, peak: 0.006, noise: 0.0015, row: 3, read: tunerRead(TUNER.TUNER_RMS_GATE_YIN) },
      /* A quiet high e at the lower silence bar the tuner uses when it is locked to the high e string. */
      { key: 'quiet high e', notes: [64], peak: 0.0024, noise: 0.0001, row: 5, read: tunerRead(TUNER.TUNER_RMS_GATE_YIN_E4) },
      { key: 'quieter high e', notes: [64], peak: 0.0016, noise: 0.0001, row: 6, read: tunerRead(TUNER.TUNER_RMS_GATE_YIN_E4) },
    ] },
];

/* ── Run ── */
let failures = 0;
const fail = s => { failures++; console.log('  ✗ ' + s); };
const measured = {};
const summary = [];
const verdict = (f, m) => !(f > 0) ? 2 : Math.abs(1200 * Math.log2(f / hz(m))) > 50 ? 1 : 0;
for (const D of DETECTORS) {
  const tD = performance.now();
  const slice = buf => buf.subarray(LEN - D.len);
  let inTune = 0, worst = 0, worstAt = '', total = 0;
  const wrong = [], missed = [], worstBy = {}, errs = [], counts = {};
  for (const kind of KINDS) {
    for (let li = 0; li < LEVELS.length; li++) {
      for (const m of D.acc) {
        const f = D.read(slice(toneAt(kind, m, li, D.sr, LEVELS[li], NOISE_RMS)));
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
  for (const R of D.counts) {
    const t = {};
    for (const kind of KINDS) {
      t[kind] = [0, 0, 0];
      for (const m of R.notes) t[kind][verdict(R.read(slice(toneAt(kind, m, R.row, D.sr, R.peak, R.noise))), m)]++;
    }
    counts[R.key] = KINDS.map(k => `${k} ${t[k].join('/')}`).join(', ');
  }
  errs.sort((x, y) => x - y);
  const median = errs.length ? errs[errs.length >> 1] : 0;
  let quiet = 0, quietBad = 0;
  for (let k = 0; k < D.quietRuns; k++) {
    quiet++;
    const fs = D.read(new Float32Array(D.len));
    if (fs > 0) { quietBad++; fail(`${D.id}: silence read as ${fs.toFixed(1)} Hz`); }
    for (const lvl of [0.001, 0.01, 0.1, 0.5]) {
      const r = rng(7000 + k * 31 + Math.round(lvl * 1000)), b = new Float32Array(D.len);
      for (let i = 0; i < D.len; i++) b[i] = lvl * gauss(r);
      const f = D.read(b);
      quiet++;
      if (f > 0) { quietBad++; fail(`${D.id}: white noise (RMS ${lvl}) read as ${f.toFixed(1)} Hz`); }
    }
  }
  const cm = compact(missed, D.acc);
  measured[D.id] = { cents: worst, median, wrong, missed: cm, counts };
  const P = PIN[D.id] || { cents: 0, median: 0, wrong: [], missed: [], counts: {} };
  if (!flag('measure')) {
    if (!PIN[D.id]) fail(`${D.id}: no pins (run --measure)`);
    if (worst > P.cents) fail(`${D.id}: a tone read as its own note is ${worst.toFixed(2)} cents off (${worstAt}); pinned at most ${P.cents}`);
    if (median > P.median) fail(`${D.id}: the median error of the tones read as their own note is ${median.toFixed(2)} cents; pinned at most ${P.median}`);
    const few = l => l.slice(0, 6).join('; ') + (l.length > 6 ? `; … ${l.length - 6} more (--verbose lists all)` : '');
    const add = wrong.filter(x => !P.wrong.includes(x)), gone = P.wrong.filter(x => !wrong.includes(x));
    if (add.length || gone.length) fail(`${D.id}: the tones read as another note changed (${wrong.length} now, ${P.wrong.length} pinned)` + (add.length ? `; new: ${few(add)}` : '') + (gone.length ? `; no longer: ${few(gone)}` : ''));
    const pinnedMissed = P.missed.reduce((n, row) => n + (row.endsWith(': *') ? D.acc.length : row.split(': ')[1].split(' ').length), 0);
    const madd = cm.filter(x => !P.missed.includes(x)), mgone = P.missed.filter(x => !cm.includes(x));
    if (madd.length || mgone.length) fail(`${D.id}: the tones with no pitch changed (${missed.length} tones now, ${pinnedMissed} pinned)` + (madd.length ? `; now: ${few(madd)}` : '') + (mgone.length ? `; pinned: ${few(mgone)}` : ''));
    for (const R of D.counts) {
      const want = (P.counts || {})[R.key];
      if (counts[R.key] !== want) fail(`${D.id}: the ${R.key} row (peak ${R.peak} over noise ${R.noise}; own note / another note / no pitch per timbre) reads ${counts[R.key]}; pinned ${want === undefined ? 'nothing' : want}`);
    }
  }
  const rows = D.counts.map(R => `${R.key} ${counts[R.key]}`).join('; ');
  summary.push(`${D.id}: ${inTune}/${total} tones read as their note, worst ${worst.toFixed(2)}c (pin ${P.cents}), median ${median.toFixed(2)}c (pin ${P.median}); ${wrong.length} as another note, ${missed.length} no pitch${rows ? '; ' + rows : ''}; ${quiet - quietBad}/${quiet} silence + noise gave no pitch`);
  if (flag('verbose')) {
    console.log(`  ${D.id}: ${Math.round(performance.now() - tD)} ms; worst cents by timbre ${JSON.stringify(Object.fromEntries(Object.entries(worstBy).map(([k, v]) => [k, +v.toFixed(2)])))}`);
    for (const w of wrong) console.log(`    another note: ${w}`);
    for (const w of cm) console.log(`    no pitch: ${w}`);
  }
}

/* ── The catch-up window: coachPitchReadings reads older windows of the same buffer through `end`. A read with
   `end` must equal a read of the buffer cut at `end` (every guitar tone at L2, three window ends, two gates). ── */
{
  let same = 0, n = 0;
  const bad = [];
  for (const m of [...GUITAR, ...HIGH]) {
    const full = toneAt('guitar', m, 1, 48000, LEVELS[1], NOISE_RMS).subarray(LEN - COACH_FFT);
    for (const end of [COACH_FFT - Math.ceil(0.040 * 48000), COACH_FFT - 2 * Math.ceil(0.040 * 48000), 2048]) {
      for (const clarity of [undefined, CHORD_GATE]) {
        const a = COACH.__fn(full, 48000, clarity, end), b = COACH.__fn(full.subarray(0, end), 48000, clarity);
        n++;
        if (a === b) same++; else bad.push(`${nameOf(m)} end ${end}${clarity ? ' gate ' + clarity : ''}: ${a.toFixed(2)} vs ${b.toFixed(2)} Hz`);
      }
    }
  }
  if (bad.length && !flag('measure')) fail(`coach@48000: a read with \`end\` differs from a read of the buffer cut at \`end\` in ${bad.length} of ${n}: ${bad.slice(0, 4).join('; ')}`);
  summary.push(`catch-up window: ${same}/${n} reads with \`end\` equal the cut buffer`);
}

if (flag('measure')) {
  /* The margin: 0.5 cent over today's worst and 0.2 over the median, rounded up to a tenth. */
  for (const v of Object.values(measured)) { v.cents = Math.ceil((v.cents + 0.5) * 10) / 10; v.median = Math.ceil((v.median + 0.2) * 10) / 10; }
  /* Old → new for every pin that moves, and a loud line when a list of failures GROWS: a regression must not be
     pinned quietly. */
  for (const [id, v] of Object.entries(measured)) {
    const o = PIN[id] || { counts: {}, wrong: [], missed: [] };
    for (const k of ['cents', 'median']) if (o[k] !== v[k]) console.log(`  ${id} ${k}: ${o[k]} → ${v[k]}`);
    if (JSON.stringify(o.wrong) !== JSON.stringify(v.wrong)) console.log(`  ${id} another note: ${o.wrong.length} → ${v.wrong.length}`);
    if (JSON.stringify(o.missed) !== JSON.stringify(v.missed)) console.log(`  ${id} no pitch: ${JSON.stringify(o.missed)} → ${JSON.stringify(v.missed)}`);
    for (const [k, s2] of Object.entries(v.counts)) if ((o.counts || {})[k] !== s2) console.log(`  ${id} ${k}: ${(o.counts || {})[k]} → ${s2}`);
    const bad = s2 => (s2 || '').split(', ').reduce((n, x) => { const p = x.split(' ').pop().split('/').map(Number); return n + (p[1] || 0) + (p[2] || 0); }, 0);
    const grew = v.wrong.length > o.wrong.length || v.missed.join().length > o.missed.join().length
      || Object.keys(v.counts).some(k => bad(v.counts[k]) > bad((o.counts || {})[k]));
    if (grew) console.log(`  !!!!! ${id}: MORE tones are now read as another note or not at all. That is a regression unless the reason is written in the commit.`);
  }
  console.log('const PIN = ' + JSON.stringify(measured, null, 2).replace(/"(\w+)":/g, '$1:') + ';');
}
const ms = Math.round(performance.now() - t0);
console.log(`tone-test: ${failures ? '✗ ' + failures + ' failed' : '✓'} — ${summary.join(' · ')} (${ms} ms)`);
if (failures && !flag('measure')) console.log(REPIN_HINT);
/* exitCode, not process.exit(): on Node 24 under load, exiting while V8 still runs a background GC deadlocked the
   process twice in 2026-11-13 runs (main thread joining a GC worker parked on a collection barrier). Letting the
   event loop drain ends it the normal way. */
process.exitCode = failures && !flag('measure') ? 1 : 0;
