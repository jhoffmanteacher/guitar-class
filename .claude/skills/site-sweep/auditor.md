# Auditor brief — template (write to the scratchpad; every auditor reads it first)

Repo: the guitar-class checkout at <path>, branch main at <hash>. Plain static
HTML/JS/CSS, no build. Read `CLAUDE.md` first — it is binding.

## You are READ-ONLY
Do not edit repo files; no `git add/commit/checkout/stash/reset/push`; never run
`node tools/checks.mjs` without `--check`. Throwaway scripts go in the scratchpad.
Your job is to FIND and REPORT. A separate step fixes, after the lead verifies.

## What to find, in priority order
1. **ERRORS** — wrong at runtime or in content: exceptions, null derefs on a
   reachable path, races, stale state, timers/listeners/AudioContexts/mic streams
   never released, wrong data, EN/ES drift, broken links/ids, handlers wired to
   nothing.
2. **INEFFICIENCIES** — measurable waste on a reachable path (whole-DOM rebuilds,
   layout reads in loops, redundant Firestore reads/writes, listeners added every
   render, big synchronous work at load). Students use low-end Chromebooks.
3. **REFACTOR** — duplicated blocks (≥ ~8 lines, ≥ 2 places), copies that have
   drifted, code *proved* dead, magic numbers repeated. Only where the fix is safe.

## Evidence standard (the whole game)
Past agents fabricated defects with convincing line numbers. Every finding needs:
`file:line` (re-open and confirm just before reporting); the offending code
**quoted verbatim, copied from the file**; the concrete failing scenario (exact
input/state → wrong result); confidence HIGH/MED/LOW; the smallest fix and
whether it touches a DO-NOT-TOUCH item. Say what you checked, with counts
("traced 41 timer sites, 3 leak"). A short list of real findings beats a long list
of maybes.

## Dead-code warning
UI is built as HTML strings with inline handlers, `data-*` dispatch, `window.x =`
exports and cross-file calls (app.js ↔ teacher.js ↔ coach.js ↔ fab-tools.js ↔
tabs/journey.js ↔ index.html), and `tools/checks.mjs` reads source text for
specific names. Before calling anything dead, grep the WHOLE repo for the bare
name, as a string, in an attribute and in a template literal; say which greps.

## Do not report
Everything marked settled, switched-off-not-deleted, declined or frozen in
`CLAUDE.md`, the `song-facts` and `summer-reset` skills, and memory
(progress keys and frozen-module rules, the two step renderers, `teacherWriteConfig`
modes, `DAILY5_ENABLED`/`TAKE_TO_SONG_ENABLED`, the swap45 migration, declined
rules/latency/domain changes, song facts). Don't propose splitting files or a
build step. A content defect in a frozen module goes under "BLOCKED BY FROZEN
MODULE" (it belongs on the summer-reset list).

## Output
Write the full report to the path in your scope (findings numbered `AREA-1`…,
grouped ERRORS / INEFFICIENCIES / REFACTOR / BLOCKED, most severe first). Final
message: ≤ 350 words — counts, top 5, what you checked and how, the report path.
