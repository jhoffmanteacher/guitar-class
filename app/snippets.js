/* ── Backing-track snippets (a step's `snippet`) ───────────────────────
   A class-activity step that drills four or eight bars of a song can play
   THOSE BARS of the real backing track, on a loop, right in the step —
   instead of sending the student to the Song Journey page and turning them
   loose on the whole five-minute record. Drilling the verse of "the cure"
   used to mean starting at the top of the song every time and hearing the
   verse once.

   Nothing new is downloaded: this plays a WINDOW of the same mp3s the
   Journey page already uses. sw.js serves byte-Range requests for audio/
   and warms the full file in the background, so seeking into the middle is
   cheap and cached after the first play.

   THE WINDOW IS EXPRESSED IN BARS, NOT SECONDS — `{ track, fromBar, bars }`.
   Seconds would have to be re-measured for every tempo tier and retyped for
   every step; bars mean ONE measured number per song, the track's `anchor`,
   fixes the whole grid:

       barSeconds = beatsPerBar * 60 / feltBpm
       start      = anchor + (fromBar - 1) * barSeconds
       end        = start + bars * barSeconds

   THE SLOW TIER IS DERIVED, NOT MEASURED. The two files are the same Moises
   master, one of them time-stretched — 297.1 s at 144 BPM against 356.5 s at
   120, a ratio of exactly 144/120 — so the slow file's grid is the fast
   file's scaled by trackBpm/trackBpmSlow. That is the same rescale
   journey.js does when its own Slow toggle flips mid-song. Measure `anchor`
   against the FAST file only; never measure a second one.

   FELT tempo, not the file's printed tempo. "the cure" reads 144 BPM but the
   room counts 72, four felt beats to a chord (CLAUDE.md, settled song facts),
   so feltBpm is 72 and beatsPerBar counts FELT beats. Get this wrong and the
   loop is half or double the length the tab is.

   ⚠️ `anchor` IS THE FIRST DOWNBEAT, IN SECONDS, AND IT HAS TO BE MEASURED
   — it is the one number nothing here can compute. Until it is,
   `anchorVerified: false` keeps checks.mjs (1ak) warning on every push.
   Measure it with tools/beat-map.py, which takes the rhythm-down mix and ONE
   Moises export of it with the click on and prints the anchor (and, for a
   live band, the whole barTimes list). That metronome export is a measuring
   input only: it never goes in audio/ (2026-10-01 — the site makes its own
   click everywhere, and checks.mjs 1bk fails a metronome mix that comes
   back). ?snipcal=1 on the URL still gives a snippet card a live timecode to
   check the number by ear. A wrong anchor puts every snippet on that song
   out by the SAME amount, so there is exactly one number to fix, not one per
   step.

   THE METRONOME IS A CLICK THE SITE MAKES (2026-10-01), on a snippet as on a
   practice card and a Song Journey page: one click per counted beat, read
   off the same window the bar dots use (snipScheduleClick), so it follows
   the beat map on a live-band track and needs no file. Metronome and Guitar
   are therefore fully independent on every track. */
/* THE GUITAR TOGGLE and the two OPTIONAL `full*` paths below.
   Every shipped mp3 is a `rhythm-down` mix — the part the student is learning
   is turned down so they supply it. That is deliberate and course-wide, and
   it is also why a student cannot tell a right note from a wrong one: there
   is nothing to check against. So a track may ALSO declare a full mix, and
   the card gets a Guitar toggle that swaps between them mid-loop, on by
   default: hear the record play it, then turn the guitar off and carry it
   yourself. Same file-switching path as the Slow toggle.

   The `full*` paths are OPTIONAL and independent per track. A track without
   them renders no Guitar toggle and plays the rhythm-down mix exactly as
   before — so a song whose full mix has not been exported yet is a card with
   one fewer button, never a broken one. Declare `srcFull` and you must
   declare `srcFullSlow` too (checks.mjs 1ak): a Guitar toggle that silently
   dies the moment Slow is pressed is worse than no toggle.

   There is no metronome mix of either (2026-10-01): the click is made by the
   site, so Metronome works the same whether the guitar is in or out. The
   comments on the tracks below still say which numbers were measured off a
   Moises metronome export — those files were measuring inputs and are no
   longer in audio/. */
