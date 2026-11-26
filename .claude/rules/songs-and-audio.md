---
paths:
  - "class-activities.js"
  - "app/songfiles.js"
  - "app/songhelp.js"
  - "app/builtsongs.js"
  - "app/snippets.js"
  - "app/cards*.js"
  - "app/audio-ui.js"
  - "tabs/**"
  - "audio/**"
  - "tools/loudness.py"
  - "tools/beat-audit.py"
  - "tools/new-playalong.mjs"
---

## Backing tracks, song files, built songs

Moved from CLAUDE.md (2026-11-26). Read skill `audio-and-snippets` before touching backing tracks, snippets, card
audio, Journey clicks, `playNote` or `audio/`; skill `new-playalong` before a new Play Along song from an mp3.

- **Audio (skill `audio-and-snippets`):** snippet windows are bars, never seconds; never measure a second anchor;
  never pitch-correct one mix alone; a new "silence it" call → `stopCardAudio()`. Every backing track is levelled to
  "the cure" (−12.5 LUFS) with `python3 tools/loudness.py <slug>`, one gain per song; never re-level the cure (1do).
- After a timing or track change: `python3 tools/beat-audit.py --only <slug>`. It only lists; its "cannot tell" bars
  and card sections under 4 bars still need ears.
- After any change to a practice card's chart, to `SNIPPET_TRACKS`, or to the player in `app/cards.js` /
  `app/cards-sheet.js` / `app/snippets.js`: `node tools/playalong-loop.mjs` (`--only <id>` for one card; headless
  Chrome) and report its summary line.
- **A new Play Along song (skill `new-playalong`):** measure the record first (`python3 tools/playalong-measure.py
  <mp3>`): bar 1 is the first LOUD beat 1; the meter comes from the chord changes (3/4 or 6/8 when both fit: ask
  Jonathan); a chord comes from his chart only (read a picture's chords back to him first). `node
  tools/new-playalong.mjs <spec> --from <mp3>` types the card, track and pins. A `library: true` card is live for every
  student on push; a BUILT song (an Import file, Manage → Built songs) goes live when Jonathan imports it, with no push.
- **Private song files** (`app/songfiles.js`; the 18 practice-card files moved to them on 2026-11-17): the loader for a `private:<id>` track (pieces from Firestore
  `songFiles`, checked against the tracked list `SONG_FILES`, a copy kept in IndexedDB, the month's download count in
  `songFilesUsage`: the count guards honest use only, rules cannot count reads). After any change: `node
  tools/song-files-sim.mjs`. The Journey pages cannot play a private song yet (1dx).
- **Built songs** (`app/builtsongs.js`): a Play Along song kept in the database (`builtSongs/{id}`,
  `builtSongsMeta/list`); the validator `builtSongCheck()` runs on every page, in the console and in
  `tools/built-song-check.mjs`; the merge after sign-in is `builtSongsSync()` (started in `app/start.js`). With no built
  song it changes nothing. After any change: `node tools/built-songs-sim.mjs` (1em).
- **The song help pop-up** (`app/songhelp.js`, 1fe): "Clear saved songs and reload" never reloads over unsaved work.
