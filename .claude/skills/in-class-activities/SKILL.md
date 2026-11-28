---
name: in-class-activities
description: How the guitar site's In-Class Activities page, activity gate, exit checks and practice cards work: caBlockers/caIsVisible, Today's activity, Open-through, optional/CAS, clears, archive/delete, Journey gating, four-step/two-line rules, view:'card' practice cards and whole-song cards, Play Along now, Songs Core rows, render-time hiding (visibleSteps/visibleSections, section kinds), the two step renderers (caStepHtml / renderTeacherActivityDetail), the activity board and numbering (activityBoard, caBoardOrder, teacherMoveActivity, series numbers in titles), and the play-along-first song links (openSongLink, songsPlayAlongCard, TAKE_TO_SONG_ENABLED). Read BEFORE editing class-activities.js, the ca*/ec*/pc* code in the app/*.js parts (app/activities.js, app/cards.js, app/activities-2.js, app/activities-list.js), the teacher-*.js activity/console code, or tabs/journey.js gating.
---

## Building a new activity: start from a shape

Every new In-Class Activity starts from one of the ready-made shapes listed in `shapes.md` beside this file (Jonathan,
2026-11-26). Jonathan still builds each one with you, and it starts the way his reading-article skill does: **you ask
him which format to use before you write anything.**

**The menu: ask first, with the AskUserQuestion tool** (2 to 4 options a question, one question at a time, your
recommended option first with "(Recommended)" after its label, a one-line description on each option):
1. **The skill or goal**, only if his message does not already say it ("an activity for G to C changes" says it;
   "something for Thursday" does not). Options: the skills his message and the class's current module point to.
2. **The format.** Offer the 3 or 4 shapes that fit that skill, built shapes first (the table below; each shape's row
   in `shapes.md`). A proposed shape (`shapes/proposed.md`) may be offered only if it fits
   the skill better than every built one, labelled "new format: needs building first" in its description; picking it
   starts a code change, not a copy.

Then build from the chosen shape:
- Ask that shape's "Ask Jonathan" questions (its own file in `shapes/`; read only that one).
- Copy the exemplar card it names from `class-activities.js`, with the next unused id, and change only the per-song
  values its skeleton marks. A copy adds no new field, so neither step renderer changes.
- Write each direction as one line, EN and ES, the way that shape's quoted examples do, keeping the count.
- Read its traps, then run the common checks and that shape's own tools (listed in its section).

| The skill | Built shapes that fit (shape number in `shapes.md`) | Proposed, not built |
|---|---|---|
| Chord changes (open or power) | 9 strum-pattern ladder, 6 tab ladder (chords, as `ca-34`), 1 song part card, 11 drill ladder (Call the chord) | P7 make your own loop |
| A song with the band | 1 song part card, 2 whole-song play-along, 3 lyric-sheet card, 4 library play-along, 14 memory fade | P2 fill the gap, P5 duet |
| Getting a passage up to speed | 5 speed ladder (see its pin), 1 song part card (its Build up speed switch) | — |
| A riff or tune from tab | 6 tab ladder, 1 song part card, 15 spot the mistake | — |
| Note names on a string | 8 note-names ladder, 11 drill ladder (Note Call), 12 exit check | — |
| Power-chord names | 11 drill ladder (Note Call power, Name the power chord) | — |
| Strumming | 9 strum-pattern ladder, 13 echo | P7 make your own loop |
| Fretting-hand technique | 7 Finger Gym circuit | — |
| Reading TAB | 6 tab ladder (as `ca-21`), 15 spot the mistake | — |
| Song form, listening | 11 drill ladder (Call the chord), 13 echo, 15 spot the mistake | P6 song-form arrange |
| Soloing | — | P8 improvise over a loop |
| End-of-period check | 12 exit check | — |

**Worked example.** Jonathan: "make an activity for G to C changes". The skill is clear (open G and C, Module 4's
Group 1, the order `CHORD_RANK` in `coach-chordcards.js` gives), so skip question 1 and ask only the format:
```
question: "Which format for the G to C changes activity?"
header:   "Format"
options:
  - label: "Strum-pattern ladder (Recommended)"
    description: "Copy ca-53: strum on muted strings, then G and C two bars each, then one bar each, the pattern never stopping."
  - label: "Chord tab ladder"
    description: "Copy ca-34: pick G, then C, one string at a time, then change between them on the tab."
  - label: "Song part card"
    description: "Copy ca-18: one part of a song he names that changes G to C, played with the band (needs its track)."
```
Had he written "something for Thursday", question 1 would come first ("What should Thursday's activity practise?",
header "Skill"), its options the skills his message or the module the class is in point to, and question 2 after his
answer.

Seven builds are not a plain copy, and their sections say why: a second strum-pattern check (code and the 1eh pin), a
second speed ladder (the 1fc pin and `tools/speed-ladder-loop.mjs`), a second Echo (the 1fi check), a second Memory
fade (the 1fm pins), a second Spot the mistake (the 1fs pin), a new drill type, and a new deck (code and
`i18n.js`). Say so to Jonathan before building one. A library play-along is typed by `tools/new-playalong.mjs`
(skill `new-playalong`), not copied by hand.

## Read only the file for what you are touching

This page is the format menu and a map (split 2026-11-26: Jonathan, "should each style class activity be split into
its own file"). The rules are in `guide/`, one topic a file; their ⚠️ lines bind. **Read the matching file before
editing that area.** Not sure which? `grep -rn "<name>" .claude/skills/in-class-activities`.

| Touching | File |
|---|---|
| A new activity | `shapes.md` (the list and the rules every shape shares), then the one `shapes/NN-….md` |
| What the page shows: Today's activity, reading order, reload, the folded view, step row, the Keep practicing pins, the rail | `guide/activities-page.md` |
| The lock, `caBlockers`, Open through, Optional, CAS, clears, Archive / Delete, Journey-page gating | `guide/gate.md` |
| Any direction text, step count, tab paging, `revealDelay`, the Song Journey button | `guide/directions.md` |
| A practice card: chord grid, recording versions, card views, lyric sheet, speed control; the `pc*` code | `guide/practice-cards.md` |
| Songs page rows, Play Along now, song links, Take It to a Song, `JOURNEY_LAYERS` links | `guide/songs-links.md` |
| Hidden sections and steps: `visibleSteps` / `visibleSections`, section kinds, `gi`, `JOURNEY_LAYERS` | `guide/render-hiding.md` |
| Board order and `#N`, series numbers, the two step renderers, Focus view, paths, `step.drill` | `guide/board-renderers-drills.md` |
| Exit checks, activity deep links | `guide/exit-checks.md` |