const SNIPPET_TRACKS = {
  'the-cure': {
    src:              'audio/olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-rhythm-down.mp3',
    srcSlow:          'audio/olivia-rodrigo-the-cure-backing-Am-120bpm-440hz-rhythm-down.mp3',
    /* The full mix — 297.038 s against the rhythm-down twin's 297.064 s, and
       356.441 s against 356.545 s, both inside 1ak's 0.25 s. Note the slow
       twin is a 192k encode where this is 320k; that asymmetry predates the
       full mixes and is inaudible on a classroom speaker, but it is why the
       two files differ in size far more than in length. */
    srcFull:     'audio/olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-full.mp3',
    srcFullSlow: 'audio/olivia-rodrigo-the-cure-backing-Am-120bpm-440hz-full.mp3',
    trackBpm: 144, trackBpmSlow: 120,   // what the FILES are, for the slow-tier rescale
    feltBpm: 72,                        // what the ROOM counts — 144 felt in half
    beatsPerBar: 4,                     // felt beats per chord; one chord = one bar
    clickGain: 1.5,                     // in-song click 1.5x louder on this track (Jonathan, 2026-10-10: "a little louder")
    durationSec: 297,                   // the fast file, so 1ak can catch a window past the end
    // Measured 2026-09-18 with ?snipcal=1 -> Find the first click, off the
    // rhythm-down-metronome file's own first click.
    anchor: 0.565,
    anchorVerified: true,
    /* Cards on this track open on the SLOW tier (Jonathan, 2026-09-19).
       Every "the cure" step tells the student to play at 60 BPM — 29 of them
       say so outright — and this track's slow tier IS 60: feltBpm 72 scaled
       by 120/144. So the fast tier was handing a Module-2 beginner a loop 20%
       above the tempo the card had just asked for, with nothing pointing at
       the turtle. The turtle still renders (pressed), so one press goes to
       full speed, which is what the steps ask for after a clean run.
       Seven Nation Army deliberately does NOT get this: its slow tier is 100
       against a taught 123, so neither tier matches a "play at N" line the
       way this one does. */
    defaultSlow: true,
  },
  /* Seven Nation Army counts at its printed tempo — no halving, unlike "the
     cure": 123 BPM is what the room counts and a bar is four of those beats.
     The riff is two bars, so the windows below are whole numbers of laps.
     The slow tier is the same master stretched (239.2 s at 123 against
     294.2 s at 100, exactly 123/100), same as every other track here. */
  'seven-nation-army': {
    src:              'audio/the-white-stripes-seven-nation-army-backing-Em-123bpm-440hz-rhythm-down.mp3',
    srcSlow:          'audio/the-white-stripes-seven-nation-army-backing-Em-100bpm-440hz-rhythm-down.mp3',
    /* The full mix, and this is the song that needed it most: the rhythm-down
       mix turns the RIFF down (the Journey page says so outright), which is
       the whole of what ca-10 teaches — so until these landed a student had
       nothing to check their riff against. Same Moises project, stems up:
       239.151 s against the rhythm-down twin's 239.151 s, and 294.113 s
       against 294.217 s. 1ak re-checks that on every push. */
    srcFull:     'audio/the-white-stripes-seven-nation-army-backing-Em-123bpm-440hz-full.mp3',
    srcFullSlow: 'audio/the-white-stripes-seven-nation-army-backing-Em-100bpm-440hz-full.mp3',
    trackBpm: 123, trackBpmSlow: 100,
    feltBpm: 123,                       // counted at record speed, not halved
    beatsPerBar: 4,
    durationSec: 239,
    /* BEAT MAP (2026-10-01, for ca-25, the whole song). The record is a live
       drummer: a straight 123 grid is fine for the first 8 bars (ca-10) but
       drifts half a beat by bar 20, and the G-A breaks before each chorus run
       long, so by the solo the grid sits two beats off the riff. barTimes
       below is tools/beat-map.py on the rhythm-down pair, downbeat click 0
       (468 clicks, none missed or doubled; bars 1.897-2.099 s). Checked
       against the bass chroma per half-beat: every riff lap lands E on beat
       1 and C on the next bar's beat 1, bars 1-114. The old steady anchor
       was 1.135 (measured 2026-09-18 with ?snipcal=1); bar 1 is now the
       first measured click. Song map on this list: riff 1-24, G-A 25-26,
       riff 27-34, G-A 35-36, riff 37-60, G-A 61-62, riff 63-78, G-A 79-80,
       riff 81-104, G-A 105-106, riff 107-114, final E 115-116. */
    anchor: 1.128,
    anchorVerified: true,
    barTimes: [
      1.128, 3.172, 5.169, 7.169, 9.170, 11.151, 13.089, 15.052, 16.968, 18.909,
      20.831, 22.729, 24.632, 26.529, 28.450, 30.372, 32.268, 34.228, 36.154, 38.092,
      39.991, 41.929, 43.852, 45.790, 47.771, 49.789, 51.810, 53.769, 55.689, 57.669,
      59.630, 61.569, 63.514, 65.490, 67.469, 69.450, 71.493, 73.550, 75.574, 77.611,
      79.650, 81.649, 83.609, 85.569, 87.509, 89.470, 91.413, 93.351, 95.311, 97.251,
      99.202, 101.129, 103.053, 105.013, 106.951, 108.891, 110.809, 112.711, 114.631, 116.550,
      118.494, 120.490, 122.511, 124.470, 126.430, 128.411, 130.414, 132.352, 134.311, 136.292,
      138.231, 140.190, 142.150, 144.113, 146.091, 148.010, 149.970, 151.930, 153.911, 155.911,
      157.970, 160.070, 162.114, 164.170, 166.173, 168.155, 170.093, 172.030, 173.950, 175.890,
      177.834, 179.773, 181.711, 183.652, 185.611, 187.572, 189.510, 191.470, 193.416, 195.331,
      197.253, 199.190, 201.114, 203.032, 204.971, 206.972, 208.953, 210.913, 212.851, 214.812,
      216.773, 218.711, 220.651, 222.611, 224.591, 226.551, 228.532,
    ],
  },
  /* "Luna" is 6/8 and the room counts the two BIG beats per bar (Journey
     Layers 2-3: one pluck per bar, two bars per chord). The file's 128 BPM
     is the EIGHTH note — Moises clicks all six eighths of every bar — so the
     big beat is 128 / 3 = 42.7 and a bar is six clicks, 2.81 s. Measured
     2026-09-23 off the rhythm-down-metronome file (clicks isolated by
     subtracting the plain mix, 344 of them): the bass reads F F A A in
     six-click bars all the way through, one chord per two bars.

     The first four bars are an intro at 120 BPM (F F Dm Dm, the passing Dm)
     before the song settles at 127.99 for the rest of the file. The bar
     arithmetic here is one tempo, so `anchor` is NOT the file's first click
     (0.659 s) — it is the first downbeat at the steady tempo, the start of
     the F-Am vamp, and bar 1 below means the first F bar of the vamp. The
     intro is simply never inside a window. Anchor is the fitted grid through
     clicks 24-344 (residual 17 ms rms), not a by-ear reading.

     Audio, 2026-09-23. One Moises export set at both tiers, 128 and 100:
     full, full-metronome and rhythm-down-metronome. The 128 rhythm-down-
     metronome file was REPLACED with this set's export (same name, same
     163.16 s, sample-aligned): the earlier one had a click about half as
     loud, so pressing 🎸 with Metronome on made the click jump in volume.
     The plain rhythm-down at 128 is the original; its music matches this
     set's to within the click. All four 100 BPM files are Moises exports,
     208.80 s each and sample-aligned with one another. */
  'luna': {
    src:              'audio/peso-pluma-junior-h-luna-backing-Am-128bpm-440hz-rhythm-down.mp3',
    srcSlow:          'audio/peso-pluma-junior-h-luna-backing-Am-100bpm-440hz-rhythm-down.mp3',
    srcFull:              'audio/peso-pluma-junior-h-luna-backing-Am-128bpm-440hz-full.mp3',
    srcFullSlow:          'audio/peso-pluma-junior-h-luna-backing-Am-100bpm-440hz-full.mp3',
    trackBpm: 128, trackBpmSlow: 100,
    feltBpm: 128 / 3,                   // big beats: 3 eighth-note clicks each
    beatsPerBar: 2,                     // two big beats per 6/8 bar
    countSix: true,                     // chord grid counts the bar 1-6 — see COUNT IN SIX
    durationSec: 163,
    anchor: 12.658,
    anchorVerified: true,
  },
  /* ── LIVE-BAND TRACKS: a beat map instead of a steady grid (2026-09-27) ──
     "the cure" and Luna sit on a steady grid, so one
     anchor plus bar arithmetic finds every bar. The next two were recorded
     by a band with no click, and the Moises metronome FOLLOWS the band: a
     straight grid through Sweet Child's clicks is off by up to 0.26 s (half
     a beat) by mid-song, Hendrix's by 0.23 s. So these tracks carry
     `barTimes` — the downbeat of every bar, in seconds on the FAST file,
     measured by tools/beat-map.py from the rhythm-down-metronome file (the
     plain mix subtracted to isolate the click). barTimes[0] is bar 1 and
     equals `anchor`. snippetWindow() reads windows straight off the list;
     the slow tier is still derived — every click in the slow files lands
     within ~10 ms of the fast click times scaled by trackBpm/trackBpmSlow
     (checked on all 733 Sweet Child and 454 Watchtower clicks).
     Which click is beat 1 is not in the file (Moises clicks every beat the
     same); it was chosen from the chord changes (bass chroma per click)
     and checked for a consistent phase through the whole song. */

  /* Sweet Child O' Mine counts at record speed, 4 to the bar; bar 1 is the
     first click, the top of the intro riff over D.
     Full mixes added 2026-09-27 from a newer Moises export: sample-aligned
     with the rhythm-down files (0.0 ms at 125, -0.9 ms at 100; 445.65 s
     against the old 445.57 s at 100). The first cut had a louder click
     than the rhythm-down-metronome files and a quieter old 192k 100 BPM
     rhythm-down, so pressing Guitar with Metronome on jumped in volume.
     Fixed the same day the way Luna's was: rhythm-down-metronome at 125
     and both rhythm-down files at 100 re-exported from this same Moises
     set — sample-aligned with the full mixes, clicks within 15% of each
     other, music at the same level. The 125 plain rhythm-down is the
     original; its music matches this set's. */
  'sweet-child-o-mine': {
    src:              'audio/guns-n-roses-sweet-child-o-mine-backing-G-125bpm-440hz-rhythm-down.mp3',
    srcSlow:          'audio/guns-n-roses-sweet-child-o-mine-backing-G-100bpm-440hz-rhythm-down.mp3',
    srcFull:              'audio/guns-n-roses-sweet-child-o-mine-backing-G-125bpm-440hz-full.mp3',
    srcFullSlow:          'audio/guns-n-roses-sweet-child-o-mine-backing-G-100bpm-440hz-full.mp3',
    trackBpm: 125, trackBpmSlow: 100,
    feltBpm: 125,                       // counted at record speed
    beatsPerBar: 4,
    durationSec: 356,
    anchor: 0.498,
    anchorVerified: true,
    barTimes: [
      0.498, 2.379, 4.263, 6.139, 8.022, 9.919, 11.822, 13.739, 15.622, 17.518,
      19.401, 21.309, 23.201, 25.110, 27.001, 28.928, 30.822, 32.739, 34.643, 36.559,
      38.478, 40.422, 42.339, 44.259, 46.179, 48.099, 50.001, 51.929, 53.801, 55.679,
      57.580, 59.479, 61.380, 63.298, 65.201, 67.098, 69.001, 70.878, 72.760, 74.639,
      76.542, 78.439, 80.340, 82.311, 84.223, 86.140, 88.044, 90.001, 91.920, 93.879,
      95.822, 97.781, 99.709, 101.643, 103.560, 105.499, 107.422, 109.359, 111.279, 113.220,
      115.159, 117.063, 118.961, 120.885, 122.782, 124.719, 126.642, 128.559, 130.463, 132.360,
      134.242, 136.139, 138.043, 139.960, 141.899, 143.863, 145.780, 147.739, 149.642, 151.580,
      153.500, 155.462, 157.402, 159.339, 161.283, 163.241, 165.171, 167.082, 168.991, 170.940,
      172.882, 174.820, 176.739, 178.703, 180.621, 182.544, 184.442, 186.360, 188.281, 190.242,
      192.145, 194.102, 196.033, 197.979, 199.923, 201.862, 203.799, 205.743, 207.682, 209.629,
      211.564, 213.502, 215.420, 217.363, 219.301, 221.219, 223.142, 225.070, 227.000, 228.941,
      230.870, 232.805, 234.720, 236.660, 238.605, 240.522, 242.440, 244.362, 246.260, 248.205,
      250.141, 252.090, 254.026, 255.943, 257.860, 259.804, 261.714, 263.625, 265.521, 267.460,
      269.361, 271.260, 273.182, 275.101, 277.025, 278.922, 280.804, 282.660, 284.522, 286.384,
      288.240, 290.104, 291.964, 293.820, 295.701, 297.585, 299.453, 301.322, 303.186, 305.061,
      306.966, 308.852, 310.723, 312.633, 314.502, 316.400, 318.282, 320.166, 322.041, 323.904,
      325.780, 327.643, 329.504, 331.422, 333.325, 335.211, 337.125, 339.431, 341.742, 344.101,
      346.541, 348.442, 350.361, 352.326,
    ],
  },
  /* All Along the Watchtower — the Jimi Hendrix recording, the same files
     the Journey page plays. 4 to the bar at record speed; the chords run
     A–G | F–G, G on beat 3 in bar 1 and on the "+" after 3 in bar 2 (song-facts
     skill), a two-bar cycle, so
     bar 1 is the first A — the SECOND click (the first is a G pickup). Odd
     bars start on A, even bars on F, all the way through. */
  'all-along-the-watchtower': {
    src:              'audio/jimi-hendrix-all-along-the-watchtower-backing-Am-115bpm-440hz-rhythm-down.mp3',
    srcSlow:          'audio/jimi-hendrix-all-along-the-watchtower-backing-Am-105bpm-440hz-rhythm-down.mp3',
    srcFull:              'audio/jimi-hendrix-all-along-the-watchtower-backing-Am-115bpm-440hz-full.mp3',
    srcFullSlow:          'audio/jimi-hendrix-all-along-the-watchtower-backing-Am-105bpm-440hz-full.mp3',
    trackBpm: 115, trackBpmSlow: 105,
    feltBpm: 115,
    beatsPerBar: 4,
    durationSec: 245,
    anchor: 1.289,
    anchorVerified: true,
    barTimes: [
      1.289, 3.572, 5.812, 8.052, 10.210, 12.351, 14.513, 16.630, 18.794, 20.971,
      23.133, 25.311, 27.453, 29.610, 31.769, 33.913, 36.011, 38.148, 40.292, 42.411,
      44.493, 46.628, 48.728, 50.828, 52.867, 54.932, 56.989, 59.052, 61.113, 63.167,
      65.233, 67.308, 69.389, 71.568, 73.691, 75.812, 77.931, 80.030, 82.131, 84.248,
      86.333, 88.469, 90.569, 92.671, 94.768, 96.869, 98.908, 100.989, 103.010, 105.049,
      107.088, 109.129, 111.190, 113.290, 115.367, 117.431, 119.488, 121.691, 123.828, 125.970,
      128.070, 130.192, 132.307, 134.428, 136.528, 138.609, 140.709, 142.827, 144.910, 147.027,
      149.112, 151.190, 153.266, 155.368, 157.467, 159.531, 161.571, 163.627, 165.649, 167.708,
      169.772, 171.889, 174.030, 176.152, 178.252, 180.388, 182.488, 184.586, 186.710, 188.832,
      190.948, 193.048, 195.166, 197.271, 199.366, 201.466, 203.507, 205.526, 207.531, 209.550,
      211.566, 213.587, 215.590, 217.632, 219.669, 221.727, 223.746, 225.768, 227.770, 229.788,
      231.829, 233.889, 235.911, 237.966,
    ],
  },
  /* All Along the Watchtower — the Neil Young recording (Jonathan,
     2026-10-30: a Neil Young / Jimi Hendrix switch on the Watchtower
     play-along cards, Jimi the default; the card swaps to this track and
     its own timing — caView, recordingVersions in class-activities.js). The two
     rhythm-down files of the first Neil export (2026-09-18, removed with
     the Hendrix move on 2026-09-27) put back: Am at 440 Hz, 115 and 90 BPM.
     The 90 file came with 2.693 s of lead the 115 file does not have, so it
     was trimmed by exactly that (envelope cross-correlation against the 115
     file stretched by 115/90, agreeing to 0.5 ms across thirds of the song),
     which makes it the same performance as the 115 file stretched — the
     slow tier is derived by scaling, as for every track.
     THE FULL MIX (Jonathan uploaded it at 440 Hz, 2026-10-30, as an m4a of the
     115 BPM record, 380.68 s): trimmed to the rhythm-down file (it started
     9.9406 s earlier, aligned to 0.0 ms in every quarter of the song by
     envelope cross-correlation) and encoded to mp3 320k. NO MOISES EXPORT
     EXISTS FOR ITS SLOW TIER: srcFullSlow is that file time-stretched by
     rubberband, pitch held, by exactly 90/115 (the factor the Moises slow
     rhythm-down file is to its 115 file, which agreed to 0.5 ms across the
     song) and lands within 0.1 ms of the slow rhythm-down in every quarter
     and 0.07 s in length. Swap in a Moises export if one is ever made.
     NOT a click track: a live band, so it carries a beat map, measured with
     tools/beat-map.py on the 115 file against its click-on twin (a
     measuring input, not in the repo). Bar 1 is the A: the click on which
     the bass moves from G to A, the third click (index 2) — the first two
     are a pickup. The map ends at bar 165 (343.8 s): after that the band
     slows to the end and a bar runs 3 s or more, which a steady-tempo
     window cannot follow. The card stops at the end of bar 162 (lap 81):
     in lap 82 (bars 163-164) the band holds the A through the whole lap,
     the start of the ending (review, 2026-10-30). THE RECORD'S TWO-BAR
     LOOP (the bass on every eighth, 86 laps in the file, the same in every
     one that holds the pattern): A on 1 + 2 +, G on 3 + 4, F on the "+"
     after 4 through 7, G from the "+" after 7 to the end (the bass walks
     up a half step into the next A on the last eighth, G# in most laps; the
     chord is still G) — chord changes at beats 1, 3, 4.5 and 7.5 of the 8.
     Laps 70-74 (bars 139-148, a solo) were not confirmed: the bass wanders
     there and does not play the loop. */
  'all-along-the-watchtower-neil': {
    src:              'audio/neil-young-all-along-the-watchtower-backing-Am-115bpm-440hz-rhythm-down.mp3',
    srcSlow:          'audio/neil-young-all-along-the-watchtower-backing-Am-90bpm-440hz-rhythm-down.mp3',
    srcFull:          'audio/neil-young-all-along-the-watchtower-backing-Am-115bpm-440hz-full.mp3',
    srcFullSlow:      'audio/neil-young-all-along-the-watchtower-backing-Am-90bpm-440hz-full.mp3',
    trackBpm: 115, trackBpmSlow: 90,
    feltBpm: 115,
    beatsPerBar: 4,
    durationSec: 371,
    anchor: 1.160,
    anchorVerified: true,
    barTimes: [
      1.160, 3.319, 5.462, 7.558, 9.638, 11.749, 13.817, 15.898, 17.978, 20.081,
      22.179, 24.303, 26.419, 28.539, 30.641, 32.758, 34.858, 36.979, 39.102, 41.239,
      43.339, 45.441, 47.521, 49.623, 51.718, 53.818, 55.939, 58.062, 60.159, 62.299,
      64.401, 66.519, 68.640, 70.760, 72.898, 74.978, 77.101, 79.200, 81.258, 83.400,
      85.518, 87.661, 89.799, 91.940, 94.079, 96.220, 98.322, 100.468, 102.580, 104.703,
      106.783, 108.898, 111.019, 113.160, 115.201, 117.281, 119.384, 121.479, 123.600, 125.722,
      127.824, 129.919, 131.999, 134.121, 136.242, 138.344, 140.439, 142.519, 144.619, 146.720,
      148.780, 150.922, 153.039, 155.140, 157.260, 159.384, 161.500, 163.601, 165.679, 167.803,
      169.919, 171.999, 174.101, 176.242, 178.344, 180.439, 182.500, 184.620, 186.720, 188.822,
      190.881, 192.961, 195.040, 197.121, 199.223, 201.302, 203.400, 205.500, 207.579, 209.681,
      211.802, 213.920, 216.020, 218.120, 220.220, 222.301, 224.353, 226.399, 228.479, 230.560,
      232.640, 234.700, 236.760, 238.840, 240.861, 242.942, 244.981, 247.062, 249.099, 251.160,
      253.226, 255.284, 257.279, 259.361, 261.400, 263.464, 265.480, 267.542, 269.580, 271.625,
      273.662, 275.701, 277.740, 279.763, 281.780, 283.840, 285.864, 287.902, 289.901, 292.000,
      294.101, 296.200, 298.260, 300.341, 302.422, 304.501, 306.561, 308.641, 310.700, 312.760,
      314.805, 316.864, 318.901, 320.961, 322.981, 325.023, 327.103, 329.144, 331.146, 333.205,
      335.263, 337.303, 339.306, 341.461, 343.803,
    ],
  },
  /* Las Mañanitas — Ariel Camacho y Los Plebes del Rancho, "Exclusivo 2018"
     (Jonathan uploaded the recording, 2026-10-14). This is the RECORD
     itself, not a Moises export: there is no rhythm-down mix, so `src` IS
     the full mix and the card has no Guitar toggle. The slow tier is the
     same file time-stretched by rubberband with the pitch held (90/108,
     179.04 s -> 214.848 s, exactly 1.2x); every 5th downbeat checked on it
     lands within ~50 ms of the fast time x 1.2. Tuning measured 1-9 cents
     above A=440 — left alone.

     3/4 at about 108 counted beats a minute, one strum per beat; the room
     counts 3. A live sierreño band with no click, so it carries a beat map.
     No metronome export existed to run tools/beat-map.py on; instead:
     librosa beat tracking (107.7 BPM, 320 beats), bars fitted by dynamic
     programming on the bass (the root on beat 1 — A for A, E for E7, D for
     D), then each downbeat snapped to the nearest onset peak (±40 ms). An
     independent check — harmonic change by beat position, in sliding
     windows — agrees on the phase through the whole song. Bar 62 (101.98 s,
     the end of the requinto solo's chorus pass) really is two beats long:
     the phase moves by one beat there and stays moved. Lyric timing came
     from a speech-to-text pass over the record (Whisper), which also
     showed the record plays A, not the chord sheet's Am, in verse 2.
     Song map on this list: intro 1-10, verse 1 11-46 (bar 11 holds the
     pickup "Qué"), chorus 47-54, solo 55-68, verse 2 69-96, chorus 97-104,
     outro 105-107 ("¡Adiós!" at 173.9 s). */
  'las-mananitas': {
    src:     'audio/ariel-camacho-las-mananitas-backing-A-108bpm-440hz-full.mp3',
    srcSlow: 'audio/ariel-camacho-las-mananitas-backing-A-90bpm-440hz-full.mp3',
    trackBpm: 108, trackBpmSlow: 90,
    feltBpm: 108,
    beatsPerBar: 3,
    durationSec: 179,
    anchor: 0.566,
    anchorVerified: true,
    defaultSlow: true,
    barTimes: [
      0.566, 2.247, 3.895, 5.509, 7.111, 8.742, 10.614, 12.176, 13.796, 15.340,
      16.919, 18.588, 20.259, 21.975, 23.716, 25.406, 27.130, 28.729, 30.293, 31.983,
      33.689, 35.416, 37.155, 38.830, 40.458, 42.043, 43.648, 45.305, 46.977, 48.628,
      50.292, 52.039, 53.653, 55.336, 56.924, 58.552, 60.172, 61.843, 63.451, 65.199,
      66.911, 68.580, 70.307, 71.944, 73.546, 75.267, 76.960, 78.655, 80.344, 82.022,
      83.740, 85.455, 87.176, 88.892, 90.552, 92.215, 93.852, 95.570, 97.167, 98.853,
      100.389, 102.060, 103.233, 104.977, 106.597, 108.217, 109.819, 111.650, 113.366, 115.043,
      116.735, 118.442, 120.091, 121.719, 123.307, 125.034, 126.726, 128.450, 130.145, 131.817,
      133.407, 135.021, 136.748, 138.446, 140.159, 141.819, 143.511, 145.183, 146.826, 148.480,
      150.195, 151.922, 153.646, 155.339, 157.057, 158.700, 160.441, 162.168, 163.872, 165.547,
      167.256, 168.925, 170.606, 172.391, 173.926, 175.607, 177.337,
      179.000,   // not a downbeat: the end of the file (179.04 s), so bar 107 — the last chord — has an end and the outro snippet can reach it
    ],
  },
  /* Madrecita Querida — Vicente Fernández (Jonathan uploaded the recording,
     2026-10-16). Like Las Mañanitas this is the RECORD itself, not a Moises
     export: no rhythm-down mix, so `src` IS the full mix and there is no
     Guitar toggle. TWO keys, for ca-36's Key of G / Key of F switch
     (keyVersions — caView): the record is in F and about 17 cents sharp
     (measured 6-30 cents across the song, 16 on the bass), so the F files
     are shifted down 17 cents to A=440, and the G files up 183 cents (two
     half steps minus the same 17), formants held so the voice stays
     natural. Every file is rubberband with the timing untouched, so the two
     keys share ONE bar map (checked against the source: 0 ms and 6 ms
     onset offset) — 1d fails the push if the two entries' barTimes differ.
     Slow tier: the same file stretched 78/65 = exactly 1.2x, pitch held.

     Counted in 4 at about 78 a minute; the band's chords change every two
     beats at most, so a chord column in ca-36 is 2, 4, 6 or 8 beats. A live
     mariachi with no click, so it carries a beat map: madmom's downbeat
     tracker (RNN + DBN, 2 beats a bar, 293 beats from 5.11 s) — it follows
     the band through the two slow-downs ("a llorar" in each chorus) and the
     slow ending, where librosa's steady tracker ran ahead by up to a beat —
     each beat snapped to the nearest bass onset within 50 ms, every 4th beat
     a downbeat here. Bar 1 is the first downbeat after the opening flourish
     (5.11 s, before "¡Ahí va pues!"); the flourish itself is not in time.
     Song map in these 4-beat bars: intro 1-8, verse 1 9-24, chorus 25-35,
     bridge 36-42 (the intro's chords, with the line about a mother), verse 2
     43-58, chorus 59-67, ending 68-72 (slow), the last chord at 72. The last
     entry, 235.119, is the last beat the tracker found, 0.5 s before the end
     of the file. */
  'madrecita-querida': {
    src:     'audio/vicente-fernandez-madrecita-querida-backing-G-78bpm-440hz-full.mp3',
    srcSlow: 'audio/vicente-fernandez-madrecita-querida-backing-G-65bpm-440hz-full.mp3',
    trackBpm: 78, trackBpmSlow: 65,
    feltBpm: 78,
    beatsPerBar: 4,
    durationSec: 235,
    anchor: 5.114,
    anchorVerified: true,
    defaultSlow: true,
    barTimes: [
      5.114, 8.092, 11.128, 14.164, 17.148, 20.120, 23.104, 26.273, 29.414, 32.694,
      35.869, 39.039, 42.173, 45.151, 48.112, 51.183, 54.253, 57.313, 60.320, 63.460,
      66.461, 69.445, 72.528, 75.546, 78.629, 81.647, 84.904, 88.300, 91.860, 95.237,
      98.464, 101.494, 104.629, 107.688, 110.771, 113.818, 116.860, 119.908, 122.950, 125.945,
      128.958, 131.970, 135.123, 138.124, 141.119, 144.173, 147.215, 150.221, 153.223, 156.154,
      159.219, 162.255, 165.314, 168.380, 171.381, 174.364, 177.377, 180.436, 183.496, 186.480,
      189.701, 193.370, 196.586, 199.860, 203.262, 206.350, 209.560, 213.322, 217.120, 220.671,
      224.142, 227.683, 231.310, 235.119,
    ],
  },
  /* The same record in its own key, F (see above) — ca-36's Key of F. Same
     bar map, number for number. */
  'madrecita-querida-f': {
    src:     'audio/vicente-fernandez-madrecita-querida-backing-F-78bpm-440hz-full.mp3',
    srcSlow: 'audio/vicente-fernandez-madrecita-querida-backing-F-65bpm-440hz-full.mp3',
    trackBpm: 78, trackBpmSlow: 65,
    feltBpm: 78,
    beatsPerBar: 4,
    durationSec: 235,
    anchor: 5.114,
    anchorVerified: true,
    defaultSlow: true,
    barTimes: [
      5.114, 8.092, 11.128, 14.164, 17.148, 20.120, 23.104, 26.273, 29.414, 32.694,
      35.869, 39.039, 42.173, 45.151, 48.112, 51.183, 54.253, 57.313, 60.320, 63.460,
      66.461, 69.445, 72.528, 75.546, 78.629, 81.647, 84.904, 88.300, 91.860, 95.237,
      98.464, 101.494, 104.629, 107.688, 110.771, 113.818, 116.860, 119.908, 122.950, 125.945,
      128.958, 131.970, 135.123, 138.124, 141.119, 144.173, 147.215, 150.221, 153.223, 156.154,
      159.219, 162.255, 165.314, 168.380, 171.381, 174.364, 177.377, 180.436, 183.496, 186.480,
      189.701, 193.370, 196.586, 199.860, 203.262, 206.350, 209.560, 213.322, 217.120, 220.671,
      224.142, 227.683, 231.310, 235.119,
    ],
  },
  /* Arsenal Efectivo — Lolo Félix (Jonathan uploaded the recording,
     2026-10-16). Like Las Mañanitas and Madrecita Querida this is the RECORD
     itself, not a Moises export: no rhythm-down mix, so `src` IS the full
     mix and there is no Guitar toggle. The record is about 14 cents sharp
     (13-16 across the song), so both files are rubberband-shifted down 14
     cents to A=440, formants held, timing untouched (the fast file's grid
     fits at the same phase as the source, 0 ms). Slow tier: the same file
     stretched 119/100 = exactly 1.19x, pitch held (fits 6 ms off the scaled
     grid).

     A STEADY GRID, not a beat map: the record is made to a click. The
     eighth note is 0.25211 s (238.0 a minute) and an onset-strength fit
     holds its phase within 8 ms from 0 to 175 s. The song is 6/8 felt in
     two, like Luna: six eighths a bar, two big beats of three, so the room
     counts 238 / 3 = 79.3 and a bar is 1.513 s. Which eighth is beat 1 came
     from the chords: the verse loop's B, E and A all start on the same
     eighth of the six, and the bass lands on the root there. anchor 1.369 s
     is that first downbeat (bar 1 is the intro's first full bar). Song map
     in these bars: intro 1-19 (the spoken opening at bar 8), verse 1 20-53,
     bridge 54-83 (spoken lines and the band alone from about 113 s), verse
     2 84-117, ending 118-141, the last chord ringing out to 216 s. */
  'arsenal-efectivo': {
    src:     'audio/lolo-felix-arsenal-efectivo-backing-A-119bpm-440hz-full.mp3',
    srcSlow: 'audio/lolo-felix-arsenal-efectivo-backing-A-100bpm-440hz-full.mp3',
    trackBpm: 119, trackBpmSlow: 100,   // what the FILES are (quarter notes), for the slow-tier rescale
    feltBpm: 238 / 3,                   // big beats: 3 eighth notes each
    beatsPerBar: 2,                     // two big beats per 6/8 bar
    countSix: true,                     // chord grid counts the bar 1-6 — see COUNT IN SIX
    durationSec: 216,
    anchor: 1.369,
    anchorVerified: true,
    defaultSlow: true,
  },
  /* Ella — Junior H (Jonathan uploaded the recording, 2026-10-19). Like
     Arsenal Efectivo this is the RECORD itself, not a Moises export: no
     rhythm-down mix, so `src` IS the full mix and there is no Guitar
     toggle. Tuning measured about 5 cents above A=440 — left alone, like
     Las Mañanitas. Both files are the record re-encoded at 192k, timing
     untouched; the slow tier is rubberband, pitch held, 185/155 = 1.194x
     (its grid fits about 15 ms early of the scaled one, steady).

     A STEADY GRID: the record is made to a click. The eighth note is
     185.00 a minute (0.32432 s); an onset-strength fit holds its phase
     within 7 ms from 0 to 255 s. 6/8 felt in two, like Arsenal Efectivo:
     six eighths a bar, two big beats of three, so the room counts
     185 / 3 = 61.7 and a bar is 1.946 s. Which eighth is beat 1 came from
     the chords: across the song the harmony changes most on one eighth of
     the six, and the bass lands on the root there. anchor 0.864 s is that
     first downbeat. Song map in these bars, read off the harmony and the
     centre-panned (voice) energy: requinto intro 1-26 (the chord loop
     starts at 11), singing 27-66 (pickup in 26), requinto solo 67-82,
     singing 83-114 (pickup in 82), ending 115-132, the last Em ringing to
     260 s. */
  'ella': {
    src:     'audio/junior-h-ella-backing-Em-185bpm-440hz-full.mp3',
    srcSlow: 'audio/junior-h-ella-backing-Em-155bpm-440hz-full.mp3',
    trackBpm: 185, trackBpmSlow: 155,   // what the FILES are (eighth notes), for the slow-tier rescale
    feltBpm: 185 / 3,                   // big beats: 3 eighth notes each
    beatsPerBar: 2,                     // two big beats per 6/8 bar
    countSix: true,                     // chord grid counts the bar 1-6 — see COUNT IN SIX
    durationSec: 260,
    anchor: 0.864,
    anchorVerified: true,
    defaultSlow: true,
  },
  /* Perdón Mamá — Chuy Montana, the Rembeats version (Jonathan uploaded the
     record, 2026-11-09). Like Ella this is the RECORD itself: no rhythm-down
     mix, so `src` IS the full mix and there is no Guitar toggle. Tuning
     within 5 cents of A=440 (left alone). Both files are the record
     re-encoded at 320k, 48 kHz, then levelled with tools/loudness.py (+3.50
     dB, no spread). The slow tier is rubberband, pitch held, 115/96 =
     1.198x (its grid fits 4 ms off the scaled one, steady).

     A STEADY GRID: the record is made to a click. An onset-strength fit over
     the whole file gives exactly 115.000 pulses a minute and holds its phase
     within 4 ms from 0 to 180 s. It is 6/8 felt in two, like Arsenal
     Efectivo and Luna (Jonathan, 2026-11-10, after a review measured the
     accents: strong every 6 pulses, the bass cell root-root-fifth every 3):
     the pulses are the 6/8's eighth notes in pairs, so the eighth note is
     230 a minute, a bar is 3 pulses (1.565 s) and the room counts
     230 / 3 = 76.7 big beats a minute, two to a bar. The first two pulses
     are a near-silent lead-in; bar 1 is the first loud C#m, pulse 2 of the
     file (0.100 + 2 x 60/115 = 1.143 s). Five signs agree on that pulse: the
     first loud hit, the bass cell starts, every chord change, the strongest
     accent and the final C#m (pulse 338, bar 113). Jonathan to confirm by ear
     with ?snipcal=1. The harmony is ONE 8-bar loop (one chord a bar: C#m C#m
     B B F#m F#m A B), the bass agreeing on 93% of the pulses. Song map in
     these bars, read off the loop and the mid-band (voice) energy: band
     alone 1-16, singing from about 18 to 49, band alone to 65, singing from
     about 66 to 103, band alone to 112, the last C#m at bar 113 ringing to
     the end of the file. */
  'perdon-mama': {
    src:     'audio/chuy-montana-perdon-mama-backing-E-115bpm-440hz-full.mp3',
    srcSlow: 'audio/chuy-montana-perdon-mama-backing-E-96bpm-440hz-full.mp3',
    trackBpm: 115, trackBpmSlow: 96,    // what the FILES are (the 6/8's quarter-note pulses), for the slow-tier rescale
    feltBpm: 230 / 3,                   // big beats: 3 eighth notes each
    beatsPerBar: 2,                     // two big beats per 6/8 bar
    countSix: true,                     // chord grid counts the bar 1-6 — see COUNT IN SIX
    durationSec: 181,
    anchor: 1.143,
    anchorVerified: true,
    defaultSlow: true,
  },
  /* Smells Like Teen Spirit — Nirvana (Jonathan uploaded the record — the
     music-video audio, 278.4 s — 2026-10-25). Unlike the other uploaded
     records this one HAS a Guitar toggle: the guitar-out mix was made here,
     not in Moises — Demucs htdemucs_6s split the record, and the
     `rhythm-down` file is the record minus the guitar stem (sample-aligned
     with the full mix, 0 ms; both scaled by 0.97 for headroom, so the
     toggle does not jump in level). The solo's lead guitar is mostly in the
     guitar stem too, so the rhythm-down solo is drums, bass and a little
     lead. Bars 1-4 are the clean guitar alone on the record, so the
     rhythm-down file is SILENT there — the student plays the intro alone
     and the band comes in at bar 5. Tuning about 5 cents above A=440 —
     left alone, like Ella. 192k, 44.1 kHz. Slow tier: rubberband, pitch
     held, 117/100 = 1.17x (fits 6 ms off the scaled grid, steady).

     Counted in 4 at record speed. The band settles at about 117; the clean
     intro is about 110, so this is a BEAT MAP, not a grid: librosa's beat
     tracker on the full mix, each beat snapped to the nearest drum/guitar
     onset (stems) within 60 ms and smoothed over 5 beats. Which beat is 1
     came from the chords: the bass lands on F and Ab on beats 1 of
     alternate bars all the way through. Bar 1 is the first F of the clean
     intro (1.068 s). Song map in these bars, read off the vocal and guitar
     stems: intro 1-8 (clean 1-4), verse 1 9-28 (singing from 13, "hello"
     from 21), chorus 29-40, interlude 41-44, verse 2 45-64, chorus 65-76,
     interlude 77-80, solo 81-92, verse 3 93-108, chorus 109-120, outro
     121-128, the last F from 129, ringing to about 272 s. The last two
     entries are past the music, so the last chord's window has an end. */
  'smells-like-teen-spirit': {
    src:         'audio/nirvana-smells-like-teen-spirit-backing-Fm-117bpm-440hz-rhythm-down.mp3',
    srcSlow:     'audio/nirvana-smells-like-teen-spirit-backing-Fm-100bpm-440hz-rhythm-down.mp3',
    srcFull:     'audio/nirvana-smells-like-teen-spirit-backing-Fm-117bpm-440hz-full.mp3',
    srcFullSlow: 'audio/nirvana-smells-like-teen-spirit-backing-Fm-100bpm-440hz-full.mp3',
    trackBpm: 117, trackBpmSlow: 100,
    feltBpm: 117,                       // counted at record speed
    beatsPerBar: 4,
    durationSec: 278,
    anchor: 1.068,
    anchorVerified: true,
    defaultSlow: true,
    barTimes: [
      1.068, 3.272, 5.442, 7.603, 9.725, 11.781, 13.803, 15.810, 17.848, 19.918,
      21.992, 24.072, 26.150, 28.223, 30.293, 32.374, 34.453, 36.534, 38.610, 40.688,
      42.767, 44.837, 46.901, 48.967, 51.027, 53.077, 55.118, 57.162, 59.187, 61.226,
      63.281, 65.337, 67.381, 69.420, 71.464, 73.496, 75.528, 77.563, 79.592, 81.620,
      83.672, 85.752, 87.800, 89.853, 91.892, 93.949, 96.024, 98.114, 100.186, 102.249,
      104.319, 106.397, 108.476, 110.573, 112.657, 114.723, 116.800, 118.878, 120.941, 123.011,
      125.067, 127.108, 129.137, 131.166, 133.171, 135.219, 137.272, 139.310, 141.357, 143.404,
      145.438, 147.473, 149.512, 151.531, 153.551, 155.563, 157.603, 159.659, 161.683, 163.722,
      165.751, 167.764, 169.780, 171.806, 173.825, 175.856, 177.890, 179.928, 181.971, 184.019,
      186.079, 188.142, 190.203, 192.265, 194.325, 196.393, 198.454, 200.507, 202.569, 204.630,
      206.695, 208.747, 210.799, 212.842, 214.876, 216.906, 218.929, 220.948, 222.946, 224.986,
      227.018, 229.031, 231.055, 233.088, 235.121, 237.147, 239.156, 241.152, 243.158, 245.175,
      247.183, 249.223, 251.288, 253.336, 255.384, 257.427, 259.459, 261.486, 263.536, 265.548,
      267.550, 269.588,
    ],
  },
  /* Vuelve a la Vida — Efecto Elegante (Jonathan uploaded the record — the
     official-video audio, 215.3 s — 2026-10-26). Like Ella this is the
     RECORD itself: no rhythm-down mix, so `src` IS the full mix and there is
     no Guitar toggle. Key of Bb (Bb, Gm, Eb, Cm, F); Jonathan chose to keep
     the record's key and play it on power chords (2026-10-26). Tuning about
     6 cents above A=440 — left alone, like Ella. Both files 320k, 48 kHz;
     the slow tier is rubberband, pitch held, 147/120 = 1.225x. Levelled with
     tools/loudness.py --accept-spread (-0.91 dB): the stretched slow file
     lands 1.36 LU under the record, the same spread Ella and Las Mañanitas
     shipped with.

     A STEADY GRID: the record is made to a click. Counted in 3 at 147 a
     minute (quarter notes; the eighths are the 294 pulse), one bar 1.2245 s.
     An onset fit holds the beat's phase within 10 ms from 0 to 195 s; after
     that the ending is sung without a steady beat, so the card stops before
     it. Which beat is 1 came from the bass: it is loudest on one beat of
     the three and changes root there. anchor 0.085 s is that first
     downbeat (bar 1 is a pickup). Chords read off the Demucs stems (guitar
     chroma per beat, bass root on beat 1). Song map in these bars: singing
     2-51 (an 18-bar opening phrase, then the 16-bar loop twice), break
     52-56 (Bb F Bb, then a two-bar band run), solo 57-72, singing 73-136
     (the loop four times), break 137-140, solo 141-156 plus Eb F F in
     157-159, free-time sung ending from bar 160 to the end. The loop is
     Bb 4 bars · Gm 4 · Eb 2 · Cm 2 · F 4. */
  'vuelve-a-la-vida': {
    src:     'audio/efecto-elegante-vuelve-a-la-vida-backing-Bb-147bpm-440hz-full.mp3',
    srcSlow: 'audio/efecto-elegante-vuelve-a-la-vida-backing-Bb-120bpm-440hz-full.mp3',
    trackBpm: 147, trackBpmSlow: 120,
    feltBpm: 147,
    beatsPerBar: 3,
    durationSec: 215,
    anchor: 0.085,
    anchorVerified: true,
    defaultSlow: true,
  },
};
/* Does this track have a full mix at all? Both tiers or neither — the toggle
   has to survive the Slow button. */
