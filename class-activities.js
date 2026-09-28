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
   complete — so it can be added to or taken off any activity at any time
   without touching saved progress. Leave it off and the card is the usual
   accordion. The console preview still lists every step, with a note.
   checks.mjs 1d rejects any value but 'focus' and 'card'. (Jonathan,
   2026-09-25: ca-20, ca-21; ca-10 and ca-18 were Focus view until they
   became practice cards, below.)

   CARD — `view: 'card'` plus a `card` object: the PRACTICE CARD (Jonathan,
   2026-09-27; ca-18 and ca-10). One screen instead of a ladder: the song's
   tab, one "Play song" button that plays the real backing track and moves
   the tab note by note, a Slower / Normal switch, the Metronome (a click on
   every counted beat, made by the site), and three or four checkboxes. The
   slides teach the rungs; the card is what students practise with. The
   activity's `steps` stay, as the HELP ladder folded under "More practice
   help" — read-only, still four at most, and none of them may name the
   Song Journey page. Complete = every numbered check ticked; Level up is
   extra. Shape (caCardBodyHtml / ccLayout in app.js; checks.mjs 1bf):
     card: {
       track: 'the-cure',                  // a SNIPPET_TRACKS key
       caption, caption_es,                // the tab's heading
       sections: [{                        // back to back, in song order
         label, label_es,                  // the tap-to-start button ("Chorus")
         caption, caption_es,              // the heading over its tab page
         fromBar: 21, bars: 8,             // bars of the RECORD, felt pulse,
                                           // like a snippet window
         reps: 2, repLabel, repLabel_es,   // optional: the band plays these
                                           // notes `reps` times; the tab shows
                                           // them once, with "Verse 1 of 2"
         notes: [ { string, fret, note, midi, beats? } ],  // one pass;
                                           // beats must add up to bars x the
                                           // track's beatsPerBar
       }],
       checks: [
         { label, label_es, text, text_es },            // numbered checks
         { levelUp: true, text, text_es },               // last, exactly one;
       ],                                  // the only place the Song Journey
     }                                     // page may be named (its button
                                           // renders there)

   FOUR STEPS AT MOST (Jonathan, 2026-09-25): a class activity teaches in
   four steps or fewer — usually Learn / Practice pairs ending on an
   open-ended Practice rung. checks.mjs 1bb fails the push on a fifth step;
   the activities already taught before the rule are pinned there as
   FOUR_STEP_LEGACY, and that list only shrinks.

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
   NOT max-in-file + 1 — the next new activity is `ca-10`. Any student who
   had already ticked `ca-9` keeps a harmless orphan key in Firestore.
   `ca-16` ("Happy Birthday — The A-String Way") went the same way on
   2026-09-16: its steps were merged into `ca-17`, after the A-string note
   names. Same orphan-key story for anyone who had ticked it.

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
     title_es: 'Relevo de acordes de poder',
     intro:    'One or two sentences connecting today\'s work to what the
                 student already did.',
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
         // content — first-party authored files, not escaped). A step is a
         // Learn step or a Practice step and asks for ONE thing (Jonathan,
         // 2026-09-23). Learn: look, listen, say — no standard. Practice:
         // play one thing — exactly one "You've got it when:" line with one
         // recovery move inside it. No <ol>/<ul> inside a step; if you need
         // a list, you need more steps. Label prefixes: "Learn — " /
         // "Aprende — ", "Practice — " / "Practica — ".
         // A trailing "You've got it when: …" / "Lo tienes cuando: …"
         // sentence (exact strings — matched by the render-time GOT_IT_RE)
         // gets the established green-rule/italic treatment for free; write
         // it as plain text after the list, never as its own <li> or a
         // hand-written <span class="got-it">.
         text:    'What the student reads and does. Multi-step directions
                    are an <ol>/<ul>, same house rule as module content.',
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
         // four mp3 paths (fast/slow x with/without metronome), the tempo
         // arithmetic, and the one measured number — the track's `anchor`,
         // its first downbeat — that places every window on every step of
         // that song. The card renders a Slow and a Metronome toggle off
         // the same files the Song Journey page uses, and the student can
         // only ever hear one thing at a time: starting the band stops the
         // tab player, and starting the tab stops the band.
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
    number: 2,
    title:    'Playing Happy Birthday — The Whole Song',
    title_es: 'Tocando Happy Birthday — La canción completa',
    intro:    'You played Line 1 already. Today you play all four lines without ever leaving the low E string — the melody goes up to the double dot at fret 12 and comes back down.',
    intro_es: 'Ya tocaste la Línea 1. Hoy tocas las cuatro líneas sin salirte nunca de la cuerda Mi grave — la melodía sube hasta el punto doble del traste 12 y vuelve a bajar.',
    steps: [
      {
        label:    'Lines 1 and 2',
        label_es: 'Líneas 1 y 2',
        text: 'The first half of the song. Line 1 is the line you learned last time; Line 2 starts the same and ends higher.<ul><li>Line 1 fingers: open, open, 1, open, 4, 3</li><li>Line 2: your hand moves up until finger 1 sits on fret 5 — finger 3 → fret 7, finger 1 → fret 5. Eyes on fret 7 <em>before</em> your hand moves</li><li>BPM 70. Loop each line alone until it\'s clean, then play them back to back</li></ul>You\'ve got it when: Line 1 into Line 2, four times through, without stopping.',
        text_es: 'La primera mitad de la canción. La Línea 1 es la que aprendiste la vez pasada; la Línea 2 empieza igual y termina más arriba.<ul><li>Dedos de la Línea 1: al aire, al aire, 1, al aire, 4, 3</li><li>Línea 2: la mano sube hasta que el dedo 1 queda en el traste 5 — dedo 3 → traste 7, dedo 1 → traste 5. Ojos en el traste 7 <em>antes</em> de mover la mano</li><li>BPM 70. Repite cada línea sola hasta que salga limpia, y después tócalas seguidas</li></ul>Lo tienes cuando: de la Línea 1 a la Línea 2, cuatro veces seguidas, sin detenerte.',
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
        text: 'The second half of the song is played higher up the same string. Two new landing marks: the double dot at fret 12 — that note is an E, the same note as the open string, only higher — and the single dot at fret 9.<br>Play the notes below, looking at the dot before your hand moves. Then try it without looking.<br>You\'ve got it when: you land on 12 and on 9 without hunting for them, three times in a row.',
        text_es: 'La segunda mitad de la canción se toca más arriba en la misma cuerda. Dos marcas de referencia nuevas: el punto doble del traste 12 — esa nota es un E, la misma nota que la cuerda al aire, solo que más aguda — y el punto sencillo del traste 9.<br>Toca las notas de abajo, mirando el punto antes de mover la mano. Después inténtalo sin mirar.<br>Lo tienes cuando: caes en el 12 y en el 9 sin andarlos buscando, tres veces seguidas.',
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
        text: 'Line 3 makes the biggest jump in the song — it\'s where you sing the name.<ul><li>Two open notes, then your hand travels: finger 1 on fret 9, finger 4 reaching the double dot at fret 12</li><li>Walk down 12 → 9, then shift home: finger 4 → fret 5, finger 3 → fret 4, finger 1 → fret 2</li></ul>You\'ve got it when: Line 3, four times through, without stopping.',
        text_es: 'La Línea 3 da el salto más grande de la canción — es donde cantas el nombre.<ul><li>Dos notas al aire, y luego tu mano viaja: dedo 1 en el traste 9, dedo 4 estirándose al punto doble del traste 12</li><li>Baja del 12 al 9, y después regresa a la posición base: dedo 4 → traste 5, dedo 3 → traste 4, dedo 1 → traste 2</li></ul>Lo tienes cuando: la Línea 3, cuatro veces seguidas, sin detenerte.',
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
        text: 'Line 4 starts higher than any other line in the song, then comes back down to fret 5.<ul><li>Finger 2 on fret 10, finger 1 on fret 9</li><li>Shift down: finger 1 → fret 5, finger 3 → fret 7. The frets are narrow that high, so stay on your fingertips</li></ul>You\'ve got it when: Line 3 into Line 4, four times through, without stopping.',
        text_es: 'La Línea 4 empieza más arriba que cualquier otra línea de la canción, y después baja al traste 5.<ul><li>Dedo 2 en el traste 10, dedo 1 en el traste 9</li><li>Baja: dedo 1 → traste 5, dedo 3 → traste 7. Allá arriba los trastes son angostos, así que quédate sobre las puntas de los dedos</li></ul>Lo tienes cuando: de la Línea 3 a la Línea 4, cuatro veces seguidas, sin detenerte.',
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
        text: 'All four lines, start to finish — the whole song on one string, no stopping in between. Then raise the tempo.<ul><li>Every clean pass: raise the BPM by 10</li><li>Fast already? Play it for the person next to you and have them sing along</li></ul>You\'ve got it when: the whole song start to finish without stopping, and the tempo raised at least three times without stopping — then keep climbing.',
        text_es: 'Las cuatro líneas, de principio a fin — la canción completa en una sola cuerda, sin detenerte entre medio. Después sube el tempo.<ul><li>Cada pasada limpia: sube el BPM 10 puntos</li><li>¿Ya vas rápido? Tócala para la persona de al lado y que cante contigo</li></ul>Lo tienes cuando: las cuatro líneas, una tras otra sin detenerte, y el tempo subido al menos tres veces sin detenerte — y de ahí, sigue subiendo.',
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
    number: 3,
    title:    'Finger Gym 1',
    title_es: 'Gimnasio de Dedos 1',
    intro:    'Today isn\'t a song day — it\'s a training day. Three events in the first five frets: the Ladder, the Spider, the Reach. Raise your BPM with every clean set.',
    intro_es: 'Hoy no es día de canciones — es día de entrenamiento. Tres eventos en los primeros cinco trastes: la Escalera, la Araña y el Estiramiento. Sube tu BPM con cada serie limpia.',
    steps: [
      {
        label:    'The Ladder',
        label_es: 'La Escalera',
        text: 'Event 1 — the Ladder. Play the tab below, one finger per fret — the circled number under each note is the finger it wants.<ul><li>Set the BPM to 50 — one note per click</li><li>Press with the tips of your fingers, thumb BEHIND the neck</li></ul>You\'ve got it when: all four notes ring clean — no buzz — three times in a row. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'Evento 1 — la Escalera. Toca la tablatura de abajo, un dedo por traste — el número en el círculo debajo de cada nota es el dedo que va ahí.<ul><li>Pon el BPM en 50 — una nota por clic</li><li>Presiona con las puntas de los dedos, pulgar DETRÁS del mástil</li></ul>Lo tienes cuando: las cuatro notas suenan limpias — sin zumbido — tres veces seguidas. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
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
        text: 'Add the shift: climb, slide the whole hand up one fret — fingers keeping their spacing — then climb again from there.\nYou\'ve got it when: two full climbs back to back and your thumb stays behind the neck the whole way.',
        text_es: 'Agrega el cambio: sube, desliza toda la mano un traste hacia arriba — los dedos mantienen su separación — y sube otra vez desde ahí.\nLo tienes cuando: dos subidas completas seguidas y tu pulgar se queda detrás del mástil todo el tiempo.',
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
        text: 'Event 2 — the Spider. Same four fingers, alternating between two strings.<ul><li>Watch for this: finger 3 tends to follow finger 2 onto the A string — keep it on the low E</li><li>The second half of the tab is the same shape one fret higher</li></ul>You\'ve got it when: one full pass with every note on the right string, any speed.',
        text_es: 'Evento 2 — la Araña. Los mismos cuatro dedos, alternando entre dos cuerdas.<ul><li>Ojo con esto: el dedo 3 tiende a seguir al dedo 2 hacia la cuerda La — mantenlo en el Mi grave</li><li>La segunda mitad de la tablatura es la misma forma un traste más arriba</li></ul>Lo tienes cuando: una pasada completa con cada nota en la cuerda correcta, a cualquier velocidad.',
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
        text: 'Event 3 — the Reach. Finger 1 plants on the low fret and stays there while the pinky reaches out and comes back.<ul><li>One fret short still counts if the full reach is too far today</li><li>Stretch, never pain — if it hurts, stop</li></ul>You\'ve got it when: four reaches in a row and finger 1 never lifts.',
        text_es: 'Evento 3 — el Estiramiento. El dedo 1 se planta en el traste bajo y se queda ahí mientras el meñique se estira y regresa.<ul><li>Un traste menos también cuenta si hoy el estiramiento completo te queda lejos</li><li>Estira sin dolor — si duele, detente</li></ul>Lo tienes cuando: cuatro estiramientos seguidos y el dedo 1 nunca se levanta.',
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
        text: 'The circuit:<ol><li>Run Ladder ×4, Spider ×4, Reach ×4 — that\'s one set. Start the Metro tool at 50 BPM.</li><li>Every clean set, raise the BPM by 10: 50 is bronze, 60 is silver, 70 is gold.</li></ol>You\'ve got it when: two full sets in a row are clean, the second one 10 BPM faster than the first.',
        text_es: 'El circuito:<ol><li>Toca Escalera ×4, Araña ×4, Estiramiento ×4 — eso es una serie. Arranca la herramienta Metro a 50 BPM.</li><li>Cada serie limpia, sube el BPM 10 puntos: 50 es bronce, 60 es plata, 70 es oro.</li></ol>Lo tienes cuando: dos series completas seguidas y limpias, la segunda 10 BPM más rápida que la primera.',
      },
    ],
  },
  {
    id:    'ca-3',
    number: 5,
    title:    'Finger Gym 2 — Down the Ladder',
    title_es: 'Gimnasio de Dedos 2 — Bajando la Escalera',
    intro:    'Last Gym went up. Today you come back down, then take the Ladder onto all six strings. Going down is harder than going up — the pinky has to lead.',
    intro_es: 'El Gimnasio pasado subiste. Hoy vas a bajar, y después vas a llevar la Escalera a las seis cuerdas. Bajar es más difícil que subir — el meñique tiene que ir primero.',
    steps: [
      {
        label:    'Down the Ladder',
        label_es: 'Bajando la Escalera',
        text: 'Play the tab below — the Ladder backwards. Set the BPM to 50.\nYou\'ve got it when: all four notes ring clean — no buzz — three times in a row. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'Toca la tablatura de abajo — la Escalera al revés. Pon el BPM en 50.\nLo tienes cuando: las cuatro notas suenan limpias — sin zumbido — tres veces seguidas. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
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
        text: 'Climb up, then come straight back down — no pause at the top. The top note gets played once, not twice.\nYou\'ve got it when: four times through without stopping.',
        text_es: 'Sube y después baja de inmediato — sin pausa arriba. La nota de arriba se toca una sola vez, no dos.\nLo tienes cuando: cuatro veces seguidas sin detenerte.',
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
        text: 'Move the same climb over to a new string.<ul><li>The A string first, then the D string</li><li>The shape never changes — only which string your fingers land on</li></ul>You\'ve got it when: no buzz on any of the four notes, on both strings, three times in a row.',
        text_es: 'Mueve la misma subida a otra cuerda.<ul><li>Primero la cuerda La, después la cuerda Re</li><li>La forma nunca cambia — solo cambia en qué cuerda caen tus dedos</li></ul>Lo tienes cuando: tres veces seguidas, sin zumbido en ninguna de las cuatro notas, en las dos cuerdas.',
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
        text: 'Move to the three thin strings — G, B, and high e.<ul><li>Press just behind the fret, not on top of it</li><li>Thin strings buzz more easily than thick ones</li></ul>You\'ve got it when: all three strings, no stopping, any speed.',
        text_es: 'Muévete a las tres cuerdas delgadas — la cuerda Sol, la cuerda Si y la cuerda Mi aguda.<ul><li>Presiona justo detrás del traste, no encima</li><li>Las cuerdas delgadas zumban más fácil que las gruesas</li></ul>Lo tienes cuando: las tres cuerdas, sin detenerte, a cualquier velocidad.',
        tab: {
          caption: 'G · B · high e — thin strings buzz easier',
          caption_es: 'Sol · Si · Mi aguda — las delgadas zumban más fácil',
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
        text: 'The circuit:<ol><li>Climb up and back down on all six strings — low E to high e and home again. That\'s one set.</li><li>Start the Metro tool at 50 BPM. Every clean set, raise it by 10 BPM.</li></ol>You\'ve got it when: two full sets in a row are clean, the second one 10 BPM faster than the first.',
        text_es: 'El circuito:<ol><li>Sube y baja en las seis cuerdas — de la Mi grave a la Mi aguda y de regreso. Esa es una serie.</li><li>Arranca la herramienta Metro a 50 BPM. Cada serie limpia, súbela 10 BPM.</li></ol>Lo tienes cuando: dos series completas seguidas y limpias, la segunda 10 BPM más rápida que la primera.',
      },
    ],
  },
  {
    id:    'ca-4',
    number: 6,
    title:    'Finger Gym 3 — Up the Neck',
    title_es: 'Gimnasio de Dedos 3 — Subiendo el mástil',
    intro:    'So far the Finger Gym has used only the first five frets. Today you move it up the neck. The frets get narrower as you climb, so the same shape feels different in every position.',
    intro_es: 'Hasta ahora el Gimnasio de Dedos solo ha usado los primeros cinco trastes. Hoy lo mueves hacia arriba del mástil. Los trastes se hacen más angostos mientras subes, así que la misma forma se siente distinta en cada posición.',
    steps: [
      {
        label:    '5th position Ladder',
        label_es: 'Escalera en 5.ª posición',
        text: 'The Ladder in 5th position, one finger per fret.<ul><li>Finger 1 on fret 5. Fret 5 has a dot on the neck, so you can find it by looking</li><li>Set the BPM to 50</li></ul>You\'ve got it when: all four notes clean, no buzz, three times in a row. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'La Escalera en la 5.ª posición, un dedo por traste.<ul><li>Dedo 1 en el traste 5. El traste 5 tiene un punto en el mástil, así lo encuentras con la vista</li><li>Pon el BPM en 50</li></ul>Lo tienes cuando: las cuatro notas limpias, sin zumbido, tres veces seguidas. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
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
        text: 'Add the shift, two frets up this time: climb, slide the whole hand up — fingers keeping their spacing — then climb again from there.\nYou\'ve got it when: two full climbs back to back and your thumb stays behind the neck the whole way.',
        text_es: 'Agrega el cambio, esta vez dos trastes: sube, desliza toda la mano hacia arriba — los dedos mantienen su separación — y sube otra vez desde ahí.\nLo tienes cuando: dos subidas completas seguidas y tu pulgar se queda detrás del mástil todo el tiempo.',
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
        text: 'Play the jump — three notes, one index finger, no walking up in between.<ul><li>Look at the dot, then move</li><li>After three tries: look away and let your hand find it</li></ul>You\'ve got it when: you can look away and land all three, three times out of three.',
        text_es: 'Toca el salto — tres notas, un solo dedo índice, sin caminar entre ellas.<ul><li>Mira el punto y muévete</li><li>Después de tres intentos: voltea la mirada y deja que tu mano lo encuentre</li></ul>Lo tienes cuando: puedes voltear la mirada y caer en los tres, tres de tres veces.',
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
        text: 'The Ladder in 9th position, up to the double dot at fret 12.<ul><li>The frets are narrow up here, so your fingers are crowded</li><li>Keep them ON THEIR TIPS or they\'ll bump each other</li></ul>You\'ve got it when: no buzz on any of the four, three times in a row.',
        text_es: 'La Escalera en la 9.ª posición, hasta el punto doble del traste 12.<ul><li>Los trastes están angostos aquí arriba, así que tus dedos van apretados</li><li>Mantenlos SOBRE LAS PUNTAS o se van a chocar entre sí</li></ul>Lo tienes cuando: sin zumbido en ninguna de las cuatro, tres veces seguidas.',
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
        text: 'The circuit:<ol><li>Play the Ladder in 1st position, 5th, then 9th, then all the way back down — that\'s one set.</li><li>Start the Metro tool at 50 BPM. Every clean set, raise it by 10 BPM.</li></ol>You\'ve got it when: two full sets in a row are clean, the second one 10 BPM faster than the first.',
        text_es: 'El circuito:<ol><li>Toca la Escalera en la 1.ª posición, la 5.ª, la 9.ª, y de regreso hasta abajo — esa es una serie.</li><li>Arranca la herramienta Metro a 50 BPM. Cada serie limpia, súbela 10 BPM.</li></ol>Lo tienes cuando: dos series completas seguidas y limpias, la segunda 10 BPM más rápida que la primera.',
      },
    ],
  },
  {
    id:    'ca-5',
    number: 7,
    title:    'Finger Gym 4 — Fingers Down',
    title_es: 'Gimnasio de Dedos 4 — Dedos abajo',
    intro:    'Until now your fingers took turns. Today they stay down. Every finger that has already played keeps touching the string.',
    intro_es: 'Hasta ahora tus dedos se tomaban turnos. Hoy se quedan abajo. Cada dedo que ya tocó sigue apoyado en la cuerda.',
    steps: [
      {
        label:    'Plant as you go',
        label_es: 'Planta y sigue',
        text: 'Plant as you go — climb the tab below, and each finger STAYS where it lands.<ul><li>Set the BPM to 50</li><li>By the last note, all four fingers are on the string at once</li></ul>You\'ve got it when: at the last note all four fingers are still touching, three times in a row. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'Planta y sigue — sube la tablatura de abajo, y cada dedo SE QUEDA donde cayó.<ul><li>Pon el BPM en 50</li><li>En la última nota, los cuatro dedos están sobre la cuerda a la vez</li></ul>Lo tienes cuando: en la última nota los cuatro dedos siguen apoyados, tres veces seguidas. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
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
        text: 'Pair 1-3 — finger independence: one finger moves while the other doesn\'t.<ul><li>Alternate the two notes in the tab, back and forth</li><li>Only fingers on frets below the one you\'re sounding stay down; the others hover close above their frets</li></ul>You\'ve got it when: eight clean alternations in a row.',
        text_es: 'Pareja 1-3 — independencia de dedos: un dedo se mueve mientras el otro no.<ul><li>Alterna las dos notas de la tablatura, ida y vuelta</li><li>Solo los dedos en trastes por debajo del que estás sonando se quedan abajo; los demás quedan suspendidos justo encima de su traste</li></ul>Lo tienes cuando: ocho alternancias limpias seguidas.',
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
        text: 'Pair 3-4 — ring and pinky, the hardest pair on the hand.<ul><li>Put fingers 1 and 2 on frets 1 and 2 first, and leave them there</li><li>Fingers 3 and 4 share a tendon, so they want to move together</li><li>Go slow enough that only one moves at a time</li></ul>You\'ve got it when: eight in a row, no buzz, and the other fingers never leave the string.',
        text_es: 'Pareja 3-4 — anular y meñique, la pareja más difícil de la mano.<ul><li>Primero pon los dedos 1 y 2 en los trastes 1 y 2, y déjalos ahí</li><li>Los dedos 3 y 4 comparten un tendón, así que quieren moverse juntos</li><li>Ve lo suficientemente lento para que solo uno se mueva a la vez</li></ul>Lo tienes cuando: ocho seguidas, sin zumbido, y los otros dedos nunca dejan la cuerda.',
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
        text: 'Out of order: 1-3-2-4.<ul><li>Fingers land in this order, but not in a line</li><li>Finger 2 lands between finger 1 (still down) and fret 3 — lift finger 3 as finger 2 lands, or fret 3 keeps sounding</li></ul>You\'ve got it when: four times through without stopping.',
        text_es: 'Fuera de orden: 1-3-2-4.<ul><li>Los dedos caen en este orden, pero no en fila</li><li>El dedo 2 cae entre el dedo 1 (que sigue abajo) y el traste 3 — levanta el dedo 3 justo cuando cae el dedo 2, o el traste 3 sigue sonando</li></ul>Lo tienes cuando: cuatro veces seguidas sin detenerte.',
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
        text: 'The circuit:<ol><li>Play 1-3-2-4 on the low E string, then the A string, then the D string, fingers below the sounding fret staying down. That\'s one set.</li><li>Start the Metro tool at 50 BPM. Every clean set, raise it by 10 BPM.</li></ol>You\'ve got it when: two full sets in a row are clean, the second one 10 BPM faster than the first.',
        text_es: 'El circuito:<ol><li>Toca 1-3-2-4 en la cuerda Mi grave, después en la cuerda La, después en la cuerda Re, con los dedos por debajo del traste que suena abajo. Esa es una serie.</li><li>Arranca la herramienta Metro a 50 BPM. Cada serie limpia, súbela 10 BPM.</li></ol>Lo tienes cuando: dos series completas seguidas y limpias, la segunda 10 BPM más rápida que la primera.',
      },
    ],
  },
  {
    id:    'ca-6',
    number: 8,
    title:    'Finger Gym 5 — The Skip',
    title_es: 'Gimnasio de Dedos 5 — El salto',
    intro:    'Two new moves today: skipping over a string without hitting it, and reaching one fret farther than is comfortable.',
    intro_es: 'Hoy hay dos movimientos nuevos: saltar sobre una cuerda sin tocarla, y estirar un traste más allá de lo cómodo.',
    steps: [
      {
        label:    'The skip',
        label_es: 'El salto',
        text: 'The skip — the two notes in the tab sit on strings that aren\'t neighbours.<ul><li>Set the BPM to 50</li><li>Jump over the A string — it stays SILENT</li><li>Pick straight down onto the string you want</li></ul>You\'ve got it when: eight jumps in a row and the A string never rings. Hear it ring twice? Drop the BPM by 10 and try again.',
        text_es: 'El salto — las dos notas de la tablatura están en cuerdas que no son vecinas.<ul><li>Pon el BPM en 50</li><li>Salta por encima de la cuerda La — se queda EN SILENCIO</li><li>Pulsa directo hacia abajo sobre la cuerda que quieres</li></ul>Lo tienes cuando: ocho saltos seguidos y la cuerda La nunca suena. ¿La oyes sonar dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
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
        text: 'The Spider with a skip.<ul><li>Same alternating pattern as always, but between the low E and D strings instead of neighbours</li><li>The second half of the tab is the same shape one fret higher</li></ul>You\'ve got it when: one full pass with every note on the right string, any speed.',
        text_es: 'La Araña con salto.<ul><li>El mismo patrón alternado de siempre, pero entre la cuerda Mi grave y la cuerda Re, no entre vecinas</li><li>La segunda mitad de la tablatura es la misma forma un traste más arriba</li></ul>Lo tienes cuando: una pasada completa con cada nota en la cuerda correcta, a cualquier velocidad.',
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
        text: 'The wide Reach — the same move as the Reach in Finger Gym 1, but the pinky goes one fret farther.<ul><li>The index plants and stays; one fret short still counts if the full reach is too far today</li><li>Stretch, never pain — if the wrist hurts, stop</li></ul>You\'ve got it when: four reaches in a row and finger 1 never lifts.',
        text_es: 'El Estiramiento ancho — el mismo movimiento que el Estiramiento del Gimnasio de Dedos 1, pero el meñique va un traste más lejos.<ul><li>El índice se planta y se queda; un traste menos también cuenta si hoy el estiramiento completo te queda lejos</li><li>Estira sin dolor — si te duele la muñeca, detente</li></ul>Lo tienes cuando: cuatro estiramientos seguidos y el dedo 1 nunca se levanta.',
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
        text: 'Reach across strings — the two notes in the tab are on different strings, three frets apart.<ul><li>Hold the shape so both notes ring together</li></ul>You\'ve got it when: both notes ring at the same time, four times in a row.',
        text_es: 'Estiramiento entre cuerdas — las dos notas de la tablatura están en cuerdas distintas, a tres trastes de distancia.<ul><li>Sostén la forma para que las dos notas suenen juntas</li></ul>Lo tienes cuando: las dos notas suenan al mismo tiempo, cuatro veces seguidas.',
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
        text: 'The circuit:<ol><li>Run skip Spider ×4, wide Reach ×4, across-the-strings ×4 — that\'s one set.</li><li>Start the Metro tool at 50 BPM. Every clean set, raise it by 10 BPM.</li></ol>You\'ve got it when: two full sets in a row are clean, the second one 10 BPM faster than the first.',
        text_es: 'El circuito:<ol><li>Toca Araña con salto ×4, Estiramiento ancho ×4, entre cuerdas ×4 — esa es una serie.</li><li>Arranca la herramienta Metro a 50 BPM. Cada serie limpia, súbela 10 BPM.</li></ol>Lo tienes cuando: dos series completas seguidas y limpias, la segunda 10 BPM más rápida que la primera.',
      },
    ],
  },
  {
    id:    'ca-7',
    number: 9,
    title:    'Finger Gym 6 — The Meet',
    title_es: 'Gimnasio de Dedos 6 — La competencia',
    intro:    'Meet day: a contest against your own tempo. Nothing new to learn. Today you play every Finger Gym move back to back, at the fastest tempo you can keep clean.',
    intro_es: 'Día de competencia: compites contra tu propio tempo. No hay nada nuevo que aprender. Hoy tocas todos los movimientos del Gimnasio de Dedos seguidos, al tempo más rápido que puedas mantener limpio.',
    steps: [
      {
        label:    'Warm-up',
        label_es: 'Calentamiento',
        text: 'Warm up the Ladder with its shift. Start the Metro tool at 50 BPM — this is a warm-up, not the contest yet.\nYou\'ve got it when: two clean climbs in a row with no buzz.',
        text_es: 'Calienta la Escalera con su cambio. Arranca la herramienta Metro a 50 BPM — esto es calentamiento, todavía no compites.\nLo tienes cuando: dos subidas limpias seguidas, sin zumbido.',
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
        text: 'Event 2 — the Spider, faster each time:<ol><li>Start the Metro tool at 50 BPM and play the Spider once.</li><li>Every clean pass, raise the Metro tool by 10 BPM.</li></ol>You\'ve got it when: one clean pass 10 BPM faster than where you started, every note on the right string. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'Evento 2 — la Araña, más rápido cada vez:<ol><li>Arranca la herramienta Metro a 50 BPM y toca la Araña una vez.</li><li>Cada pasada limpia, sube la herramienta Metro 10 BPM.</li></ol>Lo tienes cuando: una pasada limpia 10 BPM más rápida que donde empezaste, con cada nota en la cuerda correcta. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
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
        text: 'Reach endurance — eight reaches without stopping, twice the usual.<ul><li>The hand starts to tire around six</li><li>Pain is different from work: if it hurts, STOP</li></ul>You\'ve got it when: eight reaches without stopping and finger 1 never lifts.',
        text_es: 'Resistencia en el Estiramiento — ocho estiramientos sin detenerte, el doble de lo normal.<ul><li>La mano empieza a cansarse cerca del sexto</li><li>El dolor es distinto del esfuerzo: si duele, DETENTE</li></ul>Lo tienes cuando: ocho estiramientos sin detenerte y el dedo 1 nunca se levanta.',
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
        text: 'Run the whole circuit twice, without putting the guitar down between sets.<ul><li>Ladder ×4, Spider ×4, Reach ×4</li><li>Then again — no break</li></ul>You\'ve got it when: two sets back to back with no break in between.',
        text_es: 'Toca el circuito completo dos veces, sin bajar la guitarra entre series.<ul><li>Escalera ×4, Araña ×4, Estiramiento ×4</li><li>Y otra vez — sin descanso</li></ul>Lo tienes cuando: dos series seguidas sin descanso entre ellas.',
      },
      {
        label:    'Top speed',
        label_es: 'Velocidad máxima',
        text: 'Top speed.<ul><li>Start the Metro tool at 50 BPM, the tempo you warmed up at. Go up by 10 every clean set</li><li>A set stops or buzzes? The last clean BPM is your top speed for today</li></ul>You\'ve got it when: a clean set at least 10 BPM faster than where you started today — then keep climbing.',
        text_es: 'Velocidad máxima.<ul><li>Arranca la herramienta Metro a 50 BPM, el tempo de tu calentamiento. Súbelo 10 con cada serie limpia</li><li>¿Una serie se detiene o zumba? El último BPM limpio es tu velocidad máxima de hoy</li></ul>Lo tienes cuando: una serie limpia por lo menos 10 BPM más rápida que donde empezaste hoy — y de ahí, sigue subiendo.',
      },
    ],
  },
  {
    id:    'ca-8',
    number: 1,
    title:    'Happy Birthday — First Notes',
    title_es: 'Happy Birthday — Primeras notas',
    intro:    'You can already pluck the open strings. Today you press one down: one string, one line, and the dots on the neck show you where to land.',
    intro_es: 'Ya sabes tocar las cuerdas al aire. Hoy vas a pisar una: una cuerda, una línea y los puntos del mástil te muestran dónde caer.',
    steps: [
      {
        label:    'Land on fret 5',
        label_es: 'Cae en el traste 5',
        text: '<ol><li>Put your fingertip on the low E string (the thickest string), just behind fret 5 — next to the metal strip, NOT on top of it. Thumb behind the neck.</li><li>Pluck it. A rattly, dead sound is a buzz — slide the fingertip closer to the fret and press again.</li><li>Pluck the open string, then land on fret 5 and pluck again.</li></ol>You\'ve got it when: three landings in a row on fret 5 ring clean, no buzz.',
        text_es: '<ol><li>Pon la punta del dedo en la cuerda Mi grave (la más gruesa), justo detrás del traste 5 — pegada a la barrita de metal, NO encima de ella. El pulgar detrás del mástil.</li><li>Púlsala. Un sonido que traquetea o suena apagado es un zumbido — desliza la punta del dedo más cerca del traste y presiona otra vez.</li><li>Pulsa la cuerda al aire, luego cae en el traste 5 y pulsa otra vez.</li></ol>Lo tienes cuando: tres caídas seguidas en el traste 5 suenan limpias, sin zumbido.',
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
        text: 'Play the four notes below — open, open, fret 2, open. Say the words while you play: “Hap-py birth-day.”\nYou\'ve got it when: three clean reps in a row, no buzz.',
        text_es: 'Toca las cuatro notas de abajo — al aire, al aire, traste 2, al aire. Di las palabras mientras tocas: “Hap-py birth-day.”\nLo tienes cuando: tres repeticiones limpias seguidas, sin zumbido.',
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
        text: 'Put the first line together — the four notes you know, then two more for “to you”: fret 5, then fret 4, one fret lower.<ul><li>Six notes — that\'s the first line of the song</li><li>The notes are not all the same length. “Hap-py” is quick — both notes inside one click. “Birth”, “day” and “to” get one click each. “You” is held for two.</li></ul>You\'ve got it when: three clean runs in a row, saying the words as you play.',
        text_es: 'Arma la primera línea — las cuatro notas que ya sabes, y dos más para “to you”: traste 5 y luego traste 4, un traste más abajo.<ul><li>Seis notas — esa es la primera línea de la canción</li><li>Las notas no duran todas lo mismo. “Hap-py” es rápido — las dos notas caben en un clic. “Birth”, “day” y “to” llevan un clic cada una. “You” se sostiene dos.</li></ul>Lo tienes cuando: tres pasadas limpias seguidas, diciendo las palabras mientras tocas.',
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
        text: 'Keep going — there\'s no set stopping point on this one.<ul><li>Set the player above to 60 BPM and play with the beat</li><li>Every clean pass: raise the BPM by 10</li><li>Fast already? Say each note\'s name as you land it — E, F#, A, G#</li></ul>You\'ve got it when: you\'ve raised the BPM twice without stopping — then keep climbing.',
        text_es: 'Sigue — aquí no hay un punto de parada fijo.<ul><li>Pon el reproductor de arriba en 60 BPM y toca con el pulso</li><li>Cada pasada limpia: sube el BPM 10 puntos</li><li>¿Ya vas rápido? Di el nombre de cada nota al caer en ella — E, F#, A, G#</li></ul>Lo tienes cuando: ya subiste el BPM dos veces sin detenerte — y de ahí, sigue subiendo.',
      },
    ],
  },
  /* Seven Nation Army riff, the Song Journey's Layer 2 line as a class day.
     REBUILT 2026-09-27 as a PRACTICE CARD (view:'card' — see CARD above),
     the second one after ca-18: one screen with the riff's tab, driven note
     by note by one Play song button over the band, two checks (four laps on
     Slower, four on Normal) and a Level up. The band's first 8 bars are four
     laps of the 2-bar riff, so the card shows the riff once with a
     "Lap 1 of 4" badge; its uneven rhythm (beats) is followed as written.
     The first three old steps stay as the help ladder — the two halves and
     the rhythm demo, unchanged; the 80 BPM step and the band step became the
     checks. */
  {
    id:    'ca-10',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    number: 10,
    journey: 'seven-nation-army',   // the Level up check sends them to this Song Journey page — see JOURNEY above
    journeyLayer: 2,
    title:    'Seven Nation Army — The Riff',
    title_es: 'Seven Nation Army — El riff',
    intro:    'The Seven Nation Army riff is seven notes on the A string — play it with the song, first on Slower, then at normal speed.',
    intro_es: 'El riff de Seven Nation Army son siete notas en la cuerda La — tócalo con la canción, primero en Más lento y después a velocidad normal.',
    card: {
      track: 'seven-nation-army',
      caption:    'The riff · A string · 2 bars',
      caption_es: 'El riff · cuerda La · 2 compases',
      sections: [
        {
          label: 'The riff', label_es: 'El riff',
          caption: 'The riff — E E G E D C B', caption_es: 'El riff — E E G E D C B',
          fromBar: 1, bars: 2, reps: 4,
          repLabel: 'Lap', repLabel_es: 'Vuelta',
          notes: [
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 1.5 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.5 },
            { string: 'A', fret: 10, note: 'G', midi: 55, beats: 0.75 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.75 },
            { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 0.5 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 2 },
            { string: 'A', fret: 2,  note: 'B', midi: 47, beats: 2 }
          ]
        }
      ],
      checks: [
        { label: 'The riff on Slower', label_es: 'El riff en Más lento',
          text:    'Four laps of the riff with the song on Slower, without stopping. A lap is once through the riff.',
          text_es: 'Cuatro vueltas del riff con la canción en Más lento, sin detenerte. Una vuelta es tocar el riff una vez completo.' },
        { label: 'The riff on Normal', label_es: 'El riff en Normal',
          text:    'Slide the switch to Normal. Four laps of the riff with the song, without stopping.',
          text_es: 'Desliza el interruptor a Normal. Cuatro vueltas del riff con la canción, sin detenerte.' },
        { levelUp: true,
          text:    'Play along with the whole song on the Song Journey page, Layer 2.',
          text_es: 'Toca con la canción completa en la página de Recorrido de la canción, Capa 2.' }
      ]
    },
    // The help ladder (read-only, under "More practice help").
    steps: [
      {
        label:    'Practice — E E G E',
        label_es: 'Practica — E E G E',
        text: 'Play E E G E with the tab at 60 BPM. Finger 1 stays on fret 7 the whole time. The pinky (finger 4) reaches fret 10 for the G and comes back. You\'ve got it when: E E G E three times in a row, no buzz. Finger 1 lifts when the pinky reaches? Play just fret 7 to fret 10 five times, pressing fret 7 the whole time, then try again.',
        text_es: 'Toca E E G E con la tablatura a 60 BPM. El dedo 1 se queda en el traste 7 todo el tiempo. El meñique (dedo 4) llega al traste 10 para el G y regresa. Lo tienes cuando: E E G E tres veces seguidas, sin zumbido. ¿Se levanta el dedo 1 cuando el meñique se estira? Toca solo del traste 7 al traste 10 cinco veces, presionando el traste 7 todo el tiempo, y vuelve a intentarlo.',
        tab: {
          caption: 'E E G E · A string · frets 7 7 10 7',
          caption_es: 'E E G E · cuerda La · trastes 7 7 10 7',
          notes: [
            { string: 'A', fret: 7,  note: 'E', midi: 52 },
            { string: 'A', fret: 7,  note: 'E', midi: 52 },
            { string: 'A', fret: 10, note: 'G', midi: 55 },
            { string: 'A', fret: 7,  note: 'E', midi: 52 }
          ]
        },
      },
      {
        label:    'Practice — E D C B',
        label_es: 'Practica — E D C B',
        text: 'Play E D C B with the tab at 60 BPM. Finger 1 plays every note: fret 7, fret 5, fret 3, then fret 2. You\'ve got it when: E D C B three times in a row, no buzz. Landing on the wrong fret? Look at the fret before you move — 7, 5 and 3 have dots, and 2 is one fret below the 3 dot.',
        text_es: 'Toca E D C B con la tablatura a 60 BPM. El dedo 1 toca todas las notas: traste 7, traste 5, traste 3 y luego traste 2. Lo tienes cuando: E D C B tres veces seguidas, sin zumbido. ¿Caes en el traste equivocado? Mira el traste antes de moverte — el 7, el 5 y el 3 tienen punto, y el 2 está un traste abajo del punto del 3.',
        tab: {
          caption: 'E D C B · A string · frets 7 5 3 2',
          caption_es: 'E D C B · cuerda La · trastes 7 5 3 2',
          notes: [
            { string: 'A', fret: 7, note: 'E', midi: 52 },
            { string: 'A', fret: 5, note: 'D', midi: 50 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 2, note: 'B', midi: 47 }
          ]
        },
      },
      {
        label:    'Learn — The rhythm',
        label_es: 'Aprende — El ritmo',
        text: 'Press Play on the tab and watch the cursor. The notes are not all the same length. The first E is long and the second is short. C and B at the end ring for two beats each.',
        text_es: 'Pulsa «Tocar el tab» y mira el cursor. Las notas no duran lo mismo. El primer E es largo y el segundo es corto. C y B al final suenan dos tiempos cada una.',
        tab: {
          caption: 'The whole riff · E E G E D C B · 2 bars',
          caption_es: 'El riff completo · E E G E D C B · 2 compases',
          notes: [
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 1.5 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.5 },
            { string: 'A', fret: 10, note: 'G', midi: 55, beats: 0.75 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.75 },
            { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 0.5 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 2 },
            { string: 'A', fret: 2,  note: 'B', midi: 47, beats: 2 }
          ]
        },
      },
    ],
  },
  {
    id:    'ca-11',
    number: 4,
    title:    'Notes on the Low E String',
    title_es: 'Notas en la cuerda Mi grave',
    intro:    'You\'ve been landing on frets for Happy Birthday. Today those landings get names — every natural note (the notes with no ♯) on the low E string, from open E to the E at fret 12.',
    intro_es: 'Ya has estado cayendo en trastes para Happy Birthday. Hoy esas caídas reciben nombres — todas las notas naturales (las notas sin ♯) de la cuerda Mi grave, desde E al aire hasta E en el traste 12.',
    steps: [
      {
        label:    'The dot notes',
        label_es: 'Las notas de los puntos',
        text: 'Play the four dot notes below — open E, then the dots at frets 3, 5 and 7. Say each name out loud while it rings.\nYou\'ve got it when: E–G–A–B in order, three times through, saying each name out loud.',
        text_es: 'Toca abajo las cuatro notas de los puntos — E al aire, y después los puntos de los trastes 3, 5 y 7. Di cada nombre en voz alta mientras suena.\nLo tienes cuando: E–G–A–B en orden, tres veces seguidas, diciendo cada nombre en voz alta.',
        tab: {
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
        text: 'Fill in the rest of the row — F at fret 1, C at fret 8, D at fret 10, and E at the double dot at fret 12. Play the notes below, up and back, saying every name as you land it.\nYou\'ve got it when: E F G A B C D E and back, three times through, every name out loud.',
        text_es: 'Completa el resto de la fila — F en el traste 1, C en el traste 8, D en el traste 10 y E en el punto doble del traste 12. Toca las notas de abajo, subiendo y bajando, diciendo el nombre de cada una al caer en ella.\nLo tienes cuando: E F G A B C D E y de regreso, tres veces seguidas, cada nombre en voz alta.',
        tab: {
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
        text: 'Put the guitar in your lap. The quiz deals you a fret — say the note out loud, then press its button.\nYou\'ve got it when: 7 of 10 on your first pass. Then try for 9 of 10.',
        text_es: 'Pon la guitarra en las piernas. El juego te reparte un traste — di la nota en voz alta y después presiona su botón.\nLo tienes cuando: 7 de 10 en tu primera pasada. Después intenta sacar 9 de 10.',
        drill: { type: 'shuffle', string: 'lowE', maxFret: 12, rounds: 10, seconds: 8, pile: 'naturals' },
      },
      {
        label:    'Find the note',
        label_es: 'Encuentra la nota',
        text: 'Find each note on the string. The deck deals you a note name, and you find it.<ul><li>Land on the note and pluck it. Next card once it rings clean</li><li>Lift your hand off the neck between cards</li><li>E is in two places, fret 0 and fret 12 — either one counts</li></ul>You\'ve got it when: five cards in a row without looking at a tab, no buzz.',
        text_es: 'Encuentra cada nota en la cuerda. El mazo te reparte el nombre de una nota, y tú la buscas.<ul><li>Cae en la nota y púlsala. Otra carta cuando suene limpia</li><li>Levanta la mano del mástil entre carta y carta</li><li>E está en dos lugares, traste 0 y traste 12 — cualquiera de los dos cuenta</li></ul>Lo tienes cuando: cinco cartas seguidas, sin mirar la tablatura, sin zumbido.',
        drill: { type: 'deck', deck: 'naturals' },
      },
      {
        label:    'Keep going',
        label_es: 'Sigue',
        text: 'Keep going — there is no set stopping point here.<ul><li>Set the player in Fill in the row to 60 BPM and land one note per beat, up and back</li><li>Every clean pass: raise the BPM by 10</li><li>Fast already? Say the names backwards — E D C B A G F E</li></ul>You\'ve got it when: a full pass at a faster BPM than you started — then keep climbing.',
        text_es: 'Sigue — aquí no hay un punto de parada fijo.<ul><li>Pon el reproductor de Completa la fila en 60 BPM y cae en una nota por tiempo, subiendo y bajando</li><li>Cada pasada limpia: sube el BPM 10 puntos</li><li>¿Ya vas rápido? Di los nombres al revés — E D C B A G F E</li></ul>Lo tienes cuando: una pasada entera a un BPM más alto que al empezar — y de ahí, sigue subiendo.',
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
    number: 13,
    title:    'Notes on the A String, Then Happy Birthday',
    title_es: 'Notas en la cuerda La, y luego Happy Birthday',
    intro:    'You already know the names on the low E string, and you play Happy Birthday start to finish on it. Today the A string gets names too — every natural note (the notes with no ♯) from open A to the A at fret 12. Then you put those names to work: a second way to play Happy Birthday that crosses to the A string and never leaves the first seven frets.',
    intro_es: 'Ya conoces los nombres de la cuerda Mi grave, y tocas Happy Birthday de principio a fin en ella. Hoy la cuerda La también recibe nombres — todas las notas naturales (las notas sin ♯) desde A al aire hasta A en el traste 12. Después pones esos nombres a trabajar: una segunda forma de tocar Happy Birthday que cruza a la cuerda La y nunca se sale de los primeros siete trastes.',
    steps: [
      {
        label:    'Learn the notes',
        label_es: 'Aprende las notas',
        text: 'Play the notes below and say each name out loud as you play it.\nYou\'ve got it when: three times through, every name out loud.',
        text_es: 'Toca las notas de abajo y di cada nombre en voz alta mientras la tocas.\nLo tienes cuando: tres veces completas, cada nombre en voz alta.',
        tab: {
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
        text: 'Put the guitar in your lap. The quiz deals you a fret on the A string — say the note out loud, then press its button.\nYou\'ve got it when: 7 of 10 on your first pass. Then try for 9 of 10.',
        text_es: 'Pon la guitarra en las piernas. El juego te reparte un traste de la cuerda La — di la nota en voz alta y después presiona su botón.\nLo tienes cuando: 7 de 10 en tu primera pasada. Después intenta sacar 9 de 10.',
        drill: { type: 'shuffle', string: 'A', maxFret: 12, rounds: 10, seconds: 8, pile: 'naturals' },
      },
      {
        label:    'Find the note',
        label_es: 'Encuentra la nota',
        text: 'The deck deals you a note name — find it on the A string and pluck it.<ul><li>Land on the note and pluck it. Next card once it rings clean</li><li>Lift your hand off the neck between cards</li><li>A is in two places, fret 0 and fret 12 — either one counts</li></ul>You\'ve got it when: five cards in a row without looking at a tab, no buzz.',
        text_es: 'El mazo te reparte el nombre de una nota — búscala en la cuerda La y púlsala.<ul><li>Cae en la nota y púlsala. Otra carta cuando suene limpia</li><li>Levanta la mano del mástil entre carta y carta</li><li>A está en dos lugares, traste 0 y traste 12 — cualquiera de los dos cuenta</li></ul>Lo tienes cuando: cinco cartas seguidas, sin mirar la tablatura, sin zumbido.',
        drill: { type: 'deck', deck: 'naturals' },
      },
      {
        label:    'Cross the strings',
        label_es: 'Cruza las cuerdas',
        text: 'Pluck the open low E, then the open A, back and forth — no fretting hand yet. Only one string should ring each pluck.\nYou\'ve got it when: three clean reps in a row, one string per pluck.',
        text_es: 'Pulsa la cuerda Mi grave al aire, luego la cuerda La al aire, ida y vuelta — todavía sin la mano de trastear. Solo debe sonar una cuerda por pulsación.\nLo tienes cuando: tres veces seguidas y limpias, una cuerda por pulsación.',
        tab: {
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
        text: 'Lines 3 and 4, now on the A string — every note stays inside the first seven frets.<ul><li>Line 3: finger 4 reaches fret 7 on the A string, then finger 3 drops to fret 4</li><li>Line 4 stays down in that same spot on the A string</li><li>C♯ (“C sharp”), fret 4, is the one new name</li></ul>You\'ve got it when: Line 3 into Line 4, three times through, without stopping.',
        text_es: 'Líneas 3 y 4, ahora en la cuerda La — todas las notas se quedan dentro de los primeros siete trastes.<ul><li>Línea 3: el dedo 4 alcanza el traste 7 de la cuerda La, y luego el dedo 3 baja al traste 4</li><li>La Línea 4 se queda en ese mismo lugar de la cuerda La</li><li>C♯ (“C sostenido”), traste 4, es el único nombre nuevo</li></ul>Lo tienes cuando: de la Línea 3 a la Línea 4, tres veces seguidas, sin detenerte.',
        tab: {
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
        text: 'The whole song the A-string way — Lines 1 and 2 stay on the low E, 3 and 4 cross to the A string. Start at BPM 70.<ul><li>Say each A-string note out loud as you land it</li><li>Every clean pass, raise the BPM by 10 — then play it for the person next to you</li></ul>You\'ve got it when: the whole song without stopping, every A-string note named out loud — then keep climbing.',
        text_es: 'La canción completa en la versión con la cuerda La — las Líneas 1 y 2 se quedan en la Mi grave, 3 y 4 cruzan a la cuerda La. Empieza en BPM 70.<ul><li>Di en voz alta cada nota de la cuerda La al caer en ella</li><li>Cada pasada limpia, sube el BPM 10 puntos — y después tócala para la persona de al lado</li></ul>Lo tienes cuando: la canción completa sin detenerte, nombrando en voz alta cada nota de la cuerda La — y de ahí, sigue subiendo.',
        tab: {
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
     the tab player, the natural-note deck, a play-along up and back at 60
     BPM, then an open-ended skip-a-note play-along that climbs in tempo.
     Technique ladder: one pass in order, recall with no tab, in time with
     the player, out of order in time. ca-17 is untouched. */
  {
    id:    'ca-22',
    title:    'A String Notes — Cards and Play-Along',
    title_es: 'Notas de la cuerda La — Cartas y tocar a la par',
    intro:    'You already named every natural note on the A string (a natural note has no ♯). Today you practice them until you know each one without looking: a short review, a deck of note cards, then playing along with the tab.',
    intro_es: 'Ya nombraste todas las notas naturales de la cuerda La (una nota natural no lleva ♯). Hoy las practicas hasta saber cada una sin mirar: un repaso corto, una baraja de cartas de notas y después tocas a la par de la tablatura.',
    steps: [
      {
        label:    'Learn — Review the names',
        label_es: 'Aprende — Repasa los nombres',
        text: 'Press Play tab and watch the cursor. Say each name out loud as the cursor lands on it. B to C and E to F are one fret apart. Every other pair of neighbors is two frets apart.',
        text_es: 'Presiona Tocar el tab y mira el cursor. Di cada nombre en voz alta cuando el cursor llegue a él. De B a C y de E a F hay un solo traste. Entre todas las demás notas vecinas hay dos trastes.',
        tab: {
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
        text: 'Press Shuffle and deal. Each card names a note. Find it on the A string and pluck it, then take your hand off the neck before the next card. A is at fret 0 and fret 12, and either one counts.\nYou\'ve got it when: 7 of 7 right on the first deal, without looking at a tab, no buzz. Missed one? Press Shuffle again and run the whole deck.',
        text_es: 'Presiona Barajar y repartir. Cada carta nombra una nota. Búscala en la cuerda La y púlsala, y después levanta la mano del mástil antes de la siguiente carta. A está en el traste 0 y en el traste 12, y cualquiera de los dos cuenta.\nLo tienes cuando: 7 de 7 correctas al primer reparto, sin mirar la tablatura, sin zumbido. ¿Fallaste una? Presiona Barajar de nuevo y haz toda la baraja otra vez.',
        drill: { type: 'deck', deck: 'naturals' },
      },
      {
        label:    'Practice — Play along',
        label_es: 'Practica — Toca a la par',
        text: 'Set the tab to 60 BPM (beats per minute) and press Play tab. Play each note with the player, one note per beat, up to fret 12 and back down. Say each name out loud as you play it.\nYou\'ve got it when: up and back twice with the player, no missed notes, every name out loud. Falling behind? Set it to 50 BPM and try again.',
        text_es: 'Pon el tab en 60 BPM (tiempos por minuto) y presiona Tocar el tab. Toca cada nota junto con el reproductor, una nota por tiempo, hasta el traste 12 y de regreso. Di cada nombre en voz alta mientras lo tocas.\nLo tienes cuando: subes y bajas dos veces con el reproductor, sin notas perdidas, cada nombre en voz alta. ¿Te quedas atrás? Ponlo en 50 BPM e inténtalo otra vez.',
        tab: {
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
        text: 'This line skips a note each time: A to C, B to D, C to E, all the way up and back down. The jumps are the hard part, so say the next name before your hand moves. Start at 60 BPM, press Play tab, and play along.\nYou\'ve got it when: one pass at 60 BPM with no missed notes. Then raise it 10 BPM after every clean pass and keep going. Missed a jump? Play just those two notes five times, then start the line again.',
        text_es: 'Esta línea salta una nota cada vez: de A a C, de B a D, de C a E, hasta arriba y de regreso. Los saltos son la parte difícil, así que di el siguiente nombre antes de mover la mano. Empieza en 60 BPM, presiona Tocar el tab y toca a la par.\nLo tienes cuando: una pasada en 60 BPM sin notas perdidas. Después sube 10 BPM tras cada pasada limpia y sigue. ¿Fallaste un salto? Toca solo esas dos notas cinco veces y empieza la línea otra vez.',
        tab: {
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
    number: 11,
    title:    'Sub Day Circuit',
    title_es: 'Circuito para el día con suplente',
    intro:    'Your teacher is out today, so you do this one on your own: six stops, in order. You have done all of these before.',
    intro_es: 'Hoy tu maestro no está, así que haces este circuito por tu cuenta: seis paradas, en orden. Ya has hecho todo esto antes.',
    steps: [
      {
        label:    'Name the fret',
        label_es: 'Di la nota',
        text: 'The quiz gives you a fret. You name the note, eight seconds a card.<ul><li>Say the note out loud, then press its button</li></ul>You\'ve got it when: 7 of 10 on your first pass. Then try for 9 of 10. Missing some? The results screen names them — run it again.',
        text_es: 'El juego te da un traste. Tú dices la nota, ocho segundos por carta.<ul><li>Di la nota en voz alta, y después presiona su botón</li></ul>Lo tienes cuando: 7 de 10 en tu primera pasada. Después intenta sacar 9 de 10. ¿Fallas algunas? La pantalla de resultados te dice cuáles — repítelo.',
        drill: { type: 'shuffle', string: 'lowE', maxFret: 12, rounds: 10, seconds: 8, pile: 'naturals' },
      },
      {
        label:    'Find the note',
        label_es: 'Encuentra la nota',
        text: 'Backwards this time: the deck gives you a note name, you find it on the string.<ul><li>Deal a card, land on that note, pluck it</li><li>Hand off the neck between cards</li><li>E works at fret 0 or fret 12</li></ul>You\'ve got it when: five in a row without looking at a tab, no buzz. Looked? Deal that one again.',
        text_es: 'Al revés esta vez: el mazo te da el nombre de una nota, y tú la encuentras en la cuerda.<ul><li>Reparte una carta, cae en esa nota y púlsala</li><li>Mano fuera del mástil entre carta y carta</li><li>E sirve en el traste 0 o en el 12</li></ul>Lo tienes cuando: cinco seguidas, sin mirar la tablatura, sin zumbido. ¿Miraste la tablatura? Reparte esa otra vez.',
        drill: { type: 'deck', deck: 'naturals' },
      },
      {
        label:    'Tune it back',
        label_es: 'Vuelve a afinar',
        text: 'Loosen the low E string only, about half a turn, then bring it back up to pitch. Just the one string.<ol><li>Clip the tuner on. Start a timer at 1:00</li><li>Pluck the low E string, loosen the peg a little, pluck again</li><li>Once it sounds lower, tune it back up. Went too high? Loosen it below the note and come back up — never keep tightening past it</li></ol>You\'ve got it when: the tuner shows E in green, inside 1:00. Out of time? Reset and go again.',
        text_es: 'Afloja solo la cuerda Mi grave, más o menos media vuelta, y después vuelve a subirla a su nota. Solo esa cuerda.<ol><li>Pon el afinador de pinza. Arranca un temporizador en 1:00</li><li>Pulsa la cuerda Mi grave, afloja la clavija un poco, pulsa otra vez</li><li>Cuando suene más grave, vuelve a subirla. ¿Se pasó de aguda al subir? Afloja por debajo de la nota y sube de nuevo hasta ella — nunca sigas apretando de más</li></ol>Lo tienes cuando: el afinador marca E en verde, dentro de 1:00. ¿Se acabó el tiempo? Reinicia y hazlo otra vez.',
      },
      {
        label:    'Play it from memory',
        label_es: 'Tócala de memoria',
        text: 'Happy Birthday, all four lines, low E string. Play it once with the tab below, then cover the screen and play it again from memory. The A-string version counts too.\nYou\'ve got it when: all four lines from memory, any speed, without stopping. Stuck? Uncover that one line, then start over.',
        text_es: 'Happy Birthday, las cuatro líneas, cuerda Mi grave. Tócala una vez con la tablatura de abajo, después tapa la pantalla y tócala de memoria. La versión con la cuerda La también cuenta.\nLo tienes cuando: las cuatro líneas de memoria, a cualquier velocidad, sin detenerte. ¿Te atoraste? Destapa solo esa línea y empieza otra vez.',
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
        text: 'From memory again, listening this time.<ul><li>Fingertip right behind the fret</li><li>One string per pluck</li><li>Hold each finger down until the next note starts, so there is no gap between notes</li></ul>You\'ve got it when: a full pass from memory, no buzz, no extra string. One note buzzing? Play it ten times alone, moving closer to the fret.',
        text_es: 'De memoria otra vez, ahora escuchando.<ul><li>La punta del dedo justo detrás del traste</li><li>Una cuerda por pulsación</li><li>Deja cada dedo puesto hasta que empiece la nota siguiente, para que no haya silencio entre las notas</li></ul>Lo tienes cuando: una pasada entera de memoria, sin zumbido, sin cuerda de más. ¿Zumba una nota? Tócala sola diez veces, acercándote al traste.',
      },
      {
        label:    'Keep going',
        label_es: 'Sigue',
        text: 'There is no set stopping point here. Play Happy Birthday from memory with the Metro tool.<ul><li>Start at 60 BPM. "Hap-py" fits inside one click, and the last note of each line is held for two</li><li>Every clean pass, add 10 BPM</li></ul>You\'ve got it when: a clean pass at a faster BPM than you started — then keep climbing.',
        text_es: 'Aquí no hay un punto de parada fijo. Toca Happy Birthday de memoria con la herramienta Metro.<ul><li>Empieza en 60 BPM. "Hap-py" cabe dentro de un clic, y la última nota de cada línea se sostiene dos</li><li>Cada pasada limpia, súbele 10 BPM</li></ul>Lo tienes cuando: una pasada limpia a un BPM más alto que al empezar — y de ahí, sigue subiendo.',
      },
    ],
  },
  {
    id:    'ca-13',
    number: 12,
    journey: 'the-cure',   // the last step sends them to this Song Journey page — see JOURNEY above
    journeyLayer: 2,
    title:    '"the cure" — Intro and Verse on the Low E',
    title_es: '"the cure" — Intro y estrofa en la cuerda Mi grave',
    intro:    'Like Watchtower, this is played on the low E string. Every chord in "the cure" is named after one note, called its root. Play the roots and you are playing the song\'s bass line — the low notes under the chords. Three notes on one string: index finger on fret 5 for A, pinky on fret 8 for C, and index finger on fret 1 for F.',
    intro_es: 'Como Watchtower, esto se toca en la cuerda Mi grave. Cada acorde de "the cure" lleva el nombre de una nota, su raíz. Toca las raíces y estás tocando la línea de bajo de la canción — las notas graves debajo de los acordes. Tres notas en una sola cuerda: el índice en el traste 5 para el A, el meñique en el traste 8 para el C, y el índice en el traste 1 para el F.',
    steps: [
      {
        label:    'The intro — A · C, twice',
        label_es: 'La intro — A · C, dos veces',
        text: 'Read the tab. Index finger on fret 5 for A. Pinky on fret 8 for C, with the index finger still on fret 5. Each note rings for four beats.<ol><li>Play each note once, slowly, and say its name</li><li>Play the tab, counting 1 2 3 4 out loud</li><li>Open the Metro tool, start it at 60 BPM, and play it again</li></ol>You\'ve got it when: the intro twice in a row at 60 BPM, no stops.',
        text_es: 'Lee la tablatura. Índice en el traste 5 para el A. Meñique en el traste 8 para el C, con el índice todavía en el traste 5. Cada nota suena cuatro tiempos.<ol><li>Toca cada nota una vez, despacio, y di su nombre</li><li>Toca la tablatura contando 1 2 3 4 en voz alta</li><li>Abre la herramienta Metro, arráncala a 60 BPM, y tócala otra vez</li></ol>Lo tienes cuando: la intro dos veces seguidas a 60 BPM, sin detenerte.',
        snippet: { track: 'the-cure', fromBar: 1, bars: 4,
                   label:    'The intro, with the band',
                   label_es: 'La intro, con la banda' },
        tab: {
          caption: 'Intro · A C A C · low E string · 4 beats each',
          caption_es: 'Intro · A C A C · cuerda Mi grave · 4 tiempos cada una',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45, beats: 4 },
            { string: 'E', fret: 8, note: 'C', midi: 48, beats: 4 },
            { string: 'E', fret: 5, note: 'A', midi: 45, beats: 4 },
            { string: 'E', fret: 8, note: 'C', midi: 48, beats: 4 }
          ]
        },
      },
      {
        label:    'The verse — A · C, F · C',
        label_es: 'La estrofa — A · C, F · C',
        text: 'Read the tab. A and C are the same as in the intro: index finger on fret 5, pinky on fret 8. For F, move the whole hand down until the index finger lands on fret 1. Each note rings for four beats.<ol><li>Play just the second half — F C F C — five times</li><li>Play the whole tab slowly, counting out loud</li><li>Then play it at 60 BPM</li></ol>You\'ve got it when: two clean verses in a row at 60 BPM. Late on a note? Start moving the hand on beat 4.',
        text_es: 'Lee la tablatura. A y C van igual que en la intro: índice en el traste 5, meñique en el traste 8. Para el F, baja toda la mano hasta que el índice caiga en el traste 1. Cada nota suena cuatro tiempos.<ol><li>Toca solo la segunda mitad — F C F C — cinco veces</li><li>Toca la tablatura entera despacio, contando en voz alta</li><li>Después tócala a 60 BPM</li></ol>Lo tienes cuando: dos estrofas limpias seguidas a 60 BPM. ¿Llegas tarde a una nota? Empieza a mover la mano en el tiempo 4.',
        snippet: { track: 'the-cure', fromBar: 5, bars: 8,
                   label:    'The verse, with the band',
                   label_es: 'La estrofa, con la banda' },
        tab: {
          caption: 'Verse · A C, F C · low E string · 4 beats each',
          caption_es: 'Estrofa · A C, F C · cuerda Mi grave · 4 tiempos cada una',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45, beats: 4 },
            { string: 'E', fret: 8, note: 'C', midi: 48, beats: 4 },
            { string: 'E', fret: 5, note: 'A', midi: 45, beats: 4 },
            { string: 'E', fret: 8, note: 'C', midi: 48, beats: 4 },
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 4 },
            { string: 'E', fret: 8, note: 'C', midi: 48, beats: 4 },
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 4 },
            { string: 'E', fret: 8, note: 'C', midi: 48, beats: 4 }
          ]
        },
      },
      {
        label:    'The hand shift',
        label_es: 'El cambio de mano',
        text: 'Each pair in the tab is one move of the hand, between fret 5 (index finger on A) and fret 1 (index finger on F).<ol><li>Play a pair, stop, play it again — five times each</li><li>A → F: the index finger slides from fret 5 to fret 1, and the whole hand moves with it</li><li>C → F and F → C: the pinky plays C on fret 8, and the index finger plays F on fret 1</li><li>Keep the index finger lightly touching the string while the hand moves. Then try each pair without looking</li></ol>You\'ve got it when: eight clean moves in a row without looking at your fretting hand.',
        text_es: 'Cada par de la tablatura es un movimiento de la mano, entre el traste 5 (índice en el A) y el traste 1 (índice en el F).<ol><li>Toca un par, para, tócalo otra vez — cinco veces cada uno</li><li>A → F: el índice se desliza del traste 5 al traste 1, y toda la mano se mueve con él</li><li>C → F y F → C: el meñique toca el C en el traste 8, y el índice toca el F en el traste 1</li><li>Deja el índice tocando la cuerda suavemente mientras la mano se mueve. Después prueba cada par sin mirar</li></ol>Lo tienes cuando: ocho movimientos limpios seguidos sin mirarte la mano del mástil.',
        tab: {
          // Off the site-wide paging default: "Each pair in the tab" means all
          // three, and there's no Play tab/snippet here to sync a page turn to
          // — paging would hide the third pair behind an unmentioned Next
          // (2026-09-25 audit).
          linesPerPage: 0,
          caption: 'The hand shift · three two-note pairs · low E string',
          caption_es: 'El cambio de mano · tres pares de dos notas · cuerda Mi grave',
          phrases: [
            {
              label: 'A → F',
              label_es: 'A → F',
              notes: [
                { string: 'E', fret: 5, note: 'A', midi: 45 },
                { string: 'E', fret: 1, note: 'F', midi: 41 }
              ]
            },
            {
              label: 'C → F',
              label_es: 'C → F',
              notes: [
                { string: 'E', fret: 8, note: 'C', midi: 48 },
                { string: 'E', fret: 1, note: 'F', midi: 41 }
              ]
            },
            {
              label: 'F → C',
              label_es: 'F → C',
              notes: [
                { string: 'E', fret: 1, note: 'F', midi: 41 },
                { string: 'E', fret: 8, note: 'C', midi: 48 }
              ]
            }
          ]
        },
      },
      {
        label:    'Intro into verse',
        label_es: 'De la intro a la estrofa',
        text: 'Play the tab straight through: intro, then verse.<ol><li>60 BPM, one pluck on every beat, counting out loud</li><li>Made a mistake? Keep going — don\'t restart</li><li>After a clean run, try 100 BPM</li></ol>You\'ve got it when: intro into verse at 60 BPM with no stops, then once at 100 BPM. Stuck on a move? Go back to Step 3 for one minute.',
        text_es: 'Toca la tablatura de principio a fin: intro, y luego estrofa.<ol><li>60 BPM, una pulsación en cada tiempo, contando en voz alta</li><li>¿Te equivocaste? Sigue — no vuelvas a empezar</li><li>Después de una vuelta limpia, prueba a 100 BPM</li></ol>Lo tienes cuando: de la intro a la estrofa a 60 BPM sin detenerte, y luego una vez a 100 BPM. ¿Te trabas en un movimiento? Vuelve al Paso 3 por un minuto.',
        snippet: { track: 'the-cure', fromBar: 1, bars: 12,
                   label:    'Intro into verse, with the band',
                   label_es: 'De la intro a la estrofa, con la banda' },
        tab: {
          caption: 'Intro and verse · low E string · 4 plucks per note',
          caption_es: 'Intro y estrofa · cuerda Mi grave · 4 pulsaciones por nota',
          phrases: [
            {
              label: 'Intro — A C A C',
              label_es: 'Intro — A C A C',
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
              label: 'Verse — A C A C, F C F C',
              label_es: 'Estrofa — A C A C, F C F C',
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
          ]
        },
      },
      {
        label:    'Keep going',
        label_es: 'Sigue adelante',
        text: 'Pick one:<ul><li>Two clean runs at 100 BPM in a row</li><li>Play along with the backing track on the Song Journey page, Layer 2</li></ul>You\'ve got it when: two clean runs at 100 BPM, or the intro and both verses with the track without stopping.',
        text_es: 'Escoge una:<ul><li>Dos vueltas limpias seguidas a 100 BPM</li><li>Toca con la pista de acompañamiento en la página de Recorrido de la canción, Capa 2</li></ul>Lo tienes cuando: dos vueltas limpias a 100 BPM, o la intro y las dos estrofas con la pista sin detenerte.',
      },
    ],
  },
  /* Day 17 mini-card: "the cure" verse alone, moved from the low E (ca-13's
     A · C · F on frets 5 · 8 · 1) onto two strings with the hand parked in
     frets 1–5. Six rungs on purpose — it shares a day with ca-17 (Notes on
     the A String). ca-18, the next class day, re-teaches this verse and adds
     the chorus; the overlap is intended (Jonathan, 2026-09-16). */
  {
    id:    'ca-19',
    number: 14,
    journey: 'the-cure',
    journeyLayer: 2,
    title:    '"the cure" — The Verse on Two Strings',
    title_es: '"the cure" — La estrofa en dos cuerdas',
    intro:    'You play the verse of "the cure" on the low E string, with a reach up to fret 8 for C and a hand move down to fret 1 for F. Today C moves to the A string, fret 3. Same three notes, and the hand stays inside the first five frets.',
    intro_es: 'Ya tocas la estrofa de "the cure" en la cuerda Mi grave, estirándote hasta el traste 8 para el C y bajando la mano al traste 1 para el F. Hoy el C se pasa a la cuerda La, traste 3. Las mismas tres notas, y la mano se queda dentro de los primeros cinco trastes.',
    steps: [
      {
        label:    'Learn — A and C',
        label_es: 'Aprende — A y C',
        text: 'Press Play on the tab and watch the cursor. Then put your fingers in place: pinky on fret 5 of the low E string for A, ring finger on fret 3 of the A string for C, and index finger over fret 1. Play each note once, slowly, and say its name: A, C, A, C.',
        text_es: 'Pulsa «Tocar el tab» y mira el cursor. Después pon los dedos en su lugar: meñique en el traste 5 de la cuerda Mi grave para el A, anular en el traste 3 de la cuerda La para el C, e índice sobre el traste 1. Toca cada nota una vez, despacio, y di su nombre: A, C, A, C.',
        tab: {
          caption: 'A · C, twice · 4 beats each',
          caption_es: 'A · C, dos veces · 4 tiempos cada una',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'E', fret: 5, note: 'A', midi: 45, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 }
          ]
        },
      },
      {
        label:    'Practice — A and C',
        label_es: 'Practica — A y C',
        text: 'Play A C A C with the tab at 60 BPM. Four beats on each note. You\'ve got it when: A C A C at 60 BPM, three times in a row, one string ringing at a time. Two strings ringing? Drop the tab to 40 BPM and try again.',
        text_es: 'Toca A C A C con la tablatura a 60 BPM. Cuatro tiempos en cada nota. Lo tienes cuando: A C A C a 60 BPM, tres veces seguidas, una sola cuerda sonando a la vez. ¿Suenan dos cuerdas? Baja la tablatura a 40 BPM e inténtalo otra vez.',
        snippet: { track: 'the-cure', fromBar: 5, bars: 4,
                   label:    'The first half of the verse, with the band',
                   label_es: 'La primera mitad de la estrofa, con la banda' },
        tab: {
          caption: 'A · C, twice · 4 beats each',
          caption_es: 'A · C, dos veces · 4 tiempos cada una',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'E', fret: 5, note: 'A', midi: 45, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 }
          ]
        },
      },
      {
        label:    'Learn — F and C',
        label_es: 'Aprende — F y C',
        text: 'Put your index on F and your ring finger on C. Leave both fingers down. Press Play and pick along — only the pick moves.',
        text_es: 'Pon el índice en F y el anular en C. Deja los dos dedos puestos. Pulsa «Tocar el tab» y toca con la púa — solo se mueve la púa.',
        tab: {
          caption: 'F · C, twice · 4 beats each',
          caption_es: 'F · C, dos veces · 4 tiempos cada una',
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 }
          ]
        },
      },
      {
        label:    'Practice — F and C',
        label_es: 'Practica — F y C',
        text: 'Play F C F C with the tab at 60 BPM. You\'ve got it when: F C F C at 60 BPM, three times in a row, no buzz. Buzz? Slide the fingertip closer to the fret and try again.',
        text_es: 'Toca F C F C con la tablatura a 60 BPM. Lo tienes cuando: F C F C a 60 BPM, tres veces seguidas, sin zumbido. ¿Zumba? Desliza la punta del dedo más cerca del traste e inténtalo otra vez.',
        snippet: { track: 'the-cure', fromBar: 9, bars: 4,
                   label:    'The second half of the verse, with the band',
                   label_es: 'La segunda mitad de la estrofa, con la banda' },
        tab: {
          caption: 'F · C, twice · 4 beats each',
          caption_es: 'F · C, dos veces · 4 tiempos cada una',
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 }
          ]
        },
      },
      {
        label:    'Practice — The whole verse',
        label_es: 'Practica — La estrofa completa',
        text: 'Play the whole verse with the tab at 60 BPM: A C A C, then F C F C. Made a mistake? Keep going. You\'ve got it when: two verses in a row at 60 BPM without stopping. Stuck at the C to F move? Play just C then F five times, then try again.',
        text_es: 'Toca la estrofa completa con la tablatura a 60 BPM: A C A C, y luego F C F C. ¿Te equivocaste? Sigue. Lo tienes cuando: dos estrofas seguidas a 60 BPM sin detenerte. ¿Te trabas en el cambio de C a F? Toca solo C y luego F cinco veces, y vuelve a intentarlo.',
        tab: {
          caption: 'Verse · A C A C, F C F C · 4 beats each',
          caption_es: 'Estrofa · A C A C, F C F C · 4 tiempos cada una',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'E', fret: 5, note: 'A', midi: 45, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 },
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 4 },
            { string: 'A', fret: 3, note: 'C', midi: 48, beats: 4 }
          ]
        },
      },
      {
        label:    'Practice — With the band',
        label_es: 'Practica — Con la banda',
        text: 'Press Play on the band and play the verse along with it. You\'ve got it when: the verse with the band, twice, without stopping. After that, open the Song Journey page and play the verse along with the whole song.',
        text_es: 'Pulsa «Toca con la banda» y toca la estrofa con ella. Lo tienes cuando: la estrofa con la banda, dos veces, sin detenerte. Después, abre la página de Recorrido de la canción y toca la estrofa con la canción completa.',
        snippet: { track: 'the-cure', fromBar: 5, bars: 8,
                   label:    'The whole verse, with the band',
                   label_es: 'La estrofa completa, con la banda' },
      },
    ],
  },
  /* REBUILT 2026-09-25 to four steps (Jonathan: "apply this to upcoming class
     activities as well" — the ca-18 rebuild). Was seven: feel the two, learn
     F, practice F, practice A, the loop, faster, with the band. F and A are
     now learned together on the loop tab (the one place Play tab still
     demonstrates how long each note rings — per-note buttons can't), the
     loop is practised to the metronome with the tab revealed after the
     directions (revealDelay), and the 70/80 BPM step is gone:
     the band is the last rung. */
  {
    id:    'ca-20',
    view:  'focus',   // one step at a time — see VIEW above
    journey: 'luna',
    journeyLayer: 2,
    title:    '"Luna" — The Bassline',
    title_es: '"Luna" — La línea de bajo',
    intro:    'You already play F at fret 1 on the low E string. "Luna" needs that note and one more — the open A string. Two notes, two bars each, and that loop carries almost the whole song.',
    intro_es: 'Ya tocas el F en el traste 1 de la cuerda Mi grave. "Luna" necesita esa nota y una más — la cuerda La al aire. Dos notas, dos compases cada una, y ese bucle lleva casi toda la canción.',
    steps: [
      {
        label:    'Learn — Feel the two',
        label_es: 'Aprende — Siente los dos',
        text: 'Press Play on the band below. "Luna" is in 6/8: six quick counts fit each bar, and two of them are big beats — counts 1 and 4. Tap only those two, and let the guitar on the record play the rest.',
        text_es: 'Pulsa «Toca con la banda», abajo. "Luna" está en 6/8: seis cuentas rápidas caben en cada compás, y dos de ellas son tiempos grandes — las cuentas 1 y 4. Marca solo esas dos, y deja que la guitarra del disco toque el resto.',
        // Was "Open the Song Journey page (button just below)" — the Journey
        // button now renders only in the last step (Jonathan, 2026-09-25), so
        // the listening happens on the band snippet right here instead.
        snippet: { track: 'luna', fromBar: 1, bars: 4,
                   label:    'Listen for the two big beats',
                   label_es: 'Escucha los dos tiempos grandes' },
      },
      {
        label:    'Learn — F and A',
        label_es: 'Aprende — F y A',
        text: 'Press Play on the tab and watch the cursor. F is fret 1 on the low E string: index fingertip right behind the fret. A is the open A string: lift the finger off. One pluck per bar, and each note rings through both big beats.',
        text_es: 'Pulsa «Tocar el tab» y mira el cursor. F es el traste 1 de la cuerda Mi grave: la punta del índice justo detrás del traste. A es la cuerda La al aire: levanta el dedo. Una pulsación por compás, y cada nota suena durante los dos tiempos grandes.',
        tab: {
          caption: 'The loop · F F A A · one pluck per bar, 2 beats each',
          caption_es: 'El bucle · F F A A · una pulsación por compás, 2 tiempos cada una',
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 },
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 }
          ]
        },
      },
      {
        label:    'Practice — The loop',
        label_es: 'Practica — El bucle',
        text: 'Open the Metro tool and start it at 60 BPM. Play F F A A, one pluck on every second click, and let each note ring. The index finger comes down for F and lifts for A.\nYou\'ve got it when: four laps (a lap is one time through the loop) at 60 BPM without stopping, no buzz. Late on the change? Play just the second F and the first A, ten times, then try again.',
        text_es: 'Abre la herramienta Metro y arráncala a 60 BPM. Toca F F A A, una pulsación cada dos clics, y deja sonar cada nota. El índice baja para F y se levanta para A.\nLo tienes cuando: cuatro vueltas (una vuelta es una pasada completa del bucle) a 60 BPM sin detenerte, sin zumbido. ¿Llegas tarde al cambio? Toca solo la segunda F y la primera A, diez veces, y vuelve a intentarlo.',
        tab: {
          revealDelay: 10,
          caption: 'The loop · F F A A · one pluck per bar, 2 beats each',
          caption_es: 'El bucle · F F A A · una pulsación por compás, 2 tiempos cada una',
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 },
            { string: 'E', fret: 1, note: 'F', midi: 41, beats: 2 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 },
            { string: 'A', fret: 0, note: 'A', midi: 45, beats: 2 }
          ]
        },
      },
      {
        label:    'Practice — With the band',
        label_es: 'Practica — Con la banda',
        text: 'Stop the Metro tool. Press Play on the band and turn on the band\'s Metronome button. The click ticks six times in each bar. Pluck on click 1 and let the note ring through clicks 2 to 6: two bars of F, then two bars of A. The band is slower than your 60 BPM loop, so count and wait. You\'ve got it when: two laps with the band, every pluck on click 1. Early or late? Count the clicks out loud, 1 to 6, and pluck only on 1. Then turn the Metronome off and open the Song Journey page to play the whole song.',
        text_es: 'Detén la herramienta Metro. Pulsa «Toca con la banda» y activa el botón Metrónomo de la banda. El clic suena seis veces en cada compás. Pulsa la cuerda en el clic 1 y deja sonar la nota durante los clics 2 a 6: dos compases de F, luego dos compases de A. La banda va más lenta que tu bucle a 60 BPM, así que cuenta y espera. Lo tienes cuando: dos vueltas con la banda, cada pulsación en el clic 1. ¿Llegas antes o tarde? Cuenta los clics en voz alta, del 1 al 6, y pulsa solo en el 1. Después apaga el Metrónomo y abre la página de Recorrido de la canción para tocar la canción completa.',
        snippet: { track: 'luna', fromBar: 1, bars: 8,
                   label:    'Two laps with the band',
                   label_es: 'Dos vueltas con la banda' },
      },
    ],
  },
  /* "Luna" bass roots, the Song Journey's Layer 2 line as a class day: F on the
     low E at fret 1 and the open A string, two bars each, one pluck per bar in
     the 6/8 felt-in-2 pulse. Built from Jonathan's Moises chord chart
     (2026-09-23), which agrees with the Journey page — F · Am vamp, Dm once in
     the opening lines. The passing D is left to Layer 3 (D5), where it already
     lives; ca-20 (above) keeps the loop that carries the whole song. */
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
     notes, and the two drills the old recovery lines pointed at. */
  {
    id:    'ca-18',
    view:  'card',    // one screen: Play song + tab + checks — see CARD above
    number: 15,
    journey: 'the-cure',   // the Level up check sends them to this Song Journey page — see JOURNEY above
    journeyLayer: 2,
    title:    '"the cure" — Intro, Verse and Chorus',
    title_es: '"the cure" — Intro, estrofa y coro',
    intro:    'You moved the verse of "the cure" onto two strings — today you add the chorus and play the whole song with the band.',
    intro_es: 'Ya moviste la estrofa de "the cure" a dos cuerdas — hoy agregas el coro y tocas la canción completa con la banda.',
    card: {
      track: 'the-cure',
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
          text:    'Intro and 2 verses with the song on Slower, without stopping.',
          text_es: 'La intro y las 2 estrofas con la canción en Más lento, sin detenerte.' },
        { label: 'Chorus', label_es: 'Coro',
          text:    'Two choruses in a row with the song on Slower, without stopping. Tap Chorus to start there.',
          text_es: 'Dos coros seguidos con la canción en Más lento, sin detenerte. Pulsa «Coro» para empezar ahí.' },
        { label: 'The whole song', label_es: 'La canción completa',
          text:    'Intro to the end of the chorus with the song on Slower, without stopping.',
          text_es: 'De la intro al final del coro con la canción en Más lento, sin detenerte.' },
        { levelUp: true,
          text:    'Slide the switch to Normal and play the whole song. Then play along with the full recording on the Song Journey page, Layer 2.',
          text_es: 'Desliza el interruptor a Normal y toca la canción completa. Después toca con la grabación completa en la página de Recorrido de la canción, Capa 2.' }
      ]
    },
    // The help ladder (read-only, under "More practice help").
    steps: [
      {
        label:    'Learn — The chorus notes',
        label_es: 'Aprende — Las notas del coro',
        text: 'This part is new: D, F, C, G. D and G are the new spots. D is fret 5 on the A string, played with your pinky. G is fret 3 on the low E string, played with your ring finger. Play each note once, slowly, and say its name out loud.',
        text_es: 'Esta parte es nueva: D, F, C, G. D y G son los lugares nuevos. D es el traste 5 de la cuerda La, con el meñique. G es el traste 3 de la cuerda Mi grave, con el anular. Toca cada nota una vez, despacio, y di su nombre en voz alta.',
        tab: {
          caption: 'Chorus notes · D F C G',
          caption_es: 'Notas del coro · D F C G',
          notes: [
            { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 4 },
            { string: 'E', fret: 1,  note: 'F', midi: 41, beats: 4 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 4 },
            { string: 'E', fret: 3,  note: 'G', midi: 43, beats: 4 }
          ]
        },
      },
      {
        label:    'Practice — A and C',
        label_es: 'Practica — A y C',
        text: 'Play A C A C with the tab at 60 BPM. Four beats on each note. You\'ve got it when: A C A C at 60 BPM, three times in a row, one string ringing at a time. Two strings ringing? Drop the tab to 40 BPM and try again.',
        text_es: 'Toca A C A C con la tablatura a 60 BPM. Cuatro tiempos en cada nota. Lo tienes cuando: A C A C a 60 BPM, tres veces seguidas, una sola cuerda sonando a la vez. ¿Suenan dos cuerdas? Baja la tablatura a 40 BPM e inténtalo otra vez.',
        tab: {
          caption: 'A · C, twice · 4 beats each',
          caption_es: 'A · C, dos veces · 4 tiempos cada una',
          notes: [
            { string: 'E', fret: 5,  note: 'A', midi: 45, beats: 4 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 4 },
            { string: 'E', fret: 5,  note: 'A', midi: 45, beats: 4 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 4 }
          ]
        },
      },
      {
        label:    'Practice — C to D',
        label_es: 'Practica — De C a D',
        text: 'The verse ends on C and the chorus starts on D. Both are on the A string: C is fret 3 with your ring finger, D is fret 5 with your pinky. Play C D C D C D C D with the tab at 60 BPM. You\'ve got it when: C D C D C D C D twice in a row, no buzz. Buzz on the D? Press the pinky just behind the fret, then try again.',
        text_es: 'La estrofa termina en C y el coro empieza en D. Los dos están en la cuerda La: C es el traste 3 con el anular, D es el traste 5 con el meñique. Toca C D C D C D C D con la tablatura a 60 BPM. Lo tienes cuando: C D C D C D C D dos veces seguidas, sin zumbido. ¿Zumba el D? Presiona con el meñique justo detrás del traste, y vuelve a intentarlo.',
        tab: {
          caption: 'C · D, four times · A string',
          caption_es: 'C · D, cuatro veces · cuerda La',
          notes: [
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 }
          ]
        },
      },
    ],
  },
  /* An EXIT CHECK, not a step ladder — see the kind:'check' block in the
     schema above. Every note here is lifted verbatim from ca-1's whole-song
     tab (line A `0 0 2 0 5 4`, B `0 0 2 0 7 5`, C `0 0 12 9 5 4 2`,
     D `10 10 9 5 7 5`), so the check can't drift away from the activity that
     taught it. Items 1 and 3 play the SAME four notes and differ only in
     which line they are — flagged on the Summer reset list in CLAUDE.md;
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
     note) are gone. No revealDelay here: ▶ Play tab is the answer key. */
  {
    id:    'ca-21',
    view:  'focus',   // one step at a time — see VIEW above
    title:    'Sight-Reading TAB — Low E and A Strings',
    title_es: 'Lectura a primera vista de TAB — Cuerdas Mi grave y La',
    intro:    'Sight-reading means playing a line from the TAB the first time you see it. The Unit 2 assessment has you read a 2-bar line you have never heard and play it. These three lines are practice for that.',
    intro_es: 'Leer a primera vista significa tocar una línea de la TAB la primera vez que la ves. La evaluación de la Unidad 2 te pide leer una línea de 2 compases que nunca has escuchado y tocarla. Estas tres líneas son práctica para eso.',
    steps: [
      {
        label:    'Learn — How to read TAB',
        label_es: 'Aprende — Cómo leer TAB',
        text: 'TAB shows the six strings as six lines. The bottom line is the low E string. The line above it is the A string. The number on a line is the fret. 0 means play that string open. Read left to right, one note per beat.',
        text_es: 'La TAB muestra las seis cuerdas como seis líneas. La línea de abajo es la cuerda Mi grave. La línea de arriba de esa es la cuerda La. El número en una línea es el traste. 0 significa tocar esa cuerda al aire. Lee de izquierda a derecha, una nota por tiempo.',
      },
      {
        label:    'Practice — Line 1',
        label_es: 'Practica — Línea 1',
        text: 'Say the frets of Line 1 out loud, left to right. Then play Line 1 on your guitar, one note per beat, slowly and evenly. Then press Play on the tab to check, ONLY AFTER you play it. You\'ve got it when: you play Line 1 once through without stopping and it matches the tab. Wrong note? Say each fret number out loud as you play it, and try again.',
        text_es: 'Di en voz alta los trastes de la Línea 1, de izquierda a derecha. Después toca la Línea 1 en tu guitarra, una nota por tiempo, despacio y parejo. Después pulsa «Tocar el tab» para revisar, SOLO DESPUÉS de tocarla. Lo tienes cuando: tocas la Línea 1 completa sin detenerte y coincide con la tablatura. ¿Una nota equivocada? Di cada número de traste en voz alta mientras lo tocas, e inténtalo otra vez.',
        tab: {
          hideNames: true,
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
        text: 'Line 2 starts on the low E string and moves up to the A string once, in bar 2. Play it one note per beat, then press Play to check. You\'ve got it when: you play Line 2 once through without stopping and it matches the tab. Missed the move to the A string? Say the string and the fret out loud for each note, and try again.',
        text_es: 'La Línea 2 empieza en la cuerda Mi grave y sube a la cuerda La una vez, en el compás 2. Tócala una nota por tiempo, y luego pulsa «Tocar el tab» para revisar. Lo tienes cuando: tocas la Línea 2 completa sin detenerte y coincide con la tablatura. ¿Te saltaste el paso a la cuerda La? Di en voz alta la cuerda y el traste de cada nota, e inténtalo otra vez.',
        tab: {
          hideNames: true,
          caption: 'Line 2 · low E and A strings · 2 bars, one note per beat',
          caption_es: 'Línea 2 · cuerdas Mi grave y La · 2 compases, una nota por tiempo',
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
        label:    'Practice — Line 3',
        label_es: 'Practica — Línea 3',
        text: 'Line 3 goes up to fret 8. Play it one note per beat, then press Play to check. You\'ve got it when: Line 3 matches the tab. Then start the Metro tool at 60 BPM and play it with the click. Raise it 10 BPM each time it stays clean.',
        text_es: 'La Línea 3 sube hasta el traste 8. Tócala una nota por tiempo, y luego pulsa «Tocar el tab» para revisar. Lo tienes cuando: la Línea 3 coincide con la tablatura. Después arranca la herramienta Metro a 60 BPM y tócala con el clic. Súbela 10 BPM cada vez que te salga limpia.',
        tab: {
          hideNames: true,
          caption: 'Line 3 · low E and A strings · frets 5–8 · 2 bars, one note per beat',
          caption_es: 'Línea 3 · cuerdas Mi grave y La · trastes 5–8 · 2 compases, una nota por tiempo',
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
     (naturals 60 → 80 BPM → half the beats, then the ♯ notes). Listening
     Coach starts off. Technique ladder: one position slow → the same move
     across the neck → the whole neck at tempo, no ceiling (Level 5 speeds
     up 10 BPM every pass). Engine: renderNoteCall in app.js. Follows ca-11
     / ca-17 / ca-22, which teach the names. */
  {
    id:    'ca-23',
    view:  'focus',   // one step at a time — see VIEW above
    title:    'Low E and A Notes in Time',
    title_es: 'Notas de las cuerdas Mi grave y La a tiempo',
    intro:    'You already know the note names on the low E and A strings. Now you find them in time: a name comes up on the beat, and you play it. You start at frets 0 to 5 and move up the neck one chunk at a time.',
    intro_es: 'Ya sabes los nombres de las notas de las cuerdas Mi grave y La. Ahora las encuentras a tiempo: un nombre aparece con el tiempo, y lo tocas. Empiezas en los trastes 0 a 5 y subes por el mástil un tramo a la vez.',
    steps: [
      {
        label:    'Practice — Frets 0 to 5',
        label_es: 'Practica — Trastes 0 a 5',
        text: 'Press Start with Show answer on. A note name comes up, you play it, and then its fret lights up so you can check. It gets faster every 8 notes. Press Slower when it gets ahead of you. When you are playing each note before its fret lights up, turn Show answer off and press Start Level 1.\nYou\'ve got it when: 8 of 10 on Level 3 with Show answer off. Missing the same note twice? Turn Show answer on for a few notes, then turn it off and go again.',
        text_es: 'Presiona «Empezar» con «Mostrar la respuesta» encendido. Aparece el nombre de una nota, la tocas, y después se ilumina su traste para que revises. Va más rápido cada 8 notas. Presiona «Más lento» cuando se te adelante. Cuando toques cada nota antes de que se ilumine su traste, apaga «Mostrar la respuesta» y presiona «Empezar el Nivel 1».\nLo tienes cuando: 8 de 10 en el Nivel 3 con «Mostrar la respuesta» apagado. ¿Fallas la misma nota dos veces? Enciende «Mostrar la respuesta» por unas notas, luego apágalo e inténtalo de nuevo.',
        drill: { type: 'notecall', strings: ['lowE', 'A'], minFret: 0, maxFret: 5 },
      },
      {
        label:    'Practice — Frets 5 to 8',
        label_es: 'Practica — Trastes 5 a 8',
        text: 'Play the same drill higher up the neck. Fret 5 is your landmark: A on the low E string, D on the A string. Start with Show answer on, then turn it off for the levels. This chunk has its own levels, so it starts at Level 1.\nYou\'ve got it when: 8 of 10 on Level 3 with Show answer off. Falling behind? Play Level 2 until you get 10 of 10, then go back to Level 3.',
        text_es: 'Toca el mismo ejercicio más arriba en el mástil. El traste 5 es tu punto de referencia: A en la cuerda Mi grave, D en la cuerda La. Empieza con «Mostrar la respuesta» encendido y luego apágalo para los niveles. Este tramo tiene sus propios niveles, así que empieza en el Nivel 1.\nLo tienes cuando: 8 de 10 en el Nivel 3 con «Mostrar la respuesta» apagado. ¿Te quedas atrás? Toca el Nivel 2 hasta sacar 10 de 10 y luego vuelve al Nivel 3.',
        drill: { type: 'notecall', strings: ['lowE', 'A'], minFret: 5, maxFret: 8 },
      },
      {
        label:    'Practice — Frets 8 to 12',
        label_es: 'Practica — Trastes 8 a 12',
        text: 'Fret 12 is the double dot. It has the same names as the open strings: E on the low E string, A on the A string. Two frets down from it, at fret 10, are D and G. Start with Show answer on, then turn it off for the levels.\nYou\'ve got it when: 8 of 10 on Level 3 with Show answer off. Falling behind? Play Level 2 until you get 10 of 10, then go back to Level 3.',
        text_es: 'El traste 12 es el punto doble. Tiene los mismos nombres que las cuerdas al aire: E en la cuerda Mi grave, A en la cuerda La. Dos trastes más abajo, en el traste 10, están D y G. Empieza con «Mostrar la respuesta» encendido y luego apágalo para los niveles.\nLo tienes cuando: 8 de 10 en el Nivel 3 con «Mostrar la respuesta» apagado. ¿Te quedas atrás? Toca el Nivel 2 hasta sacar 10 de 10 y luego vuelve al Nivel 3.',
        drill: { type: 'notecall', strings: ['lowE', 'A'], minFret: 8, maxFret: 12 },
      },
      {
        label:    'Practice — The whole neck',
        label_es: 'Practica — Todo el mástil',
        text: 'Find notes anywhere from fret 0 to 12. Levels 4 and 5 add the ♯ (sharp) notes — a ♯ is one fret higher than the note it names, so F♯ is one fret above F. Every time you pass Level 5, it gets 10 BPM faster.\nYou\'ve got it when: 8 of 10 on Level 5, then again at each new speed. Stuck on a ♯ note? Turn Show answer on, pick With ♯ notes, and play along for a while.',
        text_es: 'Busca notas en cualquier traste del 0 al 12. Los Niveles 4 y 5 agregan las notas con ♯ (sostenido) — un ♯ está un traste más arriba que la nota que nombra, así que F♯ está un traste arriba de F. Cada vez que pasas el Nivel 5, sube 10 BPM.\nLo tienes cuando: 8 de 10 en el Nivel 5, y otra vez en cada velocidad nueva. ¿Te atoras con una nota con ♯? Enciende «Mostrar la respuesta», elige «Con notas ♯» y toca a la par un rato.',
        drill: { type: 'notecall', strings: ['lowE', 'A'], minFret: 0, maxFret: 12 },
      },
    ],
  },
];
