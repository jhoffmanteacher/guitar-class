/* ════════════════════════════════════════════════════════════════════
   STRUM HERO — one-button rhythm game for the curriculum's strumming
   patterns. Down/up arrows slide toward a hit line over an audible
   metronome; the student taps (spacebar, or the big pad) on every strum
   and gets graded on timing. No mic — the click can be loud because
   nothing is listening. Unlike the other games' performance.now grids,
   the clicks here are scheduled on the AUDIO clock (a ~25ms lookahead
   scheduler posting osc.start(t) ahead of time), so they stay steady even
   when the event loop hiccups; taps are bridged into that clock via an
   epoch pair captured at round start.
   ════════════════════════════════════════════════════════════════════ */

const SH_BARS = 8;
/* slots = one bar of eighth positions (1 + 2 + 3 + 4 +): 'D', 'U', or
   null for "hand moves, pick misses". Straight from the curriculum:
   Module 4 Set 1 (all downs), M4 Set 2 / M6 Set 1 (down-up eighths),
   M6 Set 2 (Old Faithful), M6 Set 3 (reggae chop). */
const SH_PATTERNS = [
  { id: 'downs',    labelKey: 'games.sh.pattern.downs.label',
    hintKey: 'games.sh.pattern.downs.hint',
    slots: ['D', null, 'D', null, 'D', null, 'D', null], minBpm: 50, maxBpm: 120, defBpm: 60 },
  { id: 'eighths',  labelKey: 'games.sh.pattern.eighths.label',
    hintKey: 'games.sh.pattern.eighths.hint',
    slots: ['D', 'U', 'D', 'U', 'D', 'U', 'D', 'U'], minBpm: 50, maxBpm: 120, defBpm: 70 },
  { id: 'faithful', labelKey: 'games.sh.pattern.faithful.label',
    hintKey: 'games.sh.pattern.faithful.hint',
    slots: ['D', null, 'D', 'U', null, 'U', 'D', 'U'], minBpm: 50, maxBpm: 120, defBpm: 70 },
  { id: 'reggae',   labelKey: 'games.sh.pattern.reggae.label',
    hintKey: 'games.sh.pattern.reggae.hint',
    slots: [null, 'U', null, 'U', null, 'U', null, 'U'], minBpm: 50, maxBpm: 120, defBpm: 70 }
];

let sh = null, shRaf = null;

function shStop(){
  if (shRaf){ cancelAnimationFrame(shRaf); shRaf = null; }
  document.removeEventListener('keydown', shKeydown);
  if (sh){
    if (sh.sched){ clearInterval(sh.sched); sh.sched = null; }
    (sh.timeouts || []).forEach(clearTimeout);
    sh = null;
  }
}

function shBody(){ return document.getElementById('sh-body'); }
function shBestKey(patId){ return 'shBest:' + patId; }

/* Session best per pattern is a JSON {score, bpm} — the tempo it was set
   at matters to the student ("2400 at 70 BPM"). */
function shBestRead(patId){
  try {
    const b = JSON.parse(sessionStorage.getItem(shBestKey(patId)));
    if (b && b.score > 0) return { score: Math.round(b.score), bpm: Math.round(b.bpm) || 0 };
  } catch(e){}
  return null;
}

function shSetup(){
  let patIdx = 0, bpm = 0;
  try {
    const pid = sessionStorage.getItem('shPat');
    const i = SH_PATTERNS.findIndex(p => p.id === pid);
    if (i >= 0) patIdx = i;
    bpm = parseInt(sessionStorage.getItem('shBpm'), 10) || 0;
  } catch(e){}
  const pat = SH_PATTERNS[patIdx];
  if (!(bpm >= pat.minBpm && bpm <= pat.maxBpm)) bpm = pat.defBpm;
  sh = { phase: 'setup', patIdx, bpm, timeouts: [] };
  shRenderSetup();
}

function shPickPat(i){
  if (!sh) return;
  sh.patIdx = i;
  const pat = SH_PATTERNS[i];
  try { sessionStorage.setItem('shPat', pat.id); } catch(e){}
  /* Keep the student's chosen tempo if it fits the new pattern, else the
     pattern's own default (only "all downs" differs, at 60). */
  let stored = 0;
  try { stored = parseInt(sessionStorage.getItem('shBpm'), 10) || 0; } catch(e){}
  sh.bpm = (stored >= pat.minBpm && stored <= pat.maxBpm) ? stored : pat.defBpm;
  shRenderSetup();
}

function shNudgeBpm(d){
  if (!sh) return;
  const pat = SH_PATTERNS[sh.patIdx];
  sh.bpm = Math.min(pat.maxBpm, Math.max(pat.minBpm, sh.bpm + d));
  try { sessionStorage.setItem('shBpm', String(sh.bpm)); } catch(e){}
  const el = document.getElementById('sh-bpm-readout');
  if (el) el.textContent = sh.bpm + ' BPM';
  else shRenderSetup();
}

/* The site's monospace strum notation (.strum-line, as in Module 6):
   D/U over the count row, · for the skipped positions. */
function shPatternLineHtml(pat){
  const row = pat.slots.map(d => d ? d : '<span class="su-skip">·</span>').join('   ');
  return `<div class="strum-line">${row}\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>`;
}

function shRenderSetup(msg){
  const body = shBody();
  if (!body || !sh) return;
  const pills = SH_PATTERNS.map((p, i) =>
    `<button type="button" class="ts-btn${i === sh.patIdx ? ' active' : ''}" onclick="shPickPat(${i})">${escHtml(t(p.labelKey))}</button>`
  ).join('');
  const pat = SH_PATTERNS[sh.patIdx];
  const best = shBestRead(pat.id);
  body.innerHTML =
    (msg ? `<div class="coach-note">${escHtml(msg)}</div>` : '') +
    `<div class="cc-group"><div class="cc-group-title">${t('games.sh.patternGroupTitle')}</div><div class="fret-levels">${pills}</div></div>
     ${shPatternLineHtml(pat)}
     <div class="coach-tip">${escHtml(t(pat.hintKey))}</div>
     <div class="coach-bpm-row">
       <button type="button" class="tp-btn" onclick="shNudgeBpm(-5)">&#x2212;5</button>
       <span class="coach-bpm-readout" id="sh-bpm-readout">${sh.bpm} BPM</span>
       <button type="button" class="tp-btn" onclick="shNudgeBpm(5)">+5</button>
       ${best ? `<span class="cc-best">${t('games.common.bestTodayValue', {value: best.score + (best.bpm ? ' (' + t('games.common.atBpm', {bpm: best.bpm}) + ')' : '')})}</span>` : ''}
     </div>
     <div class="coach-tip">${t('games.sh.tipArrows')}</div>
     <button type="button" class="coach-start" onclick="shStart()">${t('games.sh.startBarsButton', {bars: SH_BARS})}</button>`;
}

/* One metronome click on `ctx`, scheduled at an exact audio-clock time —
   beep()'s envelope recipe, parameterized with a future start. Same voice
   as the count-in (660 normal / 990 accent), but quieter. Strum Hero, Riff
   Roulette and Riff Runner each click through this (their own ctx and
   level). */
