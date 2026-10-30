/* Power Chord Switch (Change Up's engine on the three-finger power chords),
   2026-10-30. Drives the REAL coachReadFrame / coachDetectPitch /
   coachPitchReadings / coachSmooth / ccResolvePend through a copy of ccLoop's
   onset-and-readings logic, against one synthetic change in a quiet room:
   the old power chord strummed a beat earlier and still ringing, then
     change  the NEW chord strummed on the beat (a real change),
     held    the OLD chord strummed again (the student never moved: should NOT pass),
     sharp   the new chord one fret high (close but wrong: should NOT pass).
   Every ordered pair of adjacent chords in CC_POWER_PROGRESSIONS is tried.

   usage: node power-switch.mjs <coach.js> [trials=12] [--harm=std|mid|weak]
          [--clarity=<json>]    (compare only this gate; default compares 0.55 with RNW_POWER_CLARITY)
   Verdicts, as the game shows them: ok·tone = 3+ readings and they fit the
   new chord; ok·timing = fewer than 3 readings, so it passed on timing
   alone (ccResolvePend's rule); off = "on time but sounded messy"; miss = no
   strum detected on the beat. Synthetic audio only — NOT a guitar through a
   Chromebook mic; check against the console's Mic recordings before tuning. */
import fs from 'fs';
import { extract } from './extract.mjs';

const SR = 48000, LAT = 50, GAIN = 3;
const args = process.argv.slice(2);
const file = args[0];
const TRIALS = +(args.find(a => /^\d+$/.test(a)) || 12);
const opt = k => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : null; };
const HARMS = { std: [1, 0.5, 0.25], mid: [0.6, 1, 0.5], weak: [0.3, 1, 0.5] };
const HARM = HARMS[opt('harm') || 'std'];
if (!file || !HARM){ console.error('usage: node power-switch.mjs <coach.js> [trials] [--harm=std|mid|weak] [--clarity=json]'); process.exit(2); }

const src = fs.readFileSync(file, 'utf8');
const constLine = n => { const m = src.match(new RegExp('^const ' + n + '\\s*=\\s*([^;]+);', 'm')); return m ? `const ${n} = ${m[1]};` : ''; };
const consts = ['COACH_LVL_WIN', 'COACH_LVL_HOP', 'COACH_CATCHUP_MAX_MS', 'COACH_ATTACK_SKIP', 'COACH_ONSET_REFRACT', 'COACH_EVENT_TAIL',
  'CHK_ONSET_FLOOR', 'CHK_ONSET_RATIO', 'CHK_HF_FLOOR', 'CHK_HF_RATIO', 'COACH_STANDOUT', 'COACH_PITCH_GATE',
  'COACH_STANDOUT_TARGET', 'RNW_POWER_CLARITY'].map(constLine).join('\n');
const fns = ['coachReadFrame', 'coachDetectPitch', 'coachPitchReadings', 'coachSmooth', 'ccResolvePend'].map(n => extract(src, n)).join('\n');
const POWER_GATE = opt('clarity') ? JSON.parse(opt('clarity')) : null;
const loopsJson = src.match(/const CC_POWER_PROGRESSIONS = (\[[\s\S]*?\n\]);/);
if (!loopsJson) { console.error('no CC_POWER_PROGRESSIONS in ' + file); process.exit(2); }
const LOOPS = new Function('return ' + loopsJson[1])();

const body = `let micRec=null,coachHfRms=0,coachBgRms=0,coachBgPrev=0,coachOnsetAt=0,coachReadCtx=null,coachReadCtxT=0,coachYinD=null,coachSmoothA=0.18;
const tunerMedian=a=>{const b=[...a].sort((x,y)=>x-y);return b[Math.floor(b.length/2)];};
${consts}
const cc = { classes: {}, changes: [] };
function ccChipRefresh(){}
${fns}
return { read: coachReadFrame, smooth: coachSmooth, readings: coachPitchReadings, resolve: ccResolvePend, cc, hf: () => coachHfRms, onsetAt: () => coachOnsetAt,
  K: { TAIL: COACH_EVENT_TAIL, SKIP: COACH_ATTACK_SKIP, REFRACT: COACH_ONSET_REFRACT, FLOOR: CHK_ONSET_FLOOR, RATIO: CHK_ONSET_RATIO, HFFLOOR: CHK_HF_FLOOR, HFRATIO: CHK_HF_RATIO, GATE: COACH_PITCH_GATE, POWER: RNW_POWER_CLARITY } };`;
const factory = new Function('coachAnalyser', 'coachCtx', 'coachFrameBuf', 'coachUpdateMicLevel', 'performance', body);

function rnd(seed){ return () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296; }
function addNote(buf, startS, midi, amp, harm, tau){
  const f = 440 * Math.pow(2, (midi - 69) / 12);
  const k = Math.exp(-1 / (tau * SR));
  harm.forEach((a, h) => {
    const w = 2 * Math.PI * f * (h + 1) / SR; let e = amp * a;
    for (let i = startS; i < buf.length; i++){ buf[i] += e * Math.sin(w * (i - startS) + h); e *= k; }
  });
}
// Root midi of each three-finger shape (low E = 40, A string = 45); the shape is root, +7, +12.
const ROOT = { F5: 41, G5: 43, A5: 45, B5: 47, C5: 48, D5: 50 };
const pcs = n => [ROOT[n], ROOT[n] + 7, ROOT[n] + 12].map(m => m % 12);
const strum = (buf, startS, root, harm) => [0, 7, 12].forEach((off, i) => addNote(buf, startS + Math.floor(i * 0.035 * SR), root + off, 0.16 * GAIN, harm, 0.8));