function snippetHasFull(tr){ return !!(tr && tr.srcFull && tr.srcFullSlow); }
/* Where a snippet's window falls in whichever tempo tier is playing.
   Everything downstream (the loop, the bar dots, the tier switch) reads the
   window from here so there is one copy of the bar arithmetic. */
function snippetWindow(tr, spec, slow){
  const scale = slow ? (tr.trackBpm / tr.trackBpmSlow) : 1;
  const from = Math.max(1, spec.fromBar), n = Math.max(1, spec.bars);
  /* `edges` holds the n+1 bar lines of the window. A steady-grid track
     spaces them evenly; a live-band track (barTimes) reads each one off its
     beat map, so the bars inside one window can differ in length. Past the
     last measured downbeat it extends at the average bar — 1ak refuses a
     window that gets there, so that is only a guard. */
  let edges;
  if(Array.isArray(tr.barTimes) && tr.barTimes.length > 1){
    const bt = tr.barTimes, last = bt.length - 1;
    const avg = (bt[last] - bt[0]) / last;
    const at = i => (i <= last ? bt[i] : bt[last] + (i - last) * avg) * scale;
    edges = Array.from({ length: n + 1 }, (_, k) => at(from - 1 + k));
  } else {
    const bar = (tr.beatsPerBar * 60 / tr.feltBpm) * scale;
    const start = (tr.anchor * scale) + (from - 1) * bar;
    edges = Array.from({ length: n + 1 }, (_, k) => start + k * bar);
  }
  const start = edges[0], end = edges[n];
  return { start, end, bar: (end - start) / n, edges };
}
/* Position inside a window in BARS (fractional), and back again. Every
   reader of the window goes through these two, so uneven bars on a
   beat-mapped track light the right dot and survive a tier switch. */
