/* ════════════════════════════════════════════════════════════════════
   Guitar Class — LIVE QUIZ  (the Kahoot-style whole-class game)

   One shared game at a time: the teacher drives it from ?teacher=true on
   the projector, every student answers on their own Chromebook, and the
   class's answers land on the projected screen as they come in.

   ── Why it lives in one file ──
   Student side and teacher side are two halves of one protocol; splitting
   them across app.js and teacher.js would put the wire format in two
   places. Loaded as a plain <script defer> AFTER teacher.js on index.html.

   ── It also loads on the Song Journey pages ──
   tabs/*.html get this file too, for the "a game is running" banner — a
   student parked on a Journey page would otherwise miss the whole quiz in
   silence. Those pages have no app.js, so nothing here may DEPEND on app.js:
   the Firestore handle comes from lqEnsureDb(), the uid from lqUid(), and
   every render path early-returns when the game UI isn't on the page
   (lqCanPlayHere). What it does use is available on both: t()/applyI18n from
   i18n.js, and the `firebase` compat global. Where a helper is app.js-only
   (escHtml, goExploreHash) the call is either behind lqCanPlayHere() or has
   a fallback. Keeping ONE definition of "a game is live" was the point —
   the alternative was copying the staleness rules into journey.js to drift.

   ── The wire format (Firestore) ──
     liveQuiz/current                one doc, the whole game state.
                                     Teacher writes; every signed-in
                                     student reads (onSnapshot).
       sessionId   'lq-<base36>-<rand>' — a NEW id every game. Both sides
                   ignore anything stamped with a different id, so a stale
                   answer doc from last period can never score.
       quizId      key into LIVE_QUIZZES below
       state       'lobby' | 'question' | 'reveal' | 'ended' | 'off'
       qIndex      round number, 0-based (-1 while in the lobby)
       correct     the choice id, written ONLY at reveal
       tally       {choiceId: count}, written only at reveal
       scores      {uid: {name, pts, right, answered, last, lastRight}}
       speedBonus  false ⇒ every correct answer is worth the same
       limitSec    0 ⇒ no countdown

     liveQuiz/current/answers/{uid}  one doc per student, overwritten each
                                     round. Students write only their own;
                                     only the teacher can read them, so a
                                     student cannot see what anyone else
                                     picked. See firestore.rules.

   ── Who decides what is correct ──
   The teacher does, at reveal time, by clicking the right choice on the
   dashboard. There is no answer key in this file, and that is deliberate:
   the dashboard is on the classroom projector, so anything the app knew in
   advance would either have to be hidden from the room or would spoil the
   round. It also fits the first quiz exactly — Jonathan plays a string and
   only he knows which one until he says so.
   ════════════════════════════════════════════════════════════════════ */

/* ── The quiz bank ──
   `choices` order is fixed and shown as-is (no shuffle): for "which string
   did you hear" the low-to-high order IS the mental model we're teaching,
   so scrambling it would work against the lesson. Labels are i18n keys, not
   text — tools/checks.mjs walks this object and fails the push if one of
   them is missing from i18n.js (the same enumerate-the-real-source trick it
   already uses for DECKS and EAR_POOLS).
   `speedBonus:false` because the teacher plays the note AFTER the question
   opens, sometimes more than once — scoring by reaction time would just
   punish whoever waited to hear it properly. */
const LIVE_QUIZZES = {
  'string-id': {
    id: 'string-id',
    titleKey:  'lq.title.stringId',
    promptKey: 'lq.prompt.stringId',
    teacherHint: 'Play one open string, then click which one it was to reveal.',
    speedBonus: false,
    limitSec: 0,
    choices: [
      { id:'E6', key:'lq.string.lowE',  color:'#b3372a' },
      { id:'A',  key:'lq.string.a',     color:'#a2530b' },
      { id:'D',  key:'lq.string.d',     color:'#3b6d11' },
      { id:'G',  key:'lq.string.g',     color:'#185fa5' },
      { id:'B',  key:'lq.string.b',     color:'#5b3f96' },
      { id:'e1', key:'lq.string.highE', color:'#0f6b64' }
    ]
  }
};
const LQ_DEFAULT_QUIZ = 'string-id';
function lqQuiz(id){ return LIVE_QUIZZES[id] || LIVE_QUIZZES[LQ_DEFAULT_QUIZ]; }
function lqChoice(quiz, id){ return quiz.choices.find(c=>c.id===id) || null; }
function lqDoc(){ return lqDb.collection('liveQuiz').doc('current'); }

/* ── Firestore, from whichever page we're on ──
   index.html has app.js's ensureDb(); a Song Journey page (tabs/*.html) has
   no app.js at all but has already loaded the SDK itself before it calls
   lqStartListening(). Resolving whatever is actually present — rather than
   assuming app.js — is what lets the same listener, and the same one
   definition of "a game is live", run on both. */
let lqDb = null;
async function lqEnsureDb(){
  if(lqDb) return lqDb;
  if(typeof ensureDb === 'function') lqDb = await ensureDb();
  else if(typeof firebase !== 'undefined' && firebase.firestore) lqDb = firebase.firestore();
  return lqDb;
}
/* True only where the full game UI exists (index.html). A Song Journey page
   loads this file for the "a game is running" banner and nothing else: it
   can't show a question, so it must not announce the student into the lobby
   or auto-open anything — they'd be counted as playing from a page they
   cannot answer on. Tapping the banner takes them somewhere they can. */
