# Guitar Class Website — Claude Instructions

Rules every session needs. Area rules load from `.claude/rules/*.md` with their files; skills hold the rest
("Lazy-loaded guidance"). Why: `WORKFLOW.md` → "Rationale behind the CLAUDE.md rules". Open now: `WORKFLOW.md` →
"Where things stand". History: `docs/workflow-history-*.md`.

## Start here — before you say "done" on a code change

Which loop after which change: `docs/which-loop.md`.

1. **Checks.** While working: `node tools/checks.mjs --check --skip-links` (the Stop hook runs it at the end of every
   turn that changed code; if it blocks your stop, fix the cause). Before a push: the full `node tools/checks.mjs`.
   Never hand-edit the version lines in `sw.js`.
2. **Touched a `module-N.js`?** Paste the checks' 1dl line (`rule-zero-proof.mjs`) into your report.
3. **Touched a renderer, escaping, or 3+ files** ("Triggers")? Run the **change smoke**: `node tools/smoke.mjs
   --en-only --only <areas> --baseline <ref> > file 2>&1`. Areas (`sets`, `games`, `activities`, `practice-minutes`,
   `tuning-sim`) and their files: the header of `tools/smoke.mjs`. Unsure, or `app/*.js` / `styles.css` touched
   broadly → no `--only`. `<ref>` = the commit before your first change.
   - **Fast:** push once the full `checks.mjs` passes. GitHub's `browser.yml` walk after the push is the change smoke:
     read and report it. A failure is fixed in the next push, same session.
   - **Always-Reviewed:** run the smoke before the push and wait for it.
   - **Risky or wide** (load order, a shared renderer, the save path, a many-file refactor): also a golden snapshot
     before and after: `node tools/golden.mjs --out <dir> --shots` twice (`--root <folder>` for another checkout),
     then `--compare <dirA> <dirB>`; about 30 minutes each. "Identical" says nothing about code a run never reached:
     read its coverage counts and the header's "not covered" list.
   - **The full walk** (both languages, every area): GitHub on Fridays; on request, **"the end-of-day smoke"**: `node tools/smoke.mjs --baseline $(git rev-list -1 --before='today 00:00' origin/main)` on
     `origin/main`; for each new error find the commit (`--only <area>`), fix, push, report.
   - Run a smoke with `run_in_background` from a detached worktree at the commit (`git worktree add --detach <dir> <hash>`). `smoke: ✗ HUNG … Stuck at "<walk>: <step>"` (exit 3) is a finding: report the step. A run
     killed from outside can leave Chrome behind: `pkill -f gc-smoke-chrome`.
   - **At most TWO headless-browser runs at a time**, another session's included (smoke, `pm-e2e.mjs`,
     `slow-load.mjs`, golden, any Chrome loop). Check first: macOS `pgrep -f 'tools/smoke.mjs|tools/pm-e2e.mjs'`;
     Windows Git Bash `ps -W | grep -E 'smoke|pm-e2e'`.
4. **Changed what a student SEES** (a renderer, a colour, a new control, directions that describe the music)?
   - Screenshot every state at 1366×657 (before, during and after any highlight or toggle) and look at each one.
     A change to the big-screen fill itself (`site-fill.js`, a `/ var(--site-fill,1)` unit): also at 2560×1300.
   - A sentence that states a pattern across the data → prove it with a script over all of it; report the count
     ("76 of 76").
   - A new control or default → pin the default in `checks.mjs` and make `tools/smoke.mjs` click it and reload.
5. **New student-facing text** → its Spanish twin, same edit (`.claude/rules/i18n.md`). A new step field → both step
   renderers.
6. **A student can see the change** → a dated top `CHANGELOG.md` entry, written from the student's view, same push.
7. **Review trigger hit?** Always-Reviewed → spawn fresh reviewers now ("Delegate site review work"), then label the
   change `Review: Reviewed (…)`. Anything else ships **Fast** with a `Review: Fast` trailer ("Fast by default").
