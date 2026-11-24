/* ════════════════════════════════════════════════════════════════════
   Guitar Class — LIVE GAME "Higher or lower?"  (2026-11-24)

   Jonathan, 2026-11-24: "a game that plays notes and asks if they are higher
   or lower. change the intervals around. use a realistic piano sound", and
   "this is a live class game". It is one more game of the Live In-Class Games
   bank (LIVE_QUIZZES['hilo'], live-quiz.js), so it keeps everything a live
   game already has: the invite, the lobby, the rounds ("Question 3 of 10"),
   the tally, the Top 3, the final board, Preview, Hide names. This file holds
   only what is new; live-quiz.js calls into it from behind `typeof` guards.
   It loads right after live-changes.js on index.html only (the Journey pages
   show the "a game is running" banner and nothing else).

   ── One round ──
   The teacher presses "Play the notes". The CONSOLE plays two piano notes on
   the room speakers, one after the other; each student taps Higher or Lower on
   their own screen (is the SECOND note higher or lower than the first?). The
   notes are never on a student's Chromebook, so nothing can be heard there.

   ── Who decides what is correct ──
   The app does, at Reveal, like the fretboard quizzes: the answer is a fact of
   the two notes, so the console keeps the pair of the open round in memory
   (lqHlRound) and Reveal turns it into 'higher' or 'lower' and scores through
   lqTeacherReveal, the same writer the teacher's own mark uses. The pair is
   NEVER in liveQuiz/current (`target` stays null): the doc is readable by every
   signed-in account, and a pair there would be the answer. Nothing is stored
   on the device either (no storage key), so a console reload in the middle
   of a round forgets the pair: the strip then shows the plain "Mark the
   correct answer" buttons for that one round, and the teacher marks it himself.

   ── Changing the intervals around ──
   Every round is a new pair. The size of the jump (1 to 12 semitones, a half
   step up to an octave) and the direction are picked at random, the size never
   repeats within the last two rounds (while the level has enough sizes to
   avoid it) and the direction never runs four times the same way. Four levels
   in the strip: Mixed (every size), Close (1 to 2), Medium (3 to 5) and Wide
   (6 to 12). Both notes stay between C3 and C6 (MIDI 48 to 84).

   ── The piano ──
   Real recordings: Salamander Grand Piano V3 by Alexander Holm (CC BY 3.0),
   vendor/salamander-piano/ (README.txt there), 14 notes three semitones
   apart. A note between two recordings is the nearest one played faster or
   slower by at most a semitone and a half. They load on the console only, the
   first time a game of this kind is on the strip (about 1 MB), and stay
   decoded. If they cannot load, a plain synthesised piano-like tone plays so
   the round still works, and the strip says so.
   The first note starts LQ_HL_LEAD seconds after the question opens, so the
   games' music (teacher-livemusic.js, a 0.7 s fade-out because this quiz is
   `quiet`) is gone before the first note sounds.
   ════════════════════════════════════════════════════════════════════ */

const LQ_HL_SAMPLE_DIR = 'vendor/salamander-piano/';
// [file name, MIDI number]: A, C, D#, F# in each octave, A2 to A5, then C6.
const LQ_HL_SAMPLES = [['A2', 45], ['C3', 48], ['Ds3', 51], ['Fs3', 54], ['A3', 57], ['C4', 60], ['Ds4', 63],
  ['Fs4', 66], ['A4', 69], ['C5', 72], ['Ds5', 75], ['Fs5', 78], ['A5', 81], ['C6', 84]];
