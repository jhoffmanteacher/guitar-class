# Re-design round 2 (visual): details

2026-11-19. Pictures only: no tracked file was edited, nothing was committed. The comparison page is `COMPARE.html` in this folder.

## How the pictures were made
- `shots.mjs` (copied here from the session scratchpad) serves the repo read-only, starts Chrome for Testing (`$CHROME`, headless, fresh profile, service worker bypassed), signs in through the dev bypass, and lays `look-a.css` or `look-b.css` over the real `styles.css` as one extra `<link>` at the end of `<head>` (served from this folder at `/__look/`). Re-run: `node "Claude outputs/redesign-2026-11/shots.mjs" --looks today,a,b --langs en,es --act ca-17:0`.
- Screens at 1366×657, EN and ES: lesson = Module 3 Set 1 step 1 (`m3w1`, the two-column step with E5 / G5 / A5); activity = `ca-17` "Notes on the A String, Then Happy Birthday", step 1, Focus view (tab step, six named step buttons); Songs = `#songs`. Rail with no saved choice (wide on Modules, slim elsewhere).
- All 18 PNGs were looked at. Fixes made after looking: the first draft of both looks widened the lesson card's padding, which pushed one more line into the step text (put back to today's 12px 16px); B's first draft upper-cased the tab phrase labels (dropped: in tab a lower-case e and an upper-case E are different strings) and coloured "Your response" terracotta, the In-class colour (back to blue, today's meaning).
- Made-up data only (the dev user). No console, no Firebase.

## Contrast (WCAG AA: 4.5:1 body text, 3:1 large text)
Measured in the browser on every visible text node of all 6 screens per look: the text colour against the background actually behind it (ancestor backgrounds composed, opacity included). Unique colour pairs:
- Today: 25 of 26 pass. The fail is today's greyed step buttons on an activity (2.21:1, "2 Name the fret" etc., disabled).
- A: 26 of 26 pass (lowest 4.52:1).
- B: 33 of 33 pass (lowest 4.99:1).
Token pairs each look introduces, computed from the hex values: A 20 of 20 pass (lowest 5.02, `--ca-accent` on white); B 32 of 32 pass (lowest 5.33, terracotta `#a8401c` on the sand page). B's thin header line (`#c96a3d` on teal, 2.4:1) is decoration, not text or a control edge. Song-tile colours in B: white icon on each 5.75 to 9.06.
Control edges: 115 controls on the 6 screens; 13 icon-only controls (Tuner / Timer / Metro, print, rail arrow) have an edge under 3:1 in all three versions, the same as today; their icons are the identifying part and use `--purple-accent`, `--green-text`, `--blue-text` or `--text2`, all 5.8:1 or more in both looks.

## Fit (Spanish and English)
Per screen and language, against today: no new sideways scroll (0 px everywhere), no new clipped text, no new wrapped button or heading (0 in all 12 look screens).
- Heights that moved: header 49 → 48 px (both looks, the border line dropped); the chord panel 276 → 278 (EN) and 293 → 295 (ES), its new 1 px border; B only: song-tile names 20 → 22 px (larger title font), so the Core grid is 4 px taller and "More Play Along songs" sits 4 px lower; B's activity bar 48 → 49 px (3 px accent line).
- The Spanish set band ("Módulo 3 · Acordes de potencia y patrones de rasgueo") already takes two rows today; it still takes two in A and B, same height.
- The activity direction line stays one line in both languages in both looks (B keeps it in the system font on purpose).
- Not measured: Chromebooks draw the system font as Roboto, the Mac as San Francisco; both "today" and the looks were shot on the Mac, so the comparison is fair, but the real build should be re-measured on the Chromebook font (W15).

