---
name: site-sweep
description: How to run a whole-site audit-and-fix sweep on the guitar site with sub-agents — roles, brief templates, the worktree + cherry-pick merge method, adversarial review, the real-browser smoke test, shipping, and the pitfalls the 2026-10-25 sweep hit. Read BEFORE launching more than ~3 agents or changing more than ~15 files in one go.
effort: xhigh
---

## Site sweep playbook

Use it for a whole-site audit, a many-file refactor, or a wording pass over
50+ strings. Do NOT use it for a normal fix.
Templates live next to this file: `auditor.md`, `fixer.md`, `reviewer.md`.
Write the brief once to the session scratchpad and tell every agent to read it
first; do not paste it into each prompt.
- A conversion sweep's brief opens with the calibration line: "convert EVERY
  card; do NOT skip one because the actions flow naturally — re-stitch it."
  Without it agents go timid.
- A cheaper model (Sonnet) only for mechanical work; the big model for design
  and verification.

**Spawn the project agents (`.claude/agents/`), not a general-purpose one:**
- `site-auditor` (high effort);
- `site-fixer` (high);
- `site-reviewer-deep` (extra high). A sweep always gets the deep reviewer,
  not the high-effort `site-reviewer`.

Each pins its own model (Opus) and effort. A newly added agent file may need a
restart or `/agents` before it is offered. If it isn't, fall back to a
general-purpose agent with `model: opus` and `effort: high`; a reviewer gets `model: fable` and `effort: medium` (2026-11-09).

### The flow
0. **Baseline.** `git fetch origin`; fast-forward main; `git worktree list`;
   `node tools/checks.mjs --check --skip-links`; `node tools/smoke.mjs`. Note
   what already fails.
1. **Audit (read-only, Opus).** Split by file range or area, ≤ ~6,000 lines
   each, plus one tool-driven agent for dead code and duplication. Say what
   each range actually contains. Template: `auditor.md`.
2. **Verify before you fix.** For every HIGH finding, open the file and read the
   quoted lines yourself. Decide, per finding: fix / skip
   (settled, product call, untestable) / ask Jonathan. Product calls and
   anything that changes a rule go to him via AskUserQuestion, not to an agent.
3. **Fix.** Create the worktrees yourself *first*
   (`git worktree add .claude/worktrees/fix-X -b fix/X-<date> main`) and tell
   each fixer to work only there (parallel `isolation:"worktree"` launches
   race).
   - One fixer per file family, so two never edit the same file.
   - Give each a numbered FIX list and a DO-NOT-FIX list with reasons.
   - Fixers commit with `git -c core.hooksPath=/dev/null commit`, never touch
     `sw.js` versions or `CHANGELOG.md`, and must re-derive any suggested fix
     rather than paste it.
   - Hand out new check numbers in advance (`grep -o "head('1b[a-z0-9]*\."
     tools/checks.mjs | sort | tail -3`).
   - Refactors come after the bug fixes and only if provably
     behaviour-identical.
4. **Integrate.** New branch from main; for each fixer
   `git cherry-pick main..fix/X-<date>` (linear history, no merge commits, so
   the final push is a fast-forward). Resolve conflicts; renumber colliding
   check labels (`grep -oE "head\('1[a-z0-9]+\." tools/checks.mjs | sort | uniq
   -d` must print nothing); `node --check` every .js; `node tools/checks.mjs
   --check --skip-links` (only the stale cache line may fail);
   `node tools/rule-zero-proof.mjs origin/main`.
5. **Adversarial review — not optional.** Template: `reviewer.md`.
   - Review a *pinned commit* through `git show <hash>:file`, with a
     differential harness wherever logic changed (old vs new over many
     inputs/schedules).
   - Reviewers cannot write report files; ask for the report in the final
     message.
   - Send findings back to the same fixer on a new branch cut from the
     integration tip, then cherry-pick again.
6. **Smoke.** `node tools/smoke.mjs --baseline origin/main` — must report no
   errors beyond the baseline.
7. **Ship.**
   1. CHANGELOG entry (student's view, plain words, only true claims).
   2. Full `node tools/checks.mjs` (links); commit the recomputed `sw.js`
      *with hooks on*.
   3. `git fetch` and `git rev-list --left-right --count origin/main...HEAD`.
      If origin moved, `git rebase origin/main` and re-run the checks.
   4. `git push origin HEAD:main`.
   5. `node tools/checks.mjs --live` (retry: a big audio push takes several
      minutes).
8. **Clean up.** Fast-forward the main checkout (`git merge --ff-only
   origin/main`; leave Jonathan's untracked files alone). Delete a fix branch only
   after `git cherry origin/main <branch>` shows no `+` lines; remove the
   worktrees.
9. **Remember.** Save open items and process lessons to memory
   (`site-sweep-<date>`), and add a WORKFLOW.md entry.

### Pitfalls this sweep hit
- Fixes are the riskiest code (see `.claude/rules/code-hygiene.md`).
- A script that finds 0 in both trees proves nothing.
- A usage-limit 429 kills running agents; `SendMessage` resumes them with their
  work intact.
- `origin/main` moves mid-sweep. Fetch immediately before pushing.
- Pasted rules can contradict themselves. Ask before an irreversible push.
- Word counts are a poor benefit measure for wording passes; sentences get
  shorter, cards do not.

### At medium effort
Follow the numbered flow literally and run the named commands. A sweep is
always Reviewed the same day, never shipped Fast. Every other change follows
"Fast by default" in CLAUDE.md: a danger-zone file, a new kind of check, or
moving/adding/removing a section or step is always Reviewed the same day; any
other trigger ships Fast with a `Review: Fast` trailer.
