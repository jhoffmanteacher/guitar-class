/* ════════════════════════════════════════════════════════════════════
   STRUM-PATTERN CHECK (2026-11-14, Jonathan: "add a listening coach aspect
   to the existing strumming pattern activity that judges both on chords and
   strumming pattern"). A Listening Coach card under a drawn strum pattern
   whose spec says `listen: true` (buildStrum in app/tab.js; today only
   ca-46's last strum step, the eight bars D5 D5 C5 C5 G5 G5 D5 D5).

   What it judges, as Jonathan decided:
     · the PATTERN by slot, never by direction ("the mic cannot tell down
       from up so it listens to pattern in the right slot"): a strum must be
       heard inside each strum slot's window; a strum heard inside a slot
       where the hand should miss (a '.' in the pattern) COUNTS AGAINST the
       bar ("strum in rest counts against");
     · "medium strict" at first, then "slightly more permissive" (both
       2026-11-14): the window is SC_WIN_FRAC of an eighth either side,
       now 0.45, Strum Radar's own width for this pattern;
     · the CHORD only on the first down strum of each bar, slot 0 ("check
       chord on the first down strum only that verifies changing on time").
       Slot 1 is a slot where the hand misses, so about a beat of sound is
       free after it: the readings run from COACH_ATTACK_SKIP after that
       strum to SC_TAIL_GAP before slot 2 is due.
   What it reuses: Strum Radar's strum detector and grid (srHearStrum,
   coach-strum.js: the 140 ms refractory, the grid that eases toward the
   player) with this check's OWN ratios SC_ONSET_RATIO / SC_HF_RATIO, below,
   in place of the shared CHK_ONSET_RATIO / CHK_HF_RATIO, the Listening Coach's pitch readings for chords
   (coachPitchReadings at the chord-mode clarity 0.55) and its chord-tone
   test (rule 'a' below: the test coachMatchEvent applies), the mic panel
   (coachAcquireMic, "Turn on the microphone"), the count-in (coachCountIn)
   and the consented recording (micRecStart / micRecSave, take id
   <uid>-coach, marked `game: 'strumcheck'`).
   What it saves: NOTHING to progress/{uid}. No games.* field, no
   saveGames(), no step tick: the step's own count dots and Next stay the
   way to finish it. A consented recording (when the teacher has turned
   collection on) is the only thing written, to micTakes.

   The two chord rules (SC_CHORD_RULE picks the one the student sees; a
   recording keeps both verdicts). Power chords that share a note cannot be
   told apart by "is this a tone of the chord": C5 -> G5 share G, G5 -> D5
   share D (the 2026-11-14 audit). So:
     'a'  today's Listening Coach test on the strum's own 340 ms: ok when 20%
          or more of the readings are tones of the chord; wrong when 10% or
          fewer with 3+ readings; else "could not hear it".
     'b'  on a CHANGE (the bar's chord is not the bar before's): over the
          longer free stretch, evidence of a tone the PREVIOUS chord lacks
          (G5 after C5: a D; D5 after G5: an A; C5 after D5: a C or a G):
          ok when those tones are 15% or more of 3+ readings and not
          outnumbered by tones only the old chord has; wrong when tones only
          the old chord has are heard, or 10% or fewer of the readings are
          the chord's; else "could not hear it". A bar that is not a change
          uses 'a' on the same longer stretch.
     'c'  (the one shown, SC_CHORD_RULE) 'b', and where 'b' can only say
          "could not hear it" (every reading a note both chords share, or too
          few readings), 'a'. Measured with the virtual student, quiet room,
          60 BPM, the strum on the 1 heard (tools/mic-sim/strum-check-loop.mjs;
          the commit has the tables): the right chord on a change called right
          a 374 / b 235 / c 375 of 388, wrong 7 / 9 / 12; the OLD chord held
          through the change called right a 8 / b 0 / c 4 of 29. 'b' alone
          says "could not hear it" on 144 of the 388 right changes: the
          detector mostly reads a power chord's root, which on C5 -> G5 and
          G5 -> D5 is a note the old chord has too.
   The numbers behind SC_WIN_FRAC and SC_CHORD_RULE are in the commit and
   in tools/mic-sim/strum-check-loop.mjs (a virtual student; there are no
   real strum-pattern takes yet).
   ════════════════════════════════════════════════════════════════════ */