const LQ_HL_LOW = 48, LQ_HL_HIGH = 84;       // C3 to C6: the notes a round may use
const LQ_HL_LEAD = 0.9;                       // s from pressing Play to the first note (the music fades out first)
const LQ_HL_HOLD1 = 1.2, LQ_HL_REL1 = 0.35;   // first note: how long it is held, then how long it fades
const LQ_HL_START2 = 1.65;                    // s from the first note to the second (a clear gap after the first has faded)
const LQ_HL_HOLD2 = 1.6, LQ_HL_REL2 = 0.55;
const LQ_HL_GAIN = 0.85;
// The levels in the strip: the sizes of jump (in semitones) each may use.
const LQ_HL_LEVELS = {
  mixed:  { label: 'Mixed',  sizes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  close:  { label: 'Close',  sizes: [1, 2] },
  medium: { label: 'Medium', sizes: [3, 4, 5] },
  wide:   { label: 'Wide',   sizes: [6, 7, 8, 9, 10, 11, 12] }
};
let lqTHlLevel = 'mixed';

/* ── Picking a pair ── */
// This game's earlier rounds: { sessionId, items: [{ size, dir }] }, in this tab's memory only.
let lqHlHist = { sessionId: null, items: [] };
// The open round's pair: { key: '<sessionId>#<qIndex>', a, b } (MIDI numbers), or null.
let lqHlRound = null;

function lqHlSizes(level){ return (LQ_HL_LEVELS[level] || LQ_HL_LEVELS.mixed).sizes; }
/* One new pair for `level`, given the rounds so far. Pure apart from `rand` (a 0..1 source, Math.random unless a test
   passes one). Returns { a, b, size, dir } with dir 1 = the second note is higher, -1 = lower. */
function lqHlPick(level, items, rand){
  const rnd = rand || Math.random;
  const sizes = lqHlSizes(level);
  const lastTwo = items.slice(-2).map(x => x.size);
  let pool = sizes.filter(n => !lastTwo.includes(n));
  if(!pool.length) pool = sizes.filter(n => !items.length || n !== items[items.length - 1].size);
  if(!pool.length) pool = sizes;
  const size = pool[Math.floor(rnd() * pool.length)];
  const lastDirs = items.slice(-3).map(x => x.dir);
  let dir = rnd() < 0.5 ? 1 : -1;
  if(lastDirs.length === 3 && lastDirs.every(d => d === lastDirs[0])) dir = -lastDirs[0];   // never four the same way
  // The first note: anywhere that keeps both notes inside C3 to C6.
  const lo = dir > 0 ? LQ_HL_LOW : LQ_HL_LOW + size, hi = dir > 0 ? LQ_HL_HIGH - size : LQ_HL_HIGH;
  const a = lo + Math.floor(rnd() * (hi - lo + 1));
  return { a, b: a + dir * size, size, dir };
}

/* ── The piano ── */
let lqHlCtx = null;
let lqHlBuffers = null;        // [{ midi, buf }] once every sample is decoded
let lqHlLoading = null;        // the load in flight
let lqHlLoadErr = '';          // why the recordings are not there ('' = fine)
let lqHlSources = [];          // [{ src, gain }] sounding now, so Stop can cut them

function lqHlCtxGet(){
  if(!lqHlCtx){
    const AC = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
    if(!AC) return null;
    lqHlCtx = new AC();
  }
  return lqHlCtx;
}
// Loads and decodes the 14 recordings once. Resolves true when they are all there.
function lqHlLoad(){
  if(lqHlBuffers) return Promise.resolve(true);
  if(lqHlLoading) return lqHlLoading;
  const ctx = lqHlCtxGet();
  if(!ctx){ lqHlLoadErr = 'this browser has no audio'; return Promise.resolve(false); }
  lqHlLoading = Promise.all(LQ_HL_SAMPLES.map(([name, midi]) =>
    fetch(LQ_HL_SAMPLE_DIR + name + '.mp3').then(r => {
      if(!r.ok) throw new Error(name + ' ' + r.status);
      return r.arrayBuffer();
    }).then(ab => new Promise((res, rej) => { const p = ctx.decodeAudioData(ab, res, rej); if(p && p.catch) p.catch(rej); }))
      .then(buf => ({ midi, buf }))
  )).then(list => {
    lqHlBuffers = list; lqHlLoadErr = ''; lqHlLoading = null;
    lqHlRepaint();
    return true;
  }).catch(e => {
    console.warn('[live-hilo] the piano recordings did not load', e);
    lqHlLoadErr = 'the recordings did not load'; lqHlLoading = null;
    lqHlRepaint();
    return false;
  });
  return lqHlLoading;
}
// Starts the load the first time the strip shows this game. A failed load is not retried by repaints, only by a Play press.
let lqHlWarmed = false;
function lqHlWarm(){
  if(lqHlWarmed) return;
  lqHlWarmed = true;
  lqHlLoad();
}
function lqHlRepaint(){ if(typeof lqPaintControls === 'function') lqPaintControls(); }
function lqHlFreq(midi){ return 440 * Math.pow(2, (midi - 69) / 12); }

// One note at audio time `t`: a recording (or, with none loaded, a plain tone), held `hold` s, then faded over `rel` s.
function lqHlNote(ctx, midi, t, hold, rel){
  const gain = ctx.createGain();
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(LQ_HL_GAIN, t);
  gain.gain.setValueAtTime(LQ_HL_GAIN, t + hold);
  gain.gain.linearRampToValueAtTime(0, t + hold + rel);
  const end = t + hold + rel + 0.05;
  const srcs = [];
  if(lqHlBuffers && lqHlBuffers.length){
    let best = lqHlBuffers[0];
    lqHlBuffers.forEach(b => { if(Math.abs(b.midi - midi) < Math.abs(best.midi - midi)) best = b; });
    const src = ctx.createBufferSource();
    src.buffer = best.buf;
    src.playbackRate.value = Math.pow(2, (midi - best.midi) / 12);
    src.connect(gain);
    srcs.push(src);
  } else {
    // Backup only: a few sine partials with a short decay. Not a piano, but the round still works.
    [1, 2, 3, 4, 5].forEach((k, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = lqHlFreq(midi) * k;
      g.gain.setValueAtTime(0.5 / (k * k), t);
      g.gain.exponentialRampToValueAtTime(0.001, t + hold + rel);
      o.connect(g); g.connect(gain);
      srcs.push(o);
    });
  }
  srcs.forEach(src => {
    src.start(t);
    src.stop(end);
    lqHlSources.push({ src, gain });
    src.onended = () => { lqHlSources = lqHlSources.filter(x => x.src !== src); };
  });
}
// The two notes: a first, then b. Cuts anything still sounding first.
function lqHlPlay(a, b){
  lqHlStopAudio();
  const ctx = lqHlCtxGet();
  if(!ctx) return false;
  if(ctx.state === 'suspended') ctx.resume();
  const t0 = ctx.currentTime + LQ_HL_LEAD;
  lqHlNote(ctx, a, t0, LQ_HL_HOLD1, LQ_HL_REL1);
  lqHlNote(ctx, b, t0 + LQ_HL_START2, LQ_HL_HOLD2, LQ_HL_REL2);
  return true;
}
// Every way out calls this: a new round, Reveal-less End, Clear, Exit preview, leaving the view (teacher-core.js setTeacherView).
function lqHlStopAudio(){
  const list = lqHlSources; lqHlSources = [];
  const ctx = lqHlCtx;
  if(!ctx) return;
  const now = ctx.currentTime;
  list.forEach(({ src, gain }) => {
    try {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0, now);
      src.stop(now + 0.02);
    } catch(e){ /* already stopped */ }
  });
}

