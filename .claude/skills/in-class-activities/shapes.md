# Ready-made activity shapes

A new In-Class Activity starts from one of these shapes: pick the shape with Jonathan, copy its exemplar card from
`class-activities.js`, change only the per-song values, then run the shape's tools. Every quote below is from
`class-activities.js`, `i18n.js` or the skill and rule files it names, as of 2026-11-26 (`origin/main` `ecee6ac`); shapes 13 and 14 were added later
the same day, when Echo (`ca-55`) and Memory Fade (`ca-56`) were built, and shape 15 on 2026-11-28, when Spot the Mistake (`ca-57`) was.

The file holds **54 activities** (ids `ca-1` to `ca-57`; `ca-9`, `ca-16` and `ca-47` are retired, the file's
"RETIRED IDS" note). Built songs (`sb-` ids) live in the database, not in the file, and are not counted here: they are
made in the console's Song builder or by skill `new-playalong` `--built`. The next new id is `ca-58` (the file's
RETIRED IDS note names it; read it again before you use it).

| # | Shape | Use it for | Copy this card | Count |
|---|---|---|---|---|
| 1 | Song part card | one or two parts of a Core song with the band, looping, leading to its whole-song card | `ca-18` "the cure" — Intro, Verse and Chorus | 5 |
| 2 | Whole-song play-along (Core song) | a Core song start to finish with the band, roots (Layer 2) or power chords (Layer 3) | `ca-30` "the cure" — The Whole Song in Power Chords (roots: `ca-24`) | 11 |
| 3 | Lyric-sheet card | the same whole song read from Jonathan's chords-over-lyrics PDF | `ca-44` "the cure" — Lyrics and Chords | 3 |
| 4 | Library play-along (Songs page) | a song a student asked for, on "More Play Along songs" | `ca-51` "Perdón Mamá" - Chuy Montana — Play Along | 7 |
| 5 | Speed ladder | climbing one passage to record speed, stop by stop | `ca-54` Sweet Child O' Mine — Speed Ladder | 1 |
| 6 | Tab ladder | a tune, a reading line or a set of chords learned from tab, step by step | `ca-1` Playing Happy Birthday — The Whole Song (chords: `ca-34`) | 4 |
| 7 | Finger Gym circuit | a numbered fretting-hand workout of three or four events and a circuit | `ca-2` Finger Gym 1 | 6 |
| 8 | Note-names ladder | the note names on one string: tab, Name the fret, Find the note, play | `ca-11` Notes on the Low E String | 3 |
| 9 | Strum-pattern ladder | one strum pattern, muted, then through a song's chords | `ca-53` Strum Pattern — The Chorus (with paths: `ca-46`) | 2 |
| 10 | Strum-pattern check | the mic listens to the pattern for two full rounds | `ca-52` Strum Pattern check | 1 |
| 11 | Drill ladder | four steps of one on-screen drill: Note Call, Call the chord, Name the power chord | `ca-23` Low E and A Notes in Time | 5 |
| 12 | Exit check | the end-of-period five-question quiz, one try | `ca-15` Notes on the Low E String (next-note: `ca-14`) | 2 |
| 13 | Echo (call and response) | hear a short strum, play it back in time, up a ladder to two parts of a song | `ca-55` Echo — Power Chord Strums | 1 |
| 14 | Memory fade | a verse and chorus with the record while the chord names leave, until it is from memory | `ca-56` Sweet Child O' Mine — Memory Fade | 1 |
| 15 | Spot the mistake | listening while reading tab or a chord line: the site plays a card's line with one note or chord wrong, the student taps where; no guitar needed | `ca-57` Spot the Mistake | 1 |
| — | Fits no shape | `ca-12` Sub Day Circuit | — | 1 |
| | | | **Total** | **54** |

Fifteen shapes, more than a rough first guess: shapes 1 to 5 are all `view: 'card'` practice cards, but each
carries different fields and is held by different checks (named in its file), so a copy from the wrong one breaks a check or
the board.

