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
   toggle and the date gate are independent, either one hides. Activities
   never retire otherwise: this file is a permanent archive, newest-dated
   first at render time (app.js sorts, this file doesn't need to be kept in
   any order).

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

   `number` is the TEACHING-ORDER number, and it is NOT locked to the id.
   It's the position a student sees in the "#N - " prefix, so it has to
   follow the order the class is actually taught in, which isn't the order
   activities get authored in — an activity written late can be taught first.
   Resequencing `number` is therefore expected and safe: nothing is keyed to
   it (ids are), it only drives the "#N - " prefix and the sort tiebreak in
   app.js / teacher.js — and it can be resequenced from the teacher console
   too, without a push (see RENUMBERING FROM THE CONSOLE below). Keep the set
   contiguous 1..N with no gaps or
   duplicates — checks.mjs (1d) enforces that, and enforces id uniqueness
   separately. Renumbering ids to match is the one thing that would break
   students' saved progress; don't.

   A NUMBER BAKED INTO A TITLE IS A SERIES NUMBER, NOT THE TEACHING-ORDER
   ONE. Some activities come in a named series ("Finger Gym 1", "Finger
   Gym 2", …). That digit counts within the series — the first Finger Gym is
   Finger Gym 1 even when the class meets it as activity #3 — so it does NOT
   track `number` and does NOT move when the surrounding activities are
   resequenced (Jonathan, 2026-08-20). "#3 - Finger Gym 1" is correct and
   intended; the prefix says where we are in the course, the title says which
   Gym it is.

   What a series DOES have to be is 1..N in teaching order, with no gaps,
   duplicates or backwards jumps — checks.mjs (1l) groups titles by the words
   before the digit, sorts by `number`, and fails the push if the series
   digits don't read 1, 2, 3, …, in EN and ES separately. Inserting a new
   Gym in the middle therefore does mean retyping the digit in every later
   Gym's `title` AND `title_es`, and chasing any "same as Gym 1" /
   "del Gimnasio 1" cross-reference in another activity's step text.

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

   RENUMBERING FROM THE CONSOLE works the same way, on the same doc: typing
   over the "#N" in the Class activities table moves that activity in the
   teaching order and renumbers everything around it, writing
   config/class.activityNumbers as { id -> { n, base } } — one row per
   activity that no longer sits on its shipped number, `base` being the
   shipped number it was moved from. Students see the new "#N - " prefix
   immediately, in both languages (a number needs no translating, so unlike a
   rename there's nothing owed to Spanish afterwards). Folding the order in
   here — retype the `number` fields to match what the console shows — expires
   those overrides automatically, exactly like a rename. Until it's folded in,
   the file and the console disagree about the order and the CONSOLE is what
   students see. See caNumberMap()/caNumber() in app.js and
   teacherSetActivityNumber() in teacher.js.

   Every display string carries an `_es` twin, same convention as module
   files — rendered through tf(obj, field) in app.js (see the "field on a
   Set/skill/song/etc." comment there). Never ship an English-only string;
   add both in the same edit.

   SCHEMA
   {
     id:      'ca-9',            // permanent — next unused 'ca-<n>' counter
     number:  3,                 // teaching-order position, resequence freely
                                  // (see above) — the "#3" a student sees.
                                  // Renders as "#N - Title"; don't bake the
                                  // "#N - " prefix into title itself.
     title:    'Power Chord Relay',
     title_es: 'Relevo de acordes de poder',
     intro:    'One or two sentences of context — why today\'s in-class work
                 matters, tied back to what the student just did in stations.',
     intro_es: '…',
     steps: [
       {
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
       },
       // …
     ],
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
    intro:    'You played phrase A already. Today you play all four phrases without ever leaving the low E string — the melody climbs to the double dot at fret 12 and walks back home. Once that\'s yours, there\'s a second way to play the back half that never leaves the first five frets.',
    intro_es: 'Ya tocaste la frase A. Hoy tocas las cuatro frases sin salirte nunca de la cuerda Mi grave — la melodía sube hasta el punto doble del traste 12 y regresa caminando. Cuando ya sea tuya, hay una segunda forma de tocar la segunda mitad que nunca se sale de los primeros cinco trastes.',
    steps: [
      {
        figure: 'img/ca-hb-fingers.svg',
        text: 'The whole song lives on the low E string (the thickest one), and your fretting fingers have numbers — 1 = index, 2 = middle, 3 = ring, 4 = pinky. The thumb has none; it stays behind the neck. Home spot: finger 1 → fret 2, finger 3 → fret 4, finger 4 → fret 5. Today the map grows past the home spot — fret 7 first, then higher still. The dots at 5 and 7 are your landing marks.',
        text_es: 'La canción completa vive en la cuerda Mi grave (la más gruesa), y los dedos de tu mano de trastear tienen números — 1 = índice, 2 = medio, 3 = anular, 4 = meñique. El pulgar no tiene; se queda detrás del mástil. Posición base: dedo 1 → traste 2, dedo 3 → traste 4, dedo 4 → traste 5. Hoy el mapa crece más allá de la posición base — primero el traste 7, y después más arriba. Los puntos en el 5 y el 7 son tus marcas de referencia.',
      },
      {
        text: 'The first half of the song — phrase A is the line you learned last time, phrase B starts the same and ends higher.<ul><li>Phrase A, fingers: open, open, 1, open, 4, 3 — say each one as you play it</li><li>Phrase B: open, open, 1, open, then finger 4 → fret 7, finger 1 → fret 5. Eyes on fret 7 <em>before</em> finger 4 moves</li><li>BPM 70. Loop each phrase alone until it\'s clean, then play them back to back</li></ul>You\'ve got it when: phrase A into phrase B, four times through, without stopping. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'La primera mitad de la canción — la frase A es la línea que aprendiste la vez pasada, la frase B empieza igual y termina más arriba.<ul><li>Frase A, dedos: al aire, al aire, 1, al aire, 4, 3 — di cada uno mientras lo tocas</li><li>Frase B: al aire, al aire, 1, al aire, luego dedo 4 → traste 7, dedo 1 → traste 5. Ojos en el traste 7 <em>antes</em> de mover el dedo 4</li><li>BPM 70. Repite cada frase sola hasta que salga limpia, y después tócalas seguidas</li></ul>Lo tienes cuando: de la frase A a la frase B, cuatro veces seguidas, sin detenerte. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
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
        figure: 'img/ca-hb-low-e-all.svg',
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
        text: 'The second half — phrase C is where you sing the name and makes the biggest jump in the song; phrase D starts higher than any other phrase, then walks home.<ul><li>Phrase C: two open notes, then your hand travels — finger 1 on fret 9, finger 4 reaching the double dot at 12. Walk down 12 → 9, then shift home: finger 4 → fret 5, finger 3 → fret 4, finger 1 → fret 2</li><li>Phrase D: finger 2 on fret 10, finger 1 on fret 9, then shift down — finger 1 → fret 5, finger 3 → fret 7. The frets are narrow that high, so stay on your fingertips or they\'ll crowd each other</li><li>Loop each phrase alone until it\'s clean, saying the words as you play, then play them back to back</li></ul>You\'ve got it when: phrase C into phrase D, four times through, without stopping. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'La segunda mitad — la frase C es donde cantas el nombre y da el salto más grande de la canción; la frase D empieza más arriba que cualquier otra frase, y después regresa caminando a casa.<ul><li>Frase C: dos notas al aire, y luego tu mano viaja — dedo 1 en el traste 9, dedo 4 estirándose al punto doble del 12. Baja del 12 al 9, y después regresa a la posición base: dedo 4 → traste 5, dedo 3 → traste 4, dedo 1 → traste 2</li><li>Frase D: dedo 2 en el traste 10, dedo 1 en el traste 9, y luego baja — dedo 1 → traste 5, dedo 3 → traste 7. Allá arriba los trastes son angostos, así que quédate sobre las puntas de los dedos o se van a chocar entre sí</li><li>Repite cada frase sola hasta que salga limpia, diciendo las palabras mientras tocas, y después tócalas seguidas</li></ul>Lo tienes cuando: de la frase C a la frase D, cuatro veces seguidas, sin detenerte. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
        tab: {
          caption: 'Second half · phrases C and D · low E string only',
          caption_es: 'Segunda mitad · frases C y D · solo la cuerda Mi grave',
          phrases: [
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
        text: 'All four phrases, start to finish — the whole song on one string, no stopping in between.\nYou\'ve got it when: phrases A, B, C and D back to back, any speed, without stopping.',
        text_es: 'Las cuatro frases, de principio a fin — la canción completa en una sola cuerda, sin detenerte entre medio.\nLo tienes cuando: las frases A, B, C y D seguidas, a cualquier velocidad, sin detenerte.',
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
        figure: 'img/ca-hb-a.svg',
        text: 'Level up: the same song without the trip up the neck. It takes a second string. Meet the A string — one string down from the low E, the second-thickest. Same map: frets 2, 4, 5 and 7, and the dots at 5 and 7 are still your landing marks.<ul><li>Pluck the open low E, then the open A, back and forth — no fretting hand yet</li><li>The pick moves one string; ONLY one string rings each time</li><li>Both sound? Slow the pick down and look at where it lands</li></ul>You\'ve got it when: low E, A, low E, A — three clean reps in a row, one string per pluck.',
        text_es: 'Sube de nivel: la misma canción sin el viaje mástil arriba. Eso pide una segunda cuerda. Esta es la cuerda La — la que está justo debajo de la cuerda Mi grave, la segunda más gruesa. El mismo mapa: trastes 2, 4, 5 y 7, y los puntos en el 5 y el 7 siguen siendo tus marcas de referencia.<ul><li>Pulsa la cuerda Mi grave al aire, luego la cuerda La al aire, ida y vuelta — todavía sin la mano de trastear</li><li>La púa se mueve una sola cuerda; SOLO una cuerda suena cada vez</li><li>¿Suenan las dos? Mueve la púa más despacio y mira dónde cae</li></ul>Lo tienes cuando: cuerda Mi grave, cuerda La, cuerda Mi grave, cuerda La — tres repeticiones limpias seguidas, una cuerda por pulsación.',
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
        figure: 'img/ca-hb-fingers-a.svg',
        text: 'Phrases C and D again, this time on the A string — every note stays inside the first seven frets.<ul><li>Phrase C: two open notes on the low E → finger 4 on fret 7 of the A, finger 3 on fret 4, then the open A → back to the low E for 4 and 2</li><li>Finger 3 crosses strings without changing frets: fret 4 on the A, then fret 4 on the low E</li><li>Phrase D lives entirely on the A string, back in the home spot: 4, 4, 3, open, 1, open</li></ul>You\'ve got it when: phrase C into phrase D, three clean runs, no hunting for the string. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'Las frases C y D otra vez, ahora en la cuerda La — todas las notas se quedan dentro de los primeros siete trastes.<ul><li>Frase C: dos notas al aire en la cuerda Mi grave → dedo 4 en el traste 7 de la cuerda La, dedo 3 en el traste 4, y luego la cuerda La al aire → de vuelta a la Mi grave para el 4 y el 2</li><li>El dedo 3 cruza a la otra cuerda sin cambiar de traste: traste 4 en la cuerda La, y luego traste 4 en la cuerda Mi grave</li><li>La frase D vive completa en la cuerda La, de vuelta en la posición base: 4, 4, 3, al aire, 1, al aire</li></ul>Lo tienes cuando: de la frase C a la frase D, tres pasadas limpias, sin andar buscando la cuerda. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
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
        text: 'The whole song the A-string way — same four phrases, two strings, no stopping in between. Then chase speed on whichever version you play cleanest.<ul><li>Every clean pass: raise the BPM by 10</li><li>Fast already? Play it for the person next to you and have them sing along — someone in this room has a birthday coming</li></ul>You\'ve got it when: you\'ve played the A-string way start to finish and raised the tempo at least three times without breaking down — then keep climbing.',
        text_es: 'La canción completa en la versión con la cuerda La — las mismas cuatro frases, dos cuerdas, sin detenerte entre medio. Después persigue la velocidad con la versión que te salga más limpia.<ul><li>Cada pasada limpia: sube el BPM 10 puntos</li><li>¿Ya vas rápido? Tócala para la persona de al lado y que cante contigo — alguien en este salón cumple años pronto</li></ul>Lo tienes cuando: tocaste la versión con la cuerda La de principio a fin y subiste el tempo al menos tres veces sin perder el ritmo — y de ahí, sigue subiendo.',
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
    id:    'ca-2',
    number: 3,
    title:    'Finger Gym 1',
    title_es: 'Gimnasio de Dedos 1',
    intro:    'Today isn\'t a song day — it\'s a training day. Three events in the first five frets: the Ladder, the Spider, the Reach. You\'re chasing a personal record, not a grade.',
    intro_es: 'Hoy no es día de canciones — es día de entrenamiento. Tres eventos en los primeros cinco trastes: la Escalera, la Araña y el Estiramiento. Vas por un récord personal, no por una calificación.',
    steps: [
      {
        figure: 'img/ca-fg-gym-zone.svg',
        text: 'This is the gym: the first five frets of the low E string (the thickest one). A fret is the space between two metal strips — fret 1 is closest to the tuning pegs.',
        text_es: 'Este es el gimnasio: los primeros cinco trastes de la cuerda Mi grave (la más gruesa). Un traste es el espacio entre dos barras de metal — el traste 1 es el más cercano a las clavijas.',
      },
      {
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
        text: 'Event 2 — the Spider. Same four fingers, two strings.<ul><li>Alternate: low E, A, low E, A</li><li>The trap: finger 3 wants to follow finger 2 onto the A string — send it back to the low E</li><li>Shift up one fret and repeat</li></ul>You\'ve got it when: one full pass with every note on the right string, any speed.',
        text_es: 'Evento 2 — la Araña. Los mismos cuatro dedos, dos cuerdas.<ul><li>Alterna: Mi grave, La, Mi grave, La</li><li>La trampa: el dedo 3 quiere seguir al dedo 2 hacia la cuerda La — mándalo de vuelta al Mi grave</li><li>Sube un traste y repite</li></ul>Lo tienes cuando: una pasada completa con cada nota en la cuerda correcta, a cualquier velocidad.',
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
        figure: 'img/ca-fg-gym-zone.svg',
        text: 'This is the same gym as last time: the first five frets. Two things change today — the direction you travel, and how many strings you use.',
        text_es: 'Este es el mismo gimnasio que la vez pasada: los primeros cinco trastes. Hoy cambian dos cosas — la dirección en la que te mueves, y cuántas cuerdas usas.',
      },
      {
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
        figure: 'img/ca-fg-dots.svg',
        text: 'The dots on the neck are your landing marks: frets 5, 7, 9, and the double dot at 12. Learn to find them with your eyes before your hand goes there.',
        text_es: 'Los puntos en el mástil son tus marcas de referencia: los trastes 5, 7, 9 y el punto doble en el 12. Aprende a encontrarlos con la vista antes de que llegue tu mano.',
      },
      {
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
        figure: 'img/ca-fg-gym-zone.svg',
        text: 'You\'re back in the first five frets. The notes are the same as Gym 1 — what changes is that nothing lifts.',
        text_es: 'Estás de vuelta en los primeros cinco trastes. Las notas son las mismas del Gimnasio 1 — lo que cambia es que nada se levanta.',
      },
      {
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
    intro:    'Two new demands today: skipping over a string without hitting it, and reaching one fret farther than your hand wants to go.',
    intro_es: 'Hoy hay dos exigencias nuevas: saltar sobre una cuerda sin tocarla, y estirar un traste más allá de donde tu mano quiere llegar.',
    steps: [
      {
        figure: 'img/ca-fg-gym-zone-skip.svg',
        text: 'The gym grows today: three strings deep — low E, A, and D — and one fret wider, out to fret 6. The distance is sideways now as well as along the neck.',
        text_es: 'Hoy el gimnasio crece: tres cuerdas de profundidad — Mi grave, La y Re — y un traste más de ancho, hasta el traste 6. Ahora la distancia también es de lado, además de a lo largo del mástil.',
      },
      {
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
        figure: 'img/ca-fg-gym-zone.svg',
        text: 'Three events, same as always: the Ladder, the Spider, the Reach. Today they get run for time and tempo instead of learned.',
        text_es: 'Tres eventos, como siempre: la Escalera, la Araña y el Estiramiento. Hoy se corren por tiempo y tempo, no se aprenden.',
      },
      {
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
        text: 'Event 2 at your record tempo. Set the BPM to the number you wrote down last Gym and play the Spider there.\nYou\'ve got it when: one clean pass at your record BPM, every note on the right string. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'Evento 2 a tu tempo récord. Pon el BPM en el número que anotaste el Gimnasio pasado y toca la Araña ahí.\nLo tienes cuando: una pasada limpia a tu BPM récord, con cada nota en la cuerda correcta. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
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
        text: 'Reach endurance — eight reaches without stopping, twice the usual.<ul><li>The hand starts to complain around six — that\'s the part that builds strength</li><li>Pain is different from work: if it hurts, STOP</li></ul>You\'ve got it when: eight reaches without stopping and finger 1 never lifts.',
        text_es: 'Resistencia en el Estiramiento — ocho estiramientos sin detenerte, el doble de lo normal.<ul><li>La mano empieza a quejarse cerca del sexto — esa es la parte que construye fuerza</li><li>El dolor es distinto del esfuerzo: si duele, DETENTE</li></ul>Lo tienes cuando: ocho estiramientos sin detenerte y el dedo 1 nunca se levanta.',
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
        text: 'Run the whole circuit twice, without putting the guitar down between sets.<ul><li>Ladder ×4, Spider ×4, Reach ×4</li><li>Then again — no break</li></ul>You\'ve got it when: two sets back to back with no break in between.',
        text_es: 'Toca el circuito completo dos veces, sin bajar la guitarra entre series.<ul><li>Escalera ×4, Araña ×4, Estiramiento ×4</li><li>Y otra vez — sin descanso</li></ul>Lo tienes cuando: dos series seguidas sin descanso entre ellas.',
      },
      {
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
        figure: 'img/ca-hb-low-e.svg',
        text: 'This is the low E string — the thick one, closest to your face.<ul><li>The whole phrase lives here: open (0 = no finger) is E, fret 2 is F#, fret 4 is G#, fret 5 is A</li><li>The faint dots — frets 3, 5, 7, 9 and 12 — are a map; the dot at fret 5 is your landing mark</li></ul>',
        text_es: 'Esta es la cuerda Mi grave — la más gruesa, la que queda más cerca de tu cara.<ul><li>Toda la frase vive aquí: al aire (0 = sin dedo) es E, el traste 2 es F#, el traste 4 es G# y el traste 5 es A</li><li>Los puntos tenues — trastes 3, 5, 7, 9 y 12 — son un mapa; el punto del traste 5 es tu marca para caer</li></ul>',
      },
      {
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
        text: 'Keep going — there\'s no finish line on this one.<ul><li>Set the player above to 60 BPM and play with the beat</li><li>Every clean pass: raise the BPM by 10</li><li>Fast already? Say each note\'s name as you land it — E, F#, G#, A</li></ul>You\'ve got it when: you\'ve raised the BPM twice without breaking down — then keep climbing.',
        text_es: 'Sigue — aquí no hay meta final.<ul><li>Pon el reproductor de arriba en 60 BPM y toca con el pulso</li><li>Cada pasada limpia: sube el BPM 10 puntos</li><li>¿Ya vas rápido? Di el nombre de cada nota al caer en ella — E, F#, G#, A</li></ul>Lo tienes cuando: ya subiste el BPM dos veces sin perder el ritmo — y de ahí, sigue subiendo.',
      },
    ],
  },
  {
    id:    'ca-10',
    number: 4,
    title:    'Seven Nation Army — The Riff',
    title_es: 'Seven Nation Army — El riff',
    intro:    'Your fingers trained for this. One riff, one string, seven notes — and five of them sit right on the neck dots you already know.',
    intro_es: 'Tus dedos entrenaron para esto. Un riff, una cuerda, siete notas — y cinco de ellas caen justo sobre los puntos del mástil que ya conoces.',
    steps: [
      {
        figure: 'img/ca-sna-riff-map.svg',
        text: 'This is where the riff lives: the A string — the one just below the thickest string. The circled letters are the riff\'s notes; the small gray dots between them are the neck\'s own landmark dots at frets 3, 5, 7, and 9.',
        text_es: 'Aquí vive el riff: la cuerda La — la que está justo debajo de la cuerda Mi grave. Las letras en círculo son las notas del riff; los puntos grises pequeños son las marcas del mástil en los trastes 3, 5, 7 y 9.',
      },
      {
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
        text: 'Put it together — the whole riff, one breath: 7 – 7 – 10 – 7 – 5 – 3 – 2.\nYou\'ve got it when: four times through without stopping, any speed.',
        text_es: 'Júntalo todo — el riff completo, de un tirón: 7 – 7 – 10 – 7 – 5 – 3 – 2.\nLo tienes cuando: cuatro veces seguidas sin detenerte, a cualquier velocidad.',
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
        text: 'Chase it.<ul><li>Every clean pass: raise the BPM by 10 and go again</li><li>Got speed? Make it groove — hold the first note of each pair longer, like the recording</li><li>Then open the Seven Nation Army Song Journey page and play it over the backing track</li></ul>You\'ve got it when: you\'ve raised the tempo at least three times without breaking down — then keep climbing.',
        text_es: 'Persíguelo.<ul><li>Cada pasada limpia: sube el BPM 10 puntos y vuelve a intentarlo</li><li>¿Ya tienes velocidad? Dale ritmo — sostén más la primera nota de cada pareja, como en la grabación</li><li>Después abre el Recorrido de la canción de Seven Nation Army y tócalo sobre la pista de acompañamiento</li></ul>Lo tienes cuando: subiste el tempo al menos tres veces sin perder el ritmo — y de ahí, sigue subiendo.',
      },
    ],
  },
];
