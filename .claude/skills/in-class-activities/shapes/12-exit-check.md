## 12. Exit check

**For:** the end-of-period product: five auto-graded questions, one try (`guide/exit-checks.md` "Exit checks"); about one a week.

**Skeleton** (from `ca-15`; `ca-14` for `nextNote`):
```js
{
  id: 'ca-55', kind: 'check',          // "no `number`, no `steps`" (the file's EXIT CHECKS note)
  title: 'Notes on the Low E String', title_es: 'Notas en la cuerda Mi grave',
  intro: '…', intro_es: '…',
  check: {
    type: 'noteName', string: 'lowE',  // per check
    items: [ { fret: 3, answer: 'G' }, { fret: 8, answer: 'C' }, … ]   // five; no choices: A–G in order
  },
}
// nextNote (ca-14): bpm: 80, items: [ { label, label_es, notes: [ … ], answer: { string, fret, note, midi },
//                                       choices: [ { fret, note }, … ] } ]   // >= 3 choices, exactly one right
```

**Direction lines:** the two existing intros predate the one-line rule and stay as they are: "Exit checks (ca-14,
ca-15) stay frozen" (CLAUDE.md), and **1cs** does not read `kind: 'check'` ("Exit checks … are frozen and not read").
`ca-15`: "One fret lights up on the low E string. Press "Play the note" to hear it, then tap the name of the note.
Five questions, one try — use the dots on the neck to find your place." / "Un traste se ilumina en la cuerda Mi grave.
Pulsa «Tocar la nota» para escucharlo, y después toca el nombre de la nota. Cinco preguntas, un solo intento — usa
los puntos del mástil para ubicarte." Ask Jonathan whether a new check's intro
follows the one-line rule.

**Ask Jonathan:** the type, the string or tune, the five items, and `retake: true` or one try.

**Traps:**
- "Stored exit-check picks are POSITIONAL": once students have taken it, its `items` are frozen (`guide/exit-checks.md`).
- **1y** recomputes every answer key from the fretboard.
- A check takes no `#N`, is never pinnable, and "the student sees "Exit check · <title>"", so the title carries no
  prefix (the file's EXIT CHECKS note).
- The student card and the console preview share `caCheckBodyHtml()` on purpose: don't fork it.

**Tools:** the common ones.
