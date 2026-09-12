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
tagged `data-gate="keep"/"hide"` for the activity gate (1aa).

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

### ⚠️ A number in an activity title is a SERIES number, not `number`
`number` in `class-activities.js` drives the "#N - " prefix students see. A
digit inside the title counts within its own series instead: the first Finger
Gym is **Finger Gym 1** even though the class meets it as activity **#3**
(Jonathan, 2026-08-20). Don't "fix" `#3 - Finger Gym 1` — that's the intended
reading. What a series must be is contiguous 1..N in teaching order, EN and ES,
which checks.mjs 1l enforces; inserting one in the middle means retyping every
later title's digit plus any "same as Gym 1" / "del Gimnasio 1" cross-reference
in another activity's step text, in the SAME edit. Ids (`ca-<n>`) never move —
student progress is keyed to them. The teaching-order `number` can also be
resequenced from the teacher console (type over the `#N` in the Class
activities table) — that writes `config/class.activityNumbers` as
`{ id -> { n, base } }` and expires by itself once the new order is folded
into `class-activities.js`, same `base` rule as a console rename.

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
`app.js`. Since 2026-09-04 the 63 Journey tabs use the same markup the app
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

## Live quiz — the whole-class game

All of it is in `live-quiz.js`: the quiz bank, the student overlay, and the
teacher's projected stage (`?teacher=true` → **Live quiz**). One game runs at
a time, in `liveQuiz/current` (+ an `answers/{uid}` subcollection).

- **The teacher is the only judge.** There is no answer key in the bank —
  Jonathan marks the correct choice at reveal time. That's deliberate: the
  dashboard is on the classroom projector, so anything the app knew in
  advance would either spoil the round or need hiding from the room.
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
marks a correct student wrong. Checks take no `#N` number: `caNumberMap()`
skips them, which covers `caNumber` and `teacherActivityNumbers` at once, and
`teacherSetActivityNumber()` filters them out of its whole-list rewrite. No
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

- **Seed the MC shuffle on language-stable data.** `ecChoicesHtml` seeds on
  the `fret·note` pairs, never the rendered chip labels — "fret 5 · A" and
  "traste 5 · A" would hash differently and deal one student a different
  order per language.
- **The `noteName` board is drawn with `theme:'web'` plus the dark-mode
  invert**, not on CSS variables: its fretted-note circle is a hardcoded
  light green, so a variable-themed `?` would be light-on-light in dark mode.

## Today page & the activity gate
Work order: "Today-first site simplification," Phase 1, shipped 2026-09-12.
"In-Class Activities" is renamed **Today** (`nav.classActivities` — same i18n
key, same hash `#class-activities`, same deep links) and is the site's home
page: `showApp()` opens it whenever the URL carries no explore hash at all,
gated or not. `renderClassActivities()` (app.js) builds three groups —
**Do now** (the first pending card, forced open), **Still to do** (a divider,
skipped when there's only one card left), **Earlier** (`ca.finishedGroup`,
now "Earlier" not "Finished") — and appends the resume card
(`renderResumeCard()`) at the end when nothing is blocking. The `#resume-card`
element itself moved in `index.html` from a sibling of `#week-panels` into
the Today page's own body; it no longer renders in the module/set view at
all.

**The gate:** `caBlockers()` — a visible (`caIsVisible`), undone
(`classActivities[id]!==true`), uncleared activity or check — drives
`body.ca-gated` via `applyActivityGate()`. Teacher/dev bypass are gate
previewers (`isGatePreviewer()`) and never see it; a failed progress load
(`progressLoadFailed`) also reads as "nothing blocking" — never lock on a
guess, same rule as the sequential set gate. `applyActivityGate()` runs from
`showApp()`, at every exit of `loadClassConfig()`, and inside
`renderClassActivities()` itself (so a completion or an exit-check submit
lifts it live, no reload). CSS keys the hiding off `data-gate="hide"` on
every rail `.nav-btn` except Today and Live quiz (`data-gate="keep"`) —
checks.mjs **1aa** fails the push on a nav button with neither — plus
`.g-module`/`.g-set`/`#resume-card`/`#week-panels`; `#search-btn` needs
`!important` because `showApp()`/sign-out already toggle its inline
`style.display`. `routeExploreHash()` rewrites any hash but `#class-activities`/
`#live-quiz` back to Today with a `gateToast()` while gated (`returnToPractice()`
gets the same guard); `window.__forceGate` (localhost only) lets a session
that can't otherwise trigger the gate (dev bypass, the teacher account) force
it on to check the UI.

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

