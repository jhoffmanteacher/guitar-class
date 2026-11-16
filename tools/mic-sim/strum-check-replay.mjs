/* Real strum-pattern-check takes (ca-52), replayed through the REAL check (2026-11-14; Jonathan's own takes from local recording mode,
   J01.. in `Claude outputs/takes-anon/`, local-takes-in.mjs). A sibling of replay-listen.mjs; measure-only, changes no site code.

     node tools/mic-sim/strum-check-replay.mjs <J01.json> [<J02.json> ...] [--key=<file>] [--diag] [--dot] [--sweep [--cands=<json>]
                                               [--no-bench]] [--splice [--splice-offs=0,-40,40]] [--copy=<json>] [--shifts=J01:-117.5,..]
                                               [--json=<file>]

   THE REPLAY: the take's .wav goes back through the site's mic chain (replay-takes.mjs prepare) into the bench page (listen-site.mjs
   benchSite, strum-check-loop.mjs SC_VM: coachOpen on ca-52's real button, scStart, the count-in, scLoop with srHearStrum, scOnset, the
   sweep, the chord readings and rules a / b / c, scFinish), at the take's own tempo, mic-delay setting and mean frame time. The take's
   times are ms from the recording's first sample (micRecSaveNow), so the site's clock is set to run (replay listenStart - the take's
   listenStart) ahead of the recording: beat 1 lands where it did live. The grid then eases from there as it did live.
   THE CLOCK (measured 2026-11-14 on Jonathan's three takes): the saved times sit one ScriptProcessor buffer off the audio (every replayed
   onset ~93-103 ms after the live one: 4096 samples at 44.1 kHz, micRecStartPerf's estimate), so the clock is FITTED on the onsets
   (median gap of paired live / replayed onsets), then scanned +-40 ms in 5 ms steps for the clock that reproduces the most live slot
   verdicts; every step's count is printed. The scan is the finding as much as the fit: the eased grid can land a whole slot apart
   across 20 ms (J02: 9 of 17 clocks a slot off, J03: 4 of 17), so a replay reproduces a take only near its own clock.
   --dot: the Metronome on (no headphones) and each beat the page draws (scBeat; scBeatTick on a site from before 2026-11-14) timed
   against the click grid and the eased grid.
   REPRODUCED: per slot (64) and per chord (8), the replay's verdict against the one the take saved. --diag: what the detector saw at
   every slot the take got wrong (the frames within the window: level / smoothed level, HF / smoothed HF, the time since the onset
   before, which test failed) and the readings of every chord.
   THE KEY (--key, JSON: { "J01": { "chords": { "4": "wrong" }, "skipBars": [] }, ... }, bars counted from 1): what Jonathan says he
   played. Every strum slot played and every rest quiet unless the key says so; skipBars = bars whose timing he called off (left out of
   the strum counts).
   --sweep: the same takes under other settings, through a copy of srHearStrum put in the page (HOOK below: the site's function line
   for line with its numbers and its grid rule made settable; the default settings must reproduce the real function exactly, and the run
   stops if they do not), beside the synthetic bench's students (strum-check-loop.mjs) under the same settings; each take at its kept
   clock and +-20 ms. --cands=<json>: only the settings listed ([{ name, ratio, hfRatio, refract, rule, ease, cap, within, outPen,
   dupOnce, lock, which }]), each printed per take and clock beside today's (the copy at SITE_P); --no-bench leaves the bench out.
   Review R4-1's candidates (2026-11-16): A {"outPen":-1.5}, C {"outPen":-1.5,"dupOnce":true}, D {"lock":0.25}, AD both.
   --copy=<json>: the settings the identity test gives the copy, for a tree with a candidate planted in coach-strumcheck.js.
   --splice: one of the take's own strums pasted into a rest (the block above `--gate` says how); caught / bar passed per candidate.
   The results of 2026-11-14 are in `Claude outputs/strum-coach/DETAILS.md` section 20. Not in checks.mjs. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, basename, dirname, join } from 'node:path';
import { benchSite, takeSource } from './listen-site.mjs';
import { readWav, prepare } from './replay-takes.mjs';
import { SC_VM, oneTake, seedOf } from './strum-check-loop.mjs';

/* srHearStrum (coach-strum.js) with its numbers settable: ratio / hfRatio (the check's own, s.onsetRatio / s.hfRatio), refract
   (COACH_ONSET_REFRACT), ease / within (SR_GRID_EASE / SR_GRID_EASE_WITHIN) and the grid rule:
     base       the site's: every onset within `within` of an eighth eases the grid by `ease` of its deviation
     strumOnly  only an onset nearest a strum slot of the pattern eases it (a rest's sound never moves the grid)
     anchor1    only an onset nearest a "1" (slot 0) eases it
     barEnd     no easing inside a bar: the strum-slot deviations of a bar are averaged and applied (times `ease`) at the first onset of
                a later bar
     none       the grid never moves (the click's grid, plus the mic-delay setting) */
