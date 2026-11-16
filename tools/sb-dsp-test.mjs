#!/usr/bin/env node
/* sb-dsp-test.mjs — the Song builder's sound measurements (teacher-sb-dsp.js) on GENERATED signals only
   (tones, clicks, noise made here; never a real record). Song builder Part b, 2026-11-15.

     node tools/sb-dsp-test.mjs           the quick cases (Node only, about 20 s): checks.mjs runs these and pins
                                          their count (1ef)
     node tools/sb-dsp-test.mjs --full    also against ffmpeg and the Python tools (needs ffmpeg, python3 with
                                          numpy): loudness against ffmpeg's ebur128 (tools/loudness.py's
                                          measure), pitch against tools/playalong-measure.py's TUNING, and the
                                          whole levelling with the vendored encoder (vendor/lamejs), the result
                                          decoded and measured by ffmpeg (loudness, both peaks, constant bitrate,
                                          length, the lag against the source). A few minutes.
     --break=<name>                       runs a copy of teacher-sb-dsp.js with one planted fault (the list is
                                          BREAKS below); the run must go red

   QUICK CASES
     loudness  the EBU Tech 3341 case (a 1 kHz sine at -23 dBFS in both channels reads -23.0 ±0.1 LUFS), the
               gates (a quiet passage below -70 LUFS and one 10 LU under the rest change nothing), 48 kHz and
               mono reading the same as 44.1 kHz stereo, the target constant is the cure's -12.505
     limiter   a hot signal (+12 dB of gain on peaks near full scale) never passes the ceiling, sample for sample;
               a quiet signal under the ceiling passes through untouched (gain only)
     codec     the encoder's input drops exactly SB_CODEC_DELAY samples
     pitch     harmonic chord tones made at -14, -7, 0, +7 and +14 cents read within ±2 cents of what they were
               made at; the 10-cent block falls on the right side of each
     beat      four click tracks (4/4 at 96 with a quiet intro, 6/8 counted in two, a slow drift of +1.5% over the
               song, weak onsets under noise), taps made from the true beats with 30 ms of scatter: the whole
               fit (taps → refined tempo → bar 1 → the end pin → the drift check → a pin on each window over
               30 ms) puts bar 1 and the LAST bar within 10 ms of where they are
     taps      the tap fit names the scatter it was given (20 to 40 ms), and a missed tap does not halve the tempo
     mp3       sbMp3Info reads the rate, channels and bitrate of a frame header (behind an ID3 tag too)
   Prints "sb-dsp-test: N cases, F failed" and exits 1 on any failure. */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FULL = process.argv.includes('--full');
const BREAK = (process.argv.find(a => a.startsWith('--break=')) || '').slice(8);
let src = readFileSync(join(ROOT, 'teacher-sb-dsp.js'), 'utf8');

