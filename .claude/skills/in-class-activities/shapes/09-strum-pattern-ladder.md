## 9. Strum-pattern ladder

**For:** one strum pattern: hear it, play it on muted strings, then through a song's chords with the pattern never
stopping. Optional `paths` give a second way in (`ca-46`: "The whole pattern" / "In chunks").

**Skeleton** (from `ca-53`):
```js
{
  id: 'ca-55', view: 'focus',
  title: 'Strum Pattern — The Chorus', title_es: 'Patrón de rasgueo — El coro',
  intro: 'Learn the chorus strum pattern of "Sweet Child O\' Mine", then play it through the chorus chords.', intro_es: '…',
  steps: [
    { label: 'Practice — Muted strings', label_es: 'Practica — Cuerdas apagadas',
      text: 'Press ▶ to hear the pattern, then mute the strings and strum it 8 times in a row without stopping.', text_es: '…',
      strum: { caption: 'Muted strings · count "1 and 2 and 3 and 4 and" (the + is "and")', caption_es: '…',
               pattern: 'D..U..DU',    // per song: 8 eighths, D / U / . (miss) / - (stop)
               chords: { A5: { frets: [['A', 0], ['D', 2], ['G', 2]], midi: [45, 52, 57] } },
               bars: ['A5', 'A5', 'A5', 'A5'], barsPerRow: 4, bpm: 85, hideNames: true } },
    { label: 'Practice — A5, C5, D5', …,
      text: 'Play all eight bars 4 times through, changing chord on the 1, the pattern never stopping.', text_es: '…',
      strum: { …, chords: { A5, C5, D5 }, bars: ['A5', 'C5', 'D5', 'D5', 'A5', 'C5', 'D5', 'D5'], barsPerRow: 4, bpm: 85 } }
  ],
}
// ca-46 adds: paths: [{ key, label, label_es, blurb, blurb_es }, …], `path: '<key>'` on each path's steps,
// untagged shared steps after them, and a last step with a `video`.
```

**Direction lines:**
- `ca-53`: "Play all eight bars 4 times through, changing chord on the 1, the pattern never stopping." / "Toca los
  ocho compases 4 veces completos, cambiando de acorde en el 1, sin detener el patrón." (4 dots)
- `ca-46`: "Add a down on 4 and play it 4 times in a row, your hand never stopping." / "Agrega un abajo en el 4 y
  tócalo 4 veces seguidas sin detener la mano." (4 dots)
- `ca-46`: "Mute the strings and strum the pattern 8 times in a row without stopping." / "Apoya la mano de trastear
  sobre las cuerdas y rasguea el patrón 8 veces seguidas sin detenerte." (no dots: 8 is above 5)

**Ask Jonathan:** the pattern from his slides ("THE PATTERN is Jonathan's, typed by him", the comment above `ca-53`);
the chords and bars (a Core song's from skill `song-facts`); the opening BPM; one path or two.

**Traps:**
- **1d** recomputes every chord's midi from its frets, validates `paths` / `path` and pins both renderers; **1am** /
  **1bb** size a paths activity by its longest route (`guide/board-renderers-drills.md` "Paths").
- A video: "never invent YouTube IDs; `WebSearch` + oEmbed verify, else drop"; check the watch range (CLAUDE.md
  "Videos"). `ca-53` has none: "no watch range checked for the chorus".
- The mic check is NOT a field to copy here: **1eh** pins `listen` to `ca-52` alone (shape 10).

**Tools:** the common ones; `tools/smoke.mjs` `pathsWalk` clicks through the paths activity (`guide/board-renderers-drills.md`), on GitHub
after the push.
