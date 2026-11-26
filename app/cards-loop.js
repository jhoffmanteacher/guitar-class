/* ══ LOOP THIS PART / BUILD UP SPEED — two switches on a practice card (Jonathan, 2026-11-14) ══════
   Only on a card with section buttons (the .pc-secs row, more than one section): pcLoopHtml sits at
   the end of that row, so a card with one section renders exactly what it did before. Both switches
   are OFF every time a card is drawn or opened (pcLoopReset on close), and NOTHING is stored: no
   progress write, no localStorage / sessionStorage key. The state is the card element's data-loop /
   data-build / data-hold and, while it plays, pcState (loopSi, build, laps).
     Loop this part   the section being played (the one tapped, or the one playing when the switch is
                      turned on) repeats, all its reps, until Stop or the switch is turned off. The lap
                      is the card's own lap (THE SPARE in app/cards.js): pcLoopEnd() is the section's
                      last bar line instead of the window's, pcLoopStart() its first, both read off the
                      same window (snippet windows are bars, never seconds). A whole-song card loops too
                      while it is on. The Metronome stops queuing at the section's end (the next lap
                      clicks its own downbeat) and a lead never looks past it (pcLoopClamp), so the
                      cursor, the sheet's dot and "This bar" stay in the section.
     Build up speed   turns Loop on and starts every play at the card's slowest stop; after every
                      PC_BUILD_LAPS (2) whole laps it moves one stop up the card's OWN speed control
                      (the four-stop slider, or the two-way switch) until Normal, then keeps looping at
                      Normal. The step happens on the lap's bar line: the spare waits on the next stop's
                      file and place (pcLoopNext, read by pcSparePark / pcSpareReady), and the control
                      on screen moves in the same instant. With no spare ready the lap seeks and the
                      step goes through pcRetrack, the speed switch's own path. Cards do not listen: a
                      lap is one time through, nothing judges it.
     Stay at this speed  (shown while Build is on) holds the stop; laps keep counting. Released, the
                      lap playing is the last one at that stop if two were already played.
     TAKE-OVER RULE   a speed the student picks by hand (a tap or drag on the control, or the < >
                      keys) turns Build up speed OFF and leaves Loop on: a plain loop at that speed.
                      Turning Loop off turns Build off too. Turning Build on while a song plays starts
                      the section again from a count-in at the slowest stop.
   The line saying where the student is ("Round 1 of 2 at Slowest", "Looping: Chorus"; "Round", not "Lap": a section
   with reps already shows its own "Lap 2 of 3" badge) is the card's own
   status line (pcStatus), the one that reads "Playing from: …" without Loop. Key: L presses Loop
   (KEYS in app/cards.js). Everything this starts is the card's own audio, stopped by pcStop.
   ROUNDS (Jonathan, 2026-11-24, ca-54, the speed ladder): a card with `card.rounds` is the exception to "always from the
   slowest stop, after PC_BUILD_LAPS laps" above (and to the switches being on screen); it is the only card that is. Its Loop and Build switches are not shown; a round button
   (pcFromRound, app/cards.js) turns both on and starts the round, which loops the sections from..to as ONE lap (st.loopTo)
   from the round's own stop (root.dataset.round -> startStop), moving up after `card.buildLaps` laps (root.dataset.buildLaps,
   1 there: pcBuildLaps). The take-over rule works as above; Stay at this speed is not shown (every rounds card has the
   prompt below, and "Practice again" is its Stay). Every other card is unchanged.
   THE LADDER STOPS AND ASKS (Jonathan, 2026-11-24: "it should play once through verse at each speed. between each,
   there should be a notification ... with buttons"): a rounds card does not roll into the next stop by itself. At
   the end of ONE time through (pcFrame -> pcLadderAsk) it stops and shows the prompt under the player (.pc-ask):
   "Got it" plays the next stop up from a count-in, "Practice again" plays the same stop again; at the top stop "Got it"
   just closes the prompt. A one-round card (ca-54) has no round buttons: Play is the ladder from the bottom stop. */
