/* Riff Runner Wait Mode on Watchtower's power-chord tokens (A5 / G5 / F5),
   2026-10-12. Drives the REAL coachReadFrame / coachDetectPitch /
   coachPitchReadings / coachSettlePitch / coachIdleTick (and, when the file
   has them, rnwTargets / rnwIsPower / RNW_POWER_CLARITY) through a copy of
   rnwLoop's listening logic, against one synthetic strum in a quiet room.

   The accept rule comes from the file under test: with rnwTargets it is
   rnwTargets(n).includes(midi) (the targets also go to coachSettlePitch),
   without it the pre-2026-10-12 rule, midi === root. So the same command
   gives the before and the after:
     git show <old>:coach.js > /tmp/coach-old.js
     node tools/mic-sim/power-wait.mjs /tmp/coach-old.js
     node tools/mic-sim/power-wait.mjs coach.js

   usage: node power-wait.mjs <coach.js> [trials=40] [--harm=std|mid|weak]
                              [--only=<case text>] [--clarity=<json>]
     --harm      each string's harmonic balance: std [1,.5,.25] (strong
                 fundamental), mid [.6,1,.5], weak [.3,1,.5] (a mic that
                 loses the low fundamental). Default std.
     --clarity   force the power tokens' clarity (e.g. 0.55 or [0.22,0.45])
                 to try a value without editing coach.js.
   Prints, per case and chord, how many trials were ACCEPTED and what the
   rest settled on ("judged +N" = a wrong-note hint N semitones from the
   root, "none" = nothing happened). Synthetic audio only — not a guitar. */
import fs from 'fs';
import { extract } from './extract.mjs';

const SR = 48000, LAT = 50, GAIN = 3;
const args = process.argv.slice(2);
const file = args[0];
const TRIALS = +(args.find(a => /^\d+$/.test(a)) || 40);
const opt = k => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : null; };
const HARMS = { std: [1, 0.5, 0.25], mid: [0.6, 1, 0.5], weak: [0.3, 1, 0.5] };
const HARM = HARMS[opt('harm') || 'std'];
const ONLY = opt('only');
const FORCE_CLAR = opt('clarity');
if (!file || !HARM){ console.error('usage: node power-wait.mjs <coach.js> [trials] [--harm=std|mid|weak] [--only=text] [--clarity=json]'); process.exit(2); }

const src = fs.readFileSync(file, 'utf8');
const constLine = n => { const m = src.match(new RegExp('^const ' + n + '\\s*=\\s*([^;]+);', 'm')); return m ? `const ${n} = ${m[1]};` : ''; };
const consts = ['COACH_LVL_WIN', 'COACH_LVL_HOP', 'COACH_CATCHUP_MAX_MS', 'COACH_ATTACK_SKIP', 'COACH_ONSET_REFRACT',
  'CHK_ONSET_FLOOR', 'CHK_ONSET_RATIO', 'CHK_HF_FLOOR', 'CHK_HF_RATIO', 'COACH_STANDOUT', 'COACH_PITCH_GATE',
  'COACH_STANDOUT_TARGET', 'RNW_POWER_RE', 'RNW_POWER_CLARITY'].map(constLine).join('\n');
const hasTargets = src.includes('function rnwTargets(');
const hasPower = src.includes('function rnwIsPower(');
const fns = ['coachReadFrame', 'coachDetectPitch', 'coachPitchReadings', 'coachSettlePitch', 'coachSmooth', 'coachOnsetTick', 'coachIdleTick']
  .concat(hasTargets ? ['rnwTargets'] : []).concat(hasPower ? ['rnwIsPower'] : [])
  .map(n => extract(src, n)).join('\n');
const clarityExpr = FORCE_CLAR ? `n => (${hasPower ? 'rnwIsPower(n)' : 'true'} ? ${FORCE_CLAR} : undefined)`
  : hasPower ? 'n => (rnwIsPower(n) ? RNW_POWER_CLARITY : undefined)' : 'n => undefined';
const body = `let micRec=null,coachHfRms=0,coachBgRms=0,coachBgPrev=0,coachOnsetAt=0,coachReadCtx=null,coachReadCtxT=0,coachYinD=null,coachSmoothA=0.18;
const tunerMedian=a=>{const b=[...a].sort((x,y)=>x-y);return b[Math.floor(b.length/2)];};
${consts}
${fns}
const targetsFor = ${hasTargets ? 'n => rnwTargets(n)' : 'n => [n.midi]'};
const clarityFor = ${clarityExpr};
const accepts = ${hasTargets ? '(n, m) => rnwTargets(n).indexOf(m) >= 0' : '(n, m) => m === n.midi'};
return {read:coachReadFrame, settle:coachSettlePitch, idle:coachIdleTick, GATE:COACH_PITCH_GATE, onsetAt:()=>coachOnsetAt, targetsFor, clarityFor, accepts};`;
const factory = new Function('coachAnalyser', 'coachCtx', 'coachFrameBuf', 'coachUpdateMicLevel', 'performance', body);

