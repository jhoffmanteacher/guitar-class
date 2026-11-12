/* ── Toggle skill ── */
function openCoachGate(sid, wid){
  closeCoachGate();
  const sk = skillById(sid);
  const ov = document.createElement('div');
  ov.className = 'daily5-overlay';
  ov.id = 'coach-gate-overlay';
  ov.innerHTML = `<div class="daily5-modal" role="dialog" aria-modal="true" aria-label="${escAttr(t('gate.title'))}">
    <div class="daily5-head"><h3 style="font:inherit;margin:0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:16px;height:16px;vertical-align:-2px;margin-right:2px"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4M9 21h6"/></svg> ${t('gate.title')}</h3>
      <button type="button" class="tp-close" onclick="closeCoachGate()" aria-label="${escAttr(t('gate.closeAria'))}">&#x2715;</button></div>
    ${sk ? `<p class="coach-tip">${escHtml(tf(sk,'text'))}</p>` : ''}
    <p class="coach-tip">${escHtml(t('gate.body'))}</p>
    <div class="issue-actions">
      <button type="button" class="panel-next-btn" onclick="coachGatePractice('${escAttr(sid)}','${escAttr(wid)}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:14px;height:14px;vertical-align:-2px;margin-right:2px"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4M9 21h6"/></svg> ${t('gate.practice')}</button>
      <button type="button" class="tp-btn" onclick="coachGateMarkAnyway('${escAttr(sid)}','${escAttr(wid)}')">${t('gate.markAnyway')}</button>
    </div>`;
  ov.addEventListener('click', e => { if(e.target === ov) closeCoachGate(); });
  document.body.appendChild(ov);
  document.addEventListener('keydown', coachGateEscClose);
  openOverlay(ov);
}
function coachGateEscClose(e){ if(e.key === 'Escape') closeCoachGate(); }
function closeCoachGate(){
  const ov = document.getElementById('coach-gate-overlay');
  if(!ov) return;
  ov.remove();
  document.removeEventListener('keydown', coachGateEscClose);
  closeOverlay();
}
/* "Practice it now" → close the gate and open that skill's practice panel,
   where the Listening Coach button lives. The gate can open from any set
   tab (the ladder offers inline check-offs), but the practice panel lives in
   the checklist tab — switch there first or everything below happens inside
   display:none. */
function coachGatePractice(sid, wid){
  closeCoachGate();
  const panel = document.getElementById('pp-'+sid);
  if(!panel) return;
  if(wid) switchTabById(wid, 'checklist', true);
  panel.removeAttribute('hidden');
  const btn = document.querySelector(`[aria-controls="pp-${CSS.escape(sid)}"]`);
  if(btn) btn.setAttribute('aria-expanded','true');
  panel.scrollIntoView({block:'center', behavior: scrollBehavior()});
  const coachBtn = panel.querySelector('.coach-btn');
  if(coachBtn) flashClass(coachBtn, 'gate-attn', 1200);
}
/* ══════════ Shuffle-deck check-off gate ══════════
   A skill that has its own shuffle deck (a step with drill:{type:'shuffle',
   skill: sid} in the same set) asks for a 9-of-10 deck run before "I've got
   it!" can be set — the deck IS the skill ("name any fret instantly"), so a
   pass is proof, not extra homework. Same SOFT-gate philosophy as the Coach
   gate below: "Mark it anyway" always works and records the override for the
   teacher view — never a punishment, just visibility. A qualifying run earned
   ANY way opens the gate: this browser session, the per-skill best in
   games.drillSkill, or the pile bests in games.sd — that last one matters
   because two decks can be the same drill (m2w1-s3 and m3w1-s4 both deal the
   A string), and a student who already proved a string shouldn't re-prove it
   one module later. */
const DRILL_GATE_PCT = 0.9;    // matches the deck's own ≥90% check-off offer
let drillSkillSession = {};    // sid → best this session (covers dev-bypass / signed-out)
/* The gate threshold as a raw hit-count, scaled to the drill's own rounds
   (falls back to SD_ROUNDS if the skill isn't drill-gated — callers only use
   this after confirming skillIsDrillGated(sid)). Was a bare "9" that only
   happened to equal 90% because every shuffle drill today uses rounds:10 —
   a future drill with fewer rounds would make the old constant unreachable
   even on a perfect run. */
function drillGateThreshold(sid){
  const hit = skillDrillStep(sid);
  const rounds = (hit && hit.drill.rounds) || SD_ROUNDS;
  return Math.ceil(rounds * DRILL_GATE_PCT);
}
function skillDrillStep(sid){
  for(const w of (SETS||[])){
    for(const stId of ['b','c']){
      const stn = w.stations && w.stations[stId];
      if(!stn) continue;
      const sections = stn.sections || (stn.steps ? [{steps: stn.steps}] : []);
      for(const sec of sections){
        for(const s of (sec.steps||[])){
          if(s.drill && s.drill.type === 'shuffle' && s.drill.skill === sid)
            return { w: w, station: stId, drill: s.drill };
        }
      }
    }
  }
  return null;
}
function skillIsDrillGated(sid){ return !!skillDrillStep(sid); }
function drillGateBest(sid){
  const rec = (typeof games !== 'undefined' && games && games.drillSkill) ? games.drillSkill[sid] : null;
  let best = Math.max(drillSkillSession[sid] || 0, (rec && rec.best) || 0);
  const hit = skillDrillStep(sid);
  if(hit){
    const str = hit.drill.string || 'lowE';
    best = Math.max(best,
      sdBest({ string: str, pile: 'naturals' }),
      sdBest({ string: str, pile: 'sharps' }));
  }
  return best;
}
/* Per-skill deck best — written on every finished run of a skill-bound deck,
   so the teacher view can tell a deck-verified got-it from a self-declared
   one (games.drillSkill[sid] = { best, at, override? }). */
function sdRecordSkillBest(c, n){
  if(!c || !c.skill) return;
  drillSkillSession[c.skill] = Math.max(drillSkillSession[c.skill] || 0, n);
  if(!currentUser || (typeof isDevBypassUser === 'function' && isDevBypassUser())) return;
  if(!games.drillSkill) games.drillSkill = {};
  const prev = games.drillSkill[c.skill] || {};
  if((prev.best || 0) >= n) return;
  games.drillSkill[c.skill] = Object.assign({}, prev, { best: n, at: dayStr(new Date()) });
  saveGames();
}
let drillGateBypass = false;
function openDrillGate(sid, wid){
  closeDrillGate();
  const sk = skillById(sid);
  const ov = document.createElement('div');
  ov.className = 'daily5-overlay';
  ov.id = 'drill-gate-overlay';
  ov.innerHTML = `<div class="daily5-modal" role="dialog" aria-modal="true" aria-label="${escAttr(t('dgate.title'))}">
    <div class="daily5-head"><h3 style="font:inherit;margin:0"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:16px;height:16px;vertical-align:-2px;margin-right:2px"><rect x="4" y="7" width="12" height="15" rx="2"/><rect x="8" y="3" width="12" height="15" rx="2"/></svg> ${t('dgate.title')}</h3>
      <button type="button" class="tp-close" onclick="closeDrillGate()" aria-label="${escAttr(t('gate.closeAria'))}">&#x2715;</button></div>
    ${sk ? `<p class="coach-tip">${escHtml(tf(sk,'text'))}</p>` : ''}
    <p class="coach-tip">${escHtml(t('dgate.body'))}</p>
    <div class="issue-actions">
      <button type="button" class="panel-next-btn" onclick="drillGatePractice('${escAttr(sid)}','${escAttr(wid)}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:14px;height:14px;vertical-align:-2px;margin-right:2px"><rect x="4" y="7" width="12" height="15" rx="2"/><rect x="8" y="3" width="12" height="15" rx="2"/></svg> ${t('dgate.goto')}</button>
      <button type="button" class="tp-btn" onclick="drillGateMarkAnyway('${escAttr(sid)}','${escAttr(wid)}')">${t('gate.markAnyway')}</button>
    </div>`;
  ov.addEventListener('click', e => { if(e.target === ov) closeDrillGate(); });
  document.body.appendChild(ov);
  document.addEventListener('keydown', drillGateEscClose);
  openOverlay(ov);
}
function drillGateEscClose(e){ if(e.key === 'Escape') closeDrillGate(); }
function closeDrillGate(){
  const ov = document.getElementById('drill-gate-overlay');
  if(!ov) return;
  ov.remove();
  document.removeEventListener('keydown', drillGateEscClose);
  closeOverlay();
}
/* "Take me to the deck" → switch to the station tab that holds it, expand
   the step if it's collapsed, and scroll the deck into view. */
function drillGatePractice(sid, wid){
  closeDrillGate();
  const hit = skillDrillStep(sid);
  const useWid = (hit && hit.w.id) || wid;
  /* switchTabById resolves `${wid}-${tab}`, and the lesson panel is
     `${wid}-station-b`. Passing the bare station letter looked up an id that
     does not exist, so the tab never switched and the scroll below silently
     targeted a display:none element. */
  switchTabById(useWid, LESSON_TAB, true);
  const box = document.querySelector(`.week-panel[data-id="${useWid}"] .sdr[data-skill="${CSS.escape(sid)}"]`);
  if(!box){
    /* Never dead-end the student: land them on the ladder at least. */
    const stn = document.getElementById(`${useWid}-${LESSON_TAB}`);
    if(stn) stn.scrollIntoView({ block:'start', behavior: scrollBehavior() });
    return;
  }
  const li = box.closest('li.step');
  if(li && li.classList.contains('collapsed')){
    const head = li.querySelector('.step-head');
    if(head) head.click();
  }
  setTimeout(()=>{
    box.scrollIntoView({ block:'center', behavior: scrollBehavior() });
    flashClass(box, 'gate-attn', 1200);
  }, 60);
}
/* "Mark it anyway" → honour the student's call, but record the override so
   the teacher can see the got-it had no deck run behind it. */