const PC_BUILD_LAPS = 2;
// Laps a stop plays before Build moves up: the card's own (data-build-laps, ROUNDS above), else PC_BUILD_LAPS.
function pcBuildLaps(root){
  const n = root ? parseInt(root.dataset.buildLaps, 10) : 0;
  return n >= 1 ? n : PC_BUILD_LAPS;
}
const PC_SPEED_KEYS = { slowest: 'ca.cardSlowest', slower: 'ca.cardSlower', slow: 'ca.cardSlow', normal: 'ca.cardNormal' };
function pcLoopHtml(L, preview){
  /* Classes of their own (not .pc-speed / .pc-guitar, which the player, the keys and the tools look up as the speed
     and Guitar switches); the look is the Guitar switch's chip and green track (styles.css). */
  const sw = (name, label, title, extra) => `<button type="button" class="pc-loop-sw" role="switch" aria-checked="false" data-loop-sw="${name}"${title}${extra || ''} onclick="pcSetLoopSw(this)">`
    + `<span class="pc-loop-lab">${escHtml(t(label))}</span>`
    + `<span class="pc-loop-track" aria-hidden="true"><span class="pc-loop-knob"></span></span></button>`;
  const tr = L && L.tr;
  const canBuild = !!(tr && (tr.srcSlow || pcOneFile(tr)));   // a slow file, or the one-file stops (ONE-FILE SPEEDS, app/cards.js)
  const hide = L && L.rounds ? ' hidden' : '';   // ROUNDS: the round buttons turn Loop and Build on; only Stay at this speed shows
  return `<span class="pc-loop">`
    + sw('loop', 'pc.loop', pcKeyTitle('pc.keys.loop', preview), hide)
    + (canBuild ? sw('build', 'pc.build', ` title="${escAttr(t('pc.buildTitle'))}"`, hide)
      + sw('hold', 'pc.hold', ` title="${escAttr(t('pc.holdTitle'))}"`, ' hidden') : '')
    + `</span>`;
}
function pcLoopFlag(root, name){ return !!root && root.dataset[name] === '1'; }
// One switch on screen and its data- flag together, so the two can never disagree.
function pcLoopSet(root, name, on){
  root.dataset[name] = on ? '1' : '';
  const b = root.querySelector(`.pc-loop-sw[data-loop-sw="${name}"]`);
  if(b) b.setAttribute('aria-checked', on ? 'true' : 'false');
  if(name === 'build'){ const h = root.querySelector('.pc-loop-sw[data-loop-sw="hold"]'); if(h) h.hidden = !on || !!root.querySelector('.pc-ask'); if(!on) pcLoopSet(root, 'hold', false); }   // a ladder has no Stay at this speed: Practice again is it
}
/* The card's speed stops, slowest first: the slider's ticks, or the two-way switch's Slower / Normal. */
function pcBuildStops(root){
  const ticks = root.querySelectorAll('.pc-speed4 .pc-speed-tick');
  const one = !!root.querySelector('.pc-speed4[data-one-file="1"]');   // ONE-FILE SPEEDS: no stop is a slow file
  if(ticks.length) return Array.from(ticks).map(tk => ({ slow: !one && (tk.dataset.speed === 'slowest' || tk.dataset.speed === 'slower'), rate: tk.dataset.rate || '1', key: PC_SPEED_KEYS[tk.dataset.speed] || 'ca.cardNormal' }));
  return [{ slow: true, rate: '1', key: 'ca.cardSlower' }, { slow: false, rate: '1', key: 'ca.cardNormal' }];
}
/* Put the card's speed control on stop i and set what it plays (data-slow / data-rate), as a press would,
   WITHOUT pcSetSpeedTo / pcSetSpeed: those are the student's hand (the take-over) and retrack the song. */
