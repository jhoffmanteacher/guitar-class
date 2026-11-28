## The full rules behind CLAUDE.md's one-liners

### Activity order, numbering and the board
**Not in `class-activities.js`.** `config/class.activityBoard`
(`{ id -> { module, pos } }`, `module: 0` = the board's Unsorted pen) is
written by the console's **Class activities board** (`teacher-activities.js`; its one writer is in `teacher-activities-2.js`): Built on
the left (pushed, not placed), Assigned on the right (by module, in reading
order). It decides the order, the module headings and the `#N` prefix.
- A card with no entry is invisible to everyone. **Not archived/deleted +
  assigned + not Hidden + given to this student (`caForMe`) +
  dated-and-arrived** is the full live-for-students rule (`caIsVisible`, in
  that order; the dev bypass skips only the date).
- `caBoardOrder()` in `app/activities-2.js` is the one resolver, read by students
  (`caBoardView`/`caNumber`) and by the console (`teacherBoardView`), so the
  two can't disagree.
- Archived cards keep their slot but hold no `#N` (see Archive / Delete, `gate.md`).
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
`caStepHtml()` (`app/activities.js`, students) and `renderTeacherActivityDetail()`
(`teacher-activities-2.js`, the console preview) each have their own `if(step.figure)` /
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
A Focus step tap (`caFocusGo`) redraws the OPEN CARD alone (`caRedrawOpenCard`, `app/activities.js`, 2026-11-25:
760 ms → a fraction at 4x CPU), with the builder and arguments the last full render used for it, which every card
call site in `renderClassActivities()` and its groups passes through `caCardOut`. A new call site goes through
`caCardOut` too, and anything outside the card that starts to read a step's tick or `caStepOpen` breaks the redraw:
run `node tools/focus-tap-diff.mjs` (every Focus activity and step, EN and ES: the page after a tap must equal a full
render, byte for byte). The last step's "Done" and any doubt (another card open, a pending "Since your last visit"
repaint, a new day, student or language) still render the whole page.

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
`app/cards.js`. Students reach it from `caActivityCardHtml`/`caHeroCardHtml` through
`caCardBodyBlockHtml(a, …)`; `renderTeacherActivityDetail` reaches it with
`{preview:true}`. 1bf pins all three and renders both student builders.

### Step drills replace paper (`step.drill`)
- A card that gets a drill has **no paper-fallback line**.
- **`notecall`** (ca-23; power-chord mode in ca-43) is a guitar drill, not a paper one: a note name comes
  up on the beat and the student plays it. "Show answer" (on by default) is an
  unscored play-along; turned off, it is five scored levels (`NC_LEVELS`),
  answered by the mic (off by default) or by tapping the fret. Engine and
  schema: the comment above `NC_LEVELS` in `app/drills-call.js`; progress in `games.nc`;
  `gamesStopMic()` stops it. Optional `board: 'all'` draws all six strings and still takes
  taps on the drill's own strings (ca-49 step 1 only, pinned by 1co; Jonathan, 2026-11-11).
- **`pcname`** (ca-49, Name the Power Chord) draws all six strings and the whole three-finger
  shape; roots are on the low E and A, and a step's `maxFret` is 10 at most so the shape fits.
- **`spot`** (ca-57, Spot the mistake, 2026-11-28; `app/drills-spot.js`, shape 15) plays one lap of a practice
  card's section (`card`, `section`; `chords: true` for a chord line) with ONE note or chord wrong, made by a rule in
  the code, and the student taps the column. Tap-graded, no mic, nothing saved; 8 of 10 passes, two replays a round.
  checks.mjs **1fs** pins the data, the rule, the pass line and the replay cap.
- **`deck`** design calls (Jonathan, 2026-07-26), kept as they are:
  - Self-report, not auto-grading: the app cannot hear whether the chord was
    played, and a 4-choice deck turns recall into recognition.
  - A two-sided deck hides the back until tapped.
  - "Put it back" re-deals the card 3 later; only first-try hits score.
  - The ear sequence is never shown before the reveal.
- `DECKS` lives in `app/drills.js`, not module data, so its Spanish comes from
  `i18n.js`. Storage: `games.dk`.
