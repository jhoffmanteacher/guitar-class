/* ════════════════════════════════════════════════════════════════════
   NAME THAT RIFF — 60-second ear-training sprint over the 4 core songs
   that have real note-level TAB data (RN_SONGS, the same list Riff
   Runner scrolls through — no new riffs invented). A riff plays at its
   song's real tempo, no notation shown, and you pick the song title from
   the other three. Only 4 possible answers exist total (there's only 4
   riffs with this data), so every round shows all four — the challenge
   is telling the riffs apart by ear, not narrowing a bigger pool. Same
   streak/requeue/scoring shape as Chord Blitz and Chord Detective.
   ════════════════════════════════════════════════════════════════════ */

const NTR_SECONDS = 60;

let ntr = null, ntrTick = null;

function ntrStop(){
  if (ntrTick){ clearInterval(ntrTick); ntrTick = null; }
  document.removeEventListener('keydown', ntrKeydown);
  if (ntr){
    (ntr.timeouts || []).forEach(clearTimeout);
    (ntr.noteTimeouts || []).forEach(clearTimeout);
    ntr = null;
  }
}

function ntrBody(){ return document.getElementById('ntr-body'); }

function ntrSetup(){
  ntr = { phase: 'setup', timeouts: [], noteTimeouts: [] };
  ntrRenderSetup();
}

function ntrRenderSetup(){
  const body = ntrBody();
  if (!body || !ntr) return;
  let best = 0;
  try { best = parseInt(sessionStorage.getItem('ntrBest'), 10) || 0; } catch(e){}
  body.innerHTML =
    `<div class="coach-tip">${t('games.ntr.tip')}</div>
     ${best ? `<div class="cb-setup-best">&#x1F3C6; ${t('games.common.bestTodayLabel')}: ${best}</div>` : ''}
     <button type="button" class="coach-start" onclick="ntrStart()">&#x25B6; ${t('games.ntr.startButton')}</button>`;
}

function ntrStart(){
  if (!ntr || ntr.phase === 'play') return;
  coachClose(); coachEvictTuner();   // one mic/audio owner at a time
  const s = ntr;
  s.phase = 'play';
  s.score = 0; s.streak = 0; s.answered = 0; s.correct = 0;
  s.cur = null; s.prevId = null;
  s.requeue = []; s.locked = false;
  (s.timeouts || []).forEach(clearTimeout);
  s.timeouts = [];
  s.endAt = performance.now() + NTR_SECONDS * 1000;
  document.addEventListener('keydown', ntrKeydown);   // laptop: 1–4 answer
  if (ntrTick) clearInterval(ntrTick);
  ntrTick = setInterval(ntrTimerTick, 200);
  ntrNext();
}

/* The results screen's "best" line for a game scored as one number (Chord
   Blitz, Chord Detective, Name That Riff, both Pentatonic Simons, Fret Zap,
   Pattern Detective, Build-a-Chord): a new best over this session's, or the
   session best to beat; nothing before there is one. */
function cardBestLine(prevBest, now){
  if (prevBest > 0 && now > prevBest) return `<div class="cb-newbest">&#x1F3C6; ${t('games.common.newBest', { value: prevBest })}</div>`;
  if (prevBest > 0) return `<div class="coach-tip">${t('games.common.bestTodayLabel')}: ${prevBest}.</div>`;
  return '';
}

/* Shared m:ss countdown formatter — Chord Blitz stopped needing it when it
   moved to a per-card seconds-only display (2026-09-16), but Name That Riff,
   Fret Zap, Pattern Detective and Build-a-Chord still run a 60–90s round
   timer and render this. Keep it as long as any of those four call it. */
function cbFmtTime(ms){
  const t = Math.max(0, Math.ceil(ms / 1000));
  return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
}
function ntrTimerTick(){
  if (!ntr || ntr.phase !== 'play'){
    if (ntrTick){ clearInterval(ntrTick); ntrTick = null; }
    return;
  }
  if (!ntrBody()){ ntrStop(); return; }   // panel swapped under us
  const left = ntr.endAt - performance.now();
  const el = document.getElementById('ntr-timer');
  if (el){
    el.textContent = cbFmtTime(left);
    el.classList.toggle('low', left <= 10000);
  }
  if (left <= 0) ntrFinish();
}

function ntrKeydown(e){ cardAnswerKey(e, ntr, ntrAnswer); }

/* A missed riff is due again 2–4 cards later; otherwise random from the
   4 songs. Never the same song twice in a row. */
function ntrPickCard(){
  const i = ntr.requeue.findIndex(q => q.due <= ntr.answered && q.id !== ntr.prevId);
  if (i >= 0){
    // Splice once, outside find(): inside it, it ran once per song tested.
    const id = ntr.requeue.splice(i, 1)[0].id;
    return RN_SONGS.find(s => s.id === id);
  }
  const pool = RN_SONGS.filter(s => s.id !== ntr.prevId);
  return pool[Math.floor(Math.random() * pool.length)];
}

function ntrPlay(){
  if (!ntr || !ntr.cur) return;
  if (typeof stopAllDemoAudio === 'function') stopAllDemoAudio();
  (ntr.noteTimeouts || []).forEach(clearTimeout);
  ntr.noteTimeouts = [];
  const s = ntr;
  const song = s.cur;
  const msPerBeat = 60000 / song.bpm;
  const line = gameLine();   // each note lifts the one before (gameVoice)
  song.notes.forEach(nt => {
    const midi = STRING_OPEN_MIDI[nt[0]] + nt[1];
    const at = nt[2] * msPerBeat;
    s.noteTimeouts.push(setTimeout(() => {
      if (ntr !== s || s.cur !== song) return;
      if (typeof playNote === 'function') gameVoice(line, nt[2], midi);
    }, at));
  });
}

