/* ════════════════════════════════════════════════════════════════════
   Guitar Class — LISTENING COACH  (supersedes the Session G plan)

   The site hears you play and gives rubric feedback. Two entry points,
   both rendered by app.js:
     · "🎤 Listening Coach" next to every ▶ Play button — melody mode
       (data-midis = answer key)
     · "🎤 Listening Coach" under a step's chord diagrams — chord mode
       (data-chords = [{n:name, m:[midis]}])

   Flow: inline card → 4-click count-in → mic listens while the student
   plays one note/strum per beat → report card scoring FIVE criteria on a
   three-level scale (Needs work / You're getting it / Great), one plain
   sentence each:
     1. Right notes (pitch)   2. On the beat (timing)   3. Steady tempo
     4. Chord changes         5. Played it through (completion)

   Criteria 2, 3 and 4 are `soft`: they all measure WHERE in the bar the
   notes landed, so they coach rather than fail. A note played at the right
   pitch counts as the right note no matter how loosely it sat against the
   click — see the timing-forgiveness block above COACH_MATCH_FRAC.

   Detection reuses the tuner's approach: mic → highpass/lowpass →
   AnalyserNode. Onsets come from RMS jumps (energy flux + refractory
   window); pitch from a trimmed YIN (tau capped at the guitar's range so
   it's cheap enough to run ~20×/s on a Chromebook). Pitch-class is
   compared first, octave second — an octave-off correct note still counts
   (HPS/YIN octave slips are the classic false negative).

   Honesty rules (from the Session G research): never claim a chord NAME
   from audio — chord feedback is about timing + "chord-tone" plausibility,
   hedged in the wording. A too-quiet/unclear take gets "I couldn't hear
   that clearly", never a wrong verdict. Mic runs only while a check is
   active, with a visible indicator; nothing is recorded or uploaded.

   Loaded as a plain <script> AFTER app.js and tuner.js — uses their
   globals at call time: escHtml/escAttr/beep/ordinal (app.js),
   NOTES/tunerRunning/closePopup (tuner.js / app.js).
   ════════════════════════════════════════════════════════════════════ */

/* ── Tunables ── */
const COACH_FFT           = 4096;   // analyser buffer (85ms @ 48k — enough for low E)
const COACH_PITCH_GATE    = 0.004;  // RMS floor for pitch readings
/* Onset thresholds, shared by every mic flow — the Listening Coach's chord
   and melody modes (coachLoop), Change Up (ccLoop), Note Runner, and Strum
   Radar (srLoop). These started as the forgiving "check-flow" values while
   the rhythm games kept a stricter set (0.010/2.2× RMS, 0.002/2.6× HF), on
   the theory that a stray onset there would be a false strum. Real-guitar
   testing killed that theory twice: moderate strums at normal playing volume
   slip under the strict floors and score as misses ("the radar barely heard
   the pattern"), while the sensitive values stay safe everywhere because
   every flow only grades an onset that lands near a scheduled beat — a stray
   onset with no nearby slot is counted as an "extra" at most, never a hit. */
const CHK_ONSET_FLOOR     = 0.003;  // absolute RMS floor for an onset
const CHK_ONSET_RATIO     = 1.4;    // RMS jump over the smoothed level
const CHK_HF_FLOOR        = 0.0008; // absolute floor for the pick-attack channel
const CHK_HF_RATIO        = 1.7;    // HF jump over its smoothed level
/* Power Chord Switch ONLY (Jonathan, 2026-11-05): a strum has to jump the level more than the shared
   ratios above. Measured on 12 real takes (186 changes, 52 false hits, 132 real strums; the console's
   strum what-if): 1.8 / 2.19 hears 14 fewer false hits and loses 1 real strum, 2.2 / 2.67 hears 30 fewer
   and loses 4, 2.6 / 3.16 hears 38 fewer and loses 9 (the shared 1.4 / 1.7: none, none). 2.2 is where the
   trade bends. The false hits are room noise and a chord left ringing; the lost strums are soft ones.
   Change Up and every other loop keep CHK_ONSET_RATIO / CHK_HF_RATIO. Each saved take records the ratios
   it was graded with (ccRecMeta), so the console can tell these takes from the older ones.
   Lowered 2.2 / 2.67 -> 1.8 / 2.19 on 2026-11-07 (Jonathan), from "Evaluate all recordings" on 34 takes. At 2.2 (14 takes) false hits were
   12 of 97 (27% at 1.4) but 6 of 75 real strums were missed, 5 of them at 35-40 BPM, normal loudness, 175-300 ms early (the previous chord
   still ringing). The what-if on the 7 takes graded at 1.4: 1.8 removes 11 of 31 false hits and loses 0 of 81 real strums; 2.2 removes 21 and
   loses 3. For students who were playing, both leave the same 4 false hits. "No readable pitch, no tick" was rejected (removes 2 of 12 false
   hits, loses 10 of 46 real rights). Roll back: set the two numbers below back to 2.2 / 2.67 and re-pin 1ck and check 2d in tools/checks.mjs. */
const CC_POWER_ONSET_RATIO = 1.8;   // RMS jump over the smoothed level, Power Chord Switch
const CC_POWER_HF_RATIO    = 2.19;  // HF jump over its smoothed level (1.7 x 1.8 / 1.4, the what-if's scaling)
const COACH_ONSET_REFRACT = 140;    // ms — one strum = one onset, not six
const COACH_ATTACK_SKIP   = 70;     // ms after an onset before pitch readings start —
                                    // the analyser window still holds the pick scrape
                                    // (and the PREVIOUS note) until then
const COACH_EVENT_TAIL    = 340;    // ms of pitch readings collected after an onset
/* THE SECOND LOOK (2026-10-16, Listening Coach melody + Note Runner
   melody). A note the site heard but read fewer than 2 pitches for in its
   COACH_EVENT_TAIL comes out "unclear" — 51 of 112 notes in the
   2026-10-16 period 4 takes, the biggest single reason a note went
   uncounted (tools/mic-sim: eval-takes.mjs, per-note reason). Such an
   event keeps reading up to COACH_LOOK_TAIL after its onset (never past
   60 ms before the next written note), and turns RIGHT when the note or
   its octave is at least COACH_VOTE_SHARE of at least COACH_LOOK_MIN
   readings. Otherwise it stays unclear — the extra readings can never
   produce a wrong verdict, and an event that already had 2+ readings is
   never touched. 2026-10-16 period 4 takes, replayed on the site's own
   schedule (whatif-tail.mjs): right 30 -> 35, wrong 12 -> 12, unclear
   52 -> 47; 4 of the 5 are clearly the right note in the recording, 1 is
   mixed. Two readings instead of three gave right 40 but credited 3 notes
   the recording says were a different pitch; a full verdict on the
   longer tail gave right 40 / wrong 19 — honest wrongs, but wrongs. */
const COACH_LOOK_TAIL     = 600;
const COACH_LOOK_MIN      = 3;
const COACH_MAX_SLOTS     = 32;
const COACH_BEATS_PER_CHORD = 4;
/* How long the listening window stays open — see coachListenDeadline. The
   original rule closed it a flat 1.5 beats after the last slot, measured
   from the RIGID listenStart, which is the one grid the scorer never reads:
   coachMatchEvent eases gridOffset toward the student, so a player sitting
   behind the click kept getting matched on the adapted grid right up until
   the window shut on the rigid one — and the tail of the drill came back
   "miss" for notes they were still in the middle of playing (student issue
   report, 2026-08-27). The deadline now rides the same adapted grid the
   matcher does, the grace after the last slot is wider, and a take that is
   still landing notes holds the mic open past it. */
const COACH_TAIL_BEATS    = 3;      // grace beats after the final slot
const COACH_STALL_BEATS   = 2.5;    // ...and keep listening this long after the last matched note
const COACH_MAX_LISTEN_X  = 2.5;    // backstop: never listen past this × the nominal window
/* Visual beat-pulse fade (listening phase only — see coachPulseFadeThreshold
   and coachMatchEvent). No audio: the mic is live the whole time the Coach
   is listening, so an audible click here (unlike Riff Runner's, which is
   keys/taps only) could bleed from the speakers back into the pitch/onset
   detector. A "tight" hit is one whose timing deviation is well inside the
   coachMatchWinMs() window coachMatchEvent already requires just to MATCH a slot
   — a fraction of that, not the whole thing, so "tight" stays meaningfully
   stricter than merely "counted". */
const COACH_PULSE_TIGHT_FRAC = 0.2;   // fraction of coach.beatMs counted as "tight" timing
/* ── Timing forgiveness (2026-09-01) ──
   A note played at the right pitch is the right note, even when it lands
   off the pulse. Three separate knobs used to punish loose timing on top of
   the "On the beat" criterion that exists to talk about it:
     · the match window — a hit outside it doesn't land on ANY slot, so a
       note the student really played came back "miss" and dragged the
       pitch ratio and the completion score down with it;
     · the "on the beat" threshold, tight enough that an ordinary beginner
       take read Needs work;
     · the overall level, which took the worst of all five criteria, so
       loose timing alone could sink a take with every note right.
   The fix is not to stop measuring timing — it's to stop double-counting
   it. The window is wider, the threshold is wider, timing/tempo/changes
   are flagged `soft` so they coach rather than fail (see
   coachRenderReport), and the report says outright that the notes counted
   and the beat is the next thing to work on. */
const COACH_MATCH_FRAC    = 0.9;    // slot match window, as a fraction of a beat (was 0.75)
const COACH_MATCH_MIN_MS  = 320;    // ...with an absolute floor, so fast tempos stay reachable
const COACH_ON_BEAT_FRAC  = 0.25;   // "on the beat" for the timing criterion (was 0.18)
const COACH_ON_BEAT_MIN_MS = 120;   // ...and its absolute floor (was 90)

/* Half-width of the window an onset must land in to be matched to a slot.
   Capped at a full beat: wider than that and a hit could leapfrog the slot
   on the far side of the one it belongs to. */
function coachMatchWinMs(){
  return Math.min(coach.beatMs, Math.max(coach.beatMs * COACH_MATCH_FRAC, COACH_MATCH_MIN_MS));
}

/* How close to the beat still counts as "on" it. Shared by the timing
   criterion and the per-chip `loose` marker so the report and the strip
   can never disagree about which hits were on the pulse. */
function coachOnBeatMs(){
  return Math.max(COACH_ON_BEAT_MIN_MS, coach.beatMs * COACH_ON_BEAT_FRAC);
}
/* Chromebook built-in mics commonly capture noticeably quieter than a
   MacBook's, and getUserMedia is requested with autoGainControl:false (see
   coachAcquireMicInner) — deliberately, since browser AGC pumps up the
   background noise floor right along with a quiet player, which is the
   opposite of what we want in a loud classroom. A fixed GainNode instead:
   it multiplies the whole signal by a constant, so it helps a quiet mic
   clear the ABSOLUTE floors above (COACH_PITCH_GATE, *_ONSET_FLOOR,
   *_HF_FLOOR) without weakening the RATIO checks (*_ONSET_RATIO, *_HF_RATIO)
   that actually separate a real strum from steady room noise — multiplying
   both the signal and its smoothed baseline by the same constant leaves
   their ratio unchanged. 3× is a middle-of-the-road boost: enough to lift a
   quiet Chromebook capture into the working range, unlikely to push a
   normal laptop mic into float clipping (GainNode output isn't hard-clipped
   before the analyser the way speaker playback would be). */
const COACH_MIC_GAIN = 3;

/* `records` is true ONLY where a consented recording can actually run —
   the Listening Coach card (micRecStart('coach')), Note Runner
   (micRecStart('nr')) and Power Chord Switch (micRecStart('pw'), not Change Up).
   Every other screen never records, so it always says
   "nothing is recorded"; the data-rec mark is what micRecFootSync re-words. */
function coachFootHtml(records){ return '<div class="coach-foot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg> <span class="coach-foot-txt"' + (records ? ' data-rec="1"' : '') + '>' + coachFootText(records) + '</span></div>'; }
/* "Nothing is recorded" is only true for a student who has not said yes to
   the consented recordings below — one who has, while collection is open,
   is told their takes are saved instead (micRecFootSync re-words it live).
   Only on a screen that records (`records`); elsewhere it stays "nothing". */
function coachFootText(records){ return t(records && typeof micRecWanted === 'function' && micRecWanted() ? 'coach.footRec' : 'coach.foot'); }

let coach = null;            // active check session (null = no card open)
let coachStream = null, coachCtx = null, coachAnalyser = null, coachRaf = null,
    coachFrameBuf = null;
window.coachMicLive = false; // read by app.js to silence ▶ Play while listening

/* ══════════ Opening a card ══════════ */

/* onclick target for every coach button app.js renders. */
function coachOpen(btn){
  if (typeof stopAnyRec === 'function') stopAnyRec();   // an in-progress self-recording also owns the mic
  gamesStopMic();                     // a running game owns the shared mic — evict it
                                      // cleanly (its UI resets) before coachClose()
                                      // tears the stream down
  coachClose();                       // one card at a time
  let slots, mode, desc, tabNotes = null, tabDerived = false, hideNames = false, chordShapes = null;
  if (btn.dataset.chords){
    let chords;
    try { chords = JSON.parse(btn.dataset.chords); } catch(e){ return; }
    if (!Array.isArray(chords) || !chords.length) return;
    mode = 'chords';
    /* The step's own diagrams by name (app.js data-chord-shapes): a barre C
       at fret 3 or a B5 at fret 7 on the low E must not be drawn as the
       library's open C or A-string B5. Kept out of data-chords on purpose:
       that JSON is the drill and streak key. */
    try { chordShapes = btn.dataset.chordShapes ? JSON.parse(btn.dataset.chordShapes) : null; } catch(e){ chordShapes = null; }
    slots = coachChordSlots(chords);
    desc = coachChordDesc(chords, slots.length);
  } else {
    let midis;
    try { midis = JSON.parse(btn.dataset.midis || '[]'); } catch(e){ return; }
    if (!Array.isArray(midis) || !midis.length) return;
    // Held notes ({midi,beats}) aren't one-pick-per-beat — the caller should
    // have suppressed the button already, but bail out rather than render NaNs.
    if (midis.some(m => m && typeof m === 'object' && !Array.isArray(m))) return;
    mode = 'melody';
    /* Show WHERE to play it: a real TAB spec passes through verbatim
       (data-tabnotes); bare midi drills get a derived fingering. */
    if (btn.dataset.tabnotes){
      try { tabNotes = JSON.parse(btn.dataset.tabnotes).slice(0, COACH_MAX_SLOTS); } catch(e){ tabNotes = null; }
      hideNames = btn.dataset.hideNames === '1';
    }
    if (!tabNotes){
      tabNotes = coachDeriveTabNotes(midis.slice(0, COACH_MAX_SLOTS));
      tabDerived = !!tabNotes;
    }
    slots = midis.slice(0, COACH_MAX_SLOTS).map(m => {
      const arr = (Array.isArray(m) ? m : [m]).map(Number);
      const root = Math.min.apply(null, arr);   // tab midi arrays aren't root-first
      return {
        midi: root,
        midis: arr,                                  // coachMelodyVote's targets
        classes: arr.map(x => ((x % 12) + 12) % 12),
        label: coachNoteName(root),
        isChange: false, chordName: null,
        state: 'pending', hit: null
      };
    });
    /* hideNames (sight-reading, e.g. ca-21): the Ready screen's "You'll
       play:" line used to spell out every note name here regardless — the
       one place `1ce8d7a`'s Coach-answer-leak fix (2026-09-25) missed, since
       it only closed the leak in the tab board itself. Found 2026-09-26. */
    desc = hideNames
      ? t('coach.desc.melodyHidden', { count: slots.length })
      : t('coach.desc.melody', { count: slots.length,
          list: slots.slice(0, 10).map(s => s.label).join('–') + (slots.length > 10 ? '…' : '') });
  }

  /* BPM: start from the sibling ▶ Play slider when there is one (shared
     reader in app.js). Capped: one hit per click, keep it humane. */
  let bpm = readGroupBpm(btn, 60);
  if (!(bpm >= 30)) bpm = 60;
  bpm = Math.min(120, bpm);

  const card = document.createElement('div');
  card.className = 'coach-card';
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

  /* The card renders THIS tab's own board, and the page's copy of the same
     board sits directly underneath it — the listening screen showed the
     identical TAB twice (2026-07-26). Hide the page's for as long as the
     card is open; coachClose puts it back. Only when the card actually has
     a board of its own to replace it with. */
  const hiddenTabs = [];
  if (mode === 'melody' && tabNotes){
    const tabBody = anchor.closest('.tab-body');
    if (tabBody){
      /* A class, not [hidden]: .tab-board sets its own display, which
         out-specifies the UA's [hidden]{display:none} — the attribute did
         nothing here. */
      tabBody.querySelectorAll(':scope > .tab-board, :scope > .tab-phrase').forEach(el => {
        if (card.contains(el)) return;
        el.classList.add('coach-dup-hidden');
        hiddenTabs.push(el);
      });
    }
  }

  coach = {
    phase: 'ready', mode, slots, desc, bpm, tabNotes, tabDerived, hideNames, hiddenTabs, chordShapes,
    beatMs: 60000 / bpm,
    card, streakKey: 'coachStreak:' + (btn.dataset.chords || btn.dataset.midis),
    drillId: btn.dataset.chords || btn.dataset.midis,
    /* Checklist skills this drill vouches for (app.js coachSkillsAttr). The
       report writes its level to each, and the "I've got it!" gate reads it. */
    skillIds: (btn.dataset.coachskills || '').split(',').filter(Boolean),
    events: [], pendings: [], looks: [],
    gridOffset: 0, listenStart: 0, timeouts: [],
    smoothRms: 0, smoothHf: 0, lastOnsetT: -1e9, lastPitchT: 0, lastMatchT: 0,
    pulseStreak: 0, pulseMuted: false   // visual beat-pulse fade state
  };
  coachRenderReady();
  card.scrollIntoView({ block: 'nearest', behavior: scrollBehavior() });
}

