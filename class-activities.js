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
   Song Journey page" button under its steps (both renderers), and that one
   Journey page stays OPEN behind the activity gate while this activity is
   pending — journey.js exempts a page any pending activity names, since the
   page is part of the work. Every other Journey page stays gated as usual.
   checks.mjs 1d validates the slug (and the layer against JOURNEY_LAYERS).

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
     intro:    'One or two sentences of context — why today\'s in-class work
                 matters, tied back to what the student just did in stations.',
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
         // content — first-party authored files, not escaped). Multi-step
         // directions are an <ol>/<ul>, same house rule as module content.
         // A trailing "You've got it when: …" / "Lo tienes cuando: …"
         // sentence (exact strings — matched by the render-time GOT_IT_RE)
         // gets the established green-rule/italic treatment for free; write
         // it as plain text after the list, never as its own <li> or a
         // hand-written <span class="got-it">.
         text:    'What the student reads and does. Multi-step directions
                    are an <ol>/<ul>, same house rule as module content.',
         text_es: '…',
         // Optional — a step can carry video, figure, and/or tab together:
         video:  { id: 'YOUTUBE_ID', start: 45,       // oEmbed-verified at
                   label: 'Fingerstyle guitar',         // authoring time, NEVER
                   label_es: 'Guitarra fingerstyle' },  // from memory (see
                                                         // CLAUDE.md "Videos").
                                                         // label/label_es are
                                                         // optional — falls
                                                         // back to the
                                                         // generic "Watch"
                                                         // button text.
         figure: 'img/ca-0915-powerchords.svg',      // renders as the
                                                      // existing .step-figure
                                                      // span idiom; any img/
                                                      // asset also goes in
                                                      // sw.js ASSETS
         figureAlt:    'What the diagram shows, in words — a screen-reader
                         student gets this instead of the image. Required
                         alongside `figure`; rendered via tf(step,
                         'figureAlt') in both caStepHtml() (app.js) and
                         renderTeacherActivityDetail() (teacher.js).',
         figureAlt_es: '…',
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

   v1 ships EMPTY — real activities come from future lesson-planning
   sessions. Do not hand-write example content here; the schema above is
   documentation, not a template to copy live.
   ════════════════════════════════════════════════════════════════════ */
