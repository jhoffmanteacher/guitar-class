---
name: audio-and-snippets
description: Rules for the guitar site's audio: backing-track snippets (SNIPPET_TRACKS, anchors, barTimes beat maps, buildSnippet, Guitar/Metronome toggles, Slowest), practice-card audio, Song Journey page clicks (data-click-bars), stopCardAudio vs stopAllDemoAudio, recorded guitar notes (playNote), and audio/ file naming and exports. Read BEFORE touching any of these, adding a song or track, or wiring a snippet.
---

### ⚠️ A backing-track snippet is bars, never seconds
A step that drills four or eight bars can loop THOSE bars of the real
backing track: `snippet: { track:'the-cure', fromBar:5, bars:8, label,
label_es }` on the step, beside its `tab`. It is content, not code: a window
of the same mp3s the Journey page uses (sw.js serves byte-Range requests for
`audio/`), so no new files and no export.

Count the window in **bars of the song, from bar 1, at the FELT pulse the
course teaches** ("the cure" reads 144 BPM, the room counts 72, one chord per
bar). Bar maps and measured section starts are in skill `song-facts` (the cure:
chorus from bar 21; bar 13 is the second verse). Place any other window by
measuring the mp3, never by a Journey page's song map (a section list, not a bar
grid). Make the window agree with the step's own
tab: an eight-bar tab wants an eight-bar window, or the loop comes round
mid-phrase and the student concludes they're the one who's wrong.

`SNIPPET_TRACKS` in `app.js` holds the mp3 paths, the tempo arithmetic and
**one measured number per song: `anchor`, the track's first downbeat**.
Everything else is derived. The slow tier is the same master time-stretched,
so its grid is the fast file's scaled by `trackBpm/trackBpmSlow`. **Never
measure a second anchor.**

**Live-band tracks carry a beat map — `barTimes`.** The straight grid only
holds for a track made to a click ("the cure", Luna); Sweet Child, the Hendrix
Watchtower and Seven Nation Army drift up to half a beat by mid-song.
- Let It Be has no `SNIPPET_TRACKS` entry (no slow tier, full mix or beat
  map), so it cannot carry a snippet or a practice card. Jonathan, 2026-10-01:
  leave it, he may not use the song.
- The band entries list every bar's downbeat (fast file, seconds) in
  `barTimes`, with `barTimes[0]` = `anchor`. `snippetWindow()` reads windows
  off the list; the slow tier is the fast times scaled by the tempo ratio.
- Measure with
  `python3 tools/beat-map.py <rhythm-down.mp3> <rhythm-down-metronome.mp3> <bpm> <downbeat-click>`
  (needs ffmpeg, numpy, scipy). Moises clicks every beat alike, so WHICH click
  is beat 1 is a musical call: pick it from the song's chord changes, never
  assume the first click.
- 1ak checks the list against `anchor`, the nominal bar and `durationSec`,
  and refuses a window past the last measured bar.
- The same tool prints a steady track's `anchor`. Paste it in and flip
  `anchorVerified`; checks.mjs 1ak warns on every push until it's true.
- **The metronome file it reads is a measuring input, not a site file**: one
  Moises export of the fast rhythm-down mix with the click on, kept in Drive
  or a scratch folder, never committed. checks.mjs 1bk fails any metronome mix
  in `audio/` but Let It Be's.
- `?snipcal=1` on the URL gives a snippet card a live timecode for checking a
  number by ear.

**The param is matched anywhere in `location.href`** by a delimiter-anchored
regex, not parsed out of `location.search` (it may sit in the fragment or
after a second `?`), and captured once at load. **The panel is NOT
localhost-gated**, unlike the dev bypass and `__forceGate`: it only shows a
number, and the anchor has to be measurable on the deployed site.

**The bar dots run ~80 ms behind `audio.currentTime`** (`SNIP_OUTPUT_LATENCY`,
a constant: currentTime is the decoder's position, not the speakers');
`?snipcal=1&lat=<ms>` overrides it live. It shifts the DOTS only; the loop's
seek stays on the true decoder position, or every lap would clip its last
buffered milliseconds.

**The dots still lead the beat slightly at 80 ms. That is correct — don't
"fix" it** (Jonathan, 2026-09-18: "slightly early, but in an accurate way"):
a player needs the visual cue before the sound. Raising the constant until the
dots sit dead on the beat makes it worse. Watch instead whether the lead is
CONSTANT across the four dots: a growing one is a wrong `win.bar` for that
song, not latency.

