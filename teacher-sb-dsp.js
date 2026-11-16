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

   THE BEAT (sbOnsetEnv, sbRefineBpm, sbLocalOffset, the grid). The onset envelope is three bands (low 35-180,
   mid 180-1500, high 1500-8000 Hz, as tools/beat-audit.py) of short-time energy, the rise of its log,
   each band scaled by its 99th percentile and added. The teacher's taps (or a typed BPM) give a tempo; the
   audio refines it (sbRefineBpm: the tempo near it whose beat grid the onsets line up with best over the
   whole song, the phase coherence of tools/playalong-measure.py); bar 1 starts on the first LOUD beat (the
   first beat whose next second is a quarter of the song's median loudness, as playalong-measure.py; the
   teacher can move it). Two PINS fix the grid: bar 1 and one bar near the end, each set where the music's
   beats are (sbLocalOffset: the shift of a few bars of grid that lines the onsets up best). The drift check
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
/* Phase coherence of the onsets on a grid of period P: { R (0..1), phase (s, 0..P) }. `step` frames apart. */
function sbCoherence(E, P, step){
  const e = E.env, s = step || 1;
  let zr = 0, zi = 0, tot = 0;
  for(let i = 0; i < e.length; i += s){
    const v = e[i]; if(!v) continue;
    const a = 2 * Math.PI * ((E.t0 + i / E.fps) / P);
    zr += v * Math.cos(a); zi += v * Math.sin(a); tot += v;
  }
  const ph = ((Math.atan2(zi, zr) / (2 * Math.PI)) % 1 + 1) % 1;
  return { R: tot ? Math.hypot(zr, zi) / tot : 0, phase: ph * P };
}
/* The tempo within ±1.5% of bpm0 whose grid the whole song's onsets line up with best: { bpm, phase, R }. */
function sbRefineBpm(E, bpm0){
  let best = { R: -1 };
  for(let b = bpm0 * 0.985; b <= bpm0 * 1.015; b += bpm0 * 0.0002){
    const c = sbCoherence(E, 60 / b, 4);
    if(c.R > best.R) best = { R: c.R, bpm: b };
  }
  const b1 = best.bpm;
  for(let b = b1 - bpm0 * 0.0003; b <= b1 + bpm0 * 0.0003; b += bpm0 * 0.00001){
    const c = sbCoherence(E, 60 / b, 1);
    if(c.R > best.R || best.phase === undefined) best = { R: c.R, bpm: b, phase: c.phase };
  }
  return best;
}
/* The first of `times` (beat times, s) whose own beat is at least a quarter as loud (RMS) as the song's median
   beat (tools/playalong-measure.py "FIRST LOUD PULSE": rms_per over each pulse, the median of the non-silent ones).
   Each beat is measured over its first 80% only: a grid even 1 ms late put the NEXT beat's attack in the window,
   so the last quiet beat of a soft intro passed and bar 1 landed one beat early (found 2026-11-15 on a generated
   song, tracked beats 3 ms late; tools/sb-dsp-test.mjs "first loud beat" holds it). */
