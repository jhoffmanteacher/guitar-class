# WORKFLOW: "Where things stand", 2026-11-11 to 2026-11-17 (moved here, unchanged)

Moved out of WORKFLOW.md on 2026-11-17 (Jonathan: "trim workflow"). It is the record of the week: every Windows job
(W1 to W23) with its proofs and reviews, the Song builder parts, the strum check's measured limits, the rules pastes,
the private song audio steps, the beat-map work. Nothing here is an open job unless WORKFLOW.md's current block names
it. Search it before re-deriving a fact or re-proposing a measured, stopped idea.


Start here. Update this block whenever an item opens or closes; each line says where the detail is.

**Jonathan published his first built song, American Girl, on 2026-11-17 (the Song builder, Publish).** CHANGELOG
entry added the same day. Part e of the builder: only when he asks. He asked the same day whether a song can
offer both tab and a lyrics / chord chart: answered (coded songs do it as separate cards; a built song holds
chords and lyric lines only, no tab); nothing built.

**The Mac session was paused at the lid close and RESUMED at 3:49 PM (2026-11-17). The pick-up list, with what is
done since:**
1. **The one long column for lyric sheets is ON MAIN (2026-11-17, Fast; resumed at 3:49 PM).** ca-45 and ca-38 read as
   one column; the lead looked at the old column change on ca-45. `app/cards.js` is now 2,060 lines, over the 2,000
   warning (1cv): split it at a quiet moment, never inside something Jonathan asked for.
2. **The 7 songs play from the private store: ON MAIN 2026-11-17, after school, on Jonathan's word ("do after school
   update"), `Review: Fast`.** The 18 paths are `private:<id>`, the 18 public files are gone from `audio/` and
   `AUDIO_HASHES`. Passed before the push: full `checks.mjs`, `song-files-sim` 121 of 121, `song-files-console-sim`
   115 of 115, `kill-switch/proof` 14 of 14, the full `playalong-loop` (26 cards, 480 walks, 0 mismatches, "18
   private track files stand in"). NOT run before the push, by his go-ahead: an Opus review (the Friday check
   reads it, or he names it) and `update-reload-loop` (GitHub runs it when `sw.js` changes: read that run). To
   undo: revert the switch commit (files, paths and flags come back together). First class to meet it: 2026-11-18;
   each Chromebook downloads a song once ("Loading the song…").
3. **The Chords / Tab switch: ON MAIN (`c83bcf7d`, Windows, Reviewed; see W23 DONE for 5 questions)** (`feat/card-views`, `464d4a2`: the WIP and the builder's
   notes in `docs/wip/card-views-notes.md` on that branch).
4. **For whoever edited ca-53 today (`d2a676c`):** GitHub's "smoke activities (English)" is red since then; the
   failing line, seen by a Mac builder: `[strum:ca-53 step 1 en] strum: chord names [], not ["A5","A5","A5","A5"]`:
   the smoke's expectation for ca-53 step 1 was not updated with the card. **FIXED by Windows (`e2a2aee1`): the
   smoke expects no names on a `hideNames` strum; "smoke activities (English)" is green again on `e62a3d20`.**
5. **From Windows (17:20): GitHub's `update-reload-loop` is RED since the private-store switch.** It passed on
   `ead475ff`, then failed on `da4cecea` and again on `e62a3d20`. Both times it was 28 of 29 cases and 346 of 347
   checks: `✗ busy-card: #class-activities/ca-35, card open, scrolled 456 of 1303px · ran: CDP Runtime.evaluate gave
   no answer in 20000 ms`. The page stopped answering with a practice card open while the update landed. That may be
   a hang on the private-song load (first class to meet it: 2026-11-18), or it may be a flake; it is not known yet.
   **FIXED by the Mac (`6936038`): a fault in the TEST, not the site.** The page answered every 2 s probe in 1 to 9
   ms; the tool's own busy-card wait (up to 20 s for the track in the audio cache, which a private song never enters)
   ran out at the same 20000 ms limit. busy-card now plays a private song through a stand-in; full run 29 of 29.
   Windows: nothing to re-run.
   - **Windows, 18:40: it is the TEST, not the site (not proven in a real class).** It fails the same way on Windows
     (28 of 29). busy-card picks the first practice card that has a Play button and scrolls more than 300 px. That is
     ca-35, Las Mañanitas, and its track is now `private:` (`app/snippets.js:415`). `BUSY.card.on` then waits up to
     20 s for the song to reach the public audio cache. A private song never goes there, and the fake world serves no
     `songFiles`, so CDP's 20 s limit trips first.
   - **Windows tried skipping `private:` cards** in `placeDeepLink(true)`. Then NO card qualifies: every public,
     non-sheet card scrolls 0 to 122 px; the tool tried 16. The edit was reverted, nothing pushed.
   - **For the Mac (a choice in the test, so not made unattended):** (a) give the fake world `songFiles` so a
     private song can play, and hold busy-card on a private card. This tests what students meet tomorrow; the hold
     would then be `pcState` with the song in IndexedDB. Or (b) lower the scroll bar for busy-card only and pick a
     public card. (a) is better.
   - What a private song does to a real update mid-song is untested until then.
The state at the pause, kept as the record: Everything shipped is on main and confirmed live through `b1fb3a5` (the lyric sheet
at the top, highlights on the beat); the later pushes are notes only. Nothing is half-pushed.
- **Two builders stopped cleanly; both branches are on GitHub as backups, both end in a commit that starts "WIP, not
  verified:", and their notes are copied to `Claude outputs/pause-2026-11-17/` on the Mac** (read "WHERE I STOPPED"
  at the end of each; it gives the exact next command).
  - `feat/sheet-one-column`, `666e6c1` (worktree `.claude/worktrees/sheet-scroll`). The sheet's highlight "behind" the
    strip (ca-45): measured, the strip's cell, the dot and the chord mark light in the SAME frame (0 frames, ca-38 /
    44 / 45); what Jonathan sees is MOTION: at a new line the scroll started on that line's first beat, so the dot
    rode up the screen for 7 to 8 frames (worst 10). Fix, built, NOT proved: the scroll happens 0.3 s BEFORE the next
    line, so the new line is still on its first beat; Play, a section button or a chord tap puts the line at the top
    during the count-in; the dot keeps its fill length with reduce motion (a site-wide rule in `styles.css` about
    line 3061 cut it to 1 frame). Two things it changes that he has not seen: the line just played stays at the top
    (one line less of what is coming), and the card's controls scroll out of view at Play (Stop stays in the bar).
    Open: 1 of 8 lines on ca-44 at Normal still moves for 3 frames (4, 2, 1 px), cause not found. Not run: the
    updated smoke check and its red-on-main proof, `playalong-loop --only ca-45`, `checks.mjs`. The ONE-COLUMN sheet
    is planned in the notes and not started.
  - `feat/card-views`, `80ce200` (worktree `.claude/worktrees/card-views`). The Chords / Tab switch. Inventory (26
    cards): Sweet Child (ca-28 tab, ca-33 chords, ca-45 lyrics; 12 sections), "the cure" (ca-24, ca-30, ca-44; 10)
    and Luna (ca-27, ca-32; 5) line up section for section with no new music; Watchtower lines up too but already
    has the Jimi / Neil switch (two switches together: not designed). Built on the pilot ca-33: `card.otherViews` =
    `{ tab?, chords?, lyrics? }`, filled at the end of `class-activities.js` from the song's other cards; a new part
    `app/cards-views.js`; the choice kept in `localStorage.caCardViews`, never in `progress/{uid}`; Acordes / Tab /
    Letra; check 1eq; a mid-song switch walk (R17) in playalong-loop. Proved: `playalong-loop --only ca-33`, all 3
    views, 24 walks, 0 mismatches. NOT proved: R17 (red 6 of 6 from a bug in its own judge; fixed, not re-run, and
    its failures do not set the exit code yet), 1eq after its fix. Not started: screenshots, the console's detail
    page, break-its, `slow-load.mjs`, the full playalong run, the smoke walk, final checks.
- **Not started:** private song audio step 2a (the queued line below). The 18 files are copied for him in
  `Claude outputs/private-songs-to-upload-2026-11-17/` (exact copies; he does not upload until told).
- **Red on GitHub, not the Mac's:** "Browser tests → smoke activities (English)" has failed on main since `d2a676c`
  (the ca-53 edit of 2026-11-17 by another session); a builder saw one error in the strum check on ca-52 in that
  walk. Whoever made the ca-52 / ca-53 edits owns it; until it is green a new activities fault hides behind it.
- **Merged local branches and worktrees that can go** (after `git cherry origin/main <branch>` shows no `+`):
  `fix/load-retry`, `ship/load-retry`, `fix/take-no-name`, `feat/highlight-timing`, `feat/lead-zero`,
  `feat/sheet-scroll-top`, `fix/cure-beat-map`, `mac/close-rankboard`, and the review worktrees `review-cure`,
  `review-rankboard`, `ship-lr`. Delete nothing without checking; never delete a remote branch.

**THE MAC'S OWN LIST, 2026-11-17 (delete each line when it is no longer news):**
- **Private song audio: step 1 of 3 is on main (2026-11-17, `Review: Reviewed`, `site-reviewer` on Opus, 1 round,
  clean).** The 18 recordings are on `SONG_FILES` with `"awaitingSwitch": true`; every card still plays its public
  copy; check 1dz allows that state only while `audio/<file>` matches byte for byte. Manage → Song files opens from
  the start, its buttons are outlined, the paste-2 warning is replaced. **Step 2 is Jonathan's: drop the 18 files
  (`Claude outputs/private-songs-to-upload-2026-11-17/`), then Verify all.** Step 3 (the switch,
  `node tools/song-files.mjs --switch <id>`, `docs/private-audio-step2.md`) ONLY after he says Verify all is green:
  NO check stops a switch pushed before the upload (the reviewer looked for one), so the order is the lead's to
  keep. The 8 Watchtower files are not listed (no private player on the Journey page).
- **IN FLIGHT: a Chords / Tab switch on one practice card** (Jonathan, 2026-11-17: "chords/tab switch"). Branch
  `feat/card-views` (worktree `card-views`), one Opus builder: inventory, design, a pilot on one song. Nothing existing
  is merged or removed.
