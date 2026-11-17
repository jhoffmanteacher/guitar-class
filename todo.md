# To do

Things to do at some point. Not scheduled. What is open right now lives in
`WORKFLOW.md` → "Where things stand".

Cleaned 2026-11-16 (Jonathan: "clean up todo and remove everything we have already done"). The file as it was,
with the full record of the 2026-11-11 cut and its plan: `git show 386d063:todo.md`.

## For Jonathan (written 2026-11-17; delete a line when it is done)

**Listen and look (a few minutes each, any class Chromebook or the Mac):**
1. **"the cure", set the beat by ear.** Open the site with `?snipcal=1&mapshift=0#class-activities/ca-13` on the
   end of the address, Metronome on. Play it as it opens, then Guitar off, then Normal speed: all four should feel
   the same now. Then try `&mapshift=20` and `&mapshift=40` in place of `&mapshift=0`. Tell Claude the number where
   the highlight lands ON the beat.
2. **"the cure", bar 85 (the Outro).** The audit says the record plays about 118 ms early there. Does it look off?
3. **Lyric sheets (Sweet Child O' Mine, ca-45).** The sheet now scrolls 0.3 s ahead so a new line is on screen
   before its first chord (Windows, 2026-11-17). Too early, too late, or fine?
4. **Play Along highlights are ON the beat since 2026-11-17** (your call: "exactly on the beat and not ahead of it
   for everything"). "On the beat" rests on a guess of 80 ms for a Chromebook's speakers: if highlights look late
   or early on a class Chromebook, try `?snipcal=1&lat=40` or `&lat=120` and say which looks right.

**Decide (tell Claude; each is one sentence):**
Decided 2026-11-17: old mic recordings that still hold a name are ignored for now; the sign-in load fix gets NO
second line after a student's first change.
6. **Friday: which of this week's changes get a Fable review**, and say when the weekly limit has reset (every agent
   is on Opus until then). The list is at the top of WORKFLOW.
7. **On hold until you say go:** the design-values tidy (W15). (You released the "never" blocks, W12, on 2026-11-17:
   Windows is building it.)

**Only you can do:**
9. **The class-rank rules paste (Paste F).** NOT ready yet: Claude will say "W13 ready: paste <file>". Then Firebase
   console → Firestore → Rules → replace all → Publish.
10. **The practice copy's key:** `Claude outputs/practice-copy/JONATHAN-STEPS.md` (GitHub secret
    `FIREBASE_PRACTICE_SA`). Until then the practice copy is not published.
11. **Song builder: build and publish one real song** (WORKFLOW, "Song builder Part d"). Part e waits for that.
12. **Private song audio, step 2:** upload the songs in Manage → Song files; then Claude switches the 18 card files.
13. **A 30-minute mic test on one class Chromebook** with `mic-check.html` (does ChromeOS force its automatic volume
    on?), and tell Claude what it shows.
14. **Strum check takes from a Chromebook** (ca-46, its eight-bar step): one right, one with a wrong chord, one with
    an extra strum on the rest; then download takes and tell Claude.
15. **Ask the principal about recording in class** (Ed Code 51512; Claude can draft the one page).
16. **Be present for the `coach-core.js` split.** It is 46 lines under the limit that blocks a push.
17. Optional: try 2 to 4 clip-on pickups; delete old `ci-try/*` and `win/*` branches on GitHub.

## Beat maps: make every Play Along song light the same amount before the beat

Added 2026-11-16 (Jonathan: "we'll have to fix the beat map in the future"). Not started.

- **What is true today.** Since 2026-11-16 every Play Along card lights each highlight 60 ms before the beat is
  HEARD (`PC_LEAD` in `app/cards.js`; his choice; `?snipcal=1&lead=<ms>` tries another value). The PAGE is now the
  same on every card. The songs are not: each track's beat map (`anchor`, `barTimes` in `SNIPPET_TRACKS`) sits a
  fixed amount early or late against the sound, so the real lead is 60 ms plus that track's offset.
