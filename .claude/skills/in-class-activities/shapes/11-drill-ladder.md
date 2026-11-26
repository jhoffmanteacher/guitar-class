## 11. Drill ladder

**For:** four steps of one on-screen drill, easy to hard; each step is a label and a drill, no text: "the widget
carries its own directions and pass line" (the comment above `ca-48`).

**Skeleton** (from `ca-23`):
```js
{
  id: 'ca-55', view: 'focus',
  title: 'Low E and A Notes in Time', title_es: '…',
  intro: 'Play each note as its name comes up, then turn off Show answer and pass Level 3.', intro_es: '…',   // ca-48/49/50 have none
  steps: [
    { label: 'Practice — Frets 0 to 5', label_es: 'Practica — Trastes 0 a 5',
      drill: { type: 'notecall', strings: ['lowE', 'A'], minFret: 0, maxFret: 5 } },   // per step: the range
    …                                  // 5 to 8, 8 to 12, the whole neck
  ],
}
```

| Drill | Data | Cards | Its direction line (i18n.js, shown before Start) |
|---|---|---|---|
| Note Call | `{ type: 'notecall', strings, minFret, maxFret }` | `ca-23` (4 steps), `ca-49` step 1 with `board: 'all'` | `nc.intro` "Play each note as its name comes up, then tap its fret on the board." / "Toca cada nota cuando aparece su nombre y después toca su traste en el diagrama." |
| Note Call, power chords | the same with `power: true` | `ca-43` | `ncp.intro` "Play each power chord as its name comes up, then tap its root fret on the board." / "Toca cada acorde de potencia cuando aparece su nombre y después toca el traste de su raíz en el mástil." |
| Call the chord | `{ type: 'chordcall', card: 'ca-29', section: 'Verse 1', mode: 'follow' \| 'call' }` | `ca-48`, `ca-50` | `chc.introFollow` "Tap the next chord, or press the space bar, in the last beat before the band changes to it." / "Toca el siguiente acorde o presiona la barra espaciadora en el último tiempo antes de que la banda cambie." |
| Name the power chord | `{ type: 'pcname', mode: 'name' \| 'fret' \| 'both', minFret, maxFret }` | `ca-49` steps 2–4 | `pwn.introName` "Pick the name of the power chord whose root is the dot with the ?." / "Elige el nombre del acorde de potencia cuya raíz es el punto con el ?." |

Activity intros: `ca-23` "Play each note as its name comes up, then turn off Show answer and pass Level 3." / "Toca
cada nota cuando aparece su nombre y luego apaga «Mostrar la respuesta» y pasa el Nivel 3."; `ca-43` "Play each power
chord as its name comes up, then turn off Show answer and pass Level 3." / "Toca cada acorde de potencia cuando
aparece; luego apaga «Mostrar la respuesta» y pasa el Nivel 3." No step text, so no tap dots.

**Ask Jonathan:** the drill, the strings and the fret range of each step; for Call the chord, which play-along card
and section ("Sweet Child's Call step uses the Intro, not the Verse: the verse is only 7 changes in two laps, the intro
is the same D5 C5 G5 chords in 10, which is what "8 of 10" needs", the comment above `ca-48`).

**Traps:**
- `chordcall` reads the named card's own sections, "so a change to the card's chords or bars moves the drill too"
  (the same comment); the `section` is a label of that card.
- `pcname`: "a step's `maxFret` is 10 at most so the shape fits"; `board: 'all'` is ca-49 step 1 only, "pinned by 1co"
  (`guide/board-renderers-drills.md` "Step drills replace paper").
- The drill lines are i18n strings held by **1cs** (`CAP_2C = 110`, `DRILL_DIRECTION_KEYS`); a new drill type is a
  new widget (code), not a copy.

**Tools:** the common ones; `node tools/focus-tap-diff.mjs` covers every Focus activity.
