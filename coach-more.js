/* ════════════════════════════════════════════════════════════════════
   FINGER GYM: THE LADDER — Finger Gym 1's first event (ca-2) as an arcade
   round: frets 1-2-3-4 on the low E, then the same on the A, one finger
   per fret, quarter notes. Built ON Note Runner, not beside it: the game
   puts `gym: true` and its own level object (`lv`) on the shared `nr`
   state and renders into the same #nr-body, so the count-in, the scrolling
   TAB track, the race lane, the mic grading (onset + YIN, mic offset) and
   the results maths are Note Runner's own code. The hooks are nrLv(),
   nrGen()'s `lv.gym` branch, nrRenderReady()'s redirect, the finger label
   in nrRenderPlay(), and the early return in nrFinish().
   Speeds are the Gym's own medal ladder (the circuit step: 50 bronze,
   60 silver, 70 gold) plus 80 for platinum — each is the STARTING speed:
   the round is FG_LAPS laps of 16 notes and every lap runs FG_BPM_STEP BPM
   faster than the one before (nrLapMap carries the tempo). Score NR_PASS
   (80%) over the whole round to earn the medal and open the next one. Bests live in games.fg
   (levels: { index -> best % }), apart from games.nr, so a Gym round
   never moves Note Runner's adaptive stage or weak-spot map.
   ════════════════════════════════════════════════════════════════════ */

const FG_LAPS = 4;      // a round is this many laps...
const FG_LAP_BARS = 4;  // ...of 4 bars (16 notes: low E, A, low E, A)
const FG_BPM_STEP = 5;  // and each lap runs this many BPM faster than the last
const FG_LEVELS = [
  { medal: 'bronze',   bpm: 50 },
  { medal: 'silver',   bpm: 60 },
  { medal: 'gold',     bpm: 70 },
  { medal: 'platinum', bpm: 80 }
].map(l => ({ gym: true, strings: [6, 5], laps: FG_LAPS, lapBars: FG_LAP_BARS,
              bars: FG_LAPS * FG_LAP_BARS, bpmStep: FG_BPM_STEP, ...l }));
/* "50–65": the speeds a level's first and last laps run at. */
function fgBpmRange(lv){ return lv.bpm + '–' + (lv.bpm + (lv.laps - 1) * lv.bpmStep); }
const FG_MEDAL_ICO = { bronze: '&#x1F949;', silver: '&#x1F948;', gold: '&#x1F947;', platinum: '&#x1F3C6;' };

function fgMedal(lv){ return t('games.fg.medal.' + lv.medal); }
function fgBestKey(i){ return 'fgBest:' + i; }
function fgBestSession(i){
  let v = 0;
  try { v = parseInt(sessionStorage.getItem(fgBestKey(i)), 10) || 0; } catch(e){}
  return v;
}
function fgBestSaved(i){
  return (typeof games !== 'undefined' && games && games.fg && games.fg.levels && games.fg.levels[i]) || 0;
}
function fgBestMerged(i){ return Math.max(fgBestSession(i), fgBestSaved(i)); }
function fgUnlocked(i){
  if (typeof isGatePreviewer === 'function' && isGatePreviewer()) return true;   // same rule as nrUnlocked
  return i === 0 || fgBestMerged(i - 1) >= NR_PASS;
}
/* Fastest medal earned, for the hub chip — saved bests or this session's. */
function fgTopBpm(saved){
  let top = 0;
  FG_LEVELS.forEach((lv, i) => {
    if ((saved ? fgBestSaved(i) : fgBestSession(i)) >= NR_PASS) top = lv.bpm;
  });
  return top;
}

/* One lap: low E ladder, A ladder, twice — one bar each. The round repeats
   it FG_LAPS times (the speed changes between laps, not the notes).
   Finger = fret. */
function fgGen(lv){
  const notes = [];
  for (let b = 0; b < lv.bars; b++){
    const str = lv.strings[b % lv.strings.length];
    for (let f = 1; f <= 4; f++){
      notes.push({ string: str, fret: f, finger: f, midi: STRING_OPEN_MIDI[str] + f,
                   beat: b * 4 + (f - 1), dur: 1 });
    }
  }
  return notes;
}

function fgSetup(){
  nr = { gym: true, phase: 'home', level: 0, lv: FG_LEVELS[0], timeouts: [], pv: null, micOn: false };
  fgRenderHome();
}

function fgRenderHome(){
  const body = nrBody();
  if (!body || !nr || !nr.gym) return;
  nrHearStop();
  nr.phase = 'home';
  const cards = FG_LEVELS.map((lv, i) => {
    const un = fgUnlocked(i);
    const b = fgBestMerged(i);
    let meta;
    if (!un){
      meta = `<span class="rn-song-lock">${t('games.fg.locked', {medal: fgMedal(FG_LEVELS[i - 1])})}</span>`;
    } else if (b >= NR_PASS){
      meta = `<span class="rn-song-best">${FG_MEDAL_ICO[lv.medal]} ${t('games.fg.earned')} &middot; ${t('games.nr.bestPercent', {pct: b})}</span>`;
    } else if (b > 0){
      meta = `<span class="rn-song-best">${t('games.nr.bestPercent', {pct: b})}</span>`;
    } else {
      meta = `<span class="rn-song-best dim">${t('games.nr.notPlayedYet')}</span>`;
    }
    return `<button type="button" class="rn-song${un ? '' : ' locked'}" ${un ? `onclick="fgPick(${i})"` : 'disabled'}>
       <span class="rn-song-title">${fgMedal(lv)} &mdash; ${fgBpmRange(lv)} BPM</span>
       ${meta}</button>`;
  }).join('');
  body.innerHTML =
    `<div class="coach-tip rn-center">${t('games.fg.homeIntro', {step: FG_BPM_STEP, pct: NR_PASS})}</div>
     <div class="rn-songs">${cards}</div>`;
}

