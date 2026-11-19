# Build Look A ("Tidy plum") into the site — brief for a cloud session (2026-11-19)

Jonathan picked Look A on 2026-11-19 from screenshots. The look exists today only as an OVERRIDE stylesheet
(`redesign-spec/look-a.css`) that was layered over the real site in headless Chrome to make the pictures
(`*-today-en.png` = the site now, `*-a-en.png` / `*-a-es.png` = Look A). `DETAILS.md` lists every selector it
overrides and what a real build has to touch. Your job: make the real site look like those A pictures.

Read `CLAUDE.md` first; its rules bind (1366×657 Chromebook target, `/ var(--site-fill,1)` for any new vh/vw,
two stylesheets for `.tab` (Journey rule), i18n twins, checks before push, the CHANGELOG entry, never hand-edit
the version lines in `sw.js`). The Mac-load rules do not apply to you (cloud).

## Build
1. Fold `look-a.css` INTO `styles.css` where each rule lives: the `:root` values into the light `:root` block,
   each selector change into its existing rule (edit the rule, do not append an override layer at the end).
   Keep a selector's change only where it changes what the pictures show.
2. **Dark theme.** `styles.css` has dark-theme `:root` blocks (`prefers-color-scheme: dark`, and any
   `[data-theme]` variant). Every token Look A changes needs a matching dark value in the same spirit (plum-tinted
   greys, quieter borders, the same radii and title scale). Text contrast must pass WCAG AA in BOTH themes
   (4.5:1 body text, 3:1 large text and control edges). `checks.mjs` 1s checks text contrast in both palettes:
   it must stay green; never loosen it.
3. Places the pictures do not show share these selectors (In class list, Games hub, My progress, Module Review,
   the checklist, the drawer, Journey pages through `tabs/journey-theme.css`, the teacher console). Look at
   them: a change that makes one of them worse (lost contrast, a clipped label, a new wrap at 1366×657) is fixed
   in the same build. Restyle `.tab` in both stylesheets or neither.
4. Not in scope: the wider "design-values tidy" (turning all 85 hard-coded hex colours, 29 radii and 62 font sizes
   into tokens). Only what Look A needs. No new features, no wording changes, no layout moves.
5. `CHANGELOG.md`: one dated top entry in the student's view ("a cleaner look: …"), same commit series.
6. Delete the `redesign-spec/` folder in your last commit (it must never reach main).

## Prove it
- `node tools/checks.mjs` exits 0 (it rewrites `sw.js`; commit that).
- Screenshots, if Chrome can run in your sandbox (`redesign-spec/shots.mjs` shows how: serve the repo, dev
  bypass, CDP; its ROOT path is the Mac's, change it): the same three screens at 1366×657, EN and ES, plus the
  In class list, Games and My progress, in light and dark. Compare them with `*-a-*.png`. If Chrome cannot run,
  say so; GitHub walks your branch (below) and the Mac will take the pictures.
- Report: how many tokens changed (light / dark), how many rules edited, the contrast count from 1s, and every
  place outside the three pictured screens you changed or checked.

## Ship
- Commit on a branch and push it as `ci-try/look-a` (GitHub then runs the English smoke and the other browser
  tests on it, and publishes a 7-day preview of the practice copy; its address is on the "Practice copy" run).
- Do NOT push to main and do not merge: the Mac reviews the pictures with Jonathan and merges.
- Commit trailer: `Review: Fast`.
- Final message: 20 lines at most: the branch tip, checks result, the counts above, what you could not check.
