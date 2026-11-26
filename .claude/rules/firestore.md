---
paths:
  - "firestore.rules"
  - "firebase-config.js"
  - "firebase.json"
  - ".firebaserc"
  - "RULES-PASTE.md"
  - ".github/workflows/practice.yml"
  - ".github/workflows/rules.yml"
---

## `firestore.rules` and the practice copy

Moved from CLAUDE.md (2026-11-26). `firestore.rules` is a danger zone: Always Reviewed. The "Never" line stays in
CLAUDE.md.

- **A `firestore.rules` change (1dn) → tell Jonathan:** Firebase console → Firestore → Rules → paste → Publish
  (GitHub does not deploy it), and add the line 1dn prints to `RULES-PASTE.md`. The class database's rules are only
  ever pasted by hand; `firebase deploy` on this repo reaches the practice project only (`.firebaserc`), whatever the
  rules file's own comment says.
- **Before that:** `tools/pm-rules-test.mjs` and `tools/rules-core-test.mjs --breaks` on the Firestore emulator; also
  `tools/site-errors-rules-test.mjs --breaks --site <repo>` for the `siteErrors` block and
  `tools/built-songs-rules-test.mjs --breaks` for the built-songs block (their headers say how; GitHub runs them after
  every push, `.github/workflows/rules.yml`). A case named "today: …" turning red means a rule was tightened: make sure
  that was the point.
- **A rules edit re-pins `RULES_FILE_SHA256`** (`checks.mjs` 1dt) in the same commit. 1dt also pins the `isSchool()`
  gate.
- Practice minutes: its rules blocks must be published BEFORE the code that writes them; `dayCeilingSeconds()` moves
  with `dayCeilingMinutes` (1cg; `save-and-sign-in.md`).
- **Practice copy:** the same files at `https://guitar-class-practice.web.app`, talking to the empty practice project
  `guitar-class-practice` (made-up data only, never class data). `firebase-config.js` alone picks the project by
  address: its two Hosting names and preview channels → practice, with a striped "PRACTICE COPY" strip and
  "[practice]" titles; every other address → the class project, unchanged (1ed pins it).
  `.github/workflows/practice.yml` publishes it (main → live + `firestore.rules`; `ci-try/**` → 7-day preview) with the
  secret `FIREBASE_PRACTICE_SA`; only GitHub publishes it (a `firebase deploy` typed on a Mac stops at the predeploy in
  `firebase.json`). Never add a second project to `.firebaserc`; never deploy to the class project from this repo.
