# PLAN — Compact Song Journey pages (apply the checklist design principles)

Apply the same "Concept B" compact-checklist design principles (shipped for
station step lists on 2026-07-20, commits e6925ec + 66cbc7d + 40a03ba; spec in
`archive/PLAN-COMPACT-CHECKLIST.md`) to the six Song Journey pages in `tabs/`.
Jonathan's ask: the song pages have information overload — fix it the same way.

## ⚠️ Before touching anything

- **Concurrent-session hazard**: as of 2026-07-20 another Claude session is
  active in this repo and has **uncommitted, in-flight edits** to
  `tabs/journey-theme.css` and `styles.css` (floating Tuner/Timer/Metronome
  "fab-tools" work — new color tokens referencing a `fab-tools.css` that may
  not exist yet). Do **not** revert or clobber those lines. Work in your own
  git worktree, and before finishing, check whether the fab-tools work has
  landed and merge cleanly around it.
- Verify current line numbers with grep — don't trust the ones below blindly.

## Goal (what the student sees)

Today each journey page is one long scroll: 5–6 layers fully expanded — prose,
TAB blocks, "Play it" lines, Stuck?/Level up branches, rating buttons — all at
once (~280–305 lines of markup per page). After this change:

- **Every layer collapses to a single scannable header row**: the existing
  colored number badge + layer title + Module chip, plus (new) a small
  **rating chip** when the student has rated that layer, and a chevron.
- **Tapping a header expands that layer** to exactly today's content (nothing
  inside a layer changes). Opening one layer collapses any other open layer —
  one open at a time, whole page is one "section".
- **Default state on load**: Layer 1 open, everything else collapsed. When
  saved ratings arrive from Firestore, if the student hasn't tapped anything
  yet, switch the open layer to the **first unrated layer** (that's their
  "current" layer — same logic as the checklist's first-not-done step). A
  `#layer-N` URL hash **overrides everything**: expand that layer and scroll
  to it (the main app deep-links this way — see below).
- **A small progress pill** in the page header: "2 of 6 layers rated",
  live-updating when a rating is tapped.
- **Compact the top-of-page text** (same spirit as the checklist's "compact
  song blurb" polish): trim `.journey-note` to one or two sentences (the
  accordion now does the "find your layer" navigation, so drop the
  wayfinding sentences). In `.songmap`, keep the musical facts (chords, feel,
  capo/tuning) visible and fold the background-story sentences + the
  teaching-arrangement disclaimer into a native `<details>` — "More about
  this song". **Do not change any musical facts** — the CLAUDE.md "Settled
  song facts" list applies (Luna's F–Am/Dm details, Watchtower's Am–G–F–G
  loop, etc.). Presentation only.

UX rationale, same as the checklist redesign: progressive disclosure,
chunking, Miller's Law, Law of Common Region. The page becomes a visible map
of the journey; one layer's detail shows at a time.

## Where the code lives (verified 2026-07-20)

- Six pages: `tabs/{seven-nation-army,all-along-the-watchtower,
  sweet-child-o-mine,luna,let-it-be,the-cure}.html`. Watchtower / SNA / Sweet
  Child have **5** layers; Luna / Let It Be / the cure have **6** (bonus
  layer). Structure is identical across all six: `.crumb` → `header.song` →
  `.journey-note` → `.songmap` → repeated `section.layer` blocks
  (`.layer-head` with `.layer-num`, `h2`, `.layer-unit`; `.layer-body` with
  prose, `pre.tab`, `.playline`, `.branch`es, `.rate` widget) → `footer`.
- Shared CSS: `tabs/journey-theme.css`. Tokens mirror the app's; dark mode and
  reduced-motion blocks exist; `:focus-visible` is global. **No `@media
  print` block yet** — this plan adds one.
