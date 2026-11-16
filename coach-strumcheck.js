/* ════════════════════════════════════════════════════════════════════
   STRUM-PATTERN CHECK (2026-11-14, Jonathan: "add a listening coach aspect
   to the existing strumming pattern activity that judges both on chords and
   strumming pattern"). One button and a one-line strip under a drawn strum
   pattern whose spec says `listen: true` (buildStrum in app/tab.js; ca-52's
   one step, the eight bars D5 D5 C5 C5 G5 G5 D5 D5); no box since
   2026-11-14 (THE SCREEN, below).

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
   What it reuses: Strum Radar's onset test (srHearStrum, coach-strum.js:
   a jump over the smoothed level, the 140 ms refractory), run in its own
   scHearStrum with this check's OWN ratios SC_ONSET_RATIO / SC_HF_RATIO
   and its own grid (THE GRID, below: the pattern's shape, not Strum
   Radar's easing), the Listening Coach's pitch readings for chords
   (coachPitchReadings at the chord-mode clarity 0.55) and its chord-tone
   test (rule 'a' below: the test coachMatchEvent applies), the mic panel
   (coachAcquireMic, "Turn on the microphone"), the count-in (coachCountIn)
   and the consented recording (micRecStart / micRecSave, take id
   <uid>-coach, marked `game: 'strumcheck'`).
   What it saves: no games.* field, no saveGames(), no score. The one thing
   it writes to progress is a step tick, and only on a step with
   `listenRounds` (ca-52, since 2026-11-14): a full round counts toward that
   step's tick through onCaStepChange, the writer every activity step tick
   uses (scCountRound). A consented recording (when the teacher has turned
   collection on) goes to micTakes, once the round has finished at least
   one bar (scFinish).

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

const SC_RULE = 'strumcheck-2';     // bump when what is judged changes; saved with every take (2: the pattern-shape grid, the octave vote, 2026-11-14)
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
   over silence. scHearStrum reads these from the check's state; every other
   game keeps CHK_ONSET_RATIO / CHK_HF_RATIO. 1.2 / 1.46 until 2026-11-14;
   then 1.15 / 1.3 with the pattern-shape grid (the lead's rule, DETAILS section 23: the most right-player bars in the class room
   among settings where nothing played and beats only pass 0 bars once the too-noisy gate has done its work; 1.1 / 1.2 let talking
   pass 3 of 40 bars). */
const SC_ONSET_RATIO = 1.15;
const SC_HF_RATIO = 1.3;
/* THE GRID: the pattern's own shape (the lead, 2026-11-14, on Jonathan's three real takes; Claude outputs/strum-coach/DETAILS.md
   sections 20 and 22). Until then the check used Strum Radar's grid, which eases 0.2 of each onset's deviation toward the player: a
   player who drifted more than half an eighth late was matched to the NEXT slot and the easing then slid the grid a whole eighth (take
   3: every bar heard one slot late; take 2: from bar 8). Now, at each strum heard, the check tries every grid offset SC_ANCHOR_STEP ms
   apart within SC_ANCHOR_RANGE eighths of the grid it has, scores the onsets of the last SC_ANCHOR_SPAN eighths against D.DU.UDU
   (+1 an onset inside a strum place's window, SC_ANCHOR_REST inside a rest's), and takes the best (ties: the nearest the grid it
   has). D.DU.UDU shifted by an eighth fits 4 of its 6 strum places, so a whole-slot slide scores worse than the right grid and the
   grid stays on the player's own pattern. The same with the Metronome's click in the student's ears: a search held to half an
   eighth around the click grid was measured (bench, 1.15 / 1.3): the same for a steady player, a late one and an early one, and it
   failed students who drift with the click (drag 4%: 5-6 of 32 bars against 11-17), so it was not kept. */
const SC_ANCHOR_RANGE = 1;
const SC_ANCHOR_STEP = 5;
const SC_ANCHOR_SPAN = 8;
const SC_ANCHOR_REST = -1.5;
/* FOLLOW THE PLAYER'S OWN BEAT (review R1-1, the lead's decision, 2026-11-14): a steady player who comes in more than an eighth late
   or early after the clicks, or after a silent bar, was fitted to the nearest strum place at his first onset and then never searched
   past one eighth, so he stayed on the wrong slots for the rest of the round. When the onsets of the last bar fit badly (at least
   SC_ANCHOR_WIDE_MIN of them, a full bar's six strums: D.DU.UDU shifted by 1 to 7 eighths never puts all six on strum places, so
   six strums fit one grid only; fewer can fit two) and score under their count less SC_ANCHOR_WIDE_SLACK, the search runs again
   over SC_ANCHOR_WIDE_RANGE eighths either way. The chord on each 1 follows the same grid (scOnset reads the slot from it). And the search starts from the
   grid it has and steps outward (review R1-6: the old loop never tried the current offset at tempos whose eighth is not a multiple
   of 5 ms, so the grid crept about 2 ms a strum). */
