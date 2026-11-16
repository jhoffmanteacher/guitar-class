/* ── The chord card games (split from coach-chords.js, 2026-11-16) ──
   The chord difficulty ranks (CHORD_RANK, chordRankOf, chordDeckLevels) and the two climbing card games that
   share them: Chord Blitz (the shape by eye, no mic) and Chord Detective (the same chords by ear). Loaded right
   after coach-chords.js (COACH_JS_PARTS, app/boot.js), which keeps Change Up and Power Chord Switch with their
   listening and grading (ccLoop, ccResolvePend, ccFinish). The code below was moved whole and unchanged; nothing
   here runs at load except plain declarations. */

/* ════════════════════════════════════════════════════════════════════
   CHORD DIFFICULTY RANKS — shared by the two climbing card games, Chord
   Blitz (shapes, by eye) and Chord Detective (the same chords, by ear).
   One rank per chord, in the order the COURSE teaches them: Module 4's
   Group 1 (C F Am G), then Group 2 (D A Em) alongside the open power
   shapes, then Dm and the movable power shapes, then Group 3 (E, B7) —
   with Bm, a Group 2 chord, ranked alongside them.

   F#m and C#m were dropped from both games' decks 2026-09-28 (Jonathan)
   — no module teaches either shape; only Bm (Group 2) is taught. (The
   names do appear: a Module 6 reggae progression, a Module 7 Choice-song
   line that says to barre C#m, Module 10's relative-minor list — mentions,
   not lessons.) The former "barre" deck existed only to
   drill Bm/F#m/C#m against each other by ear/eye, which stops making
   sense with two of the three not yet part of the course, so the deck
   itself is gone too — Bm still practices via the "all" deck. Re-add a
   barre deck once F#m/C#m have an actual lesson to build on, and give the
   three DIFFERENT ranks then (not all the same one) so the deck gets a
   real build-up instead of a flat 3-way cold open — see the games
   open-items memory for why a flat single-level "hardest case immediately"
   deck was the wrong call even for a chord that IS taught.

   Every deck in both games DERIVES its levels from this one table
   (cbDeckLevels / cdDeckLevels), so no deck carries its own tier list that
   could drift from it. Adding a chord to any deck means adding it here too
   — checks.mjs 1ag fails the push both ways, because a chord with no rank
   doesn't look broken: chordRankOf() falls back to 1 and it quietly turns
   up on card one.
   ════════════════════════════════════════════════════════════════════ */
const CHORD_RANK = {
  C: 1, F: 1, Am: 1, G: 1,
  D: 2, A: 2, Em: 2, E5: 2, A5: 2, D5: 2,
  Dm: 3, G5: 3, C5: 3,
  E: 4, B7: 4, Bm: 4
};
function chordRankOf(n){ return CHORD_RANK[n] || 1; }

/* Levels for one deck: the distinct ranks its chords actually cover, lowest
   first, renumbered 1..N. A deck whose chords all share a rank (Partial
   barres) is one level — the climb just has nowhere to go, which is fine. */
function chordDeckLevels(chords){
  const ranks = Array.from(new Set(chords.map(chordRankOf))).sort((a, b) => a - b);
  return ranks.map(r => chords.filter(n => chordRankOf(n) === r));
}

/* ════════════════════════════════════════════════════════════════════
   CHORD BLITZ — a ten-card chord-shape sprint with FIVE SECONDS a card.
   No mic and no guitar: pick a deck, then either name the shape you see
   ("Name it") or pick the shape for the name you see ("Spot it").

   The round CLIMBS. Only the easiest chords in the deck are in play at
   the start; every CB_PROMOTE_EVERY right answers adds the next level's
   chords to the pool and the level chip ticks up. A miss never demotes —
   the ladder only goes one way, so a bad card can't spiral. Running the
   card clock out is a miss too, minus the point penalty (nothing was
   guessed wrong). Right answers build a streak that multiplies points,
   and points scale with the level, so climbing is what a big score is
   made of. Best per deck+direction is session-scoped (hub chip says
   "today"); the cross-session best goes to the progress doc via the
   'games' category.

   Was a flat 90-second block with the whole deck in play from card one
   (Jonathan, 2026-09-16: "1:30 is way too long").
   ════════════════════════════════════════════════════════════════════ */

const CB_CARDS = 10;          // cards in a round
const CB_CARD_MS = 5000;      // 5 seconds a card, then it counts as missed
const CB_PROMOTE_EVERY = 2;   // right answers per level

