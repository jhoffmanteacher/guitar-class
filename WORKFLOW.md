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

- [~] **Real-guitar retest of the mic features** (Jonathan, 2026-07-12) —
      **Listening Coach chord check ("Check my changes"): DONE & verified**
      on real guitar (pushed through `2e3feee`). Root cause was NOT the
      onset/verdict knobs but the pitch detector: YIN's strict 0.22 clarity
      gate rejected polyphonic chord frames outright (most strums logged 0
      pitch reads). Fixes now live: forgiving *check-flow* onset thresholds
      (`CHK_*` at the top of coach.js, shared by the Coach + Change Up, split
      from the stricter `COACH_*` the rhythm games keep); chord-mode YIN
      clarity of 0.55 (melody stays 0.22); 20%-ok chord-tone bar; wider
      ±0.18-beat "on the beat" window; same 0.55 clarity applied to Change
      Up. Final real-guitar run: ~4.7 reads/strum, ~65–80% on chord, 87% →
      "Great". Debug meter (`?ccdebug=1`) was used to find this and has been
      stripped. **Still to retest:** a melody check (Module 4 Pattern 1),
      one Note Hunt round, one full Change Up round.
- [ ] **Research backlog (medium/low)** — stored One-Minute-Changes
      scores, tempo-ladder playSeq, Song Journey anatomy sections, bends,
      7th/sus chord color, songwriting capstone, Choice-song style lanes,
      motivation layer. Details in `archive/RESEARCH_UPGRADES.md`; do not
      start without Jonathan's go-ahead.

---

## Recently shipped (post-archive)

- [x] **Fret Zap** — games arcade, `fz*` in `coach.js` — pushed `c64ef08`
      (2026-07-11), browser-verified against the live code 2026-07-12. A
      no-mic, no-guitar fretboard note-naming sprint: a blank dot lights on
      a fretboard diagram (reuses app.js `localNoteSvg`) and the student
      taps the note's name from four choices before a 60-second clock runs
      out. Mirrors the Chord Blitz scaffolding — streak multiplier,
      wrong-answer reveal + requeue, session best (`fzBest:<deck>`) and
      cross-session best via `games.fz`. Four difficulty decks (low-string
      naturals → all strings 0–5 → naturals to 12 → everything with sharps);
      keys 1–4 answer on a laptop; reward tone via `playNote`. Built with a
      build → adversarial-review (4 dimensions) → verify → fix workflow (4
      findings fixed: a missing `#fz-body` width rule, two changelog idioms,
      an unglossed "naturals"). Browser test confirmed note-math, scoring,
      wrong-answer requeue, keyboard, timer, done screen, and exit cleanup
      (no leaked timer/listener) with zero console errors. **No real-guitar
      retest needed** (it never touches the mic).