8. **Right before pushing:** `git fetch`, then `git log HEAD..origin/main`. Commits listed → `git rebase
   origin/main` yourself (not a fork) and say what you rebased onto.
   - Conflict only in the `CACHE_VERSION` line or inside the `AUDIO_HASHES` block of `sw.js`: edit just that hunk
     (delete the markers, keep either side; never `git checkout --ours/--theirs sw.js`), `git rebase --continue`.
   - Conflict in `CHANGELOG.md` or `WORKFLOW.md` where each side only ADDED lines at the same spot: keep both whole,
     yours on top, blank line between, delete the markers, `git add`, `git rebase --continue`. If either side changed
     or removed an existing line, it is an "other conflict".
   - Handle each such case in the same rebase. Any other conflict (another `sw.js` hunk, a `module-N.js`, a danger-zone
     file, any other file): `git rebase --abort` and ask Jonathan.
   - Never force-push; never a merge commit without asking. After the rebase: full `node tools/checks.mjs` on the
     rebased tip (plus the smoke when those commits touch files you changed), commit the `sw.js` it rewrote, push only
     when `git status` is clean. After pushing: `node tools/checks.mjs --live`.

## Never, whatever the task says

Each is a check that fails the push and GitHub (`tools/never-blocks.mjs`). A refusal is never fixed by loosening the
check; a frozen-module fix goes to skill `summer-reset`.
- Move or renumber a section or step (progress keys; 1dl).
- Reword a keyed MC's choices, or its English prompt, in Modules 1–`FROZEN_THROUGH` or the next module (1ap, 1dl).
- Create or edit `progress/{uid}` from console code (1dm). The one console write there is the delete in
  `teacherRemoveDeleteProgress()` (`teacher-remove.js`).
- Write `config/class` except through `teacherWriteConfig()` (1ai, 1dm).
- Change `firestore.rules` without telling Jonathan it needs a console paste (1dn: add the line it prints to
  `RULES-PASTE.md`).
- Re-level "the cure" (1do). Delete what is switched off (Daily 5, Take It to a Song sections; 1do). Resurrect the
  deleted student tour (1do).

## Student data never goes to Claude

Whatever a tool reads, lists, prints or screenshots is sent to Anthropic. Jonathan's own name is fine.
- Never open, unzip, list the inside of, grep or print from: a raw recordings download (`mic-recordings-<date>.zip`,
  its unzipped folder, the per-take `mic-<game>-<Name>-…` files), a console backup (`guitar-class-backup-<date>.json`),
  or anything in `~/Documents/guitar-class-private/`.
- Recordings come in only through `node tools/mic-sim/takes-in.mjs` (it removes names, prints counts); work on the
  anonymized `T01…` copies.
- Never open the real teacher console, the Firebase console, Gmail, Drive or Classroom with the Chrome extension or a
  Google connector. Site checks use headless Chrome for Testing with the stub Firestore.
- Never print a student's name, email or uid from a transcript or log: count, don't quote. Test data is made up.
- `.claude/hooks/no-student-data.mjs` blocks those reads (1dc); it is a guard rail, this rule binds. A Bash heredoc
  that merely NAMES one of those paths is blocked too: write that code with Edit / Write.

## Project

Write to Jonathan in plain English. Claude handles all git. Static HTML/JS/CSS, no build; Firebase + Firestore;
GitHub deploy. Shell: Windows *and* macOS.
- **Stations B and C are merged in DISPLAY ONLY.** `stations.b` / `.c` and every progress key
  (`${w.id}-b-sec{gi}-{i}` / `-c-sec{gi}-{i}`) stay; never "simplify" the data. `gi` = position after excluding only
  tuning-warmup sections (`storageSections()`); render-time hiding never renumbers it (1af). Student text says
  **Checkpoint / Punto de control** and **Wrap-Up / Cierre**, never "Station B/C" (1n). Only `m4w2` shows Part 1/2 (1ao).
- Sections are addressed by `data-ns`, never by DOM position. `LESSON_TAB` stays `'station-b'` so old deep links work.
- A set is complete when the SET is: the sets gate, checklist, Module Review, search and `resumeLessonCounts()` never
  see a part. A set is exactly two panels: lesson ladder and checklist.
- **No in-panel tab bar**: the rail is the only switcher (`.claude/rules/rail-layout.md`).
- **Target screen: Chromebook 1366×657**: every layout is designed and measured there. A bigger screen enlarges it
  (`site-fill.js`; a new `vh`/`vw` is written `/ var(--site-fill,1)`, 1df), except the teacher console (factor 1)
  outside Live In-Class Games. Phone width: no work or breakpoints unless asked; keep the phone CSS and 1o.

## Where the code lives

