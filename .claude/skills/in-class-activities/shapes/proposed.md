## Proposed shapes (not built yet)

Formats the cards do not use yet (Jonathan, 2026-11-26, through the lead). Each was checked against the bank (`inventory.md`)
and the site's drills and games: the Games hub (`coach-*.js`: Note Hunt, Change Up, Power Chord Switch, Chord Blitz,
Chord Detective, Name That Riff, Pentatonic Simon and its guitar twin, Fret Zap, Strum Hero, Riff Roulette, Strum
Radar, Riff Runner and its Wait Mode, Note Runner, Finger Gym: The Ladder, Pattern Detective, Build-a-Chord), the Live
In-Class Games (`live-quiz.js` and its Hear the Chord Change, Higher or lower? and Saw chase), the step drills (Shuffle,
Card Deck, Ear Spark, Note Call, Call the chord, Name the power chord), Find-the-Note, and the practice card's own
switches (versions, recordings, views, Loop this part, Build up speed, the speed ladder, paths).

**The room's limits, for every proposal** (Jonathan, 2026-11-26, through the lead): the mic does not work in his
classroom, so nothing here is graded by listening: a student's playing is self-checked ("Got it" / "Again") or the
answer is a tap. Chromebook 1366×657. One direction line, verb first. Hook like a game: rounds, a streak, a reveal.

