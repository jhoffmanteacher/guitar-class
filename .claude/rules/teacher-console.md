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

## Each console part: what binds it and the tool to run after a change

Moved from CLAUDE.md "Where the code lives" (2026-11-26).

- **Which activities a student sees or lands on** (`caIsVisible` / `caBlockers` / `caBoardOrder` / the first-card
  pick, `showApp`'s landing, the console's or the Journey pages' copies, `classConfigSignature`): `node
  tools/visible-loop.mjs` (about 16 s).
- **`teacherWriteConfig()`, `loadTeacherClassConfig()` or any `config/class` writer** (danger zone): run `node
  tools/two-consoles-loop.mjs` before and after and report both tables (today's code fails about 10 to 25 of 1,000
  schedules on the listed faults).
- **The console is not enlarged** on a big screen (factor 1 at every size); only Live In-Class Games fills
  (`siteFillStage()`, called by `renderTeacherBody`).
- `teacher-usage.js` (Students → Usage, 2026-11-27, read-only; it writes nothing and reads nothing of its own: the counts
  come with each progress doc through `teacherFetchStudents()`, the minutes from the Practice minutes view's read,
  `teacherLoadMinutes()`, run from its button): checks.mjs 1fu (the student-side counting, the console's list against
  the ids the site counts, `TEACHER_USAGE_GAMES` = `GAMES_META`, the numbers) and `node tools/console-layout-smoke.mjs`
  (both tables against its stub's made-up roster). The counts' writer is the student's own page (`app/save.js`
  `flushToolOpens`, a save-path change: `node tools/save-loop.mjs`, directed check L9u). `TEACHER_USAGE_SINCE` is the
  day counting shipped.
- `teacher-spotcheck.js` (Students → Week-later checks, 2026-11-27; writes nothing to Firestore): a week is counted
  from `streak.lastDay` (the last day the student marked ANY skill "I've got it"; ticks carry no time), read by
  `teacherFetchStudents()` as `lastGotItDay`. Results live in this browser only, behind `TEACHER_SPOT_STORE` (the
  adapter; no rules block fits today: never `config/class`, which students read). The backup file carries them
  (`thisComputer`) and Delete forgets them (`teacherSpotForget`). After a change: `node tools/console-layout-smoke.mjs`
  (its Week-later section); a change to the backup or remove hooks also `node tools/backup-proof.mjs` /
  `node tools/remove-one-sim.mjs`.
- `teacher-backup.js` ("Download a backup", read-only): `node tools/backup-proof.mjs`. Never open a downloaded backup
  (CLAUDE.md "Student data").
- `teacher-errors.js` (Tools → Error log, and "Send a test entry"): `node tools/site-errors-sim.mjs`. No name, uid or
  email may ever be added to a `siteErrors` entry.
- `teacher-livegames.js` (the Games list: order, rename, Remove / Restore, kept in `config/class.liveGames` through
  `teacherWriteConfig()`; `live-quiz.js` reads it through `lqPickerIds()` / `lqCustomTitle()`, and Start copies a
  custom name into `liveQuiz/current.title`): `node tools/live-quiz-loop.mjs`.
- `teacher-accounts.js` (requests to join, `accessRequests`; the allow list `config/access`, teacher-only, every write
  merges one key; the roster's outside accounts): `node tools/access-sim.mjs`. The rules are `firestore.rules`, with
  the `isSchool()` gate pinned by 1dt.
- `teacher-songfiles.js` (Song files: Upload, List, Verify, Delete): the console's only writer of the `songFiles`
  store, and Jonathan's click only. Song files are left out of the backup on purpose. `node
  tools/song-files-console-sim.mjs`.
- `teacher-builtsongs.js` (Built songs: the list with today's verdict, and Import of a .json and its .mp3 prepared with
  `tools/new-playalong.mjs`: the audio through the Song files writer, then `builtSongs/{id}`, then the list). Song
  files names a built song's audio and refuses to delete it. `node tools/song-files-console-sim.mjs`.
- `teacher-sb-*.js` (the Song builder: drafts in `songDrafts/{id}`, the levelled 192k copy (`vendor/lamejs`, console
  only) stored through the Song files writer): after any change to any of them, `node tools/song-builder-sim.mjs` and
  `node tools/sb-dsp-test.mjs` (1en pins both).
  - `teacher-sb-chart.js`: every chart it accepts must make a song `builtSongCheck` passes.
  - `teacher-sb-pdf.js`: a chords pdf's text goes into the chart box; a tab pdf or a scan is only shown beside the
    chart; kept in the tab, never stored.
  - `teacher-sb-publish.js`: Publish only on the Preview step, only when `builtSongCheck` passes on the exact doc and
    within 10 cents (over 8 pins only warns); ONE transaction writes `builtSongs/{id}`, `builtSongsMeta/list` and the
    draft `songDrafts/{id}`.
  - `teacher-sb-sheet.js` (the Lyrics sheet row): a chords-over-lyrics pdf checked by `pcSheetAlign`
    (`app/cards-sheet.js`) against the song's card, refused with a reason when it does not line up; Add stores the pdf
    through the Song files writer and writes `song.sheet` in one transaction. Also `node
    tools/song-files-console-sim.mjs`.
- `teacher-remove.js` (a student's "⋯": "Start this student over…" and "Delete this student's data…"; one student,
  typed-name confirmation, a download offered first): the console's only write to `progress/{uid}` is its delete,
  `teacherRemoveDeleteProgress()`. A page the student already has open saves its old copy again (stated in the
  dialogs, not engineered away). After a change: `node tools/remove-one-sim.mjs` and `node tools/save-loop.mjs`.
- `teacherResume*` in `teacher-core.js`: also `node tools/update-reload-loop.mjs` (`sw-and-loading.md`).
- The `teacherFetchStudents()` remap in `teacher-core.js` is one half of the Modules 4/5 swap (`modules.md`).
