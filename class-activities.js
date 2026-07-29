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
    title:    'Playing Happy Birthday — Part 1: Find Your Notes',
    title_es: 'Tocando Happy Birthday — Parte 1: Encuentra tus notas',
    intro:    'Before you can play a song, your fingers need to know where its notes live. Today: hear the song a few ways, then learn one fret shape that unlocks the whole melody — starting from the open low E string.',
    intro_es: 'Antes de poder tocar una canción, tus dedos necesitan saber dónde viven sus notas. Hoy: escucha la canción de varias maneras, y luego aprende un patrón de trastes que desbloquea toda la melodía, empezando desde la cuerda Mi grave al aire.',
    steps: [
      {
        text: 'Same melody, three very different sounds. Listen to 30–45 seconds of this solo fingerstyle version. What one word describes its sound?',
        text_es: 'La misma melodía, tres sonidos muy diferentes. Escucha 30–45 segundos de esta versión solista en fingerstyle. ¿Qué palabra describe su sonido?',
        video: { id: 'zQ8MIPlNGP0', label: 'Fingerstyle guitar', label_es: 'Guitarra fingerstyle' },
      },
      {
        text: 'Now a mariachi version — same notes, whole different feel. Tell a neighbor: what changed?',
        text_es: 'Ahora una versión de mariachi — las mismas notas, una sensación totalmente distinta. Cuéntale a un compañero: ¿qué cambió?',
        video: { id: 'OcuP7gNWCDA', label: 'Mariachi', label_es: 'Mariachi' },
      },
      {
        text: 'Last one: electric rock. You\'ve got it when: you can name one thing all three versions share and one thing that made each one different.',
        text_es: 'Última: rock eléctrico. Lo tienes cuando: puedes nombrar algo que las tres versiones comparten y algo que hizo diferente a cada una.',
        video: { id: 'WlC0O_UXXA0', label: 'Electric rock', label_es: 'Rock eléctrico' },
      },
      {
        figure: 'img/ca-hb-low-e.svg',
        text: 'This song starts on a note you don\'t even have to fret: the open low E string (the thickest one). Every other note on this string sits in one small shape:<ol><li>Play the open string. That\'s E — home base.</li><li>Press fret 2 — F#. (A # means "sharp": one fret higher than the plain note.)</li><li>Press fret 4 — G#.</li><li>Press fret 5 — right at the first dot on the neck. That\'s A.</li></ol>The dots at frets 3, 5, 7, 9 (and the double dot at 12) are a map — you never have to count frets from the end. You\'ve got it when: you can play E, F#, G#, A up and back down, saying each name out loud, landing on A by its dot without counting.',
        text_es: 'Esta canción empieza en una nota que ni siquiera tienes que trastear: la cuerda Mi grave al aire (la más gruesa). Cada otra nota de esta cuerda cabe en un patrón sencillo:<ol><li>Toca la cuerda al aire. Esa es E — tu punto de partida.</li><li>Presiona el traste 2 — F#. (Un # significa "sostenido": un traste más alto que la nota natural.)</li><li>Presiona el traste 4 — G#.</li><li>Presiona el traste 5 — justo en el primer punto del diapasón. Esa es A.</li></ol>Los puntos en los trastes 3, 5, 7, 9 (y el punto doble en el 12) son un mapa — nunca tienes que contar trastes desde el final. Lo tienes cuando: puedes tocar E, F#, G#, A subiendo y bajando, diciendo cada nombre en voz alta, y llegar a A por su punto sin contar.',
      },
      {
        figure: 'img/ca-hb-a.svg',
        text: 'Here\'s the trick that unlocks the rest of the song: the A string (next one down) uses the SAME shape.<ol><li>Open string — A. Home base again.</li><li>Fret 2 — B.</li><li>Fret 4 — C#.</li><li>Fret 5, at the dot — D.</li><li>One new spot: fret 7, at the next dot — E.</li></ol>You\'ve got it when: a partner calls out any note from either string chart and you land on it within 3 seconds — dots first, counting never.',
        text_es: 'Aquí está el truco que desbloquea el resto de la canción: la cuerda La (la siguiente hacia abajo) usa la MISMA forma.<ol><li>Cuerda al aire — A. Tu punto de partida otra vez.</li><li>Traste 2 — B.</li><li>Traste 4 — C#.</li><li>Traste 5, en el punto — D.</li><li>Un lugar nuevo: traste 7, en el siguiente punto — E.</li></ol>Lo tienes cuando: un compañero dice cualquier nota de cualquiera de los dos diagramas y la encuentras en 3 segundos o menos — primero por los puntos, nunca contando.',
      },
      {
        text: 'Go back through every fretted note you just found — both strings:<ol><li>Press just behind the fret wire (not on top of it), fingertip curled.</li><li>Pick the string once. Clean, or buzzy?</li><li>If it buzzes: press a little harder and scoot closer to the fret wire. Pick again.</li><li>Play each note 4 times in a row, clean.</li></ol>You\'ve got it when: every note in both charts rings clean 4 times — those are all the notes in "Happy Birthday".',
        text_es: 'Repasa cada nota trasteada que acabas de encontrar — en las dos cuerdas:<ol><li>Presiona justo detrás del traste (no encima), con la punta del dedo curvada.</li><li>Toca la cuerda una vez. ¿Suena limpia o zumba?</li><li>Si zumba: presiona un poco más fuerte y acércate más al traste. Vuelve a tocar.</li><li>Toca cada nota 4 veces seguidas, limpia.</li></ol>Lo tienes cuando: cada nota de los dos diagramas suena limpia 4 veces — esas son todas las notas de "Happy Birthday".',
      },
      {
        text: 'Read the TAB below — the numbers are fret numbers, 0 means open string. Every note is one you just found. Start slow; click Play tab to hear it. You\'ve got it when: you play phrase 1 four times through without stopping.',
        text_es: 'Lee el TAB de abajo — los números son números de traste, 0 significa cuerda al aire. Cada nota es una que ya encontraste. Empieza lento; haz clic en Play tab para escucharlo. Lo tienes cuando: tocas la frase 1 cuatro veces seguidas sin detenerte.',
        tab: {
          caption: '"Happy Birthday" — first half · E & A strings · start on the open low E',
          caption_es: '"Happy Birthday" — primera mitad · cuerdas Mi y La · empieza en la Mi grave al aire',
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
        text: 'Finish the song. Phrase 3 leaps up to the E at fret 7 on the A string — that\'s a dot, so let it catch your eye before your finger jumps. Take it as slow as you need. You\'ve got it when: you can play all four phrases back to back, any speed, without stopping.',
        text_es: 'Termina la canción. La frase 3 salta hasta el E en el traste 7 de la cuerda La — ese es un punto, así que déjalo llamar tu atención antes de que salte el dedo. Tómalo tan lento como necesites. Lo tienes cuando: puedes tocar las cuatro frases seguidas, a cualquier velocidad, sin detenerte.',
        tab: {
          caption: '"Happy Birthday" — second half · the jump to fret 7 is the hard part',
          caption_es: '"Happy Birthday" — segunda mitad · el salto al traste 7 es la parte difícil',
          phrases: [
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
    ],
  },
];