## What each look overrides
Both files change `:root` values first, then selectors where a colour or shape is written into a rule instead of a variable.
- `look-a.css`, 89 lines, 48 rule blocks. `:root`: `--bg`/`--bg2`/`--bg3`, `--text`/`--text2`/`--text3`, `--border`/`--border2`, `--rail-bg`, `--radius` 12, `--radius-sm` 8, new `--radius-btn` 10, `--shadow-card`, and a title scale (`--t-page` 1.375rem, `--t-sec` 1.125, `--t-card` 1.0625, `--t-label` 0.75). Selectors: `.header`, `.rail`, `.nav-btn(.active)`, `.rail-station.active`, `.rail .wpill`, `.set-eyebrow`, `.obj-set-tag`, `.fm-seg`, `.dp` (left bar as an inset shadow so all four corners round), `.stp-sec-label` (no rule line, plum), `.step-label` (Fraunces), `.step-2col-media`, `.step-resp*`, the filled buttons (`.step-done-btn`, `.ca-focus-next`, `.sh-play-btn`, `.sh-tile-main`), the outlined ones (`.play-seq-btn`, `.coach-btn`, `.snip-play`, `.ca-bar-back`, `.ca-bar-full`, `.sh-lib-btn`, `.ca-bar-tool`), `.ca-focus-dot` (and `:disabled`: opacity 1 + dashed edge), `.tab`, `.tab-board`, `.tab-phrase-label`, `.page-title`, `.sh-sec-title` (Fraunces), `.sh-tile*`.
- `look-b.css`, 115 lines, 65 rule blocks. Everything A touches plus: `--brand` (teal `#1d4f5a`), the whole `--purple-*` family remapped to teal, `--blue-*`, `--ca-accent` (terracotta), `--green-*`, `--amber-*`, `--font-display` → Bricolage Grotesque; `.header-title`, `.set-eyebrow-title`, `.ca-bar-name`, `.tab-head .tab-title`, `.sh-tile-name` in the new face; the section band (`.stp-sec-label` with negative side margins); the activity surfaces (`.ca-screen .page-topbar`, `.ca-card`, `.ca-card-body`, `.ca-step-row`, `.ca-focus-nav`); the six song colours (`.sh-core-grid > .sh-tile:nth-child(6n+k)`).
- Font: `fonts/bricolage-latin.woff2` (Google Fonts, latin subset, 77 KB, SIL OFL, variable weight 400-800; covers á é í ó ú ñ ¿ ¡). The real build would ship it in `fonts/` beside Fraunces and add it to the `sw.js` lists.

## What the real build would have to touch (for W15, the design-values tidy)
Counted in today's `styles.css` (5,632 lines):
- 166 hex colours: 81 inside `:root` blocks (light + dark), **85 written straight into rules**; 85 `rgb()/rgba()`: 10 in `:root`, **75 in rules**; 32 bare `#fff`/`white`/`black` values.
- 29 different `border-radius` values (52 × 8px, 31 × 999px, 28 × 20px, 24 × 16px, 22 × 14px, 22 × 10px, 20 × 12px … only 92 use `var(--radius*)`).
- 62 different `font-size` values over 811 declarations (most: 0.8125rem × 185, 0.75 × 118, 0.875 × 117, 0.9375 × 112; and near-duplicates 0.8437 / 0.8438, 0.9062, 0.7812).
- 89 `box-shadow` declarations, 52 different.
- Outside `styles.css`: `tabs/journey-theme.css` has 69 hex colours (Journey pages; restyle `.tab` in both stylesheets or neither, per the Journey rule); hex literals in JS: `live-quiz.js` 19, `app/boot.js` 13, `coach-noterunner.js` 8, `teacher-sb-beat.js` 7, `app/review.js` 2 (counted by a simple pattern; some are canvas colours).
- Every value in both looks is light-theme only. The site also has a dark theme (`prefers-color-scheme: dark`); the picked look needs dark values too, and the token contrast checks re-run on them.
- The six song-tile colours are hard-coded in six `nth-child` rules today; A leaves them alone, B replaces them, so B's build should make them tokens (`--song-1` … `--song-6`).

## Things Jonathan may want to know
- A is close to today on purpose (he kept today's colours and fonts on 2026-11-17). The visible changes are small: plum section labels with no rule line, Fraunces step titles and section headings, softer cards, one corner size, white "you are here" in the menu, readable dashed future steps.
- B changes the brand colour from plum to teal. Plum also lives on things these pictures do not show (Journey pages, games top bar, the teacher console, slides and printouts); a switch would carry to all of them.
- In B the In class colour becomes terracotta and the activity's current step button uses it (today it is plum). Green still means done everywhere, per the 2026-10-31 rule ("every I'm done button is one colour").
