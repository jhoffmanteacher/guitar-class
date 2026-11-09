## Where things stand (updated 2026-11-07)

Start here. Each line says where the detail is. Update this block whenever an item opens or closes; the
sections below hold the history and the reasons.

**Waiting on Jonathan: the Practice minutes console view (shipped 2026-11-07)**
- **Paste `firestore.rules` into Firebase console → Firestore → Rules → Publish.** The one change: the teacher's
  account may READ `minutes/{uid}/weeks/*` (nothing else under `minutes/`). Until then the console's new
  **Practice minutes** view shows one line, "Publish the new Firestore rules…", and nothing else breaks.
- Then open **Practice minutes** in the console and check a student or two against their My progress (rank can
  differ slightly: see "Recently shipped" → 2026-11-06 Practice minutes in the teacher console).

**Power Chord Switch strum ratio (2.2 / 2.67 on 2026-11-05; 1.8 / 2.19 since 2026-11-07)**
- **Changed 2026-11-07 to 1.8 / 2.19** ("Decision (2026-11-07)": 2.2 missed 6 of 75 real strums on 34 takes). Jonathan chose a stricter strum ratio for Power Chord Switch ONLY: `CC_POWER_ONSET_RATIO` 2.2 and
  `CC_POWER_HF_RATIO` 2.67 in `coach.js` on 2026-11-05 (Change Up and every other loop keep 1.4 / 1.7). On the 12 real takes the
  replay says 30 of 52 false hits go and 4 of 132 real strums are lost. Lowered to 1.8 / 2.19 on 2026-11-07. Detail, numbers and how to roll it back:
  "Power Chord Switch: where we stopped" → "Decision (2026-11-07)" (then "Decision (2026-11-05)"). "No readable pitch, no tick" was rejected on 2026-11-07: do not build it.
- **First, after it is live (Jonathan):** a thumb or finger strum take on a test student account at 60 and 120 BPM,
  then "Evaluate all recordings" and read "Played, not counted" (see "Decision (2026-11-05)").
- **Tempo controls shipped 2026-11-05** (a slider on the setup, live −5 / +5 while playing, steps of 5): "Power Chord Switch: where we stopped" → "Tempo controls".
- **To watch in the next takes (from 2026-11-07):** "Played, not counted" (`detector-missed`) at 35-40 BPM should fall;
  "heard, not there" will rise a little in noisy rooms (on the 7 takes graded at 1.4, 20 of 31 false hits still fire at
  1.8, 10 at 2.2). Not covered by the real takes, so look at these first: **thumb or
  finger strummers** (no sharp pick attack), **fast every-beat pairs** (up to 140 BPM; the 12 takes ran at 40-90 BPM,
  one at 90/105/120), and **Chromebooks that draw slowly** (11 of the 12 takes had 16.7 ms frames, 1 had 33, none 50).

**Recordings**
- **The Pitch-rule table** (teacher console → Mic recordings → Evaluate all recordings) was read on 10 takes with saved
  pitch readings on 2026-11-07 and the rule was rejected (it removes 2 of 12 false hits and loses 10 of 46 real rights).
  The table stays in the console. Jonathan keeps the 34 takes saved so far (21 Power Chord Switch) outside the repo
  (`~/Documents/mic-recordings-2026-11-07.zip`): the files carry student names.