No `app.js`, `coach.js` or `teacher.js` file exists: each is cut into parts, loaded in the order below. Tools and check
messages still use those three as LOGICAL names (`siteSource('app.js')` in `tools/site-src.mjs`); never recreate them.
Find a function: `grep -n "function name" app/*.js coach-*.js teacher-*.js`. Each part in full: `docs/code-map.md`.

- **App** (`site-parts:app.js` tags in `index.html`): `boot.js` Firebase, loaders, auth · `save.js` the progress
  writer · `tab.js` TAB, chord links · `songfiles.js` private song files · `songhelp.js` · `snippets.js` ·
  `builtsongs.js` · `shell.js` modals, rail set switcher · `lesson.js` lesson ladder, render-time hiding · `review.js`
  Module Review, checklist · `drills.js`, `drills-call.js` drills · `audio-ui.js` check-off gates, `playNote()`,
  floating tools · `explore.js` navigation, Songs hub, search · `songrequests.js` · `activities.js` (`caStepHtml()`) ·
  `cards.js` the practice-card player, THE LEAD · `cards-sheet.js`, `cards-loop.js`, `cards-views.js` · `activities-2.js`
  exit checks, board · `activities-list.js` the activity gate and list · `start.js` service worker, router, sign-in.
- **Arcade** (`COACH_JS_PARTS` in `app/boot.js`): `coach-core.js` the listening code · `coach-score.js` scoring ·
  `coach-recordings.js` · `coach-hub.js` · `coach-chords.js` Change Up, Power Chord Switch · `coach-chordcards.js` ·
  `coach-ear.js` · `coach-strum.js` · `coach-runner.js` · `coach-noterunner.js` · `coach-more.js` ·
  `coach-strumcheck.js`.
- **Console** (`TEACHER_JS_PARTS` in `app/boot.js`): `teacher-core.js` · `teacher-activities.js`, `-2.js`
  (`renderTeacherActivityDetail()`) · `teacher-config.js` (`teacherWriteConfig()`) · Manage, students, songs, mic,
  backup, errors, live games, accounts, song files, built songs, remove (`teacher-<name>.js`) · `teacher-sb-*.js` the
  Song builder. Each part's tool: `.claude/rules/teacher-console.md`.
- **Load order matters.** A top-level statement that RUNS at load may use only what the same or an earlier part
  defines. Anything that starts things (a listener whose handler uses later parts, sign-in) is registered in
  `app/start.js`. Load order, loaders, script tags, `sw.js` lists: `.claude/rules/sw-and-loading.md`.
- **Keep the parts small.** A new feature (game, drill, console view, card type) gets its OWN part. Other new code
  goes in the part whose banner covers it; a shared helper in the EARLIEST part that uses it. 1cv warns over 2,000
  lines and fails the push over 2,600; never raise those numbers without Jonathan.
- **A Fast change never stops to split a part**: over 2,000 lines → one line in the report, ship. A split (one banner
  section, whole, into a new part loaded right after it; then `node tools/slow-load.mjs`) is its own change at a quiet
  moment. Warn Jonathan before a part nears 2,600. `coach-core.js` is split only with him.
- **A new part file** goes in `index.html`'s `site-parts:app.js` block or `COACH_JS_PARTS` / `TEACHER_JS_PARTS`
  (`app/boot.js`); an app or arcade part also in the `sw.js` lists, a console part never (`checks.mjs` enforces both). Name it `app/<x>.js`, `coach-<x>.js` or `teacher-<x>.js`. Never edit `tools/split-plan.json`
  (record only, with `tools/split-site.mjs`).

## Pushing and checks

- "Push to GitHub" / "Save progress with a note: [msg]" → checks, fix flags, commit, push, confirm.
- **Cowork can't push**: patch + `APPLY-<name>.md` as ONE zip (skill `session-handoff`).
- Touching `index.html`, `styles.css`, an `app/*.js` part, `tuner.js`, a `teacher-*.js` part, `config-main.js` or a
  `module-N.js`: `node tools/checks.mjs` must exit 0 (syntax, data, about 240 links even when none changed, the
  `CACHE_VERSION` bump, 1bt). Flags: `--skip-links`, `--check` (changes nothing), `--live`.
- After you edit a cached file, "shell cache stale" is expected (exit 1; the pre-commit hook refuses the commit) until
  the full `node tools/checks.mjs` rewrites `sw.js`. Any other ✗, including "audio hash map in sw.js is stale", is a
  real failure.