const SC_ANCHOR_WIDE_RANGE = 4;
const SC_ANCHOR_WIDE_MIN = 6;
const SC_ANCHOR_WIDE_SLACK = 1.5;
/* ...and the wide result is kept only when it fits the bar almost perfectly: a score of at least the onsets' count less
   SC_ANCHOR_WIDE_ACCEPT (every onset but one on a strum place). A late player's bar fits that way; room noise and talking rarely do
   (measured: without this line nothing played passed 4 / 9 bars of 64 in the talk / chatter rooms, 2 / 7 before the wide search).
   Two more rules keep the bars right: the wide search breaks a tie by how near the strums sit to the middles of their windows (a grid
   almost half an eighth off fits every strum at a window's edge and scores the same as the true one), and no grid is ever more than
   SC_ANCHOR_WIDE_RANGE eighths from the click grid (half a bar: the pattern repeats every bar, so a player one beat late also fits a
   grid one bar early). The limit keeps a player up to half a bar late, and less than half a bar early, on the right bars; MORE
   than half a bar late is judged one bar on (review round 2, 10 seeds at 60 / 85 / 120 BPM: starting 4.5 to 7 eighths late, the
   player's bar 1 was judged as bar 2 in 10 of 10 seeds, so every chord on a 1 was compared with the next bar's chord; exactly 2
   beats early landed a bar off the other way in 4-5 of 10). The pattern repeats every bar, so no grid rule can tell those apart. */
const SC_ANCHOR_WIDE_ACCEPT = 1;
/* ...and only when its strums sit on average within SC_ANCHOR_WIDE_TIGHT of an eighth of their windows' middles: a player is regular,
   talking that happens to land in six strum windows is not (measured: with the score rule alone talking passed 3 bars of 64, 1 without
   the wide search). */
const SC_ANCHOR_WIDE_TIGHT = 0.15;
/* THE CHORD, octave first (2026-11-14, take 1 bar 4: G5 played where C5 is due passed, because G is in both chords and pitch classes
   drop the octave). Each reading within SC_OCT_TOL semitones of one of a chord's own notes, or of that note an octave under it (the
   detector's sub-octave), votes for every chord of the step that has it; the chord with the most votes alone wins (3+ readings). It
   decides when it can; when it cannot (a tie, too few readings) rule 'c' decides, as before. */
const SC_OCT_TOL = 0.6;
/* The vote is lopsided on purpose (the lead, 2026-11-14: a right chord called wrong is worse here than a wrong chord passed): 'ok'
   when the bar's chord leads every other chord by SC_OCT_OK_MARGIN vote or more; 'wrong' only when another chord leads the bar's
   chord by SC_OCT_WRONG_MARGIN votes or more; anything else (a tie, another chord ahead by one) is rule c's. G5 shares D with D5 and
   G with C5, so most root or fifth readings vote for two chords and one stray reading can tip a tie (review R1-5: take 2 bar 1). */
const SC_OCT_OK_MARGIN = 1;
const SC_OCT_WRONG_MARGIN = 2;
/* TOO NOISY FOR FEEDBACK (Jonathan, 2026-11-14: "a too loud to grade warning might be good instead of saying it's wrong"). During the
   count-in the student is not playing yet, so what the mic hears there is the room. The median level of the frames the check reads,
   from SC_GATE_SKIP ms after the first click (the smoothed level starts at 0) until bar 1's first window opens, leaving out each
   count-in click (SC_GATE_CLICK_PRE ms before its time to SC_GATE_CLICK_POST after: the speaker's click reaches the mic), is the
   room's level. At SC_GATE_LEVEL or more the round is too noisy for feedback: it still runs to bar 8 and still counts toward the step's
   rounds, but no arrow turns green or red, no chord mark is drawn, and the row says so. Measured on the bench (tools/mic-sim/
   strum-check-replay.mjs --gate; DETAILS section 23) and on Jonathan's three takes (0 of 3). */
const SC_GATE_LEVEL = 0.012;
/* The room, not the guitar (review R1-3, the lead's decision): a student who strums along with the count-in fills part of it with
   guitar, and the median then reads his guitar. So the room must ALSO be loud in the count-in's quiet part: its SC_GATE_PCT
   percentile at SC_GATE_FLOOR or more. Measured (DETAILS section 24): the percentile alone dropped the rooms where people talk (the
   gaps between syllables are quiet: chatter 6 of 12 rounds gated at 0.012, against 12); the two together keep room7, room4 and
   chatter at 12 of 12, quiet rooms and Jonathan's takes at 0, and a count-in strummed on counts 3 and 4 is no longer gated. */
const SC_GATE_PCT = 0.2;
const SC_GATE_FLOOR = 0.003;
const SC_GATE_SKIP = 300, SC_GATE_CLICK_PRE = 20, SC_GATE_CLICK_POST = 150;
const SC_CHORD_RULE = 'oc';         // 'a', 'b', 'c' (header) or 'oc' (the octave vote, then c); every take saves a, b, c and o
const SC_CHORD_CLARITY = 0.55;      // the Listening Coach's chord-mode gate (coachLoop)
const SC_TAIL_GAP = 60;             // ms: the chord readings stop this long before slot 2 is due
const SC_MISS_GRACE = 60;           // ms after a slot's window before it is called (a frame, and the onset's dating)
/* The check's tempo (Jonathan, 2026-11-14, after trying it on a real guitar: "it should also default to 85bpm
   to start b/c 60 is too slow", then "Start 85, no limit"): ca-52's step opens its slider at 85 (its strum
   spec's bpm), across the step's own slider range (40 to 125). The virtual student's numbers at 85+ (more
   missed re-strums) are in tools/mic-sim/strum-check-loop.mjs.
   Then (Jonathan, same day: "even when i set the metronome to 85 prior it started at 60"; "the metronome
   settings should be grayed out or actually affect the tempo of activity"; the lead's choice): ONE tempo.
   The check runs at the tempo on the step's slider, the only tempo control since 2026-11-14 ("the tempo
   scroll at the top is sufficient to set the tempo"); between rounds a slider move reaches the open check
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
/* No per-bar sentences (Jonathan, 2026-11-14, of the written list of faults after a round: "i don't think they should get that.
   they won't read it"): the board's coloured arrows and marks are the feedback, and one summary line. */
