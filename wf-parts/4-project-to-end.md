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


### Pre-push checks (old CLAUDE.md lines 110,141)

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


### Parallel sessions (old CLAUDE.md lines 142,154)

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


### Three regimes (old CLAUDE.md lines 155,210)

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


### Ratchet, activity board, config writer, manifest (old CLAUDE.md lines 214,236)

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


### i18n (old CLAUDE.md lines 243,280)

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


### Content rules (old CLAUDE.md lines 281,364)

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


### Quiz answers and keyed MCs (old CLAUDE.md lines 373,412)

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


### Play-along first, firestore.rules, Daily 5 (old CLAUDE.md lines 413,432)

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


### How to work with Jonathan (triggers, Fast or Reviewed, effort) (old CLAUDE.md lines 459,556)

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
  touching the live site. A review trigger no longer asks — see "Fast by
  default" under Triggers.
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
reviewer on a pinned commit, subject to "Fast by default" below — whenever it
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

**Fast by default; a Friday check reviews it** (2026-10-31; replaces the
2026-10-27 "Fast or Reviewed" question, which replaced the 2026-10-26 "quick
change" keyword). When a change hits a review trigger, finish the build and
every "Start here" step — checks, rule-zero proof, smoke test, the item-4
screenshot checklist — then:
- **Always Reviewed, same day, never Fast:** a danger-zone file, a new kind of
  check, a sub-agent sweep, or moving / adding / removing a section or step.
  Run the reviewer named above. These are the changes that can lose student
  progress or break the live site, where a week's wait means the damage is
  already done.
- **Everything else ships Fast — don't ask.** No reviewer. Every Fast commit
  ends with the trailer line `Review: Fast` (above any Co-Authored-By), and
  the report starts "Fast — reviewer skipped; Friday check will review it."
- Jonathan says "review this" / "Reviewed" in the request → review same day.
- **No trigger → no trailer.** Ship as usual.
- **Friday check:** a scheduled cloud task, Fridays 11:00 PM Pacific, runs
  skill `friday-check` — `site-reviewer` on every `Review: Fast` commit since
  the last `friday-check-*` tag, fixes pushed to `main`; an always-Reviewed fix (e.g. coach.js)
  goes on a branch, gets `site-reviewer-deep` rounds automatically (2026-11-07, Jonathan: reviews
  happen on their own) and is merged to `main` in the same run once a round finds nothing real
  (it waits only after 3 rounds or on a product call); content calls to Open work, then a new dated tag.

**Effort per task.** Agents in `.claude/agents/` pin their own effort (auditor, fixer, `site-reviewer` high; `site-reviewer-deep` extra high). For a general-purpose agent pass `effort: "xhigh"` for a review the Triggers send to `site-reviewer-deep`, `"high"` for any other review, auditor or fixer; never `max`. Your own session: `medium` routine edits, `high` bug fixes / shipped JS / keyed-MC content, `xhigh` danger-zone files and sweeps — if the task is a tier higher than the session, say so and ask for `/effort`. Full text: `WORKFLOW.md`.

**Report the real numbers instead of accepting the premise**, and name the prior
decision a request would reverse — both have produced better calls than fixing
the literal complaint would have.




## Power Chord Switch: where we stopped (moved here from NEXT-STEPS-power-chord-switch.md, 2026-11-05)

Jonathan moved this file into WORKFLOW.md and deleted it. The room-noise decision was made on 2026-11-05
(a stricter strum ratio for Power Chord Switch only, see "Decision (2026-11-05)" below). The practice-minutes heartbeat removal is
finished: his console paste and the emulator run (49 passed, 0 failed) are both DONE; only the
the old `heartbeats` and `minutesBoard` collections were deleted in the console on 2026-11-05; only the console's
`heartbeats` composite index is left (optional, see "Practice-minutes heartbeat removal" below).
Settled and not to be re-raised: the 30 s cap, the real-guitar mic check, the three wordings,
no Note Runner mic check. The original title read "Power Chord Switch — where we stopped (2026-11-03)".

> **STATUS (2026-11-04): shipped.** The branch `pcs-pending-smoke` was merged into
> `main` on 2026-11-03 (merge commit ca932f2): smoke on the merged tree was clean
> against the origin/main baseline, the full checks passed, and Jonathan
> published `firestore.rules` (take id `(coach|nr|pw)`). The same day a second
> change landed (e5e0bef): a Stopped game with at least 10 s of audio is saved (2026-11-07: now 10 s of PLAY after the first count-in ends)
> too, with `complete:false` in the take (a shorter Stop, or leaving the screen,
> still drops it). Nothing is open except watching the next takes (Next steps, item 3).
> The branch `pcs-pending-smoke` can be deleted on GitHub.

Read this when Jonathan asks "what are the next steps for the Power Chord
Switch activity". It is the hand-off from the session that built the changes
below. Delete or rewrite it when the list is done.

### What shipped in this push

1. **Song switches replace the whole-song buttons** (`coach.js`
   `CC_POWER_PROGRESSIONS`, group `song`). One activity per distinct switch in
   the song's card: Sweet Child O' Mine 10 (ca-33), "the cure" 6 (ca-30).
   Each is a **ladder**: 3 rounds of 4 back-and-forths (8 chords), 15 BPM faster
   each round (60 / 75 / 90 from the base tempo; since 2026-11-05 5 BPM faster, 30 / 35 / 40 from the new 30 BPM
   start, Jonathan: "don't increase it so quickly"), a 4-click count-in before each
   round. Jonathan's words: "practice the actual chord switches in the songs by
   going back and forth between each change 4 times at slower to faster tempos."
2. **BPM buttons on the play screen** (−5 / +5, under the beat dots): they move
   the rounds still to come, not the round being played; off in round 3.
3. **Choices layout:** the pairs view keeps five columns (the fifth, Songs, has
   one button per song). A song button opens the **songs view** (all that
   song's switches, with a "◀ Pick different chords" back button at the top of the left column since 2026-11-05; it was a "Chord pairs" pill in the list). All 16 next to the pairs was
   881px tall on a 657px screen.
4. **Saved student audio** (`micRecStart('pw')`): same consent flow as the
   Listening Coach and Note Runner (one question per device, the red "Recording
   this take" label on every screen of a take, saved when a game is played to
   the end, and also when it is Stopped after at least 10 s of play (counted from the first count-in's end; was audio length until 2026-11-07)
   (`MICREC_MIN_STOPPED_SEC`, 2026-11-04; the take says `complete: false`;
   a shorter Stop is dropped so a stub never overwrites a full take; leaving
   the screen still drops it); never for Change Up). One capture covers all three rounds and is
   cut at the existing 30-second cap. Jonathan said **no on/off button**: none
   was added. The label still carries the existing small "Stop saving my takes"
   link (the consent opt-out the other two games have). Remove it from the
   Power Chord Switch screens only if Jonathan says so.
5. **Clearer feedback, on the done screen and while playing.** Done screen:
   every chip has a symbol (✓ right, ✗ on time but the chord sounded wrong, –
   no strum heard) and a line counts them. Play screen: a big line under the
   beat dots after every graded change ("✓ C5 — right" green, "✗ C5 — wrong
   chord" amber, "– C5 — no strum heard" red; `ccShowLast`, `.cc-last`; the row
   is always drawn so nothing jumps). Jonathan: "I didn't see the power chord
   switch giving clear feedback about misses and correct notes" and "make the
   in game feedback bigger".

Checks: `tools/checks.mjs` section **1ck** was rewritten (every switch against
its card, the three rounds run, the BPM buttons, recorded takes, the feedback
line); `tools/smoke.mjs` walks all 16 switches in a real browser.

### Done in the Firebase console

- `firestore.rules` with the `-pw` take id was published by Jonathan (per the
  merge commit message, 2026-11-03). Still worth one look: teacher console →
  Mic recordings should list a Power Chord Switch take once a student who said
  yes has played a game to the end (or stopped one after 10 s). Mic collection
  has to be switched on there for any take to be asked for or saved.

### Tempo controls (Jonathan, 2026-11-05: "bpm more controllable by user ... prior to starting and during it")

Power Chord Switch only; Change Up keeps its −5 / +5 and has no slider, no live tempo. Range 10..140 (floor lowered from 30 on 2026-11-05, Jonathan; it still OPENS on 30; the 140 maximum stays, he considered 80 and said keep 140); the console evaluator's limits (`BPM_MIN` in `micEvalTakePw`) are the same 10..140.
- **Setup** (`ccRenderSetup`, `ccSetBpm`): the old −5 · tempo · +5 row, and under it a 10..140 slider in steps of 5 (`ccSetBpm` snaps to a
  multiple of 5). Jonathan first got −1 / +1 too and then dropped them ("just by 5s is fine"): no ±1 button anywhere (1ca fails if one returns).
  The group must stay no wider than the old row (the Spanish speed group leaves about 6px); a row of five buttons once wrapped the tempo under the
  speed row and the setup grew to 732px. "Best today" moved from under the tempo to under the speed buttons (`.cc-best-line`, still always drawn).
- **Play** (`ccLiveBpm`, play screen only): −5 · tempo · +5 under the charts. The grid is re-anchored (`cc.listenStart`, gridOffset held) so the beat the
  student is on does not move; changes still to come get a new `t` and `bpm`, graded ones keep theirs. A song switch's later rounds move by the same
  amount (so +5 then −5 changes nothing); the round being played stops where round 3 would pass 140 (a base of 130 cannot be sped up); the Next-round buttons
  (`ccNudgeNext`) still move only later rounds. A song switch's play and count-in screens have shorter charts (`.cc-ladder-play`) because there are two button rows.
- **Scoring:** a round counts at its LOWEST tempo (`cc.roundLow`, `ccRoundBpm`), in `stageLog`, `ccScoreBpm` and the done screen's "Again" tempo. A pair's "Again"
  starts from that lowest tempo; a song switch's from round 1's counted tempo (`stageLog[0].bpm`), not the setup's. A pair also remembers the live tempo for
  the next visit to the setup.
- **Saved takes:** `bpm` / `stageBpms` are the tempos each round STARTED at; `tempoChanges` lists every live change (`t` on the take's clock); each change of a
  round that had one carries `retimed: true`. The console's replay (`micEvalTakePw`) leaves those rounds out and counts them in `notes.retimed` (its own
  sentence: "the student changed the tempo while playing"; not `ignored`, which means impossible data) because it assumes one tempo per round. Takes saved
  before this have none of these fields and read as before. No `firestore.rules` change. The take list's BPM column shows the START tempo only.
- **Proofs:** `checks.mjs` 1ca runs the setup controls and the live change on a stubbed clock (32 counted assertions, pinned): the beat does not move (also with a
  gridOffset), 10..140, the lowest tempo, shifted and capped rounds, a song switch Stopped in round 2 (ccFinish), only some rounds retimed, a second game starting clean,
  the take's fields through the real `micRecSaveNow` (run up to its dev-bypass log), the done screen's base tempo. 16 mutations were run against it in a scratch copy
  (2026-11-05, results in the commit message). 1cl has crafted retimed takes (a pair, and round 1 of 3). `smoke.mjs` clicks the setup buttons and slider (EN + ES,
  1366×657) and the live buttons in a pair and in all 16 song switches.
- **Open, not decided (reviewer, 2026-11-05):** a pair started at 30, sped to 90 and played well offers "Again at 35" (the lowest tempo it ran at) while the setup
  reopens on 90. If the student's own tempo should count instead, `ccRoundBpm` is the one place to change. The re-anchor holds the beat position AFTER removing
  gridOffset; if gridOffset is really a constant mic lag a very large one-burst change (30 to 140) can cost a change; one ±5 tap costs under 12 ms.
- **Choice columns (Jonathan, 2026-11-05):** the computer's pick, Songs, then low E / A string / jump (`CC_POWER_GROUPS`, display order only; `CC_POWER_PROGRESSIONS` keeps songs at its END so remembered picks hold). 1ca pins the order on the data and on the drawn screen, EN + ES.
- **A stale smoke assertion was fixed on the way:** the song-switch walk still expected the old 15 BPM step (80 / 95); it now expects 5 (70 / 75).
- **One way back to the chords (Jonathan, 2026-11-05: "consistent and at the top and more obvious"):** `pwBackBtnHtml` draws one bold 44px
  `.cc-back-btn` "◀ Pick different chords" (`games.pw.pickDifferent`) first on the done screen (above the verdict; it replaced the bottom
  `.cc-change-loop`) and at the top of the songs view's left column (it replaced the in-list "Chord pairs" pill; `games.pw.view.pairs` deleted).
  The pairs view has none, so the speed and tempo sit 52px lower on the songs view than on the pairs view. Change Up's button is unchanged.
  1ca renders and runs it (16 screens, EN + ES); smoke measures and clicks it.

### Next steps (rewritten 2026-11-05; the list Jonathan chose on 2026-11-04 is done)

(The separate step-by-step plan file for a fresh chat was deleted on 2026-11-04 at
Jonathan's request; this list is the plan.)

1. **Saved takes arrive: DONE.** On 2026-11-04 "Evaluate all recordings" in the teacher
   console read 25 saved takes, 12 of them Power Chord Switch (results below, "First
   real-take results"). If a class ever shows none: the rules paste first (`micTakes` and
   `chunks` must say `(coach|nr|pw)`), then mic collection on in the console, then the
   student's consent answer (asked once per device).
2. **The evaluator for Power Chord Switch takes: DONE.** `micEvalTakePw` (teacher.js,
   check 1cl) was built 2026-11-04, proven on synthetic takes (`tools/mic-sim/fake-pw-take.mjs`)
   and then run on those 12 real takes. For each saved take it compares what the site graded
   (`expected`, `events`) with what is in the audio, per round: strums the game missed,
   "right" changes with no strum, and the mic delay from the three count-ins (about -73 ms on
   Chromebook internal mics).
3. **DECIDED 2026-11-05: room noise scores a right chord.** Jonathan chose the stricter strum ratio for Power
   Chord Switch only (2.2 / 2.67 from 2026-11-05, 1.8 / 2.19 from 2026-11-07; "Decision (2026-11-07)" below). Not chosen: "no readable pitch, no tick" (the
   console's "Pitch-rule what-if" table prices it from takes saved after 2026-11-05, if it is ever wanted). To do:
   look at the next takes (see "Where things stand" → to watch). Any further change to how a strum is heard is a
   `coach.js` detection change: xhigh, Always Reviewed, run `tools/mic-sim/power-switch.mjs` first.
4. **Nothing else is waiting.** Settled and not to be raised again: see "Later (not chosen
   yet)" below (the 30 s cap, the real mic check, the three wordings, no Note Runner check).

### Practice-minutes heartbeat removal (not Power Chord Switch): DONE 2026-11-05

Jonathan asked for this note here so it is not lost; it is finished. The full history is the "PICK UP HERE"
entry under "Practice minutes" (Open work). In short: "N playing" is gone from the screen and the engine no
longer writes a `heartbeats/{sessionId}` record.

- **Code (live since 2026-11-04):** the writer, `pollLive()`, `S.live` / `S.liveAt` and `liveMinCount` are gone from
  `practice-minutes.js`; counting, `flush()`, the queue and the keepalive did not change (`5144c6c` and its review fixes).
- **Repo (2026-11-05):** the `heartbeats` rules block, its index in `firestore.indexes.json` and its section in
  `tools/pm-rules-test.mjs` are gone; check 1cg requires them to stay gone, exactly one `match /databases/{database}/documents`
  wrapper, and no shipped page or script naming a `heartbeats` collection. Reviewed the same day (`site-reviewer-deep`).
- **Console (2026-11-05):** Jonathan published the new rules; the emulator test passed against them (the two "heartbeats is
  gone" cases; the whole file is 179 cases now); the old `heartbeats` collection and the old `minutesBoard` collection were
  deleted (the console's "Delete collection", typing the name to confirm).
- **Still there, optional:** the console's `heartbeats` composite index (Firestore, Indexes tab: the only index, fields
  `period`, `lastSeen`, `__name__`, Enabled). Nothing queries it. A session tried to delete it on 2026-11-05 and the click was
  blocked as an irreversible deletion nobody had named, so it is Jonathan's to delete by hand (⋮ on its row, Delete) or to leave.

### Open finding (Jonathan, 2026-11-04): room noise scores a right chord

**Status 2026-11-07: changed again to 1.8 / 2.19** (see "Decision (2026-11-07)" below, written before "Decision (2026-11-05)"). **Status 2026-11-05: DECIDED** (a stricter strum ratio for Power Chord Switch only; see "Decision (2026-11-05)" below). The text under this heading is the history.

Jonathan played with no guitar and the game showed "right". Cause, read in the code
(`ccLoop`, `ccResolvePend`, `coach.js`): any loudness jump above a very low floor
(`CHK_ONSET_FLOOR` 0.003, HF 0.0008) is a "strum"; at the default every-beat 60 BPM each
change's window is +-500 ms, so a noise anywhere lands in one; with fewer than 3 pitch
readings the change "counts on timing alone" and is graded `ok`. A real low-E strum also
gives under 3 readings, which is why it is lenient on purpose. The game's own count-in
beeps are not the cause (grading starts after them). **Jonathan chose to MEASURE before
changing anything:** the false-hit number in the console's Evaluate-all (a change the site
graded right where the audio has no strum) on real student takes. Then choose between
"no readable pitch, no tick" (real low-E strums turn red) and a higher onset floor (soft
strums missed). Both touch `coach.js` detection: Always Reviewed, run
`tools/mic-sim/power-switch.mjs` first. Collection needs a real non-teacher account (the
teacher and the dev bypass never record), and the "stop after" number raised above the
count (23 of 40 on 2026-11-04; Coach and Note Runner takes count too).

#### First real-take results (2026-11-04, "Evaluate all recordings": 25 takes, 12 of them Power Chord Switch)

- **9 PCS takes: the site and the audio agree.** 14 false hits out of 141 changes. The
  site-vs-recording offset is steady at about -73 ms on Chromebook internal mics.
- **3 PCS takes hold 38 of the 52 false hits.** The site heard a strum at almost every
  change, but the recording has only 5-8 strum attacks in 21-30 s. This is the room-noise
  finding above, measured: it is a few rooms (or mics), not every take.
- **The strum what-if on those 12 takes (read from Jonathan's `mic-eval-2026-11-05.json`, 2026-11-05;
  186 changes judged, 52 false hits, 132 real strums).** At the site's own ratios (1.4 / 1.7) the replay
  gives the site's yes/no on 183 of 186 changes, so it can be trusted. Stricter ratios, false hits removed /
  real strums lost: **1.8 / 2.19: 14 / 1; 2.2 / 2.67: 30 / 4; 2.6 / 3.16: 38 / 9.** The 3 noisy takes (T01,
  T10, T12) hold 38 of the 52 false hits; at 2.2 they lose 26 false hits and **0** real strums, at 2.6 they
  lose 30 and 1. The real strums lost are in the other takes: at 2.2 in T06 (1), T08 (1) and T11 (2); at 2.6
  also in T03, T04 and T09. So a stricter ratio mostly helps the noisy rooms and costs the soft strummers
  in the clean ones. "Lost" means the replay no longer hears the strum, so the game would grade that change a
  miss. 12 takes, 3 of them noisy: a small sample. Not decided (Jonathan's call). The zip of all 25 takes is
  in Jonathan's Downloads (`mic-recordings-2026-11-05.zip`, 12 of them Power Chord Switch, none with pitch readings).
- **A higher absolute onset floor is ruled out:** 48 of 52 false hits AND 55 of 132 real
  strums are under 15 dB above the room floor, so any floor that removes the noise removes
  the soft real strums too.
- **"No readable pitch, no tick" reaches only part of it.** It can touch only the 34 false
  hits graded right. The other 18 were graded wrong, which already needs 3+ readings. What
  it costs real low-E strums could not be measured from these 12 takes (they carry no pitch
  readings). Takes saved from 2026-11-05 on do: see "Pitch readings in the saved take" below.
- **Lead (tested by the what-if below):** the site's rule (`ccLoop`: full-band
  `rms > CHK_ONSET_FLOOR && rms > smoothRms * CHK_ONSET_RATIO` 1.4, or the HF channel
  `* CHK_HF_RATIO` 1.7) fires on a ~3 dB jump. The evaluator's onset finder
  (`micEvalSignal`: HF jump > 2.2x its base and > 4x the take's HF floor) found the real
  strums in the 9 good takes and almost none in the 3 bad ones. Two different channels:
  room rumble, voices and thumps jump the full-band level but not the pick-attack channel.
- **Coach / Note Runner takes had a second problem** (fixed in the same push): 42 of 64
  Note Runner notes sat past the 30 s cap, and `micEvalTake` measured them as silence
  (median level -141.6 dB). A note whose window runs past the end of the audio is now
  `dropped`, not judged (`notes.dropped`; the console says how many), the same rule as
  for a Power Chord Switch change.

#### The strum what-if (built 2026-11-04; MEASUREMENT ONLY, how the game grades is unchanged)

Where: `teacher.js` `micEvalTakePw` -> `whatIf`; the small table under the Evaluate-all
results ("Strum what-if"); `strumWhatIf` in "Download results" (take labels only, no
names, no uids); the same table in the terminal from
`node tools/mic-sim/eval-takes.mjs <folder>`.

What it does: replays the site's own strum rule over each Power Chord Switch recording,
at the shared ratios older takes were graded with (full-band 1.4, HF 1.7) and at stricter
ones (full-band 1.8 / 2.2 / 2.6, the HF ratio scaled the same: 2.19 / 2.67 / 3.16). A take graded with Power Chord
Switch's own ratios (2.2 / 2.67 from 2026-11-05, 1.8 / 2.19 from 2026-11-07) is left out of it: see "Decision (2026-11-05)" below. Nothing is copied by hand:
the `CHK_*`, `COACH_ONSET_REFRACT`, `COACH_LVL_WIN/HOP`, `COACH_CATCHUP_MAX_MS` numbers
and the TEXT of `ccLoop`, `coachReadFrame` and `coachSmooth` are read from `coach.js` at
run time (`ccLoop`'s own condition is compiled and run with the candidate ratio passed in;
`coachSmooth` is run as it is; the easing base, its step and the arrival fraction are read
out of `coachReadFrame`). If `coach.js` no longer has that shape the what-if is `null` and
check 1cl turns red. Each replayed strum is put back on the site's clock and matched to the
changes the way `ccLoop` does (window, gridOffset). Per candidate and take:

- **false hits removed**: a change the site graded right or wrong where the audio has no
  strum (`false-hit`) that no longer has a strum at that ratio;
- **real strums lost**: a change where the site and the audio agree (`agree`) that no
  longer has a strum at that ratio;
- **reproduced**: changes where the replay at that ratio gives the same yes / no as the
  site did. The first column (the shared ratios older takes were graded with) is the replay's error bar: if it
  reproduces few of the site's verdicts, trust the other columns less.

How to read it: pick the ratio where "removed" is large and "lost" small. The cost of a
stricter ratio is soft real strums, and a student whose strums were graded right on timing
alone would turn red. Choosing and changing the ratios is `coach.js` detection:
**xhigh, Always Reviewed**, run `tools/mic-sim/power-switch.mjs` first; this task did not
touch `coach.js`.

What the replay assumes (and cannot know): the student's real frame times (it uses a
steady frame every `frameMeanMs` of the take, clamped to 16.7-150 ms) and the analyser's
48 kHz samples (the take is 24 kHz: the window length is scaled, the absolute HF floor is
not). The smoothing runs through the whole take, where the site resets it each round and
warms it during the count-in. A take with no `srcSampleRate` is read as 48000.

Proof: `tools/mic-sim/fake-pw-take.mjs` has two takes whose truth is MEASURED on the
audio: `pw-room-noise` (no strums at all; low-frequency bursts 1.6 / 2.0 / 2.38 / 3.0 x
the room, each graded by the site: 11 false hits; the stricter ratios must remove
3 / 5 / 8) and `pw-soft-strums` (15 real soft strums over a loud room, found by the
evaluator on the attack channel: the stricter ratios must lose 0 / 5 / 10). Check 1cl
compares every candidate count with that truth, re-sums the summary, parses the table
and the terminal text, and was broken 14 ways in a scratch copy (see the commit message).

What it does NOT answer: the what-if says what the site's rule would hear, not whether
the strum was the right chord, and not what "no readable pitch, no tick" would do to
real low-E strums. The second is answered from new takes by the pitch-rule table (next section).

#### Pitch readings in the saved take (added 2026-11-05)

Each entry of a Power Chord Switch take's `expected` list now has a `readings` field, and the
take's top-level `changeReadings` says what it means (`coach.js` `ccResolvePend` keeps the
readings, `ccRecMeta` saves them, rounded to 2 places, midi numbers):

- `null`: no strum was heard in that change's window (graded `miss`);
- `[]`: a strum was heard but no pitch could be read (graded `ok` on timing alone, as always
  with fewer than 3 readings);
- `[45.12, 45.02, ...]`: the readings the chord check used. 3 or more are needed for a chord
  verdict (`ok` or `off`); fewer pass on timing alone.

So "no readable pitch, no tick" can be priced from a take: count the changes with fewer than 3
readings that the site graded `ok`, split by the evaluator's own label (`agree` = a real strum
that would be lost, `false-hit` = noise that would be removed). **Built 2026-11-05: the
"Pitch-rule what-if" table** under the strum what-if (Evaluate all recordings), the same table in
the terminal (`node tools/mic-sim/eval-takes.mjs`), and `pitchRule` in both downloads
(`micEvalTakePw` `pitch`, `micEvalPitchSummary` / `micEvalPitchText` / `teacherMicPitchHtml` in
teacher.js). Per take and in total: *graded right*; of those *3+ readings* (the rule keeps the
tick) and *timing alone* (under 3: the rule would remove the tick); *false hits* and *real strums*
(the same counts as the strum what-if, so the two tables compare); and the last column
"−N · lost M": N false hits that lose their tick, M real strums that lose theirs. A wrong verdict
already needs 3+ readings, so the rule never touches those. Takes saved before 2026-11-05 have no
`readings` key: they are left out of the table and counted ("N takes have no readings"), never
read as `null` or as zero readings. No rules change was needed (`micTakes` has no field list). Grading is untouched: the old and new `ccResolvePend` gave the same verdict on 20,000 of
20,000 random changes. Check 1ck runs the real `ccResolvePend` and `ccRecMeta` and reads the
saved take back (21 of 21 changes; six deliberate breaks each turned it red). Check 1cl proves
the table: 5 synthetic takes plant known reading counts (`readings: true` in `fake-pw-take.mjs`,
the truth worked out there from the planted counts, not from teacher.js) and the 13 others have
none; 64 graded right, 39 on timing alone, and the console table, the terminal text, the download
and `eval-takes.mjs` all say the same numbers (ten deliberate breaks each turned it red). The
numbers in those synthetic takes are planted, so they say nothing about real students.

#### Decision (2026-11-07): Power Chord Switch strum ratio 2.2 / 2.67 -> 1.8 / 2.19

Jonathan, from "Evaluate all recordings" on 34 takes on 2026-11-07 (the zip is `~/Documents/mic-recordings-2026-11-07.zip`):

- **At 2.2 / 2.67 (14 takes):** false hits 12 of 97 (27% at 1.4), but **6 of 75 real strums were missed**; 5 of those 6 were at 35-40 BPM, at
  normal loudness, 175-300 ms early (probably the previous chord still ringing).
- **The what-if on the 7 takes graded at 1.4 / 1.7 (re-run 2026-11-07 with `tools/mic-sim/eval-takes.mjs` on the same zip, same numbers):**
  1.8 / 2.19 removes **11 of 31** false hits and loses **0 of 81** real strums; 2.2 / 2.67 removes 21 and loses 3; 2.6 / 3.16 removes 26 and loses 6.
  For students who were playing, both leave the same 4 false hits.
- **"No readable pitch, no tick" (`pitchRule`):** removes 2 of 12 false hits and loses 10 of 46 real rights. **Rejected: do not build it.**
- **Change:** `CC_POWER_ONSET_RATIO` 2.2 -> **1.8** and `CC_POWER_HF_RATIO` 2.67 -> **2.19** in `coach.js` (Change Up and every other loop keep 1.4 / 1.7).
  Check 1ck (`tools/checks.mjs`, the `R.pw` pin line) is re-pinned to 1.8 / 2.19; the broken versions (2.2/2.67, 1.4/1.7, one number wrong) each turn it red. Check 2d (inside 1cl) does
  not read the constants: it proves the console treats a take graded at 1.8 / 2.19 or at 2.2 / 2.67 (14 real takes) as graded with other ratios than the replay's start.
  `tools/mic-sim/power-switch.mjs` gives byte-identical output before and after on std, mid and weak: that tool grades the pitch check on loud synthetic strums, so
  it does not measure the strum ratio. The measuring checks are 1ck (the real `ccLoop` just below and above each threshold) and the real-take replay above.
- **Takes:** takes saved after this version reaches a browser (the deploy plus its service-worker update) record 1.8 / 2.19; takes from 2026-11-05 until then record 2.2 / 2.67; older ones the shared 1.4 / 1.7. The console's strum
  what-if skips the first two kinds (it starts from the shared ratios), and says how many it left out.
- **Roll back:** set the two constants back to 2.2 / 2.67 and re-pin the 1ck `R.pw` line.
- **What the replay cannot show (deep review):** the console's strum what-if skips the 14 takes graded at 2.2, so no replay measures what 1.8 does to the 6 missed real strums that
  motivated the change. Replayed anyway in a scratch copy, all 6 still fire at 2.2 (the replay matches the site's yes/no on only 85 of 97 changes there, 111 of 113 on the 1.4 takes), so it does not
  reproduce those misses. The case for 1.8 rests on the 7 takes graded at 1.4 (2.2 loses 3 of 81, 1.8 loses 0); the next takes are the real test. One of the five slow misses is a take that clips
  14.9% of its samples, so "normal loudness" does not fit that one.
- **Watch next:** "Played, not counted" (`detector-missed`) on new takes should fall at 35-40 BPM; false hits will rise a little in noisy rooms (the 3 noisy
  takes of 2026-11-04 lost 26 false hits at 2.2; at 1.8 fewer). Not tested on a thumb or finger strum.

#### Decision (2026-11-05): Power Chord Switch strums need ratio 2.2 / 2.67

Jonathan's pick, after the console's strum what-if on the 12 real takes (186 changes, 52 false hits, 132 real
strums; replay matches the site on 183 of 186 at the old ratios): 1.8 / 2.19 removes 14 false hits for 1 real strum
lost; **2.2 / 2.67 removes 30 for 4**; 2.6 / 3.16 removes 38 for 9 (the knee is 2.2: 1.8 → 2.2 buys 5 false hits per
real strum lost, 2.2 → 2.6 only 1.6). Of the 30, one is a false hit the replay already drops at the shipped 1.4
(replay error), so 29 net; 22 of the 52 still fire at 2.2 (T12 keeps 6 of its 12, T01 3 of 13). The 3 noisy takes lose 26 false hits and no real strum at 2.2; the 4 lost real
strums are soft strums in clean takes (T06, T08, T11). The old line in `coach.js` ("marking a correct change wrong is
the worse error in a room") is why the choice was Jonathan's: this trades a few soft strums for honest feedback in
noisy rooms.

- **Jonathan chose 2.2 with the risk in front of him (2026-11-05).** The reviewer found that the 12 real takes do not
  cover thumb or finger strummers, fast every-beat pairs or slow-frame Chromebooks; offered 1.8 / 2.19 (milder: 14 of
  52 false hits for 1 lost, keeps about 3 times as many soft strums in the probe) or holding until a thumb take had
  been recorded, he said to push 2.2. **First thing to do after it is live:** strum a take with a thumb or a finger on
  a test student account (60 and 120 BPM, every beat), run "Evaluate all recordings" and read "Played, not counted"
  (`detector-missed`); the new takes are graded at 2.2, so that column is the real loss. If it is bad, roll back.
- **The game (`coach.js`):** `CC_POWER_ONSET_RATIO = 2.2` and `CC_POWER_HF_RATIO = 2.67` (1.7 x 2.2 / 1.4, the
  what-if's own scaling) sit beside the shared `CHK_ONSET_RATIO` / `CHK_HF_RATIO`. `ccLoop` picks them with
  `ccIsPower()`: Power Chord Switch uses its own, Change Up (same loop) keeps the shared ones. Listening Coach, Note
  Runner, Note Call and the other loops read `CHK_*` and are untouched. The condition must stay on those four lines and
  free of comments: the console reads it as text (below).
- **What a take records:** `fields.onsetRatio` / `fields.hfRatio` (`ccRecMeta`). A take saved before 2026-11-05
  has neither and was graded with the shared ratios.
- **The console (`teacher.js`):** `micEvalStrumRule` compiles ccLoop's own condition with the names `onsetRatio` /
  `hfRatio` (and the `CHK_*` names, for an older text). The strum what-if replays STRICTER ratios than the take was
  graded with, starting from the shared ones, so a take graded at 2.2 / 2.67 is left out of it (`row.whatIfSkipped`,
  `row.strumRatio`) and the table says how many it left out; the rest of the evaluation (categories, rounds, the
  Pitch-rule table) is unchanged. Ratios outside 1..10 or half missing are never trusted. **Not built:** a strum
  what-if for takes graded at 2.2 (candidates above 2.2, e.g. 2.6 / 3.16, replayed from the new base); add it if the
  next takes make it worth deciding on a stricter ratio.
- **What to expect, and the limit of the proof:** a firm pick strum in a quiet room grades exactly as before
  (`tools/mic-sim/power-switch.mjs`, which now uses the Power Chord Switch ratios for its Power Chord Switch gate and
  the shared ones for Change Up, prints identical output on the old and new `coach.js`; with the ratios forced to 60
  only the Power Chord Switch gate collapses). BUT that simulator's strum carries a pick-scrape burst about 3x the note
  level, so it cannot show the cost for soft strums. A separate probe, `tools/mic-sim/onset-probe.mjs` (the real
  `coachReadFrame` / `coachSmooth`, a strum landing over the previous chord still ringing, 12 trials per setting,
  synthetic strums, so RELATIVE numbers) shows what the ratios do to a strum WITHOUT a sharp pick attack: at 60 BPM
  and equal loudness with no scrape the shared ratios hear 12 of 12 and 2.2 / 2.67 hear 0 of 12 (at 90 BPM the shared
  ratios hear 6 to 10 of 12, 2.2 / 2.67 hear 0); at 140 BPM with a weak scrape, 12 vs 9 on 16.7 ms frames and 12 vs 3 on
  50 ms frames; a firm pick strum is heard by both. Over the settings the shared ratios do not always hear, what each
  Power Chord Switch ratio still hears, as a share of what the shared ratios hear: 2.2 / 2.67 13%, 2.0 / 2.43 15%,
  1.8 / 2.19 37% (the replay on the 12 real takes: 1.8 removes 14 of 52 false hits and loses 1 real strum, 2.2 removes
  30 and loses 4; 2.0 was not replayed). So the strums that can now be missed are soft ones and ones without a clear
  pick attack (a thumb or a finger). The 12 real takes put that at 4 of 132; they do not cover the cases under "To
  watch" in "Where things stand". The game says so in its own words (2026-11-05, Jonathan asked for it): on the Power Chord Switch done
  screen, when at least two changes show "no strum heard" and they outnumber the "chord sounded wrong" ones, below 85% right,
  the advice is `games.pw.advice.firmer` ("Some strums were not heard. Strum a little firmer, and keep the guitar close to the
  mic." / "No se oyeron algunos rasgueos. Rasguea un poco más fuerte y mantén la guitarra cerca del micrófono."), the headline
  is the plain `games.cc.verdict.ok` ("N of M changes worked") instead of "this speed is too fast for now", and the big
  button is "Again" at the same speed instead of "-5 BPM". A Stop leaves out of "no strum heard" the changes the student never
  reached and the misses after the last strum the mic heard that fell due in the last 4 s before the Stop; also after the last change was swept (a Stop is never a natural end), and across a song switch's rounds, where the count-in before the next round's play screen is not counted (the click can only land there) (`cc.unreached`, `CC_STOP_REACH_MS`; 2026-11-07, review round 2:
  at 60 BPM a 3 s reach to the Stop button is 3 changes). It replaces the line in place (same height, one line at 1366x657,
  both languages, pairs and the 21-change song switch). One miss alone, a tie, mostly wrong chords, 85% and better, and
  Change Up keep what they had. The condition is decided once, before the headline (`firmer` in `ccRenderDone`). Check 1ck
  renders the real done screen in both languages for ten situations (20 renders: headline, advice and highlighted button);
  twelve deliberate breaks each turned it red.
- **Checks:** 1ck runs the real `ccLoop` on scripted frames just below and above every threshold, in Change Up (a
  pair and the computer's pick, three speeds) and in Power Chord Switch (a song switch in all three rounds, a pair and
  the computer's pick, three speeds, with a recording live and without; 165 runs), pins the two lines that choose the
  ratios by their text, reads the ratios back from the saved take, and pins 2.2 / 2.67 and 1.4 / 1.7; 1cl proves a take graded at other ratios (on either
  channel) is told from the older ones, measured the same, left out of the what-if and counted in the console, the terminal
  and both downloads (`strumWhatIfSkipped`), that crafted values are refused, and that the console's own Evaluate-all
  replays older takes from the shared ratios (14 cases). Deliberate breaks each turned a check red: 15 in the first
  round (the ratio back to 1.4, Change Up using the new ratios, the loop ignoring them, the attack channel left shared,
  the take dropping them, a retune without re-pinning, the game test inverted, a comment inside the condition, an
  unsupplied name, six evaluator breaks) and 8 more after the review found the first check blind (Change Up's
  attack channel on the wrong ratio, the ratios keyed on the song-switch ladder or on a recording being live, the
  console replaying from the new ratios, either channel dropped from the skip test, either download dropping the count).
- **Roll back:** set both `CC_POWER_*` constants to the `CHK_*` values (1.4 / 1.7) and change the pin line in 1ck
  ("the strum ratios are ... pinned 2.2 / 2.67"; the case table works its expectations out from the constants, so
  nothing else changes). New takes then record 1.4 / 1.7 and the console treats them as the older ones.
- **Student-facing:** a `CHANGELOG.md` entry ("noise in the room counts less"). No string changed: the setup tip
  already says quiet room, guitar close to the mic.

### Later (not chosen yet)

- **Settled by Jonathan, 2026-11-04 (not to be re-raised):**
  - **The 30 s take cap is fine.** Takes are cut at 30 s: at the default (every beat,
    60 BPM) the audio ends about 6 s into round 3; at 40 BPM in round 2; "every 2 beats"
    in round 2; "every bar" in round 1. The saved `expected` list still has all 21
    changes (times past `durationSec` are not in the audio); the evaluator counts those
    as `dropped`. Do not raise the cap.
  - **Power Chord Switch passed a real mic check** (Jonathan, with his own guitar).
  - **Do not unify the three wordings** for "on time but the chord sounded wrong"
    (verdict "messy", count line "chord sounded wrong", big line "wrong chord").
  - Watching the big feedback line in a real class was skipped on purpose.
  - **No real mic check for Note Runner** (Jonathan: not needed).
- **Spanish for the new strings** was written in the same edit; no review sheet
  (house rule). Look at `games.pw.ladder.*`, `games.pw.songSub`,
  `games.cc.breakdown` in `i18n.js` if a student reports
  odd wording.

### Review status

Reviewed the same day by `site-reviewer-deep` (always-reviewed: `firestore.rules`
and the mic game loop). No `Review: Fast` trailer on the commits. The reviewer
re-ran grading old-vs-new through the real `ccLoop` on a fake clock (pairs
792/792 identical, ladder rounds 2304/2304), 221 random Stop moments, 200 random
leave-the-screen moments, 2283 BPM-button presses: no break. What it found, and
what was done in the same push:

- Play screen did not fit 657px in Spanish or with the red label showing (Stop
  fell off the screen; chips widened mid-round). **Fixed:** the big line and the
  BPM buttons moved under the charts, chips keep a fixed symbol box, charts a
  little smaller; measured on all 16 switches in EN + ES, with and without the
  label, every chip graded (max 657px, Stop on screen); `tools/smoke.mjs` now
  walks Spanish, the label and the widest chips.
- The 1ck check could not see the recording behaviour (10 mutations stayed
  green). **Fixed:** stand-ins that track the capture, the label on every
  screen, a clean grid each round, ladder tempos, the consent footer, the
  anchored rules pattern, the strum log; all 12 mutations (the reviewer's 10
  + 2) now turn it red.
- Ladder from a base of 115 BPM or more was not "each round faster". **Fixed:**
  round 1 starts at most at 110 (110 / 125 / 140).
- `tools/mic-sim/eval-takes.mjs` then skipped Power Chord Switch takes (it measures them since 2026-11-04, item 2); comments
  and the changelog that over-claimed were corrected; asking for consent from
  the done screen no longer forgets a replay.
- Left as is: the three wordings for "on time but the chord sounded wrong"
  (verdict says "messy", the count line "chord sounded wrong", the big line
  "wrong chord"); a missed chip is faded grey while its big line is red;
  a remembered pick of the old "the cure" walk now opens Sweet Child's first
  switch (session only).