/* Planted faults: each must turn the run red. */
const BREAKS = {
  'no-gate': ['if(z[b] > absGate && z[b] > relGate)', 'if(z[b] > absGate)'],
  'k-weight': ['const Vh = Math.pow(10, G / 20)', 'const Vh = Math.pow(10, G / 40)'],
  'limiter-attack': ['m[j] = need[q[h]];', 'm[j] = need[j];'],
  'codec-delay': ['const SB_CODEC_DELAY = 1105;', 'const SB_CODEC_DELAY = 0;'],
  'cents-sign': ['devs.push(100 * (p - Math.round(p)));', 'devs.push(100 * (Math.round(p) - p));'],
  'refine-off': ['for(let b = bpm0 * 0.985; b <= bpm0 * 1.015; b += bpm0 * 0.0002){', 'for(let b = bpm0; b <= bpm0; b += 1){'],
  'no-end-pin': ['if(f.sure) beat.pins = [{ bar, t: Math.round(f.t * 10000) / 10000 }];', ''],
  'onset-shift': ['const SB_ONSET_SHIFT = 0.0;', 'const SB_ONSET_SHIFT = 0.02;'],
  'first-loud-window': ['Math.floor((times[i] + 0.8 * (times[i + 1] - times[i])) * fs)', 'Math.floor(times[i + 1] * fs)'],
  'no-second-pass': ['if(!again && Math.abs(beat.bpm - r.bpm) > 0.003 * r.bpm)', 'if(false)'],
  'tap-spread': ['spreadMs: Math.sqrt(ss / Math.max(1, n - 2)) * 1000', 'spreadMs: Math.sqrt(ss / Math.max(1, n - 2)) * 100'],
};
if(BREAK){
  const b = BREAKS[BREAK];
  if(!b || !src.includes(b[0])){ console.error('sb-dsp-test: no such break, or its line is gone: ' + BREAK); process.exit(2); }
  src = src.replace(b[0], b[1]);
}
const ctx = { console, Math, Float32Array, Float64Array, Int16Array, Int32Array, Uint8Array, Number, Array, Set, Object, JSON, Promise };
vm.createContext(ctx);
vm.runInContext(src + '\n;globalThis.__sb = { SB_TARGET_LUFS, SB_CEILING_DB, SB_CODEC_DELAY, SB_KBPS, SB_MAX_CENTS, sbMp3Info, sbLoudness, sbSamplePeak, sbTruePeak, sbLimit, sbEncodeInput, sbLevel, sbCents, sbMono, sbOnsetEnv, sbTapFit, sbAutoGrid, sbFirstLoudBeat, sbFindBar, sbDrift, sbBarTime, sbBarsIn, sbBarTimes, sbPinBpm };', ctx);
const S = ctx.__sb;

let cases = 0, failed = 0;
const lines = [];
function check(name, ok, detail){ cases++; if(!ok) failed++; lines.push(`  ${ok ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`); }

/* ── signal makers (a fixed seed: every run makes the same samples) ── */
let seed = 12345;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const noise = () => rnd() * 2 - 1;
function sine(fs, sec, hz, dbfs, ch = 2){ const n = Math.round(fs * sec), a = Math.pow(10, dbfs / 20), x = new Float32Array(n); for(let i = 0; i < n; i++) x[i] = a * Math.sin(2 * Math.PI * hz * i / fs); return Array.from({ length: ch }, () => x.slice()); }
function cat(...parts){ const ch = parts[0].length; return Array.from({ length: ch }, (_, c) => { const n = parts.reduce((s, p) => s + p[c].length, 0), o = new Float32Array(n); let k = 0; for(const p of parts){ o.set(p[c], k); k += p[c].length; } return o; }); }
/* A made-up "song": chord tones (three harmonic notes) changing every bar, a kick on every beat (louder on 1), a
   hat on the off-beats, and noise; a quiet intro of `introSec`. Beat times come from `beatAt(k)` (k = 0, 1, …). */
function song(fs, sec, o){
  const n = Math.round(fs * sec), L = new Float32Array(n), R = new Float32Array(n);
  const chords = [[220, 277.18, 329.63], [196, 246.94, 293.66], [174.61, 220, 261.63], [164.81, 207.65, 246.94]];
  const cents = o.cents || 0, k0 = Math.pow(2, cents / 1200);
  for(let i = Math.max(0, Math.round(o.beatAt(0) * fs)); i < n; i++){ const nz = noise() * (o.noise || 0.01); L[i] = nz; R[i] = nz; }   // the band's noise starts with the band
  let k = 0;
  for(;;){
    const t = o.beatAt(k); if(t >= sec - 0.05) break;
    const next = o.beatAt(k + 1), barBeat = k % o.bpb, bar = Math.floor(k / o.bpb);
    const loud = t < (o.introSec || 0) ? 0.05 : 1;
    const a = Math.round(t * fs), b = Math.min(n, Math.round(next * fs));
    const ch = chords[bar % 4];
    for(let i = a; i < b; i++){
      const tt = (i - a) / fs;
      const atk = o.soft ? Math.min(1, tt / 0.03) : 1;
      const kick = (barBeat === 0 ? 0.55 : 0.32) * Math.exp(-tt * 30) * Math.sin(2 * Math.PI * 55 * tt) * atk;
      let tone = 0; for(const f of ch) for(let h = 1; h <= 3; h++) tone += Math.sin(2 * Math.PI * f * k0 * h * (i / fs)) / (h * 6);
      const v = loud * (kick * (o.soft ? 0.5 : 1) + tone * 0.35 * Math.exp(-tt * 1.5));
      L[i] += v; R[i] += v * 0.95;
    }
    if(!o.noHat){ const h = Math.round((t + (next - t) / 2) * fs); for(let i = h; i < Math.min(n, h + Math.round(fs * 0.02)); i++){ const v = loud * 0.08 * noise() * Math.exp(-(i - h) / fs * 200); L[i] += v; R[i] += v; } }
    k++;
  }
  return [L, R];
}
const T = S.SB_TARGET_LUFS;
const FS = 44100;