function ntrNext(){
  if (!ntr || ntr.phase !== 'play') return;
  const body = ntrBody();
  if (!body){ ntrStop(); return; }
  const s = ntr;
  s.cur = ntrPickCard();
  s.prevId = s.cur.id;
  s.locked = false;
  const opts = cbShuffle(RN_SONGS.slice());
  s.opts = opts;
  const answers = opts.map((song, i) =>
    `<button type="button" class="cb-answer" id="ntr-opt-${i}" onclick="ntrAnswer(${i})"><span class="cb-key">${i + 1}</span>${escHtml(song.title)}</button>`
  ).join('');
  const mult = Math.min(4, 1 + Math.floor(s.streak / 5));
  const left = s.endAt - performance.now();
  body.innerHTML =
    `<div class="cb-hud">
       <span class="cb-timer${left <= 10000 ? ' low' : ''}" id="ntr-timer">${cbFmtTime(left)}</span>
       <span class="cb-score" id="ntr-score">${t('games.common.score', { n: s.score })}</span>
       <span class="cb-streak" id="ntr-streak">${s.streak >= 2 ? '&#x1F525; ' + t('games.common.inARow', { n: s.streak }) + (mult > 1 ? ' &mdash; &times;' + mult : '') : '&nbsp;'}</span>
     </div>
     <div class="cb-prompt"><button type="button" class="cd-play-btn" onclick="ntrPlay()">&#x25B6; ${t('games.ntr.playButton')}</button></div>
     <div class="cb-answers">${answers}</div>`;
  ntrPlay();
}

function ntrAnswer(i){
  if (!ntr || ntr.phase !== 'play' || ntr.locked) return;
  const s = ntr;
  const pick = s.opts[i];
  if (!pick) return;
  s.answered++;
  if (pick.id === s.cur.id){
    s.correct++;
    s.streak++;
    s.score += 10 * Math.min(4, 1 + Math.floor(s.streak / 5));
    ntrNext();
    return;
  }
  /* Wrong: show the right button for a beat (inputs locked), requeue the card. */
  s.score = Math.max(0, s.score - 5);
  s.streak = 0;
  s.requeue.push({ id: s.cur.id, due: s.answered + 2 + Math.floor(Math.random() * 3) });
  s.locked = true;
  const hit = document.getElementById('ntr-opt-' + i);
  if (hit) hit.classList.add('wrong');
  const right = document.getElementById('ntr-opt-' + s.opts.findIndex(x => x.id === s.cur.id));
  if (right) right.classList.add('reveal');
  const scoreEl = document.getElementById('ntr-score');
  if (scoreEl) scoreEl.textContent = t('games.common.score', { n: s.score });
  const streakEl = document.getElementById('ntr-streak');
  if (streakEl) streakEl.innerHTML = '&nbsp;';
  s.timeouts.push(setTimeout(() => {
    if (ntr !== s || s.phase !== 'play') return;
    ntrNext();
  }, 800));
}

function ntrFinish(){
  if (!ntr || ntr.phase !== 'play') return;
  if (ntrTick){ clearInterval(ntrTick); ntrTick = null; }
  ntr.timeouts.forEach(clearTimeout);
  ntr.timeouts = [];
  (ntr.noteTimeouts || []).forEach(clearTimeout);
  ntr.noteTimeouts = [];
  ntr.phase = 'done';
  ntr.prevBest = 0;
  try {
    ntr.prevBest = parseInt(sessionStorage.getItem('ntrBest'), 10) || 0;
    if (ntr.score > ntr.prevBest) sessionStorage.setItem('ntrBest', String(ntr.score));
  } catch(e){}
  /* Cross-session best → the student's progress doc. Skipped in dev bypass
     (Firestore rejects that uid; the session best above still counts). */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    const old = (games.ntr && games.ntr.best) || 0;
    const isNewBest = ntr.score > old;
    if (isNewBest) games.ntr = { best: ntr.score, at: new Date().toISOString().slice(0, 10) };
    // XP only for a round with at least one right answer — letting the
    // timer run out on an untouched round is not a round played.
    if (ntr.correct > 0) awardArcadeXp(isNewBest);
  }
  ntrRenderDone();
}

function ntrRenderDone(){
  const body = ntrBody();
  if (!body || !ntr) return;
  const acc = ntr.answered ? Math.round(100 * ntr.correct / ntr.answered) : 0;
  const bestLine = cardBestLine(ntr.prevBest, ntr.score);
  body.innerHTML =
    `<div class="coach-report">
       <div class="cb-done-score">${ntr.score}</div>
       <div class="coach-overall">${GAME_ICO.riffid} ${t(ntr.answered === 1 ? 'games.common.cardsAnsweredOne' : 'games.common.cardsAnsweredMany', { answered: ntr.answered, correct: ntr.correct, acc })}</div>
       ${bestLine}
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="ntrStart()">&#x21BB; ${t('games.common.playAgain')}</button>
       </div>
     </div>`;
}

/* ════════════════════════════════════════════════════════════════════
   PENTATONIC SIMON — classic call-and-response memory game, notes drawn
   from Am minor pentatonic Pattern 1 (Module 5/9's already-verified
   ascending run — see module-9.js's m9w0-s3 playSeq, notes
   [45,48,50,52,55,57,...]). Six pads = one full octave of the pattern
   (root, ♭3, 4, 5, ♭7, root). The game plays a growing sequence, you tap
   it back in order; one octave, endurance-style — no timer, no decks,
   just how long a sequence you can hold. Longest clean sequence is the
   score, persisted like every other game's best. */

const PS_NOTES = [45, 48, 50, 52, 55, 57];   // A2 C3 D3 E3 G3 A3 — Pattern 1, one octave
const PS_SHOW_MS = 650;

