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

// Lightweight module index so the Module dropdown can populate WITHOUT loading
// every module's data file. Each module-N.js is fetched on demand the first
// time its module is opened (see loadModuleData in app.js). Keep the `name`
// values in sync with each file's `module:` field.
const MODULE_MANIFEST = [
  { num: 1, name: 'Introductions: You and The Guitar' },
  { num: 2, name: 'Notes on the E & A Strings' },
  { num: 3, name: 'Two-Finger Power Chords' },
  { num: 4, name: 'Major / Minor / Blues Pentatonic Scales' },
  { num: 5, name: 'Open Chords' },
  { num: 6, name: 'Strumming Patterns with Chords' },
  { num: 7, name: 'TAB Notation and Barre Chords' },
  { num: 8, name: 'Finger Picking' }
];
