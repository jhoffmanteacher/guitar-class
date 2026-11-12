/* ── Note Call (step.drill, type 'notecall') ─────────────────────────────
   The class-activity cousin of Note Runner (coach.js). A note NAME comes up
   on the beat — "G · low E string" — the student finds it and plays it.
   (Jonathan, 2026-09-27: "tempo based … gets progressively more difficult
   … start it in chunks".)

   Module-data schema:
     drill: { type:'notecall', strings:['lowE','A'], minFret:0, maxFret:5 }
   One chunk of the neck per step (0–5, 5–8, 8–12, then 0–12). The board
   always shows frets 0–12; outside the chunk is greyed and takes no taps.
   Optional `board:'all'` (ca-49 step 1, 2026-11-11): the board draws all six
   strings and takes taps on the drill's strings only. Without it a
   single-note drill draws just its own strings (ca-23).

   Two modes, picked with the "Show answer" switch (ON by default):

   SHOW ANSWER ON — the play-along (Jonathan, same day: "name appears,
   student plays, fret lights up … nothing is scored"). Each note gets four
   beats: the name lands on beat 1, the right fret lights up on beat 3 and
   stays lit to the end of beat 4, then the next name. It runs until Stop.
   Every NC_ANS_EVERY notes it steps up NC_ANS_BPM (20 BPM = the answer
   after 6 s … 40 BPM = after 3 s; a new student starts at 20 and it never
   speeds up on its own past 40 — Jonathan, 2026-10-19, was 40 → 120); "Slower" steps back one right away and
   restarts the count, "Faster" steps up one the same way, and is the only way
   past 40, up to 80 (Jonathan, 2026-11-02). No score, no levels, no unlocks. The speed a student
   reached is remembered per chunk. Notes: natural, or "With ♯ notes".

   SHOW ANSWER OFF — the scored levels (NC_LEVELS): naturals 20 → 30 BPM →
   half the beats, then the ♯ notes join at 30 BPM, then half the beats
   again. 10 notes a round, 8 unlocks the next level; clearing Level 5 adds
   5 BPM to Level 5, up to 80 (Jonathan, 2026-11-02; 2026-10-19: 20 → 40 max; was
   60 → 80, +10 with a 160 ceiling). A miss shows where the note lives, comes
   back 3 notes later, and is listed at the end.

   Answering, either mode:
   - LISTENING COACH (OFF by default; the choice is remembered per browser):
     the mic hears the note. Exact pitch — string + fret → one midi, any
     fret on that string with that name counts (E on low E in 0–12 is fret
     0 OR 12). Power-chord mode (drill.power, ca-43): the student strums a
     chord, so it answers with its root, 5th, octave or the octave below
     (ncTargets). Same three-reading YIN consensus Note Hunt uses. After the
     count-in the click goes SILENT and the beat dots carry the tempo —
     speaker clicks would bleed into the mic, the call Note Runner made.
   - TAPPING the fret on the board. In the scored levels the first tap is
     the answer; in the play-along a tap just flashes green or red.
   Progress (highest unlocked level, the Level 5 tempo, the play-along
   speed) persists per chunk in games.nc['lowE+A:0-5'] for signed-in
   students, sessionStorage for everyone else. Teacher preview never saves
   (same rule as sdSaveBest). */
const NC_ROUND = 10;
const NC_PASS = 8;
const NC_COUNT_IN = 4;
const NC_FASTER = 5, NC_MAX_BPM = 80;
const NC_LEVELS = [
  { pile: 'naturals', bpm: 20, beats: 4 },
  { pile: 'naturals', bpm: 30, beats: 4 },
  { pile: 'naturals', bpm: 30, beats: 2 },
  { pile: 'all',      bpm: 30, beats: 4 },
  { pile: 'all',      bpm: 30, beats: 2 }
];
/* Play-along ladder. Each note is 4 beats and the answer lights on beat 3,
   so the wait before the answer is 2 beats: 6 s at 20 BPM, 3 s at 40.
   20 → 40 in steps of 5 since 2026-10-19 (Jonathan). The count speeds up on
   its own only to NC_ANS_AUTO_MAX; Faster goes on to 80 (Jonathan,
   2026-11-02: "allow the user to set the speed above 40"). A saved speed above
   80 loads as 80. The speed is SAVED as a
   BPM (ansBpm), not a ladder index, so a step added later moves nobody;
   saves from before that hold only the index `ans` into NC_ANS_BPM_V1. */
const NC_ANS_BPM = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
const NC_ANS_AUTO_MAX = 40;   // the automatic speed-up stops here; only Faster goes past it
const NC_ANS_BPM_V1 = [40, 50, 60, 70, 80, 90, 100, 120];
const NC_ANS_START = 20;   // where a student with no saved speed begins
const NC_ANS_START_POWER = 30;   // ca-43 (power chords) begins at 30 BPM (Jonathan, 2026-11-02)
const NC_ANS_BEATS = 4, NC_ANS_REVEAL = 2, NC_ANS_EVERY = 8;
const noteCalls = {};
let ncLive = null;   // key of the drill whose round is running — one at a time

function ncBox(key){ return document.getElementById('ncr-' + key); }
function ncProgKey(c){ return c.strings.join('+') + (c.power ? '+5' : '') + ':' + c.minFret + '-' + c.maxFret; }
function ncLoadProg(c){
  let s = null;
  try { s = JSON.parse(sessionStorage.getItem('nc:' + ncProgKey(c)) || 'null'); } catch(e){}
  const g = ((typeof games !== 'undefined' && games && games.nc) || {})[ncProgKey(c)] || null;
  const pick = (f, d) => Math.max((s && s[f] != null ? s[f] : d), (g && g[f] != null ? g[f] : d));
  /* The play-along speed as a BPM: ansBpm if saved, else the old index. */
  const ansOf = o => !o ? 0 : o.ansBpm != null ? o.ansBpm
    : o.ans != null ? (NC_ANS_BPM_V1[Math.min(o.ans, NC_ANS_BPM_V1.length - 1)] || 0) : 0;
  const ansBpm = Math.max(ansOf(s), ansOf(g)) || (c.power ? NC_ANS_START_POWER : NC_ANS_START);
  let ans = NC_ANS_BPM.indexOf(ansBpm);
  if(ans < 0) ans = Math.max(0, NC_ANS_BPM.filter(b => b <= ansBpm).length - 1);
  return {
    lv:  Math.min(pick('lv', 1), NC_LEVELS.length),
    bpm: Math.min(pick('bpm', NC_LEVELS[4].bpm), NC_MAX_BPM),
    ans
  };
}
function ncSaveProg(c, prog){
  const ansBpm = NC_ANS_BPM[prog.ans];
  try { sessionStorage.setItem('nc:' + ncProgKey(c), JSON.stringify({ lv: prog.lv, bpm: prog.bpm, ansBpm })); } catch(e){}
  if(!currentUser || (typeof isDevBypassUser === 'function' && isDevBypassUser())) return;
  if(IS_TEACHER_MODE) return;   // previewing isn't practising
  if(!games.nc) games.nc = {};
  games.nc[ncProgKey(c)] = { lv: prog.lv, bpm: prog.bpm, ansBpm, at: dayStr(new Date()) };
  saveGames();
}
function ncPref(name, dflt){
  try { const v = localStorage.getItem(name); return v == null ? dflt : v === 'on'; } catch(e){ return dflt; }
}
function ncSetPref(name, on){ try { localStorage.setItem(name, on ? 'on' : 'off'); } catch(e){} }
const NC_PREFS = { coach: ['ncCoach', false], answer: ['ncAnswer', true], sharps: ['ncSharps', false] };

/* Every (string, note name) the chunk holds, with each fret it sits on. */
function ncPool(c, pile){
  const out = [];
  c.strings.forEach(k => {
    const by = {};
    for(let f = c.minFret; f <= c.maxFret; f++){
      const n = sdNoteAt(k, f);
      if(pile === 'naturals' && n.indexOf('♯') >= 0) continue;
      (by[n] = by[n] || []).push(f);
    }
    Object.keys(by).forEach(n => out.push({ str: k, note: c.power ? n + '5' : n, power: !!c.power, frets: by[n], midis: by[n].map(f => SD_OPEN_MIDI[k] + f) }));
  });
  return out;
}
function ncStrName(k){ return t(FRET_STRING_KEY[k] || 'fret.stringLowE'); }
/* Power-chord mode (drill.power): the call is a chord, "G5 · root on the low E
   string", and the answer is the ROOT fret (a tap on the root fret; the mic
   takes the root, the 5th, the octave or the octave below of a strum — ncTargets). Strings it differs in live under 'ncp.*'; ncK picks the key. The 5th
   sits two frets up on the next string toward the floor (low E -> A, A -> D). */
const NC_FIFTH_STR = { lowE: 'A', A: 'D' };
const NC_POWER_UP = { lowE: ['A', 'D'], A: ['D', 'G'] };   // [5th string, octave string]
function ncK(power, name){ return (power ? 'ncp.' : 'nc.') + name; }
function ncVars(p){
  const v = { note: p.note, string: ncStrName(p.str), fret: ncFretList(p) };
  if(p.power){
    v.fifthString = ncStrName(NC_FIFTH_STR[p.str] || p.str);
    v.fifth = p.frets.map(f => f + 2).join(' / ');
  }
  return v;
}
function ncFretList(p){ return p.frets.join(' / '); }
function ncLevel(st, i){
  const L = Object.assign({}, NC_LEVELS[i]);
  if(i === NC_LEVELS.length - 1) L.bpm = st.prog.bpm;
  return L;
}
function ncAnsWait(bpm){ return (NC_ANS_REVEAL * 60 / bpm).toFixed(1); }

function renderNoteCall(drill, key, wid){
  if(noteCalls[key]) ncStop(key);
  const strings = (drill.strings && drill.strings.length ? drill.strings : ['lowE', 'A'])
    .filter(k => SD_OPEN_MIDI[k] != null);
  const cfg = {
    strings: drill.power ? strings.filter(k => NC_FIFTH_STR[k]) : strings,
    power: !!drill.power,
    /* drill.board 'all' (ca-49 step 1, Jonathan 2026-11-11): draw all six strings, taps on the drill's strings only. */
    allStrings: drill.board === 'all',
    minFret: drill.minFret != null ? drill.minFret : 0,
    maxFret: drill.maxFret != null ? drill.maxFret : 5,
    wid
  };
  const prog = ncLoadProg(cfg);
  const st = { key, cfg, prog, phase: 'setup', level: prog.lv - 1, msg: '' };
  Object.keys(NC_PREFS).forEach(k => { st[k] = ncPref(NC_PREFS[k][0], NC_PREFS[k][1]); });
  noteCalls[key] = st;
  return `<div class="sdr ncr" id="ncr-${escAttr(key)}">${ncSetupHtml(key)}</div>`;
}

function ncHeadHtml(st, right){
  const c = st.cfg;
  const strs = c.strings.map(ncStrName).join(' + ');
  return `<div class="sdr-head"><span>${escHtml(t('nc.head', { strings: strs, min: c.minFret, max: c.maxFret }))}</span>` +
    `<span class="sdr-meta">${escHtml(right)}</span></div>`;
}
function ncLevelDesc(L, power){
  return t(ncK(power, L.pile === 'naturals' ? 'descNaturals' : 'descAll'), { bpm: L.bpm, beats: L.beats });
}
function ncAnsMeta(bpm){ return t('nc.metaAnswer', { bpm, s: ncAnsWait(bpm) }); }
function ncSetupMeta(st){
  return st.answer ? ncAnsMeta(NC_ANS_BPM[st.prog.ans])
                   : t('nc.metaLevel', { n: st.level + 1, bpm: ncLevel(st, st.level).bpm });
}
function ncToggleHtml(key, which, label, on){
  return `<div class="nc-toggle"><span class="nc-toggle-label">${escHtml(label)}</span>` +
    `<button type="button" class="sdr-pill${on ? ' active' : ''}" aria-pressed="${on}" onclick="ncSet('${key}','${which}',true)">${escHtml(t('nc.on'))}</button>` +
    `<button type="button" class="sdr-pill${!on ? ' active' : ''}" aria-pressed="${!on}" onclick="ncSet('${key}','${which}',false)">${escHtml(t('nc.off'))}</button></div>`;
}