function fgPick(i){
  if (!nr || !nr.gym || !fgUnlocked(i)) return;
  nrHearStop();
  nr.level = i;
  nr.lv = FG_LEVELS[i];
  nr.phase = 'ready';
  fgRenderReady();
}

function fgRenderReady(msg){
  const body = nrBody();
  if (!body || !nr || !nr.gym) return;
  const lv = nr.lv;
  const b = fgBestMerged(nr.level);
  body.innerHTML =
    `${msg ? `<div class="coach-tip rn-center">${msg}</div>` : ''}
     <div class="coach-tip rn-center"><strong>${fgMedal(lv)} &mdash; ${fgBpmRange(lv)} BPM</strong><br>
       ${t('games.fg.readyLine', {notes: lv.bars * 4, step: lv.bpmStep, pct: NR_PASS})}</div>
     <div class="fg-ladder" aria-hidden="true">${[1, 2, 3, 4].map(f => `<span class="fg-step"><span class="fg-step-finger">${f}</span><span class="fg-step-fret">${f}</span></span>`).join('')}</div>
     <div class="coach-tip rn-center">${t('games.fg.readyHow')}</div>
     ${b > 0 ? `<div class="coach-tip rn-center">${t('games.nr.bestPercent', {pct: b})}</div>` : ''}
     <div class="rn-center">
       <button type="button" class="tp-btn" id="nr-hear" onclick="nrHear()">&#x1F50A; ${t('games.nr.hearButton')}</button>
       <button type="button" class="tp-btn" onclick="fgRenderHome()">&#x2190; ${t('games.fg.allSpeeds')}</button>
     </div>
     <div class="rn-center"><button type="button" class="coach-start" onclick="nrStart()">&#x1F3B8; ${t('games.nr.startButton')}</button></div>
     <div class="nr-slider"><label for="nr-off">${t('games.nr.offsetLabel')}</label>
       <input type="range" id="nr-off" min="0" max="250" step="5" value="${nrOffset()}" oninput="nrSetOffset(this.value)">
       <span id="nr-off-lbl">${nrOffset()} ms</span></div>
     <div class="coach-tip rn-center">${t('games.nr.offsetTip')}</div>
     <div class="coach-tip rn-center">${t('games.nr.clickNote')}</div>`;
}

/* Called from nrFinish() once the shared results maths is done (s.acc,
   s.passed). Saves the best, awards arcade XP, draws the results. */
function fgFinish(s, complete, nPerfect, nGood, nPitch, total){
  s.prevBest = fgBestMerged(s.level);
  if (s.acc > fgBestSession(s.level)){
    try { sessionStorage.setItem(fgBestKey(s.level), String(s.acc)); } catch(e){}
  }
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    if (!games.fg) games.fg = {};
    if (!games.fg.levels) games.fg.levels = {};
    let isNewBest = false;
    if (s.acc > (games.fg.levels[s.level] || 0)){
      games.fg.levels[s.level] = s.acc;
      games.fg.at = new Date().toISOString().slice(0, 10);
      isNewBest = true;
    }
    // Same rule as Note Runner: XP only for a round played through with a hit.
    if (complete && nPerfect + nGood > 0) awardArcadeXp(isNewBest);
    if (isNewBest) saveGames();
  }
  fgRenderDone(nPerfect, nGood, nPitch, total);
}

