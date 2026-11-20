#!/usr/bin/env node
/* tools/live-changes-sim.mjs — "Hear the Chord Change" (live-changes.js), proved in Node on the REAL files.
   Run after any change to live-changes.js, its branches in live-quiz.js, LQ_CC_SONGS, or the sections / chords /
   beat maps of the three songs' cards (ca-33, ca-30, ca-29; SNIPPET_TRACKS). About 1 s. Exit 1 = a case failed.

   It loads class-activities.js, app/snippets.js, live-quiz.js and live-changes.js into one VM (DOM stubbed) and
   checks, for EVERY section of the three songs:
     - the plan exists, has at least one change, every change lies inside the section, in order;
     - one press catches one change, also where two changes are closer than their windows (Sweet Child's C D G bars);
     - a student who presses 0.25 s after every change scores 1000 and is sent as a choice the rules accept;
     - a student who presses every 0.1 s (a spammer) scores 0; one who never presses scores 0;
     - a press 0.05 s before a change counts (LQ_CC_EARLY), 0.15 s before does not, 0.5 s after does, 0.55 s does not;
     - a Stop part-way (cut) counts only the changes before it.
   And the round end to end, with a fake clock and a fake database: a Chromebook whose clock is 37 s off and whose
   copies of the doc arrive 40-400 ms late presses 0.2 s after each change, sends once, and the console's Reveal
   (lqTeacherRevealChanges through the real lqScoreRound) gives it 1000 with no name in the public scores.
   Prints one line per song and a summary with denominators. */
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = f => readFileSync(join(ROOT, f), 'utf8');
let fails = 0, cases = 0;
const ok = (cond, msg) => { cases++; if (!cond) { fails++; console.log('  FAIL ' + msg); } };

const noop = () => {};
const el = () => ({ innerHTML: '', textContent: '', classList: { add: noop, remove: noop, toggle: noop }, style: {}, addEventListener: noop, querySelector: () => null, querySelectorAll: () => [] });
let perfNow = 0;
const box = {
  console, Math, JSON, Date, Promise, Set, Map, Number, String, Array, Object, isFinite, URLSearchParams,
  setTimeout: noop, clearTimeout: noop, setInterval: () => 1, clearInterval: noop,
  addEventListener: noop, removeEventListener: noop,
  localStorage: { getItem: () => null, setItem: noop }, sessionStorage: { getItem: () => null, setItem: noop },
  location: { search: '', hash: '', href: 'http://x/index.html' },
  performance: { timeOrigin: 0, now: () => perfNow },
  document: { addEventListener: noop, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: el, currentScript: null, body: el(), documentElement: el() },
};
box.window = box;
vm.createContext(box);
const run = (src, name) => vm.runInContext(src, box, { filename: name });
run(read('class-activities.js'), 'class-activities.js');
run(read('app/snippets.js').replace(/^const SNIPPET_TRACKS\b/m, 'var SNIPPET_TRACKS'), 'app/snippets.js');
run(read('i18n.js'), 'i18n.js');
run('var escHtml = s => String(s); var escAttr = s => String(s); var songFileSrc = s => s;   /* app/songfiles.js: a plain path passes through */', 'stubs');
run(read('live-quiz.js'), 'live-quiz.js');
run(read('live-changes.js'), 'live-changes.js');
const G = (expr) => vm.runInContext(expr, box);

const EARLY = G('LQ_CC_EARLY'), LATE = G('LQ_CC_LATE');
ok(EARLY === 0.1 && LATE === 0.5, `windows are EARLY 0.1 / LATE 0.5 (got ${EARLY} / ${LATE})`);
ok(G("lqType(lqQuiz('changes'))") === 'changes', "LIVE_QUIZZES['changes'] reads as type 'changes'");

