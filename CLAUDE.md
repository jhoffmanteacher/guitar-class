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
its own section below.
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

- **Modules 1–`FROZEN_THROUGH` (2 today)** — students are in here. Step
  labels must match BY INDEX; a new step may only be **appended** to the
  tail of a section. No renames: a rename here would hide an insertion
  from the check. Graded-MC choices are frozen too (checks.mjs 1ap).
- **Modules 3–`OPEN_THROUGH` (6 today)** — **nobody has reached Module 3**
  (Jonathan, 2026-09-19, re-confirmed 2026-09-20). A step may be
  **inserted anywhere inside** an existing section, and a step's
  `response` may be removed or changed. Old labels must still appear in
  the same relative order; every added step prints. **Raise
  `FROZEN_THROUGH` as the class advances** — it is the same number
  checks.mjs pins as `FROZEN_MC_THROUGH_MODULE`.
- **Above that** — step count and order are fixed; a rename prints.

In every regime the SECTIONS are fixed: same count, same order, same
kind. A section TITLE may be reworded (it moves no key) and the rename
prints rather than failing. Run it as
`node tools/rule-zero-proof.mjs <base-ref>` and paste the output into the
report before any content push.

### ⚠️ Sweep findings ratchet into checks.mjs
Any sweep or audit that finds **3+ instances of a mechanically-detectable error
class** must add a permanent detector for that class to `checks.mjs` in the same
session. Never leave a detector script in a session scratchpad — the 2026-07-31
MC-tell audit died that way and the class recurred in the next sweep. Ratchets
so far: MC answer-length tells (1h), watch-range labels ↔ `t=` params (1i),
activity title series numbering (1l), Journey tab-card markup (1q), text
contrast in both palettes across all four stylesheets (1s), Journey↔app CSS
drift (1t), figure intrinsic sizes and the two class-activity renderers (1v),
video-title drift (inside the link check), slang and figurative phrasing in
student-facing text (1w), Journey lick labels naming the shape (1w2),
orphaned `img/`/`audio/` files and unused `DECKS`/`EAR_POOLS` ids (1x), Journey
tab-ascii column alignment across string rows (1z), every rail `.nav-btn`
tagged `data-gate="keep"/"hide"` for the activity gate (1aa), the shared
`CHORD_RANK` table ↔ every Chord Blitz and Chord Detective deck, both
directions, plus every deck topping out inside a round (1ag), every
config/class write going through the stale-write guard (1ai), the activity
board's per-module heading washes (1aj), backing-track snippet windows
and both of their renderers (1ak), untranslated English prose inside a
Journey tab-ascii block (1al), the `partOne`/`partBreak` pair on a set shown
in two parts (1ao), graded-MC choices frozen in the modules students have
already reached (1ap),
Happy Birthday's tab rhythm and the prose that describes it (1aq), the
short-response budget for Modules 3–6 (1ar), the Daily 5's off switch
still being a switch (1as), three MC-giveaway detectors — the keyed
choice shouting a word no other choice shouts (1at), a never-correct
catch-all distractor (1au), and the keyed answer already printed on its
own card (1av) —, a stray `</p>` (or `<p>`) with no match in any
student-facing field (1aw), a `.strum-line`'s gap count and column
alignment against its own text (1ax), and a class-activity step's "N
beats each" claim against what its tab notes actually hold, merging a
run of identical struck notes into one logical duration so an "in
order" tab spelled out by repetition doesn't false-positive (1ay).

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
(*a fill is…*) moves into the text; an identifying one (*(your assessment
piece)*) stays in the title. **A card that already had a list keeps it
byte-for-byte.**

**Presentation belongs at render time, not in content.** MC answer order and
got-it-when styling are both render-time, so new cards inherit them and neither
can regress. Reach for the renderer first whenever a change is about how
something looks or is ordered rather than what it says.

### ⚠️ Journey tabs are hand-typed copies of the app's tab card
A tab inside a set is built by `buildTab()` in `app.js`; a tab on a
`tabs/*.html` Journey page is hand-written HTML, because those pages have no
`app.js`. Since 2026-09-04 the 69 Journey tabs use the same markup the app
emits — `.tab` > `.tab-head` (icon + `.tab-title` + "Tab" pill) > `.tab-body` >
a board — with `.tab-ascii` standing in for the app's rendered `.tab-board`
grid (Journey tabs are ASCII, and stay ASCII). Write a new one that way:
checks.mjs 1q fails the push on a bare `<pre class="tab">`, on a card missing
one of its four parts, and on a `.tab-title` with no `data-es`.

