/* Tuning sim for coachSettlePitch (the one-note games: Note Hunt, PSG Hero,
   Wait Mode, Note Call). Drives the REAL coachReadFrame / coachSettlePitch /
   coachDetectPitch extracted from coach.js, inside a copy of fretLoop's
   listening logic, against a synthetic mic.

   The room is precomputed once per (room, seed) and shared by every
   parameter cell, so a sweep costs the game loop, not the synth. The
   student's plucks are synthesised live, because when they happen depends
   on the game (a right answer brings the next prompt 900 ms later, and the
   student plays it 1.0–2.0 s after it appears).

   Rooms:
     quiet   — mic hiss only
     single  — the old worst case: ONE neighbour at ~half the student's
               level, plucking every 150–550 ms
     class   — a realistic classroom: 6–10 neighbours, each 0.08–0.35 of the
               student's level, a pluck every 0.5–2.0 s, over a continuous din
   Students: right (plays the target), wrong (a whole step off), soft
   (the "soft after loud" lockout test: 6 loud right notes at 2x, then soft
   ones at 0.5x — counts only the soft phase).

   usage: node tune.mjs <coach.js> '<json {cellName: {CONST: value}}>' [prompts=120] [fps=20]
   prints, per cell and room: right-first-time %, false "wrong" hints on
   right notes %, wrong notes counted right %, wrong notes caught %. */
import fs from 'fs';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { extract } from './extract.mjs';

const SR = 48000, LAT = 50, GAIN = 3;
const STUD = 0.16;                       // the student's mean pluck amplitude (pre-gain)
const TARGETS = [40, 43, 45, 47, 48, 50, 52, 53, 55, 57, 59, 60, 62, 64];

function rnd(seed){ return () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296; }

// Add one plucked note into buf starting at sample s0 (phasor recurrence, no Math.sin per sample).
function addPluck(buf, s0, midi, amp, tau, r){
  const f = 440 * Math.pow(2, (midi - 69) / 12);
  const n = Math.min(buf.length - s0, Math.floor(tau * 3 * SR));
  const k = Math.exp(-1 / (tau * SR));
  const parts = [[1, f], [0.5, 2 * f], [0.25, 3 * f]];
  for (const [a, fr] of parts){
    const w = 2 * Math.PI * fr / SR, c = Math.cos(w), sn = Math.sin(w);
    let x = 0, y = 1, e = amp * a;     // start at phase 0 like sin()
    for (let i = 0; i < n; i++){
      buf[s0 + i] += e * x;
      const nx = x * c + y * sn; y = y * c - x * sn; x = nx;
      e *= k;
    }
  }
  const na = Math.floor(0.006 * SR);    // pick scrape
  for (let i = 0; i < na && s0 + i < buf.length; i++) buf[s0 + i] += (r() - 0.5) * 3 * amp * (1 - i / na);
}

function makeRoom(kind, seed, totalMs){
  const r = rnd(seed * 7919 + 13);
  const buf = new Float32Array(Math.ceil(totalMs / 1000 * SR));
  for (let i = 0; i < buf.length; i++) buf[i] = (r() - 0.5) * 0.004;
  if (kind === 'single'){
    for (let t = 0; t < totalMs; t += 150 + r() * 400)
      addPluck(buf, Math.floor(t / 1000 * SR), 40 + Math.floor(r() * 30), 0.5 * STUD * (0.6 + r() * 0.8), 0.6, r);
  } else if (kind === 'class'){
    const nb = 6 + Math.floor(r() * 5);
    for (let p = 0; p < nb; p++){
      const frac = 0.08 + r() * 0.27, tau = 0.4 + r() * 0.6;
      for (let t = r() * 1500; t < totalMs; t += 500 + r() * 1500)
        addPluck(buf, Math.floor(t / 1000 * SR), 40 + Math.floor(r() * 30), frac * STUD * (0.7 + r() * 0.6), tau, r);
    }
    // continuous din: one-pole low-passed noise, about 5% of the student's level
    let lp = 0;
    for (let i = 0; i < buf.length; i++){ lp += ((r() - 0.5) - lp) * 0.05; buf[i] += lp * STUD * 0.9; }
  }
  for (let i = 0; i < buf.length; i++) buf[i] *= GAIN;
  return buf;
}