/* The end line. n = bars finished, p = bars with no pattern fault, c = bars whose chord on the 1 was ok. */
function scSummaryLine(n, p, c){
  if (n < 1) return t('sc.noBars');
  if (p === n && c === n) return t(n === 1 ? 'sc.summaryOne' : 'sc.summary', { p, n, c }) + ' ' + t('sc.allGood');
  return t(n === 1 ? 'sc.summaryOne' : 'sc.summary', { p, n, c });
}

/* ── The card ── */

/* THE SCREEN (Jonathan, 2026-11-14, after playing it: "the listening coach box is also huge. there should just be a button that says
   ... and it should be underneath. the tempo scroll at the top is sufficient to set the tempo. get rid of the coach box that opens").
   No box: the step's tempo slider above the board is the only tempo control, the board is where the round runs, and ONE row under the
   board (.sc-row, app/tab.js buildStrum) holds the button ("Click here and play it to get feedback"; Stop while a round runs) and a
   one-line strip beside it (#coach-card.sc-strip: the mic chip and recording label, the count-in, the bar, the beat dot, the mic
   question or panel, the summary line, the headphones switch, local recording mode's two links). Nothing is drawn over or beside the
   board. The ids coach-card / coach-body / coach-mic are kept: the mic panel, the recording label and the level meter write there. */

/* The row's button, every click (coachOpen, coach-core.js, before it evicts anything): the check already open on THIS button ->
   Stop during a round, another round after one; returns false (coachOpen goes on to scOpen) for a check not yet open here. */
function scButton(btn){
  if (!sc || sc.btn !== btn || !sc.card || !sc.card.isConnected) return false;
  if (sc.phase === 'countin' || sc.phase === 'listening') scFinish(false);
  else if (sc.phase === 'ready' || sc.phase === 'report') scStart();
  return true;
}
/* The button's word: Stop during a round, its own word otherwise. */
function scButtonLabel(s, running){
  const b = s && s.btn, lab = b && b.querySelector('.sc-play-label');
  if (!lab) return;
  if (running){ lab.removeAttribute('data-i18n'); lab.textContent = t('games.common.stop'); b.classList.add('sc-play--stop'); }
  else { lab.setAttribute('data-i18n', 'sc.play'); lab.textContent = t('sc.play'); b.classList.remove('sc-play--stop'); }
}

/* Opened by coachOpen (coach-core.js) for a button with data-strumcheck,
   after it has stopped every other mic owner and card. Starts a round at once. */
function scOpen(btn){
  scClose();
  let spec;
  try { spec = JSON.parse(btn.dataset.strumcheck); } catch(e){ return; }
  if (!spec || !Array.isArray(spec.bars) || !spec.bars.length || !spec.chords) return;
  /* The page's own board is the one the student reads: the check lights it
     (scCells) instead of drawing a second copy. Eight bars of eight cells,
     in order; anything else and the board is left alone. */
  const tabBody = btn.closest('.tab-body');
  const group = tabBody ? tabBody.querySelector('.bpm-control-group') : null;
  const slider = group ? group.querySelector('.bpm-slider') : null;
  const fromSlider = slider ? parseInt(slider.value, 10) : NaN;
  const stored = btn.dataset.scWhere ? readStoredBpm(btn.dataset.scWhere, null) : null;
  const bpm = fromSlider >= SC_BPM_MIN && fromSlider <= SC_BPM_MAX ? fromSlider
    : typeof stored === 'number' && stored >= SC_BPM_MIN && stored <= SC_BPM_MAX ? stored : SC_START_BPM;
  const card = document.createElement('span');
  card.className = 'sc-strip';
  card.id = 'coach-card';
  card.innerHTML = `<span class="sc-body" id="coach-body" aria-live="polite"></span><span class="coach-mic sc-mic" id="coach-mic" hidden></span>`;
  btn.insertAdjacentElement('afterend', card);
  const cells = tabBody ? Array.from(tabBody.querySelectorAll('.strum-board .strum-cell')) : [];
  sc = {
    phase: 'ready', card, btn, spec, bpm, where: btn.dataset.scWhere || '', group, slider, locked: [],
    board: tabBody ? tabBody.querySelector('.strum-board') : null,
    pattern: String(spec.pattern || ''), slotsOf: scPatternSlots(spec.pattern),
    bars: spec.bars.map(String), chords: spec.chords,
    cells: cells.length === spec.bars.length * SC_SLOTS ? cells : [],
    timeouts: []
  };
  scSetTempo(bpm);   // the step's slider shows the tempo the check will use
  scRenderReady();
  scStart();
}

