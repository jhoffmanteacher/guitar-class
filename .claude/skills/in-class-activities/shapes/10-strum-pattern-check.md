## 10. Strum-pattern check

**For:** one step: the student plays eight bars with the Listening Coach button under the strum board; the step
ticks itself after two full rounds (the file's LISTEN ROUNDS note).

**Skeleton** (from `ca-52`; no `view` and no `intro`, the only such card):
```js
{
  id: 'ca-52', title: 'Strum Pattern check', title_es: 'Chequeo del patrón de rasgueo',
  steps: [ { label: 'Play for feedback — D5, C5, G5', …,
             text: 'Play the eight bars, two full rounds, with the button under them.', text_es: '…',
             listenRounds: 2,
             strum: { …, bars: [ 8 bars ], barsPerRow: 4, bpm: 85, listen: true } } ],
}
```

**Direction line:** "Play the eight bars, two full rounds, with the button under them." / "Toca los ocho compases,
dos rondas completas, con el botón de abajo." (no dots: the rounds count it).

**Ask Jonathan** before anything: this is not a copy job. "`listen: true` … 1eh pins it to this step alone" (the
`ca-52` source), and the judge is listening code in `coach-strumcheck.js` (CLAUDE.md "Where the code lives").

**Tools:** `node tools/mic-sim/strum-check-loop.mjs` after any change to `coach-strumcheck.js` (CLAUDE.md).