The `.tab` CSS in `tabs/journey-theme.css` is a hand-kept copy of the `.tab`
rules in `styles.css` — same mirroring as the live-quiz banner. **Restyle both
or neither.** checks.mjs 1t compares them PROPERTY by property, inside each
`@media` context, and fails the push on a one-sided rule too; the two
deliberate differences are one property each (`margin` on `.tab`,
`background` on `.tab-head`, whose Journey value is `--tab-head-bg` because
Journey's `--brand` doubles as the link colour and goes light in dark mode).
Adding a third means adding it to `JOURNEY_ALLOWED_DIFFS` on purpose.

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
`ear` (hidden note sequence, played aloud). Wiring one is content, not code:
`drill: { type:'deck', deck:'numerals-C', skill:'m11w1-s3' }`. Decks live in
`DECKS` in `app.js`; ear pools in `EAR_POOLS`. Drop the "Got someone around?"
partner line from any card that gets a deck; no paper-fallback line.

### ⚠️ A backing-track snippet is bars, never seconds
A step that drills four or eight bars can loop THOSE bars of the real
backing track — `snippet: { track:'the-cure', fromBar:5, bars:8, label,
label_es }` on the step, beside its `tab`. Content, not code: it plays a
window of the same mp3s the Journey page uses (sw.js already serves
byte-Range requests for `audio/`), so no new files and no export.

The window is in **bars of the song, counted from bar 1, at the FELT pulse
the course teaches** — "the cure" reads 144 BPM and the room counts 72, one
chord per bar, so its 20-bar form is intro 1–4, verse 5–12, chorus 13–20.
Make the window agree with the step's own tab: an eight-bar tab wants an
eight-bar window, or the loop comes round mid-phrase and the student
concludes they're the one who's wrong.

`SNIPPET_TRACKS` in `app.js` holds the four mp3 paths, the tempo arithmetic
and **one measured number per song — `anchor`, the track's first downbeat**.
Everything else is derived: the slow tier is the same master time-stretched
(297.1 s at 144 against 356.5 s at 120, exactly 144/120), so its grid is the
fast file's scaled by `trackBpm/trackBpmSlow`. **Never measure a second
anchor.** Add `?snipcal=1` to the URL and the card grows a calibration panel:
a live timecode plus a **Find the first click** button that decodes the
track's rhythm-down-metronome file and reports the first click to the
millisecond, with the gaps after it to sanity-check against 60/BPM. Paste
that number into `anchor` and flip `anchorVerified` — checks.mjs 1ak warns on
every push until it's true.

**The param is matched anywhere in `location.href`**, not parsed out of
`location.search`, because on 2026-09-18 every way of typing it onto a real
URL failed in turn: `#class-activities?snipcal=1` lands in the fragment where
`search` is empty, and `?teacher=true?snipcal=1` — the console already has a
query — makes `URLSearchParams` read the value as `true?snipcal=1`. A
delimiter-anchored regex accepts all of them and still won't match a longer
name ending in this one. Captured once at load, since the app rewrites the
hash as the student navigates.

**The panel is NOT localhost-gated**, unlike the dev bypass and
`__forceGate`. Those hand out access; this shows a number, and a student
cannot reach it without typing the query param. It was localhost-only for
half a day, which meant the one measurement this feature still needed could
not be taken on the deployed site — which is where Jonathan was standing
(2026-09-18). A wrong anchor puts every snippet on that song
out by the same amount, so there's exactly one number to fix.

**The bar dots run ~80 ms behind `audio.currentTime`** — `SNIP_OUTPUT_LATENCY`.
currentTime is the decoder's position, not what has left the speakers, so a
dot lighting exactly on the boundary lights before the downbeat is audible
(reported as the numbers running early, 2026-09-18). No API reports this for
a media element, so it is a constant; `?snipcal=1&lat=<ms>` overrides it live
to find the real figure. It shifts the DOTS only — the loop's seek stays on
the true decoder position, or the last buffered milliseconds would be clipped
off every lap.

**The dots still lead the beat slightly at 80 ms, and that is correct — don't
"fix" it** (Jonathan, 2026-09-18: "slightly early, but in an accurate way").
A visual cue has to arrive before the sound for a player to land on the beat;
a dot lighting exactly on the downbeat reads as late, because moving a hand
to it takes longer than hearing it. Anyone tempted to raise the constant
until the dots sit dead on the beat would be making it worse. The number to
watch instead is whether the lead is CONSTANT across the four dots: a growing
one is a wrong `win.bar` for that song, not latency.

One builder, `buildSnippet()`, called by `caStepHtml()` (app.js) and
`renderTeacherActivityDetail()` (teacher.js) — same shape as `buildTab()`,
which is how a step field satisfies the two-renderers rule without two
copies. 1ak pins both calls, **inside the function body and with comments
stripped**: its first cut matched the words "see buildSnippet()" in the
comment above the call and stayed green when the call was deleted.

Only one thing plays at a time: starting the band calls `stopAllDemoAudio()`,
and `playSequence()` calls `snipStop()`. Two unsynced sources in one step —
the tab's synthesised notes over the record — is the one way this gets
genuinely confusing, so it's closed off at both ends.

**Two silencers, and picking the wrong one takes the student's metronome
with it** (2026-09-19). `stopCardAudio()` stops what the SITE is playing at a
card's request — tab player, backing-track loop, chord strums, ear drill.
`stopAllDemoAudio()` is that plus `stopMetro()`, and the FAB metronome is a
tool the student started themselves, with its own Start/Stop, that no card
owns. So the full sweep is only for the two cases that earn it: **the mic is
about to open** (every coach.js site; fab-tools.js when the tuner opens), or
**the site is about to play something that has to be heard clean** (a tab
sequence, a snippet, an exit-check stimulus). A plain "mark this done" is
neither, and **nor is leaving a screen** — `caMarkStepDone()`,
`caToggleComplete()` and `caClosePanel()` all used the full sweep until
2026-09-19, so a student practising to their own click lost it by ticking a
box or by navigating away, while the ordinary lesson-step path
(`onCompleteChange()`) never did: the same gesture with a different outcome
depending on which kind of card it was. `fab-tools.js` already draws this
line for dismissing a popup ("the student shouldn't silently lose the click
they're practicing to"), so nothing in `app.js` should be stricter.
After that change the full sweep has exactly three callers in `app.js` —
`snipToggle()`, `erPlay()`, `ecPick()`, all "about to play" — plus the
mic-opening ones in `coach.js` and `fab-tools.js`. New "silence it" call site
→ default to `stopCardAudio()`.

**Which tempo a card OPENS on is per track — `defaultSlow` in
`SNIPPET_TRACKS`.** `"the cure"` sets it (Jonathan, 2026-09-19): 29 of its
steps tell the student to play at 60 BPM, and its slow tier IS 60 (feltBpm 72
scaled by 120/144), so opening on the fast tier handed a Module-2 beginner a
loop 20% above the tempo the card had just asked for, with nothing pointing
at the turtle. Seven Nation Army deliberately does NOT set it — its slow tier
is 100 against a taught 123, so neither tier matches a "play at N" line the
way this one does. `buildSnippet()` writes `data-slow` (what the engine
reads) AND the turtle's `aria-pressed`/`.on` (what the student sees) from the
one value — write only one and the button lies about what is playing. Nothing
persists the tier, so this is the state on every render, the teacher console's
preview included. checks.mjs 1ak requires it to be a boolean and refuses
`true` on a track with no `srcSlow`.

**The Guitar toggle** (2026-09-18, Jonathan's ask: students should be able to
hear the part and check themselves). A track may declare `srcFull`/
`srcFullSlow` beside its rhythm-down paths; the card then grows a third
toggle, **on by default** — the record plays the part, turn it off and carry
it yourself.

**Its label names who is playing, and flips with the button** — "Record plays
it" / "You play it", not "Guitar". The off state is the rhythm-down mix,
which turns the part DOWN rather than removing it, so a button called
"Guitar" promises a mute it cannot deliver: pressed on "the cure", where the
part is a strummed acoustic under vocals, bass and drums, it sounds like
nothing happened and the site reads as broken (Jonathan, 2026-09-18, from the
room). `snipGuitarLabel()` is the one relabeller, called by the press AND by
the Metronome exclusivity release so the label can't go stale. Optional per track and both tiers or neither, so a song whose
full mix isn't exported is a card with one fewer button, never a broken one
(checks.mjs 1ak fails a half-declared pair, and a declared path whose file
isn't there). The metronome pair on top (`srcFullMetronome`/`srcFullSlowMetronome`) is
what lets Metronome and Guitar both be on at once. **Both current tracks
have it as of 2026-09-18**, so the two toggles are fully independent and the
fallback below never fires today.

Without that pair there is no file carrying the record's guitar AND a click,
so **Metronome and Guitar become mutually exclusive — pressing one visibly
releases the other**, both directions, in `snipSetTier()`. That is the
fallback for a future track exported without the click, not a design choice:
Jonathan reported the coupling as a bug the day it shipped, and he was right
— nothing about the two controls should be linked, they were just competing
for a file that didn't exist. If a new song's toggles start interacting, the
missing export is the fix, not the code.

The first cut DISABLED the Metronome button in that case instead, reasoning
that a button undoing another button is what nobody debugs in a room of 30.
That was wrong twice over and shipped: Guitar starts ON, so the moment both
songs had a full mix the click was dead on every card by default (found in
the room, 2026-09-18, and it also blocked the `?snipcal=1` anchor
measurement, which needs the click). And a greyed-out control reads as
broken, not as a choice. The original objection was really about doing it
SILENTLY — releasing the other toggle where the student watches it pop out
is just how a pair of mutually exclusive controls behaves.

**Both snippet songs have their full mix as of 2026-09-18** — Seven Nation
Army and "the cure" — so the Guitar toggle renders on all 12 snippets. A new
snippet song needs two files, at both tempos, mix `full`, and a `srcFull`/
`srcFullSlow` pair in its `SNIPPET_TRACKS` entry; 1ak warns the count of
tracks still without one.

**Export it from the same Moises project with the stems up** — same tempo, no
count-in, no re-trim, no transposition. 1ak measures the result against its
rhythm-down twin and fails beyond 0.25 s, because two mixes of one take have
to be one length; a re-trim is the only failure here nobody can hear (both
files play fine alone, the toggle just jumps the loop). Correct pitch by
SHIFTING, never resampling: a resample fixes pitch by changing speed, which
moves the length and makes the two mixes drift apart as the loop runs.

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
missing. N is *the furthest module a student has reached*; it is **2** today
(Jonathan, 2026-09-19). **Raise it as the class advances** — ask which module
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

**Reword next summer, when progress resets for the new year.** These three
graded Module 1 Set 2 cards are frozen mid-year only because students have
already answered them; each has throwaway distractors worth replacing:
- "Which of these is NOT a part of the guitar?" → "Hinge"
- "If a string's pitch is too LOW…" → **two** dead choices, "Take the string
  off and put it back on" AND "It doesn't matter which way" (the second is
  carried in checks.mjs `MC_CATCHALL_ALLOW`, so 1au does not fail the push on
  it — clear the allowlist entry in the same edit)
- "The needle is to the RIGHT of center…" → "The tuner is broken — restart it"

The same card's read-the-tuner twin (`w2·b·sec0·step4`) is in
`MC_LEAK_ALLOW` for 1av: its keyed answer repeats the step's own text, which
is fine while the card's job is to check that you read the card, but worth
re-deciding when the rest is reworded.

**Also for next summer: `m2w2·c`'s "Read TAB & play a 4-bar melody" section
title.** The "Mary Had a Little Lamb" warm-up TAB it heads is seven one-beat
notes — even with the last one now held two beats (2026-09-20, so the line at
least fills whole bars) that's 2 bars, not 4. `rule-zero-proof.mjs` fails the
push on ANY section retitle in Modules 1–2 (`section retitled in a module
students are in`), so the title stays wrong until the reset; the skill
checklist and Module Review line for it were reverted to match "4-bar" for
the same reason, rather than say something the section heading doesn't.

**Also flagged, also not this year: `ca-14` (the Happy Birthday exit check,
frozen `items`).** Its stimuli play the tune in even notes although the
activities that teach it now teach the real rhythm, and items 1 and 3 play
the same four notes, differing only by their "Line 1" / "Line 2" label
(2026-09-20 second-pass sweep). `items` is positional and frozen once
students have taken the check — see the exit-check rules above — so nothing
changes here until progress resets.

## Live quiz — the whole-class game

All of it is in `live-quiz.js`: the quiz bank, the student overlay, and the
teacher's projected stage (`?teacher=true` → **Live quiz**). One game runs at
a time, in `liveQuiz/current` (+ an `answers/{uid}` subcollection).

- **The teacher is the only judge — for `mc` quizzes.** There is no answer
  key in the bank for those; Jonathan marks the correct choice at reveal.
  That's deliberate: the dashboard is on the classroom projector, so anything
  the app knew in advance would either spoil the round or need hiding from
  the room.
- **`type:'fret'` quizzes are the one exception.** The teacher picks a
  target note from the strip; the app scores the round from `LQ_NATURALS`
  when Reveal is pressed. Allowed because the answer is a fact of the
  fretboard, not something only the teacher knows — and the projector
  rule still holds: during a fret question the stage shows the prompt and
  the answered count, never the board with a marker, and the strip shows
  one Reveal button, never the fret. Answer ids are `'<string>:<fret>'`;
  octaves both count (`correctIds`). The board is `app.js`'s
  `fgBoardSvg(sid, kind, opts)` behind a `typeof` guard — the fret UI
  only ever renders on `index.html`, never on a Journey page.
- **Nothing on the stage may reveal the answer before the reveal.** During a
  question the projector shows the prompt and an answered-count, nothing else.
  Any new stage content gets checked against that.
- **New quiz = a new entry in `LIVE_QUIZZES`**, with its student-facing text
  as `i18n.js` KEYS (`titleKey` / `promptKey` / `choices[].key`), not strings.
  `checks.mjs` 1f walks the bank and fails the push on a key that doesn't
  exist, the same way it does for `DECKS` and `EAR_POOLS`.
- **Students are invited, not teleported.** `lqSyncInvite()` puts up a modal
  with a Join button; it is re-checked on `visibilitychange`, because the
  first version silently auto-opened the screen, bailed on `document.hidden`
  and never retried — so a backgrounded tab (the common case: nobody is
  staring at the site when the teacher says "we're playing") got nothing.
  Any new "get their attention" path needs that same visibility re-check.
- **`speedBonus` stays off** for any quiz where the teacher makes the sound
  after the question opens — scoring by reaction time there just punishes
  whoever waited to hear it properly.
- **`live-quiz.js` also ships on the six `tabs/*.html` Journey pages**, where
  it shows the "a game is running" banner and nothing else (`lqCanPlayHere()`
  gates the rest). Those pages have no `app.js`, so nothing in that file may
  come to depend on one — Firestore through `lqEnsureDb()`, the uid through
  `lqUid()`, and an app.js-only helper only behind a guard or a fallback.
  `journey.js` starts the listener once its own Firebase boot has landed.
  The banner's CSS is mirrored in `tabs/journey-theme.css` (those pages don't
  load `styles.css`) — restyle both or neither.

### ⚠️ Editing `firestore.rules` changes nothing until it's pasted into Firebase
GitHub Pages doesn't deploy Firestore rules. After any push that touches
`firestore.rules`, open Firebase console → Firestore Database → Rules, paste
the file, Publish. Until that happens the live quiz's answer writes are
rejected and the game looks broken with no error students can see.

## Exit checks — the end-of-period product

An exit check is a class activity with `kind: 'check'` (schema at the top of
`class-activities.js`): five auto-graded questions, one try, result on
`progress/{uid}.exitChecks[id]` plus `classActivities[id] = true`. Two item
types, `nextNote` and `noteName`. Engine is the `ec*` functions in `app.js`;
the student card and the console preview share `caCheckBodyHtml()` **on
purpose** — the two-renderers rule exists for a step FIELD going invisible in
the teacher's copy, and a whole new card has no such split, so don't fork it.
Console: the Activities table shows the turned-in count and average; the
activity's detail page shows the per-student, per-question grid and a
"Missed by" row. Data is guarded by checks.mjs **1y** (`1x` is the
orphaned-assets check), which recomputes every answer key from the fretboard
rather than shape-checking it — a wrong `answer` doesn't look broken, it just
marks a correct student wrong. Checks take no `#N` number: `caBoardOrder()`
skips them when it hands out 1..N, which covers the student card and the
console board at once, and the board renders "Check" where the `#` box goes. No
`firestore.rules` change was needed — the result is a field on the progress
doc the teacher already reads whole. About one check per week is the intended
pace (Jonathan, 2026-09-09).

**Post one with its own link:** `#class-activities/<id>` (e.g.
`…/index.html#class-activities/ca-15`) opens the Class activities page with
that card expanded and scrolled to — `caFocusActivity()` in `app.js`. The
teacher console's Class activities table has a **Copy link** button per row
(and the same link spelled out on each detail page) so the URL never has to
be typed. The hash router splits on `/` (`exploreHashBase` / `exploreHashTail`),
so a new deep link takes that shape rather than a query param. An id that
isn't published yet gets `ca.linkMissing` above the archive, not a dead end.

Two rules that are easy to break without noticing:

- **Stored exit-check picks are POSITIONAL — editing a shipped check's
  `items` silently re-grades every result.** `res.picks` is an array indexed
  by item position and `ecGrade()` re-grades it against whatever `items` says
  now, so inserting, removing or reordering an item in a check students have
  already taken leaves their stored `score` (which the console prints) beside
  recomputed per-question cells for different questions, and makes the
  "Missed by" row fiction. checks.mjs 1y recomputes the answer KEYS from the
  fretboard and passes straight through this. Same hazard as rewording a
  graded MC's choices, one layer down: edit a check before students reach it,
  or treat its `items` as frozen once they have.
- **Seed the MC shuffle on language-stable data.** `ecChoicesHtml` seeds on
  the `fret·note` pairs, never the rendered chip labels — "fret 5 · A" and
  "traste 5 · A" would hash differently and deal one student a different
  order per language.
- **The `noteName` board is drawn with `theme:'web'` plus the dark-mode
  invert**, not on CSS variables: its fretted-note circle is a hardcoded
  light green, so a variable-themed `?` would be light-on-light in dark mode.

### ⚠️ The set band carries the lesson chrome, and the rail packs itself
**2026-09-19, "Chromebook viewing area" work order, Phase 1.** Test viewport
is **1366×657** — a Chromebook with browser chrome. Before this, 365px of a
657px screen was spent before the first line of the step a student was
meant to be reading; it is ~196px now.

- **`.set-eyebrow` is the only sticky row.** The progress pill, "Step n of
  m" and the All steps / One at a time toggle moved out of the card and
  into the band, inside `<span class="se-chrome">`. `buildLesson()` still
  builds them (same ids, keys and per-part `lessonParts()` logic) and hands
  them up through **`_lessonChrome`**, which `buildSet()` reads right after
  calling it — so **`buildSet()` must call `buildLesson()` before it
  assembles the band**, not inside the same template literal.
- **Nothing may look the chrome up with `dp.querySelector` any more** — it
  is a sibling of `.dp`, not a descendant. `lessonChromeQ(dp, sel)` is the
  one lookup, used by `applyStationView`, `syncStationFocus` and
  `refreshLessonPill`. `.cf-focus` on the chrome mirrors `.dp.focus`
  (`.dp:not(.focus) .fm-count` could no longer reach it), and
  `.week-panel.on-checklist` hides the chrome over the checklist panel —
  set by `switchTabById()` **and** by `rebuildModuleContentPanels()`, which
  restores the open tab itself.
- `.dp-head` is a **title row only** now; a single-flow set (Module 13) is
  the only thing that still renders one.
- **The content column is 1000px** (was 820). Running text does not widen
  with it — `.st-text` and friends keep their own 70–72ch caps, which is
  what keeps a line readable. Tab boards and snippet cards now fill to
  ~880px; a `.step-figure` stops at **720px**, which is the widest raster
  in `img/` — past that the browser invents pixels. It lives inside
  `.st-text`, so above 1240px one rule lets it out of the text measure.
- **The rail has two independent states.** `body.rail-open` is the mobile
  drawer (unchanged); **`body.rail-collapsed`** is the new 62px icon strip,
  remembered in `localStorage` under **`railCollapsed`** (try/catch,
  defaults to expanded) and toggled by `toggleRailCollapsed()`. They never
  both apply — the collapse button is `display:none` below the drawer
  breakpoint, and the narrow-layout block unwinds the collapsed rules. Nav
  labels are **clipped, never `display:none`**: they are each button's
  accessible name, and `index.html` gives every nav item and every tool a
  translated `title=`.
- **The tool dock is 1×4, icons only, above 760px** (`.rail-tools`, 119px →
  50px) and keeps the labelled 2×2 on the drawer. The labels do not fit in
  a 252px row — "Metronome", "Temporizador", "Grabadora" all ellipsize — so
  they are clipped and the tooltip carries the word.
- **The page nav is a two-column grid, at every screen size** — see the
  left rail nav cleanup below. `@media(min-width:761px) and (max-height:800px)`
  is the short-screen rail on top of that: it packs gaps and padding
  everywhere in the rail and drops the two station subtitles, but the nav
  grid itself is no longer scoped to this query — it was tried
  single-column-only-here-and-conditional and reverted the same day (see
  below) once nothing conditional was needed to make it fit.

### ⚠️ Left rail nav cleanup — two-column grid is permanent, don't re-simplify it
**2026-09-20, "Left rail navigation cleanup" work order.** Two renames, label
text only, same ids/onclick/routing: `nav.practice` "Practice"→**"Modules"**
(only used on this one button, so the value change is the whole rename);
`nav.classActivities` stays "In-Class Activities" everywhere it already was
(the page heading, its `aria-label`, the console, the video-panel breadcrumb)
but the rail button alone now reads **"In class"** off a second, nav-only key,
`nav.classActivitiesNav` — added rather than repointed, so those other
readings keep the fuller phrase. Below the five nav rows, a `.rail-divider`
now separates them from the active item's own "section panel"
(`.rail-panel`, wrapping `.g-module`+`.g-set`) — Modules is the only nav item
with rail content today; Songs/Games/In class/My progress render nothing
there, which `body.explore-open`/`.games-open` already handled before this
and still does. **Module review moved off its dashed `.wpill` under the set
buttons** and onto a plain row (`.rail-station.st-review`, `#rail-review-btn`)
at the end of the "This set" list, alongside "The lesson" and "My skills
checklist" — `renderPills()` fills in `dataset.moduleNum`/locked/complete and
un-hides it only for a module that has one, `railModuleReview()` reads that
dataset back to navigate, and `activateSet()`/`syncRailStations()` keep its
active/`aria-current` in step the same way the `.wpill` loop used to. The
🏆 trophy (`#rail-module-goal`, the module-complete reward badge) rode down
with it — same id, same `earned`/`celebrate` handling in
`renderProgressStrip()`, just relocated from beside the "MODULE" heading
onto this row as a plain `.rs-num` badge; it no longer floats. Because a
module review has no tabs to switch between, `syncRailStations()` no longer
hides the whole "This set" group whenever the open panel lacks a
`.tab-panel` — only when NEITHER the lesson/checklist tabs NOR a Module
Review row apply does the group disappear; otherwise the lesson/checklist
rows hide and the review row (if this module has one) stays, so it keeps its
"you are here" highlight while you're actually looking at it.

**The nav rows are a two-column grid, permanently, at every screen size —
not a single full-width column, and not conditional on screen height.** The
work order's first draft asked for single-column ("In-Class Activities"
wrapped to two lines and wanted fixing); shipped and measured against the
1366×657 Chromebook viewport the *previous day's* rail work order was
written for, it cost the two nav rows the 2026-09-19 packing had bought
back — **106-132px of rail overflow, confirmed for essentially every
module**, not just the worst case, because five 44px-floor rows (the
tap-target pass, unnegotiable) is simply taller than three. Jonathan's call
on seeing the real numbers: keep the grid, always — same short labels so
nothing wraps ("In class"/"En clase", "Modules"/"Módulos", not the old long
phrases), all five rows the exact same size, **active state changes
background+text color only** (`.nav-btn.active` carries no `font-weight` or
size change any more — that, not the grid, was the other half of "renders as
a larger pill"), and `#my-progress-btn{grid-column:1/-1}` spans both columns
on its own row rather than being auto-placed into a lone column-1 cell (the
original "orphan row" complaint). Sizing: `.nav-btn` at 0.8125rem/17px
icon/6px gap/8px 6px padding, `.nav-list` at `repeat(2,minmax(0,1fr))` with a
4px/6px grid gap — checked empirically against both languages' labels
(longest is "Canciones" at 63px in a ~108px column) rather than assumed.
**Re-verify by measurement, not arithmetic, before touching any of these
numbers** — `scrollHeight`/`clientHeight` on `.rail-scroll` read identical
when content fits with room to spare vs. exactly at the wire, because a
flex:1 box reports its allocated size either way; compare a child-rect span
(first child's top to last child's bottom, plus the container's own
top+bottom padding) against the true available budget instead. **The
service worker will serve a stale `styles.css` through a plain local
server during exactly this kind of iteration** — `navigator.serviceWorker
.getRegistrations()` → `unregister()` + `caches.keys()` → `caches.delete()`
before every reload, or the measurement is stale and every conclusion drawn
from it is wrong (this cost real time here: two rounds of "why didn't my
edit change anything" both traced back to this).

**The header lost its subtitle line in the same session** (Jonathan: "this
text isn't necessary… we can delete it from all instances to save space") —
`header.subtitle` ("Independent Practice and Skills Tracker") is gone from
`index.html`, `404.html` and `i18n.js`; `.header-sub` and its two dead
`display:none` overrides (phone width, short height) are gone from
`styles.css`. The header is one line everywhere now, so **`--hdr` dropped
70px→60px** for the default (tall-screen) case; the existing short-screen
override already read 48px and needed no change, since `.header-sub` was
already hidden there before this and the measured rendered height already
matched. Confirmed by measurement, not estimate: at 1366×657 with Modules
active on m5w2 (4 sets + Module review, two parts — the standing worst
case), the rail fits with **~19px of slack for the teacher/dev-bypass view
(Preview-mode banner showing) and ~66px for a real student (no banner)** —
comfortably inside budget, not a bare fit repeating the previous day's
razor-thin 527-in-527px.

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

## In-Class Activities page & the activity gate
Work order: "Today-first site simplification," Phase 1, shipped 2026-09-12.
Renamed **In-Class Activities → Today** for that work order, then **back to
In-Class Activities** 2026-09-17 (Jonathan's call) — `nav.classActivities` is
the same i18n key both times, so the hash `#class-activities`, every deep
link, and the console's Copy-link URLs never moved. It is the site's home
page: `showApp()` opens it whenever the URL carries no explore hash at all,
gated or not. `renderClassActivities()` (app.js) builds three groups —
**Do now** (the first pending card; collapsed like every other card, not
forced open — Jonathan, 2026-09-15), **Still to do** (a divider, skipped when
there's only one card left), **Earlier** (`ca.finishedGroup`, now "Earlier"
not "Finished") — and appends the resume card (`renderResumeCard()`) at the
end when nothing is blocking. The `#resume-card` element itself moved in
`index.html` from a sibling of `#week-panels` into this page's own body; it
no longer renders in the module/set view at all.

**Reading order is newest-first, not the teaching order** (Jonathan,
2026-09-17): the newest module's section renders at the top, and within a
module the most recently assigned card (highest board position) renders
first — so a student lands on current work without scrolling past everything
behind them. `caBoardOrder()`/`caNumber()` still compute the true ascending
course order underneath (teacher console, gating, and deep links all key off
it), and the "#N" a card carries never moves — only `renderClassActivities()`
reverses `view.sections` and each section's ids for display. The "Earlier"
group's order falls out of the same reversal now, not a second `.reverse()`.

**The gate:** `caBlockers()` — a visible (`caIsVisible`), undone
(`classActivities[id]!==true`), uncleared activity or check — drives
`body.ca-gated` via `applyActivityGate()`. Teacher/dev bypass are gate
previewers (`isGatePreviewer()`) and never see it; a failed progress load
(`progressLoadFailed`) also reads as "nothing blocking" — never lock on a
guess, same rule as the sequential set gate. `applyActivityGate()` runs from
`showApp()`, at every exit of `loadClassConfig()`, and inside
`renderClassActivities()` itself (so a completion or an exit-check submit
lifts it live, no reload). CSS keys the hiding off `data-gate="hide"` on
every rail `.nav-btn` except In-Class Activities and Live quiz
(`data-gate="keep"`) — checks.mjs **1aa** fails the push on a nav button with
neither — plus `.g-module`/`.g-set`/`#resume-card`/`#week-panels`;
`#search-btn` needs `!important` because `showApp()`/sign-out already toggle
its inline `style.display`. `routeExploreHash()` rewrites any hash but
`#class-activities`/`#live-quiz` back to In-Class Activities with a
`gateToast()` while gated (`returnToPractice()`
gets the same guard); `window.__forceGate` (localhost only) lets a session
that can't otherwise trigger the gate (dev bypass, the teacher account) force
it on to check the UI.

**Absent students stay blocked — by design** (Jonathan, 2026-09-12): every
visible, undone, uncleared activity blocks, however old, until the student
finishes it or is cleared per student. No blocking window, no
activity-level "stop blocking everyone" toggle — don't propose one again;
the per-student Clear (and Hide, which also removes it from Earlier) are
the tools. One release date serves both periods, also by choice.

**Optional activities (2026-09-22, Jonathan's ask):** a Required / Optional
switch on every assigned card on the console board writes
`config/class.optionalActivities` (`{ id: true }`, cell-checked, same shape
as `hiddenActivities`; `teacherSetActivityOptional`). An optional card is
still VISIBLE — `caIsVisible()` does not read the map — and renders an
"Optional" tag (`caOptionalTagHtml()`, inside both meta-line builders so hero,
plain card and check all get it), but it is never a blocker. The rule lives
in three places that must agree: `caBlockers()` (app.js, via
`caIsOptional()`), `teacherBlockersFor()` (teacher.js) and `journeyBlockers()`
(tabs/journey.js). The Today hero prefers the first REQUIRED pending card and
falls back to an optional one only when nothing required is left. Cached in
`localStorage` (`caOptional`) with the same fail-to-cache rule as `caHidden`
— a flaky read must not turn every optional card back into a lock. Delete
clears the flag with everything else; Archive keeps it. No
`firestore.rules` change (comment only).

**Per-student clears:** `config/class.activityClears` (`{ uid: { id: true } }`)
lets a teacher let one student past a specific blocker without them finishing
it — a sub day, a connectivity problem, work done on paper. Written by
`teacherSetActivityClear`/`teacherClearAllBlockers` in teacher.js, same
merge-patch shape as `hiddenActivities`/`gameOverrides`; no `firestore.rules`
change (already teacher-write/student-read). UI: a Clear toggle in the
per-student grid on both `renderTeacherActivityDetail` (new — regular
activities had no such grid before this) and `renderTeacherCheckDetail`
(existing, gained a Gate column); a "Blocked by N" badge and a per-student
"Today's activity gate" section with Clear all on the Students views. Cached
in `localStorage` (`caClears`, restored by `restoreClassConfigFromCache` —
renamed from `restoreActivityDatesFromCache`) with the same fail-to-cache
(never fail open) rule as `activityDates`.

**Archive / Delete (2026-09-15, Jonathan's ask):** two buttons per row in the
console's Class activities table, in a new **Archive** column beside
Visible/Hidden. `config/class.archivedActivities` and `.deletedActivities`
(`{ id: true }`, same merge-patch shape and teacher-write/student-read rule as
`hiddenActivities`) — no `firestore.rules` change; the rules edit that shipped
with this was comments only, so nothing needs pasting into Firebase. Students
merge the two maps into one `retiredActivityIds` set (they draw no distinction)
and `caIsVisible()` fails on it **before** the dev-bypass line, unlike the date
gate — a retired activity isn't "not live yet", it's out of the course, so
there's nothing to preview. Everything downstream follows for free: off
In-Class Activities, out of `caBlockers()`, and a deep link reads as
not-posted. The visibility rule
is mirrored in all three places as ever — `caIsVisible` (app.js),
`teacherActivityVisible` (teacher.js), `journeyIsVisible` (journey.js).

The difference between the two is what **Restore** gives back: Archive keeps the
release date, rename, board slot and per-student clears, so the card returns
exactly where it was; Delete wipes all of that on the way out (behind a
`confirm()`) **including the board entry**, so a restored one comes back in
Built — unplaced and undated, to be assigned and published from scratch. The two
flags are mutually exclusive by construction, each writer clearing the other.
Neither touches students' `classActivities` completion records (the teacher has
no write on `progress/{uid}`, and it's grade data), and neither removes the
entry from `class-activities.js` — only a push does. **Retired cards hold no
`#N`** (changed 2026-09-16 with the board — Jonathan's call): the ones after
them count down, so the list students read is always 1,2,3 with no gaps.
Console-side an archived card folds into its module's own `Archived (N)`
disclosure, and an archived-but-unplaced one into Built's
`Archived / deleted (N)`. Cached in
`localStorage` (`caRetired`) with the same fail-to-cache rule as
`activityDates` / `activityClears` / `hiddenActivities` (`caHidden`) — a
blocked read must not bring a retired or hidden activity back and let it
start gating the site again. **`hiddenActivities` joined that list
2026-09-18**: it used to fail open to `{}` on the reasoning that a stray
visible card was cosmetic, which stopped being true when the gate shipped —
an activity the teacher pulled would come back on a flaky read and block the
whole site on work nobody could finish.

**Journey pages gate too.** The six `tabs/*.html` pages now also load
`class-activities.js` (a plain data array, no dependency of its own) so
`journey.js` can compute the same blockers after its own Firestore boot
(`journeyIsVisible`/`journeyBlockers` — deliberately NOT shared with
app.js's `caIsVisible`/`caBlockers`, which read globals only the main app's
boot path populates) and, on a hit, replace the whole page with a
`.ca-gate-card` (styles in `tabs/journey-theme.css`, no `styles.css`
counterpart — the main app's gate stays on the existing In-Class Activities
page rather than a full-page swap) linking back to
`index.html#class-activities`. Skipped
for the teacher's own account by email; a failed config read fails open (no
gate), never on a guess. `mood-chart.html` is not one of the six and is never
gated. **The one exemption (2026-09-12):** a pending activity that names a
Journey page — `journey: '<slug>'` in `class-activities.js` (ca-10 →
seven-nation-army, ca-13 → the-cure), optional `journeyLayer` — is sending
the student there as part of the work, so `journey.js` leaves THAT page open
while the activity blocks; every other Journey page stays gated. The card
renders an "Open the … Song Journey page" button under its steps
(`caJourneyLinkHtml()`; the console preview in `renderTeacherActivityDetail`
shows the same link — two renderers, patched together). checks.mjs 1d
validates the slug against `tabs/<slug>.html` and the layer against that
page's `layer-num` spans.

**Gate flips on mid-session → In-Class Activities.** `applyActivityGate()`
detects the off→on transition (a new activity going live under an open
Games/Songs/My progress screen, via the `visibilitychange` re-check) and,
once the app is on screen (`appIsOnScreen()`), walks the student to In-Class
Activities with the same toast `routeExploreHash` uses. The CSS alone only
hid the rail; an open
screen stayed open.

**What a gated student can still open is one list — `GATE_OPEN_HASHES`**
(`#class-activities`, `#live-quiz`) — read by
`routeExploreHash`'s guard and the flip redirect; it mirrors the
`data-gate="keep"` buttons in the rail (1aa). Add to both or neither.

**There was an Assessments page (2026-09-12–2026-09-20).** A rail button
and standalone `#assessments` screen listed every module's in-person
assessment items in one accordion, read-only. Removed 2026-09-20 (Jonathan:
redundant with the Module Review's own assessment box, and he posts
rubrics/assignments on Canvas) — rail button, `#assessments`
screen/route/i18n/CSS all deleted. **The Module Review's per-module
assessment box is a separate, still-live feature** — `.mr-assess-box` at
the bottom of `buildModuleReview()`, and its heads-up pop
(`buildMrAssessPop`) — reading the same `MODULE_REVIEWS[n].assessItems`;
don't confuse the two if this comes up again.

**Phase 2 (nav collapse), shipped 2026-09-12:** the rail is five items —
In-Class Activities · Practice · Songs · Games · My progress, no "Explore" heading (the
`nav.explore` i18n key stays: it's still the rail `<nav>`'s aria-label, just
not a visible span any more). Keep practicing and Daily Review are sections
inside My progress now, not their own pages — `renderKeepPracticing()` and
`renderDailyReview()` are UNCHANGED, only their host div moved in
`index.html` and `openMyProgressScreen()` calls all three renderers (Daily
Review first, then Keep practicing, then the module tally). `#keep-practicing`
and `#daily-review` stay in `EXPLORE_HASHES`, but `routeExploreHash()`
canonicalizes both to `#my-progress` before anything else runs (the gate
check, the dedup guard, the scroll stash) — so an old bookmark or Journey
link still resolves, onto the merged page. Mood Chart lost its rail button;
`renderSongsHub()` opens it from a row at the top of the Songs page instead,
same `window.open(...,'_blank','noopener')` as a Journey link.

**Phase 3 (render-time hiding), shipped 2026-09-12 — Module 2 piloted first
(step 1), then the section-kind tagging rolled out to every other module
(step 2), per the work order's own "Order of work."** Four section
`kind`s beyond the pre-existing `tuning-warmup` (ratchet 1r):
`take-to-song` (renders a Journey link card, `journeyLinkCardHtml()`, in
place of its steps — **but only when this module has a Journey layer to
link to**; see the 2026-09-12 correction below), `routine`/`ear-spark`/
`reflection` (the section is skipped entirely — "My Practice Routine",
"Ear Spark — optional ear bonus", "Checkpoint"/"Wrap-Up"). **Kind-ONLY matching, deliberately NOT kind-or-title
like `isTuningWarmupSection`** — `isEarSparkSection`/`isRoutineSection`/
`isReflectionSection`/`isTakeToSongSection` in app.js check `sec.kind`
alone: these four titles repeat across nearly every module, so a title
fallback would hide every module's copy the moment the code shipped, not
just Module 2's. A step-level `hidden: true` flag (song previews now taught
by a class activity) works the same way, no title involved.

**`visibleSteps(sec, moduleNum)` / `visibleSections(station, moduleNum)`**
(app.js) are the one gateway everything student-facing reads through — `buildLesson()`,
`resumeLessonCounts()`, `buildSearchIndex()`, `moduleStepsFlat()` (the
Daily 5 candidate pool) (checks.mjs **1ac** requires the call). The one deliberate exception is teacher.js's `setShortResponses()`:
it walks `storageSections()` (every section but tuning-warmup) because it's
an audit of what students actually wrote, and the Checkpoint / Wrap-Up /
Practice Routine answers from Modules 1–2 are still real after those
sections were retired from the ladder — a slot in a non-renderable section
or on a `hidden` step is tagged `retired` and its label says "(retired)".
1ac requires `storageSections(` there and fails on `visibleSections(`. `visibleSteps` returns `{st, idx}` pairs: `idx` is the
step's real position in `sec.steps` — what every storage key (doneKey,
responses, bpm, drills) is built from, so a hidden step earlier in the array
can never shift a later one's saved progress — while the pair's position in
the *returned array* is the visible step number and the only thing "which
step is current" compares against. `visibleSections` returns `{sec, gi}`
pairs the same way — **`gi` is the STORAGE index and comes from
`storageSections()`: the section's position after excluding ONLY
tuning-warmup sections**, the convention every Firestore key has been
written under since July 2026 (pre-semester, so that one hide is baked into
the keys). Every other hide — routine / ear-spark / reflection, a section
with zero visible steps — is render-only and never renumbers `gi`; the
pair's position in the returned array is its DOM position and nothing
else. The first cut (066dc05, one day live) numbered `gi` over the
survivors and moved Module 2 Set 1 station B's "Play along with the note
map" from `b-sec2` to `b-sec1` — "safe because it's a first rollout" was
true for tuning-warmup in July, not mid-semester. checks.mjs **1af**
rebuilds the expected `data-ns` list for all 36 sets from raw module data
and compares it to what `buildSet()` renders, and pins the Module 2 Set 1
sections by title.

**The Journey link card (3b):** `JOURNEY_LAYERS` in app.js (`{slug: {moduleNum:
layerNum}}`) is authored from the six pages' real `.layer-unit` spans —
today uniformly Module 1→Layer 1 … 5→5, anything past 5 an unnumbered
"Extra". checks.mjs **1ab** rebuilds the map from those spans and fails on
drift. The button opens `tabs/<slug>.html#layer-<n>`; **journey.js needed no
changes** — `openFromHash()` already opens `#layer-N` on load and on
`hashchange`.

### ⚠️ No Journey layer → the take-to-song section renders its OWN STEPS
**Correction, 2026-09-12 (same day as Phase 3, found by an error sweep).**
The first cut swapped a `take-to-song` section's steps for the Journey card
*unconditionally*, and dropped the whole section when the card came back
empty. Since `JOURNEY_LAYERS` stops at Module 5, that made **every one of
the 20 take-to-song sections in Modules 6–12 render nothing at all** —
silently deleting ~26 challenge cards, Module 12's only graded
assessment-piece card ("Full-Verse Rehearsal") among them, plus the sole
teaching step for 7 skills (m9w1-s5, m9w2-s5, m10w1-s4, m10w3-s6, m11w3-s6,
m12w1-s6, m12w3-s6). The tagging was mechanical and title-matched, so it
hit sections whose content was never a mere song pointer.

The rule now: **the card replaces the steps only when `journeySongsFor(
moduleNum)` is non-empty.** With no layer (module 6+) there is no card, so
the section falls back to a normal section — its own steps, its own heading
— and is "empty" only if those steps are. Lives in three places that must
agree: `visibleSteps()`, `isRenderableSection()`, and `buildLesson()`'s
`hasJourneyCard` branch (which also decides whether the section heading is
suppressed, since the card carries its own title). checks.mjs **1af** keeps
its own independent copy of the rule and caught the drift the moment app.js
changed — update both together. Render-only as ever: `gi` is untouched, so
no progress key moved. Jonathan's call was to restore the steps rather than
keep the card-or-nothing rule; **don't re-simplify this back to an
unconditional swap.** If a Journey page ever grows a Module 6+ layer, adding
it to `JOURNEY_LAYERS` flips that module to the card automatically.

**Ratchets:** 1ab (JOURNEY_LAYERS parity), **1ac** (the four callers above
must still call `visibleSteps(`/`visibleSections(` — a positive assertion,
not an exhaustive raw-iteration scan, so it can't catch a raw
`.steps.forEach` added *alongside* a leftover unrelated call), **1ad** (kind
↔ title, full two-way now that every module is tagged — same shape as 1r:
a tagged section's title must match, and a section titled like one of
these must carry the kind; `KIND_TITLE_COUNTS` pins the total per kind at
`{take-to-song:29, routine:5, ear-spark:7, reflection:62}` across all 36
sets), **1ae** (every `hidden: true` step needs a `// ... ca-<n>` comment on
the line above it, still just the 3 from Module 2 — see below).

**All 13 modules are section-kind-tagged** (mechanical, title-matched,
2026-09-12) — every "Checkpoint"/"Wrap-Up"/"Take It to a Song"/"My Practice
Routine…"/"Ear Spark…" section in the course now carries its `kind`, so
`isEarSparkSection()`'s brief kind-only/no-icon gap (modules not yet tagged
showing Ear Spark without its bolt) is gone too — every instance is tagged.
Module 1 has only one such section (its own "session check-in" `routine`
variant — it predates the take-to-song/Checkpoint/Wrap-Up pattern
entirely); Module 13 (single-flow) has none.

**Step-level `hidden: true` (song previews a class activity now teaches)
stays at Module 2's original 3** — checked Modules 3–8 against every
shipped `ca-<n>` and found no genuine duplicates to add. The Finger Gym
activities (ca-2…ca-7) are generic dexterity drills, not song previews.
"Notes on the Low E String" (ca-11) and "Sub Day Circuit" (ca-12) are
Module 1/2-era content. `"the cure" — The Verse Root Line` (ca-13) teaches
a single-note bass line, but Modules 3–8's own "the cure" steps each teach
a *different* technique on it — power chords (Module 3), soloing (Module
4), open-chord strumming (Module 5), fingerpicking (Module 8) — so none of
them duplicate ca-13's single-note reading (nor does Module 7's Seven
Nation Army "real rhythm" step duplicate ca-10 — different skill, rhythm
notation vs. frets). Real content, not a shortcut: verified with a search
across every Module 3–8 "the cure"/"Seven Nation Army" mention. Leave these
for Phase 4 (new class activities, if any come to duplicate a module step,
would be the trigger to hide it then) — see the work order.

Verified 2026-09-12: a full walk of all 36 sets in both languages (pill
step-total == rendered `<li>` count, zero orphan section headings, no
exceptions) — the closest this repo gets to the work order's "headless
walk," since there's no Playwright harness to run one for real.

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

## Backing tracks

`<artist-slug>-<song-slug>-backing-<key>-<bpm>bpm-<tuning>hz-<mix>.mp3`, lowercase
kebab-case; the artist stays out of the app's display metadata.

**What ships is `rhythm-down`, `rhythm-down-metronome` and — since
2026-09-18 — `full` and `full-metronome`, for the two snippet songs** (the
old list here also named `no-gtr`, `drums-only` and `slow-<bpm>` as "in use",
and none of those has ever existed in `audio/`). That is 28 files: six songs,
some at two tempos, plus four mixes each for Seven Nation Army and "the
cure". A snippet song wants all four: `full` alone gives the Guitar toggle,
and `full-metronome` is what stops it fighting the Metronome toggle. Every slow tier is the same master time-stretched, so its grid is
the fast one's scaled by the tempo ratio — checked on two songs to three
decimal places. The other four names stay reserved for when something is
really exported; don't cite one as available without listing `audio/` first.

**`rhythm-down` means the part the student is learning is turned down**, so
they supply it — deliberate and course-wide. The cost is that a student has
nothing to check themselves against, and on Seven Nation Army that was total:
the riff IS the turned-down part, so ca-10's play-along was drums and bass
with a riff-shaped hole. The `full` pair fixes it per song; see the Guitar
toggle under the snippet section.

**Moises names its exports by the pitch it DETECTS** in the record, so the
source files in Drive read 441/442/443 Hz; what lands in `audio/` is the
440 export. Jonathan makes these himself and has confirmed the Seven Nation
Army pair (2026-09-18).

**Don't try to infer that from file size** — every track here is CBR 320 or
192, where size is duration times bitrate and nothing else, so a 440 export
and its 442 source of the same length weigh exactly the same. A 2026-09-18
session read that coincidence as evidence the files had only been renamed.
It isn't evidence of anything.

The rule that does matter: **never pitch-correct one file on its own.** A
uniform library costs students a few cents against the tuner; one mix
corrected and its twin not is audible every time the Guitar toggle is
pressed. And correct by SHIFTING, never resampling — a resample changes the
length, so the two mixes drift apart as the loop runs and 1ak fails the push.

**Every track ships at A=440** — `tuner.js` is hardcoded to A4=440Hz, so a track
mastered at any other reference will sound out of tune against it. Export at 440
from Moises; ffmpeg/rubberband only as fallback.

**And as mp3, at 320k.** Moises will hand you `.m4a`; `sw.js`'s `AUDIO_RE`
and the audio fingerprint both accept it, so it would have worked — but a
2026-09-18 m4a pair was re-exported as mp3 on Jonathan's call, to keep one
format and one bitrate across `audio/` rather than have the Guitar toggle
step between codecs. (The one bitrate is aspirational: the existing
rhythm-down set is 320k except "the cure" at 120bpm, which is 192k.)

## Settled song facts — do not re-flag in audits

**Don't verify tempo/BPM claims in song audits** (Jonathan, 2026-07-31) —
check chords, keys, and capo claims only. BPM databases disagree with each
other and the site's tempo numbers are close enough for teaching.

- **All Along the Watchtower** — `Am–G–F–G` loop (power chords `A5–G5–F5–G5`).
  **Chorus: two beats per chord** (change on beat 3) — the version every teaching
  layer through Module 3 and the Journey page uses. **Verses: the root holds
  beats 1–3 and each G lands on beat 4** (Jonathan, 2026-08-06); Module 4's
  "real rhythm" step teaches that distinction by ear. The map's "Am–G–F" is
  shorthand. **The `neil-young-…` audio slug is CORRECT** — the play-along
  loop is built from Neil Young's 1992 Dylan-30th-anniversary performance,
  which the Journey page's history paragraph states outright. The slug names
  the source recording, not the song's credited writer. Don't "fix" it.
- **Sweet Child O' Mine** — verse `D–C–G`, **two bars each**, ~123–125 BPM. (Corrected
  2026-09-12 — content across module-2/3/5/7 and the Journey page is
  consistently "two bars each"; the old "full bar each" here was the outlier.)
- **Let It Be** — verse `C–G–Am–F`, **two beats per chord**, ~71–76 BPM.
- **"the cure"** — **FOUR felt beats per chord, one full bar** (track reads
  144 BPM but feels ~72). This line said "two felt beats per chord" until
  2026-09-18; every tab on the Journey page, every class activity and the
  snippet arithmetic all say four, and the snippet loops were confirmed
  against the record by ear, so this was the outlier. At two beats a chord
  would be 1.67 s and every snippet window would be half the length it is.
  Tell students "big slow beats, about 72."
  **The verse and the chorus are EIGHT bars each** (Jonathan, 2026-09-18) —
  verse `Am · C · Am · C`, then `F · C · F · C`; chorus `Dm · F · C · G`,
  played twice. **The chorus IS the four-chord loop played through
  twice** — corrected 2026-09-22 from Jonathan's two Moises chord charts
  (key Bb minor as recorded; the site's no-capo arrangement stays), which
  read Dm F C G straight through, twice. The 2026-09-18 reading here —
  `Dm · F · Dm · F`, then `C · G/B · C · G/B`, each pair playing twice
  before the next — was wrong. The last chord is a plain G; G/B survives
  only as a Module 5 Level up (the record's bass walks B under that
  chord), never the main line. Layers 3, 5 and 6 of the Journey page
  showed the four-bar shorthand until 2026-09-18, while Layer 2 and
  ca-13 / ca-18 / ca-19 had it right — a student following the backing-track
  loop would have heard the disagreement. **Modules 3, 5 and 8 still carried
  the four-bar verse in playable data until 2026-09-18** (module-3's
  power-chord tab, module-5's `playSeq`, module-8's fingerstyle tab, plus
  three prose lines) and were rewritten to eight; Jonathan's call was to
  match the record rather than relabel the loop.
  **SECTION ORDER ON THE BACKING TRACK, measured off the mp3 2026-09-18:**
  intro bars **1-4**, verse bars **5-12**, the verse **AGAIN** bars
  **13-20**, chorus bars **21-28**. The verse plays twice before the first
  chorus — so a snippet window meaning "the chorus" starts at bar 21, and
  bar 13 is the second verse, not the chorus. (ca-18 step 4 sat at 13 for a
  day: the band played `Am-C-F-C` under a student reading `D-F-C-G`.) The
  Journey page's own song map reads "Verse → Chorus → …" and omits that
  repeat; it is a section list, not a bar grid. Anything placing a window by
  section has to be measured, not inferred — checks.mjs 1ak deliberately
  does not guess at `fromBar` (see its comment).
  No capo, by design. **Module 12's fingerpicking-as-native-style framing stays**
  (Jonathan's call, 2026-07-31): the record's guitar is rapidly strummed, but
  the fingerstyle arrangement and its ◐-comes-off lesson are a deliberate
  teaching arrangement — don't flag it against the record. Same for the single
  Am–C–Dm–F+G/B loop (a composite of the record's verse and chorus).
- **Luna** — F–Am vamp; Dm is a passing chord, no C; 6/8 felt in 2; no capo
  (simplified F `xx3211` until Module 7); solos use D minor pentatonic Pattern 1
  at fret 10; ◐ in Module 3. Its Module 4 `backingUrl` stays the generic YouTube
  Dm jam loop by design — the local mp3 is the Journey-page track.
- **Core songs are exactly six**: Seven Nation Army, Watchtower, Sweet Child,
  Luna, Let It Be, "the cure". The six `tabs/` Journey pages cover them
  completely — don't flag others as missing. Oye Mi Amor and "Está Dañada"
  (Iván Cornejo) are Choice songs.
- **"Tu Boda" was removed site-wide 2026-08-07** — its lyrics describe violence
  against the bride at her wedding and drew femicide-advocacy criticism in
  Mexico. Don't reintroduce it. **"Está Dañada" (Iván Cornejo) took its slot**
  in Modules 6, 7, 8, 12 and now anchors m12w3-s2's requinto challenge (E major
  / C#m, no capo; the intro is a fingerpicked single-note line that slides on
  the thin strings).
- **A Choice song may anchor a graded skill** — `core: false` is not a bar.
  m12w3-s2 ("Está Dañada") and m12w1-s6 ("House of the Rising Sun") both do.
  "Core" means *threaded through the course with a `tabs/` Journey page*, not
  *the only songs a skill may name*. Don't flag it as a defect.
- **Step `skills: [n]` resolves to the id SUFFIX, not the array position**
  (`stepSkillIds` in `app.js`), and skill progress is keyed by `skill.id`. So
  removing a skill and leaving a numbering gap is SAFE; renumbering the
  survivors would silently reassign students' stored check-offs. Removing a
  *section* is the destructive one — `${setId}-${station}-sec${gi}-${i}` is
  positional, so every later section in that station shifts.
- **Solo work uses YouTube jam tracks, not the course mp3s** — the mp3s are
  rhythm-stripped so the student plays the rhythm part. Local mp3s stay the
  play-along tracks on Journey pages.
- **Module 8's "6/8 = six beats to a bar" is correct as taught** (Jonathan's
  call, 2026-07-31). It coexists with Module 12's "six eighth notes grouped
  into two big beats" and Luna's "felt in 2" — count-in-six and feel-in-two are
  the same meter at different zoom levels, not a contradiction. Don't flag.
- **Module 5's assessment intentionally skips E/B7** (Jonathan's call,
  2026-07-31). Group 3 is covered by the mr5-s5 review check; the assessment
  piece stays on Let It Be / Luna / "the cure". Don't flag.

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
