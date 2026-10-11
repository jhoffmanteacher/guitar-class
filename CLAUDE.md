# Guitar Class Website — Claude Instructions

Operative rules only. History, worked examples, and the reasoning behind each
rule live in `WORKFLOW.md` — read it when you need the *why*, not every session.

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
links in the rail. **Only `m5w2` uses it** (13 steps + 7), and checks.mjs
**1ao** pins that count at 1. Nothing in the data moves — same set id, same
arrays, same `gi`, so no progress key moves; 1af proves that independently
and must stay green with NO change to its expected `data-ns` lists.
`lessonParts()` in `app.js` is the resolver, `lessonGroups()` the shared
section walk. A set is still complete when the SET is complete: the sets
gate, the checklist, Module Review, search and the Daily 5 never see a part,
and `resumeLessonCounts()` stays whole-set. One consequence worth knowing:
in focus mode the B→C seam now also hides once the open step is in Part 2 —
it heads the sections at the top of station C, which in m5w2 are all inside
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
   forgotten and re-exported audio gets cache-busted too.

**Flags:** `--skip-links` (fast), `--check` (verify without changing files),
`--live` (fetch the live `sw.js` and confirm the deploy landed — run it a minute
after pushing; local sessions only, cloud can't reach the live site).

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
  from the check. Graded-MC choices are frozen too (checks.mjs 1ap).
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
prints rather than failing. Run it as
`node tools/rule-zero-proof.mjs <base-ref>` and paste the output into the
report before any content push.

A fix that these regimes block goes on the **Summer reset list** (the `summer-reset` skill) —
never worked around, never shipped as a rename that "prints rather than
failing."

**"Nobody has reached Module N" was not strictly true before 2026-10-01.**
A locked set opens as a read-only preview (`set-peek`), and until that day
the preview refused skill ticks and Done buttons but still SAVED ANSWERS:
`onResponseChange`, `onStepMcSelect` and `onPracticeMcSelect` had no peek
guard, so a student locked out of Module 3 could tap a graded quiz choice
there and it was written to their progress under a Module 3 key. It
unlocked nothing (`hasProgressIn()` reads skills and completed steps, both
guarded) but it means a few `responses` keys may already exist in the
module above the class. `isPeekedResponseKey()` closes it and checks.mjs
**1bl** pins the guard on every writer. Practical consequence: treat the
module the class is ABOUT to enter as frozen — which is why the numbers
above were raised a day early.

### ⚠️ Sweep findings ratchet into checks.mjs
Any sweep or audit that finds **3+ instances of a mechanically-detectable error
class** must add a permanent detector for that class to `checks.mjs` in the same
session. Never leave a detector script in a session scratchpad — the 2026-07-31
MC-tell audit died that way and the class recurred in the next sweep. The
existing detectors (1h … 1bn) are each documented by a comment in
`tools/checks.mjs` — read it there rather than keeping a list here.

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
**Not in `class-activities.js`** (2026-09-16). `config/class.activityBoard`
(`{ id -> { module, pos } }`, `module: 0` = the board's Unsorted pen) is
written by the two-column **Class activities board** in `teacher.js` — Built
on the left (pushed, not placed), Assigned on the right (grouped by module,
in the order students read them). It decides the order, the module headings
students see on In-Class Activities, and the `#N` prefix. A card with no entry is invisible
to everyone; **assigned + dated-and-arrived + not Hidden + not
archived/deleted** is the full live-for-students rule (`caIsVisible`).

`caBoardOrder()` in `app.js` is the one resolver, read by students
(`caBoardView`/`caNumber`) and by the console (`teacherBoardView`) so the two
can't disagree. Archived cards keep their slot in their module but hold no
`#N`, so the ones after them count down (Jonathan, 2026-09-16); Delete also
takes the card off the board. Every move — drag, `Assign to…`/`Move to…`, ▲▼,
a typed `#N` — goes through `teacherMoveActivity()`, which re-packs `pos`
1..N in both the section left and the section joined. **Never write
`progress/{uid}` from any of this**; completion is keyed to the id and is
never touched by assign / un-assign / publish / archive / restore.

### ⚠️ Every write to `config/class` goes through `teacherWriteConfig()`
**2026-09-17.** The console reads `config/class` once per view and computes
every merge patch from that in-memory copy (`teacherClassConfig`). Nothing
listens to the doc, so a second console — another tab, the laptop beside the
projector machine, the other OS — makes that copy stale, and a stale merge
used to just win: Firestore accepted it, the other session's change was gone,
and neither screen said anything. The board is where that corrupts rather
than merely loses, since a move re-packs `pos` 1..N for a whole module from
the board this tab holds.

`config/class` now carries **`configVersion`**, a counter every write bumps
inside a transaction, against the version this tab read. Two modes, and the
caller picks:

- **Strict** (`teacherWriteConfig(patch)`, no `base`) — any concurrent write
  at all refuses. For anything derived from more of the doc than its patch
  names: the three board writers, Delete (it re-packs), Clear all.
- **Cell-checked** (`teacherWriteConfig(patch, base)`, `base` = the values
  the write was worked out from, `undefined` for "was absent") — an
  unrelated concurrent edit goes through; a cell that moved underneath us
  refuses. For the single-cell toggles (a date, Hidden, a period, a clear).

Blanket-strict would fail hiding an activity here because a period was
corrected there, and a false alarm every time two tabs are open is what
teaches Jonathan to click through the one that matters. So **omitting `base`
is the safe default** — a writer that forgets gets strict, not nothing.
Failures report through `teacherConfigSaveFailed(e, msg)`, which tells a
stale rejection ("nothing was saved, reloading") apart from a dropped
connection. checks.mjs **1ai** bans a bare `.set()` on the doc, pins the
writer count at 16, and requires the transaction — add a writer and it fails
until you bump `CONFIG_WRITERS` on purpose. `firestore.rules` deliberately
does NOT enforce the counter (it would lock the Firebase console out of the
one doc you'd repair by hand); that edit was comments only, nothing to paste.

`number` in `class-activities.js` is **legacy and optional** now: the only
thing that still reads it is the one-time seeding of a board that has never
been written (`activityBoardSeeded`). Don't resequence it, and checks.mjs 1d
no longer enforces a 1..N run. `activityNumbers` is retired — nothing writes
it; leave any old rows in Firestore alone.

**A number in an activity title is still a SERIES number.** A digit inside
the title counts within its own series: the first Finger Gym is **Finger Gym
1** even though the class meets it as activity **#3** (Jonathan,
2026-08-20). Don't "fix" `#3 - Finger Gym 1`. A series must be contiguous
1..N, EN and ES, which checks.mjs 1l enforces — **sorted by numeric id since
2026-09-16**, because the course position is no longer in the file.
Inserting one in the middle means retyping every later title's digit plus any
"same as Gym 1" / "del Gimnasio 1" cross-reference in another activity's step
text, in the SAME edit. Ids (`ca-<n>`) never move — student progress is keyed
to them.

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
4/7/11's "two homes" for a chord's two fretboard positions; the metronome
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

### ⚠️ There are TWO step renderers — patch both, or the teacher can't see it
A class-activity step is rendered twice by different code: `caStepHtml()` in
`app.js` for students, and `renderTeacherActivityDetail()` in `teacher.js` for
the console's Class activities preview. They do NOT share a code path — each
has its own `if(step.figure)` / `video` / `tab` / `drill` chain — so a field
wired into one is silently invisible in the other. On 2026-08-31 the ca-11
drills shipped student-side and the teacher preview showed nothing, because
only `caStepHtml()` learned about `drill`.

**Adding or changing a step field means editing both, in the same edit.** The
preview is where Jonathan checks the day's activity before class, so it has to
show what the room will see. Nothing enforces this yet — grep both functions
whenever you touch either.

Legitimate differences are only about what can't work outside `#app`: the
preview uses a real YouTube link instead of the in-app `loadPanel()` panel,
passes `suppressCoach:true` to `buildTab`, and drills there skip the
best-score write (`sdSaveBest`/`dkSaveBest` bail on `IS_TEACHER_MODE`, so
previewing isn't practising). Keep new exceptions to that shape, and comment
them.

**Focus view (`view: 'focus'`, 2026-09-25) is activity-level, not a step
field** — it changes how `caActivityCardHtml`/`caHeroCardHtml` lay the steps
out (via `caIsFocus`), and the teacher preview deliberately keeps listing
every step with a one-line note instead. A new STEP field still goes in both
renderers; `caStepHtml` has a focus branch for the head and the nav row, so
anything added there must land in both of its branches too.

**Practice card (`view: 'card'`, 2026-09-27) is a whole card body, not a step
field** — same shape as an exit check: ONE renderer, `caCardBodyHtml(a, opts)`
in app.js, called by `caActivityCardHtml`/`caHeroCardHtml` for students and by
`renderTeacherActivityDetail` with `{preview:true}` (1bf pins all three). See
"Practice cards" in the `in-class-activities` skill.

checks.mjs 1v now enforces this for the one field it can see mechanically —
the class-activity figure's `width`/`height` — and fails the push if only one
renderer has them. Everything else is still grep-both-by-hand.

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

### ⚠️ Quiz answers and graded MCs
**Quiz answers are shuffled at render time** by `mcOrder(choices, seed)` —
deterministic, catch-alls pinned via `MC_PINNED`, fewer than 3 choices left
alone. The two MC paths store differently: the graded step persists the choice
**text**, the practice panel persists the **index**. Don't "simplify" that
away. Write `answer: 0` freely — students never see it that way.

- **The seed is the prompt PLUS the joined choices** (`mcSeed`), so order is
  stable across re-renders, languages and students, but **rewording any choice
  re-rolls the display order**. Never name an option by its position in an
  `explain` ("the last option") — name it by content. m11w2-s3 was right only
  by luck after a 2026-09-05 reword.
- **Rewording a GRADED MC's choices after students reach it orphans their
  stored picks** — the graded path persists the choice text, so an old string
  renders as "answered, nothing selected". Reword before they get there, or
  map old→new in the renderer. The 2026-09-05 m8w1 reword was safe only
  because the live roster's furthest student was in Module 1.

**That rule is now a ratchet — `FROZEN_MC_THROUGH_MODULE` in checks.mjs**
(2026-09-19). Every graded MC in Modules 1..N is pinned by a fingerprint of
its `choices` + `choices_es` + `answer`, and **1ap** fails the push when one
of them changes by a single character — including a graded MC that goes
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
held. Two of those videos turned out not to teach what the card asked — the
JustinGuitar metronome video never says "10 BPM slower than you think you
need" (it teaches one down strum per click at 80 BPM), and the any-pattern
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
  m4w1-s6's "Never repeating anything" is the plausible opposite of its keyed
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
  and a per-phrase exception would just surface the next one.

Every allowlist entry is in Modules 1–6, which that sweep did not cover. They
are carried deliberately, not tuned away; when a module gets swept, delete its
entries first and let the check say what is left.

**1w was blind to the fields this all lives in.** Its `FIELD_RE` listed
`text|hint|stuck|levelUp|gotItWhen|explain|…` and never `prompt`, and
`choices` is an array a `field: '...'` regex cannot see into at all — so a
banned phrase in an answer choice shipped while the identical phrase in its
`explain` failed the push. Widened 2026-09-20 (it caught a real one in
`module-9.js` the same day). **A new authoring field needs adding to
`FIELD_RE`, and a new array field needs its own sweep beside `CHOICES_RE`.**

The three Module 1 Set 2 graded-MC rewords, the `m2w2·c` 4-bar melody section
title, and `ca-14`'s Happy Birthday exit check are all frozen mid-year fixes —
see the **Summer reset list** (the `summer-reset` skill).

## Play-along first; Song Journey pages are the back door (2026-10-06)
**One rule for every link to a song: if students can open a play-along
(whole-song) card for it, the link opens that card; if not, it opens the Song
Journey page.** The site works that out from what Jonathan has released or set
to "Play Along now" (`songsPlayAlongCard()`) — there is no list to maintain.
Why: the play-along cards cover Layer 2 (single notes) and Layer 3 (power
chords) only; the Journey pages also hold Layers 4–5 and the bonus layers, and
Modules 4 and 5 send students there.

| Door | Behaviour |
|---|---|
| "Take it to a song" box, Modules 1–5 | one button per song; `openSongLink(slug, layer)` |
| "About this set" song names | links; same `openSongLink` |
| Songs page Core row | Play Along (only with an openable card) · Backing · Song Journey, every row |
| Journey button on a card | never on a whole-song card; on another activity only while its song has no openable whole-song card (`caJourneyUrl()`) |
| Resume card song row | all six songs |
| The Journey page itself | open for every student; the activity gate no longer locks it (`JOURNEY_GATE_LOCKS = false`, 2026-10-07) |

**Layer matching:** a whole-song card carries `journey` + `journeyLayer` (2 on
ca-24–ca-28, 3 on ca-29–ca-33), so a Module 2 link finds the Layer 2 card and a
Module 3 link the Layer 3 card. Modules 1, 4 and 5 have no card for their
layer, so their links open the Journey page at `#layer-N`.
**The decision is made at the click**, not at render time — the class config
(dates, Play Along now) can land after the page holding the link was built.
Don't fold "Play Along now" into `caIsVisible()`.

**Each Journey page draws its whole-song cards' tabs** (2026-10-07,
Jonathan: for students who prefer that visual). `addWholeSongTabs()` in
`tabs/journey.js` turns every `card.wholeSong` activity's notes into an ASCII
`.tab` folded under "The whole song tab" at the foot of its `journeyLayer`
(Layers 2 and 3 on five pages; Let It Be has none). Drawn at load from
`class-activities.js`, never hand-typed, so it cannot drift from the card —
edit the card and the page follows. Not counted by 1q/1z (they read the
static HTML). When open it spans the window, not the 760px column
(Jonathan, same day: "use the entire width of a chromebook screen") —
`wsReflow()` measures the column and a monospace character, sizes the card,
re-draws the rows to fit, and drops `.layer`'s clip (`.ws-wide`) while open.

**Journey pages have no Stuck? / Level up folds** (Jonathan, 2026-10-07:
"they are no longer needed" — all 66 removed, every layer of all six pages;
"More about this song" and "The whole song tab" are the only folds left).
Don't add them back to a layer. **The floating tools there are icons only**
— `#fab-buttons` rules in `journey-theme.css`, not `fab-tools.css` (1t2 keeps
that file equal to the app's), label `<span>` clipped as the accessible
name, `title=` via `data-i18n-attr` as the tooltip.

**No Journey page is blocked and none is deleted.** Part 1 of this work
(`fc7e878`: a per-song `JOURNEY_RETIRED` list and a "moved" card on the page)
shipped and was reversed the same day, on Jonathan's second thought — **do not
bring back a per-song list or a "moved" card**; checks.mjs **1bn** fails the push
if either name reappears. The Journey pages are **not kept in step with the
cards**: they can disagree (the "the cure" chorus is two laps on the page and
three on the card) and that is accepted — **do not open work to sync a Journey
page's text with a card.**

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
this: `WARMUP_BANK` in `config-main.js` (the Module Review's 10-Minute
Routine reads it too) and `kind:'tuning-warmup'` sections, which stay hidden
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
| Backing tracks, snippets, practice-card audio, Journey clicks, `playNote`, `audio/` | skill `audio-and-snippets` | Snippet windows are bars, never seconds; never measure a second anchor; never pitch-correct one mix alone; new "silence it" call → `stopCardAudio()` |
| In-Class Activities, the gate, exit checks, practice cards, Songs Core rows, render-time hiding | skill `in-class-activities` | Exit-check `items` are positional — frozen once taken; don't fold "Play Along now" into `caIsVisible()`; don't re-simplify the take-to-song card-or-steps rule |
| Core/Choice song chords, keys, timing, bar numbers | skill `song-facts` | Don't re-flag settled facts; don't verify BPM in audits |
| Fixes blocked by frozen modules | skill `summer-reset` | Add any blocked fix there the same day; raising FROZEN_* never unlocks anything |
| Live quiz | `.claude/rules/live-quiz.md` (loads with `live-quiz.js`) | Nothing on the stage may reveal the answer before the reveal |
| Set band, left rail, nav grid | `.claude/rules/rail-layout.md` (loads with `styles.css`/`index.html`) | The nav two-column grid is permanent — don't re-simplify; measure, don't do arithmetic |
| Journey tab cards | `.claude/rules/journey-pages.md` (loads with `tabs/**`) | Restyle `.tab` in both stylesheets or neither |

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

**Sub-agent sweeps need an adversarial audit budgeted in.** On any content sweep
over ~50 items, run a second agent told to *find problems, not confirm the work*
— the structural pass and the audit catch disjoint failure classes. Lead every
sweep prompt with the calibration line ("convert EVERY card; do NOT skip one
because the actions flow naturally — re-stitch it"), or agents go timid.
Sonnet for mechanical work, the big model for design and verification.

**Report the real numbers instead of accepting the premise**, and name the prior
decision a request would reverse — both have produced better calls than fixing
the literal complaint would have.

## Switching topics — prompt to start a fresh chat
When Jonathan raises a clearly new, unrelated topic, use AskUserQuestion to ask
whether he'd like a fresh conversation first: *"Looks like we're switching topics
— want to start a fresh chat for this, or keep going here?"* Once per switch, not
every message. Don't ask for natural follow-ups on the same topic.
