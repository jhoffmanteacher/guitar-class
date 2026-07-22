// ============================================================
//  MODULE 7 — TAB Notation and Barre Chords
//  Edit this file to change Module 7 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm7w1',
    songThread: [{ name: 'Seven Nation Army', journey: 'tabs/seven-nation-army.html', note: 'the riff that started it all — now read it in full TAB with rhythm symbols' }],
    label: 'Set 1',
    locked: false,
    module: 'TAB Notation and Barre Chords',
    moduleNum: 7,
    unit: 'Module 7 · TAB Notation and Barre Chords',
    unit_es: 'Módulo 7 · Notación TAB y acordes con cejilla',
    title: 'Set 1',
    subtitle: 'Multi-line TAB · Rhythm in TAB · Riffs that mix notes and chords',
    subtitle_es: 'TAB de varias líneas · Ritmo en el TAB · Riffs que combinan notas y acordes',
    objective: 'I CAN read multi-line TAB with rhythm symbols and play a real riff (a short musical phrase that repeats) that combines single notes and chord stabs (a chord stab is a short, sharp chord hit once).',
    skillFocus: 'Reading multi-line TAB and rhythm symbols · Playing slides, hammer-ons, and pull-offs · Playing a riff of notes and chords',
    skillFocus_es: 'Leer TAB de varias líneas y símbolos de ritmo · Tocar deslizamientos, hammer-ons y pull-offs · Tocar un riff de notas y acordes',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        title_es: 'Estación de computadora — Mira · Escucha · Practica',
        sections: [
          {
            title: 'Watch: reading TAB and your riff',
            title_es: 'Mira: leer TAB y tu riff',
            steps: [
          {
            text: 'Watch: <a href="https://youtu.be/4-JTCASlh-w" target="_blank">How To Read TAB and Chord Boxes (BC-108) – JustinGuitar</a> (0:00–4:00).',
            text_es: 'Mira: <a href="https://youtu.be/4-JTCASlh-w" target="_blank">How To Read TAB and Chord Boxes (BC-108) – JustinGuitar</a> (0:00–4:00).',
            hint: 'You\'ve read single-note TAB since Module 1. Watch for two new things now. First: numbers STACKED vertically mean play them together (a chord). Second: the symbols above the numbers tell you how long each note lasts — plain stems are quarter notes, flags and beams are 8th notes, and a hollow (open) note head with a stem is a half note, held for two beats.',
            hint_es: 'Has leído TAB de una sola nota desde el Módulo 1. Ahora fíjate en dos cosas nuevas. Primero: los números APILADOS verticalmente significan que se tocan juntos (un acorde). Segundo: los símbolos arriba de los números indican cuánto dura cada nota — las plicas simples son negras (un tiempo), las banderas y barras son corcheas, y una cabeza de nota hueca (abierta) con plica es una blanca, sostenida por dos tiempos.',
            skills: [1, 2, 3],
            response: { type: 'mc', prompt: 'When two or more numbers in a TAB line up VERTICALLY on top of each other, you should:',
              prompt_es: 'Cuando dos o más números en un TAB se alinean VERTICALMENTE uno encima del otro, debes:',
              answer: 0,
              explain: 'Stacked numbers are a chord — strike those strings together in one motion. Numbers spread left-to-right are played one after another.',
              explain_es: 'Los números apilados son un acorde — golpea esas cuerdas juntas en un solo movimiento. Los números repartidos de izquierda a derecha se tocan uno tras otro.',
              choices: [
              'Play them at the same time (as a chord)',
              'Play them one after another, lowest first',
              'Play only the lowest-numbered string',
              'Roll across them slowly, one note at a time'
            ],
              choices_es: [
              'Tocarlos al mismo tiempo (como un acorde)',
              'Tocarlos uno tras otro, empezando por el número más bajo',
              'Tocar solo la cuerda con el número más bajo',
              'Recorrerlos lentamente, una nota a la vez'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/tCQ0r7vqkFQ" target="_blank">Smoke On The Water Guitar Lesson – Marty Music</a> (0:00–4:00). This is the riff you\'ll learn in the Practice station.',
            text_es: 'Mira: <a href="https://youtu.be/tCQ0r7vqkFQ" target="_blank">Smoke On The Water Guitar Lesson – Marty Music</a> (0:00–4:00). Este es el riff que vas a aprender en la estación de práctica.',
            hint: 'Notice that the riff uses 2-note "power chord" intervals played together — perfect example of stacked TAB numbers.',
            hint_es: 'Fíjate que el riff usa intervalos de "acorde de potencia" de 2 notas tocadas juntas — un ejemplo perfecto de números apilados en el TAB.',
            skills: [4, 5],
            response: { type: 'mc', prompt: 'The "Smoke on the Water" main riff uses which two strings most?',
              prompt_es: '¿Cuáles dos cuerdas usa más el riff principal de "Smoke on the Water"?',
              answer: 2,
              explain: 'You\'ll play it as a two-note double-stop (two notes played at the same time) on the A and D strings (strings 5 and 4) — index and ring locked together as one unit.',
              explain_es: 'Lo vas a tocar como una doble nota de dos notas (dos notas tocadas al mismo tiempo) en las cuerdas La y Re (cuerdas 5 y 4) — el índice y el anular trabados juntos como una sola unidad.',
              choices: [
              'Strings 1 and 2 (high e and B)',
              'Strings 6 and 5 (low E and A)',
              'Strings 5 and 4 (A and D)',
              'Strings 3 and 2 (G and B)'
            ],
              choices_es: [
              'Cuerdas 1 y 2 (mi aguda y Si)',
              'Cuerdas 6 y 5 (Mi grave y La)',
              'Cuerdas 5 y 4 (La y Re)',
              'Cuerdas 3 y 2 (Sol y Si)'
            ] }
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
          {
            text: 'Station Wrap-Up — pause and think: TAB packs a lot into one line (which string, which fret, chord-or-melody, how long the note lasts). Which part still slows you down most when you sight-read a new riff?',
            text_es: 'Cierre de la estación — pausa y piensa: el TAB mete mucha información en una sola línea (qué cuerda, qué traste, acorde o melodía, cuánto dura la nota). ¿Qué parte todavía te frena más cuando lees a primera vista un riff nuevo?',
            response: { type: 'short', placeholder: 'e.g. the rhythm symbols — I can find the notes but not the timing',
              placeholder_es: 'p. ej. los símbolos de ritmo — encuentro las notas pero no el tiempo' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — riffs from TAB',
        title_es: 'Estación de práctica — riffs desde el TAB',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                text: 'Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                hint: 'Tuning (Module 1) is a skill you keep forever. Reading TAB today is faster when you also name the notes you land on — that\'s your Module 2 fretboard map.',
                hint_es: 'Afinar (Módulo 1) es una destreza que conservas para siempre. Leer TAB hoy es más rápido cuando también nombras las notas donde caes — ese es tu mapa del diapasón del Módulo 2.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Read a riff with stacked TAB (double-stops)',
            title_es: 'Lee un riff con TAB apilado (dobles notas)',
            steps: [
          {
            text: 'Challenge 1 — Smoke on the Water: play the main riff with index + ring locked as a unit on the A + D strings — 0/0 — 3/3 — 5/5 — 0/0 — 3/3 — 6/6 — 5/5. You\'ve got it when: both notes ring at the same volume, clean through the whole riff. Use the TAB below.',
            text_es: 'Reto 1 — Smoke on the Water: toca el riff principal con el índice + el anular trabados como una unidad en las cuerdas La + Re — 0/0 — 3/3 — 5/5 — 0/0 — 3/3 — 6/6 — 5/5. Lo tienes cuando: ambas notas suenan al mismo volumen, limpias durante todo el riff. Usa el TAB de abajo.',
            hint: 'Use your index and ring finger together — keep them locked in shape and slide as a unit. Both notes should ring at the same volume.',
            hint_es: 'Usa tu dedo índice y tu dedo anular juntos — mantenlos trabados en forma y deslízalos como una unidad. Ambas notas deben sonar al mismo volumen.',
            stuck: 'Lock the two fingers into one shape and move them as a block — don\'t re-place them each time. Get the 0/0 → 3/3 slide clean before adding the rest.',
            stuck_es: 'Traba los dos dedos en una sola forma y muévelos como un bloque — no los vuelvas a colocar cada vez. Logra que el deslizamiento 0/0 → 3/3 salga limpio antes de agregar el resto.',
            levelUp: 'Play it at 90 BPM, or add the higher part that answers the riff and closes the full version.',
            levelUp_es: 'Tócalo a 90 BPM, o agrega la parte más aguda que responde al riff y cierra la versión completa.',
            skills: [1, 4, 5],
            response: { type: 'short', prompt: 'Personal record — play it cleanly at 70 BPM, then go +10 at a time. Your fastest CLEAN "Smoke" lap (one full time through the riff) today (BPM)?', prompt_es: 'Récord personal — tócalo limpio a 70 BPM, y luego sube de 10 en 10. ¿Tu vuelta LIMPIA más rápida de "Smoke" (una vuelta = un recorrido completo del riff) hoy (BPM)?', placeholder: 'e.g. 100 — try for a higher number next time', placeholder_es: 'p. ej. 100 — intenta superarlo la próxima vez' },
            tab: {
              caption: '"Smoke on the Water" — main riff · A + D strings together',
              caption_es: '"Smoke on the Water" — riff principal · cuerdas La + Re juntas',
              notes: [
                { frets: [['D', 0], ['A', 0]], note: 'A+D',   midi: [50, 45] },
                { frets: [['D', 3], ['A', 3]], note: 'C+F',   midi: [53, 48] },
                { frets: [['D', 5], ['A', 5]], note: 'D+G',   midi: [55, 50] },
                { frets: [['D', 0], ['A', 0]], note: 'A+D',   midi: [50, 45] },
                { frets: [['D', 3], ['A', 3]], note: 'C+F',   midi: [53, 48] },
                { frets: [['D', 6], ['A', 6]], note: 'D#+G#', midi: [56, 51] },
                { frets: [['D', 5], ['A', 5]], note: 'D+G',   midi: [55, 50] }
              ]
            }
          }
            ]
          },
          {
            title: 'Read rhythm in TAB',
            title_es: 'Lee el ritmo en el TAB',
            steps: [
          {
            text: 'Challenge 2 — Alternate-picking workout: play this riff on the low E and A strings with strict alternate picking — one stroke per note, alternating down-up. You\'ve got it when: clean and even at 60 BPM before you speed it up.',
            text_es: 'Reto 2 — Ejercicio de púa alternada: toca este riff en las cuerdas Mi grave y La con púa alternada estricta — un golpe de púa por nota, alternando abajo-arriba. Lo tienes cuando: sale limpio y parejo a 60 BPM antes de acelerarlo.',
            hint: 'Use alternate picking (down-up-down-up). The riff is fast — start at 60 BPM and only speed up when it\'s clean. Set the ⏱ Timer for 2 minutes and loop it.',
            hint_es: 'Usa púa alternada (abajo-arriba-abajo-arriba). El riff es rápido — empieza a 60 BPM y solo acelera cuando salga limpio. Pon el ⏱ Temporizador en 2 minutos y repítelo.',
            stuck: 'Drop to 50 BPM and keep strict down-up-down-up picking — even and slow is better than fast and sloppy. Loop just the first 4 notes until they\'re automatic.',
            stuck_es: 'Baja a 50 BPM y mantén la púa estricta abajo-arriba-abajo-arriba — parejo y lento es mejor que rápido y descuidado. Repite solo las primeras 4 notas hasta que salgan automáticas.',
            levelUp: 'Push to 80 BPM, or play it twice through with no stumble.',
            levelUp_es: 'Sube a 80 BPM, o tócalo dos veces seguidas sin tropiezos.',
            skills: [2, 3, 5],
            tab: {
              caption: 'Alternate-picking workout riff · low E and A strings',
              caption_es: 'Riff de ejercicio de púa alternada · cuerdas Mi grave y La',
              notes: [
                { string: 'A', fret: 7, note: 'E',  midi: 52 },
                { string: 'E', fret: 7, note: 'B',  midi: 47 },
                { string: 'A', fret: 5, note: 'D',  midi: 50 },
                { string: 'E', fret: 5, note: 'A',  midi: 45 },
                { string: 'A', fret: 3, note: 'C',  midi: 48 },
                { string: 'E', fret: 3, note: 'G',  midi: 43 },
                { string: 'A', fret: 2, note: 'B',  midi: 47 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 }
              ]
            }
          }
            ]
          },
          {
            title: 'Find & read a TAB on your own',
            title_es: 'Encuentra y lee un TAB por tu cuenta',
            steps: [
          {
            text: 'Challenge 3 — Find a Riff (try it!): pick "Iron Man" or "Sunshine of Your Love", find a TAB online, and play through it once. No score — see which rhythm symbols you can spot above the numbers.',
            text_es: 'Reto 3 — Encuentra un riff (¡pruébalo!): elige "Iron Man" o "Sunshine of Your Love", encuentra un TAB en línea, y tócalo una vez de principio a fin. Sin puntaje — fíjate en qué símbolos de ritmo puedes reconocer arriba de los números.',
            hint: 'Most beginner TAB sites (Songsterr, Ultimate Guitar) show the rhythm. Look for the stem marks above each number.',
            hint_es: 'La mayoría de los sitios de TAB para principiantes (Songsterr, Ultimate Guitar) muestran el ritmo. Busca las marcas de plica arriba de cada número.',
            skills: [3, 6]
          }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                text: 'Challenge — Seven Nation Army, the real rhythm: you\'ve played this riff since Module 1 — but always one even note per beat. Listen to the recording, find the riff\'s TAB with rhythm stems (Songsterr shows them clearly), and play it the way the record actually goes — long notes held, quick notes tucked between beats. You\'ve got it when: you can play along with the record and stay locked with it. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Song Journey: the riff that started it all</a>.',
                text_es: 'Reto — Seven Nation Army, el ritmo real: has tocado este riff desde el Módulo 1 — pero siempre con una nota pareja por tiempo. Escucha la grabación, encuentra el TAB del riff con plicas de ritmo (Songsterr las muestra con claridad), y tócalo como suena de verdad en la grabación — notas largas sostenidas, notas rápidas metidas entre los tiempos. Lo tienes cuando: puedes tocar junto con la grabación y mantenerte sincronizado con ella. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Recorrido de la canción: el riff que lo empezó todo</a>.',
                hint: 'The frets haven\'t changed since Module 1 — only the rhythm reading is new. That\'s the whole point of this set: same notes, real music.',
                hint_es: 'Los trastes no han cambiado desde el Módulo 1 — solo la lectura del ritmo es nueva. Ese es todo el punto de esta unidad: mismas notas, música real.',
                stuck: 'Clap the record\'s rhythm first, no guitar. Add the frets back only once your hands know the shape of the timing.',
                stuck_es: 'Aplaude el ritmo de la grabación primero, sin guitarra. Vuelve a agregar los trastes solo una vez que tus manos conozcan la forma del tiempo.',
                levelUp: 'Play it palm-muted (rest the side of your strumming hand on the strings for a muffled sound) for the verse and open for the chorus — rhythm AND dynamics (how loud or soft you play) from the same TAB.',
                levelUp_es: 'Tócalo silenciado con la palma (apoya el borde de tu mano de rasgueo sobre las cuerdas para un sonido apagado) en la estrofa y abierto en el coro — ritmo Y dinámica (qué tan fuerte o suave tocas) desde el mismo TAB.',
                skills: [2, 6],
                response: { type: 'short', prompt: 'What did the rhythm stems tell you that your ear had missed?', prompt_es: '¿Qué te dijeron las plicas de ritmo que tu oído se había perdido?', placeholder: 'e.g. the last three notes are quicker than I\'d been playing them', placeholder_es: 'p. ej. las últimas tres notas son más rápidas de lo que las estaba tocando' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                text: 'Which riff move tripped your fingers most today — a stretch, a string change, or the picking hand? Name it; that\'s your first loop next session. (Don\'t stop yet — one more section below!)',
                text_es: '¿Qué movimiento del riff te trabó más los dedos hoy — un estiramiento, un cambio de cuerda, o la mano de pulsar? Nómbralo; ese es tu primer loop la próxima sesión. (¡No te detengas todavía — falta una sección más abajo!)',
                response: { type: 'short', placeholder: 'e.g. the string jump from A to E in the workout riff', placeholder_es: 'p. ej. el salto de cuerda de La a Mi en el riff de ejercicio' }
              }
            ]
          },
          {
            title: 'Play hammer-ons, pull-offs & slides (h / p / /)',
            title_es: 'Toca hammer-ons, pull-offs y deslizamientos (h / p / /)',
            steps: [
              {
                text: 'Challenge — Slur It Together: play this 2-bar lick (a short solo phrase) on the G string. Pick ONLY where the TAB shows a plain fret number — everywhere you see an h, p, or / , your fretting hand makes the note with no new pick (these are slurs: notes joined smoothly without picking each one). You\'ve got it when: the hammered, pulled, and slid notes ring out just as loud as the ones you actually pick.',
                text_es: 'Reto — Únelo todo: toca este lick de 2 compases (una frase corta de solo) en la cuerda Sol. Pulsa SOLO donde el TAB muestre un número de traste normal — en todos los lugares donde veas una h, una p, o una /, tu mano de trastear hace la nota sin pulsar de nuevo (estas son ligaduras: notas unidas suavemente sin pulsar cada una). Lo tienes cuando: las notas de hammer-on, pull-off y deslizamiento suenan tan fuerte como las que sí pulsas.',
                hint: 'Hammer-on (h7): pick the 5, then slam your ring finger down onto the 7 — the string keeps ringing, no pick. Pull-off (p5): from the 7, flick that same finger off sideways so the already-fretted 5 sounds. Slide (/9): pick the 7 and slide the finger up to the 9 without lifting off. Tap ▶ on the TAB to hear the target.',
                hint_es: 'Hammer-on (h7): pulsa el 5, y luego golpea tu dedo anular sobre el 7 — la cuerda sigue sonando, sin pulsar. Pull-off (p5): desde el 7, saca ese mismo dedo hacia el costado de un tirón para que suene el 5 que ya estaba trasteado. Deslizamiento (/9): pulsa el 7 y desliza el dedo hasta el 9 sin levantarlo. Toca ▶ en el TAB para escuchar el objetivo.',
                stuck: 'Drill (practice over and over) one move at a time. Hammer 5→7 twenty times until the hammered note is as loud as the picked one — that\'s finger strength and it comes fast. Then the pull-off, then the slide.',
                stuck_es: 'Ejercita (practica una y otra vez) un movimiento a la vez. Haz el hammer-on 5→7 veinte veces hasta que la nota martillada suene tan fuerte como la pulsada — eso es fuerza de dedo y llega rápido. Luego el pull-off, y luego el deslizamiento.',
                levelUp: 'Run the whole lick as one smooth phrase in a single breath, or move it up to the B string and read the new frets.',
                levelUp_es: 'Toca todo el lick como una sola frase fluida de un solo aliento, o muévelo a la cuerda Si y lee los nuevos trastes.',
                skills: [3],
                response: { type: 'short', prompt: 'Which of the three — hammer, pull, or slide — needs the most work? Name it for next session.', prompt_es: '¿Cuál de los tres — hammer-on, pull-off o deslizamiento — necesita más trabajo? Nómbralo para la próxima sesión.', placeholder: 'e.g. the pull-off — my note comes out too quiet', placeholder_es: 'p. ej. el pull-off — mi nota sale demasiado suave' },
                tab: {
                  noCoach: true,   // 2 picks + 3 slurred notes — a mic check expecting 5 picked onsets would fail correct technique
                  caption: '2-bar articulation lick · G string · h = hammer-on, p = pull-off, / = slide up',
                  caption_es: 'Lick de articulación de 2 compases · cuerda Sol · h = hammer-on, p = pull-off, / = deslizamiento hacia arriba',
                  notes: [
                    { string: 'G', fret: 5,    note: 'C', midi: 60 },
                    { string: 'G', fret: 'h7', note: 'D', midi: 62 },
                    { string: 'G', fret: 'p5', note: 'C', midi: 60 },
                    { string: 'G', fret: 7,    note: 'D', midi: 62 },
                    { string: 'G', fret: '/9', note: 'E', midi: 64 }
                  ]
                }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Reads stacked-number TAB (chords) · Reads rhythm symbols above TAB · Plays a real riff that mixes notes and double-stops · Identifies hammer-on / pull-off / slide markings',
      goal_es: 'Lee TAB de números apilados (acordes) · Lee los símbolos de ritmo arriba del TAB · Toca un riff real que combina notas y dobles notas · Identifica las marcas de hammer-on / pull-off / deslizamiento',
      performance: 'Record yourself playing the "Smoke on the Water" riff at 70 BPM, then listen back for both notes ringing together evenly on every double-stop.',
      selfCheck: 'Can you look at a new TAB and play it without someone telling you the rhythm? Can you tell a chord from a melody just by looking at the TAB?',
      selfCheck_es: '¿Puedes mirar un TAB nuevo y tocarlo sin que alguien te diga el ritmo? ¿Puedes distinguir un acorde de una melodía con solo mirar el TAB?',
      standards: ['Re.7a', 'Pr.4a', 'Pr.5a']
    },

    skills: [
      { id: 'm7w1-s1', text: 'Read stacked TAB numbers as a chord (play simultaneously)',
        text_es: 'Leer números apilados en el TAB como un acorde (tocarlos al mismo tiempo)',
        gotItWhen: 'when you see two or more TAB numbers stacked vertically, you instantly play them together — no thinking about "which one first".',
        gotItWhen_es: 'cuando ves dos o más números de TAB apilados verticalmente, los tocas al instante juntos — sin pensar en "cuál va primero".',
        practice: { type: 'mc', prompt: 'TAB shows "3" on the A string and "3" on the D string, stacked vertically. How should you play it?',
          prompt_es: 'El TAB muestra "3" en la cuerda La y "3" en la cuerda Re, apilados verticalmente. ¿Cómo deberías tocarlo?',
          choices: ['A string first, then D string', 'D string first, then A string', 'Both at the same time', 'Just pick one'],
          choices_es: ['La cuerda La primero, y luego la Re', 'La cuerda Re primero, y luego la La', 'Ambas al mismo tiempo', 'Solo pulsar una'], answer: 2 } },
      { id: 'm7w1-s2', text: 'Identify quarter notes, 8th notes, and half notes in TAB rhythm symbols',
        text_es: 'Identificar negras, corcheas y blancas en los símbolos de ritmo del TAB',
        gotItWhen: 'you can look at the stems and flags above a TAB and call out the rhythm before you play — without having to listen to the original recording.',
        gotItWhen_es: 'puedes mirar las plicas y banderas arriba de un TAB y decir el ritmo en voz alta antes de tocar — sin tener que escuchar la grabación original.',
        practice: { type: 'mc', prompt: 'Two TAB notes with their stems JOINED by a single beam (like ♫) are what kind of notes?',
          prompt_es: '¿Qué tipo de notas son dos notas de TAB con sus plicas UNIDAS por una sola barra (como ♫)?',
          choices: ['Whole notes', 'Half notes', 'Quarter notes', '8th notes'],
          choices_es: ['Redondas', 'Blancas', 'Negras', 'Corcheas'], answer: 3 } },
      { id: 'm7w1-s3', text: 'Recognize hammer-on (h), pull-off (p), and slide (/ or \\) markings',
        text_es: 'Reconocer las marcas de hammer-on (h), pull-off (p) y deslizamiento (/ o \\)',
        gotItWhen: 'you can see "5h7" or "7p5" or "5/7" in TAB and know exactly what your fretting hand should do — without looking it up.',
        gotItWhen_es: 'puedes ver "5h7" o "7p5" o "5/7" en un TAB y saber exactamente qué debe hacer tu mano de trastear — sin tener que buscarlo.',
        practice: { type: 'mc', prompt: 'In TAB, "5h7" tells you to:',
          prompt_es: 'En el TAB, "5h7" te dice que:',
          choices: ['Pick the 5th fret note, then HAMMER your finger onto the 7th fret without re-picking', 'Pick both notes hard', 'Hold the 5th fret for 7 beats', 'Skip to the 7th fret'],
          choices_es: ['Pulses la nota del traste 5, y luego hagas un HAMMER-ON hacia el traste 7 sin volver a pulsar', 'Pulses ambas notas fuerte', 'Sostengas el traste 5 durante 7 tiempos', 'Saltes directo al traste 7'], answer: 0 } },
      { id: 'm7w1-s4', text: 'Play the "Smoke on the Water" main riff in time',
        text_es: 'Tocar el riff principal de "Smoke on the Water" a tiempo',
        gotItWhen: 'you can play the full riff at 70 BPM with both notes ringing together cleanly — no buzzing, no missed double-stops. (This is a straight-quarter-note teaching count — the record\'s actual rhythm has more punch and space than that.)',
        gotItWhen_es: 'puedes tocar el riff completo a 70 BPM con ambas notas sonando limpias juntas — sin zumbido, sin dobles notas falladas. (Este es un conteo de enseñanza en negras parejas — el ritmo real de la grabación tiene más contundencia y espacio que eso.)',
        practice: { type: 'playSeq', label: '"Smoke on the Water" — D string melody only', label_es: '"Smoke on the Water" — solo la melodía en la cuerda Re', bpm: 70,
          notes: [50, 53, 55, 50, 53, 56, 55] } },
      { id: 'm7w1-s5', text: 'Play a riff that mixes single notes and double-stops from TAB',
        text_es: 'Tocar un riff que combina notas sueltas y dobles notas desde el TAB',
        gotItWhen: 'you can sight-read a beginner riff that combines single notes and 2-note chord stabs and play it cleanly the first time through at half speed.',
        gotItWhen_es: 'puedes leer a primera vista un riff de principiante que combina notas sueltas y golpes de acorde de 2 notas y tocarlo limpio la primera vez, a media velocidad.' },
      { id: 'm7w1-s6', text: 'Find a TAB online for a new song and play through it',
        text_es: 'Encontrar un TAB en línea para una canción nueva y tocarlo de principio a fin',
        gotItWhen: 'you can pick a song you like, find a beginner TAB (Ultimate Guitar, Songsterr), and get through at least one section without asking for help.',
        gotItWhen_es: 'puedes elegir una canción que te guste, encontrar un TAB para principiantes (Ultimate Guitar, Songsterr), y tocar al menos una sección sin pedir ayuda.' }
    ]
  },

  {
    id: 'm7w2',
    songThread: [{ name: 'Sweet Child O\' Mine', journey: 'tabs/sweet-child-o-mine.html', note: 'the Module 7 finale' }],
    label: 'Set 2',
    locked: false,
    module: 'TAB Notation and Barre Chords',
    moduleNum: 7,
    unit: 'Module 7 · TAB Notation and Barre Chords',
    unit_es: 'Módulo 7 · Notación TAB y acordes con cejilla',
    title: 'Set 2',
    subtitle: 'E-shape barre chords · F, G, A barre · Moving the shape up the neck',
    subtitle_es: 'Acordes con cejilla en forma de E · Cejilla de F, G, A · Mover la forma por el mástil',
    objective: 'I CAN form a clean E-shape barre chord and move it up the neck to play F, G, A, and B major.',
    skillFocus: 'Forming a clean E-shape barre chord · Moving the barre up the neck · Naming barre chords by their root',
    skillFocus_es: 'Formar una cejilla limpia en forma de E · Mover la cejilla por el mástil · Nombrar acordes con cejilla por su raíz',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        title_es: 'Estación de computadora — Mira · Escucha · Practica',
        sections: [
          {
            title: 'Watch: the E-shape barre chord',
            title_es: 'Mira: el acorde con cejilla en forma de E',
            steps: [
          {
            text: 'Watch: <a href="https://www.youtube.com/watch?v=vUNxt5EvXv8" target="_blank">Pain Free F Chord for Beginners – Lauren Bateman (0:00–5:03)</a>.',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=vUNxt5EvXv8" target="_blank">Pain Free F Chord for Beginners – Lauren Bateman (0:00–5:03)</a>.',
            hint: 'The F barre — one finger pressed flat across several strings — is famously hard. It\'s the lowest barre, where the strings are tightest, so it\'s the toughest spot — G and A higher up are easier. Watch her THUMB: keep it on the BACK of the neck, behind your index. That\'s where the squeezing power comes from.',
            hint_es: 'La cejilla de F — un dedo presionado plano sobre varias cuerdas — es famosa por ser difícil. Es la cejilla más baja, donde las cuerdas están más tensas, así que es el punto más duro — G y A más arriba son más fáciles. Fíjate en su PULGAR: mantenlo en la PARTE TRASERA del mástil, detrás de tu índice. Ahí es de donde viene la fuerza de apriete.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'For the cleanest E-shape barre, where should your THUMB go?',
              prompt_es: 'Para la cejilla en forma de E más limpia, ¿dónde debería ir tu PULGAR?',
              answer: 1,
              explain: 'Plant the thumb on the BACK of the neck, roughly behind your index finger. That gives the squeezing leverage a barre needs — wrapping it over the top kills your strength.',
              explain_es: 'Planta el pulgar en la PARTE TRASERA del mástil, más o menos detrás de tu dedo índice. Eso da la palanca de apriete que una cejilla necesita — envolverlo por encima del mástil te quita fuerza.',
              choices: [
              'Wrapped over the top of the neck',
              'On the BACK of the neck, roughly behind your index finger',
              'Pointing toward the ceiling',
              'It doesn\'t matter where the thumb goes'
            ],
              choices_es: [
              'Envuelto por encima del mástil',
              'En la PARTE TRASERA del mástil, más o menos detrás de tu dedo índice',
              'Apuntando hacia el techo',
              'No importa dónde vaya el pulgar'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/MpMhueVEz2g" target="_blank">Basic Barre Chords #1 — the E shape (CH-006) – JustinGuitar</a> (0:00–4:00).',
            text_es: 'Mira: <a href="https://youtu.be/MpMhueVEz2g" target="_blank">Basic Barre Chords #1 — the E shape (CH-006) – JustinGuitar</a> (0:00–4:00).',
            hint: 'The "E shape" is literally the E major open chord, but you slide your fingers up the neck and use your INDEX finger to "be the nut" (the thin strip at the top of the neck that the strings cross) — your finger becomes the bar.',
            hint_es: 'La "forma de E" es literalmente el acorde abierto de E mayor, pero deslizas tus dedos por el mástil y usas tu dedo ÍNDICE para "ser la cejuela" (la tira delgada en la parte superior del mástil por donde cruzan las cuerdas) — tu dedo se convierte en la cejilla.',
            skills: [2, 3],
            response: { type: 'short', placeholder: 'Why is it called an "E-shape" barre chord? What does the shape have in common with the open E major chord?',
              placeholder_es: '¿Por qué se llama acorde con cejilla "en forma de E"? ¿Qué tiene en común la forma con el acorde abierto de E mayor?' }
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
          {
            text: 'Station Wrap-Up — barre chords are a strength skill that takes weeks, not minutes. What is one small thing that improved today, even if the whole chord isn\'t ringing yet?',
            text_es: 'Cierre de la estación — los acordes con cejilla son una destreza de fuerza que toma semanas, no minutos. ¿Qué pequeña cosa mejoró hoy, aunque el acorde completo todavía no suene?',
            response: { type: 'short', placeholder: 'e.g. the low strings ring now — just the B string left to fix', placeholder_es: 'p. ej. las cuerdas graves ya suenan — solo falta arreglar la cuerda Si' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — building the barre',
        title_es: 'Estación de práctica — construye la cejilla',
        sections: [
          {
            title: 'Bar all 6 strings with your index finger',
            title_es: 'Haz cejilla en las 6 cuerdas con tu dedo índice',
            steps: [
          {
            text: 'Challenge 1 — Just the Bar: lay your index finger flat across all 6 strings at the 5th fret — bar only, no other fingers — and strum. You\'ve got it when: all 6 strings ring, rolling the index slightly onto its bonier edge.',
            text_es: 'Reto 1 — Solo la cejilla: coloca tu dedo índice plano sobre las 6 cuerdas en el traste 5 — solo la cejilla, sin otros dedos — y rasguea. Lo tienes cuando: las 6 cuerdas suenan, rodando el índice ligeramente hacia su borde más óseo.',
            hint: 'Roll your index finger slightly toward its outer edge — that side is bonier and gives a cleaner bar. The power comes from the thumb on the back of the neck, not from squeezing the whole hand.',
            hint_es: 'Rueda tu dedo índice ligeramente hacia su borde exterior — ese lado es más óseo y da una cejilla más limpia. La fuerza viene del pulgar en la parte trasera del mástil, no de apretar toda la mano.',
            stuck: 'Line the bar up right behind the fret. If the B string buzzes, it\'s usually sitting in a knuckle crease — shift the finger a hair up or down. Get just the top 3 strings ringing first, then chase the rest.',
            stuck_es: 'Alinea la cejilla justo detrás del traste. Si la cuerda Si zumba, suele estar cayendo en un pliegue del nudillo — mueve el dedo un poquito hacia arriba o hacia abajo. Logra que suenen solo las 3 cuerdas más agudas primero, y luego persigue el resto.',
            levelUp: 'Bar at the 1st fret (the hardest spot) and get all 6 ringing, or bar and slide cleanly up to the 7th fret and back.',
            levelUp_es: 'Haz la cejilla en el traste 1 (el punto más difícil) y logra que suenen las 6, o haz la cejilla y deslízala limpiamente hasta el traste 7 y de vuelta.',
            skills: [1, 2],
            chords: [
              { name: '', chord: [[6,5,'1'],[5,5,'1'],[4,5,'1'],[3,5,'1'],[2,5,'1'],[1,5,'1']], position: 5 }
            ]
          }
            ]
          },
          {
            title: 'Form the E-shape barre',
            title_es: 'Forma la cejilla en forma de E',
            steps: [
          {
            text: 'Challenge 2 — E-Shape Barre: add the E-shape on top of the bar at the 5th fret for A major (ring finger on string 5, fret 7 · pinky on string 4, fret 7 · middle finger on string 3, fret 6) and strum all 6. You\'ve got it when: a full, clean A major barre — master it here before tackling F.',
            text_es: 'Reto 2 — Cejilla en forma de E: agrega la forma de E encima de la cejilla en el traste 5 para A mayor (dedo anular en la cuerda 5, traste 7 · meñique en la cuerda 4, traste 7 · dedo medio en la cuerda 3, traste 6) y rasguea las 6 cuerdas. Lo tienes cuando: una cejilla de A mayor completa y limpia — domínala aquí antes de atacar F.',
            hint: 'It\'s the open E major shape moved up — index finger replaces the "nut". Practice this at the 5th fret BEFORE attempting F at fret 1. If your hand cramps, that\'s normal — shake your hand loose and come back.',
            hint_es: 'Es la forma abierta de E mayor movida hacia arriba — el dedo índice reemplaza a la "cejuela". Practica esto en el traste 5 ANTES de intentar F en el traste 1. Si tu mano se acalambra, eso es normal — sacúdela para relajarla y vuelve a intentarlo.',
            stuck: 'Stage it: (1) get the bar across fret 5 clean, (2) add ring + pinky on strings 5–4, (3) add the middle on string 3 last — pluck each string to find the muffled one before moving on. Short tries are better than one long tiring session.',
            stuck_es: 'Hazlo por etapas: (1) logra que la cejilla en el traste 5 suene limpia, (2) agrega el anular + el meñique en las cuerdas 5–4, (3) agrega el medio en la cuerda 3 al final — puntea cada cuerda para encontrar la que suena apagada antes de seguir. Intentos cortos son mejores que una sola sesión larga y agotadora.',
            levelUp: 'Slide the whole shape up to the 7th fret (B major) and keep every string ringing.',
            levelUp_es: 'Desliza toda la forma hasta el traste 7 (B mayor) y mantén todas las cuerdas sonando.',
            skills: [2, 3, 4],
            chords: [
              { name: 'A major', chord: [[6,5,'1'],[5,7,'3'],[4,7,'4'],[3,6,'2'],[2,5,'1'],[1,5,'1']], position: 5 }
            ]
          }
            ]
          },
          {
            title: 'Find the power chord hiding inside your F barre',
            title_es: 'Encuentra el acorde de potencia escondido dentro de tu cejilla de F',
            steps: [
          {
            text: 'Challenge — Spot the Power Chord: form your F major barre, then look at just strings 6 and 5 — low E (fret 1) + A (fret 3). That is exactly the F5 power chord you learned in Module 3. The barre just stacks the rest of the chord on top. You\'ve got it when: play F5 alone, then add the barre fingers to make full F — and hear the power chord living inside it.',
            text_es: 'Reto — Encuentra el acorde de potencia: forma tu cejilla de F mayor, y luego mira solo las cuerdas 6 y 5 — Mi grave (traste 1) + La (traste 3). Eso es exactamente el acorde de potencia F5 que aprendiste en el Módulo 3. La cejilla solo apila el resto del acorde encima. Lo tienes cuando: toca F5 solo, y luego agrega los dedos de la cejilla para formar el F completo — y escucha el acorde de potencia viviendo dentro de él.',
            hint: 'Barre chords feel less scary once you see them as a power chord you already know, plus a few extra notes. And just like a power chord, you name the barre by its root on string 6 — that\'s your Module 2 + Module 3 skills combining.',
            hint_es: 'Los acordes con cejilla dan menos miedo una vez que los ves como un acorde de potencia que ya conoces, más algunas notas extra. Y al igual que un acorde de potencia, nombras la cejilla por su raíz en la cuerda 6 — eso es tus destrezas del Módulo 2 y el Módulo 3 combinándose.',
            stuck: 'If full F won\'t ring yet, fall back to just the F5 power chord (strings 6–5) and add one string at a time upward — the full bar comes last.',
            stuck_es: 'Si el F completo todavía no suena, vuelve solo al acorde de potencia F5 (cuerdas 6–5) y agrega una cuerda a la vez hacia arriba — la cejilla completa llega al final.',
            levelUp: 'Do the same reveal at G (fret 3): play G5, then stack the full G barre on top and hear the power chord inside it.',
            levelUp_es: 'Haz la misma revelación en G (traste 3): toca G5, y luego apila la cejilla completa de G encima y escucha el acorde de potencia dentro de ella.',
            skills: [3, 4],
            chords: [
              { name: 'F5', chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 0 },
              { name: 'F major', chord: [[6,1,'1'],[5,3,'3'],[4,3,'4'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Slide the E-shape: F, G, A',
            title_es: 'Desliza la forma de E: F, G, A',
            steps: [
          {
            text: 'Challenge 3 — F, G, A Slide (your assessment piece): slide the same shape to fret 1 (F), fret 3 (G), and fret 5 (A) — same shape, three chords. You\'ve got it when: G and A ringing clean, then F — the hardest — without buzzing.',
            text_es: 'Reto 3 — Deslizamiento F, G, A (tu pieza de evaluación): desliza la misma forma al traste 1 (F), traste 3 (G), y traste 5 (A) — misma forma, tres acordes. Lo tienes cuando: G y A suenan limpio, y luego F — el más difícil — sin zumbido.',
            hint: 'F is the hardest position — don\'t panic if it buzzes. Barre chords are a hand-strength skill. If your hand cramps, shake your hand loose and rest. Short, frequent tries are better than one long, tiring session, and the strength comes within a couple of weeks.',
            hint_es: 'F es la posición más difícil — no te asustes si zumba. Los acordes con cejilla son una destreza de fuerza de mano. Si tu mano se acalambra, sacúdela para relajarla y descansa. Intentos cortos y frecuentes son mejores que una sola sesión larga y agotadora, y la fuerza llega en un par de semanas.',
            stuck: 'Build the barre in stages: (1) bar + just the low-E root, (2) add strings 5–4, (3) add the B and high E last — get each stage clean before stacking the next. Start at G or A (frets 3–5) where the strings are looser, then bring the shape down to F.',
            stuck_es: 'Construye la cejilla por etapas: (1) cejilla + solo la raíz en Mi grave, (2) agrega las cuerdas 5–4, (3) agrega la Si y la mi aguda al final — logra que cada etapa suene limpia antes de apilar la siguiente. Empieza en G o A (trastes 3–5) donde las cuerdas están más sueltas, y luego baja la forma a F.',
            levelUp: 'Add B at the 7th fret as a 4th chord, or switch F→G→A in time at 70 BPM.',
            levelUp_es: 'Agrega B en el traste 7 como un 4to acorde, o cambia F→G→A a tiempo a 70 BPM.',
            skills: [4, 5, 6],
            chords: [
              { name: 'F major', chord: [[6,1,'1'],[5,3,'3'],[4,3,'4'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
              { name: 'G major', chord: [[6,3,'1'],[5,5,'3'],[4,5,'4'],[3,4,'2'],[2,3,'1'],[1,3,'1']], position: 3 },
              { name: 'A major', chord: [[6,5,'1'],[5,7,'3'],[4,7,'4'],[3,6,'2'],[2,5,'1'],[1,5,'1']], position: 5 }
            ]
          }
            ]
          },
          {
            title: 'One-Minute Barre Changes — try for a higher number',
            title_es: 'Cambios de cejilla en un minuto — intenta superar tu marca',
            steps: [
              {
                text: 'Challenge 4 — One-Minute Barre Changes (F ↔ G): set the ⏱ Timer for 60 seconds and slide your E-shape barre between F (fret 1) and G (fret 3) as many times as you can — only changes where all 6 strings ring count. You\'ve got it when: type your count below and try for a higher number next time. (Even 6–8 clean ones is a real success for barres.)',
                text_es: 'Reto 4 — Cambios de cejilla en un minuto (F ↔ G): pon el ⏱ Temporizador en 60 segundos y desliza tu cejilla en forma de E entre F (traste 1) y G (traste 3) tantas veces como puedas — solo cuentan los cambios donde suenan las 6 cuerdas. Lo tienes cuando: escribe tu cuenta abajo e intenta superarla la próxima vez. (Incluso 6–8 limpios es un verdadero éxito para las cejillas.)',
                hint: 'It\'s the same shape sliding two frets — keep the bar pressed and glide, don\'t lift and re-place. Quality over speed.',
                hint_es: 'Es la misma forma deslizándose dos trastes — mantén la cejilla presionada y deslízala, no la levantes y la vuelvas a colocar. Calidad sobre velocidad.',
                stuck: 'Keep the bar lightly down the whole time so you never fully reset the shape — just shift two frets. Slow down until both chords ring.',
                stuck_es: 'Mantén la cejilla ligeramente abajo todo el tiempo para que nunca reinicies del todo la forma — solo cambia dos trastes. Baja la velocidad hasta que ambos acordes suenen.',
                levelUp: 'Add A (fret 5) and cycle F→G→A, or run it with a down-up strum.',
                levelUp_es: 'Agrega A (traste 5) y cicla F→G→A, o tócalo con un rasgueo abajo-arriba.',
                skills: [4, 6],
                response: { type: 'short', prompt: 'Personal record — clean F↔G barre changes in 60 seconds. Your count today?', prompt_es: 'Récord personal — cambios de cejilla F↔G limpios en 60 segundos. ¿Tu cuenta de hoy?', placeholder: 'e.g. 8 — try for a higher number next time', placeholder_es: 'p. ej. 8 — intenta superarlo la próxima vez' }
              }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                text: 'Challenge — Sweet Child O\' Mine, one-shape verse: the verse is D · C · G — and with the E-shape barre that\'s ONE shape sliding: D at fret 10, C at fret 8, G at fret 3. Play one clean strum per chord, then two bars each at 60 BPM. You\'ve got it when: all three ring clean — and the high frets prove the point: barres get EASIER up the neck. <a href="tabs/sweet-child-o-mine.html" target="_blank">&#x1F9F5; Song Journey: this is the Module 7 finale</a>.',
                text_es: 'Reto — Sweet Child O\' Mine, estrofa de una sola forma: la estrofa es D · C · G — y con la cejilla en forma de E eso es UNA forma deslizándose: D en el traste 10, C en el traste 8, G en el traste 3. Toca un rasgueo limpio por acorde, y luego dos compases cada uno a 60 BPM. Lo tienes cuando: los tres suenan limpios — y los trastes altos prueban el punto: las cejillas se vuelven MÁS FÁCILES conforme subes por el mástil. <a href="tabs/sweet-child-o-mine.html" target="_blank">&#x1F9F5; Recorrido de la canción: este es el final del Módulo 7</a>.',
                hint: 'Start at the top — get D clean at fret 10 where the strings are loosest, then walk the same shape down. Name each chord by its string-6 root: fret 10 = D, fret 8 = C, fret 3 = G.',
                hint_es: 'Empieza por arriba — logra que D suene limpio en el traste 10 donde las cuerdas están más sueltas, y luego camina la misma forma hacia abajo. Nombra cada acorde por su raíz en la cuerda 6: traste 10 = D, traste 8 = C, traste 3 = G.',
                stuck: 'Play just the roots on string 6 first (10 → 8 → 3) so the slide distances live in your arm, then add the barre on top.',
                stuck_es: 'Toca solo las raíces en la cuerda 6 primero (10 → 8 → 3) para que las distancias del deslizamiento vivan en tu brazo, y luego agrega la cejilla encima.',
                levelUp: 'Run the loop with a down-up strum, or hum the verse melody over your own chords.',
                levelUp_es: 'Toca el loop con un rasgueo abajo-arriba, o tararea la melodía de la estrofa sobre tus propios acordes.',
                skills: [5, 6],
                chords: [
                  { name: 'D (E-shape)', chord: [[6,10,'1'],[5,12,'3'],[4,12,'4'],[3,11,'2'],[2,10,'1'],[1,10,'1']], position: 10 },
                  { name: 'C (E-shape)', chord: [[6,8,'1'],[5,10,'3'],[4,10,'4'],[3,9,'2'],[2,8,'1'],[1,8,'1']], position: 8 },
                  { name: 'G (E-shape)', chord: [[6,3,'1'],[5,5,'3'],[4,5,'4'],[3,4,'2'],[2,3,'1'],[1,3,'1']], position: 3 }
                ]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                text: 'Which string in your barre is most likely to buzz right now — the B string, the high E, or the G? Name it; isolating that one string is your first job next session.',
                text_es: '¿Qué cuerda de tu cejilla es más probable que zumbe ahora mismo — la Si, la mi aguda, o la Sol? Nómbrala; aislar esa cuerda es tu primer trabajo la próxima sesión.',
                response: { type: 'short', placeholder: 'e.g. the B string — it sits in my finger crease', placeholder_es: 'p. ej. la cuerda Si — cae en un pliegue de mi dedo' }
              }
            ]
          },
          {
            title: '⚡ Ear Spark — optional ear bonus',
            title_es: '⚡ Chispa auditiva — bono opcional de oído',
            steps: [
              {
                text: '⚡ Ear Spark (optional, 2 min): record F both ways — the little F (xx3211) and the full barre — a few reps in a random order you don\'t write down. Same chord, different voice: on playback, guess which is which by listening for the low bass note only the barre has. Got someone around? Have them play and you call it.',
                text_es: '⚡ Chispa auditiva (opcional, 2 min): grábate tocando F de las dos formas — el F pequeño (xx3211) y la cejilla completa — unas cuantas veces en un orden aleatorio que no anotes. Mismo acorde, voz distinta: al reproducirlo, adivina cuál es cuál escuchando la nota grave que solo tiene la cejilla. ¿Tienes a alguien cerca? Que toque y tú adivinas.'
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Bars all 6 strings cleanly with index finger · Forms E-shape barre with no buzzing · Plays F, G, A barre chords cleanly · Names a barre chord by its root note on string 6 · Switches between two barre chords in time',
      goal_es: 'Hace cejilla limpia en las 6 cuerdas con el dedo índice · Forma la cejilla en forma de E sin zumbido · Toca los acordes con cejilla F, G, A de forma limpia · Nombra un acorde con cejilla por su nota raíz en la cuerda 6 · Cambia entre dos acordes con cejilla a tiempo',
      performance: 'Solo: record yourself playing F barre, slide to G barre, slide to A barre — one strum each, all clean. Listen back and check for buzz on the B and high E strings.',
      selfCheck: 'Can your F barre ring without buzzing? Can you name the chord when you see an E-shape barre at the 7th fret? (Answer: B major.)',
      selfCheck_es: '¿Puede tu cejilla de F sonar sin zumbido? ¿Puedes nombrar el acorde cuando ves una cejilla en forma de E en el traste 7? (Respuesta: B mayor.)',
      standards: ['Pr.4a', 'Pr.5a']
    },

    skills: [
      { id: 'm7w2-s1', text: 'Bar all 6 strings cleanly with my index finger',
        text_es: 'Hacer cejilla limpia en las 6 cuerdas con mi dedo índice',
        gotItWhen: 'with only your index finger flat across the 5th fret, you can strum and every one of the 6 strings rings — no muffled strings, no buzz.',
        gotItWhen_es: 'con solo tu dedo índice plano sobre el traste 5, puedes rasguear y cada una de las 6 cuerdas suena — sin cuerdas apagadas, sin zumbido.',
        practice: { type: 'mc', prompt: 'Which side of your index finger is best for a clean barre?',
          prompt_es: '¿Qué lado de tu dedo índice es mejor para una cejilla limpia?',
          choices: ['The fleshy front pad', 'The bony outer edge (rolled slightly)', 'Either works equally well', 'The fingernail side'],
          choices_es: ['La almohadilla carnosa de enfrente', 'El borde óseo exterior (ligeramente rodado)', 'Cualquiera de los dos funciona igual', 'El lado de la uña'], answer: 1 } },
      { id: 'm7w2-s2', text: 'Position my thumb correctly behind the neck for barre chords',
        text_es: 'Colocar mi pulgar correctamente detrás del mástil para los acordes con cejilla',
        gotItWhen: 'your thumb sits on the BACK of the neck — roughly behind your index finger — and you can feel a pinching motion between thumb and index when you squeeze.',
        gotItWhen_es: 'tu pulgar se apoya en la PARTE TRASERA del mástil — más o menos detrás de tu dedo índice — y puedes sentir un movimiento de pinza entre el pulgar y el índice cuando aprietas.',
        practice: { type: 'mc', prompt: 'For maximum squeezing power on a barre chord, your thumb should be:',
          prompt_es: 'Para la máxima fuerza de apriete en un acorde con cejilla, tu pulgar debería estar:',
          choices: ['Wrapped over the top of the neck (folk style)', 'On the BACK of the neck, behind the index finger', 'Floating in the air, not touching the neck', 'Pressing the strings'],
          choices_es: ['Envuelto por encima del mástil (estilo folk)', 'En la PARTE TRASERA del mástil, detrás del dedo índice', 'Flotando en el aire, sin tocar el mástil', 'Presionando las cuerdas'], answer: 1 } },
      { id: 'm7w2-s3', text: 'Form an E-shape barre chord at the 5th fret (A major) cleanly',
        text_es: 'Formar un acorde con cejilla en forma de E en el traste 5 (A mayor) de forma limpia',
        gotItWhen: 'you can pluck each of the 6 strings individually in your A barre and every one rings — no muffled string from a cramped finger.',
        gotItWhen_es: 'puedes puntear cada una de las 6 cuerdas por separado en tu cejilla de A y todas suenan — sin ninguna cuerda apagada por un dedo acalambrado.' },
      { id: 'm7w2-s4', text: 'Play F major barre at the 1st fret',
        text_es: 'Tocar la cejilla de F mayor en el traste 1',
        gotItWhen: 'your F barre at the 1st fret rings cleanly on at least 5 of 6 strings — including the B string, which is the trickiest for the bar.',
        gotItWhen_es: 'tu cejilla de F en el traste 1 suena limpia en al menos 5 de las 6 cuerdas — incluyendo la cuerda Si, que es la más difícil para la cejilla.',
        practice: { type: 'playSeq', label: 'Hear F major (E-shape barre, arpeggiated)', label_es: 'Escucha F mayor (cejilla en forma de E, arpegiada)', bpm: 60,
          notes: [41, 48, 53, 57, 60, 65] } },
      { id: 'm7w2-s5', text: 'Name an E-shape barre chord by its root note on string 6',
        text_es: 'Nombrar un acorde con cejilla en forma de E por su nota raíz en la cuerda 6',
        gotItWhen: 'you can slide your E-shape barre to any random fret and name the chord instantly — because you know the notes on the low E string from Module 2.',
        gotItWhen_es: 'puedes deslizar tu cejilla en forma de E a cualquier traste al azar y nombrar el acorde al instante — porque conoces las notas de la cuerda Mi grave desde el Módulo 2.',
        practice: { type: 'mc', prompt: 'If you play an E-shape barre chord with your index finger on the 7th fret of string 6, what chord is it?',
          prompt_es: 'Si tocas un acorde con cejilla en forma de E con tu dedo índice en el traste 7 de la cuerda 6, ¿qué acorde es?',
          choices: ['G major', 'A major', 'B major', 'C major'],
          choices_es: ['G mayor', 'A mayor', 'B mayor', 'C mayor'], answer: 2 } },
      { id: 'm7w2-s6', text: 'Switch between F, G, and A barre chords in time at 60 BPM',
        text_es: 'Cambiar entre los acordes con cejilla F, G, y A a tiempo a 60 BPM',
        gotItWhen: 'you can play 2 bars of F, 2 bars of G, 2 bars of A, looping, at 60 BPM — same shape, just sliding up and down the neck.',
        gotItWhen_es: 'puedes tocar 2 compases de F, 2 compases de G, 2 compases de A, en loop, a 60 BPM — misma forma, solo deslizándose arriba y abajo del mástil.',
        practice: { type: 'playSeq', label: 'F · G · A roots (low E string)', label_es: 'Raíces F · G · A (cuerda Mi grave)', bpm: 60,
          notes: [41, 43, 45] } }
    ]
  },

  {
    id: 'm7w3',
    songThread: [{ name: 'All Along the Watchtower', journey: 'tabs/all-along-the-watchtower.html', note: 'every chord as a barre' }, { name: 'Luna', journey: 'tabs/luna.html', note: 'the barre upgrade — beyond Layer 5' }],
    label: 'Set 3',
    locked: false,
    module: 'TAB Notation and Barre Chords',
    moduleNum: 7,
    unit: 'Module 7 · TAB Notation and Barre Chords',
    unit_es: 'Módulo 7 · Notación TAB y acordes con cejilla',
    title: 'Set 3',
    subtitle: 'A-shape barre chords · Bb, B, C barre · Combining E-shape and A-shape',
    subtitle_es: 'Acordes con cejilla en forma de A · Cejilla de Bb, B, C · Combinar forma de E y forma de A',
    objective: 'I CAN form a clean A-shape barre chord and combine E-shape and A-shape barre chords in a real song.',
    skillFocus: 'Forming a clean A-shape barre chord · Naming A-shape chords by their root · Combining E-shape and A-shape chords in a song',
    skillFocus_es: 'Formar una cejilla limpia en forma de A · Nombrar acordes en forma de A por su raíz · Combinar acordes en forma de E y de A en una canción',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        title_es: 'Estación de computadora — Mira · Escucha · Practica',
        sections: [
          {
            title: 'Watch: the A-shape barre chord',
            title_es: 'Mira: el acorde con cejilla en forma de A',
            steps: [
          {
            text: 'Watch: <a href="https://youtu.be/C7k0CWgI-xI" target="_blank">A Shape Major Barre Chords on Guitar – JustinGuitar</a> (0:00–4:00).',
            text_es: 'Mira: <a href="https://youtu.be/C7k0CWgI-xI" target="_blank">A Shape Major Barre Chords on Guitar – JustinGuitar</a> (0:00–4:00).',
            hint: 'The A-shape uses the open A major chord, moved up the neck. Some players bar strings 2, 3, 4 with their RING finger only — it\'s a different technique from the E-shape.',
            hint_es: 'La forma de A usa el acorde abierto de A mayor, movido por el mástil. Algunos guitarristas hacen cejilla en las cuerdas 2, 3, 4 solo con el dedo ANULAR — es una técnica distinta a la de la forma de E.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'The A-shape barre chord places its ROOT note on which string?',
              prompt_es: '¿En cuál cuerda coloca su nota RAÍZ el acorde con cejilla en forma de A?',
              answer: 1,
              explain: 'The A-shape is rooted on string 5 (the A string) — so the fret your barre sits on, on the A string, names the chord. (The E-shape is rooted on string 6.)',
              explain_es: 'La forma de A tiene su raíz en la cuerda 5 (la cuerda La) — así que el traste donde cae tu cejilla, en la cuerda La, nombra el acorde. (La forma de E tiene su raíz en la cuerda 6.)',
              choices: [
              'String 6 (low E)',
              'String 5 (A)',
              'String 4 (D)',
              'String 1 (high e)'
            ],
              choices_es: [
              'Cuerda 6 (Mi grave)',
              'Cuerda 5 (La)',
              'Cuerda 4 (Re)',
              'Cuerda 1 (mi aguda)'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/MpMhueVEz2g" target="_blank">Basic Barre Chords (CH-006) – JustinGuitar</a> (0:00–4:00 — rewatch with A-shape focus).',
            text_es: 'Mira: <a href="https://youtu.be/MpMhueVEz2g" target="_blank">Basic Barre Chords (CH-006) – JustinGuitar</a> (0:00–4:00 — vuelve a verlo enfocándote en la forma de A).',
            hint: 'B major is a great A-shape practice chord — it lives at the 2nd fret with the root on string 5. You may hear a muted high E (string 1) in some videos — many players let the ring finger mute it, and that\'s a real technique. In this module, though, we arch the fingers so string 1 rings.',
            hint_es: 'B mayor es un gran acorde de práctica para la forma de A — vive en el traste 2 con la raíz en la cuerda 5. Puede que escuches una mi aguda (cuerda 1) silenciada en algunos videos — muchos guitarristas dejan que el dedo anular la silencie, y esa es una técnica real. En este módulo, sin embargo, arqueamos los dedos para que la cuerda 1 suene.',
            skills: [3, 4],
            response: { type: 'short', placeholder: 'In this module, should string 1 (the high e) ring or stay muted in your A-shape barre? What do you do with your fingers to make it ring?',
              placeholder_es: 'En este módulo, ¿la cuerda 1 (la mi aguda) debe sonar o quedarse silenciada en tu cejilla en forma de A? ¿Qué haces con tus dedos para que suene?' }
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
          {
            text: 'Station Wrap-Up — you now know both barre shapes. Which feels harder right now — the E-shape (root on string 6) or the A-shape (root on string 5) — and what makes it tougher for your hand?',
            text_es: 'Cierre de la estación — ahora conoces las dos formas de cejilla. ¿Cuál se siente más difícil ahora mismo — la forma de E (raíz en la cuerda 6) o la forma de A (raíz en la cuerda 5) — y qué la hace más dura para tu mano?',
            response: { type: 'short', placeholder: 'e.g. the A-shape — barring 4-3-2 with my ring finger is awkward', placeholder_es: 'p. ej. la forma de A — hacer cejilla en 4-3-2 con mi anular se siente incómodo' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — A-shape and combining',
        title_es: 'Estación de práctica — forma de A y combinaciones',
        sections: [
          {
            title: 'Form the A-shape barre',
            title_es: 'Forma la cejilla en forma de A',
            steps: [
          {
            text: 'Challenge 1 — A-Shape B Major: index bars all 6 strings at fret 2, fingers on strings 4/3/2 at fret 4, strum strings 5–1 (let the index mute string 6). You\'ve got it when: a clean B major with the string-5 bass ringing and no low E.',
            text_es: 'Reto 1 — B mayor en forma de A: el índice hace cejilla en las 6 cuerdas en el traste 2, los dedos en las cuerdas 4/3/2 en el traste 4, rasguea las cuerdas 5–1 (deja que el índice silencie la cuerda 6). Lo tienes cuando: un B mayor limpio con el bajo de la cuerda 5 sonando y sin Mi grave.',
            hint: 'Avoid the low E string (string 6) — your index finger mutes it for you. Aim your strum from string 5 downward.',
            hint_es: 'Evita la cuerda Mi grave (cuerda 6) — tu dedo índice la silencia por ti. Apunta tu rasgueo desde la cuerda 5 hacia abajo.',
            stuck: 'Stage it: (1) bar fret 2 and get strings 5 and 1 ringing, (2) add the ring-finger sub-barre on strings 4-3-2 at fret 4 last. The ring finger is the tricky part — arch it so the high E still rings. Cramping is normal; shake your hand loose.',
            stuck_es: 'Hazlo por etapas: (1) haz la cejilla en el traste 2 y logra que suenen las cuerdas 5 y 1, (2) agrega al final la sub-cejilla del dedo anular en las cuerdas 4-3-2 en el traste 4. El dedo anular es la parte difícil — arquéalo para que la mi aguda siga sonando. Acalambrarse es normal; sacude tu mano para relajarla.',
            levelUp: 'Slide the whole A-shape up to C (3rd fret) and keep it clean.',
            levelUp_es: 'Desliza toda la forma de A hasta C (traste 3) y mantenla limpia.',
            skills: [1, 2, 3],
            chords: [
              { name: 'B major', chord: [[6,'x'],[5,2,'1'],[4,4,'3'],[3,4,'3'],[2,4,'3'],[1,2,'1']], position: 2 }
            ]
          }
            ]
          },
          {
            title: 'Slide the A-shape: C, D, E',
            title_es: 'Desliza la forma de A: C, D, E',
            steps: [
          {
            text: 'Challenge 2 — A-Shape Slide: slide the A-shape to C (3rd fret), D (5th fret), and E (7th fret), strumming strings 5–1 only. You\'ve got it when: name each by its string-5 root and play all three clean.',
            text_es: 'Reto 2 — Deslizamiento en forma de A: desliza la forma de A a C (traste 3), D (traste 5), y E (traste 7), rasgueando solo las cuerdas 5–1. Lo tienes cuando: nombras cada uno por su raíz en la cuerda 5 y tocas los tres limpios.',
            hint: 'The A-shape is named by the root note on string 5. Apply your Module 2 A-string note knowledge: fret 3 of A = C, fret 5 of A = D, fret 7 of A = E.',
            hint_es: 'La forma de A se nombra por la nota raíz en la cuerda 5. Aplica tu conocimiento de las notas de la cuerda La del Módulo 2: traste 3 de La = C, traste 5 de La = D, traste 7 de La = E.',
            stuck: 'Higher frets (D, E) are easier — the strings are looser, so get those clean first, then bring the shape down to C. Keep the bar pressed and slide rather than lifting between chords.',
            stuck_es: 'Los trastes más altos (D, E) son más fáciles — las cuerdas están más sueltas, así que logra que esos suenen limpio primero, y luego baja la forma a C. Mantén la cejilla presionada y deslízala en lugar de levantarla entre acordes.',
            levelUp: 'Run C→D→E in time at 70 BPM, or add F at the 8th fret.',
            levelUp_es: 'Toca C→D→E a tiempo a 70 BPM, o agrega F en el traste 8.',
            skills: [3, 4],
            chords: [
              { name: 'C', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,5,'3'],[2,5,'3'],[1,3,'1']], position: 3 },
              { name: 'D', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,7,'3'],[2,7,'3'],[1,5,'1']], position: 5 },
              { name: 'E', chord: [[6,'x'],[5,7,'1'],[4,9,'3'],[3,9,'3'],[2,9,'3'],[1,7,'1']], position: 7 }
            ]
          }
            ]
          },
          {
            title: 'Every chord has two homes (E-shape ↔ A-shape)',
            title_es: 'Cada acorde tiene dos hogares (forma de E ↔ forma de A)',
            steps: [
          {
            text: 'Challenge 3 — Two Homes for F: play F as an E-shape barre (index on string 6, fret 1), then play the SAME chord as an A-shape barre (index on string 5, fret 8). Same note name, two places on the neck. Pluck both and listen — same chord, slightly different colour. You\'ve got it when: find and play both Fs, and say WHY they are both F (read the root: low E + 1 fret = F; A string + 8 frets = F).',
            text_es: 'Reto 3 — Dos hogares para F: toca F como cejilla en forma de E (índice en la cuerda 6, traste 1), y luego toca el MISMO acorde como cejilla en forma de A (índice en la cuerda 5, traste 8). Mismo nombre de nota, dos lugares en el mástil. Puntea ambos y escucha — mismo acorde, un color ligeramente distinto. Lo tienes cuando: encuentras y tocas ambos F, y dices POR QUÉ los dos son F (lee la raíz: Mi grave + traste 1 = F; cuerda La + traste 8 = F).',
            hint: 'This is your Module 2 fretboard map paying off: the root note names the chord, so wherever an F lives on string 6 or string 5, an F barre lives there too. Knowing both homes means you are never far from any chord.',
            hint_es: 'Este es tu mapa del diapasón del Módulo 2 dando frutos: la nota raíz nombra el acorde, así que donde sea que un F viva en la cuerda 6 o la cuerda 5, una cejilla de F también vive ahí. Conocer ambos hogares significa que nunca estás lejos de ningún acorde.',
            stuck: 'Find the root note first, then build the shape around it. Low E + 1 fret = F (E-shape home); A string + 8 frets = F (A-shape home). The shape follows the root.',
            stuck_es: 'Encuentra la nota raíz primero, y luego construye la forma alrededor de ella. Mi grave + traste 1 = F (hogar de la forma de E); cuerda La + traste 8 = F (hogar de la forma de A). La forma sigue a la raíz.',
            levelUp: 'Find both homes for G (E-shape fret 3, A-shape fret 10) and for C (A-shape fret 3, E-shape fret 8).',
            levelUp_es: 'Encuentra ambos hogares para G (forma de E traste 3, forma de A traste 10) y para C (forma de A traste 3, forma de E traste 8).',
            skills: [5, 6],
            chords: [
              { name: 'F (E-shape)', chord: [[6,1,'1'],[5,3,'3'],[4,3,'4'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
              { name: 'F (A-shape)', chord: [[6,'x'],[5,8,'1'],[4,10,'3'],[3,10,'3'],[2,10,'3'],[1,8,'1']], position: 8 }
            ]
          }
            ]
          },
          {
            title: 'Combine E-shape & A-shape barres',
            title_es: 'Combina las cejillas en forma de E y de A',
            steps: [
          {
            text: 'Challenge 4 — Shape Combo (your assessment piece): alternate E-shape and A-shape — F (E, 1st), C (A, 3rd), G (E, 3rd), D (A, 5th), 2 bars each at 60 BPM. You\'ve got it when: smooth switches between the two shapes, landing each change on beat 1.',
            text_es: 'Reto 4 — Combo de formas (tu pieza de evaluación): alterna forma de E y forma de A — F (E, traste 1), C (A, traste 3), G (E, traste 3), D (A, traste 5), 2 compases cada uno a 60 BPM. Lo tienes cuando: cambios fluidos entre las dos formas, cayendo cada cambio en el tiempo 1.',
            hint: 'You\'re alternating between E-shape and A-shape with each chord change. This is what real songs ask for. Notice that some chord changes are tiny hand moves — barely shift positions.',
            hint_es: 'Estás alternando entre la forma de E y la forma de A con cada cambio de acorde. Esto es lo que las canciones reales piden. Fíjate que algunos cambios de acorde son movimientos pequeños de mano — apenas cambian de posición.',
            stuck: 'Drill one pair at a time — F→C, then G→D — before running all four. Some moves are tiny (G E-shape fret 3 → D A-shape fret 5 is a short hop). Drop to 50 BPM if the changes fall apart.',
            stuck_es: 'Ejercita un par a la vez — F→C, y luego G→D — antes de correr los cuatro. Algunos movimientos son pequeños (G en forma de E traste 3 → D en forma de A traste 5 es un salto corto). Baja a 50 BPM si los cambios se desarman.',
            levelUp: 'Run it with the D-DU-UDU strum, or push to 75 BPM.',
            levelUp_es: 'Tócalo con el rasgueo D-DU-UDU, o sube a 75 BPM.',
            skills: [5, 6],
            response: { type: 'short', prompt: 'Personal record — play the F–C–G–D switch cleanly at 60 BPM, then go +5 at a time. Your fastest CLEAN loop today (BPM)?', prompt_es: 'Récord personal — toca el cambio F–C–G–D limpio a 60 BPM, y luego sube de 5 en 5. ¿Tu vuelta LIMPIA más rápida hoy (BPM)?', placeholder: 'e.g. 70 — try for a higher number next time', placeholder_es: 'p. ej. 70 — intenta superarlo la próxima vez' },
            chords: [
              { name: 'F', chord: [[6,1,'1'],[5,3,'3'],[4,3,'4'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
              { name: 'C', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,5,'3'],[2,5,'3'],[1,3,'1']], position: 3 },
              { name: 'G', chord: [[6,3,'1'],[5,5,'3'],[4,5,'4'],[3,4,'2'],[2,3,'1'],[1,3,'1']], position: 3 },
              { name: 'D', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,7,'3'],[2,7,'3'],[1,5,'1']], position: 5 }
            ]
          }
            ]
          },
          {
            title: 'Strum the barre chords with a D-DU-UDU pattern',
            title_es: 'Rasguea los acordes con cejilla con un patrón D-DU-UDU',
            steps: [
          {
            text: 'Challenge — Groove the Barres: take a barre progression (F–C–G–D, or Am–G–F as barres) and play it with the D-DU-UDU pattern from Module 6 instead of one strum per bar. You\'ve got it when: the strum pattern stays steady and even while you switch barre shapes — the groove (the steady rhythmic feel) doesn\'t break at the chord change.',
            text_es: 'Reto — Dale groove a las cejillas: toma una progresión con cejillas (F–C–G–D, o Am–G–F como cejillas) y tócala con el patrón D-DU-UDU del Módulo 6 en lugar de un rasgueo por compás. Lo tienes cuando: el patrón de rasgueo se mantiene estable y parejo mientras cambias de forma de cejilla — el groove (la sensación rítmica constante) no se rompe en el cambio de acorde.',
            hint: 'You spent Module 6 making that strum automatic — now layer it onto the harder barre chords. If the pattern falls apart at a change, slow the metronome until barre + strum hold together.',
            hint_es: 'Pasaste el Módulo 6 haciendo que ese rasgueo fuera automático — ahora superpónlo sobre los acordes con cejilla, más difíciles. Si el patrón se desarma en un cambio, baja el metrónomo hasta que la cejilla y el rasgueo se mantengan juntos.',
            stuck: 'Strip it back: play the progression as one strum per bar until the changes are clean, THEN layer the D-DU-UDU pattern on top. Add the rhythm only once the chords land.',
            stuck_es: 'Simplifícalo: toca la progresión con un rasgueo por compás hasta que los cambios salgan limpios, y LUEGO superpón el patrón D-DU-UDU encima. Agrega el ritmo solo una vez que los acordes caigan bien.',
            levelUp: 'Push the tempo, or accent beats 2 and 4 for a backbeat feel.',
            levelUp_es: 'Sube el tempo, o acentúa los tiempos 2 y 4 para una sensación de contratiempo.',
            skills: [5, 6]
          }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                text: 'Challenge — Oye Mi Amor, full barre Bm: the verse\'s small Bm graduates today. Index bars fret 2 (strings 5–1), and you play Bm · G one bar each with your D-DU-UDU strum at 60 BPM. You\'ve got it when: four laps where the full Bm rings as clean as the G — the song\'s last beginner shortcut is gone.',
                text_es: 'Reto — Oye Mi Amor, cejilla completa de Bm: el Bm pequeño de la estrofa se gradúa hoy. El índice hace cejilla en el traste 2 (cuerdas 5–1), y tocas Bm · G un compás cada uno con tu rasgueo D-DU-UDU a 60 BPM. Lo tienes cuando: cuatro vueltas donde el Bm completo suena tan limpio como el G — el último atajo de principiante de la canción se acabó.',
                hint: 'It\'s built on the same fret-2 bar as your B major — the minor version just re-stacks the fingers on top. The index tip mutes string 6 for you.',
                hint_es: 'Se construye sobre la misma cejilla del traste 2 que tu B mayor — la versión menor solo reacomoda los dedos encima. La punta del índice silencia la cuerda 6 por ti.',
                stuck: 'Whenever the barre buzzes, fall back to the small Bm for a lap, then trade back — alternate small and full until full wins.',
                stuck_es: 'Cada vez que la cejilla zumbe, vuelve al Bm pequeño por una vuelta, y luego cambia de vuelta — alterna el pequeño y el completo hasta que gane el completo.',
                levelUp: 'Play the chorus (A · D · E · D) as barres too — the whole song with no open chords.',
                levelUp_es: 'Toca también el coro (A · D · E · D) como cejillas — la canción entera sin acordes abiertos.',
                skills: [1, 2],
                chords: [
                  { name: 'Bm (full barre)', chord: [[6,'x'],[5,2,'1'],[4,4,'3'],[3,4,'4'],[2,3,'2'],[1,2,'1']], position: 2 }
                ]
              },
              {
                text: 'Challenge — Watchtower, no open chords: play Am · G · F entirely as barres — Am is the E-shape minor at fret 5 (the bar plus your open-Em fingers), G and F are your E-shape majors at frets 3 and 1. Two beats per chord at 60 BPM. You\'ve got it when: four laps using ONLY barre chords — proof you no longer need the open shapes. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: from Layer 1 to every chord a barre</a>.',
                text_es: 'Reto — Watchtower, sin acordes abiertos: toca Am · G · F por completo como cejillas — Am es la forma menor de E en el traste 5 (la cejilla más tus dedos de Em abierto), G y F son tus formas mayores de E en los trastes 3 y 1. Dos tiempos por acorde a 60 BPM. Lo tienes cuando: cuatro vueltas usando SOLO acordes con cejilla — prueba de que ya no necesitas las formas abiertas. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: de la Capa 1 a cada acorde como cejilla</a>.',
                hint: 'Minor E-shape = the major shape minus the middle finger; the bar covers the note it left behind. Read the roots on string 6: fret 5 = A, fret 3 = G, fret 1 = F.',
                hint_es: 'Forma menor de E = la forma mayor menos el dedo medio; la cejilla cubre la nota que dejó atrás. Lee las raíces en la cuerda 6: traste 5 = A, traste 3 = G, traste 1 = F.',
                stuck: 'Get each chord clean on its own (pluck all 6 strings), then pair Am → G, and add the F last — it\'s the tightest squeeze.',
                stuck_es: 'Logra que cada acorde suene limpio por separado (puntea las 6 cuerdas), y luego junta Am → G, y agrega el F al final — es el apriete más ajustado.',
                levelUp: 'Run it with D-DU-UDU, or alternate one lap of open chords with one lap of barres and hear the difference.',
                levelUp_es: 'Tócalo con D-DU-UDU, o alterna una vuelta de acordes abiertos con una vuelta de cejillas y escucha la diferencia.',
                skills: [5, 6],
                chords: [
                  { name: 'Am (E-shape)', chord: [[6,5,'1'],[5,7,'3'],[4,7,'4'],[3,5,'1'],[2,5,'1'],[1,5,'1']], position: 5 }
                ],
                response: { type: 'short', prompt: 'Personal record — clean all-barre Watchtower laps in a row. Your count today?', prompt_es: 'Récord personal — vueltas seguidas de Watchtower solo con cejillas y limpias. ¿Tu cuenta de hoy?', placeholder: 'e.g. 2 — the F still buzzes', placeholder_es: 'p. ej. 2 — el F todavía zumba' }
              },
              {
                text: 'Challenge — Luna, full barre F: the little F (xx3211) graduates today. Index bars fret 1 across all six strings — the toughest fret on the neck to barre — and you play F ↔ Am with two downbeat strums per bar at 60 BPM. You\'ve got it when: four laps where all six strings of the F ring as clean as the Am — Luna\'s last beginner shortcut is gone. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: beyond Layer 5 — the barre upgrade</a>.',
                text_es: 'Reto — Luna, cejilla completa de F: el F pequeño (xx3211) se gradúa hoy. El índice hace cejilla en el traste 1 a lo largo de las seis cuerdas — el traste más difícil del mástil para hacer cejilla — y tocas F ↔ Am con dos rasgueos en el tiempo fuerte por compás a 60 BPM. Lo tienes cuando: cuatro vueltas donde las seis cuerdas del F suenan tan limpias como el Am — el último atajo de principiante de Luna se acabó. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Recorrido de la canción: más allá de la Capa 5 — la mejora de la cejilla</a>.',
                hint: 'Roll the index onto its bony edge and add a gentle pull-back from the whole arm so the thumb doesn\'t do all the work — fret 1 needs that extra leverage on top of your thumb squeeze.',
                hint_es: 'Rueda el índice hacia su borde óseo y agrega un ligero tirón hacia atrás desde todo el brazo para que el pulgar no haga todo el trabajo — el traste 1 necesita esa palanca extra además del apriete de tu pulgar.',
                stuck: 'Barre just the top two strings at fret 1 and add one string per day. The six-string F takes weeks, not one day — go slow.',
                stuck_es: 'Haz cejilla solo en las dos cuerdas más agudas en el traste 1 y agrega una cuerda por día. El F de seis cuerdas toma semanas, no un día — ve despacio.',
                levelUp: 'Slide the same barre shape to fret 5 — that\'s A major, and suddenly you can play every major chord on the neck.',
                levelUp_es: 'Desliza la misma forma de cejilla al traste 5 — eso es A mayor, y de repente puedes tocar todos los acordes mayores del mástil.'
              }
            ]
          },
          {
            title: '🌶️ Level-up — the Sweet Child O\' Mine intro riff (optional harder goal)',
            title_es: '🌶️ Sube de nivel — el riff de intro de Sweet Child O\' Mine (meta opcional más difícil)',
            steps: [
          {
            text: '🌶️ Try it: learn the most famous riff in the course. The "Sweet Child O\' Mine" intro lives up high on the D, G, and B strings around the 12th–15th frets, picked one note at a time. Watch <a href="https://www.youtube.com/watch?v=EBNlYH4P5r8" target="_blank">Sweet Child O\' Mine Intro in Standard Tuning – Jbf Music &amp; Guitar</a> (played slow and full speed, with the TAB on screen), learn just the first bar, and play it slowly. No score, no rush — this is a late-course optional challenge you can keep practicing a little at a time.',
            text_es: '🌶️ Pruébalo: aprende el riff más famoso del curso. La intro de "Sweet Child O\' Mine" vive arriba en las cuerdas Re, Sol y Si, alrededor de los trastes 12–15, pulsada una nota a la vez. Mira <a href="https://www.youtube.com/watch?v=EBNlYH4P5r8" target="_blank">Sweet Child O\' Mine Intro in Standard Tuning – Jbf Music &amp; Guitar</a> (tocado lento y a velocidad completa, con el TAB en pantalla), aprende solo el primer compás, y tócalo despacio. Sin puntaje, sin apuro — este es un reto opcional de fin de curso que puedes seguir practicando poco a poco.',
            hint: 'The lesson is in standard tuning — the same tuning your guitar is already in — so you can play along directly. (The original record is tuned a half-step lower, so you\'ll sound slightly higher than the album; that\'s normal.) Loop just the first bar until it\'s clean before adding more.',
            hint_es: 'La lección está en afinación estándar — la misma afinación en la que ya está tu guitarra — así que puedes tocar junto directamente. (La grabación original está afinada medio tono más abajo, así que vas a sonar ligeramente más agudo que el álbum; eso es normal.) Repite solo el primer compás hasta que salga limpio antes de agregar más.',
            skills: [3, 6]
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                text: 'You\'ve reached the hardest hands-on skill in the course — give yourself credit for that. Which barre (E-shape or A-shape, and at which chord) most needs another week of short daily tries? Type it below; that\'s your standing warm-up from here. (Don\'t stop yet — one more section below!)',
                text_es: 'Has llegado a la destreza práctica más difícil del curso — date crédito por eso. ¿Qué cejilla (forma de E o forma de A, y en qué acorde) necesita más otra semana de intentos cortos diarios? Escríbelo abajo; ese es tu calentamiento fijo de ahora en adelante. (¡No te detengas todavía — falta una sección más abajo!)',
                response: { type: 'short', placeholder: 'e.g. the F barre at fret 1 — a few clean tries every day', placeholder_es: 'p. ej. la cejilla de F en el traste 1 — algunos intentos limpios cada día' }
              }
            ]
          },
          {
            title: 'The last two barres — F# and Bb',
            title_es: 'Las últimas dos cejillas — F# y Bb',
            steps: [
              {
                text: 'Challenge — F# and Bb, the last two: you\'ve slid both barre shapes all over the neck — now get the two lowest ones clean — the last two shapes left in this module. F# major is your E-shape barre at fret 2 (root F# on string 6). Bb major is your A-shape barre at fret 1 (root Bb on string 5, low E muted). Play each one cleanly, then trade F# ↔ Bb, one strum apiece. You\'ve got it when: both ring clean at these tight low frets and you can name each by its root.',
                text_es: 'Reto — F# y Bb, las últimas dos: has deslizado ambas formas de cejilla por todo el mástil — ahora logra que las dos más bajas suenen limpias — las últimas dos formas que quedan en este módulo. F# mayor es tu cejilla en forma de E en el traste 2 (raíz F# en la cuerda 6). Bb mayor es tu cejilla en forma de A en el traste 1 (raíz Bb en la cuerda 5, Mi grave silenciada). Toca cada una de forma limpia, y luego alterna F# ↔ Bb, un rasgueo cada una. Lo tienes cuando: ambas suenan limpias en estos trastes bajos y apretados y puedes nombrar cada una por su raíz.',
                hint: 'Same two shapes you already own, just parked down low where the strings fight hardest. F#: the E-shape bar on fret 2 — one fret above the open E chord. Bb: the A-shape bar on fret 1 — index bars the strings, your ring finger sub-barres strings 4-3-2 at fret 3 (the same sub-barre you drilled on B, C and D), and your index mutes the low E — one fret above the open A chord. Read the roots: string 6 fret 2 = F#, string 5 fret 1 = Bb. Tap ▶ to hear each chord.',
                hint_es: 'Las mismas dos formas que ya dominas, solo que ubicadas abajo donde las cuerdas pelean más. F#: la cejilla en forma de E en el traste 2 — un traste arriba del acorde abierto de E. Bb: la cejilla en forma de A en el traste 1 — el índice hace la cejilla en las cuerdas, tu dedo anular hace la sub-cejilla en las cuerdas 4-3-2 en el traste 3 (la misma sub-cejilla que ejercitaste en B, C y D), y tu índice silencia la Mi grave — un traste arriba del acorde abierto de A. Lee las raíces: cuerda 6 traste 2 = F#, cuerda 5 traste 1 = Bb. Toca ▶ para escuchar cada acorde.',
                stuck: 'These sit at the tightest end of the neck, so build each in stages — and if fret 1 or 2 buzzes, prove the shape higher up first, then walk it down. For Bb, get the string-5 bass and the ring-finger sub-barre ringing before you add the high E. Cramping is normal; shake your hand loose.',
                stuck_es: 'Estos caen en el extremo más apretado del mástil, así que construye cada uno por etapas — y si el traste 1 o 2 zumba, prueba la forma más arriba primero, y luego bájala. Para Bb, logra que suenen el bajo de la cuerda 5 y la sub-cejilla del anular antes de agregar la mi aguda. Acalambrarse es normal; sacude tu mano para relajarla.',
                levelUp: 'Hear them in real music: F# is all over "Hotel California"; Bb is the fourth chord of the key (the IV chord) in "Hey Jude." Or slide each shape up one fret and name the new chord (G, and B).',
                levelUp_es: 'Escúchalas en música real: F# está por toda "Hotel California"; Bb es el cuarto acorde de la tonalidad (el acorde IV) en "Hey Jude". O desliza cada forma un traste hacia arriba y nombra el acorde nuevo (G, y B).',
                skills: [3, 4, 5],
                chords: [
                  { name: 'F# major (E-shape)', chord: [[6,2,'1'],[5,4,'3'],[4,4,'4'],[3,3,'2'],[2,2,'1'],[1,2,'1']], position: 2 },
                  { name: 'Bb major (A-shape)', chord: [[6,'x'],[5,1,'1'],[4,3,'3'],[3,3,'3'],[2,3,'3'],[1,1,'1']], position: 1 }
                ],
                playSeq: { label: 'Hear F# major, then Bb major', label_es: 'Escucha F# mayor, y luego Bb mayor', bpm: 50, notes: [[42,49,54,58,61,66],[46,53,58,62,65]] },
                response: { type: 'short', prompt: 'Which of the two low barres — F# or Bb — rings less cleanly right now? Name it for your next warm-up.', prompt_es: '¿Cuál de las dos cejillas bajas — F# o Bb — suena menos limpia ahora mismo? Nómbrala para tu próximo calentamiento.', placeholder: 'e.g. Bb — my ring-finger sub-barre deadens the high E', placeholder_es: 'p. ej. Bb — mi sub-cejilla del anular apaga la mi aguda' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Forms A-shape barre cleanly · Plays Bb, B, C as A-shape barre · Names an A-shape barre by its root on string 5 · Switches between E-shape and A-shape barre in a progression · Plays a full song using only barre chords',
      goal_es: 'Forma la cejilla en forma de A de manera limpia · Toca Bb, B, C como cejilla en forma de A · Nombra una cejilla en forma de A por su raíz en la cuerda 5 · Cambia entre cejilla en forma de E y de A en una progresión · Toca una canción completa usando solo acordes con cejilla',
      performance: 'Solo: record yourself playing a 4-chord progression (e.g., F-C-G-D or Am-G-F-C) entirely with barre chords, 2 bars each, at 60 BPM. Listen back for clean tone on every chord.',
      selfCheck: 'Can you play the same chord (say F major) two different ways — as E-shape and as A-shape? Can you switch between the two shapes mid-song without thinking?',
      selfCheck_es: '¿Puedes tocar el mismo acorde (digamos F mayor) de dos formas distintas — como forma de E y como forma de A? ¿Puedes cambiar entre las dos formas a mitad de la canción sin pensarlo?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
    },

    skills: [
      { id: 'm7w3-s1', text: 'Form an A-shape barre chord cleanly at the 2nd fret (B major)',
        text_es: 'Formar un acorde con cejilla en forma de A de manera limpia en el traste 2 (B mayor)',
        gotItWhen: 'your B barre rings cleanly on strings 5 to 1 — and string 6 (low E) is muted by your index finger so it doesn\'t accidentally sound.',
        gotItWhen_es: 'tu cejilla de B suena limpia en las cuerdas 5 a 1 — y la cuerda 6 (Mi grave) está silenciada por tu dedo índice para que no suene por accidente.',
        practice: { type: 'playSeq', label: 'Hear B major (A-shape barre, arpeggiated)', label_es: 'Escucha B mayor (cejilla en forma de A, arpegiada)', bpm: 60,
          notes: [47, 54, 59, 63, 66] } },
      { id: 'm7w3-s2', text: 'Mute string 6 (low E) when playing an A-shape barre',
        text_es: 'Silenciar la cuerda 6 (Mi grave) al tocar una cejilla en forma de A',
        gotItWhen: 'your index finger lightly mutes string 6 so you don\'t have to think about avoiding it when strumming — even a slightly wide strum sounds fine.',
        gotItWhen_es: 'tu dedo índice silencia ligeramente la cuerda 6 para que no tengas que pensar en evitarla al rasguear — incluso un rasgueo un poco amplio suena bien.',
        practice: { type: 'mc', prompt: 'In an A-shape barre chord, what happens to the low E string (string 6)?',
          prompt_es: 'En un acorde con cejilla en forma de A, ¿qué pasa con la cuerda Mi grave (cuerda 6)?',
          choices: ['It rings as part of the chord', 'It is muted by the side of your index finger', 'You skip your strum carefully', 'You tune it to a different note'],
          choices_es: ['Suena como parte del acorde', 'Está silenciada por el costado de tu dedo índice', 'Te saltas esa cuerda con cuidado al rasguear', 'La afinas a una nota distinta'], answer: 1 } },
      { id: 'm7w3-s3', text: 'Name an A-shape barre chord by its root note on string 5',
        text_es: 'Nombrar un acorde con cejilla en forma de A por su nota raíz en la cuerda 5',
        gotItWhen: 'you can slide your A-shape barre to any random fret and name the chord by reading the note on string 5 (using your Module 2 knowledge).',
        gotItWhen_es: 'puedes deslizar tu cejilla en forma de A a cualquier traste al azar y nombrar el acorde leyendo la nota en la cuerda 5 (usando tu conocimiento del Módulo 2).',
        practice: { type: 'mc', prompt: 'If you play an A-shape barre chord with your index finger on the 5th fret of string 5, what chord is it?',
          prompt_es: 'Si tocas un acorde con cejilla en forma de A con tu dedo índice en el traste 5 de la cuerda 5, ¿qué acorde es?',
          choices: ['C major', 'D major', 'E major', 'A major'],
          choices_es: ['C mayor', 'D mayor', 'E mayor', 'A mayor'], answer: 1 } },
      { id: 'm7w3-s4', text: 'Play Bb, C, and D as A-shape barre chords',
        text_es: 'Tocar Bb, C, y D como acordes con cejilla en forma de A',
        gotItWhen: 'you can slide the A-shape between Bb (1st fret), C (3rd fret), and D (5th fret) and each chord rings cleanly with no muffled strings.',
        gotItWhen_es: 'puedes deslizar la forma de A entre Bb (traste 1), C (traste 3), y D (traste 5) y cada acorde suena limpio sin cuerdas apagadas.',
        practice: { type: 'playSeq', label: 'Bb · C · D roots (A string)', label_es: 'Raíces Bb · C · D (cuerda La)', bpm: 60,
          notes: [46, 48, 50] } },
      { id: 'm7w3-s5', text: 'Switch between an E-shape barre and an A-shape barre in time',
        text_es: 'Cambiar entre una cejilla en forma de E y una cejilla en forma de A a tiempo',
        gotItWhen: 'you can go from F (E-shape, 1st fret) to C (A-shape, 3rd fret) on beat 1 of a new bar at 60 BPM without buzzing or pausing.',
        gotItWhen_es: 'puedes ir de F (forma de E, traste 1) a C (forma de A, traste 3) en el tiempo 1 de un compás nuevo a 60 BPM sin zumbido ni pausas.' },
      { id: 'm7w3-s6', text: 'Play a full song using only barre chords (no open chords)',
        text_es: 'Tocar una canción completa usando solo acordes con cejilla (sin acordes abiertos)',
        gotItWhen: 'you can play "All Along the Watchtower" or another 3-chord song from start to finish using ONLY barre chords — proving you no longer need the open shapes.',
        gotItWhen_es: 'puedes tocar "All Along the Watchtower" u otra canción de 3 acordes de principio a fin usando SOLO acordes con cejilla — probando que ya no necesitas las formas abiertas.',
        practice: { type: 'playSeq', label: 'F · C · G · D barre progression (roots)', label_es: 'Progresión de cejillas F · C · G · D (raíces)', bpm: 60,
          notes: [41, 48, 43, 50] } }
    ]
  }

); // end module-7.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[7] = [
      { name: '"Smoke on the Water" — Deep Purple', meta: 'Iconic 2-note TAB riff · A + D strings', meta_es: 'Riff icónico de TAB de 2 notas · cuerdas La + Re', type: 'Focus', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=Q2FzZSBD5LE',
        tutorialUrl: 'https://www.youtube.com/watch?v=tCQ0r7vqkFQ' },
      { name: '"Crazy Train" — Ozzy Osbourne', meta: 'Fast intro riff · alternate picking practice', meta_es: 'Riff de intro rápido · práctica de púa alternada', type: 'Focus', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=FVovq9TGBw0',
        tutorialUrl: 'https://www.youtube.com/watch?v=61YCfNHZuHE' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Single-note riff with rhythm variations', meta_es: 'Riff de una sola nota con variaciones rítmicas', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Hey Jude" — The Beatles', meta: 'F major in the chorus · perfect E-shape barre application', meta_es: 'F mayor en el coro · aplicación perfecta de la cejilla en forma de E', type: 'Focus', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=A_MjCqQoLLA',
        tutorialUrl: 'https://www.youtube.com/watch?v=VyleoeWxbIQ' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: 'Full barre F in the vamp (instead of the little F)', meta_es: 'Cejilla completa de F en el vamp (en lugar del F pequeño)', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
      { name: '"Wonderwall" — Oasis', meta: 'Easier with barre chords once you have them down', meta_es: 'Más fácil con acordes con cejilla una vez que los dominas', type: 'Focus', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=6hzrDeceEKc',
        tutorialUrl: 'https://www.youtube.com/watch?v=5V81btmYxgE' },
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Barre the D–C–G verse · intro riff = optional harder challenge', meta_es: 'Toca la estrofa D–C–G con cejillas · riff de intro = reto opcional más difícil', type: 'Core', core: true, journeyUrl: 'tabs/sweet-child-o-mine.html',
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0ASVeXINKYM' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Am–G–F–G · use barre shapes for all three', meta_es: 'Am–G–F–G · usa formas de cejilla para los tres', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Happy Birthday"', meta: 'Play it entirely with barre chords', meta_es: 'Tócala por completo con acordes con cejilla', type: 'Focus', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Oye Mi Amor" — Maná', meta: 'Full barre-chord progression · Bm–G', meta_es: 'Progresión completa de acordes con cejilla · Bm–G', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=UlkG3DmZJEI',
        tutorialUrl: 'https://www.youtube.com/watch?v=F4BbTdP2v70' },
      { name: '"Tu Boda" — Oscar Maydon × Fuerza Regida', meta: 'Barre-chord sierreño progression', meta_es: 'Progresión sierreña con acordes con cejilla', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=_ymicn0_GYc',
        tutorialUrl: 'https://www.youtube.com/watch?v=AlElh28IumI' },
      { name: '"Hotel California" — Eagles', meta: 'Bm–F#–A–E·G–D–Em–F# · lots of barre practice', meta_es: 'Bm–F#–A–E·G–D–Em–F# · mucha práctica de cejilla', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=09839DpTctU',
        tutorialUrl: 'https://www.youtube.com/watch?v=JIDdI-AtK-Q' },
      { name: '"Zombie" — The Cranberries', meta: 'Em–C–G–D · mix open and barre', meta_es: 'Em–C–G–D · mezcla acordes abiertos y cejillas', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=6Ejga4kJUts',
        tutorialUrl: 'https://www.youtube.com/watch?v=uGMybMuDKAU' },
      { name: '"Mad World" — Gary Jules / Tears for Fears', meta: 'Em–G–D–A · barre chord workout', meta_es: 'Em–G–D–A · ejercicio de acordes con cejilla', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=etSbOs3aUqI',
        tutorialUrl: 'https://www.youtube.com/watch?v=r-rvJsxhkQM' }
    ];

MODULE_REVIEWS[7] = {
  moduleNum: 7,
  module: 'TAB Notation and Barre Chords',
  module_es: 'Notación TAB y acordes con cejilla',
  skills: [
    { id: 'mr7-s1', text: 'I can read multi-line TAB — stacked numbers as chords, plus the rhythm symbols (quarter, 8th, half) above the notes',
      text_es: 'Puedo leer TAB de varias líneas — números apilados como acordes, además de los símbolos de ritmo (negra, corchea, blanca) arriba de las notas', set: 'm7w1' },
    { id: 'mr7-s2', text: 'I can recognise hammer-on (h), pull-off (p), and slide (/ \\) markings in TAB and play them',
      text_es: 'Puedo reconocer las marcas de hammer-on (h), pull-off (p), y deslizamiento (/ \\) en el TAB y tocarlas', set: 'm7w1' },
    { id: 'mr7-s3', text: 'I can bar all 6 strings with my index finger so every string rings',
      text_es: 'Puedo hacer cejilla en las 6 cuerdas con mi dedo índice para que todas suenen', set: 'm7w2' },
    { id: 'mr7-s4', text: 'I can form an E-shape barre and play F, G, and A cleanly, naming each by its root on string 6',
      text_es: 'Puedo formar una cejilla en forma de E y tocar F, G, y A de forma limpia, nombrando cada uno por su raíz en la cuerda 6', set: 'm7w2' },
    { id: 'mr7-s5', text: 'I can form an A-shape barre and play B, C, and D cleanly, naming each by its root on string 5',
      text_es: 'Puedo formar una cejilla en forma de A y tocar B, C, y D de forma limpia, nombrando cada uno por su raíz en la cuerda 5', set: 'm7w3' },
    { id: 'mr7-s6', text: 'I can find both "homes" for a chord — its E-shape (string-6 root) and A-shape (string-5 root) — and switch between the two shapes in a progression',
      text_es: 'Puedo encontrar los dos "hogares" de un acorde — su forma de E (raíz en la cuerda 6) y su forma de A (raíz en la cuerda 5) — y cambiar entre las dos formas en una progresión', set: 'm7w3' }
  ],
  assessItems: [
    'Play F barre → slide to G → slide to A, one clean strum each (E-shape, root on string 6)',
    'Play a 4-chord progression mixing E-shape and A-shape barres (e.g. F–C–G–D), 2 bars each, at 60 BPM'
  ],
  assessItems_es: [
    'Toca la cejilla de F → deslízala a G → deslízala a A, un rasgueo limpio cada una (forma de E, raíz en la cuerda 6)',
    'Toca una progresión de 4 acordes mezclando cejillas en forma de E y de A (p. ej. F–C–G–D), 2 compases cada uno, a 60 BPM'
  ],
  forward: 'Module 8 hands the spotlight to your <strong>picking hand</strong>. Every barre and open shape you can now hold becomes a chord frame that fingerpicking decorates one string at a time — the fretting work you just did is exactly what makes those patterns sound full.',
  forward_es: 'El Módulo 8 le da el protagonismo a tu <strong>mano de pulsar</strong>. Cada cejilla y forma abierta que ahora puedes sostener se convierte en un marco de acorde que el fingerpicking decora una cuerda a la vez — el trabajo de trastear que acabas de hacer es exactamente lo que hace que esos patrones suenen completos.',
  standards: ['Pr.4a', 'Pr.5a', 'Re.7a']
};