// labelKey resolved at render time in cbRenderSetup() — never here (this
// table is built once at load, so t() here would freeze one language in).
const CB_DECKS = [
  { id: 'open',  labelKey: 'games.cb.deck.open',  chords: ['E','Em','A','Am','D','Dm','G','C','F','B7'] },
  { id: 'power', labelKey: 'games.cb.deck.power', chords: ['E5','G5','A5','C5','D5'] },
  { id: 'all',   labelKey: 'games.cb.deck.all',   chords: ['E','Em','A','Am','D','Dm','G','C','F','E5','G5','A5','C5','D5','Bm','B7'] }
];

let cb = null, cbTick = null;

function cbStop(){
  if (cbTick){ clearInterval(cbTick); cbTick = null; }
  document.removeEventListener('keydown', cbKeydown);
  if (cb){
    (cb.timeouts || []).forEach(clearTimeout);
    cb = null;
  }
}

function cbBody(){ return document.getElementById('cb-body'); }
/* Bumped from 'cbBest:' when the round became 10 cards — a score from the
   old 90-second block is 30-odd cards' worth and would never be beaten. */
function cbBestKey(deck, dir){ return 'cbBest2:' + deck + ':' + dir; }
function cbDeckChords(){
  const d = CB_DECKS.find(x => x.id === cb.deck);
  return (d || CB_DECKS[0]).chords;
}
function cbDeckLevels(){ return chordDeckLevels(cbDeckChords()); }

/* Everything unlocked so far — levels are cumulative, so an early chord
   keeps coming back instead of being retired the moment you climb. */
function cbPool(){
  return cb.levels.slice(0, cb.level).reduce((a, lvl) => a.concat(lvl), []);
}

function cbSetup(){
  let deck = 'open', dir = 'name';
  try {
    deck = sessionStorage.getItem('cbDeck') || deck;
    dir = sessionStorage.getItem('cbDir') || dir;
  } catch(e){}
  if (!CB_DECKS.some(d => d.id === deck)) deck = 'open';
  if (dir !== 'name' && dir !== 'spot') dir = 'name';
  cb = { phase: 'setup', deck, dir, timeouts: [] };
  cbRenderSetup();
}

function cbPickDeck(id){
  if (!cb) return;
  cb.deck = id;
  try { sessionStorage.setItem('cbDeck', id); } catch(e){}
  cbRenderSetup();
}

function cbPickDir(d){
  if (!cb) return;
  cb.dir = d;
  try { sessionStorage.setItem('cbDir', d); } catch(e){}
  cbRenderSetup();
}

function cbRenderSetup(){
  const body = cbBody();
  if (!body || !cb) return;
  const deckPills = CB_DECKS.map(d =>
    `<button type="button" class="ts-btn${d.id === cb.deck ? ' active' : ''}" onclick="cbPickDeck('${d.id}')">${escHtml(t(d.labelKey))}</button>`
  ).join('');
  const dirPills = [['name', t('games.cb.nameIt')], ['spot', t('games.cb.spotIt')]].map(([d, label]) =>
    `<button type="button" class="ts-btn${d === cb.dir ? ' active' : ''}" onclick="cbPickDir('${d}')">${label}</button>`
  ).join('');
  let best = 0;
  try { best = parseInt(sessionStorage.getItem(cbBestKey(cb.deck, cb.dir)), 10) || 0; } catch(e){}
  body.innerHTML =
    `<div class="cc-group"><div class="cc-group-title">${t('games.common.deck')}</div><div class="fret-levels">${deckPills}</div></div>
     <div class="cc-group"><div class="cc-group-title">${t('games.cb.direction')}</div><div class="fret-levels">${dirPills}</div></div>
     <div class="coach-tip">${t('games.cb.tip')}</div>
     ${best ? `<div class="cb-setup-best">&#x1F3C6; ${t('games.common.bestTodayLabel')}: ${best}</div>` : ''}
     <button type="button" class="coach-start" onclick="cbStart()">&#x25B6; ${t('games.cb.startButton')}</button>`;
}

function cbStart(){
  if (!cb || cb.phase === 'play') return;
  coachClose(); coachEvictTuner();   // one mic/audio owner at a time
  const s = cb;
  s.phase = 'play';
  s.score = 0; s.streak = 0; s.answered = 0; s.correct = 0;
  s.cur = null; s.prev = null; s.opts = [];
  s.requeue = []; s.locked = false;
  s.levels = cbDeckLevels();
  s.level = 1; s.topLevel = 1; s.promoted = false;
  s.cardEndAt = 0;
  (s.timeouts || []).forEach(clearTimeout);
  s.timeouts = [];
  document.addEventListener('keydown', cbKeydown);   // laptop: 1–4 answer
  if (cbTick) clearInterval(cbTick);
  /* 50ms: the fuse bar is only five seconds wide, so a coarser tick would
     move it in visible jumps. Cheap — nothing else runs during a card. */
  cbTick = setInterval(cbTimerTick, 50);
  cbNext();
}