let ps = null;

function psStop(){
  if (ps){
    (ps.timeouts || []).forEach(clearTimeout);
    document.removeEventListener('keydown', psKeydown);
    ps = null;
  }
}

function psBody(){ return document.getElementById('ps-body'); }

function psSetup(){
  ps = { phase: 'setup', timeouts: [] };
  psRenderSetup();
}

function psRenderSetup(){
  const body = psBody();
  if (!body || !ps) return;
  let best = 0;
  try { best = parseInt(sessionStorage.getItem('psBest'), 10) || 0; } catch(e){}
  body.innerHTML =
    `<div class="coach-tip">${t('games.ps.tip')}</div>
     ${best ? `<div class="cb-setup-best">&#x1F3C6; ${t('games.common.bestTodayLabel')}: ${best}</div>` : ''}
     <button type="button" class="coach-start" onclick="psStart()">&#x25B6; ${t('games.ps.startButton')}</button>`;
}

function psPadHtml(){
  let pads = '';
  for (let i = 0; i < PS_NOTES.length; i++){
    pads += `<button type="button" class="ps-pad" id="ps-pad-${i}" onclick="psTap(${i})"><span class="ps-pad-key">${i + 1}</span></button>`;
  }
  return `<div class="ps-pads">${pads}</div>`;
}

function psStart(){
  if (!ps || ps.phase === 'play') return;
  coachClose(); coachEvictTuner();   // one mic/audio owner at a time
  const s = ps;
  s.phase = 'play';
  s.seq = []; s.round = 0; s.inputIdx = 0; s.showing = true;
  (s.timeouts || []).forEach(clearTimeout);
  s.timeouts = [];
  document.addEventListener('keydown', psKeydown);
  const body = psBody();
  if (body){
    body.innerHTML =
      `<div class="cb-hud">
         <span class="cb-score" id="ps-round">${t('games.ps.round', { n: 0 })}</span>
       </div>
       ${psPadHtml()}
       <div class="coach-tip" id="ps-status">${t('games.ps.watch')}</div>`;
  }
  psGrow();
}

function psKeydown(e){
  if (e.repeat) return;
  if (!ps || ps.phase !== 'play' || ps.showing) return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  const i = ['1', '2', '3', '4', '5', '6'].indexOf(e.key);
  if (i >= 0) psTap(i);
}

function psFlash(i, on){
  const pad = document.getElementById('ps-pad-' + i);
  if (pad) pad.classList.toggle('lit', on);
}

function psGrow(){
  const s = ps;
  if (!s || s.phase !== 'play') return;
  s.seq.push(Math.floor(Math.random() * PS_NOTES.length));
  s.showing = true; s.inputIdx = 0;
  const statusEl = document.getElementById('ps-status');
  if (statusEl) statusEl.textContent = t('games.ps.watch');
  s.seq.forEach((padIdx, i) => {
    s.timeouts.push(setTimeout(() => {
      if (!ps || ps !== s) return;
      psFlash(padIdx, true);
      if (typeof playNote === 'function') playNote(PS_NOTES[padIdx]);
      s.timeouts.push(setTimeout(() => psFlash(padIdx, false), PS_SHOW_MS * 0.6));
    }, i * PS_SHOW_MS));
  });
  s.timeouts.push(setTimeout(() => {
    if (!ps || ps !== s) return;
    s.showing = false;
    const el = document.getElementById('ps-status');
    if (el) el.textContent = t('games.ps.yourTurn');
  }, s.seq.length * PS_SHOW_MS));
}

function psTap(i){
  const s = ps;
  if (!s || s.phase !== 'play' || s.showing) return;
  psFlash(i, true);
  s.timeouts.push(setTimeout(() => psFlash(i, false), 180));
  if (typeof playNote === 'function') playNote(PS_NOTES[i]);
  if (i !== s.seq[s.inputIdx]){
    psFinish();
    return;
  }
  s.inputIdx++;
  if (s.inputIdx === s.seq.length){
    s.round++;
    const roundEl = document.getElementById('ps-round');
    if (roundEl) roundEl.textContent = t('games.ps.round', { n: s.round });
    s.showing = true;
    const statusEl = document.getElementById('ps-status');
    if (statusEl) statusEl.textContent = t('games.ps.nice');
    s.timeouts.push(setTimeout(() => psGrow(), 900));
  }
}

function psFinish(){
  const s = ps;
  if (!s || s.phase !== 'play') return;
  s.phase = 'done';
  s.timeouts.forEach(clearTimeout);
  s.timeouts = [];
  document.removeEventListener('keydown', psKeydown);
  s.prevBest = 0;
  try {
    s.prevBest = parseInt(sessionStorage.getItem('psBest'), 10) || 0;
    if (s.round > s.prevBest) sessionStorage.setItem('psBest', String(s.round));
  } catch(e){}
  /* Cross-session best → the student's progress doc. Skipped in dev bypass
     (Firestore rejects that uid; the session best above still counts). */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    const old = (games.ps && games.ps.best) || 0;
    const isNewBest = s.round > old;
    if (isNewBest) games.ps = { best: s.round, at: new Date().toISOString().slice(0, 10) };
    // No XP for a round that cleared nothing — Start, one wrong tap and
    // Done was a one-second XP farm (same class 8bae635 closed elsewhere).
    if (s.round > 0) awardArcadeXp(isNewBest);
  }
  psRenderDone();
}

