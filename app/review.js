/* ── Module Review (self-assessment) ── */
function buildModuleReview(mr){
  const savedKey=`mr${mr.moduleNum}-reflection`;
  const saved=progress[savedKey]||{};
  const perfKey=`mr${mr.moduleNum}-performance`;
  const perf=progress[perfKey]||{};
  const mrId=`mr${mr.moduleNum}`;
  let qNum = 0;
  const rows=mr.skills.map(s=>{
    qNum++;
    const lvl=progress[s.id];
    const btn=(n)=>`<button class="mr-rb lvl${n}${lvl===String(n)?' active':''}" onclick="setSkillLevel('${s.id}','${mrId}','${n}')">${n}</button>`;
    const reviewLink = s.set
      ? `<button type="button" class="mr-review-link" onclick="goToSet('${s.set}')" title="${escAttr(t('review.backToLesson'))}">&#8617; ${t('review.reviewThis')}</button>`
      : '';
    return `<div class="mr-row">
      <div class="mr-skill-text"><span class="mr-q-num">${qNum}.</span> ${tf(s,'text')}${reviewLink}</div>
      <div class="mr-rating">${btn(1)}${btn(2)}${btn(3)}</div>
    </div>`;
  }).join('');
  const clickedNum = ++qNum;
  const hardNum = ++qNum;
  const playNum = ++qNum;
  const pLvl=perf.level;
  const pBtn=(n)=>`<button class="mr-rb lvl${n}${pLvl===String(n)?' active':''}" onclick="setPerformanceLevel(${mr.moduleNum},'${n}')">${n}</button>`;
  const playHtml=`<div class="mr-play">
      <span class="mr-play-tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> <span class="mr-q-num">${playNum}.</span> ${t('review.playRecord')}</span>
      <div class="mr-play-prompt">${t('review.playPrompt')}</div>
      <label class="mr-play-label" for="${mrId}-song">${t('review.songIPlayed')}</label>
      <input type="text" id="${mrId}-song" class="mr-play-song" oninput="savePerformance(${mr.moduleNum})" value="${escAttr(perf.song||'')}">
      <div class="mr-rec" data-module="${mr.moduleNum}">
        <div class="mr-rec-body" id="${mrId}-rec-body">${renderRecBody(String(mr.moduleNum))}</div>
      </div>
      <div class="mr-play-rate">
        <span class="mr-play-rate-label">${t('review.howDidItGo')}</span>
        <div class="mr-rating">${pBtn(1)}${pBtn(2)}${pBtn(3)}</div>
      </div>
    </div>`;
  const assessItemsEs = tf(mr,'assessItems');
  const assessBody = (mr.assessItems && mr.assessItems.length)
    ? `${t('review.assessBodyItems')}<ul class="mr-assess-list">${mr.assessItems.map((i,ii)=>`<li>${assessItemsEs[ii]}</li>`).join('')}</ul>`
    : t('review.assessBodyDflt');
  const performanceHtml=`<div class="mr-assess-box">
      <div class="mr-assess-head"><span class="mr-assess-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v-.5a1.5 1.5 0 0 1 3 0V3"/><path d="M8 9h8M8 13h8M8 17h5"/></svg></span> ${t('review.assessHead',{n:mr.moduleNum})}</div>
      <div class="mr-assess-body">${assessBody}</div>
      <div class="mr-rec mr-assess-rec" data-module="${mr.moduleNum}">
        <div class="mr-assess-rec-tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4M9 21h6"/></svg> ${t('review.assessRecTag')}</div>
        <div class="mr-rec-body" id="${mrId}a-rec-body">${renderRecBody(`${mr.moduleNum}a`)}</div>
      </div>
      <div class="mr-assess-signup">
        <span class="mr-assess-signup-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4M16 3v4"/><path d="M9 15l2 2 4-4"/></svg></span>
        <div class="mr-assess-signup-text"><strong>${t('review.assessSignupHead')}</strong> ${t('review.assessSignupBody',{n:mr.moduleNum})}</div>
      </div>
    </div>`;
  const forwardHtml = mr.forward
    ? `<div class="ablock mr-forward" style="margin-top:12px"><div class="albl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M9 15l6-6"/><path d="M8 12l-1.5 1.5a3.5 3.5 0 0 0 5 5L13 17"/><path d="M16 12l1.5-1.5a3.5 3.5 0 0 0-5-5L11 7"/></svg> ${t('review.whyMatters')}</div><div class="atxt">${tf(mr,'forward')}</div></div>`
    : '';
  return `
    <div class="mr-locked-banner">
      <span class="mr-locked-banner-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg></span>
      <div><strong>${t('review.previewOnly')}</strong> ${t('review.previewBodyHtml')}</div>
    </div>
    <div class="obj-card">
      <span class="mr-tag">${t('review.tag',{n:mr.moduleNum})}</span>
      <h2 class="obj-main">${tf(mr,'module')}</h2>
      <div class="obj-sub">${t('review.rateReflect')}</div>
    </div>
    <div class="mr-skills">${rows}</div>
    <div class="mr-legend">
      <span class="mr-legend-item"><span class="mr-legend-dot lvl1"></span>1 = <span data-i18n="skill.stillLearning">${t('skill.stillLearning')}</span></span>
      <span class="mr-legend-item"><span class="mr-legend-dot lvl2"></span>2 = <span data-i18n="skill.gettingIt">${t('skill.gettingIt')}</span></span>
      <span class="mr-legend-item"><span class="mr-legend-dot lvl3"></span>3 = <span data-i18n="skill.gotItShort">${t('skill.gotItShort')}</span></span>
    </div>
    <div class="ablock" style="margin-top:18px">
      <div class="albl"><span class="mr-q-num">${clickedNum}.</span> ${t('review.whatClicked')}</div>
      <textarea id="${mrId}-clicked" class="reflection-ta" placeholder="${escAttr(t('review.whatClickedPh'))}" oninput="saveReflection(${mr.moduleNum})">${escHtml(saved.clicked||'')}</textarea>
    </div>
    <div class="ablock" style="margin-top:12px">
      <div class="albl"><span class="mr-q-num">${hardNum}.</span> ${t('review.whatsHard')}</div>
      <textarea id="${mrId}-hard" class="reflection-ta" placeholder="${escAttr(t('review.whatsHardPh'))}" oninput="saveReflection(${mr.moduleNum})">${escHtml(saved.hard||'')}</textarea>
    </div>
    ${playHtml}
    ${performanceHtml}
    ${forwardHtml}
    <div class="mr-done${isMrComplete(mr.moduleNum)?' is-done':''}" id="${mrId}-done">${buildMrDoneInner(mr.moduleNum)}</div>
    <div class="save-ind" id="${mrId}-save-ind" style="margin-top:10px" aria-live="polite"></div>`;
}

