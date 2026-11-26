## 6. Tab ladder

**For:** a tune, a TAB-reading line or a set of chords, one tab per step, ending on the whole thing. Focus view (one
step at a time).

**Skeleton** (from `ca-1`):
```js
{
  id: 'ca-55', view: 'focus',
  title: 'Playing Happy Birthday — The Whole Song', title_es: '…',
  intro: 'Play all four lines on the low E string: …', intro_es: '…',
  // metronome: 60,                    // optional: opening the card starts Metro (ca-21)
  steps: [
    { label: 'Lines 1 and 2', label_es: 'Líneas 1 y 2',
      text: 'Play Line 1 into Line 2 four times without stopping.', text_es: '…',   // the count makes 4 dots
      tab: { caption: '…', caption_es: '…',
             phrases: [ { label, label_es, notes: [ { string: 'E', fret: 0, note: 'E', midi: 40, beats: 0.5 }, … ] } ] } },
    …                                  // each later step: its own tab (notes or phrases)
    { label: 'The whole song', …, text: 'Play the whole song without stopping and raise the BPM by 10 three times.',
      tab: { …, linesPerPage: … } }
  ],
}
```
Variants in the file: `ca-21` (`metronome: 60`, `hideNames` and `controlsBelow` on every tab, "Learn — " / "Practice — "
labels); `ca-34`, a chords ladder (`chordVersions`, `chordStart`, a `_power` twin on intro and captions, two steps with
a `snippet` of the band).

**Direction lines:**
- `ca-1`: "Play Line 1 into Line 2 four times without stopping." / "Toca de la Línea 1 a la Línea 2, cuatro veces
  seguidas, sin detenerte." (4 dots)
- `ca-8`: "Land on fret 5 of the low E string just behind the fret, ringing clean, three times in a row." / "Cae en
  el traste 5 de la cuerda Mi grave justo detrás del traste, limpio, tres veces seguidas." (3 dots)
- `ca-34`: "Pick the A chord one string at a time, A string to high e, all ringing, three times in a row." / "Toca el
  acorde A cuerda por cuerda, de la cuerda La a la mi aguda, sin zumbido, tres veces seguidas." (3 dots)

Pattern: "Play <the line> <how> <count> times / in a row", one count per line.

**Ask Jonathan:** the tune or chords and the string(s); the BPM range; whether the last step is "keep going" with
the Metro tool.

**Traps:**
- Long tabs page two rows at a time; `revealDelay` drops Play tab, so keep it off a tab whose Play is the answer key
  (`guide/directions.md` "Four steps, two lines a page").
- A step `snippet` is the same bars the tab shows ("an eight-bar tab wants an eight-bar window", the schema's snippet
  note); **1ak** checks the window. An earlier listen-along goes on a snippet, never the Journey page (`guide/directions.md`).
- `chordVersions`: **1d** checks the shapes and the `_power` / `_power_es` pairs.

**Tools:** the common ones. `node tools/focus-tap-diff.mjs` walks "every Focus activity" in the real data (its
header), so it also covers a new one.