function pcBuildShow(root, i){
  const stops = pcBuildStops(root), s = stops[Math.max(0, Math.min(stops.length - 1, i))];
  root.dataset.slow = s.slow ? '1' : '';
  const range = root.querySelector('.pc-speed-range');
  if(range){ range.value = String(i); pcSpeedShow(range); root.dataset.rate = s.rate; return; }
  const sw = root.querySelector('.pc-player .pc-speed:not(.pc-guitar)');
  if(!sw) return;
  sw.setAttribute('aria-checked', s.slow ? 'false' : 'true');   // checked = Normal
  const labs = sw.querySelectorAll('.pc-speed-lab');
  if(labs[0]) labs[0].classList.toggle('on', s.slow);
  if(labs[1]) labs[1].classList.toggle('on', !s.slow);
}
/* pcStart: with Build on, the play begins at the slowest stop (or at `keep`'s stop after a private song
   loaded; or at `start`, a round's own first stop, ROUNDS), and the speed control shows it before the file is chosen.
   Returns the build state or null. */
function pcBuildBegin(root, keep, start){
  if(!pcLoopFlag(root, 'loop') || !pcLoopFlag(root, 'build')) return null;
  const b = { stop: keep ? keep.stop : (start > 0 ? start | 0 : 0), laps: keep ? keep.laps : 0 };
  pcBuildShow(root, b.stop);
  return b;
}
// The section the lap returns to, and where it ends (bars into the window; the card's end without Loop).
function pcLoopSec(st){ return st.loopSi >= 0 ? st.loopSi : st.loopFrom; }
function pcLoopEndBars(st){
  if(!(st.loopSi >= 0)) return st.L.totalBars;
  const S = st.L.sections[st.loopTo > st.loopSi ? st.loopTo : st.loopSi];   // a round's lap runs to its last section (ROUNDS)
  return S.fromBar + S.bars * S.reps - st.L.firstBar;
}
function pcLoopEnd(st){ return st.loopSi >= 0 ? snipTimeAtBars(st.win, pcLoopEndBars(st)) : st.win.end; }
/* A position the cursor reads (with its lead) past the end of a looped section that is not the card's
   last stays on the section's last place, as the card's own lap does at the end of the window. Held
   PC_LOOP_CLAMP bars (~0.2 ms) short of the bar line: closer, a lyric sheet's "This bar" rounds into
   the bar after it. */
const PC_LOOP_CLAMP = 1e-4;
function pcLoopClamp(st, bars){
  if(!(st.loopSi >= 0)) return bars;
  const e = pcLoopEndBars(st);
  return e < st.L.totalBars && bars > e - PC_LOOP_CLAMP ? e - PC_LOOP_CLAMP : bars;
}
/* The lap coming up is one stop faster: { stop, slow, rate, src, win }; else null. */
function pcLoopNext(st){
  const b = st.build;
  if(!b || !(st.loopSi >= 0) || pcLoopFlag(st.root, 'hold') || b.laps + 1 < pcBuildLaps(st.root) || pcLadderPause(st)) return null;   // a ladder moves up only when the student says so (pcLadderGo)
  const stops = pcBuildStops(st.root), nx = stops[b.stop + 1];
  if(!nx) return null;
  return { stop: b.stop + 1, slow: nx.slow, rate: nx.rate, src: snippetSrc(st.L.tr, nx.slow, st.root.dataset.guitar === '1'), win: pcWindow(st.L, nx.slow, st.root.dataset.guitar === '1') };
}
/* A lap is over (pcFrame: the spare took over, or the seek). Counts it, moves Build to `nx`'s stop, re-parks
   the twin on the new stop's other mix, and says where the student is. */
function pcLoopLapDone(st, nx){
  if(!(st.loopSi >= 0)) return;
  st.laps++;
  const b = st.build;
  if(b){ if(nx){ b.stop = nx.stop; b.laps = 0; } else b.laps++; }
  if(nx && st.twin) pcParkTwin(st);
  if(typeof fadeLapDone === 'function') fadeLapDone(st);   // MEMORY FADE (app/fade.js): the next time through hides more
  pcLoopStatus(st);
}
/* The next stop is a private song not loaded yet (SONG FILES): stop, load it, then play the section from a
   count-in at that stop. true = handled. */