function lqCanPlayHere(){ return !!document.getElementById('live-quiz-body'); }
// The signed-in uid / display name, or '' where there is no app.js to hold
// one. Capped: it goes onto a doc the whole class's leaderboard reads.
function lqUid(){ return (typeof currentUser !== 'undefined' && currentUser) ? currentUser.uid : ''; }
function lqName(){
  if(typeof currentUser === 'undefined' || !currentUser) return '';
  return String(currentUser.displayName || currentUser.email || '').slice(0, 60);
}
// index.html, resolved against THIS script's own URL — so the banner's link
// is right whether the host page is at the root or inside tabs/.
const LQ_HOME_URL = (function(){
  try { return new URL('index.html', document.currentScript ? document.currentScript.src : location.href).href + '#live-quiz'; }
  catch(e){ return 'index.html#live-quiz'; }
})();

/* A game nobody ended keeps showing forever otherwise — a student opening
   the site that evening would find a live quiz waiting. Both sides treat a
   session past these ages as no session at all; nothing is written, so the
   teacher can still see (and formally close) it on the dashboard. */
const LQ_MAX_AGE_MS   = 3 * 60 * 60 * 1000;   // an unfinished game
const LQ_ENDED_MAX_MS = 2 * 60 * 60 * 1000;   // a finished game's final board
function lqTsMs(ts){
  try { return (ts && typeof ts.toMillis === 'function') ? ts.toMillis() : 0; }
  catch(e){ return 0; }
}
// A serverTimestamp() reads back as null on the writer's own optimistic
// snapshot, so "no timestamp yet" must mean "brand new", never "ancient".
function lqSessionIsLive(s){
  if(!s || !s.sessionId || !s.state || s.state === 'off') return false;
  const started = lqTsMs(s.startedAt);
  if(s.state === 'ended'){
    const ended = lqTsMs(s.endedAt) || started;
    return !ended || (Date.now() - ended) < LQ_ENDED_MAX_MS;
  }
  return !started || (Date.now() - started) < LQ_MAX_AGE_MS;
}

/* Points. With speedBonus off (the default, and the only quiz so far) every
   correct answer is 1000 — no reaction-time race. With it on, 1000 for an
   instant answer sliding to 500 at the buzzer, which is roughly Kahoot's
   curve and keeps a late-but-right answer clearly worth having. */
const LQ_MAX_POINTS = 1000;
function lqPoints(ms, s){
  if(!s || !s.speedBonus) return LQ_MAX_POINTS;
  const limit = (Number(s.limitSec) || 20) * 1000;
  // `Number(ms) || limit` would be wrong here: an answer at ms 0 is the
  // FASTEST possible one, and || would score it as the slowest.
  const raw = Number(ms);
  const m = Number.isFinite(raw) ? Math.max(0, Math.min(limit, raw)) : limit;
  return Math.round(LQ_MAX_POINTS * (1 - 0.5 * (m / limit)));
}
// uid → rank, highest points first. Ties share the lower rank number, the
// way a scoreboard reads out loud ("two of you tied for second").
function lqRanked(scores){
  const rows = Object.keys(scores || {}).map(uid => ({ uid, ...scores[uid] }));
  rows.sort((a,b)=> (b.pts||0) - (a.pts||0) || String(a.name||'').localeCompare(String(b.name||'')));
  let rank = 0, lastPts = null;
  rows.forEach((r,i)=>{ if(r.pts !== lastPts){ rank = i + 1; lastPts = r.pts; } r.rank = rank; });
  return rows;
}

/* ══════════════════════════════════════════════════════════════
   STUDENT SIDE
   ══════════════════════════════════════════════════════════════ */
let lqSession   = null;   // last snapshot of liveQuiz/current
let lqUnsub     = null;   // the student's session listener
let lqMyAnswer  = null;   // {qIndex, choice} — this round's locked-in pick
let lqJoinedId  = null;   // sessionId we've already announced ourselves for
let lqQOpenedAt = 0;      // performance.now() when THIS round opened locally
let lqSendError = false;
let lqTick      = null;   // countdown interval, only while limitSec > 0

/* One listener per signed-in student, opened at sign-in and left open. The
   doc changes a handful of times per game and not at all the rest of the
   week, so this is a few reads a day, not a poll. */
function lqStartListening(){
  if(lqUnsub) return;
  if(typeof IS_TEACHER_MODE !== 'undefined' && IS_TEACHER_MODE) return;   // the dashboard has its own listeners
  lqEnsureDb().then(()=>{
    if(!lqDb || lqUnsub) return;
    lqUnsub = lqDoc().onSnapshot(
      snap => lqOnSession(snap.exists ? (snap.data() || null) : null),
      err  => { console.warn('[live-quiz] session listener stopped', err); }
    );
  }).catch(()=>{ /* offline or blocked — the rest of the site is unaffected */ });
}
function lqStopListening(){
  if(lqUnsub){ try{ lqUnsub(); }catch(e){} lqUnsub = null; }
  lqSession = null; lqMyAnswer = null; lqJoinedId = null;
  lqStopTick();
  lqSyncNav(); lqSyncBanner();
}