/* One tempo before a round: the check's and the step slider's (its readout and saved value through onBpmSliderChange). */
function scSetTempo(v){
  if (!sc) return;
  sc.bpm = Math.min(SC_BPM_MAX, Math.max(SC_BPM_MIN, Math.round(v)));
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
    /* the Metronome tool's own -5 / -1 / +1 / +5 too (review R1-1): the whole tool greys, as the CHANGELOG says */
    const els = [sc.slider, sc.group && sc.group.querySelector('.strum-clicks-btn'), document.getElementById('metro-btn'), document.getElementById('bpm-slider'),
      ...document.querySelectorAll('#metro-popup .tp-ctrl .tp-btn')].filter(Boolean);
    sc.locked = sc.locked || [];
    els.forEach(el => { if (el.disabled) return; el.disabled = true; el.setAttribute('aria-disabled', 'true'); sc.locked.push(el); });
  } else {
    (sc.locked || []).forEach(el => { el.disabled = false; el.removeAttribute('aria-disabled'); });
    sc.locked = [];
  }
}

/* Before a round, or after one was cut short (a refused mic, a hidden tab, the tuner): the reason if any, and the headphones
   switch while the Metronome tool runs. The row's button starts the next round. */
function scRenderReady(msg){
  if (!sc) return;
  const body = scBody();
  if (!body) return;
  sc.phase = 'ready';
  scButtonLabel(sc, false);
  body.innerHTML = (msg ? `<span class="coach-note sc-note">${escHtml(msg)}</span>` : '') + scHeadphonesHtml();
}
function scHeadphonesHtml(){
  return scMetroWanted() ? `<label class="sc-hp"><input type="checkbox" id="sc-hp"${scHeadphonesGet() ? ' checked' : ''} onchange="scHeadphonesSet(this.checked)"> ${escHtml(t('sc.headphones'))}</label>` : '';
}
/* "I'm wearing headphones" (Jonathan, 2026-11-14: "can a headphone option be given if not it just flashes and can the flashing dot
   be made larger?"). Shown next to the button while the Metronome is wanted (scMetroWanted). Kept for this page only, in memory,
   unticked on every load (the lead, 2026-11-14: never stored, so the next student on a shared Chromebook does not start with it). */
let scHeadphonesOn = false;
function scHeadphonesGet(){ return scHeadphonesOn; }
function scHeadphonesSet(on){ scHeadphonesOn = !!on; }
/* The Metronome for the open check (review R1-2): the tool is stopped at every Start (stopAllDemoAudio), so its live state cannot say
   what the student chose for round 2. Once it was on at a Start, the open check keeps the beat aids (click with headphones, dot,
   frame) for every later round, and the headphones switch stays shown between rounds. A new check (scOpen) starts from the tool. */
function scMetroWanted(){ return !!((sc && sc.metroSticky) || (typeof metroRunning !== 'undefined' && metroRunning)); }
/* The Metronome during a round, decided at Start: on + headphones -> the click on every beat (scScheduleClicks); on, no
   headphones -> no sound after the count-in, the big dot flashes each beat; off -> neither (the board's moving cell, as before). */
function scClicksWanted(metro, hp){ return !!(metro && hp); }
/* The count-in's own click (coachBeepAt, the same voice and level) on every beat of the round, on the audio clock the count-in set
   listenStart from, at the check's tempo. Each click is queued just before it is due (COACH_COUNTIN_AHEAD), so every exit, which
   clears s.timeouts, silences the rest. Only with headphones: through a laptop speaker the mic hears every click as a strum
   (measured 2026-11-14: 96 of 96 beat slots with nothing played). */
/* THE BEAT, one clock for everything the student sees or hears of it (Jonathan, 2026-11-14, "what if the frame around it flashed at
   tempo?"; the lead: one scheduler for dot, frame and click): beat j of the round is at scBeatAt(s, j), the click grid the count-in
   set (listenStart + j beats), never the grid the listening eases toward the player. Measured on Jonathan's three real takes
   (2026-11-14): a dot drawn on the eased grid moved with the grid, up to 303 ms after the click's beat on one take and 150 ms before
   it on another, so a student following the dot chased his own lag. The board's moving cell keeps the eased grid. */
function scBeatAt(s, j){ return s.listenStart + j * s.beatMs; }
function scScheduleClicks(s){
  const ac = typeof getAudioCtx === 'function' ? getAudioCtx() : null;
  if (!ac || ac.state !== 'running') return 0;
  const perf0 = performance.now(), ctx0 = ac.currentTime, beats = s.total / 2;
  let n = 0;
  for (let j = 0; j < beats; j++){
    const dueMs = scBeatAt(s, j) - perf0, at = ctx0 + dueMs / 1000;
    const queue = () => { if (sc === s && (s.phase === 'countin' || s.phase === 'listening')) coachBeepAt(ac, at, 660, 0.08); };
    if (dueMs <= COACH_COUNTIN_AHEAD * 1000) queue();
    else s.timeouts.push(setTimeout(queue, dueMs - COACH_COUNTIN_AHEAD * 1000));
    n++;
  }
  return n;
}
/* Beat j is due (scLoop, the first frame at or after scBeatAt): while the Metronome was on at Start, whether or not the click sounds,
   the beat dot (the Metronome tool's .metro-dot, .sc-beat-dot) flashes and the frame around the board pulses, stronger on the 1 of
   each bar (sc-pulse sc-pulse-1) than on beats 2-4 (sc-pulse). An outline and a shadow, never the border: nothing moves. At most one
   pulse a beat (125 BPM: about 2 a second). With prefers-reduced-motion the frame holds a steady outline for the round instead
   (styles.css) and only the dot changes. Every exit clears both (scClearBoard). */
