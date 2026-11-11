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
- **Review round 1 of the tool (2026-11-11): 8 broken copies, 0 caught.** It compared a never-clicked page for
  the dev user only. Added in answer, and all 8 are now caught: what reaches the server after each click (a
  made-up student on an in-memory Firestore), the gates for a real student at five stages, every set and My
  progress in the filled state, Next / Back clicked through every step list, a fingerprint of what each click
  drew, the saving controls of every In-Class Activity, the console's Settings switches with what each writes,
  a screenshot of every recorded view, byte copies of the files the rebuild must not change, a fixed time
  zone, and a compare that fails on unfinished or differently-taken snapshots and says PARTIAL otherwise.
  A fresh reviewer goes over these additions next (cap: 8 mutations).
- **Step 1, not recorded yet:** what games and drills do after Start; exit checks being taken and scored; the
  search panel; the tuner; the live quiz's clock and writes; `loadProgress` and the swap45 move on sign-in;
  the service worker; phone widths; the Spanish filled state.
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

### The shape of the rebuild (planning pass 2026-11-11; cut lines come from section banners, not yet checked body by body)

**Chosen: keep the one global scope and classic scripts; cut `app.js`, `coach.js` and `teacher.js` into feature
files along their banners with a re-runnable script; then a short list of real clean-ups.** Not ES modules: the
frozen browser tools assign to top-level `let`s bare (`classActivities = …`, `pcState = st`, `db = …`) and patch
functions on `window` expecting the site's own calls to see the patch; modules break both. No build step.

Why the three files: app.js 17,900 lines, coach.js 10,700, teacher.js 7,200; 64 / 55 / 51 commits touched them in
14 days, so sessions collide and every session pays to read them. Main moves about 27 commits a day, so the cut
must be a SCRIPT that can be re-run on a newer main, with the hand-made clean-ups a short stack on top.

- **Phase 0 (first, no site code moves):**
  - 0a `tools/site-src.mjs`: `siteSource('app.js'|'coach.js'|'teacher.js')` = the parts concatenated in load
    order; every tool that reads those files by name calls it (checks.mjs about 51 reads + its file lists,
    grid-sim, mic-sim closed-loop / eval-takes / fake-pw-take, pm-sim). Proof: every tool's output identical
    before and after on the unsplit tree, denominators included. Always-Reviewed.
  - 0b `tools/split-site.mjs`: writes the parts from a cut list; asserts concat(parts) = the source byte for
    byte and that no cut falls inside a function.
  - 0c two new tests, run on the old site first: `tools/slow-load.mjs` (each script delayed at random, signed
    in, `?teacher=true`, a deep link; no exception in 20 loads: the load race nothing tests today), and a
    checks.mjs section that every function an inline handler or a frozen tool calls resolves once all parts
    are loaded (1bs only compiles handlers).
- **Phase 1 (three slices, parallel in three worktrees, disjoint files; pure moves):**
  - 1A app.js → `app/` (boot, save, tab, snippets, shell, lesson, review, drills, drills-call, audio-ui,
    explore, activities, cards, start). The one non-pure edit: `auth.onAuthStateChanged` and the other
    statements that START things move to `app/start.js`, loaded last. Save path moved verbatim: Always-Reviewed.
  - 1B coach.js keeps lines 1-2326 unmoved (detection, `coachDetectPitch`, the mic-sim lines); the games go to
    coach-hub / -chords / -ear / -strum / -runner / -more. Proof includes the mic-sim trio, numbers identical.
  - 1C teacher.js → teacher (core), -activities, -songs, -config (verbatim), -manage, -mic, -students.
  - 1Z integration by one session: index.html script block, loader lists, sw.js file lists (danger zone),
    SHELL_FILES, CLAUDE.md and skill file lists; full checks, golden, smoke.
- **Phase 2 (hand-made, each one commit, snapshot-compared):** 2a declarations next to their feature and the
  switched-off code in one labelled file; 2b one shared "step plan" for the two step renderers (each keeps its
  own markup) and check 1v rewritten to execute; 2c break up `buildLesson`; 2d break up `showTeacherApp` and
  `renderTeacherActivities`; 2e (optional, Jonathan's call) move dated history comments out of the code:
  comments are 43% of app.js's bytes.
- **Phase 3:** final sync with main, full golden with screenshots, smoke, slow-load, pm-e2e, console smoke,
  the mic-sim trio; then the A/B.
- **Do not refactor:** inline `onclick` handlers and HTML-by-strings (golden freezes the attribute text); the
  top-level state `let`s; `coachDetectPitch`, the mic filters, `ccLoop`, anything in coach.js 1-2326; the bodies
  of the save path and `teacherWriteConfig`; firestore.rules, document shapes, storage keys, module and activity
  data, i18n.js; the files the standalone pages load (their script tags are in the snapshot) and those pages;
  practice-minutes.js, live-quiz.js, fab-tools.js, tuner.js, guitar-diagrams.js, trainer-*.js; styles.css;
  sw.js logic; the frozen tools.
- **Left for the cut slices (from the review of 0a, 2026-11-11):**
  - `tools/mic-sim/replay-takes.mjs` line 239 runs `git log … -- coach.js` from `tools/mic-sim`, so the pathspec
    matches nothing TODAY and "the newest take is before the last listening change" can never print (from the
    repo root it answers 2026-11-07). It is the listening work's tool: tell Jonathan, do not change its output
    here. After the cut it must name every coach part (`ccLoop` and `ccResolvePend` leave `coach.js`).
  - checks.mjs 1cg pins the literal `<script defer src="app.js">`; checks messages that print a line number
    of the combined text (`teacher.js:123`) will be numbers in the concatenation, not in a part: fix both at 1Z.
  - The vm loaders in checks.mjs, grid-sim and closed-loop run the CONCATENATION as one script, so they cannot
    see a load-order fault between parts (one script hoists every function): that is what 0c is for.
  - `index.html`'s part block, the two `*_JS_PARTS` arrays and the sw.js lists must land in ONE change: once
    parts are declared, checks demand each app and coach part in sw.js ASSETS.
- **Risks with no test yet:** the load race (0c); the service worker upgrading returning students from one
  cached `app.js` to about 11 files in one all-or-nothing step (needs an old-lists → new-lists upgrade
  simulation before the switch); first-load time with more requests (measure on main and on the rebuild for
  the A/B report).

Open questions for when this starts:

- Where the new copy lives (a folder, a branch or a second repo) and how it is
  served for the A/B comparison.
- Which behaviours the tests do not cover yet and must cover before step 2.
- How student progress keys stay identical in the new copy (the "Three
  regimes" rules in `CLAUDE.md` still apply).