function gameClickAt(ctx, t, accent, level){
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.frequency.value = accent ? 990 : 660;
  g.gain.setValueAtTime(level, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  o.start(t); o.stop(t + 0.05);
}
function shClickAt(t, accent){ gameClickAt(sh.ctx, t, accent, 0.25); }

/* Short muted-strum "chick" on every tap (filtered noise burst) so
   tapping feels like strumming, not like clicking a button. */
function shChick(){
  const ctx = sh.ctx;
  const n = Math.ceil(ctx.sampleRate * 0.04);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 1;
  const g = ctx.createGain();
  g.gain.value = 0.3;
  src.connect(bp); bp.connect(g); g.connect(ctx.destination);
  src.start();
}

/* Lookahead scheduler (the "two clocks" pattern): every ~25ms, post any
   click due in the next ~120ms at its exact audio-clock time. Clicks on
   QUARTER beats only — 4 count-in clicks (beat 4 high, like coachCountIn),
   then bars 1–8 with beat 1 of each bar accented. */
function shSchedule(){
  const s = sh;
  if (!s || (s.phase !== 'countin' && s.phase !== 'play')) return;
  const horizon = s.ctx.currentTime + 0.12;
  while (s.nextClick < 4 + SH_BARS * 4){
    const t = s.startAt + s.nextClick * s.spb;
    if (t >= horizon) break;
    const accent = s.nextClick < 4 ? s.nextClick === 3 : (s.nextClick - 4) % 4 === 0;
    shClickAt(t, accent);
    s.nextClick++;
  }
}

async function shStart(){
  if (!sh || sh.phase === 'countin' || sh.phase === 'play') return;
  if (typeof getAudioCtx !== 'function'){ shRenderSetup(t('games.sh.noSoundMsg')); return; }
  coachClose(); coachEvictTuner();   // one mic/audio owner at a time
  const s = sh;
  s.phase = 'countin';
  stopAllDemoAudio();
  const ctx = getAudioCtx();
  /* beep() assumes a running context; we schedule on the audio clock, so
     a suspended (autoplay-blocked) clock must actually be running before
     we capture the epoch — hence the await, with the usual stale guard. */
  if (ctx.state === 'suspended'){
    try { await ctx.resume(); } catch(e){}
  }
  if (sh !== s || s.phase !== 'countin') return;   // panel switched during the resume
  if (!shBody()){ shStop(); return; }

  const pat = SH_PATTERNS[s.patIdx];
  s.ctx = ctx;
  s.spb = 60 / s.bpm;                              // seconds per quarter beat
  /* Hit windows: Perfect ±70ms, Good ±140ms — capped at 45% of the
     eighth-slot spacing so neighbouring windows can't overlap at speed. */
  s.good = Math.min(0.140, 0.45 * (s.spb / 2));
  s.perfect = Math.min(0.070, s.good);
  /* Clock bridge: DOM taps arrive in performance.now() ms; clicks live on
     ctx.currentTime seconds. One epoch pair converts between them. */
  s.epoch = performance.now() - ctx.currentTime * 1000;
  s.startAt = ctx.currentTime + 0.25;              // count-in beat 1
  s.t0 = s.startAt + 4 * s.spb;                    // bar 1, beat 1
  s.notes = [];
  for (let b = 0; b < SH_BARS; b++){
    pat.slots.forEach((dir, i) => {
      if (dir) s.notes.push({ t: s.t0 + (b * 4 + i / 2) * s.spb, dir, result: null });
    });
  }
  s.score = 0; s.combo = 0; s.maxCombo = 0; s.extras = 0;
  s.errs = [];                                     // signed tap errors (s), for the early/late line
  s.sweepIdx = 0; s.lastBeat = -1; s.nextClick = 0;
  shRenderPlay();
  s.els = s.notes.map((_, i) => document.getElementById('sh-n-' + i));
  document.addEventListener('keydown', shKeydown);   // spacebar taps
  if (s.sched) clearInterval(s.sched);
  s.sched = setInterval(shSchedule, 25);
  shSchedule();
  if (shRaf) cancelAnimationFrame(shRaf);
  shLoop();
}

function shRenderPlay(){
  const body = shBody();
  if (!body || !sh) return;
  const arrows = sh.notes.map((n, i) =>
    `<span class="sh-arrow" id="sh-n-${i}"><span class="sh-arrow-glyph">${n.dir === 'D' ? '&#x2193;' : '&#x2191;'}</span><span class="sh-arrow-letter">${n.dir}</span></span>`
  ).join('');
  body.innerHTML =
    `<div class="sh-hud">
       <span class="sh-score" id="sh-score">${t('games.common.score', {n: 0})}</span>
       <span class="sh-combo" id="sh-combo">&nbsp;</span>
       <span class="sh-bar" id="sh-bar">${t('games.sh.getReady')}</span>
     </div>
     <div class="cc-beats" id="sh-beats"><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span></div>
     <div class="sh-lane" id="sh-lane"><div class="sh-hitline"></div>${arrows}<div class="sh-count" id="sh-count">&nbsp;</div></div>
     <button type="button" class="sh-pad" onpointerdown="shPadTap(event)">
       <span class="sh-pad-label">${t('games.sh.tapPadLabel')}</span>
       <span class="sh-pad-sub">${t('games.sh.tapPadSub')}</span>
     </button>
     <button type="button" class="tp-btn coach-stop" onclick="shFinish()">&#x25A0; ${t('games.common.stop')}</button>`;
}

function shKeydown(e){
  if (e.key !== ' ' && e.code !== 'Space') return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  e.preventDefault();                // space would scroll / re-click a focused button
  if (e.repeat) return;
  shTap(e.timeStamp);
}

function shPadTap(e){
  shTap(e.timeStamp);
}

function shHudRefresh(){
  const s = sh;
  const scoreEl = document.getElementById('sh-score');
  if (scoreEl) scoreEl.textContent = t('games.common.score', {n: s.score});
  const comboEl = document.getElementById('sh-combo');
  if (comboEl){
    const mult = Math.min(4, 1 + Math.floor(s.combo / 8));
    comboEl.innerHTML = s.combo >= 4
      ? '&#x1F525; ' + t('games.common.inARow', {n: s.combo}) + (mult > 1 ? ' &mdash; &times;' + mult : '')
      : '&nbsp;';
  }
}

/* One tap: bridge it onto the audio clock, match it to the nearest open
   strum slot within the Good window. Taps during the count-in are free
   practice (they still chick, they're never graded). */
function shTap(ts){
  const s = sh;
  if (!s || (s.phase !== 'countin' && s.phase !== 'play')) return;
  shChick();
  const t = (ts - s.epoch) / 1000;
  if (t < s.t0 - s.good) return;
  let best = -1, bestAbs = Infinity;
  for (let i = 0; i < s.notes.length; i++){
    const n = s.notes[i];
    if (n.result) continue;
    if (n.t - t > s.good) break;     // notes are time-sorted — the rest are too far ahead
    const a = Math.abs(n.t - t);
    if (a < bestAbs){ bestAbs = a; best = i; }
  }
  if (best >= 0 && bestAbs <= s.good){
    const n = s.notes[best];
    s.errs.push(t - n.t);
    s.combo++;
    if (s.combo > s.maxCombo) s.maxCombo = s.combo;
    const mult = Math.min(4, 1 + Math.floor(s.combo / 8));   // ×2 at 8 in a row, cap ×4
    if (bestAbs <= s.perfect){
      n.result = 'perfect';
      s.score += 100 * mult;
      if (s.els[best]) s.els[best].classList.add('hit-perfect');
    } else {
      n.result = 'good';
      s.score += 50 * mult;
      if (s.els[best]) s.els[best].classList.add('hit-good');
    }
  } else if (t >= s.t0) {
    /* Stray tap — no slot near it. Breaks the combo, small penalty.
       (Before t0 it's still the count-in: free practice, no penalty.) */
    s.extras++;
    s.combo = 0;
    s.score = Math.max(0, s.score - 10);
  }
  shHudRefresh();
}

function shLoop(){
  if (!sh) return;
  if (!shBody()){ shStop(); return; }   // panel swapped under us
  const s = sh;
  const now = s.ctx.currentTime;

  if (s.phase === 'countin'){
    const el = document.getElementById('sh-count');
    if (now >= s.t0){
      s.phase = 'play';
      if (el) el.innerHTML = '&nbsp;';
    } else if (now >= s.startAt && el){
      el.textContent = String(Math.min(4, Math.floor((now - s.startAt) / s.spb) + 1));
    }
  }

  /* Arrow positions are a pure function of the audio clock — JS transforms,
     not CSS animations (reduced-motion zeroes those). The lane shows ~2
     bars of lookahead right of the hit line. */
  const lane = document.getElementById('sh-lane');
  if (lane){
    const laneW = lane.clientWidth;
    const hitX = laneW * 0.3;
    /* Narrow lanes show 1 bar of lookahead instead of 2, or eighth-note
       arrows smear together on phones. */
    const lookBeats = laneW < 480 ? 4 : 8;
    const pxPerSec = (laneW - hitX) / (lookBeats * s.spb);
    for (let i = 0; i < s.notes.length; i++){
      const el = s.els[i];
      if (!el) continue;
      const x = hitX + (s.notes[i].t - now) * pxPerSec;
      if (x < -60 || x > laneW + 60){
        el.style.visibility = 'hidden';
      } else {
        el.style.visibility = 'visible';
        el.style.transform = 'translateX(' + x + 'px)';
      }
    }
  }

  if (s.phase === 'play'){
    /* Slots past their window (+150ms grace) become misses. */
    while (s.sweepIdx < s.notes.length && s.notes[s.sweepIdx].result) s.sweepIdx++;
    for (let i = s.sweepIdx; i < s.notes.length; i++){
      const n = s.notes[i];
      if (n.t + s.good + 0.15 > now) break;
      if (!n.result){
        n.result = 'miss';
        s.combo = 0;
        if (s.els[i]) s.els[i].classList.add('miss');
        shHudRefresh();
      }
    }

    const beat = Math.floor((now - s.t0) / s.spb);
    if (beat !== s.lastBeat && beat >= 0){
      s.lastBeat = beat;
      const bar = Math.floor(beat / 4);
      const barEl = document.getElementById('sh-bar');
      if (barEl && bar < SH_BARS) barEl.textContent = t('games.sh.barOfTotal', {bar: bar + 1, total: SH_BARS});
      document.querySelectorAll('#sh-beats .cc-pip').forEach((el, i) => el.classList.toggle('on', i === beat % 4));
    }

    if (now > s.t0 + SH_BARS * 4 * s.spb + 0.4){ shFinish(true); return; }
  }
  shRaf = requestAnimationFrame(shLoop);
}

function shFinish(complete){
  if (!sh || (sh.phase !== 'play' && sh.phase !== 'countin')) return;
  const s = sh;
  if (s.sched){ clearInterval(s.sched); s.sched = null; }
  if (shRaf){ cancelAnimationFrame(shRaf); shRaf = null; }
  document.removeEventListener('keydown', shKeydown);
  (s.timeouts || []).forEach(clearTimeout);
  s.timeouts = [];
  s.notes.forEach(n => { if (!n.result) n.result = 'miss'; });   // early Stop: the rest never got tapped
  s.phase = 'done';
  const pat = SH_PATTERNS[s.patIdx];
  const prev = shBestRead(pat.id);
  s.prevBest = prev ? prev.score : 0;
  if (s.score > s.prevBest){
    try { sessionStorage.setItem(shBestKey(pat.id), JSON.stringify({ score: s.score, bpm: s.bpm })); } catch(e){}
  }
  /* Cross-session best → the student's progress doc. Skipped in dev bypass
     (Firestore rejects that uid; the session best above still counts). */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    // games.sh is keyed by pattern id — a best on "reggae" must not be
    // shadowed by (or silently overwrite) a higher score on "downs".
    const old = (games.sh && games.sh[pat.id] && games.sh[pat.id].best) || 0;
    const isNewBest = s.score > old;
    if (isNewBest) games.sh = Object.assign({}, games.sh, { [pat.id]: { best: s.score, bpm: s.bpm, at: new Date().toISOString().slice(0, 10) } });
    // XP is participation credit for an actual round — an immediate Start →
    // Stop is not one, and nor is a round with no strum hit.
    const hits = s.notes.filter(n => n.result === 'perfect' || n.result === 'good').length;
    if (complete && hits > 0) awardArcadeXp(isNewBest);
    /* A new best is saved on its own: awardArcadeXp is the only other
       saveGames() here, and it is gated, so a best set before an early
       Stop would otherwise sit in memory and never reach Firestore. */
    if (isNewBest) saveGames();
  }
  shRenderDone();
}