function drillGateMarkAnyway(sid, wid){
  closeDrillGate();
  if(typeof games !== 'undefined' && games){
    if(!games.drillSkill) games.drillSkill = {};
    const prev = games.drillSkill[sid] || {};
    games.drillSkill[sid] = Object.assign({}, prev, {
      best: prev.best || 0,
      override: true,
      overrideAt: dayStr(new Date())
    });
    if(typeof saveGames === 'function' && currentUser && !isDevBypassUser()) saveGames();
  }
  drillGateBypass = true;
  toggleSkill(sid, wid, 'gotit');
  drillGateBypass = false;
}

/* "Mark it anyway" → honour the student's call, but record the override so
   the teacher can see the got-it had no Coach take behind it. */
function coachGateMarkAnyway(sid, wid){
  closeCoachGate();
  if(typeof games !== 'undefined' && games){
    if(!games.coachSkill) games.coachSkill = {};
    const prev = games.coachSkill[sid] || {};
    games.coachSkill[sid] = Object.assign({}, prev, {
      level: prev.level || 0,
      override: true,
      overrideAt: dayStr(new Date())
    });
    if(typeof saveGames === 'function' && currentUser && !isDevBypassUser()) saveGames();
  }
  coachGateBypass = true;
  toggleSkill(sid, wid, 'gotit');
  coachGateBypass = false;
}

/* ══════════ Listening Coach check-off gate ══════════
   A skill whose practice drill is mic-checkable (playSeq / chord) asks for a
   Coach take at 💪 Good or better before "I've got it!" can be set. It is a
   SOFT gate on purpose: a dead Chromebook mic or a loud room must never trap
   a student who really can play it, so the modal always offers "Mark it
   anyway" — and records that they took it, so the teacher view can tell a
   Coach-backed got-it from a self-declared one. Skills practiced by mc / pr /
   fretboard drills are never Coach-gated — the mic can't hear a multiple-
   choice answer — but a few of those have their own shuffle deck and go
   through the deck gate above instead. */
const COACH_GATE_MIN_LEVEL = 2;      // 1 Needs work · 2 Good · 3 Great
function skillById(sid){
  for(const w of (SETS||[])){
    const hit = (w.skills||[]).find(x => x.id === sid);
    if(hit) return hit;
  }
  return null;
}
function skillIsCoachGated(sid){
  const sk = skillById(sid);
  const type = sk && sk.practice && sk.practice.type;
  return type === 'playSeq' || type === 'chord';
}
function coachSkillBest(sid){
  const rec = (typeof games !== 'undefined' && games && games.coachSkill) ? games.coachSkill[sid] : null;
  return (rec && rec.level) || 0;
}
/* Set while the student confirms "Mark it anyway" so the re-entry into
   toggleSkill skips the gate exactly once. */
let coachGateBypass = false;
function toggleSkill(sid, wid, which){
  // A peeked set is read-only — this single guard covers every path that
  // reaches toggleSkill: the checklist cells directly, plus the drill
  // check-off buttons and both gate modals' "Mark it anyway", which all call
  // this function rather than writing progress themselves.
  if(isSetPeeking(wid)) return false;
  const cur = progress[sid]||'none';
  if(which==='working'){
    if(cur==='gotit') progress[sid]='working';
    else if(cur==='working') progress[sid]='none';
    else progress[sid]='working';
  } else {
    if(cur==='gotit') progress[sid]='working';
    else {
      if(!coachGateBypass && skillIsCoachGated(sid) && coachSkillBest(sid) < COACH_GATE_MIN_LEVEL){
        openCoachGate(sid, wid);
        return false;
      }
      if(!drillGateBypass && !coachGateBypass && skillIsDrillGated(sid) && drillGateBest(sid) < drillGateThreshold(sid)){
        openDrillGate(sid, wid);
        return false;
      }
      coachGateBypass = false;
      progress[sid]='gotit'; bumpPracticeStreak();
    }
  }
  const wkSvg=`<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" stroke="var(--amber-text)" stroke-width="1.5"/><path d="M6 4v2.2l1.4 1.4" stroke="var(--amber-text)" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  const giSvg=`<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="var(--green-text)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const w=SETS.find(x=>x.id===wid);
  document.querySelectorAll(`.week-panel[data-id="${wid}"] .skill-row[data-sid="${CSS.escape(sid)}"]`).forEach(row=>{
    const wkCell = row.querySelector('.working-col');
    const giCell = row.querySelector('.gotit-col');
    if(!wkCell||!giCell) return;
    const st = progress[sid]||'none';
    wkCell.classList.toggle('active', st==='working');
    giCell.classList.toggle('active', st==='gotit');
    wkCell.setAttribute('aria-pressed', st==='working');
    giCell.setAttribute('aria-pressed', st==='gotit');
    wkCell.querySelector('.skbox').innerHTML = st==='working' ? wkSvg : '';
    giCell.querySelector('.skbox').innerHTML = st==='gotit'   ? giSvg : '';
  });
  if(w){
    const done=w.skills.filter(s=>progress[s.id]==='gotit').length;
    const pct=Math.round(done/w.skills.length*100);
    document.querySelectorAll(`#pf-${wid}`).forEach(el=>el.style.width=pct+'%');
    document.querySelectorAll(`#pl-${wid}`).forEach(el=>el.textContent=done+' / '+w.skills.length);
    // Song-thread echo: a fresh "I've got it!" in a badged set names the song
    // that just grew (rotates through the set's songs).
    if(progress[sid]==='gotit' && w.songThread && w.songThread.length){
      const echoEl = document.getElementById('se-'+wid);
      if(echoEl){
        const thread = w.songThread[(done - 1) % w.songThread.length];
        echoEl.textContent = thread.layer
          ? t(thread.bonus ? 'songs.echoLayerBonus' : 'songs.echoLayer', { name: thread.name, layer: thread.layer })
          : t('songs.echoPlain', { name: thread.name });
        echoEl.classList.add('show');
        clearTimeout(echoEl._echoT);
        echoEl._echoT = setTimeout(()=>{ echoEl.classList.remove('show'); }, 5000);
      }
    }
  }
  renderPills(lastModuleNum);
  document.querySelectorAll('.wpill').forEach(b=>{if(b.dataset.id===wid)b.classList.add('active');});
  // Live-update the module dropdown counts + progress strip so marking a skill
  // reflects immediately without leaving the set.
  populateModuleDropdown();
  renderProgressStrip();
  refreshReviewCards();   // "Keep it sharp" card reacts to got-it changes
  saveProgress();
  return true;
}

/* ── Translate toggle ── */
// Every layer is hand-written now: the shell (i18n.js), module/lesson
// content (_es twins read through tf()), the games arcade + Listening
// Coach (coach.js via t()), and the Song Journey pages (data-es). The
// Google Translate widget is gone — a language switch is just setLang(),
// and the gc-langchange listener below refreshes the dynamic panels.
function syncTranslateBtn(){
  const btn = document.getElementById('btn-translate');
  const lbl = document.getElementById('translate-label');
  const es = getLang() === 'es';
  if(btn) btn.classList.toggle('active', es);
  if(lbl){
    lbl.textContent = es ? 'English' : 'Español';
    // The label names the OTHER language, in that language — tag it so a
    // screen reader says "Español" in Spanish, not as an English word.
    // No aria-pressed: the label changes with the state, so "English,
    // pressed" would read as English being on — the opposite of the truth.
    lbl.lang = es ? 'en' : 'es';
  }
}
function toggleTranslate(){
  setLang(getLang() === 'es' ? 'en' : 'es');
  syncTranslateBtn();
}
// Restore the button to the saved language on load (i18n.js already
// restored the strings themselves before app.js ran).
document.addEventListener('DOMContentLoaded', syncTranslateBtn);
// Shell re-renders that build strings dynamically (rebuilt on navigation,
// not tagged with data-i18n) need an explicit refresh on a pure language
// toggle — applyI18n's DOM walk (already run by setLang) only reaches
// elements tagged with data-i18n and can't help these.
// Module-content panels (Set / Module Review / module-level Songs) are built
// ONCE per module and cached (see ensureModuleRendered/_modulesRendered) — a
// language toggle after that first build won't reach their baked-in text on
// its own, unlike the shell strings above (which re-resolve live through
// t()). Rebuild each already-rendered module's panels from source data so
// any _es fields available get picked up (a module still mid-translation
// just falls back to English again, same as before this rebuild existed).
// Cheap: only touches modules the student actually opened this session.
/* What a rebuild would otherwise throw away (2026-10-12): bilingual students
   flip the language often, and every flip used to put the ladder back on
   the first not-done step, close an open Hint / Stuck? / Level up, close a
   shown tab, and jump the scroll. Everything is addressed by the step's
   data-key (its progress key) or a fold's id — both the same in either
   language. Nothing here reads or writes progress. */
function snapshotLessonState(panel){
  const dp = panel.querySelector('.dp');
  if(!dp) return null;
  const steps = [...dp.querySelectorAll('li.step')];
  return {
    open: steps.filter(li => !li.classList.contains('collapsed')).map(li => li.dataset.key),
    folds: [...dp.querySelectorAll('.step-fold-panel:not([hidden])')].map(p => p.id),
    tabs: steps.flatMap(li => [...li.querySelectorAll('.tab-choice-btn')]
      .map((b, n) => b.classList.contains('expanded') ? `${li.dataset.key}|${n}` : null).filter(Boolean)),
    pdSeen: dp.dataset.pdSeen === '1',
    pdShowing: dp.classList.contains('pd-showing'),
  };
}
function restoreLessonState(panel, snap){
  const dp = snap && panel.querySelector('.dp');
  if(!dp) return;
  const steps = [...dp.querySelectorAll('li.step')];
  const byKey = new Map(steps.map(li => [li.dataset.key, li]));
  /* Nothing open (list view with every row closed): leave the fresh
     render's own choice — the first not-done step — as it always was. */
  const open = snap.open.map(k => byKey.get(k)).filter(Boolean);
  open.forEach((li, n) => expandStepEl(li, n > 0));
  dp.querySelectorAll('.step-fold-pill').forEach(pill => {
    if(snap.folds.includes(pill.getAttribute('aria-controls'))) toggleStepFold(pill);
  });
  steps.forEach(li => li.querySelectorAll('.tab-choice-btn').forEach((b, n) => {
    if(snap.tabs.includes(`${li.dataset.key}|${n}`)) toggleTabChoice(b);
  }));
  if(snap.pdSeen) dp.dataset.pdSeen = '1';
  if(snap.pdShowing && dp.classList.contains('focus')) dp.classList.add('pd-showing');
}
/* The row the student is reading in the open set: the open step if it is on
   screen, else the first row showing below the top of the reading pane.
   Restored by position, not by scrollTop — Spanish runs longer than English,
   so the same scrollTop lands somewhere else after the switch. */
