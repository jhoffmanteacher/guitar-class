# Work order — close the open findings from the Friday check of 2026-11-23

**Session effort: `high`.** Five small, separate fixes; two of them (the full-screen exit and the chord-change game) need a real browser to prove. If your effort is set lower, stop and tell Jonathan before doing anything else.

Date written: 2026-11-23, from a read of `origin/main` = `06fd0460f67b595178de12cf92b736bca53bbf66`. Line numbers below are hints from that commit; match on the quoted names, not the numbers. The findings come from `WORKFLOW.md` → "Where things stand" → "Friday check 2026-11-23: open findings" (a Friday-check run, not a script of mine). Counts in it (47 songs, 8 steps) were not re-counted when this was written: re-count your own and say in your report where yours differs.

Repo `CLAUDE.md` applies in full. Read before touching code: skill `in-class-activities` (Part 1, Part 4), `.claude/rules/live-quiz.md` (Part 5), `.claude/rules/code-hygiene.md` (all JS), skill `summer-reset` only if a frozen-module rule blocks Part 2.

## Workspace

**Files this touches**

| Part | Files |
|---|---|
| 1 | `class-activities.js` (the `ca-53` entry only) |
| 2 | `module-3.js`, `module-4.js`, `module-5.js`, `module-9.js`, `module-10.js` (step text and its `_es` twin only) |
| 3 | `app/explore.js`, the `songs:` entries in `module-*.js` (a new `added` field on each), `tools/new-playalong.mjs`, `tools/checks.mjs` (one pin); maybe `app/builtsongs.js` and the console's Import (`teacher-builtsongs.js`) for built songs |
| 4 | `app/shell.js` (`syncExploreNav()`), `app/activities-2.js` (`caSongFullscreen()`, `caToggleFullscreen()`), `tools/smoke.mjs`, `tools/checks.mjs` (one pin) |
| 5 | `live-changes.js`, `tools/live-changes-sim.mjs`; maybe `live-quiz.js` |
| Written last, every part | `CHANGELOG.md`, `WORKFLOW.md`, the version lines in `sw.js` (written by `checks.mjs`) |

1. **Work in your own worktree, not the main folder.** `git fetch`, then `git worktree add .claude/worktrees/wo-friday-findings -b wo/friday-findings origin/main`. Make that folder your working directory (the Stop hook checks the folder you are in) and do all the work there. Another session may be using the main folder: do not edit, stage or commit there.
   - A cloud session is already its own clone: skip this step and steps 2, 7 and 8. Everything else applies.
   - A session that cannot push: stop here and follow skill `session-handoff`.
2. **Check for overlap before you start.** Run `git worktree list`. For every other worktree, look at `git -C <path> status --short` and `git -C <path> diff --name-only origin/main...HEAD`. If one has unpushed work in a file from the table above (the "written last" row does not count), read its diff:
   - Same function, same activity or module data, or the same string keys as this work order → stop and ask Jonathan (AskUserQuestion) which goes first.
   - Different parts of the file → carry on, and name the worktree and the files in your report.
   - `.claude/worktrees/wo-pcsmeasure` (branch `wo/pcsmeasure`) existed on the Mac when this was written. It is about the Power Chord Switch measurement; it should not overlap.
3. **Start every part with `git fetch` and `git rebase origin/main`.**
4. **Ship each part as soon as it is done**, before starting the next. Do not hold finished parts back to push together.
5. **Write the `CHANGELOG.md` entry and the `WORKFLOW.md` entry last**: after the part's final rebase, at the top of each file as it then stands, in the part's last commit. Every session adds to the top of those two files, so an entry written early collides with another session's.
6. **Push as `CLAUDE.md` "Start here" step 8 says**: fetch, rebase if `origin/main` moved, the full `node tools/checks.mjs` on the rebased tip, then `git push origin HEAD:main`. A fast-forward only: no merge commit, no force-push. Conflicts are handled exactly as step 8 says, including when to stop and ask. The change smoke runs from its own detached worktree at the pushed commit (`CLAUDE.md` step 3), not from this one. On the Mac read `uptime` first ("Keep the Mac's load just right"); on Windows or in the cloud skip that.
7. **Files for Jonathan** (screenshots he asked to see) go in the main folder's `Claude outputs/`. The main folder is the first path `git worktree list` prints. That folder is not tracked, so it does not exist in the worktree.
8. **After the last push, clean up.**
   - If the main folder is on `main` and `git status` there shows no changes to tracked files: `git -C <main folder> merge --ff-only origin/main`. Otherwise leave it alone and say so in your report.
   - Confirm `git cherry origin/main wo/friday-findings` prints no `+` lines, then `git worktree remove .claude/worktrees/wo-friday-findings` and `git branch -d wo/friday-findings`.

