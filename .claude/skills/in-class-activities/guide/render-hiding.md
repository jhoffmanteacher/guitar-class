# Render-time hiding

**Render-time hiding.** Four section `kind`s beyond `tuning-warmup` (ratchet
1r):
- `take-to-song` — switched off in every module (`TAKE_TO_SONG_ENABLED`; see
  "Play-along first", `songs-links.md`).
- `routine`/`ear-spark`/`reflection`: the section is skipped entirely ("My
  Practice Routine", "Ear Spark — optional ear bonus", "Checkpoint"/"Wrap-Up").
- **Kind-ONLY matching, deliberately NOT kind-or-title like
  `isTuningWarmupSection`.** `isEarSparkSection`/`isRoutineSection`/
  `isReflectionSection`/`isTakeToSongSection` in `app/shell.js` check `sec.kind` alone:
  these titles repeat across nearly every module.
- A step-level `hidden: true` flag (song previews now taught by a class
  activity) works the same way.
- All 13 modules are tagged: every "Checkpoint"/"Wrap-Up"/"Take It to a
  Song"/"My Practice Routine…"/"Ear Spark…" section carries its `kind`.
  Module 1 has one (its "session check-in" `routine`); Module 13 has none.

**`visibleSteps(sec, moduleNum)` / `visibleSections(station, moduleNum)`**
(`app/lesson.js`) are the one gateway everything student-facing reads through:
`buildLesson()`, `resumeLessonCounts()`, `buildSearchIndex()`,
`moduleStepsFlat()` (the Daily 5 pool).
- The one deliberate exception is `setShortResponses()` in `teacher-manage.js`: it walks
  `storageSections()` (every section but tuning-warmup) because it audits what
  students actually wrote, Modules 1–2's Checkpoint / Wrap-Up / Practice
  Routine answers included. A slot in a non-renderable section or on a
  `hidden` step is tagged `retired` and labelled "(retired)".
- `visibleSteps` returns `{st, idx}` pairs. `idx` is the step's real position
  in `sec.steps` — what every storage key (doneKey, responses, bpm, drills) is
  built from — so a hidden step never shifts a later one's saved progress. The
  position in the *returned array* is the visible step number and the only
  thing "which step is current" compares against.
- `visibleSections` returns `{sec, gi}` pairs. **`gi` is the STORAGE index and
  comes from `storageSections()`: the section's position after excluding ONLY
  tuning-warmup sections.** Every Firestore key is written that way.
- Every other hide — routine / ear-spark / reflection / take-to-song, a section
  with zero visible steps — is render-only and never renumbers `gi` (numbering
  over the survivors once moved Module 2 Set 1 station B's progress from
  `b-sec2` to `b-sec1`).

**`JOURNEY_LAYERS`** in `app/lesson.js` (`{slug: {moduleNum: layerNum}}`) is authored
from the six pages' real `.layer-unit` spans — today Module 1→Layer 1 … 5→5,
anything past 5 an unnumbered "Extra". Layer 4 is Open Chords, Layer 5 the
Pentatonic Solo (Modules 4 and 5 swapped).

**Ratchets:**
- **1ab** — rebuilds `JOURNEY_LAYERS` from the spans and fails on drift.
  **1ab2** checks the module files against it: every `songThread` layer, every
  "Layer N of 5" in module-N.js, every `#layer-N` link; a layer titled Power
  Chords / Pentatonic / Open Chords must name the Module whose
  `MODULE_MANIFEST` name teaches it.
- **1ac** — the four callers above must still call
  `visibleSteps(`/`visibleSections(`; `setShortResponses()` must call
  `storageSections(` and fails on `visibleSections(`. A positive assertion, so
  it can't catch a raw `.steps.forEach` added *alongside* a leftover call.
- **1ad** — kind ↔ title, both ways (same shape as 1r). `KIND_TITLE_COUNTS`
  pins the total per kind at
  `{take-to-song:29, routine:5, ear-spark:7, reflection:62}` across all 36 sets.
- **1ae** — every `hidden: true` step needs a `// ... ca-<n>` comment on the
  line above it.
- **1af** — rebuilds the expected `data-ns` list for all 36 sets from raw
  module data, compares it to what `buildSet()` renders, and pins the Module 2
  Set 1 sections by title. `tools/smoke.mjs` walks every set in both languages
  in a real browser.

**Step-level `hidden: true` stays at Module 2's original 3.** Modules 3–8 were
checked against every shipped `ca-<n>` (2026-09-12); none duplicates a module
step: Finger Gym (ca-2…ca-7) is generic drills; ca-11 and ca-12 are Module
1/2-era; ca-13's single-note "the cure" line and ca-10's Seven Nation Army
frets teach a different skill than those songs' module steps. A new class
activity that duplicates a module step is the trigger to hide that step.

---
