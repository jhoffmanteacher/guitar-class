# Work order — open activities without the header and menu, and one-line directions

**Session effort: `xhigh`.** Part 2 is a sweep of about 190 strings in two languages. If your effort is set lower, stop and tell Jonathan before doing anything else.

Date written: 2026-11-10, from a read of the local repo at `main` = `bf75b05f99406050032645dac1cb03835c981493`. `git fetch` and rebase first. Line numbers below are hints from that commit; match on the quoted names, not the numbers. Every count below came from a script over `class-activities.js` at that commit. Re-run your own count before you lean on one, and say in your report where yours differs.

Repo `CLAUDE.md` applies in full. Read before touching code: skill `in-class-activities`, `.claude/rules/code-hygiene.md`, `.claude/rules/rail-layout.md`, and the comment block above `caFullscreenNow()` in `app.js`.

## What this is for

Jonathan, 2026-11-10, after looking at a launcher-style layout he likes:

1. **An open activity should fill the page.** Today the purple header and the left menu stay on screen unless the student presses Full screen. He wants them gone as soon as an activity opens.
2. **Every direction inside an activity is one short line.** His words: "students don't read them anyway."

3. **Today's activities sit side by side** (added 2026-11-10, later the same day): two tiles to a row instead of one full-width card per row.

Three parts, three pushes, in order. Ship each one before starting the next.

## Decisions already made (do not re-ask)

| Question | Jonathan's answer |
|---|---|
| Which directions? | In-Class Activities only. Modules get their own work order later. |
| What stays on screen per step? | One line only. No "You've got it when:" line, no fix-it line, no list. |
| Tap dots (the rep counter)? | Keep them. The one line names the count and the dots are built from it. |
| Does the new default view scale things up? | No. Header and menu hidden, normal size. The Full screen button still scales up. |
| Tuner, Timer, Metro, Record? | Four small round buttons at the right of the activity bar. |

## Rules these decisions reverse (name them in your report and update the docs in Part 2D)

- "Multi-step directions are lists" and "You've got it when: … is plain text AFTER `</ol>`" (CLAUDE.md, Content rules). Still true for modules. No longer true inside In-Class Activities.
- "Preserve the author's words; never rewrite the voice" (Jonathan, 2026-07-25). For activity directions he has now asked for the rewrite.
- "Define each music term at first use" (1w). A one-line direction has no room for a definition: use the plain word instead of a new term. Do not add definitions.
- The practice-card model's read-only help steps "each with You've got it when and a one-line fix" (skill `in-class-activities`).
- The full-screen note of 2026-10-10 / 2026-10-11 that ties hiding the header and rail to browser full screen. Hiding them now belongs to "a card is open".

---

## Part 1 — an open activity hides the header and the left menu

### What exists

- `caSyncSolo(card)` in `app.js` already runs on every card open, close and render. It sets `.ca-solo` on the screen and `body.ca-full` when a card is open **and** the browser is in full screen.
- `styles.css` (search `body.ca-full:has(#class-activities-screen:not([hidden]))`): four rules. Two hide `.header` and set `--hdr:0px`, one hides `.rail` and `.rail-backdrop`, one zooms `.app-layout .main` by `--ca-zoom`.
- The browser will not enter full screen without a tap, so the Fullscreen API cannot be the default. This part does not call it.

### Build

1. Add a second body class (suggested name `ca-fold`) that `caSyncSolo()` sets whenever a card is open on the In class page, full screen or not.
2. Move the header rules and the rail rules from `ca-full` to the new class, with the same `:has(#class-activities-screen:not([hidden]))` scope, so leaving for another page brings both straight back.
3. **Leave the zoom rule on `ca-full`.** In the normal window an open card renders at 1×. `caSyncFullZoom()` keeps reading `ca-full`.
4. "◀ All activities" (`caCloseOpen()`) brings the header and menu back. It already clears the solo view; confirm the new class clears with it.
5. **Tools in the bar.** In `caSyncTopbar()`, add four round icon buttons to `.ca-bar-tools`, before Print and Full screen: Tuner, Timer, Metronome, Recorder. Each calls the existing `togglePopup('tuner' | 'timer' | 'metro' | 'rec')`. Reuse the icons and the `tools.*` title keys from `#fab-tuner`, `#fab-timer`, `#fab-metro`, `#fab-rec` in `index.html`. Keep `aria-expanded` in step the way the dock buttons do.
6. **The popups live inside the rail** (`.tool-popup` inside `.rail-tools` inside `.rail`, `position:absolute` above the dock), so `display:none` on the rail hides them too. In the folded view an opened tool must show fully on screen, anchored near the bar's tool buttons. How is your call. Scope every new rule to the folded class. `fab-tools.js` is shared with the Song Journey pages: do not change how it behaves there.

