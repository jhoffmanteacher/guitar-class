## 5. Speed ladder

**For:** one passage played once at each stop from a slow tempo up to record speed; after each time through the song
stops and asks "Got it" or "Practice again" (the comment above `ca-54`).

**Skeleton** (from `ca-54`):
```js
{
  id: 'ca-55', view: 'card',
  title: 'Sweet Child O\' Mine — Speed Ladder', title_es: 'Sweet Child O\' Mine — Escalera de velocidad',
  intro: 'Climb to record speed on the verse and chorus together.', intro_es: '…',
  card: {
    track: 'sweet-child-o-mine', slowest: true,
    slowestRate: 0.9,                  // per song: the bottom stop (the site's usual is 0.8)
    startStop: 'slowest',              // opens on the bottom stop
    buildLaps: 1,                      // one time through per stop
    sheet: '…', sheetColumns: 1, sheetNamedAgain: ['Verse 1'], sheetChords: 14,   // per song: its own cut sheet
    caption: '…', caption_es: '…',
    sections: null,                    // another card's sections, joined by label after the array
    rounds: [ { label: 'Verse + Chorus', label_es: '…', what: '…', what_es: '…', from: 0, to: 1, startStop: 0 } ],
    checks: [ { label: 'Up to 112', … }, { label: 'Record speed', … } ]   // plain checks, NO Level up
  },
  steps: [],
}
```

**Direction lines** (`ca-54`): intro "Climb to record speed on the verse and chorus together." / "Sube a la velocidad
de la grabación en la estrofa y el coro juntos."; checks "Play the verse and chorus one time through at 90, 100 and
112 BPM." / "Toca la estrofa y el coro una vez a 90, 100 y 112 BPM." and "Play the verse and chorus one time through
at record speed, 125 BPM." / "Toca la estrofa y el coro una vez a la velocidad de la grabación, 125 BPM." Pattern: the tempo targets named as numbers.

**Ask Jonathan:** the passage, the tempo stops, which sheet or view it opens on.

**Traps:**
- **1fc** "pins `rounds`, `slowestRate`, `startStop` and `buildLaps` to that card alone" (`guide/practice-cards.md`, the 1bf bullet).
  A second ladder therefore means widening that pin in the same commit: CLAUDE.md "Triggers" counts "extending what a
  check reads" as break-it proof only.
- A card with `rounds` has no Level up (**1bf**).

**Tools:** `node tools/playalong-loop.mjs --only <id>` and `node tools/speed-ladder-loop.mjs` (its header: it plays
`ID = 'ca-54'`, so a second ladder needs the tool taught its id; about 6 minutes, one browser run).
