## 4. Library play-along (Songs page)

**For:** a song a student asked for, on the Songs page's "More Play Along songs" for the whole class from the push,
with no board slot or date. Never a Core song (**1bq**). Six of the seven are `library: true`; `ca-41` is
`library: false`, the same card starting as a class activity (the file's LIBRARY note).

**Skeleton** (from `ca-51`; **typed by `tools/new-playalong.mjs`, not by hand** — skill `new-playalong` step 4):
```js
{
  id: 'ca-55', view: 'card',
  library: true,                       // false: starts on the board's Built list instead
  added: '2026-11-26',                 // the Songs page's "Date added" (1fa)
  optional: true,
  chordStart: 'power',                 // with chordVersions: opens on Power chords
  chordVersions: { power: { 'C#m': { frets: [['G', 6], ['D', 6], ['A', 4]], note: 'C#5', midi: [61, 56, 49] }, … } },  // per song
  title: '"Perdón Mamá" - Chuy Montana — Play Along', title_es: '"Perdón Mamá" - Chuy Montana — Toca con la canción',
  intro: '…', intro_es: '…', intro_power: '…', intro_power_es: '…',
  card: {
    track: 'perdon-mama', chordGrid: true, slowest: true,    // per song: track
    caption: 'The song in order', caption_es: '…',
    sections: [ { label: 'Intro', …, fromBar: 1, bars: 16, notes: [ … ] }, … ],   // per song, from the measured record
    checks: [ …, { levelUp: true, text: 'Slide the speed to Normal and play the whole song with the band.', text_es } ]
  },
  steps: [],
}
```

**Direction lines:**
- `ca-51`: "Play Perdón Mamá with the band: C#m, B, F#m and A in the same eight-bar loop all the way through." / "Toca
  Perdón Mamá con la banda: C#m, B, F#m y A en la misma vuelta de ocho compases de principio a fin." (and its
  `intro_power`: "… C#5, B5, F#5 and A5 …")
- `ca-42`: "Play Vuelve a la Vida with the band using five power chords: Bb5, G5, Eb5, C5 and F5." / "Toca Vuelve a la
  Vida con la banda con cinco acordes de potencia: Bb5, G5, Eb5, C5 y F5."
- `ca-37`: "Play Arsenal Efectivo with the band using B5, E5, A5 and Bb5, all between frets 5 and 9." / "Toca Arsenal
  Efectivo con la banda con B5, E5, A5 y Bb5, todos entre los trastes 5 y 9."

Pattern: "Play <song> with the band: <the chords>". A `chordVersions` card has an `intro_power` twin naming the
power chords (the file's CHORD VERSIONS note). No tap dots.

**Ask Jonathan:** skill `new-playalong` step 1, in one message: the mp3, song and artist read back, the chords from
his chart (read a picture's chords back first; "never invent a chord"), the level (power or open chords), a capo or
key change, which part. Step 3 says when to stop and ask (a drifting record, a chord the level has not taught, a
tempo change, an audit that cannot tell).

**Traps:** every one is in skill `new-playalong`: every new song is PRIVATE (`--private`), Jonathan uploads and
Verifies before the push; level to the cure with `loudness.py`; the tool's card comment says "No lyrics: the song is
not public domain"; a BUILT song (`--built`) needs no card here at all. A library card is "NOT a class activity"
(the file's LIBRARY note): it never appears on the board.

**Tools:** skill `new-playalong` steps 5 and 6: `python3 tools/loudness.py`, `python3 tools/beat-audit.py --only`,
the full `node tools/checks.mjs`, `node tools/playalong-loop.mjs --only <id> --shots <dir>`.