/* ── The review's finish line: "I've finished this review" ──
   The panel used to just stop. A student could rate every row, write both
   reflections, and get no signal that they were done or that the next module
   was now theirs — the only way on was to notice the dropdown had un-locked.
   The button is enabled by the SAME condition the cross-module gate uses
   (every self-rating row rated — see isModuleGateLocked), so what it promises
   and what actually unlocks can't drift apart.
   The mrN-complete key it writes is a DISPLAY state only: nothing gates on it.
   That's deliberate — students who finished a review before this button
   existed must never be sent back to press it, and a gate that could be
   un-pressed is a gate that can re-lock someone out of work they finished. */
function mrRowsLeft(moduleNum){
  const mr = MODULE_REVIEWS[moduleNum];
  if(!mr) return 0;
  return (mr.skills||[]).filter(s=>{ const v=progress[s.id]; return !(v==='1'||v==='2'||v==='3'); }).length;
}
/* Stored as 'gotit' rather than true: loadProgress() normalizes any value it
   doesn't recognize down to 'none', and 'gotit' round-trips through both it
   and the teacher console's copy of the same normalizer. */
function isMrComplete(moduleNum){ return progress[`mr${moduleNum}-complete`]==='gotit'; }
/* The module after this one, or null at the end of the course. Module 13
   (String Changing) IS a legitimate "next" here — it sits outside the
   sequential gate, not outside the course; it just has no review of its own. */
function nextModuleAfter(moduleNum){
  return (typeof MODULE_MANIFEST!=='undefined' ? MODULE_MANIFEST.find(m=>m.num===moduleNum+1) : null) || null;
}
function buildMrDoneInner(moduleNum){
  const left = mrRowsLeft(moduleNum);
  const done = isMrComplete(moduleNum);
  const next = nextModuleAfter(moduleNum);
  const nextLine = next
    ? t('review.doneNext', { num: next.num, mod: escHtml(tf(next,'name')) })
    : t('review.doneLast');
  const head = done ? t('review.doneTitleDone', { n: moduleNum })
             : left ? t('review.doneTitleTodo')
                    : t('review.doneTitleReady');
  const body = left ? t('review.doneLeft', { n: left }) : nextLine;
  const btn = done
    ? (next ? `<button type="button" class="panel-next-btn mr-done-btn" onclick="goToNextModule(${moduleNum})">${escHtml(t('review.doneGo',{num:next.num}))} &rarr;</button>` : '')
    : `<button type="button" class="panel-next-btn mr-done-btn"${left?' disabled':''} onclick="finishModuleReview(${moduleNum})">${escHtml(t('review.doneBtn'))} &rarr;</button>`;
  return `<div class="mr-done-text">
      <div class="mr-done-head">${done?'<span class="mr-done-check" aria-hidden="true">&#10003;</span> ':''}${head}</div>
      <div class="mr-done-body">${body}</div>
    </div>${btn}`;
}
/* Re-render the card in place — the last unrated row becoming rated is what
   flips the button on, and that happens without rebuilding the panel. */
function syncMrDone(moduleNum){
  const el = document.getElementById(`mr${moduleNum}-done`);
  if(!el) return;
  el.classList.toggle('is-done', isMrComplete(moduleNum));
  el.innerHTML = buildMrDoneInner(moduleNum);
}
function finishModuleReview(moduleNum){
  if(isReviewPanelLocked(`mr${moduleNum}`)) return;   // preview panel — not theirs to finish
  const left = mrRowsLeft(moduleNum);
  if(left){ gateToast(t('review.doneLeftToast',{n:left})); return; }
  progress[`mr${moduleNum}-complete`]='gotit';
  saveProgress();
  syncMrDone(moduleNum);
  renderPills(moduleNum);              // the review row goes green
  gateToast(t('review.doneToast',{n:moduleNum}));
  goToNextModule(moduleNum);
}
/* Move the student on. Same path the module dropdown takes, so everything
   that hangs off a module change (panels, pills, resume card) still runs. */
function goToNextModule(moduleNum){
  const next = nextModuleAfter(moduleNum);
  if(!next) return;                    // last module: the card says so, no button
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(next.num);
  onModuleChange(next.num);
  saveProgress();
}

