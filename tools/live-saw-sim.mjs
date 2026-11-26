#!/usr/bin/env node
/* tools/live-saw-sim.mjs — the "Saw chase" (live-saw.js), proved in Node on the REAL files.
   Run after any change to live-saw.js, its calls in live-quiz.js (`lqSawBandHtml`, `lqSawSwitchHtml`,
   `lqSawGoalInputHtml`, `lqStageRevealBodyHtml`) or a new Live game. About 1 s. Exit 1 = a case failed.
   checks.mjs 1fc runs it and pins its summary line.

   It loads i18n.js, live-quiz.js, live-changes.js and live-saw.js into one VM (DOM and storage stubbed) and checks:
     - EVERY game in LIVE_QUIZZES (8 today): the class's percent has a rule for its type, with a roster larger than the
       answers (students who did not answer count as wrong), and its Reveal stage carries the band and the caption;
     - the line: 699 of 1,000 (69.9%) gains, exactly 700 (70%) pulls ahead, another goal is used, blank / out of
       range / not a number falls back to 70;
     - the gap: starts at 3, +1 capped at 5, -1, 0 is a catch that goes back to 3, the ukulele is set by the first
       catch and kept by the next, a round with nobody in the game or an unknown type moves nothing;
     - once per round: the same Reveal painted 5 times moves the gap once; a second VM (a console reload) reading the
       same storage does not apply it again and draws the end position with no animation; a repaint inside the
       animation carries it on (a negative delay) and one after it draws none;
     - a new sessionId starts at 3, guitar;
     - the switch: off by default with empty storage, then the stage HTML is byte-for-byte lqStageRevealBodyHtml()'s,
       nothing moves and nothing is stored; turning it on while a Reveal shows marks that Reveal done with no move;
     - the band is on the Reveal only: lobby, question and ended stage HTML never carry it;
     - nothing is written: lqWrite and lqPreviewWrite are spies and are never called, and live-saw.js has no call to
       either and no Firestore word in it.
   Prints one summary line with denominators. */
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = f => readFileSync(join(ROOT, f), 'utf8');
let fails = 0, cases = 0;
const ok = (cond, msg) => { cases++; if (!cond) { fails++; console.log('  FAIL ' + msg); } };
const noop = () => {};

/* One VM per "page load". `store` is shared when a test wants a reload (the same device, a new page). */
function makeStore() { const m = new Map(); return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: k => { m.delete(k); }, _m: m }; }
function load(local, session) {
  const box = {
    console, Math, JSON, Date, Promise, Set, Map, Number, String, Array, Object, isFinite, URLSearchParams,
    setTimeout: noop, clearTimeout: noop, setInterval: () => 1, clearInterval: noop,
    addEventListener: noop, removeEventListener: noop,
    localStorage: local, sessionStorage: session,
    location: { search: '', hash: '', href: 'http://x/index.html' },
    performance: { timeOrigin: 0, now: () => 0 },
    document: { addEventListener: noop, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], createElement: () => ({ innerHTML: '', style: {}, classList: { add: noop, remove: noop, toggle: noop }, addEventListener: noop }), currentScript: null, body: {}, documentElement: {}, activeElement: null },
    fetch: () => Promise.reject(new Error('no network in the sim')),
  };
  box.window = box;
  vm.createContext(box);
  const run = (src, name) => vm.runInContext(src, box, { filename: name });
  run(read('i18n.js'), 'i18n.js');
  run('var escHtml = s => String(s); var escAttr = s => String(s);', 'stubs');
  run(read('live-quiz.js'), 'live-quiz.js');
  run(read('live-quiz-teacher.js'), 'live-quiz-teacher.js');
  run(read('live-changes.js'), 'live-changes.js');
  run(read('live-saw.js'), 'live-saw.js');
  run(`
    var __writes = [];
    lqWrite = function(){ __writes.push('lqWrite'); return Promise.resolve(true); };
    lqPreviewWrite = function(){ __writes.push('lqPreviewWrite'); return Promise.resolve(true); };
    lqPaintStage = function(){};
    lqPaintControls = function(){};
    var __clock = 1000000;
    lqSawNow = function(){ return __clock; };
  `, 'console-stubs');
  return { box, run, G: expr => vm.runInContext(expr, box) };
}