const songs = G('LQ_CC_SONGS.map(x => x.id)');
let sections = 0, changesTotal = 0, minGap = Infinity;
for (const song of songs) {
  const n = G(`lqCcCard(${JSON.stringify(song)}).sections.length`);
  let songChanges = 0;
  for (let si = 0; si < n; si++) {
    sections++;
    const plan = G(`lqCcPlan(${JSON.stringify(song)}, ${si})`);
    const where = `${song} section ${si}`;
    if (!plan) { ok(false, `${where}: no plan`); continue; }
    const ch = plan.changes;
    songChanges += ch.length; changesTotal += ch.length;
    ok(ch.length > 0, `${where}: has chord changes`);
    ok(ch.every((t, i) => t >= plan.start - 0.011 && t < plan.end && (i === 0 || t > ch[i - 1])), `${where}: changes inside the section, in order`);
    for (let i = 1; i < ch.length; i++) minGap = Math.min(minGap, ch[i] - ch[i - 1]);
    ok(plan.from <= plan.start && plan.from >= 0, `${where}: the song starts at or before the section`);
    const cc = { start: plan.start, end: plan.end, changes: ch, cut: null };
    const score = presses => {
      const r = G(`lqCcMatch(lqCcCounted(${JSON.stringify(cc)}), ${JSON.stringify(presses)}, ${plan.start}, lqCcEnd(${JSON.stringify(cc)}))`);
      return { r, pts: G(`lqCcPoints(${JSON.stringify(r)}, ${ch.length})`), choice: G(`lqCcChoice(${JSON.stringify(r)})`) };
    };
    const good = score(ch.map(t => t + 0.25));
    ok(good.pts === 1000 && good.r.caught === ch.length && good.r.extra === 0, `${where}: pressing 0.25 s after every change scores 1000 (got ${good.pts}, ${JSON.stringify(good.r)})`);
    ok(good.choice.length <= 64 && JSON.stringify(G(`lqCcParse(${JSON.stringify(good.choice)})`)) === JSON.stringify(good.r), `${where}: the choice "${good.choice}" fits the rule and reads back`);
    const spam = []; for (let p = plan.from; p < plan.end + 1; p += 0.1) spam.push(p);
    ok(score(spam).pts === 0, `${where}: a press every 0.1 s scores 0 (got ${score(spam).pts})`);
    ok(score([]).pts === 0, `${where}: no press scores 0`);
    const c0 = ch[0];
    ok(score([c0 - 0.05]).r.caught === 1, `${where}: 0.05 s early counts`);
    ok(score([c0 - 0.15]).r.caught === 0, `${where}: 0.15 s early does not count`);
    ok(score([c0 + 0.5]).r.caught === 1, `${where}: 0.5 s after counts`);
    ok(score([c0 + 0.55]).r.caught === 0, `${where}: 0.55 s after does not count`);
    const twice = score([c0 + 0.1, c0 + 0.3]).r;
    ok(twice.caught === 1 && twice.extra === 1, `${where}: two presses on one change are one catch and one extra (${JSON.stringify(twice)})`);
    if (ch.length >= 2) {
      const cut = (ch[0] + ch[1]) / 2;
      ok(G(`lqCcCounted(${JSON.stringify(Object.assign({}, cc, { cut }))}).length`) === 1, `${where}: a Stop between the first two changes counts one`);
    }
  }
  console.log(`${song}: ${n} sections, ${songChanges} chord changes`);
}
/* The closest changes (Sweet Child's C D G bars, one beat each, about 0.47 s) have overlapping windows: one press
   must still catch one change only, and a press for each change, however late in its window, catches both. */
{
  let best = null;
  for (const song of songs) {
    const all = G(`lqCcChanges(${JSON.stringify(song)})`);
    for (let i = 1; i < all.length; i++) if (!best || all[i].t - all[i - 1].t < best.gap) best = { song, a: all[i - 1].t, b: all[i].t, gap: all[i].t - all[i - 1].t };
  }
  const m = presses => G(`lqCcMatch(${JSON.stringify([best.a, best.b])}, ${JSON.stringify(presses)}, ${best.a - 1}, ${best.b + 1})`);
  ok(best.gap > 0.4, `the closest two changes (${best.song}) are ${best.gap.toFixed(3)} s apart, more than 0.4 s`);
  ok(m([best.a + 0.45, best.b + 0.45]).caught === 2, 'two late presses on the closest pair catch both');
  ok(m([best.a + 0.05, best.b - 0.05]).caught === 2, 'an on-time press and a slightly early one on the closest pair catch both');
  const one = m([(best.a + best.b) / 2]);
  ok(one.caught === 1 && one.extra === 0, `one press between the closest pair catches one (${JSON.stringify(one)})`);
  ok(m([best.b + 0.2]).caught === 1, 'a press only for the second of the pair catches one');
}