function scBeat(s, j){
  if (!s.metro) return false;
  const dot = document.getElementById('sc-beat');
  if (dot){ dot.classList.add('flash'); s.timeouts.push(setTimeout(() => dot.classList.remove('flash'), 90)); }
  const f = s.board;
  if (f){
    f.classList.remove('sc-pulse', 'sc-pulse-1');
    f.classList.add('sc-pulse');
    if (j % 4 === 0) f.classList.add('sc-pulse-1');
    s.timeouts.push(setTimeout(() => f.classList.remove('sc-pulse', 'sc-pulse-1'), 120));
  }
  return true;
}

/* The board's live marks, all of them off, and the frame's. */
function scClearBoard(){
  if (!sc) return;
  sc.cells.forEach(el => {
    el.classList.remove('sc-now', 'sc-ok', 'sc-bad');
    el.querySelectorAll('.sc-mark').forEach(m => m.remove());
  });
  if (sc.board) sc.board.classList.remove('sc-frame', 'sc-pulse', 'sc-pulse-1');
}

/* One start at a time (review: a second click while the mic prompt is open ran it twice, phase still 'ready'). */
async function scStart(){
  const s0 = sc;
  if (!s0 || s0.starting || (s0.phase !== 'ready' && s0.phase !== 'report')) return;
  s0.starting = true;
  try { await scStartRun(); } finally { s0.starting = false; }
}
async function scStartRun(){
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
  /* The Metronome tool's state at Start, and the headphones switch, decide the round's beat (scClicksWanted). No click through a
     speaker: the laptop's own click reaches the mic, as in every other listening game. stopAllDemoAudio stops the tool itself. */
  sc.metro = scMetroWanted();
  sc.metroSticky = sc.metro;
  sc.hp = scHeadphonesGet();
  stopAllDemoAudio();
  scLock(true);
  const micEl = document.getElementById('coach-mic');
  if (micEl){
    micEl.hidden = false;
    const track = coachStream && coachStream.getAudioTracks()[0];
    const label = track && track.label ? track.label : '';
    micEl.innerHTML = '<span class="coach-mic-dot"></span>' +
      (label ? t('coach.micOnDevice', { device: `<span class="sc-dev">${escHtml(label)}</span>` }) : t('coach.micOn')) +
      '<span class="coach-mic-level" id="coach-mic-level"><i></i><i></i><i></i></span>';
    coachMicLevelLast = -1;
  }
  const s = sc;
  scClearBoard();
  s.beatMs = 60000 / s.bpm;
  s.slotMs = s.beatMs / 2;
  s.win = SC_WIN_FRAC * s.slotMs;
  s.lat = coachMicLatencyMs();
  s.onsetRatio = SC_ONSET_RATIO; s.hfRatio = SC_HF_RATIO;   // scHearStrum: this check's own ratios
  s.smoothRms = 0; s.smoothHf = 0; s.lastOnsetT = -1e9; s.gridOffset = 0; s.lastPitchT = 0; s.onsets = [];
  s.cur = -1; s.beat = -1; s.sweep = 0; s.cap = null; s.events = []; s.barsDone = 0; s.gateLevels = []; s.gateLevel = null; s.gateFloor = null; s.tooLoud = false;
  s.slots = [];
  s.bars.forEach((name, b) => s.slotsOf.forEach((sl, k) => s.slots.push({ k: b * SC_SLOTS + k, bar: b, slot: k, strum: sl.strum, dir: sl.dir, state: 'pending', devMs: null, gridMs: null })));
  s.caps = s.bars.map((name, b) => ({ bar: b, chord: name, prev: b ? s.bars[b - 1] : null, at: null, rt: [], rm: [], verdict: null, a: null, b: null, c: null, o: null, done: false }));
  s.total = s.slots.length;
  s.phase = 'countin';
  scButtonLabel(s, true);
  if (s.metro && s.board) s.board.classList.add('sc-frame');
  scBody().innerHTML = `<span class="coach-count sc-count" id="sc-count">&nbsp;</span>`;
  scKeepInView(s);
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
  if (scClicksWanted(s.metro, s.hp)) scScheduleClicks(s);
  if (scRaf) cancelAnimationFrame(scRaf);
  scLoop();
}

function scRenderListening(){
  const body = scBody();
  if (!body || !sc) return;
  body.innerHTML =
    `${sc.metro ? '<span class="metro-dot sc-beat-dot" id="sc-beat" aria-hidden="true"></span>' : ''}<span class="sr-bar sc-bar" id="sc-bar">${t('games.radar.barOfTotal', { bar: 1, total: sc.bars.length })}</span>` +
    (sc.tooLoud ? `<span class="coach-note sc-note sc-too-loud">${escHtml(t('sc.tooLoud'))}</span>` : '');
}
/* TOO NOISY FOR FEEDBACK (above): one count-in frame (its level and when its sound arrived), kept when it is inside the measured stretch. */
function scGateFrame(s, rms, at){
  const a0 = s.listenStart - 4 * s.beatMs;
  if (at < a0 + SC_GATE_SKIP || at >= s.listenStart - s.win) return;
  for (let k = 0; k < 4; k++){ const c = a0 + k * s.beatMs; if (at >= c - SC_GATE_CLICK_PRE && at <= c + SC_GATE_CLICK_POST) return; }
  s.gateLevels.push(rms);
}
/* Bar 1's first window opens: too noisy for feedback when the kept frames' median is SC_GATE_LEVEL or more AND their SC_GATE_PCT
   percentile (the count-in's quiet part) is SC_GATE_FLOOR or more. Strums on the count-in that STILL fire it in a quiet room (review
   round 2, Jonathan's take 1 with its own strum pasted in; median / 20th percentile): strums on all four clicks 0.2475 / 0.2298, and
   one strum on count 1 left to ring into bar 1 0.1513 / 0.1026: the guitar fills the count-in's quiet part too. Accepted (the lead,
   2026-11-14): the end line then says "Too noisy for feedback" (Jonathan's words, 2026-11-15), and a round played to the end still
   counts. Strums on counts 3 and 4, on 2-4, or a strum on count 3 left to ring, do not fire it. */
