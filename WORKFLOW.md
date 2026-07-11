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
- [ ] **Semester 2 content gaps** (from the 2026-07-10 audit; Jonathan
      deferred these when the Semester 1 gaps were filled 2026-07-11):
      M7 — no TAB actually contains the hammer-on/pull-off/slide markings
      students are assessed on playing, and Bb/F# are promised but never
      played; M9 — "Read It Up High" claims higher-position reading but
      its TAB sits at frets 0–3, partial-shape chart reading barely
      taught; M12 — p-i-m-a string assignments and 4-note arpeggio steps
      lean entirely on Module 8.
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
