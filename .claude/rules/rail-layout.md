---
paths:
  - "styles.css"
  - "index.html"
---

### ⚠️ The set band carries the lesson chrome, and the rail packs itself
**2026-09-19, "Chromebook viewing area" work order, Phase 1.** Test viewport
is **1366×657** — a Chromebook with browser chrome. Before this, 365px of a
657px screen was spent before the first line of the step a student was
meant to be reading; it is ~196px now.

- **`.set-eyebrow` is the only sticky row.** The progress pill, "Step n of
  m" and the All steps / One at a time toggle moved out of the card and
  into the band, inside `<span class="se-chrome">`. `buildLesson()` still
  builds them (same ids, keys and per-part `lessonParts()` logic) and hands
  them up through **`_lessonChrome`**, which `buildSet()` reads right after
  calling it — so **`buildSet()` must call `buildLesson()` before it
  assembles the band**, not inside the same template literal.
- **Nothing may look the chrome up with `dp.querySelector` any more** — it
  is a sibling of `.dp`, not a descendant. `lessonChromeQ(dp, sel)` is the
  one lookup, used by `applyStationView`, `syncStationFocus` and
  `refreshLessonPill`. `.cf-focus` on the chrome mirrors `.dp.focus`
  (`.dp:not(.focus) .fm-count` could no longer reach it), and
  `.week-panel.on-checklist` hides the chrome over the checklist panel —
  set by `switchTabById()` **and** by `rebuildModuleContentPanels()`, which
  restores the open tab itself.
- `.dp-head` is a **title row only** now; a single-flow set (Module 13) is
  the only thing that still renders one.
- **The content column is 1000px** (was 820). Running text does not widen
  with it — `.st-text` and friends keep their own 70–72ch caps, which is
  what keeps a line readable. Tab boards and snippet cards now fill to
  ~880px; a `.step-figure` stops at **720px**, which is the widest raster
  in `img/` — past that the browser invents pixels. It lives inside
  `.st-text`, so above 1240px one rule lets it out of the text measure.
- **The rail has two independent states.** `body.rail-open` is the mobile
  drawer (unchanged); **`body.rail-collapsed`** is the new 62px icon strip,
  remembered in `localStorage` under **`railCollapsed`** (try/catch,
  defaults to expanded) and toggled by `toggleRailCollapsed()`. They never
  both apply — the collapse button is `display:none` below the drawer
  breakpoint, and the narrow-layout block unwinds the collapsed rules. Nav
  labels are **clipped, never `display:none`**: they are each button's
  accessible name, and `index.html` gives every nav item and every tool a
  translated `title=`.
- **The tool dock is 1×4, icons only, above 760px** (`.rail-tools`, 119px →
  50px) and keeps the labelled 2×2 on the drawer. The labels do not fit in
  a 252px row — "Metronome", "Temporizador", "Grabadora" all ellipsize — so
  they are clipped and the tooltip carries the word.
- **The page nav is a two-column grid, at every screen size** — see the
  left rail nav cleanup below. `@media(min-width:761px) and (max-height:800px)`
  is the short-screen rail on top of that: it packs gaps and padding
  everywhere in the rail and drops the two station subtitles, but the nav
  grid itself is no longer scoped to this query — it was tried
  single-column-only-here-and-conditional and reverted the same day (see
  below) once nothing conditional was needed to make it fit.

### ⚠️ Left rail nav cleanup — two-column grid is permanent, don't re-simplify it
**2026-09-20, "Left rail navigation cleanup" work order.** Two renames, label
text only, same ids/onclick/routing: `nav.practice` "Practice"→**"Modules"**
(only used on this one button, so the value change is the whole rename);
`nav.classActivities` stays "In-Class Activities" everywhere it already was
(the page heading, its `aria-label`, the console, the video-panel breadcrumb)
but the rail button alone now reads **"In class"** off a second, nav-only key,
`nav.classActivitiesNav` — added rather than repointed, so those other
readings keep the fuller phrase. Below the five nav rows, a `.rail-divider`
now separates them from the active item's own "section panel"
(`.rail-panel`, wrapping `.g-module`+`.g-set`) — Modules is the only nav item
with rail content today; Songs/Games/In class/My progress render nothing
there, which `body.explore-open`/`.games-open` already handled before this
and still does. **Module review moved off its dashed `.wpill` under the set
buttons** and onto a plain row (`.rail-station.st-review`, `#rail-review-btn`)
at the end of the "This set" list, alongside "The lesson" and "My skills
checklist" — `renderPills()` fills in `dataset.moduleNum`/locked/complete and
un-hides it only for a module that has one, `railModuleReview()` reads that
dataset back to navigate, and `activateSet()`/`syncRailStations()` keep its
active/`aria-current` in step the same way the `.wpill` loop used to. The
🏆 trophy (`#rail-module-goal`, the module-complete reward badge) rode down
with it — same id, same `earned`/`celebrate` handling in
`renderProgressStrip()`, just relocated from beside the "MODULE" heading
onto this row as a plain `.rs-num` badge; it no longer floats. Because a
module review has no tabs to switch between, `syncRailStations()` no longer
hides the whole "This set" group whenever the open panel lacks a
`.tab-panel` — only when NEITHER the lesson/checklist tabs NOR a Module
Review row apply does the group disappear; otherwise the lesson/checklist
rows hide and the review row (if this module has one) stays, so it keeps its
"you are here" highlight while you're actually looking at it.

