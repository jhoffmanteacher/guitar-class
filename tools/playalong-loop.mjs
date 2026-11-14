#!/usr/bin/env node
/* Closed-loop test of the play-along cards (2026-11-11): every In-Class practice card is
   played from start to finish on a fake clock, in every setting it has, and what the page
   LIGHTS at each moment is compared with what the card's chart and the track's beat map
   say is sounding at that moment.

     node tools/playalong-loop.mjs                 every card, every setting (4 to 5 minutes)
     node tools/playalong-loop.mjs --only ca-38    one card (comma-separated ids; 10 to 40 seconds each)
     node tools/playalong-loop.mjs --setting lap   only the walks whose name contains this text
     node tools/playalong-loop.mjs --verbose       every issue of a failed walk, not the first few
     node tools/playalong-loop.mjs --json <file>   every walk and every issue
     node tools/playalong-loop.mjs --root <dir>    test another copy of the site (a scratch copy with a planted fault)
     node tools/playalong-loop.mjs --step <ms>     the song walks' step in file time (default 20)
     node tools/playalong-loop.mjs --pins          print the clock pins of this site (see CLOCK PINS)
     node tools/playalong-loop.mjs --only ca-51 --shots <dir>   also a PNG of each card view as it opens, at 1366x657
                                                   (English; the look CLAUDE.md step 4 asks for on a new card)
     --chrome <path> (or CHROME=…), --stall <s> (default 120)
   Exit 0: nothing found. 1: a mismatch. 2: could not run, or nothing was walked (a --setting that matches no walk). 3: the watchdog (no step for --stall seconds).

   WHEN TO RUN IT: after any change to a practice card's chart (`card.sections` in class-activities.js), to
   SNIPPET_TRACKS, or to the player in app/cards.js / app/snippets.js. It is not part of checks.mjs.
   One headless-browser run at a time on a machine (not beside smoke.mjs, golden.mjs, pm-e2e.mjs, slow-load.mjs).

   WHAT IS REAL. The site's own page in headless Chrome, signed in through the dev bypass, with the card open on
   the In class page. Every setting is changed by a real click on the card's own control, so pcToggle,
   pcFromSection, pcSetSpeedTo, pcSetGuitar, pcSetMetro, pcSetCounts, pcSheetStartAt, pcPage and the four view
   switches (caSetRecordingMode, caSetKeyMode, caSetChordMode, caSetBassMode) run as written, and from there
   pcStart, pcCountIn, pcGo, pcFrame, pcPaint, pcSheetStrip, pcRetrack, the spare and the twin. No site file is
   changed and nothing is stubbed between the click and the lit cell.
   WHAT IS FAKE. The world the player lives in: `new Audio()` gives an element with no sound whose currentTime
   the tool moves; setTimeout, requestAnimationFrame, performance.now and the AudioContext run on a virtual
   clock, so a five-minute song takes about a second and the same run gives the same result every time. A fake
   file "loads" 40 virtual ms after it is asked for, a seek is instant, and it plays at its playbackRate times a
   small fixed skew of its own (element n of a walk: -0.3%, +0.3%, +0.6%, -0.6% for n mod 4), so two elements
   playing side by side drift apart and the twin's nudge, snap and rate reset run as they do on real hardware. The
   AudioContext logs every click the page schedules: its time, pitch and peak gain.
   WHAT IS NOT MODELLED. Sound: the clicks are judged by their scheduled time, pitch and gain, never heard. The
   decoder's own delays (a real seek lands late; a real element's clock stands still for the first 15-20 ms after
   play(), which is why the count an element STARTS on is not required to have its own Metronome click here), the
   speaker's latency, drift between two elements other than the fixed skew (a real decoder's drift wanders), a file
   that fails or is slow to load (every load takes 40 ms), and whether the numbers in a beat map match the record:
   the tool has no ears. Whether a lead FEELS right is Jonathan's call by ear; the tool checks that the page applies
   the lead it declares, and that the lead is still the one last confirmed by ear (LEAD_PINS).

   THE EXPECTED ANSWER IS WORKED OUT HERE, from the card's chart and the track's clock only, without calling the
   player's own arithmetic (pcLocate, pcLayout, pcChordGrid, pcBassMarks, snippetWindow, snipBarsAt, snipTimeAtBars): two
   readings that share a function agree even when the function is wrong. The rules it uses were read out of
   those functions and are stated here so they can be checked against the music instead of against the code:

     R1  Bars of a song count from 1. On a track with a beat map (`barTimes`) bar k starts at barTimes[k-1]
         seconds of the record-tempo file. On a track without one, bar k starts at anchor + (k-1) bars, a bar
         being <beats in the bar> x 60 / feltBpm seconds.
     R2  Inside a bar the beats are evenly spaced.
     R3  The slow file is the same recording stretched: every time in it is the record-tempo time multiplied by
         trackBpm / trackBpmSlow.
     R4  The speed slider's two extra stops change how fast a file plays (playbackRate), never where a bar is in
         the file. Slowest is the slow file at SLOWEST_RATE (read from the page); Slow is the record-tempo file
         at a rate halfway between the slow file's tempo and 1.
     R5  A section covers bars fromBar .. fromBar + bars x reps - 1; its notes are one pass of `bars` bars and
         the pass repeats `reps` times. Sections follow each other with no gap (the tool fails a card where they
         do not: it has no rule for a gap). A note lasts `beats` beats of the track's count.
     R6  METER below says how each song is counted: 4/4 (four beats), 3/4 (three), or 6/8 (two big beats of
         three eighths each: `beatsPerBar` 2 in the data). It is the tool's own table, taken from skill
         song-facts and the work order, and the page's beatsPerBar / countSix are checked against it.
     R7  A chord-grid section (card.chordGrid, unless the section says chordGrid:false) shows each chord once,
         at the column where it starts: two columns a beat ("1 + 2 + …"), in 6/8 three columns a beat numbered
         1-6. Strums of the same chord in a row are one chord, unless the card says everyStrum. The cursor is on
         the BEAT that is sounding (in 6/8, on the eighth), never on a "+". A rest is the word for a stop at its
         column unless the card says restWord:false. A row that begins inside a chord repeats its name in
         parentheses; a row that begins inside a rest repeats the rest word.
     R8  Any other section shows one column per note (a rest is a column too) and the cursor is on the note that
         is sounding.
     R9  The cursor may run ahead of the sound by the page's own leads, in real seconds (so multiplied by the
         playbackRate in file time): PC_TAB_LEAD for a tab, PC_SHEET_LEAD for a lyric sheet, and PC_ROW_LEAD
         more when the next place is on another row of the tab. The values are read from the page, never copied
         here. The tool's own limit on them: a lead may not reach one COUNT (a beat; in 6/8 an eighth) of the fastest song it
         applies to, at record tempo (LEAD RULE below). At a whole count the cursor is simply one cell ahead of the music.
     R10 A whole-song card stops at the end of its last section. Any other card goes back to the first bar of
         the section it was started from, and carries on.
     R11 Before the song comes in the page counts one bar: as many clicks as the bar has counts (4, 3, or 6 in
         6/8), evenly spaced, the first of the bar on the higher pitch (in 6/8 the first and the fourth), at the
         tempo of the bar the song comes in on (the first bar of the section, or of the lap tapped on a sheet), at the
         speed that is playing, within 1.5 ms a click; the song comes in one click-length
         after the last click. With the Metronome on, exactly one click on every count the song passes while it
         plays (taken back by the page's click latency, within 6 ms of the count; 30 ms at the lap's downbeat), the
         accented pitch being the count-in's higher one and the plain pitch its lower one; none doubled, none off its
         count, and none where no music is playing (more than 30 ms from any audible stretch: in a silence after a
         switch, or after Stop): any of these fails its walk, whether it lands in the music or not. A click
         scheduled before a press (a switch or Stop) and sounding after it is a QUEUED click: its messages are
         counted and capped (two lines a kind) apart from the others, and the summary says how many red walks are
         only queued clicks and how many have anything else. With the
         Metronome off, no click but the count-in. Every click's peak gain is at least CLICK_FLOOR, and an in-song
         click at least CLICK_VS_COUNTIN of the count-in click of the same pitch.
     R12 On a lyric sheet the mark is on the n-th chord name of the PDF, n counting the chord CHANGES of the
         chart from the top of the song, laps included (a rest is not a change; a section listed in
         card.sheetNamedAgain counts its first chord again on every lap). "This bar" lights the cell of the
         beat that is sounding and shows each chord that starts in the bar at its eighth. In the song's last
         PC_SHEET_LEAD, when the lead looks past the last bar, the sheet should stay on the last bar (KNOWN
         sheetPastEnd: the page steps "This bar" into the bar after it). Where the lead lands on a lap or section
         start, "This bar" should show the bar it lands in (KNOWN sheetLapBoundary: for one step it shows nothing).
     R13 The other versions of a card: a recording version replaces the track and the card fields it carries; a
         key version replaces the track and renames each chord through its map (the power map when the card is
         on power chords); power chords rename each chord through chordVersions.power. A power chord keeps its
         chord's root; a key version moves every chord by one interval. Bass notes change the drawing only.
     R14 BASS NOTES (the rule in the BASS NOTES comment of app/activities.js): with the bass on, a chord-grid section
         carries ONE bass note on beat 1 of every bar: the root in the first bar of a chord (the first bar whose
         beat 1 falls inside it), the 5th in the next, alternating until the chord changes; a new chord starts again
         on its root. Strums of one chord in a row are one chord (unless everyStrum). A bar that begins in a rest
         gets none. Where the chord itself starts on that beat and plays the bass string, its own fret is the bass
         note and is marked, not drawn twice; otherwise the fret from bassNotes is drawn. The map is keyed by the
         chord name the view SHOWS. A note-by-note section never carries one.

   WHAT IT CHECKS
     the data       the meter, every clock against its pin, the three leads and the click latency against theirs,
                    every chord and key map (R13), every section's beats against its bars, and the cards
                    of one song against each other: where two cards cover the same beat they must name the same
                    chord root (a rest in one of them is not a disagreement: the Watchtower record rhythm); and
                    two cards with the same number of notes in every section (twin charts: the same chart as single
                    notes, power chords or a lyric sheet) must have the same rhythm, rests included; and the
                    Watchtower record rhythm (SETTLED_RHYTHMS, from skill song-facts) in every chart it binds.
     the drawing    every page of every view, read off the screen the way a student reads it (columns in reading
                    order, the count under each, the chord or note name, the frets): each chord at the column it
                    starts on with exactly its frets (no fret on a string it does not play, but the bass note),
                    "+" columns for half-beat chords only, the counts 1-4 / 1-3 / 1-6, a count under every note
                    of a card.counts TAB, and with the bass on exactly the R14 bass note in every bar (string,
                    fret and the bass mark), none anywhere else.
     the walk       at every step: exactly one place lit (its six strings and its count or note name, and on a
                    card.counts TAB its count cell), the place the chart says, on the page that is showing, with
                    the right lap number; nothing lit during the count-in; none out of order; the file and rate
                    each setting should play. Lit at least once: in a song walk every place of the card; in a
                    section-button or lyric-line walk the first bar after each start; in a lap walk every place
                    of the section it loops to; in a Guitar or speed walk every place from a quarter bar after
                    each switch to a quarter bar before the next. The Guitar and speed switches mid-song (at every
                    stop of the slider) keep the bar and beat, and the song is silent no longer than a file load
                    (+40 ms, two song-walk steps) and back before the next control is used. Each section button and lyric line (the
                    first chord of a lap or one in the middle of a line) starts on its own first beat; the lap
                    returns to beat 1 of the section it was started from (the last one, and one in the middle),
                    with and without the spare. The Counts switch shows the count row when on (every count
                    cell displayed, visibility visible, opacity at least 0.5, a text colour that is not
                    transparent) and hides it when off. The count-in, and
                    the Metronome (R11) in the song walks, the laps, a walk of switches with it on, and a walk that
                    presses the Guitar switch (a twin swap) and then Stop each 40 ms before a count, when a click is
                    already queued: the press is timed from the element that is playing, and a press that met
                    no queued click fails the walk ("this walk tested nothing"). Elsewhere the walks press their
                    controls at fixed fractions of a bar, so whether a press meets a queued click is chance.

   WHAT IT CANNOT SEE, and why. A chart is the only statement of a song in the repo. A wrong chord, or a chord a
   beat early, is seen only where a second card of the same song covers that bar (19 of the 26 cards: "the cure",
   Seven Nation Army, Luna, Watchtower, Sweet Child). For the seven single-card songs (ca-35, ca-36, ca-37,
   ca-39, ca-41, ca-42, ca-51) only a listen can tell. The same goes for a beat map: see CLOCK PINS.

   KNOWN FAULTS. A fault the tool finds in the player's code is listed for Jonathan, not fixed here, and recorded in
   KNOWN below so that the run stays useful. An entry lists, walk by walk, the exact places where the fault shows; a
   walk whose mismatches of that kind and section are exactly those prints them as known. Any other mismatch fails,
   and so does a listed fault that shows one place more or one place fewer, or in a walk the entry does not list; a
   full run that no longer sees an entry fails too (so a fixed fault cannot leave its entry behind). Two entries
   apply to every card and are matched by the fault's exact FORM instead of a list of places: sheetPastEnd (exactly
   the first cell lit, no chord names and the mark on the last chord name, only in the song's last PC_SHEET_LEAD) and
   sheetLapBoundary (no cell lit and no chord names, the mark on the right chord name, for one step only, only where
   the file position plus PC_SHEET_LEAD is within one step of a lap or section start); a sheet that is wrong in any
   other way fails.
   FIXED 2026-11-12: the count-in tempo (KNOWN countInTempo until then). pcCountIn clicked at the window's AVERAGE
   tempo (st.win.bar), not at the tempo of the bar the song comes in on: 356 count-ins of a full run were off the
   bar's own tempo by more than 1.5 ms a click, the worst Madrecita Querida's Ending, 16.9% too fast. It now reads
   the bar pcStart seeks to (R11).
   FOUND AND FIXED THE SAME DAY (2026-11-12): the queued Metronome click. pcScheduleClick queued each in-song click
   up to about 0.18 s ahead (0.1 s before its count plus the latency) and kept no handle; pcRetrack reset
   st.lastBeat and cancelled nothing, and pcStop stopped only the count-in clicks. So after a speed switch that loads
   a file a click sounded early or in the silence and the count clicked again when the music was back; a Guitar twin
   swap clicked a count twice, a few ms apart; one click sounded after Stop (61 of 468 walks red). Fixed in
   app/cards.js (QUEUED CLICKS): the clicks are kept in st.clicks until they have sounded, and pcRetrack, the
   Metronome switch and Stop take back those whose count is still to come (a first cut that took back every click
   not yet heard lost the click of a count the song had just reached: the due-count check caught it). The snippet
   player (snipScheduleClick, snipSetTier, snipStop) and the Journey pages (clickTick: a seek, a pause, a file switch,
   the Metronome switch) had the same fault and got the same rule later that day (QUEUED CLICKS now lives in
   app/snippets.js, queueClick / cancelQueuedClicks, shared by both app players; tabs/journey.js keeps its own copy).
   This tool does not walk those two players (NOT COVERED); they were proved by a scripted check on the same fake
   world, not kept in the repo.

   NOT COVERED: the six Song Journey pages (tabs/journey.js has its own player: ensurePlayer, switchSrc, clickTick,
   barNextBeat / barBeatTime, the data-click-bars / data-click-anchor lists; its tabs are static text with no
   cursor) and the step snippets (snipState in app/snippets.js). Both could reuse the fake world below.

   CLOCK PINS. A track's clock (anchor, barTimes, the tempos, the count) is measured from the record and nothing
   in the repo can re-derive it. The tool keeps a fingerprint of each one as last confirmed by ear. A clock that
   no longer matches its pin fails the run with the track's name: re-measure (tools/beat-map.py), listen, then
   paste the new line from `--pins`. Never paste a pin to get a green run. The three leads and the click latency are
   pinned the same way (LEAD_PINS): the page's values are used, and a changed one fails until it has been listened to. */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, existsSync, statSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const ROOT = resolve(opt('--root') || HERE);
const ONLY = opt('--only') ? opt('--only').split(',').map(x => x.trim()).filter(Boolean) : null;
const SETTING = opt('--setting');
const VERBOSE = args.includes('--verbose');
const JSON_OUT = opt('--json');
const STEP_MS = Number(opt('--step')) > 0 ? Number(opt('--step')) : 20;
const FINE_MS = 5;
const STALL_S = Number(opt('--stall')) > 0 ? Number(opt('--stall')) : 120;
const PINS_ONLY = args.includes('--pins');
const SHOTS = opt('--shots') ? resolve(opt('--shots')) : null;

/* R6: how each song is counted. beats = `beatsPerBar` as the data counts them; steps = cursor steps and
   clicks in a bar; sub = cursor steps (and clicks) per beat. */
const METERS = {
  '4/4': { beats: 4, steps: 4, sub: 1, cols: 2 },
  '3/4': { beats: 3, steps: 3, sub: 1, cols: 2 },
  '6/8': { beats: 2, steps: 6, sub: 3, cols: 3 },
};
const METER = {
  'the-cure': '4/4', 'seven-nation-army': '4/4', 'luna': '6/8', 'sweet-child-o-mine': '4/4',
  'all-along-the-watchtower': '4/4', 'all-along-the-watchtower-neil': '4/4', 'las-mananitas': '3/4',
  'madrecita-querida': '4/4', 'madrecita-querida-f': '4/4', 'arsenal-efectivo': '6/8', 'ella': '6/8',
  'perdon-mama': '6/8', 'smells-like-teen-spirit': '4/4', 'vuelve-a-la-vida': '3/4',
};
/* CLOCK PINS (see the header). `node tools/playalong-loop.mjs --pins` prints these lines for the site it reads. */
const CLOCK_PINS = {
  'the-cure': 'e9e7091cdb4a',
  'seven-nation-army': 'eb3263796397',
  'luna': 'ed42cedf8f3b',
  'sweet-child-o-mine': '81ebe8a0fe39',
  'all-along-the-watchtower': '0cb325894038',
  'all-along-the-watchtower-neil': '281daa634f09',
  'las-mananitas': '0e64084f7c21',
  'madrecita-querida': 'a8c5daf2f148',
  'madrecita-querida-f': 'a8c5daf2f148',
  'arsenal-efectivo': '8ba440ccd8cb',
  'ella': '59cbed29fd26',
  'perdon-mama': '72a393e21c24',
  'smells-like-teen-spirit': '47950b2b9841',
  'vuelve-a-la-vida': '9e79dcc92e8e',
};

/* SETTLED RHYTHMS: rulings from skill song-facts that the expected answer has built in. A chart that departs from one
   fails the run; change the ruling there first, with Jonathan, never here alone. `pattern` is one chord root per
   eighth note where a strum STARTS and "." where none does, repeated through every section of every card of the
   track except the named exceptions. Several cards share one chart definition in class-activities.js (ca-29 and
   ca-38; ca-30 and ca-44; ca-33 and ca-45), so comparing cards cannot see a change made to that one definition:
   this can, for the song it covers. */
const SETTLED_RHYTHMS = [
  { track: 'all-along-the-watchtower', except: ['ca-26', 'ca-40'], pattern: 'AAAAGGGGFFF..GGG',
    source: "skill song-facts, the record's rhythm, confirmed by Jonathan's ear 2026-10-26: bar 1 A A A A G G G G (G lands ON beat 3), bar 2 F F F · · G G G (G on the + after 3); ca-26 and ca-40 are exceptions on purpose" },
];