function lqOnSession(data){
  const prev = lqSession;
  lqSession = data;
  const live = lqSessionIsLive(data) ? data : null;
  // A new game (or a new round) clears last round's pick and restarts the
  // student's own clock — never trust the server timestamp for this, a
  // student on slow wifi would be scored for their neighbour's connection.
  if(!live || !prev || prev.sessionId !== live.sessionId){ lqMyAnswer = null; lqJoinedId = null; }
  if(live && live.state === 'question' && (!prev || prev.sessionId !== live.sessionId || prev.qIndex !== live.qIndex)){
    lqMyAnswer = null; lqSendError = false; lqQOpenedAt = performance.now();
  }
  lqSyncNav();
  lqSyncBanner();
  lqRenderStudent();
  lqSyncTick();
  if(live && (live.state === 'lobby' || live.state === 'question')) lqAnnouncePresence(live);
  lqMaybeAutoOpen(live);
}

/* Puts the student in the teacher's lobby list without them having to do
   anything — walking in and opening the site IS joining. One write per
   student per game. */
function lqAnnouncePresence(s){
  if(s.state !== 'lobby') return;              // mid-game arrivals join by answering
  if(lqJoinedId === s.sessionId) return;
  if(!lqCanPlayHere() || !lqUid()) return;
  if(typeof isDevBypassUser === 'function' && isDevBypassUser()) return;
  lqJoinedId = s.sessionId;
  lqWriteAnswer(s, -1, null, 0).catch(()=>{ lqJoinedId = null; });
}

function lqWriteAnswer(s, qIndex, choice, ms){
  return lqEnsureDb().then(()=>{
    if(!lqDb) throw new Error('no db');
    return lqDoc().collection('answers').doc(lqUid()).set({
      uid: lqUid(),
      name: lqName(),
      sessionId: s.sessionId,
      qIndex: qIndex,
      choice: choice,
      ms: ms,
      at: firebase.firestore.FieldValue.serverTimestamp()
    });
  });
}

/* The classic Kahoot moment: the game starts and the screen is just there.
   Once per session only (remembered per tab) — a student who closes it is
   closing it, not asking to be thrown back in every few seconds. */
function lqMaybeAutoOpen(live){
  if(!live || (live.state !== 'lobby' && live.state !== 'question')) return;
  if(!lqCanPlayHere() || document.hidden) return;
  const appEl = document.getElementById('app');
  if(!appEl || appEl.style.display === 'none') return;
  let seen = null;
  try { seen = sessionStorage.getItem('lq-autoopened'); } catch(e){}
  if(seen === live.sessionId) return;
  try { sessionStorage.setItem('lq-autoopened', live.sessionId); } catch(e){}
  const screen = document.getElementById('live-quiz-screen');
  if(screen && screen.hasAttribute('hidden')) goExploreHash('live-quiz');
}

/* ── The rail item and the "join" banner ──
   Both exist only while a game is on. The banner is how a student who
   closed the screen (or arrived late) gets back in with one tap. */
function lqSyncNav(){
  const btn = document.getElementById('live-quiz-btn');
  if(btn) btn.style.display = lqSessionIsLive(lqSession) ? '' : 'none';
}
function lqSyncBanner(){
  const live = lqSessionIsLive(lqSession) ? lqSession : null;
  const screen = document.getElementById('live-quiz-screen');
  const onScreen = screen && !screen.hasAttribute('hidden');
  const show = !!live && !onScreen && live.state !== 'ended';
  let el = document.getElementById('lq-banner');
  if(!show){ if(el) el.remove(); return; }
  if(el) return;
  // Built as nodes rather than innerHTML: this is the one piece that also
  // runs on the Song Journey pages, which have no escHtml() of their own.
  // data-i18n is still set on both text nodes so a language switch
  // re-translates the banner in place, same as everywhere else.
  el = document.createElement('div');
  el.id = 'lq-banner';
  el.className = 'lq-banner';
  const dot = document.createElement('span');
  dot.className = 'lq-banner-dot';
  dot.setAttribute('aria-hidden', 'true');
  const txt = document.createElement('span');
  txt.className = 'lq-banner-txt';
  txt.setAttribute('data-i18n', 'lq.bannerTitle');
  txt.textContent = t('lq.bannerTitle');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'lq-banner-btn';
  btn.setAttribute('data-i18n', 'lq.bannerJoin');
  btn.textContent = t('lq.bannerJoin');
  btn.addEventListener('click', lqOpenFromBanner);
  el.append(dot, txt, btn);
  document.body.appendChild(el);
  if(typeof applyI18n === 'function') applyI18n(el);
}
/* On index.html this opens the overlay in place. Anywhere else — a Song
   Journey page — there is no overlay to open, so it navigates to the one
   that has it. */
function lqOpenFromBanner(){
  if(lqCanPlayHere() && typeof goExploreHash === 'function') goExploreHash('live-quiz');
  else location.href = LQ_HOME_URL;
}

