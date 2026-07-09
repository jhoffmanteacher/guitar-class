# Guitar Class Website — Claude Instructions

## Who I'm working with
Jonathan Hoffman prefers plain-English instructions and wants Claude to handle all git mechanics without him needing to remember commands.

## Plain-English workflow
| Jonathan says | Claude does |
|---|---|
| "Let's test these changes locally" | Start Live Server (VS Code extension, right-click index.html → Open with Live Server) |
| "Push to GitHub" | **First run the pre-push checks** (see below), fix anything they flag, then git add relevant files, git commit with a clear message, git push, confirm success |
| "Save progress with a note: [message]" | Run the pre-push checks, commit with that message, push |

### ⚠️ Run the pre-push checks before EVERY code push
Before any push that changes `index.html`, `styles.css`, `app.js`, `tuner.js`,
`teacher.js`, `config-main.js`, or a `module-N.js`, run:

```
node tools/checks.mjs
```

It does three jobs automatically and exits non-zero if anything's wrong (so
don't push until it passes):

1. **Validates module data** — loads every `module-N.js` and checks each Set
   has the fields the app needs, so a stray comma or missing field is caught
   here instead of breaking the live site.
2. **Link-checks** all external YouTube / Google-Docs URLs (YouTube via the
   oEmbed endpoint — see "Lessons learned" below). Flags dead links to fix.
3. **Bumps the service-worker cache version** — `CACHE_VERSION` in `sw.js` is
   now a content *fingerprint* of the cached shell files, so the script updates
   it automatically whenever a shell file changed and leaves it alone when
   nothing did. **No more bumping it by hand, and it can't be forgotten.**

Notes:
- The site is a light PWA: `sw.js` caches the static shell so it loads offline.
  If the version didn't change, returning students would keep the OLD cached
  site — which is exactly what the automatic bump prevents.
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
Plain static HTML/JS/CSS site — no build step, no Jekyll, no Node framework. Content lives in `index.html` and per-module JS files (`module-1.js` through `module-8.js`, `config-main.js`). Uses Firebase for auth and Firestore for student progress. Deployed by pushing to GitHub.

## Live preview
VS Code **Live Server** extension. Right-click `index.html` → "Open with Live Server". Browser auto-refreshes on save. No commit needed.

## Dev testing bypass
A "Dev bypass" button exists on the auth wall (below "Sign in with Google"). It skips Firebase auth and loads the app with a mock user (`Dev User / dev@test.local`). Progress won't save to Firestore in bypass mode — it's for UI/layout testing only.

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

### Never invent YouTube IDs from memory
When adding `originalUrl` / `tutorialUrl` / lesson video links in any module file:
- **Do not** write a YouTube ID based on recall — even for famous songs or well-known channels (JustinGuitar, Marty Music, etc.). Training-data recall of 11-character video IDs is unreliable and most invented IDs are 404s.
- **Always** find the real video via `WebSearch`, then verify the chosen URL before writing it to a module file.
- Verify with YouTube's oEmbed endpoint: `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json` → returns JSON title/author for valid videos, 404 for invalid/removed. Use `WebFetch` against the oEmbed URL with a tight prompt like: `If JSON with a title, return: TITLE=<title>|AUTHOR=<author_name>. If 404: INVALID`
- Batch verifications in parallel `WebFetch` calls — it's cheap and catches mistakes before they ship.
- If you can't find or verify a real URL for a given video slot, drop the link rather than inventing one. Pre-existing URLs in `module-1.js` through `module-5.js` are presumed valid (they were checked); reuse them when the topic fits.

(Context: in May 2026 I drafted Modules 6–8 from recall and ~60 of the URLs were 404s. Search-and-verify is the only safe pattern.)

## Settled song facts — do not re-flag in audits
These song arrangements are intentional and have been reconciled with the
curriculum map. Do **not** flag them as drift in future alignment audits:

- **All Along the Watchtower** — the loop is `Am–G–F–G` (`A5–G5–F5–G5` as
  power chords) — the record's turnaround. The map's "Am–G–F" is shorthand;
  the site's four-chord loop is intentional (settled 2026-07-07).
- **Core/thread songs are exactly six** (settled 2026-07-08): Seven Nation Army,
  All Along the Watchtower, Sweet Child O' Mine (standard tuning), Luna (Peso
  Pluma & Junior H), Let It Be, and "the cure" (Olivia Rodrigo). Just Like
  Heaven and Tu Boda are **not** core — Tu Boda is a Choice song (Modules
  6–8). The six Song Journey pages in `tabs/` therefore cover the core list
  completely; do not flag "missing" journey pages for any other song. Oye Mi
  Amor is a Choice song (Modules 6–7 content retained, retagged 2026-07);
  `tabs/oye-mi-amor.html` removed by design. `tabs/luna.html` is the sixth
  Journey page.
- **Luna** — F–Am vamp plus Dm–C; 6/8 felt in 2 (teach two downbeat strums
  per bar, nothing syncopated); no capo — simplified F (xx3211) until Module
  7's full barre; solos use D minor pentatonic Pattern 1 at fret 10; ◐ in
  Module 3 (sierreño as power chords). Settled 2026-07-09.

## Switching topics — prompt to start a fresh chat
When Jonathan asks for something that is clearly a **new, unrelated topic** from what we've been working on (e.g., we just finished a feature on Module 5 and he now asks about a different part of the site, a different project, or general Claude Code questions), use **AskUserQuestion** to ask whether he'd like to start a fresh conversation before continuing. A fresh chat keeps context focused and responses faster.

Phrase it like: "Looks like we're switching topics — want to start a fresh chat for this, or keep going here?"

- Only ask once per topic switch, not every message.
- Don't ask for natural follow-ups on the same topic (bug fixes, tweaks, refinements to what we just built).
- If he says "keep going," don't ask again unless the topic shifts a second time.