function fgRenderDone(nPerfect, nGood, nPitch, total){
  const body = nrBody();
  if (!body || !nr || !nr.gym) return;
  const s = nr;
  const lv = s.lv;
  const nxt = s.level + 1 < FG_LEVELS.length ? s.level + 1 : -1;
  const firstClear = s.passed && s.prevBest < NR_PASS;
  const nextOpen = nxt >= 0 && fgUnlocked(nxt);

  let status;
  if (s.passed && firstClear){
    status = `<div class="rn-unlock">${FG_MEDAL_ICO[lv.medal]} ${t('games.fg.passEarned', {medal: fgMedal(lv)})}${nxt >= 0
      ? ' ' + t('games.fg.passNext', {medal: fgMedal(FG_LEVELS[nxt]), bpm: fgBpmRange(FG_LEVELS[nxt])}) : ''}</div>`;
  } else if (s.passed){
    status = `<div class="coach-tip rn-center">${nxt < 0 ? t('games.fg.passTop') : t('games.fg.passAgain', {medal: fgMedal(lv)})}</div>`;
  } else {
    status = `<div class="coach-tip rn-center">${t('games.fg.fail', {pct: NR_PASS, medal: fgMedal(lv)})}</div>`;
  }

  let biasLine = '';
  if (s.errs.length >= 4){
    const med = tunerMedian(s.errs) * 1000;
    biasLine = `<div class="coach-tip rn-center">${Math.abs(med) > 25
      ? (med < 0 ? t('games.nr.biasEarly', {ms: Math.round(-med)}) : t('games.nr.biasLate', {ms: Math.round(med)}))
      : t('games.nr.biasTight')}</div>`;
  }

  const marks = s.playable.map(n => {
    const cls = n.result === 'perfect' ? 'p' : n.result === 'good' ? 'g' : n.result === 'pitch' ? 'a' : 'm';
    const sym = n.result === 'perfect' ? '&#x2605;' : n.result === 'good' ? '&#x2713;' : n.result === 'pitch' ? '~' : '&middot;';
    const str = t(n.string === 6 ? 'games.fg.strE' : 'games.fg.strA');
    return `<span class="nr-mark ${cls}" title="${escAttr(str + ' — ' + t('games.nr.fretN', {n: n.fret}))}">${sym}</span>`;
  }).join('');

  const bestLine = (s.prevBest > 0 && s.acc > s.prevBest)
    ? `<div class="sh-newbest">&#x1F3C6; ${t('games.nr.newBest', {prevBest: s.prevBest + '%'})}</div>` : '';

  body.innerHTML =
    `<div class="nr-acc ${s.passed ? 'pass' : ''}">${s.acc}%</div>
     <div class="coach-tip rn-center">${t('games.nr.resLine', {hits: nPerfect + nGood, total, perfects: nPerfect})}${nPitch ? ' ' + t('games.nr.resPitch', {n: nPitch}) : ''}</div>
     ${status}
     ${bestLine}
     <div class="nr-marks">${marks}</div>
     ${biasLine}
     <div class="rn-center">
       <button type="button" class="coach-start" onclick="fgPick(${s.level})">&#x21BB; ${t('games.nr.tryAgainButton')}</button>
       ${nextOpen ? `<button type="button" class="coach-start" onclick="fgPick(${nxt})">${t('games.fg.nextButton')} &#x2192;</button>` : ''}
       <button type="button" class="tp-btn" onclick="fgRenderHome()">&#x2190; ${t('games.fg.allSpeeds')}</button>
     </div>`;
}

/* ════════════════════════════════════════════════════════════════════
   PATTERN DETECTIVE — 60-second no-guitar eye↔ear matcher on the same
   four verified strum patterns Strum Hero and Strum Radar use
   (SH_PATTERNS — no new patterns invented). One bar of D/U notation is
   SHOWN; a strummed bar is PLAYED (Am, downs low→high, ups high→low on
   the top strings, the way a real up-strum sounds); the student judges
   match / no match. Chord Blitz's timer/streak/scoring scaffold on a
   two-button answer, so keys 1–2 answer on a laptop. No requeue — cards
   are random pairs, not a fixed pool of facts to re-drill.
   ════════════════════════════════════════════════════════════════════ */

const PD_SECONDS = 60, PD_BPM = 70;

let pd = null, pdTick = null;

function pdStop(){
  if (pdTick){ clearInterval(pdTick); pdTick = null; }
  document.removeEventListener('keydown', pdKeydown);
  if (pd){
    (pd.timeouts || []).forEach(clearTimeout);
    (pd.audioT || []).forEach(clearTimeout);
    pd = null;
  }
}

function pdBody(){ return document.getElementById('pd-body'); }

function pdSetup(){
  pd = { phase: 'setup', timeouts: [] };
  const body = pdBody();
  if (!body) return;
  let best = 0;
  try { best = parseInt(sessionStorage.getItem('pdBest'), 10) || 0; } catch(e){}
  body.innerHTML =
    `<div class="coach-tip">${t('games.pd.tip')}</div>
     ${best ? `<div class="cb-setup-best">&#x1F3C6; ${t('games.common.bestTodayLabel')}: ${best}</div>` : ''}
     <button type="button" class="coach-start" onclick="pdStart()">&#x25B6; ${t('games.pd.startButton')}</button>`;
}

function pdStart(){
  if (!pd || pd.phase === 'play') return;
  coachClose(); coachEvictTuner();   // one mic/audio owner at a time
  /* The round is judged by ear, so it has to be heard clean: a metronome or
     backing track the student left running would play under every card
     (Name That Riff's ntrPlay does the same). */
  if (typeof stopAllDemoAudio === 'function') stopAllDemoAudio();
  const s = pd;
  s.phase = 'play';
  s.score = 0; s.streak = 0; s.answered = 0; s.correct = 0;
  s.shown = null; s.played = null; s.isMatch = false;
  s.prevKey = null; s.locked = false;
  (s.timeouts || []).forEach(clearTimeout);
  (s.audioT || []).forEach(clearTimeout);
  s.timeouts = []; s.audioT = [];
  s.endAt = performance.now() + PD_SECONDS * 1000;
  document.addEventListener('keydown', pdKeydown);   // laptop: 1–2 answer
  if (pdTick) clearInterval(pdTick);
  pdTick = setInterval(pdTimerTick, 200);
  pdNext();
}

function pdTimerTick(){
  if (!pd || pd.phase !== 'play'){
    if (pdTick){ clearInterval(pdTick); pdTick = null; }
    return;
  }
  if (!pdBody()){ pdStop(); return; }   // panel swapped under us
  const left = pd.endAt - performance.now();
  const el = document.getElementById('pd-timer');
  if (el){
    el.textContent = cbFmtTime(left);
    el.classList.toggle('low', left <= 10000);
  }
  if (left <= 0) pdFinish();
}

function pdKeydown(e){
  if (e.repeat) return;
  if (!pd || pd.phase !== 'play' || pd.locked) return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  const i = ['1', '2'].indexOf(e.key);
  if (i >= 0) pdAnswer(i);
}