/* ── The round ── */
function lqHlRoundKey(s){ return s ? s.sessionId + '#' + s.qIndex : null; }
// The open round's pair, or null (a console that did not open it, or reloaded since).
function lqHlCurrent(s){ return lqHlRound && s && lqHlRound.key === lqHlRoundKey(s) ? lqHlRound : null; }

let lqHlOpening = false;
// "Play the notes": picks a pair, opens the next question and plays it.
async function lqTeacherOpenHilo(){
  const s = lqTSession;
  if(!s || lqHlOpening || lqTBusy || !lqQuiz(s.quizId).hilo) return;
  const next = s.state === 'lobby' ? 0 : Number(s.qIndex) + 1;
  if(Number(s.totalQ) > 0 && next >= Number(s.totalQ)) return;
  lqHlOpening = true;
  try {
    await lqHlLoad();                       // the first time it can take a second; the question opens only once the piano is ready
    if(lqTSession !== s && (!lqTSession || lqTSession.sessionId !== s.sessionId)) return;   // the game changed meanwhile
    if(lqHlHist.sessionId !== s.sessionId) lqHlHist = { sessionId: s.sessionId, items: [] };
    const p = lqHlPick(lqTHlLevel, lqHlHist.items);
    // Set BEFORE the write: the snapshot that paints the question's strip can arrive before the write resolves.
    lqHlRound = { key: s.sessionId + '#' + next, a: p.a, b: p.b };
    const ok = await lqTeacherNext();
    if(ok !== true){ lqHlRound = null; return; }
    lqHlHist.items.push({ size: p.size, dir: p.dir });
    lqHlPlay(p.a, p.b);
  } finally {
    lqHlOpening = false;
  }
}
// "Play again": the same two notes.
function lqTeacherHlReplay(){
  const r = lqHlCurrent(lqTSession);
  if(r) lqHlPlay(r.a, r.b);
}
// Reveal: the app scores it. The answer is 'higher' when the second note is above the first.
async function lqTeacherRevealHilo(){
  const s = lqTSession;
  if(!s || s.state !== 'question') return;
  const r = lqHlCurrent(s);
  if(!r){ console.warn('[live-hilo] no notes kept for this round: mark it by hand'); return; }
  await lqTeacherReveal(r.b > r.a ? 'higher' : 'lower');
}

