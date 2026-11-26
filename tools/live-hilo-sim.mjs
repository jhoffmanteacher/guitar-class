#!/usr/bin/env node
/* tools/live-hilo-sim.mjs — "Higher or lower?" (live-hilo.js), proved in Node on the REAL files.
   Run after any change to live-hilo.js, its branches in live-quiz.js (`hilo`), the piano files in
   vendor/salamander-piano/ or the lq.*.hilo strings. About 1 s. Exit 1 = a case failed. checks.mjs 1ez runs it.

   It loads live-quiz.js and live-hilo.js into one VM (DOM and AudioContext stubbed) and checks:
     - the bank: exactly one quiz carries `hilo`, its two choices are higher / lower, flat scoring, `quiet`;
     - the picker, for every level, over 5,000 rounds each on a seeded random source: both notes inside C3 to C6,
       the jump is a size of that level, the direction matches, no size repeats within the last two rounds (the last
       one on Close, which has only two sizes), never four rounds the same way, and every size and both directions
       turn up;
     - the 14 piano files exist, are mp3 and are big enough to be recordings, and every note C3 to C6 is within a
       semitone and a half of one of them (the most a note may be bent);
     - playing a pair: two notes, each from the NEAREST recording, played at the rate that makes it the asked note,
       the second after the first; Stop cuts everything; a new Play cuts the old one first; with no recordings the
       backup tone still plays;
     - the console's round: Play the notes opens the next question with `target` null and NO note in the written
       patch (the doc is public), the pair is in memory before the write, Reveal marks 'higher' / 'lower' from it
       and scores through the real lqScoreRound (1000 each, no name in the public scores), a round the console has no
       pair for does nothing at Reveal and the strip falls back to the mark buttons, a game that Cancel / End / Clear
       closed while the piano loaded stays closed, and a second press while one is opening does nothing;
     - the strip: lobby and "next" show the four level chips and Play the notes, an open question shows Play again
       and Reveal, and nothing in them names a note or an answer.
   Prints one summary line with denominators. */