function ncSetupHtml(key){
  const st = noteCalls[key];
  if(!st) return '';
  const toggles = `<div class="nc-toggles">` +
      ncToggleHtml(key, 'answer', t('nc.answer'), st.answer) +
      `<button type="button" class="sdr-pill nc-guitar${st.coach ? ' active' : ''}" aria-pressed="${st.coach}" onclick="ncSet('${key}','coach',${!st.coach})">&#x1F3B8; ${escHtml(t('nc.playGuitar'))}</button>` +
    `</div>`;
  const msg = st.msg ? `<div class="coach-note nc-msg">${escHtml(st.msg)}</div>` : '';
  if(st.answer){
    const pill = (on, label) =>
      `<button type="button" class="sdr-pill${st.sharps === on ? ' active' : ''}" aria-pressed="${st.sharps === on}" onclick="ncSet('${key}','sharps',${on})">${escHtml(label)}</button>`;
    return ncHeadHtml(st, ncSetupMeta(st)) +
      `<div class="sdr-body">` +
        `<div class="sdr-intro">${escHtml(t(ncK(st.cfg.power, 'introAnswer')))}</div>` +
        toggles +
        `<div class="sdr-pills nc-pile">${pill(false, t(ncK(st.cfg.power, 'pileNaturals')))}${pill(true, t(ncK(st.cfg.power, 'pileAll')))}</div>` +
        msg +
        `<button type="button" class="sdr-start" onclick="ncStart('${key}')">&#x25B6; ${escHtml(t('nc.startPlain'))}</button>` +
      `</div>`;
  }
  const L = ncLevel(st, st.level);
  const pills = NC_LEVELS.map((_, i) => {
    const locked = i >= st.prog.lv;
    return `<button type="button" class="sdr-pill nc-lv${i === st.level ? ' active' : ''}${locked ? ' locked' : ''}"` +
      `${locked ? ' disabled' : ''} onclick="ncPickLevel('${key}',${i})"` +
      ` aria-label="${escAttr(t('nc.levelN', { n: i + 1 }) + (locked ? ' — ' + t('nc.locked') : ''))}">` +
      `${locked ? '<span aria-hidden="true">&#x1F512;</span> ' : ''}${escHtml(t('nc.levelN', { n: i + 1 }))}</button>`;
  }).join('');
  return ncHeadHtml(st, ncSetupMeta(st)) +
    `<div class="sdr-body">` +
      // One line before Start; with the mic on it says the mic listens instead of asking for a tap.
      `<div class="sdr-intro">${escHtml(t(ncK(st.cfg.power, st.coach ? 'introCoach' : 'intro')))}</div>` +
      toggles +
      `<div class="sdr-pills nc-levels">${pills}</div>` +
      `<div class="nc-desc">${escHtml(ncLevelDesc(L, st.cfg.power))}</div>` +
      msg +
      `<button type="button" class="sdr-start" onclick="ncStart('${key}')">&#x25B6; ${escHtml(t('nc.start', { n: st.level + 1 }))}</button>` +
      `<div class="sdr-best">${escHtml(t('nc.passLine', { pass: NC_PASS, total: NC_ROUND }))}</div>` +
    `</div>`;
}

function ncRepaint(key, html){ const b = ncBox(key); if(b) b.innerHTML = html; }
function ncPickLevel(key, i){
  const st = noteCalls[key];
  if(!st || st.phase === 'play' || i >= st.prog.lv) return;
  st.level = i; st.phase = 'setup'; st.msg = '';
  ncRepaint(key, ncSetupHtml(key));
}
function ncSet(key, which, on){
  const st = noteCalls[key];
  if(!st || st.phase === 'play' || !NC_PREFS[which]) return;
  st[which] = on;
  ncSetPref(NC_PREFS[which][0], on);
  st.msg = '';
  ncRepaint(key, ncSetupHtml(key));
}

async function ncStart(key){
  const st = noteCalls[key];
  if(!st || st.phase === 'play' || st.starting) return;
  ncStopAll();                      // one Note Call at a time, anywhere on the page
  stopAllDemoAudio();               // tab player, snippets, practice card, metronome
  // A Coach check listening elsewhere would score this round's clicks (tap
  // mode never reaches the coachClose() below). Only exists once coach.js is
  // loaded — and with no coach.js there is no Coach mic to stop.
  if(typeof coachInterrupt === 'function') coachInterrupt(t('coach.interrupt.micLost'));
  try { getAudioCtx().resume(); } catch(e){}
  st.msg = '';
  st.micOn = false;
  if(st.coach){
    st.starting = true;
    st.cancelled = false;           // set by ncStopAll if the student leaves mid-start
    ncRepaint(key, ncHeadHtml(st, '') + `<div class="sdr-body"><div class="coach-tip">${escHtml(t('nc.startingMic'))}</div></div>`);
    let ok = false;
    try {
      await ensureCoachJs();
      if(!st.cancelled){            // left while coach.js loaded: touch no other mic owner
        coachClose();               // one mic owner at a time
        if(typeof gamesStopMic === 'function') gamesStopMic();
        st.cancelled = false;       // gamesStopMic's own ncStopAll() just flagged THIS start
        coachEvictTuner();
        ok = !!(coachStream || await coachAcquireMic());
        if(ok) await coachEnsureRunning();
      }
    } catch(e){ ok = false; }
    st.starting = false;
    /* The page was left (In class closed, the tab hidden…) while the mic was
       starting: the card is only hidden, so ncBox still finds it — without
       this the round would run unseen with the mic open. */
    if(st.cancelled){
      st.cancelled = false;
      if(ok) coachReleaseMicIfIdle();
      if(noteCalls[key] === st){ st.phase = 'setup'; ncRepaint(key, ncSetupHtml(key)); }
      return;
    }
    if(noteCalls[key] !== st || !ncBox(key)){ if(ok) coachReleaseMicIfIdle(); return; }
    if(!ok){
      st.coach = false;             // fall back to tapping for this card
      // Why it failed — no mic, a busy mic, or a refusal (nc.micDenied) —
      // from coach.js's record of the last acquisition. No coach.js (it
      // failed to load) keeps the plain line.
      st.msg = typeof coachMicFailMsg === 'function' ? coachMicFailMsg('nc.micDenied') : t('nc.micDenied');
      ncRepaint(key, ncSetupHtml(key));
      return;
    }
    window.coachMicLive = true;
    st.micOn = true;
  }
  const ans = st.answer;
  const L = ans ? { pile: st.sharps ? 'all' : 'naturals', bpm: NC_ANS_BPM[st.prog.ans], beats: NC_ANS_BEATS }
                : ncLevel(st, st.level);
  Object.assign(st, {
    phase: 'play', mode: ans ? 'answer' : 'levels', L, lvIdx: ans ? null : st.level,
    beatMs: 60000 / L.bpm, seq: [], bag: [], requeue: [], idx: -1,
    readings: [], lastPitchT: 0, attackT: 0, heard: '', beatShown: -1,
    raf: null, revealed: false, sinceUp: 0, pendingStep: null,
    graceIdx: null, graceFrom: 0, graceUntil: 0, ending: false,
    smoothRms: null, seenAttackT: null
  });
  ncDeal(st);                       // the first note shows during the count-in
  ncRepaint(key, ncPlayHtml(key));
  ncPaint(st);
  const t0 = performance.now() + 150;
  st.segStart = t0;                 // the count-in is segment -1
  st.segBeats = NC_COUNT_IN;
  st.ck = { seg: -1, beat: 0, at: t0 };
  ncLive = key;
  st.raf = requestAnimationFrame(ncFrame);
}

/* True when card p must not follow `last` (the last two cards dealt): the
   same name on the same string as the one before, or a root pitch that either
   of them could still be ringing as. Exact roots, for single notes and power
   chords alike, as it has always been: the only strum a ringing strum can
   answer is the same chord (measured, 2026-10-30: a strum sharing only a 5th or
   an octave with the next card answered it 0 times in 10 at every delay from
   150 ms to 2 s; the same chord, 10 of 10 at 150 ms), and comparing every
   accepted pitch instead made the order of chords predictable and could deal
   the same chord twice in a row. Pure: no DOM. */
function ncClash(p, last){
  const q1 = last[last.length - 1];
  if(q1 && q1.str === p.str && q1.note === p.note) return true;
  return last.some(q => q.midis.some(m => p.midis.indexOf(m) >= 0));
}

/* Deal the next note: a missed one that's due comes back first; otherwise
   off a shuffled bag. Never the same name-on-string twice in a row, and never
   a pitch still ringing from either of the last two notes (it would count
   before the student moved: ncClash). When every card left clashes, the bag
   deals one anyway. The play-along never stops dealing. */
function ncDeal(st){
  if(st.mode !== 'answer' && st.seq.length >= NC_ROUND) return;
  const j = st.seq.length;
  const last = st.seq.slice(-2);
  const clash = p => ncClash(p, last);
  let p = null;
  const due = st.requeue.findIndex(q => q.due <= j && !clash(q.p));
  if(due >= 0) p = st.requeue.splice(due, 1)[0].p;
  else {
    for(let tries = 0; tries < 2 && !p; tries++){
      if(!st.bag.length || tries) st.bag = sdShuffle(ncPool(st.cfg, st.L.pile));
      const i = st.bag.findIndex(q => !clash(q));
      if(i >= 0) p = st.bag.splice(i, 1)[0];
    }
    if(!p) p = st.bag.pop() || ncPool(st.cfg, st.L.pile)[0];
  }
  st.seq.push(Object.assign({}, p, { res: null }));
}

function ncPromptHtml(p){
  return `<span class="nc-note">${escHtml(p.note)}</span>` +
    `<span class="nc-str">${escHtml(t(ncK(p.power, 'onString'), { string: ncStrName(p.str) }))}</span>`;
}
function ncPlayHtml(key){
  const st = noteCalls[key], c = st.cfg;
  const board = fgBoardSvg(key, null, {
    // Power chords draw all six strings (the whole chord shape sits on them); only the root strings take taps.
    // So does a step with drill.board 'all' (ca-49 step 1): the whole fretboard, taps on the drill's strings.
    strings: (c.power || c.allStrings ? ['highE', 'B', 'G', 'D', 'A', 'lowE'] : c.strings.slice().sort((a, b) => SD_OPEN_MIDI[b] - SD_OPEN_MIDI[a])),   // high string on top
    hitStrings: c.power || c.allStrings ? c.strings : null,
    clickFn: 'ncTap',
    noteAt: (k, f) => sdNoteAt(k, f),
    shade: [c.minFret, c.maxFret]
  });
  const ans = st.mode === 'answer';
  const foot = ans
    ? `<span class="nc-speed" id="nc-speed-${key}">${escHtml(ncAnsMeta(st.L.bpm))}</span>` +
      `<button type="button" class="sdr-btn2" onclick="ncSlower('${key}')">${escHtml(t('nc.slower'))}</button>` +
      `<button type="button" class="sdr-btn2" onclick="ncFaster('${key}')">${escHtml(t('nc.faster'))}</button>`
    : `<div class="fret-dots nc-dots" id="nc-dots-${key}"></div>`;
  return ncHeadHtml(st, ans ? t('nc.metaPlayAlong') : t('nc.metaLevel', { n: st.lvIdx + 1, bpm: st.L.bpm })) +
    `<div class="sdr-body nc-play">` +
      `<div class="nc-stage">` +
        `<div class="nc-card" id="nc-card-${key}"></div>` +
        `<div class="nc-side">` +
          `<div class="nc-pips" id="nc-pips-${key}"></div>` +
          (st.micOn ? `<div class="nc-heard" id="nc-heard-${key}"><span class="coach-live-dot"></span>${escHtml(t('nc.listening'))}</div>` : '') +
        `</div>` +
      `</div>` +
      `<div class="sdr-fb nc-fb" id="nc-fb-${key}" aria-live="polite"></div>` +
      `<div class="nc-board" id="nc-board-${key}">${board}</div>` +
      `<div class="nc-foot">${foot}` +
      `<button type="button" class="sdr-btn2" onclick="ncQuit('${key}')">${escHtml(t('nc.stop'))}</button></div>` +
    `</div>`;
}

