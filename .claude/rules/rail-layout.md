---
paths:
  - "styles.css"
  - "index.html"
---

### ⚠️ The set band carries the lesson chrome, and the rail packs itself
**2026-09-19, "Chromebook viewing area" work order, Phase 1.** Test viewport:
**1366×657** (a Chromebook with browser chrome). The space before the first line
of the step a student reads fell from 365px of 657px to ~196px.

- **`.set-eyebrow` is the only sticky row.** The progress pill, "Step n of m"
  and the All steps / One at a time toggle live in the band, inside
  `<span class="se-chrome">`, not in the card. `buildLesson()` still builds them
  (same ids, keys and per-part `lessonParts()` logic) and hands them up through
  **`_lessonChrome`**; `buildSet()` reads it right after the call. So
  **`buildSet()` must call `buildLesson()` before it assembles the band**, not
  inside the same template literal.
- **Nothing may look the chrome up with `dp.querySelector` any more**: it is a
  sibling of `.dp`, not a descendant. `lessonChromeQ(dp, sel)` is the one lookup
  (used by `applyStationView`, `syncStationFocus`, `refreshLessonPill`).
  - `.cf-focus` on the chrome mirrors `.dp.focus`, because
    `.dp:not(.focus) .fm-count` can no longer reach it.
  - `.week-panel.on-checklist` hides the chrome over the checklist panel. It is
    set by `switchTabById()` **and** by `rebuildModuleContentPanels()`, which
    restores the open tab itself.
- `.dp-head` is a **title row only**. A single-flow set (Module 13) is the only
  thing that still renders one.
- **The content column is 1000px** (was 820). Running text does not widen:
  `.st-text` and friends keep their own 70–72ch caps, which keep a line
  readable. Tab boards and snippet cards fill to ~880px. A `.step-figure` stops
  at **720px**, the widest raster in `img/`; past that the browser invents
  pixels. It lives inside `.st-text`, so above 1240px one rule lets it out of
  the text measure.
- **The rail has two independent states.**
  - `body.rail-open` is the mobile drawer (unchanged).
  - **`body.rail-collapsed`** is the 62px icon strip, toggled by
    `toggleRailCollapsed()` and remembered in `localStorage` under
    **`railCollapsed`** (try/catch, defaults to expanded).
  - They never both apply: the collapse button is `display:none` below the
    drawer breakpoint, and the narrow-layout block unwinds the collapsed rules.
  - Nav labels are **clipped, never `display:none`**: each is its button's
    accessible name. `index.html` gives every nav item and every tool a
    translated `title=`.
- **The tool dock is 1×4, icons only, above 760px** (`.rail-tools`, 119px →
  50px); the drawer keeps the labelled 2×2. The labels do not fit a 252px row
  ("Metronome", "Temporizador", "Grabadora" all ellipsize), so they are clipped
  and the tooltip carries the word.
- **The page nav is a two-column grid, at every screen size** — see the left
  rail nav cleanup below. `@media(min-width:761px) and (max-height:800px)` is
  the short-screen rail on top of that: it packs gaps and padding everywhere in
  the rail and drops the two station subtitles. The nav grid is no longer scoped
  to this query: single-column-only-here-and-conditional was tried and reverted
  the same day (see below), once nothing conditional was needed to make it fit.

### ⚠️ Left rail nav cleanup — two-column grid is permanent, don't re-simplify it
**2026-09-20, "Left rail navigation cleanup" work order.**

**Two renames, label text only** (same ids, onclick, routing):
- `nav.practice` "Practice" → **"Modules"**. The key is only used on this one
  button, so the value change is the whole rename.
- `nav.classActivities` stays "In-Class Activities" everywhere it already was
  (the page heading, its `aria-label`, the console, the video-panel
  breadcrumb). The rail button alone reads **"In class"**, from a second,
  nav-only key, `nav.classActivitiesNav`. It was added rather than repointed,
  so those other readings keep the fuller phrase.

**The section panel.** A `.rail-divider` below the five nav rows separates them
from the active item's own section panel (`.rail-panel`, wrapping
`.g-module`+`.g-set`). Modules is the only nav item with rail content today.
Songs/Games/In class/My progress render nothing there;
`body.explore-open`/`.games-open` already handled that before this and still do.

**Module review moved off its dashed `.wpill` under the set buttons** onto a
plain row:
- The row is `.rail-station.st-review` / `#rail-review-btn`, at the end of the
  "This set" list, alongside "The lesson" and "My skills checklist".
- `renderPills()` fills in `dataset.moduleNum`/locked/complete and un-hides the
  row only for a module that has one. `railModuleReview()` reads that dataset
  back to navigate.
