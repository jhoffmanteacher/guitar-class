/* ══ RECORD AND COMPARE — Record mine / Play mine / Play the model on two practice cards (Jonathan, 2026-11-27) ══
   WORK-ORDER-spot-record-wording Part 3 ("Local record and compare"). A card with `card.recordCompare: true` (ca-18
   and ca-54 only; checks.mjs 1ft pins the list) gets one row of three buttons under its player:
     Record mine      asks for the mic (once per press; a second press while it asks or records is Stop), then plays
                      the PASSAGE from the card's usual count-in, with the Guitar switch as the student left it, and
                      records from the bar the band comes in (pcGo -> pcRecBandIn) to the passage's last bar line,
                      where the card stops by itself (pcFrame: st.recPass). At most PC_REC_MAX_SECS. Any Stop (the
                      card's Play, the bar's Stop, Space / K), a section tap, a speed or Guitar switch (pcRetrack), the
                      card closing, the page leaving or the tab going out of sight stops the band and the recorder
                      together (every one of them goes through pcStop -> pcRecPassStopped) and releases the mic.
     Play mine        plays the take back on this device (an <audio> element that is never put on the page: no
                      controls, so no download menu).
     Play the model   plays the same passage at the same speed with the Guitar switch on (it turns the switch on, on
                      screen, if it was off), no recording, and stops at the passage's end.
   THE PASSAGE: on a card with section buttons, the section tapped last (pcRecPick), all its reps; before any tap the
   card's LAST section (ca-18: Chorus). On a rounds card (ca-54), one time through the round (sections from..to) at
   the stop the speed control shows (a Build up speed play keeps that stop: no lap is played, so nothing climbs).
   At the passage's end the card's top comes back on screen (caCardViewReveal), with the three buttons.
   ONE TAKE, IN MEMORY ONLY: a new take replaces the old one. The take is dropped when its card closes (pcLoopReset ->
   pcRecReset), the page leaves (pagehide, or the In-Class screen closing: stopCardAudio -> pcRecStopAll finds the
   card out of sight) or the card is drawn again (a language switch). A take stopped by the tab going out of sight
   is thrown away (as Module Review's is). NOTHING IS SAVED OR SENT: no download link, no upload, no Firestore, no
   localStorage / sessionStorage / IndexedDB, no fetch (checks.mjs 1ft reads this file for them). Nothing listens or
   grades: this records and plays back. Not in the console (preview or teacher mode): no row is drawn there.
   Card audio (THE SPARE in app/cards.js): Record mine and Play the model are the card's own pcStart with a recPass,
   so st.audio, st.spare and st.leaving are all pcStop's; a recPass play never makes a spare. */
const PC_REC_MAX_SECS = 75;
/* The take being made (one at a time, site-wide): { root, asking, stream, recorder, chunks, pass, recording, t0,
   cap, secs, keep }. The finished take: { root, url, secs, label }. The take playing back: { root, el }. */
let pcRecLive = null, pcRecTake = null, pcRecPlayer = null;
function pcRecOn(a){ return !!(a && a.card && a.card.recordCompare === true); }
function pcRecTeacher(){ return typeof IS_TEACHER_MODE !== 'undefined' && !!IS_TEACHER_MODE; }
// The card is on screen: in the page, its card open, not inside a hidden screen.
function pcRecSeen(root){
  if(!root || !root.isConnected) return false;
  const card = root.closest('.ca-card');
  if(card && card.open === false) return false;
  return !root.closest('[hidden]');
}
/* The passage Record mine records and Play the model plays: { from, to, endBars, label }. endBars is in window bars
   (bars from the card's first bar), the unit pcLoopEndBars reads. */
function pcRecPass(root, a, L){
  let from, to, label;
  if(L.rounds){
    const rd = L.rounds[parseInt(root.dataset.round, 10)] || L.rounds[0];
    from = rd.from; to = rd.to; label = tf(rd, 'what') || tf(rd, 'label');
  } else {
    const n = L.sections.length, pick = parseInt(root.dataset.recSec, 10);
    from = to = pick >= 0 && pick < n ? pick : n - 1;   // before any tap: the last section (ca-18: Chorus)
    label = tf(L.sections[from].s, 'label');
  }
  const S = L.sections[to];
  return { from, to, endBars: S.fromBar + S.bars * S.reps - L.firstBar, label };
}
// The stop the speed control shows: the slider's value, or 0 / 1 on the Slower / Normal switch.
function pcRecStopNow(root){
  const r = root.querySelector('.pc-speed-range');
  if(r) return parseInt(r.value, 10) || 0;
  return root.dataset.slow === '1' ? 0 : 1;
}
/* One time through the passage from a count-in, as the card's own play (pcStart with a recPass). Returns the pass,
   or null when the card did not start (the mic is live elsewhere, a song file still loading). */
