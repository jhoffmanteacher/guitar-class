## 8. Note-names ladder

**For:** the note names on one string: play them from tab saying each name, then two drills, then play.

**Skeleton** (from `ca-11`):
```js
{
  id: 'ca-55', view: 'focus',
  title: 'Notes on the Low E String', title_es: 'Notas en la cuerda Mi grave',
  intro: 'Learn the names of the notes on the low E string, from open E to fret 12.', intro_es: '…',
  steps: [
    { label: 'The dot notes', …, text: 'Play E, G, A and B at the dots, saying each name out loud, three times through.',
      tab: { bpm: 20, minBpm: 20, maxBpm: 80, caption: '…', notes: [ … ] } },
    { label: 'Name the fret', label_es: 'Di la nota',
      text: 'Get 7 of 10 on your first pass, then try for 9 of 10.', text_es: 'Saca 7 de 10 en tu primera pasada y después intenta sacar 9 de 10.',
      drill: { type: 'shuffle', string: 'lowE', maxFret: 12, rounds: 10, seconds: 8, pile: 'naturals' } },   // per string
    { label: 'Find the note', label_es: 'Encuentra la nota',
      text: 'Find five notes in a row on the low E string without looking at a tab.', text_es: '…',
      drill: { type: 'deck', deck: 'naturals-lowE' } },                // per string: a DECKS key
    { label: 'Keep going', …, text: 'Play the notes up and back, one per beat, from 20 BPM up to 40, adding 5 each clean pass.' }
  ],
}
```

**Direction lines:** the shuffle line is the same on `ca-11`, `ca-17` and `ca-12`: "Get 7 of 10 on your first pass,
then try for 9 of 10." (no dots: a score). The deck line, `ca-11`: "Find five notes in a row on the low E string
without looking at a tab." / "Encuentra cinco notas seguidas en la cuerda Mi grave sin mirar la tablatura." (5 dots).
`ca-17`: "Play the A-string notes, saying each name out loud, three times through." / "Toca las notas de la cuerda La
diciendo cada nombre en voz alta, tres veces completas." (3 dots).

**Ask Jonathan:** the string and the fret range.

**Traps:**
- The "Name the fret" and "Find the note" steps keep their line because "neither drill shows its finish line before
  Start" (`guide/directions.md` "Every direction is ONE line").
- The deck must exist in `DECKS` (`app/drills.js`; `naturals-lowE`, `naturals-A` and `naturals-plus` today); a new
  deck is code and `i18n.js` strings, not data (`guide/board-renderers-drills.md` "`DECKS` lives in `app/drills.js`").

**Tools:** the common ones.
