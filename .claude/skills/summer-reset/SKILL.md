---
name: summer-reset
description: The guitar site's Summer reset list: fixes blocked by frozen modules (FROZEN_THROUGH / FROZEN_MC_THROUGH_MODULE), how to unlock at the yearly progress reset, and next-year timed changes. Read when a fix is blocked by a frozen module (to add it here), when planning the summer reset, or before flagging a known frozen-module defect.
---

## Summer reset list
Every fix below is blocked only because the module it touches is frozen (see
"Three regimes decide what may change in a module" in CLAUDE.md). **Add any fix
blocked by a frozen module here the same day**, not to a session scratchpad or
a PR that never merges.

**How to unlock at the reset:**
1. Set `FROZEN_THROUGH` in `tools/rule-zero-proof.mjs` to 0.
2. Set `FROZEN_MC_THROUGH_MODULE` in `tools/checks.mjs` to 0, **and empty
   `FROZEN_MC_FINGERPRINTS`** — with the constant at 0 but the table still
   full, 1ap fails every leftover key as "pinned keyed MC no longer exists."
3. Make the fixes below.
4. Raise both numbers again as the new class advances, pasting the newly
   printed fingerprints back into `FROZEN_MC_FINGERPRINTS` each time.

**Raising `FROZEN_THROUGH` or `FROZEN_MC_THROUGH_MODULE` never unlocks
anything; it only freezes more modules.** A comment or plan that says "do
this once FROZEN_THROUGH is raised" is wrong. The only unlock is the reset
above.

**Practice-panel MCs don't need to be on this list**: they store the choice
INDEX, so only the ORDER is locked (the "Keyed MCs" bullet under "Content
rules" in CLAUDE.md).

**Reword next summer.** These three keyed Module 1 Set 2 cards have throwaway
distractors worth replacing:
- "Which of these is NOT a part of the guitar?" → "Hinge"
- "If a string's pitch is too LOW…" → **two** dead choices, "Take the string
  off and put it back on" AND "It doesn't matter which way" (the second is
  carried in checks.mjs `MC_CATCHALL_ALLOW`, so 1au does not fail the push on
  it; clear the allowlist entry in the same edit)
- "The needle is to the RIGHT of center…" → "The tuner is broken — restart it"

The same card's read-the-tuner twin (`w2·b·sec0·step4`) is in
`MC_LEAK_ALLOW` for 1av (its keyed answer repeats the step's own text);
re-decide it when the rest is reworded.

**`ca-14` (the Happy Birthday exit check, frozen `items`).** Two defects:
- Its stimuli play the tune in even notes, not the real rhythm the activities
  teach.
- Items 1 and 3 play the same four notes, differing only by their "Line 1" /
  "Line 2" label.

`items` is positional and frozen once students have taken the check (the
"Stored exit-check picks are POSITIONAL" bullet under "Exit checks — the
end-of-period product" in skill `in-class-activities`).

**`m2w2` Challenge 3's label, "(your low-E assessment piece)" → "(assessment
preparation)".** That is the site's wording everywhere else ("No teacher speak"
and "Challenge cards" in CLAUDE.md); this `label` is frozen by index, so it waits
for the reset. In the same edit:
- remove the `module-2.js` / `'assessment piece'` entry from
  `TEACHER_PHRASE_ALLOW` in checks.mjs;
- reword the hidden twin at `module-2.js`'s Seven Nation Army Challenge,
  "(your A-string assessment piece)", so the phrase is gone from the file.

**`m2w2`'s visible Mystery TAB label, "Challenge — Mystery TAB, a second
sight-read" → "Challenge — Mystery TAB (read it before you hear it)"**.
Students only ever see this "second" one (`m2w2·c·sec1·step5`): the first sits
in the switched-off Take It to a Song section. ES: "Reto — TAB misterioso (léelo antes de escucharlo)".

**Two keyed-MC choice wordings** (frozen by 1ap).
- Module 2's "the TOP line represents which string?" keys "The high E
  (thinnest) string"; the site's convention is "high e".