/* ── Assessment pop-up, every time the review is opened ──
   The assessment box itself stays where it has always been, at the bottom of
   the review panel — this fires whenever the student opens the panel, so the
   in-person assessment can't be scrolled past unseen. Deliberately NOT
   once-per-visit (Jonathan's call, 2026-08-13): the point is that every trip
   to the review restates what the assessment asks for. Skipped on a locked
   (preview) panel — the review isn't theirs to take yet.

   "Every trip to the review" means every trip a student actually takes —
   not activateSet() rebuilding the panel in the background while an explore
   page sits on top of it (see the pendingMrAssessModule handoff in
   activateSet()/syncExploreNav() above). */
let pendingMrAssessModule = null;
function maybeShowMrAssess(moduleNum){
  const mr = MODULE_REVIEWS[moduleNum];
  if(!mr) return;
  if(isReviewPanelLocked(`mr${moduleNum}`)) return;
  closeMrAssess();   // never stack two overlays on the same id
  const ov = document.createElement('div');
  ov.className = 'daily5-overlay';
  ov.id = 'mr-assess-overlay';
  ov.dataset.module = moduleNum;   // so setLang can rebuild the body in place
  ov.innerHTML = `<div class="daily5-modal mr-assess-modal" role="dialog" aria-modal="true" aria-label="${escAttr(t('review.assessHead',{n:moduleNum}))}">${buildMrAssessPop(moduleNum)}</div>`;
  ov.addEventListener('click', e => { if(e.target === ov) closeMrAssess(); });
  document.body.appendChild(ov);
  document.addEventListener('keydown', mrAssessEscClose);
  openOverlay(ov);
}
/* Modal body, split out so a language switch can re-render it in place —
   same treatment setLang gives the Daily 5 overlay. */
function buildMrAssessPop(moduleNum){
  const mr = MODULE_REVIEWS[moduleNum];
  const itemsTf = tf(mr,'assessItems');
  const body = (mr.assessItems && mr.assessItems.length)
    ? `<p>${t('review.assessPopIntro',{n:moduleNum})}</p><ul class="mr-assess-list">${mr.assessItems.map((i,ii)=>`<li>${itemsTf[ii]}</li>`).join('')}</ul>`
    : `<p>${t('review.assessPopIntroDflt',{n:moduleNum})}</p>`;
  return `<div class="daily5-head"><h3 style="font:inherit;margin:0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:16px;height:16px;vertical-align:-2px;margin-right:2px"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v-.5a1.5 1.5 0 0 1 3 0V3"/><path d="M8 9h8M8 13h8M8 17h5"/></svg> ${t('review.assessHead',{n:moduleNum})}</h3>
      <button type="button" class="tp-close" onclick="closeMrAssess()" aria-label="${escAttr(t('gate.closeAria'))}">&#x2715;</button></div>
    <div class="mr-assess-pop-body">${body}<p class="mr-assess-pop-note">${t('review.assessPopNote')}</p></div>
    <div class="mr-assess-actions">
      <button type="button" class="mr-assess-later" onclick="closeMrAssess()">${escHtml(t('review.assessPopLater'))}</button>
    </div>`;
}
function mrAssessEscClose(e){ if(e.key === 'Escape') closeMrAssess(); }
function closeMrAssess(){
  const ov = document.getElementById('mr-assess-overlay');
  if(!ov) return;
  ov.remove();
  document.removeEventListener('keydown', mrAssessEscClose);
  closeOverlay();
}
/* Jump from a module-review skill back to the lesson set that teaches it. */
function goToSet(setId){
  lastSetId = setId;
  activateSet(setId);
  saveProgress();
  const pill = document.querySelector(`.wpill[data-id="${setId}"]`);
  if(pill) pill.scrollIntoView({block:'nearest', inline:'nearest'});
  // activateSet() already restored this set's scroll (or top on first open).
}

function isReviewPanelLocked(mrId){
  const panel = document.querySelector(`.week-panel[data-id="${mrId}"]`);
  return !!(panel && panel.classList.contains('mr-locked'));
}

function saveReflection(moduleNum){
  if(isReviewPanelLocked(`mr${moduleNum}`)) return;
  const clicked=document.getElementById(`mr${moduleNum}-clicked`).value;
  const hard=document.getElementById(`mr${moduleNum}-hard`).value;
  const key=`mr${moduleNum}-reflection`;
  /* After a failed load the boxes render empty, so the box the student did
     not type in is "unknown", not "cleared": send only boxes with text, and
     flushSave's merge keeps the stored other one (progressLoadFailed).
     Accepted cost, on failed-load sessions only: text typed and then erased
     stays saved, because the erase is not sent. */
  const v={clicked,hard};
  if(progressLoadFailed) Object.keys(v).forEach(k=>{ if(!v[k]) delete v[k]; });
  const next=Object.assign({}, progress[key], v);
  // Nothing to say: an EMPTY map sent with merge REPLACES the stored one (the
  // same hazard as LOAD_FAILED_EMPTY_MAPS), so send nothing at all.
  if(!Object.keys(next).length) return;
  progress[key]=next;
  saveProgress();
}

