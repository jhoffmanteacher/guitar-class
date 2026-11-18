# Card views (one practice card, a Chords / Tab / Lyrics switch) — details

Worktree `.claude/worktrees/card-views`, branch `feat/card-views`, rebased onto origin/main c7a9142.

## PLAN (written before any site file was edited)

### Step 1 inventory (done first, numbers below)
26 `view:'card'` activities. Script: scratchpad `inv.mjs` (loads class-activities.js in a vm, lists track / kind / bars / sections).

### Step 2 design
- Data: `card.otherViews` (optional), a map from a view NAME to the data that view needs:
  - `tab:    { caption, caption_es, sections }`  drawn note by note (chordGrid off), `counts` allowed
  - `chords: { caption, caption_es, sections, everyStrum?, restWord? }`  drawn as the chord grid (chordGrid on)
  - `lyrics: { caption, caption_es, sheet, sheetChords, sheetColumns?, sheetNamedAgain?, sections? }`  the PDF sheet
  - `sections` optional in every view: left out = the card's own sections (a lyric sheet is always counted against
    the notes it is drawn over, so the lyrics view of ca-33 needs none).
  - The card's OWN view is its kind today (sheet -> lyrics, chordGrid -> chords, else tab); `otherViews` may not
    name it. Not combinable with recordingVersions / keyVersions / chordVersions / bassNotes (1eq refuses).
  - Filled by REFERENCE in an IIFE at the end of class-activities.js (the house way: the lyric-sheet cards already
    take their play-along's sections that way), so a view can never drift from the card it came from.
- Engine: new part `app/cards-views.js` (after cards-loop.js): the stored choice (`localStorage.caCardViews`,
  `{ id: view }`, per device like caChordModes; never progress), the virtual card for a view, the switch HTML, and
  `caSetCardView()` which swaps the card's view IN PLACE (no re-render of the page, no stopCardAudio): the directions
  line, the switch and the tab / sheet element are replaced from a fresh `caCardBodyHtml()`; the `.pc` root (speed,
  Guitar, Metronome, data-loop / data-build) stays; a playing `pcState` gets the new layout (`st.L`, `st.sheet`) and
  forgets what it last painted, so the next frame lights the same beat in the new view. Audio elements untouched.
- Hooks: `caView()` (activities.js) lays the chosen view over the card (3 lines); `caCardBodyHtml()` (cards.js)
  draws `caViewSwitchHtml(a)` beside the other switches (1 line). Both renderers (student, console detail) go through
  caCardBodyHtml, so the console gets the switch too.
- i18n: `ca.viewSwitch` (group label), `ca.viewChords` Chords / Acordes, `ca.viewTab` Tab / Tab, `ca.viewLyrics`
  Lyrics / Letra (the site already says "Letra y acordes" for these sheets, and "Tab" in Spanish).
- checks.mjs: a new check 1eq (own function): shape, unknown keys, same sections as the card, not combinable, the
  sheet's chord count run through the app's own pcSheetMap, every view rendered in EN + ES with the switch and one
  pressed button, the default pinned (nothing stored -> own view), junk stored -> own view, every beat of the song
  located to the same section / lap / beat in every view, the in-place switch stores nothing in progress. 1bf gets a
  3-line hook so every view's sections also go through the card rules (as recording versions do).
- Pilot: ca-33 (Sweet Child, power-chord grid, the Songs-page play-along): Chords (own), Tab = ca-28's sections,
  Lyrics = ca-45's sheet (ca-45 already plays ca-33's own sections, so the dot count is the one 1bf2 holds).

### Step 3 proofs
screenshots (1366x657 EN/ES, mid-song before/after switch, console detail, 2560x1300), playalong-loop extension,
smoke activities walk (click + reload), break-it per new check, slow-load, one final checks --check --skip-links.

## Inventory (step 1)
26 practice cards. Songs with cards of DIFFERENT kinds over one track, and whether their sections line up
(label, fromBar, bars, reps, every section):
- Sweet Child O' Mine: ca-28 tab / ca-33 chord grid / ca-45 lyric sheet — all 12 sections identical (ca-45 shares
  ca-33's sections by reference). Same note counts per section in ca-28 and ca-33 (roots vs power chords, 1 per bar).
- "the cure": ca-24 tab / ca-30 grid / ca-44 sheet — all 10 sections identical. (ca-13, ca-18, ca-19 are part cards,
  other bars.)
- All Along the Watchtower: ca-26 tab / ca-29 grid / ca-38 sheet / ca-40 grid — all 7 identical. BUT ca-26, ca-29 and
  ca-40 carry recordingVersions (Neil Young), which 1eq refuses to combine with views: needs design work first.