/* ── The student screen (an overlay, like the Games arcade) ── */
function toggleLiveQuiz(){
  const screen = document.getElementById('live-quiz-screen');
  if(!screen) return;
  if(screen.hasAttribute('hidden')) goExploreHash('live-quiz');
  else closeLiveQuizScreen();
}
function openLiveQuizScreen(){
  const screen = document.getElementById('live-quiz-screen');
  if(!screen || !screen.hasAttribute('hidden')) return;
  closeTopPanels('live-quiz');
  screen.removeAttribute('hidden');
  syncExploreNav();
  lqSyncBanner();
  lqRenderStudent();
  lqSyncTick();
  const exit = screen.querySelector('.games-exit');
  if(exit) exit.focus();
}
function closeLiveQuizScreen(){
  if(location.hash === '#live-quiz'){ exitExploreHash(); return; }   // the router finishes the job
  lqClosePanel();
}
function lqClosePanel(){
  const screen = document.getElementById('live-quiz-screen');
  const wasOpen = screen && !screen.hasAttribute('hidden');
  if(screen) screen.setAttribute('hidden', '');
  const btn = document.getElementById('live-quiz-btn');
  if(btn && wasOpen && btn.style.display !== 'none') btn.focus();
  syncExploreNav();
  lqSyncBanner();
  lqSyncTick();
}

function lqRenderStudent(){
  const body = document.getElementById('live-quiz-body');
  if(!body) return;
  const s = lqSessionIsLive(lqSession) ? lqSession : null;
  if(!s){
    body.innerHTML = `<div class="lq-empty"><div class="lq-empty-title" data-i18n="lq.noneTitle">${escHtml(t('lq.noneTitle'))}</div>`
      + `<p data-i18n="lq.noneBody">${escHtml(t('lq.noneBody'))}</p></div>`;
    if(typeof applyI18n === 'function') applyI18n(body);
    return;
  }
  const quiz = lqQuiz(s.quizId);
  const title = `<div class="lq-quiz-title" data-i18n="${escAttr(quiz.titleKey)}">${escHtml(t(quiz.titleKey))}</div>`;
  let html;
  if(s.state === 'lobby')        html = title + lqStudentLobbyHtml();
  else if(s.state === 'question') html = title + lqStudentQuestionHtml(s, quiz);
  else if(s.state === 'reveal')   html = title + lqStudentRevealHtml(s, quiz);
  else                            html = title + lqStudentEndedHtml(s);
  body.innerHTML = html;
  if(typeof applyI18n === 'function') applyI18n(body);
}

function lqStudentLobbyHtml(){
  const dev = (typeof isDevBypassUser === 'function' && isDevBypassUser())
    ? `<p class="lq-note" data-i18n="lq.devBypass">${escHtml(t('lq.devBypass'))}</p>` : '';
  return `<div class="lq-wait"><div class="lq-pulse" aria-hidden="true"><span></span><span></span><span></span></div>`
    + `<div class="lq-wait-txt" data-i18n="lq.waiting">${escHtml(t('lq.waiting'))}</div>${dev}</div>`;
}

function lqStudentQuestionHtml(s, quiz){
  const n = Number(s.qIndex) + 1;
  const head = `<div class="lq-qnum" data-i18n="lq.qLabel" data-i18n-params="${escAttr(JSON.stringify({n}))}">${escHtml(t('lq.qLabel',{n}))}</div>`
    + `<div class="lq-prompt" data-i18n="${escAttr(quiz.promptKey)}">${escHtml(t(quiz.promptKey))}</div>`
    + lqTimerHtml(s);
  const mine = (lqMyAnswer && lqMyAnswer.qIndex === s.qIndex) ? lqMyAnswer.choice : null;
  if(mine){
    const c = lqChoice(quiz, mine);
    const err = lqSendError ? `<p class="lq-note lq-note-bad" data-i18n="lq.saveFailed">${escHtml(t('lq.saveFailed'))}</p>` : '';
    return head + `<div class="lq-locked"><div class="lq-locked-lbl" data-i18n="lq.locked">${escHtml(t('lq.locked'))}</div>`
      + `<div class="lq-locked-pick" style="background:${c ? c.color : '#555'}">${escHtml(c ? t(c.key) : mine)}</div>`
      + `<div class="lq-locked-wait" data-i18n="lq.lockedWait">${escHtml(t('lq.lockedWait'))}</div>${err}</div>`;
  }
  const btns = quiz.choices.map(c =>
    `<button type="button" class="lq-choice" style="--lq-c:${c.color}" onclick="lqAnswer('${c.id}')">`
    + `<span data-i18n="${escAttr(c.key)}">${escHtml(t(c.key))}</span></button>`).join('');
  return head + `<div class="lq-choices">${btns}</div>`;
}

function lqStudentRevealHtml(s, quiz){
  const correct = lqChoice(quiz, s.correct);
  const mine = (lqMyAnswer && lqMyAnswer.qIndex === s.qIndex) ? lqMyAnswer.choice : null;
  const me = (s.scores || {})[lqUid()] || null;
  let verdict;
  if(!mine){
    verdict = `<div class="lq-verdict lq-v-none" data-i18n="lq.noAnswer">${escHtml(t('lq.noAnswer'))}</div>`;
  } else if(mine === s.correct){
    const pts = me && me.last ? me.last : LQ_MAX_POINTS;
    verdict = `<div class="lq-verdict lq-v-yes"><span data-i18n="lq.correct">${escHtml(t('lq.correct'))}</span>`
      + ` <span class="lq-plus">+${escHtml(String(pts))}</span></div>`;
  } else {
    verdict = `<div class="lq-verdict lq-v-no" data-i18n="lq.wrong">${escHtml(t('lq.wrong'))}</div>`;
  }
  const answer = correct
    ? `<div class="lq-answer" data-i18n="lq.answerIs" data-i18n-params="${escAttr(JSON.stringify({answer:t(correct.key)}))}">${escHtml(t('lq.answerIs',{answer:t(correct.key)}))}</div>`
    : '';
  return verdict + answer + lqTallyHtml(s, quiz, mine) + lqScoreLineHtml(s);
}