const SC_RULE = 'strumcheck-1';     // bump when what is judged changes; saved with every take
/* A strum counts within SC_WIN_FRAC of an eighth of its slot (both ways), and so does a strum in a miss. 0.35 ("medium strict")
   until Jonathan played it on a real guitar (2026-11-14): "the arrows lit up red like i got things wrong. i think it needs to be
   slightly more permissive to start". 0.45 is Strum Radar's own window for this pattern; the strum and miss windows still do not
   overlap (0.45 + 0.45 < 1). Measured with the virtual student (quiet, 60 / 85 / 100 BPM): a missing strum on each of the 6 strum
   slots and an extra on each miss are caught exactly as at 0.35 and 0.40 (every miss 2 of 2; the one extra not caught at 85 and at 100
   was not heard at all, the same at every width); one strum 150 ms late at 60 BPM now passes 2 of 2 (0.35: 1 of 2); nothing played
   still hears 0 of 96. The right player's red arrows at 85 and 100 BPM (6 and 17 of 96) are strums the detector did not hear, not
   timing: the same at all three widths. */
const SC_WIN_FRAC = 0.45;
/* This check's own strum ratios (the lead, 2026-11-14, after the virtual
   student lost a right player's re-strums at the shared 1.4 / 1.7: 22% at
   80 BPM, 37% at 100). A re-strum of the same chord an eighth after the last
   lands on strings still ringing, so it raises the level less than a strum
   over silence. srHearStrum reads these from the check's state; every other
   game keeps CHK_ONSET_RATIO / CHK_HF_RATIO. HF = 1.7 x 1.2 / 1.4, the
   scaling Power Chord Switch's ratios use. Numbers: the commit and
   tools/mic-sim/strum-check-loop.mjs. */
const SC_ONSET_RATIO = 1.2;
const SC_HF_RATIO = 1.46;
const SC_CHORD_RULE = 'c';          // 'a', 'b' or 'c' (header); every take saves all three
const SC_CHORD_CLARITY = 0.55;      // the Listening Coach's chord-mode gate (coachLoop)
const SC_TAIL_GAP = 60;             // ms: the chord readings stop this long before slot 2 is due
const SC_MISS_GRACE = 60;           // ms after a slot's window before it is called (a frame, and the onset's dating)
/* The check's tempo (Jonathan, 2026-11-14, after trying it on a real guitar: "it should also default to 85bpm
   to start b/c 60 is too slow", then "Start 85, no limit"): it opens at SC_START_BPM whatever the step's
   slider says, and the -5 / +5 on its panel move it across the step's own slider range (40 to 125). The
   virtual student's numbers at 85+ (more missed re-strums) are in tools/mic-sim/strum-check-loop.mjs.
   Then (Jonathan, same day: "even when i set the metronome to 85 prior it started at 60"; "the metronome
   settings should be grayed out or actually affect the tempo of activity"; the lead's choice): ONE tempo.
   The check opens at the tempo the student last set on the step's slider (85 if they never touched it),
   and while the check waits for Start the step's slider and the check's -5 / +5 move each other
   (scSetTempo, scSliderMoved from onBpmSliderChange). From the count-in to the last bar the step's
   slider, its Play clicks and the Metronome tool's Start/Stop and tempo are disabled (scLock); every way
   out gives them back. */
const SC_START_BPM = 85;
const SC_BPM_MIN = 40, SC_BPM_MAX = 125;
const SC_REC_MAX_SEC = 60;          // a recorded take: the whole round up to this (40 BPM: about 56 s)
const SC_SLOTS = 8;                 // eighths in a bar (STRUM_SLOTS in app/tab.js)

let sc = null, scRaf = null;

function scMicActive(){ return !!(sc && (sc.phase === 'countin' || sc.phase === 'listening')); }
function scBody(){ return document.getElementById('coach-body'); }
const scPc = m => ((Math.round(m) % 12) + 12) % 12;

/* ── The judges: plain functions of data, so checks.mjs 1eh and the tools
   can run them on their own. ── */

/* 'D.DU.UDU' -> per slot: { strum, dir } ('D'/'U' strum; anything else a
   slot where the hand misses, or a stop). */
