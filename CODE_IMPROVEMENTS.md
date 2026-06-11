# Guitar Class Website — Code Improvements

---

## 1. 🗂️ Split `index.html` into Separate CSS/JS Files

- [x] Create a new file: `styles.css`
- [x] Cut everything between `<style>` and `</style>` from `index.html` and paste it into `styles.css`
- [x] Replace the `<style>` block in `index.html` with: `<link rel="stylesheet" href="styles.css">`
- [x] Create a new file: `app.js`
- [x] Cut all JavaScript between the main `<script>` and `</script>` tags in `index.html` and paste it into `app.js`
- [x] Replace that `<script>` block in `index.html` with: `<script src="app.js"></script>`
- [ ] Test with Live Server — dev bypass should still work, all tabs and progress should load normally

---

## 2. ⚡ Fix Script Loading Order

- [x] Open `index.html` and find the `<script>` tags near the top of `<body>`
- [x] Move the three Firebase scripts (`firebase-app-compat.js`, `firebase-auth-compat.js`, `firebase-firestore-compat.js`) **above** all the module scripts (`module-1.js` through `module-8.js`)
- [x] Final order should be:
  - `firebase-config.js`
  - `firebase-app-compat.js`
  - `firebase-auth-compat.js`
  - `firebase-firestore-compat.js`
  - `config-main.js`
  - `module-1.js` through `module-8.js`
  - `app.js` (or the main script block, if not yet split out)
- [x] Test with Live Server — sign-in and progress saving should still work

---

## 3. 🧹 Remove Stale Files & Clean Up the Repo

- [x] Delete `index (3).html` from the project folder — it's an old downloaded copy, not the real file
- [x] Check for any other duplicate or downloaded files (e.g. `index (1).html`, `index (2).html`) and delete those too
- [x] Push the cleanup to GitHub with a commit message like: `chore: remove stale index copies`
- [x] Confirm on GitHub.com that only the correct files remain

---

## 4. 🚀 Faster Startup — `defer` the Scripts

> **Decision (June 2026):** True lazy-loading was considered but rejected as too risky.
> The app's startup (`renderAll`) assumes the entire `SETS` array is already built, so
> loading modules on demand would require rewriting the boot sequence. Instead we used
> `defer`, which gets most of the startup speed-up with almost no risk and keeps the
> existing architecture intact.

- [x] Add `defer` to all the Firebase, `config-main.js`, and `module-1.js`–`module-8.js` script tags so they no longer block the page from rendering
- [x] Add `defer` to `app.js` too (required — keeps it running after the Firebase/module scripts, preserving load order)
- [x] Page now paints first, then scripts run in order right before the app initializes
- [ ] Test with Live Server — sign-in/dev bypass, all module tabs, tools, and progress saving should still work

---

*Tip: tackle these in order — #2 and #3 are quick wins that take under 10 minutes each.*