function ncPaint(st){
  const key = st.key;
  const card = document.getElementById('nc-card-' + key);
  if(!card) return;
  // No "Next:" preview (Jonathan, 2026-09-30): the student reads one name at a time.
  if(st.idx < 0){
    card.innerHTML = `<span class="nc-kicker">${escHtml(t('nc.getReady'))}</span><span class="nc-note nc-count" id="nc-count-${key}"></span>`;
    card.className = 'nc-card';
  } else {
    const p = st.seq[st.idx];
    card.innerHTML = ncPromptHtml(p);
    card.className = 'nc-card';
    void card.offsetWidth; card.classList.add('nc-deal');
  }
  if(st.mode === 'answer'){
    // The last note's answer goes dark and its line clears as the new name lands.
    const board = document.getElementById('nc-board-' + key);
    if(board) board.querySelectorAll('.fg-marker.nc-lit').forEach(m => m.classList.remove('nc-lit'));
    const fb = document.getElementById('nc-fb-' + key);
    if(fb){ fb.className = 'sdr-fb nc-fb'; fb.textContent = ''; }
  }
  ncPaintDots(st);
}
function ncPaintDots(st){
  const el = document.getElementById('nc-dots-' + st.key);
  if(!el) return;
  el.innerHTML = Array.from({ length: NC_ROUND }, (_, i) => {
    const p = st.seq[i];
    let cls = 'fret-dot';
    if(p && p.res === 'hit') cls += ' hit';
    else if(p && p.res === 'miss') cls += ' miss';
    else if(i === st.idx) cls += ' cur';
    return `<span class="${cls}"></span>`;
  }).join('');
}
function ncPaintPips(st, beatInSeg, total, counting){
  const el = document.getElementById('nc-pips-' + st.key);
  if(!el) return;
  el.innerHTML = Array.from({ length: total }, (_, i) =>
    `<span class="nc-pip${i === beatInSeg ? ' on' : ''}${i === 0 ? ' one' : ''}"></span>`).join('');
  if(counting){
    const c = document.getElementById('nc-count-' + st.key);
    if(c) c.textContent = String(beatInSeg + 1);
  }
}

/* Timeline: a run is a chain of segments — the count-in (segment -1), then
   one per note — each `segBeats` long at the segment's own tempo. The
   play-along can change tempo, and does so only at a segment boundary, so
   a note never stretches under the student mid-way. */
function ncSegLen(st){ return st.segBeats * st.beatMs; }
function ncNoteBeats(st){ return st.mode === 'answer' ? NC_ANS_BEATS : st.L.beats; }
function ncNextBeatMs(st){ return st.pendingStep != null ? 60000 / NC_ANS_BPM[st.pendingStep] : st.beatMs; }

function ncFrame(){
  const st = ncLive && noteCalls[ncLive];
  if(!st || st.phase !== 'play') return;
  const box = ncBox(st.key);
  if(!box || !box.isConnected){ ncStop(st.key); return; }
  if(st.micOn && typeof coachAnalyser !== 'undefined' && !coachAnalyser){
    ncStop(st.key);
    st.phase = 'setup'; st.msg = t('nc.micLost');
    ncRepaint(st.key, ncSetupHtml(st.key));
    return;
  }
  const now = performance.now();
  // The round is over but the last note is still in its mic grace.
  if(st.ending){
    if(st.micOn) ncListen(st, now);
    ncGraceTick(st, now);
    if(st.graceIdx == null){ ncFinish(st.key); return; }
    st.raf = requestAnimationFrame(ncFrame);
    return;
  }
  ncClicks(st, now);
  // Segment boundary: the next note lands.
  while(now >= st.segStart + ncSegLen(st)){
    st.segStart += ncSegLen(st);
    ncGraceTick(st, Infinity);      // a grace still open from the note before last ends now
    const prev = st.idx;
    if(prev >= 0 && st.seq[prev].res == null){
      /* Mic grace: the mic hears a note a beat-fraction after it is played
         and needs ~150 ms more to be sure of the pitch, so a note played in
         the last moments of its card used to settle after the card had
         moved on — and was checked against the NEW note. With the mic on,
         the card stays answerable for NC_MIC_GRACE_MS; ncListen credits it
         only with a pluck that was played before this boundary. A tap
         round has no delay to cover and misses at once, as before. */
      if(st.micOn){ st.graceIdx = prev; st.graceFrom = st.segStart; st.graceUntil = st.segStart + NC_MIC_GRACE_MS; }
      else if(st.mode !== 'answer') ncResolve(st, prev, 'miss', null);
    }
    st.idx++;
    if(st.mode !== 'answer' && st.idx >= NC_ROUND){
      if(st.graceIdx != null){ st.ending = true; st.raf = requestAnimationFrame(ncFrame); return; }
      ncFinish(st.key); return;
    }
    if(st.mode === 'answer') ncAnsBoundary(st);
    st.segBeats = ncNoteBeats(st);
    st.beatShown = -1; st.revealed = false;
    while(st.seq.length < st.idx + 2 && (st.mode === 'answer' || st.seq.length < NC_ROUND)) ncDeal(st);
    // A pluck from before the boundary keeps settling for the grace card.
    if(st.graceIdx == null){ st.readings = []; st.attackT = 0; }
    st.locked = false; st.heard = '';
    ncPaint(st);
  }
  ncGraceTick(st, now);
  const beat = now < st.segStart ? -1 : Math.floor((now - st.segStart) / st.beatMs);
  if(beat >= 0 && beat !== st.beatShown){
    st.beatShown = beat;
    ncPaintPips(st, beat, st.segBeats, st.idx < 0);
    if(st.mode === 'answer' && st.idx >= 0 && beat >= NC_ANS_REVEAL && !st.revealed) ncReveal(st);
  }
  if(st.micOn && st.idx >= 0){
    if(st.seq[st.idx].res == null || st.graceIdx != null) ncListen(st, now);
    // Answered: keep the onset detector's levels current for the next card.
    else if(typeof coachOnsetTick === 'function') coachOnsetTick(st, coachReadFrame(), 0, false);
  }
  st.raf = requestAnimationFrame(ncFrame);
}

/* Close the mic grace (see the boundary in ncFrame) once `now` passes it:
   an unanswered note is a miss then — in the scored levels; the play-along
   never marks misses — and the next pluck starts fresh for the new card. */
const NC_MIC_GRACE_MS = 400;
function ncGraceTick(st, now){
  if(st.graceIdx == null || now <= st.graceUntil) return;
  const i = st.graceIdx;
  st.graceIdx = null;
  if(st.mode !== 'answer' && st.seq[i] && st.seq[i].res == null) ncResolve(st, i, 'miss', null);
  // Drop a pluck that belonged to the old card; one played since keeps settling.
  if(st.attackT && (!st.micOn || st.attackT - coachMicLatencyMs() < st.graceFrom)){ st.readings = []; st.attackT = 0; }
}

/* Play-along only, at each note boundary: apply a waiting tempo step (from
   the count, Slower or Faster), then count this note. The step-up is QUEUED one
   note early so the click scheduler, which books the next note's clicks
   ~120 ms ahead, already sees the new tempo when that note arrives. */
function ncAnsBoundary(st){
  if(st.pendingStep != null){
    st.prog.ans = st.pendingStep;
    st.pendingStep = null;
    st.sinceUp = 0;
    st.L.bpm = NC_ANS_BPM[st.prog.ans];
    st.beatMs = 60000 / st.L.bpm;
    ncSaveProg(st.cfg, st.prog);
    const sp = document.getElementById('nc-speed-' + st.key);
    if(sp) sp.textContent = ncAnsMeta(st.L.bpm);
  }
  st.sinceUp++;
  if(st.sinceUp >= NC_ANS_EVERY && NC_ANS_BPM[st.prog.ans] < NC_ANS_AUTO_MAX) st.pendingStep = st.prog.ans + 1;
}
/* Slower: one step down, taking effect as the next name lands; the count to
   the next speed-up starts over from there. */
function ncSlower(key){
  const st = noteCalls[key];
  if(!st || st.phase !== 'play' || st.mode !== 'answer') return;
  const from = st.pendingStep != null ? st.pendingStep : st.prog.ans;
  st.pendingStep = Math.max(0, from - 1);
  st.sinceUp = 0;               // ncAnsBoundary resets it again when the step lands
  const sp = document.getElementById('nc-speed-' + key);
  if(sp) sp.textContent = ncAnsMeta(NC_ANS_BPM[st.pendingStep]);
}
/* Faster: Slower's mirror — one step up (stops at the top of NC_ANS_BPM),
   landing with the next name; the count to the next automatic step-up
   starts over from there. */
function ncFaster(key){
  const st = noteCalls[key];
  if(!st || st.phase !== 'play' || st.mode !== 'answer') return;
  const from = st.pendingStep != null ? st.pendingStep : st.prog.ans;
  st.pendingStep = Math.min(NC_ANS_BPM.length - 1, from + 1);
  st.sinceUp = 0;
  const sp = document.getElementById('nc-speed-' + key);
  if(sp) sp.textContent = ncAnsMeta(NC_ANS_BPM[st.pendingStep]);
}
function ncReveal(st){
  st.revealed = true;
  const p = st.seq[st.idx];
  const lit = (k, f) => {
    const m = document.getElementById(`fgm-${st.key}-${k}-${f}`);
    if(m) m.classList.add('nc-lit');
  };
  p.frets.forEach(f => {
    lit(p.str, f);
    /* A power chord (ca-43) lights the whole shape: the 5th and the octave
       sit two frets up on the next two strings toward the floor. */
    if(p.power){
      const up = NC_POWER_UP[p.str];
      if(up) { lit(up[0], f + 2); lit(up[1], f + 2); }
    }
  });
  const fb = document.getElementById('nc-fb-' + st.key);
  if(fb && p.res !== 'hit'){
    fb.className = 'sdr-fb nc-fb';
    fb.textContent = t(ncK(p.power, 'fbAnswer'), ncVars(p));
  }
}

/* The click, scheduled ~120 ms ahead. Coach on: count-in only (a speaker
   click would reach the mic). Coach off: every beat, beat 1 of each note
   accented so the student hears the new name land. `st.ck` walks the same
   segments the frame loop does; a click at the start of the NEXT note uses
   the boundary time, which a pending tempo change never moves. */
function ncClicks(st, now){
  const ctx = getAudioCtx();
  let guard = 0;
  while(st.ck.at - now <= 120 && guard++ < 8){
    const ck = st.ck;
    if(st.mode !== 'answer' && ck.seg >= NC_ROUND) return;
    if(!(st.micOn && ck.seg >= 0) && ck.at >= now - 30){
      pcClick(ctx.currentTime + Math.max(0, (ck.at - now) / 1000), ck.beat === 0);
    }
    const inCur = ck.seg === st.idx;
    const bMs = inCur ? st.beatMs : ncNextBeatMs(st);
    const segBeats = ck.seg < 0 ? NC_COUNT_IN : ncNoteBeats(st);
    if(ck.beat + 1 < segBeats){ ck.beat++; ck.at += bMs; }
    else { ck.seg++; ck.beat = 0; ck.at = inCur ? st.segStart + ncSegLen(st) : ck.at + bMs; }
  }
}

/* What the mic accepts for a Note Call card (2026-10-30). A single note: its
   exact pitch, as ever. A power chord (drill.power, ca-43): the student
   STRUMS it, and the detector reads a strum as the root, the octave, the note
   an octave BELOW the root (the pitch a root and its 5th make together, which
   YIN reads from about B2 up: low E fret 7 and everything above), the 5th, or
   nothing. So each root answers with three: itself, root + 12 and root - 12.
   Waiting for the exact root alone counted a strummed power chord right 0
   times in 40 on a guitar with a strong low fundamental; with the three, a
   root + 5th + octave strum was heard 96% to 100% of the time across the 26
   roots at the three harmonic balances tried (tools/mic-sim/power-notecall.mjs,
   synthetic audio, not a Chromebook mic). Not every strum: the lowest roots
   (low E frets 0-6, under B2) have their octave below under YIN's 60 Hz floor,
   and a strum whose levels sit between the balances tried can still go unheard
   there; a strum with the root string much quieter than the other two was
   heard 67% of the time at the strong-fundamental balance (100% at the other
   two).
   The 5th is NOT accepted here (Jonathan, 2026-10-31), though Riff Runner's
   Wait Mode takes it (coachPowerTargets). A chord rooted a 5th above the card
   (B5 played for an E5 card) has the card's 5th as its root, and with the 5th
   accepted that wrong chord was counted right 7.7% / 28.9% / 100% of the time
   at the strong / middle / weak balance (one a 4th below the card: 0% / 4.5% /
   7.7%). Without it every one of those rows is 0 of 1040, and the 15 right-strum
   rows are exactly the same numbers, because in every run a right strum was
   answered by the root, the octave or the octave below, never by the 5th.
   ncTargets is what goes to the settle call; ncAnswerAt says which fret's
   root a heard pitch answers (the exact root first, so fret 0 and fret 12 of
   the same note stay apart when the root itself is heard), -1 for none.
   Pure: no DOM. */