/* ── loudness ── */
{
  const tone = sine(FS, 20, 1000, -23);
  const I = S.sbLoudness(tone, FS);
  check('loudness: EBU Tech 3341 case 1 (1 kHz at -23 dBFS, stereo) reads -23.0 ±0.1 LUFS', Math.abs(I + 23) <= 0.1, I.toFixed(3));
  const q = sine(FS, 10, 1000, -95);
  const g1 = S.sbLoudness(cat(tone, q), FS);
  check('loudness: a silent passage (below -70 LUFS) is gated out', Math.abs(g1 - I) <= 0.05, `${g1.toFixed(3)} vs ${I.toFixed(3)}`);
  const quiet = sine(FS, 20, 1000, -45);
  const g2 = S.sbLoudness(cat(tone, quiet), FS);
  check('loudness: a passage 22 LU under the rest is gated out (the relative gate)', Math.abs(g2 - I) <= 0.05, `${g2.toFixed(3)} vs ${I.toFixed(3)}`);
  const s44 = song(44100, 20, { bpb: 4, beatAt: k => 0.5 + k * 0.625 });
  const s48 = song(48000, 20, { bpb: 4, beatAt: k => 0.5 + k * 0.625 });
  const a = S.sbLoudness(s44, 44100), b = S.sbLoudness(s48, 48000);
  check('loudness: the same song at 48 kHz reads within 0.05 LU of 44.1 kHz', Math.abs(a - b) <= 0.05, `${a.toFixed(3)} / ${b.toFixed(3)}`);
  const mono = S.sbLoudness([s44[0]], 44100), mono2 = S.sbLoudness([s44[0], s44[0]], 44100);
  check('loudness: one channel reads 3 LU under the same channel twice', Math.abs(mono2 - mono - 3.01) <= 0.02, `${mono.toFixed(3)} / ${mono2.toFixed(3)}`);
  check('loudness: the target is the cure\'s -12.505 LUFS', T === -12.505, String(T));
}

/* ── limiter ── */
{
  const s = song(FS, 15, { bpb: 4, beatAt: k => 0.5 + k * 0.6 });
  const lim = S.sbLimit(s, FS, 12, -1);
  const sp = S.sbSamplePeak(lim);
  check('limiter: +12 dB on a song never passes the -1 dBFS ceiling', sp <= -1 + 1e-6, sp.toFixed(3) + ' dBFS');
  const pre = S.sbSamplePeak(s);
  const lim2 = S.sbLimit(s, FS, -6, -1);
  let same = true; const g = Math.pow(10, -6 / 20);
  for(let i = 0; i < lim2[0].length && same; i += 7) if(Math.abs(lim2[0][i] - s[0][i] * g) > 1e-6) same = false;
  check('limiter: a signal under the ceiling is the gain only, untouched', same && pre - 6 < -1, `peak before ${pre.toFixed(2)} dB`);
  const enc = S.sbEncodeInput(lim);
  check('codec: the encoder\'s input drops exactly SB_CODEC_DELAY (1105) samples', enc[0].length === lim[0].length - 1105 && S.SB_CODEC_DELAY === 1105, `${lim[0].length} → ${enc[0].length}`);
}