function scPatternSlots(pattern){
  const p = String(pattern || '');
  const out = [];
  for (let k = 0; k < SC_SLOTS; k++){ const c = p[k]; out.push({ strum: c === 'D' || c === 'U', dir: c === 'U' ? 'U' : 'D' }); }
  return out;
}
/* Share of readings (midis) whose pitch class is in `cls`. */
function scShare(midis, cls){
  if (!midis.length) return 0;
  return midis.filter(m => cls.indexOf(scPc(m)) >= 0).length / midis.length;
}
/* Rule 'a': the Listening Coach's chord-tone test (coachMatchEvent). */
function scChordA(midis, chord){
  const cls = chord.map(scPc);
  if (!midis.length) return 'unheard';
  const sh = scShare(midis, cls);
  if (sh >= 0.20) return 'ok';
  if (sh <= 0.10 && midis.length >= 3) return 'wrong';
  return 'unheard';
}
/* Rule 'b' (header). `prev` null or the same pitch classes: rule 'a'. */
function scChordB(midis, chord, prev){
  const cls = [...new Set(chord.map(scPc))];
  const old = prev ? [...new Set(prev.map(scPc))] : null;
  if (!old || (old.length === cls.length && old.every(c => cls.indexOf(c) >= 0))) return scChordA(midis, chord);
  const n = midis.length;
  if (n < 3) return 'unheard';
  const newOnly = cls.filter(c => old.indexOf(c) < 0), oldOnly = old.filter(c => cls.indexOf(c) < 0);
  const cn = midis.filter(m => newOnly.indexOf(scPc(m)) >= 0).length;
  const co = midis.filter(m => oldOnly.indexOf(scPc(m)) >= 0).length;
  if (cn / n >= 0.15 && cn >= co) return 'ok';
  if (co > 0 || scShare(midis, cls) <= 0.10) return 'wrong';
  return 'unheard';
}
/* One bar's pattern faults from its eight slot states, in slot order:
   [{ kind: 'missed', slot, dir } | { kind: 'extra', slot }]. A strum slot
   that was not heard is missed; a slot where the hand misses that heard a
   strum is an extra. */
function scBarFaults(states, slots){
  const out = [];
  for (let k = 0; k < SC_SLOTS; k++){
    const st = states[k], sl = slots[k];
    if (sl.strum && st === 'miss') out.push({ kind: 'missed', slot: k, dir: sl.dir });
    else if (!sl.strum && st === 'extra') out.push({ kind: 'extra', slot: k });
  }
  return out;
}
/* The count word for a slot: "1", "1 and", "2", ... (the board counts "1 + 2 +"; the step's caption says the + is "and"). */
function scCountWord(k){
  const n = Math.floor(k / 2) + 1;
  return k % 2 ? t('sc.countAnd', { n }) : String(n);
}
/* A bar's sentence: "Bar 3: pattern ✓ · C5 on the 1 ✓". `chord` null leaves the chord out. */
function scBarLine(b, faults, chordName, chordVerdict){
  const pat = faults.length ? faults.map(f => f.kind === 'extra' ? t('sc.extra', { count: scCountWord(f.slot) })
    : t(f.dir === 'U' ? 'sc.missedUp' : 'sc.missedDown', { count: scCountWord(f.slot) })).join(' · ') : t('sc.patternOk');
  const ch = chordName == null || chordVerdict == null ? '' : ' · ' + t(chordVerdict === 'ok' ? 'sc.chordOk' : chordVerdict === 'wrong' ? 'sc.chordWrong' : 'sc.chordUnheard', { chord: chordName });
  return t('sc.barN', { n: b + 1 }) + ' ' + pat + ch;
}
/* The end line. n = bars finished, p = bars with no pattern fault, c = bars whose chord on the 1 was ok. */
function scSummaryLine(n, p, c){
  if (n < 1) return t('sc.noBars');
  if (p === n && c === n) return t(n === 1 ? 'sc.summaryOne' : 'sc.summary', { p, n, c }) + ' ' + t('sc.allGood');
  return t(n === 1 ? 'sc.summaryOne' : 'sc.summary', { p, n, c });
}

/* ── The card ── */

/* Opened by coachOpen (coach-core.js) for a button with data-strumcheck,
   after it has stopped every other mic owner and card. */
function scOpen(btn){
  scClose();
  let spec;
  try { spec = JSON.parse(btn.dataset.strumcheck); } catch(e){ return; }
  if (!spec || !Array.isArray(spec.bars) || !spec.bars.length || !spec.chords) return;
  const group = btn.closest('.bpm-control-group');
  const slider = group ? group.querySelector('.bpm-slider') : null;
  const stored = btn.dataset.scWhere ? readStoredBpm(btn.dataset.scWhere, null) : null;
  const bpm = typeof stored === 'number' && stored >= SC_BPM_MIN && stored <= SC_BPM_MAX ? stored : SC_START_BPM;
  const card = document.createElement('div');
  card.className = 'coach-card sc-card';
  card.id = 'coach-card';
  card.innerHTML =
    `<div class="coach-head">
       <span class="coach-title">&#x1F3A4; ${t('coach.title')}</span>
       <span class="coach-mic" id="coach-mic" hidden><span class="coach-mic-dot"></span>${t('coach.micOn')}</span>
       <button type="button" class="coach-x" onclick="coachClose()" aria-label="${t('coach.closeAria')}">&#x2715;</button>
     </div>
     <div class="coach-body" id="coach-body"></div>
     ${coachFootHtml(true)}`;
  const anchor = btn.closest('.bpm-control-group') || btn.parentElement;
  anchor.insertAdjacentElement('afterend', card);
  /* The page's own board is the one the student reads: the check lights it
     (scCells) instead of drawing a second copy. Eight bars of eight cells,
     in order; anything else and the board is left alone. */
  const tabBody = anchor.closest('.tab-body');
  const cells = tabBody ? Array.from(tabBody.querySelectorAll('.strum-board .strum-cell')) : [];
  sc = {
    phase: 'ready', card, spec, bpm, where: btn.dataset.scWhere || '', group, slider, locked: [],
    pattern: String(spec.pattern || ''), slotsOf: scPatternSlots(spec.pattern),
    bars: spec.bars.map(String), chords: spec.chords,
    cells: cells.length === spec.bars.length * SC_SLOTS ? cells : [],
    timeouts: []
  };
  scSetTempo(bpm);   // the step's slider shows the tempo the check will use
  scRenderReady();
  card.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() });
}

