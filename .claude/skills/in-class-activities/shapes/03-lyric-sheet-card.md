## 3. Lyric-sheet card

**For:** the same whole song read from Jonathan's own chords-over-lyrics PDF, a dot on the chord being played.

**Skeleton** (from `ca-44`):
```js
{
  id: 'ca-55', view: 'card',
  title: '"the cure" — Lyrics and Chords', title_es: '"the cure" — Letra y acordes',
  intro: 'Play the whole song in power chords from the chord sheet, following the dot.', intro_es: '…',
  card: {
    wholeSong: true, track: 'the-cure', slowest: true,     // per song: track
    sheet: 'sheets/the-cure.pdf',      // per song: his PDF
    sheetColumns: 1,                   // one column of chords over lyrics; left out = two columns (ca-38, ca-45)
    sheetChords: 94,                   // per song: names on the sheet = chord changes in the notes (1bf2)
    caption: 'Lyrics and chords · …', caption_es: '…',
    directions: 'Play the whole song from the sheet with the band without stopping, changing on the word under each chord.',
    directions_es: 'Toca toda la canción con la hoja y la banda sin detenerte, cambiando de acorde en la palabra bajo cada nombre.',
    sections: null,                    // the play-along card's — joined after the array
    checks: [ { label, label_es, text, text_es }, { levelUp: true, text, text_es } ]
  },
  steps: [],
}
// and one pair in the IIFE after the array: [['ca-30', 'ca-44'], …] — to.card.sections = from.card.sections
```

**Direction lines:** `ca-38`, `ca-44` and `ca-45` share the intro "Play the whole song in power chords from the chord
sheet, following the dot." / "Toca la canción completa con acordes de potencia desde la hoja de acordes, siguiendo el
punto." and the check "Play the whole song with the band from the sheet without stopping." / "Toca la canción
completa con la banda desde la hoja, sin detenerte." Pattern: "Play … from the sheet". No tap dots. The card's own
direction line (`card.directions`, 2026-11-27) is the same on all three: "Play the whole song from the sheet with the
band without stopping, changing on the word under each chord." / "Toca toda la canción con la hoja y la banda sin
detenerte, cambiando de acorde en la palabra bajo cada nombre." (1cs `CARD_DIRECTIONS` +2, 1fj `FJ_RELEASE_CARDS` +1.)

**Ask Jonathan:** the PDF ("The PDF in `sheets/` is his own Word doc; the lyrics come from his file, never typed into
code"); one column or two; which play-along card's sections it reads.

**Traps** (`guide/practice-cards.md` "A card can show a chord sheet PDF instead of its tab"):
- "Sheet chord n = the card's n-th chord CHANGE": `sheetChords` pins the count and **1bf2** holds the notes to it. A
  chord still ringing at a line start gets no name unless its section is in `sheetNamedAgain`.
- The sections are the play-along card's by reference (one IIFE after the array), so a rhythm edit there moves the dot.
- No `journey`: a sheet card "is another view of ca-29, not Layer 3's play-along" (**1bn**).

**Tools:** `node tools/playalong-loop.mjs --only <id> --shots <dir>`.