/* ── A Reveal doc for a quiz, with `inGame` students in the game and `right` of them right ── */
function revealFor(P, quizId, sessionId, qIndex, inGame, right) {
  const q = P.G(`JSON.parse(JSON.stringify(LIVE_QUIZZES[${JSON.stringify(quizId)}]))`);
  const type = P.G(`lqType(LIVE_QUIZZES[${JSON.stringify(quizId)}])`);
  const answers = [];
  for (let i = 0; i < inGame; i++) answers.push({ uid: 'u' + i, name: 'Test ' + i, sessionId, qIndex, choice: 'x', ms: 900 });
  P.box.__answers = answers;
  P.run('lqTAnswers = __answers;', 'answers');
  const s = { sessionId, quizId, state: 'reveal', qIndex, totalQ: 10, scores: {}, target: null };
  const wrong = Math.max(0, Math.floor((inGame - right) / 2));   // some wrong, the rest sat it out
  if (type === 'changes') {
    s.cc = { changes: [1, 2, 3, 4, 5], end: 20, start: 0 };
    s.tally = { caught: right * 5, changes: 5 * inGame, extra: 0, players: inGame };   // `right` students caught all 5; the rest sent nothing or 0
  } else if (type === 'fret') {
    s.correctIds = ['A:3']; s.correct = null; s.target = { string: 'A', note: 'C' };
    s.tally = { 'A:3': right, 'A:5': wrong };
  } else if (type === 'pcname') {
    s.correct = 'E5'; s.target = { string: 'lowE', fret: 0 };
    s.tally = { E5: right, A5: wrong };
  } else {
    s.correct = q.choices[0].id;
    s.tally = { [q.choices[0].id]: right, [q.choices[1].id]: wrong };
  }
  return { s, type };
}
const pct = (P, s, quizId) => P.G(`(function(){ var p = lqSawPercent(${JSON.stringify(s)}, lqQuiz(${JSON.stringify(quizId)})); return { known: p.known, right: p.right, denom: p.denom, shown: p.shown }; })()`);
const stageHtml = (P, s, quizId) => P.G(`lqStageRevealHtml(${JSON.stringify(s)}, lqQuiz(${JSON.stringify(quizId)}))`);
const bodyHtml = (P, s, quizId) => P.G(`lqStageRevealBodyHtml(${JSON.stringify(s)}, lqQuiz(${JSON.stringify(quizId)}))`);
const state = P => P.G('lqSawState({ sessionId: __sid })');

/* ── Every game has a rule ── */
const P0 = load(makeStore(), makeStore());
const ids = P0.G('Object.keys(LIVE_QUIZZES)');
const shapes = new Set();
let walked = 0;
for (const id of ids) {
  const { s, type } = revealFor(P0, id, 'walk-' + id, 0, 10, 4);   // 10 in the game, 4 right, the others wrong or silent
  shapes.add(type);
  const p = pct(P0, s, id);
  ok(p.known, `${id}: a percent rule exists for its type '${type}' (a new type needs one in lqSawPercent)`);
  ok(p.denom === 10 || (type === 'changes' && p.denom === 50), `${id}: the denominator is everyone in the game (${p.denom})`);
  ok(p.right === 4 || (type === 'changes' && p.right === 20), `${id}: ${p.right} right counted`);
  ok(p.shown === 40, `${id}: 4 of 10 in the game shows as 40% even though not everyone answered (${p.shown})`);
  P0.run('lqTSawOn = true;', 'on');
  const html = stageHtml(P0, s, id);
  ok(html.includes('id="lq-saw"') && html.includes('<svg') && html.includes('40% of the class · goal 70%'), `${id}: the Reveal stage carries the band and the caption`);
  ok(html.startsWith(bodyHtml(P0, s, id)), `${id}: the Reveal's own HTML is untouched, the band comes after it`);
  // A fret Reveal is the tallest: its band sits in the free space under the board (inside .lq-st-boardcol, before the tally and the Top 3), so the stage keeps its height; every other Reveal has it last.
  if (type === 'fret') ok(html.indexOf('lq-st-boardcol') >= 0 && html.indexOf('lq-st-boardcol') < html.indexOf('id="lq-saw"') && html.indexOf('id="lq-saw"') < html.indexOf('lq-lb-stage'), `${id}: the band sits under the board, before the Top 3`);
  else ok(html.lastIndexOf('lq-saw') > html.lastIndexOf('lq-lb-stage') || !html.includes('lq-lb-stage'), `${id}: the band comes after the Reveal's own HTML`);
  walked++;
}
ok(walked === ids.length && ids.length >= 8, `walked every game in LIVE_QUIZZES (${walked} of ${ids.length}; 8 today)`);
ok(['mc', 'fret', 'pcname', 'changes'].every(t => shapes.has(t)), `all four Reveal shapes were walked (${[...shapes].join(', ')})`);

