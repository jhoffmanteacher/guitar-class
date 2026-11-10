---
name: in-class-activities
description: How the guitar site's In-Class Activities page, activity gate, exit checks and practice cards work: caBlockers/caIsVisible, Today's activity, Open-through, optional/CAS, clears, archive/delete, Journey gating, four-step/two-line rules, view:'card' practice cards and whole-song cards, Play Along now, Songs Core rows, render-time hiding (visibleSteps/visibleSections, section kinds), the two step renderers (caStepHtml / renderTeacherActivityDetail), the activity board and numbering (activityBoard, caBoardOrder, teacherMoveActivity, series numbers in titles), and the play-along-first song links (openSongLink, songsPlayAlongCard, TAKE_TO_SONG_ENABLED). Read BEFORE editing class-activities.js, the ca*/ec*/pc* code in app.js, teacher.js activity/console code, or tabs/journey.js gating.
---

## Exit checks — the end-of-period product

An exit check is a class activity with `kind: 'check'` (schema at the top of
`class-activities.js`).
- Five auto-graded questions, one try. Two item types: `nextNote` and `noteName`.
- The result goes to `progress/{uid}.exitChecks[id]` plus `classActivities[id] = true`.
  No `firestore.rules` change was needed: the teacher already reads the progress doc whole.
- Engine: the `ec*` functions in `app.js`.
- The student card and the console preview share `caCheckBodyHtml()` **on
  purpose** — don't fork it.
- Console: turned-in count and average in the Activities table; a
  per-student, per-question grid and a "Missed by" row on the detail page.
- checks.mjs **1y** guards the data (`1x` is the orphaned-assets check). It
  recomputes every answer key from the fretboard: a wrong `answer` doesn't look
  broken, it just marks a correct student wrong.
- Checks take no `#N`: `caBoardOrder()` skips them when it hands out 1..N;
  the board shows "Check" in the `#` box.
- Pace: about one check per week (Jonathan, 2026-09-09).

**Post one with its own link:** `#class-activities/<id>` opens the Class
activities page with that card expanded and scrolled to (`caFocusActivity()` in
`app.js`); the console has a **Copy link** button per row. The hash router splits on `/`
(`exploreHashBase` / `exploreHashTail`): a new deep link takes that shape, not
a query param. An unpublished id gets `ca.linkMissing` above the archive.

Easy to break without noticing:

- **Stored exit-check picks are POSITIONAL — editing a shipped check's
  `items` silently re-grades every result.** `res.picks` is indexed by item
  position, and `ecGrade()` re-grades it against whatever `items` says now. An
  inserted, removed or reordered item leaves the stored `score` (which the
  console prints) beside per-question cells for different questions. 1y passes
  straight through this. Edit a check before students reach it, or treat its
  `items` as frozen once they have.
- **Seed the MC shuffle on language-stable data.** `ecChoicesHtml` seeds on
  the `fret·note` pairs, never the rendered chip labels ("fret 5 · A" and
  "traste 5 · A" would deal a different order per language).
- **The `noteName` board is drawn with `theme:'web'` plus the dark-mode
  invert**, not on CSS variables: its fretted-note circle is a hardcoded light
  green, so a variable-themed `?` would be light-on-light in dark mode.

## In-Class Activities page & the activity gate
**In-Class Activities** (the name since Jonathan, 2026-09-17; key
`nav.classActivities`, hash `#class-activities`) is the site's home page:
`showApp()` opens it whenever the URL carries no explore hash.
`renderClassActivities()` (app.js) builds three groups (named by Jonathan
2026-09-23):
- **Today's activity** (`ca.startHere`) — up to three cards by release date
  (below), collapsed like every other card, not forced open (Jonathan,
  2026-09-15).
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
  last; within one date required before optional, then lowest board position
  (#11 above #12). `todayPending` = the ones dated today or yesterday.
- The hero (`caStartHereId`) is the first PENDING required card of Today (an
  optional one only when nothing required is left there); with nothing
  pending in Today it is the newest pending card in the Unfinished fold, so it
  is null only when nothing at all is pending.
- `todayDone`: every FINISHED card dated today or yesterday, appended BELOW
  the pending ones, today's first, then lowest board position (2026-11-09:
  "In Today, marked done" — re-dating puts a card back in Today for everyone;
  nothing is reset or written). A finished card never takes a pending card's
  place. An older finished card stays in Completed only.
- The heading is dated today; yesterday's cards wear a `.ca-chip`. No card of
  either day → no heading, and the Unfinished fold (open by default) is the
  top of the page.
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
- The **Full screen** button is unchanged: it adds `body.ca-full`, which only
  zooms the column (`caSyncFullZoom`). The folded view stays at 1×.
- The rail's Tuner / Timer / Metro / Record go with the rail, so the bar
  carries four round copies (`caBarFabsHtml`, in `.ca-bar-tools` before Print
  and Full screen). Each runs the dock's own `togglePopup()` and opens the
  dock's own popup; styles.css un-hides an open popup and pins it under the
  bar's buttons (`caPlaceToolPopups`). The rail is hidden by `visibility`, not
  `display:none`, for that reason. `railCollapsed` is never touched.
- The bar stays ONE row at 1366×657: when it would wrap (a Focus card with 6–7
  step buttons, mostly in Spanish), `caFitBar()` measures it and
  `.ca-bar-tight` drops the Full screen word (icon kept) and closes the gaps.
- Hidden while a card is open: Find, Español, the account area and
  `#pm-header`. Minutes still count; a practice-minutes pill waits for the
  header (`anchorStrip()` finds no strip).
- Guards: checks.mjs **1cr** (real `caSyncSolo`/`caSyncTopbar`/`caBarTool`
  plus the CSS rules), `tools/smoke.mjs` `foldWalk`.
- **Mark complete** closes the card, scrolls to the top and toasts
  `ca.doneNextToast` / `ca.doneAllToast`. Un-marking keeps the card open.
- A second tap on the current rail row (In class, Songs, My progress, Modules)
  scrolls to the top; it does not close the page. Games is a dialog toggle: a
  second tap closes it.

