---
name: in-class-activities
description: How the guitar site's In-Class Activities page, activity gate, exit checks and practice cards work: caBlockers/caIsVisible, Today's activity, Open-through, optional/CAS, clears, archive/delete, Journey gating, four-step/two-line rules, view:'card' practice cards and whole-song cards, Play Along now, Songs Core rows, render-time hiding (visibleSteps/visibleSections, section kinds). Read BEFORE editing class-activities.js, the ca*/ec*/pc* code in app.js, teacher.js activity/console code, or tabs/journey.js gating.
---

## Exit checks — the end-of-period product

An exit check is a class activity with `kind: 'check'` (schema at the top of
`class-activities.js`): five auto-graded questions, one try, result on
`progress/{uid}.exitChecks[id]` plus `classActivities[id] = true`. Two item
types, `nextNote` and `noteName`. Engine is the `ec*` functions in `app.js`;
the student card and the console preview share `caCheckBodyHtml()` **on
purpose** — the two-renderers rule exists for a step FIELD going invisible in
the teacher's copy, and a whole new card has no such split, so don't fork it.
Console: the Activities table shows the turned-in count and average; the
activity's detail page shows the per-student, per-question grid and a
"Missed by" row. Data is guarded by checks.mjs **1y** (`1x` is the
orphaned-assets check), which recomputes every answer key from the fretboard
rather than shape-checking it — a wrong `answer` doesn't look broken, it just
marks a correct student wrong. Checks take no `#N` number: `caBoardOrder()`
skips them when it hands out 1..N, which covers the student card and the
console board at once, and the board renders "Check" where the `#` box goes. No
`firestore.rules` change was needed — the result is a field on the progress
doc the teacher already reads whole. About one check per week is the intended
pace (Jonathan, 2026-09-09).

**Post one with its own link:** `#class-activities/<id>` (e.g.
`…/index.html#class-activities/ca-15`) opens the Class activities page with
that card expanded and scrolled to — `caFocusActivity()` in `app.js`. The
teacher console's Class activities table has a **Copy link** button per row
(and the same link spelled out on each detail page) so the URL never has to
be typed. The hash router splits on `/` (`exploreHashBase` / `exploreHashTail`),
so a new deep link takes that shape rather than a query param. An id that
isn't published yet gets `ca.linkMissing` above the archive, not a dead end.

Two rules that are easy to break without noticing:

- **Stored exit-check picks are POSITIONAL — editing a shipped check's
  `items` silently re-grades every result.** `res.picks` is an array indexed
  by item position and `ecGrade()` re-grades it against whatever `items` says
  now, so inserting, removing or reordering an item in a check students have
  already taken leaves their stored `score` (which the console prints) beside
  recomputed per-question cells for different questions, and makes the
  "Missed by" row fiction. checks.mjs 1y recomputes the answer KEYS from the
  fretboard and passes straight through this. Same hazard as rewording a
  graded MC's choices, one layer down: edit a check before students reach it,
  or treat its `items` as frozen once they have.
- **Seed the MC shuffle on language-stable data.** `ecChoicesHtml` seeds on
  the `fret·note` pairs, never the rendered chip labels — "fret 5 · A" and
  "traste 5 · A" would hash differently and deal one student a different
  order per language.
- **The `noteName` board is drawn with `theme:'web'` plus the dark-mode
  invert**, not on CSS variables: its fretted-note circle is a hardcoded
  light green, so a variable-themed `?` would be light-on-light in dark mode.


## In-Class Activities page & the activity gate
Work order: "Today-first site simplification," Phase 1, shipped 2026-09-12.
Renamed **In-Class Activities → Today** for that work order, then **back to
In-Class Activities** 2026-09-17 (Jonathan's call) — `nav.classActivities` is
the same i18n key both times, so the hash `#class-activities`, every deep
link, and the console's Copy-link URLs never moved. It is the site's home
page: `showApp()` opens it whenever the URL carries no explore hash at all,
gated or not. `renderClassActivities()` (app.js) builds three groups, named by Jonathan
2026-09-23 — **Today's activity** (the hero card's tag, `ca.startHere`; the
first pending card, collapsed like every other card, not forced open —
Jonathan, 2026-09-15; an older undone hero is tagged **Unfinished** instead),
**Unfinished activities** (`ca.stillToDoGroup`, one fold, open by default since 2026-10-02, newest first,
module headings when cards are placed — no nested "Older" fold any more),
**Completed activities** (`ca.finishedGroup`; was "Earlier", before that
"Finished") — and appends the resume card (`renderResumeCard()`) at the
end when nothing is blocking. The `#resume-card` element itself moved in
`index.html` from a sibling of `#week-panels` into this page's own body; it
no longer renders in the module/set view at all.

