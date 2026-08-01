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
Module 13 (String Changing) is a *single-flow* module — `stations.b` only,
custom tab labels, checklist = graded assessment.

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

**Cloud (Cowork) sessions can't push** — GitHub access is read-only and git
writes through the device-bridge folder fail on lock files. Never attempt them.
Instead: run full `node tools/checks.mjs`, commit, `git format-patch`, and ship
**every patch as a pair with its own `APPLY-<name>.md`** stating the base commit,
apply order, and steps (`git status` → `git am` → `checks.mjs --check
--skip-links` → `git push` → `checks.mjs --live`). Afterwards, hard-reset the
cloud clone to origin — never re-merge. (Full rationale: `WORKFLOW.md`.)

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
(done on the Mac; **needed on Windows**). Bypass with `--no-verify`.

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

**Paper drills get a digital deck.** Nothing student-facing should ask for
scissors, index cards or a pen. Three `step.drill` types share one dispatcher:
`shuffle` (frets on one string, timed), `deck` (any card pile, optional back),
`ear` (hidden note sequence, played aloud). Wiring one is content, not code:
`drill: { type:'deck', deck:'numerals-C', skill:'m11w1-s3' }`. Decks live in
`DECKS` in `app.js`; ear pools in `EAR_POOLS`. Drop the "Got someone around?"
partner line from any card that gets a deck; no paper-fallback line.

**Quiz answers are shuffled at render time** by `mcOrder(choices, seed)` —
deterministic (seeded on the English prompt, so order is stable across
re-renders, languages and students), catch-alls pinned via `MC_PINNED`, fewer
than 3 choices left alone. The two MC paths store differently: the graded step
persists the choice **text**, the practice panel persists the **index**. Don't
"simplify" that away. Write `answer: 0` freely — students never see it that way.

## Videos

- **Never invent YouTube IDs from memory** — even for famous songs or channels.
  Find via `WebSearch`, then verify via oEmbed
  (`https://www.youtube.com/oembed?url=…&format=json` → JSON for valid, 404 for
  dead). Batch verifications in parallel. If you can't verify one, drop the link
  rather than inventing it. (In May 2026 ~60 recalled URLs were 404s.)
- **Station B video pairs:** aim for video #2 from a *different* instructor than
  #1, same skill. Same-channel pairs are fine when the alternative is worse.
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

- **All Along the Watchtower** — `Am–G–F–G` loop (power chords `A5–G5–F5–G5`),
  **two beats per chord**. The map's "Am–G–F" is shorthand.
- **Sweet Child O' Mine** — verse `D–C–G`, **full bar each**, ~123–125 BPM.
- **Let It Be** — verse `C–G–Am–F`, **two beats per chord**, ~71–76 BPM.
- **"the cure"** — `Am–C–Dm–F` + `G/B` turnaround, **two felt beats per chord**
  (track reads 144 BPM but feels ~72). Tell students "big slow beats, about 72."
  No capo, by design.
- **Luna** — F–Am vamp; Dm is a passing chord, no C; 6/8 felt in 2; no capo
  (simplified F `xx3211` until Module 7); solos use D minor pentatonic Pattern 1
  at fret 10; ◐ in Module 3. Its Module 4 `backingUrl` stays the generic YouTube
  Dm jam loop by design — the local mp3 is the Journey-page track.
- **Core songs are exactly six**: Seven Nation Army, Watchtower, Sweet Child,
  Luna, Let It Be, "the cure". The six `tabs/` Journey pages cover them
  completely — don't flag others as missing. Tu Boda and Oye Mi Amor are Choice
  songs.
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
  AskUserQuestion), or irreversible / outward-facing actions — pushing to GitHub,
  deleting files, touching the live site.
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