**Optional leftovers (Jonathan's)**
- The console's `heartbeats` composite index (Firestore → Indexes, the only index). Nothing uses it; see
  "Practice-minutes heartbeat removal (not Power Chord Switch): DONE".

**Automatic**
- The Friday check (Fridays 11 PM Pacific; next 2026-11-06) reviews the two Fast commits from 2026-11-05:
  `b958165` (pitch readings saved in takes) and `ce5096e` (the Pitch-rule table). The ratio change was reviewed
  the same day (always-reviewed: a detection change), so it is not in that list.

**Finished recently (don't redo)**
- Practice-minutes heartbeat removal: code, rules, emulator test and the old collections (2026-11-05); the old
  `minutesBoard` collection deleted too. The class rank and the Top 5 are keyed by a private tag, so no uid sits next
  to minutes.
- `tools/pm-rules-test.mjs`: 191 emulator cases since 2026-11-06 (179 before; minutes, the teacher's weeks-only
  read, the boards, recorded takes, their audio chunks, the take counter). It needs Java 21: on Jonathan's Mac it is at `~/tools/java` (not on PATH; the recipe is in the file's
  header). One known leniency is pinned, not fixed: a chunk with no `i` field is accepted.

**Not re-reviewed on 2026-11-05**
- The 7 unchecked top-level items and 6 nested ones under "Open work" below (the smoke flake after reload, the song
  popularity counter, three Friday-check items, the cloud review, "pushed in a hurry"). Read them there; this block
  does not summarize them.

**Settled, don't re-raise:** the 30 s take cap, the real-guitar mic check, the three "chord sounded wrong"
wordings, no Note Runner mic check (see "Later (not chosen yet)").

---

## Working conventions

- **Two Claude sessions at once → each in its own git worktree.** Both machines
  run parallel terminals sometimes. Two sessions in the SAME working tree share
  one git index, so one session's commit can sweep up the other's *uncommitted*
  work — this happened 2026-07-12 (the Change Up combos + Random-4 changes got
  bundled into the unrelated Wait Mode commit `6dcf68c`). If you start a second
  session while one is active, give it its own worktree before editing shared
  files: `git worktree add ../guitar-class-<tag> -b work-<tag>`, work there, then
  merge/push from there. On the **Mac** this is now auto-reminded — a SessionStart
  hook (`~/.claude/hooks/cc-session-lock.sh`, wired in `~/.claude/settings.json`)
  detects a live second session via per-session heartbeat locks and tells Claude
  to switch to a worktree. It's a *reminder, not a relocation*, and it's
  **Mac-only**; the **Windows** machine needs the rule followed by hand (or a
  PowerShell twin of the hook). Activate after editing the hook with `/hooks` or a
  restart.
- **Cloud Cowork sessions can't push (and must not git-write through the
  device bridge).** Established 2026-07-23. Scope narrowed 2026-09-04: this
  is about **Cowork specifically**, not "the cloud" — a Claude Code on the
  web session has its own writable clone and authenticated HTTPS to origin,
  and pushed `d0e3dfa` (the Journey tab-card restyle) straight to `main`
  with no patch pair. What it still can't do is reach the live site — the
  agent proxy returned HTTP 403 for `jhoffmanteacher.github.io/…/sw.js`, so
  `checks.mjs --live` can't confirm a deploy from there, and the link
  check's ~240 YouTube fetches all 403 as non-blocking warnings (they prove
  nothing about the links either way; a real dead-link sweep needs a local
  run). Cowork's constraint is a different one and is unchanged: its GitHub
  access is read-only for this repo, and running `git am`/`merge` against
  the Mac clone through the connected-folder bridge fails (the bridge can't
  unlink git's lock files — stale locks had to be swept to `_to_delete/`).
  The working pattern instead: build + verify in the cloud (full `checks.mjs`
  run pre-handoff so `CACHE_VERSION` ships pre-bumped) → commit → deliver
  `git format-patch` output **always paired with its own `APPLY-*.md`**
  (canonical step list lives in CLAUDE.md's cloud-sessions section: fast
  `--check --skip-links` verify on apply, push, then `--live` deploy
  confirmation) → Jonathan's local Claude Code applies (`git am`) and
  pushes → the cloud session then fetches origin and hard-resets its
  clone. Local sessions keep the normal "push to GitHub" workflow from
  CLAUDE.md unchanged.

- **Single-flow modules (new pattern, 2026-07-23).** A set whose `stations`
  has only `b` (no `c`) renders as a SINGLE-FLOW set: one custom-labeled
  learn tab straight into the checklist — no Station B/C framing. The tab
  card and rail mirror the set's own labels: `tabTitle`/`tabSub` (+`_es`)
  on `stations.b`, `checklistSub` (+`_es`) on the set; `panelFooter` routes
  station-b → checklist; `syncRailStations` hides the Station C rail button
  and swaps the labels. **Module 13 · String Changing** (`module-13.js`) is
  the first single-flow module — its 4 checklist skills ARE the graded
  in-class assessment rubric. Everything else (skills checklist, practice
  panels, search, Keep practicing, My progress, print) works unchanged.

---

## Open work

- [ ] **2026-11-06 — Friday check: left for Jonathan (not fixed; all confirmed by the reviewers unless marked plausible).**
  Done 2026-11-07 (worktree `guitar-class-open`): the "No streak right now" wording (93cb1dc); the My progress pin gap
  (`pm-sim` section 18, 17 assertions, `PM_SIM_PIN` 285 -> 302, 12 mutants all red); ca-43 (a board limit at fret 12, not a
  drill bug: 4 of 10 cards in "Frets 8 to 12" and 2 of 24 on the whole neck light only the root, the 2026-11-02 changelog
  line now says so); the smoke Play-clicks slider gap (`smoke.mjs` drags the card slider to 77; with `strumOpenMetro` forced
  to 60 it reports 7 failing steps); check `1d` flags a shared step before a path step (reviewed by `site-reviewer`, 2 minor
  points fixed). The coach.js fixes (Stop hint, 10 s of play, 130 cap) were reviewed by `site-reviewer-deep` the same day and landed 2026-11-07. What is left:
  - [x] *Stopped-game headline + song-switch setup tempo (DECIDED 2026-11-07 by Jonathan, built and merged the same day after two deep-review rounds):*
    **A Stop with changes still ahead, where every change the student reached was right** (`ok === total - cc.unreached`, `cc.unreached > 0`), in both games:
    below 85% of all changes it reads "N of M changes worked before you stopped." (M = reached; "1 of 1 change" at one) and "Every change you reached worked. Play it
    again, to the end." (`games.cc.verdict.stopped`/`stoppedOne`, `games.cc.advice.stopped`, EN + ES): no "too fast", no "Drop 5 BPM" (Change Up: "Drop 10 BPM"). At 85% or
    better of all changes the good-score headline stays. At ANY score the never-reached changes are grey (`coach-chip notreached`, opacity .45, no mark), the breakdown's
    "no strum heard" leaves them out and ends with "· N not reached" (`games.cc.breakdown.left`), a song switch's rounds line counts only the changes reached (a round with none
    is not listed), and below 85% the tempo row stays on the tempo played (at 85% or better it shows the usual "Level up" step). **A Stop before the first change** (nothing reached; Jonathan chose the neutral screen): "You stopped before the first
    change." / "Play it again, to the end." (`games.cc.verdict.stoppedEarly`, `advice.stoppedEarly`; ES "Paraste antes del primer cambio." / "Tócalo otra vez, hasta el final."), no tempo
    advice, no XP or best, row unchanged. NOT changed: a Stop where any reached change was wrong or not heard (its fraction, chips and breakdown count the never-reached ones as
    before), a game played to the end, a Stop in a later round's count-in.
    **How "never reached" is decided** (`ccFinish`, `c.neverReached`): a change waiting, or a miss that fell due in the 4 s (`CC_STOP_REACH_MS`) before the Stop, after the last
    graded strum, AND after the last strum the mic heard (`cc.lastOnsetT`; a late strum outside every window means the student tried that change). A sound in the last 300 ms before the
    Stop is the Stop click and is ignored (`cc.prevOnsetT` is the onset before it); the open pitch check that click started is dropped in `ccFinish` too, and its event leaves the saved take (review rounds 3-4, 2026-11-08: when the click lands inside a change's window (always at
    "Every beat", about half the time at "Every 2 beats", a quarter at "Every bar") `ccLoop` had matched it to a change, so a Stop after 4 right read "5 of 5" or "5 of 15, too fast"; only the LATEST onset's check
    is dropped, so a real strum just before the click keeps its own; 1ck runs the real `ccLoop` for all of it). **Known and left alone (round 4, R4-2):** a Stop within about 300 ms of the final strum's arrival
    (the arrival clock, so up to roughly 300 ms plus the mic delay after it was played) counts that strum as the click: a game whose last change was strummed that late loses its XP, "complete" and best (120 of 420 simulated
    Stops at 150 and 250 ms) and the last chip goes grey. The alternative (skip the drop when the game would be complete) credits a click in the last change's window as a played change (56 of 56). Not changed: a hand cannot strum and press Stop that fast. The same strum, taken as the click, also makes the headline read "No strum was heard" (and the console files it as "detector-missed").
    **A Stop in a game where nothing was heard at all** (R5-2, decided by Jonathan 2026-11-09: neutral; `cc.silentStop = !ended && cc.noStrum`): once a change is more than 4 s (`CC_STOP_REACH_MS`) past due `noneReached` is false, and the screen used to read "0 of N — this speed is too fast" and "Drop 5 BPM" (4-16 of 64-116 simulated Stops in Power Chord Switch, 32-108 in Change Up). Now `ccRenderDone` reads "No strum was heard before you stopped." with the "Play it again, to the end." advice and the tempo row unchanged, in both games, when no change was graded right or wrong (`ok === 0 && off === 0`) and Power Chord Switch is not already on its "strum a little firmer" screen (two or more unheard changes keep that: it is the useful advice). Not covered: a silent game that runs to the END (`ccStageEnd`; Change Up still says "too fast" for a dead mic).
    **Settled, do not re-flag (Jonathan 2026-11-09):** Module 1's step says "More than 2 notes away from the target on the circle? Stop and ask" (the figure: "3+ steps away? stop and ask") while the Tuning Simulator's levels start a string up to 4-5 steps away and never say to stop and ask. Leave both as they are.
    **Changes that fell due before the Stop with none reached** (2026-11-08, Jonathan chose the first wording; the second is mine, round 4): if no strum at all was heard in the game
    (`cc.noStrum`: `cc.onsetCount`, the Stop click not counted) the headline is "No strum was heard before you stopped." (`games.cc.verdict.stoppedSilent`; ES "No se oyó ningún rasgueo antes de que pararas."); if strums were heard but no change
    (the first chord strummed, then frozen) it is "No change was heard before you stopped." (`stoppedNoChange`; ES "No se oyó ningún cambio antes de que pararas."); "You stopped before the first change." only when none had
    fallen due (`cc.noneDue`: no earlier round and every change still ahead). All three keep the same advice; the first two draw no "N not reached" breakdown under the headline (it contradicted it). A song switch's previous round uses its own last strum (`cc.prevLastOnsetT`, saved in `ccStageEnd`) and
    is skipped when a strum was already heard in the new round.
    **Open product call (Jonathan, not decided):** any OTHER sound after a change fell due (room noise, a neighbour's guitar, a hand muting the strings) also counts as "the student tried it",
    so in a noisy room the clean screen gives way to the old "too fast" one. The round-2 reviewer measured one noise onset per second at Every bar / Every 2 beats: the clean screen survives in 72-76
    of 96 games with this rule, 89-93 of 96 without it; without the rule a student who strums late and gives up gets "4 of 4 worked". Kept: the conservative one (no praise that is not earned).
    **Known and left alone:** a song switch whose round 1 was silent, Stopped within about 0.2 s of round 2's play screen at 130 BPM, reads the neutral screen after a whole round was played
    (round 1's swept tail counts as a reach; reviewer R2-3, rare). The done screen's height at 1366x657 was reasoned, not measured: the breakdown line may wrap once (about +20 px).
    **Song-switch setup:** the tempo readout, slider top and session tempo stop at 130 (`ccSetupMaxBpm`); a pair's 135 / 140 comes down on a song switch and comes back when a pair is picked
    again unless a tempo was set on the song switch (`cc.heldPairBpm`, cleared by `ccSetBpm`, `ccAgain`, and a new `ccSetup`). Check `1ck` runs about 23 real games for the Stop cases (hand-set results
    with the strum times set the way `ccLoop` sets them) and a setup walk; every broken version of the new code (22 in two rounds) turns it red.
  - [x] *coach.js detection:* **Grid step cap (2026-11-07, branch `coach-open`).** `ccLoop` moved `gridOffset` by a quarter of a strum's distance
    from the nearest beat, uncapped: one stray sound half a beat off moved it 749 ms at 10 BPM (499 at 15, 250 at 30, 125 at 60). It now moves
    `CC_GRID_STEP_CAP_MS` = 60 ms at most, in both games (`teacher.js` `micEvalTakePw` replays each take with the `gridStepCapMs` it saved; none = uncapped).
    Chosen by `node tools/grid-sim.mjs` (SEEDS=12; the real `ccLoop`, old rule against each cap; 21,888 scripted games per version: Power Chord Switch
    10-140 BPM, Change Up 40-140, every beat and every bar, 19 kinds of player, 240,768 graded changes; "right" is the true answer).
    **No cap leaves all grading alone.** At 60 ms, 30 BPM and above: 72 changes that were wrong turned right and **4 that were right turned wrong**.
    **67 of the 72 and all 4 come from one very loose player** (strums spread 0.2 beat, up to 0.49 beat off, **no stray sounds**: each far-off
    strum acts like a stray sound); the other 5 come from a slightly less loose player (spread 0.15 beat) with stray sounds. Below 30 BPM: 20 turned right, 1 wrong (18 of the 20 from
    that player). In grading a stray sound rarely matters at any cap, because a change's window is half a beat; **for a stray sound the cap mostly
    keeps the beat dots still**, which is what the CHANGELOG says. Other caps, same games (wrong to right / right to wrong, 30 BPM and above): 40 ms
    164 / 4, 50 ms 104 / 4, 80 ms 47 / 4, **100 ms 22 / 0**, 150 ms 3 / 2. (An earlier run that clipped every strum to 0.45 beat from its beat saw
    25 / 0 at 60 ms; the clip hid the cost.) **A judgment call for you:** by these counts 40 or 50 ms would fix more than 60 at the same four
    wrong ones; 60 was kept because it is the suggested value and the grid catches up faster. (Two of 40's four involve stray sounds, an on-time player and a late
    one; all four of 50's come from the very loose player, so that argument counts against 40 only.) 100 ms never turned a right change wrong but fixes a third as many. Say if you want another number (one line, plus the pin in 1ck).
    Catch-up is slower (strums until the grid is within 50 ms of a steady offset, old / capped): 10 BPM 0.2 beat late 12 / 22, 10 BPM 0.4 beat
    late 14 / 42, 15 BPM 0.4 beat 13 / 29, 20 BPM 0.3 beat 11 / 17, 30 BPM 0.4 beat 10 / 15 (reviewer's measurement); at 60 BPM and up almost no
    difference. The grid still follows a player 150 ms late on every beat (148 ms after 16 strums, as before). A player 1.5% fast or slow ends within
    3 ms of before at 20 BPM and up, within 15 ms at 15 BPM, but **250 ms short at 10 BPM, every beat** (1085 old / 838 capped; the reviewer measured about
    700 ms short at every bar); grading was unchanged in the reviewer's 224 games of 1.5-5% drift at 10-40 BPM. **Takes:** each saved take now
    records `gridStepCapMs`; the console's replay (`teacher.js` `micEvalTakePw`) caps its grid at the take's number and replays a take without one
    (older takes, or a browser on the cached old file) uncapped, as it was graded; `tools/mic-sim/fake-pw-take.mjs` reads `CC_GRID_STEP_CAP_MS` from
    `coach.js`. No `firestore.rules` change (the take's fields are not pinned). Check `1ck` runs the real `ccLoop` (48 runs, a stray sound with no change
    open and with the change due next taking it), reads the saved take's field and pins the number, the line and the console's reading of it; `1cl`
    pins the older-take fixture (`pw-drift-old`, whose grid differs from its twin's); thirteen broken versions in all each turn one of them red.
    **Status: MERGED to main 2026-11-07 (e77ec8f), at Jonathan's request ("push work from other worktree"), after three deep-review rounds** (round 1: two major
    problems, old takes replayed capped and a guard that could not see a taken strum; round 2: two guard gaps and a wrong explanation of the sim numbers; round 3: one wrong
    label, three more guard gaps and an understated CHANGELOG range). All fixed in the last commit, each with a mutant that turns a check red; **that last commit was not
    reviewed again** (the Friday-check rule would have held it for a fourth round).
    Not decided here: the Listening Coach (`coach.js` `coachMatchEvent`, `gridDelta = dev * 0.15`) is uncapped; its window is 0.9 beat, so one stray
    sound at its 30 BPM floor can move its grid up to 270 ms (the nearest event wins, which limits it). Left alone.
  - [x] *Power Chord Switch UX, top-tempo advice (2026-11-07; merged to main 2026-11-07 at Jonathan's request: three review rounds, see the end of this bullet):* the done screen said "Level up: try it 5 BPM faster" at 140 (a pair) and 130
    (a song switch's first round) although the done row cannot go up. When the step up lands on the tempo just played (`ccDoneUpBpm() <= ccDonePlayedBpm()`, the
    same numbers the row's tempo uses) it says `games.pw.advice.top` instead: "The tempo cannot go higher. Play it again." / "El tempo no puede subir más. Tócalo
    otra vez." The wording is deliberate: not "top speed" (the setup's "speed" buttons are Every bar / Every 2 beats / Every beat, and a faster one exists at 140 BPM) and
    not "fastest tempo ... at this tempo" (a song switch is not played at one tempo: its row says "Again from 130 BPM" after rounds at 130 / 135 / 140). Under 85% right
    nothing changes. Check `1ck` renders the real done screen in 25 cases x EN + ES (50 renders) and compares the whole advice line and the tempo the row opens on:
    a pair at 140 and 135 (all right, 13 of 15, 10 of 15 wrong or not heard, firmer, under half), at every switch speed, as the computer's pick, and after a live
    slow-down; a song switch from 130 and 125 (all right, 6 of 7, under half) Stopped in round 1, 2 or late (the changes never reached counted), with the Next round buttons pressed, and after a live slow-down of round 1 (the finished game's stage and lowest tempo are set as the real game leaves them); Change Up at 140 untouched. Three deep-review rounds (round 3 found the code correct in 40,000 states and only holes in this check, fixed afterwards without a fourth round; merged to main 2026-11-07 at Jonathan's request without one); every mutant they found (21 kinds) turns it red, and `cc.nextBpm` being cleared by Again is pinned. **Not changed (product call):** the row follows the settled
    "counted at its lowest tempo" rule, so a pair started at 135 (or 140) that the student sped up with the live +5 still says "Level up" with a +5 that does
    nothing (the counted tempo is 135), and so does a song switch from 125 sped up to 130 in round 1; rare. **Same shape, not fixed (not asked for):** Change Up
    says "Level up: try it 10 BPM faster" at 140 (`games.cc.advice.great`), and at the BOTTOM both games say "Drop 5 BPM and try again" (Change Up: 10) at 10 BPM
    (Change Up: 40) with a row that cannot go lower (`games.pw.advice.low`, coach.js ccRenderDone), found by the round-2 reviewer: a pair at 10 BPM with 3 of 15 right
    reads "this speed is too fast for now. Drop 5 BPM", and −5 stays at 10.
  - *Power Chord Switch UX, product call, NOT built:* no Stop button during the count-in. The count-in is exactly 4 beats, plus a 0.1 s
    lead (0.4 s while recording): 24 s at 10 BPM, 16 s at 15, 12 s at 20, 9.6 s at 25, 8 s at 30, 6 s at 40, 4 s at 60, 2.7 s at 90,
    1.7 s at 140 (add the lead: 10 BPM is 24.1 s, or 24.4 s recording). A song switch has one count-in per round (the first at the
    starting tempo; the later ones at the next tempos).
  - *Product calls:* Follow steps pass by tapping every 250 ms (early taps cost nothing); "Play strum" does not stop a running
    Metronome and still accents beat 1 after "every click the same"; the Tuning Simulator's "Which way?" screen already
    shows "Too low — tighten the peg" (the answer); Name the Power Chord resets its round when the tab is hidden;
    `styles.css` `.ca-paths-grid` adds a 760px breakpoint; two devices can save different path picks.

- [ ] **2026-11-07 — `tools/smoke.mjs` hangs and may freeze Jonathan's own Chrome.** Two runs of
  `node tools/smoke.mjs --baseline origin/main` in the `guitar-class-ratio` worktree never finished: the first sat for about 4 hours
  after printing "walking origin/main for comparison" (headless Chrome 157, idle), the second sat in the first walk; Jonathan had to
  force quit Chrome in Activity Manager. Earlier the same day a run in another worktree finished clean (0 errors, 36 sets, 3163 handlers).
  Not the profile or the port (`mkdtempSync` profile, free port per run) and not machine load (load average about 3 on 8 cores). Same
  family as the 2026-11-04 hang. Decided 2026-11-07 (Jonathan): the ratio change 1.8 / 2.19 shipped WITHOUT a smoke run (check 1ck runs the real
  `ccLoop` around both thresholds; the deep review was clean). Next time: add a hard time limit to `smoke.mjs` (a watchdog that closes the
  browser and exits non-zero with the step it was on) and have it print the step it is on, so a hang names itself; run it only with Chrome closed.

- [ ] **2026-11-02 — `tools/smoke.mjs` flakes after its page reload (cause not
  found).** On this Mac, about 4 of 9 runs on 2026-11-02 reported errors that the
  baseline did not, all right after the Power Chord walk's `Page.navigate` reload:
  `module 3 failed to load ReferenceError: chordDiagramSVG is not defined`
  (`app.js:5745`, a set render; `guitar-diagrams.js` is a `defer` script that runs
  before `app.js`), `NOTES is not defined` (`tuner.js`), `Cannot access 'shRaf'
  before initialization`, and once a Fret Zap walk finding no buttons. A debug copy
  that printed every failed local request (the NOISE filter hides `net::ERR`) showed
  none, so it is not a failed fetch. Other runs of the same tree were clean (0
  errors). Nothing in the diff touches those globals. If it shows up in a push
  check, rerun once on a quiet machine (`pkill -f headless=new` first); if it
  persists, look at the service worker's first-load cache and the fixed sleeps
  around `devBypass()` in `powerSwitchWalk`.


- [x] **2026-11-02 — Power Chord Switch setup overflowed with a "Best today"
  score (DONE).** "Best today: 60 BPM" joined the tempo row, the speed and tempo
  groups no longer fit side by side, and the setup grew to 698px on a 657px
  screen (the privacy line cut off). Now (Power Chord Switch only; Change Up's
  render is byte-identical) the score is its own line under the −5/+5 row
  (`.cc-best-line`, always drawn, empty without a score, so the pair buttons do
  not jump); `#cc-body.cc-power .cc-change-loop` has side padding; the
  "Slide along the low E string" / "Desliza por la cuerda Mi grave" titles join
  the two words with U+00A0 (1ca pins it). `tools/smoke.mjs` powerSwitchWalk:
  a best score of `CC_BPM_MAX` in 3 views × EN/ES (no scrolling, speed and tempo
  on one row, privacy line on screen, the pair columns at the same height with and
  without a score — 6 views, red on the old code at exactly 698px in all 6; the
  same-height check was red at a 15px `.cc-best-line`, green at 18px), the title at every window width 1366→920 in steps of 6 (the
  Spanish title broke between "Mi" and "grave" at 20 of them without the fix; the
  English one did not break at any width tried, so it is covered by the no-break
  space pin), and the done-screen button's padding. Change Up's done-screen
  "Pick different loop" button (the same `.cc-change-loop` class) got the same
  padding 2026-11-02 at Jonathan's word: the rule is now unscoped, and smoke checks
  both games' buttons in EN + ES.


- [ ] **2026-11-01 — Song popularity counter (Jonathan: "a counter on the
  teacher dashboard ... how many times each of those songs has been clicked on
  by a student"; chose "students + total opens").** A click on a "More Play
  Along songs" row (name or Play Along) runs `songsLibraryOpen(id)` (app.js):
  `{ name, email, songOpens: { <id>: increment(1) } }` merged into the student's OWN
  `progress/{uid}` — atomic, outside `flushSave()`'s payload (so 1bo's
  failed-load wipe cannot reach it), and allowed by the existing rules (no
  console paste). Not counted: teacher account, dev bypass, signed out, Core
  rows, opens from In-Class Activities or a link. The console's **Songs** view
  shows "Opened: N students · M opens" per song (`teacherFetchStudents` keeps
  whole counts 1..1000 only — student-written). Check **1ch** renders the rows
  and clicks every button, renders the console's Songs view with fake rows (3
  exact count lines, an archived student left out) and opens the card in 4
  failure modes (db null, Firestore not loaded, a write that throws, a refused
  write — it must carry a .catch); 10 mutants red. Reviewed same day
  (site-reviewer-deep: ship; emulator 14/14 on the real rules). Counts start 2026-11-01. The extra
  songs already counted toward practice minutes (all six use `-backing-`
  tracks; measured 8 s / 8 s on ca-36 and ca-42 from the Songs page) — no
  change needed there.

- [ ] **2026-11-01 — Early Friday check (Jonathan asked; range
  `friday-check-2026-11-01`..`dfcb8a7`, the 2 Fast commits plus the 4
  practice-minutes commits, the last 3 of which were never reviewed).** Three
  reviewers (Fast commits at high; practice-minutes data path and display at
  xhigh). Fixed and pushed: Live quiz Back button stretched (8a4376f); grey edge
  missing on Today cards and exit checks (050017a); practice minutes R2-1 (a commit on the wire at
  close is kept — Jonathan: count liberally, a rare double is fine; the keepalive no
  longer goes out on a dead link), R2-2 (sign-out/in on a
  Journey page lost the queue), R2-4 (clock moved back → double), R2-5 (token
  refreshed at session start), PD-1 (Jonathan: a miss before any streak spends no
  free miss), PD-2 (section tap popped the recap), PD-3 (recap stayed over My
  progress / a language switch), PD-4 (a recap made in a hidden tab blocked the
  real one), PD-5 ("Break week: no goal"). Left, all LOW:
  - [ ] Liberal counting can over-count (accepted, Jonathan 2026-11-01; the daily
    cap bounds it): Stop then closing the tab 2–3 s later re-sends the
    end-of-session batch (up to ~60 s) once; a chain of pages each opened and
    closed within ~2 s can re-send the same batch several times (sim: 84 played →
    144). To cap it at one extra send: keep the in-flight part of a leaving key
    in its own bucket (`{days, at, once}`) that an adopting page never puts back
    into its own leaving key while it is in flight.
  - [ ] The keepalive's dead-link guard only sees a commit in flight: a link that
    died after the last answer, with no commit sent yet, loses the keepalive's
    seconds (up to ~60 s).
  - [x] Test gaps — DONE 2026-11-02 (pm-sim section 11, 133 → 142 assertions,
    `PM_SIM_PIN` 142): the `newestGen` branch adding back failed seconds (two
    outcomes: a stuck commit that lands / fails after a newer sign-in AND another
    student's sign-in); buildOps' `flying` term (a keepalive beside an in-flight
    commit must mark the week hit); refreshToken() at session start (a page open
    two hours, no commit landed); pageshow clearing `leavingPage` (and, the other
    half, a really-leaving page whose keepalive could not go starts no commit when
    hidden). Each proved red with its own mutant, green without; the old 133 stayed
    green on 6 of the 7 mutants run.
  - [x] R2-6 — DONE 2026-11-02: `adopt()` also takes the exact key `pm:q:<uid>`
    (written by 70ef823, about 10:33–11:36 on 2026-11-01) and removes it; another
    student's key, even one whose uid starts with this one's, is left alone. A rare
    double is fine (counting is liberal). Red on the old engine in pm-sim.
  - [x] PD-6 (closed 2026-11-05: "N playing" and the heartbeats index are gone, so
    the squeeze cannot appear).
  - [ ] The bar's flame is orange only when this week is hit; My progress's flame
    whenever the streak is above 0 — pick one.
  - [x] Impossible tips — DONE 2026-11-02: `weekReach()` (practice-minutes.js):
    days left in the week (today included) × the daily cap, less what today
    already counted, against the minutes still needed. When it falls short the My
    progress tile AND the Stop recap say `pm.weekOut` ("You can't reach the goal
    this week. A new week starts Monday." / "Esta semana ya no puedes llegar a la
    meta. El lunes empieza una semana nueva."). A streak of 0 says `pm.streakNone`
    ("No streak yet" / "Aún no tienes racha") on the tile and the bar flame's
    label. pm-e2e pins a Sunday/Saturday boundary table (exactly enough, one
    minute short), EN + ES, the recap, and the flame label, under a moved clock so
    it holds on any run date.
    `site-reviewer` (high) on 611503a: R1-1 FIXED — `weekReach` rounded the minutes
    needed up before comparing against the seconds of room, so 1 s short with 1 s
    left said "can't" (1.64% of reachable Saturday/Sunday states); now compared in
    seconds, pm-e2e pins 1 s / 59 s cases (red on the old comparison). R1-2 FIXED —
    checks 1cg: `weeklyGoalMinutes` must be ≤ 7 × `dailyCapMinutes` (else every
    week says "can't"). Jonathan chose (a) "hide Longest at 0" — DONE 2026-11-02 (the empty line keeps
    its height; "No streak yet" over "Longest: 5 weeks" after a lost streak stays; changed 2026-11-07, 93cb1dc: it now reads "No streak right now").
    (b) an old tab still running 70ef823 could keep rewriting `pm:q:<uid>`, which a
    new page adopts and deletes (those seconds could count 2–3 times) — CLOSED
    2026-11-02, Jonathan: nobody opened the site on Sunday 11/1, so no tab ran that
    build. Left, LOW: (c) `weekReach` is covered by pm-e2e only (not in checks.mjs): 8 mutants of it
    and `streakWords` all went red in pm-e2e, 8 stayed green in pm-sim.
  - [ ] The "goal reached" toast shows only on a practice card. A goal reached
    in a lesson snippet or on My progress waits for the next practice card on
    that page; one reached on a Journey page never shows (`pendingToast` lives
    in that page's memory only).
  - [ ] `tools/pm-e2e.mjs` seeds history counting back from the real date: with
    the live skip weeks its expectations fail in 24 of 32 school weeks from the
    week of 2026-11-23. Not a site bug — make its dates fixed.
  - [ ] `tools/smoke.mjs` draws no practice-minutes UI (dev bypass has no host
    user), and `tools/pm-rules-test.mjs` needs the emulator (not run from the
    cloud). (The old note about the heartbeats composite index is void: "N
    playing" and the index were removed 2026-11-05.)

- [ ] **2026-11-01 — Friday check (Fast commits `a615925`..`65898ce`): one
  small tidy-up left.** `site-reviewer` found no student-visible bug at 1366×657.
  Fixed in the same commit as this note: Find results still showed "#30 - "
  (R1-5); the under-900px 560px cap for Chord Blitz / Fret Zap / Power Chord
  Switch lost to later same-specificity rules (R1-3); 1ca now also pins Every
  bar as Change Up's first speed button (R1-2, proved red by reversing both
  games); one stale coach.js comment and a 1ca flag still saying "sticky" (R1-4).
  - [x] **R1-1 — DONE 2026-11-01 (Jonathan: "fix the optional look to what you
    think is best").** The grey edge now follows the "Optional" tag: teacher flag,
    optional-in-its-data (ca-34, 35, 36, 37, 39, 42) and the board's "Who" picker
    all get it; a CAS student gets none (every card is optional for them);
    a finished card gets none. `const quiet = !done && !caStudentIsCAS() &&
    caIsOptional(a)` in `caActivityCardHtml`. `tools/smoke.mjs` step
    `optional-edge` renders 8 cases for real (red on the old code in 2 of them:
    data, who).
  - [x] Leftover old-behaviour comments — DONE 2026-11-02: styles.css's Change
    Up sticky-bar comment, tools/smoke.mjs's Change Up walk comment and its "in
    its sticky bar" summary label, and the ungrouped branch of
    `caStartHereTagHtml` (grep: its one production caller passed `grouped = true`;
    the function is now just the exit-check tag, and `grouped` is gone from
    `caHeroCardHtml`/`caHeroCheckHtml`). Went with it: the CSS rules
    `.ca-hero-tagrow` / `.ca-hero-from` and the i18n key `ca.checkNotFinished`
    (used nowhere else). Power Chord Switch's results screen is full width,
    left-aligned (Change Up's is a centred 560px column) — still so, on purpose.

- [ ] **2026-10-31 — Friday check (first run, a practice run): what it found
  and did not fix.** `site-reviewer-deep` (student-facing) and `site-reviewer`
  (Hear It First) read every commit on `main` from `1c1e6c6` to `59e7915`.
  No BLOCKER. Fixed in the same commit as this note: Note Call's power-chord
  done screen said "notes" / "Practica estas" over a list of chords (R1-2, two
  `ncp.*` keys, 1cd pin 16 → 18); a Hear It First phrase counted a note that
  timed out as "not graded", so playing 1 of 5 notes scored 100% (R2-2); Stop
  during placement counted as a session (R2-5); the e2e check "loads no
  trainer-core/audio/ui" had a `\\.` regex that could never match (R2-3); the
  CHANGELOG said the trainer opens "for one signed-in account" (R2-7).
  Waiting for Jonathan:
  - [x] **R2-1 (MAJOR, teacher console)** — DONE 2026-10-31, Jonathan chose to keep the profile in the cloud and skip his own uid: a Hear It First save creates
    `progress/{uid}` holding only `trainer` (`trainer-site-adapter.js:82`). If
    that is the teacher's own account, the console roster
    (`teacherFetchStudents`, `teacher.js:532`) shows a nameless row under
    Unassigned. Two fixes: skip the signed-in teacher's uid in
    `teacherFetchStudents` (a `teacher.js` change, always Reviewed), or keep the
    teacher's trainer profile local only (then it doesn't follow him between
    machines). Your call.
    **Shipped:** `teacherFetchStudents` skips the signed-in account's own
    document when the row it would draw is empty (no name, email or period, and
    nothing in skills, responses, games, classActivities or exitChecks). A
    test-student document under the same account is still listed (reported as an
    interpretation). The first version tested "only `trainer`" and the review
    found it stops working at the second page load: Hear It First runs in student
    mode, and every student-mode load runs `swap45Commit`, which adds
    `migrations.swap45`, so the real stub is `{trainer, migrations}` (R3-1).
    Check 1cf runs the real function: 8 documents x 6 sign-ins; broken six ways.
  - [x] **R2-4** — DONE 2026-10-31: `trainer-site-adapter.js` loads on every page but is listed in
    `SHELL_NOT_PRECACHED` (`tools/checks.mjs:98`), so offline page loads get a
    failed script request (console only). Fix = add it to `sw.js` `ASSETS`
    (sw.js code: always Reviewed). `checkPrecacheCoverage` reads only `img/`
    and `.html` references, not `<script src>`.
    **Shipped:** the adapter is in `sw.js` `ASSETS` (88 assets) and off
    `SHELL_NOT_PRECACHED`. `checkSwAssets` also fails when a script that
    `index.html` loads on every page (comments stripped; 10 today) is not in
    `ASSETS`: the two lists alone let the original bug come back in one edit
    (review R3-4; shown with the adapter and with `live-quiz.js`).
  - [x] **R2-6** — DONE 2026-10-31: Hear It First's "Last session" date and decay days are UTC
    (`dayStr`, `trainer-core.js:87`), so an evening session shows tomorrow's
    date. A local-date `dayStr` makes `trainer-sim` U12 fail under
    `TZ=America/Los_Angeles` (its `BASE` is UTC midnight), so the sim needs a
    noon `BASE` in the same change.
    **Shipped:** `dayStr` is the local date; `trainer-sim` `BASE` is noon UTC and a
    new unit U12b pins the local date. The sim passes under
    `TZ=America/Los_Angeles`, `TZ=UTC` and `TZ=America/New_York`; it fails under
    `TZ=Pacific/Auckland` (UTC+13), which the `BASE` comment says.
  - [x] **R1-1** — DONE 2026-10-31: on ca-43's two-fret cards (E5 low E, A5 on A: frets 0 and 12) the
    mic usually credits fret 0 when the student plays at fret 12 (the octave
    below is fret 0's root). Score is right; the fret named is wrong. Fix idea:
    name and mark both frets ("fret 0 / 12") on a mic hit; check 1cd's
    ncListen expectations change with it (changed check logic: Reviewed).
    **Shipped:** a mic hit on a two-fret power card names and marks both frets
    ("fret 0 / 12"); a tap, a one-fret card and single notes are unchanged. 1cd
    now checks every mic hit carries the flag, and runs the real `ncResolve` and
    the real `ncTap` (scored and play-along) on a two-fret power card, a one-fret
    card and a two-fret single note, EN + ES, reading back the text and every
    `flashClass` call (which marker, which string, which colour). Broken ten
    ways, four of them found by the review (R3-3) that an earlier version missed.
  - [x] **R1-3** — DONE 2026-10-31: Change Up's setup at 1366×657: the −5/+5 row is now fully below
    the screen and Start is lower (80px charts from `639248b`). Power Chord
    Switch's sticky Start bar would fix it, but check 1ca pins "Change Up must
    stay as it was". Your call.
    **Shipped:** Change Up's Start is in the same sticky bar; the 1ca pin now says
    so on purpose; a new smoke walk measures it at 1366×657 in five views. The
    −5/+5 row is still below the first screen (only Start is pinned).
  - **Check 1cd blind spot:** it only sees strings asked for through `ncK()`,
    which is how R1-2 got past it; a direct `t('nc.*')` on a power screen is
    invisible.
  - **Should not have shipped Fast:** `639248b`, `6871747`, `b3a351c`,
    `cb3dc5e` (mic detection) and `5e2061e` (new check 1cc). Reviewed now.
  - The 2026-10-30 item below: the reviewer pass is done (findings above);
    the look at the LIVE site in a real browser is still not done, so it
    stays open.

- [ ] **2026-10-31 — For the cloud review: pushed without a reviewer.**
  Jonathan asked for everything to be pushed and reviewed in the cloud. The four
  code commits below carry `Review: Fast` so the Friday check also finds them.
  - **On `main`, after `66266c9`:** `ca-43 Note Call: the mic hears a strummed
    power chord`, `...review fixes — Start works without coach.js...`,
    `Power Chord Switch: Start stays on screen...` and `ca-43 Note Call: the mic
    no longer accepts the 5th`. `coach.js` is a danger-zone file and was edited
    (`coachPowerTargets` moved to `app.js`; Riff Runner's `rnwTargets` calls it).
    Look for: any page or worker that loads `coach.js` without `app.js` (only
    `index.html` loads it, and it loads `app.js` too); Note Call's Start with no
    `coach.js` (tap mode); `ncClash`/`ncDeal` with a pool of 1-3 cards; whether
    check 1cd and the fresh-page walk in `tools/smoke.mjs` go red when the
    original bug comes back (1cd was broken three ways by hand; the smoke walk
    was not mutated).
  - **What was run:** full `node tools/checks.mjs` passes at the tip. The browser
    smoke test passed at the tip, 0 errors against 9 on `origin/main` (the first
    run hung for 29 minutes at 0% CPU and was killed; the second passed). The mic
    sims on the real files, 20 trials, show no STOP row at any of the three
    guitar sounds. **Not run:** a reviewer (one was started and stopped before it
    reported), a look at the live site, a real guitar through a Chromebook mic.
  - **Jonathan's call, 2026-10-31:** Note Call no longer accepts the 5th. Kept,
    a wrong chord a 5th above the card counted right 7.7% / 28.9% / 100% at the
    std / mid / weak sound. Dropped, 0 of 1040, and all 15 right-strum rows are
    unchanged. An earlier question to Jonathan said dropping it "would miss more
    right strums"; that was not measured and the sims showed it was wrong.
  - **Weak spots left alone:** at the std sound a strum with the root string much
    quieter is heard 67.1% of the time, and a two-string root + 5th 65.4%.
    Riff Runner's Wait Mode still takes the 5th, so a chord a 5th above passes
    there too (not measured).
  - **Branch `phase5-sw-audio` was merged to `main` on 2026-10-31** (Jonathan:
    "push it", after the review below and its fixes; fast-forward, so the
    branch's commits are on `main`, including the early one whose subject says
    "NOT REVIEWED, NOT ON main"). It changes `sw.js` (always
    Reviewed): one stable audio cache, a per-file hash map written into `sw.js`
    by `tools/checks.mjs`, an eviction pass at activate, and a one-time migration
    so the first deploy re-downloads nothing. New: `tools/sw-audio-map.mjs`,
    `tools/sw-audio-proof.mjs` (runs the real `sw.js` against a stand-in cache:
    39 assertions, 13 deliberate breakages all caught) and check 1ce. The proof
    found one bug, fixed: a cached track was refetched on every play and stored
    over under the current hash. Review before merging: `AUDIO_MIGRATION_FP` must
    equal the live audio fingerprint (check 1ce and the sync check enforce it),
    `AUDIO_CACHE` must keep its name, and what a half-failed install, a quota
    error or two tabs on two worker versions do to the records. The brief for
    phase 5 was lost in the crash; this was built from the code comments, so check
    it against what Jonathan wanted.
    **Reviewed 2026-10-31 (`site-reviewer-deep`, real headless Chrome with a
    GitHub-Pages-like server; 61 live deployments checked).** The merge deploy
    itself is correct: 0 audio re-downloads, the right bytes, 77 of 77 hashes
    match the live files, and a brand-new student stores each track with its
    record. Fixed on the branch: a CRLF `sw.js` (a Windows checkout) failed the
    checks (R1-1); a rollback round trip lost the "already adopted" marker and
    then vouched for the wrong bytes for good (R1-2: the marker now lives in
    `AUDIO_CACHE`, which the old worker keeps); `AUDIO_MIGRATION_FP` set to the
    NEW fingerprint passed every check (R1-3: it may only be `''` or the
    fingerprint in `AUDIO_CACHE`'s name); the proof missed a stored 404 or
    foreign answer, a commented-out pin and a renamed records cache (R1-4); stale
    comments and docs (R1-6). Proof now 50 assertions in 11 scenarios, 21 of 21
    breakages caught. **Left on purpose (R1-5):** a student who does not open the
    site while the merge deploys loses every track at the next audio deploy (as
    before this branch); the migration is a one-time adoption.
    **Done at the merge (2026-10-31):** no `audio/` change on `main` since
    `ff9e913a6d`; the live `AUDIO_CACHE_VERSION` equals the branch's `AUDIO_CACHE`;
    full checks, the audio proof and smoke passed on the tip. **Still to do after
    it deploys:** `node tools/checks.mjs --live`; and **the next push that changes
    `audio/` must set `AUDIO_MIGRATION_FP` to `''` first** (never to the new
    fingerprint; check 1ce fails otherwise).
    **Merge checklist (kept for the record):** (1) `git fetch`; if `audio/` changed on `main` since
    `ff9e913a6d`, the live cache name is no longer `AUDIO_CACHE_NAME`: set
    `AUDIO_MIGRATION_FP` to `''`, expect one full re-download, and re-pin the
    name in `tools/sw-audio-map.mjs` deliberately; (2) `node tools/checks.mjs`,
    `node tools/smoke.mjs --baseline origin/main`; (3) after the push,
    `node tools/checks.mjs --live`; (4) never roll `sw.js` back past this merge
    without the rollback step in `.claude/skills/audio-and-snippets/SKILL.md`.

- [ ] **2026-10-30 — Everything pushed in a hurry today needs to be checked.**
  Jonathan had to reboot the machine, so the last pushes went out with the
  checks and the browser smoke test but no reviewer pass, and no one looked at
  them on the live site. Check each item in a real browser on the live site, in
  English and Spanish, at 1366×657. Then run `site-reviewer` on the commits.
  - **Power Chord Switch** (`d4544a3`, `1c3062b`, both sent as "Fast"). It now
    opens on "Every beat"; the speed row and the tempo buttons sit above the
    chord choices; "Two random chords" is the first choice and is selected; the
    3- and 4-chord loops are gone (11 pairs left); the chord charts are 180px.
    Try: a random round, "Every bar" and "Every 2 beats", the −5 / +5 tempo
    buttons, a fixed pair, the done screen and its "pick a different loop"
    button, and that Change Up still looks the same.
  - **Watchtower play-alongs, Jimi Hendrix / Neil Young switch** (four large
    mp3s). It was committed in an earlier session and pushed today after a
    rebase onto 12 newer commits. The rebase had conflicts in `CHANGELOG.md`
    and `sw.js`, fixed by hand (`sw.js` took GitHub's version line and the
    full checks re-bumped it). We could not tell whether the original commit
    had a reviewer pass. Try: the switch on `ca-26`, `ca-29` and `ca-40`; the
    choice survives a reload; both recordings play; the Guitar on / off switch
    works on both; the lyric sheet card stays on Jimi Hendrix.
  - **Branch `wip/main-folder-2026-10-30` is NOT on `main` and is not live.**
    It holds the uncommitted edits that were sitting in the main folder
    (`C:\Users\jhoffman\Documents\GitHub\guitar-class`), pushed so Jonathan can
    work on them from another machine. They look like review fixes to the
    Watchtower switch: `caTeacherRedraw` (a switch on `ca-40` in the teacher
    console swapped the room's projector card for the Class activities page;
    review R1-1), the recording-switch inline handler now uses `jsonAttrArg`,
    corrected lap counts (lap 82 holds the A, Part 8 is 11 laps, 86 laps in the
    file, laps 70-74 not confirmed), `songVersions` renamed to
    `recordingVersions` in comments, a clearer Neil Young caption, matching
    pins in `tools/checks.mjs` and `tools/smoke.mjs`, and a `song-facts` note.
    **Update (Friday check, 2026-10-31): `main` already has these fixes** — they
    shipped as `158015d` (`git diff origin/wip/main-folder-2026-10-30 158015d` on
    the code files is empty). Don't ship the branch; it can be deleted.
    Status of the branch: based on `main` at `6b120f8`; the full checks pass
    (cache version bumped); the browser smoke test and a reviewer pass were NOT
    run. To ship it: check it out, run
    `node tools/smoke.mjs --baseline origin/main`, ask `site-reviewer`, then
    fast-forward `main`. The untracked `tools/__pycache__/` was left out (a
    Python cache, not in `.gitignore`).
  - **The main folder itself** still holds those same edits, uncommitted, on an
    old base (12+ commits behind). Its one local commit (`5634815`) is on
    GitHub as `5e2061e`. Once the branch is safe on GitHub, the folder can be
    moved to `origin/main` (`git stash`, `git fetch`, `git reset --hard
    origin/main`); the stash keeps the edits as a second copy.
  - **Two leftover worktrees** to remove: `guitar-class-pcs` (branch
    `power-chord-switch-beat`) and `guitar-class-wt` (branch
    `wip/main-folder-2026-10-30`). Leave them first (PowerShell's folder), or
    the empty folder stays locked.

- [x] **2026-09-15 "the cure" both-strings root line — plan at
  `archive/PLAN-unit-2-assessment-site-v2-2026-09-15.md`.** Verse+chorus root
  line now crosses the low E and A strings — A(low E 5) C(A 3), F(low E 1)
  C(A 3); D(A 5) F(low E 1), C(A 3) G(low E 3), one hand position (index 1,
  ring 3, pinky 5), matching Layer 3's existing power-chord roots. Updated
  in Journey Layer 2, `ca-13` (retitled "Verse and Chorus Roots," all six
  rungs rewritten), and Module 2's "the cure" challenge card; the old
  low-E-only verse survives as the Level up everywhere. Unit 2 assessment
  text (Assessments page, `mr2-s7`, `assessItems`) now reads Watchtower
  (low E) + SNA (A string) OR "the cure" both-strings, at song tempo with
  the backing track; practice cards ladder 60 → 100 BPM → track. Watchtower
  and SNA challenge titles now name their string. Pushed `6e73cd9`, checks
  green, deploy-verified live. **Hit the plan's own stop condition**
  (figure needs two strings marked, the CLI only did one) — Jonathan chose
  extending the diagram library over the other options offered; `guitar-
  diagrams.js`/the CLI gained `localStringMultiNotesSvg`, a real two-string
  notes renderer, used for the new `img/ca-cure-roots-both.svg`. The
  retired `ca-cure-roots-verse.svg` had no actual "archive" exception in
  checks.mjs (the plan assumed one that didn't exist) — kept in use by
  wiring it into `ca-13`'s Level up rung instead of deleting it or leaving
  it orphaned.

- [x] **2026-09-12 Fretboard Tap — work order at
  `OPUSPLAN-fretboard-tap-2026-09-12.md`.** `type:'fret'` live-quiz
  questions; `fret-lowE` (Phase 1), `fret-lowE-A` + `fret-all` (Phase 2).
  Both phases pushed to `main`, checks green. Deferred, not rejected: a
  chord-builder (multi-dot) type; a per-student tap breakdown on the
  console; sharp/flat targets.

- [x] **2026-09-09 exit checks — work order at
  `exit-checks-work-order-2026-09-09.md`.** Engine + `ca-14` (Phase 1),
  `ca-15` + docs (Phase 2). Both pushed to `main` and deploy-verified.
  The ratchet shipped as **1y**, not the 1x the order named — `1x` was
  claimed the same morning by db377ce (orphaned assets), which is the
  argument for reading `checks.mjs` before reserving a letter. Deferred,
  not rejected: a console toggle for `retake` (today it's a data field);
  a `chordName` item type; a per-class average on the Students view;
  adding the `kind:'check'` schema to the `guitar-class-activity` skill.

- [x] **2026-09-05 site audit — work order at `OPUSPLAN-site-audit-2026-09-05.md`.**
  **All six phases are done and pushed** (four commits, one per phase group).
  The plan's closing section lists the handful of items deliberately left
  undone and why. **Merged to `main` 2026-09-05**, and two of the three
  deferred items landed after the merge: the Mood chart is now fully
  bilingual (230 phrases; English stays the lookup key so `DATA.defs` /
  `DATA.hear` still resolve), and dark-mode figures flip the SVG line art
  (invert + hue-rotate, so the green note dots stay green) while photos
  keep the gentler dim. Still open on purpose: caching `config/class` in
  the teacher console (needs the live console to prove a post-write
  repaint from a plain one), per-key save dirtiness, and Note Hunt's
  colour-only round dots. `CHECK-BEFORE-YOU-TRUST-IT-2026-09-05.md` is
  the running list of what still needs Jonathan's eyes — the Mood chart's
  Spanish above all, since nothing on his side reads it.
  A Claude Code on the web session ran `checks.mjs` (all offline checks
  green), a headless-Chromium walk of all 36 sets in EN + ES plus the 16
  games (no renderer exceptions), an adversarial read of the app JS, an
  HTML/CSS/contrast/PWA pass, and scripted EN↔ES and music-theory checks.
  Six phases, bugs first: the dev-bypass `flushSave` crash (confirmed
  live), the bare `IS_TEACHER_MODE` read in the auth callback, the
  warm-up-section title that every progress key silently depends on, the
  SW auto-reload that can discard in-flight saves/recordings, two regex
  lookbehinds that break Safari < 16.4, the phone-width play-sequence
  overflow (confirmed at 375 px), then rules hardening (one item needs
  Jonathan's call on restricting sign-in to `seq.org`), modal focus
  management, four dark-mode contrast failures, precache size (a 1.9 MB
  PNG + all-or-nothing `addAll`), and lazy-loading `teacher.js`/`coach.js`.
  Three new checks.mjs ratchets are specified. The YouTube link check and
  `--live` could not run from the cloud (proxy 403) — do them locally.
  **Phase 1 landed 2026-09-05**: the dev-bypass/offline `flushSave` crash, the
  bare `IS_TEACHER_MODE` read, the warm-up-title-dependent progress keys (all
  27 sections now carry `kind:'tuning-warmup'`, ratchet 1r), the SW reload now
  waiting on live drills/recordings and flushing queued saves first, both
  Safari-breaking regex lookbehinds (ratchet in check 0), the teacher
  drill-gate drift, and the phone-width overflow of the play/Coach buttons,
  the About panel and the rail drawer. Verified in headless Chromium — see the
  plan's Phase 1 section for what each test showed. **Caught in passing:**
  moving `IS_TEACHER_MODE` into app.js broke the render smoke test's stub, and
  0b only *warns* when its harness fails to load, so the check went silently
  untested while everything else stayed green — stub fixed, and promoting that
  warning to a hard failure is now a Phase 6 item.

- [x] **2026-07-26 deep site audit — remaining backlog.** Three parallel
  agents (core app JS · modules 8–13 · modules 1–7) plus a live browser pass
  found ~90 issues beyond what `tools/checks.mjs` can catch. All 9 Critical
  and 7 Medium items are fixed and pushed (`bc757ae`) — section-index desync,
  Coach mic race, Smoke on the Water strings, the major/minor rule, the
  pinky/3rd-finger contradiction, the Sweet Child TAB octave error, the
  Module 8/12 Travis-picking contradiction, the self-answering Module 11
  drill, the backwards Spanish TAB explanation, the tuner high-e bug, the
  save-retry loop, teacher-dashboard error mislabeling, the untranslated
  `{bpm}` string, several Module 6 mismatches, `img/` missing from the cache
  fingerprint, and SW audio caching. **A later 2026-07-26 session worked the
  rest of this list** — content errors, skill-tag mismatches, i18n gaps,
  paper-drill remnants, `gotItWhen` coverage, song-list inconsistencies, and
  every item in the app.js/coach.js/tuner.js/teacher.js code group are now
  fixed (unpushed as of this edit — run `node tools/checks.mjs` before
  pushing). **Closed out 2026-07-27** (via a workflow with a built-in
  adversarial review per fix group — see each item below for what it
  actually caught): the four dedicated single-chord cards; the module-4
  pull-off/slide gloss inconsistency; the `module-9.js`/`module-11.js`
  list-vs-prose spots (turned out already fixed by `eeefbda`, just
  undocumented); and the degenerate one-`<li>` list sweep (turned out not to
  be a bug at all — see that item). **Still genuinely open, on purpose:**
  the `m5w4` Full Run card's missing Journey chip (no single static link
  obviously fits a card that references whichever of three songs the
  student picked); the three items below still marked for Jonathan
  specifically (list-sweep over-listing check, Coach gate real-guitar test,
  Note Runner real-guitar test) — all three need his eyes/hands, not more
  code. Grouped by file so a session can take one group at a time:

  **Content — promises content the set doesn't teach (Jonathan flagged this
  one as next priority):** ⚠️ **Important finding while working this section
  (2026-07-26):** `objective` and the whole `assessment` object
  (`goal`/`performance`/`selfCheck`/`standards`) were **dead fields** —
  `buildAssess()`/`buildVideos()` in `app.js` are defined but never called
  anywhere, confirmed by grep. So most of this category's "promise" was
  never actually shown to a student — only the live fields (`subtitle`,
  and the `skills[]` checklist itself) matter. **Resolved 2026-07-26:**
  removed the dead `objective: 'I CAN…'` field entirely — all 36 occurrences
  across module-1.js…module-13.js, plus the now-pointless `checks.mjs`
  validation for it (`skillFocus`/`unit` already cover that ground live, per
  the `buildSet()` comment in app.js). `assessment` (`goal`/`performance`/
  `selfCheck`/`standards`) was left in place at the time — still dead
  code-wise, but Jonathan confirmed its content (which songs/chords are
  assessed) was meaningful to him even unrendered. **Reversed 2026-09-02:**
  asked again, and Jonathan chose deletion — all 35 blocks removed across
  `module-1.js`…`module-12.js` (m13w1 never had one). Nothing student- or
  teacher-facing changed, because nothing ever read the field; the text is
  recoverable from git if it is ever wanted. The assessment content that
  DOES render is `MODULE_REVIEWS[n].assessItems` / `.standards` in the
  Module Review — a different, per-module object, untouched.
  - [x] `module-5.js` (m5w2) — Dm and G/B now have real teaching content:
        two new challenge cards ("Fret Dm cleanly", "Play the G/B bass
        turnaround") with diagrams, hint/stuck/levelUp prose, and two new
        skills (`m5w2-s7`, `m5w2-s8`), inserted right before the "the cure"
        song card so the shapes are taught before they're used. Confirmed
        real (not dead-field only): Jonathan wants "the cure" performable as
        one of the three Module 5 assessment song options, and Dm/G-B are
        needed to actually play it. `config-main.js` skillCount 5: 24→26.
  - [x] `module-7.js` — m7w2's `objective` trimmed to drop the B-major
        overreach (dead field, but cheap to fix). m7w3's three conflicting
        A-shape chord lists (subtitle "Bb·B·C" / skill+assessment "Bb·C·D" /
        actual drill "C·D·E") unified on **C·D·E** — matches the live
        `subtitle` and the actual "A-Shape Slide" challenge card content.
        Fixed in `subtitle`(_es), skill `m7w3-s4` (text/gotItWhen/practice —
        this one's a live checklist item, not a dead field), the dead
        `assessment.goal`(_es), and `MODULE_REVIEWS[7]` `mr7-s5`. B major
        itself is fine as-is — it's genuinely taught in m7w3 Challenge 1,
        just via the A-shape, not the E-shape m7w2 had overpromised.
  - [x] m5w2's individual chords (C, F, G) and m5w3's A major each now have
        their own single-chord "Fret X cleanly" challenge card, matching Set
        1 (Am, Em) and Set 3 (D, Bm) — same voice/structure as those and the
        Dm/G-B precedent (`<ol>` body, hint/stuck/levelUp, a chord diagram
        reusing the fingering already taught elsewhere in the file), linked
        to the existing `m5w2-s1/s2/s3`/`m5w3-s2` skill ids (no new skills,
        no `config-main.js` change). Fixed 2026-07-27 via a workflow with a
        built-in adversarial review: the reviewer caught a real
        self-contradiction in the new "Clean F (simplified)" card's `hint` —
        it told students to "arch the finger at the very tip" while
        describing a 2-string mini-barre, which needs a flat finger, not an
        arched one — corrected before landing. Browser-verified (dev bypass,
        both languages): all three new Set 2 sections and the new Set 3
        section render in sequence with the existing dedicated-chord cards,
        list + trailing "You've got it when" render correctly, chord
        diagrams display, no console errors.

  **Content — factual/consistency errors (module-1–7 agent):**
  - [x] `module-5.js:41-57` vs `:258-261` — "X above a string" MC keyed two
        contradictory ways ("don't play it" vs "mute it"). Both now say
        "skip it" — no more "mute it" alternative.
  - [x] `module-5.js:434` — sends students to find a shared pivot finger
        between C and G that doesn't exist in this module's shapes (own
        `:484`/`:589` admit it). `levelUp` now points at Am↔F instead.
  - [x] `module-5.js:955` — "all six strings ringing clean" on a D/C chord
        pair that only uses 4–5 strings. Reworded to "every string you
        strum ringing clean."
  - [x] `module-4.js:1010` — composition example mixes major- and
        minor-pentatonic scale degrees; unplayable as written. Rewritten to
        `1 ♭3 5 ♭3 | ♭7 5 ♭3 1` — consistent minor-pentatonic degrees.
  - [x] `module-2.js:770-780` and `:263`/`:247`/`:258` — SNA riff described
        three ways on one card; three different pass thresholds for one
        drill ("9 in a row" vs "10 in a row" vs "9 of 10"). All instances
        (drill text, assessment `performance`) now read "9 of 10."
  - [x] `module-2.js:283` (EN) / ES twin — "one octave up" from low-E fret 7
        is actually a 4th, not an octave. Now says "a fourth higher."
  - [x] **DECISION MADE 2026-07-26:** `module-6.js` — "Knockin' on Heaven's
        Door" was **rewritten to the real bar lengths**
        `|G|D|Am|Am|G|D|C|C|` (Am and C each hold two bars), not just
        re-labeled — `text`/`stuck`/`levelUp` and the `MODULE_SONGS[6]`
        meta line all updated. Chose "teach it right" over "label the
        simplification," the opposite of "the cure"'s power-chord
        treatment (Jonathan's call for this song).
  - [x] `module-1.js:60` — `explain` references a "wiping the strings"
        choice that doesn't exist among the MC options (leftover text).
        Sentence removed.
  - [x] `module-1.js:650` — `w2-s3` choice "All of the pick" accidentally
        matches the `MC_PINNED` "all/none/both/neither of" regex and never
        shuffles position. Reworded to "The whole pick, gripped at the
        edge" — no longer matches the pin regex.

  **Content — mis-tagged/missing skill links (module-1–7 agent, not
  individually verified, spot-check before batch-fixing):**
  - [x] `skills:[n]` pointing at the wrong skill id: `module-4.js:67, 554,
        919, 988`; `module-3.js:504, 687`; `module-5.js:804, 823, 945,
        1104, 1198, 1219, 1240`; `module-6.js:82, 247, 265, 299, 460, 476,
        561, 579, 598, 794`; `module-7.js:166, 464, 872`. Knock-on: 8
        skills across M1–7 are tagged on no step at all, so their "📍 Show
        me where" button silently disappears — `w1-s2, w1-s3, w2-s1, w2-s2,
        w2-s3` (module-1), `m2w1-s4, m2w1-s5` (module-2), `m5w4-s4`
        (module-5). All corrected/added — every referenced line now points
        at a real skill id, and the 8 previously-orphaned skills are each
        tagged on at least one step.

  **Content — i18n drift and Spanish glossary (all three agents):**
  - [x] `module-2.js:265` — EN levelUp says "run the Shuffle deck"; ES says
        "haz el ejercicio de papelitos" (paper slips) — the pre-digitization
        version. ES now matches EN.
  - [x] `module-1.js` — 8 "You've got it when:" standards live inside
        `hint:` instead of `text:`, where `wrapGotItWhen` can't reach them
        (`:37-437`, spot-check each). Modules 2–7 have zero instances of
        this — Module 1 only. All 8 moved into `text`/`text_es`.
  - [x] `module-10.js:737/738` — ES `levelUp` says something different from
        EN (tells the student to "ask someone to call out keys" — a
        pre-digitization partner-drill leftover). ES rewritten to match EN
        ("name the fret before the card finishes turning").
  - [x] `module-12.js:256` — `text_es` keeps an English link label
        ("Station B's Travis pattern lesson video") instead of using
        `nav.stationBTitle`. Translated inline.
  - [x] Solfège-vs-letter convention slips (`cuerda B` should be `cuerda
        Si`, etc.): `module-5.js:571, 588, 703, 705`, `module-3.js:370`;
        conversely `module-3.js:368/370` solfège-izes a chord name (should
        stay a letter). Module-9's known ~30-instance version of this is
        already logged separately — don't re-sweep it. All 5 corrected
        (module-3's "Mi mayor" → "E mayor" for the chord name, plus its
        "cuerda B" → "cuerda Si").
  - [x] Minor ES inconsistencies: "Ear Spark" translated two ways in
        `module-2.js:333` vs. 19 other instances — **fixed**, both now say
        "Chispa auditiva." `module-4.js:~807` (inside `m4w2-s3`'s practice
        MC) glossed "pull-off"/"slide" inconsistently — **fixed 2026-07-27**:
        the ES choice for "snap your finger off the string sideways" had
        been mistranslated as "deslizando" (sliding), the site's word for
        the *slide* technique, not pull-off; corrected to "sacando … de un
        tirón hacia el costado," matching module-7.js's own canonical
        pull-off gloss. A few other small ones the module-1–7 report lists
        under "Minor ES" weren't individually re-checked either.
  - [x] `module-2.js:704, 721` — TAB `phrases[].label` is English-only and
        the renderer (`app.js:694`) uses `escHtml` not `tf()` for it — needs
        a renderer fix, not just a data fix. Module 2 is the only module
        using `phrases:`. Renderer now does `escHtml(tf(p,'label'))`, and
        both Happy Birthday phrase labels got `label_es` twins.

  **Content — paper-drill remnants that should be digital decks (project
  rule: no scissors/index cards/pen anywhere student-facing):**
  - [x] `module-2.js:226` — draw shuffled fret slips, right above the
        digital deck that already does this. `levelUp` now points at the
        Shuffle self-quiz deck instead.
  - [x] `module-3.js:187, 233, 369` — homemade flashcards / paper slips;
        Module 3 has zero `drill:` widgets despite Challenges 3–5 being
        textbook `deck`/`shuffle` cases. Now has 4: a new `deck:
        'power-chord-shapes'`, two `shuffle` drills (low-E and A-string
        roots), and `deck: 'e5-vs-emajor'` for the Ear Spark card.
  - [x] `module-5.js:740, 1017` + `MODULE_REVIEWS[5].assessItems` — shuffle
        homemade chord flashcards (a textbook `deck` case). New `deck:
        'chords-group1'`/`'chords-m5'` cards added; performance/assessItems
        text now says "run the chord deck."
  - [x] `module-8.js:571-578` — the one Ear Spark on the site with no
        `drill:{type:'ear'}` wiring; needs a new `EAR_POOLS` entry (neither
        existing pool covers "A-string vs D-string bass under Am"). New
        `amBassAD` pool added to `EAR_POOLS` in app.js and wired in.
  - [x] `module-9.js`, `module-10.js`, `module-11.js` — several
        assessment/performance fields still say "shuffle flashcards" /
        "draw a slip" even though the matching digital deck already exists
        a few lines away (`module-9.js:503,518,519,731,788`;
        `module-10.js:519,818`; `module-11.js:681,771`). Also leftover
        partner-dependency lines: `module-9.js:439,712,1062,1068`,
        `module-10.js:750,774`, `module-11.js:777`. All reworded to
        reference the existing deck/drill; a re-grep of all three modules
        for "flashcard/papelito/Got someone/partner" now comes back clean.
  - [x] `module-2.js:252` — the one card in M1–7 with a `drill:` that still
        keeps the "Got someone around?" partner line the project rule says
        to drop once a card has a deck. Line removed.

  **Content — coverage gaps (module-8–13 agent):**
  - [x] `gotItWhen` is blank on ~57 skills across Modules 10–12 (module-9 is
        partially thin too) — coverage is ~75% in Modules 1–8 and craters to
        4-10% in 10–12. Full id list is in the agent's report (already
        summarized in this session's chat log — re-run the module-8–13
        review agent if that transcript isn't handy, rather than
        re-deriving by hand). Verified 2026-07-26: every skill in Modules
        8–13 now has a `gotItWhen`/`gotItWhen_es` pair (0 missing, checked
        programmatically).
  - [x] `module-12.js` — `MODULE_REVIEWS[12].forward` never mentions
        Module 13, so a student finishing Module 12 is told the course is
        over. `forward`/`forward_es` now describe Module 13 before the
        capstone-performance paragraph.
  - [x] `practice.label` i18n holes the checker can't see (only validated
        for `type==='playSeq'`, but `fretboard`/`chord` types render it
        too): `module-9.js:514,517,784,787,790`, `module-11.js:902`. Same
        gap exists sitewide (module-2 ×3, module-5 ×1, module-7 ×4) — worth
        fixing `tools/checks.mjs`'s scope, not just the data. Both fixed:
        `checks.mjs` now requires `label_es` for `fretboard`/`chord` too,
        and all the flagged data locations (module-2 ×3, module-5 ×1,
        module-7 ×4, module-9, module-11) got their `label_es`.
  - [x] `module-9.js:970-990` — a "7th-position" cold-read line actually
        spans frets 5–10 (six frets); either it's really 5th position with
        a stretch, or drop the position-number claim. Reworded to "5th
        position with a stretch up to fret 10" throughout (text, hint,
        tab caption, playSeq label).
  - [x] `module-8.js` — Sets 2 and 3 (`m8w2`, `m8w3`) are missing the
        "Warm-up — tuning check" section every other set in Modules 1,
        9–12 opens with. Both sections added.
  - [x] `module-8.js` — `MODULE_REVIEWS[8].skills` ids skip s5/s6
        (`mr8-s1,s2,s3,s4,s7,s8,s9`) — harmless (ids are just storage
        keys) but suggests two review rows were deleted without
        renumbering. Renumbered to `s1`–`s7` with no gap.

  **Content — list-vs-prose rule (cards over ~200 chars with more than one
  action, still written as a paragraph — project rule says these should be
  `<ol>`/`<ul>`):**
  - [x] `module-11.js:856` (386 chars, no list) and `module-9.js:82` vs its
        sibling `:92` (inconsistent — one's a list, one isn't) plus
        `module-9.js:351` — **turned out already fixed** (checked
        2026-07-27): commit `eeefbda` had already converted all three, its
        own commit message and this line just never got updated to say so.
        Verified by diffing `eeefbda` against its parent — all three are
        correctly `<ol>`s in EN+ES, original wording preserved, nothing left
        to do. The line-856 citation itself had also drifted with later
        edits (the real card is now ~line 878). `module-13.js:188, 248, 298, 310, 324` (all multi-action
        prose in a module where every other procedural step is a list) —
        **fixed**, all 5 converted to `<ol>`/`<ul>`. `module-10.js:148, 422,
        718` (warm-up tuning cards, prose here but `<ol>` in every other
        module) — **fixed**, all 3 converted (module-8's two new warm-up
        cards were also written as lists from the start). Lower-confidence/
        optional per the agent: module-8.js:35,361; module-9.js:36,109;
        module-10.js:93,629; module-11.js:36,51,312; module-12.js:428,637;
        module-13.js:207 — mostly "Watch X, then Y" cards, which are prose
        sitewide by convention; left alone as recommended.
  - [x] **Closed 2026-07-27 — turned out not to be a bug.** Degenerate
        one-`<li>` `<ul>` lists (renders as a lone bullet): the backlog's
        ~19 locations (`module-8.js:183`, `module-9.js:433,693,958`,
        `module-12.js:147,166,202,224,482,501,519,537,748,766,822`) are
        every one of them a **Challenge card** (`Challenge N — Title:`),
        and CLAUDE.md's Challenge-card rule is explicit that these are the
        one place the "single actions stay prose" carve-out does NOT
        apply — "the body is always a list" and "a card that already had a
        list keeps it byte-for-byte," full stop, regardless of length. A
        fix agent unwrapped all 11 real locations (module-8.js:182,
        module-12.js: nine spots) to prose on the reasoning that a
        single-action list looked degenerate; an adversarial review agent
        caught it against CLAUDE.md's own wording and every location was
        reverted (`git diff --stat` confirmed both files byte-identical to
        HEAD). Separately checked module-9.js's three citations by hand:
        `:433` and `:693` are also Challenge cards (same rule, left alone);
        `:958` was already a stale citation even before this session — that
        line is now a section boundary with no list at all. **Net: nothing
        on the site needed changing** — the original backlog item
        misapplied the list-vs-prose rule to cards the Challenge-card rule
        exempts.

  **Content — song-list inconsistencies:**
  - [x] `MODULE_SONGS[2]` omits Let It Be though `m2w2.songThread` links its
        Layer 2; `MODULE_SONGS[3]` omits "the cure" though m3w2 has a full
        challenge + thread entry. Both added as Core rows.
  - [x] `MODULE_SONGS[7]`'s Seven Nation Army is `type:'Core'` but has no
        `journeyUrl` — the only Core row site-wide with no 🧵 button.
        `journeyUrl: 'tabs/seven-nation-army.html'` added.
  - [x] `MODULE_SONGS[6]` demotes Let It Be to `type:'Choice', core:false`
        in the one module that builds a challenge on its verse. Promoted to
        `type:'Core', core:true`.
  - [x] Five core-song challenge cards lack the inline Journey chip their
        siblings have: `m2w2` "the cure"/"Let It Be", `m4w2` "the cure",
        `m5w2` "the cure", `m5w4` Full Run. **All 5 now fixed.** `m5w4` Full
        Run (`module-5.js`, Challenge 4) was the holdout — it names whichever
        of three songs the student picked, not one fixed song, so a single
        static chip didn't fit. Resolved 2026-07-27 (Jonathan's call): dropped
        the card's separate "optional: play your performance song" step
        (that concept still lives elsewhere in the Set, e.g. "Map your
        performance song's chords") and reworded the assessment step to "Pick
        one of the three core songs," linking each song name inline to its
        own Journey page (`tabs/let-it-be.html` / `tabs/luna.html` /
        `tabs/the-cure.html`) rather than one trailing chip. EN/ES both
        updated; `checks.mjs --skip-links --check` passes.
  - [x] `module-6.js:1044`-ish gives "Happy Birthday" Let It Be's
        progression (C–G–Am–F — Happy Birthday has no Am); `module-5.js`
        gives SNA "D–A–Em" when the site's own Layer 5 page teaches
        Em–G–D–C. Happy Birthday corrected to C–F–C–G–C; SNA corrected to
        Em–G–D–C (EN and ES both, in the `meta` line).

  **Code — app.js / coach.js / tuner.js / teacher.js (all fixed
  2026-07-26; full original detail was in that session's chat transcript
  from the core-app review agent):**
  - [x] `tuner.js` `startTuner()` is fire-and-forget — closing the tuner
        popup while `getUserMedia` is pending can orphan a live mic stream.
        Fixed with a `tunerStartToken` counter — a stream that resolves
        after `stopTuner()` bumped the token is recognized as stale and
        stopped immediately.
  - [x] `app.js` Shuffle Drill: resetting mid-round leaves a pending
        `setTimeout` that fires against a rebuilt (differently-shaped)
        state and throws; also its countdown `setInterval` is never
        cleared on `activateSet` navigation, leaking one 12.5 Hz interval
        per set left mid-drill. Both fixed: pending timeouts are tracked
        and cleared (`st.pending`), and `activateSet` now calls `sdStop()`
        on every shuffle drill on set-switch.
  - [x] `coach.js` single-chord checks: `isChange` logic marks a slot as a
        "change" even when it's the same chord repeating, making the
        `'coach.crit.changes.onlyOne'` message unreachable and mis-grading
        one-chord drills as "changes came in late." Fixed — `isChange` now
        also checks the previous slot's chord name differs.
  - [x] `coach.js` `nrLoop` (Note Runner) doesn't bail when the analyser
        disappears — every other mic loop in the file does. Can silently
        demote a student's adaptive stage on a lost mic instead of
        triggering the `micSuspect` guard. `!coachAnalyser` added to the
        bail-out guard, matching the other mic loops.
  - [x] `teacher.js` — module-load failures inside `loadAllStudents`'s
        per-module loop are silently swallowed (`catch(e){}`), which
        quietly shrinks the skill universe and inflates every percentage
        with no warning. (The loop actually lives in `showTeacherApp`, not
        `loadAllStudents` — same bug, corrected location.) Failures are now
        logged to the console and surfaced as a warning banner above the
        summary cards (`showTeacherLoadWarning`).
  - [x] `coach.js` `coachScoreCompletion` reports the wrong beat number for
        a gap (off-by-one in the `hitIdx.find` callback). Fixed to report
        the first missed beat, not the resuming hit.
  - [x] `tuner.js` `tunerStableCount` double-duty bug: the same counter
        tracks "same-note frames" and "silence countdown," causing a
        ~0.45s lag re-detecting a re-plucked string after a silent gap
        (Auto mode only). Split into `tunerSameNoteCount` and
        `tunerSilenceCount`.
  - [x] `tabs/journey.js` — a rating click during the initial Firestore
        `get()` can be silently overwritten when `applyRatings` replaces
        the DOM right after; the pending save then reads the overwritten
        state. Fixed with a `locallyClickedLayers` guard — `applyRatings`
        skips any layer the student already clicked this page load.
  - [x] `app.js:2303,2307` — reflection textarea isn't HTML-escaped on
        re-render (self-only scope, not cross-user exploitable, but XSS-shaped).
        Both `escHtml()`-wrapped now.
  - [x] `teacher.js:127` — `abbreviate(s.text)` goes into `innerHTML` raw
        while every other call site escapes it. `escHtml()` added.
  - [x] Dead code: `buildVideos()`/`buildAssess()` in app.js are never
        called — meaning every set's `assessment`/`objective` field is
        written but never rendered anywhere. Worth deciding delete-vs-wire-up;
        several of the "assessment promises content the set doesn't teach"
        items above might be moot if this is intentionally dead.
        **DECISION MADE 2026-07-26:** both functions **deleted** from
        app.js (not wired up) — `objective` was removed from module data
        (see the top item), `assessment` was kept as data-only per
        Jonathan's call. `buildStations()`'s no-stationId branch and
        `openSt()` were also unreachable — both **deleted**.
        `btn.classList.add('incomplete')` referenced a CSS class with no
        stylesheet rule — **removed**.
  - [x] i18n gaps outside `tools/checks.mjs`'s scope: `buildSearchIndex`
        never routes through `tf()`, so Spanish-mode search misses
        Spanish-only content; several hardcoded-English shell strings
        (search panel, save indicator, popup labels, embed fallback) bypass
        `t()` entirely — full list in the JS audit's chat transcript.
        `i18n.js` also doesn't set `document.documentElement.lang` on
        initial page load (only on toggle), and `applyI18n`'s
        `JSON.parse(params)` isn't guarded against one malformed
        `data-i18n-params` aborting the whole pass. All fixed:
        `buildSearchIndex` now indexes via `tf()` (and invalidates the
        cached index on language change); the search panel, save
        indicator, popup labels, and embed fallback all moved into
        `i18n.js` (`search.*`, `save.*`, `popup.*`, `panel.*` keys, EN+ES);
        `documentElement.lang` is set on initial load; `JSON.parse` failures
        in `applyI18n` are now caught per-element.
  - [x] **DECISION MADE 2026-07-26:** `blend-words-game.html` (unrelated
        phonics game living in this repo) isn't in `sw.js` ASSETS or
        `tools/checks.mjs`'s SHELL_FILES, so it's never precached or
        syntax-checked. **Left out of the deploy pipeline on purpose** —
        Jonathan confirmed it isn't meant to ship through this site's
        build; not wired into `sw.js` or `checks.mjs`.

- [x] **Check the list sweep for OVER-listing** — closed 2026-07-28 (Claude
      ran the audit, per Jonathan). Module 5 came back clean — all its
      fret/strum cards use the established one-sentence-then-strum pattern
      consistently. Module 7's Set 2 barre-chord sequence had genuinely
      broken from that pattern (over-decomposed into per-finger `<li>`s,
      plus technique reminders wedged in as steps); all four confirmed
      findings fixed and pushed:
      - `module-5.js` Call & Response — "stay in the pentatonic box" folded
        back into the improvisation sentence (was a standing constraint,
        not a sequential step), list dropped.
      - `module-7.js` E-Shape Barre (Challenge 2) and A-Shape B Major
        (Challenge 1) — per-finger placement `<li>`s consolidated back into
        the site's one-sentence, `·`-separated pattern (matches every
        Module 5 fret card); the A-shape's "arch those three" reminder
        folded into the placement sentence instead of its own step.
      - `module-7.js` Slur It Together — the "pick only where the TAB shows
        a plain fret number" notation rule folded into the single play
        action instead of standing as its own list item.
      One lower-confidence item (`module-7.js:157`, the alternate-picking
      workout's "read the rhythm first" item) was left alone — the audit
      judged it a legitimate first action, not a reminder in step's
      clothing.

- [x] **Check the Coach gate with a real guitar — home pass done 2026-07-27:
      "feels fair" (Jonathan, Mac, quiet room).** Wording, bar, and flow all
      read right. One residual check rides along with the school batch below:
      confirm the 💪 Good bar still feels fair on a Chromebook with a noisy
      classroom around it. Original checklist, for that re-run:
      1. **Does "Mark it anyway" read as a legitimate choice or as
         cheating?** This matters more than the threshold. The gate is the
         first thing on the site that tells a student no — everything else
         is self-directed. If the override reads as cheating, the student
         with a dead mic stops marking skills at all and the progress data
         gets WORSE, not better. Wording lives in `gate.*` in i18n.js.
      2. **Is 💪 Good the right bar?** `COACH_GATE_MIN_LEVEL = 2` in app.js
         (1 Needs work · 2 Good · 3 Great) — a one-constant change, no other
         edit needed. If you bump into the gate yourself while playing it
         cleanly, it is set too high. Try it with 29 other guitars audible,
         not in a quiet room.
      3. **Does "Practice it now" land where you'd expect?** It should open
         that skill's practice panel and pulse its 🎤 button. Gated skills to
         try: `m2w2-s1`, or most of Module 5 Set 2. A quiz or fretboard-game
         skill should still mark instantly, with no card at all.

- [x] **Listening Coach check-off gate — teacher view of overrides
      (2026-07-25) — done 2026-07-27.** `teacher.js`'s skills-grid and
      Students-detail checkmarks now read `games.coachSkill[skillId]` and
      render three states with the SAME green check (never a worse-looking
      mark, so an override doesn't read as a red flag on the student): a
      solid blue ring for a genuine Listening Coach pass (tooltip shows the
      level and date), a neutral gray DASHED ring for a gate override
      (tooltip explains it's usually a mic/room issue, not a skill issue),
      and the plain check unchanged for a self-declared skill with no Coach
      data. Two new legend rows explain the icons, inserted into `#t-legend`
      at runtime so `index.html` didn't need touching. An adversarial review
      caught a real bug in the first pass — `override` is a one-way flag
      nothing ever clears, so a student who overrode once and later
      genuinely passed at a higher level would show the override marker
      forever — fixed by checking `coachRec.level >= TEACHER_COACH_GATE_MIN_LEVEL`
      (mirrors app.js's `COACH_GATE_MIN_LEVEL`) before ever falling back to
      the override marker. Browser-verified (mocked `allStudents` + a
      simulated stale-override-then-later-pass case): all three states
      render distinctly, tooltips read correctly, the staleness case
      correctly shows "verified" not "override." Deliberately left in
      plain English, not wired to i18n.js — this file has zero i18n
      anywhere else (it's gated to Jonathan's own `TEACHER_EMAIL` account),
      so adding it just for two new strings would be new scope rather than
      an existing pattern; flagged rather than decided silently.

- [x] **Note Runner — live guitar check** — closed 2026-07-28. All five
      checks confirmed good, including **stage movement feel**: the 90%-up /
      65%-down pacing was put in front of a class and reported back as
      working; `NR_UP_PCT`/`NR_DOWN_PCT` stay as-is. Mic timing offset,
      power-chord stages, weak-spot re-dealing, and hit animations were all
      previously confirmed (see 2026-07-27 progress notes, preserved below
      for the record):
      1. **Mic timing offset** — ✅ Mac: ~35 ms, slider steps by 5, 70 ms
         Chromebook default confirmed right at school too.
      2. **Stage movement feel** — ✅ confirmed good with students, 2026-07-28.
      3. **Power-chord stages** — ✅ guitar-verified good 2026-07-27: the
         chord-tone vote grades real strums correctly.
      4. **Weak-spot re-dealing** — ✅ confirmed.
      5. **Hit animations** — ✅ confirmed, read as fun not distracting.

- [x] **Post-review guitar + eyes pass (Jonathan, 2026-07-27 session)** —
      closed 2026-07-28. A seven-agent review plus a ten-agent adversarial
      verification workflow shipped 13 commits that day (see "Recently
      shipped"); both hands-on items confirmed:
      1. **Mic games on a real guitar** — ✅ confirmed good. Note Hunt, Note
         Runner and Strum Radar all had behaviour changed in the same batch,
         plus a *separate* concurrent session rewrote the pluck synth
         (`e385d12`) on top; a single guitar pass covered all three (mic
         release/restart on Note Hunt, stop-during-count-in on Note Runner,
         on-beat highlight sync on Strum Radar) with nothing flagged.
      2. **Module 1 Set 2 — progress ticks** — ✅ confirmed fine (Set 2's new
         "Your first fretted note" card and the rescoped "Happy Birthday" —
         the positional-key tick shift reads acceptably in the wild; no code
         change needed).

---