## What this is for

Jonathan, 2026-11-23, after the Friday check of that day left five small findings open: "fix those findings". He settled the three that were his to decide (below). The other two are code bugs.

1. **Songs → "Date added" must sort by a real date.** Today it sorts exactly like "Title", because no song has an `added` date.
2. **ca-53 must say what its card shows.** The chords step shows the chorus twice (8 bars) but the line still says "the four chorus bars 4 times through", with 4 tap dots. Step 1 says to mute the strings while its ▶ plays a ringing A5.
3. **Lesson steps must stop pointing "below" at things that are now on the right.** The One step view draws a chord chart, figure or Play button to the RIGHT at 1366 wide.
4. **Browser Back out of a full-screen play-along must not leave the page full screen.** A play-along opened by a tap goes full screen (`66b5585`); Back to Songs keeps it full screen with no Exit button (only Esc).
5. **The "Hear the chord change" live game must not count students who never joined.** Every signed-in student page sends a "cc:0/N/0" result, joined or not, so a student who dismissed the invite counts as a 0-point player and lowers the stage's "% caught".

Five parts, five pushes, in order. Ship each one before starting the next. The sixth item in the findings (the `de68fd8` commit shipped `Review: Fast` though it is danger-zone) is a labelling note, already reviewed by the Friday check: do nothing for it.

## Decisions already made (do not re-ask)

| Question | Jonathan's answer (2026-11-23) |
|---|---|
| "Date added" sorts like "Title" because no song has a date. | **Give the songs dates** (do not drop the button). |
| ca-53's line and dots do not match its 8-bar card; step 1's mute line does not match the ringing A5. | **Match the text to the card.** |
| Eight lesson steps say "below" about things now drawn on the right. | **Drop the direction word.** Text only; Module 3 stays frozen (no relabel, no step moves). |
| Anything else? | Nothing else was asked. Parts 4 and 5 are bug fixes with no product choice: decide the method yourself and report it. |

## Rules these decisions reverse

None. Part 2 edits step text in a frozen module (Module 3, `FROZEN_THROUGH`): that is allowed as "text only, no relabel" under "Three regimes" in `CLAUDE.md`. See that part's hard stops.

---

## Part 1 — ca-53: the chords step and the muted step say what the card shows

### What exists

- `class-activities.js`, entry `id: 'ca-53'` ("Strum Pattern — The Chorus"), two steps. Search `Practice — Muted strings` and `Practice — A5, C5, D5`.
- Step 1 `text`: "Mute the strings and strum the chorus pattern 8 times in a row without stopping." Its `strum.bars` is four `A5` bars. `▶ Play strum` sounds a ringing A5 (the comment says `A5 only for ▶ Play strum's sound`); `hideNames: true` hides the chord name.
- Step 2 `text`: "Play the four chorus bars 4 times through, changing chord on the 1, the pattern never stopping." Its `strum.bars` is EIGHT bars (A5 C5 D5 D5, twice; `barsPerRow: 4`, "shown twice", Jonathan 2026-11-17).
- The tap dots read the count from the WHOLE line (`caStepHtml` passes `wholeLine`; check 1bg holds EN = ES). Step text rules for In-Class Activities: ONE sentence, verb first, what to play and the finish line together, one rendered line at 1366×657 in both languages (check 1cs caps the length).

### Build

