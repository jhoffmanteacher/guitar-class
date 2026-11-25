/* ════════════════════════════════════════════════════════════════════
   Guitar Class — LIVE GAMES "Saw chase"  (2026-11-25)

   Jonathan, 2026-11-24: "Animate that for the games and make it so the saw keeps catching up to the guitar if the
   class doesn't hit a certain threshold of correct answers" (his reference: Kahoot's Submarine Squad, the whole
   class against the game). A musical saw floats after a running guitarist. Each Reveal, a class at or above the
   goal lets the guitarist pull ahead; below it the saw gains. If the saw catches him, a gag (the saw shaves his
   guitar down to a ukulele, then bends its blade as if tuning itself) and the chase starts again: never a game
   over. It is for EVERY Live In-Class Game (all of LIVE_QUIZZES, and any added later), switched on and off in the
   console's strip.

   ── What it is NOT ──
   It is the console's own display, like "Hide names on the projector": the Reveal stage only (never the lobby,
   an open question or the final scores: `.claude/rules/live-quiz.md`, nothing on the stage during a question but
   the prompt and the answered-count), never on a student's screen, and NOTHING about it is ever written to
   liveQuiz/current or any other Firestore doc (no lqWrite, no lqPreviewWrite here; tools/live-saw-sim.mjs spies
   on both). No firestore.rules change. This file loads right after live-hilo.js on index.html only; every call
   into it from live-quiz.js is behind a `typeof` guard, and with the switch off the stage is byte-for-byte what it
   was before this file existed.

   ── The rules (Jonathan's answers, 2026-11-24, and the work order's fixed details) ──
   - The switch ("Saw chase", in the strip's every-state row) is OFF the first time. It is kept on this device
     (`gc-lq-sawchase`).
   - The goal ("Goal %", pre-start row, next to Questions, only while the switch is on): a whole number 1 to 100,
     default 70, blank or out of range = 70, kept on this device (`gc-lq-sawgoal`).
   - The class's percent on a round is of EVERYONE IN THE GAME (lqRoster), not only those who answered: a student
     who joined and did not answer is wrong. mc / fret / pcname: lqRightCount(s).n over the roster. changes: the
     Reveal's tally.caught over (the section's changes x the roster). Compared UNROUNDED, as whole numbers
     (right x 100 >= goal x everyone), so exactly 70 of 100 counts as making it. The caption rounds.
   - A NEW question type needs a rule in lqSawPercent() below; until it has one the chase draws but does not
     move, and tools/live-saw-sim.mjs fails (it walks every quiz in LIVE_QUIZZES).
   - The gap is counted in steps 0 to 5 and a game starts at 3. At or above the goal: +1, never past 5. Below it:
     -1. Reaching 0 is a catch: the gag plays and the gap goes back to 3. After the first catch the runner carries
     a ukulele for the rest of that game (a later catch shaves the ukulele; it stays one).
   - A round with nobody in the game moves nothing; neither does a round revealed while the switch was off (turning
     the switch on while a Reveal is showing marks that Reveal done without a move).
   - Each round's move is applied ONCE, the first time its Reveal is painted with the switch on. The state is kept
     in sessionStorage (`gc-lq-sawchase-state`), so a console reload neither replays nor re-applies a round. A new
     sessionId (a new game, or Preview, which has its own) starts again at 3, guitar.

   ── The trap: lqPaintStage() rebuilds the stage's innerHTML on EVERY snapshot ──
   A late answer doc or score write repaints a Reveal that is on screen, and an animation started inside that HTML
   would restart. So the animation is played from memory (lqSawAnim: the round, its kind, when it began): a repaint
   inside the animation's length draws the same animation with a NEGATIVE delay (so it carries on from where it
   was), and a repaint after it draws the end position with no animation at all. A reload has no lqSawAnim: end
   position only. `prefers-reduced-motion` also draws the end position only (styles.css).
   ════════════════════════════════════════════════════════════════════ */