function snipBarsAt(win, t){
  const e = win.edges, n = e.length - 1;
  if(t <= e[0]) return (t - e[0]) / (e[1] - e[0]);
  for(let i = 0; i < n; i++) if(t < e[i + 1]) return i + (t - e[i]) / (e[i + 1] - e[i]);
  return n + (t - e[n]) / (e[n] - e[n - 1]);
}
function snipTimeAtBars(win, b){
  const e = win.edges, n = e.length - 1;
  if(!(b > 0)) return e[0];
  if(b >= n) return e[n];
  const i = Math.floor(b);
  return e[i] + (b - i) * (e[i + 1] - e[i]);
}
/* The Slowest tier (Jonathan, 2026-09-29), on practice cards (a card with
   `slowest: true`) and on every step snippet: the SLOW file played at
   SLOWEST_RATE with the pitch held, so no extra export and the tuner still
   agrees with the band. Anything that reads the file's own clock
   (currentTime, the bar windows) is unchanged; only real-time amounts —
   output latency, a scheduled click — are scaled by the rate. */
const SLOWEST_RATE = 0.8;
function slowestApplyRate(audio, rate){
  audio.preservesPitch = true;
  audio.mozPreservesPitch = true;
  audio.webkitPreservesPitch = true;
  audio.defaultPlaybackRate = rate;    // a load() resets playbackRate to this
  audio.playbackRate = rate;
}
function snipRate(card){ return card && card.dataset.slowest === '1' ? SLOWEST_RATE : 1; }
function snippetSrc(tr, slow, guitar){
  // Guitar on is only ever honoured when the full mix is actually there; a
  // missing export falls back to rhythm-down rather than a 404 on press.
  // Metronome is not a file — the site makes the click (snipScheduleClick).
  if(guitar && snippetHasFull(tr)) return slow ? tr.srcFullSlow : tr.srcFull;
  return slow ? tr.srcSlow : tr.src;
}
/* THE TWIN — a Guitar toggle with no wait (Jonathan: "a delay when I toggle
   the guitar"). The two mixes are different FILES, so flipping the toggle used
   to mean src= and load() on a ~14 MB mp3, then a seek, and the song went
   quiet until the new file had buffered. So a card whose song has a full mix
   keeps a SECOND element on the other mix, muted, playing in step with the
   audible one. The toggle only swaps which of the two is muted — nothing
   loads, nothing seeks.
   The twin is never trusted until it has proved itself: twinReady() wants it
   on the right file, playing, buffered and within TWIN_READY_SEC of the
   audible element. Until then (first seconds of a play, slow Wi-Fi, just after
   a lap seek) the caller takes the old reload path, so the worst case is what
   the cards did before.
   Kept in step by RATE, not by seeking: a seek on an mp3 lands late by a few
   tens of milliseconds, so seeking to "fix" a small gap just makes another
   one. A twin a little behind runs a little fast (at most 5%, it is muted)
   until the gap closes; only a gap over TWIN_SNAP_SEC (the song looped, the
   student scrubbed) seeks, and at most twice a second.
   Whoever owns the state (`st`: snipState or pcState) stops the twin on every
   exit — it is one more element to pause and empty.
   Only the teacher loads it up front — see twinWanted(). */