function lqStudentEndedHtml(s){
  const rows = lqRanked(s.scores);
  const me = rows.find(r => r.uid && r.uid === lqUid()) || null;
  const top = rows.slice(0, 5).map(r =>
    `<li class="lq-lb-row${me && r.uid === me.uid ? ' me' : ''}"><span class="lq-lb-rank">${r.rank}</span>`
    + `<span class="lq-lb-name">${escHtml(r.name || '—')}</span>`
    + `<span class="lq-lb-pts">${escHtml(String(r.pts || 0))}</span></li>`).join('');
  const mine = me
    ? `<div class="lq-final-me"><div class="lq-final-rank" data-i18n="lq.rank" data-i18n-params="${escAttr(JSON.stringify({n:me.rank,total:rows.length}))}">${escHtml(t('lq.rank',{n:me.rank,total:rows.length}))}</div>`
      + `<div class="lq-final-pts" data-i18n="lq.points" data-i18n-params="${escAttr(JSON.stringify({n:me.pts||0}))}">${escHtml(t('lq.points',{n:me.pts||0}))}</div></div>`
    : '';
  return `<div class="lq-final"><div class="lq-final-title" data-i18n="lq.finalTitle">${escHtml(t('lq.finalTitle'))}</div>`
    + mine + `<ol class="lq-lb">${top}</ol></div>`;
}

// The class's answer spread, correct bar in green. Same builder both sides;
// `mine` marks the student's own pick and is null on the projector.
function lqTallyHtml(s, quiz, mine){
  const tally = s.tally || {};
  const total = quiz.choices.reduce((n,c)=> n + (Number(tally[c.id]) || 0), 0);
  const bars = quiz.choices.map(c => {
    const n = Number(tally[c.id]) || 0;
    const pct = total ? Math.round(n / total * 100) : 0;
    const cls = 'lq-bar' + (c.id === s.correct ? ' right' : '') + (mine && c.id === mine ? ' mine' : '');
    return `<div class="${cls}"><span class="lq-bar-lbl" data-i18n="${escAttr(c.key)}">${escHtml(t(c.key))}</span>`
      + `<span class="lq-bar-track"><span class="lq-bar-fill" style="width:${pct}%;background:${c.color}"></span></span>`
      + `<span class="lq-bar-n">${n}</span></div>`;
  }).join('');
  return `<div class="lq-tally">${bars}</div>`;
}

function lqScoreLineHtml(s){
  const rows = lqRanked(s.scores);
  const me = rows.find(r => r.uid && r.uid === lqUid());
  if(!me) return '';
  return `<div class="lq-scoreline"><span data-i18n="lq.points" data-i18n-params="${escAttr(JSON.stringify({n:me.pts||0}))}">${escHtml(t('lq.points',{n:me.pts||0}))}</span>`
    + ` · <span data-i18n="lq.rank" data-i18n-params="${escAttr(JSON.stringify({n:me.rank,total:rows.length}))}">${escHtml(t('lq.rank',{n:me.rank,total:rows.length}))}</span></div>`;
}

function lqTimerHtml(s){
  if(!Number(s.limitSec)) return '';
  return `<div class="lq-timer" id="lq-timer" aria-live="off">${escHtml(String(s.limitSec))}</div>`;
}

/* One shared 250ms tick, running only while a countdown is actually on
   screen — nothing ticks during the (default) untimed quiz. */
function lqSyncTick(){
  const s = lqSessionIsLive(lqSession) ? lqSession : null;
  const need = !!(s && s.state === 'question' && Number(s.limitSec) && document.getElementById('lq-timer'));
  if(need && !lqTick) lqTick = setInterval(lqUpdateTimer, 250);
  if(!need) lqStopTick();
  if(need) lqUpdateTimer();
}
function lqStopTick(){ if(lqTick){ clearInterval(lqTick); lqTick = null; } }
function lqSecsLeft(s){
  const limit = Number(s.limitSec) || 0;
  if(!limit) return null;
  const gone = (performance.now() - lqQOpenedAt) / 1000;
  return Math.max(0, Math.ceil(limit - gone));
}
function lqUpdateTimer(){
  const el = document.getElementById('lq-timer');
  const s = lqSessionIsLive(lqSession) ? lqSession : null;
  if(!el || !s){ lqStopTick(); return; }
  const left = lqSecsLeft(s);
  el.textContent = left === 0 ? t('lq.timeUp') : String(left);
  el.classList.toggle('out', left === 0);
  if(left === 0){
    document.querySelectorAll('#live-quiz-body .lq-choice').forEach(b=>{ b.disabled = true; });
    lqStopTick();
  }
}

/* First tap wins — no changing your mind, same as Kahoot. Painted
   immediately and rolled back only if the write actually fails, so a
   Chromebook on slow wifi still feels instant. */