const HOOK = `(() => {
  if (globalThis.__scHook) return;
  /* the check's detector: scHearStrum (its own, with the pattern-shape grid) since 2026-11-14; srHearStrum before */
  const NAME = typeof scHearStrum === 'function' ? 'scHearStrum' : 'srHearStrum', real = globalThis[NAME];
  const H = globalThis.__scHook = { on: false, p: null, diag: null, real, name: NAME };
  globalThis[NAME] = function(s, rms, hf){
    const pre = H.diag ? { at: coachOnsetAt, rms, hf, sR: s.smoothRms, sH: s.smoothHf, last: s.lastOnsetT, g: s.gridOffset, ls: s.listenStart, lat: s.lat, slotMs: s.slotMs } : null;
    let r;
    if (!H.on) r = real(s, rms, hf);
    else {
      const p = H.p;
      const ratio = p.ratio, hfRatio = p.hfRatio;
      if (!((rms > CHK_ONSET_FLOOR && rms > s.smoothRms * ratio || hf > CHK_HF_FLOOR && hf > s.smoothHf * hfRatio) && coachOnsetAt - s.lastOnsetT > p.refract)) r = null;
      else {
        s.lastOnsetT = coachOnsetAt;
        const rel = coachOnsetAt - s.listenStart - s.gridOffset - s.lat;
        const slotIdx = Math.round(rel / s.slotMs), dev = rel - slotIdx * s.slotMs, inWin = Math.abs(dev) < s.slotMs * p.within;
        const sl = ((slotIdx % 8) + 8) % 8, isStrum = s.slotsOf ? !!(s.slotsOf[sl] && s.slotsOf[sl].strum) : true;
        if (p.rule === 'base'){ if (inWin) s.gridOffset += dev * p.ease; }
        else if (p.rule === 'strumOnly'){ if (inWin && isStrum) s.gridOffset += dev * p.ease; }
        else if (p.rule === 'anchor1'){ if (inWin && sl === 0) s.gridOffset += dev * p.ease; }
        else if (p.rule === 'cap'){ if (inWin) s.gridOffset += dev * p.ease; const c = p.cap * s.slotMs; s.gridOffset = Math.max(-c, Math.min(c, s.gridOffset)); }
        else if (p.rule === 'beatsDown'){ if (inWin && isStrum && sl % 2 === 0) s.gridOffset += dev * p.ease; }
        else if (p.rule === 'shape' || p.rule === 'shapeFree'){
          /* the pattern's own shape: over the onsets of the last bar (this one included), the offset that best fits D.DU.UDU
             (+1 an onset inside the window of a strum place, -1.5 of a rest), searched in 5 ms steps from the grid of the moment
             outward (it first, so a tie keeps it): over +-half a slot around the click grid ('shape'), or +-p.range (default 1)
             eighths around the grid of the moment ('shapeFree'), and when a full bar fits badly (p.wideMin+ onsets scoring under
             their count less p.wideSlack) again over +-p.wide eighths. The grid moves ease of the way there. As coach-strumcheck.js
             scAnchor since 2026-11-14 (review R1-1 / R1-6) with p.wide 4, p.wideMin 5, p.wideSlack 1.5. */
          s.__on = s.__on || []; s.__on.push(coachOnsetAt);
          const span = 8 * s.slotMs, recent = s.__on.filter(t => coachOnsetAt - t < span);
          const lim = (p.wide || 1e9) * s.slotMs;
          /* review R4-1's candidates (2026-11-16; all off by default = the site's code):
               outPen  an onset outside every window scores this (candidate A: -1.5, as on a rest; today it scores nothing)
               dupOnce a second onset in the same eighth scores as a rest (candidate C, with A)
               lock    when the onsets before this one (4 or more) all fit the grid of the moment, search only +-lock eighths
                       (candidate D: 0.25; AD = A and D) */
          const search = (c0, R, keepNear, centred, list) => {
            const n = Math.ceil(R / 5); let best = keepNear, bestSc = -1e9, bestOff = 1e9, bestN = 0;
            for (let i = 0; i <= 2 * n; i++){
              const o = c0 + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * 5;
              if (p.rule === 'shapeFree' && Math.abs(o) > lim + 1e-9 && o !== c0) continue;
              let sc0 = 0, off = 0, nIn = 0; const seen = p.dupOnce ? new Set() : null;
              for (const t of list || recent){
                const q = t - s.listenStart - o - s.lat, k = Math.round(q / s.slotMs), d = q - k * s.slotMs;
                if (Math.abs(d) > s.win){ if (p.outPen != null) sc0 += p.outPen; continue; }
                const ks = ((k % 8) + 8) % 8, dup = seen ? seen.has(k) : false; if (seen) seen.add(k);
                sc0 += s.slotsOf && s.slotsOf[ks] && s.slotsOf[ks].strum && !dup ? 1 : -1.5; off += Math.abs(d); nIn++;
              }
              if (sc0 > bestSc || (centred && sc0 === bestSc && off < bestOff - 1e-9) || (p.rule === 'shape' && sc0 === bestSc && Math.abs(o - keepNear) < Math.abs(best - keepNear))){ bestSc = sc0; best = o; bestOff = off; bestN = nIn; }
            }
            return { best, score: bestSc, off: bestOff, n: bestN };
          };
          let range = p.range || 1;
          if (p.lock && p.rule === 'shapeFree'){ const others = recent.slice(0, -1); if (others.length >= 4 && search(s.gridOffset, 0, s.gridOffset, false, others).score === others.length) range = p.lock; }
          let r = p.rule === 'shape' ? search(0, s.slotMs / 2, s.gridOffset) : search(s.gridOffset, range * s.slotMs, s.gridOffset);
          if (p.rule === 'shapeFree' && p.wide && recent.length >= (p.wideMin || 6) && r.score < recent.length - (p.wideSlack == null ? 1.5 : p.wideSlack)){
            const w = search(s.gridOffset, p.wide * s.slotMs, s.gridOffset, true);
            if (w.score >= recent.length - (p.wideAccept == null ? 1 : p.wideAccept) && w.n && w.off / w.n <= (p.wideTight == null ? 1e9 : p.wideTight) * s.slotMs) r = w;
          }
          s.gridOffset += (r.best - s.gridOffset) * p.ease;
          const rel2 = coachOnsetAt - s.listenStart - s.gridOffset - s.lat;   // this onset judged on the anchored grid
          if (pre){ pre.fired = true; H.diag.push(pre); }
          return rel2;
        }
        else if (p.rule === 'barEnd'){
          const bar = Math.floor(slotIdx / 8);
          s.__bar = s.__bar == null ? bar : s.__bar; s.__devs = s.__devs || [];
          if (bar > s.__bar){ if (s.__devs.length) s.gridOffset += s.__devs.reduce((a, b) => a + b, 0) / s.__devs.length * p.ease; s.__devs = []; s.__bar = bar; }
          if (inWin && isStrum) s.__devs.push(dev);
        }
        r = rel;
      }
    }
    if (pre){ pre.fired = r != null; H.diag.push(pre); }
    return r;
  };
})()`;
/* the site's settings as the page's copy of the detector writes them (the identity test below compares the copy with the real one):
   since 2026-11-14 ratios 1.15 / 1.3 and the pattern-shape grid (scHearStrum, coach-strumcheck.js); before, 1.2 / 1.46 and Strum
   Radar's easing 0.2 (rule 'base'). */