function cbTimerTick(){
  if (!cb || cb.phase !== 'play'){
    if (cbTick){ clearInterval(cbTick); cbTick = null; }
    return;
  }
  if (!cbBody()){ cbStop(); return; }   // panel swapped under us
  if (cb.locked) return;                // reveal pause — the card clock waits
  const left = cb.cardEndAt - performance.now();
  const fill = document.getElementById('cb-fuse-fill');
  if (fill) fill.style.width = Math.max(0, Math.min(100, (left / CB_CARD_MS) * 100)) + '%';
  const el = document.getElementById('cb-timer');
  if (el){
    el.textContent = String(Math.max(0, Math.ceil(left / 1000)));
    el.classList.toggle('low', left <= 2000);
  }
  if (left <= 0) cbTimeUp();
}

/* Keys 1–4 answer a four-choice card round on a laptop — the same rule for
   Chord Blitz, Chord Detective, Name That Riff and Fret Zap. Each game keeps
   its own named handler (add/removeEventListener need one). */
function cardAnswerKey(e, s, answer){
  if (e.repeat) return;
  if (!s || s.phase !== 'play' || s.locked) return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  const i = ['1', '2', '3', '4'].indexOf(e.key);
  if (i >= 0) answer(i);
}
function cbKeydown(e){ cardAnswerKey(e, cb, cbAnswer); }

/* A missed chord is due again 3–5 cards later; otherwise random from the
   chords unlocked so far. Never the same card twice in a row. */
function cbPickCard(){
  const i = cb.requeue.findIndex(q => q.due <= cb.answered && q.name !== cb.prev);
  if (i >= 0) return cb.requeue.splice(i, 1)[0].name;
  const unlocked = cbPool();
  const pool = unlocked.filter(n => n !== cb.prev);
  return (pool.length ? pool : unlocked)[Math.floor(Math.random() * (pool.length || unlocked.length))];
}

function cbShuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

/* Distractors come from the chords unlocked so far, topped up in rank order
   from the rest of the deck when that pool is small — four buttons drawn
   from a four-chord level 1 would be the same four names every card. An
   unfamiliar distractor only makes a card easier, never harder. */
function cbOptionPool(){
  const unlocked = cbPool();
  if (unlocked.length >= 6) return unlocked;
  const rest = cbDeckChords().filter(n => unlocked.indexOf(n) < 0)
    .sort((a, b) => chordRankOf(a) - chordRankOf(b));
  return unlocked.concat(rest.slice(0, 6 - unlocked.length));
}

function cbOptions(correct){
  /* Deck-native chords always fill the distractor slots first — see the
     identical fix in cdOptions() (Chord Detective) for the simulated
     numbers: a random shuffle-then-slice over (native + borrowed) let the
     former barre deck's two other barre shapes lose out to easy open-
     chord decoys the large majority of rounds, so "spot the Bm/F#m/C#m
     shape" rarely actually tested that 3-way discrimination (that deck is
     gone now — see CHORD_RANK's note — but no current deck is small
     enough to hit the borrow branch below, so this is dormant, not dead:
     the next small deck gets it right from the start). Borrowing only
     tops up whatever's still missing after every native option is in. */
  let opts = cbOptionPool().filter(n => n !== correct);
  if (opts.length < 3){   // tiny deck: borrow distractors from the full library
    const all = CB_DECKS[CB_DECKS.length - 1].chords;
    const borrowed = cbShuffle(all.filter(n => n !== correct && opts.indexOf(n) < 0));
    opts = opts.concat(borrowed).slice(0, 3);
  } else {
    opts = cbShuffle(opts).slice(0, 3);
  }
  opts.push(correct);
  return cbShuffle(opts);
}

/* 10 a card at level 1, rising 5 a level, times the streak multiplier. */
function cbCardPoints(s){
  return (10 + 5 * (s.level - 1)) * Math.min(4, 1 + Math.floor(s.streak / 5));
}

