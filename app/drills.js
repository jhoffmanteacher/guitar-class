/* ══════════════════════════════════════════════════════════════════════
   Practice rep tracking, Find-the-Note fretboard game, chord/PR practice
   panels, and the "Keep it sharp" spaced-review card.
   Persistence: practiceLog is its own category in the unified Firestore
   writer (queueSave/flushSave, top-level key `practiceLog`), with a
   localStorage mirror (key: practiceLog) that is ALWAYS written too — it
   is the store in dev-bypass mode and the fallback when a signed-in doc
   predates the field. loadProgress() prefers the Firestore value.
   ══════════════════════════════════════════════════════════════════════ */

/* ── Practice log: { [skillId]: {reps, todayCount, lastDay, last, best} } ── */
const REP_GOAL = 3;   // gentle daily target per skill — no timers, just dots
function loadLocalPracticeLog(){
  try{ return JSON.parse(localStorage.getItem(_uidKey('practiceLog'))) || {}; }catch(e){ return {}; }
}
let practiceLog = loadLocalPracticeLog();
function savePracticeLogLocal(){
  try{ localStorage.setItem(_uidKey('practiceLog'), JSON.stringify(practiceLog)); }catch(e){}
}
function savePracticeLog(){
  savePracticeLogLocal();   // offline/dev-bypass copy, always
  // Firestore write-through — but not for the dev-bypass user, whose uid the
  // Firestore rules reject (same guard pattern as bumpPracticeStreak).
  if(currentUser && !isDevBypassUser()) queueSave('practiceLog');
}
function repsToday(sid){
  const e = practiceLog[sid];
  return (e && e.lastDay === dayStr(new Date())) ? (e.todayCount || 0) : 0;
}
/* Whole-day distance from the last logged rep: 0 = today, 1 = yesterday,
   -1 = never practiced. Day-boundary based so "1 day ago" flips at midnight,
   not 24h after the rep. */
function daysSinceLastRep(sid){
  const e = practiceLog[sid];
  if(!e || !e.last) return -1;
  const a = new Date(); a.setHours(0,0,0,0);
  const b = new Date(e.last); b.setHours(0,0,0,0);
  return Math.max(0, Math.round((a - b) / 86400000));
}
function lastPracticedLabel(sid){
  const d = daysSinceLastRep(sid);
  if(d < 0)  return { key:'rep.lastNever',     params:null };
  if(d === 0) return { key:'rep.lastToday',     params:null };
  if(d === 1) return { key:'rep.lastYesterday', params:null };
  return { key:'rep.lastDays', params:{n:d} };
}
function logPracticeRep(sid, opts){
  if(isPeekedResponseKey(sid)) return;   // read-only preview of a locked set
  const today = dayStr(new Date());
  const e = practiceLog[sid] || (practiceLog[sid] = { reps:0 });
  if(e.lastDay !== today){ e.lastDay = today; e.todayCount = 0; }
  e.reps = (e.reps || 0) + 1;
  e.todayCount = (e.todayCount || 0) + 1;
  e.last = Date.now();
  if(opts && typeof opts.best === 'number') e.best = Math.max(e.best || 0, opts.best);
  savePracticeLog();
  refreshRepStrips(sid);
  refreshReviewCards();
  if(typeof srCheckComplete === 'function') srCheckComplete();
  if(typeof srRefreshIfOpen === 'function') srRefreshIfOpen();
}
function logCleanRep(sid, btnEl){
  logPracticeRep(sid);
  if(btnEl) flashClass(btnEl, 'rep-logged', 500);
}

/* ── tempo ladder helpers (practice.type === 'pr') ──
   The stored shape is the standard PR history array ({value,date}×≤8, see
   onResponseChange) under responses[`practice-<skillId>`]; these render it. */
function prHistoryValues(key){
  const raw = responses[key];
  if(Array.isArray(raw)) return raw.map(e => String(e && e.value != null ? e.value : '').trim()).filter(v => v !== '');
  return (raw != null && String(raw).trim() !== '') ? [String(raw).trim()] : [];
}
function prStatsInner(sid, unit){
  const vals = prHistoryValues(`practice-${sid}`);
  if(!vals.length) return `<span class="pr-none" data-i18n="pr.noneYet">${t('pr.noneYet')}</span>`;
  const unitTxt = t(unit === 'count' ? 'pr.unitCount' : 'pr.unitBpm');
  const latest = `${escHtml(vals[vals.length - 1])}&nbsp;${unitTxt}`;
  const nums = vals.map(v => parseFloat(v)).filter(n => !isNaN(n));
  const bestHtml = nums.length
    ? `<span class="rep-sep" aria-hidden="true">·</span><span class="pr-best">${t('pr.best', {v: `${escHtml(String(Math.max(...nums)))}&nbsp;${unitTxt}`})}</span>` : '';
  const histHtml = vals.length > 1
    ? `<span class="rep-sep" aria-hidden="true">·</span><span class="pr-history" title="${escAttr(t('pr.historyTitle'))}">${vals.map(escHtml).join(' &rarr; ')}</span>` : '';
  return `<span class="pr-latest">${t('pr.latest', {v: latest})}</span>` + bestHtml + histHtml;
}
/* Blur commits the edit session (same as the step PR textareas). If this
   session created/filled an entry, that's one practice rep. */
function onPracticePrBlur(sid){
  const key = `practice-${sid}`;
  const wasEditing = _prEditingKeys.has(key);
  onResponsePRBlur(key);
  const raw = responses[key];
  const lastVal = Array.isArray(raw) && raw.length ? String(raw[raw.length - 1].value || '').trim() : '';
  if(wasEditing && lastVal) logPracticeRep(sid);
  const el = document.getElementById('pr-stats-' + sid);
  if(el){
    el.innerHTML = prStatsInner(sid, el.dataset.unit === 'count' ? 'count' : 'BPM');
    if(typeof applyI18n === 'function') applyI18n(el);
  }
}

/* ── Rep strip: "Reps today: n of 3" dots · total · last practiced ── */
function repStripInner(sid){
  const e = practiceLog[sid] || {};
  const today = repsToday(sid);
  const total = e.reps || 0;
  const dots = Array.from({length: REP_GOAL}, (_, i) =>
    `<span class="rep-dot${i < today ? ' filled' : ''}"></span>`).join('');
  const last = lastPracticedLabel(sid);
  const goalMet = today >= REP_GOAL;
  return `<span class="rep-dots" aria-hidden="true">${dots}</span>` +
    `<span class="rep-count" data-i18n="rep.today" data-i18n-params='{"n":${today},"goal":${REP_GOAL}}'>${t('rep.today',{n:today,goal:REP_GOAL})}</span>` +
    (goalMet ? `<span class="rep-goal-note" data-i18n="rep.goalMet">${t('rep.goalMet')}</span>` : '') +
    `<span class="rep-sep" aria-hidden="true">·</span>` +
    `<span class="rep-total" data-i18n="rep.total" data-i18n-params='{"n":${total}}'>${t('rep.total',{n:total})}</span>` +
    `<span class="rep-sep" aria-hidden="true">·</span>` +
    `<span class="rep-last" data-i18n="${last.key}"${last.params ? ` data-i18n-params='${escAttr(JSON.stringify(last.params))}'` : ''}>${t(last.key, last.params)}</span>`;
}
function renderRepStrip(sid){
  const goalMet = repsToday(sid) >= REP_GOAL;
  return `<div class="rep-strip${goalMet ? ' rep-goal-met' : ''}" data-sid="${escAttr(sid)}">${repStripInner(sid)}</div>`;
}
function refreshRepStrips(sid){
  document.querySelectorAll(`.rep-strip[data-sid="${CSS.escape(sid)}"]`).forEach(el=>{
    el.innerHTML = repStripInner(sid);
    el.classList.toggle('rep-goal-met', repsToday(sid) >= REP_GOAL);
    if(typeof applyI18n === 'function') applyI18n(el);
  });
}

/* ── Find-the-Note game (practice.type === 'fretboard') ──
   practice.string: 'lowE' | 'A' | 'D' | 'G' | 'B' | 'highE' (single-string
   board) | 'both' (low E + A, prompts alternate) | 'all' (all six strings,
   each prompt picks a random string). Frets 0–12, natural notes only. A
   round = 5 prompts; a prompt scores if the FIRST click is right (wrong
   clicks flash red and let the student keep hunting — no timers, no
   lockout). Round end logs one rep and keeps a best score. */
const FG_ROUND = 5;
const FG_NATURALS = {
  lowE:  {0:'E',1:'F',3:'G',5:'A',7:'B',8:'C',10:'D',12:'E'},
  A:     {0:'A',2:'B',3:'C',5:'D',7:'E',8:'F',10:'G',12:'A'},
  D:     {0:'D',2:'E',3:'F',5:'G',7:'A',9:'B',10:'C',12:'D'},
  G:     {0:'G',2:'A',4:'B',5:'C',7:'D',9:'E',10:'F',12:'G'},
  B:     {0:'B',1:'C',3:'D',5:'E',6:'F',8:'G',10:'A',12:'B'},
  highE: {0:'E',1:'F',3:'G',5:'A',7:'B',8:'C',10:'D',12:'E'}
};
const FRET_STRING_KEY = { lowE:'fret.stringLowE', A:'fret.stringA', D:'fret.stringD', G:'fret.stringG', B:'fret.stringB', highE:'fret.stringHighE' };
/* Multi-string boards draw high strings on top (string 1 → 6), matching
   every other horizontal fretboard diagram on the site. */
