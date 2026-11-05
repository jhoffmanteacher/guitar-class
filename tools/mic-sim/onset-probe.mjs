/* Onset-only probe (2026-11-05, from the review of the Power Chord Switch strum ratios): how often does ccLoop's onset
   condition fire on a strum that lands over the previous chord still ringing, at the shared strum ratios (CHK_*) and at
   Power Chord Switch's own (CC_POWER_*)? It runs the REAL coachReadFrame and coachSmooth from <coach.js> on synthetic
   strums (a chord every `gap` s, the last one softer or without a pick scrape, 16.7 or 50 ms frames), so its numbers are
   RELATIVE (which setting hears more), not predictions about real students. A firm pick strum is heard by both; only the
   settings where the two differ, or where the shared ratios do not always hear it, are printed.
     node tools/mic-sim/onset-probe.mjs <coach.js> [trials=20]
   To try other ratios, run it on a scratch copy of coach.js with other CC_POWER_* values. Numbers recorded in WORKFLOW.md
   ("Decision (2026-11-05)"). tools/mic-sim/power-switch.mjs is the other simulator: its strums carry a loud pick scrape,
   so it shows nothing about soft ones. */
import fs from 'fs';
import { extract } from './extract.mjs';
const file = process.argv[2];
const src = fs.readFileSync(file, 'utf8');
const constLine = n => { const m = src.match(new RegExp('^const ' + n + '\\s*=\\s*([^;]+);', 'm')); return m ? `const ${n} = ${m[1]};` : ''; };
const consts = ['COACH_LVL_WIN', 'COACH_LVL_HOP', 'COACH_CATCHUP_MAX_MS', 'COACH_ONSET_REFRACT', 'CHK_ONSET_FLOOR', 'CHK_ONSET_RATIO', 'CHK_HF_FLOOR', 'CHK_HF_RATIO', 'CC_POWER_ONSET_RATIO', 'CC_POWER_HF_RATIO'].map(constLine).join('\n');
const body = `let micRec=null,coachHfRms=0,coachBgRms=0,coachBgPrev=0,coachOnsetAt=0,coachReadCtx=null,coachReadCtxT=0,coachSmoothA=0.18;
${consts}
${extract(src, 'coachReadFrame')}
${extract(src, 'coachSmooth')}
return { read: coachReadFrame, smooth: coachSmooth, hf: () => coachHfRms, at: () => coachOnsetAt,
  K: { F: CHK_ONSET_FLOOR, HF: CHK_HF_FLOOR, REF: COACH_ONSET_REFRACT, R: CHK_ONSET_RATIO, HR: CHK_HF_RATIO, PR: CC_POWER_ONSET_RATIO, PHR: CC_POWER_HF_RATIO } };`;
const factory = new Function('coachAnalyser', 'coachCtx', 'coachFrameBuf', 'coachUpdateMicLevel', 'performance', body);
const SR = 48000, LAT = 50, GAIN = 3;
function rnd(seed){ return () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296; }
function addNote(buf, startS, midi, amp, harm, tau){
  const f = 440 * Math.pow(2, (midi - 69) / 12), k = Math.exp(-1 / (tau * SR));
  harm.forEach((a, h) => { const w = 2 * Math.PI * f * (h + 1) / SR; let e = amp * a; for (let i = startS; i < buf.length; i++){ buf[i] += e * Math.sin(w * (i - startS) + h); e *= k; } });
}
const strum = (buf, startS, root, harm, g, spread) => [0, 7, 12].forEach((off, i) => addNote(buf, startS + Math.floor(i * spread * SR), root + off, 0.16 * GAIN * g, harm, 0.8));
// returns [fires at shared, fires at power] for the graded (last) strum
function trial({ gap, g, scrape, frameMs, seed, harm, n, spread, noise }){
  const r = rnd(seed);
  const len = Math.floor((gap * n + 1.5) * SR), wave = new Float32Array(len);
  for (let k = 0; k < n; k++){ const gk = k === n - 1 ? g : 1; strum(wave, Math.floor(k * gap * SR), 43 + (k % 2) * 7, harm, gk, spread);
    for (let i = 0; i < 288; i++) wave[Math.floor(k * gap * SR) + i] += (r() - 0.5) * 3 * 0.16 * GAIN * gk * scrape * (1 - i / 288); }
  const s0 = Math.floor(1.0 * SR);
  const out = [];
  for (const power of [false, true]){
    let vnow = 800; const rr = rnd(seed + 1);
    const ctx = { sampleRate: SR, get currentTime(){ return vnow / 1000; } };
    const an = { getFloatTimeDomainData(b){ const endS = Math.floor((vnow - LAT) / 1000 * SR), st = endS - b.length;
      for (let i = 0; i < b.length; i++){ const s = st + i; b[i] = (rr() - 0.5) * noise * GAIN + (s >= s0 && s - s0 < wave.length ? wave[s - s0] : 0); } } };
    const F = factory(an, ctx, new Float32Array(4096), () => {}, { now: () => vnow });
    const st = { smoothRms: 0, smoothHf: 0 }; let last = -1e9, hit = false;
    const due = 1000 + (n - 1) * gap * 1000 + LAT, win = Math.max(220, gap * 500);
    const ratio = power ? F.K.PR : F.K.R, hr = power ? F.K.PHR : F.K.HR;
    while (vnow < due + 600){
      vnow += frameMs * (0.7 + rr() * 0.6);
      const rms = F.read(), hf = F.hf(), at = F.at();
      if ((rms > F.K.F && rms > st.smoothRms * ratio || hf > F.K.HF && hf > st.smoothHf * hr) && at - last > F.K.REF){ last = at; if (Math.abs(at - due) <= win) hit = true; }
      F.smooth(st, rms, hf);
    }
    out.push(hit);
  }
  return out;
}
const HARMS = { std: [1, 0.5, 0.25], weak: [0.3, 1, 0.5] };
const T = +(process.argv[3] || 20);
console.log('gap s | last strum gain | scrape | frame ms | spread s -> fired (shared 1.4/1.7) vs (PCS 2.2/2.67) of ' + T);
for (const frameMs of [16.7, 50]) for (const gap of [1.0, 0.667, 0.429]) for (const g of [1, 0.6, 0.4]) for (const scrape of [1, 0.25, 0]) for (const spread of [0.035, 0.08]){
  let a = 0, b = 0;
  for (let s = 1; s <= T; s++){ const [x, y] = trial({ gap, g, scrape, frameMs, seed: s * 7919, harm: HARMS.std, n: 4, spread, noise: 0.004 }); a += x; b += y; }
  if (a !== b || a < T) console.log(`${gap} | ${g} | ${scrape} | ${frameMs} | ${spread} -> ${a} vs ${b}`);
}
console.log('(rows where both fire every time are not printed)');
