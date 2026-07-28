/* ══════════════════════════════════════════════════════════════
   Floating Tuner / Timer / Metronome tools — shared by index.html
   AND every tabs/*.html Song Journey page, so the same practice
   aids are available wherever a student is reading or practicing.
   Self-contained: no dependency on app.js. Pairs with tuner.js
   (the actual pitch-detection engine, also dependency-free) —
   both must be loaded on any page that includes the fab-group
   markup. flashClass is a plain global (not prefixed) because
   tuner.js calls it directly by that name.
   ══════════════════════════════════════════════════════════════ */
function flashClass(el, cls, ms){
  if(!el) return;
  el.classList.remove(cls); void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(()=>el.classList.remove(cls), ms);
}
let toolsAudioCtx = null;
function toolsGetAudioCtx(){ if(!toolsAudioCtx) toolsAudioCtx = new (window.AudioContext||window.webkitAudioContext)(); return toolsAudioCtx; }
function toolsBeep(freq,dur,gain){
  const ctx=toolsGetAudioCtx(), o=ctx.createOscillator(), g=ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.frequency.value=freq;
  g.gain.setValueAtTime(gain==null?0.4:gain,ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
  o.start(); o.stop(ctx.currentTime+dur);
}

// Start/Stop/Pause/Reset labels are set dynamically here as the tool runs, so
// each one carries its own data-i18n key (i18n.js is loaded before this file
// on every page that uses it) — a later pure language switch can still find
// and retranslate whichever label is currently showing. translate="no" is
// set directly here too, not left for the next setLang() call to add — this
// button can be rebuilt (e.g. an auto stopMetro()) with no language switch in
// between, and an unmarked span in that window is one Google Translate could
// still grab if it re-scans the page.
function toolLabelHtml(icon, key){ return `${icon} <span data-i18n="${key}" translate="no" class="notranslate">${t(key)}</span>`; }

/* ── Metronome ── */
let metroRunning=false, metroInterval=null, metroMeter=4, metroBeatIdx=0;
function getMetroMeter(){ return metroMeter; }
function setMetroMeter(n){
  metroMeter = n;
  document.querySelectorAll('#metro-popup .meter-btn').forEach(b=>{
    const on = b.id === 'meter-'+n;
    b.classList.toggle('sel', on);
    b.setAttribute('aria-checked', on ? 'true' : 'false');
    b.tabIndex = on ? 0 : -1;
  });
  if(metroRunning){ stopMetro(); startMetro(); }
}
/* Arrow-key navigation for the 2/4-4/4-3/4 radiogroup (WAI-ARIA roving-tabindex
   pattern): only the selected meter button is tabbable; arrows move selection
   and focus among the other options. */
function meterKeydown(e){
  const nav = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];
  if(!nav.includes(e.key)) return;
  e.preventDefault();
  const order = [2,4,3];
  const idx = order.indexOf(metroMeter);
  let next;
  if(e.key==='Home') next = order[0];
  else if(e.key==='End') next = order[order.length-1];
  else if(e.key==='ArrowRight' || e.key==='ArrowDown') next = order[(idx+1)%order.length];
  else next = order[(idx-1+order.length)%order.length];
  setMetroMeter(next);
  document.getElementById('meter-'+next).focus();
}
/* ── Shared "selected button" ARIA helpers ──
   Several button groups on the site show which option is picked with a CSS
   class only (.active on the tuner's string locks, .on on the teacher view
   toggle, .sel on the timer presets) — invisible to a screen reader. These two
   helpers mirror that class onto ARIA, and are wired from a delegated onclick /
   onkeydown on the GROUP element in index.html, so they run after the button's
   own handler has bubbled and the owning script (tuner.js, teacher.js) needs no
   change. Both no-op on any page that doesn't have the group. */
/* Radiogroup flavour (WAI-ARIA roving tabindex, same as the meter buttons
   above): only the selected option is tabbable; radioGroupKeydown moves the
   selection with the arrow keys so the others stay reachable. */