export const SITE_P = { ratio: 1.15, hfRatio: 1.3, refract: 140, ease: 1, within: 0.45, rule: 'shapeFree', wide: 4, wideMin: 6, wideSlack: 1.5, wideAccept: 1, wideTight: 0.15 };

const args = process.argv.slice(2);
const opt = k => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : null; };
const flag = k => args.includes('--' + k);
const files = args.filter(a => !a.startsWith('--'));
if (!files.length){ console.error('strum-check-replay: name one or more take .json files (their .wav beside them)'); process.exit(2); }
const KEY = opt('key') ? JSON.parse(readFileSync(opt('key'), 'utf8')) : {};

const site = benchSite(null);
site.run(SC_VM);
site.run(HOOK);
/* --gate: every frame the check reads during its count-in (scLoop's warm-up: coachSmooth before it updates), with the smoothed level
   it would be tested against. Recorded only while __ci is an array and the frame is the strum check's. */
site.run(`(() => { if (globalThis.__ciHook) return; globalThis.__ciHook = true; const real = coachSmooth;
  coachSmooth = function(st, rms, hf){ if (Array.isArray(globalThis.__ci) && typeof sc !== 'undefined' && st === sc && sc.phase === 'countin')
    __ci.push({ now: performance.now(), at: coachOnsetAt, rms, hf, sR: st.smoothRms, sH: st.smoothHf }); return real(st, rms, hf); }; })()`);
const btn = JSON.parse(site.run('__sc.button()'));
if (btn.err) { console.error('strum-check-replay: ' + btn.err); process.exit(2); }
const OPEN = { E: 40, A: 45, D: 50, G: 55, B: 59, e: 64 };
const caSpec = JSON.parse(site.run("JSON.stringify(CLASS_ACTIVITIES.find(x => x.id === 'ca-52').steps.find(s => s.strum && s.strum.listen).strum.chords)"));
const CH = {}; for (const [n, c] of Object.entries(caSpec)) CH[n] = c.frets.map(([s, f]) => OPEN[s] + f);

const takes = files.map(f => {
  const d = JSON.parse(readFileSync(resolve(f), 'utf8'));
  if (d.game !== 'strumcheck') throw new Error(basename(f) + ' is not a strum-check take');
  const wav = readWav(resolve(f).replace(/\.json$/, '.wav')), srcRate = Number(d.srcSampleRate) || wav.sr;
  const id = basename(f).replace(/\.json$/, '');
  return { id, d, srcRate, wav, proc: prepare(wav, srcRate, site.chain), key: KEY[id] || {} };
});
/* --copy=<json>: the settings the identity test gives the page's copy (over SITE_P), for a tree whose real function carries a
   candidate (e.g. --copy='{"outPen":-1.5}' on a tree with candidate A planted: the copy must equal the planted code too). */
const COPY_P = { ...SITE_P, ...JSON.parse(opt('copy') || '{}') };

function setP(p){ site.run('__scHook.on = ' + (p ? 'true' : 'false') + '; __scHook.p = ' + JSON.stringify(p || null)); }

/* One replay. Returns the bench's out() plus the map and (with diag) every frame srHearStrum saw. */
async function replay(tk, p, o = {}){
  setP(p);
  site.run('__scHook.diag = ' + (o.diag ? '[]' : 'null'));
  site.reset(); site.clock.now = 1000;
  if (o.ci) site.run('globalThis.__ci = []');
  takeSource(tk.proc, tk.srcRate, 0).start(site);
  /* --dot: the Metronome on (no headphones), so the check draws its beat (dot and frame); every beat is logged with the grid of that
     moment. The site's beat function: scBeat(s, j) on the click grid since 2026-11-14 (scBeatTick(s, cur) on the eased grid before). */
  site.run(`metroRunning = ${o.dot ? 'true' : 'false'}; scHeadphonesSet(false); globalThis.__dots = [];
    if (!globalThis.__realBeat){ const old = typeof scBeatTick === 'function';
      globalThis.__realBeat = old ? scBeatTick : scBeat;
      const log = (s, cur) => __dots.push({ now: performance.now(), cur, ls: s.listenStart, g: s.gridOffset, slotMs: s.slotMs });
      if (old) scBeatTick = function(s, cur){ const r = __realBeat(s, cur); if (r) log(s, cur); return r; };
      else scBeat = function(s, j){ const r = __realBeat(s, j); if (r) log(s, 2 * j); return r; }; }`);
  site.run('globalThis.__scArg = ' + JSON.stringify({ data: btn.data, bpm: tk.d.bpm, lat: tk.d.latMs }));
  const err = site.run('__sc.start(__scArg)');
  if (err) throw new Error(err);
  await site.run('__lb.p');
  const [phase, ls] = site.run('__sc.phase()').split('|');
  if (phase !== 'countin') throw new Error('the check did not start its count-in');
  const map = Number(ls) - tk.d.expected[0].t + (o.shift != null ? o.shift : (tk.shift || 0));
  site.mic.offsetMs = map;
  const frameMs = Math.max(8, Math.min(60, Number(tk.d.frameMeanMs) || 16.7));
  let guard = 0;
  while (site.run('__sc.phase()').split('|')[0] !== 'report'){ site.clock.now += frameMs; site.tick(); if (++guard > 100000) throw new Error('the round never ended'); }
  const res = JSON.parse(site.run('__sc.out()'));
  res.map = map; res.ls = Number(ls);
  if (o.diag) res.diag = JSON.parse(site.run('JSON.stringify(__scHook.diag)'));
  if (o.ci){ res.ci = JSON.parse(site.run('JSON.stringify(__ci)')); site.run('globalThis.__ci = null'); }
  if (o.dot) res.dots = JSON.parse(site.run('JSON.stringify(__dots)'));
  return res;
}