function scGateDecide(s){
  const lv = s.gateLevels.slice().sort((p, q) => p - q);
  s.gateLevel = lv.length ? lv[Math.floor(lv.length / 2)] : 0;
  s.gateFloor = lv.length ? lv[Math.floor(lv.length * SC_GATE_PCT)] : 0;
  s.tooLoud = s.gateLevel >= SC_GATE_LEVEL && s.gateFloor >= SC_GATE_FLOOR;
  if (s.tooLoud && s.phase === 'listening') scRenderListening();
}
/* The board and the row under it inside the window once, when a round starts (Jonathan, 2026-11-14: "it doesn't scroll down to
   reveal what's next"): the step's strum widget scrolled to the nearest edge that shows all of it below the sticky band, only if any of
   it is outside. Once, not every frame; no smooth scroll with prefers-reduced-motion (scrollBehavior). */
function scKeepInView(s){
  const box = s.board && s.board.closest('.tab');
  if (!box || typeof box.getBoundingClientRect !== 'function') return;
  const r = box.getBoundingClientRect(), top = scTopEdge(), H = window.innerHeight || document.documentElement.clientHeight;
  if (r.top >= top && r.bottom <= H) return;
  box.style.scrollMarginTop = Math.ceil(top) + 'px';
  box.scrollIntoView({ block: r.height <= H - top ? (r.bottom > H ? 'end' : 'start') : 'start', behavior: scrollBehavior() });
}
/* The bottom of whatever sticks at the top of the window (the header, the set band), or 0. */
function scTopEdge(){
  let edge = 0;
  document.querySelectorAll('header, .set-eyebrow, .ca-card-bar').forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.position !== 'sticky' && cs.position !== 'fixed') return;
    const r = el.getBoundingClientRect();
    if (r.height && r.top <= 1) edge = Math.max(edge, r.bottom);
  });
  return edge;
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
  if (s.cells[k] && !s.tooLoud) s.cells[k].classList.add('sc-ok');   // a ✓ may show at once (none when the room is too noisy for feedback)
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

/* A strum heard (THE GRID, above): Strum Radar's onset test (srHearStrum, coach-strum.js: a level or HF jump over the smoothed level,
   past the 140 ms refractory) with this check's own ratios, then the grid put where the pattern fits. Returns the strum's time from
   beat 1 on that grid, or null. */
function scHearStrum(s, rms, hf){
  if (!((rms > CHK_ONSET_FLOOR && rms > s.smoothRms * s.onsetRatio ||
         hf > CHK_HF_FLOOR && hf > s.smoothHf * s.hfRatio) &&
        coachOnsetAt - s.lastOnsetT > COACH_ONSET_REFRACT)) return null;
  s.lastOnsetT = coachOnsetAt;   // when it arrived, not when this frame ran
  scAnchor(s, coachOnsetAt);
  return coachOnsetAt - s.listenStart - s.gridOffset - s.lat;
}
function scAnchor(s, at){
  s.onsets = s.onsets || [];
  s.onsets.push(at);
  const recent = s.onsets.filter(t => at - t < SC_ANCHOR_SPAN * s.slotMs);
  let r = scAnchorSearch(s, recent, SC_ANCHOR_RANGE, false);
  if (recent.length >= SC_ANCHOR_WIDE_MIN && r.score < recent.length - SC_ANCHOR_WIDE_SLACK){
    const w = scAnchorSearch(s, recent, SC_ANCHOR_WIDE_RANGE, true);
    if (w.score >= recent.length - SC_ANCHOR_WIDE_ACCEPT && w.n && w.off / w.n <= SC_ANCHOR_WIDE_TIGHT * s.slotMs) r = w;
  }
  s.gridOffset = r.best;
}
/* The best grid offset within `range` eighths of the grid it has, never more than SC_ANCHOR_WIDE_RANGE eighths from the click grid:
   the grid it has first, then SC_ANCHOR_STEP ms out on both sides; a later offset wins only with a higher score (so a tie keeps the
   nearest), or, when `centred`, with the same score and its strums nearer the middles of their windows. */