/* The card's one-line description, read off the slots the drill really has.
   COACH_MAX_SLOTS cuts the second pass short from 5 chords up (7 power
   chords: one pass, then the first one again; 8 chords: one pass), so
   "twice through" is said only when both passes fit. */
function coachChordDesc(chords, slotCount){
  const per = COACH_BEATS_PER_CHORD;
  if (chords.length === 1) return t('coach.desc.chordsOne', { names: chords[0].n });
  const shown = Math.min(chords.length, Math.floor(slotCount / per));
  const names = chords.slice(0, shown).map(c => c.n).join(' → ');
  const passes = Math.floor(slotCount / (chords.length * per));
  if (passes >= 2) return t('coach.desc.chordsMulti', { names });
  const again = (slotCount - chords.length * per) / per;
  if (passes === 1 && again > 0){
    return t('coach.desc.chordsOnceThen', { names,
      again: chords.slice(0, again).map(c => c.n).join(' → ') });
  }
  return t('coach.desc.chordsOnce', { names });
}

function coachChordSlots(chords){
  /* 1 chord: 8 strums; 2+ chords: 2 passes through the loop, cut off at
     COACH_MAX_SLOTS from 5 chords up (coachChordDesc says so). */
  const cycles = 2;
  const slots = [];
  for (let c = 0; c < cycles && slots.length < COACH_MAX_SLOTS; c++){
    chords.forEach(ch => {
      for (let b = 0; b < COACH_BEATS_PER_CHORD; b++){
        if (slots.length >= COACH_MAX_SLOTS) return;
        const midis = (ch.m || []).map(Number);
        slots.push({
          midi: midis.length ? Math.min.apply(null, midis) : null,
          classes: midis.map(x => ((x % 12) + 12) % 12),
          label: b === 0 ? ch.n : '·',
          isChange: b === 0 && slots.length > 0 && slots[slots.length - 1].chordName !== ch.n,
          chordName: ch.n,
          state: 'pending', hit: null
        });
      }
    });
  }
  return slots;
}

function coachNoteName(midi){
  return NOTES[((midi % 12) + 12) % 12].replace('#', '♯');
}

/* Derive a fingering for a bare midi list: find the lowest 4-fret box
   (open position first) that fits EVERY note — so a Pattern-1 climb lands
   on the frets 5–8 box, not a scattered lowest-fret mapping. Notes are
   placed thickest-string-first inside the box, the way scale boxes are
   taught. Returns [{string,fret,note,midi},…] for renderTabBlock, or null
   (mini-chords / out-of-range) — then the card just shows no tab. */
function coachDeriveTabNotes(midis){
  const flat = [];
  for (const m of midis){
    if (Array.isArray(m)) return null;
    const n = Number(m);
    if (!isFinite(n) || n < 40 || n > 88) return null;
    flat.push(n);
  }
  const labels = ['e','B','G','D','A','E'];      // TAB_STRINGS order (1st → 6th)
  const opens  = [64, 59, 55, 50, 45, 40];
  const tryPos = p => {
    const out = [];
    for (const m of flat){
      let pick = null;
      for (let si = 5; si >= 0; si--){
        const fret = m - opens[si];
        if (fret >= p && fret <= p + 3){
          pick = { string: labels[si], fret, note: coachNoteName(m), midi: m };
          break;
        }
      }
      if (!pick) return null;
      out.push(pick);
    }
    return out;
  };
  for (let p = 0; p <= 12; p++){
    const out = tryPos(p);
    if (out) return out;
  }
  /* No single box fits — greedy lowest-fret fallback so SOMETHING useful shows. */
  return flat.map(m => {
    let best = null;
    for (let si = 5; si >= 0; si--){
      const fret = m - opens[si];
      if (fret >= 0 && (!best || fret < best.fret)) best = { string: labels[si], fret, note: coachNoteName(m), midi: m };
    }
    return best;
  });
}

/* The expected notes as a real TAB grid (reuses app.js's renderTabBlock —
   same board students read everywhere else, speaker buttons included). */
function coachTabHtml(){
  if (!coach || !coach.tabNotes || coach.mode !== 'melody' || typeof renderTabBlock !== 'function') return '';
  return `<div class="coach-tab">${renderTabBlock(coach.tabNotes, 0, 0, coach.hideNames)}` +
    (coach.tabDerived ? `<div class="coach-tab-hint">${t('coach.tabHint')}</div>` : '') +
    `</div>`;
}

/* ══════════ Card phases ══════════ */

function coachBody(){ return document.getElementById('coach-body'); }

function coachRenderReady(msg){
  if (!coach) return;
  const body = coachBody();
  if (!body) return;   // card panel isn't in the DOM (e.g. replaced by a language switch)
  coach.phase = 'ready';
  body.innerHTML =
    (msg ? `<div class="coach-note">${escHtml(msg)}</div>` : '') +
    `<div class="coach-target">${t('coach.target.label')} <strong>${escHtml(coach.desc)}</strong></div>
     ${coachTabHtml()}
     <div class="coach-bpm-row">
       <button type="button" class="tp-btn" onclick="coachNudgeBpm(-5)">&#x2212;5</button>
       <span class="coach-bpm-readout" id="coach-bpm-readout">${coach.bpm} BPM</span>
       <button type="button" class="tp-btn" onclick="coachNudgeBpm(5)">+5</button>
     </div>
     <div class="coach-tip">&#x1F92B; ${t(coach.mode === 'chords' ? 'coach.tip.readyChords' : 'coach.tip.readyMelody')}</div>
     <button type="button" class="coach-start" onclick="coachStartCheck()">&#x25B6; ${t('coach.start')}</button>`;
}

function coachNudgeBpm(d){
  if (!coach || coach.phase !== 'ready') return;
  coach.bpm = Math.min(120, Math.max(30, coach.bpm + d));   // floor matches coachOpen's accepted minimum, or "−" could raise the tempo on a slow step
  coach.beatMs = 60000 / coach.bpm;
  const el = document.getElementById('coach-bpm-readout');
  if (el) el.textContent = coach.bpm + ' BPM';
}

async function coachStartCheck(){
  if (!coach || (coach.phase !== 'ready' && coach.phase !== 'report')) return;
  // Collection is on and this device hasn't answered yet: ask first.
  if (micRecShouldAsk() && coachBody()){ coachBody().innerHTML = micRecAskHtml('coach'); return; }

  /* One mic owner at a time — the tuner hands over. */
  coachEvictTuner();

  /* The games share the mic pipeline — hand it over cleanly first. */
  if (typeof gamesStopMic === 'function') gamesStopMic();

  const session = coach;
  if (!coachStream && !(await coachAcquireMic())){
    if (coach === session) coachRenderReady(coachMicFailMsg('coach.mic.denied'));
    return;
  }
  await coachEnsureRunning();
  if (coach !== session){ coachReleaseMicIfIdle(); return; }   // card closed during the prompt
  if (!coachBody()){ coachReleaseMicIfIdle(); return; }   // card panel was replaced in the DOM during the prompt (e.g. a language switch rebuilt the module panel)
  if (document.hidden){   // tab was backgrounded while the prompt was open
    coachMicOff();
    coachRenderReady(t('coach.paused.backgrounded'));
    return;
  }
  /* AFTER the guards: silence anything the site itself is playing (demo
     sequences, chord strums, metronome) — including audio started while the
     permission prompt was open — so the mic doesn't score the speakers. */
  stopAllDemoAudio();
  const micEl = document.getElementById('coach-mic');
  if (micEl){
    micEl.hidden = false;
    /* Surface the active capture device so a wrong-mic pickup (AirPods,
       iPhone Continuity camera mic) is self-evident rather than reading as
       a "couldn't hear" false failure. */
    const track = coachStream && coachStream.getAudioTracks()[0];
    const label = track && track.label ? track.label : '';
    micEl.innerHTML = '<span class="coach-mic-dot"></span>' +
      (label ? t('coach.micOnDevice', { device: escHtml(label) }) : t('coach.micOn')) +
      '<span class="coach-mic-level" id="coach-mic-level"><i></i><i></i><i></i></span>';
    coachMicLevelLast = -1;   // new <i> elements — force the next frame to (re)apply lit classes
  }

  /* Fresh attempt state */
  coach.slots.forEach(s => { s.state = 'pending'; s.hit = null; s.loose = false; });
  coach.events = []; coach.pendings = []; coach.looks = [];
  coach.gridOffset = 0; coach.smoothRms = 0; coach.smoothHf = 0; coach.lastOnsetT = -1e9;
  coach.lastPulse = -1; coach.frameNo = 0; coach.lastPitchT = 0; coach.lastMatchT = 0;
  coach.pulseStreak = 0; coach.pulseMuted = false;

  /* Count-in: 4 clicks, last one higher = "go". The tab stays on screen so
     the fretting hand can get in position while the clicks run. */
  coach.phase = 'countin';
  /* Same lane the listening screen uses, with the count digit sitting in the
     exact spot the note readout will appear — so the eye is already in the
     right place on beat 1 instead of hunting for what moved. */
  const firstLabel = coach.mode === 'chords'
    ? (coach.slots[0].chordName || coach.slots[0].label)
    : (coach.hideNames ? '' : coach.slots[0].label);
  coachBody().innerHTML =
    coachChordsHtml(coach.slots[0] && coach.slots[0].chordName) +
    `<div class="coach-lane" id="coach-lane">
       <div class="coach-lane-head">
         <span class="coach-lane-now" id="coach-count">&nbsp;</span>
         <span class="coach-lane-lbl">${t('coach.lane.countIn')}</span>
         <span class="coach-lane-next">${firstLabel ? t('games.common.next') + ' ' + escHtml(firstLabel) : ''}</span>
       </div>
       ${coach.mode === 'melody' ? (coachTabHtml() || coachStripHtml()) : coachStripHtml()}
     </div>`;
  // A consented recording runs from here to the end of the take.
  if (micRecStart('coach')){
    if (micEl) micEl.insertAdjacentHTML('beforeend', micRecBadgeHtml());
    else coachBody().insertAdjacentHTML('afterbegin', micRecBadgeHtml());
  }
  coachCountIn(coach, 'coach-count', () => {
    if (!coach || !coachBody()) return;   // card panel may have been replaced in the DOM during the count-in (e.g. a language switch rebuilt the module panel)
    coach.phase = 'listening';
    coachRenderListening();
  });

  if (coachRaf) cancelAnimationFrame(coachRaf);
  coachLoop();
}

/* Mic pipeline shared by the Coach card and Note Hunt: raw-audio capture →
   band-limit to the guitar's range (same as the tuner) → analyser.
   Returns false if the mic is denied. Single-flight: while a permission
   prompt is pending, concurrent callers await the SAME acquisition — a
   double-click can never open a second stream and orphan the first. */
/* The tuner-eviction snippet, once — four call sites had hand-copies. */
function coachEvictTuner(){
  if (typeof tunerRunning !== 'undefined' && tunerRunning && typeof closePopup === 'function'){
    closePopup('tuner');
  }
}

/* Why the last coachAcquireMic() failed: the getUserMedia error's name, or
   'setup' when the mic opened but the audio graph behind it didn't. Every
   failure used to say "access denied — check browser permissions", which
   sent a student whose mic was simply missing, or held by another app (a
   video call), to a permission setting that was already on. */
let coachMicFailName = '';
/* The line for a failed coachAcquireMic(). A refusal — the student, or the
   browser's site setting, said no — keeps the caller's own "access denied"
   key; no mic, a busy mic, or a failed setup each say so instead. */
function coachMicFailMsg(deniedKey){
  if (/^(NotAllowedError|SecurityError|PermissionDeniedError)$/.test(coachMicFailName)) return t(deniedKey);
  return t(coachMicFailName === 'setup' ? 'coach.mic.failed' : 'coach.mic.unavailable');
}
let coachAcquirePending = null;
function coachAcquireMic(){
  if (coachAcquirePending) return coachAcquirePending;
  coachAcquirePending = coachAcquireMicInner().finally(() => { coachAcquirePending = null; });
  return coachAcquirePending;
}
async function coachAcquireMicInner(){
  // One mic owner at a time: the rail/module recorder holds a plain
  // {audio:true} stream (all processing on) — stop it before opening this
  // processing-off stream, or two sessions with conflicting constraints
  // share the device and the recorder captures the game's reference tones.
  // Covers every coachAcquireMic call site (games included), not just
  // coachOpen's own stopAnyRec.
  if (typeof stopAnyRec === 'function') stopAnyRec();
  coachMicFailName = '';
  try {
    /* voiceIsolation: ChromeOS (and Chrome on newer platforms) can run a
       speech-only filter on the built-in mic, which treats a held guitar
       note as noise to remove. Asked off by name; a browser that doesn't
       know the constraint ignores it. */
    coachStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false,
               voiceIsolation: false },
      video: false
    });
  } catch(e) {
    coachMicFailName = (e && e.name) || 'Error';
    return false;
  }
  // getUserMedia already succeeded and coachStream is live at this point —
  // if any node construction below throws (e.g. a browser's audio-context
  // limit after many opens/closes in one session), fall through to the catch
  // and release the stream rather than leaving the mic hot with no caller
  // able to retry (coachAcquireMic has no try/catch around this call).
  try {
    coachCtx = new (window.AudioContext || window.webkitAudioContext)();
    const src = coachCtx.createMediaStreamSource(coachStream);
    // Boost quiet mics (Chromebooks especially) BEFORE any thresholding —
    // see COACH_MIC_GAIN's comment for why a fixed gain beats re-enabling AGC.
    const gainNode = coachCtx.createGain();
    gainNode.gain.value = COACH_MIC_GAIN;
    const hp = coachCtx.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 70; hp.Q.value = 0.7;
    const lp = coachCtx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1500; lp.Q.value = 0.7;
    coachAnalyser = coachCtx.createAnalyser();
    coachAnalyser.fftSize = COACH_FFT;
    coachAnalyser.smoothingTimeConstant = 0;
    src.connect(gainNode); gainNode.connect(hp); hp.connect(lp); lp.connect(coachAnalyser);
    coachFrameBuf = new Float32Array(COACH_FFT);
    // Safari creates a context `suspended` when construction happens after an
    // awaited getUserMedia — the user-gesture window has already closed by
    // then. A suspended context's analyser reads all zeros: RMS 0, no onsets,
    // no pitch, every take reports "couldn't hear." Chrome credits the page's
    // earlier gesture and is unaffected either way.
    if (coachCtx.state !== 'running'){
      try { await coachCtx.resume(); } catch(e){}
    }
    // Belt-and-suspenders: Safari can also suspend a live context on an audio
    // route change (AirPods connecting/disconnecting mid-session).
    coachCtx.onstatechange = () => {
      if (coachCtx && coachCtx.state === 'suspended') coachCtx.resume().catch(()=>{});
    };
  } catch(e) {
    coachMicOff();
    coachMicFailName = 'setup';
    return false;
  }
  window.coachMicLive = true;   // cleared in coachMicOff — set/clear live in ONE pair
  return true;
}