const LQ_SAW_MAX = 5, LQ_SAW_START = 3, LQ_SAW_GOAL_DEFAULT = 70;
const LQ_SAW_KEY_ON = 'gc-lq-sawchase', LQ_SAW_KEY_GOAL = 'gc-lq-sawgoal', LQ_SAW_KEY_STATE = 'gc-lq-sawchase-state';
// How long each animation runs, in ms (the CSS in styles.css uses the same lengths).
const LQ_SAW_DUR = { gain: 1800, pull: 1600, catch: 2500 };

/* ── The two device settings ── */
function lqSawCleanGoal(v){
  const n = Math.round(Number(String(v == null ? '' : v).trim() === '' ? NaN : v));
  return Number.isFinite(n) && n >= 1 && n <= 100 ? n : LQ_SAW_GOAL_DEFAULT;
}
let lqTSawOn = false, lqTSawGoal = LQ_SAW_GOAL_DEFAULT;
try { lqTSawOn = localStorage.getItem(LQ_SAW_KEY_ON) === '1'; } catch(e){ lqTSawOn = false; }
try { lqTSawGoal = lqSawCleanGoal(localStorage.getItem(LQ_SAW_KEY_GOAL)); } catch(e){ lqTSawGoal = LQ_SAW_GOAL_DEFAULT; }

function lqSawSwitchHtml(){
  return `<label class="lq-ctl-lbl"><input type="checkbox" id="lq-sawchase"${lqTSawOn ? ' checked' : ''} onchange="lqSawSetOn(this.checked)"> Saw chase</label>`;
}
function lqSawGoalInputHtml(){
  if(!lqTSawOn) return '';
  return `<label class="lq-ctl-lbl">Goal % <input type="number" id="lq-sawgoal" class="lq-limit" min="1" max="100" step="1" inputmode="numeric" value="${lqTSawGoal}" onchange="lqSawSetGoal(this.value);this.value=lqTSawGoal"></label>`;
}
function lqSawSetGoal(v){
  lqTSawGoal = lqSawCleanGoal(v);
  try { localStorage.setItem(LQ_SAW_KEY_GOAL, String(lqTSawGoal)); } catch(e){}
}
function lqSawSetOn(on){
  lqTSawOn = !!on;
  try { localStorage.setItem(LQ_SAW_KEY_ON, lqTSawOn ? '1' : '0'); } catch(e){}
  // A Reveal already on the screen was revealed while the switch was off: it moves nothing.
  const s = typeof lqTSession !== 'undefined' ? lqTSession : null;
  if(lqTSawOn && s && s.state === 'reveal'){
    const st = lqSawState(s), q = Number(s.qIndex);
    if(!st.doneQ.includes(q)){
      const p = lqSawPercent(s, lqQuiz(s.quizId));
      st.doneQ.push(q);
      st.moves[q] = { k: 'none', pct: p.denom > 0 ? p.shown : null, goal: lqTSawGoal };
      lqSawSave(st);
    }
  }
  if(typeof lqPaintStage === 'function') lqPaintStage();
  if(typeof lqPaintControls === 'function') lqPaintControls();
}

/* ── The class's percent on this Reveal ── */
/* { known, right, denom, shown } — `known` false for a quiz type with no rule here (the chase then does not move);
   `denom` 0 when nobody is in the game; `shown` the whole percent for the caption. */
function lqSawPercent(s, quiz){
  const roster = lqRoster(s).length;
  const type = lqType(quiz);
  let right = 0, denom = 0, known = true;
  if(type === 'mc' || type === 'fret' || type === 'pcname'){
    right = lqRightCount(s).n; denom = roster;
  } else if(type === 'changes' && typeof lqCcCounted === 'function'){
    right = Number((s.tally || {}).caught) || 0; denom = lqCcCounted(s.cc).length * roster;
  } else {
    known = false;
  }
  right = Math.max(0, Math.min(right, denom));
  return { known, right, denom, shown: denom > 0 ? Math.round(100 * right / denom) : 0 };
}