function setSkillLevel(sid, mrId, level){
  if(isReviewPanelLocked(mrId)) return;
  progress[sid] = (progress[sid] === level) ? 'none' : level;
  const lvl = progress[sid];
  document.querySelectorAll(`.week-panel[data-id="${mrId}"] .mr-row`).forEach(row=>{
    const btns = row.querySelectorAll('.mr-rb');
    if(!btns.length) return;
    const onclick = btns[0].getAttribute('onclick') || '';
    if(!onclick.includes(`'${sid}'`)) return;
    btns.forEach(b=>{
      const n = b.classList.contains('lvl1') ? '1' : b.classList.contains('lvl2') ? '2' : '3';
      b.classList.toggle('active', lvl === n);
    });
  });
  // Rating the last mrN row can be the exact action that finishes a module
  // and unlocks the next one's Set 1 — same live-refresh toggleSkill already
  // does for the plain got-it gate, so the 🔒 (dropdown) and peek banner
  // (pill rail) drop without a reload.
  renderPills(lastModuleNum);
  populateModuleDropdown();
  // ...and the finish-line card at the bottom of this very panel: rating the
  // last row is what enables its button.
  if(/^mr\d+$/.test(mrId)) syncMrDone(Number(mrId.slice(2)));
  saveProgress();
}

function savePerformance(moduleNum){
  if(isReviewPanelLocked(`mr${moduleNum}`)) return;
  const key=`mr${moduleNum}-performance`;
  const songEl=document.getElementById(`mr${moduleNum}-song`);
  // Only the field this control sets. After a failed load the local entry is
  // empty, and writing the other field as ''/null would wipe the stored one.
  const song=songEl?songEl.value:'';
  /* After a failed load an empty box is "unknown", not "cleared" (the stored
     song was never shown), so it sends nothing — the same rule saveReflection
     follows. Accepted cost, on failed-load sessions only: text typed and then
     erased stays saved, because the erase is not sent. */
  if(progressLoadFailed && !song) return;
  progress[key]=Object.assign({}, progress[key], {song});
  saveProgress();
}

function setPerformanceLevel(moduleNum, level){
  if(isReviewPanelLocked(`mr${moduleNum}`)) return;
  const key=`mr${moduleNum}-performance`;
  const cur=progress[key]||{};
  const newLvl=(cur.level===level)?null:level;
  progress[key]=Object.assign({}, cur, {level:newLvl});   // only the level — see savePerformance
  const rate=document.querySelector(`.week-panel[data-id="mr${moduleNum}"] .mr-play-rate .mr-rating`);
  if(rate){
    rate.querySelectorAll('.mr-rb').forEach(b=>{
      const n=b.classList.contains('lvl1')?'1':b.classList.contains('lvl2')?'2':'3';
      b.classList.toggle('active', newLvl===n);
    });
  }
  saveProgress();
}

/* ══════════════════════════════════════════════
   RECORD YOURSELF — MediaRecorder
   One in-memory state object per recorder SLOT. A slot is a string key:
   the module number ("3") for the "Play it & Record it!" widget, and
   "<n>a" ("3a") for the assessment practice-run widget in the same panel.
   Two slots in one panel record independently.
   ══════════════════════════════════════════════ */
const recState = {};
const REC_MAX_SECS = 90;

/* Renders the current state of one recorder slot.
   Recordings are kept only in-memory for the current browser tab —
   nothing is uploaded. Students can play back and Download. */
function renderRecBody(slot){
  const s = recState[slot] || {};
  if (s.recording){
    return `<div class="mr-rec-active">
      <span class="mr-rec-dot"></span>
      <span class="mr-rec-time" id="mr${slot}-rec-time">0:00</span>
      <button type="button" class="mr-rec-stop" onclick="stopRec('${slot}')">&#x25A0; ${t('rec.stop')}</button>
      <span class="mr-rec-max">${t('rec.max',{s:REC_MAX_SECS})}</span>
    </div>`;
  }
  if (s.pendingBlobUrl){
    return `<div class="mr-rec-preview">
      <audio controls src="${s.pendingBlobUrl}" class="mr-rec-audio"></audio>
      <div class="mr-rec-actions">
        <button type="button" class="mr-rec-btn" onclick="downloadRec('${slot}')">&#x2B07; ${t('rec.download')}</button>
        <button type="button" class="mr-rec-btn" onclick="discardRec('${slot}')">&#x21BB; ${t('rec.rerecord')}</button>
      </div>
      <div class="mr-rec-status">${t('rec.listenBack')}</div>
    </div>`;
  }
  return `<div class="mr-rec-idle">
    <button type="button" class="mr-rec-btn primary" onclick="startRec('${slot}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4M9 21h6"/></svg> ${t('rec.record')}</button>
    <span class="mr-rec-help">${t('rec.help',{s:REC_MAX_SECS})}</span>
  </div>`;
}

function refreshRecUI(slot){
  const host = document.getElementById(`mr${slot}-rec-body`);
  if (!host) return;
  host.innerHTML = renderRecBody(slot);
  // The rail recorder tile pulses red while its slot is recording, visible
  // even with the popup closed — mirrors the timer FAB's done-flash cue.
  // The open card's bar has its own Record button while the rail is folded
  // away (caBarFabsHtml), so it pulses too.
  if (slot === 'fab'){
    const live = !!(recState.fab && recState.fab.recording);
    document.querySelectorAll('#fab-rec, .ca-bar-tool[data-tool="rec"]').forEach(b => b.classList.toggle('rec-live', live));
  }
}

