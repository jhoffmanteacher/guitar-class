/* ── Song builder: the sound measurements (2026-11-15, Song builder Part b) ─────────────────────────────
   The numbers the Song builder's Volume and Beat steps need from one record, worked out in the teacher's
   browser. Pure functions on arrays of samples: no DOM, no database, so tools/sb-dsp-test.mjs runs this
   file in Node on GENERATED signals (tones, clicks, noise; never a real record) and compares it with the
   Python tools the site already trusts. The screens are teacher-sb-core.js (Upload, Volume) and
   teacher-sb-beat.js (Beat). Work order: "Claude outputs/WORK-ORDER-song-builder.md", Part b.

   LOUDNESS (sbLoudness) is EBU R128 integrated loudness, the measure tools/loudness.py reads through
   ffmpeg's ebur128: K-weighting (the two BS.1770 filters, worked out for the file's own sample rate), 400 ms
   blocks every 100 ms, the -70 LUFS gate, then the gate 10 LU under the mean. SB_TARGET_LUFS is "the cure"
   as loudness.py measures it in its normal run (-12.505 LUFS, ffmpeg ebur128 on
   audio/olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-full.mp3, 2026-11-15); "the cure" itself is never
   re-levelled. Peaks: the sample peak, and the true peak at 4x oversampling (sbTruePeak). Both in dBFS.

   LEVELLING (sbLevel) does what loudness.py does to one file, in the browser (Jonathan, 2026-11-14: "a
   levelled copy", 192k): ONE gain for the whole song and a peak limiter at the ceiling (-1 dBFS), nothing
   else: no resample, no pitch change, no trim of the music. The limiter (sbLimit) looks ahead 5 ms and lets
   go over 50 ms (alimiter's attack and release, as in loudness.py's LIMITER) and holds every SAMPLE at or
   under the ceiling. Then the copy is encoded at 192k constant bitrate (the vendored LAME, vendor/lamejs,
   in a Worker: teacher-sb-core.js), decoded again and measured: the decoded loudness must land within
   0.3 LU of the target (aimed at 0.1) and both decoded peaks at or under -1 dBFS; a miss moves the gain or
   lowers the ceiling and encodes again (at most SB_LEVEL_TRIES times), as loudness.py does.
   THE CODEC DELAY. The encoder writes no gapless header, so a decoder plays SB_CODEC_DELAY samples (576 of
   the encoder's and 529 of the decoder's, measured 2026-11-15: 1105 at 44.1 kHz, ffmpeg and Chrome) of
   silence before the first sample it was given. The first SB_CODEC_DELAY samples handed to the encoder
   are therefore dropped (sbEncodeInput): the decoded copy lines up with the record sample for sample
   (tools/sb-dsp-test.mjs: lag 0), so a beat set on the copy is a beat of the record, and Claude's clean slow
   file (made later from the original, `sourceSha256`) lines up too. What is lost is the record's first 25 ms,
   heard as the encoder's own lead-in silence.

   PITCH (sbCents) is tools/playalong-measure.py's TUNING, line for line: the strong spectral peaks between
   100 and 2000 Hz, each one's distance from the nearest equal-tempered note at A = 440, the weighted mode of
   those distances. A record more than 10 cents off is not published (Jonathan, 2026-11-14: the rules hold
   it too); the builder says so and the file goes to Claude.

   THE BEAT (sbOnsetEnv, sbTrack, sbLocalOffset, the grid). The onset envelope is three bands (low 35-180,
   mid 180-1500, high 1500-8000 Hz, as tools/beat-audit.py) of short-time energy, the rise of its log,
   each band scaled by its 99th percentile and added. The teacher's taps (or a typed BPM) give a tempo; the
   audio is then FOLLOWED beat by beat (sbTrack, "THE BEAT TRACK" below); bar 1 starts on the first LOUD beat
   (the first beat whose own length is a quarter of the song's median loudness, as playalong-measure.py; the
   teacher can move it). Two PINS fix the grid: bar 1 and one bar near the end, each set where the music's
   beats are (sbLocalOffset: the shift of a few bars of beats that lines the onsets up best). The drift check
   measures windows through the song against that grid; any window more than 30 ms off gets its own pin, and
   three or more pins make `barTimes` (sbBarTimes: straight lines between pins). The pins are the truth: a
   record's bar n starts at sbBarTime(beat, n). */

const SB_TARGET_LUFS = -12.505;     // "the cure", ffmpeg ebur128 (tools/loudness.py's reference), 2026-11-15
const SB_CEILING_DB = -1;           // both decoded peaks at or under this (tools/loudness.py)
const SB_LOUD_AIM = 0.1, SB_LOUD_PASS = 0.3;   // LU from the target: aimed at, accepted (tools/loudness.py)
const SB_LEVEL_TRIES = 4;           // encodes at most
const SB_KBPS = 192;                // Jonathan, 2026-11-14
const SB_CODEC_DELAY = 1105;        // samples: LAME's 576 + the decoder's 529 (measured, see above)
const SB_RATES = [32000, 44100, 48000];   // MPEG-1 rates: the only ones LAME encodes at 192k
const SB_MAX_CENTS = 10;
const SB_METER = { '4/4': { bpb: 4, sub: 1 }, '3/4': { bpb: 3, sub: 1 }, '6/8': { bpb: 2, sub: 3 } };   // bpb = counted beats a bar (app/builtsongs.js BS_METERS)
const SB_DRIFT_MS = 30;             // a window further off than this needs its own pin (the plan)
/* A record whose followed bars need more pins than this to stay within SB_DRIFT_MS goes to Claude (Jonathan,
   2026-11-15: "for songs that drift too much the app should tell me that i should ask claude to build it instead").
   Measured 2026-11-15 (the followed bars of the site's own songs): the steady records the tracker holds need 2 or
   3 (bar 1 and the end; one needs 6); every record played by a band without a click needs 16 to 26; a steady
   record the tracker is unsure on ("the cure", 12) reads like those, and goes to Claude for that reason instead.
   Any number from 7 to 11 splits them the same way; 8 is a first setting, Jonathan's to move. */
const SB_PINS_MAX = 8;
function sbBeatTooMuch(pins){ return Number.isFinite(pins) && pins > SB_PINS_MAX; }
/* The onset envelope peaks this long after the sound starts (a fixed property of sbOnsetEnv's frames, measured
   on generated clicks by tools/sb-dsp-test.mjs and subtracted here so a beat's time is when it sounds). */
const SB_ONSET_SHIFT = -0.005;

/* ── The mp3's first frame: its sample rate, channels and bitrate (an ID3v2 tag is skipped). null when no
   MPEG audio frame starts within the first 64 KB after the tag. ── */
function sbMp3Info(b){
  if(!b || b.length < 4) return null;
  let p = 0;
  if(b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33 && b.length > 10){
    p = 10 + ((b[6] & 0x7f) << 21 | (b[7] & 0x7f) << 14 | (b[8] & 0x7f) << 7 | (b[9] & 0x7f));
    if(b[5] & 0x10) p += 10;
  }
  const RATES = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
  const KB1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
  const KB2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
  for(const end = Math.min(b.length - 4, p + 65536); p < end; p++){
    if(b[p] !== 0xff || (b[p + 1] & 0xe0) !== 0xe0) continue;
    const ver = (b[p + 1] >> 3) & 3, layer = (b[p + 1] >> 1) & 3, bri = b[p + 2] >> 4, sri = (b[p + 2] >> 2) & 3;
    if(ver === 1 || layer !== 1 || bri === 0 || bri === 15 || sri === 3) continue;   // layer III only
    return { sampleRate: RATES[ver][sri], channels: (b[p + 3] >> 6) === 3 ? 1 : 2, kbps: (ver === 3 ? KB1 : KB2)[bri], at: p };
  }
  return null;
}

