## Exit checks — the end-of-period product

An exit check is a class activity with `kind: 'check'` (schema at the top of
`class-activities.js`).
- Five auto-graded questions, one try. Two item types: `nextNote` and `noteName`.
- The result goes to `progress/{uid}.exitChecks[id]` plus `classActivities[id] = true`.
  No `firestore.rules` change was needed: the teacher already reads the progress doc whole.
- Engine: the `ec*` functions in `app/activities-2.js`.
- The student card and the console preview share `caCheckBodyHtml()` **on
  purpose** — don't fork it.
- Console: turned-in count and average in the Activities table; a
  per-student, per-question grid and a "Missed by" row on the detail page.
- checks.mjs **1y** guards the data (`1x` is the orphaned-assets check). It
  recomputes every answer key from the fretboard: a wrong `answer` doesn't look
  broken, it just marks a correct student wrong.
- Checks take no `#N`: `caBoardOrder()` skips them when it hands out 1..N;
  the board shows "Check" in the `#` box.
- Pace: about one check per week (Jonathan, 2026-09-09).

**Post one with its own link:** `#class-activities/<id>` opens the Class
activities page with that card expanded and scrolled to (`caFocusActivity()` in
`app/activities.js`); the console has a **Copy link** button per row. The hash router splits on `/`
(`exploreHashBase` / `exploreHashTail`): a new deep link takes that shape, not
a query param. An unpublished id gets `ca.linkMissing` above the archive.

Easy to break without noticing:

- **Stored exit-check picks are POSITIONAL — editing a shipped check's
  `items` silently re-grades every result.** `res.picks` is indexed by item
  position, and `ecGrade()` re-grades it against whatever `items` says now. An
  inserted, removed or reordered item leaves the stored `score` (which the
  console prints) beside per-question cells for different questions. 1y passes
  straight through this. Edit a check before students reach it, or treat its
  `items` as frozen once they have.
- **Seed the MC shuffle on language-stable data.** `ecChoicesHtml` seeds on
  the `fret·note` pairs, never the rendered chip labels ("fret 5 · A" and
  "traste 5 · A" would deal a different order per language).
- **The `noteName` board is drawn with `theme:'web'` plus the dark-mode
  invert**, not on CSS variables: its fretted-note circle is a hardcoded light
  green, so a variable-themed `?` would be light-on-light in dark mode.