/* Re-resume at every check start, not just at acquisition — covers the same
   Safari route-change suspension as coachAcquireMicInner's statechange
   listener, for the case where it fires between checks rather than during
   one. Silent on failure; the mic-level chip is what surfaces a still-dead
   context to the student. */
async function coachEnsureRunning(){
  if (coachCtx && coachCtx.state !== 'running'){
    try { await coachCtx.resume(); } catch(e){}
  }
}

/* A stale caller (its card/panel closed during the permission prompt) must
   not tear down the stream directly — a newer session may have adopted it via
   the shared single-flight acquisition. Defer one tick: if nothing is
   actively listening by then, the stream is orphaned and gets released. */
function coachReleaseMicIfIdle(){
  setTimeout(() => {
    const active = (coach && (coach.phase === 'countin' || coach.phase === 'listening')) ||
                   fretRunning || (cc && cc.micOn) || (sr && sr.micOn) || (rn && rn.micOn) ||
                   (nr && nr.micOn) || psgRunning ||
                   (typeof ncMicActive === 'function' && ncMicActive());   // Note Call (app.js)
    if (!active) coachMicOff();
  }, 0);
}

/* One analyser read per frame, shared by all three loops (they're mutually
   exclusive). Reuses a single buffer — a fresh 16KB Float32Array per rAF
   frame is real GC pressure on a Chromebook. Returns the RMS of the newest
   ~21ms; the samples stay in coachFrameBuf for the pitch detector.
   Also computes the RMS of the first-difference signal (coachHfRms): a pick
   attack is broadband, so it jumps in this channel even while the PREVIOUS
   string is still ringing — where the full-band RMS barely moves. That
   ringing bed is exactly a scale climb, so the coach's onset detector
   checks both channels.

   CATCH-UP (2026-10-07, Chromebooks). The levels used to come from the
   newest 1024 samples only. At 60 fps that is every sample; on a busy
   classroom Chromebook frames arrive 30–80 ms apart, so most of the audio
   between two frames was never looked at — a short pick attack that fell
   in the gap left no onset at all, and one that was caught was stamped
   with the frame's time, up to a whole frame late. Now every 1024-sample
   window that ENDS inside the audio that arrived since the last read is
   measured (hop 512), the frame reports the loudest of them, and
   coachOnsetAt is the moment the jump arrived rather than the moment the
   frame ran. At 60 fps there is one window and nothing changes. A gap
   longer than COACH_CATCHUP_MAX_MS means the caller wasn't reading (a
   game's listen-to-me phase, a paused loop) — that old audio is not
   scanned, or a game's own reference tone would read as a pluck.
   One limit under that: the analyser only holds COACH_FFT samples (about
   85 ms at 48 kHz), so a gap between ~85 and 150 ms (a frame rate under
   ~12 fps) is scanned only as far back as the buffer still reaches — the
   start of that gap is already gone. The loop stops at the buffer's start
   rather than reading past it. */
const COACH_LVL_WIN = 1024, COACH_LVL_HOP = 512;
const COACH_CATCHUP_MAX_MS = 150;
let coachHfRms = 0;
let coachBgRms = 0, coachBgPrev = 0;
let coachOnsetAt = 0;          // performance.now() time the frame's jump arrived
let coachReadCtx = null, coachReadCtxT = 0;
function coachReadFrame(){
  coachAnalyser.getFloatTimeDomainData(coachFrameBuf);
  const buf = coachFrameBuf, L = buf.length, N = COACH_LVL_WIN;
  const sr = coachCtx.sampleRate, ct = coachCtx.currentTime;
  const nowT = performance.now();
  let fresh = 0, cold = true, gapMs = 16.667;
  if (coachReadCtx === coachCtx){
    gapMs = (ct - coachReadCtxT) * 1000;
    if (gapMs > 0 && gapMs <= COACH_CATCHUP_MAX_MS) fresh = Math.round(gapMs / 1000 * sr);
    cold = gapMs > 1000;
  }
  coachReadCtx = coachCtx; coachReadCtxT = ct;
  /* The easings follow the audio that actually went by, capped at 1 s —
     separately from the catch-up scan's 150 ms limit. Until 2026-10-08 a
     gap over 150 ms fell back to the 60 fps step (18%), so a 160 ms stall
     just after a pluck left the smoothed level at a third of the note and
     the next frame fired the phantom second onset again; and a frame with
     no new audio (gap 0) eased as if 16.7 ms had passed. */
  const dt = Math.max(0, Math.min(gapMs, 1000));
  coachSmoothA = 1 - Math.pow(0.82, dt / 16.667);
  const bgA = 1 - Math.pow(0.5, dt / 400);
  // Window ends, newest first: always the newest; older ones only while
  // they still end a hop past the previous read's newest window (so a
  // 60 fps frame, whose fresh audio the newest window already covers,
  // reads exactly one) and start inside the buffer.
  let rms = 0, hf = 0;
  const wins = [];
  for (let end = L; end === L || (end > L - fresh + COACH_LVL_HOP && end - N >= 1); end -= COACH_LVL_HOP){
    let sum = 0, dsum = 0;
    for (let i = end - N; i < end; i++){
      const v = buf[i];
      sum += v * v;
      const d = v - buf[i - 1];
      dsum += d * d;
    }
    const w = { end, rms: Math.sqrt(sum / N), hf: Math.sqrt(dsum / N) };
    wins.push(w);
    if (w.rms > rms) rms = w.rms;
    if (w.hf > hf) hf = w.hf;
  }
  // Arrival = the OLDEST window already near the frame's peak — where the
  // jump began, not where it topped out.
  let arrive = wins[0];
  for (let k = wins.length - 1; k >= 0; k--){
    const w = wins[k];
    if (w.rms >= rms * 0.8 || w.hf >= hf * 0.8){ arrive = w; break; }
  }
  coachOnsetAt = nowT - (L - arrive.end) / sr * 1000;
  coachHfRms = hf;
  // The room's level, slow (half-life 400 ms) — coachSettlePitch compares a
  // pluck against the value from BEFORE the pluck's own frame.
  /* A cold start (first read on this mic, or after a second or more of
     not reading) seeds the room level from this frame: starting from 0 —
     or from an old session's level — made the first pluck in a loud room
     "stand out" against nothing, so a neighbour's note could settle as the
     student's wrong note and end a Simon run. */
  if (cold) coachBgRms = rms;
  coachBgPrev = coachBgRms;
  coachBgRms += (rms - coachBgRms) * bgA;
  coachUpdateMicLevel(rms);
  if (micRec && micRec.live) micRecFrame(nowT);
  return rms;
}

/* The onset detectors' smoothed levels (smoothRms / smoothHf on each
   loop's state) ease toward the frame's level. That easing was 18% PER
   FRAME — tuned at 60 fps, where the level has settled ~140 ms after a
   pluck. At a Chromebook's 20 fps it was still under half the note's level
   when the refractory window ran out, so the same ringing note fired a
   SECOND onset ~200 ms later — and in the Listening Coach that phantom took
   the next note's slot, so every note after it was graded against the
   wrong answer (found 2026-10-07 by running the real Coach at 20 fps).
   Now the easing is per unit of TIME: 18% per 16.7 ms, whatever the frame
   rate — identical at 60 fps. */
let coachSmoothA = 0.18;
function coachSmooth(st, rms, hf){
  st.smoothRms += (rms - st.smoothRms) * coachSmoothA;
  st.smoothHf += (hf - st.smoothHf) * coachSmoothA;
}

/* The mic hears a note after it is played — the device's input path, plus
   the speaker delay on the count-in click the student is playing along to.
   Classroom Chromebooks measured 40–120 ms. Default 50 (2026-10-07): the
   70 confirmed at school on 2026-07-28 also covered the frame lag the old
   once-per-frame reader added (~15–35 ms at Chromebook frame rates, by
   simulation), which coachReadFrame's catch-up no longer has. One number per MACHINE: Note Runner's slider sets it
   (nrMicOffset, localStorage) and every beat-graded flow reads it here. */
function coachMicLatencyMs(){ return nrOffset(); }

/* YIN readings for every analyser window that ends after `sinceT` + 40 ms
   and no earlier than `minEndT` (both performance.now() times), oldest
   first. A 60 fps frame yields at most one — the old one-reading-per-frame
   behaviour; a slow Chromebook frame holds two unread windows (48 kHz) and
   gets both, so a 3-reading consensus doesn't take 3 slow frames. Each
   entry is { t: window end, midi: number|null } — callers advance their
   spacing clock to t whether or not a pitch was found, as before.
   `clarity` is coachDetectPitch's gate — or an array of gates, strictest
   first, where a window the first finds no pitch in is read again at the
   next (coachDetectPitch walks the list itself). Only Riff Runner's
   power-chord listeners pass an array (RNW_POWER_CLARITY): Riff Runner's
   Wait Mode, Note Call's power mode and Power Chord Switch; every other
   caller passes a number or nothing. */
function coachPitchReadings(sinceT, minEndT, clarity){
  const out = [];
  const buf = coachFrameBuf, L = buf.length, sr = coachCtx.sampleRate;
  const W = Math.min(L, sr > 60000 ? 4096 : 2048);
  const step = Math.ceil(0.040 * sr);
  const nowT = performance.now();
  for (let end = L; end - W >= 0; end -= step){
    const endT = nowT - (L - end) / sr * 1000;
    if (endT < minEndT || endT - (sinceT || 0) < 40) break;
    const f = coachDetectPitch(buf, sr, clarity, end);
    out.unshift({ t: endT, midi: f > 0 ? 69 + 12 * Math.log2(f / 440) : null });
  }
  return out;
}

/* LOUD ROOMS (2026-10-07). With twenty guitars going, YIN locks onto
   whichever note is loudest in each window, so a student's readings come
   back as their own note mixed with their neighbours'. Asking "do the
   readings agree on ONE note?" then fails a student who played the right
   thing. But every listener here already knows the note it is waiting
   for, so it can also ask "is THAT note a big share of what was heard?" —
   the same vote the chord checks have used since July.

   The vote counts the EXACT note or the octave above it (the 2nd harmonic
   a Chromebook mic hears on low strings) — never the pitch class. Swept in
   simulation with other guitars 40% / 70% as loud as the student, 160
   notes each: right notes 148 -> 154 and 92 -> 106; a note a half step off
   passed 3 and 6 more times than before (of 160); a note a fifth or a
   fourth off, no more than before. Counting the pitch class instead
   passed far more wrong notes a fifth off (YIN reads those an octave
   below the target), and a lower bar than half passed more half-steps.
   A wrong verdict still needs the readings to agree on the wrong note.

   coachTargetShare: fraction of `readings` (fractional midis) within 0.6
   semitone of any of the exact midis in `targets`. */
const COACH_VOTE_SHARE = 0.5;
/* How far off a reading may sit and still count for the target. A loud
   room pulls a student's note sharp or flat (it beats against a
   neighbour's nearby note), and some right notes still fail on readings
   0.6–0.8 semitone off. 0.75 was tried in the in-page Note Runner test
   and made no measurable difference, so it stays at the safer 0.6 until
   real classroom recordings say otherwise. */
const COACH_VOTE_TOL = 0.6;
function coachTargetShare(readings, targets){
  if (!readings.length || !targets || !targets.length) return 0;
  let hit = 0;
  for (let k = 0; k < readings.length; k++){
    const r = readings[k];
    if (targets.some(m => Math.abs(r - m) <= COACH_VOTE_TOL)) hit++;
  }
  return hit / readings.length;
}

/* The one-pluck-one-answer listeners (Note Hunt, Pentatonic Simon Guitar
   Hero, Riff Runner's Wait Mode, Note Call in app.js) all settle a note the
   same way: readings from COACH_ATTACK_SKIP after st.attackT, >= 40 ms
   apart, the last five kept. The note is settled when
     · 3 of those 5 sit on one of `targets` (exact midis — the octave still
       matters to every judge) — the loud-room vote above; or
     · the LATEST FOUR agree within 0.6 semitone — the note, right or
       wrong. One more than the vote needs on purpose: in a loud room a
       neighbour's note can hold for three readings, and a wrong verdict
       costs the student a try (and ends a Simon run). Before 2026-10-07
       EVERY kept reading had to agree, so one stray reading blocked the
       answer until five clean ones had followed it.

   LOUD ROOMS, part 2. These loops have no onset detector of their own:
   the first frame over the gate after silence was the pluck. In a loud
   room the level never falls back under the gate, so the "pluck" was
   whatever the room was doing when listening began, and the readings
   that settled were a neighbour's note — a "wrong note" hint for a
   student who hadn't played yet. So, in here:
     · a new onset (coachOnsetTick, the same detector as the Coach)
       restarts the readings at that pluck — and the callers run it on the
       frames they aren't listening too (coachIdleTick), so a new pluck
       also ends their wait for silence;
     · a NON-target note is only reported when its pluck stood out — at
       least COACH_STANDOUT x the room's level just before it
       (coachBgPrev). The student's guitar, nearest the mic, does; a
       neighbour's mostly doesn't. A quiet room clears it by miles;
     · the target vote has a lower bar of its own, COACH_STANDOUT_TARGET:
       without one, a neighbour who happened to play the target note
       answered for a student who had played a wrong one.
   Tuned 2026-10-08 with tools/mic-sim/tune.mjs (synthetic guitars, not
   real ones — 240 prompts per cell at 20 fps; a quiet room, one neighbour
   at half the student's level plucking every 150–550 ms, and a classroom
   of 6–10 neighbours at 0.08–0.35 of the student's level over a din).
   Columns: right notes counted first time / false "wrong note" hints on
   right notes / wrong notes counted right:
                          quiet          one neighbour   classroom
     no gating            100 / 0 / 0    13 / 86 / 17    69 / 18 / 5
     2026-10-07 code       93 / 0 / 0    50 / 13 / 15    67 /  5 / 2
     now (3x and 2x)      100 / 0 / 0    42 /  3 / 0     76 /  0 / 0
     now, at 60 fps       100 / 0 / 0    41 /  1 / 0     76 /  1 / 0
   (The quiet-room and classroom gains are mostly coachIdleTick; the
   bars below are what took wrong-counted-right to 0.) The cost: next to
   one loud neighbour a few right notes wait for a clearer pluck, and a
   wrong note there usually gets no "wrong note" hint at all (5% caught,
   against 36% before) — the game just keeps listening. At 2.5x / 1.75x
   the classroom read 81 / 2 / 1. Removed in the same pass: a learned "how
   loud are this student's right notes" level (COACH_MY_FRAC, a 30 s fade,
   a pull-down), which with these bars changed nothing in any room except
   costing a student who played softer after a loud note a few percent —
   the lockout a review had traced to it.
   `rms` is this frame's level; `floorT` (optional) is the earliest time a
   pluck may be dated, for a game that has just played its own note.
   `clarity` (optional) goes to coachPitchReadings — left out, the 0.22
   single-note gate; only the power-chord listeners pass one
   (RNW_POWER_CLARITY: Riff Runner's Wait Mode, Note Call's power mode).
   Returns that midi, or null while it's unsettled. st carries
   { attackT, lastPitchT, readings }; this adds its own fields. */