function scAnchorSearch(s, recent, range, centred){
  const c0 = s.gridOffset, n = Math.ceil(range * s.slotMs / SC_ANCHOR_STEP), lim = SC_ANCHOR_WIDE_RANGE * s.slotMs;
  let best = c0, bestScore = -1e9, bestOff = 1e9, bestN = 0;
  for (let i = 0; i <= 2 * n; i++){
    const o = c0 + (i % 2 ? 1 : -1) * Math.ceil(i / 2) * SC_ANCHOR_STEP;
    if (Math.abs(o) > lim + 1e-9 && o !== c0) continue;
    let score = 0, off = 0, nIn = 0;
    for (const t of recent){
      const q = t - s.listenStart - o - s.lat, k = Math.round(q / s.slotMs), d = q - k * s.slotMs;
      if (Math.abs(d) > s.win) continue;
      const sl = s.slotsOf[((k % SC_SLOTS) + SC_SLOTS) % SC_SLOTS];
      score += sl && sl.strum ? 1 : SC_ANCHOR_REST;
      off += Math.abs(d); nIn++;
    }
    if (score > bestScore || (centred && score === bestScore && off < bestOff - 1e-9)){ bestScore = score; best = o; bestOff = off; bestN = nIn; }
  }
  return { best, score: bestScore, off: bestOff, n: bestN };
}
/* The octave vote (THE CHORD, above): 'ok' / 'wrong' / 'unheard'. `chords`: the step's chords by name ({ midi: [...] }). */
function scChordO(midis, want, chords){
  const ms = (midis || []).filter(m => typeof m === 'number' && isFinite(m));
  if (ms.length < 3 || !chords) return 'unheard';
  const votes = scChordVotes(ms, chords), mine = votes[want] || 0;
  const other = Math.max(0, ...Object.keys(votes).filter(n => n !== want).map(n => votes[n]));
  if (mine > 0 && mine - other >= SC_OCT_OK_MARGIN) return 'ok';
  if (other - mine >= SC_OCT_WRONG_MARGIN) return 'wrong';
  return 'unheard';
}
/* Each chord's votes: the readings within SC_OCT_TOL of one of its notes or that note an octave down. */
function scChordVotes(ms, chords){
  const votes = {};
  Object.keys(chords).forEach(n => { const ns = (chords[n] && chords[n].midi || []).map(Number);
    votes[n] = ms.filter(m => ns.some(x => Math.abs(m - x) <= SC_OCT_TOL || Math.abs(m - (x - 12)) <= SC_OCT_TOL)).length; });
  return votes;
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
  cap.o = scChordO(cap.rm, cap.chord, s.chords);
  cap.ov = s.chords ? scChordVotes((cap.rm || []).filter(m => typeof m === 'number' && isFinite(m)), s.chords) : null;   // the votes, for a replay
  cap.verdict = SC_CHORD_RULE === 'oc' ? (cap.o !== 'unheard' ? cap.o : cap.c) : cap[SC_CHORD_RULE];
  const cell = s.cells[cap.bar * SC_SLOTS];
  const name = cell && cell.querySelector('.strum-chord');
  if (name && !s.tooLoud) name.insertAdjacentHTML('beforeend', `<span class="sc-mark sc-mark--${cap.verdict}">${cap.verdict === 'ok' ? '&#x2713;' : cap.verdict === 'wrong' ? '&#x2717;' : '?'}</span>`);
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
    if (el && !s.tooLoud && ((x.strum && x.state === 'miss') || (!x.strum && x.state === 'extra'))) el.classList.add('sc-bad');   // a ✗ only once the bar is over
  });
  s.barsDone = b + 1;
  s.faults = s.faults || [];
  s.faults[b] = faults;
  const cap = s.caps[b];
  if (!cap.done) scCloseChord(s, cap);
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
    scGateFrame(s, r, coachOnsetAt);   // the room's level, for TOO NOISY FOR FEEDBACK
    coachSmooth(s, r, coachHfRms);   // warm the level trackers on the room
  } else if (s.phase === 'listening' || early){
    if (s.gateLevel == null) scGateDecide(s);
    const rms = coachReadFrame(), hf = coachHfRms;
    const rel = scHearStrum(s, rms, hf);
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
    /* the beat, on the click grid (scBeatAt): dot and frame */
    const beat = Math.floor((now - scBeatAt(s, 0)) / s.beatMs);
    if (beat !== s.beat && beat >= 0 && beat < s.total / 2){ s.beat = beat; scBeat(s, beat); }
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
  if (s.board) s.board.classList.remove('sc-frame', 'sc-pulse', 'sc-pulse-1');
  s.phase = 'report';
  scButtonLabel(s, false);
  scRenderReport();
  if (s.complete && s.barsDone === s.bars.length) scCountRound(s);
  /* A round Stopped before bar 1 ended (in the count-in, or inside bar 1) has no judged bar: it is not saved, so it cannot replace the
     student's last take, which has the same id (review round 4, R4-4: Stop 0.67 s into the count-in wrote a take with barsDone 0 over
     the full round before it). micRecStop, above, has already stopped that capture and let it go; nothing else holds it. */
  if (rec && s.barsDone >= 1) micRecSave(rec, scRecMeta());
}

/* A FULL round (the loop reached the end of the last bar: not Stopped, not interrupted; any score) on
   a step with `listenRounds: n` (class-activities.js, ca-52: "2 full rounds", Jonathan 2026-11-14)
   counts toward its tick: rounds 1..n-1 are the caSteps ticks `<id>:<si>:r<k>`, round n is the
   step's own tick `<id>:<si>`, all through onCaStepChange, the writer every activity step tick uses
   (no other write to the progress doc). The step's count line and status follow in place: the check's
   card stays on screen with its report. Nothing in the teacher console (no button there). */
