// ============================================================
//  GUITAR CLASS — MAIN CONFIG
//  This file initializes the SETS array and holds global settings.
//  Content for each module lives in its own file:
//    module-1.js, module-2.js, module-3.js, etc.
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
// for Module 1 and `m{N}w{n}-s{m}` for Modules 2–12. Both fields duplicate data
// that lives in the module files, so `tools/checks.mjs` verifies them against
// the real skills on every run — see the sync rule in CLAUDE.md before editing
// a module's skills.
//
// `name_es` — hand-written Spanish module name (module-content i18n, phase 2).
// `i18nComplete: true` — set once EVERY required student-facing field in that
// module's module-N.js has a real `_es` twin (tools/checks.mjs enforces this
// on every run). Flips the module's Set/Module-Review panels to translate="no"
// so Google Translate stops touching them — see CLAUDE.md's module-content
// i18n section before setting this by hand.
const MODULE_MANIFEST = [
  { num: 1, name: 'Introductions: You and The Guitar',        name_es: 'Presentaciones: tú y la guitarra', i18nComplete: true, skillCount: 9,  skillIdRe: '^w\\d+-s\\d+$' },
  { num: 2, name: 'Notes on the E & A Strings',               name_es: 'Notas en las cuerdas Mi y La', i18nComplete: true, skillCount: 11, skillIdRe: '^m2w\\d+-s\\d+$' },
  { num: 3, name: 'Two-Finger Power Chords',                  name_es: 'Acordes de potencia con dos dedos', i18nComplete: true, skillCount: 12, skillIdRe: '^m3w\\d+-s\\d+$' },
  { num: 4, name: 'Major / Minor / Blues Pentatonic Scales',  name_es: 'Escalas pentatónicas mayor, menor y de blues', i18nComplete: true, skillCount: 21, skillIdRe: '^m4w\\d+-s\\d+$' },
  { num: 5, name: 'Open Chords',                              name_es: 'Acordes al aire', i18nComplete: true, skillCount: 26, skillIdRe: '^m5w\\d+-s\\d+$' },
  { num: 6, name: 'Strumming Patterns with Chords',           name_es: 'Patrones de rasgueo con acordes', i18nComplete: true, skillCount: 18, skillIdRe: '^m6w\\d+-s\\d+$' },
  { num: 7, name: 'TAB Notation and Barre Chords',            name_es: 'Notación TAB y acordes con cejilla', i18nComplete: true, skillCount: 18, skillIdRe: '^m7w\\d+-s\\d+$' },
  { num: 8, name: 'Finger Picking',                           name_es: 'Fingerpicking', i18nComplete: true, skillCount: 18, skillIdRe: '^m8w\\d+-s\\d+$' },
  { num: 9,  name: 'The Full Fretboard & Writing TAB',        name_es: 'El mástil completo y cómo escribir TAB', i18nComplete: true, skillCount: 24, skillIdRe: '^m9w\\d+-s\\d+$' },
  { num: 10, name: 'Scales, Keys & Ear Training',             name_es: 'Escalas, tonalidades y entrenamiento auditivo', i18nComplete: true, skillCount: 19, skillIdRe: '^m10w\\d+-s\\d+$' },
  { num: 11, name: 'Chords, Keys & Harmony',                  name_es: 'Acordes, tonalidades y armonía', i18nComplete: true, skillCount: 20, skillIdRe: '^m11w\\d+-s\\d+$' },
  { num: 12, name: 'Fingerstyle: Travis, Waltz & Requinto',   name_es: 'Fingerstyle: Travis, vals y requinto', i18nComplete: true, skillCount: 18, skillIdRe: '^m12w\\d+-s\\d+$' },
  { num: 13, name: 'String Changing',                         name_es: 'Cambio de cuerdas', i18nComplete: true, skillCount: 4,  skillIdRe: '^m13w\\d+-s\\d+$' }
];

// ── Practice-routine data (10-Minute Routine card + Daily 5 panel) ──
// Content-independent dexterity warm-ups. playSeq format (midi note numbers),
// all at 60 BPM. These are conditioning, not speed — slow and even beats fast
// and sloppy, and the step text says so.
// text_es/label_es: hand-written Spanish (module-content i18n, phase 2) —
// picked up by tf() in app.js's buildModuleRoutine, which is embedded in
// every module's (gated) Module Review panel, so every entry needs both
// twins regardless of which modules are currently i18nComplete.
const WARMUP_BANK = [
  { label: 'Spider walk — 1-2-3-4 up two strings', label_es: 'Caminata de araña — 1-2-3-4 subiendo dos cuerdas', bpm: 60,
    notes: [41, 42, 43, 44, 46, 47, 48, 49],
    text: 'One finger per fret — index, middle, ring, pinky up the low E (frets 1–4), then the same on the A string. Slow and even is better than fast and sloppy.',
    text_es: 'Un dedo por traste — índice, medio, anular y meñique subiendo por la Mi grave (trastes 1–4), y luego lo mismo en la cuerda La. Lento y parejo es mejor que rápido y descuidado.' },
  { label: 'Stretch walk — 1-3-2-4 on the low E', label_es: 'Caminata de estiramiento — 1-3-2-4 en la Mi grave', bpm: 60,
    notes: [41, 43, 42, 44],
    text: 'Frets 1-3-2-4 with fingers 1-3-2-4, all on the low E. A reach-and-control drill — slow, no rushing.',
    text_es: 'Trastes 1-3-2-4 con los dedos 1-3-2-4, todo en la cuerda Mi grave. Un ejercicio de estiramiento y control — despacio, sin apurarte.' },
  { label: 'Open-string skip picking', label_es: 'Pulsado salteado en cuerdas al aire', bpm: 60,
    notes: [40, 50, 45, 55, 50, 59, 55, 64],
    text: 'Picking hand only: E then D, A then G, D then B, G then e — skip a string on every jump, alternate picking. Slow and even is better than fast and sloppy.',
    text_es: 'Solo la mano que puntea: Mi grave y luego Re, La y luego Sol, Re y luego Si, Sol y luego mi agudo — salta una cuerda en cada salto, alternando la púa. Lento y parejo es mejor que rápido y descuidado.' }
];