- Inline script (~110 lines at the bottom of each page): translate toggle,
  `rate()` + debounced Firestore save of `songRatings.<song-id>.<layer>`,
  load-time `applyRatings()`. **Verified byte-identical across all six pages
  except the `SONG_ID` constant** — safe to extract to a shared file.
- Deep links INTO these pages: `app.js` ~line 1698 builds
  `${t.journey}#layer-${t.layer}` from each module's `songThread`; module
  files also link `tabs/<song>.html` plain (no hash). Pages open in a new
  tab (`target="_blank"`), so load-time hash handling covers it — but add a
  `hashchange` listener too, it's three lines.
- Service worker: `sw.js` ASSETS pre-caches all six pages **and**
  `journey-theme.css`. `tools/checks.mjs` fingerprints `tabs/*.html` only
  (see `TAB_PAGES`, ~line 62) — CSS/JS in `tabs/` are currently **not** in
  the fingerprint. This plan closes that gap.

## Implementation spec

1. Extract the shared script to `tabs/journey.js` (translate + ratings +
   new accordion logic). Each page keeps `<script>var SONG_ID='luna';</script>`
   then `<script src="journey.js"></script>`.
2. Accordion markup: `<h2 class="layer-h"><button type="button"
   class="layer-head" aria-expanded aria-controls="layer-N-body">` with
   badge/title/unit/rating-chip/chevron spans; `.layer-body` gets the
   matching id. Collapsed = `.closed` class on `section.layer` (CSS hides
   body). **Class toggling only, never innerHTML re-render** (must survive
   collapse/expand without losing in-progress state — ratings here).
3. One-open-at-a-time across the whole page.
4. Current-layer logic: Layer 1 open by default; once ratings load, if the
   student hasn't interacted yet, open the first unrated layer; `#layer-N`
   hash (load + hashchange) always wins and scrolls to it.
5. Rating chip in the header row, painted by `applyRatings()`/`rate()`.
6. Progress pill "N of M layers rated" in `header.song`, M computed from
   `.layer` count (don't hard-code 5 vs 6).
7. Top-of-page compaction: shorter `.journey-note`; `.songmap` facts stay
   visible, story/disclaimer move into `<details>`. Per-page wording, not
   templated — preserve every musical fact verbatim.
8. Cache plumbing: add `'./tabs/journey.js'` to `sw.js` ASSETS; widen
   `tools/checks.mjs` `TAB_PAGES` filter to include `.css`/`.js` in `tabs/`.
9. CSS additions to `journey-theme.css` only, existing tokens, ≥48px header
   row, ≥44px tap targets, chevron rotation respecting reduced-motion.
10. `@media print`: force all `.layer-body` visible, hide chevrons/translate
    button, `break-inside:avoid` on `.layer`.
11. A11y: real buttons, `aria-expanded`/`aria-controls`, chevron/badge
    `aria-hidden`.

## Verification checklist

- `node --check tabs/journey.js`; `node tools/checks.mjs --skip-links`
  passes and bumps `CACHE_VERSION`.
- Tap headers → one open at a time; rate, collapse, re-expand → rating
  still shown; chip + pill update.
- `#layer-3` link → that layer opens and scrolls into view.
- Signed out: no console errors, ratings session-only.
- All six pages consistent; spot-check a 5-layer and a 6-layer page.
- Print preview: everything expanded, no chevrons/buttons chrome.
- Mobile ~400px: no wrap issues, tap targets ≥44px; dark mode legible.
- Translate toggle still works after script extraction.

## Project rules that apply (from CLAUDE.md)

- Make code edits without asking; pause only for genuine design forks or
  before pushing to GitHub.
- Do not push until Jonathan says "push to GitHub" — then run the full
  `node tools/checks.mjs`.
- Notable student-facing change → dated CHANGELOG.md entry, plain English,
  student's point of view, in the same push.
- Settled song facts (CLAUDE.md) may not change — presentation only.
- Archive this file to `archive/` when done, like the checklist plan.
