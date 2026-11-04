/* Synthetic Power Chord Switch takes (micTakes/<uid>-pw, coach.js ccRecMeta +
   micRecSaveNow) with KNOWN answers, to prove teacher.js micEvalTakePw.
     node tools/mic-sim/fake-pw-take.mjs <out-folder>
   writes every fixture below as <name>.wav + <name>.json (what the console's
   Download WAV / Download data buttons give) and truth.json. tools/checks.mjs
   (1cl) imports PW_FIXTURES + makePwTake and builds them in memory instead.

   What is planted, on the site's timeline (ms on the recording's clock, the way
   micRecSaveNow makes the times relative):
     · each round (stage) k at its own tempo: four count-in beeps (660, 660, 660,
       990 Hz) at C_k + 0..3 beats, listen start L_k = C_k + 4 beats, the graded
       changes at L_k + s × bpc beats (s = 1 .. slots-1), the round's end one beat
       after its last chord; the next count-in starts 0.4 s later (0.1 s once the
       30 s capture has stopped: coach.js COACH_COUNTIN_REC_LEAD);
     · beeps and strums land `lag` ms after they were scheduled (speaker or
       guitar -> air -> mic); the student strums on EVERY beat, on the beeps
       they hear (± 12 ms), each strum a three-string power chord with a pick
       scrape; the first 100 ms of the audio are exact zeros (a Chromebook
       capture warming up);
     · the site's clock runs `map` ms ahead of the recording's, so an event the
       site heard is { t: attack + map - micLatencyMs, stage }; the audio stops at
       the 30 s cap (MICREC_MAX_SEC) or at a Stop, and so does the event log.
   Per graded change, `plan` picks what happened (default: the new chord, on time,
   site 'ok'):
     off      strummed on time, a fret too high       site 'off'
     late:N   strummed N ms late (or early, N < 0)    site 'ok'
     detmiss  strummed, the site heard nothing        site 'miss'  (no event)
     silent   not strummed, strings muted              site 'miss'
     held     not strummed, the old chord rings on    site 'ok'    (an event with no attack: a false hit)
   truth: per change, whether its window runs past the audio's end (dropped),
   else agree / detector-missed / false-hit / silent-miss; per round, where the
   beeps landed (lag) and the mic delay that scores an on-the-click strum dead on
   (ideal = lag + map). The window is the site's own (ccLoop `win`). */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const R = 24000, CAP_MS = 30000;
// Root midi of each three-finger shape (coach.js CC_POWER_PROGRESSIONS): root, +7, +12.
const ROOT = { E5: 40, F5: 41, G5: 43, A5: 45, B5: 47, C5: 48, D5: 50 };