/* KNOWN FAULTS of the site, found by this tool and LISTED for Jonathan, not fixed (the work order: a fault in the
   player's code or in a lead is listed and left). An entry names the card, the section and the kinds of mismatch, and
   for every walk that shows the fault, the EXACT places: `expect['<view> · <walk>'] = { back: [...], neverLit: [...] }`.
   A walk whose mismatches of those kinds in that section are exactly its list prints them as known; one place more or
   one fewer (or any in a walk the entry does not list) fails, so the entry cannot hide a fault that grows or moves.
   A full run in which an entry matched nothing fails too, so a fixed fault cannot leave its entry behind. `why` is
   printed with the leads the page declares, never a number typed here. Add an entry only for a fault Jonathan has
   been told about. */
const KNOWN = [
  { card: 'ca-35', section: 'Solo', kinds: ['back', 'neverLit'], since: '2026-11-11',
    why: (C, x) => `PC_ROW_LEAD (${C.rowLead} s) is longer than the quick notes of the Las Mañanitas solo (the shortest is ${x.shortest.toFixed(3)} s at record tempo). At a line change the cursor shows the SECOND note of the new line first and then steps back to the first (Normal speed: notes 17 and 66, both the first note of a tab row), and the last note of a line (note 65) is never lit in a 20 ms walk at Slower, Slow and Normal.`,
    expect: {
      /* Every walk that shows it, as seen on 2026-11-12 (the song walks, 20 ms steps). Notes count from 1 within the Solo;
         its rows (card.sections rows: 9, 7, 8, ...) start at notes 1, 10, 17, 25, 29, 35, 40, 46, 50, 56, 61, 66, 74, 84.
         Re-recorded 2026-11-12 after the count-in fix: the count-in now lasts the bar's own length, so the song walks'
         20 ms steps fall at other points of the music and the step-back is seen at the row start note 17 instead of
         note 1 (the same fault at another line start). */
      'power chords, bass notes (as it opens) · song · slower': { neverLit: ['note 65'] },
      'power chords, bass notes (as it opens) · song · slow': { neverLit: ['note 65'] },
      'power chords, bass notes (as it opens) · song · normal': { back: ['note 17', 'note 66'], neverLit: ['note 65'] },
      'full chords, bass notes · song · slower': { neverLit: ['note 65'] },
      'full chords, bass notes · song · normal': { back: ['note 17', 'note 66'], neverLit: ['note 65'] },
      'power chords, strum only · song · slower': { neverLit: ['note 65'] },
      'power chords, strum only · song · normal': { back: ['note 17', 'note 66'], neverLit: ['note 65'] },
    } },
  /* A lyric sheet's "This bar" in the song's last PC_SHEET_LEAD: the lead looks past the last bar, and the strip
     steps into a bar that does not exist (the first cell lit, no chord names) while the mark stays on the last chord name of
     the sheet. Matched by that exact state, and only in that last stretch; anything else there fails. */
  { card: '*', kinds: ['sheetPastEnd'], since: '2026-11-11',
    why: (C, x) => `On a lyric sheet, for the last ${C.sheetLead} s (PC_SHEET_LEAD) of the song (before it stops or laps), "This bar" steps one bar past the end: it lights the bar's first cell and shows no chord names, a bar that does not exist (${x.n} steps of this run, in ${x.walks} walks, every one exactly that state).` },
  /* A lyric sheet's "This bar" where the lead lands exactly on a lap or section start, mid-song: pcSheetStrip reads the
     bar with a different rounding margin from pcLocate, so for one step it picks the bar after the last of the lap
     (none exists: no chord names) and a cell before the first (none lit), while the chord mark is right. The same strip
     code as sheetPastEnd. Matched by that exact state, for ONE step, and only where the file position plus
     PC_SHEET_LEAD is within one step of a lap or section start; a blank strip anywhere else, or longer, fails. */
  { card: '*', kinds: ['sheetLapBoundary'], since: '2026-11-12',
    why: (C, x) => `On a lyric sheet, where the music is ${C.sheetLead} s (PC_SHEET_LEAD) before a repeat or a new section, the "This bar" strip blinks empty for one frame (no cell lit, no chord names; the chord mark on the sheet stays right). The same strip code as the past-the-end fault above (${x.n} steps of this run, in ${x.walks} walks, every one a single step exactly in that state).` },
];

/* LEAD AND LATENCY PINS: the three leads and the click latency, as last confirmed by ear (Jonathan tuned the sheet's
   lead by ear on 2026-10-19). The page's own values are what the walks use; a value that no longer matches its pin
   fails the run until someone has listened to the new one and changed the pin here. */
const LEAD_PINS = { PC_TAB_LEAD: 0, PC_ROW_LEAD: 0.15, PC_SHEET_LEAD: 0.175, snipLatency: 0.08 };

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.webmanifest': 'application/manifest+json' };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); s.on('error', rej); });
function serve(dir) {
  const srv = createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const f = normalize(join(dir, p));
    if (!f.startsWith(dir) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': MIME[extname(f).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(readFileSync(f));
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r({ srv, port: srv.address().port })));
}
async function openPage(port) {
  const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = new Map(); const handlers = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
    else if (m.method) handlers.forEach(h => h(m.method, m.params));
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const evalJs = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  return { send, evalJs, on: h => handlers.push(h), close: async () => { try { ws.close(); await fetch(`http://127.0.0.1:${port}/json/close/${t.id}`); } catch { /* gone */ } } };
}

/* ═══ THE FAKE WORLD, inside the page ════════════════════════════════════════════════════════════════════════
   Installed once. While V.on is false every override passes straight through to the browser's own function. */
