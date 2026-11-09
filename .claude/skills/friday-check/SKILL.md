---
name: friday-check
description: The weekly Friday 11 PM review of every change that shipped Fast (commits with a `Review: Fast` trailer) — finding the range, running the reviewer, fixing and pushing, tagging, and reporting. Read when running the Friday check or when a scheduled task says "run the Friday check".
---

# Friday check

Since 2026-10-31, changes that hit a review trigger ship **Fast** (no reviewer)
unless they are always-Reviewed (CLAUDE.md, "Fast by default"). Every Fast
commit carries the trailer line `Review: Fast`. This check reviews those
commits once a week. It runs unattended, Fridays at 11:00 PM Pacific, from a
scheduled cloud session.
- **Don't ask Jonathan anything** (no AskUserQuestion, no `/effort`
  request). Decide, act, and report.
- The agents in `.claude/agents/` pin their own effort.

## 1. Find the range

```
git fetch origin --tags
last=$(git tag -l 'friday-check-*' --sort=-creatordate | head -1)
```

- `last` exists → range is `$last..origin/main`.
- No tag yet (the first run) → range is every commit on `origin/main` since
  `2026-10-30 00:00 -0700`. That also covers the commits listed in
  WORKFLOW.md's Open work item "2026-10-30 — Everything pushed in a hurry
  today", which shipped without a reviewer. Review them all as if they
  carried the trailer. If they pass (or once fixed), tick that Open work
  item.

Fast commits = `git log --format='%H %s' --grep='^Review: Fast' $range`.
None → skip to step 5 (tag) and report "Nothing shipped Fast this week."

Ignore `wip/*` branches — they aren't live.

## 2. Review

Run `site-reviewer` on the Fast commits (combined diff plus the list of
commits). Use `site-reviewer-deep` instead if any of them touches a
danger-zone file or a section/step order. Those should never have shipped
Fast; say so in the report.

Brief the reviewer to find real problems students would hit:
- broken rendering at 1366×657;
- wrong Spanish twin;
- a control whose default isn't pinned;
- a pattern claim that isn't true across the data;
- progress-key risk.

Settled decisions (skill `song-facts`, CLAUDE.md, WORKFLOW.md) are not
findings.

Every finding: read the quoted lines yourself before acting. Drop anything
you can't confirm on the real code.

## 3. Fix

For each confirmed finding, decide:

- **Fix and push to `main`** — the normal case. Follow every CLAUDE.md
  "Start here" step (checks, rule-zero proof for a `module-N.js`, smoke test,
  screenshots at 1366×657, Spanish twin, CHANGELOG line if students see it).
  Commit message trailer: `Review: Friday check` (not `Review: Fast`). Before
  pushing, `git fetch` and confirm it's a fast-forward.
- **Fix on a branch, review it, then merge it — all in this run** — when the
  fix itself is always-Reviewed (a danger-zone file such as `coach.js`, a new
  kind of check, moving/adding/removing a section or step). Jonathan's
  standing order (2026-11-07): these reviews happen automatically. He is not
  asked to start them, and the fix does not wait for him.
  1. Work on branch `friday-check/<YYYY-MM-DD>` (a worktree if another session
     could be using the checkout), rebased on current `origin/main`.
  2. Run `site-reviewer-deep` on the fix commit, briefed to try to BREAK it
     (round 1 of the 2026-11-06 coach.js fix found a real regression and six
     guards that did not bite). Then:
     - read its quoted lines yourself and fix what you confirm;
     - prove each new guard goes red when its fix is broken;
     - run a fresh `site-reviewer-deep` round on the new commit.
     Repeat until a round finds nothing real, at most 3 rounds.
  3. A clean round → rebase on `origin/main`, full `node tools/checks.mjs`,
     fast-forward push to `main`, and `checks.mjs --live` as in step 4.
     Commit trailer `Review: Friday check`.
  4. Still not clean after 3 rounds, or a finding that is a product call → do
     NOT merge: push the branch, put the open finding in WORKFLOW.md's Open
     work, and say in the report that it is waiting for Jonathan and why.
  A cloud session cannot start sub-agents the same way: if `site-reviewer-deep`
  cannot be run, push the branch and report it as waiting (the old behaviour).
- **Report only, no code** — when the fix is a teaching or content call
  (which notes, which rhythm, what the directions should say), would reverse
  a decision Jonathan made, or you're not sure it's a bug. Add it to
  WORKFLOW.md's Open work in the same push as any other fix.

Never:
- touch student data (Firebase console, Firestore exports, rosters, teacher
  dashboard on live data);
- edit `firestore.rules`;
- hand-edit the `sw.js` version lines;
- reword a keyed MC in a frozen module.

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
can't rewrite refs). Tag even when nothing shipped Fast, so next week's range
starts here.

## 6. Report

Plain language, short, for a teacher reading on his phone:

- How many Fast commits were reviewed, and their one-line subjects.
- What was fixed and pushed (one line each, what a student would have seen).
- Anything on a branch or in Open work waiting for Jonathan.
- "Confirm the deploy from a local machine" if anything was pushed.
