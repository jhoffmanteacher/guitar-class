---
name: summer-reset
description: The guitar site's Summer reset list: fixes blocked by frozen modules (FROZEN_THROUGH / FROZEN_MC_THROUGH_MODULE), how each one gets made (module progress never resets, so a one-time move of saved progress; activity work does reset each summer), and next-year timed changes. Read when a fix is blocked by a frozen module (to add it here), when planning the summer reset, or before flagging a known frozen-module defect.
---

## Summer reset list
Every fix below is blocked only because the module it touches is frozen (see
"Three regimes decide what may change in a module" in CLAUDE.md). **Add any fix
blocked by a frozen module here the same day**, not to a session scratchpad or
a PR that never merges.

**Module progress is never wiped.** Jonathan, 2026-11-13: "modules do not
reset for students unless i do it. everything else will reset"; "some students
may continue into future years". So every module progress key and keyed-MC
pick stays valid for good, and `checks.mjs` 1dl (rule-zero-proof against the
push's base) has no override. In-Class Activities and everything else
(practice minutes, games, recordings, live-game scores) do reset each summer.

**How a fix on this list gets made:**
- **A module fix** (a keyed MC's choices or English prompt, a moved, removed
  or relabelled frozen step, a section change) **waits.** `checks.mjs` 1dl has
  no override, and a refusal is never fixed by loosening a check. The only
  honest route is a one-time move of the saved progress it touches (the Modules
  4/5 swap, `swap45*` in `app/save.js`, is the model) that ships together with a
  declared map of old key → new key which `rule-zero-proof.mjs` verifies, the
  way it verifies `response.renamedChoices` for choices today: designed with
  Jonathan and reviewed deep (`site-reviewer-deep`). **That map mechanism does
  not exist yet**; it is built with the first such move. Until then the fix
  stays on this list.
- **A plain label fix in a frozen module moves no key at all**: a key is set
  id, station, section number and step number, never the label. It is blocked
  only because `rule-zero-proof.mjs` matches frozen step labels BY INDEX (that
  is how it sees an insertion). The same declared map, label → label, would make
  it safe: the proof would accept exactly the declared renames at the same index.
- **An activity-side fix blocked only by work students already took** (an exit
  check's positional `items`, like `ca-14` below) can wait for the summer
  reset, which clears that work.

**Raising `FROZEN_THROUGH` or `FROZEN_MC_THROUGH_MODULE` never unlocks
anything; it only freezes more modules.** A comment or plan that says "do
this once FROZEN_THROUGH is raised" is wrong. Never lower either: module
progress is never wiped, so no module becomes unfrozen.

**Practice-panel MCs don't need to be on this list**: they store the choice
INDEX, so only the ORDER is locked (the "Keyed MCs" bullet under "Content
rules" in CLAUDE.md).

**Reword (needs a one-time move).** These three keyed Module 1 Set 2 cards have throwaway
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
end-of-period product" in skill `in-class-activities`, `guide/exit-checks.md`).

**`m2w2` Challenge 3's label, "(your low-E assessment piece)" → "(assessment
preparation)".** That is the site's wording everywhere else ("No teacher speak"
and "Challenge cards" in CLAUDE.md); this `label` is frozen by index, so it waits
for a one-time move. In the same edit:
- remove the `module-2.js` / `'assessment piece'` entry from
  `TEACHER_PHRASE_ALLOW` in checks.mjs;
- reword the hidden twin at `module-2.js`'s Seven Nation Army Challenge,
  "(your A-string assessment piece)", so the phrase is gone from the file.

**`m2w2`'s visible Mystery TAB label, "Challenge — Mystery TAB, a second
sight-read" → "Challenge — Mystery TAB (read it before you hear it)"**.
Students only ever see this "second" one (`m2w2·c·sec1·step5`): the first sits
in the switched-off Take It to a Song section. ES: "Reto — TAB misterioso (léelo antes de escucharlo)".

**`w1`'s goal step label, "Write your guitar goal" → "Say your guitar goal"**
(2026-11-25). Typed answers are switched off (`TYPED_RESPONSES_ENABLED`,
`app/lesson.js`) and the step's text now says "Say your guitar goal out loud",
but its label (`w1·c·sec1·step0`) is frozen by index: `rule-zero-proof.mjs`
refused the rename on 2026-11-25. ES: "Escribe tu meta con la guitarra" → "Di tu
meta con la guitarra".

**Two keyed-MC choice wordings** (frozen by 1ap).
- Module 2's "the TOP line represents which string?" keys "The high E
  (thinnest) string"; the site's convention is "high e".
- Module 1's "which comes right after G?" mixes note letters and "mi aguda"
  in its `choices_es`.

**Module 3 Set 2's Challenge numbers.** The labels run "Challenge 1", then six
unnumbered "Challenge —" cards, then "Challenge 2 / 3 / 4", then two more
unnumbered ones. With a one-time move, either number every Challenge in order or drop
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
and moves progress keys, so it needs a one-time move, and `rule-zero-proof.mjs`'s
"sections are fixed in every regime" rule (checks.mjs 1dl) refuses it until that
move is designed with Jonathan. That is expected; don't read it as a new bug.

### Also for the summer (not locked, timed for next year)
**Move the Finger Gym Reach up to 5th/7th position.** Today it stretches from
fret 1 to fret 5/6 at the nut (`ca-2` "The Reach," `ca-6` "The wide Reach"),
but the riff it prepares for spans frets 7–10.
Not frozen; timed for next year because it needs six new figures (both Reach
cards, both fret positions, EN and ES captions).

**Split Module 4 Set 2 (`m4w2`) into two sets.** 20 visible steps, about
1,075 words on the cards. It shows as Part 1 / Part 2 today (`partOne` /
`partBreak`, display only). A real split moves Part 2's progress keys to a new
set id, which needs a one-time move like `swap45` (module progress is never
wiped). Jonathan, 2026-10-16: keep the parts for now. Splitting changes the SET list and
m4w2's section count, so `rule-zero-proof.mjs` fails it by design. After the split,
drop the 1ao pin (sets with parts: 1 → 0) unless another set uses parts.

**Keep the Module 4/5 swap progress move (`swap45`)**: module progress is never
wiped (2026-11-13), so a student who has not signed in since the swap still needs
it. Remove it only with Jonathan, and then all four halves together: `app/save.js`
`swap45MapId` … `swap45OnLoad`, the `await swap45Commit()` gate in
`flushSave()`, the display remap in `teacher-core.js` `teacherFetchStudents()`, and
the `swap45` block in `tabs/journey.js`. All four halves go together: removing
only some lets one writer save in a numbering another still reads differently.
Keep the `migrations` field in progress docs: `swap45` reads it.

**Clear the Start over / Delete markers** (2026-11-14, `teacher-remove.js`):
`config/class.progressStartOver` and `config/class.progressDeleted` (uid → a
time). They stay all year: Manage reads them for its "Started over" /
"Deleted" lines, and a student's next sign-in applies a Start over once
(`progressStartOverAtSignIn`, `app/save.js`). Once every progress doc is reset,
delete both fields (through `teacherWriteConfig()`, or by hand in the Firebase
console with every console closed). The students' docs may keep a
`startOverApplied` time: harmless, a missing marker means nothing to apply.

**The 29 "Take It to a Song" sections stay.** Switched off
(`TAKE_TO_SONG_ENABLED = false` in `app/shell.js`), never deleted (CLAUDE.md
"Never"; checks.mjs 1do pins every step): each one counts toward its
neighbours' `gi`, and module progress is never wiped. Deleting them would need
a one-time move of every later section's keys, designed with Jonathan. If he
ever asks for that, with them go
`journeyLinkCardHtml()`, `journeySongsFor()`, the `jl-song-btn` rules that
only the card used (the activity cards share `.jl-song-btn`, so check first),
the `journey.takeItTitle`/`takeItSub` i18n keys, the `KIND_TITLE_COUNTS`
take-to-song pin (29 → 0), and the take-to-song branches of 1af / 1ao / 1w-t
(`readTakeToSongSwitch`). **Decide first where the seven skills that lost their
only teaching step belong** (m9w1-s5, m9w2-s5, m10w1-s4, m10w3-s6, m11w3-s6,
m12w1-s6, m12w3-s6 — they are on the checklist with no "Show me where"); the
Challenge cards in those sections are the content to re-home, Module 12's
"Full-Verse Rehearsal (assessment preparation)" among them.
