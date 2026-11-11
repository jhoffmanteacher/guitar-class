/* Candidate grading rules for Power Chord Switch (2026-11-11), NOT in coach.js. Each is the site's coach.js with a few lines rewritten in memory,
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
export const RULES = ['base', 'ring', 'half', 'half3', 'both', 'both3'];

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
