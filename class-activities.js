/* ════════════════════════════════════════════════════════════════════
   Guitar Class — In-Class Activities (teacher-curated, day-specific work
   pushed out alongside the self-paced modules)

   An activity's entry lands on main UNDATED and invisible to students — this
   file carries no release date at all. The teacher sets (or edits, or clears)
   the release date from the Class activities view in teacher.js, which
   writes it to config/class.activityDates ({ id -> 'YYYY-MM-DD' } in
   Firestore). app.js's caIsVisible() gates the student-facing list (and the
   "unfinished activities" reminder popup) on that date having arrived
   (local calendar day); an activity with no entry in activityDates — which
   is every activity the moment it's authored — simply never shows. No
   draft/staging state needed: pushing early to get checks/review out of the
   way is fine and expected, since the console date is what actually turns it
   on. The teacher's Class activities view lists every activity regardless of
   date, with a note distinguishing "no date — hidden from students" from a
   future-scheduled one, and always has full access to the separate manual
   "hide" toggle (config/class.hiddenActivities, read by loadClassConfig() in
   app.js) for pulling something back temporarily after it's gone live — that
   toggle and the date gate are independent, either one hides.

   Retiring one for good is the console's Archive / Delete pair
   (config/class.archivedActivities / .deletedActivities, same read path):
   Archive keeps its date, rename and its place on the board so Restore puts
   it back unchanged, Delete clears all of that — and takes it off the board
   — so a restored one comes back blank, in Built.
   Both hide it from students and stop it gating the site; neither removes
   the entry from THIS file — a card only really leaves the course by being
   deleted here and pushed. Otherwise activities never retire: this file is
   a permanent archive, rendered in the console board's order (app.js sorts,
   this file doesn't need to be kept in any order).

   PINS — nothing to write here either. A card Jonathan reuses on many days
   (the song play-along cards, ca-23) can be PINNED from the console board:
   config/class.activityPins, an ordered array of up to 4 ids (Jonathan,
   2026-10-10). Students get a "Keep practicing" row (ES «Sigue
   practicando») above Today's activity — one button per pin, in pin order,
   opening the card exactly as a tap on it would. A pin stands in for the
   release date for THAT ROW ONLY: the card stays off the dated list, never
   counts as one of Today's activities, never blocks and writes no completion data
   (caPinReachable / caIsPinOnly / caPinRowHtml in app.js). It must still be
   assigned on the board, not Hidden, not archived/deleted, and not an exit
   check. A pinned card that is also one of today's cards stays in the row
   that day (Jonathan, 2026-10-13 — see caPinRowHtml). Delete unpins;
   Archive keeps the pin but hides it.

   JOURNEY — `journey: '<slug>'` (optional; one of the six SONG_JOURNEYS ids
   in app.js: seven-nation-army, all-along-the-watchtower, sweet-child-o-mine,
   luna, let-it-be, the-cure; optional `journeyLayer: <n>` to land on a
   specific layer). Set it on an activity whose steps send the student to
   that Song Journey page. Two things happen: the card renders an "Open the
   Song Journey page" button in its LAST step, and only there (both
   renderers), and that one
   Journey page stays OPEN behind the activity gate while this activity is
   pending — journey.js exempts a page any pending activity names, since the
   page is part of the work. Every other Journey page stays gated as usual.
   checks.mjs 1d validates the slug (and the layer against JOURNEY_LAYERS).
   A whole-song card (`card.wholeSong`) never renders the Journey button — it IS
   the play-along; its `journey` + `journeyLayer` are how links to that song and
   layer find it (the Songs page row, "Take it to a song", "About this set"). On
   any other activity the button renders only while the song has no whole-song
   card students can open.
   Write the steps to match: only the LAST step may name the Song Journey
   page (EN "Song Journey", ES "Recorrido de la canción") — an earlier step
   that says "open the Song Journey page" points at a button it doesn't
   have. checks.mjs 1ba fails the push on one (Jonathan, 2026-09-25).

   VIEW — `view: 'focus'` (optional; the only value). Shows the steps one at
   a time instead of as the accordion: numbered step buttons across the top
   of the card (done ones green with a check, later ones locked until the
   step before is marked done), only the current step on screen, and a
   "Got it — next step" button under it where Mark done used to be. Pure
   presentation (caIsFocus in app.js) — the same steps, ticks and Mark
   complete, which shows only on the last step until the card is complete
   (2026-09-27) — so it can be added to or taken off any activity at any time
   without touching saved progress. Leave it off and the card is the usual
   accordion. The console preview still lists every step, with a note.
   checks.mjs 1d rejects any value but 'focus' and 'card'. (Jonathan,
   2026-09-25: ca-20, ca-21; ca-10 and ca-18 were Focus view until they
   became practice cards, below. 2026-10-01: every remaining step ladder —
   ca-1 to ca-8, ca-11, ca-12, ca-17 — got Focus view too.)

   PATHS — `paths: [{ key, label, label_es, blurb, blurb_es }, …]` plus
   `path: '<key>'` on the steps that belong to each path (Jonathan,
   2026-11-04; ca-46). Focus view only. ONE flat `steps` array, as always:
   a tagged step is on its path, an untagged step is SHARED and comes after
   whichever path the student took. The student picks on a chooser card —
   one card per path with its label, blurb, the path's first `strum` board
   as a silent preview, its step names (the shared ones in grey) and a
   Start button — then walks that path's steps and the shared ones, one at
   a time; "Change path" over the steps brings the chooser back. Ticks,
   BPM and drill state hang off a step's FLAT index as before, so a step
   keeps its tick however it is reached and switching paths loses nothing.
   The pick itself is saved with the ticks (`<id>:path:<key>` in caSteps).
   `key` is lower-case letters/digits/hyphens, unique in the activity;
   every path needs at least one step and every `path` tag must name a
   listed path (checks.mjs 1d). 1bb counts the longest route (one path +
   the shared steps), not the flat array. caRoute / caPathChooserHtml in
   app.js; the console preview groups the steps by path.

   CHORD VERSIONS — `chordVersions: { power: { <chord>: { frets, note,
   midi } } }` (optional; Jonathan, 2026-10-16: ca-34, ca-35). The card gets
   a Full chords / Power chords switch. In power mode every chord note whose
   `note` the map names becomes the mapped shape (its `beats` kept), every
   "[A]"-style mark in a string becomes "[A5]", and any field with a
   `_power` twin (`text_power`, `label_power`, `caption_power`,
   `intro_power`, each with its `_power_es`) is shown instead of the base
   field. Same steps, checks, ticks and beats either way — caView in app.js.
   `chordStart: 'power'` opens the card on Power chords until the student
   picks; without it the card opens on Full chords.
   checks.mjs 1d checks the shapes and the `_power` / `_power_es` pairs.

   OPTIONAL — `optional: true` (optional; the only value). The card starts
   out Optional — shown, tagged Optional, never sent to first at sign-in —
   until the teacher switches it to Required on the console board, which
   stores an explicit false in config/class.optionalActivities. A card given
   to individual students (the board's "Who" picker) is Optional by default
   too, with or without this field. (Jonathan, 2026-10-14: ca-34.)
   caIsOptional (app.js), teacherActivityOptional (teacher.js) and
   journeyOptional (tabs/journey.js) read it.

   LIBRARY — `library: true` or `library: false` (optional; any card but an
   exit check; Jonathan, 2026-10-20). Marks the card as a SONG the console
   can move between Class activities and the Songs page ("Move to Songs" /
   "Move to Class activities", stored in config/class.songLibrary, which
   wins over this field). The value is only where it starts: true starts on
   the Songs page, false starts as a class activity. On the Songs page it is
   on the "More Play Along
   songs" list for the WHOLE class as soon as it ships — no board slot,
   release date or "Play Along now" needed, and no #N. A song one student
   asked for goes here too: nobody is assigned anything (Jonathan,
   2026-10-20). A library card is NOT a class activity: it never appears on
   the Class activities board or on In-Class Activities. The teacher
   console's Songs view manages it (Visible / Hidden, Preview, Copy link).
   NEVER on a Core song's card (Jonathan: "those have class activities") —
   caIsLibraryCard (app.js) ignores the field on any card with `journey`,
   `card.wholeSong` or `card.sheet`, and checks.mjs 1bq fails the push if a
   Core song's card is marked, by journey, track or title.

   TEACHER ONLY — `teacherOnly: true` (optional; the only value; Jonathan,
   2026-10-22: "make it only visible to me … a teacher console page"). The
   card is for the teacher to put up on the projector: it is listed only on
   the console's "Teacher view songs" tab, where it plays in full. Students
   never see it — caBoardOrder (app.js) skips it, so it can never be placed
   on the Class activities board, dated, numbered or pinned, and it blocks
   nothing. That tab's "Move to Class activities" button (config/class.
   classSongs, id -> true) puts it on the Class activities board as an
   ordinary card — assigned, dated, Hidden and Who all as usual;
   "Teacher only" (or the board's "Move to Teacher view songs") takes it
   back off. While it is teacher-only, that button is the whole switch. A whole-song teacher-only card carries no
   `journey` / `journeyLayer` (checks.mjs 1bn), so it never stands in for
   its song's real play-along. First one: ca-40.

   METRONOME — `metronome: <bpm>` (optional; whole number, 40–220). Tapping
   the card open starts the Metro tool at that tempo, so every step is
   played to a click. The student can stop it or change the tempo like any
   other time; Play tab still silences it while the answer plays. (Jonathan,
   2026-10-02: ca-21.) checks.mjs 1d checks the range.

   CARD — `view: 'card'` plus a `card` object: the PRACTICE CARD (Jonathan,
   2026-09-27; ca-18 and ca-10). THE DEFAULT FOR EVERY SONG ACTIVITY with a
   backing track (Jonathan, 2026-10-01: ca-18's format "works much better
   for students") — ca-13, ca-19 and ca-20 were rebuilt to it that day.
   ca-18 is the model to match. One screen instead of a ladder: the song's
   tab, one "Play song" button that plays the real backing track and moves
   the tab note by note, a speed control (with `slowest: true`, which every
   card has, a four-stop slider — Slowest / Slower / Slow / Normal — whose
   only visible words are "Slower" at the left end and "Normal" at the
   right, opening on the Slower stop; without it, a Slower / Normal
   switch), the Metronome (a click on every counted beat, made by the
   site), a Guitar switch where the track has a full mix, and three or four
   checkboxes. The slides teach the rungs; the card is what students
   practise with. No practice card has a help ladder any more (Jonathan,
   2026-10-07): `steps: []`, which checks.mjs 1d allows only on a
   `view: 'card'` activity, so "More practice help" never renders.
   Complete = every numbered check ticked; Level up is extra. Shape
   (caCardBodyHtml / pcLayout in app.js; checks.mjs 1bf):
     card: {
       track: 'the-cure',                  // a SNIPPET_TRACKS key
       caption, caption_es,                // the tab's heading
       slowest: true,                      // optional: a Slowest option beside
                                           // Slower / Slow / Normal — the slow file at
                                           // 0.8x, pitch held (ca-18, ca-10)
       wholeSong: true,                    // optional: stop at the end of the
                                           // song instead of looping — for a
                                           // card that IS the whole record
                                           // (ca-24 to ca-33)
       counts: true,                       // optional (ca-29, 2026-10-21): a
                                           // Counts switch in the TAB head, off
                                           // by default, that shows the count
                                           // each note starts on ("1 + 2 + 3 + 4 +")
                                           // under the TAB. Worked out from the
                                           // notes' beats — nothing to type. Only
                                           // for the sections that are NOT a chord
                                           // grid (below): a grid always shows its
                                           // count, and a card made only of grid
                                           // sections shows no switch (ca-41 keeps
                                           // it for its single-note verses).
       chordGrid: true,                    // optional (2026-10-26, Jonathan): draw
                                           // the card's CHORD sections as a chord
                                           // grid. The record's strumming is not
                                           // consistent through a song and the
                                           // strum patterns are taught on the
                                           // slides, so the TAB stops drawing
                                           // every strum: each chord appears ONCE,
                                           // at the beat or "+" where it really
                                           // starts (consecutive same-name notes
                                           // fold into one), four bars to a row
                                           // whatever the meter, a bar line
                                           // between bars, and the cursor moves on
                                           // the BEATS only (data-beat), never on
                                           // a "+". Display only: no `notes`
                                           // array changes, so audio, beat totals
                                           // and the Journey whole-song tabs stay.
                                           // Explicit, never inferred: a riff
                                           // played as chords (ca-31) is not one.
                                           // A section holds only chords and rests
                                           // and every chord starts on an eighth
                                           // (checks.mjs 1bv). Single-note cards
                                           // never set it. `rows` without
                                           // rowLabels are ignored (four-bar rows);
                                           // a lyric line (rowLabels) keeps its row
                                           // where it starts on a bar line.
                                           // Chord cards say "change chords where
                                           // each chord name starts" — each name is
                                           // drawn once (ca.cardChordDirections).
       everyStrum: true,                   // optional (ca-29 and its Neil Young
                                           // version, 2026-10-28 / 10-30): keep
                                           // consecutive same-name notes as
                                           // separate events, so every strum
                                           // shows its chord name. Such a card
                                           // says "every strum shows its chord
                                           // name" (ca.cardStrumDirections), never
                                           // the each-name-once line.
       sheet: 'sheets/<song>.pdf',         // optional (ca-38, 2026-10-19): show
                                           // this chord sheet PDF instead of the
                                           // tab, drawn as is (lyrics included),
                                           // with a dot on the chord being played.
                                           // The sheet's chord names, in reading
                                           // order, must be one per chord CHANGE
                                           // in the notes. sheetChords: <n> says
                                           // how many the sheet has; checks.mjs
                                           // 1bf2 holds the notes to it, and the
                                           // console preview checks the PDF. A
                                           // sheet card has no `journey` — it is
                                           // not its layer's play-along (1bn).
                                           // Every page of the PDF is read and
                                           // stacked (2026-11-03).
       sheetColumns: 1,                    // optional (ca-44, 2026-11-03): the
                                           // sheet is ONE column of chords over
                                           // lyrics — read line by line, no
                                           // gutter. Left out = two columns,
                                           // each page left column first (ca-38,
                                           // ca-45).
       sheetNamedAgain: ['Verse 1'],       // optional (ca-45, 2026-11-03): sections
                                           // where the sheet names the first
                                           // chord of every lap, even while it
                                           // is still ringing; the dot steps onto it.
                                           // Counts in sheetChords (1bf2).
       sections: [{                        // back to back, in song order
         label, label_es,                  // the tap-to-start button ("Chorus")
         caption, caption_es,              // the heading over its tab page
         chordGrid: false,                 // optional: leave THIS section as a
                                           // note-by-note tab on a chordGrid card
                                           // (ca-41's verses, ca-35's solo)
         lineEnd: true, // optional: on the Song Journey page's whole-song tab the next section starts a new line
         fromBar: 21, bars: 8,             // bars of the RECORD, felt pulse,
                                           // like a snippet window
         rows: [7, 9],                     // optional: notes per tab row, to
                                           // end a row where the phrase ends
                                           // (must add up to notes.length)
         rowLabels, rowLabels_es,          // optional, with rows: one line printed
                                           // over each row — the lyric (ca-35)
         reps: 2, repLabel, repLabel_es,   // optional: the band plays these
                                           // notes `reps` times; the tab shows
                                           // them once, with "Verse 1 of 2"
         notes: [ { string, fret, note, midi, beats? } ],  // one pass;
                                           // a power chord is { frets:
                                           // [['D', 2], ['A', 0]], note: 'A5',
                                           // midi: [52, 45], beats? } (ca-29..33);
                                           // beats must add up to bars x the
                                           // track's beatsPerBar; a REST is
                                           // { rest: true, beats } — an empty
                                           // column the highlight still stops
                                           // on, so the next note lights on
                                           // time (ca-41's verses, 2026-10-25).
                                           // A chord grid draws a rest as the
                                           // word "Stop"; restWord: false on the
                                           // card leaves the gap empty (ca-29)
       }],
       checks: [
         { label, label_es, text, text_es },            // numbered checks
         { levelUp: true, text, text_es },               // last, exactly one;
         // slot: n (optional) keeps the tick key `<id>:c<n>` a check had
         // before earlier checks were removed (ca-25)
         // card: 'ca-N' (optional, Level up only) — a button that opens that
         // practice card. It renders only once the target is posted or set
         // to Play Along now (caCardLinkHtml). The text is one line that
         // names the card ("Play the whole song on the Whole Song card.");
         // the old "once it is posted" / "cuando esté publicada" went with
         // the one-line rule (2026-11-10)
       ],                                  // the only place the Song Journey
     }                                     // page may be named (its button
                                           // renders there)

   FOUR STEPS — A SOFT RULE (Jonathan, 2026-09-25; made soft 2026-10-01):
   aim for four steps or fewer — usually Learn / Practice pairs ending on an
   open-ended Practice rung. It is a default, not a limit: go past four when
   Jonathan asks for it (ca-21 has six). checks.mjs 1bb prints a reminder
   for every card over four and never fails the push on it.

   LONG TABS PAGE TWO LINES AT A TIME, by default (same day). Every
   class-activity tab longer than two rendered rows shows two rows with
   Previous / Next, and Play tab (or a sibling band snippet) turns the page
   as it plays — CA_TAB_LINES_PER_PAGE / buildPagedTabBody in app.js,
   passed by BOTH renderers. Nothing to write in the data: a tab's own
   `linesPerPage` overrides it, and `linesPerPage: 0` opts one tab out.
   `revealDelay: <seconds>` on a tab is separate and per tab: it hides the
   board while the student reads the step, and drops the Play tab button —
   so leave it OFF any tab whose Play tab is the answer key (ca-21) or the
   only demo of how long a note rings (a Learn step with held notes).

   ids are PERMANENT — never renumber or reuse one. Student completion is
   keyed to the id in Firestore (classActivities: { [id]: true }), same rule
   as skill ids in the module files. An id is `ca-<n>` where n is simply the
   next integer never yet used (max existing + 1) — an authoring counter, not
   a display number.

   RETIRED IDS — never hand these to a new activity: `ca-9` ("Happy Birthday
   — Finish the Song") was pulled from this array on 2026-08-25 when `ca-1`
   was widened to cover the whole song; its steps live on inside `ca-1`, and
   the original is in git history. That makes the counter max-EVER-used + 1,
   NOT max-in-file + 1 — the next new activity is `ca-43` (ca-42 is the
   highest used as of 2026-10-26; check the file first). Any student who
   had already ticked `ca-9` keeps a harmless orphan key in Firestore.
   `ca-16` ("Happy Birthday — The A-String Way") went the same way on
   2026-09-16: its steps were merged into `ca-17`, after the A-string note
   names. Same orphan-key story for anyone who had ticked it.
   `ca-47` ("Strum Pattern in Chunks") was merged into `ca-46` as its
   "chunks" path on 2026-11-04 (no student had opened either); `ca-48` is
   "Call the Chord" (2026-11-05); `ca-49` is "Name the Power Chord"
   (2026-11-05); `ca-50` is "Call the Chord: "the cure"" (2026-11-05);
   `ca-51` is the "Perdón Mamá" play-along card (2026-11-09);
   the next new activity is `ca-52`.

   ORDER AND MODULE PLACEMENT LIVE ON THE CONSOLE BOARD, NOT IN THIS FILE
   (2026-09-16). config/class.activityBoard — { id -> { module, pos } },
   written by the two-column Class activities board in teacher.js — decides
   which module an activity sits in, what order the cards come in, and the
   "#N - " prefix students read. An activity with no entry there is BUILT:
   pushed to the site, not placed in the course, invisible to everyone.

   `number` is therefore LEGACY and optional on a new entry. It survives as
   one thing only: the tiebreak that seeds the board the first time, for a
   class that has never had one (see caBoardOrder in app.js). Leave the
   existing values alone, don't bother resequencing them, and don't add one
   to a new activity unless you want it to land somewhere specific in that
   one-time seeding. checks.mjs (1d) no longer requires it or checks it for
   a 1..N run; it still enforces id uniqueness, which is the thing students'
   progress is actually keyed to. Renumbering ids is still the one edit that
   would break saved progress; don't.

   A NUMBER BAKED INTO A TITLE IS A SERIES NUMBER, NOT A COURSE POSITION.
   Some activities come in a named series ("Finger Gym 1", "Finger Gym 2",
   …). That digit counts within the series — the first Finger Gym is Finger
   Gym 1 even when the class meets it as activity #3 — so it does NOT track
   the "#N" the board hands out and does NOT move when the board is
   reordered (Jonathan, 2026-08-20). "#3 - Finger Gym 1" is correct and
   intended; the prefix says where we are in the course, the title says which
   Gym it is.

   What a series DOES have to be is 1..N, with no gaps, duplicates or
   backwards jumps — checks.mjs (1l) groups titles by the words before the
   digit, sorts by NUMERIC ID (a series is authored in order, and ids never
   move), and fails the push if the series digits don't read 1, 2, 3, …, in
   EN and ES separately. Inserting a new Gym in the middle therefore does
   mean retyping the digit in every later Gym's `title` AND `title_es`, and
   chasing any "same as Gym 1" / "del Gimnasio 1" cross-reference in another
   activity's step text.

   RENAMES FROM THE CONSOLE — the teacher can rename an activity from the
   Class activities table, which writes config/class.activityTitles as
   { id -> { en, base } } and shows that name to students immediately, in
   BOTH languages (Jonathan doesn't write Spanish, and a stale correct-Spanish
   name would be worse than a fresh English one). `base` is the shipped title
   the rename was typed against, and the override applies only while
   `title` still equals it. So folding a rename in here — set `title` to the
   new name, write a real `title_es` — expires the override automatically;
   there's no Firestore cleanup step and no way for an old console rename to
   shadow a newly translated title. If you see a name in the console that
   isn't in this file, that's a rename waiting to be folded in. See caTitle()
   in app.js and teacherActivityTitle() in teacher.js.

   ORDERING FROM THE CONSOLE is the board, and there is nothing to fold back
   in here afterwards — unlike a rename, the board IS the record. Drag a card
   between modules or within one, or type over its "#N"; both write
   config/class.activityBoard and students see the new order and numbering
   immediately, in both languages. The old activityNumbers overrides are
   retired: nothing writes them any more and only the one-time board seeding
   still reads them. See caBoardOrder()/caNumber() in app.js and
   teacherMoveActivity() in teacher.js.

   Every display string carries an `_es` twin, same convention as module
   files — rendered through tf(obj, field) in app.js (see the "field on a
   Set/skill/song/etc." comment there). Never ship an English-only string;
   add both in the same edit.

   SCHEMA
   {
     id:      'ca-17',           // permanent — next unused 'ca-<n>' counter
     number:  3,                 // OPTIONAL, legacy — see above. The "#N"
                                  // a student sees comes from the console
                                  // board now; this only seeds a board that
                                  // has never been written. Never bake a
                                  // "#N - " prefix into title itself.
     title:    'Power Chord Relay',
     title_es: 'Relevo de acordes de potencia',
     intro:    'ONE short line, verb first: what the student plays today.',
                 // (Jonathan, 2026-11-10: every direction in an activity is
                 // one line — "students don't read them anyway". checks.mjs
                 // 1cs caps the length; see "ONE LINE" below.)
     intro_es: '…',
     // OPTIONAL — a rough minutes estimate, rendered by caChunkMetaHtml()
     // (app.js) as "· about {n} min" on the collapsed card, alongside the
     // step count. No default and no formula: leave it unset unless you
     // actually know how long the activity runs (practice-chunks work
     // order, 2026-09-19 — don't invent a value for an existing activity).
     minutes:  15,
     steps: [
       {
         // OPTIONAL step head. Without it the head reads "Step 4"; with it,
         // "Step 4: Tune it back". Plain escaped text, a few words, no
         // markup and no "Step N" prefix of its own — the renderer adds
         // that. Worth having on a long ladder a student navigates by
         // jumping around (a circuit); pointless on a short one they just
         // walk top to bottom. Rendered by caStepHeadText() in app.js AND
         // renderTeacherActivityDetail() in teacher.js — two renderers,
         // patch both (see CLAUDE.md).
         label:    'Tune it back',
         label_es: 'Vuelve a afinar',
         // text renders as TRUSTED HTML (same trust level as module step
         // content — first-party authored files, not escaped).
         // ONE LINE (Jonathan, 2026-11-10: "students don't read them
         // anyway"). Every step text, intro, check text and bassDirections in
         // this file is ONE sentence, verb first, with what to play and the
         // finish line together: "Play Line 1 into Line 2 four times without
         // stopping." It is one rendered line at 1366x657 in English and
         // Spanish (checks.mjs 1cs caps the length). No <ol>/<ul>, no
         // "You've got it when:" / "Lo tienes cuando:" label, no fix-it line,
         // no definition (use the plain word). KEEP THE COUNT: the tap dots
         // are read from the whole line (caStepHtml passes wholeLine to
         // wrapGotItWhen; repCountFromGotIt reads a digit or two–five /
         // dos–cinco before "times / in a row / back to back / veces /
         // seguidas"), and 1bg holds English and Spanish to the same count.
         // A step whose drill widget already says what to do AND when it is
         // done carries no text (ca-23: its pass line is under Start). The
         // "Name the fret" shuffle steps keep one line, the finish line the
         // drill does not show: "Get 7 of 10 on your first pass, then try for
         // 9 of 10." Modules keep the
         // list and got-it rules (CLAUDE.md). The Learn / Practice labels
         // (2026-09-23: "Learn — " / "Aprende — ", "Practice — " /
         // "Practica — ") still name the steps of the newer ladders.
         text:    'One line: what to play and when it counts as done.',
         text_es: '…',
         // Optional — a step can carry video and/or tab together:
         video:  { id: 'YOUTUBE_ID', start: 45,       // oEmbed-verified at
                   label: 'Fingerstyle guitar',         // authoring time, NEVER
                   label_es: 'Guitarra fingerstyle' },  // from memory (see
                                                         // CLAUDE.md "Videos").
                                                         // label/label_es are
                                                         // optional — falls
                                                         // back to the
                                                         // generic "Watch"
                                                         // button text.
         // Activities carry no figures (Jonathan, 2026-09-23). No "map" /
         // orientation step of any kind — a step is a Learn step (look,
         // listen, say) or a Practice step (one thing, one standard). The
         // tab is the picture. checks.mjs 1d errors on any `figure` key.
         tab: {                                      // optional — same spec
           caption: '…', caption_es: '…',             // shape as module step
           // either notes: [...] directly, or phrases: [{ label, label_es,
           // notes: [...] }, …]; each note is { string, fret, note, midi }
           // (string one of e/B/G/D/A/E). Renders via the existing
           // buildTab() — Play-tab, BPM control, beat cursor, Listening
           // Coach button all come for free, no new audio code.
           // Optional `finger: 1-4` on a note swaps the note-name button
           // under that column for the fretting finger in a light-purple
           // circle — the Finger Gym convention (fret on the line, circled
           // finger below, NO note name; Jonathan 2026-08-26, matching the
           // Finger Gym teacher deck). Keep `note` anyway — the Coach card
           // and the button tooltip still use it. Fingering rule: finger =
           // fret within the hand position, a shift restarts at finger 1,
           // the Spiders repeat 1-2-3-4 every round. checks.mjs (1c) fails
           // the push on a finger outside 1-4.
           notes: [ { string: 'E', fret: 0, note: 'E', midi: 40 } ],
         },
         // Optional — a drawn strum pattern instead of a tab (ca-46,
         // Jonathan 2026-11-03): arrows over the count, the chord name over
         // each bar, ▶ Play strum sounds it with the tab's cursor. Built by
         // buildStrum() in app.js for both step renderers; checks.mjs 1d
         // recomputes every chord's midi from its frets.
         strum: {
           caption: '…', caption_es: '…',
           pattern: 'D.DU.UDU',   // 8 eighth notes (1 + 2 + 3 + 4 +): D down, U up,
                                  // . the hand moves but misses, - a stop (the hand
                                  // waits for the next 1); starts on D or U
           chords: { D5: { frets: [['A', 5], ['D', 7], ['G', 7]], midi: [50, 57, 62] } },
           bars: ['D5', 'D5'],    // one chord name per bar, each one in `chords`
           barsPerRow: 4,         // optional: 1, 2 or 4 bars to a row (default 2)
         },
         // Optional — the real backing track, looping the exact bars this
         // step drills, so a student practising eight bars of the verse
         // hears those eight bars over and over instead of being turned
         // loose on the whole five-minute record.
         //
         // The window is in BARS of the song, counted from bar 1, using the
         // FELT pulse the course teaches ("the cure" reads 144 BPM and the
         // room counts 72, one chord per bar). Put it on the step whose tab
         // it matches and make the two agree: an eight-bar tab wants an
         // eight-bar window, or the loop comes round while the student is
         // mid-phrase and they will assume they are the ones who are wrong.
         //
         // `track` is a key of SNIPPET_TRACKS in app.js, which holds the
         // mp3 paths (fast and slow rhythm-down mixes, plus an optional
         // fast/slow full-mix pair for the Guitar toggle), the tempo
         // arithmetic, and the one measured number — the track's `anchor`,
         // its first downbeat — that places every window on every step of
         // that song. There are no metronome mp3s (deleted 2026-10-01): the
         // site makes the click itself. The card renders Slowest, Slow
         // (turtle), Metronome and, where a full mix exists, Guitar toggles
         // off the same files the Song Journey page uses, and the student
         // can only ever hear one thing at a time: starting the band stops
         // the tab player, and starting the tab stops the band.
         //
         // Built by buildSnippet() in app.js, called from caStepHtml()
         // there AND from renderTeacherActivityDetail() in teacher.js —
         // one builder, so a step field cannot go invisible in the
         // teacher's preview (CLAUDE.md, two renderers). Validated by
         // checks.mjs 1ak: unknown track, a non-positive fromBar/bars, or
         // a window running off the end of the file fails the push.
         snippet: { track: 'the-cure', fromBar: 5, bars: 8,
                    label:    'The verse, with the band',
                    label_es: 'La estrofa, con la banda' },
       },
       // …
     ],
   }

   ── EXIT CHECKS (kind: 'check') ──
   A check is an activity with `kind: 'check'`, no `number`, no `steps`, and
   a `check` object. It is dated/hidden/renamed from the console like any
   other activity. It never takes a #N slot — the student sees
   "Exit check · <title>" (i18n `check.prefix`), so don't bake that prefix
   into `title` any more than you'd bake in "#N - ". Result lands on
   progress/{uid}.exitChecks[id] = { score, total, picks, at, attempts } and
   also sets classActivities[id] = true, so the console's existing Done
   count keeps working. One try unless `retake: true`.

   The body is the quiz — a check has no step ladder, no print button and no
   "Mark complete" button, because submitting IS the completion. Engine is
   the ec* functions in app.js; the student card and the teacher console's
   preview share caCheckBodyHtml() on purpose (see CLAUDE.md — this is one
   card, not a new step field, so there is nothing to fork). checks.mjs (1y)
   recomputes every answer key from the fretboard, so a typo in an `answer`
   fails the push rather than marking a right answer wrong in class.

   {
     id:    'ca-14',
     kind:  'check',
     title: '…', title_es: '…',
     intro: '…', intro_es: '…',
     check: {
       type: 'nextNote',            // 'nextNote' | 'noteName'
       bpm: 80,                     // nextNote only; playback tempo
       retake: false,               // optional — unlimited retries, latest kept
       // nextNote items — the site plays `notes` and shows their frets, the
       // student picks the note that comes next. Each note is the same
       // { string, fret, note, midi } shape a step `tab` uses, and midi must
       // equal OPEN[string] + fret (1y checks it).
       items: [
         { label: '…', label_es: '…',
           notes:  [ { string:'E', fret:0, note:'E', midi:40 }, … ],   // played + shown
           answer: { string:'E', fret:5, note:'A', midi:45 },           // the next note
           choices: [ { fret:5, note:'A' }, { fret:4, note:'G#' }, … ] // >=3, distinct
                                    // frets, exactly one matching `answer`,
                                    // shuffled at render by mcOrder
         }
       ]
       // noteName items — one fret lights up on the string diagram with its
       // name hidden, the student names it. Choices are always the seven
       // naturals A–G in alphabetical order, NOT shuffled (same tap-the-name
       // row as the shuffle drill), so items carry no `choices`.
       //   string: 'lowE'  (diagram kind — lowE|A|D|G|B|highE — at check level)
       //   items: [ { fret: 3, answer: 'G' }, … ]
     }
   }

   The schema above is documentation, not a template to copy live.
   ════════════════════════════════════════════════════════════════════ */
window.CLASS_ACTIVITIES = [
  {
    id:    'ca-1',
    view:  'focus',   // one step at a time — see VIEW above (added 2026-10-01)
    number: 2,
    title:    'Playing Happy Birthday — The Whole Song',
    title_es: 'Tocando Happy Birthday — La canción completa',
    intro:    'Play all four lines on the low E string: the melody goes up to fret 12 and comes back down.',
    intro_es: 'Toca las cuatro líneas en la cuerda Mi grave: la melodía sube hasta el traste 12 y vuelve a bajar.',
    steps: [
      {
        label:    'Lines 1 and 2',
        label_es: 'Líneas 1 y 2',
        text: 'Play Line 1 into Line 2 four times without stopping.',
        text_es: 'Toca de la Línea 1 a la Línea 2, cuatro veces seguidas, sin detenerte.',
        tab: {
          caption: 'First half · Lines 1 and 2',
          caption_es: 'Primera mitad · Líneas 1 y 2',
          phrases: [
            {
              label: 'Line 1 — "Hap-py birth-day to you"',
              label_es: 'Línea 1 — "Hap-py birth-day to you"',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 5, note: 'A',  midi: 45 },
                { string: 'E', fret: 4, note: 'G#', midi: 44, beats: 2 }
              ]
            },
            {
              label: 'Line 2 — "Hap-py birth-day to you" (the ending climbs higher)',
              label_es: 'Línea 2 — "Hap-py birth-day to you" (el final sube más alto)',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 7, note: 'B',  midi: 47 },
                { string: 'E', fret: 5, note: 'A',  midi: 45, beats: 2 }
              ]
            }
          ]
        },
      },
      {
        label:    'Higher landing marks',
        label_es: 'Marcas más altas',
        text: 'Land on fret 12 and fret 9 without searching for them, three times in a row.',
        text_es: 'Cae en el traste 12 y en el 9 sin andarlos buscando, tres veces seguidas.',
        tab: {
          caption: 'Find the dots · open, 12, 9, 5',
          caption_es: 'Encuentra los puntos · al aire, 12, 9, 5',
          notes: [
            { string: 'E', fret: 0,  note: 'E',  midi: 40 },
            { string: 'E', fret: 12, note: 'E',  midi: 52 },
            { string: 'E', fret: 9,  note: 'C#', midi: 49 },
            { string: 'E', fret: 5,  note: 'A',  midi: 45 }
          ]
        },
      },
      {
        label:    'Line 3',
        label_es: 'Línea 3',
        text: 'Play Line 3, the biggest jump in the song, four times without stopping.',
        text_es: 'Toca la Línea 3, el salto más grande de la canción, cuatro veces seguidas, sin detenerte.',
        tab: {
          caption: 'Line 3 · low E string only',
          caption_es: 'Línea 3 · solo la cuerda Mi grave',
          notes: [
            { string: 'E', fret: 0,  note: 'E',  midi: 40, beats: 0.5 },
            { string: 'E', fret: 0,  note: 'E',  midi: 40, beats: 0.5 },
            { string: 'E', fret: 12, note: 'E',  midi: 52 },
            { string: 'E', fret: 9,  note: 'C#', midi: 49 },
            { string: 'E', fret: 5,  note: 'A',  midi: 45 },
            { string: 'E', fret: 4,  note: 'G#', midi: 44 },
            { string: 'E', fret: 2,  note: 'F#', midi: 42, beats: 2 }
          ]
        },
      },
      {
        label:    'Line 4',
        label_es: 'Línea 4',
        text: 'Play Line 3 into Line 4 four times without stopping.',
        text_es: 'Toca de la Línea 3 a la Línea 4, cuatro veces seguidas, sin detenerte.',
        tab: {
          caption: 'Line 4 · low E string only',
          caption_es: 'Línea 4 · solo la cuerda Mi grave',
          notes: [
            { string: 'E', fret: 10, note: 'D',  midi: 50, beats: 0.5 },
            { string: 'E', fret: 10, note: 'D',  midi: 50, beats: 0.5 },
            { string: 'E', fret: 9,  note: 'C#', midi: 49 },
            { string: 'E', fret: 5,  note: 'A',  midi: 45 },
            { string: 'E', fret: 7,  note: 'B',  midi: 47 },
            { string: 'E', fret: 5,  note: 'A',  midi: 45, beats: 2 }
          ]
        },
      },
      {
        label:    'The whole song',
        label_es: 'La canción completa',
        text: 'Play the whole song without stopping and raise the BPM by 10 three times.',
        text_es: 'Toca la canción completa sin detenerte y sube el BPM 10 puntos tres veces.',
        tab: {
          // Off the site-wide paging default: the directions say "no stopping
          // in between," so a Next click hidden behind a paged-away Line 3/4
          // would contradict the step's own instruction (2026-09-25 audit).
          linesPerPage: 0,
          caption: 'Whole song · Lines 1–4 · low E string only',
          caption_es: 'Canción completa · Líneas 1–4 · solo la cuerda Mi grave',
          phrases: [
            {
              label: 'Line 1 — "Hap-py birth-day to you"',
              label_es: 'Línea 1 — "Hap-py birth-day to you"',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 5, note: 'A',  midi: 45 },
                { string: 'E', fret: 4, note: 'G#', midi: 44, beats: 2 }
              ]
            },
            {
              label: 'Line 2 — "Hap-py birth-day to you" (the ending climbs higher)',
              label_es: 'Línea 2 — "Hap-py birth-day to you" (el final sube más alto)',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 7, note: 'B',  midi: 47 },
                { string: 'E', fret: 5, note: 'A',  midi: 45, beats: 2 }
              ]
            },
            {
              label: 'Line 3 — "Hap-py birth-day dear ______"',
              label_es: 'Línea 3 — "Hap-py birth-day dear ______"',
              notes: [
                { string: 'E', fret: 0,  note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 0,  note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 12, note: 'E',  midi: 52 },
                { string: 'E', fret: 9,  note: 'C#', midi: 49 },
                { string: 'E', fret: 5,  note: 'A',  midi: 45 },
                { string: 'E', fret: 4,  note: 'G#', midi: 44 },
                { string: 'E', fret: 2,  note: 'F#', midi: 42, beats: 2 }
              ]
            },
            {
              label: 'Line 4 — "Hap-py birth-day to you"',
              label_es: 'Línea 4 — "Hap-py birth-day to you"',
              notes: [
                { string: 'E', fret: 10, note: 'D',  midi: 50, beats: 0.5 },
                { string: 'E', fret: 10, note: 'D',  midi: 50, beats: 0.5 },
                { string: 'E', fret: 9,  note: 'C#', midi: 49 },
                { string: 'E', fret: 5,  note: 'A',  midi: 45 },
                { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                { string: 'E', fret: 5,  note: 'A',  midi: 45, beats: 2 }
              ]
            }
          ]
        },
      },
    ],
  },
  {
    id:    'ca-2',
    view:  'focus',   // one step at a time — see VIEW above (added 2026-10-01)
    number: 3,
    title:    'Finger Gym 1',
    title_es: 'Gimnasio de Dedos 1',
    intro:    'Train three events in the first five frets: the Ladder, the Spider and the Reach.',
    intro_es: 'Entrena tres eventos en los primeros cinco trastes: la Escalera, la Araña y el Estiramiento.',
    steps: [
      {
        label:    'The Ladder',
        label_es: 'La Escalera',
        text: 'Play the Ladder at 50 BPM with no buzz, three times in a row.',
        text_es: 'Toca la Escalera a 50 BPM sin zumbido, tres veces seguidas.',
        tab: {
          caption: 'The Ladder · position 1',
          caption_es: 'La Escalera · posición 1',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41, finger: 1 },
            { string: 'E', fret: 2, note: 'F#', midi: 42, finger: 2 },
            { string: 'E', fret: 3, note: 'G',  midi: 43, finger: 3 },
            { string: 'E', fret: 4, note: 'G#', midi: 44, finger: 4 }
          ]
        },
      },
      {
        label:    'The Ladder shift',
        label_es: 'El cambio de la Escalera',
        text: 'Play two full climbs back to back with the one-fret shift, thumb behind the neck.',
        text_es: 'Toca dos subidas completas seguidas con el cambio de un traste, pulgar detrás del mástil.',
        tab: {
          caption: 'The Ladder · with the shift',
          caption_es: 'La Escalera · con el cambio',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41, finger: 1 },
            { string: 'E', fret: 2, note: 'F#', midi: 42, finger: 2 },
            { string: 'E', fret: 3, note: 'G',  midi: 43, finger: 3 },
            { string: 'E', fret: 4, note: 'G#', midi: 44, finger: 4 },
            { string: 'E', fret: 2, note: 'F#', midi: 42, finger: 1 },
            { string: 'E', fret: 3, note: 'G',  midi: 43, finger: 2 },
            { string: 'E', fret: 4, note: 'G#', midi: 44, finger: 3 },
            { string: 'E', fret: 5, note: 'A',  midi: 45, finger: 4 }
          ]
        },
      },
      {
        label:    'The Spider',
        label_es: 'La Araña',
        text: 'Play the Spider once with every note on the right string, at any speed.',
        text_es: 'Toca la Araña una vez con cada nota en la cuerda correcta, a cualquier velocidad.',
        tab: {
          caption: 'The Spider · cross the strings',
          caption_es: 'La Araña · cruza las cuerdas',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41, finger: 1 },
            { string: 'A', fret: 2, note: 'B',  midi: 47, finger: 2 },
            { string: 'E', fret: 3, note: 'G',  midi: 43, finger: 3 },
            { string: 'A', fret: 4, note: 'C#', midi: 49, finger: 4 },
            { string: 'E', fret: 2, note: 'F#', midi: 42, finger: 1 },
            { string: 'A', fret: 3, note: 'C',  midi: 48, finger: 2 },
            { string: 'E', fret: 4, note: 'G#', midi: 44, finger: 3 },
            { string: 'A', fret: 5, note: 'D',  midi: 50, finger: 4 }
          ]
        },
      },
      {
        label:    'The Reach',
        label_es: 'El Estiramiento',
        text: 'Reach with your pinky four times in a row, finger 1 down; one fret short counts, and stop if it hurts.',
        text_es: 'Estira el meñique cuatro veces seguidas, dedo 1 abajo; un traste menos cuenta; si duele, detente.',
        tab: {
          caption: 'The Reach · finger 1 stays down',
          caption_es: 'El Estiramiento · el dedo 1 no se levanta',
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41, finger: 1 },
            { string: 'E', fret: 5, note: 'A', midi: 45, finger: 4 },
            { string: 'E', fret: 1, note: 'F', midi: 41, finger: 1 },
            { string: 'E', fret: 5, note: 'A', midi: 45, finger: 4 }
          ]
        },
      },
      {
        label:    'The circuit',
        label_es: 'El circuito',
        text: 'Play two clean sets in a row (each event 4 times), the second 10 BPM faster.',
        text_es: 'Toca dos series limpias seguidas (cada evento 4 veces), la segunda 10 BPM más rápida.',
      },
    ],
  },
  {
    id:    'ca-3',
    view:  'focus',   // one step at a time — see VIEW above (added 2026-10-01)
    number: 5,
    title:    'Finger Gym 2 — Down the Ladder',
    title_es: 'Gimnasio de Dedos 2 — Bajando la Escalera',
    intro:    'Play the Ladder back down, pinky first, then take it onto all six strings.',
    intro_es: 'Toca la Escalera de bajada, primero el meñique, y después llévala a las seis cuerdas.',
    steps: [
      {
        label:    'Down the Ladder',
        label_es: 'Bajando la Escalera',
        text: 'Play the Ladder backwards at 50 BPM with no buzz, three times in a row.',
        text_es: 'Toca la Escalera al revés a 50 BPM sin zumbido, tres veces seguidas.',
        tab: {
          caption: 'Down the Ladder · pinky leads',
          caption_es: 'Bajando la Escalera · el meñique va primero',
          notes: [
            { string: 'E', fret: 4, note: 'G#', midi: 44, finger: 4 },
            { string: 'E', fret: 3, note: 'G',  midi: 43, finger: 3 },
            { string: 'E', fret: 2, note: 'F#', midi: 42, finger: 2 },
            { string: 'E', fret: 1, note: 'F',  midi: 41, finger: 1 }
          ]
        },
      },
      {
        label:    'Up and back',
        label_es: 'Subir y bajar',
        text: 'Climb up and straight back down, the top note once, four times without stopping.',
        text_es: 'Sube y baja de inmediato, la nota de arriba una sola vez, cuatro veces seguidas sin detenerte.',
        tab: {
          caption: 'Up and back · one turnaround',
          caption_es: 'Subir y bajar · una vuelta',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41, finger: 1 },
            { string: 'E', fret: 2, note: 'F#', midi: 42, finger: 2 },
            { string: 'E', fret: 3, note: 'G',  midi: 43, finger: 3 },
            { string: 'E', fret: 4, note: 'G#', midi: 44, finger: 4 },
            { string: 'E', fret: 3, note: 'G',  midi: 43, finger: 3 },
            { string: 'E', fret: 2, note: 'F#', midi: 42, finger: 2 },
            { string: 'E', fret: 1, note: 'F',  midi: 41, finger: 1 }
          ]
        },
      },
      {
        label:    'New strings',
        label_es: 'Cuerdas nuevas',
        text: 'Play the same climb on the A string, then the D string, with no buzz, three times in a row.',
        text_es: 'Toca la misma subida en la cuerda La y después en la cuerda Re, sin zumbido, tres veces seguidas.',
        tab: {
          caption: 'A string, then D string',
          caption_es: 'Cuerda La, después cuerda Re',
          notes: [
            { string: 'A', fret: 1, note: 'A#', midi: 46, finger: 1 },
            { string: 'A', fret: 2, note: 'B',  midi: 47, finger: 2 },
            { string: 'A', fret: 3, note: 'C',  midi: 48, finger: 3 },
            { string: 'A', fret: 4, note: 'C#', midi: 49, finger: 4 },
            { string: 'D', fret: 1, note: 'D#', midi: 51, finger: 1 },
            { string: 'D', fret: 2, note: 'E',  midi: 52, finger: 2 },
            { string: 'D', fret: 3, note: 'F',  midi: 53, finger: 3 },
            { string: 'D', fret: 4, note: 'F#', midi: 54, finger: 4 }
          ]
        },
      },
      {
        label:    'Thin strings',
        label_es: 'Cuerdas delgadas',
        text: 'Play the climb on the G, B and high e strings without stopping, at any speed.',
        text_es: 'Toca la subida en las cuerdas Sol, Si y mi aguda sin detenerte, a cualquier velocidad.',
        tab: {
          caption: 'G · B · high e — thin strings buzz easier',
          caption_es: 'Sol · Si · mi aguda — las delgadas zumban más fácil',
          notes: [
            { string: 'G', fret: 1, note: 'G#', midi: 56, finger: 1 },
            { string: 'G', fret: 2, note: 'A',  midi: 57, finger: 2 },
            { string: 'G', fret: 3, note: 'A#', midi: 58, finger: 3 },
            { string: 'G', fret: 4, note: 'B',  midi: 59, finger: 4 },
            { string: 'B', fret: 1, note: 'C',  midi: 60, finger: 1 },
            { string: 'B', fret: 2, note: 'C#', midi: 61, finger: 2 },
            { string: 'B', fret: 3, note: 'D',  midi: 62, finger: 3 },
            { string: 'B', fret: 4, note: 'D#', midi: 63, finger: 4 },
            { string: 'e', fret: 1, note: 'F',  midi: 65, finger: 1 },
            { string: 'e', fret: 2, note: 'F#', midi: 66, finger: 2 },
            { string: 'e', fret: 3, note: 'G',  midi: 67, finger: 3 },
            { string: 'e', fret: 4, note: 'G#', midi: 68, finger: 4 }
          ]
        },
      },
      {
        label:    'The circuit',
        label_es: 'El circuito',
        text: 'Play two clean sets in a row on all six strings, the second 10 BPM faster.',
        text_es: 'Toca dos series limpias seguidas en las seis cuerdas, la segunda 10 BPM más rápida.',
      },
    ],
  },
  {
    id:    'ca-4',
    view:  'focus',   // one step at a time — see VIEW above (added 2026-10-01)
    number: 6,
    title:    'Finger Gym 3 — Up the Neck',
    title_es: 'Gimnasio de Dedos 3 — Subiendo el mástil',
    intro:    'Move the Finger Gym up the neck, where the frets get narrower.',
    intro_es: 'Mueve el Gimnasio de Dedos hacia arriba del mástil, donde los trastes se hacen más angostos.',
    steps: [
      {
        label:    '5th position Ladder',
        label_es: 'Escalera en 5.ª posición',
        text: 'Play the Ladder in 5th position at 50 BPM with no buzz, three times in a row.',
        text_es: 'Toca la Escalera en la 5.ª posición a 50 BPM sin zumbido, tres veces seguidas.',
        tab: {
          caption: '5th position · index on the dot',
          caption_es: '5.ª posición · el índice sobre el punto',
          notes: [
            { string: 'E', fret: 5, note: 'A',  midi: 45, finger: 1 },
            { string: 'E', fret: 6, note: 'A#', midi: 46, finger: 2 },
            { string: 'E', fret: 7, note: 'B',  midi: 47, finger: 3 },
            { string: 'E', fret: 8, note: 'C',  midi: 48, finger: 4 }
          ]
        },
      },
      {
        label:    'The shift up',
        label_es: 'El cambio hacia arriba',
        text: 'Play two full climbs back to back with a two-fret shift, thumb behind the neck.',
        text_es: 'Toca dos subidas completas seguidas con un cambio de dos trastes, pulgar detrás del mástil.',
        tab: {
          caption: '5th position into 7th',
          caption_es: 'De la 5.ª posición a la 7.ª',
          notes: [
            { string: 'E', fret: 5,  note: 'A',  midi: 45, finger: 1 },
            { string: 'E', fret: 6,  note: 'A#', midi: 46, finger: 2 },
            { string: 'E', fret: 7,  note: 'B',  midi: 47, finger: 3 },
            { string: 'E', fret: 8,  note: 'C',  midi: 48, finger: 4 },
            { string: 'E', fret: 7,  note: 'B',  midi: 47, finger: 1 },
            { string: 'E', fret: 8,  note: 'C',  midi: 48, finger: 2 },
            { string: 'E', fret: 9,  note: 'C#', midi: 49, finger: 3 },
            { string: 'E', fret: 10, note: 'D',  midi: 50, finger: 4 }
          ]
        },
      },
      {
        label:    'The jump',
        label_es: 'El salto',
        text: 'Land all three jump notes with one finger while looking away, three times out of three.',
        text_es: 'Cae en las tres notas del salto con un solo dedo, sin mirar, tres de tres veces.',
        tab: {
          caption: 'Jump · fret 1 to 5 to 9',
          caption_es: 'Salto · del traste 1 al 5 al 9',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41, finger: 1 },
            { string: 'E', fret: 5, note: 'A',  midi: 45, finger: 1 },
            { string: 'E', fret: 9, note: 'C#', midi: 49, finger: 1 }
          ]
        },
      },
      {
        label:    '9th position Ladder',
        label_es: 'Escalera en 9.ª posición',
        text: 'Play the Ladder in 9th position on your fingertips with no buzz, three times in a row.',
        text_es: 'Toca la Escalera en la 9.ª posición sobre las puntas, sin zumbido, tres veces seguidas.',
        tab: {
          caption: '9th position · narrowest frets',
          caption_es: '9.ª posición · los trastes más angostos',
          notes: [
            { string: 'E', fret: 9,  note: 'C#', midi: 49, finger: 1 },
            { string: 'E', fret: 10, note: 'D',  midi: 50, finger: 2 },
            { string: 'E', fret: 11, note: 'D#', midi: 51, finger: 3 },
            { string: 'E', fret: 12, note: 'E',  midi: 52, finger: 4 }
          ]
        },
      },
      {
        label:    'The circuit',
        label_es: 'El circuito',
        text: 'Play two clean sets in a row in 1st, 5th and 9th position, the second 10 BPM faster.',
        text_es: 'Toca dos series limpias seguidas en la 1.ª, 5.ª y 9.ª posición, la segunda 10 BPM más rápida.',
      },
    ],
  },
  {
    id:    'ca-5',
    view:  'focus',   // one step at a time — see VIEW above (added 2026-10-01)
    number: 7,
    title:    'Finger Gym 4 — Fingers Down',
    title_es: 'Gimnasio de Dedos 4 — Dedos abajo',
    intro:    'Keep every finger that has played on the string as you climb.',
    intro_es: 'Deja cada dedo que ya tocó apoyado en la cuerda mientras subes.',
    steps: [
      {
        label:    'Plant as you go',
        label_es: 'Planta y sigue',
        text: 'Climb the tab at 50 BPM with each finger staying down, three times in a row.',
        text_es: 'Sube la tablatura a 50 BPM con cada dedo quedándose abajo, tres veces seguidas.',
        tab: {
          caption: 'Plant as you go · nothing lifts',
          caption_es: 'Planta y sigue · nada se levanta',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41, finger: 1 },
            { string: 'E', fret: 2, note: 'F#', midi: 42, finger: 2 },
            { string: 'E', fret: 3, note: 'G',  midi: 43, finger: 3 },
            { string: 'E', fret: 4, note: 'G#', midi: 44, finger: 4 }
          ]
        },
      },
      {
        label:    'Pair 1-3',
        label_es: 'Pareja 1-3',
        text: 'Alternate the two notes with fingers 1 and 3: 8 clean alternations in a row.',
        text_es: 'Alterna las dos notas con los dedos 1 y 3: 8 alternancias limpias seguidas.',
        tab: {
          caption: 'Pair 1-3',
          caption_es: 'Pareja 1-3',
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41, finger: 1 },
            { string: 'E', fret: 3, note: 'G', midi: 43, finger: 3 },
            { string: 'E', fret: 1, note: 'F', midi: 41, finger: 1 },
            { string: 'E', fret: 3, note: 'G', midi: 43, finger: 3 }
          ]
        },
      },
      {
        label:    'Pair 3-4',
        label_es: 'Pareja 3-4',
        text: 'Alternate fingers 3 and 4 with 1 and 2 held down, 8 in a row with no buzz.',
        text_es: 'Alterna los dedos 3 y 4 con el 1 y el 2 abajo, 8 seguidas sin zumbido.',
        tab: {
          caption: 'Pair 3-4 · the hard one',
          caption_es: 'Pareja 3-4 · la difícil',
          notes: [
            { string: 'E', fret: 3, note: 'G',  midi: 43, finger: 3 },
            { string: 'E', fret: 4, note: 'G#', midi: 44, finger: 4 },
            { string: 'E', fret: 3, note: 'G',  midi: 43, finger: 3 },
            { string: 'E', fret: 4, note: 'G#', midi: 44, finger: 4 }
          ]
        },
      },
      {
        label:    'Out of order',
        label_es: 'Fuera de orden',
        text: 'Play fingers 1-3-2-4 in that order four times without stopping.',
        text_es: 'Toca los dedos 1-3-2-4 en ese orden cuatro veces seguidas sin detenerte.',
        tab: {
          caption: 'Out of order · 1-3-2-4',
          caption_es: 'Fuera de orden · 1-3-2-4',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41, finger: 1 },
            { string: 'E', fret: 3, note: 'G',  midi: 43, finger: 3 },
            { string: 'E', fret: 2, note: 'F#', midi: 42, finger: 2 },
            { string: 'E', fret: 4, note: 'G#', midi: 44, finger: 4 }
          ]
        },
      },
      {
        label:    'The circuit',
        label_es: 'El circuito',
        text: 'Play 1-3-2-4 on the low E, A and D strings: two clean sets in a row, the second 10 BPM faster.',
        text_es: 'Toca 1-3-2-4 en las cuerdas Mi grave, La y Re: dos series limpias seguidas, la segunda 10 BPM más rápida.',
      },
    ],
  },
  {
    id:    'ca-6',
    view:  'focus',   // one step at a time — see VIEW above (added 2026-10-01)
    number: 8,
    title:    'Finger Gym 5 — The Skip',
    title_es: 'Gimnasio de Dedos 5 — El salto',
    intro:    'Learn two new moves: skip over a string without hitting it, and reach one fret farther.',
    intro_es: 'Aprende dos movimientos nuevos: saltar sobre una cuerda sin tocarla y estirar un traste más allá.',
    steps: [
      {
        label:    'The skip',
        label_es: 'El salto',
        text: 'Jump over the A string at 50 BPM: 8 jumps in a row with the A string silent.',
        text_es: 'Salta por encima de la cuerda La a 50 BPM: 8 saltos seguidos con la cuerda La en silencio.',
        tab: {
          caption: 'The skip · over the A string',
          caption_es: 'El salto · por encima de la cuerda La',
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41, finger: 1 },
            { string: 'D', fret: 3, note: 'F', midi: 53, finger: 3 },
            { string: 'E', fret: 1, note: 'F', midi: 41, finger: 1 },
            { string: 'D', fret: 3, note: 'F', midi: 53, finger: 3 }
          ]
        },
      },
      {
        label:    'Spider with a skip',
        label_es: 'Araña con salto',
        text: 'Play the Spider with a skip once, every note on the right string, at any speed.',
        text_es: 'Toca una vez la Araña con salto, cada nota en la cuerda correcta, a cualquier velocidad.',
        tab: {
          caption: 'Spider · low E to D, skipping A',
          caption_es: 'Araña · de Mi grave a Re, saltando La',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41, finger: 1 },
            { string: 'D', fret: 2, note: 'E',  midi: 52, finger: 2 },
            { string: 'E', fret: 3, note: 'G',  midi: 43, finger: 3 },
            { string: 'D', fret: 4, note: 'F#', midi: 54, finger: 4 },
            { string: 'E', fret: 2, note: 'F#', midi: 42, finger: 1 },
            { string: 'D', fret: 3, note: 'F',  midi: 53, finger: 2 },
            { string: 'E', fret: 4, note: 'G#', midi: 44, finger: 3 },
            { string: 'D', fret: 5, note: 'G',  midi: 55, finger: 4 }
          ]
        },
      },
      {
        label:    'The wide Reach',
        label_es: 'El Estiramiento ancho',
        text: 'Reach one fret farther four times in a row, finger 1 down; a fret short counts; stop if it hurts.',
        text_es: 'Estira un traste más cuatro veces seguidas, dedo 1 abajo; un traste menos cuenta; si duele, detente.',
        tab: {
          caption: 'Wide Reach · fret 1 to fret 6',
          caption_es: 'Estiramiento ancho · del traste 1 al 6',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41, finger: 1 },
            { string: 'E', fret: 6, note: 'A#', midi: 46, finger: 4 },
            { string: 'E', fret: 1, note: 'F',  midi: 41, finger: 1 },
            { string: 'E', fret: 6, note: 'A#', midi: 46, finger: 4 }
          ]
        },
      },
      {
        label:    'Reach across strings',
        label_es: 'Estiramiento entre cuerdas',
        text: 'Hold the two notes three frets apart so both ring together, four times in a row.',
        text_es: 'Sostén las dos notas a tres trastes de distancia para que suenen juntas, cuatro veces seguidas.',
        tab: {
          caption: 'Across the strings · both notes ringing',
          caption_es: 'Entre cuerdas · las dos notas suenan',
          notes: [
            { string: 'E', fret: 2, note: 'F#', midi: 42, finger: 1 },
            { string: 'A', fret: 5, note: 'D',  midi: 50, finger: 4 }
          ]
        },
      },
      {
        label:    'The circuit',
        label_es: 'El circuito',
        text: 'Play two clean sets in a row (skip Spider, wide Reach, across strings), the second 10 BPM faster.',
        text_es: 'Toca dos series limpias seguidas: Araña con salto, Estiramiento ancho, entre cuerdas; luego sube 10 BPM.',
      },
    ],
  },
  {
    id:    'ca-7',
    view:  'focus',   // one step at a time — see VIEW above (added 2026-10-01)
    number: 9,
    title:    'Finger Gym 6 — The Meet',
    title_es: 'Gimnasio de Dedos 6 — La competencia',
    intro:    'Play the Ladder, the Spider and the Reach back to back at the fastest tempo you can keep clean.',
    intro_es: 'Toca la Escalera, la Araña y el Estiramiento seguidos, al tempo más rápido que puedas mantener limpio.',
    steps: [
      {
        label:    'Warm-up',
        label_es: 'Calentamiento',
        text: 'Warm up the Ladder at 50 BPM: two clean climbs in a row with no buzz.',
        text_es: 'Calienta la Escalera a 50 BPM: dos subidas limpias seguidas, sin zumbido.',
        tab: {
          caption: 'Warm-up · Ladder with the shift',
          caption_es: 'Calentamiento · Escalera con el cambio',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41, finger: 1 },
            { string: 'E', fret: 2, note: 'F#', midi: 42, finger: 2 },
            { string: 'E', fret: 3, note: 'G',  midi: 43, finger: 3 },
            { string: 'E', fret: 4, note: 'G#', midi: 44, finger: 4 },
            { string: 'E', fret: 2, note: 'F#', midi: 42, finger: 1 },
            { string: 'E', fret: 3, note: 'G',  midi: 43, finger: 2 },
            { string: 'E', fret: 4, note: 'G#', midi: 44, finger: 3 },
            { string: 'E', fret: 5, note: 'A',  midi: 45, finger: 4 }
          ]
        },
      },
      {
        label:    'Spider, faster each time',
        label_es: 'Araña, más rápido cada vez',
        text: 'Play the Spider at 50 BPM, then once cleanly at 60 BPM.',
        text_es: 'Toca la Araña a 50 BPM y después una pasada limpia a 60 BPM.',
        tab: {
          caption: 'Spider · faster each clean pass',
          caption_es: 'Araña · más rápido con cada pasada limpia',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41, finger: 1 },
            { string: 'A', fret: 2, note: 'B',  midi: 47, finger: 2 },
            { string: 'E', fret: 3, note: 'G',  midi: 43, finger: 3 },
            { string: 'A', fret: 4, note: 'C#', midi: 49, finger: 4 },
            { string: 'E', fret: 2, note: 'F#', midi: 42, finger: 1 },
            { string: 'A', fret: 3, note: 'C',  midi: 48, finger: 2 },
            { string: 'E', fret: 4, note: 'G#', midi: 44, finger: 3 },
            { string: 'A', fret: 5, note: 'D',  midi: 50, finger: 4 }
          ]
        },
      },
      {
        label:    'Reach endurance',
        label_es: 'Resistencia en el Estiramiento',
        text: 'Reach 8 times without stopping and without lifting finger 1; stop if it hurts.',
        text_es: 'Estira 8 veces sin detenerte y sin levantar el dedo 1; si duele, detente.',
        tab: {
          caption: 'Reach endurance · eight in a row',
          caption_es: 'Resistencia · ocho seguidos',
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41, finger: 1 },
            { string: 'E', fret: 5, note: 'A', midi: 45, finger: 4 },
            { string: 'E', fret: 1, note: 'F', midi: 41, finger: 1 },
            { string: 'E', fret: 5, note: 'A', midi: 45, finger: 4 },
            { string: 'E', fret: 1, note: 'F', midi: 41, finger: 1 },
            { string: 'E', fret: 5, note: 'A', midi: 45, finger: 4 },
            { string: 'E', fret: 1, note: 'F', midi: 41, finger: 1 },
            { string: 'E', fret: 5, note: 'A', midi: 45, finger: 4 }
          ]
        },
      },
      {
        label:    'Full circuit, twice',
        label_es: 'Circuito completo, dos veces',
        text: 'Play the whole circuit two times back to back without putting the guitar down.',
        text_es: 'Toca el circuito completo dos veces seguidas, sin bajar la guitarra entre series.',
      },
      {
        label:    'Top speed',
        label_es: 'Velocidad máxima',
        text: 'Play a clean set at least 10 BPM faster than you started, then keep raising it.',
        text_es: 'Toca una serie limpia por lo menos 10 BPM más rápida que donde empezaste, y sigue subiendo.',
      },
    ],
  },
  {
    id:    'ca-8',
    view:  'focus',   // one step at a time — see VIEW above (added 2026-10-01)
    number: 1,
    title:    'Happy Birthday — First Notes',
    title_es: 'Happy Birthday — Primeras notas',
    intro:    'Press one string down: the dots on the neck show you where to land.',
    intro_es: 'Pisa una cuerda: los puntos del mástil te muestran dónde caer.',
    steps: [
      {
        label:    'Land on fret 5',
        label_es: 'Cae en el traste 5',
        text: 'Land on fret 5 of the low E string just behind the fret, ringing clean, three times in a row.',
        text_es: 'Cae en el traste 5 de la cuerda Mi grave justo detrás del traste, limpio, tres veces seguidas.',
        tab: {
          caption: 'Open E → fret 5 · land on the dot',
          caption_es: 'Mi al aire → traste 5 · cae en el punto',
          notes: [
            { string: 'E', fret: 0, note: 'E', midi: 40 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 0, note: 'E', midi: 40 },
            { string: 'E', fret: 5, note: 'A', midi: 45 }
          ]
        },
      },
      {
        label:    'The first four notes',
        label_es: 'Las primeras cuatro notas',
        text: 'Play open, open, fret 2, open, saying “Hap-py birth-day,” three times in a row.',
        text_es: 'Toca al aire, al aire, traste 2, al aire, diciendo “Hap-py birth-day”, tres veces seguidas.',
        tab: {
          caption: '"Hap-py birth-day" — the first four notes',
          caption_es: '"Hap-py birth-day" — las primeras cuatro notas',
          notes: [
            { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
            { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'E', fret: 0, note: 'E',  midi: 40 }
          ]
        },
      },
      {
        label:    'The first line',
        label_es: 'La primera línea',
        text: 'Play the first line, six notes, saying the words, three times in a row.',
        text_es: 'Toca la primera línea, seis notas, diciendo las palabras, tres veces seguidas.',
        tab: {
          caption: 'Line 1 · all on the low E string',
          caption_es: 'Línea 1 · todo en la cuerda Mi grave',
          phrases: [
            {
              label: '"Hap-py birth-day to you"',
              label_es: '"Hap-py birth-day to you"',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 5, note: 'A',  midi: 45 },
                { string: 'E', fret: 4, note: 'G#', midi: 44, beats: 2 }
              ]
            }
          ]
        },
      },
      {
        label:    'Keep going',
        label_es: 'Sigue',
        text: 'Play with the Metro tool at 60 BPM and raise it by 10 twice without stopping.',
        text_es: 'Toca con la herramienta Metro a 60 BPM y súbela 10 puntos dos veces sin detenerte.',
      },
    ],
  },
  /* Seven Nation Army riff, the Song Journey's Layer 2 line as a class day.
     REBUILT 2026-09-27 as a PRACTICE CARD (view:'card' — see CARD above),
     the second one after ca-18: one screen with the riff's tab, driven note
     by note by one Play song button over the band, two checks (four laps on
     Slower, four on Normal) and a Level up. The loop is the band's first 24
     bars — the intro and verse 1, twelve laps of the 2-bar riff, stopping
     where the first G – A comes in at bar 25 (Jonathan, 2026-10-07: it was
     the 8-bar intro alone, four laps, and came round too soon to practise
     with). The card shows the riff once with a "Lap 1 of 12" badge; its
     uneven rhythm (beats) is followed as written. The checks still ask for
     four laps.
     The first three old steps stay as the help ladder — the two halves and
     the rhythm demo, unchanged; the 80 BPM step and the band step became the
     checks. The help ladder itself was removed 2026-10-07.
     RIFF TIMING (2026-10-13): G, E and D are a quarter-note TRIPLET across
     beats 3 and 4 (2/3 of a beat each), not dotted eighths (0.75 · 0.75 ·
     0.5). Measured off the full mix on the beat map, every riff lap of the
     whole song: with the dotted-eighth reading the highlight lit D about
     110 ms (a quarter of a beat) after the record played it; as a triplet
     G, E and D each land within about 30 ms. The same 2/3 is in ca-10,
     ca-25 and ca-31 — change all three together. */
  {
    id:    'ca-10',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    number: 10,
    title:    'Seven Nation Army — The Riff',
    title_es: 'Seven Nation Army — El riff',
    intro:    'Play the Seven Nation Army riff with the song.',
    intro_es: 'Toca el riff de Seven Nation Army con la canción.',
    card: {
      track: 'seven-nation-army',
      slowest: true,    // four-way speed control (Slow added 2026-10-09): Slowest (80) / Slower (100) / Slow (~112) / Normal (123) — Jonathan, 2026-09-29
      caption:    'The riff · A string · 2 bars',
      caption_es: 'El riff · cuerda La · 2 compases',
      sections: [
        {
          label: 'The riff', label_es: 'El riff',
          caption: 'The riff — E E G E D C B', caption_es: 'El riff — E E G E D C B',
          fromBar: 1, bars: 2, reps: 12,   // intro + verse 1, up to the first G – A (bar 25) — Jonathan, 2026-10-07
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 1.5 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.5 },
            { string: 'A', fret: 10, note: 'G', midi: 55, beats: 2/3 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 2/3 },
            { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 2/3 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 2 },
            { string: 'A', fret: 2,  note: 'B', midi: 47, beats: 2 }
          ]
        }
      ],
      checks: [
        { label: 'The riff, slower', label_es: 'El riff, más lento',
          text:    'Play the riff four times with the song without stopping.',
          text_es: 'Toca el riff cuatro veces con la canción, sin detenerte.' },
        { label: 'The riff on Normal', label_es: 'El riff en Normal',
          text:    'Slide the speed to Normal and play the riff four times with the song without stopping.',
          text_es: 'Desliza la velocidad a «Normal» y toca el riff cuatro veces con la canción, sin detenerte.' },
        { levelUp: true,
          card: 'ca-25',    // its button opens the whole-song card, not the Song Journey page (Jonathan, 2026-10-06)
          text:    'Play the whole song on the Whole Song card.',
          text_es: 'Toca la canción completa en la tarjeta de La canción completa.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  {
    id:    'ca-11',
    view:  'focus',   // one step at a time — see VIEW above (added 2026-10-01)
    number: 4,
    title:    'Notes on the Low E String',
    title_es: 'Notas en la cuerda Mi grave',
    intro:    'Learn the names of the notes on the low E string, from open E to fret 12.',
    intro_es: 'Aprende los nombres de las notas de la cuerda Mi grave, desde E al aire hasta el traste 12.',
    steps: [
      {
        label:    'The dot notes',
        label_es: 'Las notas de los puntos',
        text: 'Play E, G, A and B at the dots, saying each name out loud, three times through.',
        text_es: 'Toca E, G, A y B en los puntos, diciendo cada nombre en voz alta, tres veces seguidas.',
        tab: {
          bpm: 20, minBpm: 20, maxBpm: 80,   // slider 20–80; the directions stop at 40, past that is the student's choice (Jonathan, 2026-11-02)
          caption: 'The dot notes · E G A B',
          caption_es: 'Las notas de los puntos · E G A B',
          notes: [
            { string: 'E', fret: 0, note: 'E', midi: 40 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 7, note: 'B', midi: 47 }
          ]
        },
      },
      {
        label:    'Fill in the row',
        label_es: 'Completa la fila',
        text: 'Play E F G A B C D E and back, saying every name out loud, three times through.',
        text_es: 'Toca E F G A B C D E y de regreso, cada nombre en voz alta, tres veces seguidas.',
        tab: {
          bpm: 20, minBpm: 20, maxBpm: 80,   // slider 20–80; the directions stop at 40, past that is the student's choice (Jonathan, 2026-11-02)
          caption: 'E to E · up and back',
          caption_es: 'De E a E · subir y bajar',
          phrases: [
            {
              label: 'Going up',
              label_es: 'Subiendo',
              notes: [
                { string: 'E', fret: 0,  note: 'E', midi: 40 },
                { string: 'E', fret: 1,  note: 'F', midi: 41 },
                { string: 'E', fret: 3,  note: 'G', midi: 43 },
                { string: 'E', fret: 5,  note: 'A', midi: 45 },
                { string: 'E', fret: 7,  note: 'B', midi: 47 },
                { string: 'E', fret: 8,  note: 'C', midi: 48 },
                { string: 'E', fret: 10, note: 'D', midi: 50 },
                { string: 'E', fret: 12, note: 'E', midi: 52 }
              ]
            },
            {
              label: 'Coming down',
              label_es: 'Bajando',
              notes: [
                { string: 'E', fret: 12, note: 'E', midi: 52 },
                { string: 'E', fret: 10, note: 'D', midi: 50 },
                { string: 'E', fret: 8,  note: 'C', midi: 48 },
                { string: 'E', fret: 7,  note: 'B', midi: 47 },
                { string: 'E', fret: 5,  note: 'A', midi: 45 },
                { string: 'E', fret: 3,  note: 'G', midi: 43 },
                { string: 'E', fret: 1,  note: 'F', midi: 41 },
                { string: 'E', fret: 0,  note: 'E', midi: 40 }
              ]
            }
          ]
        },
      },
      {
        label:    'Name the fret',
        label_es: 'Di la nota',
        text:    'Get 7 of 10 on your first pass, then try for 9 of 10.',
        text_es: 'Saca 7 de 10 en tu primera pasada y después intenta sacar 9 de 10.',
        drill: { type: 'shuffle', string: 'lowE', maxFret: 12, rounds: 10, seconds: 8, pile: 'naturals' },
      },
      {
        label:    'Find the note',
        label_es: 'Encuentra la nota',
        text: 'Find five notes in a row on the low E string without looking at a tab.',
        text_es: 'Encuentra cinco notas seguidas en la cuerda Mi grave sin mirar la tablatura.',
        drill: { type: 'deck', deck: 'naturals-lowE' },
      },
      {
        label:    'Keep going',
        label_es: 'Sigue',
        text: 'Play the notes up and back, one per beat, from 20 BPM up to 40, adding 5 each clean pass.',
        text_es: 'Toca las notas subiendo y bajando, una por tiempo, de 20 BPM hasta 40, sumando 5 en cada pasada limpia.',
      },
    ],
  },
  /* The A-string twin of ca-11 (Notes on the Low E String), same ladder —
     dot notes, the full row, name-the-fret quiz, find-the-note deck —
     then Happy Birthday the A-string way as the musical half. That second
     half was its own activity, ca-16 ("Happy Birthday — The A-String Way"),
     until 2026-09-16, when the two were merged into this one card: names
     first, song second. ca-17 kept its id (ca-16 is retired — see RETIRED
     IDS) so a student who had only ticked ca-16 still meets the note names. */
  {
    id:    'ca-17',
    view:  'focus',   // one step at a time — see VIEW above (added 2026-10-01)
    number: 13,
    title:    'Notes on the A String, Then Happy Birthday',
    title_es: 'Notas en la cuerda La, y luego Happy Birthday',
    intro:    'Learn the note names on the A string, then play Happy Birthday a second way.',
    intro_es: 'Aprende los nombres de las notas de la cuerda La y después toca Happy Birthday de una segunda forma.',
    steps: [
      {
        label:    'Learn the notes',
        label_es: 'Aprende las notas',
        text: 'Play the A-string notes, saying each name out loud, three times through.',
        text_es: 'Toca las notas de la cuerda La diciendo cada nombre en voz alta, tres veces completas.',
        tab: {
          bpm: 20, minBpm: 20, maxBpm: 80,   // slider 20–80; the directions stop at 40, past that is the student's choice (Jonathan, 2026-11-02)
          // Off the site-wide paging default: "three times through" means all
          // three phrases, and there's no Play tab/snippet syncing a page turn
          // — paging would hide "Coming down" behind an unmentioned Next
          // (2026-09-25 audit).
          linesPerPage: 0,
          caption: 'The dot notes, then A to A, up and back',
          caption_es: 'Las notas de los puntos, y después de A a A, subiendo y bajando',
          phrases: [
            {
              label: 'Dot notes — A C D E',
              label_es: 'Notas de los puntos — A C D E',
              notes: [
                { string: 'A', fret: 0, note: 'A', midi: 45 },
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'A', fret: 7, note: 'E', midi: 52 }
              ]
            },
            {
              label: 'Going up',
              label_es: 'Subiendo',
              notes: [
                { string: 'A', fret: 0,  note: 'A', midi: 45 },
                { string: 'A', fret: 2,  note: 'B', midi: 47 },
                { string: 'A', fret: 3,  note: 'C', midi: 48 },
                { string: 'A', fret: 5,  note: 'D', midi: 50 },
                { string: 'A', fret: 7,  note: 'E', midi: 52 },
                { string: 'A', fret: 8,  note: 'F', midi: 53 },
                { string: 'A', fret: 10, note: 'G', midi: 55 },
                { string: 'A', fret: 12, note: 'A', midi: 57 }
              ]
            },
            {
              label: 'Coming down',
              label_es: 'Bajando',
              notes: [
                { string: 'A', fret: 12, note: 'A', midi: 57 },
                { string: 'A', fret: 10, note: 'G', midi: 55 },
                { string: 'A', fret: 8,  note: 'F', midi: 53 },
                { string: 'A', fret: 7,  note: 'E', midi: 52 },
                { string: 'A', fret: 5,  note: 'D', midi: 50 },
                { string: 'A', fret: 3,  note: 'C', midi: 48 },
                { string: 'A', fret: 2,  note: 'B', midi: 47 },
                { string: 'A', fret: 0,  note: 'A', midi: 45 }
              ]
            }
          ]
        },
      },
      {
        label:    'Name the fret',
        label_es: 'Di la nota',
        text:    'Get 7 of 10 on your first pass, then try for 9 of 10.',
        text_es: 'Saca 7 de 10 en tu primera pasada y después intenta sacar 9 de 10.',
        drill: { type: 'shuffle', string: 'A', maxFret: 12, rounds: 10, seconds: 8, pile: 'naturals' },
      },
      {
        label:    'Find the note',
        label_es: 'Encuentra la nota',
        text: 'Find five notes in a row on the A string without looking at a tab.',
        text_es: 'Encuentra cinco notas seguidas en la cuerda La sin mirar la tablatura.',
        drill: { type: 'deck', deck: 'naturals-A' },
      },
      {
        label:    'Cross the strings',
        label_es: 'Cruza las cuerdas',
        text: 'Pluck the open low E, then the open A, one string per pluck, three times in a row.',
        text_es: 'Pulsa la cuerda Mi grave y la cuerda La al aire, una cuerda por pulsación, tres veces seguidas.',
        tab: {
          bpm: 20, minBpm: 20, maxBpm: 80,   // slider 20–80; the directions stop at 40, past that is the student's choice (Jonathan, 2026-11-02)
          caption: 'String crossing · open strings only',
          caption_es: 'Cruce de cuerdas · solo cuerdas al aire',
          notes: [
            { string: 'E', fret: 0, note: 'E', midi: 40 },
            { string: 'A', fret: 0, note: 'A', midi: 45 },
            { string: 'E', fret: 0, note: 'E', midi: 40 },
            { string: 'A', fret: 0, note: 'A', midi: 45 }
          ]
        },
      },
      {
        label:    'Lines 3 and 4',
        label_es: 'Líneas 3 y 4',
        text: 'Play Line 3 into Line 4 on the A string three times without stopping.',
        text_es: 'Toca de la Línea 3 a la Línea 4 en la cuerda La, tres veces seguidas, sin detenerte.',
        tab: {
          bpm: 20, minBpm: 20, maxBpm: 80,   // slider 20–80; the directions stop at 40, past that is the student's choice (Jonathan, 2026-11-02)
          caption: 'Second half · the A-string way',
          caption_es: 'Segunda mitad · la versión con la cuerda La',
          phrases: [
            {
              label: 'Line 3 — "Hap-py birth-day dear ______"',
              label_es: 'Línea 3 — "Hap-py birth-day dear ______"',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'A', fret: 7, note: 'E',  midi: 52 },
                { string: 'A', fret: 4, note: 'C#', midi: 49 },
                { string: 'A', fret: 0, note: 'A',  midi: 45 },
                { string: 'E', fret: 4, note: 'G#', midi: 44 },
                { string: 'E', fret: 2, note: 'F#', midi: 42, beats: 2 }
              ]
            },
            {
              label: 'Line 4 — "Hap-py birth-day to you"',
              label_es: 'Línea 4 — "Hap-py birth-day to you"',
              notes: [
                { string: 'A', fret: 5, note: 'D',  midi: 50, beats: 0.5 },
                { string: 'A', fret: 5, note: 'D',  midi: 50, beats: 0.5 },
                { string: 'A', fret: 4, note: 'C#', midi: 49 },
                { string: 'A', fret: 0, note: 'A',  midi: 45 },
                { string: 'A', fret: 2, note: 'B',  midi: 47 },
                { string: 'A', fret: 0, note: 'A',  midi: 45, beats: 2 }
              ]
            }
          ]
        },
      },
      {
        label:    'The whole song',
        label_es: 'La canción completa',
        text: 'Play the whole song the A-string way from 20 up to 40 BPM, naming each A-string note.',
        text_es: 'Toca la canción en la versión con la cuerda La, de 20 a 40 BPM, nombrando cada nota de la cuerda La.',
        tab: {
          bpm: 20, minBpm: 20, maxBpm: 80,   // slider 20–80; the directions stop at 40, past that is the student's choice (Jonathan, 2026-11-02)
          // Off the site-wide paging default, same reason as ca-1's whole-song
          // step: "the whole song without stopping" can't have a Next click
          // hidden between Line 2 and Line 3.
          linesPerPage: 0,
          caption: 'Whole song · Lines 1–4 · low E and A strings',
          caption_es: 'Canción completa · Líneas 1–4 · cuerdas Mi grave y La',
          phrases: [
            {
              label: 'Line 1 — "Hap-py birth-day to you"',
              label_es: 'Línea 1 — "Hap-py birth-day to you"',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 5, note: 'A',  midi: 45 },
                { string: 'E', fret: 4, note: 'G#', midi: 44, beats: 2 }
              ]
            },
            {
              label: 'Line 2 — "Hap-py birth-day to you" (the ending climbs higher)',
              label_es: 'Línea 2 — "Hap-py birth-day to you" (el final sube más alto)',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 7, note: 'B',  midi: 47 },
                { string: 'E', fret: 5, note: 'A',  midi: 45, beats: 2 }
              ]
            },
            {
              label: 'Line 3 — "Hap-py birth-day dear ______"',
              label_es: 'Línea 3 — "Hap-py birth-day dear ______"',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'A', fret: 7, note: 'E',  midi: 52 },
                { string: 'A', fret: 4, note: 'C#', midi: 49 },
                { string: 'A', fret: 0, note: 'A',  midi: 45 },
                { string: 'E', fret: 4, note: 'G#', midi: 44 },
                { string: 'E', fret: 2, note: 'F#', midi: 42, beats: 2 }
              ]
            },
            {
              label: 'Line 4 — "Hap-py birth-day to you"',
              label_es: 'Línea 4 — "Hap-py birth-day to you"',
              notes: [
                { string: 'A', fret: 5, note: 'D',  midi: 50, beats: 0.5 },
                { string: 'A', fret: 5, note: 'D',  midi: 50, beats: 0.5 },
                { string: 'A', fret: 4, note: 'C#', midi: 49 },
                { string: 'A', fret: 0, note: 'A',  midi: 45 },
                { string: 'A', fret: 2, note: 'B',  midi: 47 },
                { string: 'A', fret: 0, note: 'A',  midi: 45, beats: 2 }
              ]
            }
          ]
        },
      },
    ],
  },
  /* A-string memory practice (Jonathan, 2026-09-27): the follow-up to ca-17,
     which introduces the A-string names. Four steps — a short review with
     the tab player, the natural-note deck, a play-along up and back at 20
     BPM, then a skip-a-note play-along that climbs to 40 BPM. All three
     note activities (ca-11, ca-17, ca-22) start at 20 BPM and their directions
     stop at 40, like ca-23 (Jonathan, 2026-10-19). The sliders go to 80
     (2026-11-02): a student who wants it faster drags it there.
     Technique ladder: one pass in order, recall with no tab, in time with
     the player, out of order in time. ca-17 is untouched. */
  {
    id:    'ca-22',
    view:  'focus',   // one step at a time — see VIEW above
    title:    'A String Notes — Cards and Play-Along',
    title_es: 'Notas de la cuerda La — Cartas y tocar a la par',
    intro:    'Practice the note names on the A string until you know each one without looking.',
    intro_es: 'Practica los nombres de las notas de la cuerda La hasta saber cada uno sin mirar.',
    steps: [
      {
        label:    'Learn — Review the names',
        label_es: 'Aprende — Repasa los nombres',
        text: 'Press Play tab and say each name out loud as it plays.',
        text_es: 'Presiona Tocar el tab y di cada nombre en voz alta mientras suena.',
        tab: {
          bpm: 20, minBpm: 20, maxBpm: 80,   // slider 20–80; the directions stop at 40, past that is the student's choice (Jonathan, 2026-11-02)
          caption: 'A to A · going up',
          caption_es: 'De A a A · subiendo',
          notes: [
            { string: 'A', fret: 0,  note: 'A', midi: 45 },
            { string: 'A', fret: 2,  note: 'B', midi: 47 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 7,  note: 'E', midi: 52 },
            { string: 'A', fret: 8,  note: 'F', midi: 53 },
            { string: 'A', fret: 10, note: 'G', midi: 55 },
            { string: 'A', fret: 12, note: 'A', midi: 57 }
          ]
        },
      },
      {
        label:    'Practice — Deal a card',
        label_es: 'Practica — Reparte una carta',
        text: 'Find all 7 notes on the A string on the first deal, with no buzz.',
        text_es: 'Encuentra las 7 notas en la cuerda La en el primer reparto, sin zumbido.',
        drill: { type: 'deck', deck: 'naturals-A' },
      },
      {
        label:    'Practice — Play along',
        label_es: 'Practica — Toca a la par',
        text: 'Play along up and back twice with the player, saying each name, no missed notes.',
        text_es: 'Toca a la par subiendo y bajando dos veces con el reproductor, diciendo cada nombre, sin notas perdidas.',
        tab: {
          bpm: 20, minBpm: 20, maxBpm: 80,   // slider 20–80; the directions stop at 40, past that is the student's choice (Jonathan, 2026-11-02)
          caption: 'A to A · up and back',
          caption_es: 'De A a A · subiendo y bajando',
          phrases: [
            {
              label: 'Going up',
              label_es: 'Subiendo',
              notes: [
                { string: 'A', fret: 0,  note: 'A', midi: 45 },
                { string: 'A', fret: 2,  note: 'B', midi: 47 },
                { string: 'A', fret: 3,  note: 'C', midi: 48 },
                { string: 'A', fret: 5,  note: 'D', midi: 50 },
                { string: 'A', fret: 7,  note: 'E', midi: 52 },
                { string: 'A', fret: 8,  note: 'F', midi: 53 },
                { string: 'A', fret: 10, note: 'G', midi: 55 },
                { string: 'A', fret: 12, note: 'A', midi: 57 }
              ]
            },
            {
              label: 'Coming down',
              label_es: 'Bajando',
              notes: [
                { string: 'A', fret: 12, note: 'A', midi: 57 },
                { string: 'A', fret: 10, note: 'G', midi: 55 },
                { string: 'A', fret: 8,  note: 'F', midi: 53 },
                { string: 'A', fret: 7,  note: 'E', midi: 52 },
                { string: 'A', fret: 5,  note: 'D', midi: 50 },
                { string: 'A', fret: 3,  note: 'C', midi: 48 },
                { string: 'A', fret: 2,  note: 'B', midi: 47 },
                { string: 'A', fret: 0,  note: 'A', midi: 45 }
              ]
            }
          ]
        },
      },
      {
        label:    'Practice — Skip a note',
        label_es: 'Practica — Salta una nota',
        text: 'Play one clean pass at 20 BPM, saying the next name before each jump, then raise it to 40.',
        text_es: 'Toca una pasada limpia a 20 BPM, diciendo el siguiente nombre antes de cada salto, y súbela hasta 40.',
        tab: {
          bpm: 20, minBpm: 20, maxBpm: 80,   // slider 20–80; the directions stop at 40, past that is the student's choice (Jonathan, 2026-11-02)
          caption: 'Skip a note · A to A, up and back',
          caption_es: 'Salta una nota · de A a A, subiendo y bajando',
          phrases: [
            {
              label: 'Skipping up',
              label_es: 'Saltando hacia arriba',
              notes: [
                { string: 'A', fret: 0,  note: 'A', midi: 45 },
                { string: 'A', fret: 3,  note: 'C', midi: 48 },
                { string: 'A', fret: 2,  note: 'B', midi: 47 },
                { string: 'A', fret: 5,  note: 'D', midi: 50 },
                { string: 'A', fret: 3,  note: 'C', midi: 48 },
                { string: 'A', fret: 7,  note: 'E', midi: 52 },
                { string: 'A', fret: 5,  note: 'D', midi: 50 },
                { string: 'A', fret: 8,  note: 'F', midi: 53 },
                { string: 'A', fret: 7,  note: 'E', midi: 52 },
                { string: 'A', fret: 10, note: 'G', midi: 55 },
                { string: 'A', fret: 8,  note: 'F', midi: 53 },
                { string: 'A', fret: 12, note: 'A', midi: 57 }
              ]
            },
            {
              label: 'Skipping down',
              label_es: 'Saltando hacia abajo',
              notes: [
                { string: 'A', fret: 12, note: 'A', midi: 57 },
                { string: 'A', fret: 8,  note: 'F', midi: 53 },
                { string: 'A', fret: 10, note: 'G', midi: 55 },
                { string: 'A', fret: 7,  note: 'E', midi: 52 },
                { string: 'A', fret: 8,  note: 'F', midi: 53 },
                { string: 'A', fret: 5,  note: 'D', midi: 50 },
                { string: 'A', fret: 7,  note: 'E', midi: 52 },
                { string: 'A', fret: 3,  note: 'C', midi: 48 },
                { string: 'A', fret: 5,  note: 'D', midi: 50 },
                { string: 'A', fret: 2,  note: 'B', midi: 47 },
                { string: 'A', fret: 3,  note: 'C', midi: 48 },
                { string: 'A', fret: 0,  note: 'A', midi: 45 }
              ]
            }
          ]
        },
      },
    ],
  },
  {
    id:    'ca-12',
    view:  'focus',   // one step at a time — see VIEW above (added 2026-10-01)
    number: 11,
    title:    'Sub Day Circuit',
    title_es: 'Circuito para el día con suplente',
    intro:    'Do six stops on your own, in order: you have done all of them before.',
    intro_es: 'Haz seis paradas por tu cuenta, en orden: ya has hecho todas antes.',
    steps: [
      {
        label:    'Name the fret',
        label_es: 'Di la nota',
        text:    'Get 7 of 10 on your first pass, then try for 9 of 10.',
        text_es: 'Saca 7 de 10 en tu primera pasada y después intenta sacar 9 de 10.',
        drill: { type: 'shuffle', string: 'lowE', maxFret: 12, rounds: 10, seconds: 8, pile: 'naturals' },
      },
      {
        label:    'Find the note',
        label_es: 'Encuentra la nota',
        text: 'Find five notes in a row on the low E string without looking at a tab.',
        text_es: 'Encuentra cinco notas seguidas en la cuerda Mi grave sin mirar la tablatura.',
        drill: { type: 'deck', deck: 'naturals-lowE' },
      },
      {
        label:    'Tune it back',
        label_es: 'Vuelve a afinar',
        text: 'Loosen the low E string half a turn and tune it back to E in green within 1:00, never tightening past E.',
        text_es: 'Afloja la cuerda Mi grave media vuelta y súbela a E en verde dentro de 1:00, sin apretar de más.',
      },
      {
        label:    'Play it from memory',
        label_es: 'Tócala de memoria',
        text: 'Cover the screen and play all four lines of Happy Birthday from memory without stopping.',
        text_es: 'Tapa la pantalla y toca las cuatro líneas de Happy Birthday de memoria, sin detenerte.',
        tab: {
          caption: 'Whole song · Lines 1–4 · low E string only',
          caption_es: 'Canción completa · Líneas 1–4 · solo la cuerda Mi grave',
          linesPerPage: 0,
          phrases: [
            {
              label: 'Line 1 — "Hap-py birth-day to you"',
              label_es: 'Línea 1 — "Hap-py birth-day to you"',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 5, note: 'A',  midi: 45 },
                { string: 'E', fret: 4, note: 'G#', midi: 44, beats: 2 }
              ]
            },
            {
              label: 'Line 2 — "Hap-py birth-day to you" (the ending climbs higher)',
              label_es: 'Línea 2 — "Hap-py birth-day to you" (el final sube más alto)',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 0, note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 7, note: 'B',  midi: 47 },
                { string: 'E', fret: 5, note: 'A',  midi: 45, beats: 2 }
              ]
            },
            {
              label: 'Line 3 — "Hap-py birth-day dear ______"',
              label_es: 'Línea 3 — "Hap-py birth-day dear ______"',
              notes: [
                { string: 'E', fret: 0,  note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 0,  note: 'E',  midi: 40, beats: 0.5 },
                { string: 'E', fret: 12, note: 'E',  midi: 52 },
                { string: 'E', fret: 9,  note: 'C#', midi: 49 },
                { string: 'E', fret: 5,  note: 'A',  midi: 45 },
                { string: 'E', fret: 4,  note: 'G#', midi: 44 },
                { string: 'E', fret: 2,  note: 'F#', midi: 42, beats: 2 }
              ]
            },
            {
              label: 'Line 4 — "Hap-py birth-day to you"',
              label_es: 'Línea 4 — "Hap-py birth-day to you"',
              notes: [
                { string: 'E', fret: 10, note: 'D',  midi: 50, beats: 0.5 },
                { string: 'E', fret: 10, note: 'D',  midi: 50, beats: 0.5 },
                { string: 'E', fret: 9,  note: 'C#', midi: 49 },
                { string: 'E', fret: 5,  note: 'A',  midi: 45 },
                { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                { string: 'E', fret: 5,  note: 'A',  midi: 45, beats: 2 }
              ]
            }
          ]
        },
      },
      {
        label:    'Clean it up',
        label_es: 'Límpiala',
        text: 'Play Happy Birthday from memory once more with no buzz and no extra string.',
        text_es: 'Toca Happy Birthday de memoria una vez más, sin zumbido y sin cuerda de más.',
      },
      {
        label:    'Keep going',
        label_es: 'Sigue',
        text: 'Play Happy Birthday from memory with the Metro tool from 60 BPM, adding 10 BPM each clean pass.',
        text_es: 'Toca Happy Birthday de memoria con la herramienta Metro desde 60 BPM y súbele 10 en cada pasada limpia.',
      },
    ],
  },
  /* "the cure" intro and verse on the low E string alone — A at fret 5, C at
     fret 8, F at fret 1 — the first "the cure" class day. ca-19 then moves
     the verse onto two strings and ca-18 adds the chorus.
     REBUILT 2026-10-01 as a PRACTICE CARD (view:'card' — see CARD above),
     the ca-18 model (Jonathan: that format "works much better for
     students"). Was five ladder steps with numbered lists. Same notes and
     the same record bars as the old snippets: intro 1–4, verse 5–12 played
     twice (5–20, shown once with a "Verse 1 of 2" badge). The old intro /
     verse / intro-into-verse steps became the three checks; a help ladder
     (a Learn step for the three spots and the hand-shift drill) followed
     until 2026-10-07, when every help ladder was removed. Completion is
     keyed to the id, so nobody's saved progress moves. */
  {
    id:    'ca-13',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    number: 12,
    title:    '"the cure" — Intro and Verse on the Low E',
    title_es: '"the cure" — Intro y estrofa en la cuerda Mi grave',
    intro:    'Play the intro and verse of "the cure" on the low E string with the band.',
    intro_es: 'Toca la intro y la estrofa de "the cure" en la cuerda Mi grave con la banda.',
    card: {
      track: 'the-cure',
      slowest: true,    // Slowest / Slower / Slow / Normal — like ca-18 and ca-10
      caption:    'Intro and verse · low E string · 4 plucks per note',
      caption_es: 'Intro y estrofa · cuerda Mi grave · 4 pulsaciones por nota',
      sections: [
        {
          label: 'Intro', label_es: 'Intro',
          caption: 'Intro — A C A C', caption_es: 'Intro — A C A C',
          fromBar: 1, bars: 4,
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 8, note: 'C', midi: 48 }
          ]
        },
        {
          label: '2 Verses', label_es: '2 estrofas',
          caption: '2 Verses — A C A C, F C F C', caption_es: '2 estrofas — A C A C, F C F C',
          fromBar: 5, bars: 8, reps: 2,
          repLabel: 'Verse', repLabel_es: 'Estrofa',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 8, note: 'C', midi: 48 }
          ]
        }
      ],
      checks: [
        { label: 'Intro', label_es: 'Intro',
          text:    'Play the intro with the song without stopping.',
          text_es: 'Toca la intro con la canción, sin detenerte.' },
        { label: '2 verses', label_es: '2 estrofas',
          text:    'Tap 2 Verses and play both verses with the song without stopping.',
          text_es: 'Pulsa «2 estrofas» y toca las 2 estrofas con la canción, sin detenerte.' },
        { label: 'Intro and 2 verses', label_es: 'Intro y 2 estrofas',
          text:    'Play the intro and 2 verses with the song without stopping.',
          text_es: 'Toca la intro y las 2 estrofas con la canción, sin detenerte.' },
        { levelUp: true,
          card: 'ca-24',    // its button opens the whole-song card, not the Song Journey page (Jonathan, 2026-10-06)
          text:    'Play the intro and 2 verses at Normal, then the whole song on the Whole Song card.',
          text_es: 'Toca la intro y las 2 estrofas en «Normal» y luego la tarjeta de La canción completa.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* Day 17: "the cure" verse moved from the low E (ca-13's A · C · F on
     frets 5 · 8 · 1) onto two strings, the hand parked in frets 1–5. It
     shares a day with ca-17 (Notes on the A String). ca-18, the next class
     day, re-teaches this and adds the chorus; the overlap is intended
     (Jonathan, 2026-09-16).
     REBUILT 2026-10-01 as a PRACTICE CARD (view:'card' — see CARD above),
     the ca-18 model. Was six ladder steps. The card is ca-18's intro and
     verses exactly (the intro is the verse's own A C A C, so nothing new is
     asked); the chorus stays new on ca-18. Its help ladder (the old A·C
     Learn and Practice steps and the F·C Practice step) was removed
     2026-10-07 with every other help ladder. Completion is keyed to the
     id. */
  {
    id:    'ca-19',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    number: 14,
    title:    '"the cure" — The Verse on Two Strings',
    title_es: '"the cure" — La estrofa en dos cuerdas',
    intro:    'Play the verse of "the cure" with C on the A string, fret 3, inside the first five frets.',
    intro_es: 'Toca la estrofa de "the cure" con el C en la cuerda La, traste 3, dentro de los primeros cinco trastes.',
    card: {
      track: 'the-cure',
      slowest: true,    // Slowest / Slower / Slow / Normal — like ca-18 and ca-10
      caption:    'Intro and verse · two strings · 4 plucks per note',
      caption_es: 'Intro y estrofa · dos cuerdas · 4 pulsaciones por nota',
      sections: [
        {
          label: 'Intro', label_es: 'Intro',
          caption: 'Intro — A C A C', caption_es: 'Intro — A C A C',
          fromBar: 1, bars: 4,
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 3, note: 'C', midi: 48 }
          ]
        },
        {
          label: '2 Verses', label_es: '2 estrofas',
          caption: '2 Verses — A C A C, F C F C', caption_es: '2 estrofas — A C A C, F C F C',
          fromBar: 5, bars: 8, reps: 2,
          repLabel: 'Verse', repLabel_es: 'Estrofa',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 3, note: 'C', midi: 48 }
          ]
        }
      ],
      checks: [
        { label: 'Intro', label_es: 'Intro',
          text:    'Play the intro with the song without stopping.',
          text_es: 'Toca la intro con la canción, sin detenerte.' },
        { label: '2 verses', label_es: '2 estrofas',
          text:    'Tap 2 Verses and play both verses with the song without stopping.',
          text_es: 'Pulsa «2 estrofas» y toca las 2 estrofas con la canción, sin detenerte.' },
        { label: 'Intro and 2 verses', label_es: 'Intro y 2 estrofas',
          text:    'Play the intro and 2 verses with the song without stopping.',
          text_es: 'Toca la intro y las 2 estrofas con la canción, sin detenerte.' },
        { levelUp: true,
          card: 'ca-24',    // its button opens the whole-song card, not the Song Journey page (Jonathan, 2026-10-06)
          text:    'Play the intro and 2 verses at Normal, then the whole song on the Whole Song card.',
          text_es: 'Toca la intro y las 2 estrofas en «Normal» y luego la tarjeta de La canción completa.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* "Luna" bass roots, the Song Journey's Layer 2 line as a class day: F on
     the low E at fret 1 and the open A string, two bars each, one pluck per
     bar in the 6/8 felt-in-2 pulse (Jonathan's Moises chord chart,
     2026-09-23). The bass reads F F A A all the way through the record.
     REBUILT 2026-10-01 as a PRACTICE CARD (view:'card' — see CARD above),
     the ca-18 model; was four Focus-view steps. The loop is written once
     with a "Lap 1 of 4" badge (bars 1–16 of the steady-tempo grid — the
     120 BPM intro sits before bar 1). The card's own Metronome clicks the
     two big beats, which retires the old "click ticks six times" step and
     the separate Metro-tool step. Its help ladder (the F·A Learn step and
     the F-to-A change the old recovery line pointed at) was removed
     2026-10-07 with every other help ladder. */
  {
    id:    'ca-20',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    title:    '"Luna" — The Bassline',
    title_es: '"Luna" — La línea de bajo',
    intro:    'Play the "Luna" loop with the band: F at fret 1 on the low E string, then the open A string.',
    intro_es: 'Toca el bucle de "Luna" con la banda: F en el traste 1 de la cuerda Mi grave y la cuerda La al aire.',
    card: {
      track: 'luna',
      slowest: true,    // Slowest / Slower / Slow / Normal — like ca-18 and ca-10
      caption:    'The loop · F F A A · 1 pluck per bar, let it ring',
      caption_es: 'El bucle · F F A A · 1 pulsación por compás, déjala sonar',
      sections: [
        {
          label: 'The loop', label_es: 'El bucle',
          caption: 'The loop — F F A A', caption_es: 'El bucle — F F A A',
          fromBar: 1, bars: 4, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 },
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 }
          ]
        }
      ],
      checks: [
        { label: 'Two laps', label_es: 'Dos vueltas',
          text:    'Play two laps of F F A A with the song without stopping.',
          text_es: 'Toca dos vueltas de F F A A con la canción, sin detenerte.' },
        { label: 'Four laps', label_es: 'Cuatro vueltas',
          text:    'Play four laps with the song without stopping.',
          text_es: 'Toca cuatro vueltas con la canción, sin detenerte.' },
        { levelUp: true,
          card: 'ca-27',    // its button opens the whole-song card, not the Song Journey page (Jonathan, 2026-10-06)
          text:    'Play four laps at Normal, then the whole song on the Whole Song card.',
          text_es: 'Toca cuatro vueltas en «Normal» y luego la canción completa en la tarjeta de La canción completa.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* "the cure" bass roots across the two-string position, as one class day:
     intro and verse (already learned in ca-13/ca-19), then the chorus, then the
     song in order with the band.
     ca-13 teaches the intro and the verse on the low E string ALONE — A at fret
     5, C at fret 8, F at fret 1. This card plays that line on two strings,
     where nothing sits past fret 5 and the hand never leaves one position, and
     adds the chorus — D on the A string and G on the low E. The two cards are
     consecutive class days, not a replacement (Jonathan, 2026-09-16).
     (ca-19, the two-string verse alone, sits between them — 2026-09-16)
     REBUILT 2026-09-25 as four Focus-view steps, then REBUILT AGAIN
     2026-09-27 as the first PRACTICE CARD (view:'card' — see CARD above):
     students were doing what was taught directly and stopping there, so the
     slides now teach the rungs and this card is one screen — the song's tab
     driven by one Play song button, three checks and a Level up. Bars are the
     record's: intro 1–4, verse 5–12 played twice (5–20, shown once with a
     "Verse 1 of 2" badge), chorus 21–28 — the same 28 bars the old step 4
     looped. The 2026-09-25 steps' ticks were day-scoped and completion is
     keyed to the id, so nobody's saved progress moves.
     The steps are now the HELP ladder under "More practice help", trimmed
     (Jonathan's call) to what the card doesn't already cover: the chorus
     notes, and the two drills the old recovery lines pointed at. Removed
     2026-10-07 with every other help ladder. */
  {
    id:    'ca-18',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    number: 15,
    title:    '"the cure" — Intro, Verse and Chorus',
    title_es: '"the cure" — Intro, estrofa y coro',
    intro:    'Add the chorus of "the cure" and play from the intro to the end of the chorus with the band.',
    intro_es: 'Agrega el coro de "the cure" y tócala desde la intro hasta el final del coro con la banda.',
    card: {
      track: 'the-cure',
      slowest: true,    // four-way speed control (Slow added 2026-10-09): Slowest (48) / Slower (60) / Slow (66) / Normal (72) — Jonathan, 2026-09-29
      caption:    'The song in order · 4 plucks per note',
      caption_es: 'La canción en orden · 4 pulsaciones por nota',
      sections: [
        {
          label: 'Intro', label_es: 'Intro',
          caption: 'Intro — A C A C', caption_es: 'Intro — A C A C',
          fromBar: 1, bars: 4,
          notes: [
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 }
          ]
        },
        {
          label: '2 Verses', label_es: '2 estrofas',
          caption: '2 Verses — A C A C, F C F C', caption_es: '2 estrofas — A C A C, F C F C',
          fromBar: 5, bars: 8, reps: 2,
          repLabel: 'Verse', repLabel_es: 'Estrofa',
          notes: [
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 }
          ]
        },
        {
          label: 'Chorus', label_es: 'Coro',
          caption: 'Chorus — D F C G, D F C G', caption_es: 'Coro — D F C G, D F C G',
          fromBar: 21, bars: 8,
          notes: [
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 }
          ]
        }
      ],
      checks: [
        { label: 'Intro and 2 verses', label_es: 'Intro y 2 estrofas',
          text:    'Play the intro and 2 verses with the song without stopping.',
          text_es: 'Toca la intro y las 2 estrofas con la canción, sin detenerte.' },
        { label: 'Chorus', label_es: 'Coro',
          text:    'Tap Chorus and play two choruses in a row with the song without stopping.',
          text_es: 'Pulsa «Coro» y toca dos coros seguidos con la canción, sin detenerte.' },
        { label: 'Intro to chorus', label_es: 'De la intro al coro',
          text:    'Play from the intro to the end of the chorus with the song without stopping.',
          text_es: 'Toca de la intro al final del coro con la canción, sin detenerte.' },
        { levelUp: true,
          card: 'ca-24',    // its button opens the whole-song card, not the Song Journey page (Jonathan, 2026-10-06)
          text:    'Play from the intro to the end of the chorus at Normal, then the Whole Song card.',
          text_es: 'Toca de la intro al final del coro en «Normal» y luego la tarjeta de La canción completa.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* "the cure" — The Whole Song (2026-09-30). A practice card like ca-18,
     but the whole record, bars 1–88, and ONE numbered check: play it start
     to finish at the speed the student picks (Slowest / Slower / Slow / Normal).
     Normal is the Level up. Same two-string root line as ca-18 (A = low E 5,
     C = A 3, F = low E 1, D = A 5, G = low E 3), four plucks per bar; in
     the refrains and bridge C and G share a bar, two plucks each.
     Section map: Jonathan's chord chart (capo 1 —
     the shapes Asus2 Cmaj7 Fmaj7 Dm F C G/B are this site's no-capo A C F
     D F C G), placed on the click grid (anchor 0.565 s, 3.333 s a bar)
     with bass/chroma readings of the mp3 — see CLAUDE.md. The bridge's
     last four bars (65–68) are the D F C G loop; the final chorus is
     69–80, three laps like the other two. */
  {
    id:    'ca-24',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    journey: 'the-cure',   // the button renders under the Level up check — see JOURNEY above
    journeyLayer: 2,
    title:    '"the cure" — The Whole Song',
    title_es: '"the cure" — La canción completa',
    intro:    'Play the whole of "the cure" with the band, start to finish.',
    intro_es: 'Toca "the cure" completa con la banda, de principio a fin.',
    card: {
      track: 'the-cure',
      slowest: true,    // four-way speed control (Slow added 2026-10-09): Slowest (48) / Slower (60) / Slow (66) / Normal (72) — the student picks
      wholeSong: true,  // stops at the end of the song instead of looping — Jonathan, 2026-10-02
      caption:    'The whole song in order · 4 plucks per bar (2 per chord where two chords share a bar)',
      caption_es: 'La canción completa en orden · 4 pulsaciones por compás (2 por acorde donde dos acordes comparten un compás)',
      sections: [
        {
          label: 'Intro', label_es: 'Intro',
          caption: 'Intro — A C A C', caption_es: 'Intro — A C A C',
          fromBar: 1, bars: 4,
          notes: [
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 }
          ]
        },
        {
          label: '2 Verses', label_es: '2 estrofas',
          caption: '2 Verses — A C A C, F C F C', caption_es: '2 estrofas — A C A C, F C F C',
          fromBar: 5, bars: 8, reps: 2,
          repLabel: 'Verse', repLabel_es: 'Estrofa',
          notes: [
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 }
          ]
        },
        {
          label: 'Chorus 1', label_es: 'Coro 1',
          caption: 'Chorus 1 — D F C G, 3 laps', caption_es: 'Coro 1 — D F C G, 3 vueltas',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 21, bars: 4, reps: 3,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 }
          ]
        },
        {
          label: 'Verse 3', label_es: 'Estrofa 3',
          caption: 'Verse 3 — A C A C, F C F C', caption_es: 'Estrofa 3 — A C A C, F C F C',
          fromBar: 33, bars: 8,
          notes: [
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'E', fret: 5,  note: 'A', midi: 45 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 }
          ]
        },
        {
          label: 'Refrain 1', label_es: 'Estribillo 1',
          caption: 'Refrain 1 — F, C G, F, C G · C and G share a bar', caption_es: 'Estribillo 1 — F, C G, F, C G · C y G comparten un compás',
          fromBar: 41, bars: 4,
          notes: [
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 }
          ]
        },
        {
          label: 'Chorus 2', label_es: 'Coro 2',
          caption: 'Chorus 2 — D F C G, 3 laps', caption_es: 'Coro 2 — D F C G, 3 vueltas',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 45, bars: 4, reps: 3,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 }
          ]
        },
        {
          label: 'Refrain 2', label_es: 'Estribillo 2',
          caption: 'Refrain 2 — F, C G, F, C G · C and G share a bar', caption_es: 'Estribillo 2 — F, C G, F, C G · C y G comparten un compás',
          fromBar: 57, bars: 4,
          notes: [
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 }
          ]
        },
        {
          label: 'Bridge', label_es: 'Puente',
          caption: 'Bridge — F, C G, F, C G, D F C G', caption_es: 'Puente — F, C G, F, C G, D F C G',
          fromBar: 61, bars: 8,
          notes: [
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 }
          ]
        },
        {
          label: 'Chorus 3', label_es: 'Coro 3',
          caption: 'Chorus 3 — D F C G, 3 laps', caption_es: 'Coro 3 — D F C G, 3 vueltas',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 69, bars: 4, reps: 3,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 }
          ]
        },
        {
          label: 'Outro', label_es: 'Final',
          caption: 'Outro — D F C G, 2 laps', caption_es: 'Final — D F C G, 2 vueltas',
          fromBar: 81, bars: 4, reps: 2,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'E', fret: 1,  note: 'F', midi: 41 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 },
            { string: 'E', fret: 3,  note: 'G', midi: 43 }
          ]
        }
      ],
      checks: [
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play the whole song with the band, intro to the end, without stopping.',
          text_es: 'Toca la canción completa con la banda, de la intro al final, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band without stopping.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda, sin detenerte.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* An EXIT CHECK, not a step ladder — see the kind:'check' block in the
     schema above. Every note here is lifted verbatim from ca-1's whole-song
     tab (line A `0 0 2 0 5 4`, B `0 0 2 0 7 5`, C `0 0 12 9 5 4 2`,
     D `10 10 9 5 7 5`), so the check can't drift away from the activity that
     taught it. Items 1 and 3 play the SAME four notes and differ only in
     which line they are — flagged on the Summer reset list (the
     summer-reset skill, .claude/skills/summer-reset/SKILL.md);
     `items` is positional and frozen now that students have taken it. */
  {
    id:    'ca-14',
    kind:  'check',
    title:    'Happy Birthday — what comes next?',
    title_es: 'Happy Birthday — ¿qué nota sigue?',
    intro:    'The site plays the start of a line of Happy Birthday and shows the frets. Pick the note that comes next. Five questions, one try — listen as many times as you want before you pick.',
    intro_es: 'El sitio toca el inicio de una línea de Happy Birthday y muestra los trastes. Elige la nota que sigue. Cinco preguntas, un solo intento — escucha todas las veces que quieras antes de elegir.',
    check: {
      type: 'nextNote',
      bpm: 80,
      items: [
        {
          label:    'Line 1 — "Hap-py birth-day to you"',
          label_es: 'Línea 1 — "Hap-py birth-day to you"',
          notes: [
            { string: 'E', fret: 0, note: 'E',  midi: 40 },
            { string: 'E', fret: 0, note: 'E',  midi: 40 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'E', fret: 0, note: 'E',  midi: 40 }
          ],
          answer: { string: 'E', fret: 5, note: 'A', midi: 45 },
          choices: [ { fret: 5, note: 'A' }, { fret: 4, note: 'G#' }, { fret: 7, note: 'B' }, { fret: 2, note: 'F#' } ]
        },
        {
          label:    'Line 1 — "Hap-py birth-day to you"',
          label_es: 'Línea 1 — "Hap-py birth-day to you"',
          notes: [
            { string: 'E', fret: 0, note: 'E',  midi: 40 },
            { string: 'E', fret: 0, note: 'E',  midi: 40 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'E', fret: 0, note: 'E',  midi: 40 },
            { string: 'E', fret: 5, note: 'A',  midi: 45 }
          ],
          answer: { string: 'E', fret: 4, note: 'G#', midi: 44 },
          choices: [ { fret: 4, note: 'G#' }, { fret: 5, note: 'A' }, { fret: 2, note: 'F#' }, { fret: 7, note: 'B' } ]
        },
        {
          label:    'Line 2 — "Hap-py birth-day to you" (the ending climbs higher)',
          label_es: 'Línea 2 — "Hap-py birth-day to you" (el final sube más)',
          notes: [
            { string: 'E', fret: 0, note: 'E',  midi: 40 },
            { string: 'E', fret: 0, note: 'E',  midi: 40 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'E', fret: 0, note: 'E',  midi: 40 }
          ],
          answer: { string: 'E', fret: 7, note: 'B', midi: 47 },
          choices: [ { fret: 7, note: 'B' }, { fret: 5, note: 'A' }, { fret: 4, note: 'G#' }, { fret: 9, note: 'C#' } ]
        },
        {
          label:    'Line 3 — "Hap-py birth-day dear ____"',
          label_es: 'Línea 3 — "Hap-py birth-day dear ____"',
          notes: [
            { string: 'E', fret: 0,  note: 'E', midi: 40 },
            { string: 'E', fret: 0,  note: 'E', midi: 40 },
            { string: 'E', fret: 12, note: 'E', midi: 52 }
          ],
          answer: { string: 'E', fret: 9, note: 'C#', midi: 49 },
          choices: [ { fret: 9, note: 'C#' }, { fret: 10, note: 'D' }, { fret: 7, note: 'B' }, { fret: 5, note: 'A' } ]
        },
        {
          label:    'Line 4 — "Hap-py birth-day to you"',
          label_es: 'Línea 4 — "Hap-py birth-day to you"',
          notes: [
            { string: 'E', fret: 10, note: 'D',  midi: 50 },
            { string: 'E', fret: 10, note: 'D',  midi: 50 },
            { string: 'E', fret: 9,  note: 'C#', midi: 49 }
          ],
          answer: { string: 'E', fret: 5, note: 'A', midi: 45 },
          choices: [ { fret: 5, note: 'A' }, { fret: 7, note: 'B' }, { fret: 4, note: 'G#' }, { fret: 12, note: 'E' } ]
        }
      ]
    }
  },
  /* Sight-reading practice for the Unit 2 assessment's Task 2 ("sight-read
     a short 2-bar bass line from TAB"). Every tab here is hideNames: fret
     numbers only, no note letters, no tap-to-hear row — the student has to
     work each note out from the fret, and ▶ Play tab is the answer key AFTER
     they play. Lines 1–3 are deliberately NOT the two assessment lines,
     which live only on the printed Unit 2 handout (Jonathan, 2026-09-24).
     REBUILT 2026-09-25 to four steps (Jonathan: "apply this to upcoming
     class activities as well" — the ca-18 rebuild): five practice lines
     became three — one string (old Line 1), one string change (old Line 3),
     both strings up to fret 8 (old Line 5, still the last, open-ended rung).
     Old Line 2 (A string alone) and old Line 4 (a string change on every
     note) are gone. No revealDelay here: ▶ Play tab is the answer key.
     2026-10-01 (Jonathan: "add two more lines of practice"): old Lines 2 and
     4 are BACK, in their original places, so it is the original five lines
     again (Learn + 5 = six steps — the four-step rule is soft).
     Every tab carries `controlsBelow: true`, so ▶ Play tab sits UNDER the
     board — read and play first, then check. 2026-10-12: the Learn step got
     a four-note picture of its own (low E and A lines), same flags. */
  {
    id:    'ca-21',
    view:  'focus',   // one step at a time — see VIEW above
    metronome: 60,    // opening the card starts the Metro tool at 60 BPM — see METRONOME above
    title:    'Sight-Reading TAB — Low E and A Strings',
    title_es: 'Lectura a primera vista de TAB — Cuerdas Mi grave y La',
    intro:    'Play each line of TAB the first time you see it, one note on each click.',
    intro_es: 'Toca cada línea de la TAB la primera vez que la ves, una nota en cada clic.',
    steps: [
      {
        label:    'Learn — How to read TAB',
        label_es: 'Aprende — Cómo leer TAB',
        text: 'Read TAB left to right: each line is a string, low E at the bottom, and each number is a fret.',
        text_es: 'Lee la TAB de izquierda a derecha: cada línea es una cuerda, la Mi grave abajo; cada número es un traste.',
        /* The picture for the paragraph above (2026-10-12): the two lines it
           names, with the string letters the board prints at the left — open
           low E, fret 3, open A, fret 2. hideNames + controlsBelow like every
           other tab in this activity; here ▶ Play tab is just "listen". */
        tab: {
          hideNames: true,
          controlsBelow: true,
          caption: 'Bottom line: low E string · the line above it: A string',
          caption_es: 'Línea de abajo: cuerda Mi grave · la línea de arriba de esa: cuerda La',
          notes: [
            { string: 'E', fret: 0, note: 'E', midi: 40 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'A', fret: 0, note: 'A', midi: 45 },
            { string: 'A', fret: 2, note: 'B', midi: 47 }
          ]
        },
      },
      {
        label:    'Practice — Line 1',
        label_es: 'Practica — Línea 1',
        text: 'Play Line 1 once without stopping, one note per beat.',
        text_es: 'Toca la Línea 1 completa sin detenerte, una nota por tiempo.',
        tab: {
          hideNames: true,
          controlsBelow: true,   // Play tab is the answer key — under the board
          caption: 'Line 1 · low E string · 2 bars, one note per beat',
          caption_es: 'Línea 1 · cuerda Mi grave · 2 compases, una nota por tiempo',
          notes: [
            { string: 'E', fret: 0, note: 'E', midi: 40 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 0, note: 'E', midi: 40 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 3, note: 'G', midi: 43 }
          ]
        },
      },
      {
        label:    'Practice — Line 2',
        label_es: 'Practica — Línea 2',
        text: 'Play Line 2, all on the A string, once without stopping, one note per beat.',
        text_es: 'Toca la Línea 2, toda en la cuerda La, completa sin detenerte, una nota por tiempo.',
        tab: {
          hideNames: true,
          controlsBelow: true,   // Play tab is the answer key — under the board
          caption: 'Line 2 · A string · 2 bars, one note per beat',
          caption_es: 'Línea 2 · cuerda La · 2 compases, una nota por tiempo',
          notes: [
            { string: 'A', fret: 0, note: 'A', midi: 45 },
            { string: 'A', fret: 2, note: 'B', midi: 47 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 0, note: 'A', midi: 45 },
            { string: 'A', fret: 2, note: 'B', midi: 47 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 5, note: 'D', midi: 50 },
            { string: 'A', fret: 2, note: 'B', midi: 47 }
          ]
        },
      },
      {
        label:    'Practice — Line 3',
        label_es: 'Practica — Línea 3',
        text: 'Play Line 3, low E string then the A string in bar 2, once without stopping.',
        text_es: 'Toca la Línea 3, de la cuerda Mi grave a la cuerda La en el compás 2, completa sin detenerte.',
        tab: {
          hideNames: true,
          controlsBelow: true,   // Play tab is the answer key — under the board
          caption: 'Line 3 · low E and A strings · 2 bars, one note per beat',
          caption_es: 'Línea 3 · cuerdas Mi grave y La · 2 compases, una nota por tiempo',
          notes: [
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 0, note: 'E', midi: 40 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'A', fret: 0, note: 'A', midi: 45 },
            { string: 'A', fret: 2, note: 'B', midi: 47 },
            { string: 'A', fret: 0, note: 'A', midi: 45 }
          ]
        },
      },
      {
        label:    'Practice — Line 4',
        label_es: 'Practica — Línea 4',
        text: 'Play Line 4, switching between the A and low E strings, once without stopping.',
        text_es: 'Toca la Línea 4, cambiando entre la cuerda La y la Mi grave, completa sin detenerte.',
        tab: {
          hideNames: true,
          controlsBelow: true,   // Play tab is the answer key — under the board
          caption: 'Line 4 · low E and A strings · 2 bars, one note per beat',
          caption_es: 'Línea 4 · cuerdas Mi grave y La · 2 compases, una nota por tiempo',
          notes: [
            { string: 'A', fret: 0, note: 'A', midi: 45 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'A', fret: 2, note: 'B', midi: 47 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'A', fret: 0, note: 'A', midi: 45 },
            { string: 'E', fret: 0, note: 'E', midi: 40 }
          ]
        },
      },
      {
        label:    'Practice — Line 5',
        label_es: 'Practica — Línea 5',
        text: 'Play Line 5, up to fret 8, with the click, raising it 10 BPM each clean pass.',
        text_es: 'Toca la Línea 5, hasta el traste 8, con el clic y súbelo 10 BPM en cada pasada limpia.',
        tab: {
          hideNames: true,
          controlsBelow: true,   // Play tab is the answer key — under the board
          caption: 'Line 5 · low E and A strings · frets 5–8 · 2 bars, one note per beat',
          caption_es: 'Línea 5 · cuerdas Mi grave y La · trastes 5–8 · 2 compases, una nota por tiempo',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 7, note: 'B', midi: 47 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'A', fret: 5, note: 'D', midi: 50 },
            { string: 'A', fret: 7, note: 'E', midi: 52 },
            { string: 'A', fret: 5, note: 'D', midi: 50 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 5, note: 'A', midi: 45 }
          ]
        },
      },
    ],
  },
  /* The second exit check, and the other item type: one fret lights up with
     its name hidden and the student names it. ca-11 (the activity that
     teaches this) is unchanged — a check never replaces the activity it
     checks. The five frets are all naturals by necessity, not by taste: the
     choice row is A–G, so a sharp fret would have no right button, and
     checks.mjs 1y fails the push on one. */
  {
    id:    'ca-15',
    kind:  'check',
    title:    'Notes on the Low E String',
    title_es: 'Notas en la cuerda Mi grave',
    intro:    'One fret lights up on the low E string. Press "Play the note" to hear it, then tap the name of the note. Five questions, one try — use the dots on the neck to find your place.',
    intro_es: 'Un traste se ilumina en la cuerda Mi grave. Pulsa «Tocar la nota» para escucharlo, y después toca el nombre de la nota. Cinco preguntas, un solo intento — usa los puntos del mástil para ubicarte.',
    check: {
      type: 'noteName',
      string: 'lowE',
      items: [
        { fret: 3,  answer: 'G' },
        { fret: 8,  answer: 'C' },
        { fret: 5,  answer: 'A' },
        { fret: 10, answer: 'D' },
        { fret: 1,  answer: 'F' }
      ]
    }
  },
  /* Note Call on the low E and A strings (Jonathan, 2026-09-27): a note
     name comes up on the beat and the student plays it. One Practice step
     per chunk of the neck — 0–5, 5–8, 8–12, then 0–12. Each step starts in
     Show answer (the play-along: the fret lights up 2 beats after the name,
     it speeds up every 8 notes, Slower backs it off, nothing is scored),
     then the student turns Show answer off for the five scored levels
     (naturals 20 → 30 BPM → half the beats, then the ♯ notes). Listening
     Coach starts off. Technique ladder: one position slow → the same move
     across the neck → the whole neck at tempo. Speeds start at 20–40 BPM
     (Jonathan, 2026-10-19): Level 5 speeds up 5 BPM a pass, and Faster in the
     play-along goes on to 80 (2026-11-02: up to 80, was 40). Engine: renderNoteCall in app.js. Follows ca-11
     / ca-17 / ca-22, which teach the names. */
  {
    id:    'ca-23',
    view:  'focus',   // one step at a time — see VIEW above
    title:    'Low E and A Notes in Time',
    title_es: 'Notas de las cuerdas Mi grave y La a tiempo',
    intro:    'Play each note as its name comes up, then turn off Show answer and pass Level 3.',
    intro_es: 'Toca cada nota cuando aparece su nombre y luego apaga «Mostrar la respuesta» y pasa el Nivel 3.',
    steps: [
      {
        label:    'Practice — Frets 0 to 5',
        label_es: 'Practica — Trastes 0 a 5',
        drill: { type: 'notecall', strings: ['lowE', 'A'], minFret: 0, maxFret: 5 },
      },
      {
        label:    'Practice — Frets 5 to 8',
        label_es: 'Practica — Trastes 5 a 8',
        drill: { type: 'notecall', strings: ['lowE', 'A'], minFret: 5, maxFret: 8 },
      },
      {
        label:    'Practice — Frets 8 to 12',
        label_es: 'Practica — Trastes 8 a 12',
        drill: { type: 'notecall', strings: ['lowE', 'A'], minFret: 8, maxFret: 12 },
      },
      {
        label:    'Practice — The whole neck',
        label_es: 'Practica — Todo el mástil',
        drill: { type: 'notecall', strings: ['lowE', 'A'], minFret: 0, maxFret: 12 },
      },
    ],
  },
  /* Seven Nation Army — The Whole Song (2026-10-01). A practice card like
     ca-18: the riff from ca-10 (already learned) plus ONE new part, the G – A
     break between the sections (G = low E fret 3, A = low E fret 5 — Jonathan,
     2026-10-05, was the open A — four plucks each), then the whole record in
     order. Each chorus is the riff then the riff with the C D C B ending
     (laps 2 and 4 on the record: C 1 beat, D and C half a beat each, B 2),
     so a chorus section is that 4-bar pair played twice (same day). Needs the track's beat map
     (SNIPPET_TRACKS['seven-nation-army'].barTimes, added the same day): the
     band drifts off a straight 123 grid and the breaks run long. Section map
     from the bass chroma on that map — riff 1-24, G-A 25-26, riff 27-34,
     G-A 35-36, riff 37-60, G-A 61-62, solo 63-78, G-A 79-80, riff 81-104,
     G-A 105-106, riff 107-114, final E 115-116. Verse 2 and Verse 3 include
     the four-lap interlude in front of each (Jonathan's chord sheet).
     RIFF TIMING (2026-10-13): G, E and D are a quarter-note TRIPLET across
     beats 3 and 4 (2/3 of a beat each), not dotted eighths (0.75 · 0.75 ·
     0.5). Measured off the full mix on the beat map, every riff lap of the
     whole song: with the dotted-eighth reading the highlight lit D about
     110 ms (a quarter of a beat) after the record played it; as a triplet
     G, E and D each land within about 30 ms. The same 2/3 is in ca-10,
     ca-25 and ca-31 — change all three together. */
  {
    id:    'ca-25',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    journey: 'seven-nation-army',   // the button renders under the Level up check — see JOURNEY above
    journeyLayer: 2,
    title:    'Seven Nation Army — The Whole Song',
    title_es: 'Seven Nation Army — La canción completa',
    intro:    'Add the G and A between the sections and play the whole song with the band.',
    intro_es: 'Añade el G y el A entre las secciones y toca la canción completa con la banda.',
    card: {
      track: 'seven-nation-army',
      wholeSong: true,  // stops at the end of the song instead of looping — Jonathan, 2026-10-02
      slowest: true,    // Slowest (80) / Slower (100) / Slow (~112) / Normal (123)
      caption:    'The whole song in order · the riff and G – A',
      caption_es: 'La canción completa en orden · el riff y G – A',
      sections: [
        {
          label: 'Intro', label_es: 'Intro',
          caption: 'Intro — the riff, 4 laps', caption_es: 'Intro — el riff, 4 vueltas',
          fromBar: 1, bars: 2, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 1.5 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.5 },
            { string: 'A', fret: 10, note: 'G', midi: 55, beats: 2/3 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 2/3 },
            { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 2/3 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 2 },
            { string: 'A', fret: 2,  note: 'B', midi: 47, beats: 2 }
          ]
        },
        {
          label: 'Verse 1', label_es: 'Estrofa 1',
          caption: 'Verse 1 — the riff, 8 laps', caption_es: 'Estrofa 1 — el riff, 8 vueltas',
          fromBar: 9, bars: 2, reps: 8,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 1.5 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.5 },
            { string: 'A', fret: 10, note: 'G', midi: 55, beats: 2/3 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 2/3 },
            { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 2/3 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 2 },
            { string: 'A', fret: 2,  note: 'B', midi: 47, beats: 2 }
          ]
        },
        {
          label: 'G – A', label_es: 'G – A',
          caption: 'G – A · 4 plucks each', caption_es: 'G – A · 4 pulsaciones cada una',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 25, bars: 2,
          notes: [
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 }
          ]
        },
        {
          label: 'Chorus 1', label_es: 'Coro 1',
          caption: 'Chorus 1 — 2 times · riff, then the riff ending C D C B', caption_es: 'Coro 1 — 2 veces · riff, luego el riff que termina C D C B',
          fromBar: 27, bars: 4, reps: 2,
          rows: [7, 9],     // one riff lap per tab row
          repLabel: 'Time', repLabel_es: 'Vez',
          notes: [
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 1.5 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.5 },
            { string: 'A', fret: 10, note: 'G', midi: 55, beats: 2/3 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 2/3 },
            { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 2/3 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 2 },
            { string: 'A', fret: 2,  note: 'B', midi: 47, beats: 2 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 1.5 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.5 },
            { string: 'A', fret: 10, note: 'G', midi: 55, beats: 2/3 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 2/3 },
            { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 2/3 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 1 },
            { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 0.5 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 0.5 },
            { string: 'A', fret: 2,  note: 'B', midi: 47, beats: 2 }
          ]
        },
        {
          label: 'G – A', label_es: 'G – A',
          caption: 'G – A · 4 plucks each', caption_es: 'G – A · 4 pulsaciones cada una',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 35, bars: 2,
          notes: [
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 }
          ]
        },
        {
          label: 'Verse 2', label_es: 'Estrofa 2',
          caption: 'Verse 2 — the riff, 12 laps', caption_es: 'Estrofa 2 — el riff, 12 vueltas',
          fromBar: 37, bars: 2, reps: 12,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 1.5 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.5 },
            { string: 'A', fret: 10, note: 'G', midi: 55, beats: 2/3 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 2/3 },
            { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 2/3 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 2 },
            { string: 'A', fret: 2,  note: 'B', midi: 47, beats: 2 }
          ]
        },
        {
          label: 'G – A', label_es: 'G – A',
          caption: 'G – A · 4 plucks each', caption_es: 'G – A · 4 pulsaciones cada una',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 61, bars: 2,
          notes: [
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 }
          ]
        },
        {
          label: 'Solo', label_es: 'Solo',
          caption: 'Solo — the riff, 8 laps', caption_es: 'Solo — el riff, 8 vueltas',
          fromBar: 63, bars: 2, reps: 8,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 1.5 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.5 },
            { string: 'A', fret: 10, note: 'G', midi: 55, beats: 2/3 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 2/3 },
            { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 2/3 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 2 },
            { string: 'A', fret: 2,  note: 'B', midi: 47, beats: 2 }
          ]
        },
        {
          label: 'G – A', label_es: 'G – A',
          caption: 'G – A · 4 plucks each', caption_es: 'G – A · 4 pulsaciones cada una',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 79, bars: 2,
          notes: [
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 }
          ]
        },
        {
          label: 'Verse 3', label_es: 'Estrofa 3',
          caption: 'Verse 3 — the riff, 12 laps', caption_es: 'Estrofa 3 — el riff, 12 vueltas',
          fromBar: 81, bars: 2, reps: 12,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 1.5 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.5 },
            { string: 'A', fret: 10, note: 'G', midi: 55, beats: 2/3 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 2/3 },
            { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 2/3 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 2 },
            { string: 'A', fret: 2,  note: 'B', midi: 47, beats: 2 }
          ]
        },
        {
          label: 'G – A', label_es: 'G – A',
          caption: 'G – A · 4 plucks each', caption_es: 'G – A · 4 pulsaciones cada una',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 105, bars: 2,
          notes: [
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 }
          ]
        },
        {
          label: 'Chorus 2', label_es: 'Coro 2',
          caption: 'Chorus 2 — 2 times · riff, then the riff ending C D C B', caption_es: 'Coro 2 — 2 veces · riff, luego el riff que termina C D C B',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 107, bars: 4, reps: 2,
          rows: [7, 9],     // one riff lap per tab row
          repLabel: 'Time', repLabel_es: 'Vez',
          notes: [
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 1.5 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.5 },
            { string: 'A', fret: 10, note: 'G', midi: 55, beats: 2/3 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 2/3 },
            { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 2/3 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 2 },
            { string: 'A', fret: 2,  note: 'B', midi: 47, beats: 2 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 1.5 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.5 },
            { string: 'A', fret: 10, note: 'G', midi: 55, beats: 2/3 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 2/3 },
            { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 2/3 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 1 },
            { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 0.5 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 0.5 },
            { string: 'A', fret: 2,  note: 'B', midi: 47, beats: 2 }
          ]
        },
        {
          label: 'Ending', label_es: 'Final',
          caption: 'Ending — one E, let it ring', caption_es: 'Final — un E, déjalo sonar',
          fromBar: 115, bars: 2,
          notes: [
            { string: 'A', fret: 7, note: 'E', midi: 52, beats: 8 }
          ]
        }
      ],
      checks: [
        // Two checks only, like every whole-song card (Jonathan, 2026-10-07).
        // `slot` keeps the tick keys these two had as checks 3 and 4.
        { slot: 2, label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play the whole song with the band, intro to the end, without stopping.',
          text_es: 'Toca la canción completa con la banda, de la intro al final, sin detenerte.' },
        { slot: 3, levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band without stopping.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda, sin detenerte.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* All Along the Watchtower — The Whole Song (2026-10-01). A whole-song
     card like ca-24: the low-E bass loop students already know (Module 2,
     Journey Layer 2 — A A G G | F F G G, frets 5 3 1 3, two plucks per note)
     played with the Hendrix record from the first bar to the fade. No new
     part. The loop is written the same way in every section, intro
     included (Jonathan, 2026-10-01). Kept at two plucks per note on
     purpose (Jonathan, 2026-10-15): when the rest of the site moved to the
     method book's rhythm, he asked for this single-note card to stay as it
     was; ca-29, its power-chord twin, uses the record's rhythm (measured
     2026-10-26).
     Section map on the track's beat map (SNIPPET_TRACKS barTimes), from
     the vocal stem (Demucs) per bar: intro 1-8, verse 1 9-24, solo 1
     25-32, verse 2 33-50, solo 2 51-80, verse 3 81-104, outro 105-112.
     Every section starts on an odd bar, so each one starts on the A.
     Bars 113-114 are the fade; the last measured bar is 114, so the card
     stops at the end of 112. */
  {
    id:    'ca-26',
    /* Jimi Hendrix / Neil Young switch — see RECORDING VERSIONS beside caView in
       app.js. The data below is Jimi's; the Neil version is built after the
       array (end of this file). */
    recording: 'jimi',
    recordingLabel: 'Jimi Hendrix', recordingLabel_es: 'Jimi Hendrix',
    recordingGroup: 'all-along-the-watchtower',
    recordingStart: 'jimi',
    recordingVersions: {
      neil: { label: 'Neil Young', label_es: 'Neil Young', track: 'all-along-the-watchtower-neil', card: null }
    },
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    journey: 'all-along-the-watchtower',   // the button renders under the Level up check — see JOURNEY above
    journeyLayer: 2,
    title:    'All Along the Watchtower — The Whole Song',
    title_es: 'All Along the Watchtower — La canción completa',
    intro:    'Play the Watchtower bass line with the band for the whole song.',
    intro_es: 'Toca la línea de bajo de Watchtower con la banda durante toda la canción.',
    card: {
      wholeSong: true,  // stops at the end of the song instead of looping — Jonathan, 2026-10-02
      track: 'all-along-the-watchtower',
      slowest: true,    // four-way speed control (Slow added 2026-10-09): Slowest (84) / Slower (105) / Slow (110) / Normal (115) — the student picks
      caption:    'The whole song in order · 2 plucks per note',
      caption_es: 'La canción completa en orden · 2 pulsaciones por nota',
      sections: [
        {
          label: 'Intro', label_es: 'Intro',
          caption: 'Intro — A G F G, 4 laps', caption_es: 'Intro — A G F G, 4 vueltas',
          fromBar: 1, bars: 2, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 }
          ]
        },
        {
          label: 'Verse 1', label_es: 'Estrofa 1',
          caption: 'Verse 1 — A G F G, 8 laps', caption_es: 'Estrofa 1 — A G F G, 8 vueltas',
          fromBar: 9, bars: 2, reps: 8,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 }
          ]
        },
        {
          label: 'Solo 1', label_es: 'Solo 1',
          caption: 'Solo 1 — A G F G, 4 laps', caption_es: 'Solo 1 — A G F G, 4 vueltas',
          fromBar: 25, bars: 2, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 }
          ]
        },
        {
          label: 'Verse 2', label_es: 'Estrofa 2',
          caption: 'Verse 2 — A G F G, 9 laps', caption_es: 'Estrofa 2 — A G F G, 9 vueltas',
          fromBar: 33, bars: 2, reps: 9,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 }
          ]
        },
        {
          label: 'Solo 2', label_es: 'Solo 2',
          caption: 'Solo 2 — A G F G, 15 laps', caption_es: 'Solo 2 — A G F G, 15 vueltas',
          fromBar: 51, bars: 2, reps: 15,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 }
          ]
        },
        {
          label: 'Verse 3', label_es: 'Estrofa 3',
          caption: 'Verse 3 — A G F G, 12 laps', caption_es: 'Estrofa 3 — A G F G, 12 vueltas',
          fromBar: 81, bars: 2, reps: 12,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 }
          ]
        },
        {
          label: 'Outro', label_es: 'Final',
          caption: 'Outro — A G F G, 4 laps', caption_es: 'Final — A G F G, 4 vueltas',
          fromBar: 105, bars: 2, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 3, note: 'G', midi: 43 }
          ]
        }
      ],
      checks: [
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play the whole song with the band, intro to the end, without stopping.',
          text_es: 'Toca la canción completa con la banda, de la intro al final, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band without stopping.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda, sin detenerte.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* "Luna" — The Whole Song (2026-10-05). A whole-song card like ca-26:
     the F F A A bass loop from ca-20 (low E fret 1, open A string, one
     pluck per bar) played with the record from the top of the vamp to the
     last chord. No new part.
     Bars are the track's steady grid (SNIPPET_TRACKS 'luna': bar 1 = the
     first F of the vamp at 12.658 s, 2.8125 s a bar). The 120 BPM intro
     before it (F F Dm Dm) is not on the grid, so the card starts at the
     vamp. Section map, measured 2026-10-05 off the full mix: chords per bar
     (chroma) read F F Am Am from bar 1 to the end; the singing (mid/side
     energy in the vocal band — the voice is centred, the guitars are not)
     comes in at bars 9 and 29 and drops out at 25-28 and from 45. So:
     intro 1-8, verse 1 9-24, requinto 25-28, verse 2 29-44, outro 45-52,
     and bar 53 is the last F ringing out (the file ends 1.3 s after it).
     Matches Jonathan's chord chart: F / Am per line, a requinto between
     the two sung parts. */
  {
    id:    'ca-27',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    journey: 'luna',   // the button renders under the Level up check — see JOURNEY above
    journeyLayer: 2,
    title:    '"Luna" — The Whole Song',
    title_es: '"Luna" — La canción completa',
    intro:    'Play the "Luna" loop, F F A A, with the band for the whole song.',
    intro_es: 'Toca el bucle de "Luna", F F A A, con la banda durante toda la canción.',
    card: {
      wholeSong: true,  // stops at the end of the song instead of looping
      track: 'luna',
      slowest: true,    // four-way speed control (Slow added 2026-10-09): Slowest / Slower / Slow / Normal — the student picks
      caption:    'The whole song in order · 1 pluck per bar, let it ring',
      caption_es: 'La canción completa en orden · 1 pulsación por compás, déjala sonar',
      sections: [
        {
          label: 'Intro', label_es: 'Intro',
          caption: 'Intro — F F A A, 2 laps', caption_es: 'Intro — F F A A, 2 vueltas',
          fromBar: 1, bars: 4, reps: 2,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 },
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 }
          ]
        },
        {
          label: 'Verse 1', label_es: 'Estrofa 1',
          caption: 'Verse 1 — F F A A, 4 laps', caption_es: 'Estrofa 1 — F F A A, 4 vueltas',
          fromBar: 9, bars: 4, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 },
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 }
          ]
        },
        {
          label: 'Requinto (lead guitar)', label_es: 'Requinto (guitarra líder)',
          caption: 'Requinto — F F A A, no singing', caption_es: 'Requinto — F F A A, sin canto',
          fromBar: 25, bars: 4,
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 },
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 }
          ]
        },
        {
          label: 'Verse 2', label_es: 'Estrofa 2',
          caption: 'Verse 2 — F F A A, 4 laps', caption_es: 'Estrofa 2 — F F A A, 4 vueltas',
          fromBar: 29, bars: 4, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 },
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 }
          ]
        },
        {
          label: 'Outro', label_es: 'Final',
          caption: 'Outro — F F A A twice, then the last F', caption_es: 'Final — F F A A dos veces, y el último F',
          fromBar: 45, bars: 9,
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 },
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 },
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 },
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 },
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 }
          ]
        }
      ],
      checks: [
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play the whole song with the band, intro to the end, without stopping.',
          text_es: 'Toca la canción completa con la banda, de la intro al final, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band without stopping.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda, sin detenerte.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* Sweet Child O' Mine — The Whole Song (2026-10-05). A whole-song card:
     the root of every chord on the low E and A strings, one pluck per
     chord, from the first bar of the intro riff to the last E. The verse
     roots (D D C C G G D D — A string 5 and 3, low E 3) are Journey Layer
     2; the chorus (A C D D), the two solos and the outro add three notes —
     A (open A string), E (open low E) and B (A string fret 2) — so nothing
     sits past fret 5 and the hand never moves.
     Section map on the track's beat map (SNIPPET_TRACKS barTimes), measured
     2026-10-05 by chord templates per beat on the full mix and checked
     against Jonathan's chord chart: intro 1-24 (D D C C G G D D x3; bars
     1-8 are the riff alone), verse 1 25-40, chorus 1 41-48 (A C D D x2),
     riff 49-56, verse 2 57-72, chorus 2 73-80, riff 81-96 (x2), chorus 3
     97-112 (x4), solo 1 113-129 (Em C B7 Am x4, then one more Am), solo 2
     130-145 (Em G A, then C-C-D-G in one bar, x4), outro 146-173 (the same
     loop x7), ending 174-183 (Em G A, then G and A two beats each in bar 177 —
     "where do we go" — then E from bar 178 through the slow-down; bar 177
     was E until 2026-10-15, corrected from Jonathan's chord chart and a
     per-beat bass reading of both mixes). Bar
     183 is the last whole measured bar, so the card stops there. This
     track is in D at A=440 (a pitch-class count over two minutes reads D
     major) — the original record's half-step-down tuning is not in these
     files. */
  {
    id:    'ca-28',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    journey: 'sweet-child-o-mine',   // the button renders under the Level up check — see JOURNEY above
    journeyLayer: 2,
    title:    'Sweet Child O\' Mine — The Whole Song',
    title_es: 'Sweet Child O\' Mine — La canción completa',
    intro:    'Play the root of every chord with the band, start to finish.',
    intro_es: 'Toca la raíz de cada acorde con la banda, de principio a fin.',
    card: {
      wholeSong: true,  // stops at the end of the song instead of looping
      track: 'sweet-child-o-mine',
      slowest: true,    // four-way speed control (Slow added 2026-10-09): Slowest (80) / Slower (100) / Normal (125) — the student picks
      caption:    'The whole song in order · 1 pluck per bar (3 in the C D G bar of Solo 2 and the Outro, 2 in the G A bar of the Ending), let it ring',
      caption_es: 'La canción completa en orden · 1 pulsación por compás (3 en el compás de C D G del Solo 2 y del Final, 2 en el compás de G A del Cierre), déjala sonar',
      sections: [
        {
          label: 'Intro', label_es: 'Intro',
          caption: 'Intro — D D C C G G D D, 3 laps', caption_es: 'Intro — D D C C G G D D, 3 vueltas',
          fromBar: 1, bars: 8, reps: 3,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'E', fret: 3, note: 'G', midi: 43, beats: 4 },
            { string: 'E', fret: 3, note: 'G', midi: 43, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 }
          ]
        },
        {
          label: 'Verse 1', label_es: 'Estrofa 1',
          caption: 'Verse 1 — D D C C G G D D, 2 laps', caption_es: 'Estrofa 1 — D D C C G G D D, 2 vueltas',
          fromBar: 25, bars: 8, reps: 2,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'E', fret: 3, note: 'G', midi: 43, beats: 4 },
            { string: 'E', fret: 3, note: 'G', midi: 43, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 }
          ]
        },
        {
          label: 'Chorus 1', label_es: 'Coro 1',
          caption: 'Chorus 1 — A C D D, 2 laps', caption_es: 'Coro 1 — A C D D, 2 vueltas',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 41, bars: 4, reps: 2,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 }
          ]
        },
        {
          label: 'Riff 1', label_es: 'Riff 1',
          caption: 'Riff 1 — D D C C G G D D, no singing', caption_es: 'Riff 1 — D D C C G G D D, sin canto',
          fromBar: 49, bars: 8,
          notes: [
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'E', fret: 3, note: 'G', midi: 43, beats: 4 },
            { string: 'E', fret: 3, note: 'G', midi: 43, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 }
          ]
        },
        {
          label: 'Verse 2', label_es: 'Estrofa 2',
          caption: 'Verse 2 — D D C C G G D D, 2 laps', caption_es: 'Estrofa 2 — D D C C G G D D, 2 vueltas',
          fromBar: 57, bars: 8, reps: 2,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'E', fret: 3, note: 'G', midi: 43, beats: 4 },
            { string: 'E', fret: 3, note: 'G', midi: 43, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 }
          ]
        },
        {
          label: 'Chorus 2', label_es: 'Coro 2',
          caption: 'Chorus 2 — A C D D, 2 laps', caption_es: 'Coro 2 — A C D D, 2 vueltas',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 73, bars: 4, reps: 2,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 }
          ]
        },
        {
          label: 'Riff 2', label_es: 'Riff 2',
          caption: 'Riff 2 — D D C C G G D D, 2 laps, no singing', caption_es: 'Riff 2 — D D C C G G D D, 2 vueltas, sin canto',
          fromBar: 81, bars: 8, reps: 2,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'E', fret: 3, note: 'G', midi: 43, beats: 4 },
            { string: 'E', fret: 3, note: 'G', midi: 43, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 }
          ]
        },
        {
          label: 'Chorus 3', label_es: 'Coro 3',
          caption: 'Chorus 3 — A C D D, 4 laps', caption_es: 'Coro 3 — A C D D, 4 vueltas',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 97, bars: 4, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 4 }
          ]
        },
        {
          label: 'Solo 1', label_es: 'Solo 1',
          caption: 'Solo 1 — E C B A four times, then one more A', caption_es: 'Solo 1 — E C B A cuatro veces, y un A más',
          fromBar: 113, bars: 17,
          notes: [
            { string: 'E', fret: 0, note: 'E', midi: 40, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'A', fret: 2, note: 'B', midi: 47, beats: 4 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 4 },
            { string: 'E', fret: 0, note: 'E', midi: 40, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'A', fret: 2, note: 'B', midi: 47, beats: 4 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 4 },
            { string: 'E', fret: 0, note: 'E', midi: 40, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'A', fret: 2, note: 'B', midi: 47, beats: 4 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 4 },
            { string: 'E', fret: 0, note: 'E', midi: 40, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'A', fret: 2, note: 'B', midi: 47, beats: 4 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 4 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 4 }
          ]
        },
        {
          label: 'Solo 2', label_es: 'Solo 2',
          caption: 'Solo 2 — E G A, then C D G in one bar, 4 laps', caption_es: 'Solo 2 — E G A, y C D G en un compás, 4 vueltas',
          fromBar: 130, bars: 4, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'E', fret: 0, note: 'E', midi: 40, beats: 4 },
            { string: 'E', fret: 3, note: 'G', midi: 43, beats: 4 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 2 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 1 },
            { string: 'E', fret: 3, note: 'G', midi: 43, beats: 1 }
          ]
        },
        {
          label: 'Outro', label_es: 'Final',
          caption: 'Outro — E G A, then C D G in one bar, 7 laps', caption_es: 'Final — E G A, y C D G en un compás, 7 vueltas',
          fromBar: 146, bars: 4, reps: 7,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'E', fret: 0, note: 'E', midi: 40, beats: 4 },
            { string: 'E', fret: 3, note: 'G', midi: 43, beats: 4 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 2 },
            { string: 'A', fret: 5, note: 'D', midi: 50, beats: 1 },
            { string: 'E', fret: 3, note: 'G', midi: 43, beats: 1 }
          ]
        },
        {
          label: 'Ending', label_es: 'Cierre',
          caption: 'Ending — E G A, then G and A in one bar, then E to the end', caption_es: 'Cierre — E G A, luego G y A en un compás, y E hasta el final',
          fromBar: 174, bars: 10,
          notes: [
            { string: 'E', fret: 0, note: 'E', midi: 40, beats: 4 },
            { string: 'E', fret: 3, note: 'G', midi: 43, beats: 4 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 4 },
            { string: 'E', fret: 3, note: 'G', midi: 43, beats: 2 },  // bar 177: G 2 · A 2, then E from 178 (2026-10-15)
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 },
            { string: 'E', fret: 0, note: 'E', midi: 40, beats: 4 },
            { string: 'E', fret: 0, note: 'E', midi: 40, beats: 4 },
            { string: 'E', fret: 0, note: 'E', midi: 40, beats: 4 },
            { string: 'E', fret: 0, note: 'E', midi: 40, beats: 4 },
            { string: 'E', fret: 0, note: 'E', midi: 40, beats: 4 },
            { string: 'E', fret: 0, note: 'E', midi: 40, beats: 4 }
          ]
        }
      ],
      checks: [
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play the whole song with the band, intro to the end, without stopping.',
          text_es: 'Toca la canción completa con la banda, de la intro al final, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band without stopping.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda, sin detenerte.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* All Along the Watchtower — The Whole Song in Power Chords (2026-10-05).
     ca-26's sections and bars, every root turned into the power chord Journey
     Layer 3 teaches, all three rooted on the low E string: A5 at fret 5, G5
     at 3, F5 at 1. Rhythm measured off the record (2026-10-26, Jonathan
     confirmed it by ear), the same in every section. Bar 1: A5 on 1 + 2 +
     (four eighths), then G5 on 3 + 4 + (four eighths). Bar 2: F5 on 1, +, 2,
     a rest on the "+" after 2 and on 3, then G5 on the "+" after 3, on 4 and
     on the "+" after 4. The skipped strums are a real rest (one beat, left empty in
     the grid: `restWord: false`, no "Stop"), 2026-10-28; every strum still lands where the record puts it. */
  {
    id:    'ca-29',
    /* Jimi Hendrix / Neil Young switch — see RECORDING VERSIONS beside caView in
       app.js. The data below is Jimi's; the Neil version is built after the
       array (end of this file). */
    recording: 'jimi',
    recordingLabel: 'Jimi Hendrix', recordingLabel_es: 'Jimi Hendrix',
    recordingGroup: 'all-along-the-watchtower',
    recordingStart: 'jimi',
    recordingVersions: {
      neil: { label: 'Neil Young', label_es: 'Neil Young', track: 'all-along-the-watchtower-neil', card: null }
    },
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    journey: 'all-along-the-watchtower',   // the button renders under the Level up check — see JOURNEY above
    journeyLayer: 3,
    title:    'All Along the Watchtower — The Whole Song in Power Chords',
    title_es: 'All Along the Watchtower — La canción completa con acordes de potencia',
    intro:    'Play the whole song in power chords: the same roots, with two more strings added.',
    intro_es: 'Toca la canción completa con acordes de potencia: las mismas raíces, con dos cuerdas más.',
    card: {
      wholeSong: true,  // stops at the end of the song instead of looping
      track: 'all-along-the-watchtower',
      chordGrid: true,  // chord grid: cursor on the beats only (2026-10-26) — see CARD above
      everyStrum: true, // every strum gets its own chord name (A5 x4, G5 x4, F5 x3, G5 x3), not one per chord (Jonathan, 2026-10-28)
      restWord: false,  // the bar-2 rest is left empty, no "Stop" word (Jonathan, 2026-10-28)
      slowest: true,    // four-way speed control (Slow added 2026-10-09): Slowest / Slower / Slow / Normal — the student picks
      caption:    'The whole song in power chords',   // the count row is always on: this card is a chord grid (2026-10-26)
      caption_es: 'La canción completa con acordes de potencia',
      sections: [
        {
          label: 'Intro', label_es: 'Intro',
          caption: 'Intro — A5 G5 F5 G5, 4 laps', caption_es: 'Intro — A5 G5 F5 G5, 4 vueltas',
          fromBar: 1, bars: 2, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { rest: true, beats: 1 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 }
          ]
        },
        {
          label: 'Verse 1', label_es: 'Estrofa 1',
          caption: 'Verse 1 — A5 G5 F5 G5, 8 laps', caption_es: 'Estrofa 1 — A5 G5 F5 G5, 8 vueltas',
          fromBar: 9, bars: 2, reps: 8,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { rest: true, beats: 1 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 }
          ]
        },
        {
          label: 'Solo 1', label_es: 'Solo 1',
          caption: 'Solo 1 — A5 G5 F5 G5, 4 laps', caption_es: 'Solo 1 — A5 G5 F5 G5, 4 vueltas',
          fromBar: 25, bars: 2, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { rest: true, beats: 1 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 }
          ]
        },
        {
          label: 'Verse 2', label_es: 'Estrofa 2',
          caption: 'Verse 2 — A5 G5 F5 G5, 9 laps', caption_es: 'Estrofa 2 — A5 G5 F5 G5, 9 vueltas',
          fromBar: 33, bars: 2, reps: 9,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { rest: true, beats: 1 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 }
          ]
        },
        {
          label: 'Solo 2', label_es: 'Solo 2',
          caption: 'Solo 2 — A5 G5 F5 G5, 15 laps', caption_es: 'Solo 2 — A5 G5 F5 G5, 15 vueltas',
          fromBar: 51, bars: 2, reps: 15,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { rest: true, beats: 1 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 }
          ]
        },
        {
          label: 'Verse 3', label_es: 'Estrofa 3',
          caption: 'Verse 3 — A5 G5 F5 G5, 12 laps', caption_es: 'Estrofa 3 — A5 G5 F5 G5, 12 vueltas',
          fromBar: 81, bars: 2, reps: 12,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { rest: true, beats: 1 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 }
          ]
        },
        {
          label: 'Outro', label_es: 'Final',
          caption: 'Outro — A5 G5 F5 G5, 4 laps', caption_es: 'Final — A5 G5 F5 G5, 4 vueltas',
          fromBar: 105, bars: 2, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 0.5 },
            { rest: true, beats: 1 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 0.5 }
          ]
        }
      ],
      checks: [
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play the whole song with the band, intro to the end, without stopping.',
          text_es: 'Toca la canción completa con la banda, de la intro al final, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band without stopping.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda, sin detenerte.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* "the cure" — The Whole Song in Power Chords (2026-10-05). ca-24's
     sections and bars, every root turned into the power chord Journey Layer 3
     teaches: A5, F5, G5 rooted on the low E string (frets 5, 1, 3), C5 and D5
     on the A string (frets 3, 5). Same rhythm as ca-24 and Layer 3 — one
     strum per beat, four per chord (two where C and G share a bar). */
  {
    id:    'ca-30',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    journey: 'the-cure',   // the button renders under the Level up check — see JOURNEY above
    journeyLayer: 3,
    title:    '"the cure" — The Whole Song in Power Chords',
    title_es: '"the cure" — La canción completa con acordes de potencia',
    intro:    'Play the whole song in power chords: the same roots, with two more strings added.',
    intro_es: 'Toca la canción completa con acordes de potencia: las mismas raíces, con dos cuerdas más.',
    card: {
      wholeSong: true,  // stops at the end of the song instead of looping
      track: 'the-cure',
      chordGrid: true,  // chord grid: each chord once, cursor on the beats only (2026-10-26) — see CARD above
      slowest: true,    // four-way speed control (Slow added 2026-10-09): Slowest / Slower / Slow / Normal — the student picks
      caption:    'The whole song in power chords',
      caption_es: 'La canción completa con acordes de potencia',
      sections: [
        {
          label: 'Intro', label_es: 'Intro',
          caption: 'Intro — A5 C5 A5 C5', caption_es: 'Intro — A5 C5 A5 C5',
          fromBar: 1, bars: 4,
          notes: [
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] }
          ]
        },
        {
          label: '2 Verses', label_es: '2 estrofas',
          caption: '2 Verses — A5 C5 A5 C5, F5 C5 F5 C5', caption_es: '2 estrofas — A5 C5 A5 C5, F5 C5 F5 C5',
          fromBar: 5, bars: 8, reps: 2,
          repLabel: 'Verse', repLabel_es: 'Estrofa',
          notes: [
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] }
          ]
        },
        {
          label: 'Chorus 1', label_es: 'Coro 1',
          caption: 'Chorus 1 — D5 F5 C5 G5, 3 laps', caption_es: 'Coro 1 — D5 F5 C5 G5, 3 vueltas',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 21, bars: 4, reps: 3,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] }
          ]
        },
        {
          label: 'Verse 3', label_es: 'Estrofa 3',
          caption: 'Verse 3 — A5 C5 A5 C5, F5 C5 F5 C5', caption_es: 'Estrofa 3 — A5 C5 A5 C5, F5 C5 F5 C5',
          fromBar: 33, bars: 8,
          notes: [
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] }
          ]
        },
        {
          label: 'Refrain 1', label_es: 'Estribillo 1',
          caption: 'Refrain 1 — F5, C5 G5, F5, C5 G5 · C5 and G5 share a bar', caption_es: 'Estribillo 1 — F5, C5 G5, F5, C5 G5 · C5 y G5 comparten un compás',
          fromBar: 41, bars: 4,
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] }
          ]
        },
        {
          label: 'Chorus 2', label_es: 'Coro 2',
          caption: 'Chorus 2 — D5 F5 C5 G5, 3 laps', caption_es: 'Coro 2 — D5 F5 C5 G5, 3 vueltas',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 45, bars: 4, reps: 3,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] }
          ]
        },
        {
          label: 'Refrain 2', label_es: 'Estribillo 2',
          caption: 'Refrain 2 — F5, C5 G5, F5, C5 G5 · C5 and G5 share a bar', caption_es: 'Estribillo 2 — F5, C5 G5, F5, C5 G5 · C5 y G5 comparten un compás',
          fromBar: 57, bars: 4,
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] }
          ]
        },
        {
          label: 'Bridge', label_es: 'Puente',
          caption: 'Bridge — F5, C5 G5, F5, C5 G5, D5 F5 C5 G5', caption_es: 'Puente — F5, C5 G5, F5, C5 G5, D5 F5 C5 G5',
          fromBar: 61, bars: 8,
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] }
          ]
        },
        {
          label: 'Chorus 3', label_es: 'Coro 3',
          caption: 'Chorus 3 — D5 F5 C5 G5, 3 laps', caption_es: 'Coro 3 — D5 F5 C5 G5, 3 vueltas',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 69, bars: 4, reps: 3,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] }
          ]
        },
        {
          label: 'Outro', label_es: 'Final',
          caption: 'Outro — D5 F5 C5 G5, 2 laps', caption_es: 'Final — D5 F5 C5 G5, 2 vueltas',
          fromBar: 81, bars: 4, reps: 2,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] }
          ]
        }
      ],
      checks: [
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play the whole song with the band, intro to the end, without stopping.',
          text_es: 'Toca la canción completa con la banda, de la intro al final, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band without stopping.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda, sin detenerte.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* Seven Nation Army — The Whole Song in Power Chords (2026-10-05).
     ca-25's sections and bars, every riff note turned into the A-string power
     chord Journey Layer 3 teaches (E5 at fret 7, G5 at 10, D5 at 5, C5 at 3,
     B5 at 2 — "one chord per riff note", same beats as ca-25). G5 on low E
     fret 3, A5 on low E fret 5 (the same shape two frets up — 2026-10-05, was
     the open A). The choruses carry ca-25's C D C B ending as C5 D5 C5 B5.
     Layer 3 shows both as their own tabs since the same day.
     RIFF TIMING (2026-10-13): G, E and D are a quarter-note TRIPLET across
     beats 3 and 4 (2/3 of a beat each), not dotted eighths (0.75 · 0.75 ·
     0.5). Measured off the full mix on the beat map, every riff lap of the
     whole song: with the dotted-eighth reading the highlight lit D about
     110 ms (a quarter of a beat) after the record played it; as a triplet
     G, E and D each land within about 30 ms. The same 2/3 is in ca-10,
     ca-25 and ca-31 — change all three together. */
  {
    id:    'ca-31',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    journey: 'seven-nation-army',   // the button renders under the Level up check — see JOURNEY above
    journeyLayer: 3,
    title:    'Seven Nation Army — The Whole Song in Power Chords',
    title_es: 'Seven Nation Army — La canción completa con acordes de potencia',
    intro:    'Play the whole song in power chords: the same roots, with two more strings added.',
    intro_es: 'Toca la canción completa con acordes de potencia: las mismas raíces, con dos cuerdas más.',
    card: {
      wholeSong: true,  // stops at the end of the song instead of looping
      track: 'seven-nation-army',
      slowest: true,    // four-way speed control (Slow added 2026-10-09): Slowest / Slower / Slow / Normal — the student picks
      caption:    'The whole song in power chords · the riff and G5 – A5',
      caption_es: 'La canción completa con acordes de potencia · el riff y G5 – A5',
      sections: [
        {
          label: 'Intro', label_es: 'Intro',
          caption: 'Intro — the riff, 4 laps', caption_es: 'Intro — el riff, 4 vueltas',
          fromBar: 1, bars: 2, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 1.5 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 0.5 },
            { frets: [['G', 12], ['D', 12], ['A', 10]], note: 'G5', midi: [67, 62, 55], beats: 2/3 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2/3 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 2/3 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 2 },
            { frets: [['G', 4], ['D', 4], ['A', 2]], note: 'B5', midi: [59, 54, 47], beats: 2 }
          ]
        },
        {
          label: 'Verse 1', label_es: 'Estrofa 1',
          caption: 'Verse 1 — the riff, 8 laps', caption_es: 'Estrofa 1 — el riff, 8 vueltas',
          fromBar: 9, bars: 2, reps: 8,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 1.5 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 0.5 },
            { frets: [['G', 12], ['D', 12], ['A', 10]], note: 'G5', midi: [67, 62, 55], beats: 2/3 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2/3 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 2/3 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 2 },
            { frets: [['G', 4], ['D', 4], ['A', 2]], note: 'B5', midi: [59, 54, 47], beats: 2 }
          ]
        },
        {
          label: 'G5 – A5', label_es: 'G5 – A5',
          caption: 'G5 – A5 · 4 strums each', caption_es: 'G5 – A5 · 4 rasgueos cada uno',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 25, bars: 2,
          notes: [
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] }
          ]
        },
        {
          label: 'Chorus 1', label_es: 'Coro 1',
          caption: 'Chorus 1 — 2 times · riff, then the riff ending C5 D5 C5 B5', caption_es: 'Coro 1 — 2 veces · riff, luego el riff que termina C5 D5 C5 B5',
          fromBar: 27, bars: 4, reps: 2,
          rows: [7, 9],     // one riff lap per tab row
          repLabel: 'Time', repLabel_es: 'Vez',
          notes: [
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 1.5 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 0.5 },
            { frets: [['G', 12], ['D', 12], ['A', 10]], note: 'G5', midi: [67, 62, 55], beats: 2/3 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2/3 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 2/3 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 2 },
            { frets: [['G', 4], ['D', 4], ['A', 2]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 1.5 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 0.5 },
            { frets: [['G', 12], ['D', 12], ['A', 10]], note: 'G5', midi: [67, 62, 55], beats: 2/3 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2/3 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 2/3 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 1 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 0.5 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 0.5 },
            { frets: [['G', 4], ['D', 4], ['A', 2]], note: 'B5', midi: [59, 54, 47], beats: 2 }
          ]
        },
        {
          label: 'G5 – A5', label_es: 'G5 – A5',
          caption: 'G5 – A5 · 4 strums each', caption_es: 'G5 – A5 · 4 rasgueos cada uno',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 35, bars: 2,
          notes: [
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] }
          ]
        },
        {
          label: 'Verse 2', label_es: 'Estrofa 2',
          caption: 'Verse 2 — the riff, 12 laps', caption_es: 'Estrofa 2 — el riff, 12 vueltas',
          fromBar: 37, bars: 2, reps: 12,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 1.5 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 0.5 },
            { frets: [['G', 12], ['D', 12], ['A', 10]], note: 'G5', midi: [67, 62, 55], beats: 2/3 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2/3 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 2/3 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 2 },
            { frets: [['G', 4], ['D', 4], ['A', 2]], note: 'B5', midi: [59, 54, 47], beats: 2 }
          ]
        },
        {
          label: 'G5 – A5', label_es: 'G5 – A5',
          caption: 'G5 – A5 · 4 strums each', caption_es: 'G5 – A5 · 4 rasgueos cada uno',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 61, bars: 2,
          notes: [
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] }
          ]
        },
        {
          label: 'Solo', label_es: 'Solo',
          caption: 'Solo — the riff, 8 laps', caption_es: 'Solo — el riff, 8 vueltas',
          fromBar: 63, bars: 2, reps: 8,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 1.5 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 0.5 },
            { frets: [['G', 12], ['D', 12], ['A', 10]], note: 'G5', midi: [67, 62, 55], beats: 2/3 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2/3 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 2/3 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 2 },
            { frets: [['G', 4], ['D', 4], ['A', 2]], note: 'B5', midi: [59, 54, 47], beats: 2 }
          ]
        },
        {
          label: 'G5 – A5', label_es: 'G5 – A5',
          caption: 'G5 – A5 · 4 strums each', caption_es: 'G5 – A5 · 4 rasgueos cada uno',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 79, bars: 2,
          notes: [
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] }
          ]
        },
        {
          label: 'Verse 3', label_es: 'Estrofa 3',
          caption: 'Verse 3 — the riff, 12 laps', caption_es: 'Estrofa 3 — el riff, 12 vueltas',
          fromBar: 81, bars: 2, reps: 12,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 1.5 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 0.5 },
            { frets: [['G', 12], ['D', 12], ['A', 10]], note: 'G5', midi: [67, 62, 55], beats: 2/3 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2/3 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 2/3 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 2 },
            { frets: [['G', 4], ['D', 4], ['A', 2]], note: 'B5', midi: [59, 54, 47], beats: 2 }
          ]
        },
        {
          label: 'G5 – A5', label_es: 'G5 – A5',
          caption: 'G5 – A5 · 4 strums each', caption_es: 'G5 – A5 · 4 rasgueos cada uno',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 105, bars: 2,
          notes: [
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] }
          ]
        },
        {
          label: 'Chorus 2', label_es: 'Coro 2',
          caption: 'Chorus 2 — 2 times · riff, then the riff ending C5 D5 C5 B5', caption_es: 'Coro 2 — 2 veces · riff, luego el riff que termina C5 D5 C5 B5',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 107, bars: 4, reps: 2,
          rows: [7, 9],     // one riff lap per tab row
          repLabel: 'Time', repLabel_es: 'Vez',
          notes: [
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 1.5 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 0.5 },
            { frets: [['G', 12], ['D', 12], ['A', 10]], note: 'G5', midi: [67, 62, 55], beats: 2/3 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2/3 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 2/3 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 2 },
            { frets: [['G', 4], ['D', 4], ['A', 2]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 1.5 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 0.5 },
            { frets: [['G', 12], ['D', 12], ['A', 10]], note: 'G5', midi: [67, 62, 55], beats: 2/3 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2/3 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 2/3 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 1 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 0.5 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 0.5 },
            { frets: [['G', 4], ['D', 4], ['A', 2]], note: 'B5', midi: [59, 54, 47], beats: 2 }
          ]
        },
        {
          label: 'Ending', label_es: 'Final',
          caption: 'Ending — one E5, let it ring', caption_es: 'Final — un E5, déjalo sonar',
          fromBar: 115, bars: 2,
          notes: [
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 8 }
          ]
        }
      ],
      checks: [
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play the whole song with the band, intro to the end, without stopping.',
          text_es: 'Toca la canción completa con la banda, de la intro al final, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band without stopping.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda, sin detenerte.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* "Luna" — The Whole Song in Power Chords (2026-10-05). ca-27's
     sections and bars with Journey Layer 3's loop: F5 (low E fret 1) and A5
     (low E fret 5 — the same shape slid four frets), two strums per bar, one
     on each big beat. The last F5 is one strum, left ringing. Layer 3's D5
     belongs to the record's 120 BPM opening, which is before bar 1 and not on
     this card. */
  {
    id:    'ca-32',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    journey: 'luna',   // the button renders under the Level up check — see JOURNEY above
    journeyLayer: 3,
    title:    '"Luna" — The Whole Song in Power Chords',
    title_es: '"Luna" — La canción completa con acordes de potencia',
    intro:    'Play the whole song in power chords: the same roots, with two more strings added.',
    intro_es: 'Toca la canción completa con acordes de potencia: las mismas raíces, con dos cuerdas más.',
    card: {
      wholeSong: true,  // stops at the end of the song instead of looping
      track: 'luna',
      chordGrid: true,  // chord grid: each chord once, cursor on the beats only (2026-10-26) — see CARD above
      slowest: true,    // four-way speed control (Slow added 2026-10-09): Slowest / Slower / Slow / Normal — the student picks
      caption:    'The whole song in power chords',
      caption_es: 'La canción completa con acordes de potencia',
      sections: [
        {
          label: 'Intro', label_es: 'Intro',
          caption: 'Intro — F5 F5 A5 A5, 2 laps', caption_es: 'Intro — F5 F5 A5 A5, 2 vueltas',
          fromBar: 1, bars: 4, reps: 2,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] }
          ]
        },
        {
          label: 'Verse 1', label_es: 'Estrofa 1',
          caption: 'Verse 1 — F5 F5 A5 A5, 4 laps', caption_es: 'Estrofa 1 — F5 F5 A5 A5, 4 vueltas',
          fromBar: 9, bars: 4, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] }
          ]
        },
        {
          label: 'Requinto (lead guitar)', label_es: 'Requinto (guitarra líder)',
          caption: 'Requinto — F5 F5 A5 A5, no singing', caption_es: 'Requinto — F5 F5 A5 A5, sin canto',
          fromBar: 25, bars: 4,
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] }
          ]
        },
        {
          label: 'Verse 2', label_es: 'Estrofa 2',
          caption: 'Verse 2 — F5 F5 A5 A5, 4 laps', caption_es: 'Estrofa 2 — F5 F5 A5 A5, 4 vueltas',
          fromBar: 29, bars: 4, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] }
          ]
        },
        {
          label: 'Outro', label_es: 'Final',
          caption: 'Outro — F5 F5 A5 A5 twice, then the last F5', caption_es: 'Final — F5 F5 A5 A5 dos veces, y el último F5',
          fromBar: 45, bars: 9,
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 2 }
          ]
        }
      ],
      checks: [
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play the whole song with the band, intro to the end, without stopping.',
          text_es: 'Toca la canción completa con la banda, de la intro al final, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band without stopping.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda, sin detenerte.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* Sweet Child O' Mine — The Whole Song in Power Chords (2026-10-05).
     ca-28's sections and bars, every root turned into a power chord on the
     same string and fret: D5, C5 and B5 rooted on the A string, G5 on the low
     E string, A5 and E5 on the open strings — Journey Layer 3's verse and
     chorus shapes. C5 and D5 stay on the A string (frets 3 and 5) in the
     outro too, because the record puts C-D-G inside one bar; Layer 3's
     outro tab was moved to the same shapes the same day (Jonathan,
     2026-10-05 — it used to slide them up the low E string to frets 8 and
     10). Same bars and chord lengths
     as ca-28 and Layer 3. The card shows where the chords change, not the
     strumming pattern (card.chordGrid, 2026-10-26). */
  {
    id:    'ca-33',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    journey: 'sweet-child-o-mine',   // the button renders under the Level up check — see JOURNEY above
    journeyLayer: 3,
    title:    'Sweet Child O\' Mine — The Whole Song in Power Chords',
    title_es: 'Sweet Child O\' Mine — La canción completa con acordes de potencia',
    intro:    'Play the whole song in power chords: the same roots, with two more strings added.',
    intro_es: 'Toca la canción completa con acordes de potencia: las mismas raíces, con dos cuerdas más.',
    card: {
      wholeSong: true,  // stops at the end of the song instead of looping
      track: 'sweet-child-o-mine',
      chordGrid: true,  // chord grid: each chord once, cursor on the beats only (2026-10-26) — see CARD above
      slowest: true,    // four-way speed control (Slow added 2026-10-09): Slowest / Slower / Slow / Normal — the student picks
      caption:    'The whole song in power chords',
      caption_es: 'La canción completa con acordes de potencia',
      sections: [
        {
          label: 'Intro', label_es: 'Intro',
          caption: 'Intro — D5 D5 C5 C5 G5 G5 D5 D5, 3 laps', caption_es: 'Intro — D5 D5 C5 C5 G5 G5 D5 D5, 3 vueltas',
          fromBar: 1, bars: 8, reps: 3,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 4 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 4 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 }
          ]
        },
        {
          label: 'Verse 1', label_es: 'Estrofa 1',
          caption: 'Verse 1 — D5 D5 C5 C5 G5 G5 D5 D5, 2 laps', caption_es: 'Estrofa 1 — D5 D5 C5 C5 G5 G5 D5 D5, 2 vueltas',
          fromBar: 25, bars: 8, reps: 2,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 4 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 4 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 }
          ]
        },
        {
          label: 'Chorus 1', label_es: 'Coro 1',
          caption: 'Chorus 1 — A5 C5 D5 D5, 2 laps', caption_es: 'Coro 1 — A5 C5 D5 D5, 2 vueltas',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 41, bars: 4, reps: 2,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['G', 2], ['D', 2], ['A', 0]], note: 'A5', midi: [57, 52, 45], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 }
          ]
        },
        {
          label: 'Riff 1', label_es: 'Riff 1',
          caption: 'Riff 1 — D5 D5 C5 C5 G5 G5 D5 D5, no singing', caption_es: 'Riff 1 — D5 D5 C5 C5 G5 G5 D5 D5, sin canto',
          fromBar: 49, bars: 8,
          notes: [
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 4 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 4 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 }
          ]
        },
        {
          label: 'Verse 2', label_es: 'Estrofa 2',
          caption: 'Verse 2 — D5 D5 C5 C5 G5 G5 D5 D5, 2 laps', caption_es: 'Estrofa 2 — D5 D5 C5 C5 G5 G5 D5 D5, 2 vueltas',
          fromBar: 57, bars: 8, reps: 2,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 4 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 4 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 }
          ]
        },
        {
          label: 'Chorus 2', label_es: 'Coro 2',
          caption: 'Chorus 2 — A5 C5 D5 D5, 2 laps', caption_es: 'Coro 2 — A5 C5 D5 D5, 2 vueltas',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 73, bars: 4, reps: 2,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['G', 2], ['D', 2], ['A', 0]], note: 'A5', midi: [57, 52, 45], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 }
          ]
        },
        {
          label: 'Riff 2', label_es: 'Riff 2',
          caption: 'Riff 2 — D5 D5 C5 C5 G5 G5 D5 D5, 2 laps, no singing', caption_es: 'Riff 2 — D5 D5 C5 C5 G5 G5 D5 D5, 2 vueltas, sin canto',
          fromBar: 81, bars: 8, reps: 2,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 4 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 4 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 }
          ]
        },
        {
          label: 'Chorus 3', label_es: 'Coro 3',
          caption: 'Chorus 3 — A5 C5 D5 D5, 4 laps', caption_es: 'Coro 3 — A5 C5 D5 D5, 4 vueltas',
          lineEnd: true,  // Song Journey whole-song tab: this section ends its line
          fromBar: 97, bars: 4, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['G', 2], ['D', 2], ['A', 0]], note: 'A5', midi: [57, 52, 45], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50], beats: 4 }
          ]
        },
        {
          label: 'Solo 1', label_es: 'Solo 1',
          caption: 'Solo 1 — E5 C5 B5 A5 four times, then one more A5', caption_es: 'Solo 1 — E5 C5 B5 A5 cuatro veces, y un A5 más',
          fromBar: 113, bars: 17,
          notes: [
            { frets: [['D', 2], ['A', 2], ['E', 0]], note: 'E5', midi: [52, 47, 40], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 4 },
            { frets: [['G', 4], ['D', 4], ['A', 2]], note: 'B5', midi: [59, 54, 47], beats: 4 },
            { frets: [['G', 2], ['D', 2], ['A', 0]], note: 'A5', midi: [57, 52, 45], beats: 4 },
            { frets: [['D', 2], ['A', 2], ['E', 0]], note: 'E5', midi: [52, 47, 40], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 4 },
            { frets: [['G', 4], ['D', 4], ['A', 2]], note: 'B5', midi: [59, 54, 47], beats: 4 },
            { frets: [['G', 2], ['D', 2], ['A', 0]], note: 'A5', midi: [57, 52, 45], beats: 4 },
            { frets: [['D', 2], ['A', 2], ['E', 0]], note: 'E5', midi: [52, 47, 40], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 4 },
            { frets: [['G', 4], ['D', 4], ['A', 2]], note: 'B5', midi: [59, 54, 47], beats: 4 },
            { frets: [['G', 2], ['D', 2], ['A', 0]], note: 'A5', midi: [57, 52, 45], beats: 4 },
            { frets: [['D', 2], ['A', 2], ['E', 0]], note: 'E5', midi: [52, 47, 40], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 4 },
            { frets: [['G', 4], ['D', 4], ['A', 2]], note: 'B5', midi: [59, 54, 47], beats: 4 },
            { frets: [['G', 2], ['D', 2], ['A', 0]], note: 'A5', midi: [57, 52, 45], beats: 4 },
            { frets: [['G', 2], ['D', 2], ['A', 0]], note: 'A5', midi: [57, 52, 45], beats: 4 }
          ]
        },
        {
          label: 'Solo 2', label_es: 'Solo 2',
          caption: 'Solo 2 — E5 G5 A5, then C5 D5 G5 in one bar, 4 laps', caption_es: 'Solo 2 — E5 G5 A5, y C5 D5 G5 en un compás, 4 vueltas',
          fromBar: 130, bars: 4, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 2], ['A', 2], ['E', 0]], note: 'E5', midi: [52, 47, 40], beats: 4 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 4 },
            { frets: [['G', 2], ['D', 2], ['A', 0]], note: 'A5', midi: [57, 52, 45], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 2 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] }
          ]
        },
        {
          label: 'Outro', label_es: 'Final',
          caption: 'Outro — E5 G5 A5, then C5 D5 G5 in one bar, 7 laps', caption_es: 'Final — E5 G5 A5, y C5 D5 G5 en un compás, 7 vueltas',
          fromBar: 146, bars: 4, reps: 7,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 2], ['A', 2], ['E', 0]], note: 'E5', midi: [52, 47, 40], beats: 4 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 4 },
            { frets: [['G', 2], ['D', 2], ['A', 0]], note: 'A5', midi: [57, 52, 45], beats: 4 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 2 },
            { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] }
          ]
        },
        {
          label: 'Ending', label_es: 'Cierre',
          caption: 'Ending — E5 G5 A5, then G5 and A5 in one bar, then E5 to the end', caption_es: 'Cierre — E5 G5 A5, luego G5 y A5 en un compás, y E5 hasta el final',
          fromBar: 174, bars: 10,
          notes: [
            { frets: [['D', 2], ['A', 2], ['E', 0]], note: 'E5', midi: [52, 47, 40], beats: 4 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 4 },
            { frets: [['G', 2], ['D', 2], ['A', 0]], note: 'A5', midi: [57, 52, 45], beats: 4 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 2 },  // bar 177: G5 2 · A5 2, as ca-28 (2026-10-15)
            { frets: [['G', 2], ['D', 2], ['A', 0]], note: 'A5', midi: [57, 52, 45], beats: 2 },
            { frets: [['D', 2], ['A', 2], ['E', 0]], note: 'E5', midi: [52, 47, 40], beats: 4 },
            { frets: [['D', 2], ['A', 2], ['E', 0]], note: 'E5', midi: [52, 47, 40], beats: 4 },
            { frets: [['D', 2], ['A', 2], ['E', 0]], note: 'E5', midi: [52, 47, 40], beats: 4 },
            { frets: [['D', 2], ['A', 2], ['E', 0]], note: 'E5', midi: [52, 47, 40], beats: 4 },
            { frets: [['D', 2], ['A', 2], ['E', 0]], note: 'E5', midi: [52, 47, 40], beats: 4 },
            { frets: [['D', 2], ['A', 2], ['E', 0]], note: 'E5', midi: [52, 47, 40], beats: 4 }
          ]
        }
      ],
      checks: [
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play the whole song with the band, intro to the end, without stopping.',
          text_es: 'Toca la canción completa con la banda, de la intro al final, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band without stopping.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda, sin detenerte.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* Las Mañanitas — Ariel Camacho y Los Plebes del Rancho's recording
     (Jonathan, 2026-10-13). Built to be given to INDIVIDUAL students from
     the console board's "Who" picker, not the whole class; since 2026-10-20
     it is a library song, on the Songs page for everyone (see `library`
     below). It is a Focus-view ladder, the
     chord-change ladder: A, E7, D, the changes in 3/4, then the whole song
     with its words. Rebuilt 2026-10-14 from Jonathan's chord sheet for the
     Los Plebes del Rancho version (a PDF he uploaded): the song
     uses D as well as A and E7, so the old A-and-E7-only ladder couldn't
     reach the song. (The sheet writes Am in verse 2; the record plays A
     there, and so does this card — see ca-35.) Lyrics and chord
     placement come from that sheet ("fila" -> "pila", "solesito" ->
     "solecito", accents added; "le venimos" stays as the record sings it —
     Jonathan, 2026-10-26). The sheet's
     second strum pattern (down-up for the first lines of each verse) is
     left out on purpose — one strum all the way through — and so are its
     solo (tremolo) and the fills between verse lines. The requinto (lead guitar) intro and outro
     from the same sheet are the last two steps (Jonathan, 2026-10-14: "and
     the lead guitar parts?"); the 0h2 hammer-on is written as two picked
     notes, and the outro is the sheet's easier version. Same id, so
     nobody's completion moves. Step ticks are NOT day-scoped: since
     2026-10-01 they are saved to progress/{uid}.caSteps, keyed
     `ca-34:<step index>`, so inserting, removing or reordering a step moves
     every saved tick after it (the 2026-10-14 insert was harmless only
     because the card was a few hours old) — add a new step at the end.
     The last two steps play the record (the 'las-mananitas' snippet track,
     2026-10-14). No video. */
  {
    id:    'ca-34',
    view:  'focus',   // one step at a time — see VIEW above
    library: true,    // on the Songs page for everyone (Jonathan, 2026-10-20: "move las mananitas from class activities to songs") — see LIBRARY above
    optional: true,   // Optional until switched to Required on the board (Jonathan, 2026-10-14) — see OPTIONAL above
    /* Full chords / Power chords switch (Jonathan, 2026-10-16) — see
       caView in app.js. Module 3's shapes, all in frets 5-9 so the hand
       barely moves: A5 on the low E string, E5 and D5 on the A string. */
    chordStart: 'power',   // opens on Power chords until the student picks (Jonathan, 2026-10-16)
    chordVersions: {
      power: {
        A:  { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
        E7: { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52] },
        D:  { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
      },
    },
    title:    '"Las Mañanitas" - Ariel Camacho y Los Plebes del Rancho — A, E7 and D',
    title_es: '"Las Mañanitas" - Ariel Camacho y Los Plebes del Rancho — A, E7 y D',
    title_power:    '"Las Mañanitas" - Ariel Camacho y Los Plebes del Rancho — A5, E5 and D5',
    title_power_es: '"Las Mañanitas" - Ariel Camacho y Los Plebes del Rancho — A5, E5 y D5',
    intro:    'Learn A, E7 and D and a strum in 3, then play the whole song with the words.',
    intro_es: 'Aprende A, E7 y D y un rasgueo en 3, y luego toda la canción con la letra.',
    intro_power:    'Learn the A5, E5 and D5 power chords and a strum in 3, then play the whole song with the words.',
    intro_power_es: 'Aprende los acordes de potencia A5, E5 y D5 y un rasgueo en 3, y luego toda la canción con la letra.',
    steps: [
      {
        label:    'Practice — The A chord',
        label_es: 'Practica — El acorde A',
        label_power:    'Practice — The A5 power chord',
        label_power_es: 'Practica — El acorde de potencia A5',
        text_power: 'Pick the A5 power chord one string at a time, then strum it, no buzz, three times in a row.',
        text_power_es: 'Toca el acorde de potencia A5 cuerda por cuerda y luego rasguéalo, sin zumbido, tres veces seguidas.',
        text: 'Pick the A chord one string at a time, A string to high e, all ringing, three times in a row.',
        text_es: 'Toca el acorde A cuerda por cuerda, de la cuerda La a la mi aguda, sin zumbido, tres veces seguidas.',
        tab: {
          caption: 'A chord · don\'t play the low E string',
          caption_es: 'Acorde A · no toques la cuerda Mi grave',
          caption_power:    'A5 · only the low E, A and D strings',
          caption_power_es: 'A5 · solo las cuerdas Mi grave, La y Re',
          notes: [
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64] }
          ]
        },
      },
      {
        label:    'Practice — The E7 chord',
        label_es: 'Practica — El acorde E7',
        label_power:    'Practice — The E5 power chord',
        label_power_es: 'Practica — El acorde de potencia E5',
        text_power: 'Pick the E5 power chord one string at a time, then strum it, no buzz, three times in a row.',
        text_power_es: 'Toca el acorde de potencia E5 cuerda por cuerda y luego rasguéalo, sin zumbido, tres veces seguidas.',
        text: 'Pick the E7 chord one string at a time, all six ringing, three times in a row.',
        text_es: 'Toca el acorde E7 cuerda por cuerda, las seis sin zumbido, tres veces seguidas.',
        tab: {
          caption: 'E7 chord · all six strings',
          caption_es: 'Acorde E7 · las seis cuerdas',
          caption_power:    'E5 · only the A, D and G strings',
          caption_power_es: 'E5 · solo las cuerdas La, Re y Sol',
          notes: [
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] }
          ]
        },
      },
      {
        label:    'Practice — The D chord',
        label_es: 'Practica — El acorde D',
        label_power:    'Practice — The D5 power chord',
        label_power_es: 'Practica — El acorde de potencia D5',
        text_power: 'Pick the D5 power chord one string at a time, then strum it, no buzz, three times in a row.',
        text_power_es: 'Toca el acorde de potencia D5 cuerda por cuerda y luego rasguéalo, sin zumbido, tres veces seguidas.',
        text: 'Pick the D chord one string at a time, D string to high e, all ringing, three times in a row.',
        text_es: 'Toca el acorde D cuerda por cuerda, de la cuerda Re a la mi aguda, sin zumbido, tres veces seguidas.',
        tab: {
          caption: 'D chord · start on the D string',
          caption_es: 'Acorde D · empieza en la cuerda Re',
          caption_power:    'D5 · only the A, D and G strings',
          caption_power_es: 'D5 · solo las cuerdas La, Re y Sol',
          notes: [
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66] }
          ]
        },
      },
      {
        label:    'Practice — The strum in 3',
        label_es: 'Practica — El rasgueo en 3',
        text: 'Play the tab four times without stopping, loud on every 1.',
        text_es: 'Toca la tablatura cuatro veces completa sin detenerte, fuerte en cada 1.',
        tab: {
          caption: '3 strums per bar · A · E7 · D · E7, then back to A',
          caption_es: '3 rasgueos por compás · A · E7 · D · E7, y vuelve a A',
          caption_power:    '3 strums per bar · A5 · E5 · D5 · E5, then back to A5',
          caption_power_es: '3 rasgueos por compás · A5 · E5 · D5 · E5, y vuelve a A5',
          notes: [
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64] },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64] },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64] },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66] },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66] },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66] },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] }
          ]
        },
      },
      {
        label:    'Practice — The whole song',
        label_es: 'Practica — Toda la canción',
        text: 'Play both verses and both choruses without stopping, 3 strums a bar, loud on 1.',
        text_es: 'Toca las dos estrofas y los dos coros sin detenerte, 3 rasgueos por compás, fuerte en el 1.',
        tab: {
          caption: 'Las Mañanitas · the chord in [ ] starts on the next word',
          caption_es: 'Las Mañanitas · el acorde entre [ ] empieza en la palabra siguiente',
          phrases: [
          { label: 'Verse 1 · [A] Qué linda está la mañana, en que vengo a [E7] saludarte',
            label_es: 'Estrofa 1 · [A] Qué linda está la mañana, en que vengo a [E7] saludarte',
            notes: [
              { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64] },
              { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] }
            ] },
          { label: '[E7] Venimos todos con gusto y [D] placer a [E7] felici[A]tarte',
            label_es: '[E7] Venimos todos con gusto y [D] placer a [E7] felici[A]tarte',
            notes: [
              { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] },
              { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66] },
              { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] },
              { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64] }
            ] },
          { label: '[A] El día en que tú naciste nacieron todas las [E7] flores',
            label_es: '[A] El día en que tú naciste nacieron todas las [E7] flores',
            notes: [
              { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64] },
              { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] }
            ] },
          { label: 'Y [E7] en la pila del bautizo can[D]taron los [E7] rui[A]señores',
            label_es: 'Y [E7] en la pila del bautizo can[D]taron los [E7] rui[A]señores',
            notes: [
              { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] },
              { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66] },
              { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] },
              { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64] }
            ] },
          { label: 'Chorus · [E7] Ya viene amaneciendo, ya la [D] luz del día nos dio',
            label_es: 'Coro · [E7] Ya viene amaneciendo, ya la [D] luz del día nos dio',
            notes: [
              { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] },
              { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66] }
            ] },
          { label: 'Le[A]vántate de mañana, mira [E7] que ya amane[A]ció',
            label_es: 'Le[A]vántate de mañana, mira [E7] que ya amane[A]ció',
            notes: [
              { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64] },
              { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] },
              { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64] }
            ] },
          { label: 'Verse 2 · [A] Quisiera ser un San Juan, quisiera ser un San [E7] Pedro',
            label_es: 'Estrofa 2 · [A] Quisiera ser un San Juan, quisiera ser un San [E7] Pedro',
            notes: [
              { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64] },
              { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] }
            ] },
          { label: '[E7] Para venirte a cantar con la [D] música [E7] del [A] cielo',
            label_es: '[E7] Para venirte a cantar con la [D] música [E7] del [A] cielo',
            notes: [
              { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] },
              { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66] },
              { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] },
              { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64] }
            ] },
          { label: '[A] Quisiera ser solecito para entrar por tu [E7] ventana',
            label_es: '[A] Quisiera ser solecito para entrar por tu [E7] ventana',
            notes: [
              { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64] },
              { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] }
            ] },
          { label: 'Y [E7] darte los buenos días, acostadita en tu [A] cama',
            label_es: 'Y [E7] darte los buenos días, acostadita en tu [A] cama',
            notes: [
              { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] },
              { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64] }
            ] },
          { label: 'Chorus · [E7] Con jazmines y flores este [D] día voy a adornar',
            label_es: 'Coro · [E7] Con jazmines y flores este [D] día voy a adornar',
            notes: [
              { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] },
              { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66] }
            ] },
          { label: 'Hoy por [A] ser tu cumpleaños le [E7] venimos a can[A]tar',
            label_es: 'Hoy por [A] ser tu cumpleaños le [E7] venimos a can[A]tar',
            notes: [
              { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64] },
              { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64] },
              { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64] }
            ] }
          ]
        },
      },
      {
        label:    'Practice — The intro on requinto (lead guitar)',
        label_es: 'Practica — La intro en el requinto (guitarra líder)',
        text: 'Play the whole intro without stopping, at any speed, picking both notes of each pair together.',
        text_es: 'Toca toda la intro sin detenerte, a cualquier velocidad, con las dos notas de cada par juntas.',
        tab: {
          caption: 'Intro · requinto',
          caption_es: 'Intro · requinto',
          notes: [
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59] },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59] },
            { string: 'G', fret: 2, note: 'A', midi: 57 },
            { string: 'G', fret: 1, note: 'G#', midi: 56 },
            { string: 'G', fret: 1, note: 'G#', midi: 56 },
            { string: 'G', fret: 0, note: 'G', midi: 55 },
            { string: 'G', fret: 1, note: 'G#', midi: 56 },
            { string: 'G', fret: 1, note: 'G#', midi: 56 },
            { string: 'G', fret: 2, note: 'A', midi: 57 },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59] },
            { string: 'B', fret: 2, note: 'C#', midi: 61 },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59] },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59] },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59] },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59] },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61] },
            { frets: [['e', 2], ['B', 3]], note: 'D/F#', midi: [66, 62] },
            { frets: [['e', 2], ['B', 3]], note: 'D/F#', midi: [66, 62] },
            { frets: [['e', 4], ['B', 5]], note: 'E/G#', midi: [68, 64] },
            { frets: [['e', 4], ['B', 5]], note: 'E/G#', midi: [68, 64] },
            { frets: [['e', 2], ['B', 3]], note: 'D/F#', midi: [66, 62] },
            { string: 'B', fret: 2, note: 'C#', midi: 61 },
            { string: 'B', fret: 3, note: 'D', midi: 62 },
            { string: 'B', fret: 3, note: 'D', midi: 62 },
            { string: 'B', fret: 2, note: 'C#', midi: 61 },
            { string: 'B', fret: 3, note: 'D', midi: 62 },
            { string: 'B', fret: 2, note: 'C#', midi: 61 },
            { string: 'B', fret: 3, note: 'D', midi: 62 },
            { string: 'e', fret: 0, note: 'E', midi: 64 },
            { string: 'e', fret: 2, note: 'F#', midi: 66 },
            { string: 'e', fret: 0, note: 'E', midi: 64 },
            { string: 'B', fret: 3, note: 'D', midi: 62 },
            { string: 'B', fret: 2, note: 'C#', midi: 61 },
            { string: 'B', fret: 0, note: 'B', midi: 59 },
            { string: 'G', fret: 2, note: 'A', midi: 57 },
            { string: 'G', fret: 2, note: 'A', midi: 57 },
            { string: 'G', fret: 1, note: 'G#', midi: 56 },
            { string: 'G', fret: 2, note: 'A', midi: 57 },
            { string: 'G', fret: 2, note: 'A', midi: 57 },
            { string: 'G', fret: 2, note: 'A', midi: 57 },
            { string: 'G', fret: 1, note: 'G#', midi: 56 },
            { string: 'G', fret: 2, note: 'A', midi: 57 },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59] },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61] },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61] },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61] },
            { frets: [['e', 4], ['B', 5]], note: 'E/G#', midi: [68, 64] },
            { frets: [['e', 2], ['B', 3]], note: 'D/F#', midi: [66, 62] },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61] },
            { frets: [['e', 2], ['B', 3]], note: 'D/F#', midi: [66, 62] },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61] },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59] },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61] },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59] },
            { string: 'G', fret: 2, note: 'A', midi: 57 },
            { string: 'G', fret: 2, note: 'A', midi: 57 },
            { string: 'G', fret: 1, note: 'G#', midi: 56 },
            { string: 'D', fret: 4, note: 'F#', midi: 54 },
            { string: 'D', fret: 2, note: 'E', midi: 52 },
            { string: 'D', fret: 0, note: 'D', midi: 50 },
            { string: 'A', fret: 4, note: 'C#', midi: 49 },
            { string: 'A', fret: 2, note: 'B', midi: 47 },
            { string: 'A', fret: 0, note: 'A', midi: 45 },
            { string: 'D', fret: 4, note: 'F#', midi: 54 },
            { string: 'G', fret: 0, note: 'G', midi: 55 },
            { string: 'G', fret: 2, note: 'A', midi: 57 },
            { string: 'G', fret: 4, note: 'B', midi: 59 },
            { string: 'G', fret: 2, note: 'A', midi: 57 },
            { string: 'G', fret: 0, note: 'G', midi: 55 },
            { string: 'G', fret: 4, note: 'B', midi: 59 },
            { string: 'G', fret: 2, note: 'A', midi: 57 },
            { string: 'G', fret: 0, note: 'G', midi: 55 },
            { string: 'D', fret: 4, note: 'F#', midi: 54 },
            { string: 'D', fret: 2, note: 'E', midi: 52 },
            { string: 'D', fret: 0, note: 'D', midi: 50 },
            { string: 'D', fret: 4, note: 'F#', midi: 54 },
            { string: 'G', fret: 2, note: 'A', midi: 57 },
            { string: 'B', fret: 2, note: 'C#', midi: 61 },
            { string: 'G', fret: 4, note: 'B', midi: 59 },
            { string: 'G', fret: 2, note: 'A', midi: 57 },
            { string: 'D', fret: 4, note: 'F#', midi: 54 },
            { string: 'D', fret: 3, note: 'F', midi: 53 },
            { string: 'D', fret: 3, note: 'F', midi: 53 },
            { string: 'D', fret: 2, note: 'E', midi: 52 },
            { string: 'D', fret: 2, note: 'E', midi: 52 },
            { string: 'D', fret: 0, note: 'D', midi: 50 },
            { string: 'B', fret: 6, note: 'F', midi: 65 },
            { string: 'B', fret: 6, note: 'F', midi: 65 },
            { string: 'G', fret: 7, note: 'D', midi: 62 },
            { string: 'B', fret: 6, note: 'F', midi: 65 },
            { string: 'B', fret: 6, note: 'F', midi: 65 },
            { string: 'B', fret: 6, note: 'F', midi: 65 },
            { string: 'G', fret: 7, note: 'D', midi: 62 }
          ]
        },
        snippet: { track: 'las-mananitas', fromBar: 1, bars: 10,
                   label:    'The intro, with the band',
                   label_es: 'La intro, con la banda' },
      },
      {
        label:    'Practice — The outro on requinto (lead guitar)',
        label_es: 'Practica — El final en el requinto (guitarra líder)',
        text: 'Play the outro twice in a row, sliding up the neck without lifting, and let the last chord ring.',
        text_es: 'Toca el final dos veces seguidas, deslizando sin levantar los dedos, y deja sonar el último acorde.',
        tab: {
          caption: 'Outro · requinto · slide up to frets 12 and 14',
          caption_es: 'Final · requinto · desliza a los trastes 12 y 14',
          notes: [
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61] },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61] },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61] },
            { frets: [['e', 2], ['B', 3]], note: 'D/F#', midi: [66, 62] },
            { frets: [['e', 2], ['B', 3]], note: 'D/F#', midi: [66, 62] },
            { frets: [['e', 2], ['B', 3]], note: 'D/F#', midi: [66, 62] },
            { frets: [['e', 4], ['B', 5]], note: 'E/G#', midi: [68, 64] },
            { frets: [['e', 4], ['B', 5]], note: 'E/G#', midi: [68, 64] },
            { frets: [['e', 4], ['B', 5]], note: 'E/G#', midi: [68, 64] },
            { frets: [['e', 5], ['B', 7]], note: 'F#/A', midi: [69, 66] },
            { frets: [['e', 5], ['B', 7]], note: 'F#/A', midi: [69, 66] },
            { frets: [['e', 5], ['B', 7]], note: 'F#/A', midi: [69, 66] },
            { frets: [['e', 12], ['B', 14]], note: 'C#/E', midi: [76, 73] },
            { frets: [['e', 12], ['B', 14]], note: 'C#/E', midi: [76, 73] },
            { frets: [['e', 9], ['B', 10], ['G', 9]], note: 'E/A/C#', midi: [73, 69, 64] }
          ]
        },
        snippet: { track: 'las-mananitas', fromBar: 105, bars: 3,
                   label:    'The end, with the band',
                   label_es: 'El final, con la banda' },
      },
    ],
  },
  /* Las Mañanitas — Play Along (Jonathan, 2026-10-14: "can you add play
     along with the song too?", then the record itself). A whole-song card on
     the RECORD (track 'las-mananitas' in app.js — its comment has how the
     bars were found). Verse 1 to the last chorus, bars 11-104: bar 11 is the
     last intro bar, so the pickup "Qué" is heard; the intro and the outro
     are the requinto's, and ca-34 teaches those with their own snippets.
     ONE COLUMN PER CHORD, not per strum — a column's `beats` is how long the
     band holds that chord (15 = five bars), and the chord grid's directions
     tell the student to strum the way the record does until the next
     chord name. That
     keeps each lyric line on ONE row with its lyric printed over it
     (`rowLabels`, new for this card — pcTabHtml), which is the whole point:
     the student reads the words and sees the change coming. A strum per
     column would have been 100+ columns a verse. The chord on every bar was
     read off the record's bass and harmony (chroma per beat); the "D, then
     E7" bars (23, 42, 78) are one beat of D and two of E7, which is what
     the record plays on "pla-cer a fe-li-ci-", "can-ta-ron los rui-" and
     "mú-si-ca del". Verse 2 is A, not the chord sheet's Am. Given to the
     same individual students as ca-34 from the board's Who picker. */
  {
    id:    'ca-35',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    library: true,    // on the Songs page's More Play Along songs list for everyone — see LIBRARY above
    optional: true,   // Optional until switched to Required on the board — see OPTIONAL above
    /* Full chords / Power chords switch (Jonathan, 2026-10-16) — see
       caView in app.js. Module 3's shapes, all in frets 5-9 so the hand
       barely moves: A5 on the low E string, E5 and D5 on the A string. */
    chordStart: 'power',   // opens on Power chords until the student picks (Jonathan, 2026-10-16)
    chordVersions: {
      power: {
        A:  { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
        E7: { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52] },
        D:  { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
      },
    },
    title:    '"Las Mañanitas" - Ariel Camacho y Los Plebes del Rancho — Play Along',
    title_es: '"Las Mañanitas" - Ariel Camacho y Los Plebes del Rancho — Toca con la canción',
    /* Alternating bass (Jonathan, 2026-10-23; a switch since 2026-10-27:
       "needs alternate bass note option toggle switch") — see BASS NOTES in
       app.js. Strum only / Alternating bass, opening on Alternating bass,
       in BOTH chord versions. Beat 1 of every bar is ONE bass note, the root
       in the first bar of a chord and the 5th in the next, back and forth
       until the chord changes; beats 2 and 3 are the strum. The chord grid
       draws that note on beat 1 of every bar. `bassNotes` is keyed by the
       chord name the card SHOWS (A5 in the power view), each [string, fret]:
         A  = A string / low E      A5 = low E fret 5 / A string fret 7
         E7 = low E / A string 2    E5 = A string 7 / D string 9
         D  = D string / A string   D5 = A string 5 / D string 7
       The power 5ths are the shape's own 2nd note, so the hand never moves.
       `bassDirections` is added to the card's directions line while the
       bass is on (an open card shows no intro). */
    bassStart: 'on',
    bassNotes: {
      A:  { root: ['A', 0], fifth: ['E', 0] },
      E7: { root: ['E', 0], fifth: ['A', 2] },
      D:  { root: ['D', 0], fifth: ['A', 0] },
      A5: { root: ['E', 5], fifth: ['A', 7] },
      E5: { root: ['A', 7], fifth: ['D', 9] },
      D5: { root: ['A', 5], fifth: ['D', 7] },
    },
    bassDirections:    'Pick only the purple, underlined bass note on beat 1, then strum on beats 2 and 3.',
    bassDirections_es: 'Toca solo la nota de bajo morada y subrayada en el tiempo 1 y luego rasguea en los tiempos 2 y 3.',
    intro:    'Play Las Mañanitas with the band, from the first verse to the last chorus.',
    intro_es: 'Toca Las Mañanitas con la banda, de la primera estrofa al último coro.',
    intro_power:    'Play Las Mañanitas in power chords with the band, from the first verse to the last chorus.',
    intro_power_es: 'Toca Las Mañanitas con acordes de potencia y con la banda, de la primera estrofa al último coro.',
    card: {
      /* Not `wholeSong`: a whole-song card is how links to a Core song find
         its play-along, so checks.mjs 1bn wants a `journey` on one (only a
         lyric-sheet or teacher-only card is excused), and 1bq keeps
         `wholeSong` off a library song. Las Mañanitas is a library song
         with no Song Journey page. So it loops — after the last chorus it
         goes back to the section the student started from. */
      track: 'las-mananitas',
      chordGrid: true,  // chord grid: each chord once, cursor on the beats only (2026-10-26) — see CARD above
      slowest: true,    // Slowest / Slower / Slow / Normal
      caption:    'The song in order',
      caption_es: 'La canción en orden',
      sections: [
        {
          label: 'Verse 1', label_es: 'Estrofa 1',
          caption: 'Verse 1 — A, E7 and D', caption_es: 'Estrofa 1 — A, E7 y D',
          caption_power: 'Verse 1 — A5, E5 and D5', caption_power_es: 'Estrofa 1 — A5, E5 y D5',
          fromBar: 11, bars: 36,
          rows: [2, 4, 2, 4],
          rowLabels: [
            '[A] Qué linda está la mañana, en que vengo a [E7] saludarte',
            '[E7] Venimos todos con gusto y [D] placer a [E7] felici[A]tarte',
            '[A] El día en que tú naciste nacieron todas las [E7] flores',
            'Y [E7] en la pila del bautizo can[D]taron los [E7] rui[A]señores'
          ],
          rowLabels_es: [
            '[A] Qué linda está la mañana, en que vengo a [E7] saludarte',
            '[E7] Venimos todos con gusto y [D] placer a [E7] felici[A]tarte',
            '[A] El día en que tú naciste nacieron todas las [E7] flores',
            'Y [E7] en la pila del bautizo can[D]taron los [E7] rui[A]señores'
          ],
          notes: [
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 15 },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64], beats: 15 },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 1 },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64], beats: 2 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 15 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 12 },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64], beats: 18 },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64], beats: 9 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 1 },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64], beats: 2 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 12 }
          ]
        },
        {
          label: 'Chorus 1', label_es: 'Coro 1',
          caption: 'Chorus — E7, D, A', caption_es: 'Coro — E7, D, A',
          caption_power: 'Chorus — E5, D5, A5', caption_power_es: 'Coro — E5, D5, A5',
          fromBar: 47, bars: 8,
          rows: [2, 3],
          rowLabels: [
            '[E7] Ya viene amaneciendo, ya la [D] luz del día nos dio',
            'Le[A]vántate de mañana, mira [E7] que ya amane[A]ció'
          ],
          rowLabels_es: [
            '[E7] Ya viene amaneciendo, ya la [D] luz del día nos dio',
            'Le[A]vántate de mañana, mira [E7] que ya amane[A]ció'
          ],
          notes: [
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 6 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 6 },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64], beats: 3 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 3 }
          ]
        },
        {
          label: 'Solo', label_es: 'Solo',
          chordGrid: false,  // requinto tab, single notes — keeps the note-by-note highlight
          caption: 'Solo — requinto (lead guitar) tab · rhythm guitar keeps strumming E7, D, A, E7, A',
          caption_es: 'Solo — tablatura del requinto (guitarra líder) · la guitarra rítmica sigue rasgueando E7, D, A, E7, A',
          caption_power:    'Solo — requinto (lead guitar) tab · rhythm guitar keeps strumming E5, D5, A5, E5, A5',
          caption_power_es: 'Solo — tablatura del requinto (guitarra líder) · la guitarra rítmica sigue rasgueando E5, D5, A5, E5, A5',
          fromBar: 55, bars: 14,
          /* The requinto solo from Jonathan's chord sheet (2026-10-14: "add the
             solo part to the play along activity"), one row per bar of the
             record. The sheet gives no rhythm, so each note's `beats` is an
             ESTIMATE: the sheet's notes were synthesised with the site's own
             guitar samples and lined up against the record (dynamic time
             warping on the spectrum, bars 55-68), then rounded to quarter
             beats. Two checks back it: the solo opens with the intro's first
             ten seconds note for note (cross-correlation finds them 89.7 s
             apart, which puts the solo's first note on bar 55), and the
             run up the neck peaks at frets 12/14 in bar 63 in both the
             alignment and the record's pitch. Within a bar the highlight
             can be a fraction of a beat early or late. Notes the sheet marks
             N (tremolo) fill bars 4-11; those rows' labels say so. */
          rows: [9, 7, 8, 4, 6, 5, 6, 4, 6, 5, 5, 8, 10, 6],
          rowLabels: [
            'Bar 1',
            'Bar 2',
            'Bar 3',
            'Bar 4 · tremolo: pick each note fast and steady',
            'Bar 5 · tremolo: pick each note fast and steady',
            'Bar 6 · tremolo: pick each note fast and steady',
            'Bar 7 · tremolo: pick each note fast and steady',
            'Bar 8 · tremolo: pick each note fast and steady',
            'Bar 9 · tremolo: pick each note fast and steady',
            'Bar 10 · tremolo: pick each note fast and steady',
            'Bar 11 · tremolo: pick each note fast and steady',
            'Bar 12',
            'Bar 13',
            'Bar 14'
          ],
          rowLabels_es: [
            'Compás 1',
            'Compás 2',
            'Compás 3',
            'Compás 4 · trémolo: toca cada nota rápido y parejo',
            'Compás 5 · trémolo: toca cada nota rápido y parejo',
            'Compás 6 · trémolo: toca cada nota rápido y parejo',
            'Compás 7 · trémolo: toca cada nota rápido y parejo',
            'Compás 8 · trémolo: toca cada nota rápido y parejo',
            'Compás 9 · trémolo: toca cada nota rápido y parejo',
            'Compás 10 · trémolo: toca cada nota rápido y parejo',
            'Compás 11 · trémolo: toca cada nota rápido y parejo',
            'Compás 12',
            'Compás 13',
            'Compás 14'
          ],
          notes: [
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59], beats: 0.25 },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59], beats: 0.5 },
            { string: 'G', fret: 2, note: 'A', midi: 57, beats: 0.25 },
            { string: 'G', fret: 1, note: 'G#', midi: 56, beats: 0.5 },
            { string: 'G', fret: 1, note: 'G#', midi: 56, beats: 0.25 },
            { string: 'D', fret: 4, note: 'F#', midi: 54, beats: 0.5 },
            { string: 'G', fret: 1, note: 'G#', midi: 56, beats: 0.25 },
            { string: 'G', fret: 1, note: 'G#', midi: 56, beats: 0.25 },
            { string: 'G', fret: 2, note: 'A', midi: 57, beats: 0.5 },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59], beats: 0.25 },
            { string: 'B', fret: 2, note: 'C#', midi: 61, beats: 0.25 },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59], beats: 0.5 },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59], beats: 0.5 },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59], beats: 0.25 },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59], beats: 0.5 },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61], beats: 0.5 },
            { frets: [['e', 2], ['B', 3]], note: 'D/F#', midi: [66, 62], beats: 0.25 },
            { frets: [['e', 2], ['B', 3]], note: 'D/F#', midi: [66, 62], beats: 0.5 },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61], beats: 0.5 },
            { frets: [['e', 4], ['B', 5]], note: 'E/G#', midi: [68, 64], beats: 0.25 },
            { frets: [['e', 4], ['B', 5]], note: 'E/G#', midi: [68, 64], beats: 0.5 },
            { frets: [['e', 2], ['B', 3]], note: 'D/F#', midi: [66, 62], beats: 0.25 },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61], beats: 0.25 },
            { frets: [['e', 2], ['B', 3]], note: 'D/F#', midi: [66, 62], beats: 0.75 },
            { frets: [['e', 2], ['B', 3]], note: 'D/F#', midi: [66, 62], beats: 0.5 },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61], beats: 1.5 },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59], beats: 0.5 },
            { string: 'G', fret: 2, note: 'A', midi: 57, beats: 0.5 },
            { string: 'G', fret: 2, note: 'A', midi: 57, beats: 0.5 },
            { string: 'G', fret: 1, note: 'G#', midi: 56, beats: 0.5 },
            { string: 'G', fret: 2, note: 'A', midi: 57, beats: 0.5 },
            { string: 'G', fret: 2, note: 'A', midi: 57, beats: 0.5 },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59], beats: 0.5 },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59], beats: 0.5 },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61], beats: 0.75 },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61], beats: 0.75 },
            { frets: [['e', 4], ['B', 5]], note: 'E/G#', midi: [68, 64], beats: 0.5 },
            { frets: [['e', 2], ['B', 3]], note: 'D/F#', midi: [66, 62], beats: 0.5 },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61], beats: 0.5 },
            { frets: [['e', 2], ['B', 3]], note: 'D/F#', midi: [66, 62], beats: 0.5 },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61], beats: 0.5 },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59], beats: 0.5 },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61], beats: 0.5 },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59], beats: 0.5 },
            { string: 'G', fret: 2, note: 'A', midi: 57, beats: 0.75 },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61], beats: 0.5 },
            { frets: [['e', 2], ['B', 3]], note: 'D/F#', midi: [66, 62], beats: 0.75 },
            { frets: [['e', 4], ['B', 5]], note: 'E/G#', midi: [68, 64], beats: 0.75 },
            { frets: [['e', 5], ['B', 7]], note: 'F#/A', midi: [69, 66], beats: 0.75 },
            { frets: [['e', 7], ['B', 9]], note: 'G#/B', midi: [71, 68], beats: 0.5 },
            { frets: [['e', 9], ['B', 10]], note: 'A/C#', midi: [73, 69], beats: 0.5 },
            { frets: [['e', 10], ['B', 12]], note: 'B/D', midi: [74, 71], beats: 0.25 },
            { frets: [['e', 11], ['B', 13]], note: 'C/D#', midi: [75, 72], beats: 0.5 },
            { frets: [['e', 12], ['B', 14]], note: 'C#/E', midi: [76, 73], beats: 0.5 },
            { frets: [['e', 11], ['B', 13]], note: 'C/D#', midi: [75, 72], beats: 0.5 },
            { frets: [['e', 10], ['B', 12]], note: 'B/D', midi: [74, 71], beats: 0.5 },
            { frets: [['e', 9], ['B', 10]], note: 'A/C#', midi: [73, 69], beats: 0.5 },
            { frets: [['e', 7], ['B', 9]], note: 'G#/B', midi: [71, 68], beats: 0.75 },
            { frets: [['e', 5], ['B', 7]], note: 'F#/A', midi: [69, 66], beats: 0.75 },
            { frets: [['e', 4], ['B', 5]], note: 'E/G#', midi: [68, 64], beats: 1 },
            { frets: [['e', 2], ['B', 3]], note: 'D/F#', midi: [66, 62], beats: 0.75 },
            { frets: [['e', 0], ['B', 2]], note: 'C#/E', midi: [64, 61], beats: 0.75 },
            { frets: [['e', 0], ['B', 0]], note: 'B/E', midi: [64, 59], beats: 0.5 },
            { string: 'B', fret: 2, note: 'C#', midi: 61, beats: 0.25 },
            { string: 'B', fret: 2, note: 'C#', midi: 61, beats: 0.25 },
            { string: 'B', fret: 1, note: 'C', midi: 60, beats: 0.25 },
            { string: 'G', fret: 4, note: 'B', midi: 59, beats: 0.25 },
            { string: 'G', fret: 2, note: 'A', midi: 57, beats: 0.25 },
            { string: 'G', fret: 0, note: 'G', midi: 55, beats: 0.25 },
            { string: 'D', fret: 4, note: 'F#', midi: 54, beats: 0.5 },
            { string: 'D', fret: 2, note: 'E', midi: 52, beats: 0.5 },
            { string: 'D', fret: 0, note: 'D', midi: 50, beats: 0.5 },
            { frets: [['B', 2], ['G', 2], ['D', 4]], note: 'F#/A/C#', midi: [61, 57, 54], beats: 0.5 },
            { string: 'G', fret: 4, note: 'B', midi: 59, beats: 0.25 },
            { string: 'G', fret: 2, note: 'A', midi: 57, beats: 0.25 },
            { frets: [['B', 2], ['G', 2], ['D', 4]], note: 'F#/A/C#', midi: [61, 57, 54], beats: 0.5 },
            { string: 'G', fret: 4, note: 'B', midi: 59, beats: 0.25 },
            { string: 'G', fret: 2, note: 'A', midi: 57, beats: 0.25 },
            { string: 'G', fret: 0, note: 'G', midi: 55, beats: 0.25 },
            { string: 'D', fret: 4, note: 'F#', midi: 54, beats: 0.25 },
            { string: 'D', fret: 2, note: 'E', midi: 52, beats: 0.25 },
            { string: 'D', fret: 0, note: 'D', midi: 50, beats: 0.25 },
            { string: 'B', fret: 6, note: 'F', midi: 65, beats: 0.5 },
            { string: 'B', fret: 6, note: 'F', midi: 65, beats: 1 },
            { string: 'G', fret: 7, note: 'D', midi: 62, beats: 0.25 },
            { string: 'B', fret: 6, note: 'F', midi: 65, beats: 0.5 },
            { string: 'B', fret: 6, note: 'F', midi: 65, beats: 0.25 },
            { string: 'B', fret: 6, note: 'F', midi: 65, beats: 0.25 },
            { string: 'G', fret: 7, note: 'D', midi: 62, beats: 0.75 }
          ]
        },
        {
          label: 'Verse 2', label_es: 'Estrofa 2',
          caption: 'Verse 2 — A, E7 and D', caption_es: 'Estrofa 2 — A, E7 y D',
          caption_power: 'Verse 2 — A5, E5 and D5', caption_power_es: 'Estrofa 2 — A5, E5 y D5',
          fromBar: 69, bars: 28,
          rows: [2, 4, 2, 2],
          rowLabels: [
            '[A] Quisiera ser un San Juan, quisiera ser un San [E7] Pedro',
            '[E7] Para venirte a cantar con la [D] música [E7] del [A] cielo',
            '[A] Quisiera ser solecito para entrar por tu [E7] ventana',
            'Y [E7] darte los buenos días, acostadita en tu [A] cama'
          ],
          rowLabels_es: [
            '[A] Quisiera ser un San Juan, quisiera ser un San [E7] Pedro',
            '[E7] Para venirte a cantar con la [D] música [E7] del [A] cielo',
            '[A] Quisiera ser solecito para entrar por tu [E7] ventana',
            'Y [E7] darte los buenos días, acostadita en tu [A] cama'
          ],
          notes: [
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 9 },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64], beats: 12 },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 1 },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64], beats: 2 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 12 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 9 },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64], beats: 12 },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64], beats: 12 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 9 }
          ]
        },
        {
          label: 'Chorus 2', label_es: 'Coro 2',
          caption: 'Chorus — E7, D, A', caption_es: 'Coro — E7, D, A',
          caption_power: 'Chorus — E5, D5, A5', caption_power_es: 'Coro — E5, D5, A5',
          fromBar: 97, bars: 8,
          rows: [2, 3],
          rowLabels: [
            '[E7] Con jazmines y flores este [D] día voy a adornar',
            'Hoy por [A] ser tu cumpleaños le [E7] venimos a can[A]tar'
          ],
          rowLabels_es: [
            '[E7] Con jazmines y flores este [D] día voy a adornar',
            'Hoy por [A] ser tu cumpleaños le [E7] venimos a can[A]tar'
          ],
          notes: [
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 6 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 6 },
            { frets: [['E', 0], ['A', 2], ['D', 0], ['G', 1], ['B', 0], ['e', 0]], note: 'E7', midi: [40, 47, 50, 56, 59, 64], beats: 3 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 3 }
          ]
        }
      ],
      checks: [
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play with the band from verse 1 to the end of the last chorus without stopping.',
          text_es: 'Toca con la banda desde la estrofa 1 hasta el final del último coro, sin detenerte.' },
        { label: 'The solo on requinto', label_es: 'El solo en el requinto',
          text:    'Tap Solo and play the requinto solo with the band without stopping.',
          text_es: 'Pulsa «Solo» y toca el solo del requinto con la banda, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band, singing the words.',
          text_es: 'Desliza la velocidad a «Normal» y toca toda la canción con la banda mientras cantas la letra.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* Madrecita Querida — Play Along (Jonathan, 2026-10-16: "build a play
     along class activity for this", then the record itself). A practice
     card on the RECORD (tracks 'madrecita-querida' and 'madrecita-querida-f'
     in app.js — their comment has how the bars were found), verse 1 to the
     last chord: 4-beat bars 9-72. Like ca-35, ONE COLUMN PER CHORD with its
     held length in beats, one row per sung line, and it loops (no Song
     Journey page, so not `wholeSong`). No lyrics: the song is not public
     domain, so the rows carry no words.

     TWO KEYS (Jonathan: "Do F and G with a toggle switch. Default to G."):
     the data is written in G — G, C, D7, open chords — and keyVersions.F
     plays the record in its own key with F, Bb, C7 (or F5, Bb5, C5). See
     KEY VERSIONS in app.js (caView).

     THE CHORDS, read off the record in F (then moved up to G): madmom's
     chord recogniser, the guitarrón's note on each beat, and the harmony
     (chroma) on each 2-beat half bar, agreeing on I, IV and V7 only. Where
     the bass walks (F-D-C-A, A-Ab-G), the chord is the one the harmony
     holds: a bar on a C-A walk measured like the bars on a plain C, not like
     F, so it is C7 (D7 here). A bar with a G in the bass under the V chord
     (G-G-C-C) is written as V7 for the whole bar — the band may touch Gm7
     there; none of the readings separate the two, and V7 sounds right
     under it. The two verses are the same 32 half bars, line for line; the
     two choruses differ where the band slows down ("a llorar"): chorus 2
     holds the IV chord (C) under "en tus brazos". The bridge is the intro's
     chords. Given to students from the board's Who picker, like ca-35. */
  {
    id:    'ca-36',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    library: true,    // on the Songs page's More Play Along songs list for everyone — see LIBRARY above
    optional: true,   // Optional until switched to Required on the board — see OPTIONAL above
    /* Key of G / Key of F switch — see KEY VERSIONS beside caView in app.js.
       The record is in F; the G track is the same record raised two half
       steps, so the chords below are G, C, D7 and F maps them back. */
    key: 'G',
    keyStart: 'G',
    keyVersions: {
      F: {
        track: 'madrecita-querida-f',
        full: {
          G:  { frets: [['E', 1], ['A', 3], ['D', 3], ['G', 2], ['B', 1], ['e', 1]], note: 'F', midi: [41, 48, 53, 57, 60, 65] },
          C:  { frets: [['A', 1], ['D', 3], ['G', 3], ['B', 3], ['e', 1]], note: 'Bb', midi: [46, 53, 58, 62, 65] },
          D7: { frets: [['A', 3], ['D', 2], ['G', 3], ['B', 1], ['e', 0]], note: 'C7', midi: [48, 52, 58, 60, 64] },
        },
        power: {
          G:  { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] },
          C:  { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46] },
          D7: { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
        },
      },
    },
    /* Full chords / Power chords switch (caView in app.js), Module 3's
       shapes: G5 on the low E string, C5 and D5 on the A string. */
    chordStart: 'power',   // opens on Power chords until the student picks, like ca-34 and ca-35
    chordVersions: {
      power: {
        G:  { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] },
        C:  { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48] },
        D7: { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
      },
    },
    title:    '"Madrecita Querida" - Vicente Fernández — Play Along',
    title_es: '"Madrecita Querida" - Vicente Fernández — Toca con la canción',
    intro:    'Play Madrecita Querida with the band, from the first verse to the last chord.',
    intro_es: 'Toca Madrecita Querida con la banda, de la primera estrofa al último acorde.',
    card: {
      track: 'madrecita-querida',
      chordGrid: true,  // chord grid: each chord once, cursor on the beats only (2026-10-26) — see CARD above
      slowest: true,    // Slowest / Slower / Slow / Normal
      caption:    'The song in order',
      caption_es: 'La canción en orden',
      sections: [
        {
          label: 'Verse 1', label_es: 'Estrofa 1',
          caption: 'Verse 1', caption_es: 'Estrofa 1',
          fromBar: 9, bars: 16,
          rows: [4, 4, 2, 3, 4, 4, 2, 3],
          notes: [
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 4 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 4 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 4 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 4 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 4 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 4 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 }
          ]
        },
        {
          label: 'Chorus 1', label_es: 'Coro 1',
          caption: 'Chorus 1 · the band slows down from bar 4', caption_es: 'Coro 1 · la banda va más lento desde el compás 4',
          fromBar: 25, bars: 11,
          rows: [2, 3, 2, 4],
          notes: [
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 4 },
            { frets: [['A', 3], ['D', 2], ['G', 0], ['B', 1], ['e', 0]], note: 'C', midi: [48, 52, 55, 60, 64], beats: 8 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 8 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 4 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 4 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 4 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 4 }
          ]
        },
        {
          label: 'Bridge', label_es: 'Puente',
          caption: 'Bridge', caption_es: 'Puente',
          fromBar: 36, bars: 7,
          rows: [2, 3, 3],
          notes: [
            { frets: [['A', 3], ['D', 2], ['G', 0], ['B', 1], ['e', 0]], note: 'C', midi: [48, 52, 55, 60, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 4 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 8 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 }
          ]
        },
        {
          label: 'Verse 2', label_es: 'Estrofa 2',
          caption: 'Verse 2 · the same chords as verse 1', caption_es: 'Estrofa 2 · los mismos acordes que la estrofa 1',
          fromBar: 43, bars: 16,
          rows: [4, 4, 2, 3, 4, 4, 2, 3],
          notes: [
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 4 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 4 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 4 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 4 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 4 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 4 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 }
          ]
        },
        {
          label: 'Chorus 2', label_es: 'Coro 2',
          caption: 'Chorus 2 · the band slows down from bar 4', caption_es: 'Coro 2 · la banda va más lento desde el compás 4',
          fromBar: 59, bars: 9,
          rows: [2, 4, 2],
          notes: [
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 4 },
            { frets: [['A', 3], ['D', 2], ['G', 0], ['B', 1], ['e', 0]], note: 'C', midi: [48, 52, 55, 60, 64], beats: 8 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 6 },
            { frets: [['A', 3], ['D', 2], ['G', 0], ['B', 1], ['e', 0]], note: 'C', midi: [48, 52, 55, 60, 64], beats: 4 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 4 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 6 }
          ]
        },
        {
          label: 'Ending', label_es: 'Final',
          caption: 'Ending · the band slows down', caption_es: 'Final · la banda va más lento',
          fromBar: 68, bars: 5,
          rows: [2, 5],
          notes: [
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 4 },
            { frets: [['A', 3], ['D', 2], ['G', 0], ['B', 1], ['e', 0]], note: 'C', midi: [48, 52, 55, 60, 64], beats: 6 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 },
            { frets: [['D', 0], ['G', 2], ['B', 1], ['e', 2]], note: 'D7', midi: [50, 57, 60, 66], beats: 2 },
            { frets: [['E', 3], ['A', 2], ['D', 0], ['G', 0], ['B', 0], ['e', 3]], note: 'G', midi: [43, 47, 50, 55, 59, 67], beats: 2 }
          ]
        }
      ],
      checks: [
        { label: 'Verse 1, slower', label_es: 'Estrofa 1, más lenta',
          text:    'Play verse 1 with the band without stopping.',
          text_es: 'Toca la estrofa 1 con la banda, sin detenerte.' },
        { label: 'Chorus 1, slower', label_es: 'Coro 1, más lento',
          text:    'Tap Chorus 1 and play it with the band without stopping.',
          text_es: 'Pulsa «Coro 1» y tócalo con la banda, sin detenerte.' },
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play with the band from verse 1 to the last chord without stopping.',
          text_es: 'Toca con la banda desde la estrofa 1 hasta el último acorde, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* Arsenal Efectivo — Play Along (Jonathan, 2026-10-16: "make a class
     activity for this" with the record and a chord sheet; "like what we did
     for las mananitas"; power chords; "go ahead without lyrics"). A practice
     card on the RECORD (track 'arsenal-efectivo' in app.js — its comment has
     how the grid was found), verse 1 to the last chord: bars 20-141 of the
     6/8 grid, counted in two big beats a bar like Luna. Like ca-36, ONE
     COLUMN PER CHORD with its held length in big beats, and it loops (no
     Song Journey page, so not `wholeSong`). No lyrics: the song is not
     public domain, so the rows carry no words. One row per time through
     the chords (each row starts on B5), not per sung line: Jonathan's chord
     sheet was machine-made and its lines don't follow the record.

     POWER CHORDS ONLY (Jonathan picked power chords; the full chords are
     Bm and Bb barre chords), so no chordVersions switch. All four shapes
     sit in frets 5-9: B5 and Bb5 on the low E (7/9, 6/8), A5 on the low E
     (5/7, the Watchtower A5), E5 on the A string (7/9).

     THE CHORDS, read off the record: the harmony (chroma) on every eighth,
     matched to the chord sheet's chords, and the bass note under each big
     beat, which lands on B, E and A where the chords change. The verses are
     one 4-bar loop, B5 2 · E5 2 · A5 3 · Bb5 1 big beats; the Bb is the
     bass walking A-Bb-B back to the top, and the sheet's Bbm/Bbaug are that
     same spot. Two laps read off by a beat (verse 1 lap 3, verse 2 lap 5)
     are written as the loop: their eighth-by-eighth reading is the loop
     with a stray label. The sheet's other passing chords (F#m, C#m, F#7,
     the sus chords) last one big beat or less on the record and are folded
     into the chord around them. The bridge (bars 54-83, the spoken lines)
     changes chords at uneven times; it is the least certain part — check it
     by ear. */
  {
    id:    'ca-37',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    library: true,    // on the Songs page's More Play Along songs list for everyone — see LIBRARY above
    optional: true,   // Optional until switched to Required on the board — see OPTIONAL above
    title:    '"Arsenal Efectivo" - Lolo Félix — Play Along',
    title_es: '"Arsenal Efectivo" - Lolo Félix — Toca con la canción',
    intro:    'Play Arsenal Efectivo with the band using B5, E5, A5 and Bb5, all between frets 5 and 9.',
    intro_es: 'Toca Arsenal Efectivo con la banda con B5, E5, A5 y Bb5, todos entre los trastes 5 y 9.',
    card: {
      track: 'arsenal-efectivo',
      chordGrid: true,  // chord grid: each chord once, cursor on the beats only (2026-10-26) — see CARD above
      slowest: true,    // Slowest / Slower / Slow / Normal
      caption:    'The song in order',
      caption_es: 'La canción en orden',
      sections: [
        {
          label: 'Verse 1', label_es: 'Estrofa 1',
          caption: 'Verse 1 · one row per time through the chords · Bb5 is B5 one fret lower', caption_es: 'Estrofa 1 · una fila por cada vuelta de los acordes · Bb5 es B5 un traste más abajo',
          fromBar: 20, bars: 34,
          rows: [4, 4, 4, 4, 4, 4, 4, 3],
          notes: [
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 3 },
            { frets: [['D', 8], ['A', 8], ['E', 6]], note: 'Bb5', midi: [58, 53, 46], beats: 1 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 3 },
            { frets: [['D', 8], ['A', 8], ['E', 6]], note: 'Bb5', midi: [58, 53, 46], beats: 1 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 3 },
            { frets: [['D', 8], ['A', 8], ['E', 6]], note: 'Bb5', midi: [58, 53, 46], beats: 1 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 3 },
            { frets: [['D', 8], ['A', 8], ['E', 6]], note: 'Bb5', midi: [58, 53, 46], beats: 1 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 3 },
            { frets: [['D', 8], ['A', 8], ['E', 6]], note: 'Bb5', midi: [58, 53, 46], beats: 1 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 3 },
            { frets: [['D', 8], ['A', 8], ['E', 6]], note: 'Bb5', midi: [58, 53, 46], beats: 1 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 3 },
            { frets: [['D', 8], ['A', 8], ['E', 6]], note: 'Bb5', midi: [58, 53, 46], beats: 1 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 1 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 9 }
          ]
        },
        {
          label: 'Bridge', label_es: 'Puente',
          caption: 'Bridge · the chords change at new times · follow the highlight', caption_es: 'Puente · los acordes cambian en otros momentos · sigue la marca',
          fromBar: 54, bars: 30,
          rows: [3, 3, 3, 3, 3, 3],
          notes: [
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 3 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 4 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 4 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 3 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 6 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 1 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 4 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 3 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 1 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 5 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 4 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 6 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 3 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 5 }
          ]
        },
        {
          label: 'Verse 2', label_es: 'Estrofa 2',
          caption: 'Verse 2 · the same chords as verse 1', caption_es: 'Estrofa 2 · los mismos acordes que la estrofa 1',
          fromBar: 84, bars: 34,
          rows: [4, 4, 4, 4, 4, 4, 4, 3],
          notes: [
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 3 },
            { frets: [['D', 8], ['A', 8], ['E', 6]], note: 'Bb5', midi: [58, 53, 46], beats: 1 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 3 },
            { frets: [['D', 8], ['A', 8], ['E', 6]], note: 'Bb5', midi: [58, 53, 46], beats: 1 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 3 },
            { frets: [['D', 8], ['A', 8], ['E', 6]], note: 'Bb5', midi: [58, 53, 46], beats: 1 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 3 },
            { frets: [['D', 8], ['A', 8], ['E', 6]], note: 'Bb5', midi: [58, 53, 46], beats: 1 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 3 },
            { frets: [['D', 8], ['A', 8], ['E', 6]], note: 'Bb5', midi: [58, 53, 46], beats: 1 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 3 },
            { frets: [['D', 8], ['A', 8], ['E', 6]], note: 'Bb5', midi: [58, 53, 46], beats: 1 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 3 },
            { frets: [['D', 8], ['A', 8], ['E', 6]], note: 'Bb5', midi: [58, 53, 46], beats: 1 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 2 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 8 }
          ]
        },
        {
          label: 'Ending', label_es: 'Final',
          caption: 'Ending · the chords slow down', caption_es: 'Final · los acordes van más lento',
          fromBar: 118, bars: 24,
          rows: [4, 3, 3, 3],
          notes: [
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 3 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 4 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 3 },
            { frets: [['D', 8], ['A', 8], ['E', 6]], note: 'Bb5', midi: [58, 53, 46], beats: 1 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 3 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 3 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 6 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 3 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 6 },
            { frets: [['D', 9], ['A', 9], ['E', 7]], note: 'B5', midi: [59, 54, 47], beats: 3 },
            { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52], beats: 2 },
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 9 }
          ]
        }
      ],
      checks: [
        { label: 'Verse 1, slower', label_es: 'Estrofa 1, más lenta',
          text:    'Play verse 1 with the band without stopping.',
          text_es: 'Toca la estrofa 1 con la banda, sin detenerte.' },
        { label: 'The bridge, slower', label_es: 'El puente, más lento',
          text:    'Tap Bridge and play the bridge with the band without stopping.',
          text_es: 'Pulsa «Puente» y toca el puente con la banda, sin detenerte.' },
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play with the band from verse 1 to the last chord without stopping.',
          text_es: 'Toca con la banda desde la estrofa 1 hasta el último acorde, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* All Along the Watchtower — Lyrics and Chords (Jonathan, 2026-10-19).
     ca-29 shown as Jonathan's own chord sheet (sheets/all-along-the-watchtower.pdf,
     saved from his Word doc) instead of the tab: the lyrics and chords as he
     wrote them, and a dot that steps from chord to chord in the card's rhythm
     on the Hendrix track. The sections are ca-29's — the SAME objects, joined
     right after this array — so a change to ca-29's rhythm or bars moves
     this card's dot too. The sheet's 224 chord names are the card's 224
     chord changes, in reading order (checks.mjs 1bf2). */
  {
    id:    'ca-38',
    view:  'card',    // one screen: Play song + sheet + checks — see CARD above
    title:    'All Along the Watchtower — Lyrics and Chords',
    title_es: 'All Along the Watchtower — Letra y acordes',
    intro:    'Play the whole song in power chords from the chord sheet, following the dot.',
    intro_es: 'Toca la canción completa con acordes de potencia desde la hoja de acordes, siguiendo el punto.',
    card: {
      wholeSong: true,  // stops at the end of the song instead of looping
      track: 'all-along-the-watchtower',
      slowest: true,    // four-way speed control: Slowest / Slower / Slow / Normal
      sheet: 'sheets/all-along-the-watchtower.pdf',
      sheetChords: 224, // chord names on the sheet = chord changes in the notes (checks.mjs 1bf2)
      caption:    'Lyrics and chords · bar 1: G on 3 · bar 2: G on the + after 3',
      caption_es: 'Letra y acordes · compás 1: G en el 3 · compás 2: G en el + después del 3',
      sections: null,   // ca-29's — joined after the array, below
      checks: [
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play the whole song with the band from the sheet without stopping.',
          text_es: 'Toca la canción completa con la banda desde la hoja, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band from the sheet.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda desde la hoja.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* "the cure" — Lyrics and Chords (Jonathan, 2026-11-03: "build those two"
     — the lyric-sheet play-alongs for "the cure" and Sweet Child, after
     ca-38). ca-30 shown as Jonathan's own power-chord sheet
     (sheets/the-cure.pdf, from his "the cure (power chords)" Word doc,
     2026-10-16), with the dot stepping through ca-30's rhythm. The web copy
     leaves off the doc's "CHORDS" legend line, which is not a chord change;
     nothing else changed — his 94 chord names are ca-30's 94 changes as
     written. One column over three pages: card.sheetColumns 1. Sections are
     ca-30's by reference, joined after the array. */
  {
    id:    'ca-44',
    view:  'card',    // one screen: Play song + sheet + checks — see CARD above
    title:    '"the cure" — Lyrics and Chords',
    title_es: '"the cure" — Letra y acordes',
    intro:    'Play the whole song in power chords from the chord sheet, following the dot.',
    intro_es: 'Toca la canción completa con acordes de potencia desde la hoja de acordes, siguiendo el punto.',
    card: {
      wholeSong: true,  // stops at the end of the song instead of looping
      track: 'the-cure',
      slowest: true,    // four-way speed control: Slowest / Slower / Slow / Normal
      sheet: 'sheets/the-cure.pdf',
      sheetColumns: 1,  // one column of chords over lyrics, three pages
      sheetChords: 94,  // chord names on the sheet = chord changes in the notes (checks.mjs 1bf2)
      caption:    'Lyrics and chords · 4 big beats per chord, 2 for C5 and G5 in the refrains and bridge',
      caption_es: 'Letra y acordes · 4 tiempos lentos por acorde, 2 para C5 y G5 en los estribillos y el puente',
      sections: null,   // ca-30's — joined after the array, below
      checks: [
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play the whole song with the band from the sheet without stopping.',
          text_es: 'Toca la canción completa con la banda desde la hoja, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band from the sheet.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda desde la hoja.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* Sweet Child O' Mine — Lyrics and Chords (Jonathan, 2026-11-03, with
     ca-44). ca-33 shown as Jonathan's power-chord sheet
     (sheets/sweet-child-o-mine.pdf, from his "Sweet Child O' Mine (power
     chords)" Word doc, 2026-10-16). His chords came from his open-chord
     draft and did not follow the record; his call (2026-11-03) was to fix the
     web copy's chord NAMES to ca-33, lyrics untouched. His D5s at the start
     of each intro line, verse half and riff lap stay, though that D5 is
     still ringing (Jonathan, same day: "the D5 is missing from the
     beginning of each verse", then yes to the rest) — card.sheetNamedAgain
     tells the dot to step onto them. Otherwise
     Solo 2 and every outro lap end C5 D5 G5 in one bar, the outro runs seven
     laps, and the ending is E5 | G5 | A5 | G5 A5 | E5 — the A#5 and its
     diagram are gone. 152 names = ca-33's 143 changes + those 9 D5s. Two columns over two
     pages. Sections are ca-33's by reference, joined after the array. */
  {
    id:    'ca-45',
    view:  'card',    // one screen: Play song + sheet + checks — see CARD above
    title:    'Sweet Child O\' Mine — Lyrics and Chords',
    title_es: 'Sweet Child O\' Mine — Letra y acordes',
    intro:    'Play the whole song in power chords from the chord sheet, following the dot.',
    intro_es: 'Toca la canción completa con acordes de potencia desde la hoja de acordes, siguiendo el punto.',
    card: {
      wholeSong: true,  // stops at the end of the song instead of looping
      track: 'sweet-child-o-mine',
      slowest: true,    // four-way speed control: Slowest / Slower / Slow / Normal
      sheet: 'sheets/sweet-child-o-mine.pdf',
      sheetNamedAgain: ['Intro', 'Verse 1', 'Riff 1', 'Verse 2', 'Riff 2'],   // every lap opens on the sheet's D5, though it is still ringing (Jonathan, 2026-11-03)
      sheetChords: 152, // chord names on the sheet = 143 chord changes + 9 D5s named again (checks.mjs 1bf2)
      caption:    'Lyrics and chords · each verse chord lasts 2 bars',
      caption_es: 'Letra y acordes · cada acorde de la estrofa dura 2 compases',
      sections: null,   // ca-33's — joined after the array, below
      checks: [
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play the whole song with the band from the sheet without stopping.',
          text_es: 'Toca la canción completa con la banda desde la hoja, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band from the sheet.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda desde la hoja.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* Ella — Play Along (Jonathan, 2026-10-19: "draft a play along for ella
     by junior h as well", with the record). A practice card on the RECORD
     (track 'ella' in app.js — its comment has how the grid and the song map
     were found), from the intro's first Em (bar 11) to the last chord: bars
     11-132 of the 6/8 grid, counted in two big beats a bar like Arsenal
     Efectivo. ONE COLUMN PER CHORD with its held length in big beats, and it
     loops (no Song Journey page, so not `wholeSong`). No lyrics: the song is
     not public domain, so the rows carry no words. One row per time through
     the chords.

     THE CHORDS, read off the record: the harmony (chroma) on every half bar
     and the bass under it. The whole song is one 8-bar loop, Em 4 bars ·
     Am 3 · D 1 (8 · 6 · 2 big beats); the intro's first lap is Em 4 · Am 4.
     The bass walks D-D#-E back to Em in the D bar, and some laps play the
     D bar as half Am, half D — written as the loop. Bars 1-10 (the requinto
     alone, with a B7 hold) are left off the card. The section names are
     read off the voice, not a lyric sheet: "Verse 1" and "Verse 2" are the
     two stretches of singing and may each hold a chorus — the chords do not
     change between them.

     Full chords / Power chords switch, like ca-35: open Em, Am and D, or
     Module 3's shapes in frets 5-9 (E5 on the A string, A5 on the low E,
     D5 on the A string — ca-35's A5 and D5, ca-37's E5). Opens on Power
     chords. */
  {
    id:    'ca-39',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    library: true,    // on the Songs page's More Play Along songs list for everyone — see LIBRARY above
    optional: true,   // Optional until switched to Required on the board — see OPTIONAL above
    chordStart: 'power',   // opens on Power chords until the student picks — see CHORD VERSIONS above
    chordVersions: {
      power: {
        Em: { frets: [['G', 9], ['D', 9], ['A', 7]], note: 'E5', midi: [64, 59, 52] },
        Am: { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
        D:  { frets: [['G', 7], ['D', 7], ['A', 5]], note: 'D5', midi: [62, 57, 50] },
      },
    },
    title:    '"Ella" - Junior H — Play Along',
    title_es: '"Ella" - Junior H — Toca con la canción',
    intro:    'Play Ella with the band: Em, Am and D in the same order all the way through.',
    intro_es: 'Toca Ella con la banda: Em, Am y D en el mismo orden de principio a fin.',
    intro_power:    'Play Ella with the band: E5, A5 and D5 in the same order all the way through.',
    intro_power_es: 'Toca Ella con la banda: E5, A5 y D5 en el mismo orden de principio a fin.',
    card: {
      track: 'ella',
      chordGrid: true,  // chord grid: each chord once, cursor on the beats only (2026-10-26) — see CARD above
      slowest: true,    // Slowest / Slower / Slow / Normal
      caption:    'The song in order',
      caption_es: 'La canción en orden',
      sections: [
        {
          label: 'Intro', label_es: 'Intro',
          caption: 'Intro · the band starts the loop · Em, then Am, then D', caption_es: 'Intro · la banda empieza la vuelta · Em, después Am, después D',
          caption_power: 'Intro · the band starts the loop · E5, then A5, then D5', caption_power_es: 'Intro · la banda empieza la vuelta · E5, después A5, después D5',
          fromBar: 11, bars: 16,
          rows: [2, 3],
          notes: [
            { frets: [['E', 0], ['A', 2], ['D', 2], ['G', 0], ['B', 0], ['e', 0]], note: 'Em', midi: [40, 47, 52, 55, 59, 64], beats: 8 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 1], ['e', 0]], note: 'Am', midi: [45, 52, 57, 60, 64], beats: 8 },
            { frets: [['E', 0], ['A', 2], ['D', 2], ['G', 0], ['B', 0], ['e', 0]], note: 'Em', midi: [40, 47, 52, 55, 59, 64], beats: 8 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 1], ['e', 0]], note: 'Am', midi: [45, 52, 57, 60, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 2 }
          ]
        },
        {
          label: 'Verse 1', label_es: 'Estrofa 1',
          caption: 'Verse 1 · the chords repeat every 8 bars', caption_es: 'Estrofa 1 · los acordes se repiten cada 8 compases',
          fromBar: 27, bars: 40,
          rows: [3, 3, 3, 3, 3],
          notes: [
            { frets: [['E', 0], ['A', 2], ['D', 2], ['G', 0], ['B', 0], ['e', 0]], note: 'Em', midi: [40, 47, 52, 55, 59, 64], beats: 8 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 1], ['e', 0]], note: 'Am', midi: [45, 52, 57, 60, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 2 },
            { frets: [['E', 0], ['A', 2], ['D', 2], ['G', 0], ['B', 0], ['e', 0]], note: 'Em', midi: [40, 47, 52, 55, 59, 64], beats: 8 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 1], ['e', 0]], note: 'Am', midi: [45, 52, 57, 60, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 2 },
            { frets: [['E', 0], ['A', 2], ['D', 2], ['G', 0], ['B', 0], ['e', 0]], note: 'Em', midi: [40, 47, 52, 55, 59, 64], beats: 8 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 1], ['e', 0]], note: 'Am', midi: [45, 52, 57, 60, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 2 },
            { frets: [['E', 0], ['A', 2], ['D', 2], ['G', 0], ['B', 0], ['e', 0]], note: 'Em', midi: [40, 47, 52, 55, 59, 64], beats: 8 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 1], ['e', 0]], note: 'Am', midi: [45, 52, 57, 60, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 2 },
            { frets: [['E', 0], ['A', 2], ['D', 2], ['G', 0], ['B', 0], ['e', 0]], note: 'Em', midi: [40, 47, 52, 55, 59, 64], beats: 8 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 1], ['e', 0]], note: 'Am', midi: [45, 52, 57, 60, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 2 }
          ]
        },
        {
          label: 'Solo', label_es: 'Solo',
          caption: 'Solo · the requinto (lead guitar) plays · keep strumming the same chords', caption_es: 'Solo · toca el requinto (guitarra líder) · sigue rasgueando los mismos acordes',
          fromBar: 67, bars: 16,
          rows: [3, 3],
          notes: [
            { frets: [['E', 0], ['A', 2], ['D', 2], ['G', 0], ['B', 0], ['e', 0]], note: 'Em', midi: [40, 47, 52, 55, 59, 64], beats: 8 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 1], ['e', 0]], note: 'Am', midi: [45, 52, 57, 60, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 2 },
            { frets: [['E', 0], ['A', 2], ['D', 2], ['G', 0], ['B', 0], ['e', 0]], note: 'Em', midi: [40, 47, 52, 55, 59, 64], beats: 8 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 1], ['e', 0]], note: 'Am', midi: [45, 52, 57, 60, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 2 }
          ]
        },
        {
          label: 'Verse 2', label_es: 'Estrofa 2',
          caption: 'Verse 2 · the same chords as verse 1', caption_es: 'Estrofa 2 · los mismos acordes que la estrofa 1',
          fromBar: 83, bars: 32,
          rows: [3, 3, 3, 3],
          notes: [
            { frets: [['E', 0], ['A', 2], ['D', 2], ['G', 0], ['B', 0], ['e', 0]], note: 'Em', midi: [40, 47, 52, 55, 59, 64], beats: 8 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 1], ['e', 0]], note: 'Am', midi: [45, 52, 57, 60, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 2 },
            { frets: [['E', 0], ['A', 2], ['D', 2], ['G', 0], ['B', 0], ['e', 0]], note: 'Em', midi: [40, 47, 52, 55, 59, 64], beats: 8 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 1], ['e', 0]], note: 'Am', midi: [45, 52, 57, 60, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 2 },
            { frets: [['E', 0], ['A', 2], ['D', 2], ['G', 0], ['B', 0], ['e', 0]], note: 'Em', midi: [40, 47, 52, 55, 59, 64], beats: 8 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 1], ['e', 0]], note: 'Am', midi: [45, 52, 57, 60, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 2 },
            { frets: [['E', 0], ['A', 2], ['D', 2], ['G', 0], ['B', 0], ['e', 0]], note: 'Em', midi: [40, 47, 52, 55, 59, 64], beats: 8 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 1], ['e', 0]], note: 'Am', midi: [45, 52, 57, 60, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 2 }
          ]
        },
        {
          label: 'Ending', label_es: 'Final',
          caption: 'Ending · two more times through · the song ends on Em', caption_es: 'Final · dos vueltas más · la canción termina en Em',
          caption_power: 'Ending · two more times through · the song ends on E5', caption_power_es: 'Final · dos vueltas más · la canción termina en E5',
          fromBar: 115, bars: 18,
          rows: [3, 4],
          notes: [
            { frets: [['E', 0], ['A', 2], ['D', 2], ['G', 0], ['B', 0], ['e', 0]], note: 'Em', midi: [40, 47, 52, 55, 59, 64], beats: 8 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 1], ['e', 0]], note: 'Am', midi: [45, 52, 57, 60, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 2 },
            { frets: [['E', 0], ['A', 2], ['D', 2], ['G', 0], ['B', 0], ['e', 0]], note: 'Em', midi: [40, 47, 52, 55, 59, 64], beats: 8 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 1], ['e', 0]], note: 'Am', midi: [45, 52, 57, 60, 64], beats: 6 },
            { frets: [['D', 0], ['G', 2], ['B', 3], ['e', 2]], note: 'D', midi: [50, 57, 62, 66], beats: 2 },
            { frets: [['E', 0], ['A', 2], ['D', 2], ['G', 0], ['B', 0], ['e', 0]], note: 'Em', midi: [40, 47, 52, 55, 59, 64], beats: 4 }
          ]
        }

      ],
      checks: [
        { label: 'Intro and verse 1, slower', label_es: 'Intro y estrofa 1, más lentas',
          text:    'Play the intro and verse 1 with the band without stopping.',
          text_es: 'Toca la intro y la estrofa 1 con la banda, sin detenerte.' },
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play with the band from the intro to the last chord without stopping.',
          text_es: 'Toca con la banda desde la intro hasta el último acorde, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* All Along the Watchtower — Power Chords, Old Rhythm (Jonathan,
     2026-10-22: "adapt the Watchtower power chord play along to the old
     rhythm … make it look like the single note class activity but with two
     finger power chord tab"). ca-26's card exactly — same sections, bars,
     laps and checks — with each single note turned into its two-finger
     power chord, root on the low E: A5 = 5/7, G5 = 3/5, F5 = 1/3 (since
     2026-10-26 the tab shows the three-finger shape, a pinky added on the
     D string at the ring finger's fret, like every power-chord tab). The OLD
     rhythm: one strum per chord, on the beat it lands (A5 . G5 . | F5 . G5 .),
     the rhythm ca-29 had before the method book's rhythm replaced it on
     2026-10-15. ca-29 now plays the record's rhythm (2026-10-26).
     TEACHER-ONLY (see TEACHER ONLY above): no `journey` / `journeyLayer`
     on purpose — it is not its layer's play-along, so no song link picks it
     and the Journey page draws no tab for it (checks.mjs 1bn). */
  {
    id:    'ca-40',
    /* Jimi Hendrix / Neil Young switch — see RECORDING VERSIONS beside caView in
       app.js. The data below is Jimi's; the Neil version is built after the
       array (end of this file). */
    recording: 'jimi',
    recordingLabel: 'Jimi Hendrix', recordingLabel_es: 'Jimi Hendrix',
    recordingGroup: 'all-along-the-watchtower',
    recordingStart: 'jimi',
    recordingVersions: {
      /* Neil's own title and intro (a version-level title / intro, see RECORDING VERSIONS beside caView): this
         card's name says how it is played, and Neil's is a down-up strum on every eighth, not one strum per
         chord. The card itself (sections, caption) is built at the end of this file. */
      neil: {
        label: 'Neil Young', label_es: 'Neil Young', track: 'all-along-the-watchtower-neil',
        title:    'All Along the Watchtower in Power Chords — Down-Up Strum',
        title_es: 'All Along the Watchtower con acordes de potencia — rasgueo abajo-arriba',
        intro:    'Play the Watchtower power chords with Neil Young\'s band, strumming down and up.',
        intro_es: 'Toca los acordes de potencia de Watchtower con la banda de Neil Young, rasgueando abajo y arriba.',
        card: null
      }
    },
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    teacherOnly: true,   // console's "Teacher view songs" tab only, until moved to Class activities — see TEACHER ONLY above
    title:    'All Along the Watchtower in Power Chords — 1 Strum per Chord',
    title_es: 'All Along the Watchtower con acordes de potencia — 1 rasgueo por acorde',
    intro:    'Play the Watchtower power chords with the band for the whole song, one strum on each chord.',
    intro_es: 'Toca los acordes de potencia de Watchtower con la banda toda la canción, un rasgueo en cada acorde.',
    card: {
      wholeSong: true,  // stops at the end of the song instead of looping
      track: 'all-along-the-watchtower',
      chordGrid: true,  // chord grid: each chord once, cursor on the beats only (2026-10-26) — see CARD above
      slowest: true,    // Slowest / Slower / Slow / Normal — the student picks
      caption:    'The whole song in power chords · 2 beats per chord',
      caption_es: 'La canción completa con acordes de potencia · 2 tiempos por acorde',
      sections: [
        {
          label: 'Intro', label_es: 'Intro',
          caption: 'Intro — A5 G5 F5 G5, 4 laps', caption_es: 'Intro — A5 G5 F5 G5, 4 vueltas',
          fromBar: 1, bars: 2, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 2 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 2 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 2 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 2 }
          ]
        },
        {
          label: 'Verse 1', label_es: 'Estrofa 1',
          caption: 'Verse 1 — A5 G5 F5 G5, 8 laps', caption_es: 'Estrofa 1 — A5 G5 F5 G5, 8 vueltas',
          fromBar: 9, bars: 2, reps: 8,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 2 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 2 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 2 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 2 }
          ]
        },
        {
          label: 'Solo 1', label_es: 'Solo 1',
          caption: 'Solo 1 — A5 G5 F5 G5, 4 laps', caption_es: 'Solo 1 — A5 G5 F5 G5, 4 vueltas',
          fromBar: 25, bars: 2, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 2 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 2 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 2 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 2 }
          ]
        },
        {
          label: 'Verse 2', label_es: 'Estrofa 2',
          caption: 'Verse 2 — A5 G5 F5 G5, 9 laps', caption_es: 'Estrofa 2 — A5 G5 F5 G5, 9 vueltas',
          fromBar: 33, bars: 2, reps: 9,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 2 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 2 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 2 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 2 }
          ]
        },
        {
          label: 'Solo 2', label_es: 'Solo 2',
          caption: 'Solo 2 — A5 G5 F5 G5, 15 laps', caption_es: 'Solo 2 — A5 G5 F5 G5, 15 vueltas',
          fromBar: 51, bars: 2, reps: 15,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 2 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 2 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 2 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 2 }
          ]
        },
        {
          label: 'Verse 3', label_es: 'Estrofa 3',
          caption: 'Verse 3 — A5 G5 F5 G5, 12 laps', caption_es: 'Estrofa 3 — A5 G5 F5 G5, 12 vueltas',
          fromBar: 81, bars: 2, reps: 12,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 2 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 2 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 2 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 2 }
          ]
        },
        {
          label: 'Outro', label_es: 'Final',
          caption: 'Outro — A5 G5 F5 G5, 4 laps', caption_es: 'Final — A5 G5 F5 G5, 4 vueltas',
          fromBar: 105, bars: 2, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45], beats: 2 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 2 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 2 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 2 }
          ]
        }
      ],
      checks: [
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play the whole song with the band, intro to the end, without stopping.',
          text_es: 'Toca la canción completa con la banda, de la intro al final, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band without stopping.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda, sin detenerte.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* "Smells Like Teen Spirit" — Nirvana — Play Along (Jonathan, 2026-10-25:
     "make me a song play along lesson for smells like teen spirit", with
     the record; power chords). A practice card on the RECORD (track
     'smells-like-teen-spirit' in app.js — its comment has how the beat map,
     the guitar-out mix and the song map were made), bar 1 to the last chord.
     Not a Core song, so no `journey` and not `wholeSong`; like ca-37 and
     ca-39 it loops. `library: false`: it starts on the Class activities
     board, and the console's "Move to Songs" puts it on the Songs page.

     POWER CHORDS (Jonathan's pick) everywhere but the verses, root on the low E or A string:
     F5 = 1/3 and Ab5 = 4/6 on the low E, Bb5 = 1/3 and Db5 = 4/6 on the A
     string. Ab5 and Db5 reach fret 6, one past the usual fret-5 limit —
     Jonathan chose power chords knowing that.

     THE RHYTHM, read off the guitar stem folded onto the beat map: one
     strum per chord where the record changes chord — F5 on 1, Bb5 on the
     "+" after 2, Ab5 on the next 1, Db5 on the "+" after 2 (beats 1.5 · 2.5
     · 1.5 · 2.5). The record strums sixteenths through every chord; the
     card keeps the changes and drops the strumming, so the picking hand
     stays simple. The chord sections are a chord grid (each chord once, its
     count row always on, the "+" faint under Bb5 and Db5); `counts: true` is
     now only for the single-note verses.

     THE VERSES (Jonathan, 2026-10-25: "add the very brief bit of tab for
     1st fret b and 1st fret e string for the verses … it's easy enough"):
     two single notes, plucked separately — B string fret 1 (C) on 2, high
     e fret 1 (F) on the "+" after 2, ringing through the rest of the lap.
     Read off the guitar stem: both hits land within 0.05 beat of those
     spots in every lap of verses 1 and 2. A rest fills beat 1 so the
     highlight lands on time (the `rest` note, see CARD above). Verse 3 on
     the record has no guitar; the card plays the verse part there too
     (Jonathan's call). The pre-choruses (bars 21-28, 57-64, 101-108) stay
     power chords — the record's guitar is back to the riff there.

     THE CHORDS: the whole song is the F-Bb-Ab-Db riff (bass chroma per
     beat, 520 beats) except the two 4-bar interludes after choruses 1 and 2
     (bars 41-44, 77-80). Their bass walks F-Gb | C-Bb-A-Ab; the card plays
     F5 Gb5 | C5 Bb5, two beats each — the least certain spot on the card;
     check it by ear. */
  {
    id:    'ca-41',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    library: false,   // starts as a class activity; the console can move it to the Songs page — see LIBRARY above
    title:    '"Smells Like Teen Spirit" - Nirvana — Play Along',
    title_es: '"Smells Like Teen Spirit" - Nirvana — Toca con la canción',
    intro:    'Play Smells Like Teen Spirit with the band: F5, Bb5, Ab5 and Db5, and two single notes in the verses.',
    intro_es: 'Toca Smells Like Teen Spirit con la banda: F5, Bb5, Ab5 y Db5, y dos notas sueltas en las estrofas.',
    card: {
      track: 'smells-like-teen-spirit',
      chordGrid: true,  // chord grid: each chord once, cursor on the beats only (2026-10-26) — see CARD above
      slowest: true,    // Slowest / Slower / Slow / Normal
      counts: true,     // Counts switch: for the single-note verses only — the chord-grid sections always show their count row
      caption:    'The song in order',
      caption_es: 'La canción en orden',
      sections: [
        {
          label: 'Intro', label_es: 'Intro',
          caption: 'Intro — F5 Bb5 Ab5 Db5, 4 laps · the band comes in on lap 3', caption_es: 'Intro — F5 Bb5 Ab5 Db5, 4 vueltas · la banda entra en la vuelta 3',
          fromBar: 1, bars: 2, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 1.5 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 2.5 },
            { frets: [['D', 6], ['A', 6], ['E', 4]], note: 'Ab5', midi: [56, 51, 44], beats: 1.5 },
            { frets: [['G', 6], ['D', 6], ['A', 4]], note: 'Db5', midi: [61, 56, 49], beats: 2.5 }
          ]
        },
        {
          label: 'Verse 1', label_es: 'Estrofa 1',
          chordGrid: false,  // single notes (B string, high e), not chords — keeps the note-by-note highlight
          caption: 'Verse 1 — B string fret 1, then high e fret 1, 6 laps · let them ring', caption_es: 'Estrofa 1 — cuerda Si traste 1, después cuerda mi aguda traste 1, 6 vueltas · déjalas sonar',
          fromBar: 9, bars: 2, reps: 6,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { rest: true, beats: 1 },
            { string: 'B', fret: 1, note: 'C', midi: 60, beats: 0.5 },
            { string: 'e', fret: 1, note: 'F', midi: 65, beats: 6.5 }
          ]
        },
        {
          label: 'Pre-chorus 1', label_es: 'Pre-coro 1',
          caption: 'Pre-chorus 1 — F5 Bb5 Ab5 Db5, 4 laps', caption_es: 'Pre-coro 1 — F5 Bb5 Ab5 Db5, 4 vueltas',
          fromBar: 21, bars: 2, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 1.5 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 2.5 },
            { frets: [['D', 6], ['A', 6], ['E', 4]], note: 'Ab5', midi: [56, 51, 44], beats: 1.5 },
            { frets: [['G', 6], ['D', 6], ['A', 4]], note: 'Db5', midi: [61, 56, 49], beats: 2.5 }
          ]
        },
        {
          label: 'Chorus 1', label_es: 'Coro 1',
          caption: 'Chorus 1 — F5 Bb5 Ab5 Db5, 6 laps', caption_es: 'Coro 1 — F5 Bb5 Ab5 Db5, 6 vueltas',
          fromBar: 29, bars: 2, reps: 6,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 1.5 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 2.5 },
            { frets: [['D', 6], ['A', 6], ['E', 4]], note: 'Ab5', midi: [56, 51, 44], beats: 1.5 },
            { frets: [['G', 6], ['D', 6], ['A', 4]], note: 'Db5', midi: [61, 56, 49], beats: 2.5 }
          ]
        },
        {
          label: 'Interlude 1', label_es: 'Interludio 1',
          caption: 'Interlude 1 — new chords: F5 Gb5 C5 Bb5, 2 laps', caption_es: 'Interludio 1 — acordes nuevos: F5 Gb5 C5 Bb5, 2 vueltas',
          fromBar: 41, bars: 2, reps: 2,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 2 },
            { frets: [['D', 4], ['A', 4], ['E', 2]], note: 'Gb5', midi: [54, 49, 42], beats: 2 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 2 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 2 }
          ]
        },
        {
          label: 'Verse 2', label_es: 'Estrofa 2',
          chordGrid: false,  // single notes (B string, high e), not chords — keeps the note-by-note highlight
          caption: 'Verse 2 — B string fret 1, then high e fret 1, 6 laps · let them ring', caption_es: 'Estrofa 2 — cuerda Si traste 1, después cuerda mi aguda traste 1, 6 vueltas · déjalas sonar',
          fromBar: 45, bars: 2, reps: 6,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { rest: true, beats: 1 },
            { string: 'B', fret: 1, note: 'C', midi: 60, beats: 0.5 },
            { string: 'e', fret: 1, note: 'F', midi: 65, beats: 6.5 }
          ]
        },
        {
          label: 'Pre-chorus 2', label_es: 'Pre-coro 2',
          caption: 'Pre-chorus 2 — F5 Bb5 Ab5 Db5, 4 laps', caption_es: 'Pre-coro 2 — F5 Bb5 Ab5 Db5, 4 vueltas',
          fromBar: 57, bars: 2, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 1.5 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 2.5 },
            { frets: [['D', 6], ['A', 6], ['E', 4]], note: 'Ab5', midi: [56, 51, 44], beats: 1.5 },
            { frets: [['G', 6], ['D', 6], ['A', 4]], note: 'Db5', midi: [61, 56, 49], beats: 2.5 }
          ]
        },
        {
          label: 'Chorus 2', label_es: 'Coro 2',
          caption: 'Chorus 2 — F5 Bb5 Ab5 Db5, 6 laps', caption_es: 'Coro 2 — F5 Bb5 Ab5 Db5, 6 vueltas',
          fromBar: 65, bars: 2, reps: 6,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 1.5 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 2.5 },
            { frets: [['D', 6], ['A', 6], ['E', 4]], note: 'Ab5', midi: [56, 51, 44], beats: 1.5 },
            { frets: [['G', 6], ['D', 6], ['A', 4]], note: 'Db5', midi: [61, 56, 49], beats: 2.5 }
          ]
        },
        {
          label: 'Interlude 2', label_es: 'Interludio 2',
          caption: 'Interlude 2 — F5 Gb5 C5 Bb5, 2 laps', caption_es: 'Interludio 2 — F5 Gb5 C5 Bb5, 2 vueltas',
          fromBar: 77, bars: 2, reps: 2,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 2 },
            { frets: [['D', 4], ['A', 4], ['E', 2]], note: 'Gb5', midi: [54, 49, 42], beats: 2 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 2 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 2 }
          ]
        },
        {
          label: 'Solo', label_es: 'Solo',
          caption: 'Solo — F5 Bb5 Ab5 Db5, 6 laps · the lead guitar plays · keep strumming the same chords', caption_es: 'Solo — F5 Bb5 Ab5 Db5, 6 vueltas · toca la guitarra líder · sigue rasgueando los mismos acordes',
          fromBar: 81, bars: 2, reps: 6,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 1.5 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 2.5 },
            { frets: [['D', 6], ['A', 6], ['E', 4]], note: 'Ab5', midi: [56, 51, 44], beats: 1.5 },
            { frets: [['G', 6], ['D', 6], ['A', 4]], note: 'Db5', midi: [61, 56, 49], beats: 2.5 }
          ]
        },
        {
          label: 'Verse 3', label_es: 'Estrofa 3',
          chordGrid: false,  // single notes (B string, high e), not chords — keeps the note-by-note highlight
          caption: 'Verse 3 — B string fret 1, then high e fret 1, 4 laps · let them ring', caption_es: 'Estrofa 3 — cuerda Si traste 1, después cuerda mi aguda traste 1, 4 vueltas · déjalas sonar',
          fromBar: 93, bars: 2, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { rest: true, beats: 1 },
            { string: 'B', fret: 1, note: 'C', midi: 60, beats: 0.5 },
            { string: 'e', fret: 1, note: 'F', midi: 65, beats: 6.5 }
          ]
        },
        {
          label: 'Pre-chorus 3', label_es: 'Pre-coro 3',
          caption: 'Pre-chorus 3 — F5 Bb5 Ab5 Db5, 4 laps', caption_es: 'Pre-coro 3 — F5 Bb5 Ab5 Db5, 4 vueltas',
          fromBar: 101, bars: 2, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 1.5 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 2.5 },
            { frets: [['D', 6], ['A', 6], ['E', 4]], note: 'Ab5', midi: [56, 51, 44], beats: 1.5 },
            { frets: [['G', 6], ['D', 6], ['A', 4]], note: 'Db5', midi: [61, 56, 49], beats: 2.5 }
          ]
        },
        {
          label: 'Chorus 3', label_es: 'Coro 3',
          caption: 'Chorus 3 — F5 Bb5 Ab5 Db5, 6 laps', caption_es: 'Coro 3 — F5 Bb5 Ab5 Db5, 6 vueltas',
          fromBar: 109, bars: 2, reps: 6,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 1.5 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 2.5 },
            { frets: [['D', 6], ['A', 6], ['E', 4]], note: 'Ab5', midi: [56, 51, 44], beats: 1.5 },
            { frets: [['G', 6], ['D', 6], ['A', 4]], note: 'Db5', midi: [61, 56, 49], beats: 2.5 }
          ]
        },
        {
          label: 'Outro', label_es: 'Final',
          caption: 'Outro — F5 Bb5 Ab5 Db5, 4 laps', caption_es: 'Final — F5 Bb5 Ab5 Db5, 4 vueltas',
          fromBar: 121, bars: 2, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 1.5 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 2.5 },
            { frets: [['D', 6], ['A', 6], ['E', 4]], note: 'Ab5', midi: [56, 51, 44], beats: 1.5 },
            { frets: [['G', 6], ['D', 6], ['A', 4]], note: 'Db5', midi: [61, 56, 49], beats: 2.5 }
          ]
        },
        {
          label: 'Last chord', label_es: 'Último acorde',
          caption: 'Last chord — F5 · strum once and let it ring', caption_es: 'Último acorde — F5 · rasguea una vez y deja que suene',
          fromBar: 129, bars: 2,
          notes: [
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 8 }
          ]
        }
      ],
      checks: [
        { label: 'Intro and verse 1, slower', label_es: 'Intro y estrofa 1, más lentas',
          text:    'Play the intro and verse 1 with the band without stopping.',
          text_es: 'Toca la intro y la estrofa 1 con la banda, sin detenerte.' },
        { label: 'Chorus 1 and the new chords, slower', label_es: 'Coro 1 y los acordes nuevos, más lentos',
          text:    'Tap Chorus 1 and play chorus 1 and interlude 1 with the band without stopping.',
          text_es: 'Pulsa «Coro 1» y toca el coro 1 y el interludio 1 con la banda, sin detenerte.' },
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play with the band from the intro to the last chord without stopping.',
          text_es: 'Toca con la banda desde la intro hasta el último acorde, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* "Vuelve a la Vida" — Play Along (Jonathan, 2026-10-26: "make a song
     play along of Vuelve a la Vida - Efecto Elegante", with the record). A
     practice card on the RECORD (track 'vuelve-a-la-vida' in app.js — its
     comment has how the grid and the song map were found), bars 2-159: from
     the first sung bar to the end of the second solo. Bar 1 is a pickup and
     the sung ending (bar 160 on) has no steady beat, so both are left off.
     Counted in 3 like Las Mañanitas, ONE COLUMN PER CHORD with its held
     length in beats, one row per time through the 16-bar loop (Bb 4 · Gm 4
     · Eb 2 · Cm 2 · F 4). No lyrics: the song is not public domain.

     POWER CHORDS ONLY, in the record's key of Bb (Jonathan's pick,
     2026-10-26, over shifting the record to G for open chords): Bb5, G5,
     Eb5, C5, F5 — roots on the low E and A strings in frets 1-6, the same
     Bb5, C5 and F5 shapes as ca-41. The 2-bar band run in Interlude 1 (bars
     55-56, a scale down and back up) is a rest column. Starts on the Songs
     page like Ella (library). */
  {
    id:    'ca-42',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    library: true,    // on the Songs page's More Play Along songs list for everyone — see LIBRARY above
    optional: true,   // Optional until switched to Required on the board — see OPTIONAL above
    title:    '"Vuelve a la Vida" - Efecto Elegante — Play Along',
    title_es: '"Vuelve a la Vida" - Efecto Elegante — Toca con la canción',
    intro:    'Play Vuelve a la Vida with the band using five power chords: Bb5, G5, Eb5, C5 and F5.',
    intro_es: 'Toca Vuelve a la Vida con la banda con cinco acordes de potencia: Bb5, G5, Eb5, C5 y F5.',
    card: {
      track: 'vuelve-a-la-vida',
      chordGrid: true,  // chord grid: each chord once, cursor on the beats only (2026-10-26) — see CARD above
      slowest: true,    // Slowest / Slower / Slow / Normal
      caption:    'The song in order',
      caption_es: 'La canción en orden',
      sections: [
        {
          label: 'Verse 1', label_es: 'Estrofa 1',
          caption: 'Verse 1 · the chords repeat every 16 bars · the first time through has one more Bb5, 2 bars long, after Eb5', caption_es: 'Estrofa 1 · los acordes se repiten cada 16 compases · la primera vez hay un Bb5 más, de 2 compases, después de Eb5',
          fromBar: 2, bars: 50,
          rows: [6, 5, 5],
          notes: [
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 12 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 12 },
            { frets: [['G', 8], ['D', 8], ['A', 6]], note: 'Eb5', midi: [63, 58, 51], beats: 6 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 6 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 6 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 12 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 12 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 12 },
            { frets: [['G', 8], ['D', 8], ['A', 6]], note: 'Eb5', midi: [63, 58, 51], beats: 6 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 6 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 12 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 12 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 12 },
            { frets: [['G', 8], ['D', 8], ['A', 6]], note: 'Eb5', midi: [63, 58, 51], beats: 6 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 6 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 12 }
          ]
        },
        {
          label: 'Interlude 1', label_es: 'Interludio 1',
          caption: 'Interlude 1 · Bb5, F5, Bb5 · then stop for 2 bars while the band plays a fast run', caption_es: 'Interludio 1 · Bb5, F5, Bb5 · después para 2 compases mientras la banda toca una escala rápida',
          fromBar: 52, bars: 5,
          rows: [4],
          notes: [
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 3 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 3 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 3 },
            { rest: true, beats: 6 }
          ]
        },
        {
          label: 'Solo 1', label_es: 'Solo 1',
          caption: 'Solo 1 · the requinto (lead guitar) plays · keep strumming the same chords', caption_es: 'Solo 1 · toca el requinto (guitarra líder) · sigue rasgueando los mismos acordes',
          fromBar: 57, bars: 16,
          rows: [5],
          notes: [
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 12 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 12 },
            { frets: [['G', 8], ['D', 8], ['A', 6]], note: 'Eb5', midi: [63, 58, 51], beats: 6 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 6 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 12 }
          ]
        },
        {
          label: 'Verse 2', label_es: 'Estrofa 2',
          caption: 'Verse 2 · the same chords, four times through', caption_es: 'Estrofa 2 · los mismos acordes, cuatro vueltas',
          fromBar: 73, bars: 64,
          rows: [5, 5, 5, 5],
          notes: [
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 12 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 12 },
            { frets: [['G', 8], ['D', 8], ['A', 6]], note: 'Eb5', midi: [63, 58, 51], beats: 6 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 6 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 12 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 12 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 12 },
            { frets: [['G', 8], ['D', 8], ['A', 6]], note: 'Eb5', midi: [63, 58, 51], beats: 6 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 6 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 12 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 12 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 12 },
            { frets: [['G', 8], ['D', 8], ['A', 6]], note: 'Eb5', midi: [63, 58, 51], beats: 6 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 6 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 12 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 12 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 12 },
            { frets: [['G', 8], ['D', 8], ['A', 6]], note: 'Eb5', midi: [63, 58, 51], beats: 6 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 6 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 12 }
          ]
        },
        {
          label: 'Interlude 2', label_es: 'Interludio 2',
          caption: 'Interlude 2 · Bb5, F5, then Bb5 for 2 bars', caption_es: 'Interludio 2 · Bb5, F5 y después Bb5 por 2 compases',
          fromBar: 137, bars: 4,
          rows: [3],
          notes: [
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 3 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 3 },
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 6 }
          ]
        },
        {
          label: 'Solo 2', label_es: 'Solo 2',
          caption: 'Solo 2 · the same chords, then Eb5 and F5 · the card stops on F5, and the singer ends the song without a steady beat', caption_es: 'Solo 2 · los mismos acordes, después Eb5 y F5 · la tarjeta termina en F5, y el cantante termina la canción sin un pulso fijo',
          fromBar: 141, bars: 19,
          rows: [5, 2],
          notes: [
            { frets: [['G', 3], ['D', 3], ['A', 1]], note: 'Bb5', midi: [58, 53, 46], beats: 12 },
            { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43], beats: 12 },
            { frets: [['G', 8], ['D', 8], ['A', 6]], note: 'Eb5', midi: [63, 58, 51], beats: 6 },
            { frets: [['G', 5], ['D', 5], ['A', 3]], note: 'C5', midi: [60, 55, 48], beats: 6 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 12 },
            { frets: [['G', 8], ['D', 8], ['A', 6]], note: 'Eb5', midi: [63, 58, 51], beats: 3 },
            { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41], beats: 6 }
          ]
        }
      ],
      checks: [
        { label: 'Verse 1, slower', label_es: 'Estrofa 1, más lenta',
          text:    'Play verse 1 with the band without stopping.',
          text_es: 'Toca la estrofa 1 con la banda, sin detenerte.' },
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play with the band from verse 1 to the last chord without stopping.',
          text_es: 'Toca con la banda desde la estrofa 1 hasta el último acorde, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
  /* Power Chords on the Low E and A Strings in Time (Jonathan, 2026-10-30,
     for Monday): ca-23's Note Call, with a power chord called instead of a
     note. "G5 · root on the low E string" comes up on the beat; the student
     plays the chord, and the root fret is the answer (a tap on the root
     fret, or the mic hearing the chord: its root, its octave or the octave
     below, not the 5th — ncPowerTones). Same chunks, levels and speeds as ca-23
     (engine: renderNoteCall, drill.power). Roots on the low E and A strings
     only, so the 5th always has a string above it. */
  {
    id:    'ca-43',
    view:  'focus',   // one step at a time — see VIEW above
    title:    'Power Chords on the Low E and A Strings in Time',
    title_es: 'Acordes de potencia en las cuerdas Mi grave y La a tiempo',
    intro:    'Play each power chord as its name comes up, then turn off Show answer and pass Level 3.',
    intro_es: 'Toca cada acorde de potencia cuando aparece; luego apaga «Mostrar la respuesta» y pasa el Nivel 3.',
    steps: [
      {
        label:    'Practice — Frets 0 to 5',
        label_es: 'Practica — Trastes 0 a 5',
        drill: { type: 'notecall', power: true, strings: ['lowE', 'A'], minFret: 0, maxFret: 5 },
      },
      {
        label:    'Practice — Frets 5 to 8',
        label_es: 'Practica — Trastes 5 a 8',
        drill: { type: 'notecall', power: true, strings: ['lowE', 'A'], minFret: 5, maxFret: 8 },
      },
      {
        label:    'Practice — Frets 8 to 12',
        label_es: 'Practica — Trastes 8 a 12',
        drill: { type: 'notecall', power: true, strings: ['lowE', 'A'], minFret: 8, maxFret: 12 },
      },
      {
        label:    'Practice — The whole neck',
        label_es: 'Practica — Todo el mástil',
        drill: { type: 'notecall', power: true, strings: ['lowE', 'A'], minFret: 0, maxFret: 12 },
      },
    ],
  },
  /* ca-46 — the D D U U D U strum (Jonathan, 2026-11-03), ONE activity with
     TWO PATHS since 2026-11-04 ("merge them into one activity where the user
     picks the path they'd like to take with a preview of each"): it absorbed
     ca-47 ("Strum Pattern in Chunks", retired — see RETIRED IDS). The hand
     moves down on every number and up on every "+"; the strums land on
     1, 2, +, +, 4, +. Every board is drawn with `strum` (buildStrum in
     app.js — arrows over the count, chord names over the bars, ▶ Play strum
     sounds it), not a tab (Jonathan, 2026-11-03).

     PATHS (see PATHS atop this file): the student picks on a chooser card
     with a preview of each. `path: 'full'` — muted strings, then D5 ringing:
     the whole pattern from the first strum. `path: 'chunks'` (Jonathan,
     2026-11-03: "teach three strums and then stop, then add one and then
     stop. keep adding on" — "a separate path for students to choose"): 3
     strums, add an up, add a down, the whole pattern. The hand never stops
     on the chunks path: the part of the bar a chunk doesn't play yet is dots
     — the hand swings and misses — not a '-' stop (Jonathan, 2026-11-04,
     after an evaluation: stopping the hand trained the opposite of the
     pattern). Its first step has no got-it line on purpose (Jonathan,
     a52d087). Muted strings or D5 is the student's choice there (Jonathan,
     2026-11-04: "provide choice"); Play strum sounds D5 either way. Both
     paths then meet on the SHARED steps (no `path`): D5 C5 G5 D5, TWO bars
     each like the record's verse (song-facts: "two bars each" — it was one
     bar each until 2026-11-04), then the play-along with The Stellar
     Guitarist's "Sweet Child O' Mine" lesson from 10:20 (oEmbed-verified
     2026-11-03: "Sweet Child O' Mine - Guns & Roses Guitar Lesson Tutorial
     [Beginner Strumming & Easy Chords]"; the 10:20 start is Jonathan's).
     The "+" is said "and" — glossed once, in the caption of each path's
     first board (2026-11-04). No `journey`: it is a strum drill, not a
     Song Journey layer. Ticks are keyed by flat index, so the chunks steps
     are 3..6 whatever the student's route reads. */
  {
    id:    'ca-46',
    view:  'focus',   // one step at a time — see VIEW above
    title:    'Strum Pattern — Down, Down-Up, Up-Down-Up',
    title_es: 'Patrón de rasgueo — abajo, abajo-arriba, arriba-abajo-arriba',
    intro:    'Learn one strum pattern, then play it through the chords of "Sweet Child O\' Mine" with a video.',
    intro_es: 'Aprende un patrón de rasgueo y luego tócalo con los acordes de "Sweet Child O\' Mine" con un video.',
    paths: [
      { key: 'full',
        label:    'The whole pattern',
        label_es: 'El patrón completo',
        blurb:    'Play all six strums from the start: muted strings first, then on D5.',
        blurb_es: 'Toca los seis rasgueos desde el principio: primero con las cuerdas apagadas y luego en D5.' },
      { key: 'chunks',
        label:    'In chunks',
        label_es: 'Por partes',
        blurb:    'Start with three strums and add one at a time, until the pattern is there.',
        blurb_es: 'Empieza con tres rasgueos y agrega uno a la vez, hasta tener el patrón.' },
    ],
    steps: [
      /* ── Path "full" ── */
      {
        path: 'full',
        label:    'Practice — Muted strings',
        label_es: 'Practica — Cuerdas apagadas',
        text:    'Mute the strings and strum the pattern 8 times in a row without stopping.',
        text_es: 'Apoya la mano de trastear sobre las cuerdas y rasguea el patrón 8 veces seguidas sin detenerte.',
        strum: {
          caption:    'Muted strings · count "1 and 2 and 3 and 4 and" (the + is "and")',
          caption_es: 'Cuerdas apagadas · cuenta «1 y 2 y 3 y 4 y» (el + es «y»)',
          pattern: 'D.DU.UDU',   // 8 eighth notes: D down, U up, . hand moves but misses
          chords: {
            D5: { frets: [['A', 5], ['D', 7], ['G', 7]], midi: [50, 57, 62] }
          },
          bars: ['D5', 'D5'],
        },
      },
      {
        path: 'full',
        label:    'Practice — D5',
        label_es: 'Practica — D5',
        text:    'Hold D5 and strum the pattern 8 times in a row with every strum ringing.',
        text_es: 'Toca D5 y rasguea el patrón 8 veces seguidas con cada rasgueo sonando.',
        strum: {
          caption:    'D5 · the pattern 2 times',
          caption_es: 'D5 · el patrón 2 veces',
          pattern: 'D.DU.UDU',
          chords: {
            D5: { frets: [['A', 5], ['D', 7], ['G', 7]], midi: [50, 57, 62] }
          },
          bars: ['D5', 'D5'],
        },
      },
      /* ── Path "chunks" ── */
      {
        path: 'chunks',
        label:    'Practice — 3 strums',
        label_es: 'Practica — 3 rasgueos',
        text:    'Mute the strings or hold D5, strum Down, Down-Up, then swing your hand past the strings until the next 1.',
        text_es: 'Apaga las cuerdas o toca D5, rasguea abajo, abajo-arriba y mueve la mano sin tocarlas hasta el 1.',
        strum: {
          caption:    '3 strums, then swing · count "1 and 2 and 3 and 4 and" (the + is "and")',
          caption_es: '3 rasgueos, luego mueve la mano · cuenta «1 y 2 y 3 y 4 y» (el + es «y»)',
          pattern: 'D.DU....',
          chords: { D5: { frets: [['A', 5], ['D', 7], ['G', 7]], midi: [50, 57, 62] } },
          bars: ['D5', 'D5'],
        },
      },
      {
        path: 'chunks',
        label:    'Practice — Add an up',
        label_es: 'Practica — Agrega un arriba',
        text:    'Add an up on the + after 3 and play it 4 times in a row, your hand never stopping.',
        text_es: 'Agrega un arriba en el + después del 3 y tócalo 4 veces seguidas sin detener la mano.',
        strum: {
          caption:    '4 strums, then swing',
          caption_es: '4 rasgueos, luego mueve la mano',
          pattern: 'D.DU.U..',
          chords: { D5: { frets: [['A', 5], ['D', 7], ['G', 7]], midi: [50, 57, 62] } },
          bars: ['D5', 'D5'],
        },
      },
      {
        path: 'chunks',
        label:    'Practice — Add a down',
        label_es: 'Practica — Agrega un abajo',
        text:    'Add a down on 4 and play it 4 times in a row, your hand never stopping.',
        text_es: 'Agrega un abajo en el 4 y tócalo 4 veces seguidas sin detener la mano.',
        strum: {
          caption:    '5 strums, then swing',
          caption_es: '5 rasgueos, luego mueve la mano',
          pattern: 'D.DU.UD.',
          chords: { D5: { frets: [['A', 5], ['D', 7], ['G', 7]], midi: [50, 57, 62] } },
          bars: ['D5', 'D5'],
        },
      },
      {
        path: 'chunks',
        label:    'Practice — The whole pattern',
        label_es: 'Practica — El patrón completo',
        text:    'Add the last up and play it 8 times in a row without stopping.',
        text_es: 'Agrega el último arriba y tócalo 8 veces seguidas sin detenerte.',
        strum: {
          caption:    'The whole pattern',
          caption_es: 'El patrón completo',
          pattern: 'D.DU.UDU',
          chords: { D5: { frets: [['A', 5], ['D', 7], ['G', 7]], midi: [50, 57, 62] } },
          bars: ['D5', 'D5'],
        },
      },
      /* ── Shared — both paths end here ── */
      {
        label:    'Practice — D5, C5, G5',
        label_es: 'Practica — D5, C5, G5',
        text:    'Play the eight bars 4 times through, changing chord on the 1, the pattern never stopping.',
        text_es: 'Toca los ocho compases 4 veces completos, cambiando de acorde en el 1, sin detener el patrón.',
        strum: {
          caption:    'D5 · C5 · G5 · D5 · two bars each',
          caption_es: 'D5 · C5 · G5 · D5 · dos compases cada uno',
          pattern: 'D.DU.UDU',   // 8 eighth notes: D down, U up, . hand moves but misses
          chords: {
            D5: { frets: [['A', 5], ['D', 7], ['G', 7]], midi: [50, 57, 62] },
            C5: { frets: [['A', 3], ['D', 5], ['G', 5]], midi: [48, 55, 60] },
            G5: { frets: [['E', 3], ['A', 5], ['D', 5]], midi: [43, 50, 55] }
          },
          bars: ['D5', 'D5', 'C5', 'C5', 'G5', 'G5', 'D5', 'D5'],
          barsPerRow: 4,   // a row per two chords — eight bars fit the screen
        },
      },
      {
        label:    'Practice — Play along',
        label_es: 'Practica — Toca con el video',
        text:    'Play along from 10:20 with D5, C5 and G5, the pattern going through every change to the end.',
        text_es: 'Toca con el video desde 10:20 con D5, C5 y G5, sin parar el patrón en cada cambio, hasta el final.',
        video: { id: '0ASVeXINKYM', start: 620,
                 label: 'Play-along — starts at 10:20', label_es: 'Toca con el video — empieza en 10:20' },
      },
    ],
  },
  /* Call the chord (work order 2026-11-05, widget A; Day 36, reading a lyric
     sheet). The no-guitar rung under the lyric-sheet play-alongs: the record
     plays one section of a song and the student keeps one beat AHEAD of the
     chord changes — Follow shows the next chord in a big box, Call hides it
     and the student picks it. The drill reads the play-along card's own
     sections (ca-29 Watchtower, ca-33 Sweet Child; the SAME objects ca-38 and
     ca-45 read for their lyric sheets), so a change to the card's chords or
     bars moves the drill too. Focus view, label + drill on every step, no
     text: the widget carries its own directions and pass line. Engine:
     renderChordCall in app.js. Sweet Child's Call step uses the Intro, not the
     Verse: the verse is only 7 changes in two laps, the intro is the same
     D5 C5 G5 chords in 10, which is what "8 of 10" needs. */
  {
    id:    'ca-48',
    view:  'focus',   // one step at a time — see VIEW above
    title:    'Call the Chord',
    title_es: 'Di el acorde',
    steps: [
      {
        label:    'Practice — Watchtower, follow',
        label_es: 'Practica — Watchtower, seguir',
        drill: { type: 'chordcall', card: 'ca-29', section: 'Verse 1', mode: 'follow' },
      },
      {
        label:    'Practice — Watchtower, call',
        label_es: 'Practica — Watchtower, decir',
        drill: { type: 'chordcall', card: 'ca-29', section: 'Verse 1', mode: 'call' },
      },
      {
        label:    'Practice — Sweet Child verse, follow',
        label_es: 'Practica — Sweet Child, estrofa, seguir',
        drill: { type: 'chordcall', card: 'ca-33', section: 'Verse 1', mode: 'follow' },
      },
      {
        label:    'Practice — Sweet Child, call',
        label_es: 'Practica — Sweet Child, decir',
        drill: { type: 'chordcall', card: 'ca-33', section: 'Intro', mode: 'call' },
      },
    ],
  },
  /* Name the Power Chord (work order 2026-11-05, widget C; Day 39, power chord
     names from a chart). A power chord is named after its root, and the root is
     on the low E or A string — so the chord's name is the note's name plus a 5.
     Note Call's board and names (ncPool, sdNoteAt) with chord names, and no
     mic. Step 1 is Note Call on frets 5 to 12 (the frets ca-23's first two
     steps do not reach together; ca-23 itself is untouched, its steps are
     keyed). Steps 2-4 are the new `pcname` drill: fret to name, name to fret,
     both ways on the whole neck. Focus view, label + drill on every step, no
     text: the widget carries its own directions and its pass line (8 of 10
     with Show answer off). Engine: renderPowerName in app.js. */
  {
    id:    'ca-49',
    view:  'focus',   // one step at a time — see VIEW above
    title:    'Name the Power Chord',
    title_es: 'Nombra el acorde de potencia',
    steps: [
      {
        label:    'Practice — Notes, frets 5 to 12',
        label_es: 'Practica — Notas, trastes 5 a 12',
        drill: { type: 'notecall', strings: ['lowE', 'A'], minFret: 5, maxFret: 12 },
      },
      {
        label:    'Practice — Fret to name, frets 0 to 7',
        label_es: 'Practica — Del traste al nombre, trastes 0 a 7',
        drill: { type: 'pcname', mode: 'name', minFret: 0, maxFret: 7 },
      },
      {
        label:    'Practice — Name to fret, frets 0 to 7',
        label_es: 'Practica — Del nombre al traste, trastes 0 a 7',
        drill: { type: 'pcname', mode: 'fret', minFret: 0, maxFret: 7 },
      },
      {
        label:    'Practice — Both ways, frets 0 to 12',
        label_es: 'Practica — En los dos sentidos, trastes 0 a 12',
        drill: { type: 'pcname', mode: 'both', minFret: 0, maxFret: 12 },
      },
    ],
  },
  /* Call the Chord — "the cure" (2026-11-05; Day 38, which Jonathan turned into a
     practice day: "you propose something"). The same Follow and Call drill as
     ca-48 on the song's own play-along card (ca-30, the same sections ca-44's
     lyric sheet reads): the verses (A5 C5 F5, four beats a chord) and the
     chorus (D5 F5 C5 G5). Data only — no new engine. Luna has two chords and
     Seven Nation Army is a one-bar riff whose changes come closer than a beat,
     so neither makes a fair Call step. Focus view, label + drill on every step,
     no text. Engine: renderChordCall in app.js; checks.mjs 1cn pins all eight
     drills of ca-48 and ca-50. */
  {
    id:    'ca-50',
    view:  'focus',   // one step at a time — see VIEW above
    title:    'Call the Chord: "the cure"',
    title_es: 'Di el acorde: "the cure"',
    steps: [
      {
        label:    'Practice — "the cure" verses, follow',
        label_es: 'Practica — Estrofas de "the cure", seguir',
        drill: { type: 'chordcall', card: 'ca-30', section: '2 Verses', mode: 'follow' },
      },
      {
        label:    'Practice — "the cure" verses, call',
        label_es: 'Practica — Estrofas de "the cure", decir',
        drill: { type: 'chordcall', card: 'ca-30', section: '2 Verses', mode: 'call' },
      },
      {
        label:    'Practice — "the cure" chorus, follow',
        label_es: 'Practica — Coro de "the cure", seguir',
        drill: { type: 'chordcall', card: 'ca-30', section: 'Chorus 1', mode: 'follow' },
      },
      {
        label:    'Practice — "the cure" chorus, call',
        label_es: 'Practica — Coro de "the cure", decir',
        drill: { type: 'chordcall', card: 'ca-30', section: 'Chorus 1', mode: 'call' },
      },
    ],
  },
  /* "Perdón Mamá" — Play Along (Jonathan, 2026-11-09: "make a more play along
     song activity for it with power chords and actual chords", with the
     Rembeats record and its Moises chord chart). A practice card on the
     RECORD (track 'perdon-mama' in app.js — its comment has how the grid and
     the song map were found), bars 1-113, the whole song, and it loops (no
     Song Journey page, so not `wholeSong`). No lyrics: the song is not public
     domain, so the rows carry no words. Four-bar rows, as ca-39.

     6/8, COUNTED IN TWO BIG BEATS A BAR like Arsenal Efectivo and Luna
     (Jonathan picked this over 3/4 and 4/4, 2026-11-10, after the review
     measured the record's accents: strong every 6 pulses, the bass cell
     root-root-fifth every 3 pulses). Every `beats` below is a big beat: one
     bar = 2.

     THE CHORDS: Moises' chart for this record (key E major) gives C#m, B,
     F#m and A, with C#m7, F#m7, Amaj7 and one E around them. The record is
     ONE 8-bar loop all the way through, one chord per bar: C#m C#m | B B |
     F#m F#m | A | B (16 big beats). The bass agrees with that on 93% of the
     pulses; an A one pulse before the B, which the first build wrote, is
     C#m with its fifth in the bass (G# 49% of laps, A 16%), so it is gone.
     The sevenths and the E (Amaj7's top) are folded into the plain chord.
     THE BAR GRID: bar 1 is the first loud C#m, pulse 2 of the file (the two
     pulses before it are a near-silent lead-in); the five signs that agree
     are the first loud hit, the bass cell starts, every chord change, the
     strongest accent and the final C#m. Song map in these bars: band alone
     1-16, singing from about bar 18 to 49, band alone to 65, singing from
     about 66 to 103, band alone to 112, the last C#m at bar 113 ringing to
     the end (the section edges sit on laps, so they are within a bar).

     Full chords / Power chords switch, like ca-39. Full chords are the
     record's key as barre chords (C#m and B on the A-string shape, F#m on
     the low-E shape, open A); power chords sit in frets 2-7 (F#5 and A5 on
     the low E, B5 and C#5 on the A string). Opens on Power chords. */
  {
    id:    'ca-51',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    library: true,    // on the Songs page's More Play Along songs list for everyone — see LIBRARY above
    optional: true,   // Optional until switched to Required on the board — see OPTIONAL above
    chordStart: 'power',   // opens on Power chords until the student picks — see CHORD VERSIONS above
    chordVersions: {
      power: {
        'C#m': { frets: [['G', 6], ['D', 6], ['A', 4]], note: 'C#5', midi: [61, 56, 49] },
        'B':   { frets: [['G', 4], ['D', 4], ['A', 2]], note: 'B5', midi: [59, 54, 47] },
        'F#m': { frets: [['D', 4], ['A', 4], ['E', 2]], note: 'F#5', midi: [54, 49, 42] },
        'A':   { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] },
      },
    },
    title:    '"Perdón Mamá" - Chuy Montana — Play Along',
    title_es: '"Perdón Mamá" - Chuy Montana — Toca con la canción',
    intro:    'Play Perdón Mamá with the band: C#m, B, F#m and A in the same eight-bar loop all the way through.',
    intro_es: 'Toca Perdón Mamá con la banda: C#m, B, F#m y A en la misma vuelta de ocho compases de principio a fin.',
    intro_power:    'Play Perdón Mamá with the band: C#5, B5, F#5 and A5 in the same eight-bar loop all the way through.',
    intro_power_es: 'Toca Perdón Mamá con la banda: C#5, B5, F#5 y A5 en la misma vuelta de ocho compases de principio a fin.',
    card: {
      track: 'perdon-mama',
      chordGrid: true,  // chord grid: each chord once, cursor on the beats only (2026-10-26) — see CARD above
      slowest: true,    // Slowest / Slower / Slow / Normal
      caption:    'The song in order',
      caption_es: 'La canción en orden',
      sections: [
        {
          label: 'Intro', label_es: 'Intro',
          caption: 'Intro · the band plays alone · the eight-bar loop, two times', caption_es: 'Intro · la banda toca sola · la vuelta de ocho compases, dos veces',
          fromBar: 1, bars: 16,
          notes: [
            { frets: [['A', 4], ['D', 6], ['G', 6], ['B', 5], ['e', 4]], note: 'C#m', midi: [49, 56, 61, 64, 68], beats: 4 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 4 },
            { frets: [['E', 2], ['A', 4], ['D', 4], ['G', 2], ['B', 2], ['e', 2]], note: 'F#m', midi: [42, 49, 54, 57, 61, 66], beats: 4 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 2 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 2 },
            { frets: [['A', 4], ['D', 6], ['G', 6], ['B', 5], ['e', 4]], note: 'C#m', midi: [49, 56, 61, 64, 68], beats: 4 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 4 },
            { frets: [['E', 2], ['A', 4], ['D', 4], ['G', 2], ['B', 2], ['e', 2]], note: 'F#m', midi: [42, 49, 54, 57, 61, 66], beats: 4 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 2 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 2 }
          ]
        },
        {
          label: 'Verse 1', label_es: 'Estrofa 1',
          caption: 'Verse 1 · the same eight bars, four times', caption_es: 'Estrofa 1 · los mismos ocho compases, cuatro veces',
          fromBar: 17, bars: 32,
          notes: [
            { frets: [['A', 4], ['D', 6], ['G', 6], ['B', 5], ['e', 4]], note: 'C#m', midi: [49, 56, 61, 64, 68], beats: 4 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 4 },
            { frets: [['E', 2], ['A', 4], ['D', 4], ['G', 2], ['B', 2], ['e', 2]], note: 'F#m', midi: [42, 49, 54, 57, 61, 66], beats: 4 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 2 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 2 },
            { frets: [['A', 4], ['D', 6], ['G', 6], ['B', 5], ['e', 4]], note: 'C#m', midi: [49, 56, 61, 64, 68], beats: 4 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 4 },
            { frets: [['E', 2], ['A', 4], ['D', 4], ['G', 2], ['B', 2], ['e', 2]], note: 'F#m', midi: [42, 49, 54, 57, 61, 66], beats: 4 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 2 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 2 },
            { frets: [['A', 4], ['D', 6], ['G', 6], ['B', 5], ['e', 4]], note: 'C#m', midi: [49, 56, 61, 64, 68], beats: 4 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 4 },
            { frets: [['E', 2], ['A', 4], ['D', 4], ['G', 2], ['B', 2], ['e', 2]], note: 'F#m', midi: [42, 49, 54, 57, 61, 66], beats: 4 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 2 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 2 },
            { frets: [['A', 4], ['D', 6], ['G', 6], ['B', 5], ['e', 4]], note: 'C#m', midi: [49, 56, 61, 64, 68], beats: 4 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 4 },
            { frets: [['E', 2], ['A', 4], ['D', 4], ['G', 2], ['B', 2], ['e', 2]], note: 'F#m', midi: [42, 49, 54, 57, 61, 66], beats: 4 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 2 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 2 }
          ]
        },
        {
          label: 'Interlude', label_es: 'Interludio',
          caption: 'Interlude · the singing stops and the band keeps going · two times', caption_es: 'Interludio · se acaba el canto y la banda sigue · dos veces',
          fromBar: 49, bars: 16,
          notes: [
            { frets: [['A', 4], ['D', 6], ['G', 6], ['B', 5], ['e', 4]], note: 'C#m', midi: [49, 56, 61, 64, 68], beats: 4 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 4 },
            { frets: [['E', 2], ['A', 4], ['D', 4], ['G', 2], ['B', 2], ['e', 2]], note: 'F#m', midi: [42, 49, 54, 57, 61, 66], beats: 4 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 2 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 2 },
            { frets: [['A', 4], ['D', 6], ['G', 6], ['B', 5], ['e', 4]], note: 'C#m', midi: [49, 56, 61, 64, 68], beats: 4 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 4 },
            { frets: [['E', 2], ['A', 4], ['D', 4], ['G', 2], ['B', 2], ['e', 2]], note: 'F#m', midi: [42, 49, 54, 57, 61, 66], beats: 4 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 2 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 2 }
          ]
        },
        {
          label: 'Verse 2', label_es: 'Estrofa 2',
          caption: 'Verse 2 · the same eight bars, five times', caption_es: 'Estrofa 2 · los mismos ocho compases, cinco veces',
          fromBar: 65, bars: 40,
          notes: [
            { frets: [['A', 4], ['D', 6], ['G', 6], ['B', 5], ['e', 4]], note: 'C#m', midi: [49, 56, 61, 64, 68], beats: 4 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 4 },
            { frets: [['E', 2], ['A', 4], ['D', 4], ['G', 2], ['B', 2], ['e', 2]], note: 'F#m', midi: [42, 49, 54, 57, 61, 66], beats: 4 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 2 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 2 },
            { frets: [['A', 4], ['D', 6], ['G', 6], ['B', 5], ['e', 4]], note: 'C#m', midi: [49, 56, 61, 64, 68], beats: 4 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 4 },
            { frets: [['E', 2], ['A', 4], ['D', 4], ['G', 2], ['B', 2], ['e', 2]], note: 'F#m', midi: [42, 49, 54, 57, 61, 66], beats: 4 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 2 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 2 },
            { frets: [['A', 4], ['D', 6], ['G', 6], ['B', 5], ['e', 4]], note: 'C#m', midi: [49, 56, 61, 64, 68], beats: 4 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 4 },
            { frets: [['E', 2], ['A', 4], ['D', 4], ['G', 2], ['B', 2], ['e', 2]], note: 'F#m', midi: [42, 49, 54, 57, 61, 66], beats: 4 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 2 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 2 },
            { frets: [['A', 4], ['D', 6], ['G', 6], ['B', 5], ['e', 4]], note: 'C#m', midi: [49, 56, 61, 64, 68], beats: 4 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 4 },
            { frets: [['E', 2], ['A', 4], ['D', 4], ['G', 2], ['B', 2], ['e', 2]], note: 'F#m', midi: [42, 49, 54, 57, 61, 66], beats: 4 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 2 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 2 },
            { frets: [['A', 4], ['D', 6], ['G', 6], ['B', 5], ['e', 4]], note: 'C#m', midi: [49, 56, 61, 64, 68], beats: 4 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 4 },
            { frets: [['E', 2], ['A', 4], ['D', 4], ['G', 2], ['B', 2], ['e', 2]], note: 'F#m', midi: [42, 49, 54, 57, 61, 66], beats: 4 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 2 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 2 }
          ]
        },
        {
          label: 'Ending', label_es: 'Final',
          caption: 'Ending · one more time through · the song ends on C#m', caption_es: 'Final · una vuelta más · la canción termina en C#m',
          caption_power: 'Ending · one more time through · the song ends on C#5', caption_power_es: 'Final · una vuelta más · la canción termina en C#5',
          fromBar: 105, bars: 9,
          notes: [
            { frets: [['A', 4], ['D', 6], ['G', 6], ['B', 5], ['e', 4]], note: 'C#m', midi: [49, 56, 61, 64, 68], beats: 4 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 4 },
            { frets: [['E', 2], ['A', 4], ['D', 4], ['G', 2], ['B', 2], ['e', 2]], note: 'F#m', midi: [42, 49, 54, 57, 61, 66], beats: 4 },
            { frets: [['A', 0], ['D', 2], ['G', 2], ['B', 2], ['e', 0]], note: 'A', midi: [45, 52, 57, 61, 64], beats: 2 },
            { frets: [['A', 2], ['D', 4], ['G', 4], ['B', 4], ['e', 2]], note: 'B', midi: [47, 54, 59, 63, 66], beats: 2 },
            { frets: [['A', 4], ['D', 6], ['G', 6], ['B', 5], ['e', 4]], note: 'C#m', midi: [49, 56, 61, 64, 68], beats: 2 }
          ]
        }
      ],
      checks: [
        { label: 'Intro and verse 1, slower', label_es: 'Intro y estrofa 1, más lentas',
          text:    'Play the intro and verse 1 with the band without stopping.',
          text_es: 'Toca la intro y la estrofa 1 con la banda, sin detenerte.' },
        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',
          text:    'Play with the band from the intro to the last chord without stopping.',
          text_es: 'Toca con la banda desde la intro hasta el último acorde, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the speed to Normal and play the whole song with the band.',
          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda.' }
      ]
    },
    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).
    steps: [],
  },
];

/* Each lyric-sheet card plays its play-along card's sections from its chord
   sheet (see ca-38, ca-44, ca-45 above): ca-38 is ca-29's, ca-44 ca-30's,
   ca-45 ca-33's. The same array, not a copy: a sheet card can't drift from
   its play-along. */
(function(){
  const list = window.CLASS_ACTIVITIES;
  [['ca-29', 'ca-38'], ['ca-30', 'ca-44'], ['ca-33', 'ca-45']].forEach(([f, t]) => {
    const from = list.find(a => a.id === f), to = list.find(a => a.id === t);
    if(from && to) to.card.sections = from.card.sections;
  });
})();

/* All Along the Watchtower — the Neil Young version of ca-26, ca-29 and ca-40
   (Jonathan, 2026-10-30: "a toggle switch to switch between the Neil Young
   track and the Jimi Hendrix track. Make Jimi the default. The timing will
   change based on the selection"). Each card carries recordingVersions.neil
   (see RECORDING VERSIONS beside caView in app.js); this fills in its `card`
   fields, which replace the Jimi card's sections and caption when the
   student picks Neil. ca-38 (the lyric sheet) has no Neil version: its PDF
   has 224 chord names for Jimi's form, and this recording's form is
   different.

   THE RECORDING, measured on the 115 BPM file (track
   'all-along-the-watchtower-neil' in app.js has how): one two-bar loop, 86
   laps in the file, with the chords changing at beats 1, 3, 4.5 and 7.5 of the eight —
   A for 2 beats, G for 1.5, F for 3, G for 1.5 (per-eighth bass counts over
   every lap: A on slots 1-4 in 69-82 laps of 86, G on 5-7, F from slot 8
   to 13, G on 14-16). The card follows the bars up to 162, 81 laps: lap 82
   holds the A (the start of the ending), and after that the band slows to
   the end and a bar runs 3 s or more. Laps 70-74 (bars 139-148, a solo) were
   not confirmed: the bass wanders there.

   THE STRUMMING (Jonathan, 2026-10-30): the power-chord cards (ca-29 and
   ca-40) show a strum on EVERY eighth, down on each number and up on each "+",
   each with its chord name — the same look as Jimi's ca-29: A5 x4, G5 x3,
   F5 x6, G5 x3 (the chord on each of the 16 eighths is the bass's, counted per
   eighth over the laps above). The record's rhythm guitar itself was checked
   by an onset pass (full mix minus rhythm-down mix, which are aligned to 3
   samples, on the 81 laps): a strum attack above chance on 15 of the 16
   eighths, the numbers strongest; the "+" after beat 1 of bar 1 shows none
   above chance (12% of laps, 10% is chance), so a strum there is Jonathan's
   call, not the record's (checked, not proven: distortion hides re-strikes).
   The single-note card (ca-26) is unchanged: it plucks once per beat the
   chord is held, with its own honest caption.

   NO SONG MAP: this recording's verse and solo boundaries were not marked,
   so the card is eight parts of ten laps (the last one eleven), in bar
   order. Rename them when someone has listened through. Every part starts
   on an odd bar, so it starts on the A. */
(function(){
  const list = window.CLASS_ACTIVITIES;
  // Laps 1-10, 11-20 ... 71-81 of the two-bar loop; each part starts on an odd bar, so on the A.
  const parts = [
    { label: 'Part 1', label_es: 'Parte 1', caption: 'Part 1 — A G F G, 10 laps', caption_es: 'Parte 1 — A G F G, 10 vueltas', fromBar: 1, bars: 2, reps: 10, repLabel: 'Lap', repLabel_es: 'Vuelta' },
    { label: 'Part 2', label_es: 'Parte 2', caption: 'Part 2 — A G F G, 10 laps', caption_es: 'Parte 2 — A G F G, 10 vueltas', fromBar: 21, bars: 2, reps: 10, repLabel: 'Lap', repLabel_es: 'Vuelta' },
    { label: 'Part 3', label_es: 'Parte 3', caption: 'Part 3 — A G F G, 10 laps', caption_es: 'Parte 3 — A G F G, 10 vueltas', fromBar: 41, bars: 2, reps: 10, repLabel: 'Lap', repLabel_es: 'Vuelta' },
    { label: 'Part 4', label_es: 'Parte 4', caption: 'Part 4 — A G F G, 10 laps', caption_es: 'Parte 4 — A G F G, 10 vueltas', fromBar: 61, bars: 2, reps: 10, repLabel: 'Lap', repLabel_es: 'Vuelta' },
    { label: 'Part 5', label_es: 'Parte 5', caption: 'Part 5 — A G F G, 10 laps', caption_es: 'Parte 5 — A G F G, 10 vueltas', fromBar: 81, bars: 2, reps: 10, repLabel: 'Lap', repLabel_es: 'Vuelta' },
    { label: 'Part 6', label_es: 'Parte 6', caption: 'Part 6 — A G F G, 10 laps', caption_es: 'Parte 6 — A G F G, 10 vueltas', fromBar: 101, bars: 2, reps: 10, repLabel: 'Lap', repLabel_es: 'Vuelta' },
    { label: 'Part 7', label_es: 'Parte 7', caption: 'Part 7 — A G F G, 10 laps', caption_es: 'Parte 7 — A G F G, 10 vueltas', fromBar: 121, bars: 2, reps: 10, repLabel: 'Lap', repLabel_es: 'Vuelta' },
    { label: 'Part 8', label_es: 'Parte 8', caption: 'Part 8 — A G F G, 11 laps', caption_es: 'Parte 8 — A G F G, 11 vueltas', fromBar: 141, bars: 2, reps: 11, repLabel: 'Lap', repLabel_es: 'Vuelta' }
  ];
  const A5 = { frets: [['D', 7], ['A', 7], ['E', 5]], note: 'A5', midi: [57, 52, 45] };
  const G5 = { frets: [['D', 5], ['A', 5], ['E', 3]], note: 'G5', midi: [55, 50, 43] };
  const F5 = { frets: [['D', 3], ['A', 3], ['E', 1]], note: 'F5', midi: [53, 48, 41] };
  const copy = n => ({ ...n, frets: n.frets ? n.frets.map(f => f.slice()) : undefined, midi: Array.isArray(n.midi) ? n.midi.slice() : n.midi });
  // [note, string fret, midi, beats]: one pluck on each beat a chord is held, the half beat at the end of each G
  const single = [['A', 5, 45, 1], ['A', 5, 45, 1], ['G', 3, 43, 1], ['G', 3, 43, 0.5], ['F', 1, 41, 1], ['F', 1, 41, 1], ['F', 1, 41, 1], ['G', 3, 43, 1], ['G', 3, 43, 0.5]]
    .map(([note, fret, midi, beats]) => ({ string: 'E', fret, note, midi, beats }));
  // 16 strums of half a beat, no rest: A5 x4 (1 + 2 +), G5 x3, F5 x6 (it starts on the "+" after 4), G5 x3 (it starts on the "+" after 3 in bar 2)
  const power = [[A5, 4], [G5, 3], [F5, 6], [G5, 3]].flatMap(([c, n]) => Array.from({ length: n }, () => ({ ...copy(c), beats: 0.5 })));
  // rows: one tab row for the nine plucks of a lap, so the lap is not split 5 / 4
  const sections = (notes, rows) => parts.map(p => ({ ...p, ...(rows ? { rows } : {}), notes: notes.map(copy) }));
  const neil = (id, card) => {
    const a = list.find(x => x.id === id);
    if(a && a.recordingVersions && a.recordingVersions.neil) a.recordingVersions.neil.card = card;
  };
  neil('ca-26', {
    caption:    'The whole song in order · pluck each note when it lights up · the notes change where Neil Young changes chord',
    caption_es: 'La canción completa en orden · toca cada nota cuando se ilumine · las notas cambian donde Neil Young cambia de acorde',
    sections: sections(single, [9])
  });
  neil('ca-29', {
    everyStrum: true,   // a strum on every eighth, each with its chord name, like Jimi's (Jonathan, 2026-10-30)
    caption:    'The whole song in power chords · strum down on each number, up on each + · the chords change where Neil Young changes them',
    caption_es: 'La canción completa con acordes de potencia · rasguea hacia abajo en cada número y hacia arriba en cada + · los acordes cambian donde Neil Young los cambia',
    sections: sections(power)
  });
  // ca-40's Neil title and intro are on its recordingVersions.neil entry (version level), above.
  neil('ca-40', {
    everyStrum: true,   // ca-40's own Jimi card has one strum per chord; Neil's is the down-up strum on every eighth
    caption:    'The whole song in power chords · strum down on each number, up on each + · the chords change where Neil Young changes them',
    caption_es: 'La canción completa con acordes de potencia · rasguea hacia abajo en cada número y hacia arriba en cada + · los acordes cambian donde Neil Young los cambia',
    sections: sections(power)
  });
})();