- **GitHub on every push to main:** `checks.yml` (`--check --skip-links`, `save-loop`, `visible-loop`,
  `live-quiz-loop`, `shared-chromebook-loop`; red = look at the last push; it does not replace running a tool
  yourself) and `browser.yml` (the English smoke by area, plus the loops its header lists; its `full` job is the
  two-language walk: Fridays, or Actions → Browser tests → Run workflow → `full`). A `ci-try/<name>` branch is walked
  the same way; Jonathan, not Claude, deletes remote trial branches.
- **Hooks:** the Stop hook (`GC_STOP_CHECKS=0` turns it off), `.githooks/*` (`git config core.hooksPath .githooks`).
  "node not found — skipping checks" means nothing was checked: run `node tools/checks.mjs` by hand.

## Three regimes (module progress)

`FROZEN_THROUGH` = 3, `OPEN_THROUGH` = 6. Raise `FROZEN_THROUGH` (= `FROZEN_MC_THROUGH_MODULE`) when the class
ENTERS a module; never lower either (1dl): module progress never resets unless Jonathan does it. Each regime, the 4/5
swap, keyed MCs: `.claude/rules/modules.md`.

## Other standing rules

- **Practice copy** (`guitar-class-practice`, made-up data only): never add a second project to `.firebaserc`; never
  deploy to the class project from this repo. Details: `.claude/rules/firestore.md`.
- **A bad day** (a push broke the site, students stuck on a broken cached copy, work lost): `BREAK-GLASS.md`. Google sign-in or saving down: `docs/when-google-is-down.md`.
- **Lint** (`node tools/lint.mjs`): run it before deleting or renaming a shared function. Never add a name to `OUTSIDE_GLOBALS` in `eslint.config.mjs` unless
  it exists at run time.
- **Sweep ratchet:** 3+ instances of a mechanically-detectable error class → a permanent `checks.mjs` detector, same
  session; it must render/execute, match UNESCAPED strings (`unescapeJs()`), and be seen failing in a scratch copy.
- **Accessibility scan** (`node tools/smoke.mjs --only a11y`) is report-only on GitHub. Its ratchet (`--a11y-ratchet`,
  `tools/a11y-baseline.json`) stays OFF until a week of runs show 0 new signatures and a reviewer passes the switch-on.
- **Plant a fault** (weekly, report-only): replay an escape with `node tools/plant-a-fault.mjs --replay <id>`. Harmless
  → a one-line reason in `tools/plant-a-fault-known.json`; a real gap → a test in the tool that should catch it. 1ea
  warns of a renamed function in its table: update it.
- **Activity order and placement** live on the console board (`caBoardOrder()`, `teacherMoveActivity()`); a digit in
  a title is a SERIES number (1d, 1l). More, with **Play-along first** and the **TWO step renderers**:
  `.claude/rules/activities.md`.

## Habits that catch the expensive bugs

- Grep before you edit: the same bug lives in sibling copies and in comments that describe the old behaviour. Fix
  them together.
- Unsure if a change is allowed? Run the proof tool; don't reason it out.
- A check fails → fix the cause. Never loosen the check or add an allowlist entry to get green.
- Report what you verified with the denominator ("306 handlers compiled"), not "looks fine"; a script that finds 0 in
  both trees proves nothing. Report real numbers, not the premise; name the prior decision a request reverses.
- Product calls and contradicting rules go to Jonathan (AskUserQuestion); don't pick silently.
- **Don't repeat verification that passed on the same code** (after an agent pasted it, spot-check one number at
  most). A fixer re-runs only the cases its change affects, plus ONE final run. A low-stakes tool (an ungraded game's
  test, a small test fix) ships on its fixer's proof; reviewers are for the save path, load order, listening and
  anything a student's work or screen depends on. Push rules still apply.
- **Browser checks run in Chrome for Testing**, headless via `CHROME` and a small script (like
  `tools/console-layout-smoke.mjs`, whose stub Firestore reaches the console); the Chrome extension only for a
  person-style click-through. Every Chrome tool goes through `tools/chrome-wall.mjs`: the wall (no request may leave
  127.0.0.1 and no Firebase app may start, or the run fails) and the two-run lock (`GC_BROWSER_SLOTS`, skipped on
  GitHub; checks.mjs 1fh). Never weaken a loop or the wall to make a run pass.

## Keep the Mac's load "just right"

