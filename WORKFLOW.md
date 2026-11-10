# WORKFLOW.md — Guitar Class

> Build history lived in `archive/` (deleted 2026-10-09; recover any file with
> `git show c751db8:archive/<file>` — the `archive/...` paths below resolve there):
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
>
> Also individually archived: **`REVIEW-PLAN.md`** (the 2026-07-13 full-site
> review across CODE/CONTENT/DESIGN/IMPROVEMENTS — every item executed
> 2026-07-20 in `b76dd67` except the handful that need Jonathan live on the
> real site, tracked below), **`PLAN-COMPACT-CHECKLIST.md`** (the
> compact-checklist step redesign spec, executed 2026-07-20 in `e6925ec`),
> and **`PLAN-COMPACT-JOURNEY.md`** (the same compact redesign applied to the
> six Song Journey pages, executed 2026-07-20 in `dbd2f8f` + `c0b14fc`).

**Status legend:** [ ] not started · [~] in progress · [x] done

Dates are the Pacific calendar date. `CACHE_VERSION` and commit timestamps may show the UTC date, one day later in the evening.

---

## Where things stand (updated 2026-11-09)

Start here. Update this block whenever an item opens or closes; each line says where the detail is.

**Shipped 2026-11-09 (live as of `c443261`)**
- **Count-in:** 2 clicks below 60 BPM in Power Chord Switch and Change Up (Open work → 2026-11-06 Friday check →
  "Decided (Jonathan, 2026-11-09)"). **Today's activities by date:** the group is ordered by release date, newest first;
  a finished card re-dated to the newest date shows in Today marked done (CHANGELOG 2026-11-09; check 1cq). Both Fast;
  the Friday check reviews them. Smoke watchdog `3af343f`. CLAUDE.md: a product change he asks for ships Fast (`c443261`).
