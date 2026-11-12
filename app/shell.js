/* ══════════ Shared modal plumbing ══════════
   Six overlays (report a problem, Daily 5, module assessment, the Coach and
   drill check-off gates, the class-activity reminder) declare
   role="dialog" aria-modal="true" — a promise to assistive tech that the
   rest of the page is unavailable while they're up. Only one of them was
   keeping it: five never moved focus in, none moved it back, and nothing
   marked the page behind them inert. A student on a keyboard who hit the
   check-off gate kept focus on the step underneath, could Tab through the
   whole page behind the dim, and landed on <body> when it closed.

   openOverlay/closeOverlay do the three things every dialog owes: move
   focus in, keep Tab inside, put focus back where it came from. The Escape
   handling each overlay already had is left alone. The header sits outside
   #app, so both are marked inert — matching how the rail drawer already
   does it on narrow screens. */
let _overlayReturnFocus = null;
const OVERLAY_FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
function _overlayBehind(){
  return [document.getElementById('app'), document.querySelector('header.header')].filter(Boolean);
}
function openOverlay(ov, firstFocus){
  _overlayReturnFocus = document.activeElement;
  _overlayBehind().forEach(el => { el.inert = true; });
  ov.addEventListener('keydown', overlayTrapTab);
  const target = firstFocus || ov.querySelector(OVERLAY_FOCUSABLE);
  // preventScroll: focusing a control inside a fixed overlay must not scroll
  // the page underneath it back to the top.
  if(target && target.focus) { try{ target.focus({preventScroll:true}); }catch(e){ target.focus(); } }
}
function closeOverlay(){
  _overlayBehind().forEach(el => { el.inert = false; });
  const back = _overlayReturnFocus;
  _overlayReturnFocus = null;
  // The element may have been re-rendered away while the dialog was open
  // (marking a skill rebuilds its row), so check it's still in the document.
  if(back && document.contains(back) && back.focus){
    try{ back.focus({preventScroll:true}); }catch(e){ back.focus(); }
  }
}
function overlayTrapTab(e){
  if(e.key !== 'Tab') return;
  const items = [...e.currentTarget.querySelectorAll(OVERLAY_FOCUSABLE)]
    .filter(el => el.offsetWidth || el.offsetHeight || el === document.activeElement);
  if(!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
}

function openIssueModal(){
  closeIssueModal();
  const ov=document.createElement('div');
  ov.className='daily5-overlay';
  ov.id='issue-overlay';
  ov.innerHTML=`<div class="daily5-modal" role="dialog" aria-modal="true" aria-label="${escAttr(t('btn.reportProblem'))}">${buildIssueModalHtml()}</div>`;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeIssueModal(); });
  document.body.appendChild(ov);
  document.addEventListener('keydown', issueEscClose);
  openOverlay(ov, document.getElementById('issue-text'));
}
function issueEscClose(e){ if(e.key==='Escape') closeIssueModal(); }
let _issueCloseTimer = null;   // the "Sent ✓" auto-close — see submitIssueReport
function closeIssueModal(){
  clearTimeout(_issueCloseTimer); _issueCloseTimer = null;
  const ov=document.getElementById('issue-overlay');
  if(!ov) return;
  ov.remove();
  document.removeEventListener('keydown', issueEscClose);
  closeOverlay();
}
async function submitIssueReport(){
  const ta = document.getElementById('issue-text');
  const status = document.getElementById('issue-status');
  const btn = document.getElementById('issue-submit-btn');
  const message = ((ta && ta.value) || '').trim();
  if(!message){
    if(status){ status.textContent = t('issue.emptyWarn'); status.className = 'issue-status err'; }
    return;
  }
  if(btn){ btn.disabled = true; btn.textContent = t('issue.sending'); }
  if(status){ status.textContent = ''; status.className = 'issue-status'; }
  /* No retryable timeout here. add() can't be cancelled: on a stalled network
     it stays queued and lands once the connection is back, so a "couldn't
     send — try again" after 10 s used to turn the student's second press into
     a duplicate report. Instead the button stays disabled (one send per open
     form) and after 10 s the status says it is still on its way. Only a real
     rejection — nothing written — re-enables it. `cancelled`: this form was
     closed (closeIssueModal removes it) or replaced by a new one; a send
     still waiting on the SDK then sends nothing, and a late answer touches
     nothing. */
  const cancelled = ()=>!(ta && document.contains(ta));
  const slowT = setTimeout(()=>{
    if(!cancelled() && status){ status.textContent = t('issue.stillSending'); status.className = 'issue-status'; }
  }, 10000);
  try{
    await ensureDb();
    if(cancelled()) return;
    await db.collection('issueReports').add({
      uid: currentUser.uid,
      email: currentUser.email || '',
      name: currentUser.displayName || '',
      message,
      location: currentReportContext(),
      moduleNum: lastModuleNum,
      setId: lastSetId,
      lang: getLang(),
      userAgent: navigator.userAgent,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    clearTimeout(slowT);
    if(cancelled()) return;
    if(status){ status.textContent = t('issue.sent'); status.className = 'issue-status ok'; }
    if(ta) ta.disabled = true;
    if(btn) btn.remove();
    /* Cancelled by closeIssueModal(): closing and reopening inside the 2.2 s
       used to have this close the NEW form and lose what was typed. Armed
       only while this send's own form is still up, for the same reason. */
    clearTimeout(_issueCloseTimer);
    if(ta && document.contains(ta)) _issueCloseTimer = setTimeout(closeIssueModal, 2200);
  } catch(e){
    // A real rejection (rules, the SDK never loaded): nothing was written,
    // so trying again cannot duplicate it.
    clearTimeout(slowT);
    if(cancelled()) return;
    if(status){ status.textContent = t('issue.failed'); status.className = 'issue-status err'; }
    if(btn){ btn.disabled = false; btn.textContent = t('issue.submit'); }
  }
}

/* ══════════ "Which class are you in?" ══════════
   Every student is tagged Period 4, Period 7, or CAS so the teacher
   dashboard can be filtered by period. The student answers for themselves,
   once, into
   progress/{uid}.period; the teacher fixes a wrong tap from the console,
   but that correction lands in config/class.periodOverrides instead, because
   firestore.rules gives the teacher read-only access to a student's progress
   doc on purpose. See the globals near the top of this file.

   It BLOCKS, unlike every other overlay here: no backdrop click, no Escape,
   no ✕. A dismissed modal means an untagged student, and an untagged student
   is invisible to a period-filtered dashboard — which is the whole point of
   asking. The one way past it without answering is Sign out, for the shared
   Chromebook where the last student never signed themselves out.

   Returns true if it put the modal up, so showApp can hold back the
   class-activity reminder rather than stack two dialogs. */
function maybeShowPeriodPicker(){
  if(studentPeriod || periodOverride) return false;          // answered, or the teacher already tagged them
  if(isDevBypassUser() || isGatePreviewer()) return false;    // dev bypass and the teacher previewing the student app
  if(progressLoadFailed) return false;                        // never ask a question we can't save the answer to
  if(document.getElementById('period-overlay')) return false;
  const ov=document.createElement('div');
  ov.className='daily5-overlay';
  ov.id='period-overlay';
  ov.innerHTML=`<div class="daily5-modal period-modal" role="dialog" aria-modal="true" aria-labelledby="period-title">
      <div class="daily5-head"><h3 id="period-title" style="font:inherit;margin:0" data-i18n="period.title">${escHtml(t('period.title'))}</h3></div>
      <p class="coach-tip" data-i18n="period.body">${escHtml(t('period.body'))}</p>
      <div class="period-choices">
        <button type="button" class="panel-next-btn period-btn" id="period-btn-4" onclick="periodPick('4')" data-i18n="period.p4">${escHtml(t('period.p4'))}</button>
        <button type="button" class="panel-next-btn period-btn" onclick="periodPick('7')" data-i18n="period.p7">${escHtml(t('period.p7'))}</button>
        <button type="button" class="panel-next-btn period-btn" onclick="periodPick('CAS')" data-i18n="period.pCAS">${escHtml(t('period.pCAS'))}</button>
      </div>
      <div class="issue-status" id="period-status" aria-live="polite"></div>
      <div class="period-out"><button type="button" class="period-signout" onclick="signOut()" data-i18n="period.wrongAccount">${escHtml(t('period.wrongAccount'))}</button></div>
    </div>`;
  document.body.appendChild(ov);
  if(typeof applyI18n === 'function') applyI18n(ov);
  openOverlay(ov, document.getElementById('period-btn-4'));
  return true;
}
async function periodPick(value){
  if(value!=='4' && value!=='7' && value!=='CAS') return;
  const ov=document.getElementById('period-overlay'); if(!ov) return;
  const status=document.getElementById('period-status');
  const btns=[...ov.querySelectorAll('.period-btn')];
  btns.forEach(b=>{ b.disabled=true; });
  if(status){ status.textContent=''; status.className='issue-status'; }
  studentPeriod=value;
  queueSave('period');
  clearTimeout(saveTimer);   // the modal is waiting on this write — don't sit out the 800ms debounce
  /* Bounded (see withTimeout): on a stalled network the write never settles
     and the buttons would stay disabled forever. Out of time counts as not
     landed — the dirty set can't say so here, because the stalled run took
     'period' with it. If that write lands later, flushSave closes the picker. */
  let timedOut = false;
  try { await withTimeout(flushSave(), 8000); } catch(e){ timedOut = true; }
  /* flushSave never throws: it catches, re-queues the keys it couldn't write
     and arms its own retry. So "did it land?" is read off the dirty set
     rather than a try/catch — which keeps this on the one shared save path
     instead of opening a second writer for a single field. studentPeriod is
     NOT rolled back on failure: it is the student's answer either way, and
     the queued retry needs the real value, not an empty one.
     A successful save — here, or via flushSave's own later auto-retry —
     closes the picker and refreshes the gate itself (see flushSave). */
  if(timedOut || _dirtyKeys.has('period')){
    btns.forEach(b=>{ b.disabled=false; });
    if(status){ status.textContent=t('period.failed'); status.className='issue-status err'; }
    return;
  }
  /* Dev bypass never queues a real write (queueSave() clears the dirty set
     itself, see there), so flushSave() returns before its own hook ever
     runs and the overlay is still up — close it here so the picker isn't
     stuck open under dev bypass. A no-op when flushSave's hook already
     handled it. */
  if(document.getElementById('period-overlay')){
    closePeriodPicker();
    refreshOpenClassActivitiesScreen();
    applyActivityGate();   // picking CAS lifts the gate even off this screen
  }
}
function closePeriodPicker(){
  const ov=document.getElementById('period-overlay');
  if(!ov) return;
  ov.remove();
  closeOverlay();
}

// Teacher (signed into the student app as the class teacher) and the localhost
// dev-bypass user can preview every set/review without working through the
// sequential gate — they're checking content, not taking the class.
function isGatePreviewer(){
  if(typeof isDevBypassUser==='function' && isDevBypassUser()) return true;
  return !!(currentUser && typeof TEACHER_EMAIL!=='undefined' && currentUser.email===TEACHER_EMAIL);
}

function isModuleReviewLocked(moduleNum){
  const sets = SETS.filter(w=>w.moduleNum===moduleNum);
  if(!sets.length) return true;
  if(isGatePreviewer()) return false;                 // teacher/dev: always open
  if(sets.some(w=>w.locked||w.comingSoon)) return true;
  const allSkills = sets.flatMap(w=>w.skills||[]);
  if(!allSkills.length) return true;
  if(progressLoadFailed) return false;               // never re-lock on a guess, same as isSetLocked
  return !allSkills.every(s=>progress[s.id]==='gotit');
}

// A set counts as "finished" once every one of its trackable skills is marked
// "I've got it!" — the same bar Module Review uses. A set that isn't built yet
// (static locked/comingSoon) never counts as finished, so it holds the gate.
function isSetComplete(w){
  if(!w || w.locked || w.comingSoon) return false;
  const skills = w.skills || [];
  if(!skills.length) return true;
  return skills.every(s=>progress[s.id]==='gotit');
}

// Has the student actually worked in this set? Any skill they've touched
// (either column of the checklist) or any step they've marked done counts.
// A locked set can't be opened, so progress inside one is proof they had
// access to it at some point.
function hasProgressIn(w){
  if(!w) return false;
  if((w.skills||[]).some(s=>progress[s.id]==='gotit' || progress[s.id]==='working')) return true;
  const prefix = w.id + '-';
  return Object.keys(completed||{}).some(k=>completed[k]===true && k.startsWith(prefix));
}

// Cross-module gate: a module's Set 1 stays locked until the PREVIOUS module
// is fully done — every built set complete AND every Module Review
// self-rating row rated. Module 13 (String Changing) sits outside the chain
// entirely: it's a single-flow module, always open, blocks nothing. Existing
// progress anywhere in a module (any set skill, any step, any review rating)
// keeps that module open for good — same never-re-lock principle as
// hasProgressIn/isSetLocked below.
function isModuleGateLocked(moduleNum){
  if(moduleNum <= 1) return false;                 // Module 1 is the start
  if(moduleNum === 13) return false;               // String Changing: outside the chain, always open
  if(isGatePreviewer()) return false;
  if(progressLoadFailed) return false;             // never re-lock on a guess
  if(moduleNum <= classOpenThrough()) return false;   // teacher's "Open through Module N" (per student or class-wide)
  // Existing progress anywhere in THIS module keeps it open (never re-lock)
  const mySets = SETS.filter(w=>w.moduleNum===moduleNum);
  if(mySets.some(w=>hasProgressIn(w))) return false;
  const myMr = MODULE_REVIEWS[moduleNum];
  if(myMr && (myMr.skills||[]).some(s=>{ const v=progress[s.id]; return v==='1'||v==='2'||v==='3'; })) return false;
  // Previous module: every BUILT set complete...
  const prevNum = moduleNum - 1;
  const prevSets = SETS.filter(w=>w.moduleNum===prevNum && !w.locked && !w.comingSoon);
  if(!prevSets.length) return true;                // nothing built to complete yet — hold the gate
  if(!prevSets.every(w=>isSetComplete(w))) return true;
  // ...and every Module Review self-rating row rated (if a review exists)
  const mr = MODULE_REVIEWS[prevNum];
  if(mr && (mr.skills||[]).length){
    return !(mr.skills.every(s=>{ const v=progress[s.id]; return v==='1'||v==='2'||v==='3'; }));
  }
  return false;
}

// Sequential gate: a set stays locked until the set before it (in module order)
// is finished, so students work a module in order — the same lock-until-complete
// idea as Module Review, applied to every set. The first set of a module is
// gated on the PREVIOUS MODULE being fully done (isModuleGateLocked) instead —
// see that function's own header for what "fully done" means and the Module 13
// carve-out.
//
// The gate is a HIGH-WATER MARK, not a live derivation: once a student has
// worked in a set it never re-locks. Previously this was computed purely from
// current state, so demoting one skill back to "still working on it" re-locked
// the FOLLOWING set even when that set was already finished — the checklist's
// two columns are a deliberate toggle pair, so that's an invited action (and a
// trackpad mis-tap does it). A single tap in Set 1 could hide a completed Set 2
// behind a lock while Sets 3 and 4 stayed open, and activateSet's backstop then
// refused to reopen it. Punishing honest self-correction is exactly backwards —
// we want students marking "still working on it" freely.
function isSetLocked(w){
  if(!w) return true;
  if(w.locked || w.comingSoon) return true;          // static/unbuilt stays locked for everyone
  if(isGatePreviewer()) return false;                // teacher/dev: skip the sequential gate
  if(progressLoadFailed) return false;               // we don't know what they've done — never re-lock on a guess
  if(w.moduleNum < classOpenThrough()) return false;   // a module the teacher let them skip: every set open
  const moduleSets = SETS.filter(x=>x.moduleNum===w.moduleNum);
  const idx = moduleSets.indexOf(w);
  if(hasProgressIn(w)) return false;                 // already been here — never lock them back out
  if(idx<=0) return isModuleGateLocked(w.moduleNum); // first set: gated on the PREVIOUS MODULE
  return !isSetComplete(moduleSets[idx-1]);
}

// The set immediately before w in its module (for "finish X first" hints).
function prevSetLabel(w){
  const arr = SETS.filter(x=>x.moduleNum===w.moduleNum);
  return (arr[arr.indexOf(w)-1] || {}).label || t('nav.prevSet');
}

// True when w is a module's Set 1 held closed by the cross-module gate (not
// the ordinary in-module set-to-set gate) — the case that gets module-flavored
// gate strings ("finish Module N") instead of set-flavored ones ("finish Set 1").
function isModuleGateCase(w){
  if(!w) return false;
  const moduleSets = SETS.filter(x=>x.moduleNum===w.moduleNum);
  return moduleSets.indexOf(w)<=0 && isModuleGateLocked(w.moduleNum);
}

// {num, mod} for the module-flavored gate strings — the previous module's
// number and localized name.
function prevModuleGateParams(w){
  const num = w.moduleNum - 1;
  const m = MODULE_MANIFEST.find(x=>x.num===num);
  return { num, mod: m ? tf(m,'name') : '' };
}

// Is this set's panel currently open in read-only peek mode? DOM-derived
// (the 'set-peek' class on its .week-panel) rather than a tracked variable —
// same reasoning as syncExploreNav. Every write path reachable from inside a
// set panel (toggleSkill, toggleStepDone, drill best-score saves) checks this
// before touching progress/completed/games, so a peek can never leave a mark
// even if the CSS pointer-events:none disable is bypassed by keyboard input
// or future markup drift.
function isSetPeeking(wid){
  const p = document.querySelector(`.week-panel[data-id="${CSS.escape(wid)}"]`);
  return !!(p && p.classList.contains('set-peek'));
}
/* The same question for a saved ANSWER, which is keyed rather than handed a
   set id: `${setId}-${station}-sec…` for a step's response and
   `practice-${skillId}` for a checklist practice quiz, and a skill id opens
   with its set id — so a peeked panel's id is a prefix of every key written
   from inside it. Until 2026-10-01 the three response writers
   (onResponseChange, onStepMcSelect, onPracticeMcSelect) had no guard at
   all, despite the comment above: a student locked out of Module 3 could
   open its read-only preview, tap a graded quiz choice, and the answer was
   saved to their progress under a Module 3 key. It unlocked nothing
   (hasProgressIn reads skills and completed steps, both guarded), but it
   left response keys in a module "nobody had reached", which is the
   assumption every mid-year content edit rests on. */
function isPeekedResponseKey(key){
  const k = String(key || '').replace(/^practice-/, '');
  return Array.from(document.querySelectorAll('.week-panel.set-peek'))
    .some(p => p.dataset.id && k.startsWith(p.dataset.id + '-'));
}

// Tiny transient toast for gate hints — makes its own element and self-dismisses.
let _gateToastTimer = null;
function gateToast(msg){
  let el = document.getElementById('gate-toast');
  if(!el){
    el = document.createElement('div');
    el.id = 'gate-toast';
    el.setAttribute('role','status');
    el.setAttribute('aria-live','polite');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  if(_gateToastTimer) clearTimeout(_gateToastTimer);
  _gateToastTimer = setTimeout(()=>el.classList.remove('show'), 2800);
}

/* Every module change takes a ticket; only the most recently issued one may
   touch state after its await (same pattern as teacher.js's
   loadTeacherClassConfig). ensureModuleRendered fetches a <script>, so two
   overlapping calls resolve in file-size order, not call order: renderAll fires
   onModuleChange(1, …) un-awaited, the student picks Module 7 before module-1.js
   lands, the smaller module-7.js wins the race — and then Module 1's
   continuation repaints the pills and activates a Module 1 set underneath a
   dropdown reading "Module 7". A stale ticket now just bails. */
let _moduleChangeReq = 0;
async function onModuleChange(moduleNum, restoreSetId, opts){
  moduleNum = parseInt(moduleNum);
  const req = ++_moduleChangeReq;
  const prevModuleNum = lastModuleNum, prevSetId = lastSetId;
  lastModuleNum = moduleNum;
  // Drop a last-set id belonging to the module we're leaving. The dropdown's
  // onchange calls saveProgress() without awaiting us, so a flush landing
  // before activateSet would otherwise persist the new module paired with the
  // old module's set id — a pair that restores to nothing next login.
  if(lastSetId !== `mr${moduleNum}` && !SETS.some(w=>w.id===lastSetId && w.moduleNum===moduleNum)) lastSetId = null;
  document.getElementById('module-select').value = moduleNum;
  // Fetch + build this module's panels on first visit before showing them.
  try{
    await ensureModuleRendered(moduleNum);
  }catch(e){
    // module-N.js never arrived (offline + not precached, or a bad deploy).
    // Bail quietly back to the module still on screen rather than let the
    // rejection escape into the global safety net's "Something went wrong"
    // banner over a blank pane — this call is fired un-awaited from renderAll,
    // the dropdown's onchange and songHubGoModule, so nothing else catches it.
    console.warn('[guitar-class] module '+moduleNum+' failed to load', e);
    if(req === _moduleChangeReq){
      lastModuleNum = prevModuleNum; lastSetId = prevSetId;
      const sel = document.getElementById('module-select');
      if(sel) sel.value = prevModuleNum;
      /* Say something. Swallowing the rejection removed the only signal a
         student used to get here (the global unhandledrejection banner), and
         on the very first render there is no module already on screen to fall
         back to — so without this they'd sit looking at an empty pane with no
         explanation and no retry. Re-picking the same module in the dropdown
         fires no change event, so the toast has to name the retry. */
      gateToast(t('module.loadFailed'));
    }
    return;
  }
  if(req !== _moduleChangeReq) return;   // a newer module change is in flight — leave its DOM alone
  const moduleSets = SETS.filter(w=>w.moduleNum===moduleNum);
  if(!moduleSets.length) return;   // file loaded but defined no sets
  renderPills(moduleNum);
  renderProgressStrip();   // refresh the "you are here" indicator
  const isReviewId = restoreSetId === `mr${moduleNum}` && MODULE_REVIEWS[moduleNum];
  // The student's "frontier": the first unlocked set they haven't finished yet
  // (or the last unlocked one if they're all done). Used when there's nothing
  // valid to restore, and as the fallback if a restore target is now locked.
  const frontier = ( moduleSets.find(w=>!isSetLocked(w) && !isSetComplete(w))
                  || [...moduleSets].reverse().find(w=>!isSetLocked(w))
                  || moduleSets[0] ).id;
  let target = (restoreSetId && (moduleSets.find(w=>w.id===restoreSetId) || isReviewId))
    ? restoreSetId : frontier;
  // Never open onto a set the sequential gate has locked.
  if(!/^mr\d+$/.test(target) && isSetLocked(moduleSets.find(w=>w.id===target))) target = frontier;
  // A fully-locked module's only reachable target is its module-gated Set 1
  // (the frontier resolver above can't find anything else unlocked) — open
  // it read-only instead of letting activateSet's backstop bounce off it and
  // leave a dead screen.
  const tw = moduleSets.find(w=>w.id===target);
  const wantPeek = !!(tw && isSetLocked(tw));
  /* opts.quiet: renderAll's catch-up re-run once every module's data has
     loaded. On a slow cold load the student is already working by then —
     In-Class Activities open, a Coach check started, a drill mid-answer, a
     locked set opened to preview — and activateSet would scroll them to the
     top, close the Coach, reset every drill and drop the preview. So when
     the screen already shows what this would open (renderPills above has
     already shed a peek the full data unlocked), or the student is
     previewing a set that is still locked, leave it — renderPills above was
     the whole correction. Anything else is a real correction and goes
     through activateSet as before. */
  const cur = (opts && opts.quiet) ? activeWeekPanel() : null;
  const curW = cur ? SETS.find(w=>w.id===cur.dataset.id) : null;
  const curPeek = !!(cur && cur.classList.contains('set-peek'));
  if(cur && ((cur.dataset.id === target && curPeek === wantPeek) ||
             (curPeek && curW && curW.moduleNum === moduleNum && isSetLocked(curW)))){
    if(!curPeek && lastSetId !== target){ lastSetId = target; renderPills(moduleNum); }
    syncRailStations();
  }
  else if(wantPeek) activateSet(target, {peek:true});
  else activateSet(target);
  // First completed render of the session: the restored set is on screen and
  // its data is loaded, so the resume card can finally compute step counts.
  if(!_resumeCardBuilt){ _resumeCardBuilt = true; renderResumeCard(); }
}

// Per-set completion tally from the student's own progress.
// Returns {done, total}; total is 0 for sets with no trackable skills.
function setCompletion(w){
  const skills = (w.skills && w.skills.length) ? w.skills : [];
  const done = skills.filter(s=>progress[s.id]==='gotit').length;
  return { done, total: skills.length };
}

/* ── "Pick up where you left off" resume card ──
   One card above the set panels, filled once per page load (onModuleChange's
   first completed run), so a student sitting back down lands on a one-tap
   route back to exactly where they stopped — the lesson ladder or the
   checklist in their current set, and the Song Journey they touched most
   recently.
   Session-only: dismissing or using it removes it until the next page load,
   which on a class Chromebook means the next class period. Read-only over
   `completed` / `songReady` — it never writes progress. */
const SONG_JOURNEYS = [
  { id:'seven-nation-army',        name:'Seven Nation Army',        url:'tabs/seven-nation-army.html' },
  { id:'all-along-the-watchtower', name:'All Along the Watchtower', url:'tabs/all-along-the-watchtower.html' },
  { id:'sweet-child-o-mine',       name:'Sweet Child O\u2019 Mine', url:'tabs/sweet-child-o-mine.html' },
  { id:'luna',                     name:'Luna',                     url:'tabs/luna.html' },
  { id:'let-it-be',                name:'Let It Be',                url:'tabs/let-it-be.html' },
  { id:'the-cure',                 name:'the cure',                 url:'tabs/the-cure.html' },
];
let _resumeCardBuilt = false;    // build once per page load…
let _resumeCardClosed = false;   // …and never resurrect after dismiss/use

/* Steps done / total across a set's whole lesson ladder — a standalone twin of
   buildLesson's lessonStepCounts (same ns-per-section key scheme, same
   tuning-warm-up exclusion), kept separate because the resume card runs before
   any panel is built. If the key scheme ever changes, change both. */
function resumeLessonCounts(w){
  let total=0, done=0;
  const count=(pairs,ns)=>pairs.forEach(p=>{
    total++;
    if(completed[`${w.id}-${ns}-${p.idx}`]===true) done++;
  });
  ['b','c'].forEach(stationId=>{
    const s = w.stations && w.stations[stationId];
    if(!s) return;
    if(s.sections && s.sections.length){
      visibleSections(s, w.moduleNum)
        .forEach(({sec,gi})=>count(visibleSteps(sec, w.moduleNum), `${stationId}-sec${gi}`));   // gi = storage index, never the visible position
    } else if(s.steps){
      count(s.steps.map((st,idx)=>({st,idx})).filter(p=>!p.st.hidden), stationId);
    }
  });
  return total ? { total, done } : null;
}

/* The module row's target: the lesson ladder while it still has steps left,
   else the skills checklist. null for module reviews / coming-soon panels —
   those restore on their own and have no tabs to point at. */
function resumeModuleTarget(){
  const panel = activeWeekPanel();
  if(!panel) return null;
  const w = SETS.find(x=>x.id===panel.dataset.id);
  if(!w || w.comingSoon) return null;
  const p = resumeLessonCounts(w);
  if(!p) return null;
  return (p.done < p.total)
    ? { w, lesson:true, tab:LESSON_TAB, done:p.done, total:p.total }
    : { w, lesson:false, tab:'checklist' };
}

/* The song row: the most recently touched Journey that still has unchecked
   layers. Docs from before the songReadyAt stamp existed sort as 0 and fall
   back to canonical song order — still a sensible pick, just not recency. */
function resumeSongPick(){
  const c = SONG_JOURNEYS.map(sj=>{
    const map = songReady && songReady[sj.id];
    if(!map) return null;
    const keys = Object.keys(map);
    if(!keys.length) return null;
    const ready = keys.filter(k=>map[k]===true).length;
    return { song:sj, ready, total:keys.length, at:(songReadyAt && songReadyAt[sj.id]) || 0 };
  }).filter(Boolean).filter(x=>x.ready < x.total);
  if(!c.length) return null;
  c.sort((a,b)=>b.at-a.at);
  return c[0];
}

function renderResumeCard(){
  const host = document.getElementById('resume-card');
  if(!host || _resumeCardClosed) return;
  // The single source of truth for "should this show at all" now lives
  // HERE (item 2f), not just in renderClassActivities' own caller guard —
  // a boot-time call (restoreLastSet) fires independently of that render
  // pass and would otherwise show the card out from under a Today hero the
  // very first time the page loads. caStartHereId is null exactly when
  // there's nothing pending (see renderClassActivities).
  if(document.body.classList.contains('ca-gated') || caStartHereId !== null){
    host.hidden = true; host.innerHTML = ''; return;
  }
  const song = resumeSongPick();
  // Day-one students (no step checked anywhere, no song touched) skip the
  // card entirely — "resume" would be noise on a first visit.
  const anyProgress = Object.keys(completed||{}).some(k=>completed[k]===true);
  const mod = anyProgress ? resumeModuleTarget() : null;
  if(!mod && !song){ host.hidden = true; host.innerHTML=''; return; }
  const rows = [];
  if(mod){
    const meta = mod.lesson
      ? `${t('nav.lessonTitle')} · ${t('progress.stepsDone',{done:mod.done,total:mod.total})}`
      : t('resume.checklistNext');
    rows.push(`<div class="resume-row">
      <div class="resume-what"><strong>${escHtml(tSetLabel(mod.w.label))}</strong><span class="resume-meta">${escHtml(meta)}</span></div>
      <button type="button" class="resume-go" onclick="resumeGoModule('${escAttr(mod.w.id)}','${escAttr(mod.tab)}')">${t('resume.continue')}</button>
    </div>`);
  }
  if(song){
    rows.push(`<div class="resume-row">
      <div class="resume-what"><strong>${escHtml(song.song.name)}</strong><span class="resume-meta">${escHtml(t('journey.progPill',{ready:song.ready,n:song.total}))}</span></div>
      <button type="button" class="resume-go" onclick="resumeGoSong('${escAttr(song.song.url)}')">${t('resume.open')}</button>
    </div>`);
  }
  host.innerHTML = `<div class="resume-head">
      <span class="resume-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 2h6"/></svg> ${t('resume.title')}</span>
      <button type="button" class="resume-close" onclick="dismissResumeCard()" aria-label="${escAttr(t('resume.dismiss'))}" title="${escAttr(t('resume.dismiss'))}">&times;</button>
    </div>${rows.join('')}`;
  host.hidden = false;
}

function dismissResumeCard(){
  _resumeCardClosed = true;
  const host = document.getElementById('resume-card');
  if(host){ host.hidden = true; host.innerHTML=''; }
}
function resumeGoModule(setId, tab){
  dismissResumeCard();
  /* The card sits on In-Class Activities, whose open screen hides
     #week-panels — switching the tab underneath it changed nothing the
     student could see, so Continue just made the card vanish. Close the
     covering page first, same as the rail's own station rows do. */
  leaveTopPanelForSet();
  switchTabById(setId, tab);
  /* That close finishes on a popstate, and caClosePanel then put focus on
     the rail's In class button — a screen-reader user who pressed Continue
     heard nothing about the set. Hide the page now, without that refocus (the
     router's own close is then a no-op), and focus the panel that opened. */
  caClosePanel(true);
  const panel = document.getElementById(`${setId}-${tab}`);
  if(panel){ panel.setAttribute('tabindex', '-1'); panel.focus({ preventScroll: true }); }
}
function resumeGoSong(url){
  dismissResumeCard();
  window.open(journeyHref(url, 0, journeyFromHere()), '_blank', 'noopener');
}

function renderPills(moduleNum){
  const c = document.getElementById('week-pills');
  c.innerHTML='';
  const sets = SETS.filter(w=>w.moduleNum===moduleNum);
  // 4+ sets: compact the buttons so they still fit on one rail row
  c.classList.toggle('wp-many', sets.length>3);
  // 3+ sets: each button shows just the set's NUMBER, in both languages
  // (2026-10-12). Measured at 1366×657: "Unidad 3" needs ~70px, so three or
  // four Spanish buttons wrapped the 219px row onto a second line, and so
  // did three English ones as soon as a set showed its "· 3/7" — the row
  // grew 44 → 92px and pushed Module review below the rail. Two-set modules
  // (1–3, the ones students know) keep "Set 1" / "Set 2". The full name is
  // still the accessible name (the .sr-only span below, or an aria-label
  // that names the set) and leads the hover title=. The number span carries
  // no data-i18n-setlabel, so applyI18n can't write "Unidad 3" back into it.
  const numOnly = sets.length >= 3;
  const labelHtml = w => {
    const n = numOnly && /^Set (\d+)$/.exec(w.label || '');
    const name = `<span data-i18n-setlabel="${escAttr(w.label)}" translate="no" class="notranslate${n ? ' sr-only' : ''}">${escHtml(tSetLabel(w.label))}</span>`;
    return n ? `<span class="wpill-num" aria-hidden="true">${n[1]}</span>${name}` : name;
  };
  // A set that just became genuinely unlocked (finished the one before it,
  // possibly in another tab) sheds any leftover peek state from before —
  // otherwise the panel would still fail-safe as read-only after the real
  // unlock. A still-locked set keeps whatever peek state activateSet gave it.
  sets.forEach(w=>{
    if(!isSetLocked(w)){
      const p = document.querySelector(`.week-panel[data-id="${w.id}"]`);
      if(p) p.classList.remove('set-peek');
    }
  });
  // The pill rail is rebuilt from scratch below and normally highlights
  // lastSetId — but a peek never touches lastSetId (nothing about a peek is
  // persisted), so the peeked pill would lose its "you are here" highlight on
  // any unrelated re-render (language switch, a skill toggled in another
  // tab). Derive it from the DOM instead: whichever panel is both .active and
  // .set-peek is the one being previewed right now.
  const peekedPanel = document.querySelector('.week-panel.active.set-peek');
  const peekedId = peekedPanel ? peekedPanel.dataset.id : null;
  sets.forEach(w=>{
    const btn = document.createElement('button');
    const locked = isSetLocked(w);
    btn.className='wpill'+(locked?' locked':'');
    btn.dataset.id=w.id;
    const { done, total } = locked ? { done:0, total:0 } : setCompletion(w);
    // A number-only button's peek hint ("Preview available — finish Set 2…")
    // never says which set it is on, so it gets the name in front, in the
    // aria-label as well as the tooltip.
    const named = s => !numOnly ? s : (s ? `${tSetLabel(w.label)} · ${s}` : tSetLabel(w.label));
    // Label text carries data-i18n-setlabel (not just plain text) so applyI18n
    // marks it translate="no" — otherwise these freshly-created buttons are
    // never caught by the DOM walk and stay exposed to Google Translate.
    if(!locked && total>0 && done===total){
      // All skills got-it: green treatment + leading ✓.
      btn.classList.add('complete');
      btn.innerHTML = `<span class="wpill-check" aria-hidden="true">✓</span>${labelHtml(w)}`;
      btn.setAttribute('aria-label', t('gate.pillAllComplete', {set: tSetLabel(w.label), total}));
    } else if(!locked && done>0){
      // Started but not finished: full name + a small fraction. Untouched sets
      // stay clean (just the name) until the first skill is marked got-it.
      const frac = document.createElement('span');
      frac.className = 'wpill-frac';
      frac.textContent = ` · ${done}/${total}`;
      btn.innerHTML = labelHtml(w);
      btn.appendChild(frac);
      btn.setAttribute('aria-label', t('gate.pillProgress', {set: tSetLabel(w.label), done, total}));
    } else {
      btn.innerHTML = labelHtml(w);
    }
    if(locked){
      // Static locked/comingSoon sets have nothing built yet — no preview,
      // same "explain why" toast as always. Only the sequential gate (a set
      // whose predecessor just isn't finished yet) offers a peek — same
      // idiom as the Module Review preview.
      const staticClosed = !!(w.locked || w.comingSoon);
      const gp = { set: tSetLabel(w.label), prev: tSetLabel(prevSetLabel(w)) };
      if(staticClosed){
        btn.setAttribute('aria-disabled','true');
        btn.setAttribute('aria-label', t('gate.lockedUntilAria', gp));
        btn.title = t('gate.lockedTitle', gp);
        btn.onclick = ()=> gateToast(t('gate.finishFirstLong', gp));
      } else if(isModuleGateCase(w)){
        const mgp = prevModuleGateParams(w);
        btn.setAttribute('aria-label', named(t('gate.peekPillTitleModule', mgp)));
        btn.title = named(t('gate.peekPillTitleModule', mgp));
        btn.onclick = ()=>{ leaveTopPanelForSet(); activateSet(w.id, {peek:true}); };
      } else {
        btn.setAttribute('aria-label', named(t('gate.peekPillTitle', gp)));
        btn.title = named(t('gate.peekPillTitle', gp));
        btn.onclick = ()=>{ leaveTopPanelForSet(); activateSet(w.id, {peek:true}); };
      }
    } else {
      btn.onclick=()=>{ leaveTopPanelForSet(); lastSetId=w.id; activateSet(w.id); saveProgress(); };
      // "Set 2" says nothing about what's in it — the set's own subtitle
      // ("Reading chord diagrams · Am and Em · First strumming") as the
      // hover tooltip (item 7). Locked pills keep their unlock hint above.
      // A number-only button leads it with the set's name.
      const sub = w.subtitle ? tf(w, 'subtitle') : '';
      if(sub || numOnly) btn.title = named(sub);
    }
    btn.classList.toggle('active', btn.dataset.id===(peekedId || lastSetId));
    c.appendChild(btn);
  });

  // Module Review row — a static button in the rail's "This set" list (see
  // index.html), not one of the pills rebuilt above. railModuleReview()
  // reads dataset.moduleNum back off it to know where to navigate.
  const reviewBtn = document.getElementById('rail-review-btn');
  if(reviewBtn){
    const has = !!MODULE_REVIEWS[moduleNum];
    reviewBtn.hidden = !has;
    if(has){
      const locked = isModuleReviewLocked(moduleNum);
      reviewBtn.dataset.moduleNum = String(moduleNum);
      reviewBtn.classList.toggle('locked', locked);
      reviewBtn.classList.toggle('complete', !locked && isMrComplete(moduleNum));
      reviewBtn.title = locked ? t('gate.reviewPreviewTitle') : '';
      const on = `mr${moduleNum}` === lastSetId;
      reviewBtn.classList.toggle('active', on);
      if(on) reviewBtn.setAttribute('aria-current','true'); else reviewBtn.removeAttribute('aria-current');
      // Sync preview/locked state onto the review's panel so its inputs disable themselves
      const panel = document.querySelector(`.week-panel[data-id="mr${moduleNum}"]`);
      if(panel) panel.classList.toggle('mr-locked', locked);
    }
  }
}

window.addEventListener('pagehide', function(){ if(_dirtyKeys.size){ clearTimeout(saveTimer); flushSave(); } });
/* Back online (2026-10-12): flushSave gives up after SAVE_MAX_AUTO_RETRIES
   ("Not saving") and the queued categories wait for the student's next
   action — which may never come, and the first save after the Module 4/5
   swap is a transaction, which fails offline rather than queueing. Re-arm
   the ordinary debounced save instead. queueSave() with no new categories:
   it bails with no signed-in user and clears the dev bypass; the held-back
   categories never entered _dirtyKeys after a failed load; one timer at a
   time and flushSave() taking the dirty set means nothing is sent twice;
   and flushSave()'s swap45 gate still runs before the write. */
window.addEventListener('online', function(){ if(currentUser && _dirtyKeys.size) queueSave(); });

function activateSet(id, opts){
  // opts.peek: open a locked set read-only instead of bouncing off the gate
  // (renderPills' locked-pill onclick uses this). A peek must leave nothing
  // behind — no lastSetId, no saveProgress — so a reload always restores the
  // student to their real frontier, never the set they were just previewing.
  // Static locked/comingSoon sets have nothing built to preview — peek only
  // ever applies to the sequential gate (see renderPills' matching check).
  const isMr = /^mr\d+$/.test(id);
  const w = isMr ? null : SETS.find(x=>x.id===id);
  const peek = !!(opts && opts.peek) && !!w && !(w.locked || w.comingSoon);
  // Sequential-gate backstop: never open a set that's still locked (e.g. from a
  // stale search deep-link) UNLESS this is an intentional peek. Module Review
  // (mrN) is intentionally preview-openable while locked, so it's exempt too.
  if(w && isSetLocked(w) && !peek){
    gateToast(isModuleGateCase(w)
      ? t('gate.finishFirstShortModule', { set: tSetLabel(w.label), ...prevModuleGateParams(w) })
      : t('gate.finishFirstShort', { set: tSetLabel(w.label), prev: tSetLabel(prevSetLabel(w)) }));
    return;
  }
  if(!peek) lastSetId = id;
  if (typeof stopAnyRec === 'function') stopAnyRec({keepFab:true});
  // A Listening Coach check left running inline in the set/tab we're leaving
  // just goes invisible otherwise (its DOM node stays put, only hidden by
  // CSS) — the mic and its rAF loop would keep running unseen, permanently
  // muting the metronome/demo audio for the rest of the session. Closing it
  // here is a no-op when no check is open (coachClose() is safe to call
  // unconditionally — see coach.js).
  if (typeof coachClose === 'function') coachClose();
  // A Shuffle Drill's countdown interval (and any pending "next card" timer)
  // keeps running even after its panel is hidden by CSS on set-switch — it's
  // never rebuilt like a language-switch re-render, so nothing else stops
  // it. Stopping every drill here (harmless no-op for ones not mid-round)
  // is simpler than tracking which set each key belongs to.
  if(typeof sdAbortAll === 'function') sdAbortAll();
  document.querySelectorAll('.wpill').forEach(b=>b.classList.toggle('active',b.dataset.id===id));
  // Module Review row lives outside .wpill now (see renderPills) — keep its
  // active/aria-current in step with every other set-switch, same as the loop above.
  const reviewBtn = document.getElementById('rail-review-btn');
  if(reviewBtn){
    const on = !!reviewBtn.dataset.moduleNum && `mr${reviewBtn.dataset.moduleNum}` === id;
    reviewBtn.classList.toggle('active', on);
    if(on) reviewBtn.setAttribute('aria-current','true'); else reviewBtn.removeAttribute('aria-current');
  }
  document.querySelectorAll('.week-panel').forEach(p=>{
    const isTarget = p.dataset.id===id;
    p.classList.toggle('active', isTarget);
    if(isTarget) p.classList.toggle('set-peek', peek);
  });
  syncRailStations();   // refresh the rail's "This set" station switcher for the new set
  // Every set opens at the top, every time — no scroll-position memory.
  scrollPaneTop();
  // Opening the Module Review pops the assessment heads-up (once per visit).
  // Only when the review panel is actually what the student is looking at,
  // though — showApp()'s boot-time restore calls activateSet() on the
  // student's last set/review regardless of which page is on top, so
  // landing on In-Class Activities (or Songs, My progress, a live quiz…)
  // used to pop this reminder in the background before the student had
  // asked to see the review at all (Jonathan, 2026-09-17). Stash it and let
  // syncExploreNav() fire it once that page closes and the review is
  // genuinely on screen, instead of dropping it.
  if(isMr){
    const mrNum = parseInt(id.slice(2),10);
    if(anyExplorePageOpen()) pendingMrAssessModule = mrNum;
    else maybeShowMrAssess(mrNum);
  }
}

/* ── Rail set switcher ─────────────────────────────────────────────────
   The per-set switcher (the lesson ladder · the checklist) lives in the left
   rail. It is the ONLY switcher — the in-panel tab bar it replaced is gone —
   so these helpers drive switchTabById() and mirror the active panel back
   onto the rail buttons. */
/* The one tab-panel suffix the merged ladder lives under. Kept as 'station-b'
   rather than renamed: every stored deep link, every `${wid}-station-b` lookup
   and the print stylesheet already address it, and the id is invisible to
   students. Changing it would buy nothing and break all three. */
const LESSON_TAB = 'station-b';
function activeWeekPanel(){ return document.querySelector('.week-panel.active'); }
/* The lesson's rail sub-label was a hardcoded "Watch · Listen · Practice"
   while the set's own panel header could say something else — Module 1 Set 1
   reads "…Reflect" (nothing is played in that set; the skills are all "I can
   describe…"), and Module 9 Set 1 reads "Where do I start?". Both are
   deliberate, so mirror the set's own wording instead of flattening it: take
   whatever follows the em-dash in "Computer station — X" (same shape in both
   languages, so no per-language parsing), falling back to the generic label
   for a title that carries no dash. Read through tf(), so a language switch
   re-derives it — same pattern as the single-flow tabSub override below, and
   as the B→C seam divider in buildLesson(). */
function lessonSubLabel(w){
  const raw = (w && w.stations && w.stations.b && w.stations.b.title) ? tf(w.stations.b, 'title') : '';
  const i = raw.indexOf('—');
  const tail = i >= 0 ? raw.slice(i + 1).trim() : '';
  return tail || t('nav.lessonSub');
}
function railStation(tab){
  const panel = activeWeekPanel();
  if(!panel) return;
  leaveTopPanelForSet();
  switchTabById(panel.dataset.id, tab);   // switchTab() calls syncRailStations() to reflect it
}
/* The Module Review row at the end of the rail's "This set" list — not a
   station of the currently open set, so it doesn't go through railStation();
   it opens its own week-panel the same way a Set 1/2/3 pill does. Reads
   moduleNum back off the row's own dataset (written by renderPills). */
function railModuleReview(){
  const btn = document.getElementById('rail-review-btn');
  const moduleNum = btn && btn.dataset.moduleNum;
  if(!moduleNum) return;
  leaveTopPanelForSet();
  lastSetId = `mr${moduleNum}`;
  activateSet(`mr${moduleNum}`);
  saveProgress();
}
/* A rail Part link: open the lesson ladder and land on that part's first
   step. Same addressing as jumpToStep() — the section's storage namespace,
   which is the only stable handle a section has. */
function railJumpToPart(btn){
  const panel = activeWeekPanel();
  const ns = btn && btn.dataset.ns;
  if(!panel || !ns) return;
  leaveTopPanelForSet();
  switchTabById(panel.dataset.id, LESSON_TAB, true);
  const sec = panel.querySelector(`.stp-sec[data-ns="${ns}"]`);
  if(!sec) return;
  const li = sec.querySelector('li.step');
  if(li){
    expandStepEl(li);
    li.scrollIntoView({ block:'start', behavior: scrollBehavior() });
  } else {
    sec.scrollIntoView({ block:'start', behavior: scrollBehavior() });
  }
}
function syncRailStations(){
  const group = document.getElementById('rail-set-group');
  const list  = document.getElementById('rail-stations');
  if(!group || !list) return;   // teacher view / pre-init: nothing to do
  const panel = activeWeekPanel();
  // Module-review and coming-soon panels carry no .tab-panel, so there is
  // nothing to switch between — but the Module Review row (if this module
  // has one) still lives at the end of this same list (see renderPills), so
  // the group only disappears when NEITHER applies.
  const hasPanels = !!(panel && panel.querySelector('.tab-panel'));
  const reviewBtn = document.getElementById('rail-review-btn');
  const hasReview = !!(reviewBtn && !reviewBtn.hidden);
  if(!hasPanels && !hasReview){ group.hidden = true; return; }
  group.hidden = false;
  const bBtn = list.querySelector('.rail-station.st-b');
  const chkBtn = list.querySelector('.rail-station.st-chk');
  const partsEl = document.getElementById('rail-parts');
  if(bBtn) bBtn.hidden = !hasPanels;
  if(chkBtn) chkBtn.hidden = !hasPanels;
  if(!hasPanels){
    // Viewing the review (or a coming-soon set) with no tabs to switch —
    // the row's own active/title state was already set by renderPills()/
    // activateSet(), so there's nothing else to sync here.
    if(partsEl) partsEl.hidden = true;
    const label = document.getElementById('rail-set-label');
    if(label) label.textContent = t('nav.thisSet');
    return;
  }
  const wid = panel.dataset.id;
  const w = (typeof SETS !== 'undefined') ? SETS.find(s=>s.id===wid) : null;
  const label = document.getElementById('rail-set-label');
  if(label) label.textContent = t('nav.thisSet') + (w && w.label ? ' · ' + tSetLabel(w.label) : '');
  /* Single-flow sets (only station b) mirror the set's own tab labels onto the
     rail. applyI18n restores the defaults on language switch, then this
     override re-applies (the gc-langchange listener calls syncRailStations
     after applyI18n). */
  const single = !!(w && w.stations && w.stations.b && !w.stations.c && !w.comingSoon);
  const bTitle = list.querySelector('.rail-station.st-b .rs-title');
  const bSub = list.querySelector('.rail-station.st-b .rs-sub');
  if(bTitle) bTitle.textContent = (single && w.stations.b.tabTitle) ? tf(w.stations.b,'tabTitle') : t('nav.lessonTitle');
  if(bSub) bSub.textContent = (single && w.stations.b.tabSub) ? tf(w.stations.b,'tabSub') : lessonSubLabel(w);
  const chkSubEl = list.querySelector('.rail-station.st-chk .rs-sub');
  if(chkSubEl) chkSubEl.textContent = (single && w.checklistSub) ? tf(w,'checklistSub') : t('nav.checklistSub');
  /* A set shown in two parts gets two jump links under "The lesson". They
     address each part's FIRST section by its storage namespace (data-ns),
     never by DOM position — the ladder runs both stations through one
     panel and render-time hides move rows around, so position identifies
     nothing. Hidden for every other set, which is every set but m4w2. */
  if(partsEl){
    const lp = (w && !w.comingSoon) ? lessonParts(w) : null;
    partsEl.hidden = !lp;
    partsEl.innerHTML = lp ? [[1, lp.firstNs], [2, lp.breakNs]].map(([n, ns]) =>
      `<button type="button" class="rail-part" data-ns="${escAttr(ns)}" onclick="railJumpToPart(this)"`
      + ` data-i18n="lesson.partN" data-i18n-params="${escAttr(JSON.stringify({n}))}">${escHtml(t('lesson.partN',{n}))}</button>`
    ).join('') : '';
  }
  // Reflect whichever tab-panel is currently active back onto the rail buttons.
  const activePanel = panel.querySelector('.tab-panel.active');
  const activeTab = activePanel ? activePanel.id.slice(wid.length + 1) : LESSON_TAB;
  list.querySelectorAll('.rail-station').forEach(b=>{
    const on = b.dataset.station === activeTab;
    b.classList.toggle('active', on);
    if(on) b.setAttribute('aria-current','true'); else b.removeAttribute('aria-current');
  });
}

/* ── Explore pages: Games · Songs · My progress ──
   All three share the plumbing — one hash each (browser Back exits), one
   router, one close path, and the rail item lights up while its page is open.
   They differ in one axis only, `overlay`:
     overlay: false (Songs · My progress) — loads INTO the main column,
       replacing #week-panels while the rail and header stay put, so a
       student can hop between them the way they hop between sets.
     overlay: true (Games) — takes the whole viewport, covering rail and
       header. Jonathan asked for this on 2026-07-28, the day after the three
       screens were unified: the arcade is a place you go, not a page you
       browse, and the rail's practice scaffolding is noise once you're
       playing.
   Anything new in this group joins the table below and picks one of those two,
   rather than inventing a third.

   Keep practicing (#keep-practicing) and Daily Review (#daily-review) used
   to have their own rows here — they're sections inside My progress instead
   since 2026-09-12 (Today-first work order, Phase 2, nav collapse). Their
   hashes stay in EXPLORE_HASHES below as redirects to #my-progress (an old
   bookmark or Journey link still has to resolve), which is why they're not
   EXPLORE_PAGES rows any more: nothing opens a screen by those names now. */
const EXPLORE_PAGES = [
  { hash: '#games',           screen: 'games-screen',           btn: 'games-btn', overlay: true },
  { hash: '#songs',           screen: 'songs-screen',           btn: 'songs-hub-btn' },
  { hash: '#my-progress',     screen: 'my-progress-screen',     btn: 'my-progress-btn' },
  { hash: '#class-activities', screen: 'class-activities-screen', btn: 'class-activities-btn' },
  /* The second overlay, and the one place the choice isn't about browsing
     comfort: a student answering a live question must not be able to
     half-see (or mis-tap into) the set panels underneath. */
  // No rail button (removed 2026-09-29): students reach it from the invite
  // and the banner live-quiz.js puts up while a game is on.
  { hash: '#live-quiz',       screen: 'live-quiz-screen',       btn: null, overlay: true },
];
// Whether any explore page (in-column or overlay) is covering the practice
// view right now — the one check activateSet() needs before popping the
// Module Review reminder on top of a page the student didn't ask to leave.
function anyExplorePageOpen(){
  return EXPLORE_PAGES.some(p => { const el = document.getElementById(p.screen); return el && !el.hasAttribute('hidden'); });
}
/* Single source of truth for "which explore page is showing": reads the DOM
   rather than tracking state, so it stays right no matter which path opened
   or closed a page (click, hash, Back button, teacher turning games off). */
let practiceScrollTop = 0;
function syncExploreNav(){
  const open = EXPLORE_PAGES.find(p => {
    const el = document.getElementById(p.screen);
    return el && !el.hasAttribute('hidden');
  });
  // A Module Review reminder activateSet() had to hold back because an
  // explore page was covering the practice view (see there) fires now that
  // the last one has closed — but only if the review is still what's
  // actually on screen; a student who navigated straight to a different set
  // in the meantime shouldn't get surprised by it.
  // The hash check matters: routeExploreHash() closes the old page BEFORE
  // opening the new one, so going In class → Songs passes through a moment
  // with nothing open and used to pop the reminder over Songs (2026-10-05).
  // The hash is already the destination by then, so only fire when it is
  // the practice view itself.
  if(!open && pendingMrAssessModule !== null && exploreHashBase(location.hash) === ''){
    const num = pendingMrAssessModule;
    pendingMrAssessModule = null;
    if(lastSetId === `mr${num}`) maybeShowMrAssess(num);
  }
  /* In-column pages hide #week-panels: the practice view is swapped OUT, not
     covered up, so .main would otherwise clamp its scroll to the short explore
     page and lose the student's place in a long set. Stash it on the way in,
     put it back on the way out. An overlay page (Games) leaves the practice
     view mounted underneath, so it needs neither — just a locked body scroll
     so the page behind it can't rubber-band. */
  const inColumn = !!open && !open.overlay;
  const wasOpen = document.body.classList.contains('explore-open');
  document.body.classList.toggle('explore-open', inColumn);
  document.body.classList.toggle('games-open', !!open && !!open.overlay);
  /* Set the position AFTER the class toggle, and read scrollPane() fresh:
     showing/hiding a screen changes .main's height, which decides both
     whether it scrolls at all and how far. (Don't defer this to a
     requestAnimationFrame — those don't run in a background tab, so the
     student would come back to a page that hadn't restored itself.) */
  if(inColumn !== wasOpen) scrollPane().scrollTo({ top: inColumn ? 0 : practiceScrollTop });
  const activeId = open ? open.btn : 'practice-nav-btn';
  [...EXPLORE_PAGES.map(p => p.btn), 'practice-nav-btn'].forEach(id => {
    const b = document.getElementById(id);
    if(!b) return;
    const on = id === activeId;
    b.classList.toggle('active', on);
    if(on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    // Only the overlay page's button carries aria-expanded (see index.html);
    // the in-column ones are navigation, not disclosure, so leave them alone.
    if(b.hasAttribute('aria-expanded')) b.setAttribute('aria-expanded', String(on));
  });
}

/* ── Back-button history for the explore pages ─────────────────────────────
   Opening a page pushes ONE history entry; the on-page ✕ / "Back to practice"
   walks back through every entry this visit pushed. Before this, closing a
   page *pushed* an empty '#' on top of the entry that had opened it, so the
   student's next Back tap re-opened the page they had just closed — the
   "Back doesn't take me to the page I was on" bug.

   The depth rides along in history.state rather than in a module-level
   counter, so it stays honest when the student mixes the browser's own
   Back/Forward buttons with the on-page ones. An entry we didn't push (a
   bookmarked or reloaded '#songs' URL) reports depth 0 and exits by
   rewriting the URL in place — never push a '#' the student has to Back
   through twice. */
function exploreDepth(){ return (history.state && history.state.xDepth) || 0; }

/* Open an explore page. pushState rather than `location.hash =` so the entry
   can carry its depth; pushState fires no event, so route by hand. */
function goExploreHash(hash){
  const h = '#' + hash;
  if(location.hash === h) return;
  history.pushState({ xDepth: exploreDepth() + 1 }, '', h);
  routeExploreHash();
}

/* Leave the explore pages and land back on the practice view. */
function exitExploreHash(){
  const d = exploreDepth();
  if(d > 0){ history.go(-d); return; }   // async: popstate → routeExploreHash()
  history.replaceState(null, '', location.pathname + location.search);
  routeExploreHash();
}

/* Leave an OVERLAY page (Games, Live quiz) for the page it was opened from.
   An overlay sits on top of whatever was showing — In class, Songs, My
   progress or a lesson — so its own exit button goes back ONE entry, not all
   the way to the lesson. exitExploreHash() walks back every entry, which is
   right for "Back to practice" but sent "Main site" from In class → Games to
   a lesson the student wasn't on (2026-11-02). Rail jumps that must land on
   the lesson (leaveTopPanelForSet) still use the full exit. */
function exitOverlayHash(){
  if(exploreDepth() > 0){ history.back(); return; }   // async: popstate → routeExploreHash()
  exitExploreHash();
}

/* The pages a gated student may still open — In-Class Activities and Live
   quiz. In class is the rail's one data-gate="keep" button (checks.mjs 1aa);
   Live quiz has no rail button (2026-09-29) and is reached from its invite
   and banner. A new gate-open page needs its rail button tagged keep. */
const GATE_OPEN_HASHES = ['#class-activities', '#live-quiz'];

/* Hash router for all the pages. Closes the others FIRST (through their
   panel-only close fns, which don't touch the hash — the hash is already
   whatever we're routing to), then opens the target. */
let lastRoutedHash = null;
const EXPLORE_HASHES = ['', '#games', '#songs', '#keep-practicing', '#daily-review', '#my-progress', '#class-activities', '#live-quiz', '#search'];
/* A hash may carry a deep-link target after a slash — today only
   '#class-activities/ca-15', the shareable link to one activity or exit
   check (see caFocusActivity). Everything that decides WHICH page a hash
   means reads the base; only the class-activities branch looks at the tail.
   Keep new deep links to this shape rather than adding query params: the
   whole router, the Back button and the depth counter already work on
   hashes. */
function exploreHashBase(h){
  const i = (h || '').indexOf('/');
  return i === -1 ? (h || '') : h.slice(0, i);
}
function exploreHashTail(h){
  const i = (h || '').indexOf('/');
  if(i === -1) return '';
  // A link cut short mid-%2F leaves a stray % that throws URIError, which
  // would stop sign-in partway: keep the raw text (journey.js does the same).
  try { return decodeURIComponent(h.slice(i + 1)); } catch(e){ return h.slice(i + 1); }
}
function routeExploreHash(){
  let full = location.hash;
  let h = exploreHashBase(full);
  // A hash this router doesn't own (e.g. #main-content from the skip link)
  // must fall through untouched — otherwise it would close every explore
  // panel + search out from under whatever the student was reading.
  if(!EXPLORE_HASHES.includes(h)) return;
  /* Keep practicing / Daily Review folded into My progress 2026-09-12
     (Today-first work order, Phase 2) — kept in EXPLORE_HASHES only so an
     old bookmark or Journey link still resolves, onto the merged page
     instead of a retired standalone one. Canonicalized before everything
     below (the gate check, the dedup guard, the scroll stash) so either
     alias behaves exactly like a #my-progress visit. */
  if(h === '#keep-practicing' || h === '#daily-review'){
    h = '#my-progress';
    full = '#my-progress';
    history.replaceState(history.state, '', location.pathname + location.search + '#my-progress');
  }
  /* The activity gate: while it's on, In-Class Activities and Live quiz are
     the only reachable pages (caBlockers/applyActivityGate) — anything else
     (including the bare Practice hash, '') is rewritten back to In-Class
     Activities rather than opened, so a bookmarked/typed/Back-button hash can't walk
     straight past the gate. replaceState, not push — this is a correction,
     not a real navigation, and shouldn't cost a Back tap of its own. */
  if(document.body.classList.contains('ca-gated') && !GATE_OPEN_HASHES.includes(h)){
    /* Leaving the live quiz (its ✕, or Back) lands on '' — the practice
       view — which the gate refuses. That is the quiz closing, not the
       student trying to get past the gate, so no toast. */
    const leavingQuiz = h === '' && exploreHashBase(lastRoutedHash) === '#live-quiz';
    if(!leavingQuiz) gateToast(t('gate.activityFirst'));
    /* Land back on whatever gate-open hash was already showing (an open
       activity's own #class-activities/ca-N, tail included) rather than
       always the bare page — tapping a greyed-out (but still clickable) rail
       button used to reset to bare #class-activities every time, which stops
       the band, collapses a revealDelay tab and resets a paged tab even when
       the student never left the activity they were reading. Found
       2026-09-26.
       Only ever back to In-Class Activities, NEVER to #live-quiz: closing
       the quiz routes here, so returning to the last gate-open hash
       reopened the quiz, and a gated student who had joined a game could
       not get back to their activities at all — game over or not
       (Jonathan, 2026-09-29, "the live quiz locks people out of
       activities even when there is no quiz going on"). */
    const back = exploreHashBase(lastRoutedHash) === '#class-activities' ? lastRoutedHash : '#class-activities';
    history.replaceState(null, '', location.pathname + location.search + back);
    routeExploreHash();
    return;
  }
  /* A back/forward across a hash-only entry fires popstate *and* hashchange
     in most browsers, and goExploreHash routes by hand on top of that.
     Routing is idempotent, but the scroll stash below is not — so bail on a
     repeat of the hash we already routed to. */
  const leftPage = exploreHashBase(lastRoutedHash);
  if(full === lastRoutedHash) return;
  lastRoutedHash = full;
  /* A Listening Coach check on the page being covered (the set, under Songs /
     My progress / Class activities) or left (a class activity's card) is only
     hidden by CSS: its mic and rAF loop would keep running unseen, and while
     the mic is live every Play on the new page does nothing. Close it, the
     same as activateSet() and switchTabById() do. #games closes it itself
     (openGamesScreen). */
  const inColumn = x => EXPLORE_PAGES.some(p => p.hash === x && !p.overlay);
  if(h !== leftPage && (inColumn(h) || inColumn(leftPage)) && typeof coachClose === 'function') coachClose();
  /* Remember the student's place in the set BEFORE anything is shown or
     hidden — once a screen is in the flow, .main's scrollTop has already
     been shifted by scroll anchoring and no longer means what it says.
     Overlay pages don't take the practice view out of the flow, so there's
     nothing to stash for them (and arriving at Songs *from* Games still reads
     the live practice scrollTop, which is exactly the right one). */
  if(!document.body.classList.contains('explore-open') && EXPLORE_PAGES.some(p => p.hash === h && !p.overlay)){
    practiceScrollTop = paneScrollTop();
  }
  if(h !== '#games' && typeof gamesClosePanel === 'function') gamesClosePanel();
  if(h !== '#songs') songsClosePanel();
  if(h !== '#my-progress') mpClosePanel();
  if(h !== '#class-activities') caClosePanel();
  if(h !== '#live-quiz' && typeof lqClosePanel === 'function') lqClosePanel();
  if(h !== '#search') searchClosePanel();
  if(h === '#games'){
    /* coach.js owns the arcade and is loaded on demand — see ensureCoachJs().
       It sits in sw.js's best-effort tier (precacheRest, after the install), so
       on school Wi-Fi it can legitimately be missing from the cache; swallowing the
       rejection left the button looking broken AND made the second tap a
       no-op (goExploreHash returns early once the hash is already '#games').
       Say so, and drop the hash so pressing it again really retries. Same
       shape as coachOpenLazy(). */
    ensureCoachJs().then(() => openGamesScreen()).catch(() => {
      exitExploreHash();
      if(typeof gateToast === 'function') gateToast(t('coach.loadFailed'));
    });
  }
  else if(h === '#songs') openSongsScreen();
  else if(h === '#my-progress') openMyProgressScreen();
  else if(h === '#class-activities') openClassActivitiesScreen(exploreHashTail(full));
  else if(h === '#live-quiz' && typeof openLiveQuizScreen === 'function') openLiveQuizScreen();
  else if(h === '#search') openSearchPanel();
  syncExploreNav();
}
/* The skip link's default #main-content jump would drop a foreign hash into
   the history — exitExploreHash's history.go(-d) can then land on it, and
   routeExploreHash (correctly, above) ignores hashes it doesn't own, which
   left a ✕ click dead until pressed a second time. Focus the target
   directly instead: same destination, no history entry. */
document.querySelector('.skip-link')?.addEventListener('click', e => {
  e.preventDefault();
  const m = document.getElementById('main-content');
  if(m) m.focus();
});
/* routeExploreHash is registered for hashchange and popstate at the END of this script (beside the sign-in
   registration), not here: it calls functions from the whole file (songsClosePanel, openSongsScreen…), and with
   the file cut into parts a Back button or a # link pressed while the later parts were still loading threw
   "songsClosePanel is not defined" (tools/slow-load.mjs, 5 of 5 loads; 2026-11-11). */

/* "Practice" nav item: leave whatever explore page or panel is open and
   return to the practice view. Reuses the existing close-all helper. */
function returnToPractice(){
  // Gated: there is no practice view to return to — same redirect-and-say-so
  // as routeExploreHash's own guard (practice-nav-btn is hidden by CSS, but
  // this is also reachable by keyboard/existing focus, so it needs its own
  // check rather than trusting the button to stay unclickable).
  if(document.body.classList.contains('ca-gated')){ gateToast(t('gate.activityFirst')); return; }
  // Leaving an explore page restores the student's place in the set
  // (syncExploreNav); a plain "Practice" click with nothing open still
  // means "take me back to the top". Games counts as an explore page here
  // even though it's an overlay — it never moved the practice view, so
  // scrolling it to the top on the way out would lose the student's place.
  const fromExplore = document.body.classList.contains('explore-open')
    || document.body.classList.contains('games-open');
  if(typeof closeTopPanels === 'function') closeTopPanels();
  if(!fromExplore) scrollPaneTop(true);
}

/* Set/review panels are now built per-module, on demand, by
   ensureModuleRendered() (defined near the top of this file). */

function buildComingSoon(w){
  const setTag = w.title ? `<span class="obj-set-tag" data-i18n-setlabel="${escAttr(w.title)}" translate="no">${escHtml(tSetLabel(w.title))}</span>` : '';
  const titleSpan = w.unit ? `<span class="set-eyebrow-title">${tf(w,'unit')}</span>` : '';
  const eyebrow = (setTag || titleSpan) ? `<div class="set-eyebrow">${setTag}${titleSpan}</div>` : '';
  const sub = w.subtitle ? `<p class="obj-sub">${tf(w,'subtitle')}</p>` : '';
  return `${eyebrow}${sub}
  <div class="coming"><div class="big"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div><p>${t('nav.comingSoonHtml')}</p></div>`;
}

function buildSet(w){
  // Compact eyebrow line — "Set N" pill, topic, Print — carries identity;
  // skill bullets and the song-thread link fold behind "About this set"
  // (the old "I CAN…" objective line is no longer shown).
  const printBtn = `<button type="button" class="print-set-btn" onclick="printSet()" title="${escAttr(t('btn.printSetTitle'))}" aria-label="${escAttr(t('btn.printSet'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7" rx="1"/></svg></button>`;
  const setTag = w.title ? `<span class="obj-set-tag" data-i18n-setlabel="${escAttr(w.title)}" translate="no">${escHtml(tSetLabel(w.title))}</span>` : '';
  const titleSpan = w.unit ? `<span class="set-eyebrow-title">${tf(w,'unit')}</span>` : '';
  const items = (tf(w,'skillFocus')||'').split(' · ')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => `<li class="obj-skill-item">${s}</li>`)
    .join('');
  const skills = items ? `<ul class="obj-skill-list">${items}</ul>` : '';
  /* Song-thread line: each core song is built LAYER BY LAYER across the
     course (the Journey pages' shared ladder: 1 Listen · 2 Single Notes ·
     3 Power Chords · 4 Open Chords · 5 Pentatonic Solo · Luna bonus 6 —
     4 and 5 swapped places with the modules on 2026-10-12).
     One compact line naming which layer this set builds, names deep-linked
     to that layer on the Journey page — full detail (videos, notes) lives
     in the module's Songs list at the bottom, so this doesn't repeat it. */
  const thread = (w.songThread && w.songThread.length)
    ? (()=>{
        const entries = w.songThread;
        /* NB: don't name this callback param `t` — it would shadow the global
           i18n t() that the title string below needs. */
        const names = entries.map(song => {
          const url = song.journey ? (song.layer ? `${song.journey}#layer-${song.layer}` : song.journey) : null;
          const slug = (/tabs\/([^/.#?]+)\.html/.exec(song.journey || '') || [])[1] || '';   // play-along first: openSongLink() decides at the click
          return url
            ? `<a class="song-thread-link" href="${escAttr(url)}" target="_blank" rel="noopener"${slug ? ` onclick="openSongLink('${escAttr(slug)}', ${Number(song.layer) || 0}); return false;"` : ''} title="${escAttr(t('songs.openLayerTitle'))}">${escHtml(song.name)}</a>`
            : `<span class="song-thread-name">${escHtml(song.name)}</span>`;
        }).join(', ');
        const layers = entries.map(song => song.layer);
        const sameLayer = layers[0] != null && layers.every(l => l === layers[0]);
        const sameBonus = entries.every(song => !!song.bonus === !!entries[0].bonus);
        const lede = (sameLayer && sameBonus && entries[0].bonus) ? t('thread.bonusLayer')
          : sameLayer ? t('thread.buildsLayer', {n: layers[0]})
          : t('thread.grows');
        return `<div class="song-thread"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> ${lede} ${names}</div>`;
      })()
    : '';
  /* The set's subtitle ("Reading chord diagrams · Am and Em · First
     strumming") opens the About panel (navigability work order 2026-09-23,
     item 7) — the same line the rail's set pills now carry as a tooltip.
     It was tried in the sticky band first and ellipsized to a fragment at
     1366px once the lesson chrome was in; here it has the width. */
  const subLine = w.subtitle ? `<p class="set-about-sub">${tf(w,'subtitle')}</p>` : '';
  const about = (skills || thread || subLine) ? `<details class="set-about"><summary>${t('set.about')}</summary><div class="set-about-panel">${subLine}${skills}${thread}</div></details>` : '';
  /* buildLesson() runs BEFORE the band is assembled, on purpose: it leaves
     the lesson chrome (progress pill, "Step n of m", the view toggle) in
     _lessonChrome for the band to carry, instead of spending two more rows
     on it at the top of the card. Template literals evaluate left to
     right, so reading _lessonChrome in the same expression that calls
     buildLesson() would read the PREVIOUS set's chrome — hence the local.
     (Chromebook viewing-area work order, 2026-09-19.) */
  const lessonHtml = buildLesson(w);
  const eyebrow = `<div class="set-eyebrow">${setTag}${titleSpan}${about}${_lessonChrome}${printBtn}</div>`;
  // Always in the DOM (like mr-locked-banner), shown only when the panel
  // carries .set-peek — so it needs no rebuild to appear/disappear as the
  // gate state changes, only the class toggle renderPills/activateSet do.
  const peekBanner = `<div class="set-peek-banner">
      <span class="set-peek-banner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></span>
      <div>${isModuleGateCase(w) ? t('gate.peekBannerModule', prevModuleGateParams(w)) : t('gate.peekBanner', { prev: tSetLabel(prevSetLabel(w)) })}</div>
    </div>`;
  /* A set is two panels now: the lesson ladder and the skills checklist. The
     in-panel tab bar that used to switch between them was hidden site-wide
     when the rail took over the job — it survived only as a place to hang an
     .active class nobody could see, so it's gone and switchTabById() drives
     the panels directly. The per-set Songs tab went with it: it was reachable
     only from that hidden bar, and the Songs hub (rail → Songs) already lists
     every song it did, Module 1's included, with the same play buttons. */
  return `${peekBanner}${eyebrow}
  <div id="${w.id}-${LESSON_TAB}" class="tab-panel tp-station-b active">${lessonHtml}${panelFooter(w,LESSON_TAB)}</div>
  <div id="${w.id}-checklist" class="tab-panel tp-checklist">${buildChecklist(w)}${panelFooter(w,'checklist')}</div>`;
}

/* Print one set as a clean one-pager (for days the Chromebooks/Wi-Fi fail).
   The @media print stylesheet does the heavy lifting — it force-shows the
   lesson ladder and the checklist (regardless of which tab is open) and hides
   the songs tab and all on-screen chrome — so this just fires the dialog. */
// The print stylesheet scopes what lands on the page, so this needs no id.
function printSet(){ window.print(); }
/* Printed handouts must show the collapsed hint/stuck/level-up prose —
   hidden fold panels don't print, so unhide them for the print pass and
   restore afterwards. */
let _printOpened = [];
// Same problem for the "About this set" disclosure: a closed <details>
// prints nothing, so a printed set sheet would silently lose its objectives
// and song-thread line unless it's forced open for the print pass.
let _printOpenedDetails = [];
window.addEventListener('beforeprint', ()=>{
  _printOpened = [...document.querySelectorAll('.step-fold-panel[hidden]')];
  _printOpened.forEach(d=>d.removeAttribute('hidden'));
  _printOpenedDetails = [...document.querySelectorAll('.set-about:not([open])')];
  _printOpenedDetails.forEach(d=>d.setAttribute('open',''));
});
window.addEventListener('afterprint', ()=>{
  _printOpened.forEach(d=>d.setAttribute('hidden',''));
  _printOpened = [];
  _printOpenedDetails.forEach(d=>d.removeAttribute('open'));
  _printOpenedDetails = [];
});

/* "About this set" now overlays content as a dropdown from the sticky
   eyebrow band, so it needs the same click-away/Escape idiom as the FAB tool
   popups (fab-tools.js) — native <details> doesn't close on outside click. */
document.addEventListener('click', e=>{
  const path = e.composedPath();
  document.querySelectorAll('.set-about[open]').forEach(d=>{
    if(!path.includes(d)) d.removeAttribute('open');
  });
});
document.addEventListener('keydown', e=>{
  if(e.key !== 'Escape') return;
  document.querySelectorAll('.set-about[open]').forEach(d=>d.removeAttribute('open'));
});

/* Hint / Stuck? / Level up pill tapped: open that pill's panel full-width
   below the pill row. Tab-style — one panel open at a time, tapping the
   open pill closes it (Jonathan's call, 2026-07-23). */
function toggleStepFold(btn){
  const wrap = btn.closest('.step-folds');
  const panel = document.getElementById(btn.getAttribute('aria-controls'));
  if(!wrap || !panel) return;
  const willOpen = panel.hasAttribute('hidden');
  wrap.querySelectorAll('.step-fold-pill').forEach(p=>p.setAttribute('aria-expanded','false'));
  wrap.querySelectorAll('.step-fold-panel').forEach(p=>p.setAttribute('hidden',''));
  if(willOpen){
    panel.removeAttribute('hidden');
    btn.setAttribute('aria-expanded','true');
  }
}

/* Generic tuning warm-up sections are superseded by the Daily 5 (which starts
   with the tune-up) for every module except Module 1: sectionsHtml() drops
   them from the numbered list and shows a Daily 5 pointer card instead. Any
   code that maps a section index back to rendered DOM (search, teacher
   dashboard response keys) must filter with this same predicate first, or
   its indexes drift from what's actually on screen. Kept at module scope
   (not a buildLesson() closure) so buildSearchIndex() can share it.

   Matched on the section's own `kind` tag, NOT on its title. Because the
   filter runs BEFORE sections are numbered, every stored progress key in
   these sets (`${set}-b-sec{gi}-{i}`) is a post-filter index — so a copy edit
   to the title alone used to shift every later section's namespace by one in
   27 sets across 11 modules, quietly moving students' done-marks, MC picks
   and written responses onto the wrong steps. The title is now free to
   change. The title clause stays as a backstop for a section that somehow
   ships without the tag; checks.mjs (1r) fails the push when the tag and the
   title disagree in either direction, so the two can't drift apart. */
function isTuningWarmupSection(sec, moduleNum){
  if(moduleNum === 1) return false;
  return sec.kind === 'tuning-warmup' || sec.title === 'Warm-up — tuning check (Module 1)';
}

/* The bolt that marks the Daily 5 and the Ear Spark cards. Lives here rather
   than in module data: an icon is presentation, so a card can't ship with the
   wrong one, and re-styling every bolt is a one-line change. */
const ICO_BOLT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ' +
  'style="width:1em;height:1em;vertical-align:-0.15em"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>';

/* Ear Spark — the optional ear-training bonus at the end of a ladder.
   Kind-ONLY (Today-first work order, Phase 3, rolled out module by module) —
   unlike isTuningWarmupSection's kind-or-title backstop, this exact title is
   reused across most modules, so a title fallback here would hide every
   module's Ear Spark section (and cost it the bolt icon below) the moment
   this code shipped, not just the ones tagged kind:'ear-spark' so far. A
   module not yet tagged just keeps its Ear Spark section fully visible
   (without the bolt) until a later session tags it. */
function isEarSparkSection(sec){
  return sec.kind === 'ear-spark';
}
function isEarSparkStep(s){
  return /^Ear Spark \(/.test(s.text || '');
}
/* Three more render-time-hidden section kinds, same Phase 3 rollout and the
   same kind-ONLY reasoning as isEarSparkSection above — every title below is
   reused across most modules, so matching on title would hide the whole
   course's copies at once instead of staging module by module.
     take-to-song — renders a Journey link card in place of its steps (3b),
       rather than being hidden outright.
     routine      — "My Practice Routine" weekly check-in (Module 1: "session
       check-in" — same kind, the title varies by module on purpose).
     reflection   — the mid-set Checkpoint and end-of-set Wrap-Up.
   checks.mjs 1ad checks kind → title (a tagged section's title must be one
   of these); it does NOT yet check the reverse (a matching title must carry
   the kind) — during the staged rollout that direction would flag every
   not-yet-tagged module as an error. Tighten it to match isTuningWarmupTag's
   full two-way check once every module is tagged (Phase 3, step 2/3). */
function isTakeToSongSection(sec){
  return sec.kind === 'take-to-song';
}
/* "Take It to a Song" is switched off in every module ladder (2026-10-18,
   Jonathan: "remove take it to a song from the steps of the modules"). The
   Journey link card (Modules 1–5) and the Challenge steps that took its
   place in Modules 6–12 are both gone from the ladder, like a routine or
   reflection section. Switched off, not deleted — the Daily 5 pattern: the
   sections stay in the module files (the section list is fixed in every
   rule-zero regime, and `gi` counts them), and flipping this to `true`
   restores the card and the 6–12 steps exactly as they were on 2026-10-17.
   One consequence: seven skills (m9w1-s5, m9w2-s5, m10w1-s4, m10w3-s6,
   m11w3-s6, m12w1-s6, m12w3-s6) had a take-to-song Challenge as their only
   teaching step; they stay on the checklist but have no "Show me where". */
const TAKE_TO_SONG_ENABLED = false;
function isRoutineSection(sec){
  return sec.kind === 'routine';
}
function isReflectionSection(sec){
  return sec.kind === 'reflection';
}

/* The chili that marks the spicy optional level-up card (Module 7's Sweet
   Child intro riff). Same rule as ICO_BOLT: the icon is presentation, so it
   lives here — module data stays plain text. */
const ICO_CHILI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ' +
  'style="width:1em;height:1em;vertical-align:-0.15em">' +
  '<path d="M16.5 7.5c1.2-.4 2.1-1.3 2.5-2.5"/>' +
  '<path d="M19 5c1 0 2-.3 2.7-1"/>' +
  '<path d="M16.5 7.5c2 .8 3 2.8 2.4 5.4-.7 3.2-3.4 6.3-7.4 7.9-3.2 1.3-6.5 1.2-8.5-.3 2.6-.2 4.6-1.2 6-2.9 1-1.2 1.6-2.7 2-4.5.5-2.6 2.2-4.8 5.5-5.6z"/></svg>';

/* Spicy level-up — the optional harder-goal card. Matched on the English
   title/text the same way isEarSparkSection()/isEarSparkStep() are, so the
   _es twin and any future translation come along for free. */
function isSpicyLevelUpSection(sec){
  return /^Level-up — the "Sweet Child/.test(sec.title || '');
}
function isSpicyLevelUpStep(s){
  return /^Learn the most famous riff/.test(s.text || '');
}