A new drill type or a new card switch is new site code. CLAUDE.md "Where the code lives" applies to all of them: a
new feature gets its OWN part (`app/<x>.js`, in `index.html`'s `site-parts:app.js` block and the `sw.js` lists), its
strings go in `i18n.js` EN and ES, its direction lines join 1cs's `DRILL_DIRECTION_KEYS`, and "a new control or
default → pin the default in `checks.mjs` and make `tools/smoke.mjs` click it and reload" ("Start here" step 4). A
drill type needs no change to the console preview: `renderTeacherActivityDetail` already draws `s.drill` through the
same dispatcher, `renderShuffleDrill` (`teacher-activities-2.js`, its drill line). Anything that touches a card's audio
"must handle `st.spare` and `st.leaving` as well as `st.audio`" (`guide/practice-cards.md`, THE SPARE), and is proved with
`node tools/playalong-loop.mjs`. Sizes: small = one part's worth of code and one check; medium = a new part, a check
and a smoke walk; large = a renderer change shared with the modules or the console, or new audio work.

### Jonathan's picks

P1 (Echo) and P4 (Memory fade) were built on 2026-11-26: shapes 13 and 14.

#### P2. Fill the gap (one bar left silent)

**Teaches:** keeping the beat through a stop, and owning one part of the song (any module with a practice card; first
with the single-note cards of Modules 2 and 3, later with chords).

**What the student sees and does:**
1. On any practice card, a new switch beside Loop this part: "Fill the gap". Off by default.
2. Switched on, one bar in each line of the chart is marked YOU (the cell outlined, the word over it).
3. They press Play song. The band plays, and on the YOU bar the band goes silent: only the site's Metronome click
   keeps going, and the cursor keeps moving.
4. They play that bar alone; the band comes back in on the next bar line, on time, whether they were there or not.
5. With Loop this part on, each lap moves the gap one bar later (bar 4, then 3, then 2), so the whole line gets
   played alone once.

**Data:** none required (a switch on every card, the way Loop this part needs no data). Optional per card: `card.gap:
{ bar: 4, of: 4 }` (the 4th bar of every 4) where a song's phrase calls for another place.

**Grows from:** the card's Metronome (a click the site makes, so it can keep going while the band is silent), Loop this
part and its lap count (`app/cards-loop.js`), and the Guitar toggle's idea that the student carries the part ("Record
plays it" / "You play it", skill `audio-and-snippets`). Not a duplicate: the Guitar toggle's off state "turns the part
DOWN rather than removing it" and lasts the whole song; nothing in the site silences the band for one bar.

**New code:** medium. In `app/cards.js` / `app/cards-loop.js`: the band's volume to 0 from one bar line to the next
on the playing element AND the spare, back to full on every stop, leave, section tap and speed change; the YOU mark in
both chart views (tab and chord grid) and the sheet's "This bar"; a `playalong-loop.mjs` walk that the band is silent
exactly on the YOU bar and the click is not.

**Example on a course song:** "the cure" (`ca-18`), Intro and 2 Verses (bars 1–20, a chord change every bar): the
band drops out on bar 4 of every four, so the student plays the last C of each "A C A C" line alone.

#### P3. Spot the mistake

**Teaches:** reading tab or a chord chart while listening; hearing a wrong note or chord (any module; no guitar needed,
so it also works on a day with no guitars or as a warm-up on the projector).

**What the student sees and does:**
1. One line: "Tap the note that sounds wrong; get 8 of 10." The tab of a riff (or a chord chart) is on screen, as
   written.
2. They tap ▶ Play; the site plays it with ONE note changed (a fret or two away on the same string), or one chord
   swapped.
3. They tap the note (the column) or the bar where it went wrong. Right: the column flashes green and the wrong and
   right notes both play. Wrong: the right column is shown.
4. Ten rounds, a streak, a pass line under Start ("8 of 10", the shape `chordcall` uses).

**Data:** `drill: { type: 'spot', card: 'ca-10', section: 'The riff', rounds: 10 }` for notes; `drill: { type:
'spot', card: 'ca-29', section: 'Verse 1', chords: true, rounds: 10 }` for chords. The wrong note is made at random by
a rule in the code (same string, one or two frets away, never the same pitch), so no answers are typed into the data.

**Grows from:** Pattern Detective (one bar shown, one played, "match / no match", `coach-more.js`) and Chord Detective
(a chord by ear). Not a duplicate: Pattern Detective judges a whole strum bar yes or no; this asks WHERE, on a song's
own tab, which is the skill of following the page. `chordcall` already reads a card's sections (`ca-48`).

**New code:** medium: a new drill type in its own part, `app/drills-spot.js` (`playSequence` for notes,
`strumChord` for chords; each tab column already has a note-name button under it, the file's `finger` note). A Live In-Class Games
version for the projector later is a further, larger step (`live-quiz.js` and its rule that nothing on the stage
reveals the answer, `.claude/rules/live-quiz.md`).

**Example on a course song:** `ca-10`'s riff, frets 7 7 10 7 5 3 2 on the A string; a round plays 7 7 10 7 **6** 3 2
and the student taps the fifth note. For chords: Watchtower's Verse 1 from `ca-29` (A5 G5 F5 G5) played with one G5
as an A5.

### More proposals

#### P5. Duet (partner split)

**Teaches:** playing your own part against another part (Module 3 on: roots against power chords). Two students, one
track: one plays the roots, the other the power chords. **Data-only version today (small):** two cards that share
their sections bar for bar already exist, `ca-24` (roots) and `ca-30` (power chords), "the cure", 10 sections with the
same `fromBar` / `bars`; the pair opens one card on ONE Chromebook and each reads their own part (a step or card intro
says who plays what). **Built version (large):** a "Duet" view stacking the two parts' charts under one cursor —
`otherViews` already shows another view of the same sections, but one at a time; two at once is a renderer change, and
the height at 1366×657 is tight. Grows from `otherViews` (`app/cards-views.js`). Nothing in the bank or the games puts
two parts on one screen.

#### P6. Song-form arrange

**Teaches:** a song's form (intro, verse, chorus, bridge) and listening for sections (Module 2 on, with the Core
songs). Tiles with a song's section names come up shuffled; ▶ on a tile plays its first two bars from the record; the
student taps them into order, then Check; then "Play it" opens the whole-song card. **Data:** `drill: { type: 'form',
card: 'ca-24' }` (the card's own `sections`, labels and bars). **New code:** medium, a drill type in its own part
(snippet windows are bars, so a tile's two bars come from `fromBar`). Grows from `chordcall` (reads a card's sections)
and Build-a-Chord (place, then Check). Nothing existing asks for a song's order.

#### P7. Make your own loop

**Teaches:** chord changes in a progression the student chose (Module 3 power chords, Module 4 open chords). Four
empty bars and a row of chord buttons the class knows (`D5 C5 G5 A5`); the student fills the bars, presses ▶ Play
strum and plays along, then changes one bar and goes again; a partner can try their loop. **Data:** a `strum` step with
`pick: ['D5', 'C5', 'G5', 'A5']` in place of fixed `bars`. **New code:** small to medium, but `buildStrum` (`app/tab.js`)
is shared with the modules and the console preview (1d pins both renderers), so it is a shared-renderer change. Grows
from `ca-53` / `ca-46` (the strum board already plays a chord per bar). Not a duplicate: every strum board today has
fixed `bars`.

#### P8. Improvise over a loop

**Teaches:** soloing with the A minor pentatonic box (Module 5, Pentatonic). The band loops one section; the box is a
tab run; the student plays any notes from the box and ends each lap on A. **Data-only version today (small):** a tab
step with the box (`PS_NOTES` in `coach-ear.js` is "one octave of Am pentatonic Pattern 1 at fret 5") and a `snippet`
of the band's bars, the pairing `ca-34`'s requinto steps use; the song must fit A minor pentatonic (skill `song-facts`;
ask Jonathan). Activities carry no figures (**1d** errors on `figure`), so the box is shown as tab, not a diagram.
**Closest existing:** the Journey pages' Layer 5 (Pentatonic Solo) and the Songs tile's "Backing track for solos";
this only brings it into an activity with the record looping the bars, so it is the least new of the eight.

### Which to build next (my view)

1. **Fill the gap (P2).** A switch on every existing card with no new data; it reuses the Metronome and the lap
   count, and gives each student "their" bar, the most game-like of the proposals in the room.
2. **Spot the mistake (P3).** Works with no guitar in hand and is tap-graded, so it is the one proposal that gives a
   real score without the mic; it reads the cards' sections, so every song the class knows is content on day one.