function sbFirstLoudBeat(mono, fs, times){
  const loud = [], ts = [];
  for(let i = 0; i + 1 < times.length; i++){
    const a = Math.max(0, Math.floor(times[i] * fs)), b = Math.min(mono.length, Math.floor((times[i] + 0.8 * (times[i + 1] - times[i])) * fs));
    if(b <= a) continue;
    let s = 0; for(let j = a; j < b; j++) s += mono[j] * mono[j];
    ts.push(times[i]); loud.push(Math.sqrt(s / (b - a)));
  }
  const nz = loud.filter(v => v > 0).sort((a, b) => a - b);
  if(!nz.length) return times[0];
  const med = nz.length % 2 ? nz[nz.length >> 1] : (nz[nz.length / 2 - 1] + nz[nz.length / 2]) / 2;
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
/* THE BEAT TRACK. A record that drifts can sit hundreds of ms off one straight grid in mid-song, further than any
   local search should look, so each beat is FOLLOWED instead: the phase of the onsets on the refined tempo's grid
   in 12-second windows every 4 seconds (tools/playalong-measure.py phase_track), each step unwrapped against the
   one before (a window moves less than half a beat from the last), centred so the song's middle window is 0.
   E.track = { bpm, phase, at: [window centres], dev: [s] }. Beat k of the song is then at
   phase + k·P + dev(that time): the same beat all through the song, so bar n is always the bar n beats count to. */
function sbPhaseTrack(E, bpm, phase){
  const P = 60 / bpm, e = E.env, W = Math.round(12 * E.fps), H = Math.round(4 * E.fps);
  let tot = 0; for(let i = 0; i < e.length; i++) tot += e[i];
  const avg = tot / Math.max(1, e.length), at = [], dev = [];
  for(let s = 0; s + W / 2 < e.length; s += H){
    let zr = 0, zi = 0, sum = 0;
    for(let i = s; i < Math.min(e.length, s + W); i++){
      const v = e[i]; if(!v) continue;
      const a = 2 * Math.PI * ((E.t0 + i / E.fps) / P);
      zr += v * Math.cos(a); zi += v * Math.sin(a); sum += v;
    }
    if(sum < 0.1 * avg * W) continue;              // a near-silent window says nothing
    const ph = ((Math.atan2(zi, zr) / (2 * Math.PI)) % 1 + 1) % 1 * P;
    let d = ph - phase; d -= Math.round(d / P) * P;
    if(dev.length){ const prev = dev[dev.length - 1]; d = prev + (d - prev) - Math.round((d - prev) / P) * P; }
    at.push(E.t0 + (s + Math.min(W, e.length - s) / 2) / E.fps); dev.push(d);
  }
  if(dev.length){ const mid = dev.slice().sort((a, b) => a - b)[dev.length >> 1], sh = Math.round(mid / P) * P; for(let i = 0; i < dev.length; i++) dev[i] -= sh; }
  return { bpm, phase, at, dev };
}
function sbTrackDev(tr, t){
  const a = tr.at, d = tr.dev;
  if(!a.length) return 0;
  if(t <= a[0]) return d[0];
  if(t >= a[a.length - 1]) return d[d.length - 1];
  let i = 0; while(a[i + 1] < t) i++;
  return d[i] + (d[i + 1] - d[i]) * (t - a[i]) / (a[i + 1] - a[i]);
}
/* Beat k of the track: its time (s). And the k of the tracked beat nearest a time. */
function sbTrackBeat(tr, k){ const P = 60 / tr.bpm, g = tr.phase + k * P; return g + sbTrackDev(tr, g); }
function sbTrackK(tr, t){
  const P = 60 / tr.bpm;
  let k = Math.round((t - tr.phase) / P);
  for(let i = 0; i < 4; i++){ const k2 = Math.round((t - tr.phase - sbTrackDev(tr, tr.phase + k * P)) / P); if(k2 === k) break; k = k2; }
  return k;
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
   (E.track, sbAutoGrid) the bar is FOLLOWED: bar 1 is the tracked beat nearest the anchor, bar n is that beat
   plus (n-1) bars of tracked beats, then the 4 bars around it are lined up with the onsets (±60 ms). Without one,
   the grid's own bar is lined up (±100 ms). */
function sbFindBar(E, beat, bar){
  const pred = sbBarTime(beat, bar), bpb = (SB_METER[beat.meter] || SB_METER['4/4']).bpb;
  if(E.track && E.track.at.length){
    const tr = E.track, k1 = sbTrackK(tr, beat.anchor), k = k1 + (bar - 1) * bpb, t = [], w = [];
    for(let j = k - 2 * bpb; j < k + 2 * bpb; j++){ t.push(sbTrackBeat(tr, j)); w.push(j === k ? 3 : (j - k) % bpb === 0 ? 2 : 1); }
    const o = sbLocalOffset(E, t, w, 60), at = sbTrackBeat(tr, k) + o.ms / 1000;
    return { t: at, ms: (at - pred) * 1000, sure: o.sure };
  }
  const g = sbGridBeats(beat, Math.max(1, bar - 2), bar + 2);
  const o = sbLocalOffset(E, g.t, g.w);
  return { t: pred + o.ms / 1000, ms: o.ms, sure: o.sure };
}
/* The drift check: about every 12 bars from bar 5 to near the last bar, how far the music sits from the grid.
   [{ bar, ms, sure, pinned }]. */
function sbDrift(E, beat, durationSec){
  const last = sbBarsIn(beat, durationSec);
  if(last < 6) return [];
  const n = Math.max(2, Math.min(8, Math.round((last - 4) / 12))), out = [];
  const pinned = new Set((beat.pins || []).map(p => p.bar));
  for(let k = 0; k < n; k++){
    const bar = Math.round(5 + k * (last - 3 - 5) / (n - 1));
    if(out.some(o => o.bar === bar)) continue;
    const f = sbFindBar(E, beat, bar);
    out.push({ bar, ms: Math.round(f.ms), sure: f.sure, pinned: pinned.has(bar), t: f.t });
  }
  return out;
}
/* From taps (or a typed bpm) to a whole grid: the refined tempo, its beat track (kept on E), bar 1 on the first
   loud tracked beat, and a pin two bars from the end where the music is. { beat, R } — beat = { meter, bpm,
   anchor, pins }. */
function sbAutoGrid(E, mono, fs, durationSec, meter, bpm0, again){
  const r = sbRefineBpm(E, bpm0), P = 60 / r.bpm;
  E.track = sbPhaseTrack(E, r.bpm, r.phase);
  const times = [];
  for(let k = Math.ceil(-r.phase / P) - 1; ; k++){ const t = sbTrackBeat(E.track, k); if(t > durationSec) break; if(t >= 0) times.push(t); }
  let beat = { meter, bpm: r.bpm, anchor: sbFirstLoudBeat(mono, fs, times), pins: [] };
  const a = sbFindBar(E, beat, 1);
  if(a.sure && a.t >= 0) beat.anchor = a.t;
  const last = sbBarsIn(beat, durationSec);
  if(last >= 8){
    const bar = last - 2, f = sbFindBar(E, beat, bar);
    if(f.sure) beat.pins = [{ bar, t: Math.round(f.t * 10000) / 10000 }];
    beat.bpm = sbPinBpm(beat);
  }
  /* Taps more than 1.5% off leave the refined tempo off too (the search stays within 1.5% of the taps), and bar 1
     was found on that tempo's beat track: 39 ms late from taps 5% fast (2026-11-15). The end pin measures the true
     tempo, so when it moved the tempo more than 0.3%, the grid is worked out once more from the pinned tempo. */
  if(!again && Math.abs(beat.bpm - r.bpm) > 0.003 * r.bpm) return sbAutoGrid(E, mono, fs, durationSec, meter, beat.bpm, true);
  beat.anchor = Math.round(beat.anchor * 10000) / 10000;
  return { beat, R: r.R };
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
