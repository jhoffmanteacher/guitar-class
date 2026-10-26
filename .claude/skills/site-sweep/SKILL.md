---
name: site-sweep
description: How to run a whole-site audit-and-fix sweep on the guitar site with sub-agents — roles, brief templates, the worktree + cherry-pick merge method, adversarial review, the real-browser smoke test, shipping, and the pitfalls the 2026-10-25 sweep hit. Read BEFORE launching more than ~3 agents or changing more than ~15 files in one go.
effort: xhigh
---

## Site sweep playbook (from the 2026-10-25 sweep: 11 auditors, 7 fixers, 4 reviewers, 130 commits)

Use it for a whole-site audit, a many-file refactor, or a wording pass over
50+ strings. Do NOT use it for a normal fix — one agent or none is cheaper.
Templates live next to this file: `auditor.md`, `fixer.md`, `reviewer.md`.
Write the brief once to the session scratchpad and tell every agent to read it
first; do not paste it into each prompt.

**Spawn the project agents, not a general-purpose one:** `site-auditor` (high
effort), `site-fixer` (high) and `site-reviewer` (extra high), defined in
`.claude/agents/`. Each pins its own model (Opus) and effort, so the review —
where the 2026-10-25 sweep found its real regressions — always gets the
deepest pass without anyone remembering to ask for it, and routine fixes don't
pay for more than they need. (A newly added agent file may need a restart or
`/agents` before it is offered. If it isn't, fall back to a general-purpose
agent with `model: opus` and, for reviewers, `effort: xhigh` — CLAUDE.md
authorizes that pin.) This skill itself pins `effort: xhigh` while it is active.

### The flow
0. **Baseline.** `git fetch origin`; fast-forward main; `git worktree list`;
   `node tools/checks.mjs --check --skip-links`; `node tools/smoke.mjs` (a
   real-browser walk, about a minute). Note what already fails so nobody is
   blamed for it.
1. **Audit (read-only, Opus).** Split by file range or area, ≤ ~6,000 lines
   each, plus one tool-driven agent for dead code and duplication. Say what each
   range actually contains — a wrong description misleads the agent (it will
   tell you). Template: `auditor.md`.
2. **Verify before you fix.** For every HIGH finding, open the file and read the
   quoted lines yourself (grep the quoted code). Decide, per finding: fix / skip
   (settled, product call, untestable) / ask Jonathan. Product calls and
   anything that changes a rule go to him via AskUserQuestion, not to an agent.
3. **Fix.** Create the worktrees yourself *first* —
   `git worktree add .claude/worktrees/fix-X -b fix/X-<date> main` — and tell
   each fixer to work only there (parallel `isolation:"worktree"` launches
   raced). One fixer per file family so two never edit the same file. Give each a
   numbered FIX list and a DO-NOT-FIX list with reasons. Fixers commit with
   `git -c core.hooksPath=/dev/null commit`, never touch `sw.js` versions or
   `CHANGELOG.md`, and must re-derive any suggested fix rather than paste it.
   Hand out new check numbers in advance (`grep -o "head('1b[a-z0-9]*\."
   tools/checks.mjs | sort | tail -3`) — three agents once all picked `1br`.
   Refactors come after the bug fixes and only if provably behaviour-identical.
4. **Integrate.** New branch from main; for each fixer
   `git cherry-pick main..fix/X-<date>` (linear history, no merge commits, so
   the final push is a fast-forward). Resolve conflicts; renumber colliding
   check labels (`grep -oE "head\('1[a-z0-9]+\." tools/checks.mjs | sort | uniq
   -d` must print nothing); `node --check` every .js; `node tools/checks.mjs
   --check --skip-links` (only the stale cache line may fail);
   `node tools/rule-zero-proof.mjs origin/main`.
5. **Adversarial review — not optional.** Template: `reviewer.md`. Review a
   *pinned commit* through `git show <hash>:file`, with a differential harness
   wherever logic changed (old vs new over many inputs/schedules). Every round on
   2026-10-25 found real regressions in the fixes. Reviewers cannot write report
   files; ask for the report in the final message. Send findings back to the
   same fixer on a new branch cut from the integration tip, then cherry-pick
   again. A reviewer's suggested fix can be wrong in the real code — the fixer
   re-derives it.
6. **Smoke.** `node tools/smoke.mjs --baseline origin/main` — must report no
   errors beyond the baseline.
7. **Ship.** CHANGELOG entry (student's view, plain words, only true claims);
   full `node tools/checks.mjs` (links); commit the recomputed `sw.js` *with
   hooks on*; `git fetch` and `git rev-list --left-right --count
   origin/main...HEAD` — if origin moved (another session pushed), `git rebase
   origin/main` and re-run the checks; `git push origin HEAD:main`; then
   `node tools/checks.mjs --live` (a big audio push takes several minutes — retry).
8. **Clean up.** Fast-forward the main checkout (`git merge --ff-only
   origin/main`; leave Jonathan's untracked files alone). Delete a fix branch only
   after `git cherry origin/main <branch>` shows no `+` lines; remove the
   worktrees (each holds hundreds of MB of audio).
9. **Remember.** Save open items and process lessons to memory
   (`site-sweep-<date>`), and add a WORKFLOW.md entry.

### Pitfalls this sweep hit
- Fixes were the riskiest code: a mid-line `//` swallowed object fields; a
  simplified Coach tip became false; a console rewrite left views on "Loading…".
- Vacuous verification: a script that finds 0 in both trees proves nothing.
- A usage-limit 429 kills running agents; `SendMessage` resumes them with their
  work intact.
- `origin/main` moved mid-sweep. Fetch immediately before pushing.
- Pasted rules can contradict themselves (one gain per song vs every file within
  ±1 LU). Ask before an irreversible push (it was a 267 MB audio change).
- Word counts are a poor benefit measure for wording passes; sentences get
  shorter, cards do not.

### At medium effort
Don't rely on remembering the above. Follow the numbered flow literally, run the
named commands, and treat the triggers as rules: a review is **required** for
any change that touches 3+ files, a danger-zone file (teacher.js config
plumbing, sw.js, checks.mjs, coach.js detection, app.js save path), or 50+
strings of text.