**⚠️ The LOCK is switched off (Jonathan, 2026-10-07: "stop locking the
other parts of site if class activities aren't cleared… CA should still pop
up as normal on login").** `const CA_GATE_LOCKS = false;` beside
`applyActivityGate()` in app.js and `var JOURNEY_GATE_LOCKS = false;` in
`tabs/journey.js` are the whole switch; `true` restores the lock below exactly.
- Still live: `caBlockers()` computes, and `showApp()` lands a student with
  any blocker on In-Class Activities at sign-in **whatever the hash** — except
  a `GATE_OPEN_HASHES` hash (e.g. a `#class-activities/ca-N` deep link) or a
  return from a Song Journey page. The console's Clear / "Blocked by N" tools
  now only decide who gets that landing.
- Dormant while off: `applyActivityGate()` never sets `body.ca-gated` (only
  `window.__forceGate` on localhost does), so the hidden rail,
  `routeExploreHash()`'s redirect, `returnToPractice()`'s guard and the
  mid-session flip redirect never run; the Journey gate card is off through
  `JOURNEY_GATE_LOCKS`.

**The gate, as it runs when switched on:** `caBlockers()` — a visible
(`caIsVisible`), undone (`classActivities[id]!==true`), uncleared activity or
check — drives `body.ca-gated` via `applyActivityGate()`.
- Gate previewers (`isGatePreviewer()`: teacher, dev bypass) never see it. A
  failed progress load (`progressLoadFailed`) reads as "nothing blocking":
  never lock on a guess.
- `applyActivityGate()` runs from `showApp()`, at every exit of
  `loadClassConfig()`, and inside `renderClassActivities()`, so a completion or
  exit-check submit lifts it live.
- CSS dims every rail `.nav-btn` marked `data-gate="hide"` and hides
  `.g-module`/`.g-set`/`#resume-card`/`#week-panels`. In class is the rail's
  one `data-gate="keep"` button; Live quiz has no rail button. checks.mjs
  **1aa** fails a nav button with neither. `#search-btn` needs `!important`
  because `showApp()`/sign-out toggle its inline `style.display`.
- **What a gated student can still open is one list — `GATE_OPEN_HASHES`**
  (`#class-activities`, `#live-quiz`). `routeExploreHash()` rewrites any other
  hash to In-Class Activities with a `gateToast()`; `returnToPractice()` has
  the same guard. **The redirect only ever lands on `#class-activities`** (an
  open `#class-activities/ca-N` included), never `#live-quiz`: returning to the
  quiz locked a gated student out of their activities (2026-09-29).
- **Gate flips on mid-session → In-Class Activities.** On the off→on
  transition (the `visibilitychange` re-check), once `appIsOnScreen()`,
  `applyActivityGate()` walks the student there with the same toast.
- `window.__forceGate` (localhost only) forces the gate on.

**Absent students stay blocked — by design** (Jonathan, 2026-09-12): every
visible, undone, uncleared activity blocks, however old, until finished or
cleared per student. No blocking window, no activity-level "stop blocking
everyone" toggle — don't propose one again. The tools are the per-student
Clear and Hide (which takes the card off the page, "Completed activities"
included). One release date serves both periods, also by choice.

The `config/class` maps below are teacher-write/student-read and needed no
`firestore.rules` change. Each (like `activityDates`) is cached in
`localStorage`, and a failed read falls back to the cache, never to empty.

**"Open through Module N" — a per-student module skip.**
`config/class.moduleOpenThrough` (`{ uid: N }`, N = 2..12), set from the
console Manage table's "Open through" select (`teacherSetStudentOpenThrough`;
Auto deletes the key), read into `moduleOpenThrough`.
- **`isModuleGateLocked` opens modules `<= N`; `isSetLocked` opens every set in
  modules `< N`.** Module N keeps its set-to-set order, Set 1 open.
- Static `locked`/`comingSoon` sets stay shut. Module 13 is untouched. The
  activity gate is a separate system.
- **It never writes progress.** Lowering or clearing it can't re-lock anything
  the student has worked in (`hasProgressIn` still runs first).
- **It fails open from cache**: cached per uid as `caOpenThrough`, restored by
  `restoreClassConfigFromCache()`, never reset to 0 on a failed read.
- A change under an open app repaints the rail (`repaintModuleGate`), which
  also drops a now-open set's peek.

**Optional activities:** a Required / Optional switch on every assigned board
card (`teacherSetActivityOptional`) writes `config/class.optionalActivities`
(`{ id: true }`, cell-checked, same shape as `hiddenActivities`).
- An optional card is still VISIBLE — `caIsVisible()` does not read the map —
  but never a blocker. It renders an "Optional" tag (`caOptionalTagHtml()`, in
  both meta-line builders: hero, plain card and check).
- The rule lives in three places that must agree: `caBlockers()` (app.js, via
  `caIsOptional()`), `teacherBlockersFor()` (teacher.js), `journeyBlockers()`
  (tabs/journey.js).
- The Today hero prefers the first REQUIRED pending card; an optional one only
  when nothing required is left.
- Cached as `caOptional`. Delete clears the flag; Archive keeps it.

