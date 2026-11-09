## Recently shipped (post-archive)

- [x] **2026-11-09 — Console sidebar: a units tree under Class activities (Jonathan's request, shipped Fast).**
      Console only; students see nothing (no CHANGELOG entry). Writes nothing and touches no config plumbing. Why: the
      activities he builds ahead of time but has not assigned sit in the list's last group ("Built — not assigned yet"),
      below every unit. **What:** Class activities is the only sidebar item with a tree (`#t-side-tree`, rows from
      `teacherSideTreeRows(model)`): **Built, not assigned first**, then the units newest first, then Unsorted, each with
      the count the list's heading shows (same `teacherActivityListModel` groups, so the two cannot disagree). A row click
      (`teacherOpenUnitFromSide`) shows that one unit: Units screen, search cleared, every other unit folded, the list
      scrolled to that unit's heading (`activityListJump`, consumed by `teacherPaintActivityList`). On the list already it
      repaints the list rows only, so the Preview (a song may be playing) is not rebuilt; from any other page, or from
      Arrange board, it is the same trip as clicking Class activities. The lit row is the one group open on the Units
      screen with nothing typed (`teacherUnitOpenMap`, the rule the list uses, now one helper). **Always shown, with a
      fold arrow** on the Class activities row; it starts open and the choice is kept per browser
      (`localStorage.teacherSideTree`, try/catch). Hidden below 900px. English only. The tree repaints from
      `teacherPaintActivityList`, `applyTeacherViewChrome`, the board paint, the detail screen, `renderTeacherSongs` and
      `renderTeacherViewSongs` (a song moved to the Songs page, or shared, changes the counts); it writes the DOM only
      when its HTML changed. **Decisions (Jonathan, 2026-11-08):** a click shows the unit and keeps the Preview; always
      visible with a fold arrow; Built first. He also said the Chromebook 1366×657 screen does not bind the teacher
      console. **Proof:** `tools/console-layout-smoke.mjs` now boots through `bootConsole()` and has a units-tree block
      (rows = the stub board's own count, 6 rows adding up to 40 cards; clicks from Songs, from the list with a search
      typed, from Arrange board; counts after an assign, an Un-assign and a song moved to Songs and back; the fold across
      two reloads; hidden at 390px; dark mode). `checks.mjs` runs `teacherSideTreeRows` on a fake model and pins the
      open default. 12 deliberate breaks, each red on its own check: count off by one, Built last, other units not
      folded, Preview rebuilt, search not cleared, fold not saved, no repaint from the list / the Songs view / the board,
      no scroll to the unit, and both `checks.mjs` pins. Check 1ch's Songs-view sandbox got a no-op
      `teacherPaintSideTree` stub (it runs `renderTeacherSongs` on its own).

- [x] **2026-11-08 — Teacher console redesign, Layout A (work order `OPUSPLAN-teacher-console-layout-2026-11-08.md`).**
      Console only; students see nothing new (no CHANGELOG entry). Config plumbing untouched (hard rule 2): every new
      control carries the same `data-*` attribute as its twin on the board, so the same delegated listener calls the same
      writer. **Phase 1, the shell:** the row of 13 view buttons (`#t-viewtoggle`) is gone; a grouped left sidebar
      (`#t-side`, built from `TEACHER_NAV` by `teacherNavHtml()`) replaces it — Teach (Class activities, Songs, Teacher view
      songs, Live quiz) · Students (Students, Skills grid, Trouble spots, Practice minutes, Responses) · Set up (Manage,
      Games) · Tools (Mic recordings, Reports + its unread badge). No "Modules" item. The current item gets `.on` and
      `aria-current="page"` (`applyTeacherViewChrome`). A slim top bar keeps the title, the period filter, Refresh and
      Student view. Sidebar 216px, sticky under the site header; below 900px it becomes one sideways-scrolling strip.
      The console already opened on Class activities (since 2026-10); the static markup now agrees. 1cg's pin on the
      Practice minutes button reads `TEACHER_NAV` now (Students group, after Students, before Manage).
      **Phase 2, Class activities = list + tabbed detail** (`teacherRenderActivityScreen`, `teacher.js`). Three screens
      under one view (`teacherActivityScreen()`): `split` (default), `board` ("Arrange board" = today's board, unchanged,
      plus a Back to list bar) and `detail` (opened from a Songs row or a student's "Blocked by" row: the same tabs alone,
      Back returns to that Songs list / that student). The list: search (title, `#N`, or id), filters Units (default) /
      This week (Mon–Sun) / Keep practicing (pin order) / Not dated (assigned, not retired) / All; Units groups "Unit N —
      name", newest unit first and the only one open, then Unsorted, then "Built — not assigned yet". Rows: #N (or Check),
      date / "Pinned" / "No date", title, tags (Hidden, Optional, Scheduled, Pinned, Archived, Deleted, Not assigned) and a
      done bar for assigned cards. Picking a row repaints the detail only (same list element, same scroll). The detail:
      "Unit N · #num · Released <date> · <view type>", title, Copy link, Pin to Keep practicing, More (Rename…, Hide/Show,
      Un-assign, Open Arrange board, Archive/Restore/Delete). Tabs Preview (default) · Students N/M · Settings, all three
      in the page (`hidden` toggles), last tab remembered for the session. Preview = what `renderTeacherActivityDetail`
      drew (practice card, focus toggle, paths, switches, Level up, Journey, notes as one-line `.ta-info`). Students =
      three counts (done / started / not started) + the roll + the per-student table in the same `[data-ta-live]` boxes;
      `teacherRepaintActivityStudents` also repaints the counts and the tab's N/M. Settings = the board's per-card
      controls from one shared builder, `teacherActivityCtlKit(cfg, activities)` (the board's closures, hoisted; the board
      calls it too). A write repaints the list, header, Settings and Students and never the Preview
      (`teacherSoftRepaintDetail`), so a song playing there keeps playing; the minute refresh repaints the list rows and
      the Students boxes only. **Phase 3:** "Unit N" in the list, the detail header, the board's section headings, its
      Move-to / Assign-to options, `teacherActivityPlace()` and the board's hints; "Module" everywhere else (Skills grid,
      Students, Manage, Trouble spots, Teacher view songs, load warnings, the student site). Labels only.
      **Decisions made under the work order (Jonathan delegated them):** sidebar marks with `aria-current` (not
      `aria-pressed`); list counts follow the console's period filter (on All they equal the sum of the board's P4 / P7 / CAS /
      Unassigned lines; a student whose stored period is something else is counted here and on no board line); the third count is "Not started", not "not opened" (nothing records an open; "started" = a step/check tick
      in `caSteps`, which the roster read now keeps — same doc, no new read; a path pick alone is not a start); the list auto-picks the newest card students
      can see now (else the first row), so the console opens on a preview; switching rows calls `stopCardAudio()` (only
      the preview can be playing on this view); a Built card's Settings shows only what the board shows for it (Assign
      to, name, Songs, Archive/Delete), an archived one only Restore/Delete; library songs and Teacher view songs opened
      from Songs get a Settings tab that points back to their own tab; below 1100px the list stacks above the detail;
      the Songs view's "Opened:" label wraps below 900px (it pushed a 390px page 32px sideways before this change).
      **Proof:** `tools/console-layout-smoke.mjs` (new; stub Firestore, 30 fake students in P4/P7/CAS, seeded board; no
      live data): 13 sidebar views, 4 activities (practice card, focus, paths, exit check) × 3 tabs, 5 filters, 2 folds,
      3 searches, 6 Settings writes with the Preview element kept, the Students repaint, Arrange board and back,
      Back to a student and to Songs, no sideways scroll at 1366/1920/390, dark-mode colours; six deliberate breakages
      each turned it red (list rebuilt on pick, Preview rebuilt on a write, tab count not repainted, default filter,
      board option saying Module, no `aria-current`). Run it after any console layout change:
      `node tools/console-layout-smoke.mjs [--shots <dir>]`. `smoke.mjs --baseline origin/main`: 0 errors on both.
      **Review (Reviewed, not Fast — Jonathan's call for this order):** `site-reviewer` found no major; fixed in the
      last commit: Songs and back dropped the list's pick (R1-1); a Who-limited exit check's note and table counted the
      whole class while its tab counted its students (R1-2, `teacherCheckLiveParts` now uses the Who list); a path pick
      counted as "started" (R1-4); Arrange board had no Back while loading (R1-6); a fold during a search was stored
      unseen (R1-8, folds are ignored while searching); row counts are now worked out only for the rows drawn (R1-9).
      The smoke gained the three promises it did not check (R1-3): every assigned card's row count equals the board's
      doneSummary under All and P4 (62 compared, incl. a Who-limited card and an archived student), the list keeps its
      scroll through a write and both refreshes, and both refreshes keep the Preview element; plus the Who-limited exit
      check's tab and note agree. Each of those four turned red when its code was broken.
      **Review round 2 (`site-reviewer-deep`, fixed on branch fix-console):** a rename left open on Settings, then
      another tab, froze every refresh, the Refresh button's too (R2-1: only an editor on screen holds a refresh back;
      a held-back Refresh says why in the bar for 8 s); the list lost its pick after an
      activity opened from Songs or a Blocked-by row (R2-4, `activityListPickId`); a picked card in a shut unit had no
      row on screen (R2-5: `teacherUnitOpenMap` opens the pick's unit when nobody set its fold; a board Preview shows
      that unit alone, as a tree click does, so the tree's Built row and a pick don't fight); another console's student
      archive showed only after the minute refresh (R2-6, the roster re-filters after the list's fresh read); a TAB kept
      playing after Arrange board, a sidebar switch or Back to a student (R2-7, `stopCardAudio()`); Move to Songs left
      the split on a card the list no longer holds (R2-8); 1ai missed `doc("class")`, backticks and
      `db.doc('config/class')` (R2-3). `syncPressedGroup` (fab-tools.js, no caller) removed. The console smoke went from
      5 to 17 of the reviewer's 18 mutants caught (R2-2; the 18th, nulling the pick on Songs, is no longer a bug since
      R2-4, and its adapted twin is caught; the two writer mutants are 1ai's): per-view markers, the minute refresh,
      chips and roll sums, two stub names that are markup, writes under P4/P7/CAS with the song playing, Move to by
      label, no "Module" in Students/Settings, list pick, sound stops, the hidden rename, Move to Songs, two consoles,
      and the tree's Built row with a pick. Product note for Jonathan, not changed: `class-activities.js` ca-21's
      student text says "Unit 2 assessment" (students' word is Module).
      **Review round 3 (fresh `site-reviewer-deep` on 24c7ccc, 7 minors, fixed):** a pick made under a flat filter or a
      search opens its unit (R3-1: the "unset fold only" rule never fired again after any tree click; newest choice
      wins), and with several units open the tree lights the picked card's (R3-7); a TAB on the detail screen stops on
      the sidebar's Class activities or a tree row (R3-2); a refresh that lands clears the "Not refreshed" note (R3-3);
      Arrange board's read re-filters the roster too (R3-4, `teacherReadConfigAndRoster`); the rename box stays open,
      typed text and all, across tabs, and a repaint keeps what was typed (R3-5, the lead's call: keep the text; this
      reverses round 2's close-on-leave); 1ai counts a write through a snapshot's `ref` (R3-6); the unused
      `teacherRefreshSafe` is gone. The smoke no longer resets folds before its pick tests.
- [x] **2026-11-06 — Practice minutes in the teacher console (needs a `firestore.rules` paste).** Jonathan: "where do I see
      students' minutes and rank?" A **Practice minutes** button after Students in the console's view toggle
      (`renderTeacherMinutes()`, `teacher.js`): one row per student, grouped by period like Manage (`perRank`), with This week
      ("42 / 60 min" ✓, or "N min · break"), Last week, Streak, All time, Class rank ("N / total", "—" under 1 minute) and
      Top 5 ("#3" inside the period this week; "—" under `top5MinMinutes`; blank with no period). Sort: This week (default,
      pinned in 1cg) · All time · Name. English only (the console's labels are). The student detail page is unchanged.
      Jonathan picked all four defaults at STOP 0 and approved the layout at STOP 2 (made-up students only).
      **Reads:** `minutes/{uid}/weeks` for every student on the roster (the teacher's own account left out), from the
      SERVER, 10 at a time, when the view opens and on its own Refresh only (no timer, no listener; kept in memory until
      Refresh; "as of 3:58 PM"). Cost: one read per weeks doc, about students × weeks since 2026-11-01 per open/Refresh.
      Never `collectionGroup('weeks')` (it needs a wildcard-first rule; 1cg forbids it). Writes NOTHING.
      **It never reads the boards or the tags:** rank and Top 5 are worked out from the weeks docs with the engine's own
      maths, moved into pure `calc.rankPlace()` / `calc.top5Place()` (the student page's `rankInfo` / `top5Info` call
      them too; pm-sim's 278 older checks gave byte-identical output before and after the move). Rank counts the whole
      roster (archived students too), whatever the period filter shows; total = students with at least 1 minute.
      **Known difference (a note under the table says so):** a student's own rank comes from `rankBoard`, which can trail by
      a few minutes and counts only students who opened the site since 2026-11-05, so it can differ slightly; the console's
      is the true number.
      **Rules change (the only Firestore change):** `allow read: if isTeacher();` in the `minutes/{userId}/weeks/{week}`
      block. `days`, `meta/board` (the tag) and the owner-only tree block are untouched; still exactly 4 `match /minutes/`
      blocks. 1cg used to ban `isTeacher` in all three minutes blocks; now the tree and days blocks still do and the weeks
      block is pinned whole (`WEEKS_SHIPPED`). Emulator: 191 passed, 0 failed (12 new cases); three scratch breaks of the
      rule each turned cases red. **Order:** the view handles unpublished rules (one line, "Publish the new Firestore
      rules…"), so code before the paste breaks nothing.
      **Proofs:** pm-sim section 17 (PM_SIM_PIN 278 → 285) runs `teacherPmCompute` from `teacher.js` on 600 made-up
      rosters (11,683 students: break weeks, ties for 5th, no period, under 1 minute) against `calc.status` and the old
      rank / Top 5 formulas, and 190 students through the REAL student page; 7 mutations of the console or engine maths
      each turned it red. 1cg pins the button, the default sort, the dispatch and the weeks-only server read with no
      write and no timer (8 breaks, each red). `tools/smoke.mjs` does not drive the console, so nothing was added there.
      **Review (site-reviewer-deep, same day): 2 major + 5 minor, all fixed, none a student leak.** R1-1 a Windows (CRLF)
      `teacher.js` failed pm-sim section 17 (now normalised). R1-2 a console left open over a weekend showed Friday's numbers
      as today's: the view re-reads when its read is from an earlier day, works the numbers out as of the read, and stamps
      "Fri, Dec 11, 3:58 PM" when it is not today. R1-3 a period the student typed as `constructor` got a Top 5 place the
      student never sees, and the number 4 made its own group: own-key lookup and string group keys (Manage had the same
      group-count bug; fixed there too). R1-4 the 1cg read pin missed reads written as path strings; R1-5 nothing pinned
      "ranks count the whole roster" or "the teacher is never ranked" (1cg now checks both; the teacher filter is RUN).
      R1-6 a refused Refresh after a good read hid the table behind "Publish the rules" (now only when nothing was read).
      R1-7 a read that never answers locked Refresh (20 s ceiling per read). Jonathan's call on the reviewer's projector
      note (one click shows every student's minutes by name): keep it as is, no extra click.
      **Round 2 (the reviewer re-ran every R1 scenario: all fixed) found 4 more MINOR, all fixed:** N1 a view left on screen
      past midnight never re-read (coming back to the tab now repaints it, which runs the day check); N2 a period typed as
      '04' or ' 4' split Period 4 into interleaved groups (exact '4' / '7' / 'CAS' ranks, then the period text; Manage too);
      N3 1cg scanned only the view's block (now the whole of teacher.js: one `collection('minutes')`, no `minutes/` path
      string, no collection/doc call naming days, meta, rankBoard or weekBoard); N4 1cg missed a roster built from the
      filtered rows or from allStudentsRaw directly, and `teacherPmPeriod` was not run (both pinned; it is run on 13 values).
      **Round 3** confirmed N1–N4 (Manage's order identical to base on 16,171 random rosters) and left one realistic gap,
      fixed: `collectionGroup` and a spaced `.collection (` are now banned in the whole of teacher.js. Left on purpose
      (needs a deliberately disguised read in our own code): collection names held in variables.
- [x] **2026-11-04 — Practice minutes: Top 5 of the week, by class period (needs a `firestore.rules` paste).**
      A "TOP 5" medal in the strip, a once-a-week toast and a fifth My progress tile for the students with the most minutes THIS ISO week inside
      their own class period; ties share a place; 10 minutes needed (`top5MinMinutes`); each student sees only their own place.
      **Standing rule from Jonathan (2026-11-04): no per-period minutes tied to a name, readable by anyone.** The live quiz kept names under uids
      (`liveQuiz/current.scores`, read by every signed-in account), so the board is NOT keyed by uid: `weekBoard/{tag}` holds `{week, period, seconds}`
      under a private random 32-hex tag that lives only in the student's own owner-only, create-only doc `minutes/{uid}/meta/board` (page memory
      only, never localStorage: a shared Chromebook would leak uid -> tag).
      A board write is allowed only under the writer's own tag (the rule reads that doc). Both blocks are pinned whole in checks.mjs 1cg
      (`TAG_SHIPPED`, `WB_SHIPPED`, plus the tree block, exactly 4 `match /minutes/` blocks and no wildcard-first match). Read from the SERVER only
      (`get({source:'server'})`): offline, a plain get() answers empty from the cache (measured on the real SDK), which also bit `load()` and
      `loadBoard()` and is fixed there.
      **Closed 2026-11-05 (Jonathan's picks: take the names out of the live quiz, then also key the class rank by the tag).** (1) `liveQuiz/current.scores`
      (read by every signed-in account) carries NO name: only `{pts, right, answered, last, lastRight}` per uid (a whitelist copy, `lqPublicScore`);
      names live in the teacher-only `answers/{uid}` docs and the wall builds its leaderboard from them (`lqNames()`, `lqRankedNamed()`); a student's end
      screen shows other players as "Student". The writers REPLACE the field (`set(..., {mergeFields})`): a plain merge is deep and kept old names in
      the doc. checks.mjs **1cm** runs the real writers against a doc that merges like Firestore, starting from an older game full of names, plus the
      views and the `answers` rules. (2) The class rank moved from `minutesBoard/{uid}` to `rankBoard/{tag}` (same private tag as the Top 5);
      `minutesBoard` has NO rules block any more and 1cg fails the push if one comes back. A person in the room can still line the wall's names and points
      up with the public uid -> points (a uid, a name and points), but no uid reaches minutes. Never publish a name next to a uid, or
      minutes next to a uid, again. **ONE-TIME after deploying: delete the `scores` field of `liveQuiz/current` in the Firebase console (the last game's
      names stay in it until a Reveal/End/Close/Start writes it); the old `minutesBoard` docs were unreachable and DELETED in the console on 2026-11-05 (the whole collection; Jonathan asked).**
      Visible side effect: the class rank (N/total) restarts as students open the site (each page creates its `rankBoard` doc at the server's confirmed
      all-time sum on its first publish), so `total` is small at first. Also still true: `config/class.periodOverrides[uid]` is readable by every student
      and gives a period (never a name).
      Known limit: a tag cannot be proven unique, so any account can claim another's public tag and lower/remove that one entry (fix would be a
      create-only reverse index `boardTags/{tag}` with `existsAfter`; not built; the emulator now runs here, and two cases in `tools/pm-rules-test.mjs` pin this limit so they flip when it is fixed).
      `tools/pm-rules-test.mjs` has cases for `minutesBoard` (no rules), `weekBoard`, `rankBoard` and `meta/board` since 2026-11-05 (since then also the recorded takes, their audio chunks and the take counter: 179 passed, 0 failed on 2026-11-05; 12 + 16 deliberate breaks of the rules each turned a case red; one known leniency pinned: a chunk with no `i` is accepted, which the console never reads). Other tests: pm-sim sections 14-16, pm-e2e "top 5".
- [x] **2026-11-01 — Practice minutes (student view only; display switched ON the same day: `uiOn: true`, `streakStartWeek: '2026-W45'`, goal 30; 60 since 2026-11-04).**
      Counts seconds of real backing-track playback and shows a weekly goal, a
      week streak and "N playing". Counting and writing ship LIVE; nothing is
      drawn until `uiOn` is set to `true` in `practice-minutes-config.js`.
      **Files:** `practice-minutes-config.js` (every setting, nothing else),
      `practice-minutes.js` (engine + all UI; no build), `tools/pm-sim.mjs`
      (runs the engine against fakes; part of checks.mjs **1cg**),
      `tools/pm-e2e.mjs` (real Chrome at 1366×657, screenshots; by hand),
      `tools/pm-rules-test.mjs` (the rules against the Firestore emulator; by
      hand), `firestore.indexes.json` (one composite index). Hooks: `window.PM_HOST`
      in `app.js` (ui:true) and `tabs/journey.js` (ui:false), `PM.syncHeader()`
      on every `#user-area` paint path (the strip is the `#pm-header` button in the main top
      bar; it was in a practice card's bar until 2026-11-04), `PM.renderProgress()` in
      `renderMyProgress()`, a `<div id="pm-progress">` in index.html, two script
      tags in index.html and in all six `tabs/*.html`.
      **What counts:** an `<audio>` whose file is `audio/…-backing-…`, playing
      (not paused/ended/muted, buffered, currentTime moving), tab visible,
      student signed in, not the `?teacher` console. Detached `new Audio()`
      elements are seen by wrapping `HTMLMediaElement.prototype.play` (it only
      observes). NOT counted: metronome, ear trainer, games, note strums,
      the student's own recording, YouTube. Cap `dailyCapMinutes` (20) per day.
      **2026-11-03 — ALL SITE WORK COUNTS (Jonathan: "any work inside the
      website from modules to other class activities should count towards
      minutes and streaks"; reverses the backing-tracks-only rule above).**
      Rule he picked from three: a second counts while ANY audible
      `<audio>`/`<video>` plays, OR the student showed a sign of work in the last
      2 minutes (`ACTIVE_MS`): pointerdown/pointermove/keydown/wheel/scroll/
      touchstart/input on the document, a Web Audio `start()` (metronome, games,
      strums, trainer — `AudioScheduledSourceNode.prototype.start` wrapped, observe
      only), a live mic track from `getUserMedia` (`MediaDevices.prototype` wrapped,
      observe only); 10 minutes (`FRAME_ACTIVE_MS`) while focus sits in an
      embedded video iframe. Tab visible + signed in as before. Goal 30/week and
      cap 20/day kept (his call, same day) — classwork alone will often meet the
      goal. The recap pill and the "N playing" heartbeat stay tied to SOUND: a
      `play` run inside the counting session opens while something is audible and
      ends 2 s after it stops (the old card count-in grace); the session itself ends
      2 s after counting stops and flushes. `isBacking()` is gone. pm-sim
      section 12 (17 assertions; PM_SIM_PIN 142 → 159). The strip still shows only
      on practice cards; My progress shows the totals.
      **Storage:** `minutes/{uid}/days/{date}` `{seconds}`, `minutes/{uid}/weeks/{ISO week}`
      `{seconds, goalSeconds, hit}`, added with `increment()`; queued in
      localStorage, ONE KEY PER PAGE (`pm:q:<uid>:<pageId>`; a page adopts only a
      dead page's key), flushed every 60 s / on stop / on hide / on `online`, and
      by a `fetch({keepalive})` to the REST `:commit` on `pagehide` (sendBeacon
      cannot carry the auth header; the cached token must be this student's).
      **Leaving a page (2026-11-01 Friday check):** Chrome fires `pagehide` THEN
      `visibilitychange:hidden` (measured, Chrome 153); the second starts no
      commit and keeps the leaving key. The keepalive sends `pend` even with a
      commit in flight — but not when that commit has been unanswered for 30 s
      (a dead link: the keepalive would die too and its seconds be deleted as
      landed; `DEAD_LINK_MS`). A commit still in flight at the close STAYS in the
      leaving key — **Jonathan, 2026-11-01: "be liberal with minutes since this
      is for motivation"** (this reversed his "lose under a minute" call from
      earlier the same day): when unsure, count it; a batch that had landed is
      counted twice once, bounded by the rules' daily cap. The keepalive's own
      seconds are still taken as landed on a live link (keeping them too would
      double the last minute of almost every session). A leaving key is adopted only once it is 3
      minutes old (the old "pagehide stamp 0 = adopt at once" never survived
      Chrome's order). Signing out and back in on an open Journey page folds the
      page's own key back in (`sync`, `leftInflight`, used once); a commit that
      answers after a switch never rewrites a key a newer state of that student
      has written (`newestGen`), it only adds back what did not land; with no
      newer state it EDITS the key (takes out a commit that landed) and never
      rebuilds it — another page may have adopted it (re-review R3-1). Streak: a miss before any
      streak spends no free miss (Jonathan, 2026-11-01). pm-sim section 10.
      A commit has NO timeout (the SDK keeps and later delivers it; re-sending
      multiplied the seconds in the review, a 5-minute stall stored the daily
      cap) and a read never overlaps a write. The first adversarial review
      (2026-11-01) found 14 issues, R1-1…R1-14; `tools/pm-sim.mjs` section 9 has
      a regression scenario for each fixed one. `heartbeats/{random
      session id}` `{period, lastSeen}` every 30 s while counting; the count is
      one REST `runAggregationQuery` (the compat SDK has no `count()`).
      **`firestore.rules` changed (new blocks only) → needs the console paste
      BEFORE the code is live, or every write is refused** (the client keeps
      refused seconds and retries every 5 min, so a late paste loses nothing).
      **2026-11-06:** the teacher's account may READ `minutes/{uid}/weeks/*`
      (the console's Practice minutes view; one more paste): see that entry.
      `dailyCapSeconds()` in the rules must equal `dailyCapMinutes × 60` (1cg).
      **Rules (all in the config; simplified 2026-11-01 by work order):** the goal
      is FLAT, `weeklyGoalMinutes` in every counted week for every student, whatever
      days they practise. There are NO meeting days, no no-school dates, no short
      weeks and no proration (checks.mjs 1cg fails if those keys return).
      `skipWeeks` is a list of Mondays (checked to be Mondays); a skipped week
      neither counts nor breaks a streak, and minutes played in it still add to the
      totals and My progress. `semester2Start` (Mon 2027-01-04) is where the one
      free missed week per semester resets. "This week by day" is Mon-Sun for
      everyone, and a day with no practice is an empty bar. `streakStartWeek` (set it
      to the week `uiOn` goes live) makes the streak start fresh; the streak and "hit"
      are recomputed from seconds against the CURRENT goal, so changing
      `weeklyGoalMinutes` re-scores old weeks (the stored `hit`/`goalSeconds`
      are a snapshot for later use). The prefilled skip weeks (Thanksgiving, two
      winter-break weeks, mid-winter break, spring break) and the semester date
      came from the work order, not from a calendar: check them against the district's.
      **Layout:** (until 2026-11-04 the strip sat in a practice card's bar and Full
      screen folded to its icon; it no longer does, see below). **Limits:**
      a Journey page's player loops by itself and counts while it plays (the
      daily cap bounds it); the heartbeat count can be inflated by anyone
      signed in, and anyone signed in can list the heartbeats collection
      (random ids, but createTime/updateTime make a session-start log per
      period: a TTL policy on `lastSeen` is a console step, NOT set by the code;
      see APPLY-practice-minutes.md); the
      stored week `hit` is a best-effort snapshot; "weeks in a row" is the work
      order's copy and stays true after a forgiven miss only because the miss
      is forgiven; the games card already shows a 🔥 day streak, so a
      second flame (weeks) may confuse; `--streak-dim` is 2.5:1 on its
      background (the one graphic under 3:1, on purpose — "dim").
      **2026-11-04 — the strip moved to the main top bar, every page.** Work order
      `WO-practice-minutes-header.md`. All work counts, so the number has to be
      where the work is. **Where:** `<button id="pm-header" class="pm-strip
      pm-strip-header" hidden>` first in the header's right-hand group
      (`index.html`); `PM.syncHeader(show)` fills and shows it when `uiOn()` + host
      `ui:true` + a student (`uiOn()` runs `sync()`, so a new student's state is built
      before anything is drawn: a shared Chromebook never shows the last student's
      numbers) and hides and empties it otherwise. `app.js` calls it after each of its
      four `#user-area` paints (`showApp` = `true`; the sign-in wall, signed out and the
      paused screen = `false`) and `teacher.js` after its two (`false`; `PM_HOST.user()`
      is null on the console anyway). `refreshStrip()` hides and empties
      `#pm-header` rather than removing it, never un-hides it and never fills a hidden
      one. A click calls `toggleMyProgress()` (opens, or scrolls to the top; never
      closes). **Gone from the practice card's bar:** `caSyncTopbar()` no longer draws
      it, `PM.onCardOpen` is removed, the card-bar CSS that made room for it is removed
      (Full screen has its word back; the bar measured identical to `uiOn:false`, EN +
      ES). Journey pages are untouched (`ui:false`). **Pills:** the toast (centred under
      the strip) and the recap (right edge in line with the strip's) drop down on any
      page, kept inside the window; `anchorRect()` is the strip's rect, or `null` if the
      strip is hidden OR covered (`elementFromPoint`), `followStrip()` removes a pill
      when that goes null, and `uiTick()` (1 s) shows a toast that was held back. The
      recap still opens only when a play run ends (engine rule, unchanged).
      **STOP A (a scrolled practice card): passed.** The header is outside the scrolled
      `#main-content`, and the card's sticky bar sits at top 49px under it (z 50 vs 20),
      so nothing covers the strip (measured with `elementFromPoint` at the strip's centre
      after scrolling a 2,900px card to the bottom). No stacking was changed.
      **STOP B (Spanish, long name, "N playing" showing): failed as first built**, and
      Jonathan chose to shorten the week text. `pm.weekMin` is now "{done}/{goal} min"
      (was "… min this week"), `pm.weekMinBreak` "{done} min". Measured at 1366×657
      with "N playing" showing: Spanish holds one row for names up to 21 characters
      (10 as first built; 55 with no strip), English up to 45 (35 as built; 61 with no
      strip). Longer names wrap the title and the bar grows 49 → 70px; not fixed (a
      different choice would have been to drop "N playing", 23/48, or both, 35/56).
      **Games** is a full-screen layer (`.games-screen`, z 120) over the whole page, so
      the strip is covered there with Find, Español and Sign out; a pill is not drawn
      under it and a toast waits. Left as is: raising it would change stacking.
      **Cost:** `ensureStripWork()` now runs for every signed-in student on every page:
      one aggregation query per 30 s per visible tab for "N playing", all class. Accepted;
      the interval is unchanged. **Tests:** checks.mjs 1cg pins the new wiring (16
      mutations, 16 red); `tools/pm-e2e.mjs` is re-pointed at the header and gained module-page pills,
      signed-out, student-switch and `?teacher` cases (it was already red at two points
      on origin/main after the 2026-11-03 engine change: a recap now needs a PLAY run,
      `PM._play().counted`, and a session starts at the first click); `tools/smoke.mjs`
      walks the strip on 6 views x EN/ES x 1366/390 px, the click and a reload.
      **2026-11-04, later the same day (Jonathan: "drop it and add this to games screen";
      he chose "the minutes strip"):** (1) **"N playing" is dropped** from the strip: no
      `.pm-live`, no `pm.playing` string, `ensureStripWork()` no longer starts the 30 s
      poll (so the poll-cost note above is now void). `pollLive()`, the heartbeat writer,
      `S.live`, `liveMinCount` and the heartbeats rules block are LEFT IN PLACE (the
      counting half, pinned by pm-sim 159/159): a follow-up could remove them with their
      rules and sim tests, but that is a `firestore.rules` change (console paste) and the
      writer still does one write per student per 30 s of audible playback for nobody to
      read. (2) **The Games screen has its own twin**, `<button id="pm-games" class="pm-strip
      pm-strip-games">` in `.games-topbar` (right cell), because `.games-screen` (z 120)
      covers the whole header. `HOST_STRIPS = ['pm-header','pm-games']`; `syncHeader()`
      shows/hides both, `refreshStrip()` fills both, `anchorStrip()` picks the first one
      that is shown and on top (`elementFromPoint`), and a pill dropped from the Games strip
      gets z-index 130 (above the Games layer). A click calls `toggleMyProgress()`, whose
      hash route closes Games. The Live quiz overlay (`#live-quiz-screen`) is NOT given a
      strip. (3) STOP B capacity, remeasured: with the short week text and no "N playing"
      Spanish holds one row to 35-character names, English to 56 (was 21 and 45). (4) The
      toast is measured from the middle of the window so a strip at the right edge (Games)
      does not squeeze it into a narrow column.

      **PICK UP HERE (written 2026-11-04 for a move to a new machine).**
      *State:* everything above is live on `main` (last commit `fe196aa`; the strip is
      in the top bar and on the Games screen, "N playing" is gone). Nothing is half done
      and nothing is waiting on a console paste. `pm-e2e` 84/84, `pm-sim` 159/159, smoke
      clean, full `checks.mjs` green.
      *Update 2026-11-05:* step 1 below is LIVE on `main` (the branch is gone) and step 2 is
      done, console paste included, and the emulator run too (summary: "Practice-minutes heartbeat
      removal (not Power Chord Switch): DONE" further down). *Earlier 2026-11-04 note:* **step 1 below was DONE on
      branch `work-heartbeat`** (two commits: "Practice minutes: remove the heartbeat writer…" and
      its review fixes). `pm-sim` is now 152/152 (the heartbeat tests became "no
      heartbeat" / "no live count" runs; section 8 draws a stub strip), `pm-e2e` 84/84.
      `period()` and its `pm:p:<uid>` cache left the engine too; `PM_HOST.period` in
      `app.js` and `tabs/journey.js` is now dead but left in place. 1cg pins the
      heartbeats rules block as "gone, or exactly as shipped". Step 2 waits for step 1
      to be live.
      *2026-11-04 — weekly goal 30 → 60 minutes (Jonathan), at once.* `weeklyGoalMinutes`
      60; the daily cap stays 20 (`dailyCapSeconds()` 1200, rules and indexes unchanged),
      so a week needs at least 3 days at the cap (60 ≤ 7 × 20, the 1cg range check). Not
      retroactive: `calc.status` re-scores from the current goal, but `streakStartWeek`
      is 2026-W45 (this week) so no finished week counts yet, and W44 held only Sun
      11-01 (≤ 1200 s, never a hit at 30 either). A student already past 30 this week
      drops back to "N/60" (ring blue, flame dim, streak 0 until 60); their stored week
      doc keeps `hit: true` (sticky by design) beside `goalSeconds: 3600` on the next
      flush — a snapshot nothing reads. Their `pm:t:<uid>` already says W45, so the
      "Week goal hit" pill does not show again when they reach 60 this week (the tile
      and the recap still say it). pm-sim 154/154 (every 1800 s became 3600 s; section 5
      is now 4 × 16 min, plus a new 3-days-at-the-cap run: 2400 s not hit, 3600 s hit);
      pm-e2e re-derived for each reach branch (Sunday 50/60, Saturday 40|39/60, Friday
      and Saturday from 0, 53/60 strip and recap, "60/60 min" widest strip).
      *2026-11-04 — class rank on My progress ("N/total", Jonathan).* New collection
      `minutesBoard/{uid}` `{ seconds }` (all-time confirmed seconds = the sum of the
      weeks docs); every signed-in student reads it, only the owner writes it, no delete,
      cap `400 * dailyCapSeconds()`. **Its rules block must be published BEFORE the code
      goes live** (until then the write and read are refused quietly and the tile is just
      absent). Engine: `publishBoard()` (a page only ever ADDS: `increment(owed)` merged,
      where `owed` = seconds the server confirmed since its last write; the first write of
      a page looks at the doc and CREATES it at the whole confirmed sum, history included,
      if it is missing; at most once per 2 min, one trailing timer so the end of a session
      is not left out; never for the teacher's account) and `loadBoard()` / `rankInfo()`
      (reads the whole collection, kept 3 hours in memory and in `pm:b:<uid>`; rank = 1 +
      others with more WHOLE minutes; under 60 s = no number). A plain "write my total"
      was tried first and the review showed it loses minutes when a Journey tab and the
      main tab both work. Costs one read per student per refresh (about 150 reads, at
      most one per 3 hours); the Spark limit is 50,000 reads a day, shared with the rest
      of the site: if the class grows or the project is on Spark, replace the full read
      with a count query. pm-sim section 13. Honest limits (also in the engine header and
      the rules): a student at DevTools can claim any number up to the cap; any Google
      account that signs in once adds 1 to the total (Jonathan chose no domain rule); the
      live quiz keeps player NAMES under the same uid in `liveQuiz/current.scores`, so a
      student who looks can match a name to a board number (Jonathan accepted this,
      2026-11-04); a page that closes within 2 minutes of its last confirmed seconds
      leaves them off the board; pm-e2e's fake `minutes` collection has a duplicate `doc`
      key (since 70ef823) so the e2e never runs the board WRITE, only the read and the tile.
      *[DONE: step 1 on 2026-11-04 (5144c6c, edb60e6, 3d87f7d); step 2's repo edits on
      2026-11-05; only Jonathan's console paste is left. Do not redo the steps below; the
      text is kept as history.]* *Open item, Jonathan's call: remove the heartbeat.* "N playing" was
      dropped from the screen, but the engine still writes a `heartbeats/{sessionId}`
      record (`{ period, lastSeen }`) about every 30 s while audio plays, and nothing reads
      it. Why remove it: writes for nothing, dead code in the counting half, and the
      records are listable by any signed-in user with a creation time (a session-start log
      per period; the TTL policy on `lastSeen` was never set, so they pile up). Do it in
      this order:
      1. **Code, no console paste.** In `practice-minutes.js` delete the heartbeat writer
         (`beat()` and its `lastBeat` check in the tick, `HEARTBEAT_MS`, `randHex` if only it uses
         it, the `pmSid` session id), `pollLive()` and its `_pollLive` export, `S.live` /
         `S.liveAt`, and `liveMinCount` (DEFAULTS and `practice-minutes-config.js`). Remove
         the heartbeat and aggregation-query tests from `tools/pm-sim.mjs` (about lines
         600-640, and the heartbeat write tests) and lower `PM_SIM_PIN` in
         `tools/checks.mjs` to the new count; drop the heartbeat-rules pin and the
         `liveMinCount` range check in 1cg; drop the `runAggregationQuery` fake in
         `tools/pm-e2e.mjs`. Counting, `flush()`, the queue and the keepalive do not change.
      2. **Rules, needs Jonathan's Firebase console paste** (GitHub Pages does not deploy
         `firestore.rules`): delete the `heartbeats/{sessionId}` block and its comment from
         `firestore.rules`, the `heartbeats` composite index from
         `firestore.indexes.json`, and the `== heartbeats` section of
         `tools/pm-rules-test.mjs` (about lines 85-110, plus its header line). Only
         after step 1 is live, so no write is ever refused.
         Old `heartbeats` documents can be deleted in the console; they are harmless once
         nobody can read them.
      *Review:* this edits the counting half, `pm-sim` and `firestore.rules`, so it is
      **Always Reviewed the same day** (`site-reviewer-deep`, failing scenario first), not
      Fast. Proof to bring: `pm-sim` and `pm-e2e` pass, 1cg pins broken in a scratch copy
      and red, a play session still counts and flushes the same seconds as before.
      *Other loose ends from this work:* the Live quiz overlay has no minutes strip
      (left on purpose); a held-back toast needs the 1 s tick, which runs only while the
      student is working (fine in practice); a Spanish name over 35 characters, or an
      English one over 56, still wraps the top bar from 49 to 70px. Not fixed
      (pre-existing): `tools/pm-e2e.mjs` (about line 110) defines `doc` twice in its
      in-page fake Firestore, so the second (a leftover heartbeat recorder) wins and
      the fake never loads or flushes minutes; removing it alone makes the batch fake
      compute NaN with the real `FieldValue.increment`.
      *On a new machine:* clone the repo, `git config core.hooksPath .githooks`, Node 22+
      (global `WebSocket`) and Google Chrome for `tools/pm-e2e.mjs` and `tools/smoke.mjs`
      (pass `--chrome <path>` if it is not in the usual place); use a git worktree
      (`git worktree add ../guitar-class-<name> -b work-<name> origin/main`) if another
      session is open. Claude's memory notes live in `~/.claude/projects/…/memory/`, NOT in
      the repo, so they do not travel: this entry and `CLAUDE.md` are the record.

- [x] **2026-10-31 — "Hear It First": a hidden adaptive ear + fretboard trainer.**
      Work order `WO-hear-it-first.md` (kept out of the repo). For Jonathan's
      own ear on an electric guitar: hear a tone and find it, see a fret and
      know its sound, name and play intervals, play back phrases, find named
      notes. It finds weak spots (moves on a string, across strings, across the
      neck, intervals, phrases, note locations), spends practice there, and
      teaches (a one-line lesson card, two easier items with "Hear the slide",
      a contrast drill for a confused pair) until each one is gone.
      **Where:** `index.html?hif=1` (add `&hifdebug=1` for `window.__hif`), any
      signed-in account; no hub card, never visible to students.
      **Files (flat, at the root):** `trainer-core.js` (pure engine, no DOM /
      audio / Firebase / strings), `trainer-audio.js`, `trainer-ui.js` (the
      English text, the screens, `createTrainer`), `trainer-site-adapter.js`
      (the ONLY one that touches site globals; the one small script index.html
      loads). `guitar-diagrams.js` gained one NEW function,
      `trainerFretboardSvg`; every old diagram is byte-identical
      (`node tools/diagram-regression.mjs <ref>`). All four are in
      `SHELL_FILES` and `SHELL_NOT_PRECACHED` (loaded on demand, like
      `teacher.js`).
      **How it listens:** `coach.js`, unchanged — its mic, onset detector and
      pitch reader, called from the adapter. The input picker is a
      `getUserMedia` wrapper that is in force only while `coachAcquireMic()`
      runs. Cents come from the readings `coachSettlePitch` leaves behind (it
      returns a whole note). A reading within 45 cents counts; 45–50 is "didn't
      catch that".
      **Where it saves:** `progress/{uid}.trainer`, written with
      `set({trainer}, {mergeFields:['trainer']})`, plus a uid-keyed localStorage
      copy. `firestore.rules` is unchanged (that document has no field
      whitelist). Under 30 KB: 25 KB with every one of 208 cells used.
      **Sound:** the site's own `playNote(..., synthOnly=true)` (Karplus-Strong,
      no audio files; the recorded notes stop at MIDI 74 and the trainer goes
      to 84).
      **How to test:** `node tools/trainer-sim.mjs` (19 unit checks, learners
      A–H on 20 seeds; its own command, NOT in checks.mjs; run it after any
      `trainer-core.js` change), `node tools/trainer-e2e.mjs` (real Chrome over
      the DevTools protocol; a fake guitar plays synthesized plucks into
      `getUserMedia`, so the site's real detection runs; `--quick` skips the
      placement walk), `node tools/diagram-regression.mjs <ref>`.
      **The finding to know before a student release:** the work order's unlock
      rule (every new cell at m ≥ 0.75 and n ≥ 6) is slow. A steady 95%
      learner starting at Zone 1 / Tier 1 opens Z2 at about session 7, Z3 at
      28, Z4 at 60–78, and does not reach Z5 or T4 in 90 sessions; coverage
      weighting, 4 answers per cell, or pooling by row help only a little
      (`unlock.granularity`, `unlock.minN`, `weights.coverage` in the config
      are the switches). Placement is how an expert gets up the ladder.
      **Interpretations the work order left open** are numbered I1–I11 in the
      header of `trainer-core.js`.
      **Not yet checked on a real guitar:** the work order's electric-guitar
      checklist (section 8), and frets 13–20 on the B and high e strings (up to
      1046 Hz), which the existing games never reach.

- [x] **2026-10-26 — Watchtower: the record's rhythm replaces the book rhythm.**
      Jonathan and Claude measured the Hendrix rhythm guitar on the beat map
      (26 A-bars, 26 F-bars) and Jonathan confirmed it by ear. Bar 1 is
      `A A A A G G G G` (G on beat 3, no rest); bar 2 is `F F F · · G G G`.
      Changed everywhere the book rhythm lived: Modules 2–7 (text, captions,
      `tab.notes`, playSeq data — frozen modules in place, rule-zero holds),
      ca-29 (every section one rhythm, verse exception retired), ca-38's
      caption (closes the 2026-10-25 open item), Riff Runner (14 targets a
      lap, same minimum gap as before), the Journey page Layers 2–5, the
      song-facts skill. Left on purpose: ca-26 (two plucks per note) and ca-40
      (one 2-beat strum per chord). The F bar's rest is a HELD third F, never
      `{ rest: true }`, so ca-29 stays at 224 chord changes.

- [x] **2026-10-25 — Whole-site sweep + audio levelling.** Jonathan: "spawn
      agents and check the site for errors, make changes and look for
      inefficiencies such as instances to refactor", then a plain-wording pass,
      a cache-fingerprint fix, a Teen Spirit zip and a loudness rule. 11
      read-only auditors, 7 fixers (one per file family, each in a pre-created
      worktree), 4 adversarial reviewers plus a review-fix round per family.
      Pushed as 111 commits (`5d1ff51..6ea5898`, live `…-6f4dcd3b92`) and 18 more
      for Teen Spirit (ca-41) and the loudness pass (`..ba655c7`, 32 mp3s
      re-encoded, +267 MB in git history, every cached track re-downloaded
      once). Headline fixes: ~15 dead lesson ▶ buttons (an `onclick` escape
      hole); a stored XSS through a student's `period`; Name That Riff freeze;
      Finger Gym no longer overwrites a Note Runner mic take; console counted
      moved songs as Pending; two-console board corruption and views stuck on
      "Loading…"; deploys no longer reload mid practice-card song; the A chord
      diagram now matches Module 4; seven steps pointed at removed UI; fonts and
      icons now bump the cache. New checks: **1br** (steps pointing at removed
      UI), **1bs** (every inline handler in every rendered set compiles and
      passes the right title), **1bt** (every precached file is fingerprinted),
      **1bu** (soft: each song within 1 LU of "the cure"); 1bf now *renders* the
      card builders; 1ah follows the guard, not the token. New tools:
      `tools/smoke.mjs` (real-browser walk, `--baseline <ref>` to diff against a
      clean ref), `tools/loudness.py`. New guidance: `.claude/rules/code-hygiene.md`,
      `.claude/rules/teacher-console.md`, skill `site-sweep`, and a "Start here"
      block at the top of CLAUDE.md. Left for Jonathan (praise voice, hidden-tab
      games, the ca-38 Watchtower caption (done 2026-10-26, see above), sw.js re-download cost, language and
      refactor backlogs) is in the project memory `site-sweep-2026-10-25`.
      Six backing-track files stay more than 1 LU off "the cure" on purpose
      (slow-tier and guitar-off exports are quieter at the source; Jonathan chose
      one gain per song).

- [x] **2026-10-10 — "Keep practicing" row (pinned activities).** Work order
      "Keep practicing row on In-Class Activities". New
      `config/class.activityPins` — an ORDERED array of up to 4 activity ids
      (an array, not an id → true map like its neighbours, because the order
      is what students see and 4 is a hard cap). **Console:** every assigned,
      non-check card on the Class activities board has a **Not pinned /
      Pinned n of 4** switch beside Play Along (`teacherSetActivityPin`); a
      5th pin is refused with an alert. A strip above the board lists the
      row in pin order with an Unpin per pin and says why a pin students
      can't see is dark (Hidden, archived, not assigned) — it is the
      console's preview of the row and the only way to unpin an archived
      card. Built cards list a stray pin under "Carries:". Delete unpins in
      its own strict write; Archive keeps the pin (students don't see it).
      The writer is cell-checked on the whole array (`base:
      {activityPins: prev}`), so a pin from another console refuses rather
      than being overwritten; checks.mjs 1ai `CONFIG_WRITERS` 20 → 21.
      **Students:** `caPinRowHtml()` draws the row above Today's activity,
      one button per pin in pin order, nothing at all with no pins. (Until
      2026-10-13 it also dropped any pin that was one of today's cards;
      Jonathan wanted pins to stay put, so that filter is gone.) A tap (`caOpenPin`) goes through `caFocusActivity`,
      so a card on the dated list opens where it sits and a pin-only card
      (`caIsPinOnly` — undated, or Play Along now) renders straight under the
      row while it is the open card, no Songs heading, no date chip. The pin
      stands in for the release date for that row only: `caIsVisible`, the
      three blocker rules and `CA_TODAY_MAX` never read it, and it writes no
      completion data. Hidden / Archive / Delete / unassigned all still win
      (`caPinReachable`). Cached in `localStorage` (`caPins`) like the other
      maps. Strings `ca.pinsTitle` («Sigue practicando») and `ca.pinDone`.
      No `firestore.rules` change (header comment only — nothing to paste).
      Verified at 1366×657, dev bypass with the cache seeded: 0, 1 and 4
      pins (row 40px + 10px margin, one line), a practice card and ca-23
      opened from the row, hidden + pinned not shown, ES; 390px phone wraps.

- [x] **2026-10-06 — Play-along first: Song Journey pages stay open as the
      back door.** Reverses part 1's per-song retire switch and "moved" card
      (shipped as `fc7e878`, reversed the same day). One rule for every link
      to a song: if students can open a whole-song card for it (and for that
      layer), the link opens the card; otherwise the Song Journey page.
      `openSongLink(slug, layer)` in app.js decides at the click; the "Take it
      to a song" box is one button per song again, the set-header names are
      links again, the Songs row has its Song Journey link on every Core row,
      and the resume card sees all six songs. `caJourneyUrl()` returns '' on
      a whole-song card and on any activity whose song has an openable card.
      `tabs/journey.js` / `journey-theme.css` match `dbf1dc2` again. checks.mjs
      1bn rewritten: every whole-song card names its song + layer, no two
      share a pair, none names the page, and the retire switch cannot come
      back. Nothing deleted; no `tabs/*.html` or module file touched.

- [x] **2026-10-06 — Song Journey phase-out, part 1: a per-song retire switch.**
      `JOURNEY_RETIRED` in `class-activities.js` (starting with `the-cure`
      and `seven-nation-army`) closes every door into a song's Journey page:
      the card's Journey button and the console preview (`caJourneyUrl`), the
      Songs-page Song Journey link, the set header's song-thread link, the
      resume card's song row, and the page itself (students see a "moved"
      card; the teacher still gets the page). "Take it to a song" in Modules
      1–5 is one button to the Songs page for every song. ca-25's Level up
      lost its last Journey mention. checks.mjs 1bn pins it. Nothing deleted;
      `journey:` stays on every card (it places a whole-song card on its
      Songs row). ~~Open: Journey phase-out part 2~~ — cancelled, superseded
      by the play-along-first order below (the same day).

- [x] **2026-10-06 — "the cure" Journey page: the record plays each chorus
      three times.** The page (and ca-18) teach the chorus as eight bars,
      twice through the loop; the record plays Dm · F · C · G three times
      (12 bars). Per Jonathan, the eight-bar teaching stays and the page now
      carries one more play-along note, under the Metronome note, saying so
      (EN + `data-es`). No "twice — eight bars" line was changed.

- [x] **2026-10-06 — "the cure" whole-song captions: "3 times" → "3 laps,"
      plus ratchet 1bm.** Eight sections on ca-24 and ca-30 (Chorus 1–3 and
      the Outro on each) counted in "times"/"veces" in the caption while
      their badge reads "Lap 1 of 3" (`repLabel: 'Lap'`). Reworded all
      sixteen strings to "laps"/"vueltas". Second occurrence of the class
      (four sections 2026-10-05), so checks.mjs 1bm now fails the push on a
      caption whose counting word differs from its badge's, against a
      `repLabel` whitelist (Lap/Vuelta, Time/Vez, Verse/Estrofa), in both
      languages; 67 sections checked today. Proved by breaking it three ways.
      Chorus length untouched (12 bars: 4 × 3 laps).

- [x] **2026-10-05 — Seven Nation Army chorus captions: "second lap" →
      "second time."** Both whole-song power-chord practice cards (ca-25
      and ca-31) had a Chorus 1 and Chorus 2 section whose caption mixed
      two counting words — "2 times · the second lap ends …" — while the
      section's own badge reads "Time 1 of 2" (`repLabel: 'Time'`). Reworded
      all four captions, EN and ES, to use "time"/"vez" throughout. "Lap"
      stays the site's word everywhere else; this was not a rename.

- [x] **2026-10-02 — "Open through Module N" (per-student module skip).**
      Work order "Open through Module N". New `config/class.moduleOpenThrough`
      (`uid → 2..12`), set from a new "Open through" select in the console's
      Manage table (`teacherSetStudentOpenThrough`, a copy of the period
      writer; Auto deletes the key). Student side: `moduleOpenThrough` in
      app.js, read in `loadClassConfig()`, cached per uid as `caOpenThrough`
      and restored by `restoreClassConfigFromCache()`.
      `isModuleGateLocked` opens modules `<= N`; `isSetLocked` opens every
      set of modules `< N` (module N keeps its set order). A change under an
      open app repaints the pills, dropdown and strip (`repaintModuleGate`,
      from a `finally` so the cache paths are covered too); `renderPills`
      strips a now-open set's `.set-peek`. Console: "Open → M4" pill in the
      Students list, a line on the detail page, and `teacherReviewIsBlocking`
      stays quiet when the next module is opened. No progress writes, no
      student-facing text, no rules change (no key allowlist on
      `config/class`; header comment only). checks.mjs 1ai writer count
      17 → 18. Deferred: a whole-class setting, a bulk control, a student
      notice; the skipped modules' Module Review stays preview-only (it is
      locked on the module's skills, not on the gate).

- [x] **2026-09-25 — One activity on the In class page at a time (Cowork
      patch 0002, on top of Focus view).** Jonathan: with a card open, the
      Unfinished / Completed groups and other cards sat right under it and
      students opened them by mistake. Picked "hide them, every activity"
      over dim-and-lock. `caSyncSolo()` (called from `caSyncTopbar`, so it
      runs on every card toggle and render) puts `.ca-solo` on
      #class-activities-screen, `.ca-solo-card` on the open card and
      `.ca-solo-path` on its ancestors up to #class-activities-body; one CSS
      rule hides every other child (group summaries, module heads, gate
      intro, other cards) plus #resume-card. No re-render, no audio touched.
      New "◀ All activities" button in the sticky bar (`caCloseOpen`, i18n
      `ca.allActivities`) closes the card, stops card audio and scrolls to
      the top; closing the card by its title works too. Browser-verified:
      opening from inside Unfinished, the Today hero, a deep link, Got it in
      Focus view, and back to the list.

- [x] **2026-09-25 — Focus view for class activities (Cowork patch).**
      Jonathan picked "Focus view" from three design options (one step at a
      time) and turned it on for ca-10, ca-18, ca-20 and ca-21 via a new
      activity-level `view: 'focus'` flag (VIEW note atop
      class-activities.js). `caIsFocus()` in app.js switches both card
      builders (plain + Today hero) to: numbered step buttons above the
      ladder (`caFocusDotsHtml` — done = green ✓, current = filled, later
      steps disabled until the step before is ticked), only the current
      step shown (`.ca-card--focus .ca-step-collapsed{display:none}`), a
      non-toggling "Step n of m" head, and `caFocusNavHtml` — "◀ Step n-1"
      + "Got it — next step ▶" in place of Mark done. Moves go through
      `caFocusGo` → `caFocusActivity` (re-render, keep open, scroll to the
      card top) after `stopCardAudio()`. Ticks are the same day-scoped
      `caStepDone`; rep dots drive `caFocusGotIt` via `repDotFinish`. Print
      is unchanged (dots/nav print:none; printActivity uncollapses steps).
      Teacher preview keeps every step plus a one-line Focus-view note.
      checks.mjs 1d rejects any `view` value other than 'focus'. Seven new
      `ca.focus*` i18n keys. Browser-verified at 1366×657 (dev bypass): EN
      and ES, back/next, lock state, rep-dot auto-advance on all four,
      accordion activities unchanged, print emulation shows all steps.

- [x] **2026-09-20 — Left rail navigation cleanup (work order, pasted in
      chat — no saved file).** Pushed `4f497cd`. Renamed "Practice"→"Modules"
      and, rail-only, "In-Class Activities"→"In class" (new
      `nav.classActivitiesNav` key; the fuller phrase stays everywhere else
      it was already used). Added a divider + `.rail-panel` wrapper marking
      the five nav rows off from the active item's own section panel below.
      Moved Module review off its dashed `.wpill` under the set buttons onto
      a plain `.rail-station.st-review` row at the end of "This set",
      carrying the 🏆 module-complete trophy down with it (same id, same
      `renderProgressStrip()` earned/celebrate handling — see CLAUDE.md's
      new section for the full mechanics). Dropped the header's
      "Independent Practice and Skills Tracker" subtitle everywhere
      (Jonathan, mid-session: "this text isn't necessary… save space") and
      resynced `--hdr` (70px→60px default; the short-screen 48px override
      needed no change, since the subtitle was already hidden there).
      **The work order's literal ask was single-column, full-width nav
      rows** — shipped that first, then measured it against the exact
      1366×657 Chromebook viewport the *previous day's* short-screen rail
      work order was built around: 106-132px of rail overflow, for
      essentially every module, not just the worst case (m5w2), because
      losing the old two-column nav grid cost back the two 44px-floor rows
      of height that work had bought. Reported the real numbers and named
      the prior decision the change would reverse; Jonathan's call was to
      keep the two-column grid, permanently and at every screen size (not
      conditional on short height), with the short labels so nothing wraps,
      uniform row sizing, an active state that changes background/color
      only, and `#my-progress-btn` spanning both columns so five items
      never strand one alone in column 1. Confirmed by direct child-rect
      measurement (not `scrollHeight`/`clientHeight`, which read identical
      whether content fits with room to spare or exactly at the wire) —
      ~19px of rail slack at 1366×657 with Modules active on m5w2 for the
      teacher/dev-bypass view (Preview-mode banner showing), ~66px for a
      real student. `node tools/checks.mjs` (full, 180-link check
      included) clean.

- [x] **2026-08-04 — Cross-module gate: Set 1 locked until prior module +
      review done (work order, pasted in chat — no saved file).** Pushed
      `937ff9a`. Executed end to end, single session/commit. New
      `isModuleGateLocked(moduleNum)` chains modules
      1→12 — a module's Set 1 stays locked until every built set AND every
      Module Review self-rating row of the PREVIOUS module is done; Module
      13 (String Changing) sits outside the chain, always open; existing
      progress anywhere in a module keeps it open for good (same
      never-re-lock principle as `hasProgressIn`). `isSetLocked`'s
      first-set case now defers to it instead of always returning
      unlocked. Locked Set 1 gets the existing read-only peek treatment for
      free, plus module-flavored gate strings at the four sites that
      already had set-flavored ones (`isModuleGateCase(w)` picks between
      them). `onModuleChange` opens a fully-locked module's target in peek
      instead of bouncing off `activateSet`'s backstop. Dropdown gets a 🔒
      tail. **One correctness fix beyond the work order's literal spec:**
      module data is lazy-loaded per module, so a fresh page load may not
      have the PREVIOUS module's data yet when the dropdown first paints —
      `isModuleGateLocked` would then read "nothing built" and hold the
      gate, flashing 🔒 on modules that are actually done. Fixed by queuing
      a one-time background `ensureAllModuleData()` in `renderAll()` and
      redrawing the dropdown when it lands — every `module-N.js` is already
      service-worker precached, so this costs no extra network round trip.
      Confirmed the bug and the fix in-browser by forcing a module's data
      out of `SETS`/`MODULE_REVIEWS` mid-session and reloading state:
      without the fix the dropdown shows a stale 🔒 on the first paint (and
      never corrects itself since nothing else re-triggers a load); with it,
      it self-corrects within ~1s with no reload. `setSkillLevel` now also
      calls `renderPills`/`populateModuleDropdown` after a rating, mirroring
      `toggleSkill`, so finishing the last `mrN` row unlocks the next module
      live. Browser-verified (dev bypass + `isGatePreviewer` forced off to
      simulate a real student): M1 Set 1 open; dropdown shows 🔒 on 2–12,
      none on 1 or 13; Module 3 lands on Set 1 in EN+ES peek with the
      module-flavored banner and inert checklist; Module 13 open+writable
      with zero progress; a peeked checkbox write is silently blocked
      (progress byte-identical before/after); completing Module 1 + rating
      every `mr1` row live-unlocks Module 2's dropdown entry without
      navigating away. `node tools/checks.mjs` (full, 180-link check
      included) clean. New i18n keys (`gate.peekPillTitleModule`,
      `gate.peekBannerModule`, `gate.finishFirstShortModule`,
      `gate.unlocksAfterModule`) are EN-final, ES-draft — pending Jonathan's
      independent Spanish sweep.

- [x] **2026-08-04 — Paper retirement, part 2 (work order).** Pushed
      `8f7287b`. Executed `3-workorder-2026-08-04-paper-retirement.md`,
      Phases 1+2, with a STOP for Jonathan's approval in between. Module 9's
      last two genuine paper drills went digital: Challenge 2 ("Seven
      Nation Army" from memory) and Challenge 4 (day-later cold-read) now
      use a persisted free-text box, same mechanism as module-4.js's "type
      your 4 bars" step. The "Try spacing TAB rhythm" step kept its keyed
      MC quiz per Jonathan's direction — no second response slot exists on
      a step, so the Phase-1 worked example (swap MC for free-text) got
      sent back; the shipped version just drops the paper/hand-written
      wording from label/text/hint. Two module-5.js chord-deck hints lost
      their "paper flashcards"/"shuffle by hand" clauses. New optional
      `naturals-plus` level-up deck (naturals + F#/Bb) added to `app.js`
      `DECKS`, wired as an untracked bonus step in module-9.js — Option A
      of the work order's two choices. Sweep of every `module-*.js` +
      `tabs/*.html`, both languages, for paper/slip/flashcard/index
      card/cut out/papel/tarjeta/baraja/recorta found zero remaining
      genuine paper references after the fix (all other hits are guitar
      mechanics, the guitar's musical "role" in Spanish, or already-digital
      deck content). `node tools/checks.mjs` (full, 180-link check
      included) clean.
      **Landed on top of a concurrent session's push** (`8a5e369`, a
      styles.css banner-color change) — rebased cleanly, only conflict was
      the `sw.js` `CACHE_VERSION` line, resolved by re-running `checks.mjs`
      against the merged file state rather than picking either side.

- [x] **2026-08-04 — Small-patches bundle (work order, 8 decided items).**
      Pushed `e89fd6d`. Executed `workorder-2026-08-04-small-patches.md`
      end to end in a worktree: two calibration numbers (module-5's Am↔Em
      target 20→16; `m3w2-s1`'s beat-1 tempo 60→70 BPM, dropping the now-moot
      "70+ is optional" clause and bumping the practice placeholder 70→75);
      renamed the "PR ladder" code-comment vocabulary to "tempo ladder" in
      4 spots (i18n.js, 2× app.js, module-2.js header) — comments only, the
      `pr` practice type and `pr.*` i18n keys are untouched; retitled Sweet
      Child O' Mine's power-chord challenge from "Verse" to "Intro/Verse/
      Chorus" (label, body text, and the song-list meta chip in module-3.js)
      per Jonathan's ruling that the D5–C5–G5 loop isn't verse-exclusive;
      reworded `i18n.js` `review.playPrompt`'s first sentence; cut the last
      3 EN/ES "grab a friend" partner-line survivors (module-6.js and
      module-7.js Ear Sparks, a module-4.js Level-up) that the 07-27 pass
      missed; appended the narrow-pin ratification line to the `MC_PINNED`
      comment in app.js (no behavior change); gave the skills-checklist's
      "You've got it when" `<strong>` the `.got-it-lab` class so it matches
      the step-card version.
      **Heading-specificity audit ran as a sweep + adversarial-audit pair**
      (per the sub-agent-sweep rule) — 203 `Challenge` labels across all 12
      module files, each checked against its own step body for an unnamed
      song: found exactly **one** real gap (`module-3.js` "F5 ↔ A5 Two-Shape
      Drill" → `("Luna")`, since the step is Luna's vamp but didn't say so),
      the rest genuinely generic drills or already-named. The audit agent
      independently re-derived the same 203-item list, spot-checked 56+
      step bodies including all 6 boundary cases the sweep agent flagged as
      deliberately-left-alone, and confirmed the 1-fix result holds — no
      false positives, no false negatives.
      **Item 17 (teacher.js uid-in-onclick) verified already fixed:** every
      `data-uid`-bearing control routes through the delegated listener on
      `#teacher-app`; the remaining inline `onclick="..."` calls only ever
      pass static literals (view names, `true`/`false`), never a Firestore
      uid. No code change needed, closed by verification alone.

- [x] **2026-08-04 — Set peek: read-only preview of a locked set.** Pushed
      `a648364`. Extended
      the existing Module Review preview idiom (`mr-locked` class + disabled
      controls + a banner, all synced by `renderPills`) to ordinary sets.
      Tapping a sequentially-gated locked pill now opens the set read-only
      (`activateSet(id, {peek:true})` sets a `set-peek` class on its panel)
      instead of just toasting. Two-phase work order: Phase 1 was a design
      memo + worked example (Module 2 Set 2) that stopped for approval before
      touching every set; Phase 2 was the full rollout.
      **Write-surface audit went wider than the brief:** the brief named
      checklist toggles, step-done buttons and drill check-off buttons, but
      grepping every `queueSave`-reachable path from inside a set panel also
      turned up Shuffle Drill's and Deck Drill's best-score saves
      (`sdSaveBest`/`sdRecordSkillBest` in `sdFinish`, `dkSaveBest` in
      `dkNext`) — both fire on drill completion independent of any
      check-off, so a peek that only guarded `toggleSkill`/`toggleStepDone`
      would still have let a peeking student silently write a `games` best.
      Guarded those too; drills stay playable during a peek, only the save
      is suppressed. All progress-writing paths funnel through guarded
      choke points (`toggleSkill`'s own top, plus the two drill-save sites)
      rather than needing a check at every call site — the coach/drill gate
      "mark it anyway" paths and the three `.sdr-checkoff` buttons all
      route through `toggleSkill`, so guarding it once covers all of them.
      **Caught before rollout, not after:** Phase 1's worked example only
      exercised the sequential gate, and the peek wiring didn't yet
      distinguish that from a *static* `locked`/`comingSoon` set (no build
      content, nothing to preview) — the assumption that only sequentially-
      gated sets get a peek was in the brief but not yet in the code.
      Caught by re-reading the brief before Phase 2's rollout, not by a
      user report; no live set currently sets `comingSoon: true` so this
      was never visibly broken, but the schema field is real and future
      content would have hit it. Fixed by threading a `staticClosed` check
      through both `renderPills`' pill wiring and `activateSet`'s own
      backstop, so even a direct/stale call can't force a peek onto a set
      with nothing built. Peek state is DOM-derived, not a tracked
      variable (`.week-panel.active.set-peek`), matching the project's
      existing preference (see `syncExploreNav`'s reasoning) — this also
      keeps the pill rail's "you are here" highlight correct across
      unrelated re-renders (language switch, a skill toggled in another
      tab) without a second source of truth to keep in sync.

- [x] **2026-07-27 — site-wide review: outage fix + 13 commits.** Started as
      "check the site for errors" and immediately found the **whole site was
      down**: `buildSet()`'s song-thread block named its `map` callback
      parameter `t`, shadowing the global i18n `t()`, so every set with a
      `songThread` threw and **no module content rendered at all** (`3ab369d`).
      Introduced hours earlier the same day by an i18n conversion
      (`29c5187`) that added a `t()` call inside that callback. The failure
      was sticky: `_modulesRendered.add(num)` ran before the throw, so
      switching modules never rebuilt for the rest of the session — refreshing
      genuinely could not help. **Every existing check passed**, because the
      file was syntactically valid and the module DATA was fine. Hence
      `dcdb372`: `checks.mjs` now has a **render smoke test** that loads
      i18n + diagrams + module data + app.js in a vm against a minimal DOM
      stub and calls `buildSet()` on all 36 sets. Verified by reintroducing
      the bug (21 sets fail, exit 1). A harness that can't load degrades to a
      WARNING, never a blocked push — a stale stub must not become a reason to
      delete the safety net.

      Also shipped: sign-out now flushes the pending debounced save and hard
      reloads (a got-it ticked seconds before signing out was dropped, and
      `_modulesRendered` + the built DOM + `sessionStorage` bests survived
      into the next student on a shared Chromebook) and two service-worker
      correctness fixes — `waitUntil` the `cache.put`, not the fetch, and
      install with `{cache:'reload'}` so a new `CACHE_VERSION` can't be filled
      from stale HTTP copies (`b70621e`); teacher **pause + archive**
      (`90c486e`, both uid→bool maps in `config/class` so they need no rules
      change and can't destroy work); the sequential gate became a
      **high-water mark** (`6b2c19b` — un-ticking one skill re-locked the
      next set even when it was finished); Module 13's winding rewritten for
      the **classical slotted headstock** it was always taught on
      (`7631362` — the graded criterion demanded "wraps walking down the
      post", which a horizontal roller cannot do; the sketch was already
      correct, only the words were wrong) plus steel-vs-nylon and safety
      additions (`7f22360`); Module 10's "Smoke on the Water" moved from the
      A blues scale to **G**, the riff's actual key (`7f22360`); the
      Firestore rules **versioned** as `firestore.rules` + a teacher-email
      drift check (`44a4adf`, published to the console by Jonathan the same
      day — GitHub Pages does NOT deploy rules); then a seven-agent fix sweep
      with a ten-agent adversarial verification workflow — eight runtime
      defects (`127bb19`), keyboard/screen-reader (`475e3b0`), curriculum
      across M1–M12 (`569fd3d`), and Module 12's forward no longer promising
      a capstone that doesn't exist (`ae6f27f`).

      **Why the verification pass earned its cost:** it confirmed four
      defects *in the fixes themselves* and refuted three others. The worst
      was self-inflicted — the new "flush pending ratings once auth arrives"
      logic in `tabs/journey.js` didn't record WHOSE ratings they were, and
      Firebase auth persistence is shared across tabs, so a journey page left
      open while signed out would flush the previous student's ratings into
      the next student's doc unprompted. That is the exact cross-student
      class `b70621e` had just removed, reintroduced by a fix for something
      else. Three agents also **corrected the briefs they were given** (a
      "C major" MIDI list that was actually B Locrian; rhythm data summing to
      7 beats not 8; an A-shape sub-barre defect claimed in two files that a
      grep proved existed in one). Lesson worth keeping: brief agents to find
      problems rather than confirm work, and verify structured claims against
      the data before relaying them.

- [x] **Module 5 assessment settles on one song; song titles quoted
      site-wide** — pushed `598a580` (2026-07-26, applied via cloud patch
      pair) then `8262116` (2026-07-26, local). The cloud patch closed out
      the last inconsistencies from the two-song assessment work (`mr5-s8`,
      the Full Run practice counter, Set 4's skill list, and Let It Be's Set
      2 card all still said one song) and clarified Module 3's Mystery Chart
      ("the lowest fretted dot" → "lowest-sounding … nearest the thick
      strings," since the app draws frets top-to-bottom so the higher fret
      sits lower on screen; the alphabet-walk stuck-hint now covers the A
      string too, not just low E; the unnumbered challenge got folded into
      its set's numbering). Locally, Jonathan then reversed the two-song
      requirement itself: Module 5's assessment now asks for ONE core song
      from memory (Let It Be, Luna, or "the cure") — the "song of your
      choice" requirement is gone, though its Set 4 practice material
      (chord-mapping, the Full Run's chart-first rep) stays as optional
      ungraded practice, not something the assessment checks. Separately,
      every song title across all 13 modules, `coach.js`, `i18n.js`, and the
      six Song Journey pages is now wrapped in quotation marks for
      consistency — including shorthand nicknames ("Watchtower," "Sweet
      Child") and "SNA" spelled out as "Seven Nation Army" — done via 7
      parallel file-scoped agents plus a manual pass to reconcile the
      nickname-quoting convention across them. Live-site spot-checked in the
      browser: Module 5's self-assessment and assessment-checklist wording,
      the "All Along the Watchtower" Song Journey page's title/heading, and
      Module 4's shorthand-nickname challenges all confirmed correct.
- [x] **Report-an-issue in-site form + always-top-scroll fix** — pushed
      `a86ec71` (2026-07-24). Footer's "Report a problem" now opens an
      in-site form (`openIssueModal`/`submitIssueReport`, `app.js`) instead
      of a mailto link — writes to a new Firestore `issueReports` collection
      with the student's email/name, current module+set, browser info, and
      message auto-attached; falls back to the old mailto if Firebase/
      Firestore isn't reachable or the student is the dev-bypass user (same
      convention as progress saves). New security rule documented in
      `index.html`'s setup comment (also backfilled the previously-
      undocumented `config` collection rule there); Jonathan confirmed +
      published the matching rule in the Firebase console the same day.
      Browser-verified (dev bypass + manual console calls): modal renders,
      empty-message validation, and the graceful failure path (dev-bypass
      writes are rejected by Firestore rules) all work as expected — the
      live end-to-end save (real signed-in student) hasn't been checked yet.
      Separately: opening or returning to a Set now **always scrolls to the
      very top**, replacing the scroll-memory feature from 2026-07-12 (which
      Jonathan decided he didn't want after all) — `activateSet` no longer
      restores `window.scrollY`, and `history.scrollRestoration='manual'`
      (matching `tabs/journey.js`) stops the browser's own back/forward
      scroll memory from undoing it.
- [x] **Real-guitar mic tests all passed clean (2026-07-24)** — closes out
      the last two open items:
      - **Riff Runner Wait Mode** (untimed, mic-graded note-by-note
        play-along, metronome/count-in removed) — tested live on Seven
        Nation Army; no-clock flow feels natural end to end.
      - **Mic features retest**: melody mode's new `coachNowHtml`
        current/next preview (Module 2 · Set 1 · Station B, low E notes)
        fixed the beat-late timing bug and lands notes on time now; one
        Note Hunt round and one full Change Up round also passed clean.
      Nothing further to fix — this was the last item tracked under Open
      work, so that section is now empty.
- [x] **Module 13 · String Changing — new single-flow module + graded
      assessment** — built in the cloud session, applied+pushed locally via
      patch (`539a939`, 2026-07-23). New `module-13.js`: 7-section process
      (tools/safety → 4 verified videos → remove → seat at bridge → wind →
      tune/stretch → assessment briefing), covering BOTH nylon **ball-end**
      (no tie knot — the string type being purchased) and steel-string; 3
      hand-drawn inline-SVG diagrams with EN/ES label variants; 4 checklist
      skills = the in-class assessment rubric (safe removal · bridge
      seating · post winding · tune-stretch-hold), each with `gotItWhen` +
      an mc practice drill; hand-written Spanish throughout. Videos
      oEmbed-verified: Lauren Bateman (steel), Takamine (nylon), LEARNING-
      CHORDS (ball-end nylon), guitarraviva (Spanish, luthier). App support:
      buildSet single-flow path, panelFooter reroute, rail sync (see
      "Working conventions" above); `MODULE_MANIFEST` num 13 (skillCount 4);
      `module-13.js` added to `sw.js` ASSETS. This is the last
      FUTURE-CHANGES item — closed in the same patch.
- [x] **Keep practicing + My progress → full-screen pages** — pushed
      `dc2d6ef` (2026-07-23; built in the cloud session, applied+pushed
      locally via patch). Games-screen pattern in the site's normal look:
      `#keep-practicing` / `#my-progress` URL hashes, browser Back exits,
      "Back to practice" button, proper dialog focus handling. Picking a
      skill from Keep practicing still jumps to its lesson (closing the page
      via the hash); bookmarked hashes reopen the right page after sign-in;
      language switches re-render open pages in place with no history churn.
- [x] **Songs hub: two-tier layout — Core card + Choice menu grouped by
      difficulty** — pushed `5043121` (2026-07-23; built in the cloud
      session, applied+pushed locally via patch, excluding a stale
      `translations-review.md` hunk since that file had just been retired).
      Core six pinned in their own card on top; Choice menu splits into
      collapsible difficulty groups keyed to first-appearance module (First
      riffs & single notes M1–4, 21 songs · Chord & strumming songs M5–8,
      21 songs · Advanced M9–12, auto-hidden while empty); first group open
      by default; headers show counts; module Focus songs keep their tag
      inside the groups; student-request row renders last, reworded to "any
      song that means something to **you**." 7 new `hub.*` strings EN+ES.
- [x] **Practice-step polish trio: disclosure pills, scroll-under-header,
      safe-handling fold removal** — pushed `5cbb316` + `ee1a5f0` +
      `b95f1f5` (2026-07-23; built in the cloud session, applied+pushed
      locally via patch pairs). Hint/Stuck?/Level up pills now sit in a
      fixed row with the open panel full-width below (tab-style, one at a
      time — the old `<details class="step-fold">` markup is gone);
      programmatic scrolls land below the sticky header
      (`scroll-margin-top` + a `toggleStepOpen` rAF nudge); Module 1's Safe
      handling step dropped its redundant folds down to just the
      instruction.

- [x] **Live-site device checks, no mic needed — closed without on-device
      confirmation** (bundled from REVIEW-PLAN K-2/K-5/D-7 and the
      compact-checklist work, 2026-07-20; closed 2026-07-23) — covered the
      tuner's post-YIN-optimization string lock, tuner string-selector touch
      targets, compact checklist + Song Journey pages at phone width
      (~360–400px) and in print preview (⌘P). All the underlying code
      shipped; **Jonathan decided phone-specific polish isn't a priority for
      him**, so this is marked done as a deliberate scope call, not because
      it was verified working on a real device. If phone usability becomes a
      concern later, these are the specific checks to revisit.

- [x] **Custom backing tracks for all six journey-page play-alongs — Jonathan
      made them himself** (Jonathan, 2026-07-20 → all six DONE 2026-07-22;
      this entry was stale until corrected 2026-07-23, see below) — every
      Song Journey page has a "🎵 Play along" button; all six now play
      Jonathan's own local mixes (`audio/`) instead of generic YouTube jam
      loops, each a clean rhythm-down mix + a metronome variant (`<audio>`
      element, "🎵 Metronome" toggle preserving playback position), every
      track exported at A=440. **"the cure"** (Am, 144 BPM) and **Luna** (Am,
      128 BPM) done first (2026-07-22), followed same day by **Watchtower**
      (Neil Young cover, Am, 115 BPM — display name stays "Dylan/Hendrix" per
      the artist-stays-out-of-display-metadata rule), **Sweet Child O' Mine**
      (G, 125 BPM — standard tuning on this site, so it sounds a half-step
      above the famous down-tuned recording, expected/documented), **Let It
      Be** (C, 71 BPM), and **Seven Nation Army** (Em, 123 BPM). Bonus 🐢
      **Slow tier** added same day for four of the six ("the cure" 120 BPM,
      Watchtower 90 BPM, Sweet Child 100 BPM, Seven Nation Army 100 BPM) — an
      independent tempo toggle alongside the Metronome toggle
      (`data-audio-slow`/`data-bpm-slow` in `tabs/*.html`, generic handling in
      `tabs/journey.js`, which rescales `currentTime` by the tempo ratio on
      toggle so playback position holds through a tempo change). Naming
      convention: `<artist-slug>-<song-slug>-backing-<key>-<bpm>bpm-<tuning>
      hz-<mix>.mp3` (see CLAUDE.md's "Backing-track naming & tuning"
      section). **Correction 2026-07-23:** this item had sat marked "Open"
      listing Seven Nation Army/Sweet Child/Let It Be as still pending
      Jonathan's files, months after all three actually shipped
      (`c2b9e94`/`2958547`/`73c7afd`, 2026-07-22) — caught when Jonathan
      pointed out the files were already in `audio/`. Lesson: an Open-work
      item needs its ground truth (git log / working tree) spot-checked
      before assuming a stale-looking status is still accurate.

- [x] **Module 12: confirmed the requinto video fits, deleted the leftover
      note** (REVIEW-PLAN C-7, 2026-07-20; resolved 2026-07-23) —
      `module-12.js`'s La Derrota (Vicente Fernández) requinto lesson had an
      HTML comment flagging it for a fit check against the sierreño/corridos-
      tumbados requinto skill it teaches. Re-verified the video
      (`cRJb_f4-M5g`) is still live via oEmbed, and confirmed via WebSearch
      that it's specifically a "part 1: requinto line" lesson (the same
      instructor, Jorge Aguilera, splits his tutorials into a requinto part 1
      / chords part 2 for other Vicente Fernández songs too, e.g. "Para
      Siempre") — a good, purpose-built fit for the lesson's stated goal
      (watch the picking hand carry the melody). Deleted the review-flag
      comment; no video swap needed.

- [x] **i18n phase 2 — hand-written Spanish for module/lesson content, tabs/
      pages, and games** (started 2026-07-22) — phase 1 (already done, see
      CLAUDE.md's "i18n — hand-written Spanish for the app shell") only
      covered the shell (header, nav, tools, checklist). This phase extends
      real Spanish to the twelve module files, the Song Journey pages, and
      `coach.js`'s games, then removes Google Translate entirely once
      everything's covered.
      **Session 1 (2026-07-22): architecture + Module 1, done & browser-verified.**
      Schema: parallel `<field>_es` suffix fields on every translatable field
      (`text_es`, `hint_es`, `meta_es`, …) — renderer falls back to English
      when absent, so modules translate incrementally with no code changes
      needed per module. `app.js` gained a `tf(obj, field)` helper used at
      ~25 render call sites (steps, hints, skills, songs, assessment, module
      review, the 10-minute routine card, TAB captions, playSeq labels) plus
      ~40 new shell strings in `i18n.js` for the chrome *around* that content
      (fold labels, response labels, module-review copy) that had never been
      wired to `t()` before. Module-content panels are built once and cached
      (`ensureModuleRendered`), so a new `rebuildModuleContentPanels()` runs
      on `gc-langchange` to re-render already-open panels in the new
      language (preserving the active station/songs/checklist tab).
      `tools/checks.mjs` gained an i18n-completeness pass (`1b.`): any module
      flagged `i18nComplete` in `MODULE_MANIFEST` must have a real `_es` twin
      on every required field, enforced on every push. Once a module is
      flagged complete, its Set + Module Review panels get `translate="no"`
      so Google Translate can't touch (or re-translate) the hand-written
      Spanish — modules still in progress keep Google Translate as their
      fallback, same as before this phase. **Module 1 (both sets + its
      Module Review) is fully translated and flagged `i18nComplete`** —
      glossary extended with guitar-anatomy terms (clavijero, cejuela,
      selleta, puente, mano de trastear/de pulsar) and Song-Journey terms
      (Recorrido de la canción, capa). Browser-verified end to end via a
      local static server + dev bypass: every step/hint/response/choice,
      the riff TAB block, the songs list, the skills checklist, and the full
      Module Review (routine card, reflection, assessment, "why this
      matters") all render in Spanish with no English leaking through.
      Known gaps intentionally deferred (documented in
      `translations-review.md`'s "Known gaps" section): locked-set gate
      toasts, the Games/Songs Hub/Keep-practicing/My-progress panel
      *contents*, the Daily 5 modal, and the recording widget's two labels —
      none of these are module-N.js content, so they're unaffected by the
      `i18nComplete` gate and stay Google-Translate-covered.
      **Session 2 (2026-07-22): Modules 2 & 3, done & browser-verified —
      built with a multi-agent workflow (ultracode).** Two independent
      translator agents hand-translated `module-2.js` and `module-3.js` in
      parallel (each read Module 1 first as the reference pattern), each
      immediately followed by its own independent adversarial Spanish-quality
      reviewer (6 issues found+fixed in Module 2, 1 in Module 3 — English
      leakage, register, glossary drift). Both modules fully verified via
      `node --check`, a scripted structural completeness sweep, and
      `tools/checks.mjs`, then flagged `i18nComplete`. Glossary extended
      (post-hoc reconciled against ACTUAL usage in the files, not the
      agents' self-reported terms, which were sometimes wrong — e.g. Module
      3's agent claimed it used "fundamental" for "root" throughout but the
      file actually uses "raíz" consistently; the memory now records what's
      really in the files): sight-read → leer a primera vista, root → raíz,
      home note → nota base, vamp/chug/boom-chick kept as loanwords, beat →
      tiempo, bar/measure → compás. One schema gap found and fixed: neither
      translator's brief mentioned `MODULE_SONGS[N]` (a module-level song
      list separate from a Set's own `songs:` array, used by modules 2–12) —
      added `meta_es` for both modules' entries by hand and added a
      `tools/checks.mjs` requirement so future modules can't skip it.
      `translations-review.md` backfilled with full EN→ES tables for
      Modules 1–3 (Module 1's had been skipped in session 1).

      **Mid-session incident:** a second, concurrent Claude Code session was
      running directly in this same working tree (not its own worktree) and
      a `git checkout`/`restore` it ran silently discarded ALL of this
      session's then-uncommitted work in `config-main.js`, `module-2.js`,
      `tools/checks.mjs`, and `i18n.js` — Module 2's translation, fully
      verified, was gone with no recovery path. Module 3's translation
      (still intact) was immediately committed alone to protect it before
      continuing. The concurrent session then moved to its own worktree;
      Module 2 turned out to still be recoverable once the working tree
      settled, so nothing had to be redone — but treat this as a live
      example of why the worktree rule above exists, not just a hypothetical.
      **Session 3 (2026-07-22): Modules 4, 5 & 6, done & browser-verified —
      3-module multi-agent workflow (ultracode), translate→verify→backfill
      pipelined per module.** Same pattern as session 2, scaled to three
      modules and with both session-2 lessons baked into the brief up front
      this time: translators were told explicitly about `MODULE_SONGS[N]`
      (missed for modules 2/3 originally) and told to grep their own file
      before self-reporting glossary terms (a session-2 agent had
      misreported "fundamental" when the file actually used "raíz"). Result:
      all three modules included their `MODULE_SONGS[N]` translation
      unprompted-a-second-time, and verify agents cross-checked reported
      terms against actual file content directly (one still had a minor
      count mismatch — reported "cejilla" 18 times, actually 17 — but the
      *term itself* was consistent, just a counting slip, not a translation
      bug). New glossary terms, this time reconciled against real usage
      before being recorded: root → raíz (module 4 confirmed this again),
      barre → cejilla, resolve/resolution → resolver/resolución, backbeat/
      offbeat → contratiempo, chop (reggae upstroke) → picoteo/picar,
      groove kept as a loanword (matching riff/vamp/chug). Module 6's own
      translator agent set its `config-main.js` flag itself (mirroring
      module 2's agent in session 2); Modules 4 and 5's flags were set by
      the coordinator after their independent verify passes.
      **Also found and fixed a real production bug while browser-testing
      Module 4** (already live for Modules 2–3 too, since it's shared
      `app.js` code, not per-module data): the "⚡ Tune and warm up first…"
      reminder shown on Station C for every module except Module 1 was
      hardcoded English, missed in session 1 because Module 1 never
      triggers that code path. Fixed by wiring it through `t()` like
      everything else — the fix applies retroactively to every module, no
      module-file changes needed.
      `translations-review.md`'s shell-glossary table had also drifted out
      of sync with `i18n.js` (sessions 2's new terms were added to the code
      comment but never mirrored to the doc table) — caught and backfilled
      both sessions' worth of terms in the same pass.
      **Session 4 (2026-07-22): Modules 7 & 8, done & browser-verified —
      same 2-module translate→verify→backfill pipeline as session 3.**
      Module 7 (TAB Notation and Barre Chords) uses "barre" 120+ times —
      100% landed as "cejilla" per a scripted grep-only-the-_es-fields
      check the translator ran itself. New terms: double-stop → doble
      nota/dobles notas, sub-barre (ring-finger mini-barre inside a full
      barre shape) → sub-cejilla. Module 8 (Finger Picking) introduced a
      full new vocabulary cluster: fingerpicking/fingerstyle kept as
      loanwords (matching riff/vamp/chug/groove), Travis picking kept as a
      named technique, pinch → pellizco/pellizcar, alternating bass → bajo
      alternante, rest stroke/free stroke → apoyando (toque de apoyo) /
      tirando (toque libre) — the real classical-guitar Spanish terms for
      those techniques, not a coinage. Both verify passes were solid (3
      issues found+fixed in Module 7, 0 in Module 8) but the coordinator's
      own independent sweep still caught one real miss the module-8 verify
      pass didn't: `forward_es` had "power chords" left untranslated
      instead of the established "acordes de potencia" — module 7's verify
      agent happened to notice it in passing (reading module-8.js for
      context) and flagged it for the coordinator, since fixing another
      module's file was outside its own scope. Lesson: even a same-module
      verify pass can miss something a cross-module read catches — worth
      an explicit coordinator-level English-leak sweep across all touched
      files at the end of every session, not just trusting each module's
      own verify pass in isolation.
      **Session 5 (2026-07-22): Modules 9–12, done & browser-verified —
      ALL TWELVE MODULES NOW COMPLETE.** First 4-module batch (previous
      sessions did 2–3 at a time) via the same translate→verify→backfill
      pipeline; concurrency handled it fine (12 agents total, no
      collisions). These four modules lean much more into music theory
      than 1–8, so most of the session's new vocabulary is theory terms:
      whole/half step → tono/semitono, transpose → transponer (a
      translator initially coined "transportar," caught its own drift via
      the "grep modules 1-8 first" instruction, and self-corrected to the
      pre-existing module-4 term before finalizing — the instruction
      worked as intended), relative/parallel minor, key → tonalidad,
      triad → tríada, slash chord → acorde con bajo alterno, home chord →
      acorde base (paired with the existing "home note" → "nota base"),
      E-shape/A-shape barre → forma de E / forma de A, comp/comping →
      acompañar, chorus (blues) → ronda, chord family → familia de
      acordes, diatonic → diatónico/a, waltz → vals, downbeat → tiempo
      fuerte, fill → relleno, roll → floreo, plus Module 9's own
      fretboard-mapping terms (octave shape → forma de octava, the
      B-string tuning offset → el desfase de la cuerda B). Also explicitly
      added "capo (the physical device) → capo, kept — distinct from
      cejilla" to the glossary, since Module 11 uses both concepts close
      together and a translator could plausibly conflate them (one did,
      briefly, in session 4's Module 8 — see that session's notes — this
      makes the distinction explicit going forward).
      Coordinator's own cross-file sweep (the session-4 lesson, now a
      standing step) specifically re-checked for "power chords"/"barre"
      slipping through untranslated in modules 9-12's forward/summary
      text — found zero leaks this time, confirming the tightened
      translator+verifier briefs (explicit instruction to grep for
      established terms, not just new ones) closed that gap.
      **Session 6 (2026-07-23, cloud Cowork session): shell "Known gaps"
      CLEARED + practice-drill Spanish for 83 new drills.** The deferred
      shell list from session 1 is done — locked-set gate toasts + locked
      pill tooltips, Songs Hub / Keep practicing / My progress panel
      contents, the Daily 5 modal, the report-a-problem subject, the
      recording widget (incl. both alerts), and the checklist cells'
      aria-labels: 46 new `I18N` keys, en+es, wired with language-switch
      rebuild handling; Daily 5 and Keep practicing now also read module
      content through `tf()` (they had been bypassing existing `_es`
      twins). Separately, the Practice System rounds (see Recently
      shipped) added hand-written `_es` for all 83 new practice drills
      across modules 1–12 plus the new practice-panel UI strings —
      review tables backfilled in `translations-review.md`.
      **DONE 2026-07-23 (same-day session): coach.js games arcade +
      Listening Coach converted to t() (407 new keys), the six tabs/
      Song Journey pages hand-translated via data-es, and Google
      Translate REMOVED site-wide** (the `WINTER_CHALLENGE` Challenge
      Day feature was removed entirely instead of translating it).
      **CLOSED 2026-07-23:** the AI-sweep proofread review (session 6's
      review policy) is finished with all findings fixed, closing out phase
      2 end to end. `translations-review.md` — the working EN→ES review
      sheet used throughout this phase — was deleted (`956743e`) now that
      the review it supported is done; the review policy itself moved into
      CLAUDE.md's i18n section as the standing rule for future Spanish
      batches.

- [x] **Practice everywhere (round 2): Modules 6–12 drills + six-string
      Find-the-Note + shell i18n finished + list-formatted directions** —
      pushed `9d742ac` (2026-07-23; built in the cloud Cowork session as
      `202f4dd`, applied+pushed locally via patch, hash changed with
      `git am`). 54 new drills
      (all 230 course skills now practiceable; M6–12 mix 77 mc / 31
      playSeq / 17 pr / 5 chord / 5 fretboard) + 9 conversions (M7/M11
      barres → 'chord', M9 note-naming → per-string 'fretboard');
      Find-the-Note extended to D/G/B/high-E + a six-row 'all' mode;
      i18n session 6 (see Open work); practice prompt/explain/chord-label
      now render trusted HTML; 17 step texts + 20 pr prompts reformatted
      as `<ol>/<ul>` per Jonathan's new list rule (documented in
      CLAUDE.md); step-preview tag stripping made word-safe;
      `.step ul` solid discs. One content removal to know about:
      m9w2-s2's old "why do the two E strings share note names?" mc was
      replaced by its fretboard game (flagged to Jonathan).
- [x] **Practice System 2.0 (round 1): every Module 1–5 skill practiceable,
      with rep tracking and spaced review** — pushed `1deed88`
      (2026-07-23; built in the cloud Cowork session, applied+pushed
      locally via patch). Engine: `practiceLog` persistence (Firestore
      save category + localStorage write-through), rep strip with a
      3-reps/day goal on every practice panel, "Keep it sharp"
      spaced-review card at the top of each set's checklist, and three
      new practice types — `fretboard` (Find-the-Note game, lowE/A/both),
      `chord` (diagram + Listening Coach + log-rep), `pr` (structured
      BPM/count ladder on the responses PR-history path, no regex
      heuristic). Content: 29 drills added + 2 conversions so all 77
      M1–5 skills have `practice:`, hand-written `_es` throughout.
      Verified via checks.mjs + Playwright integration on real module
      data. `practiceLog` is teacher-dashboard-ready but not surfaced in
      teacher.js yet (future idea).

- [x] **Tuner / Timer / Metronome on the Song Journey pages** — pushed
      `8eb26f6` + `8f33ae1` + `2acd13f` (2026-07-20). The same floating
      tool buttons students have in the main app now sit on all six journey
      pages, so they can tune up, set a countdown, or click along without
      leaving the song. Implementation: metronome/timer/popup logic extracted
      from `app.js` into a shared, dependency-free `fab-tools.js`; its styles
      ported to `tabs/fab-tools.css` (+ needed color tokens in
      `tabs/journey-theme.css`); FAB markup + `tuner.js` + `fab-tools.js`
      wired into each `tabs/*.html`. Verified in-browser on both `index.html`
      (unchanged behavior post-extraction) and `tabs/luna.html` (tuner mic,
      metronome tick, timer countdown all working).
- [x] **Song Journey pages: compact one-layer-at-a-time accordion + tip
      folds + play-along tracks** — pushed `dbd2f8f` + `c0b14fc`
      (2026-07-20), executing `archive/PLAN-COMPACT-JOURNEY.md`. Each page's
      5–6 fully-expanded layers now collapse to scannable header rows
      (badge + title + module chip + rating chip + chevron), one open at a
      time, with an "N of M layers rated" pill; `#layer-N` deep links still
      open + scroll to their layer. Inside an open layer the Stuck?/Level up
      branches sit behind `<details>` folds, and every page gained a
      lazy-loading "Play along" button (SNA / Sweet Child / Let It Be got
      newly-found oEmbed-verified vocals-kept/guitar-removed tracks; the
      other three keep jam loops pending moises.ai — see Open work). The
      previously-verbatim-duplicated inline script is extracted to
      `tabs/journey.js`; print styles added; `checks.mjs`/`sw.js` now
      fingerprint `tabs/*.css`/`*.js` too. Musical facts untouched (settled
      list in CLAUDE.md).
- [x] **Sidebar redesign + header search box** — pushed `f4d952d` →
      `92e5da6` (2026-07-20). The left rail got a cool neutral-gray
      background with distinct, color-matched Station B / Station C /
      checklist row backgrounds (not just badges), and Find moved out of the
      Explore nav list into a compact search-box-styled button in the top
      purple bar (visible once signed in).
- [x] **Station checklists: compact, one-tap-at-a-time steps** ("Concept B") —
      pushed `e6925ec`, plus same-day follow-ups `66cbc7d` (flattened the
      sections to match the approved mockup — the first push missed that) and
      `40a03ba` (row/section dividers, compact song blurb, dropped the
      Keep-going card) (2026-07-20). Station B/C steps now collapse to a
      single scannable row (status circle + short label + chevron); tapping
      opens the full step (video, chords, TAB, response), one open per
      section, with the first not-done step open by default. Mark done
      collapses the row, shows ✓, and auto-opens the next not-done step; a
      live "N of M steps done" pill sits next to each station's title.
      Collapse/expand is CSS-class-only (never a re-render), so in-progress
      responses survive. Short labels are derived from step text, with
      special handling for `Challenge — X:` / `Challenge N — X:` and a kept
      `Watch:` prefix. Deep links (search, "Show me where") auto-expand their
      target step. Browser-verified via Dev bypass: typed-text survives
      collapse/expand, one-open-per-section both directions, mark-done
      auto-advance + pill update, chord diagrams render, bare (Station C) and
      sectioned (Station B) layouts both correct. **Not yet verified:** phone
      width (~400px) and print preview — tracked above under Open work. Spec
      archived at `archive/PLAN-COMPACT-CHECKLIST.md`.
- [x] **REVIEW-PLAN full-site review, P1/P2 batch** — pushed `b76dd67`
      (2026-07-20). Implemented essentially every item across the review's
      four dimensions via a multi-agent workflow: auto-retry progress saves,
      real `<h2>/<h3>` headings in generated content, welcome-dialog focus
      trap, `data-sid` skill-row selection (replacing regex-parsed `onclick`
      matching), the `#games` deep link, a site-wide practice streak, "keep
      practicing" + "my progress" panels, persisted Listening Coach results,
      a teacher trouble-spots view + BPM personal-record history, metronome
      accent/count-in, an offline banner, chord-set song search, tuner
      YIN-scan cost cut ~5× + per-frame allocation removed, tuner/pill touch
      targets, a Bm clean-fret drill, an oEmbed-verified video swap, journey
      pages brought onto the app's plum/dark theme with fixed contrast, and a
      `checks.mjs` Firestore-SDK-version assertion across all 8 copies — then
      reviewed the diff across three dimensions and fixed the 4 confirmed
      bugs found (a song-search dedup bug hiding 3 core songs from chord
      search, a metronome keyboard-nav gap, invalid heading markup, missing
      focus movement on the two new panels). Full item-by-item detail
      archived at `archive/REVIEW-PLAN.md`; the handful of items needing
      Jonathan live on a real device are tracked above under Open work.
- [x] **Gate the Sets in each module — do them in order** (Jonathan, 2026-07-12) —
      DONE & browser-verified. Every Set now locks until the Set before it is
      finished (all its skills marked "I've got it!" — same bar as Module
      Review). Implementation in `app.js`: `isSetComplete(w)` / `isSetLocked(w)`
      (sequential, first set always open); `renderPills` uses them and gives a
      locked pill a 🔒 + a tap-hint `gateToast(...)` naming the set to finish
      first; `activateSet` has a backstop that refuses a locked set; `goToSet`
      /search deep-links (`gatedJumpGuard`) land on the module's *frontier* set
      with a toast instead of revealing a hidden locked panel; `onModuleChange`
      picks the frontier (first unlocked+unfinished) as its default target and
      never lands on a locked set. CSS: `.wpill.locked:not(.review-pill)::before`
      lock icon + `#gate-toast`. Unlocks live because `toggleSkill` re-renders
      pills. Verified: M4 Set 2/3 locked, tap-toast, live-unlock of Set 2 on
      completing Set 1, Set 3 staying locked.
- [x] **Fix where each page opens (scroll position)** (Jonathan, 2026-07-12) —
      DONE & browser-verified. `activateSet` is now the single authority on set
      scroll: it saves `window.scrollY` for the set you're leaving into an
      in-memory `setScrollPos` map and restores it when you return, or scrolls to
      top for a set never opened this session. Removed the competing
      `window.scrollTo({top:0})` calls in `goToSet`, `songHubGoModule`, and
      `searchGoSet` that were forcing top and causing the "sometimes scrolled,
      sometimes not" inconsistency. Verified: first open → top(0); leave at 500 →
      return restores 500; second set restores its own 300.
- [x] **Harden the gate + scroll** (Jonathan, 2026-07-12, worktree `worktree-jh-session`) —
      Two follow-ups to the two items above, browser-verified. (1) **Previewer
      bypass:** new `isGatePreviewer()` (dev-bypass user via `isDevBypassUser()`,
      or a login as `TEACHER_EMAIL`) makes `isSetLocked` and `isModuleReviewLocked`
      return unlocked, so a teacher/dev previewing the *student* app sees every
      Set + Module Review without grinding skills; the static `locked/comingSoon`
      flag still hides unbuilt content for everyone. Normal students are
      unaffected (verified: student ctx still gates m4 Set 2/3 + review).
      (2) **Scroll survives reload:** `setScrollPos` now hydrates from / persists
      to `localStorage['gc-scroll']` (same `gc-` convention as gc-lastSet), saved
      on set-leave and on `pagehide`/`visibilitychange:hidden`; `window.scrollTo`
      clamps so a stale offset can't overscroll. Verified: reload → m4w2 restored
      to 250, a never-opened set still opens at top. Pushed `41efa61`.
- [x] **Fret Zap** — games arcade, `fz*` in `coach.js` — pushed `c64ef08`
      (2026-07-11), browser-verified against the live code 2026-07-12. A
      no-mic, no-guitar fretboard note-naming sprint: a blank dot lights on
      a fretboard diagram (reuses app.js `localNoteSvg`) and the student
      taps the note's name from four choices before a 60-second clock runs
      out. Mirrors the Chord Blitz scaffolding — streak multiplier,
      wrong-answer reveal + requeue, session best (`fzBest:<deck>`) and
      cross-session best via `games.fz`. Four difficulty decks (low-string
      naturals → all strings 0–5 → naturals to 12 → everything with sharps);
      keys 1–4 answer on a laptop; reward tone via `playNote`. Built with a
      build → adversarial-review (4 dimensions) → verify → fix workflow (4
      findings fixed: a missing `#fz-body` width rule, two changelog idioms,
      an unglossed "naturals"). Browser test confirmed note-math, scoring,
      wrong-answer requeue, keyboard, timer, done screen, and exit cleanup
      (no leaked timer/listener) with zero console errors. **No real-guitar
      retest needed** (it never touches the mic).

---