function shRenderDone(){
  const body = shBody();
  if (!body || !sh) return;
  const s = sh;
  const total = s.notes.length;
  const nPerfect = s.notes.filter(n => n.result === 'perfect').length;
  const nGood = s.notes.filter(n => n.result === 'good').length;
  const nMiss = total - nPerfect - nGood;
  const acc = total ? Math.round(100 * (nPerfect + 0.5 * nGood) / total) : 0;
  const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 50 ? 1 : 0;
  const starHtml = '&#x2605;'.repeat(stars) + '&#x2606;'.repeat(3 - stars);

  let verdict, advice;
  if (stars === 3){
    verdict = t('games.sh.verdict.three', {acc});
    advice = t('games.sh.advice.three');
  } else if (stars === 2){
    verdict = t('games.sh.verdict.two', {acc});
    advice = t('games.sh.advice.two');
  } else if (stars === 1){
    verdict = t('games.sh.verdict.one', {acc});
    advice = t('games.sh.advice.one');
  } else {
    verdict = t('games.sh.verdict.zero', {acc});
    advice = t('games.sh.advice.zero');
  }

  /* Early/late bias — median signed error over the graded taps. Only
     shown with enough taps to mean something. */
  let biasLine = '';
  if (s.errs.length >= 4){
    const med = tunerMedian(s.errs) * 1000;
    if (Math.abs(med) > 25){
      biasLine = `<div class="coach-tip sh-center">${med < 0
        ? t('games.sh.biasEarly', {ms: Math.round(-med)})
        : t('games.sh.biasLate', {ms: Math.round(med)})}</div>`;
    }
  }

  let bestLine = '';
  if (s.prevBest > 0 && s.score > s.prevBest){
    bestLine = `<div class="sh-newbest">&#x1F3C6; ${t('games.sh.newBest', {prevBest: s.prevBest})}</div>`;
  } else if (s.prevBest > 0){
    bestLine = `<div class="coach-tip sh-center">${t('games.common.bestTodayValue', {value: s.prevBest})}</div>`;
  }

  const rec = stars >= 3 ? 'up' : stars >= 1 ? 'same' : 'down';
  body.innerHTML =
    `<div class="coach-report">
       <div class="sh-done-score">${s.score}</div>
       <div class="sh-stars">${starHtml}</div>
       <div class="coach-overall">&#x1F3B8; ${escHtml(verdict)}</div>
       <div class="coach-strip">
         <span class="coach-chip ok">${t('games.sh.chipPerfect', {n: nPerfect})}</span>
         <span class="coach-chip good">${t('games.sh.chipGood', {n: nGood})}</span>
         <span class="coach-chip miss">${t('games.sh.chipMiss', {n: nMiss})}</span>
         ${s.extras ? `<span class="coach-chip dim">${t('games.sh.chipExtraTaps', {n: s.extras})}</span>` : ''}
       </div>
       ${s.maxCombo >= 8 ? `<div class="coach-tip sh-center">${t('games.sh.longestStreak', {n: s.maxCombo})}</div>` : ''}
       ${biasLine}
       ${bestLine}
       <div class="coach-crit-note">${escHtml(advice)}</div>
       <div class="coach-actions">
         <button type="button" class="${rec === 'down' ? 'coach-start' : 'tp-btn'}" onclick="shAgain(-10)">&#x2B07; &minus;10 BPM</button>
         <button type="button" class="${rec === 'same' ? 'coach-start' : 'tp-btn'}" onclick="shAgain(0)">&#x21BB; ${t('games.sh.againAtBpm', {bpm: s.bpm})}</button>
         <button type="button" class="${rec === 'up' ? 'coach-start' : 'tp-btn'}" onclick="shAgain(10)">&#x2B06; +10 BPM</button>
       </div>
       <button type="button" class="tp-btn" onclick="shSetup()">${t('games.sh.changePatternButton')}</button>
     </div>`;
}

function shAgain(d){
  if (!sh) return;
  const pat = SH_PATTERNS[sh.patIdx];
  sh.bpm = Math.min(pat.maxBpm, Math.max(pat.minBpm, sh.bpm + d));
  try { sessionStorage.setItem('shBpm', String(sh.bpm)); } catch(e){}
  sh.phase = 'setup';
  shStart();
}

/* ════════════════════════════════════════════════════════════════════
   RIFF ROULETTE — a practice spinner for the real guitar. Spin, get a
   short challenge from your current module, do it over a metronome and
   a countdown, then score yourself. Honesty is the whole game: the
   points are only worth what the practice was. No mic — the guitar in
   the student's hands is the input; the buttons are the judge. Three
   scored cards make the daily set; finishing one keeps a Firestore
   streak alive (games.rr), everything else is session-scoped like the
   other games' "today" numbers.
   ════════════════════════════════════════════════════════════════════ */

/* The card bank. Draw pool = cards whose module range contains the
   student's current module (lastModuleNum), so a challenge never asks
   for anything the class hasn't taught yet. Early-module cards age out
   (maxModule) so a Module 6 student isn't dealt open-string plucking.
   bpm null = no metronome (holds, stretches, count-your-changes cards);
   double = worth 200 instead of 100. */