function lqAnswer(choiceId){
  const s = lqSessionIsLive(lqSession) ? lqSession : null;
  if(!s || s.state !== 'question') return;
  if(lqMyAnswer && lqMyAnswer.qIndex === s.qIndex) return;
  if(Number(s.limitSec) && lqSecsLeft(s) === 0) return;
  if(!lqUid()) return;
  if(typeof isDevBypassUser === 'function' && isDevBypassUser()){
    lqSendError = false; lqMyAnswer = { qIndex: s.qIndex, choice: choiceId };
    lqRenderStudent(); return;
  }
  const ms = lqQOpenedAt ? Math.max(0, Math.round(performance.now() - lqQOpenedAt)) : 0;
  const qIndex = s.qIndex;
  lqSendError = false;
  lqMyAnswer = { qIndex, choice: choiceId };
  lqRenderStudent();
  lqWriteAnswer(s, qIndex, choiceId, ms).catch(e => {
    console.warn('[live-quiz] answer did not send', e);
    if(lqMyAnswer && lqMyAnswer.qIndex === qIndex && lqMyAnswer.choice === choiceId){
      lqMyAnswer = null; lqSendError = true; lqRenderStudent();
    }
  });
}

// The screen is built once per state change, so a language switch has to
// rebuild it — same reasoning as data-i18n-params everywhere else.
window.addEventListener('gc-langchange', ()=>{ lqRenderStudent(); lqSyncBanner(); if(typeof teacherView !== 'undefined' && teacherView === 'livequiz') renderTeacherLiveQuiz(); });

/* ══════════════════════════════════════════════════════════════
   TEACHER SIDE — the projected screen plus a small control strip

   Everything here is on the classroom projector, so nothing may show what
   the answer is before the reveal: during a question the stage shows only
   how many students have answered, and the control strip's six buttons are
   just the plain choice names, which give nothing away.
   ══════════════════════════════════════════════════════════════ */
let lqTSession = null;      // teacher's copy of liveQuiz/current
let lqTAnswers = [];        // every answer doc, filtered by sessionId at use
let lqTUnsubDoc = null, lqTUnsubAns = null;
let lqTScoring = 'flat';    // 'flat' | 'speed' — picked before Start
let lqTBusy = false;        // one write at a time; the buttons gate on it

function renderTeacherLiveQuiz(){
  const box = document.getElementById('t-grid-container');
  if(!box) return;
  // Stable shell: only the two inner regions are repainted on each snapshot,
  // so a stage put into fullscreen for the projector survives every update.
  if(!document.getElementById('lq-shell')){
    box.innerHTML = `<div class="lq-shell" id="lq-shell">`
      + `<div class="lq-stage" id="lq-stage"></div>`
      + `<div class="lq-controls" id="lq-controls"></div></div>`;
  }
  lqTeacherListen();
  lqPaintStage();
  lqPaintControls();
}

function lqTeacherListen(){
  if(lqTUnsubDoc) return;
  lqEnsureDb().then(()=>{
    if(!lqDb || lqTUnsubDoc) return;
    lqTUnsubDoc = lqDoc().onSnapshot(snap => {
      lqTSession = snap.exists ? (snap.data() || null) : null;
      if(teacherView === 'livequiz'){ lqPaintStage(); lqPaintControls(); }
    }, e => console.warn('[live-quiz] teacher session listener stopped', e));
    lqTUnsubAns = lqDoc().collection('answers').onSnapshot(snap => {
      lqTAnswers = snap.docs.map(d => d.data() || {});
      if(teacherView === 'livequiz'){ lqPaintStage(); lqPaintControls(); }
    }, e => console.warn('[live-quiz] teacher answers listener stopped', e));
  }).catch(()=>{});
}

// Answers belonging to the running game only — a doc left over from an
// earlier period carries that game's sessionId and is ignored, never scored.
function lqRoundAnswers(s, qIndex){
  if(!s) return [];
  return lqTAnswers.filter(a => a && a.sessionId === s.sessionId && a.qIndex === qIndex);
}
function lqRoster(s){
  if(!s) return [];
  const seen = new Map();
  lqTAnswers.forEach(a => { if(a && a.sessionId === s.sessionId && a.uid) seen.set(a.uid, a.name || ''); });
  Object.keys(s.scores || {}).forEach(uid => { if(!seen.has(uid)) seen.set(uid, (s.scores[uid] || {}).name || ''); });
  return [...seen.entries()].map(([uid, name]) => ({ uid, name }));
}

/* ── The stage (what the class sees) ── */
function lqPaintStage(){
  const stage = document.getElementById('lq-stage');
  if(!stage) return;
  const s = lqTSession;
  if(!s || !s.state || s.state === 'off'){
    stage.innerHTML = `<div class="lq-st-idle"><div class="lq-st-idle-title">Live quiz</div>`
      + `<div class="lq-st-idle-sub">Nothing running. Pick a quiz below and press Start.</div></div>`;
    return;
  }
  const quiz = lqQuiz(s.quizId);
  if(s.state === 'lobby')        stage.innerHTML = lqStageLobbyHtml(s, quiz);
  else if(s.state === 'question') stage.innerHTML = lqStageQuestionHtml(s, quiz);
  else if(s.state === 'reveal')   stage.innerHTML = lqStageRevealHtml(s, quiz);
  else                            stage.innerHTML = lqStageEndedHtml(s);
}

