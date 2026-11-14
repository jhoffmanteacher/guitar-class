---
paths:
  - "styles.css"
  - "index.html"
---

### ⚠️ The set band carries the lesson chrome, and the rail packs itself
Test viewport: **1366×657** (a Chromebook with browser chrome). A bigger window
shows this same layout enlarged (`site-fill.js`, 2026-11-13): the rail, the band
and the 1000px column are still designed and measured at 1366×657 only, and the
short-screen rules below (`max-height:800px`) apply on a big screen too, because
site-fill.js multiplies their thresholds by the fill.

- **`.set-eyebrow` is the only sticky row.** The progress pill, "Step n of m"
  and the All steps / One at a time toggle live in the band, inside
  `<span class="se-chrome">`, not in the card. `buildLesson()` still builds them
  (same ids, keys and per-part `lessonParts()` logic) and hands them up through
  **`_lessonChrome`**; `buildSet()` reads it right after the call. So
  **`buildSet()` must call `buildLesson()` before it assembles the band**, not
  inside the same template literal.
- **Nothing may look the chrome up with `dp.querySelector`**: it is a sibling
  of `.dp`, not a descendant. `lessonChromeQ(dp, sel)` is the one lookup
  (used by `applyStationView`, `syncStationFocus`, `refreshLessonPill`).
  - `.cf-focus` on the chrome mirrors `.dp.focus`, because
    `.dp:not(.focus) .fm-count` cannot reach it.
  - `.week-panel.on-checklist` hides the chrome over the checklist panel. It is
    set by `switchTabById()` **and** by `rebuildModuleContentPanels()`, which
    restores the open tab itself.
- `.dp-head` is a **title row only**. A single-flow set (Module 13) is the only
  thing that still renders one.
- **The content column is 1000px.** Running text does not widen: `.st-text`
  and friends keep their own 70–72ch caps. Tab boards and snippet cards fill to
  ~880px. A `.step-figure` stops at **720px**, the widest raster in `img/`
  (past that the browser invents pixels). It lives inside `.st-text`, so above
  1240px one rule lets it out of the text measure.
- **The rail has two independent states.**
  - `body.rail-open` is the mobile drawer.
  - **`body.rail-collapsed`** is the 62px icon strip, toggled by
    `toggleRailCollapsed()` and remembered in `localStorage` under
    **`railCollapsed`** (try/catch, defaults to expanded).
  - They never both apply: the collapse button is `display:none` below the
    drawer breakpoint, and the narrow-layout block unwinds the collapsed rules.
  - On top of either, **an open In class card folds the rail away**
    (`body.ca-fold`, 2026-11-10; skill `in-class-activities`): `visibility:hidden`
    and width 0, not `display:none`, because the tool popups live in
    `.rail-tools` and the card's bar opens them. Neither class above changes.
  - Nav labels are **clipped, never `display:none`**: each is its button's
    accessible name. `index.html` gives every nav item and every tool a
    translated `title=`.
- **The tool dock is 1×4, icons only, above 760px** (`.rail-tools`); the
  drawer keeps the labelled 2×2. The labels do not fit a 252px row, so they are
  clipped and the tooltip carries the word.
- **The page nav is a two-column grid, at every screen size** (next section).
  `@media(min-width:761px) and (max-height:800px)` is the short-screen rail on
  top of that: it packs gaps and padding everywhere in the rail and drops the
  two station subtitles. The nav grid is not scoped to this query.

### ⚠️ Left rail nav cleanup — two-column grid is permanent, don't re-simplify it

**Labels** (label text only; same ids, onclick, routing):
- `nav.practice` reads **"Modules"**. The key is used only on this one button.
- `nav.classActivities` stays "In-Class Activities" everywhere it already was
  (the page heading, its `aria-label`, the console, the video-panel
  breadcrumb). The rail button alone reads **"In class"**, from a second,
  nav-only key, `nav.classActivitiesNav`, so those other readings keep the
  fuller phrase.