function lessonScrollAnchor(){
  const pane = scrollPane();
  const y = paneScrollTop();
  // An in-column page (Songs, My progress, In class) has the practice view
  // swapped out — its place is already stashed in practiceScrollTop.
  if(document.body.classList.contains('explore-open')) return null;
  const tp = document.querySelector('#week-panels .week-panel.active .tab-panel.active');
  const paneTop = pane === window ? 0 : pane.getBoundingClientRect().top;
  const shown = tp ? [...tp.querySelectorAll('li.step')].filter(li => li.getClientRects().length) : [];
  const onScreen = li => { const r = li.getBoundingClientRect(); return r.bottom > paneTop && r.top < window.innerHeight; };
  const li = shown.find(s => !s.classList.contains('collapsed') && onScreen(s)) || shown.find(onScreen);
  return { pane, y, key: li ? li.dataset.key : null, top: li ? li.getBoundingClientRect().top : 0 };
}
function restoreLessonScroll(a){
  if(!a) return;
  const tp = document.querySelector('#week-panels .week-panel.active .tab-panel.active');
  const li = a.key && tp ? [...tp.querySelectorAll('li.step')].find(s => s.dataset.key === a.key) : null;
  const to = li && li.getClientRects().length ? (a.pane === window ? window.scrollY : a.pane.scrollTop) + li.getBoundingClientRect().top - a.top : a.y;
  a.pane.scrollTo({ top: to });
}
function rebuildModuleContentPanels(){
  /* Every card in these panels is about to be rebuilt (see stopCardAudio):
     a tab line left playing would keep sounding with its cursor and its
     Stop button on the old, detached nodes. Not on the console: it has no
     module panels to rebuild, and a Teacher view song playing for the room
     must keep playing through a language switch (teacher.js). */
  if(!IS_TEACHER_MODE) stopCardAudio();
  const anchor = lessonScrollAnchor();
  document.querySelectorAll('#week-panels .week-panel').forEach(panel=>{
    const wid = panel.dataset.id;
    const num = Number(panel.dataset.module);
    const w = SETS.find(x=>x.id===wid);
    const mr = MODULE_REVIEWS[num];
    if(w && wid===w.id){
      // Remember which tab was open so rebuilding doesn't bounce the
      // student back to the lesson ladder.
      const activeEl = panel.querySelector('.tab-panel.active');
      const activeSuffix = activeEl ? activeEl.id.slice(wid.length+1) : null;
      const lessonState = snapshotLessonState(panel);
      panel.innerHTML = w.comingSoon ? buildComingSoon(w) : buildSet(w);
      restoreLessonState(panel, lessonState);
      if(activeSuffix && activeSuffix !== LESSON_TAB){
        const targetPanel = document.getElementById(`${wid}-${activeSuffix}`);
        if(targetPanel){
          panel.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
          targetPanel.classList.add('active');
        }
      }
      // This path restores the open tab itself rather than going through
      // switchTabById(), so it owns the band's on-checklist flag too —
      // without it a language switch on the checklist would leave the
      // lesson's pill and step counter showing over it.
      panel.classList.toggle('on-checklist', activeSuffix === 'checklist');
    } else if(mr && wid===`mr${num}`){
      /* A recorder slot that is recording or holds a listen-back keeps its own
         node: rebuilt, its <audio> would restart at 0:00. Same guard as the
         rail recorder's (refreshRecUI('fab') in the language handler below);
         the slot redraws in the new language at its next state change. */
      const busy = [...panel.querySelectorAll('.mr-rec-body')].filter(el => {
        const rs = recState[el.id.replace(/^mr|-rec-body$/g, '')];
        return !!(rs && (rs.recording || rs.pendingBlobUrl));
      });
      panel.innerHTML = buildModuleReview(mr);
      busy.forEach(old => { const fresh = panel.querySelector(`#${old.id}`); if(fresh) fresh.replaceWith(old); });
    } else {
      return;
    }
    markModulePanelTranslated(panel, num);
  });
  if(typeof wrapAllChordLinks === 'function') wrapAllChordLinks();
  if(typeof applyI18n === 'function'){
    const c = document.getElementById('week-panels');
    if(c) applyI18n(c);
  }
  restoreLessonScroll(anchor);
}
window.addEventListener('gc-langchange', function(){
  /* The app is fifteen files that run one after another, and the language button is on the sign-in wall. Until
     the last file this handler reaches has run (refreshOpenClassActivitiesScreen lives there) nothing has been
     built that would need redrawing, and going on would call pcStop() or scrollPane() before their files had
     arrived (review RX-2, 2026-11-11). The language itself is switched by i18n.js before this runs. */
  if(typeof refreshOpenClassActivitiesScreen !== 'function') return;
  // buildSearchIndex() now bakes in the CURRENT language via tf() — without
  // invalidating the cache here, a student who opened search before
  // switching to Spanish would keep matching only the stale English index.
  if(typeof searchIndex !== 'undefined') searchIndex = null;
  if(typeof lastModuleNum !== 'undefined' && document.getElementById('week-pills')) renderPills(lastModuleNum);
  // The rail's trophy title and module-progress aria-valuetext are set in JS
  // (t() at render time), so they stay in the old language until redrawn;
  // the redraw keeps the "earned" state since it recomputes it.
  if(currentUser && document.getElementById('rail-module-goal')) renderProgressStrip();
  // Rebuild the resume card in the new language (no-op if dismissed/unused).
  if(_resumeCardBuilt && !_resumeCardClosed) renderResumeCard();
  if(typeof syncRailStations === 'function') syncRailStations();
  if(typeof populateModuleDropdown === 'function') populateModuleDropdown();
  rebuildModuleContentPanels();
  /* The explore pages are hash-based (toggling twice would churn the
     browser history), so an open one just re-renders its body in place —
     the topbar labels are data-i18n-tagged and already re-translated. */
  const songsScreen = document.getElementById('songs-screen');
  if(songsScreen && !songsScreen.hidden && typeof renderSongsHub === 'function') renderSongsHub();
  // My progress holds all three sections now (Today-first work order,
  // Phase 2) — Daily Review and Keep practicing re-render along with it.
  const mpScreen = document.getElementById('my-progress-screen');
  if(mpScreen && !mpScreen.hidden){
    if(typeof renderDailyReview === 'function') renderDailyReview();
    if(typeof renderKeepPracticing === 'function') renderKeepPracticing();
    if(typeof renderMyProgress === 'function') renderMyProgress();
  }
  /* Guarded like its neighbours: the language button is on the sign-in wall, and on a slow first load it can be
     pressed before the part that defines this has run (review R1-3). */
  if(typeof refreshOpenClassActivitiesScreen === 'function') refreshOpenClassActivitiesScreen();
  // A live Daily 5 overlay just rebuilds its modal body in place.
  const d5 = document.querySelector('#daily5-overlay .daily5-modal');
  if(d5 && typeof buildDaily5 === 'function'){
    d5.setAttribute('aria-label', t('daily5.title'));
    d5.innerHTML = buildDaily5();
  }
  // Same for an open module-review assessment pop-up.
  const mrOv = document.getElementById('mr-assess-overlay');
  if(mrOv && typeof buildMrAssessPop === 'function'){
    const n = parseInt(mrOv.dataset.module, 10);
    const modal = mrOv.querySelector('.mr-assess-modal');
    if(modal){
      modal.setAttribute('aria-label', t('review.assessHead',{n}));
      modal.innerHTML = buildMrAssessPop(n);
    }
  }
  // The rail Recorder popup body bakes t() results in with no data-i18n tags
  // (renderRecBody), and #mrfab-rec-body sits outside the module panels the
  // rebuild above covers — re-render it in place or it stays half-English.
  // Idle-only, same guard as togglePopup: rebuilding mid-recording or during
  // a listen-back would reset the timer display / stop the <audio> at 0:00.
  if (!recState.fab) refreshRecUI('fab');
});

/* ══════════════════════════════════════════════
   FLOATING TOOLS — Metronome & Timer
   ══════════════════════════════════════════════ */
let audioCtx=null;
function getAudioCtx(){ if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)(); return audioCtx; }
/* Used only by coach.js, but it lives here on purpose: coach.js is loaded on
   demand (see ensureCoachJs) and app.js is always present. */
function beep(freq,dur,gain){ const ctx=getAudioCtx(); const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value=freq; g.gain.setValueAtTime(gain==null?0.4:gain,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur); o.start(); o.stop(ctx.currentTime+dur); }
/* Every synthesized pluck goes through one shared bus, so a single gain
   node can silence notes that are already sounding — see killRingingPlucks. */
let pluckBus = null;
function getPluckBus(){
  const ctx = getAudioCtx();
  if(!pluckBus || pluckBus.context !== ctx){
    pluckBus = ctx.createGain();
    pluckBus.gain.value = 1;
    pluckBus.connect(ctx.destination);
  }
  return pluckBus;
}
/* Cancelling the timeouts that schedule notes isn't enough to stop the sound:
   a note struck a moment ago already has its whole tail committed to an
   AudioBufferSourceNode and will keep ringing into a live mic. Duck the bus
   instead, then reopen it for whatever gets played next. */
