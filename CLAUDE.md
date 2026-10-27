# Guitar Class Website — Claude Instructions

Operative rules only. History, worked examples, and the reasoning behind each
rule live in `WORKFLOW.md` — read it when you need the *why*, not every session.

## Start here — the short list (read this even if you read nothing else)

**Before you say "done" on a code change:**
1. While working: `node tools/checks.mjs --check --skip-links` (a Stop hook now
   runs it for you at the end of every turn that changed code; if it blocks
   your stop, fix the cause — see "Stop hook" below). Before a push: the full
   `node tools/checks.mjs`. Never hand-edit the version lines in `sw.js`.
2. Touched a `module-N.js`? `node tools/rule-zero-proof.mjs origin/main`, and
   paste its summary into your report.
3. Touched a renderer, escaping, or 3+ files (counted as in "Triggers" below)?
   `node tools/smoke.mjs --baseline origin/main` — a real browser walks every set
   in English and Spanish (about a minute). (Skipped on a "quick change" — see
   "Quick change" under the Triggers.)
4. New student-facing text → its Spanish twin, same edit. A new step field →
   both step renderers.
5. A student can see the change → a `CHANGELOG.md` entry, same push.
6. Right before pushing: `git fetch`, then `git log HEAD..origin/main`. After
   pushing: `node tools/checks.mjs --live`.

**Never, whatever the task says:** move or renumber a section or step (progress
keys); reword a keyed MC's choices — or its English prompt — in a frozen module
or the one the class is about to enter ("Three regimes"); write `progress/{uid}`
from console code; write `config/class` except through `teacherWriteConfig()`;
change `firestore.rules` without telling Jonathan it needs a console paste;
re-level "the cure"; delete what is switched off (Daily 5, Take It to a Song
sections); resurrect the deleted student tour.

**Habits that catch the expensive bugs:**
- Grep before you edit — the same bug lives in sibling copies and in comments
  that describe the old behaviour. Fix them together.
- Unsure whether a change is allowed? Run the proof tool; don't reason it out.
- A check fails → fix the cause. Never loosen the check, or add an allowlist
  entry, to get green.
- Report what you verified with the denominator ("306 handlers compiled"), not
  "looks fine". A script that finds 0 in both the old and new tree proves nothing.
- Product calls, and rules that contradict each other, go to Jonathan through
  AskUserQuestion — don't pick silently.

Which file to read before touching an area: the table under "Lazy-loaded
guidance" near the end.

## Who I'm working with
Jonathan Hoffman prefers plain-English instructions and wants Claude to handle
all git mechanics without him needing to remember commands.

## Project: what this is
Plain static HTML/JS/CSS — no build step, no framework. Content lives in
`index.html` and per-module JS (`module-1.js`…`module-13.js`, `config-main.js`).
Firebase auth + Firestore progress. Deployed by pushing to GitHub.
`live-quiz.js` holds the whole live-quiz feature (student + teacher) — see
`.claude/rules/live-quiz.md`.
Module 13 (String Changing) is a *single-flow* module — `stations.b` only,
custom tab labels, checklist = graded assessment.

**Stations B and C are merged in DISPLAY ONLY** (2026-08-27, Work Order 7).
The room runs two groups now — one with the teacher, one on the site — so a
set renders as ONE continuous step ladder: B's sections, a seam divider
carrying C's own title words, then C's sections, numbered straight through.
`stations.b` / `stations.c` in the module files are unchanged and so is every
progress key (`${w.id}-b-sec{gi}-{i}` / `${w.id}-c-sec{gi}-{i}`) — never
"simplify" the data to match the display. **`gi` is the section's position
after excluding only tuning-warmup sections (`storageSections()`); render-time
hiding never renumbers it** — checks.mjs 1af. `buildLesson()` in `app.js` is the
renderer; the single tab-panel suffix is `LESSON_TAB` (still the literal
`'station-b'`, so old deep links resolve). Sections are addressed by
`data-ns`, never by DOM position. Don't reintroduce "Station B/C" wording in
student-facing text — the mid-set reflection card is **Checkpoint / Punto de
control**, the end-of-set one is **Wrap-Up / Cierre**; checks.mjs 1n fails the
push on a relapse.

**A long set can be shown as TWO PARTS — also display only** (2026-09-19).
`partOne` on a set and `partBreak` on one of its sections split the ladder
into Part 1 / Part 2: a heading at the top, a heavier divider above the
breaking section, a per-part progress pill and "Step n of m", and two jump
links in the rail. **Only `m4w2` uses it** (13 steps + 7), and checks.mjs
**1ao** pins that count at 1. Nothing in the data moves — same set id, same
arrays, same `gi`, so no progress key moves; 1af proves that independently
and must stay green with NO change to its expected `data-ns` lists.
`lessonParts()` in `app.js` is the resolver, `lessonGroups()` the shared
section walk. A set is still complete when the SET is complete: the sets
gate, the checklist, Module Review, search and the Daily 5 never see a part,
and `resumeLessonCounts()` stays whole-set. One consequence worth knowing:
in focus mode the B→C seam now also hides once the open step is in Part 2 —
it heads the sections at the top of station C, which in m4w2 are all inside
Part 1, and it was otherwise stacking directly above the Part 2 divider
saying "Now practice it". Same "don't head a part you're not in" rule the
part marks follow. Field docs live in the schema comment at the top of
`module-2.js`.

**There is no student tour.** `tour.html` + `tour-img/` were deleted 2026-08-27
(they taught the retired B/C model and every screenshot was stale). Jonathan is
building a new one — don't resurrect the old file from git.

