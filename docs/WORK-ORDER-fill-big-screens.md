# Work order — the site fills a big screen the way it fills a Chromebook

**Session effort: `high`.** JS and CSS that every page of the site passes through. If your effort is set lower, stop and tell Jonathan before doing anything else.

Date written: 2026-11-13, from a read of `origin/main` = `38d2f8c7d03c98893cccb410d6040b5a15af6c35`. Line numbers below are hints from that commit; match on the quoted names, not the numbers. Every count below came from a `grep -o … | wc -l` over the named files at that commit. Re-run your own count before you lean on one, and say in your report where yours differs.

Repo `CLAUDE.md` applies in full. Read before touching code: `.claude/rules/rail-layout.md`, `.claude/rules/code-hygiene.md`, the comment block above `caSyncFullZoom()` in `app/activities-2.js`, section 6 of the full-screen comments in `styles.css` (search `body.ca-full:has(#class-activities-screen:not([hidden])) .app-layout .main`). For Part 2: `.claude/rules/journey-pages.md`. For Part 3: `.claude/rules/teacher-console.md`, `.claude/rules/live-quiz.md`, the header of `tools/console-layout-smoke.mjs`.

This file is tracked in the repo because it was written in a cloud session (there is no `Claude outputs/` folder there). Delete it in the last part's final commit.

## Workspace

**Files this touches**

| Part | Files |
|---|---|
| 1 | `styles.css`, one `app/*.js` part (or a new small one), `app/activities-2.js` (`caSyncFullZoom()`), possibly `index.html`, `tools/checks.mjs`, `tools/smoke.mjs` |
| 2 | `tabs/journey-theme.css`, `tabs/fab-tools.css`, `tabs/journey.js`, possibly the six `tabs/*.html` pages, `tools/checks.mjs` |
| 3 | `styles.css` (the `.t-*` and `.lq-*` rules), a `teacher-*.js` part, possibly `live-quiz.js`, `tools/console-layout-smoke.mjs`, `tools/checks.mjs` |
| Written last, every part | `CHANGELOG.md`, `WORKFLOW.md`, the version lines in `sw.js` (written by `checks.mjs`); in Part 3 also `CLAUDE.md`, `.claude/rules/rail-layout.md`, `todo.md`, and the removal of this file |

1. **Work in your own worktree, not the main folder.** `git fetch`, then `git worktree add .claude/worktrees/wo-fill-big-screens -b wo/fill-big-screens origin/main`. Make that folder your working directory (the Stop hook checks the folder you are in) and do all the work there. Another session may be using the main folder: do not edit, stage or commit there.
   - A cloud session is already its own clone: skip this step and steps 2, 7 and 8. Everything else applies.
   - A session that cannot push: stop here and follow skill `session-handoff`.
2. **Check for overlap before you start.** Run `git worktree list`. For every other worktree, look at `git -C <path> status --short` and `git -C <path> diff --name-only origin/main...HEAD`. If one has unpushed work in a file from the table above (the "written last" row does not count), read its diff:
   - Same function, or the same CSS rules as this work order → stop and ask Jonathan (AskUserQuestion) which goes first.
   - Different parts of the file → carry on, and name the worktree and the files in your report.
   - Known neighbour: `todo.md` has a queued job on Play Along highlight timing (`app/cards.js`, `pcFrame()`). It does not change layout; if it is in progress, carry on and name it.