/* The one shown bar: same cell markup as Strum Radar's strip (reused
   classes, no ids — nothing lights up here, it's a still notation). */
function pdStripHtml(pat){
  const counts = ['1', '+', '2', '+', '3', '+', '4', '+'];
  return `<div class="sr-strip">` + pat.slots.map((d, i) =>
    `<span class="sr-slot"><span class="sr-slot-glyph${d ? '' : ' skip'}">${d || '·'}</span><span class="sr-slot-count">${counts[i]}</span></span>`
  ).join('') + `</div>`;
}

/* One short metronome-style click at an exact audio-clock time — the
   four beat clicks are the temporal reference that makes on-beat vs
   off-beat patterns tellable at all (all-downs and reggae have identical
   spacing; only the clicks reveal which side of the beat the strums sit
   on). */
function pdClickAt(at){
  const ctx = getAudioCtx();
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'square'; o.frequency.value = 1500;
  g.gain.setValueAtTime(0.1, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
  o.connect(g); g.connect(ctx.destination);
  o.start(at); o.stop(at + 0.06);
}

/* Audibly strum the PLAYED pattern's bar on Am: a down sweeps every
   sounding string low→high; an up sweeps the top four high→low, lighter
   and tighter — the way an up-strum actually comes off the pick. A click
   marks each of the four beats underneath. Same audio guards as
   strumChord (mic owner wins, context resumed). */
function pdPlayBar(){
  if (!pd || !pd.played || pd.phase !== 'play') return;
  if (window.coachMicLive) return;
  if (typeof chordMidis !== 'function' || typeof playNote !== 'function' || typeof getAudioCtx !== 'function') return;
  const midis = chordMidis('Am');
  if (!midis.length) return;
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  const s = pd;
  /* Replays and new cards silence whatever is still scheduled first —
     two bars overlapping would make the judgement unfair. */
  (s.audioT || []).forEach(clearTimeout);
  s.audioT = [];
  /* Strums already sounding are lifted by the next strum (gameVoice), the
     first strum of a replay or a new card included; `bar` keeps two bars'
     strums in separate groups. */
  if (!s.line) s.line = gameLine();
  const bar = s.barN = (s.barN || 0) + 1;
  const eighthMs = 60000 / PD_BPM / 2;
  /* Two clocks (Strum Hero's shSchedule pattern): every sound starts at
     an exact audio-clock time; its setTimeout only has to fire in the
     ~60ms cushion before it. On the JS clock alone, one GC pause would
     smear where the strums sit against the clicks — the one cue the
     whole judgement rests on. Cancellation still works: clearing a
     pending timeout cancels its not-yet-created sound. */
  const base = ctx.currentTime + 0.09;
  const schedule = (ms, fn) => {
    const at = base + ms / 1000;
    s.audioT.push(setTimeout(() => { if (pd === s && s.phase === 'play') fn(at); }, Math.max(0, Math.round(ms + 30))));
  };
  [0, 2, 4, 6].forEach(i => schedule(i * eighthMs, pdClickAt));   // beat clicks on 1, 2, 3, 4
  s.played.slots.forEach((dir, i) => {
    if (!dir) return;
    const order = dir === 'D' ? midis : midis.slice(-4).reverse();
    const stepMs = dir === 'D' ? 30 : 18;
    const vg = chordGain(order.length, true) * (dir === 'U' ? 0.8 : 1);
    order.forEach((m, j) => schedule(i * eighthMs + j * stepMs, at => gameVoice(s.line, bar + ':' + i, m, vg, at)));
  });
}

function pdNext(){
  if (!pd || pd.phase !== 'play') return;
  const body = pdBody();
  if (!body){ pdStop(); return; }
  const s = pd;
  /* New card: random shown pattern; 50/50 the played bar matches it.
     Never the exact same (shown, played) pair twice in a row. */
  for (let tries = 0; tries < 12; tries++){
    s.shown = SH_PATTERNS[Math.floor(Math.random() * SH_PATTERNS.length)];
    s.isMatch = Math.random() < 0.5;
    if (s.isMatch){
      s.played = s.shown;
    } else {
      const others = SH_PATTERNS.filter(p => p.id !== s.shown.id);
      s.played = others[Math.floor(Math.random() * others.length)];
    }
    if (s.shown.id + '/' + s.played.id !== s.prevKey) break;
  }
  s.prevKey = s.shown.id + '/' + s.played.id;
  /* Answers stay locked until the bar has fully played — deciding without
     listening would otherwise be a coin flip worth mashing (2 choices).
     The buttons unlock exactly when the last eighth ends. */
  s.locked = true;
  const labels = [t('games.pd.match'), t('games.pd.noMatch')];
  const answers = labels.map((label, i) =>
    `<button type="button" class="cb-answer" id="pd-opt-${i}" onclick="pdAnswer(${i})" disabled><span class="cb-key">${i + 1}</span>${label}</button>`
  ).join('');
  const barMs = Math.round(8 * (60000 / PD_BPM / 2)) + 150;
  s.timeouts.push(setTimeout(() => {
    if (pd !== s || s.phase !== 'play') return;
    s.locked = false;
    [0, 1].forEach(k => {
      const b = document.getElementById('pd-opt-' + k);
      if (b) b.removeAttribute('disabled');
    });
  }, barMs));
  const mult = Math.min(4, 1 + Math.floor(s.streak / 5));
  const left = s.endAt - performance.now();
  body.innerHTML =
    `<div class="cb-hud">
       <span class="cb-timer${left <= 10000 ? ' low' : ''}" id="pd-timer">${cbFmtTime(left)}</span>
       <span class="cb-score" id="pd-score">${t('games.common.score', { n: s.score })}</span>
       <span class="cb-streak" id="pd-streak">${s.streak >= 2 ? '&#x1F525; ' + t('games.common.inARow', { n: s.streak }) + (mult > 1 ? ' &mdash; &times;' + mult : '') : '&nbsp;'}</span>
     </div>
     ${pdStripHtml(s.shown)}
     <div class="cb-prompt"><button type="button" class="cd-play-btn" onclick="pdPlayBar()">&#x25B6; ${t('games.pd.playButton')}</button></div>
     <div class="cb-answers">${answers}</div>`;
  pdPlayBar();
}

function pdAnswer(i){
  if (!pd || pd.phase !== 'play' || pd.locked) return;
  const s = pd;
  const correctIdx = s.isMatch ? 0 : 1;
  s.answered++;
  if (i === correctIdx){
    s.correct++;
    s.streak++;
    s.score += 10 * Math.min(4, 1 + Math.floor(s.streak / 5));
    pdNext();
    return;
  }
  /* Wrong: show the right button for a beat (inputs locked). */
  s.score = Math.max(0, s.score - 5);
  s.streak = 0;
  s.locked = true;
  const hit = document.getElementById('pd-opt-' + i);
  if (hit) hit.classList.add('wrong');
  const right = document.getElementById('pd-opt-' + correctIdx);
  if (right) right.classList.add('reveal');
  const scoreEl = document.getElementById('pd-score');
  if (scoreEl) scoreEl.textContent = t('games.common.score', { n: s.score });
  const streakEl = document.getElementById('pd-streak');
  if (streakEl) streakEl.innerHTML = '&nbsp;';
  s.timeouts.push(setTimeout(() => {
    if (pd !== s || s.phase !== 'play') return;
    pdNext();
  }, 800));
}

function pdFinish(){
  if (!pd || pd.phase !== 'play') return;
  if (pdTick){ clearInterval(pdTick); pdTick = null; }
  pd.timeouts.forEach(clearTimeout);
  (pd.audioT || []).forEach(clearTimeout);
  pd.timeouts = []; pd.audioT = [];
  pd.phase = 'done';
  pd.prevBest = 0;
  try {
    pd.prevBest = parseInt(sessionStorage.getItem('pdBest'), 10) || 0;
    if (pd.score > pd.prevBest) sessionStorage.setItem('pdBest', String(pd.score));
  } catch(e){}
  /* Cross-session best → the student's progress doc. Skipped in dev bypass
     (Firestore rejects that uid; the session best above still counts). */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    const old = (games.pd && games.pd.best) || 0;
    const isNewBest = pd.score > old;
    if (isNewBest) games.pd = { best: pd.score, at: new Date().toISOString().slice(0, 10) };
    // XP only for a round with at least one right answer — letting the
    // timer run out on an untouched round is not a round played.
    if (pd.correct > 0) awardArcadeXp(isNewBest);
  }
  pdRenderDone();
}