- **Measured 2026-11-16** (`python3 tools/beat-audit.py`, all 14 tracks, 452 s; positive = the map is early, so the
  highlight comes that much sooner; the numbers in a cell are that track's files; nothing was fixed):

  | Track | Offset, ms | Bar-to-bar scatter, ms |
  |---|---|---|
  | the cure, guitar off | +57 / +61 | 7 to 13 |
  | the cure, full | +38 / +18 | 7 to 13 |
  | Luna | +34 / +11 | 12 to 21 |
  | Watchtower | +24 / +25 | 11 to 14 |
  | Neil | +18 / +20 | 10 to 15 |
  | Seven Nation Army | +19 / +13 / +18 / −11 | 11 to 12 |
  | Perdón Mamá | +8 / +3 | 2 to 3 |
  | Sweet Child O' Mine | +4 / −8 | 9 to 10 |
  | Vuelve a la Vida | −3 / −13 | 6 to 9 |
  | Las Mañanitas | −9 / −22 | 23 to 26 (worst bar −479, slow file, bar 42) |
  | Smells Like Teen Spirit | −14 / −22 | 3 to 5 |
  | Madrecita Querida, G | −18 / −29 | 23 to 35 (worst −283) |
  | Madrecita Querida, F | −11 / −28 | 30 to 34 (worst +180 / −211) |
  | Arsenal | −23 / −27 | 2 |
  | Ella Baila Sola | −34 / −45 | 8 to 11 |

  The names are the builder's short labels for the tracks: match each to its slug in `SNIPPET_TRACKS` before
  editing. The tool reads ffmpeg's decode; a browser's mp3 start trim is not modelled, so check one track by ear
  before trusting a number.
- **DONE 2026-11-17 for "the cure" only: fault 2 below, and the files' gaps from each other.** Its four files now
  share one map through `fileOffset` in `SNIPPET_TRACKS` (rhythm-down 144 +25.1 ms, rhythm-down 120 +23.6 ms, slow
  full −26.4 ms; `anchor` 0.565 is on the fast full mix). Jonathan chose it, reversing "never a second anchor" for
  this track. The files agree within 0 to 2 ms (were 25 to 50). NOT done for the cure: the whole map is still about
  +32 to +44 ms early by the audit (a second method read 19 to 35 ms less: "cannot tell"), so the number is his to
  set by ear with `?snipcal=1&mapshift=<ms>` on ca-13; it then goes into `anchor`, and into `data-click-anchor` on
  `tabs/the-cure.html`. New audit line to listen to: bar 85 of the Outro, the record about 118 ms early on all four
  files. The cure's numbers in the table above are from BEFORE this change.
- **Three separate faults in that table:**
  1. A fixed offset per track (the whole map early or late): move the map, one number per file.
  2. "the cure" with Guitar off: its rhythm-down files play 25 ms (144 BPM) and 51 ms (120 BPM) after their full
     mixes, so every highlight is that much MORE early with Guitar off (ca-13, 18, 19, 24, 30, 44).
  3. Bars that are not steady: Luna bar 10 plays about 64 ms early on the record (ca-20, ca-27, ca-32); Las
     Mañanitas (ca-35) and Madrecita Querida in both keys (ca-36) scatter 23 to 35 ms with single bars far off.
- **Do, in this order:** (1) the fixed offsets, biggest first (the cure, Ella Baila Sola, Luna); (2) the cure's
  Guitar-off files; (3) the unsteady bars. Luna is a Core song: its bar 10 needs Jonathan's ear
  (`?snipcal=1`). The Choice songs get the light pass the skill describes.
- **Rules that apply:** skill `audio-and-snippets` (snippet windows are bars, never seconds; never measure a second
  anchor; never pitch-correct one mix alone; never re-level the cure) and skill `song-facts`. After each track:
  `python3 tools/beat-audit.py --only <slug>` and `node tools/playalong-loop.mjs --only <id>`; report both summary
  lines. `node tools/playalong-loop.mjs --leads` measures the page's lead (it must stay 60.0 ms). A CHANGELOG
  entry: students see it. The Mac only (audio files, headless Chrome).
- **Leave alone:** `PC_LEAD`, the metronome click (it lands on the heard beat), and the step snippets' bar dots
  (they light on the heard beat; Jonathan, 2026-11-16: leave them).

## The big parts

Three of the four parts that were over 2,000 lines were split on 2026-11-16 (`teacher-activities.js`,
`coach-runner.js`, `coach-chords.js`). Left:

- **`coach-core.js`: 2,554 lines on 2026-11-16, 46 under the 2,600 limit that blocks a push (`checks.mjs` 1cv).**
  Only with Jonathan present: it is the listening code. Mic recordings (`micRec*`) are the obvious section to move;
  the detectors, `coachDetectPitch` and every line `tools/mic-sim/` reads stay put. Until then add nothing to it.
  How: move the banner section, whole and unchanged, into a new part loaded right after it; list the file in
  `COACH_JS_PARTS` (`app/boot.js`) and `sw.js` ASSETS; prove with `node tools/golden.mjs` before and after
  (`--compare` identical), `node tools/slow-load.mjs`, `tools/old-page-loop.mjs`, the full `node tools/checks.mjs`
  and the three mic-sim commands in `CLAUDE.md`. It touches load order: Always Reviewed. Check `tools/mic-sim/`
  and `checks.mjs` for text they pin in the section before moving it.
- **Remove the 2026-11-16 split bridge on or after 2026-12-01** (also on the Windows list, W14). A page opened
  before the two coach splits keeps the old 8-name `COACH_JS_PARTS` and never asks for `coach-chordcards.js` or
  `coach-noterunner.js`. The bridge: the 15-line block at the end of `coach-chords.js` and of `coach-runner.js`,
  and the `typeof` guards kept as a second net (`cbStop` / `nrStop` / `cdStop` in `gamesStopMic`; the Chord Blitz,
  Note Runner, Finger Gym and Chord Detective chips in `gamesRenderHub`, `coach-hub.js`; `typeof nr` in
  `gamesHideStop` and `coachReleaseMicIfIdle`, `coach-core.js`). `grep -n "DELIBERATE BRIDGE" coach-*.js` finds
  the comment over each (5). Remove them all in one commit, put each guarded line back as it was before the bridge
  (the parent of the commit "Arcade: a page opened before the coach splits loads the two new parts itself"), and
  keep the `checks.mjs` pin on the part order.

## Small things, none urgent

- **Two tools have hung with their work finished or idle, cause unknown.** A `golden.mjs --compare` printed its
  result and never exited (2026-11-11, 39 minutes, 0% CPU; run again it took 0.7 s). The pre-push hook's
  `checks.mjs --check --skip-links` sat at 0% CPU for over 5 minutes during a branch push (2026-11-16; the Mac's
  load was about 10; run by hand it finished). Until understood, give either a time limit when it runs in a chain
  (`perl -e 'alarm 300; exec @ARGV' node tools/…`).
- **Comments that still say `app.js` / `coach.js` / `teacher.js`** as a place to look (about 850 mentions; the 40
  most misleading are in `index.html`, `sw.js`, `tuner.js`, `guitar-diagrams.js`, `config-main.js`,
  `tabs/journey.js`, `live-quiz.js`, `fab-tools.js`). CLAUDE.md says the old names are logical names, so this is
  tidying, not a hazard. `sw.js` says the shell is 16 requests; it is 30.

## The clean-ups after the cut (Phase 2; not started)

The cut of `app.js`, `coach.js` and `teacher.js` into parts went live 2026-11-11 (`WORKFLOW.md` → "Recently
shipped" → 2026-11-11; CLAUDE.md → "Where the code lives"). What was planned next and never started, each one
commit, each proved with a golden snapshot before and after:

- 2a declarations next to their feature, and the switched-off code in one labelled file;
- 2b one shared "step plan" for the two step renderers (each keeps its own markup), and check 1v rewritten to
  execute;
- 2c break up `buildLesson`;
- 2d break up `showTeacherApp` and `renderTeacherActivities`;
- 2e (optional, Jonathan's call) move dated history comments out of the code: comments were 43% of `app.js`'s
  bytes.

**Do not refactor:** inline `onclick` handlers and HTML-by-strings (golden freezes the attribute text); the
top-level state `let`s; `coachDetectPitch`, the mic filters, `ccLoop`, anything in `coach-core.js`; the bodies of
the save path and `teacherWriteConfig`; `firestore.rules`, document shapes, storage keys, module and activity
data, `i18n.js`; the files the standalone pages load and those pages; `practice-minutes.js`, `live-quiz.js`,
`fab-tools.js`, `tuner.js`, `guitar-diagrams.js`, `trainer-*.js`; `styles.css`; `sw.js` logic.

**Know before starting:** 44 of the 110 `checks.mjs` sections counted on 2026-11-11 read the TEXT of the code, so
they fail when code only moves. Each may be updated in the same change as the code it reads, and every such update
is listed for Jonathan in that change's report (his decision, 2026-11-11; the list of the 44 is in
`git show 386d063:todo.md`). The golden tool does not record everything: read the "not covered" list each run
prints.
