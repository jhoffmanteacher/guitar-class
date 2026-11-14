# Two consoles: the config/class write fault, 2026-11-14

Branch `fix/two-consoles`, cut from `origin/main` at `cc9fcfb`. Worked in a cloud session, Node only. No browser was
used and no student data was touched: the tool's class is made up. Nothing here has shipped. The lead reviews it
before anything goes to `main`.

## In short

- Failing schedules, `node tools/two-consoles-loop.mjs`, 1,000 main schedules per seed:

  | seed | before (`cc9fcfb`) | after fix 1 | after fix 1 + 2 |
  |---|---|---|---|
  | 1 | 17 of 1,000 | 1 of 1,000 | 0 of 1,000 |
  | 2 | 16 of 1,000 | 4 of 1,000 | 1 of 1,000 |
  | 3 | 25 of 1,000 | 6 of 1,000 | 1 of 1,000 |

  Each "before" run also failed the whole run with "a covered write never called: lqgWrite". After the tool commit,
  that line is gone.
- No family's failing count went up on any seed. The false "Nothing was saved" counts went down or stayed the same
  (tables below).
- The 1 left on seeds 2 and 3 is root cause 2. It is not fixed because it needs Jonathan's decision.

## Root causes

### 1. One console's own quick clicks on the same cell land out of order (FIXED, commit 1)

**In plain words.** The teacher pins card X, then pins card Y a moment later. The console changes its copy before it
writes, so Y's write is worked out from a copy that already holds X: it saves `[…, X, Y]`. X's own write is out at the
same time. The server refuses X's first try because something else landed first, so X tries again. By then Y has
landed. X's retry writes its older list `[…, X]` over Y's, and Y is gone from the doc. The screen still shows Y
pinned. The same thing happens with Games on / off (seed 1 #66: Off, then On; the Off landed last). It also happens
with Optional when it is clicked right after Who ticks on the same card (seed 1 #861: Optional landed before the Who
ticks it was worked out from, so for a moment the card was Required).

**Where it goes wrong.** `teacherWriteConfig()` in `teacher-config.js` (line 323 at `cc9fcfb`):
`diverged = liveV !== teacherConfigVersion`. When X retries, `teacherConfigVersion` has already moved on through Y's
commit, which was this console's own write. So X does not count as diverged, its `base` is never checked, and it
writes. In #66 the cell check was also fooled: the value went from true to false and back to true.

Replay (on `cc9fcfb`): `node tools/two-consoles-loop.mjs --seed 1 --schedule 24 --verbose`. The timeline:
- 2621 ms: A2 Hide.
- 2647 ms: A3 pins ca-12. Its transaction reads version 1.
- 2768 ms: A2 commits version 2.
- 2977 ms: A4 pins ca-13. Its copy already holds ca-12.
- 3120 ms: A4 commits version 3: `[ca-21, ca-10, ca-12, ca-13]`.
- 3402 ms: the server refuses A3's first commit.
- 4747 ms: A3's retry commits version 4: `[ca-21, ca-10, ca-12]`. ca-13 is lost.

**The fix** (`teacher-config.js`, `teacherWriteConfig()` and the comment block above it). A cell-checked write
(one with a `base`) first waits for this console's EARLIER writes whose cells overlap its own to finish their
transactions. Cells overlap when the dotted paths of the patch and `base` match, or one path is a prefix of the other.
Then the write runs as before. It is not a global queue or lock:
- It waits only on overlapping cells. A rename and a date do not wait on each other.
- It waits only on the transaction, never on the reload a diverged write does afterwards. So a read never waits on a
  write that is waiting on it. That deadlock is listed in `teacher-console.md`.
- Strict writers (board moves, Delete, Clear all) do not wait. The board already has `waitBoardWriteTurn`, and
  `teacher-console.md` records that a queue around every write corrupted two-console boards.

No new `config/class` writer; check 1ai's writer count is unchanged.

### 2. A later click carries an earlier click that then failed (NOT FIXED: product choice)

**In plain words.** The teacher pins X, then pins Y. Y's list includes X, because the copy shows X. X's write then fails
(the connection drops), and the teacher sees "Could not save that pin". But Y's write lands with X in it, so X IS
pinned. The doc no longer matches what the teacher was told. Seed 2 #959 is that case: A11 pinned ca-13 and failed,
then A13's pin of ca-1 saved ca-13 along with it. Seed 3 #934 is the strict version: B1 pinned ca-12 and failed, and
B2's Delete of ca-10 wrote the pin list from a copy that still held ca-12 (`teacherDeleteActivity`,
`teacher-songs.js:285`: `patch.activityPins=pinsBefore.filter(…)`).