One builder, `buildSnippet()`, is called by `caStepHtml()` (app.js) and
`renderTeacherActivityDetail()` (teacher.js), the same shape as `buildTab()`:
that is how a step field satisfies the two-renderers rule without two copies.
1ak pins both calls **inside the function body and with comments stripped**
(a comment naming the function must not count).

Only one thing plays at a time: starting the band calls `stopAllDemoAudio()`,
and `playSequence()` calls `snipStop()`.

**Two silencers, and picking the wrong one takes the student's metronome
with it.**
- `stopCardAudio()` stops what the SITE is playing at a card's request: tab
  player, backing-track loop, chord strums, ear drill.
- `stopAllDemoAudio()` is that plus `stopMetro()`. The FAB metronome is a
  tool the student started themselves, with its own Start/Stop, that no card
  owns.

The full sweep is only for the two cases that earn it:
- **the mic is about to open** (every coach.js site; fab-tools.js when the
  tuner opens);
- **the site is about to play something that has to be heard clean** (a tab
  sequence, a snippet, an exit-check stimulus).

A plain "mark this done" is neither, and **nor is leaving a screen**:
`caMarkStepDone()`, `caToggleComplete()` and `caClosePanel()` use
`stopCardAudio()`, and the lesson-step path (`onCompleteChange()`) never
takes the metronome either. `fab-tools.js` draws the same
line for dismissing a popup, so nothing in `app.js` should be stricter. The
full sweep has exactly six callers in `app.js` (`snipToggle()`, `erPlay()`,
`ncStart()`, `pcStart()`, `ecPick()`, `chcStart()`, all "about to play"), plus the mic-opening ones in `coach.js` and `fab-tools.js`.
New "silence it" call site → default to `stopCardAudio()`.

**Which tempo a card OPENS on is per track — `defaultSlow` in
`SNIPPET_TRACKS`.**
- `"the cure"` sets it (Jonathan, 2026-09-19): 29 of its steps say play at 60
  BPM, and its slow tier IS 60 (feltBpm 72 scaled by 120/144).
- Seven Nation Army deliberately does NOT set it: its slow tier (100) matches
  no "play at N" line (taught 123).
- `buildSnippet()` writes `data-slow` (what the engine reads) AND the
  turtle's `aria-pressed`/`.on` (what the student sees) from the one value.
  Write only one and the button lies about what is playing.
- Nothing persists the tier: this is the state on every render, preview
  included.
- checks.mjs 1ak requires a boolean and refuses `true` on a track with no
  `srcSlow`.

**The Guitar toggle** (Jonathan: students should hear the part and check
themselves). A track may declare `srcFull`/`srcFullSlow` beside its
rhythm-down paths; the card then grows a third toggle, **on by default**: the
record plays the part; turn it off and carry it yourself.
- **Its label names who is playing, and flips with the button**: "Record plays
  it" / "You play it", not "Guitar". The off state is the rhythm-down mix,
  which turns the part DOWN rather than removing it, so "Guitar" would promise
  a mute it cannot deliver (on "the cure" the press sounds like nothing
  happened). `snipGuitarLabel()` is the one relabeller.
- Optional per track, both tiers or neither: a song with no full mix is a card
  with one fewer button, never a broken one. checks.mjs 1ak fails a
  half-declared pair, and a declared path whose file isn't there.

**The Guitar toggle never reloads a file while the twin is ready** (Jonathan,
2026-10-26: "a delay when I toggle the guitar"): a reload of the other ~14 MB
mix goes quiet until it buffers.
- THE TWIN (`twinPark` / `twinFollow` / `twinReady` / `twinSwap`, beside
  `snippetSrc()` in `app.js`) keeps a second, muted element on the OTHER mix
  of the tier now playing, in step with the audible one. The toggle swaps
  which is muted.
- Both engines use it: `snipState` (snippet cards) and `pcState` (practice /
  Play Along cards; `pcRetrack` tries the swap before the reload).
- The twin loads only once the main element is `playing`, and **up front
  only for the teacher** (`twinWanted()`; Jonathan 2026-10-26: both mixes on
  every first play is too much for one classroom Wi-Fi). A student's first
  Guitar press takes the reload path (a short gap) and marks the card
  `data-twin`; later presses are instant.
