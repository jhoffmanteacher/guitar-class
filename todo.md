# To do

Things to do at some point. Not scheduled. What is open right now lives in
`WORKFLOW.md` → "Where things stand".

## Next session: start here

Jonathan will say "read todo.md" in a fresh chat. Do this, in this order:

1. **Ask him how the real-Chromebook check went** (AskUserQuestion: fine / a problem). The cut went live
   2026-11-11 at 18:28. He was to sign in as a student on school Wi-Fi, open a set, an In-Class Activity and a
   game, then the console. If he reports a blank page, a "couldn't load" or anything odd: stop and look at that
   first. The rollback is two reverts and a push (WORKFLOW.md, 2026-11-11 entry). Do nothing else until it is
   understood.
2. **If it went fine: bring `tools/pm-e2e.mjs` up to date** (first bullet of the next section). Small, tools only.
3. **The second adversarial review of `tools/golden.mjs` is done (2026-11-13): the tool failed it** (second
   bullet of the next section). Rebuild the tool before any split.
4. **Stop there and report.** Do NOT split any part in that session. The four big parts get a quiet session of
   their own (the section after next), one part per change, and `coach-core.js` only with Jonathan present.

Ordinary work does not wait for any of this: a Fast change or a new activity he asks for comes first.

## Queued by Jonathan 2026-11-13: work out the right highlight timing for every Play Along

**For Claude Code: this is a job to do, not only a warning.** Any session about to touch the practice-card player
(`app/cards.js`, `pcFrame()`, `pcSheetMark()`, the `PC_*_LEAD` constants) should read it first so two sessions do
not both change the timing. Written from a chat session that read the code only: nothing was run or measured, and
no code was changed.

- **What Jonathan said:** on ca-45 (Sweet Child O' Mine, Lyrics and Chords) the highlights "feel off". Then:
  "figure out proper timing for all of the play alongs. the highlights should show up only very slightly before the
  actual beat". (An earlier version of this note, pushed the same morning, asked for the sheet dot's lead to follow
  the tempo. He replaced that with this.)
- **The rule he wants:** on every Play Along card, a highlight appears a very small, steady amount before the beat
  is HEARD. Not half a beat early, not late, and the same on every card, song and speed.
- **This reverses three earlier settings. Say so in the report:**
  - `PC_SHEET_LEAD = 0.175` (lyric-sheet dot; he tuned it by ear on 2026-10-19, on ca-38);
  - `PC_ROW_LEAD = 0.15` (first note of a new row or page, 2026-10-22, ca-29);
  - `PC_TAB_LEAD = 0` on the decoder's position, which is already about one output latency ahead of the sound
    (2026-10-22). This one may already be close to what he wants.