const RR_CARDS = [
  /* Module 1 — open strings, thumb strums */
  { textKey: 'games.rr.card01',
    bpm: 60, secs: 30, minModule: 1, maxModule: 3 },
  { textKey: 'games.rr.card02',
    bpm: null, secs: 30, minModule: 1, maxModule: 3 },
  { textKey: 'games.rr.card03',
    bpm: null, secs: 45, minModule: 1, maxModule: 3 },
  { textKey: 'games.rr.card04',
    bpm: 60, secs: 40, minModule: 1, maxModule: 3 },
  /* Module 2 — notes on the E & A strings */
  { textKey: 'games.rr.card05',
    bpm: 60, secs: 45, minModule: 2, maxModule: 5 },
  { textKey: 'games.rr.card06',
    bpm: null, secs: 30, minModule: 2, maxModule: 5 },
  { textKey: 'games.rr.card07',
    bpm: 60, secs: 45, minModule: 2, maxModule: 5 },
  { textKey: 'games.rr.card08',
    bpm: 60, secs: 45, minModule: 2, maxModule: 5 },
  /* Module 3 — power chords, palm mute, Seven Nation Army */
  { textKey: 'games.rr.card09',
    bpm: 70, secs: 45, minModule: 3 },
  { textKey: 'games.rr.card10',
    bpm: 80, secs: 40, minModule: 3 },
  { textKey: 'games.rr.card11',
    bpm: 90, secs: 60, minModule: 3 },
  { textKey: 'games.rr.card12',
    bpm: 70, secs: 45, minModule: 3 },
  /* Module 5 — minor pentatonic Pattern 1, alternate picking */
  { textKey: 'games.rr.card13',
    bpm: 60, secs: 60, minModule: 5 },
  { textKey: 'games.rr.card14',
    bpm: 70, secs: 45, minModule: 5 },
  { textKey: 'games.rr.card15',
    bpm: 60, secs: 60, minModule: 5 },
  /* Module 4 — open chords */
  { textKey: 'games.rr.card16',
    bpm: null, secs: 60, minModule: 4 },
  { textKey: 'games.rr.card17',
    bpm: null, secs: 60, minModule: 4 },
  { textKey: 'games.rr.card18',
    bpm: 60, secs: 60, minModule: 4 },
  { textKey: 'games.rr.card19',
    bpm: null, secs: 45, minModule: 4 },
  /* Module 6 — strumming patterns, partial barres */
  { textKey: 'games.rr.card20',
    bpm: 70, secs: 60, minModule: 6 },
  { textKey: 'games.rr.card21',
    bpm: 70, secs: 45, minModule: 6 },
  { textKey: 'games.rr.card22',
    bpm: 70, secs: 60, minModule: 6 },
  { textKey: 'games.rr.card23',
    bpm: 60, secs: 45, minModule: 6 },
  /* Module 7 — full barre chords */
  { textKey: 'games.rr.card24',
    bpm: null, secs: 60, minModule: 7 },
  { textKey: 'games.rr.card25',
    bpm: null, secs: 45, minModule: 7 },
  /* Module 8 — fingerpicking */
  { textKey: 'games.rr.card26',
    bpm: 60, secs: 60, minModule: 8 },
  { textKey: 'games.rr.card27',
    bpm: 60, secs: 45, minModule: 8 },
  /* Module 9 — the full fretboard & writing TAB */
  { textKey: 'games.rr.card28',
    bpm: null, secs: 60, minModule: 9 },
  { textKey: 'games.rr.card29',
    bpm: null, secs: 45, minModule: 9 },
  /* Module 10 — scales */
  { textKey: 'games.rr.card30',
    bpm: 60, secs: 60, minModule: 10 },
  { textKey: 'games.rr.card31',
    bpm: 60, secs: 60, minModule: 10 },
  /* Module 11 — chord families */
  { textKey: 'games.rr.card32',
    bpm: null, secs: 45, minModule: 11 },
  /* Module 12 — fingerstyle */
  { textKey: 'games.rr.card33',
    bpm: 60, secs: 45, minModule: 12 },
  /* Wildcards — any module */
  { textKey: 'games.rr.card34',
    bpm: null, secs: 60, minModule: 1, double: true },
  { textKey: 'games.rr.card35',
    bpm: null, secs: 30, minModule: 1, double: true },
  { textKey: 'games.rr.card36',
    bpm: null, secs: 45, minModule: 1 },
  { textKey: 'games.rr.card37',
    bpm: null, secs: 30, minModule: 1 }
];

let rr = null;

function rrStop(){
  if (rr){
    if (rr.sched){ clearInterval(rr.sched); rr.sched = null; }
    if (rr.tick){ clearInterval(rr.tick); rr.tick = null; }
    (rr.timeouts || []).forEach(clearTimeout);
    rr = null;
  }
}

function rrBody(){ return document.getElementById('rr-body'); }

function rrNum(key){
  try { return parseInt(sessionStorage.getItem(key), 10) || 0; } catch(e){}
  return 0;
}

function rrDayStr(d){
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/* A streak is worth showing only while it's alive — kept up today or
   still winnable today (the last set was on the last school day before
   today: weekends never break it, arcadeStreakAlive in coach-hub.js).
   `today` is for tests; the site leaves it out. */
function rrStreakAlive(g, min, today){
  if (!g || !(g.streak >= (min || 2)) || !g.lastDay) return false;
  return arcadeStreakAlive(g.lastDay, today || rrDayStr(new Date()));
}

/* The streak chip on the setup screen, or '' for none. "streak started
   today" only on the day the first set was done: since weekends stopped
   breaking a streak, a 1-day streak from a Friday is still alive on
   Saturday, Sunday and Monday, and "started today" would be false there.
   Those days show no chip: 'games.rr.streakDays' has no singular ("racha
   de 1 días"). Two days or more: "N-day streak". */
function rrStreakChipText(g, today){
  today = today || rrDayStr(new Date());
  if (!rrStreakAlive(g, 1, today)) return '';
  if (g.streak === 1) return g.lastDay === today ? t('games.rr.streakStartedToday') : '';
  return t('games.rr.streakDays', {n: g.streak});
}

function rrPool(){
  const m = (typeof lastModuleNum !== 'undefined' && lastModuleNum) || 1;
  const benched = rrBenchedRead();
  const all = [], unbenched = [];
  RR_CARDS.forEach((c, i) => {
    if (!(c.minModule <= m && (!c.maxModule || m <= c.maxModule))) return;
    all.push(i);
    if (benched.indexOf(i) < 0) unbenched.push(i);
  });
  // Never let benching empty the pool — a student who benches every
  // eligible card in one sitting still needs somewhere to draw from.
  return unbenched.length ? unbenched : all;
}

/* "Not yet" cards for today — rrScore's 'not' branch benches them here so
   they don't come back up in the same session, matching the card's own
   promise ("try this card another day"). Day-scoped like rrDone/rrPts,
   cleared in rrDayReset. */
function rrBenchedRead(){
  try {
    const b = JSON.parse(sessionStorage.getItem('rrBenched'));
    if (Array.isArray(b)) return b.filter(i => Number.isInteger(i) && RR_CARDS[i]);
  } catch(e){}
  return [];
}
function rrBenchedWrite(b){
  try { sessionStorage.setItem('rrBenched', JSON.stringify(b)); } catch(e){}
}

function rrQueueRead(){
  try {
    const q = JSON.parse(sessionStorage.getItem('rrQueue'));
    if (Array.isArray(q)) return q.filter(e => e && RR_CARDS[e.idx]);
  } catch(e){}
  return [];
}

function rrQueueWrite(q){
  try { sessionStorage.setItem('rrQueue', JSON.stringify(q)); } catch(e){}
}

/* Deal a card: "Almost" cards come back once their spins-out counter
   runs down; otherwise random from the module pool. Never the same
   card twice in a row. */
function rrDraw(){
  let last = -1;
  try { last = parseInt(sessionStorage.getItem('rrLast'), 10); } catch(e){}
  if (isNaN(last)) last = -1;
  const q = rrQueueRead();
  q.forEach(e => e.due--);
  let pick = -1;
  const di = q.findIndex(e => e.due <= 0 && e.idx !== last);
  if (di >= 0) pick = q.splice(di, 1)[0].idx;
  rrQueueWrite(q);
  if (pick < 0){
    const pool = rrPool();
    const avail = pool.filter(i => i !== last);
    pick = avail.length ? avail[Math.floor(Math.random() * avail.length)] : pool[0];
  }
  try { sessionStorage.setItem('rrLast', String(pick)); } catch(e){}
  return pick;
}

/* Today's counters live in sessionStorage; a tab left open across
   midnight would otherwise carry yesterday's set into today — and a
   carried-over rrDone >= 3 would keep the daily set from ever completing.
   Called on view entry AND before every spin/skip (not on score: a card
   dealt at 23:59 still belongs to the day that dealt it). */
function rrDayReset(){
  const today = rrDayStr(new Date());
  let day = '';
  try { day = sessionStorage.getItem('rrDay') || ''; } catch(e){}
  if (day !== today){
    try {
      sessionStorage.setItem('rrDay', today);
      sessionStorage.removeItem('rrPts');
      sessionStorage.removeItem('rrDone');
      sessionStorage.removeItem('rrSkips');
      sessionStorage.removeItem('rrQueue');
      sessionStorage.removeItem('rrLast');
      sessionStorage.removeItem('rrBenched');
    } catch(e){}
  }
}

function rrSetup(){
  rrDayReset();
  rr = { phase: 'setup', timeouts: [] };
  rrRenderSetup();
}

function rrRenderSetup(justDone){
  const body = rrBody();
  if (!body || !rr) return;
  const pts = rrNum('rrPts'), done = rrNum('rrDone');
  const g = (typeof games !== 'undefined' && games && games.rr) || null;
  const streakText = rrStreakChipText(g);
  const chips =
    `<span class="rr-chip">&#x2B50; ${t('games.rr.chipPointsToday', {n: pts})}</span>
     <span class="rr-chip">&#x1F0CF; ${t('games.rr.chipCardsOfThree', {n: Math.min(done, 3)})}</span>
     ${streakText ? `<span class="rr-chip streak">&#x1F525; ${streakText}</span>` : ''}`;
  body.innerHTML =
    `<div class="coach-tip rr-center">${t('games.rr.tagline')}</div>
     <div class="rr-chips">${chips}</div>
     ${done >= 3 ? `<div class="rr-done-banner" id="rr-done-banner">&#x1F389; ${t('games.rr.doneBanner', {pts})}</div>` : ''}
     <button type="button" class="coach-start rr-spin-btn" onclick="rrSpin()">&#x1F3B0; ${t('games.rr.spinButton')}</button>`;
  if (justDone) rrCelebrate(document.getElementById('rr-done-banner'));
}

/* Small celebration over the done banner — same particles as the
   module-strip completion moment. */
function rrCelebrate(el){
  if (!el) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = el.getBoundingClientRect();
  ['\u{1F3B8}', '\u{1F3B5}', '\u2B50', '\u{1F3B6}', '\u{1F3B5}', '\u2728'].forEach((ch, i) => {
    const p = document.createElement('span');
    p.className = 'celebrate-particle';
    p.textContent = ch;
    p.style.left = (r.left + r.width / 2 - 9 + (i - 2.5) * 18) + 'px';
    p.style.top = (r.top - 4) + 'px';
    p.style.animationDelay = (i * 60) + 'ms';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1900);
  });
}

