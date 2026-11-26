/* ════════════════════════════════════════════════════════════════════
   live-quiz-teacher.js — the live quiz's TEACHER SIDE: the console's copy
   of the game (lqTSession; the Preview's local doc), the strip's settings
   (time limit, auto-reveal, number of questions, hide names), the one
   writer of liveQuiz/current (lqWrite) and the steps that call it, the
   stage the class sees (lqPaintStage), the control strip
   (lqPaintControls) and Preview (lqTeacherPreview). Split off
   live-quiz.js on 2026-11-25 (Jonathan: "split files that are long";
   live-quiz.js was 2,182 lines), its last banner section moved whole and
   unchanged. It loads wherever live-quiz.js loads, right after it:
   index.html (before live-changes.js) and the six tabs/*.html Journey
   pages; the Node tools that run the live quiz load both, in that order.
   The wire format is in live-quiz.js's header, the rule that nothing on
   the stage shows the answer before Reveal in .claude/rules/live-quiz.md.
   At load this part reads LQ_DEFAULT_QUIZ and lqDefaultScoring
   (live-quiz.js, loaded first); nothing live-quiz.js runs at load uses a
   name defined here. Its stage helpers that read names from here
   (lqStageQNumHtml, lqNames, lqStageLbRowHtml, lqStageTopHtml) are called
   only from this part and live-changes.js, and its gc-langchange handler
   calls renderTeacherLiveQuiz only on the console's live quiz view.
   ════════════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════
   TEACHER SIDE — the projected screen plus a small control strip

   Everything here is on the classroom projector, so nothing may show what
   the answer is before the reveal: during a question the stage shows only
   how many students have answered, and the control strip's six buttons are
   just the plain choice names, which give nothing away.
   ══════════════════════════════════════════════════════════════ */
let lqTSession = null;      // teacher's copy of liveQuiz/current (the PREVIEW game's local doc while one runs)
/* Preview (2026-11-12, Jonathan: "how do I preview it without starting it?").
   The console's Preview button runs the picked quiz on the stage and control
   strip with NOTHING written to Firestore: lqWrite applies each patch to a
   local doc instead, so no student is invited and no score is kept. Every
   renderer and writer is the real one; only the write is redirected.
   lqTReal holds the real liveQuiz/current meanwhile. Preview opens only when
   no real game is live, and a real game going live (another tab or device)
   ends the preview at once, so the console never hides a running game. */
let lqTPreview = false;
let lqTReal = null;
let lqTAnswers = [];        // every answer doc, filtered by sessionId at use
let lqTUnsubDoc = null, lqTUnsubAns = null;
let lqTQOpenedAt = 0;       // performance.now() when THIS round opened, on the teacher's own clock
let lqTTick = null;         // stage countdown interval, only while a timed question is on screen
let lqTScoring = lqDefaultScoring(LQ_DEFAULT_QUIZ);   // 'flat' | 'speed' — picked before Start
let lqTPickedQuizId = LQ_DEFAULT_QUIZ;                 // whichever quiz is chosen in the pre-start picker
/* Time to answer, in seconds (0 = no limit) — the teacher types it in the
   control strip before Start and again between questions. Remembered per
   quiz on this device only (a teacher convenience, never game state), so a
   short limit set for Fretboard tap doesn't leak into "Which string am I
   playing?", where the teacher plays the note after the question opens.
   Default when nothing is remembered: the old behaviour — 20 s for a
   speed-scored quiz, the bank's own limitSec (0) for a flat one. */
const LQ_LIMIT_MAX = 120;
let lqTLimits = {};
try { lqTLimits = JSON.parse(localStorage.getItem('gc-lq-limits') || '{}') || {}; } catch(e){ lqTLimits = {}; }
function lqCleanLimit(v){
  const n = Math.round(Number(v) * 10) / 10;            // tenths are plenty
  return Number.isFinite(n) && n > 0 ? Math.min(n, LQ_LIMIT_MAX) : 0;
}
function lqTLimitFor(quizId){
  if(Object.prototype.hasOwnProperty.call(lqTLimits, quizId)) return lqCleanLimit(lqTLimits[quizId]);
  return lqDefaultScoring(quizId) === 'speed' ? 20 : (lqQuiz(quizId).limitSec || 0);
}
function lqTSetLimit(quizId, v){
  lqTLimits[quizId] = lqCleanLimit(v);
  try { localStorage.setItem('gc-lq-limits', JSON.stringify(lqTLimits)); } catch(e){}
}
function lqLimitInputHtml(quizId){
  if(lqType(lqQuiz(quizId)) === 'changes') return '';   // the song is the clock
  const v = lqTLimitFor(quizId);
  return `<label class="lq-ctl-lbl">Time to answer <input type="number" id="lq-limit" class="lq-limit" min="0" max="${LQ_LIMIT_MAX}" step="0.5" inputmode="decimal" value="${v ? escAttr(String(v)) : ''}" placeholder="none" onchange="lqTSetLimit('${escAttr(quizId)}',this.value);this.value=lqTLimitFor('${escAttr(quizId)}')||''"> sec</label>`;
}
/* Reveal when time runs out (Jonathan, 2026-11-12): when the countdown
   reaches 0, the console presses Reveal itself. Only for quizzes the app
   scores (fret, pcname). An mc quiz has no answer key, so the teacher still
   marks it. Kept on this device (`gc-lq-autoreveal`), like the time box. On by
   default. It waits LQ_AUTO_REVEAL_GRACE_MS past 0 so a tap made in a
   student's last moment, on that student's slightly later clock, still lands
   in the answer docs before scoring. */