function psRenderDone(){
  const body = psBody();
  if (!body || !ps) return;
  const bestLine = cardBestLine(ps.prevBest, ps.round);
  body.innerHTML =
    `<div class="coach-report">
       <div class="cb-done-score">${ps.round}</div>
       <div class="coach-overall">${GAME_ICO.simon} ${t(ps.round === 1 ? 'games.ps.roundsClearedOne' : 'games.ps.roundsCleared', { n: ps.round })}</div>
       ${bestLine}
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="psStart()">&#x21BB; ${t('games.common.playAgain')}</button>
       </div>
     </div>`;
}

/* ════════════════════════════════════════════════════════════════════
   PENTATONIC SIMON GUITAR HERO — the same growing-sequence memory game
   as Pentatonic Simon above, with the guitar as the controller. Same six
   notes (PS_NOTES — one octave of Am pentatonic Pattern 1 at fret 5), so
   the two games are genuinely the same game and share their strings
   where the wording is identical; the ONLY difference is that the answer
   comes through the mic instead of through a tap.

   Detection is fretLoop's, not nrLoop's: one pluck at a time, no onset
   detector, no clock. The first frame over COACH_PITCH_GATE after silence
   IS the pluck; readings wait out COACH_ATTACK_SKIP, are spaced ≥40ms so
   the 3-reading consensus spans more than one analyser window, and a
   spread under 0.6 semitones commits the median. There is no timer
   anywhere — a student can take as long as they like on each note.

   The pads are DISPLAY ONLY here (divs, not buttons): they name the note
   and its string+fret so the pattern stays on screen, they light during
   playback, and they go green/red as the mic judges. Two of the six pads
   are A an octave apart (pad 0 = A2, pad 5 = A3), so judging THOSE two is
   exact-midi — mixing them up is a real miss. The other four pads also
   accept the octave above (see psgJudge's octOk) since a Chromebook mic
   often hears the low strings' 2nd harmonic louder than the fundamental —
   that tolerance is skipped wherever the octave-up note would collide
   with another pad's own target, i.e. pad 0.

   ⚠️ The reference notes play through the SPEAKERS while the mic is live.
   Nothing is judged while `showing` is true, and when your turn opens the
   loop waits for the room to fall back under the gate (needSilence) before
   the first reading, so the last ringing demo note can't answer for you.
   ════════════════════════════════════════════════════════════════════ */

/* Fretboard home for each PS_NOTES entry — Pattern 1 rooted at fret 5.
   Asserted against STRING_OPEN_MIDI at load so a future edit to PS_NOTES
   can't silently leave the labels pointing at the wrong frets. */
const PSG_POS = [
  { string: 6, fret: 5 },   // A2 45
  { string: 6, fret: 8 },   // C3 48
  { string: 5, fret: 5 },   // D3 50
  { string: 5, fret: 7 },   // E3 52
  { string: 4, fret: 5 },   // G3 55
  { string: 4, fret: 7 }    // A3 57
];
PSG_POS.forEach((p, i) => {
  if (STRING_OPEN_MIDI[p.string] + p.fret !== PS_NOTES[i])
    console.warn('PSG_POS[' + i + '] does not match PS_NOTES[' + i + ']');
});
const PSG_SHOW_MS = 750;   // a touch slower than Simon's 650 — you have to read the position, not just the colour

let psg = null, psgRunning = false, psgRaf = null;

function psgBody(){ return document.getElementById('psg-body'); }

function psgStop(){
  if (psgRaf){ cancelAnimationFrame(psgRaf); psgRaf = null; }
  if (psg) (psg.timeouts || []).forEach(clearTimeout);
  if (psgRunning){ psgRunning = false; coachMicOff(); }
  psg = null;
}

function psgSetup(){
  psgStop();
  psg = { phase: 'setup', timeouts: [] };
  psgRenderSetup();
}

/* One pad. `state` is '', 'lit', 'ok' or 'bad'. */
function psgPadHtml(i, state){
  const p = PSG_POS[i];
  const pos = t('games.psg.padPos', { string: fretStringName(p.string), fret: p.fret });
  return `<div class="psg-pad${state ? ' ' + state : ''}" id="psg-pad-${i}">` +
         `<span class="psg-pad-note">${escHtml(coachNoteName(PS_NOTES[i]))}</span>` +
         `<span class="psg-pad-pos">${escHtml(pos)}</span></div>`;
}
function psgPadsHtml(){
  let pads = '';
  for (let i = 0; i < PS_NOTES.length; i++) pads += psgPadHtml(i, '');
  return `<div class="psg-pads">${pads}</div>`;
}

function psgRenderSetup(){
  const body = psgBody();
  if (!body || !psg) return;
  let best = 0;
  try { best = parseInt(sessionStorage.getItem('psgBest'), 10) || 0; } catch(e){}
  body.innerHTML =
    `<div class="coach-tip">${t('games.psg.tip')}</div>
     ${coachSetupLineHtml()}
     <div class="psg-legend">${t('games.psg.legend')}</div>
     ${psgPadsHtml()}
     ${best ? `<div class="cb-setup-best">&#x1F3C6; ${t('games.common.bestTodayLabel')}: ${best}</div>` : ''}
     <button type="button" class="coach-start" onclick="psgStart()">&#x25B6; ${t('games.psg.startButton')}</button>` +
    coachFootHtml();
}

/* Also the "play again" path off the done screen: a finished run has released
   the mic (psgFinish), so the next one has to come back through here to
   re-acquire it — otherwise the pads render over a dead analyser and the game
   sits on "Listening…" forever. Same trap fretSetLevel documents. */