function scCountRound(s){
  if (typeof IS_TEACHER_MODE !== 'undefined' && IS_TEACHER_MODE) return;
  if (typeof onCaStepChange !== 'function' || typeof caListenRoundsDone !== 'function') return;
  const m = /^bpm:ca:(ca-\d+):(\d+):strum$/.exec(s.where || '');
  if (!m) return;
  const id = m[1], si = Number(m[2]);
  const a = (window.CLASS_ACTIVITIES || []).find(x => x.id === id), step = a && a.steps && a.steps[si];
  const n = step ? Number(step.listenRounds) || 0 : 0;
  if (n < 1) return;
  const done = caListenRoundsDone(id, si, n);
  if (done >= n) return;
  onCaStepChange(done + 1 >= n ? `${id}:${si}` : `${id}:${si}:r${done + 1}`, true);
  const now = caListenRoundsDone(id, si, n);
  document.querySelectorAll(`.sc-rounds[data-sc-rounds="${id}:${si}"]`).forEach(el => {
    el.innerHTML = escHtml(t('sc.rounds', { n: now, total: n })) + (now >= n ? ' &#x2713;' : '');
    el.classList.toggle('sc-rounds--done', now >= n);
    const li = el.closest('.ca-step');
    if (li && now >= n){
      li.classList.add('ca-step-done');
      const st = li.querySelector('.ca-step-status');
      if (st && typeof caStepStatusHtml === 'function') st.innerHTML = caStepStatusHtml(si + 1, true);
    }
  });
  if (now >= n && typeof caSyncTopbar === 'function') caSyncTopbar();
}

function scRenderReport(){
  const s = sc, body = scBody();
  if (!s || !body) return;
  const n = s.barsDone;
  let p = 0, c = 0;
  for (let b = 0; b < n; b++){
    if (!scBarFaults(s.slots.slice(b * SC_SLOTS, (b + 1) * SC_SLOTS).map(x => x.state), s.slotsOf).length) p++;
    if (s.caps[b].verdict === 'ok') c++;
  }
  const heard = s.events.some(e => e.kind !== 'outside');   // a sound inside the bars, anywhere
  /* too noisy: the end line says whether the round counted (review R1-4: a Stopped round does not) */
  const counted = !!(s.complete && s.barsDone === s.bars.length);
  const head = s.tooLoud ? t(counted ? 'sc.tooLoudCounted' : 'sc.tooLoudStopped') : n < 1 ? t('sc.noBars') : !heard ? t('sc.nothing') : scSummaryLine(n, p, c);
  /* One line, no per-bar sentences; the marks stay on the board until the next round. The row's button starts it. */
  body.innerHTML = `<span class="coach-overall sc-summary">${escHtml(head)}</span>${scHeadphonesHtml()}<span class="sc-local" data-micrec-local></span>`;
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
      latMs: num(s.lat), gridRule: 'shape', gridEase: null, gridEaseWithin: null, gridStepCapMs: null, gridOffsetMs: r1(s.gridOffset),
      onsetRatio: SC_ONSET_RATIO, hfRatio: SC_HF_RATIO, refractMs: COACH_ONSET_REFRACT, chordClarity: SC_CHORD_CLARITY,
      attackSkipMs: COACH_ATTACK_SKIP, tailAMs: COACH_EVENT_TAIL, tailGapMs: SC_TAIL_GAP, missGraceMs: SC_MISS_GRACE,
      recCapSec: num(s.recCapSec), roundSec: r1(s.roundSec), complete: !!s.complete, barsDone: num(s.barsDone) || 0,
      /* what the student had for a beat (2026-11-14): the Metronome on at Start, "I'm wearing headphones", the click played */
      metroOn: !!s.metro, headphones: !!s.hp, clicks: scClicksWanted(s.metro, s.hp),
      tooLoud: !!s.tooLoud, gateLevel: num(s.gateLevel) == null ? null : Math.round(s.gateLevel * 1e5) / 1e5, gateFloorLevel: num(s.gateFloor) == null ? null : Math.round(s.gateFloor * 1e5) / 1e5, gateFloor: SC_GATE_FLOOR, gateFrames: (s.gateLevels || []).length, gateThreshold: SC_GATE_LEVEL,
      anchorRange: SC_ANCHOR_RANGE, anchorWide: SC_ANCHOR_WIDE_RANGE, anchorWideMin: SC_ANCHOR_WIDE_MIN, anchorWideSlack: SC_ANCHOR_WIDE_SLACK, anchorWideAccept: SC_ANCHOR_WIDE_ACCEPT, anchorWideTight: SC_ANCHOR_WIDE_TIGHT, gatePct: SC_GATE_PCT, octOkMargin: SC_OCT_OK_MARGIN, octWrongMargin: SC_OCT_WRONG_MARGIN, anchorStep: SC_ANCHOR_STEP, anchorSpan: SC_ANCHOR_SPAN, anchorRest: SC_ANCHOR_REST, octTol: SC_OCT_TOL,
      eventTimes: 'played (arrival - latMs)',
      rests: s.slots.filter(x => !x.strum).map(x => ({ bar: x.bar, slot: x.slot, verdict: str(x.state), devMs: r1(x.devMs) })),
      chords: s.caps.map(cp => ({ bar: cp.bar, chord: str(cp.chord), prev: str(cp.prev), verdict: str(cp.verdict), a: str(cp.a), b: str(cp.b), c: str(cp.c), o: str(cp.o),
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
  scButtonLabel(sc, false);
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