function pcRecPlayPass(root, rec){
  const a = pcActivity(root), L = a && pcLayout(a);
  if(!L) return null;
  const p = pcRecPass(root, a, L);
  const keep = root.dataset.loop === '1' && root.dataset.build === '1' ? { stop: pcRecStopNow(root), laps: 0 } : undefined;
  const pass = { endBars: p.endBars, rec: !!rec, label: p.label };
  pcStart(root, p.from, 0, keep, pass);
  if(pcState && pcState.recPass === pass) return pass;
  if(typeof songFileWaitingFor === 'function' && songFileWaitingFor(root)) songFileCancelWait();   // never a plain play instead
  return null;
}
function pcRecRowHtml(a, L, preview){
  if(!pcRecOn(a) || preview || pcRecTeacher()) return '';
  const b = (cls, key, on) => `<button type="button" class="pc-rec-btn ${cls}" onclick="${on}(this)">${escHtml(t(key))}</button>`;
  return `<div class="pc-rec" role="group" aria-label="${escAttr(t('pc.recGroup'))}">`
    + b('pc-rec-go', 'pc.recMine', 'pcRecRecord')
    + b('pc-rec-mine', 'pc.recPlayMine', 'pcRecPlayMine').replace('<button ', '<button disabled ')
    + b('pc-rec-model', 'pc.recModel', 'pcRecModel')
    + `<span class="pc-rec-live" hidden><span class="mr-rec-dot" aria-hidden="true"></span>${escHtml(t('pc.recLive'))}</span>`
    + `</div><p class="pc-rec-hint" aria-live="polite">${escHtml(pcRecHint(a, L, null))}</p>`;
}
// The one line under the buttons: what Record mine records (or why the mic did not start).
function pcRecHint(a, L, root){
  const p = pcRecPass(root || { dataset: {} }, a, L);
  return t(L.rounds ? 'pc.recHint' : 'pc.recHintPick', { part: p.label });
}
// Every button, the red label and the line, from the state above.
function pcRecPaint(root, say){
  if(!root || !root.isConnected) return;
  const row = root.querySelector('.pc-rec');
  if(!row) return;
  const live = pcRecLive && pcRecLive.root === root ? pcRecLive : null;
  const take = pcRecTake && pcRecTake.root === root ? pcRecTake : null;
  const mine = !!(pcRecPlayer && pcRecPlayer.root === root);
  const model = !!(pcState && pcState.root === root && pcState.recPass && !pcState.recPass.rec);
  const set = (sel, key, stop, off) => {
    const btn = row.querySelector(sel);
    if(!btn) return;
    btn.textContent = t(stop ? 'ca.snipStop' : key);
    btn.classList.toggle('on', !!stop);
    btn.disabled = !!off;
  };
  set('.pc-rec-go', 'pc.recMine', !!live, false);
  set('.pc-rec-mine', 'pc.recPlayMine', mine, !take || !!live);
  set('.pc-rec-model', 'pc.recModel', model, !!live);
  const lab = row.querySelector('.pc-rec-live');
  if(lab) lab.hidden = !(live && live.recording);
  const hint = root.querySelector('.pc-rec-hint');
  if(hint){
    const a = pcActivity(root), L = a && pcLayout(a);
    hint.classList.toggle('pc-rec-say', !!say);
    hint.textContent = say || (L ? pcRecHint(a, L, root) : '');
  }
}
// The words for a mic that did not start: the existing keys (rec.noSupport, tools.micDenied, rec.micFail).
function pcRecMicWords(err){
  const n = err && err.name;
  if(n === 'NotAllowedError' || n === 'SecurityError' || n === 'PermissionDeniedError') return t('tools.micDenied');
  return t('rec.micFail', { err: (err && (err.message || err.name)) || 'permission denied' });
}
function pcRecTracksOff(live){
  if(live && live.stream){ try { live.stream.getTracks().forEach(tr => tr.stop()); } catch(e) {} }
}
/* End the take being made. keep: the take is kept to play back (the end of the passage, the cap, a Stop, a section
   tap, a switch); otherwise it is thrown away (the card closed or redrawn, the page or the tab left). The mic is
   released at once, either way. */
