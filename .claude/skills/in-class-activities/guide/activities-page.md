## In-Class Activities page & the activity gate
**In-Class Activities** (the name since Jonathan, 2026-09-17; key
`nav.classActivities`, hash `#class-activities`) is the site's home page:
`showApp()` opens it whenever the URL carries no explore hash.
`renderClassActivities()` (`app/activities-list.js`) builds three groups (named by Jonathan
2026-09-23):
- **Today's activity** (`ca.startHere`) — every card dated today or yesterday
  (below), collapsed like every other card, not forced open (Jonathan,
  2026-09-15); two or more sit side by side as half-width tiles.
- **Unfinished activities** (`ca.stillToDoGroup`) — one fold, open by default,
  newest first, module headings when cards are placed. No nested "Older" fold.
- **Completed activities** (`ca.finishedGroup`).

The resume card (`renderResumeCard()`, `#resume-card`) sits at the end of
this page when nothing is blocking, never in the module/set view.

**Today's activity: EVERY card released TODAY or YESTERDAY, pending first,
then finished** (Jonathan, 2026-11-09, evening: "everything with a date either
for the current day or dated the day before; everything else is unfinished
work"). Yesterday is the CALENDAR day before (`caTodayWindow()`), not the last
class day: on a Monday, Friday's cards are Unfinished (his pick). No cap
(`CA_TODAY_MAX` is gone). `caTodayStr()` is the one "today" the release-date
gate (`caIsVisible`) and Today both read; 1cq stubs it. In
`renderClassActivities()`:
- `pendingPool`: every pending visible card, newest `caDate` first, undated
  last; within one date required before optional, then by board position
  (`byPos`): TODAY's cards lowest number first (#11 above #12), every older
  day's HIGHEST number first, the same as the folds (Jonathan, 2026-11-17,
  "highest number first": yesterday's #21 and #22 under today's #23 read
  23 | 22, then 21; until then yesterday read lowest first, 23 | 21, then 22).
  The hero pick, `todayDone` and the Since group (`caSinceMissed`) use the same
  rule, so the top card is still the hero. `todayPending` = the ones dated today or yesterday,
  REQUIRED FIRST (not optional, not cleared for this student), then by date
  and board position (`caRequiredFirst`, Jonathan, 2026-11-14: "fix it so the
  optional cards are below").
- **The first pending card on the page is the hero** (2026-11-14), so the
  toast "Your next activity is at the top" is true. The Unfinished fold puts
  each module's required cards above its optional ones (otherwise its old
  reading order). When something pending would still sit above the hero (only
  optional or cleared cards in Today, or an optional-only newer module in the
  fold), the hero is drawn FIRST in Today's grid with its date chip and leaves
  Since / Unfinished. 1cq pins it (5b and the toast case).
- The hero (`caStartHereId`): required and unfinished first (Jonathan,
  2026-11-12, "required and unfinished first"): the newest pending REQUIRED
  card whatever its date, an optional one only when no required card is
  pending, never a card the teacher cleared for this student; null when
  nothing but cleared cards is pending.
- `todayDone`: every FINISHED card dated today or yesterday, appended BELOW
  the pending ones, today's first, then by `byPos` as above (2026-11-09:
  "In Today, marked done" — re-dating puts a card back in Today for everyone;
  nothing is reset or written). A finished card never takes a pending card's
  place. An older finished card stays in Completed only.
- The heading is dated today; yesterday's cards wear a `.ca-chip`. No card of
  either day → no heading, and the Unfinished fold (open by default) is the
  top of the page.
- **Keep in Today's activities** (Jonathan, 2026-11-16: "add an option next
  to the release date that has a checkbox for 'keep in today's activities'").
  A checkbox beside the release date in `publishBlock` (`teacherActivityCtlKit`,
  so the board card and the Settings tab's Release row both draw it, in all
  three publish states) writes `config/class.keepTodayActivities` (`{ id: true }`,
  cell-checked, `teacherSetActivityKeepToday`; untick deletes the key). Students
  read it as `keepTodayActivityIds` (cached as `caKeepToday`, an input of
  `classConfigSignature`); `caKeptInToday(a)` makes `inToday` true on every day
  after the date too, until unticked. Only VISIBLE cards are in `list`, so the
  tick never shows a card before its date, Hidden, archived, deleted or given to
  other students. A kept card sorts by its own date (below today's and
  yesterday's, required before optional as ever), wears its date chip, and a
  finished one stays in Today as a ✓ row. It is NOT read by `caIsVisible`, the
  blockers, the hero rule or the board; Archive keeps it, Delete clears it; the
  console's "Behind the class" filter leaves a kept card out (it is still Today's
  work). Off by default; checks.mjs **1eo** (console box, writer, default) and
  **1cq** case 13 (the page); `tools/visible-loop.mjs` R16.