**The section panel.** A `.rail-divider` below the nav rows separates them
from the active item's own section panel (`.rail-panel`, wrapping
`.g-module`+`.g-set`). Modules is the only nav item with rail content.
Songs/Games/In class/My progress render nothing there
(`body.explore-open`/`.games-open` handle that).

**Module review is a plain row**, not a dashed `.wpill`:
- The row is `.rail-station.st-review` / `#rail-review-btn`, at the end of the
  "This set" list, alongside "The lesson" and "My skills checklist".
- `renderPills()` fills in `dataset.moduleNum`/locked/complete and un-hides the
  row only for a module that has one. `railModuleReview()` reads that dataset
  back to navigate.
- `activateSet()`/`syncRailStations()` keep its active/`aria-current` in step.
- The 🏆 trophy (`#rail-module-goal`, the module-complete reward badge) is a
  plain `.rs-num` badge on this row; `renderProgressStrip()` handles its
  `earned`/`celebrate` state.
- A module review has no tabs, so `syncRailStations()` hides the whole "This
  set" group only when NEITHER the lesson/checklist tabs NOR a Module Review
  row apply. Otherwise the lesson/checklist rows hide and the review row (if
  this module has one) stays, keeping its "you are here" highlight.

**Five nav buttons in four rows (Jonathan, 2026-09-29): In class and Modules
each take a full row, Songs | Games share the next, My progress the last.**
- `#class-activities-btn,#practice-nav-btn,#my-progress-btn{grid-column:1/-1}`.
  My progress spans both columns, so no item is left alone in column 1.
- There is **no Live quiz rail button**. Students reach the game from the
  invite and the banner; `EXPLORE_PAGES`' live-quiz entry has `btn: null`.
- Slack at 1366×657 on m4w2 Set 2 (Modules active, the worst case): **student
  17px, teacher / dev-bypass −30px**. The Preview-mode note tips it, so the
  preview rail scrolls a little in the worst case.

**The nav rows are a two-column grid, permanently, at every screen size — not a
single full-width column, and not conditional on screen height.**
- Why: single-column was shipped and measured at 1366×657: **106-132px of rail
  overflow in essentially every module**. One item per 44px-floor row (the
  tap-target pass, unnegotiable) does not fit. Jonathan's call on the real
  numbers: keep the grid, always.
  - Short labels so nothing wraps: "In class"/"En clase", "Modules"/"Módulos".
  - All five buttons the exact same height.
  - **Active state changes background+text color only.** `.nav-btn.active`
    carries no `font-weight` or size change (that read as a larger pill).
- Sizing: `.nav-btn` at 0.8125rem / 17px icon / 6px gap / 8px 6px padding;
  `.nav-list` at `repeat(2,minmax(0,1fr))` with a 4px/6px grid gap. Checked
  against both languages' labels (longest is "Canciones", 63px in a ~108px
  column).
- **Re-verify by measurement, not arithmetic, before touching any of these
  numbers.** `scrollHeight`/`clientHeight` on `.rail-scroll` read identical
  whether content fits with room to spare or exactly at the wire (a flex:1 box
  reports its allocated size either way). Compare a child-rect span (first
  child's top to last child's bottom, plus the container's own top+bottom
  padding) against the true available budget instead.
- **The service worker serves a stale `styles.css` through a plain local
  server.** Before every reload: `navigator.serviceWorker.getRegistrations()` →
  `unregister()` + `caches.keys()` → `caches.delete()`. Otherwise the
  measurement is stale.

**The header is one line, no subtitle** (Jonathan: "we can delete it from all
instances to save space").
- `header.subtitle` and `.header-sub` are gone from `index.html`, `404.html`,
  `i18n.js` and `styles.css`.
- **`--hdr` is 60px** by default (tall screen); the short-screen override is
  48px.