- A failed swapped-in twin stops the card (`twinPark`'s `onLost`).
- It follows by playback RATE (a seek on an mp3 lands late), and is never
  trusted until `twinReady()` (right file, playing, buffered, within 60 ms);
  otherwise the reload path runs. A speed switch (Slow/Slower) still reloads;
  the twin is re-parked on the new tier.
- **Whoever owns the state must stop the twin on every exit** (`twinStop`;
  `snipStop` and `pcStop` do).
- The Song Journey player (`ensurePlayer` in `tabs/journey.js`) still
  reloads; it has no app.js, so it needs its own port.

**Metronome and Guitar are independent on every track, because the
Metronome is not a file.**
- All four metronome fields are gone from `SNIPPET_TRACKS`
  (`srcFullMetronome`/`srcFullSlowMetronome` among them); 1ak fails one that
  comes back.
- `snipScheduleClick()` clicks the counted beats of the snippet's own window,
  as a practice card's `pcScheduleClick()` does, so it follows the beat map on
  a live-band track.
- `snippetSrc(track, slow, guitar)` has no `metro` argument. checks.mjs 1bk
  fails a caller still passing four, which would shift `guitar` out and play
  the rhythm-down mix with the Guitar button lit.

**Every Song Journey page but Let It Be makes its own click.**
`ensurePlayer()` in `tabs/journey.js` schedules the click on an AudioContext.
Two ways to declare it on `#playalong-frame`:

- **A steady track** ("the cure"): `data-click-anchor="0.565"` (the snippet
  `anchor`) with the COUNTED tempos in `data-bpm="72" data-bpm-slow="60"`.
- **A band that drifts, or a track with an intro at another tempo**:
  `data-click-bars` — every bar's downbeat on the fast file, the same numbers
  as `SNIPPET_TRACKS[<slug>].barTimes` — plus `data-click-beats` (clicks per
  bar, the loud one on the downbeat). The slow tier is the list scaled by
  `data-bpm / data-bpm-slow`. Nothing clicks before the first listed downbeat
  or after the last. Luna is a steady track that uses this form anyway: four
  intro bars at 120 BPM, then the vamp from `anchor`, six clicks a bar.

The page lists are hand-kept copies (those pages have no `app.js`).
checks.mjs **1bk** compares them to `SNIPPET_TRACKS` number for number, pins
the count of pages making their own click, refuses a page that does both,
and fails any metronome mix in `audio/` except the one on
`METRONOME_MIXES_ALLOWED`. **Re-measure a track's beat map and you must
re-copy its page's `data-click-bars` in the same edit.** The page click is
evenly spaced inside each measured bar: about 6–14 ms average from the old
baked-in click on the fast files, 53 ms at worst (2026-10-01).

**Let It Be is the one page still swapping to a metronome FILE**
(`data-audio-metronome`, one mp3); it has no beat map. If it stays in the
course: measure it, give it `data-click-bars`, delete the file and empty
`METRONOME_MIXES_ALLOWED`.

**All five snippet tracks have their full mix.** A new snippet song needs
two `full` files, one per tempo, and a `srcFull`/`srcFullSlow` pair in its
`SNIPPET_TRACKS` entry; 1ak warns the count of tracks without one.

**Export it from the same Moises project with the stems up**: same tempo, no
count-in, no re-trim, no transposition. 1ak fails a full mix more than 0.25 s
off its rhythm-down twin: two mixes of one take have to be one length, and a
re-trim is the one failure nobody can hear (each file plays fine; the toggle
just jumps the loop). Correct pitch by SHIFTING, never resampling (see
below).

## Guitar notes — every Play button is a recording
Every pluck the site makes (TAB Play buttons, chord strums, the ear and shuffle
drills, game rewards, Riff Runner's "Hear it") goes through `playNote()` in
`app.js` (Jonathan, 2026-10-01: the synth "doesn't sound like a guitar").
`playNote()` plays a RECORDED steel-string acoustic note:
`audio/guitar-note-<midi>-<note>.mp3`, one per semitone from 40 (low E) to 74
(D5), listed in `GUITAR_NOTE_FILES`. Outside that range it re-pitches the
nearest file (only Module 9's top E5 today). Steel acoustic on purpose: it's
what the class set (ADM starters) sounds like.

- **Source:** University of Iowa Electronic Music Studios samples (free to
  use) via tonejs-instruments (MIT): mono 96 kbps, trimmed to the pick,
  -21 LUFS over the first 0.8 s, ≤ 3 s with a fade, within ±5 cents of A=440.
  **Re-cut any replacement the same way**, or it jumps out of every line.
- **Karplus-Strong (`ksPluckBuffer`) is the fallback, not dead code.** A
  note whose file hasn't downloaded plays the synth. The first tap anywhere
  starts all 35 downloads (`warmGuitarNotes()`). `playSequence()` waits up
  to `GUITAR_NOTE_WAIT_MS` (1.5 s) for its own line's notes, else plays the
  whole line on the synth; it never switches voice mid-line. A failed
  download isn't retried for 30 s.
- **`playNote()` is the only door.** Riff Runner (`rnPluckAt` in coach.js)
  calls it too. checks.mjs **1bj** fails a second `ksPluckCached(` call in
  app.js or any in coach.js.
- **`playSequence()` damps the previous note** when the next one sounds
  (25 ms time constant), or three-second notes turn a line into a wash. A held
  `{ midi, beats }` note still rings its full length, the last note rings out,
  and a Stop press damps everything.
- They are in `audio/`, cached like any track (see "The audio cache"): adding
  one changes the `AUDIO_HASHES` block in `sw.js` (`node tools/checks.mjs`
  writes it) and evicts nothing; re-exporting one evicts just that file.

### The audio cache (`sw.js`)
All backing tracks and notes live in ONE cache, `AUDIO_CACHE`, that never
changes name. `tools/checks.mjs` writes a hash per file in `audio/` into
`sw.js` (`AUDIO_HASHES`); a record per stored file (`AUDIO_HASH_CACHE`) says
which hash it was stored under; at activate the worker evicts a file whose
record differs or whose file is gone. A stored track is served as it is and
never refetched.
- **Never rename `AUDIO_CACHE` or `AUDIO_HASH_CACHE`.** Both names are pinned in
  `tools/sw-audio-map.mjs`; renaming either purges every student's tracks.
- **`AUDIO_MIGRATION_FP`** adopts the tracks students already hold, once, and is
  only true of the audio tree in `AUDIO_CACHE`'s name (`ff9e913a6d`). The first
  push that changes `audio/` must set it to `''` — **never to audio/'s new
  fingerprint** (check 1ce and `syncAudioHashes` fail that). The "already
  adopted" marker lives in `AUDIO_CACHE`, not next to the records.
- **Rolling `sw.js` back past this scheme is not free.** The worker it replaced
  deletes every cache it does not know when it activates, so it deletes the
  records and keeps the tracks. If `audio/` changed in between, it then serves
  tracks the server no longer has, with no network request, until a later
  deploy changes that file's hash. After any rollback, edit the OLD worker's
  `AUDIO_CACHE_VERSION` by hand (a new name) before it deploys.
- **Tools:** `node tools/sw-audio-proof.mjs` runs the real `sw.js` against a
  stand-in cache and breaks it 21 ways; check 1ce pins its totals.
- Adding a track while editing code in the same turn: the Stop hook blocks on
  "audio hash map in sw.js is stale" until the full `node tools/checks.mjs` has
  written the block. That is intended; run it.

## Backing tracks

`<artist-slug>-<song-slug>-backing-<key>-<bpm>bpm-<tuning>hz-<mix>.mp3`, lowercase
kebab-case; the artist stays out of the app's display metadata.

**What ships is `rhythm-down` and `full`, at each tempo a song has — and
no metronome mix.** That is 22 files: four each for Seven Nation Army, "the
cure", Luna, Watchtower and Sweet Child (`rhythm-down` and `full`, at two
tempos), and two for Let It Be (`rhythm-down` at 71, and its one leftover
`rhythm-down-metronome`).
- The naming doesn't apply to the 35 one-shot `guitar-note-*` files.
- Every slow tier is the same master time-stretched, so its grid is the fast
  one's scaled by the tempo ratio.
- `no-gtr`, `drums-only` and `slow-<bpm>` have never existed in `audio/`.
  List the folder before citing a mix as available.

**For a NEW song Jonathan exports four files**: `rhythm-down` and `full`,
each at the record tempo and at the slow tempo, same Moises project, no
count-in, no re-trim. The site needs nothing else. **One exception, never on
the site:** to place the bars, Claude needs ONE extra export, the record-tempo
`rhythm-down` with the click on, as the measuring input for
`tools/beat-map.py`. Ask for it when wiring up a new song, measure, and leave
it out of the commit. Don't ask for other metronome variants, and don't tell
him a song is "missing" its metronome files.

**Every backing track plays at the loudness of "the cure"** (Jonathan's
standing rule, 2026-10-25; CLAUDE.md states it). **A new song is levelled with
`python3 tools/loudness.py <song-slug>` before it ships.** The slug is the
file name up to `-backing-`; `--dry-run` writes nothing. The reference
(the cure's 144 BPM full mix, about -12.5 LUFS) is measured fresh each run.
Nothing moves into `audio/` unless every file passes: loudness, both peaks ≤ -1 dBFS on the
DECODED mp3, length within 0.05 s, first 40 s cross-correlated under 10 ms,
so `anchor`, `barTimes` and `data-click-bars` still hold. What it encodes:

- **One gain per SONG**, from its record-tempo full mix (else its
  rhythm-down mix), on every file (both tempos, mixes and keys), so the Guitar
  toggle keeps its balance; a rhythm-down mix is quieter on purpose. A file
  outside ±1 LU is reported (`--accept-spread` writes it anyway), never given
  its own gain. Ask Jonathan.
- **Never re-level "the cure"**: it is the target; the tool refuses it.
- **Gain and a -1 dBFS limiter, nothing else**: no resample, no pitch
  change, no trim, same bitrate and sample rate. A clipped record may need a
  lower ceiling for its TRUE peak; the tool finds it. A song already
  re-encoded once is levelled from the earlier bytes (`--source-ref <commit>`).
- ⚠️ **ffmpeg's `alimiter` has `level` ON by default**: it normalises the
  output back up toward full scale and silently undoes the gain. It also
  delays the audio by its 5 ms lookahead unless `latency` is on. Always
  `level=disabled:latency=1`, and trust the measured output, never the
  filter chain.

checks.mjs **1bu** warns (never fails) when a song's record-tempo full mix
is more than 1 LU from the cure's (files from
`loudness.py --list-reference-files`, cache in the gitignored
`tools/.loudness-cache.json`; skips without ffmpeg or Python).

**Deleted audio stays in git history** (`.git` about 580 MB); GitHub Pages'
1 GB limit counts only the published site (`audio/` about 230 MB). Don't
rewrite history and force-push `main` to shrink it unless Jonathan asks for
that specifically.

**The Song Journey play-along has the Guitar toggle too.**
- A `tabs/*.html` page's `#playalong-frame` may declare the full twin of
  every file it has: `data-audio-full`, plus `data-audio-slow-full` when it
  has `data-audio-slow`.
- `ensurePlayer()` in `tabs/journey.js` then grows a third toggle beside Slow
  and Metronome: same 🎸 button, same `ca.snipGuitarOn`/`ca.snipGuitarOff`/
  `ca.snipGuitarTitle` keys as the snippet card, **on by default**, label
  flips with the press.
- Switching keeps `currentTime` (one take; only Slow rescales).
- A half-declared set renders NO toggle, silently. checks.mjs **1be** fails
  that, a missing file, a full twin whose length differs from its
  rhythm-down file by more than 0.25 s, and a change in the pinned count of
  pages with the toggle (`JOURNEY_GUITAR_PAGES`).
- Journey and snippet are independent: a page can have the toggle without
  the song being a `SNIPPET_TRACKS` entry, and vice versa.

**`rhythm-down` means the part the student is learning is turned down**, so
they supply it — deliberate and course-wide. The `full` pair and the Guitar
toggle give them something to check against (on Seven Nation Army the riff IS
the turned-down part).

**Moises names its exports by the pitch it DETECTS**, so the Drive sources
read 441/442/443 Hz; `audio/` holds the 440 export. **Don't infer the pitch
from file size**: CBR size is duration times bitrate, whatever the pitch.

The rule that does matter: **never pitch-correct one file on its own.** A
uniform library costs students a few cents against the tuner; one mix
corrected and its twin not is audible every time the Guitar toggle is
pressed. Correct by SHIFTING, never resampling: a resample changes the
length, so the two mixes drift apart as the loop runs and 1ak fails the push.

**Every track ships at A=440**: `tuner.js` is hardcoded to A4=440Hz. Export
at 440 from Moises; ffmpeg/rubberband only as fallback.

**And as mp3, at 320k.** Moises will hand you `.m4a`. `sw.js`'s `AUDIO_RE`
and the audio fingerprint accept it, but keep one format and one bitrate
across `audio/` (Jonathan's call) so the Guitar toggle never steps between
codecs. (The existing rhythm-down set is 320k except "the cure" at 120bpm,
which is 192k.)
