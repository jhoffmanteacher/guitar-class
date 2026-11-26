/* ════════════════════════════════════════════════════════════════════
   coach-score.js — the Listening Coach's finish and report card: coachFinish,
   the mic teardown coachMicOff, the report (coachRenderReport) and its five
   scoring criteria (coachScorePitch / Timing / Tempo / Changes / Completion,
   coachMinHeard). Split off coach-core.js on 2026-11-18 (Jonathan approved:
   coach-core.js was 2,247 lines, over the 2,000 checks.mjs 1cv warns at),
   moved whole and unchanged; loaded right after coach-core.js
   (COACH_JS_PARTS in app/boot.js). The detectors and the tunables stay in
   coach-core.js. Every caller that can run before this part has loaded (or
   after it failed to) is typeof-guarded: coachClose()'s call to coachMicOff()
   in coach-core.js (reached by coachStopAll and the guarded coachClose()
   calls in app/explore.js and app/shell.js), app/drills-call.js and
   trainer-site-adapter.js. checks.mjs 1ex runs coach-take-save.mjs, which
   turns red if coachClose's guard stops reaching coachMicOff.
   ════════════════════════════════════════════════════════════════════ */
/* ══════════ Finish & score ══════════ */

function coachFinish(ended){
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
  /* Saved when the take ran to its end (only coachLoop passes exactly true) or "I'm done" came after a note was heard: one take id per
     student (<uid>-coach), so an empty early finish would replace the last real take. Not saved: micRecStop, above, already let it go. */
  if (rec && (ended === true || coach.events.length)) micRecSave(rec, coachRecMeta());
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
  coachMicAskCancel();          // a "Turn on the microphone" panel still waiting: that start is over too
  /* typeof: coach-recordings.js loads after this part (split 2026-11-18), and a page can call
     coachClose() / coachStopAll() between the two, or after it failed to load (review R1-1). */
  if (typeof micRecAbort === 'function') micRecAbort();   // a capture still running here was never finished: drop it
  window.coachMicLive = false;
  if (coachStream) coachStream.getTracks().forEach(t => t.stop());
  if (coachCtx) coachCtx.close();
  coachStream = null; coachCtx = null; coachAnalyser = null;
  const micEl = document.getElementById('coach-mic');
  if (micEl) micEl.hidden = true;
}

/* How many matched slots a take needs before we trust it enough to score.
   Scales down for short drills — a 2-note vamp can only ever match 2 slots,
   so a flat floor of 3 made those drills unpassable. */
function coachMinHeard(slotCount){
  return Math.max(Math.min(3, Math.ceil(slotCount / 2)), Math.ceil(slotCount * 0.3));
}

/* The skill this round is for still waits on the Coach: toggleSkill (app/audio-ui.js) would show the check-off gate, whose
   "Mark it anyway" the "could not read" screen names. Not in a locked set's read-only preview: toggleSkill refuses
   "I've got it!" there (isSetPeeking), so no gate opens. The card sits inside the set's panel (coachOpen puts it next to its
   button, in a lesson step or the checklist's practice panel, both of the skill's own set), so the panel's .set-peek is read
   from the card, as app/lesson.js does from a button. typeof: the gate lives in app/audio-ui.js, not in the coach parts. */
function coachGateWaiting(){
  if (typeof skillIsCoachGated !== 'function' || typeof coachSkillBest !== 'function') return false;
  if (coach.card && typeof coach.card.closest === 'function' && coach.card.closest('.week-panel.set-peek')) return false;
  return (coach.skillIds || []).some(sid => skillIsCoachGated(sid) && coachSkillBest(sid) < COACH_GATE_MIN_LEVEL
    && !(typeof progress !== 'undefined' && progress && progress[sid] === 'gotit'));
}

