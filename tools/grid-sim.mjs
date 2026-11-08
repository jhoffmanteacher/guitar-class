/* Grid step cap simulation (2026-11-07) — the evidence for coach.js CC_GRID_STEP_CAP_MS.
     node tools/grid-sim.mjs [caps, comma list, default 40,50,60,80,100]      (env SEEDS=20 by default 8)
   Runs the REAL ccLoop (coach.js, with app.js and the other scripts, in a vm) on scripted frames, once with the old uncapped rule
   (cc.gridOffset += dev * 0.25) and once per candidate cap, and compares the grading:
     Part 1  one stray sound half a beat off the grid: how far the grid moves, per tempo;
     Part 2  scripted games, Power Chord Switch 10-140 BPM and Change Up 40-140, every beat and every bar, 15 kinds of player (on time,
             loose, late, early, rushing, dragging, with and without stray sounds); "right" is the true answer (the student plays the
             right chord on the beat); counts changes that turned wrong or right, at 30 BPM and above and below it;
     Part 3  does the grid still follow a player who is really late or drifting.
   "Newly wrong" = graded right by the old rule, not right by the capped one; "newly right" = the reverse (a wrong chord or a miss that is now right).
   Not part of tools/checks.mjs (minutes, not seconds); checks.mjs 1ck pins the chosen number and runs the real ccLoop on a few frames.
   The old rule is made by rewriting the capped line in a copy of coach.js in memory; nothing on disk changes. */