/* The three pitches that answer a power chord in Riff Runner's Wait Mode
   (rnwTargets in coach.js): the root, the 5th above it and the octave. Defined
   here, in the file that always loads first. Note Call does not use it (it does
   not take the 5th: see ncPowerTones). */
function coachPowerTargets(rootMidi){ return [rootMidi, rootMidi + 7, rootMidi + 12]; }
function ncPowerTones(r){ return [r - 12, r, r + 12]; }
function ncTargets(p){
  return p.power ? p.midis.reduce((all, r) => all.concat(ncPowerTones(r)), []) : p.midis;
}
function ncAnswerAt(p, m){
  const exact = p.midis.indexOf(m);
  if(exact >= 0 || !p.power) return exact;
  for(let k = 0; k < p.midis.length; k++) if(ncPowerTones(p.midis[k]).indexOf(m) >= 0) return k;
  return -1;
}

/* Mic: same shape as Note Hunt's loop — readings start COACH_ATTACK_SKIP
   after the signal crosses the gate, spaced >=40 ms, and three in a row
   within 0.6 semitone make a note. The right pitch answers the card; a
   steady wrong one just shows up as "Heard F" (the last note can still be
   ringing, so it is never a miss by itself). A power-chord card also reads
   with Riff Runner's two-tier clarity (RNW_POWER_CLARITY): at the single-note
   gate YIN finds no pitch in most strums. */
function ncListen(st, now){
  const rms = coachReadFrame();
  if(rms > COACH_PITCH_GATE){
    if(!st.attackT) st.attackT = coachOnsetAt;   // when it arrived, not this frame
    // Waiting for: this card's note, and the card still in its mic grace.
    const want = (st.seq[st.idx] ? ncTargets(st.seq[st.idx]) : [])
      .concat(st.graceIdx != null ? ncTargets(st.seq[st.graceIdx]) : []);
    const m = coachSettlePitch(st, want, rms, undefined, st.cfg.power ? RNW_POWER_CLARITY : undefined);
    if(m == null) return;
    // A pluck played before the last boundary answers the card in grace.
    if(st.graceIdx != null && st.attackT - coachMicLatencyMs() < st.graceFrom){
      const g = st.seq[st.graceIdx], gi = st.graceIdx, ga = ncAnswerAt(g, m);
      st.readings = []; st.attackT = 0;
      if(ga >= 0){
        st.graceIdx = null;
        if(g.res == null) ncResolve(st, gi, 'hit', { fret: g.frets[ga], mic: true });
      }
      // An old pluck only ever answers the old card — the new card's name
      // wasn't up yet, so even its note can't be an answer to it.
      return;
    }
    const p = st.seq[st.idx];
    if(!p || p.res != null) return;   // the round's over, or this card is already answered
    const at = ncAnswerAt(p, m);
    if(at >= 0){ ncResolve(st, st.idx, 'hit', { fret: p.frets[at], mic: true }); return; }
    if(m >= 36 && m <= 76){
      const name = sdNoteAt('lowE', m - SD_OPEN_MIDI.lowE);
      if(name !== st.heard){
        st.heard = name;
        const el = document.getElementById('nc-heard-' + st.key);
        if(el) el.innerHTML = `<span class="coach-live-dot"></span>${escHtml(t('nc.heard', { note: name }))}`;
      }
    }
  } else if(rms < COACH_PITCH_GATE * 0.5){
    st.readings = []; st.attackT = 0;
  }
}

function ncTap(sid, k, f){
  const st = noteCalls[sid];
  if(!st || st.phase !== 'play' || st.idx < 0) return;
  const p = st.seq[st.idx];
  const right = k === p.str && p.frets.indexOf(f) >= 0;
  if(st.mode === 'answer'){
    // Play-along: a tap is a self-check, never a score.
    ncMark(st.key, k, f, right ? 'fg-good' : 'fg-bad');
    if(right && p.res == null) ncResolve(st, st.idx, 'hit', { fret: f });
    return;
  }
  if(p.res != null || st.locked) return;
  st.locked = true;               // first tap decides
  if(right) ncResolve(st, st.idx, 'hit', { fret: f });
  else ncResolve(st, st.idx, 'miss', { tap: { k, f } });
}

function ncMark(key, k, f, cls){
  const m = document.getElementById(`fgm-${key}-${k}-${f}`);
  if(m) flashClass(m, cls, 1100);
}
function ncResolve(st, i, res, info){
  const p = st.seq[i];
  if(!p || p.res != null) return;
  p.res = res;
  const key = st.key, fb = document.getElementById('nc-fb-' + key);
  const vars = ncVars(p);
  const card = document.getElementById('nc-card-' + key);
  if(res === 'hit'){
    /* A power chord on a card with two frets (E5 on the low E string: 0 and 12)
       sounds alike at both (one is an octave higher), and the mic credits
       whichever root it settled on, often fret 0 when the student played fret 12
       (the octave below fret 12's root is fret 0's root). So a MIC hit names and marks every fret the
       card has; a tap names the fret that was tapped. Single notes are exact. */
    const both = !!(info.mic && p.power && p.frets.length > 1);
    (both ? p.frets : [info.fret]).forEach(f => ncMark(key, p.str, f, 'fg-good'));
    if(fb){ fb.className = 'sdr-fb nc-fb hit'; fb.textContent = t(ncK(p.power, 'fbHit'), Object.assign(vars, { fret: both ? ncFretList(p) : info.fret })); }
    if(card && i === st.idx) card.classList.add('hit');
  } else {
    if(info && info.tap){
      ncMark(key, info.tap.k, info.tap.f, 'fg-bad');
      if(fb){ fb.className = 'sdr-fb nc-fb miss'; fb.textContent = t(ncK(p.power, 'fbWrong'), Object.assign(vars, { pick: sdNoteAt(info.tap.k, info.tap.f) })); }
    } else if(fb){ fb.className = 'sdr-fb nc-fb miss'; fb.textContent = t(ncK(p.power, 'fbMiss'), vars); }
    p.frets.forEach(f => ncMark(key, p.str, f, 'fg-good'));
    if(card && i === st.idx) card.classList.add('miss');
    st.requeue.push({ p: { str: p.str, note: p.note, power: p.power, frets: p.frets, midis: p.midis }, due: i + 3 });
  }
  ncPaintDots(st);
}

function ncFinish(key){
  const st = noteCalls[key];
  if(!st) return;
  if(st.idx >= 0 && st.seq[st.idx] && st.seq[st.idx].res == null) ncResolve(st, st.idx, 'miss', null);
  ncStop(key);
  const score = st.seq.filter(p => p.res === 'hit').length;
  const passed = score >= NC_PASS;
  const last = st.lvIdx === NC_LEVELS.length - 1;
  let verdict, cls = 'mid', nextBtn = '';
  if(passed && last){
    const was = st.prog.bpm;
    st.prog.bpm = Math.min(NC_MAX_BPM, was + NC_FASTER);
    ncSaveProg(st.cfg, st.prog);
    cls = 'good';
    verdict = st.prog.bpm > was ? t('nc.verdictFaster', { bpm: st.prog.bpm }) : t('nc.verdictTop');
    st.level = st.lvIdx;
    nextBtn = `<button type="button" class="sdr-start" onclick="ncStart('${key}')">&#x25B6; ${escHtml(t('nc.playAt', { bpm: st.prog.bpm }))}</button>`;
  } else if(passed){
    if(st.prog.lv < st.lvIdx + 2){ st.prog.lv = st.lvIdx + 2; ncSaveProg(st.cfg, st.prog); }
    cls = 'good';
    verdict = t('nc.verdictUnlocked', { n: st.lvIdx + 2 });
    st.level = st.lvIdx + 1;
    nextBtn = `<button type="button" class="sdr-start" onclick="ncStart('${key}')">&#x25B6; ${escHtml(t('nc.start', { n: st.lvIdx + 2 }))}</button>`;
  } else {
    verdict = t(ncK(st.cfg.power, 'verdictAgain'), { pass: NC_PASS, total: NC_ROUND });
    st.level = st.lvIdx;
  }
  st.phase = 'done';
  // Notes to practise: every miss, once each, in the order they came up.
  const seen = {}, misses = [];
  st.seq.forEach(p => {
    const id = p.str + ':' + p.note;
    if(p.res === 'miss' && !seen[id]){ seen[id] = 1; misses.push(p); }
  });
  const rows = misses.length
    ? misses.map(p => `<div class="sdr-drill-row"><b>${escHtml(p.note)} · ${escHtml(ncStrName(p.str))}</b><span>${escHtml(t(ncK(p.power, 'rowFret'), { fret: ncFretList(p) }))}</span></div>`).join('')
    : `<div class="sdr-drill-row"><b>${escHtml(t('nc.clean'))}</b></div>`;
  ncRepaint(key,
    ncHeadHtml(st, t('nc.metaLevel', { n: st.lvIdx + 1, bpm: st.L.bpm })) +
    `<div class="sdr-body">` +
      `<div class="sdr-score">${escHtml(t('nc.score', { n: score, total: NC_ROUND }))}</div>` +
      `<div class="sdr-score-sub">${escHtml(ncLevelDesc(st.L, st.cfg.power))}</div>` +
      `<div class="sdr-verdict ${cls}">${escHtml(verdict)}</div>` +
      `<div class="sdr-drill"><div class="sdr-drill-title">${escHtml(t(ncK(st.cfg.power, 'practiceThese')))}</div>${rows}</div>` +
      `<div class="sdr-actions">${nextBtn}` +
        `<button type="button" class="sdr-btn2" onclick="ncAgain('${key}',${st.lvIdx})">${escHtml(t('nc.again'))}</button>` +
        `<button type="button" class="sdr-btn2" onclick="ncToSetup('${key}')">${escHtml(t('nc.levels'))}</button>` +
      `</div>` +
    `</div>`);
}
function ncAgain(key, lv){ const st = noteCalls[key]; if(!st) return; st.level = lv; ncStart(key); }
function ncToSetup(key){
  const st = noteCalls[key];
  if(!st) return;
  st.phase = 'setup'; st.msg = '';
  ncRepaint(key, ncSetupHtml(key));
}
function ncQuit(key){
  const st = noteCalls[key];
  if(!st) return;
  ncStop(key);
  st.phase = 'setup';
  if(st.lvIdx != null) st.level = st.lvIdx;
  ncRepaint(key, ncSetupHtml(key));
}
function ncStop(key){
  const st = noteCalls[key];
  if(!st) return;
  if(st.raf){ cancelAnimationFrame(st.raf); st.raf = null; }
  if(st.micOn){ st.micOn = false; if(typeof coachMicOff === 'function') coachMicOff(); }
  if(ncLive === key) ncLive = null;
}
/* Stops any running round and puts its card back on the setup screen.
   Called by ncStart, and by coach.js's gamesStopMic() — the umbrella every
   "someone else needs the mic / the tab went to the background" path runs. */
function ncStopAll(){
  Object.keys(noteCalls).forEach(k => {
    const st = noteCalls[k];
    if(st.starting){ st.cancelled = true; return; }   // mid mic-start: ncStart bails when its await returns
    if(st.phase !== 'play') return;
    ncStop(k);
    st.phase = 'setup';
    if(st.lvIdx != null) st.level = st.lvIdx;
    ncRepaint(k, ncSetupHtml(k));
  });
}
function ncMicActive(){ return !!(ncLive && noteCalls[ncLive] && noteCalls[ncLive].micOn); }

