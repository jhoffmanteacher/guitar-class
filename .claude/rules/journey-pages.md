---
paths:
  - "tabs/**"
---

### ⚠️ Journey tabs are hand-typed copies of the app's tab card
A tab on a `tabs/*.html` Journey page is hand-written HTML: those pages have
no app script (`app/*.js`), so no `buildTab()`.

- **Markup.** The same markup the app emits: `.tab` > `.tab-head` (icon +
  `.tab-title` + "Tab" pill) > `.tab-body` > a board, with `.tab-ascii`
  standing in for the app's `.tab-board` grid (Journey tabs are ASCII, and stay
  ASCII). Write a new one that way. checks.mjs 1q fails the push on a bare
  `<pre class="tab">`, on a card missing one of its four parts, and on a
  `.tab-title` with no `data-es`.
- **CSS.** The `.tab` CSS in `tabs/journey-theme.css` is a hand-kept copy of the
  `.tab` rules in `styles.css`. **Restyle both or neither.** checks.mjs 1t
  compares them property by property, inside each `@media` context, and fails
  the push on a one-sided rule too.
  - The two deliberate differences: `margin` on `.tab`, and `background` on
    `.tab-head`, whose Journey value is `--tab-head-bg` (Journey's `--brand`
    goes light in dark mode).
  - Adding a third means adding it to `JOURNEY_ALLOWED_DIFFS` on purpose.

### Layer N is Module N
A page's core layers follow the course order: layer N's `.layer-unit` says
"Module N", `JOURNEY_LAYERS` in `app/lesson.js` is read from those spans, and
checks.mjs 1ab fails on drift. **Layer 4 is Open Chords and Layer 5 is
Pentatonic Solo** on every page; layers 6 and up are bonus layers. Reordering
modules again means moving these layers in the same change.

## Journey-page decisions

**Each Journey page draws its whole-song cards' tabs** (Jonathan, 2026-10-07).
- `addWholeSongTabs()` in `tabs/journey.js` turns every `card.wholeSong`
  activity's notes into an ASCII `.tab` folded under "The whole song tab" at the
  foot of its `journeyLayer`.
- Drawn at load from `class-activities.js`, never hand-typed: edit the card and
  the page follows. Not counted by 1q/1z (they read the static HTML).
- When open it spans the window, not the 1000px column (Jonathan: "use the
  entire width of a chromebook screen"). `wsReflow()` sizes the card, re-draws
  the rows to fit, and drops `.layer`'s clip (`.ws-wide`) while open.

**Journey pages have no Stuck? / Level up folds** (Jonathan, 2026-10-07). "More about this song" and "The whole song tab" are the
only folds. Don't add them back to a layer.

**The floating tools there are icons only.** The `#fab-buttons` rules live in
`journey-theme.css`, not `fab-tools.css` (1t2 keeps that file equal to the
app's). The label `<span>` is clipped as the accessible name; `title=` via
`data-i18n-attr` is the tooltip.

**No Journey page is blocked and none is deleted.** **Do not bring back a
per-song retire list (`JOURNEY_RETIRED`) or a "moved" card**; checks.mjs
**1bn** fails the push if either name reappears.

**The Journey pages are not kept in step with the cards.** They can disagree
(the "the cure" chorus is two laps on the page and three on the card).
**Do not open work to sync a Journey page's text with a card.**