- `activateSet()`/`syncRailStations()` keep its active/`aria-current` in step,
  the same way the `.wpill` loop used to.
- The 🏆 trophy (`#rail-module-goal`, the module-complete reward badge) moved
  with it: same id, same `earned`/`celebrate` handling in
  `renderProgressStrip()`, now a plain `.rs-num` badge on this row instead of
  beside the "MODULE" heading. It no longer floats.
- A module review has no tabs to switch between, so `syncRailStations()` no
  longer hides the whole "This set" group whenever the open panel lacks a
  `.tab-panel`. The group disappears only when NEITHER the lesson/checklist tabs
  NOR a Module Review row apply. Otherwise the lesson/checklist rows hide and the
  review row (if this module has one) stays, keeping its "you are here"
  highlight while you're looking at it.

**Layout changed 2026-09-29 (Jonathan): In class and Modules each take a full
row, Songs | Games share the next, My progress the last.**
- `#class-activities-btn,#practice-nav-btn,#my-progress-btn{grid-column:1/-1}`.
- The **Live quiz rail button is gone**. Students reach the game from the
  invite and the banner; `EXPLORE_PAGES`' live-quiz entry has `btn: null`.
- This is one row taller than the grid below describes. Measured the same way
  at 1366×657 on m4w2 Set 2: **student 17px slack (was 63), teacher /
  dev-bypass −30px (was +16)**. The Preview-mode note tips it, so the preview
  rail scrolls a little in the worst case.
- The grid itself and the sizing numbers below still hold.

**The nav rows are a two-column grid, permanently, at every screen size — not a
single full-width column, and not conditional on screen height.**
- Why: the work order's first draft asked for single-column ("In-Class
  Activities" wrapped to two lines and wanted fixing). Shipped and measured at
  1366×657 (the Chromebook viewport the *previous day's* rail work order was
  written for), it lost again the two nav rows the 2026-09-19 packing had
  won back: **106-132px of rail overflow, confirmed for essentially every
  module**, not just the worst case. Five 44px-floor rows (the tap-target pass,
  unnegotiable) are simply taller than three.
- Jonathan's call on seeing the real numbers: keep the grid, always.
  - Same short labels so nothing wraps: "In class"/"En clase",
    "Modules"/"Módulos", not the old long phrases.
  - All five rows the exact same size.
  - **Active state changes background+text color only.** `.nav-btn.active`
    carries no `font-weight` or size change any more; that, not the grid, was
    the other half of "renders as a larger pill".
  - `#my-progress-btn{grid-column:1/-1}` spans both columns on its own row,
    not auto-placed into a lone column-1 cell (the original "orphan row"
    complaint).
- Sizing: `.nav-btn` at 0.8125rem / 17px icon / 6px gap / 8px 6px padding;
  `.nav-list` at `repeat(2,minmax(0,1fr))` with a 4px/6px grid gap. Checked
  empirically against both languages' labels (longest is "Canciones", 63px in a
  ~108px column), not assumed.
- **Re-verify by measurement, not arithmetic, before touching any of these
  numbers.** `scrollHeight`/`clientHeight` on `.rail-scroll` read identical when
  content fits with room to spare and when it is exactly at the wire, because a
  flex:1 box reports its allocated size either way. Compare a child-rect span
  (first child's top to last child's bottom, plus the container's own
  top+bottom padding) against the true available budget instead.
- **The service worker will serve a stale `styles.css` through a plain local
  server during exactly this kind of iteration.** Before every reload:
  `navigator.serviceWorker.getRegistrations()` → `unregister()` +
  `caches.keys()` → `caches.delete()`. Otherwise the measurement is stale and
  every conclusion drawn from it is wrong (two rounds of "why didn't my edit
  change anything" both traced back to this).

**The header lost its subtitle line in the same session** (Jonathan: "this text
isn't necessary… we can delete it from all instances to save space").
- `header.subtitle` ("Independent Practice and Skills Tracker") is gone from
  `index.html`, `404.html` and `i18n.js`. `.header-sub` and its two dead
  `display:none` overrides (phone width, short height) are gone from
  `styles.css`.
- The header is one line everywhere, so **`--hdr` dropped 70px→60px** for the
  default (tall-screen) case. The short-screen override already read 48px and
  needed no change: `.header-sub` was already hidden there and the measured
  rendered height already matched.
- Measured, not estimated, at 1366×657 with Modules active on m4w2 (4 sets +
  Module review, two parts — the standing worst case): the rail fits with
  **~19px of slack for the teacher/dev-bypass view (Preview-mode banner
  showing) and ~66px for a real student (no banner)** — comfortably inside
  budget, not a bare fit like the previous day's razor-thin 527-in-527px.