/* One tempo before a round: the check's and the step slider's (its readout and saved value through onBpmSliderChange). */
function scSetTempo(v){
  if (!sc) return;
  sc.bpm = Math.min(SC_BPM_MAX, Math.max(SC_BPM_MIN, Math.round(v)));
  const el = document.getElementById('sc-bpm-readout');
  if (el) el.textContent = sc.bpm + ' BPM';
  const sl = sc.slider;
  if (sl && String(sl.value) !== String(sc.bpm)){ sl.value = String(sc.bpm); if (typeof onBpmSliderChange === 'function') onBpmSliderChange(sl); }
}
/* The step's slider moved (onBpmSliderChange): before a round the open check takes its tempo. */
function scSliderMoved(slider){
  if (!sc || slider !== sc.slider || (sc.phase !== 'ready' && sc.phase !== 'report')) return;
  const v = parseInt(slider.value, 10);
  if (!isNaN(v) && v !== sc.bpm) scSetTempo(v);
}
/* During a round the tempo cannot change under the grid: the step's slider and Play clicks, and the
   Metronome tool's Start/Stop and tempo, are disabled (greyed, not hidden); scLock(false) gives back
   exactly what it took. Every exit calls it (scFinish, scInterrupt, scClose). */
function scLock(on){
  if (!sc) return;
  if (on){
    const els = [sc.slider, sc.group && sc.group.querySelector('.strum-clicks-btn'), document.getElementById('metro-btn'), document.getElementById('bpm-slider')].filter(Boolean);
    sc.locked = sc.locked || [];
    els.forEach(el => { if (el.disabled) return; el.disabled = true; el.setAttribute('aria-disabled', 'true'); sc.locked.push(el); });
  } else {
    (sc.locked || []).forEach(el => { el.disabled = false; el.removeAttribute('aria-disabled'); });
    sc.locked = [];
  }
}

function scRenderReady(msg){
  if (!sc) return;
  const body = scBody();
  if (!body) return;
  sc.phase = 'ready';
  body.innerHTML =
    (msg ? `<div class="coach-note">${escHtml(msg)}</div>` : '') +
    `<div class="coach-target">${escHtml(t('sc.target'))}</div>
     <div class="coach-bpm-row">
       <button type="button" class="tp-btn" onclick="scNudgeBpm(-5)">&#x2212;5</button>
       <span class="coach-bpm-readout" id="sc-bpm-readout">${sc.bpm} BPM</span>
       <button type="button" class="tp-btn" onclick="scNudgeBpm(5)">+5</button>
     </div>
     <div class="coach-tip">&#x1F92B; ${escHtml(t('sc.tipDir'))}</div>
     <div class="coach-tip">&#x1F941; ${escHtml(t('sc.tipCount'))}</div>
     ${coachSetupLineHtml()}
     <button type="button" class="coach-start" onclick="scStart()">&#x25B6; ${t('coach.start')}</button>`;
}

function scNudgeBpm(d){
  if (!sc || (sc.phase !== 'ready' && sc.phase !== 'report')) return;
  scSetTempo(sc.bpm + d);
}

/* The board's live marks, all of them off. */
function scClearBoard(){
  if (!sc) return;
  sc.cells.forEach(el => {
    el.classList.remove('sc-now', 'sc-ok', 'sc-bad');
    el.querySelectorAll('.sc-mark').forEach(m => m.remove());
  });
}