export const PW_FIXTURES = [
  { name: 'pw-loud', desc: 'loud, clips; 3 rounds 90/105/120', bpms: [90, 105, 120], bpc: 1, slots: 8, chords: ['G5', 'C5'], song: 'fake-song',
    lag: 120, map: 25, lat: 100, amp: 0.55, clickAmp: 0.06, noise: 0.002, seed: 11,
    plan: { 1: 'off', 3: 'detmiss', 5: 'late:200', 8: 'held', 11: 'silent', 14: 'late:-150', 17: 'detmiss' } },
  { name: 'pw-quiet', desc: 'quiet mic; 3 rounds 90/105/120', bpms: [90, 105, 120], bpc: 1, slots: 8, chords: ['A5', 'D5'], song: 'fake-song',
    lag: 140, map: 30, lat: 120, amp: 0.025, clickAmp: 0.006, noise: 0.0006, seed: 12,
    plan: { 0: 'detmiss', 4: 'held', 7: 'silent', 10: 'off', 13: 'late:180', 20: 'silent' } },
  { name: 'pw-delay50', desc: 'short mic delay (50 ms), setting 0; 3 rounds 90/105/120', bpms: [90, 105, 120], bpc: 1, slots: 8, chords: ['F5', 'G5'], song: 'fake-song',
    lag: 50, map: 20, lat: 0, amp: 0.12, clickAmp: 0.03, noise: 0.002, seed: 13,
    plan: { 2: 'held', 6: 'detmiss', 9: 'silent', 12: 'off', 16: 'held' } },
  { name: 'pw-delay250', desc: 'long mic delay (250 ms), setting 100; E5/A5 with overtones on the beep pitches (E3 x 4 = 659 Hz); 3 rounds 90/105/120', bpms: [90, 105, 120], bpc: 1, slots: 8, chords: ['E5', 'A5'], song: 'fake-song',
    lag: 250, map: 35, lat: 100, amp: 0.12, clickAmp: 0.03, harm: [1, 0.5, 0.35, 0.3, 0.2, 0.15], noise: 0.002, seed: 14,
    plan: { 1: 'silent', 5: 'detmiss', 9: 'held', 15: 'late:220', 19: 'off' } },
  { name: 'pw-cap', desc: 'default 60/75/90: cut by the 30 s cap in round 3', bpms: [60, 75, 90], bpc: 1, slots: 8, chords: ['G5', 'C5'], song: 'fake-song',
    lag: 130, map: 25, lat: 100, amp: 0.12, clickAmp: 0.03, noise: 0.002, seed: 15,
    plan: { 2: 'detmiss', 6: 'silent', 9: 'held', 15: 'off', 19: 'detmiss', 20: 'held' } },
  { name: 'pw-pair', desc: 'a pair: one round, 15 changes at 70 BPM', bpms: [70], bpc: 1, slots: 16, chords: ['F5', 'G5'], song: null,
    lag: 160, map: 20, lat: 150, amp: 0.1, clickAmp: 0.03, noise: 0.002, seed: 16,
    plan: { 3: 'held', 7: 'detmiss', 10: 'silent', 12: 'late:-200' } },
  { name: 'pw-every2-stop', desc: 'every 2 beats (strums between the changes), Stopped in round 2', bpms: [90, 105, 120], bpc: 2, slots: 8, chords: ['A5', 'C5'], song: 'fake-song',
    lag: 110, map: 25, lat: 100, amp: 0.12, clickAmp: 0.03, noise: 0.002, seed: 17, stopAt: { stage: 1, afterChange: 3, plusMs: 600 },
    plan: { 1: 'held', 4: 'silent', 8: 'detmiss' } },
  { name: 'pw-noclicks', desc: 'headphones: no beeps in the audio; setting right', bpms: [90, 105, 120], bpc: 1, slots: 8, chords: ['E5', 'G5'], song: 'fake-song',
    lag: 120, map: 30, lat: 150, amp: 0.12, clickAmp: 0, noise: 0.002, seed: 18,
    plan: { 3: 'detmiss', 8: 'held', 13: 'silent' } }
];