const PAGE_SRC = String.raw`(() => {
  if (window.__pl) return true;
  const real = { st: window.setTimeout.bind(window), ct: window.clearTimeout.bind(window), raf: window.requestAnimationFrame.bind(window),
    caf: window.cancelAnimationFrame.bind(window), Audio: window.Audio, now: performance.now.bind(performance) };
  const VID = 1e9;
  const V = { on: false, t: 0, timers: [], rafs: [], seq: 1, els: [], clicks: [], starts: [], errors: [], dur: {}, loadMs: 40, lateNeverLoad: false, where: new Map() };
  function vSet(fn, ms, args){ const id = VID + V.seq++; V.timers.push({ id: id, at: V.t + Math.max(0, +ms || 0), fn: fn, args: args || [], n: V.seq }); return id; }
  window.setTimeout = function(fn, ms){ if (!V.on) return real.st.apply(null, arguments); return vSet(typeof fn === 'function' ? fn : new Function(String(fn)), ms, Array.prototype.slice.call(arguments, 2)); };
  window.clearTimeout = function(id){ if (id >= VID){ V.timers = V.timers.filter(function(x){ return x.id !== id; }); return; } return real.ct(id); };
  window.requestAnimationFrame = function(cb){ if (!V.on) return real.raf(cb); const id = VID + V.seq++; V.rafs.push({ id: id, cb: cb }); return id; };
  window.cancelAnimationFrame = function(id){ if (id >= VID){ V.rafs = V.rafs.filter(function(x){ return x.id !== id; }); return; } return real.caf(id); };
  performance.now = function(){ return V.on ? V.t : real.now(); };

  /* An <audio> element with no sound. It loads V.loadMs after it is given a file, seeks at once, and moves
     currentTime by playbackRate while it plays, times its own small fixed skew: element n of a walk runs SKEW[n % 4]
     fast or slow (-0.3%, +0.3%, +0.6%, -0.6%), so two elements playing side by side drift apart the way two real
     decoders do and the twin's nudge, snap and rate reset really run. playbackRate itself reads what the page set. */
  const SKEW = [-0.003, 0.003, 0.006, -0.006];
  /* The file an address names: its path on this site (the page sets a spare's src from another element's absolute URL). */
  function fileOf(v){ if (!v) return ''; try { const u = new URL(v, location.href); return u.origin === location.origin ? decodeURIComponent(u.pathname).replace(/^\//, '') : v; } catch (e) { return v; } }
  function FakeAudio(){
    this._attr = ''; this._file = ''; this._ct = 0; this._ready = 0; this._want = false; this._tok = 0; this._l = {}; this._n = V.els.length; this._skew = SKEW[V.els.length % 4];
    this.paused = true; this.ended = false; this.seeking = false; this.muted = false; this.playbackRate = 1; this.defaultPlaybackRate = 1;
    this.preload = ''; this.loop = false; this.volume = 1;
    V.els.push(this);
  }
  FakeAudio.prototype = {
    get src(){ return this._attr ? new URL(this._attr, location.href).href : ''; },
    set src(v){ this._attr = String(v == null ? '' : v); this._file = fileOf(this._attr); this._load(); },
    getAttribute: function(k){ return k === 'src' ? (this._attr || null) : null; },
    get readyState(){ return this._ready; },
    get currentTime(){ return this._ct; },
    set currentTime(v){ if (this._ready < 1) return; this._ct = Math.max(0, Math.min(+v || 0, this._dur())); this.ended = false; },
    get duration(){ return this._ready ? this._dur() : NaN; },
    _dur: function(){ const d = V.dur[this._file]; return d > 0 ? d : 1e9; },
    load: function(){ this._load(); },
    _load: function(){
      const me = this, tok = ++this._tok;
      this._ready = 0; this._ct = 0; this.paused = true; this.ended = false; this._want = false; this.playbackRate = this.defaultPlaybackRate;
      if (!this._attr) return;
      if (V.lateNeverLoad && this._n > 0) return;
      vSet(function(){ if (me._tok !== tok) return; me._ready = 4; me._fire('loadedmetadata'); me._fire('canplay'); if (me._want) me._start(); }, V.loadMs);
    },
    play: function(){ if (!this._attr) return Promise.reject(new Error('no file')); if (this._ready >= 3) this._start(); else this._want = true; return Promise.resolve(); },
    _start: function(){
      const me = this; this._want = false;
      if (!this.paused) return;
      if (this.ended){ this._ct = 0; this.ended = false; }
      this.paused = false;
      V.starts.push({ t: V.t, n: this._n, ct: this._ct, muted: this.muted });
      vSet(function(){ if (!me.paused) me._fire('playing'); }, 0);
    },
    pause: function(){ this._want = false; this.paused = true; },
    addEventListener: function(t, fn, o){ (this._l[t] = this._l[t] || []).push({ fn: fn, once: !!(o && o.once) }); },
    removeEventListener: function(t, fn){ this._l[t] = (this._l[t] || []).filter(function(x){ return x.fn !== fn; }); },
    _fire: function(t){
      const me = this, ls = (this._l[t] || []).slice();
      this._l[t] = (this._l[t] || []).filter(function(x){ return !x.once; });
      ls.forEach(function(x){ try { x.fn.call(me, { type: t, target: me }); } catch (e) { V.errors.push('audio ' + t + ': ' + (e && e.message)); } });
    },
    _adv: function(ms){
      if (this.paused || this._ready < 3 || this.seeking) return;
      this._ct += ms / 1000 * this.playbackRate * (1 + this._skew);
      const d = this._dur();
      if (this._ct >= d){ this._ct = d; this.paused = true; this.ended = true; this._fire('ended'); }
    }
  };
  window.Audio = function(){ return V.on ? new FakeAudio() : new real.Audio(); };

  /* The page's sound output: every click the site schedules is logged with its time, pitch and loudness. */
  function param(){ return { value: 1, setValueAtTime: function(){}, exponentialRampToValueAtTime: function(){}, linearRampToValueAtTime: function(){}, setTargetAtTime: function(){}, cancelScheduledValues: function(){} }; }
  const fctx = {
    get currentTime(){ return V.t / 1000; }, state: 'running', destination: {}, sampleRate: 48000, baseLatency: 0, outputLatency: 0,
    resume: function(){ return Promise.resolve(); }, suspend: function(){ return Promise.resolve(); }, close: function(){ return Promise.resolve(); },
    createOscillator: function(){
      const o = { frequency: param(), type: 'sine', _g: null, _c: null,
        connect: function(g){ o._g = g; return g; }, disconnect: function(){ if (o._c && V.t / 1000 < o._c.at) o._c.cancelled = true; },
        start: function(at){ o._c = { at: at == null ? V.t / 1000 : at, freq: o.frequency.value, peak: o._g ? o._g._peak : 0, made: V.t / 1000, cancelled: false }; V.clicks.push(o._c); },
        stop: function(at){ if (o._c && (at || 0) <= o._c.at && V.t / 1000 < o._c.at) o._c.cancelled = true; } };
      return o;
    },
    createGain: function(){
      const g = { _peak: 0, gain: param(), connect: function(x){ return x; }, disconnect: function(){} };
      g.gain.exponentialRampToValueAtTime = function(v){ if (v > g._peak) g._peak = v; };
      g.gain.linearRampToValueAtTime = function(v){ if (v > g._peak) g._peak = v; };
      return g;
    },
    createBufferSource: function(){ return { connect: function(x){ return x; }, disconnect: function(){}, playbackRate: param(), detune: param(), start: function(){}, stop: function(){}, buffer: null }; },
    createBuffer: function(c, n){ return { getChannelData: function(){ return new Float32Array(Math.max(1, n || 1)); }, duration: 0 }; },
    createDynamicsCompressor: function(){ return { connect: function(x){ return x; }, disconnect: function(){}, threshold: param(), knee: param(), ratio: param(), attack: param(), release: param() }; },
    createBiquadFilter: function(){ return { connect: function(x){ return x; }, disconnect: function(){}, frequency: param(), Q: param(), gain: param(), type: 'lowpass' }; },
    decodeAudioData: function(){ return Promise.reject(new Error('no audio in the fake world')); }
  };

  function adv(to){ const d = to - V.t; if (d > 0) for (let i = 0; i < V.els.length; i++) V.els[i]._adv(d); if (to > V.t) V.t = to; }
  async function frame(dtReal){
    const target = V.t + dtReal;
    for (let guard = 0; guard < 10000; guard++){
      let k = -1;
      for (let i = 0; i < V.timers.length; i++){ const x = V.timers[i]; if (x.at <= target && (k < 0 || x.at < V.timers[k].at || (x.at === V.timers[k].at && x.n < V.timers[k].n))) k = i; }
      if (k < 0) break;
      const x = V.timers.splice(k, 1)[0];
      adv(x.at);
      try { x.fn.apply(window, x.args); } catch (e) { V.errors.push('timer: ' + (e && e.message)); }
      await null;
    }
    adv(target);
    const q = V.rafs; V.rafs = [];
    for (let i = 0; i < q.length; i++){ try { q[i].cb(V.t); } catch (e) { V.errors.push('frame: ' + (e && e.message)); } }
    await null;
  }

  /* ── reading the card off the screen ── */
  const theRoot = function(){ return document.querySelector('.ca-card[open] .pc'); };
  const txt = function(el){ return el ? String(el.textContent || '').replace(/\s+/g, ' ').trim() : ''; };
  function visIdx(root){ const ps = root.querySelectorAll('.pc-page'); for (let i = 0; i < ps.length; i++) if (!ps[i].hidden) return i; return -1; }
  /* One page of the tab, as drawn. Every cell is given its (row, column) from where it sits in the grid, and
     that is checked against where the browser actually put it (off: cells not at their column's left edge). */
  function scanPage(pageEl, si){
    const rows = [], off = [];
    const grids = pageEl.querySelectorAll('.tab-grid');
    for (let ri = 0; ri < grids.length; ri++){
      const g = grids[ri], isGrid = g.classList.contains('chord-grid');
      const labs = g.querySelectorAll('.tab-str-label'), cells = g.querySelectorAll('.tab-cell');
      const n = labs.length ? cells.length / labs.length : 0;
      if (!labs.length || n !== Math.floor(n)){ rows.push({ bad: 'a row with ' + cells.length + ' cells on ' + labs.length + ' strings' }); continue; }
      const cols = [];
      for (let c = 0; c < n; c++) cols.push({ count: null, held: false, names: [], frets: {}, bass: 0, bassOn: [], pad: false, x: 0 });
      const strs = Array.prototype.map.call(labs, function(l){ return txt(l); });
      const colX = [];
      for (let c = 0; c < n; c++) colX.push(cells[c].getBoundingClientRect().left);
      const colW = n > 1 ? colX[1] - colX[0] : cells[0].getBoundingClientRect().width;
      const put = function(el, c, strict){
        V.where.set(el, si + ':' + ri + ':' + c);
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;
        if (strict ? Math.abs(r.left - colX[c]) > 2 : (r.left < colX[c] - 2 || r.left > colX[c] + colW)) off.push(ri + ':' + c + ' ' + el.className);
      };
      for (let i = 0; i < cells.length; i++){
        const c = i % n, s = strs[Math.floor(i / n)], el = cells[i];
        put(el, c, true);
        if (el.classList.contains('tab-pad')) cols[c].pad = true;
        const f = el.querySelector('.tab-fret');
        if (f){ cols[c].frets[s] = txt(f); if (f.classList.contains('tab-bass')){ cols[c].bass++; cols[c].bassOn.push(s); } }
      }
      const colOf = function(el){ const v = parseInt(el.style.gridColumnStart, 10); return v >= 2 ? v - 2 : -1; };
      if (isGrid){
        g.querySelectorAll('.tab-chord-btn, .tab-rest-lab').forEach(function(el){
          const c = colOf(el);
          if (c < 0 || c >= n){ off.push(ri + ': a name outside the row'); return; }
          const t = txt(el), rest = el.classList.contains('tab-rest-lab'), heldName = !rest && /^\(.*\)$/.test(t);
          cols[c].names.push([rest ? 'rest' : heldName ? 'held' : 'chord', heldName ? t.slice(1, -1) : t]);
          put(el, c, false);
        });
        g.querySelectorAll('.tab-count').forEach(function(el){
          const c = colOf(el);
          if (c < 0 || c >= n) return;
          cols[c].count = txt(el); cols[c].held = el.classList.contains('tab-count-held');
          put(el, c, true);
        });
      } else {
        /* A tab system: after the six string rows comes the name row (a spacer, then one element per column),
           then, on a card with counts, the count row (the same shape). */
        const kids = Array.prototype.filter.call(g.children, function(k){ return !k.classList.contains('tab-box') && !k.classList.contains('tab-str-label') && !k.classList.contains('tab-cell'); });
        const cnt = kids.filter(function(k){ return k.classList.contains('tab-count'); });
        const nam = kids.filter(function(k){ return !k.classList.contains('tab-count'); });
        if (nam.length !== n + 1 && nam.length !== 0) off.push(ri + ': the name row has ' + nam.length + ' cells for ' + n + ' columns');
        for (let k = 1; k < nam.length && k <= n; k++){
          const el = nam[k], c = k - 1;
          if (el.classList.contains('tab-rest')){ cols[c].names.push(['rest', '']); put(el, c, true); }
          else if (el.classList.contains('tab-note-btn')){ cols[c].names.push(['note', txt(el)]); put(el, c, false); }
        }
        if (cnt.length && cnt.length !== n + 1) off.push(ri + ': the count row has ' + cnt.length + ' cells for ' + n + ' columns');
        for (let k = 1; k < cnt.length && k <= n; k++){
          const el = cnt[k], c = k - 1;
          const h = el.querySelector('.tab-count-held');
          cols[c].count = h ? txt(el).replace(txt(h), '').trim() : txt(el);
          cols[c].held = el.classList.contains('tab-count-held');
          put(el, c, true);
        }
      }
      for (let c = 0; c < n; c++) cols[c].x = Math.round(colX[c] * 10) / 10;
      const lab = g.previousElementSibling && g.previousElementSibling.classList.contains('pc-row-label') ? txt(g.previousElementSibling) : '';
      rows.push({ grid: isGrid, label: lab, cols: cols, top: Math.round(g.getBoundingClientRect().top + (document.querySelector('.main') ? document.querySelector('.main').scrollTop : 0)) });
    }
    const cap = pageEl.querySelector('.tab-phrase-label');
    const cnt0 = pageEl.querySelector('.tab-count[data-seq], .tab-count[data-beat]');
    return { si: si, rows: rows, off: off, caption: txt(cap), countsShown: !!(cnt0 && cnt0.offsetHeight) };
  }
  function showPage(root, si){
    const pager = root.querySelector('.pc-pager');
    for (let guard = 0; guard < 400 && visIdx(root) !== si; guard++){
      if (!pager) return false;
      const btns = pager.querySelectorAll('.tab-pager-btn');
      (visIdx(root) < si ? btns[1] : btns[0]).click();
    }
    return visIdx(root) === si;
  }

  let R = null;
  function primary(){ for (let i = 0; i < V.els.length; i++){ const e = V.els[i]; if (!e.paused && !e.muted && e._ready >= 3 && e._attr) return e; } return null; }
  function litKey(arr){
    if (!arr.length) return '';
    const set = {}; let cnt = 0, unk = 0;
    for (let i = 0; i < arr.length; i++){ const w = V.where.get(arr[i]); if (!w){ unk++; continue; } set[w] = 1; if (arr[i].classList.contains('tab-count')) cnt++; }
    return Object.keys(set).sort().join('|') + ';n' + arr.length + ';c' + cnt + (unk ? ';u' + unk : '');
  }
  function observe(){
    let a1 = null, a2 = null, nA = 0;
    for (let i = 0; i < V.els.length; i++){ const e = V.els[i]; if (!e.paused && !e.muted && e._ready >= 3 && e._attr){ nA++; if (!a1) a1 = e; else if (!a2) a2 = e; } }
    const aKey = (a1 ? a1._file + '@' + a1.playbackRate : '') + (a2 ? '&' + a2._file + '@' + a2.playbackRate : '') + (nA > 2 ? '&more' : '');
    let lk, misc;
    if (R.sheet){
      let now = '', names = '';
      for (let i = 0; i < R.strip.length; i++){ const c = R.strip[i]; if (c.classList.contains('now')) now += (now ? ',' : '') + i; names += (i ? ',' : '') + R.stripCh[i].textContent; }
      const pl = R.pill ? R.pill.style.left + '|' + R.pill.style.top : '';
      if (pl !== R.pl){ R.pl = pl; R.pillIdx = pl in R.hitAt ? R.hitAt[pl] : -1; }
      lk = now;
      misc = R.pillIdx + '~' + names + '~' + (R.where ? R.where.textContent : '') + '~' + R.status.textContent + '~' + (R.cntNow ? R.cntNow.length : 0);
    } else {
      const lit = R.lit;
      let same = lit.length === R.prev.length;
      if (same) for (let i = 0; i < lit.length; i++) if (lit[i] !== R.prev[i]){ same = false; break; }
      if (!same){ R.prev = Array.prototype.slice.call(lit); R.litKey = litKey(R.prev); }
      lk = R.litKey;
      let vis = -1;
      for (let i = 0; i < R.pages.length; i++) if (!R.pages[i].hidden){ vis = i; break; }
      const rp = vis >= 0 ? R.reps[vis] : null;
      misc = vis + '~' + (rp && !rp.hidden ? rp.textContent : '') + '~' + R.status.textContent;
    }
    const key = aKey + '#' + lk + '#' + misc;
    let ki = R.keyIdx.get(key);
    if (ki === undefined){ ki = R.keys.length; R.keys.push(key); R.keyIdx.set(key, ki); }
    const c1 = a1 ? a1._ct : -1, c2 = a2 ? a2._ct : -1, runs = R.runs, L = runs.length;
    R.frames++;
    if (L && runs[L - 8] === ki && c1 >= runs[L - 3] - 1e-9 && c1 <= runs[L - 3] + 0.25){ runs[L - 7]++; runs[L - 5] = V.t; runs[L - 3] = c1; runs[L - 1] = c2; }
    else runs.push(ki, 1, V.t, V.t, c1, c1, c2, c2);
  }
  /* The count row of the note-by-note sections (card.counts): the class on the TAB and whether a count cell is on screen. */
  function countsState(root){
    const tab = root.querySelector('.pc-tab');
    const cells = root.querySelectorAll('.pc-tab .tab-grid:not(.chord-grid) .tab-count[data-seq]');
    let shown = 0;
    /* display, visibility, opacity (at least 0.5, up to the row's grid) and a text colour that is not transparent; not
       size: most pages are hidden. */
    const alpha = function(col){ const m = /\(([^)]*)\)/.exec(col || ''); if (!m) return 1; const p = m[1].split(/[\s,\/]+/).filter(function(x){ return x !== '' && !isNaN(parseFloat(x)); }); return p.length > 3 ? parseFloat(p[3]) : 1; };
    const seen = function(el){
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility !== 'visible' || !(alpha(cs.color) > 0)) return false;
      for (let x = el; x; x = x.parentElement){ if (!(parseFloat(getComputedStyle(x).opacity) >= 0.5)) return false; if (x.classList.contains('tab-grid')) break; }
      return true;
    };
    for (let i = 0; i < cells.length; i++) if (seen(cells[i])) shown++;
    return { cls: !!(tab && tab.classList.contains('counts-on')), cells: cells.length, shown: shown };
  }
  const snap = function(root){ return { slow: root.dataset.slow || '', rate: root.dataset.rate || '', guitar: root.dataset.guitar || '', metro: root.dataset.metro || '', twin: root.dataset.twin || '', counts: countsState(root) }; };

  window.__pl = {
    V: V,
    consts: function(){
      return { rowLead: PC_ROW_LEAD, tabLead: PC_TAB_LEAD, sheetLead: PC_SHEET_LEAD, slowestRate: SLOWEST_RATE, latency: snipLatency(),
        tracks: JSON.parse(JSON.stringify(SNIPPET_TRACKS)), cards: JSON.parse(JSON.stringify((window.CLASS_ACTIVITIES || []).filter(function(a){ return a.view === 'card' && a.card; }))) };
    },
    /* Open one card on the In class page in the view asked for, through its own switches. A teacher-only card
       (ca-40) is not on the student page: its flag is cleared in THIS PAGE'S MEMORY so the student renderer draws it. */
    open: function(id, view){
      const a = (window.CLASS_ACTIVITIES || []).find(function(x){ return x.id === id; });
      if (!a) return { ok: false, why: 'no such activity' };
      if (a.teacherOnly){ a.teacherOnly = false; try { caBoardCache = null; } catch (e) {} }
      if (pcState) pcStop();
      if (!document.querySelector('.ca-screen') || !document.querySelector('.ca-screen').offsetHeight) openClassActivitiesScreen();
      caFocusActivity(id);
      let root = theRoot();
      if (!root || root.dataset.id !== id) return { ok: false, why: 'the card did not open' };
      const press = function(sel, idx){
        const b = theRoot().querySelectorAll(sel + ' button')[idx];
        if (!b) return false;
        if (b.getAttribute('aria-pressed') !== 'true') b.click();
        return true;
      };
      const miss = [];
      if (view.rec != null && !press('.ca-rec-switch', view.rec)) miss.push('recording');
      if (view.key != null && !press('.ca-key-switch:not(.ca-rec-switch)', view.key)) miss.push('key');
      if (view.chord != null && !press('.ca-chord-switch:not(.ca-key-switch):not(.ca-bass-switch)', view.chord)) miss.push('chords');
      if (view.bass != null && !press('.ca-bass-switch', view.bass)) miss.push('bass');
      root = theRoot();
      if (!root || root.dataset.id !== id) return { ok: false, why: 'the card closed after a view switch' };
      const pressed = function(sel){ const bs = root.querySelectorAll(sel + ' button'); for (let i = 0; i < bs.length; i++) if (bs[i].getAttribute('aria-pressed') === 'true') return i; return -1; };
      return { ok: !miss.length, why: miss.length ? 'no switch for: ' + miss.join(', ') : '', sheet: !!root.querySelector('.pc-sheet'),
        got: { rec: pressed('.ca-rec-switch'), key: pressed('.ca-key-switch:not(.ca-rec-switch)'), chord: pressed('.ca-chord-switch:not(.ca-key-switch):not(.ca-bass-switch)'), bass: pressed('.ca-bass-switch') },
        hasGuitar: !!root.querySelector('.pc-guitar:not(.pc-counts)'), hasSlider: !!root.querySelector('.pc-speed-range'), hasCounts: !!root.querySelector('.pc-counts'),
        sections: root.querySelectorAll('.pc-sec').length, state: snap(root) };
    },
    sheetReady: function(){ const root = theRoot(); const p = root && root.querySelector('.pc-sheet-paper'); return !!(p && p._sheet); },
    /* Read every page of the open card. Pages are turned with the card's own Previous / Next buttons. */
    scan: function(){
      const root = theRoot();
      V.where = new Map();
      if (root.querySelector('.pc-sheet')){
        const paper = root.querySelector('.pc-sheet-paper'), sh = paper && paper._sheet;
        const hits = root.querySelectorAll('.pc-sheet-hit');
        return { sheet: true, ok: !!(sh && sh.ok), toks: sh ? sh.model.toks.map(function(T){ return T.name; }) : [], hits: hits.length,
          strip: Array.prototype.map.call(root.querySelectorAll('.pc-strip-cell .pc-strip-n'), function(x){ return txt(x); }), msg: txt(root.querySelector('.pc-sheet-msg')) };
      }
      const pages = root.querySelectorAll('.pc-page'), out = [];
      const was = visIdx(root);
      for (let si = 0; si < pages.length; si++){
        if (!showPage(root, si)){ out.push({ si: si, rows: [], off: ['the page could not be shown with the pager'] }); continue; }
        out.push(scanPage(pages[si], si));
      }
      showPage(root, was < 0 ? 0 : was);
      return { sheet: false, pages: out, countsOn: !!(root.querySelector('.pc-tab') && root.querySelector('.pc-tab').classList.contains('counts-on')) };
    },
    /* One walk on the virtual clock. plan.ops: click / speed / run / untilAudible / untilSilent. */
    walk: async function(plan){
      const root = theRoot();
      if (!root) return { fatal: 'no open card' };
      if (pcState) pcStop();
      V.on = true; V.t = 0; V.timers = []; V.rafs = []; V.els = []; V.clicks = []; V.starts = []; V.errors = [];
      V.dur = plan.dur || {}; V.loadMs = plan.loadMs || 40; V.lateNeverLoad = !!plan.lateNeverLoad;
      const ctxWas = audioCtx;
      audioCtx = fctx;
      const sheet = !!root.querySelector('.pc-sheet');
      R = { sheet: sheet, runs: [], keys: [], keyIdx: new Map(), events: [], frames: 0, prev: [], litKey: '', lit: root.getElementsByClassName('beat-now'),
        pages: root.querySelectorAll('.pc-page'), reps: [], status: root.querySelector('.pc-status') };
      R.pages.forEach(function(p){ R.reps.push(p.querySelector('.pc-rep')); });
      if (sheet){
        R.strip = root.querySelectorAll('.pc-strip-cell'); R.stripCh = root.querySelectorAll('.pc-strip-cell .pc-strip-ch');
        R.pill = root.querySelector('.pc-sheet-pill'); R.where = root.querySelector('.pc-sheet-where'); R.cntNow = root.getElementsByClassName('beat-now');
        R.hitAt = {}; R.pl = null; R.pillIdx = -1;
        root.querySelectorAll('.pc-sheet-hit').forEach(function(h, i){ R.hitAt[h.style.left + '|' + h.style.top] = i; });
      }
      const dtOf = function(dt){ const a = primary(); return dt / (a ? a.playbackRate : 1); };
      let fatal = '';
      try {
        for (let oi = 0; oi < plan.ops.length; oi++){
          const op = plan.ops[oi];
          const ev = { i: oi, op: op.op, t: V.t, run: R.runs.length / 8, playingBefore: !!pcState, countingBefore: !!(pcState && pcState.counting) };
          if (op.op === 'click'){
            const el = root.querySelectorAll(op.sel)[op.i || 0];
            if (!el) throw new Error('nothing to click: ' + op.sel + ' [' + (op.i || 0) + ']');
            if (op.want == null || el.getAttribute(op.attr) !== op.want) el.click(); else ev.skipped = true;
          } else if (op.op === 'speed'){
            const range = root.querySelector('.pc-speed-range');
            if (range){ range.value = String(op.i); range.dispatchEvent(new Event('input', { bubbles: true })); range.dispatchEvent(new Event('change', { bubbles: true })); }
            else {
              const sw = root.querySelector('.pc-speed:not(.pc-guitar)');
              if (!sw) throw new Error('no speed control');
              const wantSlow = op.i <= 1 ? '1' : '';
              if ((root.dataset.slow || '') !== wantSlow) sw.click();
            }
          } else if (op.op === 'run'){
            const end = V.t + op.ms;
            while (V.t < end - 1e-9){ await frame(dtOf(op.dt)); observe(); }
          } else if (op.op === 'untilAudible'){
            const end = V.t + op.max;
            while (V.t < end && !primary()){ await frame(op.dt); observe(); }
            if (!primary()) ev.timedOut = true;
          } else if (op.op === 'untilBefore'){
            /* Run until the element that is playing is op.lead real ms (within three frames) before a count of its file. */
            const end = V.t + op.max;
            let hit = false;
            while (V.t < end){
              const a = primary(), list = a && op.times[a._file];
              if (list){
                let lo = 0, hi = list.length;
                while (lo < hi){ const m = (lo + hi) >> 1; if (list[m] <= a._ct) lo = m + 1; else hi = m; }
                const ms = lo < list.length ? (list[lo] - a._ct) / a.playbackRate * 1000 : Infinity;
                if (ms <= op.lead && ms > op.lead - 3 * op.dt){ hit = true; break; }
              }
              await frame(dtOf(op.dt)); observe();
            }
            if (!hit) ev.timedOut = true;
          } else if (op.op === 'untilSilent'){
            const end = V.t + op.max;
            const anyFile = function(){ for (let i = 0; i < V.els.length; i++) if (V.els[i]._attr) return true; return false; };
            while (V.t < end && anyFile()){ await frame(dtOf(op.dt)); observe(); }
            if (anyFile()) ev.timedOut = true;
            for (let k = 0; k < 5; k++){ await frame(op.dt); observe(); }
          } else throw new Error('unknown op ' + op.op);
          ev.state = snap(root); ev.t1 = V.t; ev.playing = !!pcState;
          R.events.push(ev);
          await null;
        }
      } catch (e) { fatal = String(e && e.message || e); }
      try { if (pcState) pcStop(); } catch (e) { V.errors.push('stop: ' + (e && e.message)); }
      V.on = false;
      audioCtx = ctxWas;
      /* A timer the site set during the walk and still wants (a toast, a debounce) goes back to the real clock. */
      V.timers.forEach(function(x){ real.st(function(){ try { x.fn.apply(window, x.args); } catch (e) {} }, Math.max(0, x.at - V.t)); });
      V.timers = []; V.rafs = [];
      const out = { fatal: fatal, runs: R.runs, keys: R.keys, events: R.events, frames: R.frames, errors: V.errors.slice(0, 20),
        clicks: V.clicks.map(function(c){ return { at: c.at, freq: c.freq, peak: c.peak, made: c.made, cancelled: c.cancelled }; }), starts: V.starts.slice(), end: V.t,
        connected: root.isConnected };
      R = null;
      return out;
    }
  };
  return true;
})()`;

