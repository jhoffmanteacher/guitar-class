---
name: audio-and-snippets
description: Rules for the guitar site's audio: backing-track snippets (SNIPPET_TRACKS, anchors, barTimes beat maps, buildSnippet, Guitar/Metronome toggles, Slowest), practice-card audio, Song Journey page clicks (data-click-bars), stopCardAudio vs stopAllDemoAudio, recorded guitar notes (playNote), and audio/ file naming and exports. Read BEFORE touching any of these, adding a song or track, or wiring a snippet.
---

### ⚠️ A backing-track snippet is bars, never seconds
A step that drills four or eight bars can loop THOSE bars of the real
backing track — `snippet: { track:'the-cure', fromBar:5, bars:8, label,
label_es }` on the step, beside its `tab`. Content, not code: it plays a
window of the same mp3s the Journey page uses (sw.js already serves
byte-Range requests for `audio/`), so no new files and no export.

The window is in **bars of the song, counted from bar 1, at the FELT pulse
the course teaches** — "the cure" reads 144 BPM and the room counts 72, one
chord per bar, so its 20-bar form is intro 1–4, verse 5–12, chorus 13–20.
Make the window agree with the step's own tab: an eight-bar tab wants an
eight-bar window, or the loop comes round mid-phrase and the student
concludes they're the one who's wrong.

`SNIPPET_TRACKS` in `app.js` holds the four mp3 paths, the tempo arithmetic
and **one measured number per song — `anchor`, the track's first downbeat**.
Everything else is derived: the slow tier is the same master time-stretched
(297.1 s at 144 against 356.5 s at 120, exactly 144/120), so its grid is the
fast file's scaled by `trackBpm/trackBpmSlow`. **Never measure a second
anchor.**

**Live-band tracks carry a beat map — `barTimes`** (2026-09-27). The grid
above only holds for a track made to a click ("the cure", Luna). Sweet
Child, Let It Be, the Hendrix Watchtower and (since 2026-10-01, for the
whole-song card ca-25) Seven Nation Army were played by a
band with no click, and the Moises metronome follows the band — a straight
grid is off by up to half a beat by mid-song. (Let It Be has no
`SNIPPET_TRACKS` entry at all yet — no slow tier, no full mix, no beat map —
so it cannot carry a snippet or a practice card; Jonathan, 2026-10-01: leave
it for now, he may not use the song.) The three that are entries list every bar's
downbeat (fast file, seconds) in `barTimes`, `barTimes[0]` = `anchor`, and
`snippetWindow()` reads windows off the list; the slow tier is still the
fast times scaled by the tempo ratio. Measure with
`python3 tools/beat-map.py <rhythm-down.mp3> <rhythm-down-metronome.mp3> <bpm> <downbeat-click>`
(needs ffmpeg, numpy, scipy). Moises clicks every beat alike, so WHICH click
is beat 1 is a musical call — pick it from the song's chord changes, never
assume the first click. 1ak checks the list against `anchor`, the nominal
bar and `durationSec`, and refuses a window past the last measured bar.
The same tool gives a steady track its `anchor` (it prints it); paste that
in and flip `anchorVerified` — checks.mjs 1ak warns on every push until
it's true. **The metronome file it reads is a measuring input, not a site
file** (2026-10-01): one Moises export of the fast rhythm-down mix with the
click on, kept in Drive or a scratch folder, never committed — checks.mjs
1bk fails any metronome mix in `audio/` but Let It Be's. `?snipcal=1` on
the URL still gives a snippet card a live timecode for checking a number by
ear; its "Find the first click" button went with the files it decoded.

**The param is matched anywhere in `location.href`**, not parsed out of
`location.search`, because on 2026-09-18 every way of typing it onto a real
URL failed in turn: `#class-activities?snipcal=1` lands in the fragment where
`search` is empty, and `?teacher=true?snipcal=1` — the console already has a
query — makes `URLSearchParams` read the value as `true?snipcal=1`. A
delimiter-anchored regex accepts all of them and still won't match a longer
name ending in this one. Captured once at load, since the app rewrites the
hash as the student navigates.