- **What exists (read from the code, check it):** every card's cursor comes from `audio.currentTime` in
  `pcFrame()`. The sound reaches the speakers later, by about `SNIP_OUTPUT_LATENCY` (0.08 s, an estimate for a
  laptop's speakers). So against the HEARD beat, a tab note lights about 80 ms early, a note on a new row about
  230 ms early, and a sheet dot about 255 ms early. The sheet dot stays filled for `PC_SHEET_SOLID = 0.42` of a
  beat, which at 125 BPM is about 200 ms, so on ca-45 it may be hollow again before the beat sounds.
- **Do:**
  1. Measure, do not reason. For every `view: 'card'` activity in `class-activities.js` (tab cards, chord-grid
     cards and the three sheet cards ca-38, ca-44, ca-45), at each speed, find when each highlight paints against
     when its beat is heard. `tools/playalong-loop.mjs` already drives the cards in headless Chrome; extend it or
     write a small tool beside it. Report the lead per card type and speed, with the count of cards measured.
  2. Sort what you find into two piles: a lead that is wrong by design (the constants above), and a card whose
     lead is NOT steady through the song. An unsteady one is a chart or beat-map fault, not a lead
     (`python3 tools/beat-audit.py --only <slug>`; skill `song-facts`). Fix or list those separately.
  3. Propose ONE small lead for every card type, in real time at every speed, and make the sheet dot still be
     filled when the beat sounds. Keep whatever real reason the row lead had (the eye has to jump to a new line)
     only if it still fits "very slightly".
  4. "Very slightly" is his to set: ask him for the number (AskUserQuestion, 2 to 4 options in milliseconds), and
     give him a live override on the URL, like `?snipcal=1&lat=`, so he can check it by eye on a classroom
     Chromebook before it is fixed in the code.
  5. Ask him whether the same rule covers the step snippets' bar dots and the Song Journey pages. The dots were
     left slightly early on purpose (2026-09-18, "slightly early, but in an accurate way"), which sounds like the
     same rule, so they may need nothing.
- **Leave alone:** the metronome click (it is scheduled to land on the heard beat), `anchor` and `barTimes` unless
  step 2 finds a measured fault.
- **Rules that apply:** skill `audio-and-snippets`; `node tools/playalong-loop.mjs` and report its summary line;
  screenshots at 1366x657; a `CHANGELOG.md` entry, because students see it. Its own worktree, then ship to main.
- **When it ships:** delete this section, and update the "dots still lead the beat" part of skill
  `audio-and-snippets` and the comments above the three constants so they describe the new rule.

## Queued by Jonathan 2026-11-13: fill whatever monitor is being used

Idea only: nothing was measured or changed.

- **What Jonathan said:** "the view should be maximized for whatever monitor is being used. so chromebooks but
  also other displays (not phones) should be taken into account".
- **What it means:** the site should use the whole screen on any laptop, desktop monitor or projector, not only
  on the Chromebook. Phones stay out of scope (keep the existing phone CSS, add none).
- **This widens a standing rule. Say so in the report:** `CLAUDE.md` → "Target screen: Chromebook 1366×657".
  The Chromebook stays the screen that must not get worse; larger and differently-shaped displays join it. When
  this ships, reword that line and the 1366×657 screenshot rule in "Start here" step 4 to name the extra sizes.
- **Do first:** measure, do not reason. Screenshot a set, an In-Class Activity, a practice card (tab, chord grid
  and lyric sheet), a game, My progress and the teacher console at 1366×657 and at a few larger sizes (for
  example 1920×1080, 2560×1440, and a projector's 1280×720), and list where space is wasted (fixed max-widths,
  fixed pixel heights, content that stays small in the middle) or where something breaks.
- **Then ask him** (AskUserQuestion) which screens matter most and whether "maximized" means the content grows
  (bigger tab and chord diagrams) or only that the layout stretches to the edges.
- **Rules that apply:** `.claude/rules/rail-layout.md` (the nav two-column grid is permanent; measure, don't do
  arithmetic); the one-rendered-line rule for activity directions is checked at 1366×657 and must still hold
  there; `styles.css` touched broadly means the change smoke without `--only`; a `CHANGELOG.md` entry.

## Split the four parts that are already over 2,000 lines

Added 2026-11-11 (Jonathan: "let's make sure we split those files at some point"). Not urgent, but do it in a
quiet session before one of them reaches the 2,600-line limit that `checks.mjs` 1cv enforces, so the limit never
blocks a quick change mid-week.

| Part | Lines on 2026-11-11 | Where it could be cut (read the banners first; these are guesses) |
|---|---|---|
| `teacher-activities.js` | 2,400 | the board (arrange, drag and drop, the one move writer) apart from the list and detail screens |
| `coach-runner.js` | 2,393 | Riff Runner apart from Note Runner and wait mode |
| `coach-core.js` | 2,329 | only with Jonathan: it is the listening code. Mic recordings (`micRec*`) are the obvious section to move; the detectors, `coachDetectPitch` and every line `tools/mic-sim/` reads stay put |
| `coach-chords.js` | 2,034 | Change Up / Power Chord Switch apart from Chord Blitz and Chord Detective. The busiest part (44 of the arcade's 55 commits in 14 days) |

How: one part per change. Move a banner section, whole and unchanged, into a new part loaded right after the one
it came from; list the new file in `COACH_JS_PARTS` / `TEACHER_JS_PARTS` (`app/boot.js`) and, for an arcade part,
in `sw.js` ASSETS (`checks.mjs` says if one is missed). Prove it the way the cut was proved: `node tools/golden.mjs`
before and after with `--compare` identical, `node tools/slow-load.mjs`, the full `node tools/checks.mjs`; for
`coach-*` also the three mic-sim commands in `CLAUDE.md`. A split touches load order, so it is Always-Reviewed.
Check `tools/mic-sim/` and `checks.mjs` for text they pin in the section being moved before moving it.

## Follow-ups from the 2026-11-11 cut (none urgent)

- [x] **DONE 2026-11-12** (`tools/pm-e2e.mjs` now expects the folded header on an open card; see its commit). **`tools/pm-e2e.mjs` is out of date, on the old site too.** It expects the practice-minutes strip to show while
  a practice card is open; since 2026-11-10 an open card folds the header away (checks 1cr, and smoke's own
  practice-minutes walk passes on that). On 2026-11-11 it failed 3 checks and then threw at line 187, identically
  on the uncut site and on the cut one. Bring it in line with the folded header, or retire the lines smoke covers.
- **`tools/golden.mjs` is NOT proof for a split yet: rebuild it first.** The second adversarial review ran
  2026-11-13 and said no: 3 of 8 planted faults caught; 140 of 281 screenshots were of the wrong screen; two runs
  of the same unchanged tree differed in 45 files; the games are never played. Jonathan approved all four splits
  (2026-11-12) only once golden is cleared, so no part is split until the tool is fixed and a fresh reviewer's
  plants are caught. The rebuild started 2026-11-13 on branch `cl/golden-rebuild` (one builder against review
  findings R2-1 to R2-6; a fresh reviewer plants its own faults when it reports).
- **A `golden.mjs --compare` process once printed its result and never exited** (2026-11-11, 39 minutes, 0% CPU;
  the same command run again took 0.7 s). Cause unknown. Until it is understood, give a compare a time limit
  when it runs in a chain (`perl -e 'alarm 300; exec @ARGV' node tools/golden.mjs --compare A B`).
- **Comments that still say `app.js` / `coach.js` / `teacher.js`** as a place to look (about 850 mentions; the 40
  most misleading are in `index.html`, `sw.js`, `tuner.js`, `guitar-diagrams.js`, `config-main.js`,
  `tabs/journey.js`, `live-quiz.js`, `fab-tools.js`). CLAUDE.md says the old names are logical names, so this is
  tidying, not a hazard. `sw.js` says the shell is 16 requests; it is 30.
- **The snapshot tool's known gaps** are listed below under "Step 1, not recorded yet".
- **Ask Jonathan how the real Chromebook check went** (sign in as a student: a set, an activity, a game; and the
  console), and whether any student saw a blank page or a "couldn't load" on 2026-11-12.

## Refactor the whole site (the cut is live; the clean-ups are not started)

**Status (2026-11-11):** the cut went live on 2026-11-11: `app.js`, `coach.js` and `teacher.js` are now part files
(`WORKFLOW.md` → "Recently shipped" → 2026-11-11; CLAUDE.md → "Where the code lives"). Still open: Phase 2 (the
clean-ups) and the items under "Step 1, not recorded yet". The text below is the record, left as written.

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
