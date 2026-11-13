/* Which strum decides a change in Power Chord Switch (and Change Up, same ccLoop): the window / pick candidates of candidates.mjs
   (WINDOW_RULES) replayed on the REAL take summaries (2026-11-13; MEASUREMENT ONLY, nothing here changes the site).

     node tools/mic-sim/change-window.mjs [--rules=same,w250,…] [--json=out.json] [--take=<summary id>]

   Every rule is replayed at the site's strum ratios of today (replay-takes.mjs replayTake: the real ccLoop in a vm, coach.js rewritten in
   memory by candidates.mjs). `base` is also replayed at each take's OWN ratios, for the "reproduced" line (how often the replay gives the
   take's saved verdict). `same` is the candidate machinery with nothing changed: it must give base's verdict on every change, or this exits 1.

   The truth (eval-takes.mjs, the console's evaluator, kept in each summary): `played` = an attack in the recording within TODAY's window of
   the change (half a beat each side). A narrower window is inside today's, so "no strum within today's window" is "no strum" for every
   candidate (the false-pass count is fair). The evaluator does NOT say when inside the window the attack was, nor which chord was played,
   nor who played it; so a change a candidate no longer hears ("lost") is listed with the nearest sound the GAME heard, and right <->
   wrong chord on a real strum is "the game says something else", never "better" or "worse".

   Prints counts only: take numbers (S01..), no names (the summaries hold none). */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadSummaries, TAKES_DIR, replayTake, siteFor, todayRatios } from './replay-takes.mjs';
import { WINDOW_RULES } from './candidates.mjs';

const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const DEFAULT = ['same', 'w250', 'w350', 'w500', 'w700', 'near', 'last', 'best', 'w250near', 'w350near', 'w500near', 'w700near', 'w350best', 'w500best', 'w350last'];
const rules = opt('rules', DEFAULT.join(',')).split(',');
for (const r of rules) if (!WINDOW_RULES.includes(r)){ console.error('no window rule "' + r + '" (' + WINDOW_RULES.join(', ') + ')'); process.exit(2); }
if (!rules.includes('same')) rules.unshift('same');
const NOW = todayRatios();
const takes = loadSummaries(TAKES_DIR);
const FOCUS = opt('take', '80ef56c6f7df');

const run = (tk, rule, ratio) => replayTake(siteFor(rule, ratio, true), tk.d, tk.sum, tk.srcRate, tk.mapMs);
const rows = [];
for (const tk of takes){
  const res = { 'base@own': run(tk, 'base', tk.own), base: run(tk, 'base', NOW) };
  for (const r of rules) res[r] = run(tk, r, NOW);
  for (const n of tk.notes){
    const e = tk.d.expected.find(x => x.i === n.i);
    if (!e || !res.base[n.i]) continue;
    rows.push({ take: tk.take, id: tk.id, day: tk.day, bpm: Number(e.bpm) || tk.d.bpm, i: n.i, from: e.from, to: e.to, played: n.played, cat: n.why && n.why.cat, saved: n.site,
      v: Object.fromEntries(Object.entries(res).map(([k, x]) => [k, x[n.i] ? { verdict: x[n.i].verdict, readings: x[n.i].readings, dec: x[n.i].dec, ons: x[n.i].ons } : null])) });
  }
}
const W = v => v === 'ok' ? 'right' : v === 'off' ? 'wrong' : 'miss';
const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '-';

console.log(`${takes.length} Power Chord Switch take summaries, ${rows.length} judged changes (inside the recording) · strum ratios ${NOW.join(' / ')} for every rule`);
/* 1. The harness. */
const repro = rows.filter(r => W(r.v['base@own'].verdict) === r.saved).length;
const reproHeard = rows.filter(r => (r.v['base@own'].verdict !== 'miss') === (r.saved !== 'miss')).length;
console.log(`reproduced: base at each take's own ratios gives the saved verdict on ${repro} of ${rows.length} changes (heard / not heard: ${reproHeard} of ${rows.length})`);
const sameDiff = rows.filter(r => r.v.same.verdict !== r.v.base.verdict);
console.log(`same (the candidate machinery, nothing changed) = base on ${rows.length - sameDiff.length} of ${rows.length} changes` + (sameDiff.length ? '  <-- HARNESS BROKEN' : ''));
if (sameDiff.length){ sameDiff.slice(0, 5).forEach(r => console.log('   ', r.take, r.i, r.v.base.verdict, r.v.same.verdict)); process.exit(1); }

/* 2. When today's deciding onset came (same = base, with the offset recorded), and how often it was marked wrong chord. */
const bucket = d => d == null ? 'none' : d < -600 ? '< -600' : d < -250 ? '-600..-250' : d <= 250 ? '-250..+250' : '> +250';
const B = ['< -600', '-600..-250', '-250..+250', '> +250'];
const decT = (pick, label) => {
  const rs = rows.filter(pick);
  console.log(`\nToday's rule, ${label}: the onset that decided each heard change, ms from the change on the game's grid (negative = early) · right / wrong chord`);
  for (const b of B){ const x = rs.filter(r => r.v.same.verdict !== 'miss' && bucket(r.v.same.dec) === b), w = x.filter(r => r.v.same.verdict === 'off').length; console.log(`   ${b.padEnd(11)} ${String(x.length).padStart(4)} changes · ${x.length - w} right / ${w} wrong chord (${pct(w, x.length)} wrong)`); }
};
decT(r => true, 'all takes');
decT(r => r.bpm <= 30, '30 BPM and under');
decT(r => r.bpm > 30, 'above 30 BPM');
/* How far the NEAREST sound the game heard was from the change (any onset, not only the deciding one), for changes the recording has a strum. */
const near = r => (r.v.same.ons || []).reduce((b, d) => b == null || Math.abs(d) < Math.abs(b) ? d : b, null);
const nb = [[0, 250], [250, 350], [350, 500], [500, 700], [700, 1e9]];
for (const [lab, pick] of [['30 BPM and under', r => r.bpm <= 30], ['above 30 BPM', r => r.bpm > 30]]){
  const rs = rows.filter(r => r.played && pick(r));
  console.log(`Strum in the recording (${lab}, ${rs.length} changes): the game's NEAREST onset to the change was within ` + nb.map(([a, b]) => `${a}-${b === 1e9 ? '…' : b} ms: ${rs.filter(r => { const d = near(r); return d != null && Math.abs(d) >= a && Math.abs(d) < b; }).length}`).join(' · ') + ` · none at all: ${rs.filter(r => near(r) == null).length}`);
}