**Today's activity holds up to three cards** (Jonathan, 2026-09-29;
raised from two 2026-10-07): the hero plus up to two other pending cards
released the SAME day (`CA_TODAY_MAX`, required ones first), all rendered
with `caHeroCardHtml`. `caStartHereId` is still the first of them;
`caTodayIds` is the whole group. All are tagged Today's activity when they
share the newest visible card's date; an undated hero pairs with nothing.

**Reading order is newest-first, not the teaching order** (Jonathan,
2026-09-17): the newest module's section renders at the top, and within a
module the most recently assigned card (highest board position) renders
first — so a student lands on current work without scrolling past everything
behind them. `caBoardOrder()`/`caNumber()` still compute the true ascending
course order underneath (teacher console, gating, and deep links all key off
it), and the "#N" a card carries never moves — only `renderClassActivities()`
reverses `view.sections` and each section's ids for display. The "Completed activities"
group's order falls out of the same reversal now, not a second `.reverse()`.

**Where the student is survives a reload** (navigability round 2,
2026-09-23). The open card rides in the address — `caSyncHash()` (called
from `caSyncTopbar()`) `replaceState`s `#class-activities/<id>` while a card
is open and plain `#class-activities` when none is, so a reload or a Back
from another page reopens it through `caFocusActivity()`. Step ticks
and practice-card checks (`caStepDone`, keys `<id>:<n>` / `<id>:c<n>`) are
**saved to the student's progress doc as `caSteps`** (Jonathan, 2026-10-01:
they must not reset each day or live on the Chromebook) — read by
`loadProgress()`, written through `onCaStepChange()` with the same
set/`FieldValue.delete()` shape as `classActivities`. The old per-day
`localStorage` copy (`caStepsToday`) is folded in once by
`caAdoptLocalTicks()` and removed. Only the revealed-tab set still resets
per student/day (`caResetRevealsIfNewDay()`). **Mark complete** closes the card, scrolls to the top (where
Today's activity already shows the next one) and toasts
`ca.doneNextToast` / `ca.doneAllToast`; un-marking keeps the card open.
A second tap on the rail row of the page you're on scrolls to the top — it
no longer closes the page (In class, Songs, My progress).

**⚠️ The LOCK is switched off (Jonathan, 2026-10-07: "stop locking the
other parts of site if class activities aren't cleared… CA should still pop
up as normal on login").** `const CA_GATE_LOCKS = false;` beside
`applyActivityGate()` in app.js and `var JOURNEY_GATE_LOCKS = false;` in
`tabs/journey.js` are the whole switch — nothing was deleted, so `true`
restores everything below exactly as it was. What stays live: `caBlockers()`
still computes, and `showApp()` lands a student with any blocker on
In-Class Activities at sign-in **whatever the hash** (a gate-open hash such
as a `#class-activities/ca-N` deep link is left alone). No mid-session
redirect, no hidden rail, no Journey gate card. The console's Clear /
"Blocked by N" tools still work but now only decide who gets the sign-in
landing. The description below is the lock as it runs when switched on.

**The gate:** `caBlockers()` — a visible (`caIsVisible`), undone
(`classActivities[id]!==true`), uncleared activity or check — drives
`body.ca-gated` via `applyActivityGate()`. Teacher/dev bypass are gate
previewers (`isGatePreviewer()`) and never see it; a failed progress load
(`progressLoadFailed`) also reads as "nothing blocking" — never lock on a
guess, same rule as the sequential set gate. `applyActivityGate()` runs from
`showApp()`, at every exit of `loadClassConfig()`, and inside
`renderClassActivities()` itself (so a completion or an exit-check submit
lifts it live, no reload). CSS keys the hiding off `data-gate="hide"` on
every rail `.nav-btn` except In-Class Activities and Live quiz
(`data-gate="keep"`) — checks.mjs **1aa** fails the push on a nav button with
neither — plus `.g-module`/`.g-set`/`#resume-card`/`#week-panels`;
`#search-btn` needs `!important` because `showApp()`/sign-out already toggle
its inline `style.display`. `routeExploreHash()` rewrites any hash but
`#class-activities`/`#live-quiz` back to In-Class Activities with a
`gateToast()` while gated (`returnToPractice()`
gets the same guard); `window.__forceGate` (localhost only) lets a session
that can't otherwise trigger the gate (dev bypass, the teacher account) force
it on to check the UI.

**Absent students stay blocked — by design** (Jonathan, 2026-09-12): every
visible, undone, uncleared activity blocks, however old, until the student
finishes it or is cleared per student. No blocking window, no
activity-level "stop blocking everyone" toggle — don't propose one again;
the per-student Clear (and Hide, which also removes it from Earlier) are
the tools. One release date serves both periods, also by choice.

**"Open through Module N" — a per-student module skip (2026-10-02).**
`config/class.moduleOpenThrough` (`{ uid: N }`, N = 2..12) is set from the
"Open through" select in the console's Manage table
(`teacherSetStudentOpenThrough`; Auto deletes the key). The student app
reads it into `moduleOpenThrough`; **`isModuleGateLocked` opens modules
`<= N`, `isSetLocked` opens every set in modules `< N`** — module N keeps
its set-to-set order, Set 1 open. Static `locked`/`comingSoon` sets stay
shut, Module 13 is untouched, and the activity gate is a separate system.
**It never writes progress** — nothing is marked done; lowering or clearing
it can't re-lock anything the student has worked in (`hasProgressIn` still
runs first). **It fails open from cache**: cached per uid as
`caOpenThrough`, restored by `restoreClassConfigFromCache()`, never reset to
0 on a failed read. A change under an open app repaints the rail
(`repaintModuleGate`), which also drops a now-open set's peek.

**Optional activities (2026-09-22, Jonathan's ask):** a Required / Optional
switch on every assigned card on the console board writes
`config/class.optionalActivities` (`{ id: true }`, cell-checked, same shape
as `hiddenActivities`; `teacherSetActivityOptional`). An optional card is
still VISIBLE — `caIsVisible()` does not read the map — and renders an
"Optional" tag (`caOptionalTagHtml()`, inside both meta-line builders so hero,
plain card and check all get it), but it is never a blocker. The rule lives
in three places that must agree: `caBlockers()` (app.js, via
`caIsOptional()`), `teacherBlockersFor()` (teacher.js) and `journeyBlockers()`
(tabs/journey.js). The Today hero prefers the first REQUIRED pending card and
falls back to an optional one only when nothing required is left. Cached in
`localStorage` (`caOptional`) with the same fail-to-cache rule as `caHidden`
— a flaky read must not turn every optional card back into a lock. Delete
clears the flag with everything else; Archive keeps it. No
`firestore.rules` change (comment only).

**CAS students: every activity is optional** (2026-09-22, Jonathan's ask —
they must never be locked out of the modules). Keyed off the EFFECTIVE
period (`periodOverrides[uid] || progress.period`, same rule as the console's
`teacherStudentPeriod`). `caIsOptional()` returns true for every card when
`caStudentIsCAS()`, so a CAS student sees every card tagged Optional and
nothing ever blocks; `teacherBlockersFor()` and `journeyBlockers()` return
`[]` for a CAS student (journey.js reads `data.period` off the progress doc
it already fetches). Picking CAS in the period picker re-runs
`applyActivityGate()` so the gate comes down without a reload. The console's
per-student Gate column shows "CAS · optional" instead of a Clear button for
those students. A student who hasn't picked a period yet is gated like
anyone else until they do.

**Per-student clears:** `config/class.activityClears` (`{ uid: { id: true } }`)
lets a teacher let one student past a specific blocker without them finishing
it — a sub day, a connectivity problem, work done on paper. Written by
`teacherSetActivityClear`/`teacherClearAllBlockers` in teacher.js, same
merge-patch shape as `hiddenActivities`/`gameOverrides`; no `firestore.rules`
change (already teacher-write/student-read). UI: a Clear toggle in the
per-student grid on both `renderTeacherActivityDetail` (new — regular
activities had no such grid before this) and `renderTeacherCheckDetail`
(existing, gained a Gate column); a "Blocked by N" badge and a per-student
"Today's activity gate" section with Clear all on the Students views. Cached
in `localStorage` (`caClears`, restored by `restoreClassConfigFromCache` —
renamed from `restoreActivityDatesFromCache`) with the same fail-to-cache
(never fail open) rule as `activityDates`.

**Archive / Delete (2026-09-15, Jonathan's ask):** two buttons per row in the
console's Class activities table, in a new **Archive** column beside
Visible/Hidden. `config/class.archivedActivities` and `.deletedActivities`
(`{ id: true }`, same merge-patch shape and teacher-write/student-read rule as
`hiddenActivities`) — no `firestore.rules` change; the rules edit that shipped
with this was comments only, so nothing needs pasting into Firebase. Students
merge the two maps into one `retiredActivityIds` set (they draw no distinction)
and `caIsVisible()` fails on it **before** the dev-bypass line, unlike the date
gate — a retired activity isn't "not live yet", it's out of the course, so
there's nothing to preview. Everything downstream follows for free: off
In-Class Activities, out of `caBlockers()`, and a deep link reads as
not-posted. The visibility rule
is mirrored in all three places as ever — `caIsVisible` (app.js),
`teacherActivityVisible` (teacher.js), `journeyIsVisible` (journey.js).

The difference between the two is what **Restore** gives back: Archive keeps the
release date, rename, board slot and per-student clears, so the card returns
exactly where it was; Delete wipes all of that on the way out (behind a
`confirm()`) **including the board entry**, so a restored one comes back in
Built — unplaced and undated, to be assigned and published from scratch. The two
flags are mutually exclusive by construction, each writer clearing the other.
Neither touches students' `classActivities` completion records (the teacher has
no write on `progress/{uid}`, and it's grade data), and neither removes the
entry from `class-activities.js` — only a push does. **Retired cards hold no
`#N`** (changed 2026-09-16 with the board — Jonathan's call): the ones after
them count down, so the list students read is always 1,2,3 with no gaps.
Console-side an archived card folds into its module's own `Archived (N)`
disclosure, and an archived-but-unplaced one into Built's
`Archived / deleted (N)`. Cached in
`localStorage` (`caRetired`) with the same fail-to-cache rule as
`activityDates` / `activityClears` / `hiddenActivities` (`caHidden`) — a
blocked read must not bring a retired or hidden activity back and let it
start gating the site again. **`hiddenActivities` joined that list
2026-09-18**: it used to fail open to `{}` on the reasoning that a stray
visible card was cosmetic, which stopped being true when the gate shipped —
an activity the teacher pulled would come back on a flaky read and block the
whole site on work nobody could finish.

**Journey pages gate too.** The six `tabs/*.html` pages now also load
`class-activities.js` (a plain data array, no dependency of its own) so
`journey.js` can compute the same blockers after its own Firestore boot
(`journeyIsVisible`/`journeyBlockers` — deliberately NOT shared with
app.js's `caIsVisible`/`caBlockers`, which read globals only the main app's
boot path populates) and, on a hit, replace the whole page with a
`.ca-gate-card` (styles in `tabs/journey-theme.css`, no `styles.css`
counterpart — the main app's gate stays on the existing In-Class Activities
page rather than a full-page swap) linking back to
`index.html#class-activities`. Skipped
for the teacher's own account by email; a failed config read fails open (no
gate), never on a guess. `mood-chart.html` is not one of the six and is never
gated. **The one exemption (2026-09-12):** a pending activity that names a
Journey page — `journey: '<slug>'` in `class-activities.js` (ca-25 →
seven-nation-army; ca-24, ca-30 → the-cure; ca-27, ca-32 → luna;
ca-26, ca-29 → all-along-the-watchtower; ca-28, ca-33 → sweet-child-o-mine; ca-31 → seven-nation-army — the list is whatever carries the field,
so read the file rather than trusting this line), optional
`journeyLayer` — is sending
the student there as part of the work, so `journey.js` leaves THAT page open
while the activity blocks; every other Journey page stays gated. The card
renders an "Open the … Song Journey page" button (`caJourneyLinkHtml()` — never
on a whole-song card, and not on another activity while its song has an
openable whole-song card; `journey:` on a whole-song card still exempts that
page from the gate while the card is pending and places the card on its Songs
row; the
console preview in `renderTeacherActivityDetail` shows the same link after
its steps — two renderers, patched together). checks.mjs 1d validates the
slug against `tabs/<slug>.html` and the layer against that page's
`layer-num` spans.

**Four steps, two lines a page** (Jonathan, 2026-09-25). **Four steps is a
SOFT rule** (Jonathan, 2026-10-01): aim for four or fewer, but go past it
when Jonathan asks — ca-21 has six. checks.mjs **1bb** prints one reminder
line naming every card over four and never fails the push on it (the old
`FOUR_STEP_LEGACY` pin list is gone). Every class-activity tab
longer than two rendered rows pages two rows at a time with Previous / Next
by default — `CA_TAB_LINES_PER_PAGE`, passed as `defaultLinesPerPage` by
`caStepHtml()` and `renderTeacherActivityDetail()` (1bb pins both). Play tab
and a sibling band snippet both turn the page as they play. `revealDelay` is
**seconds** (`wrapTabReveal()` converts to ms — until 2026-09-25 it didn't,
and every delayed tab appeared after 10 ms). A tab the student has waited
out stays revealed across re-renders that aren't navigation (language
switch, coming back to the browser tab, Done on the last step) via
`caRevealedTabs`; a Focus step move, a new student or a new day clears it.
It is per tab and drops the Play tab button, so it stays off any tab whose Play is
the answer key (ca-21) or the one demo of a held note's length.

**The Journey button is in the LAST step only — every class activity, now
and in future** (Jonathan, 2026-09-25). `caStepHtml()` adds it to the last
step's body and nowhere else: not above Step 1 (where it sat until that
day, sending students to the song page before the work), not in an earlier
step that mentions the page. So **write a new activity with the Song
Journey page named in its last step only** — an earlier listen-along goes
on a `snippet` of the same backing track instead (ca-20 step 1 is the
model). checks.mjs **1ba** fails the push on an earlier step naming the
page (EN "Song Journey", ES "Recorrido de la canción", text or label), on a
step naming it in an activity with no `journey:`, and on any
`caJourneyLinkHtml(a)` call other than the one last-step-gated one.

**Practice cards — `view: 'card'` (Jonathan, 2026-09-27; ca-18, ca-10; ca-13,
ca-19, ca-20 rebuilt to it 2026-10-01). The default for every song activity
with a backing track — ca-18 is the model (Jonathan, 2026-10-01: the format
"works much better for students"). Activities with no backing track stay
Focus-view step ladders.**
Students did what was taught directly and stopped there, so the slides now
teach the rungs and the activity is ONE screen: the song's tab, one "Play
song" button that plays the real backing track and moves the tab note by
note (`.beat-now`, honouring each note's `beats`), one page per section with
tap-a-section-to-start (four-click count-in, then the loop returns to that
section — except on a `card.wholeSong` card (ca-24 to ca-33), which
stops at the end of the song, Jonathan 2026-10-02), a Slower / Normal switch (the slow / fast files, starting on
Slower), the Guitar toggle where a full mix exists, and a Metronome that is
a click the SITE makes on every counted beat — there are no metronome
files; Moises clicked "the cure" at 144, twice the 72 the room counts.
A looping card repeats with no seek: the player keeps a second `<audio>` on
the same file parked at the loop start and hands off to it at the end of the
window ("THE SPARE" in app.js, Jonathan 2026-10-07 — a seek left an audible
hole on every lap). Anything new that touches a card's audio must handle
`st.spare` and `st.leaving` as well as `st.audio`.
Then three or four checkboxes. **A whole-song card's Level up names no other
page and renders no Journey button (it IS the play-along); a part card's Level
up hands off to the whole-song card (`card: 'ca-N'`)** (2026-10-06, 1bn). A Level up may carry `card: '<id>'` to
open another practice card instead of the Journey page — every part card
opens its song's whole-song card (ca-10 → ca-25; ca-13, ca-18, ca-19 →
ca-24; ca-20 → ca-27) — never to a power-chord version (Jonathan, same
day: ca-25 keeps its Journey Level up)
(Jonathan, 2026-10-06: the whole-song cards are more useful than the Song
Journey page right now; `caCardLinkHtml()`,
shown once the target is released or Play Along now; 1bf checks the id).
Before its date the target SWAPS INTO the linking card's slot (`caSwap`,
`caOpenLinkedCard()`) — no Songs heading, no list entry — and closing it
puts the linking card back, open. **No practice card has a help ladder any more** (Jonathan, 2026-10-07: "it's not needed"): `steps: []`, which 1d allows only on a
`view: 'card'` activity, so "More practice help" never renders
(`pcHelpHtml` returns nothing for an empty list). The card's Journey button
is on its last check, the Level up (1ba pins both call sites). **A
whole-song card has exactly two checks** — the whole song slower without
stopping, then the Level up. A check may carry `slot: n` to keep the tick
key it had before earlier checks were removed (ca-25). Data shape: CARD note
atop class-activities.js. Engine: `pc*` in app.js (`pcLayout` sections →
tab offsets and beat totals; `pcLocate` position → note; the snippet
window arithmetic, one `anchor` per song). **Complete = every numbered check
ticked; Level up is extra** — written in place by `pcCheck()` (NOT
`caToggleComplete`, which closes the card and re-renders, stopping the song
and hiding Level up). Check ticks live in `caStepDone` as `<id>:c<n>`;
`caTickKeys`/`caRequiredTickKeys` are what every "n of m" reader counts
(meta line, hero dots, sticky bar, the Mark-complete nudge). One sound at a
time: `pcStop()` sits beside every `snipStop()` in `stopCardAudio`,
`playSequence` and `renderClassActivities` (1bf pins them), and starting a
card calls `stopAllDemoAudio()`. **1bf** checks the data: track exists,
sections back to back, each section's beats = bars × beatsPerBar, notes'
midi/name from string + fret, window inside the file, exactly one Level up
and it's last, help steps carry no snippet/drill/video. A section with a
`repLabel` counts in that word in its caption — "3 laps" under a Lap badge,
"2 times" under a Time badge — and 1bm fails the push on a mix.