/* One-line preview for the shuffle animation — the cycling faces are
   decoration, only the final card needs to be readable. */
function rrFaceText(card){
  const text = t(card.textKey);
  return text.length > 60 ? text.slice(0, 57) + '…' : text;
}

function rrSpin(){
  if (!rr || (rr.phase !== 'setup' && rr.phase !== 'card')) return;
  rrDayReset();
  const s = rr;
  const body = rrBody();
  if (!body) return;
  s.phase = 'spin';
  s.cardIdx = rrDraw();
  (s.timeouts || []).forEach(clearTimeout);
  s.timeouts = [];
  body.innerHTML = `<div class="rr-card"><div class="rr-card-text" id="rr-face">&nbsp;</div></div>`;
  /* Shuffle: cycle card faces quickly, slowing down, then land on the
     dealt card. JS timeouts, not CSS animation, so reduced-motion users
     still see the cycle (it stays decorative either way). */
  const pool = rrPool();
  let delay = 0;
  [70, 70, 80, 90, 100, 110, 130, 150, 180].forEach(ms => {
    delay += ms;
    s.timeouts.push(setTimeout(() => {
      if (rr !== s || s.phase !== 'spin') return;
      const el = document.getElementById('rr-face');
      if (!el) return;
      const i = pool[Math.floor(Math.random() * pool.length)];
      el.textContent = rrFaceText(RR_CARDS[i]);
    }, delay));
  });
  s.timeouts.push(setTimeout(() => {
    if (rr !== s || s.phase !== 'spin') return;
    s.phase = 'card';
    rrRenderCard();
  }, delay + 200));
}