function syncRadioGroupAria(groupSel, itemSel, onClass){
  const g = document.querySelector(groupSel);
  if(!g) return;
  g.querySelectorAll(itemSel).forEach(b => {
    /* Only for buttons actually marked up as radios. The tabs/*.html Journey
       pages ship the same tuner/timer markup WITHOUT the radiogroup wiring, and
       a roving tabindex there would strand the unselected options with no
       arrow-key handler to reach them. */
    if(b.getAttribute('role') !== 'radio') return;
    const on = b.classList.contains(onClass);
    b.setAttribute('aria-checked', on ? 'true' : 'false');
    b.tabIndex = on ? 0 : -1;
  });
}
function radioGroupKeydown(e, groupSel, itemSel, onClass){
  const nav = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'];
  if(!nav.includes(e.key)) return;
  const g = document.querySelector(groupSel);
  if(!g) return;
  const items = Array.from(g.querySelectorAll(itemSel));
  if(!items.length) return;
  e.preventDefault();
  let idx = items.findIndex(b => b.classList.contains(onClass));
  if(idx < 0) idx = 0;
  let next;
  if(e.key === 'Home') next = 0;
  else if(e.key === 'End') next = items.length - 1;
  else if(e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % items.length;
  else next = (idx - 1 + items.length) % items.length;
  items[next].click();   // let the group's own onclick do the real work
  syncRadioGroupAria(groupSel, itemSel, onClass);
  items[next].focus();
}
/* Toggle-button flavour: aria-pressed, every button stays tabbable. Used where
   the group gains buttons at runtime (the teacher view toggle) and a roving
   tabindex would leave those unmanaged siblings out of step. */
function syncPressedGroup(groupSel, itemSel, onClass){
  const g = document.querySelector(groupSel);
  if(!g) return;
  g.querySelectorAll(itemSel).forEach(b =>
    b.setAttribute('aria-pressed', b.classList.contains(onClass) ? 'true' : 'false'));
}

/* Beat 1 of the bar rings out louder and higher — the downbeat you count "1" on
   — everything else in the bar is the plain click. */
function tick(){
  if(!window.coachMicLive){
    const accent = metroBeatIdx === 0;
    toolsBeep(accent ? 1320 : 880, accent ? 0.08 : 0.06, accent ? 0.55 : 0.4);
  }
  syncMetroMutedNote();
  const dot=document.getElementById('metro-dot'); if(dot){ dot.classList.add('flash'); setTimeout(()=>dot.classList.remove('flash'),80); }
  metroBeatIdx = (metroBeatIdx + 1) % getMetroMeter();
}
/* Shows a small note in the popup when the click is running silent because
   the Listening Coach's mic is live (an audible click would bleed into its
   pitch/onset detection). Without this the Start button just looked broken —
   the dot flashes, the button says Stop, but nothing plays and nothing says
   why. Checked on every tick (so it appears/disappears live) and when the
   popup opens. */
function syncMetroMutedNote(){
  const note = document.getElementById('metro-muted-note');
  if(note) note.hidden = !window.coachMicLive;
}
function getBpm(){ return parseInt(document.getElementById('bpm-slider').value); }
/* Retime a running click to the current BPM WITHOUT startMetro()'s immediate
   synchronous tick(): a slider drag fires many input events a second, and a
   beep per event was a machine-gun burst. Swaps only the interval, so the
   accent keeps its place in the bar instead of resetting to beat 1 per event. */
function retimeMetro(){
  if(!metroRunning) return;
  clearInterval(metroInterval);
  metroInterval = setInterval(tick, Math.round(60000/getBpm()));
}
function onBpmSlider(val){ document.getElementById('bpm-display').textContent=val; retimeMetro(); }
function nudgeBpm(d){ const s=document.getElementById('bpm-slider'); s.value=Math.min(220,Math.max(40,getBpm()+d)); document.getElementById('bpm-display').textContent=s.value; if(metroRunning){ stopMetro(); startMetro(); } }
function startMetro(){
  // Runs even while the Coach's mic is live — tick() itself stays silent in
  // that case (see its comment), so this just keeps the visible dot/button
  // state honest instead of the Start button silently doing nothing.
  metroRunning = true;
  metroBeatIdx = 0;
  document.getElementById('metro-btn').innerHTML=toolLabelHtml('&#x23F8;','tools.stop');
  const beatMs = Math.round(60000/getBpm());
  tick();
  metroInterval = setInterval(tick, beatMs);
}
function stopMetro(){
  clearInterval(metroInterval);
  metroRunning=false;
  metroBeatIdx=0;
  document.getElementById('metro-btn').innerHTML=toolLabelHtml('&#x25B6;','tools.start');
}
function toggleMetro(){ if(metroRunning) stopMetro(); else startMetro(); }

/* ── Timer ── */
// timerEndAt: wall-clock deadline while running. The countdown is recomputed
// from it on every tick instead of decrementing per tick — a hidden/suspended
// tab throttles or stalls setInterval, and counting ticks made the timer run
// long and ring late. Paused state keeps only timerSecs (remaining seconds).
let timerRunning=false, timerInterval=null, timerSecs=30, timerSelected=30, timerEndAt=0;
function setTimerSecs(secs){ timerSelected=secs; timerSecs=secs; if(timerRunning){ clearInterval(timerInterval); timerRunning=false; document.getElementById('timer-btn').innerHTML=toolLabelHtml('&#x25B6;','tools.start'); } updateTimerDisplay(); [30,60,120,180,240,300].forEach(s=>{ const el=document.getElementById('tp-'+s); if(!el) return; const on = s===secs; el.classList.toggle('sel',on);
  /* ARIA half of the selection, so it isn't carried by the .sel class alone.
     Guarded on role="radio": the tabs/*.html Journey pages ship the same preset
     markup WITHOUT the radiogroup wiring, and setting tabIndex=-1 there would
     make five of the six presets unreachable by keyboard with no arrow-key
     handler to get back to them. */
  if(el.getAttribute('role')==='radio'){ el.setAttribute('aria-checked', on?'true':'false'); el.tabIndex = on?0:-1; } }); }
function updateTimerDisplay(){ const m=Math.floor(timerSecs/60),s=timerSecs%60; document.getElementById('timer-display').textContent=m+':'+(s<10?'0':'')+s; }
// Flash the display when time's up — visible across a loud room without headphones.
function flashTimerDisplay(){ flashClass(document.getElementById('timer-display'),'timer-done-flash',2400); }
// Pulse the floating timer button too — it's visible even when the popup is closed.
// Also pulse the Tools launcher: when the stack is collapsed, the timer FAB itself
// is hidden, and the launcher is the only visible cue left for a loud room.
function flashTimerFab(){ flashClass(document.getElementById('fab-timer'),'fab-timer-done',3600); flashClass(document.getElementById('fab-launcher'),'fab-timer-done',3600); }
function resetTimer(){ if(timerRunning){ clearInterval(timerInterval); timerRunning=false; } timerSecs=timerSelected; updateTimerDisplay(); document.getElementById('timer-btn').innerHTML=toolLabelHtml('&#x25B6;','tools.start'); }
function toggleTimer(){ if(timerRunning){ /* pause: bank the true remaining seconds off the deadline (the last tick may be stale if the tab was hidden) */ timerSecs=Math.max(0,Math.ceil((timerEndAt-Date.now())/1000)); updateTimerDisplay(); clearInterval(timerInterval); timerRunning=false; document.getElementById('timer-btn').innerHTML=toolLabelHtml('&#x25B6;','tools.start'); } else { if(timerSecs<=0){ timerSecs=timerSelected; updateTimerDisplay(); } /* already rang — Start means restart, not re-fire the alarm a second later */ timerRunning=true; timerEndAt=Date.now()+timerSecs*1000; document.getElementById('timer-btn').innerHTML=toolLabelHtml('&#x23F8;','tools.pause'); timerInterval=setInterval(()=>{ timerSecs=Math.max(0,Math.ceil((timerEndAt-Date.now())/1000)); updateTimerDisplay(); if(timerSecs<=0){ clearInterval(timerInterval); timerRunning=false; document.getElementById('timer-btn').innerHTML=toolLabelHtml('&#x25B6;','tools.start'); [0,0.35,0.7].forEach(d=>setTimeout(()=>toolsBeep(660,0.3),d*1000)); flashTimerDisplay(); flashTimerFab(); } },1000); } }

/* ── Tools launcher — collapses the three FABs into one pill; expanding
   reveals them upward (the launcher is the last, bottom-anchored child of
   .fab-group). Doesn't auto-collapse when a popup closes — students toggle
   tools rapidly — only the launcher click, Escape, and an outside click
   collapse the stack. ── */
function setToolsOpen(open){
  const group = document.getElementById('fab-group');
  if(!group) return;
  group.classList.toggle('tools-open', open);
  const launcher = document.getElementById('fab-launcher');
  if(launcher) launcher.setAttribute('aria-expanded', open?'true':'false');
}
function toggleTools(){
  const group = document.getElementById('fab-group');
  if(!group) return;
  setToolsOpen(!group.classList.contains('tools-open'));
}

/* ── Popup logic ── */
function setFabExpanded(which, isOpen){ const f=document.getElementById('fab-'+which); if(f) f.setAttribute('aria-expanded', isOpen?'true':'false'); }
function togglePopup(which){
  const open=document.getElementById(which+'-popup').classList.toggle('open');
  setFabExpanded(which, open);
  // The tuner has no Start/Stop button — opening it starts listening, closing stops.
  // One mic owner at a time: the tuner interrupts a live Listening Coach check
  // and stops any running game mic (app.js/coach.js only — guarded, since
  // journey pages don't have those features). A running metronome stops too:
  // its clicks (880/1320Hz) sit inside the tuner's 70–1500Hz bandpass and
  // echoCancellation is off, so they'd be heard as pitch.
  if(which==='tuner'){
    if(open){
      if(typeof coachInterrupt==='function') coachInterrupt();
      if(typeof gamesStopMic==='function') gamesStopMic();
      if(typeof stopAllDemoAudio==='function') stopAllDemoAudio();
      if(metroRunning) stopMetro();
      startTuner();
    } else { stopTuner(); }
  }
  if(which==='metro' && open) syncMetroMutedNote();
  /* Keyboard: the popups sit BEFORE .fab-buttons in the source, so after
     pressing Enter on a FAB the next Tab went to the next FAB, not into the
     popup that just opened — the popup's controls were only reachable by
     shift-tabbing backwards past its ✕, which nobody guesses. Moving focus to
     the popup's first control (its ✕, which is first in the popup) fixes it
     without reordering the DOM: .fab-group is a flex column and the popups
     render above the pills purely by source order, so swapping them would move
     the popups below the pills (or need a CSS `order` that puts visual and
     focus order back out of step). closePopup hands focus back to the FAB.
     Not focus-TRAPPED: these are non-modal — a click anywhere else closes them
     and the page behind stays usable. */
  if(open){
    const first = document.querySelector('#'+which+'-popup .tp-close');
    if(first) first.focus();
  }
}
function closePopup(which){
  const el = document.getElementById(which+'-popup');
  /* Only pull focus back to the FAB if it was actually inside the popup —
     Escape and ✕ qualify; the click-away listener below does not (the student
     has already clicked somewhere else and focus belongs there), and neither
     does toggling the popup shut from the FAB itself. */
  const hadFocus = el && el.contains(document.activeElement);
  if(el) el.classList.remove('open');
  setFabExpanded(which, false);
  if(which==='metro') stopMetro();
  if(which==='tuner') stopTuner();
  if(hadFocus){ const fab = document.getElementById('fab-'+which); if(fab) fab.focus(); }
}
// Uses composedPath() (the propagation path captured at dispatch time), not
// e.target.closest(): Start/Stop/Pause buttons replace their own innerHTML
// on click (see toolLabelHtml call sites), which detaches whichever child
// node the click actually landed on. closest() on a detached node can't walk
// back up to .tool-popup, so it looked like a click "outside" and this
// listener closed (and stopped) the tool that was just started.
document.addEventListener('click',e=>{
  const path = e.composedPath();
  const inside = path.some(el=>el.classList && (el.classList.contains('tool-popup')||el.classList.contains('fab')||el.classList.contains('fab-buttons')||el.classList.contains('fab-group')));
  if(!inside){
    // Only the tuner stops on a click-away — it's holding the mic, so leaving
    // it listening in the background is a real cost. A running metronome or
    // timer keeps running: the student tapping a lesson step or a Journey page
    // shouldn't silently kill the click they're practicing to. Those popups
    // just slide shut visually. The Tools stack itself still collapses.
    closePopup('tuner');
    ['metro','timer'].forEach(w=>{
      const el = document.getElementById(w+'-popup');
      if(el) el.classList.remove('open');
      setFabExpanded(w, false);
    });
    setToolsOpen(false);
  }
});
// Escape closes any open tool popup (a11y) and collapses the Tools stack.
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape') return;
  const group = document.getElementById('fab-group');
  const hadFocus = group && group.contains(document.activeElement);
  ['metro','timer','tuner'].forEach(w=>{ const el=document.getElementById(w+'-popup'); if(el&&el.classList.contains('open')) closePopup(w); });
  if(group && group.classList.contains('tools-open')){
    setToolsOpen(false);
    if(hadFocus){ const launcher=document.getElementById('fab-launcher'); if(launcher) launcher.focus(); }
  }
});