- Luna: ca-27 tab / ca-32 grid — all 5 identical (no sheet). ca-20 is a part card.
- Seven Nation Army: ca-10 / ca-25 / ca-31 are all tabs (ca-31 power-chord tab, not a grid): no second kind.
- Every other song has one card.
So 3 songs line up section for section with no new music (Sweet Child, the cure, Luna); Watchtower lines up too but
is blocked by its recording switch.

## WHERE I STOPPED (2026-11-17, session paused)
Commit 80ce200 on feat/card-views (WIP, not verified), worktree .claude/worktrees/card-views, rebased on c7a9142.
Not pushed.

Design chosen:
- Field `card.otherViews` = { tab?: {caption, caption_es, sections, counts?}, chords?: {caption, caption_es, sections,
  everyStrum?, restWord?}, lyrics?: {caption, caption_es, sheet, sheetChords, sheetColumns?, sheetNamedAgain?,
  sections?} }; sections left out = the card's own. Own view (sheet->lyrics, chordGrid->chords, else tab) is the default
  and not listed. Filled by reference in an IIFE at the end of class-activities.js (copies via a field list, so 1bp's
  _es scanner does not see non-literal caption_es). Pilot: ca-33 (Chords own) + Tab = ca-28's sections + Lyrics =
  ca-45's sheet fields over ca-33's own sections.
- Choice remembered in localStorage `caCardViews` ({ id: view }), per device like caChordModes; never progress.
- app/cards-views.js (new part after cards-loop.js; index.html and both sw.js lists): caCardViewList / Mode / Pick /
  Card, caViewSwitchHtml (.ca-chord-switch.ca-view-switch, snip-toggle buttons, aria-pressed, data-view),
  caSetCardView + caCardViewSwap (swaps the switch, .pc-dir and .pc-tab/.pc-sheet in place from a fresh
  caCardBodyHtml; keeps the .pc root; a playing pcState gets st.L / st.sheet and forgets its painted place; Loop flags
  re-applied; focus kept). Hooks: caView() (3 lines, activities.js), caCardBodyHtml() draws caViewSwitchHtml(a)
  (1 line, cards.js; nowhere near pcSheet* / pcFollow). i18n ca.viewSwitch / viewChords / viewTab / viewLyrics
  (Acordes / Tab / Letra).

Built and proved:
- checks --check --skip-links (run 2, before the last 1eq fix): 1bf, 1bf2, 1cc, 1bp all green with the new data;
  only 1eq's chord-grid detector was wrong (12 lines "draws something else, want chords": the grid also carries
  data-seq) — fixed in the check (chords = data-beat present), NOT re-run. Plus the expected "shell cache stale".
- playalong-loop --only ca-33 (before the R17 judge fix): every existing walk in all 3 views green — 24 walks,
  8,853 places lit and compared, 0 mismatches; Loop/Build 11 walks 0 mismatches; R16 6 swaps 0 off. So each view
  plays, lights, loops and clicks correctly when opened in it.

Built but not proved:
- 1eq after the detector fix (shape, sections, every 16th located in every view, renders EN/ES/console, nothing saved).
- playalong R17 (the mid-section switch): the 6 walks ran but the judge counted every probe as "before the press"
  (it looked for `sw` on the event, which the page does not copy). Fixed to use the op index (W.ops), NOT re-run.
  The raw probes looked right (the clock's place matched across the press). Also TODO: R17 failures do not yet
  change the tool's exit code (add SWAPV.failed to `failed`).
- smoke cardViewsWalk (play, press every view, same pcState and audio element, lit, saved, reload): written, never run.
- scratchpad/cv-shots.mjs (screenshots EN + ES at rest and mid-song, 2560x1300): written, never run.

Not started:
- Console detail screenshot (plan: a scratch copy of tools/console-layout-smoke.mjs calling openActivityDetail('ca-33')).
- Break-it proofs for 1eq (plan, one scratch copy, several mutations at once: an unknown key in a view, a view section
  with other bars, sheetChords off by one, caCardViewMode defaulting to the first view, caViewSwitchHtml dropped
  from caCardBodyHtml, a stopCardAudio() in caSetCardView).
- node tools/slow-load.mjs; the full playalong run (other cards identical to main); smoke --en-only --only activities;
  the final checks. Lint could not run locally (npm cache error); GitHub runs it.

Exact next command (worktree .claude/worktrees/card-views):
  node tools/playalong-loop.mjs --only ca-33 > <scratchpad>/pl-ca33-2.txt 2>&1
then: node tools/checks.mjs --check --skip-links; then cv-shots.mjs; slow-load; break-its; smoke; full playalong.