async function psgStart(){
  if (psgRunning) return;
  coachClose();                    // one mic owner at a time
  ccStop();
  psStop();                        // the tap-pad twin owns no mic, but its timers would keep firing
  coachEvictTuner();
  const body = psgBody();
  if (!body) return;
  body.innerHTML = `<div class="coach-tip">${t('games.psg.startingMic')}</div>`;
  if (!coachStream && !(await coachAcquireMic({ el: body }))){
    const b2 = psgBody();
    if (b2) b2.innerHTML = `<div class="coach-note">${coachMicFailMsg()}</div>`;
    return;
  }
  await coachEnsureRunning();
  if (!psgBody()){ coachReleaseMicIfIdle(); return; }        // panel closed during the permission prompt
  if (document.hidden){ coachMicOff(); gamesShow('hub'); return; }
  stopAllDemoAudio();
  psgRunning = true;
  window.coachMicLive = true;      // stream may already be open from a prior owner
  psg = { phase: 'play', timeouts: [], seq: [], round: 0, inputIdx: 0, showing: true,
          readings: [], attackT: 0, lastPitchT: 0, needSilence: true, armAt: 0,
          heard: '', missPad: -1, heardOctaveOff: '', prevBest: 0 };
  psgBody().innerHTML =
    `<div class="cb-hud"><span class="cb-score" id="psg-round">${t('games.ps.round', { n: 0 })}</span></div>
     <div class="psg-dots" id="psg-dots"></div>
     ${psgPadsHtml()}
     <div class="psg-status" id="psg-status">${t('games.ps.watch')}</div>` +
    coachFootHtml();
  psgGrow();
  if (psgRaf) cancelAnimationFrame(psgRaf);
  psgLoop();
}

function psgMark(i, state){
  const pad = document.getElementById('psg-pad-' + i);
  if (!pad) return;
  pad.classList.remove('lit', 'ok', 'bad');
  if (state) pad.classList.add(state);
}
function psgClearMarks(){ for (let i = 0; i < PS_NOTES.length; i++) psgMark(i, ''); }

function psgStatus(html){
  const el = document.getElementById('psg-status');
  if (el) el.innerHTML = html;
}
function psgListeningHtml(){
  return `<span class="coach-live-dot"></span>${t('games.psg.yourTurn')}`;
}

function psgDots(){
  const el = document.getElementById('psg-dots');
  const s = psg;
  if (!el || !s) return;
  el.innerHTML = s.seq.map((_, i) => {
    let c = 'fret-dot';
    if (i < s.inputIdx) c += ' hit';
    else if (i === s.inputIdx && !s.showing) c += ' cur';
    return `<span class="${c}"></span>`;
  }).join('');
}

/* One more note on the end, then play the whole thing back. */
function psgGrow(){
  const s = psg;
  if (!s || s.phase !== 'play') return;
  s.seq.push(Math.floor(Math.random() * PS_NOTES.length));
  s.showing = true; s.inputIdx = 0; s.readings = []; s.attackT = 0;
  psgClearMarks();
  psgDots();
  psgStatus(t('games.ps.watch'));
  s.seq.forEach((padIdx, i) => {
    s.timeouts.push(setTimeout(() => {
      if (psg !== s || s.phase !== 'play') return;
      psgMark(padIdx, 'lit');
      if (typeof playNote === 'function') playNote(PS_NOTES[padIdx]);
      s.timeouts.push(setTimeout(() => { if (psg === s) psgMark(padIdx, ''); }, PSG_SHOW_MS * 0.6));
    }, i * PSG_SHOW_MS));
  });
  /* Hand over. needSilence + armAt keep the loop deaf until the last demo
     note has decayed, so the speakers can't answer the prompt. */
  s.timeouts.push(setTimeout(() => {
    if (psg !== s || s.phase !== 'play') return;
    s.showing = false;
    s.needSilence = true;
    s.readings = []; s.attackT = 0;
    s.armAt = performance.now() + 250;
    psgClearMarks();
    psgDots();
    psgStatus(psgListeningHtml());
  }, s.seq.length * PSG_SHOW_MS + 300));
}

function psgLoop(){
  if (!psgRunning) return;
  // Analyser gone (another feature took the mic) or panel closed under us:
  // stop cleanly instead of leaving a deaf "Listening…" UI running.
  if (!coachAnalyser || !psgBody()){ psgStop(); return; }
  const s = psg;
  const now = performance.now();
  if (s && s.phase === 'play' && !s.showing){
    const rms = coachReadFrame();
    /* One pluck = one answer: after judging, wait for the note to decay
       below the gate (or 1.8s, whichever comes first) before listening again. */
    if (s.needSilence && (rms < COACH_PITCH_GATE * 0.7 || now > s.armAt + 1800)) s.needSilence = false;
    if (!s.needSilence && now >= s.armAt && rms > COACH_PITCH_GATE){
      // Never date the pluck before armAt — the catch-up can see audio from
      // before the pads were armed (the game's own last reference note).
      if (!s.attackT) s.attackT = Math.max(coachOnsetAt, s.armAt);
      const want = PS_NOTES[s.seq[s.inputIdx]];
      // psgJudge's own rule for the octave above, so the vote can't pass what it would fail
      const m = coachSettlePitch(s, PS_NOTES.indexOf(want + 12) < 0 ? [want, want + 12] : [want], rms, s.armAt);
      if (m != null) psgJudge(m);
    } else {
      if (rms < COACH_PITCH_GATE * 0.5){
        s.readings = [];
        s.attackT = 0;    // note died — the next gate crossing is a new pluck
      }
      coachIdleTick(s, rms, s.armAt);           // a new pluck ends the wait for silence
    }
  }
  // Re-arm only while the run is live: psgJudge can end it mid-frame, and
  // re-arming unconditionally would overwrite the handle psgFinish just cleared.
  if (psgRunning) psgRaf = requestAnimationFrame(psgLoop);
}

