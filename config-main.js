// ============================================================
//  GUITAR CLASS — MAIN CONFIG
//  This file initializes the SETS array and holds global settings.
//  Content for each module lives in its own file:
//    module-1.js, module-2.js, modules-3-9.js, etc.
//
//  HOW TO ADD A NEW MODULE:
//    1. Create a new file, e.g. module-3.js
//    2. Copy the SETS.push(...) pattern from an existing module file
//    3. Add <script src="module-3.js"></script> to index.html
//       (after config-main.js, before the closing </body>)
//    4. Upload all changed files to GitHub
// ============================================================

const SETS = [];
const MODULE_REVIEWS = {};

// Lightweight module index so the Module dropdown, progress strip, and per-module
// completion counts can render WITHOUT loading every module's data file. Each
// module-N.js is fetched on demand the first time its module is opened (see
// loadModuleData in app.js). Keep the `name` values in sync with each file's
// `module:` field.
//
// `skillCount` = number of set-level skills in that module (module reviews' own
// self-assessment skills are NOT counted). `skillIdRe` matches that module's
// set-skill ids in the student's `progress` map — the id scheme is `w{n}-s{m}`
// for Module 1 and `m{N}w{n}-s{m}` for Modules 2–8. Both fields duplicate data
// that lives in the module files, so `tools/checks.mjs` verifies them against
// the real skills on every run — see the sync rule in CLAUDE.md before editing
// a module's skills.
const MODULE_MANIFEST = [
  { num: 1, name: 'Introductions: You and The Guitar',        skillCount: 9,  skillIdRe: '^w\\d+-s\\d+$' },
  { num: 2, name: 'Notes on the E & A Strings',               skillCount: 11, skillIdRe: '^m2w\\d+-s\\d+$' },
  { num: 3, name: 'Two-Finger Power Chords',                  skillCount: 12, skillIdRe: '^m3w\\d+-s\\d+$' },
  { num: 4, name: 'Major / Minor / Blues Pentatonic Scales',  skillCount: 21, skillIdRe: '^m4w\\d+-s\\d+$' },
  { num: 5, name: 'Open Chords',                              skillCount: 24, skillIdRe: '^m5w\\d+-s\\d+$' },
  { num: 6, name: 'Strumming Patterns with Chords',           skillCount: 18, skillIdRe: '^m6w\\d+-s\\d+$' },
  { num: 7, name: 'TAB Notation and Barre Chords',            skillCount: 18, skillIdRe: '^m7w\\d+-s\\d+$' },
  { num: 8, name: 'Finger Picking',                           skillCount: 18, skillIdRe: '^m8w\\d+-s\\d+$' },
  { num: 9,  name: 'The Full Fretboard & Writing TAB',        skillCount: 24, skillIdRe: '^m9w\\d+-s\\d+$' },
  { num: 10, name: 'Scales, Keys & Ear Training',             skillCount: 19, skillIdRe: '^m10w\\d+-s\\d+$' },
  { num: 11, name: 'Chords, Keys & Harmony',                  skillCount: 20, skillIdRe: '^m11w\\d+-s\\d+$' },
  { num: 12, name: 'Fingerstyle: Travis, Waltz & Requinto',   skillCount: 18, skillIdRe: '^m12w\\d+-s\\d+$' }
];

// ── Practice-routine data (10-Minute Routine card + Daily 5 panel) ──
// Content-independent dexterity warm-ups. playSeq format (midi note numbers),
// all at 60 BPM. These are conditioning, not speed — slow and even beats fast
// and sloppy, and the step text says so.
const WARMUP_BANK = [
  { label: 'Spider walk — 1-2-3-4 up two strings', bpm: 60,
    notes: [41, 42, 43, 44, 46, 47, 48, 49],
    text: 'One finger per fret — index, middle, ring, pinky up the low E (frets 1–4), then the same on the A string. Slow and even beats fast and sloppy.' },
  { label: 'Stretch walk — 1-3-2-4 on the low E', bpm: 60,
    notes: [41, 43, 42, 44],
    text: 'Frets 1-3-2-4 with fingers 1-3-2-4, all on the low E. A reach-and-control drill — slow, no rushing.' },
  { label: 'Open-string skip picking', bpm: 60,
    notes: [40, 50, 45, 55, 50, 59, 55, 64],
    text: 'Picking hand only: E then D, A then G, D then B, G then e — skip a string on every jump, alternate picking. Slow and even beats fast and sloppy.' }
];

// 15-day, 5-minutes-a-day challenge bridging Modules 8 → 9. Rendered inside
// the Daily 5 panel under "On a break?" — one line per day, nothing to save.
const WINTER_CHALLENGE = [
  'Tune by ear from the low E, then check with the tuner.',
  'One-minute changes: C→G. Write down your number.',
  'Fingerpick p-i-m-a over Am for two minutes straight.',
  'Play the Seven Nation Army riff from memory.',
  'Spider walk warm-up, then name the notes at every dot fret on the low E.',
  'D-DU-UDU over G–C–D until it feels automatic.',
  'One-minute changes: your two hardest chords. Beat day 2’s number.',
  'Play the Luna F–Am vamp — two downbeat strums per bar, count “1-2”.',
  'Pentatonic Pattern 1, ascending and descending, slow.',
  'Power-chord riff day: Smoke on the Water or Seven Nation Army as power chords.',
  'Fingerpick the Let It Be progression (C–G–Am–F), thumb on bass.',
  'Read a 4-bar TAB you’ve never played (any Song Journey page, new section).',
  'One-minute changes: barre F → C. Any number is a win.',
  'Play along with any core-song video at 0.75× speed, full pass.',
  'Perform one full song for someone at home. That’s the whole day.'
];