function cbNext(){
  if (!cb || cb.phase !== 'play') return;
  const body = cbBody();
  if (!body){ cbStop(); return; }
  const s = cb;
  if (s.answered >= CB_CARDS){ cbFinish(); return; }
  const was = s.level;
  s.level = Math.min(s.levels.length, 1 + Math.floor(s.correct / CB_PROMOTE_EVERY));
  s.promoted = s.level > was;
  if (s.level > s.topLevel) s.topLevel = s.level;
  s.cur = cbPickCard();
  s.prev = s.cur;
  s.opts = cbOptions(s.cur);
  s.locked = false;
  s.cardEndAt = performance.now() + CB_CARD_MS;
  const svg = n => (typeof localChordSvg === 'function' && localChordSvg(n)) || '';
  const prompt = s.dir === 'name'
    ? `<div class="cb-prompt"><div class="cb-prompt-dia">${svg(s.cur)}</div></div>`
    : `<div class="cb-prompt"><div class="cb-prompt-name">${escHtml(s.cur)}</div></div>`;
  const answers = s.opts.map((n, i) =>
    `<button type="button" class="cb-answer" id="cb-opt-${i}" onclick="cbAnswer(${i})"><span class="cb-key">${i + 1}</span>` +
    (s.dir === 'name' ? escHtml(n) : `<span class="cb-answer-dia">${svg(n)}</span>`) +
    `</button>`
  ).join('');
  const mult = Math.min(4, 1 + Math.floor(s.streak / 5));
  /* A one-level deck has nothing to climb, so it shows no level chip. */
  const levelChip = s.levels.length > 1
    ? `<span class="cb-level${s.promoted ? ' up' : ''}">${t('games.common.level', { n: s.level })}${s.promoted ? ' &#x2191;' : ''}</span>`
    : '';
  body.innerHTML =
    `<div class="cb-hud">
       <span class="cb-timer" id="cb-timer">${Math.ceil(CB_CARD_MS / 1000)}</span>
       <span class="cb-score" id="cb-score">${t('games.common.score', { n: s.score })}</span>
       <span class="cb-streak" id="cb-streak">${s.streak >= 2 ? '&#x1F525; ' + t('games.common.inARow', { n: s.streak }) + (mult > 1 ? ' &mdash; &times;' + mult : '') : '&nbsp;'}</span>
     </div>
     <div class="cb-meta">
       <span class="cb-count">${t('games.common.cardOf', { n: s.answered + 1, total: CB_CARDS })}</span>
       ${levelChip}
     </div>
     <div class="cb-fuse"><div class="cb-fuse-fill" id="cb-fuse-fill"></div></div>
     <div class="cb-cols">${prompt}<div class="cb-answers">${answers}</div></div>`;
}

/* Wrong, or out of time: show the right button for a beat (inputs locked)
   and requeue the card. Pass the tapped index to flag it, or null when the
   clock ran out and nothing was tapped. */
function cbRevealThenNext(wrongIdx){
  const s = cb;
  s.locked = true;
  if (wrongIdx !== null){
    const hit = document.getElementById('cb-opt-' + wrongIdx);
    if (hit) hit.classList.add('wrong');
  }
  const right = document.getElementById('cb-opt-' + s.opts.indexOf(s.cur));
  if (right) right.classList.add('reveal');
  const fill = document.getElementById('cb-fuse-fill');
  if (fill) fill.style.width = '0%';
  const scoreEl = document.getElementById('cb-score');
  if (scoreEl) scoreEl.textContent = t('games.common.score', { n: s.score });
  const streakEl = document.getElementById('cb-streak');
  if (streakEl) streakEl.innerHTML = '&nbsp;';
  s.timeouts.push(setTimeout(() => {
    if (cb !== s || s.phase !== 'play') return;
    cbNext();
  }, 800));
}

function cbAnswer(i){
  if (!cb || cb.phase !== 'play' || cb.locked) return;
  const s = cb;
  const pick = s.opts[i];
  if (!pick) return;
  s.answered++;
  if (pick === s.cur){
    s.correct++;
    s.streak++;
    s.score += cbCardPoints(s);
    if (typeof strumChord === 'function') strumChord(s.cur);   // reward: hear the chord you just named
    cbNext();
    return;
  }
  s.score = Math.max(0, s.score - 5);
  s.streak = 0;
  s.requeue.push({ name: s.cur, due: s.answered + 2 + Math.floor(Math.random() * 3) });
  cbRevealThenNext(i);
}

/* Out of time. Costs the card and the streak, but no points — nothing was
   guessed wrong, and docking a frozen student twice isn't the lesson. */
function cbTimeUp(){
  if (!cb || cb.phase !== 'play' || cb.locked) return;
  const s = cb;
  s.answered++;
  s.streak = 0;
  s.requeue.push({ name: s.cur, due: s.answered + 2 + Math.floor(Math.random() * 3) });
  cbRevealThenNext(null);
}

function cbFinish(){
  if (!cb || cb.phase !== 'play') return;
  if (cbTick){ clearInterval(cbTick); cbTick = null; }
  cb.timeouts.forEach(clearTimeout);
  cb.timeouts = [];
  cb.phase = 'done';
  cb.prevBest = 0;
  try {
    const k = cbBestKey(cb.deck, cb.dir);
    cb.prevBest = parseInt(sessionStorage.getItem(k), 10) || 0;
    if (cb.score > cb.prevBest) sessionStorage.setItem(k, String(cb.score));
  } catch(e){}
  /* Cross-session best → the student's progress doc. Skipped in dev bypass
     (Firestore rejects that uid; the session best above still counts).
     v:2 marks a score from the 10-card round — a v:1 record is from the old
     90-second block and is read as no best at all rather than as a wall. */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    const old = cbSavedBest(games);
    const isNewBest = cb.score > old;
    if (isNewBest) games.cb = { v: 2, best: cb.score, deck: cb.deck, dir: cb.dir, level: cb.topLevel, at: new Date().toISOString().slice(0, 10) };
    // XP only for a round with at least one right answer — letting the
    // timer run out on an untouched round is not a round played.
    if (cb.correct > 0) awardArcadeXp(isNewBest);
  }
  cbRenderDone();
}

