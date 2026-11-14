---
name: friday-check
description: The weekly Friday 11 PM review of every change that shipped Fast (commits with a `Review: Fast` trailer) — finding the range, running the reviewer, fixing and pushing, tagging, and reporting. Read when running the Friday check or when a scheduled task says "run the Friday check".
---

# Friday check

Reviews the week's `Review: Fast` commits (CLAUDE.md, "Fast by default").
Runs unattended, Fridays at 11:00 PM Pacific, from a scheduled cloud session.
- **Don't ask Jonathan anything** (no AskUserQuestion, no `/effort`
  request). Decide, act, and report.
- **Every reviewer this check spawns is Opus at `xhigh`** (Jonathan,
  2026-11-09): pass `model: 'opus'` and `effort: 'xhigh'` on each Agent call,
  `site-reviewer` and `site-reviewer-deep` alike. Their own files say Fable at
  `medium`; that is for reviews during the week. A different model on Friday
  is the point: in the 2026-11-09 test each model caught bugs the other
  missed.

## The run of 2026-11-13 only: a big week, keep it lean

Jonathan, 2026-11-13: "make tonight's run token efficient". The range is about 425 commits, 81 of them Fast (50 touch
site files, 31 are tools and notes only). These rules apply to THIS run and override the steps below where they
differ. **Delete this whole section in the same push as tonight's tag**, so next Friday runs the normal steps.

1. **Review by area, not by commit.** Do not read 81 diffs. Take the files the Fast commits touched
   (`git log --format= --name-only --grep='^Review: Fast' $range | sort -u`) and review the NET change to those
   files, `git diff <range start> origin/main -- <files>`, split into at most FOUR areas, one reviewer each, all
   spawned in one message: (a) the app shell and lists (`app/*.js` except cards and the player, `index.html`,
   `styles.css`, `site-fill.js`, `i18n.js`); (b) practice cards, the player and the arcade (`app/cards.js`,
   `app/snippets.js`, `coach-*.js`, `practice-minutes*.js`, `class-activities.js`, `module-*.js`); (c) the live game
   and the console (`live-quiz.js`, `teacher-*.js`); (d) the Song Journey pages (`tabs/**`). Give each reviewer the
   commit subjects for its files, not the commits.
2. **No reviewer for tools and notes.** `tools/**`, `.claude/**`, `.github/**`, `docs/**`, `CLAUDE.md`,
   `WORKFLOW.md`, `CHANGELOG.md`: read the net diff of `tools/checks.mjs` yourself for ONE thing only, a check
   that was loosened (a pin's number changed, a check removed, an allowlist entry added), and report what you find.
   Each new tool shipped with its own break-it proof this week.
3. **Skip what a reviewer already broke and passed this week** even though its commits say Fast: the weekend
   streak rule (`861b735`, `186bd4b`, `6a79677`; deep review, one round plus fixes) and the big-screen fill
   (`4bda529` on, `site-fill.js` and the `sw.js` lists; deep review, and GitHub's browser walk before it went
   live). Tell the area reviewers these are settled; they still read the files around them.
4. **Reviewers: Opus at `high` tonight** (not `xhigh`); `xhigh` only for `site-reviewer-deep` on a danger-zone
   file. A different model from the week's reviewers is still the point.
5. **Do not re-run what GitHub already ran green on the tip.** Since 2026-11-13 GitHub runs the checks, four proof
   tools, the rules tests and a browser walk (English smoke per area, slow-load, update-reload, play-along) after
   every push to main. Read the tip's runs (WebFetch on
   `https://api.github.com/repos/jhoffmanteacher/guitar-class/actions/runs?branch=main&per_page=12`); what is
   green there is not run again here. Step 1b's full two-language walk still runs ONCE (Spanish is walked only on
   Fridays). Step 4's second full walk runs only if a fix touched a site file, and then with `--only` the areas
   the fix touched.
6. **Fix only what a student would hit** (a BLOCKER or MAJOR finding). MINOR findings go to WORKFLOW.md's Open
   work as one short list; no fix and no re-review for them tonight. A fix that is itself Always-Reviewed: ONE
   deep round at most; not clean → push the branch and report it as waiting (do not run three rounds tonight).
7. **Work in flight: do not fix what these branches already fix, and do not touch them.** `wave/integration`
   (keys on practice cards, the microphone start, save messages; it also fixes a Change Up set-up overflow that is
   NOT on main), `feat/song-requests` (it fixes `tools/console-layout-smoke.mjs`'s sidebar pin: that tool fails 4
   checks on main today, known), `feat/catch-up` (one rules line and a console filter), `fix/nearest-strum`,
   `tools/never-blocks`, `tools/a11y-and-drift`, `cl/golden-rebuild`. Ignore `ci-try/*` (trial branches).
   `firestore.rules` on main holds unpublished add-only blocks (school accounts step 1) and `firestore.rules.paste2`
   is NOT published: both are known, waiting for Jonathan's paste; not findings.
8. **If the run cannot finish** (a usage limit, time): review the areas in the order (a), (b), (c), (d); write in
   WORKFLOW.md's Open work which areas were reviewed and which were not, push that, and do NOT tag (the next run
   then takes the same range and skips the areas marked reviewed).
9. **Report in ten lines or fewer**, as step 6 says, plus one line: which areas were reviewed.

## 1. Find the range

```
git fetch origin --tags
last=$(git tag -l 'friday-check-*' --sort=-creatordate | head -1)
```