/* ── The strip ── */
function lqHlStatusHtml(){
  let msg;
  if(lqHlBuffers) msg = 'Piano ready.';
  else if(lqHlLoadErr) msg = 'Piano recordings not loaded (' + lqHlLoadErr + '): a plain backup sound plays.';
  else msg = 'Loading the piano…';
  return `<div class="lq-ctl-hint">${escHtml(msg)}</div>`;
}
// Lobby and between questions: the level chips (the selected one `.go`) and the one button that plays.
function lqHlPickerHtml(busy){
  lqHlWarm();
  const chips = Object.keys(LQ_HL_LEVELS).map(k =>
    `<button type="button" class="lq-ctl${k === lqTHlLevel ? ' go' : ' ghost'}" onclick="lqTHlLevel='${k}';lqPaintControls()">${escHtml(LQ_HL_LEVELS[k].label)}</button>`).join('');
  return `<div class="lq-ctl-marks">${chips}</div>`
    + `<div class="lq-ctl-marks"><button type="button" class="lq-ctl go" onclick="lqTeacherOpenHilo()"${busy}>Play the notes</button></div>`
    + lqHlStatusHtml();
}
// While a question is open: Play again and Reveal. A round this console has no pair for gets the plain mark buttons.
function lqHlQuestionHeadHtml(s, quiz, busy){
  if(!lqHlCurrent(s)){
    const picks = quiz.choices.map(c =>
      `<button type="button" class="lq-ctl mark" style="--lq-c:${c.color}" onclick="lqTeacherReveal('${c.id}')"${busy}>${escHtml(tIn(c.key, 'en'))}</button>`).join('');
    return `<span class="lq-ctl-lbl">Mark the correct answer:</span><div class="lq-ctl-marks">${picks}</div>`;
  }
  return `<button type="button" class="lq-ctl ghost" onclick="lqTeacherHlReplay()">Play again</button>`
    + `<button type="button" class="lq-ctl go" onclick="lqTeacherRevealHilo()"${busy}>Reveal</button>`;
}
