/* REJECTED on the real takes, 2026-11-11 (WORKFLOW.md, Where things stand: ring lost 55 of 150 real strums; half removed no false hears). Kept so
   the result can be re-run and the next idea has a place to go; do not ship these two as they are.
   Candidate grading rules for Power Chord Switch (2026-11-11), NOT in coach.js. Each is the site's coach.js with a few lines rewritten in memory,
   so a candidate can be played by the virtual student (closed-loop.mjs --rule=) and replayed on real takes (replay-takes.mjs) before anything
   ships. Change Up is not touched by any of them (every new line asks ccIsPower()).

     base    coach.js as it is
     ring    a strum must RING: the quietest frame from 100 ms after it starts to 240 ms (or 0.45 beat, if shorter) must still be at least a quarter of
             its peak and 1.3 x the level just before it. A sound that does not ring (a tap, a click, a bump, muted strings) is dropped and the change
             stays open. With it: a louder strum (1.5 x the peak) may take a change whose check is still open, so a neighbour's quiet strum just before
             the student's own does not use the change up.
     half    the chord check: when there is at least ONE pitch reading, half of the readings must be notes of the new chord (today: 3 readings before
             the chord is checked at all, and more than 15% of them)
     half3   the same, but still only from 3 readings (fewer = right on timing alone, as today)
     both    ring + half          both3   ring + half3

   Each rewrite must find its line exactly once, or this throws: a coach.js that has moved on is reported, not silently run without the rule.
   These four were written against the FIRST-strum ccLoop (before 2026-11-13) and are not ported: on today's site they stop with a message;
   run them on a checkout from before the nearest-strum change (closed-loop.mjs --root=<that checkout>). */
/* WINDOW / PICK candidates (2026-11-13; tools/mic-sim/change-window.mjs reports them). Which strum decides a change. The window is half a
   beat each side (+-2 s at 15 BPM, +-0.5 s at 60). Since 2026-11-13 (`base`, the site) the onset NEAREST the change decides it; before,
   the FIRST onset inside the window did (`first`), and ccResolvePend judged the chord from that onset's 340 ms of readings. Each name below
   is coach.js rewritten:
     same        the candidate machinery with nothing changed (cap none, pick near): must give `base`'s verdict on every change (the harness proof)
     first       the rule every take saved before 2026-11-13 was graded with: the first onset in the window decides, and its verdict shows as soon
                 as its check ends. replay-takes.mjs replays a take with no changePick stamp under it for the "reproduced" line.
     w250 .. w700  first, with the window never more than +-N ms (and never more than the site's: half the spacing between changes, half a
                 beat, 220 ms floor)
     near        inside the window, the onset CLOSEST to the change decides: a later, closer onset finishes an open check early and takes its
                 place, and replaces a finished one; the verdict waits until no closer onset can come (the change time + |its offset|). The
                 site's rule since 2026-11-13 (so `near` = `same` = `base`). Measured on 2026-11-13 with the open check thrown away instead of
                 finished early: the same verdicts on the 33 summaries (the closer check always replaced it).
     last        the LAST onset before the window closes decides; the verdict waits for the window to close
     best        every onset in the window gets its own check (an open one is cut short by the next onset); right as soon as ANY passes the
                 chord-tone vote, wrong only when the window closes with none passing
     w350near    (and every other cap with near / last / best): both
     ...g0       (suffix, Power Chord Switch only) the beat grid does not adapt at all: gridOffset stays 0 (today every onset within half a
                 beat moves it by a quarter of its offset, at most CC_GRID_STEP_CAP_MS = 60 ms, so room noise makes it wander)
     ...gd       (suffix, Power Chord Switch only) the grid adapts only to the onset that ends up DECIDING a change, by the same step, when
                 that change's verdict is final
   Both games (Power Chord Switch and Change Up) take the window and the pick: the code is shared. */
export const CAPS = [250, 350, 500, 700], PICKS = ['near', 'last', 'best'];
export const WINDOW_RULES = ['same', 'first', ...CAPS.map(c => 'w' + c), ...PICKS, ...CAPS.flatMap(c => PICKS.map(p => 'w' + c + p)),
  ...['', ...CAPS.map(c => 'w' + c)].flatMap(w => ['g0', 'gd'].map(g => w + 'near' + g))];
export const RULES = ['base', 'ring', 'half', 'half3', 'both', 'both3', ...WINDOW_RULES];
/* The rules replay-takes.mjs runs when no --rules is given (the window rules are many: change-window.mjs runs them). */
export const DEFAULT_RULES = ['base', 'first'];
function windowRule(rule){
  if (rule === 'same') return { cap: Infinity, pick: 'near', grid: 'all' };
  if (rule === 'first') return { cap: Infinity, pick: 'first', grid: 'all' };
  const m = /^(?:w(\d+))?(near|last|best)?(g0|gd)?$/.exec(rule);
  if (!m || (!m[1] && !m[2])) return null;
  return { cap: m[1] ? Number(m[1]) : Infinity, pick: m[2] || 'first', grid: m[3] || 'all' };
}

