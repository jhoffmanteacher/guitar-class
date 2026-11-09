## Where things stand (updated 2026-11-09)

Start here. Update this block whenever an item opens or closes; each line says where the detail is.

**Shipped since 2026-11-07 (live as of `ab4aaae`)**
- **Stopped game, review rounds 3-6** (Power Chord Switch and Change Up; `4582bda`, `a8d2e55`, `df20fd1`, `3625df5`,
  `9c8d1bc`; CHANGELOG 2026-11-08 and 2026-11-09): the Stop click is not graded; a Stop after changes fell due reads one of
  three headlines; a Stop in a game where nothing was heard is neutral (Jonathan, 2026-11-09). Rules and known gaps:
  Open work → "Stopped-game headline".
- **Tuning Simulator:** green only when the string is done, keyboard on Tighten/Loosen, Module 1 note circle goes up
  counterclockwise and says "3+ steps" (CHANGELOG 2026-11-08); guards in check 1cp (21 pins) and a smoke walk; a
  **"Start over"** button that clears the saved level (Jonathan, 2026-11-09; `3625df5`). Peg: counterclockwise tightens
  (Jonathan, 2026-11-07, `bf7c927`); it has flipped three times, so ask him to check a real guitar before changing it.
- **Teacher console Layout A** (`4950e86`, `fff71ec`, `6e64a62`; review round 1 `c562e7d`; rounds 2-3 `79c48a9`..`b04f201`)
  and the **units tree** (`890eae7`, Fast): "Recently shipped" → 2026-11-08 and 2026-11-09 entries.
- **Docs tightening (2026-11-08):** CLAUDE.md, every skill and every `.claude/rules` file cut or split into lists
  (`337437b`..`ab4aaae`).

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