- `caTodayIds` = pending + finished Today cards. Pending ones draw with
  `caHeroCardHtml`; finished ones with the Completed fold's own row
  (`caActivityCardHtml`: ✓, no hero dots), not repeated in the Completed fold
  or counted as unfinished. Nothing pending → the caught-up box, then the
  finished Today cards. The toast and the resume card read `caStartHereId`,
  never the group's size. A deep link to a finished Today card leaves the
  Completed fold shut (`caFocusActivity` decides the fold after the render).
- One heading (`caTodayHeadHtml(day)`) with the newest visible date; a card from
  another day wears its own `.ca-chip` (`caHeroChipHtml` / the `chipIso`
  argument). The group always holds a card of that day, so the heading is always
  "Today's activity": the OLDER wording ("Unfinished · From <day>", the quieter
  `--ca-accent-soft` band) could no longer appear and was deleted with its CSS
  and its `ca.notFinished` / `ca.heroFromDate` strings.
- Only visible cards count: a future date, Hidden or another student's card
  never sets the newest date or takes a slot.
- **Side by side** (Jonathan, 2026-11-10, work order Part 3): the Today cards
  sit in ONE `.ca-today-grid`, two equal columns, in the order above, so they
  read (and Tab) left to right, then down. One card keeps the whole width;
  two or more (`.ca-today-grid--multi`) are half-width tiles with no hero
  thumbnail, the title across the whole tile and the Start button at the right
  beside the blurb (beside the title it left 299px and six Spanish titles took
  three lines). A finished card keeps its own row height. An open card takes
  the whole width (`.ca-solo-path` → `display:block`). Two columns only when
  each tile gets 440px (`repeat(auto-fit,minmax(min(100%,440px),1fr))`): two at
  1366×657 and wider (the column stops at 944px), one at 125% zoom, in a narrow
  window and on a phone (≤760px also keeps the stacked hero).
  **Look 1, Part 2 (Jonathan, 2026-11-17):** every Today tile has its kind
  picture as a block at its left edge (`caKindPicHtml`, decoration,
  `aria-hidden`, inline SVG: a play-along card a note, a ladder with a strum
  pattern down/up arrows, everything else bars), the title on ONE line and
  ONE line saying where the student is (`caWhereLine`: "Step 2 of 4: D5" for
  a ladder, the first step not done on the route, the name as Part 1's step
  buttons show it; a practice card, an exit check or an unstarted ladder
  with an unnamed step keeps the intro's first sentence), both ending in an
  ellipsis; then the dots and the button with today's words. The
  **Unfinished rows are two columns** (`.ca-todo-grid`, one per module fold,
  `repeat(auto-fill,minmax(min(100%,400px),1fr))`, same order read left to
  right), each row with its kind picture (`caKindRowHtml`: the row from
  `caActivityCardHtml` with the picture put first in its summary; app/cards.js
  is not edited) and its number and title on one line. The Completed fold
  draws no picture. A finished card in Today carries the picture too. The
  page heading and "Today's activity" were NOT put on one line (the "In
  class" title is the sticky bar; the Today label would stick over the
  lists). Guards: checks.mjs **1cq** (the grid per fold, every row's
  picture in order, none in Completed, the CSS) and **1da** (the fold call
  site with its grid); `tools/smoke.mjs` `todayGridWalk` (titles one line,
  the Unfinished rows two equal columns with pictures, a card opened from
  each column). Nothing about WHICH cards are in Today, their
  order, `caStartHereId`, the chips, the Optional tag or the caught-up box
  changed. `tools/smoke.mjs` `todayGridWalk` measures the three longest titles
  a student can be given, in both languages.
- checks.mjs **1cq** runs the real page (17 runs × EN + ES).

**Reading order is newest-first, not the teaching order** (Jonathan,
2026-09-17): newest module on top, and within it the highest board position.
- `caBoardOrder()`/`caNumber()` still compute the ascending course order; the
  console, gating and deep links key off it. A card's "#N" never moves: only
  `renderClassActivities()` reverses `view.sections` and each section's ids,
  and the "Completed activities" order falls out of the same reversal (no
  second `.reverse()`).
- **Exception — the current day reads lowest number first** (Jonathan,
  2026-11-02): cards sharing the first card's date (in this order) trade places
  among themselves so #11 sits above #12. Applied once to `groups`, so the
  Unfinished and Completed folds agree; module grouping is untouched. Older
  days stay highest first. The Today group is NOT read from this order since
  2026-11-09 (by release date, above).

**Where the student is survives a reload.**
- `caSyncHash()` (from `caSyncTopbar()`) `replaceState`s
  `#class-activities/<id>` while a card is open, plain `#class-activities` when
  none is; a reload or Back reopens it through `caFocusActivity()`.
- Step ticks and practice-card checks (`caStepDone`, keys `<id>:<n>` /
  `<id>:c<n>`) are **saved to the progress doc as `caSteps`** (Jonathan,
  2026-10-01: they must not reset each day or live on the Chromebook). Read by
  `loadProgress()`; written through `onCaStepChange()` with the same
  set/`FieldValue.delete()` shape as `classActivities`. `caAdoptLocalTicks()`
  folds in the old per-day `localStorage` copy (`caStepsToday`) once.
- Only the revealed-tab set still resets per student/day
  (`caResetRevealsIfNewDay()`).

**An open card fills the page** (Jonathan, 2026-11-10: "an open activity
should fill the page").
- With a card open, `caSyncSolo()` sets `body.ca-fold`: the site header and
  the left menu fold away, **full screen or not**. A reload on
  `#class-activities/<id>` reopens the card folded. "◀ All activities"
  (`caCloseOpen`) brings both back, and so does leaving for another page (the
  CSS is scoped to `#class-activities-screen:not([hidden])`).
- The **Full screen** button adds `body.ca-full`, which zooms the 1000px
  column (`caSyncFullZoom`) of a practice card or an exit check. An open
  Focus step is already full width (`body.ca-wide`, below), so full screen
  gives it the browser's height and no zoom (`--ca-zoom` 1).
- **An open Focus step fills the screen** (Look 1, Jonathan, 2026-11-17: "the
  class activities get the most use so the redesign of those is paramount").
  `caSyncSolo()` sets `body.ca-wide` for an open `view: 'focus'` card past its
  path picker; the 1000px column is lifted to the window less 40px a side.
  NOT for a practice card, an exit check or the path picker (they keep
  1000px), and not below 761px (the phone keeps its layout). This reverses
  "Does the new default view scale things up? No" (2026-11-10) for a Focus
  step only. In that view (styles.css, "Look 1"):
  - the direction line (`.ca-step-dir`, a span `caStepHtml` puts round the
    Focus line) is 22px, weight 600, still ONE line in both languages;
  - the strum board scales with its width through container units (a
    two-bars-a-row board's arrows about 82px, a `barsPerRow: 4` board's
    about 41px); `buildStrum()`'s markup is unchanged and every other caller
    (module steps, the path picker's previews, the console, ca-52's check)
    keeps today's size;
  - a tab gets wider, never taller (string spacing and rows-per-page fixed);
  - a drill keeps its size, centred (`.ca-step-drill`, max 944px);
  - the Back / Got it row (`.ca-focus-nav`) is pinned to the bottom of the
    screen, the same place on every step; the column's bottom padding keeps
    the step scrolling above it. It rides up over the offline bar and the
    practice copy's strip (`PC_RIDE_UP`, firebase-config.js).
- **The step row** (`caStepRowHtml`, Look 1): a Focus card's step buttons
  are a row of their own under the bar again, sticky with it (`--ca-bar-h`),
  each showing its number (✓ when done) and its step's name: the `label`
  less a leading "Practice — " / "Practica — " (`caStepShortName`, render
  time, data untouched). On a paths activity "Path: … / Change path" sits at
  its right end. When the names would wrap, `caFitStepRow()` (from
  `caFitBar`, measured, never worked out) adds `.ca-step-row--tight` and only
  the step on screen keeps its name. From 2026-10-10 to 2026-11-17 the
  buttons rode in the bar as bare numbers ("a row of their own cost 48px of
  every step"); the step's own head line (`.ca-step-head--focus`) is now off
  screen instead (visually hidden, still focusable for `caFocusGo`, still
  printed), so the height is the same. Each button's accessible name is the
  whole "Step 2 of 4: Practice — D5". A Focus card's bar has no "n of m done".
- The rail's Tuner / Timer / Metro go with the rail, so the bar
  carries three round copies (Record was removed from the dock and the bar
  2026-11-14; both go together, or the bar keeps an empty button that throws) (`caBarFabsHtml`, in `.ca-bar-tools` before Print
  and Full screen). Each runs the dock's own `togglePopup()` and opens the
  dock's own popup; styles.css un-hides an open popup and pins it under the
  bar's buttons (`caPlaceToolPopups`). The rail is hidden by `visibility`, not
  `display:none`, for that reason. `railCollapsed` is never touched.
- **The practice-minutes strip rides in the bar** (Look 1, Jonathan,
  2026-11-17: "show them in the activity's top bar"), for every kind of card,
  first in `.ca-bar-tools`: `PM.stripHtml()`, a plain `.pm-strip` that
  `refreshStrip()` keeps current and removes when the display is switched
  off; '' when the display is off or nobody is signed in. A light pill.
  `practice-minutes.js` is unchanged.
- The bar stays ONE row at 1366×657: when it would wrap (the longest Spanish
  title, the Optional tag and a "999/600 min" strip on the 1000px column),
  `caFitBar()` measures it and `.ca-bar-tight` drops the Full screen word
  (icon kept) and closes the gaps. With the strip in the bar this happens on
  ca-46's path picker and ca-52 in Spanish, and on a Spanish practice card
  while the song's Stop shows with the Optional tag (pm-e2e pins it).
- Hidden while a card is open: Find, Español, the account area and
  `#pm-header` (the copy in the bar shows instead; the two never show
  together). Minutes still count; a practice-minutes pill (week-goal toast,
  recap) still waits for the header (`anchorStrip()` reads only the host
  strips).
- Guards: checks.mjs **1cr** (real `caSyncSolo`/`caSyncTopbar`/`caBarTool`,
  `body.ca-wide` for a Focus step and not for a card, a check or the picker,
  plus the CSS rules incl. the wide column and the pinned Got it), the
  practice-minutes block (the bar draws the strip once), `tools/smoke.mjs`
  `foldWalk` and `wideStepWalk` (Got it does not move, the next name becomes
  current, a reload reopens the same view).
- **Mark complete** closes the card, scrolls to the top and toasts
  `ca.doneNextToast` / `ca.doneAllToast`. Un-marking keeps the card open.
- A second tap on the current rail row (In class, Songs, My progress, Modules)
  scrolls to the top; it does not close the page. Games is a dialog toggle: a
  second tap closes it.

**The "Keep practicing" row — pins (Jonathan, 2026-10-10).** For cards he
reuses on many days (the play-along cards, ca-23).
- `config/class.activityPins` is an ORDERED array of up to 4 ids, set by the
  board's **Not pinned / Pinned n of 4** switch (`teacherSetActivityPin`,
  cell-checked on the whole array) and listed, with Unpin buttons, above the
  board.
- Students get one button per pin above Today's activity (`caPinRowHtml`);
  no pins, no row.
- A pin that is also one of today's cards STAYS in the row (Jonathan,
  2026-10-13 — don't bring back the filter that dropped it).
- A tap (`caOpenPin` → `caFocusActivity`) opens a dated card where it sits. A
  pin-only card (`caIsPinOnly`: undated, or Play Along now) renders under the
  row while it is the open card.
- The pin stands in for the release date for the ROW only. **Don't fold it
  into `caIsVisible()`**; no blocker rule or Today's activities reads it.
  (Keeping a card in Today is the separate "Keep in Today's activities" box,
  above: it needs the release date to have arrived.)
- Hidden, Archive, Delete (both unpin; Restore does not re-pin) and "not
  assigned" still win (`caPinReachable`). Exit checks are never pinnable.
  Cached as `caPins`.

**There is no Assessments page** (removed 2026-09-20, Jonathan: rubrics and
assignments go on Canvas). **The Module Review's per-module assessment box is
a separate, live feature; don't confuse the two**: `.mr-assess-box` at the bottom of
`buildModuleReview()` and its heads-up pop (`buildMrAssessPop`), reading
`MODULE_REVIEWS[n].assessItems`.

**The rail** is five buttons — In class · Modules · Songs · Games · My progress
(layout: `.claude/rules/rail-layout.md`), no "Explore" heading (`nav.explore` stays as the rail `<nav>`'s
aria-label).
- Keep practicing and Daily Review are sections inside My progress.
  `renderKeepPracticing()` and `renderDailyReview()` are UNCHANGED;
  `openMyProgressScreen()` calls all three renderers (Daily Review, Keep
  practicing, then the module tally).
- `#keep-practicing` and `#daily-review` stay in `EXPLORE_HASHES`, but
  `routeExploreHash()` canonicalizes both to `#my-progress` before anything
  else runs (the gate check, the dedup guard, the scroll stash), so an old
  bookmark or Journey link lands on the merged page.
- `mood-chart.html` still ships (not precached — `SHELL_NOT_PRECACHED` in
  checks.mjs) but nothing links to it (Jonathan, 2026-10-02). Don't add a
  link back without asking.
