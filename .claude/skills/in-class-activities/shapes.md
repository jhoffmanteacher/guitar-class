# Ready-made activity shapes

A new In-Class Activity starts from one of these shapes: pick the shape with Jonathan, copy its exemplar card from
`class-activities.js`, change only the per-song values, then run the shape's tools. Every quote below is from
`class-activities.js`, `i18n.js` or the skill and rule files it names, as of 2026-11-26 (`origin/main` `ecee6ac`).

The file holds **51 activities** (ids `ca-1` to `ca-54`; `ca-9`, `ca-16` and `ca-47` are retired, the file's
"RETIRED IDS" note). Built songs (`sb-` ids) live in the database, not in the file, and are not counted here: they are
made in the console's Song builder or by skill `new-playalong` `--built`. The next new id is `ca-55` (the file's
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
| — | Fits no shape | `ca-12` Sub Day Circuit | — | 1 |
| | | | **Total** | **51** |

Twelve shapes, a few more than a rough first guess: shapes 1 to 5 are all `view: 'card'` practice cards, but each
carries different fields and is held by different checks (below), so a copy from the wrong one breaks a check or
the board.

After the inventory, "Proposed shapes (not built yet)" lists eight formats the bank does not use yet (P1 to P8),
Jonathan's four picks first; most need new site code (P1, P5 and P8 also have a rough version buildable today). SKILL.md's "Building a new activity" says how
to offer all of these to Jonathan as a menu.

