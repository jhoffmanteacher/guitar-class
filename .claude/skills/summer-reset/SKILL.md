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
   full, 1ap fails every leftover key as "pinned keyed MC no longer exists."
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
the keyed MCs below, which store the choice text and are genuinely frozen.

**Reword next summer, when progress resets for the new year.** These three
keyed Module 1 Set 2 cards are frozen mid-year only because students have
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

**`m2w2`'s visible Mystery TAB label, "Challenge — Mystery TAB, a second
sight-read" → "Challenge — Mystery TAB (read it before you hear it)"**
(2026-10-25 audit). The first Mystery TAB sits in the switched-off Take It
to a Song section, so students only ever see the "second" one
(`m2w2·c·sec1·step5`). Its tab caption's "2" came off on 2026-10-25; the
label is frozen by index. ES: "Reto — TAB misterioso (léelo antes de
escucharlo)".

**Two keyed-MC choice wordings found by the 2026-09-25 sweep.** Module 2's
"the TOP line represents which string?" keys "The high E (thinnest) string" —
the site's convention is "high e". Module 1's "which comes right after G?"
mixes note letters and "mi aguda" in its `choices_es`. Both are keyed
choices in frozen modules (1ap), so they wait for the reset.

**Module 3 Set 2's Challenge numbers** (2026-10-16 clean-up). The labels
run "Challenge 1", then six unnumbered "Challenge —" cards, then
"Challenge 2 / 3 / 4", then two more unnumbered ones. Step labels are
frozen by index in Modules 1–3 (they are how the proof sees an insertion),
so at the reset either number every Challenge in order or drop the numbers
from all of them — the step circle already numbers each card. Set 1's
"One shape, three chords" label can become "Watch: what a power chord is"
in the same edit, since that card now opens with the video.
Same edit: drop "(optional)" / "(opcional)" from "Challenge 4 — Octave
Add-On (optional)" (`m3w2·c·sec4·step0`). The three-note power chord stopped
being optional on 2026-10-21 (section title, step text, hint and skill
`m3w2-s5` were reworded then), but the label is frozen by index.

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

**Split Module 4 Set 2 (`m4w2`) into two sets.** 20 visible steps, about
1,075 words on the cards after the 2026-10-16 trim. It shows as Part 1 / Part
2 today (`partOne` / `partBreak`, display only). A real split moves Part 2's
progress keys to a new set id, which mid-year would need a one-time progress
move like `swap45`, with the same stale-tab gap. Jonathan, 2026-10-16: keep
the parts until the reset. Splitting also changes the SET list and m4w2's
section count, so `rule-zero-proof.mjs` fails it by design. After the split,
drop the 1ao pin (sets with parts: 1 → 0) unless another set uses parts.

**Remove the Module 4/5 swap progress move (`swap45`).** The one-time move
of saved progress after the 2026-10-12 swap (app.js `swap45MapId` …
`swap45OnLoad`, the `await swap45Commit()` gate in `flushSave()`, the
display remap in teacher.js `teacherFetchStudents()`, and the `swap45` block
in `tabs/journey.js`). Once progress is reset nothing is in the old
numbering, so all four halves go together — removing only some of them
would let one writer save in a numbering another still reads differently.
Delete the `migrations` field from the reset docs, or leave it: nothing
else reads it.

**Delete the 29 "Take It to a Song" sections and their card code.**
Switched off 2026-10-18 (`TAKE_TO_SONG_ENABLED = false` in app.js): no module
ladder shows the Journey card (Modules 2–5) or the Challenge steps (Modules
6–12) any more, but the sections are still in the module files because the
section list is fixed in every rule-zero regime and each one counts toward its
neighbours' `gi`. Removing them re-keys every section after them, so it is
reset-only, and `rule-zero-proof.mjs` will fail it by design. With them go
`journeyLinkCardHtml()`, `journeySongsFor()`, the `jl-song-btn` rules that only the card used (the activity cards share `.jl-song-btn`, so check first), the
`journey.takeItTitle`/`takeItSub` i18n keys, the `KIND_TITLE_COUNTS`
take-to-song pin (29 → 0), and the take-to-song branches of 1af / 1ao / 1w-t
(`readTakeToSongSwitch`). **Decide first where the seven skills that lost their
only teaching step belong** (m9w1-s5, m9w2-s5, m10w1-s4, m10w3-s6, m11w3-s6,
m12w1-s6, m12w3-s6 — they are on the checklist with no "Show me where"); the
Challenge cards in those sections are the content to re-home, Module 12's
"Full-Verse Rehearsal (assessment preparation)" among them.
