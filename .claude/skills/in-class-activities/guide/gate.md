# The gate, optional cards, clears, archive and delete

**⚠️ The LOCK is switched off (Jonathan, 2026-10-07: "stop locking the
other parts of site if class activities aren't cleared… CA should still pop
up as normal on login").** `const CA_GATE_LOCKS = false;` beside
`applyActivityGate()` in `app/activities-list.js` and `var JOURNEY_GATE_LOCKS = false;` in
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
- The rule lives in three places that must agree: `caBlockers()` (`app/activities-list.js`, via
  `caIsOptional()`), `teacherBlockersFor()` (`teacher-config.js`), `journeyBlockers()`
  (tabs/journey.js).
- The Today hero: required and unfinished first (2026-11-12), as stated under
  `renderClassActivities()` (`activities-page.md`).
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
- Written by `teacherSetActivityClear`/`teacherClearAllBlockers` (`teacher-config.js`),
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
- The visibility rule is mirrored in `caIsVisible` (`app/activities-2.js`),
  `teacherActivityVisible` (`teacher-config.js`) and `journeyIsVisible` (journey.js).
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