const COACH_STANDOUT = 3;
const COACH_STANDOUT_TARGET = 2;
/* The onset detector the one-note listeners share. Returns true when this
   frame holds a new pluck (dated st.onsetT). `detect` false = only keep
   the smoothed levels current — callers run this on every frame they read,
   listening or not, so the level a new pluck is compared against is the
   room's level NOW, not whatever it was the last time they listened. */
function coachOnsetTick(st, rms, floorT, detect){
  if (st.smoothRms == null){ st.smoothRms = rms; st.smoothHf = coachHfRms; st.onsetT = -1e9; }
  const at = Math.max(coachOnsetAt, floorT || 0);
  let hit = false;
  if (detect !== false && at - st.onsetT > COACH_ONSET_REFRACT &&
      ((rms > CHK_ONSET_FLOOR && rms > st.smoothRms * CHK_ONSET_RATIO) ||
       (coachHfRms > CHK_HF_FLOOR && coachHfRms > st.smoothHf * CHK_HF_RATIO))){
    st.onsetT = at;
    hit = true;
  }
  coachSmooth(st, rms, coachHfRms);
  return hit;
}
/* The frames a one-note listener is NOT settling a pluck (waiting for the
   last note to die, a cooldown, under the gate): keep the onset detector
   current, and let a NEW pluck end the wait for silence. In a loud room the
   level never falls under the gate, so "wait for silence" used to mean
   "wait the full 2.5 s" — and a right note played in that time had died
   down by the time listening came back. */
function coachIdleTick(st, rms, floorT){
  const now = performance.now();
  if (coachOnsetTick(st, rms, floorT, now >= (floorT || 0)) && st.needSilence){
    st.needSilence = false;
    st.attackT = st.onsetT; st.readings = [];
    st.seenAttackT = null;
  }
}
function coachSettlePitch(st, targets, rms, floorT, clarity){
  if (coachOnsetTick(st, rms, floorT)){
    st.attackT = st.onsetT; st.readings = [];
    st.seenAttackT = null;               // a new pluck: measure it below
  }
  if (st.seenAttackT !== st.attackT){    // first frame of this pluck (ours or the caller's)
    st.seenAttackT = st.attackT;
    st.attackLvl = rms; st.preBg = coachBgPrev;
  } else if (rms > st.attackLvl) st.attackLvl = rms;
  const standsOut = st.attackLvl >= COACH_STANDOUT * st.preBg;
  const targetStandsOut = st.attackLvl >= COACH_STANDOUT_TARGET * st.preBg;
  const rs = coachPitchReadings(st.lastPitchT, st.attackT + COACH_ATTACK_SKIP, clarity);
  for (let k = 0; k < rs.length; k++){
    st.lastPitchT = rs[k].t;
    if (rs[k].midi == null) continue;
    st.readings.push(rs[k].midi);
    if (st.readings.length > 5) st.readings.shift();
    const r = st.readings;
    if (targets && targetStandsOut) for (let j = 0; j < targets.length; j++){
      if (r.filter(x => Math.abs(x - targets[j]) <= 0.6).length >= 3) return targets[j];
    }
    if (standsOut && r.length >= 4){
      const l4 = r.slice(-4);
      if (Math.max.apply(null, l4) - Math.min.apply(null, l4) < 0.6) return Math.round(tunerMedian(l4));
    }
  }
  return null;
}

/* Peripheral 3-bar level chip next to the mic indicator, driven off the RMS
   this frame already computed (no extra analyser read). A flat chip during
   a take means no signal is reaching the analyser at all — a suspended
   context, a muted device, or Voice Isolation stripping the guitar out —
   versus a moving chip with a "couldn't hear" verdict, which means the
   student really was playing quietly. Segment thresholds are well below the
   pitch/onset gates on purpose: this is a presence indicator, not a
   loudness judgement. */
let coachMicLevelLast = -1;
function coachUpdateMicLevel(rms){
  const el = document.getElementById('coach-mic-level');
  if (!el) return;
  const level = rms >= 0.01 ? 3 : rms >= 0.003 ? 2 : rms >= 0.001 ? 1 : 0;
  if (level === coachMicLevelLast) return;
  coachMicLevelLast = level;
  const bars = el.children;
  for (let i = 0; i < bars.length; i++) bars[i].classList.toggle('lit', i < level);
}

/* Shared count-in: schedules the beeps + count digits on state's beat
   grid, sets state.listenStart, and fires onGo after the last beat.
   `beats` clicks (optional, 4 by default), the last one high = "go". Power
   Chord Switch and Change Up pass ccCountInBeats (2 below 60 BPM, 2026-11-09);
   the Listening Coach, Strum Radar and Note Runner count 4. The digits are
   the END of a bar: 2 clicks show 3, 4.

   The beeps are on the AUDIO clock (2026-10-12). They were four setTimeouts,
   and the graders (the Coach, Change Up, Strum Radar, Note Runner) time the
   student against listenStart — so a timeout that fired late on a busy
   Chromebook played a beep late, the student's pulse followed the beep, and
   the whole take sat late against a grid they never heard. Now each beep is
   handed to Web Audio COACH_COUNTIN_AHEAD before it is due, at its exact
   time, so a stall shorter than that moves nothing. listenStart is still a
   performance.now() time, as every caller expects: the audio-clock moment
   one beat after the last click, converted through one (performance.now(),
   currentTime) pair read back to back — the clock bridge Strum Hero uses.
   Beat 1 is queued COACH_COUNTIN_LEAD ahead so it is never in the past.
   Each beep is queued just in time rather than all up front so that
   clearing state.timeouts (every stop path does) still cancels the beeps
   not yet queued — at most the one due within COACH_COUNTIN_AHEAD can
   still sound. A context that isn't running yet (its clock stands still)
   takes the timer path this replaced. */
const COACH_COUNTIN_LEAD = 0.1, COACH_COUNTIN_AHEAD = 0.2;   // seconds
/* A RECORDED take (micRec live) waits longer for its first beep. The
   capture's first buffers are digital silence: 43-118 ms of exact zeros at
   the start of every 2026-10-16 Chromebook take, with stray zero runs to
   ~280 ms — and the first beep, 0.1 s after micRecStart plus ~140 ms of
   speaker delay, fell inside it, so no recording ever held all four beeps
   and the eval could not measure the mic delay (teacher.js micEvalTake
   now uses beeps 2-4). 0.4 s puts beep 1 past the silence with room to
   spare. Takes that are not recorded keep 0.1 s. */
const COACH_COUNTIN_REC_LEAD = 0.4;
// beep() (app.js) with a start time: same voice, same envelope.
function coachBeepAt(ac, at, freq, dur){
  const o = ac.createOscillator(), g = ac.createGain();
  o.connect(g); g.connect(ac.destination);
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.4, at);
  g.gain.exponentialRampToValueAtTime(0.001, at + dur);
  o.start(at); o.stop(at + dur);
}
function coachCountIn(state, countElId, onGo, beats){
  const n = Number.isInteger(beats) && beats >= 1 && beats <= 4 ? beats : 4;
  const ac = typeof getAudioCtx === 'function' ? getAudioCtx() : null;
  if (ac && ac.state === 'suspended') ac.resume();
  state.timeouts.forEach(clearTimeout);
  state.timeouts = [];
  const showCount = i => { const el = document.getElementById(countElId); if (el) el.textContent = String(4 - n + i + 1); };
  if (ac && ac.state === 'running'){
    const perf0 = performance.now(), ctx0 = ac.currentTime;
    const lead = micRec && micRec.live ? COACH_COUNTIN_REC_LEAD : COACH_COUNTIN_LEAD;
    const beat = state.beatMs / 1000, a0 = ctx0 + lead;
    state.listenStart = perf0 + (a0 + n * beat - ctx0) * 1000;
    for (let i = 0; i < n; i++){
      const at = a0 + i * beat, dueMs = (at - ctx0) * 1000;
      const queue = () => coachBeepAt(ac, at, i === n - 1 ? 990 : 660, 0.08);
      if (dueMs <= COACH_COUNTIN_AHEAD * 1000) queue();
      else state.timeouts.push(setTimeout(queue, dueMs - COACH_COUNTIN_AHEAD * 1000));
      state.timeouts.push(setTimeout(() => showCount(i), dueMs));
    }
    state.timeouts.push(setTimeout(onGo, state.listenStart - perf0));
    return;
  }
  const t0 = performance.now();
  state.listenStart = t0 + n * state.beatMs;
  for (let i = 0; i < n; i++){
    state.timeouts.push(setTimeout(() => {
      beep(i === n - 1 ? 990 : 660, 0.08);
      showCount(i);
    }, Math.round(i * state.beatMs)));
  }
  state.timeouts.push(setTimeout(onGo, Math.round(n * state.beatMs)));
}

/* Listening screen, 2026-07-26 redesign — ONE moving thing.
   Before: a red mic dot pulsing at its own 1.2s rate, a blue metronome dot
   pulsing at the tempo, a big note readout swapping every beat, and a
   12-chip strip recoloring as it graded — four animations competing, plus
   the page's copy of the same TAB right underneath the card's copy.
   Now: the TAB itself is the metronome. One green column steps across it,
   one column per beat, and darkens on the beat (the flash the metro dot
   used to carry); the big readout above just names the column the beat is
   sitting on. Chord mode gets the identical treatment with the chip strip
   as its lane. Per-note GRADING is no longer painted mid-play — it belongs
   to the report card, which still renders the full strip. */
function coachRenderListening(){
  const laneBody = coach.mode === 'melody'
    ? (coachTabHtml() || coachStripHtml())
    : coachStripHtml();
  coachBody().innerHTML =
    `${coachChordsHtml(coach.slots[0] && coach.slots[0].chordName)}
     <div class="coach-lane" id="coach-lane">
       ${coachLaneHeadHtml()}
       ${laneBody}
     </div>
     <div class="coach-lane-foot">
       <span class="rn-metro-status" id="coach-pulse-status">${t('coach.pulse.on')}</span>
     </div>
     <button type="button" class="tp-btn coach-stop" onclick="coachFinish()">&#x25A0; ${t('coach.done.button')}</button>`;
}

/* Moves the beat column and fires the one flash on the lane. Replaces the
   separate .metro-dot: the dot and the note readout were two things to
   watch, and students watched neither. */
function coachBeatRefresh(cur){
  if (!coach || !coach.card) return;
  coach.card.querySelectorAll('.coach-col').forEach(el => el.classList.remove('coach-col'));
  coach.card.querySelectorAll('.coach-lane [data-seq="' + cur + '"]')
    .forEach(el => el.classList.add('coach-col'));
  /* A melody TAB wider than its box would otherwise walk off the right edge
     as the beat column advances, leaving the player scrolling to find where
     the beat currently is. Follow it — one marker per column (the note
     button row), 'nearest' so it only moves once the column nears the edge
     rather than re-centering every beat. */
  const marker = coach.card.querySelector('.coach-lane .tab-note-btn[data-seq="' + cur + '"]');
  if (marker) marker.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
  if (coach.pulseMuted) return;   // steady player — the flash fades, the column stays
  const lane = document.getElementById('coach-lane');
  if (lane){ lane.classList.add('beat'); setTimeout(() => lane.classList.remove('beat'), 90); }
}

/* Big current/next readout — same pattern as Change Up: the player needs to
   see what's coming before its beat arrives, or the chip strip alone only
   reveals a change the instant it's due, which makes every hit late by
   reaction time (visual cues need lead time the way a metronome beep
   doesn't — you can't react to a beep in advance, but you CAN read an
   upcoming label). Covers both modes: chords show the chord name, melody
   shows the note name — melody didn't have this until a real-guitar test
   found the chip strip alone made it hard to play on the beat (2026-07-22). */
/* Chord diagrams for the coach card — visible from the count-in on, so the
   fretting hand can set up the first shape before beat 1 (same reason the
   melody TAB stays up during the count-in). */
function coachChordsHtml(curName){
  if (coach.mode !== 'chords') return '';
  const names = [];
  coach.slots.forEach(s => { if (s.chordName && names.indexOf(s.chordName) < 0) names.push(s.chordName); });
  return ccDiagramsHtml(names, curName, 'coach-dia', coach.chordShapes);
}

/* Lane header: what the beat column is sitting on, and what's coming.
   Always rendered now (the old coachNowHtml bailed out on single-chord and
   single-note drills, which left those checks with no readout at all).
   The lead time matters — you can react to a beep as it happens, but a
   visual cue you only see the instant it's due makes every hit late. */
function coachLaneHeadHtml(){
  const first = coach.slots[0];
  const hide = coach.mode === 'melody' && coach.hideNames;
  const cur = coach.mode === 'chords' ? (first.chordName || first.label) : (hide ? '' : first.label);
  const nxt = coach.mode === 'chords' ? coachNextChord(0) : (hide ? null : (coach.slots[1] ? coach.slots[1].label : null));
  return `<div class="coach-lane-head">
            <span class="coach-lane-now" id="coach-chord">${escHtml(cur)}</span>
            <span class="coach-lane-lbl">${t(coach.mode === 'chords' ? 'coach.lane.strumNow' : 'coach.lane.playNow')}</span>
            <span class="coach-lane-next" id="coach-next">${nxt ? t('games.common.next') + ' ' + escHtml(nxt) : ''}</span>
          </div>`;
}

function coachNextChord(cur){
  const name = coach.slots[cur].chordName;
  for (let i = cur + 1; i < coach.slots.length; i++){
    if (coach.slots[i].chordName !== name) return coach.slots[i].chordName;
  }
  return null;
}

function coachStripHtml(){
  /* data-seq mirrors the TAB's beat addressing so the listening lane can
     light chord-mode's strip with the exact same column code. */
  return `<div class="coach-strip">` + coach.slots.map((s, i) =>
    `<span class="coach-chip ${coachChipClasses(s)}" id="coach-chip-${i}" data-seq="${i}" title="${escAttr(coachChipTitle(s))}">${escHtml(s.label)}</span>`
  ).join('') + `</div>`;
}

/* A chip's classes: its pitch verdict, plus `loose` when the note counted
   but sat off the pulse (dashed outline — still green, still correct). */
function coachChipClasses(s){
  return s.state + (s.loose && (s.state === 'ok' || s.state === 'oct') ? ' loose' : '');
}

function coachChipTitle(s){
  const base = s.chordName || s.label;
  return s.loose && (s.state === 'ok' || s.state === 'oct')
    ? base + ' — ' + t('coach.chip.loose') : base;
}

function coachChipRefresh(i){
  /* Grading colors are the REPORT's job now (2026-07-26): recoloring chips
     under the player mid-take was the third competing animation on the
     listening screen, and it fought the beat column for attention. The
     slot's state is still recorded — coachRenderReport re-renders the whole
     strip from it a beat later. */
  if (coach.phase === 'listening') return;
  const el = document.getElementById('coach-chip-' + i);
  if (el) el.className = 'coach-chip ' + coachChipClasses(coach.slots[i]);
}

