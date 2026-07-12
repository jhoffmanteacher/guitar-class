# WORKFLOW.md — Guitar Class

> Build history lives in `archive/`:
> **`WORKFLOW-2026-buildout.md`** (original site build-out),
> **`WORKFLOW-2026-july-fixits.md`** (July 2026 fix-it era), and
> **`WORKFLOW-2026-research-upgrades-era.md`** (the entire 2026-07-11
> mega-day: research-upgrade Sessions A–G, Semester 2 build, Listening
> Coach + games, mini-player, navigation pass, both review rounds, the
> full design plan, and the 93-fix module clarity fleet — its specs
> `RESEARCH_UPGRADES.md`, `MODULES_9_12.md`, and the fully-executed
> `DESIGN_UPGRADES.md` are archived alongside). Consult them for *why*;
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
- [ ] **Research backlog (medium/low)** — stored One-Minute-Changes
      scores, tempo-ladder playSeq, Song Journey anatomy sections, bends,
      7th/sus chord color, songwriting capstone, Choice-song style lanes,
      motivation layer. Details in `archive/RESEARCH_UPGRADES.md`; do not
      start without Jonathan's go-ahead.

- [x] **Docs consolidation + Challenge Day ✅ 2026-07-11 (evening)** —
      WORKFLOW slimmed again (10 completed entries → the era archive);
      fully-executed DESIGN_UPGRADES.md archived. WINTER_CHALLENGE
      restructured to {minModule, text} (each line tagged with the module
      that teaches its skill) and the always-visible 15-item list
      replaced by Challenge Day: every 3rd day (dayOfYear%3) the Daily 5
      appends a pick-one-of-two drawn from minModule<=current module —
      VM-verified module 1 sees zero later-module skills across 30
      simulated days (challenge on 10 of 30).

## Jonathan — manual, before course start

- [ ] ⚠️ Watch Module 4 Set 1's video (`m_IiyJu60-c`, "Major Pentatonic
      Scale – Marty Music") through; confirm it fits the beginner Pattern-1
      station.
- [ ] Spanish spot-check: review 2–3 sets in Español mode with a fluent
      speaker.