const TWIN_READY_SEC = 0.06, TWIN_SNAP_SEC = 0.25;
/* A speed switch that keeps the file (Slowest <-> Slower, Slow <-> Normal)
   lands on the position it is already at; seek only if it is further off. */
const SAME_FILE_SEEK_SEC = 0.05;
/* WHO LOADS THE TWIN UP FRONT (Jonathan, 2026-10-26). Parking it on every Play
   pulled BOTH mixes (10-14 MB each) on a song's first play, for every
   Chromebook on one classroom Wi-Fi. So only the teacher — the console, or the
   student app signed in as the teacher — parks it as soon as the song plays.
   Everyone else loads one mix; their first Guitar press on a card takes the
   old reload path (a short gap) and marks the card `data-twin`, and from then
   on the twin parks, so later presses are instant. The mark is on the card's
   element, so it lasts through Stop and Play until the card is re-rendered. */
function twinPreloadsAll(){
  return IS_TEACHER_MODE || !!(currentUser && typeof TEACHER_EMAIL !== 'undefined' && currentUser.email === TEACHER_EMAIL);
}
function twinWanted(host){ return twinPreloadsAll() || !!(host && host.dataset.twin === '1'); }
function twinSrcIs(el, src){ return !!el && (el.getAttribute('src') === src || (el.src || '').endsWith(src)); }
/* Point the twin at `src` (the other mix of the tier now playing), creating it
   on first use. Does nothing while it is already there. `onLost(el)` is the
   owner's own load-failure handler (snipAudioError / pcAudioError). */
function twinPark(st, src, onLost){
  let tw = st.twin;
  if(!tw){
    tw = st.twin = new Audio();
    tw.preload = 'auto';
    tw.loop = false;
    tw.muted = true;
    /* A twin that cannot load is just dropped: the toggle falls back to a
       reload. But after a Guitar swap this element is the AUDIBLE one, and a
       failure then has to stop the card and say so, like any other playing
       element — without this the card sat on Stop over silence. */
    tw.addEventListener('error', () => { if(st.twin === tw) st.twin = null; else if(onLost) onLost(tw); }, { once: true });
  }
  tw.muted = true;
  if(twinSrcIs(tw, src)) return;
  try { tw.pause(); } catch(e) {}
  tw.src = src;
  tw.load();
}
function twinStop(st){
  const tw = st.twin;
  st.twin = null;
  if(tw){ try { tw.pause(); tw.src = ''; } catch(e) {} }
}
/* Once per frame, from the owner's rAF loop. */
function twinFollow(st, main){
  const tw = st.twin;
  if(!tw || tw.readyState < 3 || tw.seeking) return;
  if(main.paused || main.ended){ if(!tw.paused) tw.pause(); return; }
  const base = main.playbackRate || 1;
  const gap = main.currentTime - tw.currentTime;           // > 0: the twin is behind
  if(Math.abs(gap) > TWIN_SNAP_SEC){
    const now = performance.now();
    if(now - (st.twinSnapAt || 0) > 500){
      st.twinSnapAt = now;
      try { tw.currentTime = main.currentTime; } catch(e) {}
    }
    return;
  }
  tw.preservesPitch = tw.mozPreservesPitch = tw.webkitPreservesPitch = true;
  tw.playbackRate = base * (1 + Math.max(-0.05, Math.min(0.05, gap * 0.5)));
  if(tw.paused) tw.play().catch(() => {});
}
function twinReady(st, main, src){
  const tw = st.twin;
  return !!(tw && twinSrcIs(tw, src) && tw.readyState >= 3 && !tw.seeking && !tw.paused
    && !main.paused && Math.abs(tw.currentTime - main.currentTime) < TWIN_READY_SEC);
}
/* Make the twin the audible element. Returns the element that was playing, now
   the muted twin; the caller stores both. */
function twinSwap(st, main){
  const tw = st.twin;
  tw.muted = false;
  main.muted = true;
  slowestApplyRate(tw, main.playbackRate || 1);
  st.twin = main;
  return tw;
}
/* ONE builder, called by caStepHtml() in app.js AND
   renderTeacherActivityDetail() in teacher.js — the same shape buildTab()
   already has, which is how a step field satisfies the two-renderers rule
   without two copies of it (CLAUDE.md). The preview plays for real: audio
   needs nothing from inside #app, unlike the YouTube panel. */
function buildSnippet(spec, opts){
  if(!spec || !spec.track) return '';
  const tr = SNIPPET_TRACKS[spec.track];
  if(!tr) return '';
  const bars = Math.max(1, spec.bars || 4);
  const title = spec.label ? tf(spec, 'label') : t('ca.snipDefaultTitle');
  const slowFelt = Math.round(tr.feltBpm * tr.trackBpmSlow / tr.trackBpm);
  const data = JSON.stringify({ track: spec.track, fromBar: Math.max(1, spec.fromBar || 1), bars });
  /* Which tempo the card opens on — see defaultSlow in SNIPPET_TRACKS. The
     engine reads data-slow and the turtle reads aria-pressed, so both have to
     be written from the same value or the button lies about what is playing.
     Nothing persists the tier, so this is the state on every render, including
     the teacher console's preview (same builder, both renderers). */
  const startSlow = tr.defaultSlow === true;
  // One dot per bar of the loop, lit as it passes. A loop with no visible
  // position is the thing that makes a student think it's broken — this is
  // the same "the moving thing is the thing making noise" rule the TAB
  // player's beat cursor follows.
  const dots = Array.from({ length: bars }, (_, i) =>
    `<span class="snip-bar"><span class="snip-bar-n">${i + 1}</span></span>`).join('');
  const cal = window.__snipCal
    ? `<div class="snip-cal"><span class="snip-cal-time">0.00 s</span></div>` : '';
  /* The Guitar toggle exists only where the full mix does, and starts ON: the
     point of it is that the student hears the part played correctly before
     they are asked to supply it. data-guitar carries that initial state so
     the engine and the button agree without the engine reading aria- state. */
  const hasFull = snippetHasFull(tr);
  const guitarBtn = hasFull
    ? `<button type="button" class="snip-toggle snip-guitar on" aria-pressed="true" onclick="snipSetTier(this,'guitar')" title="${escAttr(t('ca.snipGuitarTitle'))}">&#x1F3B8; <span class="snip-guitar-label">${escHtml(t('ca.snipGuitarOn'))}</span></button>`
    : '';
  return `<div class="snip" data-snip="${escAttr(data)}"${hasFull ? ' data-guitar="1"' : ''}${startSlow ? ' data-slow="1"' : ''}>`
    + `<div class="snip-head"><span class="snip-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M3 12h2l2-6 3 14 3-11 2 5h6"/></svg></span>`
    + `<span class="snip-title">${escHtml(title)}</span><span class="snip-kind">${escHtml(t('ca.snipKind'))}</span></div>`
    + `<div class="snip-body">`
    + `<div class="snip-controls">`
    + `<button type="button" class="snip-play" onclick="snipToggle(this)">${snipPlayBtnHtml(false)}</button>`
    + `<button type="button" class="snip-toggle snip-slowest" aria-pressed="false" onclick="snipSetTier(this,'slowest')">${escHtml(t('ca.snipSlowest', { bpm: Math.round(slowFelt * SLOWEST_RATE) }))}</button>`
    + `<button type="button" class="snip-toggle snip-slow${startSlow ? ' on' : ''}" aria-pressed="${startSlow ? 'true' : 'false'}" onclick="snipSetTier(this,'slow')">&#x1F422; ${escHtml(t('journey.slow', { bpm: slowFelt }))}</button>`
    + `<button type="button" class="snip-toggle snip-metro" aria-pressed="false" onclick="snipSetTier(this,'metro')">&#x1F3B5; ${escHtml(t('tools.metronome'))}</button>`
    + guitarBtn
    + `</div>`
    + `<div class="snip-bars" aria-hidden="true">${dots}</div>`
    + `<div class="snip-note">${escHtml(t((opts && opts.hasTab) ? 'ca.snipLoopNote' : 'ca.snipLoopNoteNoTab', { n: bars }))}</div>`
    + cal
    + `</div></div>`;
}
/* The Guitar button's label names WHO PLAYS THE PART rather than claiming an
   on/off, because "off" is the rhythm-down mix and that only turns the part
   DOWN. Called from both paths that can change the state — the press itself
   and nothing else — so it cannot go stale. */
function snipGuitarLabel(btn, on){
  if(!btn) return;
  const lab = btn.querySelector('.snip-guitar-label');
  if(lab) lab.textContent = t(on ? 'ca.snipGuitarOn' : 'ca.snipGuitarOff');
}
function snipPlayBtnHtml(playing){
  return (playing ? '&#x25A0; ' : '&#x25B6; ')
    + `<span class="snip-play-label">${escHtml(t(playing ? 'ca.snipStop' : 'ca.snipPlay'))}</span>`;
}
/* One snippet plays at a time, and it shares the site's one-sound-at-a-time
   rule with the TAB player: starting either stops the other (see
   playSequence and stopAllDemoAudio). Two unsynced sources in one step —
   the tab's synthesised notes over the band — is the one way this feature
   gets genuinely confusing, so it is closed off at both ends. */
let snipState = null;
function snipStop(){
  if(!snipState) return;
  const { card, audio, raf } = snipState;
  const gone = snipState;
  snipState = null;                    // first, so the tick's own guard bails
  if(raf) cancelAnimationFrame(raf);
  try { audio.pause(); audio.src = ''; } catch(e) {}
  twinStop(gone);
  if(card && card.isConnected){
    const btn = card.querySelector('.snip-play');
    if(btn){ btn.innerHTML = snipPlayBtnHtml(false); btn.classList.remove('playing'); }
    card.querySelectorAll('.snip-bar').forEach(d => d.classList.remove('bar-now'));
    // Forget the last page the band turned to: a student who stops the band,
    // pages ahead with Next, and restarts would otherwise stay on that page
    // for a whole page of music, because the band's first page "matches".
    const tabEl = card.parentElement && card.parentElement.querySelector('.tab[data-total-notes]');
    if(tabEl) delete tabEl.dataset.snipPage;
  }
}
function snipToggle(btn){
  const card = btn.closest('.snip');
  if(!card) return;
  if(snipState && snipState.card === card){ snipStop(); return; }
  /* Same guard playSequence() and strumChord() open with: the Coach's mic
     check renders inside class-activity tab cards (buildTab is called there
     without suppressCoach), and the snippet sits directly under it — so
     without this, pressing Play two inches below a live mic scores the
     speakers instead of the student, and the full mix is playing the exact
     part being graded. */
  if(window.coachMicLive) return;
  snipStop();
  // Everything else the site can play, silenced — including a TAB sequence
  // running in a sibling step.
  if(typeof stopAllDemoAudio === 'function') stopAllDemoAudio();
  let spec; try { spec = JSON.parse(card.dataset.snip); } catch(e) { return; }
  const tr = spec && SNIPPET_TRACKS[spec.track];
  if(!tr) return;
  const slow = card.dataset.slow === '1';
  const guitar = card.dataset.guitar === '1';
  const win = snippetWindow(tr, spec, slow);
  const audio = new Audio();
  audio.preload = 'auto';
  audio.loop = false;                  // the window is looped by hand, below
  audio.src = snippetSrc(tr, slow, guitar);
  slowestApplyRate(audio, snipRate(card));
  /* The bar dots and the sibling tab are looked up once, not every frame:
     both are built with the card and nothing rewrites them in place — any
     re-render replaces the card too, and the tick stops on !isConnected. */
  snipState = { card, audio, spec, tr, win, raf: 0, lastBeat: -1, cal: card.querySelector('.snip-cal'),
    dots: [...card.querySelectorAll('.snip-bar')], lastBar: -1,
    tab: card.parentElement && card.parentElement.querySelector('.tab[data-total-notes]') };
  btn.innerHTML = snipPlayBtnHtml(true);
  btn.classList.add('playing');
  // preload='none' would leave currentTime unsettable until metadata lands;
  // seek as soon as it does, whichever side of the event we are on.
  /* These files are big (the full mixes are ~14 MB) and are not precached —
     sw.js warms audio/ on first play — so a classroom Wi-Fi stall on a first
     press means loadedmetadata never fires. Without this the card sits on
     "Stop" over silence with no dots and nothing to explain it. */
  const st = snipState;
  audio.addEventListener('error', () => snipAudioError(st, audio), { once: true });
  const begin = () => {
    if(!snipState || snipState.audio !== audio) return;
    try { audio.currentTime = win.start; } catch(e) {}
    audio.play().catch(() => {});
    snipState.raf = requestAnimationFrame(snipTick);
    // The other mix starts loading only once this one is playing, so the two
    // never compete for a slow connection at the moment that matters (and only
    // where twinWanted — snipParkTwin checks).
    audio.addEventListener('playing', () => { if(snipState && snipState.audio === audio) snipParkTwin(snipState); }, { once: true });
  };
  if(audio.readyState >= 1) begin();
  else audio.addEventListener('loadedmetadata', begin, { once: true });
}
/* ── Why the bar dots lag audio.currentTime ────────────────────────────
   currentTime is the DECODER's position, not what has reached the speakers:
   the buffered audio is still on its way out, by tens of milliseconds on
   internal speakers and by a couple of hundred over Bluetooth. A dot that
   lights exactly when currentTime crosses a bar boundary therefore lights
   BEFORE the downbeat is audible, which is what it looks like — the numbers
   running slightly ahead of the music (Jonathan, 2026-09-18).

   There is no API that reports this for an <audio> element (AudioContext has
   outputLatency, but the snippet player is a plain media element, not routed
   through the context), so it is a constant. 80 ms is about right for a
   laptop's own speakers; Bluetooth wants far more. `?snipcal=1&lat=<ms>`
   overrides it live so the real number can be found by eye rather than
   guessed — if a value other than 80 turns out to be right on the room's
   machines, change the constant.

   This shifts ONLY the dots. The loop's own seek stays on the true decoder
   position: seeking when the decoder reaches the end is what lets the last
   buffered milliseconds play out, so compensating there would clip the loop
   short every lap. */