// Both languages side by side on the projector: every student reads the
// prompt on their own device in their own language, but the room reads it
// off the wall together.
function lqBilingual(key, cls){
  const en = tIn(key, 'en'), es = tIn(key, 'es');
  return `<div class="${cls}">${escHtml(en)}</div>`
    + (es && es !== en ? `<div class="${cls}-es" lang="es">${escHtml(es)}</div>` : '');
}

function lqStageLobbyHtml(s, quiz){
  const here = lqRoster(s);
  const chips = here.map(r => `<span class="lq-chip">${escHtml(r.name || '—')}</span>`).join('');
  return lqBilingual(quiz.titleKey, 'lq-st-title')
    + `<div class="lq-st-join">Open the site &rarr; <strong>Live quiz</strong></div>`
    + `<div class="lq-st-count"><span class="lq-st-big">${here.length}</span><span class="lq-st-cap">in the game</span></div>`
    + `<div class="lq-chips">${chips}</div>`;
}

function lqStageQuestionHtml(s, quiz){
  const n = Number(s.qIndex) + 1;
  const inCount = lqRoundAnswers(s, s.qIndex).length;
  const roster = lqRoster(s).length;
  const timer = Number(s.limitSec)
    ? `<div class="lq-st-timer" id="lq-st-timer">${escHtml(String(s.limitSec))}</div>` : '';
  return `<div class="lq-st-qnum">Question ${n}</div>`
    + lqBilingual(quiz.promptKey, 'lq-st-prompt')
    + timer
    + `<div class="lq-st-count"><span class="lq-st-big">${inCount}${roster ? ' / ' + roster : ''}</span>`
    + `<span class="lq-st-cap">answered</span></div>`;
}

function lqStageRevealHtml(s, quiz){
  const c = lqChoice(quiz, s.correct);
  const answer = c ? lqBilingual(c.key, 'lq-st-answer') : '';
  const board = lqRanked(s.scores).slice(0, 5).map(r =>
    `<li><span class="lq-lb-rank">${r.rank}</span><span class="lq-lb-name">${escHtml(r.name || '—')}</span>`
    + `<span class="lq-lb-pts">${escHtml(String(r.pts || 0))}</span></li>`).join('');
  return `<div class="lq-st-qnum">Question ${Number(s.qIndex) + 1} &mdash; the answer</div>`
    + answer
    + `<div class="lq-st-split">${lqTallyHtml(s, quiz, null)}<ol class="lq-lb lq-lb-stage">${board}</ol></div>`;
}

function lqStageEndedHtml(s){
  const rows = lqRanked(s.scores);
  const board = rows.slice(0, 10).map(r =>
    `<li><span class="lq-lb-rank">${r.rank}</span><span class="lq-lb-name">${escHtml(r.name || '—')}</span>`
    + `<span class="lq-lb-pts">${escHtml(String(r.pts || 0))}</span></li>`).join('');
  return `<div class="lq-st-title">Final scores</div><ol class="lq-lb lq-lb-stage">${board}</ol>`;
}

/* ── The control strip (what Jonathan drives it with) ── */
function lqPaintControls(){
  const el = document.getElementById('lq-controls');
  if(!el) return;
  const s = lqTSession;
  const busy = lqTBusy ? ' disabled' : '';
  const full = `<button type="button" class="lq-ctl ghost" onclick="lqToggleFullscreen()">Full screen</button>`;
  if(!s || !s.state || s.state === 'off' || s.state === 'ended'){
    const opts = Object.keys(LIVE_QUIZZES).map(id =>
      `<option value="${escAttr(id)}">${escHtml(tIn(LIVE_QUIZZES[id].titleKey, 'en'))}</option>`).join('');
    const scoring = `<label class="lq-ctl-lbl">Scoring
      <select id="lq-scoring" onchange="lqTScoring=this.value">
        <option value="flat"${lqTScoring === 'flat' ? ' selected' : ''}>Every correct answer = 1000</option>
        <option value="speed"${lqTScoring === 'speed' ? ' selected' : ''}>Faster = more points (20s)</option>
      </select></label>`;
    const closeBtn = (s && s.state === 'ended')
      ? `<button type="button" class="lq-ctl ghost" onclick="lqTeacherClose()"${busy}>Clear the board</button>` : '';
    el.innerHTML = `<label class="lq-ctl-lbl">Quiz <select id="lq-quiz-pick">${opts}</select></label>${scoring}`
      + `<button type="button" class="lq-ctl go" onclick="lqTeacherStart()"${busy}>Start game</button>${closeBtn}${full}`
      + `<div class="lq-ctl-hint">${escHtml(lqQuiz(LQ_DEFAULT_QUIZ).teacherHint)}</div>`;
    return;
  }
  const quiz = lqQuiz(s.quizId);
  if(s.state === 'lobby'){
    el.innerHTML = `<button type="button" class="lq-ctl go" onclick="lqTeacherNext()"${busy}>First question</button>`
      + `<button type="button" class="lq-ctl ghost" onclick="lqTeacherClose()"${busy}>Cancel</button>${full}`
      + `<div class="lq-ctl-hint">${escHtml(quiz.teacherHint)}</div>`;
    return;
  }
  if(s.state === 'question'){
    const picks = quiz.choices.map(c =>
      `<button type="button" class="lq-ctl mark" style="--lq-c:${c.color}" onclick="lqTeacherReveal('${c.id}')"${busy}>`
      + `${escHtml(tIn(c.key, 'en'))}</button>`).join('');
    el.innerHTML = `<span class="lq-ctl-lbl">Mark the correct answer:</span><div class="lq-ctl-marks">${picks}</div>`
      + `<button type="button" class="lq-ctl ghost" onclick="lqTeacherEnd()"${busy}>End game</button>${full}`
      + `<div class="lq-ctl-hint">${escHtml(quiz.teacherHint)}</div>`;
    return;
  }
  el.innerHTML = `<button type="button" class="lq-ctl go" onclick="lqTeacherNext()"${busy}>Next question</button>`
    + `<button type="button" class="lq-ctl ghost" onclick="lqTeacherEnd()"${busy}>End game</button>${full}`;
}

