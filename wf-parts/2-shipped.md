## Recently shipped (post-archive)

Detail lives in git log and `CHANGELOG.md`; entries keep what still binds.

- [x] **2026-11-09 — Console sidebar: a units tree under Class activities (Jonathan's request, shipped Fast).**
      Console only (no CHANGELOG entry). Rows from `teacherSideTreeRows(model)`, the list's own groups, so the counts
      cannot disagree; fold kept per browser, starts open (pinned in `checks.mjs`); hidden below 900px; English only.
      **Decisions (Jonathan, 2026-11-08):** a click shows the unit and keeps the Preview; always visible with a fold
      arrow; Built first. He also said the Chromebook 1366×657 screen does not bind the teacher console. Check 1ch's
      Songs-view sandbox stubs `teacherPaintSideTree`.

- [x] **2026-11-08 — Teacher console redesign, Layout A (work order `OPUSPLAN-teacher-console-layout-2026-11-08.md`).**
      Console only (no CHANGELOG entry). Every new control carries its board twin's `data-*` attribute, so the same
      listener calls the same writer. A grouped sidebar (`TEACHER_NAV`, no "Modules" item; 1cg's Practice minutes pin
      reads it) replaced the 13 view buttons. Class activities = list + tabs (Preview · Students N/M · Settings). A write
      or a refresh never rebuilds the Preview, so a playing song keeps playing. "Unit N" on the list, the detail and the
      board; "Module" everywhere else (labels only).
      **Decisions (Jonathan delegated them under the work order):** `aria-current`, not `aria-pressed`; list counts follow
      the period filter (on All they equal the sum of the board's P4 / P7 / CAS / Unassigned lines); the third count is
      "Not started" (nothing records an open; "started" = a step/check tick in `caSteps`; a path pick alone is not a
      start); the list auto-picks the newest card students can see now; switching rows calls `stopCardAudio()`; a Built
      card's Settings shows only what the board shows for it, an archived one only Restore/Delete; songs opened from
      Songs get a Settings tab pointing back to their own tab; below 1100px the list stacks above the detail; Songs' "Opened:" label wraps below 900px. Round 3 (the
      lead's call): the rename box keeps typed text across tabs (reverses round 2's close-on-leave). Run `node
      tools/console-layout-smoke.mjs` after any console layout change. Reviewed, not Fast (Jonathan's call for this
      order); round 3 on 24c7ccc. Not changed: `class-activities.js` ca-21's student text says "Unit 2 assessment" (students' word is Module).
- [x] **2026-11-06 — Practice minutes in the teacher console (needs a `firestore.rules` paste).** `renderTeacherMinutes()`
      (`teacher.js`): one row per student, grouped by period. Sort This week (default, pinned in 1cg) · All time · Name.
      English only. Jonathan picked the four defaults (STOP 0) and approved the layout (STOP 2).
      **Reads:** `minutes/{uid}/weeks` for every roster student, from the SERVER, on open and on its own Refresh only (no
      timer, no listener). Never `collectionGroup('weeks')` (it needs a wildcard-first rule; 1cg forbids it, and bans
      `collectionGroup` and a spaced `.collection (` in all of teacher.js). Writes NOTHING. Never reads the boards or the
      tags: rank and Top 5 come from the weeks docs via the engine's pure `calc.rankPlace()` / `calc.top5Place()`. Rank
      counts the whole roster (archived too), whatever the period filter; the teacher is never ranked; total = students
      with at least 1 minute. A student's own rank (from `rankBoard`) can differ slightly; the console's is the true
      number (a note under the table says so).
      **Rules:** `allow read: if isTeacher();` in the `minutes/{userId}/weeks/{week}` block only (pinned whole in 1cg);
      emulator 191 passed, 0 failed. The view handles unpublished rules, so code before the paste breaks nothing.
      PM_SIM_PIN 278 → 285.
      **Jonathan's call (same day):** keep it as is: one click shows every student's minutes by name (the reviewer's
      projector note), no extra click. Left on purpose: collection names held in variables are not caught by 1cg.