/* The saved cross-session best, or 0 if the only record is a pre-10-card one. */
function cbSavedBest(saved){
  const rec = saved && saved.cb;
  return (rec && rec.v === 2 && rec.best) || 0;
}

function cbRenderDone(){
  const body = cbBody();
  if (!body || !cb) return;
  const acc = cb.answered ? Math.round(100 * cb.correct / cb.answered) : 0;
  const bestLine = cardBestLine(cb.prevBest, cb.score);
  const levelLine = cb.levels.length > 1
    ? `<div class="coach-overall">${t('games.common.reachedLevel', { n: cb.topLevel, total: cb.levels.length })}</div>`
    : '';
  body.innerHTML =
    `<div class="coach-report">
       <div class="cb-done-score">${cb.score}</div>
       <div class="coach-overall">${GAME_ICO.blitz} ${t(cb.answered === 1 ? 'games.common.cardsAnsweredOne' : 'games.common.cardsAnsweredMany', { answered: cb.answered, correct: cb.correct, acc })}</div>
       ${levelLine}
       ${bestLine}
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="cbStart()">&#x21BB; ${t('games.common.playAgain')}</button>
         <button type="button" class="tp-btn" onclick="cbSetup()">${t('games.cb.changeDeck')}</button>
       </div>
     </div>`;
}

/* ════════════════════════════════════════════════════════════════════
   CHORD DETECTIVE — Chord Blitz's ear twin, with the diagram replaced by
   a Play button: strumChord() plays a taught chord with NOTHING shown,
   and you name it from four choices purely by ear. No name/spot toggle
   (Chord Blitz already owns diagram literacy — this game is ear-only,
   that's the whole point). Same requeue / streak / scoring / climb
   mechanics as Chord Blitz, deliberately, so a student who's learned one
   already knows how to play the other.

   ⚠ THE CARD CLOCK IS HELD WHILE THE CHORD IS SOUNDING. Five seconds a
   card here means five seconds of THINKING, not five seconds counting
   from a chord the student hasn't finished hearing. Every play — the
   auto-play on a new card and every replay — parks the clock for
   CD_SOUND_MS, so replaying to listen properly is never what runs it out.
   This is the same call as `speedBonus` staying off in a live quiz where
   the teacher makes the sound after the question opens (CLAUDE.md): in an
   ear game, charging for listening time scores patience instead of ears.

   Was a flat 60-second block with the whole deck in play from card one —
   matched to Chord Blitz 2026-09-16, same session, same reason.
   ════════════════════════════════════════════════════════════════════ */

const CD_CARDS = 10;          // cards in a round
const CD_CARD_MS = 5000;      // 5 seconds a card, then it counts as missed
const CD_PROMOTE_EVERY = 2;   // right answers per level
/* How long a play parks the clock. strumChord() strums 6 notes 35ms apart
   and each note rings up to 3s (app.js GUITAR_NOTE_FILES; 2.0s for the
   synth fallback, ksPluckBuffer), so this
   covers the strum-out plus the part of the decay you can actually name a
   chord from, without parking so long that the card stalls. */
const CD_SOUND_MS = 1600;

const CD_DECKS = [
  { id: 'open',  labelKey: 'games.cd.deck.open',  chords: ['E','Em','A','Am','D','Dm','G','C','F'] },
  { id: 'all',   labelKey: 'games.cd.deck.all',   chords: ['E','Em','A','Am','D','Dm','G','C','F','Bm','B7'] }
];

let cd = null, cdTick = null;

function cdStop(){
  if (cdTick){ clearInterval(cdTick); cdTick = null; }
  document.removeEventListener('keydown', cdKeydown);
  if (cd){
    (cd.timeouts || []).forEach(clearTimeout);
    cd = null;
  }
}

function cdBody(){ return document.getElementById('cd-body'); }
/* Bumped from 'cdBest:' when the round became 10 cards — a score from the
   old 60-second block is far more cards and would never be beaten. */
function cdBestKey(deck){ return 'cdBest2:' + deck; }
function cdDeckChords(){
  const d = CD_DECKS.find(x => x.id === cd.deck);
  return (d || CD_DECKS[0]).chords;
}
function cdDeckLevels(){ return chordDeckLevels(cdDeckChords()); }

