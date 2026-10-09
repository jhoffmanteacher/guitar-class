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