/* ── FFT: in place, radix 2, re/im of a power-of-two length ── */
function sbFft(re, im){
  const n = re.length;
  for(let i = 1, j = 0; i < n; i++){
    let bit = n >> 1;
    for(; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if(i < j){ let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  for(let len = 2; len <= n; len <<= 1){
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang), half = len >> 1;
    for(let i = 0; i < n; i += len){
      let cr = 1, ci = 0;
      for(let k = 0; k < half; k++){
        const a = i + k, b = a + half;
        const xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
        re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
}
function sbHann(n){ const w = new Float64Array(n); for(let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / n); return w; }
function sbMono(chans){
  if(chans.length === 1) return chans[0];
  const n = chans[0].length, out = new Float32Array(n);
  for(let i = 0; i < n; i++){ let s = 0; for(const c of chans) s += c[i]; out[i] = s / chans.length; }
  return out;
}

/* ── Loudness: EBU R128 integrated (BS.1770-4), as ffmpeg's ebur128 ── */
function sbKCoeffs(fs){
  let f0 = 1681.974450955533, G = 3.999843853973347, Q = 0.7071752369554196;
  let K = Math.tan(Math.PI * f0 / fs);
  const Vh = Math.pow(10, G / 20), Vb = Math.pow(Vh, 0.4996667741545416);
  let a0 = 1 + K / Q + K * K;
  const s1 = { b0: (Vh + Vb * K / Q + K * K) / a0, b1: 2 * (K * K - Vh) / a0, b2: (Vh - Vb * K / Q + K * K) / a0,
    a1: 2 * (K * K - 1) / a0, a2: (1 - K / Q + K * K) / a0 };
  f0 = 38.13547087602444; Q = 0.5003270373238773; K = Math.tan(Math.PI * f0 / fs);
  a0 = 1 + K / Q + K * K;
  const s2 = { b0: 1, b1: -2, b2: 1, a1: 2 * (K * K - 1) / a0, a2: (1 - K / Q + K * K) / a0 };
  return [s1, s2];
}
/* The K-weighted squares of one channel, summed per 100 ms step: what the 400 ms blocks are made of. */
function sbKSquares(x, fs, step){
  const [s1, s2] = sbKCoeffs(fs);
  const nStep = Math.floor(x.length / step), out = new Float64Array(nStep);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, z1 = 0, z2 = 0;
  for(let k = 0, i = 0; k < nStep; k++){
    let acc = 0;
    for(const e = i + step; i < e; i++){
      const xn = x[i];
      const y = s1.b0 * xn + s1.b1 * x1 + s1.b2 * x2 - s1.a1 * y1 - s1.a2 * y2;
      x2 = x1; x1 = xn;
      const z = y - 2 * y1 + y2 - s2.a1 * z1 - s2.a2 * z2;   // s2: b = 1, -2, 1 on the stage-1 output
      y2 = y1; y1 = y; z2 = z1; z1 = z;
      acc += z * z;
    }
    out[k] = acc;
  }
  return out;
}
function sbLoudness(chans, fs){
  const step = Math.round(fs / 10), blk = step * 4;
  const sq = chans.map(c => sbKSquares(c, fs, step));
  const nB = sq[0].length - 3;
  if(nB < 1) return -Infinity;
  const z = new Float64Array(nB);
  for(let b = 0; b < nB; b++){ let s = 0; for(const q of sq) s += q[b] + q[b + 1] + q[b + 2] + q[b + 3]; z[b] = s / blk; }
  const lufs = p => -0.691 + 10 * Math.log10(p);
  const absGate = Math.pow(10, (-70 + 0.691) / 10);
  let sum = 0, n = 0;
  for(let b = 0; b < nB; b++) if(z[b] > absGate){ sum += z[b]; n++; }
  if(!n) return -Infinity;
  const relGate = sum / n * Math.pow(10, -10 / 10);
  sum = 0; n = 0;
  for(let b = 0; b < nB; b++) if(z[b] > absGate && z[b] > relGate){ sum += z[b]; n++; }
  return n ? lufs(sum / n) : -Infinity;
}
function sbDb(v){ return v > 0 ? 20 * Math.log10(v) : -Infinity; }
function sbSamplePeak(chans){
  let m = 0;
  for(const c of chans) for(let i = 0; i < c.length; i++){ const a = Math.abs(c[i]); if(a > m) m = a; }
  return sbDb(m);
}
/* True peak: 4x oversampling with a 48-tap windowed-sinc interpolator (12 taps a phase). */
const SB_TP_TAPS = (() => {
  const L = 4, N = 48, out = [];
  for(let ph = 0; ph < L; ph++){
    const t = new Float64Array(N / L);
    for(let k = 0; k < N / L; k++){
      const n = k * L + ph - N / 2;          // position on the oversampled axis
      const x = n / L;
      const sinc = x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
      const w = 0.5 + 0.5 * Math.cos(Math.PI * n / (N / 2 + 1));
      t[k] = sinc * w;
    }
    out.push(t);
  }
  return out;
})();
function sbTruePeak(chans){
  let m = 0;
  const M = SB_TP_TAPS[0].length;
  for(const c of chans){
    for(let i = 0; i < c.length; i++){ const a = Math.abs(c[i]); if(a > m) m = a; }
    for(let i = M; i < c.length; i++){
      for(let ph = 1; ph < 4; ph++){
        const t = SB_TP_TAPS[ph];
        let s = 0;
        for(let k = 0; k < M; k++) s += t[k] * c[i - k];
        const a = Math.abs(s);
        if(a > m) m = a;
      }
    }
  }
  return sbDb(m);
}

/* ── The limiter: gain, then every sample held at or under the ceiling. The gain each sample needs is
   looked for 5 ms ahead (attack) and eased back over 50 ms (release); the result is never above what the
   sample needs, so nothing passes the ceiling. Returns new channels; the input is not changed. ── */
function sbLimit(chans, fs, gainDb, ceilingDb){
  const g = Math.pow(10, gainDb / 20), c = Math.pow(10, ceilingDb / 20);
  const n = chans[0].length, A = Math.max(1, Math.round(fs * 0.005));
  const need = new Float32Array(n);
  for(let i = 0; i < n; i++){
    let pk = 0;
    for(const ch of chans){ const a = Math.abs(ch[i] * g); if(a > pk) pk = a; }
    need[i] = pk > c ? c / pk : 1;
  }
  // m[i] = the least `need` from i to i + A (a monotone queue).
  const m = new Float32Array(n), q = new Int32Array(n);
  let h = 0, tl = 0;
  for(let j = n - 1; j >= 0; j--){              // right to left: the queue holds indexes j .. j+A, least first
    while(tl > h && need[q[tl - 1]] >= need[j]) tl--;
    q[tl++] = j;
    while(q[h] > j + A) h++;
    m[j] = need[q[h]];
  }
  // env[i] = the mean of m over i-A .. i: every term is at most need[i], so env <= need (no overshoot), and it
  // eases down over the attack.
  const env = new Float32Array(n);
  let s = 0;
  for(let i = 0; i < n; i++){
    s += m[i];
    if(i - A - 1 >= 0) s -= m[i - A - 1];
    env[i] = s / Math.min(i + 1, A + 1);
    if(i < A) env[i] = Math.min(env[i], m[i]);
  }
  const rel = 1 - Math.exp(-1 / (fs * 0.05));
  let e = 1;
  for(let i = 0; i < n; i++){ e = Math.min(env[i], e + (1 - e) * rel); env[i] = e; }
  return chans.map(ch => { const o = new Float32Array(n); for(let i = 0; i < n; i++) o[i] = ch[i] * g * env[i]; return o; });
}
/* What the encoder is given: 16-bit samples, the first SB_CODEC_DELAY dropped (see THE CODEC DELAY above). */
function sbEncodeInput(chans){
  return chans.map(ch => {
    const n = Math.max(0, ch.length - SB_CODEC_DELAY), o = new Int16Array(n);
    for(let i = 0; i < n; i++){ const v = Math.round(ch[i + SB_CODEC_DELAY] * 32767); o[i] = v > 32767 ? 32767 : v < -32768 ? -32768 : v; }
    return o;
  });
}

/* ── Levelling, start to finish. `io` does what needs the browser: io.encode(int16Chans, fs) → Uint8Array (the
   mp3), io.decode(bytes, fs) → Float32Array channels, io.progress(text, frac), io.stopped() → true to give up
   (throws 'stop'). Resolves { bytes, gainDb, ceilingDb, before:{I, sp, tp}, after:{I, sp, tp}, tries } or throws
   { why: <sentence> }. ── */
async function sbLevel(src, fs, io){
  const before = { I: sbLoudness(src, fs), sp: sbSamplePeak(src), tp: sbTruePeak(src) };
  if(!Number.isFinite(before.I)) throw { why: 'the file is silent (no loudness to measure)' };
  let gain = SB_TARGET_LUFS - before.I, ceiling = SB_CEILING_DB, loss = 0, last = null;
  for(let tries = 1; tries <= SB_LEVEL_TRIES; tries++){
    if(io.stopped()) throw 'stop';
    let lim = null, L = 0;
    for(let k = 0; k < 6; k++){                     // on the samples: the gain that lands on the target after the limiter
      lim = sbLimit(src, fs, gain, ceiling);
      L = sbLoudness(lim, fs);
      const d = SB_TARGET_LUFS + loss - L;
      if(Math.abs(d) < 0.02) break;
      gain += d;
    }
    io.progress(`Encoding at ${SB_KBPS}k (try ${tries})…`, 0);
    const bytes = await io.encode(sbEncodeInput(lim), fs);
    if(io.stopped()) throw 'stop';
    io.progress('Measuring the levelled copy…', 1);
    const dec = await io.decode(bytes, fs);
    const after = { I: sbLoudness(dec, fs), sp: sbSamplePeak(dec), tp: sbTruePeak(dec) };
    last = { bytes, gainDb: gain, ceilingDb: ceiling, before, after, tries };
    const peakOk = after.sp <= SB_CEILING_DB + 1e-9 && after.tp <= SB_CEILING_DB + 1e-9;
    const off = after.I - SB_TARGET_LUFS;
    if(peakOk && Math.abs(off) <= SB_LOUD_AIM) return last;
    if(!peakOk) ceiling -= Math.max(0.1, Math.max(after.sp, after.tp) - SB_CEILING_DB + 0.05);
    loss = L - after.I;                             // what the encode itself took off: aimed for next time
    if(tries === SB_LEVEL_TRIES && peakOk && Math.abs(off) <= SB_LOUD_PASS) return last;
  }
  const a = last.after;
  throw { why: `after ${SB_LEVEL_TRIES} tries the copy measures ${a.I.toFixed(2)} LUFS (target ${SB_TARGET_LUFS}) with peaks ${a.sp.toFixed(2)} / ${a.tp.toFixed(2)} dB; send the file to Claude` };
}

/* ── Pitch: cents from A = 440 (tools/playalong-measure.py tuning_cents). The FFT is scaled to the file's
   rate so its bins are the Python tool's (16384 at 22050 Hz). { cents, n } or { cents: null, n: 0 }. ── */
function sbCents(mono, fs){
  let nfft = 1; while(nfft < 16384 * fs / 22050 * 0.75) nfft *= 2;
  const hop = nfft >> 1, win = sbHann(nfft), df = fs / nfft;
  const lo = Math.ceil(100 / df), hi = Math.floor(2000 / df);
  const devs = [], wts = [];
  const re = new Float64Array(nfft), im = new Float64Array(nfft), m = new Float64Array(hi - lo + 1);
  for(let s = 0; s + nfft < mono.length; s += hop){
    for(let i = 0; i < nfft; i++){ re[i] = mono[s + i] * win[i]; im[i] = 0; }
    sbFft(re, im);
    for(let k = lo; k <= hi; k++) m[k - lo] = Math.hypot(re[k], im[k]);
    const sorted = Float64Array.from(m).sort();
    const pos = 0.995 * (sorted.length - 1), f = Math.floor(pos);
    const thr = sorted[f] + (sorted[Math.min(f + 1, sorted.length - 1)] - sorted[f]) * (pos - f);
    for(let i = 1; i < m.length - 1; i++){
      if(!(m[i] > m[i - 1] && m[i] >= m[i + 1] && m[i] > thr)) continue;
      const a = Math.log(m[i - 1] + 1e-12), b = Math.log(m[i] + 1e-12), c = Math.log(m[i + 1] + 1e-12);
      const den = a - 2 * b + c, d = den !== 0 ? 0.5 * (a - c) / den : 0;
      const fr = (lo + i + d) * df;
      const p = 69 + 12 * Math.log2(fr / 440);
      devs.push(100 * (p - Math.round(p)));
      wts.push(m[i]);
    }
  }
  if(!devs.length) return { cents: null, n: 0 };
  const h = new Float64Array(100);
  devs.forEach((d, i) => { const k = Math.min(99, Math.max(0, Math.floor(d + 50))); h[k] += wts[i]; });
  let best = 0, bk = 0;
  for(let k = 0; k < 100; k++){ let s = 0; for(let j = k - 2; j <= k + 2; j++) if(j >= 0 && j < 100) s += h[j]; if(s > best){ best = s; bk = k; } }
  const c0 = bk - 50 + 0.5;
  let sw = 0, sx = 0, n = 0;
  devs.forEach((d, i) => { if(Math.abs(d - c0) < 15){ sw += wts[i]; sx += wts[i] * d; n++; } });
  return { cents: sw ? sx / sw : null, n };
}

/* ── The onset envelope: { env, low, fps, t0 }: frame i is at t0 + i / fps seconds. ~2.9 ms frames. ── */
const SB_BANDS = [[35, 180], [180, 1500], [1500, 8000]];
function sbOnsetEnv(mono, fs){
  let N = 1; while(N < fs * 0.0232 * 0.75) N *= 2;
  const hop = Math.max(1, Math.round(fs / 344.53)), win = sbHann(N), lag = 4;
  const nF = Math.max(0, Math.floor((mono.length - N) / hop) + 1);
  const bands = SB_BANDS.map(([lo, hi]) => [Math.max(1, Math.round(lo * N / fs)), Math.min(N / 2, Math.round(hi * N / fs))]);
  const E = bands.map(() => new Float64Array(nF));
  const re = new Float64Array(N), im = new Float64Array(N);
  for(let f = 0; f < nF; f++){
    const s = f * hop;
    for(let i = 0; i < N; i++){ re[i] = mono[s + i] * win[i]; im[i] = 0; }
    sbFft(re, im);
    bands.forEach(([a, b], k) => { let e = 0; for(let j = a; j <= b; j++) e += re[j] * re[j] + im[j] * im[j]; E[k][f] = e; });
  }
  const out = bands.map((_, k) => {
    const e = E[k];
    let mean = 0; for(let f = 0; f < nF; f++) mean += e[f]; mean = mean / Math.max(1, nF);
    const floor = 1e-3 * (mean + 1e-12);
    const o = new Float32Array(nF);
    for(let f = lag; f < nF; f++){ const d = Math.log(e[f] + floor) - Math.log(e[f - lag] + floor); o[f] = d > 0 ? d : 0; }
    const s = Float32Array.from(o).sort(), p = s[Math.floor(0.99 * (s.length - 1))] || 1;
    for(let f = 0; f < nF; f++) o[f] /= p;
    return o;
  });
  const env = new Float32Array(nF);
  for(let f = 0; f < nF; f++) env[f] = out[0][f] + out[1][f] + out[2][f];
  return { env, low: out[0], fps: fs / hop, t0: (N / 2 - lag * hop / 2) / fs - SB_ONSET_SHIFT };
}
function sbEnvAt(E, t, which){
  const e = which || E.env, x = (t - E.t0) * E.fps, i = Math.floor(x);
  if(i < 0 || i + 1 >= e.length) return 0;
  const a = x - i;
  return e[i] * (1 - a) + e[i + 1] * a;
}

/* ── Taps: the straight line through them. { bpm, phase (s, a tap time on the line), spreadMs, n } or null.
   spreadMs is how far the taps sit from that line (the standard deviation): what the screen reports. ── */
function sbTapFit(taps){
  const t = (taps || []).filter(Number.isFinite);
  if(t.length < 4) return null;
  // Number each tap by the nearest beat of the median gap, so a missed tap does not halve the tempo.
  const gaps = t.slice(1).map((x, i) => x - t[i]).sort((a, b) => a - b), g = gaps[gaps.length >> 1];
  if(!(g > 0.15 && g < 2)) return null;
  const k = [0]; for(let i = 1; i < t.length; i++) k.push(k[i - 1] + Math.max(1, Math.round((t[i] - t[i - 1]) / g)));
  const n = t.length, mk = k.reduce((a, b) => a + b) / n, mt = t.reduce((a, b) => a + b) / n;
  let sxy = 0, sxx = 0; for(let i = 0; i < n; i++){ sxy += (k[i] - mk) * (t[i] - mt); sxx += (k[i] - mk) ** 2; }
  const P = sxy / sxx, b0 = mt - P * mk;
  let ss = 0; for(let i = 0; i < n; i++) ss += (t[i] - (b0 + P * k[i])) ** 2;
  return { bpm: 60 / P, phase: b0, spreadMs: Math.sqrt(ss / Math.max(1, n - 2)) * 1000, n };
}
/* The first of `times` (beat times, s) whose own beat is at least a quarter as loud (RMS) as the song's median
   beat (tools/playalong-measure.py "FIRST LOUD PULSE": rms_per over each pulse, the median of the non-silent ones).
   Each beat is measured over its first 80% only: a grid even 1 ms late put the NEXT beat's attack in the window,
   so the last quiet beat of a soft intro passed and bar 1 landed one beat early (found 2026-11-15 on a generated
   song, tracked beats 3 ms late; tools/sb-dsp-test.mjs "first loud beat" holds it).
   `groups` (1 unless given): the times are PULSES, `groups` to a beat. The median is then taken for each place in
   the beat by itself and the loudest place's is used: the pulses between the hits hold only the hits' tails, and
   with those in one median a soft intro's hits counted as loud (2026-11-15). */
function sbFirstLoudBeat(mono, fs, times, groups){
  const loud = [], ts = [], G = Math.max(1, groups || 1);
  for(let i = 0; i + 1 < times.length; i++){
    const a = Math.max(0, Math.floor(times[i] * fs)), b = Math.min(mono.length, Math.floor((times[i] + 0.8 * (times[i + 1] - times[i])) * fs));
    let s = 0; for(let j = a; j < b; j++) s += mono[j] * mono[j];
    ts.push(times[i]); loud.push(b > a ? Math.sqrt(s / (b - a)) : 0);
  }
  let med = 0;
  for(let g = 0; g < G; g++){
    const nz = loud.filter((v, i) => i % G === g && v > 0).sort((a, b) => a - b);
    if(!nz.length) continue;
    const m = nz.length % 2 ? nz[nz.length >> 1] : (nz[nz.length / 2 - 1] + nz[nz.length / 2]) / 2;
    if(m > med) med = m;
  }
  if(!(med > 0)) return times[0];
  const k = loud.findIndex(v => v >= 0.25 * med);
  return k >= 0 ? ts[k] : times[0];
}
/* How far the music's beats sit from a list of grid beat times, in ms (music late = positive), from the
   onsets within ±range ms (100 unless given). { ms, sure }: `sure` false when no shift stands out (a quiet
   passage). */
function sbLocalOffset(E, beats, weights, range){
  const R = Math.round(range || 100), S = [];
  for(let d = -R; d <= R; d++){
    let s = 0;
    beats.forEach((t, i) => { s += (weights ? weights[i] : 1) * sbEnvAt(E, t + d / 1000); });
    S.push(s);
  }
  let k = 0; for(let i = 1; i < S.length; i++) if(S[i] > S[k]) k = i;
  let d = k - R;
  if(k > 0 && k < S.length - 1){ const a = S[k - 1], b = S[k], c = S[k + 1], den = a - 2 * b + c; if(den < 0) d += 0.5 * (a - c) / den; }
  const mean = S.reduce((a, b) => a + b) / S.length;
  return { ms: d, sure: S[k] > 0 && S[k] > 1.5 * mean };
}
/* THE BEAT TRACK (2026-11-15; before it, the phase of the BEAT in 12-second windows, which on a strummed record
   sat on the "and" and slipped between beat and "and": on the ruler record 371 of 397 beats were more than 100 ms
   off). A record is not steady, and on many the beat itself is not the clearest thing in it (strums accent the
   "and"; the kick and snare take turns). So the tracker follows the record's PULSE and its BAR, in four steps:
     1. THE PULSE. For each way a beat divides (in 2, 3, 4, 6, or not at all) the onsets' phase on that pulse is
        taken in short windows (12 pulses long, every 2 pulses) and the smoothest strong path through the windows
        is found (sbViterbi): the pulse may run up to SB_TRACK_TEMPO faster or slower than the tapped tempo from
        one window to the next. The coarsest division whose path is nearly as strong as the strongest is kept.
        The tapped tempo is then replaced by the path's own mean tempo, and the path found again.
     2. THE BAR. A pulse alone cannot count through a weak passage: one pulse more or fewer fits as well. The
        onsets of one whole bar make a PATTERN (which pulses of the bar are loud), learned from the whole song on
        the pulse's own clock; each two-bar window is then lined up with that pattern (sbPatternPass, twice), so a
        passage where the pulse lost count is put back where the bars before and after agree.
     3. FINE. On the followed clock the pulse is measured once more in 8-beat windows (sbFinePass, twice); a
        quiet window is left out. Where the record is steady the readings are averaged over a longer stretch, and
        kept as they are only where the tempo really moves (sbSteady).
     4. A beat is then COUNTED from bar 1: beat j after a time t0 is where the followed clock has moved j beats
        on from t0 (sbTrackBeatFrom). Bar 1 decides which pulse is "the beat"; nothing else does.
   E.track = { bpm (the mean tempo), sub (pulses in a beat), meter, at: [window centres, s], dev: [s], R, q }:
   the record's time t is the steady clock's time t - dev(t). Measured 2026-11-15 on the ruler record against
   397 beats marked by Moises and on the site's own beat-mapped songs: WORKFLOW "Song builder", the Beat step.
   WHAT IT CANNOT FOLLOW: a bar more than about SB_TRACK_TEMPO longer or shorter than its neighbours (a held
   note, a dropped beat, free time: the two mariachi records on the site). It does not know when that has
   happened: its own bars come out smooth either way (measured), so "Listen with clicks" stays the check. */
const SB_TRACK_SUBS = [2, 3, 4, 6];    // pulses in a beat, coarsest first; 1 (the beat itself) only when far clearer
const SB_TRACK_TEMPO = 0.08;           // how far the tempo may sit from the tapped tempo, window to window
const SB_TRACK_NB = 48;                // phase bins in one pulse (step 1)
function sbHannC(n){ const w = new Float64Array(n); for(let i = 0; i < n; i++) w[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * (i + 0.5) / n); return w; }
/* dev at a time: straight lines between the readings. Before the first reading and after the last, the slope of
   the first (last) three readings is carried on, but no further than those three span; past that the value is held
   (a record that opens slower than it goes on is still slowing back to bar 1; a long silence says nothing). */
function sbDevAt(at, dev, t){
  const n = at.length;
  if(!n) return 0;
  if(t <= at[0] || t >= at[n - 1]){
    const e = t <= at[0] ? 0 : n - 1, o = t <= at[0] ? Math.min(2, n - 1) : Math.max(0, n - 3), span = Math.abs(at[o] - at[e]);
    if(!(span > 0)) return dev[e];
    const d = Math.max(-span, Math.min(span, t - at[e]));
    return dev[e] + (dev[o] - dev[e]) / (at[o] - at[e]) * d;
  }
  let lo = 0, hi = n - 1;
  while(hi - lo > 1){ const m = (lo + hi) >> 1; if(at[m] <= t) lo = m; else hi = m; }
  return dev[lo] + (dev[lo + 1] - dev[lo]) * (t - at[lo]) / (at[lo + 1] - at[lo]);
}
function sbTrackDev(tr, t){ return sbDevAt(tr.at, tr.dev, t); }
function sbFrameDev(E, at, dev){ const w = new Float32Array(E.env.length); if(at) for(let i = 0; i < w.length; i++) w[i] = sbDevAt(at, dev, E.t0 + i / E.fps); return w; }
/* The onsets' phasors on H harmonics of a period (s), on the clock t - warp[frame], in Hann windows `win` seconds
   long centred every `hop` seconds from the start. { at, sum: [the window's onset mass], wm: [the warp's mean over
   the window, weighted as the onsets are], tc: [the time those onsets centre on: not the window's own centre at
   the two ends of the file, where half the window is empty], Z: [{ zr, zi }] per harmonic }. */
function sbPhasors(E, period, H, win, hop, warp){
  const e = E.env, n = e.length, hw = Math.max(4, Math.round(win * E.fps) >> 1), wn = sbHannC(2 * hw + 1);
  const cr = [], ci = [];
  for(let h = 0; h < H; h++){ cr.push(new Float32Array(n)); ci.push(new Float32Array(n)); }
  for(let i = 0; i < n; i++){
    const v = e[i]; if(!v) continue;
    const a = 2 * Math.PI * ((E.t0 + i / E.fps - warp[i]) / period), c1 = Math.cos(a), s1 = Math.sin(a);
    let c = c1, s = s1;
    for(let h = 0; h < H; h++){ cr[h][i] = v * c; ci[h][i] = v * s; const c2 = c * c1 - s * s1; s = s * c1 + c * s1; c = c2; }
  }
  const at = [], sum = [], wm = [], tc = [], Z = [];
  for(let h = 0; h < H; h++) Z.push({ zr: [], zi: [] });
  for(let k = 0; ; k++){
    const mid = Math.round(k * hop * E.fps);
    if(mid >= n) break;
    const a = Math.max(0, mid - hw), b = Math.min(n - 1, mid + hw);
    let m = 0, mw = 0, mt = 0; for(let i = a; i <= b; i++){ const v = wn[i - mid + hw] * e[i]; m += v; mw += v * warp[i]; mt += v * i; }
    at.push(E.t0 + mid / E.fps); sum.push(m); wm.push(m ? mw / m : warp[mid]); tc.push(E.t0 + (m ? mt / m : mid) / E.fps);
    for(let h = 0; h < H; h++){
      const x = cr[h], y = ci[h]; let r = 0, im = 0;
      for(let i = a; i <= b; i++){ const w = wn[i - mid + hw]; r += w * x[i]; im += w * y[i]; }
      Z[h].zr.push(r); Z[h].zi.push(im);
    }
  }
  return { at, sum, wm, tc, Z };
}
/* The best path through rows of scores (one row a window, NB phase bins that wrap), moving at most K bins a
   window, each bin moved costing `pen`. Returns the bins, unwrapped (they may pass NB). */
function sbViterbi(obs, NB, K, pen){
  const nW = obs.length, back = new Int8Array(nW * NB);
  let prev = new Float64Array(NB), cur = new Float64Array(NB);
  for(let w = 0; w < nW; w++){
    const o = obs[w];
    for(let b = 0; b < NB; b++){
      if(w === 0){ cur[b] = o[b]; continue; }
      let best = -Infinity, bd = 0;
      for(let d = -K; d <= K; d++){ const v = prev[((b - d) % NB + NB) % NB] - pen * Math.abs(d); if(v > best){ best = v; bd = d; } }
      cur[b] = best + o[b]; back[w * NB + b] = bd;
    }
    const t = prev; prev = cur; cur = t;
  }
  const bins = new Int32Array(nW);
  if(!nW) return bins;
  let u = 0; for(let i = 1; i < NB; i++) if(prev[i] > prev[u]) u = i;
  bins[nW - 1] = u;
  for(let w = nW - 1; w > 0; w--){ u -= back[w * NB + ((u % NB) + NB) % NB]; bins[w - 1] = u; }
  return bins;
}
/* Step 1: the pulse (a beat of P seconds in `sub`) followed through the song. { at, dev, q }: q is how much of the
   onsets' mass the path lines up (0..1). */
function sbPulsePath(E, P, sub){
  const Ps = P / sub, NB = SB_TRACK_NB, hopBeats = 2 / sub;
  const ph = sbPhasors(E, Ps, 1, 12 / sub * P, hopBeats * P, sbFrameDev(E)), nW = ph.at.length, z = ph.Z[0];
  const cosT = new Float64Array(NB), sinT = new Float64Array(NB);
  for(let b = 0; b < NB; b++){ cosT[b] = Math.cos(2 * Math.PI * b / NB); sinT[b] = Math.sin(2 * Math.PI * b / NB); }
  let mean = 0; for(const m of ph.sum) mean += m; mean /= Math.max(1, nW);
  const obs = [];
  for(let w = 0; w < nW; w++){ const row = new Float64Array(NB); for(let b = 0; b < NB; b++) row[b] = z.zr[w] * cosT[b] + z.zi[w] * sinT[b]; obs.push(row); }
  const K = Math.max(1, Math.min(NB / 2 - 1, Math.ceil(SB_TRACK_TEMPO * hopBeats * sub * NB)));
  const bins = sbViterbi(obs, NB, K, 0.002 * mean);
  let got = 0, tot = 0;
  for(let w = 0; w < nW; w++){ got += obs[w][((bins[w] % NB) + NB) % NB]; tot += ph.sum[w]; }
  return { at: ph.at, dev: Array.from(bins, v => v / NB * Ps), q: tot ? got / tot : 0 };
}
/* Step 2: the bar's pattern, learned on the followed clock (at0, dev0) and followed. { at, dev }. */
function sbPatternPass(E, P, sub, bpb, at0, dev0){
  const L = bpb * sub, Pb = P * bpb, H = Math.min(24, 2 * L), NBp = 24, NB = NBp * L;
  const ph = sbPhasors(E, Pb, H, 2 * Pb, P, sbFrameDev(E, at0, dev0)), nW = ph.at.length;
  let tot = 0; for(const m of ph.sum) tot += m;
  if(!nW || !tot) return { at: at0, dev: dev0 };
  const cosT = new Float64Array(NB), sinT = new Float64Array(NB);
  for(let b = 0; b < NB; b++){ cosT[b] = Math.cos(2 * Math.PI * b / NB); sinT[b] = Math.sin(2 * Math.PI * b / NB); }
  const obs = []; for(let w = 0; w < nW; w++) obs.push(new Float64Array(NB));
  let c2 = 0;
  for(let h = 1; h <= H; h++){
    const z = ph.Z[h - 1]; let r = 0, im = 0;
    for(let w = 0; w < nW; w++){ r += z.zr[w]; im += z.zi[w]; }
    r /= tot; im /= tot; c2 += r * r + im * im;          // the pattern's share on this harmonic
    for(let w = 0; w < nW; w++){
      const ar = r * z.zr[w] + im * z.zi[w], ai = r * z.zi[w] - im * z.zr[w], row = obs[w];
      for(let b = 0; b < NB; b++){ const k = (h * b) % NB; row[b] += ar * cosT[k] + ai * sinT[k]; }
    }
  }
  const K = Math.max(1, Math.ceil(Math.min(0.45, 0.08 * sub) * NBp));
  const bins = sbViterbi(obs, NB, K, 0.002 * tot / nW * c2);
  const res = Array.from(bins, v => v / NB * Pb), mid = res.slice().sort((a, b) => a - b)[nW >> 1], sh = Math.round(mid / Pb) * Pb;
  return { at: ph.at, dev: ph.at.map((t, w) => sbDevAt(at0, dev0, t) + res[w] - sh) };
}
/* Step 3: the pulse measured once more on the followed clock, in 8-beat windows every 2 beats: each window's new
   reading is the clock's own mean over the window plus what the onsets still sit off it (so the steps of the two
   paths before are smoothed away), and it is a reading of the moment its onsets centre on (at the start of the file
   that is later than the window's own centre: read at the centre, a record that opens 5% slow had bar 1 35 ms
   late, 2026-11-15). A window too quiet or too unclear to read (R under 0.05) is left out: the readings either
   side of it are joined by a straight line. { at, dev, R (each reading's clearness, 0..1), m (its onsets) }. */
function sbFinePass(E, P, sub, at0, dev0){
  const Ps = P / sub, ph = sbPhasors(E, Ps, 1, 8 * P, 2 * P, sbFrameDev(E, at0, dev0)), z = ph.Z[0], nW = ph.at.length;
  let mean = 0; for(const m of ph.sum) mean += m; mean /= Math.max(1, nW);
  const res = new Array(nW).fill(null), R = [];
  for(let w = 0; w < nW; w++){
    const r = ph.sum[w] ? Math.hypot(z.zr[w], z.zi[w]) / ph.sum[w] : 0;
    R.push(ph.sum[w] < 0.1 * mean ? 0 : r);
    if(R[w] >= 0.05) res[w] = Math.atan2(z.zi[w], z.zr[w]) / (2 * Math.PI) * Ps;
  }
  const at = [], dev = [], r = [], m = [];
  for(let w = 0; w < nW; w++) if(res[w] != null && !(ph.tc[w] <= at[at.length - 1] + 0.01)){ at.push(ph.tc[w]); dev.push(ph.wm[w] + res[w]); r.push(R[w]); m.push(ph.sum[w]); }
  return at.length ? { at, dev, R: r, m } : { at: at0, dev: dev0, R: at0.map(() => 0), m: at0.map(() => 0) };
}
/* Step 4: steady where the record is steady. One 8-beat reading is only so exact: about 0.014 of a pulse divided by
   its clearness R (25 ms at R 0.15 on a 110 BPM song under noise, tools/sb-dsp-test.mjs "weak onsets"), and a
   reading that far out raised a drift alarm on a steady song. So each reading is set beside the mean of the
   readings up to 12 beats either side (each weighted by its clearness squared and its onsets). Where the two agree
   within twice the reading's own exactness (the middle of three neighbours' differences, so one stray reading
   does not count) the mean is used; where they differ by four times it or more, the tempo is really moving and the
   reading is kept; between, a share of each. */
function sbSteady(f, Ps){
  const n = f.at.length, out = new Array(n), mean = new Array(n), SPAN = 6;
  for(let w = 0; w < n; w++){
    let sw = 0, sx = 0;
    for(let j = Math.max(0, w - SPAN); j <= Math.min(n - 1, w + SPAN); j++){ const g = f.R[j] * f.R[j] * f.m[j] * (1 - Math.abs(j - w) / (SPAN + 1)); sw += g; sx += g * f.dev[j]; }
    mean[w] = sw ? sx / sw : f.dev[w];
  }
  for(let w = 0; w < n; w++){
    const d = [w - 1, w, w + 1].filter(j => j >= 0 && j < n).map(j => Math.abs(f.dev[j] - mean[j])).sort((a, b) => a - b);
    const sigma = 0.014 * Ps / Math.max(0.02, f.R[w]), share = Math.max(0, Math.min(1, d[d.length >> 1] / (2 * sigma) - 1));
    out[w] = mean[w] + share * (f.dev[w] - mean[w]);
  }
  return out;
}
/* The whole track from a tempo. `fixed` = { sub }: this tempo and division exactly (a draft opened again finds the
   very track it was saved with: beat.trackBpm, beat.trackSub). Without it the division is chosen and the tempo
   moved to the path's own mean (three times at most, until it moves under 0.1%). */
function sbTrack(E, bpm0, meter, fixed){
  const bpb = (SB_METER[meter] || SB_METER['4/4']).bpb;
  let bpm = bpm0, sub = fixed && fixed.sub;
  if(!sub){
    const q = {}; let top = 0;
    for(const s of SB_TRACK_SUBS){ q[s] = sbPulsePath(E, 60 / bpm, s).q; if(q[s] > top) top = q[s]; }
    sub = sbPulsePath(E, 60 / bpm, 1).q > top / 0.75 ? 1 : SB_TRACK_SUBS.find(s => q[s] >= 0.75 * top);
    for(let i = 0; i < 3; i++){
      const p = sbPulsePath(E, 60 / bpm, sub), n = p.at.length;
      if(n < 4) break;
      const mt = p.at.reduce((a, b) => a + b) / n, md = p.dev.reduce((a, b) => a + b) / n;
      let sxy = 0, sxx = 0; for(let w = 0; w < n; w++){ sxy += (p.at[w] - mt) * (p.dev[w] - md); sxx += (p.at[w] - mt) ** 2; }
      const slope = sxx ? sxy / sxx : 0;
      bpm = bpm / (1 + slope);
      if(Math.abs(slope) < 0.001) break;
    }
    bpm = Math.round(bpm * 10000) / 10000;
  }
  const P = 60 / bpm, p1 = sbPulsePath(E, P, sub);
  let t = sbPatternPass(E, P, sub, bpb, p1.at, p1.dev);
  t = sbPatternPass(E, P, sub, bpb, t.at, t.dev);
  let f = sbFinePass(E, P, sub, t.at, t.dev);
  f = sbFinePass(E, P, sub, f.at, f.dev);
  return { bpm, sub, meter, at: f.at, dev: sbSteady(f, P / sub), R: f.R, q: p1.q };
}
/* The record's time at the followed clock's time u (the clock runs steady at tr.bpm; the record is dev late). */
function sbTrackAtClock(tr, u){
  let t = u + sbTrackDev(tr, u);
  for(let i = 0; i < 8; i++){ const t2 = u + sbTrackDev(tr, t); if(Math.abs(t2 - t) < 1e-5) return t2; t = t2; }
  return t;
}
/* The beat j beats after (before, j < 0) the one at time t0, on the followed clock; j need not be whole. */
function sbTrackBeatFrom(tr, t0, j){ return sbTrackAtClock(tr, t0 - sbTrackDev(tr, t0) + j * 60 / tr.bpm); }
/* Every pulse of the track from the start of the file to `durationSec`: [{ k, t }]. The pulses sit at whole
   numbers of pulses on the clock (the fine pass put them there); k mod sub is the pulse's place in a beat, and which
   place is "the beat" is bar 1's to say. */
function sbTrackPulses(tr, durationSec){
  const Ps = 60 / tr.bpm / tr.sub, out = [];
  for(let k = Math.floor(-sbTrackDev(tr, 0) / Ps) - 1; out.length < 20000; k++){
    const t = sbTrackAtClock(tr, k * Ps);
    if(t > durationSec) break;
    if(t >= 0) out.push({ k, t });
  }
  return out;
}
/* Which pulse of the beat the taps fall on (0 .. sub-1), or null when they do not say (fewer than 4, scattered, or
   nearer the middle between two pulses than to either). People tap on the beat, so that pulse IS the beat. */
function sbTapPulse(tr, taps){
  const t = (taps || []).filter(Number.isFinite), P = 60 / tr.bpm;
  if(t.length < 4) return null;
  let zr = 0, zi = 0;
  t.forEach(x => { const a = 2 * Math.PI * ((x - sbTrackDev(tr, x)) / P); zr += Math.cos(a); zi += Math.sin(a); });
  if(Math.hypot(zr, zi) / t.length < 0.5) return null;
  const f = ((Math.atan2(zi, zr) / (2 * Math.PI)) % 1 + 1) % 1 * tr.sub, j = Math.round(f);
  return Math.abs(f - j) > 0.3 ? null : j % tr.sub;
}

/* ── The grid. beat = { meter, bpm, anchor, pins: [{ bar, t }] } (pins: bars other than 1, each set on the
   music). Bar 1 starts at `anchor`; with no other pin every bar is bpm apart; with pins, straight lines from
   pin to pin (bar 1 is a pin). Past the last pin: with two pins, that line carried on; with three or more, the
   curve through the last three (a record that speeds up or slows down keeps doing so for the bars after its
   last pin: tools/sb-dsp-test.mjs, the slow-drift case, 11.6 ms off at its last bar with the line). ── */
function sbBarSec(beat){ return (SB_METER[beat.meter] || SB_METER['4/4']).bpb * 60 / beat.bpm; }
function sbPins(beat){
  const ps = [{ bar: 1, t: beat.anchor }];
  (beat.pins || []).forEach(p => { if(p && p.bar > 1 && Number.isFinite(p.t)) ps.push({ bar: p.bar, t: p.t }); });
  return ps.sort((a, b) => a.bar - b.bar);
}
function sbBarTime(beat, bar){
  /* A beat that came with an IMPORTED song (teacher-sb-publish.js, sbDraftFromDoc) may carry its own bar times: they
     are the truth, kept exactly; past the last one, the last bars' average length. */
  const bt = beat.barTimes;
  if(Array.isArray(bt) && bt.length >= 2){
    const i = bar - 1, last = bt.length - 1;
    if(i >= 0 && i <= last) return bt[i];
    const avg = (bt[last] - bt[0]) / last;
    return i < 0 ? bt[0] + i * avg : bt[last] + (i - last) * avg;
  }
  const ps = sbPins(beat);
  if(ps.length < 2) return beat.anchor + (bar - 1) * sbBarSec(beat);
  const L = ps.length;
  if(L >= 3 && bar > ps[L - 1].bar){
    const [a, b, c] = ps.slice(L - 3), x = bar;
    return a.t * (x - b.bar) * (x - c.bar) / ((a.bar - b.bar) * (a.bar - c.bar))
      + b.t * (x - a.bar) * (x - c.bar) / ((b.bar - a.bar) * (b.bar - c.bar))
      + c.t * (x - a.bar) * (x - b.bar) / ((c.bar - a.bar) * (c.bar - b.bar));
  }
  let i = 0; while(i < ps.length - 2 && bar > ps[i + 1].bar) i++;
  const a = ps[i], b = ps[i + 1];
  return a.t + (bar - a.bar) * (b.t - a.t) / (b.bar - a.bar);
}
/* The tempo the pins give (first to last pin), or beat.bpm with one pin. */
function sbPinBpm(beat){
  const ps = sbPins(beat);
  if(ps.length < 2) return beat.bpm;
  const a = ps[0], b = ps[ps.length - 1];
  return (SB_METER[beat.meter] || SB_METER['4/4']).bpb * 60 * (b.bar - a.bar) / (b.t - a.t);
}
/* The bars that fit in the file: every bar whose end is inside it. */
function sbBarsIn(beat, durationSec){
  let n = 0; while(n < 2000 && sbBarTime(beat, n + 2) <= durationSec + 0.05) n++;
  return n;
}
/* barTimes for a chart of nBars bars: only with three or more pins (bar 1 and two more); else null (anchor + bpm). */
function sbBarTimes(beat, nBars){
  if(sbPins(beat).length < 3) return null;
  const out = [];
  for(let b = 1; b <= nBars + 1; b++) out.push(Math.round(sbBarTime(beat, b) * 1000) / 1000);
  return out;
}
/* The grid's beat times (s) for bars b0 .. b1-1, with each beat's weight (a downbeat counts double). */
function sbGridBeats(beat, b0, b1){
  const bpb = (SB_METER[beat.meter] || SB_METER['4/4']).bpb, t = [], w = [];
  for(let b = b0; b < b1; b++){
    const s = sbBarTime(beat, b), e = sbBarTime(beat, b + 1);
    for(let k = 0; k < bpb; k++){ t.push(s + (e - s) * k / bpb); w.push(k === 0 ? 2 : 1); }
  }
  return { t, w };
}
/* Where the music puts bar `bar`: { t (s), ms (music late of the grid = positive), sure }. With a beat track
   (E.track, sbAutoGrid) the bar is FOLLOWED: its beats are counted from bar 1 on the followed clock (sbTrackBeatFrom),
   then every pulse of the 4 bars around it is lined up with the onsets, ±30 ms (2026-11-15; before: the beats only,
   ±60 ms, which on a strummed record pulled a pin up to 80 ms toward the strums beside the beat). Without a track,
   the grid's own bar is lined up (±100 ms). */
function sbFindBar(E, beat, bar){
  const pred = sbBarTime(beat, bar), bpb = (SB_METER[beat.meter] || SB_METER['4/4']).bpb;
  if(E.track && E.track.at.length){
    const tr = E.track, S = tr.sub, k = (bar - 1) * bpb, t = [], w = [];
    for(let j = (k - 2 * bpb) * S; j < (k + 2 * bpb) * S; j++){
      t.push(sbTrackBeatFrom(tr, beat.anchor, j / S));
      w.push(j === k * S ? 3 : j % S ? 1 : (j / S - k) % bpb === 0 ? 2 : 1.5);
    }
    const o = sbLocalOffset(E, t, w, 30), at = t[2 * bpb * S] + o.ms / 1000;
    return { t: at, ms: (at - pred) * 1000, sure: o.sure };
  }
  const g = sbGridBeats(beat, Math.max(1, bar - 2), bar + 2);
  const o = sbLocalOffset(E, g.t, g.w);
  return { t: pred + o.ms / 1000, ms: o.ms, sure: o.sure };
}
/* The followed bars 1 .. last, straight off the beat track (no lining up with the onsets): [s], [0] = bar 1. */
function sbFollowedBars(E, beat, last){
  const bpb = (SB_METER[beat.meter] || SB_METER['4/4']).bpb, out = [];
  for(let b = 1; b <= last; b++) out.push(sbTrackBeatFrom(E.track, beat.anchor, (b - 1) * bpb));
  return out;
}
/* The drift check: about every 12 bars from bar 5 to near the last bar, how far the music sits from the grid; and,
   with a beat track, the ONE bar of the whole song that sits furthest from the grid when that is over SB_DRIFT_MS
   and no listed window is within 2 bars of it (the fixed windows alone passed a grid that was 200 ms off between
   two of them: the ruler record's slow first bars, 2026-11-15). [{ bar, ms, sure, pinned, t }], by bar. */
function sbDrift(E, beat, durationSec){
  const last = sbBarsIn(beat, durationSec);
  if(last < 6) return [];
  const n = Math.max(2, Math.min(8, Math.round((last - 4) / 12))), out = [];
  const pinned = new Set((beat.pins || []).map(p => p.bar));
  const add = bar => { const f = sbFindBar(E, beat, bar); out.push({ bar, ms: Math.round(f.ms), sure: f.sure, pinned: pinned.has(bar), t: f.t }); };
  for(let k = 0; k < n; k++){
    const bar = Math.round(5 + k * (last - 3 - 5) / (n - 1));
    if(!out.some(o => o.bar === bar)) add(bar);
  }
  if(E.track && E.track.at.length){
    const tb = sbFollowedBars(E, beat, last - 2);
    let worst = 0, wv = SB_DRIFT_MS / 1000;
    for(let b = 2; b <= tb.length; b++){ const d = Math.abs(tb[b - 1] - sbBarTime(beat, b)); if(d > wv && !pinned.has(b)){ wv = d; worst = b; } }
    if(worst && !out.some(o => Math.abs(o.bar - worst) <= 2)) add(worst);
  }
  return out.sort((a, b) => a.bar - b.bar);
}
/* How many pins this record needs: pins are put on the followed bars one at a time, each on the bar furthest from
   the straight lines between the pins so far (bar 1 and the last followed bar to start), until every bar is within
   SB_DRIFT_MS. { pins (bar 1 counted; 2 = a steady record), worstMs (the furthest bar with bar 1 and the end only) }.
   Null without a beat track. The last two bars are left out, as the end pin leaves them out. */
function sbPinsNeeded(E, beat, durationSec){
  if(!E.track || !E.track.at.length) return null;
  const tb = sbFollowedBars(E, beat, Math.max(2, sbBarsIn(beat, durationSec) - 2)), pins = [0, tb.length - 1];
  const at = n => { let i = 0; while(i < pins.length - 2 && n > pins[i + 1]) i++; const a = pins[i], b = pins[i + 1]; return tb[a] + (n - a) * (tb[b] - tb[a]) / (b - a); };
  let worstMs = 0;
  for(let it = 0; it < 60; it++){
    let w = -1, wv = SB_DRIFT_MS / 1000;
    for(let n = 0; n < tb.length; n++){ const e = Math.abs(tb[n] - at(n)); if(e > wv){ wv = e; w = n; } }
    if(it === 0) worstMs = w < 0 ? 0 : Math.round(wv * 1000);
    if(w < 0) break;
    pins.push(w); pins.sort((a, b) => a - b);
  }
  return { pins: pins.length, worstMs };
}
/* From taps (or a typed bpm) to a whole grid: the beat track (kept on E), bar 1 on the first loud beat, and a pin
   two bars from the end where the music is. `taps` (the tap times, when there are any) say which pulse of the track
   is the beat; without them bar 1 is the first loud PULSE (a record that opens on a pickup then needs bar 1 moved).
   { beat, q } — beat = { meter, bpm, anchor, pins }. */
function sbAutoGrid(E, mono, fs, durationSec, meter, bpm0, taps){
  const tr = E.track = sbTrack(E, bpm0, meter);
  const on = sbTapPulse(tr, taps), pulses = sbTrackPulses(tr, durationSec);
  const times = pulses.filter(p => on == null || ((p.k - on) % tr.sub + tr.sub) % tr.sub === 0).map(p => p.t);
  let beat = { meter, bpm: tr.bpm, anchor: times.length ? sbFirstLoudBeat(mono, fs, times, on == null ? tr.sub : 1) : 0, pins: [] };
  const a = sbFindBar(E, beat, 1);
  if(a.sure && a.t >= 0) beat.anchor = a.t;
  const last = sbBarsIn(beat, durationSec);
  if(last >= 8){
    const bar = last - 2, f = sbFindBar(E, beat, bar);
    if(f.sure) beat.pins = [{ bar, t: Math.round(f.t * 10000) / 10000 }];
    beat.bpm = sbPinBpm(beat);
  }
  beat.anchor = Math.round(beat.anchor * 10000) / 10000;
  return { beat, q: tr.q };
}

/* ── Waveform peaks for drawing: per column the min and max of the mono samples over [t0, t1). ── */
function sbPeaks(mono, fs, t0, t1, cols){
  const out = new Float32Array(cols * 2), per = (t1 - t0) * fs / cols;
  for(let c = 0; c < cols; c++){
    let lo = 0, hi = 0;
    const a = Math.max(0, Math.floor(t0 * fs + c * per)), b = Math.min(mono.length, Math.floor(t0 * fs + (c + 1) * per));
    const st = Math.max(1, Math.floor((b - a) / 400));
    for(let i = a; i < b; i += st){ const v = mono[i]; if(v < lo) lo = v; if(v > hi) hi = v; }
    out[2 * c] = lo; out[2 * c + 1] = hi;
  }
  return out;
}
