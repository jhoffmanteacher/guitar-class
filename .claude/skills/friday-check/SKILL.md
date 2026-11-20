---
name: friday-check
description: The weekly Friday 11 PM review of every change that shipped Fast (commits with a `Review: Fast` trailer) — finding the range, reading GitHub's Friday walk, reviewing the net change by area, fixing and pushing, recording where the run ended (last-run.txt), and reporting. Read when running the Friday check or when a scheduled task says "run the Friday check".
---

# Friday check

Reviews the week's `Review: Fast` commits (CLAUDE.md, "Fast by default").
Runs unattended, Fridays at 11:00 PM Pacific, from a scheduled cloud session.
- **Don't ask Jonathan anything** (no AskUserQuestion, no `/effort`
  request). Decide, act, and report.
- **Every reviewer this check spawns is Opus at `xhigh`** (Jonathan,
  2026-11-09): pass `model: 'opus'` and `effort: 'xhigh'` on each Agent call,
  `site-reviewer` and `site-reviewer-deep` alike. Since 2026-11-20 their own files
  are Opus too (`high` and `xhigh`); the Friday check keeps `xhigh` for both. A
  Fable review runs only when Jonathan names one.

## 1. Find the range

Where the last run ended is the newer of two markers: the first word of
`.claude/skills/friday-check/last-run.txt` on `origin/main` (a commit; since 2026-11-14, because a cloud session
may not push tags: the git proxy answers 403) and the newest `friday-check-*` tag (the older runs, and any tag
Jonathan pushes by hand).

```
git fetch origin main --tags --depth=3000        # a fresh cloud clone is shallow: the ancestry test needs history
tag=$(git tag -l 'friday-check-*' --sort=-creatordate | head -1)
file=$(git show origin/main:.claude/skills/friday-check/last-run.txt 2>/dev/null | awk 'NR==1{print $1}')
last=$tag
if [ -n "$file" ] && { [ -z "$tag" ] || git merge-base --is-ancestor "$tag" "$file"; }; then last=$file; fi
```

- `last` set → range is `$last..origin/main`.
- Neither marker → every commit on `origin/main` since `2026-10-30 00:00 -0700`.

Fast commits = `git log --format='%H %s' --grep='^Review: Fast' $range`.
`Review: Reviewed` commits (`--grep='^Review: Reviewed'`) had their reviewer before they shipped: skip them, but
count them for the report (step 6). A commit carrying both lines counts as Fast.
None Fast → still do step 1b if anything at all landed in the range, then skip to
step 5 (record the end) and report "Nothing shipped Fast this week."

## 1b. GitHub's runs and the full walk (before the review)

GitHub runs after every push to main: the checks, four proof tools and the name checker (`checks.yml`), the rules
tests (`rules.yml`), and the English smoke per area with the slow lane (`browser.yml`). Read the tip's runs
(WebFetch `https://api.github.com/repos/jhoffmanteacher/guitar-class/actions/runs?branch=main&per_page=12`): **what
ran green on the tip is not run again here.** A red one is a finding for step 3.

The full walk in both languages (the only one that walks Spanish; a change's own smoke is English-only and walks
only its areas, CLAUDE.md "Start here" step 3) runs on GitHub on its own every Friday evening (`browser.yml`
`schedule:`, Saturday 03:37 UTC = Friday 7:37 PM PST / 8:37 PM PDT). Look for it first: WebFetch
`https://api.github.com/repos/jhoffmanteacher/guitar-class/actions/workflows/browser.yml/runs?event=schedule&branch=main&per_page=1`
and take the newest run's `id`, `head_sha`, `created_at`, `status`, `conclusion`. Its summary is the notice (green)
or error (red) annotation of the job "smoke, full walk": `.../actions/runs/<id>/jobs` → that job's
`check_run_url` + `/annotations`.

**Close enough** = created within the last 24 hours, and `head_sha` is on main at most **10 commits** behind the
tip (`git merge-base --is-ancestor <head_sha> origin/main` and `git rev-list --count <head_sha>..origin/main` ≤ 10).
Ten is a Friday evening's pushes at most; more than that and the walk no longer describes the tip.
- **Green and close enough** → no full walk here; quote its summary line in the report. If the commits after
  `head_sha` changed a site file (anything outside `tools/`, `.claude/`, `.github/`, `docs/` and `*.md`), walk
  only their areas here, both languages: `node tools/smoke.mjs --only <areas> --baseline <head_sha>` (areas: the
  header of `tools/smoke.mjs`).
- **Red and close enough** → each error it names is a finding for step 3: find the commit with
  `node tools/smoke.mjs --only <area> --baseline <range start>`. A red that is the runner, not the site (the
  "Chrome start" step failed, or no annotation names a smoke error) counts as missing.
