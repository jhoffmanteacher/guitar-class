---
paths:
  - "class-activities.js"
  - "i18n.js"
  - "app/activities*.js"
  - "app/cards*.js"
  - "app/explore.js"
  - "app/shell.js"
  - "app/lesson.js"
  - "teacher-activities*.js"
---

## In-Class Activities: directions, the two step renderers, play-along-first

Moved from CLAUDE.md (2026-11-26). The full guide: skill `in-class-activities` (read it before editing this area, then the one file in its `guide/` that its table
names for what you are touching).

- **One short line per direction.** Step `text`/`text_power`, `intro`/`intro_power`, a practice-card check's `text`,
  `bassDirections`, a recording version's `intro`, each drill's direction line before Start and a practice card's
  directions line (`i18n.js`): ONE sentence, verb first, what to play and the finish line together, one rendered line
  at 1366×657 in both languages (1cs caps the length).
  - Keep the count: the tap dots read it from the whole line (`caStepHtml` passes `wholeLine`; 1bg holds EN = ES).
  - No list, no "You've got it when:", no fix-it line, no definition. `_es`: shorten the existing Spanish, reuse its
    words.
  - A drill that already says what to do and when it is done takes no step text (ca-23).
  - Exit checks (ca-14, ca-15) stay frozen; exit-check `items` are positional, frozen once taken.
  - Jonathan asked for this rewrite, so "preserve the author's words" (`content.md`) does not cover activity
    directions.
- **TWO step renderers:** `caStepHtml()` (`app/activities.js`) and `renderTeacherActivityDetail()`
  (`teacher-activities-2.js`). A step-field change edits both (1v). Practice cards and exit checks: `caCardBodyHtml`
  (`app/cards.js`; 1bf).
- **Activity order and placement** live on the console board (`config/class.activityBoard`, `caBoardOrder()`,
  `teacherMoveActivity()`). A digit in a title is a SERIES number (1d, 1l). `config/class` is written only via
  `teacherWriteConfig()` (1ai, 1dm; omit `base` unless a single-cell toggle).
- **Play-along first:** a song link opens its play-along card if one is openable (`songsPlayAlongCard()`, at the
  click), else the Journey page; no per-song retire list (1bn). `TAKE_TO_SONG_ENABLED` / `DAILY5_ENABLED` are false:
  switched off, never deleted (1do). Don't fold "Play Along now" into `caIsVisible()`.
- After changing which activities a student sees or lands on (`caIsVisible` / `caBlockers` / `caBoardOrder` / the
  first-card pick, `showApp`'s landing, the console's or the Journey pages' copies, `classConfigSignature`): `node
  tools/visible-loop.mjs` (about 16 s).