/* ── Call the chord (step.drill, type 'chordcall') ───────────────────────
   The no-guitar rung under "reading a lyric sheet": the record plays one
   section of a song and the student keeps one beat AHEAD of the chord changes.
   (Work order 2026-11-05, Day 36.)

   Module-data schema:
     drill: { type:'chordcall', card:'ca-29', section:'Verse 1', mode:'follow'|'call' }
   `card` names the practice card whose sections it reads (the SAME objects the
   card and the lyric sheet read — pcLayout, nothing copied) and `section` is
   one of that card's section labels. The drill plays that section of the
   card's own backing track: Jimi's recording, whatever the card's recording
   switch says (the drill reads the raw entry, not caView).

   A "change" is what the lyric sheet counts as one (pcSheetMap): the first
   chord of the section, and every chord that differs from the one before it,
   a rest between two chords not being a change on its own.

   follow: the next chord is shown in a big box. Tap it, or press the space bar,
           in the last beat before the band reaches it. Pass: every change
           hit, two rounds in a row.
   call:   the next chord is HIDDEN; the student picks it from the song's chord
           buttons in the same beat. A round is the section's first 10 changes
           (all of them if there are fewer). Pass: 8 of 10.

   The window for change k runs from one beat before it to the change itself
   (+ CHC_GRACE for the ear's and the screen's own slop). In Follow, a tap in the
   beat before the window opens is "early", a miss that uses up the change
   (Jonathan, 2026-11-09: tapping every 250 ms used to pass every round); that
   beat starts no sooner than half a beat after the change before it, so a quick
   double tap after a hit costs nothing (chcEarlyFrom). A tap before that, and any
   early pick in Call, is "too early" and does nothing. A tap after the window,
   before the next window opens, is late (a miss that still uses up the change);
   no tap is a miss. When
   a change is closer than a beat to the one before it, its window is cut so it
   opens CHC_GRACE after the previous change (chcWindows; checks.mjs 1ce walks
   every change). Times are the file's own clock (audio.currentTime) less the
   output latency, so they are what the student HEARS; the count-in before the
   audio is counted on a virtual clock so the first change has its beat too.
   Nothing is saved: the score is per attempt, on screen. Teacher preview plays
   for real. */
const CHC_ROUND = 10, CHC_PASS = 8, CHC_PASS_STREAK = 2;
const CHC_GRACE = 0.06;        // seconds past the change that still count as on it
const chordCalls = {};
let chcLive = null;            // key of the drill whose round is running
let chcKeyFn = null, chcKeyUpFn = null;   // the space-bar listeners, only while a Follow round runs

function chcBox(key){ return document.getElementById('chcr-' + key); }

/* Pure: the changes of one section, in beats from the start of its first lap. */
function chcTargets(S, bpb){
  const out = [];
  let prev = null;
  for(let rep = 0; rep < S.reps; rep++){
    let pos = rep * S.bars * bpb;
    S.notes.forEach(nt => {
      const len = nt.beats > 0 ? nt.beats : 1;
      if(!nt.rest && nt.note !== prev){ out.push({ name: nt.note, beat: pos, rep }); prev = nt.note; }
      pos += len;
    });
  }
  return out;
}
/* Pure: one beat's length in the window's own seconds, at bar `bar` (a
   live-band track has bars of different lengths). */
function chcBeatSec(win, bpb, bar){
  const e = win.edges, i = Math.max(0, Math.min(e.length - 2, bar));
  return (e[i + 1] - e[i]) / bpb;
}
/* Pure: { at, open, beatSec } for every target — `at` the change, `open` where
   its window opens: a beat before, but never earlier than CHC_GRACE after the
   change before it. */
/* Pure: where Follow's "early" beat starts for change k (chcAct): a beat before
   its window opens, but never sooner than half a beat after the change before. */
function chcEarlyFrom(wins, k){
  const w = wins[k];
  return Math.max(w.open - w.beatSec, k > 0 ? wins[k - 1].at + w.beatSec / 2 : -Infinity);
}
function chcWindows(win, targets, bpb){
  const out = [];
  targets.forEach((tg, k) => {
    const at = snipTimeAtBars(win, tg.beat / bpb);
    const beatSec = chcBeatSec(win, bpb, Math.floor(tg.beat / bpb + 1e-6));
    const open = Math.max(at - beatSec, k > 0 ? out[k - 1].at + CHC_GRACE : -Infinity);
    out.push({ at, open, beatSec });
  });
  return out;
}
/* Pure: everything about one drill that does not move. null when the card or
   section is not there (checks.mjs 1ce fails the push on that). */
function chcModel(drill){
  const act = (window.CLASS_ACTIVITIES || []).find(x => x.id === drill.card);
  const L = act && pcLayout(act);
  if(!L) return null;
  const si = L.sections.findIndex(S => S.s.label === drill.section);
  if(si < 0) return null;
  const S = L.sections[si];
  const bpb = L.tr.beatsPerBar > 0 ? L.tr.beatsPerBar : 4;
  const all = chcTargets(S, bpb);
  const call = drill.mode === 'call';
  const targets = call ? all.slice(0, CHC_ROUND) : all;
  const chords = [];
  all.forEach(x => { if(chords.indexOf(x.name) < 0) chords.push(x.name); });
  const n = targets.length;
  const passAt = call ? (n >= CHC_ROUND ? CHC_PASS : Math.ceil(n * CHC_PASS / CHC_ROUND)) : n;
  return { act, L, S, si, bpb, targets, chords, n, passAt, call, song: (tf(act, 'title') || '').split(' — ')[0] };
}

function renderChordCall(drill, key){
  const prev = chordCalls[key];
  if(prev) chcStop(key);
  const M = chcModel(drill);
  if(!M) return '';
  chordCalls[key] = { key, drill, M, phase: 'setup', slow: prev ? prev.slow : true, streak: prev ? prev.streak : 0, msg: '' };
  return `<div class="sdr chcr" id="chcr-${escAttr(key)}" onpointerdown="chcDown(event)" onclick="chcDown(event)">${chcSetupHtml(key)}</div>`;
}
function chcHeadHtml(st, right){
  return `<div class="sdr-head"><span>${escHtml(t('chc.head', { song: st.M.song, section: tf(st.M.S.s, 'label') }))}</span>` +
    `<span class="sdr-meta">${escHtml(right)}</span></div>`;
}
function chcMeta(st){ return t(st.M.call ? 'chc.metaCall' : 'chc.metaFollow') + ' · ' + t(st.slow ? 'chc.slower' : 'chc.normal'); }
function chcSpeedHtml(st){
  const pill = (slow, label) =>
    `<button type="button" class="sdr-pill${st.slow === slow ? ' active' : ''}" aria-pressed="${st.slow === slow}" data-chc-slow="${slow ? 1 : 0}">${escHtml(label)}</button>`;
  return `<div class="nc-toggle chc-speed"><span class="nc-toggle-label">${escHtml(t('chc.speed'))}</span>${pill(true, t('chc.slower'))}${pill(false, t('chc.normal'))}</div>`;
}
function chcPassLine(st){
  return st.M.call ? t('chc.passCall', { pass: st.M.passAt, total: st.M.n }) : t('chc.passFollow', { n: CHC_PASS_STREAK });
}
function chcSetupHtml(key){
  const st = chordCalls[key];
  if(!st) return '';
  const msg = st.msg ? `<div class="coach-note nc-msg">${escHtml(st.msg)}</div>` : '';
  const streak = !st.M.call && st.streak > 0 ? `<div class="sdr-best">${escHtml(t('chc.streak', { n: st.streak, total: CHC_PASS_STREAK }))}</div>` : '';
  return chcHeadHtml(st, chcMeta(st)) +
    `<div class="sdr-body">` +
      `<div class="sdr-intro">${escHtml(t(st.M.call ? 'chc.introCall' : 'chc.introFollow'))}</div>` +
      chcSpeedHtml(st) +
      msg +
      `<button type="button" class="sdr-start" data-chc-start="1">&#x25B6; ${escHtml(t('chc.start'))}</button>` +
      `<div class="sdr-best">${escHtml(chcPassLine(st))}</div>` + streak +
    `</div>`;
}
function chcPlayHtml(key){
  const st = chordCalls[key], M = st.M;
  const pips = Array.from({ length: M.bpb }, (_, i) => `<span class="nc-pip${i === 0 ? ' one' : ''}"></span>`).join('');
  const picks = M.call
    ? `<div class="chc-picks" role="group" aria-label="${escAttr(t('chc.pickAria'))}">` +
        M.chords.map(c => `<button type="button" class="chc-pick" data-chc-pick="${escAttr(c)}">${escHtml(c)}</button>`).join('') + `</div>`
    : '';
  return chcHeadHtml(st, chcMeta(st)) +
    `<div class="sdr-body chc-play">` +
      `<div class="chc-top"><div class="nc-pips" id="chc-pips-${escAttr(key)}">${pips}</div><span class="chc-status" id="chc-status-${escAttr(key)}"></span></div>` +
      `<div class="chc-stage">` +
        `<div class="chc-now"><span class="nc-kicker">${escHtml(t('chc.now'))}</span><span class="chc-name" id="chc-now-${escAttr(key)}">&nbsp;</span></div>` +
        `<button type="button" class="chc-next" id="chc-next-${escAttr(key)}" data-chc-tap="1" aria-label="${escAttr(t(M.call ? 'chc.nextAriaCall' : 'chc.nextAria'))}">` +
          `<span class="nc-kicker">${escHtml(t('chc.next'))}</span><span class="chc-name" id="chc-nextname-${escAttr(key)}">?</span></button>` +
      `</div>` +
      picks +
      `<div class="sdr-fb nc-fb chc-fb" id="chc-fb-${escAttr(key)}" aria-live="polite"></div>` +
      `<div class="nc-foot"><div class="fret-dots nc-dots" id="chc-dots-${escAttr(key)}"></div>` +
      (M.call ? '' : `<span class="chc-keyhint">${escHtml(t('chc.keyHint'))}</span>`) +
      `<button type="button" class="sdr-btn2" data-chc-stop="1">${escHtml(t('chc.stop'))}</button></div>` +
    `</div>`;
}

/* One handler for the whole drill. A tap that must be on time acts on
   pointerdown (a click waits for the finger to lift); a click is only taken
   when it came from the keyboard (detail 0), so a mouse press is not counted
   twice. Everything else — Start, Stop, the speed — acts on click. */
function chcDown(ev){
  const box = ev.currentTarget, el = ev.target && ev.target.closest ? ev.target.closest('[data-chc-start],[data-chc-stop],[data-chc-slow],[data-chc-tap],[data-chc-pick],[data-chc-again]') : null;
  if(!el || !box) return;
  const key = box.id.replace(/^chcr-/, '');
  const timed = el.hasAttribute('data-chc-tap') || el.hasAttribute('data-chc-pick');
  if(timed){
    if(ev.type === 'click' && ev.detail !== 0) return;
    chcAct(key, el.hasAttribute('data-chc-pick') ? el.getAttribute('data-chc-pick') : null);
    return;
  }
  if(ev.type !== 'click') return;
  if(el.hasAttribute('data-chc-start') || el.hasAttribute('data-chc-again')) chcStart(key);
  else if(el.hasAttribute('data-chc-stop')) chcQuit(key);
  else if(el.hasAttribute('data-chc-slow')) chcSetSlow(key, el.getAttribute('data-chc-slow') === '1');
}
function chcSetSlow(key, slow){
  const st = chordCalls[key];
  if(!st || st.phase === 'play') return;
  st.slow = slow; st.msg = '';
  chcRepaint(key, st.phase === 'done' ? chcDoneHtml(key) : chcSetupHtml(key));
}
function chcRepaint(key, html){ const b = chcBox(key); if(b) b.innerHTML = html; }