/* ═══ THE EXPECTED ANSWER (Node; nothing below calls the site's code) ═════════════════════════════════════════ */
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const rootOf = (name) => { const m = /^[A-G][#b]?/.exec(String(name || '')); return m ? m[0] : '?'; };

/* R1-R3: the clock of one file. bars are counted from 0 at bar 1's downbeat. */
function clockOf(tr, meter, slow) {
  const scale = slow ? tr.trackBpm / tr.trackBpmSlow : 1;
  const bt = Array.isArray(tr.barTimes) && tr.barTimes.length > 1 ? tr.barTimes : null;
  const steady = meter.beats * 60 / tr.feltBpm;
  const line = (k) => {
    if (!bt) return tr.anchor + k * steady;
    const last = bt.length - 1;
    if (k < 0) return bt[0] + k * (bt[1] - bt[0]);
    if (k <= last) return bt[k];
    return bt[last] + (k - last) * (bt[last] - bt[0]) / last;
  };
  const time = (bars) => { const k = Math.floor(bars); return (line(k) + (bars - k) * (line(k + 1) - line(k))) * scale; };
  const bars = (t) => {
    const x = t / scale;
    if (!bt) return (x - tr.anchor) / steady;
    let lo = 0, hi = bt.length - 1;
    if (x < bt[0]) return (x - bt[0]) / (bt[1] - bt[0]);
    if (x >= bt[hi]) return hi + (x - bt[hi]) / ((bt[hi] - bt[0]) / hi);
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (bt[mid] <= x) lo = mid; else hi = mid; }
    return lo + (x - bt[lo]) / (bt[lo + 1] - bt[lo]);
  };
  return { time, bars, scale, mapped: bt ? bt.length : 0 };
}
function clockPin(tr) {
  const body = JSON.stringify([tr.anchor, tr.barTimes || null, tr.trackBpm, tr.trackBpmSlow, tr.feltBpm, tr.beatsPerBar, !!tr.countSix]);
  return createHash('sha1').update(body).digest('hex').slice(0, 12);
}
/* Which track and tier a file is. */
function fileIndex(tracks) {
  const idx = {};
  for (const [key, tr] of Object.entries(tracks)) {
    for (const [f, slow, full] of [['src', false, false], ['srcSlow', true, false], ['srcFull', false, true], ['srcFullSlow', true, true]]) {
      if (tr[f]) idx[tr[f]] = { key, slow, full };
    }
  }
  return idx;
}

/* R13: the view of a card. v = { rec, key, chord, bass } as names. */
function defaultView(a) {
  return {
    rec: a.recordingVersions ? (a.recordingStart || a.recording) : null,
    key: a.keyVersions ? (a.keyStart || a.key) : null,
    chord: a.chordVersions ? (a.chordStart === 'power' ? 'power' : 'full') : null,
    bass: a.bassNotes ? (a.bassStart === 'on' ? 'on' : 'off') : null,
  };
}
function viewLists(a) {
  return {
    rec: a.recordingVersions ? [a.recording, ...Object.keys(a.recordingVersions)] : [],
    key: a.keyVersions ? [a.key, ...Object.keys(a.keyVersions)] : [],
    chord: a.chordVersions ? ['full', 'power'] : [],
    bass: a.bassNotes ? ['off', 'on'] : [],
  };
}
function viewName(a, v) {
  const d = defaultView(a), bits = [];
  if (v.rec) bits.push(v.rec === a.recording ? (a.recordingLabel || v.rec) : (a.recordingVersions[v.rec].label || v.rec));
  if (v.key) bits.push('key of ' + v.key);
  if (v.chord) bits.push(v.chord === 'power' ? 'power chords' : 'full chords');
  if (v.bass) bits.push(v.bass === 'on' ? 'bass notes' : 'strum only');
  const same = ['rec', 'key', 'chord', 'bass'].every(k => v[k] === d[k]);
  return (bits.join(', ') || 'the card') + (same && bits.length ? ' (as it opens)' : '');
}
function viewOf(a, v) {
  let card = a.card, track = a.card.track;
  const rv = v.rec && v.rec !== a.recording ? a.recordingVersions[v.rec] : null;
  if (rv) { card = { ...card, ...rv.card }; track = rv.track; }
  const kv = v.key && v.key !== a.key ? a.keyVersions[v.key] : null;
  if (kv) track = kv.track;
  const map = rv ? null : kv ? (v.chord === 'power' ? kv.power : kv.full) : (v.chord === 'power' ? a.chordVersions.power : null);
  const sections = card.sections.map(s => ({ ...s, notes: s.notes.map(n => (map && Array.isArray(n.frets) && Object.prototype.hasOwnProperty.call(map, n.note)) ? { ...n, note: map[n.note].note, frets: map[n.note].frets } : n) }));
  return { id: a.id, title: a.title, track, card: { ...card, sections }, bass: v.bass === 'on', bassMap: v.bass === 'on' ? a.bassNotes : null, v };
}
/* R5-R8: the chart of a view. */
function buildChart(view, meter) {
  const c = view.card, problems = [];
  const secs = c.sections.map((s, i) => {
    let p = 0;
    const notes = s.notes.map(n => {
      const len = n.beats > 0 ? n.beats : 1;
      const frets = {};
      if (Array.isArray(n.frets)) n.frets.forEach(([st, f]) => { frets[st] = String(f); });
      else if (n.string != null) frets[n.string] = String(n.fret);
      const o = { start: p, len, name: n.rest ? '' : String(n.note), rest: !!n.rest, frets };
      p += len;
      return o;
    });
    if (!(s.fromBar >= 1) || !(s.bars >= 1)) problems.push(`section ${i + 1} (${s.label}) has no fromBar or bars`);
    const sec = { i, label: s.label, fromBar: s.fromBar, bars: s.bars, reps: s.reps >= 1 ? s.reps : 1, notes, total: p, grid: !!(c.chordGrid && s.chordGrid !== false) };
    if (!near(p, sec.bars * meter.beats, 1e-6)) problems.push(`${s.label}: its notes add up to ${+p.toFixed(4)} beats, but ${sec.bars} bars of ${meter.beats} are ${sec.bars * meter.beats}`);
    /* R7: the chords of a grid, one per change (or one per strum with everyStrum); a rest is its own event. */
    const evs = [];
    notes.forEach((n, ni) => {
      const prev = evs[evs.length - 1];
      if (n.rest) { if (prev && prev.rest) prev.len += n.len; else evs.push({ rest: true, name: '', start: n.start, len: n.len, ni, frets: {} }); }
      else if (!c.everyStrum && prev && !prev.rest && prev.name === n.name) prev.len += n.len;
      else evs.push({ rest: false, name: n.name, start: n.start, len: n.len, ni, frets: n.frets });
    });
    sec.events = evs;
    return sec;
  });
  for (let i = 1; i < secs.length; i++) {
    const want = secs[i - 1].fromBar + secs[i - 1].bars * secs[i - 1].reps;
    if (secs[i].fromBar !== want) problems.push(`${secs[i].label} starts at bar ${secs[i].fromBar}, but ${secs[i - 1].label} ends before bar ${want}: the tool has no rule for a gap or an overlap`);
  }
  const firstBar = secs[0].fromBar, last = secs[secs.length - 1], endBar = last.fromBar + last.bars * last.reps;
  /* Where a moment (bars from bar 1's downbeat) falls. null outside the card. */
  const place = (songBars) => {
    const b1 = songBars + 1;
    if (b1 < firstBar - 1e-12 || b1 >= endBar) return null;
    let S = secs[secs.length - 1];
    for (const s of secs) { if (b1 < s.fromBar + s.bars * s.reps) { S = s; break; } }
    const pass = S.bars * meter.beats;
    const beatIn = Math.max(0, (b1 - S.fromBar) * meter.beats);
    const rep = Math.min(S.reps - 1, Math.floor(beatIn / pass));
    const local = beatIn - rep * pass;
    let ni = S.notes.findIndex(n => local < n.start + n.len - 1e-9);
    if (ni < 0) ni = S.notes.length - 1;
    const step = Math.min(Math.round(pass * meter.sub) - 1, Math.floor(local * meter.sub + 1e-9));
    const at = S.grid ? step : c.sheet ? Math.floor(local + 1e-9) : ni;
    return { si: S.i, rep, local, ni, step, at, key: S.i + ':' + rep + ':' + at, grid: S.grid };
  };
  /* R12: which chord name of the sheet each note is. */
  let tok = null, changes = null;
  if (c.sheet) {
    tok = []; changes = [];
    let n = -1, prev = null;
    const again = Array.isArray(c.sheetNamedAgain) ? c.sheetNamedAgain : [];
    secs.forEach(S => {
      tok[S.i] = [];
      for (let r = 0; r < S.reps; r++) {
        tok[S.i][r] = S.notes.map((nt, ni) => {
          if (!nt.rest && (nt.name !== prev || (ni === 0 && again.includes(S.label)))) { n++; prev = nt.name; changes.push({ si: S.i, rep: r, name: nt.name }); }
          return n;
        });
      }
    });
  }
  return { secs, firstBar, endBar, totalBars: endBar - firstBar, place, problems, tok, changes, wholeSong: !!c.wholeSong, sheet: !!c.sheet, counts: !!c.counts, everyStrum: !!c.everyStrum, restWord: c.restWord !== false };
}

/* R14: the bass note a chord-grid column must carry, or null. Only beat 1 of a bar; only a grid section; never in a
   rest. k = bars since the chord's first bar (the first bar whose beat 1 falls inside the chord): even k the root, odd
   k the 5th. Where the chord itself starts on that beat, its own fret on the bass string is the note (marked, not
   drawn twice); otherwise the fret in bassNotes is drawn. Keyed by the chord name the view SHOWS. */
function bassAt(S, view, meter, posBeats) {
  if (!view.bassMap || !S.grid) return null;
  const bar = posBeats / meter.beats;
  if (!near(bar, Math.round(bar), 1e-9)) return null;
  const ev = S.events.find(e => !e.rest && e.start <= posBeats + 1e-9 && posBeats < e.start + e.len - 1e-9);
  const b = ev && view.bassMap[ev.name];
  if (!b) return null;
  const k = Math.round(bar) - Math.ceil(ev.start / meter.beats - 1e-9);
  const pick = k % 2 ? b.fifth : b.root;
  const own = near(ev.start, posBeats, 1e-9) && ev.frets[pick[0]] != null;
  return { str: String(pick[0]), fret: own ? ev.frets[pick[0]] : String(pick[1]), own, which: k % 2 ? 'the 5th' : 'the root', chord: ev.name };
}
/* The drawing against the chart (R7, R8, R14). Returns the lookup the walk needs: for each page, the (row, column)
   of each cursor step, in reading order as drawn. */
function checkDrawing(chart, scan, meter, view) {
  const issues = [], tables = [];
  if (scan.pages.length !== chart.secs.length) { issues.push(`the card shows ${scan.pages.length} pages for ${chart.secs.length} sections`); return { issues, tables }; }
  let bassMarks = 0, bassWant = 0;
  const same = (x, y) => x.length === y.length && x.every(v => y.includes(v));
  chart.secs.forEach(S => {
    const pg = scan.pages[S.i], where = `${S.label}`;
    const flat = [];
    (pg.off || []).slice(0, 3).forEach(o => issues.push(`${where}: drawn off its column: ${o}`));
    pg.rows.forEach((row, ri) => { if (row.bad) { issues.push(`${where}: ${row.bad}`); return; } row.cols.forEach((col, c) => { if (!col.pad) flat.push({ ri, c, col, first: false }); }); });
    pg.rows.forEach((row, ri) => { const f = flat.find(x => x.ri === ri); if (f) f.first = true; });
    const table = { steps: [], rowOf: [] };
    if (S.grid) {
      if (pg.rows.some(r => !r.bad && !r.grid)) issues.push(`${where}: a chord-grid section drawn as a note-by-note tab`);
      const want = Math.round(S.bars * meter.beats * meter.cols);
      if (flat.length !== want) { issues.push(`${where}: ${flat.length} columns drawn, ${S.bars} bars need ${want}`); tables[S.i] = table; return; }
      const startCol = new Map();
      S.events.forEach(ev => { const x = ev.start * meter.cols, c = Math.round(x); if (!near(x, c, 1e-6)) issues.push(`${where}: ${ev.name || 'a rest'} starts at beat ${+(ev.start + 1).toFixed(3)}, which is not on a column of this grid`); startCol.set(c, ev); });
      const sounding = (c) => { const b = c / meter.cols; return S.events.find(ev => ev.start <= b + 1e-9 && b < ev.start + ev.len - 1e-9); };
      flat.forEach((f, k) => {
        const col = f.col, inBar = k % (meter.beats * meter.cols);
        const wantCount = meter.cols === 3 ? String(inBar + 1) : (inBar % 2 === 0 ? String(inBar / 2 + 1) : '+');
        const bar = Math.floor(k / (meter.beats * meter.cols)) + 1, at = `${where} bar ${bar}, column "${wantCount}"`;
        if (col.count !== wantCount) issues.push(`${at}: the count under it reads "${col.count == null ? '(none)' : col.count}"`);
        if (wantCount !== '+') { table.steps.push(f.ri + ':' + f.c); table.rowOf.push(f.ri); }
        const ev = startCol.get(k), chords = col.names.filter(n => n[0] === 'chord'), helds = col.names.filter(n => n[0] === 'held'), rests = col.names.filter(n => n[0] === 'rest');
        const bs = inBar === 0 ? bassAt(S, view, meter, k / meter.cols) : null;
        if (bs) bassWant++;
        const drawnOnly = bs && !bs.own ? [bs.str] : [];
        if (ev && !ev.rest) {
          if (chords.length !== 1 || chords[0][1] !== ev.name) issues.push(`${at}: the chart starts ${ev.name} here, the page shows ${chords.length ? chords.map(n => n[1]).join(' and ') : 'no chord name'}`);
          for (const [st, fr] of Object.entries(ev.frets)) if (col.frets[st] !== fr) issues.push(`${at}: ${ev.name} has fret ${fr} on the ${st} string, the page shows ${col.frets[st] == null ? 'nothing' : col.frets[st]}`);
          const extra = Object.keys(col.frets).filter(st => !(st in ev.frets));
          if (!same(extra, drawnOnly)) issues.push(`${at}: frets drawn on strings ${ev.name} does not use: ${extra.join(', ') || 'none'}${drawnOnly.length ? '; the bass note belongs on the ' + drawnOnly[0] + ' string' : ''}`);
        } else {
          if (chords.length) issues.push(`${at}: the page shows ${chords.map(n => n[1]).join(' and ')} starting here, the chart starts no chord here`);
          const drawn = Object.keys(col.frets);
          if (!same(drawn, drawnOnly)) issues.push(`${at}: fret numbers drawn on ${drawn.join(', ') || 'no string'} where no chord starts${drawnOnly.length ? '; the bass note belongs on the ' + drawnOnly[0] + ' string' : ''}`);
        }
        /* R14: exactly the bass note the rule gives, on its string and fret, marked as bass; no mark anywhere else. */
        if (!same(col.bassOn, bs ? [bs.str] : [])) issues.push(`${at}: ${bs ? `the bass note is ${bs.which} of ${bs.chord}, the ${bs.str} string` : 'no bass note belongs here'}; the page marks ${col.bassOn.length ? 'the ' + col.bassOn.join(' and ') + ' string' : 'none'} as bass`);
        else if (bs && col.frets[bs.str] !== bs.fret) issues.push(`${at}: the bass note (${bs.which} of ${bs.chord}) is fret ${bs.fret} on the ${bs.str} string, the page shows ${col.frets[bs.str] == null ? 'nothing' : col.frets[bs.str]}`);
        if (ev && ev.rest && chart.restWord && rests.length !== 1) issues.push(`${at}: a rest starts here and the page shows ${rests.length} rest words`);
        if (!(ev && ev.rest) && rests.length) { const s = sounding(k); if (!(f.first && s && s.rest && chart.restWord)) issues.push(`${at}: a rest word where no rest starts`); }
        if (helds.length) { const s = sounding(k); if (!f.first || !s || s.rest || s.name !== helds[0][1] || startCol.has(k)) issues.push(`${at}: "(${helds[0][1]})" is shown, but that is not a chord still ringing at the start of a row`); }
        if (f.first && k > 0 && !startCol.has(k)) { const s = sounding(k); if (s && !s.rest && !helds.length) issues.push(`${at}: the row begins inside ${s.name} and does not repeat its name`); if (s && s.rest && chart.restWord && !rests.length) issues.push(`${at}: the row begins inside a rest and does not say so`); }
        bassMarks += col.bass || 0;
      });
    } else {
      if (pg.rows.some(r => !r.bad && r.grid)) issues.push(`${where}: a note-by-note section drawn as a chord grid`);
      const noteCols = flat.filter(f => f.col.names.some(n => n[0] === 'note' || n[0] === 'rest'));
      if (noteCols.length !== S.notes.length) { issues.push(`${where}: ${noteCols.length} notes drawn, the chart has ${S.notes.length}`); tables[S.i] = table; return; }
      noteCols.forEach((f, ni) => {
        const n = S.notes[ni], col = f.col, at = `${where} note ${ni + 1}`;
        table.steps.push(f.ri + ':' + f.c); table.rowOf.push(f.ri);
        const nm = col.names.find(x => x[0] === 'note' || x[0] === 'rest');
        if (n.rest ? nm[0] !== 'rest' : (nm[0] !== 'note' || nm[1] !== n.name)) issues.push(`${at}: the chart says ${n.rest ? 'a rest' : n.name}, the page shows ${nm[0] === 'rest' ? 'a rest' : nm[1]}`);
        for (const [st, fr] of Object.entries(n.frets)) if (col.frets[st] !== fr) issues.push(`${at} (${n.name}): fret ${fr} on the ${st} string in the chart, the page shows ${col.frets[st] == null ? 'nothing' : col.frets[st]}`);
        if (Object.keys(col.frets).some(st => !(st in n.frets))) issues.push(`${at} (${n.name}): a fret drawn on a string the chart does not play`);
        if (col.bass) issues.push(`${at}: a bass note is marked in a note-by-note section (bass notes are for chord grids only)`);
        if (chart.counts && col.count == null) issues.push(`${at}: the card has a count row and this note has no count under it`);
        if (chart.counts && col.count != null) {
          const inBar = ((n.start % meter.beats) + meter.beats) % meter.beats;
          const want = near(inBar, Math.round(inBar), 1e-6) ? String((Math.round(inBar) % meter.beats) + 1) : near(inBar * 2, Math.round(inBar * 2), 1e-6) ? '+' : '';
          if (col.count !== want) issues.push(`${at}: starts on count "${want}", the count row reads "${col.count}"`);
        }
      });
    }
    tables[S.i] = table;
  });
  if (view.bass && !bassWant) issues.push('bass notes are on and the rule gives none: no chord of this view is in bassNotes');
  if (!view.bass && bassMarks) issues.push(`bass notes are off and ${bassMarks} are drawn`);
  return { issues, tables, bassMarks, bassWant };
}

/* ═══ THE WALKS ═══════════════════════════════════════════════════════════════════════════════════════════════ */
const STOPS = ['slowest', 'slower', 'slow', 'normal'];
function tierOf(M, stop, guitar) {
  const tr = M.tr, slow = stop === 'slowest' || stop === 'slower';
  const full = !!(guitar && tr.srcFull && tr.srcFullSlow);
  const file = full ? (slow ? tr.srcFullSlow : tr.srcFull) : (slow ? tr.srcSlow : tr.src);
  const rate = stop === 'slowest' ? M.consts.slowestRate : stop === 'slow' ? (1 + tr.trackBpmSlow / tr.trackBpm) / 2 : 1;
  return { slow, full, file, rate, clock: clockOf(tr, M.meter, slow) };
}
/* Real milliseconds a stretch of the song takes at a setting. */
function msFor(M, stop, fromBar0, toBar0) { const T = tierOf(M, stop, false); return (T.clock.time(toBar0) - T.clock.time(fromBar0)) / T.rate * 1000; }
function countInMs(M, stop) { const T = tierOf(M, stop, false), ch = M.chart; return 100 + (T.clock.time(ch.endBar - 1) - T.clock.time(ch.firstBar - 1)) / ch.totalBars / T.rate * 1000 + 200; }

function planWalks(M) {
  const ch = M.chart, tr = M.tr, hasFull = !!(tr.srcFull && tr.srcFullSlow), walks = [];
  const lastSec = ch.secs[ch.secs.length - 1];
  const stops = M.open.hasSlider ? STOPS : ['slower', 'normal'];
  const twoBars = (stop) => msFor(M, stop, ch.firstBar - 1, ch.firstBar + 1);
  /* Where the song is (bars from bar 1's downbeat) `ms` real milliseconds after `pos0`, at a setting. */
  const barsAfter = (stop, pos0, ms) => { const T = tierOf(M, stop, false); return T.clock.bars(T.clock.time(pos0) + ms / 1000 * T.rate); };
  /* The places a stretch after a switch must light: from a quarter of a bar after the switch (the file load and the
     lead) to a quarter of a bar before the next one, inside the card. */
  const coverAfter = (from, to) => { const a = from + 0.25, b = Math.min(to - 0.25, ch.endBar - 1 - 0.05); return b > a ? { from: a, to: b } : null; };
  const setup = (stop, guitar, metro, counts) => {
    const ops = [{ op: 'speed', i: STOPS.indexOf(stop) }];
    if (hasFull) ops.push({ op: 'click', sel: '.pc-guitar:not(.pc-counts)', attr: 'aria-checked', want: guitar ? 'true' : 'false' });
    ops.push({ op: 'click', sel: '.pc-metro', attr: 'aria-pressed', want: metro ? 'true' : 'false' });
    if (M.open.hasCounts && counts != null) ops.push({ op: 'click', sel: '.pc-counts', attr: 'aria-checked', want: counts ? 'true' : 'false', counts });
    return ops;
  };
  const startOp = (si) => (ch.secs.length > 1 && si != null ? { op: 'click', sel: '.pc-sec', i: si, start: { si, rep: 0 } } : { op: 'click', sel: '.pc-play', start: { si: 0, rep: 0 } });
  const song = (stop, guitar, extra = {}) => {
    const ops = setup(stop, guitar, true, extra.counts);
    ops.push({ op: 'click', sel: '.pc-play', start: { si: 0, rep: 0 } }, { op: 'untilAudible', max: 60000, dt: FINE_MS });
    const whole = msFor(M, stop, ch.firstBar - 1, ch.endBar - 1);
    if (ch.wholeSong) ops.push({ op: 'untilSilent', max: whole + 8000, dt: STEP_MS });
    else ops.push({ op: 'run', ms: whole + twoBars(stop), dt: STEP_MS }, { op: 'click', sel: '.pc-play', stop: true });
    return { kind: 'song', name: `song · ${stop}${hasFull ? ' · guitar ' + (guitar ? 'on' : 'off') : ''}${extra.counts != null ? ' · counts ' + (extra.counts ? 'on' : 'off') : ''}`, stop, guitar, ops, span: 'all', metro: true, ...extra };
  };
  if (M.isBase) {
    for (const stop of stops) for (const g of (hasFull ? [true, false] : [false])) walks.push(song(stop, g));
    if (M.open.hasCounts) walks.push(song('slower', hasFull, { counts: true }), song('normal', hasFull, { counts: false }));
  } else {
    /* Every other view: the slowest stop it has, Slower and Normal. */
    walks.push(song(stops[0], hasFull), ...(stops[0] === 'slower' ? [] : [song('slower', hasFull)]), song('normal', hasFull));
  }
  /* Every section button, the speed changing from one to the next: the count-in, then the section's first bar. In every view. */
  {
    const ops = setup('slower', hasFull, false, null);
    ch.secs.forEach((S, si) => {
      const stop = stops[si % stops.length];
      ops.push({ op: 'speed', i: STOPS.indexOf(stop), stopName: stop });
      ops.push(ch.secs.length > 1 ? { op: 'click', sel: '.pc-sec', i: si, start: { si, rep: 0 }, stopName: stop } : { op: 'click', sel: '.pc-play', start: { si: 0, rep: 0 }, stopName: stop });
      ops.push({ op: 'untilAudible', max: 60000, dt: FINE_MS }, { op: 'run', ms: msFor(M, stop, S.fromBar - 1, S.fromBar), dt: FINE_MS, cover: { si, rep: 0, bars: 1 } });
    });
    ops.push({ op: 'click', sel: '.pc-play', stop: true });
    walks.push({ kind: 'starts', name: `starts · every section button (${ch.secs.length})`, stop: 'slower', guitar: hasFull, ops, span: 'cover', metro: false, fresh: true });
  }
  /* The Guitar switch in the middle of a section, twice: the first press loads the other file, the second finds
     the twin already playing. At every stop of the slider (Slowest and Slow play their file at another rate). After
     each press the next bar and a half must light, place by place. */
  if (hasFull && (M.isBase || M.recAlt)) for (const stop of (M.isBase ? stops : ['slower'])) {
    const si = Math.min(1, ch.secs.length - 1), S = ch.secs[si], bar = msFor(M, stop, S.fromBar - 1, S.fromBar);
    const ops = setup(stop, true, false, null);
    let pos = barsAfter(stop, S.fromBar - 1, bar * 1.4);
    ops.push(startOp(si), { op: 'untilAudible', max: 60000, dt: FINE_MS }, { op: 'run', ms: bar * 1.4, dt: FINE_MS });
    for (const g of [false, true]) {
      const ms = bar * 1.5 + 60, next = barsAfter(stop, pos, ms - 60);
      ops.push({ op: 'click', sel: '.pc-guitar:not(.pc-counts)', sw: 'guitar', guitar: g }, { op: 'run', ms, dt: FINE_MS, cover: coverAfter(pos, next) });
      pos = next;
    }
    ops.push({ op: 'click', sel: '.pc-play', stop: true });
    walks.push({ kind: 'guitar', name: `guitar switch mid-section · ${stop}`, stop, guitar: true, ops, span: 'cover', metro: false, fresh: true });
  }
  /* The speed slider moved while the song plays: every stop, and back. */
  if (M.isBase && M.open.hasSlider) {
    const si = Math.min(1, ch.secs.length - 1), S = ch.secs[si], bar = msFor(M, 'slower', S.fromBar - 1, S.fromBar);
    const ops = setup('slower', hasFull, false, null);
    let pos = barsAfter('slower', S.fromBar - 1, bar * 1.3);
    ops.push(startOp(si), { op: 'untilAudible', max: 60000, dt: FINE_MS }, { op: 'run', ms: bar * 1.3, dt: FINE_MS });
    for (const stop of ['slowest', 'slow', 'normal', 'slower']) {
      const ms = bar * 1.2 + 60, next = barsAfter(stop, pos, ms - 60);
      ops.push({ op: 'speed', i: STOPS.indexOf(stop), sw: 'speed', stopName: stop }, { op: 'run', ms, dt: FINE_MS, cover: coverAfter(pos, next) });
      pos = next;
    }
    ops.push({ op: 'click', sel: '.pc-play', stop: true });
    walks.push({ kind: 'speed', name: 'speed slider moved mid-song · every stop', stop: 'slower', guitar: hasFull, ops, span: 'cover', metro: false, fresh: true });
  }
  /* The switches again with the Metronome ON: every count the song passes must get one click, none doubled, around
     every switch. */
  if (M.isBase && (hasFull || M.open.hasSlider)) {
    const si = Math.min(1, ch.secs.length - 1), S = ch.secs[si], bar = msFor(M, 'slower', S.fromBar - 1, S.fromBar);
    const ops = setup('slower', hasFull, true, null);
    let pos = barsAfter('slower', S.fromBar - 1, bar * 1.3), stop = 'slower';
    ops.push(startOp(si), { op: 'untilAudible', max: 60000, dt: FINE_MS }, { op: 'run', ms: bar * 1.3, dt: FINE_MS });
    const seq = [];
    if (hasFull) seq.push({ sw: 'guitar', guitar: false });
    if (M.open.hasSlider) seq.push({ sw: 'speed', stop: 'slow' });
    if (hasFull) seq.push({ sw: 'guitar', guitar: true });
    if (M.open.hasSlider) seq.push({ sw: 'speed', stop: 'slowest' }, { sw: 'speed', stop: 'slower' });
    for (const x of seq) {
      if (x.sw === 'speed') stop = x.stop;
      const ms = bar * 1.2 + 60, next = barsAfter(stop, pos, ms - 60);
      ops.push(x.sw === 'guitar' ? { op: 'click', sel: '.pc-guitar:not(.pc-counts)', sw: 'guitar', guitar: x.guitar } : { op: 'speed', i: STOPS.indexOf(x.stop), sw: 'speed', stopName: x.stop },
        { op: 'run', ms, dt: FINE_MS, cover: coverAfter(pos, next) });
      pos = next;
    }
    ops.push({ op: 'click', sel: '.pc-play', stop: true });
    walks.push({ kind: 'switchMetro', name: `switches with the Metronome on (${seq.length})`, stop: 'slower', guitar: hasFull, ops, span: 'cover', metro: true, fresh: true });
  }
  /* A queued click at the worst moment: the page queues each in-song click up to 0.1 s before its count and it
     sounds the page's latency after it, so a control pressed just before a count meets a click already queued. With
     the Metronome on: (where the track has the Guitar file) the Guitar switch pressed once to load the other file,
     then pressed again AQUEUE ms before a count, when the twin is playing in step (the swap); then Stop pressed
     AQUEUE ms before a count, and the clock run on so a click left queued after Stop is heard. The press is aimed
     from the element that is playing (op untilBefore: the counts of every file of the track, on the tool's own
     clock), and the judge checks that each press met a queued click. */
  if (M.isBase) {
    const AQUEUE = 40;
    const si = Math.min(1, ch.secs.length - 1), S = ch.secs[si], bar = msFor(M, 'slower', S.fromBar - 1, S.fromBar);
    const times = {};
    for (const [f, fi] of Object.entries(M.files)) {
      if (fi.key !== M.view.track) continue;
      const c = clockOf(M.tr, M.meter, fi.slow), list = [];
      for (let n = (ch.firstBar - 1) * M.meter.steps; n < (ch.endBar - 1) * M.meter.steps; n++) list.push(c.time(n / M.meter.steps));
      times[f] = list;
    }
    const aim = { op: 'untilBefore', times, lead: AQUEUE, max: 20000, dt: FINE_MS };
    const ops = setup('slower', hasFull, true, null);
    ops.push(startOp(si), { op: 'untilAudible', max: 60000, dt: FINE_MS }, { op: 'run', ms: bar * 1.3, dt: FINE_MS });
    if (hasFull) ops.push({ op: 'click', sel: '.pc-guitar:not(.pc-counts)', sw: 'guitar', guitar: false }, { op: 'run', ms: bar, dt: FINE_MS },
      aim, { op: 'click', sel: '.pc-guitar:not(.pc-counts)', sw: 'guitar', guitar: true, aimed: true }, { op: 'run', ms: bar * 0.6, dt: FINE_MS });
    ops.push(aim, { op: 'click', sel: '.pc-play', stop: true, aimed: true }, { op: 'run', ms: 400, dt: FINE_MS });
    walks.push({ kind: 'queued', name: `a control pressed ${AQUEUE} ms before a count, Metronome on (${hasFull ? 'the Guitar swap, then Stop' : 'Stop'})`, stop: 'slower', guitar: hasFull, ops, span: 'cover', metro: true, fresh: true });
  }
  /* The lap, from the last section, with the spare ready and with a spare that never loads (the old seek); and once
     from a section in the MIDDLE of the card, which must come back to that section, not to the first. */
  if (!ch.wholeSong && M.isBase) for (const stop of ['slower', 'normal']) for (const spare of [true, false]) {
    const si = ch.secs.length - 1, len = msFor(M, stop, lastSec.fromBar - 1, ch.endBar - 1);
    const ops = setup(stop, false, true, null);
    ops.push(startOp(si), { op: 'untilAudible', max: 60000, dt: FINE_MS }, { op: 'run', ms: len * 2 + msFor(M, stop, lastSec.fromBar - 1, lastSec.fromBar) * 0.75, dt: FINE_MS }, { op: 'click', sel: '.pc-play', stop: true });
    walks.push({ kind: 'lap', name: `lap · ${stop} · ${spare ? 'the spare ready' : 'no spare (the seek)'}`, stop, guitar: false, ops, span: 'lap', lapFrom: si, laps: 2, lateNeverLoad: !spare, metro: true, fresh: true });
  }
  if (!ch.wholeSong && M.isBase && ch.secs.length >= 3) {
    const si = Math.floor((ch.secs.length - 1) / 2), S = ch.secs[si];
    const ops = setup('slower', false, true, null);
    ops.push(startOp(si), { op: 'untilAudible', max: 60000, dt: FINE_MS }, { op: 'run', ms: msFor(M, 'slower', S.fromBar - 1, ch.endBar - 1) + msFor(M, 'slower', S.fromBar - 1, S.fromBar) * 1.5, dt: STEP_MS }, { op: 'click', sel: '.pc-play', stop: true });
    walks.push({ kind: 'lap', name: `lap · from ${S.label} (section ${si + 1} of ${ch.secs.length}) · slower`, stop: 'slower', guitar: false, ops, span: 'lap', lapFrom: si, laps: 1, metro: true, fresh: true });
  }
  /* A lyric sheet started from a line: a tap on a chord name starts that lap of its section, whether it is the
     first chord of the lap or one in the middle of a line. */
  if (ch.sheet && M.isBase) {
    const firsts = [], mids = [];
    ch.changes.forEach((c, i) => { if (!i || ch.changes[i - 1].si !== c.si || ch.changes[i - 1].rep !== c.rep) firsts.push(i); else mids.push(i); });
    const pick = [...new Set([0, 1, 2, 3, 4, 5, 6, 7].map(k => firsts[Math.floor(k * (firsts.length - 1) / 7)]))];
    if (mids.length) pick.push(...new Set([0, 1, 2].map(k => mids[Math.floor((k + 0.5) * mids.length / 3)])));
    const ops = setup('slower', hasFull, false, null);
    for (const ti of pick) {
      const c = ch.changes[ti], S = ch.secs[c.si];
      ops.push({ op: 'click', sel: '.pc-sheet-hit', i: ti, start: { si: c.si, rep: c.rep } }, { op: 'untilAudible', max: 60000, dt: FINE_MS },
        { op: 'run', ms: msFor(M, 'slower', S.fromBar - 1 + c.rep * S.bars, S.fromBar + c.rep * S.bars), dt: FINE_MS, cover: { si: c.si, rep: c.rep, bars: 1 } });
    }
    ops.push({ op: 'click', sel: '.pc-play', stop: true });
    walks.push({ kind: 'lines', name: `starts · ${pick.length} chord names of the sheet (${pick.length - firsts.filter(i => pick.includes(i)).length} in the middle of a line)`, stop: 'slower', guitar: hasFull, ops, span: 'cover', metro: false, fresh: true });
  }
  return walks;
}

function parseKey(k) {
  const [a, lit, ...rest] = k.split('#');
  const aud = a ? a.split('&').map(x => { const i = x.lastIndexOf('@'); return { file: x.slice(0, i), rate: Number(x.slice(i + 1)) }; }) : [];
  return { aud, lit, misc: rest.join('#') };
}

/* R11's floor: a click's peak gain below this is not heard over a band (the page's quietest click, a count-in beat, is
   0.208; the plainest in-song click 0.13 x the play-along gain). The in-song click of a pitch may not be quieter than
   half the count-in click of the same pitch: the page makes the count-in "a little louder" (pcClick), never twice. */
const CLICK_FLOOR = 0.05, CLICK_VS_COUNTIN = 0.5;
/* A switch has to bring the song back within the fake load time plus this (real ms). */
const SILENCE_MARGIN_MS = 40;

function judge(M, W, res) {
  const ch = M.chart, meter = M.meter, C = M.consts, issues = [];
  let nIssues = 0, nQueued = 0;
  const known = [];
  /* KNOWN: a mismatch of a listed kind in a listed (card, section) is collected here, by place, and compared with the
     entry's exact list for this walk at the end. */
  const wk = M.viewLabel + ' · ' + W.name;
  const gotKnown = new Map();
  const bad = (msg, kind, si, details) => {
    const K = kind && si != null ? KNOWN.find(x => x.card === M.view.id && x.section && x.section === ch.secs[si].label && x.kinds.includes(kind)) : null;
    if (K) {
      if (!gotKnown.has(K)) gotKnown.set(K, {});
      const g = gotKnown.get(K); (g[kind] = g[kind] || new Set());
      (details || []).forEach(d => g[kind].add(d));
      return;
    }
    if (issues[issues.length - 1] === msg) return;
    nIssues++;
    if (issues.length < (VERBOSE ? 400 : 6)) issues.push(msg);
  };
  const stats = { frames: res.frames, steps: 0, clicks: 0 };
  if (res.fatal) { bad('the walk could not run: ' + res.fatal); return { issues, nIssues, stats, known }; }
  (res.errors || []).forEach(e => bad('the page threw: ' + e));
  if (!res.connected) bad('the card was redrawn in the middle of the walk');
  const files = M.files, keys = res.keys.map(parseKey), R = res.runs, nRuns = R.length / 8;
  const clocks = new Map();
  const clk = (f) => { if (!clocks.has(f)) { const fi = files[f]; clocks.set(f, fi ? { fi, clock: clockOf(M.tracks[fi.key], M.meterOf(fi.key), fi.slow) } : null); } return clocks.get(f); };
  const placeName = (p) => { const S = ch.secs[p.si]; return `${S.reps > 1 ? 'lap ' + (p.rep + 1) + ', ' : ''}${S.grid ? 'step ' : ch.sheet ? 'beat ' : 'note '}${p.at + 1}`; };
  const secName = (p) => { const S = ch.secs[p.si]; return `${S.label}${S.reps > 1 ? ' lap ' + (p.rep + 1) : ''}, ${S.grid ? (meter.sub === 3 ? 'count ' : 'beat ') + ((p.step % meter.steps) + 1) + ' of bar ' + (Math.floor(p.step / meter.steps) + 1) : ch.sheet ? 'beat ' + (p.at % meter.beats + 1) + ' of bar ' + (Math.floor(p.at / meter.beats) + 1) + ' (' + (S.notes[p.ni].rest ? 'rest' : S.notes[p.ni].name) + ')' : 'note ' + (p.ni + 1) + ' (' + (S.notes[p.ni].rest ? 'rest' : S.notes[p.ni].name) + ')'}`; };
  const idx = (p) => (p.grid ? p.step : p.ni);
  const cellOf = (p) => (M.tables[p.si] && M.tables[p.si].steps[idx(p)] != null) ? p.si + ':' + M.tables[p.si].steps[idx(p)] : null;
  const rowOf = (p) => p.si + ':' + (M.tables[p.si] ? M.tables[p.si].rowOf[idx(p)] : '?');
  const lead0 = ch.sheet ? C.sheetLead : C.tabLead;
  /* What may be lit when file f is at time ct, playing at rate r (R9). */
  const expectAt = (f, ct, r) => {
    const c = clk(f);
    if (!c) return null;
    const here = ch.place(c.clock.bars(ct + lead0 * r));
    if (ch.sheet || !here) return here;
    const ahead = ch.place(c.clock.bars(ct + (lead0 + C.rowLead) * r));
    return (ahead && ahead.key !== here.key && rowOf(ahead) !== rowOf(here)) ? ahead : here;
  };
  const D = 2e-6;
  const expectSet = (f, ct, r) => [expectAt(f, ct, r), expectAt(f, ct - D, r), expectAt(f, ct + D, r)];

  /* What each walk should have lit, at least once. */
  const want = new Set(), seen = new Set();
  const addSpan = (si, rep, bars) => { const S = ch.secs[si]; const n = S.grid ? Math.round(bars * meter.steps) : ch.sheet ? Math.round(bars * meter.beats) : S.notes.filter(x => x.start < bars * meter.beats - 1e-9).length; for (let k = 0; k < n; k++) want.add(si + ':' + rep + ':' + k); };
  /* A stretch of the song (bars from bar 1's downbeat): every place it passes through, sampled every 1/96 bar. */
  const addRange = (from, to) => { for (let b = from; b <= to + 1e-9; b += 1 / 96) { const p = ch.place(Math.min(b, to)); if (p) want.add(p.key); } };
  if (W.span === 'all') ch.secs.forEach(S => { for (let r = 0; r < S.reps; r++) addSpan(S.i, r, S.bars); });
  if (W.span === 'lap') { const S = ch.secs[W.lapFrom]; for (let r = 0; r < S.reps; r++) addSpan(S.i, r, S.bars); }
  if (W.span === 'cover') W.ops.forEach(o => { if (o.cover && o.cover.si != null) addSpan(o.cover.si, o.cover.rep, o.cover.bars); else if (o.cover) addRange(o.cover.from, o.cover.to); });

  const evAt = new Map();
  res.events.forEach(e => { const o = W.ops[e.i]; if (!evAt.has(e.run)) evAt.set(e.run, []); evAt.get(e.run).push({ e, o }); });
  res.events.forEach(e => { if (e.timedOut) bad(`${W.ops[e.i].op === 'untilAudible' ? 'no file started playing' : W.ops[e.i].op === 'untilBefore' ? 'the song never came ' + W.ops[e.i].lead + ' ms before a count' : 'the song never stopped'} (step ${e.i + 1} of the walk)`); });
  let phase = 'idle', lastLit = '', lastAud = null, pendStart = null, pendSwitch = null, laps = 0, expStop = W.stop, expGuitar = W.guitar;
  let pendLoopFrom = 0, lastPlaceKey = null, order = -1, silentFrom = null, saidSilent = false, lapBlankRun = -1;
  const loadMs = W.loadMs || 40;
  const orderOf = (p) => { let n = 0; for (let i = 0; i < p.si; i++) n += ch.secs[i].reps * 1e6; return n + p.rep * 1e6 + p.at; };
  const litEmpty = (k) => k.lit === '';
  const starts = [];
  /* A Guitar or speed switch must have brought the song back before the next control is used. */
  const switchUnresolved = (why) => { if (pendSwitch) { bad(`the ${pendSwitch.kind} switch ${(pendSwitch.t / 1000).toFixed(2)} s into the walk never brought the song back (${why})`); pendSwitch = null; } };
  const onEvent = ({ e, o }) => {
    if (o.op === 'click' || o.op === 'speed') switchUnresolved('the next control was used with the song still silent');
    if (o.op === 'speed' && o.stopName) expStop = o.stopName;
    if (o.op === 'speed' && !o.stopName) expStop = STOPS[o.i];
    if (o.sw === 'guitar') expGuitar = o.guitar;
    if (o.op === 'click' && o.want != null && o.sel.startsWith('.pc-guitar')) expGuitar = o.want === 'true';
    /* The Counts switch: the count row of the note-by-note sections is on screen exactly when it is on. */
    if (o.counts != null && e.state) {
      const cs = e.state.counts;
      if (o.counts ? !(cs.cls && cs.cells > 0 && cs.shown === cs.cells) : (cs.cls || cs.shown > 0)) bad(`the Counts switch set ${o.counts ? 'on' : 'off'}: ${cs.shown} of the ${cs.cells} count cells of the TAB are on screen${cs.cls ? '' : ' (the TAB is not marked counts-on)'}`);
    }
    if (o.start) { phase = 'countin'; pendStart = { ...o.start, t: e.t }; pendLoopFrom = o.start.si; lastPlaceKey = null; order = -1; lastAud = null; silentFrom = null; starts.push({ t: e.t, stop: expStop, si: o.start.si, rep: o.start.rep, firstAud: null }); }
    else if (o.stop) { phase = 'stopped'; lastAud = null; silentFrom = null; }
    else if (o.sw && phase === 'play') { pendSwitch = { t: e.t, kind: o.sw, from: lastAud }; }
    else if (o.sw && phase === 'countin') { starts.push({ t: e.t, stop: expStop, si: pendStart.si, rep: pendStart.rep, firstAud: null, restarted: true }); }
  };
  for (let i = 0; i < nRuns; i++) {
    (evAt.get(i) || []).forEach(onEvent);
    const k = keys[R[i * 8]], n = R[i * 8 + 1], t0 = R[i * 8 + 2], t1 = R[i * 8 + 3], c1a = R[i * 8 + 4], c1b = R[i * 8 + 5], c2a = R[i * 8 + 6], c2b = R[i * 8 + 7];
    const at = `${(t0 / 1000).toFixed(2)} s into the walk`;
    if (/;u\d/.test(k.lit)) bad(`${at}: something is lit that is not a cell of the tab`);
    if (!k.aud.length) {
      if (phase === 'countin' || phase === 'stopped' || phase === 'idle' || phase === 'ended') { if (!litEmpty(k)) bad(`${at}: a cell is lit while nothing plays (${phase === 'countin' ? 'the count-in' : 'stopped'})`); }
      else if (phase === 'play') {
        if (litEmpty(k) && !pendSwitch) {
          phase = 'ended';
          const T = lastAud && clk(lastAud.file);
          const endT = T ? T.clock.time(ch.endBar - 1) : 0;
          if (!ch.wholeSong) bad(`${at}: the song stopped by itself on a card that loops`);
          else if (!lastAud || lastAud.ct < endT - 0.08) bad(`${at}: the song stopped ${lastAud ? (endT - lastAud.ct).toFixed(2) : '?'} s before the end of its last section`);
        } else {
          if (k.lit !== lastLit && !litEmpty(k)) bad(`${at}: the lit cell moved while no file was playing`);
          /* Silence while the card plays: only a file loading after a switch, never longer than the load. */
          if (silentFrom == null) silentFrom = t0;
          if (!saidSilent && t1 - silentFrom > loadMs + SILENCE_MARGIN_MS) { saidSilent = true; bad(`${(silentFrom / 1000).toFixed(2)} s into the walk the song went silent while the card still plays, and stayed silent ${((t1 - silentFrom) / 1000).toFixed(2)} s (a file loads in ${loadMs} ms here)${pendSwitch ? ', after the ' + pendSwitch.kind + ' switch' : ''}`); }
        }
      }
      continue;
    }
    silentFrom = null;
    /* A file is playing. */
    const a1 = k.aud[0], T1 = clk(a1.file);
    if (!T1) { bad(`${at}: a file the track does not declare is playing: ${a1.file}`); continue; }
    const tier = tierOf(M, expStop, expGuitar);
    if (a1.file !== tier.file) bad(`${at}: ${a1.file.replace(/^audio\//, '')} is playing; ${expStop}${M.tr.srcFull ? ', guitar ' + (expGuitar ? 'on' : 'off') : ''} should play ${tier.file.replace(/^audio\//, '')}`);
    if (!near(a1.rate, tier.rate, 2e-3)) bad(`${at}: playing at rate ${a1.rate}; ${expStop} should be ${+tier.rate.toFixed(4)}`);
    if (k.aud.length > 2) bad(`${at}: more than two files are sounding at once`);
    if (phase === 'countin' && pendStart) {
      const S = ch.secs[pendStart.si], wantCt = T1.clock.time(S.fromBar - 1 + pendStart.rep * S.bars);
      const tolS = (W.kind === 'song' ? STEP_MS : FINE_MS) / 1000 + 0.002;
      if (c1a < wantCt - 0.002 || c1a > wantCt + tolS) bad(`${at}: started ${(c1a - wantCt >= 0 ? '+' : '') + (c1a - wantCt).toFixed(3)} s from the first beat of ${S.label}${pendStart.rep ? ' lap ' + (pendStart.rep + 1) : ''}`);
      const s = starts[starts.length - 1];
      if (s) s.firstAud = t0;
      pendStart = null;
    }
    if (pendSwitch) {
      /* The bar and beat do not move across a Guitar or speed switch (allowing for the time that passed). */
      const from = pendSwitch.from, Tf = from && clk(from.file);
      if (Tf) {
        const b0 = Tf.clock.bars(from.ct), b1 = T1.clock.bars(c1a);
        const barSec = T1.clock.time(Math.floor(b1) + 1) - T1.clock.time(Math.floor(b1));
        const moved = (b1 - b0) * barSec, room = (t0 - from.t) / 1000 * a1.rate;
        if (moved < -0.1 || moved > room + 0.1) bad(`${at}: after the ${pendSwitch.kind} switch the song is ${(moved).toFixed(2)} s of music from where it was (${(room).toFixed(2)} s had passed)`);
      }
      /* A lead is real time: at a slower speed it covers less music, so right after a switch the cursor may sit one
         place earlier than it did. The check above is what holds the bar and beat. */
      order = -1;
      pendSwitch = null;
    } else if (phase === 'play' && lastAud && (a1.file !== lastAud.file || c1a < lastAud.ct - 0.2)) {
      /* The song jumped back with no switch pressed: the lap (R10). */
      const Tl = clk(lastAud.file), endT = Tl.clock.time(ch.endBar - 1), startT = T1.clock.time(ch.secs[pendLoopFrom].fromBar - 1);
      const fine = (W.kind === 'song' ? STEP_MS : FINE_MS) / 1000;
      if (ch.wholeSong) bad(`${at}: a whole-song card jumped back from ${lastAud.ct.toFixed(2)} s to ${c1a.toFixed(2)} s`);
      else {
        laps++;
        if (lastAud.ct < endT - 0.06 - fine) bad(`${at}: the lap came ${(endT - lastAud.ct).toFixed(3)} s before the end of the last bar`);
        if (lastAud.ct > endT + 0.03 + fine) bad(`${at}: the song ran ${(lastAud.ct - endT).toFixed(3)} s past the end of the last bar before the lap`);
        if (!near(c1a, startT, 0.06 + fine)) bad(`${at}: the lap landed ${(c1a - startT >= 0 ? '+' : '') + (c1a - startT).toFixed(3)} s from the first beat of ${ch.secs[pendLoopFrom].label}`);
        order = -1;
      }
    }
    phase = 'play';
    /* The lit place at both ends of the run. */
    for (const [ct, ct2, tt] of [[c1a, c2a, t0], [c1b, c2b, t1]]) {
      const cands = expectSet(a1.file, ct, a1.rate);
      if (k.aud[1] && ct2 >= 0) cands.push(...expectSet(k.aud[1].file, ct2, k.aud[1].rate));
      const where = `${(tt / 1000).toFixed(2)} s into the walk (${(ct).toFixed(3)} s of the file)`;
      const real = cands.filter(Boolean);
      if (!real.length) {
        /* Outside the card's bars. BEFORE the first bar is always wrong (the song starts on it). Just past the end,
           before the lap or the stop, the last place stays lit. On a lyric sheet the lead looks past the end for the
           song's last moments: the KNOWN fault "sheetPastEnd" (the strip's first cell lit, no chord names, the mark
           still on the sheet's last chord name) is the one state accepted there; any other fails. */
        const bar1 = T1.clock.bars(ct) + 1;
        if (bar1 < ch.firstBar - 1e-6) { bad(`${where}: the file is playing ${((T1.clock.time(ch.firstBar - 1) - ct)).toFixed(3)} s before the card's first bar`); continue; }
        if (ch.sheet && bar1 < ch.endBar && T1.clock.bars(ct + lead0 * a1.rate) + 1 >= ch.endBar - 1e-9) {
          const [pill, names] = k.misc.split('~'), L = ch.secs[ch.secs.length - 1], lastTok = ch.tok[L.i][L.reps - 1][L.notes.length - 1];
          const KP = KNOWN.find(x => x.card === '*' && x.kinds.includes('sheetPastEnd'));
          if (KP && k.lit === '0' && names.split(',').every(x => x === '') && Number(pill) === lastTok) { stats.pastEnd = (stats.pastEnd || 0) + 1; continue; }
          bad(`${where}: the song's last ${lead0} s (the sheet's lead looks past the last bar): the page lights "This bar" cell ${k.lit === '' ? 'none' : k.lit}, marks chord name ${Number(pill) + 1} and shows [${names}]; the last chord name is ${lastTok + 1}${KP ? ', and the one state KNOWN accepts here is cell 0, no names, the last chord name' : ''}`);
          continue;
        }
        if (k.lit !== lastLit && !litEmpty(k) && lastLit) bad(`${where}: past the end of the card the lit cell moved`);
        continue;
      }
      let hit = null;
      if (ch.sheet) {
        const [pill, names, whereTxt] = k.misc.split('~');
        for (const p of real) {
          const S = ch.secs[p.si], bar = Math.floor(p.local / meter.beats + 1e-9), beat = Math.floor(p.local - bar * meter.beats + 1e-9);
          const wantNow = String(beat * 2), wantTok = ch.tok[p.si][p.rep][p.ni];
          const marks = Array(meter.beats * 2).fill('');
          S.events.forEach(ev => { if (!ev.rest && Math.floor(ev.start / meter.beats + 1e-9) === bar) marks[Math.round((ev.start - bar * meter.beats) * 2)] = ev.name; });
          if (k.lit === wantNow && Number(pill) === wantTok && names === marks.join(',')) { hit = p; break; }
        }
        if (!hit) {
          /* KNOWN sheetLapBoundary: the strip blank (no cell, no names) with the right chord marked, for one step, where
             the lead lands within one step of a lap or section start. */
          const KB = KNOWN.find(x => x.card === '*' && x.kinds.includes('sheetLapBoundary'));
          if (KB && n === 1 && k.lit === '' && names.split(',').every(x => x === '') && real.some(p => Number(pill) === ch.tok[p.si][p.rep][p.ni])) {
            const look = ct + lead0 * a1.rate, stepFile = (W.kind === 'song' ? STEP_MS : FINE_MS) / 1000 * a1.rate;
            const onStart = ch.secs.some(S => { for (let r = 0; r < S.reps; r++) if (Math.abs(T1.clock.time(S.fromBar - 1 + r * S.bars) - look) <= stepFile) return true; return false; });
            if (onStart) { if (lapBlankRun !== i) { lapBlankRun = i; stats.lapBlank = (stats.lapBlank || 0) + 1; } continue; }
          }
          const p = real[0], S = ch.secs[p.si], bar = Math.floor(p.local / meter.beats + 1e-9), beat = Math.floor(p.local - bar * meter.beats + 1e-9);
          bad(`${where}: the chart is at ${secName(p)}: beat ${beat + 1} of the bar, chord name ${ch.tok[p.si][p.rep][p.ni] + 1} of the sheet (${M.scan.toks[ch.tok[p.si][p.rep][p.ni]]}); the page lights "This bar" cell ${k.lit === '' ? 'none' : k.lit}, marks chord name ${Number(pill) + 1} (${M.scan.toks[Number(pill)] || '?'}) and shows [${names}]`);
        } else {
          const S = ch.secs[hit.si];
          if (!whereTxt.includes(S.label)) bad(`${where}: the sheet's place line reads "${whereTxt}" during ${S.label}`);
          if (S.reps > 1) { const m = /(\d+)\D+(\d+)\s*$/.exec(whereTxt); if (!m || Number(m[1]) !== hit.rep + 1 || Number(m[2]) !== S.reps) bad(`${where}: the sheet's place line reads "${whereTxt}" on lap ${hit.rep + 1} of ${S.reps}`); }
        }
      } else {
        const litCells = k.lit.split(';')[0];
        for (const p of real) { if (cellOf(p) === litCells) { hit = p; break; } }
        if (!hit) {
          const p = real[0];
          bad(`${where}: the chart is at ${secName(p)}; the page lights ${litCells ? litCells.split('|').map(x => { const [si, ri, c] = x.split(':').map(Number); const S = ch.secs[si], col = M.scan.pages[si] && M.scan.pages[si].rows[ri] && M.scan.pages[si].rows[ri].cols[c]; return `${S ? S.label : 'page ' + si} row ${ri + 1} column ${c + 1}${col && col.count != null ? ' (count "' + col.count + '")' : ''}`; }).join(' and ') : 'nothing'}`);
        } else {
          const S = ch.secs[hit.si], [vis, repTxt] = k.misc.split('~');
          const nLit = Number((/;n(\d+)/.exec(k.lit) || [])[1]), nCnt = Number((/;c(\d+)/.exec(k.lit) || [])[1]);
          /* A chord grid lights six strings and its count; a note-by-note section six strings and the note name, and
             on a card.counts card its count cell too (shown or hidden by the Counts switch: see the switch check). */
          const wantN = S.grid ? 7 : 7 + (ch.counts ? 1 : 0), wantC = S.grid ? 1 : (ch.counts ? 1 : 0);
          if (nLit !== wantN || nCnt !== wantC) bad(`${where}: ${nLit} cells lit at ${secName(hit)}, ${nCnt} of them a count; ${S.grid ? 'six strings and the count are 7' : 'six strings and the note name are 7' + (ch.counts ? ', and its count makes 8' : '')}`);
          if (Number(vis) !== hit.si) bad(`${where}: the lit cell is in ${S.label}, the page showing is ${ch.secs[Number(vis)] ? ch.secs[Number(vis)].label : 'none'}`);
          if (S.reps > 1) { const m = /(\d+)\D+(\d+)\D*$/.exec(repTxt); if (!m || Number(m[1]) !== hit.rep + 1 || Number(m[2]) !== S.reps) bad(`${where}: the lap label reads "${repTxt}" on lap ${hit.rep + 1} of ${S.reps} of ${S.label}`); }
        }
      }
      if (hit) {
        const o = orderOf(hit);
        /* THE SPARE's overlap: for a few ms the loop's first bar (the spare) and its last bar (the file on its way out) both sound. */
        if (o < order && !ch.wholeSong && k.aud.length > 1) order = -1;
        if (o < order) bad(`${where}: the cursor went back to ${secName(hit)}`, 'back', hit.si, [placeName(hit)]);
        order = Math.max(order, o);
        seen.add(hit.key);
        if (ct === c1a) lastPlaceKey = hit.key; else if (lastPlaceKey !== hit.key && n > 1) bad(`${where}: the same cell stayed lit from one lap to the next`);
      }
    }
    lastLit = k.lit;
    lastAud = { file: a1.file, ct: c1b, t: t1, rate: a1.rate };
  }
  for (const [i, list] of evAt) if (i >= nRuns) list.forEach(onEvent);
  switchUnresolved('the walk ended with the song still silent');
  {
    const missing = [...want].filter(x => !seen.has(x));
    stats.steps = W.span === 'none' ? seen.size : want.size - missing.length;
    const bySec = new Map();
    missing.forEach(x => { const si = Number(x.split(':')[0]); if (!bySec.has(si)) bySec.set(si, []); bySec.get(si).push(x); });
    for (const [si, list] of bySec) {
      const S = ch.secs[si], names = list.map(x => { const [, rep, atN] = x.split(':').map(Number); return placeName({ si, rep, at: atN }); });
      bad(`${list.length} of the ${want.size} places of this walk were never lit, in ${S.label}; the first is ${names[0]}`, 'neverLit', si, names);
    }
  }
  if (W.kind === 'lap' && laps < W.laps) bad(`${laps} laps seen, the walk is long enough for ${W.laps}`);
  if (W.kind === 'song' && !ch.wholeSong && laps < 1) bad('the card never came round to its first bar again');
  if (W.kind === 'song' && ch.wholeSong && phase !== 'ended') bad('the song did not stop at the end');

  /* R11: the count-in of every start, and the Metronome's clicks. */
  const clicks = res.clicks.filter(c => !c.cancelled).sort((x, y) => x.at - y.at);
  const playStarts = res.starts.filter(s => !s.muted);
  const inCount = new Set(), ciPeak = new Map();
  let accHi = null, accLo = null;
  const quiet = clicks.filter(c => !(c.peak >= CLICK_FLOOR));
  if (quiet.length) bad(`${quiet.length} of the ${clicks.length} clicks are below the floor of hearing (peak ${+quiet[0].peak.toPrecision(3)}; the floor is ${CLICK_FLOOR})`);
  starts.forEach((s, si) => {
    const superseded = starts[si + 1] && starts[si + 1].restarted;
    const what = `the count-in before ${ch.secs[s.si].label} (${s.stop})`;
    if (s.firstAud == null) { if (!superseded) bad(`${what}: the song never came in after it`); return; }
    const until = (starts[si + 1] ? starts[si + 1].t : Infinity) / 1000;
    const go = playStarts.find(p => p.t >= s.t && p.t / 1000 < until);
    if (!go) { bad(`${what}: no element of the card started playing`); return; }
    const mine = clicks.filter(c => c.made >= s.t / 1000 - 1e-9 && c.at < go.t / 1000 - 1e-6 && c.made <= go.t / 1000 && c.at < until);
    mine.forEach(c => inCount.add(c));
    const T = tierOf(M, s.stop, false);
    /* R11: a count of the bar the song comes in on (the first bar of the section, or of the lap tapped), at this speed. */
    const S0 = ch.secs[s.si], b0 = S0.fromBar - 1 + s.rep * S0.bars;
    const beat = (T.clock.time(b0 + 1) - T.clock.time(b0)) / meter.steps / T.rate;
    stats.clicks += mine.length;
    if (mine.length !== meter.steps) { bad(`${what}: ${mine.length} clicks, a bar of ${M.meterName} is counted in ${meter.steps}`); return; }
    const misfit = (b) => {
      for (let j = 1; j < mine.length; j++) if (!near(mine[j].at - mine[j - 1].at, b, 0.0015)) return `click ${j + 1} comes ${(mine[j].at - mine[j - 1].at).toFixed(4)} s after click ${j}`;
      if (!near(go.t / 1000 - mine[mine.length - 1].at, b, 0.0015)) return `the song comes in ${(go.t / 1000 - mine[mine.length - 1].at).toFixed(4)} s after the last click`;
      return '';
    };
    const off = misfit(beat);
    if (off) bad(`${what}: ${off}; a count of the bar the song comes in on is ${beat.toFixed(4)} s at this speed`);
    const hi = Math.max(...mine.map(c => c.freq)), lo = Math.min(...mine.map(c => c.freq));
    const acc = mine.map(c => c.freq === hi ? 1 : 0).join(''), wantAcc = mine.map((c, j) => (meter.sub === 3 ? j % 3 === 0 : j === 0) ? 1 : 0).join('');
    if (acc !== wantAcc) bad(`${what}: the higher click is on ${acc.split('').map((x, j) => x === '1' ? j + 1 : '').filter(Boolean).join(', ')}; it belongs on ${wantAcc.split('').map((x, j) => x === '1' ? j + 1 : '').filter(Boolean).join(', ')}`);
    else if (hi !== lo) { accHi = hi; accLo = lo; }
    mine.forEach(c => ciPeak.set(c.freq, Math.max(ciPeak.get(c.freq) || 0, c.peak)));
  });
  const song = clicks.filter(c => !inCount.has(c));
  if (!W.metro) {
    if (song.length) bad(`${song.length} click(s) besides the count-in, with the Metronome off (the first ${song[0].at.toFixed(2)} s into the walk)`);
  } else {
    /* The audible stretches, each read at its own pace (an element's real speed is its rate times its skew). */
    const segs = [];
    for (let i = 0; i < nRuns; i++) { const k = keys[R[i * 8]]; if (k.aud.length && clk(k.aud[0].file)) segs.push({ t0: R[i * 8 + 2] / 1000, t1: R[i * 8 + 3] / 1000, c0: R[i * 8 + 4], c1: R[i * 8 + 5], file: k.aud[0].file, rate: k.aud[0].rate }); }
    const pace = (s) => (s.t1 - s.t0 > 0.004 ? (s.c1 - s.c0) / (s.t1 - s.t0) : s.rate);
    const ctAt = (s, tau) => s.c0 + (tau - s.t0) * pace(s);
    /* The stretch that was sounding at real time tau (or within 30 ms of one), the one that holds it first. */
    const findSeg = (tau) => {
      let lo = 0, hi = segs.length - 1, j = -1;
      while (lo <= hi) { const m = (lo + hi) >> 1; if (segs[m].t0 <= tau) { j = m; lo = m + 1; } else hi = m - 1; }
      let sg = null;
      for (let q = Math.max(0, j - 1); q <= Math.min(segs.length - 1, j + 1); q++) { const s = segs[q]; if (s.t0 - 0.03 <= tau && tau <= s.t1 + 0.03) { sg = s; if (tau <= s.t1) break; } }
      return sg;
    };
    const countPos = (s, ct) => clk(s.file).clock.bars(ct) * meter.steps;
    const countSec = (s, n) => { const T = clk(s.file).clock; return (T.time((n + 1) / meter.steps) - T.time(n / meter.steps)) / pace(s); };
    const lo0 = (ch.firstBar - 1) * meter.steps, hi0 = (ch.endBar - 1) * meter.steps;
    const isLapBeat = (n) => !ch.wholeSong && (n === (ch.secs[pendLoopFrom].fromBar - 1) * meter.steps || n === hi0);
    /* Which switch, if any, a click comes right after (for the message only). */
    const switches = res.events.filter(e => W.ops[e.i].sw || W.ops[e.i].stop).map(e => ({ t: e.t / 1000, kind: W.ops[e.i].stop ? 'Stop' : W.ops[e.i].sw + (W.ops[e.i].stopName ? ' (to ' + W.ops[e.i].stopName + ')' : W.ops[e.i].sw === 'guitar' ? ' (guitar ' + (W.ops[e.i].guitar ? 'on' : 'off') + ')' : '') }));
    const afterSw = (c) => { const t = c.at - C.latency, w = switches.filter(x => x.t <= t + 1e-9 && t - x.t < 0.5).pop(); return w ? `, ${((t - w.t) * 1000).toFixed(0)} ms after ${w.kind === 'Stop' ? 'Stop was pressed' : 'the ' + w.kind + ' switch'}${c.made <= w.t + 1e-9 ? ', scheduled before it' : ''}` : ''; };
    /* Each in-song click, taken back by the page's latency, must fall on a count of the bar it is in, at its pitch. */
    const mapped = [];
    /* QUEUED: a click scheduled before a press (a switch or Stop) that sounds after it. Its messages are counted, and
       capped, apart from every other click message, so neither can crowd the other out; a walk whose only mismatches
       are queued clicks is counted as such in the summary. */
    const presses = res.events.filter(e => W.ops[e.i].sw || W.ops[e.i].stop).map(e => e.t / 1000);
    const isQ = (c) => presses.some(t => c.made <= t + 1e-9 && c.at - C.latency >= t);
    const caps = new Map();
    const badClick = (type, q, msg) => {
      const key = type + (q ? ':q' : ''), n = caps.get(key) || 0;
      caps.set(key, n + 1);
      const before = nIssues;
      if (n < 2) bad(msg); else nIssues++;
      if (q && nIssues > before) nQueued++;
    };
    for (const c of song) {
      const tau = c.at - C.latency;
      const sg = findSeg(tau);
      if (!sg) { badClick('lone', isQ(c), `a Metronome click ${c.at.toFixed(3)} s into the walk with no music playing (the song at ${tau.toFixed(3)} s, the click less the page latency${afterSw(c)})`); continue; }
      const pos = countPos(sg, ctAt(sg, tau)), nearest = Math.round(pos);
      const offSec = Math.abs(pos - nearest) * countSec(sg, Math.floor(pos));
      /* At the lap the spare is started a few ms before the end of the last bar, to cover the 15-20 ms a real element
         takes from play() to its first sound. A fake element starts at once, so in the fake world the loop's first
         downbeat (and only that one) sounds that much early against its click. */
      if (offSec > (isLapBeat(nearest) ? 0.03 : 0.006)) { badClick('off', isQ(c), `a Metronome click ${(c.at).toFixed(3)} s into the walk is ${(offSec * 1000).toFixed(0)} ms ${pos < nearest ? 'before' : 'after'} the count it belongs to (count ${((nearest % meter.steps) + meter.steps) % meter.steps + 1} of bar ${Math.floor(nearest / meter.steps) + 1}; the song at ${(c.at - C.latency).toFixed(3)} s, the click less the page latency${afterSw(c)})`); continue; }
      mapped.push({ c, tau, n: nearest, sg });
      const inBar = ((nearest % meter.steps) + meter.steps) % meter.steps, wantHi = meter.sub === 3 ? inBar % 3 === 0 : inBar === 0;
      if (accHi != null && c.freq !== (wantHi ? accHi : accLo)) badClick('pitch', false, `the Metronome click on count ${inBar + 1} of a bar is ${c.freq} Hz; the count-in's ${wantHi ? 'accented' : 'plain'} click is ${wantHi ? accHi : accLo} Hz`);
      if (ciPeak.has(c.freq) && c.peak < ciPeak.get(c.freq) * CLICK_VS_COUNTIN) badClick('soft', false, `the Metronome click (peak ${+c.peak.toPrecision(3)}) is less than ${CLICK_VS_COUNTIN} of the count-in click of the same pitch (${+ciPeak.get(c.freq).toPrecision(3)})`);
    }
    stats.clicks += mapped.length;
    if (accHi == null && mapped.length > meter.steps && new Set(mapped.map(m => m.c.freq)).size < 2) bad(`all ${mapped.length} Metronome clicks are one pitch: beat 1 of the bar is not marked`);
    /* No count gets two clicks. */
    mapped.sort((x, y) => x.tau - y.tau);
    for (let j = 1; j < mapped.length; j++) {
      const a = mapped[j - 1], b = mapped[j];
      if (a.n === b.n && b.tau - a.tau < 0.5 * countSec(b.sg, b.n)) badClick('double', isQ(a.c) || isQ(b.c), `two Metronome clicks on one count (count ${((b.n % meter.steps) + meter.steps) % meter.steps + 1} of bar ${Math.floor(b.n / meter.steps) + 1}), ${(a.c.at).toFixed(3)} s and ${(b.c.at).toFixed(3)} s into the walk${afterSw(b.c)}`);
    }
    /* Every count the song passed through gets its click: each audible stretch, joined to the one before where the
       music carries straight on (a frame, a twin swap). The count an element STARTS on (a start, a lap, a reload) is
       not required: a fake element's clock moves the moment play() is called, so the page's first frame already sees
       the song past it; a real element's clock stands still for its first 15-20 ms and that count gets its click. */
    const due = [];
    let prev = null;
    for (const s of segs) {
      const p0 = countPos(s, s.c0), p1 = countPos(s, s.c1);
      const q = prev ? countPos(prev, prev.c1) : null;
      const from = q != null && p0 >= q - 1e-6 && p0 - q < 0.5 ? q : p0;
      for (let n = Math.floor(from + 1e-9) + 1; n <= p1 + 1e-9; n++) {
        if (n < lo0 || n >= hi0) continue;
        const T = clk(s.file).clock;
        due.push({ n, tau: s.t0 + (T.time(n / meter.steps) - s.c0) / pace(s) });
      }
      prev = s;
    }
    const miss = due.filter(d => !mapped.some(m => m.n === d.n && Math.abs(m.tau - d.tau) < (isLapBeat(d.n) ? 0.05 : 0.02)));
    if (miss.length) bad(`${miss.length} of the ${due.length} counts the song passed got no Metronome click; the first is count ${((miss[0].n % meter.steps) + meter.steps) % meter.steps + 1} of bar ${Math.floor(miss[0].n / meter.steps) + 1}, ${miss[0].tau.toFixed(2)} s into the walk`);
    stats.due = due.length;
  }
  /* The queued-click walk tests something only if each aimed press met a click already queued (made before it, due
     after it), whether the page then cancels it or not. */
  if (W.kind === 'queued') res.events.forEach(e => {
    const o = W.ops[e.i];
    if (!o.aimed) return;
    const t = e.t / 1000;
    if (!res.clicks.some(c => c.made <= t + 1e-9 && t < c.at)) bad(`the ${o.stop ? 'Stop' : o.sw} press at ${t.toFixed(3)} s met no queued click: this walk tested nothing`);
  });
  /* The two KNOWN faults matched by their exact form, for every card ('*'): what this walk showed of them. */
  for (const K of KNOWN) {
    if (K.card !== '*') continue;
    if (K.kinds.includes('sheetPastEnd') && stats.pastEnd) { K.n = (K.n || 0) + stats.pastEnd; K.walks = (K.walks || 0) + 1; known.push(`${M.view.id} "This bar" one past the end: ${stats.pastEnd} steps`); }
    if (K.kinds.includes('sheetLapBoundary') && stats.lapBlank) { K.n = (K.n || 0) + stats.lapBlank; K.walks = (K.walks || 0) + 1; known.push(`${M.view.id} "This bar" blank for one step at a lap or section start: ${stats.lapBlank} time(s)`); }
    K.seen = K.walks || 0;
  }
  /* KNOWN: this walk's mismatches in a listed section must be exactly the listed ones, no more and no fewer. */
  for (const K of KNOWN) {
    if (K.card !== M.view.id) continue;
    const exp = (K.expect && K.expect[wk]) || {}, got = gotKnown.get(K) || {};
    let same = true;
    const diffs = [];
    for (const kind of K.kinds) {
      const w = new Set(exp[kind] || []), g = got[kind] || new Set();
      const extra = [...g].filter(x => !w.has(x)), gone = [...w].filter(x => !g.has(x));
      if (extra.length || gone.length) { same = false; diffs.push(`${kind}: ${extra.length ? 'new ' + extra.join(', ') : ''}${extra.length && gone.length ? '; ' : ''}${gone.length ? 'no longer ' + gone.join(', ') : ''}`); }
    }
    const any = K.kinds.some(kind => (got[kind] || new Set()).size);
    if (!same) { nIssues++; issues.push(`the known fault in ${K.card} ${K.section} is not what KNOWN lists for "${wk}": ${diffs.join(' | ')}. Seen: ${K.kinds.map(kind => kind + ' [' + [...(got[kind] || [])].join(', ') + ']').join(' ')}`); }
    else if (any) { K.seen = (K.seen || 0) + 1; known.push(`${K.card} ${K.section}: ${K.kinds.map(kind => kind + ' at ' + ([...(got[kind] || [])].join(', ') || 'none')).join('; ')}`); }
  }
  return { issues, nIssues, nQueued, stats, known };
}

/* ═══ THE RUN ═════════════════════════════════════════════════════════════════════════════════════════════════ */
const progress = { where: 'starting', at: Date.now() };
const mark = (where) => { progress.where = where; progress.at = Date.now(); };
const cleanup = [];
let chromeProc = null, exitCode = 0;
const stopChrome = () => new Promise(res => {
  const p = chromeProc;
  if (!p || p.exitCode !== null || p.signalCode !== null) return res();
  let kill = null, cap = null;
  const done = () => { clearTimeout(kill); clearTimeout(cap); res(); };
  p.once('exit', done);
  p.kill();
  kill = setTimeout(() => { try { p.kill('SIGKILL'); } catch { /* gone */ } }, 1000);
  cap = setTimeout(done, 3000);
});
const runCleanup = async () => { await stopChrome(); for (const f of cleanup.splice(0).reverse()) { try { f(); } catch { /* best effort */ } } };
const watchdog = setInterval(() => {
  const quiet = (Date.now() - progress.at) / 1000;
  if (quiet < STALL_S) return;
  clearInterval(watchdog);
  console.error(`playalong-loop: ✗ HUNG: no step started for ${Math.round(quiet)} s (--stall ${STALL_S}). Stuck at "${progress.where}". Closing Chrome and exiting.`);
  runCleanup().finally(() => process.exit(3));
}, 1000);
watchdog.unref();

async function main() {
  const chrome = opt('--chrome') || process.env.CHROME;
  if (!chrome || !existsSync(chrome)) { console.error('playalong-loop: no Chrome for Testing: set CHROME or pass --chrome <path> (never /Applications/Google Chrome.app)'); return 2; }
  if (/\/Applications\/Google Chrome\.app\//.test(chrome)) { console.error('playalong-loop: refusing to run on /Applications/Google Chrome.app: a headless run on it stops Jonathan\'s own Chrome from opening. Use Chrome for Testing.'); return 2; }
  if (typeof WebSocket === 'undefined') { console.error('playalong-loop: needs Node 22+ (global WebSocket)'); return 2; }
  if (!existsSync(join(ROOT, 'index.html'))) { console.error(`playalong-loop: ${ROOT} is not a copy of the site (no index.html)`); return 2; }
  const t0 = Date.now();
  mark('setup: starting Chrome');
  const prof = mkdtempSync(join(tmpdir(), 'gc-playalong-chrome-'));
  cleanup.push(() => rmSync(prof, { recursive: true, force: true }));
  const cdp = await freePort();
  chromeProc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1',
    '--autoplay-policy=no-user-gesture-required', '--no-first-run', '--disable-gpu', '--window-size=1366,657', 'about:blank'], { stdio: 'ignore' });
  let up = false;
  for (let i = 0; i < 80 && !up; i++) { try { await fetch(`http://127.0.0.1:${cdp}/json/version`); up = true; } catch { await sleep(250); } }
  if (!up) { console.error('playalong-loop: Chrome did not start'); return 2; }
  const site = await serve(ROOT);
  cleanup.push(() => site.srv.close());
  mark('setup: opening the site');
  const page = await openPage(cdp);
  const pageErrors = [];
  page.on((method, p) => { if (method === 'Runtime.exceptionThrown') { const d = p.exceptionDetails; pageErrors.push(String((d.exception && (d.exception.description || d.exception.value)) || d.text).split('\n')[0]); } });
  await page.send('Runtime.enable'); await page.send('Page.enable');
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 657, deviceScaleFactor: 1, mobile: false });
  const step = async (name, expr, wait = 0) => { mark(name); const v = await page.evalJs(expr); if (wait) await sleep(wait); return v; };
  const loaded = new Promise(r => page.on(m => { if (m === 'Page.loadEventFired') r(); }));
  await page.send('Page.navigate', { url: `http://127.0.0.1:${site.port}/index.html` });
  await Promise.race([loaded, sleep(20000)]);
  let booted = false;
  for (let i = 0; i < 40 && !booted; i++) { await sleep(250); booted = await step('boot: waiting for the dev bypass', `typeof devBypass === 'function' && typeof openClassActivitiesScreen === 'function' && document.readyState === 'complete'`).catch(() => false); }
  if (!booted) {
    const why = await page.evalJs(`JSON.stringify({ url: location.href, ready: document.readyState, devBypass: typeof devBypass, button: !!document.getElementById('dev-bypass-btn'), scripts: document.scripts.length })`).catch(e => String(e.message));
    console.error(`playalong-loop: the page did not boot (no dev bypass): ${why}${pageErrors.length ? ' · page errors: ' + pageErrors.slice(0, 3).join(' | ') : ''}`);
    return 2;
  }
  await step('boot: dev bypass', 'devBypass()', 2500);
  if (!(await step('boot: the app is up', `getComputedStyle(document.getElementById('app')).display !== 'none'`))) { console.error('playalong-loop: the app did not open after the dev bypass'); return 2; }
  await step('boot: the In class page', `(openClassActivitiesScreen(), true)`, 800);
  await step('boot: the fake world', PAGE_SRC);
  const consts = await step('boot: reading the tracks and cards', '__pl.consts()');
  const tracks = consts.tracks, files = fileIndex(tracks);
  const meterOf = (key) => METERS[METER[key]];

  if (PINS_ONLY) { for (const [k, tr] of Object.entries(tracks)) console.log(`  '${k}': '${clockPin(tr)}',`); return 0; }

  const dataIssues = [];
  /* The data: meters, pins, key twins, and the cards of one song against each other. */
  for (const [k, tr] of Object.entries(tracks)) {
    const m = meterOf(k);
    if (!m) { dataIssues.push(`track ${k}: the tool's METER table has no entry for it (add its meter from skill song-facts)`); continue; }
    if (tr.beatsPerBar !== m.beats || !!tr.countSix !== (METER[k] === '6/8')) dataIssues.push(`track ${k}: counted in ${METER[k]} (${m.steps} counts a bar), but the site has beatsPerBar ${tr.beatsPerBar}${tr.countSix ? ', countSix' : ''}: its cards would count 1-${tr.countSix ? 6 : tr.beatsPerBar}`);
    const pin = CLOCK_PINS[k];
    if (!pin) dataIssues.push(`track ${k}: no clock pin (run --pins after listening to it)`);
    else if (pin !== clockPin(tr)) dataIssues.push(`track ${k}: its clock (anchor, barTimes, tempos or count) is not the one last confirmed by ear. The tool cannot hear whether the new numbers fit the record: re-measure, listen, then update the pin (--pins)`);
    if (Array.isArray(tr.barTimes) && tr.barTimes[0] !== tr.anchor) dataIssues.push(`track ${k}: barTimes[0] is ${tr.barTimes[0]} and anchor is ${tr.anchor}`);
  }
  const cards = consts.cards.filter(a => !ONLY || ONLY.includes(a.id));
  if (ONLY) for (const id of ONLY) if (!cards.some(a => a.id === id)) { console.error(`playalong-loop: no practice card "${id}"`); return 2; }
  const allViews = [];
  for (const a of consts.cards) {
    const d = defaultView(a), lists = viewLists(a), vs = [{ ...d, base: true }];
    for (const dim of ['rec', 'key', 'chord', 'bass']) for (const val of lists[dim]) if (val !== d[dim]) vs.push({ ...d, [dim]: val, base: false, recAlt: dim === 'rec' });
    for (const v of vs) {
      const view = viewOf(a, v), meter = meterOf(view.track);
      if (!tracks[view.track] || !meter) { dataIssues.push(`${a.id}: track ${view.track} is unknown`); continue; }
      allViews.push({ a, v, view, meter, chart: buildChart(view, meter), lists });
    }
  }
  for (const x of allViews) {
    x.chart.problems.forEach(p => dataIssues.push(`${x.a.id} (${viewName(x.a, x.v)}): ${p}`));
    const tr = tracks[x.view.track], c = clockOf(tr, x.meter, false);
    if (c.mapped && x.chart.endBar - 1 > c.mapped - 1) dataIssues.push(`${x.a.id} (${viewName(x.a, x.v)}): the card ends at bar ${x.chart.endBar - 1}, the beat map of ${x.view.track} has ${c.mapped - 1} bars`);
    if (c.time(x.chart.endBar - 1) > tr.durationSec + 1) dataIssues.push(`${x.a.id} (${viewName(x.a, x.v)}): the card ends ${(c.time(x.chart.endBar - 1) - tr.durationSec).toFixed(1)} s after the end of the file`);
    for (const [kk, kv] of Object.entries(x.a.keyVersions || {})) { const o = tracks[kv.track]; if (x.v.base && o && clockPin(o) !== clockPin(tracks[x.a.card.track])) dataIssues.push(`${x.a.id}: the key of ${kk} plays ${kv.track}, whose clock differs from ${x.a.card.track}: the same record in another key keeps its timing`); }
  }
  /* One song, several cards: the chord root at every twelfth of a beat. A rest never disagrees. */
  const byTrack = {};
  for (const x of allViews) { if (x.v.chord && x.v.chord !== defaultView(x.a).chord) continue; if (x.v.bass && x.v.bass !== defaultView(x.a).bass) continue; (byTrack[x.view.track] = byTrack[x.view.track] || []).push(x); }
  let sharedBeats = 0, sharedPairs = 0;
  for (const [tk, list] of Object.entries(byTrack)) {
    const lines = list.map(x => { const m = new Map(); x.chart.secs.forEach(S => { for (let r = 0; r < S.reps; r++) { const base = ((S.fromBar - 1) + r * S.bars) * x.meter.beats; S.notes.forEach(n => { if (n.rest) return; for (let q = Math.round((base + n.start) * 12); q < Math.round((base + n.start + n.len) * 12); q++) m.set(q, rootOf(n.name)); }); } }); return m; });
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      if (list[i].a.id === list[j].a.id) continue;
      let both = 0, first = null, diff = 0;
      for (const [q, r] of lines[i]) { if (!lines[j].has(q)) continue; both++; if (lines[j].get(q) !== r) { diff++; if (!first) first = q; } }
      sharedBeats += both / 12; sharedPairs++;
      if (diff) {
        const m = list[i].meter, bar = Math.floor(first / 12 / m.beats) + 1, beat = (first / 12) % m.beats + 1;
        const others = list.filter((x, z) => z !== i && z !== j && lines[z].has(first)).map((x) => `${x.a.id} says ${lines[list.indexOf(x)].get(first)}`);
        dataIssues.push(`${tk}: at bar ${bar}, beat ${+beat.toFixed(2)}, ${list[i].a.id} says ${lines[i].get(first)} and ${list[j].a.id} says ${lines[j].get(first)} (${(diff / 12).toFixed(2)} beats differ in all${others.length ? '; ' + others.join(', ') : ''})`);
      }
    }
  }
  /* Twin charts: two cards of one song with the same sections and the same number of notes in each are one chart
     in different clothes (single notes, power chords, a lyric sheet). Their rhythm must be identical, rests included:
     this is what sees a chord moved onto or off a "+" where the simpler cards of the song would not notice. */
  let twinPairs = 0, twinNotes = 0;
  const beatName = (start, m) => { const b = ((start % m.beats) + m.beats) % m.beats, w = Math.floor(b + 1e-9), f = b - w; return near(f, 0, 1e-6) ? `beat ${w + 1}` : near(f, 0.5, 1e-6) ? `the "+" of ${w + 1}` : `beat ${+(b + 1).toFixed(3)}`; };
  for (const list of Object.values(byTrack)) for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const A = list[i], B = list[j];
    if (A.a.id === B.a.id || A.chart.secs.length !== B.chart.secs.length) continue;
    if (!A.chart.secs.every((S, k) => { const T = B.chart.secs[k]; return S.fromBar === T.fromBar && S.bars === T.bars && S.reps === T.reps && S.notes.length === T.notes.length; })) continue;
    twinPairs++;
    let said = false;
    A.chart.secs.forEach((S, k) => S.notes.forEach((n, ni) => {
      const o = B.chart.secs[k].notes[ni];
      twinNotes++;
      if (said || (near(n.start, o.start, 1e-6) && near(n.len, o.len, 1e-6) && n.rest === o.rest)) return;
      said = true;
      const bar = Math.floor(n.start / A.meter.beats + 1e-9) + 1, what = (x) => `${x.rest ? 'a rest' : x.name} on ${beatName(x.start, A.meter)}, ${+x.len.toFixed(3)} beats long`;
      dataIssues.push(`${A.a.id} and ${B.a.id} are the same chart of ${A.view.track} (the same number of notes in every section), but in ${S.label}, bar ${bar}, note ${ni + 1} is ${what(n)} in ${A.a.id} and ${what(o)} in ${B.a.id}`);
    }));
  }
  let settledSecs = 0;
  for (const x of allViews) for (const SR of SETTLED_RHYTHMS) {
    if (x.view.track !== SR.track || SR.except.includes(x.a.id)) continue;
    x.chart.secs.forEach(S => {
      const slots = Array(Math.round(S.bars * x.meter.beats * 2)).fill('.');
      S.notes.forEach(n => { if (n.rest) return; const k = n.start * 2; slots[Math.floor(k + 1e-6)] = near(k, Math.round(k), 1e-6) ? rootOf(n.name) : '?'; });
      const want = SR.pattern.repeat(Math.ceil(slots.length / SR.pattern.length)).slice(0, slots.length), got = slots.join('');
      settledSecs++;
      if (got === want) return;
      const k = [...got].findIndex((c, i) => c !== want[i]), bar = Math.floor(k / (x.meter.beats * 2)) + 1, e = k % (x.meter.beats * 2);
      const where = e % 2 ? `the "+" after ${(e - 1) / 2 + 1}` : `beat ${e / 2 + 1}`, say = (c) => c === '.' ? 'no strum' : c === '?' ? 'a strum off the eighth-note grid' : `a strum of ${c}`;
      dataIssues.push(`${x.a.id} (${viewName(x.a, x.v)}), ${S.label}: on ${where} of bar ${bar} the chart has ${say(got[k])}; the settled rhythm has ${say(want[k])} there (${SR.source})`);
    });
  }
  /* LEAD RULE (R9): a lead may not reach one count, at record tempo, of the fastest song it applies to. */
  let shortTab = Infinity, shortSheet = Infinity;
  for (const x of allViews) {
    const c = clockOf(tracks[x.view.track], x.meter, false), ch = x.chart;
    const avgBar = (c.time(ch.endBar - 1) - c.time(ch.firstBar - 1)) / ch.totalBars;
    if (ch.sheet) shortSheet = Math.min(shortSheet, avgBar / x.meter.steps);
    else shortTab = Math.min(shortTab, avgBar / x.meter.steps);
  }
  for (const [name, val, lim, what] of [['PC_TAB_LEAD', consts.tabLead, shortTab, 'tab'], ['PC_ROW_LEAD', consts.tabLead + consts.rowLead, shortTab, 'tab row'], ['PC_SHEET_LEAD', consts.sheetLead, shortSheet, 'lyric sheet']]) {
    if (!(val >= 0) || val >= lim) dataIssues.push(`${name}: the ${what} cursor would run ${val} s ahead of the sound; one count of the fastest song it applies to is ${lim.toFixed(3)} s, so the cursor would sit a whole cell ahead of the music`);
  }
  if (!(consts.latency >= 0 && consts.latency <= 0.2)) dataIssues.push(`the click latency reads ${consts.latency} s (expected between 0 and 0.2)`);
  for (const [name, val] of [['PC_TAB_LEAD', consts.tabLead], ['PC_ROW_LEAD', consts.rowLead], ['PC_SHEET_LEAD', consts.sheetLead], ['snipLatency', consts.latency]]) {
    if (val !== LEAD_PINS[name]) dataIssues.push(`${name} reads ${val} s on the page; the value last confirmed by ear is ${LEAD_PINS[name]} s. The tool cannot hear whether the new value is right: listen to it on a card, then change LEAD_PINS`);
  }
  /* R13's maps. A power chord is the chord's own root and 5th, so its root is the chord's root; a key version moves
     every chord by one and the same interval (full and power maps alike). */
  const SEMI = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  let mapsChecked = 0;
  for (const a of consts.cards) {
    for (const [orig, m] of Object.entries((a.chordVersions && a.chordVersions.power) || {})) {
      mapsChecked++;
      if (rootOf(orig) !== rootOf(m.note)) dataIssues.push(`${a.id}: chordVersions.power maps ${orig} to ${m.note}; a power chord keeps the chord's root (${rootOf(orig)})`);
    }
    for (const [kk, kv] of Object.entries(a.keyVersions || {})) {
      const steps = [];
      for (const which of ['full', 'power']) for (const [orig, m] of Object.entries(kv[which] || {})) {
        mapsChecked++;
        const d = ((SEMI[rootOf(m.note)] - SEMI[rootOf(orig)]) % 12 + 12) % 12;
        steps.push({ which, orig, note: m.note, d });
      }
      const d0 = steps.length ? steps[0].d : 0, odd = steps.find(x => !(x.d === d0) || Number.isNaN(x.d));
      if (odd) dataIssues.push(`${a.id}: in the key of ${kk}, ${steps[0].orig} → ${steps[0].note} moves ${d0} half steps but ${odd.orig} → ${odd.note} (${odd.which}) moves ${odd.d}: a key version moves every chord by the same interval`);
    }
  }
  if (!(consts.slowestRate > 0.5 && consts.slowestRate < 1)) dataIssues.push(`SLOWEST_RATE reads ${consts.slowestRate} (expected between 0.5 and 1)`);

  const out = { root: ROOT, data: dataIssues, walks: [] };
  console.log(`playalong-loop: ${cards.length} of ${consts.cards.length} practice cards · ${Object.keys(tracks).length} tracks · leads read from the page: tab ${consts.tabLead} s, row +${consts.rowLead} s, sheet ${consts.sheetLead} s`);
  console.log(dataIssues.length ? `✗ the data: ${dataIssues.length} problem(s)` : `✓ the data: ${Object.keys(tracks).length} clocks match their pins and meters · ${allViews.length} charts add up (every section's beats = its bars) · ${sharedPairs} pairs of cards of one song agree on the chord root over ${Math.round(sharedBeats)} shared beats · ${twinPairs} pairs of twin charts have the same rhythm (${twinNotes.toLocaleString('en-US')} notes) · ${settledSecs} sections follow a settled rhythm · ${mapsChecked} entries of the chord and key maps keep their root and interval · the leads are shorter than one count and match their pins, as does the click latency`);
  dataIssues.forEach(p => console.log('    ' + p));

  const totals = { cards: 0, views: 0, walks: 0, failed: 0, onlyQueued: 0, frames: 0, steps: 0, clicks: 0, pages: 0, known: 0, pastEnd: 0 };
  const unwalked = [];
  for (const a of cards) {
    totals.cards++;
    const walksBefore = totals.walks;
    for (const x of allViews.filter(y => y.a.id === a.id)) {
      const label = `${a.id} ${viewName(a, x.v)}`;
      const idxView = { rec: x.v.rec ? x.lists.rec.indexOf(x.v.rec) : null, key: x.v.key ? x.lists.key.indexOf(x.v.key) : null, chord: x.v.chord ? x.lists.chord.indexOf(x.v.chord) : null, bass: x.v.bass ? x.lists.bass.indexOf(x.v.bass) : null };
      const openIt = async () => {
        const o = await step(`${label}: opening`, `__pl.open(${JSON.stringify(a.id)}, ${JSON.stringify(idxView)})`, 450);
        if (!o.ok) return o;
        for (const dim of ['rec', 'key', 'chord', 'bass']) if (idxView[dim] != null && o.got[dim] !== idxView[dim]) return { ok: false, why: `the ${dim} switch did not take` };
        if (o.sheet) { let ready = false; for (let i = 0; i < 80 && !ready; i++) { ready = await step(`${label}: waiting for the sheet`, '__pl.sheetReady()'); if (!ready) await sleep(150); } if (!ready) return { ok: false, why: 'the lyric sheet did not draw' }; }
        const scan = await step(`${label}: reading the drawing`, '__pl.scan()');
        return { ...o, scan };
      };
      let o = await openIt();
      if (!o.ok) { console.log(`✗ ${label}: could not open: ${o.why}`); totals.failed++; out.walks.push({ card: a.id, view: viewName(a, x.v), name: 'open', issues: [o.why] }); continue; }
      totals.views++;
      if (SHOTS) {   // --shots: the card as it opens in this view, the viewport only (1366x657)
        const png = await page.send('Page.captureScreenshot', { format: 'png' });
        mkdirSync(SHOTS, { recursive: true });
        writeFileSync(join(SHOTS, `${a.id}-${viewName(a, x.v).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}.png`), Buffer.from(png.data, 'base64'));
      }
      const M = { consts, tracks, files, meterOf, meter: x.meter, meterName: METER[x.view.track], tr: tracks[x.view.track], chart: x.chart, view: x.view, viewLabel: viewName(a, x.v), open: o, scan: o.scan, isBase: x.v.base, recAlt: !!x.v.recAlt, tables: [] };
      /* The drawing. */
      let drawIssues = [];
      if (x.chart.problems.length) drawIssues.push('its chart does not add up (see the data above)');
      else if (o.scan.sheet) {
        const names = x.chart.changes.map(c => c.name);
        if (!o.scan.ok) drawIssues.push(`the page says the sheet and the chart do not match (${o.scan.msg || 'no dot is drawn'})`);
        if (o.scan.toks.length !== names.length) drawIssues.push(`the PDF has ${o.scan.toks.length} chord names, the chart changes chord ${names.length} times`);
        else { const k = names.findIndex((n, i) => n !== o.scan.toks[i]); if (k >= 0) drawIssues.push(`chord name ${k + 1} of the PDF is ${o.scan.toks[k]}, the chart's change ${k + 1} is ${names[k]}`); }
        const wantStrip = Array.from({ length: x.meter.beats * 2 }, (_, i) => i % 2 ? '+' : String(i / 2 + 1)).join(' ');
        if (o.scan.strip.join(' ') !== wantStrip) drawIssues.push(`"This bar" reads "${o.scan.strip.join(' ')}", a bar of ${METER[x.view.track]} is "${wantStrip}"`);
        totals.pages++;
      } else {
        const d = checkDrawing(x.chart, o.scan, x.meter, x.view);
        drawIssues = d.issues; M.tables = d.tables; totals.pages += o.scan.pages.length;
      }
      const nDrawn = o.scan.sheet ? `${o.scan.toks.length} chord names of the PDF` : `${o.scan.pages.length} pages, ${o.scan.pages.reduce((n, p) => n + p.rows.reduce((m, r) => m + (r.cols ? r.cols.length : 0), 0), 0)} columns`;
      if (drawIssues.length) { totals.failed++; console.log(`✗ ${label} · the drawing: ${drawIssues.length} problem(s) in ${nDrawn}`); drawIssues.slice(0, VERBOSE ? 400 : 6).forEach(p => console.log('    ' + p)); }
      else if (!SETTING || 'drawing'.includes(SETTING)) console.log(`✓ ${label} · the drawing: ${nDrawn}: every chord, note and count where the chart puts it`);
      out.walks.push({ card: a.id, view: viewName(a, x.v), name: 'drawing', issues: drawIssues });
      if (x.chart.problems.length) continue;
      /* The walks. */
      const dur = {};
      for (const [f, fi] of Object.entries(files)) dur[f] = tracks[fi.key].durationSec * (fi.slow ? tracks[fi.key].trackBpm / tracks[fi.key].trackBpmSlow : 1) + 2;
      for (const W of planWalks(M)) {
        if (SETTING && !W.name.includes(SETTING)) continue;
        if (W.fresh) { o = await openIt(); if (!o.ok) { console.log(`✗ ${label} · ${W.name}: could not reopen the card: ${o.why}`); totals.failed++; continue; } M.open = o; M.scan = o.scan; if (!o.scan.sheet) M.tables = checkDrawing(x.chart, o.scan, x.meter, x.view).tables; }
        const res = await step(`${label}: ${W.name}`, `__pl.walk(${JSON.stringify({ ops: W.ops, dur, lateNeverLoad: !!W.lateNeverLoad })})`);
        const J = judge(M, W, res);
        totals.walks++; totals.frames += J.stats.frames || 0; totals.steps += J.stats.steps || 0; totals.clicks += J.stats.clicks || 0;
        const size = `${x.chart.secs.length} sections, ${J.stats.steps} places lit, ${J.stats.frames.toLocaleString('en-US')} steps${J.stats.clicks ? ', ' + J.stats.clicks + ' clicks' : ''}`;
        totals.known += J.known.length; totals.pastEnd += J.stats.pastEnd || 0;
        const kn = J.known.length ? ` (and ${J.known.length} known, listed: see KNOWN)` : '';
        if (J.nIssues) { totals.failed++; if (J.nQueued === J.nIssues) totals.onlyQueued++; console.log(`✗ ${label} · ${W.name}: ${J.nIssues} mismatch(es) in ${size}${kn}${J.nQueued === J.nIssues ? ' (only queued Metronome clicks)' : ''}`); J.issues.forEach(p => console.log('    ' + p)); }
        else console.log(`✓ ${label} · ${W.name}: ${size}: every lit cell on the chart's place${kn}`);
        if (VERBOSE) J.known.forEach(p => console.log('    known: ' + p));
        out.walks.push({ card: a.id, view: viewName(a, x.v), name: W.name, issues: J.issues, nIssues: J.nIssues, nQueued: J.nQueued, known: J.known, stats: J.stats });
        W.fresh = false;
      }
    }
    if (SETTING && totals.walks === walksBefore && !'drawing'.includes(SETTING)) { unwalked.push(a.id); console.log(`✗ ${a.id}: --setting "${SETTING}" matches no walk of this card`); }
  }
  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  const realErrors = pageErrors.filter(e => !/firebase|firestore|googleapis|gstatic|net::ERR|Failed to fetch|ResizeObserver loop/i.test(e));
  if (realErrors.length) { console.log(`✗ the page threw ${realErrors.length} uncaught error(s) during the run:`); realErrors.slice(0, 5).forEach(e => console.log('    ' + e)); }
  /* The KNOWN list: what was seen, and (on a full run) what was not. */
  const stale = (!ONLY && !SETTING) ? KNOWN.filter(K => !K.seen) : [];
  const knownInfo = (K) => {
    const x = allViews.find(y => y.a.id === K.card && y.v.base), S = x && x.chart.secs.find(z => z.label === K.section);
    if (!S) return { shortest: NaN };
    const c = clockOf(tracks[x.view.track], x.meter, false), beatSec = (c.time(S.fromBar - 1 + S.bars * S.reps) - c.time(S.fromBar - 1)) / (S.bars * S.reps * x.meter.beats);
    return { shortest: Math.min(...S.notes.map(n => n.len)) * beatSec };
  };
  KNOWN.filter(K => K.seen).forEach(K => {
    if (K.card !== '*') { console.log(`known fault, listed ${K.since}, not fixed: ${K.card} ${K.section}: seen in ${K.seen} walks, each exactly as listed. ${K.why(consts, knownInfo(K))}`); return; }
    const x = { n: K.n || 0, big: K.big || 0, walks: K.walks || 0, worst: K.worst ? K.worst.where : '', worstPct: K.worst ? Math.abs(K.worst.pct).toFixed(1) : '0', worstDir: K.worst && K.worst.pct > 0 ? 'slower' : 'faster' };
    console.log(`known fault, listed ${K.since}, not fixed (${K.kinds.join(', ')}): ${K.why(consts, x)}`);
  });
  stale.forEach(K => console.log(`✗ the KNOWN list names a fault that this full run did not see: ${K.card === '*' ? 'every card' : K.card + ' ' + K.section} (${K.kinds.join(', ')}). If it was fixed, delete its entry.`));
  const failed = totals.failed + (dataIssues.length ? 1 : 0) + (realErrors.length ? 1 : 0) + stale.length;
  const none = !failed && (unwalked.length > 0 || (!totals.walks && !(SETTING && 'drawing'.includes(SETTING))));
  console.log(`\nplayalong-loop: ${failed || none ? '✗' : '✓'} ${totals.cards} cards, ${totals.views} views, ${totals.pages} pages read, ${totals.walks} walks (card-setting pairs), ${totals.steps.toLocaleString('en-US')} places lit and compared, ${totals.frames.toLocaleString('en-US')} steps of the fake clock, ${totals.clicks.toLocaleString('en-US')} clicks: ${failed ? failed + ' with a mismatch' + ` (${totals.onlyQueued} only the queued Metronome click, scheduled before a press and sounding after it; ${failed - totals.onlyQueued} with anything else)` : '0 mismatches'}${totals.known ? ', ' + totals.known + ' known (listed, not fixed)' : ''} · ${secs} s`);
  out.totals = totals; out.failed = failed; out.seconds = Number(secs);
  /* A --setting that matched no walk (a typo, or a card without that walk) is not a pass. The drawing alone is a run
     only when it was asked for (--setting drawing). */
  if (none) {
    console.log(`playalong-loop: nothing was walked${unwalked.length ? ' on ' + unwalked.join(', ') : ''}: ${SETTING ? `--setting "${SETTING}" matches no walk of ${unwalked.length ? 'those cards' : ONLY ? ONLY.join(', ') : 'these cards'}` : 'no walk was planned'}`);
    if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(out, null, 1));
    await page.close();
    return 2;
  }
  if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(out, null, 1));
  await page.close();
  return failed ? 1 : 0;
}

try { exitCode = await main(); }
catch (e) { console.error('playalong-loop: could not run —', e && (e.stack || e.message)); exitCode = 2; }
finally { clearInterval(watchdog); await runCleanup(); }
process.exit(exitCode);