const SNIP_OUTPUT_LATENCY = 0.08;
function snipLatency(){
  // Captured at load (see snipUrlParam) rather than re-read here, so a hash
  // rewrite mid-session can't drop it. An absent param leaves it undefined,
  // NOT 0 — Number(null) is 0 and passes isFinite, which is how the override
  // once switched the compensation off for the very URL used to test it.
  return typeof window.__snipLat === 'number' ? window.__snipLat : SNIP_OUTPUT_LATENCY;
}
/* A step that pairs a paged tab with a snippet of the SAME bars (ca-18
   steps 3-4, 2026-09-25: Jonathan, "I want the tab to scroll with the
   backing track") — the tab has no Play tab button any more (revealDelay,
   same day) to drive its own page-turning, so the snippet drives it
   instead while it plays. notesPerBar comes from the tab's own note count
   (data-total-notes — see buildTab) divided by the snippet's own
   spec.bars: both were written over the same window, so nothing here is a
   second measurement of the song, just arithmetic on numbers the content
   already commits to elsewhere. Silently does nothing when the sibling
   isn't a paged tab, or when the counts don't divide the window evenly (no
   current content does that, but a future one could and this just no-ops
   rather than mis-paging).

   The tab and the snippet are always siblings under one step body (never
   nested — caStepHtml/renderTeacherActivityDetail build them as adjacent
   pieces of `parts`), so the sibling search only has to look inside the
   snippet card's own parent (snipToggle finds it once, as snipState.tab). */
function snipSyncTabPage(tabEl, spec, win, heard){
  if(!tabEl) return;
  const total = Number(tabEl.dataset.totalNotes) || 0;
  if(!total || !spec.bars) return;
  const notesPerBar = total / spec.bars;
  if(!Number.isInteger(notesPerBar)) return;   // the no-op the comment above promises
  const barsElapsed = snipBarsAt(win, heard);
  const idx = Math.max(0, Math.min(total - 1, Math.floor(barsElapsed * notesPerBar)));
  const page = tabPageOf(tabEl, idx);
  if(page < 0 || tabEl.dataset.snipPage === String(page)) return;
  tabEl.dataset.snipPage = String(page);
  tabShowPage(tabEl, page);
}
/* The loop itself. rAF rather than `timeupdate`, which fires about four
   times a second — at that granularity the window would overrun by up to a
   quarter of a beat and the seam would swing audibly from lap to lap. At
   frame rate the overshoot is one frame, and the seek back is the only
   artefact left (a short stumble; an mp3 cannot be looped gaplessly by
   seeking). */
/* The snippet's Metronome: the next counted beat of the window, scheduled
   once it is under 100 ms away — the practice card's pcScheduleClick, on the
   snippet's own window. `lastBeat` drops back by itself when the loop comes
   round, so a lap never loses its first click. */
function snipScheduleClick(st, now){
  const bpb = st.tr.beatsPerBar * clickSub(st.tr);   // clicks a bar — see CLICK IN SIX
  const nb = Math.ceil(snipBarsAt(st.win, now) * bpb - 1e-6);
  if(nb < st.lastBeat) st.lastBeat = nb - 1;
  if(nb <= st.lastBeat || nb < 0 || nb >= st.spec.bars * bpb) return;
  const ahead = (snipTimeAtBars(st.win, nb / bpb) - now) / snipRate(st.card);   // real seconds
  if(ahead > 0.1) return;
  const ctx = getAudioCtx();
  const lat = snipLatency() - (ctx.outputLatency || ctx.baseLatency || 0);
  pcClick(ctx.currentTime + Math.max(0, ahead + lat), clickAccent(st.tr, nb), false, (st.tr.clickGain || 1) * PLAYALONG_CLICK_GAIN);
  st.lastBeat = nb;
}
/* One of the snippet's <audio> elements failed. The PLAYING one stops the
   card and says so; the twin is just dropped (the Guitar toggle falls back to
   a reload). The same shape as the practice card's pcAudioError, and both are
   handed to twinPark, because a Guitar swap makes the twin the playing one. */
function snipAudioError(st, el){
  if(snipState !== st) return;
  if(st.audio !== el){ if(st.twin === el) st.twin = null; return; }
  snipStop();
  if(typeof gateToast === 'function') gateToast(t('ca.snipLoadFailed'));
}
/* The twin is the OTHER mix of the tier now playing — see THE TWIN. A song
   with no full mix has nothing to swap to, so it never gets one. */
function snipParkTwin(st){
  if(!snippetHasFull(st.tr) || !twinWanted(st.card)) return;
  const card = st.card;
  twinPark(st, snippetSrc(st.tr, card.dataset.slow === '1', card.dataset.guitar !== '1'), el => snipAudioError(st, el));
}
function snipTick(){
  if(!snipState) return;
  const { audio, win, card, spec, cal } = snipState;
  if(!card.isConnected){ snipStop(); return; }   // a re-render pulled the card out
  let now = audio.currentTime;
  if(now >= win.end - 0.02 || now < win.start - 0.5){
    try { audio.currentTime = win.start; } catch(e) {}
    now = audio.currentTime;
  }
  if(card.dataset.metro === '1' && !audio.paused) snipScheduleClick(snipState, now);
  twinFollow(snipState, audio);
  // `heard` is roughly where the music is by the time it reaches the room —
  // see SNIP_OUTPUT_LATENCY. The dots follow the ears, not the decoder.
  const heard = now - snipLatency() * snipRate(card);   // latency is real seconds; this is file time
  const bar = Math.max(0, Math.min(spec.bars - 1, Math.floor(snipBarsAt(win, heard))));
  if(bar !== snipState.lastBar){
    snipState.lastBar = bar;
    snipState.dots.forEach((d, i) => d.classList.toggle('bar-now', i === bar));
  }
  snipSyncTabPage(snipState.tab, spec, win, heard);
  if(cal){ const tEl = cal.querySelector('.snip-cal-time'); if(tEl) tEl.textContent = now.toFixed(2) + ' s'; }
  snipState.raf = requestAnimationFrame(snipTick);
}
/* Slow, Metronome and Guitar are independent, exactly as on the Journey
   page, and any of them can be set before playing or flipped mid-loop.
   Flipping a file (Slow, Guitar) mid-loop keeps the MUSICAL position — how far into the window we are, in bars —
   rather than the second, because the two files run on different clocks. */
function snipSetTier(btn, which){
  const card = btn.closest('.snip');
  if(!card) return;
  const on = btn.getAttribute('aria-pressed') !== 'true';
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  btn.classList.toggle('on', on);
  // `which` is the dataset key outright — a two-way ternary silently filed
  // 'guitar' under 'metro' when the third toggle arrived.
  card.dataset[which] = on ? '1' : '';
  if(which === 'guitar'){
    snipGuitarLabel(btn, on);
    card.dataset.twin = '1';           // from now on this card keeps the twin — see twinWanted
  }
  /* Slowest is the slow FILE at SLOWEST_RATE, so it sets data-slow too; the
     two buttons are one choice of speed, and pressing either visibly
     releases the other. Slowest off goes back to normal speed. */
  if(which === 'slowest' || which === 'slow'){
    const otherBtn = card.querySelector(which === 'slowest' ? '.snip-slow' : '.snip-slowest');
    if(on && otherBtn){
      otherBtn.setAttribute('aria-pressed', 'false');
      otherBtn.classList.remove('on');
    }
    if(which === 'slowest'){ card.dataset.slow = on ? '1' : ''; }
    else if(on) card.dataset.slowest = '';
  }
  // Metronome is the site's own click — the tick reads data-metro on its
  // next frame, so there is no file to swap and nothing to re-seek.
  if(which === 'metro') return;
  if(!snipState || snipState.card !== card) return;
  const { audio, spec, tr } = snipState;
  const slow = card.dataset.slow === '1';
  const guitar = card.dataset.guitar === '1';
  /* A file switch still waiting for its metadata (src= put currentTime back
     to 0 and paused the element): the place and play state to restore are the
     ones that switch saved, not what the element reads now. Without this a
     second press before the file loads (Guitar twice, Guitar then Slow — a
     student's first Guitar press always reloads, see twinWanted) sent the song
     back to the start of the window. */
  const pend = snipState.pending;
  const barsIn = pend ? pend.bars : snipBarsAt(snipState.win, audio.currentTime);
  const win = snippetWindow(tr, spec, slow);
  snipState.win = win;
  const at = snipTimeAtBars(win, isFinite(barsIn) && barsIn > 0 ? barsIn : 0);
  const src = snippetSrc(tr, slow, guitar);
  slowestApplyRate(audio, snipRate(card));   // Slowest <-> Slow is the same file, just the rate
  snipState.lastBeat = -1;
  if(audio.getAttribute('src') === src || audio.src.endsWith(src)){
    // Same file: only the rate moved, and `at` is where it already is. A seek
    // there would only make a gap (an mp3 seek lands late — see THE TWIN).
    // A pending switch places it itself, on the window read when it fires.
    if(!pend && Math.abs(audio.currentTime - at) > SAME_FILE_SEEK_SEC){ try { audio.currentTime = at; } catch(e) {} }
    return;
  }
  /* Guitar flipped and the twin is already playing the other mix in step:
     swap which one is heard. No load, no seek — see THE TWIN. */
  if(which === 'guitar' && twinReady(snipState, audio, src)){
    snipState.audio = twinSwap(snipState, audio);
    snipParkTwin(snipState);
    return;
  }
  const st = snipState;
  const p = st.pending = { bars: isFinite(barsIn) && barsIn > 0 ? barsIn : 0, play: pend ? pend.play : !audio.paused };
  // Every queued resume fires on the same loadedmetadata; only the latest
  // switch's acts, and nothing after a Stop.
  const resume = () => {
    if(snipState !== st || st.pending !== p) return;
    st.pending = null;
    try { audio.currentTime = snipTimeAtBars(st.win, p.bars); } catch(e) {}
    if(p.play) audio.play().catch(() => {});
  };
  audio.addEventListener('loadedmetadata', resume, { once: true });
  audio.src = src;
  audio.load();
  // The twin was parked on the other mix of the OLD tier; follow the file.
  audio.addEventListener('playing', () => { if(snipState && snipState.audio === audio) snipParkTwin(snipState); }, { once: true });
}

function toggleTabChoice(btn){
  const expanded = btn.classList.toggle('expanded');
  const content = btn.nextElementSibling;
  if (content && content.classList.contains('tab-choice-content')){
    content.classList.toggle('expanded', expanded);
  }
}

/* String reference patterns:
   - "low E" / "high E" (case-insensitive on low/high, captures both as one unit)
   - A letter or list of letters followed by "string"/"strings", e.g.
     "E string", "E and A strings", "E, A, and D strings"
   Letters E/A/D/G/B are case-sensitive (uppercase) to match how
   teachers write them in the modules. */
const STR_SEP = '(?:\\s*(?:,|&|\\band\\b|\\bor\\b)\\s*)+';
const STRING_PHRASE_RE_SRC = '\\b[EADGB](?:' + STR_SEP + '[EADGB])*(?:\\s+|-)strings?\\b';
const LOWHIGH_E_RE_SRC = '\\b(low|high)\\s+E\\b';
/* Standard tuning notation "E A D G B e" — six string names in order with
   lowercase e for the high E. Separators can be spaces, commas, or "·". */
const TUNING_SEP = '[\\s·,]+';
const TUNING_RE_SRC = '\\bE' + TUNING_SEP + 'A' + TUNING_SEP + 'D' + TUNING_SEP + 'G' + TUNING_SEP + 'B' + TUNING_SEP + 'e\\b';
const TUNING_LETTER_KIND = { E:'lowE', A:'A', D:'D', G:'G', B:'B', e:'highE' };