- [x] **2026-11-04 — Practice minutes: Top 5 of the week, by class period (needs a `firestore.rules` paste).**
      Most minutes THIS ISO week inside the student's own period; ties share a place; 10 minutes needed
      (`top5MinMinutes`); each student sees only their own place.
      **Standing rule from Jonathan (2026-11-04): no per-period minutes tied to a name, readable by anyone.** The board is
      keyed by a private random 32-hex tag: `weekBoard/{tag}` `{week, period, seconds}`; the tag lives only in the owner-only,
      create-only `minutes/{uid}/meta/board` (page memory only, never localStorage: a shared Chromebook would leak uid ->
      tag). A board write only under the writer's own tag (rules pinned in 1cg). Read from the SERVER only: offline, a
      plain get() answers empty from the cache (measured on the real SDK).
      **Closed 2026-11-05 (Jonathan's picks: take the names out of the live quiz, then also key the class rank by the tag).**
      `liveQuiz/current.scores` carries NO name (names live in the teacher-only `answers/{uid}` docs); its writers REPLACE
      the field (a plain merge is deep and kept old names); checks.mjs **1cm** runs them. The class rank moved from
      `minutesBoard/{uid}` to `rankBoard/{tag}`; `minutesBoard` has NO rules block and 1cg fails the push if one comes
      back. Never publish a name next to a uid, or minutes next to a uid, again. **ONE-TIME after deploying: delete the
      `scores` field of `liveQuiz/current` in the Firebase console; the old `minutesBoard` docs were DELETED in the console
      on 2026-11-05 (the whole collection; Jonathan asked).** Still true: `config/class.periodOverrides[uid]` is readable
      by every student (a period, never a name).
      Known limit: a tag cannot be proven unique, so any account can claim another's tag and lower/remove that entry (fix:
      a create-only `boardTags/{tag}` with `existsAfter`; not built; two cases in `tools/pm-rules-test.mjs` pin it so they
      flip when it is fixed). `tools/pm-rules-test.mjs`: 179 passed, 0 failed on 2026-11-05; one known leniency pinned (a
      chunk with no `i` is accepted, which the console never reads).