/* ── The chase's state (this tab, this game) ── */
function lqSawState(s){
  const sid = String(s && s.sessionId != null ? s.sessionId : '');
  let st = null;
  try { st = JSON.parse(sessionStorage.getItem(LQ_SAW_KEY_STATE)); } catch(e){ st = null; }
  if(!st || st.sessionId !== sid || !Array.isArray(st.doneQ) || !st.moves || typeof st.moves !== 'object'){
    st = { sessionId: sid, gap: LQ_SAW_START, uke: false, doneQ: [], moves: {} };
    lqSawSave(st);
  }
  return st;
}
function lqSawSave(st){ try { sessionStorage.setItem(LQ_SAW_KEY_STATE, JSON.stringify(st)); } catch(e){} }

/* One round's move, applied to `st` (changes it). Returns the move record kept for the caption and the animation. */
function lqSawMove(st, p, goal){
  const from = st.gap;
  if(!p.known || p.denom <= 0) return { k: 'none', pct: p.denom > 0 ? p.shown : null, goal, from };
  if(p.right * 100 >= goal * p.denom){
    st.gap = Math.min(LQ_SAW_MAX, st.gap + 1);
    return { k: 'pull', pct: p.shown, goal, from };
  }
  if(st.gap - 1 <= 0){
    const swap = !st.uke;
    st.gap = LQ_SAW_START; st.uke = true;
    return { k: 'catch', pct: p.shown, goal, from, swap };
  }
  st.gap -= 1;
  return { k: 'gain', pct: p.shown, goal, from };
}

// The one animation in progress, in memory only: { key: '<sessionId>#<qIndex>', k, t0 (ms) }.
let lqSawAnim = null;
function lqSawNow(){ return Date.now(); }

/* The band for a Reveal. '' with the switch off (the stage is then exactly what it was). Called by lqStageRevealHtml(). */
function lqSawBandHtml(s, quiz){
  if(!lqTSawOn || !s) return '';
  const st = lqSawState(s), q = Number(s.qIndex), key = st.sessionId + '#' + q;
  if(!st.doneQ.includes(q)){
    const mv = lqSawMove(st, lqSawPercent(s, quiz), lqTSawGoal);
    st.doneQ.push(q); st.moves[q] = mv; lqSawSave(st);
    lqSawAnim = (mv.k === 'none') ? null : { key, k: mv.k, t0: lqSawNow() };
    if(typeof lqSawOnMove === 'function') lqSawOnMove(mv, s);   // the saw's sound (a later part of this file)
  }
  const mv = st.moves[q] || { k: 'none', pct: null, goal: lqTSawGoal };
  let kind = '', delay = 0;
  if(lqSawAnim && lqSawAnim.key === key && LQ_SAW_DUR[lqSawAnim.k]){
    const el = lqSawNow() - lqSawAnim.t0;
    if(el < LQ_SAW_DUR[lqSawAnim.k]){ kind = lqSawAnim.k; delay = -Math.max(0, el) / 1000; }
    else lqSawAnim = null;
  }
  const uke = st.uke;
  // `swap`: the guitar turns into a ukulele during THIS catch (the first one of the game).
  const swap = kind === 'catch' && mv.swap;
  const cls = 'lq-saw-track' + (kind ? ` lq-saw-a-${kind}` : '') + (swap ? ' lq-saw-swap' : '') + (uke ? ' lq-saw-uke' : '');
  const style = `--g:${st.gap};--f:${Math.max(0, Math.min(LQ_SAW_MAX, Number(mv.from) || st.gap))}${kind ? `;--d:${delay.toFixed(3)}s` : ''}`;
  const cap = mv.pct != null ? lqBilingualParams('lq.saw.caption', 'lq-saw-cap', { n: mv.pct, g: mv.goal }, { n: mv.pct, g: mv.goal }) : '';
  return `<div class="lq-saw" id="lq-saw">`
    + `<div class="${cls}" style="${style}" aria-hidden="true">${lqSawSawSvg()}${lqSawGuySvg(kind === 'catch')}</div>${cap}</div>`;
}