function rrRenderCard(){
  const body = rrBody();
  if (!body || !rr) return;
  const card = RR_CARDS[rr.cardIdx];
  const skipsLeft = Math.max(0, 2 - rrNum('rrSkips'));
  body.innerHTML =
    `<div class="rr-card${card.double ? ' double' : ''}">
       ${card.double ? `<div class="rr-double">&#x2B50; ${t('games.rr.doublePoints')}</div>` : ''}
       <div class="rr-card-text">${escHtml(t(card.textKey))}</div>
       <div class="rr-card-meta">
         ${card.bpm ? `<span class="rr-bpm">&#x1F3B5; ${t('games.rr.clickAtBpm', {bpm: card.bpm})}</span>` : ''}
         <span class="rr-secs">&#x23F1; ${t('games.rr.secondsLabel', {n: card.secs})}</span>
       </div>
     </div>
     <button type="button" class="coach-start" onclick="rrStart()">&#x25B6; ${t('games.common.start')}</button>
     ${skipsLeft ? `<button type="button" class="rr-skip" onclick="rrSkip()">${t('games.rr.skipCardButton', {n: skipsLeft})}</button>` : ''}`;
}

/* Two free skips a day — enough to dodge a card that doesn't fit the
   moment, not enough to fish for an easy one. */
function rrSkip(){
  if (!rr || rr.phase !== 'card') return;
  const skips = rrNum('rrSkips');
  if (skips >= 2) return;
  try { sessionStorage.setItem('rrSkips', String(skips + 1)); } catch(e){}
  rrSpin();
}

/* One metronome click at an exact audio-clock time — Strum Hero's voice
   (gameClickAt), on this game's context. */
function rrClickAt(t, accent){ gameClickAt(rr.ctx, t, accent, 0.25); }

/* Lookahead scheduler: every ~25ms, post the clicks due in the next
   ~120ms. Beat 1 of each group of 4 is accented. The beat pips ride
   this interval too — plenty smooth for a decorative pulse. */
function rrSchedule(){
  const s = rr;
  if (!s || s.phase !== 'run' || !s.ctx || !s.spb) return;   // no-metronome card: nothing to schedule
  const horizon = s.ctx.currentTime + 0.12;
  while (true){
    const t = s.startAt + s.nextClick * s.spb;
    if (t >= horizon) break;
    rrClickAt(t, s.nextClick % 4 === 0);
    s.nextClick++;
  }
  const beat = Math.floor((s.ctx.currentTime - s.startAt) / s.spb);
  if (beat !== s.lastBeat && beat >= 0){
    s.lastBeat = beat;
    document.querySelectorAll('#rr-beats .cc-pip').forEach((el, i) => el.classList.toggle('on', i === beat % 4));
  }
}

async function rrStart(){
  if (!rr || rr.phase !== 'card') return;
  coachClose(); coachEvictTuner();   // one mic/audio owner at a time
  const s = rr;
  s.phase = 'run';
  /* A card with a click plays its own, so the student's metronome must stop;
     a card with no click (holds, wildcards) plays nothing and leaves the
     metronome alone, the stopCardAudio() rule. */
  if (RR_CARDS[s.cardIdx] && RR_CARDS[s.cardIdx].bpm) stopAllDemoAudio();
  else stopCardAudio();
  /* The click is scheduled on the audio clock and the done-beeps use
     beep(), which assumes a running context — resume a suspended
     (autoplay-blocked) one first, with the usual stale guard. */
  if (typeof getAudioCtx === 'function'){
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended'){
      try { await ctx.resume(); } catch(e){}
    }
    if (rr !== s || s.phase !== 'run') return;   // panel switched during the resume
    s.ctx = ctx;
  }
  if (!rrBody()){ rrStop(); return; }
  const card = RR_CARDS[s.cardIdx];
  s.endAt = performance.now() + card.secs * 1000;
  rrRenderRun();
  if (card.bpm && s.ctx){
    s.spb = 60 / card.bpm;
    s.startAt = s.ctx.currentTime + 0.2;
    s.nextClick = 0;
    s.lastBeat = -1;
    if (s.sched) clearInterval(s.sched);
    s.sched = setInterval(rrSchedule, 25);
    rrSchedule();
  }
  if (s.tick) clearInterval(s.tick);
  /* 200ms so the finish check can't drift late; display is 1Hz anyway. */
  s.tick = setInterval(rrTick, 200);
  rrTick();
}

function rrRenderRun(){
  const body = rrBody();
  if (!body || !rr) return;
  const card = RR_CARDS[rr.cardIdx];
  body.innerHTML =
    `<div class="rr-card${card.double ? ' double' : ''}">
       ${card.double ? `<div class="rr-double">&#x2B50; ${t('games.rr.doublePoints')}</div>` : ''}
       <div class="rr-card-text">${escHtml(t(card.textKey))}</div>
       ${card.bpm ? `<div class="rr-card-meta"><span class="rr-bpm">&#x1F3B5; ${card.bpm} BPM</span></div>` : ''}
     </div>
     ${card.bpm ? '<div class="cc-beats" id="rr-beats"><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span></div>' : ''}
     <div class="rr-timer" id="rr-timer">${card.secs}</div>
     <div class="coach-tip rr-center">${t('games.rr.playUntilTimer')}</div>`;
}

function rrTick(){
  if (!rr || rr.phase !== 'run'){
    if (rr && rr.tick){ clearInterval(rr.tick); rr.tick = null; }
    return;
  }
  if (!rrBody()){ rrStop(); return; }   // panel swapped under us
  const left = rr.endAt - performance.now();
  const el = document.getElementById('rr-timer');
  if (el){
    el.textContent = String(Math.max(0, Math.ceil(left / 1000)));
    el.classList.toggle('low', left <= 5000);
  }
  if (left <= 0) rrTimeUp();
}

function rrTimeUp(){
  if (!rr || rr.phase !== 'run') return;
  const s = rr;
  if (s.sched){ clearInterval(s.sched); s.sched = null; }
  if (s.tick){ clearInterval(s.tick); s.tick = null; }
  s.phase = 'score';
  /* Same three done-beeps as the FAB timer — the site's "time's up". */
  if (typeof beep === 'function'){
    [0, 350, 700].forEach(d => s.timeouts.push(setTimeout(() => { if (rr === s) beep(660, 0.3); }, d)));
  }
  rrRenderScore();
}

function rrRenderScore(){
  const body = rrBody();
  if (!body || !rr) return;
  const card = RR_CARDS[rr.cardIdx];
  const worth = card.double ? 200 : 100;
  body.innerHTML =
    `<div class="rr-time-up">&#x23F0; ${t('games.rr.timeUp')}</div>
     <div class="coach-tip rr-center">${t('games.rr.scorePrompt')}</div>
     <div class="rr-score-row">
       <button type="button" class="rr-score-btn got" onclick="rrScore('got')">
         <span>&#x2705; ${t('games.rr.scoreGotLabel')}</span><span class="rr-score-sub">${t('games.rr.scorePointsSuffix', {n: worth})}</span>
       </button>
       <button type="button" class="rr-score-btn almost" onclick="rrScore('almost')">
         <span>&#x1F7E1; ${t('games.rr.scoreAlmostLabel')}</span><span class="rr-score-sub">${t('games.rr.scoreAlmostSub', {n: worth / 2})}</span>
       </button>
       <button type="button" class="rr-score-btn" onclick="rrScore('not')">
         <span>${t('games.rr.scoreNotYetLabel')}</span><span class="rr-score-sub">${t('games.rr.scoreNotYetSub')}</span>
       </button>
     </div>`;
}

function rrScore(kind){
  if (!rr || rr.phase !== 'score') return;
  const s = rr;
  const card = RR_CARDS[s.cardIdx];
  const worth = card.double ? 200 : 100;
  const pts = kind === 'got' ? worth : kind === 'almost' ? worth / 2 : 0;
  if (kind === 'almost'){
    /* Re-queued to reappear after 2–4 more spins today. */
    const q = rrQueueRead();
    q.push({ idx: s.cardIdx, due: 2 + Math.floor(Math.random() * 3) });
    rrQueueWrite(q);
  } else if (kind === 'not'){
    /* Benched for the rest of today, matching the card's own promise. */
    const b = rrBenchedRead();
    if (b.indexOf(s.cardIdx) < 0){ b.push(s.cardIdx); rrBenchedWrite(b); }
  }
  const total = rrNum('rrPts') + pts;
  const done = rrNum('rrDone') + 1;
  try {
    sessionStorage.setItem('rrPts', String(total));
    sessionStorage.setItem('rrDone', String(done));
  } catch(e){}
  if (done === 3) rrSetDone(total);
  s.phase = 'setup';
  rrRenderSetup(done === 3);
}

/* Third scored card of the day = the daily set. That's the one moment
   this game touches Firestore: bump days/streak/best on games.rr.
   Skipped in dev bypass (Firestore rejects that uid; the session
   points above still count). */
function rrSetDone(ptsTotal){
  if (typeof saveGames !== 'function' || !currentUser || isDevBypassUser()) return;
  const today = rrDayStr(new Date());
  const g = games.rr || {};
  if (g.lastDay !== today){
    g.streak = arcadeStreakContinues(g.lastDay, today) ? (g.streak || 0) + 1 : 1;
    g.days = (g.days || 0) + 1;
    g.lastDay = today;
  }
  const isNewBest = ptsTotal > (g.best || 0);
  if (isNewBest) g.best = ptsTotal;
  games.rr = g;
  /* This only runs once all three cards are rated (done === 3), so there is
     no idle path here — rating the set IS the round played. Three honest
     "Not yet"s still pay the participation XP; an inflated rating earns no
     more than an honest one, because XP doesn't scale with the points. */
  awardArcadeXp(isNewBest);
}

/* ════════════════════════════════════════════════════════════════════
   STRUM RADAR — Strum Hero on real strings. Same curriculum patterns
   (SH_PATTERNS), but the student holds any chord and strums an actual
   guitar; the mic grades WHEN each strum lands using Change Up's onset
   detector — amplitude/attack spikes only, no pitch anywhere (ringing
   strings defeat the pitch detector; onsets don't care). Two honest
   limits, both said out loud in the UI: the mic can't tell a downstrum
   from an upstrum (arrows are arm guidance, not graded), and the click
   goes silent after the count-in (the mic would hear the speaker), so
   the beat grid eases toward the player like Change Up's does.
   ════════════════════════════════════════════════════════════════════ */

const SR_BARS = 4;                       // half of Strum Hero: one held chord tires the
                                         // fretting hand, and short rounds mean fast retries
const SR_BPM_MIN = 50, SR_BPM_MAX = 100; // above ~100, per-eighth onsets blur together

/* Setup hints are radar-specific: Strum Hero's mention the click, and
   this game's click stops after the count-in. */
const SR_HINT_KEYS = {
  downs:    'games.radar.hint.downs',
  eighths:  'games.radar.hint.eighths',
  faithful: 'games.radar.hint.faithful',
  reggae:   'games.radar.hint.reggae'
};

let sr = null, srRaf = null;

function srStop(){
  if (srRaf){ cancelAnimationFrame(srRaf); srRaf = null; }
  if (sr){
    (sr.timeouts || []).forEach(clearTimeout);
    if (sr.micOn) coachMicOff();
    sr = null;
  }
}

function srBody(){ return document.getElementById('sr-body'); }
function srBestKey(patId){ return 'srBest:' + patId; }

/* Session best per pattern is a JSON {acc, bpm} — best accuracy wins,
   higher tempo breaks the tie. */
function srBestRead(patId){
  try {
    const b = JSON.parse(sessionStorage.getItem(srBestKey(patId)));
    if (b && b.acc > 0) return { acc: Math.round(b.acc), bpm: Math.round(b.bpm) || 0 };
  } catch(e){}
  return null;
}

function srSetup(){
  let patIdx = 0, bpm = 0;
  try {
    const pid = sessionStorage.getItem('srPat');
    const i = SH_PATTERNS.findIndex(p => p.id === pid);
    if (i >= 0) patIdx = i;
    bpm = parseInt(sessionStorage.getItem('srBpm'), 10) || 0;
  } catch(e){}
  if (!(bpm >= SR_BPM_MIN && bpm <= SR_BPM_MAX)) bpm = Math.min(SR_BPM_MAX, SH_PATTERNS[patIdx].defBpm);
  sr = { phase: 'setup', patIdx, bpm, micOn: false, timeouts: [] };
  srRenderSetup();
}

function srPickPat(i){
  if (!sr) return;
  sr.patIdx = i;
  try { sessionStorage.setItem('srPat', SH_PATTERNS[i].id); } catch(e){}
  srRenderSetup();
}

function srNudgeBpm(d){
  if (!sr) return;
  sr.bpm = Math.min(SR_BPM_MAX, Math.max(SR_BPM_MIN, sr.bpm + d));
  try { sessionStorage.setItem('srBpm', String(sr.bpm)); } catch(e){}
  const el = document.getElementById('sr-bpm-readout');
  if (el) el.textContent = sr.bpm + ' BPM';
  else srRenderSetup();
}

function srRenderSetup(msg){
  const body = srBody();
  if (!body || !sr) return;
  const pills = SH_PATTERNS.map((p, i) =>
    `<button type="button" class="ts-btn${i === sr.patIdx ? ' active' : ''}" onclick="srPickPat(${i})">${escHtml(t(p.labelKey))}</button>`
  ).join('');
  const pat = SH_PATTERNS[sr.patIdx];
  const best = srBestRead(pat.id);
  body.innerHTML =
    (msg ? `<div class="coach-note">${escHtml(msg)}</div>` : '') +
    `<div class="cc-group"><div class="cc-group-title">${t('games.radar.patternGroupTitle')}</div><div class="fret-levels">${pills}</div></div>
     ${shPatternLineHtml(pat)}
     <div class="coach-tip">${escHtml(t(SR_HINT_KEYS[pat.id] || pat.hintKey))}</div>
     <div class="coach-bpm-row">
       <button type="button" class="tp-btn" onclick="srNudgeBpm(-5)">&#x2212;5</button>
       <span class="coach-bpm-readout" id="sr-bpm-readout">${sr.bpm} BPM</span>
       <button type="button" class="tp-btn" onclick="srNudgeBpm(5)">+5</button>
       ${best ? `<span class="cc-best">${t('games.common.bestTodayValue', {value: best.acc + '%' + (best.bpm ? ' (' + t('games.common.atBpm', {bpm: best.bpm}) + ')' : '')})}</span>` : ''}
     </div>
     <div class="coach-tip">&#x1F3B8; ${t('games.radar.tipHoldChord')}</div>
     <div class="coach-tip">&#x1F92B; ${t('games.radar.tipQuietRoom')}</div>
     ${coachSetupLineHtml()}
     <button type="button" class="coach-start" onclick="srStart()">${t('games.radar.startBarsButton', {bars: SR_BARS})}</button>
     ${coachFootHtml()}`;
  /* The setup is wider than the play screen's 560px (styles.css .sr-setup-wide):
     at 560px its tips wrap to three lines and, in Spanish, the four patterns to
     two rows, and the screen scrolled at 1366x657 (690px tall, 2026-11-13).
     srStart takes the class off, as ccStart does Change Up's .cc-open-setup. */
  body.classList.add('sr-setup-wide');
}

/* The one bar of the pattern, big: the same D/U monospace notation as
   the setup preview, one cell per eighth position so the current cell
   can light up as the grid advances. */
function srStripHtml(pat){
  const counts = ['1','+','2','+','3','+','4','+'];
  return `<div class="sr-strip" id="sr-strip">` + pat.slots.map((d, i) =>
    `<span class="sr-slot" id="sr-slot-${i}"><span class="sr-slot-glyph${d ? '' : ' skip'}">${d || '·'}</span><span class="sr-slot-count">${counts[i]}</span></span>`
  ).join('') + `</div>`;
}

async function srStart(){
  if (!sr || sr.phase === 'countin' || sr.phase === 'play') return;
  coachClose();
  coachEvictTuner();
  const s = sr;
  const body = srBody();
  if (!body) return;
  body.classList.remove('sr-setup-wide');
  body.innerHTML = `<div class="coach-tip sr-center">${t('games.common.startingMic')}</div>`;
  if (!coachStream && !(await coachAcquireMic({ el: body }))){
    if (sr === s) srRenderSetup(coachMicFailMsg());
    return;
  }
  await coachEnsureRunning();
  if (sr !== s || !srBody()){ coachReleaseMicIfIdle(); return; }   // a new session started under us, or the panel closed during the prompt
  if (document.hidden){ coachMicOff(); gamesShow('hub'); return; }   // backgrounded during the prompt
  stopAllDemoAudio();
  s.micOn = true;
  window.coachMicLive = true;   // stream may already be open from a prior owner

  const pat = SH_PATTERNS[s.patIdx];
  s.beatMs = 60000 / s.bpm;
  s.slotMs = s.beatMs / 2;
  /* The mic hears a strum after it happens (Chromebooks: 40–120ms). Reuse
     the per-machine offset Note Runner's slider calibrates — it's a property
     of the device, not the game — so honest strums aren't graded "late" by
     the hardware. The easing grid then only has to absorb the human part. */
  s.lat = nrOffset();
  s.notes = [];
  for (let b = 0; b < SR_BARS; b++){
    pat.slots.forEach((dir, i) => {
      if (dir) s.notes.push({ t: (b * 8 + i) * s.slotMs, dir, bar: b, result: null });
    });
  }
  /* Hit window per expected strum — wider than Strum Hero's tap windows
     because onset detection adds its own jitter. Scaled to the PATTERN's
     own density: 45% of the tightest gap between expected strums, so the
     all-eighths pattern stays at the maximum where neighbouring slots
     can't both claim one strum, while sparser patterns (downs, reggae)
     get the extra forgiveness their spacing safely allows. Absolute
     ceiling of 0.28 beat — further out than that isn't "on" anything. */
  let minGap = Infinity;
  for (let i = 1; i < s.notes.length; i++) minGap = Math.min(minGap, s.notes[i].t - s.notes[i - 1].t);
  if (!isFinite(minGap)) minGap = s.slotMs;
  s.win = Math.max(90, Math.min(0.28 * s.beatMs, 0.45 * minGap));
  s.errs = [];                  // signed onset errors (ms), for the early/late line
  s.extras = 0;
  s.smoothRms = 0; s.smoothHf = 0; s.lastOnsetT = -1e9; s.gridOffset = 0; s.lastSlot = -1;
  s.phase = 'countin';
  srBody().innerHTML = `<div class="coach-count" id="sr-count">&nbsp;</div>` + srStripHtml(pat) +
    `<div class="coach-tip sr-center">${t('games.radar.tipCountInThenStrum')}</div>`;
  coachCountIn(s, 'sr-count', () => {
    if (sr === s && s.phase === 'countin'){ s.phase = 'play'; srRenderPlay(); }
  });
  if (srRaf) cancelAnimationFrame(srRaf);
  srLoop();
}

function srRenderPlay(){
  const body = srBody();
  if (!body || !sr) return;
  /* This replaces the count-in DOM with a fresh #sr-strip that has no .cur
     cell, so the slot counter has to start over with it. srLoop's play block
     also runs during the count-in (srEarly rewards a slightly-early first
     strum), and now that the display clock no longer subtracts the mic
     latency, slot 0 can be ticked against the count-in DOM a few ms before
     this runs. Without the reset, cur===lastSlot===0 afterwards and beat 1 of
     bar 1 never lights at all. */
  sr.lastSlot = -1;
  const pat = SH_PATTERNS[sr.patIdx];
  const chips = sr.notes.map((n, i) =>
    `<span class="coach-chip pending" id="sr-chip-${i}" title="${t('games.radar.barTooltip', {n: n.bar + 1})}">${n.dir}</span>`
  ).join('');
  body.innerHTML =
    `<div class="coach-live"><span class="coach-live-dot"></span>${t('games.radar.listeningStrumAlong')}<span class="sr-bar" id="sr-bar">${t('games.radar.barOfTotal', {bar: 1, total: SR_BARS})}</span></div>
     <div class="cc-beats" id="sr-beats"><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span></div>
     ${srStripHtml(pat)}
     <div class="coach-strip">${chips}</div>
     <div class="coach-tip sr-center">${t('games.radar.tipNoClickNow')}</div>
     <button type="button" class="tp-btn coach-stop" onclick="srFinish()">&#x25A0; ${t('games.common.stop')}</button>`;
}