**Layout changed 2026-09-29 (Jonathan): In class and Modules each take a
full row, Songs | Games share the next, My progress the last** —
`#class-activities-btn,#practice-nav-btn,#my-progress-btn{grid-column:1/-1}`,
and the **Live quiz rail button is gone** (students reach the game from the
invite and the banner; `EXPLORE_PAGES`' live-quiz entry has `btn: null`).
It is one row taller than the grid below describes, and measured the same
way at 1366×657 on m5w2 Set 2: **student 17px slack (was 63), teacher /
dev-bypass −30px (was +16)** — the Preview-mode note is what tips it, so
the preview rail scrolls a little in the worst case. The grid itself and the
sizing numbers below still hold.

**The nav rows are a two-column grid, permanently, at every screen size —
not a single full-width column, and not conditional on screen height.** The
work order's first draft asked for single-column ("In-Class Activities"
wrapped to two lines and wanted fixing); shipped and measured against the
1366×657 Chromebook viewport the *previous day's* rail work order was
written for, it cost the two nav rows the 2026-09-19 packing had bought
back — **106-132px of rail overflow, confirmed for essentially every
module**, not just the worst case, because five 44px-floor rows (the
tap-target pass, unnegotiable) is simply taller than three. Jonathan's call
on seeing the real numbers: keep the grid, always — same short labels so
nothing wraps ("In class"/"En clase", "Modules"/"Módulos", not the old long
phrases), all five rows the exact same size, **active state changes
background+text color only** (`.nav-btn.active` carries no `font-weight` or
size change any more — that, not the grid, was the other half of "renders as
a larger pill"), and `#my-progress-btn{grid-column:1/-1}` spans both columns
on its own row rather than being auto-placed into a lone column-1 cell (the
original "orphan row" complaint). Sizing: `.nav-btn` at 0.8125rem/17px
icon/6px gap/8px 6px padding, `.nav-list` at `repeat(2,minmax(0,1fr))` with a
4px/6px grid gap — checked empirically against both languages' labels
(longest is "Canciones" at 63px in a ~108px column) rather than assumed.
**Re-verify by measurement, not arithmetic, before touching any of these
numbers** — `scrollHeight`/`clientHeight` on `.rail-scroll` read identical
when content fits with room to spare vs. exactly at the wire, because a
flex:1 box reports its allocated size either way; compare a child-rect span
(first child's top to last child's bottom, plus the container's own
top+bottom padding) against the true available budget instead. **The
service worker will serve a stale `styles.css` through a plain local
server during exactly this kind of iteration** — `navigator.serviceWorker
.getRegistrations()` → `unregister()` + `caches.keys()` → `caches.delete()`
before every reload, or the measurement is stale and every conclusion drawn
from it is wrong (this cost real time here: two rounds of "why didn't my
edit change anything" both traced back to this).

**The header lost its subtitle line in the same session** (Jonathan: "this
text isn't necessary… we can delete it from all instances to save space") —
`header.subtitle` ("Independent Practice and Skills Tracker") is gone from
`index.html`, `404.html` and `i18n.js`; `.header-sub` and its two dead
`display:none` overrides (phone width, short height) are gone from
`styles.css`. The header is one line everywhere now, so **`--hdr` dropped
70px→60px** for the default (tall-screen) case; the existing short-screen
override already read 48px and needed no change, since `.header-sub` was
already hidden there before this and the measured rendered height already
matched. Confirmed by measurement, not estimate: at 1366×657 with Modules
active on m5w2 (4 sets + Module review, two parts — the standing worst
case), the rail fits with **~19px of slack for the teacher/dev-bypass view
(Preview-mode banner showing) and ~66px for a real student (no banner)** —
comfortably inside budget, not a bare fit repeating the previous day's
razor-thin 527-in-527px.
