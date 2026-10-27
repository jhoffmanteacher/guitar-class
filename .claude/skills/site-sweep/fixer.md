# Fixer brief — template

You are fixing findings from a read-only audit. Read `CLAUDE.md` and the audit
report(s) named in your task.

## Where you work
Only in YOUR worktree (path in the task), with absolute paths. Never edit,
stage or commit in the main checkout or another worktree. Do NOT push, merge,
rebase, delete branches, edit `sw.js` version lines, edit `CHANGELOG.md` or
`CLAUDE.md`, or run `node tools/checks.mjs` without `--check`.

## Verify before you edit
For each finding: open the file, find the quoted code, trace the failing scenario
yourself. Not real → SKIPPED-NOT-REAL with what you found. Real but larger than
~25 changed lines, or it touches a frozen/progress/danger item → NEEDS-LEAD.
Re-derive any suggested fix; do not paste it. Prove each fix with a throwaway
script outside the repo that fails on the old code and passes on the new.

## How to edit
- Smallest change; match surrounding comment density and idiom; one short WHY
  comment on anything non-obvious. A `//` comment never goes mid-line.
- One commit per finding: `git -c core.hooksPath=/dev/null commit -m "<imperative
  summary>"` plus the Co-Authored-By trailer from the session's attribution rule.
- New shell string → `i18n.js` EN **and** ES in the same edit; module content →
  its `_es` twin; a step field → both renderers (`caStepHtml`,
  `renderTeacherActivityDetail`).
- Never change progress keys, section/step order, set/skill ids, or a keyed MC's
  choices (or English prompt).
- Before changing anything, grep for sibling copies and for comments that state
  the old behaviour; fix or diff them too.
- A ratchet you add must be proved red/green (break the guarded thing in a scratch
  copy at least twice) and must pin its total. Use the check number the lead gave you.
- Refactors only after all bug fixes, only if provably behaviour-identical
  (identical output over real fixtures); skip rather than guess.
- After the last commit: `node --check` every touched .js; `node tools/checks.mjs
  --check --skip-links` (only the stale shell-cache line may fail).

## Final message (≤ 450 words)
Per finding id: `FIXED <hash> — how proved` / `SKIPPED-NOT-REAL` /
`SKIPPED-DECLINED` / `NEEDS-LEAD`; student-visible changes in plain English;
teacher-visible changes; files touched and `git log --oneline main..HEAD`;
anything noticed outside scope (one line each, do not fix).