window.CLASS_ACTIVITIES = [
  {
    id:    'ca-1',
    number: 2,
    title:    'Playing Happy Birthday — The Whole Song',
    title_es: 'Tocando Happy Birthday — La canción completa',
    intro:    'You played phrase A already. Today you play all four phrases without ever leaving the low E string — the melody climbs to the double dot at fret 12 and walks back home.',
    intro_es: 'Ya tocaste la frase A. Hoy tocas las cuatro frases sin salirte nunca de la cuerda Mi grave — la melodía sube hasta el punto doble del traste 12 y regresa caminando.',
    steps: [
      {
        label:    'Fretting-hand basics',
        label_es: 'Bases de la mano de trastear',
        figure: 'img/ca-hb-fingers.svg',
        figureAlt: 'Diagram of the fretting hand on the low E string showing finger numbers 1 (index), 2 (middle), 3 (ring), and 4 (pinky), with the thumb behind the neck and landing-mark dots at frets 5 and 7.',
        figureAlt_es: 'Diagrama de la mano de trastear en la cuerda Mi grave mostrando los números de los dedos 1 (índice), 2 (medio), 3 (anular) y 4 (meñique), con el pulgar detrás del mástil y puntos de referencia en los trastes 5 y 7.',
        text: 'The whole song lives on the low E string (the thickest one), and your fretting fingers have numbers — 1 = index, 2 = middle, 3 = ring, 4 = pinky. The thumb has none; it stays behind the neck. Home spot: finger 1 → fret 2, finger 3 → fret 4, finger 4 → fret 5. Today the map grows past the home spot — fret 7 first, then higher still. The dots at 5 and 7 are your landing marks.',
        text_es: 'La canción completa vive en la cuerda Mi grave (la más gruesa), y los dedos de tu mano de trastear tienen números — 1 = índice, 2 = medio, 3 = anular, 4 = meñique. El pulgar no tiene; se queda detrás del mástil. Posición base: dedo 1 → traste 2, dedo 3 → traste 4, dedo 4 → traste 5. Hoy el mapa crece más allá de la posición base — primero el traste 7, y después más arriba. Los puntos en el 5 y el 7 son tus marcas de referencia.',
      },
      {
        label:    'Phrases A and B',
        label_es: 'Frases A y B',
        text: 'The first half of the song — phrase A is the line you learned last time, phrase B starts the same and ends higher.<ul><li>Phrase A, fingers: open, open, 1, open, 4, 3 — say each one as you play it</li><li>Phrase B: open, open, 1, open, then your hand moves up until finger 1 sits on fret 5: finger 3 → fret 7, finger 1 → fret 5. Eyes on fret 7 <em>before</em> your hand moves</li><li>BPM 70. Loop each phrase alone until it\'s clean, then play them back to back</li></ul>You\'ve got it when: phrase A into phrase B, four times through, without stopping. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'La primera mitad de la canción — la frase A es la línea que aprendiste la vez pasada, la frase B empieza igual y termina más arriba.<ul><li>Frase A, dedos: al aire, al aire, 1, al aire, 4, 3 — di cada uno mientras lo tocas</li><li>Frase B: al aire, al aire, 1, al aire, y luego la mano sube hasta que el dedo 1 queda en el traste 5: dedo 3 → traste 7, dedo 1 → traste 5. Ojos en el traste 7 <em>antes</em> de mover la mano</li><li>BPM 70. Repite cada frase sola hasta que salga limpia, y después tócalas seguidas</li></ul>Lo tienes cuando: de la frase A a la frase B, cuatro veces seguidas, sin detenerte. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
        tab: {
          caption: 'First half · phrases A and B',
          caption_es: 'Primera mitad · frases A y B',
          phrases: [
            {
              label: 'Phrase A — "Hap-py birth-day to you"',
              label_es: 'Frase A — "Hap-py birth-day to you"',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 5, note: 'A',  midi: 45 },
                { string: 'E', fret: 4, note: 'G#', midi: 44 }
              ]
            },
            {
              label: 'Phrase B — "Hap-py birth-day to you" (the ending climbs higher)',
              label_es: 'Frase B — "Hap-py birth-day to you" (el final sube más alto)',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 7, note: 'B',  midi: 47 },
                { string: 'E', fret: 5, note: 'A',  midi: 45 }
              ]
            }
          ]
        },
      },
      {
        label:    'Higher landing marks',
        label_es: 'Marcas más altas',
        figure: 'img/ca-hb-low-e-all.svg',
        figureAlt: 'Low E string fretboard diagram showing the double-dot landing mark at fret 12 and the single dot at fret 9, alongside the earlier marks at frets 2, 4, 5, and 7.',
        figureAlt_es: 'Diagrama del diapasón de la cuerda Mi grave mostrando el punto doble de referencia en el traste 12 y el punto sencillo en el traste 9, junto con las marcas anteriores en los trastes 2, 4, 5 y 7.',
        text: 'The back half of the song lives further up the same string. Two new landing marks:<ul><li>The double dot at fret 12 — that note is an E, the same one you get open, an octave higher</li><li>The single dot at fret 9</li></ul>Play open, 12, 9, 5 — look at the dot before your hand moves, then try it without looking.<br>You\'ve got it when: you land on 12 and on 9 without hunting for them, three times out of three.',
        text_es: 'La segunda mitad de la canción vive más arriba en la misma cuerda. Dos marcas de referencia nuevas:<ul><li>El punto doble del traste 12 — esa nota es un E, la misma que suena al aire, una octava más arriba</li><li>El punto sencillo del traste 9</li></ul>Toca al aire, 12, 9, 5 — mira el punto antes de mover la mano, y después inténtalo sin mirar.<br>Lo tienes cuando: caes en el 12 y en el 9 sin andarlos buscando, tres de tres veces.',
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
        label:    'Phrase C',
        label_es: 'Frase C',
        text: 'Phrase C is where you sing the name — it makes the biggest jump in the song.<ul><li>Two open notes, then your hand travels — finger 1 on fret 9, finger 4 reaching the double dot at fret 12</li><li>Walk down 12 → 9, then shift home: finger 4 → fret 5, finger 3 → fret 4, finger 1 → fret 2</li><li>Loop it alone, saying the words as you play, until it\'s clean</li></ul>You\'ve got it when: phrase C, four times through, without stopping. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'La frase C es donde cantas el nombre — da el salto más grande de la canción.<ul><li>Dos notas al aire, y luego tu mano viaja — dedo 1 en el traste 9, dedo 4 estirándose al punto doble del traste 12</li><li>Baja del 12 al 9, y después regresa a la posición base: dedo 4 → traste 5, dedo 3 → traste 4, dedo 1 → traste 2</li><li>Repítela sola hasta que salga limpia, diciendo las palabras mientras tocas</li></ul>Lo tienes cuando: la frase C, cuatro veces seguidas, sin detenerte. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
        tab: {
          caption: 'Phrase C · low E string only',
          caption_es: 'Frase C · solo la cuerda Mi grave',
          notes: [
            { string: 'E', fret: 0,  note: 'E',  midi: 40 },
            { string: 'E', fret: 0,  note: 'E',  midi: 40 },
            { string: 'E', fret: 12, note: 'E',  midi: 52 },
            { string: 'E', fret: 9,  note: 'C#', midi: 49 },
            { string: 'E', fret: 5,  note: 'A',  midi: 45 },
            { string: 'E', fret: 4,  note: 'G#', midi: 44 },
            { string: 'E', fret: 2,  note: 'F#', midi: 42 }
          ]
        },
      },
      {
        label:    'Phrase D',
        label_es: 'Frase D',
        text: 'Phrase D starts higher than any other phrase in the song, then walks home.<ul><li>Finger 2 on fret 10, finger 1 on fret 9</li><li>Shift down: finger 1 → fret 5, finger 3 → fret 7. The frets are narrow that high, so stay on your fingertips or they\'ll crowd each other</li><li>Loop it alone, saying the words as you play, until it\'s clean, then play phrase C into phrase D back to back</li></ul>You\'ve got it when: phrase C into phrase D, four times through, without stopping. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'La frase D empieza más arriba que cualquier otra frase de la canción, y después regresa caminando a casa.<ul><li>Dedo 2 en el traste 10, dedo 1 en el traste 9</li><li>Baja: dedo 1 → traste 5, dedo 3 → traste 7. Allá arriba los trastes son angostos, así que quédate sobre las puntas de los dedos o se van a chocar entre sí</li><li>Repítela sola hasta que salga limpia, diciendo las palabras mientras tocas, y después toca la frase C seguida de la D</li></ul>Lo tienes cuando: de la frase C a la frase D, cuatro veces seguidas, sin detenerte. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
        tab: {
          caption: 'Phrase D · low E string only',
          caption_es: 'Frase D · solo la cuerda Mi grave',
          notes: [
            { string: 'E', fret: 10, note: 'D',  midi: 50 },
            { string: 'E', fret: 10, note: 'D',  midi: 50 },
            { string: 'E', fret: 9,  note: 'C#', midi: 49 },
            { string: 'E', fret: 5,  note: 'A',  midi: 45 },
            { string: 'E', fret: 7,  note: 'B',  midi: 47 },
            { string: 'E', fret: 5,  note: 'A',  midi: 45 }
          ]
        },
      },
      {
        label:    'The whole song',
        label_es: 'La canción completa',
        text: 'All four phrases, start to finish — the whole song on one string, no stopping in between. Then raise the tempo.<ul><li>Every clean pass: raise the BPM by 10</li><li>Fast already? Play it for the person next to you and have them sing along — someone in this room has a birthday coming</li></ul>You\'ve got it when: phrases A, B, C and D back to back without stopping, and the tempo raised at least three times without breaking down — then keep climbing.',
        text_es: 'Las cuatro frases, de principio a fin — la canción completa en una sola cuerda, sin detenerte entre medio. Después sube el tempo.<ul><li>Cada pasada limpia: sube el BPM 10 puntos</li><li>¿Ya vas rápido? Tócala para la persona de al lado y que cante contigo — alguien en este salón cumple años pronto</li></ul>Lo tienes cuando: las frases A, B, C y D seguidas sin detenerte, y el tempo subido al menos tres veces sin perder el ritmo — y de ahí, sigue subiendo.',
        tab: {
          caption: 'Whole song · phrases A–D · low E string only',
          caption_es: 'Canción completa · frases A–D · solo la cuerda Mi grave',
          phrases: [
            {
              label: 'Phrase A — "Hap-py birth-day to you"',
              label_es: 'Frase A — "Hap-py birth-day to you"',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 5, note: 'A',  midi: 45 },
                { string: 'E', fret: 4, note: 'G#', midi: 44 }
              ]
            },
            {
              label: 'Phrase B — "Hap-py birth-day to you" (the ending climbs higher)',
              label_es: 'Frase B — "Hap-py birth-day to you" (el final sube más alto)',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 7, note: 'B',  midi: 47 },
                { string: 'E', fret: 5, note: 'A',  midi: 45 }
              ]
            },
            {
              label: 'Phrase C — "Hap-py birth-day dear ______"',
              label_es: 'Frase C — "Hap-py birth-day dear ______"',
              notes: [
                { string: 'E', fret: 0,  note: 'E',  midi: 40 },
                { string: 'E', fret: 0,  note: 'E',  midi: 40 },
                { string: 'E', fret: 12, note: 'E',  midi: 52 },
                { string: 'E', fret: 9,  note: 'C#', midi: 49 },
                { string: 'E', fret: 5,  note: 'A',  midi: 45 },
                { string: 'E', fret: 4,  note: 'G#', midi: 44 },
                { string: 'E', fret: 2,  note: 'F#', midi: 42 }
              ]
            },
            {
              label: 'Phrase D — "Hap-py birth-day to you"',
              label_es: 'Frase D — "Hap-py birth-day to you"',
              notes: [
                { string: 'E', fret: 10, note: 'D',  midi: 50 },
                { string: 'E', fret: 10, note: 'D',  midi: 50 },
                { string: 'E', fret: 9,  note: 'C#', midi: 49 },
                { string: 'E', fret: 5,  note: 'A',  midi: 45 },
                { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                { string: 'E', fret: 5,  note: 'A',  midi: 45 }
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
    intro:    'Today isn\'t a song day — it\'s a training day. Three events in the first five frets: the Ladder, the Spider, the Reach. You\'re chasing a personal record, not a grade.',
    intro_es: 'Hoy no es día de canciones — es día de entrenamiento. Tres eventos en los primeros cinco trastes: la Escalera, la Araña y el Estiramiento. Vas por un récord personal, no por una calificación.',
    steps: [
      {
        label:    'The gym zone',
        label_es: 'La zona del gimnasio',
        figure: 'img/ca-fg-gym-zone.svg',
        figureAlt: 'Diagram of the first five frets of the low E string, the training zone for today\'s Finger Gym.',
        figureAlt_es: 'Diagrama de los primeros cinco trastes de la cuerda Mi grave, la zona de entrenamiento del Gimnasio de Dedos de hoy.',
        text: 'This is the gym: the first five frets of the low E string (the thickest one). A fret is the space between two metal strips — fret 1 is closest to the tuning pegs.',
        text_es: 'Este es el gimnasio: los primeros cinco trastes de la cuerda Mi grave (la más gruesa). Un traste es el espacio entre dos barras de metal — el traste 1 es el más cercano a las clavijas.',
      },
      {
        label:    'The Ladder',
        label_es: 'La Escalera',
        text: 'Event 1 — the Ladder. One finger per fret.<ul><li>Index → fret 1, middle → 2, ring → 3, pinky → 4</li><li>Set the BPM to 50 — one note per click</li><li>Fingertips on their tips, thumb BEHIND the neck</li></ul>You\'ve got it when: all four notes ring clean — no buzz — three times in a row. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'Evento 1 — la Escalera. Un dedo por traste.<ul><li>Índice → traste 1, medio → 2, anular → 3, meñique → 4</li><li>Pon el BPM en 50 — una nota por clic</li><li>Puntas de los dedos, pulgar DETRÁS del mástil</li></ul>Lo tienes cuando: las cuatro notas suenan limpias — sin zumbido — tres veces seguidas. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
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
        text: 'Add the shift.<ul><li>Climb 1-2-3-4</li><li>Slide the whole hand up one fret — fingers keep their spacing</li><li>Climb 2-3-4-5</li></ul>You\'ve got it when: two full climbs back to back and your thumb stays behind the neck the whole way.',
        text_es: 'Agrega el cambio.<ul><li>Sube 1-2-3-4</li><li>Desliza toda la mano un traste hacia arriba — los dedos mantienen su separación</li><li>Sube 2-3-4-5</li></ul>Lo tienes cuando: dos subidas completas seguidas y tu pulgar se queda detrás del mástil todo el tiempo.',
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
        text: 'Event 2 — the Spider. Same four fingers, two strings.<ul><li>Alternate: low E, A, low E, A</li><li>Watch for this: finger 3 tends to follow finger 2 onto the A string — keep it on the low E</li><li>Shift up one fret and repeat</li></ul>You\'ve got it when: one full pass with every note on the right string, any speed.',
        text_es: 'Evento 2 — la Araña. Los mismos cuatro dedos, dos cuerdas.<ul><li>Alterna: Mi grave, La, Mi grave, La</li><li>Ojo con esto: el dedo 3 tiende a seguir al dedo 2 hacia la cuerda La — mantenlo en el Mi grave</li><li>Sube un traste y repite</li></ul>Lo tienes cuando: una pasada completa con cada nota en la cuerda correcta, a cualquier velocidad.',
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
        text: 'Event 3 — the Reach.<ul><li>Plant finger 1 on fret 1 — it stays there</li><li>Reach your pinky to fret 5, then bring it back (fret 4 counts too)</li><li>Stretch, never pain — if it hurts, stop</li></ul>You\'ve got it when: four reaches in a row and finger 1 never lifts.',
        text_es: 'Evento 3 — el Estiramiento.<ul><li>Planta el dedo 1 en el traste 1 — se queda ahí</li><li>Estira el meñique hasta el traste 5 y regrésalo (el traste 4 también cuenta)</li><li>Estira sin dolor — si duele, detente</li></ul>Lo tienes cuando: cuatro estiramientos seguidos y el dedo 1 nunca se levanta.',
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
        text: 'The circuit:<ol><li>Run Ladder ×4, Spider ×4, Reach ×4 — that\'s one set. Start at 50 BPM.</li><li>Every clean set, raise the BPM by 10: 50 is bronze, 60 is silver, 70 is gold.</li><li>Write down your best clean BPM — that\'s your record to beat next Finger Gym day.</li></ol>You\'ve got it when: two full sets done and today\'s best BPM is written down.',
        text_es: 'El circuito:<ol><li>Toca Escalera ×4, Araña ×4, Estiramiento ×4 — eso es una serie. Empieza en 50 BPM.</li><li>Cada serie limpia, sube el BPM 10 puntos: 50 es bronce, 60 es plata, 70 es oro.</li><li>Anota tu mejor BPM limpio — ese es el récord que vas a superar el próximo día de Gimnasio de Dedos.</li></ol>Lo tienes cuando: dos series completas hechas y tu mejor BPM de hoy está anotado.',
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
        label:    'The gym zone',
        label_es: 'La zona del gimnasio',
        figure: 'img/ca-fg-gym-zone.svg',
        figureAlt: 'Diagram of the first five frets of the low E string, the training zone for today\'s Finger Gym.',
        figureAlt_es: 'Diagrama de los primeros cinco trastes de la cuerda Mi grave, la zona de entrenamiento del Gimnasio de Dedos de hoy.',
        text: 'This is the same gym as last time: the first five frets. Two things change today — the direction you travel, and how many strings you use.',
        text_es: 'Este es el mismo gimnasio que la vez pasada: los primeros cinco trastes. Hoy cambian dos cosas — la dirección en la que te mueves, y cuántas cuerdas usas.',
      },
      {
        label:    'Down the Ladder',
        label_es: 'Bajando la Escalera',
        text: 'The Ladder backwards. Your pinky is the weakest finger, so it goes FIRST.<ul><li>Set the BPM to 50</li><li>Pinky → fret 4, ring → 3, middle → 2, index → 1</li></ul>You\'ve got it when: all four notes ring clean — no buzz — three times in a row. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'La Escalera al revés. Tu meñique es el dedo más débil, por eso va PRIMERO.<ul><li>Pon el BPM en 50</li><li>Meñique → traste 4, anular → 3, medio → 2, índice → 1</li></ul>Lo tienes cuando: las cuatro notas suenan limpias — sin zumbido — tres veces seguidas. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
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
        text: 'Climb up, then come straight back down — no pause at the top.<ul><li>Frets 1 → 2 → 3 → 4, then 3 → 2 → 1</li><li>Fret 4 gets played once, not twice</li></ul>You\'ve got it when: four times through without stopping.',
        text_es: 'Sube y después baja de inmediato — sin pausa arriba.<ul><li>Trastes 1 → 2 → 3 → 4, y después 3 → 2 → 1</li><li>El traste 4 se toca una sola vez, no dos</li></ul>Lo tienes cuando: cuatro veces seguidas sin detenerte.',
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
        text: 'Move the same climb over to a new string.<ul><li>The A string first, then the D string</li><li>The shape never changes — only which string your fingers land on</li></ul>You\'ve got it when: no buzz on any of the four notes, on both strings.',
        text_es: 'Mueve la misma subida a otra cuerda.<ul><li>Primero la cuerda La, después la cuerda Re</li><li>La forma nunca cambia — solo cambia en qué cuerda caen tus dedos</li></ul>Lo tienes cuando: sin zumbido en ninguna de las cuatro notas, en las dos cuerdas.',
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
        text: 'The circuit:<ol><li>Climb up and back down on all six strings — low E to high e and home again. That\'s one set.</li><li>Every clean set, raise the BPM by 10 and write down your best — that\'s your record to beat next Finger Gym day.</li></ol>You\'ve got it when: two full sets done and today\'s best clean BPM is written down.',
        text_es: 'El circuito:<ol><li>Sube y baja en las seis cuerdas — de la Mi grave a la Mi aguda y de regreso. Esa es una serie.</li><li>Cada serie limpia, sube el BPM 10 puntos y anota tu mejor marca — ese es el récord que vas a superar el próximo día de Gimnasio de Dedos.</li></ol>Lo tienes cuando: dos series completas hechas y tu mejor BPM limpio de hoy está anotado.',
      },
    ],
  },
  {
    id:    'ca-4',
    number: 6,
    title:    'Finger Gym 3 — Up the Neck',
    title_es: 'Gimnasio de Dedos 3 — Subiendo el mástil',
    intro:    'So far the gym has lived in the first five frets. Today you move it up the neck. The frets get narrower as you climb, so the same shape feels different in every position.',
    intro_es: 'Hasta ahora el gimnasio ha vivido en los primeros cinco trastes. Hoy lo mueves hacia arriba del mástil. Los trastes se hacen más angostos mientras subes, así que la misma forma se siente distinta en cada posición.',
    steps: [
      {
        label:    'Landing marks',
        label_es: 'Marcas de referencia',
        figure: 'img/ca-fg-dots.svg',
        figureAlt: 'Neck diagram highlighting the landing-mark dots at frets 5, 7, 9, and the double dot at fret 12.',
        figureAlt_es: 'Diagrama del mástil resaltando los puntos de referencia en los trastes 5, 7, 9 y el punto doble en el traste 12.',
        text: 'The dots on the neck are your landing marks: frets 5, 7, 9, and the double dot at 12. Learn to find them with your eyes before your hand goes there.',
        text_es: 'Los puntos en el mástil son tus marcas de referencia: los trastes 5, 7, 9 y el punto doble en el 12. Aprende a encontrarlos con la vista antes de que llegue tu mano.',
      },
      {
        label:    '5th position Ladder',
        label_es: 'Escalera en 5.ª posición',
        text: 'The Ladder in 5th position.<ul><li>Index on fret 5 — it sits on a dot, that\'s how you know you\'re home</li><li>Set the BPM to 50</li><li>One finger per fret, up to 8</li></ul>You\'ve got it when: all four notes clean, no buzz, three times in a row. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'La Escalera en la 5.ª posición.<ul><li>Índice en el traste 5 — queda sobre un punto, así sabes que estás en tu lugar</li><li>Pon el BPM en 50</li><li>Un dedo por traste, hasta el 8</li></ul>Lo tienes cuando: las cuatro notas limpias, sin zumbido, tres veces seguidas. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
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
        text: 'Add the shift, two frets up this time.<ul><li>Climb 5-6-7-8</li><li>Slide the whole hand to 7 — it travels as one piece</li><li>Climb 7-8-9-10</li></ul>You\'ve got it when: two full climbs back to back and your thumb stays behind the neck the whole way.',
        text_es: 'Agrega el cambio, esta vez dos trastes.<ul><li>Sube 5-6-7-8</li><li>Desliza toda la mano al 7 — viaja como una sola pieza</li><li>Sube 7-8-9-10</li></ul>Lo tienes cuando: dos subidas completas seguidas y tu pulgar se queda detrás del mástil todo el tiempo.',
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
        text: 'Play the jump — one note each, no walking up.<ul><li>Index: fret 1 → fret 5 → fret 9</li><li>Look at the dot, then move</li><li>After three tries: look away and let your hand find it</li></ul>You\'ve got it when: you can look away and land all three, three times out of three.',
        text_es: 'Toca el salto — una nota en cada uno, sin caminar.<ul><li>Índice: traste 1 → traste 5 → traste 9</li><li>Mira el punto y muévete</li><li>Después de tres intentos: voltea la mirada y deja que tu mano lo encuentre</li></ul>Lo tienes cuando: puedes voltear la mirada y caer en los tres, tres de tres veces.',
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
        text: 'The Ladder in 9th position, up to the double dot at fret 12.<ul><li>These are the narrowest frets on the neck, so your fingers are crowded</li><li>Keep them ON THEIR TIPS or they\'ll bump each other</li></ul>You\'ve got it when: no buzz on any of the four.',
        text_es: 'La Escalera en la 9.ª posición, hasta el punto doble del traste 12.<ul><li>Estos son los trastes más angostos del mástil, así que tus dedos van apretados</li><li>Mantenlos SOBRE LAS PUNTAS o se van a chocar entre sí</li></ul>Lo tienes cuando: sin zumbido en ninguna de las cuatro.',
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
        text: 'The circuit:<ol><li>Play the Ladder in 1st position, 5th, then 9th, then all the way back down — that\'s one set.</li><li>Every clean set, raise the BPM by 10 and write down your best — that\'s your record to beat next Finger Gym day.</li></ol>You\'ve got it when: two full sets done and today\'s best clean BPM is written down.',
        text_es: 'El circuito:<ol><li>Toca la Escalera en la 1.ª posición, la 5.ª, la 9.ª, y de regreso hasta abajo — esa es una serie.</li><li>Cada serie limpia, sube el BPM 10 puntos y anota tu mejor marca — ese es el récord que vas a superar el próximo día de Gimnasio de Dedos.</li></ol>Lo tienes cuando: dos series completas hechas y tu mejor BPM limpio de hoy está anotado.',
      },
    ],
  },
  {
    id:    'ca-5',
    number: 7,
    title:    'Finger Gym 4 — Fingers Down',
    title_es: 'Gimnasio de Dedos 4 — Dedos abajo',
    intro:    'Until now your fingers took turns. Today they stay down. Every finger that has already played keeps touching the string — that\'s what makes chords possible later.',
    intro_es: 'Hasta ahora tus dedos se tomaban turnos. Hoy se quedan abajo. Cada dedo que ya tocó sigue apoyado en la cuerda — eso es lo que hace posibles los acordes más adelante.',
    steps: [
      {
        label:    'The gym zone',
        label_es: 'La zona del gimnasio',
        figure: 'img/ca-fg-gym-zone.svg',
        figureAlt: 'Diagram of the first five frets of the low E string, the training zone for today\'s Finger Gym.',
        figureAlt_es: 'Diagrama de los primeros cinco trastes de la cuerda Mi grave, la zona de entrenamiento del Gimnasio de Dedos de hoy.',
        text: 'You\'re back in the first five frets. The notes are the same as Gym 1 — what changes is that nothing lifts.',
        text_es: 'Estás de vuelta en los primeros cinco trastes. Las notas son las mismas del Gimnasio 1 — lo que cambia es que nada se levanta.',
      },
      {
        label:    'Plant as you go',
        label_es: 'Planta y sigue',
        text: 'Plant as you go.<ul><li>Set the BPM to 50</li><li>Climb 1-2-3-4 — each finger STAYS where it lands</li><li>By the last note, all four fingers are on the string at once</li></ul>You\'ve got it when: at fret 4 all four fingers are still touching, three times in a row. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'Planta y sigue.<ul><li>Pon el BPM en 50</li><li>Sube 1-2-3-4 — cada dedo SE QUEDA donde cayó</li><li>En la última nota, los cuatro dedos están sobre la cuerda a la vez</li></ul>Lo tienes cuando: al llegar al traste 4 los cuatro dedos siguen apoyados, tres veces seguidas. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
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
        text: 'Pair 1-3 — finger independence: one finger moves while the others don\'t.<ul><li>Alternate: finger 1 on fret 1, finger 3 on fret 3, back and forth</li><li>The two fingers not playing stay down on their frets</li></ul>You\'ve got it when: eight clean alternations in a row.',
        text_es: 'Pareja 1-3 — independencia de dedos: un dedo se mueve mientras los otros no.<ul><li>Alterna: dedo 1 en el traste 1, dedo 3 en el traste 3, ida y vuelta</li><li>Los dos dedos que no tocan se quedan abajo en sus trastes</li></ul>Lo tienes cuando: ocho alternancias limpias seguidas.',
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
        text: 'Pair 3-4 — ring and pinky, the hardest pair on the hand.<ul><li>They share a tendon, so they want to move together</li><li>Go slow enough that only one moves at a time</li></ul>You\'ve got it when: eight in a row, no buzz, and the other fingers never leave the string.',
        text_es: 'Pareja 3-4 — anular y meñique, la pareja más difícil de la mano.<ul><li>Comparten un tendón, así que quieren moverse juntos</li><li>Ve lo suficientemente lento para que solo uno se mueva a la vez</li></ul>Lo tienes cuando: ocho seguidas, sin zumbido, y los otros dedos nunca dejan la cuerda.',
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
        text: 'Out of order: 1-3-2-4.<ul><li>Fingers keep landing and staying, but not in a line</li><li>Your middle finger has to reach past a finger that\'s already down</li></ul>You\'ve got it when: four times through without stopping.',
        text_es: 'Fuera de orden: 1-3-2-4.<ul><li>Los dedos siguen cayendo y quedándose, pero no en fila</li><li>Tu dedo medio tiene que pasar por encima de un dedo que ya está abajo</li></ul>Lo tienes cuando: cuatro veces seguidas sin detenerte.',
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
        text: 'The circuit:<ol><li>Play 1-3-2-4 on the low E string, then the A string, then the D string, fingers staying down the whole way. That\'s one set.</li><li>Every clean set, raise the BPM by 10 and write down your best — that\'s your record to beat next Finger Gym day.</li></ol>You\'ve got it when: two full sets done and today\'s best clean BPM is written down.',
        text_es: 'El circuito:<ol><li>Toca 1-3-2-4 en la cuerda Mi grave, después en la cuerda La, después en la cuerda Re, con los dedos abajo todo el tiempo. Esa es una serie.</li><li>Cada serie limpia, sube el BPM 10 puntos y anota tu mejor marca — ese es el récord que vas a superar el próximo día de Gimnasio de Dedos.</li></ol>Lo tienes cuando: dos series completas hechas y tu mejor BPM limpio de hoy está anotado.',
      },
    ],
  },
  {
    id:    'ca-6',
    number: 8,
    title:    'Finger Gym 5 — The Skip',
    title_es: 'Gimnasio de Dedos 5 — El salto',
    intro:    'Two new demands today: skipping over a string without hitting it, and reaching one fret farther than is comfortable.',
    intro_es: 'Hoy hay dos exigencias nuevas: saltar sobre una cuerda sin tocarla, y estirar un traste más allá de lo cómodo.',
    steps: [
      {
        label:    'The gym zone',
        label_es: 'La zona del gimnasio',
        figure: 'img/ca-fg-gym-zone-skip.svg',
        figureAlt: 'Diagram of three strings — low E, A, and D — out to fret 6, showing the wider, deeper training zone for today\'s Finger Gym.',
        figureAlt_es: 'Diagrama de tres cuerdas — Mi grave, La y Re — hasta el traste 6, mostrando la zona de entrenamiento más ancha y profunda del Gimnasio de Dedos de hoy.',
        text: 'The gym grows today: three strings deep — low E, A, and D — and one fret wider, out to fret 6. The distance is sideways now as well as along the neck.',
        text_es: 'Hoy el gimnasio crece: tres cuerdas de profundidad — Mi grave, La y Re — y un traste más de ancho, hasta el traste 6. Ahora la distancia también es de lado, además de a lo largo del mástil.',
      },
      {
        label:    'The skip',
        label_es: 'El salto',
        text: 'The skip.<ul><li>Index → low E string, fret 1; ring → D string, fret 3</li><li>Jump over the A string — it stays SILENT</li><li>Pick straight down onto the string you want</li></ul>You\'ve got it when: eight jumps in a row and the A string never rings. Hear it ring twice? Drop the BPM by 10 and try again.',
        text_es: 'El salto.<ul><li>Índice → cuerda Mi grave, traste 1; anular → cuerda Re, traste 3</li><li>Salta por encima de la cuerda La — se queda EN SILENCIO</li><li>Pulsa directo hacia abajo sobre la cuerda que quieres</li></ul>Lo tienes cuando: ocho saltos seguidos y la cuerda La nunca suena. ¿La oyes sonar dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
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
        text: 'The Spider with a skip.<ul><li>Same alternating pattern as always, but between the low E and D strings instead of neighbours</li><li>Then shift up one fret and repeat</li></ul>You\'ve got it when: one full pass with every note on the right string, any speed.',
        text_es: 'La Araña con salto.<ul><li>El mismo patrón alternado de siempre, pero entre la cuerda Mi grave y la cuerda Re, no entre vecinas</li><li>Después sube un traste y repite</li></ul>Lo tienes cuando: una pasada completa con cada nota en la cuerda correcta, a cualquier velocidad.',
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
        text: 'The wide Reach.<ul><li>Index plants on fret 1 — it stays</li><li>Pinky goes to fret 6, one farther than last time (fret 5 still counts)</li><li>Stretch, never pain — if the wrist hurts, stop</li></ul>You\'ve got it when: four reaches in a row and finger 1 never lifts.',
        text_es: 'El Estiramiento ancho.<ul><li>El índice se planta en el traste 1 — se queda</li><li>El meñique va al traste 6, uno más que la vez pasada (el traste 5 sigue contando)</li><li>Estira sin dolor — si te duele la muñeca, detente</li></ul>Lo tienes cuando: cuatro estiramientos seguidos y el dedo 1 nunca se levanta.',
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
        text: 'Reach across strings.<ul><li>Index → low E, fret 2; pinky → A string, fret 5</li><li>Hold the shape so both notes ring together</li><li>This builds the reach you\'ll need for power chords (Module 3 teaches their real shape)</li></ul>You\'ve got it when: both notes ring at the same time, four times in a row.',
        text_es: 'Estiramiento entre cuerdas.<ul><li>Índice → Mi grave, traste 2; meñique → cuerda La, traste 5</li><li>Sostén la forma para que las dos notas suenen juntas</li><li>Esto construye el alcance que vas a necesitar para los acordes de potencia (el Módulo 3 enseña su forma real)</li></ul>Lo tienes cuando: las dos notas suenan al mismo tiempo, cuatro veces seguidas.',
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
        text: 'The circuit:<ol><li>Run skip Spider ×4, wide Reach ×4, across-the-strings ×4 — that\'s one set.</li><li>Every clean set, raise the BPM by 10 and write down your best — that\'s your record to beat next Finger Gym day.</li></ol>You\'ve got it when: two full sets done and today\'s best clean BPM is written down.',
        text_es: 'El circuito:<ol><li>Toca Araña con salto ×4, Estiramiento ancho ×4, entre cuerdas ×4 — esa es una serie.</li><li>Cada serie limpia, sube el BPM 10 puntos y anota tu mejor marca — ese es el récord que vas a superar el próximo día de Gimnasio de Dedos.</li></ol>Lo tienes cuando: dos series completas hechas y tu mejor BPM limpio de hoy está anotado.',
      },
    ],
  },
  {
    id:    'ca-7',
    number: 9,
    title:    'Finger Gym 6 — The Meet',
    title_es: 'Gimnasio de Dedos 6 — La competencia',
    intro:    'Meet day. Nothing new to learn — everything you\'ve built, run back to back, at the fastest tempo you can keep clean. Bring your record from last Gym.',
    intro_es: 'Día de competencia. No hay nada nuevo que aprender — todo lo que has construido, seguido y sin parar, al tempo más rápido que puedas mantener limpio. Trae tu récord del Gimnasio pasado.',
    steps: [
      {
        label:    'The gym zone',
        label_es: 'La zona del gimnasio',
        figure: 'img/ca-fg-gym-zone.svg',
        figureAlt: 'Diagram of the first five frets of the low E string, the training zone for today\'s Finger Gym.',
        figureAlt_es: 'Diagrama de los primeros cinco trastes de la cuerda Mi grave, la zona de entrenamiento del Gimnasio de Dedos de hoy.',
        text: 'Three events, same as always: the Ladder, the Spider, the Reach. Today they get run for time and tempo instead of learned.',
        text_es: 'Tres eventos, como siempre: la Escalera, la Araña y el Estiramiento. Hoy se corren por tiempo y tempo, no se aprenden.',
      },
      {
        label:    'Warm-up',
        label_es: 'Calentamiento',
        text: 'Warm up the Ladder with its shift. Start 10 BPM below your record — you\'re loosening the hand, not competing yet.\nYou\'ve got it when: two clean climbs in a row with no buzz.',
        text_es: 'Calienta la Escalera con su cambio. Empieza 10 BPM por debajo de tu récord — estás soltando la mano, todavía no compites.\nLo tienes cuando: dos subidas limpias seguidas, sin zumbido.',
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
        label:    'Spider at record tempo',
        label_es: 'Araña a tu tempo récord',
        text: 'Event 2 at your record tempo:<ol><li>Set the BPM to the number you wrote down last Gym.</li><li>Play the Spider there.</li></ol>You\'ve got it when: one clean pass at your record BPM, every note on the right string. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'Evento 2 a tu tempo récord:<ol><li>Pon el BPM en el número que anotaste el Gimnasio pasado.</li><li>Toca la Araña ahí.</li></ol>Lo tienes cuando: una pasada limpia a tu BPM récord, con cada nota en la cuerda correcta. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
        tab: {
          caption: 'Spider · at your record BPM',
          caption_es: 'Araña · a tu BPM récord',
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
        text: 'Reach endurance — eight reaches without stopping, twice the usual.<ul><li>The hand starts to tire around six — that\'s the part that builds strength</li><li>Pain is different from work: if it hurts, STOP</li></ul>You\'ve got it when: eight reaches without stopping and finger 1 never lifts.',
        text_es: 'Resistencia en el Estiramiento — ocho estiramientos sin detenerte, el doble de lo normal.<ul><li>La mano empieza a cansarse cerca del sexto — esa es la parte que construye fuerza</li><li>El dolor es distinto del esfuerzo: si duele, DETENTE</li></ul>Lo tienes cuando: ocho estiramientos sin detenerte y el dedo 1 nunca se levanta.',
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
        label:    'Record attempt',
        label_es: 'Intento de récord',
        text: 'Record attempt.<ul><li>Set the BPM to your record; go up by 10 every clean set</li><li>A set breaks down? The last clean number is your new record</li><li>Write it down</li></ul>You\'ve got it when: you\'ve written down a number and you know whether it beat the old one.',
        text_es: 'Intento de récord.<ul><li>Pon el BPM en tu récord; súbelo 10 puntos con cada serie limpia</li><li>¿Se rompió una serie? El último número limpio es tu récord nuevo</li><li>Anótalo</li></ul>Lo tienes cuando: anotaste un número y sabes si superó el anterior.',
      },
    ],
  },
  {
    id:    'ca-8',
    number: 1,
    title:    'Happy Birthday — First Notes',
    title_es: 'Happy Birthday — Primeras notas',
    intro:    'You can already pluck the open strings. Today you press one down: one string, one phrase, and the dots on the neck show you where to land.',
    intro_es: 'Ya sabes tocar las cuerdas al aire. Hoy vas a pisar una: una cuerda, una frase y los puntos del mástil te muestran dónde caer.',
    steps: [
      {
        label:    'The low E string',
        label_es: 'La cuerda Mi grave',
        figure: 'img/ca-hb-low-e.svg',
        figureAlt: 'Low E string fretboard diagram showing open string, fret 2 (F#), fret 4 (G#), and fret 5 (A), with faint landing-mark dots at frets 3, 5, 7, 9, and 12.',
        figureAlt_es: 'Diagrama del diapasón de la cuerda Mi grave mostrando la cuerda al aire, el traste 2 (F#), el traste 4 (G#) y el traste 5 (A), con puntos tenues de referencia en los trastes 3, 5, 7, 9 y 12.',
        text: 'This is the low E string — the thick one, closest to your face.<ul><li>The whole phrase lives here: open (0 = no finger) is E, fret 2 is F#, fret 4 is G#, fret 5 is A</li><li>The faint dots — frets 3, 5, 7, 9 and 12 — are a map; the dot at fret 5 is your landing mark</li></ul>',
        text_es: 'Esta es la cuerda Mi grave — la más gruesa, la que queda más cerca de tu cara.<ul><li>Toda la frase vive aquí: al aire (0 = sin dedo) es E, el traste 2 es F#, el traste 4 es G# y el traste 5 es A</li><li>Los puntos tenues — trastes 3, 5, 7, 9 y 12 — son un mapa; el punto del traste 5 es tu marca para caer</li></ul>',
      },
      {
        label:    'Land on fret 5',
        label_es: 'Cae en el traste 5',
        text: '<ol><li>Put your fingertip just behind fret 5 — next to the metal strip, NOT on top of it. Thumb behind the neck.</li><li>Pluck it. A rattly, dead sound is a buzz — slide the fingertip closer to the fret and press again.</li><li>Pluck the open string, then land on fret 5 and pluck again. Let the dot catch your eye before your finger jumps.</li></ol>You\'ve got it when: three landings in a row on A ring clean, no buzz. Buzz twice? Slide the fingertip closer to the fret and press with the very tip.',
        text_es: '<ol><li>Pon la punta del dedo justo detrás del traste 5 — pegada a la barrita de metal, NO encima de ella. El pulgar detrás del mástil.</li><li>Púlsala. Un sonido que traquetea o suena apagado es un zumbido — desliza la punta del dedo más cerca del traste y presiona otra vez.</li><li>Pulsa la cuerda al aire, luego cae en el traste 5 y pulsa otra vez. Deja que el punto te llame la atención antes de que salte el dedo.</li></ol>Lo tienes cuando: tres caídas seguidas en A suenan limpias, sin zumbido. ¿Zumbó dos veces? Desliza la punta del dedo más cerca del traste y presiona con la puntita.',
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
        text: 'The first four notes: open, open, fret 2, open. Say the words while you play — "Hap-py birth-day."\nYou\'ve got it when: three clean reps in a row, no buzz. Buzz twice? Stop, fix the finger, then go again.',
        text_es: 'Las primeras cuatro notas: al aire, al aire, traste 2, al aire. Di las palabras mientras tocas — "Hap-py birth-day."\nLo tienes cuando: tres repeticiones limpias seguidas, sin zumbido. ¿Zumbó dos veces? Detente, arregla el dedo y vuelve a intentarlo.',
        tab: {
          caption: '"Hap-py birth-day" — the first four notes',
          caption_es: '"Hap-py birth-day" — las primeras cuatro notas',
          notes: [
            { string: 'E', fret: 0, note: 'E',  midi: 40 },
            { string: 'E', fret: 0, note: 'E',  midi: 40 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'E', fret: 0, note: 'E',  midi: 40 }
          ]
        },
      },
      {
        label:    'The first line',
        label_es: 'La primera línea',
        text: 'Put the first line together.<ul><li>Play the four notes you know — "Hap-py birth-day"</li><li>Add two for "to you": fret 5, then fret 4 right next door</li><li>Six notes — that\'s the first line of the song</li></ul>You\'ve got it when: three clean runs without stopping, saying the words as you play.',
        text_es: 'Arma la primera línea.<ul><li>Toca las cuatro notas que ya sabes — "Hap-py birth-day"</li><li>Agrega dos para "to you": traste 5 y luego traste 4, justo al lado</li><li>Seis notas — esa es la primera línea de la canción</li></ul>Lo tienes cuando: tres pasadas limpias sin detenerte, diciendo las palabras mientras tocas.',
        tab: {
          caption: 'Phrase 1 · all on the low E string',
          caption_es: 'Frase 1 · todo en la cuerda Mi grave',
          phrases: [
            {
              label: '"Hap-py birth-day to you"',
              label_es: '"Hap-py birth-day to you"',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 5, note: 'A',  midi: 45 },
                { string: 'E', fret: 4, note: 'G#', midi: 44 }
              ]
            }
          ]
        },
      },
      {
        label:    'Keep going',
        label_es: 'Sigue',
        text: 'Keep going — there\'s no set stopping point on this one.<ul><li>Set the player above to 60 BPM and play with the beat</li><li>Every clean pass: raise the BPM by 10</li><li>Fast already? Say each note\'s name as you land it — E, F#, G#, A</li></ul>You\'ve got it when: you\'ve raised the BPM twice without breaking down — then keep climbing.',
        text_es: 'Sigue — aquí no hay un punto de parada fijo.<ul><li>Pon el reproductor de arriba en 60 BPM y toca con el pulso</li><li>Cada pasada limpia: sube el BPM 10 puntos</li><li>¿Ya vas rápido? Di el nombre de cada nota al caer en ella — E, F#, G#, A</li></ul>Lo tienes cuando: ya subiste el BPM dos veces sin perder el ritmo — y de ahí, sigue subiendo.',
      },
    ],
  },
  {
    id:    'ca-10',
    number: 10,
    journey: 'seven-nation-army',   // the last step sends them to this Song Journey page — see JOURNEY below
    title:    'Seven Nation Army — The Riff',
    title_es: 'Seven Nation Army — El riff',
    intro:    'Your fingers trained for this. One riff, one string, seven notes — and five of them sit right on the neck dots you already know.',
    intro_es: 'Tus dedos entrenaron para esto. Un riff, una cuerda, siete notas — y cinco de ellas caen justo sobre los puntos del mástil que ya conoces.',
    steps: [
      {
        label:    'The riff map',
        label_es: 'El mapa del riff',
        figure: 'img/ca-sna-riff-map.svg',
        figureAlt: 'Diagram of the A string with the riff\'s notes circled at frets 2, 3, 5, 7, and 10, alongside the neck\'s landmark dots at frets 3, 5, 7, and 9.',
        figureAlt_es: 'Diagrama de la cuerda La con las notas del riff marcadas en círculo en los trastes 2, 3, 5, 7 y 10, junto con los puntos de referencia del mástil en los trastes 3, 5, 7 y 9.',
        text: 'This is where the riff lives: the A string — the one just below the thickest string. The circled letters are the riff\'s notes; the small gray dots between them are the neck\'s own landmark dots at frets 3, 5, 7, and 9.',
        text_es: 'Aquí vive el riff: la cuerda La — la que está justo debajo de la cuerda Mi grave. Las letras en círculo son las notas del riff; los puntos grises pequeños son las marcas del mástil en los trastes 3, 5, 7 y 9.',
      },
      {
        label:    'The opening call',
        label_es: 'La llamada inicial',
        text: 'The opening call: 7 – 7 – 10 – 7.<ul><li>finger 1 → fret 7 (the third dot) — play it twice</li><li>finger 1 stays planted; reach the pinky → fret 10, one fret past the 9-dot — this is the Reach from Finger Gym</li><li>back to fret 7</li></ul>The hard part: the pinky wants to drag finger 1 with it — finger 1 NEVER lifts.\nYou\'ve got it when: 7-7-10-7 three times in a row, no buzz.',
        text_es: 'La llamada inicial: 7 – 7 – 10 – 7.<ul><li>dedo 1 → traste 7 (el tercer punto) — tócalo dos veces</li><li>el dedo 1 se queda plantado; estira el meñique → traste 10, un traste después del punto del 9 — este es el Estiramiento del Gimnasio de Dedos</li><li>de vuelta al traste 7</li></ul>La parte difícil: el meñique quiere arrastrar al dedo 1 — el dedo 1 NUNCA se levanta.\nLo tienes cuando: 7-7-10-7 tres veces seguidas, sin zumbido.',
        tab: {
          caption: 'The call · finger 1 planted, pinky to 10',
          caption_es: 'La llamada · dedo 1 plantado, meñique al 10',
          notes: [
            { string: 'A', fret: 7,  note: 'E', midi: 52 },
            { string: 'A', fret: 7,  note: 'E', midi: 52 },
            { string: 'A', fret: 10, note: 'G', midi: 55 },
            { string: 'A', fret: 7,  note: 'E', midi: 52 }
          ]
        },
      },
      {
        label:    'The walk-down',
        label_es: 'El descenso',
        text: 'The walk-down: 7 – 5 – 3 – 2. Finger 1 does all of it, sliding down the string.<ul><li>finger 1 → fret 7, then → fret 5, then → fret 3 — dot to dot to dot</li><li>finger 1 → fret 2 — the only landing without a dot</li></ul>You\'ve got it when: 7-5-3-2 three clean passes in a row, no buzz.',
        text_es: 'El descenso: 7 – 5 – 3 – 2. El dedo 1 lo hace todo, deslizándose por la cuerda.<ul><li>dedo 1 → traste 7, después → traste 5, después → traste 3 — de punto en punto</li><li>dedo 1 → traste 2 — la única parada sin punto</li></ul>Lo tienes cuando: 7-5-3-2, tres pasadas limpias seguidas, sin zumbido.',
        tab: {
          caption: 'The walk-down · dot to dot',
          caption_es: 'El descenso · de punto en punto',
          notes: [
            { string: 'A', fret: 7, note: 'E', midi: 52 },
            { string: 'A', fret: 5, note: 'D', midi: 50 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 2, note: 'B', midi: 47 }
          ]
        },
      },
      {
        label:    'The whole riff',
        label_es: 'El riff completo',
        text: 'Put it together — the whole riff, straight through without stopping: 7 – 7 – 10 – 7 – 5 – 3 – 2.\nYou\'ve got it when: four times through without stopping, any speed.',
        text_es: 'Júntalo todo — el riff completo, seguido sin parar: 7 – 7 – 10 – 7 – 5 – 3 – 2.\nLo tienes cuando: cuatro veces seguidas sin detenerte, a cualquier velocidad.',
        snippet: { track: 'seven-nation-army', fromBar: 1, bars: 4,
                   label:    'The riff, with the band',
                   label_es: 'El riff, con la banda' },
        tab: {
          caption: 'The whole riff · 7-7-10-7-5-3-2',
          caption_es: 'El riff completo · 7-7-10-7-5-3-2',
          notes: [
            { string: 'A', fret: 7,  note: 'E', midi: 52 },
            { string: 'A', fret: 7,  note: 'E', midi: 52 },
            { string: 'A', fret: 10, note: 'G', midi: 55 },
            { string: 'A', fret: 7,  note: 'E', midi: 52 },
            { string: 'A', fret: 5,  note: 'D', midi: 50 },
            { string: 'A', fret: 3,  note: 'C', midi: 48 },
            { string: 'A', fret: 2,  note: 'B', midi: 47 }
          ]
        },
      },
      {
        label:    'Raise the tempo',
        label_es: 'Sube el tempo',
        snippet: { track: 'seven-nation-army', fromBar: 1, bars: 8,
                   label:    'Four laps with the band',
                   label_es: 'Cuatro vueltas con la banda' },
        text: 'Raise the tempo.<ul><li>Every clean pass: raise the BPM by 10 and go again</li><li>Playing it fast already? Add the feel — hold the first E long, and the last two notes long.</li><li>Then open the Seven Nation Army Song Journey page and play it over the backing track</li></ul>You\'ve got it when: you\'ve raised the tempo at least three times without breaking down — then keep climbing.',
        text_es: 'Sube el tempo.<ul><li>Cada pasada limpia: sube el BPM 10 puntos y vuelve a intentarlo</li><li>¿Ya lo tocas rápido? Dale la sensación — sostén más el primer E, y sostén más las últimas dos notas.</li><li>Después abre el Recorrido de la canción de Seven Nation Army y tócalo sobre la pista de acompañamiento</li></ul>Lo tienes cuando: subiste el tempo al menos tres veces sin perder el ritmo — y de ahí, sigue subiendo.',
      },
    ],
  },
  {
    id:    'ca-11',
    number: 4,
    title:    'Notes on the Low E String',
    title_es: 'Notas en la cuerda Mi grave',
    intro:    'You\'ve been landing on frets for Happy Birthday. Today those landings get names — every natural note on the low E string, from open E to the E at fret 12.',
    intro_es: 'Ya has estado cayendo en trastes para Happy Birthday. Hoy esas caídas reciben nombres — todas las notas naturales de la cuerda Mi grave, desde E al aire hasta E en el traste 12.',
    steps: [
      {
        label:    'The note map',
        label_es: 'El mapa de notas',
        figure: 'img/ca-lowe-naturals.svg',
        figureAlt: 'Low E string fretboard diagram with every natural note circled — E, F, G, A, B, C, D, E — from the open string up to the octave at fret 12.',
        figureAlt_es: 'Diagrama del diapasón de la cuerda Mi grave con cada nota natural marcada en círculo — E, F, G, A, B, C, D, E — desde la cuerda al aire hasta la octava en el traste 12.',
        text: 'This is the low E string — the thick one — with its natural notes circled: the plain letter names, no sharps.<ul><li>E F G A B C D E: it starts on open E (0 = no finger) and lands on E again at fret 12 — same name, higher sound. That repeat is called an octave</li><li>The neck dots are your map: the dots at frets 3, 5 and 7 carry G, A and B, and the double dot at 12 is E again, an octave up</li></ul>',
        text_es: 'Esta es la cuerda Mi grave — la más gruesa — con sus notas naturales en círculos: los nombres de letra simples, sin sostenidos.<ul><li>E F G A B C D E: empieza al aire (0 = sin dedo) con E y vuelve a caer en E en el traste 12 — mismo nombre, sonido más agudo. Esa repetición se llama octava</li><li>Los puntos del mástil son tu mapa: los puntos de los trastes 3, 5 y 7 llevan G, A y B, y el punto doble del 12 es E otra vez, una octava arriba</li></ul>',
      },
      {
        label:    'The dot notes',
        label_es: 'Las notas de los puntos',
        text: 'Start with the dot notes — the four easiest to find.<ol><li>Pluck the open string and say "E" out loud while it rings</li><li>Fingertip just behind fret 3 — the first dot — pluck and say "G"</li><li>Dot at fret 5: "A". Dot at fret 7: "B"</li></ol>Saying the name while the note rings is the memorizing — don\'t skip it.\nYou\'ve got it when: E–G–A–B in order, out loud, without looking at the diagram. Missed a name? Look once, then start again from open E.',
        text_es: 'Empieza con las notas de los puntos — las cuatro más fáciles de encontrar.<ol><li>Pulsa la cuerda al aire y di "E" en voz alta mientras suena</li><li>La punta del dedo justo detrás del traste 3 — el primer punto — pulsa y di "G"</li><li>Punto del traste 5: "A". Punto del traste 7: "B"</li></ol>Decir el nombre mientras la nota suena es lo que la graba en la memoria — no te lo saltes.\nLo tienes cuando: E–G–A–B en orden, en voz alta, sin mirar el diagrama. ¿Fallaste un nombre? Mira una vez y empieza de nuevo desde la cuerda al aire.',
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
        text: 'Four more fill in the row.<ul><li>F at fret 1 — right next door to open E</li><li>C at fret 8 — one fret past the 7-dot</li><li>D at fret 10 — one past the 9-dot</li><li>E at fret 12 — the double dot, back where you started</li></ul>Walk the whole string up and back with the player, saying every name as you land it.\nYou\'ve got it when: up and down — E F G A B C D E and back — without stopping, every name out loud. Lost the thread? Find the nearest dot note and restart from there.',
        text_es: 'Cuatro más completan la fila.<ul><li>F en el traste 1 — justo al lado de la cuerda al aire</li><li>C en el traste 8 — un traste después del punto del 7</li><li>D en el traste 10 — uno después del punto del 9</li><li>E en el traste 12 — el punto doble, de vuelta a donde empezaste</li></ul>Recorre toda la cuerda subiendo y bajando con el reproductor, diciendo el nombre de cada nota al caer en ella.\nLo tienes cuando: subes y bajas — E F G A B C D E y de regreso — sin detenerte, cada nombre en voz alta. ¿Perdiste el hilo? Busca la nota del punto más cercano y arranca de ahí otra vez.',
        tab: {
          caption: 'The whole octave · up and back',
          caption_es: 'La octava completa · subir y bajar',
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
        text: 'Try naming the notes without looking at the diagram — the quiz deals you a fret and you name the note, eight seconds a card.<ol><li>Diagram covered, guitar in your lap</li><li>Say the note out loud, then press its button — saying it is the skill</li></ol>You\'ve got it when: 7 of 10 on your first pass. Once that\'s easy, push for 9 of 10. A couple of frets tripping you? The results screen lists exactly which — run it again watching for those.',
        text_es: 'Prueba diciendo los nombres sin mirar el diagrama — el juego te reparte un traste y tú dices la nota, ocho segundos por carta.<ol><li>Diagrama tapado, guitarra en las piernas</li><li>Di la nota en voz alta y después presiona su botón — decirla es la habilidad</li></ol>Lo tienes cuando: 7 de 10 en tu primera pasada. Cuando eso te resulte fácil, ve por 9 de 10. ¿Hay un par de trastes que te traban? La pantalla de resultados te dice cuáles — repite el juego vigilando esos.',
        drill: { type: 'shuffle', string: 'lowE', maxFret: 12, rounds: 10, seconds: 8, pile: 'naturals' },
      },
      {
        label:    'Find the note',
        label_es: 'Encuentra la nota',
        text: 'Flip it around and put it in your hands — the deck deals you a note name, and you go find it on the string.<ol><li>Cover the diagram above, or scroll it off the screen</li><li>Deal a card, land on that note, pluck it. Next card once it rings clean</li><li>Lift your hand off the neck between cards, so every landing starts from nothing</li><li>E lives in two places — fret 0 and fret 12. Either one counts</li></ol>You\'ve got it when: five cards in a row, no peeking, no buzz. Had to peek? Deal that one again before you move on.',
        text_es: 'Dale la vuelta y llévalo a las manos — el mazo te reparte el nombre de una nota, y tú la buscas en la cuerda.<ol><li>Tapa el diagrama de arriba, o desplázalo fuera de la pantalla</li><li>Reparte una carta, cae en esa nota y púlsala. Otra carta cuando suene limpia</li><li>Levanta la mano del mástil entre carta y carta, para que cada caída empiece desde cero</li><li>E vive en dos lugares — traste 0 y traste 12. Cualquiera de los dos cuenta</li></ol>Lo tienes cuando: cinco cartas seguidas, sin mirar, sin zumbido. ¿Tuviste que mirar? Reparte esa otra vez antes de seguir.',
        drill: { type: 'deck', deck: 'naturals' },
      },
      {
        label:    'Keep going',
        label_es: 'Sigue',
        text: 'Keep going — there is no set stopping point here.<ul><li>Set the player above to 60 BPM and land one note per beat, up and back</li><li>Every clean pass: raise the BPM by 10</li><li>Fast already? Say the names backwards — E D C B A G F E, from the double dot down</li><li>Then quiz a partner and catch their misses</li></ul>You\'ve got it when: you\'ve cleared a full pass at a faster BPM than you started — then keep climbing.',
        text_es: 'Sigue — aquí no hay un punto de parada fijo.<ul><li>Pon el reproductor de arriba en 60 BPM y cae en una nota por tiempo, subiendo y bajando</li><li>Cada pasada limpia: sube el BPM 10 puntos</li><li>¿Ya vas rápido? Di los nombres al revés — E D C B A G F E, desde el punto doble hacia abajo</li><li>Después ponle una prueba a un compañero y atrapa sus fallos</li></ul>Lo tienes cuando: ya completaste una pasada entera a un BPM más alto que al empezar — y de ahí, sigue subiendo.',
      },
    ],
  },
  /* The A-string twin of ca-11 (Notes on the Low E String), same ladder —
     map, dot notes, the full row, name-the-fret quiz, find-the-note deck —
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
    intro:    'You already know the names on the low E string, and you play Happy Birthday start to finish on it. Today the A string gets names too — every natural note from open A to the A at fret 12. Then you put those names to work: a second way to play Happy Birthday that crosses to the A string and never leaves the first seven frets.',
    intro_es: 'Ya conoces los nombres de la cuerda Mi grave, y tocas Happy Birthday de principio a fin en ella. Hoy la cuerda La también recibe nombres — todas las notas naturales desde A al aire hasta A en el traste 12. Después pones esos nombres a trabajar: una segunda forma de tocar Happy Birthday que cruza a la cuerda La y nunca se sale de los primeros siete trastes.',
    steps: [
      {
        label:    'Read the map',
        label_es: 'Lee el mapa',
        figure: 'img/ca-a-naturals.svg',
        figureAlt: 'A string fretboard diagram with every natural note circled — A, B, C, D, E, F, G, A — from the open string up to the octave at fret 12.',
        figureAlt_es: 'Diagrama del diapasón de la cuerda La con cada nota natural marcada en círculo — A, B, C, D, E, F, G, A — desde la cuerda al aire hasta la octava en el traste 12.',
        text: 'This is the A string — one string down from the low E, the second-thickest — with its natural notes circled: the plain letter names, no sharps.<ul><li>A B C D E F G A: starts on open A and lands on A again at fret 12, an octave higher</li><li>The dots at frets 3, 5 and 7 carry C, D and E; the double dot at 12 is A again</li><li>Same seven letters as the low E string, just starting on a different one</li></ul>',
        text_es: 'Esta es la cuerda La — la que está justo debajo de la cuerda Mi grave, la segunda más gruesa — con sus notas naturales en círculos: los nombres de letra simples, sin sostenidos.<ul><li>A B C D E F G A: empieza al aire y vuelve a caer en A en el traste 12, una octava más arriba</li><li>Los puntos de los trastes 3, 5 y 7 llevan C, D y E; el punto doble del 12 es A otra vez</li><li>Las mismas siete letras que en la cuerda Mi grave, esta cuerda solo empieza en otra</li></ul>',
      },
      {
        label:    'Learn the notes',
        label_es: 'Aprende las notas',
        text: 'Name every natural note on the A string — same seven letters as the low E string, starting on a different one.<ol><li>Dot notes first: open A, "C" at fret 3, "D" at fret 5, "E" at fret 7 — say each name while it rings</li><li>Fill in the rest: B at fret 2, F at fret 8, G at fret 10, A at fret 12</li><li>Walk the whole string up and back, naming every note as you land it</li></ol>You\'ve got it when: up and down — A B C D E F G A and back — without stopping, every name out loud.',
        text_es: 'Nombra cada nota natural de la cuerda La — las mismas siete letras que en la cuerda Mi grave, empezando en otra.<ol><li>Primero las notas de los puntos: A al aire, "C" en el traste 3, "D" en el traste 5, "E" en el traste 7 — di cada nombre mientras suena</li><li>Completa el resto: B en el traste 2, F en el traste 8, G en el traste 10, A en el traste 12</li><li>Recorre toda la cuerda subiendo y bajando, diciendo el nombre de cada nota al caer en ella</li></ol>Lo tienes cuando: subes y bajas — A B C D E F G A y de regreso — sin detenerte, cada nombre en voz alta.',
        tab: {
          caption: 'The dot notes, then the whole octave up and back',
          caption_es: 'Las notas de los puntos, y después la octava completa',
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
        text: 'Try naming the notes without looking — the quiz deals you a fret on the A string, eight seconds a card.<ol><li>Diagram covered, guitar in your lap</li><li>Say the note out loud, then press its button</li></ol>You\'ve got it when: 7 of 10 on your first pass. Once that\'s easy, push for 9 of 10.',
        text_es: 'Prueba diciendo los nombres sin mirar — el juego te reparte un traste de la cuerda La, ocho segundos por carta.<ol><li>Diagrama tapado, guitarra en las piernas</li><li>Di la nota en voz alta y después presiona su botón</li></ol>Lo tienes cuando: 7 de 10 en tu primera pasada. Cuando eso te resulte fácil, ve por 9 de 10.',
        drill: { type: 'shuffle', string: 'A', maxFret: 12, rounds: 10, seconds: 8, pile: 'naturals' },
      },
      {
        label:    'Find the note',
        label_es: 'Encuentra la nota',
        text: 'The deck deals you a note name — find it on the A string and pluck it.<ol><li>Cover the diagram above, or scroll it off the screen</li><li>Deal a card, land on that note, pluck it. Next card once it rings clean</li><li>Lift your hand off the neck between cards, so every landing starts from nothing</li><li>A lives in two places — fret 0 and fret 12. Either counts</li></ol>You\'ve got it when: five cards in a row, no peeking, no buzz. Had to peek? Deal that one again.',
        text_es: 'El mazo te reparte el nombre de una nota — búscala en la cuerda La y púlsala.<ol><li>Tapa el diagrama de arriba, o desplázalo fuera de la pantalla</li><li>Reparte una carta, cae en esa nota, púlsala. Otra carta cuando suene limpia</li><li>Levanta la mano del mástil entre carta y carta, para que cada caída empiece desde cero</li><li>A vive en dos lugares — traste 0 y traste 12. Cualquiera cuenta</li></ol>Lo tienes cuando: cinco cartas seguidas, sin mirar, sin zumbido. ¿Tuviste que mirar? Reparte esa otra vez.',
        drill: { type: 'deck', deck: 'naturals' },
      },
      {
        label:    'Cross the strings',
        label_es: 'Cruza las cuerdas',
        figure: 'img/ca-hb-a.svg',
        figureAlt: 'Fretboard diagram comparing the low E and A strings, showing the same landing frets — 2, 4, 5, and 7 — mirrored on the A string.',
        figureAlt_es: 'Diagrama del diapasón comparando las cuerdas Mi grave y La, mostrando los mismos trastes de referencia — 2, 4, 5 y 7 — reflejados en la cuerda La.',
        text: 'Take the A string into Happy Birthday — same frets as the low E version (2, 4, 5, 7), but no trip up to fret 12.<ul><li>Pluck the open low E, then the open A, back and forth — no fretting hand yet</li><li>Only one string should ring each pluck. Both sound? Slow down and watch the pick</li></ul>You\'ve got it when: low E, A, low E, A — three clean reps, one string per pluck.',
        text_es: 'Lleva la cuerda La a Happy Birthday — los mismos trastes que en la versión de la Mi grave (2, 4, 5, 7), pero sin el viaje hasta el traste 12.<ul><li>Pulsa la cuerda Mi grave al aire, luego la cuerda La al aire, ida y vuelta — todavía sin la mano de trastear</li><li>Solo debe sonar una cuerda por pulsación. ¿Suenan las dos? Ve más despacio y mira la púa</li></ul>Lo tienes cuando: cuerda Mi grave, cuerda La, cuerda Mi grave, cuerda La — tres repeticiones limpias, una cuerda por pulsación.',
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
        label:    'Phrases C and D',
        label_es: 'Frases C y D',
        figure: 'img/ca-hb-fingers-a.svg',
        figureAlt: 'Diagram of the fretting hand on the A string for phrases C and D, showing finger 4 at fret 7, finger 3 at fret 4, and the string crossing back to the low E string.',
        figureAlt_es: 'Diagrama de la mano de trastear en la cuerda La para las frases C y D, mostrando el dedo 4 en el traste 7, el dedo 3 en el traste 4 y el cruce de regreso a la cuerda Mi grave.',
        text: 'Phrases C and D, now on the A string — every note stays inside the first seven frets.<ul><li>Phrase C: open low E twice, then your hand reaches up for finger 4 on fret 7 of the A string and comes straight back down for finger 3 on fret 4, open A, then across to the low E for frets 4 and 2</li><li>Phrase D stays on the A string, with your hand back down where finger 1 sits on fret 2 — frets 5, 5, 4, open, 2, open</li><li>C♯ ("C sharp"), fret 4, is the one new name — one fret above C</li></ul>You\'ve got it when: phrase C into phrase D, three clean runs, no hunting for the string.',
        text_es: 'Frases C y D, ahora en la cuerda La — todas las notas se quedan dentro de los primeros siete trastes.<ul><li>Frase C: Mi grave al aire dos veces, y luego la mano sube por el dedo 4 en el traste 7 de la cuerda La y baja de inmediato al dedo 3 en el traste 4, La al aire, y cruza a la Mi grave para el 4 y el 2</li><li>La frase D se queda en la cuerda La, con la mano otra vez abajo, donde el dedo 1 va en el traste 2 — trastes 5, 5, 4, al aire, 2, al aire</li><li>C♯ ("C sostenido"), traste 4, es el único nombre nuevo — un traste arriba de C</li></ul>Lo tienes cuando: de la frase C a la frase D, tres pasadas limpias, sin andar buscando la cuerda.',
        tab: {
          caption: 'Second half · the A-string way',
          caption_es: 'Segunda mitad · la versión con la cuerda La',
          phrases: [
            {
              label: 'Phrase C — "Hap-py birth-day dear ______"',
              label_es: 'Frase C — "Hap-py birth-day dear ______"',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'A', fret: 7, note: 'E',  midi: 52 },
                { string: 'A', fret: 4, note: 'C#', midi: 49 },
                { string: 'A', fret: 0, note: 'A',  midi: 45 },
                { string: 'E', fret: 4, note: 'G#', midi: 44 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 }
              ]
            },
            {
              label: 'Phrase D — "Hap-py birth-day to you"',
              label_es: 'Frase D — "Hap-py birth-day to you"',
              notes: [
                { string: 'A', fret: 5, note: 'D',  midi: 50 },
                { string: 'A', fret: 5, note: 'D',  midi: 50 },
                { string: 'A', fret: 4, note: 'C#', midi: 49 },
                { string: 'A', fret: 0, note: 'A',  midi: 45 },
                { string: 'A', fret: 2, note: 'B',  midi: 47 },
                { string: 'A', fret: 0, note: 'A',  midi: 45 }
              ]
            }
          ]
        },
      },
      {
        label:    'The whole song',
        label_es: 'La canción completa',
        text: 'The whole song the A-string way — phrases A and B stay on the low E, C and D cross to the A string. Start at BPM 70.<ul><li>Say each A-string note out loud as you land it: E, C♯, A in phrase C, then D, D, C♯, A, B, A in phrase D</li><li>Every clean pass, raise the BPM by 10 — then play it for the person next to you</li></ul>You\'ve got it when: the whole song without stopping, every A-string note named out loud — then keep climbing.',
        text_es: 'La canción completa en la versión con la cuerda La — las frases A y B se quedan en la Mi grave, C y D cruzan a la cuerda La. Empieza en BPM 70.<ul><li>Di en voz alta cada nota de la cuerda La al caer en ella: E, C♯, A en la frase C, y luego D, D, C♯, A, B, A en la frase D</li><li>Cada pasada limpia, sube el BPM 10 puntos — y después tócala para la persona de al lado</li></ul>Lo tienes cuando: la canción completa sin detenerte, nombrando en voz alta cada nota de la cuerda La — y de ahí, sigue subiendo.',
        tab: {
          caption: 'Whole song · phrases A–D · low E and A strings',
          caption_es: 'Canción completa · frases A–D · cuerdas Mi grave y La',
          phrases: [
            {
              label: 'Phrase A — "Hap-py birth-day to you"',
              label_es: 'Frase A — "Hap-py birth-day to you"',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 5, note: 'A',  midi: 45 },
                { string: 'E', fret: 4, note: 'G#', midi: 44 }
              ]
            },
            {
              label: 'Phrase B — "Hap-py birth-day to you" (the ending climbs higher)',
              label_es: 'Frase B — "Hap-py birth-day to you" (el final sube más alto)',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 7, note: 'B',  midi: 47 },
                { string: 'E', fret: 5, note: 'A',  midi: 45 }
              ]
            },
            {
              label: 'Phrase C — "Hap-py birth-day dear ______"',
              label_es: 'Frase C — "Hap-py birth-day dear ______"',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'A', fret: 7, note: 'E',  midi: 52 },
                { string: 'A', fret: 4, note: 'C#', midi: 49 },
                { string: 'A', fret: 0, note: 'A',  midi: 45 },
                { string: 'E', fret: 4, note: 'G#', midi: 44 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 }
              ]
            },
            {
              label: 'Phrase D — "Hap-py birth-day to you"',
              label_es: 'Frase D — "Hap-py birth-day to you"',
              notes: [
                { string: 'A', fret: 5, note: 'D',  midi: 50 },
                { string: 'A', fret: 5, note: 'D',  midi: 50 },
                { string: 'A', fret: 4, note: 'C#', midi: 49 },
                { string: 'A', fret: 0, note: 'A',  midi: 45 },
                { string: 'A', fret: 2, note: 'B',  midi: 47 },
                { string: 'A', fret: 0, note: 'A',  midi: 45 }
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
    intro:    'Your teacher is out today, so this one runs itself: seven stops, in order. Everything on it you have already met — today you do it on your own.',
    intro_es: 'Hoy tu maestro no está, así que este circuito se maneja solo: siete paradas, en orden. Todo lo de aquí ya lo conociste — hoy lo haces por tu cuenta.',
    steps: [
      {
        label:    'Read the map',
        label_es: 'Lee el mapa',
        figure: 'img/ca-lowe-naturals.svg',
        figureAlt: 'Low E string fretboard diagram with every natural note circled — E, F, G, A, B, C, D, E — from the open string up to the octave at fret 12.',
        figureAlt_es: 'Diagrama del diapasón de la cuerda Mi grave con cada nota natural marcada en círculo — E, F, G, A, B, C, D, E — desde la cuerda al aire hasta la octava en el traste 12.',
        text: 'The low E string, with its natural notes circled — no sharps.<ul><li>E F G A B C D E, open string up to fret 12</li><li>The dots at 3, 5 and 7 are G, A and B. The double dot at 12 is E again</li></ul>Read it once, then cover it. The next two stops test it.',
        text_es: 'La cuerda Mi grave, con sus notas naturales en círculos — sin sostenidos.<ul><li>E F G A B C D E, de la cuerda al aire al traste 12</li><li>Los puntos del 3, el 5 y el 7 son G, A y B. El punto doble del 12 es E otra vez</li></ul>Léelo una vez y después tápalo. Las dos paradas que siguen lo prueban.',
      },
      {
        label:    'Name the fret',
        label_es: 'Di la nota',
        text: 'The quiz gives you a fret. You name the note, eight seconds a card.<ul><li>Diagram covered</li><li>Say the note out loud, then press its button</li></ul>You\'ve got it when: 7 of 10 on your first pass. Once that\'s easy, push for 9 of 10. Missing some? The results screen names them — run it again.',
        text_es: 'El juego te da un traste. Tú dices la nota, ocho segundos por carta.<ul><li>Diagrama tapado</li><li>Di la nota en voz alta, y después presiona su botón</li></ul>Lo tienes cuando: 7 de 10 en tu primera pasada. Cuando eso te resulte fácil, ve por 9 de 10. ¿Fallas algunas? La pantalla de resultados te dice cuáles — repítelo.',
        drill: { type: 'shuffle', string: 'lowE', maxFret: 12, rounds: 10, seconds: 8, pile: 'naturals' },
      },
      {
        label:    'Find the note',
        label_es: 'Encuentra la nota',
        text: 'Backwards this time: the deck gives you a note name, you find it on the string.<ul><li>Deal a card, land on that note, pluck it</li><li>Hand off the neck between cards</li><li>E works at fret 0 or fret 12</li></ul>You\'ve got it when: five in a row, no peeking, no buzz. Peeked? Deal that one again.',
        text_es: 'Al revés esta vez: el mazo te da el nombre de una nota, y tú la encuentras en la cuerda.<ul><li>Reparte una carta, cae en esa nota y púlsala</li><li>Mano fuera del mástil entre carta y carta</li><li>E sirve en el traste 0 o en el 12</li></ul>Lo tienes cuando: cinco seguidas, sin mirar, sin zumbido. ¿Miraste? Reparte esa otra vez.',
        drill: { type: 'deck', deck: 'naturals' },
      },
      {
        label:    'Tune it back',
        label_es: 'Vuelve a afinar',
        text: 'Loosen the low E string only, about half a turn, then bring it back up to pitch. Just the one string — nobody is in the room to help if six strings go out at once.<ol><li>Clip the tuner on. Start a timer at 1:00</li><li>Pluck the low E string, loosen the peg a little, pluck again</li><li>Once it\'s flat, tune it back up. Too sharp coming back? Loosen below the note and come back up — never keep tightening past it</li></ol>You\'ve got it when: the low E string reads its right letter in green, inside 1:00. Out of time? Reset and go again.',
        text_es: 'Afloja solo la cuerda Mi grave, más o menos media vuelta, y después vuelve a subirla a su nota. Solo esa cuerda — no hay nadie en el salón para ayudarte si las seis cuerdas se desafinan a la vez.<ol><li>Pon el afinador de pinza. Arranca un temporizador en 1:00</li><li>Pulsa la cuerda Mi grave, afloja la clavija un poco, pulsa otra vez</li><li>Cuando esté grave, vuelve a subirla. ¿Se pasó de aguda al subir? Afloja por debajo de la nota y sube de nuevo hasta ella — nunca sigas apretando de más</li></ol>Lo tienes cuando: la cuerda Mi grave marca su letra correcta en verde, dentro de 1:00. ¿Se acabó el tiempo? Reinicia y hazlo otra vez.',
      },
      {
        label:    'Play it from memory',
        label_es: 'Tócala de memoria',
        text: 'Happy Birthday, all four phrases, low E string. Play it once with the tab, then cover the screen and play it again from memory.<ul><li>A: open, open, 2, open, 5, 4</li><li>B: open, open, 2, open, 7, 5</li><li>C: open, open, 12, 9, 5, 4, 2</li><li>D: 10, 10, 9, 5, 7, 5</li></ul>The A-string version counts too.\nYou\'ve got it when: all four phrases from memory, any speed, without stopping. Stuck? Uncover that one phrase, then start over.',
        text_es: 'Happy Birthday, las cuatro frases, cuerda Mi grave. Tócala una vez con la tablatura, después tapa la pantalla y tócala de memoria.<ul><li>A: al aire, al aire, 2, al aire, 5, 4</li><li>B: al aire, al aire, 2, al aire, 7, 5</li><li>C: al aire, al aire, 12, 9, 5, 4, 2</li><li>D: 10, 10, 9, 5, 7, 5</li></ul>La versión con la cuerda La también cuenta.\nLo tienes cuando: las cuatro frases de memoria, a cualquier velocidad, sin detenerte. ¿Te atoraste? Destapa solo esa frase y empieza otra vez.',
        tab: {
          caption: 'Whole song · phrases A–D · low E string only',
          caption_es: 'Canción completa · frases A–D · solo la cuerda Mi grave',
          phrases: [
            {
              label: 'Phrase A — "Hap-py birth-day to you"',
              label_es: 'Frase A — "Hap-py birth-day to you"',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 5, note: 'A',  midi: 45 },
                { string: 'E', fret: 4, note: 'G#', midi: 44 }
              ]
            },
            {
              label: 'Phrase B — "Hap-py birth-day to you" (the ending climbs higher)',
              label_es: 'Frase B — "Hap-py birth-day to you" (el final sube más alto)',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 7, note: 'B',  midi: 47 },
                { string: 'E', fret: 5, note: 'A',  midi: 45 }
              ]
            },
            {
              label: 'Phrase C — "Hap-py birth-day dear ______"',
              label_es: 'Frase C — "Hap-py birth-day dear ______"',
              notes: [
                { string: 'E', fret: 0,  note: 'E',  midi: 40 },
                { string: 'E', fret: 0,  note: 'E',  midi: 40 },
                { string: 'E', fret: 12, note: 'E',  midi: 52 },
                { string: 'E', fret: 9,  note: 'C#', midi: 49 },
                { string: 'E', fret: 5,  note: 'A',  midi: 45 },
                { string: 'E', fret: 4,  note: 'G#', midi: 44 },
                { string: 'E', fret: 2,  note: 'F#', midi: 42 }
              ]
            },
            {
              label: 'Phrase D — "Hap-py birth-day to you"',
              label_es: 'Frase D — "Hap-py birth-day to you"',
              notes: [
                { string: 'E', fret: 10, note: 'D',  midi: 50 },
                { string: 'E', fret: 10, note: 'D',  midi: 50 },
                { string: 'E', fret: 9,  note: 'C#', midi: 49 },
                { string: 'E', fret: 5,  note: 'A',  midi: 45 },
                { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                { string: 'E', fret: 5,  note: 'A',  midi: 45 }
              ]
            }
          ]
        },
      },
      {
        label:    'Clean it up',
        label_es: 'Límpiala',
        text: 'From memory again, listening this time.<ul><li>Fingertip right behind the fret</li><li>One string per pluck</li><li>Hold each finger down until the next note starts, so the notes ring into each other</li></ul>You\'ve got it when: a full pass from memory, no buzz, no extra string. One note buzzing? Play it ten times alone, moving closer to the fret.',
        text_es: 'De memoria otra vez, ahora escuchando.<ul><li>La punta del dedo justo detrás del traste</li><li>Una cuerda por pulsación</li><li>Deja cada dedo puesto hasta que empiece la nota siguiente, para que las notas se enlacen</li></ul>Lo tienes cuando: una pasada entera de memoria, sin zumbido, sin cuerda de más. ¿Zumba una nota? Tócala sola diez veces, acercándote al traste.',
      },
      {
        label:    'Keep going',
        label_es: 'Sigue',
        text: 'There is no set stopping point here. Pick one and keep working:<ul><li>Happy Birthday at 60 BPM, one note per beat. Every clean pass, add 10</li><li>An activity you never finished</li><li>The next section of your module</li><li>Teach the note names to someone at your table and quiz them</li></ul>You\'ve got it when: you\'ve cleared a pass at a faster BPM than you started — then keep climbing.',
        text_es: 'Aquí no hay un punto de parada fijo. Escoge uno y sigue trabajando:<ul><li>Happy Birthday a 60 BPM, una nota por tiempo. Cada pasada limpia, súbele 10</li><li>Una actividad que nunca terminaste</li><li>La sección que sigue de tu módulo</li><li>Enséñale los nombres de las notas a alguien de tu mesa y ponle una prueba</li></ul>Lo tienes cuando: completaste una pasada a un BPM más alto que al empezar — y de ahí, sigue subiendo.',
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
    intro:    'Watchtower lives on the low E string, and so does this. Every chord in "the cure" has a root note; play the roots and you\'re playing the song\'s bassline. Three notes, one string, and one finger plays them all.',
    intro_es: 'Watchtower vive en la cuerda Mi grave, y esta también. Cada acorde de "the cure" tiene una nota raíz; toca las raíces y estás tocando la línea de bajo de la canción. Tres notas, una cuerda, y un solo dedo las toca todas.',
    steps: [
      {
        label:    'The map — one string, three notes',
        label_es: 'El mapa — una cuerda, tres notas',
        figure: 'img/ca-cure-roots-verse.svg',
        figureAlt: 'Low E string fretboard diagram marking the three root notes: F at fret 1, A at fret 5, and C at fret 8.',
        figureAlt_es: 'Diagrama del diapasón de la cuerda Mi grave marcando las tres notas raíz: F en el traste 1, A en el traste 5 y C en el traste 8.',
        text: 'Everything is on the low E string: <b>F</b> at fret 1, <b>A</b> at fret 5, <b>C</b> at fret 8. Play every note with your index finger — the hand moves, the finger stays the same.',
        text_es: 'Todo está en la cuerda Mi grave: <b>F</b> en el traste 1, <b>A</b> en el traste 5, <b>C</b> en el traste 8. Toca cada nota con el índice — la mano se mueve, el dedo es siempre el mismo.',
      },
      {
        label:    'The intro — A · C, twice',
        label_es: 'La intro — A · C, dos veces',
        text: 'Read the tab. Index finger on every note, four beats each.<ol><li>Play each note once, slowly, and say its name</li><li>Play the tab, counting 1 2 3 4 out loud</li><li>Turn on the metronome at 60 BPM and play it again</li></ol>You\'ve got it when: the intro twice in a row at 60 BPM, no stops.',
        text_es: 'Lee la tablatura. Índice en cada nota, cuatro tiempos cada una.<ol><li>Toca cada nota una vez, despacio, y di su nombre</li><li>Toca la tablatura contando 1 2 3 4 en voz alta</li><li>Pon el metrónomo a 60 BPM y tócala otra vez</li></ol>Lo tienes cuando: la intro dos veces seguidas a 60 BPM, sin detenerte.',
        snippet: { track: 'the-cure', fromBar: 1, bars: 4,
                   label:    'The intro, with the band',
                   label_es: 'La intro, con la banda' },
        tab: {
          caption: 'Intro · A C A C · low E string · 4 beats each',
          caption_es: 'Intro · A C A C · cuerda Mi grave · 4 tiempos cada una',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 8, note: 'C', midi: 48 }
          ]
        },
      },
      {
        label:    'The verse — A · C, F · C',
        label_es: 'La estrofa — A · C, F · C',
        text: 'Read the tab. Index finger on every note, four beats each.<ol><li>Play just the second half — F C F C — until the move between fret 1 and fret 8 feels easy</li><li>Play the whole tab slowly, counting out loud</li><li>Then play it at 60 BPM</li></ol>You\'ve got it when: two clean verses in a row at 60 BPM. Late on a note? Start moving the hand on beat 4.',
        text_es: 'Lee la tablatura. Índice en cada nota, cuatro tiempos cada una.<ol><li>Toca solo la segunda mitad — F C F C — hasta que el movimiento entre el traste 1 y el traste 8 se sienta fácil</li><li>Toca la tablatura entera despacio, contando en voz alta</li><li>Después tócala a 60 BPM</li></ol>Lo tienes cuando: dos estrofas limpias seguidas a 60 BPM. ¿Llegas tarde a una nota? Empieza a mover la mano en el tiempo 4.',
        snippet: { track: 'the-cure', fromBar: 5, bars: 8,
                   label:    'The verse, with the band',
                   label_es: 'La estrofa, con la banda' },
        tab: {
          caption: 'Verse · A C, F C · low E string · 4 beats each',
          caption_es: 'Estrofa · A C, F C · cuerda Mi grave · 4 tiempos cada una',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 8, note: 'C', midi: 48 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 8, note: 'C', midi: 48 }
          ]
        },
      },
      {
        label:    'The hand shift',
        label_es: 'El cambio de mano',
        text: 'Each pair in the tab is one move of the hand.<ol><li>Play a pair, stop, play it again — five times each</li><li>Keep the index finger lightly touching the string while the hand moves</li><li>Then try each pair without looking</li></ol>You\'ve got it when: eight clean moves in a row without looking at your fretting hand.',
        text_es: 'Cada par de la tablatura es un movimiento de la mano.<ol><li>Toca un par, para, tócalo otra vez — cinco veces cada uno</li><li>Deja el índice tocando la cuerda suavemente mientras la mano se mueve</li><li>Después prueba cada par sin mirar</li></ol>Lo tienes cuando: ocho movimientos limpios seguidos sin mirarte la mano del mástil.',
        tab: {
          caption: 'The hand shift · three two-note pairs · low E string',
          caption_es: 'El cambio de mano · tres pares de dos notas · cuerda Mi grave',
          phrases: [
            {
              label: 'A → C',
              label_es: 'A → C',
              notes: [
                { string: 'E', fret: 5, note: 'A', midi: 45 },
                { string: 'E', fret: 8, note: 'C', midi: 48 }
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
        text: 'Play the tab straight through: intro, then verse.<ol><li>60 BPM, counting out loud</li><li>Made a mistake? Keep going — don\'t restart</li><li>After a clean run, try 100 BPM</li></ol>You\'ve got it when: intro into verse at 60 BPM with no stops, then once at 100 BPM. Stuck on a move? Go back to Step 4 for one minute.',
        text_es: 'Toca la tablatura de principio a fin: intro, y luego estrofa.<ol><li>60 BPM, contando en voz alta</li><li>¿Te equivocaste? Sigue — no vuelvas a empezar</li><li>Después de una vuelta limpia, prueba a 100 BPM</li></ol>Lo tienes cuando: de la intro a la estrofa a 60 BPM sin detenerte, y luego una vez a 100 BPM. ¿Te trabas en un movimiento? Vuelve al Paso 4 por un minuto.',
        snippet: { track: 'the-cure', fromBar: 1, bars: 12,
                   label:    'Intro into verse, with the band',
                   label_es: 'De la intro a la estrofa, con la banda' },
        tab: {
          caption: 'Intro and verse · low E string · 4 beats per note',
          caption_es: 'Intro y estrofa · cuerda Mi grave · 4 tiempos por nota',
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
        text: 'Pick one:<ul><li>+10 BPM every two clean runs, up to 100</li><li>Play along with the backing track on the Song Journey page, Layer 2</li></ul>You\'ve got it when: the intro and the verse with the track, twice through, without dropping out.',
        text_es: 'Escoge una:<ul><li>+10 BPM cada dos vueltas limpias, hasta 100</li><li>Toca con la pista de acompañamiento en la página de Recorrido de la canción, Capa 2</li></ul>Lo tienes cuando: la intro y la estrofa con la pista, dos veces seguidas, sin salirte.',
      },
    ],
  },
  /* Day 17 mini-card: "the cure" verse alone, moved from the low E (ca-13's
     A · C · F on frets 5 · 8 · 1) onto two strings with the hand parked in
     frets 1–5. Four rungs on purpose — it shares a day with ca-17 (Notes on
     the A String). ca-18, the next class day, re-teaches this verse and adds
     the chorus; the overlap is intended (Jonathan, 2026-09-16). Figure is
     ca-18's, already in sw.js. */
  {
    id:    'ca-19',
    number: 14,
    journey: 'the-cure',
    journeyLayer: 2,
    title:    '"the cure" — The Verse on Two Strings',
    title_es: '"the cure" — La estrofa en dos cuerdas',
    intro:    'You play the verse of "the cure" on the low E string, with the trip up to fret 8 for C. Today C moves to the A string, fret 3. Same three notes, no trip — the hand stays inside the first five frets.',
    intro_es: 'Ya tocas la estrofa de "the cure" en la cuerda Mi grave, con el viaje hasta el traste 8 para el C. Hoy el C se pasa a la cuerda La, traste 3. Las mismas tres notas, sin viaje — la mano se queda dentro de los primeros cinco trastes.',
    steps: [
      {
        label:    'The map — three roots, two strings',
        label_es: 'El mapa — tres raíces, dos cuerdas',
        figure: 'img/ca-cure-roots-both.svg',
        figureAlt: 'Fretboard diagram marking five root notes on two strings: F at fret 1, G at fret 3, and A at fret 5 on the low E string; C at fret 3 and D at fret 5 on the A string.',
        figureAlt_es: 'Diagrama del diapasón marcando cinco notas raíz en dos cuerdas: F en el traste 1, G en el traste 3 y A en el traste 5 en la cuerda Mi grave; C en el traste 3 y D en el traste 5 en la cuerda La.',
        text: 'The verse uses three of the five marked notes. Low E string: <b>F</b> at fret 1, <b>A</b> at fret 5. A string: <b>C</b> at fret 3. One finger per fret — index on fret 1, ring on fret 3, pinky on fret 5 — so the hand never moves. G and D wait for the chorus.',
        text_es: 'La estrofa usa tres de las cinco notas marcadas. Cuerda Mi grave: <b>F</b> en el traste 1, <b>A</b> en el traste 5. Cuerda La: <b>C</b> en el traste 3. Un dedo por traste — índice en el traste 1, anular en el traste 3, meñique en el traste 5 — así la mano nunca se mueve. G y D esperan al coro.',
      },
      {
        label:    'A · C — cross the string',
        label_es: 'A · C — cruza la cuerda',
        text: 'Read the tab. Four beats per note.<ol><li>Play each note once, slowly, and say its name</li><li>Play the tab, counting 1 2 3 4 out loud</li><li>Turn on the metronome at 60 BPM and play it again</li></ol>You\'ve got it when: A, C, A, C at 60 BPM, one string ringing at a time.',
        text_es: 'Lee la tablatura. Cuatro tiempos por nota.<ol><li>Toca cada nota una vez, despacio, y di su nombre</li><li>Toca la tablatura contando 1 2 3 4 en voz alta</li><li>Pon el metrónomo a 60 BPM y tócala otra vez</li></ol>Lo tienes cuando: A, C, A, C a 60 BPM, una sola cuerda sonando a la vez.',
        snippet: { track: 'the-cure', fromBar: 5, bars: 4,
                   label:    'The first half of the verse, with the band',
                   label_es: 'La primera mitad de la estrofa, con la banda' },
        tab: {
          caption: 'A · C, twice · 4 beats each',
          caption_es: 'A · C, dos veces · 4 tiempos cada una',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'A', fret: 3, note: 'C', midi: 48 }
          ]
        },
      },
      {
        label:    'F · C — the answer',
        label_es: 'F · C — la respuesta',
        text: 'Read the tab. Four beats per note.<ol><li>Put both fingers down and leave them there — only the pick moves</li><li>Play the tab slowly, counting out loud</li><li>Then play it at 60 BPM</li></ol>You\'ve got it when: F, C, F, C at 60 BPM, four clean notes in a row.',
        text_es: 'Lee la tablatura. Cuatro tiempos por nota.<ol><li>Pon los dos dedos y déjalos ahí — solo se mueve la púa</li><li>Toca la tablatura despacio, contando en voz alta</li><li>Después tócala a 60 BPM</li></ol>Lo tienes cuando: F, C, F, C a 60 BPM, cuatro notas limpias seguidas.',
        snippet: { track: 'the-cure', fromBar: 9, bars: 4,
                   label:    'The second half of the verse, with the band',
                   label_es: 'La segunda mitad de la estrofa, con la banda' },
        tab: {
          caption: 'F · C, twice · 4 beats each',
          caption_es: 'F · C, dos veces · 4 tiempos cada una',
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'A', fret: 3, note: 'C', midi: 48 }
          ]
        },
      },
      {
        label:    'The whole verse',
        label_es: 'La estrofa completa',
        text: 'Read the tab — it joins the two pairs.<ol><li>Play just the C → F move, five times</li><li>Play the whole tab slowly, counting out loud</li><li>Then play it at 60 BPM. Made a mistake? Keep going — don\'t restart</li></ol>You\'ve got it when: two clean verses in a row at 60 BPM. Then add 10 BPM each time, or play along with the backing track on the Song Journey page.',
        text_es: 'Lee la tablatura — une los dos pares.<ol><li>Toca solo el movimiento de C → F, cinco veces</li><li>Toca la tablatura entera despacio, contando en voz alta</li><li>Después tócala a 60 BPM. ¿Te equivocaste? Sigue — no vuelvas a empezar</li></ol>Lo tienes cuando: dos estrofas limpias seguidas a 60 BPM. Después súbele 10 BPM cada vez, o toca con la pista de acompañamiento en la página de Recorrido de la canción.',
        snippet: { track: 'the-cure', fromBar: 5, bars: 8,
                   label:    'The whole verse, with the band',
                   label_es: 'La estrofa completa, con la banda' },
        tab: {
          caption: 'Verse · A C A C, F C F C · 4 beats each',
          caption_es: 'Estrofa · A C A C, F C F C · 4 tiempos cada una',
          notes: [
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'A', fret: 3, note: 'C', midi: 48 }
          ]
        },
      },
    ],
  },
  /* Day 18's card, the day after ca-13. ca-13 teaches the intro and the verse
     on the low E string ALONE — A at fret 5, C at fret 8, F at fret 1, the hand
     travelling the length of the string. This card moves that same line onto two
     strings, where nothing sits past fret 5 and the hand never leaves one
     position, and adds the chorus — the last two roots, D on the A string and G
     on the low E — then runs all three sections in song order. The intro and the
     verse are taught again from scratch, so a student who missed ca-13 can still
     start here. The two cards are consecutive class days, not a replacement
     (Jonathan, 2026-09-16: ca-13 is the intro and the verse, low E only).
     (ca-19, the two-string verse alone, sits between them — 2026-09-16) */
  {
    id:    'ca-18',
    number: 15,
    journey: 'the-cure',   // the last step sends them to this Song Journey page — see JOURNEY above
    journeyLayer: 2,
    title:    '"the cure" — Intro, Verse and Chorus',
    title_es: '"the cure" — Intro, estrofa y coro',
    intro:    'You moved the verse of "the cure" onto two strings. Today you add the chorus — same two strings, nothing past fret 5, and the hand stays put.',
    intro_es: 'Ya moviste la estrofa de "the cure" a dos cuerdas. Hoy agregas el coro — las mismas dos cuerdas, nada más allá del traste 5, y la mano se queda quieta.',
    steps: [
      {
        label:    'The map — five roots, two strings',
        label_es: 'El mapa — cinco raíces, dos cuerdas',
        figure: 'img/ca-cure-roots-both.svg',
        figureAlt: 'Fretboard diagram marking five root notes on two strings: F at fret 1, G at fret 3, and A at fret 5 on the low E string; C at fret 3 and D at fret 5 on the A string.',
        figureAlt_es: 'Diagrama del diapasón marcando cinco notas raíz en dos cuerdas: F en el traste 1, G en el traste 3 y A en el traste 5 en la cuerda Mi grave; C en el traste 3 y D en el traste 5 en la cuerda La.',
        text: 'All five roots sit inside the first five frets. Low E string: <b>F</b> at fret 1, <b>G</b> at fret 3, <b>A</b> at fret 5. A string: <b>C</b> at fret 3, <b>D</b> at fret 5. One finger per fret — index on fret 1, ring on fret 3, pinky on fret 5 — so the hand never moves.',
        text_es: 'Las cinco raíces están dentro de los primeros cinco trastes. Cuerda Mi grave: <b>F</b> en el traste 1, <b>G</b> en el traste 3, <b>A</b> en el traste 5. Cuerda La: <b>C</b> en el traste 3, <b>D</b> en el traste 5. Un dedo por traste — índice en el traste 1, anular en el traste 3, meñique en el traste 5 — así la mano nunca se mueve.',
      },
      {
        label:    'Review — intro and verse',
        label_es: 'Repaso — intro y estrofa',
        text: 'Quick review — you already play this. Intro (A · C, twice), then verse (A · C, F · C). Four beats per note.<ol><li>Play the tab once slowly, saying each note</li><li>Turn on the metronome at 60 BPM and play the whole thing through</li></ol>You\'ve got it when: intro into verse, twice in a row at 60 BPM, no stops.',
        text_es: 'Repaso rápido — ya tocas esto. Intro (A · C, dos veces), y luego estrofa (A · C, F · C). Cuatro tiempos por nota.<ol><li>Toca la tablatura una vez despacio, diciendo cada nota</li><li>Pon el metrónomo a 60 BPM y tócala completa</li></ol>Lo tienes cuando: de la intro a la estrofa, dos veces seguidas a 60 BPM, sin detenerte.',
        snippet: { track: 'the-cure', fromBar: 1, bars: 12,
                   label:    'Intro and verse, with the band',
                   label_es: 'La intro y la estrofa, con la banda' },
        tab: {
          caption: 'Intro and verse · A C A C, then A C F C',
          caption_es: 'Intro y estrofa · A C A C, y después A C F C',
          phrases: [
            {
              label: 'Intro — A C A C',
              label_es: 'Intro — A C A C',
              notes: [
                { string: 'E', fret: 5, note: 'A', midi: 45 },
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'E', fret: 5, note: 'A', midi: 45 },
                { string: 'A', fret: 3, note: 'C', midi: 48 }
              ]
            },
            {
              label: 'Verse — A C A C, F C F C',
              label_es: 'Estrofa — A C A C, F C F C',
              notes: [
                { string: 'E', fret: 5, note: 'A', midi: 45 },
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'E', fret: 5, note: 'A', midi: 45 },
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'E', fret: 1, note: 'F', midi: 41 },
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'E', fret: 1, note: 'F', midi: 41 },
                { string: 'A', fret: 3, note: 'C', midi: 48 }
              ]
            }
          ]
        },
      },
      {
        label:    'The chorus — D · F, C · G',
        label_es: 'El coro — D · F, C · G',
        text: 'Read the tab — this part is new. Four beats per note.<ol><li>Play each note once, slowly, and say its name</li><li>Play the first half (D F D F) until it feels easy, then the second half (C G C G)</li><li>Play the whole tab at 60 BPM</li></ol>You\'ve got it when: two clean choruses in a row at 60 BPM.',
        text_es: 'Lee la tablatura — esta parte es nueva. Cuatro tiempos por nota.<ol><li>Toca cada nota una vez, despacio, y di su nombre</li><li>Toca la primera mitad (D F D F) hasta que se sienta fácil, y luego la segunda mitad (C G C G)</li><li>Toca la tablatura entera a 60 BPM</li></ol>Lo tienes cuando: dos coros limpios seguidos a 60 BPM.',
        // The chorus is at bar 21, not 13: the verse's eight bars play TWICE
        // (5-12 and 13-20) before it. Measured off the mix — bars 13-20 are
        // harmonically the verse again, and the chorus is the louder section
        // that follows. A window at 13 had the band playing Am-C-F-C under a
        // student reading D-F-C-G.
        snippet: { track: 'the-cure', fromBar: 21, bars: 8,
                   label:    'The chorus, with the band',
                   label_es: 'El coro, con la banda' },
        tab: {
          caption: 'Chorus · D F, C G · 4 beats each',
          caption_es: 'Coro · D F, C G · 4 tiempos cada una',
          notes: [
            { string: 'A', fret: 5, note: 'D', midi: 50 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'A', fret: 5, note: 'D', midi: 50 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'E', fret: 3, note: 'G', midi: 43 }
          ]
        },
      },
      {
        label:    'The handoffs',
        label_es: 'Los enlaces',
        text: 'Each pair in the tab is where one section meets the next.<ol><li>Play a pair, stop, play it again — five times each</li><li>Then try each pair without looking at the pick</li></ol>You\'ve got it when: eight clean handoffs in a row.',
        text_es: 'Cada par de la tablatura es donde una sección se junta con la siguiente.<ol><li>Toca un par, para, tócalo otra vez — cinco veces cada uno</li><li>Después prueba cada par sin mirar la púa</li></ol>Lo tienes cuando: ocho enlaces limpios seguidos.',
        tab: {
          caption: 'The handoffs · three two-note pairs',
          caption_es: 'Los enlaces · tres pares de dos notas',
          phrases: [
            {
              label: 'Intro into verse — C → A',
              label_es: 'De la intro a la estrofa — C → A',
              notes: [
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'E', fret: 5, note: 'A', midi: 45 }
              ]
            },
            {
              label: 'Verse into chorus — C → D',
              label_es: 'De la estrofa al coro — C → D',
              notes: [
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'A', fret: 5, note: 'D', midi: 50 }
              ]
            },
            {
              label: 'Chorus into verse — G → A',
              label_es: 'Del coro a la estrofa — G → A',
              notes: [
                { string: 'E', fret: 3, note: 'G', midi: 43 },
                { string: 'E', fret: 5, note: 'A', midi: 45 }
              ]
            }
          ]
        },
      },
      {
        label:    'The song in order',
        label_es: 'La canción en orden',
        text: 'Play the tab straight through: intro, verse, the verse again, then the chorus — the order the record goes in.<ol><li>60 BPM, counting out loud</li><li>Made a mistake? Keep going — don\'t restart</li><li>After a clean run, try 100 BPM</li></ol>You\'ve got it when: intro, verse, verse, chorus at 60 BPM with no stops, then once at 100 BPM. Stuck where two sections meet? Go back to the handoffs for one minute.',
        text_es: 'Toca la tablatura de principio a fin: intro, estrofa, la estrofa otra vez, y luego el coro — el orden del disco.<ol><li>60 BPM, contando en voz alta</li><li>¿Te equivocaste? Sigue — no vuelvas a empezar</li><li>Después de una vuelta limpia, prueba a 100 BPM</li></ol>Lo tienes cuando: intro, estrofa, estrofa, coro a 60 BPM sin detenerte, y luego una vez a 100 BPM. ¿Te trabas donde se juntan dos secciones? Vuelve a los enlaces por un minuto.',
        /* 28 bars, not 20: the record is intro (4), verse (8), verse AGAIN
           (8), then the chorus (8). A 20-bar window stopped in the middle of
           the second verse and never reached the chorus the tab teaches, so
           the tab carries the repeated verse and the window runs to the end
           of the first chorus. */
        snippet: { track: 'the-cure', fromBar: 1, bars: 28,
                   label:    'The song in order, with the band',
                   label_es: 'La canción en orden, con la banda' },
        tab: {
          caption: 'Intro, verse, verse, chorus · 4 beats per note',
          caption_es: 'Intro, estrofa, estrofa, coro · 4 tiempos por nota',
          phrases: [
            {
              label: 'Intro — A C A C',
              label_es: 'Intro — A C A C',
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
              label: 'Verse — A C A C, F C F C',
              label_es: 'Estrofa — A C A C, F C F C',
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
            },
            {
              label: 'Verse again — A C A C, F C F C',
              label_es: 'La estrofa otra vez — A C A C, F C F C',
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
            },
            {
              label: 'Chorus — D F D F, C G C G',
              label_es: 'Coro — D F D F, C G C G',
              notes: [
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'E', fret: 1, note: 'F', midi: 41 },
                { string: 'E', fret: 1, note: 'F', midi: 41 },
                { string: 'E', fret: 1, note: 'F', midi: 41 },
                { string: 'E', fret: 1, note: 'F', midi: 41 },
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'E', fret: 1, note: 'F', midi: 41 },
                { string: 'E', fret: 1, note: 'F', midi: 41 },
                { string: 'E', fret: 1, note: 'F', midi: 41 },
                { string: 'E', fret: 1, note: 'F', midi: 41 },
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'E', fret: 3, note: 'G', midi: 43 },
                { string: 'E', fret: 3, note: 'G', midi: 43 },
                { string: 'E', fret: 3, note: 'G', midi: 43 },
                { string: 'E', fret: 3, note: 'G', midi: 43 },
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'E', fret: 3, note: 'G', midi: 43 },
                { string: 'E', fret: 3, note: 'G', midi: 43 },
                { string: 'E', fret: 3, note: 'G', midi: 43 },
                { string: 'E', fret: 3, note: 'G', midi: 43 }
              ]
            }
          ]
        },
      },
      {
        label:    'Keep going',
        label_es: 'Sigue adelante',
        text: 'Pick one:<ul><li>+10 BPM every two clean runs, up to 100</li><li>Play along with the backing track on the Song Journey page, Layer 2</li><li>Level up: play the intro and the verse on the low E only — A at fret 5, C at fret 8, F at fret 1, index finger on every note</li></ul>You\'ve got it when: a full verse and chorus with the track without dropping out.',
        text_es: 'Escoge una:<ul><li>+10 BPM cada dos vueltas limpias, hasta 100</li><li>Toca con la pista de acompañamiento en la página de Recorrido de la canción, Capa 2</li><li>Sube de nivel: toca la intro y la estrofa solo en la cuerda Mi grave — A en el traste 5, C en el traste 8, F en el traste 1, índice en cada nota</li></ul>Lo tienes cuando: una estrofa y un coro completos con la pista sin salirte.',
      },
    ],
  },
  /* An EXIT CHECK, not a step ladder — see the kind:'check' block in the
     schema above. Every note here is lifted verbatim from ca-1's whole-song
     tab (line A `0 0 2 0 5 4`, B `0 0 2 0 7 5`, C `0 0 12 9 5 4 2`,
     D `10 10 9 5 7 5`), so the check can't drift away from the activity that
     taught it. Items 1 and 3 deliberately play the SAME four notes and differ
     only in which line they are: the question is whether the student knows
     the song, not whether they can extend a pattern. */
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
    intro:    'One fret lights up on the low E string and the site plays it. Tap the name of the note. Five questions, one try — the neck dots are your map.',
    intro_es: 'Un traste se ilumina en la cuerda Mi grave y el sitio lo toca. Toca el nombre de la nota. Cinco preguntas, un solo intento — los puntos del mástil son tu mapa.',
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
];