/* The take's own saved verdicts, per slot k (0..63) and per bar. */
function live(d){
  const v = new Array(64).fill(null);
  d.expected.forEach(e => { v[e.bar * 8 + e.slot] = e.verdict; });
  d.rests.forEach(e => { v[e.bar * 8 + e.slot] = e.verdict; });
  return { slots: v, chords: d.chords.map(c => ({ v: c.verdict, a: c.a, b: c.b })) };
}
function agree(tk, res){
  const L = live(tk.d);
  const s = res.slots.filter((x, i) => x.state === L.slots[i]).length;
  const c = res.caps.filter((x, i) => x.verdict === L.chords[i].v).length;
  const cab = res.caps.filter((x, i) => x.a === L.chords[i].a && x.b === L.chords[i].b).length;
  const diff = res.slots.map((x, i) => x.state === L.slots[i] ? null : `bar ${x.bar + 1} slot ${x.slot}: live ${L.slots[i]}, replay ${x.state}`).filter(Boolean);
  return { s, c, cab, diff };
}
/* Against Jonathan's key. */
function score(tk, res){
  const skip = new Set((tk.key.skipBars || []).map(b => b - 1)), wrongAt = tk.key.chords || {};
  let heard = 0, strums = 0, extras = 0, rests = 0, right = 0, rightN = 0, caught = 0, wrongN = 0;
  res.slots.forEach(x => {
    if (skip.has(x.bar)) return;
    if (x.strum){ strums++; if (x.state === 'ok') heard++; } else { rests++; if (x.state === 'extra') extras++; }
  });
  res.caps.forEach((c, b) => { if (wrongAt[b + 1] === 'wrong'){ wrongN++; if (c.verdict === 'wrong') caught++; } else { rightN++; if (c.verdict === 'ok') right++; } });
  return { heard, strums, extras, rests, right, rightN, caught, wrongN };
}

/* THE CLOCK FIT: the take's times rest on micRecStartPerf's estimate of when the recording's first sample was heard. Measured on J01
   (2026-11-14): every replayed onset came ~93 ms after the live one, one 4096-sample buffer at 44.1 kHz. So the shift is fitted: replay,
   pair each live onset with the nearest replayed one (within 200 ms), move the clock by the median gap, until it moves under 2 ms. */
function gaps(tk, res){
  const t0 = tk.d.expected[0].t, L = tk.d.events.map(e => e.t - t0), R = res.events.map(e => e.t);
  return L.map(t => { let best = null; R.forEach(x => { if (best == null || Math.abs(x - t) < Math.abs(best)) best = x - t; }); return best; }).filter(g => g != null && Math.abs(g) <= 200);
}
const med = a => { const s = a.slice().sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : 0; };
async function fitShift(tk){
  let shift = 0, res = null, g = [];
  for (let i = 0; i < 6; i++){
    res = await replay(tk, null, { shift });
    g = gaps(tk, res);
    const m = med(g);
    if (Math.abs(m) < 2) break;
    shift -= m;
  }
  const spread = g.map(x => Math.abs(x)).sort((p, q) => p - q);
  /* The onsets alone do not pin the grid: frame timing moves the eased grid, and the grid can land a slot apart (measured: J02 and J03
     flip between "mostly right" and "a slot off" across 20 ms). So the clock kept is the one, within 40 ms of the fit in 5 ms steps,
     that gives the most of the live slot verdicts (ties: the nearest the fit); every step's count is kept to show how sharp the edge is. */
  const scan = [];
  for (let d = -40; d <= 40; d += 5){ const r = await replay(tk, null, { shift: shift + d }); scan.push({ d, s: agree(tk, r).s }); }
  const best = scan.reduce((b, x) => x.s > b.s || (x.s === b.s && Math.abs(x.d) < Math.abs(b.d)) ? x : b, scan[0]);
  return { fit: Math.round(shift * 10) / 10, shift: Math.round((shift + best.d) * 10) / 10, paired: g.length, of: tk.d.events.length, p90: Math.round(spread[Math.floor(spread.length * 0.9)] || 0), scan };
}

