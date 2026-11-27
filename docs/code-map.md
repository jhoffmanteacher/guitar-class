# Code map: what each part file holds

Moved from CLAUDE.md "Where the code lives" on 2026-11-26 (CLAUDE.md keeps a short list; area rules and the tool to
run after a change are in `.claude/rules/*.md`). Each part's contents, in load order. Find a function with
`grep -n "function name" app/*.js coach-*.js teacher-*.js`. Corrected while moving: private song files are in use
(the 18 practice-card files moved on 2026-11-17); paste 2 (school accounts) was published 2026-11-14 and the
access rules on 2026-11-15, so the conditions that waited on them are gone.

## The app (`app/*.js`, the `site-parts:app.js` script tags in `index.html`)

- `boot.js` Firebase, the lazy loaders, module i18n, auth
- `save.js` Firestore, `swap45*`, games access, the progress writer (`flushSave()`)
- `tab.js` render, chord links, inline TAB, strum patterns
- `songfiles.js` private song files (2026-11-14; the 18 practice-card files since 2026-11-17): the loader for a `private:<id>` track (pieces from Firestore `songFiles`, checked against the tracked list `SONG_FILES`, a copy kept in IndexedDB, the month's download count in `songFilesUsage`: the count guards honest use only, rules cannot count reads); `node tools/song-files-sim.mjs` after any change; the Journey pages cannot play a private song yet (1dx)
- `snippets.js` backing-track snippets
- `builtsongs.js` built songs (2026-11-14, Song builder): a Play Along song kept in the database (`builtSongs/{id}`, `builtSongsMeta/list`), its format, the validator `builtSongCheck()` (every page, the console and `tools/built-song-check.mjs`), the expansion into one library card and one one-file track, and the merge after sign-in (`builtSongsSync()`, started in `app/start.js`); with no built song it changes nothing (`node tools/built-songs-sim.mjs` after any change; 1em)
- `shell.js` modals, class picker, resume card, rail set switcher, explore pages
- `lesson.js` render-time hiding, the lesson ladder, focus mode, parts, songs, Daily 5 (off)
- `review.js` Module Review, Record Yourself, checklist, practice panel
- `drills.js` practice log, tempo ladder, Find-the-Note, Shuffle, rep counter, MC shuffle, Card Deck, Ear Spark
- `drills-call.js` Note Call, Call the chord, Name the power chord, "Keep it sharp"
- `audio-ui.js` skill toggles, check-off gates, `playNote()`, BPM, Coach hooks, floating tools, nav drawer, resource viewer
- `explore.js` navigation, Songs hub, Play Along, search, Keep practicing, Daily Review, My progress, the In-Class Activities page
- `activities.js` activity deep link, Today hero, Focus view, paths, the practice-card body and its switches (versions, bass notes), (`caStepHtml()`)
- `cards.js` the practice-card player (`pc*`, `pcStop()`), chord grid, the card body (`caCardBodyHtml`), THE LEAD
- `cards-sheet.js` (split off 2026-11-18, W24) the lyric sheet (`pcSheet*`)
- `activities-2.js` exit checks, the activity board, pins
- `activities-list.js` (split off 2026-11-25) the activity gate, the In-Class Activities list (`renderClassActivities()`), its Unfinished and "Since your last visit" folds
- `start.js` service worker, the hash router, sign-in

## The arcade (`coach-*.js`, `COACH_JS_PARTS` in `app/boot.js`)

- `coach-core.js` the listening code: tunables, detection loop, onset, pitch
- `coach-score.js` (split off 2026-11-18) the Coach's finish, `coachMicOff()`, the report card and its five scoring criteria (`coachScore*`)
- `coach-recordings.js` (split off 2026-11-18) the consented mic recordings (`micRec*`)
- `coach-hub.js` Note Hunt, the Games hub
- `coach-chords.js` Change Up and Power Chord Switch (`ccLoop()`)
- `coach-chordcards.js` (split off 2026-11-16) the chord ranks (`CHORD_RANK`), Chord Blitz, Chord Detective, and the card helpers the later card games use (`cardAnswerKey`, `cbShuffle`)
- `coach-ear.js` Name That Riff, Pentatonic Simon (both), Fret Zap
- `coach-strum.js` Strum Hero, Riff Roulette, Strum Radar
- `coach-runner.js` Riff Runner and its Wait Mode
- `coach-noterunner.js` (split off 2026-11-16) Note Runner (`nrLoop()`, its judge `nrFinalizeEvent()` / `nrGrade()`, the mic offset `nrOffset()`) and `gamesResetForUser()`
- `coach-more.js` Finger Gym: The Ladder, Pattern Detective, Build-a-Chord
- `coach-strumcheck.js` the strum-pattern check on ca-46 (2026-11-14): the pattern by slot and the chord on each 1, saves nothing to progress; `node tools/mic-sim/strum-check-loop.mjs` after any change

## The console (`teacher-*.js`, `TEACHER_JS_PARTS` in `app/boot.js`)

- `teacher-core.js` dashboard, class period, keeping progress current, the views, sidebar, trouble spots
- `teacher-activities.js` Class activities: the board, the list and the detail's tabs, and what they share
- `teacher-activities-2.js` (split off 2026-11-16) what changes a card: the one move writer, drag and drop, the rename, the detail pages (`renderTeacherActivityDetail()`), the per-card settings, release dates, archive/delete
- `teacher-songs.js` Songs view
- `teacher-config.js` gate clears, games access, the `config/class` reader and `teacherWriteConfig()`
- `teacher-manage.js` Manage, Reports
- `teacher-mic.js` Mic recordings and their evaluation
- `teacher-students.js` Students view, Module Review ratings, practice minutes
- `teacher-usage.js` Students → Usage (2026-11-27, read-only): per tool, the students who opened it and the opens in all (`toolOpens`, written by the student's own page: `countToolOpen` / `flushToolOpens` in `app/save.js`), never-opened tools last; and per period, practice minutes beside skills, steps and activities done with Spearman's ρ (the Practice minutes view's read, no new one). `checks.mjs` 1fu and `node tools/console-layout-smoke.mjs` after any change
- `teacher-backup.js` "Download a backup" in Manage (read-only; `node tools/backup-proof.mjs` after any change)
- `teacher-errors.js` Tools → Error log: the anonymous `siteErrors` entries the logger in `app/boot.js` (`SITE_ERRORS`) writes, and "Send a test entry" (`node tools/site-errors-sim.mjs` after any change to either; no name, uid or email may ever be added to an entry)
- `teacher-livegames.js` the Games list in the Live In-Class Games view: order, rename, Remove / Restore, kept in `config/class.liveGames` through `teacherWriteConfig()`; `live-quiz.js` reads it through `lqPickerIds()` / `lqCustomTitle()`, and Start copies a custom name into `liveQuiz/current.title` (`node tools/live-quiz-loop.mjs` after any change)
- `teacher-accounts.js` Manage → "Accounts by sign-in domain": requests to join (`accessRequests`), the allow list `config/access` (teacher-only; every write merges one key), the roster's outside accounts; the student's access screen is `accessRefusedAtBoot` / `showAccessScreen` in `app/boot.js` (`node tools/access-sim.mjs` after any change to either; the rules are `firestore.rules`, one file since 2026-11-14, with the `isSchool()` gate pinned by `checks.mjs` 1dt)
- `teacher-songfiles.js` Manage → "Song files": Upload, List, Verify, Delete; the console's only writer of the `songFiles` store, and Jonathan's click only (`node tools/song-files-console-sim.mjs` after any change; song files are left out of the backup on purpose)
- `teacher-builtsongs.js` Manage → "Built songs" (2026-11-14): the list of built songs with today's verdict, and Import (a song file .json and its .mp3 that Claude prepared with `tools/new-playalong.mjs`; the audio through the Song files writer, then `builtSongs/{id}`, then the list); Song files names a built song's audio and refuses to delete it (`node tools/song-files-console-sim.mjs` after any change)
- `teacher-sb-core.js`, `teacher-sb-beat.js`, `teacher-sb-dsp.js`, `teacher-sb-chart.js`, `teacher-sb-pdf.js` (pdfs of the chords and the tab, 2026-11-16: a chords pdf's text goes into the chart box, a tab pdf or a scan is only shown beside the chart; kept in the tab, never stored) the Song builder view (2026-11-15 and 16, Parts b and c: Upload, Volume, Beat, Chart, Level): drafts in `songDrafts/{id}`, the levelled 192k copy (`vendor/lamejs`, console only) stored through the Song files writer, the beat grid and its beat track, the chart reader, the correction grid and the level (`teacher-sb-chart.js`: every chart it accepts must make a song `builtSongCheck` passes)
- `teacher-sb-publish.js` (Part d, 2026-11-16) Preview (the real card on the levelled copy; no listen is required), Publish (on the Preview step, only when `builtSongCheck` passes on the exact doc and within 10 cents; over 8 pins only warns; ONE transaction writes `builtSongs/{id}`, `builtSongsMeta/list` and the draft `songDrafts/{id}`), Edit (a choice of step; an imported song's draft rebuilt from its doc), Unpublish, Delete… (typed title), Export (.json and its mp3), the health line; `node tools/song-builder-sim.mjs` and `node tools/sb-dsp-test.mjs` after any change to any of these (1en pins both)
- `teacher-sb-sheet.js` (2026-11-18) the Lyrics sheet row on a published song's Song builder page: a chords-over-lyrics pdf with text, checked by `pcSheetAlign` (`app/cards-sheet.js`) against the song's card, refused with a reason and a per-section table when it does not line up; Add stores the pdf through the Song files writer and writes `song.sheet` in one transaction; the card gets a Chords / Lyrics switch (`node tools/song-builder-sim.mjs` and `node tools/song-files-console-sim.mjs` after any change)
- `teacher-remove.js` Manage → a student's "⋯" (More): "Start this student over…" and "Delete this student's data…" (2026-11-14): one student, typed-name confirmation, a download offered first; the console's only write to `progress/{uid}` is its delete (`teacherRemoveDeleteProgress()`); its markers are `progressStartOver` / `progressDeleted` in `config/class`; a Start over is applied once by the student's own page at its next sign-in (`progressStartOverAtSignIn`, `app/save.js`); a page they already have open saves its old copy again (stated in the dialogs, not engineered away) (`node tools/remove-one-sim.mjs` and `node tools/save-loop.mjs` after any change to either)

## Parts added since the table was written

**Parts the table above does not name yet** (2026-11-25 sweep): app `app/songrequests.js` (song requests), `app/songhelp.js` (2026-11-25: the "song did not load" help pop-up and its "Clear saved songs and reload" button; it never reloads over unsaved work; `checks.mjs` 1fe), `app/cards-views.js` and `app/cards-loop.js` (the practice card's views and its Loop / Build up speed / speed ladder); console `teacher-livemusic.js`, `teacher-manage-layout.js`, `teacher-songrequests.js`.
