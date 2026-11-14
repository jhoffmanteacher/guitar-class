---
name: new-playalong
description: The recipe for a new Play Along song made from an mp3 Jonathan uploads (a student asked for a song, a supplementary play-along, "make a play-along from this mp3", "new play-along", "play along for <song>"). Measure the record, write the card with tools/new-playalong.mjs, level, audit, check, ship. Read BEFORE adding a song track or a play-along card.
---

# A new Play Along song from an mp3

The rules live in skills `audio-and-snippets` (tracks, levelling, `beat-audit.py`, `playalong-loop.mjs`),
`in-class-activities` (practice cards, the Songs page library, one-line directions) and `song-facts`. This file is
the order of work and the commands. History it is built on: ca-37, ca-39, ca-41, ca-42, ca-51 and their fixes.

**Where the audio lives:** every new song is PRIVATE, behind the sign-in (Jonathan, 2026-11-13: "every new song
from now on"; design in the header of `app/songfiles.js`). Build with `--private` (step 4): the two re-encoded copies
(record speed and slow) go to the private song folder on his Mac (`~/Documents/guitar-class-song-files/`, or
`GC_SONG_FILES_DIR`), never into `audio/`; the track's paths are `private:<slug>-<bpm>`; both files go on the
`SONG_FILES` list in `app/songfiles.js` (name, size, SHA-256, length) through `tools/song-files.mjs`, and checks.mjs
1dz's `SONG_FILES_PIN` goes up by 2. `loudness.py` and `beat-audit.py` read the private folder by themselves; on
GitHub and in a worktree without the folder, `checks.mjs` works from the list. Before the push (step 6): Jonathan
uploads the two files in the console (Manage → Song files) and presses **Verify**; push only once Verify says both
match (until then a student's card says the song can't load). `node tools/song-files.mjs` prints the list and
whether the folder's copies match. The backing and jam tracks stay public in `audio/` (no `--private`).

## 1. Inputs: ask once, in one message, only for what is missing
- The mp3's path, the song and the artist (as the title should read: `"<song>" - <artist>`; ca-37 was renamed twice
  because the song and the band were swapped, so read them back to him).
- The chords: a chart as text, a photo or a PDF (read a PDF with the `pdf` skill, a photo with Read). If they came
  from a picture or from memory, send the chord list back as one short list and wait for "yes" before building:
  never invent a chord. A Moises chart's sevenths (C#m7, Amaj7) fold into the plain chord; say so in the list.
- The level: power chords (Module 3) or open chords (Module 4). It picks `versions` in the spec (step 4).
- A capo or a key change, if any. Which part of the song: whole song (the default) or named sections.

## 2. Measure the record (about 1 minute)
`python3 tools/playalong-measure.py <upload.mp3>` (ffmpeg and numpy; scipy is not needed). Read, in order:
- **TUNING** over 10 cents: put `"cents": <n>` in the spec (both files are shifted; Arsenal Efectivo, 14 cents).
- **STEADY**: a steady grid goes on. A free-time ending: end the last section before it. Drifting mid-song: STOP
  (below).
- **METER EVIDENCE**: the bar is the grouping whose `chg` spread is the largest (the chords change on one pulse of
  it), checked against the low hits. Then the meter: 4/4, 3/4, or 6/8 (`--pulses-per-bar 6` on an eighth-note
  pulse, `3` on a pulse of two eighths). **If both 3/4 and 6/8 fit, ask Jonathan** (he picked 6/8 for Perdón Mamá
  after the first build counted it in 4: review MAJOR, 2026-11-10).