/* Reflects coach.pulseMuted into the status text — fires once, right when
   the streak crosses the fade threshold (same pattern as Riff Runner's
   rnMetroStatusRefresh; no need to poll it every frame). */
function coachPulseStatusRefresh(){
  const el = document.getElementById('coach-pulse-status');
  if (!el || !coach) return;
  el.textContent = t(coach.pulseMuted ? 'coach.pulse.off' : 'coach.pulse.on');
  el.classList.toggle('rn-metro-off', !!coach.pulseMuted);
}

/* How many CONSECUTIVE tight-timing hits (see COACH_PULSE_TIGHT_FRAC) before
   the visual beat pulse fades out — same spirit as Riff Runner's
   RN_METRONOME_FADE_COMBO (8), but scaled to the drill length: a short
   chord/note check can have far fewer slots than a Riff Runner round (as
   few as 2 — see coachMinHeard's comment), so a flat 8 could be literally
   unreachable. Roughly half the drill, floored at 3 (mirrors coachMinHeard's
   reasoning), capped at Riff Runner's 8, and never above the slot count
   itself so the fade stays achievable even on the shortest drills. */
function coachPulseFadeThreshold(slotCount){
  return Math.min(slotCount, Math.max(3, Math.min(8, Math.ceil(slotCount * 0.5))));
}

/* When the listening window closes — the moment coachLoop stops the mic and
   grades what it heard. Three clocks; the take runs to whichever
   of them makes sense:

     · nominal — the last slot plus COACH_TAIL_BEATS of grace, measured on
       the ADAPTED grid (listenStart + gridOffset). gridOffset is the
       matcher's running estimate of how far behind (or ahead) the student
       actually is, so a player dragging half a beat gets that half beat
       back at the end instead of having it eaten.
     · stall — the mic stays open COACH_STALL_BEATS past the last note that
       MATCHED a slot. Someone still working through the drill is still
       playing it; ending on them is exactly the "it cut me off" complaint.
       Keyed to a matched event, not a raw onset, so a noisy classroom
       can't hold the window open by itself.
     · hard — a backstop at COACH_MAX_LISTEN_X × the nominal window, in case
       something keeps feeding matches forever.

   The stall clock can only be pushed once per slot (every match fills one,
   and a full board ends the take through allHit), so the extension is
   bounded even before the backstop. Nothing here softens the grading: the
   tempo criterion reads raw event times, so a student who dragged still
   gets told they dragged — they just get graded on the whole take. */
function coachListenDeadline(){
  const nominalLen = (coach.slots.length + COACH_TAIL_BEATS) * coach.beatMs;
  const nominal = coach.listenStart + coach.gridOffset + nominalLen;
  const stall   = coach.lastMatchT ? coach.lastMatchT + COACH_STALL_BEATS * coach.beatMs : 0;
  const hard    = coach.listenStart + nominalLen * COACH_MAX_LISTEN_X;
  return Math.min(hard, Math.max(nominal, stall));
}

/* ══════════ Detection loop ══════════ */

function coachLoop(){
  if (!coach) return;
  if (!coachAnalyser){ coachInterrupt(t('coach.interrupt.micLost')); return; }   // mic was torn down by something other than coachInterrupt/coachClose — don't freeze mid-take
  if (!coach.card.isConnected){ coachStopAll(); return; }   // set re-rendered under us

  // No notes to score during the count-in, but keep the level trackers
  // warm (room noise, count-in beep leakage) so beat 1 starts against a
  // settled baseline — from a cold zero, the very first frame of mic hiss
  // read as an onset.
  if (coach.phase !== 'listening'){
    if (coach.phase === 'countin'){
      const r = coachReadFrame();
      coachSmooth(coach, r, coachHfRms);
    }
    coachRaf = requestAnimationFrame(coachLoop);
    return;
  }
  const now = performance.now();
  const rms = coachReadFrame();
  const at = coachOnsetAt;

  {
    /* Onset: a fast jump over the smoothed level, past an absolute floor,
       outside the refractory window. Two channels: full-band RMS (clean,
       separated notes) OR the HF pick-attack channel (a new pluck over a
       still-ringing string — a scale climb — barely moves the full-band
       level, but the attack is loud and broadband in the difference signal).
       Two times per event: `at`, when the sound reached the analyser (the
       clock the attack skip and the tail run on), and `t`, when the student
       played it — `at` minus the device's mic delay — which is what the
       beat grid scores. Before 2026-10-07 the Coach scored arrival time, so
       a Chromebook player who was dead on the click read as late. */
    const hf = coachHfRms;
    if (at - coach.lastOnsetT > COACH_ONSET_REFRACT &&
        ((rms > CHK_ONSET_FLOOR && rms > coach.smoothRms * CHK_ONSET_RATIO) ||
         (hf > CHK_HF_FLOOR && hf > coach.smoothHf * CHK_HF_RATIO))){
      coach.lastOnsetT = at;
      /* Events OVERLAP (2026-10-07): a new onset no longer closes the one
         before it. In a loud room a neighbour's pluck lands a moment after
         the student's and used to cut the student's note off after one or
         two readings — "couldn't hear it" for a note played well. Each
         event keeps its own COACH_EVENT_TAIL; the readings feed every event
         still open. */
      coach.pendings.push({ t: at - coachMicLatencyMs(), at, readings: [] });
    }
    coachSmooth(coach, rms, hf);

    /* Pitch readings (trimmed YIN, ~every 40ms) feed the pending event —
       but not until the pick attack has left the analysis window: early
       windows still hold the scrape and the previous note, and those junk
       readings were poisoning the median on real takes. */
    /* Half the usual gate here: readings start after the attack, and a
       palm-muted or lightly-plucked note has already decayed by then — the
       consensus filter below keeps low-level junk from becoming a verdict. */
    if ((coach.pendings.length || coach.looks.length) && rms > COACH_PITCH_GATE * 0.5){
      /* Chords aren't cleanly periodic, so YIN's strict single-note clarity
         gate rejects most chord frames (they logged 0 pitch reads). A looser
         gate for chord mode lets it lock onto the dominant chord tone — which
         real data showed is reliably one of the chord's notes. Melody stays
         strict (accuracy matters when the exact note is the answer). */
      const ps = coach.pendings, lk = coach.looks;
      const from = Math.min(ps.length ? ps[0].at + COACH_ATTACK_SKIP : Infinity,
                            lk.length ? Math.min.apply(null, lk.map(L => L.at)) + COACH_EVENT_TAIL : Infinity);
      coachPitchReadings(coach.lastPitchT, from, coach.mode === 'chords' ? 0.55 : 0.22).forEach(r => {
        coach.lastPitchT = r.t;
        if (r.midi == null) return;
        ps.forEach(p => {
          if (r.t >= p.at + COACH_ATTACK_SKIP && r.t - p.at <= COACH_EVENT_TAIL) p.readings.push(r.midi);
        });
        coachLookFeed(lk, r.t, r.midi);
      });
    }
    while (coach.pendings.length && now - coach.pendings[0].at > COACH_EVENT_TAIL) coachFinalizeEvent();
    if (coach.looks.length) coachLookResolve(false);

    /* Beat pulse on the current slot — on the ADAPTED grid (listenStart +
       gridOffset), the same grid the scoring reads. On the rigid grid the
       highlight drifts away from the player as gridOffset follows their
       actual timing, so the visible chord change lags the strums it's
       grading. */
    const cur = Math.floor((now - coach.listenStart - coach.gridOffset) / coach.beatMs);
    if (cur !== coach.lastPulse && cur >= 0 && cur < coach.slots.length){
      coach.lastPulse = cur;
      coachBeatRefresh(cur);
      const chordEl = document.getElementById('coach-chord');
      if (chordEl){
        /* hideNames (sight-reading, e.g. ca-21): this per-beat DOM update is
           the third and biggest leak `1ce8d7a` (2026-09-25) missed — it
           printed every upcoming note name live as the piece played, on top
           of the Ready-screen and count-in leaks fixed above. Found
           2026-09-26. */
        const hide = coach.mode === 'melody' && coach.hideNames;
        const name = hide ? '' : (coach.mode === 'chords' ? coach.slots[cur].chordName : coach.slots[cur].label);
        if (chordEl.textContent !== name){
          chordEl.textContent = name;
          if (coach.mode === 'chords'){
            coach.card.querySelectorAll('.cc-dia').forEach(el => el.classList.remove('cur'));
            const dia = document.getElementById('coach-dia-' + name);
            if (dia) dia.classList.add('cur');
          }
        }
        const nextEl = document.getElementById('coach-next');
        if (nextEl){
          const nx = hide ? null : (coach.mode === 'chords' ? coachNextChord(cur) : (coach.slots[cur + 1] ? coach.slots[cur + 1].label : null));
          nextEl.textContent = nx ? t('games.common.next') + ' ' + nx
            : (hide ? '' : (coach.mode === 'chords' ? t('coach.lastChord') : t('coach.lastNote')));
        }
      }
    }

    /* Done? Everything matched, or the listening window (see
       coachListenDeadline) has closed — except never mid-note: an onset
       whose pitch readings are still being collected gets its full
       COACH_EVENT_TAIL before the take is graded, so the last note of a
       drill isn't scored off half a window. */
    /* A full board ends the take only once the last slot's window has
       passed: since a nearer event can take a slot over (coachMatchEvent),
       a neighbour's pluck that fills the last slot early must not end the
       take before the student's own last note arrives. Half a beat (where
       an event stops landing on the last slot) or half the window,
       whichever is longer, plus a frame for the onset to be seen. */
    const lastBeatT = coach.listenStart + coach.gridOffset + (coach.slots.length - 1) * coach.beatMs;
    const allHit = coach.slots.every(s => s.state !== 'pending') &&
      now - coachMicLatencyMs() > lastBeatT + Math.max(coachMatchWinMs(), coach.beatMs) * 0.5 + 60;
    // Only an event that could still land on a slot holds the take open —
    // in a loud room there is nearly always SOME neighbour's pluck pending.
    // ...and so does a second look still reading (at most COACH_LOOK_TAIL).
    const pendingEvent = coach.pendings.some(p => p.t <= lastBeatT + coachMatchWinMs()) || coach.looks.length > 0;
    if ((allHit || now > coachListenDeadline()) && !pendingEvent){
      coachFinish();
      return;
    }
  }
  coachRaf = requestAnimationFrame(coachLoop);
}

/* YIN, trimmed to the guitar's range: tau only up to ~sr/60Hz, so it's a
   fraction of the tuner's full scan — cheap enough for a Chromebook at 20Hz.
   `end` (default: the whole buffer) picks an older window for
   coachPitchReadings' catch-up.

   It stops as soon as the answer is known (2026-10-07): YIN takes the FIRST
   dip under `clarity` and walks down it, so every tau past the bottom of
   that dip was computed and never read. The result is identical; the cost
   falls with the pitch — a note on the B string needs about a fifth of the
   work it used to — which is frame time a Chromebook gets back for
   listening. Only a frame with no pitch at all still scans the whole range.

   `clarity` may be a list of gates, strictest first (coachPitchReadings):
   a window with no pitch at one gate is read at the next. d[] is filled
   only as far as a gate needs it and kept for the next one, so a pitchless
   window — where the first gate already scanned every tau — is not
   computed twice (2026-10-25). Same answer as one call per gate. */
let coachYinD = null;
function coachDetectPitch(buf, sampleRate, clarity, end){
  const tiers = Array.isArray(clarity) ? clarity : null;
  if (end == null) end = buf.length;
  // Window scales with sample rate: at 88.2/96kHz a fixed 2048 caps maxTau
  // below low E's 82Hz period — the whole 6th string became undetectable.
  const W = Math.min(end, sampleRate > 60000 ? 4096 : 2048);
  const start = end - W;
  const half = Math.floor(W / 2);
  const maxTau = Math.min(half - 1, Math.ceil(sampleRate / 60));
  if (!coachYinD || coachYinD.length < maxTau + 1) coachYinD = new Float32Array(maxTau + 1);
  const d = coachYinD;
  d[0] = 1;
  const tauMin = Math.max(2, Math.floor(sampleRate / 1400));
  let runSum = 0, filled = 0;  // d[1..filled] hold this window's values
  for (let q = 0, nq = tiers ? tiers.length || 1 : 1; q < nq; q++){   // [] reads once at the default gate, as before
    const gate = (tiers ? tiers[q] : clarity) || 0.22;   // YIN accept threshold; higher = more permissive (chords)
    let cur = -1;    // cur: bottom-so-far of the first dip under gate
    for (let tau = 1; tau <= maxTau; tau++){
      if (tau > filled){
        let s = 0;
        for (let i = 0; i < half; i++){
          const diff = buf[start + i] - buf[start + i + tau];
          s += diff * diff;
        }
        runSum += s;
        d[tau] = runSum ? s * tau / runSum : 1;
        filled = tau;
      }
      if (cur >= 0){
        if (d[tau] < d[cur]){ cur = tau; continue; }   // still descending
        break;                                          // d[cur + 1] is known: done
      }
      if (tau >= tauMin && d[tau] < gate) cur = tau;
    }
    if (cur < 0) continue;
    const x0 = d[cur - 1], x2 = cur < maxTau ? d[cur + 1] : d[cur];
    const denom = 2 * (2 * d[cur] - x0 - x2);
    const refined = denom ? cur + (x2 - x0) / denom : cur;
    const freq = sampleRate / refined;
    if (freq >= 60 && freq <= 1400) return freq;
  }
  return -1;
}

function coachFinalizeEvent(){
  const p = coach.pendings.shift();   // oldest first — events finalize in onset order
  if (!p) return;
  /* Consensus median: readings must agree (within ±0.6 semitone of the
     median) to be trusted. One harmonic slip or scrape reading can't drag
     a 2-reading median to a wrong note anymore — if the readings disagree,
     the honest answer is "unclear" (dim), never a wrong verdict. */
  let midi = null;
  if (p.readings.length >= 2){
    const med = tunerMedian(p.readings);
    const tight = p.readings.filter(r => Math.abs(r - med) <= 0.6);
    if (tight.length >= 2 && tight.length * 2 >= p.readings.length){
      midi = Math.round(tunerMedian(tight));
    }
  }
  /* Chord strums are polyphonic: the pitch detector legitimately hops
     between chord tones, so single-pitch consensus is the WRONG test there
     — real strums were failing it and scoring "unclear". Keep the raw
     pitch classes; the matcher scores them as a chord-tone vote. */
  const ev = { t: p.t, midi, devMs: null, slot: -1, readings: p.readings };
  if (coach.mode === 'chords'){
    ev.classes = p.readings.map(r => ((Math.round(r) % 12) + 12) % 12);
  }
  coach.events.push(ev);
  coachMatchEvent(ev);
  // Heard, matched, but too few readings to say: take a second look (COACH_LOOK_TAIL).
  if (coach.mode === 'melody' && ev.slot >= 0 && p.readings.length < 2 && coach.slots[ev.slot].state === 'dim'){
    const next = coach.listenStart + coach.gridOffset + (ev.slot + 1) * coach.beatMs + coachMicLatencyMs() - 60;
    const end = ev.slot + 1 < coach.slots.length ? Math.min(p.at + COACH_LOOK_TAIL, next) : p.at + COACH_LOOK_TAIL;
    if (end > p.at + COACH_EVENT_TAIL) coach.looks.push({ ev, at: p.at, end, own: p.readings, extra: [] });
  }
}

/* Melody: the readings didn't agree on one note, but the slot's note (or
   the octave above) is half or more of them — a neighbour's guitar was
   mixed in. See coachTargetShare for the loud-room numbers; two readings
   minimum, the same floor the consensus has. */
function coachMelodyVote(ev, slot){
  const rd = ev.readings || [];
  if (rd.length < 2 || !slot.midis) return false;
  const want = [];
  slot.midis.forEach(m => want.push(m, m + 12));
  return coachTargetShare(rd, want) >= COACH_VOTE_SHARE;
}