async function startRec(slot){
  if (!navigator.mediaDevices || !window.MediaRecorder){
    alert(t('rec.noSupport'));
    return;
  }
  // Re-entry guard: a second tap while getUserMedia's permission prompt is
  // still up (or while already recording) would overwrite recState[slot]
  // below and orphan the first stream — mic stays live with nothing left
  // holding a reference to stop it.
  if (recState[slot] && (recState[slot].starting || recState[slot].recording)) return;
  if (recState[slot] && recState[slot].pendingBlobUrl) URL.revokeObjectURL(recState[slot].pendingBlobUrl);
  // One mic owner at a time (the tuner/Coach/games all evict each other the
  // same way): recording alongside the Coach's processing-off stream would
  // put two sessions with conflicting constraints on the same device.
  if (typeof coachInterrupt === 'function') coachInterrupt();
  if (typeof gamesStopMic === 'function') gamesStopMic();
  if (typeof stopTuner === 'function') stopTuner();
  recState[slot] = { starting: true };
  const pending = recState[slot];
  let stream = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    // The slot was cleared (stopAnyRec) or restarted while the permission
    // prompt was up — release the just-granted stream and bow out quietly.
    if (recState[slot] !== pending){
      stream.getTracks().forEach(tr => tr.stop());
      return;
    }
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    recorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
      const s = recState[slot] || {};
      s.recording = false;
      s.pendingBlob = blob;
      s.pendingBlobUrl = URL.createObjectURL(blob);
      s.statusMsg = '';
      if (s.timerInterval){ clearInterval(s.timerInterval); s.timerInterval = null; }
      if (s.autoStopTimeout){ clearTimeout(s.autoStopTimeout); s.autoStopTimeout = null; }
      recState[slot] = s;
      refreshRecUI(slot);
    };
    const start = Date.now();
    recState[slot] = {
      recording: true,
      recorder,
      stream,
      startedAt: start,
      timerInterval: setInterval(() => {
        const el = document.getElementById(`mr${slot}-rec-time`);
        if (!el) return;
        const sec = Math.floor((Date.now() - start) / 1000);
        el.textContent = `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
      }, 250),
      autoStopTimeout: setTimeout(() => stopRec(slot), REC_MAX_SECS * 1000)
    };
    recorder.start();
    refreshRecUI(slot);
  } catch (err) {
    // Also reached when the MediaRecorder constructor or start() throws
    // AFTER the mic was granted — release the stream, or it stays live with
    // no UI and no recState entry left to stop it.
    if (stream) stream.getTracks().forEach(tr => tr.stop());
    const s = recState[slot];
    // Only clean up (and alert about) an entry this invocation owns — the
    // slot may have been cleared by stopAnyRec during the permission prompt
    // and even restarted by a fresh tap since.
    if (s && (s === pending || s.stream === stream)){
      if (s.timerInterval) clearInterval(s.timerInterval);
      if (s.autoStopTimeout) clearTimeout(s.autoStopTimeout);
      delete recState[slot];
      refreshRecUI(slot);
      alert(t('rec.micFail', {err: err.message || err.name || 'permission denied'}));
    }
  }
}

function stopRec(slot){
  const s = recState[slot];
  if (!s || !s.recorder) return;
  if (s.recorder.state !== 'inactive') s.recorder.stop();
}

/* Navigating away mid-recording would otherwise leave the mic live for up
   to REC_MAX_SECS — every other mic feature on the site stops on navigation,
   so the recorder does too. Called from activateSet (which passes keepFab:
   the rail recorder is a persistent site-wide tool with a pulsing tile —
   switching sets to read a chord chart mid-take shouldn't truncate it) and,
   without options, from startTuner/coachOpen (those need the mic itself, so
   every slot stops, fab included). */
function stopAnyRec(opts){
  Object.keys(recState).forEach(m => {
    if (opts && opts.keepFab && m === 'fab') return;
    const s = recState[m];
    if (!s) return;
    if (s.recording) stopRec(m);
    // A slot still waiting on getUserMedia has no recorder to stop — drop
    // the entry so the slot isn't stuck in `starting` forever; startRec sees
    // the swap and releases the stream if permission is granted later.
    else if (s.starting){ delete recState[m]; refreshRecUI(m); }
  });
}

function discardRec(slot){
  const s = recState[slot];
  if (s && s.pendingBlobUrl) URL.revokeObjectURL(s.pendingBlobUrl);
  delete recState[slot];
  refreshRecUI(slot);
}

function downloadRec(slot){
  const s = recState[slot];
  if (!s || !s.pendingBlobUrl) return;
  const a = document.createElement('a');
  a.href = s.pendingBlobUrl;
  a.download = `guitar-class-mr${slot}-${new Date().toISOString().slice(0,10)}.webm`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ── Checklist ── */
/* A skill about a specific core song links to that song's Song Journey page
   (2026-10-18, Jonathan — in place of the "Take It to a Song" box, which is
   switched off). `skill.journey` is [{ song, layer }]; the field is documented
   in module-2.js's schema comment and checked by checks.mjs 1ab3. It opens
   through openSongLink(), the one door for song links: a play-along card for
   that layer if students can open one, else the page at #layer-N. The label
   reuses ca.openJourney and carries data-i18n-params, since the checklist is
   built once and would otherwise stay in its first language. */
function skillJourneyHtml(s){
  return (s.journey || []).map(j => {
    const sg = SONG_JOURNEYS.find(x => x.id === j.song);
    if(!sg) return '';
    const params = { song: sg.name };
    return `<button type="button" class="sk-where-btn sk-song-btn" onclick="openSongLink('${escAttr(sg.id)}', ${Number(j.layer) || 0})"><span data-i18n="ca.openJourney" data-i18n-params="${escAttr(JSON.stringify(params))}">${escHtml(t('ca.openJourney', params))}</span> &#x2197;</button>`;
  }).join('');
}
function buildChecklist(w){
  if(!w.skills||w.skills.length===0) return `<p style="font-size:0.9375rem;color:var(--text2);padding:12px 0">${t('skill.noneListed')}</p>`;
  const done=w.skills.filter(s=>progress[s.id]==='gotit').length;
  const pct=Math.round(done/w.skills.length*100);
  const wkSvg=`<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" stroke="var(--amber-text)" stroke-width="1.5"/><path d="M6 4v2.2l1.4 1.4" stroke="var(--amber-text)" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  const giSvg=`<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="var(--green-text)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const rows=w.skills.map((s,i)=>{
    const st=progress[s.id]||'none';
    const skillText = tf(s,'text');
    const helper = s.gotItWhen ? `
        <button type="button" class="sk-toggle" onclick="toggleGotIt('${s.id}', this)" aria-expanded="false" aria-controls="gi-${s.id}"><span class="sk-toggle-arrow">▾</span> <span data-i18n="skill.whatDoesThisLookLike">${t('skill.whatDoesThisLookLike')}</span></button>
        <div class="sk-helper" id="gi-${s.id}" hidden><strong class="got-it-lab" data-i18n="skill.youveGotItWhen">${t('skill.youveGotItWhen')}</strong>${tf(s,'gotItWhen')}</div>` : '';
    const practiceBtn = s.practice ? `
        <button type="button" class="sk-practice-btn" onclick="togglePracticePanel('${s.id}', this)" aria-expanded="false" aria-controls="pp-${s.id}"><span class="sk-practice-btn-arrow">▸</span> ${t('step.practiceThis')}</button>` : '';
    const skillNum = (s.id.match(/-s(\d+)$/) || [])[1];
    const whereBtn = (skillNum && skillTaughtStation(w, Number(skillNum)))
      ? `<button type="button" class="sk-where-btn" onclick="showSkillLesson('${w.id}', ${skillNum})" title="${escAttr(t('skill.jumpToSteps'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.3"/></svg> <span data-i18n="skill.showMeWhere">${t('skill.showMeWhere')}</span></button>` : '';
    const practicePanel = s.practice ? renderPracticePanel(s.practice, s.id, w.id) : '';
    const songBtns = skillJourneyHtml(s);
    return `<div class="skill-row" data-sid="${escAttr(s.id)}">
      <div class="sktxt"><div class="sn" style="flex-shrink:0;margin-top:0;margin-right:8px">${i+1}</div><div class="sk-body"><div class="sk-label">${skillText}</div>${helper}${practiceBtn}${whereBtn}${songBtns}</div></div>
      <div class="skchk-cell working-col${st==='working'?' active':''}" role="button" tabindex="0" aria-pressed="${st==='working'}" aria-label="${escAttr(t('skill.ariaStillWorking',{skill:skillText}))}" onclick="toggleSkill('${s.id}','${w.id}','working')" title="Still working on it" data-i18n-attr="title:skill.stillWorking"><div class="skbox">${st==='working'?wkSvg:''}</div></div>
      <div class="skchk-cell gotit-col${st==='gotit'?' active':''}" role="button" tabindex="0" aria-pressed="${st==='gotit'}" aria-label="${escAttr(t('skill.ariaGotIt',{skill:skillText}))}" onclick="toggleSkill('${s.id}','${w.id}','gotit')" title="I've got it!" data-i18n-attr="title:skill.gotIt"><div class="skbox">${st==='gotit'?giSvg:''}</div></div>
      ${practicePanel}
    </div>`;
  }).join('');
  return `<div class="review-slot" id="rc-${w.id}">${reviewCardHtml()}</div>
  <div class="cl-intro" data-i18n="skill.checklistIntro">${t('skill.checklistIntro')}</div>
  <div class="cl-grid-wrap">
    <div class="cl-header"><div class="cl-header-skill" data-i18n="skill.clHeaderSkill">${t('skill.clHeaderSkill')}</div><div class="cl-header-working" data-i18n-html="skill.clHeaderWorkingHtml">${t('skill.clHeaderWorkingHtml')}</div><div class="cl-header-gotit" data-i18n-html="skill.clHeaderGotItHtml">${t('skill.clHeaderGotItHtml')}</div></div>
    ${rows}
  </div>
  <div class="prog-wrap"><div class="prog-row"><div class="prog-bg"><div class="prog-fill" id="pf-${w.id}" style="width:${pct}%"></div></div><div class="prog-lbl" id="pl-${w.id}">${done} / ${w.skills.length}</div></div></div>
  <div class="song-echo" id="se-${w.id}" aria-live="polite"></div>
  <div class="save-ind" id="si-${w.id}" aria-live="polite"></div>`;
}

