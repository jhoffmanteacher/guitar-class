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

Open questions for when this starts:

- Where the new copy lives (a folder, a branch or a second repo) and how it is
  served for the A/B comparison.
- Which behaviours the tests do not cover yet and must cover before step 2.
- How student progress keys stay identical in the new copy (the "Three
  regimes" rules in `CLAUDE.md` still apply).