function coachRenderReport(){
  const slots = coach.slots;
  const matched = slots.filter(s => s.hit);

  /* THE NOTES DECIDE (2026-11-25; the numbers: tools/mic-sim/README.md, "The notes decide"). In a classroom a sound lands near every
     beat whether or not the student played (recorded takes: 0 of 64 beats came back "miss"), so "On the beat" and "Played it
     through" are Great for a round of desk taps or room noise, and two Greats made Good. Two rules about the round as a whole
     (no slot verdict changes):
       1. "Right notes" at Not yet is never Good on two other Greats (the line after the forgiveness floor below).
       2. When that Not yet rests on sounds the Coach could not read, not on notes it read as wrong (wrong notes on under three
          quarters of the beats, and more unclear beats than silent ones), the round gets the "could not read" screen below:
          no level, nothing saved for the skill, the check-off gate as it was. A round stays Not yet, with its sentences, when
          three quarters of the beats or more were read as wrong notes, or when the silent beats are as many as the unclear ones
          or more (the student stopped).
     Roll back (report card only): `|| unread` out of the test below, the "the notes decide" line, and `good > 1` back to
     `good > 0` in coachScorePitch's quietMost branch; nothing is stored in a new shape. */
  const pitchCrit = coachScorePitch();
  const stateN = k => slots.filter(s => s.state === k).length;
  const unread = pitchCrit.level === 1 && !(stateN('wrong') >= slots.length * 0.75) && stateN('dim') > stateN('miss');
  const heardLittle = matched.length < coachMinHeard(slots.length);

  /* Too little signal → honest "couldn't hear", never a wrong verdict. Two screens: too few sounds at all (the mic hint), or
     sounds the Coach could not read as notes (rule 2 above: move closer, or mark the skill with the gate's "Mark it anyway"). */
  if (heardLittle || unread){
    const isMac = /Mac/.test(navigator.platform || '') || /Macintosh/.test(navigator.userAgent || '');
    const chords = coach.mode === 'chords';
    const line = heardLittle
      ? t(chords ? 'coach.report.couldntHearChords' : 'coach.report.couldntHearMelody')
      : t(chords ? 'coach.report.unreadChords' : 'coach.report.unreadMelody');
    const tips = heardLittle ? [t('coach.report.micHint')] : (coachGateWaiting() ? [t('coach.report.markAnyway')] : []);
    if (isMac) tips.push(t('coach.report.micHintMac'));
    coachBody().innerHTML =
      `<div class="coach-note">&#x1F914; ${line}</div>
       ${tips.length ? `<div class="coach-tip">${tips.join(' ')}</div>` : ''}
       ${coachStripHtml()}
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="coachStartCheck()">&#x21BB; ${t('coach.tryAgain')}</button>
         <button type="button" class="tp-btn" onclick="coachClose()">${t('coach.close')}</button>
       </div>`;
    try { sessionStorage.setItem(coach.streakKey, '0'); } catch(e){}
    return;
  }

  const crits = [
    pitchCrit,
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
  /* The notes decide (rule 1 at the top): Good on timing and completion alone was a round of room noise. */
  if (overallLevel === 2 && crits[0].level === 1) overallLevel = 1;
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

  /* The rows (2026-11-25): the thing to fix first on top, lowest level first ("Right notes" first on a
     tie: crits[0] is pitch and the index breaks ties), and no row for a criterion with no level (level 0: "no chord changes in
     this drill", "too short to judge tempo"), which says nothing about the round. */
  const rows = crits.map((c, i) => ({ c, i })).filter(x => x.c.level > 0)
    .sort((a, b) => a.c.level - b.c.level || a.i - b.i).map(x => x.c);
  coachBody().innerHTML =
    `<div class="coach-report"><div class="coach-overall">${overall}</div>
     ${notesHtml}
     ${compareHtml}
     ${coachStripHtml()}
     <div class="coach-crits">` +
    rows.map(c =>
      `<div class="coach-crit">
         <div class="coach-crit-top">
           <span class="coach-crit-name">${c.icon} ${escHtml(c.name)}</span>
           <span class="coach-lvl lvl${c.level}">${LVL[c.level]}</span>
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

  /* Mostly unclear strums: "I heard the strums but not the notes clearly ... I mostly scored your timing" at level 2 (the forgiveness floor
     in the report then lets timing decide the badge) when most slots are unclear on 3+ readings (the vote's grey zone, between 10% and 20%
     chord tones), or when any strum was right (one right strum keeps the line at Getting it here; melody's quietMost asks for two
     since 2026-11-25; the chord rule waits for real chord takes, tools/mic-sim/README.md). A sound with
     no pitch, or 1-2 readings off the chord, is never credited (rule A, coachToneCredit), so a round of only such sounds (desk taps, muted
     strums, typing) with nothing right is level 1 and says the chord sound gets no credit (2026-11-18; review R1-1, R1-2). */
  if (coach.mode === 'chords' && dim > slots.length * 0.6){
    const dimRead = slots.filter(s => s.state === 'dim' && s.hit && coachToneCredit(s.hit.classes || [], s.classes) === null).length;
    const two = dimRead > slots.length * 0.6 || good > 0;
    return { name, icon, level: two ? 2 : 1, sentence: t(two ? 'coach.crit.pitch.dimChords' : 'coach.crit.pitch.dimChordsNone') };
  }
  const missed = slots.filter(s => s.state === 'miss').length;
  const denom = Math.max(1, judged.length + missed);
  const r = good / denom;
  const total = slots.length;
  let level, sentence;
  const firstWrong = slots.find(s => s.state === 'wrong');
  /* When nothing was WRONG and the only losses are unheard/unclear notes,
     say that the Coach could not hear them clearly, instead of implying the
     student fretted them badly. Not "volume" (2026-11-25): in a classroom an
     unclear beat almost always held a sound, so the mic heard it; the
     direction is to play firmly, close to the mic. (Also keeps a
     mostly-unheard take from scoring "Nailed 2 of 12 — clean run!": dim
     slots carry no verdict, so they're invisible to the ratio.)
     Two right notes or more for level 2 (2026-11-25, "the notes decide"):
     with nothing played, a voice or a neighbour's guitar gave a short drill
     its one "right" note. */
  if (coach.mode === 'melody' && !firstWrong && (dim + missed) > total * 0.5){
    const key = good === 0 ? 'coach.crit.pitch.quietMostAll'
      : good === 1 ? 'coach.crit.pitch.quietMostOne'
      : 'coach.crit.pitch.quietMostMany';
    return { name, icon, level: good > 1 ? 2 : 1,
      sentence: t(key, { good, total }) };
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
    /* A chord round can land here with no right strum at all (some unclear, the rest silent), where "sounded right on 0 of 8
       beats" is no sentence: it gets its own line. Melody cannot: with nothing wrong and over half unclear or silent it takes
       the quietMost branch above, so needsQuietMelody always has a right note or more. */
    if (quietOnly && coach.mode === 'chords' && good === 0){
      sentence = t('coach.crit.pitch.needsQuietChordsNone');
    } else if (quietOnly){
      sentence = t(coach.mode === 'chords' ? 'coach.crit.pitch.needsQuietChords' : 'coach.crit.pitch.needsQuietMelody', { good, total });
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