async function scStart(){
  if (!sc || (sc.phase !== 'ready' && sc.phase !== 'report')) return;
  // Collection is on and this device hasn't answered yet: ask first (micRecConsent comes back here).
  if (micRecShouldAsk() && scBody()){ scBody().innerHTML = micRecAskHtml('sc'); return; }
  coachEvictTuner();
  if (typeof gamesStopMic === 'function') gamesStopMic();
  const session = sc;
  if (!coachStream && !(await coachAcquireMic({ el: scBody(), records: true }))){
    if (sc === session) scRenderReady(coachMicFailMsg());
    return;
  }
  await coachEnsureRunning();
  if (sc !== session || !scBody()){ coachReleaseMicIfIdle(); return; }   // card closed or replaced during the prompt
  if (document.hidden){ coachMicOff(); scRenderReady(t('coach.paused.backgrounded')); return; }
  /* No click while the mic listens, as in every other listening game (Strum Radar, Power Chord Switch, the Coach; the Metronome tool
     itself goes silent while the mic is on): the laptop's own click reaches the mic. Measured 2026-11-14 with clicks through the round,
     at the count-in's level: nothing played heard 96 of 96 beat strum slots and a "strum" on "3" in every bar (strum-check-loop.mjs). */
  stopAllDemoAudio();
  scLock(true);
  const micEl = document.getElementById('coach-mic');
  if (micEl){
    micEl.hidden = false;
    const track = coachStream && coachStream.getAudioTracks()[0];
    const label = track && track.label ? track.label : '';
    micEl.innerHTML = '<span class="coach-mic-dot"></span>' +
      (label ? t('coach.micOnDevice', { device: escHtml(label) }) : t('coach.micOn')) +
      '<span class="coach-mic-level" id="coach-mic-level"><i></i><i></i><i></i></span>';
    coachMicLevelLast = -1;
  }
  const s = sc;
  scClearBoard();
  s.beatMs = 60000 / s.bpm;
  s.slotMs = s.beatMs / 2;
  s.win = SC_WIN_FRAC * s.slotMs;
  s.lat = coachMicLatencyMs();
  s.onsetRatio = SC_ONSET_RATIO; s.hfRatio = SC_HF_RATIO;   // srHearStrum: this check's own ratios
  s.smoothRms = 0; s.smoothHf = 0; s.lastOnsetT = -1e9; s.gridOffset = 0; s.lastPitchT = 0;
  s.cur = -1; s.sweep = 0; s.cap = null; s.events = []; s.barsDone = 0; s.lines = [];
  s.slots = [];
  s.bars.forEach((name, b) => s.slotsOf.forEach((sl, k) => s.slots.push({ k: b * SC_SLOTS + k, bar: b, slot: k, strum: sl.strum, dir: sl.dir, state: 'pending', devMs: null, gridMs: null })));
  s.caps = s.bars.map((name, b) => ({ bar: b, chord: name, prev: b ? s.bars[b - 1] : null, at: null, rt: [], rm: [], verdict: null, a: null, b: null, c: null, done: false }));
  s.total = s.slots.length;
  s.phase = 'countin';
  scBody().innerHTML =
    `<div class="coach-count" id="sc-count">&nbsp;</div>
     <div class="coach-tip">&#x1F941; ${escHtml(t('sc.tipCount'))}</div>`;
  /* A consented recording runs from here to the end of the round: the whole
     round, up to SC_REC_MAX_SEC (count-in lead and clicks, the bars, a beat). */
  s.roundSec = COACH_COUNTIN_REC_LEAD + (4 + s.total / 2 + 1) * s.beatMs / 1000;
  s.recCapSec = Math.min(SC_REC_MAX_SEC, Math.ceil(s.roundSec) + 1);
  if (micRecStart('coach', s.recCapSec)){
    if (micEl) micEl.insertAdjacentHTML('beforeend', micRecBadgeHtml());
    else scBody().insertAdjacentHTML('afterbegin', micRecBadgeHtml());
  } else s.recCapSec = null;
  coachCountIn(s, 'sc-count', () => {
    if (sc === s && s.phase === 'countin' && scBody()){ s.phase = 'listening'; scRenderListening(); }
  });
  if (scRaf) cancelAnimationFrame(scRaf);
  scLoop();
}

function scRenderListening(){
  const body = scBody();
  if (!body || !sc) return;
  body.innerHTML =
    `<div class="coach-live"><span class="coach-live-dot"></span>${escHtml(t('sc.listening'))}<span class="sr-bar" id="sc-bar">${t('games.radar.barOfTotal', { bar: 1, total: sc.bars.length })}</span></div>
     <div class="coach-tip sc-last" id="sc-last" aria-live="polite">${sc.lines.length ? escHtml(sc.lines[sc.lines.length - 1]) : '&nbsp;'}</div>
     <button type="button" class="tp-btn coach-stop" onclick="scFinish(false)">&#x25A0; ${t('games.common.stop')}</button>`;
}

/* A strum heard (rel: its played time in ms from beat 1 on the grid before
   it eased it; at: when it reached the mic). */
