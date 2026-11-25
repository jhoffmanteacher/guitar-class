# WORKFLOW.md — Guitar Class

What is open, what was decided, and why. Windows starts with "For Windows", right below; everyone else with
"Where things stand". How the file is kept short and where its history went: "About this file", at the end.

## For Windows (read this first, every time you check)

How Windows works (Jonathan, 2026-11-19: "shift work to windows"):
- `git pull` first. Take the first open W item whose date has come, one at a time, in your own worktree.
- **Commit no "idle" or "checked" line** (each push to main reruns every GitHub workflow and redeploys the site and
  the practice copy, and it collides with other sessions' edits here). Push to main only two short edits per item:
  a line under it when you START ("Windows: started HH:MM"; the Mac reads that as Windows being awake), and the DONE
  note when it is ready to merge. Rebase before each push (CLAUDE.md step 8).
- Push the work itself as a `win/wNN` branch; the Mac or Jonathan merges it. Agents on Opus this week ("This week
  only", below). Reports as CLAUDE.md says: short, counts with denominators, details in one file.
- **Dated items go to the cloud when they can** (Jonathan, 2026-11-19: "put it into the windows section of workflow for
  it to schedule those things"). An item marked "Windows: SCHEDULE" below is not done by Windows: as soon as you read
  it, create a one-time cloud routine for it (skill `schedule`, environment `guitar-class`, `run_once_at` = the time
  the item names, converted to UTC). The routine body ALWAYS carries `"clear_mcp_connections": true` (otherwise the
  server attaches Gmail, Drive and Jonathan's other connectors; check the response shows `"mcp_connections":[]`).
  The routine's prompt is the item's own text, made self-contained, plus: "work on a branch of origin/main; the
  result goes under this item in WORKFLOW.md, pushed to main after `git fetch` + rebase (CLAUDE.md step 8)". Then
  push ONE line under the item, "Windows: scheduled <routine link> for <local time>" (it counts as the item's
  "started" line), and go on to the next item. A routine cannot be deleted from Claude: Jonathan does that at
  https://claude.ai/code/routines.
- **Song requests are the Mac's** (Jonathan, 2026-11-20: "song requests are being handled by mac"): the request page, its
  YouTube links and any play-along made from them. Windows does not pick them up, even when asked in passing.

- [ ] **W25 — the activities smoke on GitHub: a page where some app parts never ran (not urgent).** The Note Call
  walk (`noteCallWalk`, `tools/smoke.mjs`) reloads (`Page.navigate`, 3.5 s, `pageLoaded()`: `readyState` complete)
  and in 3 of the last 42 activities walks on main (`11ff03f`, `f9bc655`, `9cb56dd`; also `a0f4047`) found a
  different set of parts never ran (`snipStop`, `isBuiltSongId`, `pcStop`, `NC_LEVELS` … not defined). The Mac's
  runs are clean; its 2026-11-02 flake (`chordDiagramSVG` not defined after a reload) looks the same. Each run's page
  shows the error list without signing in, e.g. https://github.com/jhoffmanteacher/guitar-class/actions/runs/44483184053.
  First decide: can the SITE end a load with parts missing (a part's fetch failing, maybe through the service worker,
  which a slow Chromebook would meet too), or only the harness? Ideas: log every failed request and the service
  worker's answers in that walk (the smoke's `NOISE` filter hides `net::ERR`), slow the CPU
  (`Emulation.setCPUThrottlingRate`), repeat the walk 50+ times, a `ci-try/w25-<x>` branch for GitHub. A fix in the
  load path (`sw.js` code, load order, `app/boot.js`, `app/start.js`) is Always Reviewed with `slow-load.mjs` and
  `update-reload-loop.mjs`; a harness-only fix ships Fast with its break-it proof. Report the cause and N of M walks
  failing before and after.
  Windows: started 09:23 (2026-11-19).
  Windows DONE (2026-11-20), ready to merge: `win/w25-fix` (a1020de, 3b19117, 1de76ab; Fast, harness only, `tools/smoke.mjs`).
  Cause: on GitHub's runners Chrome itself cancels a reload's in-flight defer scripts (`net::ERR_ABORTED`, ~100-150 ms
  after the commit); the worker, its cache and the server held the full files, no page code navigated or stopped, the
  worker stayed running. 28 of ~600 reloads after a cold boot failed, 0 of ~700 in every other pattern, 0 on Windows
  (bfcache on/off A/B inconclusive). Fix: `pageLoaded()` checks each app part's first top-level name; a reload with
  parts missing is noted and reloaded once; still missing = a ✗ line naming them (the site's bug). Break-it: a planted
  throw in `app/cards-loop.js` -> 15 of 15 reloads caught, retried once, "15 still did not", exit 1. GitHub on
  `ci-try/w25-fix`: 5 of 5 smoke areas pass. Before: 4 of ~46 main activities walks failed. `win/w25` holds only the
  diagnostic notes (do not merge); `ci-try/w25-diag` and `ci-try/w25-fix` can be deleted.
  **2026-11-24 (Claude on Windows, Jonathan: "look at W25"): NOT merged, parked.** `win/w25-fix` was never merged (it
  still is one file, `tools/smoke.mjs`, +43 -3, and merges into main with no conflict). Of the 21 failed "Browser
  tests" runs on main since 2026-11-18, 5 are the "<name> not defined" symptom (all 2026-11-18 .. 11-20, the days the
  app was cut into parts; the last 2026-11-20 18:14 UTC, run 44790829056) and none since; the other 16 are other
  causes already fixed or unrelated (ResizeObserver 1, Chrome install outage 1, song tiles / card keys 7, play-along
  view switch 3, a Spanish card title 2, the practice-minutes strip 1; table in that session's scratchpad). Merge the
  branch (rebase, `node tools/checks.mjs`, Fast) if the symptom comes back; until then leave it.
- [ ] **W26 — on or after 2026-11-26: is the accessibility scan ready for its ratchet?** Read GitHub's "a11y scan"
  job on every push to main from 2026-11-19 on: its annotation "a11y: against the baseline: N new signatures, M gone"
  is on each run's page without signing in (the public API allows 60 reads an hour; the run pages are not limited).
  Write under this item: runs read, runs with a new signature, and what each one is. Do NOT switch it on:
  `A11Y_RATCHET` in `tools/smoke.mjs` is Jonathan's call (planned 2026-11-27), then one `site-reviewer` round.
  **Windows: SCHEDULE** for 2026-11-26 at 7:00 AM Pacific, model `claude-sonnet-5-5` (reading and counting only;
  the public pages need no sign-in and no browser).
  Windows: scheduled https://claude.ai/code/routines/trig_011u2gbkdE7fC3GsUzfnLyYh for 2026-11-26 7:00 AM Pacific.
  **Read early on 2026-11-24 (Claude on Windows, with `gh`; Jonathan asked for it): 73 runs of "Browser tests" on main
  since 2026-11-19 (first push 11ef3268, last 982194ea).** The "a11y scan" job ran in 68 of them: all 68 say "0 rules
  with findings, 0 elements, on 0 of 12 screens" and "0 new signatures, 0 gone". The other 5 did not run it: 2 were
  cancelled by a newer push (445a320b, 7efe39bc, 2026-11-23) and 3 were manual or scheduled runs that skipped it
  (2026-11-21). Runs with a new signature: 0. The baseline file holds 0 findings (22 screens, both languages), so with
  the ratchet on ANY finding axe makes fails the run. The routine above still reads again on 11-26 (adds 11-24 .. 11-26).
  **Both languages, 2026-11-24 (Windows, `node tools/smoke.mjs --only a11y`, exit 0): 0 rules with findings, 0
  elements, on 0 of 22 screens; 0 new signatures, 0 gone.** Axe could not decide (listed, never counted):
  color-contrast 155, label-content-name-mismatch 17, skip-link 1. Not scanned at all: games mid-play, the tuner, the
  mic panel, tool popups and other modals, the narrow-window drawer, Module Review, exit checks, 5 of 6 Song Journey
  pages, keyboard order and focus: the ratchet does not cover those.
  **Switch-on scheduled (Jonathan, 2026-11-24: "schedule the other things to run in the cloud on 11/27"):** cloud
  routine https://claude.ai/code/routines/trig_01GQnmbEwRvA9vNbiy7ju77i, once, 2026-11-27 7:00 AM Pacific, Opus. It
  extends the run count, stops (and writes the finding here) if any run has a new signature or a scan lists a
  finding, otherwise sets `A11Y_RATCHET = true`, runs one fresh `site-reviewer` round (Opus, high), pushes, reads
  GitHub's result and reverts the switch itself if the ratchet turns the run red. The Friday check runs that night as usual.
- [ ] **W27 — on or after 2026-12-01: remove the split bridges.** The spec is `todo.md` → "Remove the 2026-11-16
  and 2026-11-18 split bridges" (`grep -n "DELIBERATE BRIDGE" coach-*.js` finds 6; keep the two `typeof` guards it
  names). One commit. It touches load order: Always Reviewed (`site-reviewer`, Opus at high this week), with a golden
  snapshot before and after (`--compare` identical), `node tools/slow-load.mjs`,
  `node tools/mic-sim/coach-take-save.mjs` and the full checks. Delete the todo.md item in the same push.
  **Windows: SCHEDULE** (the cloud CAN run headless Chrome: the Look A run of 2026-11-19 used
  `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome` through a wrapper that adds `--no-sandbox`, and ran
  `tools/console-layout-smoke.mjs` there; put both facts in the brief): a routine for 2026-12-01 at 7:00 AM Pacific, model `claude-opus-5-5`, pushing its work as `ci-try/w27` and
  never to main (the Always-Reviewed review and the merge stay with the Mac). If it cannot, or nobody has written
  down the answer by 2026-12-01: Windows does it as before.
  Windows: scheduled https://claude.ai/code/routines/trig_01QaU4ym5Rto8GuhJG8MZacF for 2026-12-01 7:00 AM Pacific (Opus, pushes `ci-try/w27` only).
- [ ] **W28 — when nothing else is open: the most misleading old-name comments.** `todo.md` → "Small things" →
  "Comments that still say `app.js` / `coach.js` / `teacher.js`": in `index.html`, `tuner.js`, `guitar-diagrams.js`,
  `config-main.js`, `tabs/journey.js`, `live-quiz.js` and `fab-tools.js`, make each comment name the part
  (`app/<x>.js`, `coach-<x>.js`, `teacher-<x>.js`). Leave `sw.js` alone (its comments wait for its next real change).
  Comments only, so the full checks prove no code moved; Fast, no reviewer. Shrink the todo.md item in the same push.
  DONE (2026-11-24, `wo/w28-comments`, Fast): 66 comment lines in the 7 files now name the part; 66 of 66 changed lines proved comment-only.

---

## Where things stand (updated 2026-11-19 morning)

Update this block whenever an item opens or closes.

**Done 2026-11-23: W15, the design-values tidy (Reviewed, `site-reviewer` on Opus, 2 rounds).** Text sizes (`--fs-*`,
13), layers (`--z-*`, 9) and spacings (`--sp-*`, 11) have names equal to today's values; students see nothing (no
CHANGELOG entry). Golden, origin/main against the tip: 1,600 of 1,603 files identical (the 3 others are the stylesheets
themselves); hand pairs on the 6 Journey pages at 1366×657, 1920×1080 and 2560×1300. Near-twin folds that moved pixels
were put back (0.8437rem, 0.9rem, and the Journey pages' 0.9063rem / 0.7813rem); folding them is summer work.
`checks.mjs` 1fb now refuses a new one-off text size or layer number, reads `font:` shorthand and any case, refuses
`var(--z-*)` on the Journey pages and pins the four `--t-*` title names. Its header lists the known limits (R1-4 to
R1-6, R2-2).

**Done 2026-11-23: Friday finding "below" (work order `friday-findings`, Part 2, Fast).** 7 two-column steps lost the
direction word (EN 7 "below", ES 7 "abajo"): module-3 power-chord step and Challenge 6, module-4's two Mystery Chart
steps, module-5 Pattern 1 as C major, module-9 partial shape, module-10 relative vs. parallel. Kept: "the question
below" x2 (+ ES twins; the MC renders full width under both columns), "hacia abajo" (= downward), and the "the cure"
step's "pre-loaded below" (a switched-off Take It to a Song section; 1do refuses any edit there, never shown).

**Done 2026-11-23: Friday finding "Date added" (work order `friday-findings`, Part 3, Fast).** All 46 coded songs (120
entries) carry `added`, the day each first entered the module data (git, 2026-05-15 .. 2026-08-07); the 8 cards with
`library` too, and the More Play Along songs row follows "Date added" (newest first; A-Z otherwise). A built song's
day is its doc's `savedAt` (last Import or Publish), so an Edit + Publish moves it to that day: keeping the first day
needs a format change (a reader first, then the writer). `checks.mjs` 1fa pins the dates.

**Done 2026-11-23: Friday finding "ca-53" (work order `friday-findings`, Part 1, Fast).** Step 2 reads "Play all eight
bars 4 times through …" (4 tap dots, EN + ES); step 1 reads "Press ▶ to hear the pattern, then mute the strings and
strum it 8 times in a row …" (no dots: 8 is over the dots' cap of 5, as before). One line each at 1366×657, both languages.

**Live since 2026-11-17 (all on main, deploy confirmed):**
- Look 1 redesign, Parts 1-5 and both review rounds (`39f1442`..`823516d`).
- The Chords / Tab / Lyrics switch on the song cards (W23, `c83bcf7`) and Jonathan's answers to its five questions:
  Watchtower has both switches, a power-chord card's Tab shows its power chords, a view switch mid-song scrolls back
  to the card's top (`b458ad3`..`3654a33`, `e712baf`).
- Private chord sheets P1-P4: a built song's lyrics sheet is a pdf in the private store (`a1faa4a`..`e9a1db9`).
- The 7 record-derived songs play from the private store (`bf0e0ff`; to undo, revert it).
- Whole titles on In class's Today tiles (`60f805d`); a Today column in the console's Practice minutes (`8247468`).
- Rule A (`1be6d04`..`ae11813`): a strum with no pitch never counts as the chord in Power Chord Switch, Change Up,
  the Listening Coach (chords) and Note Runner. Decision and numbers: "Power Chord Switch: where we stopped" below.
- Three part splits, each moved whole and unchanged: `app/cards.js` → `app/cards-sheet.js` (W24), `coach-core.js`
  → `coach-recordings.js` (`8ecb1de`) and `coach-score.js` (`f4233e8`, `e0dd0cd`). No part is over 2,000 lines.
  `f4233e8` and `e0dd0cd` were reviewed (`site-reviewer-deep` on Opus, 1 round, 0 BLOCKER / 0 MAJOR, both MINORs
  fixed) but carry no Review trailer by mistake: read them as Reviewed.

**Done 2026-11-20: three new Play Along songs, all BUILT songs, imported by Jonathan** (not the coded cards the
handoff asked for: he chose built songs once Import was shown to work; the coded-card commits are kept on the local
branch `local/coded-songs` of the Mac, never pushed). "Sailor Song" - Gigi Perez (`sb-sailorsong`, 4/4, 95 bpm,
bar 1 at 9.023 s; the bass notes moved beat 1 from the tool's pick, 9.971 s), "유성 (Falling Star)" - Madmans Esprit
(`sb-fallingstar`, 4/4, 120 bpm, bar 1 at 4.000 s: beat-audit found the first guess 253 ms late; the chords come from
the record's bass line, not from the thin web chart, and are UNCHECKED BY EAR) and "Recuérdame (Arrullo)"
(`sb-recuerdamearrullo`, 4/4, a beat map of 22 bar times from the Moises pair, bar 1 at 1.893 s = the first loud
beat; the first build was 3/4 from 1.133 s, which was a fade-in). Things to know:
- `new-playalong.mjs --built` refuses a `cents` shift that delays the audio 10 ms or more; rubberband's 18-cent shift
  delays it 23.2 ms. Sailor Song was built from a pre-shifted, delay-corrected wav (`adelay` 1114 samples at 48 kHz,
  measured 0.01 ms against the upload) with no `cents` in the spec. The tool itself still refuses such a shift.
- A record's tuning can move through the song (Sailor Song: +22 cents early, +10 late), so the whole-file TUNING
  reading of a shifted copy is not "original minus the shift" (it read +8.7 after an 18-cent shift).
- Slow files outside +-1 LU were levelled with `--accept-spread` on the coded route (Jonathan said levels matter
  mainly for whole-class songs); the built route has one file and no slow copy.
- An imported song's Beat step in the Song builder has no meter buttons: to change the meter use "Clear this step"
  (the imported bars are gone), or rebuild the Import file with `new-playalong.mjs --built` (same id replaces).
- `scipy` is not installed on the Mac; `tools/beat-map.py` ran from a scratch venv (numpy and scipy).
- Still Jonathan's: delete the temporary branches `transfer/recuerdame-moises` and `transfer/recuerdame-import`
  (the repo is public; they hold the audio); check each song by ear as a student; Falling Star's chords above all.
- **Sailor Song: capo 4, rebuild on the Mac** (Jonathan, 2026-11-20: "check if there's a capo... there are more parts
  of it too. check out the youtube tutorial"; he picked "Capo 4 + easy shapes"). Built songs now take `song.capo` 1-9
  (`app/builtsongs.js`; `new-playalong.mjs` spec field `capo`): chords written as played (C Em G, not E G#m B), the
  line reads "Capo on fret 4.", a tapped chord sounds 4 higher. Open: rebuild `sb-sailorsong` with `"capo": 4` and its
  other parts after watching the tutorial (`rpoyXduMZZw`, cut at 551 s; the cloud session could not open YouTube or
  any chord site), then Jonathan imports it. Import only once this code is on main: an older page drops a doc with
  `song.capo`. Then a CHANGELOG entry.

**Waiting on Jonathan (none urgent).** His list is `todo.md` → "For Jonathan". Also:
- Which of this week's changes get a Fable review (the list under "Opus reviews" below). The Friday check routine
  (`trig_016m5HTbmhxb2oEqDaefQurB`) is ENABLED again (Jonathan, 2026-11-23); its next run is Friday 2026-11-27, 11 PM
  Pacific, and covers everything since `last-run.txt`. The one-time routine `trig_016pjBWVDN5ychbioZJqmVEf` (set to
  re-enable it on 2026-11-27) is no longer needed; Jonathan can delete it at https://claude.ai/code/routines.
- The three Friday-check product calls are settled (Jonathan, 2026-11-19): the Games heading now says "Notes on the
  fretboard"; the practice-minutes keepalive's dead-link loss (up to about 60 s, `practice-minutes.js` ~1082) is
  ACCEPTED; no "goal reached" toast on a Journey page is LEFT as it is. Do not raise the last two again.
- The old-page tool (W22) stays parked on `origin/win/w22` (round 4 found a MAJOR) until a part split needs it.
- The visual re-design look STARTED 2026-11-19 (Jonathan: "start redesign"): pictures only, two looks on three screens,
  in `Claude outputs/redesign-2026-11/`. He picked Look A, "Tidy plum" (2026-11-19). A cloud routine BUILT it on `ci-try/look-a` (tip 09357bf, 2026-11-19:
  full checks 0, 1s 807 pairs ≥ 4.5:1, 52 rules folded in, `--text3` a touch darker to pass 1s, a new dark
  `--rail-active`); GitHub's browser tests, practice copy (7-day preview) and rules runs on it all passed. LIVE
  2026-11-19 (Jonathan looked at the preview: "Ship it to students"): aa4b672 + 67acfa3 (sw.js) on main, pushed by a
  one-time cloud routine; GitHub's English smoke (5 areas), slow-load, update-reload-loop and the a11y scan passed on
  67acfa3. W15 follows. `look-a-spec`, `ci-try/look-a` and `ship/look-a` are his to delete.

**Dated** (queue written 2026-11-23, Jonathan's list a-f; any session can pick these up):
- a. 2026-11-26: W26, the accessibility scan's counts (a cloud routine is already scheduled for it,
  `trig_011u2gbkdE7fC3GsUzfnLyYh`; spec under "For Windows").
- b. 2026-11-27 (planned, Jonathan's call): switch on the accessibility scan's ratchet after a week of 0 new
  signatures (W26 counts them), then one `site-reviewer` round. The Friday check also runs that night, 11 PM Pacific
  (`trig_016m5HTbmhxb2oEqDaefQurB`).
- c. On or after 2026-12-01: remove the split bridges (W27).
- d. Whenever Jonathan decides: a Fable review (he names it; CLAUDE.md "Opusplan") of this week's Fast changes. Suggested
  targets: the live "Hear the chord change" game (friday-findings Part 5, `live-changes.js`, `6be9381a`) and the
  full-screen exit in the shared nav (Part 4, `syncExploreNav()` in `app/shell.js`, `18950838` + `f009eeb8`).
- e. Summer (add to skill `summer-reset` when touched): fold the two near-twin text sizes (0.8437rem, 0.9rem) into
  named sizes, a change that moves pixels; the switched-off "pre-loaded below" step in module-4 (1do refuses any edit
  there); the out-of-scope "below" / "abajo" at `tabs/sweet-child-o-mine.html:206` and a Spanish "de arriba" in a
  Module 4 Challenge step's "Stuck?" tip; keeping a built song's first "Date added" needs a two-step format change
  (a reader first, then the writer).
- f. Jonathan's own: the Chromebook strum-check takes; delete the cloud routine "WO friday findings Part 5:
  chord-change game joins" (`trig_01YJq53MxkeHHF4Mg5xpL7Ug`) at claude.ai/code/routines (Claude cannot delete routines).
- Left out of friday-findings Part 5: a NEW tab opened mid-song still has the stale clock stamp (needs a console
  write); the console's round lifecycle is not in `tools/live-changes-sim.mjs`.
- golden.mjs now has a made-up "Hear the chord change" round (`86258a07`): the next golden compare shows the
  chord-change pictures as new files, not as changes.
- About mid-December: Power Chord Switch leaves the class; aim listening work at the Listening Coach and the other
  mic features. Its takes and timing rules stay, as the base for a chord switch game ("Power Chord Switch: where we
  stopped").

**Watch:**
- The first classes on rule A. On the recorded takes, Power Chord Switch "right" fell from 322 to 296 of 416 changes.
  Takes recorded from 2026-11-19 are the real test (`node tools/mic-sim/takes-in.mjs`, then the closed loop).
- The 7 private songs: each Chromebook downloads a song once; the month's count is in Manage → Song files (6 GiB).
- GitHub's browser tests: Chrome's install gets a second try since 2026-11-19 (`browser.yml` header); the
  activities smoke's other red is W25.

**Opus reviews, for his Fable pick** (Jonathan, 2026-11-16: "heavy fable use this morning ran up my total. we can
run opusplan stuff"; made the standing rule 2026-11-20: every spawn is Opus, reviewers included, and a Fable review
runs only when he names one; CLAUDE.md "Opusplan", the agent files pin Opus). These were reviewed on Opus; he may
name any of them for a Fable review:
- Reviewed on Opus instead of Fable: no name on a mic take (`3792deb`, `e25f0d5`; a cloud review); Play Along
  highlight timing (W16); Look 1 Parts 4-5; W24 (the `app/cards.js` split); both `coach-core.js` splits; rule A.
- Already reviewed on Fable: the sign-in load fix (round 1); the Chords / Tab switch (W23, both rounds, by mistake);
  Look 1 Parts 1-3 (rounds 1 and 2).

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

Only what is still open. The Friday check writes its open findings here (skill `friday-check`). The items closed
before 2026-11-19, with the decisions that bind (the stopped-game headline, the grid step cap, the count-in, the
top-tempo advice, the smoke watchdog, school accounts), are in `docs/workflow-history-to-2026-11-18.md`, section 2.

- [ ] **Watchtower's 8 recordings are still public files.** They wait for a private player on the Journey page, which
  is NOT built: two review rounds found majors in it (harness and findings in
  `Claude outputs/private-audio-step1/step2-journey-harness/`). The 18 practice-card files moved on 2026-11-17.
- [~] **`tools/smoke.mjs` finds functions not defined after a page reload** (2026-11-02 on the Mac; 4 times on
  GitHub since 2026-11-14): W25, under "For Windows".
- [ ] **ca-43 Note Call through a real guitar and a Chromebook mic:** not recorded as done (2026-10-31).
- [ ] **Friday check 2026-11-23: open findings (MINOR; fixed ones are in `3bda5bc`, `e8f8aec`).** Jonathan settled the
  three product calls 2026-11-23; the whole list is written up as a work order for another machine:
  `docs/work-orders/WORK-ORDER-friday-findings-2026-11-23.md` (5 parts). Do not start these by hand. Details:
  that run's session. Content and product calls for Jonathan:
  - Songs page "Date added" sorts exactly like "Title": none of the 47 songs has an `added` date, and nothing makes a
    new song carry one (`app/explore.js` ~316/325, `0d0cd6e`). Give the songs dates, or drop the button?
  - ca-53 (`d2a676c8`): the chords step now shows the chorus twice (8 bars) but still says "the four chorus bars 4
    times through" with 4 tap dots; step 1 says to mute the strings while its ▶ plays a ringing A5.
  - 8 two-column lesson steps say "below" about a chart or Play button that the One step view (`11ff03f`) now draws
    to the RIGHT at 1366: module-3.js:36, :305; module-4.js:215, :236, :711; module-5.js:76; module-9.js:1055;
    module-10.js:358 (most say "abajo" too). Drop the direction word? (Module 3 is frozen: text only, no relabel.)
  Code, not yet fixed:
  - A play-along opened by a tap goes full screen (`66b5585`); browser Back to Songs leaves the page in full screen
    with no Exit button (only Esc). Fix idea: `syncExploreNav()` exits when the open page is not In class; test it in
    a browser first (the request is async, so it must not cancel the card's own entry). The full-screen default has
    no pin in `checks.mjs` and no smoke click.
    **Part 4 DONE (2026-11-23, Windows, Fast; this push).** `syncExploreNav()` leaves the page's full screen
    (documentElement only, never the live-quiz stage's `lq-shell`) whenever the HASH is not `#class-activities…`; the
    hash, not the open screen, so the tap's own routing gap never cancels it. Real Chrome, real taps at 1366×657: 3 of
    3 entry paths (Songs Play Along, an In class card, a Keep practicing pin) full screen after the tap, off after Back
    on Songs; Forward reopens the card windowed. Pins: checks 1cr2 (19 cases; 3 mutations red), smoke
    `fullscreenBackWalk` (exit removed: 0 of 3). Not changed: closing a card by its title on In class keeps full screen.
  - "Hear the chord change" (`5c70ae9`): every signed-in student page sends a "cc:0/N/0" result, joined or not, so
    students who dismissed the invite count as 0-point players and lower the stage's "% caught"
    (`live-changes.js` ~253, `lqCcSync`); a page that reloads mid-song reads its clock off by the age of the last
    `cc.clk` stamp (~235). The sim stubs the timers, so the console's round lifecycle is untested, and checks 1di
    (Hide names) and 1cm (no names in scores) do not paint the new game yet.
    **Part 5 DONE (2026-11-23, cloud session, Fast; this push).** A page sends its result only if the game screen was
    open on it at some moment of this game, or the student pressed this round (`lqCcJoinedId`): dismissed + no press
    -> 0 results sent; joined + no press -> 1 result, 0 caught; joined earlier this game -> still counts. The best
    clock gap is kept in sessionStorage per game (`lq-cc-clock`, on the wall clock; cleared on sign-out): reload
    30 s into a song, clock error 30 000 ms before, 40 ms after (the smallest delivery delay). Checks 1di and 1cm now
    paint this game's stage and run its Reveal writer (break-it red on both). Left out: a NEW tab mid-song still has
    only the stale stamp (no fix without a console write); the console's round lifecycle (audio, pings, auto-Reveal)
    in the sim: needs a fake Audio element, fake timers and a fake Firestore listener, not cheap.
  - Labelling: `de68fd8` (the practice-minutes `firestore.rules` change) shipped `Review: Fast` though it is
    danger-zone (its follow-ups were Reviewed; the Friday check's deep review found nothing wrong, pm-sim 407 of 407).

**Deferred, not rejected** (only when Jonathan asks):
- Fretboard Tap (2026-09-12): a chord-builder type, a per-student tap breakdown, sharp and flat targets.
- Exit checks (2026-09-09): a console toggle for `retake`, a `chordName` item, a per-class average, the
  `kind:'check'` schema in the `guitar-class-activity` skill.
- Site audit (2026-09-05): caching `config/class` in the console, per-key save dirtiness, Note Hunt's colour-only
  round dots.
- Song Journey Metronome (2026-11-16): taking back every unsounded click on `seeking` removed the last doubled
  clicks (2+2 → 0+0 in one 80-seek run); it changes the QUEUED CLICKS rule, so it was not shipped.
- The Listening Coach's grid (`coachMatchEvent`) is uncapped (up to 270 ms at 30 BPM); the chord games cap it at
  60 ms (2026-11-07).

---

## Recently shipped

Newest first, 5 lines at most each ("About this file"). Older entries: `docs/workflow-history-to-2026-11-18.md`,
section 3; what is live since 2026-11-17: "Where things stand".

- **2026-11-24 — Streak flame colored by the streak, not this week** (Jonathan: "brown looks like it applies to the streak not
  the week"; work order `WORK-ORDER-streak-flame-color.md`). Both flames (`stripInner()`, `progressHtml()`) get `pm-on` when `st.streak > 0`:
  orange with a streak, `--pm-grey` (3.1 : 1 on the surface) with none; `--streak-dim` deleted. Reverses the 2026-11-01 rule "orange only
  once THIS week's goal is reached" (styles.css block, `tools/pm-e2e.mjs`). `pm-e2e.mjs` 133 of 133; break-it (strip back to `w.hit`) 3 red.
  Review: Fast.

- **2026-11-24 — Sweet Child speed ladder, ONE round that stops and asks (Jonathan: "it should play once through verse at each
  speed ... a notification ... 'got it' ... 'practice again' ... remove the separate verse and chorus parts").** ca-54 has one
  round (verse + chorus, 24 bars), no round or section buttons and no Loop / Build / Stay switch: Play starts it at 90. After
  ONE time through `pcFrame` calls `pcLadderAsk` (`app/cards-loop.js`): the song stops and a box under the player (`.pc-ask`)
  names the tempo; Got it plays the next stop (90, 100, 112, 125), Practice again the same one, at 125 Got it finishes; Play
  always starts over at 90; a hand-picked speed turns Build off (plain loop, never asks). Two checks (up to 112, record speed;
  the 2-6 rule). Other cards unchanged. checks.mjs 1fc, 1eb and 1er re-pinned; `tools/smoke.mjs` and
  `tools/speed-ladder-loop.mjs` rewritten for it.

- **2026-11-24 — Sweet Child speed ladder, ca-54 (`03807845`, `f886ef02`; work order `WORK-ORDER-sweet-child-speed-ladder`).**
  ca-33's Verse 1 and Chorus 1 on a cut lyric sheet (14 names), three round buttons, bottom stop 90 (`slowestRate` 0.9),
  opens there (`startStop`), one lap a stop (`buildLaps` 1), Round 3 from 100, no Level up. The settings sit on ca-54
  alone (checks.mjs 1fc, 53 assertions, 13 of 13 break-its red). Played for real, muted: `tools/speed-ladder-loop.mjs`.
  `tools/smoke.mjs`'s server now answers byte ranges. `Review: Fast`.

- **2026-11-19 — The practice copy: why it would not publish, and the fixes (`a5aba48`, `0899b65`).** Its rules now
  go out through the Admin SDK (the CLI's Service Usage pre-check was refused 403; the IAM roles had landed on the class
  project's row and were removed again). From 12:38 the pages failed too: HTTP 429, the free plan's Hosting storage
  was full (about 290 MB a version, many runs that day). Jonathan set "releases to keep" to 3. Never add IAM roles
  without checking the project name at the top. `Review: Fast`.
- **2026-11-19 — W29: a site update waits for a private song still downloading (`5a46d4b`; Jonathan: "build it").**
  `busyReason()` (`app/start.js`) also waits while a card shows "Loading the song…" (`sfWait`) or any private file is in
  flight (`sfInflight`), 5 minutes at most. update-reload-loop 29 of 29 cases, 361 of 361 checks; break-it: each half
  removed turns its own line red. Not changed: the redraw's `progressLoadRetryBusy()` (`app/save.js`). `Review: Fast`.
- **2026-11-19 — WORKFLOW.md cut from 2,076 lines to 400 (Jonathan: "shorter and more concise").** The old text moved
  unchanged to `docs/workflow-history-to-2026-11-18.md` (all 1,855 old non-blank lines are in one of the two files).
  "For Windows" is now the top section (Jonathan: "put it at the top of workflow and also shift work to windows"):
  no more idle commits, W25 to W29. GitHub's browser jobs try Chrome's install twice. `Review: Fast`.

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

### Rules that were stated only in the old "Moved from CLAUDE.md" text

The full text: `docs/workflow-history-to-2026-11-18.md`, section 4.
- **Quiz giveaway allowlists** (Modules 1–6) are carried on purpose: sweeping a module, delete its entries first and
  let the check say what is left. 1av misses a card that prints a whole lookup table: read those by eye.
- **A ratchet** lists allowed words, not banned ones, when a banned word has an innocent twin (1w2). Site terms like
  "two homes" and "top of the ladder" are teaching devices, not idioms; 1w catches only retired phrases.
- **To raise `FROZEN_MC_THROUGH_MODULE`,** ask Jonathan which module the class is in.
- **`moduleOpenThrough` is per module number:** a student set to 4 before the 2026-10-12 swap now has Open Chords
  open; set them to 5 if Pentatonic should be open.
- **Until a `firestore.rules` change is pasted,** the writes it allows are refused and the feature looks broken with
  no error a student sees.
- **The Daily 5:** `DAILY5_ENABLED = false` is the whole switch; `WARMUP_BANK` stays though nothing reads it.
- **`merge=union`** was tried for the two log files and rejected (it misorders entries and keeps both versions of a
  line two sessions edited). No other file joins the keep-both rule.
- **The smoke in a cloud container running as root:** point `--chrome` at a two-line wrapper
  (`exec <chrome> --no-sandbox "$@"`), never change the tool.
- **Pushing to `main` is not a pause point** (2026-08-28): never offer "push the branch instead" as a coin flip.
- **A sweep's brief opens with the calibration line** ("convert EVERY card; do NOT skip one because the actions flow
  naturally — re-stitch it"), or the agents go timid.
- **Live preview:** VS Code Live Server; the sign-in wall's dev bypass loads a mock user whose progress never saves.

---

## Power Chord Switch: where we stopped

The game is in `coach-chords.js`; its listening is in `coach-core.js` and `coach-score.js` (older notes say
`coach.js`). It leaves the class about mid-December 2026. The full record (every decision with its measurements and
tables, 2026-11-03 to 2026-11-18): `docs/workflow-history-to-2026-11-18.md`, section 5.

**After it leaves: the base for a chord switch game** (Jonathan, 2026-11-20: "power chord switch will eventually be used
to develop a chord switch game"). Keep its takes (`tools/mic-sim/takes/`) and its timing rules (onset, rule A, the
whole-span rule, `ccLoop()`): the new game starts from them and is tested on those takes from day one. Measure again on
the new game's own takes: the strum ratio (1.8 / 2.19 is Power Chord Switch's only) and how a chord is named (open
chords ring six strings and share notes). Keep recording after mid-December: takes of open-chord changes (the new game,
or Change Up meanwhile) are what it needs.

**Live, and binding:**
- **Rule A (2026-11-18; Jonathan: "A: no pitch never counts", "Shared fix for all four").** One helper,
  `coachToneCredit` (`coach-core.js`, `COACH_TONE_FEW = 3`), in Power Chord Switch, Change Up, the Listening Coach
  (chords) and Note Runner: a strum with no pitch reading is never the chord; 1 or 2 readings count only when at
  least half are the target's notes; 3 or more go to each game's own vote. Takes since are stamped
  `toneRule: 'pitch'`. Recorded takes, Power Chord Switch, right / wrong / no strum: 322 / 49 / 45 → 296 / 77 / 43
  of 416 changes. Nothing played: 1,902 → 491 of 4,320 changes marked right (class talking is still 86% at 30 BPM:
  voices have a pitch). To roll back: `COACH_TONE_FEW = 0` (not proved: run the closed loop and 1ew first). It
  replaced the 2026-11-07 rejection of "no readable pitch, no tick", which never credited a strum under 3 readings.
- **The whole span (2026-11-14, Power Chord Switch only; Jonathan: "power chord switching is measuring the right
  chord not correct on time").** Any strum of the new chord from the early allowance before the change (half a beat, at
  most half the gap between changes) up to the next change makes it right (`ccSpanRule`); one strum is credited to one change at most. Change Up keeps the nearest strum (its
  score is about changing in time). Takes say `changePick: 'span'`. To roll back: `ccSpanRule` returns false.
- **Strum ratio 1.8 / 2.19, Power Chord Switch only** (`CC_POWER_ONSET_RATIO`, `CC_POWER_HF_RATIO`; 2.2 / 2.67 from
  2026-11-05, lowered 2026-11-07); every other loop keeps 1.4 / 1.7. The condition stays on its four lines with no
  comments: the console reads it as text. To roll back: the two constants and 1ck's `R.pw` pin.
- **Grid step cap 60 ms** in both chord games (Jonathan, 2026-11-09; class feedback can reopen it).
- **Count-in** 2 clicks below 60 BPM, 4 at 60 and above (2026-11-09). Tempo 10 to 140, opening at 30, in steps of 5
  only (1ca fails if a ±1 button comes back).
- **"Strum a little firmer"** when under 85% are right and the unheard plus no-clear-notes changes are 2 or more and
  outnumber the other wrong chords (`firmer` in `ccRenderDone`).
- **The stopped-game screens** (2026-11-07 and 08): section 2 of the history file, "Stopped-game headline".

**Rejected on measurement; do not rebuild:** a higher absolute onset floor (2026-11-04: 48 of 52 false hits and 55 of
132 real strums sit under 15 dB above the room); `ring` and `half` (2026-11-11, on the real takes).

**Settled by Jonathan (2026-11-04), not to be raised again:** the 30 s take cap; the three wordings for "on time but
the chord sounded wrong" stay different; the real-guitar mic check passed; no real mic check for Note Runner.

**Open, not decided:** a pair started at 30 BPM, sped up to 90 and played well offers "Again at 35" while the setup
reopens on 90 (`ccRoundBpm` is the one place to change if the student's own tempo should count).

---

## About this file

**Keep this file short** (Jonathan, 2026-11-19: "can we make workflow.md shorter and more concise?"):
- When an item closes, delete it here; do not tick it. Its record is the commit and the history files below.
- A "Recently shipped" entry is 5 lines at most: what changed, the commits, the review label, the numbers that
  matter. Proofs, tables and logs go in the commit message or a DETAILS file.
- When this file passes 400 lines, move the "Recently shipped" entries older than two weeks, unchanged, to a dated
  `docs/workflow-history-*.md` file.

**History, moved out unchanged.** Search it before re-deriving a fact or re-proposing a stopped idea. A pointer
anywhere in the repo to a WORKFLOW.md heading that is not in this file resolves there
(`grep -n "<heading>" docs/workflow-history-*.md`).
- `docs/workflow-history-to-2026-11-18.md`: every "Recently shipped" entry to 2026-11-18, the closed Open work items
  and their binding decisions, the old "Moved from CLAUDE.md" text, the full Power Chord Switch record.
- `docs/workflow-history-2026-11-11-to-17.md`: that week's "Where things stand" (Windows jobs W1 to W23, the Song
  builder parts, the rules pastes, the private audio steps, the beat maps).
- Older: `git show c751db8:archive/<file>` (`WORKFLOW-2026-buildout.md`, `WORKFLOW-2026-july-fixits.md`,
  `WORKFLOW-2026-research-upgrades-era.md`, `REVIEW-PLAN.md`, `PLAN-COMPACT-CHECKLIST.md`, `PLAN-COMPACT-JOURNEY.md`).

Status: [ ] open · [~] in progress. Dates are Pacific (`CACHE_VERSION` and commit times may show the UTC date).
