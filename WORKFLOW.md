# WORKFLOW.md — Guitar Class

> Build history lives in `archive/`:
> **`WORKFLOW-2026-buildout.md`** (original site build-out),
> **`WORKFLOW-2026-july-fixits.md`** (July 2026 fix-it era), and
> **`WORKFLOW-2026-research-upgrades-era.md`** (research-upgrade Sessions
> A–G, Semester 2 build, Listening Coach + games, mini-player, navigation
> pass — everything shipped 2026-07-11; its specs `RESEARCH_UPGRADES.md`
> and `MODULES_9_12.md` are archived alongside). Consult them for *why*;
> they drive no current work. All CLAUDE.md rules apply as always.

**Status legend:** [ ] not started · [~] in progress · [x] done

---

## Open work

- [x] **14-bug fix round ✅ 2026-07-11** — a parallel session's adversarial
      review (session 889bd894, workflow wf_b7b34045) found 14 confirmed
      bugs in commit 9eee1d0; all 14 fixed and verified: (1–3) mic
      acquisition races — post-await session guards in coachStartCheck/
      ccStart/fretStart + single-flight coachAcquireMic (pending-promise
      dedupe), so closing a card/panel during the permission prompt or
      double-clicking Start can no longer strand a live mic stream or
      brick every ▶ Play via a stuck coachMicLive; (4) "couldn't hear"
      gate now scales to drill length via coachMinHeard() — 2-slot drills
      (m3 F5↔A5, Luna vamp) were unpassable under the flat floor of 3;
      (5) YIN window scales to 4096 samples above 60kHz so low E is
      detectable on 88.2/96kHz devices; (6) chord-array melody slots
      label/anchor the ROOT (min midi), not arr[0]; (7) songs-hub video
      buttons switched to index-based songsHubVid() — escAttr'd
      apostrophes in inline onclick broke Sweet Child O' Mine et al;
      (8) playSequence stop-toggle runs before the coachMicLive gate +
      new stopAllDemoAudio() (sequences, strums, metronome) called by all
      three mic entry points; (9) tick() beep gated on coachMicLive;
      (10) body.viewer-open hides .fab-buttons while the mini-player is
      open (FABs covered YouTube's control bar); (11) .coach-start
      color:#fff→var(--bg) (was 1.76:1 in dark mode); (12) max-height
      accounts for the 96px dock + a max-height:520px breakpoint (landscape
      phones clipped the header/close off-screen); (13) back-to-top gets
      visibility:hidden while hidden (was an invisible tab stop); (14)
      .coach-mic #e74c3c→#c0392b + dark-mode #f2a39c (AA in both themes).
      All 6 VM suites (coach-test extended with gate + root-label cases) +
      checks pass. The same session's design plan lives in
      DESIGN_UPGRADES.md (untracked, proposal only — Jonathan's call).
- [x] **Assessment-coverage check, Modules 1–5 ✅ 2026-07-11** — Jonathan
      supplied the five unit assessments; compared task-by-task and
      requirement-by-requirement against MODULE_REVIEWS[1–5].assessItems
      (which render stateless — safe to edit in place). Result: M2, M3,
      M4, M5 fully covered (M4 includes the phrasing-strategy clause; M5's
      teacher-facing tasks use the settled self-paced adaptations). Fixed:
      M1 item 1 + "without restarting"; M1 item 3 + explicit tone bar
      ("every string ringing full and clean, no accidental muting from
      either hand"); M3 item 2 now names the two patterns (straight
      eighths / split strum) like the unit spec. Flagged to Jonathan, not
      changed: his assessment doc lists Luna as F–Am–Dm–C, but the
      official chart (settled fact 2026-07-09) has NO C — the doc, not
      the site, is off; also "Am5" in Unit 3 is presumably A5.
- [ ] **Real-guitar test of the mic features** — the Listening Coach
      (🎤 Check me / Check my changes), Note Hunt, and Change Up shipped
      live 2026-07-11 verified only by VM test harnesses (Jonathan's
      explicit call: push first, guitar-test after). Test on the live
      site: a melody check (Module 4 Pattern 1), a chord check (Module 5
      Am↔Em), one Note Hunt round, one Change Up round. If detection is
      too eager/shy, the knobs are the COACH_* constants at the top of
      coach.js — same tuning dance as the tuner rounds 1–2.
- [x] **Semester 2 content gaps** ✅ 2026-07-11, same day Jonathan asked
      (ultracode workflow: per-module Opus writer → adversarial auditor →
      fixer lanes; unpushed, awaiting his word). M7 — new appended Station
      C sections: a 2-bar G-string lick TAB carrying h/p// markings in
      destination-fret strings ('h7'/'p5'/'/9', midi = destination pitch,
      legend in caption) closing the recognise-AND-play gap, plus an
      F#-and-Bb full-barre challenge (Bb corrected by audit to the set's
      ring-finger sub-barre fingering; audit also fixed a factual error —
      Bb is NOT in Hotel California; now cited via Hey Jude's IV). M9 —
      "Higher Still" cold-read TAB appended after Read It Up High,
      entirely frets 5–10 across D/G/B (midis hand-verified), a
      partial-shape chart-reading step (top-3-strings D, keyed MC), and
      two assessItems appended to MODULE_REVIEWS[9] (3+-string melody;
      partial/slash chart). M12 — new final m12w1 Station C section:
      p-i-m-a claw-check reactivation (explicitly credits Module 8) and a
      dedicated 4-note arpeggio drill on Am→C (arp midis 45/57/60/64 and
      48/55/60/64, verified). M8 quirk — mr8-s3 review link retagged
      m8w2→m8w1 (Set 1 is the p-i-m-a check-off). Workflow war story for
      the record: the two audit lanes each mistook the OTHER lane's diff
      (and the parent's M8 fix) for out-of-scope leaks — M9's fixer
      reverted module-7.js, M7's fixer restored it from a recovery file
      with its should-fixes applied, and the parent re-applied the M8 fix;
      final disk state hand-verified (no duplicate sections, all midis
      recomputed, both audits' content checks passed). All 6 VM suites +
      checks.mjs pass. Every Semester 1 + 2 audit gap is now closed.
- [ ] **Research backlog (medium/low)** — stored One-Minute-Changes
      scores, tempo-ladder playSeq, Song Journey anatomy sections, bends,
      7th/sus chord color, songwriting capstone, Choice-song style lanes,
      motivation layer. Details in `archive/RESEARCH_UPGRADES.md`; do not
      start without Jonathan's go-ahead.
- [x] **Design upgrades, batches 1+2 ✅ 2026-07-11** (from
      DESIGN_UPGRADES.md, the parallel session's Ableton/Duolingo/Stripe
      study; Jonathan picked batches 1 and 2). Quick wins 1a–1h: purple
      family → --purple-* variables with dark-mode versions (all 15
      hardcoded lavender/indigo sites swapped; review-pill.active and
      similar use text-on-bg inversion for dark contrast);
      prefers-reduced-motion blanket rule; finger-sized tap targets
      (mstrip ::after hit area, wpill/ts-btn/tp-btn/tab-note-btn padding);
      --text3 #767670→#63635d; --shadow-card/--shadow-raised applied to
      popups/cards/modal; pressable primary CTAs (welcome-go, coach-start,
      panel-next, rec primary); ≤480px header rule; bpm-slider dup scoped.
      Success moments 2a–2e: tuner note pops green on the in-tune
      transition (.in-tune/.in-tune-pop, cleared on leave/reset); coach +
      Change Up reports wrapped in .coach-report slide-up; strip label
      appends "N skills left in Module X" / "Module X complete!";
      module-completion celebration (state-transition detected across
      renderProgressStrip renders, never on first paint; seg pulse + 6
      emoji particles, skipped under reduced-motion); hidden-tab handler
      in coach.js kills mic + closes tuner on visibilitychange
      (coachInterrupt gained a message param). All 6 VM suites (document
      stubs gained addEventListener/hidden) + checks pass. REMAINING in
      DESIGN_UPGRADES.md (items marked ✅ inline): 2f song badges (best
      motivation-per-effort; needs per-set data fields) and tier 3
      (rem text-size system, practice streak — needs design conversation,
      one-thing-per-screen, beat cursor).
      **2f song badges ✅ 2026-07-11** (same day, Jonathan's go-ahead):
      optional `songThread: [{name, journey, note}]` field hand-curated on
      21 sets across modules 1–9 + 12 — every entry evidence-backed by a
      Journey link or named drill INSIDE that set (song-list mentions
      don't qualify; the curation scan is in the session log). Rendered
      as a "🎸 This set unlocks:" row on the set header (names link to
      Journey pages, note in the tooltip) + a check-off echo under the
      checklist progress bar ("You can now play more of X", aria-live,
      rotates through the set's songs, 5s fade). M10/M11 deliberately
      untagged — their core-song mentions are exercise vehicles, not
      song-building drills. render-test asserts badge presence on m5w2
      and absence on untagged m5w1. DESIGN_UPGRADES.md 2f marked done;
      remaining there: tier 3 only.
- [x] **Warm-up → Daily 5 + backing-track reference audit ✅ 2026-07-11**
      (Jonathan's ask). (a) The ~19 generic 'Warm-up — tuning check
      (Module 1)' Station C sections (modules 3–5, 7–12) now render as a
      Daily 5 pointer card instead — RENDER-level swap in buildStations'
      sectionsHtml: the section object stays in the module data so every
      later section keeps its index (saved response/Mark-done keys are
      sec-index-based; render-test asserts sec1 numbering survives).
      First REAL section now opens by default. openDaily5Here() records
      scrollY, opens/refreshes the panel, scrolls up; the panel gains a
      '↩ Done — back to my set' button (daily5Return) that closes and
      scrolls back. Variant warm-ups KEPT deliberately (module-specific
      content fused in): m2w? 'tune up first (Module 1 review)', m6 ×2
      'tune + recall…', m11w3 'tuning check + Finger Gym' — flag to
      Jonathan if he wants those swapped too. Module 1 untouched (tuning
      IS its content). Hidden steps carried no skills/responses (scanned).
      (b) Backing-track reference audit: the 2026-07-09 song-list
      consolidation deleted the per-set song cards these texts pointed
      at ('▶ 🎵 Backing track on the Watchtower card below'). All 8
      stale references (6 in module-4 incl. MODULE_REVIEWS[4].performance,
      2 in module-5's m5w4 victory lap) fixed: improv steps now EMBED the
      real jam-track URL as an in-step ▶ 🎵 button (step-text YouTube
      anchors render as mini-player buttons; URLs reused verbatim from
      MODULE_SONGS[4] — Am=Vq8cApzOdy8, Luna Dm=wBxFnX_V9mQ — no new
      IDs invented), with 'more in the 🎵 Songs list at the bottom of
      this module' wording where choice matters. Site-wide grep confirms
      zero 'card below'/'song cards' references remain. Full link check
      passes (160 reachable).
- [x] **Design tier 3 ✅ 2026-07-11** (Jonathan: do all except 3b, which is
      CUT — do not build the practice streak). 3a: all 245 font-size
      declarations (styles.css + inline templates) converted px → exact
      rem so device text-size settings work; the plan's 6-step visual
      snap deliberately skipped (would visually change dozens of elements
      unreviewably) — noted in DESIGN_UPGRADES.md as a possible later
      cosmetic pass. 3c (structural form): stepsHtml reordered doers-
      first (playSeq/chords/TAB/response, then prose); hint and stuck/
      levelUp fold behind native <details class="step-fold"> chips;
      beforeprint/afterprint handlers open/restore folds so printed
      handouts show everything; the plan's editorial per-module text
      trims deliberately skipped (content untouched). 3d: renderTabBlock
      cells + note buttons carry data-seq (offset threaded across
      phrases); playSequence sweeps .beat-now across the owning .tab
      during playback, cleared in stopPlaySeq; playSeq buttons without a
      TAB simply have no cursor. DESIGN_UPGRADES.md fully annotated —
      every plan item now ✅ done or ❌ cut; the plan is closed.
- [x] **Second review round ✅ 2026-07-11** — 8-angle adversarial review of
      9eee1d0..HEAD (Sem-2 content + 14-fix round + design pass): 24 raw
      findings → 16 deduped, ALL fixed and pushed. Correctness: stale-
      session micOff could kill a NEWER session's stream through the
      single-flight acquisition (now coachReleaseMicIfIdle — deferred
      orphan check); document.hidden bail after the permission await
      (hidden-tab privacy hole); stopAllDemoAudio moved post-guard in
      coachStartCheck (demo started during the prompt was scored);
      module-7 articulation lick got tab-level `noCoach: true` honored in
      buildTab (2 picks + 3 slurs vs 5 expected onsets — correct technique
      failed the check); _moduleStripStates reset on sign-out (shared-
      device confetti leak, found by 4 angles independently);
      stopAllDemoAudio sweeps stale .playing classes; stopTuner/
      selectTunerString clear .in-tune classes; setSaveMsg stale-timer
      fix (could wipe 'Save failed'); startMetro refuses while
      coachMicLive (armed-but-silent metronome). Cleanup: openSongVid
      unifies 3 drifted video launchers; flashClass unifies 5 flash
      copies (incl. tuner pop); coachEvictTuner unifies 4 eviction
      copies; tuner open now silences demo audio; checks.mjs gained
      journey-path validation (every hand-typed tabs/*.html must exist —
      ~30 refs, previously unvalidated); .coach-mic dark override moved
      adjacent to base; badge count corrected 22→21 in docs (the map has
      21 entries; no badge missing); echo index math simplified; dead
      typeof guard dropped. Efficiency angle: zero findings. All 6 VM
      suites (sandboxes gained stopAllDemoAudio/flashClass stubs) +
      checks green.
- [x] ~~Video self-review~~ — CUT by Jonathan 2026-07-11 (never built;
      was the last G1 leftover). The audio-only Record Yourself widget
      stays as-is.

## Jonathan — manual, before course start

- [ ] ⚠️ Watch Module 4 Set 1's video (`m_IiyJu60-c`, "Major Pentatonic
      Scale – Marty Music") through; confirm it fits the beginner Pattern-1
      station.
- [ ] Spanish spot-check: review 2–3 sets in Español mode with a fluent
      speaker.