function scOnset(s, rel, at){
  const k = Math.round(rel / s.slotMs), dev = rel - k * s.slotMs;
  const ev = { t: at - s.lat, k, dev, grid: at - s.lat - s.listenStart - rel, kind: 'outside' };
  s.events.push(ev);
  if (k < 0 || k >= s.total) return;
  if (Math.abs(dev) > s.win){ ev.kind = 'between'; return; }
  const sl = s.slots[k];
  if (sl.state !== 'pending'){ ev.kind = 'again'; return; }
  sl.devMs = dev; sl.gridMs = ev.grid;
  if (!sl.strum){ ev.kind = 'extra'; sl.state = 'extra'; return; }
  ev.kind = 'strum';
  sl.state = 'ok';
  if (s.cells[k]) s.cells[k].classList.add('sc-ok');   // a ✓ may show at once
  if (sl.slot === 0){
    /* The chord on the 1: readings from COACH_ATTACK_SKIP after this strum
       to SC_TAIL_GAP before slot 2 is due (rule 'b'), the first
       COACH_EVENT_TAIL of them for rule 'a'. */
    const cap = s.caps[sl.bar];
    const slot2 = s.listenStart + s.gridOffset + (k + 2) * s.slotMs + s.lat;
    cap.at = at; cap.endA = at + COACH_EVENT_TAIL; cap.end = Math.max(cap.endA, slot2 - SC_TAIL_GAP);
    s.cap = cap;
    s.lastPitchT = at;
  }
}

/* Pitch readings for the open chord capture; closes it when its stretch is over. */
function scReadChord(s, rms, now){
  const cap = s.cap;
  if (!cap) return;
  if (rms > COACH_PITCH_GATE * 0.5){
    coachPitchReadings(s.lastPitchT, cap.at + COACH_ATTACK_SKIP, SC_CHORD_CLARITY).forEach(r => {
      s.lastPitchT = r.t;
      if (r.midi == null || r.t > cap.end) return;
      cap.rt.push(r.t - cap.at); cap.rm.push(r.midi);
    });
  }
  if (now > cap.end) scCloseChord(s, cap);
}
function scChordMidis(s, name){
  const c = s.chords[name];
  return c && Array.isArray(c.midi) ? c.midi.map(Number) : [];
}
function scCloseChord(s, cap){
  if (cap.done) return;
  cap.done = true;
  if (s.cap === cap) s.cap = null;
  const want = scChordMidis(s, cap.chord), prev = cap.prev ? scChordMidis(s, cap.prev) : null;
  const short = cap.rm.filter((m, i) => cap.rt[i] <= COACH_EVENT_TAIL);
  cap.a = scChordA(short, want);
  cap.b = scChordB(cap.rm, want, prev);
  cap.c = cap.b !== 'unheard' ? cap.b : cap.a;
  cap.verdict = cap[SC_CHORD_RULE];
  const cell = s.cells[cap.bar * SC_SLOTS];
  const name = cell && cell.querySelector('.strum-chord');
  if (name) name.insertAdjacentHTML('beforeend', `<span class="sc-mark sc-mark--${cap.verdict}">${cap.verdict === 'ok' ? '&#x2713;' : cap.verdict === 'wrong' ? '&#x2717;' : '?'}</span>`);
}

/* Slots whose window has passed: a strum slot not heard is missed, a slot
   where the hand misses that heard nothing is quiet. A bar is over once its
   last slot is called. */
function scSweep(s, relNow){
  while (s.sweep < s.total && relNow > s.sweep * s.slotMs + s.win + SC_MISS_GRACE){
    const sl = s.slots[s.sweep];
    if (sl.state === 'pending') sl.state = sl.strum ? 'miss' : 'quiet';
    if (sl.slot === 0 && sl.state === 'miss') scCloseChord(s, s.caps[sl.bar]);   // no strum on the 1: nothing to read
    if (sl.slot === SC_SLOTS - 1) scBarOver(s, sl.bar);
    s.sweep++;
  }
}
function scBarOver(s, b){
  const own = s.slots.slice(b * SC_SLOTS, (b + 1) * SC_SLOTS);
  const faults = scBarFaults(own.map(x => x.state), s.slotsOf);
  own.forEach(x => {
    const el = s.cells[x.k];
    if (el && ((x.strum && x.state === 'miss') || (!x.strum && x.state === 'extra'))) el.classList.add('sc-bad');   // a ✗ only once the bar is over
  });
  s.barsDone = b + 1;
  const cap = s.caps[b];
  if (!cap.done) scCloseChord(s, cap);
  s.lines.push(scBarLine(b, faults, cap.chord, cap.verdict));
  const last = document.getElementById('sc-last');
  if (last) last.textContent = s.lines[s.lines.length - 1];
}

