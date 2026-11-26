---
paths:
  - "module-*.js"
  - "config-main.js"
  - "class-activities.js"
  - "app/save.js"
  - "app/lesson.js"
  - "app/review.js"
  - "app/drills.js"
  - "tabs/journey.js"
  - "teacher-core.js"
  - "tools/rule-zero-proof.mjs"
---

## Module data: the three regimes, the 4/5 swap, keyed MCs

Moved from CLAUDE.md (2026-11-26); CLAUDE.md "Three regimes" points here. Content and wording: `content.md`.

### ⚠️ Three regimes decide what may change in a module
A progress key is `${setId}-${station}-sec${gi}-${i}`: a step that changes INDEX loses its tick (1dl runs
`rule-zero-proof.mjs`).
- **Modules 1–`FROZEN_THROUGH` (3):** labels match BY INDEX; new steps only appended to a section's tail; no renames.
  Keyed-MC choices frozen (1ap); a keyed MC may be ADDED to an existing step; reword only via
  `response.renamedChoices` (old text → new choice), then re-pin 1ap.
- **Modules 4–`OPEN_THROUGH` (6):** steps insertable anywhere inside a section; `response` removable or changeable,
  except Module `FROZEN_THROUGH`+1's keyed MCs (1dl); old labels keep their relative order.
- **Above 6:** step count and order fixed; a rename prints.
- **Every regime:** SECTIONS fixed (count, order, kind); a section TITLE may be reworded (it prints) unless it has a
  `kind` or is the tuning warm-up title.
- **Raise `FROZEN_THROUGH` (= `FROZEN_MC_THROUGH_MODULE`) when the class ENTERS a module**; the keyed quizzes of the
  module after it are frozen automatically (1dl). **Never lower either** (1dl):
  module progress never resets unless Jonathan does it.
- A locked set is a read-only preview; every answer writer needs `isPeekedResponseKey()` (1bl).
- A blocked fix → the Summer reset list (skill `summer-reset`) the same day. It waits there until a declared old key →
  new key map that `rule-zero-proof` verifies exists (none yet).

### ⚠️ Modules 4 and 5 swapped
Open Chords = 4, Pentatonic = 5. Progress moves once per browser (`swap45*`, `app/save.js`): no `migrations.swap45` =
OLD numbers only, with it NEW only. Keep all halves: `flushSave()`, `tabs/journey.js`, and the `teacherFetchStudents()`
remap in `teacher-core.js`. Prove with `node tools/rule-zero-proof.mjs d0cd004`.
- `moduleOpenThrough` is per module NUMBER; the swap didn't touch it.
- Course order lives in the module number: reordering again means another renumber.
- `rule-zero-proof.mjs` against the pre-swap `1a1f6cc` fails by design.
- Notes dated before 2026-10-12 may use the old numbers.
- Open (no record it was done): a tab that loaded a doc before the move and saved after it merges old-numbered keys
  back. Re-scan by hand the 3 docs the 2026-10-12 scan found with Module 4/5 work, for an old id coming back, any
  `m5w4-*`, or `chords-m5`.

### ⚠️ Keyed MCs (`response:{type:'mc'}`, ungraded)
- Shuffled at render (`mcOrder`, `MC_PINNED`). A keyed step stores the choice **text**; the practice panel stores the
  **index** (not pinned by 1ap: wording free, ORDER held). Don't unify them.
- Seed = ENGLISH prompt + choices, so both languages and every student (the projector) see one order; a reword
  re-rolls it. Fewer than 3 choices are not shuffled. `MC_PINNED` is narrow on purpose (catch-alls only). `answer: 0`
  is fine (the shuffle hides the slot).
- Never name an option by position. Rewording after students arrive orphans their picks.
- **1ap** pins Modules 1..`FROZEN_MC_THROUGH_MODULE` (**3**) by fingerprint: raise it with the class (re-run, paste the
  fingerprints, same commit); never lower it.
- Check a video's watch range before writing a question about it. New authoring fields go in `STUDENT_VALUE_NAME_RE`.

### Module structure
- Module 13 is single-flow (`stations.b` only). It has custom tab labels (`stations.b.tabSub`, `checklistSub`), and its
  checklist is the graded assessment.
- A skills edit → bump `skillCount` in `MODULE_MANIFEST` (`config-main.js`).