export function makePwTake(o){
  let seed = o.seed || 1;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const S = ms => Math.round(ms / 1000 * R);
  const win = beat => Math.min(beat * o.bpc * 0.5, Math.max(220, beat * 0.5));   // coach.js ccLoop's match window

  /* ── the site's timeline ── */
  const rounds = [], expected = [];
  let c1 = 420, gi = 0, stopMs = null;
  for (let k = 0; k < o.bpms.length; k++){
    const beat = 60000 / o.bpms[k], L = c1 + 4 * beat;
    const rd = { stage: k, bpm: o.bpms[k], beat, c1, listen: L, changes: [] };
    for (let s = 1; s < o.slots; s++){
      const ch = { i: gi++, s, t: L + s * o.bpc * beat, from: o.chords[(s - 1) % 2], to: o.chords[s % 2], stage: k, bpm: o.bpms[k], kind: o.plan[gi - 1] || 'ok' };
      rd.changes.push(ch);
    }
    rounds.push(rd);
    const end = L + (o.slots * o.bpc + 1) * beat;
    if (o.stopAt && o.stopAt.stage === k){ stopMs = rd.changes[o.stopAt.afterChange].t + o.stopAt.plusMs; break; }
    c1 = end + 20 + (end + 20 < CAP_MS ? 400 : 100);
  }
  const lastRound = rounds[rounds.length - 1];
  const gameEnd = stopMs != null ? stopMs : lastRound.listen + (o.slots * o.bpc + 1) * lastRound.beat;
  const audioEnd = Math.min(CAP_MS, gameEnd + 150);
  const N = S(audioEnd);

  /* ── the audio ── */
  const strums = new Float32Array(N);
  function partial(atMs, f, amp, tau){
    const s0 = S(atMs), n = Math.min(S(1800), N - s0), fade = S(20);
    for (let i = 0; i < n; i++){
      if (s0 + i < 0) continue;
      const env = amp * Math.exp(-i / R / tau) * (i > n - fade ? (n - i) / fade : 1);
      strums[s0 + i] += env * Math.sin(2 * Math.PI * f * i / R);
    }
  }
  function strum(atMs, chord, sharp){
    const root = ROOT[chord] + (sharp ? 1 : 0);
    [0, 7, 12].forEach((off, k) => {
      const f = 440 * Math.pow(2, (root + off - 69) / 12);
      (o.harm || [1, 0.5, 0.25]).forEach((a, h) => partial(atMs + k * 12, f * (h + 1), o.amp * a / 2, 0.8));
    });
    const s0 = S(atMs);
    for (let i = 0; i < S(12) && s0 + i < N; i++) if (s0 + i >= 0) strums[s0 + i] += (rnd() - 0.5) * o.amp * 2 * (1 - i / S(12));
  }
  const events = [];
  const heard = (attack, stage) => { if (attack < audioEnd && attack < CAP_MS) events.push({ t: Math.round((attack + o.map - o.lat) * 10) / 10, stage }); };
  // a muted change: the strings are stopped 40 ms before it, so what is ringing dies within ~0.1 s
  const mute = ms => { const m0 = Math.max(0, S(ms)); for (let i = m0; i < N; i++){ const k = Math.exp(-(i - m0) / R / 0.02); if (k < 1e-6){ strums.fill(0, i); break; } strums[i] *= k; } };
  // every beat in time order (the student strums on every beat; the graded ones follow the plan)
  rounds.forEach(rd => {
    const bySlotBeat = {};
    rd.changes.forEach(ch => { bySlotBeat[ch.s * o.bpc] = ch; });
    for (let m = 0; m < o.slots * o.bpc; m++){
      const due = rd.listen + m * rd.beat;
      if (stopMs != null && due > stopMs) break;
      const ch = bySlotBeat[m];
      const chord = o.chords[Math.floor(m / o.bpc) % 2];
      let kind = ch ? ch.kind : 'ok', dev = (rnd() - 0.5) * 24;
      if (/^late:/.test(kind)){ dev = +kind.slice(5); kind = 'ok'; if (Math.abs(dev) > win(rd.beat) - 30) throw new Error(o.name + ': change ' + ch.i + ' is ' + dev + ' ms off, too near the edge of its window'); }
      const attack = due + o.lag + dev;
      if (kind === 'silent'){ mute(attack - 40); continue; }
      if (kind === 'held'){ heard(due + o.lag + 10, rd.stage); continue; }
      strum(attack, chord, kind === 'off');
      if (kind !== 'detmiss') heard(attack, rd.stage);
    }
  });
  const x = new Float32Array(N);
  for (let i = 0; i < N; i++) x[i] = strums[i] + (rnd() - 0.5) * o.noise;
  if (o.clickAmp > 0) rounds.forEach(rd => {
    for (let j = 0; j < 4; j++){
      const s0 = S(rd.c1 + j * rd.beat + o.lag), f = j === 3 ? 990 : 660;
      for (let i = 0; i < S(80) && s0 + i < N; i++) x[s0 + i] += o.clickAmp * Math.exp(-i / R / 0.03) * Math.sin(2 * Math.PI * f * i / R);
    }
  });
  for (let i = 0; i < S(100) && i < N; i++) x[i] = 0;
  const pcm = new Int16Array(N);
  for (let i = 0; i < N; i++) pcm[i] = Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767)));

  /* ── what the site saved, and the truth ── */
  const truth = { name: o.name, changes: [], rounds: [] };
  rounds.forEach(rd => {
    const w = win(rd.beat);
    let n = 0, dropped = 0;
    rd.changes.forEach(ch => {
      const after = stopMs != null && ch.t > stopMs - 0;
      ch.verdict = after ? 'miss' : ch.kind === 'off' ? 'off' : ch.kind === 'detmiss' || ch.kind === 'silent' ? 'miss' : 'ok';
      expected.push({ i: ch.i, t: Math.round(ch.t * 10) / 10, from: ch.from, to: ch.to, stage: ch.stage, bpm: ch.bpm, verdict: ch.verdict });
      const want = ch.t + o.lag, end = want + w;
      if (Math.abs(end - audioEnd) < 40) throw new Error(o.name + ': change ' + ch.i + "'s window ends " + Math.round(end - audioEnd) + ' ms from the audio end (too close to call)');
      if (end > audioEnd){ dropped++; truth.changes.push({ i: ch.i, stage: ch.stage, cat: 'dropped' }); return; }
      n++;
      const struck = !after && ch.kind !== 'silent' && ch.kind !== 'held';
      const siteHeard = ch.verdict === 'ok' || ch.verdict === 'off';
      truth.changes.push({ i: ch.i, stage: ch.stage, kind: after ? 'after-stop' : ch.kind,
        cat: struck ? (siteHeard ? 'agree' : 'detector-missed') : (siteHeard ? 'false-hit' : 'silent-miss') });
    });
    truth.rounds.push({ stage: rd.stage, bpm: rd.bpm, n, dropped, clicks: o.clickAmp > 0, lagMs: o.lag, idealMs: o.lag + o.map });
  });
  const meta = {
    game: 'pw', complete: stopMs == null, progression: o.chords.join('-'), song: o.song, ladder: o.bpms.length > 1,
    bpm: o.bpms[0], stageBpms: o.bpms.slice(), bpc: o.bpc, eventTimes: 'played (arrival - micLatencyMs)',
    expected, events, uid: 'fake', name: 'Fake Student', period: '3', mode: 'pw',
    micLatencyMs: o.lat, sampleRate: R, srcSampleRate: 48000, durationSec: Math.round(N / R * 100) / 100,
    micLabel: 'Internal Microphone (Built-in)',
    userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 16093.68.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    frameMeanMs: 48.2, frameMaxMs: 131, lang: 'en', chunks: 2, savedAt: '2026-11-04T17:00:00.000Z'
  };
  return { pcm, meta, truth };
}

export function wavBytes(pcm){
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length * 2, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(R, 24); h.writeUInt32LE(R * 2, 28);
  h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length * 2, 40);
  return Buffer.concat([h, Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength)]);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
  const out = process.argv[2];
  if (!out){ console.error('usage: node tools/mic-sim/fake-pw-take.mjs <out-folder>'); process.exit(2); }
  fs.mkdirSync(out, { recursive: true });
  const all = [];
  PW_FIXTURES.forEach(f => {
    const { pcm, meta, truth } = makePwTake(f);
    fs.writeFileSync(path.join(out, f.name + '.wav'), wavBytes(pcm));
    fs.writeFileSync(path.join(out, f.name + '.json'), JSON.stringify(meta, null, 1));
    all.push(truth);
    const c = {}; truth.changes.forEach(ch => { c[ch.cat] = (c[ch.cat] || 0) + 1; });
    console.log(f.name.padEnd(16) + ' ' + meta.durationSec + ' s  ' + Object.entries(c).map(([k, v]) => k + ' ' + v).join(' · ') + '  (' + f.desc + ')');
  });
  fs.writeFileSync(path.join(out, 'truth.json'), JSON.stringify(all, null, 1));
}