function lqToggleFullscreen(){
  const stage = document.getElementById('lq-stage');
  if(!stage) return;
  if(document.fullscreenElement) document.exitFullscreen();
  else if(stage.requestFullscreen) stage.requestFullscreen().catch(()=>{});
}

// Every teacher write goes through here: one at a time, buttons greyed while
// it's in flight, and a failed write repaints rather than leaving the strip
// stuck disabled.
async function lqWrite(patch, replace){
  if(lqTBusy) return false;
  lqTBusy = true; lqPaintControls();
  try{
    await lqEnsureDb();
    if(!lqDb) throw new Error('no db');
    // A full set() (no options) for a new game, so it can't inherit a field
    // from the last one; a merge for every in-game update.
    if(replace) await lqDoc().set(patch);
    else        await lqDoc().set(patch, { merge: true });
    return true;
  }catch(e){
    console.warn('[live-quiz] teacher write failed', e);
    alert('That did not save. Check your connection and try again.');
    return false;
  }finally{
    lqTBusy = false; lqPaintControls();
  }
}

async function lqTeacherStart(){
  const pick = document.getElementById('lq-quiz-pick');
  const quizId = (pick && LIVE_QUIZZES[pick.value]) ? pick.value : LQ_DEFAULT_QUIZ;
  const quiz = lqQuiz(quizId);
  const speed = lqTScoring === 'speed';
  const sessionId = 'lq-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  // A full overwrite, not a merge: a new game must not inherit last game's
  // scores, tally or correct answer.
  await lqWrite({
    sessionId, quizId, state: 'lobby', qIndex: -1,
    correct: null, tally: null, scores: {},
    speedBonus: speed, limitSec: speed ? 20 : (quiz.limitSec || 0),
    startedAt: firebase.firestore.FieldValue.serverTimestamp(),
    askedAt: null, endedAt: null
  }, true);
}

async function lqTeacherNext(){
  const s = lqTSession;
  if(!s) return;
  const next = s.state === 'lobby' ? 0 : Number(s.qIndex) + 1;
  await lqWrite({
    state: 'question', qIndex: next, correct: null, tally: null,
    askedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

/* Reveal is where the scoring happens. The teacher's browser is the only
   judge — it reads this round's answer docs, marks them against the choice
   just clicked, and writes the running totals back onto the session doc so
   they survive a dashboard refresh and every student can see their own. */
async function lqTeacherReveal(correctId){
  const s = lqTSession;
  if(!s || s.state !== 'question') return;
  const quiz = lqQuiz(s.quizId);
  if(!lqChoice(quiz, correctId)) return;
  const rows = lqRoundAnswers(s, s.qIndex);
  const tally = {};
  quiz.choices.forEach(c => { tally[c.id] = 0; });
  const scores = {};
  // Carry every known player forward with last round's result cleared, so a
  // student who sat this one out doesn't see the previous "+1000" again.
  Object.keys(s.scores || {}).forEach(uid => {
    scores[uid] = Object.assign({}, s.scores[uid], { last: 0, lastRight: null });
  });
  rows.forEach(a => {
    if(!a.uid) return;
    if(tally[a.choice] != null) tally[a.choice]++;
    const right = a.choice === correctId;
    const pts = right ? lqPoints(a.ms, s) : 0;
    const cur = scores[a.uid] || { name: a.name || '', pts: 0, right: 0, answered: 0 };
    cur.name = a.name || cur.name || '';
    cur.pts = (cur.pts || 0) + pts;
    cur.right = (cur.right || 0) + (right ? 1 : 0);
    cur.answered = (cur.answered || 0) + 1;
    cur.last = pts; cur.lastRight = right;
    scores[a.uid] = cur;
  });
  await lqWrite({ state: 'reveal', correct: correctId, tally, scores });
}

async function lqTeacherEnd(){
  if(!lqTSession) return;
  await lqWrite({ state: 'ended', correct: null, endedAt: firebase.firestore.FieldValue.serverTimestamp() });
}
// Takes the game off every student's screen. Scores stay in the doc — it's
// the state flag students key off, so nothing is destroyed by clearing.
async function lqTeacherClose(){
  if(!lqTSession) return;
  await lqWrite({ state: 'off', correct: null, tally: null });
}
