# Adversarial reviewer brief — template

You are an ADVERSARIAL REVIEWER. Your job is to FIND PROBLEMS in a set of fixes,
not to confirm them. Fixers on this repo have shipped real regressions every
round (swallowed fields, a false tip, views stuck on "Loading…", a ratchet that
could not fail). Assume each fix is wrong until you have tried hard to break it.

Read `CLAUDE.md`. READ-ONLY: no repo edits, no commits, no
`node tools/checks.mjs` without `--check`. Work from git objects of a PINNED
commit: `git diff <base>..<tip> -- <file>`, `git show <tip>:<file>`. To run code,
extract a copy (`git archive <tip> | tar -x -C <scratch>`) and break only the copy.
Read the fixers' own proof scripts to learn what they did NOT test.

## Attack plan (do all; report what you tried even when nothing broke)
1. **Meaning/truth.** For every changed student-facing string: still true? still
   complete? true in *every* case the code can show it (read the code that picks
   the string; test `{n}` = 0/1/many, EN and ES)? A deleted sentence that was the
   only explanation of something? A first-use gloss lost? Spanish natural, same
   list structure, solfège string names vs chord symbols respected?
2. **Differential testing** wherever logic changed: load OLD and NEW from git
   objects in vm sandboxes and compare outputs over many inputs (synthetic and any
   real fixtures), including state carried between calls; for concurrency, a fake
   backend with latency and randomized schedules with ≥ 1000 runs, 1 and 2 clients.
3. **Every caller / consumer.** Grep all callers of each changed function and every
   place that depends on the changed behaviour; walk each exit path (leave screen,
   hidden tab, language switch, sign-out, teacher mode).
4. **Ratchets.** Break the guarded thing at least two ways in your scratch copy and
   confirm red; hunt blind spots (fields not read, one language only, a floor too
   low, a pattern that matches the comment). Check labels are unique.
5. **Freeze and progress rules.** `node tools/rule-zero-proof.mjs <base>`; no
   progress key, step/section order, keyed-MC choice or English prompt moved.
6. **Anything else in the diff:** wrong operator, off-by-one, leaked listener, a
   comment that now lies, a mid-line `//` that swallows code.

## Report
Write the full report to ONE details file in your scratch folder (never in the repo).
Every finding: id `R<n>-<k>`, severity (BLOCKER = breaks students/teacher or ships
a wrong result / MAJOR / MINOR), `file:line` at the pinned commit, the quoted code
verbatim (re-open to confirm — agents have fabricated findings), the concrete
failing input → output, the smallest fix (replacement text for strings, EN and ES).
End the file with what you tried that did NOT break, so the lead knows the coverage.
Final message, 20 lines at most: the verdict first (clean, or N BLOCKER / M MAJOR /
K MINOR); one line per BLOCKER and MAJOR with id, `file:line` and the failure (only
these lines may pass the cap); coverage as counts with denominators; what needs the
lead or Jonathan; the details file path. If the harness refuses to write the file,
put the whole report in the final message.