/* 3. The table. */
const groups = [['ALL', r => true], ['<=30 BPM', r => r.bpm <= 30], ['>30 BPM', r => r.bpm > 30], ['2026-11-13', r => r.day === '2026-11-13'], ['earlier', r => r.day !== '2026-11-13']];
const report = {};
console.log('\nPer rule, at today\'s strum ratios. right / wrong / miss over every judged change; no strum = the recording has no attack within today\'s window (so none in a narrower one): HEARD / marked RIGHT (fewer is better); strum = the recording has one: right / wrong / miss; LOST = strums today\'s rule heard and this one does not (with the game\'s nearest onset beyond the cap: by design); flips vs today\'s rule.');
for (const [g, pick] of groups){
  const rs = rows.filter(pick), ns = rs.filter(r => !r.played), ps = rs.filter(r => r.played);
  console.log(`\n== ${g}: ${rs.length} changes (${ps.length} with a strum in the recording, ${ns.length} with none)`);
  console.log('   rule      | all: right  wrong  miss | no strum: HEARD RIGHT | strum: right wrong  miss | LOST (cap) | flips vs today: miss>right miss>wrong right>wrong wrong>right right>miss wrong>miss');
  for (const rule of ['base', ...rules.filter(r => r !== 'same')]){
    const c = (set, v) => set.filter(r => r.v[rule].verdict === v).length;
    const lost = ps.filter(r => r.v.base.verdict !== 'miss' && r.v[rule].verdict === 'miss');
    const fl = (a, b) => rs.filter(r => r.v.base.verdict === a && r.v[rule].verdict === b).length;
    const row = { n: rs.length, right: c(rs, 'ok'), wrong: c(rs, 'off'), miss: c(rs, 'miss'), noStrum: ns.length, nsHeard: ns.length - c(ns, 'miss'), nsRight: c(ns, 'ok'),
      strum: ps.length, sRight: c(ps, 'ok'), sWrong: c(ps, 'off'), sMiss: c(ps, 'miss'), lost: lost.length,
      flips: { missRight: fl('miss', 'ok'), missWrong: fl('miss', 'off'), rightWrong: fl('ok', 'off'), wrongRight: fl('off', 'ok'), rightMiss: fl('ok', 'miss'), wrongMiss: fl('off', 'miss') } };
    (report[g] = report[g] || {})[rule] = row;
    const f = row.flips;
    console.log(`   ${rule.padEnd(9)} |      ${String(row.right).padStart(4)}  ${String(row.wrong).padStart(4)}  ${String(row.miss).padStart(4)} |       ${String(row.nsHeard).padStart(3)}  ${String(row.nsRight).padStart(3)}  |       ${String(row.sRight).padStart(4)}  ${String(row.sWrong).padStart(4)}  ${String(row.sMiss).padStart(4)} |    ${String(row.lost).padStart(3)}     |      ${[f.missRight, f.missWrong, f.rightWrong, f.wrongRight, f.rightMiss, f.wrongMiss].map(x => String(x).padStart(5)).join('      ')}`);
  }
}

/* 4. One take, change by change. */
const ft = rows.filter(r => r.id === FOCUS);
if (ft.length){
  console.log(`\nTake ${ft[0].take} (${FOCUS}, ${ft[0].day}, ${ft[0].bpm} BPM), every change the recording covers: verdict (deciding onset ms, readings) per rule · the game's onsets near the change`);
  for (const r of ft){
    console.log(`  change ${r.i} ${r.from}>${r.to} · recording: ${r.played ? 'strum' : 'NO strum'} (${r.cat}) · saved: ${r.saved} · the game's onsets: ${(r.v.same.ons || []).join(', ') || 'none'}`);
    for (const rule of ['base', ...rules.filter(x => x !== 'same')]){
      const v = r.v[rule];
      console.log(`     ${rule.padEnd(9)} ${W(v.verdict).padEnd(6)} ${v.dec != null ? 'onset ' + v.dec + ' ms' : rule === 'base' ? '(see same: ' + r.v.same.dec + ' ms)' : ''}${v.readings != null ? ', ' + v.readings + ' readings' : ''}`);
    }
  }
}
/* 5. Examples of flips (so a count that moves is tied to a change that moved). */
console.log('\nExamples of verdicts that move (first 3 per rule): take, change, BPM, recording, today -> rule (deciding onset today -> rule)');
for (const rule of rules.filter(x => x !== 'same')){
  const ex = rows.filter(r => r.v.base.verdict !== r.v[rule].verdict).slice(0, 3);
  console.log(`  ${rule.padEnd(9)} ` + (ex.map(r => `${r.take}#${r.i} ${r.bpm}bpm ${r.played ? 'strum' : 'none'} ${W(r.v.base.verdict)}->${W(r.v[rule].verdict)} (${r.v.same.dec}->${r.v[rule].dec})`).join(' | ') || 'none'));
}
if (opt('json', null)) writeFileSync(opt('json'), JSON.stringify({ now: NOW, rules, report, rows }));
