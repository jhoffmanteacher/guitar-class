## 2. Whole-song play-along (Core song)

**For:** the play-along of a Core song, intro to the end, with the band. It IS the song's Play Along (the Songs tile
and every song link open it), so it carries `journey` + `journeyLayer`: 2 for roots (`ca-24`–`ca-28`), 3 for power
chords (`ca-29`–`ca-33`) (`guide/songs-links.md` "Layer matching"). `ca-40` is the same shape made teacher-only.

**Skeleton** (from `ca-30`):
```js
{
  id: 'ca-55', view: 'card',
  journey: 'the-cure',                 // per song: one of the SONG_JOURNEYS slugs
  journeyLayer: 3,                     // 2 roots, 3 power chords
  title: '"the cure" — The Whole Song in Power Chords', title_es: '"the cure" — Toda con acordes de potencia',
  intro: '…', intro_es: '…',
  card: {
    wholeSong: true,                   // stops at the end of the song instead of looping
    track: 'the-cure',                 // per song
    chordGrid: true,                   // power-chord cards except ca-31 (a riff played as chords is not one)
    slowest: true,
    caption: 'The whole song in power chords', caption_es: '…',
    sections: [                        // per song: the whole record, in order
      { label: 'Intro', label_es: 'Intro', caption: 'Intro — A5 C5 A5 C5', caption_es: '…', fromBar: 1, bars: 4,
        notes: [ { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] }, … ] },  // a roots card: { string, fret, note, midi }
      …
    ],
    checks: [
      { label, label_es, text: 'Play the whole song with the band, intro to the end, without stopping.', text_es },
      { levelUp: true, text: 'Slide the speed to Normal and play the whole song with the band without stopping.', text_es }
    ]
  },
  steps: [],
}
```

**Direction lines:**
- `ca-30` (and `ca-29`, `ca-31`–`ca-33`, word for word): "Play the whole song in power chords: the same roots, with
  two more strings added." / "Toca la canción completa con acordes de potencia: las mismas raíces, con dos cuerdas
  más."
- `ca-24`: "Play the whole of "the cure" with the band, start to finish." / "Toca "the cure" completa con la banda,
  de principio a fin."
- `ca-28`: "Play the root of every chord with the band, start to finish." / "Toca la raíz de cada acorde con la
  banda, de principio a fin."

Pattern: "Play the whole song …, start to finish". The two checks are the same two lines on all 11 cards of this
shape; no tap dots.

**Ask Jonathan:** which Core song and which layer. All five songs with a card already have both layers (`ca-24`–`ca-28`
roots, `ca-29`–`ca-33` power). Chords, keys and section bars: skill `song-facts` ("Don't re-flag settled facts").

**Traps:**
- "A whole-song card has exactly two checks" and its Level up names no other page and renders no Journey button
  (`guide/practice-cards.md`; 1bn).
- A power chord is `{ frets, note, midi }`; `caChordProblems()` recomputes every pitch and requires a root-plus-5th
  pair named for its root (`guide/practice-cards.md` "A card note may be a chord").
- `chordGrid` is opt-in per card and **1bv** pins the list: "Turning a card on or off means editing its pinned list"
  (`guide/practice-cards.md`). `everyStrum` (ca-29) changes the card's directions line (**1cc**).
- When two cards for one song pass, the newest (highest board `#N`) is the Play Along (`guide/songs-links.md` "Each Core song row
  links its whole-song practice card").
- A `teacherOnly` card (ca-40) carries no `journey` / `journeyLayer` (**1bn**).
- A second recording (`recordingVersions`, ca-26 / ca-29 / ca-40) is its own track, bars and form; **1cc** pins "3
  cards / 1 group" (`guide/practice-cards.md` "Recording versions").
- `otherViews` (Chords / Tab / Lyrics) is filled by reference at the end of the file, never typed on the card (the
  CARD VIEWS note); **1er**.

**Tools:** `node tools/playalong-loop.mjs --only <id> --shots <dir>`.