/* ── pitch ── */
const PITCH = [-14, -7, 0, 7, 14];
const pitchSongs = {};
for(const c of PITCH){
  seed = 777 + c;
  const s = song(FS, 20, { bpb: 4, beatAt: k => 0.3 + k * 0.6, cents: c, noHat: true });
  pitchSongs[c] = s;
  const r = S.sbCents(S.sbMono(s), FS);
  check(`pitch: tones made ${c >= 0 ? '+' : ''}${c} cents read within ±2`, r.cents != null && Math.abs(r.cents - c) <= 2, r.cents == null ? 'no reading' : `${r.cents.toFixed(2)} (${r.n} peaks)`);
  const blocked = r.cents != null && Math.abs(r.cents) > S.SB_MAX_CENTS;
  check(`pitch: ${c >= 0 ? '+' : ''}${c} cents is ${Math.abs(c) > 10 ? 'blocked' : 'not blocked'} (the 10-cent rule)`, blocked === Math.abs(c) > 10);
}

/* ── taps ── */
function taps(beatAt, from, n, ms){ const out = []; for(let k = from; k < from + n; k++){ const u = (noise() + noise() + noise()) / 3; out.push(beatAt(k) + u * ms / 1000 * 1.7); } return out; }
{
  seed = 4242;
  for(const ms of [20, 40]){
    const beatAt = k => 2 + k * 0.625;
    const tp = taps(beatAt, 4, 16, ms);
    const f = S.sbTapFit(tp);
    check(`taps: 16 taps scattered about ${ms} ms read 96 BPM (±1) and a spread of ${ms / 2}-${ms * 1.5} ms`, f && Math.abs(f.bpm - 96) <= 1 && f.spreadMs >= ms / 2 && f.spreadMs <= ms * 1.5, f ? `${f.bpm.toFixed(2)} BPM, ${f.spreadMs.toFixed(1)} ms` : 'no fit');
  }
  const tp = taps(k => 2 + k * 0.625, 4, 16, 20); tp.splice(7, 1);
  const f = S.sbTapFit(tp);
  check('taps: a missed tap does not halve the tempo', f && Math.abs(f.bpm - 96) <= 1, f ? f.bpm.toFixed(2) : 'no fit');
}

