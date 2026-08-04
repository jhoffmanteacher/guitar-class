/* ════════════════════════════════════════════════════════════════════
   Guitar Class — In-Class Activities (teacher-curated, day-specific work
   pushed out alongside the self-paced modules)

   An activity is LIVE the moment its entry lands on main — that's still the
   default and the only way to publish one; there is no draft/staging state
   here. The one override is a teacher-only "hide" toggle (Class activities
   view in teacher.js, backed by config/class.hiddenActivities in Firestore —
   see loadClassConfig() in app.js) for the rare case of pulling something
   back temporarily after an early push; a hidden activity is exactly as if
   it hadn't shipped, and un-hiding it makes it live again on the student's
   next page load. Activities never retire otherwise: this file is a
   permanent archive, newest first at render time (app.js sorts, this file
   doesn't need to be kept in date order).

   ids are PERMANENT — never renumber or reuse one. Student completion is
   keyed to the id in Firestore (classActivities: { [id]: true }), same
   rule as skill ids in the module files. If two activities land on the
   same day, suffix the second id -b, -c… (ca-2026-09-15-b).

   Every display string carries an `_es` twin, same convention as module
   files — rendered through tf(obj, field) in app.js (see the "field on a
   Set/skill/song/etc." comment there). Never ship an English-only string;
   add both in the same edit.

   SCHEMA
   {
     id:      'ca-2026-09-15',   // permanent, ^ca-\d{4}-\d{2}-\d{2}(-[b-z])?$
     date:    '2026-09-15',      // ISO — display + sort only; the id stays
                                  // fixed even if the date is later corrected
     number:  1,                 // permanent once shipped, same rule as id —
                                  // the sequence students hear it by ("Activity
                                  // #1"). Renders as "#N - Title"; don't bake
                                  // the "#N - " prefix into title itself.
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
    id:    'ca-2026-09-01',
    date:  '2026-09-01',
    number: 1,
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
    id:    'ca-2026-09-15',
    date:  '2026-09-15',
    number: 2,
    title:    'Finger Gym',
    title_es: 'Gimnasio de Dedos',
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
        text: 'The circuit: Ladder ×4, Spider ×4, Reach ×4 — that\'s one set. Start at 50 BPM. Every clean set, raise the BPM by 10: 50 is bronze, 60 is silver, 70 is gold. Write down your best clean BPM — that\'s your record to beat next Finger Gym day.\nYou\'ve got it when: two full sets done and today\'s best BPM is written down.',
        text_es: 'El circuito: Escalera ×4, Araña ×4, Estiramiento ×4 — eso es una serie. Empieza en 50 BPM. Cada serie limpia, sube el BPM 10 puntos: 50 es bronce, 60 es plata, 70 es oro. Anota tu mejor BPM limpio — ese es el récord que vas a superar el próximo día de Gimnasio de Dedos.\nLo tienes cuando: dos series completas hechas y tu mejor BPM de hoy está anotado.',
      },
    ],
  },
];