- `last` exists → range is `$last..origin/main`.
- No tag (tags exist since `friday-check-2026-10-31`) → every commit on
  `origin/main` since `2026-10-30 00:00 -0700`.

Fast commits = `git log --format='%H %s' --grep='^Review: Fast' $range`.
None → still run step 1b if anything at all landed in the range, then skip to
step 5 (tag) and report "Nothing shipped Fast this week."

## 1b. Full smoke (start it first)

Since 2026-11-09 a change's own smoke is English-only and walks only the
areas it touched (CLAUDE.md "Start here" step 3), so this is the walk that
catches the rest. Start it now, in the background, from a detached worktree
at `origin/main`, and let it run while the reviewer works:

```
node tools/smoke.mjs --baseline <range start> > smoke-friday.log 2>&1
```

No `--only`, no `--en-only`: every area, English and Spanish. Every error
it reports (new since the range start) is a finding for step 3: find the
commit that caused it (`--only <area>` against the commits in the range is
quick), fix it, and say so in the report. A hang is a finding too.

Ignore `wip/*` branches (not live).

## 2. Review

Run `site-reviewer` on the Fast commits (combined diff plus the commit list). Use `site-reviewer-deep` instead if any of them touches a
danger-zone file or a section/step order, and say in the report that it
should never have shipped Fast.

Brief the reviewer to find real problems students would hit:
- broken rendering at 1366×657;
- wrong Spanish twin;
- a control whose default isn't pinned;
- a pattern claim that isn't true across the data;
- progress-key risk.

Settled decisions (skill `song-facts`, CLAUDE.md, WORKFLOW.md) are not
findings.

Read every finding's quoted lines yourself; drop anything you can't confirm
on the real code.

## 3. Fix

For each confirmed finding, decide:

- **Fix and push to `main`** — the normal case. Follow every CLAUDE.md
  "Start here" step. Commit trailer: `Review: Friday check` (not
  `Review: Fast`). Before pushing, `git fetch` and confirm it's a
  fast-forward.
- **Fix on a branch, review it, then merge it — all in this run** — when the
  fix itself is always-Reviewed (CLAUDE.md's list, e.g. `coach-core.js`). Jonathan,
  2026-11-07: these reviews run automatically; the fix does not wait for him.
  1. Work on branch `friday-check/<YYYY-MM-DD>` (a worktree if another session
     could be using the checkout), rebased on current `origin/main`.
  2. Run `site-reviewer-deep` on the fix commit, briefed to try to BREAK it.
     Then:
     - read its quoted lines yourself and fix what you confirm;
     - prove each new guard goes red when its fix is broken;
     - run a fresh `site-reviewer-deep` round on the new commit.

     Repeat until a round finds nothing real, at most 3 rounds.
  3. A clean round → rebase on `origin/main`, full `node tools/checks.mjs`,
     fast-forward push to `main`, and `checks.mjs --live`.
  4. Still not clean after 3 rounds, or a finding that is a product call → do
     NOT merge: push the branch, put the open finding in WORKFLOW.md's Open
     work, and say in the report that it is waiting for Jonathan and why.
  If `site-reviewer-deep` cannot be run from the cloud session, push the
  branch and report it as waiting.
- **Report only, no code** — when the fix is a teaching or content call,
  would reverse
  a decision Jonathan made, or you're not sure it's a bug. Add it to
  WORKFLOW.md's Open work in the same push as any other fix.

Never touch student data (Firebase console, Firestore exports, rosters,
teacher dashboard on live data), edit `firestore.rules`, or hand-edit the `sw.js`
version lines. CLAUDE.md's "Never,
whatever the task says" list applies too.

`checks.mjs --live` returns 403 from a cloud session. Say in the report that
the deploy needs confirming from a local machine.

## 4. Re-check

After the fixes, run the full `node tools/checks.mjs` and
`node tools/smoke.mjs --baseline <range start>` once more on the final
`main`. A failure you can't fix → revert your own fix commit (a new revert
commit, never a force-push) and report it.

## 5. Tag

```
git tag friday-check-<YYYY-MM-DD> origin/main   # after your pushes land
git push origin friday-check-<YYYY-MM-DD>
```

Always create a new dated tag — never move or delete one (cloud credentials
can't rewrite refs). Tag even when nothing shipped Fast.

## 5b. Are the real takes still current? (every run, even when nothing shipped Fast)

```
node tools/mic-sim/replay-takes.mjs --rules=base
```

It reads the take summaries in `tools/mic-sim/takes/` (no audio; about a minute). Its second line is either "Takes are
current" or "ASK JONATHAN for new takes" with the reasons. Copy an ASK line and its reasons into the report (step 6).
A line that starts "Note" (old takes, few takes) is not a reason to ask him: leave it out of the report.
Do not ask him any other way and do not try to fetch takes: only he can download them. If the command stops with an
error that names a line of `coach.js` ("expected this once in coach.js"), a change this week moved code the listening
tests read: that is a finding for step 3.

## 6. Report

Plain language, short (he reads it on his phone):

- How many Fast commits were reviewed, and their one-line subjects.
- What was fixed and pushed (one line each, what a student would have seen).
- Anything on a branch or in Open work waiting for Jonathan.
- **Takes:** if step 5b printed "ASK JONATHAN", say so first in the report, with its reasons in plain words and the one
  thing to do: download the recordings from the console, then `node tools/mic-sim/takes-in.mjs` on the Mac and push.
  If the takes are current, say nothing about them.
- "Confirm the deploy from a local machine" if anything was pushed.