/* ── The art (original, drawn here: no known character, mascot or logo) ── */
// A ghostly musical saw: a violet handle with a face, a long S-bent blade with teeth.
function lqSawSawSvg(){
  return `<div class="lq-saw-saw"><svg viewBox="0 0 84 56" width="84" height="56" focusable="false">`
    + `<g class="lq-saw-blade"><path d="M16 28 C32 18 50 40 80 24 L80 32 C50 48 32 26 16 36 Z" fill="#dfe6f2" stroke="#ffffff" stroke-width="1"/>`
    + `<path d="M16 36 C32 26 50 48 80 32" fill="none" stroke="#8f9bb5" stroke-width="3" stroke-dasharray="2.2 2.6"/></g>`
    + `<circle cx="12" cy="32" r="11" fill="#7a5cff" stroke="#c9bcff" stroke-width="1.5"/>`
    + `<circle cx="8" cy="29" r="3.4" fill="#ffffff"/><circle cx="16.5" cy="29" r="3.4" fill="#ffffff"/>`
    + `<circle cx="9.2" cy="29.6" r="1.6" fill="#1a1442"/><circle cx="17.6" cy="29.6" r="1.6" fill="#1a1442"/>`
    + `<path d="M4 24.5 L10.5 26.5 M20 24.5 L13.5 26.5" stroke="#1a1442" stroke-width="1.6" stroke-linecap="round"/>`
    + `<path d="M7 37 Q12 33 17 37" fill="none" stroke="#1a1442" stroke-width="1.8" stroke-linecap="round"/></svg></div>`;
}
// The running guitarist (facing right) with his guitar, and the ukulele it can be shaved down to; wood chips on a catch.
function lqSawGuySvg(withChips){
  const chips = withChips ? '<div class="lq-saw-chips"><i></i><i></i><i></i><i></i><i></i><i></i></div>' : '';
  return `<div class="lq-saw-guy">${chips}<svg viewBox="0 0 80 60" width="80" height="60" focusable="false">`
    + `<g class="lq-saw-leg lq-saw-leg-a"><path d="M38 36 L30 56" stroke="#b6ff5e" stroke-width="5" stroke-linecap="round" fill="none"/></g>`
    + `<g class="lq-saw-leg lq-saw-leg-b"><path d="M38 36 L48 56" stroke="#b6ff5e" stroke-width="5" stroke-linecap="round" fill="none"/></g>`
    + `<path d="M38 18 L38 38" stroke="#ff4fa3" stroke-width="8" stroke-linecap="round"/>`
    + `<circle cx="39" cy="10" r="7.5" fill="#ffd9b0"/><path d="M31.5 9 Q39 -1 46.5 9 Q39 5 31.5 9 Z" fill="#ffd23f"/>`
    + `<circle cx="42.5" cy="10" r="1.2" fill="#1a1442"/>`
    + `<path d="M38 22 L52 30" stroke="#ffd9b0" stroke-width="3.5" stroke-linecap="round"/>`
    + `<g class="lq-saw-guitar"><path d="M46 38 C44 30 54 28 56 33 C60 31 64 36 60 41 C63 46 52 49 46 38 Z" fill="#ff8c42" stroke="#7a3b10" stroke-width="1.4"/>`
    + `<circle cx="54" cy="38" r="2" fill="#7a3b10"/><path d="M58 34 L77 22" stroke="#7a3b10" stroke-width="3" stroke-linecap="round"/></g>`
    + `<g class="lq-saw-ukulele"><path d="M47 38 C46 33 53 32 54 35 C57 34 60 37 57 41 C59 44 51 46 47 38 Z" fill="#ffd23f" stroke="#7a3b10" stroke-width="1.3"/>`
    + `<circle cx="53" cy="38.5" r="1.4" fill="#7a3b10"/><path d="M56 35 L68 28" stroke="#7a3b10" stroke-width="2.4" stroke-linecap="round"/></g>`
    + `</svg></div>`;
}