const LQ_AUTO_REVEAL_GRACE_MS = 1500;
let lqTAutoReveal = true;
try { lqTAutoReveal = localStorage.getItem('gc-lq-autoreveal') !== '0'; } catch(e){ lqTAutoReveal = true; }
let lqTAutoTimer = null, lqTAutoKey = null;
function lqTSetAutoReveal(on){
  lqTAutoReveal = !!on;
  try { localStorage.setItem('gc-lq-autoreveal', lqTAutoReveal ? '1' : '0'); } catch(e){}
  lqTArmAutoReveal();
}
function lqAutoRevealInputHtml(quizId){
  if((lqType(lqQuiz(quizId)) === 'mc' && !lqQuiz(quizId).hilo) || lqType(lqQuiz(quizId)) === 'changes') return '';   // changes: it reveals when the song stops; hilo is the one mc quiz the app scores
  return `<label class="lq-ctl-lbl"><input type="checkbox" id="lq-autoreveal"${lqTAutoReveal ? ' checked' : ''} onchange="lqTSetAutoReveal(this.checked)"> Reveal when time runs out</label>`;
}
// Called after every change to lqTSession (snapshot, preview write, exiting
// preview) and on the checkbox. One timer, keyed to the round; any other
// state clears it.
function lqTArmAutoReveal(){
  const s = lqTSession;
  const limit = s ? Number(s.limitSec) || 0 : 0;
  const key = s ? s.sessionId + '#' + s.qIndex : null;
  const want = !!(s && s.state === 'question' && limit && lqTAutoReveal && (lqType(lqQuiz(s.quizId)) !== 'mc' || lqQuiz(s.quizId).hilo));
  if(!want){ if(lqTAutoTimer){ clearTimeout(lqTAutoTimer); lqTAutoTimer = null; } lqTAutoKey = null; return; }
  if(lqTAutoTimer && lqTAutoKey === key) return;
  if(lqTAutoTimer) clearTimeout(lqTAutoTimer);
  lqTAutoKey = key;
  const wait = Math.max(0, limit * 1000 + LQ_AUTO_REVEAL_GRACE_MS - (performance.now() - lqTQOpenedAt));
  lqTAutoTimer = setTimeout(lqTAutoRevealFire, wait);
}
function lqTAutoRevealFire(){
  lqTAutoTimer = null;
  const s = lqTSession;
  if(!s || s.state !== 'question' || !lqTAutoReveal || (s.sessionId + '#' + s.qIndex) !== lqTAutoKey) return;
  if(lqTBusy){ lqTAutoTimer = setTimeout(lqTAutoRevealFire, 250); return; }   // a write is in flight: try again shortly
  const type = lqType(lqQuiz(s.quizId));
  if(type === 'fret') lqTeacherRevealFret();
  else if(type === 'pcname') lqTeacherRevealPcName();
  else if(lqQuiz(s.quizId).hilo && typeof lqTeacherRevealHilo === 'function') lqTeacherRevealHilo();
}
/* How many questions the game has (Jonathan, 2026-11-13: "set the total question prior to starting game"). A box in
   the strip before Start; blank or 0 = no set number. Written once, at Start, as `totalQ`. Remembered on this device
   (`gc-lq-total`), like the time box. Default 10. After the last question's Reveal the strip offers "Final scores"
   in place of the next-question buttons, and lqTeacherNext refuses to open one more. */
const LQ_TOTAL_DEFAULT = 10, LQ_TOTAL_MAX = 50;
function lqCleanTotal(v){
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n > 0 ? Math.min(n, LQ_TOTAL_MAX) : 0;
}
let lqTTotal = LQ_TOTAL_DEFAULT;
try { const v = localStorage.getItem('gc-lq-total'); if(v != null) lqTTotal = lqCleanTotal(v); } catch(e){ lqTTotal = LQ_TOTAL_DEFAULT; }
function lqTSetTotal(v){
  lqTTotal = lqCleanTotal(v);
  try { localStorage.setItem('gc-lq-total', String(lqTTotal)); } catch(e){}
}
function lqTotalInputHtml(){
  return `<label class="lq-ctl-lbl">Questions <input type="number" id="lq-total" class="lq-limit" min="0" max="${LQ_TOTAL_MAX}" step="1" inputmode="numeric" value="${lqTTotal ? escAttr(String(lqTTotal)) : ''}" placeholder="any" onchange="lqTSetTotal(this.value);this.value=lqTTotal||''"></label>`;
}
// True once the last of a set number of questions has been asked (its Reveal is the game's last).
function lqLastQuestionDone(s){
  const total = s ? Number(s.totalQ) || 0 : 0;
  return total > 0 && Number(s.qIndex) + 1 >= total;
}
/* Hide names on the projector (Jonathan, 2026-11-13). A box in the strip, OFF by default. Ticked, every list of
   names the stage draws (the lobby's chips, the Top 3 at Reveal, the final scores) is BUILT without them: the lobby
   keeps only its count, a leaderboard row only its place and points ("1  3000 points"). The names are left out of
   the HTML, not hidden with CSS: a name in the DOM of a projected page is still a name. Kept on this device
   (`gc-lq-hidenames`), like the time box: the teacher's own display choice, never game state, so nothing reaches
   liveQuiz/current and no student's screen changes. Stored rather than kept in memory so that a console reload in
   the middle of a game, with the box ticked, does not put the names back on the projector. */
let lqTHideNames = false;
try { lqTHideNames = localStorage.getItem('gc-lq-hidenames') === '1'; } catch(e){ lqTHideNames = false; }
function lqTSetHideNames(on){
  lqTHideNames = !!on;
  try { localStorage.setItem('gc-lq-hidenames', lqTHideNames ? '1' : '0'); } catch(e){}
  lqPaintStage();
}
function lqHideNamesInputHtml(){
  return `<label class="lq-ctl-lbl"><input type="checkbox" id="lq-hidenames"${lqTHideNames ? ' checked' : ''} onchange="lqTSetHideNames(this.checked)"> Hide names on the projector</label>`;
}
let lqTBusy = false;        // one write at a time; the buttons gate on it
let lqTFretString = null;   // fret quiz only — the string picked in the strip; defaults to quiz.strings[0]

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
  lqStageSyncTick();
  if(typeof lqgRender === 'function') lqgRender();   // the games list under the strip (teacher-livegames.js)
}

/* One shared 250ms tick for the projector's own countdown circle — mirrors
   lqSyncTick() on the student side, but keyed off lqTQOpenedAt (the
   teacher's own clock) since the stage has no server round-trip to wait on. */
function lqStageSyncTick(){
  const s = lqTSession && lqTSession.state ? lqTSession : null;
  // Defensive guard, same as the gc-langchange listener above: every caller
  // (renderTeacherLiveQuiz, lqPaintStage, the teacher session listener) is
  // teacher-console-only today — but this file also ships on the six Journey
  // pages, which have no teacher.js and thus no teacherView global at all.
  const need = !!(s && s.state === 'question' && Number(s.limitSec) && typeof teacherView !== 'undefined' && teacherView === 'livequiz' && document.getElementById('lq-st-timer'));
  if(need && !lqTTick) lqTTick = setInterval(lqStageUpdateTimer, lqTickMs(s.limitSec));
  if(!need) lqStageStopTick();
  if(need) lqStageUpdateTimer();
}
function lqStageStopTick(){ if(lqTTick){ clearInterval(lqTTick); lqTTick = null; } }
function lqStageUpdateTimer(){
  const el = document.getElementById('lq-st-timer');
  const s = lqTSession && lqTSession.state === 'question' ? lqTSession : null;
  if(!el || !s){ lqStageStopTick(); return; }
  const limit = Number(s.limitSec) || 0;
  const gone = (performance.now() - lqTQOpenedAt) / 1000;
  const left = Math.max(0, limit - gone);
  el.textContent = left === 0 ? t('lq.timeUp') : lqFmtLeft(left, limit);
  el.classList.toggle('out', left === 0);
  if(left === 0) lqStageStopTick();
}

/* Kept for the whole console session, not dropped on leaving this view: Reveal
   scores from lqTAnswers and the strip acts on lqTSession, so a listener
   started again on the way back would leave both stale until its first
   snapshot — a Reveal clicked in that gap would score the wrong answers. A
   listener that errors is dead, though, so its slot is cleared and the next
   render starts it again (each one independently). */
