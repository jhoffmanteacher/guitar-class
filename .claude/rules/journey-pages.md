---
paths:
  - "tabs/**"
---

### ⚠️ Journey tabs are hand-typed copies of the app's tab card
A tab inside a set is built by `buildTab()` in `app.js`; a tab on a
`tabs/*.html` Journey page is hand-written HTML, because those pages have no
`app.js`. Since 2026-09-04 the 69 Journey tabs use the same markup the app
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

### Layer N is Module N
A page's core layers follow the course order: layer N's `.layer-unit` says
"Module N", `JOURNEY_LAYERS` in `app.js` is read from those spans, and
checks.mjs 1ab fails on drift. Since Modules 4 and 5 swapped (2026-10-12),
**Layer 4 is Open Chords and Layer 5 is Pentatonic Solo** on every page;
layers 6 and up are bonus layers. Reordering modules again means moving
these layers in the same change.

## Journey-page decisions (moved here from CLAUDE.md, 2026-10-25)

**Each Journey page draws its whole-song cards' tabs** (2026-10-07,
Jonathan: for students who prefer that visual). `addWholeSongTabs()` in
`tabs/journey.js` turns every `card.wholeSong` activity's notes into an ASCII
`.tab` folded under "The whole song tab" at the foot of its `journeyLayer`
(Layers 2 and 3 on five pages; Let It Be has none). Drawn at load from
`class-activities.js`, never hand-typed, so it cannot drift from the card —
edit the card and the page follows. Not counted by 1q/1z (they read the
static HTML). When open it spans the window, not the 760px column
(Jonathan, same day: "use the entire width of a chromebook screen") —
`wsReflow()` measures the column and a monospace character, sizes the card,
re-draws the rows to fit, and drops `.layer`'s clip (`.ws-wide`) while open.

**Journey pages have no Stuck? / Level up folds** (Jonathan, 2026-10-07:
"they are no longer needed" — all 66 removed, every layer of all six pages;
"More about this song" and "The whole song tab" are the only folds left).
Don't add them back to a layer. **The floating tools there are icons only**
— `#fab-buttons` rules in `journey-theme.css`, not `fab-tools.css` (1t2 keeps
that file equal to the app's), label `<span>` clipped as the accessible
name, `title=` via `data-i18n-attr` as the tooltip.

**No Journey page is blocked and none is deleted.** Part 1 of this work
(`fc7e878`: a per-song `JOURNEY_RETIRED` list and a "moved" card on the page)
shipped and was reversed the same day, on Jonathan's second thought — **do not
bring back a per-song list or a "moved" card**; checks.mjs **1bn** fails the push
if either name reappears. The Journey pages are **not kept in step with the
cards**: they can disagree (the "the cure" chorus is two laps on the page and
three on the card) and that is accepted — **do not open work to sync a Journey
page's text with a card.**