function fgStringsFor(kind){
  if(kind === 'both') return ['A','lowE'];
  if(kind === 'all')  return ['highE','B','G','D','A','lowE'];
  return [kind];
}
function fgShuffle(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
const fretGames = {};

/* Clickable fretboard board — one row per string (1 for a single-string
   kind, 2 for 'both', 6 for 'all'). Same visual vocabulary as the reference
   fretboard (localStringFretboardSvg): nut, fret wires, inlay dots, fret
   numbers — prominent string lines and a transparent hit zone per
   string × fret. Rows compact themselves when there are 3+ strings so the
   'all' board still fits a Chromebook column.
   `opts` (all optional — every existing caller passes none, so their output
   is byte-identical): `strings` overrides `fgStringsFor(kind)` with an
   explicit kind list (the live quiz picks its own subset, so `kind` can be
   null); `clickFn` names the global the hit zones call instead of `fgClick`
   (the live quiz points them at `lqTap`); `hit:false` skips the hit-zone
   layer entirely for a static, unclickable board (the projector's reveal
   board). Marker ids stay `fgm-${sid}-${k}-${f}` regardless of caller.
   Two more for Note Call (step.drill 'notecall'): `noteAt(kind, fret)`
   labels every marker, sharps included (FG_NATURALS only knows the
   naturals, so a sharp fret would otherwise read ✕); `shade: [lo, hi]`
   greys out every column outside that fret range and drops its hit zone,
   so a drill on frets 5–8 shows the whole neck but only takes taps there.
   `hitStrings: [k…]` limits the hit zones to those strings (the rest are
   drawn only) — the power-chord Note Call draws all six strings but takes
   taps on the root strings. */
function fgBoardSvg(sid, kind, opts){
  opts = opts || {};
  const clickFn = opts.clickFn || 'fgClick';
  const strs = (opts.strings || fgStringsFor(kind)).filter(k => FG_NATURALS[k]);
  if(!strs.length) return '';
  const n = strs.length, multi = n > 1, compact = n >= 3;
  const W = 600, padR = 8, openW = 44, maxF = 12;
  const padL = multi ? 54 : 8;               // room for string labels on multi-string boards
  const rowGap = compact ? 24 : 34;
  const rowPad = compact ? 12 : 16;
  const mR     = compact ? 10.5 : 13;        // feedback-marker radius
  const mFont  = compact ? 10.5 : 11.5;
  const topY = compact ? 22 : 28;
  const stringYs = strs.map((_, i) => topY + i * rowGap);
  const wireTop = stringYs[0] - rowPad, wireBot = stringYs[n - 1] + rowPad;
  const numY = wireBot + (compact ? 16 : 18), H = numY + 8;
  const nutX = padL + openW;
  const fretW = (W - padL - padR - openW) / maxF;
  const colX = f => f === 0 ? padL : nutX + (f - 1) * fretW;
  const colW = f => f === 0 ? openW : fretW;
  const cx   = f => f === 0 ? padL + openW / 2 : nutX + (f - 0.5) * fretW;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" class="fg-svg" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">`;
  /* Inlay dots (below the lowest string so they read as fretboard markers) */
  FRETBOARD_INLAYS.forEach(f => {
    s += `<circle cx="${cx(f)}" cy="${wireBot + 1}" r="2.5" fill="var(--text3)" opacity="0.35"/>`;
    if(f === 12) s += `<circle cx="${cx(f)}" cy="${wireTop - 1}" r="2.5" fill="var(--text3)" opacity="0.35"/>`;
  });
  /* Fret wires + nut */
  for(let f = 1; f <= maxF; f++){
    const x = nutX + f * fretW;
    s += `<line x1="${x}" y1="${wireTop + 2}" x2="${x}" y2="${wireBot - 2}" stroke="var(--text3)" stroke-width="0.8"/>`;
  }
  s += `<rect x="${nutX - 2}" y="${wireTop}" width="4" height="${wireBot - wireTop}" fill="var(--text)" rx="1"/>`;
  /* The strings (+ labels when there's more than one) */
  strs.forEach((k, i) => {
    const y = stringYs[i];
    s += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="var(--green-text)" stroke-width="2.2"/>`;
    if(multi) s += `<text x="${padL - 6}" y="${y}" text-anchor="end" dominant-baseline="central" font-size="9" font-weight="600" fill="var(--green-text)">${escHtml(t(FRET_STRING_KEY[k]))}</text>`;
  });
  /* Fret numbers */
  for(let f = 0; f <= maxF; f++){
    s += `<text x="${cx(f)}" y="${numY}" text-anchor="middle" font-size="9" fill="var(--text2)">${f}</text>`;
  }
  const shaded = f => !!opts.shade && (f < opts.shade[0] || f > opts.shade[1]);
  if(opts.shade) for(let f = 0; f <= maxF; f++){
    if(shaded(f)) s += `<rect class="fg-shade" x="${colX(f)}" y="0" width="${colW(f)}" height="${H}"/>`;
  }
  /* Feedback markers (hidden until a click) + hit zones on top. The zones
     are in the Tab order (tabindex="0" role="button"); the role="button"
     keydown handler gives them Enter/Space. Their label is string + fret,
     never the note — naming the note is the game. */
  strs.forEach((k, i) => {
    const y = stringYs[i], map = FG_NATURALS[k];
    for(let f = 0; f <= maxF; f++){
      s += `<g class="fg-marker" id="fgm-${sid}-${k}-${f}">` +
        `<circle cx="${cx(f)}" cy="${y}" r="${mR}"/>` +
        `<text x="${cx(f)}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${mFont}" font-weight="700">${opts.noteAt ? escHtml(opts.noteAt(k, f)) : (map[f] || '&#x2715;')}</text>` +
      `</g>`;
    }
  });
  if(opts.hit !== false) strs.forEach((k, i) => {
    if(opts.hitStrings && opts.hitStrings.indexOf(k) < 0) return;
    const bandTop = multi ? stringYs[i] - rowGap / 2 : wireTop - 8;
    const bandH   = multi ? rowGap : (wireBot - wireTop) + 16;
    for(let f = 0; f <= maxF; f++){
      if(shaded(f)) continue;
      s += `<rect class="fg-hit" x="${colX(f)}" y="${bandTop}" width="${colW(f)}" height="${bandH}" rx="6" tabindex="0" role="button" onclick="${clickFn}('${sid}','${k}',${f})" aria-label="${escAttr(t(FRET_STRING_KEY[k]))} — ${escAttr(t('fret.fretN',{n:f}))}"><title>${escHtml(t('fret.fretN',{n:f}))}</title></rect>`;
    }
  });
  return s + '</svg>';
}
/* Prompts: per-string shuffled note pools. 'both' strictly alternates its
   two strings; 'all' picks a random string per prompt. */
function fgStart(sid){
  const wrap = document.getElementById('fg-' + sid);
  if(!wrap) return;
  const kind = wrap.dataset.kind || 'lowE';
  const strs = fgStringsFor(kind).filter(k => FG_NATURALS[k]);
  if(!strs.length) return;
  const pools = {};
  const refill = k => fgShuffle([...new Set(Object.values(FG_NATURALS[k]))]);
  strs.forEach(k => { pools[k] = refill(k); });
  const prompts = [];
  for(let i = 0; i < FG_ROUND; i++){
    const k = kind === 'all'
      ? strs[Math.floor(Math.random() * strs.length)]
      : strs[i % strs.length];
    if(!pools[k].length) pools[k] = refill(k);
    prompts.push({ str: k, note: pools[k].pop() });
  }
  fretGames[sid] = { kind, prompts, idx: 0, score: 0, missed: false, done: false, locked: false };
  fgRenderPrompt(sid);
}
function fgRenderPrompt(sid){
  const st = fretGames[sid];
  const wrap = document.getElementById('fg-' + sid);
  if(!st || !wrap) return;
  st.locked = false;   // fresh prompt on screen — re-enable clicks (guards the 650ms transition below)
  const p = st.prompts[st.idx];
  const pp = { note: p.note, string: t(FRET_STRING_KEY[p.str] || 'fret.stringLowE') };
  const cp = { i: st.idx + 1, total: FG_ROUND };
  wrap.querySelector('.fg-status').innerHTML =
    `<span class="fg-prompt" data-i18n-html="fret.findPromptHtml" data-i18n-params='${escAttr(JSON.stringify(pp))}'>${t('fret.findPromptHtml', pp)}</span>` +
    `<span class="fg-count" data-i18n="fret.promptCount" data-i18n-params='${escAttr(JSON.stringify(cp))}'>${t('fret.promptCount', cp)}</span>`;
  wrap.querySelector('.fg-fb').innerHTML = '';
}
function fgClick(sid, strKind, fret){
  const st = fretGames[sid];
  const wrap = document.getElementById('fg-' + sid);
  if(!st || st.done || st.locked || !wrap) return;
  const p = st.prompts[st.idx];
  const fb = wrap.querySelector('.fg-fb');
  const marker = document.getElementById(`fgm-${sid}-${strKind}-${fret}`);
  if(strKind === p.str && (FG_NATURALS[strKind] || {})[fret] === p.note){
    if(!st.missed) st.score++;
    st.missed = false;
    st.locked = true;   // hold input until the next prompt renders, so a click during the transition isn't scored against the wrong prompt
    if(marker) flashClass(marker, 'fg-good', 650);
    fb.innerHTML = `<span class="fg-fb-good" data-i18n="fret.gotIt">${t('fret.gotIt')}</span>`;
    st.idx++;
    if(st.idx >= FG_ROUND){
      st.done = true;
      setTimeout(()=>fgEnd(sid), 650);
    } else {
      setTimeout(()=>{ if(fretGames[sid] === st && !st.done) fgRenderPrompt(sid); }, 650);
    }
  } else {
    st.missed = true;
    if(marker) flashClass(marker, 'fg-bad', 650);
    fb.innerHTML = `<span class="fg-fb-bad" data-i18n="fret.notThatOne">${t('fret.notThatOne')}</span>`;
  }
}
function fgEnd(sid){
  const st = fretGames[sid];
  const wrap = document.getElementById('fg-' + sid);
  if(!st || !wrap) return;
  const praiseKey = st.score >= 4 ? 'fret.praiseHigh' : (st.score >= 3 ? 'fret.praiseMid' : 'fret.praiseLow');
  wrap.querySelector('.fg-status').innerHTML =
    `<span class="fg-score">${t('fret.roundScore',{score:st.score,total:FG_ROUND})} &mdash; ${t(praiseKey)}</span>` +
    `<button type="button" class="fg-start-btn" onclick="fgStart('${sid}')" data-i18n="fret.playAgain">${t('fret.playAgain')}</button>`;
  wrap.querySelector('.fg-fb').innerHTML = '';
  logPracticeRep(sid, { best: st.score });
  // A peeked (locked) set saves nothing (logPracticeRep), so a skill never
  // practised has no entry here: keep the line the panel was built with.
  const e = practiceLog[sid];
  if(e && e.best != null) wrap.querySelector('.fg-best').innerHTML =
    `<span data-i18n="fret.best" data-i18n-params='{"n":${e.best},"total":${FG_ROUND}}'>${t('fret.best',{n:e.best,total:FG_ROUND})}</span>`;
}