/* ── The line ── */
{
  const P = load(makeStore(), makeStore());
  P.run('lqTSawOn = true;', 'on');
  const at = (right, goal) => { const sid = 'line-' + right + '-' + goal; P.box.__sid = sid; const { s } = revealFor(P, 'string-id', sid, 0, 1000, right); P.run(`lqTSawGoal = ${goal};`, 'goal'); stageHtml(P, s, 'string-id'); return P.G(`lqSawState({ sessionId: ${JSON.stringify(sid)} })`); };
  let st = at(699, 70); ok(st.gap === 2 && st.moves[0].k === 'gain', `699 of 1000 (69.9%) at goal 70: the saw gains (gap ${st.gap}, ${st.moves[0].k})`);
  st = at(700, 70); ok(st.gap === 4 && st.moves[0].k === 'pull', `700 of 1000 (exactly 70%) at goal 70: the guitar pulls ahead (gap ${st.gap}, ${st.moves[0].k})`);
  st = at(700, 75); ok(st.moves[0].k === 'gain', `700 of 1000 at goal 75: the saw gains (${st.moves[0].k})`);
  st = at(699, 69); ok(st.moves[0].k === 'pull', `699 of 1000 at goal 69: the guitar pulls ahead (${st.moves[0].k})`);
  st = at(1000, 100); ok(st.moves[0].k === 'pull', 'everyone right at goal 100: pulls ahead');
  st = at(999, 100); ok(st.moves[0].k === 'gain', '999 of 1000 at goal 100: gains');
  const clean = v => P.G(`lqSawCleanGoal(${JSON.stringify(v)})`);
  const cases2 = [['', 70], [null, 70], ['abc', 70], [0, 70], [101, 70], [-5, 70], ['85', 85], [72.4, 72], [1, 1], [100, 100]];
  cases2.forEach(([v, want]) => ok(clean(v) === want, `goal ${JSON.stringify(v)} cleans to ${want} (got ${clean(v)})`));
}

/* ── The gap rules (lqSawMove on a bare state) ── */
{
  const P = load(makeStore(), makeStore());
  const mv = (st, right, denom, goal, known = true) => P.G(`(function(){ var st = ${JSON.stringify(st)}; var m = lqSawMove(st, { known: ${known}, right: ${right}, denom: ${denom}, shown: ${denom ? Math.round(100 * right / denom) : 0} }, ${goal}); return { st: st, m: m }; })()`);
  let st = { gap: 3, uke: false }, r;
  const seq = [];
  for (let i = 0; i < 4; i++) { r = mv(st, 10, 10, 70); st = r.st; seq.push(st.gap); }
  ok(JSON.stringify(seq) === '[4,5,5,5]', `hits go 3 to 4 to 5 and stay at 5 (${seq})`);
  const down = [];
  for (let i = 0; i < 4; i++) { r = mv(st, 0, 10, 70); st = r.st; down.push(r.m.k + ':' + st.gap); }
  ok(JSON.stringify(down) === '["gain:4","gain:3","gain:2","gain:1"]', `misses go 5 down to 1 (${down})`);
  r = mv(st, 0, 10, 70); st = r.st;
  ok(r.m.k === 'catch' && st.gap === 3 && st.uke === true && r.m.swap === true, `the miss at 1 is a catch: gap back to 3, the ukulele set (${r.m.k}, gap ${st.gap}, uke ${st.uke}, swap ${r.m.swap})`);
  st.gap = 1; r = mv(st, 0, 10, 70); st = r.st;
  ok(r.m.k === 'catch' && st.gap === 3 && st.uke === true && r.m.swap === false, `a later catch keeps the ukulele and does not swap again (${r.m.k}, uke ${st.uke}, swap ${r.m.swap})`);
  r = mv({ gap: 2, uke: false }, 0, 0, 70); ok(r.m.k === 'none' && r.st.gap === 2, 'nobody in the game: nothing moves');
  r = mv({ gap: 2, uke: false }, 0, 10, 70, false); ok(r.m.k === 'none' && r.st.gap === 2, 'a type with no rule: nothing moves');
}