function psgJudge(midi){
  const s = psg;
  if (!s || s.phase !== 'play' || s.showing) return;
  s.readings = [];
  s.attackT = 0;
  s.needSilence = true;
  s.armAt = performance.now() + 450;
  const padIdx = s.seq[s.inputIdx];
  // Accept the octave above too — a Chromebook mic often hears the low
  // strings' 2nd harmonic louder than the fundamental (same physics as
  // tuner.js's octave guard and coachMatchEvent/nrFinalizeEvent elsewhere in
  // this file). Skipped when that octave note is itself another pad's target
  // (true for pad 0 — A2+12 = A3 = pad 5) so a wrong-pad answer can't slip by.
  const oct = PS_NOTES[padIdx] + 12;
  const octOk = PS_NOTES.indexOf(oct) < 0 && midi === oct;
  if (midi !== PS_NOTES[padIdx] && !octOk){
    s.heard = coachNoteName(midi);
    // Pad 0 is the one pad where the octave-up harmonic is deliberately NOT
    // forgiven (see above) — so this is the one place that miss can still
    // happen, and "I heard A, the next note was A" (coachNoteName drops the
    // octave) reads as nonsense. Flag it (and which way) so the done screen
    // can say what actually happened instead of repeating the same letter.
    s.heardOctaveOff = (midi - PS_NOTES[padIdx]) % 12 === 0 ? (midi > PS_NOTES[padIdx] ? 'high' : 'low') : '';
    s.missPad = padIdx;
    psgMark(padIdx, 'bad');
    psgFinish();
    return;
  }
  psgMark(padIdx, 'ok');
  s.timeouts.push(setTimeout(() => { if (psg === s && s.phase === 'play') psgMark(padIdx, ''); }, 360));
  s.inputIdx++;
  psgDots();
  if (s.inputIdx < s.seq.length) return;
  /* Sequence cleared — freeze input (showing) so a ringing last note can't
     be read as the first note of the next round, then grow. */
  s.round++;
  s.showing = true;
  const roundEl = document.getElementById('psg-round');
  if (roundEl) roundEl.textContent = t('games.ps.round', { n: s.round });
  psgStatus(t('games.ps.nice'));
  s.timeouts.push(setTimeout(() => { if (psg === s && s.phase === 'play') psgGrow(); }, 1200));
}

/* Run over → save, release the mic, render the done screen. The mic-off
   matters: psgLoop re-arms every frame while psgRunning is true and
   #psg-body exists — and the done screen renders INTO #psg-body — so
   without it the mic stays live, window.coachMicLive stays true, and that
   silently mutes the metronome and demo audio site-wide. Unlike psgStop
   this KEEPS psg: the done screen renders from it. */
function psgFinish(){
  const s = psg;
  if (!s || s.phase !== 'play') return;
  s.phase = 'done';
  s.timeouts.forEach(clearTimeout);
  s.timeouts = [];
  if (psgRaf){ cancelAnimationFrame(psgRaf); psgRaf = null; }
  psgRunning = false;          // clear before coachMicOff so coachReleaseMicIfIdle agrees
  coachMicOff();
  try {
    s.prevBest = parseInt(sessionStorage.getItem('psgBest'), 10) || 0;
    if (s.round > s.prevBest) sessionStorage.setItem('psgBest', String(s.round));
  } catch(e){}
  /* Cross-session best → the student's progress doc. Skipped in dev bypass
     (Firestore rejects that uid; the session best above still counts). */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    const old = (games.psg && games.psg.best) || 0;
    const isNewBest = s.round > old;
    if (isNewBest) games.psg = { best: s.round, at: new Date().toISOString().slice(0, 10) };
    if (s.round > 0) awardArcadeXp(isNewBest);   // same no-XP-for-nothing rule as psFinish
  }
  psgRenderDone();
}

function psgRenderDone(){
  const body = psgBody();
  const s = psg;
  if (!body || !s) return;
  const bestLine = cardBestLine(s.prevBest, s.round);
  let missLine = '';
  if (s.missPad >= 0){
    const p = PSG_POS[s.missPad];
    const key = s.heardOctaveOff === 'high' ? 'games.psg.wrongOctaveHigh'
      : s.heardOctaveOff === 'low' ? 'games.psg.wrongOctaveLow' : 'games.psg.wrongNote';
    missLine = `<div class="coach-note">${escHtml(t(key, {
      heard: s.heard,
      want: coachNoteName(PS_NOTES[s.missPad]),
      string: fretStringName(p.string),
      fret: p.fret
    }))}</div>`;
  }
  body.innerHTML =
    `<div class="coach-report">
       <div class="cb-done-score">${s.round}</div>
       <div class="coach-overall">${GAME_ICO.simonguitar} ${t(s.round === 1 ? 'games.ps.roundsClearedOne' : 'games.ps.roundsCleared', { n: s.round })}</div>
       ${missLine}
       ${bestLine}
       <div class="coach-tip">${t('games.psg.tuneTip')}</div>
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="psgStart()">&#x21BB; ${t('games.common.playAgain')}</button>
       </div>
     </div>` + coachFootHtml();
}

/* ════════════════════════════════════════════════════════════════════
   FRET ZAP — 60-second fretboard-memory sprint. No mic and no guitar: a
   single dot lights up on a blank fretboard and you tap that note's NAME
   from four choices. Right answers build a streak that multiplies points;
   a wrong answer lights the right button green and the missed spot comes
   back a few cards later. Four decks climb the ladder — low strings only,
   then all six to fret 5, then naturals up to fret 12, then everything
   including the sharps (♯, the note a half-step above a letter). Best per
   deck is session-scoped (hub chip says "today"); the cross-session best
   goes to the progress doc via the 'games' category.
   ════════════════════════════════════════════════════════════════════ */