function findStringMatches(text){
  const matches = [];
  let m;

  const re1 = new RegExp(LOWHIGH_E_RE_SRC, 'gi');
  while ((m = re1.exec(text)) !== null) {
    const kind = m[1].toLowerCase() === 'low' ? 'lowE' : 'highE';
    matches.push({ start: m.index, end: m.index + m[0].length, kind });
  }

  const re2 = new RegExp(STRING_PHRASE_RE_SRC, 'gi');
  while ((m = re2.exec(text)) !== null) {
    const phraseStart = m.index;
    const phrase = m[0];
    const letterRe = /[EADGB]/g; // case-sensitive — only uppercase
    let lm;
    while ((lm = letterRe.exec(phrase)) !== null) {
      const letter = lm[0];
      const absStart = phraseStart + lm.index;
      /* Skip if already covered by a "low E" / "high E" phrase */
      if (matches.some(x => x.start <= absStart && absStart < x.end)) continue;
      const kind = letter === 'E' ? 'lowE' : letter; // ambiguous "E string" defaults to low E
      matches.push({ start: absStart, end: absStart + 1, kind });
    }
  }

  const re3 = new RegExp(TUNING_RE_SRC, 'g');
  while ((m = re3.exec(text)) !== null) {
    const phraseStart = m.index;
    const phrase = m[0];
    const letterRe = /[EADGBe]/g;
    let lm;
    while ((lm = letterRe.exec(phrase)) !== null) {
      const absStart = phraseStart + lm.index;
      if (matches.some(x => x.start <= absStart && absStart < x.end)) continue;
      matches.push({ start: absStart, end: absStart + 1, kind: TUNING_LETTER_KIND[lm[0]] });
    }
  }

  matches.sort((a,b) => a.start - b.start);
  const dedup = [];
  let lastEnd = -1;
  matches.forEach(x => {
    if (x.start >= lastEnd) { dedup.push(x); lastEnd = x.end; }
  });
  return dedup;
}

/* Longest names first so the alternation matches them before the 1-char names */
const CHORD_NAMES = ['F#m','C#m','Em','Am','Dm','Bm','B7','A5','E5','G5','D5','C5','C','G','D','A','E','F'];
const CHORD_RE = new RegExp('(^|[^A-Za-z0-9#])(' + CHORD_NAMES.join('|') + ')(?![A-Za-z0-9#])(?![ -][Ss]hape)(?![ -][Mm]inor)(?![ -][Pp]entatonic)(?![ -][Ss]cale)(?![ -][Mm]ajor[ -](?:pentatonic|scale))', 'g');
// lowercase chord name → canonical CHORD_NAMES spelling, for matching typed search queries like "g c d"
const CHORD_NAME_LOOKUP = new Map(CHORD_NAMES.map(c => [c.toLowerCase(), c]));
const CHORD_SKIP_TAGS = new Set(['A','BUTTON','SCRIPT','STYLE','TEXTAREA','INPUT','LABEL','SELECT']);
const CHORD_SKIP_CLASSES = ['skill-badge','chord-link','string-link','note-link','rp-trigger','chord-box-label','chord-diagrams','step-resp-mc-opt','tab','nolink'];

/* Natural-note fret positions on each string (frets 0–12). Used to
   auto-map sequences like "E · F · G · A · B · C · D · E" to single-note
   popups, with each letter landing on its actual fret on the contextual
   string. Positions are listed low→high so a walking sequence picks the
   next available fret above the previous one. */
const STRING_NOTE_FRETS = {
  lowE:  { E:[0,12], F:[1], G:[3], A:[5], B:[7], C:[8], D:[10] },
  A:     { A:[0,12], B:[2], C:[3], D:[5], E:[7], F:[8], G:[10] },
  D:     { D:[0,12], E:[2], F:[3], G:[5], A:[7], B:[9], C:[10] },
  G:     { G:[0,12], A:[2], B:[4], C:[5], D:[7], E:[9], F:[10] },
  B:     { B:[0,12], C:[1], D:[3], E:[5], F:[6], G:[8], A:[10] },
  highE: { E:[0,12], F:[1], G:[3], A:[5], B:[7], C:[8], D:[10] }
};

/* Sequence of 3+ standalone natural-note letters joined by " · " (middle dot).
   The lookarounds keep "G · Down-up" or chord names like "Am" from matching.
   The leading boundary is a CAPTURED character rather than a lookbehind
   (group 1, exactly as CHORD_RE does it): regex lookbehind is a parse error
   in Safari before 16.4, and a parse error in this file takes the whole app
   down on an older iPhone — including the error banner meant to explain it.
   Callers skip past m[1] and read the sequence from m[2]. */
const NOTE_SEQ_RE = /(^|[^A-Za-z0-9])([A-G](?:\s*[·•]\s*[A-G](?![A-Za-z0-9])){2,})/g;
function findNoteSequenceMatches(text, stringMatches){
  const out = [];
  const re = new RegExp(NOTE_SEQ_RE.source, 'g');
  let m;
  while ((m = re.exec(text)) !== null) {
    const seq = m[2];
    const seqStart = m.index + m[1].length;
    const ctx = stringMatches
      .filter(s => s.end <= seqStart)
      .sort((a, b) => b.end - a.end)[0];
    if (!ctx) continue;
    const fretMap = STRING_NOTE_FRETS[ctx.kind];
    if (!fretMap) continue;
    let lastFret = -1;
    const letterRe = /[A-G]/g;
    let lm;
    while ((lm = letterRe.exec(seq)) !== null) {
      const letter = lm[0];
      const positions = fretMap[letter];
      if (!positions) continue;
      const fret = positions.find(p => p > lastFret);
      if (fret === undefined) continue;
      out.push({
        start: seqStart + lm.index,
        end:   seqStart + lm.index + 1,
        kind:  ctx.kind,
        fret,
        note:  letter
      });
      lastFret = fret;
    }
  }
  return out;
}

/* Single-note references: "1st fret (F)", "5th fret (A)", "open (E)" etc.
   The letter inside parens is the NOTE — not a chord. We use the most
   recent string reference earlier in the same text as the string context. */
