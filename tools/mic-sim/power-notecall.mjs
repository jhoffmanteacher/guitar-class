/* Note Call's power-chord mode (ca-43, 2026-10-30): does the mic hear a
   strummed power chord? Drives the REAL coachReadFrame / coachDetectPitch /
   coachPitchReadings / coachSettlePitch / coachOnsetTick (coach.js) through a
   copy of ncListen's listening logic (app.js), against one synthetic strum in
   a quiet room, for every root ca-43 can call: low E and A strings, frets 0-12
   (the whole-neck step's cards, built the way ncPool builds them, so a note
   that sits on fret 0 AND fret 12 is one card with two roots).

   The accept rule comes from the files under test. With ncTargets /
   ncAnswerAt in app.js the card is answered by its root, its octave or the
   octave below (ncPowerTones, read from app.js), at RNW_POWER_CLARITY; without
   them it is the old rule, the exact root at the default clarity. So the same
   command gives the before and the after:
     git show <old>:coach.js > /tmp/coach-old.js
     git show <old>:app.js   > /tmp/app-old.js
     node tools/mic-sim/power-notecall.mjs /tmp/coach-old.js /tmp/app-old.js
     node tools/mic-sim/power-notecall.mjs coach.js app.js

   usage: node power-notecall.mjs <coach.js> <app.js> [trials=40]
                                  [--harm=std|mid|weak] [--only=<case text>]
                                  [--per-root] [--offsets=<n,n,...>]
     --harm      each string's harmonic balance: std [1,.5,.25] (strong
                 fundamental), mid [.6,1,.5], weak [.3,1,.5] (a mic that
                 loses the low fundamental), as power-wait.mjs.
     --per-root  also print every root's own accepted count.
     --offsets   what-if: answer each root with these semitone offsets
                 (e.g. -12,0,7,12) instead of the file's own rule, to try a
                 rule without editing app.js. The exact root still wins.
   Prints, per case over all 26 roots: how many trials were ACCEPTED (counted
   as an answer to the card), what the rest settled on ("judged +N" = the mic
   settled on a note N semitones from the root: the card shows "Heard X";
   "none" = nothing happened), and the lowest / highest root. WRONG cases that
   are accepted more than 1 in 100 are marked STOP. Synthetic audio only, not
   a guitar through a Chromebook mic: the console's Mic recordings view is the
   real test.

   THE 5TH IS NOT ACCEPTED (Jonathan, 2026-10-31). Run on both rules, 26 roots
   x 40 trials, std / mid / weak. With the 5th accepted (the code before that
   day): "WRONG strum, rooted a 5th above the card" 7.7% / 28.9% / 100%; "WRONG
   strum, rooted a 4th below the card" 0% / 4.5% / 7.7%; "WRONG two strings,
   root + fifth, a 5th above" 7.7% / 7.7% / 7.8% (all STOP: a chord a 5th above
   has the card's 5th as its root). Without it: those rows are 0 of 1040 at all
   three balances and no row prints STOP. Of 51 rows (17 x 3), 43 are
   identical and the 8 that changed are those wrong-chord rows; all 15 RIGHT
   rows give the same numbers, because in every run a right strum was answered
   by the root, the octave or the octave below, never by the 5th. A row that
   prints STOP now is a change to look at. */
import fs from 'fs';
import { extract } from './extract.mjs'; import { readScriptArg } from '../site-src.mjs';

const SR = 48000, LAT = 50, GAIN = 3;
const args = process.argv.slice(2);
const files = args.filter(a => !a.startsWith('--') && !/^\d+$/.test(a));
const [coachFile, appFile] = files;
const TRIALS = +(args.find(a => /^\d+$/.test(a)) || 40);
const opt = k => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : null; };
const HARMS = { std: [1, 0.5, 0.25], mid: [0.6, 1, 0.5], weak: [0.3, 1, 0.5] };
const HARM = HARMS[opt('harm') || 'std'];
const ONLY = opt('only');
const PER_ROOT = args.includes('--per-root');
const OFFSETS = opt('offsets') ? opt('offsets').split(',').map(Number) : null;
if (!coachFile || !appFile || !HARM){ console.error('usage: node power-notecall.mjs <coach.js> <app.js> [trials] [--harm=std|mid|weak] [--only=text] [--per-root]'); process.exit(2); }