import vm from 'node:vm';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CAPS = (process.argv[2] || '40,50,60,80,100').split(',').map(Number);
const MODULE_FILES = readdirSync(ROOT).filter(f => /^module-\d+\.js$/.test(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const FILES = ['i18n.js', 'guitar-diagrams.js', 'class-activities.js', 'config-main.js', ...MODULE_FILES, 'app.js', 'fab-tools.js', 'tuner.js', 'coach.js'];
const CAPPED_LINE = 'cc.gridOffset += Math.max(-CC_GRID_STEP_CAP_MS, Math.min(CC_GRID_STEP_CAP_MS, dev * 0.25));';
const CAP_CONST = /^const CC_GRID_STEP_CAP_MS = \d+;/m;

function makeCtx(coachTransform) {
  const bodies = {};
  const el = id => ({
    id, style: { setProperty(){}, removeProperty(){}, getPropertyValue(){ return ''; } }, dataset: {}, children: [], _h: '',
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    get innerHTML(){ return this._h; }, set innerHTML(v){ this._h = v; if (id) bodies[id] = v; },
    textContent: '', value: '', hidden: false, checked: false, isConnected: true,
    addEventListener(){}, removeEventListener(){}, appendChild(){}, removeChild(){}, remove(){},
    setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){}, hasAttribute(){ return false; },
    querySelector(){ return null; }, querySelectorAll(){ return []; }, closest(){ return null; },
    focus(){}, blur(){}, click(){}, scrollIntoView(){}, insertAdjacentHTML(){}, insertAdjacentElement(){},
    cloneNode(){ return el(''); }, contains(){ return false; },
    getBoundingClientRect(){ return { top:0, left:0, width:0, height:0, bottom:0, right:0 }; },
  });
  const els = {};
  const storage = () => ({ _d:{}, getItem(k){ return this._d[k] ?? null; }, setItem(k,v){ this._d[k]=String(v); }, removeItem(k){ delete this._d[k]; }, clear(){ this._d={}; } });
  const param = () => ({ value: 1, setValueAtTime(){}, setTargetAtTime(){}, cancelScheduledValues(){}, linearRampToValueAtTime(){}, exponentialRampToValueAtTime(){} });
  const actx = {
    currentTime: 0, state: 'running', resume(){ return Promise.resolve(); }, destination: {}, sampleRate: 44100,
    createOscillator(){ return { connect(){}, start(){}, stop(){}, frequency: param() }; },
    createGain(){ return { connect(){}, disconnect(){}, context: actx, gain: param() }; },
    createBufferSource(){ return { connect(){}, playbackRate: param(), start(){}, stop(){} }; },
    createBuffer(){ return { getChannelData(){ return new Float32Array(16); } }; },
    createDynamicsCompressor(){ return { connect(){}, threshold: param(), knee: param(), ratio: param(), attack: param(), release: param() }; },
    close(){},
  };
  const ctx = {
    console: { log(){}, warn(){}, error(){}, info(){} },
    document: { documentElement: el(''), head: el(''), body: el(''), getElementById(id){ return els[id] || (els[id] = el(id)); },
      querySelector(){ return null; }, querySelectorAll(){ return []; }, createElement(){ return el(''); }, createDocumentFragment(){ return el(''); },
      addEventListener(){}, removeEventListener(){}, fonts: { ready: Promise.resolve() }, hidden: false, visibilityState: 'visible' },
    localStorage: storage(), sessionStorage: storage(),
    location: { hostname:'localhost', href:'http://localhost/', pathname:'/', search:'', hash:'', reload(){} },
    history: { scrollRestoration:'auto', replaceState(){}, pushState(){} },
    navigator: { userAgent:'node', platform:'node', language:'en', onLine:true },
    setTimeout: () => 0, clearTimeout(){}, setInterval: () => 0, clearInterval(){},
    requestAnimationFrame: () => 0, cancelAnimationFrame(){},
    matchMedia: () => ({ matches:false, addEventListener(){}, addListener(){} }),
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    fetch: () => Promise.reject(new Error('no network')),
    CustomEvent: class { constructor(t, o){ this.type = t; Object.assign(this, o || {}); } },
    Image: class {}, Audio: class { play(){ return Promise.resolve(); } pause(){} },
    AudioContext: class { constructor(){ return actx; } },
    performance: { now: () => 0 }, URLSearchParams, URL, TextEncoder, TextDecoder,
    addEventListener(){}, removeEventListener(){}, dispatchEvent(){}, scrollTo(){}, innerWidth: 1366, innerHeight: 657, devicePixelRatio: 1,
  };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  for (const f of FILES) {
    let src = readFileSync(join(ROOT, f), 'utf8');
    if (f === 'coach.js') src = coachTransform(src);
    vm.runInContext(src, ctx, { filename: f });
  }
  const run = code => vm.runInContext(code, ctx);
  run(`globalThis.__sim = function(mode, bpm, rateIdx, onsets, frameMs, lat){
    const kept = { cc: coachCountIn, loop: ccLoop };
    coachCountIn = (st) => { st.listenStart = 0; };
    const realLoop = ccLoop;
    ccLoop = () => {};
    setLang('en'); ccSetup(mode); ccPickRate(rateIdx); ccPickProg(1); cc.bpm = bpm; ccPrepare(false);
    coachAnalyser = {}; coachHfRms = 0.0004;
    ccBeginStage();
    ccLoop = realLoop;
    cc.phase = 'play'; cc.smoothRms = 0.01; cc.smoothHf = 0.0004; cc.lastOnsetT = -1e9; cc.listenStart = 0; cc.gridOffset = 0; cc.lastBeat = -1;
    const end = (cc.slots * cc.bpc + 1) * cc.beatMs;
    let cur = null;
    coachPitchReadings = (sinceT, minEndT, clarity) => {
      if (!cur || !cur.chord || sinceT >= minEndT + 50) return [];
      const cls = cc.classes[cur.chord];
      return Array.from({ length: 6 }, (_, i) => ({ t: minEndT + 5 * i, midi: 48 + cls[i % cls.length] }));
    };
    let maxAbs = 0, idx = 0;
    const AMP = 0.08, TAU = 120;
    for (let now = 0; now <= end; now += frameMs){
      performance.now = () => now;
      while (idx < onsets.length && onsets[idx].arr <= now){ cur = onsets[idx]; idx++; }
      let rms = 0.01;
      for (let k = idx - 1; k >= 0 && k >= idx - 3; k--) rms += AMP * Math.exp(-(now - onsets[k].arr) / TAU);
      coachReadFrame = () => rms;
      coachOnsetAt = cur ? cur.arr : 0;
      realLoop();
      if (Math.abs(cc.gridOffset) > maxAbs) maxAbs = Math.abs(cc.gridOffset);
    }
    cc.changes.forEach(c => { if (c.pend) ccResolvePend(c); if (c.result === null) c.result = 'miss'; });
    const out = { res: cc.changes.map(c => c.result === 'ok' ? '+' : c.result === 'off' ? 'x' : 'm').join(''), maxAbs, finalOff: cc.gridOffset };
    ccStop(); cc = null;
    coachCountIn = kept.cc;
    return JSON.stringify(out);
  };`);
  return { run };
}

// seeded PRNG
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function gauss(r) { let u = 0, v = 0; while (!u) u = r(); v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

const LAT = 50;
const RATES = [{ idx: 2, name: 'beat', bpc: 1, slots: 16 }, { idx: 0, name: 'bar', bpc: 4, slots: 8 }];
// scenario builders -> list of onsets {arr, chord}
function strumsFor(rate, bpm, opt, seed) {
  const r = rng(seed), beatMs = 60000 / bpm, n = rate.slots * rate.bpc;
  const seqPair = ['A', 'B'];
  const out = [];
  for (let b = 0; b < n; b++) {
    let t = b * beatMs * (1 + (opt.drift || 0)) + (opt.late || 0) + (opt.lateBeats || 0) * beatMs + gauss(r) * ((opt.sigma || 0) + (opt.sigmaBeats || 0) * beatMs);
    // keep a strum at most opt.clip (default 0.45) beat from its beat (a student who is further off is playing another beat)
    const lim = (opt.clip || 0.45) * beatMs; const dev = t - b * beatMs; if (Math.abs(dev) > lim && !opt.noClip) t = b * beatMs + Math.sign(dev) * lim;
    out.push({ tp: t, chordIdx: Math.floor(b / rate.bpc) });
  }
  return { out, r, beatMs, n };
}
const SCEN = [
  { name: 'on time (sd 30)', mk: (rate, bpm, s) => strumsFor(rate, bpm, { sigma: 30 }, s) },
  { name: 'loose (sd 90)', mk: (rate, bpm, s) => strumsFor(rate, bpm, { sigma: 90 }, s) },
  { name: 'late +80', mk: (rate, bpm, s) => strumsFor(rate, bpm, { sigma: 30, late: 80 }, s) },
  { name: 'late +150', mk: (rate, bpm, s) => strumsFor(rate, bpm, { sigma: 40, late: 150 }, s) },
  { name: 'early -150', mk: (rate, bpm, s) => strumsFor(rate, bpm, { sigma: 40, late: -150 }, s) },
  { name: 'late +250', mk: (rate, bpm, s) => strumsFor(rate, bpm, { sigma: 40, late: 250 }, s) },
  { name: 'rushing 1.5%', mk: (rate, bpm, s) => strumsFor(rate, bpm, { sigma: 30, drift: -0.015 }, s) },
  { name: 'dragging 1.5%', mk: (rate, bpm, s) => strumsFor(rate, bpm, { sigma: 30, drift: 0.015 }, s) },
  { name: 'late 0.35 beat, sd 0.06 beat', mk: (rate, bpm, s) => strumsFor(rate, bpm, { lateBeats: 0.35, sigmaBeats: 0.06 }, s) },
  { name: 'early 0.35 beat, sd 0.06 beat', mk: (rate, bpm, s) => strumsFor(rate, bpm, { lateBeats: -0.35, sigmaBeats: 0.06 }, s) },
  { name: 'late 0.35 beat + 3 strays', stray: 3, mk: (rate, bpm, s) => strumsFor(rate, bpm, { lateBeats: 0.35, sigmaBeats: 0.06 }, s) },
  { name: 'early 0.35 beat + 3 strays', stray: 3, mk: (rate, bpm, s) => strumsFor(rate, bpm, { lateBeats: -0.35, sigmaBeats: 0.06 }, s) },
  { name: 'loose (sd 0.15 beat) + 3 strays', stray: 3, mk: (rate, bpm, s) => strumsFor(rate, bpm, { sigmaBeats: 0.15 }, s) },
  { name: 'late 0.40 beat, sd 0.05 (near half, clip .49)', mk: (rate, bpm, s) => strumsFor(rate, bpm, { lateBeats: 0.40, sigmaBeats: 0.05, clip: 0.49 }, s) },
  { name: 'early 0.40 beat, sd 0.05 (near half, clip .49)', mk: (rate, bpm, s) => strumsFor(rate, bpm, { lateBeats: -0.40, sigmaBeats: 0.05, clip: 0.49 }, s) },
  { name: 'late 0.30 beat, sd 0.08 + 3 strays (clip .49)', stray: 3, mk: (rate, bpm, s) => strumsFor(rate, bpm, { lateBeats: 0.30, sigmaBeats: 0.08, clip: 0.49 }, s) },
  { name: 'loose sd 0.20 beat (clip .49)', mk: (rate, bpm, s) => strumsFor(rate, bpm, { sigmaBeats: 0.20, clip: 0.49 }, s) },
  { name: 'on time + 3 strays', stray: 3, mk: (rate, bpm, s) => strumsFor(rate, bpm, { sigma: 30 }, s) },
  { name: 'loose + 3 strays', stray: 3, mk: (rate, bpm, s) => strumsFor(rate, bpm, { sigma: 90 }, s) },
];
const SEEDS = Number(process.env.SEEDS || 8);
const FRAME = 33.3;

function buildOnsets(scen, rate, bpm, seed) {
  const { out, r, beatMs, n } = scen.mk(rate, bpm, seed);
  const onsets = out.map(o => ({ arr: o.tp + LAT, chord: 'C' + o.chordIdx }));
  if (scen.stray) {
    const end = (n + 1) * beatMs;
    for (let k = 0; k < scen.stray; k++) {
      for (let tries = 0; tries < 50; tries++) {
        const t = r() * (end - 300) + 100;
        if (onsets.every(o => Math.abs(o.arr - LAT - t) > 200)) { onsets.push({ arr: t + LAT, chord: null }); break; }
      }
    }
  }
  onsets.sort((a, b) => a.arr - b.arr);
  return onsets;
}

// the student plays chord X on even change slots and Y on odd: resolve chord names per run through cc.classes keys
const seqCache = {};
function withChords(run, mode, rate, onsets) {
  const key = mode + rate.idx;
  if (!seqCache[key]) seqCache[key] = JSON.parse(run(`(function(){ setLang('en'); ccSetup(${JSON.stringify(mode)}); ccPickRate(${rate.idx}); ccPickProg(1); ccPrepare(false); const p = cc.seq.slice(); cc = null; return JSON.stringify(p); })()`));
  const seq = seqCache[key];
  return onsets.map(o => o.chord ? { ...o, chord: seq[Math.min(Number(o.chord.slice(1)), seq.length - 1)] } : o);
}

const mode = process.env.MODE || 'compare';
const oldC = makeCtx(s => { if (!s.includes(CAPPED_LINE)) throw new Error('coach.js no longer has the capped grid line'); return s.replace(CAPPED_LINE, 'cc.gridOffset += dev * 0.25;'); });
const newCs = CAPS.map(c => ({ cap: c, ctx: makeCtx(s => { if (!CAP_CONST.test(s)) throw new Error('coach.js has no CC_GRID_STEP_CAP_MS'); return s.replace(CAP_CONST, `const CC_GRID_STEP_CAP_MS = ${c};`); }) }));
const TEMPOS = []; for (let b = 10; b <= 140; b += 5) TEMPOS.push(b);

function sim(ctxObj, bpm, rate, onsets, mode = 'power') {
  return JSON.parse(ctxObj.run(`__sim(${JSON.stringify(mode)}, ${bpm}, ${rate.idx}, ${JSON.stringify(onsets)}, ${FRAME}, ${LAT})`));
}

// ---- Part 1: one stray sound alone: how far does the grid move? ----
console.log('PART 1: one stray sound, worst phase (half a beat off the grid); grid move in ms');
console.log('bpm  old    ' + CAPS.map(c => 'cap' + c).join('  '));
for (const bpm of [10, 15, 20, 30, 40, 60, 90, 120, 140]) {
  const rate = RATES[0], beatMs = 60000 / bpm;
  const onsets = [{ arr: 0.499 * beatMs + 10 * beatMs * 0 + LAT + 3 * beatMs, chord: null }];
  const o = sim(oldC, bpm, rate, onsets).maxAbs;
  console.log(String(bpm).padStart(3), String(Math.round(o)).padStart(5), '  ' + newCs.map(c => String(Math.round(sim(c.ctx, bpm, rate, onsets).maxAbs)).padStart(4)).join('   '));
}

// ---- Part 2: old vs capped grading on scripted games ----
const stats = {}; // cap -> {runs, diffRuns, diffChanges, ge30Runs, ge30DiffRuns, ge30DiffChanges, lt30..., byScen}
for (const c of newCs) stats[c.cap] = { runs: 0, diffRuns: 0, diffChanges: 0, ge30Runs: 0, ge30DiffRuns: 0, ge30DiffChanges: 0, lt30Runs: 0, lt30DiffRuns: 0, lt30DiffChanges: 0, detail: [] };
let baselineChanges = 0, oldOk = 0, oldMiss = 0;
const MODES = [{ mode: 'power', tempos: TEMPOS }, { mode: 'open', tempos: TEMPOS.filter(b => b >= 40) }];
let games = 0;
for (const M of MODES) for (const bpm of M.tempos) for (const rate of RATES) for (const scen of SCEN) for (let sd = 1; sd <= SEEDS; sd++) {
  const onsets = withChords(oldC.run, M.mode, rate, buildOnsets(scen, rate, bpm, sd * 7919 + bpm));
  const o = sim(oldC, bpm, rate, onsets, M.mode); games++;
  baselineChanges += o.res.length;
  oldOk += (o.res.match(/[+x]/g) || []).length; oldMiss += (o.res.match(/m/g) || []).length;
  for (const c of newCs) {
    const n = sim(c.ctx, bpm, rate, onsets, M.mode);
    const st = stats[c.cap]; let d = 0, reg = 0, imp = 0;
    for (let i = 0; i < o.res.length; i++) if (o.res[i] !== n.res[i]) { d++; if (o.res[i] === '+' && n.res[i] !== '+') reg++; else if (o.res[i] !== '+' && n.res[i] === '+') imp++; }
    if (bpm >= 30 && reg) { st.byScen = st.byScen || {}; const k = scen.name; st.byScen[k] = (st.byScen[k] || 0) + reg; }
    if (bpm < 30) { st.lt30reg = (st.lt30reg || 0) + reg; st.lt30imp = (st.lt30imp || 0) + imp; }
    if (bpm >= 30) { st.reg = (st.reg || 0) + reg; st.imp = (st.imp || 0) + imp; st.other = (st.other || 0) + (d - reg - imp); }
    st.runs++; if (d) { st.diffRuns++; st.diffChanges += d; }
    if (bpm >= 30) { st.ge30Runs++; if (d) { st.ge30DiffRuns++; st.ge30DiffChanges += d; st.detail.push(`${M.mode === 'power' ? 'Power Chord Switch' : 'Change Up'} ${bpm} BPM ${rate.name} "${scen.name}" seed ${sd}: ${d} change(s) differ (old ${o.res} new ${n.res})`); } }
    else { st.lt30Runs++; if (d) { st.lt30DiffRuns++; st.lt30DiffChanges += d; st.lt30Detail = (st.lt30Detail || []); st.lt30Detail.push(`${bpm} BPM ${rate.name} "${scen.name}" seed ${sd}: ${d}`); } }
  }
}
console.log(`\nPART 2: ${games} scripted games per version (Power Chord Switch 10-140 BPM and Change Up 40-140 BPM, ${RATES.length} speeds, ${SCEN.length} scenarios, ${SEEDS} seeds each ; ${baselineChanges} graded changes in the old run; old: ${oldOk} right, ${oldMiss} missed)`);
for (const c of newCs) {
  const s = stats[c.cap];
  console.log(`cap ${c.cap} ms: >=30 BPM ${s.ge30DiffChanges} changes differ in ${s.ge30DiffRuns} of ${s.ge30Runs} games (${s.reg || 0} newly wrong, ${s.imp || 0} newly right, ${s.other || 0} wrong either way but differently) | <30 BPM ${s.lt30DiffChanges} changes differ in ${s.lt30DiffRuns} of ${s.lt30Runs} games (${s.lt30reg || 0} newly wrong, ${s.lt30imp || 0} newly right)`);
}
for (const c of newCs) { const s = stats[c.cap]; console.log(`cap ${c.cap}: newly wrong (>=30 BPM) by scenario: ` + JSON.stringify(s.byScen || {})); }
for (const c of newCs) { const s = stats[c.cap]; if (s.lt30Detail && s.lt30Detail.length) { console.log(`\nBelow 30 BPM, cap ${c.cap} (first 8):`); s.lt30Detail.slice(0, 8).forEach(x => console.log('  ' + x)); } }
for (const c of newCs) { const s = stats[c.cap]; if (s.detail.length) { console.log(`\nDetail, cap ${c.cap} (first 12):`); s.detail.slice(0, 12).forEach(x => console.log('  ' + x)); } }

// ---- Part 3: does the grid still follow a student who is really late or drifting? mean final grid offset (ms), Power Chord Switch, every beat ----
console.log('\nPART 3: mean grid offset at the end of a game (ms). A student 250 ms late should pull the grid toward +250; 1.5% drift is +/-0.015 x the game length');
const P3 = SCEN.filter(x => ['late +150', 'late +250', 'rushing 1.5%', 'dragging 1.5%'].includes(x.name));
for (const scen of P3) for (const bpm of [20, 30, 60, 100, 140]) {
  const row = [];
  const ctxs = [{ name: 'old', c: oldC }, ...newCs.map(c => ({ name: 'cap' + c.cap, c: c.ctx }))];
  const sums = ctxs.map(() => 0);
  for (let sd = 1; sd <= 6; sd++) {
    const onsets = withChords(oldC.run, 'power', RATES[0], buildOnsets(scen, RATES[0], bpm, sd * 31 + bpm));
    ctxs.forEach((x, i) => { sums[i] += sim(x.c, bpm, RATES[0], onsets).finalOff / 6; });
  }
  console.log(`${scen.name.padEnd(14)} ${String(bpm).padStart(3)} BPM  ` + ctxs.map((x, i) => `${x.name} ${Math.round(sums[i])}`).join('  '));
}