/* ── Once per round, and a reload ── */
{
  const local = makeStore(), session = makeStore();
  const P = load(local, session);
  P.run('lqSawSetOn(true);', 'on');   // kept on the device, so a reload reads it back
  P.box.__sid = 'once';
  const { s } = revealFor(P, 'string-id', 'once', 0, 10, 2);   // 20%: a miss
  const h = [];
  for (let i = 0; i < 5; i++) h.push(stageHtml(P, s, 'string-id'));
  ok(state(P).gap === 2 && state(P).doneQ.length === 1, `the same Reveal painted 5 times moves the gap once (gap ${state(P).gap}, ${state(P).doneQ.length} round done)`);
  ok(/lq-saw-a-gain/.test(h[0]) && /--d:0\.000s/.test(h[0]), 'the first paint starts the gain animation');
  P.run('__clock += 700;', 'tick');
  const mid = stageHtml(P, s, 'string-id');
  ok(/lq-saw-a-gain/.test(mid) && /--d:-0\.700s/.test(mid), 'a repaint 0.7 s in carries the animation on (negative delay -0.7 s)');
  P.run('__clock += 5000;', 'tick');
  const end = stageHtml(P, s, 'string-id');
  ok(!/lq-saw-a-/.test(end) && /--g:2/.test(end), 'a repaint after it ends draws the end position with no animation');
  // A reload: a new page on the same device and tab.
  const Q = load(local, session);
  Q.box.__sid = 'once';
  ok(Q.G('lqTSawOn') === true, 'the switch survives a reload (kept on the device)');
  const again = stageHtml(Q, s, 'string-id');
  ok(state(Q).gap === 2 && state(Q).doneQ.length === 1, `a reload does not apply the round again (gap ${state(Q).gap})`);
  ok(!/lq-saw-a-/.test(again) && /--g:2/.test(again), 'and draws the end position with no animation');
  // The next round.
  const r1 = revealFor(Q, 'string-id', 'once', 1, 10, 9).s;
  const h1 = stageHtml(Q, r1, 'string-id');
  ok(state(Q).gap === 3 && /lq-saw-a-pull/.test(h1), `the next round (90%) moves it once, a pull (gap ${state(Q).gap})`);
  // A new game starts fresh.
  Q.box.__sid = 'other-game';
  const r2 = revealFor(Q, 'string-id', 'other-game', 0, 10, 9).s;
  stageHtml(Q, r2, 'string-id');
  const fresh = Q.G('lqSawState({ sessionId: "other-game" })');
  ok(fresh.gap === 4 && fresh.uke === false && fresh.doneQ.length === 1, `a new sessionId starts at 3 with the guitar, then moves once (gap ${fresh.gap})`);
  // A catch, then the ukulele in the picture.
  Q.box.__sid = 'catchy';
  let last = '';
  for (let q = 0; q < 3; q++) { const rv = revealFor(Q, 'string-id', 'catchy', q, 10, 0).s; last = stageHtml(Q, rv, 'string-id'); }
  const cs = Q.G('lqSawState({ sessionId: "catchy" })');
  ok(cs.gap === 3 && cs.uke === true && /lq-saw-a-catch/.test(last) && /lq-saw-swap/.test(last) && /lq-saw-uke/.test(last), `three misses from 3 is a catch: the swap animation, then the ukulele (gap ${cs.gap}, uke ${cs.uke})`);
  ok(/class="lq-saw-chips"/.test(last), 'a catch draws the wood chips');
}