/* ── beat ── */
async function beatCase(name, o){
  seed = o.seed;
  const s = song(FS, o.sec, o);
  const mono = S.sbMono(s);
  const E = S.sbOnsetEnv(mono, FS);
  const tp = taps(o.beatAt, o.tapFrom, 16, 30);
  const f = S.sbTapFit(tp);
  const g = S.sbAutoGrid(E, mono, FS, o.sec, o.meter, f.bpm);
  let beat = g.beat;
  for(let round = 0; round < 3; round++){
    const d = S.sbDrift(E, beat, o.sec).filter(w => w.sure && Math.abs(w.ms) > 30 && !w.pinned);
    if(!d.length) break;
    const pins = beat.pins.slice();
    d.forEach(w => { const p = S.sbFindBar(E, beat, w.bar); if(p.sure) pins.push({ bar: w.bar, t: p.t }); });
    beat = Object.assign({}, beat, { pins });
    beat.bpm = S.sbPinBpm(beat);
  }
  const truthBar = b => o.beatAt((b - 1) * o.bpbBeats + o.firstBarBeat);
  const last = S.sbBarsIn(beat, o.sec);
  const e1 = (S.sbBarTime(beat, 1) - truthBar(1)) * 1000, eL = (S.sbBarTime(beat, last) - truthBar(last)) * 1000;
  if(process.env.SB_DEBUG) console.log(name, JSON.stringify(beat.pins.map(p => [p.bar, ((p.t - truthBar(p.bar)) * 1000).toFixed(1)])), 'last', last);
  check(`beat: ${name}: bar 1 within 10 ms`, Math.abs(e1) <= 10, `${e1.toFixed(1)} ms`);
  check(`beat: ${name}: the last bar (${last}) within 10 ms`, last >= o.minBars && Math.abs(eL) <= 10, `${eL.toFixed(1)} ms; ${beat.pins.length + 1} pins; ${S.sbPinBpm(beat).toFixed(3)} BPM`);
  return { beat, last };
}
await beatCase('4/4 at 96, 4 quiet beats first', { seed: 1, sec: 120, bpb: 4, bpbBeats: 4, meter: '4/4', beatAt: k => 1.37 + k * 0.625, introSec: 1.37 + 4 * 0.625 - 0.01, firstBarBeat: 4, tapFrom: 8, minBars: 40 });
/* 6/8 counted in two at 60 big beats a minute: the made-up song puts a kick on each big beat (2 a bar). */
await beatCase('6/8 in two at 60', { seed: 2, sec: 120, bpb: 2, bpbBeats: 2, meter: '6/8', beatAt: k => 0.81 + k * 1.0, firstBarBeat: 0, tapFrom: 2, minBars: 50 });
/* A slow drift: the tempo moves from 100 to 101.5 over the song (a played record). */
const drift = k => { const b0 = 0.6, b1 = 0.6 / 1.015, K = 300; return 0.5 + (k < K ? k * b0 + (b1 - b0) * k * k / (2 * K) : K * b0 + (b1 - b0) * K / 2 + (k - K) * b1); };
await beatCase('a slow drift (+1.5%)', { seed: 3, sec: 170, bpb: 4, bpbBeats: 4, meter: '4/4', beatAt: drift, firstBarBeat: 0, tapFrom: 4, minBars: 60 });
await beatCase('weak onsets under noise', { seed: 4, sec: 120, bpb: 4, bpbBeats: 4, meter: '4/4', beatAt: k => 0.9 + k * 0.5455, soft: true, noise: 0.06, firstBarBeat: 0, tapFrom: 4, minBars: 50 });
/* A SOFT intro (not silent): 8 beats at 15% then the band. Bar 1 is the first loud beat even when the grid sits a
   little late, as a tracked grid does (3 ms on the song that found it, 2026-11-15): before the fix a grid 1 ms late
   put the next beat's attack in the last quiet beat's window, and bar 1 landed one beat early. */
{
  const P = 0.625, t0 = 0.5, n = Math.round(40 * FS), mono = new Float32Array(n);
  for(let k = 0; t0 + k * P < 39.5; k++){
    const a = Math.round((t0 + k * P) * FS), lvl = k < 8 ? 0.15 : 1;
    for(let j = 0; j < Math.round(P * FS) && a + j < n; j++) mono[a + j] += lvl * 0.4 * Math.exp(-j / FS * 5) * Math.sin(2 * Math.PI * 220 * j / FS);
    for(let j = 0; j < 200; j++) mono[a + j] += lvl * 0.3 * Math.exp(-j / 40) * noise();
  }
  const res = [-20, 0, 1, 3, 10, 50].map(ms => { const times = []; for(let t = t0 + ms / 1000; t < 19.5; t += P) times.push(t); return [ms, S.sbFirstLoudBeat(mono, FS, times) - ms / 1000]; });
  check('beat: a soft intro: bar 1 on the first loud beat with the grid 20 ms early to 50 ms late', res.every(([, t]) => Math.abs(t - (t0 + 8 * P)) < 0.001),
    res.map(([ms, t]) => `${ms} ms: ${t.toFixed(3)}`).join(', '));
  /* Taps 4% slow or 5% fast: the tempo search stays within 1.5% of the taps, so only the end pin finds 96; the grid
     is then worked out again from it (before 2026-11-15, bar 1 sat 39 ms late from taps 5% fast). */
  const grid = [0.96, 1.05].map(f => { const E = S.sbOnsetEnv(mono, FS); return [f, S.sbAutoGrid(E, mono, FS, 40, '4/4', 96 * f).beat]; });
  check('beat: taps 4% slow or 5% fast: bar 1 within 10 ms and the tempo within 0.1 BPM', grid.every(([, b]) => Math.abs(b.anchor - (t0 + 8 * P)) <= 0.01 && Math.abs(b.bpm - 96) <= 0.1),
    grid.map(([f, b]) => `x${f}: bar 1 ${((b.anchor - (t0 + 8 * P)) * 1000).toFixed(1)} ms, ${b.bpm.toFixed(3)} BPM`).join('; '));
}
{
  const beat = { meter: '4/4', bpm: 100, anchor: 1, pins: [{ bar: 20, t: 1 + 19 * 2.4 + 0.05 }, { bar: 40, t: 1 + 39 * 2.4 + 0.02 }] };
  const bt = S.sbBarTimes(beat, 50);
  check('grid: three pins make barTimes, one a bar plus the end, through every pin', bt && bt.length === 51 && Math.abs(bt[19] - beat.pins[0].t) < 0.001 && Math.abs(bt[39] - beat.pins[1].t) < 0.001 && bt[0] === 1, bt ? `${bt.length} times` : 'none');
  check('grid: two pins make no barTimes (anchor + bpm)', S.sbBarTimes({ meter: '4/4', bpm: 100, anchor: 1, pins: [{ bar: 20, t: 46.6 }] }, 30) === null);
}