/* ── Toggle "What does this look like?" helper ── */
function toggleGotIt(sid, btn){
  const panel = document.getElementById('gi-'+sid);
  if(!panel) return;
  const isOpen = !panel.hasAttribute('hidden');
  if(isOpen){
    panel.setAttribute('hidden','');
    btn.setAttribute('aria-expanded','false');
  } else {
    panel.removeAttribute('hidden');
    btn.setAttribute('aria-expanded','true');
  }
}

/* ── Per-skill practice panel ── */
/* The playSeq row (▶ Play button + BPM slider + optional Listening Coach) is
   shared by the 'playSeq' panel and the 'fretboard' panel (which keeps the
   listen-through as a helper under the game). */
function playSeqControlsHtml(practice, skillId){
  const label = (practice.label && tf(practice,'label')) || t('step.playAll');
  const defBpm = practice.bpm || 60;
  const minBpm = practice.minBpm || 40;
  const maxBpm = practice.maxBpm || 120;
  const key = `bpm:practice:${skillId}`;
  const bpm = readStoredBpm(key, defBpm);
  const midis = JSON.stringify(practice.notes || []);
  const hasHolds = (practice.notes || []).some(n => n && typeof n === 'object' && !Array.isArray(n));
  return `<div class="bpm-control-group">` +
    `<button type="button" class="play-seq-btn" data-midis="${escAttr(midis)}" onclick="playSequenceFromGroup(this)" title="${escAttr(t('step.playAll'))}">&#x25B6; ${escHtml(label)}</button>` +
    renderBpmControl(key, bpm, minBpm, maxBpm) +
    (hasHolds ? '' : coachBtnHtml(midis, null, skillId)) +
  `</div>`;
}
function renderPracticePanel(practice, skillId, wid){
  if(!practice || !practice.type) return '';
  if(practice.type === 'playSeq'){
    return `<div class="sk-practice-panel" id="pp-${skillId}" hidden>` +
      `<div class="sk-practice-title">${t('step.practiceThis')}</div>` +
      renderRepStrip(skillId) +
      playSeqControlsHtml(practice, skillId) +
      `<div class="rep-actions"><button type="button" class="rep-log-btn" onclick="logCleanRep('${skillId}', this)">&#x2713; <span data-i18n="rep.logClean">${t('rep.logClean')}</span></button></div>` +
    `</div>`;
  }
  if(practice.type === 'fretboard'){
    /* Find-the-Note game: practice.string 'lowE' | 'A' | 'both' (see fgBoardSvg). */
    // A rebuild (language switch, panel re-render) puts the setup screen back
    // on top of whatever round was in flight — drop the stale state so the
    // student starts fresh, like the shuffle/deck/ear drills reset theirs.
    delete fretGames[skillId];
    const kind = practice.string || 'lowE';
    const e = practiceLog[skillId];
    const bestHtml = (e && e.best != null)
      ? `<span data-i18n="fret.best" data-i18n-params='{"n":${e.best},"total":${FG_ROUND}}'>${t('fret.best',{n:e.best,total:FG_ROUND})}</span>` : '';
    const playRow = (practice.notes && practice.notes.length) ? playSeqControlsHtml(practice, skillId) : '';
    return `<div class="sk-practice-panel" id="pp-${skillId}" hidden>` +
      `<div class="sk-practice-title">${t('step.practiceThis')}</div>` +
      renderRepStrip(skillId) +
      `<div class="fg-wrap" id="fg-${skillId}" data-kind="${escAttr(kind)}">` +
        `<div class="fg-head">` +
          `<div class="fg-status">` +
            `<span class="fg-intro" data-i18n-html="fret.introHtml" data-i18n-params='{"total":${FG_ROUND}}'>${t('fret.introHtml',{total:FG_ROUND})}</span>` +
            `<button type="button" class="fg-start-btn" onclick="fgStart('${skillId}')" data-i18n="fret.startRound">${t('fret.startRound')}</button>` +
          `</div>` +
          `<div class="fg-best">${bestHtml}</div>` +
        `</div>` +
        `<div class="fg-board">${fgBoardSvg(skillId, kind)}</div>` +
        `<div class="fg-fb" aria-live="polite"></div>` +
      `</div>` +
      playRow +
    `</div>`;
  }
  if(practice.type === 'chord' && Array.isArray(practice.chords)){
    /* Chord drill: diagram(s) via the existing chordDiagramSVG renderer +
       Listening Coach chord check + self-reported clean-rep logging.
       Schema: {type:'chord', chords:[{name, chord:[[string,fret,finger]…],
       position}], label} — same chord spec shape as station-step s.chords. */
    // Trusted HTML, same as step text: fields — module data is repo-authored.
    const promptHtml = practice.label ? `<div class="sk-practice-prompt">${tf(practice,'label')}</div>` : '';
    const boxes = practice.chords.map(c =>
      `<div class="chord-box">${chordDiagramSVG(c)}${c.name ? `<div class="chord-box-label">${escHtml(tf(c,'name'))}</div>` : ''}</div>`).join('');
    return `<div class="sk-practice-panel" id="pp-${skillId}" hidden>` +
      `<div class="sk-practice-title">${t('step.practiceThis')}</div>` +
      renderRepStrip(skillId) +
      promptHtml +
      `<div class="chord-diagrams">${boxes}</div>` +
      coachChordBtnRowHtml(practice.chords, skillId) +
      `<div class="rep-actions"><button type="button" class="rep-log-btn" onclick="logCleanRep('${skillId}', this)">&#x2713; <span data-i18n="rep.logClean">${t('rep.logClean')}</span></button></div>` +
    `</div>`;
  }
  if(practice.type === 'pr'){
    /* Structured tempo ladder: {type:'pr', prompt, unit:'BPM'|'count',
       placeholder}. Persists through the SAME path as the regex-promoted PR
       steps — responses[`practice-<skillId>`] as an 8-entry {value,date}
       history via onResponseChange(key, value, true) — but declared in data,
       no prompt-text heuristic. Committing a new value (blur) logs one rep. */
    const key = `practice-${skillId}`;
    const unit = practice.unit === 'count' ? 'count' : 'BPM';
    const unitKey = unit === 'count' ? 'pr.unitCount' : 'pr.unitBpm';
    const latest = prLatestValue(responses[key]);
    // Trusted HTML, same as step text: fields — module data is repo-authored.
    const promptHtml = practice.prompt ? `<div class="sk-practice-prompt">${tf(practice,'prompt')}</div>` : '';
    const ph = practice.placeholder ? tf(practice,'placeholder') : t('step.answerPlaceholder');
    return `<div class="sk-practice-panel" id="pp-${skillId}" hidden>` +
      `<div class="sk-practice-title">${t('step.practiceThis')}</div>` +
      renderRepStrip(skillId) +
      promptHtml +
      `<div class="pr-input-row">` +
        `<input type="text" inputmode="numeric" class="pr-input" placeholder="${escAttr(ph)}" value="${escAttr(latest)}" aria-label="${escAttr(t('pr.inputAria'))}" oninput="onResponseChange('${key}', this.value, true)" onblur="onPracticePrBlur('${skillId}')">` +
        `<span class="pr-unit" data-i18n="${unitKey}">${t(unitKey)}</span>` +
      `</div>` +
      `<div class="pr-stats" id="pr-stats-${skillId}" data-unit="${unit}">${prStatsInner(skillId, unit)}</div>` +
    `</div>`;
  }
  if(practice.type === 'mc' && Array.isArray(practice.choices)){
    const key = `practice-${skillId}`;
    const storedRaw = responses[key];
    const storedIdx = (storedRaw === '' || storedRaw == null) ? -1 : parseInt(storedRaw, 10);
    const ansIdx = (typeof practice.answer === 'number') ? practice.answer : -1;
    const choicesEs = tf(practice,'choices');
    /* Display order is shuffled, but data-idx / storedIdx stay ORIGINAL
       indices — this panel persists the index, not the choice text. */
    const opts = mcOrder(practice.choices, mcSeed(practice)).map(idx=>{
      let cls = 'sk-practice-mc-opt';
      if(storedIdx === idx){
        cls += (idx === ansIdx) ? ' correct' : ' incorrect';
      }
      return `<button type="button" class="${cls}" aria-pressed="${storedIdx === idx}" data-idx="${idx}" onclick="onPracticeMcSelect('${skillId}', ${idx}, ${ansIdx}, this)"><span>${escHtml(choicesEs[idx])}</span></button>`;
    }).join('');
    let feedbackHtml = '';
    if(storedIdx >= 0){
      if(storedIdx === ansIdx){
        feedbackHtml = `<div class="sk-practice-feedback correct" aria-live="polite">${t('step.correct')}</div>`;
      } else {
        feedbackHtml = `<div class="sk-practice-feedback incorrect" aria-live="polite">${t('step.notQuite')}</div>`;
      }
    } else {
      feedbackHtml = `<div class="sk-practice-feedback" aria-live="polite"></div>`;
    }
    // Trusted HTML, same as step text: fields — module data is repo-authored.
    // (choices stay text-only — they're short button labels, escaped above.)
    const promptHtml = practice.prompt ? `<div class="sk-practice-prompt">${tf(practice,'prompt')}</div>` : '';
    const explainHtml = practice.explain
      ? `<div class="sk-practice-explain"${storedIdx >= 0 ? '' : ' hidden'}>${tf(practice,'explain')}</div>` : '';
    return `<div class="sk-practice-panel" id="pp-${skillId}" hidden>` +
      `<div class="sk-practice-title">${t('step.practiceThis')}</div>` +
      renderRepStrip(skillId) +
      promptHtml +
      `<div class="sk-practice-mc" id="pp-mc-${skillId}">${opts}</div>` +
      feedbackHtml +
      explainHtml +
    `</div>`;
  }
  return '';
}
function togglePracticePanel(sid, btn){
  const panel = document.getElementById('pp-'+sid);
  if(!panel) return;
  const isOpen = !panel.hasAttribute('hidden');
  if(isOpen){
    panel.setAttribute('hidden','');
    btn.setAttribute('aria-expanded','false');
  } else {
    panel.removeAttribute('hidden');
    btn.setAttribute('aria-expanded','true');
  }
}
/* The last pick on each practice MC in THIS page load: tapping the picked
   choice again is not a new rep. Not the saved response — a student coming
   back another day to the answer they saved still gets the rep. */