- Run again: `python3 tools/playalong-measure.py <upload.mp3> --pulses-per-bar N --meter M`. It prints beat 1, the
  ANCHOR (the first LOUD beat 1, never the first onset: Perdón Mamá's first build anchored on a near-silent lead-in),
  the SNIPPET_TRACKS numbers and a voice-band strip per bar. "CLOSE" on beat 1: the loop's first chord should start
  on it; `--beat1 K` takes another pulse. A pulse within 0.01 of a whole number is written as one (`"230 / 3"`).
- **Sections** are your call, on laps of the loop: band alone vs singing from the strip, named Intro, Verse N,
  Interlude, Solo, Ending. A one-beat chord the chart does not have is a bass walk, not a chord (ca-51's "A").

## 3. Stop and ask Jonathan when
- **The record drifts mid-song** (STEADY past 30 ms before the ending). It needs a beat map (`barTimes`): the
  repo's `tools/beat-map.py` needs a Moises export with the click on, and librosa (used for Teen Spirit) is not
  installed. Ask for that export, or for a Moises export of the record at a steady tempo.
- **A chord the level has not taught.** What each level teaches: Module 3 power chords, Module 4 open chords,
  Module 7 barre chords (`MODULE_MANIFEST` in `config-main.js`); the site's chord pop-ups are `CHORD_NAMES` in
  `app/snippets.js` and `CHORD_DIAGRAMS` in `guitar-diagrams.js`. A barre chord at the open-chord level is the
  normal case: build `"versions": "both"` opening on power chords (ca-39, ca-51). Stop only for a chord with no power
  chord (a diminished, a sus that matters) or a key that needs a capo the card cannot show.
- **A tempo change, or a pickup the bar model cannot hold** (a bar of 2 in a 4/4 song, an intro at another tempo):
  the steady grid cannot hold it. Start the card after it (`fromBar` past it, as Vuelve a la Vida skips its
  free-time ending), or ask for a Moises click export to build a beat map.
- **`beat-audit.py` cannot tell on more than 75% of the card's bars**, or counts any line it cannot settle with one
  anchor shift. History (record-speed file, 2026-11-13): the five uploaded records on the site read 13% "cannot
  tell" (Vuelve a la Vida, 23 of 175 bars) to 73% (Arsenal Efectivo, 103 of 142, a requinto record), all with no
  counted line. Past 75%, ask Jonathan to listen with `?snipcal=1` before it ships.

## 4. Write the spec, then let the tool type it (about 5 minutes)
A JSON file in the scratchpad; `perdon-mama.example.json` beside this file is a filled-in one (its header in
`tools/new-playalong.mjs` lists every field). `versions`: power-chord level → `"power"`; open-chord level →
`"both"`, `chordStart: "power"` unless every full chord is an open chord the class knows.
1. `node tools/new-playalong.mjs <spec.json> --dry-run`: read the chord positions it picked (smallest hand move;
   override in `shapes` / `powerShapes`), the card and the track.
2. `node tools/new-playalong.mjs <spec.json> --from <upload.mp3> --private`: makes the two mp3s (320k, tags and cover art
   dropped; the slow file is `rubberband` tempo slow/record, pitch held) in the private folder, puts them on the
   `SONG_FILES` list, and writes the track, the card
   (`library: true`: on the Songs page's "More Play Along songs" for EVERY student from the push; no board slot or
   date), the next id, the pins in `tools/checks.mjs` and `tools/playalong-loop.mjs`, and a CHANGELOG draft.
   A class activity instead (`"library": false`) arrives on the board's Built list, invisible until he assigns and
   dates it; a number in its title is a series number.

## 5. Level, audit, check (about 15 minutes, mostly waiting: loudness.py 7, checks.mjs 3 to 7)
1. `python3 tools/loudness.py <fileSlug>` (the file prefix before `-backing-`, not the track key). One gain for both
   files; a slow file outside ±1 LU needs `--accept-spread`, which is Jonathan's call: ask (Vuelve a la Vida, Ella
   and Las Mañanitas shipped with it). A private song is levelled in the private folder and its two list entries are
   rewritten (the bytes change), so level BEFORE Jonathan uploads; a re-level after an upload means uploading again.
2. `python3 tools/beat-audit.py --only <slug> --cache <scratch>/bacache` (a Choice song gets the light pass: report
   the counted lines; leave WEAK lines and "cannot tell" bars). A counted CONSTANT or BEAT 1 line: move `anchor` by
   what it says, then put the new pin in `CLOCK_PINS` (`node tools/playalong-loop.mjs --pins`, the song's line)
   and run the audit once more. A STAGE 2 section a bar off: move the section edges or `loopFrom`.
3. `node tools/checks.mjs` (it writes the audio hashes and the cache version into `sw.js`; never by hand). A pin it
   names that only the new card moved (for example `CHORD_GRID_HELD_LABELS`) is updated with the reason; anything
   else is a real failure.
4. `node tools/playalong-loop.mjs --only <id> --shots <scratch>/shots` (Chrome for Testing through `CHROME`; one
   browser run at a time on the Mac) and look at every PNG: the card at 1366×657 in each chord view.
5. Read the CHANGELOG draft and put it in the student's words (what they can now do, where it is).

## 6. Ship (Fast) and report
A private song first: Jonathan uploads both files in the console (Manage → Song files: Upload, then Verify); push only
after Verify says both match the list. A new song is not a danger-zone change: commit with the `Review: Fast` trailer, then CLAUDE.md "Start here" step 8
(fetch, rebase, full checks on the tip, push, `node tools/checks.mjs --live`). GitHub's Browser tests then run the
English smoke and the whole `playalong-loop.mjs` (class-activities.js changed): read the result and report it.

Tell Jonathan, in plain words: the card id and where it is (Songs → More Play Along songs, live for everyone now;
the console's Songs view hides it), the chords and the bars of each section, the measured tempo and meter, and what
to listen for with `?snipcal=1`: the first dot on the first loud chord, the chord names changing with the record at
each lap, the count-in feeling like the song. The clock pin was set from the measurement and the audit, not from
his ear; if it sounds off, the anchor moves and the pin with it.