const csrc = readScriptArg(coachFile), asrc = readScriptArg(appFile);
const constLine = n => { const m = csrc.match(new RegExp('^const ' + n + '\\s*=\\s*([^;]+);', 'm')); return m ? `const ${n} = ${m[1]};` : ''; };
const consts = ['COACH_LVL_WIN', 'COACH_LVL_HOP', 'COACH_CATCHUP_MAX_MS', 'COACH_ATTACK_SKIP', 'COACH_ONSET_REFRACT',
  'CHK_ONSET_FLOOR', 'CHK_ONSET_RATIO', 'CHK_HF_FLOOR', 'CHK_HF_RATIO', 'COACH_STANDOUT', 'COACH_PITCH_GATE',
  'COACH_STANDOUT_TARGET', 'RNW_POWER_CLARITY'].map(constLine).join('\n');
const hasHelper = asrc.includes('function coachPowerTargets(');   // app.js (Note Call needs it before coach.js loads)
const hasNcRule = asrc.includes('function ncTargets(') && asrc.includes('function ncAnswerAt(');
const listenSrc = extract(asrc, 'ncListen');
const hasClarity = /coachSettlePitch\([^)]*RNW_POWER_CLARITY/.test(listenSrc);
const fns = ['coachReadFrame', 'coachDetectPitch', 'coachPitchReadings', 'coachSettlePitch', 'coachSmooth', 'coachOnsetTick']
  .map(n => extract(csrc, n)).join('\n')
  + (hasHelper ? '\n' + extract(asrc, 'coachPowerTargets') : '')
  + (hasNcRule ? '\n' + (asrc.includes('function ncPowerTones(') ? extract(asrc, 'ncPowerTones') + '\n' : '') + extract(asrc, 'ncTargets') + '\n' + extract(asrc, 'ncAnswerAt') : '');
const body = `let micRec=null,coachHfRms=0,coachBgRms=0,coachBgPrev=0,coachOnsetAt=0,coachReadCtx=null,coachReadCtxT=0,coachYinD=null,coachSmoothA=0.18;
const tunerMedian=a=>{const b=[...a].sort((x,y)=>x-y);return b[Math.floor(b.length/2)];};
${consts}
${fns}
const OFFS = ${OFFSETS ? JSON.stringify(OFFSETS) : 'null'};
const targetsFor = OFFS ? (p => p.midis.reduce((a, r) => a.concat(OFFS.map(o => r + o)), [])) : ${hasNcRule ? 'p => ncTargets(p)' : 'p => p.midis'};
const answerAt = OFFS ? ((p, m) => { const e = p.midis.indexOf(m); if (e >= 0) return e; return p.midis.findIndex(r => OFFS.some(o => r + o === m)); }) : ${hasNcRule ? '(p, m) => ncAnswerAt(p, m)' : '(p, m) => p.midis.indexOf(m)'};
const clarity = ${hasClarity || OFFSETS ? 'RNW_POWER_CLARITY' : 'undefined'};
return {read:coachReadFrame, settle:coachSettlePitch, GATE:COACH_PITCH_GATE, onsetAt:()=>coachOnsetAt, targetsFor, answerAt, clarity};`;
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
// card = a Note Call card { midis, ... }; base = the midi the student's shape is rooted on;
// play = [[semitones from base, level], ...]. ncListen's loop: settle over the gate, reset under half of it.
function trial(card, base, play, seed, harm){
  const r = rnd(seed);
  let vnow = 1000;
  const wave = new Float32Array(Math.floor(2.4 * SR));
  for (const [off, a] of play) addNote(wave, base + off, 0.16 * GAIN * a, harm, 0.8);
  for (let i = 0; i < 288; i++) wave[i] += (r() - 0.5) * 3 * 0.16 * GAIN * (1 - i / 288);   // pick scrape
  const s0 = Math.floor(1.5 * SR);
  const ctx = { sampleRate: SR, get currentTime(){ return vnow / 1000; } };
  const an = { getFloatTimeDomainData(b){
    const endS = Math.floor((vnow - LAT) / 1000 * SR), st = endS - b.length;
    for (let i = 0; i < b.length; i++){ const s = st + i; b[i] = (r() - 0.5) * 0.004 * GAIN + (s >= s0 && s - s0 < wave.length ? wave[s - s0] : 0); }
  } };
  const F = factory(an, ctx, new Float32Array(4096), () => {}, { now: () => vnow });
  const st = { readings: [], attackT: 0, lastPitchT: 0 };
  const want = F.targetsFor(card);
  while (vnow < 4500){
    vnow += 50 * (0.7 + r() * 0.6);
    const rms = F.read();
    if (rms > F.GATE){
      if (!st.attackT) st.attackT = F.onsetAt();
      const m = F.settle(st, want, rms, undefined, F.clarity);
      if (m != null) return { m, ok: F.answerAt(card, m) >= 0 };
    } else if (rms < F.GATE * 0.5){ st.readings = []; st.attackT = 0; }
  }
  return { m: null, ok: false };
}

