// ============================================================
//  MODULE 4 — Open Chords
//  Edit this file to change Module 4 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm4w1',
    label: 'Set 1',
    locked: false,
    module: 'Open Chords',
    moduleNum: 4,
    unit: 'Module 4 · Open Chords',
    unit_es: 'Módulo 4 · Acordes al aire',
    title: 'Set 1',
    subtitle: 'Reading chord diagrams · Am and Em · First strumming',
    subtitle_es: 'Leer diagramas de acordes · Am y Em · Primer rasgueo',
    skillFocus: 'Reading chord diagrams · Fretting the Am and Em chords · Playing a simple down-strum',
    skillFocus_es: 'Leer diagramas de acordes · Trastear los acordes Am y Em · Tocar un rasgueo simple hacia abajo',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        title_es: 'Estación de computadora — Mira · Escucha · Practica',
        sections: [
          {
            title: 'Watch the lesson videos',
            title_es: 'Mira los videos de la lección',
            steps: [
          {
            label: 'Watch: reading TAB & chord boxes', label_es: 'Mira: leer TAB y diagramas de acorde',
            text: 'Watch: <a href="https://youtu.be/4-JTCASlh-w" target="_blank">How to Read TAB & Chord Boxes – JustinGuitar</a> (0:00–4:00).<ol><li>Pause on each chord diagram. Say what the X, the O and a numbered dot mean.</li><li>Pause on a TAB. Say one way it is different from a chord diagram.</li></ol>You\'ve got it when: you explain the X, the O, the dot and one TAB difference without pausing the video again.',
            text_es: 'Mira: <a href="https://youtu.be/4-JTCASlh-w" target="_blank">How to Read TAB & Chord Boxes – JustinGuitar</a> (0:00–4:00).<ol><li>Pausa en cada diagrama de acorde. Di qué significan la X, la O y un punto con número.</li><li>Pausa en un TAB. Di una manera en que es diferente de un diagrama de acorde.</li></ol>Lo tienes cuando: explicas la X, la O, el punto y una diferencia del TAB sin volver a pausar el video.',
            hint: 'Pause each time he shows a new diagram. Look at it before he explains it.',
            hint_es: 'Pausa cada vez que muestra un diagrama nuevo. Míralo antes de que lo explique.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'On a chord diagram, an X above a string means:',
              prompt_es: 'En un diagrama de acorde, una X sobre una cuerda significa:',
              answer: 0,
              explain: 'An X means do not play that string. It stays silent. An O means play it open.',
              explain_es: 'Una X significa que no toques esa cuerda. Queda en silencio. Una O significa tocarla al aire.',
              choices: [
              'Do not play that string',
              'Play that string with your thumb',
              'Play that string one fret higher',
              'It is optional'
            ],
              choices_es: [
              'No toques esa cuerda',
              'Toca esa cuerda con tu pulgar',
              'Toca esa cuerda un traste más arriba',
              'Es opcional'
            ] }
          },
          {
            label: 'Watch: first chords Am & Dm', label_es: 'Mira: primeros acordes Am y Dm',
            text: 'Watch: <a href="https://www.youtube.com/watch?v=y5cAG2u6mTQ" target="_blank">How To Play the Am and Dm Chords – Lauren Bateman</a>. Learn Am today. Dm comes later in the course. You\'ve got it when: you build Am and play it four times in a row with all five strings ringing.',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=y5cAG2u6mTQ" target="_blank">How To Play the Am and Dm Chords – Lauren Bateman</a>. Aprende Am hoy. Dm llega más adelante en el curso. Lo tienes cuando: armas Am y lo tocas cuatro veces seguidas con las cinco cuerdas sonando.',
            hint: 'Build Am as she shows it. Strum it before you watch more. If a string is quiet, find the finger that touches it.',
            hint_es: 'Arma Am como ella lo muestra. Rasguéalo antes de seguir viendo. Si una cuerda no suena, busca el dedo que la toca.',
            skills: [3],
          },
            ]
          },
          {
            kind: 'reflection',
            title: 'Checkpoint',
            title_es: 'Punto de control',
            steps: [
          {
            label: 'Wrap-up: chord diagram parts', label_es: 'Cierre: partes del diagrama',
            text: 'Checkpoint — pause and think: of everything on a chord diagram (X, O, dots, finger numbers), which part still feels least automatic when you sit down to read one?',
            text_es: 'Punto de control — pausa y piensa: de todo lo que hay en un diagrama de acorde (X, O, puntos, números de dedo), ¿qué parte todavía se siente menos automática cuando te sientas a leer uno?',
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — chord shapes & first strums',
        title_es: 'Estación de práctica — formas de acordes y primeros rasgueos',
        sections: [
          {
            kind: 'tuning-warmup',
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tuning check', label_es: 'Calentamiento: afinación',
                text: 'Start every practice session the same way:<ol><li>Tune all 6 strings to green (E A D G B e).</li><li>Play each string open.</li></ol>You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera:<ol><li>Afina las 6 cuerdas hasta que estén en verde (E A D G B e).</li><li>Toca cada cuerda al aire.</li></ol>Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                hint: 'Tuning (Module 1) is a skill you keep forever. Clean open strings are exactly what makes a chord ring.',
                hint_es: 'Afinar (Módulo 1) es una destreza que conservas para siempre. Las cuerdas al aire limpias son exactamente lo que hace que un acorde suene bien.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Fret Am cleanly',
            title_es: 'Trastea Am limpio',
            steps: [
          {
            label: 'Challenge 1 — Clean Am', label_es: 'Reto 1 — Am limpio',
            text: 'A chord can also be written as six characters, one for each string, from the low E to the high e. x means do not play, 0 means open, and a number is the fret. Am is x02210.<ol><li>Put your index finger on the B string, fret 1.</li><li>Put your middle finger on the D string, fret 2.</li><li>Put your ring finger on the G string, fret 2.</li><li>Strum five strings, from the A string to the high e. Do not play the low E.</li><li>Lift all three fingers. Put them down again together, in one move.</li></ol>You\'ve got it when: you pluck each of the five strings and every one rings clean.',
            text_es: 'Un acorde también se puede escribir con seis caracteres, uno para cada cuerda, de la Mi grave a la mi aguda. x significa no tocar, 0 significa al aire y un número es el traste. Am es x02210.<ol><li>Pon tu dedo índice en la cuerda Si, traste 1.</li><li>Pon tu dedo medio en la cuerda Re, traste 2.</li><li>Pon tu dedo anular en la cuerda Sol, traste 2.</li><li>Rasguea cinco cuerdas, desde la cuerda La hasta la mi aguda. No toques la Mi grave.</li><li>Levanta los tres dedos. Vuelve a ponerlos juntos, en un solo movimiento.</li></ol>Lo tienes cuando: pulsas cada una de las cinco cuerdas y todas suenan limpias.',
            hint: 'Press just behind the fret wire. Curve your fingers so they do not touch the next string.',
            hint_es: 'Presiona justo detrás del traste. Curva tus dedos para que no toquen la cuerda de al lado.',
            stuck: 'Put down your index and ring fingers first. Make the B and G strings ring. Then add your middle finger. Press with the tip of each finger.',
            stuck_es: 'Pon primero tus dedos índice y anular. Haz sonar las cuerdas Si y Sol. Luego agrega tu dedo medio. Presiona con la punta de cada dedo.',
            levelUp: 'Lift all three fingers. Put the whole shape down at once and strum. Get a clean chord on the first try.',
            levelUp_es: 'Levanta los tres dedos. Pon toda la forma de una vez y rasguea. Logra un acorde limpio en el primer intento.',
            skills: [3],
            chords: [
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Fret Em cleanly',
            title_es: 'Trastea Em limpio',
            steps: [
          {
            label: 'Challenge 2 — Clean Em', label_es: 'Reto 2 — Em limpio',
            text: '<ol><li>Put your middle finger on the A string, fret 2.</li><li>Put your ring finger on the D string, fret 2.</li><li>Pluck all six strings, one at a time.</li><li>Strum all six strings.</li></ol>You\'ve got it when: every string rings when you pluck it, and you strum Em clean 4 times in a row.',
            text_es: '<ol><li>Pon tu dedo medio en la cuerda La, traste 2.</li><li>Pon tu dedo anular en la cuerda Re, traste 2.</li><li>Pulsa las seis cuerdas, una por una.</li><li>Rasguea las seis cuerdas.</li></ol>Lo tienes cuando: cada cuerda suena al pulsarla, y rasgueas Em limpio 4 veces seguidas.',
            hint: 'Em uses all six strings.',
            hint_es: 'Em usa las seis cuerdas.',
            stuck: 'If a string buzzes, arch both fingers up on their tips. Keep them off the open strings next to them.',
            stuck_es: 'Si una cuerda zumba, arquea los dos dedos sobre sus puntas. No los apoyes en las cuerdas al aire de al lado.',
            levelUp: 'Switch Em, Am, Em without looking at your fingers.',
            levelUp_es: 'Cambia Em, Am, Em sin mirar tus dedos.',
            skills: [4, 5],
            chords: [
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Switch Am ↔ Em on beat 1',
            title_es: 'Cambia Am ↔ Em en el tiempo 1',
            steps: [
          {
            label: 'Challenge 3 — Am ↔ Em Switch', label_es: 'Reto 3 — Cambio Am ↔ Em',
            text: '<ol><li>Set the metronome to 60 BPM. Strum down 4 times in each bar.</li><li>Play 2 bars of Am.</li><li>Play 2 bars of Em. Repeat.</li><li>Start moving to the next chord on beat 4, while you still strum the old one.</li></ol>You\'ve got it when: you play 8 bars with no stops and every change lands on beat 1.',
            text_es: '<ol><li>Pon el metrónomo a 60 BPM. Rasguea hacia abajo 4 veces en cada compás.</li><li>Toca 2 compases de Am.</li><li>Toca 2 compases de Em. Repite.</li><li>Empieza a moverte al siguiente acorde en el tiempo 4, mientras todavía rasgueas el anterior.</li></ol>Lo tienes cuando: tocas 8 compases sin detenerte y cada cambio cae en el tiempo 1.',
            hint: 'If a chord is not clean, keep strumming. Fix it at the next change. Set the ⏱ Timer for 2 minutes and repeat the switch until it beeps.',
            hint_es: 'Si un acorde no sale limpio, sigue rasgueando. Corrígelo en el siguiente cambio. Pon el ⏱ Temporizador en 2 minutos y repite el cambio hasta que suene.',
            stuck: 'Keep your middle and ring fingers in the same shape. Move them together one string. Lift your index finger for Em. Put it back on the B string, fret 1, for Am. Try 50 BPM.',
            stuck_es: 'Mantén tus dedos medio y anular en la misma forma. Muévelos juntos una cuerda. Levanta el dedo índice para Em. Vuelve a ponerlo en la cuerda Si, traste 1, para Am. Prueba a 50 BPM.',
            levelUp: 'Play it at 70 BPM.',
            levelUp_es: 'Tócalo a 70 BPM.',
            skills: [5, 6],
            chords: [
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'One-Minute Changes — try for a higher number',
            title_es: 'Cambios de un minuto — intenta superar tu número',
            steps: [
              {
                label: 'Challenge 4 — One-Minute Changes (Am ↔ Em)', label_es: 'Reto 4 — Cambios de un minuto (Am ↔ Em)',
                text: '<ol><li>Set the ⏱ Timer for 60 seconds.</li><li>Switch Am, Em, Am, Em as many times as you can.</li><li>Count only clean changes. A buzzy or missed change does not count.</li></ol>You\'ve got it when: you make 20 clean Am&rarr;Em changes in one minute. Next goal: 30.',
                text_es: '<ol><li>Pon el ⏱ Temporizador en 60 segundos.</li><li>Cambia Am, Em, Am, Em tantas veces como puedas.</li><li>Cuenta solo los cambios limpios. Un cambio con zumbido o fallado no cuenta.</li></ol>Lo tienes cuando: haces 20 cambios limpios de Am&rarr;Em en un minuto. Siguiente meta: 30.',
                hint: 'A clean change means every string rings.',
                hint_es: 'Un cambio limpio significa que suenan todas las cuerdas.',
                stuck: 'Your middle and ring fingers keep the same shape in both chords. Move them together one string toward the low E. Slow down until every change rings.',
                stuck_es: 'Tus dedos medio y anular mantienen la misma forma en los dos acordes. Muévelos juntos una cuerda hacia la Mi grave. Baja la velocidad hasta que cada cambio suene.',
                levelUp: 'Strum each chord once before you switch. Or switch without looking at your fingers.',
                levelUp_es: 'Rasguea cada acorde una vez antes de cambiar. O cambia sin mirar tus dedos.',
                skills: [5, 6],
              }
            ]
          },
          {
            kind: 'routine',
            title: 'My Practice Routine — weekly check-in (never graded)',
            title_es: 'Mi rutina de práctica — check-in semanal (nunca se califica)',
            steps: [
              {
                label: 'Plan your practice', label_es: 'Planea tu práctica',
                text: 'Plan your practice — this one\'s just for you, never graded. Take two minutes to update your routine:<ol><li>One thing you want to get better at.</li><li>When and where you\'ll practice this week.</li><li>How last week\'s plan went.</li></ol>Same check-in you\'ve kept since Module 1 — we keep it going through the whole course.',
                text_es: 'Planea tu práctica — esta parte es solo para ti, nunca se califica. Tómate dos minutos para actualizar tu rutina:<ol><li>Una cosa en la que quieres mejorar.</li><li>Cuándo y dónde vas a practicar esta semana.</li><li>Cómo te fue con el plan de la semana pasada.</li></ol>El mismo check-in que has mantenido desde el Módulo 1 — lo seguimos manteniendo durante todo el curso.',
                hint: 'No wrong answers — even five minutes a day is better than one long rushed session. You\'re building a habit you\'ll actually keep.',
                hint_es: 'No hay respuestas incorrectas — hasta cinco minutos al día es mejor que una sola sesión larga y apurada. Estás construyendo un hábito que de verdad vas a mantener.',
              }
            ]
          },
          {
            kind: 'reflection',
            title: 'Wrap-Up',
            title_es: 'Cierre',
            steps: [
              {
                label: 'Wrap-up: clean vs. switching', label_es: 'Cierre: limpio vs. cambiar',
                text: 'Which was harder today — getting each chord to ring clean, or switching between them in time? Type the one thing you\'ll drill (practice over and over) first next session.',
                text_es: '¿Qué fue más difícil hoy — lograr que cada acorde sonara limpio, o cambiar entre ellos a tiempo? Escribe la primera cosa que vas a ejercitar (practicar una y otra vez) la próxima sesión.',
              }
            ]
          },
          {
            title: 'Mystery Chart — name a chord from its chart',
            title_es: 'Diagrama misterioso — nombra un acorde a partir de su diagrama',
            steps: [
              {
                label: 'Challenge — Mystery Chart', label_es: 'Reto — Diagrama misterioso',
                text: 'The two charts below have no names.<ol><li>Look at the left chart only.</li><li>Find the string with an X, the open strings, and where each finger goes.</li><li>Answer the question below.</li></ol>',
                text_es: 'Los dos diagramas de abajo no tienen nombre.<ol><li>Mira solo el diagrama de la izquierda.</li><li>Encuentra la cuerda con X, las cuerdas al aire y dónde va cada dedo.</li><li>Responde la pregunta de abajo.</li></ol>',
                hint: 'Check the low E string first: X or open? Then read each dot: which string, which fret. Match the shape to a chord you know.',
                hint_es: 'Revisa primero la cuerda Mi grave: ¿X o al aire? Luego lee cada punto: qué cuerda, qué traste. Compara la forma con un acorde que conoces.',
                stuck: 'Compare the low E string on both charts. One has an X. The other plays the low E open.',
                stuck_es: 'Compara la cuerda Mi grave en los dos diagramas. Uno tiene una X. El otro toca la Mi grave al aire.',
                skills: [1, 6],
                chords: [
                  { chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
                  { chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 }
                ],
                response: { type: 'mc', prompt: 'The FIRST (left) unlabelled diagram is which chord?',
                  prompt_es: 'El PRIMER diagrama (izquierda), sin etiquetar, ¿qué acorde es?',
                  answer: 0,
                  explain: 'It\'s Am. The giveaways: the low E string is muted (X), the A string is open (that open A is the root the chord is named after), and the fingers sit on the D and G strings at fret 2 plus the B string at fret 1. It can\'t be a power chord — a power chord has only two different notes (the root and the 5th) on two or three strings, and this shape uses five strings. It isn\'t all-open either — the low E is muted and three fingers are fretted. The second diagram is Em — it plays all six strings with its two fingers on the A and D strings.',
                  explain_es: 'Es Am. Las pistas: la cuerda Mi grave está silenciada (X), la cuerda La está al aire (esa A al aire es la raíz que le da nombre al acorde), y los dedos van en las cuerdas Re y Sol en el traste 2 más la cuerda Si en el traste 1. No puede ser un acorde de potencia — un acorde de potencia tiene solo dos notas distintas (la raíz y la quinta) en dos o tres cuerdas, y esta forma usa cinco cuerdas. Tampoco es completamente al aire — la Mi grave está silenciada y hay tres dedos trasteados. El segundo diagrama es Em — toca las seis cuerdas con sus dos dedos en las cuerdas La y Re.',
                  choices: ['Am', 'Em', 'A power chord (only two notes)', 'Every string rings open'],
                  choices_es: ['Am', 'Em', 'Un acorde de potencia (solo dos notas)', 'Todas las cuerdas suenan al aire'] }
              },
              {
                label: 'Challenge — Play a Shape You Have Never Seen', label_es: 'Reto — Toca una forma que nunca has visto',
                text: 'The chart below has no name. You have not learned this shape yet.<ol><li>Read the low E string first: X or O?</li><li>Read each dot: which string, which fret, which finger.</li><li>Put your fingers where the chart shows.</li><li>Pluck each string one at a time. Skip any string with an X.</li><li>Press &#x25B6; and compare your notes with it.</li></ol>You\'ve got it when: every string with an O or a dot rings clean three times in a row, and your notes match the &#x25B6; notes.',
                text_es: 'El diagrama de abajo no tiene nombre. Todavía no has aprendido esta forma.<ol><li>Lee primero la cuerda Mi grave: ¿X u O?</li><li>Lee cada punto: qué cuerda, qué traste, qué dedo.</li><li>Pon tus dedos donde muestra el diagrama.</li><li>Pulsa cada cuerda una por una. Sáltate cualquier cuerda con X.</li><li>Presiona &#x25B6; y compara tus notas con él.</li></ol>Lo tienes cuando: cada cuerda con O o con un punto suena limpia tres veces seguidas, y tus notas son iguales a las notas de &#x25B6;.',
                hint: 'The number in each dot is the finger. The row the dot sits in is the fret.',
                hint_es: 'El número dentro de cada punto es el dedo. La fila donde está el punto es el traste.',
                stuck: 'Build the left chart from the Mystery Chart above. Compare it with this chart, dot by dot. Find the dot that is missing.',
                stuck_es: 'Arma el diagrama de la izquierda del Diagrama misterioso de arriba. Compáralo con este diagrama, punto por punto. Encuentra el punto que falta.',
                levelUp: 'This chord is called Asus2. It is Am with the index finger lifted. Switch Am, Asus2, Am four times. Lift only your index finger.',
                levelUp_es: 'Este acorde se llama Asus2. Es Am con el dedo índice levantado. Cambia Am, Asus2, Am cuatro veces. Levanta solo tu dedo índice.',
                skills: [1, 6],
                chords: [
                  { chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,0],[1,0]], position: 0 }
                ],
                playSeq: { label: 'Hear the shape, one string at a time', label_es: 'Escucha la forma, una cuerda a la vez', bpm: 60, notes: [45, 52, 57, 59, 64] }
              }
            ]
          }
        ]
      }
    },

    skills: [
      { id: 'm4w1-s1', text: 'Read a chord diagram: find the X (mute), O (open), dots (finger placement), and numbers (which finger)',
        text_es: 'Leer un diagrama de acorde: encontrar la X (silenciar), O (al aire), puntos (colocación de dedos), y números (qué dedo)',
        gotItWhen: 'you read a chord diagram you have never seen and put each finger on the right string and fret without help.',
        gotItWhen_es: 'lees un diagrama de acorde que nunca has visto y pones cada dedo en la cuerda y el traste correctos sin ayuda.',
        practice: { type: 'mc', prompt: 'A chord chart written out reads "x32010". Which strings do you strum?',
          prompt_es: 'Un acorde escrito en texto dice "x32010". ¿Qué cuerdas rasgueas?',
          choices: ['All six strings', 'From the A string down to the high e', 'Only the three fretted strings', 'From the low E down to the G string'],
          choices_es: ['Las seis cuerdas', 'De la cuerda La hasta la mi aguda', 'Solo las tres cuerdas trasteadas', 'De la cuerda Mi grave hasta la cuerda Sol'], answer: 1,
          explain: 'Read the six characters from the low E to the high e. The first "x" mutes the low E. A "0" means that string rings open. So every string from the A string to the high e rings, fretted or open. You see this shorthand again for the small F (xx3211) and Bm (xx4432) in the next two sets.',
          explain_es: 'Lee los seis caracteres desde la cuerda Mi grave hasta la cuerda mi aguda. La primera "x" silencia la Mi grave. Un "0" significa que esa cuerda suena al aire. Así que todas las cuerdas desde la cuerda La hasta la mi aguda suenan, trasteadas o al aire. Verás esta forma de escribirlo otra vez con el F pequeño (xx3211) y el Bm (xx4432) en las dos unidades siguientes.' } },
      { id: 'm4w1-s2', text: 'Tell a chord diagram from TAB, and say what each one shows',
        text_es: 'Distinguir un diagrama de acorde de un TAB, y decir qué muestra cada uno',
        gotItWhen: 'you point to a chord diagram and a TAB, say which is which, and say in one sentence what each one shows.',
        gotItWhen_es: 'señalas un diagrama de acorde y un TAB, dices cuál es cuál, y dices en una oración qué muestra cada uno.',
        practice: { type: 'mc', prompt: 'Which one shows finger positions for a chord shape, but NOT a sequence of notes to play?',
          prompt_es: '¿Cuál muestra las posiciones de los dedos para la forma de un acorde, pero NO una secuencia de notas para tocar?',
          choices: ['A chord diagram', 'TAB', 'Standard notation (notes written on five lines)', 'All three show note sequences'],
          choices_es: ['Un diagrama de acorde', 'TAB', 'Notación estándar (notas escritas en cinco líneas)', 'Los tres muestran secuencias de notas'], answer: 0,
          explain: 'A chord diagram shows one shape — which finger goes where — with no rhythm and no order. TAB and standard notation both show the notes in the order you play them.',
          explain_es: 'Un diagrama de acorde muestra una sola forma — qué dedo va dónde — sin ritmo y sin orden. El TAB y la notación estándar muestran las notas en el orden en que las tocas.' } },
      { id: 'm4w1-s3', text: 'Fret Am cleanly — every string rings with no buzzing',
        text_es: 'Trastear Am limpio — cada cuerda suena sin zumbido',
        gotItWhen: 'you pluck each of the 5 strings in Am and every one rings clear, with no buzz.',
        gotItWhen_es: 'pulsas cada una de las 5 cuerdas de Am y todas suenan claras, sin zumbido.',
        practice: { type: 'playSeq', label: 'Hear Am chord (arpeggiated)', label_es: 'Escucha el acorde Am (arpegiado)', bpm: 60,
          notes: [45, 52, 57, 60, 64] } },
      { id: 'm4w1-s4', text: 'Fret Em cleanly — all 6 strings ring',
        text_es: 'Trastear Em limpio — las 6 cuerdas suenan',
        gotItWhen: 'you strum all 6 strings and every string rings. No finger touches a string it should not.',
        gotItWhen_es: 'rasgueas las 6 cuerdas y todas suenan. Ningún dedo toca una cuerda que no debe.',
        practice: { type: 'playSeq', label: 'Hear Em chord (arpeggiated)', label_es: 'Escucha el acorde Em (arpegiado)', bpm: 60,
          notes: [40, 47, 52, 55, 59, 64] } },
      { id: 'm4w1-s5', text: 'Strum 4 down-strums per bar in time at 60 BPM',
        text_es: 'Rasguear 4 golpes hacia abajo por compás a tiempo a 60 BPM',
        gotItWhen: 'your strums land on beats 1, 2, 3 and 4 with the metronome at 60 BPM for 8 bars in a row.',
        gotItWhen_es: 'tus rasgueos caen en los tiempos 1, 2, 3 y 4 con el metrónomo a 60 BPM durante 8 compases seguidos.',
        practice: { type: 'pr', prompt: '<ol><li>Metronome at 60 BPM: strum 4 down-strums per bar.</li><li>Count how many bars in a row every strum lands with the click.</li><li>Log your best streak — 8 bars is the goal.</li></ol>',
          prompt_es: '<ol><li>Metrónomo a 60 BPM: rasguea 4 golpes hacia abajo por compás.</li><li>Cuenta cuántos compases seguidos logras con cada rasgueo cayendo con el clic.</li><li>Anota tu mejor racha — la meta es 8 compases.</li></ol>',
          unit: 'count', placeholder: 'e.g. 8 bars — try for a longer streak', placeholder_es: 'p. ej. 8 compases — intenta una racha más larga' } },
      { id: 'm4w1-s6', text: 'Read and play any chord on a chord chart',
        text_es: 'Leer y tocar cualquier acorde de un diagrama de acordes',
        gotItWhen: 'you read any chord diagram in the songbook and play the chord without looking up its name.',
        gotItWhen_es: 'lees cualquier diagrama de acorde del cancionero y tocas el acorde sin buscar su nombre.',
        practice: { type: 'mc', prompt: 'You see a "3" written inside one of the dots on a chord diagram. What does it tell you?',
          prompt_es: 'Ves un "3" escrito dentro de uno de los puntos de un diagrama de acorde. ¿Qué te indica?',
          choices: ['Play it on the 3rd fret', 'Use your 3rd finger (ring)', 'Hold the chord for 3 beats', 'It\'s a 3-finger chord'],
          choices_es: ['Tócalo en el traste 3', 'Usa tu dedo 3 (anular)', 'Sostén el acorde por 3 tiempos', 'Es un acorde de 3 dedos'], answer: 1,
          explain: 'Numbers inside the dots name the finger: 1 = index, 2 = middle, 3 = ring, 4 = pinky. The fret comes from which row the dot sits in, not from the number.',
          explain_es: 'Los números dentro de los puntos indican el dedo: 1 = índice, 2 = medio, 3 = anular, 4 = meñique. El traste lo indica la fila donde está el punto, no el número.' } }
    ]
  },

  {
    id: 'm4w2',
    songThread: [{ name: '"Let It Be"', journey: 'tabs/let-it-be.html', layer: 4, note: 'the real chords — C, G, Am, F' }, { name: '"All Along the Watchtower"', journey: 'tabs/all-along-the-watchtower.html', layer: 4, note: 'the full song with open chords' }],
    label: 'Set 2',
    locked: false,
    module: 'Open Chords',
    moduleNum: 4,
    unit: 'Module 4 · Open Chords',
    unit_es: 'Módulo 4 · Acordes al aire',
    title: 'Set 2',
    /* This set is long (20 visible steps), so it RENDERS as two parts —
       display only, exactly like the B/C merge. `partOne` names the first
       part; the second opens at the section carrying `partBreak` below.
       No id, section or step moves, so every stored key is unchanged. */
    partOne: { title: 'Part 1 — C, F and G: your first chord loop',
               title_es: 'Parte 1 — C, F y G: tu primera vuelta de acordes' },
    subtitle: 'Chord Group 1: C, F, Am, G · Down-up strumming · Smooth transitions',
    subtitle_es: 'Grupo de acordes 1: C, F, Am, G · Rasgueo abajo-arriba · Transiciones suaves',
    skillFocus: 'Fretting the C, F, and G chords · Switching chords smoothly · Playing down-up strum patterns',
    skillFocus_es: 'Trastear los acordes C, F y G · Cambiar de acorde suavemente · Tocar patrones de rasgueo abajo-arriba',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        title_es: 'Estación de computadora — Mira · Escucha · Practica',
        sections: [
          {
            title: 'Watch the lesson videos',
            title_es: 'Mira los videos de la lección',
            steps: [
          {
            label: 'Watch: the C chord', label_es: 'Mira: el acorde de C',
            text: 'Watch: <a href="https://youtu.be/RBYqdBqogo4?t=58" target="_blank">The C Chord (BC-132) – JustinGuitar</a> (0:58–1:49, the end of the video).<ol><li>Listen for the habit he calls the secret to a clean chord change.</li><li>Watch his fretting hand again. Find the moment he uses that habit.</li></ol>You\'ve got it when: you name the habit and point to the moment he uses it.',
            text_es: 'Mira: <a href="https://youtu.be/RBYqdBqogo4?t=58" target="_blank">The C Chord (BC-132) – JustinGuitar</a> (0:58–1:49, el final del video).<ol><li>Escucha el hábito que él llama el secreto para un cambio de acorde limpio.</li><li>Vuelve a mirar su mano de trastear. Encuentra el momento en que usa ese hábito.</li></ol>Lo tienes cuando: nombras el hábito y señalas el momento en que lo usa.',
            hint: 'Watch when his fingers move compared with his strum.',
            hint_es: 'Fíjate en cuándo se mueven sus dedos comparado con su rasgueo.',
            skills: [1, 2, 3, 4],
            response: { type: 'mc', prompt: 'What is the "secret" to clean chord changes, according to the video?',
              prompt_es: 'Según el video, ¿cuál es el "secreto" para cambios de acorde limpios?',
              answer: 0,
              explain: 'Get the next shape ready early: start moving your fingers toward it before you finish strumming the chord you are on.',
              explain_es: 'Prepara la siguiente forma antes de tiempo: empieza a mover tus dedos hacia ella antes de terminar de rasguear el acorde que estás tocando.',
              choices: [
              'Prepare the next chord shape before you strum it',
              'Strum harder so any missed notes are hidden',
              'Use only your index finger',
              'Memorize each chord with your eyes closed'
            ],
              choices_es: [
              'Prepara la siguiente forma de acorde antes de rasguearla',
              'Rasguea más fuerte para que se escondan las notas falladas',
              'Usa solo tu dedo índice',
              'Memoriza cada acorde con los ojos cerrados'
            ] }
          },
          {
            label: 'Watch: a pain-free F chord', label_es: 'Mira: el acorde F sin dolor',
            text: 'Watch: <a href="https://www.youtube.com/watch?v=vUNxt5EvXv8" target="_blank">Pain Free F Chord for Beginners – Lauren Bateman (0:00–4:00)</a>. Find the one flat finger in her small F shape and the two strings it presses. You\'ve got it when: you hold the small F shape and pick those two strings four times in a row, both ringing.',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=vUNxt5EvXv8" target="_blank">Pain Free F Chord for Beginners – Lauren Bateman (0:00–4:00)</a>. Encuentra el único dedo plano en su forma pequeña de F y las dos cuerdas que presiona. Lo tienes cuando: sostienes la forma pequeña de F y tocas esas dos cuerdas cuatro veces seguidas, las dos sonando.',
            hint: 'A barre is one finger pressed flat across several strings. This small F (xx3211) has a barre on only two strings: the high e and B. You use this F for the rest of Module 4 and in Module 6. The full barre comes in Module 7.',
            hint_es: 'Una cejilla es un dedo presionado plano sobre varias cuerdas. Este F pequeño (xx3211) tiene cejilla en solo dos cuerdas: la mi aguda y la Si. Usas este F el resto del Módulo 4 y en el Módulo 6. La cejilla completa llega en el Módulo 7.',
            skills: [2],
          },
          {
            label: 'Watch: the G chord', label_es: 'Mira: el acorde de G',
            text: 'Watch: <a href="https://youtu.be/gEzwpqmt2gc?t=61" target="_blank">The G Chord (BC-131) – JustinGuitar</a> (1:01–4:00). He shows a 3-finger and a 4-finger version. Pick one. You\'ve got it when: you play your version four times with every string ringing.',
            text_es: 'Mira: <a href="https://youtu.be/gEzwpqmt2gc?t=61" target="_blank">The G Chord (BC-131) – JustinGuitar</a> (1:01–4:00). Él muestra una versión de 3 dedos y una de 4. Elige una. Lo tienes cuando: tocas tu versión cuatro veces con todas las cuerdas sonando.',
            hint: 'Start with the version you can play clean. Pluck each string one at a time to check it.',
            hint_es: 'Empieza con la versión que puedas tocar limpia. Pulsa cada cuerda una por una para revisarla.',
            skills: [3],
            response: { type: 'mc', prompt: 'In the 3-finger G chord, what are the B, G, and D strings doing?',
              prompt_es: 'En el acorde G de 3 dedos, ¿qué están haciendo las cuerdas Si, Sol y Re?',
              answer: 0,
              explain: 'G puts fingers on the low E, A and high e strings, so the D, G and B strings ring open. Those open strings make the chord sound big. They are also why your hand has to stretch wide at first.',
              explain_es: 'G pone dedos en las cuerdas Mi grave, La y mi aguda, así que las cuerdas Re, Sol y Si suenan al aire. Esas cuerdas al aire hacen que el acorde suene grande. También son la razón de que al principio tu mano tenga que abrirse mucho.',
              choices: [
              'Ringing open — no fingers on them',
              'Muted with the picking hand',
              'Held down by the index finger',
              'Skipped — you don\'t strum them'
            ],
              choices_es: [
              'Sonando al aire — sin dedos encima',
              'Silenciadas con la mano de pulsar',
              'Presionadas por el dedo índice',
              'Salteadas — no las rasgueas'
            ] }
          },
            ]
          },
          {
            title: 'Listen for the chord changes',
            title_es: 'Escucha los cambios de acorde',
            steps: [
          {
            label: 'Listen: "Let It Be"', label_es: 'Escucha: "Let It Be"',
            text: 'Listen to <a href="https://www.youtube.com/watch?v=CGj85pVzRJs" target="_blank">"Let It Be" by The Beatles</a>.<ol><li>Find the C–G–Am–F chord pattern at the start of the verse.</li><li>Count the beats each chord lasts.</li><li>Type your count below.</li></ol>',
            text_es: 'Escucha <a href="https://www.youtube.com/watch?v=CGj85pVzRJs" target="_blank">"Let It Be" de The Beatles</a>.<ol><li>Encuentra el patrón de acordes C–G–Am–F al principio de la estrofa.</li><li>Cuenta los tiempos que dura cada acorde.</li><li>Escribe tu cuenta abajo.</li></ol>',
            hint: 'You do not play yet. Tap each time the chord changes.',
            hint_es: 'Todavía no tocas. Da un golpecito cada vez que cambia el acorde.',
            skills: [5],
            response: { type: 'short', placeholder: 'About how many strums (or beats) does each chord get before it changes?',
              placeholder_es: '¿Aproximadamente cuántos rasgueos (o tiempos) dura cada acorde antes de cambiar?' }
          },
            ]
          },
          {
            kind: 'reflection',
            title: 'Checkpoint',
            title_es: 'Punto de control',
            steps: [
          {
            label: 'Wrap-up: your toughest chord', label_es: 'Cierre: tu acorde más difícil',
            text: 'Checkpoint — pause and think: which of these four chords (C, G, Am, F) gives you the most trouble right now, and is it the shape itself or getting to it in time?',
            text_es: 'Punto de control — pausa y piensa: ¿cuál de estos cuatro acordes (C, G, Am, F) te está costando más ahora mismo, y es la forma en sí o el llegar a ella a tiempo?',
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — chord transitions & strumming',
        title_es: 'Estación de práctica — transiciones de acorde y rasgueo',
        sections: [
          {
            kind: 'tuning-warmup',
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tuning check', label_es: 'Calentamiento: afinación',
                text: 'Start every practice session the same way:<ol><li>Tune all 6 strings to green (E A D G B e).</li><li>Play each string open.</li></ol>You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera:<ol><li>Afina las 6 cuerdas hasta que estén en verde (E A D G B e).</li><li>Toca cada cuerda al aire.</li></ol>Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                hint: 'Tuning (Module 1) is a skill you keep forever. Clean open strings are exactly what makes a chord ring.',
                hint_es: 'Afinar (Módulo 1) es una destreza que conservas para siempre. Las cuerdas al aire limpias son exactamente lo que hace que un acorde suene bien.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Name each chord\'s root before you strum',
            title_es: 'Nombra la raíz de cada acorde antes de rasguear',
            steps: [
          {
            label: 'Challenge 1 — Name the Root', label_es: 'Reto 1 — Nombra la raíz',
            text: 'The root is the note a chord is named after. Before you strum each chord, pluck its root alone and say its name.<ol><li>C: root C, A string, fret 3.</li><li>G: root G, low E string, fret 3.</li><li>Am: root A, A string, open.</li><li>F: root F, D string, fret 3.</li></ol>You\'ve got it when: you play all four chords twice through, root first, without looking at the list.',
            text_es: 'La raíz es la nota que le da nombre al acorde. Antes de rasguear cada acorde, pulsa su raíz sola y di su nombre.<ol><li>C: raíz C, cuerda La, traste 3.</li><li>G: raíz G, cuerda Mi grave, traste 3.</li><li>Am: raíz A, cuerda La, al aire.</li><li>F: raíz F, cuerda Re, traste 3.</li></ol>Lo tienes cuando: tocas los cuatro acordes dos veces, primero la raíz, sin mirar la lista.',
            hint: 'In each of these chords, the root is on the lowest string you strum.',
            hint_es: 'En cada uno de estos acordes, la raíz está en la cuerda más grave que rasgueas.',
            stuck: 'Use your Module 2 note names. Find the root first. Then build the chord shape around it.',
            stuck_es: 'Usa los nombres de nota del Módulo 2. Encuentra primero la raíz. Luego arma la forma del acorde alrededor de ella.',
            levelUp: 'Name the root of Em from Set 1. Then name the roots of D and A, the chords in Set 3.',
            levelUp_es: 'Nombra la raíz de Em de la Unidad 1. Luego nombra las raíces de D y A, los acordes de la Unidad 3.',
            skills: [1],
            chords: [
              { name: 'C',  chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
              { name: 'G',  chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
              { name: 'F',  chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Fret C cleanly',
            title_es: 'Trastea C limpio',
            steps: [
          {
            label: 'Challenge 2 — Clean C', label_es: 'Reto 2 — C limpio',
            text: '<ol><li>Put your index finger on the B string, fret 1.</li><li>Put your middle finger on the D string, fret 2.</li><li>Put your ring finger on the A string, fret 3.</li><li>Strum five strings, from the A string to the high e. Do not play the low E.</li></ol>You\'ve got it when: you pluck each of the five strings and all five ring.',
            text_es: '<ol><li>Pon tu dedo índice en la cuerda Si, traste 1.</li><li>Pon tu dedo medio en la cuerda Re, traste 2.</li><li>Pon tu dedo anular en la cuerda La, traste 3.</li><li>Rasguea cinco cuerdas, desde la cuerda La hasta la mi aguda. No toques la Mi grave.</li></ol>Lo tienes cuando: pulsas cada una de las cinco cuerdas y las cinco suenan.',
            hint: 'The open G and the high e go quiet most often. Arch your index finger off the high e. Keep your middle finger off the G string.',
            hint_es: 'La Sol al aire y la mi aguda son las que más se apagan. Arquea tu dedo índice para no tocar la mi aguda. Mantén tu dedo medio lejos de la cuerda Sol.',
            stuck: 'Make the B string ring with your index finger. Add your middle finger, then your ring finger. Check the sound after each one.',
            stuck_es: 'Haz sonar la cuerda Si con tu dedo índice. Agrega tu dedo medio, y luego tu dedo anular. Revisa el sonido después de cada uno.',
            levelUp: 'Lift all three fingers. Put the whole shape down at once and strum. Get every string clean on the first try.',
            levelUp_es: 'Levanta los tres dedos. Pon toda la forma de una vez y rasguea. Logra que cada cuerda suene limpia en el primer intento.',
            skills: [1],
            chords: [
              { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Fret F cleanly (simplified)',
            title_es: 'Trastea F limpio (simplificado)',
            steps: [
          {
            label: 'Challenge 3 — Clean F (simplified)', label_es: 'Reto 3 — F limpio (simplificado)',
            text: '<ol><li>Lay your index finger flat across the high e and B strings, fret 1.</li><li>Put your middle finger on the G string, fret 2.</li><li>Put your ring finger on the D string, fret 3.</li><li>Strum four strings, from the D string to the high e. Do not play the low E or A strings.</li></ol>You\'ve got it when: all four strings ring with no buzz.',
            text_es: '<ol><li>Coloca tu dedo índice plano sobre las cuerdas mi aguda y Si, traste 1.</li><li>Pon tu dedo medio en la cuerda Sol, traste 2.</li><li>Pon tu dedo anular en la cuerda Re, traste 3.</li><li>Rasguea cuatro cuerdas, desde la cuerda Re hasta la mi aguda. No toques las cuerdas Mi grave y La.</li></ol>Lo tienes cuando: las cuatro cuerdas suenan sin zumbido.',
            hint: 'Keep your index finger flat and straight across both strings. If it bends, one of the two strings goes quiet.',
            hint_es: 'Mantén tu dedo índice plano y recto sobre las dos cuerdas. Si se dobla, una de las dos cuerdas se apaga.',
            stuck: 'Make the high e and B ring under your index finger first. Add your middle finger, then your ring finger. Still buzzing? Play <strong>Fmaj7</strong> for now: <code>xx3210</code>. Lift your index finger off the high e and let it ring open.',
            stuck_es: 'Haz sonar primero la mi aguda y la Si bajo tu dedo índice. Agrega tu dedo medio, y luego tu dedo anular. ¿Sigue zumbando? Toca <strong>Fmaj7</strong> por ahora: <code>xx3210</code>. Quita tu dedo índice de la mi aguda y déjala sonar al aire.',
            levelUp: 'Switch Am, F, Am without looking. Your index finger barely moves. Then lay your index flat across the high e, B and G strings at fret 1. Pick each one. Make all three ring.',
            levelUp_es: 'Cambia Am, F, Am sin mirar. Tu dedo índice casi no se mueve. Luego coloca tu índice plano sobre las cuerdas mi aguda, Si y Sol en el traste 1. Pulsa cada una. Haz que las tres suenen.',
            skills: [2],
            chords: [
              { name: 'F', chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Fret G cleanly',
            title_es: 'Trastea G limpio',
            steps: [
          {
            label: 'Challenge 4 — Clean G', label_es: 'Reto 4 — G limpio',
            text: '<ol><li>Put your index finger on the A string, fret 2.</li><li>Put your middle finger on the low E string, fret 3.</li><li>Put your ring finger on the high e string, fret 3.</li><li>Strum all six strings.</li></ol>You\'ve got it when: every string rings, including the open D, G and B strings in the middle.',
            text_es: '<ol><li>Pon tu dedo índice en la cuerda La, traste 2.</li><li>Pon tu dedo medio en la cuerda Mi grave, traste 3.</li><li>Pon tu dedo anular en la cuerda mi aguda, traste 3.</li><li>Rasguea las seis cuerdas.</li></ol>Lo tienes cuando: cada cuerda suena, incluso las cuerdas Re, Sol y Si al aire del medio.',
            hint: 'Arch your fingers so they do not touch the open strings in the middle.',
            hint_es: 'Arquea tus dedos para que no toquen las cuerdas al aire del medio.',
            stuck: 'Put down your middle and ring fingers first. Make the low E and high e ring. Then add your index finger on the A string.',
            stuck_es: 'Pon primero tus dedos medio y anular. Haz sonar la Mi grave y la mi aguda. Luego agrega tu dedo índice en la cuerda La.',
            levelUp: 'Switch G, C, G without looking. Or try the 4-finger G: ring finger on the B string, fret 3, and pinky on the high e, fret 3.',
            levelUp_es: 'Cambia G, C, G sin mirar. O prueba el G de 4 dedos: anular en la cuerda Si, traste 3, y meñique en la mi aguda, traste 3.',
            skills: [3],
            chords: [
              { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Keep two fingers down: Am ↔ C',
            title_es: 'Deja dos dedos puestos: Am ↔ C',
            steps: [
          {
            label: 'Challenge 5 — Pivot Finger (Am ↔ C)', label_es: 'Reto 5 — Dedo pivote (Am ↔ C)',
            text: 'Am and C share two fingers.<ol><li>Play Am.</li><li>Keep your index finger on the B string, fret 1, and your middle finger on the D string, fret 2.</li><li>Move only your ring finger: to the A string, fret 3, for C. Back to the G string, fret 2, for Am.</li></ol>You\'ve got it when: you make 10 clean changes in a row and your index and middle fingers never lift.',
            text_es: 'Am y C comparten dos dedos.<ol><li>Toca Am.</li><li>Mantén tu dedo índice en la cuerda Si, traste 1, y tu dedo medio en la cuerda Re, traste 2.</li><li>Mueve solo tu dedo anular: a la cuerda La, traste 3, para C. De vuelta a la cuerda Sol, traste 2, para Am.</li></ol>Lo tienes cuando: haces 10 cambios limpios seguidos y tus dedos índice y medio nunca se levantan.',
            hint: 'Press lightly with the two fingers that stay. Do not lift them.',
            hint_es: 'Presiona suave con los dos dedos que se quedan. No los levantes.',
            stuck: 'Play the switch with no strum first. Watch only your ring finger.',
            stuck_es: 'Haz el cambio primero sin rasguear. Mira solo tu dedo anular.',
            levelUp: 'Am and F share the index finger on the B string, fret 1. Try Am, F, Am the same way.',
            levelUp_es: 'Am y F comparten el dedo índice en la cuerda Si, traste 1. Prueba Am, F, Am de la misma manera.',
            skills: [4, 6]
          }
            ]
          },
          {
            title: 'Play the C–G–Am–F loop in time',
            title_es: 'Toca la vuelta C–G–Am–F a tiempo',
            steps: [
          {
            label: 'Challenge 6 — C–G–Am–F Loop', label_es: 'Reto 6 — Vuelta C–G–Am–F',
            text: '<ol><li>Set the metronome to 60 BPM.</li><li>Play 2 bars each of C, G, Am and F. Repeat.</li><li>Speed up: 65 BPM, then 70.</li></ol>You\'ve got it when: you play two loops at 60 and two loops at 70, with every change on beat 1.',
            text_es: '<ol><li>Pon el metrónomo a 60 BPM.</li><li>Toca 2 compases de cada uno: C, G, Am y F. Repite.</li><li>Acelera: 65 BPM, y luego 70.</li></ol>Lo tienes cuando: tocas dos vueltas a 60 y dos vueltas a 70, con cada cambio en el tiempo 1.',
            hint: 'If you miss a change, keep playing. Set the ⏱ Timer for 3 minutes and loop until it beeps.',
            hint_es: 'Si fallas un cambio, sigue tocando. Pon el ⏱ Temporizador en 3 minutos y repite hasta que suene.',
            stuck: 'Play only the two chords that give you trouble, often G to Am or Am to F. Then play the whole loop.',
            stuck_es: 'Toca solo los dos acordes que te cuestan, a menudo G a Am o Am a F. Luego toca la vuelta completa.',
            levelUp: 'Play it at 75 BPM, or strum down-up instead of down only.',
            levelUp_es: 'Tócalo a 75 BPM, o rasguea abajo-arriba en vez de solo hacia abajo.',
            skills: [1, 2, 3, 6]
          }
            ]
          },
          {
            title: 'Play a down-up strum pattern',
            title_es: 'Toca un patrón de rasgueo abajo-arriba',
            steps: [
          {
            label: 'Challenge 7 — Down-Up Strum', label_es: 'Reto 7 — Rasgueo abajo-arriba',
            text: '<ol><li>Rest your fretting hand on the strings so they only make a dull thud.</li><li>Strum down-up for four bars at 60 BPM. Keep your hand moving the whole time.</li><li>Play the C–G–Am–F loop. Strum down on 1 2 3 4 and up on each +.</li><li>Count "1 + 2 + 3 + 4 +" out loud.</li><li>Speed up to 70 BPM.</li></ol>You\'ve got it when: you play 8 bars in a row at 70 BPM, down on every number and up on every +, with no missed strum.<span class="step-figure"><img src="img/m6-strum-pendulum.jpg" alt="Photo of a strumming hand holding a pick over the soundhole of an acoustic guitar, with a curved double-headed arrow tracing the down-up arc of the wrist\'s pendulum swing." width="1200" height="654"></span>',
            text_es: '<ol><li>Apoya tu mano de trastear sobre las cuerdas para que solo suenen apagadas.</li><li>Rasguea abajo-arriba durante cuatro compases a 60 BPM. Mantén la mano en movimiento todo el tiempo.</li><li>Toca la vuelta C–G–Am–F. Rasguea hacia abajo en 1 2 3 4 y hacia arriba en cada +.</li><li>Cuenta "1 + 2 + 3 + 4 +" en voz alta.</li><li>Acelera a 70 BPM.</li></ol>Lo tienes cuando: tocas 8 compases seguidos a 70 BPM, hacia abajo en cada número y hacia arriba en cada +, sin fallar ningún rasgueo.<span class="step-figure"><img src="img/m6-strum-pendulum.jpg" alt="Foto de una mano de rasgueo sosteniendo una púa sobre la boca de una guitarra acústica, con una flecha curva de dos puntas que marca el arco abajo-arriba del balanceo de péndulo de la muñeca." width="1200" height="654"></span>',
            hint: 'Play the upstroke lighter than the downstroke. Swing from your wrist.',
            hint_es: 'Toca el rasgueo hacia arriba más suave que el de abajo. Mueve la muñeca.',
            stuck: 'Keep your hand moving down-up the whole time. To leave out a strum, move your hand past the strings without touching them.',
            stuck_es: 'Mantén tu mano moviéndose abajo-arriba todo el tiempo. Para no tocar un rasgueo, pasa la mano sin tocar las cuerdas.',
            levelUp: 'Leave out two of the eight strums: the up after beat 1 and the down on beat 3. You get D &middot; D U &middot; U D U. Keep your hand moving through both gaps.',
            levelUp_es: 'Deja fuera dos de los ocho rasgueos: el de arriba después del tiempo 1 y el de abajo en el tiempo 3. Te queda D &middot; D U &middot; U D U. Mantén la mano en movimiento en los dos huecos.',
            skills: [5, 6]
          }
            ]
          },
          {
            title: 'One-Minute Changes — try for a higher number',
            title_es: 'Cambios de un minuto — intenta superar tu número',
            steps: [
              {
                label: 'Challenge 8 — One-Minute Changes (C ↔ G)', label_es: 'Reto 8 — Cambios de un minuto (C ↔ G)',
                text: '<ol><li>Set the ⏱ Timer for 60 seconds.</li><li>Switch C, G, C, G as many times as you can.</li><li>Count only clean changes.</li></ol>You\'ve got it when: you make 20 clean C&rarr;G changes in one minute. Next goal: 30.',
                text_es: '<ol><li>Pon el ⏱ Temporizador en 60 segundos.</li><li>Cambia C, G, C, G tantas veces como puedas.</li><li>Cuenta solo los cambios limpios.</li></ol>Lo tienes cuando: haces 20 cambios limpios de C&rarr;G en un minuto. Siguiente meta: 30.',
                hint: 'C and G share no finger. Make the next shape in the air, then put it down.',
                hint_es: 'C y G no comparten ningún dedo. Forma la siguiente figura en el aire, y luego ponla.',
                stuck: 'Hold G. Practice only the move into C and back. Speed up when the move is clean.',
                stuck_es: 'Sostén G. Practica solo el movimiento a C y de vuelta. Acelera cuando el movimiento salga limpio.',
                levelUp: 'Do the same with Am and F.',
                levelUp_es: 'Haz lo mismo con Am y F.',
                skills: [3, 6],
              }
            ]
          },
          {
            title: 'Random chord draw — Group 1',
            title_es: 'Sorteo de acordes al azar — Grupo 1',
            steps: [
              {
                label: 'Challenge 9 — Random Chord Draw', label_es: 'Reto 9 — Sorteo de acordes',
                text: '<ol><li>Run the Group 1 chord deck below.</li><li>Play each chord it deals you clean before you go to the next card.</li></ol>You\'ve got it when: you run the whole deck with no pause on any chord.',
                text_es: '<ol><li>Corre la baraja de acordes del Grupo 1 de abajo.</li><li>Toca limpio cada acorde que te reparta antes de pasar a la siguiente carta.</li></ol>Lo tienes cuando: corres toda la baraja sin pausa en ningún acorde.',
                drill: { type: 'deck', deck: 'chords-group1', skill: 'm4w2-s6' },
                hint: 'The deck deals chords in random order.',
                hint_es: 'La baraja reparte los acordes en orden al azar.',
                levelUp: 'Time yourself through the deck. Or run it at 70 BPM and change on beat 1.',
                levelUp_es: 'Cronométrate con la baraja. O córrela a 70 BPM y cambia en el tiempo 1.',
                skills: [6]
              }
            ]
          },
          {
            title: 'Fret Dm cleanly',
            title_es: 'Trastea Dm limpio',
            // Part 2 opens here (display only — see `partOne` on the set).
            partBreak: { title: 'Part 2 — Dm, G/B and faster changes',
                         title_es: 'Parte 2 — Dm, G/B y cambios más rápidos' },
            steps: [
          {
            label: 'Challenge 1 — Clean Dm', label_es: 'Reto 1 — Dm limpio',
            text: '<ol><li>Put your index finger on the high e string, fret 1.</li><li>Put your middle finger on the G string, fret 2.</li><li>Put your ring finger on the B string, fret 3.</li><li>Strum four strings, from the D string to the high e. The D string rings open.</li></ol>You\'ve got it when: all four strings ring clean.',
            text_es: '<ol><li>Pon tu dedo índice en la cuerda mi aguda, traste 1.</li><li>Pon tu dedo medio en la cuerda Sol, traste 2.</li><li>Pon tu dedo anular en la cuerda Si, traste 3.</li><li>Rasguea cuatro cuerdas, desde la cuerda Re hasta la mi aguda. La cuerda Re suena al aire.</li></ol>Lo tienes cuando: las cuatro cuerdas suenan limpias.',
            hint: 'Dm is a small triangle on the three thinnest strings. Keep your fingers arched so the high e rings.',
            hint_es: 'Dm es un triángulo pequeño en las tres cuerdas más delgadas. Mantén tus dedos arqueados para que suene la mi aguda.',
            stuck: 'Put down your index and ring fingers first. Make the high e and B ring. Then add your middle finger on the G string. Press with the tip of each finger.',
            stuck_es: 'Pon primero tus dedos índice y anular. Haz sonar la mi aguda y la Si. Luego agrega tu dedo medio en la cuerda Sol. Presiona con la punta de cada dedo.',
            levelUp: 'Switch Am, Dm, Am without looking. Then try Dm7: lift your ring finger and lay your index flat across the B and high e strings at fret 1.',
            levelUp_es: 'Cambia Am, Dm, Am sin mirar. Luego prueba Dm7: levanta tu dedo anular y coloca tu índice plano sobre las cuerdas Si y mi aguda en el traste 1.',
            skills: [7],
            chords: [
              { name: 'Dm', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'2'],[2,3,'3'],[1,1,'1']], position: 0 },
              { name: 'Dm7', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Play G/B — G with B in the bass',
            title_es: 'Toca G/B — G con B en el bajo',
            steps: [
          {
            label: 'Challenge 2 — G/B (G with B in the Bass)', label_es: 'Reto 2 — G/B (G con B en el bajo)',
            text: 'G/B means a G chord with B as the lowest note (the bass).<ol><li>Play your G shape. Keep all three fingers down.</li><li>Strum five strings, from the A string to the high e. Do not play the low E.</li></ol>The B on the A string, fret 2, is now the lowest note. You\'ve got it when: the chord rings clean and the lowest note you hear is B.',
            text_es: 'G/B significa un acorde de G con B como la nota más grave (el bajo).<ol><li>Toca tu forma de G. Mantén los tres dedos puestos.</li><li>Rasguea cinco cuerdas, desde la cuerda La hasta la mi aguda. No toques la Mi grave.</li></ol>La B de la cuerda La, traste 2, es ahora la nota más grave. Lo tienes cuando: el acorde suena limpio y la nota más grave que oyes es B.',
            hint: 'Your middle finger stays on the low E, but you do not strum that string. That is why the chart marks the low E with an X.',
            hint_es: 'Tu dedo medio se queda en la Mi grave, pero no rasgueas esa cuerda. Por eso el diagrama marca la Mi grave con una X.',
            stuck: 'If the low E rings, start your strum on the A string. Or rest the side of your strumming hand on the low E.',
            stuck_es: 'Si suena la Mi grave, empieza tu rasgueo en la cuerda La. O apoya el borde de tu mano de rasgueo sobre la Mi grave.',
            levelUp: 'Play the "the cure" chorus, Dm · F · C · G, with G/B in place of G.',
            levelUp_es: 'Toca el coro de "the cure", Dm · F · C · G, con G/B en lugar de G.',
            skills: [8],
            chords: [
              { name: 'G/B', chord: [[6,'x'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 }
            ]
          }
            ]
          },
          {
            kind: 'take-to-song',
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Let It Be", verse (assessment rehearsal)', label_es: 'Reto — "Let It Be", estrofa (ensayo de evaluación)',
                text: '<ol><li>Play C · G · Am · F with a down-strum, four beats per chord, building from 60 to 70 BPM.</li><li>Record a run and check it against the chart.</li></ol>You\'ve got it when: one full loop at 70 BPM, every change landing on beat 1. <a href="tabs/let-it-be.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 4 of 5 — Open Chords</a>.',
                text_es: '<ol><li>Toca C · G · Am · F con un rasgueo hacia abajo, cuatro tiempos por acorde, subiendo de 60 a 70 BPM.</li><li>Graba una toma y compárala con el diagrama.</li></ol>Lo tienes cuando: una vuelta completa a 70 BPM, cada cambio cayendo en el tiempo 1. <a href="tabs/let-it-be.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 4 de 5 — Acordes al aire</a>.',
                hint: 'A full bar per chord — patient and unhurried, twice as long as your Module 2 bass roots, which moved every two beats. This C–G–Am–F progression opens one of the three songs you can choose from to play from memory for the module assessment. The record actually moves at your Module 2 pace — two beats per chord — and the Half-Bar Changes ladder later in this set gets you there. Look ahead — start forming the next chord on beat 4 of the current one. Keep your fingers arched and your thumb behind the neck so every string rings. The strum keeps moving even while fingers travel.',
                hint_es: 'Un compás completo por acorde — paciente y sin apuro, el doble de duración que tus raíces de bajo del Módulo 2, que se movían cada dos tiempos. Esta progresión C–G–Am–F abre una de las tres canciones entre las que puedes elegir para tocar de memoria en la evaluación del módulo. La grabación en realidad se mueve al ritmo de tu Módulo 2 — dos tiempos por acorde — y la escalera de Cambios de Medio Compás más adelante en esta unidad te lleva ahí. Mira hacia adelante — empieza a formar el siguiente acorde en el tiempo 4 del actual. Mantén tus dedos arqueados y tu pulgar detrás del mástil para que cada cuerda suene. El rasgueo sigue moviéndose aunque los dedos viajen.',
                stuck: 'Isolate the roughest pair (probably C → F) and loop just those two, four beats each.',
                stuck_es: 'Aísla el par más difícil (probablemente C → F) y repite solo esos dos, cuatro tiempos cada uno.',
                levelUp: 'Add the chorus turnaround (a short chord move that leads back to the start) — Am · G · F · C — or drop to two beats per chord at the same 60 BPM — the record\'s real changes at practice speed (the record itself runs a bit faster, about 71 BPM).',
                levelUp_es: 'Agrega el giro del coro (un movimiento corto de acordes que regresa al inicio) — Am · G · F · C — o baja a dos tiempos por acorde al mismo 60 BPM — los cambios reales de la grabación a velocidad de práctica (la grabación va un poco más rápido, a unos 71 BPM).',
                skills: [3, 6],
                chords: [
                  { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'F', chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
                ],
              },
              {
                label: 'Challenge — "Watchtower", open-chord version', label_es: 'Reto — "Watchtower", versión con acordes al aire',
                text: '<ul><li>Play the same loop you\'ve played as bass notes and power chords, now as full open chords — Am · G · F · G — at 60 BPM: count 1 + 2 (rest) + 4 in each bar: Am on 1, +, 2, then G on the "+" after 3 and on 4; then F on 1, +, 2, and G the same way.</li></ul>You\'ve got it when: four loops, and you can hear that it\'s the SAME song you played in Modules 2 and 3. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 4 of 5</a>.',
                text_es: '<ul><li>Toca la misma vuelta que ya tocaste como notas de bajo y como acordes de potencia, ahora como acordes al aire completos — Am · G · F · G — a 60 BPM: cuenta 1 + 2 (silencio) + 4 en cada compás: Am en 1, +, 2, luego G en el "+" después del 3 y en el 4; luego F en 1, +, 2, y G igual.</li></ul>Lo tienes cuando: cuatro vueltas, y puedes escuchar que es la MISMA canción que tocaste en los Módulos 2 y 3. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 4 de 5</a>.',
                hint: 'This is the third time this song has met you — bass line, power chords, now open chords. Notice the roots are identical every time.',
                hint_es: 'Esta es la tercera vez que esta canción se cruza contigo — línea de bajo, acordes de potencia, ahora acordes al aire. Nota que las raíces son idénticas cada vez.',
                stuck: 'Strum only the first strum of each chord and use the gaps to travel to the next shape.',
                stuck_es: 'Rasguea solo el primer rasgueo de cada acorde y usa los huecos para viajar a la siguiente forma.',
                levelUp: 'Alternate: one loop open chords, one loop power chords, without stopping.',
                levelUp_es: 'Alterna: una vuelta con acordes al aire, una vuelta con acordes de potencia, sin detenerte.',
                skills: [3, 6],
                chords: [
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
                  { name: 'F', chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
                ],
              },
              {
                label: 'Challenge — "the cure" play-along', label_es: 'Reto — "the cure" tocando junto',
                text: '<ol><li>Loop Olivia\'s chords with a down-strum, one full bar (four beats) each — the verse is Am · C, then F · C; the chorus is Dm · F · C · G, twice.</li><li>Speed up in steps: 60 → 65 → 70 BPM.</li></ol>Open chords, no capo. Shapes are pre-loaded below. You\'ve got it when: two clean loops of each — verse and chorus — at 70 BPM, one full bar per chord, every change on beat 1, every string ringing clear. <a href="tabs/the-cure.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 4 of 5 — Open Chords</a>.',
                text_es: '<ol><li>Repite los acordes de Olivia con un rasgueo hacia abajo, un compás completo (cuatro tiempos) cada uno — la estrofa es Am · C, y luego F · C; el coro es Dm · F · C · G, dos veces.</li><li>Acelera en pasos: 60 → 65 → 70 BPM.</li></ol>Acordes al aire, sin capo. Las formas están precargadas abajo. Lo tienes cuando: dos vueltas limpias y seguidas de cada una — estrofa y coro — a 70 BPM, un compás completo por acorde, cada cambio en el tiempo 1, cada cuerda sonando clara. <a href="tabs/the-cure.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 4 de 5 — Acordes al aire</a>.',
                hint: 'The backing track\'s metronome reads 144, but it feels half that fast — so 70 BPM here already puts you close to the record\'s real pace. You just learned Dm above — Am, C, F and G are Group 1 chords you already know.',
                hint_es: 'El metrónomo de la pista base marca 144, pero se siente a la mitad de esa velocidad — así que 70 BPM aquí ya te acerca bastante al ritmo real de la grabación. Acabas de aprender Dm arriba — Am, C, F y G son acordes del Grupo 1 que ya conoces.',
                stuck: 'Get the verse — Am · C · Am · C, then F · C · F · C — clean in open position first, then add the chorus — Dm · F · C · G, twice through.',
                stuck_es: 'Deja la estrofa — Am · C · Am · C, y luego F · C · F · C — limpia en posición abierta primero, y luego agrega el coro — Dm · F · C · G, dos veces seguidas.',
                levelUp: 'Second time through the chorus, play Dm7 instead of Dm — lift your ring finger and lay your index finger across B and high e at fret 1. On the verse, swap C for Cmaj7 (lift your index finger off the B string) and F for Fmaj7 (let the high e ring). That\'s the record.',
                levelUp_es: 'La segunda vez que llegues al coro, toca Dm7 en lugar de Dm — levanta tu dedo anular y acuesta tu dedo índice sobre Si y mi aguda en el traste 1. En la estrofa, cambia C por Cmaj7 (levanta el dedo índice de la cuerda Si) y F por Fmaj7 (deja sonar la mi aguda al aire). Así lo toca el disco.',
                skills: [6, 7, 8],
                chords: [
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'C',  chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'Dm', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'2'],[2,3,'3'],[1,1,'1']], position: 0 },
                  { name: 'F',  chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
                  { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
                  { name: 'Cmaj7', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,0],[1,0]], position: 0 },
                  { name: 'Fmaj7', chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'Dm7', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
                ],
                playSeq: { label: 'Hear it — verse: Am · C · Am · C, then F · C · F · C; chorus: Dm · F · C · G, twice — one full bar (four beats) each, eight bars a section', label_es: 'Escúchalo — estrofa: Am · C · Am · C, y luego F · C · F · C; coro: Dm · F · C · G, dos veces — un compás completo (cuatro tiempos) cada uno, ocho compases por sección', bpm: 60, notes: [
                  { midi: [45,52,57,60,64], beats: 4 },
                  { midi: [48,52,55,60,64], beats: 4 },
                  { midi: [45,52,57,60,64], beats: 4 },
                  { midi: [48,52,55,60,64], beats: 4 },
                  { midi: [53,57,60,65], beats: 4 },
                  { midi: [48,52,55,60,64], beats: 4 },
                  { midi: [53,57,60,65], beats: 4 },
                  { midi: [48,52,55,60,64], beats: 4 },
                  { midi: [50,57,62,65], beats: 4 },
                  { midi: [53,57,60,65], beats: 4 },
                  { midi: [48,52,55,60,64], beats: 4 },
                  { midi: [43,47,50,55,59,67], beats: 4 },
                  { midi: [50,57,62,65], beats: 4 },
                  { midi: [53,57,60,65], beats: 4 },
                  { midi: [48,52,55,60,64], beats: 4 },
                  { midi: [43,47,50,55,59,67], beats: 4 }
                ] },
              }
            ]
          },
          {
            title: 'Change chords every two beats, then every beat',
            title_es: 'Cambia de acorde cada dos tiempos, y luego cada tiempo',
            steps: [
          {
            label: 'Challenge 3 — Half-Bar Changes (2 chords)', label_es: 'Reto 3 — Cambios de medio compás (2 acordes)',
            text: 'Change chords every two beats.<ol><li>Strum Am on beats 1 and 2.</li><li>Strum C on beats 3 and 4.</li><li>Repeat at 60 BPM.</li></ol>Press &#x25B6; to hear it. You\'ve got it when: you play four bars with every change on the beat and no stops.',
            text_es: 'Cambia de acorde cada dos tiempos.<ol><li>Rasguea Am en los tiempos 1 y 2.</li><li>Rasguea C en los tiempos 3 y 4.</li><li>Repite a 60 BPM.</li></ol>Presiona &#x25B6; para escucharlo. Lo tienes cuando: tocas cuatro compases con cada cambio a tiempo y sin detenerte.',
            hint: 'Keep your index and middle fingers down. Move only your ring finger.',
            hint_es: 'Mantén tus dedos índice y medio puestos. Mueve solo tu dedo anular.',
            stuck: 'Set the metronome to 50 BPM. Start moving your ring finger on the + before the change.',
            stuck_es: 'Pon el metrónomo a 50 BPM. Empieza a mover tu dedo anular en el + antes del cambio.',
            levelUp: 'Play it at 70 BPM, or do the same with Am and F.',
            levelUp_es: 'Tócalo a 70 BPM, o haz lo mismo con Am y F.',
            skills: [4, 6],
            chords: [
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
              { name: 'C',  chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 }
            ],
            playSeq: { label: 'Hear it — Am·Am · C·C (change every 2 beats)', label_es: 'Escúchalo — Am·Am · C·C (cambio cada 2 tiempos)', bpm: 60, notes: [[45,52,57,60,64],[45,52,57,60,64],[48,52,55,60,64],[48,52,55,60,64],[45,52,57,60,64],[45,52,57,60,64],[48,52,55,60,64],[48,52,55,60,64]] }
          },
          {
            label: 'Challenge 4 — Three-Chord Half-Bar (3 chords)', label_es: 'Reto 4 — Medio compás con tres acordes (3 acordes)',
            text: 'Change chords every two beats with three chords.<ol><li>Strum G twice.</li><li>Strum C twice.</li><li>Strum Am twice.</li><li>Repeat at 60 BPM.</li></ol>You\'ve got it when: you play the loop twice with every change on the beat.',
            text_es: 'Cambia de acorde cada dos tiempos con tres acordes.<ol><li>Rasguea G dos veces.</li><li>Rasguea C dos veces.</li><li>Rasguea Am dos veces.</li><li>Repite a 60 BPM.</li></ol>Lo tienes cuando: tocas la vuelta dos veces con cada cambio a tiempo.',
            hint: 'G to C: every finger moves, so move your hand as one shape. C to Am: only your ring finger moves.',
            hint_es: 'G a C: se mueven todos los dedos, así que mueve la mano como una sola forma. C a Am: solo se mueve tu dedo anular.',
            stuck: 'Play only G to C until it is smooth. Then add Am.',
            stuck_es: 'Toca solo G a C hasta que salga fluido. Luego agrega Am.',
            levelUp: 'Play it at 70 BPM, or in the order C, G, Am.',
            levelUp_es: 'Tócalo a 70 BPM, o en el orden C, G, Am.',
            skills: [6],
            chords: [
              { name: 'G',  chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
              { name: 'C',  chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
            ],
            playSeq: { label: 'Hear it — G·G · C·C · Am·Am (every 2 beats)', label_es: 'Escúchalo — G·G · C·C · Am·Am (cada 2 tiempos)', bpm: 60, notes: [[43,47,50,55,59,67],[43,47,50,55,59,67],[48,52,55,60,64],[48,52,55,60,64],[45,52,57,60,64],[45,52,57,60,64]] }
          },
          {
            label: 'Challenge 5 — Four-Chord Half-Bar ("Let It Be", fast)', label_es: 'Reto 5 — Medio compás con cuatro acordes ("Let It Be", rápido)',
            text: 'Play the "Let It Be" loop with two beats on each chord. The recording\'s verse moves at this speed.<ol><li>Strum C twice, G twice, Am twice, F twice.</li><li>Repeat at 60 BPM.</li></ol>You\'ve got it when: you play the loop twice with every change on the beat.',
            text_es: 'Toca la vuelta de "Let It Be" con dos tiempos en cada acorde. La estrofa de la grabación va a esta velocidad.<ol><li>Rasguea C dos veces, G dos veces, Am dos veces, F dos veces.</li><li>Repite a 60 BPM.</li></ol>Lo tienes cuando: tocas la vuelta dos veces con cada cambio a tiempo.',
            hint: 'Make the next shape in the air while the last chord still rings.',
            hint_es: 'Forma la siguiente figura en el aire mientras el acorde anterior todavía suena.',
            stuck: 'Play only the change that is slowest, often G to Am or Am to F. Then play the whole loop.',
            stuck_es: 'Toca solo el cambio más lento, a menudo G a Am o Am a F. Luego toca la vuelta completa.',
            levelUp: 'Play it at 70 BPM, or go to the one-chord-per-beat bonus below.',
            levelUp_es: 'Tócalo a 70 BPM, o pasa al bono de un acorde por tiempo de abajo.',
            skills: [5, 6],
            chords: [
              { name: 'C',  chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
              { name: 'G',  chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
              { name: 'F',  chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
            ],
            playSeq: { label: 'Hear it — C·G·Am·F (every 2 beats)', label_es: 'Escúchalo — C·G·Am·F (cada 2 tiempos)', bpm: 60, notes: [[48,52,55,60,64],[48,52,55,60,64],[43,47,50,55,59,67],[43,47,50,55,59,67],[45,52,57,60,64],[45,52,57,60,64],[53,57,60,65],[53,57,60,65]] }
          },
          {
            label: 'Bonus — One Chord Per Beat ("Let It Be", fastest)', label_es: 'Bono — Un acorde por tiempo ("Let It Be", lo más rápido)',
            text: 'This step is a bonus. Play a new chord on every beat.<ol><li>Strum C, G, Am, F: one down-strum on each beat.</li><li>Repeat at 60 BPM.</li></ol>Move to the next shape before its beat. You\'ve got it when: you play the loop four times clean at 60 BPM.',
            text_es: 'Este paso es un bono. Toca un acorde nuevo en cada tiempo.<ol><li>Rasguea C, G, Am, F: un rasgueo hacia abajo en cada tiempo.</li><li>Repite a 60 BPM.</li></ol>Muévete a la siguiente forma antes de su tiempo. Lo tienes cuando: tocas la vuelta cuatro veces limpia a 60 BPM.',
            hint: 'Keep the strum steady. Change on time even if a chord buzzes.',
            hint_es: 'Mantén el rasgueo constante. Cambia a tiempo aunque un acorde zumbe.',
            stuck: 'Play only C and G, one per beat, until it is smooth. Then add Am, then F.',
            stuck_es: 'Toca solo C y G, uno por tiempo, hasta que salga fluido. Luego agrega Am, y luego F.',
            levelUp: 'Play it at 70 BPM. After you learn D in Set 3, play G, D, Em, C, one chord per beat.',
            levelUp_es: 'Tócalo a 70 BPM. Después de aprender D en la Unidad 3, toca G, D, Em, C, un acorde por tiempo.',
            skills: [5, 6],
            chords: [
              { name: 'C',  chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
              { name: 'G',  chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
              { name: 'F',  chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
            ],
            playSeq: { label: 'Hear it — C·G·Am·F (one chord per beat)', label_es: 'Escúchalo — C·G·Am·F (un acorde por tiempo)', bpm: 60, notes: [[48,52,55,60,64],[43,47,50,55,59,67],[45,52,57,60,64],[53,57,60,65],[48,52,55,60,64],[43,47,50,55,59,67],[45,52,57,60,64],[53,57,60,65]] },
          }
            ]
          },
          {
            kind: 'reflection',
            title: 'Wrap-Up',
            title_es: 'Cierre',
            steps: [
              {
                label: 'Wrap-up: your hardest transition', label_es: 'Cierre: tu transición más difícil',
                text: 'Of C, G, Am, and F, which transition cost you the most clean changes in the minute drill? Name the two chords — that\'s your first loop next session.',
                text_es: 'De C, G, Am y F, ¿qué transición te costó más cambios limpios en el ejercicio de un minuto? Nombra los dos acordes — esa es tu primera vuelta la próxima sesión.',
              }
            ]
          },
          {
            kind: 'ear-spark',
            title: 'Ear Spark — optional ear bonus',
            title_es: 'Chispa auditiva — bono opcional de oído',
            steps: [
              {
                label: 'Ear Spark: bright or sad?', label_es: 'Chispa auditiva: ¿alegre o triste?',
                text: 'Ear Spark (optional, 2 min):<ol><li>Record yourself strumming C or Am, playing them a few times in a mixed-up order.</li><li>On playback, say whether each one sounds bright or sad before checking — that\'s major vs minor, and you can already hear it.</li><li>Try it live too: strum one from memory without looking at your fingers, then check which one you played.</li></ol>',
                text_es: 'Chispa auditiva (opcional, 2 min):<ol><li>Grábate rasgueando C o Am, tocándolos varias veces en un orden mezclado.</li><li>Al escuchar la grabación, di si cada uno suena alegre o triste antes de comprobarlo — eso es mayor vs. menor, y ya puedes oírlo.</li><li>Pruébalo también en vivo: rasguea uno de memoria sin mirar tus dedos, y luego comprueba cuál tocaste.</li></ol>'
              }
            ]
          },
          {
            title: 'The folk strum (D–D–U–U–D–U)',
            title_es: 'El rasgueo folk (D–D–U–U–D–U)',
            steps: [
              {
                label: 'Bonus — The Folk Strum', label_es: 'Bono — El rasgueo folk',
                text: 'This step is a bonus.<ol><li>Count one bar out loud: "1 + 2 + 3 + 4 +".</li><li>Strum on six of the eight counts: down on 1, down on 2, up on the + after 2, up on the + after 3, down on 4, up on the + after 4.</li><li>Play it on G.</li></ol>Written out: D · D U · U D U. You\'ve got it when: you play it 4 times in a row on G without stopping.',
                text_es: 'Este paso es un bono.<ol><li>Cuenta un compás en voz alta: "1 + 2 + 3 + 4 +".</li><li>Rasguea en seis de los ocho conteos: abajo en 1, abajo en 2, arriba en el + después del 2, arriba en el + después del 3, abajo en 4, arriba en el + después del 4.</li><li>Tócalo en G.</li></ol>Escrito: D · D U · U D U. Lo tienes cuando: lo tocas 4 veces seguidas en G sin detenerte.',
                hint: 'Your hand moves down-up the whole bar. It does not touch the strings on the + after 1 or on 3.',
                hint_es: 'Tu mano se mueve abajo-arriba todo el compás. No toca las cuerdas en el + después del 1 ni en el 3.',
                stuck: 'Keep your hand moving down-up without stopping. On the two counts you skip, move your hand past the strings without touching them.',
                stuck_es: 'Mantén tu mano moviéndose abajo-arriba sin parar. En los dos conteos que te saltas, pasa la mano sin tocar las cuerdas.',
                levelUp: 'Play one bar on G and one bar on C. Repeat. Keep the strum going through each change.',
                levelUp_es: 'Toca un compás en G y un compás en C. Repite. Mantén el rasgueo durante cada cambio.',
                skills: [5, 6],
                chords: [
                  { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
                  { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 }
                ],
                playSeq: { label: 'Hear G then C — the change to loop', label_es: 'Escucha G y luego C — el cambio para repetir', bpm: 60, notes: [[43,47,50,55,59,67], [43,47,50,55,59,67], [48,52,55,60,64], [48,52,55,60,64]] }
              }
            ]
          }
        ]
      }
    },

    skills: [
      { id: 'm4w2-s1', text: 'Fret C major so all five strings ring',
        text_es: 'Trastear C mayor para que suenen las cinco cuerdas',
        gotItWhen: 'you pluck the five strings one at a time and all five ring, including the open G and high e.',
        gotItWhen_es: 'pulsas las cinco cuerdas una por una y las cinco suenan, incluso la Sol al aire y la mi aguda.',
        practice: { type: 'playSeq', label: 'Hear C major (arpeggiated)', label_es: 'Escucha C mayor (arpegiado)', bpm: 60,
          notes: [48, 52, 55, 60, 64] } },
      { id: 'm4w2-s2', text: 'Fret F major (simplified xx3211) with no buzzing',
        text_es: 'Trastear F mayor (simplificado xx3211) sin zumbido',
        gotItWhen: 'you strum the simplified F and all four strings ring, including both strings under your index finger.',
        gotItWhen_es: 'rasgueas el F simplificado y suenan las cuatro cuerdas, incluso las dos cuerdas bajo tu dedo índice.',
        practice: { type: 'mc', prompt: 'For the simplified F chord (xx3211), which strings should you actually strum?',
          prompt_es: 'Para el acorde F simplificado (xx3211), ¿qué cuerdas deberías rasguear en realidad?',
          choices: ['All 6 strings', 'The top four strings only (e, B, G, D)', 'From the A string down', 'The low E and A strings only (the bass pair)'],
          choices_es: ['Todas las 6 cuerdas', 'Solo las cuatro cuerdas más agudas (mi aguda, Si, Sol, Re)', 'Desde la cuerda La hacia abajo', 'Solo las cuerdas Mi grave y La (las dos graves)'], answer: 1,
          explain: 'The two x\'s at the front stand for the low E and A strings. They stay silent, so only the top four strings sound. If you strum all six, the open low E rings too. E is not a note in the F chord, so the chord sounds muddy.',
          explain_es: 'Las dos x del principio corresponden a las cuerdas Mi grave y La. Se quedan en silencio, así que solo suenan las cuatro cuerdas agudas. Si rasgueas las seis, también suena la Mi grave al aire. E no es una nota del acorde F, así que el acorde suena turbio.' } },
      { id: 'm4w2-s3', text: 'Fret G major (3 or 4 finger version) cleanly',
        text_es: 'Trastear G mayor (versión de 3 o 4 dedos) limpio',
        gotItWhen: 'every string rings in your G chord, including the open strings in the middle.',
        gotItWhen_es: 'cada cuerda suena en tu acorde G, incluso las cuerdas al aire del medio.',
        practice: { type: 'playSeq', label: 'Hear G major (arpeggiated)', label_es: 'Escucha G mayor (arpegiado)', bpm: 60,
          notes: [43, 47, 50, 55, 59, 67] } },
      { id: 'm4w2-s4', text: 'Keep the shared fingers down when you switch between Am and C',
        text_es: 'Dejar puestos los dedos compartidos al cambiar entre Am y C',
        gotItWhen: 'you switch Am ↔ C ten times and the two shared fingers never leave the strings.',
        gotItWhen_es: 'cambias Am ↔ C diez veces y los dos dedos compartidos nunca dejan las cuerdas.',
        practice: { type: 'mc', prompt: 'When you switch between Am and C, which finger STAYS on the B string, fret 1?',
          prompt_es: 'Al cambiar entre Am y C, ¿qué dedo SE QUEDA en la cuerda Si, traste 1?',
          choices: ['Index (1)', 'Middle (2)', 'Ring (3)', 'Pinky (4)'],
          choices_es: ['Índice (1)', 'Medio (2)', 'Anular (3)', 'Meñique (4)'], answer: 0,
          explain: 'Am and C both put the index finger on the B string, fret 1. Leave it down and move the other fingers around it. If you lift it, you have to build the whole shape again and you lose the beat.',
          explain_es: 'Am y C ponen los dos el dedo índice en la cuerda Si, traste 1. Déjalo puesto y mueve los otros dedos a su alrededor. Si lo levantas, tienes que armar toda la forma otra vez y pierdes el tiempo.' } },
      { id: 'm4w2-s5', text: 'Play a down-up strum (D U D U) in time, building to 70 BPM',
        text_es: 'Tocar un rasgueo abajo-arriba (D U D U) a tiempo, subiendo hasta 70 BPM',
        gotItWhen: 'you hold a down-up strum for 8 bars at 70 BPM without missing a strum.',
        gotItWhen_es: 'mantienes un rasgueo abajo-arriba por 8 compases a 70 BPM sin fallar ningún rasgueo.',
        practice: { type: 'mc', prompt: 'In a down-up strum pattern, when do the UPSTROKES happen?',
          prompt_es: 'En un patrón de rasgueo abajo-arriba, ¿cuándo ocurren los rasgueos HACIA ARRIBA?',
          choices: ['On the numbers (1, 2, 3, 4)', 'On the "+" (and) between beats', 'Only on beat 4', 'Randomly'],
          choices_es: ['En los números (1, 2, 3, 4)', 'En el "+" (y) entre tiempos', 'Solo en el tiempo 4', 'Al azar'], answer: 1,
          explain: 'Downstrokes land on the numbers, and upstrokes land on the "+" between them. Your wrist swings down on the beat and back up in between. Down-up with no stops keeps the rhythm even.',
          explain_es: 'Los rasgueos hacia abajo caen en los números, y los rasgueos hacia arriba caen en el "+" entre ellos. Tu muñeca baja en el tiempo y vuelve a subir entre los tiempos. Abajo-arriba sin parar mantiene el ritmo parejo.' } },
      { id: 'm4w2-s6', text: 'Switch between any two chords in Group 1 on beat 1 at 70 BPM',
        text_es: 'Cambiar entre dos acordes cualesquiera del Grupo 1 en el tiempo 1 a 70 BPM',
        gotItWhen: 'you run the Group 1 chord deck at 70 BPM and change to each chord it deals on beat 1 without stopping the strum.',
        gotItWhen_es: 'corres la baraja de acordes del Grupo 1 a 70 BPM y cambias a cada acorde que reparte en el tiempo 1 sin detener el rasgueo.',
        practice: { type: 'playSeq', label: 'C–G–Am–F progression (root notes)', label_es: 'Progresión C–G–Am–F (notas raíz)', bpm: 70,
          notes: [48, 43, 45, 53] } },
      { id: 'm4w2-s7', text: 'Fret Dm cleanly — a triangle on the three thinnest strings',
        text_es: 'Trastear Dm limpio — un triángulo en las tres cuerdas más delgadas',
        gotItWhen: 'you strum Dm from the D string to the high e and all four strings ring clear.',
        gotItWhen_es: 'rasgueas Dm desde la cuerda Re hasta la mi aguda y las cuatro cuerdas suenan claras.',
        practice: { type: 'playSeq', label: 'Hear Dm (arpeggiated)', label_es: 'Escucha Dm (arpegiado)', bpm: 60,
          notes: [50, 57, 62, 65] } },
      { id: 'm4w2-s8', text: 'Play G/B using your G shape',
        text_es: 'Tocar G/B con tu forma de G',
        gotItWhen: 'you strum G/B from the A string to the high e, and the lowest note you hear is B.',
        gotItWhen_es: 'rasgueas G/B desde la cuerda La hasta la mi aguda, y la nota más grave que oyes es B.',
        practice: { type: 'mc', prompt: 'In the chord name "G/B", what does the "/B" tell you?',
          prompt_es: 'En el nombre de acorde "G/B", ¿qué te indica el "/B"?',
          choices: ['Play a B chord instead of the G chord', 'B is the bass note under a G shape', 'Barre the B string with your index finger', 'Tune the B string down to a B note'],
          choices_es: ['Toca un acorde B en vez del acorde G', 'B es la nota de bajo debajo de una forma de G', 'Haz cejilla en la cuerda Si con el dedo índice', 'Afina la cuerda Si hacia abajo hasta un B'], answer: 1,
          explain: 'A slash chord names the chord first and the bass note second. Play your normal G shape, but start the strum on the A string, so the B on that string is the lowest note. It is still a G chord, with a different lowest note.',
          explain_es: 'Un acorde con barra diagonal nombra primero el acorde y después la nota de bajo. Toca tu forma normal de G, pero empieza el rasgueo en la cuerda La, para que el B de esa cuerda sea la nota más grave. Sigue siendo un acorde G, con otra nota más grave.' } }
    ]
  },

  {
    id: 'm4w3',
    songThread: [{ name: '"Luna"', journey: 'tabs/luna.html', layer: 4, note: 'the F–Am vamp' }],
    label: 'Set 3',
    locked: false,
    module: 'Open Chords',
    moduleNum: 4,
    unit: 'Module 4 · Open Chords',
    unit_es: 'Módulo 4 · Acordes al aire',
    title: 'Set 3',
    subtitle: 'Chord Group 2: D, A, Em, Bm · Connecting chord groups',
    subtitle_es: 'Grupo de acordes 2: D, A, Em, Bm · Conectando grupos de acordes',
    skillFocus: 'Fretting the D, A, and Bm chords · Connecting chord groups in a song',
    skillFocus_es: 'Trastear los acordes D, A y Bm · Conectar grupos de acordes en una canción',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        title_es: 'Estación de computadora — Mira · Escucha · Practica',
        sections: [
          {
            title: 'Watch the lesson videos',
            title_es: 'Mira los videos de la lección',
            steps: [
          {
            label: 'Watch: the D major chord', label_es: 'Mira: el acorde de D mayor',
            text: 'Watch: <a href="https://www.youtube.com/watch?v=xHiJ1jAkemM" target="_blank">D Major Chord: Beginner Guitar Lesson – Guitar Goddess</a>. Look at the outline her three fingers make on the three thinnest strings. Name that shape. You\'ve got it when: you describe the shape without watching again.',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=xHiJ1jAkemM" target="_blank">D Major Chord: Beginner Guitar Lesson – Guitar Goddess</a>. Mira el contorno que forman sus tres dedos en las tres cuerdas más delgadas. Nombra esa forma. Lo tienes cuando: describes la forma sin volver a mirar el video.',
            hint: 'Pause when her fingers are in place. Picture lines between the three fingertips.',
            hint_es: 'Pausa cuando sus dedos estén en su lugar. Imagina líneas entre las tres puntas de los dedos.',
            skills: [1, 2, 3, 4],
            response: { type: 'mc', prompt: 'The D major chord uses which finger shape on the top three strings (e, B, G)?',
              prompt_es: '¿Qué forma de dedos usa el acorde D mayor en las tres cuerdas más agudas (mi aguda, Si, Sol)?',
              answer: 0,
              explain: 'The three fingers make a small triangle on the top three strings. That triangle tells you it is D major.',
              explain_es: 'Los tres dedos forman un triángulo pequeño en las tres cuerdas agudas. Ese triángulo te dice que es D mayor.',
              choices: [
              'A triangle shape',
              'A straight line across one fret',
              'A square shape',
              'All open strings'
            ],
              choices_es: [
              'Una forma triangular',
              'Una línea recta a lo largo de un traste',
              'Una forma cuadrada',
              'Todas las cuerdas al aire'
            ] }
          },
          {
            label: 'Watch: the A chord', label_es: 'Mira: el acorde de A',
            text: 'Watch: <a href="https://youtu.be/VkkOFLouQDs" target="_blank">The A Chord (BC-112) – JustinGuitar</a> (0:00–4:00).<ol><li>Pause when his A chord is in place.</li><li>Say which string and fret each finger is on.</li><li>Build the A chord.</li></ol>You\'ve got it when: you strum your A chord and all five strings ring.',
            text_es: 'Mira: <a href="https://youtu.be/VkkOFLouQDs" target="_blank">The A Chord (BC-112) – JustinGuitar</a> (0:00–4:00).<ol><li>Pausa cuando su acorde de A esté en su lugar.</li><li>Di en qué cuerda y en qué traste está cada dedo.</li><li>Arma el acorde de A.</li></ol>Lo tienes cuando: rasgueas tu acorde de A y suenan las cinco cuerdas.',
            hint: 'Copy the angle of his fingers, not just the fret numbers.',
            hint_es: 'Copia el ángulo de sus dedos, no solo los números de traste.',
            skills: [2, 4],
            response: { type: 'mc', prompt: 'What makes the A chord awkward for most beginners?',
              prompt_es: '¿Qué hace que el acorde A sea incómodo para la mayoría de los principiantes?',
              answer: 0,
              explain: 'All three fingers share fret 2, so there is not much room. Squeeze them close together and keep them a little behind the fret wire. That gives you the room you need.',
              explain_es: 'Los tres dedos comparten el traste 2, así que hay poco espacio. Júntalos bien y ponlos un poco detrás del alambre del traste. Así tienes el espacio que necesitas.',
              choices: [
              'Three fingers have to fit in one fret',
              'It needs a full barre across all six strings',
              'You have to strum all six strings evenly',
              'It uses the pinky on the top string'
            ],
              choices_es: [
              'Tres dedos tienen que caber en un solo traste',
              'Necesita una cejilla completa sobre las seis cuerdas',
              'Tienes que rasguear las seis cuerdas parejo',
              'Usa el meñique en la cuerda más aguda'
            ] }
          },
          {
            label: 'Watch: Bm two ways', label_es: 'Mira: Bm de dos maneras',
            text: 'Watch: <a href="https://www.youtube.com/watch?v=suJnbc2TERU&t=32" target="_blank">B minor (Bm) Chord, 2 Ways (start easy, then barre) – Guitar Goddess (0:32–3:12)</a>. Learn the four-finger version (xx4432). It has no barre. You\'ve got it when: you play the xx4432 version four times in a row with every string in the shape ringing.',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=suJnbc2TERU&t=32" target="_blank">B minor (Bm) Chord, 2 Ways (start easy, then barre) – Guitar Goddess (0:32–3:12)</a>. Aprende la versión de cuatro dedos (xx4432). No tiene cejilla. Lo tienes cuando: tocas la versión xx4432 cuatro veces seguidas con cada cuerda de la forma sonando.',
            hint: 'Skip the barre version for now. It comes in Module 7.',
            hint_es: 'Sáltate la versión con cejilla por ahora. Llega en el Módulo 7.',
            skills: [3],
            chords: [
              { name: 'Bm', chord: [[6,'x'],[5,'x'],[4,4,'4'],[3,4,'3'],[2,3,'2'],[1,2,'1']], position: 2 }
            ],
          },
            ]
          },
          {
            title: 'Listen for the chord changes',
            title_es: 'Escucha los cambios de acorde',
            steps: [
          {
            label: 'Listen: "Luna"', label_es: 'Escucha: "Luna"',
            text: 'Listen to <a href="https://www.youtube.com/watch?v=LExSwglVFIw" target="_blank">"Luna" by Peso Pluma & Junior H</a>. The song uses two chords, F and Am. Dm comes in once, in the opening lines.<ol><li>Tap only the strong beats. There are two in each bar.</li><li>Listen for each chord change. It lands on a strong beat.</li><li>Below, describe one moment when you heard a chord change.</li></ol>',
            text_es: 'Escucha <a href="https://www.youtube.com/watch?v=LExSwglVFIw" target="_blank">"Luna" de Peso Pluma y Junior H</a>. La canción usa dos acordes, F y Am. Dm aparece una vez, en las primeras líneas.<ol><li>Marca solo los tiempos fuertes. Hay dos en cada compás.</li><li>Escucha cada cambio de acorde. Cae en un tiempo fuerte.</li><li>Abajo, describe un momento en que oíste un cambio de acorde.</li></ol>',
            hint: 'You know Am from Set 1 and F from Set 2.',
            hint_es: 'Conoces Am de la Unidad 1 y F de la Unidad 2.',
            skills: [6],
            response: { type: 'short', placeholder: 'Describe one moment where you clearly heard a chord change.',
              placeholder_es: 'Describe un momento donde escuchaste claramente un cambio de acorde.' }
          },
            ]
          },
          {
            kind: 'reflection',
            title: 'Checkpoint',
            title_es: 'Punto de control',
            steps: [
          {
            label: 'Wrap-up: your Group 2 weak spot', label_es: 'Cierre: tu punto débil del Grupo 2',
            text: 'Checkpoint — pause and think: you now know two whole chord groups. Which Group 2 chord (D, A, Em, Bm) feels furthest from automatic, and what specifically makes it hard?',
            text_es: 'Punto de control — pausa y piensa: ahora conoces dos grupos completos de acordes. ¿Qué acorde del Grupo 2 (D, A, Em, Bm) se siente más lejos de ser automático, y qué específicamente lo hace difícil?',
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — Group 2 chords & cross-group connections',
        title_es: 'Estación de práctica — acordes del Grupo 2 y conexiones entre grupos',
        sections: [
          {
            kind: 'tuning-warmup',
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tuning check', label_es: 'Calentamiento: afinación',
                text: 'Start every practice session the same way:<ol><li>Tune all 6 strings to green (E A D G B e).</li><li>Play each string open.</li></ol>You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera:<ol><li>Afina las 6 cuerdas hasta que estén en verde (E A D G B e).</li><li>Toca cada cuerda al aire.</li></ol>Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                hint: 'Tuning (Module 1) is a skill you keep forever. Clean open strings are exactly what makes a chord ring.',
                hint_es: 'Afinar (Módulo 1) es una destreza que conservas para siempre. Las cuerdas al aire limpias son exactamente lo que hace que un acorde suene bien.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Fret D major cleanly',
            title_es: 'Trastea D mayor limpio',
            steps: [
          {
            label: 'Challenge 1 — Clean D', label_es: 'Reto 1 — D limpio',
            text: '<ol><li>Put your index finger on the G string, fret 2.</li><li>Put your middle finger on the high e string, fret 2.</li><li>Put your ring finger on the B string, fret 3.</li><li>Strum four strings, from the D string to the high e.</li></ol>You\'ve got it when: you pluck the four strings one at a time and all four ring.',
            text_es: '<ol><li>Pon tu dedo índice en la cuerda Sol, traste 2.</li><li>Pon tu dedo medio en la cuerda mi aguda, traste 2.</li><li>Pon tu dedo anular en la cuerda Si, traste 3.</li><li>Rasguea cuatro cuerdas, desde la cuerda Re hasta la mi aguda.</li></ol>Lo tienes cuando: pulsas las cuatro cuerdas una por una y las cuatro suenan.',
            hint: 'The high e goes quiet most often. Arch your ring finger so it does not touch the high e.',
            hint_es: 'La mi aguda es la que más se apaga. Arquea tu dedo anular para que no toque la mi aguda.',
            stuck: 'Make the high e and B ring first. Then add your index finger on the G string.',
            stuck_es: 'Haz sonar primero la mi aguda y la Si. Luego agrega tu dedo índice en la cuerda Sol.',
            levelUp: 'Switch D, A, D without looking.',
            levelUp_es: 'Cambia D, A, D sin mirar.',
            skills: [1],
            chords: [
              { name: 'D', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'1'],[2,3,'3'],[1,2,'2']], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Fret Bm cleanly',
            title_es: 'Trastea Bm limpio',
            steps: [
          {
            label: 'Challenge 2 — Clean Bm (four-finger, no barre)', label_es: 'Reto 2 — Bm limpio (cuatro dedos, sin cejilla)',
            text: '<ol><li>Put your index finger on the high e string, fret 2.</li><li>Put your middle finger on the B string, fret 3.</li><li>Put your ring finger on the G string, fret 4.</li><li>Put your pinky on the D string, fret 4.</li><li>Strum four strings, from the D string to the high e.</li></ol>You\'ve got it when: all four strings ring clear.',
            text_es: '<ol><li>Pon tu dedo índice en la cuerda mi aguda, traste 2.</li><li>Pon tu dedo medio en la cuerda Si, traste 3.</li><li>Pon tu dedo anular en la cuerda Sol, traste 4.</li><li>Pon tu meñique en la cuerda Re, traste 4.</li><li>Rasguea cuatro cuerdas, desde la cuerda Re hasta la mi aguda.</li></ol>Lo tienes cuando: las cuatro cuerdas suenan claras.',
            hint: 'One finger on each string. The D string under your pinky goes quiet most often. Press it with the tip.',
            hint_es: 'Un dedo en cada cuerda. La cuerda Re bajo tu meñique es la que más se apaga. Presiónala con la punta.',
            stuck: 'Add one finger at a time, starting with your index. Check each string before you add the next finger. Still not clean? Play <strong>Bm7</strong> for now: <code>x20202</code>, three fingers.',
            stuck_es: 'Agrega un dedo a la vez, empezando con el índice. Revisa cada cuerda antes de agregar el siguiente dedo. ¿Todavía no sale limpio? Toca <strong>Bm7</strong> por ahora: <code>x20202</code>, tres dedos.',
            levelUp: 'Switch Em, Bm, Em without looking. Lift all your Em fingers together and put down the whole Bm shape.',
            levelUp_es: 'Cambia Em, Bm, Em sin mirar. Levanta todos los dedos de Em juntos y pon toda la forma de Bm.',
            skills: [3],
            chords: [
              { name: 'Bm', chord: [[6,'x'],[5,'x'],[4,4,'4'],[3,4,'3'],[2,3,'2'],[1,2,'1']], position: 2 }
            ]
          }
            ]
          },
          {
            title: 'Fret A cleanly',
            title_es: 'Trastea A limpio',
            steps: [
          {
            label: 'Challenge — Clean A', label_es: 'Reto — A limpio',
            text: '<ol><li>Put your middle finger on the D string, fret 2.</li><li>Put your index finger on the G string, fret 2.</li><li>Put your ring finger on the B string, fret 2.</li><li>Strum five strings, from the A string to the high e. Do not play the low E.</li></ol>You\'ve got it when: all three fingers fit on fret 2 and all five strings ring clean.',
            text_es: '<ol><li>Pon tu dedo medio en la cuerda Re, traste 2.</li><li>Pon tu dedo índice en la cuerda Sol, traste 2.</li><li>Pon tu dedo anular en la cuerda Si, traste 2.</li><li>Rasguea cinco cuerdas, desde la cuerda La hasta la mi aguda. No toques la Mi grave.</li></ol>Lo tienes cuando: los tres dedos caben en el traste 2 y las cinco cuerdas suenan limpias.',
            hint: 'Press each finger with its tip, close together. Your index finger is in the same spot for A and D.',
            hint_es: 'Presiona cada dedo con la punta, bien juntos. Tu dedo índice está en el mismo lugar para A y para D.',
            stuck: 'Hold your three fingers close together before you put them down.',
            stuck_es: 'Junta tus tres dedos antes de ponerlos.',
            levelUp: 'Switch A, D, A without looking. Keep your index finger on the G string, fret 2, the whole time.',
            levelUp_es: 'Cambia A, D, A sin mirar. Mantén tu dedo índice en la cuerda Sol, traste 2, todo el tiempo.',
            skills: [2],
            chords: [
              { name: 'A', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'1'],[2,2,'3'],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Connect Group 1 & Group 2 chords',
            title_es: 'Conecta acordes del Grupo 1 y del Grupo 2',
            steps: [
          {
            label: 'Challenge 3 — Cross-Group Changes', label_es: 'Reto 3 — Cambios entre grupos',
            text: 'Play each pair at 60 BPM, 2 bars per chord.<ol><li>G to D.</li><li>Am to Em.</li><li>C to A.</li><li>D to A.</li><li>Em to Bm.</li><li>Then play D and A at 70 BPM for 8 bars.</li></ol>You\'ve got it when: you play all five pairs twice at 60 BPM, then 8 bars of D and A at 70, with every change on beat 1.',
            text_es: 'Toca cada par a 60 BPM, 2 compases por acorde.<ol><li>G a D.</li><li>Am a Em.</li><li>C a A.</li><li>D a A.</li><li>Em a Bm.</li><li>Luego toca D y A a 70 BPM durante 8 compases.</li></ol>Lo tienes cuando: tocas los cinco pares dos veces a 60 BPM, y luego 8 compases de D y A a 70, con cada cambio en el tiempo 1.',
            hint: 'Before you lift your fingers, look at where each one goes next. Set the ⏱ Timer for 3 minutes and play the pairs until it beeps.',
            hint_es: 'Antes de levantar los dedos, mira a dónde va cada uno. Pon el ⏱ Temporizador en 3 minutos y toca los pares hasta que suene.',
            stuck: 'Play one pair at a time. For G to D, move all your fingers together as one shape.',
            stuck_es: 'Toca un par a la vez. Para G a D, mueve todos tus dedos juntos como una sola forma.',
            levelUp: 'Play all five pairs in a row without stopping, or play every pair at 70 BPM.',
            levelUp_es: 'Toca los cinco pares seguidos sin detenerte, o toca cada par a 70 BPM.',
            skills: [2, 3, 4, 5],
            chords: [
              { name: 'A',  chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'1'],[2,2,'3'],[1,0]], position: 0 },
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 }
            ]
          },
          {
            label: 'Challenge — F ↔ Am, the "Luna" Change', label_es: 'Reto — F ↔ Am, el cambio de "Luna"',
            text: '"Luna" is in 6/8: six beats in each bar, counted 1 2 3 4 5 6. Strum down on 1 and 4.<ol><li>Play the simplified F (xx3211) for 2 bars.</li><li>Play Am for 2 bars.</li><li>Repeat at 60 BPM.</li></ol>You\'ve got it when: you play the loop four times, every change on beat 1, and all four strings of the F ring clean.',
            text_es: '"Luna" está en 6/8: seis tiempos en cada compás, contados 1 2 3 4 5 6. Rasguea hacia abajo en el 1 y el 4.<ol><li>Toca el F simplificado (xx3211) durante 2 compases.</li><li>Toca Am durante 2 compases.</li><li>Repite a 60 BPM.</li></ol>Lo tienes cuando: tocas la vuelta cuatro veces, cada cambio en el tiempo 1, y las cuatro cuerdas del F suenan limpias.',
            hint: 'Your index finger stays at fret 1 in both chords. In F it lies flat across the high e and B strings. In Am it presses only the B string.',
            hint_es: 'Tu dedo índice se queda en el traste 1 en los dos acordes. En F va plano sobre las cuerdas mi aguda y Si. En Am presiona solo la cuerda Si.',
            stuck: 'Strum once per bar, on beat 1. Use the other beats to move to the next chord.',
            stuck_es: 'Rasguea una vez por compás, en el tiempo 1. Usa los otros tiempos para moverte al siguiente acorde.',
            levelUp: 'Play it at 70 BPM. Then play the F–Am loop on the <a href="tabs/luna.html" target="_blank">"Luna" Song Journey</a> page, Layer 4.',
            levelUp_es: 'Tócalo a 70 BPM. Luego toca la vuelta F–Am en la página del <a href="tabs/luna.html" target="_blank">Recorrido de la canción de "Luna"</a>, Capa 4.',
            skills: [6],
            chords: [
              { name: 'F',  chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Random chord draw — every chord so far',
            title_es: 'Sorteo de acordes al azar — todos los acordes hasta ahora',
            steps: [
              {
                label: 'Challenge — Cross-Group Chord Draw', label_es: 'Reto — Sorteo de acordes entre grupos',
                text: 'The deck below has every open chord so far: Am, Em, C, G, F, Dm, G/B, D, A and Bm.<ol><li>Tap Shuffle and deal three cards. Play each chord, then tap Done.</li><li>Play the three chords as an 8-bar loop, strumming down 4 times in each bar: first chord 2 bars, second chord 2 bars, third chord 2 bars, first chord 2 bars.</li><li>Play it at 60 BPM, then at 70.</li></ol>You\'ve got it when: you play two different sets of three cards at 70 BPM, every change on beat 1.',
                text_es: 'La baraja de abajo tiene todos los acordes al aire hasta ahora: Am, Em, C, G, F, Dm, G/B, D, A y Bm.<ol><li>Toca Barajar y reparte tres cartas. Toca cada acorde, y luego toca Listo.</li><li>Toca los tres acordes como una vuelta de 8 compases, rasgueando hacia abajo 4 veces en cada compás: primer acorde 2 compases, segundo acorde 2 compases, tercer acorde 2 compases, primer acorde 2 compases.</li><li>Tócalo a 60 BPM, y luego a 70.</li></ol>Lo tienes cuando: tocas dos grupos distintos de tres cartas a 70 BPM, cada cambio en el tiempo 1.',
                drill: { type: 'deck', deck: 'chords-m4', skill: 'm4w3-s5' },
                hint: 'Deal a card, play that chord, then tap Done.',
                hint_es: 'Reparte una carta, toca ese acorde y luego toca Listo.',
                levelUp: 'Use the first four cards and give each one 2 bars.',
                levelUp_es: 'Usa las cuatro primeras cartas y dale 2 compases a cada una.',
                skills: [5]
              }
            ]
          },
          {
            title: 'One-Minute Changes — try for a higher number',
            title_es: 'Cambios de un minuto — intenta superar tu número',
            steps: [
              {
                label: 'Challenge 4 — One-Minute Changes (G ↔ D)', label_es: 'Reto 4 — Cambios de un minuto (G ↔ D)',
                text: '<ol><li>Set the ⏱ Timer for 60 seconds.</li><li>Switch G, D, G, D as many times as you can.</li><li>Count only clean changes.</li></ol>You\'ve got it when: you make 20 clean G&rarr;D changes in one minute. Next goal: 30.',
                text_es: '<ol><li>Pon el ⏱ Temporizador en 60 segundos.</li><li>Cambia G, D, G, D tantas veces como puedas.</li><li>Cuenta solo los cambios limpios.</li></ol>Lo tienes cuando: haces 20 cambios limpios de G&rarr;D en un minuto. Siguiente meta: 30.',
                hint: 'G uses all six strings. D uses the four thinnest. Move your hand as one shape.',
                hint_es: 'G usa las seis cuerdas. D usa las cuatro más delgadas. Mueve la mano como una sola forma.',
                stuck: 'Hold G. Practice only the move into D and back. Speed up when each chord rings.',
                stuck_es: 'Sostén G. Practica solo el movimiento a D y de vuelta. Acelera cuando cada acorde suene.',
                levelUp: 'Do the same with Em and A, or strum down-up on each chord.',
                levelUp_es: 'Haz lo mismo con Em y A, o rasguea abajo-arriba en cada acorde.',
                skills: [5],
              }
            ]
          },
          {
            kind: 'take-to-song',
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Luna", the vamp', label_es: 'Reto — "Luna", el vamp',
                text: '<ol><li>Play F · Am — two shapes, with the simplified F (xx3211).</li><li>Play two downbeat strums per bar — the song is in 6/8 — nothing syncopated — changing every two bars at 60 BPM.</li></ol>You\'ve got it when: four laps (a lap = one full time through the loop) with every change landing on the downbeat and the little F ringing clean. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 4 of 5</a>.',
                text_es: '<ol><li>Toca F · Am — dos formas, con el F simplificado (xx3211).</li><li>Toca dos rasgueos en el tiempo fuerte por compás — la canción está en 6/8 — nada sincopado — cambiando cada dos compases a 60 BPM.</li></ol>Lo tienes cuando: cuatro vueltas (una vuelta = un recorrido completo del loop) con cada cambio cayendo en el tiempo fuerte y el pequeño F sonando limpio. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 4 de 5</a>.',
                hint: 'A vamp is a short chord pattern repeated over and over. F and Am are both chords you already know well from Group 1 — the only new part is the simplified F shape (xx3211) and locking the change to the 6/8 pulse.',
                hint_es: 'Un vamp es un patrón de acordes corto que se repite una y otra vez. F y Am son acordes que ya conoces bien del Grupo 1 — lo único nuevo es la forma simplificada de F (xx3211) y ajustar el cambio al pulso de 6/8.',
                stuck: 'Loop just F → Am until the shape change is automatic, then add the metronome at 60 BPM.',
                stuck_es: 'Repite solo F → Am hasta que el cambio de forma sea automático, y luego agrega el metrónomo a 60 BPM.',
                levelUp: 'Drop in the passing Dm in the song\'s opening lines, or push the tempo to 70 BPM.',
                levelUp_es: 'Agrega el Dm de paso en las primeras líneas de la canción, o empuja el tempo a 70 BPM.',
                skills: [6],
                chords: [
                  { name: 'F',  chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
                ],
              },
              {
                label: 'Challenge — "Sweet Child O\' Mine", verse (open chords)', label_es: 'Reto — "Sweet Child O\' Mine", estrofa (acordes al aire)',
                text: '<ul><li>Play the D · C · G loop as full open chords — two bars per chord.</li></ul>You\'ve got it when: two full verse loops, every change landing on beat 1, every string you strum ringing clean. Then press &#x25B6; on the Song Journey page and strum along with the play-along track at 125 BPM — record speed. <a href="tabs/sweet-child-o-mine.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 4 of 5</a>.',
                text_es: '<ul><li>Toca la vuelta D · C · G como acordes al aire completos — dos compases por acorde.</li></ul>Lo tienes cuando: dos vueltas completas de la estrofa, cada cambio cayendo en el tiempo 1, cada cuerda que rasgueas sonando limpia. Luego presiona &#x25B6; en la página de Recorrido de la canción y rasguea junto con la pista de acompañamiento a 125 BPM — la velocidad de la grabación. <a href="tabs/sweet-child-o-mine.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 4 de 5</a>.',
                hint: 'You\'ve played this D · C · G loop as bass notes (Module 2) and power chords (Module 3) — now it\'s full open chords, at the same two-bars-per-chord pacing as always, which is why the 125 BPM play-along track is that same pacing just at real speed. D, C, and G are chords you already know solidly from Group 1 and Group 2 — the only new skill here is the switch itself. Look ahead one bar early: start shaping the next chord while the current one is still ringing.',
                hint_es: 'Ya tocaste esta vuelta D · C · G como notas de bajo (Módulo 2) y acordes de potencia (Módulo 3) — ahora son acordes al aire completos, con el mismo ritmo de dos compases por acorde de siempre, y por eso la pista de acompañamiento a 125 BPM es ese mismo ritmo solo que a velocidad real. D, C y G son acordes que ya conoces bien del Grupo 1 y el Grupo 2 — la única destreza nueva aquí es el cambio en sí. Mira hacia adelante un compás antes: empieza a formar el siguiente acorde mientras el actual todavía suena.',
                stuck: 'Loop just D &rarr; C (the hardest pair — all three fingers move, and none of them stays in place) until it\'s automatic, then add G back in.',
                stuck_es: 'Repite solo D &rarr; C (el par más difícil — se mueven los tres dedos, y ninguno se queda en su lugar) hasta que sea automático, y luego vuelve a agregar G.',
                levelUp: 'Try the down-up 8th-note strum from Set 2, or hum the famous intro riff while you strum the verse underneath it.',
                levelUp_es: 'Prueba el rasgueo de corcheas abajo-arriba de la Unidad 2, o tararea el famoso riff de la intro mientras rasgueas la estrofa debajo.',
                skills: [1, 5],
                chords: [
                  { name: 'D', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'1'],[2,3,'3'],[1,2,'2']], position: 0 },
                  { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 }
                ],
                playSeq: { label: 'Hear it — D · C · G, two full bars per chord, like the record', label_es: 'Escúchalo — D · C · G, dos compases completos por acorde, como en la grabación', bpm: 60, maxBpm: 130, notes: [
                  { midi: [50,57,62,66], beats: 8 },
                  { midi: [48,52,55,60,64], beats: 8 },
                  { midi: [43,47,50,55,59,67], beats: 8 }
                ] },
              }
            ]
          },
          {
            kind: 'reflection',
            title: 'Wrap-Up',
            title_es: 'Cierre',
            steps: [
              {
                label: 'Wrap-up: your hardest cross-group change', label_es: 'Cierre: tu cambio entre grupos más difícil',
                text: 'Crossing between Group 1 and Group 2, which single change still feels like reaching across the neck? Name it — that\'s your warm-up next session.',
                text_es: 'Al cruzar entre el Grupo 1 y el Grupo 2, ¿qué cambio todavía se siente como estirarse por todo el mástil? Nómbralo — ese es tu calentamiento la próxima sesión.',
              }
            ]
          },
          {
            title: 'The waltz strum (3/4 time): count to 3',
            title_es: 'El rasgueo de vals (compás 3/4): cuenta hasta 3',
            steps: [
              {
                label: 'Bonus — Waltz Strum', label_es: 'Bono — Rasgueo de vals',
                text: 'This step is a bonus. A waltz has three beats in each bar: "ONE two three".<ol><li>Play Em.</li><li>Strum down hard on beat 1.</li><li>Strum down softly on beats 2 and 3.</li><li>When that is steady, add an up-strum after beat 3: D · D · D U.</li></ol>You\'ve got it when: you play 8 steady bars and beat 1 is the loudest strum in every bar.',
                text_es: 'Este paso es un bono. Un vals tiene tres tiempos en cada compás: "UNO dos tres".<ol><li>Toca Em.</li><li>Rasguea fuerte hacia abajo en el tiempo 1.</li><li>Rasguea suave hacia abajo en los tiempos 2 y 3.</li><li>Cuando eso salga constante, agrega un rasgueo hacia arriba después del tiempo 3: D · D · D U.</li></ol>Lo tienes cuando: tocas 8 compases constantes y el tiempo 1 es el rasgueo más fuerte en cada compás.',
                hint: 'Count "ONE two three" out loud. There is no beat 4.',
                hint_es: 'Cuenta "UNO dos tres" en voz alta. No hay tiempo 4.',
                stuck: 'Tap your foot instead of strumming: one loud tap on 1, soft taps on 2 and 3. Then add the strums.',
                stuck_es: 'Golpea con el pie en vez de rasguear: un golpe fuerte en el 1, golpes suaves en el 2 y el 3. Luego agrega los rasgueos.',
                levelUp: 'Change chords on beat 1 of each bar: Em, then Am, then G.',
                levelUp_es: 'Cambia de acorde en el tiempo 1 de cada compás: Em, luego Am, luego G.',
                skills: [5, 6],
                chords: [
                  { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 }
                ],
                playSeq: { label: 'Hear Em — the waltz chord', label_es: 'Escucha Em — el acorde del vals', bpm: 60, notes: [40, 47, 52, 55, 59, 64] }
              }
            ]
          }
        ]
      }
    },

    skills: [
      { id: 'm4w3-s1', text: 'Fret D major cleanly — triangle shape',
        text_es: 'Trastear D mayor limpio — forma de triángulo',
        gotItWhen: 'you strum D and every string in the shape rings clear, including the high e.',
        gotItWhen_es: 'rasgueas D y cada cuerda de la forma suena clara, incluso la mi aguda.',
        practice: { type: 'mc', prompt: 'When you strum the D major open chord, which strings should you play?',
          prompt_es: 'Cuando rasgueas el acorde D mayor al aire, ¿qué cuerdas deberías tocar?',
          choices: ['All 6 strings', 'From the D string down (the top 4)', 'From the low E down to the G string', 'Just the high e and B strings'],
          choices_es: ['Las 6 cuerdas', 'Desde la cuerda Re hacia abajo (las 4 agudas)', 'Desde la cuerda Mi grave hasta la cuerda Sol', 'Solo las cuerdas mi aguda y Si'], answer: 1,
          explain: 'D uses only the top four strings. The low E and A strings stay out of the strum. If you hit them, you add low notes, and D sounds muddy instead of clear.',
          explain_es: 'D usa solo las cuatro cuerdas agudas. Las cuerdas Mi grave y La se quedan fuera del rasgueo. Si las golpeas, agregas notas graves, y D suena turbio en vez de claro.' } },
      { id: 'm4w3-s2', text: 'Fret A major cleanly — 3 fingers on 2nd fret',
        text_es: 'Trastear A mayor limpio — 3 dedos en el traste 2',
        gotItWhen: 'your three fingers fit on fret 2 and all five strings, from the A string to the high e, ring clean.',
        gotItWhen_es: 'tus tres dedos caben en el traste 2 y las cinco cuerdas, desde la cuerda La hasta la mi aguda, suenan limpias.',
        practice: { type: 'mc', prompt: 'You\'re fretting open A major. Your three fingers all sit at fret 2 — on which three strings?',
          prompt_es: 'Estás trasteando A mayor al aire. Tus tres dedos van todos en el traste 2 — ¿en qué tres cuerdas?',
          choices: ['The D, G, and B strings', 'The A, D, and G strings', 'The G, B, and high e strings', 'The low E, A, and D strings'],
          choices_es: ['Las cuerdas Re, Sol y Si', 'Las cuerdas La, Re y Sol', 'Las cuerdas Sol, Si y mi aguda', 'Las cuerdas Mi grave, La y Re'], answer: 0,
          explain: 'Open A is x02220. The low E stays out of the strum, and the A string rings open. All three fingers go on fret 2, on the D, G and B strings. The high e rings open. If you move all three fingers one string over, you get a different chord.',
          explain_es: 'A al aire es x02220. La Mi grave se queda fuera del rasgueo, y la cuerda La suena al aire. Los tres dedos van en el traste 2, en las cuerdas Re, Sol y Si. La mi aguda suena al aire. Si mueves los tres dedos una cuerda, te sale otro acorde.' } },
      { id: 'm4w3-s3', text: 'Fret the four-finger Bm shape (xx4432) — one finger per string, no barre',
        text_es: 'Trastear la forma de Bm de cuatro dedos (xx4432) — un dedo por cuerda, sin cejilla',
        gotItWhen: 'you play the four-finger Bm (xx4432) and all four notes ring with no buzz.',
        gotItWhen_es: 'tocas el Bm de cuatro dedos (xx4432) y las cuatro notas suenan sin zumbido.',
        practice: { type: 'mc', prompt: 'The Bm chord is written "xx4432". What do the two "x"s at the start mean?',
          prompt_es: 'El acorde Bm se escribe "xx4432". ¿Qué significan las dos "x" al principio?',
          choices: ['Strum extra hard', 'Mute the low E and A strings', 'Use 2 fingers on the high e string', 'Play those strings open'],
          choices_es: ['Rasguea extra fuerte', 'Silencia las cuerdas Mi grave y La', 'Usa 2 dedos en la cuerda mi aguda', 'Toca esas cuerdas al aire'], answer: 1,
          explain: 'Read a chord like xx4432 from the low E to the high e. The two x\'s are the low E and A strings. Keep them silent and strum from the D string to the high e.',
          explain_es: 'Lee un acorde como xx4432 desde la cuerda Mi grave hasta la cuerda mi aguda. Las dos x son las cuerdas Mi grave y La. Déjalas en silencio y rasguea desde la cuerda Re hasta la mi aguda.' } },
      { id: 'm4w3-s4', text: 'Switch D to A in time at 70 BPM',
        text_es: 'Cambiar de D a A a tiempo a 70 BPM',
        gotItWhen: 'you switch D ↔ A on beat 1 at 70 BPM for 8 bars without stopping the strum.',
        gotItWhen_es: 'cambias D ↔ A en el tiempo 1 a 70 BPM durante 8 compases sin detener el rasgueo.',
        practice: { type: 'playSeq', label: 'D ↔ A switch (roots, 4 bars)', label_es: 'Cambio D ↔ A (raíces, 4 compases)', bpm: 70,
          notes: [50, 45, 50, 45] } },
      { id: 'm4w3-s5', text: 'Connect Group 1 and Group 2 chords in a song (e.g., G to D, Am to Em)',
        text_es: 'Conectar acordes del Grupo 1 y del Grupo 2 en una canción (p. ej., G a D, Am a Em)',
        gotItWhen: 'you play a song that mixes Group 1 and Group 2 chords without slowing down at the changes.',
        gotItWhen_es: 'tocas una canción que mezcla acordes del Grupo 1 y del Grupo 2 sin bajar la velocidad en los cambios.',
        practice: { type: 'playSeq', label: 'Cross-group progression (G · Em · C · D roots)', label_es: 'Progresión entre grupos (raíces G · Em · C · D)', bpm: 70,
          notes: [43, 40, 48, 50] } },
      { id: 'm4w3-s6', journey: [{ song: 'luna', layer: 4 }], text: 'Play the "Luna" vamp (F–Am, plus a passing Dm) using Group 1 chords with a strum pattern',
        text_es: 'Tocar el vamp de "Luna" (F–Am, con un Dm de paso) usando acordes del Grupo 1 con un patrón de rasgueo',
        gotItWhen: 'you loop F and Am at 60 BPM, strumming on the strong beats, with every change on beat 1 and the simplified F (xx3211) ringing clean.',
        gotItWhen_es: 'repites F y Am a 60 BPM, rasgueando en los tiempos fuertes, con cada cambio en el tiempo 1 y el F simplificado (xx3211) sonando limpio.',
        practice: { type: 'chord', label: '"Luna" vamp — simplified F and Am', label_es: 'Vamp de "Luna" — F simplificado y Am',
          chords: [
            { name: 'F',  chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
            { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
          ] } }
    ]
  },

  {
    id: 'm4w4',
    songThread: [{ name: '"Luna"', journey: 'tabs/luna.html', layer: 4, note: 'perform it' }],
    label: 'Set 4',
    locked: false,
    module: 'Open Chords',
    moduleNum: 4,
    unit: 'Module 4 · Open Chords',
    unit_es: 'Módulo 4 · Acordes al aire',
    title: 'Set 4',
    subtitle: 'Chord Group 3: E and B7 · Module 4 assessment preparation',
    subtitle_es: 'Grupo de acordes 3: E y B7 · Preparación para la evaluación del Módulo 4',
    skillFocus: 'Fretting the E and B7 chords · Performing a core song from memory',
    skillFocus_es: 'Trastear los acordes E y B7 · Interpretar una canción principal de memoria',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        title_es: 'Estación de computadora — Mira · Escucha · Practica',
        sections: [
          {
            title: 'Watch the lesson videos',
            title_es: 'Mira los videos de la lección',
            steps: [
          {
            label: 'Watch: the E chord', label_es: 'Mira: el acorde de E',
            text: 'Watch: <a href="https://youtu.be/8H393ryDkuY?t=48" target="_blank">The E Chord (BC-113) – JustinGuitar</a> (0:48–4:00). Count how many fingers he uses. Watch how he checks each string. You\'ve got it when: you play E four times in a row with all six strings ringing.',
            text_es: 'Mira: <a href="https://youtu.be/8H393ryDkuY?t=48" target="_blank">The E Chord (BC-113) – JustinGuitar</a> (0:48–4:00). Cuenta cuántos dedos usa. Fíjate cómo revisa cada cuerda. Lo tienes cuando: tocas E cuatro veces seguidas con las seis cuerdas sonando.',
            hint: 'Play it slowly as he shows it. Pluck each string to check it.',
            hint_es: 'Tócalo despacio como él lo muestra. Pulsa cada cuerda para revisarla.',
            skills: [1],
          },
          {
            label: 'Watch: how to practice effectively', label_es: 'Mira: cómo practicar con eficacia',
            text: 'Watch: <a href="https://youtu.be/uBZsLmmOz9I" target="_blank">Lesson 1 Practice Routine – JustinGuitar</a> (0:00–4:00). Listen for how he finishes the saying "Practice makes ___." You\'ve got it when: you say the sentence the way he says it.',
            text_es: 'Mira: <a href="https://youtu.be/uBZsLmmOz9I" target="_blank">Lesson 1 Practice Routine – JustinGuitar</a> (0:00–4:00). Escucha cómo termina el dicho "La práctica hace ___." Lo tienes cuando: dices la frase como él la dice.',
            hint: 'Go back to the moment he says "Practice makes…". Listen twice. Say his last word.',
            hint_es: 'Regresa al momento en que dice "Practice makes…". Escúchalo dos veces. Di su última palabra.',
            skills: [5],
            response: { type: 'mc', prompt: 'What is the KEY idea from this video about practice?',
              prompt_es: '¿Cuál es la idea CLAVE de este video sobre la práctica?',
              answer: 0,
              explain: 'Practice makes PERMANENT — repeating a mistake just makes it permanent too. Slow down and repeat the correct version so that\'s what becomes automatic.',
              explain_es: 'La práctica hace PERMANENTE — repetir un error solo lo hace permanente a él también. Baja la velocidad y repite la versión correcta para que eso sea lo que se vuelva automático.',
              choices: [
              'Practice makes permanent — so practice the solution, not the mistake',
              'Practice makes perfect — repetition is all that matters',
              'You only need to practice the day before the assessment',
              'Speed matters more than accuracy'
            ],
              choices_es: [
              'La práctica hace permanente — así que practica la solución, no el error',
              'La práctica hace la perfección — solo la repetición importa',
              'Solo necesitas practicar el día antes de la evaluación',
              'La velocidad importa más que la precisión'
            ] }
          },
            ]
          },
          {
            title: 'Plan your practice',
            title_es: 'Planea tu práctica',
            steps: [
          {
            label: 'Map your song\'s chords', label_es: 'Ubica los acordes de tu canción',
            text: '<ol><li>Find a chord chart for a song you are working on.</li><li>List the chord groups the song uses.</li><li>Below, name the song and the chord change that is hardest for you.</li></ol>',
            text_es: '<ol><li>Busca un diagrama de acordes de una canción en la que estás trabajando.</li><li>Haz una lista de los grupos de acordes que usa la canción.</li><li>Abajo, nombra la canción y el cambio de acorde que más te cuesta.</li></ol>',
            hint: 'Spend most of your practice time on that hardest change.',
            hint_es: 'Pasa la mayor parte de tu tiempo de práctica en ese cambio más difícil.',
            skills: [4, 5, 6],
            response: { type: 'short', placeholder: 'Which song are you working on? Which chord change is hardest for you right now?',
              placeholder_es: '¿En qué canción estás trabajando? ¿Qué cambio de acorde te cuesta más ahora?' }
          },
          {
            label: 'Revisit your Module 1 goal', label_es: 'Vuelve a tu meta del Módulo 1',
            text: '<ol><li>If you typed a goal in Module 1, Set 1, read it. If not, go on to step 2.</li><li>Below, write one thing you can play now that you could not play when you started this class.</li><li>Write one thing you want to play by the end of Module 4.</li></ol>',
            text_es: '<ol><li>Si escribiste una meta en el Módulo 1, Unidad 1, léela. Si no, pasa al paso 2.</li><li>Abajo, escribe una cosa que puedes tocar ahora y que no podías tocar cuando empezaste esta clase.</li><li>Escribe una cosa que quieres tocar para el final del Módulo 4.</li></ol>',
            hint: 'Name a song or a chord change, for example: "I can switch C to G without stopping."',
            hint_es: 'Nombra una canción o un cambio de acorde, por ejemplo: "puedo cambiar de C a G sin detenerme".',
            skills: [5],
            response: { type: 'short', placeholder: 'One thing you can do now that you couldn\'t when you started — and one goal for the assessment.',
              placeholder_es: 'Una cosa que puedes hacer ahora que no podías cuando empezaste — y una meta para la evaluación.' }
          },
            ]
          },
          {
            kind: 'reflection',
            title: 'Checkpoint',
            title_es: 'Punto de control',
            steps: [
          {
            label: 'Wrap-up: your practice priority', label_es: 'Cierre: tu prioridad de práctica',
            text: 'Checkpoint — pause and think: with the assessment ahead, what will take most of your practice time between now and then — a specific chord, a transition, or keeping the strum steady?',
            text_es: 'Punto de control — pausa y piensa: con la evaluación por delante, ¿qué va a tomar la mayor parte de tu tiempo de práctica de aquí a entonces — un acorde específico, una transición, o mantener el rasgueo constante?',
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — Group 3 chords & assessment prep',
        title_es: 'Estación de práctica — acordes del Grupo 3 y preparación para la evaluación',
        sections: [
          {
            kind: 'tuning-warmup',
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tuning check', label_es: 'Calentamiento: afinación',
                text: 'Start every practice session the same way:<ol><li>Tune all 6 strings to green (E A D G B e).</li><li>Play each string open.</li></ol>You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera:<ol><li>Afina las 6 cuerdas hasta que estén en verde (E A D G B e).</li><li>Toca cada cuerda al aire.</li></ol>Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                hint: 'Tuning (Module 1) is a skill you keep forever. Clean open strings are exactly what makes a chord ring.',
                hint_es: 'Afinar (Módulo 1) es una destreza que conservas para siempre. Las cuerdas al aire limpias son exactamente lo que hace que un acorde suene bien.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Fret E major cleanly',
            title_es: 'Trastea E mayor limpio',
            steps: [
          {
            label: 'Challenge 1 — Clean E', label_es: 'Reto 1 — E limpio',
            text: '<ol><li>Put your index finger on the G string, fret 1.</li><li>Put your middle finger on the A string, fret 2.</li><li>Put your ring finger on the D string, fret 2.</li><li>Strum all six strings.</li></ol>You\'ve got it when: you pluck all six strings one at a time and every one rings.',
            text_es: '<ol><li>Pon tu dedo índice en la cuerda Sol, traste 1.</li><li>Pon tu dedo medio en la cuerda La, traste 2.</li><li>Pon tu dedo anular en la cuerda Re, traste 2.</li><li>Rasguea las seis cuerdas.</li></ol>Lo tienes cuando: pulsas las seis cuerdas una por una y todas suenan.',
            hint: 'Check the open B string most. Your index finger can touch it by accident.',
            hint_es: 'Revisa sobre todo la cuerda Si al aire. Tu dedo índice puede tocarla por accidente.',
            stuck: 'E is Em plus one finger. Play a clean Em. Then add your index finger on the G string, fret 1.',
            stuck_es: 'E es Em más un dedo. Toca un Em limpio. Luego agrega tu dedo índice en la cuerda Sol, traste 1.',
            levelUp: 'Switch E, Am, E. Then switch E, B7, E.',
            levelUp_es: 'Cambia E, Am, E. Luego cambia E, B7, E.',
            skills: [1],
            chords: [
              { name: 'E', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,1,'1'],[2,0],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Fret B7 cleanly',
            title_es: 'Trastea B7 limpio',
            steps: [
          {
            label: 'Challenge 2 — Four-Finger B7', label_es: 'Reto 2 — B7 con cuatro dedos',
            text: '<ol><li>Put your index finger on the D string, fret 1.</li><li>Put your middle finger on the A string, fret 2.</li><li>Put your ring finger on the G string, fret 2.</li><li>Put your pinky on the high e string, fret 2.</li><li>Strum five strings, from the A string to the high e. Do not play the low E.</li><li>Play E, B7, E. Listen to B7 pull back to E.</li></ol>You\'ve got it when: all four fingers are down and every string you strum rings clean.',
            text_es: '<ol><li>Pon tu dedo índice en la cuerda Re, traste 1.</li><li>Pon tu dedo medio en la cuerda La, traste 2.</li><li>Pon tu dedo anular en la cuerda Sol, traste 2.</li><li>Pon tu meñique en la cuerda mi aguda, traste 2.</li><li>Rasguea cinco cuerdas, desde la cuerda La hasta la mi aguda. No toques la Mi grave.</li><li>Toca E, B7, E. Escucha cómo B7 tira de vuelta hacia E.</li></ol>Lo tienes cuando: los cuatro dedos están puestos y cada cuerda que rasgueas suena limpia.',
            hint: 'B7 has one extra note that makes it sound unfinished. It pulls toward E. That pull is called resolving.',
            hint_es: 'B7 tiene una nota extra que lo hace sonar inconcluso. Tira hacia E. Ese tirón se llama resolución.',
            stuck: 'Put down one finger at a time: index, middle, ring, then pinky. Check that the open B string still rings.',
            stuck_es: 'Pon un dedo a la vez: índice, medio, anular, y luego meñique. Revisa que la cuerda Si al aire siga sonando.',
            levelUp: 'Play E, B7, E, B7 at 60 BPM, one bar each.',
            levelUp_es: 'Toca E, B7, E, B7 a 60 BPM, un compás cada uno.',
            skills: [2],
            chords: [
              { name: 'B7', chord: [[6,'x'],[5,2,'2'],[4,1,'1'],[3,2,'3'],[2,0],[1,2,'4']], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'One-Minute Changes — try for a higher number',
            title_es: 'Cambios de un minuto — intenta superar tu número',
            steps: [
              {
                label: 'Challenge 3 — One-Minute Changes (E ↔ B7)', label_es: 'Reto 3 — Cambios de un minuto (E ↔ B7)',
                text: '<ol><li>Set the ⏱ Timer for 60 seconds.</li><li>Switch E, B7, E, B7 as many times as you can. Keep your middle finger on the A string, fret 2, the whole time.</li><li>Count only clean changes.</li></ol>You\'ve got it when: you make 20 clean E&rarr;B7 changes in one minute. Next goal: 30.',
                text_es: '<ol><li>Pon el ⏱ Temporizador en 60 segundos.</li><li>Cambia E, B7, E, B7 tantas veces como puedas. Mantén tu dedo medio en la cuerda La, traste 2, todo el tiempo.</li><li>Cuenta solo los cambios limpios.</li></ol>Lo tienes cuando: haces 20 cambios limpios de E&rarr;B7 en un minuto. Siguiente meta: 30.',
                hint: 'Your middle finger is in the same spot in both chords. Move the other three fingers around it. Keep the B string open.',
                hint_es: 'Tu dedo medio está en el mismo lugar en los dos acordes. Mueve los otros tres dedos a su alrededor. Deja la cuerda Si al aire.',
                stuck: 'Move slowly from E into B7 and back. Speed up when every landing is clean.',
                stuck_es: 'Muévete despacio de E a B7 y de vuelta. Acelera cuando cada llegada salga limpia.',
                levelUp: 'Strum each chord once before you switch. Or play E, Am, B7.',
                levelUp_es: 'Rasguea cada acorde una vez antes de cambiar. O toca E, Am, B7.',
                skills: [1, 2],
              },
              {
                label: 'Challenge — One Chord From Each Group', label_es: 'Reto — Un acorde de cada grupo',
                text: '<ol><li>Say "Group 1" and strum G four times.</li><li>Say "Group 2" and strum A four times.</li><li>Say "Group 3" and strum E four times.</li><li>Repeat at 60 BPM.</li></ol>You\'ve got it when: you play the loop three times without stopping and say each group before its chord.',
                text_es: '<ol><li>Di "Grupo 1" y rasguea G cuatro veces.</li><li>Di "Grupo 2" y rasguea A cuatro veces.</li><li>Di "Grupo 3" y rasguea E cuatro veces.</li><li>Repite a 60 BPM.</li></ol>Lo tienes cuando: tocas la vuelta tres veces sin detenerte y dices cada grupo antes de su acorde.',
                hint: 'Say the next group on beat 4, while you move to the next chord.',
                hint_es: 'Di el siguiente grupo en el tiempo 4, mientras te mueves al siguiente acorde.',
                stuck: 'Set the metronome to 50 BPM. Or strum each chord once and use the other three beats to move.',
                stuck_es: 'Pon el metrónomo a 50 BPM. O rasguea cada acorde una vez y usa los otros tres tiempos para moverte.',
                levelUp: 'Use C (Group 1), Bm (Group 2) and B7 (Group 3) instead.',
                levelUp_es: 'Usa C (Grupo 1), Bm (Grupo 2) y B7 (Grupo 3) en su lugar.',
                skills: [4],
                chords: [
                  { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
                  { name: 'A', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'1'],[2,2,'3'],[1,0]], position: 0 },
                  { name: 'E', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,1,'1'],[2,0],[1,0]], position: 0 }
                ]
              }
            ]
          },
          {
            title: 'Play your song from start to finish',
            title_es: 'Toca tu canción de principio a fin',
            steps: [
          {
            label: 'Challenge 4 — Full Run From Memory (assessment preparation)', label_es: 'Reto 4 — Pasada completa de memoria (preparación para la evaluación)',
            text: '<ol><li>Pick one song: <a href="tabs/let-it-be.html" target="_blank">"Let It Be"</a>, <a href="tabs/luna.html" target="_blank">"Luna"</a> or <a href="tabs/the-cure.html" target="_blank">&ldquo;the cure&rdquo;</a>.</li><li>Play it from memory, with no chart:<ul><li>"Let It Be": the C–G–Am–F loop 8 times, one bar per chord.</li><li>"Luna": the F–Am loop 8 times.</li><li>"the cure": the whole verse, then the whole chorus, two times.</li></ul></li><li>If you make a mistake, keep playing.</li></ol>You\'ve got it when: you play one full run with no stops.',
            text_es: '<ol><li>Elige una canción: <a href="tabs/let-it-be.html" target="_blank">"Let It Be"</a>, <a href="tabs/luna.html" target="_blank">"Luna"</a> o <a href="tabs/the-cure.html" target="_blank">&ldquo;the cure&rdquo;</a>.</li><li>Tócala de memoria, sin diagrama:<ul><li>"Let It Be": la vuelta C–G–Am–F 8 veces, un compás por acorde.</li><li>"Luna": la vuelta F–Am 8 veces.</li><li>"the cure": toda la estrofa, y luego todo el coro, dos veces.</li></ul></li><li>Si cometes un error, sigue tocando.</li></ol>Lo tienes cuando: tocas una pasada completa sin detenerte.',
            hint: 'Fix mistakes later, in slow practice.',
            hint_es: 'Corrige los errores después, en la práctica lenta.',
            skills: [5, 6]
          }
            ]
          },
          {
            kind: 'take-to-song',
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Luna", strummed (full-song version)', label_es: 'Reto — "Luna", rasgueada (versión de canción completa)',
                text: 'The full song is F · Am, with Dm making one brief passing appearance in the song\'s opening lines.<ol><li>Play two downbeat strums per bar at 60 BPM, building toward 70.</li><li>Sing or hum "Luna, dile tú" while you play — it\'s tricky!</li></ol>You\'ve got it when: a full verse and chorus with every change on the downbeat and the F ringing clean. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 4 of 5</a>.',
                text_es: 'La canción completa es F · Am, con Dm haciendo una sola aparición breve de paso en las primeras líneas de la canción.<ol><li>Toca dos rasgueos en el tiempo fuerte por compás a 60 BPM, subiendo hacia 70.</li><li>Canta o tararea "Luna, dile tú" mientras tocas — ¡es complicado!</li></ol>Lo tienes cuando: una estrofa y un coro completos con cada cambio en el tiempo fuerte y el F sonando limpio. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 4 de 5</a>.',
                hint: 'You met this vamp in Set 3 — now make it assessment-clean. F is the trickiest shape; keep your fingers arched and thumb behind the neck so all four strings you strum ring.',
                hint_es: 'Conociste este vamp en la Unidad 3 — ahora déjalo limpio para la evaluación. F es la forma más complicada; mantén tus dedos arqueados y el pulgar detrás del mástil para que las cuatro cuerdas que rasgueas suenen.',
                stuck: 'F is the tough one — loop Am → F on its own until the shape lands clean, then run the full F–Am (with the passing Dm in the song\'s opening lines).',
                stuck_es: 'F es el difícil — repite solo Am → F hasta que la forma caiga limpia, y luego corre el F–Am completo (con el Dm de paso en las primeras líneas de la canción).',
                levelUp: 'Try a down · down-up strum on each chord, or push to 70 BPM.',
                levelUp_es: 'Prueba un rasgueo abajo · abajo-arriba en cada acorde, o empuja a 70 BPM.',
                skills: [5, 6],
                chords: [
                  { name: 'F',  chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'Dm', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'2'],[2,3,'3'],[1,1,'1']], position: 0 }
                ],
              }
            ]
          },
          {
            title: 'Call & Response over a backing track',
            title_es: 'Llamada y respuesta sobre una pista de acompañamiento',
            steps: [
              {
                label: 'Challenge — Call & Response (your Module 4 wrap-up jam)', label_es: 'Reto — Llamada y respuesta (tu jam de cierre del Módulo 4)',
                text: 'Play along with the "the cure" backing track (recorded music to play over). In the intro and verse, each pair of chords plays twice: Am · C, Am · C, then F · C, F · C. One chord per bar.<ol><li>Open the <a href="tabs/the-cure.html" target="_blank">"the cure" Song Journey page</a>. Press &#x25B6; &#x1F3B5; Play along, then &#x1F422; Slow (60 BPM).</li><li>Call: the first time a pair plays, make up a strum rhythm for its two bars.</li><li>Response: when the pair plays again, strum the same rhythm.</li><li>Make up a new rhythm for the next call.</li></ol>You\'ve got it when: you play four calls and responses (16 bars) without stopping, every change on beat 1, and each response matches its call.',
                text_es: 'Toca junto con la pista de acompañamiento de "the cure" (música grabada para tocar encima). En la intro y la estrofa, cada par de acordes suena dos veces: Am · C, Am · C, y luego F · C, F · C. Un acorde por compás.<ol><li>Abre la <a href="tabs/the-cure.html" target="_blank">página de Recorrido de la canción de "the cure"</a>. Presiona &#x25B6; &#x1F3B5; Toca encima, y luego &#x1F422; Lento (60 BPM).</li><li>Llamada: la primera vez que suena un par, inventa un ritmo de rasgueo para sus dos compases.</li><li>Respuesta: cuando el par suena otra vez, rasguea el mismo ritmo.</li><li>Inventa un ritmo nuevo para la siguiente llamada.</li></ol>Lo tienes cuando: tocas cuatro llamadas y respuestas (16 compases) sin detenerte, cada cambio en el tiempo 1, y cada respuesta es igual a su llamada.',
                hint: 'Keep your strumming hand moving down-up the whole time. On the strums you leave out, move past the strings without touching them.',
                hint_es: 'Mantén tu mano de rasgueo moviéndose abajo-arriba todo el tiempo. En los rasgueos que dejas fuera, pasa sin tocar las cuerdas.',
                stuck: 'Start with four down-strums in each bar for the call. Answer with the same four. Then add one up-strum to the next call.',
                stuck_es: 'Empieza con cuatro rasgueos hacia abajo en cada compás para la llamada. Responde con los mismos cuatro. Luego agrega un rasgueo hacia arriba a la siguiente llamada.',
                levelUp: 'Press &#x1F422; Slow again to turn it off. Play the four pairs at full speed. Or take turns with a friend: one plays the call, the other plays the response.',
                levelUp_es: 'Presiona &#x1F422; Lento otra vez para apagarlo. Toca los cuatro pares a velocidad completa. O túrnate con un amigo: uno toca la llamada y el otro la respuesta.'
              }
            ]
          },
          {
            kind: 'reflection',
            title: 'Wrap-Up',
            title_es: 'Cierre',
            steps: [
              {
                label: 'Wrap-up: your pressure point', label_es: 'Cierre: tu punto débil bajo presión',
                text: 'After today, what\'s the one part of the song you\'re working on most likely to fall apart under pressure (recording light on, someone listening)? Type it below — that\'s exactly where your next practice starts.',
                text_es: 'Después de hoy, ¿cuál es la única parte de la canción en la que estás trabajando que más probablemente se desarme bajo presión (con la luz de grabación encendida, alguien escuchando)? Escríbelo abajo — ahí es exactamente donde empieza tu próxima práctica.',
              }
            ]
          }
        ]
      }
    },

    skills: [
      { id: 'm4w4-s1', text: 'Fret E major open chord cleanly — all 6 strings ring',
        text_es: 'Trastear el acorde E mayor al aire limpio — las 6 cuerdas suenan',
        gotItWhen: 'you strum all 6 strings and every one rings, including the open B string next to your index finger.',
        gotItWhen_es: 'rasgueas las 6 cuerdas y todas suenan, incluso la cuerda Si al aire junto a tu dedo índice.',
        practice: { type: 'playSeq', label: 'Hear E major (arpeggiated)', label_es: 'Escucha E mayor (arpegiado)', bpm: 60,
          notes: [40, 47, 52, 56, 59, 64] } },
      { id: 'm4w4-s2', text: 'Fret B7 open chord cleanly — 4 fingers, top five strings',
        text_es: 'Trastear el acorde B7 al aire limpio — 4 dedos, las cinco cuerdas más agudas',
        gotItWhen: 'you strum B7 from the A string to the high e, all five strings ring clear, and the low E stays silent.',
        gotItWhen_es: 'rasgueas B7 desde la cuerda La hasta la mi aguda, las cinco cuerdas suenan claras y la Mi grave queda en silencio.',
        practice: { type: 'mc', prompt: 'B7 has one note in it that a plain B chord does not. What does that extra note do?',
          prompt_es: 'B7 tiene una nota que un acorde B normal no tiene. ¿Qué hace esa nota extra?',
          choices: ['It makes the chord sound sad, like a minor chord', 'It adds tension that wants to move to E', 'It makes the chord louder', 'Nothing — it is just a different fingering'],
          choices_es: ['Hace que el acorde suene triste, como un acorde menor', 'Agrega tensión que quiere moverse hacia E', 'Hace que el acorde suene más fuerte', 'Nada — solo es una digitación distinta'], answer: 1,
          explain: 'That extra note is the seventh. It makes the chord sound unfinished, so it pulls toward E. That is why this set plays E→B7→E again and again. It does not make the chord minor: B7 still sounds bright. That pull to E is called resolving.',
          explain_es: 'Esa nota extra es la séptima. Hace que el acorde suene inconcluso, así que tira hacia E. Por eso esta unidad toca E→B7→E una y otra vez. No vuelve menor al acorde: B7 sigue sonando brillante. Ese tirón hacia E se llama resolución.' } },
      { id: 'm4w4-s4', text: 'Play one chord from each of the 3 chord groups',
        text_es: 'Tocar un acorde de cada uno de los 3 grupos de acordes',
        gotItWhen: 'you play one chord from each of Groups 1, 2 and 3 clean, and name each chord\'s group.',
        gotItWhen_es: 'tocas un acorde de cada uno de los Grupos 1, 2 y 3 limpio, y nombras el grupo de cada acorde.',
        practice: { type: 'mc', prompt: 'You want to play one chord from each of the three chord groups. Which three would you play?',
          prompt_es: 'Quieres tocar un acorde de cada uno de los tres grupos de acordes. ¿Cuáles tres tocarías?',
          choices: ['C, G and Am', 'D, A and Em', 'Am, D and E', 'C, F and B7'],
          choices_es: ['C, G y Am', 'D, A y Em', 'Am, D y E', 'C, F y B7'], answer: 2,
          explain: 'Group 1 is C, F, Am and G · Group 2 is D, A, Em and Bm · Group 3 is E and B7. Am, D and E takes one chord from each. C, G and Am are all Group 1. D, A and Em are all Group 2. C, F and B7 covers Groups 1 and 3 but never reaches Group 2.',
          explain_es: 'El Grupo 1 es C, F, Am y G · el Grupo 2 es D, A, Em y Bm · el Grupo 3 es E y B7. Am, D y E toma un acorde de cada uno. C, G y Am son todos del Grupo 1. D, A y Em son todos del Grupo 2. C, F y B7 cubre los Grupos 1 y 3 pero nunca llega al Grupo 2.' } },
      { id: 'm4w4-s5', journey: [{ song: 'let-it-be', layer: 4 }, { song: 'luna', layer: 4 }, { song: 'the-cure', layer: 4 }], text: 'Perform a core song from memory, all the way through without stopping',
        text_es: 'Interpretar una canción principal de memoria, de principio a fin sin detenerse',
        gotItWhen: 'you play your core song ("Let It Be", "Luna" or "the cure") from memory with no chart, and you keep playing in time after a mistake.',
        gotItWhen_es: 'tocas tu canción principal ("Let It Be", "Luna" o "the cure") de memoria sin diagrama, y sigues tocando a tiempo después de un error.',
        practice: { type: 'pr', prompt: '<ol><li>Play your core song from memory, start to finish, without stopping.</li><li>Log how many full runs you played with no stops today.</li></ol>',
          prompt_es: '<ol><li>Toca tu canción principal de memoria, de principio a fin, sin detenerte.</li><li>Anota cuántas pasadas completas sin paradas tocaste hoy.</li></ol>',
          unit: 'count', placeholder: 'e.g. 2 runs — try for a higher number', placeholder_es: 'p. ej. 2 pasadas — intenta superarlo' } },
      { id: 'm4w4-s6', text: 'Keep a steady strum pattern through a whole song',
        text_es: 'Mantener un patrón de rasgueo constante durante toda una canción',
        gotItWhen: 'you keep the same strum pattern through a whole song, including the hard chord changes.',
        gotItWhen_es: 'mantienes el mismo patrón de rasgueo durante toda una canción, incluso en los cambios de acorde difíciles.',
        practice: { type: 'pr', prompt: '<ol><li>Play a full verse and chorus of your song and count the chord changes you made WITHOUT breaking the strum pattern.</li><li>Log your best count.</li></ol>',
          prompt_es: '<ol><li>Toca una estrofa y un coro completos de tu canción y cuenta los cambios de acorde que hiciste SIN romper el patrón de rasgueo.</li><li>Anota tu mejor cuenta.</li></ol>',
          unit: 'count', placeholder: 'e.g. 10 changes — try for a higher number', placeholder_es: 'p. ej. 10 cambios — intenta superarlo' } }
    ]
  }

); // end module-4.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[4] = [
      { name: '"Let It Be" — The Beatles', meta: 'Verse & chorus full chord strum · C–G–Am–F', meta_es: 'Rasgueo completo de estrofa y coro · C–G–Am–F', type: 'Core', core: true, journeyUrl: 'tabs/let-it-be.html',
        originalUrl: 'https://www.youtube.com/watch?v=CGj85pVzRJs',
        tutorialUrl: 'https://www.youtube.com/watch?v=_Kw4subj5z8',
        backingUrl: 'audio/the-beatles-let-it-be-backing-C-71bpm-440hz-rhythm-down.mp3',
        backingKey: 'C' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Full performance with open chords', meta_es: 'Interpretación completa con acordes al aire', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"the cure" — Olivia Rodrigo', meta: 'Open-chord play-along · verse Am–C–Am–C, F–C–F–C · chorus Dm–F–C–G', meta_es: 'Toca junto con acordes al aire · estrofa Am–C–Am–C, F–C–F–C · coro Dm–F–C–G', type: 'Core', core: true, journeyUrl: 'tabs/the-cure.html',
        originalUrl: 'https://www.youtube.com/watch?v=B402rKl4bUg',
        tutorialUrl: 'https://www.youtube.com/watch?v=adW_zSkClaY' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: 'Full-song performance · F–Am–Dm', meta_es: 'Interpretación de la canción completa · F–Am–Dm', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
      { name: '"Happy Birthday"', meta: 'Full chord arrangement — all groups reviewed (optional)', meta_es: 'Arreglo completo de acordes — repasa todos los grupos (opcional)', type: 'Supp', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w&start=46' },
      { name: '"Seven Nation Army" — The White Stripes', meta: '◐ Strummed Em–G–D–C adaptation (a riff song played as chords, in a different style than the original on purpose)', meta_es: '◐ Adaptación rasgueada Em–G–D–C (una canción de riff tocada como acordes, a propósito en un estilo distinto al original)', type: 'Core', core: true, journeyUrl: 'tabs/seven-nation-army.html',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Open-chord play-along · D–C–G at full record tempo', meta_es: 'Toca junto con acordes al aire · D–C–G al tempo real de la grabación', type: 'Core', core: true, journeyUrl: 'tabs/sweet-child-o-mine.html',
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0ASVeXINKYM&start=282&end=938' },
      { name: '"Riptide" — Vance Joy', meta: 'Am–G–C — three chords', meta_es: 'Am–G–C — tres acordes', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=uJ_1HMAGb4k',
        tutorialUrl: 'https://www.youtube.com/watch?v=4pmK0x6mY0I' },
      { name: '"No Woman No Cry" — Bob Marley', meta: 'C–G–Am–F — beautiful and rhythmic', meta_es: 'C–G–Am–F — hermosa y rítmica', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=IT8XvzIfi4U',
        tutorialUrl: 'https://www.youtube.com/watch?v=qK4NutAn3rg' },
      { name: '"Ella Baila Sola" — Eslabon Armado × Peso Pluma', meta: 'Capo 1 · C–D–B7–Em vamp — current sierreño hit', meta_es: 'Capo 1 · vamp C–D–B7–Em — éxito actual de sierreño', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=lZiaYpD9ZrI',
        tutorialUrl: 'https://www.youtube.com/watch?v=fciArjRISjc' },
      { name: '"Hallelujah" — Leonard Cohen', meta: 'C–Am–F–G — beautiful song to play start to finish', meta_es: 'C–Am–F–G — hermosa canción para tocar de principio a fin', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=ttEMYvpoR-k',
        tutorialUrl: 'https://www.youtube.com/watch?v=eFLJUspLfnk' },
      { name: '"Shallow" — Lady Gaga', meta: 'Em–D–G–C–Am–D — challenge song', meta_es: 'Em–D–G–C–Am–D — canción de reto', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=bo_efYhYU2A',
        tutorialUrl: 'https://www.youtube.com/watch?v=wocQ8UHN5kQ' }
    ];

MODULE_REVIEWS[4] = {
  moduleNum: 4,
  module: 'Open Chords',
  module_es: 'Acordes al aire',
  skills: [
    { id: 'mr4-s1', text: 'I can read any chord diagram and place my fingers on the right strings, frets, and finger numbers without looking anything up',
      text_es: 'Puedo leer cualquier diagrama de acorde y colocar mis dedos en las cuerdas, trastes y números de dedo correctos sin buscar nada', set: 'm4w1' },
    { id: 'mr4-s2', text: 'I can fret Am and Em cleanly — every string in each rings with no buzz',
      text_es: 'Puedo trastear Am y Em limpios — cada cuerda de ambos suena sin zumbido', set: 'm4w1' },
    { id: 'mr4-s3', text: 'I can fret Group 1 chords (C, G, Am, and the simplified F) with clean tone',
      text_es: 'Puedo trastear los acordes del Grupo 1 (C, G, Am, y el F simplificado) con tono limpio', set: 'm4w2' },
    { id: 'mr4-s6', text: 'I can keep a steady down-up (1 + 2 + 3 + 4 +) strumming pattern through a chord change',
      text_es: 'Puedo mantener un patrón de rasgueo abajo-arriba constante (1 + 2 + 3 + 4 +) a través de un cambio de acorde', set: 'm4w2' },
    { id: 'mr4-s4', text: 'I can fret Group 2 chords (D, A, Em, and the four-finger Bm) with clean tone',
      text_es: 'Puedo trastear los acordes del Grupo 2 (D, A, Em, y el Bm de cuatro dedos) con tono limpio', set: 'm4w3' },
    { id: 'mr4-s9', text: 'I can draw three chords at random from the deck and play them in an 8-bar progression at 70 BPM with clean changes',
      text_es: 'Puedo sacar tres acordes al azar de la baraja y tocarlos en una progresión de 8 compases a 70 BPM con cambios limpios', set: 'm4w3' },
    { id: 'mr4-s5', text: 'I can fret Group 3 chords (E and B7) with clean tone',
      text_es: 'Puedo trastear los acordes del Grupo 3 (E y B7) con tono limpio', set: 'm4w4' },
    { id: 'mr4-s8', text: 'I can perform a core song from memory, start to finish',
      text_es: 'Puedo interpretar una canción principal de memoria, de principio a fin', set: 'm4w4' }
  ],
  assessItems: [
    'Run the chord deck (Set 3) for three chords at random and play them in an 8-bar progression at 70 BPM with clean changes in time',
    'Record (or perform for someone) one core song from memory — "Let It Be", "Luna", or "the cure" — with clean tone and smooth chord changes, then listen back and check it',
    'Name the chords on an unlabelled chord chart',
    'Write a few sentences (not graded) on what you can play now that you could not play when you started this class'
  ],
  assessItems_es: [
    'Corre la baraja de acordes (Unidad 3) para elegir tres acordes al azar y tócalos en una progresión de 8 compases a 70 BPM con cambios limpios a tiempo',
    'Graba (o interpreta para alguien) una canción principal de memoria — "Let It Be", "Luna", o "the cure" — con tono limpio y cambios de acorde suaves, y luego escúchala y revísala',
    'Nombra los acordes en un diagrama de acordes sin etiquetar',
    'Escribe unas oraciones (no calificadas) sobre lo que puedes tocar ahora y no podías cuando empezaste esta clase'
  ],
  forward: 'In <strong>Module 5</strong> you learn pentatonic scales (five-note scales) and play your first solos over these same songs. Then <strong>Module 6</strong> brings these chords back with new strum patterns.',
  forward_es: 'En el <strong>Módulo 5</strong> aprendes escalas pentatónicas (escalas de cinco notas) y tocas tus primeros solos sobre estas mismas canciones. Después, el <strong>Módulo 6</strong> trae de vuelta estos acordes con patrones de rasgueo nuevos.',
  standards: ['Pr.4a', 'Pr.5a', 'Pr.5b', 'Pr.6a', 'Re.7a', 'Re.9a', 'Cn.11b']
};
