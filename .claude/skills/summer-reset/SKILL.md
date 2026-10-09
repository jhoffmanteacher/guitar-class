---
name: summer-reset
description: The guitar site's Summer reset list: fixes blocked by frozen modules (FROZEN_THROUGH / FROZEN_MC_THROUGH_MODULE), how to unlock at the yearly progress reset, and next-year timed changes. Read when a fix is blocked by a frozen module (to add it here), when planning the summer reset, or before flagging a known frozen-module defect.
---

## Summer reset list
Every fix below is blocked only because the module it touches is frozen (see
"Three regimes," above) — not because it's a bad idea. **Any fix blocked by a
frozen module gets added here the same day**, not left in a session
scratchpad or a PR that never merges.

**How to unlock at the reset:**
1. Set `FROZEN_THROUGH` in `tools/rule-zero-proof.mjs` to 0.
2. Set `FROZEN_MC_THROUGH_MODULE` in `tools/checks.mjs` to 0, **and empty
   `FROZEN_MC_FINGERPRINTS`** — with the constant at 0 but the table still
   full, 1ap fails every leftover key as "pinned graded MC no longer exists."
3. Make the fixes below.
4. Raise both numbers again as the new class advances, pasting the newly
   printed fingerprints back into `FROZEN_MC_FINGERPRINTS` each time.

**Raising `FROZEN_THROUGH` or `FROZEN_MC_THROUGH_MODULE` never unlocks
anything — it only freezes more modules.** A comment or plan that says "do
this once FROZEN_THROUGH is raised" is wrong; the only unlock is the reset
above.

**Practice-panel MCs are not on this list because they don't need to be.** A
skill's practice MC stores the choice INDEX, not its text, so its wording may
change any time — even in Modules 1–2. Only the choice ORDER is locked (see
"Quiz answers are shuffled at render time," below). Don't confuse these with
the graded MCs below, which store the choice text and are genuinely frozen.

**Reword next summer, when progress resets for the new year.** These three
graded Module 1 Set 2 cards are frozen mid-year only because students have
already answered them; each has throwaway distractors worth replacing:
- "Which of these is NOT a part of the guitar?" → "Hinge"
- "If a string's pitch is too LOW…" → **two** dead choices, "Take the string
  off and put it back on" AND "It doesn't matter which way" (the second is
  carried in checks.mjs `MC_CATCHALL_ALLOW`, so 1au does not fail the push on
  it — clear the allowlist entry in the same edit)
- "The needle is to the RIGHT of center…" → "The tuner is broken — restart it"

The same card's read-the-tuner twin (`w2·b·sec0·step4`) is in
`MC_LEAK_ALLOW` for 1av: its keyed answer repeats the step's own text, which
is fine while the card's job is to check that you read the card, but worth
re-deciding when the rest is reworded.

**`m2w2·c`'s "Read TAB & play a 4-bar melody" section title.** The "Mary Had a
Little Lamb" warm-up TAB it heads is seven one-beat notes — even with the
last one now held two beats (2026-09-20, so the line at least fills whole
bars) that's 2 bars, not 4. `rule-zero-proof.mjs` fails the push on ANY
section retitle in Modules 1–2 (`section retitled in a module students are
in`), so the title stays wrong until the reset; the skill checklist and
Module Review line for it were reverted to match "4-bar" for the same reason,
rather than say something the section heading doesn't.

**`ca-14` (the Happy Birthday exit check, frozen `items`).** Its stimuli play
the tune in even notes although the activities that teach it now teach the
real rhythm, and items 1 and 3 play the same four notes, differing only by
their "Line 1" / "Line 2" label (2026-09-20 second-pass sweep). `items` is
positional and frozen once students have taken the check — see the exit-check
rules below — so nothing changes here until progress resets.

**`m2w2` Challenge 3's label, "(your low-E assessment piece)" → "(assessment
preparation)".** The rest of the site already uses "(assessment
preparation)" (see "Challenge cards," below) — this is the one graded card
Decision 1's retitle couldn't reach, because Module 2 is frozen and a step
`label` must match its base commit byte-for-byte by index. In the same edit:
remove the `module-2.js` / `'assessment piece'` entry from
`TEACHER_PHRASE_ALLOW` in checks.mjs, and reword the hidden twin at
`module-2.js`'s Seven Nation Army Challenge — "(your A-string assessment
piece)" — so the phrase is gone from the file, not just unflagged.

**Two graded-MC choice wordings found by the 2026-09-25 sweep.** Module 2's
"the TOP line represents which string?" keys "The high E (thinnest) string" —
the site's convention is "high e". Module 1's "which comes right after G?"
mixes note letters and "mi aguda" in its `choices_es`. Both are graded
choices in frozen modules (1ap), so they wait for the reset.

**Found by the 2026-10-06 audit, all in frozen modules.** Module 3 `m3w2-s4`
practice MC prompt says "SAME fret", which gives away the one choice that
repeats a fret number. Module 3 Module Review assess item says "Sweet Child's
D5-C5-G5 … switches between E- and A-string roots on the same fret" — only
C5→G5 does (D5 is A-string fret 5). Module 2 `m2w2-s5` "4-bar melody" gotItWhen
also accepts "Smoke on the Water", which is 3 bars at one note per beat
(Mary Had a Little Lamb is already listed above).

**Module 1 Set 2 reorder: string names and guitar parts before tuning.** The
tuning video (step 1) depends on string names (step 7) and tuning pegs (step
2), the two tuning cards sit apart at steps 5–6, and the set opens with
~1,000 words before the first guitar-in-hands challenge (step 10 of 13).
This crosses a section boundary (string names is `b·sec1`, tuning is
`b·sec0`), so `rule-zero-proof.mjs`'s "sections are fixed in every regime"
rule fails it even after the reset — expected, since there's no student
progress left to protect by then, but don't read that failure as a new bug.
Moves progress keys, so reset-only regardless.

### Also for the summer (not locked, timed for next year)
**Move the Finger Gym Reach up to 5th/7th position.** Today it stretches from
fret 1 to fret 5/6 at the nut (`ca-2` "The Reach," `ca-6` "The wide Reach") —
around day 3 of the course — but the riff it prepares for spans frets 7–10.
Not frozen by any regime; timed for next year because it needs six new
figures (both Reach cards, both fret positions, EN and ES captions) that
aren't worth rushing mid-year for two cards nobody has failed on.