const out = { takes: {}, sweep: [] };
const log = l => console.log(l);
for (const tk of takes){
  const raw = await replay(tk, null, {});
  const ar = agree(tk, raw);
  /* --shifts=J01:-119.9,J02:-75.1: the clock given, not fitted (a site whose verdicts differ from the live ones cannot be fitted to
     them; the clocks fitted on the take's own site are the like-for-like ones) */
  const given = Object.fromEntries((opt('shifts') || '').split(',').filter(Boolean).map(x => x.split(':')).map(([k, v]) => [k, Number(v)]));
  const fit = tk.id in given ? { fit: given[tk.id], shift: given[tk.id], paired: 0, of: tk.d.events.length, p90: 0, scan: [] } : await fitShift(tk);
  tk.shift = fit.shift;
  log(`${tk.id}: the take's own clock: slots ${ar.s} of 64, chords ${ar.c} of 8; clock fitted on the onsets: ${fit.fit} ms (${fit.paired} of ${fit.of} live onsets paired, 90% within ${fit.p90} ms); kept ${fit.shift} ms`);
  log(`  slots reproduced, clock fit ${fit.scan.map(x => (x.d > 0 ? '+' : '') + x.d + ':' + x.s).join(' ')}`);
  const base = await replay(tk, null, { diag: flag('diag'), shift: tk.shift });
  const a = agree(tk, base);
  log(`${tk.id} · ${tk.d.bpm} BPM · ${tk.d.micLabel ? 'mic ' + tk.d.micLabel.replace(/\(.*\)/, '').trim() : ''} · frame ${tk.d.frameMeanMs} ms · live gridOffset ${tk.d.gridOffsetMs} ms, replay ${base.gridOffset} ms`);
  log(`  REPRODUCED (the real check, the fitted clock): slots ${a.s} of 64 · chords ${a.c} of 8 (rules a and b both: ${a.cab} of 8)` + (a.diff.length ? '\n    ' + a.diff.join('\n    ') : ''));
  for (const sh of [-20, 20, -40, 40]){ const r = await replay(tk, null, { shift: tk.shift + sh }); const b = agree(tk, r); log(`    fitted clock ${sh > 0 ? '+' : ''}${sh} ms: slots ${b.s} of 64 · chords ${b.c} of 8`); }
  const own = await replay(tk, COPY_P, { shift: tk.shift });
  const ao = agree(tk, own), same = JSON.stringify(own.slots) === JSON.stringify(base.slots) && JSON.stringify(own.caps) === JSON.stringify(base.caps) && JSON.stringify(own.events) === JSON.stringify(base.events);
  log(`  the page's copy of srHearStrum at the site's settings${opt('copy') ? ' + ' + opt('copy') : ''}: ${same ? 'IDENTICAL to the real function (slots, chords, events)' : 'DIFFERENT: slots ' + ao.s + ' of 64'}`);
  if (!same){ console.error('strum-check-replay: the copy does not reproduce the real srHearStrum; the sweep would mean nothing'); process.exit(1); }
  const sc = score(tk, base);
  log(`  against the key: strums heard ${sc.heard} of ${sc.strums} · false extras ${sc.extras} of ${sc.rests} · right chords called right ${sc.right} of ${sc.rightN} · wrong chords caught ${sc.caught} of ${sc.wrongN}`);
  out.takes[tk.id] = { agree: a, score: sc, base };
  if (flag('diag')) diagnose(tk, base);
  if (flag('dot')){
    /* The beat dot (Metronome on, no headphones) against the beat: the click grid (listenStart + k slots) and the eased grid the
       check listens on (+ gridOffset; a strum's sound is expected latMs after that). Times on the page's clock, frame-quantized. */
    const r = await replay(tk, null, { dot: true });
    const vClick = r.dots.map(x => x.now - (x.ls + x.cur * x.slotMs)), vGrid = r.dots.map(x => x.now - (x.ls + x.g + x.cur * x.slotMs));
    const st = v => { const s = v.slice().sort((p, q) => p - q); return `median ${Math.round(s[Math.floor(s.length / 2)])}, ${Math.round(s[0])}..${Math.round(s[s.length - 1])} ms`; };
    log(`  BEAT DOT (Metronome on, this take's sound driving the grid): ${r.dots.length} flashes; after the click grid's beat: ${st(vClick)}; after the eased grid's beat: ${st(vGrid)}; per bar, the dot's lead(-)/lag(+) vs the click: ${[...Array(8).keys()].map(b => Math.round(vClick[b * 4] || 0)).join(' ')}`);
    out.takes[tk.id].dots = { vClick, vGrid };
  }
}

function diagnose(tk, res){
  const win = res.win, L = live(tk.d);
  const D = res.diag;
  log(`  DIAGNOSIS ${tk.id} (frames: level/smoothed, HF/smoothed; ✓ a test passed; R = blocked by the ${SITE_P.refract} ms refractory)`);
  res.slots.forEach((x, k) => {
    const want = x.strum ? 'ok' : 'quiet', key = tk.key, skip = (key.skipBars || []).includes(x.bar + 1);
    if (x.state === want && L.slots[k] === want) return;
    /* the slot's arrival time on the grid of the moment (the frame nearest it carries the grid then) */
    const near = D.reduce((b, f) => { const t = f.ls + f.g + k * f.slotMs + f.lat; return Math.abs(f.at - t) < Math.abs(b.f ? b.f.at - b.t : 1e9) ? { f, t } : b; }, {});
    const t = near.t;
    const fr = D.filter(f => Math.abs(f.at - t) <= win + 40);
    const parts = fr.map(f => {
      const r1 = f.sR > 0 ? f.rms / f.sR : 0, r2 = f.sH > 0 ? f.hf / f.sH : 0, lv = f.rms > 0.005 && r1 > SITE_P.ratio, hv = f.hf > 0.004 && r2 > SITE_P.hfRatio;
      const ref = (lv || hv) && f.at - f.last <= SITE_P.refract;
      return `${Math.round(f.at - t)}:${r1.toFixed(2)}${lv ? '✓' : ''}/${r2.toFixed(2)}${hv ? '✓' : ''}${ref ? 'R' + Math.round(f.at - f.last) : ''}${f.fired ? '*' : ''}`;
    });
    const evs = res.events.filter(e => Math.abs(e.t + res.ls - (t - near.f.lat)) <= win + 40).map(e => `${e.kind} k${e.k} dev ${e.dev}`);
    log(`    bar ${x.bar + 1} slot ${x.slot} ${x.strum ? 'strum' : 'rest '} replay ${x.state}${skip ? ' (bar the key leaves out)' : ''} · grid ${Math.round(near.f.g)} ms · frames ms-from-slot:level/HF ${parts.join(' ')}${evs.length ? ' · events ' + evs.join(', ') : ''}`);
  });
  res.caps.forEach(c => log(`    chord bar ${c.bar + 1} ${c.chord} (prev ${c.prev}): a=${c.a} b=${c.b} c=${c.c} · ${c.n} readings (${c.nA} in 340 ms): ${c.rm.join(' ')}`));
  log('    onsets heard (ms from beat 1 on the click grid, nearest eighth, dev, kind): ' + res.events.map(e => `${e.t}/${e.k}/${e.dev}/${e.kind}`).join(' '));
}