function chcStart(key){
  const st = chordCalls[key];
  if(!st || st.phase === 'play') return;
  if(window.coachMicLive) return;                 // never play into a live mic (same guard as pcStart)
  stopAllDemoAudio();                              // tab player, snippets, practice card, metronome, other drills
  if(typeof coachInterrupt === 'function') coachInterrupt(t('coach.interrupt.micLost'));
  try { getAudioCtx().resume(); } catch(e){}
  const M = st.M;
  const win = snippetWindow(M.L.tr, { fromBar: M.S.fromBar, bars: M.S.bars * M.S.reps }, st.slow);
  const audio = new Audio();
  audio.preload = 'auto';
  audio.loop = false;
  audio.src = snippetSrc(M.L.tr, st.slow, false);
  Object.assign(st, {
    phase: 'play', msg: '', audio, win, wins: chcWindows(win, M.targets, M.bpb), k: 0, n: M.n, res: [],
    counting: true, raf: 0, timers: [], clicks: [], goAt: Infinity, allDone: false, shown: '', fbT: 0
  });
  chcLive = key;
  chcRepaint(key, chcPlayHtml(key));
  chcPaint(st);
  if(!M.call) chcKeyOn();
  try { if(document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch(e){}   // a focused Stop must not eat the space bar
  audio.addEventListener('error', () => { if(chordCalls[key] === st && st.audio === audio){ chcQuit(key); if(typeof gateToast === 'function') gateToast(t('ca.snipLoadFailed')); } }, { once: true });
  const begin = () => {
    if(chordCalls[key] !== st || st.phase !== 'play' || st.audio !== audio) return;
    try { audio.currentTime = win.start; } catch(e){}
    chcCountIn(st);
  };
  if(audio.readyState >= 1) begin();
  else audio.addEventListener('loadedmetadata', begin, { once: true });
  st.raf = requestAnimationFrame(chcFrame);
}
/* One bar of the counted beat before the audio comes in, scheduled on the
   AudioContext up front (chcStop stops the nodes, as pcStop does). */
function chcCountIn(st){
  const ctx = getAudioCtx();
  const n = st.M.bpb;
  const beat = chcBeatSec(st.win, n, 0);
  const t0 = ctx.currentTime + 0.1;
  st.clicks = [];
  for(let k = 0; k < n; k++) st.clicks.push(pcClick(t0 + k * beat, k === 0, true));
  st.beatMs = beat * 1000;
  st.goAt = performance.now() + (0.1 + n * beat) * 1000;
  st.timers.push(setTimeout(() => { if(chordCalls[st.key] === st && st.phase === 'play') chcGo(st); }, (0.1 + n * beat) * 1000));
}
function chcGo(st){
  st.counting = false;
  st.audio.play().catch(() => {});
}
/* Where the student is in the song, in the window's seconds: what they HEAR,
   i.e. the decoder's clock less the output latency. Before the audio starts it
   runs on the clock that ends at the first beat. */
function chcNow(st){
  if(st.counting) return st.win.start - (st.goAt - performance.now()) / 1000 - snipLatency();
  return st.audio.currentTime - snipLatency();
}

function chcFrame(){
  const st = chcLive && chordCalls[chcLive];
  if(!st || st.phase !== 'play') return;
  const box = chcBox(st.key);
  if(!box || !box.isConnected){ chcStop(st.key); st.phase = 'setup'; return; }
  const h = chcNow(st);
  // A change whose next window has opened without a tap is a miss.
  while(st.k < st.n){
    const lim = st.k + 1 < st.n ? st.wins[st.k + 1].open : st.wins[st.k].at + st.wins[st.k].beatSec;
    if(h >= lim) chcResolve(st, 'none'); else break;
  }
  const last = st.wins[st.n - 1];
  const ended = !st.counting && (st.audio.ended || st.audio.currentTime >= st.win.end - 0.02);
  if(ended || (st.k >= st.n && h >= last.at + 0.4)){
    while(st.k < st.n) chcResolve(st, 'none');
    chcFinish(st.key);
    return;
  }
  chcPaint(st, h);
  st.raf = requestAnimationFrame(chcFrame);
}
/* Repaint only what moved: the box, the chord now sounding, the pips. */
function chcPaint(st, h){
  const key = st.key, M = st.M;
  const nextEl = document.getElementById('chc-next-' + key);
  if(!nextEl) return;
  if(h === undefined) h = st.win.start - 1;
  // The chord sounding now: the last change whose moment has passed.
  let cur = -1;
  for(let i = 0; i < st.n; i++) if(st.wins[i].at <= h) cur = i; else break;
  const pending = st.k < st.n ? st.k : -1;
  const open = pending >= 0 && h >= st.wins[pending].open && h <= st.wins[pending].at + CHC_GRACE;
  // A hidden chord (Call) is named only once its change has come.
  const shown = pending < 0 ? '' : (!M.call || h >= st.wins[pending].at) ? M.targets[pending].name : '?';
  const sig = cur + '|' + pending + '|' + open + '|' + shown;
  if(sig !== st.shown){
    st.shown = sig;
    const nowEl = document.getElementById('chc-now-' + key);
    if(nowEl) nowEl.textContent = cur >= 0 ? M.targets[cur].name : ' ';
    const nm = document.getElementById('chc-nextname-' + key);
    if(nm) nm.textContent = pending < 0 ? '✓' : shown;
    nextEl.classList.toggle('open', !!open);
    chcPaintDots(st);
  }
  // The beat pips: the count-in counts 1..n, then the bar's beats.
  const pips = document.getElementById('chc-pips-' + key);
  if(pips){
    let beatIn = -1;
    if(st.counting){ if(st.goAt !== Infinity && st.beatMs) beatIn = Math.max(0, Math.min(M.bpb - 1, Math.floor(M.bpb - (st.goAt - performance.now()) / st.beatMs))); }
    else { const b = snipBarsAt(st.win, h); beatIn = Math.max(0, Math.min(M.bpb - 1, Math.floor((b - Math.floor(b)) * M.bpb + 1e-6))); }
    if(beatIn !== st.pip){
      st.pip = beatIn;
      Array.from(pips.children).forEach((p, i) => p.classList.toggle('on', i === beatIn));
    }
  }
  const sEl = document.getElementById('chc-status-' + key);
  const stat = st.counting ? t('chc.countIn') : '';
  if(sEl && sEl.textContent !== stat) sEl.textContent = stat;
}
function chcPaintDots(st){
  const el = document.getElementById('chc-dots-' + st.key);
  if(!el) return;
  el.innerHTML = Array.from({ length: st.n }, (_, i) => {
    const r = st.res[i];
    return `<span class="fret-dot${r === 'hit' ? ' hit' : r ? ' miss' : i === st.k ? ' cur' : ''}"></span>`;
  }).join('');
}
function chcFeedback(st, cls, text){
  const fb = document.getElementById('chc-fb-' + st.key);
  if(!fb) return;
  fb.className = 'sdr-fb nc-fb chc-fb' + (cls ? ' ' + cls : '');
  fb.textContent = text;
}
/* A tap (Follow, pick = null) or a pick (Call) while a round runs. */
function chcAct(key, pick){
  const st = chordCalls[key];
  if(!st || st.phase !== 'play' || st.k >= st.n) return;
  /* Call mode is answered by naming the chord: a tap on the "?" box with no pick is not an answer (Friday check 2026-11-06). */
  if(st.M.call && pick == null) return;
  const h = chcNow(st), w = st.wins[st.k], tg = st.M.targets[st.k];
  if(h < w.open){
    if(!st.M.call && h >= chcEarlyFrom(st.wins, st.k)) chcResolve(st, 'early', pick);
    else chcFeedback(st, '', t('chc.fbEarly'));
    return;
  }
  if(h > w.at + CHC_GRACE) chcResolve(st, 'late', pick);
  else if(pick != null && pick !== tg.name) chcResolve(st, 'wrong', pick);
  else chcResolve(st, 'hit', pick);
}
function chcResolve(st, res, pick){
  const tg = st.M.targets[st.k];
  if(!tg) return;
  st.res[st.k] = res;
  const vars = { chord: tg.name, pick: pick || '' };
  if(res === 'hit') chcFeedback(st, 'hit', t('chc.fbHit', vars));
  else if(res === 'late') chcFeedback(st, 'miss', t('chc.fbLate', vars));
  else if(res === 'early') chcFeedback(st, 'miss', t('chc.fbEarlyMiss', vars));
  else if(res === 'wrong') chcFeedback(st, 'miss', t('chc.fbWrong', vars));
  else chcFeedback(st, 'miss', t('chc.fbNone', vars));
  st.k++;
  st.shown = '';
  chcPaint(st, chcNow(st));
}

function chcFinish(key){
  const st = chordCalls[key];
  if(!st) return;
  chcStop(key);
  const M = st.M;
  const hits = st.res.filter(r => r === 'hit').length;
  const pass = hits >= M.passAt;
  if(!M.call) st.streak = pass ? st.streak + 1 : 0;
  st.phase = 'done';
  st.hits = hits;
  chcRepaint(key, chcDoneHtml(key));
}
function chcDoneHtml(key){
  const st = chordCalls[key], M = st.M;
  const hits = st.hits || 0, pass = hits >= M.passAt;
  let verdict;
  if(M.call) verdict = pass ? t('chc.verdictPassCall', { hits, total: M.n }) : t('chc.verdictAgainCall', { pass: M.passAt, total: M.n });
  else if(pass) verdict = st.streak >= CHC_PASS_STREAK ? t('chc.verdictDone', { n: CHC_PASS_STREAK }) : t('chc.verdictOne', { n: st.streak, total: CHC_PASS_STREAK });
  else verdict = t('chc.verdictAgain');
  const why = r => t(r === 'late' ? 'chc.whyLate' : r === 'early' ? 'chc.whyEarly' : r === 'wrong' ? 'chc.whyWrong' : 'chc.whyNone');
  /* The first few misses, not all of them: a round of 32 with a bad start would push Go again off a Chromebook screen. */
  const miss = [];
  st.res.forEach((r, i) => { if(r !== 'hit') miss.push(i); });
  const SHOW = 4;
  const rows = miss.slice(0, SHOW).map(i =>
    `<div class="sdr-drill-row"><span>${escHtml(t('chc.rowChange', { n: i + 1, chord: M.targets[i].name }))}</span><span class="sdr-meta">${escHtml(why(st.res[i]))}</span></div>`).join('') +
    (miss.length > SHOW ? `<div class="sdr-drill-row"><span>${escHtml(t('chc.moreMissed', { n: miss.length - SHOW }))}</span></div>` : '');
  return chcHeadHtml(st, chcMeta(st)) +
    `<div class="sdr-body">` +
      `<div class="sdr-score">${escHtml(t('chc.score', { n: hits, total: M.n }))}</div>` +
      `<div class="sdr-verdict ${pass ? 'good' : 'mid'}">${escHtml(verdict)}</div>` +
      `<div class="sdr-actions"><button type="button" class="sdr-start" data-chc-again="1">&#x25B6; ${escHtml(t('chc.again'))}</button></div>` +
      chcSpeedHtml(st) +
      (rows ? `<div class="sdr-drill"><div class="sdr-drill-title">${escHtml(t('chc.missed'))}</div>${rows}</div>` : '') +
    `</div>`;
}

/* The space bar taps the big box during a Follow round. keydown only, never a
   held key, never from a field, and preventDefault so the page does not scroll.
   Installed by chcStart, removed by chcStop — every way out goes through chcStop. */
function chcKeyOn(){
  chcKeyOff();
  chcKeyFn = ev => {
    if(ev.repeat || !(ev.code === 'Space' || ev.key === ' ')) return;
    const a = document.activeElement, tag = a && a.tagName;
    if(tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (a && a.isContentEditable)) return;
    if(!chcLive || !chordCalls[chcLive] || chordCalls[chcLive].phase !== 'play') return;
    ev.preventDefault();
    chcAct(chcLive, null);
  };
  document.addEventListener('keydown', chcKeyFn);
  /* A focused button turns a space-bar KEY-UP into a click in some browsers
     even when the key-down was cancelled; that click would tap a second time. */
  chcKeyUpFn = ev => { if(ev.code === 'Space' || ev.key === ' ') ev.preventDefault(); };
  document.addEventListener('keyup', chcKeyUpFn);
}
function chcKeyOff(){
  if(chcKeyFn){ document.removeEventListener('keydown', chcKeyFn); chcKeyFn = null; }
  if(chcKeyUpFn){ document.removeEventListener('keyup', chcKeyUpFn); chcKeyUpFn = null; }
}

/* Stops the song, the count-in, the loop and the key listener. Does not touch
   the screen — callers pick what to show. */
function chcStop(key){
  const st = chordCalls[key];
  if(!st) return;
  if(st.raf){ cancelAnimationFrame(st.raf); st.raf = 0; }
  (st.timers || []).forEach(clearTimeout); st.timers = [];
  (st.clicks || []).forEach(o => { try { o.stop(0); } catch(e){} try { o.disconnect(); } catch(e){} }); st.clicks = [];
  if(st.audio){ try { st.audio.pause(); st.audio.src = ''; } catch(e){} st.audio = null; }
  if(chcLive === key) chcLive = null;
  chcKeyOff();
}
function chcQuit(key){
  const st = chordCalls[key];
  if(!st) return;
  chcStop(key);
  st.phase = 'setup'; st.msg = '';
  chcRepaint(key, chcSetupHtml(key));
}
/* Every running round, back to its setup screen. Called by stopCardAudio and
   the hidden-tab path, like ncStopAll. */
function chcStopAll(){
  Object.keys(chordCalls).forEach(k => {
    if(chordCalls[k].phase !== 'play') return;
    chcQuit(k);
  });
}

/* ── Name the power chord (step.drill, type 'pcname') ────────────────────
   The no-guitar, no-mic rung under "power chord names from a chart": a power
   chord is named after its root, the root sits on the low E or A string, so the
   chord's name is the note's name plus a 5. (Work order 2026-11-05, widget C.)
   It is Note Call's board and names with chord names in place of note names,
   and it runs both ways. The board draws ALL SIX strings and the whole
   three-finger shape (root, 5th and octave: pwnShape), because students know
   the full fretboard and the full shape, not a two-string cut of it (Jonathan,
   2026-11-11). Only the root carries a label; only the root strings take taps.

   Module-data schema:
     drill: { type:'pcname', mode:'name'|'fret'|'both', minFret:0, maxFret:7 }
   The roots are always on the low E and A (the two root strings). The board
   always shows frets 0-12 (fgBoardSvg); outside the step's range it is greyed
   and takes no taps. A shape reaches two frets past its root, so a step's
   maxFret is 10 at most (1co pins it): every shape fits on the board.

   name:  a chord's shape lights on the board: the root is a "?" on the low E or
          A string, the 5th and the octave are plain dots. The student picks its
          chord name from 12 buttons laid out in fret order (E5 F5 F♯5 ... D♯5),
          not alphabetical.
   fret:  a chord name shows. The student taps its root on the board; the right
          fret on EITHER string is a hit (B5 is low E fret 7 and A string fret 2),
          and after the tap every right root lights green with its whole shape,
          so the student sees the other one.
   both:  each card is one or the other, shuffled.

   Show answer (ON by default, remembered per browser): a play-along, nothing
   scored. The right button (name) or the right frets (fret) are lit from the
   start (the roots with their shapes); the student taps the lit answer and the next card comes up. OFF: 10
   cards, the first answer counts, 8 of 10 finishes the step. A miss shows the
   answer and waits for Next; a hit moves on by itself.

   Names are Note Call's own, sharps with the ♯ sign, never flats (SD_NOTE_NAMES,
   sdNoteAt); a power chord is that name + '5', as in ncPool. Nothing is saved:
   the score is per attempt, on screen. Teacher preview plays the same. */
const PWN_ROUND = 10, PWN_PASS = 8, PWN_ADVANCE_MS = 650;
const PWN_STRINGS = ['lowE', 'A'];
/* The twelve chord names in fret order from the open low E string. */
const PWN_NAMES = SD_NOTE_NAMES.slice(4).concat(SD_NOTE_NAMES.slice(0, 4)).map(n => n + '5');
const powerNames = {};
function pwnBox(key){ return document.getElementById('pwn-' + key); }
const pwnPrefAnswer = () => ncPref('pwnAnswer', true);

/* Pure: every (string, chord name) the range holds with the frets it sits on,
   and the chord names laid out as cards for each mode. Shares ncPool. */
function pwnPool(minFret, maxFret){
  return ncPool({ strings: PWN_STRINGS, power: true, minFret, maxFret }, 'all');
}
/* Pure: where each chord name can be played in the range — [{ k, f }]. */
function pwnSpots(pool){
  const by = {};
  pool.forEach(p => { (by[p.note] = by[p.note] || []).push(...p.frets.map(f => ({ k: p.str, f }))); });
  return by;
}
/* Pure: the rest of the three-finger shape for a root at (string k, fret f) —
   the 5th and the octave, two frets up on the next two strings toward the
   floor (NC_POWER_UP, as Note Call's power reveal). [{ k, f }], root not included. */
function pwnShape(k, f){
  return (NC_POWER_UP[k] || []).map(s => ({ k: s, f: f + 2 }));
}
/* Pure: the cards of one round. Each is { mode, str, note, frets } — name cards
   are one string's root (the board lights those frets), fret cards are a chord
   name (any spot of it answers). Never the same chord twice in a row, every
   chord of the range before one repeats. */
function pwnDeal(cfg, n, rnd){
  const pool = pwnPool(cfg.minFret, cfg.maxFret);
  const rand = rnd || Math.random;
  const shuffle = a => { for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const out = [];
  let bag = [];
  while(out.length < n){
    if(!bag.length) bag = shuffle(pool.slice());
    let i = bag.findIndex(p => !out.length || p.note !== out[out.length - 1].note);
    if(i < 0){                                        // only the chord just dealt is left (it is on both strings): top the bag up
      bag = bag.concat(shuffle(pool.slice()));
      i = bag.findIndex(p => p.note !== out[out.length - 1].note);
    }
    const p = bag.splice(i, 1)[0];
    const mode = cfg.mode === 'both' ? (rand() < 0.5 ? 'name' : 'fret') : cfg.mode;
    out.push({ mode, str: p.str, note: p.note, frets: p.frets.slice() });
  }
  return out;
}

function renderPowerName(drill, key){
  if(powerNames[key]) pwnStop(key);
  const mode = drill.mode === 'fret' || drill.mode === 'both' ? drill.mode : 'name';
  const cfg = { mode, minFret: drill.minFret != null ? drill.minFret : 0, maxFret: drill.maxFret != null ? drill.maxFret : 7 };
  powerNames[key] = { key, cfg, phase: 'setup', answer: pwnPrefAnswer() };
  return `<div class="sdr pwnr" id="pwn-${escAttr(key)}" onclick="pwnClick(event)">${pwnSetupHtml(key)}</div>`;
}
function pwnHeadHtml(st, right){
  const c = st.cfg;
  return `<div class="sdr-head"><span>${escHtml(t('pwn.head', { min: c.minFret, max: c.maxFret }))}</span><span class="sdr-meta">${escHtml(right)}</span></div>`;
}
function pwnModeWord(st){ return t(st.cfg.mode === 'name' ? 'pwn.modeName' : st.cfg.mode === 'fret' ? 'pwn.modeFret' : 'pwn.modeBoth'); }
function pwnSetupHtml(key){
  const st = powerNames[key];
  if(!st) return '';
  const on = st.answer;
  const pill = (val, label) => `<button type="button" class="sdr-pill${on === val ? ' active' : ''}" aria-pressed="${on === val}" data-pwn-answer="${val ? 1 : 0}">${escHtml(label)}</button>`;
  return pwnHeadHtml(st, pwnModeWord(st)) +
    `<div class="sdr-body">` +
      `<div class="sdr-intro">${escHtml(t(st.cfg.mode === 'name' ? 'pwn.introName' : st.cfg.mode === 'fret' ? 'pwn.introFret' : 'pwn.introBoth'))}</div>` +
      `<div class="nc-toggles"><div class="nc-toggle"><span class="nc-toggle-label">${escHtml(t('pwn.answer'))}</span>${pill(true, t('pwn.on'))}${pill(false, t('pwn.off'))}</div></div>` +
      `<button type="button" class="sdr-start" data-pwn-start="1">&#x25B6; ${escHtml(t('pwn.start'))}</button>` +
      `<div class="sdr-best">${escHtml(t('pwn.passLine', { pass: PWN_PASS, total: PWN_ROUND }))}</div>` +
    `</div>`;
}
function pwnBoardHtml(st, card){
  const c = st.cfg;
  return fgBoardSvg(st.key, null, {
    strings: ['highE', 'B', 'G', 'D', 'A', 'lowE'],   // the whole fretboard, high string on top (Jonathan, 2026-11-11)
    hit: card.mode === 'fret',                       // a name card takes no taps on the board: the answer is a button
    hitStrings: PWN_STRINGS,
    clickFn: 'pwnTap',
    noteAt: (k, f) => card.mode === 'fret' && PWN_STRINGS.indexOf(k) >= 0 ? sdNoteAt(k, f) + '5' : '',
    shade: [c.minFret, c.maxFret]
  });
}
function pwnPlayHtml(key){
  const st = powerNames[key], card = st.cards[st.idx];
  const names = card.mode === 'name'
    ? `<div class="pwn-names" role="group" aria-label="${escAttr(t('pwn.pickAria'))}">` +
        PWN_NAMES.map(n => `<button type="button" class="pwn-name" data-pwn-pick="${escAttr(n)}">${escHtml(n)}</button>`).join('') + `</div>`
    : '';
  const prompt = card.mode === 'fret'
    ? `<div class="nc-card pwn-card"><span class="nc-kicker">${escHtml(t('pwn.findRoot'))}</span><span class="nc-note">${escHtml(card.note)}</span></div>`
    : `<div class="nc-card pwn-card"><span class="nc-kicker">${escHtml(t('pwn.whichChord'))}</span><span class="nc-str">${escHtml(t('ncp.onString', { string: ncStrName(card.str) }))}</span></div>`;
  return pwnHeadHtml(st, st.answer ? t('pwn.metaAnswer') : t('pwn.metaScored')) +
    `<div class="sdr-body pwn-play">` +
      prompt +
      `<div class="sdr-fb nc-fb pwn-fb" id="pwn-fb-${escAttr(key)}" aria-live="polite"></div>` +
      `<div class="nc-board pwn-board" id="pwn-board-${escAttr(key)}">${pwnBoardHtml(st, card)}</div>` +
      names +
      `<div class="nc-foot"><div class="fret-dots nc-dots" id="pwn-dots-${escAttr(key)}"></div>` +
        `<button type="button" class="sdr-btn2 pwn-next" id="pwn-next-${escAttr(key)}" data-pwn-next="1" hidden>${escHtml(t('pwn.next'))}</button>` +
        `<button type="button" class="sdr-btn2" data-pwn-stop="1">${escHtml(t('pwn.stop'))}</button></div>` +
    `</div>`;
}
/* One handler for the whole drill; the board's hit zones call pwnTap. */
function pwnClick(ev){
  const box = ev.currentTarget;
  const el = ev.target && ev.target.closest ? ev.target.closest('[data-pwn-start],[data-pwn-stop],[data-pwn-answer],[data-pwn-pick],[data-pwn-next],[data-pwn-again]') : null;
  if(!el || !box) return;
  const key = box.id.replace(/^pwn-/, '');
  if(el.hasAttribute('data-pwn-start') || el.hasAttribute('data-pwn-again')) pwnStart(key);
  else if(el.hasAttribute('data-pwn-stop')) pwnQuit(key);
  else if(el.hasAttribute('data-pwn-answer')) pwnSetAnswer(key, el.getAttribute('data-pwn-answer') === '1');
  else if(el.hasAttribute('data-pwn-pick')) pwnPick(key, el.getAttribute('data-pwn-pick'));
  else if(el.hasAttribute('data-pwn-next')) pwnNext(key);
}
function pwnSetAnswer(key, on){
  const st = powerNames[key];
  if(!st || st.phase === 'play') return;
  st.answer = on;
  ncSetPref('pwnAnswer', on);
  pwnRepaint(key, st.phase === 'done' ? pwnDoneHtml(key) : pwnSetupHtml(key));
}
function pwnRepaint(key, html){ const b = pwnBox(key); if(b) b.innerHTML = html; }

function pwnStart(key){
  const st = powerNames[key];
  if(!st || st.phase === 'play') return;
  pwnStopAll();                                      // one round at a time on the page
  Object.assign(st, { phase: 'play', cards: pwnDeal(st.cfg, PWN_ROUND), idx: 0, res: [], locked: false, timer: 0 });
  pwnRepaint(key, pwnPlayHtml(key));
  pwnShowCard(st);
}
/* What a new card shows on the board: a name card lights its root(s) as "?"; with
   Show answer on, the right button (name) or frets (fret) are lit too. */
function pwnMark(key, k, f, cls, text){
  const m = document.getElementById(`fgm-${key}-${k}-${f}`);
  if(!m) return;
  m.classList.add(cls);
  if(text != null){ const tx = m.querySelector('text'); if(tx) tx.textContent = text; }
}
/* Light a whole chord green: the root with the chord's name, the 5th and the
   octave as plain dots (a shape dot on the A string must not read as that
   fret's own chord). */
function pwnLightChord(key, k, f, name){
  pwnMark(key, k, f, 'pwn-lit', name);
  pwnShape(k, f).forEach(s => pwnMark(key, s.k, s.f, 'pwn-lit', ''));
}
function pwnShowCard(st){
  const key = st.key, card = st.cards[st.idx];
  st.locked = false;
  if(card.mode === 'name') card.frets.forEach(f => {
    pwnMark(key, card.str, f, 'pwn-ask', '?');
    pwnShape(card.str, f).forEach(s => pwnMark(key, s.k, s.f, 'pwn-ask', ''));
  });
  if(st.answer){
    if(card.mode === 'name'){ const b = pwnBox(key).querySelector(`[data-pwn-pick="${card.note}"]`); if(b) b.classList.add('pwn-lit'); }
    else pwnSpotsOf(st, card).forEach(s => pwnLightChord(key, s.k, s.f, card.note));
  }
  pwnPaintDots(st);
}
/* Every spot a chord name sits on in the step's range, on both strings. */
function pwnSpotsOf(st, card){ return pwnSpots(pwnPool(st.cfg.minFret, st.cfg.maxFret))[card.note] || []; }
function pwnPaintDots(st){
  const el = document.getElementById('pwn-dots-' + st.key);
  if(!el || st.answer) { if(el) el.innerHTML = ''; return; }
  el.innerHTML = st.cards.map((_, i) => {
    const r = st.res[i];
    return `<span class="fret-dot${r === 'hit' ? ' hit' : r ? ' miss' : i === st.idx ? ' cur' : ''}"></span>`;
  }).join('');
}
function pwnFeedback(st, cls, text){
  const fb = document.getElementById('pwn-fb-' + st.key);
  if(fb){ fb.className = 'sdr-fb nc-fb pwn-fb' + (cls ? ' ' + cls : ''); fb.textContent = text; }
}
/* The answer to a name card: a button was picked. */
function pwnPick(key, name){
  const st = powerNames[key];
  if(!st || st.phase !== 'play' || st.locked) return;
  const card = st.cards[st.idx];
  if(card.mode !== 'name') return;
  const right = name === card.note;
  const btn = pwnBox(key).querySelector(`[data-pwn-pick="${name}"]`);
  if(st.answer){
    if(!right){ if(btn) btn.classList.add('pwn-bad'); pwnFeedback(st, 'miss', t('pwn.fbWrongName', { pick: name })); return; }
    st.locked = true;
    pwnResolveCard(st, 'hit', null);
    return;
  }
  st.locked = true;
  if(btn) btn.classList.add(right ? 'pwn-good' : 'pwn-bad');
  pwnResolveCard(st, right ? 'hit' : 'miss', name);
}
/* The answer to a fret card: a tap on the board. */
function pwnTap(sid, k, f){
  const st = powerNames[sid];
  if(!st || st.phase !== 'play' || st.locked) return;
  const card = st.cards[st.idx];
  if(card.mode !== 'fret') return;
  const right = sdNoteAt(k, f) + '5' === card.note;
  if(st.answer){
    if(!right){ ncMark(sid, k, f, 'fg-bad'); pwnFeedback(st, 'miss', t('pwn.fbWrongFret', { pick: sdNoteAt(k, f) + '5' })); return; }
    st.locked = true;
    pwnResolveCard(st, 'hit', null);
    return;
  }
  st.locked = true;
  ncMark(sid, k, f, right ? 'fg-good' : 'fg-bad');
  pwnResolveCard(st, right ? 'hit' : 'miss', sdNoteAt(k, f) + '5', { k, f });
}
/* A card is answered: say so, light the right answer (all of them), and move on
   after a hit or wait for Next after a miss. */
function pwnResolveCard(st, res, pick, tap){
  const key = st.key, card = st.cards[st.idx];
  st.res[st.idx] = res;
  const spots = pwnSpotsOf(st, card);
  const where = spots.map(s => t('pwn.spot', { string: ncStrName(s.k), fret: s.f })).join(' / ');
  if(card.mode === 'name'){
    card.frets.forEach(f => pwnLightChord(key, card.str, f, card.note));
    const btn = pwnBox(key).querySelector(`[data-pwn-pick="${card.note}"]`); if(btn) btn.classList.add('pwn-good');
  } else {
    spots.forEach(s => { ncMark(key, s.k, s.f, 'fg-good'); pwnLightChord(key, s.k, s.f, card.note); });
  }
  if(res === 'hit') pwnFeedback(st, 'hit', st.answer ? t('pwn.fbHitAnswer', { chord: card.note }) : t('pwn.fbHit', { chord: card.note, where }));
  else pwnFeedback(st, 'miss', t(card.mode === 'name' ? 'pwn.fbMissName' : 'pwn.fbMissFret', { chord: card.note, pick: pick || '', where }));
  pwnPaintDots(st);
  if(res === 'hit') st.timer = setTimeout(() => { if(powerNames[key] === st && st.phase === 'play' && pwnBox(key)) pwnNext(key); }, st.answer ? 350 : PWN_ADVANCE_MS);
  else { const nx = document.getElementById('pwn-next-' + key); if(nx) nx.hidden = false; }
}
function pwnNext(key){
  const st = powerNames[key];
  if(!st || st.phase !== 'play') return;
  if(st.timer){ clearTimeout(st.timer); st.timer = 0; }
  if(!st.locked) return;
  st.idx++;
  if(!st.answer && st.idx >= st.cards.length){ pwnFinish(key); return; }
  if(st.answer && st.idx >= st.cards.length){ st.cards = st.cards.concat(pwnDeal(st.cfg, PWN_ROUND)); }   // the play-along never runs out
  pwnRepaint(key, pwnPlayHtml(key));
  pwnShowCard(st);
}
function pwnFinish(key){
  const st = powerNames[key];
  if(!st) return;
  if(st.timer){ clearTimeout(st.timer); st.timer = 0; }
  st.phase = 'done';
  st.hits = st.res.filter(r => r === 'hit').length;
  pwnRepaint(key, pwnDoneHtml(key));
}
function pwnDoneHtml(key){
  const st = powerNames[key];
  const hits = st.hits || 0, pass = hits >= PWN_PASS;
  const miss = [];
  st.cards.forEach((c, i) => { if(st.res[i] === 'miss') miss.push(c); });
  const SHOW = 4;
  const rows = miss.slice(0, SHOW).map(c => {
    const where = pwnSpotsOf(st, c).map(s => t('pwn.spot', { string: ncStrName(s.k), fret: s.f })).join(' / ');
    return `<div class="sdr-drill-row"><span>${escHtml(c.note)}</span><span class="sdr-meta">${escHtml(where)}</span></div>`;
  }).join('') + (miss.length > SHOW ? `<div class="sdr-drill-row"><span>${escHtml(t('pwn.moreMissed', { n: miss.length - SHOW }))}</span></div>` : '');
  const on = st.answer;
  const pill = (val, label) => `<button type="button" class="sdr-pill${on === val ? ' active' : ''}" aria-pressed="${on === val}" data-pwn-answer="${val ? 1 : 0}">${escHtml(label)}</button>`;
  return pwnHeadHtml(st, pwnModeWord(st)) +
    `<div class="sdr-body">` +
      `<div class="sdr-score">${escHtml(t('pwn.score', { n: hits, total: PWN_ROUND }))}</div>` +
      `<div class="sdr-verdict ${pass ? 'good' : 'mid'}">${escHtml(t(pass ? 'pwn.verdictPass' : 'pwn.verdictAgain', { pass: PWN_PASS, total: PWN_ROUND }))}</div>` +
      `<div class="sdr-actions"><button type="button" class="sdr-start" data-pwn-again="1">&#x25B6; ${escHtml(t('pwn.again'))}</button></div>` +
      `<div class="nc-toggles"><div class="nc-toggle"><span class="nc-toggle-label">${escHtml(t('pwn.answer'))}</span>${pill(true, t('pwn.on'))}${pill(false, t('pwn.off'))}</div></div>` +
      (rows ? `<div class="sdr-drill"><div class="sdr-drill-title">${escHtml(t('pwn.practiceThese'))}</div>${rows}</div>` : '') +
    `</div>`;
}
function pwnStop(key){
  const st = powerNames[key];
  if(!st) return;
  if(st.timer){ clearTimeout(st.timer); st.timer = 0; }
}
function pwnQuit(key){
  const st = powerNames[key];
  if(!st) return;
  pwnStop(key);
  st.phase = 'setup';
  pwnRepaint(key, pwnSetupHtml(key));
}
/* Every running round back to its setup screen: stopCardAudio and a focus-view step change call this, like ncStopAll.
   A hidden tab does not (2026-11-09): the round waits for the student. */
function pwnStopAll(){
  Object.keys(powerNames).forEach(k => { if(powerNames[k].phase === 'play') pwnQuit(k); });
}

/* ── "Keep it sharp" spaced-review card ──
   Up to 3 skills marked "I've got it!" (that have a practice panel), oldest
   last-practice first; anything already practiced today is considered sharp.
   Rendered at the top of every set's checklist. */
function reviewCandidates(){
  const out = [];
  SETS.forEach(w => (w.skills || []).forEach(s => {
    if(!s.practice || progress[s.id] !== 'gotit') return;
    if(daysSinceLastRep(s.id) === 0) return;   // practiced today — sharp
    const e = practiceLog[s.id];
    out.push({ s, w, last: (e && e.last) || 0 });
  }));
  out.sort((a, b) => a.last - b.last);
  return out.slice(0, 3);
}
function reviewCardHtml(){
  const cands = reviewCandidates();
  if(!cands.length) return '';
  const items = cands.map(c => {
    const last = lastPracticedLabel(c.s.id);
    return `<div class="review-item">
      <div class="review-item-main">
        <div class="review-item-text">${tf(c.s,'text')}</div>
        <div class="review-item-when" data-i18n="${last.key}"${last.params ? ` data-i18n-params='${escAttr(JSON.stringify(last.params))}'` : ''}>${t(last.key, last.params)}</div>
      </div>
      <button type="button" class="review-go-btn" onclick="reviewJump('${c.s.id}','${c.w.id}')">&#x21BB; <span data-i18n="review.practiceAgain">${t('review.practiceAgain')}</span></button>
    </div>`;
  }).join('');
  return `<div class="review-card">
    <div class="review-head"><span aria-hidden="true">&#x2726;</span><span data-i18n="review.title">${t('review.title')}</span></div>
    <div class="review-explainer" data-i18n="review.explainer">${t('review.explainer')}</div>
    <div class="review-items">${items}</div>
    <button type="button" class="review-sr-link" onclick="goExploreHash('my-progress')"><span data-i18n="sr.title">${t('sr.title')}</span> &rarr;</button>
  </div>`;
}
function refreshReviewCards(){
  const html = reviewCardHtml();
  document.querySelectorAll('.review-slot').forEach(el => {
    el.innerHTML = html;
    if(typeof applyI18n === 'function') applyI18n(el);
  });
}
/* "Practice again" → jump to that skill's row and open its practice panel.
   Review cards can point cross-module (Search / Songs hub load every module's
   data into SETS without rendering its panels), so activate the target module
   first — same pattern as searchGoSkill/jumpToStep — or activateSet lands on
   a panel that was never built and the lesson area goes blank. */
async function reviewJump(sid, wid){
  const w = SETS.find(x => x.id === wid);
  if(!w) return;
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(w.moduleNum);
  await onModuleChange(w.moduleNum, wid);
  saveProgress();
  activateSet(wid);
  switchTabById(wid, 'checklist', true);
  const row = document.querySelector(`.week-panel[data-id="${wid}"] .skill-row[data-sid="${CSS.escape(sid)}"]`);
  if(!row) return;
  const btn = row.querySelector('.sk-practice-btn');
  const panel = document.getElementById('pp-' + sid);
  if(btn && panel && panel.hasAttribute('hidden')) togglePracticePanel(sid, btn);
  setTimeout(()=>{
    row.scrollIntoView({ behavior: scrollBehavior(), block:'center' });
    flashClass(row, 'review-flash', 1800);
    // Keyboard path: closing the Daily Review page bounced focus back to the
    // rail button (mpClosePanel) — move it to the row we just jumped to.
    row.setAttribute('tabindex','-1');
    row.focus({ preventScroll:true });
  }, 60);
}

