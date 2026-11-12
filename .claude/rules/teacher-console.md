---
paths:
  - "teacher-*.js"
---

## Teacher console — shared-config rules

The write rule (strict vs cell-checked, `configVersion`, check 1ai) is the last
section of this file. Each bullet below closed a real two-console failure.

- **Reads.** `loadTeacherClassConfig()` is a thin wrapper that records the
  newest read in `teacherClassConfigLatest`.
  - A read that overlapped one of this tab's writes is read again after the
    writes settle.
  - A read that loses to a newer one **returns the newest read's promise, never
    `null`**: a `null` leaves "Loading…" on screen for good (Manage, Games,
    Songs, Mic have no auto-refresh).
- **Versions.** `teacherConfigVersion` moves only through version numbers this
  tab's *own* writes returned. A diverged write (another console wrote in the
  gap) must **not** mark this tab's copy current, or a strict board move
  re-packs `pos` from a stale board.
- **Repaint.** A toggle repaints at once from the changed copy
  (`renderTeacherActivities({cached:true})`), not after the write's read:
  reads that overlap a write are discarded. (Rename keeps its editor open on a
  failed save; Clear is not on the board.)
- **Comparing cells.** Map-valued cells are compared with sorted keys, not
  `JSON.stringify` order.
- **Visibility must match the students'.** Use `teacherBoardView(cfg).assigned`
  (computed once per student), never the raw `activityBoard[id]`: a card moved
  to Songs or Teacher view songs keeps its board slot. `tabs/journey.js` carries
  a copy of `caIsLibraryCard`/`caIsTeacherSong` that must match the app's (`app/activities-2.js`); check
  1ah pins the guard in all three places.
- **Escape every student-written value** at the interpolation point (period,
  name, email, response and report text, mic-take metadata).
- **Known limits — don't "fix" without a design.**
  - One console: about 7% of random schedules still show a false "Nothing was
    saved" alert. Measured 2026-11-12 by `tools/two-consoles-loop.mjs`: 8 of 105
    (seed 1) and 12 of 105 (seed 2); the tool's latency is a guess.
  - Two consoles: writes that used to corrupt now refuse (more alerts, no
    corrupt boards). Measured 2026-11-12 by `tools/two-consoles-loop.mjs`: no
    race-made corrupt board in 2,000 schedules; 536 of 536 board moves refused
    when the other console wrote in the gap; 36 of 1,790 two-console schedules
    show a false alert.
  - Serializing this tab's writes corrupts two-console boards. Measured
    2026-11-12 by `tools/two-consoles-loop.mjs`: confirmed. With a queue around
    `teacherWriteConfig`, 31 of 500 schedules had a strict board move land over
    the other console's move or delete, and 1 had a duplicate position.
  - Counting queued writes as open deadlocks about half of two-console runs.
    (Not measured by the tool.)
  - Found by the tool 2026-11-12, on Jonathan's list, NOT fixed: this console's
    own quick clicks can land out of order (a retry), and the older click then
    undoes the newer one while the screen still shows the newer: pins,
    Optional / Required, Archive's unpin, Hide all / Show all. Archive does not
    unpin a card the other console pinned meanwhile. Today's code fails about
    10 to 25 of 1,000 schedules on these; that is the baseline, not a regression.
- **How to change this plumbing safely.** Before touching
  `loadTeacherClassConfig`/`teacherWriteConfig`:
  1. Write a randomized two-console simulation: fake Firestore with transactions
     and latency, a virtual clock, the real console code (the whole script: `siteSource('teacher.js')` from `tools/site-src.mjs`), ≥ 1000 schedules, view
     switches at many times.
  2. Compare old vs new on: views left on "Loading…", boards with duplicate
     `pos`, false "Nothing was saved" counts, repaints during a burst.

  The harness is `node tools/two-consoles-loop.mjs` (2026-11-12): it does the
  two steps above. `--seed S --schedule K --verbose` replays one schedule;
  `--console FILE` runs a changed copy of the console script for a before and
  after. Run it before and after any change here and report both tables.

## Every write to `config/class` goes through `teacherWriteConfig()`

The console reads `config/class` once per view and computes every merge patch
from that in-memory copy (`teacherClassConfig`). Nothing listens to the doc, so
a second console makes that copy stale. On the board a stale merge corrupts,
since a move re-packs `pos` 1..N for a whole module.

`config/class` carries **`configVersion`**, a counter every write bumps inside a
transaction, checked against the version this tab read. Two modes; the caller
picks:

- **Strict** (`teacherWriteConfig(patch)`, no `base`) — any concurrent write
  at all refuses. For anything derived from more of the doc than its patch
  names: the three board writers, Delete (it re-packs), Clear all.
- **Cell-checked** (`teacherWriteConfig(patch, base)`, `base` = the values
  the write was worked out from, `undefined` for "was absent") — an
  unrelated concurrent edit goes through; a cell that moved underneath us
  refuses. For the single-cell toggles (a date, Hidden, a period, a clear).

Cell-checked exists because blanket-strict raises a false alarm whenever two
tabs are open. Strict is still the **safe default**: a writer that omits `base`
gets strict, not an unchecked write.

- Failures report through `teacherConfigSaveFailed(e, msg)`, which tells a
  stale rejection ("nothing was saved, reloading") apart from a dropped
  connection.
- checks.mjs **1ai** bans a bare `.set()` on the doc, pins the writer count
  (`CONFIG_WRITERS`), and requires the transaction. Add a writer and it fails
  until you bump `CONFIG_WRITERS` on purpose.
- `firestore.rules` deliberately does NOT enforce the counter: it would lock the
  Firebase console out of the one doc you'd repair by hand.