### Guards

- **Unchanged:** the Full screen button, its zoom, "All activities leaves full screen" (Jonathan, 2026-10-29), a reload starting in the normal window, `.ca-solo`, `caSyncHash()`, the `railCollapsed` setting in `localStorage` (same value before and after a card is opened and closed), the mobile drawer.
- A metronome or timer that is running when a card opens or closes keeps running.
- The live quiz banner (`.lq-banner`, `position:fixed`) still shows over a folded card.
- Hidden on purpose while a card is open: Find, Español, the account area, and `#pm-header` (the practice-minutes chip). **Minutes must still count.** Do not touch `practice-minutes.js`; run `tools/pm-sim.mjs` and say what it printed.
- The teacher console's activity preview is not folded.
- No new student text is expected. If you add any, it goes in `i18n.js` in `en` and `es`. Check whether `ca.fullTitle` still describes the button truthfully and fix both languages if not.

### Prove it (CLAUDE.md "Start here" #4)

- Screenshots at 1366×657, each one looked at: the list; a Focus ladder open; a practice card open; a lyric-sheet card open; each of the four tool popups open over a card; Full screen on, then off; back on the list; one in Spanish; one in the dark palette; one at 390px wide to confirm phone width did not break.
- Measure, don't do arithmetic: the bar stays on one row at 1366×657 for the worst case (the longest title with the most step buttons: check `ca-46`, 8 steps) in English and Spanish.
- Pin the default in `checks.mjs` (a card open on In class ⇒ folded, with no full screen). Break it in a scratch copy and paste the red line.
- `tools/smoke.mjs`: open a card and assert the header and rail are not visible; press each tool button and assert its popup is on screen; press "All activities" and assert both are back; reload on `#class-activities/<id>` and assert the card opens folded.

### Ship

Fast (a product change to a renderer and CSS; no danger-zone file). `CHANGELOG.md` entry from the student's view. Update the comment above `caFullscreenNow()`, the CSS comments beside the moved rules, skill `in-class-activities`, and `.claude/rules/rail-layout.md` where they describe the old behaviour. Change smoke after the push, as CLAUDE.md step 3 says.

---

## Part 2 — one short line per direction, In-Class Activities only

### What "one short line" means

**One rendered line in the folded view at 1366×657, normal size, in English and in Spanish.** Measured, not guessed: the element's height equals one line-height.

Writing rules:

- One sentence. Verb first. What to play and the finish line in the same sentence: *"Play Line 1 into Line 2 four times without stopping."*
- **Keep the count** when the old "You've got it when" sentence had one. The dots are built from it (2B).
- Cut: the fix-it line, finger-by-finger lists, recaps of last class, definitions, "then press Play tab to check".
- No `<ol>` / `<ul>`, no "You've got it when:" / "Lo tienes cuando:" label.
- Strings named, never numbered. Chord shorthand and fret numbers stay as notation.
- **Spanish:** shorten the existing `_es` string the same way, reusing the words already in it. Do not re-translate from English. Terminology stays what it was. Buttons named in «».
- Voice as before: second person, no praise, no exclamation points.

### Worked examples (real strings; use these as the model)

| Where | Now | After |
|---|---|---|
| `ca-21` step 2, "Practice — Line 1" | Say the frets of Line 1 out loud, left to right. Then play Line 1 on your guitar, one note per beat, slowly and evenly. Then press Play tab to check, ONLY AFTER you play it. You've got it when: you play Line 1 once through without stopping and it matches the tab. Wrong note? Say each fret number out loud as you play it, and try again. | Play Line 1 once without stopping, one note per beat. |
| `ca-46` step 1, "Practice — Muted strings" | Rest your fretting hand lightly on all six strings so they don't ring. Strum: down on each number, up on each +, and miss the strings on each dot. You've got it when: you play it 8 times in a row and your hand never stops. Hand stops on 3? Keep it moving and miss the strings. | Mute the strings and strum the pattern 8 times in a row without stopping. |
| `ca-1` step 1, "Lines 1 and 2" (a list today) | The first half of the song. Line 1 is the line you learned last time… (fingers list, BPM 70, loop each line) You've got it when: Line 1 into Line 2, four times through, without stopping. | Play Line 1 into Line 2 four times without stopping. |
| `ca-34` step 4, "Practice — The strum in 3" | Count 1, 2, 3 and strum down on each number. Strum hard on 1 and soft on 2 and 3. Play one bar of each chord in the tab, then start again. You've got it when: you play the tab four times through without stopping and every 1 is the loud strum. Late on a change? Start the change on beat 3. | Play the tab four times without stopping, loud on every 1. |
| `ca-17` step 3, "Find the note" (deck drill) | The deck deals you a note name — find it on the A string and pluck it. (three bullets) You've got it when: five cards in a row without looking at a tab, no buzz. | Find five notes in a row on the A string without looking at a tab. |
| `ca-10` intro (practice card) | The Seven Nation Army riff is seven notes on the A string. Play it with the song, first slower, then at normal speed. | Play the Seven Nation Army riff with the song. |
| `ca-10` check 1, "The riff, slower" | Four laps of the riff with the song at the speed the card starts on, without stopping. A lap is once through the riff. | Play the riff four times with the song without stopping. |
| `ca-10` level up | Play along with the whole song on the Whole Song card once it is posted. | Play the whole song on the Whole Song card. |