// The cards of the whole-neck step (ncPool: per string, one card per note name, holding every fret it sits on in 0..12).
const OPEN = { lowE: 40, A: 45 };
const NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const ROOTS = [];     // { card, fret, midi, label }
for (const k of ['lowE', 'A']){
  const by = {};
  for (let f = 0; f <= 12; f++) (by[NAMES[(OPEN[k] + f) % 12]] = by[NAMES[(OPEN[k] + f) % 12]] || []).push(f);
  for (const n of Object.keys(by)){
    const card = { str: k, note: n + '5', power: true, frets: by[n], midis: by[n].map(f => OPEN[k] + f) };
    by[n].forEach(f => ROOTS.push({ card, fret: f, midi: OPEN[k] + f, label: `${k} fret ${f} (${n}5)` }));
  }
}
const strum = (d, b = [1, 1, 1]) => [[d, b[0]], [d + 7, b[1]], [d + 12, b[2]]];
const CASES = [
  ['RIGHT single root',                         false, [[0, 1]]],
  ['RIGHT strum, equal strings',                false, strum(0, [1, 1, 1])],
  ['RIGHT strum, root loudest',                 false, strum(0, [1.3, 0.8, 0.8])],
  ['RIGHT strum, root quietest',                false, strum(0, [0.5, 1, 1])],
  ['RIGHT two strings, root + fifth',           false, [[0, 1], [7, 1]]],
  ['WRONG single, one fret high',               true,  [[1, 1]]],
  ['WRONG single, one fret low',                true,  [[-1, 1]]],
  ['WRONG strum, one fret high',                true,  strum(1)],
  ['WRONG strum, one fret low',                 true,  strum(-1)],
  ['WRONG strum, two frets high',               true,  strum(2)],
  ['WRONG strum, two frets low (next chord)',   true,  strum(-2)],
  ['WRONG strum, one string too high',          true,  [[5, 1], [12, 1], [17, 1]]],
  // Another chord from the same step (2026-10-30 review): its root is a 5th or a 4th from the card's. A chord rooted a 5th ABOVE the card
  // (E5 asked, B5 played) has the card's 5th as its root, so the 5th as an accepted pitch lets it through; a chord rooted a 5th below has the card's root as its 5th.
  ['WRONG strum, rooted a 5th above the card',  true,  strum(7)],
  ['WRONG strum, rooted a 5th below the card',  true,  strum(-7)],
  ['WRONG strum, rooted a 4th above the card',  true,  strum(5)],
  ['WRONG strum, rooted a 4th below the card',  true,  strum(-5)],
  ['WRONG two strings, root + fifth, a 5th above', true, [[7, 1], [14, 1]]],
];
console.log(`${coachFile} + ${appFile} · coachPowerTargets: ${hasHelper} · ncTargets/ncAnswerAt: ${hasNcRule} · power clarity in ncListen: ${hasClarity}${OFFSETS ? ' · WHAT-IF offsets ' + OFFSETS.join(',') + ' (RNW_POWER_CLARITY)' : ''} · harmonics ${opt('harm') || 'std'} · ${ROOTS.length} roots x ${TRIALS} trials`);
let stop = 0;
for (const [name, wrong, play] of CASES){
  if (ONLY && !name.includes(ONLY)) continue;
  const tally = {}; let pass = 0, total = 0;
  const per = [];
  ROOTS.forEach((R, ri) => {
    let p = 0;
    for (let s = 1; s <= TRIALS; s++){
      const { m, ok } = trial(R.card, R.midi, play, s + ri * 1000, HARM);
      total++; if (ok){ p++; pass++; }
      const d = m == null ? null : m - R.midi;
      const k = m == null ? 'none' : (ok ? 'ACCEPT ' : 'judged ') + (d >= 0 ? '+' : '') + d;
      tally[k] = (tally[k] || 0) + 1;
    }
    per.push([p, R.label]);
  });
  const sorted = per.slice().sort((a, b) => a[0] - b[0]);
  const flag = wrong && pass / total > 0.01 ? '  <-- STOP: more than 1 in 100' : '';
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k}:${v}`).join(' ');
  console.log(name.padEnd(42), `accepted ${String(pass).padStart(4)}/${total}`.padEnd(20), `(${(100 * pass / total).toFixed(1)}%)`.padEnd(9), `lo ${sorted[0][0]}/${TRIALS} ${sorted[0][1]} · hi ${sorted[sorted.length - 1][0]}/${TRIALS}`, '·', top + flag);
  if (flag) stop++;
  if (PER_ROOT) per.forEach(([p, l]) => console.log('   ', l.padEnd(26), p + '/' + TRIALS));
}
if (stop) console.log(`\n${stop} wrong case(s) accepted more than 1 in 100: STOP and ask Jonathan.`);
