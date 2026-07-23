# Guitar Class Website — Claude Instructions

## Who I'm working with
Jonathan Hoffman prefers plain-English instructions and wants Claude to handle all git mechanics without him needing to remember commands.

## Plain-English workflow
| Jonathan says | Claude does |
|---|---|
| "Let's test these changes locally" | Start Live Server (VS Code extension, right-click index.html → Open with Live Server) |
| "Push to GitHub" | **First run the pre-push checks** (see below), fix anything they flag, then git add relevant files, git commit with a clear message, git push, confirm success |
| "Save progress with a note: [message]" | Run the pre-push checks, commit with that message, push |

**Cloud (Cowork) sessions:** "push to GitHub" can't push directly — cloud
GitHub access is read-only for this repo, and git write operations through the
device-bridge folder fail (lock files can't be unlinked; never attempt them).
The handoff process instead, refined 2026-07-23:

1. **Cloud side:** run the FULL pre-push checks (`node tools/checks.mjs`) so
   the link check happens once and `CACHE_VERSION` ships pre-bumped; commit;
   `git format-patch` the commit(s).
2. **Every patch ships as a PAIR with its own `APPLY-<name>.md`** — never a
   patch alone, never instructions only in chat. The APPLY file states: what
   the commit is, which base commit it expects, the apply order if other
   patches are pending, and these exact steps — `git status` (clean tree) →
   `git am <patch>` → `node tools/checks.mjs --check --skip-links` (FAST
   verify only: the cloud already ran the full battery, and the patch carries
   the validated content byte-for-byte — re-running the link check locally is
   wasted time) → `git push` → `node tools/checks.mjs --live` a minute later.
   If the doc mentions a WORKFLOW.md status flip (`[~]`→`[x]`), amend it in
   before pushing.
3. **Local side:** Jonathan hands the pair to his local Claude Code
   ("opusplan"), which follows the APPLY file.
4. **Cloud side, afterwards:** fetch origin and hard-reset the cloud clone to
   match (patches applied via `git am` get new hashes — never re-merge, just
   reset).

(Full rationale + history: WORKFLOW.md "Working conventions.")

### ⚠️ Run the pre-push checks before EVERY code push
Before any push that changes `index.html`, `styles.css`, `app.js`, `tuner.js`,
`teacher.js`, `config-main.js`, or a `module-N.js`, run:

```
node tools/checks.mjs
```

It does four jobs automatically and exits non-zero if anything's wrong (so
don't push until it passes):

1. **Syntax-checks every shipped .js** (`node --check` on app.js, coach.js,
   i18n.js, sw.js, tabs/*.js, etc.) — the site has no build step, so a typo
   in a non-module file would otherwise ship straight to students. (Added
   2026-07-23; module files were already parsed by the validator.)
2. **Validates module data** — loads every `module-N.js` and checks each Set
   has the fields the app needs, so a stray comma or missing field is caught
   here instead of breaking the live site.
3. **Link-checks** all external YouTube / Google-Docs URLs (YouTube via the
   oEmbed endpoint — see "Lessons learned" below). Flags dead links to fix.
   Keep this on full pushes even when no links changed — it also catches
   previously-good videos that have since been taken down.
4. **Bumps the service-worker cache version** — `CACHE_VERSION` in `sw.js` is
   now a content *fingerprint* of the cached shell files, so the script updates
   it automatically whenever a shell file changed and leaves it alone when
   nothing did. **No more bumping it by hand, and it can't be forgotten.**

### After every push: confirm the deploy actually landed
About a minute after `git push`, run:

```
node tools/checks.mjs --live
```

It fetches the live site's `sw.js` and confirms its `CACHE_VERSION` matches
local — catching a failed or stuck GitHub Pages build, which would otherwise
silently leave students on the old cached site. If it reports a mismatch,
wait a minute and re-run before investigating. (Cloud sessions can't reach
the live site — this step belongs to whichever LOCAL session pushed.)

Notes:
- The site is a light PWA: `sw.js` caches the static shell so it loads offline.
  If the version didn't change, returning students would keep the OLD cached
  site — which is exactly what the automatic bump prevents.
- The fingerprint also covers every file in `audio/` — the service worker
  runtime-caches those cache-first same as any other same-origin file, so
  re-exporting a backing track's audio (same filename, new bytes, e.g. a
  quieter metronome click) needs the same cache-bust as a shell edit. They're
  fingerprinted but deliberately **not** added to `sw.js`'s `ASSETS` precache
  list (that would make the SW download every jam track at install time).
- **Editing a module's skills? Update `MODULE_MANIFEST` in `config-main.js`.**
  The Module dropdown counts and the 8-segment progress strip read each module's
  skill total from `MODULE_MANIFEST` (`skillCount` = number of set-level skills;
  `skillIdRe` = regex matching that module's skill ids) *without* loading the
  module file. So if you **add or remove a `skills:` entry** in a `module-N.js`,
  bump that module's `skillCount` to match. The `checks.mjs` validation step
  above verifies this automatically and **fails the push** if they drift (it also
  checks that `skillIdRe` matches every skill id and doesn't collide with another
  module), so you can't forget — but fix `config-main.js` when it flags you.
- Doc-only pushes (`*.md`) don't touch the shell, so the script correctly makes
  no bump — but it's still safe (and fast, with `--skip-links`) to run.
- Flags: `--skip-links` skips the slow link check (fast validate + bump only);
  `--check` verifies without changing files (used to confirm the version is
  current). The link check hits ~240 URLs and takes a few seconds.

### Automatic pre-commit safeguard (belt-and-suspenders)
A tracked git hook at `.githooks/pre-commit` runs the **fast, offline, read-only**
checks (`node tools/checks.mjs --check --skip-links`) on every `git commit`: it
validates the module data and confirms `sw.js`'s `CACHE_VERSION` is current. It
changes no files and hits no network. If something's wrong it **aborts the commit**
and tells you to run the full `node tools/checks.mjs` (which auto-fixes the SW
version). The slow link-check and the SW bump still belong to the explicit
push-time run — the hook is just a second net so a broken commit can't slip through.

- **Bypass once:** `git commit --no-verify`.
- **Per-machine, one-time setup:** the hook lives in the repo, but git only uses it
  after `core.hooksPath` is pointed at `.githooks`. Already done on the Mac. On the
  **Windows machine** (or any fresh clone), run once:
  `git config core.hooksPath .githooks`. If Claude notices commits aren't being
  checked on a machine, set this automatically — it's safe and reversible.

### Update the changelog on notable pushes
When a push includes a **notable, student-facing change**, add a dated entry to
the **top** of `CHANGELOG.md` (newest first) in the same push — no need to ask.
Write it in plain English from the student's point of view (*what changed and why
it's better*), not in terms of file names or function names. Match the existing
entry style (`## YYYY-MM-DD — Title`, then `### Added` / `### Changed` sections).

- **Add an entry for:** a new feature, a module's content reworked, a visible UX
  change, or a bug fix students would notice.
- **Skip it for:** internal-doc edits (`WORKFLOW.md` and other `*.md`), pure
  refactors with no visible effect, and planning/cleanup work. The full technical
  history lives in `WORKFLOW.md` and the git log — the changelog is the highlight
  reel. (`CHANGELOG.md` is excluded from the published site, so it's an internal
  record, but keep it readable as if a student might see it.)

## Project: what this is
Plain static HTML/JS/CSS site — no build step, no Jekyll, no Node framework. Content lives in `index.html` and per-module JS files (`module-1.js` through `module-12.js`, `config-main.js`). Uses Firebase for auth and Firestore for student progress. Deployed by pushing to GitHub.

## Live preview
VS Code **Live Server** extension. Right-click `index.html` → "Open with Live Server". Browser auto-refreshes on save. No commit needed.

## Dev testing bypass
A "Dev bypass" button exists on the auth wall (below "Sign in with Google"). It skips Firebase auth and loads the app with a mock user (`Dev User / dev@test.local`). Progress won't save to Firestore in bypass mode — it's for UI/layout testing only.

## i18n — hand-written Spanish everywhere (Google Translate REMOVED 2026-07-23)
Every layer of the site is hand-translated now; the Google Translate widget
is gone from index.html AND the tabs/ Journey pages. The Español button is
just `setLang()` — four layers all hang off it:
1. **App shell** — `i18n.js` `I18N` keys (`t()` / `data-i18n`).
2. **Module/lesson content** — `_es` twin fields in `module-N.js` /
   `config-main.js`, read through `tf()`; every step also carries a short
   `label`/`label_es` title (checks.mjs enforces the twins via
   `i18nComplete`).
3. **Games arcade + Listening Coach** — `coach.js` renders everything
   through `t()` at render time (`coach.*` / `games.*` keys in i18n.js);
   UI text in data tables is stored as `*Key` fields, resolved at render.
   A language switch while the games screen is open bounces to the hub.
4. **Song Journey pages** — per-page `data-es` attributes swapped by
   `journey.js` (`applyJourneyLang`), plus `journey.*` keys for its dynamic
   strings. i18n.js loads synchronously BEFORE journey.js on those pages.

- **Every new student-facing shell string must be added to `i18n.js`'s
  `I18N` table in BOTH `en` and `es`, in the same edit.** Never ship a shell
  string English-only "to translate later" — that's exactly how the two
  languages drift out of sync, and Jonathan doesn't speak Spanish, so there's
  no one to catch it after the fact.
- **Reuse the glossary** at the top of `i18n.js` for recurring pedagogy terms
  (module/set/station/skill/chord/strum/fret/pick/lap/"Level up"/etc.) rather
  than inventing a fresh Spanish word each time one comes up.
- **How to wire a new string** — full mechanics are documented at the top of
  `i18n.js` itself (read it before adding a string); short version:
  - Static HTML → `data-i18n="key"` on the element (a child `<span>` if the
    element has other non-text children); `data-i18n-attr="attr:key"` for an
    attribute; `data-i18n-html="key"` if the value contains markup.
  - Dynamic strings built in `app.js`/`fab-tools.js`/`tuner.js` → call
    `t('key', {param: value})` and wrap the result the same way (plus
    `data-i18n-params='{"param":value}'` if parameterized) — most shell HTML
    is built once and never rebuilt, so without this tagging a language
    switch would leave it stuck in whichever language it was first drawn in.
  - `translate="no"` is still added automatically by `applyI18n()` —
    harmless now that Google Translate is gone, and it keeps any student's
    own browser auto-translate from mangling our hand-written Spanish.
- **Review policy (settled 2026-07-23): no bilingual human is available, so
  the QA gate for new Spanish is an independent AI proofread sweep** — fresh
  agents with no authorship context audit new Spanish against the English +
  glossary and flag genuine errors only. Run one after any large batch of new
  Spanish. (`translations-review.md`, the working EN→ES review sheet, was
  removed 2026-07-23 once the full-site sweep was complete and all findings
  fixed — see WORKFLOW.md "Recently shipped" for the history.)
- `i18n.js` loads on **every page that uses these strings**: `index.html`
  (the full shell + coach.js) and every `tabs/*.html` Song Journey page.
  It must load **before** `app.js`, `fab-tools.js`, `tuner.js`, and (on
  Journey pages, synchronously) `journey.js`, since they call
  `t()`/reference `data-i18n` at parse or event time.

## Shell
Jonathan works on both Windows and macOS machines, so **don't assume a shell** — check the platform the current session reports and use matching syntax: **PowerShell** on Windows, **zsh/bash** on macOS. Claude Code already launches the right shell for each machine; just match command syntax (paths, env vars, command chaining) to whatever platform this session is running on.

## How to ask follow-up questions
When you need to clarify something with Jonathan, use the **AskUserQuestion** tool to present a multiple-choice picker rather than a free-text question. He prefers to click an option than to type a freeform answer.

- 2–4 options per question, mutually exclusive
- One question per turn unless the choices are truly independent
- Use this for design choices, scope decisions, style preferences — anywhere a free-text question would normally appear

### Don't ask "should I proceed?" — just proceed
Jonathan doesn't want to be asked yes/no permission to keep going. Once a task is
clear, **do the work and report back** — don't pause for "want me to do this?",
"should I continue?", "ready for the next step?", or "shall I implement it?".

- **Just proceed** on: the obvious next step of the task at hand, multi-step work,
  refactors, fixes, edits, running local tests/verification, and anything reversible.
- **Still pause** only for: genuine forks where the choice changes the outcome (use
  AskUserQuestion with options, not a yes/no), or **irreversible / outward-facing**
  actions — pushing to GitHub, deleting files, anything that touches the live site.
  (Pushing already requires Jonathan to say "push to GitHub," per the workflow table.)
- When in doubt, pick the sensible default, proceed, and say what you did and why —
  he can always tell you to change course.

#### Programming & HTML edits — never ask, just do them
Editing the site's code is the core of the job and is fully reversible (git tracks
everything), so **don't ask permission before making code changes**. Just write the
HTML / CSS / JS, then explain what you changed.

- **Just do it, no asking**, for: editing `index.html`, `styles.css`, `app.js`,
  `config-main.js`, `sw.js`, or any `module-N.js`; adding/fixing/refactoring markup,
  styles, or scripts; answering an HTML/CSS/JS question by going ahead and
  implementing it; creating helper/test files; running Live Server or local checks.
- Treat "can you...", "how do I...", and "should this be..." about code as **"do it,"
  not "ask me first."** Implement the change and show the result rather than asking
  whether to proceed.
- The only code-related pause points stay the same: a genuine design fork (use
  AskUserQuestion) or an outward-facing action (pushing to GitHub, deleting files,
  touching the live site).

## Lessons learned

### Multi-step directions get lists, not paragraphs (Jonathan, 2026-07-23)
Any student-facing direction that packs 2–3+ sequential steps or parallel
points into one prose paragraph should be an inline HTML list instead —
`<ol>` for ordered steps, `<ul>` for parallel points, short lead-in clause
kept as text before the list. Applies to step `text:` fields and practice
`prompt`s (both render trusted HTML; mc `choices` stay plain text). Mirror
the identical structure in the `_es` twin. Leave alone: single actions,
naturally flowing two-clause sentences, hints (≤2 sentences), `gotItWhen`
strings, and input placeholders (no HTML there).

### Station B video pairs — aim for two voices
In each Station B video pair, aim for video #2 from a **different instructor**
than video #1, teaching the same skill. Same-channel pairs are allowed when the
alternative is a worse video — quality beats variety. (Adopted in the July 2026
research-upgrades Session D.)

### Never invent YouTube IDs from memory
When adding `originalUrl` / `tutorialUrl` / lesson video links in any module file:
- **Do not** write a YouTube ID based on recall — even for famous songs or well-known channels (JustinGuitar, Marty Music, etc.). Training-data recall of 11-character video IDs is unreliable and most invented IDs are 404s.
- **Always** find the real video via `WebSearch`, then verify the chosen URL before writing it to a module file.
- Verify with YouTube's oEmbed endpoint: `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json` → returns JSON title/author for valid videos, 404 for invalid/removed. Use `WebFetch` against the oEmbed URL with a tight prompt like: `If JSON with a title, return: TITLE=<title>|AUTHOR=<author_name>. If 404: INVALID`
- Batch verifications in parallel `WebFetch` calls — it's cheap and catches mistakes before they ship.
- If you can't find or verify a real URL for a given video slot, drop the link rather than inventing one. Pre-existing URLs in `module-1.js` through `module-5.js` are presumed valid (they were checked); reuse them when the topic fits.

(Context: in May 2026 I drafted Modules 6–8 from recall and ~60 of the URLs were 404s. Search-and-verify is the only safe pattern.)

### Prefer diverse tutorial creators
An audit (2026-07-10) found the tutorial-video lineup skews heavily toward a
handful of big channels run by white men — Marty Music, Andy Guitar,
JustinGuitar, swiftlessons, GuitarZero2Hero, and Kurt Berg alone covered
roughly half the tutorial slots. Jonathan wants students to see a more diverse
set of teachers. So, when **adding or swapping any tutorial video**:

- **Don't default to the biggest channel.** Before settling on Marty Music /
  JustinGuitar / Andy Guitar, spend one extra search looking for a
  comparable-quality lesson from a woman, a creator of color, or a
  Spanish-language/bilingual channel (a plus for this class's repertoire).
- Creators **already verified on the site** to reuse when the topic fits:
  Lauren Bateman, Nikhil D'Souza, guitarraviva (Spanish), David Casas.
- **Lesson quality still wins.** Never pick a worse lesson just for the
  demographic — the rule is *check for a strong diverse option first*, not
  *avoid the big channels at all costs*.
- All the usual rules above still apply: find via WebSearch, verify via oEmbed,
  never write an ID from memory.

## Backing-track naming & tuning
Custom backing tracks (local mp3s in `audio/`, as opposed to a YouTube jam-loop
`backingUrl`) follow one naming convention and one hard tuning rule:

- **Filename pattern:** `<artist-slug>-<song-slug>-backing-<key>-<bpm>bpm-<tuning>hz-<mix>.mp3`
  — artist and song are lowercase kebab-case. The artist stays **out** of the
  app's display metadata — the song list keeps its own display form (e.g.
  `'"the cure" — Olivia Rodrigo'`); only the filename gained the artist slug.
- **`mix` values in use:** `rhythm-down`, `rhythm-down-metronome`, plus
  `no-gtr`, `full`, `drums-only`, and slower tempo tiers like `slow-100`.
- **Every track ships at A=440** — `tuner.js` is hardcoded to A4=440Hz, so a
  track mastered at any other reference (e.g. "the cure"'s original master was
  442, ~8 cents sharp) will sound out of tune against the app's tuner. Fix by
  exporting at 440 directly from Moises (preferred), or ffmpeg/rubberband as a
  fallback if Moises isn't available.
- **Worked example** (`tabs/the-cure.html`, `module-4.js`):
  - `olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-rhythm-down.mp3` — the
    default clean track (`backingUrl` + `data-audio`)
  - `olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-rhythm-down-metronome.mp3`
    — same mix with a metronome click baked in, wired via `data-audio-metronome`
    and surfaced as a "🎵 Metronome" toggle on the Journey page (`tabs/journey.js`)
    that swaps the `<audio>` src while preserving playback position and state

## Settled song facts — do not re-flag in audits
These song arrangements are intentional and have been reconciled with the
curriculum map. Do **not** flag them as drift in future alignment audits:

- **All Along the Watchtower** — the loop is `Am–G–F–G` (`A5–G5–F5–G5` as
  power chords) — the record's turnaround. The map's "Am–G–F" is shorthand;
  the site's four-chord loop is intentional (settled 2026-07-07). Harmonic
  rhythm: **two beats per chord** (half-bar) — this is the record's real
  cycle and the reference standard other core songs' rhythm bridges are
  modeled on (settled 2026-07-22, rhythm-alignment analysis).
- **Sweet Child O' Mine** — verse loop `D–C–G` (`D5–C5–G5` as power chords),
  each chord held a **full bar (4 beats)** at the record's ~123–125 BPM,
  standard 4/4 — confirmed against Songsterr/Ultimate-Guitar chord charts.
  Settled 2026-07-22.
- **Let It Be** — verse loop `C–G–Am–F`, **two beats per chord (half-bar)**
  at ~71–76 BPM — chord charts consistently pair it `|C G|Am F|`, two chords
  sharing each bar. This is the record's real cycle (not the site's older,
  slower full-bar teaching tier). Settled 2026-07-22.
- **"the cure"** — loop `Am–C–Dm–F` (then a `G/B` turnaround), **two felt
  beats per chord** — the backing track's metronome reads 144 BPM, but it
  feels like half that (~72), and 144 = 2×72, so a chord lasting one bar of
  quick 144-BPM beats is the same duration as two slow/felt 72-BPM beats.
  State this to students as "count it in big slow beats, about 72 — two of
  those per chord." Settled 2026-07-22.
- **Luna's Module 4 `backingUrl`** stays the generic YouTube Dm jam loop
  ("Slow Burn Groove Guitar Backing Track Jam in D Minor" — Elevated Jam
  Tracks, oEmbed-verified) by design — do not flag it as drift or swap it for
  the local Luna mp3. It's a deliberately slow, generic D-minor groove for
  the "Solo over Luna" challenge, easier to improvise over than Luna's real
  128 BPM vamp; the local `audio/peso-pluma-junior-h-luna-backing-...mp3`
  stays the actual song track on the Journey page. Settled 2026-07-22.
- **Core/thread songs are exactly six** (settled 2026-07-08): Seven Nation Army,
  All Along the Watchtower, Sweet Child O' Mine (standard tuning), Luna (Peso
  Pluma & Junior H), Let It Be, and "the cure" (Olivia Rodrigo). Just Like
  Heaven and Tu Boda are **not** core — Tu Boda is a Choice song (Modules
  6–8). The six Song Journey pages in `tabs/` therefore cover the core list
  completely; do not flag "missing" journey pages for any other song. Oye Mi
  Amor is a Choice song (Modules 6–7 content retained, retagged 2026-07);
  `tabs/oye-mi-amor.html` removed by design. `tabs/luna.html` is the sixth
  Journey page.
- **Luna** — F–Am vamp; Dm is a brief passing chord near the end of the verse
  and in the closing bridge (not a chorus chord, and there is no C — verified
  against the official Ultimate-Guitar chord chart/tab 2026-07-09, which some
  sources voice as Dm9); 6/8 felt in 2 (teach two downbeat strums per bar,
  nothing syncopated); no capo — simplified F (xx3211) until Module 7's full
  barre; solos use D minor pentatonic Pattern 1 at fret 10; ◐ in Module 3
  (sierreño as power chords). Settled 2026-07-09.

## Switching topics — prompt to start a fresh chat
When Jonathan asks for something that is clearly a **new, unrelated topic** from what we've been working on (e.g., we just finished a feature on Module 5 and he now asks about a different part of the site, a different project, or general Claude Code questions), use **AskUserQuestion** to ask whether he'd like to start a fresh conversation before continuing. A fresh chat keeps context focused and responses faster.

Phrase it like: "Looks like we're switching topics — want to start a fresh chat for this, or keep going here?"

- Only ask once per topic switch, not every message.
- Don't ask for natural follow-ups on the same topic (bug fixes, tweaks, refinements to what we just built).
- If he says "keep going," don't ask again unless the topic shifts a second time.