3. **Start every part with `git fetch` and `git rebase origin/main`.**
4. **Ship each part as soon as it is done**, before starting the next. Do not hold finished parts back to push together.
5. **Write the `CHANGELOG.md` entry and the `WORKFLOW.md` entry last**: after the part's final rebase, at the top of each file as it then stands, in the part's last commit. Every session adds to the top of those two files, so an entry written early collides with another session's.
6. **Push as `CLAUDE.md` "Start here" step 8 says**: fetch, rebase if `origin/main` moved, the full `node tools/checks.mjs` on the rebased tip, then `git push origin HEAD:main`. A fast-forward only: no merge commit, no force-push. Conflicts are handled exactly as step 8 says, including when to stop and ask. The smoke test runs from its own detached worktree at the pushed commit (`CLAUDE.md` step 3), not from this one.
7. **Files for Jonathan** (the before-and-after screenshots) go in the main folder's `Claude outputs/`. The main folder is the first path `git worktree list` prints. That folder is not tracked, so it does not exist in the worktree, and a copy left in the worktree is deleted with it.
8. **After the last push, clean up.**
   - If the main folder is on `main` and `git status` there shows no changes to tracked files: `git -C <main folder> merge --ff-only origin/main`, so Live Server shows what shipped. Otherwise leave it alone and say so in your report.
   - Confirm `git cherry origin/main wo/fill-big-screens` prints no `+` lines, then `git worktree remove .claude/worktrees/wo-fill-big-screens` and `git branch -d wo/fill-big-screens`.

## What this is for

Jonathan, 2026-11-13, after opening the In class page on his classroom display:

1. **The site should fill whatever monitor it is on.** His words: "the view should be maximized for whatever monitor is being used. so chromebooks but also other displays (not phones) should be taken into account."
2. **The Chromebook comes first and is already right.** His words: "chromebook is priority but the display is not good on my classroom display", and "it displays perfectly on chromebooks."
3. **The classroom display is the screen that prompted this:** a 4K panel (he wrote 3940x2160; read it as 3840×2160) at 150% Windows scaling, so about 2560 CSS px wide and about 1,300 tall inside Chrome at 100% browser zoom. In his screenshot of `#class-activities` the content was one column using about a third of the width beside the left menu, the text was too small to read from across a room, and the lower half of the screen was empty.
4. **The real window size on that display is not known.** Jonathan, 2026-11-13: Chrome was at 100% zoom and maximized ("chrome was not at 80% it was at full screen"). 4K at 150% should give a window about 2560 CSS px wide, but in his screenshot the 252 px left menu was drawn about 155 px wide in a 2000 px image, which would mean about 3,250 CSS px. The two do not agree and nobody has measured it. The factor in this work order adapts to any size, so the build does not depend on the answer; test at both 2560×1300 and 3200×1650, and when the fix is live ask him whether the classroom display now looks right.

Three parts, three pushes, in order. Ship each one before starting the next.

## Decisions already made (do not re-ask)