function rnd(seed){ return () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296; }
function addNote(buf, midi, amp, harm, tau){
  const f = 440 * Math.pow(2, (midi - 69) / 12);
  const k = Math.exp(-1 / (tau * SR));
  harm.forEach((a, h) => {
    const w = 2 * Math.PI * f * (h + 1) / SR; let e = amp * a;
    for (let i = 0; i < buf.length; i++){ buf[i] += e * Math.sin(w * i + h); e *= k; }
  });
}
// tok = a Wait Mode token { midi, label }; play = [[semitones from the token's root, level], ...]
function trial(tok, play, seed, harm){
  const r = rnd(seed);
  let vnow = 1000;
  const wave = new Float32Array(Math.floor(2.4 * SR));
  for (const [off, a] of play) addNote(wave, tok.midi + off, 0.16 * GAIN * a, harm, 0.8);
  for (let i = 0; i < 288; i++) wave[i] += (r() - 0.5) * 3 * 0.16 * GAIN * (1 - i / 288);   // pick scrape
  const s0 = Math.floor(1.5 * SR);
  const ctx = { sampleRate: SR, get currentTime(){ return vnow / 1000; } };
  const an = { getFloatTimeDomainData(b){
    const endS = Math.floor((vnow - LAT) / 1000 * SR), st = endS - b.length;
    for (let i = 0; i < b.length; i++){ const s = st + i; b[i] = (r() - 0.5) * 0.004 * GAIN + (s >= s0 && s - s0 < wave.length ? wave[s - s0] : 0); }
  } };
  const F = factory(an, ctx, new Float32Array(4096), () => {}, { now: () => vnow });
  const w = { readings: [], attackT: 0, lastPitchT: 0, needSilence: false, cooldownUntil: 0 };
  const targets = F.targetsFor(tok), clarity = F.clarityFor(tok);
  while (vnow < 4500){                   // rnwLoop: settle over the gate, idle otherwise
    vnow += 50 * (0.7 + r() * 0.6);
    const rms = F.read(), now = vnow;
    if (w.needSilence && (rms < F.GATE * 0.7 || now > w.cooldownUntil + 1800)) w.needSilence = false;
    if (!w.needSilence && now >= w.cooldownUntil && rms > F.GATE){
      if (!w.attackT) w.attackT = Math.max(F.onsetAt(), w.cooldownUntil);
      const m = F.settle(w, targets, rms, w.cooldownUntil, clarity);
      if (m != null) return { m, ok: F.accepts(tok, m) };
    } else { if (rms < F.GATE * 0.5){ w.readings = []; w.attackT = 0; } F.idle(w, rms, w.cooldownUntil); }
  }
  return { m: null, ok: false };
}

const TOKENS = { A5: { midi: 45, label: 'A5' }, G5: { midi: 43, label: 'G5' }, F5: { midi: 41, label: 'F5' } };
const strum = b => [[0, b[0]], [7, b[1]], [12, b[2]]];
const CASES = [
  ['RIGHT single root',                         [[0, 1]]],
  ['RIGHT strum, equal strings',                strum([1, 1, 1])],
  ['RIGHT strum, root quietest',                strum([0.5, 1, 1])],
  ['RIGHT strum, root loudest',                 strum([1.3, 0.8, 0.8])],
  ['RIGHT two strings, root + fifth',           [[0, 1], [7, 1]]],
  ['WRONG single, minor third up',              [[3, 1]]],
  ['WRONG single, a fourth up (root+5)',        [[5, 1]]],
  ['WRONG single, a fourth down (A5: open E)',  [[-5, 1]]],
  ['WRONG single, one fret high',               [[1, 1]]],
  ['WRONG single, one fret low',                [[-1, 1]]],
  ['WRONG strum, one fret high',                [[1, 1], [8, 1], [13, 1]]],
  ['WRONG strum, two frets low (next chord)',   [[-2, 1], [5, 1], [10, 1]]],
  ['WRONG strum, one string too high',          [[5, 1], [12, 1], [17, 1]]],
];
console.log(`${file} · rnwTargets: ${hasTargets} · power clarity: ${FORCE_CLAR || (hasPower ? constLine('RNW_POWER_CLARITY').replace(/^const \w+ = |;$/g, '') : 'default')} · harmonics ${opt('harm') || 'std'} · ${TRIALS} trials`);
for (const [name, play] of CASES){
  if (ONLY && !name.includes(ONLY)) continue;
  for (const [chord, tok] of Object.entries(TOKENS)){
    const tally = {}; let pass = 0;
    for (let s = 1; s <= TRIALS; s++){
      const { m, ok } = trial(tok, play, s, HARM);
      if (ok) pass++;
      const d = m == null ? null : m - tok.midi;
      const k = m == null ? 'none' : (ok ? 'ACCEPT ' : 'judged ') + (d >= 0 ? '+' : '') + d;
      tally[k] = (tally[k] || 0) + 1;
    }
    console.log(name.padEnd(42), chord, `accepted ${String(pass).padStart(3)}/${TRIALS}`, JSON.stringify(tally));
  }
}
