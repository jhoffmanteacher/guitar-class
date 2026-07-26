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
let metroRunning=false, metroInterval=null, metroMeter=4, metroCountIn=false, metroBeatIdx=0, metroCountInTimeouts=[];
function getMetroMeter(){ return metroMeter; }
function setMetroMeter(n){
  metroMeter = n;
  document.querySelectorAll('#metro-popup .meter-btn').forEach(b=>{
    const on = b.id === 'meter-'+n;
    b.classList.toggle('sel', on);
    b.setAttribute('aria-checked', on ? 'true' : 'false');
    b.tabIndex = on ? 0 : -1;
  });
  if(metroRunning){ stopMetro(); startMetro(false); }
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
function setMetroCountIn(on){ metroCountIn = !!on; }
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
function onBpmSlider(val){ document.getElementById('bpm-display').textContent=val; if(metroRunning){ stopMetro(); startMetro(false); } }
function nudgeBpm(d){ const s=document.getElementById('bpm-slider'); s.value=Math.min(220,Math.max(40,getBpm()+d)); document.getElementById('bpm-display').textContent=s.value; if(metroRunning){ stopMetro(); startMetro(false); } }
/* useCountIn defaults true (the Start button's toggle); BPM/meter changes
   while already running pass false so they don't replay the lead-in bar. */
function startMetro(useCountIn){
  // Runs even while the Coach's mic is live — tick() itself stays silent in
  // that case (see its comment), so this just keeps the visible dot/button
  // state honest instead of the Start button silently doing nothing.
  metroRunning = true;
  metroBeatIdx = 0;
  document.getElementById('metro-btn').innerHTML=toolLabelHtml('&#x23F8;','tools.stop');
  const beatMs = Math.round(60000/getBpm());
  const beginRun = () => {
    if(!metroRunning) return;
    metroBeatIdx = 0;
    tick();
    metroInterval = setInterval(tick, beatMs);
  };
  if(useCountIn !== false && metroCountIn){
    const meter = getMetroMeter();
    for(let i=0; i<meter; i++){
      metroCountInTimeouts.push(setTimeout(()=>{ if(metroRunning) tick(); }, i*beatMs));
    }
    metroCountInTimeouts.push(setTimeout(beginRun, meter*beatMs));
  } else {
    beginRun();
  }
}
function stopMetro(){
  clearInterval(metroInterval);
  metroCountInTimeouts.forEach(clearTimeout);
  metroCountInTimeouts = [];
  metroRunning=false;
  metroBeatIdx=0;
  document.getElementById('metro-btn').innerHTML=toolLabelHtml('&#x25B6;','tools.start');
}
function toggleMetro(){ if(metroRunning) stopMetro(); else startMetro(true); }

/* ── Timer ── */
let timerRunning=false, timerInterval=null, timerSecs=30, timerSelected=30;
function setTimerSecs(secs){ timerSelected=secs; timerSecs=secs; if(timerRunning){ clearInterval(timerInterval); timerRunning=false; document.getElementById('timer-btn').innerHTML=toolLabelHtml('&#x25B6;','tools.start'); } updateTimerDisplay(); [30,60,120,180,240,300].forEach(s=>{ const el=document.getElementById('tp-'+s); if(el) el.classList.toggle('sel',s===secs); }); }
function updateTimerDisplay(){ const m=Math.floor(timerSecs/60),s=timerSecs%60; document.getElementById('timer-display').textContent=m+':'+(s<10?'0':'')+s; }
// Flash the display when time's up — visible across a loud room without headphones.
function flashTimerDisplay(){ flashClass(document.getElementById('timer-display'),'timer-done-flash',2400); }
// Pulse the floating timer button too — it's visible even when the popup is closed.
function flashTimerFab(){ flashClass(document.getElementById('fab-timer'),'fab-timer-done',3600); }
function resetTimer(){ if(timerRunning){ clearInterval(timerInterval); timerRunning=false; } timerSecs=timerSelected; updateTimerDisplay(); document.getElementById('timer-btn').innerHTML=toolLabelHtml('&#x25B6;','tools.start'); }
function toggleTimer(){ if(timerRunning){ clearInterval(timerInterval); timerRunning=false; document.getElementById('timer-btn').innerHTML=toolLabelHtml('&#x25B6;','tools.start'); } else { timerRunning=true; document.getElementById('timer-btn').innerHTML=toolLabelHtml('&#x23F8;','tools.pause'); timerInterval=setInterval(()=>{ if(timerSecs>0){ timerSecs--; updateTimerDisplay(); } else { clearInterval(timerInterval); timerRunning=false; document.getElementById('timer-btn').innerHTML=toolLabelHtml('&#x25B6;','tools.start'); [0,0.35,0.7].forEach(d=>setTimeout(()=>toolsBeep(660,0.3),d*1000)); flashTimerDisplay(); flashTimerFab(); } },1000); } }

/* ── Popup logic ── */
function setFabExpanded(which, isOpen){ const f=document.getElementById('fab-'+which); if(f) f.setAttribute('aria-expanded', isOpen?'true':'false'); }
function togglePopup(which){
  const open=document.getElementById(which+'-popup').classList.toggle('open');
  setFabExpanded(which, open);
  // The tuner has no Start/Stop button — opening it starts listening, closing stops.
  // One mic owner at a time: the tuner interrupts a live Listening Coach check
  // and stops any running game mic (app.js/coach.js only — guarded, since
  // journey pages don't have those features).
  if(which==='tuner'){
    if(open){
      if(typeof coachInterrupt==='function') coachInterrupt();
      if(typeof gamesStopMic==='function') gamesStopMic();
      if(typeof stopAllDemoAudio==='function') stopAllDemoAudio();
      startTuner();
    } else { stopTuner(); }
  }
  if(which==='metro' && open) syncMetroMutedNote();
}
function closePopup(which){ document.getElementById(which+'-popup').classList.remove('open'); setFabExpanded(which, false); if(which==='metro') stopMetro(); if(which==='tuner') stopTuner(); }
document.addEventListener('click',e=>{
  if(!e.target.closest('.tool-popup')&&!e.target.closest('.fab')&&!e.target.closest('.fab-buttons')){
    ['metro','timer','tuner'].forEach(closePopup);
  }
});
// Escape closes any open tool popup (a11y)
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape') return;
  ['metro','timer','tuner'].forEach(w=>{ const el=document.getElementById(w+'-popup'); if(el&&el.classList.contains('open')) closePopup(w); });
});