**A card note may be a chord** (2026-10-05, the power-chord whole songs
ca-29–ca-33): `{ frets: [[string, fret], ...], note: 'A5', midi: [...] }`,
the same shape Module 3's tabs use, in a card section or a help step's
tab. `caChordProblems()` in checks.mjs recomputes every pitch from the
fretboard and requires a root-plus-5th pair to be named for its root.
Nothing in the card engine needed changing — `renderTabSystem()` already
draws a `frets` note. Each power-chord card is its roots card (ca-24–ca-28)
with the same sections and bars, every root turned into the Journey Layer
3 shape; Luna's is two strums per bar where its roots card is one.

**Slowest (2026-09-29).** A practice card with `card.slowest: true` (every
card today) gets a Slowest / Slower / Normal control in place of the switch, and
every step snippet gets a Slowest button beside the turtle (the two release
each other). Slowest is the SLOW file at `SLOWEST_RATE` (0.8) with
`preservesPitch` — no third export, and the tuner still agrees.
**Since 2026-10-09 the card control has four stops** — Slowest / Slower /
**Slow** / Normal (Jonathan: "just below the normal speed of each song").
Slow is the FAST file at `pcSlowRate(tr)`, halfway between the slow tier and
normal for that song (the cure 66, Seven Nation Army ~112, Watchtower 110),
so it always sits above Slower. Only the two ends are labelled (Slowest, Normal); the middle
two are dots, with Slower/Slow as their aria-label and tooltip (Jonathan,
same day). Each option carries its rate in `data-rate`;
`pcRate()` reads the card's `data-rate`. Step snippets keep their own
Slowest/turtle buttons, unchanged. Anything
reading the file's own clock is unchanged; only real-time amounts (count-in
spacing, click lookahead, output latency) scale by the rate. A `load()`
resets `playbackRate` to `defaultPlaybackRate`, which is why
`slowestApplyRate()` sets both.