const NOTE_CTX_RE = /\b(?:(\d+)(?:st|nd|rd|th)?\s+fret|(open))\s*\(\s*([A-G][#b]?)\s*\)/gi;
function findNoteMatches(text, stringMatches){
  const out = [];
  const re = new RegExp(NOTE_CTX_RE.source, 'gi');
  let m;
  while ((m = re.exec(text)) !== null) {
    const fret = m[2] ? 0 : parseInt(m[1], 10);
    const note = m[3];
    /* Wrap just the note letter inside the parens, not the whole "Nth fret" phrase */
    const innerStart = m.index + m[0].indexOf(note, m[0].lastIndexOf('('));
    const innerEnd = innerStart + note.length;
    /* Find most recent string reference ending before this match */
    const ctx = stringMatches
      .filter(s => s.end <= m.index)
      .sort((a, b) => b.end - a.end)[0];
    if (!ctx) {
      /* No string context — still record so chord-detection skips this letter,
         but mark kind=null so we render plain text rather than the wrong chord. */
      out.push({ start: innerStart, end: innerEnd, kind: null, fret, note });
    } else {
      out.push({ start: innerStart, end: innerEnd, kind: ctx.kind, fret, note });
    }
  }
  return out;
}

/* Distinguish the grammatical article "A" ("A guitar…", "A hard strum…")
   from the chord/note A. The indefinite article only capitalises at the
   START of a sentence and is always followed by a lowercase word, whereas
   musical "A" refs sit mid-sentence ("switch to A in time", "F · G · A
   roots", "the A blues scale", "→A"). We keep "A major" linked since that's
   a real chord. */
function isIndefiniteArticleA(text, start, end){
  const after = text.slice(end).match(/^\s+([a-z]+)/);
  if (!after) return false;                 // followed by punctuation/capital/arrow → chord
  if (/^maj(or)?$/.test(after[1])) return false;  // "A major" is a chord, keep it
  const before = text.slice(0, start).replace(/\s+$/, '');
  return before === '' || /[.!?:;]$/.test(before);  // only at a sentence boundary
}

/* Power-chord names open no pop-up where the lesson teaches the TWO-finger
   shape (Jonathan, 2026-10-26). The chord library draws power chords with
   three fingers (guitar-diagrams.js), but Module 3 Set 1 and Module 9's
   power-chord re-test teach the two-finger shape and draw it in their own
   chord boxes, so a pop-up would contradict the step beside it. A whole set,
   or one skill: every step that checks it (data-skills holds the skill
   numbers, `-sN`) and its checklist row. Only the power-chord names lose the
   link — string and note links stay. checks.mjs 1by renders these. */
const POWER_CHORD_NO_POPUP = { sets: ['m3w1'], skills: ['m9w0-s4'] };
const POWER_CHORD_NAME_RE = /^[A-G][#b]?5$/;
function powerChordLinksOff(rootEl){
  if (!rootEl || !rootEl.closest) return false;
  const panel = rootEl.closest('.week-panel');
  const setId = panel && panel.dataset ? panel.dataset.id : '';
  if (!setId) return false;
  if (POWER_CHORD_NO_POPUP.sets.includes(setId)) return true;
  const step = rootEl.closest('.step[data-skills]');
  if (step && String(step.dataset.skills).split(',').some(n => POWER_CHORD_NO_POPUP.skills.includes(`${setId}-s${n.trim()}`))) return true;
  const row = rootEl.closest('.skill-row[data-sid]');
  return !!(row && POWER_CHORD_NO_POPUP.skills.includes(row.dataset.sid));
}

function wrapChordLinksIn(rootEl){
  if (!rootEl) return;
  /* Module 7 (barre chords): each step already shows accurate inline chord
     diagrams, and the shared chord library renders OPEN shapes that don't match
     the barre lesson — so skip all auto-link pop-ups inside Module 7 panels. */
  if (rootEl.closest && rootEl.closest('.week-panel[data-module="7"]')) return;
  const noPowerLinks = powerChordLinksOff(rootEl);
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
    acceptNode(node){
      if (!node.nodeValue || !/[A-G]/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
      let p = node.parentNode;
      while (p && p !== rootEl) {
        if (CHORD_SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.classList && CHORD_SKIP_CLASSES.some(c => p.classList.contains(c))) return NodeFilter.FILTER_REJECT;
        p = p.parentNode;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const textNodes = [];
  let n;
  while ((n = walker.nextNode())) textNodes.push(n);

  textNodes.forEach(node => {
    const text = node.nodeValue;

    /* String references first — they take priority over chord matches */
    const stringMatches = findStringMatches(text);

    /* Note references — "1st fret (F)", "open (E)" with string context */
    const noteMatches = findNoteMatches(text, stringMatches);

    /* Bare note sequences — "E · F · G · A · B · C · D · E" with string context */
    const noteSeqMatches = findNoteSequenceMatches(text, stringMatches);
    noteSeqMatches.forEach(x => noteMatches.push(x));

    /* Chord matches — skip any that overlap a string or note match */
    const chordMatches = [];
    const re = new RegExp(CHORD_RE.source, 'g');
    let m;
    while ((m = re.exec(text)) !== null) {
      const prefix = m[1], chord = m[2];
      const start = m.index + prefix.length;
      const end = start + chord.length;
      if (stringMatches.some(s => s.start < end && start < s.end)) continue;
      if (noteMatches.some(s => s.start < end && start < s.end)) continue;
      if (chord === 'A' && isIndefiniteArticleA(text, start, end)) continue;
      if (noPowerLinks && POWER_CHORD_NAME_RE.test(chord)) continue;   // plain text — see POWER_CHORD_NO_POPUP
      chordMatches.push({ start, end, chord });
    }

    if (!stringMatches.length && !chordMatches.length && !noteMatches.length) return;

    const all = [
      ...stringMatches.map(x => ({ start:x.start, end:x.end, type:'string', kind:x.kind })),
      ...noteMatches.filter(x => x.kind).map(x => ({ start:x.start, end:x.end, type:'note', kind:x.kind, fret:x.fret, note:x.note })),
      ...chordMatches.map(x => ({ start:x.start, end:x.end, type:'chord',  chord:x.chord }))
    ].sort((a,b) => a.start - b.start);

    const frag = document.createDocumentFragment();
    let cursor = 0;
    all.forEach(item => {
      if (item.start > cursor) frag.appendChild(document.createTextNode(text.slice(cursor, item.start)));
      const span = document.createElement('span');
      if (item.type === 'string') {
        span.className = 'string-link';
        span.dataset.string = item.kind;
        span.textContent = text.slice(item.start, item.end);
        span.addEventListener('click', onStringLinkClick);
        span.addEventListener('mouseenter', onStringLinkHover);
        span.addEventListener('mouseleave', hideChordPopup);
      } else if (item.type === 'note') {
        span.className = 'note-link';
        span.dataset.string = item.kind;
        span.dataset.fret = String(item.fret);
        span.dataset.note = item.note;
        span.textContent = text.slice(item.start, item.end);
        span.addEventListener('click', onNoteLinkClick);
        span.addEventListener('mouseenter', onNoteLinkHover);
        span.addEventListener('mouseleave', hideChordPopup);
      } else {
        span.className = 'chord-link';
        span.dataset.chord = item.chord;
        span.textContent = item.chord;
        span.addEventListener('click', onChordLinkClick);
        span.addEventListener('mouseenter', onChordLinkHover);
        span.addEventListener('mouseleave', hideChordPopup);
      }
      frag.appendChild(span);
      cursor = item.end;
    });
    if (cursor < text.length) frag.appendChild(document.createTextNode(text.slice(cursor)));
    node.parentNode.replaceChild(frag, node);
  });
}

function onChordLinkClick(e){
  e.preventDefault(); e.stopPropagation();
  const chord = this.dataset.chord;
  if (!chord) return;
  hideChordPopup();
  /* For chord type, the 2nd arg carries the chord NAME (loadPanel renders it locally) */
  loadPanel('chord', chord, chord, t('popup.chordDiagram'));
}

/* Floating hover preview — one shared popup element reused for every link */
let chordPopupEl = null;
function ensureChordPopup(){
  if (chordPopupEl) return chordPopupEl;
  chordPopupEl = document.createElement('div');
  chordPopupEl.className = 'chord-popup';
  document.body.appendChild(chordPopupEl);
  return chordPopupEl;
}
function positionChordPopup(popup, linkEl){
  const rect = linkEl.getBoundingClientRect();
  const popW = popup.offsetWidth || 220;
  const popH = popup.offsetHeight || 220;
  let left = rect.left + window.scrollX + (rect.width / 2) - (popW / 2);
  let top  = rect.bottom + window.scrollY + 6;
  left = Math.max(8, Math.min(left, window.scrollX + window.innerWidth - popW - 8));
  /* Flip above the link if there isn't room below */
  if (rect.bottom + popH + 12 > window.innerHeight) {
    top = rect.top + window.scrollY - popH - 6;
  }
  popup.style.left = left + 'px';
  popup.style.top  = top  + 'px';
}
function onChordLinkHover(){
  const chord = this.dataset.chord;
  if (!chord) return;
  const popup = ensureChordPopup();
  const svg = localChordSvg(chord);
  if (!svg) return;
  popup.classList.remove('wide');
  popup.innerHTML = `<div class="chord-popup-name">${chord}</div><div class="chord-popup-svg">${svg}</div><div class="chord-popup-hint">${escHtml(t('popup.clickToOpen'))}</div>`;
  popup.classList.add('visible');
  positionChordPopup(popup, this);
}
function onStringLinkClick(e){
  e.preventDefault(); e.stopPropagation();
  const kind = this.dataset.string;
  if (!kind) return;
  hideChordPopup();
  const label = STRING_LABELS[kind] || kind;
  loadPanel('string', kind, label, t('popup.openString'));
}
function onStringLinkHover(){
  const kind = this.dataset.string;
  if (!kind) return;
  const popup = ensureChordPopup();
  const svg = localStringFretboardSvg(kind);
  if (!svg) return;
  const label = STRING_LABELS[kind] || kind;
  popup.classList.add('wide');
  popup.innerHTML = `<div class="chord-popup-name">${label}</div><div class="chord-popup-svg">${svg}</div><div class="chord-popup-hint">${escHtml(t('popup.clickToOpen'))}</div>`;
  popup.classList.add('visible');
  positionChordPopup(popup, this);
}
function onNoteLinkClick(e){
  e.preventDefault(); e.stopPropagation();
  const kind = this.dataset.string;
  const fret = Number(this.dataset.fret);
  const note = this.dataset.note;
  if (!kind || isNaN(fret) || !note) return;
  hideChordPopup();
  const label = noteFullLabel(note, fret, kind);
  /* Encode payload in the URL slot as "kind|fret|note" */
  loadPanel('note', `${kind}|${fret}|${note}`, label, t('popup.singleNote'));
}
function onNoteLinkHover(){
  const kind = this.dataset.string;
  const fret = Number(this.dataset.fret);
  const note = this.dataset.note;
  if (!kind || isNaN(fret) || !note) return;
  const popup = ensureChordPopup();
  const svg = localNoteSvg(kind, fret, note);
  if (!svg) return;
  const hint = noteFullLabel(note, fret, kind);
  popup.classList.add('wide');
  popup.innerHTML = `<div class="chord-popup-name">${note}</div><div class="chord-popup-svg">${svg}</div><div class="chord-popup-hint">${escHtml(hint)} · ${escHtml(t('popup.clickToOpen'))}</div>`;
  popup.classList.add('visible');
  positionChordPopup(popup, this);
}
function hideChordPopup(){
  if (chordPopupEl) chordPopupEl.classList.remove('visible');
}
/* Hide popup if user scrolls or resizes */
window.addEventListener('scroll', hideChordPopup, true);
window.addEventListener('resize', hideChordPopup);

function wrapAllChordLinks(){
  /* Step text + per-step hints (single line and bulleted) */
  document.querySelectorAll('.dp .step .st-text').forEach(wrapChordLinksIn);
  document.querySelectorAll('.dp .step .sh').forEach(wrapChordLinksIn);
  document.querySelectorAll('.dp .step .sh-list li').forEach(wrapChordLinksIn);
  /* Step-response prompts (the question text above MC/short-answer inputs) */
  document.querySelectorAll('.dp .step .step-resp-prompt').forEach(wrapChordLinksIn);
  /* Objectives at the top of each set */
  document.querySelectorAll('.obj-card .obj-main, .obj-card .obj-sub, .obj-card .obj-set-sub, .obj-card .obj-skill-item, .set-about .obj-skill-item').forEach(wrapChordLinksIn);
  /* Song list — names and meta lines often mention chords ("uses G and C") */
  document.querySelectorAll('.song-row .sname, .song-row .smeta').forEach(wrapChordLinksIn);
  /* Skills checklist — skill labels and helper text */
  document.querySelectorAll('.skill-row .sk-label, .skill-row .sk-helper').forEach(wrapChordLinksIn);
  /* Mid-module review — self-rated skill text and "play it" prompt */
  document.querySelectorAll('.mr-skill-text, .mr-play-prompt').forEach(wrapChordLinksIn);
}

// Per-module completion from the student's own progress, derived from the
// manifest (skillCount + skillIdRe) so it needs NO module data file loaded.
// state: 'none' (untouched) · 'partial' (some got-it) · 'complete' (all got-it).
function moduleCompletion(m){
  const total = m.skillCount || 0;
  if(!total) return { done:0, total:0, state:'none' };
  const re = m._skillRe || (m._skillRe = new RegExp(m.skillIdRe));
  let done = 0;
  for(const k in progress){ if(progress[k]==='gotit' && re.test(k)) done++; }
  if(done > total) done = total;
  const state = done===0 ? 'none' : (done>=total ? 'complete' : 'partial');
  return { done, total, state };
}

function populateModuleDropdown(){
  // Built from the lightweight manifest so we don't need every module's data
  // file loaded just to list the modules. Each option carries the student's
  // done count; a ✓ appears only once every skill in the module is got-it.
  // Untouched modules show just their name (no 0/N) — matches the "clean until
  // started" treatment on the set pills and progress strip.
  const sel = document.getElementById('module-select');
  const keep = sel.value;
  sel.innerHTML='';
  MODULE_MANIFEST.forEach(m=>{
    const opt = document.createElement('option');
    opt.value = m.num;
    const { done, total, state } = moduleCompletion(m);
    /* State goes in FRONT of the name (navigability work order 2026-09-23,
       item 7): the select is ~200px wide, so a ✓ or 🔒 riding at the END of
       "Module 5 — Major / Minor / Blues Pentatonic Scales" was cut off and
       invisible in the closed control. "3/9" stays a tail — it only ever
       matters once the list is open. */
    let head = '';
    let tail = '';
    if(isModuleGateLocked(m.num)) head = '🔒 ';
    else if(state==='complete') head = '✓ ';
    if(state==='partial') tail = ` · ${done}/${total}`;
    else if(state==='complete') tail = ` · ${total}/${total}`;
    opt.textContent = `${head}${t('nav.module')} ${m.num} — ${tf(m,'name')}${tail}`;
    sel.appendChild(opt);
  });
  if(keep) sel.value = keep;
}

let _moduleStripStates = {};   // num -> last seen state, to catch the just-completed moment
function celebrateModuleComplete(seg){
  flashClass(seg, 'celebrate', 1300);
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = seg.getBoundingClientRect();
  ['\u{1F3B8}','\u{1F3B5}','\u2B50','\u{1F3B6}','\u{1F3B5}','\u2728'].forEach((ch, i)=>{
    const el = document.createElement('span');
    el.className = 'celebrate-particle';
    el.textContent = ch;
    el.style.left = (r.left + r.width/2 - 9 + (i - 2.5) * 14) + 'px';
    el.style.top = (r.top - 4) + 'px';
    el.style.animationDelay = (i * 60) + 'ms';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 1900);
  });
}
/* The 8-segment module strip is gone (the Set pills live in its rail slot
   now), but this still drives the 🏆 module-complete badge — and throws the
   confetti from it the moment the current module flips to complete. */
function renderProgressStrip(){
  let currentInfo = null;
  const firstRender = Object.keys(_moduleStripStates).length === 0;
  MODULE_MANIFEST.forEach(m=>{
    const { done, total, state } = moduleCompletion(m);
    if(m.num===lastModuleNum) currentInfo = { done, total, state, num: m.num };
    // Celebrate the moment the CURRENT module flips to complete (never on first
    // paint — returning students shouldn't get confetti for last month's work).
    if(!firstRender && state==='complete' && _moduleStripStates[m.num] && _moduleStripStates[m.num] !== 'complete'
       && m.num===lastModuleNum){
      const goal = document.getElementById('rail-module-goal');
      if(goal) celebrateModuleComplete(goal);
    }
    _moduleStripStates[m.num] = state;
  });
  const goalEl = document.getElementById('rail-module-goal');
  if(goalEl){
    const earned = !!(currentInfo && currentInfo.state === 'complete');
    goalEl.classList.toggle('earned', earned);
    goalEl.title = earned
      ? t('nav.moduleComplete', { n: currentInfo.num })
      : t('nav.moduleGoalTitle');
  }
  // Rail module progress bar — same "clean until started" rule as the pills:
  // hidden until the first skill in the module is marked got-it.
  const prog = document.getElementById('rail-mod-prog');
  if(prog){
    const show = !!(currentInfo && currentInfo.total > 0 && currentInfo.done > 0);
    prog.hidden = !show;
    if(show){
      const fill = document.getElementById('rmp-fill');
      const lbl  = document.getElementById('rmp-lbl');
      if(fill) fill.style.width = Math.round(currentInfo.done / currentInfo.total * 100) + '%';
      if(lbl)  lbl.textContent = `${currentInfo.done}/${currentInfo.total}`;
      prog.setAttribute('aria-valuemax', String(currentInfo.total));
      prog.setAttribute('aria-valuenow', String(currentInfo.done));
      prog.setAttribute('aria-valuetext', t('nav.moduleProgValue', { done: currentInfo.done, total: currentInfo.total }));
    }
  }
}

// Footer "Report a problem" — build the mailto at click time so the body carries
// wherever the student currently is (module + set). Returns true so the <a>'s
// default action opens the student's mail client with it prefilled.
function currentReportContext(){
  const m = MODULE_MANIFEST.find(x=>x.num===lastModuleNum);
  let loc = m ? `${t('nav.module')} ${m.num} — ${tf(m,'name')}` : `${t('nav.module')} ${lastModuleNum||1}`;
  if(lastSetId && String(lastSetId).startsWith('mr')){
    loc += `, ${t('nav.moduleReview')}`;
  } else {
    const w = SETS.find(s=>s.id===lastSetId);
    if(w) loc += `, ${tSetLabel(w.label)}`;   // module name already carries the topic
  }
  return loc;
}
function buildReportHref(a){
  const subject = t('report.subject');
  const body = currentReportContext() + ':\n\n';
  a.href = 'mailto:jhoffman@seq.org?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  return true;
}
// The rail's "Report a problem" link now opens an in-site form that writes to Firestore
// (issueReports collection) instead of navigating away to a mail client — but
// falls back to the mailto link above whenever a Firestore write isn't
// possible: Firebase failed to load, or the student is the dev-bypass user
// (whose uid Firestore rules reject, same convention as progress saves).
function handleReportClick(a){
  if(firebaseReady && currentUser && !isDevBypassUser()){
    openIssueModal();
    return false;
  }
  return buildReportHref(a);
}
function buildIssueModalHtml(){
  return `<div class="daily5-head"><h3 style="font:inherit;margin:0">${t('btn.reportProblem')}</h3><button type="button" class="tp-close" onclick="closeIssueModal()" aria-label="${escAttr(t('issue.closeAria'))}">&#x2715;</button></div>
    <p class="coach-tip">${escHtml(t('issue.contextLabel',{loc:currentReportContext()}))}</p>
    <!-- 4000 is the ceiling firestore.rules puts on message.size(); without it
         a long paste is rejected on write and the student only sees the
         generic issue.failed. -->
    <textarea id="issue-text" class="reflection-ta" placeholder="${escAttr(t('issue.placeholder'))}" rows="5" maxlength="4000"></textarea>
    <div class="issue-status" id="issue-status" aria-live="polite"></div>
    <div class="issue-actions">
      <button type="button" class="panel-next-btn" id="issue-submit-btn" onclick="submitIssueReport()">${t('issue.submit')}</button>
    </div>`;
}
/* Smooth scrolling is motion, and the CSS `prefers-reduced-motion` blanket
   in styles.css cannot reach a scroll the code starts itself. Every
   scrollIntoView on the site goes through this, so "reduce motion" in the OS
   means an instant jump rather than a slide. (coach.js reads this too; the
   one call on the Journey pages inlines the same check, because those pages
   don't load app.js.) */
function scrollBehavior(){
  return (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ? 'auto' : 'smooth';
}

