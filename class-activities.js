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
];
