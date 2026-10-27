---
paths:
  - "teacher.js"
---

## Teacher console — shared-config rules (2026-10-25)

The write rule (strict vs cell-checked, `configVersion`, check 1ai) is the last
section of this file. The bullets below are the rules a two-console stress test
added; each one closed a real failure.

- **Reads.** `loadTeacherClassConfig()` is a thin wrapper that records the
  newest read in `teacherClassConfigLatest`. A read that overlapped one of this
  tab's writes is read again after the writes settle. A read that loses to a
  newer one **returns the newest read's promise, never `null`** — a `null` made
  every view's `if(!cfg) return` leave "Loading…" on screen for good (Manage,
  Games, Songs, Mic have no auto-refresh).
- **Versions.** `teacherConfigVersion` moves only through version numbers this
  tab's *own* writes returned. A diverged write (another console wrote in the
  gap) must **not** mark this tab's copy current — it still lacks the other
  console's change, and a strict board move would re-pack `pos` from a stale
  board and write duplicate positions.
- **Repaint.** A toggle repaints at once from the changed copy
  (`renderTeacherActivities({cached:true})`); do not wait for the read after the
  write — reads that overlap a write are discarded, so a burst of toggles would
  show nothing. (Rename keeps its editor open on a failed save; Clear is not on
  the board.)
- **Comparing cells.** Map-valued cells are compared with sorted keys, not
  `JSON.stringify` order.
- **Visibility must match the students'.** Use `teacherBoardView(cfg).assigned`
  (computed once per student), never the raw `activityBoard[id]`. A card moved to
  Songs or Teacher view songs keeps its board slot; the raw test counted it as
  Pending for the whole class. `tabs/journey.js` carries a copy of
  `caIsLibraryCard`/`caIsTeacherSong` that must match app.js; check 1ah pins the
  guard in all three places.
- **Escape every student-written value** at the interpolation point (period,
  name, email, response and report text, mic-take metadata). `perLabel(period)`
  once put a raw period into a `<th>`.
- **Known limits — don't "fix" without a design.** With one console, about 7% of
  random schedules still show a false "Nothing was saved" alert; with two, writes
  that used to corrupt now refuse (more alerts, no corrupt boards). Serializing
  this tab's writes corrupts two-console boards; counting queued writes as open
  deadlocks about half of two-console runs.
- **How to change this plumbing safely.** Reading is not enough. Before touching
  `loadTeacherClassConfig`/`teacherWriteConfig`, write a randomized two-console
  simulation (fake Firestore with transactions and latency, a virtual clock, the
  real teacher.js, ≥ 1000 schedules, view switches at many times) and compare old
  vs new on: views left on "Loading…", boards with duplicate `pos`, false
  "Nothing was saved" counts, repaints during a burst. That harness found all
  three majors the 2026-10-25 review reported; it lived in a session scratchpad
  and is **not** in the repo — rebuild it, and when you do, commit it to `tools/`.

## Every write to `config/class` goes through `teacherWriteConfig()` (moved here from CLAUDE.md, 2026-10-25)

**2026-09-17.** The console reads `config/class` once per view and computes
every merge patch from that in-memory copy (`teacherClassConfig`). Nothing
listens to the doc, so a second console — another tab, the laptop beside the
projector machine, the other OS — makes that copy stale, and a stale merge
used to just win: Firestore accepted it, the other session's change was gone,
and neither screen said anything. The board is where that corrupts rather
than merely loses, since a move re-packs `pos` 1..N for a whole module from
the board this tab holds.

`config/class` now carries **`configVersion`**, a counter every write bumps
inside a transaction, against the version this tab read. Two modes, and the
caller picks:

- **Strict** (`teacherWriteConfig(patch)`, no `base`) — any concurrent write
  at all refuses. For anything derived from more of the doc than its patch
  names: the three board writers, Delete (it re-packs), Clear all.
- **Cell-checked** (`teacherWriteConfig(patch, base)`, `base` = the values
  the write was worked out from, `undefined` for "was absent") — an
  unrelated concurrent edit goes through; a cell that moved underneath us
  refuses. For the single-cell toggles (a date, Hidden, a period, a clear).

Blanket-strict would fail hiding an activity here because a period was
corrected there, and a false alarm every time two tabs are open is what
teaches Jonathan to click through the one that matters. So **omitting `base`
is the safe default** — a writer that forgets gets strict, not nothing.
Failures report through `teacherConfigSaveFailed(e, msg)`, which tells a
stale rejection ("nothing was saved, reloading") apart from a dropped
connection. checks.mjs **1ai** bans a bare `.set()` on the doc, pins the
writer count (`CONFIG_WRITERS`, 26 as of 2026-10-26), and requires the transaction — add a writer and it fails
until you bump `CONFIG_WRITERS` on purpose. `firestore.rules` deliberately
does NOT enforce the counter (it would lock the Firebase console out of the
one doc you'd repair by hand); that edit was comments only, nothing to paste.