function build(src0, over){
  let src = src0;
  for (const [k, v] of Object.entries(over || {})){
    if (k === 'IDLE') continue;
    const re = new RegExp('^const ' + k + '\\s*=\\s*[^;]+;', 'm');
    if (!re.test(src)) throw new Error('no const ' + k);
    src = src.replace(re, `const ${k} = ${v};`);
  }
  const constLine = n => { const m = src.match(new RegExp('^const ' + n + '\\s*=\\s*([^;]+);', 'm')); return m ? `const ${n} = ${m[1]};` : ''; };
  const consts = ['COACH_LVL_WIN', 'COACH_LVL_HOP', 'COACH_CATCHUP_MAX_MS', 'COACH_ATTACK_SKIP', 'COACH_ONSET_REFRACT',
    'CHK_ONSET_FLOOR', 'CHK_ONSET_RATIO', 'CHK_HF_FLOOR', 'CHK_HF_RATIO', 'COACH_STANDOUT', 'COACH_MY_FRAC',
    'COACH_MY_FRAC_TARGET', 'COACH_SURE_MINE', 'COACH_MY_HALFLIFE_MS', 'COACH_PITCH_GATE', 'COACH_PULLDOWN', 'COACH_SURE_BYPASS', 'COACH_MY_UP', 'COACH_STANDOUT_TARGET', 'COACH_TARGET_VOTES'].map(constLine).join('\n');
  const fns = ['coachReadFrame', 'coachDetectPitch', 'coachPitchReadings', 'coachSettlePitch', 'coachSmooth', 'coachMyLevelNow', 'coachOnsetTick', 'coachIdleTick']
    .filter(n => src.includes('function ' + n + '(')).map(n => extract(src, n)).join('\n');
  const body = `let micRec=null,coachHfRms=0,coachBgRms=0,coachBgPrev=0,coachOnsetAt=0,coachReadCtx=null,coachReadCtxT=0,coachYinD=null,coachSmoothA=0.18,coachMyLevel=0,coachMyLevelT=0;
  const tunerMedian=a=>{const b=[...a].sort((x,y)=>x-y);const k=b.length>>1;return b.length%2?b[k]:(b[k-1]+b[k])/2;};
  ${consts}\n${fns}
  return {read:coachReadFrame, settle:coachSettlePitch, idle:typeof coachIdleTick === 'function' ? coachIdleTick : null, GATE:COACH_PITCH_GATE, onsetAt:()=>coachOnsetAt};`;
  return new Function('coachAnalyser', 'coachCtx', 'coachFrameBuf', 'coachUpdateMicLevel', 'performance', body);
}

function runGame(factory, room, { student, prompts, seed, fps, IDLE }){
  const r = rnd(seed);
  let vnow = 1000;
  const plucks = [];                     // the student's: { s0 (sample), midi, amp }
  const buf = new Float32Array(4096);
  const ctx = { sampleRate: SR, get currentTime(){ return vnow / 1000; } };
  const an = { getFloatTimeDomainData(b){
    const endS = Math.floor((vnow - LAT) / 1000 * SR), s0 = endS - b.length;
    for (let i = 0; i < b.length; i++) b[i] = room[s0 + i] || 0;
    for (const p of plucks){
      if (p.s0 >= endS || p.end <= s0) continue;
      const from = Math.max(p.s0, s0);
      for (let s = from; s < endS && s < p.end; s++) b[s - s0] += p.wave[s - p.s0];
    }
  } };
  const waveCache = new Map();
  function pluckAt(tMs, midi, amp){
    const key = midi + ':' + amp.toFixed(3);
    let wave = waveCache.get(key);
    if (!wave){ wave = new Float32Array(Math.floor(2.4 * SR)); addPluck(wave, 0, midi, amp * GAIN, 0.8, rnd(midi)); waveCache.set(key, wave); }
    const s0 = Math.floor(tMs / 1000 * SR);
    plucks.push({ s0, end: s0 + wave.length, wave });
    while (plucks.length > 6) plucks.shift();
  }
  const F = factory(an, ctx, buf, () => {}, { now: () => vnow });
  const g = { readings: [], attackT: 0, lastPitchT: 0, needSilence: false, cooldownUntil: 0 };
  const out = { n: 0, right1: 0, wrong1: 0, none: 0, everRight: 0, early: 0, lateOnset: 0, inPluck: 0 };
  let target = 0, studentT = 0, tries = 0, idx = 0, played = false, nextAt = 0;
  // mixed: every third prompt is played a whole step off; only those are counted
  const isWrong = i => student === 'wrong' || (student === 'mixed' && i % 3 === 2);
  const ampFor = i => student === 'soft' ? (i < 6 ? 2 : 0.5) : student === 'softonly' ? 0.5 : 1;
  function newPrompt(){
    target = TARGETS[Math.floor(r() * TARGETS.length)];
    studentT = vnow + 1000 + r() * 1000; tries = 0; played = false;
  }
  newPrompt();
  const counts = i => student === 'soft' ? i >= 6 : student === 'mixed' ? isWrong(i) : true;
  function endPrompt(kind){
    if (counts(idx)){
      out.n++;
      if (kind === 'right' && tries === 0) out.right1++;
      if (kind === 'right') out.everRight++;
      if (kind === 'none' && tries === 0) out.none++;
    }
    idx++;
    nextAt = kind === 'right' ? vnow + 900 : vnow;
  }
  while (idx < prompts){
    vnow += 1000 / fps * (0.7 + r() * 0.6);
    if (nextAt){ if (vnow < nextAt){ F.read(); continue; } nextAt = 0; newPrompt(); }
    if (!played && vnow >= studentT){
      played = true;
      pluckAt(studentT, target + (isWrong(idx) ? 2 : 0), STUD * ampFor(idx) * (0.75 + r() * 0.5));
    }
    const rms = F.read(), now = vnow;
    if (g.needSilence && (rms < F.GATE * 0.7 || now > g.cooldownUntil + 1800)) g.needSilence = false;
    const listen = !g.needSilence && now >= g.cooldownUntil && rms > F.GATE;
    if (!listen && IDLE && F.idle) F.idle(g, rms, g.cooldownUntil);
    if (listen){
      if (!g.attackT) g.attackT = Math.max(F.onsetAt(), g.cooldownUntil);
      const m = F.settle(g, [target], rms, g.cooldownUntil);
      const atk = g.attackT;
      if (m != null){
        g.readings = []; g.attackT = 0; g.needSilence = true; g.cooldownUntil = now + 700;
        if (m === target){
          if (!played && counts(idx)) out.early++;
          else if (counts(idx) && isWrong(idx)) { if (atk > studentT + LAT + 120) out.lateOnset++; else out.inPluck++; }
          endPrompt('right'); continue;
        }
        if (tries === 0 && counts(idx)) out.wrong1++;
        tries++;
      }
    } else if (rms < F.GATE * 0.5){ g.readings = []; g.attackT = 0; }
    if (now > studentT + 3000){ endPrompt('none'); }
  }
  return out;
}

