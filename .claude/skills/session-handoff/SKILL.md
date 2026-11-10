---
name: session-handoff
description: Which kind of cloud session can push (web vs Cowork), the patch-pair zip handoff with APPLY-<name>.md, the sw.js CACHE_VERSION conflict rule, and how the Stop hook and git hooks work. Read before planning a handoff from a cloud session or when a hook misbehaves.
---

**There are two kinds of cloud session and only one of them can push.** Work
out which one you're in before planning a handoff: "cloud can't push" is true
of Cowork only.

- **Claude Code on the web pushes normally**, `main` included. Three limits:
  - There is no `gh` CLI; use the GitHub MCP tools instead.
  - The sandbox proxy blocks the live site, so `checks.mjs --live` comes back
    HTTP 403. The deploy has to be confirmed from a local machine.
  - **The credentials push commits but cannot delete refs** (`git push
    origin --delete` fails with `RPC failed; HTTP 403`; the GitHub MCP server
    has no delete-branch tool). Hand Jonathan the command (or the repo's
    Branches page) instead of retrying.
- **Cowork sessions can't push** (read-only GitHub; git writes through the
  device-bridge folder fail on lock files). Never attempt them.
  Instead:
  1. Run full `node tools/checks.mjs`, commit, `git format-patch`.
  2. Ship **every patch as a pair with its own `APPLY-<name>.md`** stating
     the base commit, apply order, and steps (`git status` → `git am` →
     `checks.mjs --check --skip-links` → `git push` → `checks.mjs --live`).
  3. Afterwards, hard-reset the cloud clone to origin. Never re-merge.

  **Deliver the pair as ONE zip** (Jonathan, 2026-10-05). Any handoff of two
  or more files goes out as a single `<name>.zip`, never as separate
  attachments. A single file is sent as it is. The one exception is the phone
  workflow, which stays one plain `CHANGES.md`.

  **Applying a patch: a conflict on `sw.js`'s `CACHE_VERSION` line is
  expected** (the line fingerprints every cached file, so every patch
  touches it). Keep either side of that one line and finish the `git am`.
  Then run the FULL `node tools/checks.mjs` once (not `--check`) to
  recompute it, and commit the one-line change before pushing. Don't stop
  to ask. Two new entries added at the same spot in `CHANGELOG.md` or
  `WORKFLOW.md` are the other conflict you fix yourself: keep both, the
  patch's on top (rule: `CLAUDE.md` "Start here" step 8). Any conflict in
  another file is a real conflict: stop and report it.

**Stop hook.** `.claude/settings.json` runs
`.claude/hooks/stop-checks.mjs` whenever Claude finishes a turn. If code files
are changed (`.js .mjs .css .html .json`, outside `.claude/` and `audio/`) and
the working-tree state differs from the last one it checked, it runs
`node tools/checks.mjs --check --skip-links` (about 10 s).
- A real failure **blocks the stop** and sends the output back. **Fix the
  cause — never loosen a check or add an allowlist entry.**
- The expected "shell cache stale" line is ignored (only the full
  `node tools/checks.mjs` before a push recomputes it).
- It gives up after 3 tries per turn, never re-blocks the same file state,
  and fails open on any internal error.
- Off switch: `GC_STOP_CHECKS=0` in the environment.
- It does not replace the git hooks, the full checks run, or
  `tools/smoke.mjs`.
- On Windows, Git Bash may not have `node` on PATH; the hook then silently
  doesn't run and the git hooks remain the gate.

A tracked pre-commit hook at `.githooks/pre-commit` runs the fast offline checks
on every commit. Per-machine setup, once: `git config core.hooksPath .githooks`
— **done on both machines**. Bypass with `--no-verify`.

A second tracked hook, `.githooks/pre-push`, runs the same fast offline checks
at push time. Not redundant: **git doesn't run `pre-commit` on merge commits
at all**, so a merge can carry a stale `sw.js` past every per-commit check.
Both hooks skip the network; the full `node tools/checks.mjs` is still the
real gate.

Both hooks resolve `node` themselves rather than trusting PATH (Git Bash on
Windows lacks the Node installer's PATH entry). If you ever see the "skipping
checks" warning, the hook is a no-op — run `node tools/checks.mjs` by hand.
Keep the candidate-path list identical in both hooks.

**Machines and local setup.**
- `.gitignore` ignores everything under `.claude/` except the folders it names
  (`skills/`, `rules/`, `hooks/`, `agents/`, plus `settings.json`). A new
  `.claude/<folder>` must be un-ignored there, or it is never committed.
- On a new machine: clone, run `git config core.hooksPath .githooks`, install
  Node 22+ (`tools/smoke.mjs` needs its global `WebSocket`) and Chrome or
  Chromium (`tools/smoke.mjs --chrome <path>` if it is not found).
- Live preview: VS Code Live Server (right-click `index.html` → "Open with Live
  Server"). No commit needed.
- The dev bypass (a button on the auth wall, uid `dev-user`) never writes to
  Firestore: the save path skips it. Test a save with a real account.

**Cloud-sandbox notes.**
- Clone read-only: `git clone --depth 1
  https://github.com/jhoffmanteacher/guitar-class.git`.
- Firebase does not load in the sandbox; use the dev bypass.
- `.week-panel` and `.tab-panel` are `display:none` until active, so an element
  screenshot of a set times out silently. Open it first: `devBypass()` →
  `onModuleChange(N)` → `switchTabById('<setId>', 'station-b')`. The lesson
  panel's suffix is `LESSON_TAB` (`'station-b'`); there is no `station-c` panel.