function pdRenderDone(){
  const body = pdBody();
  if (!body || !pd) return;
  const acc = pd.answered ? Math.round(100 * pd.correct / pd.answered) : 0;
  const bestLine = cardBestLine(pd.prevBest, pd.score);
  body.innerHTML =
    `<div class="coach-report">
       <div class="cb-done-score">${pd.score}</div>
       <div class="coach-overall">${GAME_ICO.patterndet} ${t(pd.answered === 1 ? 'games.common.cardsAnsweredOne' : 'games.common.cardsAnsweredMany', { answered: pd.answered, correct: pd.correct, acc })}</div>
       ${bestLine}
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="pdStart()">&#x21BB; ${t('games.common.playAgain')}</button>
       </div>
     </div>`;
}

/* ════════════════════════════════════════════════════════════════════
   BUILD-A-CHORD — 90-second sprint that runs chord diagrams in REVERSE:
   a chord name comes up and the student places the shape on a blank
   grid — tap a fret square to put a finger there (tap again to clear),
   tap the header circle to flip a string between open (O) and muted (×),
   then Check. Answers grade against CHORD_DIAGRAMS — the exact shapes
   the modules teach, frets only (any finger that reaches is fine). All
   deck shapes live at position 0, so the grid is always frets 1–4.
   Chord Blitz's timer/streak/scoring scaffold; a missed chord comes
   back a couple of chords later; two misses on one chord offers a
   Show-me reveal that scores nothing but keeps the round moving.
   ════════════════════════════════════════════════════════════════════ */

const BC_SECONDS = 90;
const BC_DECKS = [
  { id: 'starter', labelKey: 'games.bc.deck.starter', chords: ['E', 'Em', 'A', 'Am', 'D', 'Dm'] },
  { id: 'all',     labelKey: 'games.bc.deck.all',     chords: ['E', 'Em', 'A', 'Am', 'D', 'Dm', 'G', 'C', 'F', 'B7'] }
];

let bc = null, bcTick = null;

function bcStop(){
  if (bcTick){ clearInterval(bcTick); bcTick = null; }
  document.removeEventListener('keydown', bcKeydown);
  if (bc){
    (bc.timeouts || []).forEach(clearTimeout);
    if (bc.flashT) clearTimeout(bc.flashT);
    bc = null;
  }
}