- [x] **2026-11-01 — Practice minutes (student view only; display switched ON the same day: `uiOn: true`, `streakStartWeek: '2026-W45'`, goal 30; 60 since 2026-11-04).**
      **Files:** `practice-minutes-config.js` (every setting, nothing else), `practice-minutes.js` (engine + all UI; its
      header has the mechanics), `tools/pm-sim.mjs` (part of checks.mjs **1cg**), `tools/pm-e2e.mjs` and
      `tools/pm-rules-test.mjs` (by hand).
      **2026-11-03 — ALL SITE WORK COUNTS (Jonathan: "any work inside the website from modules to other class activities
      should count towards minutes and streaks"; reverses the backing-tracks-only rule).** A second counts while any
      audible `<audio>`/`<video>` plays, OR the student showed a sign of work in the last 2 minutes (`ACTIVE_MS`); 10
      minutes (`FRAME_ACTIVE_MS`) while focus sits in an embedded video iframe. Goal and cap kept that day (his call). **2026-11-04 — weekly goal 30 → 60 minutes (Jonathan);** the daily
      cap stays 20 (`dailyCapMinutes`; `dailyCapSeconds()` 1200), so a week needs at least 3 days at the cap (60 ≤ 7 × 20,
      the 1cg range check).
      **Storage:** `minutes/{uid}/days/{date}` and `minutes/{uid}/weeks/{ISO week}`. Chrome fires `pagehide` THEN
      `visibilitychange:hidden` (measured, Chrome 153). A commit has NO timeout (re-sending multiplied the seconds).
      **Jonathan, 2026-11-01: "be liberal with minutes since this is for motivation"** (reversed his "lose under a minute"
      call the same day): when unsure, count it; the daily cap bounds it. Streak: a miss before any streak spends no free
      miss (Jonathan, 2026-11-01).
      **`firestore.rules`: new blocks need the console paste BEFORE the code is live, or every write is refused** (the
      client retries every 5 min, so a late paste loses nothing). `dailyCapSeconds()` in the rules must equal
      `dailyCapMinutes × 60` (1cg). **2026-11-06:** the teacher's account may READ `minutes/{uid}/weeks/*` (the console's
      Practice minutes view; one more paste): see that entry.
      **Rules (all in the config; simplified 2026-11-01 by work order):** the goal is FLAT (`weeklyGoalMinutes`, every
      counted week, every student). NO meeting days, no no-school dates, no short weeks, no proration (1cg fails if those
      keys return). `skipWeeks` is a list of Mondays (checked); a skipped week neither counts nor breaks a streak, and its
      minutes still add to the totals. `semester2Start` (Mon 2027-01-04) resets the one free missed week per semester.
      "This week by day" is Mon-Sun. `streakStartWeek` = the week `uiOn` went live; streak and "hit" are recomputed against
      the CURRENT goal, so changing `weeklyGoalMinutes` re-scores old weeks (stored `hit`/`goalSeconds` are a snapshot).
      The prefilled skip weeks and the semester date came from the work order, not from a calendar: check them against
      the district's.
      **2026-11-04 — the strip moved to the main top bar, every page** (`#pm-header`); Games covers the header, so it has
      its own twin `#pm-games`; the Live quiz overlay has no strip (on purpose). STOP B: Jonathan chose to shorten the week text (`pm.weekMin` "{done}/{goal} min"); later that day (Jonathan: "drop it and add this
      to games screen") "N playing" was dropped. Measured at 1366×657: Spanish holds one row to 35-character names,
      English to 56; longer names wrap the bar from 49 to 70px (not fixed).
      **Heartbeat removal: DONE** (code 2026-11-04: `5144c6c`, `edb60e6`, `3d87f7d`; rules, index and rules test
      2026-11-05, console paste included). 1cg pins the heartbeats rules block as "gone, or exactly as shipped". Last
      2026-11-04 commit before it: `fe196aa`.
      **Class rank on My progress ("N/total", Jonathan, 2026-11-04; now `rankBoard/{tag}`, see the Top 5 entry):** rank =
      1 + others with more WHOLE minutes; under 60 s, no number. About 150 reads per refresh, at most one per 3 hours;
      the Spark limit is 50,000 reads a day: if the class grows, replace the full read with a count query. Accepted
      limits: a student at DevTools can claim any number up to the cap; any Google account that signs in once adds 1 to
      the total (Jonathan chose no domain rule); a Journey page's player loops and counts while it plays (the cap bounds
      it); `--streak-dim` is 2.5:1 on purpose. His 2026-11-04 acceptance of names in the live quiz was superseded on
      2026-11-05 (Top 5 entry). As of 2026-11-04, pm-e2e's fake `minutes` collection had a duplicate `doc` key (since
      70ef823), so the e2e never ran the board WRITE.

