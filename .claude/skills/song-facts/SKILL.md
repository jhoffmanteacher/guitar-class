---
name: song-facts
description: Settled facts about the guitar course's six Core songs and Choice songs (chords, keys, timing, section bar numbers on the backing tracks, rulings not to re-flag). Read before any song audit, before writing or checking chords/tab/timing for a song, or placing a snippet window by section.
---

## Settled song facts — do not re-flag in audits

**Don't verify tempo/BPM claims in song audits** (Jonathan, 2026-07-31) —
check chords, keys, and capo claims only. BPM databases disagree with each
other and the site's tempo numbers are close enough for teaching.

**Chord timing measured against the local backing tracks (2026-09-24)** — the
click-stem method (`metronome − clean` → beat grid → per-beat chroma), not by
ear. This is chord *timing*, not BPM:
- **Let It Be** (71 BPM track) — **two beats per chord, confirmed.** The verse
  runs `C C G G Am Am F F | C C G G F F C C`, so the second line of each
  verse is C–G–F–C, not the four-chord loop again.
- **Luna** (128 BPM track, clicks are eighth notes, ~43 big beats) — **F for
  two bars of 6/8, then Am for two bars, confirmed.** The chord is Am, not A.
- **All Along the Watchtower** (Hendrix track, 115 BPM, slow tier 105) —
  **two beats per chord: `A A G G F F G G`** (Jonathan, 2026-09-27). The
  play-along is now Jimi Hendrix's recording, moved down to Am in Moises; the
  Neil Young track and its "Am 2 · G 2 · F 3 · G 1" reading are retired.
  Measured off the click stem, loop by loop: bar 1 is A on 1–2, G on 3–4
  everywhere. The bar-2 G is on **beat 4 in the intro** (the first ~18 s)
  and **about beat 3 once the singing starts** — Jonathan heard the same.
  Later in the song it is loose (anywhere from 3 to 4½, some laps with no
  clear G). The site teaches the verse: G on beat 3 in Modules 2, 3, 5, 6
  and 7, the Journey page and Riff Runner. Module 4's "the real rhythm" card
  teaches the intro/verse difference by ear. The track's tempo drifts
  (≈110 in the intro, ≈115 through the verses, ≈120 at the end), so a
  steady grid would slide by up to a second — which is why its
  `SNIPPET_TRACKS` entry carries a beat map (`barTimes`, 2026-09-27)
  rather than one anchor. **With the beat map it IS a snippet and
  practice-card track**: ca-26 (the whole song, 2026-10-01) plays the low-E
  bass loop over it, seven sections on the record's bars. (This line said
  "NOT a SNIPPET_TRACKS candidate" until 2026-10-01 — true of a steady
  grid, stale the day the beat map landed.) One loop everywhere on the
  card, the intro included, so for the first ~18 s the card's G sits a
  beat ahead of the record's — the settled reading above, not a bug. Its
  full mixes ship for the Guitar toggle, on the card and on the Song
  Journey page (1be).
- **Seven Nation Army** (123 BPM track) — the riff is NOT one note per beat:
  bar 1 is E (long) · E (short) · G · E, with D as a pickup on the "and" of 4;
  bar 2 is **C for two beats, B for two beats** — what ca-10 teaches. The
  Journey page's Layer 5 singalong loop (`Em Em G Em | D C C –`) is a
  teaching loop that does not line up with the record; the page says so.

- **All Along the Watchtower** — `Am–G–F–G` loop (power chords `A5–G5–F5–G5`).
  **Timing: two beats per chord, `A A G G F F G G`** — see "Chord timing
  measured" above (2026-09-27, replaces the 2026-09-24 "F 3 · G 1" reading
  and the 2026-08-06 verse/chorus one). The map's "Am–G–F" is shorthand.
  **The `jimi-hendrix-…` audio slug is CORRECT** — the play-along is
  Hendrix's recording transposed to Am, which the Journey page's history
  paragraph states outright. The slug names the source recording, not the
  song's credited writer (Dylan). Don't "fix" it.
- **Sweet Child O' Mine** — verse `D–C–G`, **two bars each**, ~123–125 BPM. (Corrected
  2026-09-12 — content across module-2/3/5/7 and the Journey page is
  consistently "two bars each"; the old "full bar each" here was the outlier.)