1. **Step 2:** the line names the 8 bars the card shows. Suggested: "Play all eight bars 4 times through, changing chord on the 1, the pattern never stopping." Keep the count at 4 (dots stay 4) unless you find the count would now be misleading; if you change it, say why. Spanish twin `text_es` in the same edit, reusing its words.
2. **Step 1:** the line must not contradict the ▶. How is your call; the result that must hold: a student who presses ▶ hears a ringing A5 and the line does not tell them to mute while it plays. Suggested: "Press ▶ to hear the pattern, then mute the strings and strum it 8 times in a row without stopping." Keep the count 8. `text_es` the same.
3. `caption` / `caption_es` lines, if they say "four" or "one bar each" in a way that now disagrees, change them with it.

### Guards

- **Unchanged:** the `pattern`, `chords`, `bars`, `bpm: 85` of both steps; the activity id; the card has no strum check and no video (see the comment above the entry).
- Both step renderers read this data (`caStepHtml()` in `app/activities.js`, `renderTeacherActivityDetail()` in `teacher-activities-2.js`); no renderer change is expected.
- Any other direction in ca-53 that names "four" bars: grep the whole entry and its comment block.

### Prove it

- A screenshot of each step at 1366×657, English and Spanish, each looked at: the line is ONE rendered line, the dots match the count.
- The tap-dot count read back from the page (the number of dots) for each step, in both languages. Report "step 1: 8, step 2: 4" or what you chose.
- `node tools/checks.mjs` (1cs, 1bg pass without any edit to the checks).

### Ship