const FZ_SECONDS = 60;
// labelKey resolved at render time in fzRenderSetup() — never here (this
// table is built once at load, so t() here would freeze one language in).
const FZ_DECKS = [
  { id: 'lowEA', labelKey: 'games.fz.deck.lowEA',  strings: [6, 5],             maxFret: 5,  naturalsOnly: true },
  { id: 'first5', labelKey: 'games.fz.deck.first5', strings: [6, 5, 4, 3, 2, 1], maxFret: 5,  naturalsOnly: true },
  { id: 'to12',  labelKey: 'games.fz.deck.to12',   strings: [6, 5, 4, 3, 2, 1], maxFret: 12, naturalsOnly: true },
  { id: 'sharps', labelKey: 'games.fz.deck.sharps', strings: [6, 5, 4, 3, 2, 1], maxFret: 12, naturalsOnly: false }
];
/* localNoteSvg wants a string KIND ('lowE'…), we work in string NUMBERS. */
const FZ_NUM_TO_KIND = { 6: 'lowE', 5: 'A', 4: 'D', 3: 'G', 2: 'B', 1: 'highE' };
const FZ_NATURALS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
/* All 12 note names, using the same unicode ♯ coachNoteName returns. */
const FZ_ALL_NAMES = Array.from({ length: 12 }, (_, m) => coachNoteName(60 + m));

/* Precompute each deck's legal positions {string, fret, note}. A position's
   note = coachNoteName(open-string midi + fret); naturals decks drop any
   name carrying a ♯. Done once at load so card picks are just array reads. */
FZ_DECKS.forEach(d => {
  const pos = [];
  d.strings.forEach(str => {
    for (let f = 0; f <= d.maxFret; f++){
      const note = coachNoteName(STRING_OPEN_MIDI[str] + f);
      if (d.naturalsOnly && note.indexOf('♯') >= 0) continue;
      pos.push({ string: str, fret: f, note });
    }
  });
  d.positions = pos;
});

let fz = null, fzTick = null;

function fzStop(){
  if (fzTick){ clearInterval(fzTick); fzTick = null; }
  document.removeEventListener('keydown', fzKeydown);
  if (fz){
    (fz.timeouts || []).forEach(clearTimeout);
    fz = null;
  }
}

function fzBody(){ return document.getElementById('fz-body'); }
function fzBestKey(deck){ return 'fzBest:' + deck; }
function fzDeck(){ return FZ_DECKS.find(d => d.id === fz.deck) || FZ_DECKS[0]; }
function fzDeckPositions(){ return fzDeck().positions; }
function fzUniverse(){ return fzDeck().naturalsOnly ? FZ_NATURALS : FZ_ALL_NAMES; }
function fzPosKey(p){ return p.string + ':' + p.fret; }

function fzSetup(){
  let deck = 'lowEA';
  try { deck = sessionStorage.getItem('fzDeck') || deck; } catch(e){}
  if (!FZ_DECKS.some(d => d.id === deck)) deck = 'lowEA';
  fz = { phase: 'setup', deck, timeouts: [] };
  fzRenderSetup();
}

function fzPickDeck(id){
  if (!fz) return;
  fz.deck = id;
  try { sessionStorage.setItem('fzDeck', id); } catch(e){}
  fzRenderSetup();
}

function fzRenderSetup(){
  const body = fzBody();
  if (!body || !fz) return;
  const deckPills = FZ_DECKS.map(d =>
    `<button type="button" class="ts-btn${d.id === fz.deck ? ' active' : ''}" onclick="fzPickDeck('${d.id}')">${escHtml(t(d.labelKey))}</button>`
  ).join('');
  let best = 0;
  try { best = parseInt(sessionStorage.getItem(fzBestKey(fz.deck)), 10) || 0; } catch(e){}
  body.innerHTML =
    `<div class="cc-group"><div class="cc-group-title">${t('games.common.deck')}</div><div class="fret-levels">${deckPills}</div></div>
     <div class="coach-tip">${t('games.fz.tip')}</div>
     ${best ? `<div class="cb-setup-best">&#x1F3C6; ${t('games.common.bestTodayLabel')}: ${best}</div>` : ''}
     <button type="button" class="coach-start" onclick="fzStart()">&#x25B6; ${t('games.fz.startButton')}</button>`;
}

function fzStart(){
  if (!fz || fz.phase === 'play') return;
  coachClose(); coachEvictTuner();   // one mic/audio owner at a time
  const s = fz;
  s.phase = 'play';
  s.score = 0; s.streak = 0; s.answered = 0; s.correct = 0;
  s.cur = null; s.prevKey = null; s.opts = [];
  s.requeue = []; s.locked = false;
  (s.timeouts || []).forEach(clearTimeout);
  s.timeouts = [];
  s.endAt = performance.now() + FZ_SECONDS * 1000;
  document.addEventListener('keydown', fzKeydown);   // laptop: 1–4 answer
  if (fzTick) clearInterval(fzTick);
  /* 200ms so the finish check can't drift a second late; display is 1Hz anyway. */
  fzTick = setInterval(fzTimerTick, 200);
  fzNext();
}

function fzTimerTick(){
  if (!fz || fz.phase !== 'play'){
    if (fzTick){ clearInterval(fzTick); fzTick = null; }
    return;
  }
  if (!fzBody()){ fzStop(); return; }   // panel swapped under us
  const left = fz.endAt - performance.now();
  const el = document.getElementById('fz-timer');
  if (el){
    el.textContent = cbFmtTime(left);
    el.classList.toggle('low', left <= 10000);
  }
  if (left <= 0) fzFinish();
}

function fzKeydown(e){ cardAnswerKey(e, fz, fzAnswer); }

/* A missed spot is due again 2–4 cards later; otherwise a random legal
   position from the deck. Never the same (string+fret) twice in a row. */
