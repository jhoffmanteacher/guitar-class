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

   Each rewrite must find its line exactly once, or this throws: a coach.js that has moved on is reported, not silently run without the rule. */
/* WINDOW / PICK candidates (2026-11-13, MEASUREMENT ONLY; tools/mic-sim/change-window.mjs reports them). Which strum decides a change. Today
   (ccLoop) the window is half a beat each side (+-2 s at 15 BPM, +-0.5 s at 60) and the FIRST onset inside it opens the change's check;
   ccResolvePend judges the chord from that onset's 340 ms of readings and a later strum is never used. Each name below is coach.js rewritten:
     same        the candidate machinery with nothing changed (cap none, pick first): must give `base`'s verdict on every change (the harness proof)
     w250 .. w700  the window never more than +-N ms (and never more than today's: half the spacing between changes, half a beat, 220 ms floor)
     near        inside the window, the onset CLOSEST to the change decides: a later, closer onset drops an open check (its readings are thrown
                 away) and a finished one is replaced; the verdict waits until no closer onset can come (the change time + |its offset|)
     last        the LAST onset before the window closes decides; the verdict waits for the window to close
     best        every onset in the window gets its own check (an open one is cut short by the next onset); right as soon as ANY passes the
                 chord-tone vote, wrong only when the window closes with none passing
     w350near    (and every other cap with near / last / best): both
   Both games (Power Chord Switch and Change Up) take the window and the pick: the code is shared. */
export const CAPS = [250, 350, 500, 700], PICKS = ['near', 'last', 'best'];
export const WINDOW_RULES = ['same', ...CAPS.map(c => 'w' + c), ...PICKS, ...CAPS.flatMap(c => PICKS.map(p => 'w' + c + p))];
export const RULES = ['base', 'ring', 'half', 'half3', 'both', 'both3', ...WINDOW_RULES];
/* The rules replay-takes.mjs runs when no --rules is given (the window rules are many: change-window.mjs runs them). */
export const DEFAULT_RULES = ['base', 'ring', 'half', 'half3', 'both', 'both3'];
function windowRule(rule){
  if (rule === 'same') return { cap: Infinity, pick: 'first' };
  const m = /^(?:w(\d+))?(near|last|best)?$/.exec(rule);
  if (!m || (!m[1] && !m[2])) return null;
  return { cap: m[1] ? Number(m[1]) : Infinity, pick: m[2] || 'first' };
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
  const W = windowRule(rule);
  if (W) return applyWindow(src, W);
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

/* The window / pick rewrite (WINDOW_RULES above). Every line is found by exact text, once (rep throws otherwise), except the two end-of-round
   lines (ccStageEnd, ccFinish), which must be found exactly twice. Also records, for change-window.mjs only (no verdict reads them): every
   onset's offset on the site's grid (cc.__ons) and the offset of the onset that decided each change (decDev). */
function applyWindow(src, W){
  const rep = (a, b) => { const n = src.split(a).length - 1; if (n !== 1) throw new Error(`candidates: expected this line once in coach.js, found it ${n} times: ${a.slice(0, 90)}`); src = src.replace(a, () => b); };
  rep('const COACH_ONSET_REFRACT = 140;', `const CC_WIN_CAP = ${W.cap === Infinity ? 'Infinity' : W.cap}, CC_PICK = '${W.pick}';
function ccWinTake(c, dev){
  if (CC_PICK === 'first') return !c.pend;
  if (CC_PICK === 'near') return (!c.pend || Math.abs(dev) < Math.abs(c.pend.dev)) && (!c.hold || Math.abs(dev) < Math.abs(c.hold.dev));
  return true;
}
function ccPendPreempt(c){ if (CC_PICK === 'best') ccResolvePend(c); else c.pend = null; }
function ccHoldUntil(c){ return CC_PICK === 'near' ? Math.min(c.win, Math.abs(c.hold.dev)) : c.win; }
function ccHoldFinal(c){
  const h = c.hold;
  c.hold = null; c.result = h.v; c.readings = h.readings; c.decDev = h.dev;
  ccChipRefresh(cc.changes.indexOf(c));
}
const COACH_ONSET_REFRACT = 140;`);
  rep('      const beatIdx = Math.round(rel / cc.beatMs);', '      (cc.__ons || (cc.__ons = [])).push(rel);\n      const beatIdx = Math.round(rel / cc.beatMs);');
  rep('      const win = Math.min(cc.beatMs * cc.bpc * 0.5, Math.max(220, cc.beatMs * 0.5));', '      const win = Math.min(cc.beatMs * cc.bpc * 0.5, Math.max(220, cc.beatMs * 0.5), CC_WIN_CAP);');
  rep(`      const ch = cc.changes.find(c => c.result === null && !c.pend &&
        Math.abs(c.beat * cc.beatMs - rel) <= win);
      if (ch) ch.pend = { t: at, readings: [] };`, `      const ch = cc.changes.find(c => c.result === null && ccWinTake(c, rel - c.beat * cc.beatMs) &&
        Math.abs(c.beat * cc.beatMs - rel) <= win);
      if (ch){
        if (ch.pend) ccPendPreempt(ch);
        if (ch.result === null){ ch.win = win; ch.pend = { t: at, readings: [], dev: rel - ch.beat * cc.beatMs }; }
      }`);
  rep(`  ch.result = toneOk === false ? 'off' : 'ok';    // percussive/unclear counts on timing alone
  ccChipRefresh(cc.changes.indexOf(ch));`, `  const v = toneOk === false ? 'off' : 'ok';
  if (CC_PICK === 'first' || CC_PICK === 'best' && v === 'ok'){ ch.hold = null; ch.decDev = p.dev; ch.result = v; ccChipRefresh(cc.changes.indexOf(ch)); return; }
  const h = { v, readings: ch.readings, dev: p.dev };
  if (CC_PICK === 'best'){ if (!ch.hold) ch.hold = h; return; }
  if (CC_PICK === 'near'){ if (!ch.hold || Math.abs(p.dev) < Math.abs(ch.hold.dev)) ch.hold = h; return; }
  ch.hold = h;`);
  rep(`    const relNow = now - lat - cc.listenStart - cc.gridOffset;
`, `    const relNow = now - lat - cc.listenStart - cc.gridOffset;
    cc.changes.forEach(c => { if (c.result === null && !c.pend && c.hold && relNow > c.beat * cc.beatMs + ccHoldUntil(c)) ccHoldFinal(c); });
`);
  const endA = "    if (c.pend) ccResolvePend(c);\n    if (c.result === null) c.result = 'miss';";
  const n = src.split(endA).length - 1;
  if (n !== 2) throw new Error(`candidates: expected the end-of-round lines twice in coach.js (ccStageEnd, ccFinish), found them ${n} times`);
  src = src.split(endA).join("    if (c.pend) ccResolvePend(c);\n    if (c.result === null && c.hold) ccHoldFinal(c);\n    if (c.result === null) c.result = 'miss';");
  return src;
}