| Question | Jonathan's answer |
|---|---|
| On a screen bigger than a Chromebook, what happens? | **Grow everything** (2026-11-13). The page looks as it does on a Chromebook, enlarged to fill the screen: header, left menu, text, tab, buttons all scale together. Not "stretch the column", not "grow up to a limit". |
| Which screens? | The student site, the Song Journey pages, the live quiz stage and the teacher console (2026-11-13). |
| Phones? | Out of scope. Nothing changes at or below 760 px wide. |
| What must not change? | The Chromebook at 1366×657: he says it is perfect. Nothing a student sees there may move. |
| The scale factor (written by Claude from his "grow everything" answer; he has not seen the numbers) | `s = min(viewport width / 1366, viewport height / 657)`, never below 1, capped at 3. 1366×657 gives exactly 1. His classroom display gives about 1.87. |
| Browser zoom (Claude's default, not asked: tell him in the report so he can overrule it) | Ctrl + plus and Ctrl + minus keep working on top of the fill. The fill must not cancel them out. |

## Rules these decisions reverse (name them in your report and update the docs in Part 3)

- "**Target screen: Chromebook 1366×657.**" (`CLAUDE.md`, Project). Still true: the Chromebook is the priority and the size every layout is designed and measured at. No longer true: that it is the only screen that counts. A bigger screen now shows the Chromebook layout enlarged.
- "Screenshot every state at 1366×657" (`CLAUDE.md`, "Start here" step 4). Still required. Add: a change to the scaling code itself is also screenshotted at the classroom size (2560×1300).
- The comment above `caSyncFullZoom()` and section 6 in `styles.css`: "the 1000px column times screen width / 1000 … capped at 2× for a very wide screen". The Full screen zoom now sits on top of the fill (Part 1, step 4), so those numbers change.
- `.claude/rules/rail-layout.md` wherever it says the rail and band are measured only at 1366×657.

---

## Part 1 — the student site fills a big screen

### What exists

- `styles.css`: `.rail{width:252px;flex:0 0 252px…}`, `.app-layout .main{…max-width:1000px…}`, and `@media(min-width:1240px){.app-layout .main{margin:0 auto}}`. On a wide window the rail keeps 252 px and the column sits centred at 1000 px. That is the narrow column in his screenshot.
- Sizes are a mix: fonts in `rem`, layout in `px`. So raising the root font size alone does not scale the layout.
- There is already one zoom on the site. `caSyncFullZoom()` in `app/activities-2.js` sets `--ca-zoom` to `clientWidth / 1000` (1 to 2) while `body.ca-full` is on, and `styles.css` applies `zoom:var(--ca-zoom,1)` to `.app-layout .main` for an open activity in browser full screen (Jonathan, 2026-10-13: "make everything bigger too"). `checks.mjs` pins that the zoom stays on `body.ca-full` (search `the zoom must stay on body.ca-full`) and that a card opened in the normal window does not set it.
- Media queries do not know about CSS `zoom`. `styles.css` has 54 `@media` rules on width or height. The ones that shape the Chromebook layout include `@media(min-width:761px) and (max-height:800px)` (the packed rail) and `@media (max-height:800px){:root{--hdr:48px}}`. On the classroom display at 100% browser zoom the window is about 1,300 px tall, so neither applies today, yet after scaling by 1.87 the layout has only about 695 px of height to fill. **The scaled page must get the same rules a Chromebook-sized window gets.** This is the main trap in the part.
- Code that works in screen pixels and can go wrong under a zoom (counts over `app/*.js`, `coach-*.js`, `teacher-*.js`, `fab-tools.js`, `tuner.js`, `live-quiz.js`, `tabs/journey.js`, `practice-minutes.js`, `guitar-diagrams.js`): `clientX`/`clientY` 10 uses, `getBoundingClientRect` 34, `innerWidth`/`innerHeight`/root `clientWidth` 12 (for example the floating tool drag in `app/audio-ui.js`, search `window.innerWidth-w-8`, and the chord popup in `app/snippets.js`, search `window.scrollX + window.innerWidth`), `matchMedia('(max-width:760px)')` 2 (`isNarrowLayout()` and the activity bar). In `styles.css`: 21 `vh`/`dvh` values, 33 `vw` values, 17 `position:fixed` rules.
- The lyric-sheet canvas in `app/cards.js` sizes itself from `devicePixelRatio` (search `Math.min(window.devicePixelRatio || 1, 3)`). CSS `zoom` does not change `devicePixelRatio`, so a zoomed canvas can come out blurred.

### Build

1. **One function gives the factor.** `s = min(width / 1366, height / 657)`, never below 1, at most 3, and exactly 1 when the window is 760 px wide or less. Suggested name `siteFillScale(w, h)`. Keep it pure (numbers in, number out) so `checks.mjs` can run it.
2. **Apply it to the whole page of `index.html`** (header, left menu, content, floating tools, popups, modals) so that at any window size the page is the Chromebook layout enlarged by `s`. How is your call (CSS `zoom` on the root driven by a custom property is the precedent here; a transform or a different mechanism is fine). The results that must hold:
   - At 1366×657 nothing changes (see Prove it).
   - At a bigger window, the page equals what a window of `width / s` by `height / s` shows today, enlarged by `s`. That includes which `@media` rules apply.
   - It is right on the first paint. No visible jump from small to large after load, and it follows a window resize and a move between monitors.
   - Ctrl + plus and Ctrl + minus still make the page bigger and smaller. Measure which of `innerWidth`, `outerWidth`, `screen.width` and `devicePixelRatio` change with browser zoom in Chrome for Testing and choose your inputs from what you measured, not from memory.
3. **Fix what the scaling breaks**, found by measuring, from the list in "What exists": pointer positions (drags, the fretboard and tab clicks, the tap targets in the games), popups and the tool windows placed from the pointer or the window edge, anything sized in `vh` or `vw`, fixed elements (toasts, the live quiz banner `.lq-banner`), and the lyric-sheet canvas, which must be sharp at `s` = 1.87.
4. **Full screen on an open activity keeps its extra zoom on top.** Today on a Chromebook, Full screen enlarges the activity about 1.37 times. On a big screen it must look like the Chromebook's Full screen view enlarged by `s`, without overflowing the window. Adjust `caSyncFullZoom()` and its cap to get that. The pinned behaviour stays: no zoom from `ca-full` in the normal window.
5. **Where the code goes:** follow "Where the code lives" in `CLAUDE.md` (a shared helper goes in the earliest part that uses it; anything that starts a listener is registered in `app/start.js`). If first paint needs the factor before the parts load, say how you did it. Part 2 needs the same function on pages that do not load `app/*.js`: plan for that now so there is one copy of the formula, not two.
6. **Leave the teacher console as it is in this part** (`?teacher=true`, `showTeacherApp()`): `s` stays 1 there until Part 3.

### Guards

- **Unchanged at 1366×657:** everything. Also unchanged at 1366×768 (a Chromebook in full screen) except what step 4 covers.
- **Unchanged at 760 px wide and below:** everything (the mobile drawer, the phone CSS).
- **Unchanged:** `@media print` output (a printed handout is not scaled), the `railCollapsed` setting, `body.ca-fold` (an open activity folds the header and menu away), the 1000 px column and the `70ch`/`72ch` text caps as seen at 1366×657, dark palette, Spanish.
- A metronome, timer or recording that is running keeps running through a resize.
- Practice minutes still count; do not touch `practice-minutes.js`.
- Game screens scale; **how a game listens does not change.** No edit to onset, pitch or grading code in any `coach-*.js` part.
- No new student text is expected. If you add any, it goes in `i18n.js` in `en` and `es`.

### Hard stops

Stop and ask Jonathan (AskUserQuestion) before going past any of these:

- Any edit to listening or grading code in `coach-*.js`, to `app/save.js`, or to `sw.js` beyond what `checks.mjs` writes. If you add a new file that must go in the `sw.js` lists, that edit is Always Reviewed and needs `node tools/slow-load.mjs` and `node tools/kill-switch/proof.mjs`: say so before you do it.
- Anything that would change what a Chromebook shows, even by one pixel, to make the big screen work.
- A screen where "the Chromebook layout enlarged" is clearly worse than today on the classroom display. Show him the two screenshots and ask.

Out of scope, list only: `tuning-sim.html`, `mood-chart.html`, the hidden ear trainer (`trainer-*.js`), ultra-wide or portrait monitors that leave empty space at one edge (report what they look like; do not design for them).

### Prove it

Use headless Chrome for Testing with the stub Firestore, as `tools/smoke.mjs` does. One browser run at a time.

- **The Chromebook did not move.** At 1366×657, before your change and after it, record the box (`getBoundingClientRect`) and computed font size of every visible element on: a set (lesson and checklist), the In class list, an open Focus activity, an open tab practice card, a chord-grid card, a lyric-sheet card, the Games hub, one game before Start, My progress, the Songs hub, sign-in. English and Spanish. Report "N of N boxes identical".
- **The big screen is the Chromebook enlarged.** For the same screens at 2560×1300, 3200×1650 (the two candidate sizes of the classroom display) and 1920×950: every box divided by `s` equals the box in a window of `width / s` by `height / s` on the unchanged site, within 1 px. Report "N of N" for each size, and list every element that differs.
- **No change where none is wanted:** the same box comparison at 1280×720 (a projector below Chromebook width) and at 390×844: identical before and after.
- **Screenshots, each one looked at**, at 1366×657 and at 2560×1300: the In class list (his screenshot), an open activity folded, the same in Full screen, a lyric-sheet card playing (the canvas is sharp), each of the four floating tools open, a chord popup, a game in play, one in Spanish, one in the dark palette. Save the pairs for Jonathan.
- **Pointer positions:** at 2560×1300, drag a floating tool to a corner and click a tab note, a fretboard target and a game's tap target with real mouse events. Report that each landed on the element under the pointer.
- **Browser zoom:** show by measurement that Ctrl + plus and Ctrl + minus change the rendered size.
- **Pin it in `checks.mjs`:** the factor is 1 at 1366×657, 1 at 1366×768, 1 at 390×844, about 1.874 at 2560×1300, never below 1, never above 3; and the rule is wired to the page. Break each in a scratch copy and paste the red line.
- **`tools/smoke.mjs`:** add one walk at 2560×1300 that opens the In class list and one activity and asserts the header spans the window and the content column is wider than 1,400 px on screen. The existing walks stay at 1366×657.

### Ship

Fast (a product change to CSS and a renderer; three or more files is an ordinary trigger; no danger-zone file unless a hard stop above is reached). It is a wide change to `styles.css`, so run the change smoke with no `--only` after the push. `tools/golden.mjs` is not trusted yet (`todo.md`): the box comparison above replaces it. If you changed the `index.html` script tags or load order: `node tools/slow-load.mjs`. `CHANGELOG.md` entry from the student's view. `WORKFLOW.md` "Recently shipped" entry that names this file. Update the comment above `caSyncFullZoom()` and section 6 in `styles.css`.

---

## Part 2 — the Song Journey pages

### What exists

- Six pages in `tabs/` (`sweet-child-o-mine.html`, `the-cure.html`, `seven-nation-army.html`, `let-it-be.html`, `luna.html`, `all-along-the-watchtower.html`). Each loads `journey-theme.css`, `fab-tools.css`, `../i18n.js`, `../guitar-diagrams.js`, `../class-activities.js`, `journey.js`. They do not load the `app/*.js` parts.
- `tabs/journey-theme.css`: `body{…padding:20px 48px 64px…}` and `.wrap{max-width:1000px;margin:0 auto}`. Same narrow column on a big screen.
- `.tab` is styled in both `styles.css` and `journey-theme.css`; the rule in `.claude/rules/journey-pages.md` is to restyle it in both or neither.

### Build

1. Apply the same factor from Part 1, from one shared copy of the formula, to all six pages. Same results as Part 1 step 2: unchanged at 1366×657, the Chromebook layout enlarged above it, right on first paint, browser zoom still works.
2. Fix what it breaks on these pages: the floating tools (`fab-tools.js`), the click bars and the highlight in `journey.js`, the chord popups.

### Guards

- **Unchanged:** every page at 1366×657 and at phone width; the Journey gate (`.ca-gate-card`); audio and click timing; print.
- `fab-tools.js` is shared with the main site: behaviour there stays as Part 1 left it.

### Prove it

- Box comparison as in Part 1 on all six pages, English and Spanish, at 1366×657 (identical before and after), 2560×1300 and 1920×950 (enlarged by `s`), 390×844 (identical). Report "N of N" for each.
- Screenshots at 1366×657 and 2560×1300 of each page's top and one tab section, each looked at; one with a floating tool open.
- Extend the `checks.mjs` pin so it fails if one of the six pages is not wired. Break it and paste the red line.

### Ship

Fast (same reasoning as Part 1). `CHANGELOG.md`, `WORKFLOW.md`. If a clip window or the player was touched (it should not be): `node tools/playalong-loop.mjs`.

---

## Part 3 — the teacher console and the live quiz stage

### What exists

- The console is in `index.html` (`?teacher=true`, `showTeacherApp()` in `teacher-core.js`). `styles.css`: `.t-shell{display:grid;grid-template-columns:216px minmax(0,1fr);…}` with a sticky `.t-side`. Its content already stretches with the window; its type does not grow.
- The live quiz stage is drawn by the `lqStage*Html()` functions in `live-quiz.js` and styled by `.lq-stage` in `styles.css`. It already sizes some text with `clamp(…vw…)` and has `.lq-stage:fullscreen`. Jonathan projects it.
- `tools/console-layout-smoke.mjs` drives the console in headless Chrome against a stub Firestore with made-up students.

### Build

1. Turn the fill on for the console (Part 1 left it at 1 there): same factor, same results as Part 1 step 2.
2. The stage, in the window and in full screen, on the classroom display: the question, the choices and the timer fill the screen and can be read from the back of a room. Measure it first; its `vw` sizes may double up with the fill. The result that must hold: at 2560×1300 the stage is the 1366×657 stage enlarged by `s`, and in full screen it fills the screen with nothing cut off.
3. Fix what it breaks in the console: drag and drop on the activity board (`teacher-activities.js`), sticky table headers, the Students grid.

### Guards

- **Unchanged:** the console and the stage at 1366×657; every write (`teacherWriteConfig()` and the `config/class` reads are not touched); nothing on the stage reveals the answer before the reveal.
- **Student data never goes to Claude.** Test only against the stub Firestore with made-up names. Do not open the real console.

### Hard stops

Stop and ask Jonathan (AskUserQuestion) before going past any of these:

- Any change to `teacher-config.js`, or to a `config/class` writer.
- A console view where the enlarged layout shows less of a table than today on the classroom display and that looks worse. The console is dense; he picked "grow everything" for the site as a whole. Show him the two screenshots and ask.

### Prove it

- Box comparison as in Part 1 on each console view (dashboard, Class activities board and detail, Songs, Manage, Students, Mic recordings) and on the stage (lobby, a question, the reveal) at 1366×657 (identical), 2560×1300 and 1920×950 (enlarged by `s`). Report "N of N" for each.
- Screenshots at 1366×657 and 2560×1300, each looked at: each console view, the stage in the window and in full screen.
- Drag one activity on the board at 2560×1300 with real mouse events and report where it landed.
- `node tools/console-layout-smoke.mjs`; if `live-quiz.js` or an `lq.*` string changed, `node tools/live-quiz-loop.mjs`; if what students see or land on could be affected, `node tools/visible-loop.mjs`. Paste each summary line.
- Extend the `checks.mjs` pin: the console no longer opts out. Break it and paste the red line.

### Ship

Fast unless a hard stop was reached. `CHANGELOG.md` only if a student can see a change (the stage is the teacher's screen; say which you decided). `WORKFLOW.md` entry. **Docs, in this part's last commit:** reword "Target screen" and "Start here" step 4 in `CLAUDE.md` and the matching lines in `.claude/rules/rail-layout.md` as "Rules these decisions reverse" says; delete the section "Queued by Jonathan 2026-11-13: fill whatever monitor is being used" from `todo.md`; delete this file.

---

## Report back

- Which worktree you worked in, what you rebased onto, and every pushed commit hash.
- Anything the overlap check found, and what you did about it.
- The mechanism you chose for the fill, how first paint gets it, and where the one copy of the formula lives.
- What you measured about browser zoom, and a plain sentence for Jonathan: Ctrl + plus and minus still work on top of the fill; does he want that, or should the page always fill?
- Part 1: the "N of N" for each window size, every element that differed, the pointer results, each break-it red line, the smoke summary, the screenshot pairs.
- Part 2: the "N of N" per page and size, the break-it line.
- Part 3: the "N of N" per view and size, the drag result, each tool's summary line, the break-it line, and whether a `CHANGELOG.md` entry was written.
- Each rule from "Rules these decisions reverse" and where you updated it.
- What ultra-wide and portrait windows look like (out of scope, list only).
- Every place you had to interpret this work order, and how you read it.
- Anything you stopped on.
- Whether the main folder was brought up to date, the worktree removed, and this file and the `todo.md` section deleted.