/* ── the sweep ── */
/* ── the count-in gate (the lead, 2026-11-14: "a too loud to grade warning"): how much the room makes the check's detector fire while
   the student is not yet playing. Per round: onsets the check's test would hear in the count-in, from GATE_SKIP ms after the count-in's
   first click (the smoothed level starts at 0) to the first window of bar 1, outside each count-in click (GATE_CLICK_PRE ms before
   its scheduled time to GATE_CLICK_POST after: the speaker's click reaches the mic too), with the 140 ms refractory; and the median
   frame level there. Two ratio pairs: 1.1 / 1.2 and 1.2 / 1.46. */
const GATE_SKIP = 300, GATE_CLICK_PRE = 20, GATE_CLICK_POST = 150;
function gateMeasure(ci, ls, beatMs, win, ratio, hfRatio){
  const a0 = ls - 4 * beatMs, clicks = [0, 1, 2, 3].map(k => a0 + k * beatMs);
  const inside = f => f.at >= a0 + GATE_SKIP && f.at < ls - win && !clicks.some(c => f.at >= c - GATE_CLICK_PRE && f.at <= c + GATE_CLICK_POST);
  let last = -1e9, n = 0; const lv = [];
  for (const f of ci){
    if (!inside(f)) continue;
    lv.push(f.rms);
    if (((f.rms > 0.005 && f.rms > f.sR * ratio) || (f.hf > 0.004 && f.hf > f.sH * hfRatio)) && f.at - last > 140){ n++; last = f.at; }
  }
  lv.sort((p, q) => p - q);
  /* level: the median; p20: the 20th percentile (the site's since review R1-3: the room, not a guitar strummed in the count-in) */
  return { n, level: lv.length ? lv[Math.floor(lv.length / 2)] : 0, p20: lv.length ? lv[Math.floor(lv.length * 0.2)] : 0, frames: lv.length };
}
const BENCH = {
  ratios: { students: ['silent', 'right'], bpm: [85], seeds: 4 },
  grid: { students: ['right', 'silent', 'late100', 'early100', 'drag2', 'drag4', 'rush2', 'rush4', 'straight8', 'beats'], bpm: [85, 98], seeds: 2 },
  /* the rooms (the lead, 2026-11-14: "the real classroom has talking and other guitars"): every student in the quiet room, the class
     room (neighbours' guitars) and the two rooms fitted to real classroom takes (room7, room4: talking, neighbours, bangs); and
     nothing played in the two talking-only rooms (talk, chatter: no guitar anywhere) */
  noisy: { students: ['right', 'silent', 'late100', 'early100', 'drag2', 'drag4', 'rush2', 'rush4', 'straight8', 'beats'], bpm: [85, 98], seeds: 2,
    rooms: ['quiet', 'class', 'room7', 'room4'], extra: [['silent', 'talk'], ['silent', 'chatter']] }
};
async function bench(p, which){
  setP(p);
  const B = { ...BENCH[which], ...(opt('bench-seeds') ? { seeds: Number(opt('bench-seeds')) } : {}) }, o = { lag: 70, fps: 60, stop: 0 }, rows = {};
  const plan = [];
  for (const room of B.rooms || ['quiet']) for (const kind of B.students) plan.push([kind, room]);
  for (const x of B.extra || []) plan.push(x);
  for (const [kind, room] of plan) for (const bpm of B.bpm){
    const c = rows[kind + '@' + bpm + (B.rooms ? '@' + room : '')] = { heard: 0, strums: 0, extras: 0, rests: 0, bars: 0, barsOk: 0, silentHeard: 0 };
    for (let s = 1; s <= B.seeds; s++){
      const t = { kind, room, mic: 'chromebook', bpm, s, seed: seedOf(['scr', kind, bpm, s].concat(room === 'quiet' ? [] : [room]).join('|')) };
      site.run('globalThis.__ci = []');
      const { res, play } = await oneTake(site, t, o, btn, CH);
      const ci = JSON.parse(site.run('JSON.stringify(__ci)')); site.run('globalThis.__ci = null');
      const end = site.clock.now, slotMs = 60000 / bpm / 2;
      /* this round alone, and its count-in gate readings (both ratio pairs), so a gate can be applied round by round */
      const one = { kind, room, bpm, s, bars: res.barsDone, barsOk: 0, heard: 0, strums: 0, extras: 0, rests: 0,
        g11: gateMeasure(ci, res.listenStart, 60000 / bpm, res.win, 1.1, 1.2), g12: gateMeasure(ci, res.listenStart, 60000 / bpm, res.win, 1.2, 1.46) };
      for (let b = 0; b < res.barsDone; b++){ const own = res.slots.slice(b * 8, b * 8 + 8); if (own.every(x => x.strum ? x.state === 'ok' : x.state !== 'extra')) one.barsOk++; }
      res.slots.forEach((x, i) => { const e = play.key[i]; if (e.wantMs + slotMs / 2 > end || kind === 'silent') return; if (e.truth === 'played'){ one.strums++; if (x.state === 'ok') one.heard++; } if (e.truth === 'quiet'){ one.rests++; if (x.state === 'extra') one.extras++; } });
      (rows.__rounds = rows.__rounds || []).push(one);
      res.slots.forEach((x, i) => {
        const e = play.key[i];
        if (e.wantMs + slotMs / 2 > end) return;   // after the round ended (a dragging student)
        if (kind === 'silent'){ if (x.state === 'ok' || x.state === 'extra') c.silentHeard++; return; }
        if (e.truth === 'played'){ c.strums++; if (x.state === 'ok') c.heard++; }
        if (e.truth === 'quiet'){ c.rests++; if (x.state === 'extra') c.extras++; }
      });
      for (let b = 0; b < res.barsDone; b++){ const own = res.slots.slice(b * 8, b * 8 + 8); c.bars++; if (own.every(x => x.strum ? x.state === 'ok' : x.state !== 'extra')) c.barsOk++; }
    }
  }
  setP(null);
  return rows;
}
if (flag('sweep')){
  const cands = [];
  for (const ratio of [1.0, 1.1, 1.2, 1.3, 1.4]) for (const hfRatio of [1.2, 1.33, 1.46, 1.6, 1.7]) cands.push({ ...SITE_P, ratio, hfRatio, which: 'ratios' });
  for (const refract of [80, 100, 120]) cands.push({ ...SITE_P, refract, which: 'ratios' });
  const grid = [{ rule: 'base' }, { rule: 'base', ease: 0.1 }, { rule: 'strumOnly' }, { rule: 'cap', cap: 0.25 }, { rule: 'cap', cap: 0.5 }, { rule: 'beatsDown' },
    { rule: 'none' }, { rule: 'shape', ease: 1 }, { rule: 'shapeFree', ease: 1 }, { rule: 'shapeFree', ease: 0.5 }, { rule: 'barEnd', ease: 0.5 }];
  if (opt('only') === 'grid') cands.length = 0;
  /* --cands=<json>: only these settings (each { ...settings, which: 'ratios' | 'grid' }), over the site's */
  if (opt('cands')){ cands.length = 0; grid.length = 0; JSON.parse(opt('cands')).forEach(c => cands.push({ ...SITE_P, ...c })); }
  for (const g of grid) cands.push({ ...SITE_P, ...g, which: 'grid' });
  /* --no-bench: the takes only (the synthetic bench is strum-check-loop.mjs's own run). Each candidate's takes are printed:
     name (the candidate's `name`, else its settings) · take · clock · heard, false extras, bars all right (of 8), right chords. */
  if (opt('cands')) cands.unshift({ ...SITE_P, name: 'today', which: 'ratios' });
  for (const c of cands){
    const p = Object.fromEntries(Object.entries(c).filter(([k]) => k !== 'which' && k !== 'name'));
    const row = { p, name: c.name, takes: {}, bench: null };
    for (const tk of takes){
      const runs = [];
      for (const d of [0, -20, 20]){ const r = await replay(tk, p, { shift: tk.shift + d }); runs.push({ d, score: score(tk, r), perBar: r.slots.reduce((m, x) => { m[x.bar] = (m[x.bar] || '') + (x.state === (x.strum ? 'ok' : 'quiet') ? '·' : x.strum ? 'm' : 'x'); return m; }, []), chords: r.caps.map(x => x.verdict), barsOk: [...Array(8).keys()].filter(b => r.slots.slice(b * 8, b * 8 + 8).every(x => x.state === (x.strum ? 'ok' : 'quiet'))).length }); }
      row.takes[tk.id] = runs;
      if (opt('cands')) runs.forEach(x => log(`SWEEP ${(c.name || JSON.stringify(Object.fromEntries(Object.entries(p).filter(([k, v]) => SITE_P[k] !== v)))).padEnd(8)} ${tk.id} clock ${x.d > 0 ? '+' : ''}${x.d} ms: heard ${x.score.heard}/${x.score.strums} · false extras ${x.score.extras}/${x.score.rests} · bars all right ${x.barsOk}/8 (${x.perBar.join(' ')}) · right chords ${x.score.right}/${x.score.rightN} · wrong caught ${x.score.caught}/${x.score.wrongN}`));
    }
    if (!flag('no-bench')) row.bench = await bench(p, c.which);
    out.sweep.push(row);
    process.stderr.write('.');
  }
  process.stderr.write('\n');
}
/* --splice (2026-11-16, review R4-1): a REAL extra strum. One of the take's own strums (the bar's slot 0 for its rest on slot 1, its
   slot 2 for its rest on slot 4: both down-strums) is copied from the .wav (from 30 ms before its onset, min(220 ms, 0.7 eighth) long)
   and ADDED into one rest of the same bar, at the rest's place as he played it (halfway between his own two strums either side, as the
   replay of today's code hears them) plus --splice-offs (default 0,-40,40,-80,80 ms). Bars 2 to 7, both rests: up to 12 rests a take,
   one extra per replay, at the take's kept clock. Under today's code (the copy at SITE_P) and each --cands candidate. Per variant:
   caught (the rest's slot "extra"), the mistake bar passed (its six strums heard, no extra), and the OTHER 63 slots that changed
   against the same variant's replay of the unspliced take. */