function killRingingPlucks(){
  if(!pluckBus) return;
  const ctx = pluckBus.context, now = ctx.currentTime;
  pluckBus.gain.cancelScheduledValues(now);
  pluckBus.gain.setValueAtTime(pluckBus.gain.value, now);
  pluckBus.gain.linearRampToValueAtTime(0, now + 0.02);   // short fade, not a hard cut — a cut clicks
  pluckBus.gain.setValueAtTime(1, now + 0.03);
}
/* Karplus-Strong plucked-string synthesis: a short noise burst is fed into a
   feedback delay line whose length equals one period of the target pitch. A
   lowpass in the loop makes harmonics decay over time — high notes fade faster
   than low notes, like a real guitar string. midi=69 → A4 (440Hz).

   The delay line is tuned to a FRACTIONAL length. An integer-only line can
   only sound pitches that divide the sample rate evenly, which ran as much as
   37 cents sharp in the high register — a third of a semitone, on a site where
   students train their ears against these notes. The leftover fraction goes
   through a first-order allpass, which delays without dulling the tone the way
   plain interpolation would.

   Bare Karplus-Strong sounds synthetic mostly because of what it leaves out,
   so three things get added on top: a pick-position comb, the click of the
   pick itself, and a pair of body resonances. */
const PLUCK_VOICE_GAIN = 0.45;   // every buffer is peak-normalized, so this alone sets note level
function ksPluckBuffer(ctx, midi){
  const sr = ctx.sampleRate;
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const bright = Math.min(1, Math.max(0, (midi - 40) / 48));   // 0 at the low E, 1 at the top of the range
  /* Loop filter is a two-tap FIR (1-b, b): b = 0.5 is the classic averager,
     lower b damps less and rings brighter. Its group delay is exactly b
     samples, which the tuning below has to account for. */
  const b = 0.44 + 0.06 * bright;
  /* Loop gain, nudged closer to 1 down low so a wound bass string sustains
     like one instead of dying off with the trebles. */
  const decay = 0.9884 - 0.0052 * bright;
  /* Total loop delay has to equal one period; the loop filter already supplies
     b samples of it, so the delay line carries the rest. */
  let target = Math.max(2.1, sr / freq - b);
  let len = Math.floor(target), frac = target - len;
  /* An allpass is least accurate — and rings longest — as its delay nears
     zero, so borrow a whole sample to keep the fraction off the floor. */
  if (frac < 0.1 && len > 2){ len -= 1; frac += 1; }
  const ap = (1 - frac) / (1 + frac);
  /* Excitation: white noise, lowpassed to take the fizz off the attack. */
  const ring = new Float32Array(len);
  let prev = 0;
  for (let i = 0; i < len; i++){
    prev = 0.5 * ((Math.random() * 2 - 1) + prev);
    ring[i] = prev;
  }
  /* Pick position. Plucking a fifth of the way along a string kills every
     harmonic with a node at that point — this comb is most of what separates
     a picked guitar from a generic plucked tone. Removing the mean afterwards
     matters too: DC sails through the loop filter untouched and turns into a
     thump plus wasted headroom. */
  const pick = Math.max(1, Math.round(0.19 * len));
  const exc = new Float32Array(len);
  let sum = 0;
  for (let i = 0; i < len; i++){
    exc[i] = ring[i] - ring[(i - pick + len) % len];
    sum += exc[i];
  }
  const dc = sum / len;
  for (let i = 0; i < len; i++) ring[i] = exc[i] - dc;
  /* Render only as long as the note can still be heard. A high E is silent
     inside half a second, so a flat 1.5s buffer was mostly wasted work. */
  const total = Math.floor(sr * Math.min(2.0, Math.max(0.45,
    Math.log(0.002) / (freq * Math.log(decay)))));
  const buffer = ctx.createBuffer(1, total, sr);
  const data = buffer.getChannelData(0);
  let idx = 0, lpPrev = 0, apIn = 0, apOut = 0;
  for (let i = 0; i < total; i++){
    const out = ring[idx];
    data[i] = out;
    const lp = (1 - b) * out + b * lpPrev;  // loop filter (worth b samples of delay)
    lpPrev = out;
    const y = ap * lp + apIn - ap * apOut;  // allpass carries the fractional remainder
    apIn = lp; apOut = y;
    ring[idx] = decay * y;
    idx = (idx + 1) % len;
  }
  /* The pick striking the string — a few ms of bright noise the string model
     itself can't produce. */
  const clickN = Math.min(total, Math.floor(sr * 0.004));
  for (let i = 0; i < clickN; i++){
    data[i] += (Math.random() * 2 - 1) * 0.28 * Math.pow(1 - i / clickN, 3);
  }
  /* The box: the Helmholtz air resonance and the main top resonance, as two
     cheap 2-pole resonators mixed in under the string. Low mix — this is the
     difference between "warm" and "boomy". */
  const body = new Float32Array(total);
  for (let k = 0; k < 2; k++){
    const f0 = k ? 214 : 102, q = k ? 11 : 14, mix = k ? 0.32 : 0.5;
    const w = 2 * Math.PI * f0 / sr, r = Math.exp(-w / (2 * q));
    const a1 = 2 * r * Math.cos(w), a2 = -r * r, gg = (1 - r) * Math.sin(w);
    let y1 = 0, y2 = 0;
    for (let i = 0; i < total; i++){
      const y = gg * data[i] + a1 * y1 + a2 * y2;
      y2 = y1; y1 = y;
      body[i] += mix * y;
    }
  }
  /* Normalize to a known peak so PLUCK_VOICE_GAIN is the only thing deciding
     loudness — otherwise the body mix would make level depend on pitch. */
  let peak = 0;
  for (let i = 0; i < total; i++){
    data[i] = data[i] * 0.86 + body[i];
    const a = Math.abs(data[i]);
    if (a > peak) peak = a;
  }
  if (peak > 0){ for (let i = 0; i < total; i++) data[i] /= peak; }
  /* A low string is still at ~15% amplitude when the buffer ends; stopping
     there mid-waveform is an audible click. Ramp the last few ms to nothing. */
  const fade = Math.min(total, Math.floor(sr * 0.04));
  for (let i = 0; i < fade; i++){
    data[total - fade + i] *= 1 - i / fade;
  }
  return buffer;
}
/* Rendering a note is now ~5 passes over as much as 2s of audio, which is a
   visible hitch on a school Chromebook when a six-note chord lands. Cache the
   buffers — an AudioBuffer can back any number of sources. Two variants per
   pitch, alternated, so a repeated note isn't audibly identical each time;
   the cap keeps a long TAB from holding tens of MB (a 2s buffer is ~384KB). */
const PLUCK_CACHE_MAX = 24;
let pluckCache = new Map(), pluckVariant = 0;
function ksPluckCached(ctx, midi){
  const key = ctx.sampleRate + ':' + midi + ':' + (pluckVariant++ & 1);
  let buf = pluckCache.get(key);
  if (buf){                        // refresh recency: re-inserting moves it to the end
    pluckCache.delete(key);
  } else {
    buf = ksPluckBuffer(ctx, midi);
  }
  pluckCache.set(key, buf);
  while (pluckCache.size > PLUCK_CACHE_MAX) pluckCache.delete(pluckCache.keys().next().value);
  return buf;
}
/* ── Recorded guitar notes (2026-10-01) ─────────────────────────────────
   Every pluck the site plays — TAB Play buttons, chord strums, note drills,
   game rewards, Riff Runner's "Hear it" — sounds a RECORDED steel-string
   acoustic note, one file per semitone from the low E (E2, midi 40) to D5
   (midi 74). Jonathan's call: the synth above sounded fake, and the class
   plays steel-string acoustics, so that is what the site plays back.

   Source: University of Iowa Electronic Music Studios guitar samples
   (theremin.music.uiowa.edu — free to use without restriction), as trimmed
   and volume-matched by the tonejs-instruments project (MIT). Re-cut for the
   site 2026-10-01: mono, 96 kbps, trimmed to 5 ms before the pick, loudness
   matched (-21 LUFS over the first 0.8 s), cut at 3 s or once the note has
   decayed 50 dB, with a fade. Pitch measured within ±5 cents of A=440 on
   every file, so the tuner agrees with them (tuner.js is A4=440).

   The files live in audio/, so the service worker keeps them in the audio
   cache (fetched once per device, then offline). Notes outside 40–74 play
   the nearest file re-pitched. Today that is one note on the whole site:
   the E5 (76) at the top of Module 9's C-major scale, two semitones above
   the top file — not enough to hear the stretch.

   Karplus-Strong above stays as the FALLBACK, never removed: a note whose
   file hasn't arrived yet (first seconds on a new device, or offline before
   the first download) plays the synth instead of nothing. warmGuitarNotes()
   starts all 35 downloads on the student's first tap anywhere, so by the
   time they press a Play button the notes are normally ready; playSequence()
   additionally waits (up to GUITAR_NOTE_WAIT_MS) for the notes of its own
   line, and never mixes the two voices inside one line. */
const GUITAR_NOTE_FILES = {
  40: 'audio/guitar-note-40-e2.mp3',
  41: 'audio/guitar-note-41-f2.mp3',
  42: 'audio/guitar-note-42-fs2.mp3',
  43: 'audio/guitar-note-43-g2.mp3',
  44: 'audio/guitar-note-44-gs2.mp3',
  45: 'audio/guitar-note-45-a2.mp3',
  46: 'audio/guitar-note-46-as2.mp3',
  47: 'audio/guitar-note-47-b2.mp3',
  48: 'audio/guitar-note-48-c3.mp3',
  49: 'audio/guitar-note-49-cs3.mp3',
  50: 'audio/guitar-note-50-d3.mp3',
  51: 'audio/guitar-note-51-ds3.mp3',
  52: 'audio/guitar-note-52-e3.mp3',
  53: 'audio/guitar-note-53-f3.mp3',
  54: 'audio/guitar-note-54-fs3.mp3',
  55: 'audio/guitar-note-55-g3.mp3',
  56: 'audio/guitar-note-56-gs3.mp3',
  57: 'audio/guitar-note-57-a3.mp3',
  58: 'audio/guitar-note-58-as3.mp3',
  59: 'audio/guitar-note-59-b3.mp3',
  60: 'audio/guitar-note-60-c4.mp3',
  61: 'audio/guitar-note-61-cs4.mp3',
  62: 'audio/guitar-note-62-d4.mp3',
  63: 'audio/guitar-note-63-ds4.mp3',
  64: 'audio/guitar-note-64-e4.mp3',
  65: 'audio/guitar-note-65-f4.mp3',
  66: 'audio/guitar-note-66-fs4.mp3',
  67: 'audio/guitar-note-67-g4.mp3',
  68: 'audio/guitar-note-68-gs4.mp3',
  69: 'audio/guitar-note-69-a4.mp3',
  70: 'audio/guitar-note-70-as4.mp3',
  71: 'audio/guitar-note-71-b4.mp3',
  72: 'audio/guitar-note-72-c5.mp3',
  73: 'audio/guitar-note-73-cs5.mp3',
  74: 'audio/guitar-note-74-d5.mp3'
};
const GUITAR_NOTE_LOW = 40, GUITAR_NOTE_HIGH = 74;
/* The files sit at a fixed loudness, louder than a synth buffer at the same
   gain. Callers still pass gains worked out against PLUCK_VOICE_GAIN
   (chordGain, Riff Runner), so the recorded voice scales them by one
   constant rather than every caller learning a second number. At 1.55 a
   single note measures -24.6 LUFS, inside the old synth's -23 (low E) to
   -28 (top strings) — about as loud, and now even from string to string. */