function bcBody(){ return document.getElementById('bc-body'); }
function bcBestKey(deck){ return 'bcBest:' + deck; }
function bcDeckChords(){
  const d = BC_DECKS.find(x => x.id === bc.deck);
  /* The grid renders frets 1–4 only. A shape living up the neck
     (position > 0, e.g. Bm or C#m) could never be built OR revealed —
     an unwinnable round — so refuse it loudly if one ever lands in
     BC_DECKS. bcTargetShape reads frets as absolute grid rows. */
  return (d || BC_DECKS[0]).chords.filter(n => {
    const def = typeof CHORD_DIAGRAMS !== 'undefined' && CHORD_DIAGRAMS[n];
    if (def && def.position > 0){
      console.warn('Build-a-Chord: skipping ' + n + ' — its shape sits at position ' + def.position + ', off the 1-4 grid');
      return false;
    }
    return true;
  });
}

function bcSetup(){
  let deck = 'starter';
  try { deck = sessionStorage.getItem('bcDeck') || deck; } catch(e){}
  if (!BC_DECKS.some(d => d.id === deck)) deck = 'starter';
  bc = { phase: 'setup', deck, timeouts: [] };
  bcRenderSetup();
}

function bcPickDeck(id){
  if (!bc) return;
  bc.deck = id;
  try { sessionStorage.setItem('bcDeck', id); } catch(e){}
  bcRenderSetup();
}

function bcRenderSetup(){
  const body = bcBody();
  if (!body || !bc) return;
  const deckPills = BC_DECKS.map(d =>
    `<button type="button" class="ts-btn${d.id === bc.deck ? ' active' : ''}" onclick="bcPickDeck('${d.id}')">${escHtml(t(d.labelKey))}</button>`
  ).join('');
  let best = 0;
  try { best = parseInt(sessionStorage.getItem(bcBestKey(bc.deck)), 10) || 0; } catch(e){}
  body.innerHTML =
    `<div class="cc-group"><div class="cc-group-title">${t('games.common.deck')}</div><div class="fret-levels">${deckPills}</div></div>
     <div class="coach-tip">${t('games.bc.tip')}</div>
     ${best ? `<div class="cb-setup-best">&#x1F3C6; ${t('games.common.bestTodayLabel')}: ${best}</div>` : ''}
     <button type="button" class="coach-start" onclick="bcStart()">&#x25B6; ${t('games.bc.startButton')}</button>`;
}

function bcStart(){
  if (!bc || bc.phase === 'play') return;
  coachClose(); coachEvictTuner();   // one mic/audio owner at a time
  const s = bc;
  s.phase = 'play';
  s.score = 0; s.streak = 0; s.done = 0; s.built = 0; s.firstTry = 0;
  s.cur = null; s.prev = null;
  s.requeue = []; s.locked = false; s.checkGuard = 0;
  if (s.flashT){ clearTimeout(s.flashT); s.flashT = null; }
  (s.timeouts || []).forEach(clearTimeout);
  s.timeouts = [];
  s.endAt = performance.now() + BC_SECONDS * 1000;
  document.addEventListener('keydown', bcKeydown);   // laptop: Enter checks
  if (bcTick) clearInterval(bcTick);
  bcTick = setInterval(bcTimerTick, 200);
  bcNextChord();
}

function bcTimerTick(){
  if (!bc || bc.phase !== 'play'){
    if (bcTick){ clearInterval(bcTick); bcTick = null; }
    return;
  }
  if (!bcBody()){ bcStop(); return; }   // panel swapped under us
  const left = bc.endAt - performance.now();
  const el = document.getElementById('bc-timer');
  if (el){
    el.textContent = cbFmtTime(left);
    el.classList.toggle('low', left <= 10000);
  }
  if (left <= 0) bcFinish();
}

function bcKeydown(e){
  if (e.key !== 'Enter') return;
  if (!bc || bc.phase !== 'play') return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  const el = e.target && e.target.closest ? e.target : null;
  /* Enter on a GRID square or string circle means "check", same as with
     nothing focused. Chrome focuses a button on click and bcRenderGrid puts
     focus back on the tapped square, so a trackpad student who builds the
     shape and presses Enter (as the tip says) is focused on a square — left
     alone, Enter would fire that square's click and take the finger off.
     preventDefault cancels that click; keyboard students place fingers with
     Space, which still clicks. The action buttons (Check / Next / Show me)
     and links keep their own Enter-click — grading here too would count
     the press twice. */
  if (el && el.closest('.bc-cell,.bc-head')) e.preventDefault();
  else if (el && el.closest('button,a,[role="button"]')) return;
  if (e.repeat || bc.locked) return;
  if (bc.revealed) bcNextBtn(); else bcCheck();
}

/* A missed chord is due again 2–3 chords later; otherwise random from the
   deck. Never the same chord twice in a row. */
function bcPickChord(){
  const i = bc.requeue.findIndex(q => q.due <= bc.done && q.name !== bc.prev);
  if (i >= 0) return bc.requeue.splice(i, 1)[0].name;
  const pool = bcDeckChords().filter(n => n !== bc.prev);
  return pool[Math.floor(Math.random() * pool.length)];
}

/* Target frets per string for the current chord, from the taught shape:
   'x' | 0 | fret number, keyed 6→1. */
function bcTargetShape(name){
  const def = (typeof CHORD_DIAGRAMS !== 'undefined' && CHORD_DIAGRAMS[name]) || null;
  const shape = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  if (def) def.chord.forEach(c => { shape[c[0]] = c[1] === 'x' ? 'x' : (c[1] || 0); });
  return shape;
}