/* ── The switch ── */
{
  const local = makeStore(), session = makeStore();
  const P = load(local, session);
  ok(P.G('lqTSawOn') === false, 'the switch is OFF with empty storage');
  P.box.__sid = 'off';
  const { s } = revealFor(P, 'string-id', 'off', 0, 10, 2);
  const withOff = stageHtml(P, s, 'string-id'), base = bodyHtml(P, s, 'string-id');
  ok(withOff === base && !withOff.includes('lq-saw'), 'switch off: the Reveal stage is byte-for-byte what it was, with no band');
  { // The same for a fret Reveal: the extra column wrapper is drawn only with a band.
    const f = revealFor(P, 'fret-lowE', 'off', 0, 10, 2).s;
    const fh = stageHtml(P, f, 'fret-lowE');
    ok(!fh.includes('lq-saw') && !fh.includes('lq-st-boardcol'), 'switch off: a fret Reveal has neither the band nor its column wrapper');
  }
  ok(session.getItem('gc-lq-sawchase-state') === null, 'switch off: nothing is stored and nothing moves');
  const p = P.G('lqSawGoalInputHtml()'); ok(p === '', 'the goal box is hidden while the switch is off');
  ok(/id="lq-sawchase"/.test(P.G('lqSawSwitchHtml()')) && !/ checked/.test(P.G('lqSawSwitchHtml()')), 'the switch checkbox is drawn unticked');
  // Turn it on while a Reveal is showing: that round is done without a move.
  P.run(`lqTSession = ${JSON.stringify(s)};`, 'session');
  P.run('lqSawSetOn(true);', 'turn-on');
  ok(local.getItem('gc-lq-sawchase') === '1', 'ticking the switch is kept on the device');
  ok(/id="lq-sawgoal"/.test(P.G('lqSawGoalInputHtml()')) && /value="70"/.test(P.G('lqSawGoalInputHtml()')), 'the goal box shows, 70 by default');
  const on = stageHtml(P, s, 'string-id');
  ok(P.G('lqSawState({ sessionId: "off" })').gap === 3 && on.includes('lq-saw') && !/lq-saw-a-/.test(on), 'turned on during a Reveal: that round moved nothing and draws still');
  P.run('lqSawSetGoal("85");', 'goal');
  ok(local.getItem('gc-lq-sawgoal') === '85' && P.G('lqTSawGoal') === 85, 'the goal is kept on the device');
  P.run('lqSawSetOn(false);', 'turn-off');
  ok(!stageHtml(P, s, 'string-id').includes('lq-saw') && local.getItem('gc-lq-sawchase') === '0', 'turning it off takes the band away');
}

/* ── Only the Reveal; and nothing written ── */
{
  const P = load(makeStore(), makeStore());
  P.run('lqTSawOn = true;', 'on');
  P.box.__sid = 'states';
  const { s } = revealFor(P, 'string-id', 'states', 0, 10, 2);
  const lobby = P.G(`lqStageLobbyHtml(${JSON.stringify(Object.assign({}, s, { state: 'lobby' }))}, lqQuiz('string-id'))`);
  const question = P.G(`lqStageQuestionHtml(${JSON.stringify(Object.assign({}, s, { state: 'question' }))}, lqQuiz('string-id'))`);
  const ended = P.G(`lqStageEndedHtml(${JSON.stringify(Object.assign({}, s, { state: 'ended' }))})`);
  ok(![lobby, question, ended].some(h => h.includes('lq-saw')), 'lobby, an open question and the final scores never carry the band');
  for (let i = 0; i < 5; i++) stageHtml(P, s, 'string-id');
  P.run('lqSawSetOn(false); lqSawSetOn(true); lqSawSetGoal("60");', 'toggles');
  ok(P.G('__writes.length') === 0, `lqWrite and lqPreviewWrite were never called (${P.G('__writes.length')} calls)`);
  const src = read('live-saw.js').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  ok(!/\blqWrite\s*\(|\blqPreviewWrite\s*\(|firestore|\.set\(|\.update\(|lqDoc\s*\(|lqEnsureDb/i.test(src), 'live-saw.js has no call to a writer and no Firestore word in it');
  ok(!/lqRenderStudent|lqStudent/.test(src), 'live-saw.js never touches the student screen');
}

console.log(`live-saw-sim: ${walked} games, 4 reveal shapes; ${cases - fails} of ${cases} cases pass`);
process.exit(fails ? 1 : 0);