/* Everything unlocked so far — levels are cumulative, so an early chord
   keeps coming back instead of being retired the moment you climb. */
function cdPool(){
  return cd.levels.slice(0, cd.level).reduce((a, lvl) => a.concat(lvl), []);
}

function cdSetup(){
  let deck = 'open';
  try { deck = sessionStorage.getItem('cdDeck') || deck; } catch(e){}
  if (!CD_DECKS.some(d => d.id === deck)) deck = 'open';
  cd = { phase: 'setup', deck, timeouts: [] };
  cdRenderSetup();
}

function cdPickDeck(id){
  if (!cd) return;
  cd.deck = id;
  try { sessionStorage.setItem('cdDeck', id); } catch(e){}
  cdRenderSetup();
}

function cdRenderSetup(){
  const body = cdBody();
  if (!body || !cd) return;
  const deckPills = CD_DECKS.map(d =>
    `<button type="button" class="ts-btn${d.id === cd.deck ? ' active' : ''}" onclick="cdPickDeck('${d.id}')">${escHtml(t(d.labelKey))}</button>`
  ).join('');
  let best = 0;
  try { best = parseInt(sessionStorage.getItem(cdBestKey(cd.deck)), 10) || 0; } catch(e){}
  body.innerHTML =
    `<div class="cc-group"><div class="cc-group-title">${t('games.common.deck')}</div><div class="fret-levels">${deckPills}</div></div>
     <div class="coach-tip">${t('games.cd.tip')}</div>
     ${best ? `<div class="cb-setup-best">&#x1F3C6; ${t('games.common.bestTodayLabel')}: ${best}</div>` : ''}
     <button type="button" class="coach-start" onclick="cdStart()">&#x25B6; ${t('games.cd.startButton')}</button>`;
}

function cdStart(){
  if (!cd || cd.phase === 'play') return;
  coachClose(); coachEvictTuner();   // one mic/audio owner at a time
  /* The round is judged by ear, so it has to be heard clean: a metronome or
     backing track the student left running would play under every card
     (Name That Riff's ntrPlay does the same). */
  if (typeof stopAllDemoAudio === 'function') stopAllDemoAudio();
  const s = cd;
  s.phase = 'play';
  s.score = 0; s.streak = 0; s.answered = 0; s.correct = 0;
  s.cur = null; s.prev = null; s.opts = [];
  s.requeue = []; s.locked = false;
  s.levels = cdDeckLevels();
  s.level = 1; s.topLevel = 1; s.promoted = false;
  s.cardEndAt = 0; s.holdUntil = 0;
  (s.timeouts || []).forEach(clearTimeout);
  s.timeouts = [];
  document.addEventListener('keydown', cdKeydown);   // laptop: 1–4 answer
  if (cdTick) clearInterval(cdTick);
  /* 50ms: the fuse bar is only five seconds wide, so a coarser tick would
     move it in visible jumps. Cheap — nothing else runs during a card. */
  cdTick = setInterval(cdTimerTick, 50);
  cdNext();
}

function cdTimerTick(){
  if (!cd || cd.phase !== 'play'){
    if (cdTick){ clearInterval(cdTick); cdTick = null; }
    return;
  }
  if (!cdBody()){ cdStop(); return; }   // panel swapped under us
  if (cd.locked) return;                // reveal pause — the card clock waits
  const now = performance.now();
  /* Still sounding: hold the clock AND push the deadline out with it, so
     the student gets the full five seconds of quiet however long they
     listened for. */
  if (now < cd.holdUntil){
    cd.cardEndAt = cd.holdUntil + CD_CARD_MS;
    cdPaintClock(CD_CARD_MS, true);
    return;
  }
  const left = cd.cardEndAt - now;
  cdPaintClock(left, false);
  if (left <= 0) cdTimeUp();
}

function cdPaintClock(left, listening){
  const fill = document.getElementById('cd-fuse-fill');
  if (fill){
    fill.style.width = Math.max(0, Math.min(100, (left / CD_CARD_MS) * 100)) + '%';
    fill.classList.toggle('listening', !!listening);
  }
  const el = document.getElementById('cd-timer');
  if (el){
    el.textContent = String(Math.max(0, Math.ceil(left / 1000)));
    el.classList.toggle('low', !listening && left <= 2000);
  }
}

/* Every play parks the clock, the auto-play on a new card included. */
function cdPlay(){
  if (!cd || !cd.cur) return;
  if (typeof strumChord === 'function') strumChord(cd.cur);
  if (cd.phase === 'play' && !cd.locked){
    cd.holdUntil = performance.now() + CD_SOUND_MS;
    cd.cardEndAt = cd.holdUntil + CD_CARD_MS;
  }
}

function cdKeydown(e){ cardAnswerKey(e, cd, cdAnswer); }