/* The second look (see COACH_LOOK_TAIL), shared by coachLoop and nrLoop.
   coachLookFeed adds a reading (arrival time t, midi) to every open look
   whose window it falls in — after the event's own tail, up to its end.
   coachLookPass: does the event's own readings plus the look's make the
   note? `targets` are exact midis; the octave above counts too. */
function coachLookFeed(looks, t, midi){
  for (let k = 0; k < looks.length; k++){
    const L = looks[k];
    if (t > L.at + COACH_EVENT_TAIL && t <= L.end) L.extra.push(midi);
  }
}
function coachLookPass(L, targets){
  const rd = (L.own || []).concat(L.extra);
  if (rd.length < COACH_LOOK_MIN) return false;
  const want = [];
  targets.forEach(m => want.push(m, m + 12));
  return coachTargetShare(rd, want) >= COACH_VOTE_SHARE;
}
// The Coach's side: resolve looks whose window has closed (all of them when `all`).
function coachLookResolve(all){
  const now = performance.now();
  coach.looks = coach.looks.filter(L => {
    if (!all && now <= L.end) return true;
    const s = coach.slots[L.ev.slot];
    // still this event's slot, still unclear: a nearer event may have taken it since
    if (s && s.hit === L.ev && s.state === 'dim' && coachLookPass(L, s.midis || [s.midi])){
      s.state = 'ok';
      s.secondLook = true;
      L.ev.look = L.extra.slice();
      coachChipRefresh(L.ev.slot);
    }
    return false;
  });
}

/* Fraction of an event's pitch readings that are tones of the slot's chord. */
function coachToneShare(ev, slot){
  const cls = ev.classes || [];
  if (!cls.length) return 0;
  return cls.filter(c => slot.classes.indexOf(c) >= 0).length / cls.length;
}

/* Greedy time-window matcher: an event lands on the nearest unfilled slot
   within ±1 slot of where the grid says it should be, if it falls inside
   coachMatchWinMs() of that slot. The grid offset then eases toward the
   student (EMA), so mild drift keeps matching — the drift itself is scored
   by the tempo criterion, local scatter by the timing one. A matched hit
   is judged on PITCH alone; how far off the beat it was only sets s.loose. */
function coachMatchEvent(ev){
  const rel = ev.t - coach.listenStart - coach.gridOffset;
  const guess = Math.round(rel / coach.beatMs);
  let best = -1, bestScore = Infinity;
  for (let i = Math.max(0, guess - 1); i <= Math.min(coach.slots.length - 1, guess + 1); i++){
    const s = coach.slots[i];
    let dev = rel - i * coach.beatMs;
    /* NEAREST WINS, not first (2026-10-07). The window is nearly a beat
       wide, so in a loud room a neighbour's pluck often lands in it before
       the student's — and the first event used to keep the slot. Run as
       the real Coach at 20 fps with other guitars at half the student's
       level, that marked 10 of 40 right notes right and 18 of 40 WRONG
       notes right. A later event closer to this slot's beat now takes it
       over, and the earlier one becomes an extra. Only the nearest beat:
       a filled neighbouring slot is never reopened.
       The distance is measured on the grid as it was BEFORE the incumbent
       nudged it (its gridDelta comes off first, as it will if this event
       wins — 2026-10-08 review).
       Pitch plays no part, on purpose. A review asked for "a wrong-sounding
       event never takes a slot from a right one" (so a neighbour's wrong
       note nearer the beat can't turn the student's right note "wrong");
       in the in-page loud-room test that let a neighbour's RIGHT note,
       landing first, keep the slot against the student's own nearer
       WRONG note — wrong notes counted right went 0/96 -> 38/96. A wrong
       note counted right is the worse mistake, so the nearest event wins. */
    const classOk = coach.mode === 'chords'
      ? coachToneShare(ev, s) >= 0.20
      : (ev.midi != null && s.classes.indexOf(((ev.midi % 12) + 12) % 12) >= 0) || coachMelodyVote(ev, s);
    if (s.state !== 'pending'){
      if (i !== guess || !s.hit) continue;
      dev += s.hit.gridDelta || 0;
      if (!(Math.abs(dev) < Math.abs(s.hit.devMs))) continue;
    }
    if (Math.abs(dev) > coachMatchWinMs()) continue;
    /* A slot that isn't the nearest beat only takes an event that IS its
       note. The window is nearly a beat wide, so an extra onset just after
       a matched note — a neighbour's pluck in a loud room, a phantom
       re-trigger — used to land on the NEXT slot as "wrong" and push every
       later note one slot along. A real early note still matches. */
    if (i !== guess && !classOk && coach.slots[guess] && coach.slots[guess].state !== 'pending') continue;
    const score = Math.abs(dev) + (classOk ? 0 : coach.beatMs * 0.6);
    if (score < bestScore){ bestScore = score; best = i; }
  }
  if (best < 0) return;   // unmatched onset — an extra strum between beats
  const s = coach.slots[best];
  if (s.hit){                       // taking over from a farther event
    coach.gridOffset -= s.hit.gridDelta || 0;
    s.hit.slot = -1; s.hit.devMs = null;
    s.hit = null;
  }
  const dev = ev.t - coach.listenStart - coach.gridOffset - best * coach.beatMs;
  ev.devMs = dev; ev.slot = best;
  if (coach.mode === 'chords'){
    /* Chord-tone vote: ok when ≥20% of the readings land on chord tones — a
       clean strum easily clears that, and a laptop mic hearing a full 6-string
       chord (where the detector locks onto whichever tone is loudest) rarely
       climbs higher. "Wrong" only on strong contrary evidence — the honest
       default for a murky strum is dim, never an accusation. */
    const share = coachToneShare(ev, s);
    const n = (ev.classes || []).length;
    if (n < 1) s.state = 'dim';
    else if (share >= 0.20) s.state = 'ok';
    else if (share <= 0.10 && n >= 3) s.state = 'wrong';
    else s.state = 'dim';
  }
  else if (ev.midi != null && (ev.midi === s.midi || s.classes.indexOf(((ev.midi % 12) + 12) % 12) >= 0)){
    s.state = (coach.mode === 'melody' && ev.midi !== s.midi &&
               Math.abs(ev.midi - s.midi) % 12 === 0) ? 'oct' : 'ok';
  }
  else if (coachMelodyVote(ev, s)) s.state = 'ok';       // loud room: the note was there
  else if (ev.midi == null) s.state = 'dim';            // heard it, pitch unclear
  else s.state = 'wrong';
  s.hit = ev;
  /* Counted, but not on the pulse: the slot keeps its pitch verdict (ok /
     oct / wrong — timing never turns a right note into a wrong one), and
     the strip marks it so the student can SEE which notes were the loose
     ones. Scored by coachScoreTiming, never by coachScorePitch. */
  s.loose = Math.abs(dev) > coachOnBeatMs();
  coach.lastMatchT = ev.t;      // feeds coachListenDeadline's stall clock
  ev.gridDelta = dev * 0.15;    // kept so a nearer event can take the slot back
  coach.gridOffset += ev.gridDelta;
  coachChipRefresh(best);

  /* Visual beat-pulse fade: a correct AND tight-timing hit extends the
     streak; anything else (wrong, dim, or matched-but-loose timing) resets
     it. Once muted, stays muted for the rest of THIS attempt (matches Riff
     Runner — coachStartCheck resets both fields for a fresh try). */
  const onTime = (s.state === 'ok' || s.state === 'oct') && Math.abs(dev) <= coach.beatMs * COACH_PULSE_TIGHT_FRAC;
  coach.pulseStreak = onTime ? coach.pulseStreak + 1 : 0;
  if (!coach.pulseMuted && coach.pulseStreak >= coachPulseFadeThreshold(coach.slots.length)){
    coach.pulseMuted = true;
    coachPulseStatusRefresh();
  }
}

/* ══════════ Finish & score ══════════ */

function coachFinish(){
  if (!coach || (coach.phase !== 'listening' && coach.phase !== 'countin')) return;
  coach.timeouts.forEach(clearTimeout);
  coach.timeouts = [];
  while (coach.pendings.length) coachFinalizeEvent();
  coachLookResolve(true);   // an early finish (Stop, the backstop): judge each look on what it has
  if (coachRaf){ cancelAnimationFrame(coachRaf); coachRaf = null; }
  const rec = micRecStop();
  coachMicOff();
  coach.slots.forEach((s, i) => { if (s.state === 'pending'){ s.state = 'miss'; coachChipRefresh(i); } });
  coach.phase = 'report';
  coachRenderReport();
  if (rec) micRecSave(rec, coachRecMeta());
}

/* What a saved Coach recording needs beside the audio (see micRecSave):
   every slot's scheduled time and verdict, every detected event. Event
   times are when the note was PLAYED (arrival minus micLatencyMs). */
function coachRecMeta(){
  const r2 = x => Math.round(x * 100) / 100;
  return {
    fields: { game: 'coach', coachMode: coach.mode, bpm: coach.bpm, beatMs: r2(coach.beatMs),
              gridOffsetMs: r2(coach.gridOffset || 0), eventTimes: 'played (arrival - micLatencyMs)' },
    expected: coach.slots.map((s, i) => ({ i, t: coach.listenStart + i * coach.beatMs,
      midi: s.midi == null ? null : s.midi, midis: s.midis || null, chord: s.chordName || null,
      label: s.label || '', verdict: s.state, loose: !!s.loose, secondLook: !!s.secondLook,
      devMs: s.hit && s.hit.devMs != null ? r2(s.hit.devMs) : null })),
    events: coach.events.map(ev => Object.assign({ t: ev.t, midi: ev.midi == null ? null : ev.midi, slot: ev.slot,
      readings: (ev.readings || []).map(r2) }, ev.look ? { look: ev.look.map(r2) } : {}))
  };
}

function coachMicOff(){
  micRecAbort();                // a capture still running here was never finished: drop it
  window.coachMicLive = false;
  if (coachStream) coachStream.getTracks().forEach(t => t.stop());
  if (coachCtx) coachCtx.close();
  coachStream = null; coachCtx = null; coachAnalyser = null;
  const micEl = document.getElementById('coach-mic');
  if (micEl) micEl.hidden = true;
}

/* ══════════ Consented mic recordings (2026-10-08) ══════════
   Real classroom audio to tune the listening on. The Coach footer promises
   nothing is recorded or uploaded, and for anyone who doesn't say yes that
   stays exactly true: nothing here runs unless
     · the teacher has turned collection on (config/class.micSampling —
       app.js reads it into micSampling) and fewer than its `max` takes
       have been saved (micTakesMeta/count, read into micTakesCount);
     · and this student, on this device, has answered "Yes, save it" to the
       one-time question (localStorage, keyed by uid so the next student on
       a shared Chromebook is asked for themselves — "No thanks" is never
       asked again).
   Then a Listening Coach take, a Note Runner round (not a Finger Gym
   round, which shares Note Runner's engine) or a Power Chord Switch game
   (not Change Up) records the RAW mic
   (before COACH_MIC_GAIN and the filters) from the count-in to the end, at
   most MICREC_MAX_SEC, with a visible "Recording this take for your
   teacher" label the whole time, and saves it to micTakes/<uid>-<mode>
   (one per student per game, the next take overwrites it). Teacher preview
   and the dev bypass never upload. Every way out of a take ends up in
   coachMicOff(), which tears the capture down. */
const MICREC_MAX_SEC = 30;
const MICREC_MIN_STOPPED_SEC = 10;   // a Stopped Power Chord Switch game is saved only after this many seconds of play, count-in not included (see ccFinish)
const MICREC_RATE = 24000;            // saved sample rate: 16-bit mono
const MICREC_CHUNK = 600000;          // bytes per chunks/{i} doc (Firestore's cap is 1 MB)
const MICREC_ASK_KEY = 'micRecConsent';
let micRec = null;                    // the capture in progress, or a stopped one awaiting save

function micRecAskKey(){ return MICREC_ASK_KEY + ':' + (currentUser ? currentUser.uid : ''); }
function micRecAnswer(){
  try { return localStorage.getItem(micRecAskKey()) || ''; }
  catch(e){ return 'no'; }            // can't remember an answer: never ask, never record
}
function micRecOpen(){
  return typeof micSampling !== 'undefined' && micSampling && micSampling.on === true &&
    typeof micTakesCount === 'number' && micTakesCount < (micSampling.max || 0) &&
    !IS_TEACHER_MODE && typeof currentUser !== 'undefined' && !!currentUser &&
    !(typeof isGatePreviewer === 'function' && isGatePreviewer());   // the teacher's own account, previewing
}
function micRecShouldAsk(){ return micRecOpen() && micRecAnswer() === ''; }
function micRecWanted(){ return micRecOpen() && micRecAnswer() === 'yes'; }

function micRecAskHtml(game){
  return `<div class="micrec-ask" role="group" aria-label="${escHtml(t('micrec.ask'))}">
       <p class="micrec-q">&#x1F399;&#xFE0F; ${escHtml(t('micrec.ask'))}</p>
       <div class="micrec-btns">
         <button type="button" class="coach-start" onclick="micRecConsent(true,'${game}')">${escHtml(t('micrec.yes'))}</button>
         <button type="button" class="tp-btn" onclick="micRecConsent(false,'${game}')">${escHtml(t('micrec.no'))}</button>
       </div>
     </div>`;
}
/* The answer is remembered, then the take the student pressed Start for
   goes ahead (still inside their click, so the mic prompt can open). */
function micRecConsent(yes, game){
  try { localStorage.setItem(micRecAskKey(), yes ? 'yes' : 'no'); } catch(e){}
  micRecFootSync();
  if (game === 'nr') nrStart(); else if (game === 'pw') ccStart(!!(cc && cc.pendingAgain)); else coachStartCheck();
}
function micRecBadgeHtml(){
  return `<div class="micrec-on" id="micrec-on"><span class="micrec-dot"></span>${escHtml(t('micrec.recording'))}<button type="button" class="micrec-stop" title="${escAttr(t('micrec.stopTitle'))}" onclick="micRecRevoke()">${escHtml(t('micrec.stop'))}</button></div>`;
}
/* A "yes" can be taken back: this take is dropped unsaved and none after it
   is recorded (the answer becomes "no", which is never asked again). */
function micRecRevoke(){
  try { localStorage.setItem(micRecAskKey(), 'no'); } catch(e){}
  micRecAbort();
  micRecFootSync();
}
function micRecFootSync(){
  // Only footers rendered with records=true (data-rec): the rest never record.
  document.querySelectorAll('.coach-foot-txt[data-rec]').forEach(el => { el.textContent = coachFootText(true); });
}

/* Start capturing. A separate source node off the raw stream, into a
   ScriptProcessor whose output goes to a zero gain — so nothing is heard
   and the listening chain is untouched. */