function fzPickCard(){
  const i = fz.requeue.findIndex(q => q.due <= fz.answered && fzPosKey(q.pos) !== fz.prevKey);
  if (i >= 0) return fz.requeue.splice(i, 1)[0].pos;
  const pool = fzDeckPositions().filter(p => fzPosKey(p) !== fz.prevKey);
  return pool[Math.floor(Math.random() * pool.length)];
}

function fzShuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

function fzOptions(correct){
  const pool = fzUniverse().filter(n => n !== correct);
  const opts = fzShuffle(pool.slice()).slice(0, 3);
  opts.push(correct);
  return fzShuffle(opts);
}

function fzNext(){
  if (!fz || fz.phase !== 'play') return;
  const body = fzBody();
  if (!body){ fzStop(); return; }
  const s = fz;
  s.cur = fzPickCard();
  s.prevKey = fzPosKey(s.cur);
  s.opts = fzOptions(s.cur.note);
  s.locked = false;
  /* Blank dot ('' label) so the player names it rather than reads it. */
  const svg = (typeof localNoteSvg === 'function' && localNoteSvg(FZ_NUM_TO_KIND[s.cur.string], s.cur.fret, '')) || '';
  const answers = s.opts.map((n, i) =>
    `<button type="button" class="cb-answer" id="fz-opt-${i}" onclick="fzAnswer(${i})"><span class="cb-key">${i + 1}</span>${escHtml(n)}</button>`
  ).join('');
  const mult = Math.min(4, 1 + Math.floor(s.streak / 5));
  const left = s.endAt - performance.now();
  body.innerHTML =
    `<div class="cb-hud">
       <span class="cb-timer${left <= 10000 ? ' low' : ''}" id="fz-timer">${cbFmtTime(left)}</span>
       <span class="cb-score" id="fz-score">${t('games.common.score', { n: s.score })}</span>
       <span class="cb-streak" id="fz-streak">${s.streak >= 2 ? '&#x1F525; ' + t('games.common.inARow', { n: s.streak }) + (mult > 1 ? ' &mdash; &times;' + mult : '') : '&nbsp;'}</span>
     </div>
     <div class="cb-cols"><div class="fz-prompt">${svg}</div><div class="cb-answers">${answers}</div></div>`;
}

function fzAnswer(i){
  if (!fz || fz.phase !== 'play' || fz.locked) return;
  const s = fz;
  const pick = s.opts[i];
  if (!pick) return;
  s.answered++;
  if (pick === s.cur.note){
    s.correct++;
    s.streak++;
    s.score += 10 * Math.min(4, 1 + Math.floor(s.streak / 5));
    if (typeof playNote === 'function') playNote(STRING_OPEN_MIDI[s.cur.string] + s.cur.fret);   // reward: hear the note you just named
    fzNext();
    return;
  }
  /* Wrong: show the right button for a beat (inputs locked), requeue the spot. */
  s.score = Math.max(0, s.score - 5);
  s.streak = 0;
  s.requeue.push({ pos: s.cur, due: s.answered + 2 + Math.floor(Math.random() * 3) });
  s.locked = true;
  const hit = document.getElementById('fz-opt-' + i);
  if (hit) hit.classList.add('wrong');
  const right = document.getElementById('fz-opt-' + s.opts.indexOf(s.cur.note));
  if (right) right.classList.add('reveal');
  const scoreEl = document.getElementById('fz-score');
  if (scoreEl) scoreEl.textContent = t('games.common.score', { n: s.score });
  const streakEl = document.getElementById('fz-streak');
  if (streakEl) streakEl.innerHTML = '&nbsp;';
  s.timeouts.push(setTimeout(() => {
    if (fz !== s || s.phase !== 'play') return;
    fzNext();
  }, 800));
}

function fzFinish(){
  if (!fz || fz.phase !== 'play') return;
  if (fzTick){ clearInterval(fzTick); fzTick = null; }
  fz.timeouts.forEach(clearTimeout);
  fz.timeouts = [];
  fz.phase = 'done';
  fz.prevBest = 0;
  try {
    const k = fzBestKey(fz.deck);
    fz.prevBest = parseInt(sessionStorage.getItem(k), 10) || 0;
    if (fz.score > fz.prevBest) sessionStorage.setItem(k, String(fz.score));
  } catch(e){}
  /* Cross-session best → the student's progress doc. Skipped in dev bypass
     (Firestore rejects that uid; the session best above still counts). */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    const old = (games.fz && games.fz.best) || 0;
    const isNewBest = fz.score > old;
    if (isNewBest) games.fz = { best: fz.score, deck: fz.deck, at: new Date().toISOString().slice(0, 10) };
    // XP only for a round with at least one right answer — letting the
    // timer run out on an untouched round is not a round played.
    if (fz.correct > 0) awardArcadeXp(isNewBest);
  }
  fzRenderDone();
}

function fzRenderDone(){
  const body = fzBody();
  if (!body || !fz) return;
  const acc = fz.answered ? Math.round(100 * fz.correct / fz.answered) : 0;
  const bestLine = cardBestLine(fz.prevBest, fz.score);
  body.innerHTML =
    `<div class="coach-report">
       <div class="cb-done-score">${fz.score}</div>
       <div class="coach-overall">&#x1F4A5; ${t(fz.answered === 1 ? 'games.common.cardsAnsweredOne' : 'games.common.cardsAnsweredMany', { answered: fz.answered, correct: fz.correct, acc })}</div>
       ${bestLine}
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="fzStart()">&#x21BB; ${t('games.common.playAgain')}</button>
         <button type="button" class="tp-btn" onclick="fzSetup()">${t('games.fz.changeDeck')}</button>
       </div>
     </div>`;
}