function srChipRefresh(i){
  const el = document.getElementById('sr-chip-' + i);
  if (el) el.className = 'coach-chip ' + (sr.notes[i].result || 'pending');
}

/* The advancing highlight: current eighth cell in the strip, beat pips,
   bar counter — all on the adapted grid the scoring reads (same rule as
   Change Up: on the rigid grid the display drifts off the player). */
function srSlotTick(cur){
  const bar = Math.floor(cur / 8);
  if (bar >= SR_BARS) return;
  document.querySelectorAll('#sr-strip .sr-slot').forEach((el, i) => el.classList.toggle('cur', i === cur % 8));
  const barEl = document.getElementById('sr-bar');
  if (barEl) barEl.textContent = t('games.radar.barOfTotal', {bar: bar + 1, total: SR_BARS});
  document.querySelectorAll('#sr-beats .cc-pip').forEach((el, i) => el.classList.toggle('on', i === Math.floor(cur / 2) % 4));
}

function srLoop(){
  if (!sr) return;
  if (!coachAnalyser || !srBody()){ srStop(); return; }  // mic taken or panel closed under us
  const s = sr;
  const now = performance.now();
  /* Bar 1 beat 1 is a graded slot, so its ±win window reaches BACK into
     the count-in — start detecting that early or an eager (but in-window)
     first strum gets swallowed by the baseline warmers and marked a miss.
     Safe from speaker bleed: the last count-in click ends a full beat
     before this, well outside any win. The visual flip stays at listenStart. */
  const srEarly = s.phase === 'countin' && now >= s.listenStart - s.win;
  if (s.phase === 'countin' && !srEarly){
    /* Warm the level trackers on room noise during the count-in — same
       cold-start guard as the Coach loop. */
    const r = coachReadFrame();
    coachSmooth(s, r, coachHfRms);
  }
  if (s.phase === 'play' || srEarly){
    const rms = coachReadFrame();
    const hf = coachHfRms;

    /* Onset = strum (Change Up's dual-channel detector, same constants:
       full-band jump for a clean strum over silence, HF pick-attack
       channel for a strum over the still-ringing previous one — which is
       every strum after the first here). The 140ms refractory still fits:
       eighths at the 100 BPM cap arrive every 300ms. */
    if ((rms > CHK_ONSET_FLOOR &&
         rms > s.smoothRms * CHK_ONSET_RATIO ||
         hf > CHK_HF_FLOOR &&
         hf > s.smoothHf * CHK_HF_RATIO) &&
        coachOnsetAt - s.lastOnsetT > COACH_ONSET_REFRACT){
      s.lastOnsetT = coachOnsetAt;   // when it arrived, not when this frame ran
      const rel = coachOnsetAt - s.listenStart - s.gridOffset - s.lat;
      /* No audible reference during play, so the grid eases toward the
         player — Change Up's EMA, on the eighth grid. */
      const slotIdx = Math.round(rel / s.slotMs);
      const dev = rel - slotIdx * s.slotMs;
      if (Math.abs(dev) < s.slotMs * 0.45) s.gridOffset += dev * 0.2;
      /* Nearest unconsumed expected strum within the window; anything
         else is an extra — counted, never punished live (real rooms are
         noisy, and a squeaky chair shouldn't wreck a run). */
      let best = -1, bestAbs = Infinity;
      for (let i = 0; i < s.notes.length; i++){
        const n = s.notes[i];
        if (n.result) continue;
        if (n.t - rel > s.win) break;   // notes are time-sorted — the rest are too far ahead
        const a = Math.abs(n.t - rel);
        if (a < bestAbs){ bestAbs = a; best = i; }
      }
      if (best >= 0 && bestAbs <= s.win){
        s.notes[best].result = 'ok';
        s.errs.push(rel - s.notes[best].t);
        srChipRefresh(best);
      } else if (rel > -s.win){
        s.extras++;                     // pre-roll noise before bar 1 stays free
      }
    }
    coachSmooth(s, rms, hf);

    /* Overdue strums are misses. */
    const relNow = now - s.listenStart - s.gridOffset - s.lat;
    s.notes.forEach((n, i) => {
      if (!n.result && relNow > n.t + 0.7 * s.slotMs){
        n.result = 'miss';
        srChipRefresh(i);
      }
    });

    /* Display runs on the UN-latency-shifted clock. s.lat converts a mic
       arrival time back into the moment the strum was played, which is exactly
       right for matching and for the miss sweep above — but the highlighted
       cell and the beat pips have to sit on the beat the student is hearing
       right now, not on a beat s.lat in the past. At the slider's 250ms max
       that's ~42% of an eighth slot at 50 BPM of visible lag. The grid ease
       stays in (that's the display following the player, on purpose — see
       srSlotTick); only the hardware offset comes out. nrLoop draws off the
       raw `now - s.listenStart` for the same reason. */
    const cur = Math.floor((now - s.listenStart - s.gridOffset) / s.slotMs);
    if (cur !== s.lastSlot && cur >= 0){ s.lastSlot = cur; srSlotTick(cur); }

    if (now > s.listenStart + (SR_BARS * 4 + 1) * s.beatMs){ srFinish(true); return; }
  }
  srRaf = requestAnimationFrame(srLoop);
}