export function applyRule(src, rule, ratio){
  if (!RULES.includes(rule)) throw new Error('candidates: no rule "' + rule + '" (' + RULES.join(', ') + ')');
  const rep = (a, b) => { const n = src.split(a).length - 1; if (n !== 1) throw new Error(`candidates: expected this line once in coach.js, found it ${n} times: ${a.slice(0, 90)}`); src = src.replace(a, () => b); };
  const ring = rule === 'ring' || rule === 'both' || rule === 'both3';
  const share = rule === 'half' || rule === 'both' || rule === 'half3' || rule === 'both3';
  const min = rule === 'half' || rule === 'both' ? 1 : 3;
  /* The strum ratios a take was graded with (1.4 / 1.7, 1.8 / 2.19, 2.2 / 2.67): [full, hf]. */
  if (ratio){
    const one = (name, v) => { const re = new RegExp('^const ' + name + '\\s*=\\s*[\\d.]+;', 'm'); if (!re.test(src)) throw new Error('candidates: no ' + name + ' in coach.js'); src = src.replace(re, `const ${name} = ${v};`); };
    one('CC_POWER_ONSET_RATIO', ratio[0]); one('CC_POWER_HF_RATIO', ratio[1]);
  }
  if (rule === 'base') return src;
  /* A site from before the nearest-strum change (closed-loop.mjs --root=<an older checkout>) IS the first-strum rule: `first` leaves it as it
     is, so the "reproduced" line (replay-takes.mjs ownRule) still runs there. Any other window rule needs today's ccLoop. */
  if (rule === 'first' && src.indexOf('function ccHoldFinal(') < 0) return src;
  const W = windowRule(rule);
  if (W) return applyWindow(src, W);
  if (src.indexOf('function ccHoldFinal(') >= 0) throw new Error(`candidates: "${rule}" was written for the first-strum ccLoop (before 2026-11-13) and is not ported to the nearest-strum one; run it with closed-loop.mjs --root=<a checkout from before that change>`);
  rep('const COACH_ONSET_REFRACT = 140;', `const CC_RING_ON = ${ring};
const CC_RING_FROM_MS = 100, CC_RING_TO_MS = 240, CC_RING_TO_BEAT = 0.45, CC_RING_PEAK_MS = 100;
const CC_RING_PEAK_FRAC = 0.25, CC_RING_BASE_RATIO = 1.3, CC_LOUDER_RATIO = 1.5;
const CC_POWER_TONE_SHARE = ${share ? 0.5 : 0}, CC_POWER_TONE_MIN = ${min};
const COACH_ONSET_REFRACT = 140;`);
  rep(`      const ch = cc.changes.find(c => c.result === null && !c.pend &&
        Math.abs(c.beat * cc.beatMs - rel) <= win);
      if (ch) ch.pend = { t: at, readings: [] };`,
  `      const ch = cc.changes.find(c => c.result === null && (!c.pend || CC_RING_ON && ccIsPower() && rms > c.pend.peak * CC_LOUDER_RATIO) &&
        Math.abs(c.beat * cc.beatMs - rel) <= win);
      if (ch) ch.pend = { t: at, readings: [], base: cc.smoothRms, peak: rms, late: Infinity, lateN: 0 };`);
  rep(`    const open = cc.changes.find(c => c.pend);
    if (open){
`, `    const open = cc.changes.find(c => c.pend);
    if (open){
      const age = now - open.pend.t;
      if (age <= CC_RING_PEAK_MS && rms > open.pend.peak) open.pend.peak = rms;
      if (age >= CC_RING_FROM_MS && age <= Math.min(CC_RING_TO_MS, cc.beatMs * CC_RING_TO_BEAT)){ if (rms < open.pend.late) open.pend.late = rms; open.pend.lateN++; }
`);
  rep(`function ccResolvePend(ch){
  const p = ch.pend;
  ch.pend = null;
`, `function ccRang(p){
  if (!p.lateN) return true;
  return p.late >= p.peak * CC_RING_PEAK_FRAC && p.late >= p.base * CC_RING_BASE_RATIO;
}
function ccResolvePend(ch){
  const p = ch.pend;
  ch.pend = null;
  if (CC_RING_ON && ccIsPower() && !ccRang(p)) return;
`);
  rep('  if (p.readings.length >= 3){\n    const want = cc.classes[ch.to];', '  if (p.readings.length >= (ccIsPower() ? CC_POWER_TONE_MIN : 3)){\n    const want = cc.classes[ch.to];');
  rep('    toneOk = anyNew > 0.15 && !(oldHits > newHits && oldHits / n > 0.15);', '    toneOk = (ccIsPower() && CC_POWER_TONE_SHARE ? anyNew >= CC_POWER_TONE_SHARE : anyNew > 0.15) && !(oldHits > newHits && oldHits / n > 0.15);');
  return src;
}