**The panel is NOT localhost-gated**, unlike the dev bypass and
`__forceGate`. Those hand out access; this shows a number, and a student
cannot reach it without typing the query param. It was localhost-only for
half a day, which meant the one measurement this feature still needed could
not be taken on the deployed site — which is where Jonathan was standing
(2026-09-18). A wrong anchor puts every snippet on that song
out by the same amount, so there's exactly one number to fix.

**The bar dots run ~80 ms behind `audio.currentTime`** — `SNIP_OUTPUT_LATENCY`.
currentTime is the decoder's position, not what has left the speakers, so a
dot lighting exactly on the boundary lights before the downbeat is audible
(reported as the numbers running early, 2026-09-18). No API reports this for
a media element, so it is a constant; `?snipcal=1&lat=<ms>` overrides it live
to find the real figure. It shifts the DOTS only — the loop's seek stays on
the true decoder position, or the last buffered milliseconds would be clipped
off every lap.

**The dots still lead the beat slightly at 80 ms, and that is correct — don't
"fix" it** (Jonathan, 2026-09-18: "slightly early, but in an accurate way").
A visual cue has to arrive before the sound for a player to land on the beat;
a dot lighting exactly on the downbeat reads as late, because moving a hand
to it takes longer than hearing it. Anyone tempted to raise the constant
until the dots sit dead on the beat would be making it worse. The number to
watch instead is whether the lead is CONSTANT across the four dots: a growing
one is a wrong `win.bar` for that song, not latency.

One builder, `buildSnippet()`, called by `caStepHtml()` (app.js) and
`renderTeacherActivityDetail()` (teacher.js) — same shape as `buildTab()`,
which is how a step field satisfies the two-renderers rule without two
copies. 1ak pins both calls, **inside the function body and with comments
stripped**: its first cut matched the words "see buildSnippet()" in the
comment above the call and stayed green when the call was deleted.

Only one thing plays at a time: starting the band calls `stopAllDemoAudio()`,
and `playSequence()` calls `snipStop()`. Two unsynced sources in one step —
the tab's synthesised notes over the record — is the one way this gets
genuinely confusing, so it's closed off at both ends.

