# WORKFLOW archive — July 2026: research upgrades, Semester 2, Listening Coach era

> Moved out of WORKFLOW.md on 2026-07-11 when everything here shipped.
> Covers: research-upgrade Sessions A–E (F cut, G superseded by the
> Listening Coach), the Modules 9–12 Semester 2 build, the song-list
> consolidation, the Luna requinto TAB, the tuner fixes, the Listening
> Coach + Note Hunt + Change Up games, the floating video mini-player,
> the navigation pass, the 2026-07-11 bug-hunt, and the Semester 1
> content-gap fill. Specs live beside this file:
> `RESEARCH_UPGRADES.md` and `MODULES_9_12.md`.

## Completed work (was WORKFLOW.md "Open work")
- [~] **Research upgrades — Sessions A–G** (`RESEARCH_UPGRADES.md`). Session A ✅
      2026-07-10: **10-Minute Routine cards + Daily 5 panel.** New in
      `config-main.js`: `WARMUP_BANK` (3 dexterity warm-ups, playSeq format)
      and `WINTER_CHALLENGE` (15 one-line break-bridge days). New in `app.js`
      (all read-only, zero Firebase writes): `buildModuleRoutine(moduleNum)` —
      assembles a ~10-min routine from the module's live SETS data (tune-up →
      WARMUP_BANK[moduleNum % 3] → last set's first playSeq as the skill
      drill → first chords:-spec step (else first other playSeq) → most
      recent "Take It to a Song" step) and renders as a card at the top of
      every Module Review; `printRoutine()` + `body.print-routine` print CSS
      (card-only, black on white); `buildDaily5`/`toggleDaily5` — a ⚡ Daily 5
      button beside the module dropdown opens today's 5-minute warm-up
      (tune-up + warm-up + one playSeq from the current module, both rotated
      by day-of-year so everyone sees the same drill on the same date), with
      the 15-Day Challenge in a collapsed `<details>` underneath. Session A's
      classroom framing ("bell-ringer," "teacher projects at Station A")
      adapted to the site's self-paced voice per the 2026-07-10 conversion.
      Verified via node VM harness (routine + Daily 5 render for all 12
      modules; Module 1 gracefully drops its chord/song items — only 1
      playSeq, no Take-It-to-a-Song step). In-browser spot-check pending
      (browser automation declined this session — Jonathan may want to click
      through one review + the Daily 5 button). Session B ✅ 2026-07-10:
      **Module 9 Set 0 — welcome-back re-tests + placement self-check.** New
      set `m9w0` pushed FIRST in module-9.js (set order is id-keyed, safe):
      six RE-TEST skills `m9w0-s1…s6` whose `gotItWhen` texts are copied
      VERBATIM from their Semester 1 sources (m5w2-s6, m6w2-s4, m4w1-s1,
      m3w1-s2, m2w2-s4, m8w2-s4 — note s1's inherited bar says 70 BPM while
      the re-test text says 60; kept verbatim per spec, the original bar is
      the stricter one). Station B = solid/shaky/gone self-check (short
      responses, new `m9w0-*` keys, no collisions); Station C = tuning
      warm-up + one drill per re-test with its "tune-up home" module pointer
      (Pattern 1 playSeq copied from module-4.js) + record-the-speed-round
      closer. `skillCount` 18 → 24 for module 9 in MODULE_MANIFEST
      (checks.mjs verifies, passes). Transfer/returner pointer lines added to
      MODULE_REVIEWS[1].forward (new field — renders as "Why this matters")
      and MODULE_REVIEWS[9].forward. Spec's classroom framing ("six-station
      speed round … partner … teacher verifies") adapted to the self-paced
      voice. Behavior note: Module 9's review unlock now ALSO requires the
      six re-tests marked "got it" (`isModuleReviewLocked` spans all module
      sets) — coherent with the tune-up-first intent, but flag if unwanted.
      Firestore summer-zero assumption verified by calendar reasoning only
      (modules launched 2026-07-10, it is summer break; no client query run).
      Session C ✅ 2026-07-10: **Ear Spark micro-drills, Modules 2–8.** One
      text-only step per module (no `response`, no `skills`, no manifest
      change — zero Firebase surface), added as a NEW final section
      "⚡ Ear Spark — optional ear bonus" at the end of one Station C per
      module: m2w1 (open strings), m3w1 (power vs full), m4w2 (sing-then-
      find), m5w2 (major vs minor), m6w2 (rhythm echo), m7w2 (mini-F vs
      barre), m8w2 (bass-string tracking). Placement chosen per set-content
      fit (spec left the set unspecified). Appending a new SECTION (not a
      step inside the wrap-up) keeps every existing `${'{'}setId{'}'}-{'{'}station{'}'}-sec{'{'}gi{'}'}-{'{'}i{'}'}`
      response/done key untouched — verified via node VM harness (each Spark
      is the last section of the right set, single step, responseless). The
      spec's partner-based texts were rewritten SOLO-FIRST (record yourself
      in a shuffled-slip order → name what you hear on playback), with the
      partner version kept as a one-line tail; each drill's teaching kernel
      (hollow power chords, sing-first trick, etc.) preserved verbatim.
      Session D ✅ 2026-07-10: **second-voice videos, play-alongs.** All six
      new URLs search-found and oEmbed-verified live (HTTP 200, titles
      quoted): m12w3 former video placeholder → "La Derrota - Vicente
      Fernandez - Guitar Lesson - requinto - tutorial - part 1 (ENGLISH)" /
      Jorge Aguilera (cRJb_f4-M5g — Spanish-lane content, comment in file
      asks Jonathan to review fit); m12w1#2 → "A Total Beginners Guide To
      Travis Picking" / Andy Guitar (XQiaCSabQaE); m8w2#2 → "Fingerpicking
      for Beginners - Pluck Patterns and Walkdowns" / Lauren Bateman
      (AFyqe-rfxTU); m11w1#2 → "Understanding CHORDS (Ep. 3 Music Theory)" /
      Paul Davids (BIWEcDGB5lA); m11w2#1 → "What chords sound good
      together? | Music theory ep. 7" / Paul Davids (6U8-Y7DEzOE) —
      deviation: replaced slot #1 not #2 because it was a verbatim duplicate
      of m11w1's video; m10w3 → "How To Develop The World's Greatest Ear" /
      Rick Beato (rPSRH3tf5B8) APPENDED as an optional third watch step
      (both existing slots were load-bearing; spec allows append). Swapped
      URLs+texts strictly IN PLACE (no step reordering); stale Marty hints
      and 0:00–3:00 ranges on replaced videos cleaned up. Play-along pilot
      steps appended as new final Station C sections in m6w2 and m12w1
      (0.75× full-pass challenge). Two-voices policy added to CLAUDE.md
      (Lessons learned). NOT done, honestly: the watch-range sweep for
      Modules 10–12 (YouTube pages don't expose durations to fetches;
      assigning ranges without durations would mean inventing timestamps —
      same hazard as inventing IDs; needs a YouTube API key or a manual
      pass) and performance-first reordering (no current pair contains a
      full-performance video; nothing to reorder). MC-retargeting was
      satisfied by folding compare-the-teachers prompts into the swapped
      steps' texts/responses rather than adding keyed MCs about video
      content I can't verify. checks.mjs full link check: 159/159
      reachable.
      **Session D judgment calls (for Jonathan's review):**
      1. *Requinto video is live pending review* — the spec said fill the
         slot, but the original placeholder said Spanish-lane content gets
         Jonathan's review first. It's live with an in-file comment; watch
         2 minutes of Jorge Aguilera's La Derrota lesson and veto if it
         doesn't fit.
      2. *m11w2 swap took slot #1, not #2* — the spec's replace-#2-only rule
         would have protected a verbatim duplicate of m11w1's video; the
         duplicate was the right thing to replace.
      3. *Beato was appended, not swapped* — both existing m10w3 slots
         anchor that set's drills (movable-pattern MC, sing-then-find habit);
         the spec's append-only alternative was used instead.
      4. *No invented timestamps* — watch-range sweep skipped (durations
         unavailable to fetches); performance-first reordering skipped (no
         performance video exists in any current pair). Compare-the-teachers
         prompts went into step texts/short responses instead of keyed MCs
         about video content that couldn't be verified.
      Session E ✅ 2026-07-11: **12-bar blues form & shuffle feel** (the
      most-corroborated research gap — 6 of 10 platforms). Module 11
      (m11w3): new Station B section (Marty Music "12 Bar Blues Lesson For
      Beginners" — oEmbed-verified XFuXLSIYH7s, chosen over JustinGuitar
      candidates per the new two-voices policy since both existing m11w3
      videos are Justin's — plus the spec's two verbatim MCs on the three
      chords and shuffle feel); new Station C section (A7/D7/E7 chord specs
      verbatim from spec, the 12-bar map step with quick-change note, and a
      comp-record-loop-solo challenge — spec's partner jam adapted
      solo-first with partner tail); skills m11w3-s7/s8 appended with the
      spec's verbatim gotItWhen texts; blues assessItem appended to
      MODULE_REVIEWS[11] (solo-first adaptation). Module 10 (m10w2): skill
      m10w2-s7 appended (playSeq notes [45,48,50,51,52,55,57] verified
      identical to the file's existing blues-scale spec before reuse); "Jam
      it" step appended as a new final Station C section pointing at Module
      11 Set 3's bar map. MODULE_MANIFEST: 10 → 19, 11 → 20 (checks.mjs
      verifies, passes). M4's 12-bar Choice item and M10's levelUp left
      untouched per spec. All sections/skills/steps appended at array ends —
      no index shifts.
      **Session F CUT by Jonathan 2026-07-11** (before implementation) — the
      visual/audio self-assessment feedback layer was dropped in favor of a
      future mic-listening rubric-feedback app (see memory: to be built
      after tuner improvements). RESEARCH_UPGRADES.md carries a tombstone;
      Session G's references to F's feedback UI were patched to plain
      inline feedback. The `mr{N}-assess` Firebase key and the
      assessItems-append-only rule therefore never took effect.
      **Tuner-jitter fix ✅ 2026-07-11** (the Known-issues pass, pulled
      forward as Session G's prerequisite): in `tuner.js` — RMS volume gate
      (0.006) ahead of BOTH detectors (HPS previously ran ungated on
      between-pluck room noise — the main jitter source), 5-frame rolling
      median between raw detections and the display (lone octave-error
      frames are swallowed; 3 consecutive >1-semitone frames = real new
      note, window resets for fast response), EMA simplified to a gentle
      0.25 on top of the median, 2-cent needle hysteresis + .18s ease-out
      CSS transition, sticky in-tune verdict (enter <±8¢, exit >±11¢), and
      2-frame note-name stability in auto mode. String-locked mode
      unchanged. Verified via node VM simulation of the stabiliser
      (steady-note deviation 3.9¢ max with injected octave outliers, zero
      leaks; new-note tracking in 3 frames ≈0.2s; 2-frame harmonic bursts
      swallowed with instant recovery). Real-mic spot-check on an actual
      guitar still worth doing — synthetic signals aren't a guitar.
      **Tuner round 2 ✅ 2026-07-11** (Jonathan live-tested on localhost
      with a real guitar): (a) high strings were shy under the flat 0.006
      gate — split into a two-tier gate (YIN 0.002 / HPS 0.006; YIN's dip
      threshold is its own quality bar so it can listen deeper without
      hallucinating; HPS stays hard-gated) and raised YIN's dip threshold
      0.15 → 0.22 for shallow quiet-pluck dips — the median + note-stability
      layers discard whatever marginal detections slip through; verdict
      after testing: quiet high-e registers on a gentle pluck, silence still
      shows "Play a string…". (b) Removed the tuner's Start/Stop button —
      opening the popup starts the mic, closing stops it (wired in app.js
      togglePopup; closePopup already stopped it); `toggleTuner()` and
      `#tuner-btn` removed, no stragglers.
      **Session G ✅ SUPERSEDED & SHIPPED 2026-07-11 — Listening Coach**
      (Jonathan replaced the G1/G2/G3 three-sitting plan with a single
      rubric-feedback app; agreed rubric: five criteria × three levels —
      Needs work / You're getting it / Great — one sentence each). New shell
      file `coach.js` (~550 lines): mic capture mirrors tuner.js (raw-audio
      constraints, 70Hz–1.5kHz band-limit), onset detection = RMS jump over
      a smoothed level (2.2×, 140ms refractory, 0.010 floor), pitch = YIN
      trimmed to tau ≤ sr/60Hz (a fraction of the tuner's scan — Chromebook-
      cheap at ~20Hz), events = onset + 240ms of median-pooled readings.
      Matching is greedy per event into ±1 slot of the count-in grid, with
      the grid offset easing toward the student (EMA 0.15) so mild drift
      keeps matching; pitch-class first, octave second (octave-off counts,
      with a note). Tempo steadiness is deliberately measured from raw
      hit-to-hit intervals, NOT slot indices — the VM test harness caught
      that a rushing student's drift is invisible in slot-matched data (the
      matcher assigns notes to the beats they landed on); intervals rounded
      to whole beats vs the median survive a missed note. A clearly-wrong
      note caps the pitch criterion at level 2 (85% ratio alone rated 6-of-7
      "Great" — also caught by the harness). Entry points rendered by
      app.js: `coachBtnHtml` inside all four `.bpm-control-group` sites
      (stations playSeq, buildTab, routinePlaySeq, renderPracticePanel) and
      `coachChordBtnRowHtml` under every step's `chord-diagrams` (midis
      computed from the step's own diagram specs, chordMidis fret math).
      Chord checks: strum-per-beat script, 4 beats per chord, two passes;
      the changes criterion scores boundary-strum timing and never claims a
      chord NAME (dominant-pitch-class ∈ chord tones is a hedge, worded as
      such; all-percussive takes score timing and say so). Honesty gates:
      <30% matched → "I couldn't hear that clearly", never a verdict;
      quiet-room line on every card; on-device/privacy line in the footer;
      mic only during a check with a red pulsing indicator. Mic exclusivity:
      opening the tuner calls `coachInterrupt()` (app.js togglePopup),
      starting a check closes the tuner; ▶ Play / strum / tab-note demo
      audio is silenced while the Coach listens (it would score itself —
      guards in playSequence/playBeat/strumChord). 3-clears-in-a-row streak
      line (sessionStorage, per-drill). No Firebase writes anywhere —
      in-the-moment coaching, not stored grades. Also fixed in passing:
      sw.js ASSETS was missing module-9…12.js (Semester 2 modules weren't
      precached for offline); added along with coach.js, and coach.js added
      to checks.mjs SHELL_FILES. checks.mjs passes (validate + SW bump);
      logic verified via node VM harness (9 scenarios: perfect / wrong-note
      / octave-slip / rushing / half-run / on-time changes / late changes /
      near-silence / muted strums — all verdicts sane, two real bugs found
      and fixed as noted). NOT built (honest scope): G1's video extension of
      Record Yourself (still a clean future add-on), strum-pattern-only
      steps with no playSeq/chords get no button (nothing to check against),
      and no chroma/chord-name identification (G3's go/no-go research says
      it needs real-guitar accuracy testing first). Real-guitar spot-check
      pending — Jonathan should run a melody check (Module 4 Pattern 1) and
      a chord check (Module 5 Am↔Em) on Live Server: browser automation was
      declined this session, and synthetic events aren't a guitar.
      **Coach TAB add-on** (same day, Jonathan's ask): melody checks now show
      the expected notes as a real TAB grid in the card's ready + listening
      phases (reuses `renderTabBlock`). Steps with a real `tab:` spec pass
      their exact string/fret through (`data-tabnotes` from buildTab);
      bare-midi playSeqs get `coachDeriveTabNotes` — finds the lowest 4-fret
      box that fits EVERY note (open position first), placing notes
      thickest-string-first, so the Pattern 1 Climb derives the official
      frets 5–8 box note-for-note (VM-tested against module-4's tab spec)
      while first-position drills stay in frets 0–3; derived tabs carry a
      one-line "one way to finger it" hedge since midis alone can't prove
      intent (e.g. the C-major-pent step teaches the 8th-fret box but its
      pitches also fit open position). Mini-chord arrays → no tab shown.
      **Note Hunt ✅ 2026-07-11** (fretboard trainer game — Jonathan's pick
      from the research backlog, go-ahead given in-session): fourth floating
      tool (amber FAB, target icon) in index.html's fab-group; game logic
      appended to coach.js, reusing the shared mic pipeline (getUserMedia +
      band-limit + analyser refactored into `coachAcquireMic()`, used by
      both the Coach card and the game) and `coachDetectPitch`. Prompt names
      a note + string ("Find G on the A string"); detection = 4 agreeing
      readings within 0.6 st (median → midi), one-pluck-one-answer via a
      decay-to-silence gate (or 1.8s timeout) + 700ms cooldown. Exact-midi
      match required (string can't be proven from pitch alone — exact octave
      is the honest proxy; open-G vs A-string-10 collide, accepted). Wrong
      answers coach, not punish: fret-distance hints ("go 2 frets up
      (toward the body)"), octave-slip hints, retries don't advance the
      round; Skip reveals the fret. 10 prompts/round, score = first-try
      finds. Five levels (Open / E·A / D·G / B·e / All 6; naturals, frets
      0–9 — Modules 9–10 territory), level persisted in sessionStorage.
      Mic exclusivity extended three ways: tuner-open closes Note Hunt,
      fretStart closes tuner + coach card, coachStartCheck closes Note Hunt;
      'fret' added to the outside-click and Escape close lists. Verified via
      VM harness (1000 generated prompts valid across all levels; judging /
      hint / skip / scoring paths; perfect round renders 10-of-10) — no
      module-content or manifest changes, no Firebase surface. Real-guitar
      test pending alongside the Coach's.
      **🎮 Games panel + Change Up ✅ 2026-07-11** (Jonathan: chord-change
      game; games must live somewhere other than the floating tools
      corner). New home: a **🎮 Games button beside ⚡ Daily 5** opening a
      full-width `games-panel` (daily5-panel pattern) with a hub of game
      cards → game views with "← All games". Note Hunt MOVED there — its
      FAB + popup removed from index.html and all 'fret' wiring removed
      from app.js togglePopup/closePopup/click/Escape lists (fretLoop now
      keys off `#fret-body` existing). **Change Up** (in coach.js): pick a
      chord loop — level = loop length, 2 chords back-and-forth (Am↔Em,
      G↔C, A↔D, E↔Am), 3 (A–D–E, G–C–D, Am–C–G), 4 (C–G–Am–F, G–D–Em–C,
      Am–F–C–G; all in CHORD_DIAGRAMS, diagrams shown via localChordSvg
      with the current chord highlighted) — pick a BPM (40–140), 4-click
      count-in, then strum every beat over a SILENT visual pulse (big
      chord + next-chord preview + beat pips; audible clicks would bleed
      into the mic) for 8 bars, chord switching per bar. Grading per
      CHANGE (7 per round): onset within max(140ms, 0.3 beat) of the new
      bar's beat 1 (grid offset EMA-adapts like the Coach) + chord-tone
      plausibility via pitch-class of the strum's readings (never a
      claimed chord name; percussive/unclear counts on timing alone).
      Report: X-of-7 verdict, worst-transition callout ("Drill just
      G → C — start moving your fingers on beat 4"), tempo ladder (≥85% →
      +10 BPM highlighted, ≥50% → again-at-same, else −10), session best
      BPM per loop in sessionStorage (`ccBest:`). Mic exclusivity: tuner
      open / Coach check → `gamesStopMic()` which also returns the panel
      to the hub (a stopped game view would lie about listening); games
      panel hidden in print CSS. VM-tested (cc-test.mjs: loop/changes
      construction, tone grading ok/off/percussive, miss fill, verdicts,
      worst-transition callout, ladder clamps 40–140, best-BPM storage) +
      all four earlier suites still pass.
      **Resource panel → lightbox modal ✅ 2026-07-11** (Jonathan: the
      blank right frame is ugly; videos should pop up on click). The fixed
      right-side resource panel, its resize handle (drag + keyboard a11y +
      iframe drag-shield), and the fab-repositioning logic are all REMOVED;
      layout is single-column (`.app-layout .main` max-width 860px,
      centered) and the fab-group sits at its CSS-fixed right offset.
      `loadPanel(type,url,title,subtitle)` keeps its exact signature — all
      rp-trigger / song-card / chord-string-note-link call sites untouched —
      but now fills a centered `#video-overlay` lightbox (inside `#app`, so
      it can't show pre-auth; z-index 200, above the fabs). Same element
      ids (rp-content/rp-iframe-wrap/rp-meta/rp-newtab/rp-close) moved into
      the modal so every type renderer (youtube 16:9, pdf/gdoc at 72vh,
      chord/string/note local SVGs) works unchanged; meta card restyled as
      the modal header. Close = ✕ / click-outside / Escape (added to the
      existing Escape handler); clearPanel() empties the iframe wrap, which
      stops playback. Also swept out with the panel: the long-dead looper
      CSS (looper.js was removed eras ago; ~60 orphaned rules) and the
      rp-empty placeholder styles; print-hide list swaps panel classes for
      `.video-overlay`. Note: `rp-` class prefixes now read as "resource
      pop-up" — kept to avoid touching every call site.
      **Modal → floating mini-player, same day** (Jonathan: questions must
      stay visible while the video plays): the backdrop and click-outside
      close are gone — `#video-overlay` is now a fixed 480px-wide card
      docked bottom-right (above the fabs), page fully interactive behind
      it. Draggable by `.vm-head` (mouse + touch; first drag converts the
      CSS right/bottom dock to left/top; `.dragging` disables iframe
      pointer-events so the drag doesn't die over the video; viewport-
      clamped, re-clamped on window resize and on each loadPanel via
      `clampViewer`). Docs render at 56vh inside it; YouTube's own
      fullscreen button covers watch-it-big. Also fixed: `.fab-group`
      still had `right:345px` from the old panel-width days — now 24px
      (the JS that used to position it died with the resize handle).
      **Note Hunt fret range 9 → 10** per Jonathan (all fretted levels,
      VM test asserts fret-10 prompts occur). Mini-player **live-tested by
      Jonathan 2026-07-11 — approved** ("videos are great"); the mic
      features (Coach checks + games) are the only real-guitar tests
      still pending.
      **Bug-hunt + hardening pass ✅ 2026-07-11** (adversarial review of the
      whole session's diff; 8 finder angles, 6 completed — the line-by-line
      and cross-file angles were cut short by a usage-limit reset, though
      their headline checks (global name collisions across the four script
      files, onclick target existence) were re-run by hand and came back
      clean). 10 findings confirmed and FIXED: (1) critical — coachOpen
      killed a running game's mic stream without resetting the game (frozen
      deaf "Listening…" UI); now gamesStopMic() evicts first, and both game
      loops self-stop if the analyser vanishes; fretStart also evicts
      Change Up. (2) mini-player (z 200) buried the FABs/tool popups
      (z 100) — now z 90, tools always win, card is draggable away.
      (3) aria-modal removed from the deliberately non-modal player (it was
      telling screen readers the page behind was inert). (4) drag listeners
      now attach only during a drag — the permanent non-passive document
      touchmove was janking every touch scroll site-wide. (5) shared
      coachReadFrame() + one reusable Float32Array replaces per-frame 16KB
      allocations in all three mic loops (~1MB/s GC garbage on Chromebooks),
      and coachLoop skips all audio work during the count-in. (6) Note
      Hunt's YIN cadence 30Hz → 20Hz (was burning ~75M ops/s on ambient
      noise above the 0.004 gate). (7) checks.mjs now parses sw.js ASSETS
      and fails if any listed file is missing on disk OR any SHELL_FILES
      entry is missing from ASSETS (both drifts were previously silent).
      (8) chordSpecMidis() extracted — chordMidis and the coach chord-button
      payload share one diagram→MIDI mapper; readGroupBpm() extracted for
      the same reason (slider-reading duplicated in app.js + coach.js).
      (9) dedup: coachCountIn() (count-in was 2×), tunerMedian reused (4
      inline medians), COACH_FOOT_HTML (privacy line was 5× in 3 wordings).
      (10) dead weight removed: write-only coach.extras, unused ci param,
      fretGame's parallel asked/score counters (derived from results now),
      #fret-popup/.fab-fret CSS from the abandoned popup design, CHANGELOG
      emoji heading. Deliberately SKIPPED: merging coachDetectPitch into
      detectPitchYIN (tuner hot-path refactor, drift is self-healing NaN),
      BPM-stepper HTML dedup (two variants, different clamps, cosmetic),
      a shared playable-group builder (all four sites consistent today).
      coach.js marked intent-to-add (`git add -N`) so a modified-files-only
      push can't ship references to a missing file. All 5 VM suites pass
      post-fix; checks.mjs green including the new ASSETS parity guard.
      **Content gaps filled ✅ 2026-07-11** (from the self-paced audit's
      assessed-but-never-taught list; Jonathan picked all four Semester 1
      items; steps appended at section ends only — index-safe for saved
      responses; no manifest changes; no video links): **M2** Let It Be
      bass-line step (C–G–A–F roots TAB, midis 48/43/45/41) + Mystery TAB
      cold sight-read drill (original 8-note melody, A/D strings frets 0–3,
      play-then-check self-test); **M3** split strum ("boom-chick") taught
      in Set 2 after the eighth-note assessment piece, with root-vs-chord
      playSeq demo (A5/D5); **M4** four-phrase solo plan (say it → repeat
      it → stretch it → come home) tied to Rule of 3, closing the
      "four-phrase" skill/assessItem gap; **M5** Mystery Chart drill
      (unlabelled Am vs Em diagrams + keyed MC), folk strum D-DU-UDU
      taught as a real step (was only a levelUp aside; G→C chord-strum
      playSeq), and a 3/4 waltz strum step (Em, strong beat 1). M2/M5
      steps were drafted by Opus subagents and reviewed; M5's folk-strum
      demo corrected from note-sequence to chord-array strums.
      **Navigation pass ✅ 2026-07-11** (Jonathan picked all four proposals).
      New in app.js (one NAVIGATION section) + index.html + styles.css:
      (1) **panel footers** — every set tab-panel ends with a "Next →"
      button (Station B → C → checklist → next set → Module Review), via
      `panelFooter(w, tab)` in buildSet and `switchTabById(wid, tab)`
      (finds the real tabs-card so active styling stays consistent), plus
      a fixed **↑ Top** button (bottom-LEFT; fabs own bottom-right) shown
      past 600px scroll. (2) **checklist → lesson jumps** — steps now emit
      `data-skills` (from their existing skills:[n] tags); each checklist
      row whose skill is taught in-set gets "📍 Show me where"
      (`showSkillLesson`) → switches station tab, opens collapsed
      sections, scrolls + flashes matching steps (.step-flash animation).
      (3) **♪ Songs hub** — button beside Games; aggregates module-1
      per-set songs + MODULE_SONGS[2..12] after `ensureAllModuleData()`
      (loads data only, not panels), dedupes by name, core six first,
      rows carry Journey/tutorial/backing/original buttons + "Taught in:
      M4 M7" module jumps. (4) **🔍 Find** — search panel; index built
      once from all modules' steps (station/section/step coordinates),
      skills, and set titles (~700 entries); AND-of-terms substring match,
      skills ranked first, 25 results; step hits deep-link via
      `jumpToStep` (activate module+set → station tab → open section →
      scroll+flash), skill hits reuse showSkillLesson. Top-bar panels
      (Daily 5 / Games / Songs / Find) are now mutually exclusive via
      `closeTopPanels`. New nav-test.mjs VM suite (footer chain, skill
      lookup, checklist buttons, index coverage/coordinates) — it caught
      one real bug pre-ship: MODULE_MANIFEST is an ARRAY, so the original
      Object.keys iteration would have fetched module-0.js and skipped
      module 12 in search/songs. All 6 suites + checks pass.
      **Station-order flexibility note ✅ 2026-07-11** — Jonathan asked
      whether B→C order matters and whether to drop the station framing
      entirely. Decision (his pick from three options): KEEP the Station
      B/C names, add flexibility guidance. Analysis for the record:
      Station C is ~self-contained (near-zero references to B's videos in
      Modules 2–5; the only true cross-refs are M6/M12 play-along steps
      that link to B explicitly), so C-before-B is survivable but
      suboptimal for first-contact material; classroom rotations should
      stagger by SET (group 2 does yesterday's set's C), not flip
      stations. Implementation: every Station C panel now opens with a
      .st-flex-note — "First time on this set? Do Station B first …
      Back on another day just to practice? Perfect — split days are how
      skills stick," with an inline switchTabById link to B. Renders only
      when the set has a B station; print-hidden. A fuller rename
      (Learn it / Play it) and a B+C merge were considered and declined
      — notes on costs live in this entry's conversation (2026-07-11).

- [x] **Semester 2 build — Modules 9–12** (`MODULES_9_12.md`, decision-complete
      spec, four sessions A–D — all four complete). Session A ✅ 2026-07-10: built **Module 9 —
      The Full Fretboard & Writing TAB** (3 sets, 18 skills — naturals on D/G,
      naturals on B/high-e + the B-string bump, higher-position TAB reading +
      writing your own TAB, slash chords). Added all four Module 9–12 rows to
      `MODULE_MANIFEST` in this session (confirmed `checks.mjs` only *warns*,
      doesn't fail, on a manifest row with no matching Sets yet — so no stub
      files needed; later sessions just add their module file). Rewrote
      `MODULE_REVIEWS[8].forward` (was "everything from here is just
      songs," no longer true). oEmbed-verified all 3 reused videos; 2
      VIDEO-TODO placeholders left for Jonathan (B-string octave-shape demo in
      m9w2, writing-TAB demo in m9w3). Two Choice-song slots from the spec
      doc couldn't be filled — "La Diabla" and "American Girl" don't exist
      anywhere in the repo (grepped all module files) — dropped per the doc's
      own never-invent-a-URL rule; Module 9 ships with 3 Choice songs instead
      of 5, and the doc's assumed Spanish Choice slot (La Diabla) is empty.
      Also corrected a stale filename in the doc (`tabs/sweet-child.html` →
      the real `tabs/sweet-child-o-mine.html`), and substituted a real
      existing video-tutorial reference for m9w1's "Take It to a Song" step
      since no up-the-neck intro-riff TAB actually exists yet on that Journey
      page to reuse (out of scope to add one — Journey pages are frozen).
      `checks.mjs` passed (145 links, 3 expected warnings for Modules 10–12
      not yet having Sets). Live-Server browser verification was **not**
      performed (no running dev server in this environment) — Jonathan may
      want to spot-check visually. Session B ✅ 2026-07-10: built **Module 10 —
      Scales, Keys & Ear Training** (3 sets, 18 skills — the W-W-H major-scale
      recipe, relative/parallel minor, the blues scale, transposing box 1,
      major-vs-minor ear training). Manifest row for Module 10 already existed
      from Session A. oEmbed-verified 3 video IDs; the JustinGuitar EXTRACT-tier
      lesson page (major-scale-why-and-how-sc-202) is behind a Cloudflare bot
      challenge that blocks `curl` outright (`cf-mitigated: challenge`, no
      header combination got past it) — fell back to a VIDEO-TODO placeholder
      per the doc's tier-3 protocol. Also dropped the doc's [VERIFY-THEN-USE]
      Marty blues-scale candidate (`qwI_-x-QE1c`, "Ultimate E Blues Scale
      Run") to a VIDEO-TODO — it oEmbed-verified fine but reads as a fast lick
      showcase, not a beginner concept intro, so it failed the doc's own
      too-advanced judgment call. One Choice-song slot from the spec doc
      couldn't be filled — "good 4 u" doesn't exist anywhere in the repo
      (grepped all module files) — dropped per the never-invent-a-URL rule;
      Module 10 ships with 4 Choice songs instead of 5, but the Spanish slot
      (Ella Baila Sola) *was* found in module-5.js and is intact.
      `checks.mjs` passed (145 links, 2 expected warnings for Modules 11–12
      not yet having Sets). Live-Server browser verification **not**
      performed (no running dev server in this environment). Session C ✅
      2026-07-10: built **Module 11 — Chords, Keys & Harmony** (3 sets, 18
      skills — triads & Roman numerals incl. Luna's F–Am as I–iii, finding a
      song's key from its chord inventory, slash chords, movable E-shape/
      A-shape barre chords as harmony tools, I–IV–V in any key). Manifest row
      for Module 11 already existed from Session A. The doc's EXTRACT-tier
      "How to Find Guitar Chords in a Key?" lesson page hit the same
      Cloudflare bot-challenge wall Session B found (`curl` 403,
      `cf-mitigated: challenge`) — both m11w1 video slots fell back to
      VIDEO-TODO placeholders per the tier-3 protocol; m11w2's video slot did
      the same, with its optional second slot filled by reusing the
      already-verified Watchtower listen clip (`bT7Hj-ea0VE`) as a
      "listen and decide by ear" step instead of leaving it empty. Three
      Choice-song slots from the spec doc couldn't be filled — "No Se Va,"
      "American Girl," and "good 4 u" don't exist anywhere in the repo
      (grepped all module files; the latter two were already confirmed
      absent in Sessions A/B) — dropped per the never-invent-a-URL rule;
      Module 11 ships with 2 Choice songs instead of 5. Also substituted
      Watchtower's Am–G–F loop (vi–V–IV in C) for the doc's "Take It to a
      Song" step in m11w2, since it originally pointed at the now-dropped
      "No Se Va." All chord-diagram specs (C/Dm/Em/F/G/Am/D/Bm, the G/B slash
      chord, and the F/Bm barre shapes) were copied byte-identical from
      module-5.js, module-8.js, and module-9.js rather than retyped.
      `checks.mjs` passed (145 links, 1 expected warning for Module 12 not
      yet having Sets). Live-Server browser verification **not** performed
      (no running dev server in this environment). Session D ✅ 2026-07-10:
      built **Module 12 — Fingerstyle: Travis, Waltz & Requinto** (3 sets, 18
      skills — alternating-thumb Travis picking + the pinch, the 3/4 waltz
      pattern, and requinto-style melody-over-thumb texture; the capstone
      builds past Module 8, no re-teaching). Manifest row for Module 12
      already existed from Session A. All 8 songs in the doc's Module 12 song
      list ("the cure," Let It Be, Luna, House of the Rising Sun, Tu Boda,
      Sailor Song, Blackbird, Just Like Heaven) were found and copied
      verbatim from module-8.js/module-9.js — first session with zero
      dropped songs. All 3 REUSE videos oEmbed-verified live (`rGt-lMXYzZc`
      "Folk Fingerstyle Patterns #1of2 [FO-101]", `K2Z3RZc5t-A` "Basic
      Fingerstyle - Travis Finger Picking [FO-108]", `YZkkUjDDamA` "Beginner
      Fingerpicking Made Easy: Pinch, Pluck, & Play!"); 2 VIDEO-TODO
      placeholders left per the doc (m12w2's 3/4-pattern demo, m12w3's
      requinto/sierreño intro — the latter explicitly flagged in the doc for
      Jonathan to review before it goes live, being Spanish-lane content).
      m12w3's Luna reference links to the Song Journey page (`tabs/luna.html`
      Layer 6) directly rather than a YouTube video, per the doc. `checks.mjs`
      now passes with **zero warnings** for the first time — all 12 modules
      have Sets (34 Sets total, 203 skills across the manifest, 145 unique
      links all reachable — no new unique URLs since every Module 12 link
      reuses an existing Module 8/9 URL). Confirmed `MODULE_MANIFEST` has
      exactly 12 entries and the "X of 12 modules" label in `app.js` derives
      from `MODULE_MANIFEST.length` automatically — no hardcoded count to
      fix. Progress-strip visual width at a ~380px viewport was **not**
      checked (no browser/dev server in this environment) — Jonathan should
      eyeball it; do not redesign the strip without his input. Live-Server
      browser verification also not performed. **All four sessions of the
      Modules 9–12 build are now complete** — Semester 2 is fully live.
- [x] **Song-list review session** (doc retired after completion) —
      consolidated every module's per-set Choice-song lists into one
      module-level list per module (2–8; Module 1 untouched, out of scope),
      rendered as a collapsible "🎵 Songs" section. ✅ 2026-07-09 (`d77732e`).
    - **Session 1 — survey.** Inventoried all 8 modules' song lists (126
      Choice entries across 21 per-set lists), proposed a 4–5-keeper cull per
      module against appeal/skill-fit/diversity/no-duplicate-job criteria,
      confirmed Oye Mi Amor's retagged levels (M6: 2, M7: 3), found Just Like
      Heaven didn't exist anywhere in the codebase yet, and wrote the render
      spec. Output: `SONG_CULL_SURVEY.md` (now retired — full per-module
      keep/cut reasoning lives in this commit's diff and history).
    - **Spanish-slots addendum.** Jonathan set a new rule — at least one
      Spanish-language Choice song per module 2–8. Modules 4/6/7/8 already
      had one (La Bamba · Oye Mi Amor + Tu Boda ×2 · Tu Boda); Modules 2, 3,
      5 had none. Added La Bamba (swap for Eye of the Tiger, M2), De Música
      Ligera (swap for Should I Stay or Should I Go, M3 — corrected from a
      2-chord guess to the real Bm–G–D–A riff), and Ella Baila Sola (swap for
      Hey Jude, M5), all oEmbed-verified.
    - **Session 2 — build.** Jonathan approved the survey as-written (no
      markup). Data layer: added a `MODULE_SONGS[N]` global per module
      (mirroring the existing `MODULE_REVIEWS[N]` pattern), migrated every
      Core/Supp song + the approved 5 Choice keepers into it, deleted the
      old per-set `songs:` arrays. Just Like Heaven was added to Module 8 —
      since it had to land as a straight swap (5 songs, not 6) and "Nothing
      Else Matters" (the instructed swap target) turned out not to be one of
      Module 8's 5 keepers, Hallelujah was dropped instead (same "moody
      arpeggiated ballad" job as JLH; Hallelujah remains a keeper in Module
      5). UI layer: new `buildModuleSongs()` renders each module's list as a
      collapsible section (closed by default) reusing the existing Station
      B/C collapse mechanism and song-card markup; also fixed a latent crash
      (`buildSongs` was still called unconditionally on the now-removed
      per-set `songs:`, which would have broken every module 2–8 on open).
      Teacher view never rendered songs before or after — no change needed
      there. Verified live in-browser (all 8 modules, zero console errors);
      `checks.mjs` passed with 145 reachable links (down from ~240 — expected,
      fewer redundant per-set duplicates). 3 quiz distractor swaps (m6
      reggae · m7 stacked-TAB pair · m2 H→G#) reviewed, none marked for
      revert — left as-is.
    - **🎤 Class-request slot — added, then removed same day.** The build
      originally included a data-driven "🎤 Class request" entry per module
      (2–8), mirroring Module 1's older static request prompt. Jonathan asked
      for it removed shortly after. ✅ 2026-07-09: pulled the entry from all
      7 module files plus the now-dead render branch in `buildModuleSongs()`;
      left Module 1's original, separate `buildSongs()` request row (June
      2026, `72eeeca`) untouched — Jonathan scoped the removal to Modules
      2–8 only. `checks.mjs` passed.
- [x] **Luna requinto intro TAB** — transcribed from Jonathan's uploaded
      official tab/chord chart. ✅ 2026-07-10 (`840424f`). Also caught and
      fixed a chord error the docs surfaced: the site taught "Dm–C in the
      chorus," but the official chart has no C chord at all — Luna is F–Am
      throughout with Dm only a brief passing chord near the end of the verse
      and in the closing bridge. Corrected across Module 5's Luna challenges
      and the Song Journey page; added the intro riff as a new bonus Layer 6
      (rolled arpeggio through the Layer 5 little-F shape) rather than
      folding it into Layer 5, so each layer still teaches one new tool.