const GUITAR_NOTE_GAIN_SCALE = 1.55;
const GUITAR_NOTE_WAIT_MS = 1500;      // longest a TAB Play waits for its notes before using the synth
const GUITAR_NOTE_RETRY_MS = 30000;    // after a failed download, don't refetch on every note
const guitarNotes = new Map();         // file midi -> { buffer, offset }
const guitarNoteLoads = new Map();     // file midi -> Promise (in flight or settled)
const guitarNoteFailedAt = new Map();  // file midi -> time of the last failed load
function guitarNoteFileMidi(midi){
  return Math.max(GUITAR_NOTE_LOW, Math.min(GUITAR_NOTE_HIGH, Math.round(midi)));
}
function loadGuitarNote(fileMidi){
  if (guitarNotes.has(fileMidi)) return Promise.resolve(true);
  if (guitarNoteLoads.has(fileMidi)) return guitarNoteLoads.get(fileMidi);
  const failed = guitarNoteFailedAt.get(fileMidi);
  if (failed && Date.now() - failed < GUITAR_NOTE_RETRY_MS) return Promise.resolve(false);
  const url = GUITAR_NOTE_FILES[fileMidi];
  if (!url || typeof fetch !== 'function') return Promise.resolve(false);
  const ctx = getAudioCtx();
  const p = fetch(url)
    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); })
    /* Callback form as well as the promise: older Safari only has the callback. */
    .then(ab => new Promise((res, rej) => ctx.decodeAudioData(ab, res, rej)))
    .then(buffer => {
      /* Start each note at its pick, not at the top of the file. The files
         are trimmed, but a decoder can still put the mp3's encoder delay in
         front — and a TAB cursor that lights 25 ms before the sound reads as
         early. 4 ms of lead-in keeps the attack's own front edge. */
      const d = buffer.getChannelData(0);
      let peak = 0;
      for (let i = 0; i < d.length; i++){ const a = Math.abs(d[i]); if (a > peak) peak = a; }
      let on = 0;
      while (on < d.length && Math.abs(d[on]) < peak * 0.05) on++;
      const offset = Math.max(0, on / buffer.sampleRate - 0.004);
      guitarNotes.set(fileMidi, { buffer, offset });
      guitarNoteLoads.delete(fileMidi);
      return true;
    })
    .catch(() => {
      guitarNoteLoads.delete(fileMidi);
      guitarNoteFailedAt.set(fileMidi, Date.now());
      return false;
    });
  guitarNoteLoads.set(fileMidi, p);
  return p;
}
/* Resolves once every note in the list is ready (or has failed), never
   rejects. midis may hold nested arrays and { midi, beats } entries — the
   same shapes playSequence() takes. */
function loadGuitarNotesFor(midis){
  const want = new Set();
  const walk = m => {
    if (Array.isArray(m)) m.forEach(walk);
    else if (m && typeof m === 'object') walk(m.midi);
    else if (m != null && !isNaN(Number(m))) want.add(guitarNoteFileMidi(Number(m)));
  };
  walk(midis);
  return Promise.all([...want].map(loadGuitarNote));
}
function guitarNotesReadyFor(midis){
  let ready = true;
  const walk = m => {
    if (!ready) return;
    if (Array.isArray(m)) m.forEach(walk);
    else if (m && typeof m === 'object') walk(m.midi);
    else if (m != null && !isNaN(Number(m)) && !guitarNotes.has(guitarNoteFileMidi(Number(m)))) ready = false;
  };
  walk(midis);
  return ready;
}
let guitarNotesWarmed = false;
function warmGuitarNotes(){
  if (guitarNotesWarmed) return;
  guitarNotesWarmed = true;
  /* Low strings first: that is where the course lives, so those land first
     on a slow connection. */
  for (let m = GUITAR_NOTE_LOW; m <= GUITAR_NOTE_HIGH; m++) loadGuitarNote(m);
}
/* The first tap anywhere starts the downloads. Not at page load: a student
   who only opens a backing track shouldn't pay for 35 notes before doing
   anything, and an AudioContext made before any gesture logs a warning. */
['pointerdown', 'keydown'].forEach(ev =>
  document.addEventListener(ev, warmGuitarNotes, { once: true, capture: true, passive: true }));

/* Reusable single-note player. gain defaults to a single note's level; callers
   sounding several notes at once pass it down so the sum stays in headroom.
   Returns { src, gain } so a caller can stop or damp the note it started
   (Riff Runner's early Stop, playSequence's damping of the previous note).
   synthOnly: play the synth even if the recording is here — playSequence()
   uses it to finish a line in the voice it started in. */
function playNote(midi, gain, when, synthOnly){
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  const src = ctx.createBufferSource();
  const g = ctx.createGain();
  const level = (gain == null) ? PLUCK_VOICE_GAIN : gain;
  const fileMidi = guitarNoteFileMidi(midi);
  const rec = synthOnly ? null : guitarNotes.get(fileMidi);
  src.connect(g);
  g.connect(getPluckBus());
  if (rec){
    src.buffer = rec.buffer;
    if (fileMidi !== midi) src.playbackRate.value = Math.pow(2, (midi - fileMidi) / 12);
    g.gain.value = level * GUITAR_NOTE_GAIN_SCALE;
    src.start(when || 0, rec.offset);   // optional audio-clock start time; 0 = now
  } else {
    loadGuitarNote(fileMidi);           // the recorded note next time; the synth this time
    src.buffer = ksPluckCached(ctx, midi);
    g.gain.value = level;
    src.start(when || 0);
  }
  return { src, gain: g };
}
/* Six notes struck together at full level peaked around 1.5 and clipped on the
   attack. Struck at once their peaks pile up, so split by √n; spread across a
   strum they barely overlap, and √n would leave the strum quieter than a
   single note. */
function chordGain(n, strummed){
  n = Math.max(1, n);
  return PLUCK_VOICE_GAIN / Math.pow(n, strummed ? 0.25 : 0.5);
}
/* Play one TAB beat: 1 midi = single note, N midis = chord, all at once. */
function playBeat(btnEl){
  if(window.coachMicLive) return;  // demo audio would score itself while the Coach listens
  let midis = [];
  try { midis = JSON.parse(btnEl.dataset.midis || '[]'); } catch (e) { return; }
  const g = chordGain(midis.length);
  midis.forEach(m => playNote(Number(m), g));
}
let playSeqState = null;
/* letRing: the line reached its end, so its last note rings out the way a
   player leaves it. Any other stop (the Stop press, a card closing) damps
   it — a recorded note would otherwise ring on for up to three seconds. */
function stopPlaySeq(letRing){
  if(!playSeqState) return;
  playSeqState.timeouts.forEach(clearTimeout);
  if(letRing !== true) playSeqDamp(playSeqState.voices);
  if(playSeqState.btn){
    playSeqState.btn.innerHTML = playSeqState.idleHtml || ('&#x25B6; ' + escHtml(t('step.playAll')));
    playSeqState.btn.classList.remove('playing');
  }
  if(playSeqState.tabRoot){
    playSeqState.tabRoot.querySelectorAll('.beat-now').forEach(el=>el.classList.remove('beat-now'));
  }
  playSeqState = null;
}
/* Kill every site-generated sound (demo sequences, chord strums, metronome
   click). The Coach/games call this when the mic goes live so the analyser
   never scores the speakers. */
/* Everything the SITE is playing at a card's request — the tab player, a
   backing-track loop, chord strums, the ear drill. Deliberately NOT the FAB
   metronome: that is a tool the student started themselves, with its own
   Start/Stop, and it is not this card's sound to end. Use this when a card
   stops being visible or gets rebuilt; use stopAllDemoAudio() below when the
   site is about to listen or to play something that has to be heard clean. */
function stopCardAudio(){
  stopPlaySeq();
  snipStop();   // a looping backing-track snippet is site-generated sound as well
  pcStop();     // …and so is a practice card's song (view:'card')
  chcStopAll();  // …and a Call the chord round: its song, count-in and space-bar listener
  pwnStopAll();  // …and a Name the power chord round's pending advance (a focus-view Next re-renders the card under it)
  ncStopAll();  //…and a Note Call round's clicks (and its mic, if the Coach is on) —
                // a focus-view Next re-renders the card, which would orphan its loop
  chordStrumTimeouts.forEach(clearTimeout);
  chordStrumTimeouts = [];
  erStopAll();
  killRingingPlucks();   // the timeouts above only stop notes that haven't sounded yet
  // clearing the strum timeouts also cancels their '.playing' cleanup — sweep it
  document.querySelectorAll('.playing').forEach(el => el.classList.remove('playing'));
}
/* The above PLUS the student's metronome. For the two cases that earn it: the
   mic is about to open (a click would be recorded and scored — coach.js, and
   fab-tools.js when the tuner opens), or the site is about to play something
   the student has to hear on its own (a tab sequence, a snippet, an
   exit-check stimulus). A plain "mark this done" is neither — see
   stopCardAudio(). */