function pcRecFinish(live, keep){
  if(!live) return;
  if(live.cap){ clearTimeout(live.cap); live.cap = 0; }
  if(pcRecLive === live) pcRecLive = null;
  live.keep = !!(keep && live.recording);
  if(live.recording) live.secs = (performance.now() - live.t0) / 1000;
  const r = live.recorder;
  if(r && r.state !== 'inactive'){ try { r.stop(); } catch(e) { live.keep = false; } }
  pcRecTracksOff(live);
  live.recording = false;
  pcRecPaint(live.root);
}
// The recorder's stop event: the chunks become the card's one take, replacing the old one.
function pcRecStored(live){
  if(!live.keep || !live.chunks || !live.chunks.length || !pcRecSeen(live.root)) return;
  pcRecDropTake();
  const blob = new Blob(live.chunks, { type: (live.recorder && live.recorder.mimeType) || 'audio/webm' });
  pcRecTake = { root: live.root, url: URL.createObjectURL(blob), secs: live.secs || 0, label: live.pass ? live.pass.label : '' };
  live.chunks = null;
  pcRecPaint(live.root);
}
function pcRecDropTake(){
  const tk = pcRecTake;
  if(!tk) return;
  pcRecTake = null;
  if(pcRecPlayer && pcRecPlayer.root === tk.root) pcRecStopPlayer();
  try { URL.revokeObjectURL(tk.url); } catch(e) {}
  pcRecPaint(tk.root);
}
function pcRecStopPlayer(){
  const p = pcRecPlayer;
  if(!p) return;
  pcRecPlayer = null;
  try { p.el.pause(); p.el.removeAttribute('src'); p.el.load(); } catch(e) {}
  pcRecPaint(p.root);
}
/* pcStop's hook (app/cards.js): a Record mine or Play the model pass has stopped, by its end or by any way out. */
function pcRecPassStopped(st){
  const p = st.recPass;
  /* At the passage's end (or the cap) the page has followed the song down: the buttons come back on screen, under the
     sticky bar (caCardViewReveal, app/cards-views.js), so Play mine is one press away. */
  if(p.done && typeof caCardViewReveal === 'function' && pcRecSeen(st.root)) caCardViewReveal(st.root);
  if(!p.rec){ pcRecPaint(st.root); return; }
  const live = pcRecLive;
  if(!live || live.pass !== p) return;
  pcRecFinish(live, !document.hidden && pcRecSeen(st.root));
}
/* pcGo's hook (app/cards.js): the count-in is over and the band comes in, so the recorder starts now. */
function pcRecBandIn(st){
  const live = pcRecLive;
  if(!live || live.pass !== st.recPass || !live.recorder || live.recording) return;
  try { live.recorder.start(); } catch(e) { pcRecFinish(live, false); pcStop(); pcRecPaint(st.root, pcRecMicWords(e)); return; }
  live.recording = true;
  live.t0 = performance.now();
  // The hard cap: the band and the recorder stop together, the take is kept.
  live.cap = setTimeout(() => { if(pcState === st){ st.recPass.done = true; pcStop(); } else pcRecFinish(live, true); }, PC_REC_MAX_SECS * 1000);
  pcRecPaint(st.root);
}
/* Record mine. A second press while it asks or records is Stop. */
function pcRecRecord(btn){
  const root = btn && btn.closest('.pc');
  if(!root) return;
  const cur = pcRecLive;
  if(cur && cur.root === root){
    if(pcState && pcState.root === root && pcState.recPass && pcState.recPass === cur.pass) pcStop();   // stops the band and the recorder; the take is kept
    else pcRecFinish(cur, false);   // still asking for the mic: nothing recorded yet
    return;
  }
  if(window.coachMicLive) return;   // same guard as pcStart: the Coach has the mic
  if(!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function' || typeof MediaRecorder !== 'function'){ pcRecPaint(root, t('rec.noSupport')); return; }
  stopCardAudio();                  // the model or a take playing back stops (Play mine)
  if(pcRecLive) pcRecFinish(pcRecLive, false);   // another card's take in the making (one at a time)
  // One mic owner at a time, as Module Review's recorder does (app/review.js startRec).
  if(typeof coachInterrupt === 'function') coachInterrupt();
  if(typeof gamesStopMic === 'function') gamesStopMic();
  if(typeof stopTuner === 'function') stopTuner();
  if(typeof stopAnyRec === 'function') stopAnyRec();
  const live = pcRecLive = { root, asking: true, recording: false, chunks: [] };
  pcRecPaint(root);
  let ask;
  /* A music take: the browser's echo cancelling and noise suppression would take the band and the guitar's tone out
     of the take, and its gain control would pump. */
  try { ask = navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }); }
  catch(e){ ask = Promise.reject(e); }
  ask.then(stream => {
    // Stopped, closed, left or replaced while the question was up: give the mic straight back.
    if(pcRecLive !== live || !pcRecSeen(root) || document.hidden){
      try { stream.getTracks().forEach(tr => tr.stop()); } catch(e) {}
      if(pcRecLive === live) pcRecFinish(live, false);
      return;
    }
    live.stream = stream;
    live.asking = false;
    try { live.recorder = new MediaRecorder(stream); }
    catch(e){ pcRecFinish(live, false); pcRecPaint(root, pcRecMicWords(e)); return; }
    live.recorder.ondataavailable = e => { if(e.data && e.data.size && live.chunks) live.chunks.push(e.data); };
    live.recorder.onstop = () => pcRecStored(live);
    live.pass = pcRecPlayPass(root, true);
    if(!live.pass){ pcRecFinish(live, false); return; }
    pcRecPaint(root);
  }, err => {
    if(pcRecLive !== live) return;
    pcRecFinish(live, false);
    pcRecPaint(root, pcRecMicWords(err));
  });
}
/* Play mine: the take, on this device. A second press stops it. */
function pcRecPlayMine(btn){
  const root = btn && btn.closest('.pc');
  if(!root) return;
  if(pcRecPlayer && pcRecPlayer.root === root){ pcRecStopPlayer(); return; }
  const tk = pcRecTake && pcRecTake.root === root ? pcRecTake : null;
  if(!tk || (pcRecLive && pcRecLive.root === root)) return;
  stopCardAudio();                  // one sound at a time: the band, the model, a tab line
  const el = new Audio();
  el.preload = 'auto';
  el.src = tk.url;
  const p = pcRecPlayer = { root, el };
  const done = () => { if(pcRecPlayer === p){ pcRecPlayer = null; pcRecPaint(root); } };
  el.addEventListener('ended', done, { once: true });
  el.addEventListener('error', done, { once: true });
  el.play().catch(done);
  pcRecPaint(root);
}
/* Play the model: the passage at the speed shown, Guitar on, no recording. A second press stops it. */
function pcRecModel(btn){
  const root = btn && btn.closest('.pc');
  if(!root) return;
  if(pcState && pcState.root === root && pcState.recPass && !pcState.recPass.rec){ pcStop(); return; }
  if(pcRecLive && pcRecLive.root === root) return;
  const g = root.querySelector('.pc-player .pc-guitar');
  if(g && root.dataset.guitar !== '1') pcSetGuitar(g);   // the switch shows On: the model is the record with its guitar
  pcRecPlayPass(root, false);
  pcRecPaint(root);
}
// A section button tapped (pcFromSection): that section is what Record mine records next.
function pcRecPick(root, si){
  if(!root.querySelector('.pc-rec')) return;
  root.dataset.recSec = String(si);
  pcRecPaint(root);
}
/* stopCardAudio's and the hidden tab's hook: a take playing back stops; a take (or a take in the making) whose card
   is no longer on screen is dropped (the In-Class screen closed, the card drawn again). */
function pcRecStopAll(){
  pcRecStopPlayer();
  if(pcRecLive && !pcRecSeen(pcRecLive.root)) pcRecFinish(pcRecLive, false);
  if(pcRecTake && !pcRecSeen(pcRecTake.root)) pcRecDropTake();
}
// pcLoopReset's hook (a card closing, app/cards-loop.js): everything of that card's take goes.
function pcRecReset(root){
  if(pcRecLive && pcRecLive.root === root) pcRecFinish(pcRecLive, false);
  if(pcRecPlayer && pcRecPlayer.root === root) pcRecStopPlayer();
  if(pcRecTake && pcRecTake.root === root) pcRecDropTake();
  if(root.dataset && root.dataset.recSec) delete root.dataset.recSec;
  pcRecPaint(root);
}
// The page leaves: nothing of a take stays (a page kept in the back-forward cache included).
function pcRecDropAll(){
  if(pcRecLive) pcRecFinish(pcRecLive, false);
  pcRecStopPlayer();
  pcRecDropTake();
}
if(typeof window !== 'undefined' && typeof window.addEventListener === 'function') window.addEventListener('pagehide', pcRecDropAll);