**The Mac only** (8 cores); in the cloud or on Windows skip all of this. Read the 1-minute load (`uptime`) BEFORE
spawning an agent, a browser run, a full `checks.mjs`, a proof loop or a golden snapshot:
- **under 4** and work is queued → start the next job; do not leave the Mac idle.
- **4 to 8** → just right: nothing new that is heavy (one light, Node-only job is fine).
- **over 8** → start nothing.
- **over 12 for 5 minutes** → pause the job that can best wait; tell Jonathan in one line.
- **Prefer the cloud for agent work** when the lead is on the Mac (cloud agents or a cloud session); cloud agents may
  use sub-agents freely.
- **Local agents on the Mac:** the lead, at most 2 local agents, at most 2 headless-Chrome runs (the second only while
  the load is under 8). A 3rd local agent only when the load is under 4 and it is Node-only. A local agent's brief
  says: one job at a time; no sub-agents, except that an Opus builder may hand simple parts to ONE Sonnet sub-agent at
  a time; wait while `uptime` shows over 8 (10 minutes at most, then go on and say so).
- **Where work goes, decided before the brief is written:** work that need not happen today and needs no Mac-only
  file → the "For Windows" section at the top of `WORKFLOW.md` (headless Chrome included). Repo-only work for today,
  Node or headless Chrome, defaults to the CLOUD (a routine set to run once, skill `schedule`; push its branch first).
  The Mac keeps what only it can do: student takes, audio and other Mac-only files (`Claude outputs/`), and the lead.
- Windows reads `WORKFLOW.md` hourly while awake and adds a "started" line, then a DONE note. No "started" line 2 hours
  after an item was added → treat Windows as asleep and say so.
- On the Mac, every report that ran agents or long jobs ends with one line: the load at the start and the highest seen.

## How to work with Jonathan

- **AskUserQuestion, not free text** (2–4 options), one question per turn unless truly independent.
- **Don't ask "should I proceed?"**: do the obvious, reversible work ("can you… / how do I… / should this be…" about
  code = do it). In doubt: pick a default, proceed, say why. Pause only for a real fork or an irreversible or
  outward-facing action.
- **Pushing to `main` is not a pause point:** checks pass and a fast-forward is what you'd recommend → push, say what
  landed, `checks.mjs --live`. Ask for a merge commit, a conflict you cannot resolve mechanically (step 8), failing
  checks, or unready work.
- **Work for another session → give the blurb the first time:** when another Claude session must do, avoid or know
  something, end your message with the text to paste to it, in a code block, complete enough to act on alone; a new one
  when the facts change.
- New unrelated topic → AskUserQuestion once: fresh chat or continue?
- **"Next steps for Power Chord Switch"** → read `WORKFLOW.md` "Power Chord Switch: where we stopped" first.

### Triggers

Review trigger = 3+ files, 50+ strings, or a danger-zone file:
- the console's config plumbing (`teacherWriteConfig()` and the `config/class` reads in `teacher-config.js`);
- `sw.js` code;
- coach detection in ANY `coach-*.js` part: onset and pitch detectors and grading rules (ratios, gates, windows) —
  mostly `coach-core.js`, `coach-score.js` and `ccLoop()` / `ccResolvePend()` / `ccFinish()` in `coach-chords.js`,
  but each game's own loop and judge too; not a game's screens, wording, tempo controls or count-in;
- the app's save path (`app/save.js`, and any other direct write to `progress/{uid}`). Any write to `progress/{uid}`
  or any per-student storage key → `node tools/save-loop.mjs` and `node tools/shared-chromebook-loop.mjs`;
- `firestore.rules`.

Not counted: `CHANGELOG.md`, the `sw.js` version lines and `AUDIO_HASHES` block (a new song's audio is not
danger-zone), a file name added to or removed from an `sw.js` list (ships Fast), a Spanish twin, pin-only `checks.mjs`
edits. A guard on a new default, or extending what a check reads: break-it proof
only (paste the output). A new KIND of check, or changed logic/matching: a trigger (`site-reviewer`, high) plus
break-it.

### Fast by default

- A trigger no longer asks. After the build and every "Start here" step, ship **Fast**: no reviewer; every Fast commit
  ends with the trailer `Review: Fast` (above any Co-Authored-By). A change a reviewer read before it shipped ends
  `Review: Reviewed (<reviewer>, <N> round(s))`. The Fast report starts "Fast — reviewer skipped; Friday check will
  review it." No trigger → no trailer.