**CAS students: every activity is optional** (Jonathan — they must never be
locked out of the modules).
- Keyed off the EFFECTIVE period (`periodOverrides[uid] || progress.period`,
  as the console's `teacherStudentPeriod`).
- `caIsOptional()` is true for every card when `caStudentIsCAS()`;
  `teacherBlockersFor()` and `journeyBlockers()` return `[]` (journey.js reads
  `data.period` off the progress doc it already fetches).
- Picking CAS re-runs `applyActivityGate()`. The console's Gate column shows
  "CAS · optional" instead of a Clear button.
- A student who hasn't picked a period yet is gated like anyone else.

**Per-student clears:** `config/class.activityClears` (`{ uid: { id: true } }`)
lets one student past a specific blocker without finishing it (a sub day, a
connectivity problem, work done on paper).
- Written by `teacherSetActivityClear`/`teacherClearAllBlockers` (teacher.js),
  same merge-patch shape as `hiddenActivities`/`gameOverrides`.
- UI: a Clear toggle per student in `renderTeacherActivityDetail` and
  `renderTeacherCheckDetail` (Gate column); a "Blocked by N" badge and a
  "Today's activity gate" section with Clear all on the Students views.
- Cached as `caClears`.

**Archive / Delete:** two buttons per row in the console's Class activities
table (**Archive** column, beside Visible/Hidden), writing
`config/class.archivedActivities` / `.deletedActivities` (`{ id: true }`, same
merge-patch shape as `hiddenActivities`).
- Students merge the two into one `retiredActivityIds` set. `caIsVisible()`
  fails on it **before** the dev-bypass line, unlike the date gate (a retired
  activity has nothing to preview), so it is off In-Class Activities, out of
  `caBlockers()`, and a deep link reads as not-posted.
- The visibility rule is mirrored in `caIsVisible` (app.js),
  `teacherActivityVisible` (teacher.js) and `journeyIsVisible` (journey.js).
- **Restore** differs. Archive keeps the release date, rename, board slot and
  per-student clears (minus any pin — Archive unpins). Delete wipes all of that
  behind a `confirm()`, **including the board entry**; a restored one comes back
  in Built, unplaced and undated.
- Each writer clears the other flag. Neither touches students'
  `classActivities` records (the teacher has no write on `progress/{uid}`, and
  it's grade data) or the entry in `class-activities.js` (only a push does).
- **Retired cards hold no `#N`** (Jonathan's call): the list students read is
  always 1,2,3 with no gaps.
- Console-side, an archived card folds into its module's `Archived (N)`; an
  archived-but-unplaced one into Built's `Archived / deleted (N)`.
- Cached as `caRetired`, and `hiddenActivities` as `caHidden`: a blocked read
  must not bring a retired or hidden activity back to gate the site. Never let
  `hiddenActivities` fail open to `{}`.

**Journey pages gate too** (when `JOURNEY_GATE_LOCKS` is on). The six
`tabs/*.html` pages load `class-activities.js` (a plain data array), so
`journey.js` computes the same blockers after its own Firestore boot.
- `journeyIsVisible`/`journeyBlockers` are deliberately NOT shared with
  `caIsVisible`/`caBlockers` (those read main-app globals).
- On a hit, a `.ca-gate-card` linking to `index.html#class-activities`
  replaces the page (styles in `tabs/journey-theme.css` only).
- Skipped for the teacher's account (by email). A failed config read fails
  open. `mood-chart.html` is never gated.
- **The one exemption:** a pending activity with `journey: '<slug>'`
  (optional `journeyLayer`) in `class-activities.js` leaves THAT page open
  while it blocks. Read the file for the carriers (today ca-25, ca-31 →
  seven-nation-army; ca-24, ca-30 → the-cure; ca-27, ca-32 → luna; ca-26,
  ca-29 → all-along-the-watchtower; ca-28, ca-33 → sweet-child-o-mine).
- The card renders an "Open the … Song Journey page" button
  (`caJourneyLinkHtml()`): never on a whole-song card, and not on another
  activity while its song has an openable whole-song card. `journey:` on a
  whole-song card still exempts that page and places the card on its Songs row.
- `renderTeacherActivityDetail` shows the same link after its steps.
- checks.mjs 1d validates the slug against `tabs/<slug>.html` and the layer
  against that page's `layer-num` spans.

**Every direction is ONE line** (Jonathan, 2026-11-10: "students don't read
them anyway"). Step `text`/`text_power`, `intro`/`intro_power`, check `text`,
`bassDirections`, a recording version's `intro`, and each drill's direction
line before Start.
- One sentence, verb first: what to play and the finish line together. "Play
  Line 1 into Line 2 four times without stopping." One rendered line in the
  folded view at 1366×657, English and Spanish. checks.mjs **1cs** caps the
  length (`CAP_2A` for the data, `CAP_2C` for the drill lines in i18n.js) and
  bans lists, line breaks and the got-it label in those fields.
- **Keep the count.** The tap dots come from the whole line: `caStepHtml`
  passes `wholeLine` to `wrapGotItWhen`, which reads `repCountFromGotIt` from
  the line when there is no "You've got it when:" label. Write a count it can
  read (a digit or two–five / dos–cinco, then "times", "in a row", "back to
  back", "veces", "seguidas"); "8 times" makes no dots. The module call does
  NOT opt in. **1bg** holds EN = ES and executes both calls.
- Cut: fix-it lines, finger-by-finger lists, recaps, definitions (use the plain
  word), "then press Play tab to check". Strings named, never numbered.
  Spanish: shorten the existing `_es`, reuse its words, buttons in «».
- A step whose drill widget already says what to do has NO text (ca-23; the
  "Name the fret" shuffle steps of ca-11, ca-12, ca-17). A "Find the note" deck
  step keeps one line, because the deck does not say "five in a row".
- Each drill shows one direction line before Start (`.sdr-intro`); the
  second paragraphs (Note Call's `descAnswer` / `howTap` / `howCoach`, Name
  the power chord's `howAnswer` / `howScored`) were removed and 1cs keeps them
  out. The header strip, switches, scores and pass lines are not directions.
- Exit checks (ca-14, ca-15) are frozen and untouched. Modules keep the list
  and got-it rules (CLAUDE.md).

**Four steps, two lines a page** (Jonathan, 2026-09-25).
- **Four steps is a SOFT rule** (Jonathan, 2026-10-01): aim for four or fewer,
  but go past it when Jonathan asks — ca-21 has six. checks.mjs **1bb** prints
  one reminder line naming every card over four and never fails the push on it.
- Every class-activity tab longer than two rendered rows pages two rows at a
  time with Previous / Next: `CA_TAB_LINES_PER_PAGE`, passed as
  `defaultLinesPerPage` by `caStepHtml()` and `renderTeacherActivityDetail()`
  (1bb pins both). Play tab and a sibling band snippet turn the page as they
  play.
- `revealDelay` is **seconds**; `wrapTabReveal()` converts to ms. It is per
  tab and drops the Play tab button, so keep it off any tab whose Play is the
  answer key (ca-21) or the one demo of a held note's length.
- A waited-out tab stays revealed across re-renders that aren't navigation
  (language switch, tab return, Done on the last step) via `caRevealedTabs`; a
  Focus step move, a new student or a new day clears it.

**The Journey button is in the LAST step only — every class activity, now
and in future** (Jonathan, 2026-09-25). `caStepHtml()` adds it to the last
step's body and nowhere else.
- **Write a new activity with the Song Journey page named in its last step
  only.** An earlier listen-along goes on a `snippet` of the same backing
  track (ca-20 step 1 is the model).
- checks.mjs **1ba** fails the push on an earlier step naming the page (EN
  "Song Journey", ES "Recorrido de la canción", text or label), on a step
  naming it in an activity with no `journey:`, and on any
  `caJourneyLinkHtml(a)` call other than the one last-step-gated one.

**Practice cards — `view: 'card'` (Jonathan, 2026-09-27; ca-18 is the model).
The default for every song activity with a backing track (Jonathan,
2026-10-01: it "works much better for students"). Activities with no backing
track stay Focus-view step ladders.**
The activity is ONE screen:
- The song's tab, and one "Play song" button that plays the real backing track
  and moves the tab note by note (`.beat-now`, honouring each note's `beats`).
- One page per section, tap-a-section-to-start: a four-click count-in, then
  the loop returns to that section. A `card.wholeSong` card (ca-24 to ca-33)
  stops at the end of the song instead (Jonathan 2026-10-02).
- A speed control over the slow / fast files, starting on Slower (see
  Slowest), and the Guitar toggle where a full mix exists.
- A Metronome: a click the SITE makes on every counted beat (no metronome
  files; Moises clicked "the cure" at 144, twice the 72 the room counts).
- Then three or four checkboxes.

A looping card repeats with no seek: a second `<audio>` on the same file
waits at the loop start and takes over at the window's end ("THE SPARE" in
app.js, Jonathan 2026-10-07 — a seek left an audible hole every lap).
Anything new that touches a card's audio must handle `st.spare` and
`st.leaving` as well as `st.audio`.

Level up and links:
- **A whole-song card's Level up names no other page and renders no Journey
  button (it IS the play-along); a part card's Level up hands off to the
  whole-song card (`card: 'ca-N'`)** (2026-10-06, 1bn).
- A Level up may carry `card: '<id>'` to open another practice card instead
  of the Journey page. Every part card opens its song's whole-song card
  (ca-10 → ca-25; ca-13, ca-18, ca-19 → ca-24; ca-20 → ca-27) — never a
  power-chord version (ca-25 keeps its Journey Level up).
- `caCardLinkHtml()` shows the link once the target is released or Play Along
  now; 1bf checks the id. Before its date the target SWAPS INTO the linking
  card's slot (`caSwap`, `caOpenLinkedCard()`) — no Songs heading, no list
  entry; closing it puts the linking card back, open.
- The card's Journey button is on its last check, the Level up (1ba pins both
  call sites).

Checks:
- **No practice card has a help ladder** (Jonathan, 2026-10-07: "it's not
  needed"; 0 of the 25 `view: 'card'` activities has a step): `steps: []`,
  which 1d allows only on a `view: 'card'` activity, so "More practice help"
  never renders (`pcHelpHtml` returns nothing for an empty list). 1bf's
  help-step rule still runs, for a help step that comes back.
- **A whole-song card has exactly two checks**: the whole song slower without
  stopping, then the Level up. Each check's text is one line ("Play the whole
  song with the band, intro to the end, without stopping."); a part card's
  Level up names the Whole Song card without "once it is posted" (2026-11-10).
- A check may carry `slot: n` to keep its old tick key after earlier checks
  were removed (ca-25).
- **Complete = every numbered check ticked; Level up is extra.** `pcCheck()`
  writes it in place — NOT `caToggleComplete`, which closes the card and
  re-renders, stopping the song and hiding Level up.
- Check ticks live in `caStepDone` as `<id>:c<n>`. `caTickKeys`/
  `caRequiredTickKeys` are what every "n of m" reader counts (meta line, hero
  dots, sticky bar, the Mark-complete nudge).

Code and guards:
- Data shape: CARD note atop class-activities.js. Engine: `pc*` in app.js
  (`pcLayout` sections → tab offsets and beat totals; `pcLocate` position →
  note; the snippet window arithmetic, one `anchor` per song).
- One sound at a time: `pcStop()` sits beside every `snipStop()` in
  `stopCardAudio`, `playSequence` and `renderClassActivities` (1bf pins them),
  and starting a card calls `stopAllDemoAudio()`.
- **1bf** checks the data: track exists, sections back to back, each section's
  beats = bars × beatsPerBar, notes' midi/name from string + fret, window
  inside the file, exactly one Level up and it's last, help steps carry no
  snippet/drill/video.
- A section with a `repLabel` counts in that word in its caption — "3 laps"
  under a Lap badge, "2 times" under a Time badge. 1bm fails a mix.

**Chord cards are drawn as a CHORD GRID (`card.chordGrid`, 2026-10-26)**,
because the record's strumming is not consistent (Jonathan). A chord card's TAB
shows each chord once (same-name notes fold) at the beat or "+" where it
starts, four bars to a row with bar lines, always a count row (beats in ink,
"+" faint), and the cursor on the BEATS only (`data-beat`, never on a "+").

Scope:
- Opt-in per card; `chordGrid: false` per section (ca-41's single-note verses,
  ca-35's solo). ca-31 and every single-note card stay out.
- `card.everyStrum` (ca-29 and the Neil Young power-chord cards) keeps every
  strum as its own named event, with `ca.cardStrumDirections` as its
  directions. A mixed grid + single-note card cannot be every-strum (1cc).
- Display only — no `notes` array moved, so audio, `pcLayout`, 1bf / 1bf2 /
  1az and the Journey whole-song tabs are unaffected.
- `rows` without `rowLabels` are ignored. A lyric line keeps its row only
  where it starts on a bar line.
- ca-38 (lyric sheet) stays the PDF.
- A row that starts while a chord is still ringing names it at column 0 in
  parentheses, "(E7)".

Engine: `pcChordGrid` / `pcGridRows` / `renderChordGridRow` (rows), `pcLocate`
(`beat`, `bar`), `pcLocKey` (the repaint key is the BEAT on a grid — never the
note, or the cursor steps onto a "+"), `pcLocRow` (the PC_ROW_LEAD look-ahead).
Ratchet **1bv** renders every opted-in card in both views and executes
`pcLocate`/`pcLocKey`; `tools/smoke.mjs` walks the same cards in a real
browser. Turning a card on or off means editing its pinned list.

**Recording versions — `recordingVersions` (ca-26 / ca-29 / ca-40).**
A Jimi Hendrix / Neil Young switch at the top of the card, Jimi the default.
- A recording has its own track, bars, form and chord rhythm (unlike a key
  version), so a version carries a `card` (sections, caption…) and a `track`
  that `caView` lays over the card's own; also optional `title` / `intro`
  (+`_es`) (ca-40), so `caTitle()`, the card, the board and the console rows
  follow the recording.
- Data: `recording`, `recordingLabel(_es)`, `recordingGroup` (one stored choice,
  `localStorage.caRecordingModes`, for every card of the song),
  `recordingStart`, `recordingVersions: { neil: { label, label_es, track, card } }`.
  The IIFE at the end of class-activities.js builds the Neil cards.
- Not combinable with key / chord / bass versions. A version's track decides
  whether the Guitar switch shows (`snippetHasFull`). ca-38 has none (its PDF
  holds Jimi's 224 chord names). The Song Journey page has no switch yet.
- Guards: checks.mjs **1cc** (shape, render of every recording, pinned 3 cards /
  1 group) and **1bf** (every version runs through the card rules as a virtual
  card). `tools/smoke.mjs` clicks the switch, reloads and flips back.

**A card note may be a chord** (the power-chord whole songs ca-29–ca-33):
`{ frets: [[string, fret], ...], note: 'A5', midi: [...] }`, the shape Module
3's tabs use (`renderTabSystem()` draws it), in a card section or a help
step's tab.
- `caChordProblems()` in checks.mjs recomputes every pitch from the fretboard
  and requires a root-plus-5th pair to be named for its root.
- Each power-chord card is its roots card (ca-24–ca-28) with the same sections
  and bars, every root turned into the Journey Layer 3 shape. Luna's is two
  strums per bar where its roots card is one.

**A card can show a chord sheet PDF instead of its tab — `card.sheet`**
(Jonathan, 2026-10-19; ca-38, Watchtower lyrics and chords).
- The PDF in `sheets/` is his own Word doc; the lyrics come from his file,
  never typed into code. pdf.js draws it (`vendor/pdfjs/`, loaded only for a
  sheet card — the CSP allows no CDN scripts).
- Chord positions come from the PDF's text: every word on a line made only of
  chord names, in reading order. **Every page is read**, cropped to its words
  and stacked into one tall sheet; a two-column page is read left column
  first. **`card.sheetColumns: 1`** reads a one-column chord-over-lyric sheet
  line by line with no gutter split (ca-44; without it a chord line's wide gaps
  split it into two columns).
- Three sheet cards: ca-38 (ca-29's sections, 224 names), ca-44 (ca-30's, 94),
  ca-45 (ca-33's, 143). Each shares its play-along card's sections by
  reference (one IIFE after the array), so a ca-29 rhythm edit moves ca-38's
  dot too.
- A chord still ringing at a line start gets NO name (it is not a change) —
  unless its section is in **`card.sheetNamedAgain`**, which names the first
  chord of every lap of that section (ca-45: 152 names for 143 changes).
- Sweet Child's web copy follows ca-33's chords from Solo 2 on, so it differs
  from his Drive handout on purpose (Jonathan, 2026-11-03).
- **Sheet chord n = the card's n-th chord CHANGE**, so the sheet needs exactly
  one name per change. `sheetChords` pins the count and **1bf2** holds the
  notes to it. The console preview says so if the PDF doesn't match (the dot
  is then left off).
- The dot runs `PC_SHEET_LEAD` (0.175 s) AHEAD of the record — Jonathan tuned
  it by ear — where the tab takes the output latency off.
- "This bar" is sticky, so a sheet card is `overflow:clip`, not hidden. A tap
  on a chord starts from that lap (`pcStart(root, si, rep)`).
- ca-38 has NO `journey` (1bn): it is another view of ca-29, not Layer 3's
  play-along.
- Engine: `pcSheet*` in app.js, beside caCardBodyHtml.

**Slowest.** A practice card with `card.slowest: true` (all 25 practice cards
on 2026-11-08) gets a four-stop speed control: Slowest / Slower / **Slow** /
Normal (Jonathan, 2026-10-09: "just below the normal speed of each song").
- Slowest is the SLOW file at `SLOWEST_RATE` (0.8) with `preservesPitch` — no
  third export, and the tuner still agrees.
- Slow is the FAST file at `pcSlowRate(tr)`, halfway between the slow tier and
  normal (the cure 66, Seven Nation Army ~112, Watchtower 110), so it always
  sits above Slower.
- A stepped slider (`pcSpeed3Html`): the two ends read "Slower" and "Normal"
  as directions, not stop names (Jonathan, 2026-10-09). Every stop shows its
  speed against the record (`0.65×`, `pcSpeedFactor`); each stop's name is its
  accessible label. Each option carries its rate in `data-rate`; `pcRate()`
  reads the card's `data-rate`.
- Every step snippet keeps its own Slowest button beside the turtle (the two
  release each other).
- Anything reading the file's own clock is unchanged; only real-time amounts
  (count-in spacing, click lookahead, output latency) scale by the rate.
- A `load()` resets `playbackRate` to `defaultPlaybackRate`, which is why
  `slowestApplyRate()` sets both.

**Each Core song row links its whole-song practice card** (Jonathan,
2026-10-05). The Core list is the only place: no section listing part cards
atop the Songs page ("too much going on").
- A Core row shows exactly three links, in this order: **Play Along · Backing
  track for solos · Song Journey**. No Tutorial or Original on Core rows
  (Choice rows keep theirs).
- `CORE_FIRST` (Seven Nation Army, Watchtower, "the cure") leads; the rest
  are alphabetical.
- Play Along opens the song's `view: 'card'` activity with `card.wholeSong`
  whose `journey:` matches the row's Journey slug, once it passes
  `caIsVisible()` or `caIsPlayAlongOnly()`. When two pass (roots and
  power-chord), the newest (highest board `#N`) wins.
- A song with no such card shows **no** Play Along link (Jonathan's call — no
  greyed placeholder). Part cards are not on the Songs page at all.
- **A tap opens the card where it lives** (`songsHubOpenCard()` →
  `goExploreHash('class-activities/<id>')`); Back returns to Songs. Don't
  render the card a second time on the Songs page: the `pc*` engine and the
  open-card state (`caOpenId`, `caSyncHash`, the sticky bar) belong to
  In-Class Activities.
- `songsPlayAlongBtn(slug)` builds the link inside a `.sh-play-slot`
  (`display:contents`); `refreshSongsPlayAlong()` (end of `loadClassConfig()`)
  refills only the changed slots when the board or dates land late.
- Songs stays a gated page.

**One way round the date: "Play Along now"** (Jonathan, 2026-10-02). Every
assigned practice card on the board has a **Play Along by date / Play Along
now** switch (`teacherSetActivityPlayAlong`, cell-checked write to
`config/class.playAlongActivities`, `{ id: true }`).
- "Now" lets the card be opened from the Songs page without a release date.
  Only a whole-song card has a Songs link, so on a part card it does nothing a
  student can reach.
- It changes **nothing else**: `caIsVisible()` and the three blocker rules do
  not read the map, so the card stays off In-Class Activities and never blocks.
- `caIsPlayAlongOnly()` in `app.js` is the one predicate: practice card, flag
  on, assigned, not Hidden, not retired, and NOT already visible. Readers:
  `songsPlayAlongCard()` (the Core row link), `caFocusActivity()` (so the tap
  opens it instead of "not posted"), and `renderClassActivities()`, which
  renders that ONE card under the Songs section's title **only while it is the
  open card**.
- Don't fold the flag into `caIsVisible()`: that would put the card on
  In-Class Activities and behind the gate. Jonathan chose this over "date it
  and mark it Optional" and "list every assigned card".
- Cached as `caPlayAlong`. Delete clears the flag, Archive keeps it.

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

**Render-time hiding.** Four section `kind`s beyond `tuning-warmup` (ratchet
1r):
- `take-to-song` — switched off in every module (`TAKE_TO_SONG_ENABLED`; see
  "Play-along first" below).
- `routine`/`ear-spark`/`reflection`: the section is skipped entirely ("My
  Practice Routine", "Ear Spark — optional ear bonus", "Checkpoint"/"Wrap-Up").
- **Kind-ONLY matching, deliberately NOT kind-or-title like
  `isTuningWarmupSection`.** `isEarSparkSection`/`isRoutineSection`/
  `isReflectionSection`/`isTakeToSongSection` in app.js check `sec.kind` alone:
  these titles repeat across nearly every module.
- A step-level `hidden: true` flag (song previews now taught by a class
  activity) works the same way.
- All 13 modules are tagged: every "Checkpoint"/"Wrap-Up"/"Take It to a
  Song"/"My Practice Routine…"/"Ear Spark…" section carries its `kind`.
  Module 1 has one (its "session check-in" `routine`); Module 13 has none.

**`visibleSteps(sec, moduleNum)` / `visibleSections(station, moduleNum)`**
(app.js) are the one gateway everything student-facing reads through:
`buildLesson()`, `resumeLessonCounts()`, `buildSearchIndex()`,
`moduleStepsFlat()` (the Daily 5 pool).
- The one deliberate exception is teacher.js's `setShortResponses()`: it walks
  `storageSections()` (every section but tuning-warmup) because it audits what
  students actually wrote, Modules 1–2's Checkpoint / Wrap-Up / Practice
  Routine answers included. A slot in a non-renderable section or on a
  `hidden` step is tagged `retired` and labelled "(retired)".
- `visibleSteps` returns `{st, idx}` pairs. `idx` is the step's real position
  in `sec.steps` — what every storage key (doneKey, responses, bpm, drills) is
  built from — so a hidden step never shifts a later one's saved progress. The
  position in the *returned array* is the visible step number and the only
  thing "which step is current" compares against.
- `visibleSections` returns `{sec, gi}` pairs. **`gi` is the STORAGE index and
  comes from `storageSections()`: the section's position after excluding ONLY
  tuning-warmup sections.** Every Firestore key is written that way.
- Every other hide — routine / ear-spark / reflection / take-to-song, a section
  with zero visible steps — is render-only and never renumbers `gi` (numbering
  over the survivors once moved Module 2 Set 1 station B's progress from
  `b-sec2` to `b-sec1`).

**`JOURNEY_LAYERS`** in app.js (`{slug: {moduleNum: layerNum}}`) is authored
from the six pages' real `.layer-unit` spans — today Module 1→Layer 1 … 5→5,
anything past 5 an unnumbered "Extra". Layer 4 is Open Chords, Layer 5 the
Pentatonic Solo (Modules 4 and 5 swapped).

**Ratchets:**
- **1ab** — rebuilds `JOURNEY_LAYERS` from the spans and fails on drift.
  **1ab2** checks the module files against it: every `songThread` layer, every
  "Layer N of 5" in module-N.js, every `#layer-N` link; a layer titled Power
  Chords / Pentatonic / Open Chords must name the Module whose
  `MODULE_MANIFEST` name teaches it.
- **1ac** — the four callers above must still call
  `visibleSteps(`/`visibleSections(`; `setShortResponses()` must call
  `storageSections(` and fails on `visibleSections(`. A positive assertion, so
  it can't catch a raw `.steps.forEach` added *alongside* a leftover call.
- **1ad** — kind ↔ title, both ways (same shape as 1r). `KIND_TITLE_COUNTS`
  pins the total per kind at
  `{take-to-song:29, routine:5, ear-spark:7, reflection:62}` across all 36 sets.
- **1ae** — every `hidden: true` step needs a `// ... ca-<n>` comment on the
  line above it.
- **1af** — rebuilds the expected `data-ns` list for all 36 sets from raw
  module data, compares it to what `buildSet()` renders, and pins the Module 2
  Set 1 sections by title. `tools/smoke.mjs` walks every set in both languages
  in a real browser.

**Step-level `hidden: true` stays at Module 2's original 3.** Modules 3–8 were
checked against every shipped `ca-<n>` (2026-09-12); none duplicates a module
step: Finger Gym (ca-2…ca-7) is generic drills; ca-11 and ca-12 are Module
1/2-era; ca-13's single-note "the cure" line and ca-10's Seven Nation Army
frets teach a different skill than those songs' module steps. A new class
activity that duplicates a module step is the trigger to hide that step.

---

## The full rules behind CLAUDE.md's one-liners

### Activity order, numbering and the board
**Not in `class-activities.js`.** `config/class.activityBoard`
(`{ id -> { module, pos } }`, `module: 0` = the board's Unsorted pen) is
written by the console's **Class activities board** (`teacher.js`): Built on
the left (pushed, not placed), Assigned on the right (by module, in reading
order). It decides the order, the module headings and the `#N` prefix.
- A card with no entry is invisible to everyone. **Not archived/deleted +
  assigned + not Hidden + given to this student (`caForMe`) +
  dated-and-arrived** is the full live-for-students rule (`caIsVisible`, in
  that order; the dev bypass skips only the date).
- `caBoardOrder()` in `app.js` is the one resolver, read by students
  (`caBoardView`/`caNumber`) and by the console (`teacherBoardView`), so the
  two can't disagree.
- Archived cards keep their slot but hold no `#N` (see Archive / Delete).
- Every move — drag, `Assign to…`/`Move to…`, ▲▼, a typed `#N` — goes through
  `teacherMoveActivity()`, which re-packs `pos` 1..N in both the section left
  and the section joined.
- **Never write `progress/{uid}` from any of this.** Completion is keyed to the
  id and is never touched by assign / un-assign / publish / archive / restore.
- `number` in `class-activities.js` is **legacy and optional**: only the
  one-time seeding of a never-written board (`activityBoardSeeded`) reads it.
  Don't resequence it (1d no longer enforces 1..N). `activityNumbers` is
  retired; leave any old Firestore rows alone.

**A number in an activity title is still a SERIES number**: the first Finger
Gym is **Finger Gym 1** though the class meets it as **#3** (Jonathan,
2026-08-20). Don't "fix" `#3 - Finger Gym 1`.
- A series must be contiguous 1..N, EN and ES; checks.mjs 1l enforces it,
  sorted by numeric id.
- Inserting one in the middle means retyping every later title's digit, plus
  any "same as Gym 1" / "del Gimnasio 1" cross-reference in another activity's
  step text, in the SAME edit.
- Ids (`ca-<n>`) never move — student progress is keyed to them.

### There are TWO step renderers — patch both, or the teacher can't see it
`caStepHtml()` (`app.js`, students) and `renderTeacherActivityDetail()`
(`teacher.js`, the console preview) each have their own `if(step.figure)` /
`video` / `tab` / `drill` chain, so a field wired into one is silently
invisible in the other.

**Adding or changing a step field means editing both, in the same edit**:
Jonathan checks the day's activity in the preview before class. What checks.mjs pins in both renderers: the figure's `width`/`height` (1v),
`step.strum` through `buildStrum` and the paths chooser/route (1d), the
snippet through `buildSnippet()` (1ak), the tab's `defaultLinesPerPage` (1bb),
and the practice-card body (1bf). Every other field is grep-both-by-hand
whenever you touch either function.

Legitimate differences are only what can't work outside `#app`: the preview
uses a real YouTube link instead of `loadPanel()`, passes
`suppressCoach:true` to `buildTab`, and its drills skip the best-score write
(`sdSaveBest`/`dkSaveBest` bail on `IS_TEACHER_MODE`). Keep new exceptions to
that shape, and comment them.

**Focus view (`view: 'focus'`) is activity-level, not a step field**: it
changes how `caActivityCardHtml`/`caHeroCardHtml` lay the steps out (via
`caIsFocus`); the preview deliberately lists every step instead. `caStepHtml` has a focus branch for the head and the
nav row, so anything added there must land in both of its branches too.

**Paths (`paths` on a Focus-view activity — ca-46) are activity-level too.**
- ONE flat `steps` array. A step tagged `path: '<key>'` belongs to that path;
  an untagged step is shared and follows whichever path the student took.
- `caRoute(a)` gives the flat indices on the student's route. Every tick / BPM
  / drill key still hangs off the flat index, so switching paths loses nothing.
- The student card shows the chooser (`caPathChooserHtml`) until a pick is
  saved (`<id>:path:<key>` in caSteps, `caPickPath`).
- The console preview draws the same chooser (`{preview:true}`, inert),
  groups the list by path, and walks one in "Preview as student"
  (`taFocusPreviewPath`).
- Guards: 1d validates the data and pins both renderers; 1am/1bb size the
  activity by its longest route; `tools/smoke.mjs` (`pathsWalk`) clicks
  through it in both languages. Schema: the PATHS note atop
  `class-activities.js`.

**Practice card (`view: 'card'`) is a whole card body, not a step field** —
same shape as an exit check: ONE renderer, `caCardBodyHtml(a, opts)` in
app.js. Students reach it from `caActivityCardHtml`/`caHeroCardHtml` through
`caCardBodyBlockHtml(a, …)`; `renderTeacherActivityDetail` reaches it with
`{preview:true}`. 1bf pins all three and renders both student builders.

### Step drills replace paper (`step.drill`)
- A card that gets a drill has **no paper-fallback line**.
- **`notecall`** (ca-23; power-chord mode in ca-43) is a guitar drill, not a paper one: a note name comes
  up on the beat and the student plays it. "Show answer" (on by default) is an
  unscored play-along; turned off, it is five scored levels (`NC_LEVELS`),
  answered by the mic (off by default) or by tapping the fret. Engine and
  schema: the comment above `NC_LEVELS` in `app.js`; progress in `games.nc`;
  `gamesStopMic()` stops it.
- **`deck`** design calls (Jonathan, 2026-07-26), kept as they are:
  - Self-report, not auto-grading: the app cannot hear whether the chord was
    played, and a 4-choice deck turns recall into recognition.
  - A two-sided deck hides the back until tapped.
  - "Put it back" re-deals the card 3 later; only first-try hits score.
  - The ear sequence is never shown before the reveal.
- `DECKS` lives in `app.js`, not module data, so its Spanish comes from
  `i18n.js`. Storage: `games.dk`.

### Play-along first; Song Journey pages are the back door (2026-10-06)
**One rule for every link to a song: if students can open a play-along
(whole-song) card for it, the link opens that card; if not, it opens the Song
Journey page.** `songsPlayAlongCard()` works it out from what Jonathan has
released or set to "Play Along now" — no list to maintain. The play-along
cards cover Layer 2 (single notes) and Layer 3 (power chords) only; the
Journey pages also hold Layers 4–5 and the bonus layers.

| Door | Behaviour |
|---|---|
| "Take it to a song" box, Modules 1–5 | **switched off 2026-10-18** (`TAKE_TO_SONG_ENABLED = false`, see below); when on, one button per song via `openSongLink(slug, layer)` |
| "About this set" song names | links; same `openSongLink` |
| A skill about one core song (checklist row) | `journey: [{ song, layer }]` on the skill → "Open the \"Luna\" Song Journey page" under it (`skillJourneyHtml()` in buildChecklist); same `openSongLink`. 14 skills in Modules 4 and 9–12 (1ab3 pins 14 / 16) |
| Songs page Core row | Play Along (only with an openable card) · Backing · Song Journey, every row |
| Songs page "More Play Along songs" | every `library: true` practice card, for the WHOLE class, from the day it ships — no board slot, date, #N or "Play Along now"; Who does not hide it (`caIsLibrarySong()`). A song one student asked for reaches students this way; don't build a per-student path back. Off the board (`caBoardOrder` skips `caIsLibraryCard()`); managed in the console's **Songs** tab (`renderTeacherSongs()`). **Songs move both ways**: any non-check card with a `library` field (true = starts on Songs, false = in Class activities) is a song (`caIsSongCard()`); the console's Move to Songs / Move to Class activities buttons write `config/class.songLibrary` (id -> bool), which wins over the field, and the board slot is kept. **Never a Core song** — checks.mjs 1bq |
| Teacher view songs (console tab) | `teacherOnly: true` cards (ca-40), played for the room; students never see one (`caBoardOrder` skips it) until **Move to Class activities** writes `config/class.classSongs[id]` and it joins the board as an ordinary activity (**Move to Teacher view songs** sends it back). No `journey`/`journeyLayer`/`library` on it — checks.mjs 1bn |
| Journey button on a card | never on a whole-song card; on another activity only while its song has no openable whole-song card (`caJourneyUrl()`) |
| Resume card song row | all six songs |
| The Journey page itself | open for every student (`JOURNEY_GATE_LOCKS = false`) |

**⚠️ "Take It to a Song" is gone from the module ladders (2026-10-18)**
(Jonathan: "remove take it to a song from the steps of the modules").
`const TAKE_TO_SONG_ENABLED = false;` in `app.js`, beside
`isTakeToSongSection()`, is the whole switch: `visibleSteps()` and
`isRenderableSection()` hide every `kind:'take-to-song'` section in Modules
2–12 (the Journey card in 2–5, the Challenge steps in 6–12).
- **Switched off, not deleted**, the Daily 5 pattern: the section list is
  fixed in every rule-zero regime and each section counts toward its
  neighbours' `gi` (1af proves no key moved). Deleting them for good is on
  the Summer reset list.
- It knowingly reverses Jonathan's 2026-09-12 call to keep the 6–12 steps. Seven
  skills (m9w1-s5, m9w2-s5, m10w1-s4, m10w3-s6, m11w3-s6, m12w1-s6, m12w3-s6)
  lost their only teaching step and sit on the checklist with no "Show me
  where"; the console tags those steps "(retired)".
- 1af / 1ao / 1w-t read the switch via `readTakeToSongSwitch()`.
- **When the switch is on** (`true` restores all of this): the section's steps
  are replaced by one Journey card (`journeyLinkCardHtml()`, one button per
  song via `openSongLink(slug, layer)`: the whole-song card for this module's
  layer if students can open it, else `tabs/<slug>.html#layer-<n>`) **only
  when `journeySongsFor(moduleNum)` is non-empty** (Modules 1–5). With no
  layer (Module 6+) the section renders its OWN steps and heading. **⚠️ Don't
  re-simplify this to an unconditional swap**: those sections hold real
  Challenge cards. The rule lives in `visibleSteps()`, `isRenderableSection()`,
  `buildLesson()`'s `hasJourneyCard` branch (which also suppresses the
  heading) and 1af's own copy — update all together. A Module 6+ layer added to `JOURNEY_LAYERS` flips that
  module to the card automatically.
- **Songs now reach students from the skills, not the ladder** (`skill.journey`,
  table above; 1ab3). Modules 2, 3, 5 and 6 have no such skill; there the
  reach is the Songs page and "About this set". Attaching one is a content
  call: one `journey` field (module-2.js's schema comment).

**Layer matching:** a whole-song card carries `journey` + `journeyLayer` (2 on
ca-24–ca-28, 3 on ca-29–ca-33), so a Module 2 link finds the Layer 2 card and a
Module 3 link the Layer 3 card. Modules 1, 4 and 5 have no card for their
layer, so their links open the Journey page at `#layer-N`.
**The decision is made at the click**, not at render time: the class config
(dates, Play Along now) can land after the page holding the link was built.
Don't fold "Play Along now" into `caIsVisible()`.

The Journey-page decisions that go with this (whole-song tabs, no Stuck?/Level up folds, no per-song retire list) are in `.claude/rules/journey-pages.md`.
