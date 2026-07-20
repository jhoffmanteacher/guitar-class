# PLAN — Compact checklist steps ("Concept B")

Implement the approved "Compact checklist" redesign of station step lists.
Jonathan approved this from three mockups; the clickable preview is here
(Concept B tab): https://claude.ai/code/artifact/41748ca8-47de-4466-b09a-5c23072db04d

## Goal (what the student sees)

Today a station is a long scroll where every step is fully expanded — text,
videos, hints, questions, TABs, chord diagrams, all at once. After this change:

- **Every step collapses to a single scannable row**: a status icon (✓ done /
  step number), a short one-line label, and a chevron.
- **Tapping a row expands it** to the full step (exactly today's content).
  Opening a row collapses any other open row **in the same section**.
- **Default state on render**: done steps collapsed; the first not-done step in
  each section starts open (it's "current" and gets a highlight class); all
  later steps collapsed.
- **"Mark done" collapses the step and auto-opens the next not-done step** in
  that section.
- **A small progress pill** near the station title: "2 of 4 steps done",
  live-updating when steps are marked done.

UX rationale (from lawsofux.com): Chunking, Miller's Law, progressive
disclosure, Law of Common Region. The whole station becomes a visible map;
only one step's detail shows at a time.

## Where the code lives (verified 2026-07-20 — grep, don't trust line numbers)

- `app.js` → `function buildStations(w, stationId)` (~line 1823). Inside it,
  `stepsHtml(steps, ns)` builds each step's `<li class="step">` with:
  `<div class="sn">` number · `<div class="st">` containing
  `<span class="st-text">` (full step text) · `<div class="step-body">`
  (playSeq buttons, chord diagrams, TAB, responses, hint/stuck/level-up folds) ·
  `.step-done-row` with the Mark done button.
- Done state: `completed[doneKey] === true`, `doneKey = `${w.id}-${ns}-${i}``.
  Toggled by `toggleStepDone(btn, key)` → `onCompleteChange(key, nowDone)`
  (persists to Firestore). The existing `.step-done` class already strikes the
  text and hides `.step-body` — this plan generalizes that idea.
- Sections: `.sc-sec` blocks with `toggleStationSection(btn)`; Station C uses
  them today, Station B's sections render the same way via `sectionsHtml`.
- Chord diagrams render lazily: **call `renderChordBoxes()` after any
  expand/collapse DOM change**, or SVGs inside newly shown rows stay blank.
  (`toggleStationSection` already does this — copy that pattern.)
- Text helpers that already exist: `stripTags(html)` and `truncateText(s, n)`.
- Search / "Where is this?" deep links add `.step-flash` to a target `li.step`
  and scroll to it (grep `step-flash`). These must **auto-expand** the target
  row (and its section) before scrolling.
- Print CSS (`styles.css` `@media print`) already forces `.step-body` visible.

## Implementation spec

1. **Restructure the step markup in `stepsHtml`** (one place) into:
   - `<button type="button" class="step-head" aria-expanded="...">` containing:
     status icon (`✓` when done, else the step number), a `.step-label`
     (short label — see rule below), and a chevron.
   - `<div class="step-detail">` containing everything the step shows today:
     the full `.st-text`, `.step-body`, and the Mark-done row.
   - Collapsed = `.step-detail` hidden via a class (e.g. `.step.collapsed`).
   **CRITICAL: expanding/collapsing must be CSS class toggling only — never
   re-render innerHTML on toggle.** Re-rendering would wipe half-typed
   response textareas and MC selections. Build once, toggle classes.
2. **Short label rule**: derive from the step text —
   `truncateText(stripTags(s.text), 60)` at a word boundary. Two cleanups:
   if the text starts with `Challenge — X:` use just `X`; keep a leading
   `Watch:` (students recognize it). If a step has a `response` and no other
   content, label it from the prompt instead.
3. **One-open-per-section**: opening a row closes other open rows in the same
   `.sc-sec-body` (or the same bare `.steps` list when a station has no
   sections). Track nothing in state — query the DOM.
4. **Current-step logic** at render: within each section, the first step whose
   `completed[doneKey]` is not true gets `.cur` (purple number badge like the
   mock) and starts expanded.
5. **Mark done** (`toggleStepDone`): keep existing persistence; additionally
   collapse the row, swap its icon to ✓, and expand the next not-done sibling
   in the section (if any). Un-marking done just updates the icon (don't
   force-expand). Update the station progress pill.
6. **Progress pill**: in the station header (`.dp-head`), render
   `<span class="prog-pill">N of M steps done</span>` counting that station's
   steps from `completed`. Update it inside `toggleStepDone`. Hide when M = 0.
7. **Scope**: both Station B and Station C step lists, sectioned or bare.
   Do NOT touch Module Review panels (`mr*`), the routine card, Daily 5,
   Songs, or teacher view.
8. **Deep links**: wherever `.step-flash` targets a step, first remove
   `.collapsed` from it (and `open` its parent `.sc-sec` — code for the
   section part exists), then scroll. Also call `renderChordBoxes()`.
9. **Print**: in the `@media print` block, force `.step-detail` visible and
   hide `.step-head` chevrons — a printed handout shows every step expanded,
   exactly like today.
10. **CSS** (`styles.css`, use existing tokens only — dark mode then works
    automatically): row `min-height:48px`, status circle 22px (green bg/text
    when done, `--purple-accent` bg + white number for `.cur`, `--bg3` +
    `--text2` otherwise), done labels struck + muted, chevron rotates 90° when
    open (respect the existing reduced-motion block), `:focus-visible` on
    `.step-head` per site convention (`2px solid var(--blue-text)`), and keep
    the ≥44px tap-target standard from the recent tap-target pass at the end
    of styles.css.
11. **Keyboard/a11y**: `.step-head` is a real `<button>` with `aria-expanded`;
    the status icon is `aria-hidden` with the done state carried in an
    `aria-label` on the button ("Step 2, done — Watch: Easy Power-Chord
    Songs").

## Verification checklist (do all of these before calling it done)

- `node --check app.js` passes; `node tools/checks.mjs --skip-links` passes
  (it auto-bumps the service-worker version — required, styles/app/index are
  shell files).
- Live Server + the **Dev bypass** button (localhost only): type text into a
  response box, collapse and re-expand the row → the text is still there.
- Mark a step done → row collapses, next opens, pill count updates, and the
  done state survives a reload (localStorage/Firestore path unchanged).
- A step with chord diagrams renders its SVGs after being expanded.
- Find (search) → jump to a step in a collapsed row → row expands and flashes.
- Print preview (⌘P) shows every step fully expanded.
- Mobile width (~400px): rows don't overflow; tap targets ≥44px.

## Project rules that apply (from CLAUDE.md — follow them)

- Just make the code edits; don't ask permission. Pause only for genuine
  design forks (use AskUserQuestion) or before pushing.
- **Do not push until Jonathan says "push to GitHub."** Then: run the full
  `node tools/checks.mjs` first.
- This is a notable student-facing change → add a dated entry at the TOP of
  `CHANGELOG.md` in the same push, written in plain English from the
  student's point of view (see existing entries for style).
- Plain-English style: gloss any music term at first use; keep the site's
  existing wording for "Level up", "You've got it when", "lap".
- If another Claude session is running in this repo at the same time, set up
  a git worktree first (repo rule; see memory/CLAUDE.md).