- [x] **2026-10-31 — "Hear It First": a hidden adaptive ear + fretboard trainer.**
      Work order `WO-hear-it-first.md` (kept out of the repo). `index.html?hif=1`, any signed-in account; never visible
      to students (its rules: CLAUDE.md and `trainer-core.js`'s header). Within 45 cents counts, 45–50 is "didn't catch
      that". Saves `progress/{uid}.trainer` (rules unchanged); 25 KB with all 208 cells (under 30 KB). Sound is synth only
      (recorded notes stop at MIDI 74; the trainer goes to 84).
      **Before a student release:** the unlock rule (every new cell at m ≥ 0.75 and n ≥ 6) is slow: a steady 95% learner
      opens Z2 at about session 7, Z3 at 28, Z4 at 60–78, and does not reach Z5 or T4 in 90 sessions (switches:
      `unlock.granularity`, `unlock.minN`, `weights.coverage`). Open interpretations I1–I11: header of `trainer-core.js`.
      Not yet checked on a real guitar: the work order's section 8 checklist, frets 13–20 on B and high e (up to 1046 Hz).

- [x] **2026-10-26 — Watchtower: the record's rhythm replaces the book rhythm.**
      Measured on the beat map (26 A-bars, 26 F-bars), confirmed by ear by Jonathan. Bar 1 is `A A A A G G G G` (G on
      beat 3, no rest); bar 2 is `F F F · · G G G`. Applied in Modules 2–7, ca-29 (one rhythm in every section), ca-38's
      caption, Riff Runner (14 targets a lap), Journey Layers 2–5, the song-facts skill. Left on purpose: ca-26 (two plucks
      per note) and ca-40 (one 2-beat strum per chord). The F bar's rest is a HELD third F, never `{ rest: true }`, so
      ca-29 stays at 224 chord changes.

- [x] **2026-10-25 — Whole-site sweep + audio levelling.** 111 commits (`5d1ff51..6ea5898`, live `…-6f4dcd3b92`) and 18
      more for Teen Spirit (ca-41) and the loudness pass (`..ba655c7`, 32 mp3s re-encoded, +267 MB in git history). New
      checks **1br**, **1bs**, **1bt**, **1bu** (soft: each song within 1 LU of "the cure"); 1bf *renders* the card
      builders; 1ah follows the guard, not the token. New tools: `tools/smoke.mjs`, `tools/loudness.py`. Items left for Jonathan: project memory `site-sweep-2026-10-25` (the ca-38 Watchtower caption
      was done 2026-10-26). Six backing-track files stay more than 1 LU off "the cure" on purpose (Jonathan chose one gain
      per song).

- [x] **2026-10-10 — "Keep practicing" row (pinned activities).** `config/class.activityPins`: an ORDERED array of up
      to 4 activity ids (an array because the order is what students see; 4 is a hard cap). Console switch on each
      assigned, non-check card (`teacherSetActivityPin`); a 5th pin is refused; the strip above the board is the only way
      to unpin an archived card. Delete unpins; Archive keeps the pin. The writer is cell-checked on the whole array;
      1ai `CONFIG_WRITERS` 20 → 21. The pin stands in for the release date for that row only:
      `caIsVisible`, the three blocker rules and `CA_TODAY_MAX` never read it; it writes no completion data;
      Hidden / Archive / Delete / unassigned still win (`caPinReachable`). Since 2026-10-13 pins stay put even when one is
      today's card (Jonathan). No `firestore.rules` change.

- [x] **2026-10-06 — Play-along first: Song Journey pages stay open as the
      back door.** Reverses part 1's per-song retire switch (`fc7e878`, reversed the same day). One rule for every link to
      a song: if students can open a whole-song card for it (and that layer), the link opens the card; otherwise the Song
      Journey page (`openSongLink(slug, layer)`, decided at the click). `tabs/journey.js` / `journey-theme.css` match `dbf1dc2`. 1bn: every
      whole-song card names its song + layer, no two share a pair, none names the page, and the retire switch cannot
      come back. Nothing deleted.

- [x] **2026-10-06 — Song Journey phase-out, part 1: a per-song retire switch.** `JOURNEY_RETIRED` (`the-cure`,
      `seven-nation-army`); superseded the same day by play-along first (above); part 2 cancelled. `journey:` stays on
      every card (it places a whole-song card on its Songs row).

- [x] **2026-10-06 — "the cure" Journey page: the record plays each chorus
      three times.** The record plays Dm · F · C · G three times (12 bars). Per Jonathan, the eight-bar teaching (page and
      ca-18) stays; one play-along note says so (EN + `data-es`).

- [x] **2026-10-06 — "the cure" whole-song captions: "3 times" → "3 laps,"
      plus ratchet 1bm.** ca-24 and ca-30 captions now say "laps"/"vueltas", matching their `repLabel: 'Lap'` badge.
      1bm fails the push when a caption's counting word differs from its badge's (whitelist Lap/Vuelta, Time/Vez,
      Verse/Estrofa), both languages. Chorus length untouched (12 bars: 4 × 3 laps).

- [x] **2026-10-05 — Seven Nation Army chorus captions: "second lap" →
      "second time."** ca-25 and ca-31 Chorus captions use "time"/"vez", matching `repLabel: 'Time'`. "Lap" stays the
      site's word everywhere else; this was not a rename.

- [x] **2026-10-02 — "Open through Module N" (per-student module skip).** `config/class.moduleOpenThrough`
      (`uid → 2..12`), set from Manage's "Open through" select (Auto deletes the key). `isModuleGateLocked` opens modules `<= N`; `isSetLocked` opens every set of
      modules `< N` (module N keeps its set order). No progress writes, no student text, no rules change. 1ai writer count
      17 → 18. Deferred: a whole-class setting, a bulk control, a student notice; a skipped module's Module Review stays
      preview-only (it is locked on the module's skills, not on the gate).

- [x] **2026-09-25 — One activity on the In class page at a time (Cowork
      patch 0002, on top of Focus view).** Jonathan picked "hide them, every activity" over dim-and-lock. `caSyncSolo()`
      hides everything but the open card; "◀ All activities" closes it, stops card audio and scrolls to the top.

- [x] **2026-09-25 — Focus view for class activities (Cowork patch).** Jonathan picked Focus view (one step at a time)
      from three designs; on for ca-10, ca-18, ca-20 and ca-21 via the activity-level `view: 'focus'` flag; print and the
      teacher preview show every step. 1d rejects any `view` value other than 'focus'.

- [x] **2026-09-20 — Left rail navigation cleanup (work order, pasted in
      chat — no saved file).** Pushed `4f497cd`. "Practice"→"Modules"; rail-only "In-Class Activities"→"In class"
      (`nav.classActivitiesNav`). Module review is a `.rail-station.st-review` row at the end of "This set", with the 🏆.
      Header subtitle dropped (Jonathan: "this text isn't necessary… save space").
      **Decision (Jonathan, 2026-09-20): keep the two-column nav grid, permanently and at every screen size**, with short
      labels, uniform rows, an active state that changes background/color only, and `#my-progress-btn` spanning both
      columns. Why: the work order's single-column rows overflowed the rail by 106-132px at 1366×657 on essentially every
      module. Measured by child rects: ~19px of rail slack on m5w2 for the teacher view, ~66px for a student.

- [x] **2026-08-04 — Cross-module gate: Set 1 locked until prior module +
      review done (work order, pasted in chat — no saved file).** Pushed `937ff9a`. `isModuleGateLocked(moduleNum)` chains
      modules 1→12: a module's Set 1 stays locked until every built set AND every Module Review row of the PREVIOUS
      module is done; Module 13 always open; existing progress in a module keeps it open for good. A one-time background
      `ensureAllModuleData()` redraws the dropdown (lazy module data would otherwise show a stale 🔒).

- [x] **2026-08-04 — Paper retirement, part 2 (work order).** Pushed `8f7287b`. Module 9's Challenge 2 and Challenge 4
      use a persisted free-text box. "Try spacing TAB rhythm" kept its keyed MC (Jonathan: no second response slot on a
      step); only its paper wording went. New optional `naturals-plus` deck (naturals + F#/Bb) in `DECKS`, an untracked
      bonus step in module-9.js. Landed on top of a concurrent push (`8a5e369`).

- [x] **2026-08-04 — Small-patches bundle (work order, 8 decided items).** Pushed `e89fd6d`. Module 5's Am↔Em target
      20→16; `m3w2-s1`'s beat-1 tempo 60→70 BPM (placeholder 75); "PR ladder" comments → "tempo ladder" (the `pr` type
      and `pr.*` keys untouched); Sweet Child's power-chord challenge retitled "Intro/Verse/Chorus" (Jonathan's ruling:
      the D5–C5–G5 loop isn't verse-exclusive); the last 3 "grab a friend" lines cut; `MC_PINNED` narrow-pin ratification
      comment. Heading audit, 203 `Challenge` labels: one gap fixed (`module-3.js` "F5 ↔ A5 Two-Shape Drill" →
      `("Luna")`). Item 17 (teacher.js uid in onclick) was already fixed; closed by verification.

- [x] **2026-08-04 — Set peek: read-only preview of a locked set.** Pushed `a648364`. A sequentially-gated locked pill
      opens the set read-only (`activateSet(id, {peek:true})`, `.set-peek`). Writes are blocked at choke points:
      `toggleSkill`'s top plus the two drill best-score saves. A static `locked`/`comingSoon` set
      never gets a peek. Peek state is DOM-derived (`.week-panel.active.set-peek`), not a variable.

- [x] **2026-07-27 — site-wide review: outage fix + 13 commits.** The whole site was down: `buildSet()`'s song-thread
      `map` callback named its parameter `t`, shadowing i18n `t()` (fixed `3ab369d`; introduced by `29c5187`). Hence
      `dcdb372`: the `checks.mjs` render smoke test calls `buildSet()` on every set; a harness that can't load degrades to
      a WARNING, never a blocked push (a stale stub must not become a reason to delete the safety net). Also: sign-out
      flushes and hard-reloads, service-worker fixes (`b70621e`); teacher pause + archive as uid→bool maps in
      `config/class` (`90c486e`); the sequential gate is a high-water mark (`6b2c19b`); Module 13's winding is for the
      classical slotted headstock (`7631362`); steel-vs-nylon, and "Smoke on the Water" in G, the riff's key (`7f22360`);
      `firestore.rules` versioned + teacher-email drift check (`44a4adf`); fixes `127bb19`, `475e3b0`, `569fd3d`,
      `ae6f27f` (Module 12 no longer promises a capstone).

- [x] **Module 5 assessment settles on one song; song titles quoted
      site-wide** — pushed `598a580` then `8262116` (2026-07-26). Jonathan reversed the two-song requirement: Module 5's
      assessment asks for ONE core song from memory (Let It Be, Luna, or "the cure"); Set 4's song-of-choice material
      stays as optional ungraded practice. Every song title site-wide is in quotation marks, nicknames included
      ("Watchtower," "Sweet Child"); "SNA" spelled out.
- [x] **Report-an-issue in-site form + always-top-scroll fix** — pushed `a86ec71` (2026-07-24). "Report a problem" opens
      an in-site form writing to `issueReports` (mailto fallback offline or for the dev bypass); rule published by
      Jonathan the same day. Opening a Set always scrolls to the very top (Jonathan dropped the 2026-07-12 scroll
      memory); `history.scrollRestoration='manual'`. A live save by a real signed-in student was not checked at the time.
- [x] **Real-guitar mic tests all passed clean (2026-07-24)** — Riff Runner Wait Mode (on Seven Nation Army) and the
      mic retest (melody mode's `coachNowHtml` preview, one Note Hunt round, one Change Up round) passed. Nothing to fix.
- [x] **Module 13 · String Changing — new single-flow module + graded
      assessment** — `539a939` (2026-07-23). `module-13.js`, 7 sections; nylon ball-end (no tie knot: the string type
      being purchased) and steel; 4 checklist skills = the in-class assessment rubric; videos oEmbed-verified;
      skillCount 4.
- [x] **Keep practicing + My progress → full-screen pages** — pushed `dc2d6ef` (2026-07-23). `#keep-practicing` /
      `#my-progress` hashes; browser Back exits.
- [x] **Songs hub: two-tier layout — Core card + Choice menu grouped by
      difficulty** — pushed `5043121` (2026-07-23). Core six on top; Choice groups by first-appearance module (M1–4,
      M5–8, M9–12, hidden while empty).
- [x] **Practice-step polish trio: disclosure pills, scroll-under-header,
      safe-handling fold removal** — pushed `5cbb316` + `ee1a5f0` + `b95f1f5` (2026-07-23).

- [x] **Live-site device checks, no mic needed — closed without on-device
      confirmation** (2026-07-20; closed 2026-07-23) — **Jonathan decided phone-specific polish isn't a priority for
      him**: done as a scope call, not verified on a device. If phone use matters later, revisit: the tuner's string lock,
      string-selector touch targets, the compact checklist and Song Journey pages at ~360–400px and in print preview.

- [x] **Custom backing tracks for all six journey-page play-alongs — Jonathan
      made them himself** (Jonathan, 2026-07-20 → all six DONE 2026-07-22; `c2b9e94`/`2958547`/`73c7afd`). A=440: "the cure" (Am, 144 BPM), Luna (Am, 128), Watchtower (Neil Young cover,
      Am, 115; display name stays "Dylan/Hendrix"), Sweet Child O' Mine (G, 125; standard tuning, so a half-step above the
      down-tuned record, expected), Let It Be (C, 71), Seven Nation Army (Em, 123). Slow tier: "the cure" 120, Watchtower
      90, Sweet Child 100, Seven Nation Army 100. Lesson (2026-07-23): check an Open item against git log before
      trusting a stale-looking status.

- [x] **Module 12: confirmed the requinto video fits, deleted the leftover
      note** (2026-07-20; resolved 2026-07-23) — La Derrota requinto video `cRJb_f4-M5g` re-verified ; no swap.

- [x] **i18n phase 2 — hand-written Spanish for module/lesson content, tabs/
      pages, and games** (started 2026-07-22) — all twelve module files, the Song Journey pages (`data-es`) and
      `coach.js` (407 keys) hand-translated by 2026-07-23 (`<field>_es` twins). checks.mjs `1b.` requires every `_es` twin (and
      `MODULE_SONGS[N]` `meta_es`) for a module flagged `i18nComplete`. Google Translate REMOVED site-wide 2026-07-23
      (`WINTER_CHALLENGE` removed instead of translated). `translations-review.md` deleted (`956743e`); the review policy
      is CLAUDE.md's i18n section and the glossary lives in `i18n.js`.

- [x] **Practice everywhere (round 2): Modules 6–12 drills + six-string
      Find-the-Note + shell i18n finished + list-formatted directions** — pushed `9d742ac` (2026-07-23; `202f4dd` in the
      cloud session). All 230 course skills practiceable; Find-the-Note covers every string; the list rule for
      directions. m9w2-s2's old "why do the two E strings share note names?" mc was replaced by its fretboard game
      (flagged to Jonathan).
- [x] **Practice System 2.0 (round 1): every Module 1–5 skill practiceable,
      with rep tracking and spaced review** — pushed `1deed88` (2026-07-23). `practiceLog`, a 3-reps/day goal, the "Keep
      it sharp" card, practice types `fretboard` / `chord` / `pr`. `practiceLog` is not surfaced in teacher.js yet.

- [x] **Tuner / Timer / Metronome on the Song Journey pages** — pushed `8eb26f6` + `8f33ae1` + `2acd13f` (2026-07-20).
      Shared `fab-tools.js` and `tabs/fab-tools.css`.
- [x] **Song Journey pages: compact one-layer-at-a-time accordion + tip
      folds + play-along tracks** — pushed `dbd2f8f` + `c0b14fc` (2026-07-20; `archive/PLAN-COMPACT-JOURNEY.md`).
      `tabs/*.css`/`*.js` are fingerprinted.
- [x] **Sidebar redesign + header search box** — pushed `f4d952d` → `92e5da6` (2026-07-20).
- [x] **Station checklists: compact, one-tap-at-a-time steps** ("Concept B") — pushed `e6925ec`, `66cbc7d`, `40a03ba`
      (2026-07-20). Collapse/expand is CSS-class-only, never a re-render, so typed responses survive.
- [x] **REVIEW-PLAN full-site review, P1/P2 batch** — pushed `b76dd67` (2026-07-20); item detail in
      `archive/REVIEW-PLAN.md`. Added the `checks.mjs` Firestore-SDK-version assertion across all 8 copies.
- [x] **Gate the Sets in each module — do them in order** (Jonathan, 2026-07-12) — a Set locks until every skill of the
      Set before it is marked "I've got it!" (`isSetComplete` / `isSetLocked`; first set always open); deep links land on
      the module's frontier set (`gatedJumpGuard`).
- [x] **Fix where each page opens (scroll position)** (Jonathan, 2026-07-12) — per-set scroll memory in `activateSet`;
      replaced on 2026-07-24 by always-top (above).
- [x] **Harden the gate + scroll** (Jonathan, 2026-07-12, worktree `worktree-jh-session`) — `isGatePreviewer()` (the
      dev bypass or `TEACHER_EMAIL`) unlocks every Set and Module Review; the static `locked/comingSoon` flag still hides
      unbuilt content for everyone. Scroll persisted to `localStorage['gc-scroll']` (replaced 2026-07-24). Pushed
      `41efa61`.
- [x] **Fret Zap** — games arcade, `fz*` in `coach.js` — pushed `c64ef08` (2026-07-11), browser-verified 2026-07-12.
      No mic: **no real-guitar retest needed**.

---