/* ── Shuffle Drill (step.drill, type 'shuffle') ──────────────────────────
   The digital twin of the paper shuffle self-quiz. A shuffled deck of frets
   is dealt one card at a time; the student says the note out loud AND taps
   it; the 3-second limit is the standard the Set 1 check-off tests.

   Module-data schema:
     drill: { type:'shuffle', string:'lowE'|'A'|…, rounds:10, seconds:3,
              maxFret:12, pile:'naturals'|'sharps', skill:'m2w1-s3' }

   Design calls (Jonathan, 2026-07-25):
   - TAP THE NOTE NAME, not 4-choice and not the mic. The whole pile is on
     screen (7 naturals, or 12 with sharps), so it stays recall rather than
     a 1-in-4 guess — Fret Zap already owns the multiple-choice version.
   - Running out of clock does NOT end the card: the ring turns red and
     counts up, and a right-but-late answer lands as "slow", not wrong.
     Only IN-TIME answers count toward the 10 — the 3-second standard stays
     intact without the drill snatching the card away mid-thought.
   - A miss OR a slow one is re-dealt 2–4 cards later: the paper move of
     tossing that slip back into the pile.
   - Best in-time score persists in the `games` save category
     (games.sd['<string>:<pile>']); at 90% the results screen offers the
     skill check-off instead of making them go hunt the checklist tab.
   State lives in `shuffleDrills[stepKey]`; a language switch rebuilds the
   module panels, which resets any in-flight round (same as the arcade). */
const SD_ROUNDS = 10;
const SD_LIMIT = 3;               // seconds — the check-off standard
const SD_NOTE_NAMES = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const SD_NATURALS = ['A','B','C','D','E','F','G'];
const SD_OPEN_MIDI = { lowE:40, A:45, D:50, G:55, B:59, highE:64 };
const SD_RING_LEN = 201;          // 2πr for the r=32 countdown ring
const SD_SLOW_MS = 2000;          // a hit this slow still lands in "drill these"
const shuffleDrills = {};

function sdNoteAt(kind, fret){ return SD_NOTE_NAMES[(SD_OPEN_MIDI[kind] + fret) % 12]; }
function sdStringName(kind){ return t(FRET_STRING_KEY[kind] || 'fret.stringLowE'); }
function sdBox(key){ return document.getElementById('sdr-' + key); }
/* The best is keyed per string + pile, and Module 2 (5 s) and Module 3 (3 s)
   share one key on purpose — a 3-second best counts toward the 5-second
   check-off. But the class activities' warm-up decks give 8 seconds
   (class-activities.js, `seconds: 8`), and drillGateBest() reads this same
   key, so a 10/10 at 8 seconds used to open the "I've got it" gate on a
   3-second skill. A limit above SD_SHARED_MAX_SECONDS saves under its own
   key ('lowE:naturals@8'), which the gate never reads; the drill's own
   "Best" line reads it back through the same function. */
const SD_SHARED_MAX_SECONDS = 5;
function sdPileKey(c){ return c.string + ':' + c.pile + (c.seconds > SD_SHARED_MAX_SECONDS ? '@' + c.seconds : ''); }
function sdSessionKey(c){ return 'sdBest:' + sdPileKey(c); }
/* Best = the higher of this browser session and the persisted all-time best,
   same rule the arcade cards use (a returning student sees their record, and
   dev-bypass/signed-out still gets a number). */