/* The window / pick rewrite (WINDOW_RULES above), on the nearest-strum ccLoop (2026-11-13). Every line is found by exact text, once (rep
   throws otherwise). Also records, for change-window.mjs only (no verdict reads them): every onset's offset on the site's grid (cc.__ons)
   and the offset of the onset that decided each change (decDev). */
function applyWindow(src, W){
  const rep = (a, b) => { const n = src.split(a).length - 1; if (n !== 1) throw new Error(`candidates: expected this line once in coach.js, found it ${n} times: ${a.slice(0, 90)}`); src = src.replace(a, () => b); };
  rep('const COACH_ONSET_REFRACT = 140;', `const CC_WIN_CAP = ${W.cap === Infinity ? 'Infinity' : W.cap}, CC_PICK = '${W.pick}', CC_GRID = '${W.grid}';
function ccWinTake(c, dev){
  if (CC_PICK === 'first') return !c.pend && !c.hold;
  if (CC_PICK === 'near') return (!c.pend || Math.abs(dev) < Math.abs(c.pend.dev)) && (!c.hold || Math.abs(dev) < Math.abs(c.hold.dev));
  return true;
}
function ccHoldUntil(c){ return CC_PICK === 'near' ? Math.min(c.win, Math.abs(c.hold.dev)) : c.win; }
function ccGridAll(){ return CC_GRID === 'all' || !ccIsPower(); }
function ccGridDecided(dev){
  if (CC_GRID === 'gd' && ccIsPower() && dev != null && Math.abs(dev) < cc.beatMs * 0.5) cc.gridOffset += Math.max(-CC_GRID_STEP_CAP_MS, Math.min(CC_GRID_STEP_CAP_MS, dev * 0.25));
}
const COACH_ONSET_REFRACT = 140;`);
  rep('      const beatIdx = Math.round(rel / cc.beatMs);', '      (cc.__ons || (cc.__ons = [])).push(rel);\n      const beatIdx = Math.round(rel / cc.beatMs);');
  rep('      if (Math.abs(dev) < cc.beatMs * 0.5) cc.gridOffset += Math.max(-CC_GRID_STEP_CAP_MS, Math.min(CC_GRID_STEP_CAP_MS, dev * 0.25));',
    '      if (ccGridAll() && Math.abs(dev) < cc.beatMs * 0.5) cc.gridOffset += Math.max(-CC_GRID_STEP_CAP_MS, Math.min(CC_GRID_STEP_CAP_MS, dev * 0.25));');
  rep('      const win = Math.min(cc.beatMs * cc.bpc * 0.5, Math.max(220, cc.beatMs * 0.5));', '      const win = Math.min(cc.beatMs * cc.bpc * 0.5, Math.max(220, cc.beatMs * 0.5), CC_WIN_CAP);');
  rep(`      const ch = cc.changes.find(c => {
        const d = Math.abs(rel - c.beat * cc.beatMs);
        return c.result === null && d <= win && (!c.pend || d < Math.abs(c.pend.dev)) && (!c.hold || d < Math.abs(c.hold.dev));
      });
      if (ch){
        if (ch.pend) ccResolvePend(ch);
        ch.win = win;
        ch.pend = { t: at, readings: [], dev: rel - ch.beat * cc.beatMs };`, `      const ch = cc.changes.find(c => c.result === null && ccWinTake(c, rel - c.beat * cc.beatMs) &&
        Math.abs(c.beat * cc.beatMs - rel) <= win);
      if (ch){
        if (ch.pend) ccResolvePend(ch);
        if (ch.result === null){ ch.win = win; ch.pend = { t: at, readings: [], dev: rel - ch.beat * cc.beatMs }; }`);
  rep(`  const h = { v: toneOk === false ? 'off' : 'ok', readings: ch.readings, dev: p.dev };
  if (!ch.hold || Math.abs(h.dev) < Math.abs(ch.hold.dev)) ch.hold = h;
}`, `  const v = toneOk === false ? 'off' : 'ok';
  if (CC_PICK === 'first' || CC_PICK === 'best' && v === 'ok'){ ch.hold = null; ch.decDev = p.dev; ch.result = v; ccGridDecided(p.dev); ccChipRefresh(cc.changes.indexOf(ch)); return; }
  const h = { v, readings: ch.readings, dev: p.dev };
  if (CC_PICK === 'best'){ if (!ch.hold) ch.hold = h; return; }
  if (CC_PICK === 'near'){ if (!ch.hold || Math.abs(h.dev) < Math.abs(ch.hold.dev)) ch.hold = h; return; }
  ch.hold = h;
}`);
  rep(`  c.result = h.v;
  c.readings = h.readings;
`, `  c.result = h.v;
  c.readings = h.readings;
  c.decDev = h.dev;
  ccGridDecided(h.dev);
`);
  rep('      if (c.result === null && !c.pend && c.hold && relNow > c.beat * cc.beatMs + Math.min(c.win, Math.abs(c.hold.dev))) ccHoldFinal(c);',
    '      if (c.result === null && !c.pend && c.hold && relNow > c.beat * cc.beatMs + ccHoldUntil(c)) ccHoldFinal(c);');
  return src;
}