function stopAllDemoAudio(){
  stopCardAudio();
  // metroRunning/stopMetro live in fab-tools.js (always loaded alongside
  // app.js on index.html) — guarded for robustness, not because it's optional.
  if(typeof metroRunning !== 'undefined' && metroRunning) stopMetro();
  // …and the floating player's backing track (loadPanel 'audio': a looping
  // <audio autoplay>), which would otherwise play under the card or the mic.
  // Paused, not removed — its own ▶ resumes it. Nothing that opens or plays
  // that player calls this, so it never stops the student's own press.
  document.querySelectorAll('#rp-iframe-wrap audio').forEach(el => { try { el.pause(); } catch(e){} });
}
function playSequence(midis, bpm, btnEl){
  if(playSeqState){
    const wasSame = playSeqState.btn === btnEl;
    stopPlaySeq();                 // the STOP half of the toggle must work even mid-check
    if(wasSame) return;
  }
  if(window.coachMicLive) return;  // but no NEW demo audio while the Coach listens
  snipStop();                      // one sound at a time — the band yields to the tab
  pcStop();                        // …and so does a practice card's song
  /* ▶ Play strum brings its own clicks, so a running Metronome stops first
     (Jonathan, 2026-11-09); the student's popup shows Start again. Not in the
     console: that Metronome is the room's. */
  const ownClicks = btnEl && btnEl.dataset && parseInt(btnEl.dataset.clicks, 10) > 0;
  if(ownClicks && !(typeof IS_TEACHER_MODE !== 'undefined' && IS_TEACHER_MODE) && typeof metroRunning !== 'undefined' && metroRunning && typeof stopMetro === 'function') stopMetro();
  /* Recorded notes not all here yet (a first press on a new device): show
     the Stop state straight away, wait for THIS line's notes, then play — so
     a line never starts on the synth and switches voice halfway. A second
     press during the wait is a Stop, same as during playback. A wait that
     runs out (a very slow connection) plays the WHOLE line on the synth
     rather than nothing — and rather than switching voice mid-line as the
     files land; the next press gets the recording. */
  if(!guitarNotesReadyFor(midis)){
    const waiting = {};
    const idle = btnEl ? btnEl.innerHTML : null;
    playSeqState = { timeouts: [], btn: btnEl, idleHtml: idle, tabRoot: null, waiting };
    if(btnEl) playSeqShowStop(btnEl);
    let go = () => {
      go = () => {};
      if(!playSeqState || playSeqState.waiting !== waiting) return;   // stopped, or another Play took over
      playSeqState = null;
      if(btnEl) btnEl.innerHTML = idle;   // restore before startPlaySequence reads it as the idle label
      startPlaySequence(midis, bpm, btnEl, !guitarNotesReadyFor(midis));
    };
    loadGuitarNotesFor(midis).then(() => go());
    setTimeout(() => go(), GUITAR_NOTE_WAIT_MS);
    return;
  }
  startPlaySequence(midis, bpm, btnEl);
}
function playSeqShowStop(btnEl){
  btnEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M9 5v14M15 5v14"/></svg> ' + escHtml(t('tools.stop'));
  btnEl.classList.add('playing');
}
/* A guitarist reading a line lifts the last note as the next one sounds;
   letting every recorded note ring its full three seconds turned a line
   into a wash. So each beat fades out the beat before it (a 25 ms time
   constant — a damp, not a click). Held notes ({ midi, beats }) still ring
   for their whole length, because the damp only comes with the next note. */
const PLAY_SEQ_DAMP_TC = 0.025;
function playSeqDamp(voices){
  if(!voices || !voices.length) return;
  const ctx = getAudioCtx(), now = ctx.currentTime;
  voices.forEach(v => {
    try {
      v.gain.gain.cancelScheduledValues(now);
      v.gain.gain.setValueAtTime(v.gain.gain.value, now);
      v.gain.gain.setTargetAtTime(0, now, PLAY_SEQ_DAMP_TC);
      v.src.stop(now + PLAY_SEQ_DAMP_TC * 8);
    } catch(e){ /* already stopped */ }
  });
}
function startPlaySequence(midis, bpm, btnEl, synthOnly){
  const interval = 60000 / (bpm || 60);
  /* Beat cursor: when the button lives inside a TAB, highlight the sounding
     column — the moving thing is the thing making noise (Ableton's rule). */
  const tabRoot = btnEl ? btnEl.closest('.tab') : null;
  /* Each entry is normally a bare midi number or an array of midis (a
     chord/dyad played on one beat). It can also be { midi, beats } so a
     note can hold longer than one beat — e.g. a Watchtower F held 1.5
     beats through the rest that follows it. Bare entries default to beats:1, so
     every existing sequence schedules exactly as before. */
  let cursor = 0;
  const timeouts = midis.map((m, i) => {
    const hasBeats = m && typeof m === 'object' && !Array.isArray(m);
    const pitches = hasBeats ? m.midi : m;
    const beats = (hasBeats && m.beats > 0) ? m.beats : 1;
    const at = cursor;
    cursor += beats * interval;
    return setTimeout(() => {
      const list = Array.isArray(pitches) ? pitches : [pitches];
      const vg = chordGain(list.length) * (hasBeats && m.down === true ? STRUM_DOWN_GAIN : hasBeats && m.down === false ? STRUM_UP_GAIN : 1);
      if(playSeqState){
        playSeqDamp(playSeqState.voices);
        playSeqState.voices = list.map(x => playNote(Number(x), vg, 0, synthOnly));
      } else {
        list.forEach(x => playNote(Number(x), vg, 0, synthOnly));
      }
      if(tabRoot){
        tabRoot.querySelectorAll('.beat-now').forEach(el=>el.classList.remove('beat-now'));
        tabRoot.querySelectorAll(`[data-seq="${i}"]`).forEach(el=>el.classList.add('beat-now'));
        /* Paged tab (linesPerPage — buildPagedTabBody): the sounding note is
           always on screen, and at the last note of a page the next page
           comes up halfway through it, before its first note is due. */
        const pg = tabPageOf(tabRoot, i);
        if(pg >= 0){
          tabShowPage(tabRoot, pg);
          if(i + 1 < midis.length){
            const nextPg = tabPageOf(tabRoot, i + 1);
            if(nextPg >= 0 && nextPg !== pg) timeouts.push(setTimeout(() => tabShowPage(tabRoot, nextPg), beats * interval / 2));
          }
        }
      }
    }, at);
  });
  /* A button with data-clicks (▶ Play strum) also clicks on every beat the whole time, every click the same (the Metronome's rule since 2026-11-06). */
  const nClicks = btnEl && btnEl.dataset ? parseInt(btnEl.dataset.clicks, 10) : 0;
  if(nClicks > 0){
    for(let k = 0; k < nClicks; k++){
      timeouts.push(setTimeout(() => { pcClick(getAudioCtx().currentTime, false, false, STRUM_CLICK_GAIN); }, k * interval));
    }
  }
  timeouts.push(setTimeout(() => stopPlaySeq(true), cursor));
  const idleHtml = btnEl ? btnEl.innerHTML : null;
  playSeqState = { timeouts, btn: btnEl, idleHtml, tabRoot, voices: [] };
  if(btnEl) playSeqShowStop(btnEl);
}
/* ── BPM slider helpers ── */
function readStoredBpm(key, defBpm){
  if(!key) return defBpm;
  try{
    const v = localStorage.getItem(key);
    if(v != null){
      const n = parseInt(v, 10);
      if(!isNaN(n)) return n;
    }
  }catch(e){}
  return defBpm;
}
function renderBpmControl(key, value, minBpm, maxBpm){
  const min = minBpm || 40;
  const max = maxBpm || 120;
  const v = Math.max(min, Math.min(max, value || 60));
  return `<span class="bpm-control">` +
    `<input type="range" class="bpm-slider" min="${min}" max="${max}" step="1" value="${v}" data-key="${escAttr(key)}" aria-label="${escAttr(t('tools.tempoBpm'))}" oninput="onBpmSliderChange(this)">` +
    `<span class="bpm-readout">${v} BPM</span>` +
  `</span>`;
}
function onBpmSliderChange(slider){
  const readout = slider.parentNode && slider.parentNode.querySelector('.bpm-readout');
  if(readout) readout.textContent = slider.value + ' BPM';
  const key = slider.dataset.key;
  if(key){
    try{ localStorage.setItem(key, slider.value); }catch(e){}
  }
}
/* Read the BPM slider that shares a .bpm-control-group with this button.
   Single reader for the group markup contract — playSequenceFromGroup and
   the Listening Coach's coachOpen both use it. */
function readGroupBpm(btn, def){
  const group = btn.closest('.bpm-control-group');
  const slider = group ? group.querySelector('.bpm-slider') : null;
  const bpm = slider ? parseInt(slider.value, 10) : NaN;
  return isNaN(bpm) ? (def || 60) : bpm;
}
function playSequenceFromGroup(btn){
  let midis;
  try{ midis = JSON.parse(btn.dataset.midis); }catch(e){ return; }
  if(!Array.isArray(midis) || !midis.length) return;
  playSequence(midis, readGroupBpm(btn), btn);
}
/* ── Listening Coach hooks — coach.js owns the card/scoring; these just
      emit the buttons next to playable content. midisJson is the same
      JSON string the sibling ▶ Play button carries. tabNotesJson, when the
      caller has a real TAB spec, carries [{string,fret,note,midi},…] so the
      coach card can show WHERE to play each note; without it coach.js
      derives a fingering itself. ── */
/* Which checklist skills a drill can vouch for. coach.js writes each take's
   level back to these ids (games.coachSkill) and the check-off gate in
   toggleSkill reads it. Note the attribute name: a step <li> already carries
   data-skills holding skill NUMBERS, so the button uses data-coachskills
   holding full skill IDs. Omit for drills that belong to no single skill. */
