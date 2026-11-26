## 7. Finger Gym circuit

**For:** a numbered fretting-hand workout: three or four events on tab with the fretting finger shown, then a circuit.

**Skeleton** (from `ca-2`):
```js
{
  id: 'ca-55', view: 'focus',
  title: 'Finger Gym 7', title_es: 'Gimnasio de Dedos 7',   // the next SERIES number, EN and ES
  intro: 'Train three events in the first five frets: …', intro_es: '…',
  steps: [
    { label: 'The Ladder', label_es: 'La Escalera',
      text: 'Play the Ladder at 50 BPM with no buzz, three times in a row.', text_es: '…',
      tab: { bpm: 50,                  // the slider opens on the step's own "at 50 BPM" (the ca-2 source)
             caption: '…', caption_es: '…',
             notes: [ { string: 'E', fret: 1, note: 'F', midi: 41, finger: 1 }, … ] } },   // finger 1–4
    …                                  // two or three more events
    { label: 'The circuit', label_es: 'El circuito',
      text: 'Play two clean sets in a row (each event 4 times), the second 10 BPM faster.', text_es: '…' }   // no tab
  ],
}
```

**Direction lines:**
- `ca-2`: "Play the Ladder at 50 BPM with no buzz, three times in a row." / "Toca la Escalera a 50 BPM sin zumbido,
  tres veces seguidas." (3 dots)
- `ca-3`: "Climb up and straight back down, the top note once, four times without stopping." / "Sube y baja de
  inmediato, la nota de arriba una sola vez, cuatro veces seguidas sin detenerte." (4 dots)
- `ca-2` circuit: "Play two clean sets in a row (each event 4 times), the second 10 BPM faster." / "Toca dos series
  limpias seguidas (cada evento 4 veces), la segunda 10 BPM más rápida." (2 dots: the LAST small number before the
  first keyword)

Pattern: "Play <event> at <BPM> with no buzz, <count> in a row"; the circuit "two clean sets in a row, the second 10
BPM faster".

**Ask Jonathan:** the events and positions (from his Finger Gym deck: the `finger` convention matches "the Finger Gym
teacher deck", schema note).

**Traps:**
- The title's digit is a series number: Gym 7 after Gym 6; inserting one mid-series retypes every later title AND
  any "same as Gym 1" cross-reference (**1l**; `guide/board-renderers-drills.md` "A number in an activity title is still a SERIES number").
- **1c** fails a `finger` outside 1–4. "Fingering rule: finger = fret within the hand position, a shift restarts at
  finger 1" (schema note).

**Tools:** the common ones.