function lqTeacherListen(){
  if(lqTUnsubDoc && lqTUnsubAns) return;
  lqEnsureDb().then(()=>{
    if(!lqDb) return;
    if(!lqTUnsubDoc) lqTUnsubDoc = lqDoc().onSnapshot(snap => {
      lqTReal = snap.exists ? (snap.data() || null) : null;
      if(lqTPreview){
        if(!lqTRealIsLive()) return;          // keep previewing; the real doc waits in lqTReal
        lqTPreview = false;                   // a real game went live: it wins the console
        // The preview's song or notes must not play on over the real game (lqTeacherExitPreview's stops).
        if(typeof lqCcStopAudio === 'function') lqCcStopAudio();
        if(typeof lqHlStopAudio === 'function') lqHlStopAudio();
      }
      const prev = lqTSession;
      lqTSession = lqTReal;
      // Same rule as the student clock: never trust a server timestamp for
      // this, so a new question (or a new game) restarts the projector's
      // own local clock.
      if(lqTSession && lqTSession.state === 'question' && (!prev || prev.sessionId !== lqTSession.sessionId || prev.qIndex !== lqTSession.qIndex)){
        lqTQOpenedAt = performance.now();
      }
      if(typeof teacherView !== 'undefined' && teacherView === 'livequiz'){ lqPaintStage(); lqPaintControls(); }
      lqStageSyncTick();
      lqTArmAutoReveal();
    }, e => { console.warn('[live-quiz] teacher session listener stopped', e); lqTUnsubDoc = null; });
    if(!lqTUnsubAns) lqTUnsubAns = lqDoc().collection('answers').onSnapshot(snap => {
      lqTAnswers = snap.docs.map(d => d.data() || {});
      // Stage only: nothing in the control strip reads the answers, and
      // rebuilding it on every answer could swap a button out from under a
      // click (mousedown on the old one, mouseup on the new = no click).
      if(typeof teacherView !== 'undefined' && teacherView === 'livequiz') lqPaintStage();
    }, e => { console.warn('[live-quiz] teacher answers listener stopped', e); lqTUnsubAns = null; });
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
  Object.keys(s.scores || {}).forEach(uid => { if(!seen.has(uid)) seen.set(uid, ''); });   // a scored player whose answer doc is gone: no name to show
  return [...seen.entries()].map(([uid, name]) => ({ uid, name }));
}

/* ── The stage (what the class sees) ── */
function lqPaintStage(){
  const stage = document.getElementById('lq-stage');
  if(!stage) return;
  const s = lqTSession;
  if(!s || !s.state || s.state === 'off'){
    stage.innerHTML = `<div class="lq-st-idle">${lqBilingual('lq.stageIdleTitle', 'lq-st-idle-title')}`
      + `${lqBilingual('lq.stageIdleSub', 'lq-st-idle-sub')}</div>`;
    if(typeof lqMusicSync === 'function') lqMusicSync();
    return;
  }
  const quiz = lqQuiz(s.quizId);
  if(s.state === 'lobby')        stage.innerHTML = lqStageLobbyHtml(s, quiz);
  else if(s.state === 'question') stage.innerHTML = lqStageQuestionHtml(s, quiz);
  else if(s.state === 'reveal')   stage.innerHTML = lqStageRevealHtml(s, quiz);
  else                            stage.innerHTML = lqStageEndedHtml(s);
  lqPaintMarkers(stage, s, quiz, 'lqst');
  // The question HTML draws the timer at the FULL limit. Every answer repaints
  // the stage, so without this the projector flickered back to "20" on each
  // answer, and an answer landing after "Time's up" left it stuck on "20".
  lqStageSyncTick();
  if(typeof lqMusicSync === 'function') lqMusicSync();   // the games' music (teacher-livemusic.js, console only)
}

// English only on the projector for now (2026-09-29, Jonathan's ask — English
// and Spanish stacked on the same display read as clutter on the classroom
// screen). Each student's OWN device still follows their own language toggle
// through the ordinary t() path elsewhere in this file — untouched. The
// Spanish lookup here is skipped rather than deleted, so restoring the
// stacked line later is a two-line change (see the git history of this
// function for the exact shape).
function lqBilingual(key, cls){
  const en = tIn(key, 'en');
  return `<div class="${cls}">${escHtml(en)}</div>`;
}
// Same as lqBilingual, but for a parameterised string — the fret prompt and
// answer line are the first ones on the stage that need per-language params.
function lqBilingualParams(key, cls, paramsEn, paramsEs){
  const en = tIn(key, 'en', paramsEn);
  return `<div class="${cls}">${escHtml(en)}</div>`;
}

function lqStageLobbyHtml(s, quiz){
  // Sorted by NAME: the answer docs come back in uid order, so chips in that order would line every uid in the public scores up with a name.
  const here = lqRoster(s).slice().sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  // Names hidden (lqTHideNames): no chips at all, only the count above them.
  const chips = lqTHideNames ? '' : here.map(r => `<span class="lq-chip">${escHtml(r.name || '—')}</span>`).join('');
  const custom = lqCustomTitle('en', s);
  return (custom ? `<div class="lq-st-title">${escHtml(custom)}</div>` : lqBilingual(quiz.titleKey, 'lq-st-title'))
    + lqBilingual('lq.stageJoin', 'lq-st-join')
    + `<div class="lq-st-count"><span class="lq-st-big">${here.length}</span>`
    + `${lqBilingual('lq.stageInGame', 'lq-st-cap')}</div>`
    + `<div class="lq-chips">${chips}</div>`;
}

function lqStageQuestionHtml(s, quiz){
  if(lqType(quiz) === 'fret') return lqStageFretQuestionHtml(s, quiz);
  if(lqType(quiz) === 'pcname') return lqStagePcNameQuestionHtml(s, quiz);
  if(lqType(quiz) === 'changes') return typeof lqCcStageQuestionHtml === 'function' ? lqCcStageQuestionHtml(s) : '';
  const inCount = lqRoundAnswers(s, s.qIndex).length;
  const roster = lqRoster(s).length;
  const timer = Number(s.limitSec)
    ? `<div class="lq-st-timer" id="lq-st-timer">${escHtml(lqFmtLeft(Number(s.limitSec), Number(s.limitSec)))}</div>` : '';
  return lqStageQNumHtml(s)
    + lqBilingual(quiz.promptKey, 'lq-st-prompt')
    + timer
    + `<div class="lq-st-count"><span class="lq-st-big">${inCount}${roster ? ' / ' + roster : ''}</span>`
    + `${lqBilingual('lq.stageAnswered', 'lq-st-cap')}</div>`;
}

// No board here — nothing on the projector before Reveal may show which
// fret is right, and a board with no marker on it would add nothing anyway.
// "Name the power chord" is the one question where the stage DOES draw a
// diagram before Reveal: the chord box IS the prompt (lqStagePcNameQuestionHtml).
// That is safe because the box carries no name: chordDiagramSVG gets no
// label, and gdChordAriaLabel names strings and frets only. checks.mjs 1cu
// renders the stage and strip for all 14 shapes and fails on the name.
function lqStageFretQuestionHtml(s, quiz){
  const inCount = lqRoundAnswers(s, s.qIndex).length;
  const roster = lqRoster(s).length;
  const timer = Number(s.limitSec)
    ? `<div class="lq-st-timer" id="lq-st-timer">${escHtml(lqFmtLeft(Number(s.limitSec), Number(s.limitSec)))}</div>` : '';
  const prompt = s.target
    ? lqBilingualParams(quiz.promptKey, 'lq-st-prompt', lqTargetParams(s.target, 'en', quiz), lqTargetParams(s.target, 'es', quiz))
    : lqBilingual('lq.noTapYet', 'lq-st-prompt');
  return lqStageQNumHtml(s)
    + prompt + timer
    + `<div class="lq-st-count"><span class="lq-st-big">${inCount}${roster ? ' / ' + roster : ''}</span>`
    + `${lqBilingual('lq.stageAnswered', 'lq-st-cap')}</div>`;
}

// The chord box, large, as the prompt, with the timer and the answered count
// beside it (one row, so the stage stays the height of the other quizzes'). No
// name anywhere until Reveal (the doc does not even hold one: target is
// { string, fret }).
function lqStagePcNameQuestionHtml(s, quiz){
  const inCount = lqRoundAnswers(s, s.qIndex).length;
  const roster = lqRoster(s).length;
  const timer = Number(s.limitSec)
    ? `<div class="lq-st-timer" id="lq-st-timer">${escHtml(lqFmtLeft(Number(s.limitSec), Number(s.limitSec)))}</div>` : '';
  const prompt = s.target ? lqBilingual(quiz.promptKey, 'lq-st-prompt') : lqBilingual('lq.noTapYet', 'lq-st-prompt');
  return lqStageQNumHtml(s)
    + prompt
    + `<div class="lq-st-pcrow">${lqPcNameBoxHtml(s.target, 'lq-pcbox-stage')}<div class="lq-st-pcside">${timer}`
    + `<div class="lq-st-count"><span class="lq-st-big">${inCount}${roster ? ' / ' + roster : ''}</span>`
    + `${lqBilingual('lq.stageAnswered', 'lq-st-cap')}</div></div></div>`;
}

// Reveal: the name, then three columns: the box, the tally of all eight, the
// top 3 (stacked; Top 3 since 2026-11-19, Jonathan: "only show top 3 scores").
// countOnly (pc-name today): two columns, the box and "n / m correct" over the
// top 3; no bars, so the room does not see which wrong names were picked.
function lqStageRightCountHtml(s){
  const p = lqRightCount(s);
  return `<div class="lq-st-count"><span class="lq-st-big">${p.n} / ${p.total}</span>${lqBilingual('lq.stageCorrect', 'lq-st-cap')}</div>`;
}
function lqStagePcNameRevealHtml(s, quiz){
  const answer = s.correct ? `<div class="lq-st-answer">${escHtml(s.correct)}</div>` : '';
  const lb = lqStageTopHtml(lqRankedNamed(s));
  if(quiz.countOnly) return lqBilingualParams('lq.stageAnswerLabel', 'lq-st-qnum', {n: Number(s.qIndex) + 1}, {n: Number(s.qIndex) + 1})
    + answer
    + `<div class="lq-st-split">${lqPcNameBoxHtml(s.target, 'lq-pcbox-stage')}<div>${lqStageRightCountHtml(s)}<ol class="lq-lb lq-lb-stage">${lb}</ol></div></div>`;
  return lqBilingualParams('lq.stageAnswerLabel', 'lq-st-qnum', {n: Number(s.qIndex) + 1}, {n: Number(s.qIndex) + 1})
    + answer
    + `<div class="lq-st-split lq-st-split3">${lqPcNameBoxHtml(s.target, 'lq-pcbox-stage')}${lqTallyHtml(s, quiz, null)}<ol class="lq-lb lq-lb-stage">${lb}</ol></div>`;
}

function lqStageRevealHtml(s, quiz){
  // The Saw chase band (live-saw.js, console only) goes under whatever the Reveal shows; '' with its switch off.
  // A fret Reveal is the tallest (six tally bars and the Top 3), so it draws the band itself, in the free space under
  // its board (lqStageFretRevealHtml), and nothing here: the stage then keeps its height.
  if(lqType(quiz) === 'fret') return lqStageRevealBodyHtml(s, quiz);
  return lqStageRevealBodyHtml(s, quiz) + (typeof lqSawBandHtml === 'function' ? lqSawBandHtml(s, quiz) : '');
}
function lqStageRevealBodyHtml(s, quiz){
  if(lqType(quiz) === 'fret') return lqStageFretRevealHtml(s, quiz);
  if(lqType(quiz) === 'pcname') return lqStagePcNameRevealHtml(s, quiz);
  if(lqType(quiz) === 'changes') return typeof lqCcStageRevealHtml === 'function' ? lqCcStageRevealHtml(s) : '';
  const c = lqChoice(quiz, s.correct);
  const answer = c ? lqBilingual(c.key, 'lq-st-answer') : '';
  const board = lqStageTopHtml(lqRankedNamed(s));
  return lqBilingualParams('lq.stageAnswerLabel', 'lq-st-qnum', {n: Number(s.qIndex) + 1}, {n: Number(s.qIndex) + 1})
    + answer
    + `<div class="lq-st-split">${lqTallyHtml(s, quiz, null)}<ol class="lq-lb lq-lb-stage">${board}</ol></div>`;
}

// Bilingual answer line for a fret reveal — mirrors lqFretAnswerHtml, one
// correct id or the E/E-style octave pair, but both languages at once.
function lqFretBilingualAnswer(correctIds, chord){
  const first = lqParseFretId(correctIds[0]);
  if(!first) return '';
  const key = LQ_STRING_KEY[first.string] || 'fret.stringLowE';
  const stringEn = tIn(key, 'en'), stringEs = tIn(key, 'es');
  const two = correctIds.length >= 2;
  const second = two ? lqParseFretId(correctIds[1]) : null;
  const base = two ? { n: first.fret, m: second ? second.fret : correctIds[1] } : { n: first.fret };
  const extra = chord ? { chord } : {};
  const k = chord ? (two ? 'lq.answerPcAlso' : 'lq.answerPc') : (two ? 'lq.answerFretAlso' : 'lq.answerFret');
  return lqBilingualParams(k, 'lq-st-answer', Object.assign({}, base, { string: stringEn }, extra), Object.assign({}, base, { string: stringEs }, extra));
}

// The board on the left (static, correct fret(s) green, every tapped marker
// showing its count — nothing student-identifying), the tally bars and the
// top-3 leaderboard stacked on the right. A power quiz also draws the chord's
// chart box beside the board, for the lowest right fret (the open shape for
// E5 on low E and A5 on the A string) — after Reveal only.
function lqStageFretRevealHtml(s, quiz){
  const correctIds = lqCorrectIds(s);
  const chord = quiz.power && s.target ? lqPcChord(s.target.note) : null;
  const answer = correctIds.length ? lqFretBilingualAnswer(correctIds, chord) : '';
  let board = `<div class="lq-board" id="lq-st-board">${typeof fgBoardSvg === 'function' ? fgBoardSvg('lqst', null, lqBoardOpts(quiz, { strings: quiz.strings, hit: false })) : ''}</div>`;
  const first = chord ? lqParseFretId(correctIds[0]) : null;
  const box = first ? lqPcBoxSvg(first.string, first.fret) : '';
  if(box) board = `<div class="lq-st-pcwrap">${board}<div class="lq-pcbox lq-pcbox-side">${box}</div></div>`;
  const saw = typeof lqSawBandHtml === 'function' ? lqSawBandHtml(s, quiz) : '';   // Saw chase (live-saw.js): '' with its switch off
  if(saw) board = `<div class="lq-st-boardcol">${board}${saw}</div>`;
  const lb = lqStageTopHtml(lqRankedNamed(s));
  return lqBilingualParams('lq.stageAnswerLabel', 'lq-st-qnum', {n: Number(s.qIndex) + 1}, {n: Number(s.qIndex) + 1})
    + answer
    + `<div class="lq-st-split">${board}<div>${quiz.countOnly ? lqStageRightCountHtml(s) : lqTallyHtml(s, quiz, null)}<ol class="lq-lb lq-lb-stage">${lb}</ol></div></div>`;
}

function lqStageEndedHtml(s){
  const rows = lqRankedNamed(s);
  const board = lqStageTopHtml(rows);
  return lqBilingual('lq.finalTitle', 'lq-st-title') + `<ol class="lq-lb lq-lb-stage">${board}</ol>`;
}

/* The note picker for a fret quiz's control strip — shown instead of the
   plain "First/Next question" button, both before question 1 (lobby) and
   after every question (reveal). One row of string chips (skipped for a
   one-string quiz; the selected one shown in `.go` instead of `.ghost` —
   existing classes, no new CSS for "highlighted") plus a row of the seven
   natural notes (always all seven, drawn from LQ_NATURALS) plus Random —
   or, for "Find the power chord", the eight chord names E5 … D5
   (lqTargetNotes). Nothing here names a fret — the strip is on the
   projector too. */
function lqFretPickerHtml(quiz, busy){
  const roots = lqRootStrings(quiz);
  const cur = roots.includes(lqTFretString) ? lqTFretString : roots[0];
  const strings = roots.length > 1
    ? `<div class="lq-ctl-marks">${roots.map(k =>
        `<button type="button" class="lq-ctl${k === cur ? ' go' : ' ghost'}" onclick="lqTFretString='${k}';lqPaintControls()">${escHtml(tIn(LQ_STRING_KEY[k], 'en'))}</button>`).join('')}</div>`
    : '';
  // A power quiz names its buttons as chords (E5 … D5) in fret order; the
  // note quizzes keep their seven letters A–G, unchanged.
  const notes = lqTargetNotes(quiz, cur);
  const noteBtns = notes.map(n =>
    `<button type="button" class="lq-ctl mark" style="--lq-c:${LQ_STRING_COLOR[cur] || '#555'}" onclick="lqTeacherOpenFret('${cur}','${n}')"${busy}>${quiz.power ? lqPcChord(n) : n}</button>`).join('');
  const random = `<button type="button" class="lq-ctl go" onclick="lqTeacherOpenFret('${cur}','random')"${busy}>Random</button>`;
  return strings + `<div class="lq-ctl-marks">${noteBtns}${random}</div>`;
}

/* "Name the power chord"'s strip: Low E / A / Both chips (which root strings
   Random may use; the selected one `.go`) and ONE Random shape button. No
   name buttons and no shape buttons: the strip is on the projector, and a
   button naming the chord would answer the question. */
let lqTPcStrings = 'both';   // 'lowE' | 'A' | 'both'
function lqPcNameStringsFor(quiz){
  const picked = quiz.strings.filter(k => lqTPcStrings === 'both' || k === lqTPcStrings);
  return picked.length ? picked : quiz.strings;
}
function lqPcNamePickerHtml(quiz, busy){
  const chips = [['lowE', 'Low E'], ['A', 'A'], ['both', 'Both']]
    .filter(([k]) => k === 'both' || quiz.strings.includes(k))
    .map(([k, label]) => `<button type="button" class="lq-ctl${k === lqTPcStrings ? ' go' : ' ghost'}" onclick="lqTPcStrings='${k}';lqPaintControls()">${label}</button>`).join('');
  return `<div class="lq-ctl-marks">${chips}</div>`
    + `<div class="lq-ctl-marks"><button type="button" class="lq-ctl go" onclick="lqTeacherOpenPcName()"${busy}>Random shape</button></div>`;
}

/* ── The control strip (what Jonathan drives it with) ── */
function lqPaintControls(){
  const el = document.getElementById('lq-controls');
  if(!el) return;
  // A snapshot landing mid-typing would wipe the half-typed number; the
  // input's own onchange (blur / Enter) saves it and the next paint catches up.
  if(document.activeElement && (document.activeElement.id === 'lq-limit' || document.activeElement.id === 'lq-total' || document.activeElement.id === 'lq-sawgoal') && !lqTBusy) return;
  const s = lqTSession;
  const busy = lqTBusy ? ' disabled' : '';
  const full = lqHideNamesInputHtml() + (typeof lqSawSwitchHtml === 'function' ? lqSawSwitchHtml() : '') + (typeof lqMusicInputHtml === 'function' ? lqMusicInputHtml() : '') + `<button type="button" class="lq-ctl ghost" onclick="lqToggleFullscreen()">${lqIsFullscreen() ? 'Exit full screen' : 'Full screen'}</button>`
    + (lqTPreview ? `<button type="button" class="lq-ctl ghost" onclick="lqTeacherExitPreview()">Exit preview</button>` : '');
  const pv = lqTPreview ? `<div class="lq-ctl-hint"><b>Preview</b>: only this screen sees it. No student is invited and nothing is saved.</div>` : '';
  if(lqTPreview && s && s.state === 'ended'){
    el.innerHTML = full + pv;
    return;
  }
  if(!s || !s.state || s.state === 'off' || s.state === 'ended'){
    const ids = lqPickerIds();
    if(ids.length && !ids.includes(lqTPickedQuizId)){ lqTPickedQuizId = ids[0]; lqTScoring = lqDefaultScoring(ids[0]); }
    if(!ids.length){
      el.innerHTML = ((s && s.state === 'ended') ? `<button type="button" class="lq-ctl ghost" onclick="lqTeacherClose()"${busy}>Clear the board</button>` : '') + full
        + `<div class="lq-ctl-hint">Every game is removed, so there is nothing to start. Open "Removed games" in the list below and press Restore.</div>`;
      return;
    }
    const opts = ids.map(id =>
      `<option value="${escAttr(id)}"${id === lqTPickedQuizId ? ' selected' : ''}>${escHtml(lqCustomTitle('en', null, id) || tIn(LIVE_QUIZZES[id].titleKey, 'en'))}</option>`).join('');
    const scoring = (lqType(lqQuiz(lqTPickedQuizId)) === 'changes' ? '' : `<label class="lq-ctl-lbl">Scoring
      <select id="lq-scoring" onchange="lqTScoring=this.value">
        <option value="flat"${lqTScoring === 'flat' ? ' selected' : ''}>Every correct answer = 1000</option>
        <option value="speed"${lqTScoring === 'speed' ? ' selected' : ''}>Faster = more points</option>
      </select></label>`)
      + lqTotalInputHtml() + (typeof lqSawGoalInputHtml === 'function' ? lqSawGoalInputHtml() : '') + lqLimitInputHtml(lqTPickedQuizId) + lqAutoRevealInputHtml(lqTPickedQuizId);
    const closeBtn = (s && s.state === 'ended')
      ? `<button type="button" class="lq-ctl ghost" onclick="lqTeacherClose()"${busy}>Clear the board</button>` : '';
    el.innerHTML = `<label class="lq-ctl-lbl">Game <select id="lq-quiz-pick" onchange="lqTPickedQuizId=this.value;lqTScoring=lqDefaultScoring(this.value);lqPaintControls()">${opts}</select></label>${scoring}`
      + `<button type="button" class="lq-ctl go" onclick="lqTeacherStart()"${busy}>Start game</button>`
      + `<button type="button" class="lq-ctl ghost" onclick="lqTeacherPreview()"${busy}>Preview</button>${closeBtn}${full}`
      + `<div class="lq-ctl-hint">${escHtml(lqQuiz(lqTPickedQuizId).teacherHint)} Questions: how many the game has (blank or 0 = no set number).${lqType(lqQuiz(lqTPickedQuizId)) === 'changes' ? '' : ' Time to answer: blank or 0 = no limit. Reveal when time runs out: the app presses Reveal for you about a second after the clock hits 0 (only on quizzes the app scores).'} Preview runs the quiz on this screen only, without inviting students.</div>`;
    return;
  }
  const quiz = lqQuiz(s.quizId);
  const fret = lqType(quiz) === 'fret';
  const pcname = lqType(quiz) === 'pcname';
  const changes = lqType(quiz) === 'changes' && typeof lqCcPickerHtml === 'function';
  const hilo = !!quiz.hilo && typeof lqHlPickerHtml === 'function';   // "Higher or lower?" (live-hilo.js)
  if(s.state === 'lobby'){
    const opener = fret ? lqFretPickerHtml(quiz, busy)
      : pcname ? lqPcNamePickerHtml(quiz, busy)
      : changes ? lqCcPickerHtml(busy)
      : hilo ? lqHlPickerHtml(busy)
      : `<button type="button" class="lq-ctl go" onclick="lqTeacherNext()"${busy}>First question</button>`;
    el.innerHTML = opener
      + `<button type="button" class="lq-ctl ghost" onclick="lqTeacherClose()"${busy}>Cancel</button>${full}`
      + `<div class="lq-ctl-hint">${escHtml(quiz.teacherHint)}</div>` + pv;
    return;
  }
  if(s.state === 'question'){
    let head;
    if(fret){
      head = `<button type="button" class="lq-ctl go" onclick="lqTeacherRevealFret()"${busy}>Reveal</button>`;
    } else if(pcname){
      head = `<button type="button" class="lq-ctl go" onclick="lqTeacherRevealPcName()"${busy}>Reveal</button>`;
    } else if(changes){
      head = `<button type="button" class="lq-ctl go" onclick="lqTeacherCcStop()"${busy}>Stop the song</button>` + (typeof lqCcStatusHtml === 'function' ? lqCcStatusHtml() : '');
    } else if(hilo){
      head = lqHlQuestionHeadHtml(s, quiz, busy);
    } else {
      const picks = quiz.choices.map(c =>
        `<button type="button" class="lq-ctl mark" style="--lq-c:${c.color}" onclick="lqTeacherReveal('${c.id}')"${busy}>`
        + `${escHtml(tIn(c.key, 'en'))}</button>`).join('');
      head = `<span class="lq-ctl-lbl">Mark the correct answer:</span><div class="lq-ctl-marks">${picks}</div>`;
    }
    el.innerHTML = head
      + `<button type="button" class="lq-ctl ghost" onclick="lqTeacherEnd()"${busy}>End game</button>${full}`
      + `<div class="lq-ctl-hint">${escHtml(quiz.teacherHint)}</div>` + pv;
    return;
  }
  if(lqLastQuestionDone(s)){
    el.innerHTML = `<button type="button" class="lq-ctl go" onclick="lqTeacherEnd()"${busy}>Final scores</button>${full}`
      + `<div class="lq-ctl-hint">That was question ${Number(s.qIndex) + 1} of ${Number(s.totalQ)}, the last one.</div>` + pv;
    return;
  }
  const opener = fret ? lqFretPickerHtml(quiz, busy)
    : pcname ? lqPcNamePickerHtml(quiz, busy)
    : changes ? lqCcPickerHtml(busy)
    : hilo ? lqHlPickerHtml(busy)
    : `<button type="button" class="lq-ctl go" onclick="lqTeacherNext()"${busy}>Next question</button>`;
  el.innerHTML = opener + lqLimitInputHtml(s.quizId) + lqAutoRevealInputHtml(s.quizId)
    + `<button type="button" class="lq-ctl ghost" onclick="lqTeacherEnd()"${busy}>End game</button>${full}` + pv;
}

/* Full screen takes the whole game panel, the stage AND the control strip under it (Jonathan, 2026-11-20:
   "clicking on full screen doesn't advance the game": with the stage alone in full screen, Next, Reveal, the
   song sections and Stop were out of reach). The strip is on the projector outside full screen too and names no
   answer, so it may be seen. The button reads "Exit full screen" while it is on. */
function lqToggleFullscreen(){
  const shell = document.getElementById('lq-shell');
  if(!shell) return;
  if(document.fullscreenElement) document.exitFullscreen().catch(()=>{});
  else if(shell.requestFullscreen) shell.requestFullscreen().catch(()=>{});
}
function lqIsFullscreen(){ return !!(document.fullscreenElement && document.fullscreenElement.id === 'lq-shell'); }
document.addEventListener('fullscreenchange', () => { if(document.getElementById('lq-controls')) lqPaintControls(); });

// Every teacher write goes through here: one at a time, buttons greyed while
// it's in flight, and a failed write repaints rather than leaving the strip
// stuck disabled.
/* replace === true  → a full set() (a new game: nothing inherited).
   replace === 'fields' → set() with mergeFields = every key in the patch: each named field is REPLACED whole (a plain merge is DEEP: it keeps
   every old key inside a map such as `scores`, so a name an older game left there would stay in Firestore). The reveal, end and close writers use it.
   otherwise → a merge, for the in-game updates. */
async function lqWrite(patch, replace){
  if(lqTBusy) return false;
  if(lqTPreview) return lqPreviewWrite(patch, replace);
  lqTBusy = true; lqPaintControls();
  try{
    await lqEnsureDb();
    if(!lqDb) throw new Error('no db');
    // A full set() (no options) for a new game, so it can't inherit a field
    // from the last one; a merge for every in-game update.
    if(replace === 'fields') await lqDoc().set(patch, { mergeFields: Object.keys(patch) });
    else if(replace)         await lqDoc().set(patch);
    else                     await lqDoc().set(patch, { merge: true });
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
  const speed = lqTScoring === 'speed';
  const sessionId = 'lq-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  // The teacher's own name for the game, frozen into the session (see lqCustomTitle);
  // no `title` field at all when he kept the built-in one.
  const custom = { en: lqCustomTitle('en', null, quizId), es: lqCustomTitle('es', null, quizId) };
  const named = custom.en || custom.es ? { title: custom } : {};
  // A full overwrite, not a merge: a new game must not inherit last game's
  // scores, tally or correct answer.
  await lqWrite(Object.assign({
    sessionId, quizId, state: 'lobby', qIndex: -1,
    correct: null, correctIds: null, tally: null, scores: {}, target: null,
    speedBonus: speed, limitSec: lqTLimitFor(quizId), totalQ: lqTTotal,
    startedAt: firebase.firestore.FieldValue.serverTimestamp(),
    askedAt: null, endedAt: null
  }, named), true);
}

/* ── Preview: the picked quiz on this console only (see lqTPreview) ── */
function lqTRealIsLive(){
  return !!(lqTReal && (lqTReal.state === 'lobby' || lqTReal.state === 'question' || lqTReal.state === 'reveal'));
}
async function lqTeacherPreview(){
  if(lqTBusy || lqTPreview || lqTRealIsLive()) return;
  lqTPreview = true;
  await lqTeacherStart();                 // the real opener; lqWrite keeps it local
  if(lqTSession && lqTSession.sessionId) lqTSession.sessionId = 'preview-' + lqTSession.sessionId;   // never matches a real answer doc
  lqPaintStage(); lqPaintControls();
}
function lqTeacherExitPreview(){
  if(!lqTPreview) return;
  if(typeof lqCcStopAudio === 'function') lqCcStopAudio();
  if(typeof lqHlStopAudio === 'function') lqHlStopAudio();
  lqTPreview = false;
  lqTSession = lqTReal;
  lqPaintStage(); lqPaintControls(); lqStageSyncTick(); lqTArmAutoReveal();
}
// lqWrite's stand-in while previewing: the same three write shapes, applied to
// the local doc. Server timestamps become null (the console reads its own
// clock, lqTQOpenedAt). Closing the board (state 'off') ends the preview.
function lqPreviewWrite(patch, replace){
  const clean = {};
  Object.keys(patch).forEach(k => {
    const v = patch[k];
    clean[k] = (v && typeof v === 'object' && firebase.firestore.FieldValue && v instanceof firebase.firestore.FieldValue) ? null : v;
  });
  const prev = lqTSession;
  lqTSession = replace === true ? clean : Object.assign({}, prev || {}, clean);
  if(lqTSession.state === 'off'){ lqTeacherExitPreview(); return true; }
  if(lqTSession.state === 'question' && (!prev || prev.state !== 'question' || prev.qIndex !== lqTSession.qIndex)) lqTQOpenedAt = performance.now();
  lqPaintStage(); lqPaintControls(); lqStageSyncTick(); lqTArmAutoReveal();
  return true;
}

// `target` is set only by lqTeacherOpenFret (a fret quiz's note picker); the
// plain "First/Next question" button calls this with no argument, same as
// always, and an mc quiz never reads s.target.
async function lqTeacherNext(target, extra){
  const s = lqTSession;
  if(!s) return;
  // Every opener is shown only in the lobby or after a Reveal. An opener that awaited first (the hilo piano load)
  // must not reopen a game that Cancel / End / Clear closed meanwhile: those keep the sessionId, only the state moves.
  if(s.state !== 'lobby' && s.state !== 'reveal') return;
  const next = s.state === 'lobby' ? 0 : Number(s.qIndex) + 1;
  if(Number(s.totalQ) > 0 && next >= Number(s.totalQ)) return;   // the set number of questions has been asked
  // The time box between questions can change the limit mid-game; each new
  // question carries whatever it says now.
  // `extra`: fields one question type adds (Hear the Chord Change: limitSec 0 and its `cc`, live-changes.js).
  return lqWrite(Object.assign({
    state: 'question', qIndex: next, correct: null, correctIds: null, tally: null,
    limitSec: lqTLimitFor(s.quizId),
    target: target || null,
    askedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, extra || {}));
}

// Opens a fret question: validates the string against the quiz, resolves
// Random to a real string+note, and bails silently on a note with no fret
// on that string (shouldn't happen — every natural exists on every string —
// but a bad Random pick must never open a dead question).
async function lqTeacherOpenFret(string, note){
  const s = lqTSession; if(!s) return;
  const quiz = lqQuiz(s.quizId);
  if(!lqRootStrings(quiz).includes(string)) return;
  if(note === 'random'){ ({ string, note } = lqRandomTarget(quiz, s.target)); }
  if(!lqTargetIds(quiz, { string, note }).length) return;
  lqTFretString = string;
  await lqTeacherNext({ string, note });
}
// Any string in the quiz, any natural on it, never the same target twice
// running (a fresh one is more useful to the class than an accidental
// repeat) — falls through to a repeat only if 20 tries can't avoid it,
// which only happens on a one-string, one-note-left edge case.
function lqRandomTarget(quiz, prev){
  let string, note, tries = 0;
  do {
    const roots = lqRootStrings(quiz);
    string = roots[Math.floor(Math.random() * roots.length)];
    const present = lqTargetNotes(quiz, string);
    note = present[Math.floor(Math.random() * present.length)];
    tries++;
  } while(prev && string === prev.string && note === prev.note && tries < 20);
  return { string, note };
}

/* Opens a "Name the power chord" question on a random shape from the chips'
   strings. Never the same shape twice in one game until every shape in the
   pool has been asked (then the cycle starts again), and never the shape just
   asked. The history lives in this tab's memory only: a console reload
   forgets it but still avoids the shape on screen (s.target). */
let lqTPcAsked = { sessionId: null, keys: [] };
function lqPcNameRandomTarget(pool, prev, asked){
  const key = t => t.string + ':' + t.fret;
  const notPrev = pool.filter(t => !(prev && key(t) === key({ string: prev.string, fret: Number(prev.fret) })));
  const fresh = notPrev.filter(t => !asked.includes(key(t)));
  const from = fresh.length ? fresh : (notPrev.length ? notPrev : pool);
  return from.length ? from[Math.floor(Math.random() * from.length)] : null;
}
async function lqTeacherOpenPcName(){
  const s = lqTSession; if(!s) return;
  const quiz = lqQuiz(s.quizId);
  if(lqType(quiz) !== 'pcname') return;
  const pool = lqPcNamePool(lqPcNameStringsFor(quiz));
  if(lqTPcAsked.sessionId !== s.sessionId) lqTPcAsked = { sessionId: s.sessionId, keys: [] };
  const poolKeys = pool.map(t => t.string + ':' + t.fret);
  if(poolKeys.every(k => lqTPcAsked.keys.includes(k))) lqTPcAsked.keys = lqTPcAsked.keys.filter(k => !poolKeys.includes(k));
  const target = lqPcNameRandomTarget(pool, s.target, lqTPcAsked.keys);
  if(!target || !lqPcNameOf(target)) return;
  if(await lqTeacherNext({ string: target.string, fret: target.fret }) === true) lqTPcAsked.keys.push(target.string + ':' + target.fret);
}

/* Reveal is where the scoring happens. The teacher's browser is the only
   judge — it reads this round's answer docs, marks them against the choice
   just clicked, and writes the running totals back onto the session doc so
   they survive a dashboard refresh and every student can see their own.
   Shared by the mc and fret reveal below.
   `pointsOf(a)` (Hear the Chord Change, live-changes.js): a round scored in
   points per answer rather than right or wrong; an answer is "right" when it
   earns any, and no tally is counted here. */
function lqScoreRound(s, rows, isRight, tallyKeys, isValidId, pointsOf){
  const tally = {};
  if(tallyKeys) tallyKeys.forEach(k => { tally[k] = 0; });
  const scores = {};
  // Carry every known player forward with last round's result cleared, so a
  // student who sat this one out doesn't see the previous "+1000" again.
  Object.keys(s.scores || {}).forEach(uid => {
    scores[uid] = Object.assign(lqPublicScore(s.scores[uid]), { last: 0, lastRight: null });   // a WHITELIST copy: no name, and no unknown field, carries forward
  });
  rows.forEach(a => {
    if(!a.uid) return;
    if(pointsOf){
      // no tally: the caller keeps its own totals
    } else if(tallyKeys){
      if(tally[a.choice] != null) tally[a.choice]++;
    } else if(!isValidId || isValidId(a.choice)){
      tally[a.choice] = (tally[a.choice] || 0) + 1;
    }
    const pts = pointsOf ? Math.max(0, Math.round(Number(pointsOf(a)) || 0)) : (isRight(a) ? lqPoints(a.ms, s) : 0);
    const right = pointsOf ? pts > 0 : isRight(a);
    const cur = scores[a.uid] || { pts: 0, right: 0, answered: 0 };    // NO name here: this doc is read by every signed-in account
    cur.pts = (cur.pts || 0) + pts;
    cur.right = (cur.right || 0) + (right ? 1 : 0);
    cur.answered = (cur.answered || 0) + 1;
    cur.last = pts; cur.lastRight = right;
    scores[a.uid] = cur;
  });
  return { tally, scores };
}

async function lqTeacherReveal(correctId){
  const s = lqTSession;
  if(!s || s.state !== 'question') return;
  const quiz = lqQuiz(s.quizId);
  if(!lqChoice(quiz, correctId)) return;
  const rows = lqRoundAnswers(s, s.qIndex);
  const { tally, scores } = lqScoreRound(s, rows, a => a.choice === correctId, quiz.choices.map(c => c.id));
  await lqWrite({ state: 'reveal', correct: correctId, tally, scores }, 'fields');
}

// Octaves both count: every fret on the target string that sounds the
// target note is correct (E on low E is fret 0 AND fret 12). A stray answer
// that isn't even a real fret on this quiz's strings is dropped from the
// tally (nothing to draw a bar for) but still scored wrong, same as any
// other wrong pick.
async function lqTeacherRevealFret(){
  const s = lqTSession;
  if(!s || s.state !== 'question' || !s.target) return;
  const quiz = lqQuiz(s.quizId);
  const ids = lqTargetIds(quiz, s.target);
  if(!ids.length){ console.warn('[live-quiz] lqTeacherRevealFret: no frets for target', s.target); return; }
  const rows = lqRoundAnswers(s, s.qIndex);
  const isValidId = choice => { const p = lqParseFretId(choice); return !!p && quiz.strings.includes(p.string); };
  const { tally, scores } = lqScoreRound(s, rows, a => ids.includes(a.choice), null, isValidId);
  await lqWrite({ state: 'reveal', correct: ids[0], correctIds: ids, tally, scores }, 'fields');
}

// "Name the power chord": the name comes from the target's shape, worked out
// here at Reveal; this write is the first time the doc holds it. The tally
// keeps all eight names (zeros included), so the bars always show eight rows.
async function lqTeacherRevealPcName(){
  const s = lqTSession;
  if(!s || s.state !== 'question' || !s.target) return;
  const correct = lqPcNameOf(s.target);
  if(!correct){ console.warn('[live-quiz] lqTeacherRevealPcName: no chord for target', s.target); return; }
  const rows = lqRoundAnswers(s, s.qIndex);
  const { tally, scores } = lqScoreRound(s, rows, a => a.choice === correct, lqPcNames());
  await lqWrite({ state: 'reveal', correct, tally, scores }, 'fields');
}

/* End game with a question still OPEN throws that round away: scoring only
   happens at reveal (lqScoreRound), so nobody gets points for it. That used
   to happen on one click, so it asks first now (2026-10-12). Only while a
   question is open — from a reveal, ending loses nothing. The wording names
   no answer: the console is on the projector, and the room sees this box. */
async function lqTeacherEnd(){
  const s = lqTSession;
  if(!s) return;
  if(s.state === 'question' && !lqTPreview){   // a preview round scores nothing anyway
    const type = lqType(lqQuiz(s.quizId));
    const howToScore = type === 'changes' ? 'press Stop the song (or let the section finish)' : (type !== 'mc' || lqQuiz(s.quizId).hilo) ? 'press Reveal' : 'mark the correct answer';   // fret, pcname and hilo: the app scores at Reveal
    if(!window.confirm('This question is still open. If you end the game now, this round is thrown away and nobody gets points for it.\n\n'
      + 'To count it: Cancel, ' + howToScore + ', then End game.\n\nEnd the game now anyway?')) return;
  }
  if(typeof lqCcStopAudio === 'function') lqCcStopAudio();
  if(typeof lqHlStopAudio === 'function') lqHlStopAudio();
  await lqWrite({ state: 'ended', correct: null, endedAt: firebase.firestore.FieldValue.serverTimestamp(), scores: lqPublicScores(s.scores) }, 'fields');
}
// Takes the game off every student's screen. Scores stay in the doc — it's
// the state flag students key off, so nothing is destroyed by clearing.
async function lqTeacherClose(){
  if(!lqTSession) return;
  if(typeof lqCcStopAudio === 'function') lqCcStopAudio();
  if(typeof lqHlStopAudio === 'function') lqHlStopAudio();
  await lqWrite({ state: 'off', correct: null, tally: null, scores: lqPublicScores(lqTSession.scores) }, 'fields');
}