- **Still running** → read it again once the reviewers are spawned; not done by the time they report → missing.
- **Missing, too old, more than 10 commits behind, or unreadable** (GitHub may delay or skip a scheduled run; the
  API may refuse) → walk here as before, in the background, from a detached worktree at `origin/main`, while the
  reviewers work:

  ```
  node tools/smoke.mjs --baseline <range start> > smoke-friday.log 2>&1
  ```

  No `--only`, no `--en-only`. Every error it reports (new since the range start) is a finding for step 3: find
  the commit that caused it (`--only <area>` against the commits in the range is quick), fix it, and say so in
  the report. A hang is a finding too.

Ignore `wip/*` branches (not live).

## 2. Review: the net change, by area

Do not read the week commit by commit. Take the files the Fast commits touched
(`git log --format= --name-only --grep='^Review: Fast' $range | sort -u`) and review the NET change to them,
`git diff <range start> origin/main -- <files>`. Give each reviewer the subjects of the Fast commits that touched
its files, not the commits.
- **Fewer than about 15 site files changed** → ONE reviewer for all of it.
- **More** → at most FOUR areas, one reviewer each, all spawned in one message (an area with no changed file gets
  none): (a) the app shell and lists (`app/*.js` except cards and the player, `index.html`, `styles.css`,
  `site-fill.js`, `i18n.js`); (b) practice cards, the player and the arcade (`app/cards.js`, `app/snippets.js`,
  `coach-*.js`, `practice-minutes*.js`, `class-activities.js`, `module-*.js`); (c) the live game and the console
  (`live-quiz.js`, `teacher-*.js`); (d) the Song Journey pages (`tabs/**`). A site file in none of them goes to the
  nearest area.
- `site-reviewer` for each; `site-reviewer-deep` for an area holding a danger-zone change or a section/step move,
  and say in the report that it should never have shipped Fast.
- **No reviewer for tools and notes**: `tools/**`, `.claude/**`, `.github/**`, `docs/**`, `CLAUDE.md`,
  `WORKFLOW.md`, `CHANGELOG.md`. Each tool ships with its own break-it proof. Read the net diff of
  `tools/checks.mjs` yourself for ONE thing: a check that was loosened (a pin's number changed, a check removed,
  an allowlist entry added); report what you find.

Brief each reviewer to find real problems students would hit:
- broken rendering at 1366×657;
- wrong Spanish twin;
- a control whose default isn't pinned;
- a pattern claim that isn't true across the data;
- progress-key risk.

Settled decisions (skill `song-facts`, CLAUDE.md, WORKFLOW.md) are not findings, and neither is code a
`Review: Reviewed` commit brought in (tell the reviewer which lines those are when they share a file).

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

After the fixes, run the full `node tools/checks.mjs` once on the final `main`. A smoke only if a fix touched a
site file, and then `--only` the areas the fix touched: `node tools/smoke.mjs --only <areas> --baseline <range
start>` (both languages). A failure you can't fix → revert your own fix commit (a new revert commit, never a
force-push) and report it.

## 5. Record where the run ended

After your pushes land, write the tip into `last-run.txt` and push that as an ordinary commit (a branch push works
from the cloud; a tag push does not):

```
git fetch origin main && end=$(git rev-parse origin/main)
printf '%s %s\n' "$end" "<YYYY-MM-DD>" > .claude/skills/friday-check/last-run.txt
git add .claude/skills/friday-check/last-run.txt
git commit -m "Friday check <YYYY-MM-DD>: the next run starts after ${end:0:8}"   # no Review trailer
git push origin main                                                            # fast-forward; fetch and rebase first if needed
```

The file holds ONE line, the newest run; git history keeps the older ones. Overwrite it every run, even when
nothing shipped Fast. Then also try `git tag friday-check-<YYYY-MM-DD> $end && git push origin
friday-check-<YYYY-MM-DD>` ONCE: on a Mac it works; from the cloud it gets a 403 (policy, not the network). A 403 is
not a failure of the run: do not retry it, do not route around it (the GitHub API refuses tag writes too), and
do not ask Jonathan to push it. Never move or delete an existing tag.

**A run that cannot finish** (a usage limit, time): review the areas in the order (a), (b), (c), (d); write in
WORKFLOW.md's Open work which areas were reviewed and which were not, push that, and do NOT write `last-run.txt`. The next run then
takes the same range and skips the areas marked reviewed.

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

- The count, "N Fast reviewed, M already Reviewed, skipped", and which areas were reviewed (step 2).
- The full walk: GitHub's Friday run (its summary line) or this run's own, and what it found.
- What was fixed and pushed (one line each, what a student would have seen).
- Anything on a branch or in Open work waiting for Jonathan.
- **Takes:** if step 5b printed "ASK JONATHAN", say so first in the report, with its reasons in plain words and the one
  thing to do: download the recordings from the console, then `node tools/mic-sim/takes-in.mjs` on the Mac and push.
  If the takes are current, say nothing about them.
- "Confirm the deploy from a local machine" if anything was pushed.