/* A missed chord is due again 3–5 cards later; otherwise random from the
   chords unlocked so far. Never the same card twice in a row. */
function cdPickCard(){
  const i = cd.requeue.findIndex(q => q.due <= cd.answered && q.name !== cd.prev);
  if (i >= 0) return cd.requeue.splice(i, 1)[0].name;
  const unlocked = cdPool();
  const pool = unlocked.filter(n => n !== cd.prev);
  return (pool.length ? pool : unlocked)[Math.floor(Math.random() * (pool.length || unlocked.length))];
}

/* Distractors come from the chords unlocked so far, topped up in rank order
   from the rest of the deck when that pool is small — four buttons drawn
   from a four-chord level 1 would be the same four names every card. */
function cdOptionPool(){
  const unlocked = cdPool();
  if (unlocked.length >= 6) return unlocked;
  const rest = cdDeckChords().filter(n => unlocked.indexOf(n) < 0)
    .sort((a, b) => chordRankOf(a) - chordRankOf(b));
  return unlocked.concat(rest.slice(0, 6 - unlocked.length));
}

function cdOptions(correct){
  /* Deck-native chords always fill the distractor slots first — a random
     shuffle-then-slice over (native + borrowed) let the former barre
     deck's two other barre chords lose out to easy open-chord decoys 95%
     of the time (simulated: only 4.5% of rounds tested the actual 3-way
     Bm/F#m/C#m discrimination that deck existed to teach — see CHORD_RANK
     for why it's gone now). No current deck is small enough to hit the
     borrow branch below, so this stays dormant, not dead: the next small
     deck gets it right from the start. Borrowing only tops up whatever's
     still missing after every native option is already in. */
  let opts = cdOptionPool().filter(n => n !== correct);
  if (opts.length < 3){   // tiny deck: borrow distractors from the full library
    const all = CD_DECKS[CD_DECKS.length - 1].chords;
    const borrowed = cbShuffle(all.filter(n => n !== correct && opts.indexOf(n) < 0));
    opts = opts.concat(borrowed).slice(0, 3);
  } else {
    opts = cbShuffle(opts).slice(0, 3);
  }
  opts.push(correct);
  return cbShuffle(opts);
}

/* 10 a card at level 1, rising 5 a level, times the streak multiplier. */
function cdCardPoints(s){
  return (10 + 5 * (s.level - 1)) * Math.min(4, 1 + Math.floor(s.streak / 5));
}

function cdNext(){
  if (!cd || cd.phase !== 'play') return;
  const body = cdBody();
  if (!body){ cdStop(); return; }
  const s = cd;
  if (s.answered >= CD_CARDS){ cdFinish(); return; }
  const was = s.level;
  s.level = Math.min(s.levels.length, 1 + Math.floor(s.correct / CD_PROMOTE_EVERY));
  s.promoted = s.level > was;
  if (s.level > s.topLevel) s.topLevel = s.level;
  s.cur = cdPickCard();
  s.prev = s.cur;
  s.opts = cdOptions(s.cur);
  s.locked = false;
  const answers = s.opts.map((n, i) =>
    `<button type="button" class="cb-answer" id="cd-opt-${i}" onclick="cdAnswer(${i})"><span class="cb-key">${i + 1}</span>${escHtml(n)}</button>`
  ).join('');
  const mult = Math.min(4, 1 + Math.floor(s.streak / 5));
  /* A one-level deck has nothing to climb, so it shows no level chip. */
  const levelChip = s.levels.length > 1
    ? `<span class="cb-level${s.promoted ? ' up' : ''}">${t('games.common.level', { n: s.level })}${s.promoted ? ' &#x2191;' : ''}</span>`
    : '';
  body.innerHTML =
    `<div class="cb-hud">
       <span class="cb-timer" id="cd-timer">${Math.ceil(CD_CARD_MS / 1000)}</span>
       <span class="cb-score" id="cd-score">${t('games.common.score', { n: s.score })}</span>
       <span class="cb-streak" id="cd-streak">${s.streak >= 2 ? '&#x1F525; ' + t('games.common.inARow', { n: s.streak }) + (mult > 1 ? ' &mdash; &times;' + mult : '') : '&nbsp;'}</span>
     </div>
     <div class="cb-meta">
       <span class="cb-count">${t('games.common.cardOf', { n: s.answered + 1, total: CD_CARDS })}</span>
       ${levelChip}
     </div>
     <div class="cb-fuse"><div class="cb-fuse-fill" id="cd-fuse-fill"></div></div>
     <div class="cb-prompt"><button type="button" class="cd-play-btn" onclick="cdPlay()">&#x25B6; ${t('games.cd.playButton')}</button></div>
     <div class="cb-answers">${answers}</div>`;
  cdPlay();   // sets holdUntil / cardEndAt for this card
}

