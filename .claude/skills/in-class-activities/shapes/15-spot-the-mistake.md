## 15. Spot the mistake

**For:** listening while reading tab or a chord line (any module; no guitar needed). The site plays one lap of a
practice card's section with ONE note or chord wrong, and the student taps the column where it went wrong
(`app/drills-spot.js`; its header is the schema and the rules). Tap-graded, so it gives a real score in a loud room
with no mic. Built 2026-11-27 from proposal P3 (`proposed.md`), WORK-ORDER-spot-record-wording Part 2.

**Skeleton** (from `ca-57`; per-song values marked):
```js
{
  id: 'ca-58', view: 'focus',
  title: 'Spot the Mistake', title_es: 'Encuentra el error',   // no intro: the drill's own line says it
  steps: [
    { label: 'Practice — Seven Nation Army riff', label_es: 'Practica — El riff de Seven Nation Army',
      drill: { type: 'spot', card: 'ca-10', section: 'The riff', rounds: 10 } },                 // notes: per song
    { label: 'Practice — Watchtower verse chords', label_es: 'Practica — Acordes de la estrofa de Watchtower',
      drill: { type: 'spot', card: 'ca-29', section: 'Verse 1', chords: true, rounds: 10 } },   // chords: per song
  ],
}
```

**What the student sees** (before Start): the head (song · section, "10 rounds · 100 BPM"), the one line
`spot.introNotes` "Tap the note that sounds wrong; get 8 of 10." / "Toca la nota que suena mal; acierta 8 de 10."
(`spot.introChords`: "Tap the chord that sounds wrong; get 8 of 10." / "Toca el acorde que suena mal; acierta 8 de
10."), the section's tab as written, Start, and the pass line `spot.pass` "8 of 10 rounds finishes this step."
A round: a bar of count-in, the line once at the card's Slower tempo (the slow file's BPM: 100 for ca-10, 105 for
ca-29), then "Where did it go wrong?". A right tap flashes the column green and plays the wrong note (or chord), then
the right one; a wrong tap turns it red and outlines the right column. "Play again" at most twice a round. Ten rounds,
a streak in the head, round dots, then the score, the longest streak and Go again. Nothing is saved; the Focus view's
"Got it — next step" ticks the step as on every drill step.

**The mistake is made by the code** (`spotPick`, never typed into the data): notes, one note moves one or two frets on
its own string (fret 0 to 15); chords, one chord of the line (a run of the same chord) is played as another chord of
the same line, never one with the same notes. Never the position the round before changed.

**Ask Jonathan:** which card and section each step reads (a notes section must be single notes on the tab; a chords
section must start every strum on an eighth and have two different chords at least); how many rounds.

**Traps:**
- The drill reads the card's section BY REFERENCE: a change to that card's notes or bars changes the drill
  (`spotModel` refuses what it cannot draw, and **1fs** fails the push on that).
- **1fs** pins `ca-57` and its two drills exactly; a second Spot the mistake card means widening that pin in the same
  commit. It also pins the pass line (8 of 10) and the replay cap (2).
- The direction lines are in 1cs's `DRILL_DIRECTION_KEYS`; a new line goes there too.
- No Live In-Class Games (projector) version yet: that is "a further, larger step" (`live-quiz.js` and its rule that
  nothing on the stage reveals the answer).

**Tools:** the common ones; `node tools/stop-loop.mjs --start=spot` after a change to the part; the smoke's
`spotWalk` (`--only activities`); `node tools/focus-tap-diff.mjs` (every Focus activity).