**Two silencers, and picking the wrong one takes the student's metronome
with it** (2026-09-19). `stopCardAudio()` stops what the SITE is playing at a
card's request — tab player, backing-track loop, chord strums, ear drill.
`stopAllDemoAudio()` is that plus `stopMetro()`, and the FAB metronome is a
tool the student started themselves, with its own Start/Stop, that no card
owns. So the full sweep is only for the two cases that earn it: **the mic is
about to open** (every coach.js site; fab-tools.js when the tuner opens), or
**the site is about to play something that has to be heard clean** (a tab
sequence, a snippet, an exit-check stimulus). A plain "mark this done" is
neither, and **nor is leaving a screen** — `caMarkStepDone()`,
`caToggleComplete()` and `caClosePanel()` all used the full sweep until
2026-09-19, so a student practising to their own click lost it by ticking a
box or by navigating away, while the ordinary lesson-step path
(`onCompleteChange()`) never did: the same gesture with a different outcome
depending on which kind of card it was. `fab-tools.js` already draws this
line for dismissing a popup ("the student shouldn't silently lose the click
they're practicing to"), so nothing in `app.js` should be stricter.
After that change the full sweep has exactly three callers in `app.js` —
`snipToggle()`, `erPlay()`, `ecPick()`, all "about to play" — plus the
mic-opening ones in `coach.js` and `fab-tools.js`. New "silence it" call site
→ default to `stopCardAudio()`.

**Which tempo a card OPENS on is per track — `defaultSlow` in
`SNIPPET_TRACKS`.** `"the cure"` sets it (Jonathan, 2026-09-19): 29 of its
steps tell the student to play at 60 BPM, and its slow tier IS 60 (feltBpm 72
scaled by 120/144), so opening on the fast tier handed a Module-2 beginner a
loop 20% above the tempo the card had just asked for, with nothing pointing
at the turtle. Seven Nation Army deliberately does NOT set it — its slow tier
is 100 against a taught 123, so neither tier matches a "play at N" line the
way this one does. `buildSnippet()` writes `data-slow` (what the engine
reads) AND the turtle's `aria-pressed`/`.on` (what the student sees) from the
one value — write only one and the button lies about what is playing. Nothing
persists the tier, so this is the state on every render, the teacher console's
preview included. checks.mjs 1ak requires it to be a boolean and refuses
`true` on a track with no `srcSlow`.

**The Guitar toggle** (2026-09-18, Jonathan's ask: students should be able to
hear the part and check themselves). A track may declare `srcFull`/
`srcFullSlow` beside its rhythm-down paths; the card then grows a third
toggle, **on by default** — the record plays the part, turn it off and carry
it yourself.

**Its label names who is playing, and flips with the button** — "Record plays
it" / "You play it", not "Guitar". The off state is the rhythm-down mix,
which turns the part DOWN rather than removing it, so a button called
"Guitar" promises a mute it cannot deliver: pressed on "the cure", where the
part is a strummed acoustic under vocals, bass and drums, it sounds like
nothing happened and the site reads as broken (Jonathan, 2026-09-18, from the
room). `snipGuitarLabel()` is the one relabeller. Optional per track and both tiers or neither, so a song whose
full mix isn't exported is a card with one fewer button, never a broken one
(checks.mjs 1ak fails a half-declared pair, and a declared path whose file
isn't there).

**Metronome and Guitar are independent on every track, because the
Metronome is not a file** (2026-10-01). It used to be: a second copy of
each mix with a Moises click baked in, so "guitar in AND click on" needed
a third and fourth copy (`srcFullMetronome`/`srcFullSlowMetronome`), and a
track exported without them made the two buttons take turns — reported as
a bug the day it shipped (2026-09-18), and it was one. All four metronome
fields are gone from `SNIPPET_TRACKS` now (1ak fails one that comes back):
`snipScheduleClick()` clicks the counted beats of the snippet's own window,
the same way a practice card's `pcScheduleClick()` does, so it follows the
beat map on a live-band track. `snippetSrc(track, slow, guitar)` lost its
`metro` argument with them — checks.mjs 1bk fails a caller still passing
four, which would shift `guitar` out and play the rhythm-down mix with the
Guitar button lit.

**Every Song Journey page but Let It Be makes its own click** — "the cure"
since 2026-09-27, Seven Nation Army, Sweet Child, Watchtower and Luna since
2026-10-01 (Jonathan: "can I erase some metronome tracks from the git? if
so, go ahead and delete them"). Two ways to declare it on
`#playalong-frame`, and `ensurePlayer()` in `tabs/journey.js` schedules the
click on an AudioContext instead of swapping files:

- **A steady track** ("the cure"): `data-click-anchor="0.565"` (the snippet
  `anchor`) with the COUNTED tempos in `data-bpm="72" data-bpm-slow="60"`.
- **A band that drifts, or a track with an intro at another tempo**:
  `data-click-bars` — every bar's downbeat on the fast file, the same
  numbers as `SNIPPET_TRACKS[<slug>].barTimes` — plus `data-click-beats`
  (clicks per bar, the loud one on the downbeat). The slow tier is the list
  scaled by `data-bpm / data-bpm-slow`. Nothing clicks before the first
  listed downbeat or after the last. Luna is a steady track that uses this
  form anyway: four intro bars at 120 BPM, then the vamp from `anchor`, six
  clicks a bar — what its page note already tells the student to expect.

The page lists are hand-kept copies (those pages have no `app.js`), so
checks.mjs **1bk** compares them to `SNIPPET_TRACKS` number for number,
pins the count of pages making their own click, refuses a page that does
both, and fails any metronome mix in `audio/` except the one on
`METRONOME_MIXES_ALLOWED`. **Re-measure a track's beat map and you must
re-copy its page's `data-click-bars` in the same edit.**

How close is it? Measured 2026-10-01 against the click Moises had baked
into each file, before deleting them: on the fast files about 6 ms off on
average for the three band tracks (Seven Nation Army 468 clicks, Sweet
Child 733, Watchtower 454) and 14 ms for Luna (344, where Moises's own
click wobbles around a steady tempo), 53 ms at worst; 8–18 ms average on
the slow tiers. The page's
click is evenly spaced inside each measured bar where Moises followed the
band beat by beat, which is the whole difference. Practice cards have run
on the same arithmetic since 2026-09-27.

**Let It Be is the one page still swapping to a metronome FILE**
(`data-audio-metronome`, one mp3) — Jonathan, 2026-10-01: leave the song for
now, he may not use it. It has no beat map to make a click from. If it
stays in the course, measure it, give it `data-click-bars`, delete the file
and empty `METRONOME_MIXES_ALLOWED`.

**All five snippet tracks have their full mix** — Seven Nation Army,
"the cure", Luna, the Hendrix Watchtower and (2026-09-27) Sweet Child. A new
snippet song needs two files, at both tempos, mix `full`, and a `srcFull`/
`srcFullSlow` pair in its `SNIPPET_TRACKS` entry; 1ak warns the count of
tracks still without one.

**Export it from the same Moises project with the stems up** — same tempo, no
count-in, no re-trim, no transposition. 1ak measures the result against its
rhythm-down twin and fails beyond 0.25 s, because two mixes of one take have
to be one length; a re-trim is the only failure here nobody can hear (both
files play fine alone, the toggle just jumps the loop). Correct pitch by
SHIFTING, never resampling: a resample fixes pitch by changing speed, which
moves the length and makes the two mixes drift apart as the loop runs.

## Guitar notes — every Play button is a recording
**2026-10-01** (Jonathan: the synth "doesn't sound like a guitar"). Every
pluck the site makes — TAB Play buttons, chord strums, the ear and shuffle
drills, game rewards, Riff Runner's "Hear it" — goes through `playNote()`
in `app.js`, and `playNote()` now plays a RECORDED steel-string acoustic
note: `audio/guitar-note-<midi>-<note>.mp3`, one per semitone from 40 (low
E) to 74 (D5), listed in `GUITAR_NOTE_FILES`. Outside that range it
re-pitches the nearest file (only Module 9's top E5 today). Steel acoustic
on purpose: it's what the class set (ADM starters) sounds like.

- **Source:** University of Iowa Electronic Music Studios guitar samples
  (free to use without restriction), via tonejs-instruments (MIT), re-cut
  2026-10-01: mono 96 kbps, trimmed to the pick, loudness-matched to -21
  LUFS over the first 0.8 s, ≤ 3 s with a fade. Pitch measured within ±5
  cents of A=440 on every file. **Re-cut any replacement the same way** —
  an un-matched file is a note that jumps out of every line it's in.
- **Karplus-Strong (`ksPluckBuffer`) is the fallback, not dead code.** A
  note whose file hasn't downloaded plays the synth. The first tap anywhere
  starts all 35 downloads (`warmGuitarNotes()`); `playSequence()` waits up
  to `GUITAR_NOTE_WAIT_MS` (1.5 s) for its own line's notes and, if they
  still aren't there, plays the whole line on the synth — it never switches
  voice mid-line. A failed download isn't retried for 30 s.
- **`playNote()` is the only door.** Riff Runner had its own synth buffer
  (`rnPluckAt` in coach.js) and now calls `playNote()`; checks.mjs **1bj**
  fails a second `ksPluckCached(` call in app.js or any in coach.js.
- **`playSequence()` damps the previous note** when the next one sounds
  (25 ms time constant) — three-second recorded notes all ringing turned a
  line into a wash. A held `{ midi, beats }` note still rings its full
  length, the last note rings out, and a Stop press damps everything.
- These files are in `audio/`, so they share the audio cache and its
  fingerprint: adding them bumped `AUDIO_CACHE_VERSION` once. Changing one
  will bump it again — every student re-downloads backing tracks as they
  next play them — so batch any re-cut into one push.

## Backing tracks

`<artist-slug>-<song-slug>-backing-<key>-<bpm>bpm-<tuning>hz-<mix>.mp3`, lowercase
kebab-case; the artist stays out of the app's display metadata.

**What ships is `rhythm-down` and `full`, at each tempo a song has — and
no metronome mix** (2026-10-01). That is 22 files: four each for Seven
Nation Army, "the cure", Luna, Watchtower and Sweet Child (`rhythm-down`
and `full`, at two tempos), and two for Let It Be (`rhythm-down` at 71, and
its one leftover `rhythm-down-metronome` — see "Every Song Journey page but
Let It Be makes its own click"). The 20 other metronome
mixes — 209 MB, nearly half of `audio/` — were deleted that day; the site
makes the click itself everywhere they were used. (The 35 `guitar-note-*`
files beside them are one-shot notes, not backing tracks — see "Guitar
notes" above; this naming pattern doesn't apply to them.) Every slow tier is
the same master time-stretched, so its grid is the fast one's scaled by the
tempo ratio — checked on two songs to three decimal places. `no-gtr`,
`drums-only` and `slow-<bpm>` have never existed in `audio/`; don't cite a
mix as available without listing the folder first.

**For a NEW song Jonathan exports four files, not eight** (his note,
2026-10-01: "I don't need to download the metronome versions"):
`rhythm-down` and `full`, each at the record tempo and at the slow tempo,
same Moises project, no count-in, no re-trim. The site needs nothing else.
**One exception, and it never goes on the site:** to place the bars, Claude
needs ONE extra export — the record-tempo `rhythm-down` with the click on —
as the measuring input for `tools/beat-map.py`. Ask for it when a new song
is being wired up, measure, and leave it out of the commit. Don't ask for
the other three metronome variants, and don't tell him a song is "missing"
its metronome files.

**The deleted files are still in git history**, so the repo's `.git` did
not get smaller (about 580 MB) — what shrank is the published site, which
is what GitHub Pages' 1 GB limit counts: `audio/` went from 439 MB to
230 MB. Shrinking the history would mean rewriting it and force-pushing
`main` under two machines and several worktrees; don't, unless Jonathan
asks for that specifically.

**The Song Journey play-along has the Guitar toggle too** (Jonathan,
2026-09-27). A `tabs/*.html` page's `#playalong-frame` may declare the full
twin of every file it has — `data-audio-full`, plus `data-audio-slow-full`
when it has `data-audio-slow` (the `-metronome` twins went with the
metronome files, 2026-10-01) — and `ensurePlayer()` in
`tabs/journey.js` grows a third toggle beside Slow and Metronome: same
🎸 button, same `ca.snipGuitarOn`/`ca.snipGuitarOff`/`ca.snipGuitarTitle`
keys as the snippet card, **on by default**, label flips with the press.
The two mixes are one take, so switching keeps `currentTime` (only Slow
rescales). A half-declared set renders NO toggle, silently — checks.mjs
**1be** fails that, a missing file, a full twin whose length differs from
its rhythm-down file by more than 0.25 s, and a change in the pinned count
of pages with the toggle (`JOURNEY_GUITAR_PAGES`). Journey and snippet are
independent: a page can have the toggle without the song being a
`SNIPPET_TRACKS` entry, and vice versa.

**`rhythm-down` means the part the student is learning is turned down**, so
they supply it — deliberate and course-wide. The cost is that a student has
nothing to check themselves against, and on Seven Nation Army that was total:
the riff IS the turned-down part, so ca-10's play-along was drums and bass
with a riff-shaped hole. The `full` pair fixes it per song; see the Guitar
toggle under the snippet section.

**Moises names its exports by the pitch it DETECTS** in the record, so the
source files in Drive read 441/442/443 Hz; what lands in `audio/` is the
440 export. Jonathan makes these himself and has confirmed the Seven Nation
Army pair (2026-09-18).

**Don't try to infer that from file size** — every track here is CBR 320 or
192, where size is duration times bitrate and nothing else, so a 440 export
and its 442 source of the same length weigh exactly the same. A 2026-09-18
session read that coincidence as evidence the files had only been renamed.
It isn't evidence of anything.

The rule that does matter: **never pitch-correct one file on its own.** A
uniform library costs students a few cents against the tuner; one mix
corrected and its twin not is audible every time the Guitar toggle is
pressed. And correct by SHIFTING, never resampling — a resample changes the
length, so the two mixes drift apart as the loop runs and 1ak fails the push.

**Every track ships at A=440** — `tuner.js` is hardcoded to A4=440Hz, so a track
mastered at any other reference will sound out of tune against it. Export at 440
from Moises; ffmpeg/rubberband only as fallback.

**And as mp3, at 320k.** Moises will hand you `.m4a`; `sw.js`'s `AUDIO_RE`
and the audio fingerprint both accept it, so it would have worked — but a
2026-09-18 m4a pair was re-exported as mp3 on Jonathan's call, to keep one
format and one bitrate across `audio/` rather than have the Guitar toggle
step between codecs. (The one bitrate is aspirational: the existing
rhythm-down set is 320k except "the cure" at 120bpm, which is 192k.)
