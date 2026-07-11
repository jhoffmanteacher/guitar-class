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
- [ ] **Video self-review** (last unbuilt Listening-Coach piece) — camera
      toggle on Record Yourself so students watch their own playback with
      the module's assessment checklist underneath; nothing uploads.

## Jonathan — manual, before course start

- [ ] ⚠️ Watch Module 4 Set 1's video (`m_IiyJu60-c`, "Major Pentatonic
      Scale – Marty Music") through; confirm it fits the beginner Pattern-1
      station.
- [ ] Spanish spot-check: review 2–3 sets in Español mode with a fluent
      speaker.