- A change is labelled as a whole: after the last clean round, `node tools/review-trailer.mjs <range> fast|reviewed
  "<reviewer>, <N> rounds"` (1dw warns on a mixed range or a Fast danger-zone file).
- **Always Reviewed, same day, never Fast:** a danger-zone file; a new kind of check that ships on its own (a ratchet
  or detector; a check that guards the feature it ships with gets break-it proof only); a sub-agent sweep;
  adding or removing a step where the three regimes allow it. Moving an existing section or step is never allowed
  ("Never" list). A product change Jonathan asks for (a renderer, a game's flow, a console
  view) ships Fast unless it touches one of those. Jonathan says "review this" / "Reviewed" → review same day.
- Both splits are unproven: a Friday check finds a Fast change that hurt students → move that kind to
  Always-Reviewed; a high review lets a real bug through → move that kind to `site-reviewer-deep`.
- **Friday check:** a scheduled task, Fridays 11:00 PM Pacific, reviews every `Review: Fast` commit since the last run
  (skill `friday-check`), fixes and pushes.

### Delegate site review work to agents by default

Standing permission: when a review is due (an Always-Reviewed change, Jonathan says "review this" / "Reviewed", the
Friday check, a sub-agent sweep), spawn the reviewers at once without asking; this overrides the Agent tool's "when in
doubt, don't spawn". A Fast change gets none.
- **Parallel by area:** one reviewer per independent area, all spawned in one message. `site-reviewer-deep` for a
  danger-zone file, 50+ strings or any sub-agent sweep (failing scenario first); otherwise `site-reviewer`.
- **Re-review every fix round with a fresh agent.** Stop after the first round with no BLOCKER or MAJOR (severity
  words: `.claude/skills/site-sweep/reviewer.md`); fix its MINORs with a break-it proof, no new round. Round 3 still
  finds a BLOCKER or MAJOR → ask Jonathan (ship, revert or keep going).
- **Fixers:** findings in one file family → fix them yourself. Spawn `site-fixer` only when they span two or more
  independent file families: create its worktree first, then cherry-pick its commits. Before spawning more than 3
  agents, read skill `site-sweep`. **Sweeps (50+ items):** a second agent told to *find problems* audits the FIXES.
- **Smoke and reviews run at the same time**, the smoke in its own detached worktree.
- **Treat agent output as claims** (builders too): read every quoted line yourself; a fixer proves each new guard by
  breaking the code and pasting the red line, and re-derives a suggested fix on the real code. Product choices found in
  a review go to Jonathan (AskUserQuestion).

**Agents for ordinary work too:** spawn agents whenever that is faster, without asking; who reviews what is unchanged.
Sub-agents: cloud agents may use them freely; a local agent on the Mac follows "Keep the Mac's load just right". A few tool calls or one file family: do it yourself. Read the load and choose cloud,
Windows or the Mac first.

**Every brief states:** its size (agents, sub-agents, browser runs); its own worktree only (created first; you
cherry-pick); no push; no `tools/smoke.mjs` or `tools/pm-e2e.mjs`; no Chrome while two browser runs go (`pgrep`, step
3); a final message of 20 lines at most (verdict or tip first, counts with denominators, what needs the lead or
Jonathan), everything else in ONE details file in the session scratchpad, path given. Only a reviewer's one line per
BLOCKER / MAJOR (file:line) may pass the cap.

### Opusplan: choosing model and effort

The chat may run on Fable to plan; agents execute. **Every spawn names its `model` and `effort`.** A spawn with no
`model`, and every `subagent_type: "fork"`, runs on the chat's model: with a Fable chat use a named agent type or
`general-purpose`, never a fork.

