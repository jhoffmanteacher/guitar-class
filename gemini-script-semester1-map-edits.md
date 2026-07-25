# Gemini script — Semester 1 Map edits (2026-07-25)

Target doc: **0. Beginning Guitar Semester 1 Map**
Source of the changes: `module-4.js` Set m4w1, `module-5.js` Set m5w3

Both FIND strings below are unique in the document, so there is nothing for
Gemini to guess at.

---

## Paste this into the Gemini side panel with the Map open

```
You are making two small, surgical edits to this document. Do not
rewrite, reformat, restructure, or "improve" anything else. Do not
touch table layout, bold/italic markup, or any other row or cell.
Make ONLY these two replacements, exactly as written.

EDIT 1 — Unit 4 (Major / Minor / Blues Pentatonic Scales),
row "Weeks 8–9 (E & A only)", last column ("Skills Check"),
final bullet.

FIND this text:
Solos over a backing track on E & A

REPLACE it with:
Improvises 4 bars over a backing track on E & A

EDIT 2 — Unit 5 (Open Chords), row "Week 16 / Group 2: D A Em Bm",
last column ("Skills Check"), first bullet.

FIND this text:
Frets D, A, Em, Bm with clean tone

REPLACE it with:
Frets D, A, and Bm with clean tone; Em reviewed from Week 13

Leave the rest of that Week 16 cell unchanged — in particular keep
"Switches D↔A and Em↔Bm in time" exactly as it is.

When you are done, quote back to me the two edited bullets in full
so I can confirm nothing else changed.
```

---

## Why each edit

### Edit 1 — Unit 4, Weeks 8–9 Skills Check

The doc was **not** wrong about the bar count. Unit 4 already reads 4-bar
throughout:

- Weeks 10–12 Skill Focus — "compose an original 4-bar solo"
- Weeks 10–12 Skills Check — "Composes and plays an original 4-bar solo"
- ASSESSMENT — UNIT 4, Task 1 — "Perform an original 4-bar solo"
- ASSESSMENT — UNIT 4, Accuracy — "keeps its 4-bar form"

The 2-bar / 4-bar contradiction lives entirely inside `module-4.js`. The only
Unit 4 cell touching Set m4w1 was the Weeks 8–9 Skills Check, which said
"Solos over a backing track on E & A" with no bar count at all. This edit pins
the number down so the doc states it rather than implying it.

### Edit 2 — Unit 5, Week 16 Skills Check

The doc already half-agrees that Em is review, not new material:

- Week 13 Skill Focus — "First open chords: Am, Em"
- Week 13 Skills Check — "Frets Am and Em cleanly"
- Week 16 Skill Focus — "D major (triangular 3-finger); A major; **Em review**;
  Bm (partial barre / simplified xx4432)"

Only the Week 16 Skills Check bullet still listed Em as freshly assessed. The
replacement drops Em from the assessed list while keeping the pointer back to
Week 13, so nobody reads it as having vanished.

**Deliberately left alone in Week 16:**

- the row header "Group 2: D A Em Bm" — Em genuinely belongs to the chord group
- "Switches D↔A and Em↔Bm in time" — matches the actual cross-group challenges
  at `module-5.js` lines 896–897

---

## Companion repo edits (not covered by the script above)

The Gemini script only touches the Google Doc. These still need doing in the
repo:

### `module-4.js` — Set m4w1

| Line | Current | Change to |
|---|---|---|
| 426 | `assessment.goal` — "Improvises a **2-bar** phrase over a backing track" | "Improvises a **4-bar** phrase over a backing track" |
| 428 | `assessment.performance` — "record yourself improvising 4 bars" | *no change — this one is already right* |
| 468–470 | skill `m4w1-s6` — "a short **2-bar** musical idea" | **judgment call — see below** |

Everything that actually drills it is written for 4 bars: line 236 ("4 bars over
the Am backing track"), lines 659–665 (2-bar call + 2-bar response = 4 bars),
line 999 ("Write a 4-bar solo").

**On `m4w1-s6`:** the 2-bar framing there reads like a deliberate stepping stone
rather than a typo. The Set 2 call-and-response is literally a 2-bar call plus a
2-bar response, so a 2-bar unit is a real building block in the sequence.
Leaving it at 2 bars is defensible. Only line 426 is unambiguously contradicting
itself against line 428.

If m4w1-s6 does change, the Spanish also needs updating — see
`claude/translations-review-final-2026-07-23.md`:

- `m4w1-s6 text` — "Improvisar una idea musical corta de 2 compases…"
- `m4w1-s6 gotItWhen` — "puedes tocar una frase de 2 compases…"

### `module-5.js` — Set m5w3

| Line | Current | Change to |
|---|---|---|
| 759 | objective — "I CAN fret D, A, **Em**, and Bm cleanly…" | "I CAN fret D, A, and Bm cleanly…" |
| 1015 | `assessment.goal` — "Frets D, A, **Em**, Bm with clean tone…" | "Frets D, A, and Bm with clean tone…" |
| 1429 | `MODULE_REVIEWS` entry `mr5-s4` — "I can fret Group 2 chords (D, A, **Em**, and a partial-barre Bm)…" | "I can fret Group 2 chords (D, A, and a partial-barre Bm)…" |

Em was already taught and assessed in Set m5w1 (lines 244–245, `assessment.goal`
explicitly lists "Frets Em cleanly"). Set 3's actual challenges (lines 896–897)
only drill D↔A and Em↔Bm as cross-group pairs — there is no standalone "fret Em"
challenge in this Set, and Em is not in Set 3's own skills list except
incidentally.

---

## Verification

After Gemini reports back, confirm:

1. Weeks 8–9 Skills Check reads "Improvises 4 bars over a backing track on E & A"
2. Week 16 Skills Check bullet 1 reads "Frets D, A, and Bm with clean tone;
   Em reviewed from Week 13"
3. Week 16 bullet 2 still reads "Switches D↔A and Em↔Bm in time"
4. Nothing changed in Unit 1, 2, 3, or the Appendix / rubric half of the doc

Gemini in Docs can be loose with exact find-and-replace. If it paraphrases or
touches a neighbouring cell, undo and apply the two edits by hand — they are one
line each.