function scLoop(){
  if (!sc) return;
  if (!coachAnalyser){ scInterrupt(t('coach.interrupt.micLost')); return; }
  if (!sc.card.isConnected){ scClose(); return; }
  const s = sc, now = performance.now();
  /* Bar 1's first window reaches back into the count-in (Strum Radar's srEarly). */
  const early = s.phase === 'countin' && now >= s.listenStart - s.win;
  if (s.phase === 'countin' && !early){
    const r = coachReadFrame();
    coachSmooth(s, r, coachHfRms);   // warm the level trackers on the room
  } else if (s.phase === 'listening' || early){
    const rms = coachReadFrame(), hf = coachHfRms;
    const rel = srHearStrum(s, rms, hf);
    if (rel != null) scOnset(s, rel, coachOnsetAt);
    coachSmooth(s, rms, hf);
    scReadChord(s, rms, now);
    const relNow = now - s.listenStart - s.gridOffset - s.lat;
    scSweep(s, relNow);
    /* The cursor runs on the beat the student hears (no mic delay), on the eased grid, as Strum Radar's does. */
    const cur = Math.floor((now - s.listenStart - s.gridOffset) / s.slotMs);
    if (cur !== s.cur && cur >= 0 && cur < s.total){
      if (s.cells[s.cur]) s.cells[s.cur].classList.remove('sc-now');
      if (s.cells[cur]) s.cells[cur].classList.add('sc-now');
      s.cur = cur;
      const barEl = document.getElementById('sc-bar');
      if (barEl) barEl.textContent = t('games.radar.barOfTotal', { bar: Math.floor(cur / SC_SLOTS) + 1, total: s.bars.length });
    }
    if (s.sweep >= s.total && !s.cap){ scFinish(true); return; }
  }
  scRaf = requestAnimationFrame(scLoop);
}

function scFinish(complete){
  if (!sc || (sc.phase !== 'listening' && sc.phase !== 'countin')) return;
  const s = sc;
  if (scRaf){ cancelAnimationFrame(scRaf); scRaf = null; }
  s.timeouts.forEach(clearTimeout);
  s.timeouts = [];
  if (s.cap) scCloseChord(s, s.cap);
  s.complete = !!complete;
  const rec = micRecStop();
  coachMicOff();
  scLock(false);
  if (s.cells[s.cur]) s.cells[s.cur].classList.remove('sc-now');
  s.phase = 'report';
  scRenderReport();
  if (rec) micRecSave(rec, scRecMeta());
}

function scRenderReport(){
  const s = sc, body = scBody();
  if (!s || !body) return;
  const n = s.barsDone;
  let p = 0, c = 0;
  const bad = [];
  for (let b = 0; b < n; b++){
    const faults = scBarFaults(s.slots.slice(b * SC_SLOTS, (b + 1) * SC_SLOTS).map(x => x.state), s.slotsOf);
    if (!faults.length) p++;
    if (s.caps[b].verdict === 'ok') c++;
    if (faults.length || s.caps[b].verdict !== 'ok') bad.push(s.lines[b]);
  }
  const heard = s.events.some(e => e.kind !== 'outside');   // a sound inside the bars, anywhere
  const head = n < 1 ? t('sc.noBars') : !heard ? t('sc.nothing') : scSummaryLine(n, p, c);
  body.innerHTML =
    `<div class="coach-report">
       <div class="coach-overall">${escHtml(head)}</div>
       ${heard && n ? bad.map(l => `<div class="coach-tip sc-line">${escHtml(l)}</div>`).join('') : ''}
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="scStart()">&#x21BB; ${t('coach.tryAgain')}</button>
       </div>
     </div>`;
}

/* What a saved take needs for a later replay (micRecSave): the rule and its
   numbers, the tempo and the grid as used, every slot's verdict, every
   sound heard and every chord reading. expected / events times are
   performance.now() values (micRecSaveNow makes them recording ms); the
   times inside `rests` and `chords` are ms from beat 1 (bar 1, slot 0) on
   the grid as the round started, or from the chord's own strum (`rt`). */