function coachSkillsAttr(skillIds){
  const ids = Array.isArray(skillIds) ? skillIds : (skillIds ? [skillIds] : []);
  return ids.length ? ` data-coachskills="${escAttr(ids.join(','))}"` : '';
}
/* Step → the ids of the skills that step teaches (step.skills holds numbers). */
function stepSkillIds(w, step){
  if(!w || !step || !step.skills) return [];
  return step.skills.map(n => `${w.id}-s${n}`);
}
function coachBtnHtml(midisJson, tabNotesJson, skillIds, hideNames){
  const tabAttr = tabNotesJson ? ` data-tabnotes="${escAttr(tabNotesJson)}"` : '';
  // hideNames (sight-reading tabs like ca-21, where the Play-tab check is the
  // answer key): the Coach's own board must hide the note-name row too, or it
  // leaks the answer through a second path — see coachTabHtml() in coach.js.
  const hideAttr = hideNames ? ' data-hide-names="1"' : '';
  return `<button type="button" class="coach-btn" data-midis="${escAttr(midisJson)}"${tabAttr}${hideAttr}${coachSkillsAttr(skillIds)} onclick="coachOpenLazy(this)" title="${escAttr(t('coach.btnTitle'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4M9 21h6"/></svg> <span data-i18n="coach.btn">${t('coach.btn')}</span></button>`;
}
/* Chord steps: build [{n:name, m:[midis]}] from the step's own diagram
   specs (same fret math as chordMidis — frets are absolute). */
function coachChordBtnRowHtml(chords, skillIds){
  const spec = (chords||[]).filter(c=>c && c.name && Array.isArray(c.chord)).map(c=>({
    n: tf(c,'name'),
    m: chordSpecMidis(c.chord)
  })).filter(c=>c.m.length);
  if(!spec.length) return '';
  /* The step's own diagrams by name, so the Coach card draws THIS step's boxes
     (a barre C, a two-finger E5, a B5 at fret 7) rather than the library shape
     of the same name (coach.js ccDiagramsHtml). A separate attribute on
     purpose: data-chords is the drill and streak key, so it must not change.
     The first diagram of a name wins, as on the step. */
  const shapes = {};
  (chords||[]).forEach(c=>{
    if(!c || !c.name || !Array.isArray(c.chord)) return;
    const n = tf(c,'name');
    if(!Object.prototype.hasOwnProperty.call(shapes, n)) shapes[n] = { position: c.position || 0, chord: c.chord };
  });
  return `<div class="coach-chord-row"><button type="button" class="coach-btn" data-chords="${escAttr(JSON.stringify(spec))}" data-chord-shapes="${escAttr(JSON.stringify(shapes))}"${coachSkillsAttr(skillIds)} onclick="coachOpenLazy(this)" title="${escAttr(t('coach.chordBtnTitle'))}" data-i18n-attr="title:coach.chordBtnTitle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M12 17v4M9 21h6"/></svg> <span data-i18n="coach.btn">${t('coach.btn')}</span></button></div>`;
}
// Escape closes the video/games overlays (a11y). Tool-popup closing
// (metronome/timer/tuner) is handled by fab-tools.js's own Escape listener.
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape') return;
  const vo=document.getElementById('video-overlay'); if(vo&&!vo.hidden) clearPanel();
  const gs=document.getElementById('games-screen'); if(gs&&!gs.hasAttribute('hidden')&&typeof closeGamesScreen==='function') closeGamesScreen(true);
  if(document.body.classList.contains('rail-open')) closeRail();
});

/* Keep --hdr in sync with the header's real rendered height — on narrow
   screens the title can wrap to two lines, and the drawer/backdrop below
   position themselves off this variable, so a stale 70px would leave a gap
   or an overlap. */
function syncHeaderHeight(){
  const h = document.querySelector('.header');
  /* An open activity folds the header away (body.ca-fold, which sets its own
     --hdr:0px on body). It is hidden by visibility there, so it still measures
     its real height at every window width and this value is right the moment
     it comes back; a header measuring 0 (display:none, or not laid out yet)
     is never written, or #app is sized for no header for a frame, the page
     overflows and the header resizes again inside this observer
     ("ResizeObserver loop", 2026-11-10). */
  if(h && h.offsetHeight) document.documentElement.style.setProperty('--hdr', h.offsetHeight + 'px');
}
window.addEventListener('resize', syncHeaderHeight);
syncHeaderHeight();
if(document.fonts && document.fonts.ready) document.fonts.ready.then(syncHeaderHeight);
/* The header also changes height with no resize at all: sign-in swaps the
   button for the 32px avatar (49px vs a stale 48 — a 1px page scroll on every
   desktop), and Español re-wraps the title. Setting --hdr can't resize the
   header, so this can't loop. */
if(typeof ResizeObserver !== 'undefined'){
  const hdrEl = document.querySelector('.header');
  if(hdrEl) new ResizeObserver(syncHeaderHeight).observe(hdrEl);
}

/* ── Mobile nav drawer: below 760px the rail slides in as an overlay instead
   of stacking in the page flow (see styles.css @media(max-width:760px)). ── */