- **Let It Be** — verse `C–G–Am–F`, **two beats per chord**, ~71–76 BPM.
- **"the cure"** — **FOUR felt beats per chord, one full bar** (track reads
  144 BPM but feels ~72). This line said "two felt beats per chord" until
  2026-09-18; every tab on the Journey page, every class activity and the
  snippet arithmetic all say four, and the snippet loops were confirmed
  against the record by ear, so this was the outlier. At two beats a chord
  would be 1.67 s and every snippet window would be half the length it is.
  Tell students "big slow beats, about 72."
  **The verse and the chorus are EIGHT bars each** (Jonathan, 2026-09-18) —
  verse `Am · C · Am · C`, then `F · C · F · C`; chorus `Dm · F · C · G`,
  played twice. **The chorus IS the four-chord loop played through
  twice** — corrected 2026-09-22 from Jonathan's two Moises chord charts
  (key Bb minor as recorded; the site's no-capo arrangement stays), which
  read Dm F C G straight through, twice. The 2026-09-18 reading here —
  `Dm · F · Dm · F`, then `C · G/B · C · G/B`, each pair playing twice
  before the next — was wrong. The last chord is a plain G; G/B survives
  only as a Module 5 Level up (the record's bass walks B under that
  chord), never the main line. Layers 3, 5 and 6 of the Journey page
  showed the four-bar shorthand until 2026-09-18, while Layer 2 and
  ca-13 / ca-18 / ca-19 had it right — a student following the backing-track
  loop would have heard the disagreement. **Modules 3, 5 and 8 still carried
  the four-bar verse in playable data until 2026-09-18** (module-3's
  power-chord tab, module-5's `playSeq`, module-8's fingerstyle tab, plus
  three prose lines) and were rewritten to eight; Jonathan's call was to
  match the record rather than relabel the loop.
  **SECTION ORDER ON THE BACKING TRACK, measured off the mp3 2026-09-18:**
  intro bars **1-4**, verse bars **5-12**, the verse **AGAIN** bars
  **13-20**, chorus bars **21-28**. The verse plays twice before the first
  chorus — so a snippet window meaning "the chorus" starts at bar 21, and
  bar 13 is the second verse, not the chorus. (ca-18 step 4 sat at 13 for a
  day: the band played `Am-C-F-C` under a student reading `D-F-C-G`.) The
  Journey page's own song map reads "Verse → Chorus → …" and omits that
  repeat; it is a section list, not a bar grid. Anything placing a window by
  section has to be measured, not inferred — checks.mjs 1ak deliberately
  does not guess at `fromBar` (see its comment).
  **The rest of the record, bars 29-88** (2026-09-30, for ca-24 —
  Jonathan's chord chart placed on the click grid with bass/chroma
  readings of the mp3): the chorus is **12** bars, `Dm F C G` three laps
  (21-32; the third lap is the "It'll never be the cure" tag); verse 3,
  33-40; refrain `F | C G | F | C G`, 41-44 (C and G share a bar);
  chorus 2, 45-56; refrain 2, 57-60; bridge `F | C G | F | C G | Dm F C G`,
  61-68; chorus 3, 69-80; outro `Dm F C G` x2, quieter, 81-88. The file
  ends early in bar 89, so bar 88 is the last whole bar. The chart writes
  G/B throughout; the site plays plain G. The Journey page and ca-18 teach
  the chorus as eight bars, twice through the loop, on purpose (Jonathan,
  2026-10-06); the page's third play-along note tells students the record
  plays it three times. Don't rewrite the page's "twice — eight bars" lines
  to twelve.
  No capo, by design. **Module 12's fingerpicking-as-native-style framing stays**
  (Jonathan's call, 2026-07-31): the record's guitar is rapidly strummed, but
  the fingerstyle arrangement and its ◐-comes-off lesson are a deliberate
  teaching arrangement — don't flag it against the record. Same for the single
  Am–C–Dm–F+G/B loop (a composite of the record's verse and chorus).
- **Luna** — F–Am vamp; Dm is a passing chord, no C; 6/8 felt in 2; no capo
  (simplified F `xx3211` until Module 7); solos use D minor pentatonic Pattern 1
  at fret 10; ◐ in Module 3. Its Module 4 `backingUrl` stays the generic YouTube
  Dm jam loop by design — the local mp3 is the Journey-page track.
- **Core songs are exactly six**: Seven Nation Army, Watchtower, Sweet Child,
  Luna, Let It Be, "the cure". The six `tabs/` Journey pages cover them
  completely — don't flag others as missing. Oye Mi Amor and "Está Dañada"
  (Iván Cornejo) are Choice songs.
- **"Tu Boda" was removed site-wide 2026-08-07** — its lyrics describe violence
  against the bride at her wedding and drew femicide-advocacy criticism in
  Mexico. Don't reintroduce it. **"Está Dañada" (Iván Cornejo) took its slot**
  in Modules 6, 7, 8, 12 and now anchors m12w3-s2's requinto challenge (E major
  / C#m, no capo; the intro is a fingerpicked single-note line that slides on
  the thin strings).
- **A Choice song may anchor a graded skill** — `core: false` is not a bar.
  m12w3-s2 ("Está Dañada") and m12w1-s6 ("House of the Rising Sun") both do.
  "Core" means *threaded through the course with a `tabs/` Journey page*, not
  *the only songs a skill may name*. Don't flag it as a defect.
- **Step `skills: [n]` resolves to the id SUFFIX, not the array position**
  (`stepSkillIds` in `app.js`), and skill progress is keyed by `skill.id`. So
  removing a skill and leaving a numbering gap is SAFE; renumbering the
  survivors would silently reassign students' stored check-offs. Removing a
  *section* is the destructive one — `${setId}-${station}-sec${gi}-${i}` is
  positional, so every later section in that station shifts.
- **Solo work uses YouTube jam tracks, not the course mp3s** — the mp3s are
  rhythm-stripped so the student plays the rhythm part. Local mp3s stay the
  play-along tracks on Journey pages.
- **Module 8's "6/8 = six beats to a bar" is correct as taught** (Jonathan's
  call, 2026-07-31). It coexists with Module 12's "six eighth notes grouped
  into two big beats" and Luna's "felt in 2" — count-in-six and feel-in-two are
  the same meter at different zoom levels, not a contradiction. Don't flag.
- **Module 5's assessment intentionally skips E/B7** (Jonathan's call,
  2026-07-31). Group 3 is covered by the mr5-s5 review check; the assessment
  piece stays on Let It Be / Luna / "the cure". Don't flag.