/* ── Focus trap for the full-screen overlays (a11y) ──
   #games-screen, #keep-practicing-screen and #my-progress-screen are
   position:fixed;inset:0;z-index:120 and set aria-modal="true". aria-modal
   removes the page behind them from the accessibility TREE but does nothing to
   TAB ORDER, and body{overflow:hidden} doesn't either — so one Shift+Tab off
   "Back to practice" landed on the header's Español toggle: focused, invisible
   behind an opaque overlay, no way to tell where you were. Keep Tab inside
   whichever overlay is open.
   Deliberately NOT applied to #video-overlay: that one is a non-modal floating
   mini-player (z-index 90, no aria-modal) whose whole point is that the step
   behind it stays usable — trapping there would be a bug, not a fix.
   Lives in this file because it's the shared, dependency-free tools script;
   the tabs/*.html Journey pages have no such overlays, so it returns on the
   first querySelector there.
   .daily5-overlay is in the list too — the Daily 5, Songs hub, Report-a-problem
   and the two check-off gates are all aria-modal="true" popups with the same
   gap, and one of them can open ON TOP of a full-screen overlay (z-index 150
   over 120). They're appended to <body> after #app, so the LAST match in
   document order is the topmost one — trap that, or a modal stacked over the
   games screen would be the one thing Tab couldn't reach. */
const MODAL_OVERLAY_SEL = '.games-screen:not([hidden]), .page-screen:not([hidden]), .daily5-overlay';
const MODAL_FOCUSABLE_SEL = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';
document.addEventListener('keydown', e => {
  if(e.key !== 'Tab') return;
  const open = document.querySelectorAll(MODAL_OVERLAY_SEL);
  if(!open.length) return;
  const modal = open[open.length - 1];
  // Skip anything hidden (a collapsed game panel, a display:none row) — landing
  // focus on it would look identical to losing focus altogether.
  const items = Array.from(modal.querySelectorAll(MODAL_FOCUSABLE_SEL))
    .filter(el => el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  if(!items.length) return;
  const first = items[0], last = items[items.length - 1];
  const active = document.activeElement;
  if(!modal.contains(active)){ e.preventDefault(); (e.shiftKey ? last : first).focus(); return; }
  if(e.shiftKey && active === first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey && active === last){ e.preventDefault(); first.focus(); }
});