- **IN FLIGHT: two-column lyric sheets shown as ONE long column** (Jonathan, 2026-11-17: "you could cut the pdf in
  half and just keep scrolling so it doesn't have columns"). ca-45 and ca-38; display only; the column-change jump
  goes. Branch `feat/sheet-one-column` (worktree `sheet-scroll`), the same Opus builder. Tell him when it is live.
- **On main since 2026-11-17 (Fast): the lyric sheet keeps the playing line at the top** (12 px under the "This bar"
  strip, one scroll per line; a column change is one instant jump 0.1 s before column 2's first chord; the first line
  after Play stays low; Jonathan asked for it twice and may still want the column jump earlier), **Play Along
  highlights ON the heard beat** (`PC_LEAD` 0, his call the same day, reversing his 60 ms of 2026-11-16), and **the
  "This bar" strip never blank** (the bar is taken from the beat, as `pcLocate` does; the play-along tool's KNOWN
  entries `sheetLapBoundary` and `sheetPastEnd` are gone: 480 walks, 0 mismatches, 0 known). Windows: W17 may start.
- **load-retry is on main (2026-11-17, the Mac; `Review: Reviewed`, `site-reviewer-deep`, 2 rounds: Fable, then Opus;
  round 2 clean).** After a failed sign-in read the page keeps retrying and says so (`save.notLoaded`, one line at
  1366×657 in English and Spanish, screenshots taken). Windows: W19 (its test gaps) may start. Not built, by his
  choice: a second line after a student's first change.

**THIS WEEK ONLY: every agent runs on Opus, reviewers included (Jonathan, 2026-11-16: "heavy fable use this morning
ran up my total. we can run opusplan stuff").** The Mac and Windows both: pass `model: 'opus'` on every spawn, builders
at high effort and `site-reviewer` / `site-reviewer-deep` at high too, and a cloud routine's model is Opus. The Fable
pins in the agent files and CLAUDE.md are NOT changed. No Fable review runs unless he asks for it by name: he will
say at the end of the week which changes get one, depending on the tokens left (same day: "i'll specify fable reviews
at the end of the week depending on tokens"). So keep a list here of what shipped this week on an Opus review or
Fast, for him to pick from. So far: no name on a mic take (`3792deb`, `e25f0d5`; Fast, then an
Opus review in the cloud, routine `trig_01Fkh59ZFbHnMUm6gGhntoor`); Play Along highlight timing (`b607794`, `386d063`;
Fast, then W16 below); the sign-in load fix (branch `fix/load-retry`, not shipped; round 1 was the one Fable review,
routine `trig_01Bpx4H1QQDAbyEtf2bqGDAi`). Delete this block when he says the weekly limit has reset. A lead session on Fable is his to switch (`/model`).
Added 2026-11-17 (Jonathan), a standing rule, not this week only: Sonnet for the simple, tool-proved parts
(CLAUDE.md, "Sonnet for the simple parts"); reviews and anything with a choice in it stay on Opus.

**FIXED 2026-11-16 by Windows (Fast; one Opus agent): the "Sweet Child O' Mine — Lyrics and Chords" activity (`ca-45`)
not scrolling properly in full-screen mode.** Reproduced in headless Chrome with real full screen entered through the
bar's own button. It was every lyric sheet (`ca-45`, `ca-44` "the cure", `ca-38`), not ca-45's shape, and only in
full screen; normal size was exact at 1366×657 and at 2560×1300. Three causes, all fixed:
- Each auto-scroll in full screen went 1.37 times too far: `pcFollow` (`app/cards.js`) measured with
  `getBoundingClientRect`, which includes the full-screen zoom on `.main`
  (`body.ca-full:has(...) .app-layout .main{zoom:var(--ca-zoom,1)}`), then scrolled in `.main`'s unzoomed pixels. It
  now scrolls `delta / zoom`, zoom measured as the box's `getBoundingClientRect().height / offsetHeight`. Scrolls
  landing more than 2 px from where the follow aimed, full screen, before → after: ca-45 44 of 44 → 0 at 1366×768
  (worst 247 px), 47 of 47 → 0 at 2560×1300; ca-44 39 of 40 → 0; ca-38 28 of 28 → 0. The tab cards share
  `pcFollow` and get the fix.
- Pressing Full screen mid-song threw the sheet back to the top (Chrome resets `.main`'s scrollTop when full screen
  opens) and the follow only re-ran on a new line: `pcRefollow` on `fullscreenchange` and `resize` now makes the
  next beat bring the line back.
- Found on the way, at every size, on a device with "reduce motion" on: the rule `*{transition-duration:0.01ms}`
  made the sheet line's move a transition, so the follow read the previous line's place and ran one line late (the
  lit chord off screen for 86 of 152 chords at 1366×657): `.pc-sheet-line{transition:none !important}`.
`tools/smoke.mjs` has a new `sheetFollowWalk` (every sheet card at 1366 and 2560, normal and full screen through the
real button; red on 6 of 6 full-screen views on the old code); it does not cover the refollow after entering full
screen mid-song. `playalong-loop --only ca-45` and `--only ca-44`: 0 mismatches. The lead looked at the before and
after pictures at 1366×768 full screen. Nothing was needed in `app/activities-2.js`. Not checked: a real Chromebook
or the classroom display itself (headless Chrome only): Jonathan's next class will show it.

**Song builder Part d SHIPPED 2026-11-16 evening (the Mac), labelled `Review: Fast` on Jonathan's word ("that is me only
so let's try it and review on friday").** Preview, Publish, Edit, Unpublish, Delete, Export, the backup. Three review
rounds ran before it (round 1: 2 MAJOR; round 2: 2 MAJOR; round 3: 1 MAJOR, 6 MINOR; every finding fixed, the round 3
fixes were NOT re-reviewed: the Friday check reads the whole of it). `song-builder-sim` 152 of 152; the builder's
browser walk 67 of 67; a normal song is 22 presses from "+ New song" to Published. Accepted limits: two console tabs
acting at the same instant (Publish against Delete…, Import against Unpublish) can leave a listed song with no audio or
no doc (students skip it or its audio does not load; 3 of 60 and 2 of 60 schedules); R1-5 and R1-7. The bar-count
warning stays quiet when the recording is exactly one bar longer than the chart (the last chord ringing out). Next:
Jonathan builds and publishes one real song; then Part e, only when he asks. If he sends an mp3 for the Claude way:
skill `new-playalong`, 192k.
**GitHub's "Site checks" is green again (2026-11-16, `190586d`).** It had been red since Part b: check 1en ran
`tools/song-builder-sim.mjs`, whose fixed wait was too short on a faster machine (the Windows computer and GitHub's
Linux; the Mac happened to be slow enough). The Windows session fixed the wait; nothing in the builder changed.
**Done on the Mac 2026-11-16:** `teacher-activities.js` split in two (`teacher-activities-2.js`, 1,301 and 1,108
lines; proof in its commit: the console golden snapshot identical before and after, 177 of 177 files). So the
Windows list's "NOT `teacher-activities.js`" is settled. What the Mac did about the open question in the Windows
note (`todo.md`: "only once golden is cleared"; the list: `slow-load.mjs` only): both. `golden.mjs` was rebuilt and
took three review rounds after `todo.md`'s line was written (2026-11-13), and `--only console` took 3.5 minutes a
run; whether that counts as "cleared" for the two coach splits is still Jonathan's to say.
**The Beat step's tracker is fixed (2026-11-15, the evening session; entry "The Beat step's tracker" under "Song
builder" below has the numbers).** It follows American Girl beat for beat (0 of 397 beats over 100 ms from Moises's;
before: 371). **Decided by Jonathan, 2026-11-15 (asked with the numbers):** a record that needs more than 8 pins
(`SB_PINS_MAX`) is sent to Claude ("Send to Claude": steady records need 2 or 3, every record played without a click
needs 16 to 26, so American Girl and every rock record go to Claude; he chose this over letting the builder set the
pins itself, because the tracker still loses the beat without knowing it on some records). And the line only SAYS
so: it does not block publishing ("Warn only"; the count can be a false alarm, as on "the cure"). Do not build
auto-pinning unless he asks.
THE RULER (on the Mac only, never in a test or the repo): `~/Downloads/American Girl-D-114bpm-440hz.mp3` (the
original 1976 recording, 3:33) and Moises's beats for it, `~/Downloads/American Girl-D-114bpm-440hz metronome only.mp3`
(397 clicks, 0.092 to 208.010 s; Jonathan: the first click is the very start of the song = bar 1). The scripts that
measure with it (no audio in them) are in `Claude outputs/beat-ruler/` with a README: run `ruler2.mjs` after any
change to the tracker and report its three lines.
**For Part c and after (Jonathan, 2026-11-15): "the app should allow me to upload chord charts, etc. as other things
are being worked on like levels, in order to be more efficient. and/or to let me put all the files in the initial
upload".** So: the first step takes the chord chart (and anything else the later steps need) together with the mp3,
and/or the Chart step is open while the copy is being levelled (about 48 s for a 3:30 song) instead of waiting for
it. Build it with Part c's Chart step; it is not in the work order, which was written before he asked.
Agents: Opus or Fable by the need, as for the Windows block below. The Windows computer works
the list in the next block at the same time: stay out of those files; fetch and rebase before every push. If Jonathan
sends an mp3 for a first real song: skill `new-playalong`, 192k. Delete this block when Part d is pushed and Jonathan
has published one song.

**The three Strum check takes are in the repo (2026-11-16, the Mac): `tools/mic-sim/strum-takes/`** (J01 to J03,
`key.json`, a README with the command and the Mac's summary lines; 3.39 MB). `key.json` was written again from
DETAILS section 20 (the 2026-11-14 file was not kept): J01 bar 4's chord wrong, J02 bar 7 left out, J03 nothing.
The Windows session deletes this line once its replay matches the README.

**For the Mac: the rest of the Windows list (handed over 2026-11-16 by the Windows session; Jonathan: "assign
whatever you haven't done to the mac". He says "do the handed-over work in WORKFLOW").** In this order; each ships
before the next; agents Opus or Fable by the need (Opus at xhigh is allowed where a finding is in dispute). Branches
named `win/…` are on GitHub (`git fetch`); cherry-pick from them, do not merge them.
**MORE FOR WINDOWS, 3 (the Mac, 2026-11-16 20:30; Jonathan: "send the due on a date, small to windows along with
any of the 1-5 that you want to").** From the check of the 2026-11-13 improvements list against what was built.
Unattended, Opus agents, each in its own worktree, as in block 2 below; after W6 to W10. Fetch and rebase before every
push. **The Mac is building three of the five right now: stay out of `app/save.js`, `app/boot.js`, `app/start.js`,
`tools/save-loop.mjs`, `tools/shared-chromebook-loop.mjs` (the failed load at sign-in, `fix/load-retry`),
`app/cards.js`, `app/snippets.js`, `tools/playalong-loop.mjs` (Play Along highlight timing, `feat/highlight-timing`),
and `coach-core.js`'s `micRec*`, `teacher-mic.js` (no name stored on a take, `fix/take-no-name`).**
- **W11. Reading text 15px → 16px, lessons first (Jonathan's P6, 2026-11-13: yes). Fast. It stays with Windows: not
  for the cloud, not for the Mac (Jonathan, 2026-11-16: "windows will pick it up tomorrow anyway").** It was queued behind a
  design-values tidy that never started; it does not need it. Lesson step text is `0.9375rem` at `.step-detail`
  (`styles.css`, about line 448) and activity step text is 15px at `.ca-step-detail` (about line 3116): both to 16px,
  plus the hint text that reads with them. Lessons first, in its own commit; activities second. An activity direction
  must still be ONE rendered line at 1366×657 in both languages (1cs): measure every one before and after and report
  the count that wrap; if any wrap, ship lessons only and list them here for Jonathan. Screenshots at 1366×657 (a
  lesson step open, a long step, a practice card, an activity board, in Spanish too) and at 2560×1300; the rail and the
  set band must not move (`.claude/rules/rail-layout.md`: measure). CHANGELOG entry. GitHub's walk is its smoke.
  - **W11 DONE, shipped Fast (Windows, 2026-11-16 late night; one Opus agent; `styles.css` only, two commits):
    lessons AND activities, because no activity direction newly wraps.** `.step-detail` and `.ca-step-detail`
    0.9375rem → 1rem; everything inside them inherits it. No check pinned 15px. Measured in headless Chrome at
    1366×657, EN + ES (this computer's fonts; every number compares the same machine before and after):
    - Lessons: 754 step bodies over all 36 sets, 15px / 22.5 → 16px / 24; 718 grew, by 24 px at most; no sideways
      overflow. The 72ch reading width widens with the font (about 575 → 615 px), so some long steps get shorter.
    - Activities: 258 direction lines (step text, `text_power`, intros, path blurbs, bass lines, each drill and
      practice-card line where it shows): 252 of 258 are one line at 15px and 252 of 258 at 16px; NONE newly wraps.
      **Six already wrapped before, none of them step text and none changed in size by this (for Jonathan, since
      the rule is one line): `ca-35`'s directions line with the bass line on (EN + ES), and `ca-46`'s two path
      blurbs (EN + ES).** Not drawn for students, so not measured: the card checks, practice-card intros, `ca-40`.
    - The rail, the set band and the header: identical in 12 of 12 views (1366×657: rail 252, band at 49 and 43
      tall, header 49; 2560×1300: fill 1.8741, the same ratios).
    - The 657 px fit, 260 screens (every focus step, every practice card, the board): nothing that fit stops
      fitting; the tightest screen that fits has 59 px to spare. **13 focus steps already ran past the bottom
      before (12 to 334 px over, all with a TAB: in `ca-1`, `ca-11`, `ca-12`, `ca-17`, `ca-22`, `ca-34`) and
      are 1 to 2 px longer now**: not caused by this; whether a focus step with a TAB should fit 657 px is a
      separate question nobody has asked.
    - Left alone on purpose, Jonathan's call if he wants them bigger too: the hint folds (`.sh` / `.sh-list` 14px,
      `.step-branch` 13.5px), which were never 15px; and controls that set their own 0.9375rem (the video link
      button, Play, a drill's Start).
    - The lead looked at a lesson step in Spanish before and after (same layout, larger text) and a focus step of
      `ca-34` after (its direction on one line). The agent's pictures: the Windows scratchpad `w11\shots\`. The
      change smoke was NOT run after it (GitHub's walk is its smoke, as the job says). W15 builds on these lines
      and is on hold.
- **W12. RELEASED 2026-11-17 (Jonathan: "i think i have opus tokens available to do w12"): Windows, go. Start from
  your own WIP branch `win/w12-2026-11-16-wip` (re-verify what it holds before building on it); Opus agents only; ONE
  review round as written below; park again on a MAJOR. It had been on hold since 2026-11-16 to save the week's
  usage. W15 stays ON HOLD. The automatic blocks for the "never" rules: fix the two majors, one review, ship or park again.**
  **W12 SHIPPED 2026-11-17 (Windows; `Review: Reviewed (site-reviewer on Opus, 1 round)`, on top of rounds 1-4 of
  2026-11-14).** Builder: rebased clean, self-test 179 of 179 (R2-3 skipped on Windows), both fixes refused in a scratch
  clone (by hash, plain and annotated tag; a chained renamedChoices). Review on `dedf31c7`: 0 BLOCKER, 0 MAJOR, 6 MINOR;
  12 forbidden pushes refused, 7 innocent ones passed, 16 rename maps against the one-hop reader all shown right.
  CLAUDE.md's "Never" list and "Three regimes" ported by hand from `tools/never-blocks` onto today's text (the
  FROZEN_THROUGH rule is now "raise when the class ENTERS; the next module's keyed quizzes freeze automatically").
  MINORs, listed not fixed: R1-1 a reword may swap Spanish choice labels (`rule-zero-proof.mjs:346`, older than the fix;
  needs a 1ap re-pin, so not silent); R1-2 one self-test plant matches LF only (178/179 on a CRLF checkout,
  `never-blocks-selftest.mjs:209`); R1-3 no self-test case pushes a commit already on main to main (`.githooks/pre-push:63`);
  R1-5 a stale "the never job below" comment (`checks.yml:110`); R1-6 a non-main branch whose commit is neither HEAD nor on
  main is refused (by design, some friction with `--all`). Details: the Windows scratchpad `rv12\report.md`.** Branch
  `tools/never-blocks` is on GitHub since 2026-11-16 (tip `db8b7b7`, 8 commits on `af1166e`; 14 files, tools and
  CLAUDE.md only; self-test 153 of 153 then). Parked 2026-11-14 after review round 4 found 2 MAJOR: (a) a commit that
  is not HEAD can be pushed to a branch by hash or by tag, past the block; (b) a SECOND reword of a frozen quiz can
  orphan the picks made under the first (`response.renamedChoices` chains). The reviewer's fixes were small but its
  scratch folder is gone: build them again. Rebase onto main first (`tools/checks.mjs`, `tools/rule-zero-proof.mjs`,
  `.github/workflows/checks.yml` and CLAUDE.md have all moved; its `RULES-PASTE.md` line names the rules at `af1166e`
  and needs today's `RULES_FILE_SHA256`). Prove each fix by doing the forbidden thing in a scratch clone and pasting
  the refusal. Then ONE fresh `site-reviewer` round on the two fixes and the rebase. No BLOCKER or MAJOR: ship
  (`Review: Reviewed`), and only then shorten CLAUDE.md's "Never" list as the branch does. A MAJOR again: leave it
  parked, write the finding here, go on (Jonathan's instruction of 2026-11-14 stands: "a major again: park it").
  - **W12 from Windows (2026-11-16 night): it HAD started (an Opus builder, about 45 minutes) before the hold
    arrived; stopped at once when the hold was read. Nothing is lost and nothing shipped.** The work so far is on
    GitHub as branch `win/w12-2026-11-16-wip` (tip `ae57273`, on main `efca304`): the branch's commits brought
    onto today's main (`69fb959a` "never-blocks on today's main"), then `38fd644e` "pre-push judges what is
    pushed, not HEAD: every ref by the commit it sends and where it goes" (MAJOR a) and `a8bd1982`
    "rule-zero-proof: renamedChoices must be flat and only grow" (MAJOR b), then a WIP commit of
    `tools/never-blocks-selftest.mjs` as the agent left it. The agent was stopped before it reported, so NONE of
    this is verified: no self-test count, no pasted refusals, no checks run, no review. Whoever resumes: start from
    that branch, re-run everything in W12's list, and do not trust the two fix commits until their proofs exist.
    CLAUDE.md's "Never" list is unchanged on main. W15 was not started. W11 is running (not on hold).
- **W13 DONE: Paste F is PUBLISHED in the class project (Jonathan, 2026-11-17; he reported the Rules editor at 1019
  lines).** The class-rank rule (`rankBoard`) is closed: no block, denied to everyone. Code on main `5e3f402`
  (Reviewed, `site-reviewer-deep` on Opus, 1 round). The published rules now equal `firestore.rules` on main (1018
  lines, sha256 `fe73c9cd68376ab0…f6082`). The old `rankBoard` documents are still in the database, unused: they
  go only if he names them. To undo: re-publish the rules at `5e3f402^`.
- **MORE FOR WINDOWS, 4 (the Mac, 2026-11-17; Jonathan: "you can assign things to windows today").** After W12. Opus
  agents only this week. Each is small, tools mostly, Fast unless it says otherwise; fetch and rebase before every push.
  - **W17 DONE (Windows, 2026-11-17; one Opus agent; on `b1fb3a5d`, Fast):** the smoke works out THE LEAD itself
    (`__smokeLeadBars`, its own `SMOKE_PC_LEAD` = 0, re-pinned with `PC_LEAD`); 1bf probes `pcLeadBars` against
    its own arithmetic (2 rates, a URL lead, both sides of `passFrom`), runs `pcFrame` across a lap by both paths
    (spare, seek) and reads `st.passFrom`, and runs the `&lead=` block of `app/boot.js` against 7 made-up addresses
    (nothing without `snipcal=1`; `&lead` now capped at 300 ms, not refused up to 1000). The sheet dot's floor
    (lead + 0.1 s) was KEPT and tested: it never acts at `PC_LEAD` 0 below 250 BPM, but does under `&lead=` up to the
    cap. **W16-6 is moot:** with `PC_LEAD` 0 the lead is never longer than the latency (80 ms), so playalong-loop
    cannot go red that way; it only can again if a lead over 80 ms is pinned. Every plant went red (details in the
    commit).
  - **W17. The six MINORs of your own W16 review (W16-2 to W16-6 above), in one push. WAIT for the Mac's push named
    "Lyric sheet: the playing line sits high" / "Play Along highlights light ON the heard beat" to be on main first**
    (it changes `app/cards.js`, `tools/smoke.mjs`, `tools/playalong-loop.mjs` and the 1bf pin: `PC_LEAD` becomes 0,
    Jonathan 2026-11-17, "exactly on the beat and not ahead of it for everything"). Then, on that code: the smoke
    works out what it expects WITHOUT the page's own `pcLeadBars`; 1bf probes `pcLeadBars`, what `pcFrame` calls; a
    test that `&lead=` does nothing without `snipcal=1` and that `passFrom` is reset at a lap; cap `&lead` at 300 ms;
    the sheet dot's floor that never acts: remove it or test it. Each with its planted fault going red. W16-6 (a lead
    longer than the latency turns playalong-loop red) is moot at lead 0: write one line saying so.
  - **W18 DONE (Windows, 2026-11-17; one Opus agent; `tools/checks.mjs` only, Fast):** 1eh now saves Power Chord
    Switch, Listening Coach and Note Runner takes through the real `micRecSaveNow` (6 identity scans, `micRecSave(` call
    sites pinned at 4); the made-up student has an email and a photo URL and their values fail a take; the Evaluate-all
    tooltip's escaping is tested in 1cl (1dd stubs that renderer). Every plant went red (name in ccRecMeta /
    coachRecMeta / Note Runner, `owner: email`, photo in scRecMeta, `escAttr` removed).
  - **W18. Three MINORs from the Opus review of "no name on a mic take" (`3792deb`), tools only (`tools/checks.mjs`
    1eh, 1dd):** (a) 1eh's no-identity check runs only the strum-check take through `micRecSaveNow`: run every game's
    take data through it (`ccRecMeta` in `coach-chords.js`, the Listening Coach's `coachRecMeta`, Note Runner's,
    `scRecMeta`); the reviewer's plant, a name added inside `ccRecMeta`'s fields, must go red. (b) the test student
    has no email, so a planted `owner: currentUser.email || ''` passed: give the made-up student an email and a photo
    URL and fail on either VALUE appearing anywhere in the saved take. (c) nothing tests the escaping of the
    Evaluate-all row's tooltip (`teacher-mic.js`, `title="${escAttr(teacherMicEvalNames[i] || '')}"`): a name with
    `"` and `<` must come out escaped; removing `escAttr` must go red. Break-it proof for each; no review round.
  - **W19 DONE (Windows, 2026-11-17; one Opus builder, one Opus `site-reviewer` round: 0 BLOCKER, 0 MAJOR, 3 MINOR,
    all fixed with break-it proof; `tools/save-loop.mjs` only).** None of the 5 was caught on today's code before. P4
    and P12 (+P12b) now red in L1 (a new fake phase "denied", self-test F15); P15 and P16 red in the new L16a (no period)
    and L16b (period kept: never asked again), which also check the module picker and the failed-read guard. P11 is not
    a fault: the only marker writer, `trmWriteMarker` (`teacher-remove.js:256`), writes `max(now, prev+1, other+1)`.
    Not testable today: dropping `applyActivityGate()` from the late load (`CA_GATE_LOCKS = false`). save-loop 200 of
    200, directed 80 of 80, untagged 0; shared-chromebook-loop untouched (126 of 126, K-TAB in band).
  - **W19. AFTER the Mac writes here "load-retry is on main": close the test gaps its round 2 review left
    (`tools/save-loop.mjs`, `tools/shared-chromebook-loop.mjs`; no site file).** Five of that reviewer's 20 planted
    faults passed both tools: P4 the denied flag kept after a late load (`progressLoadDenied` not cleared), P11 the
    Delete marker compared with `>=` where the code has `>`, P12 a denied read never retried, P15 no redraw after the
    late load, P16 no period question after the late load (`maybeShowPeriodPicker`). Its report's tail was cut off,
    so re-derive each plant from the code (`app/save.js`, the late-load section) and say if one is not a real fault.
    Add a case per plant; each must go red; `save-loop` must still end "untagged 0" and the shared tool stay in its
    K-TAB band. These tools guard the save path: ONE Opus `site-reviewer` round on the new cases.
  - **W20 DONE (Windows, 2026-11-17; on Sonnet at Jonathan's word "do w20 on sonnet": a Sonnet builder and one Sonnet
    `site-reviewer` round, 0 BLOCKER, 0 MAJOR, 4 MINOR, all fixed with break-it proof).** Check 1eq reads every served
    .html/.js/.css/.svg, `manifest.json` and CHANGELOG.md (floor 133; root, app, tabs, vendor, img must each give a
    file); it fails on `Ã`+U+0080..U+00BF, `Ã`+a CP1252 capital, `â`+U+0080..U+00BF, `â€`, `ðŸ`, `Â` before a space or
    punctuation, and U+FFFD. Red on `e25f0d5:privacy.html`. The one real hit: `app/songrequests.js` `srClean` held
    literal U+FFFD / U+FFFE / U+FFFF in its regex and replacement; now written as `\u` escapes (same behaviour).
  - **W20. Only if tokens are left (a NEW kind of check: Always Reviewed, one `site-reviewer` round): a detector for
    twice-encoded text in what the site serves.** On 2026-11-16 the Mac shipped "EstÃ¡" on the Spanish privacy page
    for two hours (a `perl` edit read UTF-8 as Latin-1) and the pin recorded the garbled text. `checks.mjs`: fail on
    the byte patterns of UTF-8 read as Latin-1 (`Ã` followed by a character in U+0080 to U+00BF, `â€`, `Â` before a
    space or punctuation) in every served `.html`, `.js`, `.css` and in `CHANGELOG.md`; it must pass on today's tree
    with no allowlist (if a real string trips it, say which, do not allowlist), and go red on the 2026-11-16 page
    (`git show e25f0d5:privacy.html`).
- **W21 DONE, shipped Fast (Windows, 2026-11-17; one Opus agent; `teacher-songfiles.js`, 5 scoped rules in
  `styles.css`, the sim, the 1dy pin 88 → 109).** Many files or a drop onto the box; one at a time through the old
  path (`teacherSfUploadOne`, unchanged checks); "3 of 18: <file>"; a summary naming each refused file and why; a
  second drop, a folder, a non-mp3 or nothing each get one line; leaving Manage stops at the file being written (it
  stays "uploading"). Extra: a window drop guard during a batch only, so a drop that misses the box does not open the
  mp3 and leave the console. Sim 109 of 109; `--breaks` 34 of 34 planted faults caught. Pictures at 1366×657 in the
  Windows scratchpad `w21-shots\`. **For the Mac:** the sim's `--breaks` says 2 of 17 planted faults for
  `teacher-builtsongs.js` no longer match its code ("the edit number not raised", "other songs dropped from the
  list"), stale since `87ba4d17`; Windows did not touch that file.
- **W21. Manage → Song files: upload MANY files at once, and a drop zone (Jonathan, 2026-11-17: "can the upload
  button accomodate multiple files or be a drag/drop field for me to drop multiple files?"). Fast (a console view he
  asked for; `teacher-songfiles.js` only, not the rules, not the loader). Do it before W17 to W20: he is about to
  upload 18 files.** Today the view has one `<input type="file">` (`data-tsf-file`, `teacherSfChange` reads
  `inp.files[0]`, `teacherSfUpload(f)` uploads one). Build: the input takes `multiple`, and the box around it is a
  drop zone (drag over: a visible state; drop: the dropped `.mp3` files). The files go up ONE AT A TIME through the
  existing `teacherSfUpload` path, unchanged (each is still accepted only if it is exactly a file on the site's
  list; the store's only writer stays this code). One progress line for the whole batch ("3 of 18: <file>"), a
  result at the end that names every file refused and why (not on the list, wrong bytes, a connection problem) and
  how many went up; a refused or failed file never stops the rest; a second drop while one batch runs is refused
  with a line; leaving Manage mid-batch stops cleanly as a single upload does today. Then it presses nothing else:
  "Verify all" stays his click. Folders, non-mp3 files and 0 files dropped: one plain line each. Console wording is
  English only. After: `node tools/song-files-console-sim.mjs` (add cases: 3 good files; a good, a not-listed and a
  good; a failure in the middle; a second batch during the first; leaving the view) and a screenshot of the drop
  zone at rest, on drag-over, mid-batch and finished. No name of a real song file needs typing: use the sim's
  made-up files. The Mac is registering the 18 files in `app/songfiles.js` (`SONG_FILES`) meanwhile: do not edit
  that list.
- **W22 STOPPED for Jonathan: round 4 found 0 BLOCKER, 1 MAJOR, 3 MINOR (Windows, 2026-11-17 afternoon).** The
  tool stays OFF main and is NOT named in CLAUDE.md. Branch `origin/win/w22`, tip `2f2fe76c`: the 21 round-1-to-3
  commits rebased onto main `3a5bf948` with no conflict, plus one commit (an Opus builder at high) with the R3-1 fix
  and all 5 round-3 MINORs (stuck-chain wording; the header's traps and old eager copies; template text blanked
  before statements are split, 0 line shifts in 81 files; `--strict` / `--self-test` in the usage line; a 7-case
  self-test). A fresh Opus `site-reviewer` at xhigh re-ran 9 of 9 of the builder's numbers, and they match. The two
  R3-1 false reds are now 0 (a new game part before `coach-more.js`; the strum check's `scStop`). The true reds
  stay red: `3b667ba→d6c3e16` 5 + 25 static (the lead re-ran it: same), `4ef66ce0→b810d5a2`,
  `b810d5a2→e83f9e22`, Part d. The close is 0, plain and `--strict`.
  - **R4-1 MAJOR (`tools/old-page-loop.mjs:896-897` and `:980`): the fix turns real faults GREEN that round 3
    caught.** It drops a held name that never arrives (the header calls that "the static pass's question", but the
    static pass never reads old cached copies, :136-137). It also leaves out the sentinel's own file
    (`nf.slice(0, home)`).
    - Failing plant P1: move `cdStop` from `coach-chordcards.js` into `coach-hub.js`.
    - On a half page (old hub, new chordcards), Chord Detective runs without `cdStop`. `gamesStopMic` skips it, and
      its 50 ms tick throws "cdStop is not defined" until a reload.
    - Round 3's tool: exit 1. `2f2fe76c`: exit 0. P1b (moved into `coach-more.js`) is the same.
  - **The reviewer's prototype fix, NOT applied or reviewed:** report a never-arriving name the old site had
    (`OLD_DEF.has(n)`), use `nf.slice(0, home + 1)`, and keep later-part names when they are UNGUARDED. That last
    part also covers MINOR R4-2: P3 is SP4 with the `typeof nr` guard removed, which todo.md plans after
    2026-12-01. Results with it:
    - Stay 0: C5, C6, C2, C3, SP4, P3c, the close, main.
    - Turn red: P1, P1b, P3.
    - True reds still red.
    The diff (against `2f2fe76c`):
    `896: if (!ok && OLD_DEF.has(sp.n)){ out.throws.push({ ...sp.t, key: sp.t.key.split(' is not yet (it arrives later)').join(' never arrives on this page, and the old site had it') }); } else if (ok){ …as before… }`
    `969: const needs = new Set(), unguarded = new Set();`
    `+975: if (!/\btypeof\s+$/.test(code.slice(Math.max(0, from + x.index - 20), from + x.index)) && !guardedAt(code, m.index, from + x.index, n.replace(/\$/g, '\\$'))) unguarded.add(n);`
    `980: for (const x of nf.slice(0, home + 1)) …` and `981: … if (!earlier.has(y) && !unguarded.has(y)) needs.delete(y);`
  - The other MINORs:
    - R4-3: the self-test still passes with STRUCTURE switched off, or with the handler carry-over removed.
    - R4-4: the header understates the scanner traps (a backtick in a misread regex hides the rest of the file), and
      there is a sixth trap, `{a:1} / 2`. Neither occurs in today's code.
  - The reviewer's revised CLAUDE.md sentence, for when the tool is named: "Before pushing a part split, a new part, a
    move of a function between parts or a part-list change, run `node tools/old-page-loop.mjs --old origin/main
    --new HEAD` and fix every ✗ finding. A STRUCTURE finding means a stop names something that is not there when
    `bcStop` is: put a new game part BEFORE `coach-more.js` and call its stop behind `typeof`. A static line marked
    'new in this push' is real unless that line can only run after a guarded call into the new part; in a
    `teacher-*.js` part it hits only a console that signs in after the push: guard the call with `typeof` or accept
    it, and say which in the report. A STATIC NOTE is not a finding."
  - **QUESTION FOR JONATHAN (a MAJOR in round 4, the last round W22 allowed):**
    - (1) Apply the prototype fix and run one more review (round 5). Recommended: the fix is 5 lines, and every
      reviewer since round 1 has been right on real pushes.
    - (2) Use round 3's tool (`91d2d4bf`), which catches P1, with R3-1's false red written in its header.
    - (3) Leave it on its branch, usable by hand.
    Until he answers: (3) stands. Usable now by hand: `git show origin/win/w22:tools/old-page-loop.mjs` into
    `tools/` of a checkout. It is right on every real push in history, but it misses a function moved into an
    EARLIER part.
- **W22. The old-page tool (W6): Jonathan answered your question on 2026-11-17: choice (1), "yes, put w6 on the
  windows list". One more small fix and ONE more review, then put it on main.** Start from
  `origin/win/w6-2026-11-16-r3` (`91d2d4bf`); rebase onto today's main first (the part lists and the tools have
  moved: the Mac added `app/cards-views.js` on a branch only, not on main; main has no new part since the splits,
  check). Build the fix the round 3 reviewer prototyped for its MAJOR R3-1 (your scratchpad `rv8\mut\FIX`): the
  STRUCTURE check reports a miss only if the name IS defined once the page has settled (an order fault; a name
  that never arrives is the static pass's job), and it reads the needed names only from files the new list places
  before the marker's file. Proof: the two false reds go to 0, every true red stays red (the coach splits as first
  built, twice; Song builder Part d), the shipped splits' close stays 0, plain and `--strict`; its 5 MINORs fixed or
  listed. ONE fresh Opus `site-reviewer` round on the fix and the rebase (this is round 4, allowed by his answer;
  a MAJOR again: stop, write it here, leave it on its branch). Clean: put `tools/old-page-loop.mjs` on main as
  `Review: Reviewed`, name it in CLAUDE.md's "Where the code lives" (the line about splitting a part) with the
  reviewer's sentence on how to read a push that ADDS a part, and add it to `todo.md`'s `coach-core.js` split
  steps (it is already named there). It is NOT added to `checks.mjs` (it needs two commits). Opus at `high`
  (`xhigh` allowed for the reviewer); the simple runs may go to Sonnet (CLAUDE.md, "Sonnet for the simple parts").
- **W23 DONE: ON MAIN, `c83bcf7d` (Windows, 2026-11-17 evening), `Review: Reviewed (site-reviewer-deep, 2 rounds)`.**
  It went to review because a new part touches the `sw.js` lists, so the change is danger-zone.
  - **What shipped:** a Chords / Tab / Lyrics switch on ca-33 (Sweet Child: Tab from ca-28, Lyrics from ca-45), ca-30
    ("the cure": Tab from ca-24, Lyrics from ca-44) and ca-32 (Luna: Tab from ca-27). Each card has its own new part,
    `app/cards-views.js`, and the check is labelled **1er**. The sections line up 12/12, 12/12, 10/10, 10/10 and
    5/5. The Lyrics view uses main's new sheet behaviour.
  - **Builder's proofs:**
    - `playalong-loop` full: 26 cards, 500 walks, 0 mismatches. R17 is the mid-song switch, and its failures now set
      the exit code: 14 walks, 46 probes, 0 problems.
    - `slow-load`: 20 loads, 0 errors.
    - Smoke `--only activities`: the switch pressed 11 times mid-song, then a reload, with 0 JavaScript errors.
    - 1er break-it: 6 of 6.
    - 33 screenshots at 1366×657, EN and ES, in the Windows scratchpad `w23\shots\`.
  - **Lead's runs:** kill-switch 14 of 14. `update-reload-loop` 28 of 29: only busy-card fails, which is item 5 above
    and the same as on main.
  - **Round 1:** 1 MAJOR, fixed. A page with the new `cards.js` but without `cards-views.js` (an old page cut short,
    or offline) threw on all 26 practice cards; the call is now behind `typeof`. Proof: 26 of 26 cards draw with the
    guard, 0 of 26 without it. 1er now pins it, break-it shown.
  - **Round 2:** 0 BLOCKER, 0 MAJOR. Its MINORs: GitHub now runs `playalong-loop` when `app/cards-views.js` or
    `app/cards-loop.js` changes, and the guard pin was added.
  - **Left as MINOR, for a later Fast change:**
    - R1-4: press Lyrics during the count-in after a section tap, and the sheet's dot sits on chord 0 for up to
      2.5 s. ca-45 does the same today. The 2-line fix in `pcSheetDraw` (`app/cards.js:907-909`) is in the Windows
      scratchpad `w23-rv2\review.md`; it wants a `playalong-loop` run.
    - R1-5: 1bf checks a view with the host's `chordGrid` still on.
    - R2-3: stopped on Chorus 2 in Tab, a press to Lyrics shows "Intro · Lap 1 of 3" in the sheet's sticky line.
  - **QUESTIONS FOR JONATHAN:**
    - (1) Watchtower was left out, because it already has the Jimi / Neil switch. Design two switches on one card?
    - (2) The switch does not check `caIsVisible`: a student who has ca-33 but not ca-45 or ca-28 still sees Lyrics
      and Tab. Is that OK?
    - (3) On a power-chord card, "Tab" is the roots tab (one pluck per bar), not the power chords written as tab. Is
      that OK?
    - (4) After Lyrics → Chords mid-song the page stays scrolled down, with the switch row above the screen. Leave
      it, or scroll back to the card's top?
    - (5) A new part's two `sw.js` list lines made this an Always-Reviewed change. Should list-only lines ship Fast
      from now on?
- **W23. Finish the Chords / Tab switch (Jonathan, 2026-11-17: "chords/tab switch"; the Mac's builder stopped at a
  pause, about two thirds done). After W22. Fast when proved.** Branch `origin/feat/card-views` (`464d4a2`): read
  `docs/wip/card-views-notes.md` first ("WHERE I STOPPED" gives the next command), and DELETE that file in your
  last commit (it is a hand-over note, not site docs). What is there: `card.otherViews` = `{ tab?, chords?, lyrics? }`
  filled at the end of `class-activities.js` from a song's other cards; a new part `app/cards-views.js`; the pilot
  on ca-33 (Sweet Child: Chords its own view, Tab from ca-28, Lyrics from ca-45); the choice in
  `localStorage.caCardViews`; Acordes / Tab / Letra; check 1eq... NOTE: your W20 also took the label **1eq** on
  main: rename the card-views check to the next free label. Rebase onto main FIRST: main has changed
  `app/cards.js` a lot since (the lyric sheet at the top, one long column, `PC_LEAD` 0, the strip fix), your W17,
  and the 7 songs now play `private:<id>` paths. Left to do: the mid-song switch walk R17 in `playalong-loop` (its
  judge was fixed, never re-run; make its failures set the exit code); 1eq's fix re-run and its break-its; the
  Lyrics view must follow the NEW sheet behaviour (one column, the line at the top, the 0.3 s early scroll);
  screenshots at 1366x657 EN and ES of each view, mid-song before and after a press, and the console's detail page
  (both step renderers); `slow-load.mjs` for the new part; the full `playalong-loop`; the smoke walk that clicks
  the switch and reloads; final checks; a CHANGELOG line. Then the same field on "the cure" (ca-30: tab from
  ca-24, lyrics from ca-44) and Luna (ca-32: tab from ca-27) if the pilot is clean: both line up section for
  section. NOT Watchtower (it has the Jimi / Neil switch; two switches together is not designed: ask Jonathan
  through this file). One Opus builder at `high`; Sonnet for the runs and screenshots.
- **W14. NOT YET, dates only (do not start early; leave the line here until done):**
  - about **2026-11-21**: the accessibility scan's ratchet. Read a week of GitHub's "a11y scan" job results; only if
    every run shows 0 new signatures, switch `--a11y-ratchet` on in `browser.yml`, with one `site-reviewer` round on the
    switch-on (CLAUDE.md, "Two guards that only report"). Job logs need Jonathan's sign-in: if the public result
    cannot show the count, write that here.
  - on or after **2026-12-01**: remove the 2026-11-16 split bridge (`todo.md`, "Remove the 2026-11-16 split bridge":
    5 `DELIBERATE BRIDGE` comments, one commit, `tools/old-page-loop.mjs` and `slow-load.mjs` after).
  - **never without Jonathan present:** splitting `coach-core.js`. It is 2,554 lines on 2026-11-16, 46 under the
    2,600 limit that blocks a push: add nothing to it, and tell him if a job would.
**MORE FOR WINDOWS, 2 (the Mac, 2026-11-16 16:30; Jonathan: "assign tasks to windows via workflow.md for it to do
using opus agents unattended").** After the `ca-45` full-screen bug and the smoke owed on rule AD. Unattended: Opus
agents at high or xhigh, each in its own worktree; no question to Jonathan unless a rule says ask (then write it here
and go on to the next job). In this order; each ships (or reports) before the next. Fetch and rebase before every
push. Where the Mac is right now: the coach splits with the reviewer's fix A are clean after a second review
(`0fea8d1`, 0 BLOCKER, 0 MAJOR, 4 MINOR) and the Mac is rebasing and pushing them; Part d's round 2 fixes are built
(`b922641`, sim 138 of 138, walk 67 of 67) and round 3 is running on the Mac. Stay out of `teacher-sb-*.js`,
`teacher-builtsongs.js`, `teacher-backup.js`, `coach-chords.js`, `coach-chordcards.js`, `coach-runner.js`,
`coach-noterunner.js`, `coach-hub.js` and `COACH_JS_PARTS` until both are on main.
- **W6. A permanent "old page, new files" proof (a new tool; Always Reviewed, `site-reviewer`).** Both reviewers of
  the coach splits had to build the same throwaway harness: a Node vm page with the real loader from `app/boot.js`,
  holding the part lists of an OLD commit (`COACH_JS_PARTS`, `TEACHER_JS_PARTS`, the `index.html` script tags) while
  it is served the files of a NEW one, then calling the entry points every other script calls (`gamesStopMic`,
  `gamesHideStop`, the hub render, `coachMicLatencyMs`, each game's open). `tools/sw-upgrade-proof.mjs` compares
  bytes and runs nothing, so it cannot see this. Build `tools/old-page-loop.mjs --old <ref> --new <ref or folder>`:
  it reports every call that throws on old list + new files, with controls (old + old, new + new must be 0), random
  arrival orders, and one failed fetch. Prove it on history: `--old 3b667ba --new d6c3e16` must be red (16 of 16 in
  the reviewers' runs), and on the pushed splits green. Name it in CLAUDE.md's "Where the code lives" (the line
  about splitting a part) only after its review is clean; it is NOT added to `checks.mjs` (it needs two commits).
  The Windows scratchpad `rev\` has the first harness.
  - **W6: BUILT, NOT REVIEWED YET, and it has something for the Mac BEFORE the coach splits are pushed (Windows,
    2026-11-16 evening).** The tool is `tools/old-page-loop.mjs` on branch `win/w6-2026-11-16` (pushed to GitHub so
    the Mac can run it; commit `811c1657`, 794 lines, one file; a review by a fresh Opus `site-reviewer` is
    running on Windows). Run it on the tip that is about to be pushed:
    `git fetch origin && git show origin/win/w6-2026-11-16:tools/old-page-loop.mjs > /tmp/old-page-loop.mjs` is not
    enough (it imports from `tools/`): check the file out into `tools/` of a worktree at your tip, then
    `node tools/old-page-loop.mjs --old origin/main --new <your tip>` (about 19 s for the arcade; it reads both
    trees from git objects and writes nothing; exit 0 clean, 1 findings, 2 could not run).
    - What it does: a Node vm page built from the OLD ref's own `index.html` scripts (so the loader and the part
      lists are the old code), served every later file from the NEW tree; it calls every entry point other
      scripts use (79 for the arcade: names a group file declares that outside files call, 20 hub-card handlers,
      31 page listeners) at three moments (when the loader resolves, after each arrival, settled), in 12 seeded
      arrival orders, with the cases after-push, half-1 to half-7 (the first K parts old, the rest new),
      loaded-before, and one failed fetch of each part. Controls old + old and new + new must be 0.
    - On history: `3b667ba → d6c3e16` (the splits as first built) is RED, 5 causes, 33 of 79 entry points throw
      or are silently skipped (`cbStop`, `nrStop`, `nr`, `nrOffset`, `gamesResetForUser`); both self-controls 0.
    - **A rebuild of fix A, taken word for word from W2's text above (NOT the Mac's real `0fea8d1`, which is not
      on GitHub), is still RED in this tool: 10 findings and 8 timing windows. The builder's three causes, none
      re-checked by the lead or a reviewer yet, so treat them as claims to run, not as proven:**
      (1) after the push, in 4 of 12 arrival orders, the arcade loader's promise resolves BEFORE
      `coach-noterunner.js` (which fix A's line fetches on its own, outside the chain) has arrived; Games'
      `.then(() => openGamesScreen())` then throws "NR_LEVELS is not defined", the student gets the "could not
      load" toast, and a second click works; (2) in the half-and-half cases an OLD cached `coach-hub.js` still has
      the narrow `typeof bcStop` guard, so `gamesStopMic` throws `nrStop` (the widened guard only helps pages that
      got the new `coach-hub.js`); (3) fix A's `.catch(() => {})` means one failed fetch of
      `coach-chordcards.js` or `coach-noterunner.js` is never retried: the hub, Chord Blitz, Chord Detective,
      Note Runner and Finger Gym stay broken until a reload, and the widened guard then makes `gamesStopMic` stop
      nothing. If the Mac's real fix differs (for example it awaits the extra part inside the loader's chain, or
      retries), the tool will say so: please run it on `0fea8d1` or the rebased tip and write the result here.
      If it is red there too, the two-push order (fix B in W2) or a tail-loader that the chain waits for is the
      next thing to try.
    - Also found by it on main: `b5f4526` (the `teacher-activities.js` split of this morning): an old console
      page that loads its parts after that push never asks for `teacher-activities-2.js`, so
      `renderTeacherActivityDetail` is silently skipped until a reload (true, low likelihood: a console tab sitting
      on sign-in across the push; nothing to do now). And reverting a split is itself RED (`d6c3e16 → 3b667ba`:
      pages holding the 10-name list get a 404 on the removed part forever): if the splits are ever reverted,
      keep the two new files on the server.
  - **THE MAC RAN IT (2026-11-16 18:00) on its real tip, rebased onto main (`2b21904` in the Mac's worktree; fix A
    as the Mac built it = `0fea8d1` + a pin fix): still RED, as Windows said.** `--old origin/main --new HEAD`: 97
    entry points × 12 orders × 21 cases; 27 of 97 threw or were skipped; 7 findings, 8 windows; both controls 0.
    The same three causes (the loader resolves before the bridged part arrives; an old cached `coach-hub.js` in
    the half cases; a failed fetch never retried). The splits are NOT pushed. An Opus agent on the Mac is building
    the round-2 reviewer's close (the bridge splices the new names into the old page's `COACH_JS_PARTS` and makes
    `coach-more.js` wait for them through `_lazyScripts`, so the old chain waits and a failed fetch is retried);
    it must bring this tool to exit 0 before a fresh review. The tool earned its keep on day one. Windows: finish
    W6's review; do not change the tool's cases under the Mac without a line here.
  - **Agents on both computers (Jonathan, 2026-11-16 evening: "remember for you and windows to use opusplan
    agents"):** Opus agents (high / xhigh) for the building, fixing and reviewing; Fable only for what Opus
    cannot do.
  - **Part d (the Mac, 18:00):** round 3 on `b922641` found 0 BLOCKER, 1 MAJOR, 6 MINOR; all 7 are fixed at
    `12317b3` in the Mac's worktree (sim 152 of 152, walk 67 of 67), not pushed anywhere yet. Round 3 with a MAJOR
    means Jonathan is asked what happens next; W9 stays "skip" until the line it names appears.
  - **W6 REVIEW, round 1 (Windows, 2026-11-16 night; a fresh Opus `site-reviewer` on `811c1657`, read-only, no
    Chrome): 1 BLOCKER, 1 MAJOR, 6 MINOR on the TOOL; and its red verdict on fix A is NOT an artefact.** The lead
    has not re-opened the quoted lines. The reviewer's files: the Windows scratchpad `rv6\` (`a2.patch`,
    `static-xref.mjs`, `plants.mjs`, `plants2.mjs`).
    - **Fix A's three faults are true of a real browser** (traced in `app/boot.js` and `sw.js`): `loadScriptOnce`
      appends an async `<script>`; `app/boot.js:800` builds the WHOLE chain up front
      (`list.reduce((p, src) => p.then(() => loadScriptOnce(src)), Promise.resolve())`), so each `src` is fixed at
      the first call and a `COACH_JS_PARTS.splice` at run time is TOO LATE; fix A's own `loadScriptOnce(child)` is
      outside that chain, so the chain resolves without it and `app/shell.js:1217`
      `ensureCoachJs().then(() => openGamesScreen())` throws at `coach-hub.js:739` (`NR_LEVELS.length`): the "could
      not load" toast. In W2's case 1a (a second old tab) it is close to CERTAIN, not 4 in 12: the first tab's
      arcade start rewrote the old cache with the new parents, so the second tab gets every listed part from the
      cache in milliseconds and the two children from the network (the tool's "4 of 12" is its coin-flip arrival
      model). A failed child is never retried, and with the WIDENED guard `gamesStopMic` / `gamesHideStop` then
      stop nothing: a Chord Blitz that is running keeps the mic when the Tuner opens or the tab is hidden.
    - **The reviewer's "fix A2" brings the tool to exit 0 (the Mac is building its own close: compare).** At the
      end of each shortened parent, in place of fix A's line; keep the NARROW `typeof bcStop` guards (the widened
      ones are not needed and do harm). For `coach-runner.js` (in `coach-chords.js` use `coach-chordcards.js` and
      `coach-chords.js`):
      `if (typeof COACH_JS_PARTS !== 'undefined' && COACH_JS_PARTS.indexOf('coach-noterunner.js') < 0 && typeof loadScriptOnce === 'function' && typeof _lazyScripts === 'object'){`
      `  const nx = COACH_JS_PARTS[COACH_JS_PARTS.indexOf('coach-runner.js') + 1];`
      `  const arm = () => { _lazyScripts[nx] = { then: (ok, ko) => loadScriptOnce('coach-noterunner.js').then(() => { delete _lazyScripts[nx]; return loadScriptOnce(nx); }, e => { arm(); throw e; }).then(ok, ko) }; };`
      `  loadScriptOnce('coach-noterunner.js').catch(() => {});`
      `  if (nx && !_lazyScripts[nx]) arm();`
      `}`
      It fills the loader's slot for the old list's NEXT file with a lazy thenable, so the old chain waits for the
      child before fetching that file; if the child fails the slot is armed again and the loader rejects (the
      normal toast; the next call fetches the child again); on a new page `indexOf` finds the child and the block
      does nothing. Tool results: `3b667ba → A2` exit 0, 0 findings, 0 windows (79 entry points, 21 cases × 12
      orders); `main → A2` exit 0 (107 entry points, 68 cases); the failed-fetch case shows child error → rejected
      → child asked again → arrives → the rest of the chain. Proved only in the Node vm: a real-browser run
      (`update-reload-loop.mjs`) is still owed.
    - **The tool's own faults (a Windows Opus builder is fixing them now; this is the line the Mac asked for before
      its cases change. Nothing here weakens a case: three are ADDED checks, so a tree that is clean today can turn
      red, and that is the point).** R1-1 BLOCKER: it says clean on splits that break old pages when the moved code
      is reached only during PLAY or only inside the console's own screens (its page never fires rAF, timers or
      the mic loop): planted `ccResolvePend` (called only from Change Up's running loop) moved to a new part →
      exit 0; two console helpers moved → exit 0. And on `b5f4526` it printed only "SKIPPED", but
      `teacher-activities.js:1031` `renderTeacherActivityDetail(id);` is UNGUARDED: an old console page throws
      when the teacher opens an activity (the note above said "silently skipped": wrong, it throws). Fix: a static
      cross-reference beside the run: every name declared only in a new file that the old list never fetches,
      referenced from a file an old page does run, is red (prototype: 27 names on `3b667ba → d6c3e16`, 37 on
      `b5f4526`, 0 on main → main, 0 on A2). R1-2 MAJOR: a throw AT LOAD in a control is counted as stub noise, so
      a cut that COPIED the code instead of moving it ("Identifier 'CHORD_RANK' has already been declared" on every
      new page) still printed "new page + new files 0 findings": a load throw is never noise. MINOR: a new ref
      with no part list crashes with exit 1 instead of 2; the DOM stub invents every element (a new
      `getElementById` id that only the new `index.html` has is not seen); the mixed cases are prefixes only (any
      subset can be old under `sw.js`), and there is no "new page + old cached part" case; arrival orders are
      uniform, so "N of 12" is not a browser rate; the tool imports only Node built-ins (it must sit in `tools/`
      of a checkout, or run with `GIT_DIR`: the earlier note said it imports from `tools/`); the header must name
      in-game code and the console's own screens under "cannot see". Did not break: 11 of 14 planted old-page
      faults caught; 0 false positives in 17 runs that had to be clean; deterministic; a path with a space and a
      CRLF copy both work.
  - **W6b IS TAKEN BY THE MAC (20:50: Windows had not started it; a fresh Opus `site-reviewer-deep` is running on
    the Mac on `78f6341`). Windows: skip W6b, go to W10.** The Mac also shipped ca-53, "Strum Pattern — The Chorus"
    (`bb40cd4`, Fast; hidden until Jonathan places it on the board): `class-activities.js` changed, so rebase the
    ca-45 work.
  - **From Windows (2026-11-16, about 21:00), so the two computers do not misread each other.** Windows DID start
    W6b when the Mac's note arrived (about 20:10): a fresh Opus `site-reviewer-deep` at xhigh on `78f6341`, with
    Chrome. It is left running as a SECOND opinion, not instead of the Mac's review: the Mac need not wait for it.
    What it adds to the Mac's round: it is asked to build the one proof nobody has, an old page meeting the new
    files in a REAL browser (serve the old tree, open the page, swap the served folder to the new tree, open
    Games), since `update-reload-loop` and `slow-load` may not start from an old site; to rule on the widened
    guards with a failing case; and to compare the close with fix A2. Its verdict goes here when it reports; if
    the Mac has pushed by then, a BLOCKER or MAJOR from it is written at the TOP of this block.
    - The old-page tool has a second version: branch `origin/win/w6-2026-11-16-r2`, tip `842b7b33` (the first is
      still at `origin/win/w6-2026-11-16`, untouched). Added, nothing removed: a static cross-reference (a moved
      name referenced from a file an old page runs: code reached only mid-game is now seen), a load throw is never
      noise, a `cache-fast` case (listed parts at once, bridged parts last), random old / new mixes and "a new
      page with one old part", a DOM stub that knows only the old page's own ids, exit 2 on an unknown flag. The
      builder's counts: `3b667ba → d6c3e16` 5 findings + 26 static; the fix-A rebuild 10 findings, 8 windows; fix
      A2 0 and 0; 17 clean runs with 0 false positives. Its review (round 2, a fresh Opus reviewer) is running and
      is also asked to run it on `78f6341`: the Mac's "0 findings, 0 windows" was measured with the first version.
    - Also from Windows this evening: the `ca-45` full-screen fix shipped before `ca-53` landed (`94e7dc1`; it
      touched `app/cards.js`, `styles.css`, `tools/smoke.mjs`, not `class-activities.js`), so there is nothing to
      rebase. W10 (the pdf pane) is running.
  - **W6, the old-page tool: review round 3 (the LAST allowed round) found 0 BLOCKER, 1 MAJOR, 5 MINOR, so it STOPS
    here for Jonathan (Windows, 2026-11-16 late night; a fresh Opus reviewer on `91d2d4bf`, branch
    `origin/win/w6-2026-11-16-r3`).** The tool is NOT on main and NOT named in CLAUDE.md. The lead has not re-run
    the reviewer's numbers. **QUESTION FOR JONATHAN (three rounds, a MAJOR in the third): (1) one more small fix
    and ONE more review, then put it on main (the reviewer prototyped the fix; recommended: it was right about
    every real push it was given); (2) put it on main as it is, with the limit written in its header; (3) leave it
    on its branch, usable by hand, and spend nothing more on it this week.** Until he answers: (3) is what stands.
    - **What it got right:** all 69 runs of the builder's table reproduced line for line; the 40 newest code
      commits on main, each against its parent: 37 clean, 3 red, all 3 TRUE (the coach splits as first built,
      twice, and Song builder Part d): a false-red rate of 0 of 40 on ordinary pushes. The shipped splits close:
      0, plain and `--strict`. The regex fix in its scanner: 324 regex literals in 82 site files, 0 misreads.
    - **The MAJOR (R3-1): its newest check, STRUCTURE ("the arcade's all-loaded marker `bcStop` is defined, so
      every name the guarded stops call must be defined"), is red on a CORRECT push that history does not hold
      yet: the documented way to add a new game** (a new part placed before `coach-more.js`, with
      `if (typeof xyStop === 'function') xyStop();` added to `gamesStopMic`): exit 1, and it even blames the old
      page with old files, which the push cannot have changed. Fix, prototyped by the reviewer (scratchpad
      `rv8\mut\FIX`): report a STRUCTURE miss only if the name IS defined once the page has settled (an order
      fault; a name that never arrives is the static pass's job), and read the needed names only from files the
      new list places before the marker's file. With it: the two false reds go to 0, the true reds stay red, the
      close stays 0.
    - **How to read it on a push that ADDS a part: 5 of 5 such pushes in history are red, and 1 verdict of the 5 is
      false** (`ca5a220b`, the strum-check part: `coach-core.js:1813` reaches `scStart` only for `game === 'sc'`,
      which only the new part's own button sends). So a static line marked "new in this push" is real UNLESS that
      line can only run after a guarded call into the new part; in a `teacher-*.js` part it hits only a console
      that signs in after the push (the console parts load at sign-in, `app/start.js:225`). The reviewer's
      sentence for CLAUDE.md, when the tool is named: "Before pushing a part split, a new part or a part-list
      change, run `node tools/old-page-loop.mjs --old origin/main --new HEAD`. Fix every ✗ finding. A static line
      marked 'new in this push' is real unless that line can only run after a guarded call into the new part; in
      a teacher-*.js part it hits only a console that signs in after the push, so guard the call with typeof or
      accept it, and say which in the report."
    - MINOR: the stuck-chain message says the loader "never resolves" where it can also reject on every try; the
      "cannot see" list should also name five scanner traps (`i++ / 2`, a regex after `if (…)` or after a line
      comment, a variable named `of` or `in`) and that an old page keeps its OLD eager copies of `i18n.js`,
      `styles.css` and eager helpers (new `t('…')` keys show as raw keys, new classes are unstyled); column-0
      lines inside template text start new regions (37 lines, all in `teacher-mic.js`; no run changed); the
      usage line omits `--strict`; three of the tool's code paths have no test that notices them.
    - What it still cannot see that a split could break: play-time and console-screen code only statically; names
      built at run time; new i18n keys and CSS classes on an old page; a changed signature of an eager function;
      the trainer, pdf and module files; the real browser's service-worker cache and reload timing.
    - **A true finding on main from this round, low risk:** a console tab opened before Song builder Part d's push
      and signed in after it gets the new `teacher-sb-core.js`, which calls `sbPublishPaneHtml`,
      `sbPreviewPaneHtml`, `sbPublishBtnHtml`, `sbPublishedHtml` and `sbPubChanged` (`teacher-sb-core.js:271,
      316-317, 255, 302`) with no guard, while its old list lacks `teacher-sb-publish.js`. A reload cures it.
  - **The old-page tool, review round 2 (Windows, 2026-11-16 about 22:00; a fresh Opus reviewer on `842b7b33`): 2
    BLOCKER, 1 MAJOR, 5 MINOR on the TOOL, so it is NOT named in CLAUDE.md yet; its builder is fixing them; round 3
    is the last.** What matters for the splits tonight: **the Mac's close `78f63414` is still 0 findings, 0 windows
    and 0 static lines with the second version, from `e7c1dab9` and from `3b667ba`, plain and `--strict`, and
    also with the reviewer's own patched copy that closes the two BLOCKERs below; fix A2 is 0 too.** So the tool's
    verdict on the close did not change when the tool got stricter. The lead has not re-run these.
    - The tool's faults (it said CLEAN where it should not; neither touches `78f63414`'s verdict): R2-1, its static
      pass missed inline handlers that carry `${…}` or string joins (about 150 lines on the site): a planted move
      of `ccPickRate` and `ccDoneNudge`, whose only callers are such handlers, exited 0. R2-2, the builder's own
      rule "a name NEW in the push only warns" let real breaks exit 0. R2-3, any literal `loadScriptOnce('x.js')`
      in an old-list part counted as a working bridge, even one whose condition is never true on an old page.
    - **Three of today's console pushes were real old-page breaks (found by R2-2; for the Mac to know, nothing to
      do now: only a teacher-console tab left open across the push and not reloaded):** `02afbcdc`
      (`teacher-manage.js:161` `teacherAccessMount(); teacherSongFilesMount();` throws on every Manage open),
      `22d0b860` (`teacher-core.js:1166` draws the Song builder nav item, `:1387` `renderTeacherSongBuilder();`
      throws), `9bf2b07b` (`teacher-sb-core.js:251` `sbChartReadOf` unguarded at step 4). A new console part
      plus an unguarded call to it from an older part is the pattern; a reload cures it.
  - **W6b, as first written (the Mac, 2026-11-16 about 20:00): review the Mac's close of the splits, branch
    `ci-try/coach-splits-2`, tip `78f6341` (the splits + fix A + the close, on main `8a13e6f`'s line).** A fresh
    Opus `site-reviewer-deep`, read-only; it is the Always-Reviewed round the splits still need, and Windows has
    the tool and the browser cases. The Mac agent's claims: `old-page-loop --old origin/main --new 78f6341`
    plain and `--strict` exit 0 (0 of 97 entry points, 0 findings, 0 windows; before: 7 and 8), the same from
    `--old 3b667ba`; 8 of 8 mutations red; slow-load 20 of 20; update-reload-loop 29 of 29. Its design is close to
    fix A2 above but each bridge is independent: the block writes its new part into the old page's list right
    after its parent, loads it, and makes the part the old list asks for next wait for it (`coach-ear.js` waits
    for `coach-chordcards.js`, `coach-more.js` for `coach-noterunner.js`); a failed fetch rejects the loader (the
    normal toast) and the next call fetches again. It KEPT fix A's widened per-function guards as "a second net":
    Windows' reviewer said the widened ones "do harm": say exactly what harm on this tip, with a failing case, or
    that there is none now. Attack: the tool's own blind spots named in W6's review (run those cases by hand or in
    a browser on this tip); a new page (nothing extra loads, no part loaded twice); a new list + a cached OLD whole
    parent; `coach-core.js` unchanged but for 2 comment lines. Verdict here; if it is clean (no BLOCKER or MAJOR)
    the Mac pushes the splits at once, any hour. If A2 is better, say so and the Mac swaps it in.
  - **Part d is on main (the Mac, `ce3821e`, labelled Fast on Jonathan's word; the Friday check reviews it).** So
    W9 is closed (no round 4) and W10 (the pdf pane's three edge cases) is open for Windows now.
  - **Windows' second opinion on the splits' close (`78f63414`; a fresh Opus `site-reviewer-deep` at xhigh,
    2026-11-16 night): 0 BLOCKER, 0 MAJOR, 4 MINOR. It agrees with the Mac's review: the push was right. ONE THING
    TO CHANGE, the bridge's removal date (R1-4).** The lead has not re-opened the quoted lines. Scripts and outputs:
    the Windows scratchpad `rv6b\`.
    - **The first REAL-BROWSER evidence for the close.** `update-reload-loop` (29 of 29 here) and `slow-load` (20 of
      20) never test an old page: both of update-reload-loop's versions are the tip. The reviewer built
      `rv6b\oldpage-browser.mjs`: headless Chrome with a real service worker, a served folder it switches from OLD
      (main `06cd881b`) to NEW (the splits merged onto it), able to keep `sw.js` old and to fail or delay any
      file. 34 tabs: old list + all new files works first time (incl. the second-old-tab case: the list goes 8 →
      10, 10 scripts, 17 of 17 games open, 0 errors); a failed fetch gives one toast, then the next click works;
      no banner on any old-page tab. Its Node harness on the real old loader: 1,722 schedules (all 256 old / new
      subsets × 3 arrival orders, 186 failure schedules), 42,015 calls of `gamesStopMic` / `gamesHideStop` /
      `coachMicLatencyMs`: 0 throws on a moved name, 0 parts run twice, 0 loader calls that never resolved.
    - **R1-4 MINOR, but act on it: do NOT remove the bridge on 2026-12-01** (`todo.md:102` and the five "DELIBERATE
      BRIDGE" comments). A Chromebook asleep with the site open from before the push through Thanksgiving week
      would then fail exactly as in W2 (Games, the Tuner, Record, the Coach and Note Call throw until a reload).
      The bridge does nothing on a new page: remove it at the summer reset (skill `summer-reset`).
    - R1-1 MINOR (the Mac's accepted R1-1, with its cause and a smaller fix than "variant D"): the splice into the
      old page's list (`coach-chords.js:1406` `COACH_JS_PARTS.splice(at, 0, 'coach-chordcards.js');`,
      `coach-runner.js:1103`) changes the old loader's GROUP KEY, so a caller of `ensureCoachJs()` that arrives
      after a parent ran and before its child arrived gets a new chain that resolves BEFORE the first caller's,
      against the rule at `app/boot.js:797-798` ("callers rely on their .then callbacks running in the order they
      were attached") that `caFreePlayGames` (`app/activities.js:146-153`) relies on: header Games, then the
      In-Class free-play Games button while a child is in flight: the student lands on the hub instead of Riff
      Roulette in 2 of 3 browser timings (old pages only; no error, no mic). Fix proved (22 of 22 call points in
      order, 1,722 mixes clean, the browser case 3 of 3): delete the splice line and add the child to the list only
      in the FAILURE callback:
      `e => { delete _lazyScripts[next]; if (COACH_JS_PARTS.indexOf('coach-chordcards.js') < 0) COACH_JS_PARTS.splice(COACH_JS_PARTS.indexOf('coach-chords.js') + 1, 0, 'coach-chordcards.js'); throw e; }`
      (the same in `coach-runner.js` for noterunner; the comments above each bridge then need rewording). The
      tested files are in `rv6b\keep-variants\`. Not urgent: it only affects pages opened before the push.
    - R1-2 MINOR = the Mac's accepted R1-2 (a new page meeting an old whole parent: a banner and 2 site-error
      reports, 17 of 17 games still open; a refresh clears it). R1-3 MINOR, the record: `coach-core.js` changed by
      2 CODE lines as well as 2 comment lines (`:746` and `:2551`, each `typeof nr !== 'undefined' && nr &&
      nr.micOn`): harmless.
    - **The widened guards: keep them** (the earlier "they do harm" was about fix A's guard at the TOP of a
      function; these are per call, `coach-hub.js:387, 393, 394`, so every other stop still runs). They are inert
      on this tip (0 states with `bcStop` defined and a child's name missing, in 1,722 schedules and 116 in-load
      browser probes). Remove them WITH the bridge.
    - **The close, not fix A2:** the same in every state but two: the close lets a later loader caller resolve
      first (R1-1; A2 does not), and A2's slot object would run the next part twice if two chains adopted it (not
      reachable today; the close is immune). The close with R1-1's change is at least as good everywhere.
    - A pure move re-derived (each parent + child, headers off, equals the old file; the whole arcade differs in 11
      hunks, all bridges or guards); `kill-switch` 14 of 14; `tone-test`, `closed-loop` (identical incl. REAL
      TAKES), `shared-chromebook-loop` 120 of 120.
    - For the tool (its builder has these): a slot never cleared on success is reported as "could not run" (exit 2)
      where it is a real fault; a failed child put back at the END of the list is green, because the tool never
      combines a failed fetch with an old cached hub.
  - **For the Mac to know (Windows, 2026-11-16 night): the ACTIVITIES smoke failed on `ca-53`, and it was the smoke,
    not the activity.** `node tools/smoke.mjs --en-only --only games,activities` on `199f3fe` printed 3 new lines,
    one per step of ca-53: "after 1.3 s of ▶ Play strum the lit arrows are [0], expected one, past the first". The
    Mac's run before shipping ca-53 was `--only games`, which does not walk an activity. Cause (read from the
    code, the activity not watched playing): ca-53's pattern is `D..U..DU`, its second strum three eighths after
    the first, which at the player's 60 BPM is due at 1.5 s; every earlier pattern's second strum is within two
    eighths, so the fixed 1.3 s wait had never met this. Fixed in `tools/smoke.mjs` only: while ONLY the first
    arrow is lit the step looks again for up to 2.4 s more; nothing lit, two lit, or a player that never moves
    still fails. After: `--en-only --only activities` "no JavaScript errors" (11 chord-grid cards walked). GitHub's
    Friday walk would have gone red on it. Also tonight: `console-layout-smoke` passed after W10; the live site
    matches `199f3fe`; the "Change pattern" button on Strum Hero and Strum Radar's done screens has its padding
    (`5f67250`, seen in 16 screenshots after the fix).
  - **THE COACH SPLITS ARE ON MAIN (the Mac, 2026-11-16 about 21:45, `e9c39a1`, Reviewed, 3 rounds).** Item 4 is
    done: `coach-chords.js` + `coach-chordcards.js`, `coach-runner.js` + `coach-noterunner.js`, with the bridge
    for pages opened before the push. The last review (Mac, fresh Opus `site-reviewer-deep`, on `78f6341`): 0
    BLOCKER, 0 MAJOR, 2 MINOR, "safe to push at any hour". On the rebased tip `old-page-loop --strict` exits 0 from
    `origin/main` (108,096 calls) and from `3b667ba` (263,400 calls): 0 findings, 0 windows; full `checks.mjs`
    passed; the games smoke clean. Accepted MINORs: R1-1 (on an old page, two separate arcade clicks during one
    child fetch can leave the earlier click's screen on top: 2 to 16 of 400 trials; "variant D", splice only when
    the child fails, or fix A2, would close it: not done) and R1-2 (a new page meeting an OLD whole parent in the
    old worker's cache: the child throws "already declared", the arcade works, one banner and one site-error
    entry). The rebase conflicted in `app/boot.js` and `CLAUDE.md` (the two part-list lines sit next to each
    other: main added a console part, the splits two arcade parts); the Mac resolved it line by line, each side's
    own line kept, and the tool and checks above ran on the result. Remove the bridge after 2026-12-01 (`todo.md`).
    `coach-chords.js` and `coach-runner.js` are open to Windows again.
- **W7. The setup screens taller than 657 px** (the 20 smoke lines: Change Up's setup 663 px, Power Chord Switch's
  setup in Spanish 658 px). The Mac runs the games smoke before it pushes the splits and writes its lines HERE (a
  bullet under this job). If the Mac shows the same lines: fix the fit at 1366×657 in both languages (screenshots
  before and after, CHANGELOG only if a student sees a difference; Fast; the setup screens are `coach-chords.js`,
  so wait for the splits to be on main). If the Mac shows none: write "Windows fonts only" and close it.
  - **THE MAC'S RUN (2026-11-16, on the splits' tip, `node tools/smoke.mjs --en-only --only games`): "no JavaScript
    errors", 17 game views, no `setup-fit` or `changeup-layout` line.** So Change Up's 663 px setup is Windows
    fonts only. English only was walked: Power Chord Switch's Spanish setup (658 px on Windows) is not answered by
    this run; Friday's two-language walk on GitHub will say.
  - **The Strum Hero / Strum Radar done screens have been SEEN (Windows, 2026-11-16 evening; W3's owed look; one Opus
    agent, headless Chrome at 1366×657, on `b7dae35`).** 16 screens: each game at the top of its range, one step
    below, one step above the bottom, and the bottom; English and Spanish. Every advice line and step button names
    the change the game really makes: 40 of 40 real clicks on the done-row buttons (start stubbed) landed on the
    labelled tempo; exactly one lit button on every screen; every screen fits (the done screen ends at 388 px for
    Strum Hero, 337 px for Strum Radar; the button row is on one line in both languages). The lead looked at
    Strum Radar in Spanish at 95 ("Sube de nivel: pruébalo 5 BPM más rápido…", −10 BPM, Otra vez a 95, +5 BPM lit).
    The script: the Windows scratchpad `strumshots\strumshots.mjs`.
    - **One older cosmetic fault found, not fixed (add it to W7, same file):** on all 16 screens the "Change
      pattern" / "Cambiar patrón" button under the done row has no left or right padding (its text touches its
      border) and sits flush under the row. `styles.css:1197` `.tp-btn{flex:1;padding:10px 0;...}`; only
      `.coach-actions .tp-btn` gets `padding:8px 16px` (`styles.css:2668`), and this button
      (`coach-strum.js:489` and `:1450`, `onclick="shSetup()"` / `"srSetup()"`) is outside `.coach-actions`. Power
      Chord Switch's done screen got this fix before; these two games did not. The clean fix is in
      `coach-strum.js` (put the button inside the row's `.coach-actions`, or give it the class), which is the
      Mac's file until the splits are on main.
  - **W7 (Windows, 2026-11-16 night): Change Up's setup is "Windows fonts only", closed.** The Mac's games smoke in
    English shows no `setup-fit` or `changeup-layout` line, so the 7 Change Up lines (663 px here) are this
    computer's fonts. STILL OPEN: Power Chord Switch's setup in SPANISH (658 px here, 13 lines): the Mac walked
    English only; Friday's two-language walk on GitHub answers it. If it shows there, fix the fit then. The other
    W7 item, the "Change pattern" button with no side padding on the Strum Hero and Strum Radar done screens
    (`coach-strum.js`), is being fixed on Windows now.
- **W8. The small lint findings from W4, one Fast push:** `trainer-ui.js:188` (`root` does not exist inside
  `factory`: fix the fallback, run `node tools/trainer-sim.mjs`); `tabs/journey.js:748` (the second `at`);
  `practice-minutes.js:1509` (the repeated key `_session`: remove the copy, run `node tools/pm-sim.mjs`); the 9
  unused names outside the Mac's files; and the linter's own two "did not parse" slips (`app/drills.js:774`,
  `teacher-core.js:217`: fix the reader in `tools/lint.mjs`, not the handlers). Also the two stale mentions of
  `srHearStrum` that the Mac's agent left (the 1eh header in `tools/checks.mjs` and line 8 of
  `tools/mic-sim/strum-check-replay.mjs` still say the strum check uses it).
  - **W8 DONE, shipped Fast (Windows, 2026-11-16 evening; one Opus fixer, 10 commits).** `trainer-ui.js`: the
    fallback is `deps.core || (typeof HIF_CORE !== 'undefined' ? HIF_CORE : null)` (old code threw "root is not
    defined" when `core` was left out; `trainer-sim` identical before and after). `tabs/journey.js`: the second
    `at` in `wsSectionRows` is `barAt` (295 sections, 1,770 calls, 0 differing). `practice-minutes.js`: the second
    `_session` key removed (`pm-sim` 404 passed, pin unchanged). Unused names removed, each a pure read:
    `app/cards.js` `S`, `guitar-diagrams.js` `note` in the first loop (204 diagrams byte-identical), `live-quiz.js`
    `quiz` (`live-quiz-loop` exit 0), `trainer-core.js` `r`, `trainer-ui.js` `picked` / `ch` / `sa` / `sb`.
    `tools/lint.mjs`: attributes inside comments are skipped, and a handler that does not parse is read once more
    with a placeholder straight after a closing quote dropped (957 → 956 handlers, "did not parse" 2 → 0; a
    planted unparseable handler is still reported). The comments in `tools/mic-sim/strum-check-replay.mjs` say
    `scHearStrum`; the 1eh header in `checks.mjs` was already right. Lint now: load-order 0, no-undef 129 in 29
    groups, no-redeclare 0, no-dupe-keys 0, unused 1 (`teacher-sb-chart.js:354` `m`, the Mac's). Left, noticed
    and not fixed: `strum-check-replay.mjs` ~51 calls the `base` rule "the site's" (the site's is `shapeFree`
    now) and its output lines ~388-389 still print `srHearStrum`; `tools/mic-sim/strum-check-loop.mjs:3` and parts
    of `docs/strum-check/DETAILS.md` still call `srHearStrum` the check's detector. The lint reader's matching
    changed and shipped Fast: one for the Friday check to look at.
- **W9. Only if the Mac has written "Part d round 3: fixes at <hash>" in this block:** review round 4 of that
  hash, a fresh Opus `site-reviewer`, read-only, findings here. If the line is not there, skip it.
- **W10. After Part d is on main (the Mac will say so here): the pdf pane's three low edge cases**
  (`teacher-sb-pdf.js`, `teacher-sb-core.js`: `+ New song` twice keeps the first song's pdfs; a draft switched
  during a multi-file pick; a deleted draft's pdfs kept until the view reopens). Fast; a case for each in
  `tools/song-builder-sim.mjs`, broken once. Jonathan's lens: nothing that adds a click.
  - **W10 DONE, shipped Fast (Windows, 2026-11-16 night; one Opus agent; `teacher-sb-pdf.js`, `teacher-sb-core.js`,
    `tools/song-builder-sim.mjs`; nothing that adds a click, no markup changed).** Each case red first in the sim,
    then green, then broken once. `song-builder-sim` 160 of 160, five runs of five (was 152; 1en's pin moved, the
    number only); `song-files-console-sim` 88, `built-songs-sim` 148, `backup-proof` held (pdfs are never stored,
    so never in the backup). The console layout smoke was NOT run after it (Chrome was busy).
    - **Case 2 was worse than "low": it could SAVE wrong data.** A draft switched during a multi-file pick was
      judged by id only (`const stale = () => sbStopped(gen) || sbSel !== forId;`), and every unsaved new song has
      the id `'new'`: pressing "+ New song" again during a pick sent the pdf still being read to the SECOND song;
      its chords text went into that song's chart box and Next stored it in that draft as `chart.text`. A → B and
      back to A during a pick dropped the first pdf and kept the last two. Fix: `sbPdfSync` counts its drops
      (`sbPdf.epoch`) and a pick stops when the count moves.
    - Case 1, "+ New song" twice: the second new song kept the first one's pdfs for the same reason (both ids are
      `'new'`): chips said "9 lines read" over an empty chart box. Nothing was stored. Fix: the pdfs belong to the
      new song's own object (`sbPdf.owner`).
    - Case 3, a deleted draft's pdfs: both deletes cleared the selection and then painted only when the view was
      still open, and the pdfs drop only at a paint, so leaving the view mid-delete kept the bytes, the documents
      and the "Own window" object URL in memory until the view reopened. Fix: one line at the top of `sbMemFor`.
    - **Found beside the three, NOT fixed (the Mac's files; (a) is Jonathan's call):** (a) a second "+ New song"
      also keeps the first song's MP3: `sbMemFor('new')` returns early on `if(sbMem.id === id) return;`, the file
      name shows at step 1 and Next would save the second song with it: keep it or drop it? (b) Next pressed on a
      new song while a pick is still being read: a pdf that finishes during the save puts its text into
      `sbNew.chartText`, which was already copied and is then thrown away: its chip says "lines read" but the text
      is not in the draft (nothing wrong saved; the text is lost without a word). (c) the step-4 paste box is one
      per tab, so pdf text not yet read is lost when another draft opens, as typed text already is.
    - A correction to what the lead told its agents today: the `teacher-*.js` parts ARE part of the cache
      fingerprint (`checks.mjs:87`, `...siteParts('teacher.js', ROOT)` in `SHELL_FILES`); they are only kept out of
      the precache. A change to one makes "shell cache stale" until the full `checks.mjs` rewrites `sw.js`.
**MORE FOR WINDOWS (the Mac, 2026-11-16 13:40; Jonathan: "windows is going to do the 20 error events now. update
workflow for what else you want it to work on").** After the 20 error events and rule AD's review, in this order.
Agents: Opus at high or xhigh; Fable only if Opus cannot do it. Reviews are read-only: findings go in WORKFLOW (a
bullet under the job), the Mac fixes and pushes. All three branches are on GitHub (`git fetch`).
- **W1. Review round 2 of Song builder Part d**, branch `ci-try/sb-part-d` (base `160de0a`). READY: the tip is `8eb7205` (pushed
  2026-11-16 about 14:00; `4cc5e33` plus the last cut, no OK dialog on a first Publish: Jonathan, 2026-11-16, "go
  ahead"). Review `git diff d1da871 8eb7205`; the sim says 124 cases. The builder's browser walk was NOT re-run
  after the last commit (its step S9 still expects that confirm). Round 1
  was on `d1da871`: 0 BLOCKER, 2 MAJOR, 8 MINOR, all in the "Part d" bullet of the Song builder entry). A FRESH
  reviewer (`site-reviewer`, the save path is not touched), failing scenario first. New since round 1, review all
  of it (`git diff d1da871 4cc5e33`): the two MAJOR fixes (Publish writes the song and the list in ONE transaction;
  a new mp3 not levelled closes Preview and Publish), the edit number = seconds since 2026-01-01 (Publish and
  Import), an imported song rebuilt into a draft for Edit / Unpublish (edit with no change must publish a
  deep-equal song), Export as a paired .json + .mp3 that Import takes back, Edit as one click on a step, and the
  click cuts Jonathan asked for ("as easy as possible ... with the fewest clicks"; "i don't know if three listens
  are necessary"): NO listen gate, Publish on the Preview step, a chart given at step 1 read at once, Volume
  starting by itself, Level pre-filled, and a FIRST Publish with no confirm (an edit of a live song, Unpublish and
  Delete… keep theirs). Decided, do not re-argue: those cuts; NOT cut, at the Mac's advice and his "go ahead": the
  Chart and Level steps are never skipped (the Chart step is where "the chart makes N bars; the recording has M"
  is seen), and "Listen with clicks" stays, required by nothing; over 8 pins only warns; pitch over
  10 cents blocks; R1-5 and R1-7 are accepted limits; firestore.rules does not change. Attack: what a STUDENT gets
  after each write path fails halfway or two console tabs act at once; whether anything can be published that
  fails `builtSongCheck` on a student page now that the listens are gone; the rebuilt draft of an imported song
  (bar times kept exactly? a song with a range, with lyrics, in 3/4 or 6/8, at Power or Both); auto-level starting
  when it must not (a hidden tab, a draft opened only to read it, the month's download count); the auto-read
  replacing a chart he typed; mutate at least 6 of the sim's new guards. Tools: `tools/song-builder-sim.mjs` (123
  cases), `song-files-console-sim`, `built-songs-sim`, `backup-proof`, `sim-app-page`.
  - **W1 DONE: review round 2 of Part d at `8eb7205` (Windows, 2026-11-16; one fresh Opus `site-reviewer`, read-only,
    no Chrome): 0 BLOCKER, 2 MAJOR, 8 MINOR. Nothing fixed; the Mac fixes.** The lead has not re-opened the quoted
    lines. The reviewer's cases: the Windows scratchpad `r2-cases.mjs` (they need the sim's lines 58-292 in front).
    - **R2-1 MAJOR: an Import over a song the builder published (same id) is reverted by the OLD draft on the next
      Edit + Publish; students get the old song back.** `teacher-sb-publish.js:424-425`, `sbEnsureDraft`:
      `const have = sbDrafts && sbDrafts.get(id); if(have) return have;`. Import (`teacher-builtsongs.js:254`, then
      the transaction at :262) never touches `songDrafts/{id}`. Run on the sim's stub store: published at bpm 96; a
      fixed copy imported over the same id (bpm 97.5 and a beat map), the import succeeds; after a console reload
      the song's page says "The draft has changes that are not published" (wrong: the draft is OLDER); Edit on
      Preview then Publish with no change: the stored song is back to bpm 96 with no `barTimes`, and the only
      dialog was "Publish your changes to …?". This is the skill's own round trip (Export, Claude, Import of the
      same id). Smallest fix: in `sbEnsureDraft` (and the published page's `changed` flag), when the draft's
      `savedAt` is older than the published doc's `p.at` and `sbPubChanged` is true, rebuild the draft with
      `sbDraftFromDoc` (or ask "Use the published song?"); or Import deletes / rebuilds `songDrafts/{id}`.
    - **R2-2 MAJOR: a chart whose bar count does not match the recording publishes with a ✓, and the sentence that
      explains it is hidden by the "opens on the grid" cut.** `teacher-sb-chart.js:601`
      `if(nd && sbHasChart(nd) && st.read) st.view = sbChartOpen(nd, st.read).n ? 'read' : 'grid';` runs at step 1,
      before any beat exists, and `sbChartOpen` does not count bars. "The chart makes N bars; the recording has
      about M … Hold the long ones in the grid" is only in the read view (`:496`); the grid shows a plain chip
      (`:471`); the Publish page's Chart row ends in ✓ whatever the count (`teacher-sb-publish.js:243-244`). Run: a
      chords-over-lyrics chart at step 1 makes 4 bars against a recording of 9 at 96 BPM: step 4 opens on the grid,
      the chip reads "4 bars; the recording has 9", `sbPublishWhy` returns `[]`, Publish is enabled, the Chart row
      reads "1 section, 4 bars, G C D ✓". That defeats the reason the Chart step was kept. Fix, warn only (the
      decision stands): choose the view when step 4 mounts and count `rec != null && nBars !== rec` as something to
      settle, or show the same flag in the grid; and put "N bars; the recording has M" as a warning in the Publish
      row and on the Preview step.
    - **MINOR.** R2-3: "edit with no change publishes a deep-equal song" fails for 4 docs the validator accepts (a
      level with `start` equal to `versions`: start dropped; a section whose lyric lines are all `''`: lyrics
      dropped; a chord in `chords` no bar uses: dropped; a title with a trailing space: trimmed;
      `teacher-sb-chart.js:369`, `:382`, `:190`, `teacher-sb-publish.js:88`): "Changes not published" right after
      Edit and a new edit number; students see no change. R2-4: an imported beat-map song cannot gain or lose a bar
      (`teacher-sb-chart.js:383`): Publish is blocked with validator wording ("barTimes needs one downbeat per bar
      (11, or one more for the end), at least 3"). R2-5: two tabs, Delete… against Publish of an edit, can leave a
      LISTED song with no audio (3 of 40 schedules; `teacher-sb-publish.js:392-393` against `:279-299`; both tabs
      report success; students get a card whose audio cannot load); fix: Delete re-reads the list right before
      deleting audio, or Publish's transaction re-reads the songFiles head. Unpublish against Publish: 1 of 40 ends
      listed with no doc (students skip it). R2-6: Import is still two writes (R1-1 was fixed for Publish only), and
      its failure line "students do not see it yet. Import again." (`teacher-builtsongs.js:274`) is false for an
      import over a live song; fix: one transaction, as `sbPublish`. R2-7: the step-1 auto-read wipes a chart he
      typed at step 4 and has not read yet (`sbChartDoRead`'s failure path `st.text = t`,
      `teacher-sb-chart.js:591`, through `sbSaveUpload` → `sbChartReadNow`, `teacher-sb-core.js:581-583`), and the
      first "No chords could be read in that text." is overwritten by the auto-level's note; fix: auto-read only
      when the step-1 text changed in this save, never assign `st.text` when it is non-null. R2-8: since the click
      cuts a draft that reached Preview stays saved at step 6, so opening it from the list opens on Preview and
      `sbPreviewMounted` (`teacher-sb-publish.js:139`) loads the copy: one counted download with no action
      (1,066,667 bytes counted for a copy of 800,000); fix: `sbOpen` caps a reopened draft at step 5, or Preview
      loads on the play click. R2-9: the sim misses 2 of 20 planted faults (imported bar times rounded to 1 ms
      survive because the fixture's times are whole ms; deleting the `driftFor !== sha` blocker in
      `sbPublishWhy`, `teacher-sb-publish.js:213`, survives), and three texts still speak of the listens
      (`tools/checks.mjs:19822` 1en's pass line, CLAUDE.md:154, the sim's header lines 46-47). R2-10: an imported
      song with no `gainDb` prints "levelled to the cure (−0.0 dB)" (`teacher-sb-publish.js:238`).
    - **Did not break.** `song-builder-sim` 124 of 124, stable over 5 of 5 runs on Windows;
      `song-files-console-sim` 88 of 88; `built-songs-sim` 148 of 148; `backup-proof` held; `checks --check` on the
      tip against the `d1da871` control: identical failure sets, 1en passes. 18 of 20 of the reviewer's mutations
      red. 15 imported docs round-trip deep-equal with bar times bit for bit (3/4, 6/8, a beat map with non-ms
      times, a range, lyrics, Power, Both). Edit numbers: two publishes in one second, a clock set back, an older
      Import over a newer song all get a fresh number. Escaping of titles, artist, notes and file names; a hostile
      `.json` (`__proto__`, wrong types, an id with `/`, huge arrays) is refused. No write to `config/class` or
      `progress/`. Auto-level does not start without an mp3 picked in this tab and downloads nothing. Nothing
      publishable was found that a student page refuses.
    - **Not done:** a browser walk (the builder's step S9 still expects the first-Publish confirm, which is gone);
      whether re-levelling an imported song shifts its kept bar times (the encoder's delay; line 707 skips the
      drift reset for `fromImport`): that needs a real decode.
- **W2. Review of the two coach splits**, branch `ci-try/coach-splits`, tip `d6c3e16` (base `3b667ba`; item 4 of
  the list below; the agent's report is in its WORKFLOW bullet on that branch). `site-reviewer` (load order and
  the `sw.js` lists: Always Reviewed). Re-derive, do not trust: each new part joined to its parent is the old file
  byte for byte; `COACH_JS_PARTS` and every `sw.js` list name both new parts in load order; nothing runs at load
  across a cut; every tool that reads a coach part by FILE NAME still finds what it reads; `kill-switch/proof.mjs`
  14 of 14. And the deploy question, answered with file:line: a student who opens the arcade for the first time
  within minutes of the push, under the old worker or the old part list. Is "push after school" enough, or does
  the push need an order (for example the new parts shipped in `sw.js` one push before the cut)? The Mac pushes
  it after school only if this comes back clean.
  - **W2 DONE: review of the two coach splits at `d6c3e16` (Windows, 2026-11-16; one fresh Opus `site-reviewer`,
    read-only, no Chrome): the split itself is CLEAN; 1 BLOCKER about the DEPLOY, 0 MAJOR, 3 MINOR (docs). DO NOT
    push the cut as one plain push: "after school" is not enough.** The lead has not re-opened the quoted lines.
    The reviewer's scripts: the Windows scratchpad `rev\` (`mixed.mjs`, `mixed-shim.mjs`, `loadtrace.mjs`,
    `strip.mjs`).
    - **R1-1 BLOCKER (deploy).** A page opened BEFORE the push holds the old 8-name `COACH_JS_PARTS` in memory. If
      it loads the arcade after the push it fetches the SHORTENED `coach-chords.js` and `coach-runner.js` and never
      asks for `coach-chordcards.js` or `coach-noterunner.js` (part URLs carry no version: `loadScriptOnce(src)`).
      Not only Games breaks: `gamesStopMic(true)` throws "cbStop is not defined" (the guard at `coach-hub.js:380`
      `if (typeof bcStop !== 'function') return;` passes because `coach-more.js` did load; `:383` `cbStop();`
      throws), and its callers are every game and the hub (`coach-hub.js:789`), the Tuner (`fab-tools.js:373`),
      Record Yourself (`app/review.js:380`), the Coach check (`coach-core.js:470`), Note Call
      (`app/drills-call.js:268`), the strum check (`coach-strumcheck.js:432`), Hear It First. `gamesHideStop()`
      throws "nr is not defined" on every hidden tab (`coach-core.js:2527`); the hub render throws
      (`coach-hub.js:688`); `coachMicLatencyMs()` throws (`coach-core.js:873`). Each throw also raises the "Something
      went wrong" banner and a site-error report. Proved in a vm with the old list and the tip's files (controls on
      base and tip pass); `node tools/sw-upgrade-proof.mjs --old <3b667ba> --new <d6c3e16, CACHE_VERSION changed>`
      shows it as scenario 3's finding (the 8-file list gets 9,995 lines; the arcade is 12,082).
      **When it bites:** (1a) before the page has checked for an update, the OLD worker serves the old whole files
      from its cache and the page works, but each of those requests overwrites that cache with the short file
      (`sw.js:561` `cache.put(req, res.clone())`), so a second old tab, or this tab's next arcade start before the
      takeover, is broken until a manual reload; (1b) an old cache that never got a coach part fetches the short
      file: broken until a manual reload; (2a) after the new worker takes over, a tab that is not busy reloads at
      once and is fine; (2b) a BUSY tab (auth, mic, recording, a drill, an exit check part-way, Note Call, a card
      playing) waits up to 5 minutes (`app/start.js:73` `SW_RELOAD_MAX_WAIT`), and Games, the Tuner, Record or the
      Coach opened in that wait are broken until the reload; (3) a tab that had already loaded the arcade is safe.
      A Chromebook closed with the site open keeps the old page alive overnight, so "after school" does not drain
      these pages: 1a, 1b and 2b then happen in class.
      **Fix A, one push (recommended):** append one guarded line to the end of each shortened parent, so an old
      page loads the new part itself: in `coach-chords.js`
      `if (typeof COACH_JS_PARTS !== 'undefined' && COACH_JS_PARTS.indexOf('coach-chordcards.js') < 0 && typeof loadScriptOnce === 'function') loadScriptOnce('coach-chordcards.js').catch(() => {});`
      and the same in `coach-runner.js` with `'coach-noterunner.js'`. Proved in the reviewer's harness: old list +
      new files + these lines: every call above is fine and exactly the two new parts are loaded; with the new list
      nothing extra loads. To close the remaining race, widen the guard in `gamesStopMic` / `gamesHideStop` to
      `typeof bcStop !== 'function' || typeof cbStop !== 'function' || typeof nrStop !== 'function'`. It is a
      deliberate non-move edit: say so in the commit, and put its removal on the summer-reset list (or remove it
      after a week). With fix A the push time no longer matters.
      **Fix B, no code, two pushes a school day apart:** push 1 adds the two names to `COACH_JS_PARTS` and `sw.js`
      ASSETS with the new files holding only their header and the parents still whole; push 2 moves the code. Less
      risk, not zero (a page alive since before push 1 can still break).
      Either way the Mac runs `node tools/update-reload-loop.mjs` (Chrome) and the `sw-upgrade-proof` command above
      on live main → the rebased tip.
    - **MINOR (docs).** R1-2: `docs/strum-check/LISTENING-DESIGN-2026-11-16.md` `:187` (line numbers of
      `srHearStrum`: `coach-strum.js:1256`, the copy 1257-1262 at the tip) and `:205-207` ("Stale comments found,
      not fixed": `d6c3e16` fixed all three) are stale. R1-3: `todo.md:91` says 1,091 lines; the tip is 1,094.
      R1-4: nothing pins the part order the `bcStop` guard relies on (optional: a one-line pin in `checks.mjs`).
    - **Did not break.** Byte identity: each parent + its new part (header off) equals the base file (`cmp`), and
      `siteSource('coach.js')` base against tip with comments and white space stripped is identical (352,041
      chars; the stripper catches a planted edit); every non-move hunk is a comment or doc except the two lists,
      and the three rewritten comments are true. Lists: `COACH_JS_PARTS` and `sw.js` ASSETS `:290-299` in order
      (the only list naming coach parts). `checks --check` base against tip: the same audio noise plus "shell cache
      stale"; 1cv goes from 3 parts over 2,000 to 1 (`coach-core.js`). `kill-switch/proof.mjs` 14 of 14. `lint.mjs`:
      load-order 0, no-undef 130 on both. Load order: 0 load-time global lookups in the four files (a planted
      cross-cut reference is caught); 23 moved lexicals, none read at load by an earlier part. Tools: none reads a
      cut parent by file name; `plant-a-fault`'s listening targets all stayed in `coach-chords.js`; `tone-test`
      identical; `listen-loop --game=runner` JSON byte-identical (72 takes, 1,152 notes); `closed-loop` identical,
      real takes included; `shared-chromebook-loop` 120 of 120. Rebase onto main conflicts only in WORKFLOW.md.
      The builder's own proofs were run on `1e2c6fa` and `95f7c0b`, not on `d6c3e16` (which is comments only).
- **W3. The owed ratchet: a `checks.mjs` detector for "a clamped step named as 10".** Change Up, Strum Hero and
  Strum Radar each said "10 BPM" when only 5 was left at the end of their range (fixed: `95afba0`-era for Change
  Up, `b21fc07` for the other two). Three copies, so the sweep ratchet asks for a detector: it must RUN each
  game's done screen at every tempo of its range, both directions, and compare each button and advice number with
  what the game's own Again function then does (the Mac agent's scratch script did this for 52 screens: re-derive
  it; the numbers 20 of 52 before and 52 of 52 after are its claim). Any other game with a step control (grep the
  arcade for `Again(`) joins it. A new kind of check: Always Reviewed, broken two ways, totals pinned. Also look
  at the Strum Hero / Strum Radar done screens at 1366×657 at the top, the bottom and one step from each (not yet
  seen in a browser).
- **W4. `node tools/lint.mjs` on main** (it cannot start on the Mac: an npm cache error): read every name it lists
  that no script defines and every load-order slip, against today's four new parts (`teacher-activities-2.js`,
  `teacher-sb-pdf.js`, and after their pushes `teacher-sb-publish.js`, `coach-chordcards.js`,
  `coach-noterunner.js`). Report only; fix nothing in the Mac's files.
  - **W4 DONE (Windows, 2026-11-16; one Opus auditor read every finding; report only).** The linter could not start
    on Windows either (the space in "guitar-class website" split its own path when npx ran through a shell): fixed in
    `tools/lint.mjs` (`c7456d8`), it runs now. On main `3ad1086f`: ESLint over 79 scripts + 18 inline blocks + 957
    inline handlers on 13 pages: load-order 0; no-undef 130 uses in 30 groups; no-redeclare 1; no-dupe-keys 1;
    unused 9; 2 handlers "did not parse". **No real fault: nothing a student or the teacher can hit.** All 30
    no-undef groups are safe: a `typeof` guard, or lines no Journey page can reach (`live-quiz.js`'s `escHtml` ×64
    and `escAttr` ×18 run only under `lqRenderStudent()`, which stops at `:847` when the page has no
    `#live-quiz-body`, or under the console's renderer; a Journey page's banner and invite are built from DOM nodes
    with no esc helper). One LATENT fault: `trainer-ui.js:188` `deps.core || root.HIF_CORE`: `root` does not exist
    inside `factory`; the only caller passes `core`, so the right side never runs (Hear It First, hidden from
    students). Harmless: `tabs/journey.js:748` re-declares `at`; `practice-minutes.js:1509` repeats the key
    `_session` with the same value as `:1506`. The 2 "unparsed handlers" are the linter's own slips, not dead
    buttons (`app/drills.js:774`, a placeholder straight after a quoted string; `teacher-core.js:217`, a comment).
    New since this morning (`ce56374`, 76 → 79 scripts): only an unused `m` at `teacher-sb-chart.js:354`. The
    linter reads the part lists through `siteParts()` and `index.html`, so a new part is linted in its real load
    order with no edit. The two branches: `ci-try/coach-splits` `d6c3e16` (81 scripts): no new finding of any kind,
    load-order 0; `ci-try/sb-part-d` `8eb7205`: two unused variables in `teacher-sb-publish.js`, `:233` `v` and
    `:494` `when` (the publish date is worked out and never shown: was it meant for the `ta-meta` line?). FOR THE
    MAC: those three unused variables.
  - **The 20 smoke "error events" on the Windows computer are read (2026-11-16).** All are a setup screen measured
    taller than 657 px at 1366×657, none a JavaScript error, all present before today's work: Change Up's setup 663
    px (the default, a 2-chord and a 3-chord loop; 7 lines, EN + ES), Power Chord Switch's setup in Spanish 658 px
    (12 pairs and the songs view; 13 lines). Likely this computer's fonts (not confirmed). **For the Mac, one run:**
    `node tools/smoke.mjs --en-only --only games`: if it lists the same `setup-fit` / `changeup-layout` lines, the
    screens overflow on the class Chromebooks too and need fixing; if not, it is Windows only. Seen ONCE in three
    runs here: `[strum:ca-52 step 1 en]` "at bar 1 the bar being played, the board or the button is outside the
    window" with the bar marker not found (`"c":null`): a timing flake until it is seen again.
  - (The commit before this one, `aa48636`, wrote this W4 text with its code names stripped and a lint listing
    pasted into it: a quoting slip in the Windows lead's shell command. This is the corrected text.)
- **W5. `tools/console-layout-smoke.mjs` exits 1 on main, and did before today** (the Mac's console-size agent, on
  `3b667ba` and after, line for line): Manage scrolls sideways 165 px at 1366, five lines from the Practice minutes
  goal box, Manage +917 px at 390. Find the commit that broke each (the Manage tabs, `b40c35f`, is the first
  suspect), fix the 1366 ones (`teacher-manage-layout.js`, `teacher-manage.js`, `styles.css`: the Mac is out of
  those files now), decide with a line in WORKFLOW whether the 390 one is in scope (phone width is not), and get
  the tool back to exit 0. Fast.
  - **W5 DONE, shipped Fast (Windows, 2026-11-16; one Opus agent; `tools/console-layout-smoke.mjs` exits 0, two runs
    in a row).** The 7 failing lines here were the Mac's 7; nothing fails only on Windows (the two Manage numbers
    are 25 px smaller here: fonts).
    - **Manage scrolling sideways (1366 and 390): the layout was wrong, and the cause is `b39299fb` ("Manage: delete
      one student…"), not the Manage tabs `b40c35f`.** It added a last column whose header is
      `<th><span class="sr-only">More</span></th>`; `.sr-only` is `position:absolute`, and its scroll box
      `.tg-grid-wrap{overflow-x:auto}` was not positioned, so the span was placed against the page, escaped the
      clip and sat past the table's right edge (measured: the page's scrollWidth equalled that span's right edge,
      1491 against 1351 at 1366, 1267 against 375 at 390). It bites when a roster name is long (the tool's stub has
      one; `manage-layout-smoke`'s short names fit, which is why that smoke never caught it). Bisect on copies:
      `b39299fb^` neither line fails, `b39299fb` both. Fix, one rule in `styles.css`:
      `.tg-grid-wrap{overflow-x:auto;position:relative}`; after: 1351 of 1351 at 1366 and 375 of 375 at 390. The
      lead looked at Manage → Students at 1366 after the fix: no page-wide scrollbar; the roster scrolls inside its
      own box when a name is long, as before.
    - **The five goal-box lines: the tool was stale, the box is right.** `ac0a2ad7` raised the cap ("takes 0 to 600
      (was 7 x 20 = 140)") without updating the tool. It now tries 601 and expects "whole number from 0 to 600,":
      the same 3 bad entries with the same 2 assertions each, nothing loosened; break-it: the cap set to 700 turns
      it red (`goalbox: "601" wrote something`).
    - **The 390 decision:** the 390 Manage check is a kept guarantee (it passed before `b39299fb`); the Manage tabs
      did not break it; the same rule that fixed 1366 fixed it; no tool change, no new breakpoint.
    - Also run: `manage-layout-smoke.mjs` 40 passed, 0 failed. A teacher sees this, not a student: no CHANGELOG.
  - **W3 DONE, shipped, Reviewed (Windows, 2026-11-16 evening): check 1ep is on main.** Round 2's nine MINORs are
    fixed, each with the reviewer's planted fault turning it red: of that reviewer's 26 faults 24 are red with a
    specific line and 2 are stated limits (which chords a random loop re-draws; a step that also wipes saved bests
    or writes localStorage); of round 1's 31, all as before. It now runs every game's REAL start with only the mic
    stubbed and reads the tempo the game then plays (so a cap applied after the mic opens is seen, in Change Up and
    Strum Radar too); every advice line must match a listed key (a new sentence fails with "add its key to
    ADVICE.up / down / top / bottom / same"); every step-looking `<button>` in the code must call a swept Again, a
    setup tempo control or the done-row stepper, or be one of four named exceptions (`OTHER_STEPPERS`:
    `coachNudgeBpm`, `ccLiveBpm`, `ccNudgeNext`, `downloadRec`, each with its reason in the code; the lead has not
    judged those four: the Mac or the Friday check should). One verdict hash over 5 orders of running. Cost: 1ep
    alone takes 2.2 to 2.5 s (async now). Before-the-fix counts with the final rules: 754 and 726 red lines.
    The text below was written while it was in review:
  - **W3 status as of the second review (kept for the record).** The detector is check 1ep
    (`checkClampedSteps()`, branch `win/w3-2026-11-16`, local to Windows; `tools/checks.mjs` only, no game file).
    It draws the real done screen of Change Up, Power Chord Switch (pair and song switch), Strum Hero, Strum Radar
    and Riff Runner at every tempo, in every outcome, EN and ES (2,272 screens, 5,328 buttons), presses each Again
    button's own onclick and compares the label and the advice with what the game then plays; a scan of the code
    fails on a done-screen Again that it does not sweep. On the game files before the fixes it prints 751 red lines
    (`8498f24d^`) and 723 (`b21fc075^`); it found no fourth copy of the fault today. Review round 1 (Opus): 0
    BLOCKER, 2 MAJOR (a false "The tempo cannot go higher" beside a working +5 passed; a new game was invisible),
    5 MINOR: fixed. Round 2 (a fresh Opus reviewer): 0 BLOCKER, 0 MAJOR, 9 MINOR, "ship once the MINORs are
    fixed"; the builder has them now, no further round. It is green with the coach split (`d6c3e16`) applied, and
    it merges cleanly over rule AD's 1eh edits. It adds about 1.4 to 1.8 s to `checks.mjs`. Still owed with it: a
    look at the Strum Hero / Strum Radar done screens at 1366×657 at the top, the bottom and one step from each.
  - **Also on Windows (2026-11-16 evening).** The open bug below, "Sweet Child O' Mine — Lyrics and Chords" (`ca-45`)
    not scrolling properly in full screen: Jonathan gave it to Windows; one Opus agent is reproducing it in
    headless Chrome (1366×657 and 2560×1300, full screen on and off, against "the cure"'s sheet). It may fix
    `app/cards.js`, `app/snippets.js` or `styles.css`; if the cause is in `app/activities-2.js` (the full-screen
    switch, the Mac's file) it stops at the diagnosis and the change is written here for the Mac. THE MAC: do not
    start on that bug. Owed: the change smoke on the rule AD push (`545172c`; live site confirmed), waiting for
    Chrome. A watcher on Windows fetches every 5 minutes and reads this file whenever the Mac pushes, so new work
    for Windows can simply be written here.
- The Mac keeps: fixing what W1 and W2 find, the pushes of Part d and the splits, the three low edge cases of the
  pdf pane (`+ New song` twice keeps the first song's pdfs; a draft switched during a multi-file pick; a deleted
  draft's pdfs kept until the view reopens), and anything Jonathan finds testing the builder.

**WHO DOES WHAT (the Mac, 2026-11-16 11:10, after Jonathan asked whether Windows can take separate tasks): the list
is split by file, so both computers work at once.**
- **The Mac:** item 1 (an Opus agent is building it now: `teacher-activities*.js`, `app/activities*.js`), item 4
  (the two splits: `coach-chords.js`, `coach-runner.js`, `COACH_JS_PARTS`, `sw.js` lists; pushed after school, not in
  class hours), item 5 (the Friday entries, Jonathan's three calls, the Journey Metronome measurement, Strum Hero /
  Strum Radar's "10 BPM"), and the Song builder (`teacher-sb-*.js`: "Follow the band's beat" is being built, then
  Part d). From item 6 the Mac takes the stale comments in `coach-hub.js:144`, `coach-runner.js:951` and
  `coach-strum.js:1238` (they move with the splits).
- **Windows:** item 2 (rule AD: `coach-strumcheck.js`, `tools/mic-sim/`, check 1eh; its own branch and the
  reviewer's scripts are on that computer), item 3 (`micRecStartPerf`: `coach-core.js`, its own branch), and the
  rest of item 6 (`tools/smoke.mjs` walks, the Listening Coach count-in Stop in `coach-core.js`, the two sims'
  turn-count waits, `tools/checks.mjs` ~17115's comment, `.gitignore`, the change smoke owed on its own pushes).
- **Neither touches the other's files.** Shared files (`WORKFLOW.md`, `CHANGELOG.md`, `tools/checks.mjs`, `sw.js`'s
  version line, `app/boot.js`): fetch and rebase before every push; in `checks.mjs` Windows edits only 1eh and the
  ~17115 comment, the Mac only its own pins. `coach-core.js` is at 2,549 lines: Windows says in its report if item 3
  takes it past 2,600 and stops there (its split is Jonathan's call).
- **Windows, where its three items stand (2026-11-16, late afternoon; every agent Opus, reviewers at xhigh):**
  - **Item 3 SHIPPED, Reviewed (`53b1e3f`).** `micRecStartPerf`: one deep review round on the branch, 0 BLOCKER, 0
    MAJOR, 4 MINOR. The reviewer's own 19 conditions (cold start, late handlers, dropped buffers, 44.1 kHz): the new
    stamp about +1 ms where the old one was about −95 ms, better in 19 of 19. The Firestore rule for `micTakes` has
    no field list, so `recClock` / `recClockShiftMs` are accepted. MINORs fixed: two comments that claimed too much
    (a fast device clock makes the stamp early by drift × the take's length, 500 ppm over 60 s about 28 ms, still
    nearer than the old estimate); the tool's `burstOfQuantum` (mismatches 864 and 600 of 3,000 → 0, verdict
    unchanged); a two-takes-in-one-page case (red on two planted "leaks between takes" faults).
    `tools/mic-sim/micrec-clock.mjs`: 13 of 13, 1 of 13 on the old code. `coach-core.js` is 2,552 lines (48 under
    the limit). NOT measured by anyone: a real take saved after the fix; the first new ones should fit within about
    15 ms (`recClockShiftMs` near +92 on a Chromebook). The 2 old takes that read about 130 ms early are still
    unexplained.
  - **Item 6, the Windows part, SHIPPED, Fast (`6bfbbed`).** The two smoke walks wait for the page (11 of 11
    reloads). The Listening Coach: the count-in has no Stop button; the overwrite was "I'm done" pressed early in
    the listening phase (a full take of 10.24 s / 6 notes replaced by 4.52 s / 0 notes). Now a take that ran to its
    end always saves, an "I'm done" take saves when at least one note was heard, an empty early one saves nothing
    (`coachFinish(ended)`, `ended === true`); new tool `tools/mic-sim/coach-take-save.mjs` 9 of 9, 6 of 9 on the old
    code; the closed loop identical before and after. The 1eh header comment names `scHearStrum`.
    `tools/__pycache__/` is in `.gitignore`. The two sims (`song-files-console-sim`, `built-songs-sim`) were LEFT
    ALONE: the race could not be shown (88 of 88 cases with the hash slowed to 300 ms; the other makes no hash call,
    148 of 148 with its IndexedDB timers slowed). The change smoke owed on the Windows pushes ran twice (`games`,
    `activities`, English; baselines `f2e8952` and `e80ca7e`): no error beyond the baseline. Both the baseline and
    today's code show the same 20 error events on this computer; nobody has read what they are.
  - **Item 2, rule AD: SHIPPED, Reviewed (2026-11-16, 18 commits; three Opus deep-review rounds at xhigh, each by a
    fresh reviewer).** What is live in `coach-strumcheck.js` (`SC_RULE` is `strumcheck-3`): A, a sound outside
    every window costs `SC_ANCHOR_REST` in `scAnchorSearch`; D, when at least `SC_ANCHOR_LOCK_MIN` (4) earlier
    onsets fit the grid perfectly, this onset may move it only `SC_ANCHOR_LOCK` (0.25 of an eighth); the test that
    decides whether the WIDE search runs scores the grid without the outside cost (round 5's MAJOR); the wide
    search looks around the CLICK grid, not the grid it has ("W0", round 6's BLOCKER). Round 7: 0 BLOCKER, 0 MAJOR,
    3 MINOR, "ship"; the MINORs fixed with break-its. Numbers the round-7 reviewer re-ran itself:
    - **Round 6's BLOCKER was live on main BEFORE AD** (since the pattern-shape grid of 2026-11-14): a late-starting
      right player plus one extra sound in bar 1 got the grid stuck 5 eighths off and all 8 bars red. Starts from 4
      eighths early to 8 late, 2,000 made-up rounds a row, all-red rounds before AD / with the final code: one stray
      sound in bar 1 72 → 0; one bar-1 strum heard twice 122 → 0.
    - The three real takes at the kept clock and ±20 ms: strums heard 379 of 414 (before AD 378), false extras 3 of
      138 (the same), bars right 36 of 72 (35), right chords 66 of 69 (the same). One of his own strums pasted into
      a rest: caught 115 of 180 (before AD 38), the mistake bar still passed 32 (83).
    - Right players, 19 kinds, 2,280 made-up rounds: the final code lost 3 or more bars against before AD in 6
      rounds, all with stray sounds or doubled strums.
    - **Known costs, all in `docs/strum-check/DETAILS.md` section 29 (Jonathan has seen the first group and chose
      "AD with the fix"):** any sound the mic hears on a rest is an extra (a foot tap on each beat, half heard: a
      right player's bars right 321 → 245 of 480; a neighbour's guitar 381 → 329; beat 3 is the pattern's rest);
      the bench talk room, a right player 28 → 19 of 64 bars; a late starter loses 0 to 3 bars of 80 against AD as
      first built, and at 60 BPM, 3 eighths late, 133 → 120 of 160 against before AD; W0 can reach a grid 5 eighths
      away (a settled late player with one strum unheard and one sound on a rest: worse in 55 of 432 such rounds;
      across 3,840 rounds of all kinds worse in 6, better in about 100); exact ties now go toward the click grid
      (only at 60, 100, 125 BPM); an extra on bar 1's first rest is still almost never caught (1 of 27 real
      splices). Not measured on real audio: talk, a Chromebook mic, an up-strum extra.
    - Tools: `tools/mic-sim/strum-check-replay.mjs` carries the rule as settings and checks its copy against the
      real code before every replay (13 constants, 488 made-up rounds; `--no-self-check` skips it, 8 s against
      about 26 s); check 1eh pins both halves of AD, the lock, a floor for dragging players (158 of 320) and six
      late-starter rounds (about 1.9 s, was 0.2 s). R4-2 (loud talk near the mic is not gated) stays a known limit.
    The history before the ship, as written while it was in review:
  - **Item 2, rule AD: built; review round 6 was running when this was written.** Branch `win/ad-2026-11-16` (local to
    Windows, 11 commits, tip `c53255a1`). Round 5 (on AD as first built, `1338af63`): 0 BLOCKER, 1 MAJOR, 4 MINOR.
    The MAJOR: rule A also lowered the score that decides whether the WIDE search runs, so one extra on bar 1's
    first rest made the grid jump 3 eighths and bar 2, played right, went red (made-up rounds, bar 2 passed: before
    AD 518 of 1,120, AD as first built 240). Jonathan chose "AD with the fix" (2026-11-16): the trigger now scores
    the grid without the outside cost (531 of 1,120). After the fix, builder's numbers: the three real takes ±20 ms
    identical to AD as first built (heard 379 of 414, before AD 378; false extras 3 of 138 both, NOT the "1 of 138"
    written in item 2 below: one J01 rest counted at each of the 3 clocks; bars 36 of 72, before 35); pasted-in
    extras caught 115 of 180 (before AD 38), the mistake bar still passed 32 (before 83). A cost Jonathan has seen
    and accepted: with AD ANY sound the mic hears on a rest is an extra, not only talk (made-up rounds, a right
    player's bars right of 480: a foot tap on each beat, half heard, 321 → 245; a neighbour's guitar 381 → 329;
    stray sounds one a bar 426 → 388); beat 3 is the pattern's rest, so a heard foot tap there is an extra; none of
    these sounds is in the three real takes. Ships only on a round with no BLOCKER or MAJOR.
  - **Still open from these items:** `micrec-clock.mjs` and `coach-take-save.mjs` are NOT run by `checks.mjs`
    (Windows may edit only 1eh there today): wire them in at a quiet moment (a new kind of check: Always Reviewed).
    The Strum Pattern check and the Listening Coach save to the SAME take slot (`<uid>-coach`,
    `coach-strumcheck.js:480` `micRecStart('coach', …)`), so each overwrites the other's last take; `fields.game`
    tells them apart; a slot of its own needs a `firestore.rules` change (the take id must match
    `(coach|nr|pw)`) and a console paste. **SETTLED (Jonathan, 2026-11-16): "it should keep the latest recording only".** One slot, the latest take wins, whichever of the two games made it: that is what the code does today, so nothing changes and no rules paste is needed. Do not re-raise it (this closes the open note R1-2 of the Strum check reviews).
1. [x] **Console: "Keep in Today's activities" (Jonathan, 2026-11-16: "for the teacher dashboard, add an option
   next to the release date that has a checkbox for 'keep in today's activities'. use an opus agent to make
   this").** Built 2026-11-16 (entry "Keep in Today's activities" under "Recently shipped"; the lead reviews and
   pushes it). Build it with ONE Opus agent in its own worktree. Where: the release-date control of an
   activity (`teacher-activities.js` ~326, `data-set-activity-date`). The Windows lead's reading, to confirm from
   the code before building: a ticked activity stays in the student's "Today's activities" on the days AFTER its
   release date until unticked; default off. Read how Today is chosen first (`caTodayHeadHtml`, `app/activities.js`;
   "Today's activities by date", 2026-11-09) and how "Now" / pins already keep things on a page, so this is not a
   fourth way to say the same thing; report every interpretation made. It is a `config/class` write: only through
   `teacherWriteConfig()`, so Always Reviewed (`.claude/rules/teacher-console.md`: `two-consoles-loop.mjs` before
   and after, `visible-loop.mjs`, `classConfigSignature`), both step renderers if a student sees a new field, the
   default pinned in `checks.mjs`, smoke clicks it and reloads, screenshots at 1366×657, a CHANGELOG line only if
   a student can see a difference.
2. [x] **DONE 2026-11-16 by Windows (shipped, Reviewed; see "Item 2, rule AD: SHIPPED" in the block above).** The item as written: **Strum Pattern check R4-1: build rule "AD" (Jonathan chose it 2026-11-16, "Build AD").** A strum on a rest
   is excused about half the time because `scAnchorSearch` slides the grid so the extra lands between windows.
   Rule A: a sound outside every window costs `SC_ANCHOR_REST` too (`coach-strumcheck.js:599`, was
   `if (Math.abs(d) > s.win) continue;`). Rule D ("lock"): read its exact code from the settings `outPen` (A),
   `dupOnce` (C), `lock` (D) in `tools/mic-sim/strum-check-replay.mjs` on branch `win/r41-2026-11-16` (commit
   `dfad3dbc`: the tool's copy of the detector got those settings, `--copy=<json>`, `--cands`, `--no-bench`,
   `--splice`; cherry-pick it first) and from the reviewer's `dsim.mjs` variants (fixA / fixC / fixD / fixAD;
   that script is in the Windows scratchpad only, so re-derive D from the tool). Measured by an Opus agent on the
   three real takes (kept clock and ±20 ms; the lead confirmed only the baseline, which equals the takes' README):
   right playing, A = AD: strums heard 379 of 414 (today 378), false extras 1 of 138 (today 1), bars all right 36
   of 72 (today 35), right chords the same. One of his own strums pasted into a rest (`--splice`, 180 splices):
   caught today 38, A 88, C 117, D 98, **AD 115**; the mistake bar still passed today 83, A 49, AD 32. C costs on
   right playing (J01) and is not chosen. Bench cost, the talk room only: a right player's bars right 28 of 64
   today, A 20, AD 17 (false extras 15, 39, 47 of 128); no real take has talk in it. Build AD in
   `coach-strumcheck.js`, prove the tool's `--copy` for AD is IDENTICAL to the built code on all 3 takes, add a
   1eh pin that sends a jittered bar plus one extra through `scHearStrum` then `scOnset` (red on today's code),
   run the bench rows of `DETAILS.md` sections 22 / 23 before and after, then a fresh deep review (danger zone),
   then correct `CHANGELOG.md`'s 2026-11-14 line "(green: heard in its place; red: missed, or a strum on a dot)"
   only if it is still untrue, and the comment at `coach-strumcheck.js` ~80 and 1eh's head comment (both say R4-1
   is open). Add R4-2 to the known limits of the entry "Strum Pattern check `ca-52`".
3. [x] **DONE 2026-11-16 by Windows (`53b1e3f`, Reviewed; the block above).** The item as written: **`micRecStartPerf`: review and ship the fix on branch `win/micrec-2026-11-16`** (`e492b66` the test tool
   `tools/mic-sim/micrec-clock.mjs`, `e3a7019` the fix; one Opus agent; base `cb89a7b`, so rebase). Its report,
   not yet checked by anyone: the stamp treated the ScriptProcessor's `playbackTime` as the END of the input
   buffer, and Chromium gives the time the OUTPUT buffer plays, so a take's start is one buffer late (85.3 ms at
   48 kHz, 92.9 at 44.1) plus the first handler's delay, minus how stale `currentTime` was. On the 46 summaries
   (43 fitted): median +92.1 ms, 40 of 43 between 48 and 107; 2 takes about 130 ms EARLY (a device not started
   yet is the guess, not proven). No live grading reads the stamp and no consumer adds a fixed correction
   (`teacher-mic.js` `mapMs`, `eval-takes`, the replays all fit each take). The fix: each handler records "now
   minus everything captured so far" and keeps the earliest (`rec.startMin`); new takes save `recClock: 2` and
   `recClockShiftMs`; the old formula stays as `micRecStartPerfV1` for hand-built captures. Proof claimed: the
   tool 1 of 12 on base, 12 of 12 fixed; 8 of 8 mutations red; tone-test pinned; closed loop 0 of 10,080 virtual
   and 0 of 315 real-take changes differ. `coach-core.js` goes to 2,549 lines (limit 2,600: the split in the
   design document becomes urgent). It is recording code in the listening file: Always Reviewed, deep. The 2
   early takes: if a new take with `recClockShiftMs` near −130 replays near 0, it was the stale clock; if not,
   record from the game's own source node next. The stale notes to fix with it: `strum-check-replay.mjs` header
   lines 10-14 and its THE CLOCK FIT comment, `docs/strum-check/DETAILS.md` lines ~597 and ~681.
4. [ ] **Split two big parts** (job 3 of the Windows list; Jonathan, 2026-11-16: "Split now": the newer list
   applies, golden is run before and after as extra evidence, not as the gate). An agent's map, not yet checked
   by the lead: `coach-chords.js` line 1393 to the end (CHORD DIFFICULTY RANKS, CHORD BLITZ, CHORD DETECTIVE; no
   grading code, `ccLoop` / `ccResolvePend` / `ccFinish` keep their line numbers) into `coach-chordcards.js`
   right after it (1,392 and 770 lines; the Change Up done-screen fix of today added a few lines, re-count);
   `coach-runner.js` line 1092 to the end (NOTE RUNNER whole, with its RACE LANE block and judge) into
   `coach-noterunner.js` right after it (1,091 and 1,303). Both are the tail of their file, so the joined
   `siteSource('coach.js')` must be byte-identical before and after. Load order: neither tail runs anything at
   load but its own `const` / `let`; no other part reads a moving name at load (0 of 26, traced);
   `GAMES_SESSION_KEY_PREFIXES` and `gamesResetForUser()` move with Note Runner. Register in `COACH_JS_PARTS`
   (`app/boot.js`) and `sw.js` ASSETS; update CLAUDE.md's table, `todo.md`'s split table, comments in
   `tools/shared-chromebook-loop.mjs:119`, `tools/mic-sim/listen-loop.mjs:67`, `coach-hub.js:374`. Per split, one
   push: the joined-text proof, full checks, `slow-load.mjs`, `kill-switch/proof.mjs`, `update-reload-loop.mjs`,
   golden before / after, a change smoke, a fresh reviewer (load order and `sw.js`: Always Reviewed). Deploy
   risk (reasoned, MED): a busy tab open before the push keeps its old part list for up to 5 minutes and would
   fetch the shortened file without the new part; push outside class hours.
   - **Built 2026-11-16 by a Mac agent, NOT pushed** (worktree `.claude/worktrees/coach-splits`, on `3b667ba`; the
     map checked line by line). Three commits: `coach-chords.js` 2,167 -> 1,397 + `coach-chordcards.js` 777 (770
     moved + a 7-line header; from the CHORD DIFFICULTY RANKS banner, line 1398, not 1393); `coach-runner.js` 2,394
     -> 1,091 + `coach-noterunner.js` 1,310 (1,303 + 7; from line 1092); and item 6's three stale comments
     (`coach-hub.js` fretLoop, `coach-runner.js` rnwLoop, `coach-strum.js` srHearStrum), comments only. The moved
     tails also hold helpers later parts call at run time (`cardAnswerKey`, `cbShuffle` for the ear and Gym card
     games; `nrOffset` for Strum Radar and `coachMicLatencyMs`): later or earlier parts, never at load, so no
     change. Proof: each pair joined (header off) = the old file byte for byte; the arcade script keeps 586
     top-level functions and 772 statements in the same order; no top-level statement that runs at load names
     a name across a cut (GAMES_META's `setup: () => …` and start.js's guarded sign-out call are run-time);
     `checks.mjs --check --skip-links` only "shell cache stale" on each split; kill-switch 14 of 14;
     shared-chromebook-loop exit 0, K-TAB 8 records in 6 cases (band 4-14 / 3-10); golden `--only games,play`
     before (`3b667ba`) and after: identical, 112 of 112 files (PARTIAL by design); slow-load 20 loads, 0 errors;
     update-reload-loop 29 of 29 cases, 359 of 359 checks; mic-sim closed-loop real takes reproduced 232 of 315
     (Power Chord Switch) and 46 of 64 / 6 of 8 / 51 of 74 (Coach melody / chords / Note Runner, as recorded in
     the mic-sim README), `--no-guitar` 9 of 12 cases FAIL, 1,902 of 4,320 changes marked right (the same as
     `3b667ba`), no-guitar-listen 241 of 624 Coach takes, 34 of 48 Strum Radar rounds. Not run: `tools/lint.mjs`,
     smoke (the lead's). Deploy risk confirmed in the code: a tab that FIRST loads the arcade while it waits to
     reload (`app/start.js:76-115`, busy up to 5 min) gets the new short files from the new cache
     (`sw.js:526-567`) under its old part list, so `gamesStopMic` (`coach-hub.js`, cbStop / cdStop / nrStop) and
     the hub's best chips (CB_DECKS) throw; so does a tab under the OLD worker whose cache never got
     `coach-chords.js` (it fetches the new file, `sw.js:549-550`). A tab that already loaded the arcade is safe.
     Push after school. Left for the lead: rebase, full `checks.mjs` (rewrites `sw.js`), change smoke `--only
     games`, a fresh reviewer (load order and `sw.js` lists: Always Reviewed), the trailer, tick this item.
5. [x] **Close out the Friday entries in "Open work".** Tick or close each line of the 2026-11-14, 2026-11-06,
   2026-11-01 and 2026-10-31 entries against the list in the Windows block ("Job 4"). Still open after that:
   Jonathan's three calls, one at a time by AskUserQuestion (the Games heading "Notes on the low E and A strings"
   over Note Hunt and Fret Zap, `i18n.js` `games.hub.groupNotes`; a tab closed on dead Wi-Fi can lose up to 60 s
   of practice minutes, `practice-minutes.js:1082`, recommended: accept; the "goal reached" pill never shows for a
   goal crossed on a Song Journey page); the doubled Journey Metronome beat on quick seeks (needs a browser
   measurement first; candidate, unproved: `tabs/journey.js:475-477` resets `lastBeat` on `seeked` after a frame
   already queued the beat; if proved, reset it on `seeking` instead); and, new, Strum Hero and Strum Radar
   (`coach-strum.js`, `shAgain(±10)` / `srAgain(±10)`) probably say "10 BPM" one 5 BPM step from each end of
   their range, the fault Change Up had (unchecked).
   **Done 2026-11-16 (the Mac, worktree `friday-close`): every line of the four entries has a verdict (18 lines: 14
   done, 1 accepted, 3 Jonathan's calls); Strum Hero / Radar `34dfce7`; the Journey Metronome `b666211`. The three
   calls, answered by Jonathan 2026-11-16 (AskUserQuestion, all "no change", do not re-raise): the Games heading
   "Notes on the low E and A strings" is KEPT; a tab closed on dead Wi-Fi losing up to about a minute of practice
   is ACCEPTED; the "Week goal hit" pill not showing for a goal crossed on a Song Journey page is LEFT (the ring
   and flame show it). Not done, owed: a `checks.mjs` detector for "a clamped step named as 10" (Change Up, Strum
   Hero and Strum Radar had it: three copies, so the sweep ratchet asks for one; a new kind of check, Always
   Reviewed); the Strum done screens were not looked at in a browser at 1366×657.**
6. [ ] **Small things found on the way (the Windows part is DONE, `6bfbbed`: the smoke walks, the Listening Coach take, the 1eh comment, `.gitignore`, the owed smoke; the two sims were left alone on evidence; see the block above. Left: the Mac's three stale comments, the one Mac run of `song-builder-sim`, the ca-43 question):** the change smoke owed on today's Windows pushes (`games`, `activities`);
   `tools/smoke.mjs` `cardKeysWalk` (~1521) and `foldWalk` (~1666) still lack `await pageLoaded(page)` after
   their reload (9 of 11 walks have it); the Listening Coach has the same `if (rec) micRecSave(…)` line
   (`coach-core.js:1730`, take id `<uid>-coach`): check whether a Stop in ITS count-in overwrites a full take
   (not traced); `tools/song-files-console-sim.mjs` and `tools/built-songs-sim.mjs` wait by counting turns, the
   race fixed in `song-builder-sim.mjs` (run that one once on the Mac: it should say 57 cases); stale comments
   (`coach-strum.js:1238-1240` and `tools/checks.mjs` ~17115 say `srHearStrum` is shared with the strum check;
   `coach-hub.js:144` and `coach-runner.js:951` say "No onset detector in this loop"); `tools/__pycache__/` into
   `.gitignore`; ask Jonathan whether ca-43 Note Call has been used with real guitars on the Chromebooks.
- Delete this block when every item is ticked.

**For a session on the Windows computer (written 2026-11-15 for 2026-11-16 on; Jonathan cannot paste between his
computers, so it lives here).** Jonathan opens Claude Code on Windows and says "do the Windows work in WORKFLOW".
The session runs on Fable (Jonathan, 2026-11-15: "big jobs using fable"). Agents: Opus or Fable by the need
(Jonathan, 2026-11-15): Opus (`model: 'opus'`) for review rounds, anything in the listening code and the listening
plan; Fable (`model: 'fable'`) for mechanical work (a part split, re-checking an old finding, a test-tool fault).
- First: `git fetch` and fast-forward main. Check `~/.claude/settings.json` has `autoContinueAtUsageLimit` (memory
  note); start after 9:00 2026-11-16 (his usage limit resets then).
- The jobs, in this order; each one ships (pushed, `--live`, GitHub's runs read) before the next starts, and each
  ticks its line here when done:
  1. [ ] **Strum Pattern check:** a review of its listening code (`coach-strumcheck.js`, ca-52; entry "Strum Pattern
     check" below) with a fresh `site-reviewer-deep`, rounds and fixes as CLAUDE.md says; then the listening design
     job: plans only, nothing ships (unheard up-strums, the shared-note chord, one shared detector, the `coach-core.js`
     split; `coach-core.js` itself is only split with Jonathan).
  2. [ ] **The known faults** (same entry, "Existing faults found on the way"): the live-quiz key `lq-q-opened` left
     for the next student on a shared Chromebook (`shared-chromebook-loop --seed=2 --case=28`); a practice card's
     speed press dropping a count-in click (`pcRetrack` → `cancelQueuedClicks`); `micRecStartPerf` one audio buffer
     late (listening code: measure on the real takes first, `tools/mic-sim/README.md`); `tools/smoke.mjs --baseline`
     crashing on a baseline without a new step; the golden live-quiz pictures byte-identical (2 self-checks). Each
     with a failing case first, then the fix, then the proof.
  3. [ ] **Split two big parts** (CLAUDE.md "Keep the parts small"): `coach-runner.js` and `coach-chords.js` (over
     2,000 lines). Move whole banner sections, unchanged, into new parts loaded right after (`COACH_JS_PARTS`, the
     `sw.js` lists); `node tools/slow-load.mjs`; one split per push. NOT `coach-core.js`, NOT `teacher-activities.js`
     (the Mac is changing `TEACHER_JS_PARTS`).
  4. [ ] **The Friday checks' open findings:** every unticked Friday-check item under "Open work" (2026-11-14 MINORs,
     2026-11-01, 2026-10-31). Verify each on today's code; fix the real ones; tick or close each with a reason.
  5. [ ] **Other put-off work:** the rest of "Open work" that is unticked, oldest first, EXCEPT anything about song files
     or private song audio (the Mac's Song builder area) and anything that is a product call: those go to Jonathan
     with AskUserQuestion, two to four options, one per turn, and wait.
- Practice minutes is DONE (two review rounds, clean): do not touch it.
- A session on the Mac builds the Song builder (Part b on) at the same time. Leave alone: the `teacher-*.js` console
  parts, `TEACHER_NAV` (`teacher-core.js`), `TEACHER_JS_PARTS` (`app/boot.js`), `app/songfiles.js`,
  `app/builtsongs.js`, `teacher-songfiles.js`, `teacher-builtsongs.js`, `vendor/`, and the Song builder checks.
- Before every push: `git fetch`, `git rebase origin/main` (CLAUDE.md "Start here" step 8); CHANGELOG / WORKFLOW
  entries last, after the final rebase; after a rebase `grep -oE "head\('1[a-z0-9]+\." tools/checks.mjs | sort | uniq -d`
  may print only `1ck` (an old duplicate): renumber yours if it collides. Only one headless-Chrome run at a time.
- Building a song on Windows: not tried yet (see "Song builder" below, "Windows too"). If he asks for one, fix the
  tool on the way.
- **Where the Windows session stopped (2026-11-16, afternoon). Jonathan: "assign whatever you haven't done to
  the mac": what is left is the block "For the Mac: the rest of the Windows list" above.** Done and on main today:
  - `190586d` `tools/song-builder-sim.mjs` waits for the console's work (it failed 3 of 3 on Windows).
  - Job 1: the design plans (`docs/strum-check/LISTENING-DESIGN-2026-11-16.md`, four decisions for Jonathan, none
    asked); review round 4 (0 BLOCKER, 2 MAJOR, 3 MINOR); the 3 MINORs fixed and shipped (a round Stopped before
    bar 1 ended saves no take; check 1eh now turns red on 32 of 32 planted faults, before 2 of 32; the comments).
    R4-1 measured on the real takes; the fix is NOT built (the Mac block, item 2). R4-2 (loud talk not gated) is a
    known limit: bench only, no real take has talk in it.
  - Job 2: 4 of 5 faults fixed and shipped (`f0e012e`): the sign-out clear (`lq-q-opened`), the Metronome click lost
    or doubled on a speed / Guitar press (Reviewed, 1 round, 1 MINOR fixed; new tool `tools/metro-press-sim.mjs`,
    6,341 of 6,341; `playalong-loop` 0 mismatches), `smoke.mjs --baseline` (new `--self-test`, 3 of 3), the golden
    live-quiz pictures (`--only livequiz` passes its own checks). `micRecStartPerf` is fixed on a branch, not
    reviewed, not shipped (the Mac block, item 3).
  - Job 4: 3 wording fixes shipped (`60a3214`: Change Up names the real 5 BPM step at 135 / 45; `coach.foot`;
    Module 9 ES button name), 3 checks tightened and Reviewed (1da fold default through both real callers, 13
    cases; 1t3 in order inside the three shared popups; 1cd spies on every direct string of Note Call's power
    screens), and the smoke "3 tool buttons" line. Re-check of the 17 open items: 13 real, 3 already fixed (the
    flame colour, `weekReach`, the smoke / emulator line of 2026-11-01), 1 accepted (liberal counting); the
    2026-11-06 entry has nothing open. The "Open work" boxes themselves are NOT ticked yet (the Mac block, item 5).
  - Job 5: sorted, nothing done: outside the Friday entries only private song audio step 2 (the Mac's), ca-43 with
    a real guitar (Jonathan) and the 2026-11-02 smoke flake (`7369cad` looks to have fixed it) are open.
  - Owed on today's Windows pushes: NO change smoke was run on any of them, and no screenshot of the Change Up
    done screen at 135 / 45 (check 1ck renders it, 68 renders).
  - **This computer's setup.** The main folder is checked out with Windows line endings (Git's system setting
    `core.autocrlf true`), which fails 4 checks on untouched main. The session worked in worktrees made with
    `git -c core.autocrlf=false worktree add` (`.claude/worktrees/win-*`). The main folder itself is NOT fixed
    (Jonathan's to allow); `git archive` here also needs `-c core.autocrlf=false`. `gh` is not installed; the
    `site-reviewer-deep` agent type was not offered (a general agent was given that agent file as its brief).
    `tools/__pycache__/` appears after a checks run on Windows and is not in `.gitignore`.
- Delete this block when every job above is ticked.

**Class rules published 2026-11-15: Paste C, D and E are live.** Jonathan published `firestore.rules` as one paste
(`Claude outputs/firestore-rules-PASTE-E-2026-11-15.txt`, sha256 `8cb7341f61c3…`, pinned by `1dt`'s `RULES_FILE_SHA256`);
he reported the Rules editor at 1038 lines. It carries Paste C (teacher deletes), Paste D (built songs) and Paste E
(practice minutes with no daily limit). Earlier notes below that say one of these "waits for a paste" are history.
Check the Firestore "denies" count with him a day or two later (2.1K over Nov 9 to 14, before the paste).

**Practice minutes: no daily limit (2026-11-15), live with its rules (Paste E, published 2026-11-15).** Jonathan:
"let's remove the 20 minute a day limit. it should be actual minutes"; sound alone counts only within 10 minutes of the
student's last input ("No limit, but need activity"). The engine is live before the paste on purpose: past 20 minutes in a day
the student's own screen is true, the server write is refused, kept on that Chromebook and retried, and lands after the paste.
His console picture of five rows at "40 / 40" was two days at the old 20-minute cap, not a goal cap; those weeks cannot be
rebuilt. Review: one deep round (Opus) found 1 MAJOR, fixed with break-it proof (a scroll is no longer input: a practice card
scrolls itself, so a looping song counted for hours); a second round (Opus, 2026-11-15) came back clean. Jonathan's calls, do not re-raise: two devices at once count double and an auto-clicker counts with no ceiling
("nobody will use an auto clicker or sign in from two devices. don't worry about it"). Done 2026-11-15:
`keepaliveSafe` / `OLD_DAY_CAP` removed from `practice-minutes.js` (it held back the tab-close write that first passed 20
minutes while the old rules were published), and the second review round on the scroll fix came back clean (0 BLOCKER, 0 MAJOR,
4 stale-text MINORs fixed). The older notes below that say "the daily cap bounds it" are history.

**Strum Pattern check `ca-52` (2026-11-15): shipped, not yet on the board; Jonathan tests it, then places it.**
The pattern `D.DU.UDU` over D5 D5 C5 C5 G5 G5 D5 D5 (`coach-strumcheck.js`; `coach-core.js` untouched). Three Opus
deep-review rounds (5fbd3a5, 65c30c4, 45165b2); after round 3's one MAJOR (the too-noisy words) Jonathan chose "fix
words, then ship" and the words "Too noisy for feedback". What it does: a grid that follows the player's own
pattern (a late start up to half a bar is followed); strum ratios 1.15 / 1.3; a count-in noise gate (median 0.012
AND 20th percentile 0.003) that colours nothing and still counts the round; a lopsided octave chord vote ("ok" by
one vote, "wrong" only by two); done after two full rounds at any score. Known limits, all measured, in
`docs/strum-check/DETAILS.md` (sections 19b to 28; in the repo since 2026-11-16, copied from the Mac's
`Claude outputs/strum-coach/`, so a session on either computer can read it: give it to any reviewer or design agent
for this code, so a known limit is not flagged again and a measured, stopped idea is not proposed again): the gate fires in most rounds in a full room (bench
class room 7 of 8); a student who plays on all four count-in clicks, or lets a count-1 strum ring, is gated too; a
wrong chord that shares a note (G5 for C5) is caught at one clock and passed at ±20 ms; a player more than half a
bar late is judged one bar on; a dragging player (4%) passes 25 of 80 bars; the Metronome click through a speaker
is heard as a strum, so the click plays only with "I'm wearing headphones" ticked (two click-removal attempts
measured and not built: `docs/strum-check/CLICK-2.md`). Only MacBook-mic takes exist: Chromebook and classroom takes are owed.
Owed next: a Fable high-effort review of this code after Jonathan's limit resets; the listening design job (unheard
up-strums, the shared-note chord, one shared detector, the `coach-core.js` split) on one Opus agent, nothing ships.
Existing faults found on the way, not fixed: `micRecStartPerf` is about one audio buffer (93 to 103 ms) late in every
game's takes; a live-quiz key (`lq-q-opened`) can survive to the next student on a shared Chromebook
(`shared-chromebook-loop` case 28 at seed 2); a practice card's speed press less than one frame before a count drops
that click (`pcRetrack` → `cancelQueuedClicks`).
A smoke flake (2026-11-15, `smoke.mjs --en-only --only activities` on the Song builder tip): once, `flashClass is not
defined` in Name the power chord (`ncMark`, `app/drills-call.js`), so `fab-tools.js` had not run on that page; the same
commit walked clean the next run and on GitHub. Seen once; if it comes back, look at that page's script loads first.

**Parked, only if storage gets tight (Jonathan, 2026-11-15): smaller audio files.** 26 of the 44 song files in
`audio/` are saved at 320k (275 of 396 MB); 192k copies made from them would save about 110 MB. One song first for
his ears, then per file: `tools/loudness.py`, `tools/beat-audit.py`, `tools/playalong-loop.mjs`. New audio is
exported at 192k from now on. Do not start it unasked.

**Song builder (2026-11-14): Parts a1 and a2 shipped, rules published 2026-11-15.** Jonathan builds a Play Along
song in the console with no code push. All ten decisions are his (`Claude outputs/PLAN-song-builder-2026-11-14.md`);
the build brief is `Claude outputs/WORK-ORDER-song-builder.md` (parts a1, a2, b, c, d; board placement is LATER).
Part a1 is the rules only: a new add-only block (`builtSongs/{id}`, `builtSongsMeta/list`, `songDrafts/{id}`), the
emulator tool `tools/built-songs-rules-test.mjs` (166 cases, 66 of 66 breaks) and the 1dt re-pin. No site code reads
these paths yet, so nothing changes for students before or after the paste. Paste D is the whole `firestore.rules`
file, so it also publishes Paste C (below) if that is not live yet. Part a2 (the data path, Import, one real song)
shipped 2026-11-15 on the Manage tabs (the Built songs list sits in the Song files section). Part b shipped
2026-11-15 (Fast): the "Song builder" view after Songs in the sidebar (`teacher-sb-core.js`, `teacher-sb-beat.js`,
`teacher-sb-dsp.js`; `vendor/lamejs` 1.2.1, console only): drafts, Upload, Volume (one gain to the cure, a -1 dBFS
limiter, 192k), Beat (TAP, typed BPM, bar 1, pins, drift windows, Listen with clicks). Measured: M4 (the waveform's
clock against the player's) 0.03 ms, no offset; M5 a 3:30 song levels in 48 s (2 encodes, kept). The browser walk
found and fixed: a failed copy load retried forever (froze the tab; each try counts a download), bar 1 one beat early
after a soft intro, bar 1 up to 39 ms late from taps more than 1.5% off, "NaN MB". Known: a soft intro within 12 dB
of the band counts as loud (playalong-measure.py's rule), so bar 1 can land on the first note; the ±1 beat buttons
move it. Delete draft asks OK / Cancel, not the typed title (Jonathan, 2026-11-15: "why does the delete button require
me to type the title?"; a draft is cheap to redo; a published song in Part d keeps the typed title). Volume has Level it again and Clear this step;
Beat has Clear this step (Jonathan, 2026-11-15: "at any step if i want to clear what it had done instead of starting
over"). Next: Jonathan builds one real song up to the Beat step; then part c (Fast) and d (Reviewed). His first
real song through Import (part a2) is still open.
- **Part c: Chart, the grid, sections, Level (2026-11-16, Fast; `teacher-sb-chart.js`).** Step 4 reads a pasted
  chart (chords over lyrics, ChordPro, bar lines; English and Spanish section headers; "x2"; a header with nothing
  under it or "same chords as Verse 1" is copied), refuses line by line with the reason (TAB, number charts, a symbol
  it cannot read, more chords in a bar than beats) and folds slash chords and sevenths to the plain chord, saying so.
  The grid sets the truth (a bar's chord, a split bar, a rest, + Bar to hold a chord, Remove bar, a new section, a
  section edge, Join, the section's name and number, a row's words, Undo). Step 5 is the level (Full / Power / Both
  and which it opens on) and the whole song or a from-to range. `sbSongOf()` makes the song `builtSongs` takes and
  `sbSongWhy()` is `builtSongCheck`'s own answer on it; Preview and Publish are Part d.
  - **His request, built with it** ("the app should allow me to upload chord charts, etc. as other things are being
    worked on like levels ... and/or to let me put all the files in the initial upload"): step 1 has a chart box
    (paste or a text file) saved with the draft, and step 4 opens as soon as the draft exists, before the record is
    levelled; it is read in 4 beats a bar until the Beat step says otherwise, and read again by itself when the meter
    changes and the grid has not been edited by hand. NOT built: working on the chart WHILE the 48-second levelling
    runs (the builder is locked during it); he can paste the chart before pressing Next instead.
  - **Proof:** `tools/song-builder-sim.mjs` 57 cases (18 new): 17 of 17 made-up charts read as expected (9 accepted
    formats, 7 refusals, the folds); 39 of 39 chord names get shapes the validator takes; 27 of 27 (the 9 accepted
    charts at Full, Power and Both) pass `builtSongCheck` and render through the real `caCardBodyHtml`
    (`tools/sim-app-page.mjs`, new: the whole student app in Node), lyric lines escaped; the grid's edits; the flow
    against the stub database (every write a `songDrafts` write). 6 of 6 planted faults turn it red. A browser walk
    in Chrome for Testing at 1366×657: 18 states, each screenshot looked at, no page error, no sideways scroll, the
    grid's columns line up.
  - **How the work order was read (say if any is wrong):** "taught" = Module 4's open chords and its Bm
    (`SB_TAUGHT_FULL`: E Em A Am D Dm G C F Bm); every 5 chord counts as taught. sus, add9 and 6 chords fold to the
    plain chord too (the work order names slash chords and sevenths); dim and aug are refused. A refused line is
    left out of the grid at once and stays flagged until he clicks "Leave it out" or types its chords. A header that
    is not on the fixed list gets NO name and the grid asks for one (no free-typed section names). A lyric row is
    one chord line of the chart (the mock-up joined two lines in a row). "Hold a chord across bars" is + Bar; "move
    a section edge" is Start 1 bar earlier / later. The range is two pickers, From and to. Not built from the
    mock-up: "Skip: type the grid myself" (a one-line chart does the same) and dropping a file on the box (there is
    a file picker).
- **Pdfs in the builder (2026-11-16, Fast; `teacher-sb-pdf.js`).** Jonathan: "i'd like to upload pdfs to the builder
  and multiple ones at that for tab and chords separately", before his first real test. His three answers: a TAB pdf
  is shown to him while he builds (students see nothing new); a CHORDS pdf is read into the chart box; his pdfs are
  both downloads and scans. Built: a "Pdfs" bar at steps 1 and 4 with two pickers (several files each, 8 in all, 40
  MB each); a chords pdf with real text is laid out line by line (two columns of lyrics read left first) and ADDED
  to the chart box, then read like a pasted chart; a scan has no text, the bar says "a picture: not read", and it is
  shown for him to type from; at step 4 the picked pdf is drawn beside the chart (the song list gives up its
  column): file tabs, page ‹ ›, zoom, Own window, Hide. Nothing is stored: the pdfs stay in the tab like the mp3, a
  reopened draft asks again, the chart's text is in the draft as before. NOT built (his other two options): students
  seeing the tab pdf (needs storage, a format change, a paste), and reading tab into the card.
  - **Proof:** a browser walk in Chrome for Testing with 8 made-up pdfs printed by Chrome itself (one-column
    Courier, Georgia, two columns, a 3-page tab, a scan, a non-pdf): 28 of 28 steps, 13 screenshots looked at, no
    page error, no sideways scroll at 1366; the store held the same documents after as before. It found one fault,
    fixed: two chords pdfs in one pick kept only the second one's text. The Node cases are in
    `tools/song-builder-sim.mjs` (its commit has the count and the planted faults).
  - **Limits, not fixed:** a pdf whose chords are drawn as pictures or placed far from their words reads badly (he
    corrects it in the box or the grid); the pane shows one page at a time; a rotated page is read as it lies.
- **American Girl, Jonathan's first real test (2026-11-16): the clicks were half a beat off, on the "and".** He
  tapped the tempo; he did not look at the pins line ("it did not say send to claude"). Shipped the same day: two
  buttons at the Beat step, "◀ ½ beat" and "½ beat ▶", which move bar 1 AND every pin by half of the beat where each
  sits (the old "1 beat" buttons move bar 1 alone); a sim case, red when the pins are left behind. NOT seen in a
  browser. Also: step 5's grey Next button now reads "Next: Preview → (not built yet)" (he took it for stuck).
  - **Measured after (an Opus agent, the ruler, the real `teacher-sb-dsp.js`, the original and a levelled copy;
    `Claude outputs/beat-ruler/tap-phase-2026-11-16.md` on the Mac). The cause is the DRIFT, not the taps.** Bar 1
    lands right (0.091 s) for taps -60 to +150 ms late (26 of 27 cases) and for a typed 114. But the grid is bar 1
    plus one end pin, a straight line at 114.5 BPM, and the record opens at 107.3: over 100 ms off by 2.2 s, about
    +220 ms (half a beat is 263) through the first 40 s; 249 of 397 beats over 100 ms off. So it SOUNDS like "on the
    and". `sbPinsNeeded` is 16 in every case (13 in one): the red "send the mp3 to Claude" box should have been on
    screen (no case gave 8 or under), and the drift check flags 6 or 7 of 9 windows. So: this record goes to Claude,
    as he decided 2026-11-15, and the ½ beat buttons do not fix it. OPEN for him: the warning is easy to miss; it
    could sit beside "Listen with clicks" or be said when he presses it.
  - **The taps can pick the "and" only from about 190 ms of steady lateness** (Bluetooth sound): `sbTapPulse` gives
    the beat up to 80-105 ms late, nothing from there to 185-210 (the fallback then found the true beat, 11 of 11),
    the "and" beyond. Taking 100 ms off every tap would be right in 31 of 33 cases (today 26). Not built.
  - The page cannot tell a grid on the "and" from one on the beat (the same pulses line up): only his ears can.
- **DECIDED (Jonathan, 2026-11-16, after the measurements): the builder is for songs that do not drift much.** "the
  song builder is cool for songs that don't drift too much. lets set it up for that with the info we have now and
  keep the warning that a song doesn't fit." So a record over 8 pins is told plainly "This song does not fit the
  builder" (the red box, and since today a red line beside "Listen with clicks": he had listened first and missed
  the box) and goes to Claude (skill `new-playalong`, then Import). "Follow the band's beat" was built and tested the
  same day (an Opus agent; American Girl 0 of 397 beats over 100 ms, wrong on Madrecita Querida and Arsenal
  Efectivo) and then LEFT OUT at his word ("Leave it out"): it is on the local Mac branch `feat/sb-follow-the-band`
  (`a6dcc6b`), not on main; its ruler script is `Claude outputs/beat-ruler/follow.mjs`. Do not ship it unless he
  asks. Part d (Preview, Publish) is still the next build, for steady songs. Also declined for now: pin-any-bar.
- **Part d: Preview, Publish, Edit, Unpublish, Delete, backup, Export (2026-11-16, ALWAYS REVIEWED; `teacher-sb-publish.js`,
  533 lines).** Step 6 is the real card (`builtSongExpand` + `caCardBodyHtml`, the card's own player at the four one-file
  stops, on the levelled copy already in the tab: no second download) and three listens (the card's first section, a
  middle one, its last), each ticked when one unbroken play reaches that section's end; saved in the draft
  (`listens`), started over by any change to the song or its copy. A repaint while it plays (the listens' save, a list
  read) moves the same card element in, so the song keeps playing. Step 7 lists what is ready and what is not; Publish
  is on only when `builtSongCheck` passes on the EXACT doc it writes, the record is within 10 cents, every drift window
  is pinned and the listens are done ("This song does not fit the builder" shows on Preview and Publish, same words,
  and blocks nothing). It writes `builtSongs/{id}`, then `builtSongsMeta/list` in a transaction (the same order as
  Import), after reading the stored copy's head fresh; a copy an edit replaced is deleted only after that. A published
  song has its own page: Edit (the steps, opening on the one he picks; students keep the published song until Publish
  runs again; the list says "Changes not published"), Unpublish (the draft keeps the edit number, then the list, then the song; the draft and
  its copy stay), Delete… (typed title; the list entry first, then the song, the draft and every copy nothing else on
  the list plays), Export (the Import file and its mp3). The list's head has the health line ("N
  published; all pass today's checks", or each failing song by name). Backup: `builtSongs`, `builtSongsMeta/list` and
  `songDrafts` are in the file (charts only; their audio stays out with `songFiles`).
  - **Decided by Jonathan, 2026-11-16** (his answers to the readings below, verbatim: "1. yes they should get
    edit/unpublish; 2. whatever you think; 3. ok, 4. export should save mp3 too; 5. edit gives a choice of step; 6.
    ok"). Built the same day (`2b67a25`): (a) an IMPORTED song gets Edit and Unpublish: they first rebuild a draft from
    its `builtSongs` doc (`sbDraftFromDoc`) and save it: title, artist, audio, sections, bars, lyric lines, level,
    range, its own chord shapes and its beat as it came (bpm unrounded, bar 1, its bar times kept exactly; the Beat
    step shows them read-only and the builder's bar clock follows them). Unchanged, it publishes the same song. NOT
    recoverable, and each step says so: the chart's original text (Chart: "This chart came with the imported song",
    the grid as published), the taps and drift windows (Beat: "The bars came with the imported song"), the loudness
    numbers and the original mp3 (Volume and Upload: levelling again needs the original picked, as for any reopened
    draft); the listens start empty. (b) Export saves two downloads that pair up by name, `<title>-<id>.json` and
    `.mp3` (the levelled copy, from the tab or read from `songFiles`: one counted song download, said in the hint;
    the browser may ask once to allow two downloads); Import takes the pair as it is. (c) Edit opens on the step he
    picks (Upload, Volume, Beat, Chart, Level, Preview; one click each; Chart is highlighted and is the header's
    Edit). Proof: `tools/song-builder-sim.mjs` 113 cases (12 new: the imported song's page, Edit on Beat rebuilding
    the draft with nothing loaded, the four steps' lines, Edit-change-nothing-Publish deep-equal to the import but the
    edit number, a beat map kept exactly with one chord changed and only that chord differing, Unpublish of an
    imported song keeping everything in the rebuilt draft, Export's pair counted once and fed to Import on another
    store giving the same song, each choice of step); 9 of 9 new planted faults red; the walk 67 of 67, 28
    screenshots looked at (5 new: the choice of step, the imported song's page, its Beat, Volume and Chart steps and
    its Preview).
  - **Decided 2026-11-16 (the lead, on Jonathan's "you pick the way to make things smoothest. i don't know if three
    listens are necessary"; this REVERSES the work order's three listens), built in `a4a18ae`:** no listen gate
    (Preview says "Play it through once before you publish"; nothing counts plays); Publish is the Preview step's top
    button (step 7 stays as the song's state page); a chart given at step 1 (pasted, a text file or a chords pdf) is
    read when Next saves the draft, and step 4 opens on the grid when nothing needs settling; Volume starts by itself
    on arriving at step 2 with the original in the tab (once per file); a new draft opens on Full chords, the whole
    song; "Fix in the grid" is highlighted only when something needs settling. Publish is open when the validator
    passes, the pitch is within 10 cents, the levelled copy is the picked mp3's, and every drift window is pinned (the
    drift rule kept: the decision did not name it). A first Publish asks nothing (one click; Jonathan, 2026-11-16, "go
    ahead"); an edit of a live song, Unpublish and Delete… still ask. Happy path (steady record, clean chords pdf): 30
    presses before, 22 after (the 8 Beat taps included; 20 without "Listen with clicks" and its Stop), and no 3-minute
    listen. NOT done, on purpose: skipping the Chart and Level steps when nothing needs settling (the Chart step is
    where "the chart makes N bars; the recording has M" is seen, and with no listen gate nothing else would catch a
    count that is off); "Listen with clicks" stays where it is, and nothing requires it.
  - **Review round 1 (`aa6b8d3`):** R1-1 the song and the list in ONE transaction (both or neither); R1-2 a new mp3
    picked after levelling shuts Preview and Publish until Volume runs ("A new mp3 was picked: level it at step 2
    first."); R1-3 / R1-4 an edit number is never used twice (`teacherBsNextVer`: the seconds since 2026-01-01, past
    the last one, for Publish and Import; shown as "edit of <date, time>"); R1-6 a new copy clears the drift number
    and the Beat step measures it on that copy; R1-8 the preview card follows the language; R1-10 stale comments.
    **Accepted limits (the lead, 2026-11-16, on Jonathan's "i don't think we should worry too much about wifi
    dropping at those specific moments"):** R1-5 a replaced or unpublished copy is deleted at once, so a student with
    the song open keeps the old version, or loses its sound, until they reload (the confirms say so); R1-7 an
    Unpublish or Delete that fails half way can leave a `builtSongs/{id}` doc that no screen lists (harmless to
    students, who read only listed songs; visible in the Firebase console). Also: a record whose pitch could not be
    read is stored as centsOff 0 and publishes (Part b's rule); Hidden in the Songs view is the reversible off switch,
    Delete… is not.
  - **How the work order was read (3 and 6 stand, Jonathan: "ok", "ok"; 2, the listens, was replaced above):** (3) The Chart step's
    flags (a refused line not dealt with, a chord not taught and not kept) WARN at Publish and do not block (the work
    order's list of blockers does not name them). (4) Unpublish of an edited song whose copy was replaced deletes the
    published (old) copy and keeps the draft's. (7) The preview card follows the console's language (its header's
    Español button), like every card the console draws; the builder adds no switch. (8) An edit number is never used twice (review R1-3 and R1-4: `teacherBsNextVer`, for Publish and Import alike).
  - **Proof:** `tools/song-builder-sim.mjs` 101 cases (27 new; pin re-set): the listens (a mid-section start, a short
    stop, a whole play to the lap), every Publish blocker as its one reason and writing nothing, the stored copy and the
    list read at the press, Publish's two writes in order and in the rules' shape (the sim's rules check now holds
    "BUILT SONGS"), the REAL student app merging the published song from the same store (Songs page row, the card in
    English and Spanish, lyric escaped, 0.85), a reload, Edit with a new copy and republish (the old copy deleted only
    after the list's edit 2), Unpublish and Publish again (edit 3), leaving mid-publish, the health line, the imported
    song's Export passed by `tools/built-song-check.mjs`, Delete. 15 of 15 planted faults turn it red.
    `tools/backup-proof.mjs`: 131 of 131 checks, 8 of 8 planted faults red. `tools/song-files-console-sim.mjs` 88 of 88.
    A browser walk in Chrome for Testing (a 20 s generated tone stored as the Song files writer stores one; console at
    1366x768, the student page at 1366x657): 57 of 57 checks, 23 screenshots, each looked at, no page error, no
    sideways scroll. It found one fault, fixed: the console's own Español button draws the preview card in Spanish,
    so the line "English here" was false then. `node tools/slow-load.mjs`: 20 loads, 0 errors (the new console part
    changes the load order). Not run: `tools/lint.mjs` (npm could not fetch its packages in the session's sandbox).
- **The Beat step's tracker (2026-11-15, Fast).** Before: the phase of the BEAT in 12-second windows
  (`sbPhaseTrack`), which on a strummed record sat on the "and" and slipped between beat and "and". Why: on American
  Girl the onsets on the "and" are as strong as on the beat (beat stronger than its "and" on 169 of 396 beats), so
  the beat itself is nearly invisible (window strength 0.04) while the eighth-note pulse is clear (0.15). Now
  (`sbTrack`, `teacher-sb-dsp.js`, the comment "THE BEAT TRACK"): the PULSE is followed (the beat in 2, 3, 4 or 6,
  whichever is clear; a path through short windows that may run 8% off the tapped tempo), then the BAR's own rhythm
  pattern is learned from the song and each two-bar window lined up with it (this is what counts through the
  American Girl breakdown at 2:34, where one eighth more or fewer fits the pulse equally well), then a fine pass,
  averaged over a longer stretch where the record is steady. Beats are COUNTED from bar 1, so bar 1 says which pulse
  is the beat; the taps say it first (`sbTapPulse`), a typed BPM has no taps and takes the first loud pulse.
  - **The ruler (American Girl, Moises's 397 beats), from any starting tempo 108 to 120 BPM:** followed beats
    median 18 ms (Moises sits about 18 ms early all through; its clicks are on a 20 ms grid), 0 over 100 ms, count
    never lost (before: median 219 ms, 371 over 100). Bar 1 at 0.091 s (Moises 0.092). The grid after a pin on every
    flagged window: median 15 ms, 0 over 100 (before: 235 ms, 392 over 100).
  - **The site's own 14 backing tracks** (their `barTimes` or steady grid as the answer; errors around their median,
    a constant offset being bar 1's to fix): the count is kept on 11. Bars over 100 ms: Seven Nation Army 0 of 117,
    Luna 0 of 53, Ella 0 of 133, Perdón Mamá 0 of 114, Smells Like Teen Spirit 2 of 129, Neil Young's Watchtower 2
    of 165, The Cure 4 of 88, Sweet Child 7 of 184 and Hendrix's Watchtower 8 of 114 (the last bars, where the band
    slows to a stop), Vuelve a la Vida 17 of 175 (the ending). NOT followed: Madrecita Querida (44 of 74; its bars
    run up to 24% long), Las Mañanitas (14 of 108; one bar is 70% of the others), Arsenal Efectivo (131 of 142; the
    site's own beat-audit cannot tell there either: 103 of 142 bars "cannot tell"). The tracker before: 1,074 of
    1,670 bars over 100 ms.
  - **It does not know when it has lost the beat.** Its own bars come out smooth either way (Madrecita: 0 followed
    bars over 6% off, the record has 15); a per-bar "do the onsets sit on the pulse" score flags 29 of the 119 wrong
    bars and 17 of 812 right ones. So no "hard places" list was built; "Listen with clicks" stays the check.
  - **Pins.** `sbPinsNeeded`: steady records need 2 or 3 (bar 1 and the end; Vuelve a la Vida 6); American Girl
    16, Smells 18, Sweet Child 21, Seven Nation Army 23, the two Watchtowers 24 and 26. "the cure" is steady but
    reads 12: the tracker loses count there 3 times, so a high number means "the tempo moves OR the tracker cannot
    hold it", and the message says both. Over `SB_PINS_MAX` (8, a first setting) the step says the builder cannot
    hold the record's beat and to send the mp3 to Claude, and the list shows "Beat: send to Claude"; nothing is
    blocked. The drift check also shows the ONE bar furthest off the grid (the fixed
    windows alone passed a grid 200 ms off between two of them). A pin is now lined up on every pulse of its 4 bars,
    ±30 ms (before: the beats only, ±60 ms, which pulled two American Girl pins 66 and 80 ms toward the strums).
  - **Tried and dropped tonight:** a snare / kick detector to mark the beat (Jonathan's idea; on American Girl the
    beat is the stronger one on 41% of beats for a snare, 54% for a kick: no use); the tempo allowed 12% off (Luna
    and Ella lost count; 8% holds them and still follows American Girl's 108 BPM opening).
  - **Proof:** `tools/sb-dsp-test.mjs` 45 cases (8 new: a made-up strummed record with the "and" louder than the
    beat, a slow opening, a wandering tempo and a silent two-bar breakdown; the code before fails all 8, its pins about 270 ms
    off = half a beat); 17 of 17 planted faults turn it red (`--break=<name>`; 8 of them new, one for each step of
    the tracker). `tools/song-builder-sim.mjs` 39 cases (3 new).
- **Downloads, an estimate, not measured (M1, 2026-11-15).** Firestore Usage (Nov 9 to 14): reads peak 15K a day of the
  free 50K, writes peak 3K of 20K. Stored bytes and download bandwidth are not shown to him, so they are worked out:
  one built song is about 0.4 GB of downloads for 60 students, about 0.6 GB with 1.5 Chromebooks per student ("most
  students use the same chromebook but some used shared ones"); one new song a week is about 2.4 GB a month of the
  free 10 GB. Each Chromebook keeps its copy ("ok for song info to stay on chromebooks").
- **Windows too (Jonathan, 2026-11-15: "i'd like to be able to build songs on the windows machine too").** A built song
  travels through the console's Import, so either computer can make it. Windows needs Node, ffmpeg, Python with numpy
  and its own private song folder. `tools/new-playalong.mjs --built` and `tools/playalong-measure.py` have never run on
  Windows (paths and the ffmpeg call are the likely trouble): fix them on his first Windows song. Parts b to d move
  the building into the console, which ends the need.

**Delete / start over one student (2026-11-14): live; its rules (Paste C) published 2026-11-15.** Manage → a student's "⋯" (More):
"Start this student over…" and "Delete this student's data…" (`teacher-remove.js`). Start over writes a marker
(`config/class.progressStartOver[uid]`); the student's own page empties the lesson fields ONCE, at its next sign-in on
the main site, only when both sign-in reads succeeded (`progressStartOverAtSignIn`, `app/save.js`), and records
`startOverApplied`. Delete removes the data kind by kind (progress last) and writes `progressDeleted[uid]`; nothing
enforces it afterwards: a student who signs in again starts as a new student (that Chromebook's copies are cleared
at that sign-in). The paste ("Paste C", on top of Paste B) adds `allow delete: if isTeacher();` on
`progress/{userId}`, `minutes/{userId}/days/{day}`, `/weeks/{week}` and `/meta/board`, and comment changes only. Until
it is published, Delete stops at practice minutes and says so; Start over needs no paste. The markers stay until the
summer reset (skill `summer-reset`). Not removable by the site: problem reports (no delete rule for anyone), the
anonymous Top 5 / class-rank entries, the Google sign-in record.
- **The limit (said in both dialogs and in Manage):** a page the student already has OPEN keeps its old copy and saves
  it again on its next save: after a Delete it re-creates the record (Manage: "Deleted <date> · has a record again"),
  after a Start over it puts old lesson work back. Do it when the student is not using the site; if the work comes
  back, press the button again. Two review rounds (2026-11-14) tried to engineer this away and each time put an
  ordinary student's save at risk; that machinery was removed, and the everyday save path is main's (save-loop: 200 of
  200 final docs identical to main, 729 = 729 writes).
- **No undo, and the risk:** the console cannot put a student back (the rules deny the teacher create and update); a
  restore is hand work in the Firebase console from the dialog's download or "Download a backup". A started-over
  student's doc put back by hand is emptied again at their next sign-in unless its `startOverApplied` is at least the
  marker (or the marker cell is removed first). The rules cannot rate-limit: one stolen teacher sign-in could delete
  every student's saved work and minutes in seconds. "Download a backup" before any use is the only protection.

**Plant a fault, weekly (2026-11-14; Wave 3 item 2):** `tools/plant-a-fault.mjs` + `.github/workflows/plant-a-fault.yml`
(Tuesdays 2:23 AM Pacific, report-only) plant small mistakes in the risky code one at a time and list the ones no tool
caught. Survivors judged harmless or accepted, with reasons: `tools/plant-a-fault-known.json`. Open: the first run's real
gaps (tests still to write, none written yet) are in `Claude outputs/plant-a-fault/DETAILS.md` on the Mac (not in the
repo). CLAUDE.md → "Other standing rules" says how to replay one.

**The three big scripts are cut into parts (2026-11-11)**
- There is no `app.js`, `coach.js` or `teacher.js` file any more: `app/*.js`, `coach-*.js`, `teacher-*.js`. The table
  and the rules: CLAUDE.md → "Where the code lives". The entry, the two accepted risks and the rollback: "Recently
  shipped" → 2026-11-11. Open: Phase 2 (the clean-ups) and "Step 1, not recorded yet" in `todo.md`. Lines below
  written before the cut say `coach.js` for what is now `coach-core.js` / `coach-chords.js`.

**Closed-loop test, first piece (2026-11-11; Jonathan: "what we're lacking here is some form of closed loop testing")**
- **What it is:** a virtual student (`tools/mic-sim/student.mjs`) plays whole Power Chord Switch games into the real
  game code (`tools/mic-sim/closed-loop.mjs`; README there) and keeps an answer key, so each run prints truth against
  verdict. No site file changed. Not in `checks.mjs` yet.
- **Fitted to real takes:** one number, how long a string rings (1.0 s), from the 2026-11-04 strum what-if (1 of 132
  real strums lost at 1.8, 4 at 2.2). The rooms, the thumb / finger touch and the mics are guesses.
- **First numbers (432 games, 6,480 changes; the model says, not the classroom):** a steady pick strummer in a quiet
  room or a class: 360 of 360 right chords said right. Thumb strummer: 0 of 180 missed at 30 and 60 BPM, 9 of 90 at 90,
  34 of 90 at 120. A chord that never moved was caught 28% of the time, a chord one fret high 93%. An empty quiet room:
  0 of 180 strums heard; a class with no guitar in hand: 47%.
- **No-guitar cases (same day; Jonathan: "it's marking things right where there's nothing playing"):**
  `node tools/mic-sim/closed-loop.mjs --no-guitar`, twelve cases with no chord played at all, pass = nothing marked
  right. Current rule: 9 of 12 FAIL (288 games, 4,320 changes). Pass: dead mic, quiet room, fan (0 of 360 each).
  Marked right: desk taps on the beat 360 of 360, strums on muted strings 360, typing 322, one voice 132, bumps 122,
  a class talking 109, class guitars 68, loud class 54, partner's guitar 39. Of the 1,566 rights, 1,174 had under 3
  pitch readings (right on timing alone). Nothing in `coach.js` changed: a fix is detection (Always Reviewed) and his
  call, and "no readable pitch, no tick" was rejected on the real takes on 2026-11-07 (2 of 12 false hits removed, 10
  of 46 real rights lost), where most false hits did have readings; the model's rooms are guesses and disagree.
- **Candidate rules, NOT shipped (2026-11-11; Jonathan chose "ship the 7, keep the 5 open", then asked for real takes
  and fitted rooms first).** `tools/mic-sim/candidates.mjs`: `ring` (a strum must still sound 100-240 ms on) and `half`
  (half the pitch readings are notes of the new chord), alone and together. Guessed rooms: `both` passes 7 of the 12
  no-guitar cases and costs a steady player 1-3 points. **Fitted rooms (room7 / room4, 40 and 60 BPM, 180 changes a
  cell) say no:** no guitar marked right 36% / 34% today, 7% / 8% with `both`; but a steady pick player's right chords
  said right fall 84% to 63% (room7) and 46% to 18% (room4); `ring` alone 69% / 31%, `half` alone 72% / 28%. Thumb
  barely moves (88% to 87%, 56% to 48%). Not run on the real takes: they are not reachable from the cloud session
  (`node tools/mic-sim/replay-takes.mjs "Claude outputs/takes-anon"` where they are). coach.js is unchanged.
- **DECIDED 2026-11-11 (Jonathan): ship none of them; today's rule stays. Do not rebuild `ring` or `half`.** Replay on
  the 21 real takes (Mac, branch commit `841d316`; 210 judged changes, 54 with no strum in the window, 150 real strums
  the site heard), at 1.8 / 2.19: no-strum changes heard / real strums lost / marked right (86 saved): today 35 / 5 /
  83; `ring` 13 / 55 / 58; `half` 35 / 5 / 62; `half3` 35 / 5 / 67; `both` 13 / 55 / 48; `both3` 13 / 55 / 49. `half`
  removes no false hears and costs rights, as "no readable pitch, no tick" did on 2026-11-07. `ring` loses a third of
  real strums, far more than the model said (a real strum through a Chromebook mic does not ring like the model's).
  Replay accuracy: the base rule at each take's own ratios gave the saved verdict on 161 of 210 (heard or not: 196 of
  210); no clock offset from strums on 6 takes. Not tried: a loudness check (students strum once before a game), and
  measuring how real strums ring in the takes before any new ring rule.
- **Real takes without Jonathan (2026-11-11; "have your own closed loop system to evaluate without me").** Summaries of
  the takes go in the repo (his yes: no audio, no names): `node tools/mic-sim/takes-in.mjs` is the one command on his
  Mac (unzip, anonymize, evaluate, summarize, self-check, commit); then `node tools/mic-sim/replay-takes.mjs` runs
  anywhere and prints "ASK JONATHAN" when new takes are worth downloading. **Waiting on him: the first intake** (the
  folder `tools/mic-sim/takes/` does not exist until then). He may delete takes on the site after an intake and keeps
  one copy of the audio outside the repo.
  **Done 2026-11-11: the summaries stand in for the audio.** 21 summaries on `main` (`2fb5035`, 1.2 MB, no name field in
  any). Summary replay from a cloud session against the Mac's audio replay, ALL takes at 1.8 / 2.19 (no-strum heard /
  real strums lost / marked right): today 37 / 6 / 81 against 35 / 5 / 83; `ring` 14 / 56 / 56 against 13 / 55 / 58;
  `half` 37 / 6 / 59 against 35 / 5 / 62; `both` 14 / 56 / 46 against 13 / 55 / 48. Every count within 3; same totals
  (210 judged, 54 no-strum, 150 real strums). So a rule can be judged on the summaries; treat a difference of 3 or
  fewer changes between two rules as no difference.
- **Next (in order):** (1) on Jonathan's Mac, where the takes are, fit the rooms and the touch to the 34 real takes;
  his thumb / finger take at 60 and 120 BPM ("His first step" below) tests the 120 BPM prediction directly. (2) Then
  pin a small scorecard in `checks.mjs` (a new kind of check around `coach.js` detection: Always Reviewed). (3) Then
  the next game: `student.mjs` is game-neutral; each game needs its own runner.

**Shipped 2026-11-09 (live as of `c443261`)**
- **Count-in:** 2 clicks below 60 BPM in Power Chord Switch and Change Up (Open work → 2026-11-06 Friday check →
  "Decided (Jonathan, 2026-11-09)"). **Today's activities by date:** the group is ordered by release date, newest first;
  a finished card re-dated to the newest date shows in Today marked done (CHANGELOG 2026-11-09; check 1cq). Both Fast;
  the Friday check reviews them. Smoke watchdog `3af343f`. CLAUDE.md: a product change he asks for ships Fast (`c443261`).
- **Faster update reload, and back where you were** (Jonathan, 2026-11-09: "sometimes i start doing something and then it
  reloads back to a different view"; CHANGELOG 2026-11-09). Two parts. (1) `sw.js` is shell first: the install is
  `PRECACHE_CRITICAL` only (16 files, about 0.7 MB compressed, was all 92 files, about 2.9 MB; every script `index.html`
  loads is in it), the worker takes over, and the other 76 files are filled by `precacheRest()` when the page asks
  (`gc-precache-rest`, sent on `load`, `online`, tab shown, and once by a tab that is waiting to reload). The worker also
  posts `gc-sw-activated` to open pages, so a takeover that beats `app.js` is still heard; `app.js` wires both signals when
  the file runs, not on `load`. (2) The reload leaves a one-use note in `sessionStorage` (`gcSwResume`: `swResumeSave` /
  `swResumeTake` in `app.js`, `teacherResumeSnapshot` / `teacherResumeApply` in `teacher.js`) and the next load opens the
  same page instead of the home page; a click or scroll before it lands cancels it. Guard: check 1ce runs the install,
  the message and the fill (72 assertions, 42 breakages) and pins 11 wiring lines as text (comments stripped). Not covered
  by a check: the restore, and what the page does with the two messages (both proved in a real browser; see the commit
  messages). Reviewed twice: round 1, 2 MAJOR + 11 MINOR fixed; round 2, no BLOCKER or MAJOR, 15 MINOR fixed or noted.
  A fill stops when a newer worker is installing or waiting (an old worker with work pending holds the new one back).
  Known trade-offs: on the first load after an update the module files and step images come from the network once; a
  Journey page not yet in the new cache needs the network (no HTTP-cache fallback offline, the 2026-10-16 rule); a student
  on a Module Review gets its assessment reminder right after the update reload. Not restored: In class's two folds, a
  search, a card's open step, the board's sort. The logic is proved in headless Chrome with a real service worker by `tools/update-reload-loop.mjs` (2026-11-12: lesson, checklist, In class, Songs, My progress, a deep link, Spanish, four console places, busy waits and the 5-minute limit, the person wins, another account, a stale note, a plain reload, a locked preview); one gap found there, a deep-linked activity page lost its scroll (fixed the same day, `7af60f1`, with the tool now at 29 of 29). Still not seen on a school Chromebook. The first deploy of this change can
  need one manual reload (pages still on the old `app.js` listen too late for the faster takeover).
  **A student with an unfinished activity now stays where they were after an update** instead of being sent to In-Class
  Activities (the "pops up on login" half of the gate, kept 2026-10-07, no longer fires on the update reload).

**Shipped 2026-11-07 to 2026-11-08 (live as of `ab4aaae`)**
- **Stopped game, review rounds 3-6** (Power Chord Switch and Change Up; `4582bda`, `a8d2e55`, `df20fd1`, `3625df5`,
  `9c8d1bc`; CHANGELOG 2026-11-08 and 2026-11-08 (evening)): the Stop click is not graded; a Stop after changes fell due reads one of
  three headlines; a Stop in a game where nothing was heard is neutral (Jonathan, 2026-11-08). Rules and known gaps:
  Open work → "Stopped-game headline".
- **Tuning Simulator:** green only when the string is done, keyboard on Tighten/Loosen, Module 1 note circle goes up
  counterclockwise and says "3+ steps" (CHANGELOG 2026-11-08); guards in check 1cp (21 pins) and a smoke walk; a
  **"Start over"** button that clears the saved level (Jonathan, 2026-11-08; `3625df5`). Peg: counterclockwise tightens
  (Jonathan, 2026-11-07, `bf7c927`); it has flipped three times, so ask him to check a real guitar before changing it.
- **Teacher console Layout A** (`4950e86`, `fff71ec`, `6e64a62`; review round 1 `c562e7d`; rounds 2-3 `79c48a9`..`b04f201`)
  and the **units tree** (`890eae7`, Fast): "Recently shipped" → the two 2026-11-08 entries.
- **Docs tightening (2026-11-08):** CLAUDE.md rewritten for a model reader (`cdeac85`, `3625df5`); every skill and every
  `.claude/rules` file split into one-rule bullets, then cut 20-35% (`7ba94ba`..`ab4aaae`); WORKFLOW.md cut from 47k to 14k words
  and its orphaned rules moved into the binding files (this push).

**The Friday check is back on Fridays** (11 PM Pacific). The one Saturday run (2026-11-14) put routine
`trig_016m5HTbmhxb2oEqDaefQurB` back to `CRON_TZ=America/Los_Angeles 0 23 * * 5` first thing (next run Friday
2026-11-20) and deleted the skill's "next run only" section.

**Waiting on Jonathan**
- **Practice copy: built, waiting for Jonathan's key** (2026-11-14). The same files at
  `https://guitar-class-practice.web.app`, talking to the empty practice project (CLAUDE.md → "Practice copy"). Left:
  the GitHub secret `FIREBASE_PRACTICE_SA` (his steps: `Claude outputs/practice-copy/JONATHAN-STEPS.md`); until then
  `.github/workflows/practice.yml` ends green with "practice copy: no key yet, skipped". Unproven until the first run:
  the deploy itself, sign-in on web.app, the rules deploy with that key's roles. Step 1b, the preview channels: a
  `ci-try/<name>` push publishes `try-<name>` for 7 days at its own address (printed on the run page), with a real
  sign-in (the deploy adds the address to the practice project's sign-in domains) and its own browser storage, so a
  risky change can be signed into and clicked before it reaches main; no rules are published from a branch.
  Follow-ups: (1) the next `firestore.rules` change also fixes its header comment (`firestore.rules:14`): "or run `firebase deploy --only firestore:rules`" now publishes to the PRACTICE
  project only (`.firebaserc`); the class rules are the console paste. (2) Question for Jonathan: any school account
  can sign in to the practice copy and save there (same rules as the class); keep the address quiet, accept it, or
  make the practice copy refuse non-teacher sign-ins. (3) The Friday check may read a red "Practice copy" run: it
  is not the live site.
- **Practice minutes console view** (`997df22`, `07a4e04`): he pasted the rules on 2026-11-06 (memory
  `firestore-rules-published`; no hash check). Left: open **Practice minutes** in the console and check a student or two
  against their My progress (rank can differ slightly: "Recently shipped" → 2026-11-06 Practice minutes in the teacher console).
- **Power Chord Switch strum ratio:** 1.8 / 2.19 since 2026-11-07 (2.2 / 2.67 from 2026-11-05; Change Up and every other
  loop keep 1.4 / 1.7). Numbers and rollback: "Power Chord Switch: where we stopped" → "Decision (2026-11-07)", then
  "Decision (2026-11-05)"; tempo controls (2026-11-05) → "Tempo controls". "No readable pitch, no tick" was rejected on
  2026-11-07: do not build it. **His first step:** a thumb or finger strum take on a test student account at 60 and
  120 BPM, then "Evaluate all recordings" and read "Played, not counted".
- **To watch in the next takes (from 2026-11-07):** "Played, not counted" (`detector-missed`) at 35-40 BPM should fall;
  "heard, not there" will rise a little in noisy rooms (on the 7 takes graded at 1.4, 20 of 31 false hits still fire at
  1.8, 10 at 2.2). Not covered by the real takes: thumb or finger strummers, fast every-beat pairs (up to 140 BPM; the
  12 takes ran at 40-90 BPM, one at 90/105/120), and Chromebooks that draw slowly (11 of 12 takes had 16.7 ms frames,
  1 had 33, none 50).
- **Recordings:** the Pitch-rule table (console → Mic recordings → Evaluate all recordings) was read on 10 takes on
  2026-11-07 and the rule rejected (removes 2 of 12 false hits, loses 10 of 46 real rights); the table stays. The 34
  takes (21 Power Chord Switch) are kept outside the repo (`~/Documents/mic-recordings-2026-11-07.zip`): they carry
  student names.
- **Grid step cap number** (60 ms) and the other open product calls: Open work → the 2026-11-06 Friday check item.
- **Optional:** the console's `heartbeats` composite index (Firestore → Indexes, the only index); nothing uses it.

**Automatic:** the Friday check (Fridays 11 PM Pacific). The 2026-11-06 run (tag `friday-check-2026-11-06`) covered
`b958165` and `ce5096e`. The next run (2026-11-13) takes `git log --grep='Review: Fast' friday-check-2026-11-06..`.

**Handed to the Friday check (Jonathan, 2026-11-10: "let the friday check fix those things"; updated 2026-11-14).**
Done in the 2026-11-14 run: the Tuning Simulator change (`e471fac`, `e2e58c3`, then `bf634eb` and the rest) was in the
range and reviewed by net diff (area B: `tuning-sim-proof` 8,000 rounds; the full walk played it, EN + ES); the
reviewer-model change (Opus on Fridays) is in the skill. Left:
1. **"Too fast" through `cc.prevOnsetT`** (`coach-chords.js`, `ccFinish`: `lastOnsetEff`, line ~1171). NOT attempted on
   2026-11-14 (a lean run): `tools/mic-sim/power-switch.mjs` still takes the old single `coach.js` (gone since the
   2026-11-11 cut) and Power Chord Switch's end screen was rebuilt that day (`81261b2`, Reviewed). First build a
   failing case on the real code; cannot fail it → drop the item. Fails → coach detection: branch + `site-reviewer-deep`.

**Finished (don't redo):** the practice-minutes heartbeat removal (2026-11-05; the old `minutesBoard` collection deleted
too; the class rank and Top 5 are keyed by a private tag, so no uid sits next to minutes). `tools/pm-rules-test.mjs`: 191
emulator cases since 2026-11-06 (179 before); needs Java 21 (on Jonathan's Mac at `~/tools/java`, not on PATH; recipe in
the file's header); one leniency pinned, not fixed: a chunk with no `i` field is accepted.

**Settled, don't re-raise:** the 30 s take cap, the real-guitar mic check, the three "chord sounded wrong" wordings, no
Note Runner mic check ("Later (not chosen yet)"); Stopped-game room-noise rule: room noise after a change counts as a try
(Jonathan, after review round 2, 2026-11-07; recorded in memory `stopped-game-headline-2026-11-07`; `f47a730` had left it
open); Module 1's "3+ steps" vs the Tuning Simulator's 4-5 step levels: leave both (Jonathan, 2026-11-08).

---