function srFinish(complete){
  if (!sr || (sr.phase !== 'play' && sr.phase !== 'countin')) return;
  const s = sr;
  if (srRaf){ cancelAnimationFrame(srRaf); srRaf = null; }
  s.timeouts.forEach(clearTimeout);
  s.timeouts = [];
  s.notes.forEach(n => { if (!n.result) n.result = 'miss'; });   // early Stop: the rest never landed
  if (s.micOn){ coachMicOff(); s.micOn = false; }
  s.phase = 'done';
  const pat = SH_PATTERNS[s.patIdx];
  const total = s.notes.length;
  const hits = s.notes.filter(n => n.result === 'ok').length;
  s.acc = total ? Math.round(100 * hits / total) : 0;
  s.prevBest = srBestRead(pat.id);
  if (s.acc > 0 && (!s.prevBest || s.acc > s.prevBest.acc ||
      (s.acc === s.prevBest.acc && s.bpm > s.prevBest.bpm))){
    try { sessionStorage.setItem(srBestKey(pat.id), JSON.stringify({ acc: s.acc, bpm: s.bpm })); } catch(e){}
  }
  /* Cross-session best → the student's progress doc. Skipped in dev bypass
     (Firestore rejects that uid; the session best above still counts). */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    // games.sr is keyed by pattern id — same fix as Strum Hero's games.sh.
    const old = (games.sr && games.sr[pat.id] && games.sr[pat.id].best) || 0;
    const isNewBest = s.acc > old;
    if (isNewBest) games.sr = Object.assign({}, games.sr, { [pat.id]: { best: s.acc, bpm: s.bpm, at: new Date().toISOString().slice(0, 10) } });
    // XP is participation credit for an actual round — an immediate Start →
    // Stop is not one, and nor is a silent round that timed out (no hits).
    if (complete && hits > 0) awardArcadeXp(isNewBest);
    // Saved on its own — see shFinish.
    if (isNewBest) saveGames();
  }
  srRenderDone();
}

function srRenderDone(){
  const body = srBody();
  if (!body || !sr) return;
  const s = sr;
  const total = s.notes.length;
  const hits = s.notes.filter(n => n.result === 'ok').length;
  const misses = total - hits;
  /* More forgiving stars than Strum Hero — the detector adds its own
     noise, and a real room adds more. */
  const stars = s.acc >= 85 ? 3 : s.acc >= 65 ? 2 : s.acc >= 40 ? 1 : 0;
  const starHtml = '&#x2605;'.repeat(stars) + '&#x2606;'.repeat(3 - stars);

  let verdict, advice;
  if (stars === 3){
    verdict = t('games.radar.verdict.three', {acc: s.acc});
    advice = t('games.radar.advice.three');
  } else if (stars === 2){
    verdict = t('games.radar.verdict.two', {acc: s.acc});
    advice = t('games.radar.advice.two');
  } else if (stars === 1){
    verdict = t('games.radar.verdict.one', {acc: s.acc});
    advice = t('games.radar.advice.one');
  } else {
    verdict = t('games.radar.verdict.zero', {acc: s.acc});
    advice = t('games.radar.advice.zero');
  }

  /* Early/late bias — median signed error over the landed strums. Only
     shown with enough strums to mean something. */
  let biasLine = '';
  if (s.errs.length >= 4){
    const med = tunerMedian(s.errs);
    if (Math.abs(med) > 25){
      biasLine = `<div class="coach-tip sr-center">${med < 0
        ? t('games.radar.biasEarly', {ms: Math.round(-med)})
        : t('games.radar.biasLate', {ms: Math.round(med)})}</div>`;
    }
  }

  let bestLine = '';
  if (s.prevBest && s.acc > s.prevBest.acc){
    bestLine = `<div class="sh-newbest">&#x1F3C6; ${t('games.radar.newBest', {prevBest: s.prevBest.acc + '%'})}</div>`;
  } else if (s.prevBest){
    bestLine = `<div class="coach-tip sr-center">${t('games.common.bestTodayValue', {value: s.prevBest.acc + '%' + (s.prevBest.bpm ? ' (' + t('games.common.atBpm', {bpm: s.prevBest.bpm}) + ')' : '')})}</div>`;
  }

  const rec = stars >= 3 ? 'up' : stars >= 1 ? 'same' : 'down';
  body.innerHTML =
    `<div class="coach-report">
       <div class="sh-stars">${starHtml}</div>
       <div class="coach-overall">&#x1F4E1; ${escHtml(verdict)}</div>
       <div class="coach-strip">
         <span class="coach-chip ok">${t('games.radar.chipHit', {n: hits})}</span>
         <span class="coach-chip miss">${t('games.radar.chipMiss', {n: misses})}</span>
         ${s.extras ? `<span class="coach-chip dim">${t('games.radar.chipExtraStrums', {n: s.extras})}</span>` : ''}
       </div>
       ${biasLine}
       ${bestLine}
       <div class="coach-crit-note">${escHtml(advice)}</div>
       <div class="coach-actions">
         <button type="button" class="${rec === 'down' ? 'coach-start' : 'tp-btn'}" onclick="srAgain(-10)">&#x2B07; &minus;10 BPM</button>
         <button type="button" class="${rec === 'same' ? 'coach-start' : 'tp-btn'}" onclick="srAgain(0)">&#x21BB; ${t('games.radar.againAtBpm', {bpm: s.bpm})}</button>
         <button type="button" class="${rec === 'up' ? 'coach-start' : 'tp-btn'}" onclick="srAgain(10)">&#x2B06; +10 BPM</button>
       </div>
       <button type="button" class="tp-btn" onclick="srSetup()">${t('games.radar.changePatternButton')}</button>
     </div>`;
}

function srAgain(d){
  if (!sr) return;
  sr.bpm = Math.min(SR_BPM_MAX, Math.max(SR_BPM_MIN, sr.bpm + d));
  try { sessionStorage.setItem('srBpm', String(sr.bpm)); } catch(e){}
  sr.phase = 'setup';
  srStart();
}