Fast (no trigger: one activity's text). `CHANGELOG.md` entry, student's view ("ca-53's directions now match the card"). Change smoke after the push, `--only activities`.

---

## Part 2 — drop "below" where the chart or Play button is now on the right

### What exists

- The One step view (`11ff03f`, "Look 1, Part 4") marks a lesson step `.step-2col` when it has chord diagrams or a figure and no tab. At 1100 px and wider the directions sit on the left and the figure, the Play button and the diagrams on the RIGHT.
- Friday check's list (hints; re-find by the words, and find the Spanish twins):

| File:line (hint) | What it says | English "below" in that line |
|---|---|---|
| `module-3.js:36` | "Play each chord below." | 1 |
| `module-3.js:305` | "The three charts below have no names." … "Then answer the question below." | 2 |
| `module-4.js:215` | "The two charts below have no names." … "Answer the question below." | 2 |
| `module-4.js:236` | "The chart below has no name." | 1 |
| `module-4.js:711` | "Shapes are pre-loaded below." | 1 |
| `module-5.js:76` | "Press "Hear C major pentatonic" below and compare." | 1 |
| `module-9.js:1055` | "The chart below shows dots on only …" | 1 |
| `module-10.js:358` | `abajo` in "El diagrama de abajo muestra cada dedo." | (Spanish) 1 |

  That is 8 lines. A script over those 8 lines found 11 English "below" and 2 Spanish "abajo" (one of them, `module-10.js:358` "desde la cuerda La hacia abajo", means "downward" and is NOT a direction to the chart: leave it).

### Build

1. For each place, decide by looking at the page at 1366×657 in One step view: if the thing named is drawn to the right (a chart, a diagram, the figure, the Play button), drop the direction word and keep the sentence whole ("Play each chord." / "The three charts have no names." / "Press "Hear C major pentatonic" and compare."). If the thing really is below (a question that still renders under the text), KEEP the word and say so in your report.
2. Do the same in each line's Spanish twin (`text_es`, `_es`): "abajo", "de abajo", "a continuación" where it points at the chart. The existing Spanish is the authority: shorten it, do not rewrite its voice.
3. Each fix is text inside an existing step. Do NOT add, remove, move or rename a step or a section, and do NOT touch a `response` (its prompt or choices).

### Guards

- **Unchanged:** step order, labels, `response` objects, keyed MC prompts and choices (checks 1ap, 1dl), the `gi` numbering, everything in `rule-zero-proof.mjs`.
- Check 1ap pins the English prompt of a keyed MC in Modules 1–3 and the module after the class's position. A "below" inside a keyed MC's `response.prompt` is NOT step text: leave it and list it.

### Hard stops

Stop and ask Jonathan (AskUserQuestion) before going past any of these:

- A "below" that sits inside a keyed MC's prompt or choices in Modules 1–`FROZEN_THROUGH` or the next module.
- Any check (`1ap`, `1dl`, `1w`, the length caps) refusing the edit. Never loosen a check to get green.

Out of scope, list only: other "below" or "above" words in steps that are NOT two-column, and any other direction word ("left", "right", "next to").

### Prove it

- The count of places changed and places kept, with the reason for each kept one (denominator: the 8 lines, 13 words, minus the one `hacia abajo`).
- For each changed step, a 1366×657 screenshot in One step view, English and Spanish, looked at. A short table (step, before, after) in the report.
- `node tools/checks.mjs` passes, including `rule-zero-proof.mjs` (paste its 1dl line, as `CLAUDE.md` "Start here" step 2 says).

### Ship

Fast (text only; no section or step moved). `CHANGELOG.md` entry from the student's view ("a few lesson lines no longer say 'below' about things now beside them"). Change smoke after the push, `--only sets`.

---

## Part 3 — "Date added" gets real dates

### What exists

- `app/explore.js`, the Songs hub list (`songsHub…`): the sort bar `['default', 'title', 'artist', 'added']`, `SORTS.added` and `SONG_ADDED_DEFAULT = '2026-11-20'`. A song's date is `song.added` ('YYYY-MM-DD'); a song without one counts as `SONG_ADDED_DEFAULT`. Nothing sets `added` on any song, so every song ties and the tiebreak (title) decides: the button shows Title order. The i18n keys are `hub.sort.added` ("Date added" / "Fecha de alta").
- The song list is built from `SETS` module 1 songs and `MODULE_SONGS` (defined across `module-2.js` … `module-12.js`), de-duplicated by name (`byName`) into entries with `song.name`, `song.modules`; the student-request row (`request: true`) renders last. Built songs (Firestore, `app/builtsongs.js`) are merged in after sign-in (`builtSongsSync()`).
- `tools/new-playalong.mjs` writes a new song's card, track and pins; `node tools/built-songs-sim.mjs` and `node tools/song-builder-sim.mjs` cover the built-song path.

### Build

1. **Coded songs.** Give every song entry an `added: 'YYYY-MM-DD'`: the date of the commit that FIRST put that song into the data (`git log --diff-filter=A -S"<song name>" --format=%as -- module-*.js`, earliest). A song that moved between modules keeps the first date. Put the date on the entry in the module where it first appears; the hub's de-duplication must keep the earliest `added` if the same song appears twice. Report the script and the count ("N of N coded songs dated").
2. **New songs get a date from now on.** `tools/new-playalong.mjs` writes today's date as `added` on the song it creates. Add a pin in `tools/checks.mjs` that every coded song entry (outside `request: true`) has a valid `added` date; break it in a scratch copy and paste the red line.
3. **Built songs.** A built song must carry an `added` too. How is your call; the result that must hold: a built song imported or published from now on sorts by the day it went live, and a built song that already exists (no date) still works and counts as `SONG_ADDED_DEFAULT`. Read `app/builtsongs.js` and the console's Import / Publish first; `builtSongCheck()` is the validator and must accept the new field.
4. Keep `SONG_ADDED_DEFAULT` as the fallback for the built songs already in the database. Update its comment (the date logic changed: "so only a song added after that date needs it" is no longer the rule for coded songs).
5. The sort's order stays "newest first, then title".

### Guards

- **Unchanged:** the Level, Title and Artist sorts; the Core six card; the student-request row last; every `song.name` and every module's song order; progress keys.
- No new student text is expected. If you add any, it goes in `i18n.js` in `en` and `es`.

### Hard stops

Stop and ask Jonathan (AskUserQuestion) before going past any of these:

- If the `builtSongs/{id}` rules in `firestore.rules` reject an extra `added` field, do NOT edit `firestore.rules` (it needs Jonathan's console paste: check 1dn). Stop, say so, and propose the alternative (for example: read the date from `builtSongsMeta/list`, or accept "built songs sort as `SONG_ADDED_DEFAULT`").
- A change to the built-song FORMAT that would make an older page drop a doc (see how `song.capo` was handled): stop and ask.

Out of scope, list only: re-ordering songs in the Level view; removing the student-request row.

### Prove it

- The script and "N of N coded songs dated", with the earliest and latest date. A pasted list of the 10 newest titles in "Date added" order, from the real page code, and the same list in "Title" order, so it is plain they differ.
- A screenshot of the Songs page at 1366×657 with "Date added" selected, English and Spanish, looked at.
- `node tools/built-songs-sim.mjs` and `node tools/song-builder-sim.mjs` pass; if you touched Import, `node tools/song-files-console-sim.mjs`.
- The pin in `checks.mjs` and its break-it red line.

### Ship

Fast (no trigger; if you must touch `builtSongCheck`, still not a danger-zone file, but report it). `CHANGELOG.md` entry ("The Songs page's Date added button now sorts newest first"). Change smoke after the push, `--only sets,activities` (the Songs hub: read the header of `tools/smoke.mjs` for which area walks it).

---

## Part 4 — Back out of a full-screen play-along leaves full screen

### What exists

- `66b5585`: `caSongFullscreen(a)` in `app/activities-2.js` asks the browser for full screen from the tap that opens a play-along card (called from `caCardMarkOpening`, `songsHubOpenCard`, `caOpenPin`, `caOpenLinkedCard`). It does nothing when `caFullscreenNow()` is already true.
- Leaving full screen is only by the Full screen button (`caToggleFullscreen()`), Esc, or "All activities" (`caCloseOpen()` exits it near line 672). Browser Back from a play-along opened on the Songs page goes to Songs and leaves the page in full screen, with no Exit button (`caFullBtnHtml()` is only on In class).
- `syncExploreNav()` in `app/shell.js` runs whenever an explore page opens or closes. It already knows which page is open (`EXPLORE_PAGES`) and has a comment block on its timing.

### Build

1. When the page now showing is not the In class activities page (or a card is no longer open) and `document.fullscreenElement` is set, call `document.exitFullscreen()` (catch the promise). A suggested home is `syncExploreNav()`; the method is your call.
2. **Do not cancel the card's own entry.** The full-screen request is async: `caSongFullscreen` runs in the tap, before the route changes to the card. A sync that runs during that opening must not exit the full screen the tap just asked for. Test it in a real browser first (the same tap, Songs page → a play-along card; and In class → a card; and Keep practicing pin → a card), then Back, then forward.
3. Add a pin in `tools/checks.mjs` that a play-along tap asks for full screen (`caSongFullscreen` is called from the four places named above) AND that leaving the card page exits it, and make `tools/smoke.mjs` click it: open a play-along from the Songs page (the headless run can use a stubbed `requestFullscreen`/`fullscreenElement` if real full screen is not available; say which), press Back, and assert full screen is off.

### Guards

- **Unchanged:** the Full screen button and its label, Esc, "All activities", the 2× zoom in `ca-full`, the header and menu folding (`ca-fold`), a reload or deep link opening windowed.
- No new student text.

### Hard stops

- `app/save.js` and any `progress/{uid}` write: not touched by this part. Stop and ask if you find you need to.

### Prove it

- A short trace from the real page code (headless Chrome for Testing through `CHROME`, stub Firestore, as `tools/smoke.mjs` does): for each of the three entry paths, `fullscreenElement` set after the tap, cleared after Back. State "3 of 3".
- The planted-fault check: take the exit out in a scratch copy and paste the red smoke line.
- Screenshots at 1366×657 of the Songs page after Back, looked at.

### Ship

Fast (not a danger-zone file; no trigger). `CHANGELOG.md` entry ("Going Back from a full-screen song returns to the normal window"). Run the change smoke after the push, `--only activities` (and `sets` if you touched the Songs path).

---

## Part 5 — "Hear the chord change": only students who joined count

### What exists

- `live-changes.js` (the student side is under the banner `STUDENT SIDE`): `lqCcOnSession()` runs for every snapshot of `liveQuiz/current`; `lqCcSync()` starts a 200 ms timer (`lqCcTick`) while a round is open and this student's result has not gone out; `lqCcSend()` writes `cc:<caught>/<changes>/<extra>` through `lqWriteAnswer()`. The need test is `lqCanPlayHere()` (the page has the live-quiz body) and `!lqCcDone(s)`.
- A student who dismisses the invite (`lqDismissInvite()` in `live-quiz.js`, stored per session in `sessionStorage` `lq-invite-dismissed`) or never presses still sends a "cc:0/N/0" result. The stage totals ({ caught, changes, extra, players }, header comment near line 83) then count them as 0-point players and lower "% caught".
- The clock: `lqCcSkew.min` is the smallest (arrival − stamp) seen. A page that reloads mid-song reads its clock off by the age of the last `cc.clk` stamp (~line 235, `lqCcOnSession`).
- `tools/live-changes-sim.mjs` stubs the timers, so the console's round lifecycle is untested. Checks 1di (Hide names) and 1cm (no names in scores) do not paint the new game yet.

### Build

1. **Join test.** A student who dismissed the invite for this session AND pressed nothing must send nothing, so they add nothing to `players` or to "% caught". A student who joined and pressed nothing still counts (0 caught). How is your call; the result that must hold is exactly that, shown by a case in the sim for each.
2. **Reload mid-song.** Make the clock estimate not worse than the wire allows after a reload: a stale `cc.clk` stamp must not be treated as fresh. How is your call; if the only fix needs a console change (`teacher-*.js`) or a rules change, stop and report instead of widening the part.
3. Add the two missing guard cases if they are cheap: (a) 1di/1cm painting this game's stage, (b) one round's lifecycle on the console side. If either is not cheap, list it under "Out of scope" in your report with what it would take.

### Guards

- **Unchanged:** the scoring (a press counts from 0 to 0.5 s after the change, plus 0.1 s timing error; points 1000 × (caught − extra) / changes), the answer format `cc:<caught>/<changes>/<extra>`, "Nothing on the stage may reveal the answer before the reveal", `lqCcReset()` on sign-out, no name, uid or email in any score.
- The read-back after a reload (`lqRestoreMyAnswer`) still shows a student their own result.

### Hard stops

Stop and ask Jonathan (AskUserQuestion) before going past any of these:

- `firestore.rules` (check 1dn: it needs his console paste) or `teacherWriteConfig()` / `config/class` writers.
- Any change to how a score is calculated or what the stage shows before the reveal.

### Prove it

- `node tools/live-changes-sim.mjs` and `node tools/live-quiz-loop.mjs` pass (the second ends with its rules; if it exits 1 replay with `--case=<name> --verbose`). Paste both summary lines with their counts.
- The new sim cases: "dismissed, no press → 0 results sent", "joined, no press → 1 result with 0 caught", "reload mid-song → clock error ≤ N ms" (report the number you measured before and after).
- Break it: put the old unconditional send back in a scratch copy and paste the red sim line.

### Ship

Fast (the live games' student side is not a danger-zone file; if you change `lqWriteAnswer`, `live-quiz.js` scoring or the saved answer, stop: that is a trigger). `CHANGELOG.md` entry from the student's or teacher's view ("a student who skips 'Hear the chord change' no longer lowers the class's % caught"). Change smoke after the push, `--only games`.

---

## Report back

- Which worktree you worked in, what you rebased onto, and every pushed commit hash (one per part).
- Anything the overlap check found, and what you did about it.
- Part 1: the new line, the dot counts, the screenshots seen, in both languages.
- Part 2: places changed and places kept, with the reason for each kept one; the 1dl line from `rule-zero-proof.mjs`.
- Part 3: the script and "N of N songs dated", the newest-ten list, how built songs get a date, anything you stopped on about `firestore.rules`.
- Part 4: "3 of 3" entry paths exit full screen on Back; the planted-fault red line.
- Part 5: both tools' summary lines, the measured clock error before and after, what you left out and why.
- Each change smoke result for the pushed commit (area, pass or fail, any new error).
- Every place you had to interpret this work order, and how you read it.
- Anything you stopped on.
- Whether the main folder was brought up to date and the worktree removed.