function bcNextChord(){
  if (!bc || bc.phase !== 'play') return;
  const s = bc;
  s.cur = bcPickChord();
  s.prev = s.cur;
  s.shape = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };   // start all-open
  s.misses = 0; s.revealed = false; s.queued = false; s.locked = false;
  /* A fresh chord ignores Check for a beat — a doubled Enter right after
     a reveal would otherwise grade the untouched grid. */
  s.checkGuard = performance.now() + 300;
  bcRenderPlay();
}

function bcGridHtml(){
  const s = bc;
  const strings = [6, 5, 4, 3, 2, 1];   // low E leftmost, same as every diagram on the site
  const fretCol =
    `<div class="bc-col bc-fretcol"><span class="bc-head-spacer">&nbsp;</span>` +
    [1, 2, 3, 4].map(f => `<span class="bc-fretnum">${f}</span>`).join('') + `</div>`;
  const cols = strings.map(st => {
    const v = s.shape[st];
    /* Header circle matches the site's diagram notation: O above an OPEN
       string, × above a muted one, nothing above a fretted one — showing
       O over a placed finger would teach the wrong reading. */
    const head = `<button type="button" class="bc-head${v === 'x' ? ' muted' : ''}" onclick="bcHead(${st})" aria-label="${t('games.bc.headLabel', { string: fretStringName(st) })}">${v === 'x' ? '&times;' : (v === 0 ? 'O' : '&nbsp;')}</button>`;
    const cells = [1, 2, 3, 4].map(f =>
      `<button type="button" class="bc-cell${v === f ? ' on' : ''}" onclick="bcTap(${st},${f})" aria-label="${t('games.bc.cellLabel', { string: fretStringName(st), fret: f })}"${v === f ? ' aria-pressed="true"' : ''}></button>`
    ).join('');
    return `<div class="bc-col" id="bc-col-${st}">${head}${cells}</div>`;
  }).join('');
  return `<div class="bc-grid" id="bc-grid">${fretCol}${cols}</div>`;
}

function bcRenderGrid(){
  const wrap = document.getElementById('bc-grid-wrap');
  if (!wrap) return;
  /* innerHTML replacement drops keyboard focus to <body> — put it back on
     the same button, or building a 4-finger shape means re-tabbing from
     the top after every single tap. */
  const focused = document.activeElement;
  const key = focused && wrap.contains(focused) ? focused.getAttribute('onclick') : null;
  wrap.innerHTML = bcGridHtml();
  if (key){
    const again = wrap.querySelector(`[onclick="${key}"]`);
    if (again) again.focus();
  }
}

/* Editing the grid clears the stale "N strings are off" line — it described
   the shape as it was at the last Check, not the one being built now. */
function bcClearStatus(){
  const status = document.getElementById('bc-status');
  if (status) status.innerHTML = '&nbsp;';
}

function bcHead(st){
  if (!bc || bc.phase !== 'play' || bc.locked || bc.revealed) return;
  bc.shape[st] = bc.shape[st] === 'x' ? 0 : 'x';
  bcClearStatus();
  bcRenderGrid();
}

function bcTap(st, f){
  if (!bc || bc.phase !== 'play' || bc.locked || bc.revealed) return;
  bc.shape[st] = bc.shape[st] === f ? 0 : f;
  bcClearStatus();
  bcRenderGrid();
}

function bcStreakHtml(s){
  const mult = Math.min(4, 1 + Math.floor(s.streak / 5));
  return s.streak >= 2 ? '&#x1F525; ' + t('games.common.inARow', { n: s.streak }) + (mult > 1 ? ' &mdash; &times;' + mult : '') : '&nbsp;';
}

function bcRenderPlay(){
  const body = bcBody();
  if (!body || !bc) return;
  const s = bc;
  const left = s.endAt - performance.now();
  const actions = s.revealed
    ? `<div class="coach-tip bc-reveal-line">${t('games.bc.revealLine', { name: escHtml(s.cur) })}</div>
       <button type="button" class="coach-start" onclick="bcNextBtn()">${t('games.bc.nextButton')} &#x2192;</button>`
    : `<button type="button" class="coach-start" onclick="bcCheck()">&#x2713; ${t('games.bc.checkButton')}</button>
       ${s.misses >= 2 ? `<button type="button" class="tp-btn" onclick="bcReveal()">${t('games.bc.showMe')}</button>` : ''}`;
  body.innerHTML =
    `<div class="cb-hud">
       <span class="cb-timer${left <= 10000 ? ' low' : ''}" id="bc-timer">${cbFmtTime(left)}</span>
       <span class="cb-score" id="bc-score">${t('games.common.score', { n: s.score })}</span>
       <span class="cb-streak" id="bc-streak">${bcStreakHtml(s)}</span>
     </div>
     <div class="bc-prompt">${t('games.bc.buildPrompt', { name: escHtml(s.cur) })}</div>
     <div id="bc-grid-wrap">${bcGridHtml()}</div>
     <div class="bc-status" id="bc-status">&nbsp;</div>
     <div class="bc-actions">${actions}</div>`;
}