/* ── mp3 header ── */
{
  const fr = [0xff, 0xfb, 0xb0, 0x04];    // MPEG-1 layer III, 192 kb/s, 44.1 kHz, joint stereo
  const a = S.sbMp3Info(new Uint8Array(fr.concat(new Array(40).fill(0))));
  const tag = [0x49, 0x44, 0x33, 4, 0, 0, 0, 0, 0, 20].concat(new Array(20).fill(0));
  const b = S.sbMp3Info(new Uint8Array(tag.concat([0xff, 0xfb, 0x94, 0xc4], new Array(40).fill(0))));   // 128k 48 kHz mono
  check('mp3: a 192k 44.1 kHz stereo frame header', a && a.kbps === 192 && a.sampleRate === 44100 && a.channels === 2, JSON.stringify(a));
  check('mp3: behind an ID3 tag, 128k 48 kHz mono', b && b.kbps === 128 && b.sampleRate === 48000 && b.channels === 1 && b.at === 30, JSON.stringify(b));
  check('mp3: not an mp3 → null', S.sbMp3Info(new Uint8Array([1, 2, 3, 4, 5, 6])) === null);
}

/* ── FULL: against ffmpeg and the Python tools, and the whole levelling with the vendored encoder ── */
if(FULL){
  const dir = mkdtempSync(join(tmpdir(), 'sb-dsp-'));
  const f32 = (chans, name) => { const n = chans[0].length, c = chans.length, b = new Float32Array(n * c); for(let i = 0; i < n; i++) for(let k = 0; k < c; k++) b[i * c + k] = chans[k][i]; const p = join(dir, name); writeFileSync(p, Buffer.from(b.buffer)); return p; };
  const wav = (chans, fs, name) => { const raw = f32(chans, name + '.f32'), p = join(dir, name + '.wav'); spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(fs), '-ac', String(chans.length), '-i', raw, '-c:a', 'pcm_f32le', p]); return p; };
  const ff = (p) => { const r = spawnSync('ffmpeg', ['-nostats', '-i', p, '-af', 'ebur128=peak=true+sample', '-f', 'null', '-'], { encoding: 'utf8' }); const s = r.stderr.split('Summary:').pop(); const num = re => { const m = re.exec(s); return m ? Number(m[1]) : NaN; }; return { I: num(/I:\s+(-?[\d.]+) LUFS/), tp: num(/True peak:\s+Peak:\s+(-?[\d.inf]+) dBFS/), sp: num(/Sample peak:\s+Peak:\s+(-?[\d.inf]+) dBFS/) }; };
  const ffI = p => { const r = spawnSync('ffmpeg', ['-nostats', '-i', p, '-af', 'ebur128=metadata=1,ametadata=mode=print:key=lavfi.r128.I:file=-', '-f', 'null', '-'], { encoding: 'utf8' }); const m = /lavfi\.r128\.I=(-?[\d.]+)\s*$/.exec(r.stdout.trim()); return m ? Number(m[1]) : NaN; };
  // M6: the JS meter against ffmpeg's ebur128 on generated signals.
  const sigs = [['1 kHz at -23 dBFS', sine(FS, 20, 1000, -23), FS], ['noise at -30 dBFS with a quiet gap', (() => { seed = 9; const n = FS * 25, x = new Float32Array(n); for(let i = 0; i < n; i++) x[i] = (i > FS * 10 && i < FS * 14 ? 0.001 : 0.0316) * noise() * 1.7; return [x, x.slice()]; })(), FS],
    ['a made-up song, 44.1 kHz', song(44100, 30, { bpb: 4, beatAt: k => 0.4 + k * 0.6, introSec: 3 }), 44100], ['a made-up song, 48 kHz', song(48000, 30, { bpb: 3, beatAt: k => 0.4 + k * 0.5 }), 48000],
    ['a made-up song, mono', [song(44100, 30, { bpb: 4, beatAt: k => 0.4 + k * 0.6 })[0]], 44100], ['a quiet made-up song (-30 LUFS)', song(44100, 30, { bpb: 4, beatAt: k => 0.4 + k * 0.6 }).map(c => c.map(v => v * 0.08)), 44100]];
  sigs.forEach(([name, chans, fs], i) => {
    const js = S.sbLoudness(chans, fs), f = ffI(wav(chans, fs, 'm6-' + i));
    check(`full M6: ${name}: the JS meter within 0.2 LU of ffmpeg ebur128`, Math.abs(js - f) <= 0.2, `JS ${js.toFixed(3)}, ffmpeg ${f.toFixed(3)} (${(js - f).toFixed(3)})`);
  });
  // Pitch against tools/playalong-measure.py's TUNING.
  for(const c of PITCH){
    const p = wav(pitchSongs[c], FS, 'pitch' + c);
    const r = spawnSync('python3', [join(ROOT, 'tools', 'playalong-measure.py'), p], { encoding: 'utf8', timeout: 300000 });
    const m = /TUNING\s+([+-][\d.]+) cents/.exec(r.stdout || '');
    const js = S.sbCents(S.sbMono(pitchSongs[c]), FS).cents;
    check(`full pitch: ${c >= 0 ? '+' : ''}${c} cents: JS within ±2 of playalong-measure.py`, m && Math.abs(js - Number(m[1])) <= 2, m ? `JS ${js.toFixed(2)}, Python ${m[1]}` : 'Python printed no TUNING: ' + (r.stderr || '').slice(-200));
  }
  // The whole levelling, with the vendored encoder (Node runs it here; the console runs it in a Worker).
  const lctx = { console, Math, Int8Array, Int16Array, Int32Array, Float32Array, Float64Array, Uint8Array, Array, Object };
  vm.createContext(lctx);
  vm.runInContext(readFileSync(join(ROOT, 'vendor', 'lamejs', 'lame.min.js'), 'utf8') + ';globalThis.__lame = lamejs;', lctx);
  const lame = lctx.__lame;
  const encode = async (chans) => {
    const enc = new lame.Mp3Encoder(chans.length, FS, S.SB_KBPS), parts = [], B = 1152 * 16;
    for(let i = 0; i < chans[0].length; i += B){ const b = chans.length === 2 ? enc.encodeBuffer(chans[0].subarray(i, i + B), chans[1].subarray(i, i + B)) : enc.encodeBuffer(chans[0].subarray(i, i + B)); if(b.length) parts.push(Buffer.from(b.buffer, b.byteOffset, b.length)); }
    const e = enc.flush(); if(e.length) parts.push(Buffer.from(e.buffer, e.byteOffset, e.length));
    return new Uint8Array(Buffer.concat(parts));
  };
  let lvl = 0;
  const decode = async (bytes) => { const p = join(dir, `lvl${lvl++}.mp3`); writeFileSync(p, bytes); const r = spawnSync('ffmpeg', ['-v', 'error', '-i', p, '-f', 'f32le', '-ac', '2', '-'], { maxBuffer: 1 << 30 }); const b = new Float32Array(r.stdout.buffer, r.stdout.byteOffset, r.stdout.length / 4); const L = new Float32Array(b.length / 2), R = new Float32Array(b.length / 2); for(let i = 0; i < L.length; i++){ L[i] = b[2 * i]; R[i] = b[2 * i + 1]; } return [L, R]; };
  for(const [name, mk] of [['a loud made-up song (needs the limiter)', () => song(FS, 60, { bpb: 4, beatAt: k => 0.7 + k * 0.6, introSec: 2 }).map(c => c.map(v => Math.max(-1, Math.min(1, v * 2.2))))], ['a quiet made-up song (turned up)', () => song(FS, 60, { bpb: 4, beatAt: k => 0.7 + k * 0.6 }).map(c => c.map(v => v * 0.12))]]){
    seed = 99;
    const srcCh = mk();
    const t0 = Date.now();
    const r = await S.sbLevel(srcCh, FS, { encode, decode, progress: () => {}, stopped: () => false });
    const ms = Date.now() - t0;
    const p = join(dir, 'final.mp3'); writeFileSync(p, r.bytes);
    const m = ff(p);
    const pr = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,bit_rate:stream=sample_rate', '-of', 'json', p], { encoding: 'utf8' });
    const pj = JSON.parse(pr.stdout), dur = Number(pj.format.duration);
    const fr = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'packet=size', '-of', 'csv=p=0', p], { encoding: 'utf8', maxBuffer: 1 << 26 }).stdout.trim().split('\n').map(Number);
    const sizes = new Set(fr);
    check(`full level: ${name}: ffmpeg reads ${T} ±0.3 LUFS`, Math.abs(m.I - T) <= 0.3, `${m.I} LUFS, gain ${r.gainDb.toFixed(2)} dB, ceiling ${r.ceilingDb.toFixed(2)}, ${r.tries} encode(s), ${(ms / 1000).toFixed(1)} s for 60 s of audio`);
    check(`full level: ${name}: both decoded peaks at or under -1 dBFS (ffmpeg)`, m.sp <= -1 && m.tp <= -1, `sample ${m.sp}, true ${m.tp}`);
    check(`full level: ${name}: 192k constant bitrate (M3)`, Number(pj.format.bit_rate) === 192000 && sizes.size <= 2 && Math.max(...sizes) - Math.min(...sizes) <= 1, `${pj.format.bit_rate} b/s; frame sizes ${[...sizes].join(', ')}`);
    check(`full level: ${name}: decoded length within 0.05 s of the source`, Math.abs(dur - srcCh[0].length / FS) <= 0.05, `${dur.toFixed(4)} vs ${(srcCh[0].length / FS).toFixed(4)}`);
    const dec = await decode(r.bytes), a = S.sbLimit(srcCh, FS, r.gainDb, r.ceilingDb)[0], b = dec[0];
    let best = 0, bv = -Infinity; const s0 = FS * 3, s1 = FS * 33;
    for(let L = -600; L <= 600; L++){ let v = 0; for(let i = s0; i < s1; i += 3) v += a[i] * b[i + L]; if(v > bv){ bv = v; best = L; } }
    check(`full level: ${name}: the copy lines up with the record (lag under 10 ms; codec delay dropped)`, Math.abs(best) / FS * 1000 < 10, `lag ${best} samples (${(best / FS * 1000).toFixed(2)} ms)`);
  }
  rmSync(dir, { recursive: true, force: true });
}

console.log(lines.join('\n'));
console.log(`sb-dsp-test: ${cases} cases, ${failed} failed${FULL ? ' (full)' : ''}${BREAK ? ' [break: ' + BREAK + ']' : ''}`);
process.exit(failed ? 1 : 0);