**Journey pages gate too.** The six `tabs/*.html` pages now also load
`class-activities.js` (a plain data array, no dependency of its own) so
`journey.js` can compute the same blockers after its own Firestore boot
(`journeyIsVisible`/`journeyBlockers` — deliberately NOT shared with
app.js's `caIsVisible`/`caBlockers`, which read globals only the main app's
boot path populates) and, on a hit, replace the whole page with a
`.ca-gate-card` (styles in `tabs/journey-theme.css`, no `styles.css`
counterpart — the main app's gate stays on the existing Today page rather
than a full-page swap) linking back to `index.html#class-activities`. Skipped
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

**Gate flips on mid-session → Today.** `applyActivityGate()` detects the
off→on transition (a new activity going live under an open Games/Songs/My
progress screen, via the `visibilitychange` re-check) and, once the app is
on screen (`appIsOnScreen()`), walks the student to Today with the same
toast `routeExploreHash` uses. The CSS alone only hid the rail; an open
screen stayed open.

**What a gated student can still open is one list — `GATE_OPEN_HASHES`**
(`#class-activities`, `#live-quiz`, `#assessments`) — read by
`routeExploreHash`'s guard and the flip redirect; it mirrors the
`data-gate="keep"` buttons in the rail (1aa). Add to both or neither.

**Assessments page (2026-09-12, Jonathan's ask):** `#assessments`, rail
button after My progress, `data-gate="keep"` — a student can always read
what each module's in-person assessment asks for. `renderAssessments()`
builds one `<details>` per `MODULE_MANIFEST` entry, the current module
(`assessCurrentModuleNum()`, from `lastSetId`) open and tagged, each body
the module's `assessItems` from `MODULE_REVIEWS` — the same list the Module
Review's heads-up pop shows, read-only, plus the `review.assessSignupBody`
line. Module data is lazy, so an accordion fetches its `module-N.js` on
open (`assessEnsureModule`). Its Back goes to Today while gated
(`closeAssessmentsScreen`), to practice otherwise. Same page plumbing as My
progress (EXPLORE_PAGES row, closeTopPanels, leaveTopPanelForSet,
gc-langchange re-render).

**Phase 2 (nav collapse), shipped 2026-09-12:** the rail is five items (six
since the Assessments page above) —
Today · Practice · Songs · Games · My progress, no "Explore" heading (the
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
place of its steps), `routine`/`ear-spark`/`reflection` (the section is
skipped entirely — "My Practice Routine", "Ear Spark — optional ear bonus",
"Checkpoint"/"Wrap-Up"). **Kind-ONLY matching, deliberately NOT kind-or-title
like `isTuningWarmupSection`** — `isEarSparkSection`/`isRoutineSection`/
`isReflectionSection`/`isTakeToSongSection` in app.js check `sec.kind`
alone: these four titles repeat across nearly every module, so a title
fallback would hide every module's copy the moment the code shipped, not
just Module 2's. A step-level `hidden: true` flag (song previews now taught
by a class activity) works the same way, no title involved.

**`visibleSteps(sec)` / `visibleSections(station, moduleNum)`** (app.js) are
the one gateway everything student-facing reads through — `buildLesson()`,
`resumeLessonCounts()`, `buildSearchIndex()` (checks.mjs **1ac** requires
the call). The one deliberate exception is teacher.js's `setShortResponses()`:
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
the keys). Every other hide — routine / ear-spark / reflection, a
`take-to-song` section with no Journey layer for that module (6+), a section
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
kebab-case; the artist stays out of the app's display metadata. Mixes in use:
`rhythm-down`, `rhythm-down-metronome`, `no-gtr`, `full`, `drums-only`,
`slow-<bpm>`.

**Every track ships at A=440** — `tuner.js` is hardcoded to A4=440Hz, so a track
mastered at any other reference will sound out of tune against it. Export at 440
from Moises; ffmpeg/rubberband only as fallback.

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
- **Sweet Child O' Mine** — verse `D–C–G`, **full bar each**, ~123–125 BPM.
- **Let It Be** — verse `C–G–Am–F`, **two beats per chord**, ~71–76 BPM.
- **"the cure"** — `Am–C–Dm–F` + `G/B` turnaround, **two felt beats per chord**
  (track reads 144 BPM but feels ~72). Tell students "big slow beats, about 72."
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
