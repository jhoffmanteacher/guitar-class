/* A synthetic micTakes recording with KNOWN answers, to prove the evaluator (teacher.js micEvalTake)
   measures what it says. Writes <out>.wav + <out>.json like the console's
   Download WAV / Download data buttons.
     node tools/mic-sim/fake-take.mjs <out-base> [lagMs=140] [mapMs=25] [mode=coach|nr] [room=quiet|class] [clicks=1]
   Planted: count-in beeps that land lagMs after they were scheduled; a
   student who plays on the click they hear (± 20 ms); the site's clock
   mapMs ahead of the recording's; micLatencyMs 50. So the evaluator should
   report clickLag ≈ lagMs, ideal ≈ lagMs + mapMs, skew ≈ ideal − 50.
   Note 3: played and loud, but the "site" says miss  -> detMiss 1
   Note 7: never played, site says miss               -> silent 1
   Note 10: played a whole step sharp, site says wrong -> replay "other"
   Low-string notes have a weak fundamental (H1 at 0.35 of H2), like a
   small laptop mic, so lowH1H2 should read about -9 dB. */
import fs from 'fs';
const [out = 'fake', lagA = '140', mapA = '25', mode = 'coach', room = 'quiet', clicksA = '1'] = process.argv.slice(2);
const LAG = +lagA, MAP = +mapA, LAT = 50, R = 24000, BEAT = 750, DUR = 18;
let seed = 7; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const x = new Float32Array(R * DUR);
for (let i = 0; i < x.length; i++) x[i] = (rnd() - 0.5) * 0.002;
const S = ms => Math.round(ms / 1000 * R);
function tone(atMs, f, amp, durMs, tau){
  const s0 = S(atMs), n = S(durMs);
  for (let i = 0; i < n && s0 + i < x.length; i++) x[s0 + i] += amp * Math.exp(-i / R / tau) * Math.sin(2 * Math.PI * f * i / R);
}
function pluck(atMs, midi, amp){
  const f = 440 * Math.pow(2, (midi - 69) / 12), low = midi < 52;
  [[low ? 0.35 : 1, 1], [low ? 1 : 0.5, 2], [0.4, 3], [0.2, 4]].forEach(([a, k]) => tone(atMs, f * k, amp * a, 1400, 0.45));
  const s0 = S(atMs); for (let i = 0; i < S(5); i++) x[s0 + i] += (rnd() - 0.5) * amp * 2;
}
const t0 = 300, listen = t0 + 4 * BEAT;
if (clicksA !== '0') for (let k = 0; k < 4; k++) tone(t0 + k * BEAT + LAG, k === 3 ? 990 : 660, 0.04, 80, 0.03);
const MIDIS = [40, 43, 45, 47, 48, 45, 43, 40, 45, 47, 48, 50, 52, 50, 48, 45];
const expected = [], events = [];
MIDIS.forEach((m, i) => {
  const t = listen + i * BEAT;
  let verdict = 'ok', played = m;
  if (i === 7) verdict = 'miss', played = null;
  if (i === 10) verdict = mode === 'nr' ? 'pitch' : 'wrong', played = m + 2;
  if (i === 3) verdict = 'miss';
  if (mode === 'nr' && verdict === 'ok') verdict = 'perfect';
  const audio = t + LAG + (rnd() - 0.5) * 40;
  if (played != null){
    pluck(audio, played, 0.12);
    if (i !== 3) events.push({ t: Math.round((audio + MAP - LAT) * 10) / 10, midi: played, slot: i, readings: [played, played] });
  }
  expected.push(Object.assign({ i, t, midi: m, verdict }, mode === 'nr' ? { string: m < 45 ? 6 : 5, fret: 0, chord: null, unclear: false } : { midis: null, chord: null, label: '', loose: false, devMs: null }));
});
if (room === 'class'){
  for (let t = 500; t < DUR * 1000 - 1500; t += 400 + rnd() * 900) pluck(t, 45 + Math.floor(rnd() * 20), 0.03);
}
const pcm = new Int16Array(x.length);
for (let i = 0; i < x.length; i++) pcm[i] = Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767)));
const h = Buffer.alloc(44);
h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length * 2, 4); h.write('WAVE', 8); h.write('fmt ', 12);
h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(R, 24); h.writeUInt32LE(R * 2, 28);
h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length * 2, 40);
fs.writeFileSync(out + '.wav', Buffer.concat([h, Buffer.from(pcm.buffer)]));
const meta = mode === 'nr'
  ? { game: 'nr', level: 2, bpm: 80, chords: false, beatMs: BEAT, goodMs: 160, perfectMs: 80, score: 0 }
  : { game: 'coach', coachMode: 'melody', bpm: 80, beatMs: BEAT, gridOffsetMs: 0 };
fs.writeFileSync(out + '.json', JSON.stringify(Object.assign(meta, {
  eventTimes: 'played (arrival - micLatencyMs)', expected, events, uid: 'fake', name: 'Fake Student', period: '3', mode,
  micLatencyMs: LAT, sampleRate: R, srcSampleRate: 48000, durationSec: DUR, micLabel: 'Internal Microphone (Built-in)',
  userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 16093.68.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
  frameMeanMs: 48.2, frameMaxMs: 131, lang: 'en', chunks: 2, savedAt: '2026-10-09T17:00:00.000Z'
}), null, 1));
console.log('wrote ' + out + '.wav/.json  expect lag≈' + LAG + ' ideal≈' + (LAG + MAP) + ' skew≈' + (LAG + MAP - LAT));
