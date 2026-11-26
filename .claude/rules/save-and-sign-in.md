---
paths:
  - "app/save.js"
  - "app/start.js"
  - "app/boot.js"
  - "app/drills.js"
  - "app/activities.js"
  - "app/activities-2.js"
  - "app/activities-list.js"
  - "app/explore.js"
  - "coach-*.js"
  - "practice-minutes.js"
  - "practice-minutes-config.js"
  - "teacher-remove.js"
---

## The progress save, sign-in, per-student storage, practice minutes

Moved from CLAUDE.md (2026-11-26). Each tool's header explains what it covers.

- **The progress save** (`app/save.js`, `logPracticeRep` in `app/drills.js`, `ecSubmit` in `app/activities-2.js`,
  `flushOnHide` in `app/activities-list.js`, `caPickPath` in `app/activities.js`, any other write to `progress/{uid}`)
  is a danger zone: Always Reviewed. Read the header of `tools/save-loop.mjs` first. After any change: `node
  tools/save-loop.mjs` (about 10 s; it must end "untagged 0"; each FAIL prints its replay command). A risky save change
  also takes the golden snapshot (CLAUDE.md "Start here" step 3).
- **Sign-in and sign-out** (`app/start.js`, `signOut` / `_uidKey` in `app/boot.js`), the hide / unload flushes, any
  per-student localStorage or sessionStorage key: read the header of `tools/shared-chromebook-loop.mjs`. After any
  change: `node tools/shared-chromebook-loop.mjs` (Node only, about 75 s; it should exit 0 with KNOWN K-TAB inside its
  printed band).
- **The Modules 4/5 swap** (`swap45*`, `flushSave()`): keep all halves (`modules.md`).
- **Every answer writer needs `isPeekedResponseKey()`** (1bl): a locked set is a read-only preview.
- **Start over** (`teacher-remove.js`): its markers are `progressStartOver` / `progressDeleted` in `config/class`; a
  Start over is applied once by the student's own page at its next sign-in (`progressStartOverAtSignIn`,
  `app/save.js`). A page they already have open saves its old copy again: stated in the dialogs, not engineered away.
  After a change to either: `node tools/remove-one-sim.mjs` and `node tools/save-loop.mjs`.
- **The error logger** (`SITE_ERRORS`, `app/boot.js`) writes anonymous `siteErrors` entries: no name, uid or email may
  ever be added to an entry. After a change: `node tools/site-errors-sim.mjs`.
- **The access screen** (`accessRefusedAtBoot` / `showAccessScreen`, `app/boot.js`): after a change, `node
  tools/access-sim.mjs`.
- **`showApp`'s landing** (`app/boot.js`) and which activities a student sees: after a change, `node
  tools/visible-loop.mjs` (`activities.md`).
- **Practice minutes** (`practice-minutes-config.js` + `practice-minutes.js`): minutes are always counted; the display
  is on (`uiOn: true`; the pin is in `tools/pm-sim.mjs`). Its `firestore.rules` blocks must be published BEFORE the
  code that writes them. There is no daily limit: a sound counts `soundAloneMinutes` after the last input.
  `dayCeilingMinutes` and the rules' `dayCeilingSeconds()` (24 hours, a guard, not a limit) move together (1cg).
  Background: `docs/workflow-history-to-2026-11-18.md` → "Recently shipped" → the 2026-11-01 "Practice minutes" entry.
