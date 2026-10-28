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
   in English and Spanish (about a minute).
4. Changed what a student SEES (a renderer, a colour, a new control, or
   directions that describe the music)? Before reporting:
   - Screenshot every state at 1366×657 — before, during and after any
     highlight or toggle — and look at each one.
   - A sentence that states a pattern across the data ("root in one bar, 5th
     in the next") → prove it with a script over all of it and report the
     count ("76 of 76").
   - A new control or default → pin the default in `checks.mjs` and make
     `tools/smoke.mjs` click it and reload.
5. New student-facing text → its Spanish twin, same edit. A new step field →
   both step renderers.
6. A student can see the change → a `CHANGELOG.md` entry, same push.
7. Hit a review trigger? Ask Jonathan **Fast or Reviewed** after the build —
   see "Fast or Reviewed" under the Triggers.
8. Right before pushing: `git fetch`, then `git log HEAD..origin/main`. After
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

**Stations B and C are merged in DISPLAY ONLY** (2026-08-27). A set renders as ONE step ladder (B's sections, a seam divider, then C's), but `stations.b` / `stations.c` and every progress key (`${w.id}-b-sec{gi}-{i}` / `-c-sec{gi}-{i}`) are unchanged — never "simplify" the data to match the display. **`gi` is the section's position after excluding only tuning-warmup sections (`storageSections()`); render-time hiding never renumbers it** (checks.mjs 1af). Renderer: `buildLesson()`; tab-panel suffix `LESSON_TAB` (still `'station-b'`); sections are addressed by `data-ns`. No "Station B/C" wording in student text — the mid-set card is **Checkpoint / Punto de control**, the end one **Wrap-Up / Cierre** (1n). **Only `m4w2` is shown as Part 1 / Part 2** (`partOne`, `partBreak`; 1ao pins the count at 1); display only, no key moves, a set is complete when the SET is. Resolvers `lessonParts()` / `lessonGroups()`; field docs in the schema comment at the top of `module-2.js`. Full text: `WORKFLOW.md` → "Moved from CLAUDE.md (2026-10-28)".

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

**Which session can push.** Claude Code on the web pushes normally (no `gh`; `checks.mjs --live` gets HTTP 403 there; it cannot delete branches). **Cowork sessions can't push** — never attempt it; ship a patch + `APPLY-<name>.md` pair as ONE zip. Full procedure, the `sw.js` `CACHE_VERSION` conflict rule and the hook details: skill `session-handoff`.

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

**Real-browser smoke test.** `node tools/smoke.mjs --baseline origin/main` boots the site in headless Chrome, walks every module and set in English and Spanish, and fails on any new JS error or inline handler that does not compile (Node 22+, Chrome; `--chrome <path>`). For renderer, escaping or many-file changes. Full text: `WORKFLOW.md`.

**Stop hook, git hooks.** `.claude/settings.json` runs `.claude/hooks/stop-checks.mjs` at the end of every turn that changed code; a real failure blocks the stop — **fix the cause, never loosen a check or add an allowlist entry**. Off switch `GC_STOP_CHECKS=0`. `.githooks/pre-commit` and `.githooks/pre-push` run the fast offline checks (`git config core.hooksPath .githooks`, done on both machines; pre-push exists because git skips pre-commit on merge commits). If a hook prints "skipping checks" it is a no-op — run `node tools/checks.mjs` by hand. Details: skill `session-handoff`.

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
**Open Chords is Module 4** (`module-4.js`, `m4w1`–`m4w4`, `mr4-*`); **Pentatonic is Module 5** (`module-5.js`, `m5w1`–`m5w3`, `mr5-*`). Saved progress IS moved, once per student browser (`swap45*` in `app.js`): **a doc without `migrations.swap45` holds only OLD-numbered data, a doc with it only NEW-numbered data** — `flushSave()` awaits `swap45Commit()`, `tabs/journey.js` writes `songReady` in the doc's own numbering, `teacher.js` remaps unmarked docs for display only. Don't remove one half without the others. `moduleOpenThrough` is per module NUMBER and was not touched. Prove later edits with `node tools/rule-zero-proof.mjs d0cd004`. The stale-tab gap, the by-hand repair and the rest: `WORKFLOW.md` → "Moved from CLAUDE.md (2026-10-28)".

### ⚠️ Sweep findings ratchet into checks.mjs
Any sweep or audit that finds **3+ instances of a mechanically-detectable error class** must add a permanent detector to `checks.mjs` in the same session — never leave one in a session scratchpad. Hand each parallel agent its check label before it starts (`grep -o "head('1b[a-z0-9]*\." tools/checks.mjs | sort | tail -3`). A check that only finds a call in the source proves nothing: make it render or execute the thing. A phrase detector must match the UNESCAPED string (`unescapeJs()`). Prefer a whitelist over a blacklist when the banned word has an innocent twin. **A ratchet that can't fail is not a ratchet:** break the guarded thing in a scratch copy and watch the check go red, then restore; pin meaningful totals. Worked examples: `WORKFLOW.md` → "Moved from CLAUDE.md (2026-10-28)".

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

Modules 3–6 giveaway rewording history (2026-09-19) and the full write-ups of the MC-giveaway ratchets **1at / 1au / 1av** and the 1w field-reader fix: `WORKFLOW.md` → "Moved from CLAUDE.md (2026-10-28)". Short version: the detectors live in `tools/checks.mjs` (each documented by its comment), **check a video's watch range before writing a question about it**, and a new authoring field needs adding to `STUDENT_VALUE_NAME_RE`.

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
`const DAILY5_ENABLED = false;` in `app.js` (read only by `ladderHtml()`) is the whole switch (Jonathan, 2026-09-19). Nothing was deleted — `buildDaily5()`, the `.daily5-*` CSS and the `daily5.*` i18n keys stay; `kind:'tuning-warmup'` sections stay hidden because `storageSections()` and every saved `gi` depend on it. History: `WORKFLOW.md` → "Moved from CLAUDE.md (2026-10-28)".

## Videos

- **Never invent YouTube IDs from memory** — even for famous songs or channels.
  Find via `WebSearch`, then verify via oEmbed
  (`https://www.youtube.com/oembed?url=…&format=json` → JSON for valid, 404 for
  dead). Batch verifications in parallel. If you can't verify one, drop the link
  rather than inventing it. (In May 2026 ~60 recalled URLs were 404s.)
- Pairing and creator-diversity guidance for watch-half videos: `WORKFLOW.md` (already verified creators: Lauren Bateman, Nikhil D'Souza, guitarraviva, David Casas).

## Lazy-loaded guidance — read before touching these areas
**Read the matching file before working in its area** — each holds ⚠️ rules as binding as anything here.

| Area | File | Critical rule kept here |
|---|---|---|
| Backing tracks, snippets, practice-card audio, Journey clicks, `playNote`, `audio/` | skill `audio-and-snippets` | Snippet windows are bars, never seconds; never measure a second anchor; never pitch-correct one mix alone; new "silence it" call → `stopCardAudio()`; **every backing track is levelled to "the cure" (−12.5 LUFS) with `python3 tools/loudness.py <slug>`, one gain per song — never re-level the cure** |
| In-Class Activities, the gate, exit checks, practice cards, Songs Core rows, render-time hiding, **the two step renderers, the activity board and numbering, the play-along-first song links** | skill `in-class-activities` | Exit-check `items` are positional — frozen once taken; don't fold "Play Along now" into `caIsVisible()`; take-to-song is switched off in every module (`TAKE_TO_SONG_ENABLED`) — don't delete the sections, they hold `gi` |
| Core/Choice song chords, keys, timing, bar numbers | skill `song-facts` | Don't re-flag settled facts; don't verify BPM in audits |
| Cloud-session pushes, Cowork patch-pair handoff, Stop/git hook details | skill `session-handoff` | Cowork can't push; the web can |
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
  AskUserQuestion), irreversible / outward-facing actions — deleting files,
  touching the live site — and the Fast-or-Reviewed question when a review
  trigger fires (see Triggers).
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
any effort level): a change hits a **review trigger** — an adversarial
reviewer on a pinned commit, subject to "Fast or Reviewed" below — whenever it
touches 3+ files, a danger-zone file (`teacher.js` config plumbing,
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
A guard that pins a new default or extends what an existing check reads (a
new field, a new colour, a new click in `tools/smoke.mjs`) needs only the
break-it proof — break the guarded thing in a scratch copy, watch the check go
red, restore — with the output pasted into the report; it doesn't count toward
the 3 either. A new KIND of check (a detector for a new error class, or a
change to an existing check's logic or matching) is a review trigger, for
`site-reviewer` (high), plus the break-it proof. None of this makes
`checks.mjs` a deep-review file. **Which reviewer** (2026-10-26):
`site-reviewer-deep` (extra high) for a danger-zone file or a 50+-string
sweep, `site-reviewer` (high) for everything else. For a danger-zone file
write the failing scenario before the fix. When a rule says "run the tool", run it — don't
substitute your own reading of the code. When an agent hands you a claim, read
the quoted lines yourself before acting; when it hands you a fix, make it
re-derive it on the real code.

**Fast or Reviewed — Jonathan picks, after the build** (2026-10-27; replaces
the 2026-10-26 "quick change" keyword). When a change hits a review trigger,
finish the build and every "Start here" step first — checks, rule-zero proof,
smoke test, the item-4 screenshot checklist — then ask with AskUserQuestion
before any reviewer starts:
- Lead with what was touched and what passed, one line each ("5 files,
  including the TAB renderer and colours · checks, smoke and screenshots
  pass").
- **Fast** — ship now. **Reviewed** — run the reviewer named above first
  (say it often takes 15–30+ minutes). Mark one "(Recommended)" with a
  one-line reason from the change itself ("changes what students see during
  play" vs "wording only").
- **Always Reviewed, not offered:** a danger-zone file, a new kind of check,
  a sub-agent sweep, or moving / adding / removing a section or step. Say why in one line and
  run the review instead of asking.
- **No trigger → don't ask.** Ship as usual.
- **No answer** (a scheduled or unattended session, or no AskUserQuestion
  tool) → Reviewed.
- "Quick change" / "quick fix" in Jonathan's request pre-answers **Fast** —
  don't ask, unless an always-Reviewed item turns up.
- Start a Fast report with "Fast — reviewer skipped."

This is a standing exception to "don't ask 'should I proceed?'" — the one
question that fires on its own.

**Effort per task.** Agents in `.claude/agents/` pin their own effort (auditor, fixer, `site-reviewer` high; `site-reviewer-deep` extra high). For a general-purpose agent pass `effort: "xhigh"` for a review the Triggers send to `site-reviewer-deep`, `"high"` for any other review, auditor or fixer; never `max`. Your own session: `medium` routine edits, `high` bug fixes / shipped JS / keyed-MC content, `xhigh` danger-zone files and sweeps — if the task is a tier higher than the session, say so and ask for `/effort`. Full text: `WORKFLOW.md`.

**Report the real numbers instead of accepting the premise**, and name the prior
decision a request would reverse — both have produced better calls than fixing
the literal complaint would have.

## Switching topics — prompt to start a fresh chat
When Jonathan raises a clearly new, unrelated topic, use AskUserQuestion to ask
whether he'd like a fresh conversation first: *"Looks like we're switching topics
— want to start a fresh chat for this, or keep going here?"* Once per switch, not
every message. Don't ask for natural follow-ups on the same topic.