function scRecMeta(){
  /* Every value set on purpose to a string, a finite number, true / false or null: the real Firestore SDK refuses a document holding
     undefined anywhere (and an array directly inside an array), and micRecSaveNow's write would then be lost with only a console
     line (Jonathan's first real take, 2026-11-14, did not arrive; the bench found no such value, but nothing here may rely on that). */
  const s = sc, r1 = x => typeof x === 'number' && isFinite(x) ? Math.round(x * 10) / 10 : null;
  const num = x => typeof x === 'number' && isFinite(x) ? x : null, str = x => typeof x === 'string' ? x : null;
  const meta = {
    fields: { game: 'strumcheck', coachMode: 'strum', rule: SC_RULE, chordRule: SC_CHORD_RULE, winFrac: SC_WIN_FRAC, winMs: r1(s.win),
      bpm: num(s.bpm), beatMs: r1(s.beatMs), slotMs: r1(s.slotMs), pattern: String(s.pattern || ''), bars: s.bars.map(String), activity: String(s.where || ''),
      latMs: num(s.lat), gridEase: SR_GRID_EASE, gridEaseWithin: SR_GRID_EASE_WITHIN, gridStepCapMs: null, gridOffsetMs: r1(s.gridOffset),
      onsetRatio: SC_ONSET_RATIO, hfRatio: SC_HF_RATIO, refractMs: COACH_ONSET_REFRACT, chordClarity: SC_CHORD_CLARITY,
      attackSkipMs: COACH_ATTACK_SKIP, tailAMs: COACH_EVENT_TAIL, tailGapMs: SC_TAIL_GAP, missGraceMs: SC_MISS_GRACE,
      recCapSec: num(s.recCapSec), roundSec: r1(s.roundSec), complete: !!s.complete, barsDone: num(s.barsDone) || 0,
      eventTimes: 'played (arrival - latMs)',
      rests: s.slots.filter(x => !x.strum).map(x => ({ bar: x.bar, slot: x.slot, verdict: str(x.state), devMs: r1(x.devMs) })),
      chords: s.caps.map(cp => ({ bar: cp.bar, chord: str(cp.chord), prev: str(cp.prev), verdict: str(cp.verdict), a: str(cp.a), b: str(cp.b), c: str(cp.c),
        atMs: num(cp.at) == null ? null : r1(cp.at - s.lat - s.listenStart), endMs: num(cp.end) == null || num(cp.at) == null ? null : r1(cp.end - cp.at),
        rt: (cp.rt || []).map(x => r1(x)), rm: (cp.rm || []).map(x => num(x) == null ? null : Math.round(x * 100) / 100) })) },
    expected: s.slots.filter(x => x.strum).map((x, i) => ({ i, bar: x.bar, slot: x.slot, dir: str(x.dir), chord: x.slot === 0 ? str(s.bars[x.bar]) : null, midis: x.slot === 0 ? scChordMidis(s, s.bars[x.bar]) : null,
      t: num(s.listenStart + x.k * s.slotMs), verdict: str(x.state), devMs: r1(x.devMs), gridMs: r1(x.gridMs) })),
    events: s.events.map(e => ({ t: num(e.t), k: num(e.k), devMs: r1(e.dev), kind: str(e.kind), gridMs: r1(e.grid) }))
  };
  /* The belt: anything the SDK would still refuse becomes null, and the error log hears of it (field paths only, no name or uid). */
  const bad = scFirestoreFix(meta, '');
  if (bad.length && typeof SITE_ERRORS !== 'undefined') SITE_ERRORS.report('error', { message: '[strumcheck] take fields set to null: ' + bad.slice(0, 5).join(', ') });
  return meta;
}
/* Walks a take's document as the Firestore SDK would: undefined, a function, a number that is not finite or a non-plain object becomes
   null, an array directly inside an array becomes null; returns the paths it changed ([] = the SDK would take it as it is). */
function scFirestoreFix(v, path){
  const out = [];
  const bad = x => x === undefined || typeof x === 'function' || (typeof x === 'number' && !isFinite(x)) ||
    (x && typeof x === 'object' && !Array.isArray(x) && Object.getPrototypeOf(x) !== Object.prototype && Object.getPrototypeOf(x) !== null);
  const walk = (o, p, inArray) => {
    const keys = Array.isArray(o) ? o.map((_, i) => i) : Object.keys(o);
    keys.forEach(k => {
      const x = o[k], q = Array.isArray(o) ? p + '[' + k + ']' : (p ? p + '.' + k : String(k));
      if (bad(x) || (inArray && Array.isArray(x))){ o[k] = null; out.push(q); }
      else if (x && typeof x === 'object') walk(x, q, Array.isArray(x));
    });
  };
  if (v && typeof v === 'object') walk(v, path, Array.isArray(v));
  return out;
}

/* Every way out: another card or game takes over (coachClose), the card
   leaves the page (scLoop), the ✕. Mic off, timers and frame cleared, the
   board's marks taken off, the card removed. Safe to call anytime. */
function scClose(){
  if (!sc) return;
  if (scRaf){ cancelAnimationFrame(scRaf); scRaf = null; }
  sc.timeouts.forEach(clearTimeout);
  scLock(false);
  scClearBoard();
  if (sc.card && sc.card.isConnected) sc.card.remove();
  sc = null;
  coachMicOff();
}
/* The tuner, a recorder, a hidden tab (coachInterrupt): stop listening,
   back to the ready screen with the reason. */
function scInterrupt(msg){
  if (!sc || (sc.phase !== 'listening' && sc.phase !== 'countin')) return;
  sc.timeouts.forEach(clearTimeout);
  sc.timeouts = [];
  if (scRaf){ cancelAnimationFrame(scRaf); scRaf = null; }
  coachMicOff();
  scLock(false);
  scClearBoard();
  scRenderReady(msg || t('coach.interrupt.tunerTook'));
}
