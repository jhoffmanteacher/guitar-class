## 1. Song part card

**For:** students play one or two parts of a Core song (the intro, the verses, the riff) with the real band,
looping, then move on to the song's whole-song card. "ca-18 is the model to match" (the file's CARD note).

**Skeleton** (from `ca-18`):
```js
{
  id: 'ca-55',                         // the next id
  view: 'card',
  title: '"the cure" — Intro, Verse and Chorus', title_es: '…',      // per song
  intro: 'Add the chorus of "the cure" and play …', intro_es: '…',  // per song, one line
  card: {
    track: 'the-cure',                 // per song: a SNIPPET_TRACKS key
    slowest: true,                     // every card has it
    caption: 'The song in order · 4 plucks per note', caption_es: '…',  // per song
    sections: [                        // per song, back to back, in song order
      { label: 'Intro', label_es: 'Intro', caption: 'Intro — A C A C', caption_es: '…',
        fromBar: 1, bars: 4,           // bars of the RECORD, felt pulse
        notes: [ { string: 'E', fret: 5, note: 'A', midi: 45 }, … ] },     // beats add up to bars × beatsPerBar
      { label: '2 Verses', …, fromBar: 5, bars: 8, reps: 2, repLabel: 'Verse', repLabel_es: 'Estrofa', notes: [ … ] },
    ],
    checks: [                          // not shown since 2026-11-10, kept as data and held to one line by 1cs
      { label, label_es, text, text_es }, …,
      { levelUp: true, card: 'ca-24', text: '…', text_es: '…' }        // per song: its whole-song card; last, exactly one
    ]
  },
  steps: [],                           // no practice card has a help ladder
}
```

**Direction lines:**
- `ca-18`: "Add the chorus of "the cure" and play from the intro to the end of the chorus with the band." / "Agrega
  el coro de "the cure" y tócala desde la intro hasta el final del coro con la banda."
- `ca-10`: "Play the Seven Nation Army riff with the song." / "Toca el riff de Seven Nation Army con la canción."
- `ca-20`: "Play the "Luna" loop with the band: F at fret 1 on the low E string, then the open A string." / "Toca el
  bucle de "Luna" con la banda: F en el traste 1 de la cuerda Mi grave y la cuerda La al aire."

Pattern: "Play <the part> with the band/song", the notes named when they are new. No count: a practice card shows no
tap dots (`caTickKeys(card)` is `[]`, `guide/practice-cards.md` "Checks").

**Ask Jonathan:** which song and which parts; the string and frets of each note, and how many plucks per bar (the
captions say it: "4 plucks per note", "1 pluck per bar, let it ring"). The song's settled chords and section bars come
from skill `song-facts` before you ask.

**Traps:**
- A part card's Level up opens its song's whole-song card (`card: 'ca-N'`) — "never a power-chord version"
  (`guide/practice-cards.md` "Level up and links"; 1bn).
- **1bf** checks the data: the track exists, sections back to back, beats = bars × beatsPerBar, midi from string +
  fret, the window inside the file, exactly one Level up and it is last.
- A section with `repLabel` counts in that word; **1bm** fails a mix.
- Snippet windows are bars, never seconds (CLAUDE.md, the audio row).

**Tools:** `node tools/playalong-loop.mjs --only <id> --shots <dir>` and look at every PNG (CLAUDE.md, the audio row:
"after any change to a practice card's chart").