if (flag('splice')){
  const offs = (opt('splice-offs') || '0,-40,40,-80,80').split(',').map(Number);
  const vars = [{ name: 'today', p: SITE_P }].concat(opt('cands') ? JSON.parse(opt('cands')).map((c, i) => ({ name: c.name || 'cand' + i, p: Object.fromEntries(Object.entries({ ...SITE_P, ...c }).filter(([k]) => k !== 'which' && k !== 'name')) })) : []);
  const tally = {};
  for (const tk of takes){
    const ref = await replay(tk, null, { shift: tk.shift }), sr = tk.wav.sr, lat = Number(tk.d.latMs) || 0;
    const wavMs = e => e.t + ref.ls + lat - ref.map;   // an event's onset, in ms of the .wav
    const ev = k => ref.events.find(e => e.k === k && e.kind === 'strum');
    const plain = {}; for (const v of vars) plain[v.name] = await replay(tk, v.p, { shift: tk.shift });
    const slotMs = 60000 / tk.d.bpm / 2, L = Math.min(220, 0.7 * slotMs);
    for (let bar = 1; bar <= 6; bar++) for (const [rest, src, a, b] of [[1, 0, 0, 2], [4, 2, 3, 5]]){
      const eS = ev(bar * 8 + src), eA = ev(bar * 8 + a), eB = ev(bar * 8 + b);
      if (!eS || !eA || !eB){ log(`SPLICE ${tk.id} bar ${bar + 1} rest ${rest}: left out (today's replay did not hear its strums ${src}/${a}/${b})`); continue; }
      const from = Math.round((wavMs(eS) - 30) / 1000 * sr), n = Math.round(L / 1000 * sr), mid = (wavMs(eA) + wavMs(eB)) / 2;
      for (const off of offs){
        const to = Math.round((mid + off - 30) / 1000 * sr), x = Float32Array.from(tk.wav.x);
        for (let i = 0; i < n && to + i < x.length; i++) x[to + i] += tk.wav.x[from + i];
        const tk2 = { ...tk, proc: prepare({ x, sr }, tk.srcRate, site.chain) };
        const cells = [];
        for (const v of vars){
          const r = await replay(tk2, v.p, { shift: tk.shift }), k = bar * 8 + rest;
          const caught = r.slots[k].state === 'extra', own = r.slots.slice(bar * 8, bar * 8 + 8), pass = own.every(x2 => x2.strum ? x2.state === 'ok' : x2.state !== 'extra');
          const moved = r.slots.filter((x2, i) => i !== k && x2.state !== plain[v.name].slots[i].state).length;
          const t = tally[v.name + '|' + off] = tally[v.name + '|' + off] || { n: 0, caught: 0, pass: 0, moved: 0 };
          t.n++; if (caught) t.caught++; if (pass) t.pass++; t.moved += moved;
          const tt = tally[v.name + '|' + tk.id] = tally[v.name + '|' + tk.id] || { n: 0, caught: 0, pass: 0, moved: 0 };
          tt.n++; if (caught) tt.caught++; if (pass) tt.pass++; tt.moved += moved;
          cells.push(`${v.name} ${r.slots[k].state}${pass ? ' (bar passed)' : ''}${moved ? ' +' + moved + ' other slots changed' : ''}`);
        }
        log(`SPLICE ${tk.id} bar ${bar + 1} rest ${rest} ${off > 0 ? '+' : ''}${off} ms: ${cells.join(' · ')}`);
      }
    }
  }
  log('SPLICE TOTALS (caught / mistake bar passed / other slots changed, of n splices)');
  for (const v of vars){
    log(`  ${v.name.padEnd(8)} by offset: ${offs.map(o => { const t = tally[v.name + '|' + o]; return t ? `${o > 0 ? '+' : ''}${o}: ${t.caught}/${t.n}, passed ${t.pass}, moved ${t.moved}` : ''; }).join(' | ')}`);
    log(`  ${v.name.padEnd(8)} by take:   ${takes.map(tk => { const t = tally[v.name + '|' + tk.id]; return t ? `${tk.id}: ${t.caught}/${t.n}, passed ${t.pass}, moved ${t.moved}` : ''; }).join(' | ')}`);
  }
}
if (flag('gate')){
  const seeds = Number(opt('gate-seeds') || 6), rooms = (opt('gate-rooms') || 'quiet,class,room7,room4,talk,chatter').split(','), o2 = { lag: 70, fps: 60, stop: 0 };
  const rows = [];
  for (const room of rooms) for (const kind of ['silent', 'right']) for (const bpm of [85, 98]) for (let k = 1; k <= seeds; k++){
    if (['talk', 'chatter'].includes(room) && kind === 'right') continue;   // no guitar in those rooms
    site.run('globalThis.__ci = []');
    const t = { kind, room, mic: 'chromebook', bpm, s: k, seed: seedOf(['gate', kind, room, bpm, k].join('|')) };
    const { res } = await oneTake(site, t, o2, btn, CH);
    const ci = JSON.parse(site.run('JSON.stringify(__ci)')); site.run('globalThis.__ci = null');
    rows.push({ room, kind, bpm, k, ls: res.listenStart, beatMs: 60000 / bpm, win: res.win, ci });
  }
  for (const tk of takes){ const r = await replay(tk, null, { ci: true }); rows.push({ room: 'take ' + tk.id, kind: 'right', bpm: tk.d.bpm, k: 1, ls: r.ls, beatMs: 60000 / tk.d.bpm, win: r.win, ci: r.ci }); }
  out.gate = rows;
  const lines = [];
  for (const [ratio, hfRatio] of [[1.1, 1.2], [1.2, 1.46]]){
    lines.push(`\nCOUNT-IN GATE at ${ratio} / ${hfRatio}: onsets heard in the count-in per round (min / median / max), rounds with >= 1, 2, 3, 4 onsets, median frame level`);
    const groups = [...new Set(rows.map(r => r.room + '|' + r.kind))];
    for (const g of groups){
      const sel = rows.filter(r => r.room + '|' + r.kind === g).map(r => gateMeasure(r.ci, r.ls, r.beatMs, r.win, ratio, hfRatio));
      const ns = sel.map(x => x.n).sort((p, q) => p - q), lv = sel.map(x => x.level).sort((p, q) => p - q), p2 = sel.map(x => x.p20).sort((p, q) => p - q);
      const at = th => sel.filter(x => x.n >= th).length, fire = (arr, th) => arr.filter(v => v >= th).length;
      lines.push(`  ${g.replace('|', ' ').padEnd(22)} ${String(sel.length).padStart(2)} rounds · onsets ${ns[0]} / ${ns[Math.floor(ns.length / 2)]} / ${ns[ns.length - 1]} · median level ${(lv[0] || 0).toFixed(4)}..${(lv[lv.length - 1] || 0).toFixed(4)}, gated at 0.012: ${fire(lv, 0.012)} · 20th percentile ${(p2[0] || 0).toFixed(4)}..${(p2[p2.length - 1] || 0).toFixed(4)}, gated at 0.012: ${fire(p2, 0.012)} · frames ${sel[0] ? sel[0].frames : 0}`);
    }
  }
  console.log(lines.join('\n'));
}
if (opt('json')) writeFileSync(opt('json'), JSON.stringify(out));