function trial(from, to, scenario, seed, gate){
  const r = rnd(seed);
  let vnow = 800;
  const wave = new Float32Array(Math.floor(3.4 * SR));
  strum(wave, 0, ROOT[from], HARM);                                   // the beat before: the old chord, still ringing
  const second = scenario === 'held' ? ROOT[from] : scenario === 'sharp' ? ROOT[to] + 1 : ROOT[to];
  strum(wave, Math.floor(1.0 * SR), second, HARM);                    // the graded beat, one second later (60 BPM)
  for (const t0 of [0, 1.0]) for (let i = 0; i < 288; i++) wave[Math.floor(t0 * SR) + i] += (r() - 0.5) * 3 * 0.16 * GAIN * (1 - i / 288);   // pick scrape
  const s0 = Math.floor(1.0 * SR);                                    // wave sample 0 is heard at vnow = 1000 ms
  const ctx = { sampleRate: SR, get currentTime(){ return vnow / 1000; } };
  const an = { getFloatTimeDomainData(b){
    const endS = Math.floor((vnow - LAT) / 1000 * SR), st = endS - b.length;
    for (let i = 0; i < b.length; i++){ const s = st + i; b[i] = (r() - 0.5) * 0.004 * GAIN + (s >= s0 && s - s0 < wave.length ? wave[s - s0] : 0); }
  } };
  const F = factory(an, ctx, new Float32Array(4096), () => {}, { now: () => vnow });
  const K = F.K, cc = F.cc;
  cc.classes[from] = pcs(from); cc.classes[to] = pcs(to);
  cc.smoothRms = 0; cc.smoothHf = 0;
  const ch = { from, to, result: null, pend: null };
  cc.changes = [ch];
  let lastOnsetT = -1e9, lastPitchT = 0, nReadings = null;
  const clar = gate;
  while (vnow < 4200){
    vnow += 50 * (0.7 + r() * 0.6);
    const rms = F.read(), now = vnow, hf = F.hf(), at = F.onsetAt();
    if ((rms > K.FLOOR && rms > cc.smoothRms * K.RATIO || hf > K.HFFLOOR && hf > cc.smoothHf * K.HFRATIO) && at - lastOnsetT > K.REFRACT){
      lastOnsetT = at;
      if (at - LAT > 1900 && !ch.pend && ch.result === null) ch.pend = { t: at, readings: [] };   // only the graded beat counts
    }
    F.smooth(cc, rms, hf);
    if (ch.pend){
      if (rms > K.GATE * 0.5){
        const p = ch.pend;
        F.readings(lastPitchT, p.t + K.SKIP, clar).forEach(x => { lastPitchT = x.t; if (x.midi != null && x.t - p.t <= K.TAIL) p.readings.push(x.midi); });
      }
      if (now - ch.pend.t > K.TAIL){ nReadings = ch.pend.readings.length; F.resolve(ch); break; }
    }
  }
  if (ch.result === null) return 'miss';
  return ch.result === 'off' ? 'off' : (nReadings >= 3 ? 'ok·tone' : 'ok·timing');
}

const PAIRS = [...new Set(LOOPS.flatMap(l => l.chords.map((c, i) => c + '>' + l.chords[(i + 1) % l.chords.length])))].map(s => s.split('>'));
const POWER_RAW = new Function('return ' + (constLine('RNW_POWER_CLARITY').replace(/^const \w+ = |;$/g, '') || '0.55'))();
const GATES = POWER_GATE ? [['custom ' + JSON.stringify(POWER_GATE), POWER_GATE]] : [['0.55 (Change Up)', 0.55], ['RNW_POWER_CLARITY ' + JSON.stringify(POWER_RAW), POWER_RAW]];
console.log(`${file} · ${PAIRS.length} adjacent chord pairs · harmonics ${opt('harm') || 'std'} · ${TRIALS} trials each`);
const WANT = { change: 'should pass', held: 'should FAIL (never moved)', sharp: 'should FAIL (one fret off)' };
for (const [gname, gate] of GATES){
  console.log(`\n── gate ${gname}`);
  for (const scenario of ['change', 'held', 'sharp']){
    const tally = { 'ok·tone': 0, 'ok·timing': 0, off: 0, miss: 0 };
    /* Per pair, the verdict that is WRONG for this scenario: a false "messy"
       on a real change, a false pass on a held or sharp chord. */
    const pairOff = {};
    for (const [a, b] of PAIRS) for (let s = 1; s <= TRIALS; s++){
      const v = trial(a, b, scenario, s * 7919 + a.charCodeAt(0) * 31 + b.charCodeAt(0), gate);
      tally[v]++;
      if (scenario === 'change' ? v === 'off' : (v === 'ok·tone' || v === 'ok·timing')) pairOff[a + '→' + b] = (pairOff[a + '→' + b] || 0) + 1;
    }
    const n = PAIRS.length * TRIALS, pct = k => String(Math.round(100 * tally[k] / n)).padStart(3) + '%';
    const passed = tally['ok·tone'] + tally['ok·timing'];
    console.log(`${scenario.padEnd(7)} ${WANT[scenario].padEnd(26)} credited ${String(Math.round(100 * passed / n)).padStart(3)}%  = tone ${pct('ok·tone')} + timing-only ${pct('ok·timing')}   |  off ${pct('off')}  miss ${pct('miss')}`);
    const worst = Object.entries(pairOff).sort((x, y) => y[1] - x[1]).slice(0, 5).map(([k, v]) => `${k} ${Math.round(100 * v / TRIALS)}%`).join(', ');
    if (worst) console.log(`        worst pairs, ${scenario === 'change' ? 'false "messy"' : 'false pass'}: ${worst}`);
  }
}