function isNarrowLayout(){ return window.matchMedia('(max-width:760px)').matches; }
function setRailOpen(open){
  const wasOpen = document.body.classList.contains('rail-open');
  document.body.classList.toggle('rail-open', open);
  const btn = document.getElementById('rail-toggle-btn');
  if(btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  // The closed drawer is only transform-hidden — its ~13 controls stay
  // tabbable and in the a11y tree at narrow widths without this.
  const railEl = document.getElementById('nav-rail');
  if(railEl && isNarrowLayout()) railEl.inert = !open;
  /* Keyboard focus follows the drawer (narrow layout only — at desktop
     widths the rail is always on screen). Opening puts focus on its first
     control; closing (the button, the backdrop, Escape, a pick) hands it
     back to the toggle — but only when focus was in the drawer or nowhere,
     so a pick that already moved focus into the page keeps it, and the
     load-time setRailOpen(false) never steals it. */
  if(!railEl || !isNarrowLayout() || open === wasOpen) return;
  if(open){
    const first = [...railEl.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select, [tabindex]:not([tabindex="-1"])')]
      .find(el => el.getClientRects().length);   // skip anything display:none / hidden
    if(first) first.focus();
  } else if(btn){
    const ae = document.activeElement;
    if(!ae || ae === document.body || railEl.contains(ae)) btn.focus();
  }
}
function toggleRail(){ setRailOpen(!document.body.classList.contains('rail-open')); }
function closeRail(){ setRailOpen(false); }
// Stamp the closed state once at load — setRailOpen is the only writer of
// `inert`, so without this a narrow first paint keeps the transform-hidden
// drawer's ~13 controls tabbable until the drawer has been toggled once.
setRailOpen(false);
window.addEventListener('resize', () => {
  const railEl = document.getElementById('nav-rail');
  if(!isNarrowLayout()){
    closeRail();
    if(railEl) railEl.inert = false;
  } else if(railEl && !document.body.classList.contains('rail-open')){
    // Wide→narrow (window resize, tablet rotate): the drawer is closed but
    // was last stamped at a wide width, where setRailOpen skips the inert
    // write — stamp it now or its controls stay tabbable while hidden.
    railEl.inert = true;
  }
});
/* ── Narrow rail (Chromebook viewing-area work order, 2026-09-19) ──
   A second, independent rail state from the mobile drawer above: the
   drawer is open-or-shut at narrow widths, this is wide-or-narrow at
   desktop widths. They never both apply — the collapse button is
   display:none below the drawer breakpoint — so `rail-open` and
   `rail-collapsed` can't fight.
   Collapsed, the rail is a ~62px icon strip: page icons keep their labels
   as accessible names (clipped, not removed) and gain a translated
   title=, the four tools stack, and the module/set block is hidden — the
   sticky set band names the set now, so the rail is not the only place
   that says where you are.
   Remembered per browser. localStorage is wrapped because a student in a
   locked-down profile (or a private window) throws on access, and the
   right answer there is the ordinary wide rail, not a broken page. */
const RAIL_COLLAPSE_KEY = 'railCollapsed';
function railIsCollapsed(){ return document.body.classList.contains('rail-collapsed'); }
function setRailCollapsed(on){
  document.body.classList.toggle('rail-collapsed', on);
  const btn = document.getElementById('rail-collapse-btn');
  if(btn){
    const key = on ? 'nav.railExpand' : 'nav.railCollapse';
    // aria-expanded describes the rail, not the button's own menu: the
    // button controls #nav-rail (aria-controls), which is expanded when
    // the rail is wide.
    btn.setAttribute('aria-expanded', String(!on));
    btn.setAttribute('data-i18n-attr', `title:${key};aria-label:${key}`);
    btn.setAttribute('title', t(key));
    btn.setAttribute('aria-label', t(key));
  }
  /* A tool popup is positioned against the dock, so it is in the wrong
     place the instant the rail changes width and nothing else would close
     it. stopAudio=false on purpose — this is a dismissal, so a metronome
     the student started keeps clicking (fab-tools.js draws the same line
     for click-away and Escape). The tuner stops regardless; closePopup
     always releases the mic. */
  if(typeof closePopup === 'function'){
    ['metro','timer','tuner','rec'].forEach(w=>{
      const el = document.getElementById(w + '-popup');
      if(el && el.classList.contains('open')) closePopup(w, false);
    });
  }
  try{ localStorage.setItem(RAIL_COLLAPSE_KEY, on ? '1' : '0'); }catch(e){}
}
function toggleRailCollapsed(){ setRailCollapsed(!railIsCollapsed()); }
(function restoreRailCollapsed(){
  let saved = null;
  try{ saved = localStorage.getItem(RAIL_COLLAPSE_KEY); }catch(e){}
  if(saved === '1') setRailCollapsed(true);
})();
// Picking a station or an Explore item shows the main content — close the
// drawer so students actually see it instead of the nav still covering it.
document.getElementById('nav-rail')?.addEventListener('click', e => {
  if(!isNarrowLayout()) return;
  if(e.target.closest('.rail-station, .nav-btn')) closeRail();
});
// Keyboard activation for non-<button> controls that carry role="button"
// (the skill checkboxes and station cards are <div>s for layout reasons).
// Enter or Space fires their click, so keyboard-only students can mark skills
// and open stations. Space is prevented from scrolling the page.
document.addEventListener('keydown',e=>{
  if(e.key!=='Enter'&&e.key!==' '&&e.key!=='Spacebar') return;
  const el=e.target.closest('[role="button"]');
  if(!el||el.tagName==='BUTTON'||el.tagName==='A') return;
  e.preventDefault();
  // SVG has no .click() — the Find-the-Note hit zones are <rect role="button">.
  if(typeof el.click === 'function') el.click();
  else el.dispatchEvent(new MouseEvent('click', {bubbles: true}));
});

/* ── Resource viewer (floating mini-player) ──
   Same loadPanel(type,url,title,subtitle) contract as the old side panel,
   so every rp-trigger / song / chord-link call site works unchanged — the
   content opens in a draggable floating card and the page stays usable,
   so a step's questions are visible while its video plays. */
/* Where focus was before the video viewer opened, so clearPanel can put it
   back (see loadPanel). */
let viewerReturnFocus = null;
function loadPanel(type,url,title,subtitle){
  const overlay=document.getElementById('video-overlay');
  const content=document.getElementById('rp-content');
  const wrap=document.getElementById('rp-iframe-wrap');
  const meta=document.getElementById('rp-meta');
  const newtab=document.getElementById('rp-newtab');
  const close=document.getElementById('rp-close');
  overlay.hidden=false;
  /* Move focus into the player and remember where it came from. Without this a
     keyboard user activating a video link keeps focus behind the viewer and
     tabs through the rest of the step — quiz buttons, got-it checkboxes —
     before ever reaching Close. Focus the CONTAINER, not the close button, so
     the next Tab lands on "Open in new tab" and the whole dialog is reachable
     going forward. No focus trap: this player is deliberately non-modal (it's
     draggable and the page stays usable behind it), so Tab must be able to
     leave. */
  viewerReturnFocus = document.activeElement;
  const modal = overlay.querySelector('.video-modal');
  if(modal) modal.focus();
  clampViewer(overlay);   // a drag on a bigger window could strand it off-screen
  content.classList.add('visible'); newtab.classList.add('visible'); close.classList.add('visible');
  newtab.href=url;
  meta.innerHTML=`<div class="rp-meta-title">${title}</div><div class="rp-meta-sub">${subtitle}</div>`;
  if(type==='youtube'){
    let embedUrl=url;
    const ytMatch=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if(ytMatch){
      // carry a ?t=/&start= timestamp into the embed so timed links land right
      const tMatch=url.match(/[?&](?:t|start)=(\d+)/);
      // end= is embed-only and a soft stop — the player pauses there, but the student can still scrub past it
      const endMatch=url.match(/[?&]end=(\d+)/);
      embedUrl=`https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1${tMatch?`&start=${tMatch[1]}`:''}${endMatch?`&end=${endMatch[1]}`:''}`;
    }
    wrap.className='rp-iframe-wrap rp-youtube';
    // Some videos (age-restricted / label-limited) only play on YouTube itself,
    // and embed failures can't be detected cross-origin — always offer the out.
    wrap.innerHTML=`<div class="rp-video-box"><iframe src="${embedUrl}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div>
      <div class="rp-embed-fallback">${t('panel.embedFallbackHtml',{link:`<a href="${escAttr(url)}" target="_blank" rel="noopener">${escHtml(t('panel.watchThere'))} &#x2197;</a>`})}</div>`;
  } else if(type==='audio'){
    // Local backing track — an <audio> player that loops on its own.
    wrap.className='rp-iframe-wrap rp-audio';
    wrap.innerHTML=`<div class="rp-audio-box"><audio src="${escAttr(url)}" controls loop autoplay preload="none"></audio></div>`;
  } else if(type==='pdf'){
    wrap.className='rp-iframe-wrap rp-doc';
    wrap.innerHTML=`<iframe src="${url}"></iframe>`;
  } else if(type==='gdoc'){
    const embedUrl=url.includes('/preview')?url:url.replace(/\/edit.*$/,'/preview');
    wrap.className='rp-iframe-wrap rp-doc';
    wrap.innerHTML=`<iframe src="${embedUrl}"></iframe>`;
  } else if(type==='chord'){
    /* For chord type, `url` carries the chord NAME — render the diagram locally */
    const chordName = url;
    wrap.className='rp-iframe-wrap rp-chord';
    const svg = localChordSvg(chordName);
    if (svg){
      const hasAudio = chordMidis(chordName).length > 0;
      const playBtn = hasAudio
        ? `<button type="button" class="rp-chord-play" onclick="strumChord('${escAttr(chordName)}', this)" title="${escAttr(t('panel.strumChord'))}" data-i18n-attr="title:panel.strumChord">&#x25B6; <span data-i18n="panel.playChord">${escHtml(t('panel.playChord'))}</span></button>`
        : '';
      wrap.innerHTML = `<div class="rp-chord-svg">${svg}</div>${playBtn}`;
      newtab.classList.remove('visible'); // local render — no external URL to open
    } else {
      wrap.innerHTML = `<div class="rp-chord-err" data-i18n="panel.noDiagram" data-i18n-params="${escAttr(JSON.stringify({name:chordName}))}">${escHtml(t('panel.noDiagram',{name:chordName}))}</div>`;
      newtab.classList.remove('visible');
    }
  } else if(type==='string'){
    /* For string type, `url` carries the string KIND (lowE/A/D/G/B/highE) */
    const kind = url;
    wrap.className='rp-iframe-wrap rp-chord wide';
    const svg = localStringFretboardSvg(kind);
    if (svg){
      wrap.innerHTML = `<div class="rp-chord-svg">${svg}</div>`;
      newtab.classList.remove('visible');
    } else {
      wrap.innerHTML = `<div class="rp-chord-err" data-i18n="panel.noDiagram" data-i18n-params="${escAttr(JSON.stringify({name:kind}))}">${escHtml(t('panel.noDiagram',{name:kind}))}</div>`;
      newtab.classList.remove('visible');
    }
  } else if(type==='note'){
    /* For note type, `url` carries "kind|fret|note" */
    const [kind, fretStr, note] = String(url).split('|');
    const fret = Number(fretStr);
    wrap.className='rp-iframe-wrap rp-chord wide';
    const svg = localNoteSvg(kind, fret, note);
    if (svg){
      wrap.innerHTML = `<div class="rp-chord-svg">${svg}</div>`;
      newtab.classList.remove('visible');
    } else {
      wrap.innerHTML = `<div class="rp-chord-err" data-i18n="rp.noDiagram" data-i18n-params="${escAttr(JSON.stringify({note:note||''}))}">${escHtml(t('rp.noDiagram',{note:note||''}))}</div>`;
      newtab.classList.remove('visible');
    }
  }
}
function clearPanel(){
  const overlay=document.getElementById('video-overlay');
  const content=document.getElementById('rp-content');
  const wrap=document.getElementById('rp-iframe-wrap');
  const newtab=document.getElementById('rp-newtab');
  const close=document.getElementById('rp-close');
  content.classList.remove('visible'); newtab.classList.remove('visible'); close.classList.remove('visible');
  wrap.className='rp-iframe-wrap'; wrap.innerHTML='';   // removing the iframe stops playback
  if(overlay) overlay.hidden=true;
  /* Hand focus back to whatever opened the player. The document.contains guard
     matters: the trigger usually lives in step HTML that gets re-rendered on a
     language switch or a set change, so the element we saved may be detached —
     focusing it then would silently drop focus to <body>. */
  if(viewerReturnFocus && document.contains(viewerReturnFocus)) viewerReturnFocus.focus();
  viewerReturnFocus = null;
}

/* Keep the mini-player inside the viewport (after drags / window resizes). */
function clampViewer(box){
  if(!box || !box.style.left) return;   // never dragged — still CSS-docked bottom-right
  const w=box.offsetWidth||480, headroom=60;
  box.style.left=Math.min(Math.max(parseFloat(box.style.left),8),Math.max(8,window.innerWidth-w-8))+'px';
  box.style.top=Math.min(Math.max(parseFloat(box.style.top),8),Math.max(8,window.innerHeight-headroom))+'px';
}

/* Drag the mini-player by its header so it can sit wherever it doesn't
   block the step being read. First drag converts the CSS right/bottom
   docking into explicit left/top. While dragging, the iframe stops
   swallowing pointer events (.dragging CSS). */
(function(){
  const box=document.getElementById('video-overlay');
  if(!box) return;
  const head=box.querySelector('.vm-head');
  if(!head) return;
  let dragging=false,dx=0,dy=0;
  function start(x,y,target){
    if(target.closest('button,a')) return false;
    const r=box.getBoundingClientRect();
    box.style.left=r.left+'px'; box.style.top=r.top+'px';
    box.style.right='auto'; box.style.bottom='auto';
    dx=x-r.left; dy=y-r.top;
    dragging=true;
    box.classList.add('dragging');
    document.body.style.userSelect='none';
    return true;
  }
  function move(x,y){
    if(!dragging) return;
    box.style.left=Math.min(Math.max(x-dx,8),Math.max(8,window.innerWidth-box.offsetWidth-8))+'px';
    box.style.top=Math.min(Math.max(y-dy,8),Math.max(8,window.innerHeight-60))+'px';
  }
  function end(){
    if(!dragging) return;
    dragging=false;
    box.classList.remove('dragging');
    document.body.style.userSelect='';
  }
  const onMouseMove=e=>move(e.clientX,e.clientY);
  const onTouchMove=e=>{ e.preventDefault(); move(e.touches[0].clientX,e.touches[0].clientY); };
  function attach(){
    document.addEventListener('mousemove',onMouseMove);
    document.addEventListener('mouseup',endDrag);
    document.addEventListener('touchmove',onTouchMove,{passive:false});
    document.addEventListener('touchend',endDrag);
  }
  function endDrag(){
    end();
    document.removeEventListener('mousemove',onMouseMove);
    document.removeEventListener('mouseup',endDrag);
    document.removeEventListener('touchmove',onTouchMove);
    document.removeEventListener('touchend',endDrag);
  }
  head.addEventListener('mousedown',e=>{ if(start(e.clientX,e.clientY,e.target)){ e.preventDefault(); attach(); } });
  head.addEventListener('touchstart',e=>{ if(start(e.touches[0].clientX,e.touches[0].clientY,e.target)){ e.preventDefault(); attach(); } },{passive:false});
  window.addEventListener('resize',()=>clampViewer(box));
})();