function sdBest(c){
  let s = 0;
  try { s = parseInt(sessionStorage.getItem(sdSessionKey(c)), 10) || 0; } catch(e){}
  return Math.max(s, ((games && games.sd) || {})[sdPileKey(c)] || 0);
}
function sdSaveBest(c, n){
  try {
    if((parseInt(sessionStorage.getItem(sdSessionKey(c)), 10) || 0) < n) sessionStorage.setItem(sdSessionKey(c), String(n));
  } catch(e){}
  // Firestore rejects the dev-bypass uid — session best above still counts.
  // Teacher mode is previewing a student's activity, not practising: the
  // session best above is enough, nothing is filed on the teacher's own doc.
  if(!currentUser || (typeof isDevBypassUser === 'function' && isDevBypassUser())) return;
  if(IS_TEACHER_MODE) return;
  if(!games.sd) games.sd = {};
  if((games.sd[sdPileKey(c)] || 0) >= n) return;
  games.sd[sdPileKey(c)] = n;
  games.sd.at = dayStr(new Date());
  saveGames();
}
function sdShuffle(a){
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/* Legal frets for the pile: the naturals pile drops every fret whose note
   carries a ♯, so the answer row stays one Chromebook line wide. */
function sdFrets(c){
  const out = [];
  for(let f = 0; f <= c.maxFret; f++){
    if(c.pile === 'naturals' && sdNoteAt(c.string, f).indexOf('♯') >= 0) continue;
    out.push(f);
  }
  return out;
}
function sdAnswerNames(c){ return c.pile === 'naturals' ? SD_NATURALS.slice() : SD_NOTE_NAMES.slice(); }

/* Called from stepsHtml — registers state and returns the setup screen. */
function renderShuffleDrill(drill, key, wid){
  /* Dispatcher for every step-level drill widget. 'shuffle' deals frets on
     one string (below); 'deck' deals any small card pile; 'ear' deals a
     hidden sequence and plays it. All three replaced a paper drill. */
  if(drill && drill.type === 'deck') return renderDeckDrill(drill, key, wid);
  if(drill && drill.type === 'ear')  return renderEarDrill(drill, key, wid);
  if(drill && drill.type === 'notecall') return renderNoteCall(drill, key, wid);
  if(drill && drill.type === 'chordcall') return renderChordCall(drill, key);
  if(drill && drill.type === 'pcname') return renderPowerName(drill, key);
  if(!drill || drill.type !== 'shuffle') return '';
  const prev = shuffleDrills[key];
  if(prev && prev.tick) clearInterval(prev.tick);
  // A round in flight schedules a setTimeout (sdAnswer → sdNext) that would
  // otherwise fire against this freshly-rebuilt (differently-shaped) state
  // and throw — cancel it along with the tick.
  if(prev && prev.pending) clearTimeout(prev.pending);
  shuffleDrills[key] = {
    phase: 'setup', tick: null, pending: null,
    cfg: {
      string:  drill.string || 'lowE',
      rounds:  drill.rounds || SD_ROUNDS,
      seconds: drill.seconds || SD_LIMIT,
      maxFret: drill.maxFret != null ? drill.maxFret : 12,
      /* A student's last pile choice sticks across a rebuild (language
         switch, tab revisit) — only the round itself resets. */
      pile:    (prev && prev.cfg && prev.cfg.pile) || drill.pile || 'naturals',
      skill:   drill.skill || null,
      wid:     wid
    }
  };
  // data-skill lets the shuffle-deck check-off gate find and scroll to this
  // deck from the checklist tab (drillGatePractice).
  const skillAttr = drill.skill ? ` data-skill="${escAttr(drill.skill)}"` : '';
  return `<div class="sdr" id="sdr-${escAttr(key)}"${skillAttr}>${sdSetupHtml(key)}</div>`;
}

function sdHeadHtml(key, right){
  const c = shuffleDrills[key].cfg;
  return `<div class="sdr-head">` +
    `<span>${escHtml(t('drill.head', { string: sdStringName(c.string), max: c.maxFret }))}</span>` +
    `<span class="sdr-meta">${escHtml(right)}</span></div>`;
}

function sdSetupHtml(key){
  const st = shuffleDrills[key];
  if(!st) return '';
  const c = st.cfg;
  const best = sdBest(c);
  const pill = (id, label) =>
    `<button type="button" class="sdr-pill${c.pile === id ? ' active' : ''}" onclick="sdPickPile('${key}','${id}')">${escHtml(label)}</button>`;
  return sdHeadHtml(key, t('drill.headMeta', { n: c.rounds, s: c.seconds })) +
    `<div class="sdr-body">` +
      `<div class="sdr-intro">${escHtml(t('drill.intro'))}</div>` +
      `<div class="sdr-pills">${pill('naturals', t('drill.pileNaturals'))}${pill('sharps', t('drill.pileSharps'))}</div>` +
      `<button type="button" class="sdr-start" onclick="sdStart('${key}')">&#x25B6; ${escHtml(t('drill.start'))}</button>` +
      (best ? `<div class="sdr-best"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M7 5H4.5A2.5 2.5 0 0 0 7 8.5"/><path d="M17 5h2.5A2.5 2.5 0 0 1 17 8.5"/><path d="M12 13v3"/><path d="M9 20h6"/><path d="M9.5 20 10 16h4l.5 4"/></svg> ${escHtml(t('drill.best', { n: best, total: c.rounds }))}</div>` : '') +
    `</div>`;
}

function sdPickPile(key, pile){
  const st = shuffleDrills[key], box = sdBox(key);
  if(!st || !box) return;
  st.cfg.pile = pile;
  box.innerHTML = sdSetupHtml(key);
}

function sdStart(key){
  const st = shuffleDrills[key], box = sdBox(key);
  if(!st || !box) return;
  // A previous round's pending "advance to next card" timeout could still be
  // in flight if Start/Again was clicked right after answering — cancel it
  // so it doesn't fire mid-new-round against the state we're about to reset.
  if(st.pending){ clearTimeout(st.pending); st.pending = null; }
  st.phase = 'play';
  st.round = 0; st.inTime = 0;
  st.results = []; st.requeue = []; st.deck = sdShuffle(sdFrets(st.cfg));
  st.locked = false;
  sdNext(key);
}

/* A missed/slow fret comes back 2–4 cards later; otherwise deal off the
   shuffled deck, reshuffling a fresh one when it runs out. */
function sdDraw(st){
  const due = st.requeue.findIndex(q => q.due <= st.round);
  if(due >= 0) return st.requeue.splice(due, 1)[0].fret;
  if(!st.deck.length) st.deck = sdShuffle(sdFrets(st.cfg));
  return st.deck.pop();
}

function sdNext(key){
  const st = shuffleDrills[key], box = sdBox(key);
  if(!st || !box) return sdStop(key);
  if(st.round >= st.cfg.rounds) return sdFinish(key);
  st.round++;
  st.cur = { fret: sdDraw(st), at: performance.now() };
  st.locked = false;
  box.innerHTML = sdPlayHtml(key);
  if(st.tick) clearInterval(st.tick);
  st.tick = setInterval(() => sdTick(key), 80);
}

function sdStop(key){
  const st = shuffleDrills[key];
  if(st && st.tick){ clearInterval(st.tick); st.tick = null; }
  if(st && st.pending){ clearTimeout(st.pending); st.pending = null; }
}
/* Navigating away (set switch, tab switch, closing In-Class Activities)
   stops every drill AND puts a mid-round one back on its setup screen.
   sdStop() alone cancelled the "next card" timeout of an answered card but
   left it locked in phase 'play' — and module panels are cached, so coming
   back found a frozen card with no Start button. Same shape as ncStopAll. */
function sdAbortAll(){
  Object.keys(shuffleDrills).forEach(k => {
    sdStop(k);
    const st = shuffleDrills[k];
    if(!st || st.phase !== 'play') return;
    st.phase = 'setup';
    const box = sdBox(k);
    if(box) box.innerHTML = sdSetupHtml(k);
  });
}

function sdPlayHtml(key){
  const st = shuffleDrills[key], c = st.cfg;
  const notes = sdAnswerNames(c).map(n =>
    `<button type="button" class="sdr-note${n.indexOf('♯') >= 0 ? ' sharp' : ''}" data-note="${escAttr(n)}" onclick="sdAnswer('${key}','${escAttr(n)}')">${escHtml(n)}</button>`
  ).join('');
  return sdHeadHtml(key, t('drill.round', { n: st.round, total: c.rounds })) +
    `<div class="sdr-body">` +
      `<div class="sdr-stage">` +
        `<div class="sdr-card" id="sdr-card-${key}">` +
          `<span class="sdr-card-kicker">${escHtml(t('drill.fret'))}</span>` +
          `<span class="sdr-card-fret">${st.cur.fret}</span>` +
        `</div>` +
        `<div class="sdr-ring" id="sdr-ring-${key}">` +
          `<svg width="74" height="74" viewBox="0 0 74 74" aria-hidden="true">` +
            `<circle cx="37" cy="37" r="32" fill="none" stroke="var(--border2)" stroke-width="6"></circle>` +
            `<circle cx="37" cy="37" r="32" fill="none" stroke="var(--purple-accent)" stroke-width="6" stroke-linecap="round" id="sdr-arc-${key}" stroke-dasharray="${SD_RING_LEN}" stroke-dashoffset="0"></circle>` +
          `</svg>` +
          `<span class="sdr-ring-num" id="sdr-num-${key}">${c.seconds}</span>` +
        `</div>` +
      `</div>` +
      `<div class="sdr-fb" id="sdr-fb-${key}" role="status" aria-live="polite">&nbsp;</div>` +
      `<div class="sdr-notes">${notes}</div>` +
    `</div>`;
}

/* Ring: drains over the limit, then turns red and counts UP — the card is
   never snatched away, but "you're past three seconds" is unmissable. */
function sdTick(key){
  const st = shuffleDrills[key];
  if(!st || st.phase !== 'play') return sdStop(key);
  if(!sdBox(key)) return sdStop(key);          // panel rebuilt under us
  if(st.locked) return;
  const limit = st.cfg.seconds * 1000;
  const gone = performance.now() - st.cur.at;
  const arc = document.getElementById('sdr-arc-' + key);
  const num = document.getElementById('sdr-num-' + key);
  const ring = document.getElementById('sdr-ring-' + key);
  const over = gone >= limit;
  if(arc) arc.setAttribute('stroke-dashoffset', String(SD_RING_LEN * Math.min(1, gone / limit)));
  if(num) num.textContent = over ? (gone / 1000).toFixed(1) : String(Math.ceil((limit - gone) / 1000));
  if(ring) ring.classList.toggle('over', over);
}

function sdAnswer(key, pick){
  const st = shuffleDrills[key];
  if(!st || st.phase !== 'play' || st.locked) return;
  const c = st.cfg;
  const ms = performance.now() - st.cur.at;
  const right = sdNoteAt(c.string, st.cur.fret);
  const ok = pick === right;
  const inTime = ok && ms <= c.seconds * 1000;
  st.locked = true;
  sdStop(key);
  st.results.push({ fret: st.cur.fret, note: right, ok: ok, inTime: inTime, ms: ms });
  if(inTime) st.inTime++;
  else st.requeue.push({ fret: st.cur.fret, due: st.round + 2 + Math.floor(Math.random() * 3) });

  const card = document.getElementById('sdr-card-' + key);
  const fb = document.getElementById('sdr-fb-' + key);
  if(card) card.classList.add(inTime ? 'hit' : (ok ? 'slow' : 'miss'));
  const box = sdBox(key);
  if(box) box.querySelectorAll('.sdr-note').forEach(b => {
    const n = b.getAttribute('data-note');
    if(n === right) b.classList.add('correct');
    else if(n === pick) b.classList.add('wrong');
  });
  if(fb){
    fb.className = 'sdr-fb ' + (inTime ? 'hit' : (ok ? 'slow' : 'miss'));
    fb.textContent = inTime
      ? t('drill.fbHit', { note: right, s: (ms / 1000).toFixed(1) })
      : ok
        ? t('drill.fbSlow', { note: right, s: (ms / 1000).toFixed(1), limit: c.seconds })
        : t('drill.fbMiss', { pick: pick, fret: st.cur.fret, note: right });
  }
  // The reward for a right answer is hearing the note you just named.
  if(ok && !window.coachMicLive && typeof playNote === 'function') playNote(SD_OPEN_MIDI[c.string] + st.cur.fret);   // never into a live Coach mic
  st.pending = setTimeout(() => { st.pending = null; sdNext(key); }, inTime ? 620 : 1500);
}

function sdFinish(key){
  const st = shuffleDrills[key], box = sdBox(key);
  if(!st || !box) return sdStop(key);
  st.phase = 'done';
  sdStop(key);
  const c = st.cfg;
  // A peeked set stays playable (the drill itself is view/practice content),
  // but the round's result must not persist — same invariant as toggleSkill.
  if(!isSetPeeking(c.wid)){
    sdSaveBest(c, st.inTime);
    sdRecordSkillBest(c, st.inTime);
  }

  /* "Drill these next" — every fret that was wrong, late, or just sluggish,
     worst first. This is the thing paper slips could never tell them. */
  const bad = {};
  st.results.forEach(r => {
    if(r.ok && r.inTime && r.ms <= SD_SLOW_MS) return;
    const e = bad[r.fret] || (bad[r.fret] = { fret: r.fret, note: r.note, misses: 0, slow: false });
    if(!r.ok) e.misses++; else e.slow = true;
  });
  const list = Object.keys(bad).map(k => bad[k])
    .sort((a, b) => (b.misses - a.misses) || (a.fret - b.fret));
  const hits = st.results.filter(r => r.ok);
  const avg = hits.length ? (hits.reduce((s, r) => s + r.ms, 0) / hits.length / 1000).toFixed(1) : '—';
  const pct = st.inTime / c.rounds;
  const verdict = pct >= 0.9 ? { cls:'good', key:'drill.verdictGood' }
                : pct >= 0.7 ? { cls:'mid',  key:'drill.verdictMid' }
                             : { cls:'mid',  key:'drill.verdictLow' };
  const rows = list.length
    ? list.map(b => `<div class="sdr-drill-row"><b>${escHtml(t('drill.rowFret', { fret: b.fret, note: b.note }))}</b>` +
        `<span>${escHtml(b.misses ? t('drill.rowMiss', { n: b.misses }) : t('drill.rowSlow'))}</span></div>`).join('')
    : `<div class="sdr-drill-row"><b>${escHtml(t('drill.clean'))}</b><span>${escHtml(t('drill.cleanNext'))}</span></div>`;
  const canCheck = c.skill && pct >= 0.9 && progress[c.skill] !== 'gotit';
  const checkHtml = canCheck
    ? `<button type="button" class="sdr-checkoff" onclick="sdCheckOff('${key}')">&#x2713; ${escHtml(t('drill.checkOff'))}</button>`
    : '';
  box.innerHTML = sdHeadHtml(key, t('drill.round', { n: c.rounds, total: c.rounds })) +
    `<div class="sdr-body">` +
      `<div class="sdr-score">${escHtml(t('drill.score', { n: st.inTime, total: c.rounds }))}</div>` +
      `<div class="sdr-score-sub">${escHtml(t('drill.scoreSub', { s: c.seconds, avg: avg }))}</div>` +
      `<div class="sdr-verdict ${verdict.cls}">${escHtml(t(verdict.key))}</div>` +
      `<div class="sdr-drill"><div class="sdr-drill-title">${escHtml(t('drill.drillTitle'))}</div>${rows}</div>` +
      checkHtml +
      `<div class="sdr-actions">` +
        `<button type="button" class="sdr-start" onclick="sdStart('${key}')">&#x21BB; ${escHtml(t('drill.again'))}</button>` +
        `<button type="button" class="sdr-btn2" onclick="sdBackToSetup('${key}')">${escHtml(t('drill.changePile'))}</button>` +
      `</div>` +
    `</div>`;
}

function sdBackToSetup(key){
  const st = shuffleDrills[key], box = sdBox(key);
  if(!st || !box) return;
  sdStop(key);
  st.phase = 'setup';
  box.innerHTML = sdSetupHtml(key);
}

/* 9-of-10 earns the offer to check the skill off right here, rather than
   sending them to the checklist tab to do it from memory. */
function sdCheckOff(key){
  const st = shuffleDrills[key];
  if(!st || !st.cfg.skill) return;
  if(progress[st.cfg.skill] !== 'gotit' && typeof toggleSkill === 'function'){
    if(toggleSkill(st.cfg.skill, st.cfg.wid, 'gotit') === false) return;   // coach gate opened instead — button stays live for a retry
  }
  const box = sdBox(key);
  const btn = box && box.querySelector('.sdr-checkoff');
  if(btn){
    btn.textContent = '✓ ' + t('drill.checkedOff');
    btn.classList.add('done');
    btn.disabled = true;
  }
}

/* ── "You've got it when:" gets its own typographic slot ─────────────────
   Jonathan, 2026-07-26, looking at a swept Challenge card: the success
   standard ran on from the last bullet in the same size and colour, so the
   card didn't "read cleanly." He weighed giving it a bullet against giving
   it a different treatment and chose the treatment (option B2 of the
   mockup): a thin rule pulls it off the left margin and out of the list's
   flow, the standard itself is italic and one shade quieter.

   That preserves his 2026-07-25 call — the standard stays OUTSIDE the list,
   "where it reads as a promise rather than a step" — while still separating
   it visually. Bulleting it would have reversed that.

   Done at render time on purpose. Wrapping it in the module data would mean
   editing ~195 cards × EN and ES, and every card written afterwards would
   have to remember the span. Here it is one regex, both languages, and
   restyling later (or dropping it) is a CSS change with no content sweep.

   Only the FIRST match is wrapped, and only up to the end of that sentence,
   so anything after it — a "No score —" note, a bonus line, a Song Journey
   link, a step-figure image — stays outside the rule, exactly where R4 puts
   it. Cards without the phrase are returned untouched. */
const GOT_IT_RE = /(You&#39;ve got it when:|You've got it when:|You’ve got it when:|Lo tienes cuando:)/;
/* ── Rep counter (practice-chunks work order, 2026-09-19) ──
   When the got-it-when BODY (not the whole step — a number earlier in the
   directions shouldn't trigger this; an In-Class Activity step, which is one
   line with no label since 2026-11-10, is read whole: wrapGotItWhen's
   wholeLine) names a small count — "three clean
   reps in a row", "3 times", "four clean loops" — render N tap dots under
   it. "9 of 10" is a drill score, not a rep count, and is excluded first.
   Whatever it can't confidently parse renders with no dots, same as today. */
const REP_NUM_WORDS = { two:2, three:3, four:4, five:5, dos:2, tres:3, cuatro:4, cinco:5 };
const REP_KEY_RE = /\b(times|in a row|back to back|clean (?:reps|loops)|veces|seguidas|seguidos|seguido)\b/i;
const REP_NUM_RE = new RegExp(`\\b(\\d|${Object.keys(REP_NUM_WORDS).join('|')})\\b`, 'gi');
/* The count is the LAST small number before the first rep keyword, within
   25 characters and the same sentence — not the first number in the
   sentence. Until 2026-09-28 the regex took the first number that had a
   keyword anywhere in the next 25 characters, so "Line 3, four times
   through" showed 3 dots, "the five pentatonic notes, two times each" showed
   5, and "no buzz on any of the four, three times in a row" showed 4 — nine
   cards, all wrong the same way in both languages, which is why 1bg's
   parity check never saw them. */
function repCountFromGotIt(bodyHtml){
  const txt = bodyHtml.replace(/<[^>]+>/g, ' ');
  if(/\b\d+\s*(?:of|de)\s*\d+\b/i.test(txt)) return 0;
  // "twice" names its own count with no trailing "times"/"in a row" to
  // anchor on — unlike "three times", saying "times" after it would read
  // oddly, so it needs its own check rather than joining REP_NUM_WORDS.
  if(/\btwice\b/i.test(txt)) return 2;
  const k = REP_KEY_RE.exec(txt);
  if(!k) return 0;
  let last = null;
  for(const m of txt.slice(0, k.index).matchAll(REP_NUM_RE)) last = m;
  if(!last) return 0;
  const gap = txt.slice(last.index + last[0].length, k.index);
  if(gap.length > 25 || gap.includes('.')) return 0;
  const raw = last[1].toLowerCase();
  const n = /^\d+$/.test(raw) ? Number(raw) : REP_NUM_WORDS[raw];
  return (n >= 2 && n <= 5) ? n : 0;
}
/* Dot fill state, keyed the same way caStepDone is — in-memory only, resets
   on reload. A lesson step re-derives full dots from `completed` instead of
   this map (see rep.isDone below), so it never needs a session entry at all. */
let repDotState = {};
function repDotsHtml(rep, n){
  if(rep.isDone){
    const dots = Array.from({length:n}).map(() => '<span class="rep-dot on" aria-hidden="true">&#9679;</span>').join('');
    return `<div class="rep-dots rep-dots-done${rep.line ? ' rep-dots-line' : ''}">${dots}</div>`;
  }
  const filled = repDotState[rep.key] || 0;
  const extraArg = rep.extra !== undefined ? `,${rep.extra}` : '';
  const dots = Array.from({length:n}, (_, i) => {
    const on = i < filled;
    return `<button type="button" class="rep-dot${on ? ' on' : ''}" aria-pressed="${on}" aria-label="${escAttr(t('rep.dotAria', {n: i + 1}))}" onclick="repDotTap(this,'${escAttr(rep.key)}',${n},${i + 1});if(${i + 1}>=${n})repDotFinish(this,'${rep.closestSel}','${rep.btnSel}','${escAttr(rep.id)}'${extraArg})">${on ? '&#9679;' : '&#9675;'}</button>`;
  }).join('');
  const resetHtml = `<button type="button" class="rep-dot-reset"${filled ? '' : ' hidden'} onclick="repDotReset(this)">${escHtml(t('rep.startOver'))}</button>`;
  return `<div class="rep-dots${rep.line ? ' rep-dots-line' : ''}" data-rep-key="${escAttr(rep.key)}">${dots}${resetHtml}</div>`;
}
// Fills the tapped dot and every one before it, then — once every dot is
// filled — drives the step's OWN Mark-done path (toggleStepDone /
// caMarkStepDone), so nothing new is stored: the last tap is just a
// same-effort stand-in for tapping the button that was already there.
function repDotTap(btn, key, n, idx){
  const wrap = btn.closest('.rep-dots');
  if(!wrap) return;
  repDotState[key] = Math.max(repDotState[key] || 0, idx);
  const filled = repDotState[key];
  wrap.querySelectorAll('.rep-dot').forEach((d, i) => {
    const on = i < filled;
    d.classList.toggle('on', on);
    d.setAttribute('aria-pressed', String(on));
    d.innerHTML = on ? '&#9679;' : '&#9675;';
  });
  const resetBtn = wrap.querySelector('.rep-dot-reset');
  if(resetBtn) resetBtn.hidden = filled === 0;
}
function repDotReset(btn){
  const wrap = btn.closest('.rep-dots');
  if(!wrap) return;
  repDotState[wrap.dataset.repKey] = 0;
  wrap.querySelectorAll('.rep-dot').forEach(d => { d.classList.remove('on'); d.setAttribute('aria-pressed', 'false'); d.innerHTML = '&#9675;'; });
  btn.hidden = true;
}
function repDotFinish(dotEl, closestSel, btnSel, id, extra){
  const li = dotEl.closest(closestSel);
  const btn = li && li.querySelector(btnSel);
  if(!btn || btn.classList.contains('is-done')) return;
  if(closestSel === '.step') toggleStepDone(btn, id);
  else if(btn.classList.contains('ca-focus-next')) caFocusGotIt(id, extra);   // Focus view (caIsFocus)
  else caMarkStepDone(btn, id, extra);
}
function wrapGotItWhen(html, rep){
  if(typeof html !== 'string') return html;
  const m = GOT_IT_RE.exec(html);
  /* An In-Class Activity step is ONE line with no "You've got it when:"
     label (Jonathan, 2026-11-10: "students don't read them anyway"): "Play
     Line 1 into Line 2 four times without stopping." caStepHtml() opts in
     (rep.wholeLine), so the count is read from the whole line and the dots
     go after it, flush with the line (rep-dots-line: there is no got-it rule
     to sit under). The module call does NOT opt in: a module step with a
     stray "three times" outside its got-it sentence must not grow dots.
     checks.mjs 1bg renders both: every activity step's dots match its line,
     and every module set draws the same number of dot groups as before. */
  if(!m){
    const n = (rep && rep.wholeLine) ? repCountFromGotIt(html) : 0;
    return n ? html + repDotsHtml(Object.assign({}, rep, { line: true }), n) : html;
  }
  const head = html.slice(0, m.index);
  const rest = html.slice(m.index + m[0].length);
  /* Stop at the first sentence end that is followed by more content, or at
     the first tag that starts the trailing matter — whichever comes first. */
  const tagAt = rest.search(/<(?:span|a|div|img)\b/i);
  let cut = rest.length;
  if(tagAt >= 0) cut = tagAt;
  const sentence = /\.(?=\s|$)/.exec(rest.slice(0, cut));
  if(sentence) cut = sentence.index + 1;
  const body = rest.slice(0, cut);
  const tail = rest.slice(cut);
  const n = rep ? repCountFromGotIt(body) : 0;
  const dotsHtml = n ? repDotsHtml(rep, n) : '';
  return head +
    `<span class="got-it"><span class="got-it-lab">${m[0]}</span>${body}</span>` +
    dotsHtml + tail;
}

/* ── Multiple-choice answer shuffle ──────────────────────────────────────
   Jonathan, 2026-07-26: "the quiz correct answer choices should be
   randomized. right now the correct answers are always the first one."

   Measured across all 237 graded MCs before this landed: the correct
   choice sat at position 1 in 34% of questions, position 2 in 50%,
   position 3 in 14%, and position 4 in just 2%. A student who simply
   never picked the last option was right 98% of the time.

   The order is DETERMINISTIC, seeded from the question's own English text
   — not Math.random(). That matters for three reasons:
   - The choice list re-renders constantly (tab switch, language toggle,
     a re-render after answering). A fresh random order each time would
     make the options jump under the student's finger.
   - A student who answers, leaves, and comes back must see the same
     arrangement, or their highlighted answer looks like it moved.
   - Jonathan sees the same order the class does, so "look at the third
     one" still works on the projector. (He chose this over a per-student
     shuffle for exactly that reason, 2026-07-26.)

   Seeding on the English text, never the Spanish, keeps the order
   identical in both languages — the ES label rides along on the original
   index, same as the persisted value does.

   Catch-all options ("All of them", "All of the pick", "None") are pinned
   to their original slot and the rest shuffle around them, so a question
   whose last option summarises the others still reads correctly. The
   pattern deliberately does NOT pin ordinary answers that merely start
   with "All"/"Both" ("All 6 strings", "Both on E string") — pinning those
   would freeze a real answer in place, which is the bug, not the fix.
   Ratified narrow (Jonathan, 2026-08-04): pin genuine catch-alls only;
   ordinary compound answers shuffle. */
const MC_PINNED = /^(all|none|both|neither)\s+of\b|^(none|all)$/i;
/* Catch-alls the regex can't classify without over-matching ordinary answers
   ("All three notes at once, as a chord" in module-9 is a real distractor,
   not a summary). Content-coupled: reword one of these choices in module
   data and this entry must change with it — nothing enforces the link. */
const MC_PINNED_EXACT = new Set([
  'All three show note sequences',                     // module-4
  "Anywhere — the thumb doesn't affect your fingers",  // module-2
]);
function mcHash(str){
  let h = 2166136261;
  for(let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mcSeed(r){ return (r.prompt || '') + '|' + (r.choices || []).join('|'); }
/* Returns the ORIGINAL indices of `choices`, in display order. */
function mcOrder(choices, seedStr){
  if(!Array.isArray(choices) || choices.length < 3) return (choices||[]).map((c,i)=>i);
  const pinned = choices.map(c => {
    const s = String(c).trim();
    return MC_PINNED.test(s) || MC_PINNED_EXACT.has(s);
  });
  const movable = [];
  choices.forEach((c,i)=>{ if(!pinned[i]) movable.push(i); });
  let s = mcHash(seedStr) || 1;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  for(let i = movable.length - 1; i > 0; i--){
    const j = Math.floor(rnd() * (i + 1));
    const tmp = movable[i]; movable[i] = movable[j]; movable[j] = tmp;
  }
  let m = 0;
  return choices.map((c,i) => pinned[i] ? i : movable[m++]);
}

/* ── Card Deck drill (step.drill, type 'deck') ───────────────────────────
   The digital twin of the paper flashcard/slip drills — the same job the
   Shuffle Drill above does for frets, generalised to any small pile.

   Module-data schema:
     drill: { type:'deck', deck:'numerals-C', rounds:<int>, skill:'m11w1-s2' }

   Design calls (Jonathan, 2026-07-26 — "there are things like this that
   require paper. can they be made digital?"):
   - TWO-SIDED decks keep the paper move that matters: the back is hidden
     until the student taps, so "answer out loud before checking" survives.
     One-sided decks just deal a prompt and take a self-report.
   - Self-report, not auto-grading. What's being checked is whether they
     PLAYED the chord — the app can't see that, and a 4-choice quiz would
     turn recall into recognition. Fret Zap already owns multiple choice.
   - "Put it back" re-deals that card 3 cards later: the paper move of
     tossing the slip back into the pile. Only first-try hits score.
   - Best run persists in the `games` save category (games.dk['<deckId>']);
     at 100% the results screen offers the skill check-off inline.
   Decks live here rather than in module data so the ES twin comes from
   i18n instead of being duplicated card-for-card in every module file. */
const DECKS = {
  'numerals-C': { kicker:'deck.kNumeral', back:'deck.kChord', hint:'deck.hPlayIt',
    cards:[{f:'I',b:'C'},{f:'ii',b:'Dm'},{f:'iii',b:'Em'},{f:'IV',b:'F'},{f:'V',b:'G'},{f:'vi',b:'Am'}] },
  'numerals-letitbe': { kicker:'deck.kNumeral', back:'deck.kChord', hint:'deck.hPlayIt',
    cards:[{f:'I',b:'C'},{f:'V',b:'G'},{f:'vi',b:'Am'},{f:'IV',b:'F'}] },
  'relative-pairs': { kicker:'deck.kMajorKey', back:'deck.kRelMinor', hint:'deck.hSayIt',
    cards:[{f:'C',b:'Am'},{f:'G',b:'Em'},{f:'F',b:'Dm'},{f:'D',b:'Bm'},{f:'A',b:'F#m'}] },
  'minor-keys-box1': { kicker:'deck.kKey', back:'deck.kBoxFret', hint:'deck.hFindBox',
    cards:[{f:'Am',b:'5'},{f:'Gm',b:'3'},{f:'Bm',b:'7'},{f:'Dm',b:'10'}] },
  /* Module 9's D- and G-string drills (its only users): the back gives
     both frets, D string first, so the student can check an answer. */
  'naturals': { kicker:'deck.kNote', back:'deck.kFretDG', hint:'deck.hFindNote',
    cards:[{f:'A',b:'7 · 2'},{f:'B',b:'9 · 4'},{f:'C',b:'10 · 5'},{f:'D',b:'0 / 12 · 7'},{f:'E',b:'2 · 9'},{f:'F',b:'3 · 10'},{f:'G',b:'5 · 0 / 12'}] },
  /* One string's natural notes, with the fret on the back so the student
     can check where they landed (2026-09-29: the class activities dealt the
     one-sided `naturals` deck, which never shows an answer — checks.mjs 1bi).
     The open note is at fret 0 and fret 12, and either counts. */
  'naturals-lowE': { kicker:'deck.kNote', back:'deck.kFretLowE', hint:'deck.hFindNote',
    cards:[{f:'E',b:'0 / 12'},{f:'F',b:'1'},{f:'G',b:'3'},{f:'A',b:'5'},{f:'B',b:'7'},{f:'C',b:'8'},{f:'D',b:'10'}] },
  'naturals-A': { kicker:'deck.kNote', back:'deck.kFretA', hint:'deck.hFindNote',
    cards:[{f:'A',b:'0 / 12'},{f:'B',b:'2'},{f:'C',b:'3'},{f:'D',b:'5'},{f:'E',b:'7'},{f:'F',b:'8'},{f:'G',b:'10'}] },
  'naturals-plus': { kicker:'deck.kNote', back:'deck.kFretDG', hint:'deck.hFindNote',
    cards:[{f:'A',b:'7 · 2'},{f:'B',b:'9 · 4'},{f:'C',b:'10 · 5'},{f:'D',b:'0 / 12 · 7'},{f:'E',b:'2 · 9'},{f:'F',b:'3 · 10'},{f:'G',b:'5 · 0 / 12'},{f:'F#',b:'4 · 11'},{f:'Bb',b:'8 · 3'}] },
  'keys-IIVV': { kicker:'deck.kKey', hint:'deck.hPlayIIVV',
    cards:[{f:'G'},{f:'A'},{f:'C'},{f:'D'},{f:'E'}] },
  'key-inventory': { kicker:'deck.kChordSet', back:'deck.kKey', hint:'deck.hNameKey',
    cards:[{f:'G · C · D · Em',b:'G'},{f:'C · F · G · Am',b:'C'},{f:'D · G · A · Bm',b:'D'},{f:'Am · F · G · C',b:'C / Am'}] },
  'power-chord-shapes': { kicker:'deck.kPlayChord', hint:'deck.hPlayChord', cards:[{f:'A5'},{f:'G5'},{f:'C5'},{f:'D5'}] },
  'e5-vs-emajor': { kicker:'deck.kPlayChord', hint:'deck.hPlayChord', cards:[{f:'E5'},{f:'E'},{f:'E5'},{f:'E'}] },
  'chords-group1': { kicker:'deck.kChordName', hint:'deck.hPlayIt', cards:[{f:'C'},{f:'G'},{f:'Am'},{f:'F'}] },
  'chords-m4': { kicker:'deck.kChordName', hint:'deck.hPlayIt', cards:[{f:'C'},{f:'G'},{f:'Am'},{f:'F'},{f:'D'},{f:'A'},{f:'Em'},{f:'Bm'},{f:'Dm'},{f:'G/B'}] }
};
const deckDrills = {};
function dkBox(key){ return document.getElementById('dkr-' + key); }
function dkShuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const x=a[i]; a[i]=a[j]; a[j]=x; } return a; }
function dkBest(id){
  let s=0; try{ s=parseInt(sessionStorage.getItem('dkBest:'+id),10)||0; }catch(e){}
  return Math.max(s, ((games && games.dk) || {})[id] || 0);
}
function dkSaveBest(id, n){
  try{ if((parseInt(sessionStorage.getItem('dkBest:'+id),10)||0) < n) sessionStorage.setItem('dkBest:'+id, String(n)); }catch(e){}
  if(!currentUser || (typeof isDevBypassUser === 'function' && isDevBypassUser())) return;
  if(IS_TEACHER_MODE) return;   // preview, not practice — see sdSaveBest
  if(!games.dk) games.dk = {};
  if((games.dk[id]||0) >= n) return;
  games.dk[id] = n;
  games.dk.at = dayStr(new Date());   // mirrors games.sd.at — last-practised stamp
  if(typeof saveGames === 'function') saveGames();
}
function renderDeckDrill(drill, key, wid){
  const def = DECKS[drill.deck];
  if(!def) return '';
  deckDrills[key] = { phase:'setup', cfg:{ id:drill.deck, def, skill:drill.skill||null, wid } };
  return `<div class="sdr dkr" id="dkr-${escAttr(key)}">${dkSetupHtml(key)}</div>`;
}
function dkHead(key, right){
  const st = deckDrills[key];
  return `<div class="sdr-head"><span>${escHtml(t('deck.' + st.cfg.id))}</span>` +
    `<span class="sdr-meta">${escHtml(right)}</span></div>`;
}
function dkSetupHtml(key){
  const st = deckDrills[key]; if(!st) return '';
  const total = st.cfg.def.cards.length, best = dkBest(st.cfg.id);
  return dkHead(key, t('deck.headMeta', { n: total })) +
    `<div class="sdr-body">` +
      `<div class="sdr-intro">${escHtml(t(st.cfg.def.back ? 'deck.introTwo' : 'deck.introOne'))}</div>` +
      `<button type="button" class="sdr-start" onclick="dkStart('${key}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="4" y="7" width="12" height="15" rx="2"/><rect x="8" y="3" width="12" height="15" rx="2"/></svg> ${escHtml(t('deck.start'))}</button>` +
      (best ? `<div class="sdr-best"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M7 5H4.5A2.5 2.5 0 0 0 7 8.5"/><path d="M17 5h2.5A2.5 2.5 0 0 1 17 8.5"/><path d="M12 13v3"/><path d="M9 20h6"/><path d="M9.5 20 10 16h4l.5 4"/></svg> ${escHtml(t('deck.best', { n: best, total }))}</div>` : '') +
    `</div>`;
}
function dkStart(key){
  const st = deckDrills[key]; if(!st) return;
  st.phase='run'; st.deck = dkShuffle(st.cfg.def.cards); st.i=0; st.hit=0;
  st.total = st.cfg.def.cards.length; st.shown=false;
  st.seen = new Set();   // cards already presented once — a later "Had it" doesn't count toward the first-try score
  dkBox(key).innerHTML = dkRunHtml(key);
}
function dkRunHtml(key){
  const st = deckDrills[key], def = st.cfg.def, c = st.deck[st.i];
  const front = st.shown && def.back ? c.b : c.f;
  const kicker = st.shown && def.back ? def.back : def.kicker;
  const sub = st.shown && def.back ? c.f : '';
  return dkHead(key, t('deck.cardOf', { n: st.i + 1, total: st.deck.length })) +
    `<div class="sdr-body">` +
      /* role/tabindex only while it IS clickable (an unflipped card): the
   delegated Enter/Space handler below picks up any [role="button"], and a
   flipped card has no onclick to reach. The Start button underneath does
   the same job, so this is about the card being the obvious big target. */
      `<div class="dkr-card${st.shown ? ' flipped' : ''}"${st.shown ? '' : ` role="button" tabindex="0" onclick="dkFlip('${key}')"`}>` +
        `<div class="sdr-card-kicker">${escHtml(t(kicker))}</div>` +
        `<div class="dkr-face${dkFaceClass(front)}">${escHtml(dkFaceText(front))}</div>` +
        (sub ? `<div class="dkr-sub">${escHtml(sub)}</div>` : '') +
      `</div>` +
      (st.shown
        ? `<div class="dkr-row">` +
            `<button type="button" class="dkr-btn good" onclick="dkNext('${key}',1)">&#x2713; ${escHtml(t('deck.hadIt'))}</button>` +
            `<button type="button" class="dkr-btn again" onclick="dkNext('${key}',0)">&#x21BB; ${escHtml(t('deck.putBack'))}</button>` +
          `</div>`
        : `<div class="dkr-prompt">${escHtml(t(def.hint))}</div>` +
          `<button type="button" class="sdr-start" onclick="dkFlip('${key}')">${escHtml(t(def.back ? 'deck.check' : 'deck.done'))}</button>`) +
    `</div>`;
}
/* A card face is one big word at 2.6rem — but a fret-pair back like
   "0 / 12 · 7" is ~165px there, wider than the 162px face, and it wrapped
   as "5 · 0 /" over "12". Faces past 6 characters drop to a smaller size
   and stay on one line; past 11 (a four-chord progression) they may wrap,
   but only between items: " / " is glued with no-break spaces so "0 / 12"
   (one fret, two names) is never split. */
function dkFaceText(s){ return String(s).replace(/ \/ /g, '\u00a0/\u00a0'); }
function dkFaceClass(s){ const n = String(s).length; return n > 11 ? ' long wrap' : n > 6 ? ' long' : ''; }
function dkFlip(key){
  const st = deckDrills[key]; if(!st || st.shown) return;
  st.shown = true; dkBox(key).innerHTML = dkRunHtml(key);
}
function dkNext(key, ok){
  const st = deckDrills[key]; if(!st) return;
  const c = st.deck[st.i];
  const firstTry = !st.seen.has(c);
  st.seen.add(c);
  if(ok){ if(firstTry) st.hit++; }
  else {
    // Only requeue if at least one other card can land between this draw and
    // the redeal — otherwise (a miss on the last card of the pass) there's
    // nothing to interpose and splicing here would redeal it immediately.
    const remaining = st.deck.length - st.i - 1;
    if(remaining > 0) st.deck.splice(Math.min(st.deck.length, st.i + 3), 0, c);
  }
  st.i++; st.shown = false;
  if(st.i >= st.deck.length){ st.phase='done'; if(!isSetPeeking(st.cfg.wid)) dkSaveBest(st.cfg.id, st.hit); dkBox(key).innerHTML = dkDoneHtml(key); }
  else dkBox(key).innerHTML = dkRunHtml(key);
}
function dkDoneHtml(key){
  const st = deckDrills[key], clean = st.hit === st.total;
  const canCheck = clean && st.cfg.skill && progress[st.cfg.skill] !== 'gotit';
  return dkHead(key, t('deck.done')) +
    `<div class="sdr-body">` +
      `<div class="sdr-score">${st.hit} / ${st.total}</div>` +
      `<div class="sdr-score-sub">${escHtml(t('deck.scoreSub'))}</div>` +
      `<div class="sdr-verdict ${clean ? 'good' : 'mid'}">${escHtml(t(clean ? 'deck.verdictGood' : 'deck.verdictMid'))}</div>` +
      `<div class="dkr-row">` +
        `<button type="button" class="dkr-btn" onclick="dkStart('${key}')">&#x21BB; ${escHtml(t('deck.again'))}</button>` +
        (canCheck ? `<button type="button" class="dkr-btn good sdr-checkoff" onclick="dkCheckOff('${key}')">${escHtml(t('drill.checkOff'))}</button>` : '') +
      `</div>` +
    `</div>`;
}
function dkCheckOff(key){
  const st = deckDrills[key]; if(!st || !st.cfg.skill) return;
  if(progress[st.cfg.skill] !== 'gotit' && typeof toggleSkill === 'function'){
    if(toggleSkill(st.cfg.skill, st.cfg.wid, 'gotit') === false) return;   // coach gate opened instead — button stays live for a retry
  }
  const btn = dkBox(key) && dkBox(key).querySelector('.sdr-checkoff');
  if(btn){ btn.textContent = '✓ ' + t('drill.checkedOff'); btn.classList.add('done'); btn.disabled = true; }
}

/* ── Ear Spark drill (step.drill, type 'ear') ────────────────────────────
   Replaces the "shuffle six paper slips, record yourself, play it back a
   few minutes later" Ear Sparks. The deck draws a hidden sequence and
   plays it through the same playNote() guitar voice the TAB players use,
   so there is nothing to write down, nothing to record, and no waiting.

   Module-data schema:
     drill: { type:'ear', pool:'openStrings'|'lowEFrets', draw:5, skill:null }

   Design calls (Jonathan, 2026-07-26):
   - The sequence is never shown before the reveal — that hiddenness IS the
     drill, and it's the one thing paper slips were actually providing.
   - Replay is unlimited and unscored. This is an optional 2-minute ear
     bonus, not a check-off; pressure belongs in the Shuffle Drill.
   - Answers go in as taps in order, with undo, so a student who hears
     note 4 first isn't forced to guess note 1 to get there. */
const EAR_POOLS = {
  openStrings: { midis:[40,45,50,55,59,64], labels:['E','A','D','G','B','e'], kicker:'ear.kString',
                 // Named strings on the pads: EN low E … high e, ES solfège (ear.kStringHint says the same)
                 labelKeys:['games.fret.string.lowE','games.fret.string.A','games.fret.string.D','games.fret.string.G','games.fret.string.B','games.fret.string.highE'] },
  lowEFrets:   { midis:[40,41,42,43,44,45], labels:['0','1','2','3','4','5'], kicker:'ear.kFret' },
  // A-string vs D-string bass under Am (module-8.js, m8w2 Station C) — a
  // 2-option pool, same shape as the binary-choice style of lowEFrets, just
  // with 2 distinct values instead of 6.
  amBassAD:    { midis:[45,50], labels:['A','D'], kicker:'ear.kBassString', labelKeys:['games.fret.string.A','games.fret.string.D'] }
};
// A pool's pad/reveal label: the translated string name when it has labelKeys, else the raw label.
function earLabel(pool, i){ return pool.labelKeys ? t(pool.labelKeys[i]) : pool.labels[i]; }
const earDrills = {};
function erBox(key){ return document.getElementById('err-' + key); }
function erStop(key){
  const st = earDrills[key];
  if(st && st.timeouts) st.timeouts.forEach(clearTimeout);
}
function erStopAll(){
  Object.keys(earDrills).forEach(erStop);
}
function renderEarDrill(drill, key, wid){
  const pool = EAR_POOLS[drill.pool];
  if(!pool) return '';
  erStop(key);   // a re-render (new set, language toggle) must not leave the old card's notes playing
  // skill: optional, same job as the Shuffle/Deck drills' cfg.skill — a
  // clean reveal (every note named right) offers the check-off inline
  // instead of sending the student to the checklist tab to do it from memory.
  earDrills[key] = { phase:'setup', cfg:{ pool, poolId: drill.pool, draw: drill.draw || 5, skill: drill.skill || null, wid }, timeouts: [] };
  return `<div class="sdr err" id="err-${escAttr(key)}">${erSetupHtml(key)}</div>`;
}
function erHead(key, right){
  const st = earDrills[key];
  return `<div class="sdr-head"><span>${ICO_BOLT} ${escHtml(t('ear.' + st.cfg.poolId))}</span>` +
    `<span class="sdr-meta">${escHtml(right)}</span></div>`;
}
function erSetupHtml(key){
  const st = earDrills[key]; if(!st) return '';
  return erHead(key, t('ear.headMeta', { n: st.cfg.draw })) +
    `<div class="sdr-body">` +
      `<div class="sdr-intro">${escHtml(t('ear.intro', { n: st.cfg.draw }))}</div>` +
      `<button type="button" class="sdr-start" onclick="erStart('${key}')">&#x25B6; ${escHtml(t('ear.start'))}</button>` +
    `</div>`;
}
function erStart(key){
  const st = earDrills[key]; if(!st) return;
  const pool = st.cfg.pool, idx = [];
  for(let i=0;i<st.cfg.draw;i++) idx.push(Math.floor(Math.random()*pool.midis.length));
  st.phase='run'; st.seq = idx; st.guesses = new Array(st.cfg.draw).fill(null); st.revealed = false;
  erBox(key).innerHTML = erRunHtml(key);
  erPlay(key);
}
function erPlay(key){
  const st = earDrills[key]; if(!st) return;
  // Same guard as playSequence/playBeat/strumChord. The round stays dealt and
  // its "Play again" button works once the mic is off.
  if(window.coachMicLive) return;  // demo audio would score itself while the Coach listens
  if(typeof stopAllDemoAudio === 'function') stopAllDemoAudio();
  (st.timeouts || []).forEach(clearTimeout);
  st.timeouts = [];
  st.seq.forEach((n, i) => st.timeouts.push(setTimeout(() => playNote(st.cfg.pool.midis[n]), i * 1100)));
}
function erRunHtml(key){
  const st = earDrills[key], pool = st.cfg.pool;
  const slots = st.seq.map((n, i) => {
    const g = st.guesses[i];
    let cls = 'err-slot';
    if(st.revealed) cls += (g === n ? ' correct' : ' wrong');
    else if(g != null) cls += ' filled';
    return `<div class="${cls}">${escHtml(st.revealed ? earLabel(pool, n) : (g != null ? earLabel(pool, g) : ''))}</div>`;
  }).join('');
  if(st.revealed){
    const right = st.seq.filter((n, i) => st.guesses[i] === n).length;
    const clean = right === st.cfg.draw;
    const canCheck = clean && st.cfg.skill && progress[st.cfg.skill] !== 'gotit';
    return erHead(key, t('ear.revealed')) +
      `<div class="sdr-body"><div class="err-slots">${slots}</div>` +
        `<div class="sdr-score">${right} / ${st.cfg.draw}</div>` +
        `<div class="sdr-score-sub">${escHtml(t('ear.scoreSub'))}</div>` +
        `<div class="dkr-row">` +
          `<button type="button" class="dkr-btn" onclick="erPlay('${key}')">&#x25B6; ${escHtml(t('ear.hearAgain'))}</button>` +
          `<button type="button" class="dkr-btn" onclick="erStart('${key}')">&#x21BB; ${escHtml(t('ear.dealMore'))}</button>` +
          (canCheck ? `<button type="button" class="dkr-btn good sdr-checkoff" onclick="erCheckOff('${key}')">${escHtml(t('drill.checkOff'))}</button>` : '') +
        `</div></div>`;
  }
  const filled = st.guesses.filter(g => g != null).length;
  const pads = pool.labels.map((l0, i) =>
    `<button type="button" class="sdr-note" onclick="erGuess('${key}',${i})">${escHtml(earLabel(pool, i))}</button>`).join('');
  return erHead(key, t('ear.named', { n: filled, total: st.cfg.draw })) +
    `<div class="sdr-body"><div class="err-slots">${slots}</div>` +
      `<div class="err-pads">${pads}</div>` +
      `<div class="dkr-row">` +
        `<button type="button" class="dkr-btn" onclick="erPlay('${key}')">&#x25B6; ${escHtml(t('ear.playAgain'))}</button>` +
        `<button type="button" class="dkr-btn" onclick="erUndo('${key}')">&#x2190; ${escHtml(t('ear.undo'))}</button>` +
        (filled === st.cfg.draw ? `<button type="button" class="dkr-btn good" onclick="erReveal('${key}')">${escHtml(t('ear.check'))}</button>` : '') +
      `</div>` +
      `<div class="dkr-prompt">${escHtml(t('ear.' + pool.kicker.split('.')[1] + 'Hint'))}</div>` +
    `</div>`;
}
function erGuess(key, i){
  const st = earDrills[key]; if(!st || st.revealed) return;
  const slot = st.guesses.indexOf(null);
  if(slot < 0) return;
  st.guesses[slot] = i; erBox(key).innerHTML = erRunHtml(key);
}
function erUndo(key){
  const st = earDrills[key]; if(!st || st.revealed) return;
  let last = -1;
  st.guesses.forEach((g, i) => { if(g != null) last = i; });
  if(last < 0) return;
  st.guesses[last] = null; erBox(key).innerHTML = erRunHtml(key);
}
function erReveal(key){
  const st = earDrills[key]; if(!st) return;
  st.revealed = true; st.phase = 'done'; erBox(key).innerHTML = erRunHtml(key);
}
/* 100%-clean reveal earns the offer to check the skill off right here,
   the same "no memory trip to the checklist tab" move as sdCheckOff/
   dkCheckOff use for the other two drill types. */
function erCheckOff(key){
  const st = earDrills[key];
  if(!st || !st.cfg.skill) return;
  if(progress[st.cfg.skill] !== 'gotit' && typeof toggleSkill === 'function'){
    if(toggleSkill(st.cfg.skill, st.cfg.wid, 'gotit') === false) return;   // coach gate opened instead — button stays live for a retry
  }
  const box = erBox(key);
  const btn = box && box.querySelector('.sdr-checkoff');
  if(btn){
    btn.textContent = '✓ ' + t('drill.checkedOff');
    btn.classList.add('done');
    btn.disabled = true;
  }
}

