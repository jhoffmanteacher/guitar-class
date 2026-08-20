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

   `number` is the TEACHING-ORDER number, and it is NOT locked to the id.
   It's the only number a student ever sees ("#3 - Finger Gym 1"), so it has
   to follow the order the class is actually taught in, which isn't the order
   activities get authored in — an activity written late can be taught first.
   Resequencing `number` is therefore expected and safe: nothing is keyed to
   it (ids are), it only drives the "#N - " prefix and the sort tiebreak in
   app.js / teacher.js. Keep the set contiguous 1..N with no gaps or
   duplicates — checks.mjs (1d) enforces that, and enforces id uniqueness
   separately. Renumbering ids to match is the one thing that would break
   students' saved progress; don't.

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
    title:    'Playing Happy Birthday — Practice',
    title_es: 'Tocando Happy Birthday — Práctica',
    intro:    'You already know the shape. Today: drill it string by string, put it together, then push the tempo as far as it\'ll go.',
    intro_es: 'Ya conoces el patrón. Hoy: practícalo cuerda por cuerda, júntalo todo, y después empuja el tempo todo lo que puedas.',
    steps: [
      {
        figure: 'img/ca-hb-low-e.svg',
        text: 'Open string is home base. Frets 2, 4, 5 make the shape on the low E string — the dot at fret 5 is your landing mark.',
        text_es: 'La cuerda al aire es tu punto de partida. Los trastes 2, 4 y 5 forman el patrón en la cuerda Mi grave — el punto en el traste 5 es tu marca de referencia.',
      },
      {
        figure: 'img/ca-hb-a.svg',
        text: 'Same shape, one string over: the A string. Frets 2, 4, 5, and now 7 — the dots at 5 and 7 are your landing marks.',
        text_es: 'El mismo patrón, una cuerda hacia abajo: la cuerda La. Trastes 2, 4, 5 y ahora también el 7 — los puntos en el 5 y el 7 son tus marcas de referencia.',
      },
      {
        text: 'This line is every note on the low E string. Set your BPM to 70 and play it through.\nYou\'ve got it when: three clean reps in a row, no buzz. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'Esta línea son todas las notas de la cuerda Mi grave. Pon tu BPM en 70 y tócala completa.\nLo tienes cuando: tres repeticiones limpias seguidas, sin zumbido. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
        tab: {
          caption: 'E string only — no jumps',
          caption_es: 'Solo cuerda Mi grave — sin saltos',
          notes: [
            { string: 'E', fret: 0, note: 'E',  midi: 40 },
            { string: 'E', fret: 0, note: 'E',  midi: 40 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'E', fret: 0, note: 'E',  midi: 40 },
            { string: 'E', fret: 5, note: 'A',  midi: 45 },
            { string: 'E', fret: 4, note: 'G#', midi: 44 }
          ]
        },
      },
      {
        text: 'Same drill, the A string this time.\nYou\'ve got it when: three clean reps in a row, no buzz. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'El mismo ejercicio, ahora en la cuerda La.\nLo tienes cuando: tres repeticiones limpias seguidas, sin zumbido. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
        tab: {
          caption: 'A string only — same idea, one string over',
          caption_es: 'Solo cuerda La — la misma idea, una cuerda hacia abajo',
          notes: [
            { string: 'A', fret: 5, note: 'D',  midi: 50 },
            { string: 'A', fret: 5, note: 'D',  midi: 50 },
            { string: 'A', fret: 4, note: 'C#', midi: 49 },
            { string: 'A', fret: 0, note: 'A',  midi: 45 },
            { string: 'A', fret: 2, note: 'B',  midi: 47 },
            { string: 'A', fret: 0, note: 'A',  midi: 45 }
          ]
        },
      },
      {
        text: 'Now the two strings back to back — this is the first half of the song.\nYou\'ve got it when: phrase 1 and phrase 2, four times through, without stopping.',
        text_es: 'Ahora las dos cuerdas seguidas — esta es la primera mitad de la canción.\nLo tienes cuando: la frase 1 y la frase 2, cuatro veces seguidas, sin detenerte.',
        tab: {
          caption: 'First half · E string into A string, no pause',
          caption_es: 'Primera mitad · de la cuerda Mi grave a la cuerda La, sin pausa',
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
            },
            {
              label: '"Hap-py birth-day to you" (again — the ending climbs higher)',
              label_es: '"Hap-py birth-day to you" (otra vez — el final sube más alto)',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'A', fret: 2, note: 'B',  midi: 47 },
                { string: 'A', fret: 0, note: 'A',  midi: 45 }
              ]
            }
          ]
        },
      },
      {
        text: 'Add the second half — start to finish, no stopping in between. The leap to fret 7 on the A string is the one tricky spot; it\'s a dot, so let your eye catch it before your finger jumps.\nYou\'ve got it when: all four phrases back to back, any speed, without stopping.',
        text_es: 'Agrega la segunda mitad — de principio a fin, sin detenerte entre medio. El salto al traste 7 en la cuerda La es el único punto difícil; es un punto en el diapasón, así que deja que lo capte tu ojo antes de que salte tu dedo.\nLo tienes cuando: las cuatro frases seguidas, a cualquier velocidad, sin detenerte.',
        tab: {
          caption: 'Whole song · the jump to fret 7 is the hard part',
          caption_es: 'Canción completa · el salto al traste 7 es la parte difícil',
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
            },
            {
              label: '"Hap-py birth-day to you" (again)',
              label_es: '"Hap-py birth-day to you" (otra vez)',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'A', fret: 2, note: 'B',  midi: 47 },
                { string: 'A', fret: 0, note: 'A',  midi: 45 }
              ]
            },
            {
              label: '"Hap-py birth-day dear ______"',
              label_es: '"Hap-py birth-day dear ______"',
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
              label: '"Hap-py birth-day to you"',
              label_es: '"Hap-py birth-day to you"',
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
        text: 'Play the full song again, chasing speed this time. Every clean pass, raise the BPM on the player above by 10 and go again.\nYou\'ve got it when: you\'ve raised the tempo at least three times without breaking down.',
        text_es: 'Toca la canción completa otra vez, esta vez persiguiendo la velocidad. Cada vez que te salga limpia, sube el BPM en el reproductor de arriba 10 puntos y vuelve a intentarlo.\nLo tienes cuando: subiste el tempo al menos tres veces sin perder el ritmo.',
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
        text: 'Event 1 — the Ladder. One finger per fret: index on 1, middle on 2, ring on 3, pinky on 4. Fingertips on their tips, thumb behind the neck. Set the BPM to 50, one note per click.\nYou\'ve got it when: all four notes ring clean — no buzz — three times in a row. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'Evento 1 — la Escalera. Un dedo por traste: índice en el 1, medio en el 2, anular en el 3, meñique en el 4. Puntas de los dedos, pulgar detrás del mástil. Pon el BPM en 50, una nota por clic.\nLo tienes cuando: las cuatro notas suenan limpias — sin zumbido — tres veces seguidas. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
        tab: {
          caption: 'The Ladder · position 1',
          caption_es: 'La Escalera · posición 1',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'E', fret: 3, note: 'G',  midi: 43 },
            { string: 'E', fret: 4, note: 'G#', midi: 44 }
          ]
        },
      },
      {
        text: 'Now add the shift: climb 1-2-3-4, slide your whole hand up one fret, climb 2-3-4-5. The hand moves as one piece — the fingers keep their spacing.\nYou\'ve got it when: two full climbs back to back and your thumb stays behind the neck the whole way.',
        text_es: 'Ahora agrega el cambio: sube 1-2-3-4, desliza toda la mano un traste hacia arriba, y sube 2-3-4-5. La mano se mueve como una sola pieza — los dedos mantienen su separación.\nLo tienes cuando: dos subidas completas seguidas y tu pulgar se queda detrás del mástil todo el tiempo.',
        tab: {
          caption: 'The Ladder · with the shift',
          caption_es: 'La Escalera · con el cambio',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'E', fret: 3, note: 'G',  midi: 43 },
            { string: 'E', fret: 4, note: 'G#', midi: 44 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'E', fret: 3, note: 'G',  midi: 43 },
            { string: 'E', fret: 4, note: 'G#', midi: 44 },
            { string: 'E', fret: 5, note: 'A',  midi: 45 }
          ]
        },
      },
      {
        text: 'Event 2 — the Spider. Same four fingers, but now they alternate between two strings: low E, A, low E, A. The trap: finger 3 wants to follow finger 2 onto the A string — send it back down to the low E. Then shift up one fret and repeat.\nYou\'ve got it when: one full pass with every note on the right string, any speed.',
        text_es: 'Evento 2 — la Araña. Los mismos cuatro dedos, pero ahora alternan entre dos cuerdas: Mi grave, La, Mi grave, La. La trampa: el dedo 3 quiere seguir al dedo 2 hacia la cuerda La — mándalo de vuelta a la cuerda Mi grave. Después sube un traste y repite.\nLo tienes cuando: una pasada completa con cada nota en la cuerda correcta, a cualquier velocidad.',
        tab: {
          caption: 'The Spider · cross the strings',
          caption_es: 'La Araña · cruza las cuerdas',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41 },
            { string: 'A', fret: 2, note: 'B',  midi: 47 },
            { string: 'E', fret: 3, note: 'G',  midi: 43 },
            { string: 'A', fret: 4, note: 'C#', midi: 49 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'A', fret: 3, note: 'C',  midi: 48 },
            { string: 'E', fret: 4, note: 'G#', midi: 44 },
            { string: 'A', fret: 5, note: 'D',  midi: 50 }
          ]
        },
      },
      {
        text: 'Event 3 — the Reach. Plant finger 1 on fret 1 and leave it there. Reach your pinky to fret 5, then bring it back. Stretch, never pain — if it hurts, stop. Reaching fret 4 instead counts too; the stretch grows over weeks.\nYou\'ve got it when: four reaches in a row and finger 1 never lifts.',
        text_es: 'Evento 3 — el Estiramiento. Planta el dedo 1 en el traste 1 y déjalo ahí. Estira el meñique hasta el traste 5, y regrésalo. Estira sin dolor — si duele, detente. Llegar al traste 4 también cuenta; el estiramiento crece con las semanas.\nLo tienes cuando: cuatro estiramientos seguidos y el dedo 1 nunca se levanta.',
        tab: {
          caption: 'The Reach · finger 1 stays down',
          caption_es: 'El Estiramiento · el dedo 1 no se levanta',
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 5, note: 'A', midi: 45 }
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
    number: 4,
    title:    'Finger Gym 2 — Down and Across',
    title_es: 'Gimnasio de Dedos 2 — Bajando y cruzando',
    intro:    'Last Gym went up. Today you come back down, then take the Ladder onto all six strings. Going down is harder than going up — the pinky has to lead.',
    intro_es: 'El Gimnasio pasado subiste. Hoy vas a bajar, y después vas a llevar la Escalera a las seis cuerdas. Bajar es más difícil que subir — el meñique tiene que ir primero.',
    steps: [
      {
        figure: 'img/ca-fg-gym-zone.svg',
        text: 'Same gym as last time: the first five frets. What changes today is the direction you travel and how many strings you use.',
        text_es: 'El mismo gimnasio que la vez pasada: los primeros cinco trastes. Lo que cambia hoy es la dirección en la que te mueves y cuántas cuerdas usas.',
      },
      {
        text: 'The Ladder backwards. Pinky on fret 4 first, then ring on 3, middle on 2, index on 1. Set the BPM to 50. Your pinky is the weakest finger and it goes first — that\'s the whole point.\nYou\'ve got it when: all four notes ring clean — no buzz — three times in a row. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'La Escalera al revés. Primero el meñique en el traste 4, después el anular en el 3, el medio en el 2 y el índice en el 1. Pon el BPM en 50. Tu meñique es el dedo más débil y va primero — de eso se trata.\nLo tienes cuando: las cuatro notas suenan limpias — sin zumbido — tres veces seguidas. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
        tab: {
          caption: 'Down the Ladder · pinky leads',
          caption_es: 'Bajando la Escalera · el meñique va primero',
          notes: [
            { string: 'E', fret: 4, note: 'G#', midi: 44 },
            { string: 'E', fret: 3, note: 'G',  midi: 43 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'E', fret: 1, note: 'F',  midi: 41 }
          ]
        },
      },
      {
        text: 'Up and straight back down, no pause at the top. The turnaround is the tricky spot — fret 4 gets played once, not twice.\nYou\'ve got it when: four times through without stopping.',
        text_es: 'Sube y baja de inmediato, sin pausa arriba. La vuelta es el punto difícil — el traste 4 se toca una sola vez, no dos.\nLo tienes cuando: cuatro veces seguidas sin detenerte.',
        tab: {
          caption: 'Up and back · one turnaround',
          caption_es: 'Subir y bajar · una vuelta',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'E', fret: 3, note: 'G',  midi: 43 },
            { string: 'E', fret: 4, note: 'G#', midi: 44 },
            { string: 'E', fret: 3, note: 'G',  midi: 43 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'E', fret: 1, note: 'F',  midi: 41 }
          ]
        },
      },
      {
        text: 'Move the same climb over: the A string, then the D string. The shape never changes — only which string your fingers land on.\nYou\'ve got it when: no buzz on any of the four notes, on both strings.',
        text_es: 'Mueve la misma subida: la cuerda La, y después la cuerda Re. El patrón nunca cambia — solo cambia en qué cuerda caen tus dedos.\nLo tienes cuando: sin zumbido en ninguna de las cuatro notas, en las dos cuerdas.',
        tab: {
          caption: 'A string, then D string',
          caption_es: 'Cuerda La, después cuerda Re',
          notes: [
            { string: 'A', fret: 1, note: 'A#', midi: 46 },
            { string: 'A', fret: 2, note: 'B',  midi: 47 },
            { string: 'A', fret: 3, note: 'C',  midi: 48 },
            { string: 'A', fret: 4, note: 'C#', midi: 49 },
            { string: 'D', fret: 1, note: 'D#', midi: 51 },
            { string: 'D', fret: 2, note: 'E',  midi: 52 },
            { string: 'D', fret: 3, note: 'F',  midi: 53 },
            { string: 'D', fret: 4, note: 'F#', midi: 54 }
          ]
        },
      },
      {
        text: 'Now the three thin strings — G, B, and high e. They buzz more easily because they\'re thinner, so press just behind the fret, not on top of it.\nYou\'ve got it when: all three strings, no stopping, any speed.',
        text_es: 'Ahora las tres cuerdas delgadas — Sol, Si y Mi aguda. Zumban más fácil porque son más delgadas, así que presiona justo detrás del traste, no encima.\nLo tienes cuando: las tres cuerdas, sin detenerte, a cualquier velocidad.',
        tab: {
          caption: 'G · B · high e — thin strings buzz easier',
          caption_es: 'Sol · Si · Mi aguda — las delgadas zumban más fácil',
          notes: [
            { string: 'G', fret: 1, note: 'G#', midi: 56 },
            { string: 'G', fret: 2, note: 'A',  midi: 57 },
            { string: 'G', fret: 3, note: 'A#', midi: 58 },
            { string: 'G', fret: 4, note: 'B',  midi: 59 },
            { string: 'B', fret: 1, note: 'C',  midi: 60 },
            { string: 'B', fret: 2, note: 'C#', midi: 61 },
            { string: 'B', fret: 3, note: 'D',  midi: 62 },
            { string: 'B', fret: 4, note: 'D#', midi: 63 },
            { string: 'e', fret: 1, note: 'F',  midi: 65 },
            { string: 'e', fret: 2, note: 'F#', midi: 66 },
            { string: 'e', fret: 3, note: 'G',  midi: 67 },
            { string: 'e', fret: 4, note: 'G#', midi: 68 }
          ]
        },
      },
      {
        text: 'The circuit:<ol><li>Climb up and back down on all six strings — low E to high e and home again. That\'s one set.</li><li>Every clean set, raise the BPM by 10 and write down your best.</li></ol>You\'ve got it when: two full sets done and today\'s best clean BPM is written down.',
        text_es: 'El circuito:<ol><li>Sube y baja en las seis cuerdas — de la Mi grave a la Mi aguda y de regreso. Esa es una serie.</li><li>Cada serie limpia, sube el BPM 10 puntos y anota tu mejor marca.</li></ol>Lo tienes cuando: dos series completas hechas y tu mejor BPM limpio de hoy está anotado.',
      },
    ],
  },
  {
    id:    'ca-4',
    number: 5,
    title:    'Finger Gym 3 — Up the Neck',
    title_es: 'Gimnasio de Dedos 3 — Subiendo el mástil',
    intro:    'So far the gym has lived in the first five frets. Today you move it up the neck. The frets get narrower as you climb, so the same shape feels different in every position.',
    intro_es: 'Hasta ahora el gimnasio ha vivido en los primeros cinco trastes. Hoy lo mueves hacia arriba del mástil. Los trastes se hacen más angostos mientras subes, así que el mismo patrón se siente distinto en cada posición.',
    steps: [
      {
        figure: 'img/ca-fg-dots.svg',
        text: 'The dots on the neck are your landing marks: frets 5, 7, 9, and the double dot at 12. Learn to find them with your eyes before your hand goes there.',
        text_es: 'Los puntos en el mástil son tus marcas de referencia: los trastes 5, 7, 9 y el punto doble en el 12. Aprende a encontrarlos con la vista antes de que llegue tu mano.',
      },
      {
        text: 'The Ladder in 5th position: index on fret 5, one finger per fret up to 8. Your index finger sits on a dot — that\'s how you know you\'re home. BPM 50.\nYou\'ve got it when: all four notes clean, no buzz, three times in a row. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'La Escalera en la 5.ª posición: índice en el traste 5, un dedo por traste hasta el 8. Tu índice queda sobre un punto — así sabes que estás en tu lugar. BPM 50.\nLo tienes cuando: las cuatro notas limpias, sin zumbido, tres veces seguidas. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
        tab: {
          caption: '5th position · index on the dot',
          caption_es: '5.ª posición · el índice sobre el punto',
          notes: [
            { string: 'E', fret: 5, note: 'A',  midi: 45 },
            { string: 'E', fret: 6, note: 'A#', midi: 46 },
            { string: 'E', fret: 7, note: 'B',  midi: 47 },
            { string: 'E', fret: 8, note: 'C',  midi: 48 }
          ]
        },
      },
      {
        text: 'Add the shift, two frets up this time: climb 5-6-7-8, slide the whole hand to 7, climb 7-8-9-10. The hand travels as one piece.\nYou\'ve got it when: two full climbs back to back and your thumb stays behind the neck the whole way.',
        text_es: 'Agrega el cambio, esta vez dos trastes: sube 5-6-7-8, desliza toda la mano al 7 y sube 7-8-9-10. La mano viaja como una sola pieza.\nLo tienes cuando: dos subidas completas seguidas y tu pulgar se queda detrás del mástil todo el tiempo.',
        tab: {
          caption: '5th position into 7th',
          caption_es: 'De la 5.ª posición a la 7.ª',
          notes: [
            { string: 'E', fret: 5,  note: 'A',  midi: 45 },
            { string: 'E', fret: 6,  note: 'A#', midi: 46 },
            { string: 'E', fret: 7,  note: 'B',  midi: 47 },
            { string: 'E', fret: 8,  note: 'C',  midi: 48 },
            { string: 'E', fret: 7,  note: 'B',  midi: 47 },
            { string: 'E', fret: 8,  note: 'C',  midi: 48 },
            { string: 'E', fret: 9,  note: 'C#', midi: 49 },
            { string: 'E', fret: 10, note: 'D',  midi: 50 }
          ]
        },
      },
      {
        text: 'Now the jump. Index on fret 1, then straight to fret 5, then to fret 9 — one note each, no walking up. Look at the dot, then move. After three tries, look away and let your hand find it.\nYou\'ve got it when: you can look away and land all three, three times out of three.',
        text_es: 'Ahora el salto. Índice en el traste 1, después directo al 5, después al 9 — una nota en cada uno, sin caminar. Mira el punto y muévete. Después de tres intentos, voltea la mirada y deja que tu mano lo encuentre.\nLo tienes cuando: puedes voltear la mirada y caer en los tres, tres de tres veces.',
        tab: {
          caption: 'Jump · fret 1 to 5 to 9',
          caption_es: 'Salto · del traste 1 al 5 al 9',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41 },
            { string: 'E', fret: 5, note: 'A',  midi: 45 },
            { string: 'E', fret: 9, note: 'C#', midi: 49 }
          ]
        },
      },
      {
        text: 'The Ladder in 9th position, up to the double dot at 12. These frets are the narrowest on the neck, so your fingers are crowded — keep them on their tips or they\'ll bump each other.\nYou\'ve got it when: no buzz on any of the four.',
        text_es: 'La Escalera en la 9.ª posición, hasta el punto doble del traste 12. Estos son los trastes más angostos del mástil, así que tus dedos van apretados — mantenlos sobre las puntas o se van a chocar entre sí.\nLo tienes cuando: sin zumbido en ninguna de las cuatro.',
        tab: {
          caption: '9th position · narrowest frets',
          caption_es: '9.ª posición · los trastes más angostos',
          notes: [
            { string: 'E', fret: 9,  note: 'C#', midi: 49 },
            { string: 'E', fret: 10, note: 'D',  midi: 50 },
            { string: 'E', fret: 11, note: 'D#', midi: 51 },
            { string: 'E', fret: 12, note: 'E',  midi: 52 }
          ]
        },
      },
      {
        text: 'The circuit:<ol><li>Play the Ladder in 1st position, 5th, then 9th, then all the way back down — that\'s one set.</li><li>Every clean set, raise the BPM by 10 and write down your best.</li></ol>You\'ve got it when: two full sets done and today\'s best clean BPM is written down.',
        text_es: 'El circuito:<ol><li>Toca la Escalera en la 1.ª posición, la 5.ª, la 9.ª, y de regreso hasta abajo — esa es una serie.</li><li>Cada serie limpia, sube el BPM 10 puntos y anota tu mejor marca.</li></ol>Lo tienes cuando: dos series completas hechas y tu mejor BPM limpio de hoy está anotado.',
      },
    ],
  },
  {
    id:    'ca-5',
    number: 6,
    title:    'Finger Gym 4 — Leave Them Down',
    title_es: 'Gimnasio de Dedos 4 — Déjalos abajo',
    intro:    'Until now your fingers took turns. Today they stay down. Every finger that has already played keeps touching the string — that\'s what makes chords possible later.',
    intro_es: 'Hasta ahora tus dedos se tomaban turnos. Hoy se quedan abajo. Cada dedo que ya tocó sigue apoyado en la cuerda — eso es lo que hace posibles los acordes más adelante.',
    steps: [
      {
        figure: 'img/ca-fg-gym-zone.svg',
        text: 'Back to the first five frets. The notes are the same as Gym 1 — what changes is that nothing lifts.',
        text_es: 'De vuelta a los primeros cinco trastes. Las notas son las mismas del Gimnasio 1 — lo que cambia es que nada se levanta.',
      },
      {
        text: 'Plant-as-you-go. Climb 1-2-3-4, but each finger stays where it lands. By the last note all four fingers are on the string at once. BPM 50.\nYou\'ve got it when: at fret 4 all four fingers are still touching, three times in a row. Buzz twice? Drop the BPM by 10 and try again.',
        text_es: 'Planta y sigue. Sube 1-2-3-4, pero cada dedo se queda donde cayó. En la última nota los cuatro dedos están sobre la cuerda a la vez. BPM 50.\nLo tienes cuando: al llegar al traste 4 los cuatro dedos siguen apoyados, tres veces seguidas. ¿Zumbó dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
        tab: {
          caption: 'Plant as you go · nothing lifts',
          caption_es: 'Planta y sigue · nada se levanta',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'E', fret: 3, note: 'G',  midi: 43 },
            { string: 'E', fret: 4, note: 'G#', midi: 44 }
          ]
        },
      },
      {
        text: 'Pair 1-3: alternate index on fret 1 and ring on fret 3, back and forth. The two fingers not playing stay down on their frets. This is finger independence — one finger moving while the others don\'t.\nYou\'ve got it when: eight clean alternations in a row.',
        text_es: 'Pareja 1-3: alterna el índice en el traste 1 y el anular en el traste 3, de ida y vuelta. Los dos dedos que no tocan se quedan abajo en sus trastes. Esto es independencia de dedos — un dedo se mueve mientras los otros no.\nLo tienes cuando: ocho alternancias limpias seguidas.',
        tab: {
          caption: 'Pair 1-3',
          caption_es: 'Pareja 1-3',
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 3, note: 'G', midi: 43 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 3, note: 'G', midi: 43 }
          ]
        },
      },
      {
        text: 'Pair 3-4 — ring and pinky, the hardest pair on the hand. They share a tendon, so they want to move together. Go slow enough that only one moves at a time.\nYou\'ve got it when: eight in a row, no buzz, and the other fingers never leave the string.',
        text_es: 'Pareja 3-4 — anular y meñique, la pareja más difícil de la mano. Comparten un tendón, así que quieren moverse juntos. Ve lo suficientemente lento para que solo uno se mueva a la vez.\nLo tienes cuando: ocho seguidas, sin zumbido, y los otros dedos nunca dejan la cuerda.',
        tab: {
          caption: 'Pair 3-4 · the hard one',
          caption_es: 'Pareja 3-4 · la difícil',
          notes: [
            { string: 'E', fret: 3, note: 'G',  midi: 43 },
            { string: 'E', fret: 4, note: 'G#', midi: 44 },
            { string: 'E', fret: 3, note: 'G',  midi: 43 },
            { string: 'E', fret: 4, note: 'G#', midi: 44 }
          ]
        },
      },
      {
        text: 'Out of order: 1-3-2-4. Fingers keep landing and staying, but not in a line — your middle finger has to reach past a finger that\'s already down.\nYou\'ve got it when: four times through without stopping.',
        text_es: 'Fuera de orden: 1-3-2-4. Los dedos siguen cayendo y quedándose, pero no en fila — tu dedo medio tiene que pasar por encima de un dedo que ya está abajo.\nLo tienes cuando: cuatro veces seguidas sin detenerte.',
        tab: {
          caption: 'Out of order · 1-3-2-4',
          caption_es: 'Fuera de orden · 1-3-2-4',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41 },
            { string: 'E', fret: 3, note: 'G',  midi: 43 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'E', fret: 4, note: 'G#', midi: 44 }
          ]
        },
      },
      {
        text: 'The circuit:<ol><li>Play 1-3-2-4 on the low E string, then the A string, then the D string, fingers staying down the whole way. That\'s one set.</li><li>Every clean set, raise the BPM by 10 and write down your best.</li></ol>You\'ve got it when: two full sets done and today\'s best clean BPM is written down.',
        text_es: 'El circuito:<ol><li>Toca 1-3-2-4 en la cuerda Mi grave, después en la cuerda La, después en la cuerda Re, con los dedos abajo todo el tiempo. Esa es una serie.</li><li>Cada serie limpia, sube el BPM 10 puntos y anota tu mejor marca.</li></ol>Lo tienes cuando: dos series completas hechas y tu mejor BPM limpio de hoy está anotado.',
      },
    ],
  },
  {
    id:    'ca-6',
    number: 7,
    title:    'Finger Gym 5 — Skip and Stretch',
    title_es: 'Gimnasio de Dedos 5 — Salta y estira',
    intro:    'Two new demands today: skipping over a string without hitting it, and reaching one fret farther than your hand wants to go.',
    intro_es: 'Hoy hay dos exigencias nuevas: saltar sobre una cuerda sin tocarla, y estirar un traste más allá de donde tu mano quiere llegar.',
    steps: [
      {
        figure: 'img/ca-fg-gym-zone-skip.svg',
        text: 'The gym grows today: three strings deep — low E, A, and D — and one fret wider, out to fret 6. The distance is sideways now as well as along the neck.',
        text_es: 'Hoy el gimnasio crece: tres cuerdas de profundidad — Mi grave, La y Re — y un traste más de ancho, hasta el traste 6. Ahora la distancia también es de lado, además de a lo largo del mástil.',
      },
      {
        text: 'The skip. Index on the low E string at fret 1, then ring on the D string at fret 3 — jumping over the A string without letting it sound. Pick straight down onto the string you want.\nYou\'ve got it when: eight jumps in a row and the A string never rings. Hear it ring twice? Drop the BPM by 10 and try again.',
        text_es: 'El salto. Índice en la cuerda Mi grave, traste 1, después anular en la cuerda Re, traste 3 — saltando por encima de la cuerda La sin dejarla sonar. Pulsa directo hacia abajo sobre la cuerda que quieres.\nLo tienes cuando: ocho saltos seguidos y la cuerda La nunca suena. ¿La oyes sonar dos veces? Baja el BPM 10 puntos y vuelve a intentarlo.',
        tab: {
          caption: 'The skip · over the A string',
          caption_es: 'El salto · por encima de la cuerda La',
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'D', fret: 3, note: 'F', midi: 53 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'D', fret: 3, note: 'F', midi: 53 }
          ]
        },
      },
      {
        text: 'The Spider with a skip. Same alternating pattern as always, but between the low E and D strings instead of neighbours. Then shift up one fret and repeat.\nYou\'ve got it when: one full pass with every note on the right string, any speed.',
        text_es: 'La Araña con salto. El mismo patrón alternado de siempre, pero entre la cuerda Mi grave y la cuerda Re, no entre vecinas. Después sube un traste y repite.\nLo tienes cuando: una pasada completa con cada nota en la cuerda correcta, a cualquier velocidad.',
        tab: {
          caption: 'Spider · low E to D, skipping A',
          caption_es: 'Araña · de Mi grave a Re, saltando La',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41 },
            { string: 'D', fret: 2, note: 'E',  midi: 52 },
            { string: 'E', fret: 3, note: 'G',  midi: 43 },
            { string: 'D', fret: 4, note: 'F#', midi: 54 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'D', fret: 3, note: 'F',  midi: 53 },
            { string: 'E', fret: 4, note: 'G#', midi: 44 },
            { string: 'D', fret: 5, note: 'G',  midi: 55 }
          ]
        },
      },
      {
        text: 'The wide Reach. Index plants on fret 1 and stays. Pinky goes to fret 6 — one farther than last time. Stretch, never pain; if the wrist hurts, stop. Fret 5 still counts, and it still gets you stronger.\nYou\'ve got it when: four reaches in a row and finger 1 never lifts.',
        text_es: 'El Estiramiento ancho. El índice se planta en el traste 1 y se queda. El meñique va al traste 6 — uno más que la vez pasada. Estira sin dolor; si te duele la muñeca, detente. El traste 5 sigue contando, y sigue haciéndote más fuerte.\nLo tienes cuando: cuatro estiramientos seguidos y el dedo 1 nunca se levanta.',
        tab: {
          caption: 'Wide Reach · fret 1 to fret 6',
          caption_es: 'Estiramiento ancho · del traste 1 al 6',
          notes: [
            { string: 'E', fret: 1, note: 'F',  midi: 41 },
            { string: 'E', fret: 6, note: 'A#', midi: 46 },
            { string: 'E', fret: 1, note: 'F',  midi: 41 },
            { string: 'E', fret: 6, note: 'A#', midi: 46 }
          ]
        },
      },
      {
        text: 'Reach across strings: index on the low E at fret 2, pinky on the A string at fret 5. Both notes ring together if you can hold the shape — a stretch that builds the reach and control you\'ll need for power chords (their real shape is a bit different; Module 3 teaches it).\nYou\'ve got it when: both notes ring at the same time, four times in a row.',
        text_es: 'Estiramiento entre cuerdas: índice en la cuerda Mi grave, traste 2, y meñique en la cuerda La, traste 5. Las dos notas suenan juntas si puedes sostener la forma — un estiramiento que construye el alcance y el control que vas a necesitar para los acordes de potencia (su forma real es un poco distinta; el Módulo 3 la enseña).\nLo tienes cuando: las dos notas suenan al mismo tiempo, cuatro veces seguidas.',
        tab: {
          caption: 'Across the strings · both notes ringing',
          caption_es: 'Entre cuerdas · las dos notas suenan',
          notes: [
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'A', fret: 5, note: 'D',  midi: 50 }
          ]
        },
      },
      {
        text: 'The circuit:<ol><li>Run skip Spider ×4, wide Reach ×4, across-the-strings ×4 — that\'s one set.</li><li>Every clean set, raise the BPM by 10 and write down your best.</li></ol>You\'ve got it when: two full sets done and today\'s best clean BPM is written down.',
        text_es: 'El circuito:<ol><li>Toca Araña con salto ×4, Estiramiento ancho ×4, entre cuerdas ×4 — esa es una serie.</li><li>Cada serie limpia, sube el BPM 10 puntos y anota tu mejor marca.</li></ol>Lo tienes cuando: dos series completas hechas y tu mejor BPM limpio de hoy está anotado.',
      },
    ],
  },
  {
    id:    'ca-7',
    number: 8,
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
            { string: 'E', fret: 1, note: 'F',  midi: 41 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'E', fret: 3, note: 'G',  midi: 43 },
            { string: 'E', fret: 4, note: 'G#', midi: 44 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'E', fret: 3, note: 'G',  midi: 43 },
            { string: 'E', fret: 4, note: 'G#', midi: 44 },
            { string: 'E', fret: 5, note: 'A',  midi: 45 }
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
            { string: 'E', fret: 1, note: 'F',  midi: 41 },
            { string: 'A', fret: 2, note: 'B',  midi: 47 },
            { string: 'E', fret: 3, note: 'G',  midi: 43 },
            { string: 'A', fret: 4, note: 'C#', midi: 49 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'A', fret: 3, note: 'C',  midi: 48 },
            { string: 'E', fret: 4, note: 'G#', midi: 44 },
            { string: 'A', fret: 5, note: 'D',  midi: 50 }
          ]
        },
      },
      {
        text: 'Reach endurance — eight reaches without stopping, twice as many as usual. The hand will start to complain around six; that\'s the part that builds strength. Pain is different from work: if it hurts, stop.\nYou\'ve got it when: eight reaches without stopping and finger 1 never lifts.',
        text_es: 'Resistencia en el Estiramiento — ocho estiramientos sin detenerte, el doble de lo normal. La mano va a empezar a quejarse cerca del sexto; esa es la parte que construye fuerza. El dolor es distinto del esfuerzo: si duele, detente.\nLo tienes cuando: ocho estiramientos sin detenerte y el dedo 1 nunca se levanta.',
        tab: {
          caption: 'Reach endurance · eight in a row',
          caption_es: 'Resistencia · ocho seguidos',
          notes: [
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 5, note: 'A', midi: 45 },
            { string: 'E', fret: 1, note: 'F', midi: 41 },
            { string: 'E', fret: 5, note: 'A', midi: 45 }
          ]
        },
      },
      {
        text: 'The whole circuit, twice through, without putting the guitar down between sets. Ladder ×4, Spider ×4, Reach ×4, then again.\nYou\'ve got it when: two sets back to back with no break in between.',
        text_es: 'El circuito completo, dos veces, sin bajar la guitarra entre series. Escalera ×4, Araña ×4, Estiramiento ×4, y otra vez.\nLo tienes cuando: dos series seguidas sin descanso entre ellas.',
      },
      {
        text: 'Record attempt. Set the BPM to your record and go up by 10 every clean set. Stop when a set breaks down — the last clean number is your new record. Write it down.\nYou\'ve got it when: you\'ve written down a number and you know whether it beat the old one.',
        text_es: 'Intento de récord. Pon el BPM en tu récord y súbelo 10 puntos con cada serie limpia. Detente cuando una serie se rompa — el último número limpio es tu récord nuevo. Anótalo.\nLo tienes cuando: anotaste un número y sabes si superó el anterior.',
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
        text: 'This is the low E string — the thick one, closest to your face. The whole phrase lives here: the open string (0 = no finger) is the note E, fret 2 is F#, fret 4 is G#, and fret 5 is A. The faint dots on the neck — frets 3, 5, 7, 9 and 12 — are a map, and the dot at fret 5 is your landing mark.',
        text_es: 'Esta es la cuerda Mi grave — la más gruesa, la que queda más cerca de tu cara. Toda la frase vive aquí: la cuerda al aire (0 = sin dedo) es la nota E, el traste 2 es F#, el traste 4 es G# y el traste 5 es A. Los puntos tenues del mástil — trastes 3, 5, 7, 9 y 12 — son un mapa, y el punto en el traste 5 es tu marca para caer.',
      },
      {
        text: '<ol><li>Fingertip just behind fret 5 — next to the metal strip, not on top of it. Thumb behind the neck.</li><li>Pluck it. A rattly, dead sound is a buzz — slide the fingertip closer to the fret and press again.</li><li>Now the move: pluck the open string, then land on fret 5 and pluck again. Let the dot catch your eye before your finger jumps.</li></ol>You\'ve got it when: three landings in a row on A ring clean, no buzz. Buzz twice? Slide the fingertip closer to the fret and press with the very tip.',
        text_es: '<ol><li>La punta del dedo justo detrás del traste 5 — pegada a la barrita de metal, no encima de ella. El pulgar detrás del mástil.</li><li>Tócala. Un sonido que traquetea o suena apagado es un zumbido — desliza la punta del dedo más cerca del traste y presiona otra vez.</li><li>Ahora el movimiento: toca la cuerda al aire, luego cae en el traste 5 y toca otra vez. Deja que el punto te llame la atención antes de que salte el dedo.</li></ol>Lo tienes cuando: tres caídas seguidas en A suenan limpias, sin zumbido. ¿Zumbó dos veces? Desliza la punta del dedo más cerca del traste y presiona con la puntita.',
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
          caption: '"Hap-py birth-day" — the first chunk',
          caption_es: '"Hap-py birth-day" — el primer fragmento',
          notes: [
            { string: 'E', fret: 0, note: 'E',  midi: 40 },
            { string: 'E', fret: 0, note: 'E',  midi: 40 },
            { string: 'E', fret: 2, note: 'F#', midi: 42 },
            { string: 'E', fret: 0, note: 'E',  midi: 40 }
          ]
        },
      },
      {
        text: 'Put it together: the chunk, then the landing — fret 5, then fret 4. That\'s the whole first line of the song.\nYou\'ve got it when: three clean runs without stopping, saying the words as you play.',
        text_es: 'Júntalo todo: el fragmento y luego la caída — traste 5 y luego traste 4. Esa es la primera línea completa de la canción.\nLo tienes cuando: tres pasadas limpias sin detenerte, diciendo las palabras mientras tocas.',
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
        text: 'Keep going — there\'s no finish line on this one. Set the player above to 60 BPM and play the phrase with the beat. Every clean pass, raise the BPM by 10.\nYou\'ve got it when: you\'ve raised the BPM twice without breaking down — then keep climbing. Fast already? Say each note\'s name as you land it — E, F#, G#, A.',
        text_es: 'Sigue — aquí no hay meta final. Pon el reproductor de arriba en 60 BPM y toca la frase con el pulso. Con cada pasada limpia, súbele 10 al BPM.\nLo tienes cuando: ya subiste el BPM dos veces sin perder el ritmo — y de ahí, sigue subiendo. ¿Ya vas rápido? Di el nombre de cada nota al caer en ella — E, F#, G#, A.',
      },
    ],
  },
];