`shapes/proposed.md` lists five formats the bank does not use yet (P2 and P5 to P8;
P1, P4 and P3 are built, shapes 13, 14 and 15), Jonathan's picks first; most need new site code (P5 and P8 also have a rough version buildable today). SKILL.md's "Building a new activity" says how
to offer all of these to Jonathan as a menu.

**Rules every shape shares** (each is stated in CLAUDE.md or the files in `guide/`; follow the citation for the detail):
- Every display string has its `_es` twin in the same edit (CLAUDE.md "i18n"; the file's header: "Never ship an
  English-only string").
- Every direction is ONE line, verb first, what to play and the finish line together (CLAUDE.md "In-Class
  Activities: one short line per direction"; `guide/directions.md` "Every direction is ONE line"). checks.mjs **1cs** caps
  `intro`, step `text` and card check `text` at `CAP_2A = 105` characters, EN and ES, and pins how many it reads
  (`ONE_LINE_2A`): its own comment records each new card raising that pin ("+6, ca-54's intro and two check texts").
  Raise it as a pin-only edit when only your new card moved it (skill `new-playalong` step 5.3: "A pin it names that
  only the new card moved … is updated with the reason; anything else is a real failure").
- **The tap dots** come from the count in the whole line: a digit or two–five / dos–cinco before "times", "in a
  row", "back to back", "veces", "seguidas" (`repCountFromGotIt`, `app/drills.js`). Only 2 to 5 make dots, "8 times"
  makes none, "7 of 10" is a score and makes none, "twice" makes 2. **1bg** holds EN = ES. Measured over all 84 step
  lines with text on 2026-11-26: 48 make dots, 0 differ between EN and ES.
- Strings named, never numbered (CLAUDE.md "Strings named, never numbered"). No paper drills (same section).
- Ids are permanent; never reuse one (the file's "ids are PERMANENT"). Leave out `number` (legacy: "don't add one to
  a new activity unless you want it to land somewhere specific in that one-time seeding"). Order, module and the "#N" live on the console board, not in the file (`guide/board-renderers-drills.md` "Activity
  order, numbering and the board"). A new card arrives in Built, undated and invisible, until Jonathan places and
  dates it (the file's header) — except a `library: true` card, live for every student on push (shape 4).
- A digit in a title is a SERIES number; a series must read 1..N in EN and ES (checks.mjs **1l**; `guide/board-renderers-drills.md`).
- Four steps is a soft rule; **1bb** only prints a reminder (`guide/directions.md` "Four steps, two lines a page").
- A step field goes into BOTH step renderers, `caStepHtml()` (`app/activities.js`) and `renderTeacherActivityDetail()`
  (`teacher-activities-2.js`) — only when you ADD a field; copying an existing shape adds none (CLAUDE.md "TWO step
  renderers").
- Only the LAST step may name the Song Journey page (checks.mjs **1ba**; `guide/directions.md` "The Journey button is in the
  LAST step only").
- A student can see it → a `CHANGELOG.md` entry, same push (CLAUDE.md "Start here" step 6).

**Tools every shape runs:** `node tools/checks.mjs --check --skip-links` while working and the full
`node tools/checks.mjs` before a push (CLAUDE.md "Start here" step 1); directions that describe the music → a
screenshot of every state at 1366×657 and a script over the data for any pattern a sentence claims (step 4). The
shape sections add their own.

**Each shape has its own file in `shapes/`** (read only the one you are building): `01-song-part-card.md`, `02-whole-song-play-along.md`, `03-lyric-sheet-card.md`, `04-library-play-along.md`, `05-speed-ladder.md`, `06-tab-ladder.md`, `07-finger-gym.md`, `08-note-names-ladder.md`, `09-strum-pattern-ladder.md`, `10-strum-pattern-check.md`, `11-drill-ladder.md`, `12-exit-check.md`, `13-echo.md`, `14-memory-fade.md`, `15-spot-the-mistake.md`. Also `shapes/inventory.md` (every card and its shape; the one that fits none) and `shapes/proposed.md`.
