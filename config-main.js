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
  { num: 8, name: 'Finger Picking',                           skillCount: 18, skillIdRe: '^m8w\\d+-s\\d+$' }
];