function micRecStart(mode){
  micRecAbort();
  if (!micRecWanted() || !coachCtx || !coachStream) return false;
  try {
    const ctx = coachCtx, srcRate = ctx.sampleRate;
    const src = ctx.createMediaStreamSource(coachStream);
    const proc = ctx.createScriptProcessor(4096, 1, 1);
    const mute = ctx.createGain();
    mute.gain.value = 0;
    const rec = { mode, ctx, src, proc, mute, srcRate, bufs: [], n: 0,
      cap: Math.ceil(MICREC_MAX_SEC * srcRate), live: true,
      perf0: performance.now(), ctx0: ctx.currentTime, firstPlay: null,
      frames: 0, frameSum: 0, frameMax: 0, lastFrameT: 0,
      track: (coachStream.getAudioTracks()[0] || {}).label || '' };
    proc.onaudioprocess = e => {
      if (micRec !== rec || !rec.live) return;
      if (rec.firstPlay == null) rec.firstPlay = e.playbackTime;
      const x = e.inputBuffer.getChannelData(0);
      const take = Math.min(x.length, rec.cap - rec.n);
      if (take > 0){ rec.bufs.push(x.slice(0, take)); rec.n += take; }
      if (rec.n >= rec.cap) micRecTeardown(rec);   // 30 s: stop listening, keep what we have
    };
    src.connect(proc); proc.connect(mute); mute.connect(ctx.destination);
    // Belt and braces: whatever happens, the capture stops a minute after
    // its 30 s cap (what it holds is still saved if the take finishes).
    rec.timer = setTimeout(() => micRecTeardown(rec), (MICREC_MAX_SEC + 60) * 1000);
    micRec = rec;
    return true;
  } catch(e){ micRecAbort(); return false; }
}
// Called by coachReadFrame on every detection frame while capturing.
function micRecFrame(nowT){
  const r = micRec;
  if (r.lastFrameT){
    const d = nowT - r.lastFrameT;
    r.frames++; r.frameSum += d; if (d > r.frameMax) r.frameMax = d;
  }
  r.lastFrameT = nowT;
}
function micRecTeardown(rec){
  if (!rec || !rec.live) return;
  rec.live = false;
  try { rec.proc.onaudioprocess = null; } catch(e){}
  try { rec.src.disconnect(); } catch(e){}
  try { rec.proc.disconnect(); } catch(e){}
  try { rec.mute.disconnect(); } catch(e){}
}
/* Stop and hand back the capture for micRecSave (the take's own finish
   calls this BEFORE coachMicOff). Null when nothing was recording. */
function micRecStop(){
  const rec = micRec;
  if (!rec) return null;
  micRecTeardown(rec);
  clearTimeout(rec.timer);
  micRec = null;
  return rec.n ? rec : null;
}
// Every other exit: tear down and throw the audio away.
function micRecAbort(){
  const rec = micRec;
  if (!rec) return;
  micRecTeardown(rec);
  clearTimeout(rec.timer);
  micRec = null;
  const el = document.getElementById('micrec-on');
  if (el) el.remove();
}
/* The recording's start on the performance.now() clock: the first buffer's
   audio ended at its playbackTime, which maps onto performance.now()
   through the (perf0, ctx0) pair taken at the start. Good to a few ms. */
function micRecStartPerf(rec){
  const firstEnd = rec.firstPlay != null ? rec.firstPlay : rec.ctx0;
  return rec.perf0 + (firstEnd - rec.ctx0) * 1000 - 4096 / rec.srcRate * 1000;
}
// Box-filtered resample to MICREC_RATE, as 16-bit little-endian PCM.
function micRecPcm16(rec){
  const all = new Float32Array(rec.n);
  let o = 0;
  rec.bufs.forEach(b => { all.set(b, o); o += b.length; });
  const ratio = rec.srcRate / MICREC_RATE;
  const outN = Math.floor(rec.n / ratio);
  const out = new Int16Array(outN);
  for (let i = 0; i < outN; i++){
    const a = Math.floor(i * ratio), b = Math.max(a + 1, Math.floor((i + 1) * ratio));
    let s = 0;
    for (let k = a; k < b && k < all.length; k++) s += all[k];
    const v = Math.max(-1, Math.min(1, s / (b - a)));
    out[i] = v < 0 ? v * 32768 : v * 32767;
  }
  return out;
}
/* Save a stopped capture with the take's metadata. Times in `meta` are
   performance.now() values; they are made relative to the recording's
   start here. Quiet on failure — a lost recording costs the student
   nothing. */
/* Saves run one after another: two takes in quick succession write the
   same chunk docs, and overlapping writes could splice them together. */
let micRecSaving = Promise.resolve();
/* The mic's device label can carry its owner's name ("Maria's AirPods",
   "AirPods de María"). Keep the device, drop the owner — BEFORE upload.
   Same rule, same two regexes, as teacher.js micEvalMicName (which cleans
   it again for display, and documents why the Spanish strip is
   case-sensitive); change one and change the other. */
function micRecMicName(label){
  return String(label || '')
    .replace(/^.*?['’]s\s+/i, '')
    .replace(/\s+de\s+\p{Lu}[^\s()]*(?:\s+\p{Lu}[^\s()]*)*/gu, '');
}
function micRecSave(rec, meta){
  micRecSaving = micRecSaving.then(() => micRecSaveNow(rec, meta)).catch(() => {});
  return micRecSaving;
}
async function micRecSaveNow(rec, meta){
  if (!rec || !rec.n || IS_TEACHER_MODE || !currentUser) return;
  const t0 = micRecStartPerf(rec);
  const rel = x => x == null ? null : Math.round((x - t0) * 10) / 10;
  const doc = Object.assign({}, meta.fields);
  doc.expected = (meta.expected || []).map(e => Object.assign({}, e, { t: rel(e.t) }));
  doc.events = (meta.events || []).map(e => Object.assign({}, e, { t: rel(e.t) }));
  /* Power Chord Switch: the tempo changes made while playing (ccLiveBpm), on the same clock; the field is left out when there were none. */
  if (meta.tempoChanges && meta.tempoChanges.length) doc.tempoChanges = meta.tempoChanges.map(e => Object.assign({}, e, { t: rel(e.t) }));
  Object.assign(doc, {
    uid: currentUser.uid,
    name: currentUser.displayName || '',
    period: (typeof periodOverride !== 'undefined' && periodOverride) || (typeof studentPeriod !== 'undefined' && studentPeriod) || '',
    mode: rec.mode,
    micLatencyMs: coachMicLatencyMs(),
    sampleRate: MICREC_RATE,
    srcSampleRate: rec.srcRate,
    durationSec: Math.round(rec.n / rec.srcRate * 100) / 100,
    micLabel: micRecMicName(rec.track),
    userAgent: (navigator.userAgent || '').slice(0, 300),
    frameMeanMs: rec.frames ? Math.round(rec.frameSum / rec.frames * 10) / 10 : null,
    frameMaxMs: Math.round(rec.frameMax * 10) / 10,
    lang: typeof getLang === 'function' ? getLang() : ''
  });
  const pcm = micRecPcm16(rec);
  if (isDevBypassUser()){ console.info('[micRec] dev bypass — not uploading', doc, pcm.length + ' samples'); return; }
  try {
    if (typeof ensureDb === 'function') await ensureDb();
    if (!db) return;
    const id = currentUser.uid + '-' + rec.mode;
    const ref = db.collection('micTakes').doc(id);
    const bytes = new Uint8Array(pcm.buffer);
    const nChunks = Math.ceil(bytes.length / MICREC_CHUNK);
    for (let i = 0; i < nChunks; i++){
      await ref.collection('chunks').doc(String(i)).set({ i,
        pcm: firebase.firestore.Blob.fromUint8Array(bytes.subarray(i * MICREC_CHUNK, (i + 1) * MICREC_CHUNK)) });
    }
    doc.chunks = nChunks;
    doc.bytes = bytes.length;
    doc.savedAt = firebase.firestore.FieldValue.serverTimestamp();
    await ref.set(doc);
    // Count it once per take id (an overwrite of the same student's game
    // is not a new take). Remembered on this device, so a second device
    // can over-count by one — the quota only decides when asking stops.
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem('micRecSaved') || '[]'); } catch(e){}
    if (saved.indexOf(id) < 0){
      const cRef = db.collection('micTakesMeta').doc('count');
      await db.runTransaction(async tx => {
        const c = await tx.get(cRef);
        if (c.exists) tx.update(cRef, { n: (c.data().n || 0) + 1 });
        else tx.set(cRef, { n: 1 });
      });
      micTakesCount++;
      saved.push(id);
      try { localStorage.setItem('micRecSaved', JSON.stringify(saved)); } catch(e){}
    }
  } catch(e){ console.warn('[micRec] save failed', e); }
}

/* How many matched slots a take needs before we trust it enough to score.
   Scales down for short drills — a 2-note vamp can only ever match 2 slots,
   so a flat floor of 3 made those drills unpassable. */
function coachMinHeard(slotCount){
  return Math.max(Math.min(3, Math.ceil(slotCount / 2)), Math.ceil(slotCount * 0.3));
}

function coachRenderReport(){
  const slots = coach.slots;
  const matched = slots.filter(s => s.hit);

  /* Too little signal → honest "couldn't hear", never a wrong verdict. */
  if (matched.length < coachMinHeard(slots.length)){
    const isMac = /Mac/.test(navigator.platform || '') || /Macintosh/.test(navigator.userAgent || '');
    const micHint = t('coach.report.micHint') + (isMac ? ' ' + t('coach.report.micHintMac') : '');
    coachBody().innerHTML =
      `<div class="coach-note">&#x1F914; ${t(coach.mode === 'chords' ? 'coach.report.couldntHearChords' : 'coach.report.couldntHearMelody')}</div>
       <div class="coach-tip">${micHint}</div>
       ${coachStripHtml()}
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="coachStartCheck()">&#x21BB; ${t('coach.tryAgain')}</button>
         <button type="button" class="tp-btn" onclick="coachClose()">${t('coach.close')}</button>
       </div>`;
    try { sessionStorage.setItem(coach.streakKey, '0'); } catch(e){}
    return;
  }

  const crits = [
    coachScorePitch(),
    coachScoreTiming(),
    coachScoreTempo(),
    coachScoreChanges(),
    coachScoreCompletion()
  ];

  const LVL = { 1: t('coach.level.needsWork'), 2: t('coach.level.gettingIt'), 3: t('coach.level.great') };
  const applicable = crits.filter(c => c.level > 0);
  const greats = applicable.filter(c => c.level === 3).length;
  /* "Good" (level 2) needs >=2 greats — except when only 2 criteria are
     applicable (short melody drills routinely land here: changes is always
     0 in melody mode, and timing/tempo can bail too), where requiring 2
     greats is unreachable without also being a perfect 3. Drop to >=1 only
     in that case so the middle tier stays reachable. */
  let overallLevel = greats === applicable.length ? 3
    : (greats >= (applicable.length === 2 ? 1 : 2) ? 2 : 1);
  /* Timing forgiveness floor (2026-09-01). The three `soft` criteria — on
     the beat, steady tempo, chord changes — all measure the same thing:
     WHERE in the bar the notes landed. They stay in the report, they still
     hold a take back from Great, but they can no longer drag one down to
     Needs work on their own: if the notes themselves were right (pitch) and
     the student got through the drill (completion), the take is at least
     Good, and the coaching lives in those criteria's sentences instead of
     in the badge. Without this, a student who could play every note but sat
     behind the click failed the check-off gate (COACH_GATE_MIN_LEVEL) on
     timing alone — and one loose take marked down all three soft criteria at
     once, so the same fault was charged three times. */
  const hard = applicable.filter(c => !c.soft);
  if (overallLevel < 2 && hard.length && hard.every(c => c.level >= 2)) overallLevel = 2;
  let overall;
  /* Great can still have beats the mic missed or could not read: pitch
     leaves those out of its ratio. Then "Everything was right" is not
     true, so say what is: every beat heard clearly was right. Wording only;
     the level, and the gate that reads it, are unchanged. */
  const everyBeatRight = slots.every(s => s.state === 'ok' || s.state === 'oct');
  if (overallLevel === 3)      overall = '&#x1F31F; ' + t(everyBeatRight ? 'coach.overall.great' : 'coach.overall.greatHeard');
  else if (overallLevel === 2) overall = '&#x1F4AA; ' + t('coach.overall.good');
  else                         overall = '&#x1F3B8; ' + t('coach.overall.practice');

  /* Streak: a "clear" = perfect pitch score, nothing HARD at Needs work,
     and timing at least in the ballpark. Loose timing costs the streak only
     when it's badly loose — level 1 there now means most hits sat more than
     twice the (already widened) on-beat window off the pulse. Tempo drift
     and late chord changes no longer break a streak at all: they're coached
     in the report instead. */
  const clear = crits[0].level === 3 && hard.every(c => c.level >= 2) && crits[1].level !== 1;
  let streak = 0;
  try {
    streak = clear ? (parseInt(sessionStorage.getItem(coach.streakKey), 10) || 0) + 1 : 0;
    sessionStorage.setItem(coach.streakKey, String(streak));
  } catch(e){}
  const streakHtml = streak >= 3
    ? `<div class="coach-streak">&#x1F525; ${t('coach.streak', {n: streak})}</div>` : '';

  /* Last-time-vs-this-time: read whatever's already loaded in the progress
     doc before this attempt overwrites it (same read pattern as rnBestMerged). */
  const prevCoach = (typeof games !== 'undefined' && games && games.coach && coach.drillId)
    ? games.coach[coach.drillId] : null;
  const compareHtml = prevCoach
    ? `<div class="coach-tip">${t('coach.compare', {last: LVL[prevCoach.level] || '—', now: LVL[overallLevel]})}</div>` : '';

  /* The other half of the forgiveness: SAY it. When pitch scored at least
     level 2 and a soft (timing) criterion fell short, the report counts the
     right notes that sat off the beat (coach.tip.countedLoose: "Right
     notes, but off the beat: {n}… Each one still counts as a right note")
     and then asks for the beat — otherwise a student reading three yellow
     rows has no way to tell those notes were already banked. The tip names
     only the loose RIGHT notes, so it stays true when another note in the
     take was wrong. */
  const looseCount = coach.slots.filter(s => s.loose && (s.state === 'ok' || s.state === 'oct')).length;
  const softShort = crits.some(c => c.soft && c.level > 0 && c.level < 3);
  const notesHtml = (crits[0].level >= 2 && softShort && looseCount > 0)
    ? `<div class="coach-tip">&#x1F44D; ${t('coach.tip.countedLoose', { n: looseCount })}</div>` : '';

  /* Compact per-drill result → the student's progress doc, so the next visit
     can show the line above. Skipped in dev bypass (Firestore rejects that uid). */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser() && coach.drillId){
    if (!games.coach) games.coach = {};
    const prevAttempts = (games.coach[coach.drillId] && games.coach[coach.drillId].attempts) || 0;
    games.coach[coach.drillId] = { level: overallLevel, attempts: prevAttempts + 1, at: new Date().toISOString().slice(0, 10) };
    /* Per-SKILL best, keyed by skill id rather than by drill payload — this is
       what the check-off gate in app.js reads. Best-ever, never downgraded: a
       shaky retake shouldn't take back a skill the student already earned. */
    if (coach.skillIds && coach.skillIds.length){
      if (!games.coachSkill) games.coachSkill = {};
      const today = new Date().toISOString().slice(0, 10);
      coach.skillIds.forEach(sid => {
        const prev = games.coachSkill[sid] || {};
        games.coachSkill[sid] = Object.assign({}, prev, {
          level: Math.max(prev.level || 0, overallLevel),
          last: overallLevel,
          at: today
        });
      });
    }
    saveGames();
  }

  coachBody().innerHTML =
    `<div class="coach-report"><div class="coach-overall">${overall}</div>
     ${notesHtml}
     ${compareHtml}
     ${coachStripHtml()}
     <div class="coach-crits">` +
    crits.map(c =>
      `<div class="coach-crit">
         <div class="coach-crit-top">
           <span class="coach-crit-name">${c.icon} ${escHtml(c.name)}</span>
           ${c.level > 0
             ? `<span class="coach-lvl lvl${c.level}">${LVL[c.level]}</span>`
             : `<span class="coach-lvl lvl0">&mdash;</span>`}
         </div>
         <div class="coach-crit-note">${escHtml(c.sentence)}</div>
       </div>`).join('') +
    `</div>
     ${streakHtml}
     <div class="coach-actions">
       <button type="button" class="coach-start" onclick="coachStartCheck()">&#x21BB; ${t('coach.tryAgain')}</button>
       <button type="button" class="tp-btn" onclick="coachClose()">${t('coach.reportDone')}</button>
     </div></div>`;
}

