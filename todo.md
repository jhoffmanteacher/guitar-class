# To do

Things to do at some point. Not scheduled. What is open right now lives in
`WORKFLOW.md` → "Where things stand".

## Refactor the whole site (not ready yet)

Added 2026-11-11 (Jonathan). Idea only: nothing has started.

The plan, in order:

1. **Strengthen the tests against the site as it is today.** Use the existing
   site as the reference: grow `tools/checks.mjs`, `tools/smoke.mjs` and the
   other test tools until they describe what the site does now, well enough to
   catch a rebuild that behaves differently.
2. **Fix the tests in place.** Once they pass on the existing site, they stop
   changing. They are the definition of "the site still works".
3. **Refactor in a new copy of the code.** The existing site stays untouched
   and keeps serving the class while the new copy is built.
4. **Run the same fixed tests on the new copy.** The rebuild is done when the
   tests that pass on the old site also pass on the new one.
5. **A/B compare old and new,** then decide whether to switch. Switching is a
   separate decision, made after the comparison, not part of the refactor.

Started 2026-11-11. State (this branch, `rebuild/site`, worktree `.claude/worktrees/rebuild`; `main` is not touched):

- **Where the copy lives (decided):** this worktree and branch. The old site is the `main` checkout. Both are
  served locally and compared; nothing is deployed for the comparison.
- **Step 1, done so far: `tools/golden.mjs`.** It records what a site folder shows and saves (sets, rails,
  screens, game views, activity cards and steps, the pages that open on their own, the floating tools, the
  teacher console against the fake class, the live quiz with a made-up game (student screen and stage), a screenshot of every set and page, and what every saving control
  writes), and `--compare` fails on any difference. Proved: two runs of the same site identical (789 of 789
  files); a reworded label, a shifted progress key and a one-shade colour change each caught. Its header lists
  the names the rebuild must keep reachable (the driver contract).
- **Step 1, not recorded yet:** what games and drills do after Start, the tuner, the live quiz's clock and
  its writes, real sign-in and Firestore saves (the dev bypass never saves).
- **Finding (audit of `tools/checks.mjs`, 2026-11-11): 44 of its 110 sections depend on the TEXT of the code**
  (14 are mainly text checks, 18 data checks and 12 executing checks carry text pins). They fail when code only
  moves, so they cannot be frozen as they are. Before step 2 each one is either rewritten to test behaviour or
  listed as "updated together with the code it reads". Hardest ten: 1cg, 1cl, 1ce, 1cp, 1ck, 1d, 1ah, 1ai, 1bo,
  1bb. Outside checks.mjs the text readers are sw-audio-proof, tuning-sim-proof, pm-sim (lifts 7 teacher.js
  functions), grid-sim and the mic-sim tools; `diagram-parity-check.mjs` slices app.js by line number and is
  already unusable: leave it out of the frozen set.
- **Decided (Jonathan, 2026-11-11): split the tests.** FROZEN = the tests of behaviour: `tools/golden.mjs`,
  `tools/smoke.mjs`, `tools/console-layout-smoke.mjs`, `tools/pm-e2e.mjs`, `tools/pm-rules-test.mjs`,
  `tools/rule-zero-proof.mjs`, the simulators, and the 66 `checks.mjs` sections that do not read code text.
  NOT frozen = the 44 sections that read code text: each may be updated in the same change as the code it
  reads, and every such update is listed for Jonathan in that change's report. The 44 (by the audit; verify a
  section before relying on its class):
  - mainly text (14): 1ac, 1g, 1u, Post-push, 1ah, 1ai, 1as, 1bb, 1bo, 1bl, 1cp, 1cg, 3, 1f
  - data checks with text pins (18): 1o, 1s, 1v, 1d, 1ak, 1ba, 1bf, 1bf2, 1bq, 1bn, 1bk, 1bj, 1x, 1ab, 1bi, 1e,
    1ag, 1bt
  - executing checks with text pins (12): 1cm, 1ce, 0, 1cc, 1cf, 1ch, 1cd, 1bg, 1ca, 1ck, 1cl, 1cs
- **Power Chord Switch listening code:** may be refactored, but the lines, constants and names listed by
  Jonathan on 2026-11-11 stay byte for byte or the mic-sim tool is updated in the same change; never touch
  `tools/mic-sim/takes/`; ask before changing `coachDetectPitch` or the mic filters.

Open questions for when this starts:

- Where the new copy lives (a folder, a branch or a second repo) and how it is
  served for the A/B comparison.
- Which behaviours the tests do not cover yet and must cover before step 2.
- How student progress keys stay identical in the new copy (the "Three
  regimes" rules in `CLAUDE.md` still apply).