/* Wrong, or out of time: show the right button for a beat (inputs locked)
   and requeue the card. Pass the tapped index to flag it, or null when the
   clock ran out and nothing was tapped. */
function cdRevealThenNext(wrongIdx){
  const s = cd;
  s.locked = true;
  if (wrongIdx !== null){
    const hit = document.getElementById('cd-opt-' + wrongIdx);
    if (hit) hit.classList.add('wrong');
  }
  const right = document.getElementById('cd-opt-' + s.opts.indexOf(s.cur));
  if (right) right.classList.add('reveal');
  const fill = document.getElementById('cd-fuse-fill');
  if (fill){ fill.style.width = '0%'; fill.classList.remove('listening'); }
  const scoreEl = document.getElementById('cd-score');
  if (scoreEl) scoreEl.textContent = t('games.common.score', { n: s.score });
  const streakEl = document.getElementById('cd-streak');
  if (streakEl) streakEl.innerHTML = '&nbsp;';
  s.timeouts.push(setTimeout(() => {
    if (cd !== s || s.phase !== 'play') return;
    cdNext();
  }, 800));
}

function cdAnswer(i){
  if (!cd || cd.phase !== 'play' || cd.locked) return;
  const s = cd;
  const pick = s.opts[i];
  if (!pick) return;
  s.answered++;
  if (pick === s.cur){
    s.correct++;
    s.streak++;
    s.score += cdCardPoints(s);
    cdNext();
    return;
  }
  s.score = Math.max(0, s.score - 5);
  s.streak = 0;
  s.requeue.push({ name: s.cur, due: s.answered + 2 + Math.floor(Math.random() * 3) });
  cdRevealThenNext(i);
}

/* Out of time — five seconds of quiet after the chord stopped sounding.
   Costs the card and the streak, but no points: nothing was guessed wrong. */
function cdTimeUp(){
  if (!cd || cd.phase !== 'play' || cd.locked) return;
  const s = cd;
  s.answered++;
  s.streak = 0;
  s.requeue.push({ name: s.cur, due: s.answered + 2 + Math.floor(Math.random() * 3) });
  cdRevealThenNext(null);
}

function cdFinish(){
  if (!cd || cd.phase !== 'play') return;
  if (cdTick){ clearInterval(cdTick); cdTick = null; }
  cd.timeouts.forEach(clearTimeout);
  cd.timeouts = [];
  cd.phase = 'done';
  cd.prevBest = 0;
  try {
    const k = cdBestKey(cd.deck);
    cd.prevBest = parseInt(sessionStorage.getItem(k), 10) || 0;
    if (cd.score > cd.prevBest) sessionStorage.setItem(k, String(cd.score));
  } catch(e){}
  /* Cross-session best → the student's progress doc. Skipped in dev bypass
     (Firestore rejects that uid; the session best above still counts).
     v:2 marks a score from the 10-card round — a v:1 record is from the old
     60-second block and is read as no best at all rather than as a wall. */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    const old = cdSavedBest(games);
    const isNewBest = cd.score > old;
    if (isNewBest) games.cd = { v: 2, best: cd.score, deck: cd.deck, level: cd.topLevel, at: new Date().toISOString().slice(0, 10) };
    // XP only for a round with at least one right answer — letting the
    // timer run out on an untouched round is not a round played.
    if (cd.correct > 0) awardArcadeXp(isNewBest);
  }
  cdRenderDone();
}

/* The saved cross-session best, or 0 if the only record is a pre-10-card one. */
function cdSavedBest(saved){
  const rec = saved && saved.cd;
  return (rec && rec.v === 2 && rec.best) || 0;
}

function cdRenderDone(){
  const body = cdBody();
  if (!body || !cd) return;
  const acc = cd.answered ? Math.round(100 * cd.correct / cd.answered) : 0;
  const bestLine = cardBestLine(cd.prevBest, cd.score);
  const levelLine = cd.levels.length > 1
    ? `<div class="coach-overall">${t('games.common.reachedLevel', { n: cd.topLevel, total: cd.levels.length })}</div>`
    : '';
  body.innerHTML =
    `<div class="coach-report">
       <div class="cb-done-score">${cd.score}</div>
       <div class="coach-overall">${GAME_ICO.detective} ${t(cd.answered === 1 ? 'games.common.cardsAnsweredOne' : 'games.common.cardsAnsweredMany', { answered: cd.answered, correct: cd.correct, acc })}</div>
       ${levelLine}
       ${bestLine}
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="cdStart()">&#x21BB; ${t('games.common.playAgain')}</button>
         <button type="button" class="tp-btn" onclick="cdSetup()">${t('games.cd.changeDeck')}</button>
       </div>
     </div>`;
}