- Module 1's "which comes right after G?" mixes note letters and "mi aguda"
  in its `choices_es`.

**Module 3 Set 2's Challenge numbers.** The labels run "Challenge 1", then six
unnumbered "Challenge —" cards, then "Challenge 2 / 3 / 4", then two more
unnumbered ones. At the reset either number every Challenge in order or drop
the numbers from all of them; the step circle already numbers each card. In the
same edit:
- Set 1's "One shape, three chords" label can become "Watch: what a power
  chord is" (the card opens with the video).
- Drop "(optional)" / "(opcional)" from "Challenge 4 — Octave
  Add-On (optional)" (`m3w2·c·sec4·step0`): the three-note power chord is no
  longer optional anywhere else (section title, step text, hint, skill
  `m3w2-s5`).

**Module 1 Set 2 reorder: string names and guitar parts before tuning.** The
tuning video (step 1) needs string names (step 7) and tuning pegs (step 2), the
two tuning cards sit apart at steps 5–6, and ~1,000 words come before the first
guitar-in-hands challenge (step 10 of 13).
It crosses a section boundary (string names is `b·sec1`, tuning is `b·sec0`)
and moves progress keys, so it is reset-only, and `rule-zero-proof.mjs`'s
"sections are fixed in every regime" rule fails it even after the reset. That
is expected; don't read it as a new bug.

### Also for the summer (not locked, timed for next year)
**Move the Finger Gym Reach up to 5th/7th position.** Today it stretches from
fret 1 to fret 5/6 at the nut (`ca-2` "The Reach," `ca-6` "The wide Reach"),
but the riff it prepares for spans frets 7–10.
Not frozen; timed for next year because it needs six new figures (both Reach
cards, both fret positions, EN and ES captions).

**Split Module 4 Set 2 (`m4w2`) into two sets.** 20 visible steps, about
1,075 words on the cards. It shows as Part 1 / Part 2 today (`partOne` /
`partBreak`, display only). A real split moves Part 2's progress keys to a new
set id (mid-year that needs a one-time move like `swap45`). Jonathan,
2026-10-16: keep the parts until the reset. Splitting changes the SET list and
m4w2's section count, so `rule-zero-proof.mjs` fails it by design. After the split,
drop the 1ao pin (sets with parts: 1 → 0) unless another set uses parts.

**Remove the Module 4/5 swap progress move (`swap45`):** `app/save.js`
`swap45MapId` … `swap45OnLoad`, the `await swap45Commit()` gate in
`flushSave()`, the display remap in `teacher-core.js` `teacherFetchStudents()`, and
the `swap45` block in `tabs/journey.js`. All four halves go together: removing
only some lets one writer save in a numbering another still reads differently.
Delete the `migrations` field from the reset docs, or leave it: nothing else
reads it.

**Delete the 29 "Take It to a Song" sections and their card code.**
Switched off (`TAKE_TO_SONG_ENABLED = false` in `app/shell.js`), but still in the
module files because each one counts toward its neighbours' `gi`. Removing
them re-keys every section after them, so it is reset-only, and
`rule-zero-proof.mjs` will fail it by design. With them go
`journeyLinkCardHtml()`, `journeySongsFor()`, the `jl-song-btn` rules that
only the card used (the activity cards share `.jl-song-btn`, so check first),
the `journey.takeItTitle`/`takeItSub` i18n keys, the `KIND_TITLE_COUNTS`
take-to-song pin (29 → 0), and the take-to-song branches of 1af / 1ao / 1w-t
(`readTakeToSongSwitch`). **Decide first where the seven skills that lost their
only teaching step belong** (m9w1-s5, m9w2-s5, m10w1-s4, m10w3-s6, m11w3-s6,
m12w1-s6, m12w3-s6 — they are on the checklist with no "Show me where"); the
Challenge cards in those sections are the content to re-home, Module 12's
"Full-Verse Rehearsal (assessment preparation)" among them.