**The set has no in-panel tab bar.** The rail is the only switcher;
`switchTabById()` drives `.tab-panel` directly. A set is exactly two panels,
the lesson ladder and the checklist — the per-set Songs tab was removed
2026-08-27 (unreachable since the rail took over, and the Songs hub already
lists the same songs, Module 1's included).

**Target screen: a school Chromebook, 1366×657** (Jonathan, 2026-10-26: nobody
uses the site on a phone). Design, test and measure at that size. Phone width is
out of scope: don't audit, test or fix phone-only layout, and don't add phone
breakpoints, unless Jonathan asks. Leave the phone CSS that's already there
alone (don't spend time deleting it), and keep checks.mjs 1o — it costs nothing
and also guards narrow Chromebook windows.

**Live preview:** VS Code Live Server — right-click `index.html` → "Open with
Live Server". No commit needed.

**Dev bypass:** a button on the auth wall loads a mock user for UI testing.
Progress won't save to Firestore in that mode.

**Shell:** Jonathan works on Windows *and* macOS. Match command syntax to
whatever platform the current session reports — don't assume.

## Plain-English workflow

| Jonathan says | Claude does |
|---|---|
| "Let's test these changes locally" | Start Live Server |
| "Push to GitHub" | Run pre-push checks, fix what they flag, add/commit/push, confirm |
| "Save progress with a note: [msg]" | Same, committing with that message |

**There are two kinds of cloud session and only one of them can push.** Work
out which one you're in before planning a handoff: the old blanket "cloud
can't push" rule was written for Cowork and would send a web session into a
patch-pair handoff it doesn't need.

- **Claude Code on the web pushes normally.** It runs in its own ephemeral
  container with a writable clone and authenticated HTTPS to `origin`, so the
  ordinary "push to GitHub" workflow applies, `main` included. Three limits:
  there is no `gh` CLI (use the GitHub MCP tools instead); the sandbox proxy
  blocks the live site, so `checks.mjs --live` comes back HTTP 403 — the
  deploy has to be confirmed from a local machine; and **the credentials push
  commits but cannot delete refs**, so branch cleanup is a local job. A
  `git push origin --delete` fails with a bare `RPC failed; HTTP 403` from
  GitHub itself, and the GitHub MCP server has `create_branch` but no
  delete-branch tool — there is no way around it from a web session, so hand
  Jonathan the command (or the repo's Branches page) instead of retrying.
  (Pushing verified 2026-09-04, shipping the Journey tab-card restyle; the
  delete limit 2026-09-09, cleaning up six merged branches.)
- **Cowork sessions can't push** — GitHub access is read-only and git writes
  through the device-bridge folder fail on lock files. Never attempt them.
  Instead: run full `node tools/checks.mjs`, commit, `git format-patch`, and
  ship **every patch as a pair with its own `APPLY-<name>.md`** stating the
  base commit, apply order, and steps (`git status` → `git am` → `checks.mjs
  --check --skip-links` → `git push` → `checks.mjs --live`). Afterwards,
  hard-reset the cloud clone to origin — never re-merge.

  **Deliver the pair as ONE zip** (Jonathan, 2026-10-05: "package multiple
  files as zips in the future"). Any handoff of two or more files — a patch
  and its `APPLY-<name>.md`, several patches, any other set — goes out as a
  single `<name>.zip`, never as separate attachments. A single file is sent
  as it is. The one exception is the phone workflow, which stays one plain
  `CHANGES.md`.

  **Applying a patch: a conflict on `sw.js`'s `CACHE_VERSION` line is
  expected, not a problem.** That line is a fingerprint of every cached
  file, so every patch touches it, and it conflicts whenever `main` moved
  between cutting the patch and applying it (Windows line endings make it
  likelier). Keep either side of that one line, finish the `git am`, then
  run the FULL `node tools/checks.mjs` once (not `--check`) to recompute it
  and commit the one-line change before pushing. Don't stop to ask. Any
  conflict in another file is a real conflict — stop and report it.
  (2026-09-24: the Watchtower/Modules 4–6 pair landed this way, `69ac805`.)

(Full rationale: `WORKFLOW.md`.)

### ⚠️ Run the pre-push checks before EVERY code push

Before any push touching `index.html`, `styles.css`, `app.js`, `tuner.js`,
`teacher.js`, `config-main.js`, or a `module-N.js`:

```
node tools/checks.mjs
```

Exits non-zero if anything's wrong — don't push until it passes. It:

1. **Syntax-checks every shipped `.js`** (no build step, so a typo would ship).
2. **Validates module data** — every Set has the fields the app needs.
3. **Link-checks** ~240 external YouTube / Google-Docs URLs. Keep this on full
   pushes even when no links changed — it catches videos taken down since.
4. **Bumps `CACHE_VERSION`** in `sw.js` automatically. It's a content
   fingerprint of the cached shell *and* everything in `audio/`, so it can't be
   forgotten and re-exported audio gets cache-busted too. Since 2026-10-16 it
   also covers `sw.js`'s own code (version lines blanked), so a change to how
   the worker caches rebuilds every visitor's cache. Since 2026-10-25 it also
   covers every file listed in `sw.js`'s `ASSETS` (the font and the PNG icons
   included), and check 1bt fails the push if a precached file is ever left
   out of the fingerprint.

**Flags:** `--skip-links` (fast), `--check` (verify without changing files),
`--live` (fetch the live `sw.js` and confirm the deploy landed — run it a minute
after pushing; local sessions only, cloud can't reach the live site).

**Real-browser smoke test (2026-10-25).** `checks.mjs` reads source text; it
cannot click. `node tools/smoke.mjs --baseline origin/main` boots the site in
headless Chrome (dev bypass, no network needed), walks every module and set in
English and Spanish, opens Songs / Class activities / My progress / Games,
visits every game view and the tuner, and fails on any JavaScript error the
baseline did not have, or any inline handler that does not compile. It is for
renderer, escaping or many-file changes, not every commit. Needs Node 22+ and
Chrome (`--chrome <path>` if it can't find one). It caught what no check could:
15 lesson ▶ buttons that were dead for weeks.

**Stop hook (2026-10-25).** `.claude/settings.json` runs
`.claude/hooks/stop-checks.mjs` whenever Claude finishes a turn. If code files
are changed (`.js .mjs .css .html .json`, outside `.claude/` and `audio/`) and
the working-tree state differs from the last one it checked, it runs
`node tools/checks.mjs --check --skip-links` (about 10 s). A real failure
**blocks the stop** and sends the output back, so you fix it in the same turn.
**If it blocks, fix the cause — never loosen a check or add an allowlist entry.**
The expected "shell cache stale" / "audio cache stale" lines are ignored (only
the full `node tools/checks.mjs` before a push recomputes them). It gives up
after 3 tries per turn, never re-blocks the same file state, and fails open on
any internal error. Off switch: `GC_STOP_CHECKS=0` in the environment. It does
not replace the git hooks, the full checks run, or `tools/smoke.mjs`. On
Windows, Git Bash may not have `node` on PATH; the hook then silently doesn't
run (a non-blocking error) and the git hooks remain the gate.

A tracked pre-commit hook at `.githooks/pre-commit` runs the fast offline checks
on every commit. Per-machine setup, once: `git config core.hooksPath .githooks`
— **done on both machines**. Bypass with `--no-verify`.

A second tracked hook, `.githooks/pre-push`, runs the same fast offline checks
again at push time. Not redundant: **git doesn't run `pre-commit` on merge
commits at all**, so a merge can carry a stale `sw.js` past every per-commit
check — on 2026-08-20 one reached `main` that way. Pre-push is the last moment
anything is still local. Both hooks skip the network; the full
`node tools/checks.mjs` is still the real gate.

Both hooks resolve `node` themselves rather than trusting PATH: on Windows they
run under Git Bash, which doesn't inherit the PATH entry the Node installer
adds for cmd/PowerShell, so `pre-commit` fell through to its "skipping checks"
warning on every commit while looking installed (fixed 2026-08-20). If you ever
see that warning, the hook is a no-op — run `node tools/checks.mjs` by hand.
Keep the candidate-path list identical in both hooks.

### ⚠️ Parallel sessions: worktrees share one `origin`
Jonathan runs several sessions at once in `.claude/worktrees/*` (gitignored, so
they never leak into a commit). Worktrees isolate *files* — they still share one
repository and one `origin`, so isolation ends at the push. On 2026-08-20 a
worktree session merged `main` into its branch and pushed that merge straight
onto `origin/main`, which is how a feature-branch commit became `main`'s tip.
The lesson there is *don't push a merge you didn't intend* — not *don't push to
main*. A clean fast-forward (`git push origin HEAD:main`) is the normal way work
ships from a worktree; see the push rule under "How to work with Jonathan".
Before pushing, always `git fetch` and check
`git log --oneline HEAD..origin/main` — another session may have moved things
since the turn began.

### ⚠️ Three regimes decide what may change in a module
**2026-09-20.** A step's progress key is
`${setId}-${station}-sec${gi}-${i}`, so a step that changes INDEX takes a
student's tick with it and a section that moves takes every step after it.
What that permits depends on how far the class has got, and
`tools/rule-zero-proof.mjs` enforces exactly three regimes:

- **Modules 1–`FROZEN_THROUGH` (3 today — raised from 2 on 2026-10-01,
  Jonathan: "nobody is in Module 3 yet, but students are about to")** —
  students are in here. Step
  labels must match BY INDEX; a new step may only be **appended** to the
  tail of a section. No renames: a rename here would hide an insertion
  from the check. Keyed-MC choices are frozen too (checks.mjs 1ap) —
  but since 2026-10-19 a keyed MC may be ADDED to an existing step
  (nothing to orphan; it prints) and an existing one reworded through
  `response.renamedChoices`, which maps each old saved text to its new
  choice (the renderer applies it; the proof checks the map covers every
  old choice and keeps the keyed one keyed). Re-pin 1ap either way.
- **Modules `FROZEN_THROUGH`+1–`OPEN_THROUGH` (4–6 today)** — **nobody has
  reached Module 4.** A step may be
  **inserted anywhere inside** an existing section, and a step's
  `response` may be removed or changed. Old labels must still appear in
  the same relative order; every added step prints. **Raise
  `FROZEN_THROUGH` as the class advances** — it is the same number
  checks.mjs pins as `FROZEN_MC_THROUGH_MODULE`. **Raise both a module
  AHEAD of the class, when students are about to reach it, not after**:
  the first student through the gate is the moment a structural edit
  starts costing someone their ticks, and nobody tells Claude when that
  happens.
- **Above that** — step count and order are fixed; a rename prints.

In every regime the SECTIONS are fixed: same count, same order, same
kind. A section TITLE may be reworded (it moves no key) and the rename
prints rather than failing — **in frozen modules too since 2026-10-16**
(Jonathan), except a section with a `kind` or the tuning warm-up title,
which code reads and which still fail. Run it as
`node tools/rule-zero-proof.mjs <base-ref>` and paste the output into the
report before any content push.

A fix that these regimes block goes on the **Summer reset list** (the `summer-reset` skill) —
never worked around, never shipped as a rename that "prints rather than
failing."

**"Nobody has reached Module N" was not strictly true before 2026-10-01.**
A locked set opens as a read-only preview (`set-peek`), and until that day
the preview refused skill ticks and Done buttons but still SAVED ANSWERS:
`onResponseChange`, `onStepMcSelect` and `onPracticeMcSelect` had no peek
guard, so a student locked out of Module 3 could tap a keyed quiz choice
there and it was written to their progress under a Module 3 key. It
unlocked nothing (`hasProgressIn()` reads skills and completed steps, both
guarded) but it means a few `responses` keys may already exist in the
module above the class. `isPeekedResponseKey()` closes it and checks.mjs
**1bl** pins the guard on every writer. Practical consequence: treat the
module the class is ABOUT to enter as frozen — which is why the numbers
above were raised a day early.

### ⚠️ Modules 4 and 5 were swapped (2026-10-12)
Jonathan moved Open Chords ahead of Pentatonic Scales. **Open Chords is
Module 4** (`module-4.js`, `m4w1`–`m4w4`, `mr4-*`); **Pentatonic is Module
5** (`module-5.js`, `m5w1`–`m5w3`, `mr5-*`). Set, skill and Module Review ids
moved with their content, and every Journey page swapped Layers 4 and 5 to
match (Layer 4 Open Chords, Layer 5 Pentatonic Solo). The two-part set is
`m4w2`; the 1ao and 1az pins, the Songs hub's module groups and the Core
rows' backing-track choice follow the content. **Saved progress IS moved**
— the swap shipped believing nobody was past Module 3, but a live scan the
same day found 7 docs with Module 4/5 work or Layer 4/5 "I'm ready" ticks.
Each student's own browser moves its doc once (the console cannot write
`progress/{uid}`): `swap45*` in `app.js`, read the comment above
`swap45MapId`. **The rule: a doc without `migrations.swap45` holds only
OLD-numbered data, a doc with it only NEW-numbered data** — so `flushSave()`
awaits `swap45Commit()` before every write, `tabs/journey.js` writes
`songReady` in the doc's own numbering, and `teacher.js` remaps unmarked
docs for display only. Don't remove one half without the others (Summer
reset list). **One gap no client can close:** a tab or device that loaded
the doc before it was moved (an older build, or one that missed the move)
and saves AFTER the move merges its old-numbered maps into the now-marked
doc, silently swapping the overlapping keys back. Repair is by hand: re-scan
the 3 docs the 2026-10-12 scan found with real Module 4/5 work a day and a
week after the deploy, and fix any old-numbered key that has reappeared in
the Firebase console — a key the scan saw under its old id coming back, or
any `m5w4-*` (Module 5 has three sets) or `chords-m5`. **`moduleOpenThrough`
in `config/class` is per module NUMBER and the move does not touch it:** a
student set to 4 before the swap had Pentatonic opened and now has Open
Chords opened — set them to 5 if Pentatonic should be open. Notes dated
before the swap may still use the old numbers. **Course
order lives in the module NUMBER** — reordering again means a renumber like
this one. Its script (`swapA.mjs`) lived in a session scratchpad and is not
in the repo. **Run `node tools/rule-zero-proof.mjs` against `d0cd004`**
(commit A, the mechanical swap) to prove the hand edits after it; against
the pre-swap commit `1a1f6cc` it fails by design ("the SET list changed"),
because every m4/m5 id now holds the other module's content. The swap
itself was proved structurally equivalent with the 4↔5 id map by a
throwaway script (`skeleton-equiv.mjs`, scratchpad, not in the repo).

### ⚠️ Sweep findings ratchet into checks.mjs
Any sweep or audit that finds **3+ instances of a mechanically-detectable error
class** must add a permanent detector for that class to `checks.mjs` in the same
session. Never leave a detector script in a session scratchpad — the 2026-07-31
MC-tell audit died that way and the class recurred in the next sweep. The
existing detectors (1h onward) are each documented by a comment in
`tools/checks.mjs` — read it there rather than keeping a list here.

When several agents add checks at once, **hand each one its label before it
starts** (`grep -o "head('1b[a-z0-9]*\." tools/checks.mjs | sort | tail -3`);
three agents once all took `1br`. And a check that merely finds a call in the
source proves nothing about behaviour — make it render or execute the thing
(1bf renders both card builders, 1bs compiles every inline handler).

**A phrase detector must match the UNESCAPED string.** Until 2026-09-25 1w
and 1w-t matched the raw source capture, which keeps `\'`, so every banned
phrase with an apostrophe ("don't worry", "that's the point", "that one's
free") was invisible in a single-quoted field — a live "Don't worry about
pressing any frets yet" sat in Module 1 with both green. Run captures
through `unescapeJs()` before matching.

Not every class can be guarded by a banned-phrase list. 1w2 pins the Journey
lick labels *positively* — every `Lick N — ...` card must use one of four
approved descriptors, in both languages, with the total pinned at 12 —
because the words it retired ("the reach", "the climb", "the fall") are all
legitimate elsewhere on the same pages. Reach for a whitelist over a
blacklist whenever the banned word has an innocent twin.

**A ratchet that can't fail is not a ratchet.** Every detector added or changed
gets proved by *breaking the guarded thing* in a scratch copy and watching the
check go red, then restoring. The 2026-09-07 review found five that were green
because they could not see what they guarded — a selector written twice, an
`@media` prefix, an inline `<script>`, an exact-match opening tag, a count that
was printed but never pinned. Where a total is meaningful, **pin it** (63
Journey tab cards, 27 tuning warm-ups) so it cannot drop silently.

### ⚠️ Activity order and module placement live on the console board
**Not in `class-activities.js`:** order, module headings and the `#N` prefix live in
`config/class.activityBoard`, written only by the console's Class activities board.
`caBoardOrder()` (app.js) is the one resolver and every move goes through
`teacherMoveActivity()`. Live for students = assigned + dated-and-arrived + not
Hidden + not archived/deleted (`caIsVisible`). **Never write `progress/{uid}` from any
of it.** `number` in `class-activities.js` is legacy; a digit in a title is a SERIES
number (checks 1d, 1l). Full rules: skill `in-class-activities`.

### ⚠️ Every write to `config/class` goes through `teacherWriteConfig()`
Strict by default (omit `base`); pass `base` only for a single-cell toggle
(cell-checked). A bare `.set()` on the doc fails check 1ai, which pins the writer
count (`CONFIG_WRITERS`) — add a writer and bump it on purpose. The full rule, why
there are two modes, and the read-side rules: `.claude/rules/teacher-console.md`
(loads with `teacher.js`).

### ⚠️ Editing a module's skills? Update `MODULE_MANIFEST` in `config-main.js`
Add or remove a `skills:` entry and you must bump that module's `skillCount`.
`checks.mjs` fails the push if they drift — fix `config-main.js` when flagged.

### Changelog
Notable **student-facing** changes get a dated entry at the top of
`CHANGELOG.md`, same push, no need to ask — plain English, student's point of
view. Match the existing style. Skip it for internal `*.md` edits, pure
refactors, and planning work.

## i18n — hand-written Spanish everywhere

Google Translate is gone. The Español button is `setLang()`; four layers hang off
it: the app shell (`i18n.js` `I18N` keys via `t()` / `data-i18n`), module content
(`_es` twins read through `tf()`), the games arcade + Listening Coach (rendered
through `t()` at render time), and the Song Journey pages (`data-es` attributes
swapped by `journey.js`).

- **Every new student-facing shell string goes into `i18n.js` in BOTH `en` and
  `es`, in the same edit.** Never ship English-only "to translate later" —
  Jonathan doesn't speak Spanish, so nothing catches it afterward.
- **Reuse the glossary** at the top of `i18n.js` rather than inventing a fresh
  Spanish word each time.
- **String names are solfège; chord symbols and key names are not.**
  `cuerda Mi grave`, `cuerda La`, `cuerda Sol` — but `tonalidad de G`, `G/B`,
  `Am`. Most-repeated ES convention on the site, nothing enforces it. A 2026-07-31
  sweep found and fixed the last 2 remaining `module-9.js` violations (a much
  older ~30-instance count had already been mostly cleaned up before then) —
  still worth a check whenever you touch module Spanish, since nothing enforces
  it.
- **How to wire a string** — mechanics are documented at the top of `i18n.js`;
  read that before adding one. Short version: static HTML gets
  `data-i18n="key"` (or `-attr` / `-html`); dynamic strings call
  `t('key', {param})` and carry `data-i18n-params`, because most shell HTML is
  built once and would otherwise stay stuck in its first language.
- **Authoritative Spanish is the code** — `i18n.js`, the `_es` twins, and the
  `data-es` attributes on the six `tabs/*.html` pages. No review sheet is
  maintained; don't recreate one.
- **Review policy:** routine proofread sweeps are **retired**. The 2026-07-23
  full-site sweep found essentially no meaning errors across ~4,300 strings.
  Write new Spanish carefully against the glossary and ship it. Sweep only when
  Jonathan asks or a specific string is flagged.
- `i18n.js` must load **before** `app.js`, `fab-tools.js`, `tuner.js`, and
  (synchronously, on Journey pages) `journey.js`.

Standing glossary, loanword policy and settled ES terms: `claude/spanish-terminology.md`
in the Claude project.

## Content rules

**Student-facing text uses the simplest direct wording that is still
accurate** — short sentences, plain verbs, one idea per sentence, no idioms
or figures of speech, and every music term defined the first time it
appears. checks.mjs 1w catches a relapse of specific retired phrases; it
can't catch a new idiom on its own, so this rule is the standing instruction
new content has to be written against. Not every figurative-sounding phrase
is a violation — an established, deliberately-defined site term (Module
5/7/11's "two homes" for a chord's two fretboard positions; the metronome
ladder's "top of the ladder") is a real teaching device, not confusing
prose; don't flag or "fix" those. Define "root" once, in the first visible
Module 2 step that uses it: the note a chord is named after.

**No teacher speak.** No lesson-plan words (self-assessment, reflect,
benchmark, objective, demonstrate/apply/identify), no poster lines ("slow and
clean is better than…", "don't worry", "trust the…"), no reassurance or
praise padding in feedback, and no sentence about why a step matters. Say the
action and the standard. The word "assessment" names the test and appears as
"(assessment preparation)" in Challenge titles. checks.mjs 1w-t guards the
retired phrases (2026-09-23 jargon-cut work order, 433 findings across the
site).

**A typed answer is for when writing IS the task.** Goal-setting,
composing, and describing what you heard in a listening step keep their
box; everything else asks the student to play something and tells them
exactly when they have got it — a countable line ("two laps up and back
with every note ringing clean"), not a feeling ("feels intentional").
Modules 3–6 went from 82 typed answers to 8 on 2026-09-20; checks.mjs
**1ar** pins the per-module budget and only fails UPWARD, so removing one
more is always fine and adding one back is a decision you make in the
same edit. Note that **41 of those 82 were already unreachable** — sitting
in reflection / routine / ear-spark sections and in take-to-song sections
that render a Journey card — so a raw count of `response:{type:'short'}`
overstates the typing by about double. Count what `visibleSteps()` would
render.

**Multi-step directions get lists, not paragraphs.** `<ol>` for sequential steps,
`<ul>` for parallel points, short lead-in before the list. Applies to step
`text:` and practice `prompt`s. Mirror the structure in the `_es` twin. Roughly:
a card over ~200 characters with more than one thing the student *does* is a
list. Leave alone: single actions, hints, `gotItWhen` strings, placeholders.

**A trailing "You've got it when: …" stays plain text AFTER `</ol>`** — never a
final `<li>`. The renderer wraps it in `<span class="got-it">`; **do not put the
span in module data.** Same for other trailing matter: "No score —" notes,
partner bonuses, Journey links, and `<span class="step-figure">` images (always
dead last).

**Challenge cards** (any step that opened `Challenge N — Title:`): the full title
lives in `label`, verbatim, escaped plain text, under ~70 chars; the `text` opens
straight into directions; **the body is always a list** — the one place the
"single actions stay prose" carve-out does not apply. A defining parenthetical
(*a fill is…*) moves into the text; an identifying one (*(assessment
preparation)*, 2026-09-23 — was *(your assessment piece)*) stays in the title.
**A card that already had a list keeps it byte-for-byte.**

**Presentation belongs at render time, not in content.** MC answer order and
got-it-when styling are both render-time, so new cards inherit them and neither
can regress. Reach for the renderer first whenever a change is about how
something looks or is ordered rather than what it says.

**Strings are named, never numbered, in student-facing text** (Jonathan,
2026-08-06): low E · A · D · G · B · high e; ES uses solfège (cuerda Mi grave …
cuerda mi aguda). Chord-chart shorthand like `xx4432` is notation and stays.
The only surviving digits are Module 7's two root-naming MCs, each anchored
"string 6 (the low E)". Enforced by checks.mjs (1j) — new numbered-string prose
fails the push.

**Paper drills get a digital deck.** Nothing student-facing should ask for
scissors, index cards or a pen. Three `step.drill` types share one dispatcher:
`shuffle` (frets on one string, timed), `deck` (any card pile, optional back),
`ear` (hidden note sequence, played aloud) — plus `notecall` (2026-09-27, ca-23),
which isn't a paper drill: a note name on the beat, played on the guitar. It opens
in "Show answer" (a play-along: the fret lights up 2 beats after the name, speeds up
every 8 notes, Slower backs it off and Faster steps it up, nothing scored); turned off, it runs five scored
levels answered by the mic (the "Play it on the guitar" button, off by default) or by tapping the fret
(`drill: { type:'notecall',
strings:['lowE','A'], minFret:5, maxFret:8 }`; engine `renderNoteCall` in
`app.js`, progress in `games.nc`, and `gamesStopMic()` stops it). Wiring one is content, not code:
`drill: { type:'deck', deck:'numerals-C', skill:'m11w1-s3' }`. Decks live in
`DECKS` in `app.js`; ear pools in `EAR_POOLS`. Drop the "Got someone around?"
partner line from any card that gets a deck; no paper-fallback line.

### ⚠️ There are TWO step renderers — patch both, or the teacher can't see it
A class-activity step is rendered by `caStepHtml()` (app.js, students) and
`renderTeacherActivityDetail()` (teacher.js, the console preview) — different code
paths. **Adding or changing a step field means editing both, in the same edit**
(check 1v enforces only the figure's `width`/`height`). Practice cards and exit
checks are whole card bodies with ONE renderer each (`caCardBodyHtml`, pinned by
1bf). Details and the legitimate differences: skill `in-class-activities`.

### ⚠️ Quiz answers and keyed MCs
A **keyed MC** is an on-site multiple-choice with an answer key — a
`response:{type:'mc'}` on a lesson step. Nothing on the site is graded; the
graded quizzes are the Canvas ones. (Called "graded MC" before 2026-10-26;
older notes and code comments may still say that.)
**Quiz answers are shuffled at render time** by `mcOrder(choices, seed)` —
deterministic, catch-alls pinned via `MC_PINNED`, fewer than 3 choices left
alone. The two MC paths store differently: the keyed step persists the choice
**text**, the practice panel persists the **index**. Don't "simplify" that
away. Write `answer: 0` freely — students never see it that way.

- **The seed is the prompt PLUS the joined choices** (`mcSeed`), so order is
  stable across re-renders, languages and students, but **rewording any choice
  re-rolls the display order**. Never name an option by its position in an
  `explain` ("the last option") — name it by content. m11w2-s3 was right only
  by luck after a 2026-09-05 reword.
- **Rewording a KEYED MC's choices after students reach it orphans their
  stored picks** — the keyed path persists the choice text, so an old string
  renders as "answered, nothing selected". Reword before they get there, or
  map old→new in the renderer. The 2026-09-05 m8w1 reword was safe only
  because the live roster's furthest student was in Module 1.

**That rule is now a ratchet — `FROZEN_MC_THROUGH_MODULE` in checks.mjs**
(2026-09-19). Every keyed MC in Modules 1..N is pinned by a fingerprint of
its `choices` + `choices_es` + `answer`, and **1ap** fails the push when one
of them changes by a single character — including a keyed MC that goes
missing. N is *the furthest module a student has reached or is about to*; it
is **3** today (Jonathan, 2026-10-01; 2 from 2026-09-19). **Raise it as the class advances** — ask which module
they're in, bump the constant, re-run and paste the printed fingerprints back
in, same commit. Lowering it is almost never right: a module the class has
passed keeps its stored answers forever. The practice-panel MC on a skill is
deliberately NOT pinned — it stores the index, so its wording is free and its
ORDER is the thing to hold.

Modules 3–6's giveaway quiz items were **reworded on 2026-09-19** precisely
because nobody had reached them: `m3w1` "One shape, three chords", `m3w2`
"Watch: using a metronome", `m4w1` "Listen: major vs. minor moods", `m5w1`
"Challenge — Mystery Chart", `m6w3` "Watch: any-pattern exercise", plus three
practice MCs (`w1-s1`, `m5w4-s2`, `m5w4-s4`) whose order and keyed index were
held. (Those are the ids of that date: since the 2026-10-12 swap the moods
card is in `m5w1`, the Mystery Chart in `m4w1`, and the two practice MCs are
`m4w4-s2` / `m4w4-s4`.) Two of those videos turned out not to teach what the
card asked — the JustinGuitar metronome video never says "10 BPM slower
than you think you need" (it teaches one down strum per click at 80 BPM), and the any-pattern
video never mentions reggae in its 0:00–4:00 range — so those two questions
were rewritten to match what the student actually watches. **Check the watch
range before writing a question about a video**, not just the title.

**Three MC-giveaway ratchets — 1at, 1au, 1av** (2026-09-20). A sweep of
Modules 7–13 found **47 of 141 questions** a student could answer without
knowing the material, so the classes are now detectors rather than a rule
nobody can enforce:

- **1at — the keyed choice is the only one shouting a word.** "On the BACK of
  the neck" among three quiet choices is a free answer: scan for the capitals.
  No allowlist, because there is no innocent twin — chord symbols, note names
  and Roman numerals are excluded by name, and what is left is emphasis, which
  belongs at render time. Fix by dropping the caps, or, where the emphasis
  teaches a real contrast, by **mirroring it into the distractor it contrasts
  with** (m10w2's relative/parallel pair now does exactly that).
- **1au — a never-correct catch-all in a distractor** ("It doesn't matter",
  "Either works equally well", "Any string you like", "You can't"). This one
  DOES have an allowlist, because several are genuine beginner beliefs:
  m5w1-s6's "Never repeating anything" is the plausible opposite of its keyed
  answer, and m11w2-s6's "Can't tell from chords alone" is what a cautious
  student really writes. The keyed choice is never scanned — two correct
  answers in the course contain an absolute.
- **1av — the keyed answer is already printed on the card.** The biggest class
  and the one every reviewer under-counts, because the leak is usually in the
  step's `hint` or in the skill's own always-visible `.sk-label`, not in the
  question. Matching is on 3-word content n-grams, and the discriminator is
  that **no distractor shares the phrase** — a phrase the distractors also use
  is vocabulary, not a tell. An allowlist entry excuses the **card**, not the
  phrase, because a leaking answer usually overlaps its card in several places
  and a per-phrase exception would just surface the next one. Since
  2026-10-12 a 1–2-word keyed answer is matched whole (it has no 3-word
  n-gram), excused when the card also names one of the alternatives
  ("Tell major from minor"), and Roman numerals keep their case. Its known
  blind spot: a card that prints a whole lookup table ("Am fret 5 … Dm
  fret 10") names the alternatives too — read those by eye.

Every allowlist entry is in Modules 1–6, which that sweep did not cover. They
are carried deliberately, not tuned away; when a module gets swept, delete its
entries first and let the check say what is left.

**1w was blind to the fields this all lives in.** Its `FIELD_RE` listed
`text|hint|stuck|levelUp|gotItWhen|explain|…` and never `prompt`, and
`choices` is an array a `field: '...'` regex cannot see into at all — so a
banned phrase in an answer choice shipped while the identical phrase in its
`explain` failed the push. Widened 2026-09-20 (it caught a real one in
`module-9.js` the same day). Since 2026-10-12 1w and 1w-t read through one
bracket-walking reader (`readFieldStrings` in checks.mjs) that sees every
quote style, template literals, and every element of a multi-line array
(`choices`, `assessItems`, exit-check `items`) — the single-line regexes
had missed ~50 multi-line `choices` arrays. **A new authoring field needs
adding to `STUDENT_VALUE_NAME_RE`; an array field needs nothing more.** 1w-t
also reads Spanish now (`TEACHER_PHRASES_ES`: "es normal", "no te
preocupes", "está bien si", a sentence-final "tú puedes").

The three Module 1 Set 2 keyed-MC rewords, Module 3 Set 2's Challenge
numbers, and `ca-14`'s Happy Birthday exit check are all frozen mid-year fixes —
see the **Summer reset list** (the `summer-reset` skill).

## Play-along first; Song Journey pages are the back door (2026-10-06)
**One rule for every link to a song: if students can open a play-along (whole-song)
card for it, the link opens that card; if not, it opens the Song Journey page**
(`songsPlayAlongCard()` decides — no list to maintain — and it decides at the click:
don't fold "Play Along now" into `caIsVisible()`). "Take It to a Song" is **switched
off, not deleted** (`TAKE_TO_SONG_ENABLED = false`): never delete those
`kind:'take-to-song'` sections, they hold `gi`. Journey pages: no per-song retire
list or "moved" card (check 1bn), no Stuck?/Level up folds, and don't sync a page's
text to a card. The door table, layer matching and the rest: skill
`in-class-activities` and `.claude/rules/journey-pages.md` (loads with `tabs/**`).

### ⚠️ Editing `firestore.rules` changes nothing until it's pasted into Firebase
GitHub Pages doesn't deploy Firestore rules. After any push that touches
`firestore.rules`, open Firebase console → Firestore Database → Rules, paste
the file, Publish. Until that happens the live quiz's answer writes are
rejected and the game looks broken with no error students can see.

### ⚠️ The Daily 5 is retired — switched off, not deleted
**2026-09-19** (Jonathan): tuning and the finger warm-up happen together as a
class, so the site should not ask for them a second time. The "Tune and warm
up first" banner at the top of every ladder was the **only** entry point to
the Daily 5 overlay, so turning the banner off retires the Daily 5 with it —
and it was 97px of a 657px Chromebook screen spent on work the room had
already done.

`const DAILY5_ENABLED = false;` in `app.js`, beside `buildDaily5()`, is the
whole switch; `ladderHtml()` is its one reader. **Nothing was deleted** —
`buildDaily5()`, `openDaily5Here()`, `moduleStepsFlat()`, the `.daily5-*`
CSS (including the `.dp.focus.pd-showing .daily5-inline` rule) and every
`daily5.*` i18n key are all still there, so flipping the constant back to
`true` brings the banner back as it was. Two things that are NOT part of
this: `WARMUP_BANK` in `config-main.js` (kept, though nothing on screen
reads it while the Daily 5 is off — its other reader, the Module Review's
10-Minute Routine `buildModuleRoutine()`, has had no caller since `52ae05f`)
and `kind:'tuning-warmup'` sections, which stay hidden
exactly as before — `storageSections()` depends on that and every `gi` in
Firestore was written under it.

One student-facing mention pointed at nothing afterwards and was reworded in
the same push: `module-13.js`'s final check, "one lap of the Daily 5" / "una
vuelta del Daily 5" → "a few bars of anything you know". A grep of every
module file and `class-activities.js` found no others.

## Videos

- **Never invent YouTube IDs from memory** — even for famous songs or channels.
  Find via `WebSearch`, then verify via oEmbed
  (`https://www.youtube.com/oembed?url=…&format=json` → JSON for valid, 404 for
  dead). Batch verifications in parallel. If you can't verify one, drop the link
  rather than inventing it. (In May 2026 ~60 recalled URLs were 404s.)
- **Watch-half video pairs** (`stations.b`): aim for video #2 from a *different*
  instructor than #1, same skill. Same-channel pairs are fine when the
  alternative is worse.
- **Prefer diverse creators.** Before settling on Marty Music / JustinGuitar /
  Andy Guitar, spend one extra search on a comparable lesson from a woman, a
  creator of colour, or a Spanish-language channel. Already verified on the
  site: Lauren Bateman, Nikhil D'Souza, guitarraviva, David Casas. Lesson
  quality still wins.

## Lazy-loaded guidance — read before touching these areas
These sections moved out of this file (2026-10-08, /doctor) so they load only
when needed. **Read the matching file before working in its area** — each
holds ⚠️ rules as binding as anything here.

| Area | File | Critical rule kept here |
|---|---|---|
| Backing tracks, snippets, practice-card audio, Journey clicks, `playNote`, `audio/` | skill `audio-and-snippets` | Snippet windows are bars, never seconds; never measure a second anchor; never pitch-correct one mix alone; new "silence it" call → `stopCardAudio()`; **every backing track is levelled to "the cure" (−12.5 LUFS) with `python3 tools/loudness.py <slug>`, one gain per song — never re-level the cure** |
| In-Class Activities, the gate, exit checks, practice cards, Songs Core rows, render-time hiding, **the two step renderers, the activity board and numbering, the play-along-first song links** | skill `in-class-activities` | Exit-check `items` are positional — frozen once taken; don't fold "Play Along now" into `caIsVisible()`; take-to-song is switched off in every module (`TAKE_TO_SONG_ENABLED`) — don't delete the sections, they hold `gi` |
| Core/Choice song chords, keys, timing, bar numbers | skill `song-facts` | Don't re-flag settled facts; don't verify BPM in audits |
| Fixes blocked by frozen modules | skill `summer-reset` | Add any blocked fix there the same day; raising FROZEN_* never unlocks anything |
| Live quiz | `.claude/rules/live-quiz.md` (loads with `live-quiz.js`) | Nothing on the stage may reveal the answer before the reveal |
| Set band, left rail, nav grid | `.claude/rules/rail-layout.md` (loads with `styles.css`/`index.html`) | The nav two-column grid is permanent — don't re-simplify; measure, don't do arithmetic |
| Journey tab cards, and the Journey-page decisions (whole-song tabs, no Stuck?/Level up folds, no per-song retire list) | `.claude/rules/journey-pages.md` (loads with `tabs/**`) | Restyle `.tab` in both stylesheets or neither |
| Writing any JS (`app.js`, `teacher.js`, `coach.js`, `live-quiz.js`, `fab-tools.js`, `tuner.js`, `tabs/journey.js`) | `.claude/rules/code-hygiene.md` (loads with those files) | Inline handler args use `jsonAttrArg(x)`, never `'${escAttr(x)}'`; never a mid-line `//`; grep sibling copies and old-behaviour comments before and after a fix; stop everything you start; escape student-written values |
| Teacher console shared config, **including the `config/class` write rule** (strict vs cell-checked) | `.claude/rules/teacher-console.md` (loads with `teacher.js`) | A superseded read returns the newest read, never `null`; a diverged write never marks the copy current; visibility via `teacherBoardView(cfg).assigned` |
| Whole-site audits, many-file refactors, 50+ string wording passes with sub-agents | skill `site-sweep` (playbook + auditor/fixer/reviewer briefs) | Pre-create the worktrees; cherry-pick to one linear branch; an adversarial review of the *fixes* is required; fetch before pushing |

## How to work with Jonathan

**Use AskUserQuestion, not free-text questions** — he'd rather click than type.
2–4 mutually exclusive options, one question per turn unless truly independent.

**Don't ask "should I proceed?" — just proceed.** Do the work and report back.
Never pause for "want me to do this?", "ready for the next step?", "shall I
implement it?".

- **Just do it:** the obvious next step, multi-step work, refactors, fixes,
  edits, local tests, anything reversible. **All code and HTML edits** — git
  tracks everything. Treat "can you…", "how do I…", "should this be…" about code
  as *do it*, not *ask first*.
- **Still pause for:** a genuine fork where the choice changes the outcome (use
  AskUserQuestion), or irreversible / outward-facing actions — deleting files,
  touching the live site.
- **Pushing to `main` is NOT one of those** (Jonathan, 2026-08-28). When the
  checks pass and a fast-forward onto `main` is what you'd recommend anyway,
  just push it — don't ask first, and never offer "push the branch instead" as
  a coin flip. Push, say what landed, then confirm with `checks.mjs --live`.
  Still ask when main is *not* what you'd recommend: a merge rather than a
  fast-forward, another session's commits in the way, checks failing, or work
  you don't think is ready for students.
- When in doubt: pick the sensible default, proceed, say what you did and why.

**Sub-agent sweeps need an adversarial audit budgeted in — and it audits the
FIXES, not just the findings.** On any content sweep over ~50 items, run a
second agent told to *find problems, not confirm the work* — the structural pass
and the audit catch disjoint failure classes. Lead every sweep prompt with the
calibration line ("convert EVERY card; do NOT skip one because the actions flow
naturally — re-stitch it"), or agents go timid. Sonnet for mechanical work, the
big model for design and verification. Every review round of the 2026-10-25
sweep found real regressions that the fixers' own proofs missed. Playbook and
the auditor / fixer / reviewer brief templates: skill `site-sweep`.

**Triggers, so this doesn't depend on how hard you are thinking** (they hold at
any effort level): run an adversarial reviewer, on a pinned commit, whenever a
change touches 3+ files, a danger-zone file (`teacher.js` config plumbing,
`sw.js`, `coach.js` detection, the `app.js` save path, `firestore.rules`),
or 50+ strings. **Mechanical files don't count toward the 3**
(Jonathan, 2026-10-26): `CHANGELOG.md`, the `sw.js` version lines that
`checks.mjs` rewrites (that rewrite doesn't make `sw.js` a danger-zone edit —
a change to its code does), and the Spanish twin (`_es` field or `i18n.js`
key) of a string changed in the same edit.

**A pin-only `checks.mjs` edit is mechanical too** (Jonathan, 2026-10-27,
after a play-along edit sat behind a 30-minute deep review). An edit that
only updates pinned values a content change forces — a count, a fingerprint,
an expected list, a `FROZEN_*` number — doesn't make the change danger-zone
and doesn't count toward the 3. The checks themselves are the gate for it.
Changing how a check WORKS (its logic, matching, or reading) is different:
it needs the break-it proof (break the guarded thing in a scratch copy,
watch the check go red, restore) with the output pasted into the report,
and a brand-new detector also gets `site-reviewer` (high). Neither makes
`checks.mjs` a deep-review file on its own. **Which reviewer** (2026-10-26):
`site-reviewer-deep` (extra high) for a danger-zone file or a 50+-string
sweep, `site-reviewer` (high) for everything else. For a danger-zone file
write the failing scenario before the fix. When a rule says "run the tool", run it — don't
substitute your own reading of the code. When an agent hands you a claim, read
the quoted lines yourself before acting; when it hands you a fix, make it
re-derive it on the real code.

**"Quick change" (Jonathan, 2026-10-26).** When Jonathan's request says "quick
change" or "quick fix", skip the adversarial reviewer and `tools/smoke.mjs`,
even past the 3-file / 50-string triggers. Everything else in "Start here"
still runs: `checks.mjs --check` while working and the full `checks.mjs` before
the push, `rule-zero-proof.mjs` if a `module-N.js` changed, the Spanish twin,
the `CHANGELOG.md` entry, and `checks.mjs --live` after the push. **It never
covers a danger-zone file** (`teacher.js` config plumbing, `sw.js`,
`coach.js` detection, the `app.js` save path, `firestore.rules`) or a change
to how a check in `checks.mjs` works (a pin-only update is fine),
and it never covers moving, adding or removing a section or step. If a quick
change turns out to need one of those, stop, tell Jonathan in one line why it
needs the full review, and wait for his answer. Start the report with "Quick
change — reviewer skipped."

**Effort per task (2026-10-25).** Effort is how much reasoning Claude spends;
higher finds more edge cases and verifies more, at more tokens. The session level
is manual (`/effort low|medium|high|xhigh|max`, `/effort auto` to clear it, or
`claude --effort <level>`); nothing picks it per task by itself, so these pins do:
- **Agents.** The project agents in `.claude/agents/` pin their own level:
  `site-auditor`, `site-fixer` and `site-reviewer` high, `site-reviewer-deep`
  extra high (always use one of the two reviewers for adversarial reviews —
  which one is set under "Triggers"). If you spawn a general-purpose agent
  instead, **pass `effort: "xhigh"` for a review the Triggers send to
  `site-reviewer-deep`, and `"high"` for any other review, an auditor or a
  fixer** — this paragraph is the explicit instruction the Agent
  tool asks for. Never pass `max`.
- **Skills.** `site-sweep` pins `effort: xhigh` while it is active.
- **Your own session, as a guide:** `medium` for routine edits (changelog, a
  small wording or content fix, renames); `high` for any bug fix, shipped JS, or
  module content with keyed MCs; `xhigh` for the danger-zone files listed
  above, sweeps, and anything the Stop hook keeps blocking on. If a task turns
  out to be in a higher tier than the session, say so and ask Jonathan to
  `/effort` up (or run it through `site-reviewer-deep`) rather than pressing on.

**Report the real numbers instead of accepting the premise**, and name the prior
decision a request would reverse — both have produced better calls than fixing
the literal complaint would have.

## Switching topics — prompt to start a fresh chat
When Jonathan raises a clearly new, unrelated topic, use AskUserQuestion to ask
whether he'd like a fresh conversation first: *"Looks like we're switching topics
— want to start a fresh chat for this, or keep going here?"* Once per switch, not
every message. Don't ask for natural follow-ups on the same topic.
