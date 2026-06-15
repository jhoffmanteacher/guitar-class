# Changelog

Notable changes to the Guitar Class site. Newest first.

For the full session-by-session history (and the reasoning behind each change),
see `WORKFLOW.md` and the git commit log.

## 2026-06-14 — Performance pass

A deep-dive optimization pass focused on first load on slow school Wi-Fi /
Chromebooks. No student-facing behavior changed — sign-in, progress saving, and
all content work exactly as before, just faster to load.

### Changed
- **Lazy-load module content.** The eight `module-N.js` data files are no longer
  loaded on every visit. Each is fetched on demand the first time its module is
  opened, and only that module's panels are built into the page (previously all
  modules were parsed and every set's panels were built up front on each load).
  The Module dropdown now populates from a lightweight manifest. The service
  worker still precaches every module, so offline use is unaffected.
- **Defer the Firestore SDK.** The ~100 KB Firestore library (two-thirds of the
  Firebase payload) is no longer loaded up front. It's fetched on demand the
  first time progress is read or written — i.e. only after sign-in — and
  pre-warmed during the Google sign-in popup. The sign-in screen now loads with
  only ~50 KB of Firebase instead of ~151 KB.
- **Consolidated progress saving.** Skill, last-place, response, and completion
  saves now batch into a single debounced Firestore write instead of up to three
  near-simultaneous writes, reducing write volume and simplifying the code.

### Evaluated, not adopted
- **Modular Firebase SDK swap.** Measured the actual CDN sizes: without a build
  step (which this project deliberately avoids), the modular SDK is ~23 KB
  *larger* than the current compat build. Skipped in favor of the Firestore
  defer above, which achieves the same goal at lower risk.