const practiceMcLastPick = {};
function onPracticeMcSelect(skillId, idx, ansIdx, btnEl){
  const key = `practice-${skillId}`;
  if(isPeekedResponseKey(key)) return;   // read-only preview of a locked set
  const again = practiceMcLastPick[skillId] === idx;
  practiceMcLastPick[skillId] = idx;
  responses[key] = String(idx);
  saveResponses();
  const group = document.getElementById('pp-mc-'+skillId);
  if(group){
    group.querySelectorAll('.sk-practice-mc-opt').forEach(b=>{
      b.classList.remove('correct','incorrect');
      b.setAttribute('aria-pressed', String(b === btnEl));
    });
  }
  btnEl.classList.add(idx === ansIdx ? 'correct' : 'incorrect');
  const panel = document.getElementById('pp-'+skillId);
  if(panel){
    const fb = panel.querySelector('.sk-practice-feedback');
    if(fb){
      fb.classList.remove('correct','incorrect');
      if(idx === ansIdx){
        fb.classList.add('correct');
        fb.textContent = t('step.correct');
      } else {
        fb.classList.add('incorrect');
        fb.textContent = t('step.notQuite');
      }
    }
  }
  // Any pick reveals the explanation (if the practice carries one) — same
  // behavior as the station-step graded MCs.
  if(panel){
    const ex = panel.querySelector('.sk-practice-explain');
    if(ex) ex.removeAttribute('hidden');
  }
  // A correct pick counts as one practice rep (feeds the rep strip + review card).
  // Tapping the choice that is already picked again is not a new rep.
  if(idx === ansIdx && !again) logPracticeRep(skillId);
}