**Gate flips on mid-session → In-Class Activities.** `applyActivityGate()`
detects the off→on transition (a new activity going live under an open
Games/Songs/My progress screen, via the `visibilitychange` re-check) and,
once the app is on screen (`appIsOnScreen()`), walks the student to In-Class
Activities with the same toast `routeExploreHash` uses. The CSS alone only
hid the rail; an open
screen stayed open.

**What a gated student can still open is one list — `GATE_OPEN_HASHES`**
(`#class-activities`, `#live-quiz`) — read by
`routeExploreHash`'s guard and the flip redirect. In class is the rail's one
`data-gate="keep"` button (1aa); Live quiz has had no rail button since
2026-09-29. **The guard's redirect only ever lands on `#class-activities`**
(an open activity's `#class-activities/ca-N` included), never back on
`#live-quiz`: closing the quiz routes to `''`, which the gate refuses, and
returning to "the last gate-open hash" reopened the quiz — a gated student
who had joined a game could not get back to their activities at all, game
over or not (2026-09-29).

**Each Core song row links its whole-song practice card** (Jonathan,
2026-10-05, replacing the 2026-10-01 "Play Along with the TAB/Chords"
section that listed every part card at the top of the Songs page — "too
much going on"; the Core list is now the only place). A Core row shows
exactly three links, in this order: **Play Along · Backing track for
solos · Song Journey** — no Tutorial or Original on Core rows (Choice rows
keep theirs). Seven Nation Army, Watchtower, "the cure" lead the list
(`CORE_FIRST`), the rest alphabetical. Play Along opens the song's `view: 'card'` activity with
`card.wholeSong` whose `journey:` matches the row's Journey slug, newest
first (highest board `#N`) when a song has two — the roots card and the
power-chord one — once it passes `caIsVisible()` or
`caIsPlayAlongOnly()`; a song with no such card shows **no** Play Along
link (Jonathan's call — no greyed placeholder). Part cards (The Riff,
Intro and Verse…) are not on the Songs page at all. **A tap opens the
card where it lives** (`songsHubOpenCard()` →
`goExploreHash('class-activities/<id>')`), so there is one copy of each
card and one set of ticks; Back returns to Songs. Don't render the card a
second time on the Songs page: the practice-card engine (`pc*`) and the
open-card state (`caOpenId`, `caSyncHash`, the sticky bar) all belong to
In-Class Activities. `songsPlayAlongBtn(slug)` builds the link inside a
`.sh-play-slot` (`display:contents`); `refreshSongsPlayAlong()` (end of
`loadClassConfig()`) refills just the slots that changed when the board
or dates land after the page is open. Songs stays a gated page.

**One way round the date: "Play Along now"** (Jonathan, 2026-10-02 — "can
we set some visible even if they don't have a release date?"). Every
assigned practice card on the console board has a **Play Along by date /
Play Along now** switch (`teacherSetActivityPlayAlong`, cell-checked write
to `config/class.playAlongActivities`, `{ id: true }`). "Now" lets the
card be opened from the Songs page without a release date — **only a
whole-song card has a Songs link since 2026-10-05**, so the switch on a
part card does nothing a student can reach — and changes **nothing
else**: `caIsVisible()` does not read the map, so the card stays off
In-Class Activities and can never be a blocker (none of the three blocker
rules reads it either). `caIsPlayAlongOnly()` in `app.js` is the one
predicate — practice card, flag on, assigned, not Hidden, not retired, and
NOT already visible. It has three readers: `songsPlayAlongCard()` (the
Core row link), `caFocusActivity()` (so the tap opens it instead of "not
posted"),
and `renderClassActivities()`, which renders that ONE card under the
Songs section's own title **only while it is the open card** — close it
and the next render drops it. Don't fold the flag into `caIsVisible()`:
that would put the card on In-Class Activities and behind the gate, which
is exactly what Jonathan chose against (he was offered "date it and mark
it Optional" and "list every assigned card" and picked this). Cached in
`localStorage` (`caPlayAlong`); Delete clears the flag, Archive keeps it.
No `firestore.rules` change (comment only). checks.mjs 1ai's writer count
went 16 → 17.

**There was an Assessments page (2026-09-12–2026-09-20).** A rail button
and standalone `#assessments` screen listed every module's in-person
assessment items in one accordion, read-only. Removed 2026-09-20 (Jonathan:
redundant with the Module Review's own assessment box, and he posts
rubrics/assignments on Canvas) — rail button, `#assessments`
screen/route/i18n/CSS all deleted. **The Module Review's per-module
assessment box is a separate, still-live feature** — `.mr-assess-box` at
the bottom of `buildModuleReview()`, and its heads-up pop
(`buildMrAssessPop`) — reading the same `MODULE_REVIEWS[n].assessItems`;
don't confuse the two if this comes up again.

**Phase 2 (nav collapse), shipped 2026-09-12:** the rail is five items —
In-Class Activities · Practice · Songs · Games · My progress, no "Explore" heading (the
`nav.explore` i18n key stays: it's still the rail `<nav>`'s aria-label, just
not a visible span any more). Keep practicing and Daily Review are sections
inside My progress now, not their own pages — `renderKeepPracticing()` and
`renderDailyReview()` are UNCHANGED, only their host div moved in
`index.html` and `openMyProgressScreen()` calls all three renderers (Daily
Review first, then Keep practicing, then the module tally). `#keep-practicing`
and `#daily-review` stay in `EXPLORE_HASHES`, but `routeExploreHash()`
canonicalizes both to `#my-progress` before anything else runs (the gate
check, the dedup guard, the scroll stash) — so an old bookmark or Journey
link still resolves, onto the merged page. Mood Chart lost its rail button, and
its row at the top of the Songs page was removed 2026-10-02 (Jonathan) —
`mood-chart.html` still ships and is still precached, but nothing on the
site links to it; don't add a link back without asking.

**Phase 3 (render-time hiding), shipped 2026-09-12 — Module 2 piloted first
(step 1), then the section-kind tagging rolled out to every other module
(step 2), per the work order's own "Order of work."** Four section
`kind`s beyond the pre-existing `tuning-warmup` (ratchet 1r):
`take-to-song` (renders a Journey link card, `journeyLinkCardHtml()`, in
place of its steps — **but only when this module has a Journey layer to
link to**; see the 2026-09-12 correction below), `routine`/`ear-spark`/
`reflection` (the section is skipped entirely — "My Practice Routine",
"Ear Spark — optional ear bonus", "Checkpoint"/"Wrap-Up"). **Kind-ONLY matching, deliberately NOT kind-or-title
like `isTuningWarmupSection`** — `isEarSparkSection`/`isRoutineSection`/
`isReflectionSection`/`isTakeToSongSection` in app.js check `sec.kind`
alone: these four titles repeat across nearly every module, so a title
fallback would hide every module's copy the moment the code shipped, not
just Module 2's. A step-level `hidden: true` flag (song previews now taught
by a class activity) works the same way, no title involved.

**`visibleSteps(sec, moduleNum)` / `visibleSections(station, moduleNum)`**
(app.js) are the one gateway everything student-facing reads through — `buildLesson()`,
`resumeLessonCounts()`, `buildSearchIndex()`, `moduleStepsFlat()` (the
Daily 5 candidate pool) (checks.mjs **1ac** requires the call). The one deliberate exception is teacher.js's `setShortResponses()`:
it walks `storageSections()` (every section but tuning-warmup) because it's
an audit of what students actually wrote, and the Checkpoint / Wrap-Up /
Practice Routine answers from Modules 1–2 are still real after those
sections were retired from the ladder — a slot in a non-renderable section
or on a `hidden` step is tagged `retired` and its label says "(retired)".
1ac requires `storageSections(` there and fails on `visibleSections(`. `visibleSteps` returns `{st, idx}` pairs: `idx` is the
step's real position in `sec.steps` — what every storage key (doneKey,
responses, bpm, drills) is built from, so a hidden step earlier in the array
can never shift a later one's saved progress — while the pair's position in
the *returned array* is the visible step number and the only thing "which
step is current" compares against. `visibleSections` returns `{sec, gi}`
pairs the same way — **`gi` is the STORAGE index and comes from
`storageSections()`: the section's position after excluding ONLY
tuning-warmup sections**, the convention every Firestore key has been
written under since July 2026 (pre-semester, so that one hide is baked into
the keys). Every other hide — routine / ear-spark / reflection, a section
with zero visible steps — is render-only and never renumbers `gi`; the
pair's position in the returned array is its DOM position and nothing
else. The first cut (066dc05, one day live) numbered `gi` over the
survivors and moved Module 2 Set 1 station B's "Play along with the note
map" from `b-sec2` to `b-sec1` — "safe because it's a first rollout" was
true for tuning-warmup in July, not mid-semester. checks.mjs **1af**
rebuilds the expected `data-ns` list for all 36 sets from raw module data
and compares it to what `buildSet()` renders, and pins the Module 2 Set 1
sections by title.

**The Journey link card (3b):** `JOURNEY_LAYERS` in app.js (`{slug: {moduleNum:
layerNum}}`) is authored from the six pages' real `.layer-unit` spans —
today uniformly Module 1→Layer 1 … 5→5, anything past 5 an unnumbered
"Extra". checks.mjs **1ab** rebuilds the map from those spans and fails on
drift. **The box is one button per song** that calls `openSongLink(slug,
layer)` (2026-10-06, play-along first — see that section): the song's
whole-song card for this module's layer if students can open it, else
`tabs/<slug>.html#layer-<n>`. The render rule (Modules 1–5 only, via
`journeySongsFor`) is unchanged, and `JOURNEY_LAYERS` is still what 1ab and 1af
read.

### ⚠️ No Journey layer → the take-to-song section renders its OWN STEPS
**Correction, 2026-09-12 (same day as Phase 3, found by an error sweep).**
The first cut swapped a `take-to-song` section's steps for the Journey card
*unconditionally*, and dropped the whole section when the card came back
empty. Since `JOURNEY_LAYERS` stops at Module 5, that made **every one of
the 20 take-to-song sections in Modules 6–12 render nothing at all** —
silently deleting ~26 challenge cards, Module 12's only graded
assessment-piece card ("Full-Verse Rehearsal") among them, plus the sole
teaching step for 7 skills (m9w1-s5, m9w2-s5, m10w1-s4, m10w3-s6, m11w3-s6,
m12w1-s6, m12w3-s6). The tagging was mechanical and title-matched, so it
hit sections whose content was never a mere song pointer.

The rule now: **the card replaces the steps only when `journeySongsFor(
moduleNum)` is non-empty.** With no layer (module 6+) there is no card, so
the section falls back to a normal section — its own steps, its own heading
— and is "empty" only if those steps are. Lives in three places that must
agree: `visibleSteps()`, `isRenderableSection()`, and `buildLesson()`'s
`hasJourneyCard` branch (which also decides whether the section heading is
suppressed, since the card carries its own title). checks.mjs **1af** keeps
its own independent copy of the rule and caught the drift the moment app.js
changed — update both together. Render-only as ever: `gi` is untouched, so
no progress key moved. Jonathan's call was to restore the steps rather than
keep the card-or-nothing rule; **don't re-simplify this back to an
unconditional swap.** If a Journey page ever grows a Module 6+ layer, adding
it to `JOURNEY_LAYERS` flips that module to the card automatically.

**Ratchets:** 1ab (JOURNEY_LAYERS parity), **1ac** (the four callers above
must still call `visibleSteps(`/`visibleSections(` — a positive assertion,
not an exhaustive raw-iteration scan, so it can't catch a raw
`.steps.forEach` added *alongside* a leftover unrelated call), **1ad** (kind
↔ title, full two-way now that every module is tagged — same shape as 1r:
a tagged section's title must match, and a section titled like one of
these must carry the kind; `KIND_TITLE_COUNTS` pins the total per kind at
`{take-to-song:29, routine:5, ear-spark:7, reflection:62}` across all 36
sets), **1ae** (every `hidden: true` step needs a `// ... ca-<n>` comment on
the line above it, still just the 3 from Module 2 — see below).

**All 13 modules are section-kind-tagged** (mechanical, title-matched,
2026-09-12) — every "Checkpoint"/"Wrap-Up"/"Take It to a Song"/"My Practice
Routine…"/"Ear Spark…" section in the course now carries its `kind`, so
`isEarSparkSection()`'s brief kind-only/no-icon gap (modules not yet tagged
showing Ear Spark without its bolt) is gone too — every instance is tagged.
Module 1 has only one such section (its own "session check-in" `routine`
variant — it predates the take-to-song/Checkpoint/Wrap-Up pattern
entirely); Module 13 (single-flow) has none.

**Step-level `hidden: true` (song previews a class activity now teaches)
stays at Module 2's original 3** — checked Modules 3–8 against every
shipped `ca-<n>` and found no genuine duplicates to add. The Finger Gym
activities (ca-2…ca-7) are generic dexterity drills, not song previews.
"Notes on the Low E String" (ca-11) and "Sub Day Circuit" (ca-12) are
Module 1/2-era content. `"the cure" — The Verse Root Line` (ca-13) teaches
a single-note bass line, but Modules 3–8's own "the cure" steps each teach
a *different* technique on it — power chords (Module 3), soloing (Module
4), open-chord strumming (Module 5), fingerpicking (Module 8) — so none of
them duplicate ca-13's single-note reading (nor does Module 7's Seven
Nation Army "real rhythm" step duplicate ca-10 — different skill, rhythm
notation vs. frets). Real content, not a shortcut: verified with a search
across every Module 3–8 "the cure"/"Seven Nation Army" mention. Leave these
for Phase 4 (new class activities, if any come to duplicate a module step,
would be the trigger to hide it then) — see the work order.

Verified 2026-09-12: a full walk of all 36 sets in both languages (pill
step-total == rendered `<li>` count, zero orphan section headings, no
exceptions) — the closest this repo gets to the work order's "headless
walk," since there's no Playwright harness to run one for real.