### 2A. The strings in scope (`class-activities.js`)

| Field | Count | Notes |
|---|---|---|
| step `text` / `text_es` | 81 | All in 15 Focus ladders: `ca-1`–`ca-8`, `ca-11`, `ca-12`, `ca-17`, `ca-21`, `ca-22`, `ca-34`, `ca-46`. 80 are over 120 characters; the median is 265. 78 carry "You've got it when:", 42 are lists, about 29 end in a fix-it line. |
| step `text_power` / `_es` | 3 | Same rule. |
| `intro` / `intro_es` | 42 | 17 Focus, 25 practice cards. Every one is over 70 characters. |
| `intro_power` / `_es` | 3 | `ca-34`, `ca-35`, `ca-39`. |
| `card.checks[].text` / `text_es` | 67 | 25 of them are level-ups. Every one is over 70 characters. |
| `bassDirections` / `_es` | 1 | `ca-35`. |

A step whose drill widget already states the same goal on screen (the `ca-23` model) loses its `text` and `text_es` entirely. Seven steps have both a drill and text today: decide each one and list them in your report.

### 2B. Tap dots keep working

`wrapGotItWhen(html, rep)` builds the dots from the sentence after the "You've got it when:" label (`repCountFromGotIt()`). With the label gone there is nothing to match.

- **Before you change a string:** run the real function over every activity step, English and Spanish, and save the table (step → dot count). My regex estimate is 53 of 81 steps with dots; yours is the number that counts.
- In `caStepHtml()` only, pass an opt-in on the `rep` options so that when no label matches, the count is read from the whole one-line text and the dots render after it. **The module call (`app.js` ≈ line 6071) must not get this**, or module steps with a stray "three times" grow dots. `teacher.js` shows no dots today and stays that way.
- `repCountFromGotIt()` reads a single digit or the words two–five. Write counts it can read.
- The pinned English/Spanish dot-parity check in `checks.mjs` (search "one language names a rep count the other doesn't") mirrors the old rule. Extend it to mirror the new one. That is changed check logic: reviewer plus a break-it proof.
- **After:** the same table again. Report "N of N steps keep the same dot count, English and Spanish." A step may differ only if you list it and say why.

### 2C. Drill directions (`i18n.js` and the drill renderers in `app.js`)

Each drill (`notecall`, `chordcall`, `pcname`, `deck`, `shuffle`) shows **at most one short line of directions** before the student starts. Example: `notecall` shows `nc.introAnswer` and then a second paragraph, `nc.descAnswer`. Shorten the first, remove the second (the key in both languages and its call site).

Not directions, so they stay: switch and button labels, scores and pass lines, the header strip ("Frets 5–12 · low E + A strings", "20 BPM · answer after 6.0 s").

### 2D. Docs and checks

- `checks.mjs`: a cap for the fields in 2A and the drill direction keys in 2C, English and Spanish, so a long direction cannot come back. Set each cap at the longest string that passes the one-line measurement, rounded down to a multiple of 5, and report the two numbers. It guards the feature it ships with: break-it proof, pasted.
- A check that pins old wording: re-pin it and list it. Never loosen a check or add an allowlist entry to get green.
- `CLAUDE.md` Content rules: add the one-line rule for In-Class Activities with today's date and Jonathan's words, and scope the list rule and the "You've got it when" rule to modules. Same edit in skill `in-class-activities` (the "Four steps, two lines a page" and practice-card sections). Dated decision in `WORKFLOW.md`.

### Hard stops

Stop and ask Jonathan (AskUserQuestion) before going past any of these:

- **Exit checks `ca-14` and `ca-15` are not touched at all**, intro included. Their items are positional and frozen.
- No step, check or section is added, removed or reordered. `label` / `label_es`, ids, `tab`, `drill`, `strum`, `path`, `snippet`, `video`, `sections`, `rowLabels` and every caption are untouched.
- No `module-N.js`, nothing under `tabs/`, no shell string outside the drill directions in 2C.
- Nothing touches `progress/`, `config/class`, the save path or `firestore.rules`.
- A direction that cannot be one line without losing something a student needs to stay safe or not damage the guitar: leave it, list it, ask.

Out of scope, list only: the 11 `card` captions over 70 characters (they carry settled song facts; see skill `song-facts`).

### Prove it

- A script renders every in-scope string in the folded view at 1366×657 and measures it. Report "X of X strings are one line in English, Y of Y in Spanish."
- Screenshots at 1366×657, each one looked at: one step from each of the 15 ladders, three practice cards with their checks showing, each drill type before Start, the same set in Spanish.
- `tools/smoke.mjs`: a step with dots still takes taps and "Got it — next step" still moves on.
- Write `Claude outputs/one-line-directions-before-after.md`: every changed string, before and after, English and Spanish, grouped by activity. Jonathan reads this. Do not commit it unless that folder is already tracked.

### Ship

This is a sweep of more than 50 strings: before the push, a fresh `site-reviewer-deep` audits the rewrites (told to find problems: a lost count, a changed musical fact, a string numbered instead of named, Spanish that drifted from the old Spanish, a line that wraps). The change to the dot-parity check gets its reviewer and break-it proof. Follow CLAUDE.md's re-review rounds. `CHANGELOG.md` entry from the student's view. Change smoke on the areas you touched (`activities`; leave out `--only` if `app.js` changes spread).

---

## Part 3 — Today's activities side by side

Do this after Part 2: each tile shows the first sentence of the activity's `intro`, and that is one short line once Part 2 has shipped.

### What exists

In `renderClassActivities()` the Today group is `caTodayHeadHtml(day)` followed by `todayCards` joined one under another (search `todayCards.map`). A pending card draws with `caHeroCardHtml()` (title, blurb, step dots, an optional thumbnail, and a "Start →" / "Keep going →" button); a finished one draws with `caActivityCardHtml()` (the ✓ row). Each is a `<details class="ca-card">` that opens in place, and `caSyncSolo()` hides everything else while one is open.

### Build

1. Wrap Today's cards in one grid container: **two equal columns**, 16px gap, cards in a row the same height. Order is unchanged, so it reads left to right, then down.
2. One Today card → it keeps the full width, as now. Two or more → every tile is half width, including a last odd one (it sits on the left).
3. In a half-width tile the thumbnail column (`caHeroThumbHtml`, 210px) does not fit beside the text. Hide the thumbnail when the grid holds two or more cards; a single full-width card keeps it. The button stays at the tile's right.
4. An open card takes the full width. The wrapper is on the open card's path, so it gets `.ca-solo-path`: make it `display:block` there.
5. Below the existing phone breakpoint the grid is one column.

This is CSS plus one wrapper element. No new text, no new control.

### Guards

- Unchanged: which cards are in Today and their order (`caTodayWindow()`, `todayPending`, `todayDone`), `caStartHereId`, the day chips, the Optional tag, the caught-up box, the Unfinished and Completed folds (they stay full-width lists), deep links, and everything `caSyncSolo()` does.
- `checks.mjs` **1cq** runs the real page. It must still pass. If it pins the old structure, re-pin it and paste a break-it line.

### Prove it

- Screenshots at 1366×657, each one looked at, with 1, 2, 3 and 4 Today cards (stub `caTodayStr()` the way 1cq does), a mix of pending and finished, English and Spanish, plus one card open and one at 390px wide.
- Measure: no tile's title runs past two lines and nothing is clipped, for the longest Today-eligible titles in both languages. Report the count.
- Keyboard: Tab moves through the tiles in the order they read.

### Ship

Fast. `CHANGELOG.md` entry from the student's view. Update skill `in-class-activities` ("Today's activity"). Change smoke after the push (`activities`).

---

## Report back

- Part 3: the screenshot set, the title measurement, and whether 1cq needed a re-pin.
- What you rebased onto, and every pushed commit hash.
- Part 1: the bar measurement, the `pm-sim` output, the pinned check's break-it line.
- Part 2: the two caps, the one-line counts, the dot table result, the seven drill-plus-text decisions, the re-pinned checks, the 11 captions left alone, and anything you stopped on.
- Each rule from "Rules these decisions reverse" and where you updated it.