Fix 1 already removes the refused kind of this fault (seed 2 #715 and seed 3 #198 at `cc9fcfb`). Now the later click
waits, and an earlier click that was REFUSED leaves the later one's `base` out of date, so it is refused too. What is
left is a dropped connection, because then no other console wrote and nothing is checked. Seed 1 #847 is the
dropped-connection kind. It passes after fix 1 only because the waiting changed the random latencies, so the
connection no longer drops at that moment. It is NOT fixed.

**Why not fixed.** The fix depends on which click should win and what the teacher should be told. That is
Jonathan's call. The options:
1. **Leave it** (today). The later click saves the earlier one too. The "Could not save" alert is wrong in the safe
   direction: the teacher re-pins a card that is already pinned, which does nothing. Cost: none. 1 of 1,000 schedules
   on seeds 2 and 3, 0 on seed 1.
2. **Refuse the later click too.** After waiting, if an earlier overlapping write failed, check `base` even when not
   diverged, and refuse with the stale message. Nothing is saved that the teacher was told failed, but the teacher
   gets a second alert, and its wording ("another tab, or another computer") would be wrong here. That would need a
   new message.
3. **Re-work the later click without the failed one.** The later click is computed again from the rolled-back copy
   (pin Y alone). This matches the teacher's intent best. It is a bigger design: each writer would have to hand
   `teacherWriteConfig` a function instead of a fixed patch. It needs its own review and a two-consoles-loop
   before/after.

### 3. Archive does not check the pin list it decided from (FIXED, commit 2)

**In plain words.** Console A archives card X, and A's screen shows X unpinned, so A writes no pin change. Console B
pins X in the gap. A's write is checked only on X's archived and deleted flags, so it lands, and X ends up archived AND
pinned. The pin takes one of the four slots for a card students never see.

**Where it goes wrong.** `teacherSetActivityArchived()`, `teacher-activities.js:2387` at `cc9fcfb`:
`base.activityPins` was set only `if(unpin)`.

Replay: `--seed 1 --schedule 887 --verbose`. The timeline:
- 2595 ms: A2 archives ca-43.
- 2837 ms: B3 pins ca-43.
- 2939 ms: B3 commits version 2.
- 3020 ms: the server refuses A2's first try.
- 3789 ms: A2's retry is diverged, its cells are unchanged, so it commits version 3: archived and pinned.

**The fix.** Archiving always puts the whole pin list in `base` (`teacher-activities.js:2392`). Restore does not
touch pins, so it is unchanged. A pin change from the other console now refuses the Archive with "Nothing was saved"
and a reload, the same way a pin is already refused. The cost: a pin or unpin of ANY card in the other console during
the Archive's flight now refuses it. A cell check cannot ask "is X in the list" more narrowly than the whole array.
On the delete-vs-edit family, schedules with a refusal went from 24 / 26 / 26 to 25 / 29 / 30 of 68 (seeds 1 / 2 / 3).

### 4. lqgWrite "never called": a real writer, not a stale entry (tool fixed, commit 3)

`lqgWrite` (`teacher-livegames.js`) was added on 2026-11-13, after the tool. It writes the Live In-Class Games list
(`liveGames` in `config/class`), cell-checked, through `teacherWriteConfig()`. The tool listed it as a covered call
site, but no schedule could reach it. The tool did not load `live-quiz.js` (the game bank) and had no click for it.
So the tool's line was right, and what was missing was a schedule family. The tool now:
- loads `live-quiz.js` into each console, as `index.html` does;
- reads the game ids from `live-quiz.js` in a bare context, as data;
- adds the `live-games` family: both consoles move, rename, Remove and Restore games, half the time on the same game;
- adds model rule M28, its DEPS and the `liveGames` doc key;
- skips a click while the list is greyed (`lqgBusy`), as a greyed button cannot be clicked.

60 such schedules run AFTER the main 1,000 on a default run. The family is not in the cycle, so no seed's schedule
numbers moved. They show as the row "live-games (+)" under "all".

**What it found: nothing.** 0 of 60 failing on each of seeds 1, 2 and 3, on `origin/main`'s console and on this
branch's alike (223 / 238 / 217 writes, 35 / 42 / 27 refused and all told). Break-it: with `lqgWrite` cell-checked on a
wrong cell, 31 of 60 schedules go red ("landed on a moved cell" ×38). The main 1,000 tables are byte-identical with
and without this tool change on all three seeds, so loading `live-quiz.js` changed nothing else.

## Break-it proofs (each fix reverted alone in a scratch console, `--console FILE`)

| reverted | seed 1 | seed 2 | seed 3 |
|---|---|---|---|
| fix 1 (`teacher-config.js` at `cc9fcfb`) | 16 of 1,060 red | 13 of 1,060 | 20 of 1,060 |
| fix 2 (`teacher-activities.js` at `cc9fcfb`) | 1 of 1,060 (#887) | 4 (#104, #336, #742 + #959) | 6 (#47, #123, #278, #366, #859 + #934) |

With fix 1 reverted, the red schedules are the baseline's pin-pair, solo, random and map-cells schedules (seed 1: #24,
#53, #66, #82, #169, #198, #256, #285, #459, #546, #633, #720, #749, #847, #861, #894). With fix 2 reverted, they are
exactly the baseline's Archive schedules. The 1,060 is the 1,000 main schedules plus the 60 live-games schedules.

## Other runs on the branch tip

- `node tools/visible-loop.mjs`: exit 0, "every comparison held". K1 is listed as a known fault and is not new.
- `node tools/live-quiz-loop.mjs`: exit 0, 147,509 checks compared, 0 failed.
- `node tools/checks.mjs --check --skip-links`: exit 1, and the only ✗ is "shell cache stale". The full `checks.mjs`
  was NOT run, as briefed; it would rewrite `sw.js`. 1dw shows 3 commits with neither label.
  1cv: `teacher-activities.js` is 2,403 lines (over 2,000, under 2,600).

## For the lead

- **Labels.** Commits 1 and 2 touch danger-zone code (`teacherWriteConfig()` and a `config/class` writer), so they are
  Always Reviewed. Commit 3 is a new kind of check in the tool. None carries `Review: Fast`; each says
  `Review: pending`. Spawn `site-reviewer-deep` for commits 1 and 2, then set the trailers with
  `tools/review-trailer.mjs`.
- **Text I was not allowed to edit, now out of date:**
  - `.claude/rules/teacher-console.md`, "Known limits", the bullet "Found by the tool 2026-11-12 … NOT fixed: this
    console's own quick clicks can land out of order … Archive does not unpin a card the other console pinned
    meanwhile. Today's code fails about 10 to 25 of 1,000". After this branch: own clicks on overlapping cells land in
    click order; Archive refuses when the pin list moved; what is left is root cause 2 (0 to 1 of 1,000).
  - `WORKFLOW.md:968` says the same.
  - The tool's header still says "today's code is expected to fail about 10 to 25 of 1,000".
- **Before and after.** `tools/two-consoles-loop.mjs` header asks for the two-consoles-loop before and after any
  change to this plumbing. The tables are below. `two-consoles-loop` is not one of GitHub's push checks.

## What I did not check

- No real browser, and no real Firestore. Every number here is the tool's fake server, with its own guessed latency
  and retry backoff.
- Only three seeds, with 1,000 main schedules each.
- More than two consoles, offline queueing, and a reply lost after a commit are not modelled.
- Hide all / Show all and Archive's unpin, which `teacher-console.md` names as reorder risks, are now covered by
  fix 1's overlap rule. No family drives two of them back-to-back on one console, so that order is not tested
  directly.
- `lqgMoveTo` does not return its write's promise, so the tool's "copy left stale" check cannot judge a live-games
  move. The other checks still judge its commits.
- Not run: `tools/smoke.mjs`, the change smoke, `pm-e2e`, `slow-load`, `save-loop`, `two-consoles` in a browser. The
  brief said Node only.

## Every table (failing = the last column)

`base` = `cc9fcfb`. `t` = this branch's tip, with all three commits. Fix-1-only numbers are in commit 1's message.

```
### seed 1 base
family            schedules  writes  accepted  refused+told  refused  failed  no write | all landed  some refused, all told | failing
solo                    105     655       603            15       15      30         7 |  73 of 105               13 of 105 |       0
random                  210    1804      1459           248      248      72        25 |  46 of 210              150 of 210 |       2
diff-switch              70     140       140             0        0       0         0 |   70 of 70                 0 of 70 |       0
same-cell                70     140        78            62       62       0         0 |    8 of 70                62 of 70 |       0
same-unit-moves          69     138        65            47       47       0        26 |   22 of 69                47 of 69 |       0
move-vs-switch           68     136        92            42       42       0         2 |   26 of 68                42 of 68 |       0
delete-vs-edit           68     136       111            24       24       0         1 |   44 of 68                24 of 68 |       1
burst                    34     136       111            25       25       0         0 |   15 of 34                19 of 34 |       0
map-cells                34     136       119            17       17       0         0 |   17 of 34                17 of 34 |       1
optional-vs-who          68     204       161            43       43       0         0 |   25 of 68                43 of 68 |       0
songs-and-back           34     113       107             6        6       0         0 |   28 of 34                 6 of 34 |       0
pin-pair                 34     102       101             1        1       0         0 |   33 of 34                 1 of 34 |      13
student-cells            34     136       102            34       34       0         0 |    0 of 34                34 of 34 |       0
view-mid-write          102     204       204             0        0       0         0 | 102 of 102                0 of 102 |       0
all                    1000    4180      3453           564      564     102        61 | 509 of 1000             458 of 1000 |      17
one console:  13 of 105 schedules (12.4%) showed a false "Nothing was saved"
two consoles: 14 of 895 schedules (1.6%) showed a "Nothing was saved" that the other console did not cause
board moves (move, un-assign, delete) refused when the other console wrote in the gap: 288 of 288 (100.0%); with no write from it in the gap: 20 of 498
teacherWriteConfig call sites exercised: 24 of 28
### seed 1 t
family            schedules  writes  accepted  refused+told  refused  failed  no write | all landed  some refused, all told | failing
solo                    105     655       606            14       14      28         7 |  74 of 105               12 of 105 |       0
random                  210    1804      1457           250      250      72        25 |  46 of 210              150 of 210 |       0
diff-switch              70     140       140             0        0       0         0 |   70 of 70                 0 of 70 |       0
same-cell                70     140        78            62       62       0         0 |    8 of 70                62 of 70 |       0
same-unit-moves          69     138        65            47       47       0        26 |   22 of 69                47 of 69 |       0
move-vs-switch           68     136        92            42       42       0         2 |   26 of 68                42 of 68 |       0
delete-vs-edit           68     136       110            25       25       0         1 |   43 of 68                25 of 68 |       0
burst                    34     136       111            25       25       0         0 |   15 of 34                19 of 34 |       0
map-cells                34     136       136             0        0       0         0 |   34 of 34                 0 of 34 |       0
optional-vs-who          68     204       161            43       43       0         0 |   25 of 68                43 of 68 |       0
songs-and-back           34     113       107             6        6       0         0 |   28 of 34                 6 of 34 |       0
pin-pair                 34     102       102             0        0       0         0 |   34 of 34                 0 of 34 |       0
student-cells            34     136       102            34       34       0         0 |    0 of 34                34 of 34 |       0
view-mid-write          102     204       204             0        0       0         0 | 102 of 102                0 of 102 |       0
all                    1000    4180      3471           548      548     100        61 | 527 of 1000             440 of 1000 |       0
one console:  12 of 105 schedules (11.4%) showed a false "Nothing was saved"
two consoles: 11 of 955 schedules (1.2%) showed a "Nothing was saved" that the other console did not cause
board moves (move, un-assign, delete) refused when the other console wrote in the gap: 289 of 289 (100.0%); with no write from it in the gap: 19 of 497
teacherWriteConfig call sites exercised: 25 of 28
### seed 2 base
family            schedules  writes  accepted  refused+told  refused  failed  no write | all landed  some refused, all told | failing
solo                    105     676       627            16       16      25         8 |  76 of 105               16 of 105 |       2
random                  210    1734      1412           236      236      61        25 |  41 of 210              155 of 210 |       2
diff-switch              70     140       140             0        0       0         0 |   70 of 70                 0 of 70 |       0
same-cell                70     140        78            62       62       0         0 |    8 of 70                62 of 70 |       0
same-unit-moves          69     138        63            40       40       0        35 |   29 of 69                40 of 69 |       0
move-vs-switch           68     136        98            37       37       0         1 |   31 of 68                37 of 68 |       0
delete-vs-edit           68     136       109            26       26       0         1 |   42 of 68                26 of 68 |       3
burst                    34     135       108            26       26       0         1 |   12 of 34                22 of 34 |       1
map-cells                34     136       117            19       19       0         0 |   15 of 34                19 of 34 |       0
optional-vs-who          68     204       146            58       58       0         0 |   10 of 68                58 of 68 |       0
songs-and-back           34     121       113             8        8       0         0 |   26 of 34                 8 of 34 |       0
pin-pair                 34     102        98             4        4       0         0 |   30 of 34                 4 of 34 |       8
student-cells            34     136       102            34       34       0         0 |    0 of 34                34 of 34 |       0
view-mid-write          102     204       204             0        0       0         0 | 102 of 102                0 of 102 |       0
all                    1000    4138      3415           566      566      86        71 | 492 of 1000             481 of 1000 |      16
one console:  16 of 105 schedules (15.2%) showed a false "Nothing was saved"
two consoles: 25 of 895 schedules (2.8%) showed a "Nothing was saved" that the other console did not cause
board moves (move, un-assign, delete) refused when the other console wrote in the gap: 257 of 257 (100.0%); with no write from it in the gap: 25 of 467
teacherWriteConfig call sites exercised: 24 of 28
### seed 2 t
family            schedules  writes  accepted  refused+told  refused  failed  no write | all landed  some refused, all told | failing
solo                    105     676       630            15       15      23         8 |  78 of 105               14 of 105 |       1
random                  210    1735      1412           237      237      60        26 |  41 of 210              154 of 210 |       0
diff-switch              70     140       140             0        0       0         0 |   70 of 70                 0 of 70 |       0
same-cell                70     140        78            62       62       0         0 |    8 of 70                62 of 70 |       0
same-unit-moves          69     138        63            40       40       0        35 |   29 of 69                40 of 69 |       0
move-vs-switch           68     136        98            37       37       0         1 |   31 of 68                37 of 68 |       0
delete-vs-edit           68     136       106            29       29       0         1 |   39 of 68                29 of 68 |       0
burst                    34     135       109            25       25       0         1 |   13 of 34                21 of 34 |       0
map-cells                34     136       136             0        0       0         0 |   34 of 34                 0 of 34 |       0
optional-vs-who          68     204       146            58       58       0         0 |   10 of 68                58 of 68 |       0
songs-and-back           34     121       113             8        8       0         0 |   26 of 34                 8 of 34 |       0
pin-pair                 34     102       102             0        0       0         0 |   34 of 34                 0 of 34 |       0
student-cells            34     136       102            34       34       0         0 |    0 of 34                34 of 34 |       0
view-mid-write          102     204       204             0        0       0         0 | 102 of 102                0 of 102 |       0
all                    1000    4139      3439           545      545      83        72 | 515 of 1000             457 of 1000 |       1
one console:  14 of 105 schedules (13.3%) showed a false "Nothing was saved"
two consoles: 17 of 955 schedules (1.8%) showed a "Nothing was saved" that the other console did not cause
board moves (move, un-assign, delete) refused when the other console wrote in the gap: 261 of 261 (100.0%); with no write from it in the gap: 25 of 463
teacherWriteConfig call sites exercised: 25 of 28
### seed 3 base
family            schedules  writes  accepted  refused+told  refused  failed  no write | all landed  some refused, all told | failing
solo                    105     645       608            10       10      18         9 |  83 of 105                8 of 105 |       1
random                  210    1647      1345           222      222      54        26 |  56 of 210              134 of 210 |       2
diff-switch              70     140       140             0        0       0         0 |   70 of 70                 0 of 70 |       0
same-cell                70     140        81            59       59       0         0 |   11 of 70                59 of 70 |       0
same-unit-moves          69     138        62            33       33       0        43 |   36 of 69                33 of 69 |       0
move-vs-switch           68     136       100            34       34       0         2 |   34 of 68                34 of 68 |       0
delete-vs-edit           68     136       109            26       26       0         1 |   42 of 68                26 of 68 |       4
burst                    34     136       111            23       23       0         2 |   13 of 34                21 of 34 |       0
map-cells                34     136       122            14       14       0         0 |   20 of 34                14 of 34 |       0
optional-vs-who          68     204       153            51       51       0         0 |   17 of 68                51 of 68 |       0
songs-and-back           34     127       118             9        9       0         0 |   25 of 34                 9 of 34 |       0
pin-pair                 34     102        99             3        3       0         0 |   31 of 34                 3 of 34 |      18
student-cells            34     136       102            34       34       0         0 |    0 of 34                34 of 34 |       0
view-mid-write          102     204       204             0        0       0         0 | 102 of 102                0 of 102 |       0
all                    1000    4027      3354           518      518      72        83 | 540 of 1000             426 of 1000 |      25
one console:  8 of 105 schedules (7.6%) showed a false "Nothing was saved"
two consoles: 22 of 895 schedules (2.5%) showed a "Nothing was saved" that the other console did not cause
board moves (move, un-assign, delete) refused when the other console wrote in the gap: 252 of 252 (100.0%); with no write from it in the gap: 18 of 488
teacherWriteConfig call sites exercised: 24 of 28
### seed 3 t
family            schedules  writes  accepted  refused+told  refused  failed  no write | all landed  some refused, all told | failing
solo                    105     645       608            10       10      18         9 |  83 of 105                8 of 105 |       0
random                  210    1647      1343           226      226      52        26 |  57 of 210              136 of 210 |       1
diff-switch              70     140       140             0        0       0         0 |   70 of 70                 0 of 70 |       0
same-cell                70     140        81            59       59       0         0 |   11 of 70                59 of 70 |       0
same-unit-moves          69     138        62            33       33       0        43 |   36 of 69                33 of 69 |       0
move-vs-switch           68     136       100            34       34       0         2 |   34 of 68                34 of 68 |       0
delete-vs-edit           68     136       105            30       30       0         1 |   38 of 68                30 of 68 |       0
burst                    34     136       111            23       23       0         2 |   13 of 34                21 of 34 |       0
map-cells                34     136       136             0        0       0         0 |   34 of 34                 0 of 34 |       0
optional-vs-who          68     204       153            51       51       0         0 |   17 of 68                51 of 68 |       0
songs-and-back           34     127       118             9        9       0         0 |   25 of 34                 9 of 34 |       0
pin-pair                 34     102       102             0        0       0         0 |   34 of 34                 0 of 34 |       0
student-cells            34     136       102            34       34       0         0 |    0 of 34                34 of 34 |       0
view-mid-write          102     204       204             0        0       0         0 | 102 of 102                0 of 102 |       0
all                    1000    4027      3365           509      509      70        83 | 554 of 1000             415 of 1000 |       1
one console:  8 of 105 schedules (7.6%) showed a false "Nothing was saved"
two consoles: 15 of 955 schedules (1.6%) showed a "Nothing was saved" that the other console did not cause
board moves (move, un-assign, delete) refused when the other console wrote in the gap: 253 of 253 (100.0%); with no write from it in the gap: 18 of 487
teacherWriteConfig call sites exercised: 25 of 28
```