/* End to end: one round, fake clocks. Database time = the console's clock + 0 (the console measured it); the
   Chromebook's own clock is 37 000 ms ahead of the database. */
{
  const plan = G(`lqCcPlan('all-along-the-watchtower', 1)`);
  const SKEW = 37000, T0 = 1_700_000_000_000;   // database ms of the file's 0:00
  const answers = [];
  run(`
    lqUid = () => 'uid-A'; lqName = () => 'Test 0'; lqCanPlayHere = () => true;
    lqWriteAnswer = (s, q, choice, ms) => { __answers.push({ uid: 'uid-A', name: 'Test 0', sessionId: s.sessionId, qIndex: q, choice, ms }); return Promise.resolve(); };
    lqRenderStudent = () => {};
  `, 'e2e-stubs');
  box.__answers = answers;
  const stamp = ms => ({ toMillis: () => ms });
  const base = { sessionId: 'lq-test', quizId: 'changes', state: 'question', qIndex: 0, startedAt: null, target: { song: 'all-along-the-watchtower', si: 1 }, limitSec: 0, scores: { 'uid-B': { pts: 500, right: 1, answered: 1, last: 500, lastRight: true, name: 'leak' } } };
  // Snapshots: each clk arrives late by a different delay (the smallest is 40 ms).
  const deliveries = [[T0 - 6000, 400], [T0 - 5500, 40], [T0 - 5000, 220], [T0 - 4000, 90]];
  let cc = { start: plan.start, end: plan.end, changes: plan.changes, t0: null, cut: null };
  for (const [clk, late] of deliveries) {
    perfNow = clk + late + SKEW;
    box.__doc = Object.assign({}, base, { cc: Object.assign({}, cc, { clk: stamp(clk) }) });
    run('lqSession = __doc; lqCcOnSession(__doc, __doc);', 'snap');
  }
  cc = Object.assign({}, cc, { t0: T0 });
  perfNow = T0 - 3000 + 120 + SKEW;
  box.__doc = Object.assign({}, base, { cc: Object.assign({}, cc, { clk: stamp(T0 - 3000) }) });
  run('lqSession = __doc; lqCcOnSession(__doc, __doc);', 'snap-t0');
  // Presses: 0.2 s after each change, on the Chromebook's clock (the event's own timeStamp).
  for (const c of plan.changes) run(`lqCcPress({ timeStamp: ${T0 + (c + 0.2) * 1000 + SKEW} });`, 'press');
  perfNow = T0 + plan.end * 1000 + 100 + SKEW;   // before the send moment: nothing yet
  run('lqCcTick();', 'tick1');
  ok(answers.length === 0, 'nothing is sent before the section ends');
  perfNow = T0 + plan.end * 1000 + 800 + SKEW;
  run('lqCcTick(); lqCcTick();', 'tick2');
  ok(answers.length === 1, `the result is sent once (got ${answers.length})`);
  const sent = answers[0] && G(`lqCcParse(${JSON.stringify(answers[0].choice)})`);
  // The 40 ms delivery delay makes each press read 40 ms early: 0.16 s after the change, still caught.
  ok(sent && sent.caught === plan.changes.length && sent.extra === 0, `a 37 s clock difference and 40-400 ms delays: caught ${sent && sent.caught} of ${plan.changes.length}, ${sent && sent.extra} extra`);
  // Reveal on the console.
  box.__answers2 = answers.slice();
  let written = null;
  run(`lqTAnswers = __answers2; lqTSession = Object.assign({}, __doc); lqWrite = (patch) => { __written(patch); return Promise.resolve(true); };`, 'console');
  box.__written = p => { written = p; };
  await G('lqTeacherRevealChanges()');
  const me = written && written.scores && written.scores['uid-A'];
  ok(!!me && me.pts === 1000 && me.last === 1000 && me.lastRight === true, `Reveal gives 1000 (got ${JSON.stringify(me)})`);
  ok(written && JSON.stringify(written.scores).indexOf('Test 0') < 0 && JSON.stringify(written.scores).indexOf('leak') < 0 && JSON.stringify(written.scores).indexOf('name') < 0, 'no name in the public scores');
  ok(written && written.tally && written.tally.caught === plan.changes.length && written.tally.players === 1, `the tally is class totals (${JSON.stringify(written && written.tally)})`);
  ok(written && written.scores['uid-B'] && written.scores['uid-B'].pts === 500 && written.scores['uid-B'].last === 0, 'a player who sent nothing keeps their points, +0 this round');
  // A student who over-reports caught is capped at the console's count.
  box.__answers2 = [{ uid: 'uid-C', name: 'Test 1', sessionId: 'lq-test', qIndex: 0, choice: 'cc:999/999/0', ms: 0 }];
  run('lqTAnswers = __answers2;', 'cap');
  await G('lqTeacherRevealChanges()');
  ok(written.scores['uid-C'].pts === 1000, `an over-reported caught is capped at 1000 (got ${written.scores['uid-C'].pts})`);
}

console.log(`live-changes-sim: ${sections} sections over ${songs.length} songs, ${changesTotal} chord changes; closest two ${minGap.toFixed(3)} s apart; ${cases - fails} of ${cases} cases pass`);
process.exit(fails ? 1 : 0);