function bcCheck(){
  if (!bc || bc.phase !== 'play' || bc.locked || bc.revealed) return;
  if (performance.now() < (bc.checkGuard || 0)) return;
  const s = bc;
  const target = bcTargetShape(s.cur);
  const wrong = [6, 5, 4, 3, 2, 1].filter(st => s.shape[st] !== target[st]);
  if (!wrong.length){
    if (s.misses === 0) s.firstTry++;
    s.streak++;
    s.score += 20 * Math.min(4, 1 + Math.floor(s.streak / 5));
    s.done++; s.built++;
    s.locked = true;
    if (typeof strumChord === 'function') strumChord(s.cur);   // reward: hear what you built
    const scoreEl = document.getElementById('bc-score');
    if (scoreEl) scoreEl.textContent = t('games.common.score', { n: s.score });
    const streakEl = document.getElementById('bc-streak');
    if (streakEl) streakEl.innerHTML = bcStreakHtml(s);   // the streak (and its ×2/×3) just changed
    const grid = document.getElementById('bc-grid');
    if (grid) grid.classList.add('right');
    s.timeouts.push(setTimeout(() => {
      if (bc !== s || s.phase !== 'play') return;
      bcNextChord();
    }, 600));
    return;
  }
  /* Wrong: say HOW MANY strings are off, never which — naming the strings
     would turn the game into a guided solver (the same hint-leak class the
     quiz fairness pass closed). The shape stays on the grid for fixing;
     the third miss reveals the answer and moves on, unscored. */
  s.score = Math.max(0, s.score - 5);
  s.streak = 0;
  s.misses++;
  if (!s.queued){
    s.requeue.push({ name: s.cur, due: s.done + 2 + Math.floor(Math.random() * 2) });
    s.queued = true;
  }
  if (s.misses >= 3){ bcReveal(); return; }
  /* Debounce: a double-tap (or doubled Enter) on a wrong shape would
     otherwise burn two misses and double the penalty — one grade per
     gesture. The grid itself stays editable for fixing. */
  s.checkGuard = performance.now() + 350;
  const scoreEl = document.getElementById('bc-score');
  if (scoreEl) scoreEl.textContent = t('games.common.score', { n: s.score });
  const streakEl = document.getElementById('bc-streak');
  if (streakEl) streakEl.innerHTML = '&nbsp;';
  if (s.misses === 2){ bcRenderPlay(); }   // the Show-me button appears
  const status = document.getElementById('bc-status');
  if (status) status.textContent = wrong.length === 1 ? t('games.bc.offByOne') : t('games.bc.offByMany', { n: wrong.length });
  const grid = document.getElementById('bc-grid');
  if (grid) grid.classList.add('miss');
  if (s.flashT) clearTimeout(s.flashT);
  s.flashT = setTimeout(() => {
    if (bc !== s || s.phase !== 'play') return;
    const g2 = document.getElementById('bc-grid');
    if (g2) g2.classList.remove('miss');
  }, 900);
}

function bcReveal(){
  if (!bc || bc.phase !== 'play' || bc.locked || bc.revealed) return;
  /* Same debounce as Check: when the second miss re-renders the actions
     row, the Show-me button appears under a double-tap's second tap. */
  if (performance.now() < (bc.checkGuard || 0)) return;
  bc.shape = bcTargetShape(bc.cur);
  bc.revealed = true;
  bc.streak = 0;
  if (typeof strumChord === 'function') strumChord(bc.cur);
  bcRenderPlay();
}

function bcNextBtn(){
  if (!bc || bc.phase !== 'play' || !bc.revealed) return;
  bc.done++;   // revealed chords count as seen (and re-queued), just unscored
  bcNextChord();
}

function bcFinish(){
  if (!bc || bc.phase !== 'play') return;
  if (bcTick){ clearInterval(bcTick); bcTick = null; }
  bc.timeouts.forEach(clearTimeout);
  bc.timeouts = [];
  if (bc.flashT){ clearTimeout(bc.flashT); bc.flashT = null; }
  bc.phase = 'done';
  bc.prevBest = 0;
  try {
    const k = bcBestKey(bc.deck);
    bc.prevBest = parseInt(sessionStorage.getItem(k), 10) || 0;
    if (bc.score > bc.prevBest) sessionStorage.setItem(k, String(bc.score));
  } catch(e){}
  /* Cross-session best → the student's progress doc. Skipped in dev bypass
     (Firestore rejects that uid; the session best above still counts). */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    const old = (games.bc && games.bc.best) || 0;
    const isNewBest = bc.score > old;
    if (isNewBest) games.bc = { best: bc.score, deck: bc.deck, at: new Date().toISOString().slice(0, 10) };
    // XP only for a round with at least one chord built — a revealed
    // ("Show me") chord is seen, not built, and an untouched round is idle.
    if (bc.built > 0) awardArcadeXp(isNewBest);
  }
  bcRenderDone();
}

function bcRenderDone(){
  const body = bcBody();
  if (!body || !bc) return;
  const acc = bc.done ? Math.round(100 * bc.firstTry / bc.done) : 0;
  const bestLine = cardBestLine(bc.prevBest, bc.score);
  body.innerHTML =
    `<div class="coach-report">
       <div class="cb-done-score">${bc.score}</div>
       <div class="coach-overall">${GAME_ICO.buildchord} ${t(bc.built === 1 ? 'games.bc.doneLineOne' : 'games.bc.doneLine', { built: bc.built, acc })}</div>
       ${bestLine}
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="bcStart()">&#x21BB; ${t('games.common.playAgain')}</button>
         <button type="button" class="tp-btn" onclick="bcSetup()">${t('games.bc.changeDeck')}</button>
       </div>
     </div>`;
}