/* ── Criterion 1: Right notes / right chord sound ── */
function coachScorePitch(){
  const name = t(coach.mode === 'chords' ? 'coach.crit.pitch.nameChords' : 'coach.crit.pitch.nameMelody');
  const icon = '&#x1F3AF;';
  const slots = coach.slots;
  const judged = slots.filter(s => s.state === 'ok' || s.state === 'oct' || s.state === 'wrong');
  const good = slots.filter(s => s.state === 'ok' || s.state === 'oct').length;
  const octs = slots.filter(s => s.state === 'oct').length;
  const dim = slots.filter(s => s.state === 'dim').length;

  if (coach.mode === 'chords' && dim > slots.length * 0.6){
    return { name, icon, level: 2, sentence: t('coach.crit.pitch.dimChords') };
  }
  const missed = slots.filter(s => s.state === 'miss').length;
  const denom = Math.max(1, judged.length + missed);
  const r = good / denom;
  const total = slots.length;
  let level, sentence;
  const firstWrong = slots.find(s => s.state === 'wrong');
  /* When nothing was WRONG and the only losses are unheard/unclear notes,
     the likely story is volume, not fingers — quiet plucks don't reach the
     mic. Say that, instead of implying the student fretted them badly.
     (Also keeps a mostly-unheard take from scoring "Nailed 2 of 12 — clean
     run!": dim slots carry no verdict, so they're invisible to the ratio.) */
  if (coach.mode === 'melody' && !firstWrong && (dim + missed) > total * 0.5){
    const key = good === 0 ? 'coach.crit.pitch.quietMostAll'
      : good === 1 ? 'coach.crit.pitch.quietMostOne'
      : 'coach.crit.pitch.quietMostMany';
    return { name, icon, level: good > 0 ? 2 : 1,
      sentence: t(key, { good }) };
  }
  const quietOnly = !firstWrong && (missed + dim) > 0;
  /* A clearly-wrong note caps the score at level 2 — on a short drill one
     clunker can still leave the ratio above the "Great" bar. */
  if (r >= 0.85 && !firstWrong){
    level = 3;
    sentence = coach.mode === 'chords'
      ? t('coach.crit.pitch.greatChords', { good, total })
      : quietOnly
        ? t(total - good === 1 ? 'coach.crit.pitch.greatQuietMelodyOne' : 'coach.crit.pitch.greatQuietMelody', { good, total, rest: total - good })
        : (octs ? t('coach.crit.pitch.correctWithOct', { good, total, octs }) : t('coach.crit.pitch.correctPerfect', { good, total }));
  } else if (r >= 0.55){
    level = 2;
    if (firstWrong && coach.mode === 'melody'){
      const idx = slots.indexOf(firstWrong);
      /* app.js's ordinal() is English-only ("3rd") — in Spanish use the
         feminine ordinal abbreviation ("3.ª", agreeing with "nota"). */
      sentence = t('coach.crit.pitch.wrongNote', {
        good, total, ordinal: getLang() === 'es' ? (idx + 1) + '.ª' : ordinal(idx + 1),
        heard: coachNoteName(firstWrong.hit.midi), expected: firstWrong.label
      });
    } else if (quietOnly){
      sentence = t(coach.mode === 'chords' ? 'coach.crit.pitch.closeQuietChords' : 'coach.crit.pitch.closeQuietMelody', { good, total });
    } else {
      sentence = t('coach.crit.pitch.close', { good, total });
    }
  } else {
    level = 1;
    if (quietOnly){
      sentence = t(coach.mode === 'chords' ? 'coach.crit.pitch.needsQuietChords' : 'coach.crit.pitch.needsQuietMelody');
    } else {
      sentence = coach.mode === 'chords'
        ? t('coach.crit.pitch.needsChords')
        : t('coach.crit.pitch.needsMelody', { good, total });
    }
  }
  return { name, icon, level, sentence };
}

/* ── Criterion 2: On the beat ──
   `soft: true` — this criterion COACHES, it doesn't fail a take. See the
   overall-level floor in coachRenderReport: notes played at the right pitch
   count as right notes no matter where they landed in the bar, and this is
   the one place the report talks about where they landed. Thresholds
   deliberately generous (COACH_ON_BEAT_*): a beginner sitting a fifth of a
   beat off the click is playing the drill, not failing it. */
function coachScoreTiming(){
  const name = t('coach.crit.timing.name'), icon = '&#x1F941;';
  const devs = coach.slots.filter(s => s.hit && s.hit.devMs != null).map(s => s.hit.devMs);
  if (devs.length < 3) return { name, icon, soft: true, level: 0, sentence: t('coach.crit.timing.notEnough') };
  const onMs = coachOnBeatMs(), closeMs = onMs * 2;
  const on = devs.filter(d => Math.abs(d) <= onMs).length;
  const close = devs.filter(d => Math.abs(d) <= closeMs).length;
  const mean = devs.reduce((a, b) => a + b, 0) / devs.length;
  const lean = Math.abs(mean) < onMs * 0.6 ? '' : (mean < 0 ? 'early' : 'late');
  let level, sentence;
  if (on / devs.length >= 0.6){
    level = 3; sentence = t('coach.crit.timing.great', { on, total: devs.length });
  } else if (close / devs.length >= 0.5){
    level = 2;
    sentence = lean
      ? t(lean === 'early' ? 'coach.crit.timing.leanEarly' : 'coach.crit.timing.leanLate')
      : t('coach.crit.timing.scattered');
  } else {
    /* Still "Needs work", never "wrong": the sentence names the notes that
       DID count before it asks for the beat, so the tier reads as the next
       thing to practise rather than as a verdict on the notes. `devs` also
       holds wrong and unclear hits, so "all counted" is said only when
       every timed hit was a right note; otherwise just how many were heard. */
    level = 1;
    const allRight = coach.slots.every(s => !(s.hit && s.hit.devMs != null) || s.state === 'ok' || s.state === 'oct');
    const pre = allRight ? 'coach.crit.timing.counted' : 'coach.crit.timing.heard';
    sentence = lean
      ? t(pre + (lean === 'early' ? 'Early' : 'Late'), { total: devs.length })
      : t(allRight ? 'coach.crit.timing.needsWork' : 'coach.crit.timing.heardNeedsWork', { total: devs.length });
  }
  return { name, icon, soft: true, level, sentence };
}

/* ── Criterion 3: Steady tempo ──
   `soft: true`, like "On the beat" — drifting is something to work on, not
   a reason to hand back a take whose notes were all right (see the
   overall-level floor in coachRenderReport).
   Measured from the student's own hit-to-hit intervals, NOT the grid slots:
   the matcher assigns notes to the beats they landed on, so a rush/drag is
   invisible in slot indices — but it's plain as day in the raw event times.
   A missed note shows up as a ~2-beat interval; rounding each interval to
   whole beats (vs the median) keeps one miss from corrupting the fit. */
function coachScoreTempo(){
  const name = t('coach.crit.tempo.name'), icon = '&#x23F1;';
  const ts = coach.events.filter(e => e.slot >= 0).map(e => e.t).sort((a, b) => a - b);
  /* "Can't judge" bails out at level 0, NOT 2 — same as coachScoreTiming's
     notEnough and coachScoreChanges' notApplicable. Level 0 drops the
     criterion out of `applicable` in coachRenderReport; a level 2 would keep
     it in and make greats === applicable.length unreachable, so a 4–5 note
     melody drill (never 6 events) could never score Great no matter how well
     it was played — and games.coachSkill[sid].level stayed capped at 2. */
  if (ts.length < 6) return { name, icon, soft: true, level: 0, sentence: t('coach.crit.tempo.tooShort') };
  const iois = [];
  for (let i = 1; i < ts.length; i++) iois.push(ts[i] - ts[i - 1]);
  const med = tunerMedian(iois);
  if (!(med > 0)) return { name, icon, soft: true, level: 0, sentence: t('coach.crit.tempo.unclear') };
  const pos = [0];
  for (const d of iois) pos.push(pos[pos.length - 1] + Math.max(1, Math.round(d / med)));
  const pts = ts.map((t, i) => ({ x: pos[i], y: t }));
  const half = Math.floor(pts.length / 2);
  const bpmOf = arr => {
    const n = arr.length;
    const mx = arr.reduce((a, p) => a + p.x, 0) / n, my = arr.reduce((a, p) => a + p.y, 0) / n;
    let num = 0, den = 0;
    arr.forEach(p => { num += (p.x - mx) * (p.y - my); den += (p.x - mx) * (p.x - mx); });
    if (!den) return null;
    const beat = num / den;
    return beat > 0 ? 60000 / beat : null;
  };
  const b1 = bpmOf(pts.slice(0, half)), b2 = bpmOf(pts.slice(-half)), bAll = bpmOf(pts);
  if (!b1 || !b2 || !bAll) return { name, icon, soft: true, level: 0, sentence: t('coach.crit.tempo.unclear') };   // degenerate fit — same "can't judge" as above
  const drift = Math.abs(b2 - b1) / coach.bpm;
  let level, sentence;
  if (drift <= 0.07){
    level = 3; sentence = t('coach.crit.tempo.steady', { bpm: Math.round(bAll) });
  } else if (drift <= 0.15){
    level = 2;
    sentence = t(b2 > b1 ? 'coach.crit.tempo.spedUpSlight' : 'coach.crit.tempo.slowedDownSlight', { b1: Math.round(b1), b2: Math.round(b2) });
  } else {
    level = 1;
    sentence = t(b2 > b1 ? 'coach.crit.tempo.spedUp' : 'coach.crit.tempo.slowedDown', { b1: Math.round(b1), b2: Math.round(b2) });
  }
  return { name, icon, soft: true, level, sentence };
}

/* ── Criterion 4: Chord changes ──
   `soft: true` — this is the chord-mode half of "On the beat" (it asks
   whether the CHANGE landed on the beat), so it gets the same treatment:
   a late change is coached, it doesn't fail the take. */
function coachScoreChanges(){
  const name = t('coach.crit.changes.name'), icon = '&#x1F504;';
  if (coach.mode !== 'chords'){
    return { name, icon, soft: true, level: 0, sentence: t('coach.crit.changes.notApplicable') };
  }
  const bounds = coach.slots.filter(s => s.isChange);
  if (!bounds.length) return { name, icon, soft: true, level: 0, sentence: t('coach.crit.changes.onlyOne') };
  const closeMs = Math.max(140, coach.beatMs * 0.24);
  const onTime = bounds.filter(s => s.hit && Math.abs(s.hit.devMs) <= closeMs && s.state !== 'wrong');
  const late = bounds.find(s => !(s.hit && Math.abs(s.hit.devMs) <= closeMs && s.state !== 'wrong'));
  const r = onTime.length / bounds.length;
  let level, sentence;
  if (r >= 0.85){
    level = 3;
    sentence = bounds.length === 1 ? t('coach.crit.changes.allOne') : t('coach.crit.changes.allMany', { n: bounds.length });
  } else if (r >= 0.5){
    level = 2;
    sentence = t('coach.crit.changes.some', { on: onTime.length, total: bounds.length, to: late ? late.chordName : t('coach.crit.changes.nextChordFallback') });
  } else {
    level = 1;
    sentence = t('coach.crit.changes.late');
  }
  return { name, icon, soft: true, level, sentence };
}

/* ── Criterion 5: Played it through ── */
function coachScoreCompletion(){
  const name = t('coach.crit.completion.name'), icon = '&#x1F3C1;';
  const slots = coach.slots;
  const hitIdx = slots.map((s, i) => s.hit ? i : -1).filter(i => i >= 0);
  const coverage = hitIdx.length / slots.length;
  let maxGap = hitIdx.length ? hitIdx[0] : slots.length;
  for (let k = 1; k < hitIdx.length; k++) maxGap = Math.max(maxGap, hitIdx[k] - hitIdx[k - 1] - 1);
  const tailMiss = hitIdx.length ? slots.length - 1 - hitIdx[hitIdx.length - 1] : slots.length;
  // A trailing miss is a gap too — without folding it in, stopping early
  // near the end still reads as a clean, no-gap run.
  maxGap = Math.max(maxGap, tailMiss);
  let level, sentence;
  if (coverage >= 0.9 && maxGap <= 1){
    level = 3; sentence = t('coach.crit.completion.great');
  } else if (coverage >= 0.65 && tailMiss <= 2){
    level = 2;
    // Report the first MISSED beat, not the hit that resumes after it —
    // hitIdx[k] is the resuming hit, so the gap actually starts right
    // after the previous hit, hitIdx[k - 1].
    const gapK = hitIdx.findIndex((v, k) => k > 0 && v - hitIdx[k - 1] - 1 >= 2);
    sentence = gapK > 0
      ? t('coach.crit.completion.gapAt', { beat: hitIdx[gapK - 1] + 2 })
      : t('coach.crit.completion.mostly');
  } else {
    level = 1;
    sentence = tailMiss > 2 ? t('coach.crit.completion.stoppedPartway') : t('coach.crit.completion.gaps');
  }
  return { name, icon, level, sentence };
}

/* ══════════ Teardown ══════════ */

/* Full stop: mic off, timers cleared, card removed. Safe to call anytime. */
function coachClose(){
  if (coachRaf){ cancelAnimationFrame(coachRaf); coachRaf = null; }
  if (coach){
    coach.timeouts.forEach(clearTimeout);
    (coach.hiddenTabs || []).forEach(el => el.classList.remove('coach-dup-hidden'));
    if (coach.card && coach.card.isConnected) coach.card.remove();
  }
  coachMicOff();
  coach = null;
}
function coachStopAll(){ coachClose(); }

/* Called by app.js when the tuner opens (the tuner takes the mic) and by the
   hidden-tab handler below. */
function coachInterrupt(msg){
  if (!coach) return;
  if (coach.phase === 'listening' || coach.phase === 'countin'){
    coach.timeouts.forEach(clearTimeout);
    coach.timeouts = [];
    if (coachRaf){ cancelAnimationFrame(coachRaf); coachRaf = null; }
    coachMicOff();
    coachRenderReady(msg || t('coach.interrupt.tunerTook'));
  }
}

/* Privacy + battery: the mic (and its analysis loops) never runs in a tab the
   student isn't looking at. Switching tabs or locking the phone shuts it all
   down cleanly; the student restarts with one tap when they're back. */
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  coachInterrupt(t('coach.paused.backgrounded'));
  gamesHideStop();
  coachEvictTuner();
});
/* The hidden-tab half of gamesStopMic: only what holds the mic stops.
   It used to be gamesStopMic itself, which ends EVERY game — a student
   halfway through a Riff Roulette card who flipped to another tab to look
   at a chord chart came back to the hub with the card gone, though that
   game never opens the mic. A game that does hold it (the six below — the
   same flags coachReleaseMicIfIdle reads) still gets the full gamesStopMic,
   and so does a mic left live by anything this list doesn't know, so the
   "never listening in a hidden tab" promise is unchanged. Only one game
   runs at a time (gamesShow stops the last before opening the next), so
   with the mic held the game being stopped is the one holding it. Note
   Call (app.js) stops as before: its own mic start relies on this call to
   cancel itself when the tab is hidden mid-start. */
function gamesHideStop(){
  if (typeof ncStopAll === 'function') ncStopAll();
  /* Same gap as in gamesStopMic(): a tab hidden while the later arcade files are still loading. The game state
     read below (fretRunning, cc…) is declared in those files; no game can be running yet (review R1-2). */
  if (typeof bcStop !== 'function') return;
  const micHeld = fretRunning || psgRunning || (cc && cc.micOn) || (sr && sr.micOn) ||
                  (rn && rn.micOn) || (nr && nr.micOn) || window.coachMicLive;
  if (micHeld) gamesStopMic();
}