function pcBuildWaitStep(st, nx){
  if(!songFileNeedsLoad(nx.src)) return false;
  const root = st.root, si = pcLoopSec(st), keep = { stop: nx.stop, laps: 0 };
  pcStop();
  pcBuildShow(root, nx.stop);
  songFileWaitThen(root, nx.src, () => pcStart(root, si, 0, keep), pcWaitUi(root));
  return true;
}
// The tempo of speed stop i in BPM ("90"): the file it plays times its rate.
function pcStopBpm(root, L, i){
  const stops = pcBuildStops(root), s = stops[Math.max(0, Math.min(stops.length - 1, i))];
  return Math.floor((s.slow ? L.tr.trackBpmSlow : L.tr.trackBpm) * parseFloat(s.rate) + 1e-6);
}
/* THE LADDER STOPS AND ASKS (above). pcLadderPause: this play is a ladder's and Build is still climbing (a speed
   picked by hand took Build off: then it is a plain loop and never asks). */
function pcLadderPause(st){ return !!(st && st.L.rounds && st.build && st.loopSi >= 0 && st.root.querySelector('.pc-ask')); }
function pcLadderAskHtml(L){
  if(!(L && L.rounds)) return '';
  return `<div class="pc-ask" role="status" aria-live="polite" hidden><p class="pc-ask-msg"></p>`
    + `<div class="pc-ask-btns"><button type="button" class="pc-ask-btn pc-ask-got" onclick="pcLadderGo(this,false)">${escHtml(t('pc.askGot'))}</button>`
    + `<button type="button" class="pc-ask-btn pc-ask-again" onclick="pcLadderGo(this,true)">${escHtml(t('pc.askAgain'))}</button></div></div>`;
}
function pcLadderAskHide(root){
  const el = root && root.querySelector('.pc-ask');
  if(el){ el.hidden = true; el.dataset.stop = ''; }
}
// The stop is over: stop the song and ask. The prompt says the tempo just played and what each button does.
function pcLadderAsk(st){
  const root = st.root, L = st.L, stop = st.build.stop, last = stop >= pcBuildStops(root).length - 1, bpm = pcStopBpm(root, L, stop);
  pcStop();
  const el = root.querySelector('.pc-ask');
  if(!el) return;
  el.dataset.stop = String(stop);
  el.dataset.last = last ? '1' : '';
  el.querySelector('.pc-ask-msg').textContent = t(last ? 'pc.askLast' : 'pc.askNext', {bpm});
  el.hidden = false;
  const first = el.querySelector('.pc-ask-got');
  if(first) try { first.focus(); } catch(e) {}
}
// Got it (again = false): the next stop up, or, at the top, done. Practice again (again = true): this stop once more.
function pcLadderGo(btn, again){
  const root = btn.closest('.pc'), el = root && root.querySelector('.pc-ask');
  if(!el || el.hidden) return;
  const stop = parseInt(el.dataset.stop, 10) || 0;
  if(!again && el.dataset.last === '1'){ pcLadderAskHide(root); const p = root.querySelector('.pc-play'); if(p) try { p.focus(); } catch(e) {} return; }
  pcRoundStart(root, parseInt(root.dataset.round, 10) || 0, null, { stop: again ? stop : stop + 1, laps: 0 });
}
function pcLoopStatus(st){
  if(!(st.loopSi >= 0) || st.counting || pcState !== st) return;
  const b = st.build;
  let txt;
  /* ROUNDS: the round and the speed in BPM ("Verse at 90 BPM"); "Round" already means a lap on the other cards. */
  const rd0 = st.L.rounds ? st.L.rounds[parseInt(st.root.dataset.round, 10)] : null, rd = rd0 && st.loopSi >= rd0.from && st.loopSi <= rd0.to ? rd0 : null;
  if(b && rd){
    txt = t('pc.roundAt', {what: tf(rd, 'what'), bpm: pcStopBpm(st.root, st.L, b.stop)});
  } else if(b){
    const stops = pcBuildStops(st.root), speed = t(stops[Math.min(b.stop, stops.length - 1)].key), n = b.laps + 1, total = pcBuildLaps(st.root);
    txt = pcLoopFlag(st.root, 'hold') || b.stop >= stops.length - 1 || total < 2 ? t('pc.lapAt', {n, speed}) : t('pc.lapOf', {n, total, speed});
  } else txt = t('pc.looping', {section: rd ? tf(rd, 'what') : st.L.sections.slice(st.loopSi, Math.max(st.loopTo, st.loopSi) + 1).map(S => tf(S.s, 'label')).join(' + ')});   // a memory fade loops more than one section
  pcStatus(st.root, escHtml(txt));
}
// The section playing now, read off the file (not the cursor's lead); during the count-in, the one counted in.
function pcLoopNowSec(st){
  if(st.counting) return st.loopFrom;
  const loc = pcLocate(st.L, snipBarsAt(st.win, st.audio.currentTime));
  return loc ? loc.si : st.loopFrom;
}
/* The three switches' one handler. */
function pcSetLoopSw(btn){
  const root = btn.closest('.pc');
  if(!root) return;
  const name = btn.dataset.loopSw, on = !pcLoopFlag(root, name);
  const st = pcState && pcState.root === root ? pcState : null;
  if(name === 'loop'){
    pcLoopSet(root, 'loop', on);
    if(!on) pcLoopSet(root, 'build', false);
    if(!st) return;
    pcCancelHandoff(st);
    if(on){ st.loopSi = pcLoopNowSec(st); st.laps = 0; }
    else {
      st.loopSi = -1; st.build = null;
      if(!st.counting) pcStatus(root, escHtml(t('ca.cardPlayingFrom', {section: tf(st.L.sections[pcLoopNowSec(st)].s, 'label')})));
    }
    pcSparePark(st);                   // the lap's start moved (a whole-song card gets its spare now)
    pcLoopStatus(st);
  } else if(name === 'build'){
    pcLoopSet(root, 'build', on);
    if(on){
      pcLoopSet(root, 'loop', true);
      if(st) pcStart(root, pcLoopNowSec(st));   // again from a count-in, at the slowest stop
      else pcBuildShow(root, 0);       // stopped: the control shows the speed Play will start at
      return;
    }
    if(!st) return;
    pcCancelHandoff(st);
    st.build = null;
    pcSparePark(st);
    pcLoopStatus(st);
  } else if(name === 'hold'){
    pcLoopSet(root, 'hold', on);
    if(!st || !st.build) return;
    if(!on) st.build.laps = Math.min(st.build.laps, pcBuildLaps(root) - 1);   // the lap playing is the last at this stop
    pcCancelHandoff(st);
    pcSparePark(st);                   // the next lap's stop changed
    pcLoopStatus(st);
  }
}
/* A speed picked by hand while Build is on: Build off, Loop stays on (the take-over rule). */
function pcBuildTakeover(root){
  if(!pcLoopFlag(root, 'build')) return;
  pcLoopSet(root, 'build', false);
  const st = pcState && pcState.root === root ? pcState : null;
  if(!st) return;
  pcCancelHandoff(st);
  st.build = null;
  pcLoopStatus(st);
}
/* Both switches off when a card closes (caOnToggle), so every opening starts with them off. */
function pcLoopReset(scope){
  if(!scope) return;
  scope.querySelectorAll('.pc').forEach(root => {
    if(root.dataset.loop || root.dataset.build){ pcLoopSet(root, 'loop', false); pcLoopSet(root, 'build', false); }
    pcLadderAskHide(root);
    if(typeof fadeReset === 'function') fadeReset(root);   // MEMORY FADE (app/fade.js): back to time 1
    if(root.dataset.round){ root.dataset.round = ''; root.querySelectorAll('.pc-round.cur').forEach(b => b.classList.remove('cur')); }   // ROUNDS: no round is picked when a card opens
  });
}
