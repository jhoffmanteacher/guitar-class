# WORKFLOW.md — Guitar Class

> Build history lives in `archive/`:
> **`WORKFLOW-2026-buildout.md`** (original site build-out),
> **`WORKFLOW-2026-july-fixits.md`** (July 2026 fix-it era), and
> **`WORKFLOW-2026-research-upgrades-era.md`** (the entire 2026-07-11
> mega-day: research-upgrade Sessions A–G, Semester 2 build, Listening
> Coach + games, mini-player, navigation pass, both review rounds, the
> full design plan, the 93-fix module clarity fleet, and the evening's
> Daily-5-popup + chord-check fix batches — its specs
> `RESEARCH_UPGRADES.md`, `MODULES_9_12.md`, and the fully-executed
> `DESIGN_UPGRADES.md` are archived alongside). Consult them for *why*;
> they drive no current work. All CLAUDE.md rules apply as always.

**Status legend:** [ ] not started · [~] in progress · [x] done

---

## Open work

- [ ] **Real-guitar retest of the mic features** (Jonathan, planned
      2026-07-12) — the melody fixes and the chord-check fix batch
      (change-prompt lag, diagrams through the count-in, chord-tone-vote
      scoring — coach AND Change Up) are live as of 2026-07-11 night but
      VM-verified only. Retest on the live site: the Module 5 Set 1
      Am↔Em "Check my changes", a melody check (Module 4 Pattern 1), one
      Note Hunt round, one Change Up round. Tuning knobs if needed:
      detection too eager/shy → the COACH_* constants at the top of
      coach.js; chord verdicts too generous/strict → the 0.34-ok /
      0.15-wrong vote thresholds in coachMatchEvent and ccResolvePend.
- [ ] **Research backlog (medium/low)** — stored One-Minute-Changes
      scores, tempo-ladder playSeq, Song Journey anatomy sections, bends,
      7th/sus chord color, songwriting capstone, Choice-song style lanes,
      motivation layer. Details in `archive/RESEARCH_UPGRADES.md`; do not
      start without Jonathan's go-ahead.