**Rules every shape shares** (each is stated in CLAUDE.md or `SKILL.md`; follow the citation for the detail):
- Every display string has its `_es` twin in the same edit (CLAUDE.md "i18n"; the file's header: "Never ship an
  English-only string").
- Every direction is ONE line, verb first, what to play and the finish line together (CLAUDE.md "In-Class
  Activities: one short line per direction"; `SKILL.md` "Every direction is ONE line"). checks.mjs **1cs** caps
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
  a new activity unless you want it to land somewhere specific in that one-time seeding"). Order, module and the "#N" live on the console board, not in the file (`SKILL.md` "Activity
  order, numbering and the board"). A new card arrives in Built, undated and invisible, until Jonathan places and
  dates it (the file's header) — except a `library: true` card, live for every student on push (shape 4).
- A digit in a title is a SERIES number; a series must read 1..N in EN and ES (checks.mjs **1l**; `SKILL.md`).
- Four steps is a soft rule; **1bb** only prints a reminder (`SKILL.md` "Four steps, two lines a page").
- A step field goes into BOTH step renderers, `caStepHtml()` (`app/activities.js`) and `renderTeacherActivityDetail()`
  (`teacher-activities-2.js`) — only when you ADD a field; copying an existing shape adds none (CLAUDE.md "TWO step
  renderers").
- Only the LAST step may name the Song Journey page (checks.mjs **1ba**; `SKILL.md` "The Journey button is in the
  LAST step only").
- A student can see it → a `CHANGELOG.md` entry, same push (CLAUDE.md "Start here" step 6).

**Tools every shape runs:** `node tools/checks.mjs --check --skip-links` while working and the full
`node tools/checks.mjs` before a push (CLAUDE.md "Start here" step 1); directions that describe the music → a
screenshot of every state at 1366×657 and a script over the data for any pattern a sentence claims (step 4). The
shape sections add their own.

---

## 1. Song part card

**For:** students play one or two parts of a Core song (the intro, the verses, the riff) with the real band,
looping, then move on to the song's whole-song card. "ca-18 is the model to match" (the file's CARD note).

**Skeleton** (from `ca-18`):
```js
{
  id: 'ca-55',                         // the next id
  view: 'card',
  title: '"the cure" — Intro, Verse and Chorus', title_es: '…',      // per song
  intro: 'Add the chorus of "the cure" and play …', intro_es: '…',  // per song, one line
  card: {
    track: 'the-cure',                 // per song: a SNIPPET_TRACKS key
    slowest: true,                     // every card has it
    caption: 'The song in order · 4 plucks per note', caption_es: '…',  // per song
    sections: [                        // per song, back to back, in song order
      { label: 'Intro', label_es: 'Intro', caption: 'Intro — A C A C', caption_es: '…',
        fromBar: 1, bars: 4,           // bars of the RECORD, felt pulse
        notes: [ { string: 'E', fret: 5, note: 'A', midi: 45 }, … ] },     // beats add up to bars × beatsPerBar
      { label: '2 Verses', …, fromBar: 5, bars: 8, reps: 2, repLabel: 'Verse', repLabel_es: 'Estrofa', notes: [ … ] },
    ],
    checks: [                          // not shown since 2026-11-10, kept as data and held to one line by 1cs
      { label, label_es, text, text_es }, …,
      { levelUp: true, card: 'ca-24', text: '…', text_es: '…' }        // per song: its whole-song card; last, exactly one
    ]
  },
  steps: [],                           // no practice card has a help ladder
}
```

**Direction lines:**
- `ca-18`: "Add the chorus of "the cure" and play from the intro to the end of the chorus with the band." / "Agrega
  el coro de "the cure" y tócala desde la intro hasta el final del coro con la banda."
- `ca-10`: "Play the Seven Nation Army riff with the song." / "Toca el riff de Seven Nation Army con la canción."
- `ca-20`: "Play the "Luna" loop with the band: F at fret 1 on the low E string, then the open A string." / "Toca el
  bucle de "Luna" con la banda: F en el traste 1 de la cuerda Mi grave y la cuerda La al aire."

Pattern: "Play <the part> with the band/song", the notes named when they are new. No count: a practice card shows no
tap dots (`caTickKeys(card)` is `[]`, `SKILL.md` "Checks").

**Ask Jonathan:** which song and which parts; the string and frets of each note, and how many plucks per bar (the
captions say it: "4 plucks per note", "1 pluck per bar, let it ring"). The song's settled chords and section bars come
from skill `song-facts` before you ask.

**Traps:**
- A part card's Level up opens its song's whole-song card (`card: 'ca-N'`) — "never a power-chord version"
  (`SKILL.md` "Level up and links"; 1bn).
- **1bf** checks the data: the track exists, sections back to back, beats = bars × beatsPerBar, midi from string +
  fret, the window inside the file, exactly one Level up and it is last.
- A section with `repLabel` counts in that word; **1bm** fails a mix.
- Snippet windows are bars, never seconds (CLAUDE.md, the audio row).

**Tools:** `node tools/playalong-loop.mjs --only <id> --shots <dir>` and look at every PNG (CLAUDE.md, the audio row:
"after any change to a practice card's chart").

---

## 2. Whole-song play-along (Core song)

**For:** the play-along of a Core song, intro to the end, with the band. It IS the song's Play Along (the Songs tile
and every song link open it), so it carries `journey` + `journeyLayer`: 2 for roots (`ca-24`–`ca-28`), 3 for power
chords (`ca-29`–`ca-33`) (`SKILL.md` "Layer matching"). `ca-40` is the same shape made teacher-only.

**Skeleton** (from `ca-30`):
```js
{
  id: 'ca-55', view: 'card',
  journey: 'the-cure',                 // per song: one of the SONG_JOURNEYS slugs
  journeyLayer: 3,                     // 2 roots, 3 power chords
  title: '"the cure" — The Whole Song in Power Chords', title_es: '"the cure" — Toda con acordes de potencia',
  intro: '…', intro_es: '…',
  card: {
    wholeSong: true,                   // stops at the end of the song instead of looping
    track: 'the-cure',                 // per song
    chordGrid: true,                   // power-chord cards except ca-31 (a riff played as chords is not one)
    slowest: true,
    caption: 'The whole song in power chords', caption_es: '…',
    sections: [                        // per song: the whole record, in order
      { label: 'Intro', label_es: 'Intro', caption: 'Intro — A5 C5 A5 C5', caption_es: '…', fromBar: 1, bars: 4,
        notes: [ { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] }, … ] },  // a roots card: { string, fret, note, midi }
      …
    ],
    checks: [
      { label, label_es, text: 'Play the whole song with the band, intro to the end, without stopping.', text_es },
      { levelUp: true, text: 'Slide the speed to Normal and play the whole song with the band without stopping.', text_es }
    ]
  },
  steps: [],
}
```

**Direction lines:**
- `ca-30` (and `ca-29`, `ca-31`–`ca-33`, word for word): "Play the whole song in power chords: the same roots, with
  two more strings added." / "Toca la canción completa con acordes de potencia: las mismas raíces, con dos cuerdas
  más."
- `ca-24`: "Play the whole of "the cure" with the band, start to finish." / "Toca "the cure" completa con la banda,
  de principio a fin."
- `ca-28`: "Play the root of every chord with the band, start to finish." / "Toca la raíz de cada acorde con la
  banda, de principio a fin."

Pattern: "Play the whole song …, start to finish". The two checks are the same two lines on all 11 cards of this
shape; no tap dots.

**Ask Jonathan:** which Core song and which layer. All five songs with a card already have both layers (`ca-24`–`ca-28`
roots, `ca-29`–`ca-33` power). Chords, keys and section bars: skill `song-facts` ("Don't re-flag settled facts").

**Traps:**
- "A whole-song card has exactly two checks" and its Level up names no other page and renders no Journey button
  (`SKILL.md`; 1bn).
- A power chord is `{ frets, note, midi }`; `caChordProblems()` recomputes every pitch and requires a root-plus-5th
  pair named for its root (`SKILL.md` "A card note may be a chord").
- `chordGrid` is opt-in per card and **1bv** pins the list: "Turning a card on or off means editing its pinned list"
  (`SKILL.md`). `everyStrum` (ca-29) changes the card's directions line (**1cc**).
- When two cards for one song pass, the newest (highest board `#N`) is the Play Along (`SKILL.md` "Each Core song row
  links its whole-song practice card").
- A `teacherOnly` card (ca-40) carries no `journey` / `journeyLayer` (**1bn**).
- A second recording (`recordingVersions`, ca-26 / ca-29 / ca-40) is its own track, bars and form; **1cc** pins "3
  cards / 1 group" (`SKILL.md` "Recording versions").
- `otherViews` (Chords / Tab / Lyrics) is filled by reference at the end of the file, never typed on the card (the
  CARD VIEWS note); **1er**.

**Tools:** `node tools/playalong-loop.mjs --only <id> --shots <dir>`.

---

## 3. Lyric-sheet card

**For:** the same whole song read from Jonathan's own chords-over-lyrics PDF, a dot on the chord being played.

**Skeleton** (from `ca-44`):
```js
{
  id: 'ca-55', view: 'card',
  title: '"the cure" — Lyrics and Chords', title_es: '"the cure" — Letra y acordes',
  intro: 'Play the whole song in power chords from the chord sheet, following the dot.', intro_es: '…',
  card: {
    wholeSong: true, track: 'the-cure', slowest: true,     // per song: track
    sheet: 'sheets/the-cure.pdf',      // per song: his PDF
    sheetColumns: 1,                   // one column of chords over lyrics; left out = two columns (ca-38, ca-45)
    sheetChords: 94,                   // per song: names on the sheet = chord changes in the notes (1bf2)
    caption: 'Lyrics and chords · …', caption_es: '…',
    sections: null,                    // the play-along card's — joined after the array
    checks: [ { label, label_es, text, text_es }, { levelUp: true, text, text_es } ]
  },
  steps: [],
}
// and one pair in the IIFE after the array: [['ca-30', 'ca-44'], …] — to.card.sections = from.card.sections
```

**Direction lines:** `ca-38`, `ca-44` and `ca-45` share the intro "Play the whole song in power chords from the chord
sheet, following the dot." / "Toca la canción completa con acordes de potencia desde la hoja de acordes, siguiendo el
punto." and the check "Play the whole song with the band from the sheet without stopping." / "Toca la canción
completa con la banda desde la hoja, sin detenerte." Pattern: "Play … from the sheet". No tap dots.

**Ask Jonathan:** the PDF ("The PDF in `sheets/` is his own Word doc; the lyrics come from his file, never typed into
code"); one column or two; which play-along card's sections it reads.

**Traps** (`SKILL.md` "A card can show a chord sheet PDF instead of its tab"):
- "Sheet chord n = the card's n-th chord CHANGE": `sheetChords` pins the count and **1bf2** holds the notes to it. A
  chord still ringing at a line start gets no name unless its section is in `sheetNamedAgain`.
- The sections are the play-along card's by reference (one IIFE after the array), so a rhythm edit there moves the dot.
- No `journey`: a sheet card "is another view of ca-29, not Layer 3's play-along" (**1bn**).

**Tools:** `node tools/playalong-loop.mjs --only <id> --shots <dir>`.

---

## 4. Library play-along (Songs page)

**For:** a song a student asked for, on the Songs page's "More Play Along songs" for the whole class from the push,
with no board slot or date. Never a Core song (**1bq**). Six of the seven are `library: true`; `ca-41` is
`library: false`, the same card starting as a class activity (the file's LIBRARY note).

**Skeleton** (from `ca-51`; **typed by `tools/new-playalong.mjs`, not by hand** — skill `new-playalong` step 4):
```js
{
  id: 'ca-55', view: 'card',
  library: true,                       // false: starts on the board's Built list instead
  added: '2026-11-26',                 // the Songs page's "Date added" (1fa)
  optional: true,
  chordStart: 'power',                 // with chordVersions: opens on Power chords
  chordVersions: { power: { 'C#m': { frets: [['G', 6], ['D', 6], ['A', 4]], note: 'C#5', midi: [61, 56, 49] }, … } },  // per song
  title: '"Perdón Mamá" - Chuy Montana — Play Along', title_es: '"Perdón Mamá" - Chuy Montana — Toca con la canción',
  intro: '…', intro_es: '…', intro_power: '…', intro_power_es: '…',
  card: {
    track: 'perdon-mama', chordGrid: true, slowest: true,    // per song: track
    caption: 'The song in order', caption_es: '…',
    sections: [ { label: 'Intro', …, fromBar: 1, bars: 16, notes: [ … ] }, … ],   // per song, from the measured record
    checks: [ …, { levelUp: true, text: 'Slide the speed to Normal and play the whole song with the band.', text_es } ]
  },
  steps: [],
}
```

**Direction lines:**
- `ca-51`: "Play Perdón Mamá with the band: C#m, B, F#m and A in the same eight-bar loop all the way through." / "Toca
  Perdón Mamá con la banda: C#m, B, F#m y A en la misma vuelta de ocho compases de principio a fin." (and its
  `intro_power`: "… C#5, B5, F#5 and A5 …")
- `ca-42`: "Play Vuelve a la Vida with the band using five power chords: Bb5, G5, Eb5, C5 and F5." / "Toca Vuelve a la
  Vida con la banda con cinco acordes de potencia: Bb5, G5, Eb5, C5 y F5."
- `ca-37`: "Play Arsenal Efectivo with the band using B5, E5, A5 and Bb5, all between frets 5 and 9." / "Toca Arsenal
  Efectivo con la banda con B5, E5, A5 y Bb5, todos entre los trastes 5 y 9."

Pattern: "Play <song> with the band: <the chords>". A `chordVersions` card has an `intro_power` twin naming the
power chords (the file's CHORD VERSIONS note). No tap dots.

**Ask Jonathan:** skill `new-playalong` step 1, in one message: the mp3, song and artist read back, the chords from
his chart (read a picture's chords back first; "never invent a chord"), the level (power or open chords), a capo or
key change, which part. Step 3 says when to stop and ask (a drifting record, a chord the level has not taught, a
tempo change, an audit that cannot tell).

**Traps:** every one is in skill `new-playalong`: every new song is PRIVATE (`--private`), Jonathan uploads and
Verifies before the push; level to the cure with `loudness.py`; the tool's card comment says "No lyrics: the song is
not public domain"; a BUILT song (`--built`) needs no card here at all. A library card is "NOT a class activity"
(the file's LIBRARY note): it never appears on the board.

**Tools:** skill `new-playalong` steps 5 and 6: `python3 tools/loudness.py`, `python3 tools/beat-audit.py --only`,
the full `node tools/checks.mjs`, `node tools/playalong-loop.mjs --only <id> --shots <dir>`.

---

## 5. Speed ladder

**For:** one passage played once at each stop from a slow tempo up to record speed; after each time through the song
stops and asks "Got it" or "Practice again" (the comment above `ca-54`).

**Skeleton** (from `ca-54`):
```js
{
  id: 'ca-55', view: 'card',
  title: 'Sweet Child O\' Mine — Speed Ladder', title_es: 'Sweet Child O\' Mine — Escalera de velocidad',
  intro: 'Climb to record speed on the verse and chorus together.', intro_es: '…',
  card: {
    track: 'sweet-child-o-mine', slowest: true,
    slowestRate: 0.9,                  // per song: the bottom stop (the site's usual is 0.8)
    startStop: 'slowest',              // opens on the bottom stop
    buildLaps: 1,                      // one time through per stop
    sheet: '…', sheetColumns: 1, sheetNamedAgain: ['Verse 1'], sheetChords: 14,   // per song: its own cut sheet
    caption: '…', caption_es: '…',
    sections: null,                    // another card's sections, joined by label after the array
    rounds: [ { label: 'Verse + Chorus', label_es: '…', what: '…', what_es: '…', from: 0, to: 1, startStop: 0 } ],
    checks: [ { label: 'Up to 112', … }, { label: 'Record speed', … } ]   // plain checks, NO Level up
  },
  steps: [],
}
```

**Direction lines** (`ca-54`): intro "Climb to record speed on the verse and chorus together." / "Sube a la velocidad
de la grabación en la estrofa y el coro juntos."; checks "Play the verse and chorus one time through at 90, 100 and
112 BPM." / "Toca la estrofa y el coro una vez a 90, 100 y 112 BPM." and "Play the verse and chorus one time through
at record speed, 125 BPM." / "Toca la estrofa y el coro una vez a la velocidad de la grabación, 125 BPM." Pattern: the tempo targets named as numbers.

**Ask Jonathan:** the passage, the tempo stops, which sheet or view it opens on.

**Traps:**
- **1fc** "pins `rounds`, `slowestRate`, `startStop` and `buildLaps` to that card alone" (`SKILL.md`, the 1bf bullet).
  A second ladder therefore means widening that pin in the same commit: CLAUDE.md "Triggers" counts "extending what a
  check reads" as break-it proof only.
- A card with `rounds` has no Level up (**1bf**).

**Tools:** `node tools/playalong-loop.mjs --only <id>` and `node tools/speed-ladder-loop.mjs` (its header: it plays
`ID = 'ca-54'`, so a second ladder needs the tool taught its id; about 6 minutes, one browser run).

---

## 6. Tab ladder

**For:** a tune, a TAB-reading line or a set of chords, one tab per step, ending on the whole thing. Focus view (one
step at a time).

**Skeleton** (from `ca-1`):
```js
{
  id: 'ca-55', view: 'focus',
  title: 'Playing Happy Birthday — The Whole Song', title_es: '…',
  intro: 'Play all four lines on the low E string: …', intro_es: '…',
  // metronome: 60,                    // optional: opening the card starts Metro (ca-21)
  steps: [
    { label: 'Lines 1 and 2', label_es: 'Líneas 1 y 2',
      text: 'Play Line 1 into Line 2 four times without stopping.', text_es: '…',   // the count makes 4 dots
      tab: { caption: '…', caption_es: '…',
             phrases: [ { label, label_es, notes: [ { string: 'E', fret: 0, note: 'E', midi: 40, beats: 0.5 }, … ] } ] } },
    …                                  // each later step: its own tab (notes or phrases)
    { label: 'The whole song', …, text: 'Play the whole song without stopping and raise the BPM by 10 three times.',
      tab: { …, linesPerPage: … } }
  ],
}
```
Variants in the file: `ca-21` (`metronome: 60`, `hideNames` and `controlsBelow` on every tab, "Learn — " / "Practice — "
labels); `ca-34`, a chords ladder (`chordVersions`, `chordStart`, a `_power` twin on intro and captions, two steps with
a `snippet` of the band).

**Direction lines:**
- `ca-1`: "Play Line 1 into Line 2 four times without stopping." / "Toca de la Línea 1 a la Línea 2, cuatro veces
  seguidas, sin detenerte." (4 dots)
- `ca-8`: "Land on fret 5 of the low E string just behind the fret, ringing clean, three times in a row." / "Cae en
  el traste 5 de la cuerda Mi grave justo detrás del traste, limpio, tres veces seguidas." (3 dots)
- `ca-34`: "Pick the A chord one string at a time, A string to high e, all ringing, three times in a row." / "Toca el
  acorde A cuerda por cuerda, de la cuerda La a la mi aguda, sin zumbido, tres veces seguidas." (3 dots)

Pattern: "Play <the line> <how> <count> times / in a row", one count per line.

**Ask Jonathan:** the tune or chords and the string(s); the BPM range; whether the last step is "keep going" with
the Metro tool.

**Traps:**
- Long tabs page two rows at a time; `revealDelay` drops Play tab, so keep it off a tab whose Play is the answer key
  (`SKILL.md` "Four steps, two lines a page").
- A step `snippet` is the same bars the tab shows ("an eight-bar tab wants an eight-bar window", the schema's snippet
  note); **1ak** checks the window. An earlier listen-along goes on a snippet, never the Journey page (`SKILL.md`).
- `chordVersions`: **1d** checks the shapes and the `_power` / `_power_es` pairs.

**Tools:** the common ones. `node tools/focus-tap-diff.mjs` walks "every Focus activity" in the real data (its
header), so it also covers a new one.

---

## 7. Finger Gym circuit

**For:** a numbered fretting-hand workout: three or four events on tab with the fretting finger shown, then a circuit.

**Skeleton** (from `ca-2`):
```js
{
  id: 'ca-55', view: 'focus',
  title: 'Finger Gym 7', title_es: 'Gimnasio de Dedos 7',   // the next SERIES number, EN and ES
  intro: 'Train three events in the first five frets: …', intro_es: '…',
  steps: [
    { label: 'The Ladder', label_es: 'La Escalera',
      text: 'Play the Ladder at 50 BPM with no buzz, three times in a row.', text_es: '…',
      tab: { bpm: 50,                  // the slider opens on the step's own "at 50 BPM" (the ca-2 source)
             caption: '…', caption_es: '…',
             notes: [ { string: 'E', fret: 1, note: 'F', midi: 41, finger: 1 }, … ] } },   // finger 1–4
    …                                  // two or three more events
    { label: 'The circuit', label_es: 'El circuito',
      text: 'Play two clean sets in a row (each event 4 times), the second 10 BPM faster.', text_es: '…' }   // no tab
  ],
}
```

**Direction lines:**
- `ca-2`: "Play the Ladder at 50 BPM with no buzz, three times in a row." / "Toca la Escalera a 50 BPM sin zumbido,
  tres veces seguidas." (3 dots)
- `ca-3`: "Climb up and straight back down, the top note once, four times without stopping." / "Sube y baja de
  inmediato, la nota de arriba una sola vez, cuatro veces seguidas sin detenerte." (4 dots)
- `ca-2` circuit: "Play two clean sets in a row (each event 4 times), the second 10 BPM faster." / "Toca dos series
  limpias seguidas (cada evento 4 veces), la segunda 10 BPM más rápida." (2 dots: the LAST small number before the
  first keyword)

Pattern: "Play <event> at <BPM> with no buzz, <count> in a row"; the circuit "two clean sets in a row, the second 10
BPM faster".

**Ask Jonathan:** the events and positions (from his Finger Gym deck: the `finger` convention matches "the Finger Gym
teacher deck", schema note).

**Traps:**
- The title's digit is a series number: Gym 7 after Gym 6; inserting one mid-series retypes every later title AND
  any "same as Gym 1" cross-reference (**1l**; `SKILL.md` "A number in an activity title is still a SERIES number").
- **1c** fails a `finger` outside 1–4. "Fingering rule: finger = fret within the hand position, a shift restarts at
  finger 1" (schema note).

**Tools:** the common ones.

---

## 8. Note-names ladder

**For:** the note names on one string: play them from tab saying each name, then two drills, then play.

**Skeleton** (from `ca-11`):
```js
{
  id: 'ca-55', view: 'focus',
  title: 'Notes on the Low E String', title_es: 'Notas en la cuerda Mi grave',
  intro: 'Learn the names of the notes on the low E string, from open E to fret 12.', intro_es: '…',
  steps: [
    { label: 'The dot notes', …, text: 'Play E, G, A and B at the dots, saying each name out loud, three times through.',
      tab: { bpm: 20, minBpm: 20, maxBpm: 80, caption: '…', notes: [ … ] } },
    { label: 'Name the fret', label_es: 'Di la nota',
      text: 'Get 7 of 10 on your first pass, then try for 9 of 10.', text_es: 'Saca 7 de 10 en tu primera pasada y después intenta sacar 9 de 10.',
      drill: { type: 'shuffle', string: 'lowE', maxFret: 12, rounds: 10, seconds: 8, pile: 'naturals' } },   // per string
    { label: 'Find the note', label_es: 'Encuentra la nota',
      text: 'Find five notes in a row on the low E string without looking at a tab.', text_es: '…',
      drill: { type: 'deck', deck: 'naturals-lowE' } },                // per string: a DECKS key
    { label: 'Keep going', …, text: 'Play the notes up and back, one per beat, from 20 BPM up to 40, adding 5 each clean pass.' }
  ],
}
```

**Direction lines:** the shuffle line is the same on `ca-11`, `ca-17` and `ca-12`: "Get 7 of 10 on your first pass,
then try for 9 of 10." (no dots: a score). The deck line, `ca-11`: "Find five notes in a row on the low E string
without looking at a tab." / "Encuentra cinco notas seguidas en la cuerda Mi grave sin mirar la tablatura." (5 dots).
`ca-17`: "Play the A-string notes, saying each name out loud, three times through." / "Toca las notas de la cuerda La
diciendo cada nombre en voz alta, tres veces completas." (3 dots).

**Ask Jonathan:** the string and the fret range.

**Traps:**
- The "Name the fret" and "Find the note" steps keep their line because "neither drill shows its finish line before
  Start" (`SKILL.md` "Every direction is ONE line").
- The deck must exist in `DECKS` (`app/drills.js`; `naturals-lowE`, `naturals-A` and `naturals-plus` today); a new
  deck is code and `i18n.js` strings, not data (`SKILL.md` "`DECKS` lives in `app/drills.js`").

**Tools:** the common ones.

---

## 9. Strum-pattern ladder

**For:** one strum pattern: hear it, play it on muted strings, then through a song's chords with the pattern never
stopping. Optional `paths` give a second way in (`ca-46`: "The whole pattern" / "In chunks").

**Skeleton** (from `ca-53`):
```js
{
  id: 'ca-55', view: 'focus',
  title: 'Strum Pattern — The Chorus', title_es: 'Patrón de rasgueo — El coro',
  intro: 'Learn the chorus strum pattern of "Sweet Child O\' Mine", then play it through the chorus chords.', intro_es: '…',
  steps: [
    { label: 'Practice — Muted strings', label_es: 'Practica — Cuerdas apagadas',
      text: 'Press ▶ to hear the pattern, then mute the strings and strum it 8 times in a row without stopping.', text_es: '…',
      strum: { caption: 'Muted strings · count "1 and 2 and 3 and 4 and" (the + is "and")', caption_es: '…',
               pattern: 'D..U..DU',    // per song: 8 eighths, D / U / . (miss) / - (stop)
               chords: { A5: { frets: [['A', 0], ['D', 2], ['G', 2]], midi: [45, 52, 57] } },
               bars: ['A5', 'A5', 'A5', 'A5'], barsPerRow: 4, bpm: 85, hideNames: true } },
    { label: 'Practice — A5, C5, D5', …,
      text: 'Play all eight bars 4 times through, changing chord on the 1, the pattern never stopping.', text_es: '…',
      strum: { …, chords: { A5, C5, D5 }, bars: ['A5', 'C5', 'D5', 'D5', 'A5', 'C5', 'D5', 'D5'], barsPerRow: 4, bpm: 85 } }
  ],
}
// ca-46 adds: paths: [{ key, label, label_es, blurb, blurb_es }, …], `path: '<key>'` on each path's steps,
// untagged shared steps after them, and a last step with a `video`.
```

**Direction lines:**
- `ca-53`: "Play all eight bars 4 times through, changing chord on the 1, the pattern never stopping." / "Toca los
  ocho compases 4 veces completos, cambiando de acorde en el 1, sin detener el patrón." (4 dots)
- `ca-46`: "Add a down on 4 and play it 4 times in a row, your hand never stopping." / "Agrega un abajo en el 4 y
  tócalo 4 veces seguidas sin detener la mano." (4 dots)
- `ca-46`: "Mute the strings and strum the pattern 8 times in a row without stopping." / "Apoya la mano de trastear
  sobre las cuerdas y rasguea el patrón 8 veces seguidas sin detenerte." (no dots: 8 is above 5)

**Ask Jonathan:** the pattern from his slides ("THE PATTERN is Jonathan's, typed by him", the comment above `ca-53`);
the chords and bars (a Core song's from skill `song-facts`); the opening BPM; one path or two.

**Traps:**
- **1d** recomputes every chord's midi from its frets, validates `paths` / `path` and pins both renderers; **1am** /
  **1bb** size a paths activity by its longest route (`SKILL.md` "Paths").
- A video: "never invent YouTube IDs; `WebSearch` + oEmbed verify, else drop"; check the watch range (CLAUDE.md
  "Videos"). `ca-53` has none: "no watch range checked for the chorus".
- The mic check is NOT a field to copy here: **1eh** pins `listen` to `ca-52` alone (shape 10).

**Tools:** the common ones; `tools/smoke.mjs` `pathsWalk` clicks through the paths activity (`SKILL.md`), on GitHub
after the push.

---

## 10. Strum-pattern check

**For:** one step: the student plays eight bars with the Listening Coach button under the strum board; the step
ticks itself after two full rounds (the file's LISTEN ROUNDS note).

**Skeleton** (from `ca-52`; no `view` and no `intro`, the only such card):
```js
{
  id: 'ca-52', title: 'Strum Pattern check', title_es: 'Chequeo del patrón de rasgueo',
  steps: [ { label: 'Play for feedback — D5, C5, G5', …,
             text: 'Play the eight bars, two full rounds, with the button under them.', text_es: '…',
             listenRounds: 2,
             strum: { …, bars: [ 8 bars ], barsPerRow: 4, bpm: 85, listen: true } } ],
}
```

**Direction line:** "Play the eight bars, two full rounds, with the button under them." / "Toca los ocho compases,
dos rondas completas, con el botón de abajo." (no dots: the rounds count it).

**Ask Jonathan** before anything: this is not a copy job. "`listen: true` … 1eh pins it to this step alone" (the
`ca-52` source), and the judge is listening code in `coach-strumcheck.js` (CLAUDE.md "Where the code lives").

**Tools:** `node tools/mic-sim/strum-check-loop.mjs` after any change to `coach-strumcheck.js` (CLAUDE.md).

---

## 11. Drill ladder

**For:** four steps of one on-screen drill, easy to hard; each step is a label and a drill, no text: "the widget
carries its own directions and pass line" (the comment above `ca-48`).

**Skeleton** (from `ca-23`):
```js
{
  id: 'ca-55', view: 'focus',
  title: 'Low E and A Notes in Time', title_es: '…',
  intro: 'Play each note as its name comes up, then turn off Show answer and pass Level 3.', intro_es: '…',   // ca-48/49/50 have none
  steps: [
    { label: 'Practice — Frets 0 to 5', label_es: 'Practica — Trastes 0 a 5',
      drill: { type: 'notecall', strings: ['lowE', 'A'], minFret: 0, maxFret: 5 } },   // per step: the range
    …                                  // 5 to 8, 8 to 12, the whole neck
  ],
}
```

| Drill | Data | Cards | Its direction line (i18n.js, shown before Start) |
|---|---|---|---|
| Note Call | `{ type: 'notecall', strings, minFret, maxFret }` | `ca-23` (4 steps), `ca-49` step 1 with `board: 'all'` | `nc.intro` "Play each note as its name comes up, then tap its fret on the board." / "Toca cada nota cuando aparece su nombre y después toca su traste en el diagrama." |
| Note Call, power chords | the same with `power: true` | `ca-43` | `ncp.intro` "Play each power chord as its name comes up, then tap its root fret on the board." / "Toca cada acorde de potencia cuando aparece su nombre y después toca el traste de su raíz en el mástil." |
| Call the chord | `{ type: 'chordcall', card: 'ca-29', section: 'Verse 1', mode: 'follow' \| 'call' }` | `ca-48`, `ca-50` | `chc.introFollow` "Tap the next chord, or press the space bar, in the last beat before the band changes to it." / "Toca el siguiente acorde o presiona la barra espaciadora en el último tiempo antes de que la banda cambie." |
| Name the power chord | `{ type: 'pcname', mode: 'name' \| 'fret' \| 'both', minFret, maxFret }` | `ca-49` steps 2–4 | `pwn.introName` "Pick the name of the power chord whose root is the dot with the ?." / "Elige el nombre del acorde de potencia cuya raíz es el punto con el ?." |

Activity intros: `ca-23` "Play each note as its name comes up, then turn off Show answer and pass Level 3." / "Toca
cada nota cuando aparece su nombre y luego apaga «Mostrar la respuesta» y pasa el Nivel 3."; `ca-43` "Play each power
chord as its name comes up, then turn off Show answer and pass Level 3." / "Toca cada acorde de potencia cuando
aparece; luego apaga «Mostrar la respuesta» y pasa el Nivel 3." No step text, so no tap dots.

**Ask Jonathan:** the drill, the strings and the fret range of each step; for Call the chord, which play-along card
and section ("Sweet Child's Call step uses the Intro, not the Verse: the verse is only 7 changes in two laps, the intro
is the same D5 C5 G5 chords in 10, which is what "8 of 10" needs", the comment above `ca-48`).

**Traps:**
- `chordcall` reads the named card's own sections, "so a change to the card's chords or bars moves the drill too"
  (the same comment); the `section` is a label of that card.
- `pcname`: "a step's `maxFret` is 10 at most so the shape fits"; `board: 'all'` is ca-49 step 1 only, "pinned by 1co"
  (`SKILL.md` "Step drills replace paper").
- The drill lines are i18n strings held by **1cs** (`CAP_2C = 110`, `DRILL_DIRECTION_KEYS`); a new drill type is a
  new widget (code), not a copy.

**Tools:** the common ones; `node tools/focus-tap-diff.mjs` covers every Focus activity.

---

## 12. Exit check

**For:** the end-of-period product: five auto-graded questions, one try (`SKILL.md` "Exit checks"); about one a week.

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
- "Stored exit-check picks are POSITIONAL": once students have taken it, its `items` are frozen (`SKILL.md`).
- **1y** recomputes every answer key from the fretboard.
- A check takes no `#N`, is never pinnable, and "the student sees "Exit check · <title>"", so the title carries no
  prefix (the file's EXIT CHECKS note).
- The student card and the console preview share `caCheckBodyHtml()` on purpose: don't fork it.

**Tools:** the common ones.

---

## Fits no shape: `ca-12` Sub Day Circuit

Six steps mixing three shapes for a day with a substitute: shape 8's two drills (the same "Name the fret" and "Find
the note" steps), a tuning step with text only ("Loosen the low E string half a turn and tune it back to E in green
within 1:00, never tightening past E."), and shape 6's Happy Birthday from memory. Its intro: "Do six stops on your own,
in order: you have done all of them before." A new review circuit copies the steps it reviews from their own shapes.

---

## Inventory: all 51, by id

| id | Title | Shape |
|---|---|---|
| ca-1 | Playing Happy Birthday — The Whole Song | 6 Tab ladder |
| ca-2 | Finger Gym 1 | 7 Finger Gym |
| ca-3 | Finger Gym 2 — Down the Ladder | 7 Finger Gym |
| ca-4 | Finger Gym 3 — Up the Neck | 7 Finger Gym |
| ca-5 | Finger Gym 4 — Fingers Down | 7 Finger Gym |
| ca-6 | Finger Gym 5 — The Skip | 7 Finger Gym |
| ca-7 | Finger Gym 6 — The Meet | 7 Finger Gym |
| ca-8 | Happy Birthday — First Notes | 6 Tab ladder |
| ca-10 | Seven Nation Army — The Riff | 1 Song part card |
| ca-11 | Notes on the Low E String | 8 Note-names ladder |
| ca-12 | Sub Day Circuit | none (above) |
| ca-13 | "the cure" — Intro and Verse on the Low E | 1 Song part card |
| ca-14 | Happy Birthday — what comes next? | 12 Exit check (nextNote) |
| ca-15 | Notes on the Low E String | 12 Exit check (noteName) |
| ca-17 | Notes on the A String, Then Happy Birthday | 8 Note-names ladder |
| ca-18 | "the cure" — Intro, Verse and Chorus | 1 Song part card |
| ca-19 | "the cure" — The Verse on Two Strings | 1 Song part card |
| ca-20 | "Luna" — The Bassline | 1 Song part card |
| ca-21 | Sight-Reading TAB — Low E and A Strings | 6 Tab ladder |
| ca-22 | A String Notes — Cards and Play-Along | 8 Note-names ladder |
| ca-23 | Low E and A Notes in Time | 11 Drill ladder (notecall) |
| ca-24 | "the cure" — The Whole Song | 2 Whole-song (roots) |
| ca-25 | Seven Nation Army — The Whole Song | 2 Whole-song (roots) |
| ca-26 | All Along the Watchtower — The Whole Song | 2 Whole-song (roots, two recordings) |
| ca-27 | "Luna" — The Whole Song | 2 Whole-song (roots) |
| ca-28 | Sweet Child O' Mine — The Whole Song | 2 Whole-song (roots) |
| ca-29 | All Along the Watchtower — The Whole Song in Power Chords | 2 Whole-song (power, two recordings) |
| ca-30 | "the cure" — The Whole Song in Power Chords | 2 Whole-song (power) |
| ca-31 | Seven Nation Army — The Whole Song in Power Chords | 2 Whole-song (power, no chord grid) |
| ca-32 | "Luna" — The Whole Song in Power Chords | 2 Whole-song (power) |
| ca-33 | Sweet Child O' Mine — The Whole Song in Power Chords | 2 Whole-song (power) |
| ca-34 | "Las Mañanitas" - Ariel Camacho y Los Plebes del Rancho — A, E7 and D | 6 Tab ladder (chords, library) |
| ca-35 | "Las Mañanitas" - Ariel Camacho y Los Plebes del Rancho — Play Along | 4 Library play-along |
| ca-36 | "Madrecita Querida" - Vicente Fernández — Play Along | 4 Library play-along |
| ca-37 | "Arsenal Efectivo" - Lolo Félix — Play Along | 4 Library play-along |
| ca-38 | All Along the Watchtower — Lyrics and Chords | 3 Lyric sheet |
| ca-39 | "Ella" - Junior H — Play Along | 4 Library play-along |
| ca-40 | All Along the Watchtower in Power Chords — 1 Strum per Chord | 2 Whole-song (teacher only) |
| ca-41 | "Smells Like Teen Spirit" - Nirvana — Play Along | 4 Library play-along (`library: false`) |
| ca-42 | "Vuelve a la Vida" - Efecto Elegante — Play Along | 4 Library play-along |
| ca-43 | Power Chords on the Low E and A Strings in Time | 11 Drill ladder (notecall power) |
| ca-44 | "the cure" — Lyrics and Chords | 3 Lyric sheet |
| ca-45 | Sweet Child O' Mine — Lyrics and Chords | 3 Lyric sheet |
| ca-46 | Strum Pattern — Down, Down-Up, Up-Down-Up | 9 Strum-pattern ladder (paths) |
| ca-48 | Call the Chord | 11 Drill ladder (chordcall) |
| ca-49 | Name the Power Chord | 11 Drill ladder (notecall + pcname) |
| ca-50 | Call the Chord: "the cure" | 11 Drill ladder (chordcall) |
| ca-51 | "Perdón Mamá" - Chuy Montana — Play Along | 4 Library play-along |
| ca-52 | Strum Pattern check | 10 Strum-pattern check |
| ca-53 | Strum Pattern — The Chorus | 9 Strum-pattern ladder |
| ca-54 | Sweet Child O' Mine — Speed Ladder | 5 Speed ladder |

Counts: shape 1: 5 · 2: 11 · 3: 3 · 4: 7 · 5: 1 · 6: 4 · 7: 6 · 8: 3 · 9: 2 · 10: 1 · 11: 5 · 12: 2 · none: 1 = 51.

---

## Proposed shapes (not built yet)

Formats the 51 cards do not use yet (Jonathan, 2026-11-26, through the lead). Each was checked against the bank above
and the site's drills and games: the Games hub (`coach-*.js`: Note Hunt, Change Up, Power Chord Switch, Chord Blitz,
Chord Detective, Name That Riff, Pentatonic Simon and its guitar twin, Fret Zap, Strum Hero, Riff Roulette, Strum
Radar, Riff Runner and its Wait Mode, Note Runner, Finger Gym: The Ladder, Pattern Detective, Build-a-Chord), the Live
In-Class Games (`live-quiz.js` and its Hear the Chord Change, Higher or lower? and Saw chase), the step drills (Shuffle,
Card Deck, Ear Spark, Note Call, Call the chord, Name the power chord), Find-the-Note, and the practice card's own
switches (versions, recordings, views, Loop this part, Build up speed, the speed ladder, paths).

**The room's limits, for every proposal** (Jonathan, 2026-11-26, through the lead): the mic does not work in his
classroom, so nothing here is graded by listening: a student's playing is self-checked ("Got it" / "Again") or the
answer is a tap. Chromebook 1366×657. One direction line, verb first. Hook like a game: rounds, a streak, a reveal.

A new drill type or a new card switch is new site code. CLAUDE.md "Where the code lives" applies to all of them: a
new feature gets its OWN part (`app/<x>.js`, in `index.html`'s `site-parts:app.js` block and the `sw.js` lists), its
strings go in `i18n.js` EN and ES, its direction lines join 1cs's `DRILL_DIRECTION_KEYS`, and "a new control or
default → pin the default in `checks.mjs` and make `tools/smoke.mjs` click it and reload" ("Start here" step 4). A
drill type needs no change to the console preview: `renderTeacherActivityDetail` already draws `s.drill` through the
same dispatcher, `renderShuffleDrill` (`teacher-activities-2.js`, its drill line). Anything that touches a card's audio
"must handle `st.spare` and `st.leaving` as well as `st.audio`" (`SKILL.md`, THE SPARE), and is proved with
`node tools/playalong-loop.mjs`. Sizes: small = one part's worth of code and one check; medium = a new part, a check
and a smoke walk; large = a renderer change shared with the modules or the console, or new audio work.

### Jonathan's picks

#### P1. Echo (call and response)

**Teaches:** playing by ear, short-term musical memory, the first notes of a riff (Modules 1 to 3: single notes, then
riffs on the low E and A strings; the class's riffs are Seven Nation Army, "the cure", "Luna").

**What the student sees and does:**
1. One line: "Listen, then play it back; tap Got it when yours matched, three in a row." The tab is hidden: a row of
   empty boxes, one per note.
2. They tap ▶ Listen; the site plays a one-bar phrase in the guitar voice the tab players use.
3. They play it back on their guitar, as many tries as they like (▶ Listen again is free).
4. They tap Show me: the tab appears and plays once more with the cursor, so they can check themselves.
5. They tap Got it or Again. Three Got its in a row grow the phrase by one bar (Pentatonic Simon's growing
   sequence); the streak shows like the games' streaks. Nothing is stored but the step's tick.

**Data:** `drill: { type: 'echo', card: 'ca-10', section: 'The riff', bars: 1, grow: true }` (reads a practice card's
own section by label, the way `chordcall` reads `ca-29`'s Verse 1), or `drill: { type: 'echo', phrases: [ { notes:
[…] }, … ] }` with the step-tab note shape, for a tune with no card (Happy Birthday's lines in `ca-1`).

**Grows from:** Ear Spark (a hidden sequence, then the reveal: "The sequence is never shown before the reveal — that
hiddenness IS the drill", `app/drills.js`), Pentatonic Simon (a growing sequence, `coach-ear.js`), Riff Roulette (the
student is the judge: "Honesty is the whole game", `coach-strum.js`). None of them asks for the phrase on the guitar
with no mic: Ear Spark and Simon take taps, Simon's guitar twin needs the mic.

**Can it be built today?** A rough version from existing fields, small: a step with a `snippet` of the band and no
tab ("Listen to bars 1–2, then play them back three times in a row"), then a step with the `tab` of the same bars.
It loses the hidden-then-revealed moment and the growing phrase. The real one is a new drill type in its own part,
`app/drills-echo.js`: medium (`playSequence` already plays a list of midi notes; the tab drawing is `buildTab`'s).

**Example on a course song:** Seven Nation Army's riff from `ca-10` ("The riff", bars 1–2, all on the A string): bar 1 is
E E G E D (frets 7, 7, 10, 7, 5; the last three a triplet over beats 3 and 4), bar 2 is C B (frets 3, 2, two beats each).
Echo bar 1, then both bars, then the riff four times.

#### P2. Fill the gap (one bar left silent)

**Teaches:** keeping the beat through a stop, and owning one part of the song (any module with a practice card; first
with the single-note cards of Modules 2 and 3, later with chords).

**What the student sees and does:**
1. On any practice card, a new switch beside Loop this part: "Fill the gap". Off by default.
2. Switched on, one bar in each line of the chart is marked YOU (the cell outlined, the word over it).
3. They press Play song. The band plays, and on the YOU bar the band goes silent: only the site's Metronome click
   keeps going, and the cursor keeps moving.
4. They play that bar alone; the band comes back in on the next bar line, on time, whether they were there or not.
5. With Loop this part on, each lap moves the gap one bar later (bar 4, then 3, then 2), so the whole line gets
   played alone once.

**Data:** none required (a switch on every card, the way Loop this part needs no data). Optional per card: `card.gap:
{ bar: 4, of: 4 }` (the 4th bar of every 4) where a song's phrase calls for another place.

**Grows from:** the card's Metronome (a click the site makes, so it can keep going while the band is silent), Loop this
part and its lap count (`app/cards-loop.js`), and the Guitar toggle's idea that the student carries the part ("Record
plays it" / "You play it", skill `audio-and-snippets`). Not a duplicate: the Guitar toggle's off state "turns the part
DOWN rather than removing it" and lasts the whole song; nothing in the site silences the band for one bar.

**New code:** medium. In `app/cards.js` / `app/cards-loop.js`: the band's volume to 0 from one bar line to the next
on the playing element AND the spare, back to full on every stop, leave, section tap and speed change; the YOU mark in
both chart views (tab and chord grid) and the sheet's "This bar"; a `playalong-loop.mjs` walk that the band is silent
exactly on the YOU bar and the click is not.

**Example on a course song:** "the cure" (`ca-18`), Intro and 2 Verses (bars 1–20, a chord change every bar): the
band drops out on bar 4 of every four, so the student plays the last C of each "A C A C" line alone.

#### P3. Spot the mistake

**Teaches:** reading tab or a chord chart while listening; hearing a wrong note or chord (any module; no guitar needed,
so it also works on a day with no guitars or as a warm-up on the projector).

**What the student sees and does:**
1. One line: "Tap the note that sounds wrong; get 8 of 10." The tab of a riff (or a chord chart) is on screen, as
   written.
2. They tap ▶ Play; the site plays it with ONE note changed (a fret or two away on the same string), or one chord
   swapped.
3. They tap the note (the column) or the bar where it went wrong. Right: the column flashes green and the wrong and
   right notes both play. Wrong: the right column is shown.
4. Ten rounds, a streak, a pass line under Start ("8 of 10", the shape `chordcall` uses).

**Data:** `drill: { type: 'spot', card: 'ca-10', section: 'The riff', rounds: 10 }` for notes; `drill: { type:
'spot', card: 'ca-29', section: 'Verse 1', chords: true, rounds: 10 }` for chords. The wrong note is made at random by
a rule in the code (same string, one or two frets away, never the same pitch), so no answers are typed into the data.

**Grows from:** Pattern Detective (one bar shown, one played, "match / no match", `coach-more.js`) and Chord Detective
(a chord by ear). Not a duplicate: Pattern Detective judges a whole strum bar yes or no; this asks WHERE, on a song's
own tab, which is the skill of following the page. `chordcall` already reads a card's sections (`ca-48`).

**New code:** medium: a new drill type in its own part, `app/drills-spot.js` (`playSequence` for notes,
`strumChord` for chords; each tab column already has a note-name button under it, the file's `finger` note). A Live In-Class Games
version for the projector later is a further, larger step (`live-quiz.js` and its rule that nothing on the stage
reveals the answer, `.claude/rules/live-quiz.md`).

**Example on a course song:** `ca-10`'s riff, frets 7 7 10 7 5 3 2 on the A string; a round plays 7 7 10 7 **6** 3 2
and the student taps the fifth note. For chords: Watchtower's Verse 1 from `ca-29` (A5 G5 F5 G5) played with one G5
as an A5.

#### P4. Memory fade

**Teaches:** playing a part from memory (any module; best on a short loop the class already knows).

**What the student sees and does:**
1. On a practice card, a new switch: "Fade the tab". Off by default; switching it on turns on Loop this part.
2. Lap 1: the whole chart shows.
3. At each new lap, one more bar's fret numbers (or chord names) fade to a "?" box, from the end of the line back to
   its start, while the cursor keeps moving over the empty boxes.
4. When every bar is faded they play one more lap from memory; the card then says "From memory!" (a small
   celebration, as the games have).
5. Peek (or a tap on a box) shows that bar again for one lap.

**Data:** none required (a switch). Optional `card.fade: { from: 'end' | 'start' }`.

**Grows from:** Loop this part and its lap count (`app/cards-loop.js`), and `revealDelay`, the only hide the site has
today ("it hides the board while the student reads the step", the file's schema note; it hides the whole tab once,
before playing). `ca-12`'s "Cover the screen and play all four lines of Happy Birthday from memory without stopping."
is the paper version of the same idea.

**New code:** small to medium: a class per bar cell, set from the lap count, in both chart views (tab, chord grid);
Peek; a smoke walk; a `playalong-loop.mjs` walk that a faded cell is still lit on time. The Focus ladders' tabs
(`buildTab`, shared with the modules) are NOT in scope: that would be a large shared-renderer change.

**Example on a course song:** "Luna" (`ca-20`), "The loop · F F A A · 1 pluck per bar", 4 bars × 4 laps: lap 1 shows
all four, lap 2 hides bar 4, lap 3 bars 3–4, lap 4 bars 2–4, then a lap with all four hidden.

### More proposals

#### P5. Duet (partner split)

**Teaches:** playing your own part against another part (Module 3 on: roots against power chords). Two students, one
track: one plays the roots, the other the power chords. **Data-only version today (small):** two cards that share
their sections bar for bar already exist, `ca-24` (roots) and `ca-30` (power chords), "the cure", 10 sections with the
same `fromBar` / `bars`; the pair opens one card on ONE Chromebook and each reads their own part (a step or card intro
says who plays what). **Built version (large):** a "Duet" view stacking the two parts' charts under one cursor —
`otherViews` already shows another view of the same sections, but one at a time; two at once is a renderer change, and
the height at 1366×657 is tight. Grows from `otherViews` (`app/cards-views.js`). Nothing in the bank or the games puts
two parts on one screen.

#### P6. Song-form arrange

**Teaches:** a song's form (intro, verse, chorus, bridge) and listening for sections (Module 2 on, with the Core
songs). Tiles with a song's section names come up shuffled; ▶ on a tile plays its first two bars from the record; the
student taps them into order, then Check; then "Play it" opens the whole-song card. **Data:** `drill: { type: 'form',
card: 'ca-24' }` (the card's own `sections`, labels and bars). **New code:** medium, a drill type in its own part
(snippet windows are bars, so a tile's two bars come from `fromBar`). Grows from `chordcall` (reads a card's sections)
and Build-a-Chord (place, then Check). Nothing existing asks for a song's order.

#### P7. Make your own loop

**Teaches:** chord changes in a progression the student chose (Module 3 power chords, Module 4 open chords). Four
empty bars and a row of chord buttons the class knows (`D5 C5 G5 A5`); the student fills the bars, presses ▶ Play
strum and plays along, then changes one bar and goes again; a partner can try their loop. **Data:** a `strum` step with
`pick: ['D5', 'C5', 'G5', 'A5']` in place of fixed `bars`. **New code:** small to medium, but `buildStrum` (`app/tab.js`)
is shared with the modules and the console preview (1d pins both renderers), so it is a shared-renderer change. Grows
from `ca-53` / `ca-46` (the strum board already plays a chord per bar). Not a duplicate: every strum board today has
fixed `bars`.

#### P8. Improvise over a loop

**Teaches:** soloing with the A minor pentatonic box (Module 5, Pentatonic). The band loops one section; the box is a
tab run; the student plays any notes from the box and ends each lap on A. **Data-only version today (small):** a tab
step with the box (`PS_NOTES` in `coach-ear.js` is "one octave of Am pentatonic Pattern 1 at fret 5") and a `snippet`
of the band's bars, the pairing `ca-34`'s requinto steps use; the song must fit A minor pentatonic (skill `song-facts`;
ask Jonathan). Activities carry no figures (**1d** errors on `figure`), so the box is shown as tab, not a diagram.
**Closest existing:** the Journey pages' Layer 5 (Pentatonic Solo) and the Songs tile's "Backing track for solos";
this only brings it into an activity with the record looping the bars, so it is the least new of the eight.

### Top 3 to build first (my view)

1. **Memory fade (P4).** The smallest code of the four picks, no new data, and it turns all 27 practice cards into a
   memory game at once (25 of them have more than one section, so Loop this part is already there).
2. **Fill the gap (P2).** Also a switch on every existing card with no new data; it reuses the Metronome and the lap
   count, and gives each student "their" bar, the most game-like of the four in the room.
3. **Spot the mistake (P3).** Works with no guitar in hand and is tap-graded, so it is the one proposal that gives a
   real score without the mic; it reads the cards' sections, so every song the class knows is content on day one.

Where this differs from Jonathan's picks: **Echo (P1)** is not in my top 3. Without the mic its check is the
student's own word, which Riff Roulette and Ear Spark already cover in spirit, and the rough version can be built
today from a `snippet` step and a `tab` step with no code, so it can be tried in class before any code is written.