**Finished (don't redo):** the practice-minutes heartbeat removal (2026-11-05; the old `minutesBoard` collection deleted
too; the class rank and Top 5 are keyed by a private tag, so no uid sits next to minutes). `tools/pm-rules-test.mjs`: 191
emulator cases since 2026-11-06 (179 before); needs Java 21 (on Jonathan's Mac at `~/tools/java`, not on PATH; recipe in
the file's header); one leniency pinned, not fixed: a chunk with no `i` field is accepted.

**Settled, don't re-raise:** the 30 s take cap, the real-guitar mic check, the three "chord sounded wrong" wordings, no
Note Runner mic check ("Later (not chosen yet)"); room noise after a change counts as a try in the Stopped-game rule
(Jonathan, 2026-11-07); Module 1's "3+ steps" vs the Tuning Simulator's 4-5 step levels: leave both (Jonathan, 2026-11-09).

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
    - **Silent Stop (R5-2, Jonathan, 2026-11-09):** `cc.silentStop = !ended && cc.noStrum`, no change graded
      (`ok === 0 && off === 0`) → "No strum was heard before you stopped." even past the 4 s window (it read "too fast"
      in 4-16 of 64-116 simulated Power Chord Switch Stops, 32-108 in Change Up). Power Chord Switch keeps "strum a
      little firmer" for two or more unheard changes. Not covered: a silent game run to the END (Change Up still says
      "too fast" for a dead mic).
    - **Room noise counts as a try** (Jonathan, 2026-11-07, `f47a730`): any sound after a change fell due means "tried
      it". With one noise onset a second, the clean screen survives in 72-76 of 96 games (89-93 without the rule);
      without it a student who strums late and gives up reads "4 of 4 worked".
    - **Known, left alone:** a Stop within about 300 ms of the final strum's arrival counts that strum as the click
      (R4-2: loses XP, "complete" and best in 120 of 420 simulated Stops at 150 and 250 ms; the alternative credits a click
      as a played change, 56 of 56). A song switch whose round 1 was silent, Stopped within about 0.2 s of round 2 at
      130 BPM, reads the neutral screen (R2-3). The done screen at 1366x657 was reasoned, not measured (+20 px if the
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
  - [x] **Top-tempo advice** (`0b5c611`, `82fb6fa`, `95afba0`, 2026-11-07): "The tempo cannot go higher. Play it again."
    (`games.pw.advice.top`). Not changed (product call): a pair sped up live past its counted tempo still says "Level
    up". Same shape, not fixed (not asked for): Change Up says "try it 10 BPM faster" at 140, and both games say "Drop 5
    BPM" (Change Up 10) at their floor (10 / 40 BPM).
  - [ ] **Product call, not built:** no Stop button during the count-in (4 beats + 0.1 s lead, 0.4 s recording): 24 s
    at 10 BPM, 16 s at 15, 12 s at 20, 9.6 s at 25, 8 s at 30, 6 s at 40, 4 s at 60, 2.7 s at 90, 1.7 s at 140; a song
    switch has one count-in per round.
  - [ ] **Product calls:** Follow steps pass by tapping every 250 ms; "Play strum" does not stop a running Metronome and
    still accents beat 1 after "every click the same"; the Tuning Simulator's "Which way?" screen shows the answer ("Too
    low — tighten the peg"); Name the Power Chord resets its round when the tab is hidden; `.ca-paths-grid` adds a 760px
    breakpoint; two devices can save different path picks.

- [ ] **2026-11-07 — `tools/smoke.mjs` hangs.** Two runs in the `guitar-class-ratio` worktree never finished (one sat
  about 4 hours, headless Chrome 157); Jonathan had to force quit Chrome. Not the profile, port or machine load.
  Same family as the 2026-11-04 hang (Chrome 156; Chrome 157 fixed that one). Workaround in CLAUDE.md step 3 (an
  outside time limit, `pkill -f gc-smoke-chrome`). Still open: a watchdog inside
  `smoke.mjs` that prints the step it is on and exits non-zero. Decided 2026-11-07 (Jonathan): the 1.8 / 2.19 ratio
  shipped without a smoke run.

- [ ] **2026-11-02 — `tools/smoke.mjs` flakes after its page reload (cause unknown).** About 4 of 9 runs reported errors
  right after the Power Chord walk's `Page.navigate` (`chordDiagramSVG is not defined`, `NOTES is not defined`, `Cannot
  access 'shRaf' before initialization`); no failed fetch. If it shows up: rerun once on a quiet machine
  (`pkill -f headless=new` first); if it persists, look at the service worker's first-load cache and the fixed sleeps
  around `devBypass()` in `powerSwitchWalk`.

- [x] **2026-11-02 — Power Chord Switch setup overflowed with "Best today"** (`611503a`, `15eec92`): the score is its own
  line (`.cc-best-line`, 18px, always drawn so the pair buttons do not jump); the title's no-break space is pinned by 1ca; smoke checks it. Done.

- [ ] **2026-11-01 — Song popularity counter** (`3a062bd`; Jonathan chose "students + total opens"). Counts start
  2026-11-01: a "More Play Along songs" click writes `songOpens` to the student's own `progress/{uid}`, outside
  `flushSave()` (1bo cannot reach it). Not counted: teacher, dev bypass, signed out, Core rows, opens from activities or
  a link. The console's Songs view shows "Opened: N students · M opens" (whole counts 1..1000 only: student-written).
  Check 1ch. No open step is written down: ask Jonathan whether to tick it.

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
  - [ ] `tools/pm-e2e.mjs` seeds dates from the real date: it fails in 24 of 32 school weeks from the week of
    2026-11-23. Make its dates fixed.
  - [ ] `tools/smoke.mjs` draws no practice-minutes UI; `tools/pm-rules-test.mjs` needs the emulator.

- [x] **2026-11-01 — Friday check (Fast commits `a615925`..`65898ce`).** Done 2026-11-01/02. The grey "Optional" edge
  (Jonathan: "fix the optional look to what you think is best"): `quiet = !done && !caStudentIsCAS() &&
  caIsOptional(a)` in `caActivityCardHtml`. Power Chord Switch's results screen stays full width, left-aligned, on purpose.

- [ ] **2026-10-31 — Friday check (first run, `1c1e6c6`..`59e7915`).** R2-1, R2-4, R2-6, R1-1, R1-3 done 2026-10-31.
  Binding: the console skips the signed-in account's own empty document (Jonathan chose this over a local-only trainer
  profile; check 1cf); Change Up's Start sits in the sticky bar (1ca); trainer `dayStr` is the local date (fails under
  `TZ=Pacific/Auckland`). A mic hit on ca-43's two-fret power cards names and marks both frets ("fret 0 / 12"; 1cd). `639248b`,
  `6871747`, `b3a351c`, `cb3dc5e` (mic detection) and `5e2061e` (new check 1cc) should not have shipped Fast; reviewed
  then. **Still open:** check 1cd sees only strings asked for through `ncK()`; a direct `t('nc.*')` on a power screen is
  invisible to it.

- [x] **2026-10-31 — Pushed without a reviewer (after `66266c9`)** — reviewed by `friday-check-2026-10-31`. Binding:
  **Note Call no longer accepts the 5th** (Jonathan, 2026-10-31): kept, a wrong chord a 5th above counted right 7.7% /
  28.9% / 100% at std / mid / weak; dropped, 0 of 1040, no right-strum row changed. Left alone: at std a root-quiet
  strum is heard 67.1%, a two-string root + 5th 65.4%; Riff Runner's Wait Mode still takes the 5th. Branch
  `phase5-sw-audio` merged 2026-10-31 (`fe4e934`; check 1ce; base `ff9e913a6d`). Left on purpose (R1-5): a student who did not open the site
  while it deployed loses every track at the next audio deploy. The `AUDIO_MIGRATION_FP` and rollback rules are in skill
  `audio-and-snippets`.
  - [ ] ca-43 Note Call through a real guitar and a Chromebook mic: not recorded as done.

- [x] **2026-10-30 — Everything pushed in a hurry** (`d4544a3`, `1c3062b`, the Watchtower switch) — covered by the
  Friday checks (tags `friday-check-2026-10-31`, `-11-01`, `-11-01b`, `-11-06`). Branch `wip/main-folder-2026-10-30`
  (based on `6b120f8`) shipped as `158015d`; the main folder's commit `5634815` is `5e2061e`; the branch and the
  worktrees `guitar-class-pcs` / `guitar-class-wt` are gone (checked 2026-11-09).

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