| Job | Agent type | Model | Effort |
|---|---|---|---|
| Ordinary build or content change | `site-fixer` / `general-purpose` | opus | medium |
| Most building and fixing | `site-fixer` / `general-purpose` | opus | high |
| The save path, `firestore.rules`, listening code, a fix whose cause is unknown, a design with real choices | `site-fixer` / `general-purpose` | opus | xhigh |
| Review (ordinary) | `site-reviewer` | opus | high |
| Review: danger zone, 50+ strings, any sweep | `site-reviewer-deep` | opus | xhigh |
| Read-only audit of one area (a sweep's auditor) | `site-auditor` | opus | high |
| Friday check | (skill `friday-check`) | opus | xhigh |
| Run-a-tool-and-report (a tool or a proof, its numbers), a search or a file copy | `site-runner` | sonnet | low |
| The rest of the list: an inventory with counts, moving files, screenshots from a written list, a rebase or a re-pin, test cases from a list someone else settled, one scripted wording change in many places (only when no student sees the text; otherwise Opus) | `site-runner` | sonnet | medium |

- Never `max`. Sonnet only for mechanical, fully specified, tool-proved work, through `site-runner` (not
  `general-purpose` on Opus); one that seems to need `high` is not a Sonnet job. Opus always for any choice, the save
  path, `firestore.rules`, listening code, load order, `sw.js` code, a renderer a student sees, an unknown cause, every
  review. Unsure → Opus. Read a Sonnet report's proof before its work ships.
- Sub-agents: in the cloud, freely; a local agent on the Mac, only an Opus builder's ONE Sonnet sub-agent at a time
  ("Keep the Mac's load just right"). A brief may still say "no sub-agents" when the lead wants none.
- **Fable only when Jonathan names a Fable review** (`model: 'fable'`); recommend one in a report (save path,
  listening, a sweep), never start one unasked.
- The chat's own `/model` and effort are Jonathan's to set. Session effort: `medium` routine, `high` bug fixes / JS /
  keyed MCs, `xhigh` danger-zone and sweeps. A job a tier above the session → ask for `/effort`.
- Agents at once on the Mac: "Keep the Mac's load just right".

## Lazy-loaded guidance

Rule files (`.claude/rules/`) load with the files they name; read a skill or header first. Their ⚠️ rules bind.

| Area | Read | Most critical rule |
|---|---|---|
| Module data: **Three regimes**, 4/5 swap, keyed MCs, Module 13 | `modules.md` | Never move or rename a step in Modules 1–3 |
| Content, wording, **Videos** | `content.md` | Simplest direct wording; never invent a YouTube ID |
| i18n | `i18n.md` | Every new student string in EN and ES, same edit |
| In-Class Activities, **TWO step renderers**, **Play-along first** | `activities.md`; skill `in-class-activities` | A step-field change edits both renderers |
| Tracks, snippets, card audio, `playNote`, `audio/`, song files, built songs | `songs-and-audio.md`; skill `audio-and-snippets` | Never re-level the cure |
| A new Play Along song from an mp3 | skill `new-playalong` | Measure the record first; chords from Jonathan's chart only |
| Core/Choice song facts | skill `song-facts` | Don't re-flag settled facts; don't verify BPM |
| Progress save, sign-in, per-student storage, practice minutes | `save-and-sign-in.md` | Save change: `node tools/save-loop.mjs`, Always Reviewed |
| `sw.js`, load order, kill switch | `sw-and-loading.md` | Load-order change: `node tools/slow-load.mjs` |
| `firestore.rules`, the practice copy | `firestore.md` | Tell Jonathan to paste; re-pin 1dt same commit |
| How a game LISTENS, pitch detectors | `listening.md`; `tools/mic-sim/README.md` | Before proposing a listening rule: `node tools/mic-sim/closed-loop.mjs --rooms=room7,room4`, then the same with `--no-guitar`; real student takes outrank the synthetic rooms |
| Teacher console, each part's tool | `teacher-console.md` | `config/class` only via `teacherWriteConfig()` |
| Live quiz and its games | `live-quiz.md` | Nothing on the stage reveals the answer early |
| Set band, left rail, nav grid | `rail-layout.md` | The two-column nav grid is permanent |
| Journey tab cards | `journey-pages.md` | Restyle `.tab` in both stylesheets or neither |
| Writing any JS | `code-hygiene.md` | `jsonAttrArg(x)` in inline handlers; no mid-line `//`; escape student values |
| Frozen-module fixes (**Summer reset list**) | skill `summer-reset` | Add a blocked fix the same day |
| Cloud pushes, Cowork handoff, hooks | skill `session-handoff` | Cowork can't push; the web can |
| The Friday check | skill `friday-check` | Ends by committing `last-run.txt`; never move a tag |
| Audits, many-file refactors, 50+ strings | skill `site-sweep` | Pre-create worktrees; cherry-pick; review the fixes |
| "Hear It First" trainer (`trainer-*.js`) | header of `trainer-core.js` | Hidden; after a `trainer-core.js` change `node tools/trainer-sim.mjs` (not in checks); only the adapter touches site globals; never change `coach-*.js` / `tuner.js` for it |
