# Guitar Class Website — Claude Instructions

Operative rules only. History and the *why*: `WORKFLOW.md` ("Moved from CLAUDE.md" sections) (since 2026-11-08 the why is partly in the skills and rules files; WORKFLOW holds the dated decisions).
What is open right now: `WORKFLOW.md` → "Where things stand" (top of the file).

## Start here — the short list (read this even if you read nothing else)

**Before you say "done" on a code change:**
1. While working: `node tools/checks.mjs --check --skip-links` (a Stop hook now
   runs it for you at the end of every turn that changed code; if it blocks
   your stop, fix the cause — see "Stop hook" below). Before a push: the full
   `node tools/checks.mjs`. Never hand-edit the version lines in `sw.js`.
2. Touched a `module-N.js`? `node tools/rule-zero-proof.mjs origin/main`, and
   paste its summary into your report.
3. Touched a renderer, escaping, or 3+ files (counted as in "Triggers" below)? Run the
   **change smoke**: `node tools/smoke.mjs --en-only --only <areas> --baseline <ref> > file 2>&1`.
   A real browser walks the areas your change touches, in English (Jonathan, 2026-11-09: "it's
   taking forever"). Areas (`sets`, `games`, `activities`, `practice-minutes`, `tuning-sim`) and
   which files belong to each: the header of `tools/smoke.mjs` (`games` = the `coach-*.js` parts, `activities` = the `ca*`
   renderers in `app/*.js`). Unsure, or `app/*.js`/`styles.css` touched broadly → leave out `--only`. `<ref>` = the commit before your first change; it is
   walked only when your tree has errors, to sort out which are yours.
   - **A Fast change does not wait for it:** push once the full `checks.mjs` passes, then run
     the change smoke on the pushed commit and report its result. A failure is fixed in the
     next push, same session.
   - **An Always-Reviewed change** runs it before the push and waits.
   - **A risky or wide change** (load order, a shared renderer, the save path, a many-file refactor): also take a
     golden snapshot of what the site shows and saves, on the commit before and on your tree, then compare:
     `node tools/golden.mjs --out <dir> --shots` twice (`--root <site folder>` snapshots another checkout), then
     `node tools/golden.mjs --compare <dirA> <dirB>`. About 30 minutes each (29 and 38 measured 2026-11-13, longer
     under load); only one headless-browser run at a time (no smoke, `pm-e2e.mjs` or `slow-load.mjs` beside it); it
     uses Chrome for Testing when `CHROME` is set. Coverage is on by default: every run prints, per script, how many
     top-level functions it NEVER ran (names in `coverage.json`), and the compare prints that count for each file the
     two sites differ in. "Identical" says nothing about code a run never reached: read the header's "not covered"
     list. `--out` refuses a non-empty folder that is not a snapshot, the site, the checkout or anything above it.
     A small change does not need it.
   - **The full walk** (both languages, every area, no `--only`/`--en-only`) runs on GitHub
     Friday evenings (the Friday check reads it) and when Jonathan asks for **"the end-of-day smoke"** (no nightly task: his
     call, 2026-11-09). End-of-day smoke: `node tools/smoke.mjs --baseline $(git rev-list -1
     --before='today 00:00' origin/main)` on `origin/main`; for each new error find the commit
     (`--only <area>`), fix it, push, and report.
   It prints one line as each walk starts and nothing else until the end. It serves the
   checkout it runs in, so run it from a detached worktree at the commit under test
   (`git worktree add --detach <dir> <hash>`) and keep your own checkout free to edit. Run it
   with `run_in_background`. It stops
   itself: if no step starts for 120 s (`--stall`) or the run passes 40 minutes (`--timeout`),
   it prints `smoke: ✗ HUNG … Stuck at "<walk>: <step>"`, closes its Chrome and exits 3. A hang
   is a finding: report the step it names. Only a run killed from outside can leave Chrome
   behind (`pkill -f gc-smoke-chrome`). Never run it while another smoke or `pm-e2e.mjs` runs
   (macOS: `pgrep -f 'tools/smoke.mjs|tools/pm-e2e.mjs'`; Windows Git Bash: `ps -W | grep -E
   'smoke|pm-e2e'`).
4. Changed what a student SEES (a renderer, a colour, a new control, or
   directions that describe the music)? Before reporting:
   - Screenshot every state at 1366×657 — before, during and after any
     highlight or toggle — and look at each one. A change to the big-screen
     fill itself (`site-fill.js`, a `/ var(--site-fill,1)` unit) is also
     screenshotted at the classroom size, 2560×1300.
   - A sentence that states a pattern across the data ("root in one bar, 5th
     in the next") → prove it with a script over all of it and report the
     count ("76 of 76").
   - A new control or default → pin the default in `checks.mjs` and make
     `tools/smoke.mjs` click it and reload.
5. New student-facing text → its Spanish twin, same edit. A new step field →
   both step renderers.
6. A student can see the change → a `CHANGELOG.md` entry, same push.
7. Hit a review trigger? Always-Reviewed → spawn a fresh reviewer now, one per independent
   area ("Delegate site review work to agents by default"); after its last clean round, label the
   change `Review: Reviewed (…)`. Anything else ships **Fast** with a `Review: Fast` trailer.
   Both labels: "Fast by default".
8. Right before pushing: `git fetch`, then `git log HEAD..origin/main`. If it lists commits
   (another session pushed), run `git rebase origin/main` yourself; this is not a fork. Say what
   you rebased onto in your report. A conflict that is only the `CACHE_VERSION` line or inside
   the `AUDIO_HASHES` block of `sw.js`: edit just that hunk (delete the markers, keep either
   side; never `git checkout --ours/--theirs sw.js`, which replaces the whole file), then
   `git rebase --continue`. A conflict in `CHANGELOG.md` or `WORKFLOW.md` where each side only
   ADDED new lines at the same spot (two new entries): keep both whole, yours on top with the
   blank line between entries, delete the markers, `git add` the file, `git rebase --continue`.
   If either side changed or removed a line that was already there, it is an "other conflict".
   These cases and the `sw.js` ones may stop the same rebase: handle each; if any other file
   conflicts too, abort the whole rebase. Any other conflict (another `sw.js` hunk, a `module-N.js`, a
   danger-zone file): `git rebase --abort` and ask Jonathan. Never force-push, and never make a
   merge commit without asking. When the rebase ends, run the full `node tools/checks.mjs` on
   the rebased tip (plus `rule-zero-proof.mjs origin/main` if a `module-N.js` changed, and the
   smoke when those commits touch files you changed), commit the `sw.js` it rewrote, and push
   only when `git status` is clean. After pushing: `node tools/checks.mjs --live`.

**Never, whatever the task says:** move or renumber a section or step (progress
keys); reword a keyed MC's choices — or its English prompt — in a frozen module
or the one the class is about to enter ("Three regimes"); write `progress/{uid}`
from console code; write `config/class` except through `teacherWriteConfig()`;
change `firestore.rules` without telling Jonathan it needs a console paste;
re-level "the cure"; delete what is switched off (Daily 5, Take It to a Song
sections); resurrect the deleted student tour.

**Habits that catch the expensive bugs:**
- Grep before you edit — the same bug lives in sibling copies and in comments
  that describe the old behaviour. Fix them together.
- Unsure whether a change is allowed? Run the proof tool; don't reason it out.
- A check fails → fix the cause. Never loosen the check, or add an allowlist
  entry, to get green.
- Report what you verified with the denominator ("306 handlers compiled"), not
  "looks fine". A script that finds 0 in both the old and new tree proves nothing.
- Product calls, and rules that contradict each other, go to Jonathan through
  AskUserQuestion — don't pick silently.
- **Don't repeat verification that already passed** (Jonathan, 2026-11-12: "things that are overkill don't need to
  run again if checks have already passed"; "apply this to the future too"). A proof that passed on the same code is
  not re-run: not by you after an agent pasted it (spot-check one number at most), not by an agent whose change did
  not touch what the proof covers. Brief a fixer to re-run only the planted faults and cases its change affects, plus
  ONE final run. A low-stakes tool (an ungraded game's test, a small test fix) ships on its fixer's proof without
  another review round; keep reviewers for the save path, load order, listening and anything a student's work or
  screen depends on. This does not touch the push rules: the full `node tools/checks.mjs` and the hooks still run
  before every push.
- **Browser checks run in Chrome for Testing by default** (Jonathan, 2026-11-12). Drive it
  headless through `CHROME` with a small script, as `tools/smoke.mjs` and
  `tools/console-layout-smoke.mjs` do (a stub Firestore reaches the teacher console, which the
  dev bypass cannot). Use the Claude in Chrome extension only when the task needs a person-style
  click-through of the real page.
- A review is due (see "Delegate site review work to agents by default") → spawn the
  reviewers yourself, in parallel, without asking. A change that ships Fast gets none.

Which file to read before touching an area: the table under "Lazy-loaded guidance".

## Project
Write to Jonathan in plain English. Claude handles all git.
Static HTML/JS/CSS, no build; Firebase + Firestore; GitHub deploy. Module 13 is single-flow (`stations.b` only).
- **Stations B and C are merged in DISPLAY ONLY.** `stations.b`/`.c` and every progress key
  (`${w.id}-b-sec{gi}-{i}` / `-c-sec{gi}-{i}`) are unchanged — never "simplify" the data.
  `gi` = position after excluding only tuning-warmup sections (`storageSections()`);
  render-time hiding never renumbers it (1af). No "Station B/C" in student text: use
  **Checkpoint / Punto de control**, **Wrap-Up / Cierre** (1n). Only `m4w2` shows Part 1/2
  (1ao).
- Sections are addressed by `data-ns`, never by DOM position. The lesson panel's suffix
  `LESSON_TAB` stays `'station-b'` so old deep links resolve.
- A set is complete when the SET is: the sets gate, checklist, Module Review, search and
  `resumeLessonCounts()` never see a part.
- **Module 13** has custom tab labels (`stations.b.tabSub`, `checklistSub`), and its
  checklist is the graded assessment. A set is exactly two panels, lesson ladder and
  checklist (the per-set Songs tab was removed 2026-08-27).
- **No student tour** — don't resurrect. **No in-panel tab bar**: the rail is the only switcher.
- **Target screen: Chromebook 1366×657.** Every layout is designed and measured there, and it is the priority. A
  bigger screen shows that same layout enlarged to fill it (`site-fill.js`, 2026-11-13: student site, Song Journey
  pages, console and live-game stage; a new `vh`/`vw` is written `/ var(--site-fill,1)`, 1df). Phone width out of
  scope (no phone work or breakpoints unless asked; keep existing phone CSS and 1o).
- Shell: Windows *and* macOS.

## Where the code lives (since the 2026-11-11 cut)
There is no `app.js`, `coach.js` or `teacher.js` file: each was cut into parts, loaded in the order below. Find a function with `grep -n "function name" app/*.js coach-*.js teacher-*.js`.

| Script | Its parts, in load order: what is in each |
|---|---|
| the app: `app/*.js`, the `site-parts:app.js` script tags in `index.html` | `boot.js` Firebase, the lazy loaders, module i18n, auth · `save.js` Firestore, `swap45*`, games access, the progress writer (`flushSave()`) · `tab.js` render, chord links, inline TAB, strum patterns · `songfiles.js` private song files (2026-11-14; nothing is switched yet): the loader for a `private:<id>` track (pieces from Firestore `songFiles`, checked against the tracked list `SONG_FILES`, a copy kept in IndexedDB, the month's download count in `songFilesUsage`: the count guards honest use only, rules cannot count reads); `node tools/song-files-sim.mjs` after any change; the Journey pages cannot play a private song yet (1dx) · `snippets.js` backing-track snippets · `shell.js` modals, class picker, resume card, rail set switcher, explore pages · `lesson.js` render-time hiding, the lesson ladder, focus mode, parts, songs, Daily 5 (off) · `review.js` Module Review, Record Yourself, checklist, practice panel · `drills.js` practice log, tempo ladder, Find-the-Note, Shuffle, rep counter, MC shuffle, Card Deck, Ear Spark · `drills-call.js` Note Call, Call the chord, Name the power chord, "Keep it sharp" · `audio-ui.js` skill toggles, check-off gates, `playNote()`, BPM, Coach hooks, floating tools, nav drawer, resource viewer · `explore.js` navigation, Songs hub, Play Along, search, Keep practicing, Daily Review, My progress, the In-Class Activities page · `activities.js` activity deep link, Today hero, Focus view, paths, the practice-card body and its switches (versions, bass notes), (`caStepHtml()`) · `cards.js` the practice-card player (`pc*`, `pcStop()`), chord grid, lyric sheet (`caCardBodyHtml`) · `activities-2.js` exit checks, the activity board, pins, the activity gate · `start.js` service worker, the hash router, sign-in |
| the arcade: `coach-*.js`, `COACH_JS_PARTS` in `app/boot.js` | `coach-core.js` the listening code: tunables, detection loop, onset, pitch, the scoring criteria, mic recordings · `coach-hub.js` Note Hunt, the Games hub · `coach-chords.js` Change Up and Power Chord Switch (`ccLoop()`), Chord Blitz, Chord Detective · `coach-ear.js` Name That Riff, Pentatonic Simon (both), Fret Zap · `coach-strum.js` Strum Hero, Riff Roulette, Strum Radar · `coach-runner.js` Riff Runner, Note Runner · `coach-more.js` Finger Gym: The Ladder, Pattern Detective, Build-a-Chord |
| the console: `teacher-*.js`, `TEACHER_JS_PARTS` in `app/boot.js` | `teacher-core.js` dashboard, class period, keeping progress current, the views, sidebar, trouble spots · `teacher-activities.js` Class activities: board, list and detail, the one move writer, drag and drop, release dates, archive/delete (`renderTeacherActivityDetail()`) · `teacher-songs.js` Songs view · `teacher-config.js` gate clears, games access, the `config/class` reader and `teacherWriteConfig()` · `teacher-manage.js` Manage, Reports · `teacher-mic.js` Mic recordings and their evaluation · `teacher-students.js` Students view, Module Review ratings, practice minutes · `teacher-backup.js` "Download a backup" in Manage (read-only; `node tools/backup-proof.mjs` after any change) · `teacher-errors.js` Tools → Error log: the anonymous `siteErrors` entries the logger in `app/boot.js` (`SITE_ERRORS`) writes, and "Send a test entry" (`node tools/site-errors-sim.mjs` after any change to either; no name, uid or email may ever be added to an entry) · `teacher-livegames.js` the Games list in the Live In-Class Games view: order, rename, Remove / Restore, kept in `config/class.liveGames` through `teacherWriteConfig()`; `live-quiz.js` reads it through `lqPickerIds()` / `lqCustomTitle()`, and Start copies a custom name into `liveQuiz/current.title` (`node tools/live-quiz-loop.mjs` after any change) · `teacher-accounts.js` Manage → "Accounts by sign-in domain": requests to join (`accessRequests`), the allow list `config/access` (teacher-only; every write merges one key), the roster's outside accounts; the student's access screen is `accessRefusedAtBoot` / `showAccessScreen` in `app/boot.js` (`node tools/access-sim.mjs` after any change to either; the published rules are `firestore.rules`, the unpublished step 2 is `firestore.rules.paste2`, kept in step by `checks.mjs` 1dt) · `teacher-songfiles.js` Manage → "Song files": Upload, List, Verify, Delete; the console's only writer of the `songFiles` store, and Jonathan's click only (`node tools/song-files-console-sim.mjs` after any change; real songs are uploaded only after paste 2 is published; song files are left out of the backup on purpose) |

- **The old names are LOGICAL names.** Tools and check messages still say `app.js` / `coach.js` / `teacher.js` for "the whole script" (`siteSource('app.js')` in `tools/site-src.mjs`, which every Node tool reads them through). Never recreate those three files.
- **Load order matters now.** A new top-level statement that RUNS at load may only use what is defined in the same or an earlier part. Anything that starts things (a listener whose handler uses later parts, sign-in) is registered in `app/start.js`.
- **After changing any part:** `node tools/checks.mjs`, as before. A change to load order, a loader, the `index.html` script tags or the `sw.js` lists: also `node tools/slow-load.mjs`. (`tools/sw-upgrade-proof.mjs` proved the one-time move from `app.js` to the parts; it needs a pre-cut checkout as `--old` and is kept as the record.)
  - A change to `sw.js`, the service-worker block in `app/start.js`, `swResume*` in `app/boot.js` or `teacherResume*` in `teacher-core.js`: also `node tools/update-reload-loop.mjs` (headless Chrome, about 16 minutes, only one browser run at a time; every case passes, 29 of 29; the deep-link fault it found was fixed 2026-11-12).
- **Keep the parts small, so this never needs doing again.** A new feature (a new game, drill, console view, card type) gets its OWN part, not a new section at the bottom of the nearest one. New code otherwise goes in the part whose banner already covers it (the table above); a shared helper goes in the EARLIEST part that uses it, never a later one. `checks.mjs` 1cv warns when a part passes 2,000 lines and fails the push over 2,600; never raise those numbers without Jonathan.
- **A Fast change never stops to split a part** (Jonathan, 2026-11-11: "I frequently need fast changes"). Touched a part that is over 2,000 lines? Say so in one line of the report and ship as usual. Splitting a part (moving one banner section, whole and unchanged, into a new part loaded right after it, then `node tools/slow-load.mjs`) is its own change at a quiet moment, never bundled into something he asked for quickly. Only the 2,600 limit blocks; if a part is near it, tell him before it bites. `coach-core.js` is only split with him (the listening code).
- **A new part file** goes in `index.html`'s `site-parts:app.js` block (app) or the `COACH_JS_PARTS` / `TEACHER_JS_PARTS` array in `app/boot.js`, and, for an app or arcade part, in the `sw.js` lists (`checks.mjs` enforces it; a console part stays OUT of them, which it enforces too). Name it `app/<x>.js`, `coach-<x>.js` or `teacher-<x>.js`. Do not edit `tools/split-plan.json`: the cut is done, and that file and `tools/split-site.mjs` are kept only as the record of how it was made.

## Workflow
"Push to GitHub" / "Save progress with a note: [msg]" → checks, fix flags, commit, push, confirm. **Cowork can't push** (patch + `APPLY-<name>.md` as ONE zip; skill `session-handoff`).

### ⚠️ Pre-push checks before EVERY code push
Touching `index.html`, `styles.css`, an `app/*.js` part, `tuner.js`, a `teacher-*.js` part, `config-main.js` or a
`module-N.js`: `node tools/checks.mjs` must exit 0. It covers syntax, data, about 240 links (run
it before every push, even when no link changed) and the automatic `CACHE_VERSION` bump (1bt).
Flags: `--skip-links`, `--check`, `--live`. `--check` changes nothing. After you edit a cached
file, "shell cache stale" is expected and makes it exit 1 (the pre-commit hook then refuses the
commit) until the full `node tools/checks.mjs` rewrites `sw.js`. Any other ✗, including "audio
hash map in sw.js is stale", is a real failure. GitHub also runs `--check --skip-links` and four Node proof tools (`save-loop`, `visible-loop`, `live-quiz-loop`, `shared-chromebook-loop`) on every push to main (`.github/workflows/checks.yml`, 2026-11-13): a red run there means look at the last push; it does not replace running a tool yourself after changing its area. **GitHub also walks the site in a real browser after every push to main** (`.github/workflows/browser.yml`, 2026-11-13): the English smoke, one job per area, side by side; and `slow-load`, `update-reload-loop` and `playalong-loop` when their files changed (its header lists which). It runs AFTER the push, so it is the Fast change's smoke (read its result and report it; no need to run that smoke on the Mac as well), but an Always-Reviewed change still runs its smoke BEFORE the push (step 3). The two-language walk is its `full` job: Friday evenings on a schedule, or Actions → Browser tests → Run workflow → `full`. A branch pushed as `ci-try/<name>` is walked the same way; remote trial branches are deleted by Jonathan, not by Claude. **Stop hook** (`GC_STOP_CHECKS=0` turns it off)
and `.githooks/*` (`git config core.hooksPath .githooks`): if a hook prints "node not found —
skipping checks", it checked nothing, so run `node tools/checks.mjs` by hand. **Parallel
sessions share one `origin`:** fetch first, rebase onto `origin/main`, and never push a merge you
didn't intend (step 8 of "Start here").

### ⚠️ Three regimes decide what may change in a module
Key `${setId}-${station}-sec${gi}-${i}`: a step that changes INDEX loses its tick. Run
`node tools/rule-zero-proof.mjs <base-ref>` and paste output before any content push.
- **Modules 1–`FROZEN_THROUGH` (3)**: labels match BY INDEX; new steps only appended to a
  section's tail; no renames. Keyed-MC choices frozen (1ap); a keyed MC may be ADDED to an
  existing step; reword only via `response.renamedChoices` (old text → new choice). Re-pin 1ap.
- **Modules 4–`OPEN_THROUGH` (6)**: steps insertable anywhere inside a section; `response`
  removable/changeable; old labels keep relative order.
- **Above**: step count and order fixed; a rename prints.
- Every regime: SECTIONS fixed (count, order, kind); a TITLE may be reworded (prints) unless
  it has a `kind` or is the tuning warm-up title.
- **Raise `FROZEN_THROUGH` (= `FROZEN_MC_THROUGH_MODULE`) a module AHEAD of the class.** Locked
  sets are read-only previews; every answer writer needs `isPeekedResponseKey()` (1bl); treat the module the class is
  ABOUT to enter as frozen. A blocked fix → **Summer reset list** (skill `summer-reset`) same day.

### ⚠️ Modules 4 and 5 swapped
Open Chords = 4, Pentatonic = 5. Progress moves once per browser (`swap45*`, `app/save.js`): no `migrations.swap45` = OLD only, with it NEW only; keep all halves (`flushSave()`, `journey.js`, the `teacherFetchStudents()` remap in `teacher-core.js`). Prove with `rule-zero-proof.mjs d0cd004`.
- `moduleOpenThrough` is per module NUMBER; the swap didn't touch it.
- Course order lives in the module number: reordering again means another renumber.
- `rule-zero-proof.mjs` against the pre-swap `1a1f6cc` fails by design.
- Notes dated before 2026-10-12 may use the old numbers.
- Open (no record it was done): a tab that loaded a doc before the move and saved after it
  merges old-numbered keys back. Re-scan by hand the 3 docs the 2026-10-12 scan found with
  Module 4/5 work, for an old id coming back, any `m5w4-*`, or `chords-m5`.

### ⚠️ Other standing rules
- **Student data never goes to Claude** (Jonathan, 2026-11-13: "I am allowed to store data in google/firestore
  but not in claude"; his own name is fine). Whatever a tool reads, lists, prints or screenshots is sent to
  Anthropic. So never open, unzip, list the inside of, grep or print from: a raw recordings download
  (`mic-recordings-<date>.zip`, its unzipped folder, the per-take `mic-<game>-<Name>-…` files), a console backup
  (`guitar-class-backup-<date>.json`), or anything in `~/Documents/guitar-class-private/`. Bring recordings in only
  with `node tools/mic-sim/takes-in.mjs` (it removes the names and prints counts); work on the anonymized
  `T01…` copies. Never open the real teacher console, the Firebase console, Gmail, Drive or Classroom with the
  Chrome extension or a Google connector; site checks use headless Chrome for Testing with the stub Firestore.
  Never print a student's name, email or uid from a transcript or a log: count, don't quote. A tool's test data
  is made up ("Test 0"). `.claude/hooks/no-student-data.mjs` blocks the file reads and makes the browser and
  connector tools ask first (`checks.mjs` 1dc keeps it wired); it is a guard rail, this rule is what binds. A
  Bash heredoc that merely NAMES one of those paths is blocked too: write that code with Edit / Write.
- **The pitch detectors are pinned** (`checks.mjs` 1cx runs `tools/tone-test.mjs`: made-up tones through the real
  `coachDetectPitch` and the tuner's detector). A deliberate detector change: the mic-sim closed loop first, then
  re-pin with `node tools/tone-test.mjs --measure` in the same commit, with the reason. **GitHub's `lint` job**
  (`node tools/lint.mjs`, report-only) lists names no script on a page defines and load-order slips; run it before
  deleting or renaming a shared function; never add a name to `OUTSIDE_GLOBALS` in `eslint.config.mjs` unless it
  exists at run time.
- **A bad day** (the last push broke the site, students stuck on a broken cached copy, saved work lost): follow
  `BREAK-GLASS.md`. Google sign-in or saving down: `docs/when-google-is-down.md`. After a change to `sw.js`, the
  service-worker block in `app/start.js`, `swResume*`, or the audio cache names in `tools/sw-audio-map.mjs`: also
  `node tools/kill-switch/proof.mjs` (Node, about 1 s; it must end "14 of 14 mutations caught").
  `tools/kill-switch/kill-sw.js` is never loaded by the site and goes in no list.
- **Practice copy** (2026-11-14): the same files at `https://guitar-class-practice.web.app`, talking to the empty
  practice project `guitar-class-practice` (made-up data only, never class data). `firebase-config.js` alone picks the
  project by address (its two Hosting names and preview channels → practice, with a striped "PRACTICE COPY" strip
  and "[practice]" titles; every other address → the class project, unchanged); `checks.mjs` 1ed pins it.
  `.github/workflows/practice.yml` publishes it (main → live + `firestore.rules`; `ci-try/**` → 7-day preview) with
  the secret `FIREBASE_PRACTICE_SA`. Never add a second project to `.firebaserc`, and never deploy to the class
  project from this repo.
- **Two guards that only report** (2026-11-13). `checks.mjs` 1dp warns when an English string changes and its Spanish twin does not (`tools/i18n-drift.mjs`): read each line it prints; a line printed in full is a changed fact, order or meaning. Removing twins on purpose (a Journey page, a game's strings) also lowers `DRIFT_FLOOR` in `tools/checks.mjs` (1dp) to the new count, as a pin-only edit in the same commit. The accessibility scan (`node tools/smoke.mjs --only a11y`, axe-core, vendored) runs report-only on GitHub after every push (`browser.yml`, job "a11y scan"); its ratchet against `tools/a11y-baseline.json` (`--a11y-ratchet`) stays OFF until a week of GitHub runs show 0 new signatures and a reviewer has passed the switch-on.
- **Sweep ratchet**: 3+ instances of a mechanically-detectable error class → permanent `checks.mjs` detector, same session; it must render/execute, match UNESCAPED strings (`unescapeJs()`); break it in a scratch copy and watch it fail.
- **Activity order/placement** live on the console board (`config/class.activityBoard`,
  `caBoardOrder()`, `teacherMoveActivity()`); a digit in a title is a SERIES number (1d, 1l). **`config/class`** writes only via `teacherWriteConfig()` (1ai; omit `base` unless a single-cell toggle).
- **`firestore.rules` change** → tell Jonathan: Firebase console → Firestore → Rules → paste →
  Publish (GitHub Pages doesn't deploy it). Before that: `tools/pm-rules-test.mjs` and
  `tools/rules-core-test.mjs --breaks` on the Firestore emulator (and `tools/site-errors-rules-test.mjs --breaks --site <repo>` for the `siteErrors` block) (their headers say how; GitHub runs both after
  every push, `.github/workflows/rules.yml`). A case named "today: …" turning red means a rule was tightened:
  make sure that was the point.
- **Skills edit** → bump `skillCount` in `MODULE_MANIFEST`.
- **Practice minutes** (`practice-minutes-config.js` + `practice-minutes.js`): counts always; the display
  is on (`uiOn: true` since 2026-11-01; the pin is in `tools/pm-sim.mjs`). Its `firestore.rules` blocks must be published BEFORE the code
  that writes them; `dailyCapMinutes` and the rules' `dailyCapSeconds()` move together (1cg). Entry:
  `WORKFLOW.md` → "Recently shipped" → the 2026-11-01 "Practice minutes" entry.
- **Play-along first**: a song link opens its play-along card if one is openable
  (`songsPlayAlongCard()`, at the click), else the Journey page; no per-song retire list (1bn).
  `TAKE_TO_SONG_ENABLED`/`DAILY5_ENABLED` false: switched off, never deleted.
- **Changelog**: student-facing change → dated top `CHANGELOG.md` entry, same push, student's view.
- **Plant a fault, weekly, report-only** (`tools/plant-a-fault.mjs`, `.github/workflows/plant-a-fault.yml`, Tuesdays
  2:23 AM Pacific): GitHub plants small mistakes one at a time in the risky code (save, offline cache, rules,
  listening, sign-in, song files, the console's config writer) and lists any no tool caught; one that got through
  never fails the run. Look at one with `node tools/plant-a-fault.mjs --replay <id>` (plants it in a scratch copy and
  runs its tools). Harmless or accepted → an entry with a one-line reason in `tools/plant-a-fault-known.json`; a real
  gap → a test in the tool that should catch it. Renamed a function its table names? `checks.mjs` 1ea warns (it
  never blocks) and the weekly run says "table stale": update the table.

## i18n
Every new student-facing shell string goes in `i18n.js` (read its header for wiring: `data-i18n` / `t()` + `data-i18n-params`) in BOTH `en` and `es`, same edit; never English-only. Module text gets `_es`; Journey pages `data-es`. Reuse its glossary. String names are solfège (`cuerda Mi grave`); chord symbols/keys are not (`tonalidad de G`, `G/B`). The code is the authoritative Spanish: no review sheet; no proofread sweeps unless asked. `i18n.js` loads before the `app/*.js` parts, `fab-tools.js`, `tuner.js`, `journey.js`.
- Glossary, loanword policy and settled ES terms: `claude/spanish-terminology.md` in the
  Claude project (not in this repo).
- No check enforces the solfège rule: check it by eye whenever you touch module Spanish.

## Content rules
- **Simplest direct wording**: short sentences, plain verbs, no idioms, define each music term at first use (1w; modules — an In-Class Activity line uses the plain word instead, below); defined site terms ("two homes") aren't idioms. Define "root" once, in the first visible Module 2 step using it: the note a chord is named after.
- **No teacher speak**: no lesson-plan words (self-assessment, reflect, benchmark, objective,
  demonstrate/apply/identify), poster lines, praise padding, or "why this matters" sentences;
  "assessment" only as "(assessment preparation)" in Challenge titles (1w-t).
- **Typed answers only when writing IS the task**; else play something with a countable
  "got it" line (1ar). 1ar's per-module budget (Modules 3–6) fails only UPWARD; it counts
  every `response:{type:'short'}` in the data, rendered or not.
- **In-Class Activities: one short line per direction** (Jonathan, 2026-11-10: "students don't read them anyway").
  Step `text`/`text_power`, `intro`/`intro_power`, practice-card check `text`, `bassDirections`, a recording
  version's `intro`, each drill's direction line before Start and a practice card's directions line (i18n.js): ONE sentence, verb first, what to play
  and the finish line together, one rendered line at 1366×657 in both languages (1cs caps the length). Keep the
  count — the tap dots read it from the whole line (`caStepHtml` passes `wholeLine`; 1bg holds EN = ES). No list,
  no "You've got it when:", no fix-it line, no definition. `_es`: shorten the existing Spanish, reuse its words.
  A drill that already says what to do and when it is done takes no step text (ca-23). Exit checks (ca-14, ca-15) stay frozen. He asked
  for the rewrite, so "preserve the author's words" below does not cover activity directions.
- **Multi-step directions are lists (modules)** (`<ol>`/`<ul>`, `_es` mirrors; >~200 chars, 2+ actions). "You've got it when: …" is plain text AFTER `</ol>`, never an `<li>` or a
  hand-written span; "No score —" notes, partner bonuses, Journey links, then `step-figure`, all last.
  Scope: step `text:` and practice `prompt`s. Leave alone single actions, hints, `gotItWhen`,
  placeholders. Preserve the author's words; never rewrite the voice (Jonathan, 2026-07-25).
- **Challenge cards** (`Challenge N — Title:`): full title in `label` (<~70 chars), `text`
  opens into directions, body always a list; defining parentheticals go in text, identifying ones stay in the title; existing lists byte-for-byte.
- **Presentation is render-time.** **Strings named, never
  numbered** (low E · A · D · G · B · high e; 1j). Chord shorthand like `xx4432` is notation
  and stays. The only numbers allowed are anchored to the name: Module 7's two root-naming
  MCs ("string 6 (the low E)") and the `diagram.string*` labels in `i18n.js` ("Low E (6th
  string)"); 1j pins the count. **No paper drills** (scissors/cards/pen): `step.drill` (`shuffle`/`deck`/`ear`/`notecall`; `DECKS`, `EAR_POOLS`); drop "Got someone around?" from deck cards.
- **TWO step renderers**: `caStepHtml()` (`app/activities.js`) and `renderTeacherActivityDetail()`
  (`teacher-activities.js`) — a step-field change edits both (1v); practice cards/exit checks: `caCardBodyHtml` (`app/cards.js`; 1bf).
- **Keyed MCs** (`response:{type:'mc'}`, ungraded): shuffled at
  render (`mcOrder`, `MC_PINNED`); keyed step stores choice **text**, practice panel the
  **index** (not pinned by 1ap: wording free, ORDER held) — don't unify. Seed = ENGLISH prompt + choices, so both languages and every student (the projector) see one
  order; a reword re-rolls it. Fewer than 3 choices are not shuffled. `MC_PINNED` is narrow on
  purpose (catch-alls only). `answer: 0` is fine (the shuffle hides the slot). Never name an option by position; rewording after students arrive orphans picks. **1ap** pins Modules
  1..`FROZEN_MC_THROUGH_MODULE` (**3**) by fingerprint — raise with the class (re-run, paste
  fingerprints, same commit); don't lower. Check a video's watch range
  before writing a question about it; new authoring fields go in `STUDENT_VALUE_NAME_RE`.
- **Videos**: never invent YouTube IDs; `WebSearch` + oEmbed verify, else drop. In a cloud
  session, reach oEmbed through `WebFetch` (`curl` is blocked).
- Prefer diverse creators: before settling on Marty Music / JustinGuitar / Andy Guitar, spend
  one search on a comparable lesson from a woman, a creator of colour or a Spanish-language
  channel. Lesson quality still wins.

## Lazy-loaded guidance — read before touching these areas
**Read the matching file first** — its ⚠️ rules bind.

| Area | File | Critical rule kept here |
|---|---|---|
| Backing tracks, snippets, card audio, Journey clicks, `playNote`, `audio/` | skill `audio-and-snippets` | Snippet windows are bars, never seconds; never measure a second anchor; never pitch-correct one mix alone; new "silence it" call → `stopCardAudio()`; **every backing track is levelled to "the cure" (−12.5 LUFS) with `python3 tools/loudness.py <slug>`, one gain per song — never re-level the cure**; after a timing or track change run `python3 tools/beat-audit.py --only <slug>`: it only lists, and its "cannot tell" bars and card sections under 4 bars still need ears; after any change to a practice card's chart, to `SNIPPET_TRACKS`, or to the player in `app/cards.js` / `app/snippets.js`: `node tools/playalong-loop.mjs` (`--only <id>` for one card; headless Chrome, one browser run at a time) and report its summary line |
| In-Class Activities, gate, exit checks, practice cards, Songs Core rows, render-time hiding, **two step renderers, activity board and numbering, play-along-first links** | skill `in-class-activities` | Exit-check `items` are positional — frozen once taken; don't fold "Play Along now" into `caIsVisible()`; take-to-song is switched off in every module (`TAKE_TO_SONG_ENABLED`) — don't delete the sections, they hold `gi` |
| A new Play Along song from an mp3 Jonathan uploads (a student's song request, "make a play-along from this mp3") | skill `new-playalong` | Measure the record before writing a card (`python3 tools/playalong-measure.py <mp3>`): bar 1 is the first LOUD beat 1, the meter is from the chord changes (3/4 or 6/8 when both fit: ask him), a chord comes from his chart only (read a picture's chords back to him first); `node tools/new-playalong.mjs <spec> --from <mp3>` types the card, track and pins; a `library: true` card is live for every student on push |
| Core/Choice song chords, keys, timing, bar numbers | skill `song-facts` | Don't re-flag settled facts; don't verify BPM in audits |
| Cloud pushes, Cowork handoff, hook details | skill `session-handoff` | Cowork can't push; the web can |
| The progress save (`app/save.js`, `logPracticeRep`, `ecSubmit` / `flushOnHide`, `caPickPath`, any other write to `progress/{uid}`) | the header of `tools/save-loop.mjs` | After any change: `node tools/save-loop.mjs` (about 10 s; it must end "untagged 0"; each FAIL prints its replay command). The change itself is still danger-zone: Always Reviewed |
| Sign-in and sign-out (`app/start.js`, `signOut` / `_uidKey` in `app/boot.js`), the hide / unload flushes, any per-student localStorage or sessionStorage key | the header of `tools/shared-chromebook-loop.mjs` | After any change: `node tools/shared-chromebook-loop.mjs` (Node only, about 75 s; it should exit 0 with KNOWN K-TAB inside its printed band) |
| Fixes blocked by frozen modules | skill `summer-reset` | Add any blocked fix there the same day; raising FROZEN_* never unlocks anything |
| Live quiz | `.claude/rules/live-quiz.md` (loads with `live-quiz.js`) | Nothing on the stage may reveal the answer before the reveal; after any change to `live-quiz.js`, its `lq.*` strings or the answers rule: `node tools/live-quiz-loop.mjs` (about 20-35 s; exit 1 = a rule broke, replay with `--case=<name> --verbose`) |
| Set band, left rail, nav grid | `.claude/rules/rail-layout.md` (loads with `styles.css`/`index.html`) | The nav two-column grid is permanent — don't re-simplify; measure, don't do arithmetic |
| Journey tab cards and Journey-page decisions | `.claude/rules/journey-pages.md` (loads with `tabs/**`) | Restyle `.tab` in both stylesheets or neither |
| Writing any JS (`app/*.js`, `teacher-*.js`, `coach-*.js`, `live-quiz.js`, `fab-tools.js`, `tuner.js`, `tabs/journey.js`) | `.claude/rules/code-hygiene.md` (loads with those files) | Inline handler args use `jsonAttrArg(x)`, never `'${escAttr(x)}'`; never a mid-line `//`; grep sibling copies and old-behaviour comments before and after a fix; stop everything you start; escape student-written values |
| Teacher console shared config, **`config/class` write rule** | `.claude/rules/teacher-console.md` (loads with `teacher-*.js`) | A superseded read returns the newest read, never `null`; a diverged write never marks the copy current; visibility via `teacherBoardView(cfg).assigned`; after changing which activities a student sees or lands on (`caIsVisible` / `caBlockers` / `caBoardOrder` / the first-card pick, `showApp`'s landing, the console's or the Journey pages' copies, `classConfigSignature`): `node tools/visible-loop.mjs` (about 16 s); before changing `teacherWriteConfig()`, `loadTeacherClassConfig()` or any `config/class` writer, run `node tools/two-consoles-loop.mjs` before and after and report both tables (today's code fails about 10 to 25 of 1,000 schedules on the listed faults) |
| The weekly review of commits that shipped Fast | skill `friday-check` | Runs unattended Fridays 11 PM; new dated tag each run, never move one |
| Whole-site audits, many-file refactors, 50+ string passes with sub-agents | skill `site-sweep` (playbook + auditor/fixer/reviewer briefs) | Pre-create the worktrees; cherry-pick to one linear branch; an adversarial review of the *fixes* is required; fetch before pushing |
| Changing how a game LISTENS (`coach-core.js` onset, pitch, grading rules; the `ccLoop()` grading lines in `coach-chords.js`), or testing one | `tools/mic-sim/README.md` (the closed-loop entries) | Before proposing a listening rule: `node tools/mic-sim/closed-loop.mjs --rooms=room7,room4`, then the same with `--no-guitar`. Each run ends with the REAL TAKES section (the recorded student takes replayed through the real game code), which outranks the synthetic rooms when they disagree (Jonathan, 2026-11-12: "we'll have to rely on recorded student takes"); report both, real takes first. `--against=<json>` compares a changed rule with today's, real takes first. The REAL TAKES section covers every game with recorded takes (Power Chord Switch, Listening Coach, Note Runner). For a Listening Coach, Note Runner or Strum Radar rule also run `node tools/mic-sim/no-guitar-listen.mjs` (what a round earns with nothing played) and `node tools/mic-sim/replay-listen.mjs --noise`. To compare a changed rule against an answer key: `node tools/mic-sim/listen-loop.mjs --game=melody|chords|radar|runner --json=<f>` before, then `--root=<copy> --against=<f>` after (false fails and false passes by room; for single notes read the `class` room, room4 / room7 are harsher than the real rooms). When it prints "ASK JONATHAN", tell him it is a good time to download takes and run `node tools/mic-sim/takes-in.mjs`. The `ring` and `half` rules were rejected on real takes (2026-11-11): do not rebuild them |
| "Hear It First" ear trainer (`trainer-*.js`, `tools/trainer-sim.mjs`) | the header of `trainer-core.js` and of `tools/trainer-sim.mjs` | Hidden from students (direct link only); after any `trainer-core.js` change run `node tools/trainer-sim.mjs` (it is NOT in `checks.mjs`); only the adapter file touches site globals; never edit `coach-*.js`/`tuner.js` behaviour for it |

## How to work with Jonathan
**AskUserQuestion, not free text** (2–4 options), one question per turn unless truly independent. **Don't ask "should I proceed?"**: do the obvious, reversible work; "can you…/how do I…/should this be…" about code = do it. In doubt: pick a default, proceed, say why. Pause only for a real fork, irreversible / outward-facing actions. **Pushing to `main` is not one of those:** checks pass and a
fast-forward is what you'd recommend → push, say what landed, `checks.mjs --live`. Ask for a merge commit, a conflict you cannot resolve mechanically (step 8), failing checks, or unready work.

**Sweeps (50+ items)**: a second agent told to *find problems*, auditing the FIXES (`site-sweep`).

**Delegate site review work to agents by default.** Standing permission (Jonathan, 2026-11-08): when a review is due, spawn the reviewers yourself and at once. Do not ask first and do not wait to be told to use agents. This overrides the Agent tool's "when in doubt, don't spawn" for review work only.
A review is due when a change is Always-Reviewed ("Fast by default"), Jonathan says "review this" / "Reviewed", it is the Friday check, or it is a sub-agent sweep. This does not change "Fast by default": a change that hits only an ordinary trigger still ships Fast with no reviewer, and a change with no trigger has no trailer.
- **Parallel by area.** One reviewer per independent area (for example the coach stop path, the Tuning Simulator, small Fast commits), all spawned in a single message. Use `site-reviewer-deep` for a danger-zone file, 50+ strings or any sub-agent sweep, otherwise `site-reviewer`. Leave `model` and `effort` unset: the agent files pin Fable at medium (Jonathan, 2026-11-09). Only the Friday check overrides them (Opus, `xhigh`).
- **Re-review every fix round with a fresh agent.** After fixes, spawn a new reviewer; never reuse the one that found the bug. On 2026-11-08 every `coach.js` round found a real major bug in the previous round's fixes. Stop after the first round with no BLOCKER or MAJOR finding (severity words as in `.claude/skills/site-sweep/reviewer.md`); fix its MINOR findings with a break-it proof and start no new round for them. At most 3 rounds: if round 3 still finds a BLOCKER or MAJOR, stop and ask Jonathan (AskUserQuestion) whether to ship, revert or keep going.
- **Fixers.** Fix findings in one file family yourself. Spawn `site-fixer` only when they span two or more independent file families: create its worktree first, spawn it there, then cherry-pick its commits. Before spawning more than 3 agents, read skill `site-sweep`.
- **Brief each agent with the limits.** Its own worktree only; no push; no `tools/smoke.mjs` or `tools/pm-e2e.mjs`; no Chrome while a smoke run is going (check with the `pgrep` command in step 3, because another session's run counts).
- **Short reports** (Jonathan, 2026-11-13: "accurate and efficient"). Every brief says: the final message is 20 lines at most (verdict or tip first; counts with denominators; what needs the lead or Jonathan); tables, quoted lines, proofs and logs go in ONE details file in the session scratchpad (a reviewer: its scratch folder), path given, which the lead reads only to verify. Only a reviewer's one line per BLOCKER / MAJOR (file:line) may pass the cap.
- **Smoke and reviews run at the same time**, smoke in its own detached worktree (step 3), so your checkout stays free for your own area.
- **Treat agent output as claims.** Read every quoted line yourself. Make a fixer prove each new guard by breaking the code and pasting the red line. Send product choices found in a review to Jonathan with AskUserQuestion.

**Agents for ordinary work too, at your discretion** (Jonathan, 2026-11-11: "agents and subagents are fine for normal changes too to speed things up"). The 2026-11-08 permission above covered review work only; this widens it. For any change, spawn agents (and let an agent use sub-agents) when that gets the work done sooner: independent parts built in parallel, a long search or audit, a test run while you keep editing. Do not ask first. This overrides the Agent tool's "when in doubt, don't spawn" for this repo. It does not change who reviews what: "Fast by default" still ships with no reviewer, and the reviewer models and effort above stay as pinned.
- Still your call each time: a few tool calls or one file family is faster done yourself.
- Every brief states a size (how many agents or sub-agents, how many browser runs) and the limits in "Brief each agent with the limits".
- Agents that edit work in their own worktree, created first; you cherry-pick their commits. Only one smoke, `pm-e2e.mjs` or other headless-Chrome run at a time on this machine.
- "Treat agent output as claims" applies to builders as much as to reviewers.

**Triggers.** Review trigger = 3+ files, a danger-zone file (the console's config plumbing: `teacherWriteConfig()` and the `config/class` reads in `teacher-config.js`,
`sw.js` code, coach detection in ANY `coach-*.js` part (the onset and pitch detectors and the grading rules: ratios, gates,
windows; most of it is `coach-core.js` and `ccLoop()` / `ccResolvePend()` / `ccFinish()` in `coach-chords.js`, but each game's own loop and judge count too; not a game's screens, wording, tempo controls or count-in), the app's save path (`app/save.js`, and any other direct write to `progress/{uid}`), `firestore.rules`), or 50+ strings.
Not counted: `CHANGELOG.md`, `sw.js` version lines and its `AUDIO_HASHES` block (both written by `checks.mjs`, never by hand; a new song's audio is not a danger-zone change), a string's Spanish twin, pin-only
`checks.mjs` edits. A guard on a new default, or extending what a check reads: break-it proof only (paste output). A new KIND of check, or changed logic/matching, is a trigger (`site-reviewer`, high) plus break-it. Reviewer: `site-reviewer-deep`
for danger-zone / 50+ strings (failing scenario first), else `site-reviewer`. Agent claim → read its quoted lines yourself; agent fix → make it re-derive it on the real code.

**Fast by default** (2026-10-31) — a trigger no longer asks. After the build and every "Start here" step (the change smoke runs AFTER a Fast push, step 3), ship **Fast**: no reviewer, and every Fast commit ends with the trailer line `Review: Fast` (above any Co-Authored-By); a change a reviewer agent read before it shipped ends `Review: Reviewed (<reviewer>, <N> round(s))` instead. A change is labelled as a whole, never some commits Fast and some Reviewed: the lead sets the label on its unpushed commits after the last clean round, `node tools/review-trailer.mjs <range> fast|reviewed "<reviewer>, <N> rounds"` (`checks.mjs` 1dw warns on a mixed range or a Fast danger-zone file). The Fast report starts "Fast — reviewer skipped; Friday check will review it." **Always Reviewed, same day, never Fast:** danger-zone file, a new kind of check that ships on its own
(a ratchet or detector; a check that guards the feature it ships with gets break-it proof only), sub-agent
sweep, moving/adding/removing a section or step. A product change Jonathan asks for (a renderer, a game's
flow, a console view) ships Fast unless it touches one of those (Jonathan, 2026-11-09, about the 2-click
count-in and Today's activities by date: "these should have been fast changes"). Jonathan says "review this" / "Reviewed" → review same day. No trigger → no trailer.
Both splits are unproven. A Friday check finds a Fast change that hurt students → move that
kind of change to Always-Reviewed. A high review lets a real bug through → move that kind of
change to `site-reviewer-deep`.
**Friday check** — a scheduled task, Fridays 11:00 PM Pacific, reviews every `Review: Fast` commit since the last `friday-check-*` tag (`Review: Reviewed` ones are skipped), fixes and pushes (skill `friday-check`).

**Effort**: both reviewers are Fable at `medium` during the week (Jonathan, 2026-11-09, after the test in WORKFLOW); the Friday check's reviewers are Opus at `xhigh` (skill `friday-check`); other agents `high`; never `max`. Session: `medium` routine, `high` bug fixes / JS / keyed-MC, `xhigh` danger-zone and sweeps; a tier above the session → ask for `/effort`. Report real numbers, not the premise; name the prior decision a request reverses.

**"Next steps for Power Chord Switch"** → read the `WORKFLOW.md` section "Power Chord Switch: where we stopped" first (the game is in `coach-chords.js`, its listening in `coach-core.js`; that section says `coach.js`): what shipped 2026-11-03, the room-noise decision (a stricter strum ratio for Power Chord Switch only: 2.2 / 2.67 from 2026-11-05, lowered to 1.8 / 2.19 on 2026-11-07; the strum what-if numbers on the real takes and how to roll it back are recorded there), the pitch readings saved in takes since 2026-11-05 and the console's Pitch-rule table (read 2026-11-07: the pitch rule was rejected; do not build it), and what is settled. The practice-minutes heartbeat removal is finished.

**Work for another session → give the blurb the first time** (Jonathan, 2026-11-11: "just give me the blurb the first time"). Whenever your answer means another Claude session has to do, avoid or know something (a fix you advise it to make, code it must leave alone, a merge it must pull), end that same message with the text to paste to it, in a code block, complete enough to act on alone. Do not wait to be asked, and give a new one when the facts change.

New unrelated topic → AskUserQuestion once: fresh chat or continue?

Dated decisions and reasons behind these rules: `WORKFLOW.md` → "Rationale behind the
CLAUDE.md rules" and "Moved from CLAUDE.md (trim 2)" (cut to the decisions, the reasons and a
few rules stated only there; not the full old text).