import vm from 'node:vm';
import { readFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = f => readFileSync(join(ROOT, f), 'utf8');
let fails = 0, cases = 0;
const ok = (cond, msg) => { cases++; if (!cond) { fails++; console.log('  FAIL ' + msg); } };

const noop = () => {};
let controlsEl = { innerHTML: '' };
const el = () => ({ innerHTML: '', textContent: '', classList: { add: noop, remove: noop, toggle: noop }, style: {}, addEventListener: noop, querySelector: () => null, querySelectorAll: () => [] });

/* A fake AudioContext that writes down what the game schedules. */
const audio = { ctxs: 0, sources: [], gains: [], oscs: [] };
class FakeParam {
  constructor() { this.value = 0; this.calls = []; }
  setValueAtTime(v, t) { this.calls.push(['set', v, t]); return this; }
  linearRampToValueAtTime(v, t) { this.calls.push(['ramp', v, t]); return this; }
  exponentialRampToValueAtTime(v, t) { this.calls.push(['exp', v, t]); return this; }
  cancelScheduledValues() { this.calls.push(['cancel']); return this; }
}
class FakeNode { constructor() { this.connected = []; } connect(n) { this.connected.push(n); return n; } }
class FakeCtx {
  constructor() { audio.ctxs++; this.currentTime = 10; this.state = 'suspended'; this.destination = new FakeNode(); this.resumed = 0; }
  resume() { this.resumed++; this.state = 'running'; }
  createGain() { const g = new FakeNode(); g.gain = new FakeParam(); audio.gains.push(g); return g; }
  createBufferSource() {
    const s = new FakeNode(); s.playbackRate = { value: 1 }; s.started = null; s.stopped = null;
    s.start = t => { s.started = t; }; s.stop = t => { s.stopped = t; };
    audio.sources.push(s); return s;
  }
  createOscillator() {
    const o = new FakeNode(); o.frequency = { value: 0 }; o.started = null; o.stopped = null;
    o.start = t => { o.started = t; }; o.stop = t => { o.stopped = t; };
    audio.oscs.push(o); return o;
  }
}
const box = {
  console, Math, JSON, Date, Promise, Set, Map, Number, String, Array, Object, isFinite, URLSearchParams,
  setTimeout: noop, clearTimeout: noop, setInterval: () => 1, clearInterval: noop,
  addEventListener: noop, removeEventListener: noop,
  localStorage: { getItem: () => null, setItem: noop }, sessionStorage: { getItem: () => null, setItem: noop },
  location: { search: '', hash: '', href: 'http://x/index.html' },
  performance: { timeOrigin: 0, now: () => 0 },
  document: { addEventListener: noop, getElementById: id => (id === 'lq-controls' ? controlsEl : null), querySelector: () => null, querySelectorAll: () => [], createElement: el, currentScript: null, body: el(), documentElement: el(), activeElement: null },
  AudioContext: FakeCtx,
  fetch: () => Promise.reject(new Error('no network in the sim')),
};
box.window = box;
vm.createContext(box);
const run = (src, name) => vm.runInContext(src, box, { filename: name });
run(read('i18n.js'), 'i18n.js');
run('var escHtml = s => String(s); var escAttr = s => String(s);', 'stubs');
run(read('live-quiz.js'), 'live-quiz.js');
run(read('live-quiz-teacher.js'), 'live-quiz-teacher.js');
run(read('live-hilo.js'), 'live-hilo.js');
const G = expr => vm.runInContext(expr, box);

/* ── The bank ── */
{
  const ids = G('Object.keys(LIVE_QUIZZES).filter(k => LIVE_QUIZZES[k].hilo)');
  ok(ids.length === 1 && ids[0] === 'hilo', `exactly one quiz carries hilo, and it is 'hilo' (got ${JSON.stringify(ids)})`);
  const q = G("JSON.parse(JSON.stringify(LIVE_QUIZZES['hilo']))");
  ok(JSON.stringify(q.choices.map(c => c.id)) === '["higher","lower"]', `choices are higher, lower in that order (got ${JSON.stringify(q.choices && q.choices.map(c => c.id))})`);
  ok(q.speedBonus === false && q.quiet === true && !q.limitSec, 'flat scoring, quiet (the music fades), no time limit by default');
  ok(G("lqType(lqQuiz('hilo'))") === 'mc', "the student screen and the stage treat it as a plain two-choice quiz (lqType 'mc')");
  ok(G("lqDefaultScoring('hilo')") === 'flat', 'its Scoring dropdown defaults to flat');
  ok(G("lqAutoRevealInputHtml('hilo')").includes('lq-autoreveal') && G("lqAutoRevealInputHtml('string-id')") === '', 'the "Reveal when time runs out" box is on for hilo and still off for the teacher-marked quiz');
  ok(G("tIn(LIVE_QUIZZES['hilo'].promptKey, 'es')").includes('aguda') && G("tIn(LIVE_QUIZZES['hilo'].choices[0].key, 'es')") === 'Más aguda', 'the Spanish prompt and choice read');
}

/* ── The picker ── */
function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
box.__rand = null;
let pairsTotal = 0;
for (const level of ['mixed', 'close', 'medium', 'wide']) {
  const sizes = G(`lqHlSizes(${JSON.stringify(level)})`);
  const items = [];
  box.__rand = mulberry(level.length * 7919 + 13);
  const seenSize = new Set(), seenDir = new Set();
  let badRange = 0, badSize = 0, badDir = 0, repeat2 = 0, run4 = 0;
  for (let i = 0; i < 5000; i++) {
    const p = G(`lqHlPick(${JSON.stringify(level)}, ${JSON.stringify(items.slice(-3))}, __rand)`);
    pairsTotal++;
    if (p.a < 48 || p.a > 84 || p.b < 48 || p.b > 84) badRange++;
    if (!sizes.includes(Math.abs(p.b - p.a)) || p.size !== Math.abs(p.b - p.a)) badSize++;
    if (Math.sign(p.b - p.a) !== p.dir) badDir++;
    const lastN = items.slice(-(sizes.length > 2 ? 2 : 1)).map(x => x.size);
    if (lastN.includes(p.size)) repeat2++;
    const last3 = items.slice(-3).map(x => x.dir);
    if (last3.length === 3 && last3.every(d => d === last3[0]) && p.dir === last3[0]) run4++;
    seenSize.add(p.size); seenDir.add(p.dir);
    items.push({ size: p.size, dir: p.dir });
  }
  ok(badRange === 0, `${level}: 5000 of 5000 pairs inside C3 to C6 (${badRange} outside)`);
  ok(badSize === 0, `${level}: every jump is one of its sizes ${sizes[0]}-${sizes[sizes.length - 1]} (${badSize} not)`);
  ok(badDir === 0, `${level}: the direction field matches the notes (${badDir} not)`);
  ok(repeat2 === 0, `${level}: no size repeats within its last ${sizes.length > 2 ? 'two rounds' : 'round'} (${repeat2} did)`);
  ok(run4 === 0, `${level}: never four rounds the same way (${run4} did)`);
  ok(seenSize.size === sizes.length && seenDir.size === 2, `${level}: all ${sizes.length} sizes and both directions turn up (${seenSize.size}, ${seenDir.size})`);
}
{
  /* The extremes: a 12-semitone jump up must start in the low octave and one down in the high one; the lowest and
     highest notes can both be reached. */
  box.__rand = mulberry(99);
  const items = [];
  let min = 999, max = 0;
  for (let i = 0; i < 20000; i++) { const p = G(`lqHlPick('mixed', ${JSON.stringify(items.slice(-3))}, __rand)`); min = Math.min(min, p.a, p.b); max = Math.max(max, p.a, p.b); items.push({ size: p.size, dir: p.dir }); }
  ok(min === 48 && max === 84, `the whole range C3 (48) to C6 (84) is reachable (got ${min} to ${max})`);
}

/* ── The piano files ── */
const samples = G('LQ_HL_SAMPLES.map(x => x.slice())');
{
  let good = 0;
  for (const [name] of samples) {
    const f = join(ROOT, 'vendor', 'salamander-piano', name + '.mp3');
    let size = 0, head = '';
    try { size = statSync(f).size; head = readFileSync(f).subarray(0, 3).toString('latin1'); } catch (e) { /* missing */ }
    const isMp3 = head === 'ID3' || (size > 2 && readFileSync(f)[0] === 0xFF);
    if (size > 10000 && isMp3) good++; else console.log('  bad piano file: ' + name);
  }
  ok(good === samples.length && samples.length === 14, `${good} of ${samples.length} piano files are mp3 recordings over 10 KB`);
  let far = 0;
  for (let n = 48; n <= 84; n++) if (Math.min(...samples.map(([, m]) => Math.abs(m - n))) > 1.5) far++;
  ok(far === 0, `every note C3 to C6 (37 notes) is within a semitone and a half of a recording (${far} are not)`);
  ok(readFileSync(join(ROOT, 'vendor', 'salamander-piano', 'README.txt'), 'utf8').includes('CC BY 3.0'), 'the credit file is there');
}

/* ── Playing a pair ── */
{
  run('lqHlBuffers = LQ_HL_SAMPLES.map(([n, m]) => ({ midi: m, buf: { name: n } }));', 'buffers');
  const playPair = (a, b) => {
    audio.sources.length = 0; audio.gains.length = 0; audio.oscs.length = 0;
    G(`lqHlPlay(${a}, ${b})`);
    return audio.sources.slice();
  };
  let wrongSample = 0, wrongRate = 0, order = 0, played = 0;
  for (let a = 48; a <= 84; a++) {
    for (const b of [a + 1, a - 1, a + 7, a - 12, a + 12]) {
      if (b < 48 || b > 84) continue;
      const s = playPair(a, b);
      played++;
      if (s.length !== 2) { wrongSample++; continue; }
      [a, b].forEach((n, i) => {
        const near = Math.min(...samples.map(([, m]) => Math.abs(m - n)));
        const used = samples.find(([name]) => name === s[i].buffer.name)[1];
        if (Math.abs(used - n) !== near) wrongSample++;
        const heard = used + 12 * Math.log2(s[i].playbackRate.value);
        if (Math.abs(heard - n) > 1e-9) wrongRate++;
      });
      if (!(s[1].started > s[0].started)) order++;
    }
  }
  ok(wrongSample === 0, `${played} pairs: each note comes from the nearest recording (${wrongSample} wrong)`);
  ok(wrongRate === 0, `${played} pairs: each note's playback rate gives exactly the asked pitch (${wrongRate} wrong)`);
  ok(order === 0, `${played} pairs: the second note starts after the first (${order} did not)`);
  {
    const s = playPair(60, 67);
    const lead = G('LQ_HL_LEAD');
    ok(Math.abs(s[0].started - (10 + lead)) < 1e-9 && s[1].started - s[0].started > 1.4, `the first note starts ${lead} s after Play (the music's fade), the second ${(s[1].started - s[0].started).toFixed(2)} s later`);
    ok(G('lqHlSources.length') === 2, 'two notes are sounding');
    G('lqHlStopAudio()');
    ok(G('lqHlSources.length') === 0 && s.every(x => x.stopped !== null && x.stopped < 10.1), 'Stop cuts both within a tenth of a second');
    const first = playPair(60, 67);
    const second = playPair(62, 65);
    ok(first.every(x => x.stopped !== null && x.stopped < 10.1), 'a new Play cuts the one still sounding first');
    ok(second.length === 2 && G('lqHlSources.length') === 2, 'and plays its own two notes');
    ok(audio.ctxs === 1, `one AudioContext for the whole game (${audio.ctxs})`);
  }
  // Backup tone: no recordings loaded.
  run('lqHlBuffers = null;', 'nobuffers');
  audio.oscs.length = 0; audio.sources.length = 0;
  G('lqHlPlay(60, 67)');
  ok(audio.sources.length === 0 && audio.oscs.length === 10, `with no recordings, a backup tone plays both notes (${audio.oscs.length} partials)`);
  ok(Math.abs(audio.oscs[0].frequency.value - 261.6256) < 0.01 && Math.abs(audio.oscs[5].frequency.value - 391.9954) < 0.01, 'at the right pitches (C4 261.63 Hz, G4 392.00 Hz)');
  G('lqHlStopAudio()');
  run('lqHlBuffers = LQ_HL_SAMPLES.map(([n, m]) => ({ midi: m, buf: { name: n } }));', 'buffers2');
}

/* ── The console's round ── */
const written = [];
run(`
  lqTBusy = false;
  lqHlLoad = () => Promise.resolve(true);
  lqWrite = (patch, replace) => { __written.push({ patch, replace }); return Promise.resolve(true); };
  lqPaintControls = () => {};
`, 'console-stubs');
box.__written = written;
const NO_NAME = 'Test Student 0';
{
  // Play the notes: opens question 0 with target null and no note anywhere in the patch.
  run(`lqTSession = { sessionId: 'lq-t1', quizId: 'hilo', state: 'lobby', qIndex: -1, totalQ: 10, scores: {}, limitSec: 0 }; lqHlRound = null; lqHlHist = { sessionId: null, items: [] };`, 'lobby');
  box.firebase = { firestore: { FieldValue: { serverTimestamp: () => ({ __ts: true }) } } };
  let keyDuring = null;
  run('var __seenRound = null; var __realNext = lqTeacherNext; lqTeacherNext = function(){ __seenRound = lqHlRound && lqHlRound.key; return __realNext.apply(this, arguments); };', 'spy');
  audio.sources.length = 0;
  await G('lqTeacherOpenHilo()');
  ok(written.length === 1 && written[0].patch.state === 'question' && written[0].patch.qIndex === 0, 'Play the notes writes question 0');
  const patch = written[0].patch;
  ok(patch.target === null, 'the written doc has no target');
  ok(!/"(a|b|notes|pair|midi)"/.test(JSON.stringify(patch)) && !('a' in patch) && !('b' in patch), `no note in the public doc (${Object.keys(patch).join(', ')})`);
  ok(G('__seenRound') === 'lq-t1#0', `the pair is in memory before the write (${G('__seenRound')})`);
  ok(audio.sources.length === 2, 'and the two notes play');
  const pair = G('({ a: lqHlRound.a, b: lqHlRound.b })');
  ok(pair.a >= 48 && pair.b <= 84 && pair.a !== pair.b, `the kept pair is two different notes inside the range (${pair.a}, ${pair.b})`);
  ok(G("lqHlHist.items.length") === 1 && G('lqHlHist.sessionId') === 'lq-t1', 'the round is on the history');

  // A second press while one is opening does nothing.
  written.length = 0;
  run(`lqTSession = Object.assign({}, lqTSession, { state: 'reveal', qIndex: 0 });`, 'reveal0');
  const p1 = G('lqTeacherOpenHilo()'), p2 = G('lqTeacherOpenHilo()');
  await Promise.all([p1, p2]);
  ok(written.length === 1 && written[0].patch.qIndex === 1, `two quick presses open one question (${written.length} writes)`);

  // The last question: no more.
  written.length = 0;
  run(`lqTSession = Object.assign({}, lqTSession, { state: 'reveal', qIndex: 9 });`, 'last');
  await G('lqTeacherOpenHilo()');
  ok(written.length === 0, 'after the last of 10 questions it opens nothing');

  // A failed write forgets the pair.
  run(`lqTSession = Object.assign({}, lqTSession, { state: 'reveal', qIndex: 2 }); lqWrite = () => Promise.resolve(false);`, 'failwrite');
  await G('lqTeacherOpenHilo()');
  ok(G('lqHlRound') === null, 'a write that fails leaves no pair behind');
  run(`lqWrite = (patch, replace) => { __written.push({ patch, replace }); return Promise.resolve(true); };`, 'restore');

  // Cancel / End / Clear pressed while the piano loads: the game keeps its sessionId, so only its state says it closed.
  for (const [from, closed] of [['lobby', 'off'], ['reveal', 'ended'], ['reveal', 'off']]) {
    written.length = 0;
    run(`lqTSession = Object.assign({}, lqTSession, { state: '${from}', qIndex: ${from === 'lobby' ? -1 : 2} }); lqHlRound = null;
      var __loaded; lqHlLoad = () => new Promise(res => { __loaded = res; });`, 'slowload');
    const p = G('lqTeacherOpenHilo()');
    run(`lqTSession = Object.assign({}, lqTSession, { state: '${closed}' }); __loaded(true);`, 'closed-meanwhile');
    await p;
    ok(written.length === 0 && G('lqHlRound') === null, `a game closed (${from} -> ${closed}) while the piano loads stays closed (${written.length} writes)`);
  }
  run(`lqHlLoad = () => Promise.resolve(true);`, 'fastload');
}
{
  // Reveal.
  const answer = (uid, choice, q) => ({ uid, name: NO_NAME + uid, sessionId: 'lq-t2', qIndex: q, choice, ms: 900 });
  const reveal = async (a, b, answers) => {
    written.length = 0;
    box.__answers = answers;
    run(`lqTSession = { sessionId: 'lq-t2', quizId: 'hilo', state: 'question', qIndex: 3, totalQ: 10, speedBonus: false, scores: { 'u-old': { pts: 2000, right: 2, answered: 3, last: 1000, lastRight: true } } }; lqTAnswers = __answers; lqHlRound = { key: 'lq-t2#3', a: ${a}, b: ${b} };`, 'reveal-setup');
    await G('lqTeacherRevealHilo()');
    return written[0] && written[0].patch;
  };
  const rows = [answer('u1', 'higher', 3), answer('u2', 'lower', 3), answer('u3', 'higher', 3), answer('u4', 'higher', 2) /* an old round's doc */, answer('u5', 'sideways', 3)];
  let p = await reveal(60, 67, rows);
  ok(p && p.state === 'reveal' && p.correct === 'higher', `60 then 67 reveals 'higher' (got ${p && p.correct})`);
  ok(p && p.tally.higher === 2 && p.tally.lower === 1 && Object.keys(p.tally).length === 2, `tally: 2 higher, 1 lower, nothing for a stray answer or an old round (${JSON.stringify(p && p.tally)})`);
  ok(p && p.scores.u1.pts === 1000 && p.scores.u3.pts === 1000 && p.scores.u2.pts === 0 && p.scores.u5.pts === 0 && !p.scores.u4, `1000 for each right answer, 0 for wrong ones, the old round's doc ignored (${JSON.stringify(p && Object.fromEntries(Object.entries(p.scores).map(([k, v]) => [k, v.pts])))})`);
  ok(p && p.scores['u-old'].pts === 2000 && p.scores['u-old'].last === 0, 'a student who sat the round out keeps their points, +0');
  ok(p && JSON.stringify(p.scores).indexOf(NO_NAME) < 0 && JSON.stringify(p.scores).indexOf('name') < 0, 'no name in the public scores');
  p = await reveal(72, 66, rows);
  ok(p && p.correct === 'lower' && p.scores.u2.pts === 1000 && p.scores.u1.pts === 0, `72 then 66 reveals 'lower' and scores the other way (got ${p && p.correct})`);
  for (const [a, b, want] of [[48, 49, 'higher'], [84, 83, 'lower'], [60, 72, 'higher'], [72, 60, 'lower']]) {
    p = await reveal(a, b, []);
    ok(p && p.correct === want, `${a} then ${b} is '${want}'`);
  }
  // A round this console has no pair for: Reveal writes nothing.
  written.length = 0;
  run(`lqTSession = { sessionId: 'lq-t2', quizId: 'hilo', state: 'question', qIndex: 4, totalQ: 10, scores: {} }; lqTAnswers = []; lqHlRound = { key: 'lq-t2#3', a: 60, b: 67 };`, 'no-pair');
  await G('lqTeacherRevealHilo()');
  ok(written.length === 0, 'with no pair for this round (another console, a reload) Reveal writes nothing');
  // Auto-reveal calls the same writer.
  written.length = 0;
  run(`lqTSession = { sessionId: 'lq-t2', quizId: 'hilo', state: 'question', qIndex: 3, totalQ: 10, limitSec: 8, scores: {} }; lqTAnswers = []; lqHlRound = { key: 'lq-t2#3', a: 60, b: 67 }; lqTAutoReveal = true; lqTAutoKey = 'lq-t2#3'; lqTBusy = false;`, 'auto');
  run('lqTAutoRevealFire();', 'auto-fire');
  await Promise.resolve();
  ok(written.length === 1 && written[0].patch.correct === 'higher', 'the "Reveal when time runs out" timer reveals a hilo round too');
}

/* ── The strip ── */
{
  const paint = (session, round) => {
    controlsEl = { innerHTML: '' };
    run(`lqTSession = ${JSON.stringify(session)}; lqHlRound = ${JSON.stringify(round)}; lqPaintControls = __realPaint;`, 'strip');
    run('lqPaintControls();', 'paint');
    return controlsEl.innerHTML;
  };
  box.__realPaint = null;
  // lqPaintControls was stubbed above: reload the real one from the file.
  const src = read('live-quiz-teacher.js');
  // Re-declare the real function under another name, from the source text.
  const m = /function lqPaintControls\(\)\{[\s\S]*?\n\}\n/.exec(src);
  run(m[0].replace('function lqPaintControls()', 'function __realPaintFn()') + '\nvar __realPaint = __realPaintFn;', 'real-paint');
  const lobby = paint({ sessionId: 'lq-s', quizId: 'hilo', state: 'lobby', qIndex: -1, totalQ: 10, scores: {} }, null);
  ok(/Play the notes/.test(lobby) && ['Mixed', 'Close', 'Medium', 'Wide'].every(w => lobby.includes('>' + w + '<')), 'lobby: the four level chips and Play the notes');
  ok(/class="lq-ctl go" onclick="lqTHlLevel='mixed'/.test(lobby) && /class="lq-ctl ghost" onclick="lqTHlLevel='wide'/.test(lobby), 'Mixed is the selected chip by default');
  const q = paint({ sessionId: 'lq-s', quizId: 'hilo', state: 'question', qIndex: 0, totalQ: 10, scores: {} }, { key: 'lq-s#0', a: 60, b: 67 });
  ok(/onclick="lqTeacherHlReplay\(\)"[^>]*>Play again</.test(q) && /onclick="lqTeacherRevealHilo\(\)"[^>]*>Reveal</.test(q) && !/Mark the correct answer/.test(q), 'an open question: the Play again and Reveal buttons');
  const q2 = paint({ sessionId: 'lq-s', quizId: 'hilo', state: 'question', qIndex: 1, totalQ: 10, scores: {} }, { key: 'lq-s#0', a: 60, b: 67 });
  ok(/Mark the correct answer/.test(q2) && /lqTeacherReveal\('higher'\)/.test(q2) && /lqTeacherReveal\('lower'\)/.test(q2) && !/lqTeacherHlReplay/.test(q2) && !/lqTeacherRevealHilo/.test(q2), 'a round with no kept pair: the two mark buttons, no Play again or Reveal button');
  const next = paint({ sessionId: 'lq-s', quizId: 'hilo', state: 'reveal', qIndex: 0, totalQ: 10, scores: {} }, null);
  ok(/Play the notes/.test(next) && /Mixed/.test(next), 'after a Reveal: the chips and Play the notes again');
  ok(![lobby, q, q2, next].some(h => /\b(C|D|E|F|G|A|B)[#♯b♭]?[2-6]\b|midi|semitone|interval/i.test(h.replace(/class="[^"]*"/g, ''))), 'nothing in the strip names a note or an interval');
}

console.log(`live-hilo-sim: 4 levels, ${pairsTotal} pairs, 14 piano files, 37 notes; ${cases - fails} of ${cases} cases pass`);
process.exit(fails ? 1 : 0);