- **Faster update reload, and back where you were** (Jonathan, 2026-11-09: "sometimes i start doing something and then it
  reloads back to a different view"; CHANGELOG 2026-11-09). Two parts. (1) `sw.js` is shell first: the install is
  `PRECACHE_CRITICAL` only (16 files, about 0.7 MB compressed, was all 92 files, about 2.9 MB; every script `index.html`
  loads is in it), the worker takes over, and the other 76 files are filled by `precacheRest()` when the page asks
  (`gc-precache-rest`, sent on `load`, `online`, tab shown, and once by a tab that is waiting to reload). The worker also
  posts `gc-sw-activated` to open pages, so a takeover that beats `app.js` is still heard; `app.js` wires both signals when
  the file runs, not on `load`. (2) The reload leaves a one-use note in `sessionStorage` (`gcSwResume`: `swResumeSave` /
  `swResumeTake` in `app.js`, `teacherResumeSnapshot` / `teacherResumeApply` in `teacher.js`) and the next load opens the
  same page instead of the home page; a click or scroll before it lands cancels it. Guard: check 1ce runs the install,
  the message and the fill (72 assertions, 42 breakages) and pins 11 wiring lines as text (comments stripped). Not covered
  by a check: the restore, and what the page does with the two messages (both proved in a real browser; see the commit
  messages). Reviewed twice: round 1, 2 MAJOR + 11 MINOR fixed; round 2, no BLOCKER or MAJOR, 15 MINOR fixed or noted.
  A fill stops when a newer worker is installing or waiting (an old worker with work pending holds the new one back).
  Known trade-offs: on the first load after an update the module files and step images come from the network once; a
  Journey page not yet in the new cache needs the network (no HTTP-cache fallback offline, the 2026-10-16 rule); a student
  on a Module Review gets its assessment reminder right after the update reload. Not restored: In class's two folds, a
  search, a card's open step, the board's sort. Not seen yet on the live site or a school Chromebook. The first deploy of this change can
  need one manual reload (pages still on the old `app.js` listen too late for the faster takeover).
  **A student with an unfinished activity now stays where they were after an update** instead of being sent to In-Class
  Activities (the "pops up on login" half of the gate, kept 2026-10-07, no longer fires on the update reload).

**Shipped 2026-11-07 to 2026-11-08 (live as of `ab4aaae`)**
- **Stopped game, review rounds 3-6** (Power Chord Switch and Change Up; `4582bda`, `a8d2e55`, `df20fd1`, `3625df5`,
  `9c8d1bc`; CHANGELOG 2026-11-08 and 2026-11-08 (evening)): the Stop click is not graded; a Stop after changes fell due reads one of
  three headlines; a Stop in a game where nothing was heard is neutral (Jonathan, 2026-11-08). Rules and known gaps:
  Open work → "Stopped-game headline".
- **Tuning Simulator:** green only when the string is done, keyboard on Tighten/Loosen, Module 1 note circle goes up
  counterclockwise and says "3+ steps" (CHANGELOG 2026-11-08); guards in check 1cp (21 pins) and a smoke walk; a
  **"Start over"** button that clears the saved level (Jonathan, 2026-11-08; `3625df5`). Peg: counterclockwise tightens
  (Jonathan, 2026-11-07, `bf7c927`); it has flipped three times, so ask him to check a real guitar before changing it.
- **Teacher console Layout A** (`4950e86`, `fff71ec`, `6e64a62`; review round 1 `c562e7d`; rounds 2-3 `79c48a9`..`b04f201`)
  and the **units tree** (`890eae7`, Fast): "Recently shipped" → the two 2026-11-08 entries.
- **Docs tightening (2026-11-08):** CLAUDE.md rewritten for a model reader (`cdeac85`, `3625df5`); every skill and every
  `.claude/rules` file split into one-rule bullets, then cut 20-35% (`7ba94ba`..`ab4aaae`); WORKFLOW.md cut from 47k to 14k words
  and its orphaned rules moved into the binding files (this push).

**Waiting on Jonathan**
- **Practice minutes console view** (`997df22`, `07a4e04`): he pasted the rules on 2026-11-06 (memory
  `firestore-rules-published`; no hash check). Left: open **Practice minutes** in the console and check a student or two
  against their My progress (rank can differ slightly: "Recently shipped" → 2026-11-06 Practice minutes in the teacher console).
- **Power Chord Switch strum ratio:** 1.8 / 2.19 since 2026-11-07 (2.2 / 2.67 from 2026-11-05; Change Up and every other
  loop keep 1.4 / 1.7). Numbers and rollback: "Power Chord Switch: where we stopped" → "Decision (2026-11-07)", then
  "Decision (2026-11-05)"; tempo controls (2026-11-05) → "Tempo controls". "No readable pitch, no tick" was rejected on
  2026-11-07: do not build it. **His first step:** a thumb or finger strum take on a test student account at 60 and
  120 BPM, then "Evaluate all recordings" and read "Played, not counted".
- **To watch in the next takes (from 2026-11-07):** "Played, not counted" (`detector-missed`) at 35-40 BPM should fall;
  "heard, not there" will rise a little in noisy rooms (on the 7 takes graded at 1.4, 20 of 31 false hits still fire at
  1.8, 10 at 2.2). Not covered by the real takes: thumb or finger strummers, fast every-beat pairs (up to 140 BPM; the
  12 takes ran at 40-90 BPM, one at 90/105/120), and Chromebooks that draw slowly (11 of 12 takes had 16.7 ms frames,
  1 had 33, none 50).
- **Recordings:** the Pitch-rule table (console → Mic recordings → Evaluate all recordings) was read on 10 takes on
  2026-11-07 and the rule rejected (removes 2 of 12 false hits, loses 10 of 46 real rights); the table stays. The 34
  takes (21 Power Chord Switch) are kept outside the repo (`~/Documents/mic-recordings-2026-11-07.zip`): they carry
  student names.
- **Grid step cap number** (60 ms) and the other open product calls: Open work → the 2026-11-06 Friday check item.
- **Optional:** the console's `heartbeats` composite index (Firestore → Indexes, the only index); nothing uses it.

**Automatic:** the Friday check (Fridays 11 PM Pacific). The 2026-11-06 run (tag `friday-check-2026-11-06`) covered
`b958165` and `ce5096e`. The next run (2026-11-13) takes `git log --grep='Review: Fast' friday-check-2026-11-06..`.

**Handed to the Friday check (Jonathan, 2026-11-10: "let the friday check fix those things").** In the 2026-11-13 run,
besides the usual range. Do not ask him; decide, fix, report.
1. **Review the Tuning Simulator change by hand:** `e471fac` and `e2e58c3` (no strings picture, no naming step; a card
   says the string to tune and what the tuner shows; CHANGELOG 2026-11-09 "later that night"). Neither commit has a
   `Review: Fast` trailer, so the `--grep` skips them: add them to the reviewer's diff yourself. The full smoke (step 1b)
   walks the Tuning Simulator; any error it names is yours to fix.
2. **"Too fast" through `cc.prevOnsetT`** (`coach.js`, `ccFinish`: `lastOnsetEff`; written near the onset handler).
   Two Fable reviewers, working separately, found that a press and release heard as two onsets can bring back the "too
   fast" headline. It was NOT run against today's code (entry "Weekday reviewers are Fable at medium", Open work).
   First build a failing case with `tools/mic-sim/power-switch.mjs` on the real code. Cannot fail it → drop the item and
   say so in the report. Fails → this is `coach.js` detection: fix on branch `friday-check/2026-11-13` and run the
   `site-reviewer-deep` rounds (skill `friday-check`, step 3).
3. **Refresh this block:** it does not list the Tuning Simulator change or the reviewer-model change (2026-11-09 night).
   Add both, move shipped items down, and set the "updated" date.

**Finished (don't redo):** the practice-minutes heartbeat removal (2026-11-05; the old `minutesBoard` collection deleted
too; the class rank and Top 5 are keyed by a private tag, so no uid sits next to minutes). `tools/pm-rules-test.mjs`: 191
emulator cases since 2026-11-06 (179 before); needs Java 21 (on Jonathan's Mac at `~/tools/java`, not on PATH; recipe in
the file's header); one leniency pinned, not fixed: a chunk with no `i` field is accepted.

**Settled, don't re-raise:** the 30 s take cap, the real-guitar mic check, the three "chord sounded wrong" wordings, no
Note Runner mic check ("Later (not chosen yet)"); Stopped-game room-noise rule: room noise after a change counts as a try
(Jonathan, after review round 2, 2026-11-07; recorded in memory `stopped-game-headline-2026-11-07`; `f47a730` had left it
open); Module 1's "3+ steps" vs the Tuning Simulator's 4-5 step levels: leave both (Jonathan, 2026-11-08).

---

## Working conventions

- **Two Claude sessions at once → each in its own git worktree** (`git worktree add ../guitar-class-<tag> -b work-<tag>`).
  One index shared by two sessions swept unrelated work into `6dcf68c` (2026-07-12). On the Mac a SessionStart hook
  (`~/.claude/hooks/cc-session-lock.sh`, in `~/.claude/settings.json`) reminds Claude; it does not move the session.
  Windows: by hand. CLAUDE.md → "Parallel sessions share one `origin`".
- **Cowork can't push; Claude Code on the web can** (2026-07-23; narrowed to Cowork 2026-09-04, when a web session
  pushed `d0e3dfa` to `main`). The web session cannot reach the live site (proxy 403: no `--live`, link check = warnings
  only). Patch-pair handoff: skill `session-handoff`.
- **Single-flow modules (2026-07-23):** a set with only `stations.b` renders one learn tab straight into the checklist:
  `tabTitle`/`tabSub` (+`_es`) on `stations.b`, `checklistSub` (+`_es`) on the set. Module 13 (`module-13.js`) is the
  first; its 4 checklist skills are the graded in-class assessment rubric.

---

## Open work

- [ ] **2026-11-06 — Friday check: left for Jonathan.** Done 2026-11-07: "No streak right now" (`93cb1dc`); the My
  progress pin gap (`pm-sim` section 18, `PM_SIM_PIN` 285 -> 302); ca-43 is a board limit at fret 12, not a drill bug
  (4 of 10 "Frets 8 to 12" cards and 2 of 24 on the whole neck light only the root; the 2026-11-02 changelog line says
  so); the smoke slider gap (card slider dragged to 77); check `1d` flags a shared step before a path step. coach.js
  fixes (Stop hint, 10 s of play, 130 cap) landed 2026-11-07. What is left:
  - [x] **Stopped-game headline** (Power Chord Switch and Change Up; `ebe88ca`, `432dd68`, `f47a730`, then rounds 3-6
    above). Done. What binds:
    - **Decided (Jonathan, 2026-11-07):** a Stop with changes still ahead where every REACHED change was right
      (`ok === total - cc.unreached`, `cc.unreached > 0`), below 85% of all changes: "N of M changes worked before you
      stopped." + "Every change you reached worked. Play it again, to the end." (`games.cc.verdict.stopped`/`stoppedOne`,
      `games.cc.advice.stopped`); no "too fast", no "Drop 5 BPM" (Change Up 10); tempo row stays. At 85% or better the
      good-score screen stays. Never-reached chips are grey at any score (`coach-chip notreached`); the breakdown ends
      "· N not reached" (`games.cc.breakdown.left`). A Stop before any change fell due (`cc.noneDue`): the neutral "You
      stopped before the first change." (Jonathan chose it), no tempo advice, no XP or best. Unchanged: a Stop where a
      reached change was wrong or not heard, a game played to the end, a Stop in a later round's count-in.
    - **"Never reached"** (`ccFinish`, `c.neverReached`): due within `CC_STOP_REACH_MS` (4 s) before the Stop, after
      the last graded strum AND after the last strum heard (`cc.lastOnsetT`). A sound in the last 300 ms is the Stop
      click: ignored, its open pitch check dropped (only the LATEST onset's) and removed from the saved take (rounds
      3-4, 2026-11-08). Changes due, none reached: "No strum was heard before you stopped." (`cc.noStrum`,
      `games.cc.verdict.stoppedSilent`) or "No change was heard before you stopped." (`stoppedNoChange`), no breakdown
      (2026-11-08, Jonathan chose the first wording).
    - **Silent Stop (R5-2, Jonathan, 2026-11-08):** `cc.silentStop = !ended && cc.noStrum`, no change graded
      (`ok === 0 && off === 0`) → "No strum was heard before you stopped." even past the 4 s window (it read "too fast"
      in 4-16 of 64-116 simulated Power Chord Switch Stops, 32-108 in Change Up). Power Chord Switch keeps "strum a
      little firmer" for two or more unheard changes. Not covered: a silent game run to the END (Change Up still says
      "too fast" for a dead mic).
    - **Room noise counts as a try** (Jonathan, after review round 2, 2026-11-07; recorded in memory
      `stopped-game-headline-2026-11-07`; `f47a730` had left it open): any sound after a change fell due means "tried
      it". With one noise onset a second, the clean screen survives in 72-76 of 96 games (89-93 without the rule);
      without it a student who strums late and gives up reads "4 of 4 worked".
    - **Known, left alone:** a Stop within about 300 ms of the final strum's arrival counts that strum as the click
      (R4-2: loses XP, "complete" and best in 120 of 420 simulated Stops at 150 and 250 ms; the alternative credits a click
      as a played change, 56 of 56). A song switch whose round 1 was silent, Stopped within about 0.2 s of round 2 at
      130 BPM, reads the neutral screen (R2-3). A song switch's rounds line counts only the changes reached (a round
      with none is not listed). The done screen at 1366x657 was reasoned, not measured (+20 px if the
      breakdown wraps).
    - **Song-switch setup** stops at 130 (`ccSetupMaxBpm`); a pair's 135/140 comes back unless a tempo was set on the
      song switch (`cc.heldPairBpm`). Check `1ck` runs about 23 real games plus a setup walk.
  - [x] **Grid step cap** (`e77ec8f`, merged 2026-11-07 at Jonathan's request after three deep-review rounds; the last
    fix commit was not re-reviewed). `CC_GRID_STEP_CAP_MS` = 60 ms in both games; each take saves `gridStepCapMs` and
    the console's replay (`micEvalTakePw`) uses it (none = uncapped); checks `1ck`, `1cl`. **Open judgment call for
    Jonathan** (`tools/grid-sim.mjs`, 21,888 games per version; wrong→right / right→wrong at 30 BPM and up): 40 ms
    164 / 4, 50 ms 104 / 4, **60 ms 72 / 4**, 80 ms 47 / 4, 100 ms 22 / 0, 150 ms 3 / 2. 60 kept as the suggested value
    with faster catch-up; another number is one line plus the pin in 1ck. 67 of the 72 and all 4 come from one very
    loose player (strums spread 0.2 beat, no stray sounds); below 30 BPM 20 turned right, 1 wrong. Catch-up (strums to
    within 50 ms, old / capped): 10 BPM 0.2 beat late 12 / 22, 0.4 beat 14 / 42; 15 BPM 0.4 beat 13 / 29; 20 BPM 0.3 beat
    11 / 17; 30 BPM 0.4 beat 10 / 15; almost no difference at 60 BPM and up. A player 1.5% off ends 250 ms short at
    10 BPM every beat (1085 old / 838 capped); grading was unchanged in the reviewer's 224 drift games at 10-40 BPM. Not decided: the Listening Coach (`coachMatchEvent`) grid is uncapped
    (up to 270 ms at 30 BPM); left alone.
    - [x] Grid step cap number: **60 ms kept** (Jonathan, 2026-11-09; students' feedback can reopen it).
  - [x] **Top-tempo advice** (`0b5c611`, `82fb6fa`, `95afba0`, 2026-11-07): "The tempo cannot go higher. Play it again."
    (`games.pw.advice.top`). Not changed (product call): a pair sped up live past its counted tempo still says "Level
    up". **Fixed 2026-11-09 (Jonathan):** Change Up at 140 says the top line too; at the floor (10 / 40 BPM) neither game
    says "Drop N BPM" or "too fast" ("Try it again at this speed until it feels steady."); the lit button never names a
    step the tempo cannot take (`ccDoneAtTop` / `ccDoneAtFloor`, 1ck topChecks 64).
  - [x] **Decided (Jonathan, 2026-11-09): 2 clicks below 60 BPM instead; the Stop button is not built.** The count-in
    before each round of Power Chord Switch and Change Up (`ccCountInBeats`, coach.js) is 2 clicks below 60 BPM, 4 at 60
    and above, still on the beat; the counter shows 3, 4. Waits (plus a 0.1 s lead, 0.4 s while recording): 12 s at
    10 BPM, 8 s at 15, 6 s at 20, 4.8 s at 25, 4 s at 30, 3 s at 40, 2.2 s at 55; 4 s at 60, 2.7 s at 90, 1.7 s at 140
    (was 4 beats everywhere: 24 s at 10, 8 s at 30). A song switch counts in each round at that round's tempo. The
    Listening Coach, Strum Radar and Note Runner keep 4. A saved take lists each round's clicks (`countInBeats`); the
    console's evaluator reads it (4 for a take without it; a missing or odd entry is guessed, no delay) and measures a 2-click
    round's mic delay from beeps 1 and 2 (none when only beep 2 is heard).
    Checks: 1ck (the real count-in run on a fake clock), 1cl (five count-in takes).
  - [x] **Product calls, decided 2026-11-09 (Jonathan):** Call the chord Follow: a tap in the beat before the window is an
    early miss (`chcEarlyFrom`; no sooner than half a beat after the change before; tapping every 250 ms passed 24 of 80
    rounds, now 0; 1cn). Tuning Simulator: the status line is blank during "Which way?" (smoke). Play strum stops a running
    Metronome and clicks evenly (smoke). Name the Power Chord keeps its round on a hidden tab (smoke). Left alone: two
    devices can save different path picks (rare, nothing lost); `.ca-paths-grid`'s 760px breakpoint (no effect at 1366).

- [x] **2026-11-07 — `tools/smoke.mjs` hangs.** Two runs in the `guitar-class-ratio` worktree never finished (one sat
  about 4 hours, headless Chrome 157); Jonathan had to force quit Chrome. Not the profile, port or machine load.
  Same family as the 2026-11-04 hang (Chrome 156; Chrome 157 fixed that one). **Watchdog shipped 2026-11-09:** no step
  started for `--stall` 120 s, or the run past `--timeout` 2400 s → it prints `smoke: ✗ HUNG … Stuck at "<walk>:
  <step>"`, closes its Chrome (SIGKILL after 1 s) and exits 3 (CLAUDE.md step 3). The cause is still unknown: the next
  hang names its step. Proved: a step that never settles was named after 20 s (`--stall 20`); the overall limit fired at
  25 s; with the watchdog switched off the same hang ran until killed from outside; a healthy run did not trip it. Same
  commit: every run used to leave a small Chrome profile folder in the temp dir (deleted while Chrome was still
  writing it); cleanup now waits for Chrome to exit first. Still sensible: run it with your own Chrome closed. Decided 2026-11-07 (Jonathan): the 1.8 / 2.19 ratio
  shipped without a smoke run.

- [ ] **2026-11-02 — `tools/smoke.mjs` flakes after its page reload (cause unknown).** About 4 of 9 runs reported errors
  right after the Power Chord walk's `Page.navigate` (`chordDiagramSVG is not defined`, `NOTES is not defined`, `Cannot
  access 'shRaf' before initialization`); no failed fetch. If it shows up: rerun once on a quiet machine
  (`pkill -f headless=new` first); if it persists, look at the service worker's first-load cache and the fixed sleeps
  around `devBypass()` in `powerSwitchWalk`.

- [x] **2026-11-02 — Power Chord Switch setup overflowed with "Best today"** (`611503a`, `15eec92`): the score is its own
  line (`.cc-best-line`, 18px, always drawn so the pair buttons do not jump); the title's no-break space is pinned by 1ca; smoke checks it. Done.

- [x] **2026-11-01 — Song popularity counter** (`3a062bd`; Jonathan chose "students + total opens"; marked done 2026-11-09). Counts start
  2026-11-01: a "More Play Along songs" click writes `songOpens` to the student's own `progress/{uid}`, outside
  `flushSave()` (1bo cannot reach it). Not counted: teacher, dev bypass, signed out, Core rows, opens from activities or
  a link. The console's Songs view shows "Opened: N students · M opens" (whole counts 1..1000 only: student-written).
  Check 1ch.

- [ ] **2026-11-01 — Early Friday check** (range `friday-check-2026-11-01`..`dfcb8a7`). Fixed: `8a4376f`, `050017a`,
  practice minutes R2-1..R2-5 and PD-1..PD-5. Decided (Jonathan, 2026-11-01): count liberally, a rare double is fine; a
  miss before any streak spends no free miss. Done: test gaps (pm-sim 142, 2026-11-02); R2-6 (`adopt()` takes the
  `pm:q:<uid>` key `70ef823` wrote, 2026-11-02); PD-6 (closed 2026-11-05); impossible tips (`611503a`, `weekReach`,
  1cg: goal ≤ 7 × daily cap; "hide Longest at 0", Jonathan 2026-11-02, reworded 2026-11-07 in `93cb1dc`). Still open, LOW:
  - [ ] Liberal counting can over-count (accepted; the daily cap bounds it; sim: 84 played → 144). Fix if wanted: keep
    a leaving key's in-flight part in its own bucket an adopting page never puts back.
  - [ ] The keepalive's dead-link guard only sees a commit in flight (up to ~60 s lost).
  - [ ] The bar's flame is orange only when this week is hit, My progress's whenever the streak is above 0: pick one.
  - [ ] `weekReach` is covered by pm-e2e only, not checks.mjs.
  - [ ] The "goal reached" toast shows only on a practice card (never on a Journey page: `pendingToast` is per page).
  - [x] `tools/pm-e2e.mjs` and the real date: already fixed in the 2026-11-01 review (it clears the streak start, break
    weeks and semester split before seeding; file lines 137-142). Proved 2026-11-09 with `--date`: 109 of 109 checks on
    each of 12 dates (2026-11-09, -11-25 Thanksgiving, -11-30, -12-08, -12-23 winter break, 2027-01-05, -01-12, -02-17
    mid-winter break, -02-23, -04-14 spring break, -04-20, -05-26); with those lines removed it fails (7 on 2026-11-09,
    29 on 2026-11-30).
  - [ ] `tools/smoke.mjs` draws no practice-minutes UI; `tools/pm-rules-test.mjs` needs the emulator.

- [x] **2026-11-01 — Friday check (Fast commits `a615925`..`65898ce`).** Done 2026-11-01/02. The grey "Optional" edge
  (Jonathan: "fix the optional look to what you think is best"): `quiet = !done && !caStudentIsCAS() &&
  caIsOptional(a)` in `caActivityCardHtml`. Power Chord Switch's results screen stays full width, left-aligned, on purpose.

- [ ] **2026-10-31 — Friday check (first run, `1c1e6c6`..`59e7915`).** R2-1, R2-4, R2-6, R1-1, R1-3 done 2026-10-31.
  Binding: the console skips the signed-in account's own empty document (Jonathan chose this over a local-only trainer
  profile; check 1cf); Change Up's Start sits in the sticky bar (1ca; the −5/+5 row is still below the first screen, only Start is pinned); trainer `dayStr` is the local date (fails under
  `TZ=Pacific/Auckland`). A mic hit on ca-43's two-fret power cards names and marks both frets ("fret 0 / 12"; 1cd). `639248b`,
  `6871747`, `b3a351c`, `cb3dc5e` (mic detection) and `5e2061e` (new check 1cc) should not have shipped Fast; reviewed
  then. **Still open:** check 1cd sees only strings asked for through `ncK()`; a direct `t('nc.*')` on a power screen is
  invisible to it.

- [x] **2026-10-31 — Pushed without a reviewer (after `66266c9`)** — reviewer pass covered by `friday-check-2026-10-31`;
  the live-site look is the open item under 2026-10-30. Binding:
  **Note Call no longer accepts the 5th** (Jonathan, 2026-10-31): kept, a wrong chord a 5th above counted right 7.7% /
  28.9% / 100% at std / mid / weak; dropped, 0 of 1040, no right-strum row changed. Left alone: at std a root-quiet
  strum is heard 67.1%, a two-string root + 5th 65.4%; Riff Runner's Wait Mode still takes the 5th. Branch
  `phase5-sw-audio` merged 2026-10-31 (`fe4e934`; check 1ce; base `ff9e913a6d`). Left on purpose (R1-5): a student who did not open the site
  while it deployed loses every track at the next audio deploy. The `AUDIO_MIGRATION_FP` and rollback rules are in skill
  `audio-and-snippets`.
  - [ ] ca-43 Note Call through a real guitar and a Chromebook mic: not recorded as done.

- [x] **2026-10-30 — Everything pushed in a hurry** (`d4544a3`, `1c3062b`, the Watchtower switch) — covered by the
  Friday checks (tags `friday-check-2026-10-31`, `-11-01`, `-11-01b`, `-11-06`). Branch `wip/main-folder-2026-10-30`
  (based on `6b120f8`) shipped as `158015d`; the main folder's commit `5634815` is `5e2061e`. Branch
  `wip/main-folder-2026-10-30` deleted on GitHub (only `main` remains, checked 2026-11-08). On the **Windows** machine,
  not checkable from the Mac: remove worktrees `guitar-class-pcs` / `guitar-class-wt` if still there; the main folder
  may still hold the old uncommitted Watchtower edits on a stale base (they shipped as `158015d`):
  `git stash; git fetch; git reset --hard origin/main`.
  - [x] Live-site look, done 2026-11-09 on the live site (cache `guitar-class-2026-11-09-f86a139414`), signed in as
    Jonathan, EN + ES. **Watchtower:** only ca-29 is posted to students (ca-26/ca-38/ca-40 checked in the console Preview).
    ca-29 opens on Hendrix (7 sections), switches to Neil Young (8 parts, A G F G 10 laps, its own speed tiers and caption);
    both recordings play (the player's own audio clock advancing on each full mix); Guitar off swaps to each recording's
    rhythm-down mix mid-song; Neil survives a reload and a language switch (`caRecordingModes`); Guitar starts on at
    every render (by design, not saved). ca-26 and ca-40 follow the group to Neil; ca-38 (the lyric chord chart) has no
    switch and stays on the Hendrix track. **Power Chord Switch:** +5/−5 move readout and slider (30↔35); Every beat /
    Every 2 beats / Every bar give 16 / 12 / 8 chords; a fixed pair (F5↔G5) and the random round (drew B5↔D5) start, show
    "next: … slide up N frets", the live −5/+5 row works mid-game; an early Stop gives "You stopped before the first
    change." with grey chips and the row unchanged; a Stop after a room sound at a change keeps the old "too fast"
    screen (by design: keep strict). Change Up unchanged. **Not checked:** the 1366×657 page size (Jonathan's Chrome is
    at 80% zoom in a maximized window; the headless smoke measures 1366×657 on every run).

- [x] **2026-09-15 — "the cure" both-strings root line** (`6e73cd9`). Jonathan chose extending the diagram library
  (`localStringMultiNotesSvg`); the low-E-only verse is the Level up.

- [x] **2026-09-12 — Fretboard Tap** (`6ee4fae`, `286a0e4`). Deferred, not rejected: a chord-builder type, a per-student
  tap breakdown, sharp/flat targets.

- [x] **2026-09-09 — Exit checks** (`e39a9f7`, `2026ac9`; ratchet 1y, because `db377ce` took 1x). Deferred, not rejected:
  a console toggle for `retake`, a `chordName` item, a per-class average, the `kind:'check'` schema in the
  `guitar-class-activity` skill.

- [x] **2026-09-05 — Site audit** (`OPUSPLAN-site-audit-2026-09-05.md`; ratchet 1r). Still open on purpose: caching
  `config/class` in the console, per-key save dirtiness, Note Hunt's colour-only round dots; restricting sign-in to
  `seq.org` needs Jonathan's call.

- [x] **2026-07-26 — Deep site audit** (`bc757ae`; `eeefbda`; closed 2026-07-27). Decisions that bind: Knockin' on
  Heaven's Door uses the real bar lengths `|G|D|Am|Am|G|D|C|C|` (2026-07-26); `objective` removed (2026-07-26) and
  `assessment` deleted (Jonathan, 2026-09-02; `MODULE_REVIEWS[n].assessItems` is what renders); m5w4 Full Run links each
  of the three songs inline (Jonathan, 2026-07-27); a one-`<li>` Challenge-card list is correct (Challenge-card rule);
  `blend-words-game.html` stays out of `sw.js` and checks.mjs (Jonathan, 2026-07-26); the console's Coach-gate markers keep
  the same green check (never a worse-looking mark for an override) and are English only (gate 2026-07-25; done 2026-07-27).

- [x] **2026-07-28 — List sweep over-listing check, Coach gate on a real guitar (2026-07-27, `COACH_GATE_MIN_LEVEL` = 2),
  Note Runner live check (`NR_UP_PCT` / `NR_DOWN_PCT` 90% / 65% stay; 70 ms Chromebook mic offset), post-review guitar
  pass (`e385d12`).** All closed 2026-07-28.

---

## Recently shipped (post-archive)

- [x] **2026-11-10 — No checklists on the activities; no Mark complete on the extra songs (Jonathan, mid-session: "get rid of
      the checklists on the activities. only have mark complete or next step" and "remove mark complete from the extra songs since
      they're extra"). Fast.** A practice card ends in Mark complete (caToggleComplete); `caTickKeys(card)` is `[]` (no "n of m",
      no hero dots, no nudge); what the Level up carried (the next card's link or the Song Journey button) stays as a plain button.
      An extra song (`caIsLibraryCard`) shows no Mark complete. `pcCheck` is removed; `card.checks` and saved `<id>:c<n>` ticks
      stay. **Reverses** "Complete = every numbered check ticked; Level up is extra" (2026-09-27) and the practice card's "three or
      four checkboxes" (2026-09-27). Guard: checks.mjs 1ct, smoke `noChecklistWalk`.
- [x] **2026-11-10 — Two new log entries no longer stop a push (work order "changelog conflicts"; Jonathan: he "frequently" hits conflicts running a second session). Fast.**
      `CLAUDE.md` step 8 and skill `session-handoff` "Applying a patch": a rebase/`git am` conflict in `CHANGELOG.md` or
      `WORKFLOW.md` where both sides only ADDED lines at the same spot is resolved by keeping both entries, yours on top.
      A changed or removed existing line still goes to Jonathan. Reason and the rejected `merge=union`: "Pre-push checks,
      hooks, parallel sessions". Docs only; no student-visible change.
- [x] **2026-11-10 — An open activity fills the page (work order "open activities without the header and menu", Part 1;
      Jonathan, after a launcher-style layout he likes: "an open activity should fill the page"). Fast.**
      With a card open on In class, `caSyncSolo()` sets `body.ca-fold` and the header and the left menu fold away, full
      screen or not (they used to fold only in browser full screen: 2026-10-10 header, 2026-10-11 rail). Full screen keeps
      its zoom (`body.ca-full`), its "All activities leaves full screen" (2026-10-29) and its normal-window reload; the
      folded view is 1×. The rail's Tuner / Timer / Metro / Record ride in the bar as four round buttons (his pick) that run
      the dock's own `togglePopup()`; the rail is `visibility:hidden` so its popups can still show, pinned under the bar.
      **Reverses** the 2026-10-10/11 note that tied hiding the header and rail to full screen. **My call, report it:** the
      four buttons made 12 of 146 bar states wrap at 1366×657 (Focus cards with 6–7 step buttons, mostly Spanish:
      "Todas las actividades" + "Pantalla completa"); when a row would wrap, `caFitBar()` drops the Full screen WORD
      (icon kept, as on a phone) and closes the gaps, so all 146 are one row. Guards: checks.mjs 1cr, smoke `foldWalk`.

- [x] **2026-11-09 — "This week's goal (minutes)" box on the console's Practice minutes view (work order `WORK-ORDER-weekly-goal-box.md`;
      Jonathan: "the edit would be for the week only, then the next week would reset back to 60"). Always Reviewed (danger-zone file).**
      **Behaviour (his, settled):** blank = the flat goal (`weeklyGoalMinutes`, the placeholder); 1..140 (7 × `dailyCapMinutes`,
      derived by `PM.calc.maxWeekGoalMinutes`) = that week's goal; 0 = a break week (same as a `skipWeeks` entry); blank again clears it;
      a `skipWeeks` week shows "Break week (set in config)", switched off, and wins over an override. Per week and kept for ever:
      `config/class.pmWeekGoals = { '2026-W47': 30 }`; an override applies to its own week only, so a past week keeps the goal it had
      (`calc.goalSeconds(c, weekId)`: skipWeeks → override → flat). Past weeks WITHOUT an override are still judged by the current flat
      goal, as before (not changed). **Students see it live:** ring, strip, "N more minutes", streak, toast, recap, My progress all read
      `calc.goalSeconds`. Raising it after a student hit it un-hits the week (recomputed from seconds; the stored week doc's `hit` is an old
      best-effort snapshot and stays true, nothing displays it). Lowering it below what a student has shows the full ring and "goal hit" at
      once but NO toast: the toast fires only when a counted second crosses the goal, once per week (Jonathan chose this, 2026-11-09).
      **Where students get it (read cost):** the main page adds NO read (`loadClassConfig()` already reads `config/class` at sign-in and on
      every tab return; it hands `d.pmWeekGoals` to `PM.setWeekGoals()`); a Journey page makes ONE `get()` of `config/class` per page load
      (`pmLoadWeekGoals`, Jonathan's pick over cache-only; before this the Journey pages read that doc nowhere, the gate read is off).
      The engine keeps the last map in localStorage `pm:wg` (class data, one key per device, no uid) so a slow or offline page does not flash
      60 then 30; a failed read never calls the hand-in. `firestore.rules`: NO change (every signed-in student already reads
      `config/class`; a week doc's `goalSeconds` may be up to 86400, the largest override is 8400).
      **Console:** the box sits above the table (`teacherPmGoalBoxHtml`), a text box with inputmode numeric (no spinner: one save, not one
      per click), saved on Enter or leaving it, Escape puts the saved value back. The writer `teacherSetPmWeekGoal` is the view's ONE write
      and sits OUTSIDE the read-only block (1cg keeps that block absolute): one cell through `teacherWriteConfig()`, cell-checked on
      `pmWeekGoals.<week>` (27th writer, `CONFIG_WRITERS` 27), `fv.delete()` to clear, optimistic copy rolled back on failure, nothing
      written when the box was drawn in an earlier week (a console left open over a Monday). The view now reads the class settings with
      the weeks (once per open / Refresh, `teacherLoadMinutes`); if that read fails the table is not drawn (its goals would be a
      confident wrong answer). The table and its footnote use `teacherPmCfg()` = engine settings + the map cleaned by
      `PM.calc.cleanWeekGoals`, through `teacherPmCompute` and `PM.calc.status`: one maths path.
      **Checks:** pm-sim 302 → 390 assertions (19: the engine, validation, the hand-in and cache; 20: the REAL console functions cut out
      of `teacher.js` and run against the real engine, over inputs 0..1000, rollback, week guard, defaults, console-equals-student;
      21: a goal that changes under an open page; 22: the REAL `renderTeacherMinutes` as drawn, failed-read gate included) — each guard
      broken in a scratch copy and seen red. `console-layout-smoke.mjs` types 30 + Enter with real keys, reloads, clears, sets 0, tries
      bad entries, Escape, a repaint while typing, and a config break week. `pm-e2e.mjs` has a "this week's goal" section (strip and My
      progress at 60, 30, 30-hit, raised, 0, Spanish, next-week-only; screenshots g1..g8).
      **Review (Always Reviewed, round 1 on `3664e1d`): `site-reviewer-deep` on the console write path, `site-reviewer` on the engine and the
      student-side read — no BLOCKER or MAJOR from either.** Their MINORs, all fixed with a break-it proof and no second round (the rule): a
      held "Week goal hit" toast is now dropped, without stamping the week, if the goal was raised or set to 0 while it waited; the box does
      nothing after a failed read of the class settings (it would have been refused as "another tab", or a clear would have done nothing
      silently); a half-typed goal is not painted away by an unforced repaint and a removed box saves nothing; "Saved" is said only while the
      box still holds what was saved; the view guards against an older engine on the page; two sim tests the engine reviewer showed could be
      deleted without a red line (strip repaints at once; a lowered goal gives no toast); the disabled "Break week (set in config)" box was
      drawn at 60%. **Product note for Jonathan:** 140 (7 × the cap) is allowed on any day, so typing it on a Wednesday gives every student
      the "You can't reach the goal this week" line. Open: the My progress panel redraws only when opened (the strip repaints at once).

Detail lives in git log and `CHANGELOG.md`; entries keep what still binds.

- [x] **2026-11-09 (night) — Weekday reviewers are Fable at medium; Friday's are Opus at xhigh (Jonathan: "Fable was
      much faster, so yes").** Test: four Fable-medium reviewers, one per round of the 2026-11-07/08 Stopped-game
      reviews (`ebe88ca`, `432dd68`, `f47a730`, `4582bda`), each on a two-commit copy that could not see the later
      fixes, scored against what the original Opus-xhigh rounds found (the fix commits' messages). Found 15 of 20,
      1 partly, the main bug in every round, in 18-22 minutes each. Missed: a Stop before the first change saying
      "too fast" (round 1), the Stop click left in the saved take and the breakdown contradicting the headline
      (round 4). Found and not in the originals: Change Up untested, a run of missed changes before Stop reading
      "every change worked", and (two rounds, independently) a press + release heard as two onsets bringing back
      "too fast" through `cc.prevOnsetT` — NOT run against today's code; the two lines are unchanged; look at it
      before the next Power Chord Switch change. Limits: one feature, one file, no timing for the Opus originals.
      A weekday review that lets a real bug through → raise that reviewer's effort first.
- [x] **2026-11-09 (evening) — Faster smoke for changes (Jonathan: "it's taking forever to make new changes given the
      new rules"; "skip the smoke in spanish and add that to the first friday smoke test").** He chose three of four
      offered speed-ups (not running EN and ES side by side): (1) `--baseline <ref>` walks `<ref>` only when this
      checkout has errors; (2) `--only <areas>` (`sets`, `games`, `activities`, `practice-minutes`, `tuning-sim`;
      boot and the four screens always run); (3) a Fast change pushes after the full `checks.mjs` and runs its smoke
      AFTER the push, fixing a failure in the next push. Plus `--en-only` for every change smoke. The full walk (EN +
      ES, every area) moved to the Friday check's new step 1b (first thing, every week anything landed) and to the
      end-of-day smoke. Trade-off he accepted: a bug outside the areas a change walked can be live until the next full
      walk. CLAUDE.md "Start here" step 3 and "Fast by default", skill `friday-check`.
      Same evening, also his call: `site-reviewer-deep` runs at `high` effort, not `xhigh` (reverses the 2026-10-25
      choice; every xhigh round of that sweep found real regressions). It keeps its own brief (try to break it,
      failing scenario first) and its danger-zone / 50+-string scope. A deep review that lets a real bug through →
      put `xhigh` back. The Friday check's reviewers run at `xhigh` (his call, same evening: they pass
      `effort: 'xhigh'`; skill `friday-check`).
- [x] **2026-11-09 (evening) — Today's activities = every card dated today or yesterday (Jonathan: "everything with a
      date either for the current day or dated the day before; everything else is unfinished work").** Supersedes the
      cap and the "newest visible date" parts of the entry below. Yesterday is the CALENDAR day before
      (`caTodayWindow()`); asked "on a Monday?", he chose calendar yesterday over the last class day, so Friday's cards
      are Unfinished on a Monday. No cap (`CA_TODAY_MAX` removed). Pending cards first (today, then yesterday; required
      before optional; lowest #N), then finished ones of both days as ✓ rows. Heading dated today; yesterday's cards
      wear a chip; neither day has a card → no heading. The hero is the first required pending Today card, else the
      newest pending card anywhere (null only when nothing is pending — the toast and the resume card read it). The
      gate, the console's Pending count, the board, #N, pins and the folds' order are unchanged. 1cq rewritten for it
      (16 renders per language, `caTodayStr()` stubbed to a Monday; 7 mutations each turned it red).
- [x] **2026-11-09 — Today's activities by release date (Jonathan, 2026-11-09: "newest date leads", "by date").**
      Replaces the board-order hero rule of 2026-09-17 for the Today group ONLY: up to `CA_TODAY_MAX` PENDING cards by
      release date, newest first (one date: required before optional, then lowest #N); the hero (`caStartHereId`) is the
      first pending required card in that order. Below them, outside the cap, every FINISHED card dated on the newest
      visible date, drawn done and not repeated in Completed (Jonathan, same day: "In Today, marked done" — re-dating
      puts it back for everyone, nothing is reset or written); a finished card never takes a pending card's place (review
      R1-1, the lead's rule). A card from another day wears its own `.ca-chip`. The Unfinished and Completed folds, the
      board, #N, gating and deep links are unchanged. The OLDER heading ("Unfinished · From <day>") could no longer
      appear and was deleted with its CSS, its band colour and its two strings. checks.mjs 1cq (real
      `renderClassActivities`, `caToggleComplete`, `caFocusActivity`, 17 runs x EN + ES).

- [x] **2026-11-08 — Console sidebar: a units tree under Class activities (Jonathan's request, shipped Fast).**
      Console only (no CHANGELOG entry). Rows from `teacherSideTreeRows(model)`, the list's own groups, so the counts
      cannot disagree; fold kept per browser, starts open (pinned in `checks.mjs`); hidden below 900px; English only.
      **Decisions (Jonathan, 2026-11-08):** a click shows the unit and keeps the Preview; always visible with a fold
      arrow; Built first. He also said the Chromebook 1366×657 screen does not bind the teacher console. Check 1ch's
      Songs-view sandbox stubs `teacherPaintSideTree`.

- [x] **2026-11-08 — Teacher console redesign, Layout A (work order `OPUSPLAN-teacher-console-layout-2026-11-08.md`).**
      Console only (no CHANGELOG entry). Every new control carries its board twin's `data-*` attribute, so the same
      listener calls the same writer. A grouped sidebar (`TEACHER_NAV`, no "Modules" item; 1cg's Practice minutes pin
      reads it) replaced the 13 view buttons. Class activities = list + tabs (Preview · Students N/M · Settings). A write
      or a refresh never rebuilds the Preview, so a playing song keeps playing. "Unit N" on the list, the detail and the
      board; "Module" everywhere else (labels only).
      **Decisions (Jonathan delegated them under the work order):** `aria-current`, not `aria-pressed`; list counts follow
      the period filter (on All they equal the sum of the board's P4 / P7 / CAS / Unassigned lines); the third count is
      "Not started" (nothing records an open; "started" = a step/check tick in `caSteps`; a path pick alone is not a
      start); the list auto-picks the newest card students can see now; switching rows calls `stopCardAudio()`; a Built
      card's Settings shows only what the board shows for it, an archived one only Restore/Delete; songs opened from
      Songs get a Settings tab pointing back to their own tab; below 1100px the list stacks above the detail; Songs' "Opened:" label wraps below 900px. Round 3 (the
      lead's call): the rename box keeps typed text across tabs (reverses round 2's close-on-leave). Run `node
      tools/console-layout-smoke.mjs` after any console layout change. Reviewed, not Fast (Jonathan's call for this
      order); round 3 on 24c7ccc. ca-21's student text says "Unit 2 assessment" on purpose (Jonathan, 2026-11-09: it should say Unit; settled, do not re-flag).
- [x] **2026-11-06 — Practice minutes in the teacher console (needs a `firestore.rules` paste).** `renderTeacherMinutes()`
      (`teacher.js`): one row per student, grouped by period. Sort This week (default, pinned in 1cg) · All time · Name.
      English only. Jonathan picked the four defaults (STOP 0) and approved the layout (STOP 2).
      **Reads:** `minutes/{uid}/weeks` for every roster student, from the SERVER, on open and on its own Refresh only (no
      timer, no listener). Never `collectionGroup('weeks')` (it needs a wildcard-first rule; 1cg forbids it, and bans
      `collectionGroup` and a spaced `.collection (` in all of teacher.js). Writes NOTHING. Never reads the boards or the
      tags: rank and Top 5 come from the weeks docs via the engine's pure `calc.rankPlace()` / `calc.top5Place()`. Rank
      counts the whole roster (archived too), whatever the period filter; the teacher is never ranked; total = students
      with at least 1 minute. A student's own rank (from `rankBoard`) can differ slightly; the console's is the true
      number (a note under the table says so).
      **Rules:** `allow read: if isTeacher();` in the `minutes/{userId}/weeks/{week}` block only (pinned whole in 1cg);
      emulator 191 passed, 0 failed. The view handles unpublished rules, so code before the paste breaks nothing.
      PM_SIM_PIN 278 → 285.
      **Jonathan's call (same day):** keep it as is: one click shows every student's minutes by name (the reviewer's
      projector note), no extra click. Left on purpose: collection names held in variables are not caught by 1cg.
- [x] **2026-11-04 — Practice minutes: Top 5 of the week, by class period (needs a `firestore.rules` paste).**
      Most minutes THIS ISO week inside the student's own period; ties share a place; 10 minutes needed
      (`top5MinMinutes`); each student sees only their own place.
      **Standing rule from Jonathan (2026-11-04): no per-period minutes tied to a name, readable by anyone.** The board is
      keyed by a private random 32-hex tag: `weekBoard/{tag}` `{week, period, seconds}`; the tag lives only in the owner-only,
      create-only `minutes/{uid}/meta/board` (page memory only, never localStorage: a shared Chromebook would leak uid ->
      tag). A board write only under the writer's own tag (rules pinned in 1cg). Read from the SERVER only: offline, a
      plain get() answers empty from the cache (measured on the real SDK).
      **Closed 2026-11-05 (Jonathan's picks: take the names out of the live quiz, then also key the class rank by the tag).**
      `liveQuiz/current.scores` carries NO name (names live in the teacher-only `answers/{uid}` docs); its writers REPLACE
      the field (a plain merge is deep and kept old names); checks.mjs **1cm** runs them. The class rank moved from
      `minutesBoard/{uid}` to `rankBoard/{tag}`; `minutesBoard` has NO rules block and 1cg fails the push if one comes
      back. Never publish a name next to a uid, or minutes next to a uid, again. **The one-time delete of `liveQuiz/current.scores` after this deploy turned out moot (no such field by 2026-11-09); the old
      `minutesBoard` docs were DELETED in the console on 2026-11-05 (the whole collection; Jonathan asked).** Still true: `config/class.periodOverrides[uid]` is readable
      by every student (a period, never a name).
      Known limit: a tag cannot be proven unique, so any account can claim another's tag and lower/remove that entry (fix:
      a create-only `boardTags/{tag}` with `existsAfter`; not built; two cases in `tools/pm-rules-test.mjs` pin it so they
      flip when it is fixed). `tools/pm-rules-test.mjs`: 179 passed, 0 failed on 2026-11-05; one known leniency pinned (a
      chunk with no `i` is accepted, which the console never reads).
- [x] **2026-11-01 — Practice minutes (student view only; display switched ON the same day: `uiOn: true`, `streakStartWeek: '2026-W45'`, goal 30; 60 since 2026-11-04).**
      **Files:** `practice-minutes-config.js` (every setting, nothing else), `practice-minutes.js` (engine + all UI; its
      header has the mechanics), `tools/pm-sim.mjs` (part of checks.mjs **1cg**), `tools/pm-e2e.mjs` and
      `tools/pm-rules-test.mjs` (by hand).
      **2026-11-03 — ALL SITE WORK COUNTS (Jonathan: "any work inside the website from modules to other class activities
      should count towards minutes and streaks"; reverses the backing-tracks-only rule).** A second counts while any
      audible `<audio>`/`<video>` plays, OR the student showed a sign of work in the last 2 minutes (`ACTIVE_MS`); 10
      minutes (`FRAME_ACTIVE_MS`) while focus sits in an embedded video iframe. Goal and cap kept that day (his call). **2026-11-04 — weekly goal 30 → 60 minutes (Jonathan);** the daily
      cap stays 20 (`dailyCapMinutes`; `dailyCapSeconds()` 1200), so a week needs at least 3 days at the cap (60 ≤ 7 × 20,
      the 1cg range check).
      **Storage:** `minutes/{uid}/days/{date}` and `minutes/{uid}/weeks/{ISO week}`. Chrome fires `pagehide` THEN
      `visibilitychange:hidden` (measured, Chrome 153). A commit has NO timeout (re-sending multiplied the seconds).
      **Jonathan, 2026-11-01: "be liberal with minutes since this is for motivation"** (reversed his "lose under a minute"
      call the same day): when unsure, count it; the daily cap bounds it. Streak: a miss before any streak spends no free
      miss (Jonathan, 2026-11-01).
      **`firestore.rules`: new blocks need the console paste BEFORE the code is live, or every write is refused** (the
      client retries every 5 min, so a late paste loses nothing). `dailyCapSeconds()` in the rules must equal
      `dailyCapMinutes × 60` (1cg). **2026-11-06:** the teacher's account may READ `minutes/{uid}/weeks/*` (the console's
      Practice minutes view; one more paste): see that entry.
      **Rules (all in the config; simplified 2026-11-01 by work order):** the goal is FLAT (`weeklyGoalMinutes`, every
      counted week, every student). NO meeting days, no no-school dates, no short weeks, no proration (1cg fails if those
      keys return). `skipWeeks` is a list of Mondays (checked); a skipped week neither counts nor breaks a streak, and its
      minutes still add to the totals. `semester2Start` (Mon 2027-01-04) resets the one free missed week per semester.
      "This week by day" is Mon-Sun. `streakStartWeek` = the week `uiOn` went live; streak and "hit" are recomputed against
      the CURRENT goal, so changing `weeklyGoalMinutes` re-scores old weeks (stored `hit`/`goalSeconds` are a snapshot).
      The prefilled skip weeks and the semester date came from the work order, not from a calendar: check them against
      the district's.
      **2026-11-04 — the strip moved to the main top bar, every page** (`#pm-header`); Games covers the header, so it has
      its own twin `#pm-games`; the Live quiz overlay has no strip (on purpose). STOP B: Jonathan chose to shorten the week text (`pm.weekMin` "{done}/{goal} min"); later that day (Jonathan: "drop it and add this
      to games screen") "N playing" was dropped. Measured at 1366×657: Spanish holds one row to 35-character names,
      English to 56; longer names wrap the bar from 49 to 70px (not fixed).
      **Heartbeat removal: DONE** (code 2026-11-04: `5144c6c`, `edb60e6`, `3d87f7d`; rules, index and rules test
      2026-11-05, console paste included). 1cg pins the heartbeats rules block as "gone, or exactly as shipped". Last
      2026-11-04 commit before it: `fe196aa`.
      **Class rank on My progress ("N/total", Jonathan, 2026-11-04; now `rankBoard/{tag}`, see the Top 5 entry):** rank =
      1 + others with more WHOLE minutes; under 60 s, no number. About 150 reads per refresh, at most one per 3 hours;
      the Spark limit is 50,000 reads a day: if the class grows, replace the full read with a count query. Accepted
      limits: a student at DevTools can claim any number up to the cap; any Google account that signs in once adds 1 to
      the total (Jonathan chose no domain rule); a Journey page's player loops and counts while it plays (the cap bounds
      it); `--streak-dim` is 2.5:1 on purpose. His 2026-11-04 acceptance of names in the live quiz was superseded on
      2026-11-05 (Top 5 entry). As of 2026-11-04, pm-e2e's fake `minutes` collection had a duplicate `doc` key (since
      70ef823), so the e2e never ran the board WRITE.

- [x] **2026-10-31 — "Hear It First": a hidden adaptive ear + fretboard trainer.**
      Work order `WO-hear-it-first.md` (kept out of the repo). `index.html?hif=1`, any signed-in account; never visible
      to students (its rules: CLAUDE.md and `trainer-core.js`'s header). Within 45 cents counts, 45–50 is "didn't catch
      that". Saves `progress/{uid}.trainer` (rules unchanged); 25 KB with all 208 cells (under 30 KB). Sound is synth only
      (recorded notes stop at MIDI 74; the trainer goes to 84).
      **Before a student release:** the unlock rule (every new cell at m ≥ 0.75 and n ≥ 6) is slow: a steady 95% learner
      opens Z2 at about session 7, Z3 at 28, Z4 at 60–78, and does not reach Z5 or T4 in 90 sessions (switches:
      `unlock.granularity`, `unlock.minN`, `weights.coverage`). Open interpretations I1–I11: header of `trainer-core.js`.
      Not yet checked on a real guitar: the work order's section 8 checklist, frets 13–20 on B and high e (up to 1046 Hz).

- [x] **2026-10-26 — Watchtower: the record's rhythm replaces the book rhythm.**
      Measured on the beat map (26 A-bars, 26 F-bars), confirmed by ear by Jonathan. Bar 1 is `A A A A G G G G` (G on
      beat 3, no rest); bar 2 is `F F F · · G G G`. Applied in Modules 2–7, ca-29 (one rhythm in every section), ca-38's
      caption, Riff Runner (14 targets a lap), Journey Layers 2–5, the song-facts skill. Left on purpose: ca-26 (two plucks
      per note) and ca-40 (one 2-beat strum per chord). The F bar's rest is a HELD third F, never `{ rest: true }`, so
      ca-29 stays at 224 chord changes.

- [x] **2026-10-25 — Whole-site sweep + audio levelling.** 111 commits (`5d1ff51..6ea5898`, live `…-6f4dcd3b92`) and 18
      more for Teen Spirit (ca-41) and the loudness pass (`..ba655c7`, 32 mp3s re-encoded, +267 MB in git history). New
      checks **1br**, **1bs**, **1bt**, **1bu** (soft: each song within 1 LU of "the cure"); 1bf *renders* the card
      builders; 1ah follows the guard, not the token. New tools: `tools/smoke.mjs`, `tools/loudness.py`. Items left for Jonathan: project memory `site-sweep-2026-10-25` (the ca-38 Watchtower caption
      was done 2026-10-26). Six backing-track files stay more than 1 LU off "the cure" on purpose (Jonathan chose one gain
      per song).

- [x] **2026-10-10 — "Keep practicing" row (pinned activities).** `config/class.activityPins`: an ORDERED array of up
      to 4 activity ids (an array because the order is what students see; 4 is a hard cap). Console switch on each
      assigned, non-check card (`teacherSetActivityPin`); a 5th pin is refused; the strip above the board is the only way
      to unpin an archived card. Delete unpins; Archive keeps the pin. The writer is cell-checked on the whole array;
      1ai `CONFIG_WRITERS` 20 → 21. The pin stands in for the release date for that row only:
      `caIsVisible`, the three blocker rules and Today's activities never read it; it writes no completion data;
      Hidden / Archive / Delete / unassigned still win (`caPinReachable`). Since 2026-10-13 pins stay put even when one is
      today's card (Jonathan). No `firestore.rules` change.

- [x] **2026-10-06 — Play-along first: Song Journey pages stay open as the
      back door.** Reverses part 1's per-song retire switch (`fc7e878`, reversed the same day). One rule for every link to
      a song: if students can open a whole-song card for it (and that layer), the link opens the card; otherwise the Song
      Journey page (`openSongLink(slug, layer)`, decided at the click). `tabs/journey.js` / `journey-theme.css` match `dbf1dc2`. 1bn: every
      whole-song card names its song + layer, no two share a pair, none names the page, and the retire switch cannot
      come back. Nothing deleted.

- [x] **2026-10-06 — Song Journey phase-out, part 1: a per-song retire switch.** `JOURNEY_RETIRED` (`the-cure`,
      `seven-nation-army`); superseded the same day by play-along first (above); part 2 cancelled. `journey:` stays on
      every card (it places a whole-song card on its Songs row).

- [x] **2026-10-06 — "the cure" Journey page: the record plays each chorus
      three times.** The record plays Dm · F · C · G three times (12 bars). Per Jonathan, the eight-bar teaching (page and
      ca-18) stays; one play-along note says so (EN + `data-es`).

- [x] **2026-10-06 — "the cure" whole-song captions: "3 times" → "3 laps,"
      plus ratchet 1bm.** ca-24 and ca-30 captions now say "laps"/"vueltas", matching their `repLabel: 'Lap'` badge.
      1bm fails the push when a caption's counting word differs from its badge's (whitelist Lap/Vuelta, Time/Vez,
      Verse/Estrofa), both languages. Chorus length untouched (12 bars: 4 × 3 laps).

- [x] **2026-10-05 — Seven Nation Army chorus captions: "second lap" →
      "second time."** ca-25 and ca-31 Chorus captions use "time"/"vez", matching `repLabel: 'Time'`. "Lap" stays the
      site's word everywhere else; this was not a rename.

- [x] **2026-10-02 — "Open through Module N" (per-student module skip).** `config/class.moduleOpenThrough`
      (`uid → 2..12`), set from Manage's "Open through" select (Auto deletes the key). `isModuleGateLocked` opens modules `<= N`; `isSetLocked` opens every set of
      modules `< N` (module N keeps its set order). No progress writes, no student text, no rules change. 1ai writer count
      17 → 18. Deferred: a whole-class setting, a bulk control, a student notice; a skipped module's Module Review stays
      preview-only (it is locked on the module's skills, not on the gate).

- [x] **2026-09-25 — One activity on the In class page at a time (Cowork
      patch 0002, on top of Focus view).** Jonathan picked "hide them, every activity" over dim-and-lock. `caSyncSolo()`
      hides everything but the open card; "◀ All activities" closes it, stops card audio and scrolls to the top.

- [x] **2026-09-25 — Focus view for class activities (Cowork patch).** Jonathan picked Focus view (one step at a time)
      from three designs; on for ca-10, ca-18, ca-20 and ca-21 via the activity-level `view: 'focus'` flag; print and the
      teacher preview show every step. 1d rejects any `view` value other than 'focus'.

- [x] **2026-09-20 — Left rail navigation cleanup (work order, pasted in
      chat — no saved file).** Pushed `4f497cd`. "Practice"→"Modules"; rail-only "In-Class Activities"→"In class"
      (`nav.classActivitiesNav`). Module review is a `.rail-station.st-review` row at the end of "This set", with the 🏆.
      Header subtitle dropped (Jonathan: "this text isn't necessary… save space").
      **Decision (Jonathan, 2026-09-20): keep the two-column nav grid, permanently and at every screen size**, with short
      labels, uniform rows, an active state that changes background/color only, and `#my-progress-btn` spanning both
      columns. Why: the work order's single-column rows overflowed the rail by 106-132px at 1366×657 on essentially every
      module. Measured by child rects: ~19px of rail slack on m5w2 for the teacher view, ~66px for a student.

- [x] **2026-08-04 — Cross-module gate: Set 1 locked until prior module +
      review done (work order, pasted in chat — no saved file).** Pushed `937ff9a`. `isModuleGateLocked(moduleNum)` chains
      modules 1→12: a module's Set 1 stays locked until every built set AND every Module Review row of the PREVIOUS
      module is done; Module 13 always open; existing progress in a module keeps it open for good. A one-time background
      `ensureAllModuleData()` redraws the dropdown (lazy module data would otherwise show a stale 🔒).

- [x] **2026-08-04 — Paper retirement, part 2 (work order).** Pushed `8f7287b`. Module 9's Challenge 2 and Challenge 4
      use a persisted free-text box. "Try spacing TAB rhythm" kept its keyed MC (Jonathan: no second response slot on a
      step); only its paper wording went. New optional `naturals-plus` deck (naturals + F#/Bb) in `DECKS`, an untracked
      bonus step in module-9.js. Landed on top of a concurrent push (`8a5e369`).

- [x] **2026-08-04 — Small-patches bundle (work order, 8 decided items).** Pushed `e89fd6d`. Module 5's Am↔Em target
      20→16; `m3w2-s1`'s beat-1 tempo 60→70 BPM (placeholder 75); "PR ladder" comments → "tempo ladder" (the `pr` type
      and `pr.*` keys untouched); Sweet Child's power-chord challenge retitled "Intro/Verse/Chorus" (Jonathan's ruling:
      the D5–C5–G5 loop isn't verse-exclusive); the last 3 "grab a friend" lines cut; `MC_PINNED` narrow-pin ratification
      comment. Heading audit, 203 `Challenge` labels: one gap fixed (`module-3.js` "F5 ↔ A5 Two-Shape Drill" →
      `("Luna")`). Item 17 (teacher.js uid in onclick) was already fixed; closed by verification.

- [x] **2026-08-04 — Set peek: read-only preview of a locked set.** Pushed `a648364`. A sequentially-gated locked pill
      opens the set read-only (`activateSet(id, {peek:true})`, `.set-peek`). Writes are blocked at choke points:
      `toggleSkill`'s top plus the two drill best-score saves. A static `locked`/`comingSoon` set
      never gets a peek. Peek state is DOM-derived (`.week-panel.active.set-peek`), not a variable.

- [x] **2026-07-27 — site-wide review: outage fix + 13 commits.** The whole site was down: `buildSet()`'s song-thread
      `map` callback named its parameter `t`, shadowing i18n `t()` (fixed `3ab369d`; introduced by `29c5187`). Hence
      `dcdb372`: the `checks.mjs` render smoke test calls `buildSet()` on every set; a harness that can't load degrades to
      a WARNING, never a blocked push (a stale stub must not become a reason to delete the safety net). Also: sign-out
      flushes and hard-reloads, service-worker fixes (`b70621e`); teacher pause + archive as uid→bool maps in
      `config/class` (`90c486e`); the sequential gate is a high-water mark (`6b2c19b`); Module 13's winding is for the
      classical slotted headstock (`7631362`); steel-vs-nylon, and "Smoke on the Water" in G, the riff's key (`7f22360`);
      `firestore.rules` versioned + teacher-email drift check (`44a4adf`); fixes `127bb19`, `475e3b0`, `569fd3d`,
      `ae6f27f` (Module 12 no longer promises a capstone).

- [x] **Module 5 assessment settles on one song; song titles quoted
      site-wide** — pushed `598a580` then `8262116` (2026-07-26). Jonathan reversed the two-song requirement: Module 5's
      assessment asks for ONE core song from memory (Let It Be, Luna, or "the cure"); Set 4's song-of-choice material
      stays as optional ungraded practice. Every song title site-wide is in quotation marks, nicknames included
      ("Watchtower," "Sweet Child"); "SNA" spelled out.
- [x] **Report-an-issue in-site form + always-top-scroll fix** — pushed `a86ec71` (2026-07-24). "Report a problem" opens
      an in-site form writing to `issueReports` (mailto fallback offline or for the dev bypass); rule published by
      Jonathan the same day. Opening a Set always scrolls to the very top (Jonathan dropped the 2026-07-12 scroll
      memory); `history.scrollRestoration='manual'`. A live save by a real signed-in student was not checked at the time.
- [x] **Real-guitar mic tests all passed clean (2026-07-24)** — Riff Runner Wait Mode (on Seven Nation Army) and the
      mic retest (melody mode's `coachNowHtml` preview, one Note Hunt round, one Change Up round) passed. Nothing to fix.
- [x] **Module 13 · String Changing — new single-flow module + graded
      assessment** — `539a939` (2026-07-23). `module-13.js`, 7 sections; nylon ball-end (no tie knot: the string type
      being purchased) and steel; 4 checklist skills = the in-class assessment rubric; videos oEmbed-verified;
      skillCount 4.
- [x] **Keep practicing + My progress → full-screen pages** — pushed `dc2d6ef` (2026-07-23). `#keep-practicing` /
      `#my-progress` hashes; browser Back exits.
- [x] **Songs hub: two-tier layout — Core card + Choice menu grouped by
      difficulty** — pushed `5043121` (2026-07-23). Core six on top; Choice groups by first-appearance module (M1–4,
      M5–8, M9–12, hidden while empty).
- [x] **Practice-step polish trio: disclosure pills, scroll-under-header,
      safe-handling fold removal** — pushed `5cbb316` + `ee1a5f0` + `b95f1f5` (2026-07-23).

- [x] **Live-site device checks, no mic needed — closed without on-device
      confirmation** (2026-07-20; closed 2026-07-23) — **Jonathan decided phone-specific polish isn't a priority for
      him**: done as a scope call, not verified on a device. If phone use matters later, revisit: the tuner's string lock,
      string-selector touch targets, the compact checklist and Song Journey pages at ~360–400px and in print preview.

- [x] **Custom backing tracks for all six journey-page play-alongs — Jonathan
      made them himself** (Jonathan, 2026-07-20 → all six DONE 2026-07-22; `c2b9e94`/`2958547`/`73c7afd`). A=440: "the cure" (Am, 144 BPM), Luna (Am, 128), Watchtower (Neil Young cover,
      Am, 115; display name stays "Dylan/Hendrix"), Sweet Child O' Mine (G, 125; standard tuning, so a half-step above the
      down-tuned record, expected), Let It Be (C, 71), Seven Nation Army (Em, 123). Slow tier: "the cure" 120, Watchtower
      90, Sweet Child 100, Seven Nation Army 100. Lesson (2026-07-23): check an Open item against git log before
      trusting a stale-looking status.

- [x] **Module 12: confirmed the requinto video fits, deleted the leftover
      note** (2026-07-20; resolved 2026-07-23) — La Derrota requinto video `cRJb_f4-M5g` re-verified ; no swap.

- [x] **i18n phase 2 — hand-written Spanish for module/lesson content, tabs/
      pages, and games** (started 2026-07-22) — all twelve module files, the Song Journey pages (`data-es`) and
      `coach.js` (407 keys) hand-translated by 2026-07-23 (`<field>_es` twins). checks.mjs `1b.` requires every `_es` twin (and
      `MODULE_SONGS[N]` `meta_es`) for a module flagged `i18nComplete`. Google Translate REMOVED site-wide 2026-07-23
      (`WINTER_CHALLENGE` removed instead of translated). `translations-review.md` deleted (`956743e`); the review policy
      is CLAUDE.md's i18n section and the glossary lives in `i18n.js`.

- [x] **Practice everywhere (round 2): Modules 6–12 drills + six-string
      Find-the-Note + shell i18n finished + list-formatted directions** — pushed `9d742ac` (2026-07-23; `202f4dd` in the
      cloud session). All 230 course skills practiceable; Find-the-Note covers every string; the list rule for
      directions. m9w2-s2's old "why do the two E strings share note names?" mc was replaced by its fretboard game
      (flagged to Jonathan).
- [x] **Practice System 2.0 (round 1): every Module 1–5 skill practiceable,
      with rep tracking and spaced review** — pushed `1deed88` (2026-07-23). `practiceLog`, a 3-reps/day goal, the "Keep
      it sharp" card, practice types `fretboard` / `chord` / `pr`. `practiceLog` is not surfaced in teacher.js yet.

- [x] **Tuner / Timer / Metronome on the Song Journey pages** — pushed `8eb26f6` + `8f33ae1` + `2acd13f` (2026-07-20).
      Shared `fab-tools.js` and `tabs/fab-tools.css`.
- [x] **Song Journey pages: compact one-layer-at-a-time accordion + tip
      folds + play-along tracks** — pushed `dbd2f8f` + `c0b14fc` (2026-07-20; `archive/PLAN-COMPACT-JOURNEY.md`).
      `tabs/*.css`/`*.js` are fingerprinted.
- [x] **Sidebar redesign + header search box** — pushed `f4d952d` → `92e5da6` (2026-07-20).
- [x] **Station checklists: compact, one-tap-at-a-time steps** ("Concept B") — pushed `e6925ec`, `66cbc7d`, `40a03ba`
      (2026-07-20). Collapse/expand is CSS-class-only, never a re-render, so typed responses survive.
- [x] **REVIEW-PLAN full-site review, P1/P2 batch** — pushed `b76dd67` (2026-07-20); item detail in
      `archive/REVIEW-PLAN.md`. Added the `checks.mjs` Firestore-SDK-version assertion across all 8 copies.
- [x] **Gate the Sets in each module — do them in order** (Jonathan, 2026-07-12) — a Set locks until every skill of the
      Set before it is marked "I've got it!" (`isSetComplete` / `isSetLocked`; first set always open); deep links land on
      the module's frontier set (`gatedJumpGuard`).
- [x] **Fix where each page opens (scroll position)** (Jonathan, 2026-07-12) — per-set scroll memory in `activateSet`;
      replaced on 2026-07-24 by always-top (above).
- [x] **Harden the gate + scroll** (Jonathan, 2026-07-12, worktree `worktree-jh-session`) — `isGatePreviewer()` (the
      dev bypass or `TEACHER_EMAIL`) unlocks every Set and Module Review; the static `locked/comingSoon` flag still hides
      unbuilt content for everyone. Scroll persisted to `localStorage['gc-scroll']` (replaced 2026-07-24). Pushed
      `41efa61`.
- [x] **Fret Zap** — games arcade, `fz*` in `coach.js` — pushed `c64ef08` (2026-07-11), browser-verified 2026-07-12.
      No mic: **no real-guitar retest needed**.

---

## Rationale behind the CLAUDE.md rules

The rules live in `CLAUDE.md`, `.claude/rules/` and the skills. This section
keeps only the reasons a future session needs so it does not "fix" a rule, and
a few rules stated nowhere else.

### Fast by default, with a Friday check (Jonathan, 2026-10-31)

Content and display changes break visibly and revert cleanly, so a weekly
review is a fair trade; changes that can wipe progress or strand Chromebooks on
an old cache stay always-Reviewed, because a Friday check would find them after
the damage. Unproven: if a Friday check finds a Fast change that hurt students
during the week, move that kind of change to always-Reviewed.

### Review triggers and the two reviewers (Jonathan, 2026-10-26)

Mechanical files (`CHANGELOG.md`, the `sw.js` version lines, the Spanish twin)
don't count toward "3+ files" because nearly every content push touches them,
so the trigger fired on one-line fixes. `site-reviewer` runs at high and
`site-reviewer-deep` at extra high because a review passed 36 minutes. Not yet
proved: every 2026-10-25 regression was found at extra high; if a high review
lets a real bug through, move that kind of change to the deep reviewer.

### Why the guidance is commands, not judgement (2026-10-25)

A medium-effort run does the obvious next step and trusts the tools; it does
not grep siblings or distrust a green run on its own. So the guidance is a
"Start here" checklist at the top of CLAUDE.md, gates that run something
(`checks.mjs`, `rule-zero-proof.mjs`, `smoke.mjs`), threshold triggers, and
rules files that load only with the files they govern. `smoke.mjs` exists
because `checks.mjs` reads source text and cannot click: 15 ▶ buttons were dead
for weeks with every check green. **`.gitignore` ignores everything under
`.claude/` except named folders: a new `.claude/<folder>` must be un-ignored
there, or it is never committed.**

### In-Class Activity directions are one line (Jonathan, 2026-11-10)
After looking at a launcher-style layout he likes: every direction inside an
activity is one short line — "students don't read them anyway". The decisions
(his, settled): In-Class Activities only (modules get their own work order
later); one line per step, no "You've got it when:" line, no fix-it line, no
list; keep the tap dots, built from the count in the one line; the default
view does not scale things up. **Reverses for activities:** "Multi-step
directions are lists" and "You've got it when: … after `</ol>`" (below, and
CLAUDE.md; still true for modules); "Preserve the author's words; never
rewrite the voice" (2026-07-25: he asked for this rewrite); "define each music
term at first use" (1w: a one-line direction uses the plain word); the
Learn / Practice rule's "exactly one You've got it when: line with one
recovery move" (2026-09-23); and a part card's Level up naming the card "once
it is posted" (2026-10-12). Asked after the first review (2026-11-10): the
practice cards' own directions line (`ca.card*Directions`, `ca.sheetDirections`,
shell strings the work order had kept out) is one line too; with Bass on, ca-35's
bass sentence follows it as a second sentence. Guards: 1cs (caps), 1bg (EN = ES counts, the
`wholeLine` opt-in executed). Every string before and after went to him as
`Claude outputs/one-line-directions-before-after.md` with the session report
(not committed).

### Multi-step directions get lists (Jonathan, 2026-07-25)

*"anything that has multiple steps should have bullet points."* Don't skip a
card because the actions "flow naturally": re-stitch it. The opposite failure
is real too: a two-item list whose second item is a technique reminder, or a
card that reads like assembly instructions, has gone too far. Preserve the
author's words; never rewrite the voice. "You've got it when" is not a bullet
because Jonathan chose a different visual treatment (2026-07-26, option B2:
thin green rule, italic) so it reads as a promise, not a step. Cards left in
prose on purpose: a single action, pure explanation, a bare "Watch: video"
line, a wrap-up reflection question.

### Challenge cards (Jonathan, 2026-07-26)

The first sweep's agents invented verbs the author never wrote, promoted
trailing tips into required steps, split concurrent actions into a sequential
`<ol>`, and grew existing lists; an adversarial pass caught 12. Budget one on
any comparable sweep.

### Paper drills get a digital deck (Jonathan, 2026-07-26)

Decks live in `DECKS` in `app.js` (not module data) so the Spanish comes from
`i18n.js`; ear pools in `EAR_POOLS` play through `playNote()`. Storage:
`games.dk['<deckId>']` plus a `games.dk.at` day stamp. Jonathan's design calls:

- **Self-report, not auto-grading**: the app cannot see whether the chord was
  played, and a 4-choice version turns recall into recognition (Fret Zap owns
  multiple choice).
- **Two-sided decks hide the back until tapped**, so "answer out loud before you
  check" survives.
- **"Put it back" re-deals the card 3 later**; only first-try hits score.
- **The ear sequence is never shown before the reveal**; replay is unlimited and
  unscored (an optional bonus).
- **No paper fallback line** on a card that gets a deck.

Slips in `levelUp` extensions and genuinely written tasks (TAB from memory,
spacing numbers on a staff) stayed on paper on purpose.

### Quiz answers are shuffled at render time (Jonathan, 2026-07-26)

Before the shuffle the keyed answer was never last 98% of the time. Why
`mcOrder()` is built as it is:

- **Deterministic, not `Math.random()`**: the list re-renders on tab switch,
  language toggle and after answering; a fresh order would move options under a
  student's finger.
- **Seeded on the ENGLISH prompt and choices**, so both languages show one order.
- **Same order for everyone**, so "look at the third one" works on the projector.
- **`MC_PINNED` is narrow on purpose**: catch-alls (`all/none/both/neither
  of…`, bare `None`) only. "All 6 strings" and "Both on E string" are real
  answers; pinning them would recreate the bug.

Because the order is render-time, `answer: 0` is fine on every new question.

### YouTube IDs and video choice

Modules 6–8 drafted from recall in May 2026 had ~60 dead URLs. oEmbed returns
JSON for a valid video and 404 otherwise; batch the checks. In cloud sessions
`WebFetch` reaches oEmbed where `curl` is blocked; `upload.wikimedia.org` and
`i.ytimg.com` refuse connections. Pre-existing URLs in Modules 1–5 are presumed
valid.

- **Watch-half pairs** (`stations.b`): video #2 from a *different* instructor
  than #1, same skill, unless the alternative is worse.
- **Prefer diverse creators** (audit 2026-07-10): before settling on Marty
  Music / JustinGuitar / Andy Guitar, spend one extra search on a comparable
  lesson from a woman, a creator of colour, or a Spanish-language channel.
  Already verified: Lauren Bateman, Nikhil D'Souza, guitarraviva, David Casas.
  Lesson quality still wins.

### Audio is fingerprinted but not precached

`CACHE_VERSION` covers every file in `audio/`, so a track re-exported under the
same name is cache-busted. Audio is deliberately **not** in `sw.js`'s `ASSETS`
precache list: that would download every jam track at install. A=440 and the
metronome-twin files: skill `audio-and-snippets`.

### Cloud handoff

Skill `session-handoff` (web pushes; Cowork ships a patch pair as one zip).

### Cloud-session working notes

- Clone read-only: `git clone --depth 1 https://github.com/jhoffmanteacher/guitar-class.git`.
  A stop-hook "unpushed commits" warning is expected in Cowork; on the web it
  means what it says.
- Playwright: `/home/claude/.npm-global/lib/node_modules/playwright`
  (CommonJS), browsers at `/opt/pw-browsers`. Serve with `python3 -m http.server`,
  then `devBypass()` → `onModuleChange(N)` → `switchTabById('<setId>','station-c')`.
  Station panels are `display:none` until `switchTabById` runs; element
  screenshots silently time out otherwise.
- Firebase can't load in the sandbox; the dev-bypass user can't write to
  Firestore, so `saveGames`/`saveProgress` are skipped under it.
- `MODULE_MANIFEST` has **13** entries; there is no flat songs hub; screens use
  `*-screen` ids, not `*-panel`.


## Moved from CLAUDE.md (2026-10-28)

Rules now in CLAUDE.md, a rules file or a skill are not repeated here.

### The Daily 5 is retired

Switch, what stays and why `tuning-warmup` stays hidden: CLAUDE.md and "(trim 2)"
below. Reason (2026-09-19): the class tunes and warms up together, and the
banner was 97px of a 657px screen. `WARMUP_BANK` in `config-main.js` is kept
though nothing on screen reads it (its other reader, `buildModuleRoutine()`, has
had no caller since `52ae05f`).

### Quiz answers — giveaway history and ratchets 1at/1au/1av/1w

The 1at / 1au / 1av / 1w write-ups live in their comments in `tools/checks.mjs`;
the watch-range and `STUDENT_VALUE_NAME_RE` rules are in CLAUDE.md. Two
videos once didn't teach what their card asked, which is where the watch-range
rule came from. **Allowlist entries in Modules 1–6 are carried deliberately:
when a module gets swept, delete its entries first and let the check say what is
left.** 1av's blind spot: a card that prints a whole lookup table ("Am fret 5 …
Dm fret 10") names the alternatives too; read those by eye.

### Sweep findings ratchet into checks.mjs

The rule is in CLAUDE.md ("Sweep ratchet") and `code-hygiene.md` item 7; label
hand-out in skill `site-sweep`. Reach for a whitelist over a blacklist whenever
the banned word has an innocent twin (1w2 pins the Journey lick labels
positively because "the reach", "the climb" are legitimate elsewhere on the same
pages).

### Modules 4 and 5 were swapped (2026-10-12)

The rule and the `d0cd004` proof are in CLAUDE.md; removing `swap45`: skill
`summer-reset`. What is only here:

- **One gap no client can close:** a tab that loaded the doc before the move and
  saves after it merges old-numbered maps into the marked doc. Repair by hand:
  re-scan the 3 docs the 2026-10-12 scan found with Module 4/5 work, and fix any
  old-numbered key that reappeared (an old id coming back, any `m5w4-*`, or
  `chords-m5`).
- **`moduleOpenThrough` is per module NUMBER**; the move didn't touch it. A
  student set to 4 before the swap now has Open Chords open, not Pentatonic: set them to 5 if Pentatonic should be
  open.
- The 1ao and 1az pins follow the content.
- **Course order lives in the module number**: reordering again means a
  renumber like this one. Notes dated before 2026-10-12 may use the old numbers.
- `rule-zero-proof.mjs` against the pre-swap `1a1f6cc` fails by design.

### Stop hook and git hooks

Skill `session-handoff` (example: `69ac805`, a `CACHE_VERSION` conflict); the "audio hash map" block: skill `audio-and-snippets`.

### Cloud sessions and patch handoff

Skill `session-handoff`.

### Stations B/C merge and Parts

The rules are in CLAUDE.md (Project) and "(trim 2)" below; parts in skill
`summer-reset`. Why the merge (2026-08-27): the room runs two groups, one with
the teacher and one on the site. Sections are addressed by `data-ns`, never
by DOM position. The tab-panel suffix `LESSON_TAB` is still the literal
`'station-b'` so old deep links resolve. A set is complete when the SET is:
the sets gate, checklist, Module Review, search and `resumeLessonCounts()`
never see a part, and 1af must stay green with no change to its expected
`data-ns` lists. In focus mode the B→C seam hides once the open
step is in Part 2: in `m4w2` it heads sections inside Part 1, and "don't head a
part you're not in" is the same rule the part marks follow.

### Real-browser smoke test

CLAUDE.md "Start here" item 3. Needs Node 22+ and Chrome (`--chrome <path>`). In a cloud
container running as root, Chrome needs `--no-sandbox`: point `--chrome` at a two-line
wrapper (`exec <chrome> --no-sandbox "$@"`), not at a change to the tool.

### Effort per task

CLAUDE.md "How to work with Jonathan" → **Effort**.


## Moved from CLAUDE.md (trim 2)

Cut on 2026-11-08 to the dated decisions, reasons and rules found only here; the verbatim 2026-10-28 copies are in `git show ab4aaae:WORKFLOW.md`.

### Project: what this is (old CLAUDE.md lines 61,97)

## Project: what this is
Asked for by Jonathan, 2026-11-08: "is everything necessary anymore?". The operative rule is in CLAUDE.md; "Moved from CLAUDE.md (2026-10-28)" points back here for the Stations B/C and Daily 5 text, kept in full below.

- **Stations B and C are merged in DISPLAY ONLY** (2026-08-27). A set renders as ONE step ladder (B's sections, a seam divider, then C's), but `stations.b` / `stations.c` and every progress key (`${w.id}-b-sec{gi}-{i}` / `-c-sec{gi}-{i}`) are unchanged — never "simplify" the data to match the display. **`gi` is the section's position after excluding only tuning-warmup sections (`storageSections()`); render-time hiding never renumbers it** (checks.mjs 1af; it must stay green with no change to its expected `data-ns` lists). Renderer: `buildLesson()`; tab-panel suffix `LESSON_TAB` (still `'station-b'`, so old deep links resolve); sections are addressed by `data-ns`, never by DOM position. No "Station B/C" wording in student text — the mid-set card is **Checkpoint / Punto de control**, the end one **Wrap-Up / Cierre** (1n). **Only `m4w2` is shown as Part 1 / Part 2** (`partOne`, `partBreak`; 1ao pins the count at 1); display only, no key moves, a set is complete when the SET is (the sets gate, checklist, Module Review, search and `resumeLessonCounts()` never see a part). In focus mode the B→C seam hides once the open step is in Part 2. Resolvers `lessonParts()` / `lessonGroups()`; field docs in the schema comment at the top of `module-2.js`.
- **Module 13** (String Changing) also has custom tab labels, and its checklist is the graded assessment.
- **No student tour:** `tour.html` + `tour-img/` were deleted 2026-08-27 (they taught the retired B/C model; every screenshot was stale). Jonathan is building a new one; don't restore the old file from git.
- **No in-panel tab bar:** `switchTabById()` drives `.tab-panel`; a set is exactly two panels (lesson ladder, checklist). The per-set Songs tab was removed 2026-08-27 (unreachable once the rail took over; the Songs hub lists the same songs, Module 1's included).
- **Chromebook 1366×657** (Jonathan, 2026-10-26: nobody uses the site on a phone): rule in CLAUDE.md. Don't spend time deleting the phone CSS; 1o also guards narrow Chromebook windows.
- **Live preview:** VS Code Live Server (right-click `index.html` → "Open with Live Server"); no commit needed. **Dev bypass:** a button on the auth wall loads a mock user; progress doesn't save to Firestore.
- **Shell:** match command syntax to the platform the session reports.

### Pre-push checks, hooks, parallel sessions
Rule: CLAUDE.md "Pre-push checks" and "Start here"; hooks: skill `session-handoff`. What CLAUDE.md doesn't say: the ~240-link check stays on full pushes even when no link changed (it catches videos taken down since). `CACHE_VERSION` is a content fingerprint of the cached shell and everything in `audio/`; since 2026-10-16 also `sw.js`'s own code (version lines blanked), since 2026-10-25 every file in `sw.js`'s `ASSETS` (font, PNG icons), and 1bt fails a push that leaves a precached file out. `--live`: run it a minute after pushing. Smoke test needs Node 22+ and Chrome (`--chrome <path>`). `pre-push` exists because git skips pre-commit on merge commits.

Parallel sessions live in `.claude/worktrees/*` (gitignored). Worktrees isolate files, not `origin`: on 2026-08-20 a worktree session pushed a merge of `main` straight onto `origin/main`. The lesson is *don't push a merge you didn't intend*, not *don't push to main*; a clean fast-forward (`git push origin HEAD:main`) is how worktree work ships.

Two new log entries no longer stop a push (Jonathan, 2026-11-10: he often runs a second session in its own worktree and "frequently" hits conflicts; "you tell me what is best for the changelog or workflow since claudecode does the work"). Every session adds an entry at the top of `CHANGELOG.md` and of "Recently shipped", so the second rebase always stopped on both files and step 8 sent it to Jonathan; the answer was always "keep both". Rule (CLAUDE.md step 8, skill `session-handoff` "Applying a patch"): when each side only ADDED lines at the same spot, keep both entries whole, the one being rebased on top; a changed or removed existing line still goes to Jonathan. `merge=union` in `.gitattributes` was tried in a scratch copy and rejected: it resolves silently but puts the later entry under the earlier, drops the blank line between changelog entries, and would keep both versions of a line two sessions edited in place with nothing to show it. No other file joins the list.

### Three regimes, ratchet, board, config writer
Rule: CLAUDE.md "Three regimes" and "Other standing rules". Dated decisions: the regimes date from 2026-09-20; `FROZEN_THROUGH` raised 2 → 3 on 2026-10-01 (Jonathan: "nobody is in Module 3 yet, but students are about to"); no renames in frozen modules because a rename would hide an insertion from the check; raise both numbers a module AHEAD because nobody tells Claude when the first student passes the gate. Since 2026-10-19 a keyed MC may be ADDED to a frozen step (it prints) and reworded via `response.renamedChoices` (the proof checks the map covers every old choice and keeps the keyed one keyed); since 2026-10-16 (Jonathan) a section title may be reworded in frozen modules too. A fix the regimes block is never worked around and never shipped as a rename that "prints rather than failing": it goes on the Summer reset list.

Why the module ABOUT to be entered counts as frozen: until 2026-10-01 a locked set's preview (`set-peek`) refused ticks but still SAVED ANSWERS (`onResponseChange`, `onStepMcSelect`, `onPracticeMcSelect` had no peek guard), so a few `responses` keys may exist in the module above the class. It unlocked nothing (`hasProgressIn()` reads guarded data). `isPeekedResponseKey()` closed it; 1bl pins the guard.

Ratchet extras (CLAUDE.md has the rule; hand-out command in skill `site-sweep`): never leave a detector script in a session scratchpad, it goes into `checks.mjs` the same session; prefer a whitelist over a blacklist when the banned word has an innocent twin; pin meaningful totals. Board: live for students = assigned + dated-and-arrived + not Hidden + not archived/deleted (`caIsVisible`); `number` in `class-activities.js` is legacy (1d, 1l; skill `in-class-activities`). `config/class`: 1ai pins the writer count `CONFIG_WRITERS` (`.claude/rules/teacher-console.md`). `MODULE_MANIFEST` drift fails `checks.mjs`.

## i18n — hand-written Spanish everywhere

Rule: CLAUDE.md "i18n". Google Translate is gone; `setLang()` drives four layers: the shell (`i18n.js` via `t()` / `data-i18n`), module content (`_es` via `tf()`), the games arcade + Listening Coach (`t()` at render time), the Song Journey pages (`data-es`, swapped by `journey.js`).

- Never "translate later": Jonathan doesn't speak Spanish, so nothing catches it afterward.
- The solfège rule is not enforced by any check; a 2026-07-31 sweep fixed the last 2 `module-9.js` violations. Check it whenever you touch module Spanish.
- Proofread sweeps retired: the 2026-07-23 sweep found essentially no meaning errors in ~4,300 strings. Sweep only when Jonathan asks or a string is flagged. No review sheet; don't recreate one.
- Glossary, loanword policy and settled ES terms: `claude/spanish-terminology.md` in the Claude project.

## Content rules

Rule: CLAUDE.md "Content rules". Dates, reasons and the parts stated only here:

- **Wording (1w):** 1w catches only retired phrases, not a new idiom. Site terms like "two homes" (Modules 5/7/11) and the metronome ladder's "top of the ladder" are teaching devices; don't flag them.
- **No teacher speak (1w-t):** from the 2026-09-23 jargon-cut work order (433 findings).
- **Typed answers (1ar):** Modules 3–6 went from 82 typed answers to 8 on 2026-09-20. 1ar pins a per-module budget and fails only UPWARD: removing one is always fine; adding one is a decision made in the same edit. 41 of the 82 were already unreachable, so count what `visibleSteps()` renders, not raw `response:{type:'short'}`.
- **Lists:** applies to step `text:` and practice `prompt`s; short lead-in before the list. Leave alone: single actions, hints, `gotItWhen` strings, placeholders (except Challenge cards, whose body is always a list). The renderer wraps "You've got it when" in `<span class="got-it">`.
- **Challenge cards:** the `label` title is verbatim, escaped plain text. "(assessment preparation)" since 2026-09-23 (was "(your assessment piece)").
- **Presentation at render time:** reach for the renderer first when a change is about how something looks or is ordered.
- **Strings named (Jonathan, 2026-08-06; 1j):** chord shorthand like `xx4432` is notation and stays; the only digits left are Module 7's two root-naming MCs, each anchored "string 6 (the low E)".
- **Paper drills:** no paper-fallback line. `notecall` (2026-09-27, ca-23) is not a paper drill: a note name on the beat, played on the guitar. It opens in "Show answer" (a play-along: the fret lights 2 beats after the name, speeds up every 8 notes, Slower / Faster step it, nothing scored); turned off, five scored levels answered by the mic ("Play it on the guitar", off by default) or by tapping the fret (`drill: { type:'notecall', strings:['lowE','A'], minFret:5, maxFret:8 }`; engine `renderNoteCall` in `app.js`, progress `games.nc`, `gamesStopMic()` stops it). Wiring a deck is content: `drill: { type:'deck', deck:'numerals-C', skill:'m11w1-s3' }`.

### Quiz answers and keyed MCs
Rule: CLAUDE.md "Keyed MCs". Called "graded MC" before 2026-10-26 (old notes and comments may say that); nothing on the site is graded, the graded quizzes are on Canvas. Fewer than 3 choices are not shuffled; write `answer: 0` freely (students never see it that way). History: m11w2-s3's explain was right only by luck after a 2026-09-05 reword; the 2026-09-05 m8w1 reword was safe only because the furthest student was in Module 1. `FROZEN_MC_THROUGH_MODULE` (2026-09-19; 2 then, 3 since 2026-10-01, Jonathan) fingerprints `choices` + `choices_es` + `answer`, and 1ap also fails when a keyed MC goes missing. Don't lower it: a module the class has passed keeps its stored answers forever. To raise it, ask Jonathan which module the class is in. The 1at / 1au / 1av ratchets and the 1w field-reader fix are documented in their comments in `tools/checks.mjs`; the Modules 1–6 allowlist note is under "Moved from CLAUDE.md (2026-10-28)". Frozen mid-year fixes (Module 1 Set 2's three keyed-MC rewords, Module 3 Set 2's Challenge numbers, `ca-14`'s Happy Birthday exit check): skill `summer-reset`.

## Play-along first; Song Journey pages are the back door (2026-10-06)
Rule: CLAUDE.md "Play-along first" (1bn) and skill `in-class-activities` (same heading; door table, layer matching). Journey pages also get no Stuck?/Level up folds, and a page's text is not synced to a card.

### ⚠️ Editing `firestore.rules` changes nothing until it's pasted into Firebase
Console paste (CLAUDE.md). Until it is pasted, the live quiz's answer writes are rejected and the game looks broken with no error students see.

### ⚠️ The Daily 5 is retired — switched off, not deleted
Jonathan, 2026-09-19. The "Tune and warm up first" banner at the top of every ladder was the **only** entry point to the Daily 5 overlay, so turning the banner off retires the Daily 5. `const DAILY5_ENABLED = false;` in `app.js`, beside `buildDaily5()`, is the whole switch; `ladderHtml()` is its one reader. **Nothing was deleted**: `buildDaily5()`, `openDaily5Here()`, `moduleStepsFlat()`, the `.daily5-*` CSS (including `.dp.focus.pd-showing .daily5-inline`) and every `daily5.*` i18n key stay, so flipping the constant to `true` brings the banner back as it was. Not part of the switch: `WARMUP_BANK` (see "Moved from CLAUDE.md (2026-10-28)") and `kind:'tuning-warmup'` sections, which stay hidden exactly as before because `storageSections()` depends on that and every `gi` in Firestore was written under it. The one student-facing mention (`module-13.js`, "one lap of the Daily 5") was reworded in the same push to "a few bars of anything you know".

## How to work with Jonathan

Rule: CLAUDE.md "How to work with Jonathan". Dated decisions and what only this file holds:

- AskUserQuestion: one question per turn unless truly independent.
- Pushing to `main` is not a pause point (Jonathan, 2026-08-28): never offer "push the branch instead" as a coin flip.
- Sweeps: lead every sweep prompt with the calibration line ("convert EVERY card; do NOT skip one because the actions flow naturally — re-stitch it"), or agents go timid. Sonnet for mechanical work, the big model for design and verification. Every review round of the 2026-10-25 sweep found regressions the fixers' own proofs missed. Playbook: skill `site-sweep`.
- Triggers hold at any effort level. Mechanical files don't count toward the 3 (Jonathan, 2026-10-26); the `sw.js` version rewrite doesn't make `sw.js` a danger-zone edit, a change to its code does. Pin-only `checks.mjs` edits too (Jonathan, 2026-10-27, after a play-along edit sat behind a 30-minute deep review); the checks are the gate for them, and none of this makes `checks.mjs` a deep-review file. Which reviewer: 2026-10-26.
- Fast by default (2026-10-31) replaced the 2026-10-27 "Fast or Reviewed" question, which replaced the 2026-10-26 "quick change" keyword. Always-Reviewed changes are the ones that can lose student progress or break the live site, where a week's wait means the damage is done. Friday check: always-Reviewed fixes get `site-reviewer-deep` rounds and merge on their own (2026-11-07, Jonathan: reviews happen on their own); skill `friday-check`.
- Effort tiers: CLAUDE.md "Effort".

## Power Chord Switch: where we stopped (moved here from NEXT-STEPS-power-chord-switch.md, 2026-11-05)

Moved from its own file on 2026-11-05 (original title "Power Chord Switch — where we stopped (2026-11-03)"). The Stopped-game rules (rounds 1–6, the silent Stop of 2026-11-08, R4-2) are in Open work → "Stopped-game headline".

**Status.** The branch `pcs-pending-smoke` was merged into `main` on 2026-11-03 (merge commit ca932f2; smoke clean against the origin/main baseline, full checks passed); Jonathan published `firestore.rules` (take id `(coach|nr|pw)`). The branch can be deleted on GitHub. Same day, e5e0bef: a Stopped game with at least 10 s of audio is saved too, with `complete:false` (2026-11-07: 10 s of PLAY after the first count-in ends); a shorter Stop, or leaving the screen, drops it. The room-noise call is decided (a stricter strum ratio for Power Chord Switch only: "Decision (2026-11-07)", then "Decision (2026-11-05)"). Settled, not to be re-raised: "Later (not chosen yet)".

### What shipped in this push

1. **Song switches** (`CC_POWER_PROGRESSIONS`, group `song`), one per switch in the song's card: Sweet Child O' Mine 10 (ca-33), "the cure" 6 (ca-30). Each is a ladder: 3 rounds of 4 back-and-forths (8 chords), a 4-click count-in before each round (2 clicks below 60 BPM since 2026-11-09). Rounds were 15 BPM apart (60 / 75 / 90); since 2026-11-05 5 BPM (30 / 35 / 40 from the new 30 BPM start; Jonathan: "don't increase it so quickly"). Jonathan: "practice the actual chord switches in the songs by going back and forth between each change 4 times at slower to faster tempos."
2. **BPM buttons on the play screen** (−5 / +5, under the beat dots) move the rounds still to come; off in round 3.
3. **Choices layout:** five columns, the fifth (Songs) one button per song, which opens the songs view (all 16 beside the pairs was 881px tall).
4. **Saved student audio** (`micRecStart('pw')`): the Listening Coach's consent flow and red "Recording this take" label; saved when played to the end or Stopped after 10 s of play (`MICREC_MIN_STOPPED_SEC`, 2026-11-04; audio length until 2026-11-07; a stub never overwrites a full take); never for Change Up. One capture covers all three rounds, cut at the 30-second cap. Jonathan said **no on/off button**. The small "Stop saving my takes" link stays; remove it from these screens only if Jonathan says so.
5. **Clearer feedback** (Jonathan: "I didn't see the power chord switch giving clear feedback about misses and correct notes", "make the in game feedback bigger"): done-screen chips have a symbol (✓ right, ✗ on time but wrong chord, – no strum heard) and a line counts them; on the play screen a big line after every graded change ("✓ C5 — right" green, "✗ C5 — wrong chord" amber, "– C5 — no strum heard" red; `ccShowLast`, `.cc-last`; the row is always drawn).

Check **1ck** was rewritten for all of it; `tools/smoke.mjs` walks all 16 switches.

### Done in the Firebase console

`firestore.rules` with the `-pw` take id: published by Jonathan (2026-11-03). Worth one look: teacher console → Mic recordings lists a Power Chord Switch take once a consenting student finishes a game (or stops after 10 s); mic collection must be on there.

### Tempo controls (Jonathan, 2026-11-05: "bpm more controllable by user ... prior to starting and during it")

Power Chord Switch only; Change Up keeps −5 / +5, no slider, no live tempo. Range 10..140 (floor lowered from 30 on 2026-11-05, Jonathan; it still OPENS on 30; he considered 80 for the top and kept 140); the console's `BPM_MIN` in `micEvalTakePw` uses the same 10..140.
- **Setup:** −5 · tempo · +5 and a slider in steps of 5 (`ccSetBpm`). No ±1 button anywhere (Jonathan dropped them: "just by 5s is fine"; 1ca fails if one returns). The group must stay no wider than the old row (Spanish leaves about 6px; a wrapped row made the setup 732px). "Best today" sits under the speed buttons (`.cc-best-line`, always drawn).
- **Play** (`ccLiveBpm`): −5 · tempo · +5 under the charts. The grid is re-anchored (`cc.listenStart`, gridOffset held) so the current beat does not move; changes still to come get a new `t` and `bpm`, graded ones keep theirs. A song switch's later rounds move by the same amount; the current round stops where round 3 would pass 140 (a base of 130 cannot be sped up); `ccNudgeNext` moves only later rounds; shorter charts (`.cc-ladder-play`).
- **Scoring:** a round counts at its LOWEST tempo (`cc.roundLow`, `ccRoundBpm`) in `stageLog`, `ccScoreBpm` and the done screen's "Again". A pair's "Again" starts there; a song switch's from round 1's counted tempo (`stageLog[0].bpm`). A pair remembers the live tempo for the next setup.
- **Saved takes:** `bpm` / `stageBpms` = each round's START tempo; `tempoChanges` lists live changes; changes of a retimed round carry `retimed: true`. `micEvalTakePw` leaves those rounds out, counted in `notes.retimed` (not `ignored`, which means impossible data). No `firestore.rules` change; the BPM column shows the start tempo.
- **Proofs:** 1ca runs the setup and the live change on a stubbed clock (32 assertions, pinned); 16 mutations run against it (2026-11-05, commit message). 1cl has crafted retimed takes. `smoke.mjs` clicks them all (EN + ES, 1366×657, all 16 song switches). A stale smoke assertion (80 / 95) now expects the 5 BPM step (70 / 75).
- **Open, not decided (reviewer, 2026-11-05):** a pair started at 30, sped to 90 and played well offers "Again at 35" while the setup reopens on 90; `ccRoundBpm` is the one place to change if the student's own tempo should count. If gridOffset is a constant mic lag, a very large one-burst change (30 to 140) can cost a change; one ±5 tap costs under 12 ms.
- **Choice columns (Jonathan, 2026-11-05):** the computer's pick, Songs, then low E / A string / jump (`CC_POWER_GROUPS`, display only; `CC_POWER_PROGRESSIONS` keeps songs at its END so remembered picks hold). 1ca pins it, EN + ES.
- **One way back (Jonathan, 2026-11-05: "consistent and at the top and more obvious"):** `pwBackBtnHtml`, one bold 44px `.cc-back-btn` "◀ Pick different chords" (`games.pw.pickDifferent`), first on the done screen and atop the songs view's left column (replacing `.cc-change-loop` and the "Chord pairs" pill). The pairs view has none, so speed and tempo sit 52px lower on the songs view. 1ca runs it (16 screens, EN + ES).

### Next steps (rewritten 2026-11-05; the list Jonathan chose on 2026-11-04 is done)

This list is the plan (the separate plan file was deleted 2026-11-04 at Jonathan's request).

1. **Saved takes arrive: DONE** (2026-11-04: 25 takes, 12 Power Chord Switch). If a class shows none, check in order: the rules paste (`micTakes` and `chunks` say `(coach|nr|pw)`), mic collection on in the console, the student's consent (once per device).
2. **The evaluator: DONE.** `micEvalTakePw` (teacher.js, check 1cl), built 2026-11-04, proven on `tools/mic-sim/fake-pw-take.mjs`, run on the 12 real takes. Per round: strums the game missed, "right" changes with no strum, mic delay from the count-ins (about -73 ms on Chromebook internal mics).
3. **DECIDED 2026-11-05 (finding: room noise scored a right chord): a stricter strum ratio for Power Chord Switch only** (2.2 / 2.67 from 2026-11-05, 1.8 / 2.19 from 2026-11-07). Not chosen: "no readable pitch, no tick". To do: look at the next takes ("Where things stand" → to watch). Any further change to how a strum is heard is `coach.js` detection: xhigh, Always Reviewed, run `tools/mic-sim/power-switch.mjs` first.
4. **Nothing else is waiting** (see "Later (not chosen yet)").

### Practice-minutes heartbeat removal (not Power Chord Switch): DONE 2026-11-05

Full history: `git show ab4aaae:WORKFLOW.md`, "PICK UP HERE" in Recently shipped → the 2026-11-01 Practice minutes entry. "N playing" is gone and no `heartbeats/{sessionId}` record is written.
- **Code (live 2026-11-04):** writer, `pollLive()`, `S.live` / `S.liveAt`, `liveMinCount` gone from `practice-minutes.js`; counting, `flush()`, queue and keepalive unchanged (`5144c6c` + review fixes).
- **Repo (2026-11-05):** the `heartbeats` rules block, its `firestore.indexes.json` index and its `tools/pm-rules-test.mjs` section are gone; 1cg requires them to stay gone, exactly one `match /databases/{database}/documents` wrapper, and no shipped file naming a `heartbeats` collection. Reviewed same day (`site-reviewer-deep`).
- **Console (2026-11-05):** Jonathan published the rules; the emulator test passed (49 passed, 0 failed; 179 cases in the file); the old `heartbeats` and `minutesBoard` collections were deleted.
- **Optional, Jonathan's to delete by hand or leave:** the console's `heartbeats` composite index (Indexes tab, the only index: `period`, `lastSeen`, `__name__`; nothing queries it). A session's delete was blocked on 2026-11-05 as an irreversible deletion nobody had named.

### Open finding (Jonathan, 2026-11-04): room noise scores a right chord

**Decided 2026-11-05, changed 2026-11-07** (the two Decision sections below). History: Jonathan played with no guitar and the game showed "right". Cause (`ccLoop`, `ccResolvePend`): any loudness jump above a very low floor (`CHK_ONSET_FLOOR` 0.003, HF 0.0008) is a strum; at 60 BPM every beat each change's window is ±500 ms; with fewer than 3 pitch readings a change counts on timing alone (`ok`), lenient on purpose because a real low-E strum also gives under 3. The count-in beeps are not the cause. Jonathan chose to MEASURE first. Collection needs a real non-teacher account (teacher and dev bypass never record) and the console's "stop after" number above the count (23 of 40 on 2026-11-04; Coach and Note Runner takes count too).

#### First real-take results (2026-11-04, "Evaluate all recordings": 25 takes, 12 of them Power Chord Switch)

- **9 takes:** site and audio agree; 14 false hits in 141 changes; offset steady at about -73 ms.
- **3 noisy takes (T01, T10, T12) hold 38 of the 52 false hits:** the site heard a strum at almost every change; the recording has 5-8 strum attacks in 21-30 s. A few rooms (or mics), not every take.
- **Strum what-if** (from Jonathan's `mic-eval-2026-11-05.json`; 186 changes, 52 false hits, 132 real strums; the replay at 1.4 / 1.7 matches the site on 183 of 186). False hits removed / real strums lost: **1.8 / 2.19: 14 / 1; 2.2 / 2.67: 30 / 4; 2.6 / 3.16: 38 / 9.** The noisy takes lose 26 false hits and 0 real strums at 2.2, 30 and 1 at 2.6. Lost real strums: at 2.2 in T06 (1), T08 (1), T11 (2); at 2.6 also T03, T04, T09. "Lost" = the game would grade that change a miss. Zip: `mic-recordings-2026-11-05.zip` in Jonathan's Downloads (12 Power Chord Switch, no pitch readings).
- **A higher absolute onset floor is ruled out:** 48 of 52 false hits AND 55 of 132 real strums are under 15 dB above the room floor.
- **"No readable pitch, no tick"** can touch only the 34 false hits graded right; the other 18 were graded wrong (already 3+ readings).
- **Why ratios:** `ccLoop` fires on a ~3 dB jump (full band x1.4 or HF x1.7); the evaluator's `micEvalSignal` (HF > 2.2x base and > 4x the HF floor) found the real strums in the 9 good takes and almost none in the 3 noisy ones: room noise jumps the full band, not the pick-attack channel.
- **Coach / Note Runner fix, same push:** 42 of 64 Note Runner notes sat past the 30 s cap and were measured as silence (median -141.6 dB); a note whose window runs past the audio is now `dropped` (`notes.dropped`), as for Power Chord Switch.

#### The strum what-if (built 2026-11-04; MEASUREMENT ONLY, how the game grades is unchanged)

`micEvalTakePw` → `whatIf`: a table under Evaluate-all, `strumWhatIf` in "Download results" (take labels only, no names, no uids), and `node tools/mic-sim/eval-takes.mjs <folder>`. It replays the site's strum rule at the shared ratios (1.4 / 1.7) and stricter ones (1.8 / 2.2 / 2.6; HF 2.19 / 2.67 / 3.16). Takes graded with Power Chord Switch's own ratios are left out. The constants and the text of `ccLoop`, `coachReadFrame`, `coachSmooth` are read from `coach.js` at run time; if that shape changes the what-if is `null` and 1cl turns red. Columns: **false hits removed**, **real strums lost**, **reproduced** (the shared-ratio column is the replay's error bar). Pick the ratio where "removed" is large and "lost" small.

Assumes: a steady frame every `frameMeanMs` (clamped 16.7-150 ms); 24 kHz takes vs the analyser's 48 kHz (window scaled, absolute HF floor not); smoothing through the whole take (the site resets each round); no `srcSampleRate` read as 48000. Proof: `fake-pw-take.mjs` `pw-room-noise` (no strums; bursts 1.6 / 2.0 / 2.38 / 3.0 x the room; 11 false hits; stricter ratios must remove 3 / 5 / 8) and `pw-soft-strums` (15 real soft strums; must lose 0 / 5 / 10); 1cl compares all of it and was broken 14 ways. It does not say whether the strum was the right chord.

#### Pitch readings in the saved take (added 2026-11-05)

Each `expected` entry of a take has `readings` (meaning in the take's `changeReadings`; `ccResolvePend` keeps them, `ccRecMeta` saves them, midi, 2 places): `null` = no strum heard (`miss`); `[]` = strum, no pitch (`ok` on timing); a list = the readings used (3+ needed for `ok` / `off`). **The "Pitch-rule what-if" table** (built 2026-11-05; console, `eval-takes.mjs`, `pitchRule` in both downloads) counts per take: graded right; 3+ readings vs timing alone; false hits and real strums; "−N · lost M". Takes before 2026-11-05 have no `readings` key and are counted out, never read as `null` or as zero readings. No rules change. Grading untouched: same verdict on 20,000 of 20,000 random changes. 1ck reads the saved take back (21 of 21; six breaks red). 1cl: 5 synthetic takes with planted readings, 13 without; 64 graded right, 39 on timing alone, all four outputs agree (ten breaks red). Planted numbers say nothing about real students.

#### Decision (2026-11-07): Power Chord Switch strum ratio 2.2 / 2.67 -> 1.8 / 2.19

Jonathan, from "Evaluate all recordings" on 34 takes on 2026-11-07 (zip: `~/Documents/mic-recordings-2026-11-07.zip`):

- **At 2.2 / 2.67 (14 takes):** false hits 12 of 97 (27% at 1.4), but **6 of 75 real strums were missed**; 5 of the 6 at 35-40 BPM, normal loudness, 175-300 ms early (probably the previous chord still ringing).
- **What-if on the 7 takes graded at 1.4 / 1.7** (re-run with `eval-takes.mjs`, same numbers): 1.8 / 2.19 removes **11 of 31** false hits and loses **0 of 81** real strums; 2.2 / 2.67 removes 21, loses 3; 2.6 / 3.16 removes 26, loses 6. For students who were playing, both leave the same 4 false hits.
- **"No readable pitch, no tick" (`pitchRule`):** removes 2 of 12 false hits, loses 10 of 46 real rights. **Rejected: do not build it.**
- **Change:** `CC_POWER_ONSET_RATIO` 2.2 -> **1.8**, `CC_POWER_HF_RATIO` 2.67 -> **2.19** in `coach.js` (Change Up and every other loop keep 1.4 / 1.7). 1ck's `R.pw` pin line re-pinned (2.2/2.67, 1.4/1.7 and one-number-wrong each turn it red). Check 2d (inside 1cl) proves the console treats a take graded at 1.8 / 2.19 or 2.2 / 2.67 as graded with other ratios. `power-switch.mjs` output is byte-identical on std, mid and weak (it does not measure the ratio); 1ck and the real-take replay do.
- **Takes:** after this version reaches a browser, 1.8 / 2.19; from 2026-11-05 until then 2.2 / 2.67; older 1.4 / 1.7. The strum what-if skips the first two and says how many.
- **Roll back:** the two constants back to 2.2 / 2.67 and re-pin 1ck's `R.pw` line.
- **Limit (deep review):** no replay measures what 1.8 does to the 6 missed strums (replayed in a scratch copy, all 6 still fire at 2.2; the replay matches the site on only 85 of 97 changes there, 111 of 113 on the 1.4 takes). The case for 1.8 rests on the 7 takes at 1.4; the next takes are the real test. One of the five slow misses clips 14.9% of its samples.
- **Watch next:** "Played, not counted" (`detector-missed`) should fall at 35-40 BPM; false hits rise a little in noisy rooms. Not tested on a thumb or finger strum.

#### Decision (2026-11-05): Power Chord Switch strums need ratio 2.2 / 2.67

Jonathan's pick from the what-if on the 12 real takes (numbers under "First real-take results"): the knee is 2.2 (1.8 → 2.2 buys 5 false hits per real strum lost, 2.2 → 2.6 only 1.6). Of the 30 removed, one the replay already drops at 1.4 (29 net); 22 of the 52 still fire at 2.2 (T12 keeps 6 of 12, T01 3 of 13). `coach.js`'s line "marking a correct change wrong is the worse error in a room" is why the choice was Jonathan's: a few soft strums traded for honest feedback in noisy rooms.

- **Chosen with the risk in front of him.** The reviewer found the 12 takes don't cover thumb or finger strummers, fast every-beat pairs or slow-frame Chromebooks, and offered 1.8 / 2.19 or waiting for a thumb take; he said push 2.2. **His first step:** strum a thumb or finger take on a test student account (60 and 120 BPM, every beat), "Evaluate all recordings", read "Played, not counted" (`detector-missed`); roll back if bad.
- **The game:** `CC_POWER_ONSET_RATIO` / `CC_POWER_HF_RATIO` (HF = 1.7 x ratio / 1.4) sit beside the shared `CHK_ONSET_RATIO` / `CHK_HF_RATIO`; `ccLoop` picks them with `ccIsPower()`. Change Up (same loop), Listening Coach, Note Runner, Note Call and the rest keep `CHK_*`. The condition must stay on those four lines and free of comments: the console reads it as text.
- **A take records** `fields.onsetRatio` / `fields.hfRatio` (`ccRecMeta`); none before 2026-11-05 = shared ratios.
- **The console:** `micEvalStrumRule` compiles ccLoop's condition with `onsetRatio` / `hfRatio` (or `CHK_*` for older text); a take graded at other ratios is left out of the what-if (`row.whatIfSkipped`, `row.strumRatio`) and counted; the rest is unchanged. Ratios outside 1..10 or half missing are never trusted. **Not built:** a what-if from a stricter base (e.g. 2.6 / 3.16); add it if the next takes make it worth deciding.
- **Limit of the proof:** a firm pick strum in a quiet room grades as before (`power-switch.mjs` identical; ratios forced to 60 collapse only the Power Chord Switch gate), but its strum has a pick-scrape about 3x the note level. `tools/mic-sim/onset-probe.mjs` (real `coachReadFrame` / `coachSmooth`, a strum over the previous chord ringing, 12 trials, synthetic, so RELATIVE): at 60 BPM, equal loudness, no scrape, shared ratios hear 12 of 12 and 2.2 / 2.67 hear 0 (90 BPM: 6 to 10 vs 0); at 140 BPM with a weak scrape 12 vs 9 on 16.7 ms frames, 12 vs 3 on 50 ms frames. Share of what the shared ratios hear: 2.2 / 2.67 13%, 2.0 / 2.43 15%, 1.8 / 2.19 37% (2.0 not replayed). So soft strums and ones without a pick attack (thumb, finger) can be missed; the real takes put it at 4 of 132.
- **"Strum a little firmer" (2026-11-05, Jonathan asked):** on the done screen, when at least two changes show "no strum heard", they outnumber "chord sounded wrong", and under 85% right: advice `games.pw.advice.firmer`, headline `games.cc.verdict.ok` ("N of M changes worked") instead of "this speed is too fast for now", big button "Again" at the same speed instead of "-5 BPM". A Stop leaves out of "no strum heard" the unreached changes and the misses after the last heard strum due in the last 4 s before the Stop; also after the last change was swept (a Stop is never a natural end) and across a song switch's rounds, where the count-in before the next round's play screen is not counted (the click can only land there) (`cc.unreached`, `CC_STOP_REACH_MS`; 2026-11-07, review round 2: at 60 BPM a 3 s reach to Stop is 3 changes). One line at 1366x657 in both languages. One miss alone, a tie, mostly wrong chords, 85% and better, and Change Up keep what they had. Decided once (`firmer` in `ccRenderDone`). 1ck renders ten situations in both languages (20 renders); twelve breaks red.
- **Checks:** 1ck runs the real `ccLoop` just below and above every threshold in both games (165 runs) and pins the ratio lines by text; 1cl proves takes at other ratios are left out and counted everywhere (`strumWhatIfSkipped`; 14 cases). 15 breaks, plus 8 after the review found the first check blind, each turned a check red.
- **Roll back to the shared ratios:** both `CC_POWER_*` to 1.4 / 1.7 and the 1ck pin line; nothing else changes.
- **Student-facing:** `CHANGELOG.md` ("noise in the room counts less"); no string changed (the setup tip already says quiet room, guitar close to the mic).

### Later (not chosen yet)

- **Settled by Jonathan, 2026-11-04 (not to be re-raised):**
  - **The 30 s take cap is fine.** At 60 BPM every beat the audio ends about 6 s into round 3; at 40 BPM in round 2; "every 2 beats" in round 2; "every bar" in round 1. `expected` keeps all 21 changes; the evaluator counts those past `durationSec` as `dropped`. Do not raise the cap.
  - **Power Chord Switch passed a real mic check** (Jonathan, his own guitar).
  - **Do not unify the three wordings** for "on time but the chord sounded wrong" (verdict "messy", count line "chord sounded wrong", big line "wrong chord").
  - Watching the big feedback line in a real class was skipped on purpose.
  - **No real mic check for Note Runner** (Jonathan: not needed).
- **Spanish for the new strings** was written in the same edit, no review sheet; if a student reports odd wording, look at `games.pw.ladder.*`, `games.pw.songSub`, `games.cc.breakdown` in `i18n.js`.

### Review status

Reviewed the same day by `site-reviewer-deep` (`firestore.rules` and the mic game loop); no `Review: Fast` trailer. Old-vs-new grading through the real `ccLoop`: pairs 792/792, ladder rounds 2304/2304, 221 random Stops, 200 leave-the-screen moments, 2283 BPM presses, no break. Fixed in the same push: the play screen now fits 657px in Spanish and with the red label (big line and BPM buttons under the charts, fixed chip symbol box; smoke walks it); 1ck now sees the recording behaviour (all 12 mutations red, the reviewer's 10 + 2); a ladder base of 115 BPM or more now starts round 1 at most at 110 (110 / 125 / 140); over-claiming comments and changelog corrected; asking consent from the done screen keeps the replay. Left as is: the three wordings; a missed chip is faded grey while its big line is red; a remembered pick of the old "the cure" walk opens Sweet Child's first switch (session only).