const ROOMS = ['quiet', 'single', 'class'];
const STUDENTS = ['right', 'wrong', 'mixed', 'soft', 'softonly'];

if (isMainThread){
  const [file, cellsJson, promptsArg, fpsArg] = process.argv.slice(2);
  const cells = JSON.parse(cellsJson || '{"current":{}}');
  const prompts = +promptsArg || 120, fps = +fpsArg || 20;
  const SEEDS = [1, 2, 3, 4];
  const jobs = [];
  for (const room of ROOMS) for (const seed of SEEDS) jobs.push({ room, seed });
  const results = {};                    // cell -> room -> student -> totals
  let next = 0, live = 0;
  await new Promise(done => {
    const spawn = () => {
      if (next >= jobs.length){ if (!live) done(); return; }
      const job = jobs[next++]; live++;
      const w = new Worker(new URL(import.meta.url), { workerData: { file, cells, prompts: Math.ceil(prompts / SEEDS.length), fps, ...job } });
      w.on('message', m => {
        for (const [cell, byStu] of Object.entries(m)){
          results[cell] ??= {}; results[cell][job.room] ??= {};
          for (const [stu, o] of Object.entries(byStu)){
            const t = results[cell][job.room][stu] ??= { n: 0, right1: 0, wrong1: 0, none: 0, everRight: 0, early: 0, lateOnset: 0, inPluck: 0 };
            for (const k in o) t[k] += o[k];
          }
        }
      });
      w.on('error', e => { console.error(e); process.exit(1); });
      w.on('exit', () => { live--; spawn(); });
    };
    for (let i = 0; i < 4; i++) spawn();
  });
  const pc = (a, b) => b ? (100 * a / b).toFixed(0).padStart(5) : '    -';
  console.log(`prompts/cell/room/student ≈ ${prompts}, fps ${fps}`);
  console.log('R1 = right notes counted first time · fW = false "wrong" hint on a right note · wR = wrong note counted right (first-ever note / mixed in with right ones) · wC = wrong note caught · soft = soft after loud / soft all along');
  console.log('cell'.padEnd(24) + ROOMS.map(rm => `| ${rm.padEnd(6)}  R1   fW  wR1 wRmx   wC soft sOnly`).join(' '));
  for (const [cell, byRoom] of Object.entries(results)){
    let line = cell.padEnd(24);
    for (const rm of ROOMS){
      const B = byRoom[rm], R = B.right, W = B.wrong, M = B.mixed, S = B.soft, O = B.softonly;
      line += `|       ${pc(R.right1, R.n)}${pc(R.wrong1, R.n)}${pc(W.everRight, W.n)}${pc(M.everRight, M.n)}${pc(W.wrong1, W.n)}${pc(S.right1, S.n)}${pc(O.right1, O.n)} `;
    }
    console.log(line);
    if (process.env.DIAG) for (const rm of ROOMS) console.log('   ', rm, JSON.stringify(byRoom[rm]));
  }
} else {
  const { file, cells, prompts, fps, room, seed } = workerData;
  const src = fs.readFileSync(file, 'utf8');
  const roomBuf = makeRoom(room, seed, prompts * 6000 + 20000);
  const res = {};
  for (const [cell, over] of Object.entries(cells)){
    const factory = build(src, over);
    res[cell] = {};
    for (const student of STUDENTS) res[cell][student] = runGame(factory, roomBuf, { student, prompts, seed: seed * 101 + STUDENTS.indexOf(student), fps, IDLE: over.IDLE !== 0 });
  }
  parentPort.postMessage(res);
}
