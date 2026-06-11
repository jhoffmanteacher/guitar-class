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

## 4. 🚀 Lazy-Load Modules for Faster Startup

- [ ] Remove the individual `<script src="module-1.js">` through `<script src="module-8.js">` tags from `index.html`
- [ ] In `app.js` (or the main script), add a function that loads a module's JS file on demand:
  ```js
  function loadModule(num) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `module-${num}.js`;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  ```
- [ ] Call `loadModule(n)` only when the student navigates to that module, not on page load
- [ ] Make sure already-loaded modules aren't loaded twice (track which ones have been loaded)
- [ ] Test each module tab to confirm content still renders correctly after lazy loading

---

*Tip: tackle these in order — #2 and #3 are quick wins that take under 10 minutes each.*
