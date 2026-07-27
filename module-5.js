// ============================================================
//  MODULE 5 — Open Chords
//  Edit this file to change Module 5 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm5w1',
    label: 'Set 1',
    locked: false,
    module: 'Open Chords',
    moduleNum: 5,
    unit: 'Module 5 · Open Chords',
    unit_es: 'Módulo 5 · Acordes al aire',
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
            text: 'Watch: <a href="https://youtu.be/4-JTCASlh-w" target="_blank">How to Read TAB & Chord Boxes – JustinGuitar</a> (0:00–4:00).',
            text_es: 'Mira: <a href="https://youtu.be/4-JTCASlh-w" target="_blank">How to Read TAB & Chord Boxes – JustinGuitar</a> (0:00–4:00).',
            hint: 'Pause when he shows a diagram and look at it yourself. What does the X mean? What does the O mean? What do the numbers in the dots tell you?',
            hint_es: 'Pausa cuando muestra un diagrama y míralo tú mismo. ¿Qué significa la X? ¿Qué significa la O? ¿Qué te dicen los números dentro de los puntos?',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'On a chord diagram, an X above a string means:',
              prompt_es: 'En un diagrama de acorde, una X sobre una cuerda significa:',
              answer: 0,
              explain: 'An X means don\'t play that string at all — skip it entirely so it stays silent. An O (not X) means play it open.',
              explain_es: 'Una X significa que no toques esa cuerda para nada — sáltatela por completo para que quede en silencio. Una O (no X) significa tocarla al aire.',
              choices: [
              'Do not play that string',
              'Play that string with your thumb',
              'Play it muted (palm-mute — rest the side of your strumming hand on the strings)',
              'It is optional'
            ],
              choices_es: [
              'No toques esa cuerda',
              'Toca esa cuerda con tu pulgar',
              'Tócala silenciada (silenciado con la palma — apoya el borde de tu mano de rasgueo sobre las cuerdas)',
              'Es opcional'
            ] }
          },
          {
            label: 'Watch: first chords Em & Asus2', label_es: 'Mira: primeros acordes Em y Asus2',
            text: 'Watch: <a href="https://youtu.be/HNSaXAe8tyg" target="_blank">Your Very First Chords: Em & Asus2 – Marty Music</a> (0:00–5:00).',
            text_es: 'Mira: <a href="https://youtu.be/HNSaXAe8tyg" target="_blank">Your Very First Chords: Em & Asus2 – Marty Music</a> (0:00–5:00).',
            hint: 'Try placing your fingers as he shows Em, then strum it before watching more. Does every string ring? If not, check which finger is accidentally muting a string. Keep your fretting hand relaxed — a tense hand makes the notes sound bad.',
            hint_es: 'Prueba colocar tus dedos como él muestra para Em, y luego rasguéalo antes de seguir viendo. ¿Suenan todas las cuerdas? Si no, revisa qué dedo está silenciando una cuerda por accidente. Mantén tu mano de trastear relajada — una mano tensa hace que las notas suenen mal.',
            skills: [4],
            response: { type: 'short', placeholder: 'When you strummed Em, did every string ring clean? If not, which one was muted and why?',
              placeholder_es: 'Cuando rasgueaste Em, ¿sonaron limpias todas las cuerdas? Si no, ¿cuál estaba silenciada y por qué?' }
          },
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
          {
            label: 'Wrap-up: chord diagram parts', label_es: 'Cierre: partes del diagrama',
            text: 'Station Wrap-Up — pause and think: of everything on a chord diagram (X, O, dots, finger numbers), which part still feels least automatic when you sit down to read one?',
            text_es: 'Cierre de la estación — pausa y piensa: de todo lo que hay en un diagrama de acorde (X, O, puntos, números de dedo), ¿qué parte todavía se siente menos automática cuando te sientas a leer uno?',
            response: { type: 'short', placeholder: 'e.g. I still pause on which number means which finger',
              placeholder_es: 'p. ej. todavía me detengo en pensar qué número es qué dedo' }
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
            text: '<ol><li>Fret Am (index finger on string 2, fret 1 · middle finger on string 4, fret 2 · ring finger on string 3, fret 2).</li><li>Strum strings 1–5 (not the low E).</li></ol>You\'ve got it when: every string rings cleanly — check each one by plucking it.',
            text_es: '<ol><li>Trastea Am (dedo índice en la cuerda 2, traste 1 · dedo medio en la cuerda 4, traste 2 · dedo anular en la cuerda 3, traste 2).</li><li>Rasguea las cuerdas 1–5 (no la Mi grave).</li></ol>Lo tienes cuando: cada cuerda suena limpia — revisa cada una pulsándola.',
            hint: 'Press just behind the frets, not on them. Curve your fingers so they don\'t accidentally touch neighboring strings, and keep your hand relaxed — a tense hand makes the notes sound bad. Check each string individually by plucking it.',
            hint_es: 'Presiona justo detrás de los trastes, no sobre ellos. Curva tus dedos para que no toquen por accidente las cuerdas vecinas, y mantén tu mano relajada — una mano tensa hace que las notas suenen mal. Revisa cada cuerda individualmente pulsándola.',
            stuck: 'Get strings 2 and 3 ringing first (index + ring), then add the middle finger. Most buzz comes from a finger lying too flat — sit up on the very tip.',
            stuck_es: 'Haz sonar primero las cuerdas 2 y 3 (índice + anular), y luego agrega el dedo medio. La mayoría del zumbido viene de un dedo demasiado plano — apóyate justo en la punta.',
            levelUp: 'Lift all three fingers, then drop the whole shape at once and strum — aim for a clean chord on the first try.',
            levelUp_es: 'Levanta los tres dedos, y luego suelta toda la forma de una vez y rasguea — apunta a un acorde limpio en el primer intento.',
            skills: [3, 5],
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
            text: '<ol><li>Fret Em (middle finger on string 5, fret 2 · ring finger on string 4, fret 2).</li><li>Strum all 6 strings.</li></ol>You\'ve got it when: a full, open, buzz-free Em — this is your warm-up chord.',
            text_es: '<ol><li>Trastea Em (dedo medio en la cuerda 5, traste 2 · dedo anular en la cuerda 4, traste 2).</li><li>Rasguea las 6 cuerdas.</li></ol>Lo tienes cuando: un Em completo, abierto, sin zumbido — este es tu acorde de calentamiento.',
            hint: 'Em is the easiest chord on guitar. Use it to warm up before harder chords. It should sound full and open.',
            hint_es: 'Em es el acorde más fácil de la guitarra. Úsalo para calentar antes de acordes más difíciles. Debe sonar completo y abierto.',
            stuck: 'If a string buzzes, check that both fingers are arched up on their tips and not leaning on the open strings next door.',
            stuck_es: 'Si una cuerda zumba, revisa que ambos dedos estén arqueados sobre sus puntas y no apoyados en las cuerdas al aire de al lado.',
            levelUp: 'Switch Em→Am→Em without looking at your fingers — feel the shape instead of watching it.',
            levelUp_es: 'Cambia Em→Am→Em sin mirar tus dedos — siente la forma en vez de mirarla.',
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
            text: 'At 60 BPM, 4 down-strums per bar:<ol><li>Play 2 bars of Am.</li><li>Play 2 bars of Em, and repeat.</li></ol>You\'ve got it when: change chords right on beat 1 every time — keep strumming through any fumble.',
            text_es: 'A 60 BPM, 4 rasgueos hacia abajo por compás:<ol><li>Toca 2 compases de Am.</li><li>Toca 2 compases de Em, y repite.</li></ol>Lo tienes cuando: cambias de acorde justo en el tiempo 1 cada vez — sigue rasgueando aunque falles.',
            hint: 'Even if the chord isn\'t perfect, keep strumming in time. Stopping to fix a note is the #1 habit to avoid. Fix it between bars, not mid-bar. Set the ⏱ Timer for 2 minutes and loop the switch until it beeps.',
            hint_es: 'Aunque el acorde no salga perfecto, sigue rasgueando a tiempo. Detenerte a corregir una nota es el hábito número uno que debes evitar. Corrígelo entre compases, no a mitad de uno. Pon el ⏱ Temporizador en 2 minutos y repite el cambio hasta que suene.',
            stuck: 'Your index finger barely moves between Am and Em — anchor it: keep that finger pressed down and still while the others move. Drop to 50 BPM if 60 feels rushed.',
            stuck_es: 'Tu dedo índice casi no se mueve entre Am y Em — ánclalo: mantenlo presionado y quieto mientras los otros se mueven. Baja a 50 BPM si 60 se siente apurado.',
            levelUp: 'Speed up to 70 BPM, or play a down-up strum on each bar instead of straight downs.',
            levelUp_es: 'Acelera a 70 BPM, o toca un rasgueo abajo-arriba en cada compás en vez de solo rasgueos hacia abajo.',
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
                text: '<ol><li>Set the ⏱ Timer for 60 seconds.</li><li>Switch Am→Em→Am→Em as many times as you can. Every CLEAN change counts; a buzzy or missed one doesn\'t.</li></ol>You\'ve got it when: count your clean changes and type the number below — try for a higher number next time. (Over 20 is a good result for your first day on chords.)',
                text_es: '<ol><li>Pon el ⏱ Temporizador en 60 segundos.</li><li>Cambia Am→Em→Am→Em tantas veces como puedas. Cada cambio LIMPIO cuenta; uno con zumbido o fallado no.</li></ol>Lo tienes cuando: cuentas tus cambios limpios y escribes el número abajo — intenta superarlo la próxima vez. (Más de 20 es un buen resultado para tu primer día con acordes.)',
                hint: 'This is the classic chord-change speed test. Quality first: a clean change you can count is better than a blurry one you can\'t.',
                hint_es: 'Esta es la prueba clásica de velocidad de cambio de acorde. Calidad primero: un cambio limpio que puedas contar es mejor que uno confuso que no puedas.',
                stuck: 'Keep your index finger planted (it barely moves between Am and Em) and move only the other fingers. Slow down until every change rings.',
                stuck_es: 'Mantén tu dedo índice plantado (casi no se mueve entre Am y Em) y mueve solo los otros dedos. Baja la velocidad hasta que cada cambio suene limpio.',
                levelUp: 'Add one strum on each chord before you switch, or swap in Am→C instead.',
                levelUp_es: 'Agrega un rasgueo en cada acorde antes de cambiar, o cambia a Am→C en su lugar.',
                skills: [5, 6],
                response: { type: 'short', prompt: 'Personal record — clean Am↔Em changes in 60 seconds. Your count today?', prompt_es: 'Récord personal — cambios limpios Am↔Em en 60 segundos. ¿Tu cuenta hoy?', placeholder: 'e.g. 22 — try for a higher number next time', placeholder_es: 'p. ej. 22 — intenta superarlo la próxima vez' }
              }
            ]
          },
          {
            title: 'My Practice Routine — weekly check-in (never graded)',
            title_es: 'Mi rutina de práctica — check-in semanal (nunca se califica)',
            steps: [
              {
                label: 'Plan your practice', label_es: 'Planea tu práctica',
                text: 'Plan your practice — this one\'s just for you, never graded. Take two minutes to update your routine:<ol><li>One thing you want to get better at.</li><li>When and where you\'ll practice this week.</li><li>How last week\'s plan went.</li></ol>Same check-in you\'ve kept since Module 1 — we keep it going through the whole course.',
                text_es: 'Planea tu práctica — esta parte es solo para ti, nunca se califica. Tómate dos minutos para actualizar tu rutina:<ol><li>Una cosa en la que quieres mejorar.</li><li>Cuándo y dónde vas a practicar esta semana.</li><li>Cómo te fue con el plan de la semana pasada.</li></ol>El mismo check-in que has mantenido desde el Módulo 1 — lo seguimos manteniendo durante todo el curso.',
                hint: 'No wrong answers — even five minutes a day is better than one long rushed session. You\'re building a habit you\'ll actually keep.',
                hint_es: 'No hay respuestas incorrectas — hasta cinco minutos al día es mejor que una sola sesión larga y apurada. Estás construyendo un hábito que de verdad vas a mantener.',
                response: { type: 'short', placeholder: '1) One thing to improve   2) When & where I\'ll practice   3) How last week went', placeholder_es: '1) Algo que quiero mejorar   2) Cuándo y dónde voy a practicar   3) Cómo me fue la semana pasada' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: clean vs. switching', label_es: 'Cierre: limpio vs. cambiar',
                text: 'Which was harder today — getting each chord to ring clean, or switching between them in time? Type the one thing you\'ll drill (practice over and over) first next session.',
                text_es: '¿Qué fue más difícil hoy — lograr que cada acorde sonara limpio, o cambiar entre ellos a tiempo? Escribe la primera cosa que vas a ejercitar (practicar una y otra vez) la próxima sesión.',
                response: { type: 'short', placeholder: 'e.g. Am keeps buzzing on string 3 — I\'ll start there', placeholder_es: 'p. ej. Am sigue zumbando en la cuerda 3 — empezaré por ahí' }
              }
            ]
          },
          {
            title: 'Mystery Chart — name the shape with no label',
            title_es: 'Diagrama misterioso — nombra la forma sin etiqueta',
            steps: [
              {
                label: 'Challenge — Mystery Chart', label_es: 'Reto — Diagrama misterioso',
                text: 'The two diagrams below have NO names. This is exactly the assessment task — naming chords on an unlabelled chart.<ol><li>Look at the FIRST (left) one only — which string is muted, which are open, and where do the fretted fingers sit?</li><li>Read it, then answer which chord it is.</li></ol>',
                text_es: 'Los dos diagramas de abajo NO tienen nombre. Esta es exactamente la tarea de evaluación — nombrar acordes en un diagrama sin etiquetar.<ol><li>Mira solo el PRIMERO (izquierda) — ¿qué cuerda está silenciada, cuáles están al aire, y dónde se colocan los dedos trasteados?</li><li>Léelo, y luego responde qué acorde es.</li></ol>',
                hint: 'Read it the way Set 1 taught: check string 6 first (X or open?), then find the fretted dots. The first shape mutes the low E (X on string 6), leaves string 5 open, and frets strings 4 & 3 at fret 2 with a finger on string 2, fret 1. The second shape plays all six strings, with just two fingers at fret 2 on strings 5 & 4.',
                hint_es: 'Léelo como te enseñó la Unidad 1: revisa primero la cuerda 6 (¿X o al aire?), y luego busca los puntos trasteados. La primera forma silencia la Mi grave (X en la cuerda 6), deja la cuerda 5 al aire, y trastea las cuerdas 4 y 3 en el traste 2 con un dedo en la cuerda 2, traste 1. La segunda forma toca las seis cuerdas, con solo dos dedos en el traste 2 en las cuerdas 5 y 4.',
                stuck: 'Compare the two lowest strings. One diagram has an X on string 6 — don\'t play it; the other plays string 6 open. That single difference tells these two shapes apart.',
                stuck_es: 'Compara las dos cuerdas más graves. Un diagrama tiene una X en la cuerda 6 — no la toques; el otro toca la cuerda 6 al aire. Esa única diferencia distingue estas dos formas.',
                skills: [1, 6],
                chords: [
                  { chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
                  { chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 }
                ],
                response: { type: 'mc', prompt: 'The FIRST (left) unlabelled diagram is which chord?',
                  prompt_es: 'El PRIMER diagrama (izquierda), sin etiquetar, ¿qué acorde es?',
                  answer: 0,
                  explain: 'It\'s Am. The giveaways: string 6 is muted (X), string 5 is open (that open A is the root the chord is named after), and the fingers sit on strings 4 & 3 at fret 2 plus string 2 at fret 1. The second diagram is Em — it plays all six strings with its two fingers on strings 5 & 4.',
                  explain_es: 'Es Am. Las pistas: la cuerda 6 está silenciada (X), la cuerda 5 está al aire (esa A al aire es la raíz que le da nombre al acorde), y los dedos van en las cuerdas 4 y 3 en el traste 2 más la cuerda 2 en el traste 1. El segundo diagrama es Em — toca las seis cuerdas con sus dos dedos en las cuerdas 5 y 4.',
                  choices: ['Am', 'Em', 'C major', 'G major'],
                  choices_es: ['Am', 'Em', 'C mayor', 'G mayor'] }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Reads a chord diagram correctly · Identifies X, O, and finger numbers on chart · Frets Am cleanly · Frets Em cleanly · Strums 4 beats per bar in time · Finds any chord shown on a chart',
      goal_es: 'Lee correctamente un diagrama de acorde · Identifica X, O y números de dedo en el diagrama · Trastea Am limpio · Trastea Em limpio · Rasguea 4 tiempos por compás a tiempo · Encuentra cualquier acorde mostrado en un diagrama',
      performance: 'Solo: record yourself strumming Am for 4 bars, then Em for 4 bars, counting aloud at 60 BPM. Listen back for clean tone on every string.',
      selfCheck: 'Can you read a chord diagram and find the right fingers without help? Can you strum Am and Em with no buzzing?',
      selfCheck_es: '¿Puedes leer un diagrama de acorde y encontrar los dedos correctos sin ayuda? ¿Puedes rasguear Am y Em sin zumbido?',
      standards: ['Re.7a', 'Pr.4a']
    },

    skills: [
      { id: 'm5w1-s1', text: 'Read a chord diagram: identify X (mute), O (open), dots (finger placement), and numbers (which finger)',
        text_es: 'Leer un diagrama de acorde: identificar X (silenciar), O (al aire), puntos (colocación de dedos), y números (qué dedo)',
        gotItWhen: 'you can open a chord diagram you\'ve never seen and put your fingers on the right strings, frets, and finger numbers without looking anything up.',
        gotItWhen_es: 'puedes abrir un diagrama de acorde que nunca has visto y colocar tus dedos en las cuerdas, trastes y números de dedo correctos sin buscar nada.',
        practice: { type: 'mc', prompt: 'On a chord diagram, what does an "X" above a string mean?',
          prompt_es: 'En un diagrama de acorde, ¿qué significa una "X" sobre una cuerda?',
          choices: ['Play that string open', 'Do not play that string', 'That\'s where finger 1 goes', 'Play that string twice'],
          choices_es: ['Toca esa cuerda al aire', 'No toques esa cuerda', 'Ahí va el dedo 1', 'Toca esa cuerda dos veces'], answer: 1 } },
      { id: 'm5w1-s2', text: 'Explain the difference between a chord chart, TAB, and standard notation',
        text_es: 'Explicar la diferencia entre un diagrama de acorde, TAB y la notación estándar',
        gotItWhen: 'you can look at all three and say which is which — and explain in one sentence what each one tells you.',
        gotItWhen_es: 'puedes ver los tres y decir cuál es cuál — y explicar en una oración qué te dice cada uno.',
        practice: { type: 'mc', prompt: 'Which one shows finger positions for a chord shape, but NOT a sequence of notes to play?',
          prompt_es: '¿Cuál muestra las posiciones de los dedos para la forma de un acorde, pero NO una secuencia de notas para tocar?',
          choices: ['A chord diagram', 'TAB', 'Standard notation', 'All three show note sequences'],
          choices_es: ['Un diagrama de acorde', 'TAB', 'Notación estándar', 'Los tres muestran secuencias de notas'], answer: 0 } },
      { id: 'm5w1-s3', text: 'Fret Am cleanly — every string rings with no buzzing',
        text_es: 'Trastear Am limpio — cada cuerda suena sin zumbido',
        gotItWhen: 'you pluck each of the 5 strings in Am individually and every one rings clear — no buzz, no muffled string.',
        gotItWhen_es: 'pulsas cada una de las 5 cuerdas de Am individualmente y todas suenan claras — sin zumbido, sin cuerdas apagadas.',
        practice: { type: 'playSeq', label: 'Hear Am chord (arpeggiated)', label_es: 'Escucha el acorde Am (arpegiado)', bpm: 60,
          notes: [45, 52, 57, 60, 64] } },
      { id: 'm5w1-s4', text: 'Fret Em cleanly — all 6 strings ring open and full',
        text_es: 'Trastear Em limpio — las 6 cuerdas suenan abiertas y completas',
        gotItWhen: 'you strum all 6 strings and the chord sounds full and open — no string is accidentally muted by a neighboring finger.',
        gotItWhen_es: 'rasgueas las 6 cuerdas y el acorde suena completo y abierto — ninguna cuerda queda silenciada por accidente por un dedo vecino.',
        practice: { type: 'playSeq', label: 'Hear Em chord (arpeggiated)', label_es: 'Escucha el acorde Em (arpegiado)', bpm: 60,
          notes: [40, 47, 52, 55, 59, 64] } },
      { id: 'm5w1-s5', text: 'Strum 4 down-strums per bar in time at 60 BPM',
        text_es: 'Rasguear 4 golpes hacia abajo por compás a tiempo a 60 BPM',
        gotItWhen: 'your strums land on beats 1, 2, 3, 4 with the metronome at 60 BPM and you can keep it going for at least 8 bars without drifting.',
        gotItWhen_es: 'tus rasgueos caen en los tiempos 1, 2, 3, 4 con el metrónomo a 60 BPM y puedes mantenerlo por al menos 8 compases sin desviarte.',
        practice: { type: 'pr', prompt: '<ol><li>Metronome at 60 BPM: strum 4 down-strums per bar.</li><li>Count how many bars in a row every strum lands with the click.</li><li>Log your best streak — 8 bars is the goal.</li></ol>',
          prompt_es: '<ol><li>Metrónomo a 60 BPM: rasguea 4 golpes hacia abajo por compás.</li><li>Cuenta cuántos compases seguidos logras con cada rasgueo cayendo con el clic.</li><li>Anota tu mejor racha — la meta es 8 compases.</li></ol>',
          unit: 'count', placeholder: 'e.g. 8 bars — try for a longer streak', placeholder_es: 'p. ej. 8 compases — intenta una racha más larga' } },
      { id: 'm5w1-s6', text: 'Identify and fret any chord shown on a chord chart',
        text_es: 'Identificar y trastear cualquier acorde mostrado en un diagrama de acordes',
        gotItWhen: 'you can read any chord diagram in the songbook and play it without having to look up the chord name.',
        gotItWhen_es: 'puedes leer cualquier diagrama de acorde del cancionero y tocarlo sin tener que buscar el nombre del acorde.',
        practice: { type: 'mc', prompt: 'You see a "3" written inside one of the dots on a chord diagram. What does it tell you?',
          prompt_es: 'Ves un "3" escrito dentro de uno de los puntos de un diagrama de acorde. ¿Qué te indica?',
          choices: ['Play it on the 3rd fret', 'Use your 3rd finger (ring)', 'Hold the chord for 3 beats', 'It\'s a 3-finger chord'],
          choices_es: ['Tócalo en el traste 3', 'Usa tu dedo 3 (anular)', 'Sostén el acorde por 3 tiempos', 'Es un acorde de 3 dedos'], answer: 1 } }
    ]
  },

  {
    id: 'm5w2',
    songThread: [{ name: '"Let It Be"', journey: 'tabs/let-it-be.html', layer: 5, note: 'the real chords — C, G, Am, F' }, { name: '"All Along the Watchtower"', journey: 'tabs/all-along-the-watchtower.html', layer: 5, note: 'the full song with open chords' }],
    label: 'Set 2',
    locked: false,
    module: 'Open Chords',
    moduleNum: 5,
    unit: 'Module 5 · Open Chords',
    unit_es: 'Módulo 5 · Acordes al aire',
    title: 'Set 2',
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
            text: 'Watch: <a href="https://youtu.be/RBYqdBqogo4" target="_blank">The C Chord (BC-132) – JustinGuitar</a> (0:00–4:00).',
            text_es: 'Mira: <a href="https://youtu.be/RBYqdBqogo4" target="_blank">The C Chord (BC-132) – JustinGuitar</a> (0:00–4:00).',
            hint: 'He shows the "perfect" chord change technique. Watch how he prepares the next chord shape before strumming it. Anticipation is the secret.',
            hint_es: 'Él muestra la técnica del cambio de acorde "perfecto". Fíjate cómo prepara la siguiente forma de acorde antes de rasguearla. La anticipación es el secreto.',
            skills: [1, 2, 3, 4],
            response: { type: 'mc', prompt: 'What is the "secret" to clean chord changes, according to the video?',
              prompt_es: 'Según el video, ¿cuál es el "secreto" para cambios de acorde limpios?',
              answer: 0,
              explain: 'Anticipate the next shape — start moving your fingers toward it before you finish strumming the current chord. Speed comes from preparation, not from rushing.',
              explain_es: 'Anticipa la siguiente forma — empieza a mover tus dedos hacia ella antes de terminar de rasguear el acorde actual. La velocidad viene de la preparación, no de apurarte.',
              choices: [
              'Prepare (anticipate) the next chord shape before you strum it',
              'Strum harder so any missed notes are hidden',
              'Use only your index finger',
              'Memorize each chord with your eyes closed'
            ],
              choices_es: [
              'Prepara (anticipa) la siguiente forma de acorde antes de rasguearla',
              'Rasguea más fuerte para que se escondan las notas falladas',
              'Usa solo tu dedo índice',
              'Memoriza cada acorde con los ojos cerrados'
            ] }
          },
          {
            label: 'Watch: a pain-free F chord', label_es: 'Mira: el acorde F sin dolor',
            text: 'Watch: <a href="https://www.youtube.com/watch?v=vUNxt5EvXv8" target="_blank">Pain Free F Chord for Beginners – Lauren Bateman (0:00–4:00)</a>.',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=vUNxt5EvXv8" target="_blank">Pain Free F Chord for Beginners – Lauren Bateman (0:00–4:00)</a>.',
            hint: 'The F chord is the hardest thing for beginners. The simplified version (xx3211) avoids the full barre (pressing one finger flat across several strings). Use this until it\'s clean, then worry about the barre version.',
            hint_es: 'El acorde F es lo más difícil para los principiantes. La versión simplificada (xx3211) evita la cejilla completa (presionar un dedo plano a lo largo de varias cuerdas). Usa esta hasta que salga limpia, y luego preocúpate por la versión con cejilla.',
            skills: [2],
            response: { type: 'short', placeholder: 'Which version of the F chord are you starting with (full barre or simplified)? Why?',
              placeholder_es: '¿Con qué versión del acorde F estás empezando (cejilla completa o simplificada)? ¿Por qué?' }
          },
            ]
          },
          {
            title: 'Listen for the chord changes',
            title_es: 'Escucha los cambios de acorde',
            steps: [
          {
            label: 'Listen: "Let It Be"', label_es: 'Escucha: "Let It Be"',
            text: 'Listen to "Let It Be" by The Beatles. Can you hear the C–G–Am–F chord pattern in the verse? Count the bars — how many strums per chord? <a href="tabs/let-it-be.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 5 of 5 — Open Chords</a>.',
            text_es: 'Escucha "Let It Be" de The Beatles. ¿Puedes oír el patrón de acordes C–G–Am–F en la estrofa? Cuenta los compases — ¿cuántos rasgueos por acorde? <a href="tabs/let-it-be.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 5 de 5 — Acordes al aire</a>.',
            hint: 'You don\'t need to play along yet. Just listen and map out when the chords change. This trains your ear to recognize the I–V–vi–IV progression (a lowercase numeral like vi means that chord is minor).',
            hint_es: 'Todavía no necesitas tocar junto con la canción. Solo escucha y ubica cuándo cambian los acordes. Esto entrena tu oído para reconocer la progresión I–V–vi–IV (un número romano en minúscula como vi significa que ese acorde es menor).',
            skills: [5],
            response: { type: 'short', placeholder: 'About how many strums (or beats) does each chord get before it changes?',
              placeholder_es: '¿Aproximadamente cuántos rasgueos (o tiempos) dura cada acorde antes de cambiar?' }
          },
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
          {
            label: 'Wrap-up: your toughest chord', label_es: 'Cierre: tu acorde más difícil',
            text: 'Station Wrap-Up — pause and think: which of these four chords (C, G, Am, F) is fighting you most right now, and is it the shape itself or getting to it in time?',
            text_es: 'Cierre de la estación — pausa y piensa: ¿cuál de estos cuatro acordes (C, G, Am, F) te está costando más ahora mismo, y es la forma en sí o el llegar a ella a tiempo?',
            response: { type: 'short', placeholder: 'e.g. F — the shape is fine but I\'m slow getting into it',
              placeholder_es: 'p. ej. F — la forma está bien pero soy lento para llegar a ella' }
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
            title: 'Name the root note of each chord before you strum',
            title_es: 'Nombra la nota raíz de cada acorde antes de rasguear',
            steps: [
          {
            label: 'Challenge — Name the Root', label_es: 'Reto — Nombra la raíz',
            text: 'Before you strum each chord, find and say its ROOT — the note the chord is named after, on the lowest string you strum:<ul><li>C = C (A string, 3rd fret).</li><li>G = G (low E, 3rd fret).</li><li>Am = A (A string, open).</li><li>F = F (D string, 3rd fret).</li></ul>You\'ve got it when: name all four roots correctly, then play the chord.',
            text_es: 'Antes de rasguear cada acorde, encuentra y di su RAÍZ — la nota que le da nombre al acorde, en la cuerda más grave que rasgueas:<ul><li>C = C (cuerda La, traste 3).</li><li>G = G (Mi grave, traste 3).</li><li>Am = A (cuerda La, al aire).</li><li>F = F (cuerda Re, traste 3).</li></ul>Lo tienes cuando: nombras correctamente las cuatro raíces, y luego tocas el acorde.',
            hint: 'Knowing where a chord\'s root lives on the neck is the same Module 2 note-name skill. The root tells you the chord\'s name.',
            hint_es: 'Saber dónde vive la raíz de un acorde en el mástil es la misma destreza de nombrar notas del Módulo 2. La raíz te dice el nombre del acorde.',
            stuck: 'Use the Module 2 note map — the root is the lowest string you actually strum. Find that one note first, then build the shape around it.',
            stuck_es: 'Usa el mapa de notas del Módulo 2 — la raíz es la cuerda más grave que realmente rasgueas. Encuentra esa nota primero, y luego arma la forma alrededor de ella.',
            levelUp: 'Name the roots of D, A, and Em too — you\'ll meet those chords next set.',
            levelUp_es: 'Nombra también las raíces de D, A y Em — vas a conocer esos acordes en la próxima unidad.',
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
            title: 'Use a common-finger pivot (Am ↔ C)',
            title_es: 'Usa un dedo pivote común (Am ↔ C)',
            steps: [
          {
            label: 'Challenge 1 — Pivot Finger (Am ↔ C)', label_es: 'Reto 1 — Dedo pivote (Am ↔ C)',
            text: '<ul><li>Switch Am ↔ C keeping your index finger planted on string 2, fret 1, moving only the other fingers.</li></ul>You\'ve got it when: clean changes both ways without ever lifting the pivot finger.',
            text_es: '<ul><li>Cambia Am ↔ C manteniendo tu dedo índice plantado en la cuerda 2, traste 1, moviendo solo los otros dedos.</li></ul>Lo tienes cuando: cambios limpios en ambas direcciones sin levantar nunca el dedo pivote.',
            hint: 'Common-finger pivots cut your transition time in half. Look for other chords in this group that share a finger position.',
            hint_es: 'Los pivotes de dedo común reducen tu tiempo de transición a la mitad. Busca otros acordes de este grupo que compartan una posición de dedo.',
            stuck: 'Rest your index lightly on string 2 / fret 1 and refuse to lift it — move only the middle and ring fingers.',
            stuck_es: 'Apoya tu índice suavemente en la cuerda 2 / traste 1 y niégate a levantarlo — mueve solo los dedos medio y anular.',
            levelUp: 'This same index-finger anchor also works switching Am ↔ F — try that pair next.',
            levelUp_es: 'Este mismo anclaje del dedo índice también funciona al cambiar Am ↔ F — prueba ese par a continuación.',
            skills: [4, 6]
          }
            ]
          },
          {
            title: 'Play the C–G–Am–F loop in time',
            title_es: 'Toca la vuelta C–G–Am–F a tiempo',
            steps: [
          {
            label: 'Challenge 2 — C–G–Am–F Loop', label_es: 'Reto 2 — Vuelta C–G–Am–F',
            text: 'At 60 BPM:<ol><li>Play 2 bars of C.</li><li>Then 2 bars of G.</li><li>Then 2 bars of Am.</li><li>Then 2 bars of F, and repeat.</li></ol>You\'ve got it when: change on beat 1 every time — then speed up in steps — 60 → 65 → 70 — and hold 70 BPM clean (that\'s the assessment tempo).',
            text_es: 'A 60 BPM:<ol><li>Toca 2 compases de C.</li><li>Luego 2 compases de G.</li><li>Luego 2 compases de Am.</li><li>Luego 2 compases de F, y repite.</li></ol>Lo tienes cuando: cambias en el tiempo 1 cada vez — y luego acelera en pasos — 60 → 65 → 70 — y sostén 70 BPM limpio (ese es el tempo de la evaluación).',
            hint: 'If you miss a change, keep going. You can slow to 50 BPM if needed. Gradually increase by 5 BPM each time through, aiming for a clean 70. Set the ⏱ Timer for 3 minutes and see how clean the loop gets before it beeps.',
            hint_es: 'Si te pierdes un cambio, sigue tocando. Puedes bajar a 50 BPM si lo necesitas. Sube gradualmente 5 BPM cada vez, apuntando a un 70 limpio. Pon el ⏱ Temporizador en 3 minutos y mira qué tan limpia sale la vuelta antes de que suene.',
            stuck: 'Loop just the two chords that give you trouble (often G→Am or Am→F) on their own before running the whole circle.',
            stuck_es: 'Repite solo los dos acordes que te cuestan (a menudo G→Am o Am→F) antes de correr todo el circuito.',
            levelUp: 'Push toward 75 BPM, or strum down-up on each bar instead of straight downs.',
            levelUp_es: 'Empuja hacia 75 BPM, o rasguea abajo-arriba en cada compás en vez de solo hacia abajo.',
            skills: [1, 2, 3, 5]
          }
            ]
          },
          {
            title: 'Play a down-up strum pattern',
            title_es: 'Toca un patrón de rasgueo abajo-arriba',
            steps: [
          {
            label: 'Challenge 3 — Down-Up Strum', label_es: 'Reto 3 — Rasgueo abajo-arriba',
            text: '<ol><li>Play the loop strumming down on 1 2 3 4 and up on each "+".</li><li>Count "1 + 2 + 3 + 4 +" aloud as you play.</li><li>Build the tempo up to 70 BPM.</li></ol>You\'ve got it when: a steady, relaxed pendulum at 70 BPM with lighter upstrokes and no stumbles.',
            text_es: '<ol><li>Toca la vuelta rasgueando hacia abajo en 1 2 3 4 y hacia arriba en cada "+".</li><li>Cuenta "1 + 2 + 3 + 4 +" en voz alta mientras tocas.</li><li>Sube el tempo hasta 70 BPM.</li></ol>Lo tienes cuando: un péndulo constante y relajado a 70 BPM con rasgueos hacia arriba más ligeros y sin tropiezos.',
            hint: 'Start slower than you think you need to, then climb to 70. The upstroke should be lighter than the downstroke. Your wrist should move like a relaxed pendulum.',
            hint_es: 'Empieza más despacio de lo que crees que necesitas, y luego sube a 70. El rasgueo hacia arriba debe ser más ligero que el de abajo. Tu muñeca debe moverse como un péndulo relajado.',
            stuck: 'Keep your strumming hand moving down-up-down-up nonstop — just miss the strings on the beats you don\'t want. The motion never stops.',
            stuck_es: 'Mantén tu mano de rasgueo moviéndose abajo-arriba-abajo-arriba sin parar — solo falla las cuerdas en los tiempos que no quieres. El movimiento nunca se detiene.',
            levelUp: 'Drop the first upstroke (D · D U · U D U) for a more song-like feel.',
            levelUp_es: 'Quita el primer rasgueo hacia arriba (D · D U · U D U) para una sensación más parecida a una canción.',
            skills: [5, 6]
          }
            ]
          },
          {
            title: 'One-Minute Changes — try for a higher number',
            title_es: 'Cambios de un minuto — intenta superar tu número',
            steps: [
              {
                label: 'Challenge 4 — One-Minute Changes (C ↔ G)', label_es: 'Reto 4 — Cambios de un minuto (C ↔ G)',
                text: '<ol><li>Set the ⏱ Timer for 60 seconds.</li><li>Switch C→G→C→G as many times as you can — only CLEAN changes count.</li></ol>You\'ve got it when: type your count below and aim for a higher count than your Set 1 number.',
                text_es: '<ol><li>Pon el ⏱ Temporizador en 60 segundos.</li><li>Cambia C→G→C→G tantas veces como puedas — solo cuentan los cambios LIMPIOS.</li></ol>Lo tienes cuando: escribes tu cuenta abajo y apuntas a superar el número de la Unidad 1.',
                hint: 'C and G share no easy anchor finger, so pre-shape the next chord in the air before you land it. Quality first — slow down until each one rings.',
                hint_es: 'C y G no comparten un dedo ancla fácil, así que preforma el siguiente acorde en el aire antes de aterrizarlo. Calidad primero — baja la velocidad hasta que cada uno suene.',
                stuck: 'Break it down: park your hand over G, then practice just dropping into C and back. Speed comes after the path is clean.',
                stuck_es: 'Divídelo: deja tu mano posicionada sobre G, y luego practica solo caer en C y volver. La velocidad llega después de que el camino esté limpio.',
                levelUp: 'Run Am↔F instead — the hardest pair in this group.',
                levelUp_es: 'Prueba Am↔F en su lugar — el par más difícil de este grupo.',
                skills: [3, 6],
                response: { type: 'short', prompt: 'Personal record — clean C↔G changes in 60 seconds. Your count today?', prompt_es: 'Récord personal — cambios limpios C↔G en 60 segundos. ¿Tu cuenta hoy?', placeholder: 'e.g. 18 — try for a higher number next time', placeholder_es: 'p. ej. 18 — intenta superarlo la próxima vez' }
              }
            ]
          },
          {
            title: 'Random chord draw — Group 1',
            title_es: 'Sorteo de acordes al azar — Grupo 1',
            steps: [
              {
                label: 'Challenge — Random Chord Draw', label_es: 'Reto — Sorteo de acordes',
                text: '<ol><li>Run the Group 1 chord deck below.</li><li>Play whatever chord it deals you cleanly before moving to the next card.</li></ol>You\'ve got it when: you run the whole deck with no hesitation on any chord.',
                text_es: '<ol><li>Corre la baraja de acordes del Grupo 1 de abajo.</li><li>Toca limpio el acorde que te reparta antes de pasar a la siguiente carta.</li></ol>Lo tienes cuando: corres toda la baraja sin dudar en ningún acorde.',
                drill: { type: 'deck', deck: 'chords-group1', skill: 'm5w2-s6' },
                hint: 'This is the same "point blind at the chart" drill, just shuffled for you — no fumbling for paper flashcards mid-practice.',
                hint_es: 'Es el mismo ejercicio de "apuntar a ciegas al diagrama", solo que ya está barajado para ti — sin andar buscando tarjetas de papel a mitad de la práctica.',
                levelUp: 'Time yourself through the deck, or run it at 70 BPM with a metronome click on beat 1.',
                levelUp_es: 'Cronométrate corriendo la baraja, o hazlo a 70 BPM con el metrónomo marcando el tiempo 1.',
                skills: [6]
              }
            ]
          },
          {
            title: 'Fret Dm cleanly',
            title_es: 'Trastea Dm limpio',
            steps: [
          {
            label: 'Challenge — Clean Dm', label_es: 'Reto — Dm limpio',
            text: '<ol><li>Fret Dm (index finger on string 1, fret 1 · middle finger on string 3, fret 2 · ring finger on string 2, fret 3 — string 4 rings open).</li><li>Strum strings 4–1 only (not the low E or A strings).</li></ol>You\'ve got it when: all four strings ring clean — this is the one new chord shape "the cure" needs.',
            text_es: '<ol><li>Trastea Dm (dedo índice en la cuerda 1, traste 1 · dedo medio en la cuerda 3, traste 2 · dedo anular en la cuerda 2, traste 3 — la cuerda 4 suena al aire).</li><li>Rasguea solo las cuerdas 4–1 (no la Mi grave ni la La).</li></ol>Lo tienes cuando: las cuatro cuerdas suenan limpias — esta es la única forma de acorde nueva que necesita "the cure".',
            hint: 'Dm is a small triangle on the top three strings — the same shape family as D major, just shifted down one string. Keep your fingers arched and your thumb behind the neck so string 1 doesn\'t get muted.',
            hint_es: 'Dm es un pequeño triángulo en las tres cuerdas agudas — la misma familia de forma que D mayor, solo que corrida una cuerda hacia abajo. Mantén tus dedos arqueados y tu pulgar detrás del mástil para que la cuerda 1 no se silencie.',
            stuck: 'Get strings 1 and 2 ringing first (index + ring), then add the middle finger on string 3. Most buzz comes from a finger lying too flat — sit up on the very tip.',
            stuck_es: 'Haz sonar primero las cuerdas 1 y 2 (índice + anular), y luego agrega el dedo medio en la cuerda 3. La mayoría del zumbido viene de un dedo demasiado plano — apóyate justo en la punta.',
            levelUp: 'Switch Am → Dm without looking — your index finger barely has to move. Then move on to the G/B turnaround below.',
            levelUp_es: 'Cambia Am → Dm sin mirar — tu dedo índice casi no tiene que moverse. Luego pasa al giro G/B de abajo.',
            skills: [7],
            chords: [
              { name: 'Dm', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'2'],[2,3,'3'],[1,1,'1']], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Play the G/B bass turnaround',
            title_es: 'Toca el giro de bajo G/B',
            steps: [
          {
            label: 'Challenge — G/B Turnaround', label_es: 'Reto — Giro G/B',
            text: '<ol><li>Fret your regular G shape (index finger on string 5, fret 2 · ring finger on string 1, fret 3).</li><li>Strum only strings 5–1 — skip the low E (string 6) so the B note on string 5 becomes the bass instead of the low G.</li></ol>You\'ve got it when: the chord rings clean with a B in the bass — same G shape, just a different string to start the strum on.',
            text_es: '<ol><li>Trastea tu forma normal de G (dedo índice en la cuerda 5, traste 2 · dedo anular en la cuerda 1, traste 3).</li><li>Rasguea solo las cuerdas 5–1 — sáltate la Mi grave (cuerda 6) para que la nota B en la cuerda 5 se convierta en el bajo en vez de la G grave.</li></ol>Lo tienes cuando: el acorde suena limpio con una B en el bajo — la misma forma de G, solo que empiezas el rasgueo en una cuerda distinta.',
            hint: 'The slash in "G/B" reads "G chord, B in the bass." It\'s not a new shape — you already know every finger position from G. The only change is which string your strum starts on.',
            hint_es: 'La barra en "G/B" se lee "acorde de G, con B en el bajo." No es una forma nueva — ya conoces cada posición de dedo desde G. Lo único que cambia es en qué cuerda empieza tu rasgueo.',
            stuck: 'If the low E slips into your strum, rest the side of your strumming hand lightly against it, or angle your pick to start from string 5.',
            stuck_es: 'Si la Mi grave se cuela en tu rasgueo, apoya ligeramente el borde de tu mano de rasgueo sobre ella, o inclina tu púa para empezar desde la cuerda 5.',
            levelUp: 'Drop it into the "the cure" turnaround — Am · C · Dm · F · G/B, then back to Am — right below.',
            levelUp_es: 'Insértalo en el giro de "the cure" — Am · C · Dm · F · G/B, y de vuelta a Am — justo abajo.',
            skills: [8],
            chords: [
              { name: 'G/B', chord: [[6,'x'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Let It Be", verse (assessment rehearsal)', label_es: 'Reto — "Let It Be", estrofa (ensayo de evaluación)',
                text: '<ol><li>Play C · G · Am · F with a down-strum, four beats per chord, building from 60 to 70 BPM — a full bar per chord, patient and unhurried, twice as long as your Module 2 bass roots (which moved every two beats).</li><li>This C–G–Am–F verse is one of the three core songs you can play from memory for the module assessment — record a run and check it against the chart.</li></ol>You\'ve got it when: one full verse loop at 70 BPM, every change landing on beat 1. The record actually moves at your Module 2 pace — two beats per chord — and the Half-Bar Changes ladder later in this set gets you there. <a href="tabs/let-it-be.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 5 of 5 — Open Chords</a>.',
                text_es: '<ol><li>Toca C · G · Am · F con un rasgueo hacia abajo, cuatro tiempos por acorde, subiendo de 60 a 70 BPM — un compás completo por acorde, paciente y sin apuro, el doble de duración que tus raíces de bajo del Módulo 2 (que se movían cada dos tiempos).</li><li>Esta estrofa C–G–Am–F es una de las tres canciones principales que puedes tocar de memoria para la evaluación del módulo — graba una toma y compárala con el diagrama.</li></ol>Lo tienes cuando: una vuelta completa de la estrofa a 70 BPM, cada cambio cayendo en el tiempo 1. La grabación en realidad se mueve al ritmo de tu Módulo 2 — dos tiempos por acorde — y la escalera de Cambios de Medio Compás más adelante en esta unidad te lleva ahí. <a href="tabs/let-it-be.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 5 de 5 — Acordes al aire</a>.',
                hint: 'Look ahead — start forming the next chord on beat 4 of the current one. Keep your fingers arched and your thumb behind the neck so every string rings. The strum keeps moving even while fingers travel.',
                hint_es: 'Mira hacia adelante — empieza a formar el siguiente acorde en el tiempo 4 del actual. Mantén tus dedos arqueados y tu pulgar detrás del mástil para que cada cuerda suene. El rasgueo sigue moviéndose aunque los dedos viajen.',
                stuck: 'Isolate the roughest pair (probably C → F) and loop just those two, four beats each.',
                stuck_es: 'Aísla el par más difícil (probablemente C → F) y repite solo esos dos, cuatro tiempos cada uno.',
                levelUp: 'Add the chorus turnaround (a short chord move that leads back to the start) — Am · G · F · C — or drop to two beats per chord at the same 60 BPM, the record\'s actual pace.',
                levelUp_es: 'Agrega el giro del coro (un movimiento corto de acordes que regresa al inicio) — Am · G · F · C — o baja a dos tiempos por acorde al mismo 60 BPM, el ritmo real de la grabación.',
                skills: [3, 6],
                chords: [
                  { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'F', chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
                ],
                response: { type: 'short', prompt: 'Which chord change still fights you in "Let It Be"?', prompt_es: '¿Qué cambio de acorde todavía te cuesta en "Let It Be"?', placeholder: 'e.g. C to F — fingers arrive late', placeholder_es: 'p. ej. de C a F — los dedos llegan tarde' }
              },
              {
                label: 'Challenge — "Watchtower", open-chord version', label_es: 'Reto — "Watchtower", versión con acordes al aire',
                text: '<ul><li>Play the same loop you\'ve played as bass notes and power chords, now as full open chords — Am · G · F · G — two beats per chord at 60 BPM.</li></ul>You\'ve got it when: four loops, and you can hear that it\'s the SAME song you played in Modules 2 and 3. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 5 of 5</a>.',
                text_es: '<ul><li>Toca la misma vuelta que ya tocaste como notas de bajo y como acordes de potencia, ahora como acordes al aire completos — Am · G · F · G — dos tiempos por acorde a 60 BPM.</li></ul>Lo tienes cuando: cuatro vueltas, y puedes escuchar que es la MISMA canción que tocaste en los Módulos 2 y 3. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 5 de 5</a>.',
                hint: 'This is the third time this song has met you — bass line, power chords, now open chords. Notice the roots are identical every time.',
                hint_es: 'Esta es la tercera vez que esta canción se cruza contigo — línea de bajo, acordes de potencia, ahora acordes al aire. Nota que las raíces son idénticas cada vez.',
                stuck: 'Strum only beat 1 of each chord and use beats 2–4 to travel to the next shape.',
                stuck_es: 'Rasguea solo el tiempo 1 de cada acorde y usa los tiempos 2–4 para viajar a la siguiente forma.',
                levelUp: 'One beat per chord, or alternate: one loop open chords, one loop power chords, without stopping.',
                levelUp_es: 'Un tiempo por acorde, o alterna: una vuelta con acordes al aire, una vuelta con acordes de potencia, sin detenerte.',
                skills: [3, 6],
                chords: [
                  { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
                  { name: 'F', chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
                ],
                response: { type: 'short', prompt: 'Bass line, power chords, or open chords — which "Watchtower" is your favorite so far?', prompt_es: 'Línea de bajo, acordes de potencia, o acordes al aire — ¿cuál "Watchtower" es tu favorito hasta ahora?', placeholder: 'e.g. open chords — it finally sounds full', placeholder_es: 'p. ej. acordes al aire — por fin suena completo' }
              },
              {
                label: 'Challenge — "the cure" play-along', label_es: 'Reto — "the cure" tocando junto',
                text: '<ol><li>Loop Olivia\'s chords with a down-strum — Am · C · Dm · F, two beats each, then G to turn it around.</li><li>Speed up in steps: 60 → 65 → 70 BPM.</li></ol>The backing track\'s metronome reads 144, but it feels half that fast — so 70 BPM here already puts you close to the record\'s real pace. Open chords, no capo. Shapes are pre-loaded below. You\'ve got it when: two clean loops at 70 BPM, every change on beat 1, every string ringing clear. <a href="tabs/the-cure.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 5 of 5 — Open Chords</a>.',
                text_es: '<ol><li>Repite los acordes de Olivia con un rasgueo hacia abajo — Am · C · Dm · F, dos tiempos cada uno, y luego G para dar la vuelta.</li><li>Acelera en pasos: 60 → 65 → 70 BPM.</li></ol>El metrónomo de la pista base marca 144, pero se siente a la mitad de esa velocidad — así que 70 BPM aquí ya te acerca bastante al ritmo real de la grabación. Acordes al aire, sin capo. Las formas están precargadas abajo. Lo tienes cuando: dos vueltas limpias a 70 BPM, cada cambio en el tiempo 1, cada cuerda sonando clara. <a href="tabs/the-cure.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 5 de 5 — Acordes al aire</a>.',
                hint: 'You just learned Dm and the G/B turnaround above — everything else here (Am, C, F, G) is Group 1, chords you already know.',
                hint_es: 'Acabas de aprender Dm y el giro G/B arriba — todo lo demás aquí (Am, C, F, G) es del Grupo 1, acordes que ya conoces.',
                stuck: 'Get Am · C · Dm · F clean in open position first, then add the G turnaround.',
                stuck_es: 'Deja Am · C · Dm · F limpios en posición abierta primero, y luego agrega el giro de G.',
                levelUp: 'Swap the plain G for the G/B turnaround you just learned, or switch to a down-up strum. Ready for the real thing? Press &#x25B6; on the Song Journey page and play along with the actual 144 BPM backing track.',
                levelUp_es: 'Cambia el G normal por el giro G/B que acabas de aprender, o cambia a un rasgueo abajo-arriba. ¿Listo para lo real? Presiona &#x25B6; en la página de Recorrido de la canción y toca junto con la pista base real a 144 BPM.',
                skills: [5, 6],
                chords: [
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'C',  chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'Dm', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'2'],[2,3,'3'],[1,1,'1']], position: 0 },
                  { name: 'F',  chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
                  { name: 'G',  chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 }
                ],
                playSeq: { label: 'Hear it — Am · C · Dm · F, two felt beats each, then G to turn it around', label_es: 'Escúchalo — Am · C · Dm · F, dos tiempos sentidos cada uno, y luego G para dar la vuelta', bpm: 60, notes: [
                  { midi: [45,52,57,60,64], beats: 2 },
                  { midi: [48,52,55,60,64], beats: 2 },
                  { midi: [50,57,62,65], beats: 2 },
                  { midi: [53,57,60,65], beats: 2 },
                  { midi: [43,47,50,55,59,67], beats: 2 }
                ] },
                response: { type: 'short', prompt: 'Your cleanest tempo on the "the cure" loop today (BPM)?', prompt_es: '¿Tu tempo más limpio hoy en la vuelta de "the cure" (BPM)?', placeholder: 'e.g. 65 — 70 next session', placeholder_es: 'p. ej. 65 — 70 la próxima sesión' }
              }
            ]
          },
          {
            title: 'Speed changes — every two beats, then every beat',
            title_es: 'Cambios más rápidos — cada dos tiempos, y luego cada tiempo',
            steps: [
          {
            label: 'Challenge — Half-Bar Changes (2 chords)', label_es: 'Reto — Cambios de medio compás (2 acordes)',
            text: 'So far you\'ve changed once a bar. Real songs move faster. Switch Am ↔ C every TWO beats, at 60 BPM:<ol><li>Two down-strums on Am.</li><li>Two down-strums on C, and repeat.</li></ol>That\'s twice as many changes as the loop you just played. You\'ve got it when: four laps where every switch lands right on beat 1 and 3, no stops. Press &#x25B6; to hear the target.',
            text_es: 'Hasta ahora has cambiado una vez por compás. Las canciones reales se mueven más rápido. Cambia Am ↔ C cada DOS tiempos, a 60 BPM:<ol><li>Dos rasgueos hacia abajo en Am.</li><li>Dos rasgueos hacia abajo en C, y repite.</li></ol>Eso es el doble de cambios que la vuelta que acabas de tocar. Lo tienes cuando: cuatro vueltas donde cada cambio cae justo en el tiempo 1 y 3, sin detenerte. Presiona &#x25B6; para escuchar el objetivo.',
            hint: 'Am and C share an anchor: your 1st finger stays on the B string (fret 1) and your 2nd finger stays on the D string (fret 2). Only your 3rd finger jumps (to the A string for C). Pivot on the two fingers that don\'t move.',
            hint_es: 'Am y C comparten un ancla: tu dedo 1 se queda en la cuerda Si (traste 1) y tu dedo 2 se queda en la cuerda Re (traste 2). Solo tu dedo 3 salta (a la cuerda La para C). Pivotea con los dos dedos que no se mueven.',
            stuck: 'Drop to 50 BPM. Start moving your 3rd finger on the "and" after beat 2, so C is ready before you strum it.',
            stuck_es: 'Baja a 50 BPM. Empieza a mover tu dedo 3 en el "y" después del tiempo 2, para que C esté listo antes de rasguearlo.',
            levelUp: 'Climb to 70 BPM, or try Am ↔ F (the hardest pair) at the same half-bar speed.',
            levelUp_es: 'Sube a 70 BPM, o prueba Am ↔ F (el par más difícil) a la misma velocidad de medio compás.',
            skills: [4, 6],
            chords: [
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
              { name: 'C',  chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 }
            ],
            playSeq: { label: 'Hear it — Am·Am · C·C (change every 2 beats)', label_es: 'Escúchalo — Am·Am · C·C (cambio cada 2 tiempos)', bpm: 60, notes: [[45,52,57,60,64],[45,52,57,60,64],[48,52,55,60,64],[48,52,55,60,64],[45,52,57,60,64],[45,52,57,60,64],[48,52,55,60,64],[48,52,55,60,64]] }
          },
          {
            label: 'Challenge — Three-Chord Half-Bar (3 chords)', label_es: 'Reto — Medio compás con tres acordes (3 acordes)',
            text: '<ul><li>Play three shapes now, still two beats each — G · C · Am, then back to G, looping at 60 BPM.</li></ul>Three chords this fast is chorus speed for a lot of songs. You\'ve got it when: two clean laps, every change on the beat.',
            text_es: '<ul><li>Toca ahora tres formas, todavía dos tiempos cada una — G · C · Am, y de vuelta a G, repitiendo a 60 BPM.</li></ul>Tres acordes a esta velocidad es la velocidad de coro para muchas canciones. Lo tienes cuando: dos vueltas limpias, cada cambio a tiempo.',
            hint: 'G → C keeps your 2nd finger near the same spot; C → Am keeps the 1st finger planted on the B string. Look for the finger that can stay put in each move.',
            hint_es: 'G → C mantiene tu dedo 2 cerca del mismo lugar; C → Am mantiene el dedo 1 plantado en la cuerda Si. Busca el dedo que puede quedarse quieto en cada movimiento.',
            stuck: 'Loop just the change that trips you (usually G → C, where every finger travels) on its own before running all three.',
            stuck_es: 'Repite solo el cambio que te hace tropezar (usualmente G → C, donde cada dedo viaja) antes de correr los tres.',
            levelUp: 'Speed up to 70 BPM, or reorder as C · G · Am and keep every change on the beat.',
            levelUp_es: 'Acelera a 70 BPM, o reordénalo como C · G · Am y mantén cada cambio a tiempo.',
            skills: [6],
            chords: [
              { name: 'G',  chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
              { name: 'C',  chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
            ],
            playSeq: { label: 'Hear it — G·G · C·C · Am·Am (every 2 beats)', label_es: 'Escúchalo — G·G · C·C · Am·Am (cada 2 tiempos)', bpm: 60, notes: [[43,47,50,55,59,67],[43,47,50,55,59,67],[48,52,55,60,64],[48,52,55,60,64],[45,52,57,60,64],[45,52,57,60,64]] }
          },
          {
            label: 'Challenge — Four-Chord Half-Bar ("Let It Be", fast)', label_es: 'Reto — Medio compás con cuatro acordes ("Let It Be", rápido)',
            text: '<ul><li>Play the whole C · G · Am · F loop from your song, but two beats each at 60 BPM instead of a full bar.</li></ul>Same chords, twice the changes — this is exactly how the record\'s verse actually moves. You\'ve got it when: two clean laps, every change landing on the beat.',
            text_es: '<ul><li>Toca toda la vuelta C · G · Am · F de tu canción, pero dos tiempos cada uno a 60 BPM en vez de un compás completo.</li></ul>Los mismos acordes, el doble de cambios — así es exactamente como se mueve la estrofa en la grabación. Lo tienes cuando: dos vueltas limpias, cada cambio cayendo a tiempo.',
            hint: 'You already know this loop slow. The only new demand is your hands resetting faster — pre-shape each chord in the air while the last one is still ringing.',
            hint_es: 'Ya conoces esta vuelta despacio. La única exigencia nueva es que tus manos se reajusten más rápido — preforma cada acorde en el aire mientras el anterior sigue sonando.',
            stuck: 'Isolate the pair that lags (often G → Am or Am → F) and loop just those two at half-bar speed before running the circle.',
            stuck_es: 'Aísla el par que se atrasa (a menudo G → Am o Am → F) y repite solo esos dos a velocidad de medio compás antes de correr el circuito.',
            levelUp: 'Push to 70 BPM, or move on to the every-beat version below.',
            levelUp_es: 'Empuja a 70 BPM, o pasa a la versión de cada tiempo de abajo.',
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
            label: 'Challenge — One Chord Per Beat ("Let It Be", fastest)', label_es: 'Reto — Un acorde por tiempo ("Let It Be", lo más rápido)',
            text: 'The top of the ladder — a new chord on every single beat.<ul><li>Play C · G · Am · F, one down-strum per beat at 60 BPM, looping.</li></ul>This is the real test of clean, fast switching: the next shape has to be ready before you get to it. You\'ve got it when: four laps clean at 60 — then, if you can, climb to 65.',
            text_es: 'El escalón más alto — un acorde nuevo en cada tiempo.<ul><li>Toca C · G · Am · F, un rasgueo hacia abajo por tiempo a 60 BPM, repitiendo.</li></ul>Esta es la prueba real de cambio limpio y rápido: la siguiente forma tiene que estar lista antes de llegar a ella. Lo tienes cuando: cuatro vueltas limpias a 60 — y luego, si puedes, sube a 65.',
            hint: 'At this speed you can\'t watch your hands. Trust the shapes and keep the strum steady — a change that\'s slightly buzzy but in time beats a clean one that\'s late.',
            hint_es: 'A esta velocidad no puedes mirar tus manos. Confía en las formas y mantén el rasgueo constante — un cambio con un poco de zumbido pero a tiempo es mejor que uno limpio pero tarde.',
            stuck: 'Cut it in half: loop just C · G, one per beat, until it\'s smooth, then add Am and F back one at a time.',
            stuck_es: 'Divide a la mitad: repite solo C · G, uno por tiempo, hasta que sea fluido, y luego agrega de vuelta Am y F de uno en uno.',
            levelUp: 'Hold it clean at 70 BPM, or try G · D · Em · C one per beat once you\'ve met D and Em elsewhere.',
            levelUp_es: 'Mantenlo limpio a 70 BPM, o prueba G · D · Em · C uno por tiempo una vez que hayas conocido D y Em en otra parte.',
            skills: [5, 6],
            chords: [
              { name: 'C',  chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
              { name: 'G',  chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
              { name: 'F',  chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
            ],
            playSeq: { label: 'Hear it — C·G·Am·F (one chord per beat)', label_es: 'Escúchalo — C·G·Am·F (un acorde por tiempo)', bpm: 60, notes: [[48,52,55,60,64],[43,47,50,55,59,67],[45,52,57,60,64],[53,57,60,65],[48,52,55,60,64],[43,47,50,55,59,67],[45,52,57,60,64],[53,57,60,65]] },
            response: { type: 'short', prompt: 'Your fastest CLEAN one-chord-per-beat C–G–Am–F today (BPM)?', prompt_es: '¿Tu C–G–Am–F a un-acorde-por-tiempo LIMPIO más rápido hoy (BPM)?', placeholder: 'e.g. 60 — 65 next session', placeholder_es: 'p. ej. 60 — 65 la próxima sesión' }
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: your hardest transition', label_es: 'Cierre: tu transición más difícil',
                text: 'Of C, G, Am, and F, which transition cost you the most clean changes in the minute drill? Name the two chords — that\'s your first loop next session.',
                text_es: 'De C, G, Am y F, ¿qué transición te costó más cambios limpios en el ejercicio de un minuto? Nombra los dos acordes — esa es tu primera vuelta la próxima sesión.',
                response: { type: 'short', placeholder: 'e.g. Am→F — the F never lands in time', placeholder_es: 'p. ej. Am→F — el F nunca llega a tiempo' }
              }
            ]
          },
          {
            title: '⚡ Ear Spark — optional ear bonus',
            title_es: '⚡ Chispa auditiva — bono opcional de oído',
            steps: [
              {
                label: 'Ear Spark: bright or sad?', label_es: 'Chispa auditiva: ¿alegre o triste?',
                text: '⚡ Ear Spark (optional, 2 min): record yourself strumming C or Am, playing them a few times in a mixed-up order. On playback, say whether each one sounds bright or sad before checking — that\'s major vs minor, and you can already hear it. Got someone around? Have them strum behind your back and you name it live.',
                text_es: '⚡ Chispa auditiva (opcional, 2 min): grábate rasgueando C o Am, tocándolos varias veces en un orden mezclado. Al escuchar la grabación, di si cada uno suena alegre o triste antes de comprobarlo — eso es mayor vs. menor, y ya puedes oírlo. ¿Tienes a alguien cerca? Que rasguee detrás de ti y tú lo nombres en vivo.'
              }
            ]
          },
          {
            title: 'The folk strum (D–D–U–U–D–U)',
            title_es: 'El rasgueo folk (D–D–U–U–D–U)',
            steps: [
              {
                label: 'Challenge — The Folk Strum', label_es: 'Reto — El rasgueo folk',
                text: 'This is the classic singalong strum the down-up strum skill is really testing.<ol><li>Over one bar, strum down, down-up, up-down-up — written D · D U · U D U.</li><li>Count it out loud "1, 2-and, (3)-and, 4-and" — beat 3 in parentheses is the down you skip: you strum on 1, on 2 and its "and," then catch just the "and" of 3, then 4 and its "and." That skipped beat-3 down is the whole secret of the groove (the steady rhythmic feel).</li><li>Start on one chord (G is a great one).</li></ol>You\'ve got it when: it loops smoothly 4 times in a row on one chord without stopping.',
                text_es: 'Este es el clásico rasgueo para cantar en grupo que la destreza de rasgueo abajo-arriba realmente está probando.<ol><li>En un compás, rasguea abajo, abajo-arriba, arriba-abajo-arriba — escrito D · D U · U D U.</li><li>Cuéntalo en voz alta "1, 2-y, (3)-y, 4-y" — el tiempo 3 entre paréntesis es el "abajo" que te saltas: rasgueas en 1, en 2 y su "y", y luego solo capturas el "y" del 3, y luego el 4 y su "y". Ese "abajo" saltado del tiempo 3 es todo el secreto del groove (la sensación rítmica constante).</li><li>Empieza con un solo acorde (G es excelente).</li></ol>Lo tienes cuando: se repite suavemente 4 veces seguidas en un solo acorde sin detenerte.',
                hint: 'Say the full count "1 2 and 3 and 4 and" while your hand swings nonstop. The six strums land on 1, 2, &(2), &(3), 4, &(4) — and beat 3\'s downstrum is the one you leave out. Upstrokes stay lighter than downstrokes.',
                hint_es: 'Di la cuenta completa "1 2 y 3 y 4 y" mientras tu mano se balancea sin parar. Los seis rasgueos caen en 1, 2, y(2), y(3), 4, y(4) — y el rasgueo hacia abajo del tiempo 3 es el que te saltas. Los rasgueos hacia arriba se mantienen más ligeros que los de abajo.',
                stuck: 'Keep your strumming hand moving down-up-down-up the entire bar — never stop the swing. On the beats you don\'t want (that missed beat-3 down), just let the hand pass and MISS the strings. The motion is constant; only the contact changes.',
                stuck_es: 'Mantén tu mano de rasgueo moviéndose abajo-arriba-abajo-arriba todo el compás — nunca detengas el balanceo. En los tiempos que no quieres (ese "abajo" saltado del tiempo 3), deja que la mano pase y FALLE las cuerdas. El movimiento es constante; solo cambia el contacto.',
                levelUp: 'Now take it to a chord change: play the folk strum for one full bar on G, then one full bar on C, and loop G → C → G → C keeping the strum unbroken right through the switch.',
                levelUp_es: 'Ahora llévalo a un cambio de acorde: toca el rasgueo folk por un compás completo en G, luego un compás completo en C, y repite G → C → G → C manteniendo el rasgueo sin interrupción a través del cambio.',
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

    assessment: {
      goal: 'Frets C, F, Am, G with clean tone · Switches C to G in time at 70 BPM · Switches Am to F in time at 70 BPM · Uses common-finger pivot (Am–C) · Strums a down-up pattern in time · Plays a full verse of a C–G–Am–F song',
      goal_es: 'Trastea C, F, Am, G con tono limpio · Cambia de C a G a tiempo a 70 BPM · Cambia de Am a F a tiempo a 70 BPM · Usa el pivote de dedo común (Am–C) · Rasguea un patrón abajo-arriba a tiempo · Toca una estrofa completa de una canción C–G–Am–F',
      performance: 'Solo: record a full verse of "Let It Be" with open chords and down-up strum, then listen back for clean transitions on every change.',
      selfCheck: 'Can you switch from Am to C without lifting your index finger? Can you play the C–G–Am–F loop at 70 BPM without stopping?',
      selfCheck_es: '¿Puedes cambiar de Am a C sin levantar tu dedo índice? ¿Puedes tocar la vuelta C–G–Am–F a 70 BPM sin detenerte?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
    },

    skills: [
      { id: 'm5w2-s1', text: 'Fret C major with clean tone on the B string',
        text_es: 'Trastear C mayor con tono limpio en la cuerda Si',
        gotItWhen: 'you strum C and the B string (fret 1) rings clearly — your index finger doesn\'t mute the high E or buzz against the fret.',
        gotItWhen_es: 'rasgueas C y la cuerda Si (traste 1) suena clara — tu dedo índice no silencia la mi aguda ni zumba contra el traste.',
        practice: { type: 'playSeq', label: 'Hear C major (arpeggiated)', label_es: 'Escucha C mayor (arpegiado)', bpm: 60,
          notes: [48, 52, 55, 60, 64] } },
      { id: 'm5w2-s2', text: 'Fret F major (simplified xx3211) with no buzzing',
        text_es: 'Trastear F mayor (simplificado xx3211) sin zumbido',
        gotItWhen: 'all four notes in the simplified F ring cleanly when you strum strings 4–1 — and your index finger doesn\'t collapse on the barre.',
        gotItWhen_es: 'las cuatro notas del F simplificado suenan limpias cuando rasgueas las cuerdas 4–1 — y tu dedo índice no se colapsa en la cejilla.',
        practice: { type: 'mc', prompt: 'For the simplified F chord (xx3211), which strings should you actually strum?',
          prompt_es: 'Para el acorde F simplificado (xx3211), ¿qué cuerdas deberías rasguear en realidad?',
          choices: ['All 6 strings', 'Strings 1–4 only (the top 4)', 'Strings 5–1', 'Strings 6 and 5 only'],
          choices_es: ['Las 6 cuerdas', 'Solo las cuerdas 1–4 (las 4 agudas)', 'Las cuerdas 5–1', 'Solo las cuerdas 6 y 5'], answer: 1 } },
      { id: 'm5w2-s3', text: 'Fret G major (3 or 4 finger version) cleanly',
        text_es: 'Trastear G mayor (versión de 3 o 4 dedos) limpio',
        gotItWhen: 'every string rings in your G chord — including the open D and G in the middle, which beginners tend to accidentally mute.',
        gotItWhen_es: 'cada cuerda suena en tu acorde G — incluyendo las cuerdas Re y Sol al aire en el medio, que los principiantes tienden a silenciar por accidente.',
        practice: { type: 'playSeq', label: 'Hear G major (arpeggiated)', label_es: 'Escucha G mayor (arpegiado)', bpm: 60,
          notes: [43, 47, 50, 55, 59, 67] } },
      { id: 'm5w2-s4', text: 'Use the common-finger pivot between Am and C',
        text_es: 'Usar el pivote de dedo común entre Am y C',
        gotItWhen: 'when you switch Am ↔ C your index finger stays planted on string 2 fret 1 — you don\'t lift it and put it back down.',
        gotItWhen_es: 'cuando cambias Am ↔ C tu dedo índice se queda plantado en la cuerda 2, traste 1 — no lo levantas para volver a ponerlo.',
        practice: { type: 'mc', prompt: 'When pivoting between Am and C, which finger STAYS planted on string 2 fret 1?',
          prompt_es: 'Al pivotear entre Am y C, ¿qué dedo SE QUEDA plantado en la cuerda 2, traste 1?',
          choices: ['Index (1)', 'Middle (2)', 'Ring (3)', 'Pinky (4)'],
          choices_es: ['Índice (1)', 'Medio (2)', 'Anular (3)', 'Meñique (4)'], answer: 0 } },
      { id: 'm5w2-s5', text: 'Play a down-up strum (D U D U) in time, building to 70 BPM',
        text_es: 'Tocar un rasgueo abajo-arriba (D U D U) a tiempo, subiendo hasta 70 BPM',
        gotItWhen: 'your wrist swings like a pendulum — downstrokes on the numbers, upstrokes on the "and" — and you can hold it steady at 70 BPM without thinking about which way is next.',
        gotItWhen_es: 'tu muñeca se balancea como un péndulo — rasgueos hacia abajo en los números, hacia arriba en el "y" — y puedes mantenerlo constante a 70 BPM sin pensar cuál dirección sigue.',
        practice: { type: 'mc', prompt: 'In a down-up strum pattern, when do the UPSTROKES happen?',
          prompt_es: 'En un patrón de rasgueo abajo-arriba, ¿cuándo ocurren los rasgueos HACIA ARRIBA?',
          choices: ['On the numbers (1, 2, 3, 4)', 'On the "+" (and) between beats', 'Only on beat 4', 'Randomly'],
          choices_es: ['En los números (1, 2, 3, 4)', 'En el "+" (y) entre tiempos', 'Solo en el tiempo 4', 'Al azar'], answer: 1 } },
      { id: 'm5w2-s6', text: 'Switch between any two chords in Group 1 on beat 1 at 70 BPM',
        text_es: 'Cambiar entre dos acordes cualesquiera del Grupo 1 en el tiempo 1 a 70 BPM',
        gotItWhen: 'you run the Group 1 chord deck and can switch to whatever chord it deals you on beat 1 at 70 BPM without breaking the strum.',
        gotItWhen_es: 'corres la baraja de acordes del Grupo 1 y puedes cambiar al acorde que te reparta en el tiempo 1 a 70 BPM sin romper el rasgueo.',
        practice: { type: 'playSeq', label: 'C–G–Am–F progression (root notes)', label_es: 'Progresión C–G–Am–F (notas raíz)', bpm: 70,
          notes: [48, 43, 45, 53] } },
      { id: 'm5w2-s7', text: 'Fret Dm cleanly — triangle shape on the top three strings',
        text_es: 'Trastear Dm limpio — forma triangular en las tres cuerdas agudas',
        gotItWhen: 'you strum strings 4–1 in Dm and all four ring clearly — no string muted by a neighboring finger.',
        gotItWhen_es: 'rasgueas las cuerdas 4–1 en Dm y las cuatro suenan claras — ninguna cuerda silenciada por un dedo vecino.',
        practice: { type: 'playSeq', label: 'Hear Dm (arpeggiated)', label_es: 'Escucha Dm (arpegiado)', bpm: 60,
          notes: [50, 57, 62, 65] } },
      { id: 'm5w2-s8', text: 'Play the G/B bass turnaround (G shape, B in the bass)',
        text_es: 'Tocar el giro de bajo G/B (forma de G, con B en el bajo)',
        gotItWhen: 'you can play your regular G shape while strumming only strings 5–1, and explain that the "/B" means the B note on string 5 is the bass instead of the low G.',
        gotItWhen_es: 'puedes tocar tu forma normal de G rasgueando solo las cuerdas 5–1, y explicar que "/B" significa que la nota B en la cuerda 5 es el bajo en vez de la G grave.',
        practice: { type: 'mc', prompt: 'In the chord name "G/B", what does the "/B" tell you?',
          prompt_es: 'En el nombre de acorde "G/B", ¿qué te indica el "/B"?',
          choices: ['Play a B chord instead', 'The B note is the bass note, under a regular G shape', 'Barre the B string', 'Tune string 2 to B'],
          choices_es: ['Toca un acorde B en su lugar', 'La nota B es la nota de bajo, debajo de una forma normal de G', 'Haz cejilla en la cuerda Si', 'Afina la cuerda 2 a B'], answer: 1 } }
    ]
  },

  {
    id: 'm5w3',
    songThread: [{ name: '"Luna"', journey: 'tabs/luna.html', layer: 5, note: 'the F–Am vamp' }],
    label: 'Set 3',
    locked: false,
    module: 'Open Chords',
    moduleNum: 5,
    unit: 'Module 5 · Open Chords',
    unit_es: 'Módulo 5 · Acordes al aire',
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
            text: 'Watch: <a href="https://www.youtube.com/watch?v=VKgyE6g2Y-s" target="_blank">How to Play a D Major Chord – Lauren Bateman (0:00–4:00)</a>.',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=VKgyE6g2Y-s" target="_blank">How to Play a D Major Chord – Lauren Bateman (0:00–4:00)</a>.',
            hint: 'D major has a triangular finger shape — notice how her three fingers are stacked in a triangle on strings 1, 2, and 3. Try to copy that exact shape.',
            hint_es: 'D mayor tiene una forma triangular de dedos — fíjate cómo sus tres dedos se apilan en un triángulo en las cuerdas 1, 2 y 3. Intenta copiar esa forma exacta.',
            skills: [1, 2, 3, 4],
            response: { type: 'mc', prompt: 'The D major chord uses which finger shape on strings 1, 2, and 3?',
              prompt_es: '¿Qué forma de dedos usa el acorde D mayor en las cuerdas 1, 2 y 3?',
              answer: 0,
              explain: 'The three fretting fingers form a little triangle on the top three strings — that\'s the visual cue for D major.',
              explain_es: 'Los tres dedos que trastean forman un pequeño triángulo en las tres cuerdas agudas — esa es la pista visual de D mayor.',
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
              'Todas cuerdas al aire'
            ] }
          },
          {
            label: 'Watch: Bm two ways', label_es: 'Mira: Bm de dos maneras',
            text: 'Watch: <a href="https://www.youtube.com/watch?v=suJnbc2TERU" target="_blank">B minor (Bm) Chord, 2 Ways (start easy, then barre) – Guitar Goddess (0:00–4:00)</a>.',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=suJnbc2TERU" target="_blank">B minor (Bm) Chord, 2 Ways (start easy, then barre) – Guitar Goddess (0:00–4:00)</a>.',
            hint: 'Bm is the trickiest chord in this group. The partial barre version (xx4432) is the most accessible. Don\'t try the full barre version yet — focus on getting a clean sound first.',
            hint_es: 'Bm es el acorde más complicado de este grupo. La versión con cejilla parcial (xx4432) es la más accesible. No intentes la versión con cejilla completa todavía — concéntrate primero en lograr un sonido limpio.',
            skills: [3],
            chords: [
              { name: 'Bm', chord: [[6,'x'],[5,'x'],[4,4,'4'],[3,4,'3'],[2,3,'2'],[1,2,'1']], position: 2 }
            ],
            response: { type: 'short', placeholder: 'Which Bm version are you starting with (partial barre or full)? What\'s the hardest part for you?',
              placeholder_es: '¿Con qué versión de Bm estás empezando (cejilla parcial o completa)? ¿Cuál es la parte más difícil para ti?' }
          },
            ]
          },
          {
            title: 'Listen for the chord changes',
            title_es: 'Escucha los cambios de acorde',
            steps: [
          {
            label: 'Listen: "Luna"', label_es: 'Escucha: "Luna"',
            text: 'Listen to "Luna" by Peso Pluma & Junior H — the whole song uses just two chords, F and Am, with Dm making a brief passing appearance near the end of the verse and again in the closing bridge (some charts voice it as Dm9). The pulse is in 2: tap just the big downbeats and feel the chord changes land right on them.',
            text_es: 'Escucha "Luna" de Peso Pluma y Junior H — toda la canción usa solo dos acordes, F y Am, con Dm apareciendo brevemente de paso cerca del final de la estrofa y otra vez en el puente final (algunos diagramas lo interpretan como Dm9). El pulso está en 2: marca solo los tiempos fuertes y siente los cambios de acorde caer justo en ellos.',
            hint: 'F and Am are chords you already know from Group 1 — Dm passes through briefly near the end of the verse and in the closing bridge. Your ear already knows the sound — you\'re just learning to place the changes.',
            hint_es: 'F y Am son acordes que ya conoces del Grupo 1 — Dm pasa brevemente cerca del final de la estrofa y en el puente final. Tu oído ya conoce el sonido — solo estás aprendiendo a ubicar los cambios.',
            skills: [6],
            response: { type: 'short', placeholder: 'Describe one moment where you clearly heard a chord change.',
              placeholder_es: 'Describe un momento donde escuchaste claramente un cambio de acorde.' }
          },
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
          {
            label: 'Wrap-up: your Group 2 weak spot', label_es: 'Cierre: tu punto débil del Grupo 2',
            text: 'Station Wrap-Up — pause and think: you now know two whole chord groups. Which Group 2 chord (D, A, Em, Bm) feels furthest from automatic, and what specifically trips it up?',
            text_es: 'Cierre de la estación — pausa y piensa: ahora conoces dos grupos completos de acordes. ¿Qué acorde del Grupo 2 (D, A, Em, Bm) se siente más lejos de ser automático, y qué específicamente lo hace tropezar?',
            response: { type: 'short', placeholder: 'e.g. D — string 1 keeps getting muted by my ring finger',
              placeholder_es: 'p. ej. D — mi dedo anular sigue silenciando la cuerda 1' }
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
            title: 'Fret D major cleanly',
            title_es: 'Trastea D mayor limpio',
            steps: [
          {
            label: 'Challenge 1 — Clean D', label_es: 'Reto 1 — D limpio',
            text: '<ol><li>Fret D major (triangle: string 1, fret 2 · string 2, fret 3 · string 3, fret 2).</li><li>Strum strings 1–4 only.</li></ol>You\'ve got it when: all four ring — especially string 1 (high E), which loves to get muted.',
            text_es: '<ol><li>Trastea D mayor (triángulo: cuerda 1, traste 2 · cuerda 2, traste 3 · cuerda 3, traste 2).</li><li>Rasguea solo las cuerdas 1–4.</li></ol>Lo tienes cuando: las cuatro suenan — especialmente la cuerda 1 (mi aguda), que ama silenciarse.',
            hint: 'The D chord is tricky because string 1 is easy to accidentally mute. Curve your fingers and make sure your fingertips arch away from that string.',
            hint_es: 'El acorde D es complicado porque es fácil silenciar la cuerda 1 por accidente. Curva tus dedos y asegúrate de que las puntas se arqueen lejos de esa cuerda.',
            stuck: 'Get strings 1 and 2 ringing first, then add string 3. Arch the ring finger up high so it clears the high E.',
            stuck_es: 'Haz sonar primero las cuerdas 1 y 2, y luego agrega la cuerda 3. Arquea bien alto el dedo anular para que despeje la mi aguda.',
            levelUp: 'Switch D→A→D without looking — both shapes live around the 2nd fret.',
            levelUp_es: 'Cambia D→A→D sin mirar — ambas formas viven cerca del traste 2.',
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
            label: 'Challenge 2 — Clean Bm', label_es: 'Reto 2 — Bm limpio',
            text: '<ol><li>Fret the partial-barre Bm shape (xx4432 — index on string 1, fret 2 · middle on string 2, fret 3 · ring on string 3, fret 4 · pinky on string 4, fret 4).</li><li>Strum strings 4–1 only.</li></ol>You\'ve got it when: all four fretted strings ring clearly — the pinky on string 4 is the one most likely to go quiet.',
            text_es: '<ol><li>Trastea la forma de cejilla parcial de Bm (xx4432 — índice en la cuerda 1, traste 2 · medio en la cuerda 2, traste 3 · anular en la cuerda 3, traste 4 · meñique en la cuerda 4, traste 4).</li><li>Rasguea solo las cuerdas 4–1.</li></ol>Lo tienes cuando: las cuatro cuerdas trasteadas suenan claras — el meñique en la cuerda 4 es el que más se apaga.',
            hint: 'This is your first partial barre — fingers 1 through 4 climb like stairs across strings 1 through 4. Curl each one so it presses straight down on its own string, not brushing the neighbor.',
            hint_es: 'Esta es tu primera cejilla parcial — los dedos 1 al 4 suben como escalera por las cuerdas 1 a 4. Curva cada uno para que presione derecho hacia abajo en su propia cuerda, sin rozar al vecino.',
            stuck: 'Build it one finger at a time: index on string 1, then middle, then ring, then pinky last — check each string rings before adding the next finger.',
            stuck_es: 'Constrúyelo un dedo a la vez: índice en la cuerda 1, luego medio, luego anular, y meñique al final — revisa que cada cuerda suene antes de agregar el siguiente dedo.',
            levelUp: 'Switch Em→Bm→Em without looking — the index finger barely has to move between them.',
            levelUp_es: 'Cambia Em→Bm→Em sin mirar — el dedo índice casi no tiene que moverse entre ellos.',
            skills: [3],
            chords: [
              { name: 'Bm', chord: [[6,'x'],[5,'x'],[4,4,'4'],[3,4,'3'],[2,3,'2'],[1,2,'1']], position: 2 }
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
            text: 'At 60 BPM, 2 bars each:<ol><li>Switch G→D, Am→Em, and C→A.</li><li>Then drill the two within-group pairs your assessment checks — D→A and Em→Bm.</li></ol>You\'ve got it when: each change lands on beat 1, using fingers that stay close as you switch.',
            text_es: 'A 60 BPM, 2 compases cada uno:<ol><li>Cambia G→D, Am→Em, y C→A.</li><li>Y luego ejercita los dos pares dentro del mismo grupo que revisa tu evaluación — D→A y Em→Bm.</li></ol>Lo tienes cuando: cada cambio cae en el tiempo 1, usando dedos que se quedan cerca al cambiar.',
            hint: 'Look for fingers that stay close or in the same area as you switch. Planning your hand movement before you lift your fingers saves time. Set the ⏱ Timer for 3 minutes and run the pairs until it beeps.',
            hint_es: 'Busca dedos que se queden cerca o en la misma área al cambiar. Planear el movimiento de tu mano antes de levantar los dedos ahorra tiempo. Pon el ⏱ Temporizador en 3 minutos y corre los pares hasta que suene.',
            stuck: 'Take one pair at a time. For G→D, notice all your fingers shift toward the high strings together — move them as one unit, not finger by finger.',
            stuck_es: 'Toma un par a la vez. Para G→D, nota que todos tus dedos se desplazan juntos hacia las cuerdas agudas — muévelos como una unidad, no dedo por dedo.',
            levelUp: 'Run all the pairs back-to-back without stopping — including D↔A and Em↔Bm — or push every pair to 70 BPM.',
            levelUp_es: 'Corre todos los pares uno tras otro sin detenerte — incluyendo D↔A y Em↔Bm — o empuja cada par a 70 BPM.',
            skills: [2, 3, 5, 6],
            chords: [
              { name: 'A',  chord: [[6,'x'],[5,0],[4,2,'1'],[3,2,'2'],[2,2,'3'],[1,0]], position: 0 },
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Random chord draw — Groups 1 & 2',
            title_es: 'Sorteo de acordes al azar — Grupos 1 y 2',
            steps: [
              {
                label: 'Challenge — Cross-Group Chord Draw', label_es: 'Reto — Sorteo de acordes entre grupos',
                text: '<ol><li>Run the deck below — it mixes every Group 1 and Group 2 chord.</li><li>Play three cards in a row cleanly, back to back, before the next set of three.</li></ol>You\'ve got it when: three cards in a row with no pause between them — working toward the assessment\'s 8-bar-at-70-BPM standard.',
                text_es: '<ol><li>Corre la baraja de abajo — mezcla todos los acordes del Grupo 1 y del Grupo 2.</li><li>Toca tres cartas seguidas limpiamente, una tras otra, antes del siguiente grupo de tres.</li></ol>Lo tienes cuando: tres cartas seguidas sin pausa entre ellas — acercándote al estándar de la evaluación de 8 compases a 70 BPM.',
                drill: { type: 'deck', deck: 'chords-m5', skill: 'm5w3-s5' },
                hint: 'This replaces flashcards you\'d shuffle by hand — same idea, already shuffled for you.',
                hint_es: 'Esto reemplaza las tarjetas que barajarías a mano — la misma idea, ya barajada para ti.',
                levelUp: 'Add the metronome at 70 BPM and don\'t let a card break your strum.',
                levelUp_es: 'Agrega el metrónomo a 70 BPM y no dejes que ninguna carta rompa tu rasgueo.',
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
                text: '<ol><li>Set the ⏱ Timer for 60 seconds.</li><li>Switch G→D→G→D as many times as you can — only CLEAN changes count.</li></ol>This is a cross-group jump, so it\'s a real test. You\'ve got it when: type your count below and aim for a higher count than your Set 2 number.',
                text_es: '<ol><li>Pon el ⏱ Temporizador en 60 segundos.</li><li>Cambia G→D→G→D tantas veces como puedas — solo cuentan los cambios LIMPIOS.</li></ol>Este es un salto entre grupos, así que es una prueba real. Lo tienes cuando: escribes tu cuenta abajo y apuntas a superar el número de la Unidad 2.',
                hint: 'G and D both sit up near the high strings — let your whole hand travel as one shape rather than placing finger by finger.',
                hint_es: 'G y D están cerca de las cuerdas agudas — deja que toda tu mano viaje como una sola forma en vez de colocar dedo por dedo.',
                stuck: 'Park your hand over G, then practice just dropping into D and back. Slow until each one rings, then let speed come.',
                stuck_es: 'Deja tu mano posicionada sobre G, y luego practica solo caer en D y volver. Despacio hasta que cada uno suene, y luego deja que la velocidad llegue.',
                levelUp: 'Run Em↔A instead, or add a down-up strum on each chord.',
                levelUp_es: 'Prueba Em↔A en su lugar, o agrega un rasgueo abajo-arriba en cada acorde.',
                skills: [5, 6],
                response: { type: 'short', prompt: 'Personal record — clean G↔D changes in 60 seconds. Your count today?', prompt_es: 'Récord personal — cambios limpios G↔D en 60 segundos. ¿Tu cuenta hoy?', placeholder: 'e.g. 20 — try for a higher number next time', placeholder_es: 'p. ej. 20 — intenta superarlo la próxima vez' }
              }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Luna", the vamp', label_es: 'Reto — "Luna", el vamp',
                text: 'A vamp is a short chord pattern repeated over and over.<ol><li>Play F · Am — two shapes, both from Group 1 and chords you already know well, with the simplified F (xx3211).</li><li>Play two downbeat strums per bar — the song is in 6/8 — nothing syncopated — changing every bar at 60 BPM.</li></ol>You\'ve got it when: four laps (a lap = one full time through the loop) with every change landing on the downbeat and the little F ringing clean. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 5 of 5</a>.',
                text_es: 'Un vamp es un patrón de acordes corto que se repite una y otra vez.<ol><li>Toca F · Am — dos formas, ambas del Grupo 1 y acordes que ya conoces bien, con el F simplificado (xx3211).</li><li>Toca dos rasgueos en el tiempo fuerte por compás — la canción está en 6/8 — nada sincopado — cambiando cada compás a 60 BPM.</li></ol>Lo tienes cuando: cuatro vueltas (una vuelta = un recorrido completo del loop) con cada cambio cayendo en el tiempo fuerte y el pequeño F sonando limpio. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 5 de 5</a>.',
                hint: 'F and Am are already in your hands from Group 1 — the only new part is the simplified F shape (xx3211) and locking the change to the 6/8 pulse.',
                hint_es: 'F y Am ya están en tus manos desde el Grupo 1 — lo único nuevo es la forma simplificada de F (xx3211) y ajustar el cambio al pulso de 6/8.',
                stuck: 'Loop just F → Am until the shape change is automatic, then add the metronome at 60 BPM.',
                stuck_es: 'Repite solo F → Am hasta que el cambio de forma sea automático, y luego agrega el metrónomo a 60 BPM.',
                levelUp: 'Drop in the passing Dm near the end of the verse (some charts voice it as Dm9), or push the tempo to 70 BPM.',
                levelUp_es: 'Agrega el Dm de paso cerca del final de la estrofa (algunos diagramas lo interpretan como Dm9), o empuja el tempo a 70 BPM.',
                skills: [6],
                chords: [
                  { name: 'F',  chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
                ],
                response: { type: 'short', prompt: 'Which change was toughest — into F, or out of it?', prompt_es: '¿Qué cambio fue el más difícil — entrar a F, o salir de él?', placeholder: 'e.g. into F — the top-string barre lands late', placeholder_es: 'p. ej. entrar a F — la cejilla en la cuerda aguda llega tarde' }
              },
              {
                label: 'Challenge — "Sweet Child O\' Mine", verse (open chords)', label_es: 'Reto — "Sweet Child O\' Mine", estrofa (acordes al aire)',
                text: '<ul><li>Play the D · C · G loop you\'ve played as bass notes (Module 2) and power chords (Module 3), now as full open chords — one bar per chord, same pacing as always, using D, C, and G shapes you already know from Group 1 and Group 2.</li></ul>You\'ve got it when: two full verse loops, every change landing on beat 1, every string you strum ringing clean. Then press &#x25B6; on the Song Journey page and strum along with the actual record at 125 BPM — the same one-bar-per-chord pacing you already know, just at real speed. <a href="tabs/sweet-child-o-mine.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 5 of 5</a>.',
                text_es: '<ul><li>Toca la vuelta D · C · G que ya tocaste como notas de bajo (Módulo 2) y acordes de potencia (Módulo 3), ahora como acordes al aire completos — un compás por acorde, el mismo ritmo de siempre, usando las formas de D, C y G que ya conoces del Grupo 1 y el Grupo 2.</li></ul>Lo tienes cuando: dos vueltas completas de la estrofa, cada cambio cayendo en el tiempo 1, cada cuerda que rasgueas sonando limpia. Luego presiona &#x25B6; en la página de Recorrido de la canción y rasguea junto con la grabación real a 125 BPM — el mismo ritmo de un compás por acorde que ya conoces, solo que a velocidad real. <a href="tabs/sweet-child-o-mine.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 5 de 5</a>.',
                hint: 'D, C, and G are chords you already know solidly from Group 1 and Group 2 — the only new skill here is the switch itself. Look ahead one bar early: start shaping the next chord while the current one is still ringing.',
                hint_es: 'D, C y G son acordes que ya conoces bien del Grupo 1 y el Grupo 2 — la única destreza nueva aquí es el cambio en sí. Mira hacia adelante un compás antes: empieza a formar el siguiente acorde mientras el actual todavía suena.',
                stuck: 'Loop just D &rarr; C (the trickiest pair — your 2nd and 3rd fingers both move) until it\'s automatic, then add G back in.',
                stuck_es: 'Repite solo D &rarr; C (el par más difícil — tus dedos 2 y 3 se mueven ambos) hasta que sea automático, y luego vuelve a agregar G.',
                levelUp: 'Try the down-up 8th-note strum from earlier in this Set, or hum the famous intro riff while you strum the verse underneath it.',
                levelUp_es: 'Prueba el rasgueo de corcheas abajo-arriba de antes en esta unidad, o tararea el famoso riff de la intro mientras rasgueas la estrofa debajo.',
                chords: [
                  { name: 'D', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'1'],[2,3,'3'],[1,2,'2']], position: 0 },
                  { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 }
                ],
                playSeq: { label: 'Hear it — D · C · G, one full bar per chord, like the record', label_es: 'Escúchalo — D · C · G, un compás completo por acorde, como en la grabación', bpm: 60, maxBpm: 130, notes: [
                  { midi: [50,57,62,66], beats: 4 },
                  { midi: [48,52,55,60,64], beats: 4 },
                  { midi: [43,47,50,55,59,67], beats: 4 }
                ] },
                response: { type: 'short', prompt: 'How did it feel playing along with the actual 125 BPM record after practicing slower?', prompt_es: '¿Cómo se sintió tocar junto con la grabación real a 125 BPM después de practicar más despacio?', placeholder: 'e.g. the changes felt rushed at first, then locked in', placeholder_es: 'p. ej. los cambios se sintieron apurados al principio, y luego encajaron' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: your hardest cross-group change', label_es: 'Cierre: tu cambio entre grupos más difícil',
                text: 'Crossing between Group 1 and Group 2, which single change still feels like reaching across the neck? Name it — that\'s your warm-up next session.',
                text_es: 'Al cruzar entre el Grupo 1 y el Grupo 2, ¿qué cambio todavía se siente como estirarse por todo el mástil? Nómbralo — ese es tu calentamiento la próxima sesión.',
                response: { type: 'short', placeholder: 'e.g. C→A still feels like a big jump', placeholder_es: 'p. ej. C→A todavía se siente como un salto grande' }
              }
            ]
          },
          {
            title: 'The waltz strum (3/4 time) — count in 3',
            title_es: 'El rasgueo de vals (compás 3/4) — cuenta en 3',
            steps: [
              {
                label: 'Challenge — Waltz Strum', label_es: 'Reto — Rasgueo de vals',
                text: 'Not every song is in 4. A waltz counts in THREE — "ONE-two-three, ONE-two-three." Use Em so the low strings ring full:<ol><li>Play a firm downstrum on beat 1 (strum harder into the low strings so the bass rings), then lighter downs on beats 2 and 3 (D · D · D).</li><li>Comfortable? Sneak an up after beat 3: D · D · D-U.</li></ol>Beat 1 is the strongest: it should clearly stand out from the other two. This "in-3" feel is the same strong-ONE pulse you hear driving songs like "The House of the Rising Sun." You\'ve got it when: you keep it steady for 8 bars and beat 1 is unmistakably the strongest pulse in every bar.',
                text_es: 'No todas las canciones están en 4. Un vals cuenta en TRES — "UNO-dos-tres, UNO-dos-tres." Usa Em para que las cuerdas graves suenen completas:<ol><li>Toca un rasgueo firme hacia abajo en el tiempo 1 (rasguea más fuerte hacia las cuerdas graves para que suene el bajo), y luego rasgueos más ligeros hacia abajo en los tiempos 2 y 3 (D · D · D).</li><li>¿Cómodo? Agrega un rasgueo hacia arriba después del tiempo 3: D · D · D-U.</li></ol>El tiempo 1 es el más fuerte: debe destacar claramente de los otros dos. Esta sensación "en 3" es el mismo pulso fuerte-UNO que escuchas impulsando canciones como "The House of the Rising Sun." Lo tienes cuando: lo mantienes constante por 8 compases y el tiempo 1 es inconfundiblemente el pulso más fuerte en cada compás.',
                hint: 'Say "ONE-two-three" out loud with the ONE loudest. Let the pick fall a little heavier and more toward the bass strings on beat 1, then lift to lighter strums for 2 and 3. Three beats per bar, then straight back to a strong ONE — no beat 4 to wait for.',
                hint_es: 'Di "UNO-dos-tres" en voz alta con el UNO más fuerte. Deja que la púa caiga un poco más pesada y más hacia las cuerdas graves en el tiempo 1, y luego sube a rasgueos más ligeros para el 2 y el 3. Tres tiempos por compás, y luego directo de vuelta a un UNO fuerte — sin tiempo 4 que esperar.',
                stuck: 'Drop the strum entirely and just tap: one loud tap on 1, two soft taps on 2 and 3, over and over. Once that "ONE-two-three" pulse is in your foot, add the strums back on top of it.',
                stuck_es: 'Deja el rasgueo por completo y solo golpea con el pie: un golpe fuerte en el 1, dos golpes suaves en el 2 y el 3, una y otra vez. Una vez que ese pulso "UNO-dos-tres" esté en tu pie, agrega de vuelta los rasgueos encima.',
                levelUp: 'Change chords every bar on beat 1 — one bar of Em, then Am, then G — keeping the strong-beat-1 waltz pulse unbroken through each change.',
                levelUp_es: 'Cambia de acorde cada compás en el tiempo 1 — un compás de Em, luego Am, luego G — manteniendo el pulso de vals con el tiempo 1 fuerte sin romperse en cada cambio.',
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

    assessment: {
      goal: 'Frets D, A, and Bm with clean tone · Switches D to A in time · Switches Em to Bm in time · Connects Group 1 and Group 2 chords · Plays a song using Group 2 chords · Identifies chord group from a chord chart',
      goal_es: 'Trastea D, A y Bm con tono limpio · Cambia de D a A a tiempo · Cambia de Em a Bm a tiempo · Conecta acordes del Grupo 1 y del Grupo 2 · Toca una canción usando acordes del Grupo 2 · Identifica el grupo de un acorde a partir de un diagrama',
      performance: 'Solo: run the chord deck (mixes Group 1 and Group 2) for three cards in a row, then play them in sequence for 8 bars at 70 BPM — record it and listen back for clean changes.',
      selfCheck: 'Can you look at a chord chart and know immediately which "group" each chord belongs to? Can you switch D–A and Em–Bm on beat 1, working the tempo up toward 70 BPM?',
      selfCheck_es: '¿Puedes ver un diagrama de acordes y saber de inmediato a qué "grupo" pertenece cada acorde? ¿Puedes cambiar D–A y Em–Bm en el tiempo 1, subiendo el tempo hacia 70 BPM?',
      standards: ['Pr.4a', 'Pr.5a', 'Cn.11b']
    },

    skills: [
      { id: 'm5w3-s1', text: 'Fret D major cleanly — triangular shape, strings 1–4',
        text_es: 'Trastear D mayor limpio — forma triangular, cuerdas 1–4',
        gotItWhen: 'all four strings in D ring clearly — especially the high E (string 1), which is the one beginners most often mute accidentally.',
        gotItWhen_es: 'las cuatro cuerdas de D suenan claras — especialmente la mi aguda (cuerda 1), que es la que los principiantes más silencian por accidente.',
        practice: { type: 'mc', prompt: 'When you strum the D major open chord, which strings should you play?',
          prompt_es: 'Cuando rasgueas el acorde D mayor al aire, ¿qué cuerdas deberías tocar?',
          choices: ['All 6 strings', 'Strings 4–1 (the top 4)', 'Strings 6–3', 'Just strings 1 and 2'],
          choices_es: ['Las 6 cuerdas', 'Las cuerdas 4–1 (las 4 agudas)', 'Las cuerdas 6–3', 'Solo las cuerdas 1 y 2'], answer: 1 } },
      { id: 'm5w3-s2', text: 'Fret A major cleanly — 3 fingers on 2nd fret',
        text_es: 'Trastear A mayor limpio — 3 dedos en el traste 2',
        gotItWhen: 'your three fingers all fit on the 2nd fret without colliding, and strings 1–5 ring cleanly when you strum.',
        gotItWhen_es: 'tus tres dedos caben en el traste 2 sin chocar, y las cuerdas 1–5 suenan limpias cuando rasgueas.',
        practice: { type: 'mc', prompt: 'In the open A major chord, all three fretting fingers go on which fret?',
          prompt_es: 'En el acorde A mayor al aire, ¿en qué traste van los tres dedos que trastean?',
          choices: ['1st fret', '2nd fret', '3rd fret', 'Different frets each'],
          choices_es: ['Traste 1', 'Traste 2', 'Traste 3', 'Cada uno en un traste distinto'], answer: 1 } },
      { id: 'm5w3-s3', text: 'Fret Bm with partial barre shape (xx4432)',
        text_es: 'Trastear Bm con la forma de cejilla parcial (xx4432)',
        gotItWhen: 'you can play the small four-finger Bm (xx4432) and all four notes ring — each finger arched so strings 1–4 are buzz-free.',
        gotItWhen_es: 'puedes tocar el pequeño Bm de cuatro dedos (xx4432) y las cuatro notas suenan — cada dedo arqueado para que las cuerdas 1–4 no zumben.',
        practice: { type: 'mc', prompt: 'The Bm chord is written "xx4432". What do the two "x"s at the start mean?',
          prompt_es: 'El acorde Bm se escribe "xx4432". ¿Qué significan las dos "x" al principio?',
          choices: ['Strum extra hard', 'Mute strings 6 and 5 — don\'t play them', 'Use 2 fingers on string 1', 'Cross your fingers'],
          choices_es: ['Rasguea extra fuerte', 'Silencia las cuerdas 6 y 5 — no las toques', 'Usa 2 dedos en la cuerda 1', 'Cruza los dedos'], answer: 1 } },
      { id: 'm5w3-s4', text: 'Switch D to A in time at 70 BPM',
        text_es: 'Cambiar de D a A a tiempo a 70 BPM',
        gotItWhen: 'you can switch D ↔ A on beat 1 at 70 BPM without breaking your strum or pausing to position fingers.',
        gotItWhen_es: 'puedes cambiar D ↔ A en el tiempo 1 a 70 BPM sin romper tu rasgueo ni pausar para posicionar los dedos.',
        practice: { type: 'playSeq', label: 'D ↔ A switch (roots, 4 bars)', label_es: 'Cambio D ↔ A (raíces, 4 compases)', bpm: 70,
          notes: [50, 45, 50, 45] } },
      { id: 'm5w3-s5', text: 'Connect Group 1 and Group 2 chords in a song (e.g., G to D, Am to Em)',
        text_es: 'Conectar acordes del Grupo 1 y del Grupo 2 en una canción (p. ej., G a D, Am a Em)',
        gotItWhen: 'you can play through a real song that mixes Group 1 and Group 2 chords without slowing down at the cross-group changes.',
        gotItWhen_es: 'puedes tocar una canción real que mezcla acordes del Grupo 1 y del Grupo 2 sin bajar la velocidad en los cambios entre grupos.',
        practice: { type: 'playSeq', label: 'Cross-group progression (G · Em · C · D roots)', label_es: 'Progresión entre grupos (raíces G · Em · C · D)', bpm: 70,
          notes: [43, 40, 48, 50] } },
      { id: 'm5w3-s6', text: 'Play the "Luna" vamp (F–Am, plus a passing Dm) using Group 1 chords with a strum pattern',
        text_es: 'Tocar el vamp de "Luna" (F–Am, con un Dm de paso) usando acordes del Grupo 1 con un patrón de rasgueo',
        gotItWhen: 'you can loop the "Luna" vamp (F · Am) with steady downbeat strums at 60 BPM, every change landing on the downbeat and the simplified F (xx3211) ringing clean.',
        gotItWhen_es: 'puedes repetir el vamp de "Luna" (F · Am) con rasgueos constantes en el tiempo fuerte a 60 BPM, cada cambio cayendo en el tiempo fuerte y el F simplificado (xx3211) sonando limpio.',
        practice: { type: 'chord', label: '"Luna" vamp — simplified F and Am', label_es: 'Vamp de "Luna" — F simplificado y Am',
          chords: [
            { name: 'F',  chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
            { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
          ] } }
    ]
  },

  {
    id: 'm5w4',
    songThread: [{ name: '"Luna"', journey: 'tabs/luna.html', layer: 5, note: 'perform it' }],
    label: 'Set 4',
    locked: false,
    module: 'Open Chords',
    moduleNum: 5,
    unit: 'Module 5 · Open Chords',
    unit_es: 'Módulo 5 · Acordes al aire',
    title: 'Set 4',
    subtitle: 'Chord Group 3: E, B7, F#m, C#m · Module 5 assessment preparation',
    subtitle_es: 'Grupo de acordes 3: E, B7, F#m, C#m · Preparación para la evaluación del Módulo 5',
    skillFocus: 'Fretting the E and B7 chords · Recognizing the F#m and C#m shapes · Performing a core song from memory',
    skillFocus_es: 'Trastear los acordes E y B7 · Reconocer las formas F#m y C#m · Interpretar una canción principal de memoria',
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
            text: 'Watch: <a href="https://youtu.be/8H393ryDkuY" target="_blank">The E Chord (BC-113) – JustinGuitar</a> (0:00–4:00).',
            text_es: 'Mira: <a href="https://youtu.be/8H393ryDkuY" target="_blank">The E Chord (BC-113) – JustinGuitar</a> (0:00–4:00).',
            hint: 'E major uses three fingers — it\'s a full, rich chord. (B7, later in this set, is the one that uses all four.) Play it as he shows and take it slow, checking every string rings. The two diagrams below are F#m and C#m: Group 3 barre shapes you only need to RECOGNIZE on a chart for now, not play cleanly yet.',
            hint_es: 'E mayor usa tres dedos — es un acorde completo y rico. (B7, más adelante en esta unidad, es el que usa los cuatro.) Tócalo como él muestra y ve despacio, revisando que cada cuerda suene. Los dos diagramas de abajo son F#m y C#m: formas de cejilla del Grupo 3 que por ahora solo necesitas RECONOCER en un diagrama, no tocarlas limpias todavía.',
            skills: [1, 3],
            chords: [
              { name: 'F#m', chord: [[6,'x'],[5,'x'],[4,4,'3'],[3,2,'1'],[2,2,'1'],[1,2,'1']], position: 2 },
              { name: 'C#m', chord: [[6,'x'],[5,'x'],[4,6,'4'],[3,6,'3'],[2,5,'2'],[1,4,'1']], position: 4 }
            ],
            response: { type: 'short', placeholder: 'Describe the sound of the E major chord — full and rich, or is a string buzzing?',
              placeholder_es: 'Describe el sonido del acorde E mayor — ¿completo y rico, o hay una cuerda zumbando?' }
          },
          {
            label: 'Watch: how to practice effectively', label_es: 'Mira: cómo practicar con eficacia',
            text: 'Watch: <a href="https://youtu.be/uBZsLmmOz9I" target="_blank">How to Practice Effectively – JustinGuitar</a> (0:00–4:00).',
            text_es: 'Mira: <a href="https://youtu.be/uBZsLmmOz9I" target="_blank">How to Practice Effectively – JustinGuitar</a> (0:00–4:00).',
            hint: 'Key idea: practice doesn\'t make perfect — practice makes permanent: whatever you repeat becomes the habit, good or bad. Are you practicing your mistakes or your solutions? This matters most before a performance.',
            hint_es: 'Idea clave: la práctica no hace la perfección — la práctica hace permanente: lo que sea que repitas se convierte en el hábito, bueno o malo. ¿Estás practicando tus errores o tus soluciones? Esto importa más antes de una presentación.',
            skills: [5],
            response: { type: 'mc', prompt: 'What is the KEY idea from this video about practice?',
              prompt_es: '¿Cuál es la idea CLAVE de este video sobre la práctica?',
              answer: 0,
              explain: 'Practice makes PERMANENT — repeating a mistake just locks it in. Slow down and repeat the correct version so that\'s what becomes automatic.',
              explain_es: 'La práctica hace PERMANENTE — repetir un error solo lo fija. Baja la velocidad y repite la versión correcta para que eso sea lo que se vuelva automático.',
              choices: [
              'Practice makes permanent — so practice the solution, not the mistake',
              'Practice makes perfect — repetition is all that matters',
              'You only need to practice the day before a performance',
              'Speed matters more than accuracy'
            ],
              choices_es: [
              'La práctica hace permanente — así que practica la solución, no el error',
              'La práctica hace la perfección — solo la repetición importa',
              'Solo necesitas practicar el día antes de una presentación',
              'La velocidad importa más que la precisión'
            ] }
          },
            ]
          },
          {
            title: 'Plan your performance practice',
            title_es: 'Planea tu práctica de interpretación',
            steps: [
          {
            label: 'Map your performance song\'s chords', label_es: 'Ubica los acordes de tu canción de interpretación',
            text: 'Look up a chord chart for your performance song (or one you\'ve been working on). Map out which chord groups you\'ll use. Are there any chords you need to review?',
            text_es: 'Busca un diagrama de acordes para tu canción de interpretación (o una en la que has estado trabajando). Ubica qué grupos de acordes vas a usar. ¿Hay algún acorde que necesites repasar?',
            hint: 'Being intentional about your practice is a skill. Know exactly which transitions are rough and spend most of your time there — not on the parts you already know.',
            hint_es: 'Ser intencional con tu práctica es una destreza. Sabe exactamente qué transiciones están ásperas y pasa la mayor parte de tu tiempo ahí — no en las partes que ya sabes.',
            skills: [4, 5, 6],
            response: { type: 'short', placeholder: 'Which song are you working on? Which chord transition feels the roughest right now?',
              placeholder_es: '¿En qué canción estás trabajando? ¿Qué transición de acorde se siente más difícil ahora mismo?' }
          },
          {
            label: 'Revisit your Module 1 goal', label_es: 'Vuelve a tu meta del Módulo 1',
            text: 'Re-read what you wrote back in Module 1 — your "My Guitar Adventure" goal. You set it before you could play a single chord. What has changed? Name one thing you can do now that felt impossible then, and the one thing you still want by the end of Module 5.',
            text_es: 'Vuelve a leer lo que escribiste en el Módulo 1 — tu meta de "Mi aventura con la guitarra". La escribiste antes de poder tocar un solo acorde. ¿Qué ha cambiado? Nombra una cosa que puedes hacer ahora que se sentía imposible entonces, y lo único que todavía quieres lograr para el final del Módulo 5.',
            hint: 'This is the same goal you\'ll reflect on in your course self-check. Be specific — "I can switch C to G without stopping" is better than "I got better."',
            hint_es: 'Esta es la misma meta sobre la que vas a reflexionar en tu autochequeo del curso. Sé específico — "puedo cambiar de C a G sin detenerme" es mejor que "mejoré".',
            skills: [5],
            response: { type: 'short', placeholder: 'One thing you can do now that you couldn\'t in Module 1 — and one goal for the assessment.',
              placeholder_es: 'Una cosa que puedes hacer ahora que no podías en el Módulo 1 — y una meta para la evaluación.' }
          },
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
          {
            label: 'Wrap-up: your performance priority', label_es: 'Cierre: tu prioridad de interpretación',
            text: 'Station Wrap-Up — pause and think: with the assessment ahead, what will eat most of your practice time between now and then — a specific chord, a transition, or keeping the strum steady?',
            text_es: 'Cierre de la estación — pausa y piensa: con la evaluación por delante, ¿qué se va a llevar la mayor parte de tu tiempo de práctica de aquí a entonces — un acorde específico, una transición, o mantener el rasgueo constante?',
            response: { type: 'short', placeholder: 'e.g. the B7→E change, and not rushing the strum',
              placeholder_es: 'p. ej. el cambio B7→E, y no apurar el rasgueo' }
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
            title: 'Fret E major cleanly',
            title_es: 'Trastea E mayor limpio',
            steps: [
          {
            label: 'Challenge 1 — Clean E', label_es: 'Reto 1 — E limpio',
            text: '<ol><li>Fret E major (index finger on string 3, fret 1 · middle finger on string 5, fret 2 · ring finger on string 4, fret 2).</li><li>Strum all 6 strings.</li></ol>You\'ve got it when: a full, rich chord with every string ringing — watch your index on string 2.',
            text_es: '<ol><li>Trastea E mayor (dedo índice en la cuerda 3, traste 1 · dedo medio en la cuerda 5, traste 2 · dedo anular en la cuerda 4, traste 2).</li><li>Rasguea las 6 cuerdas.</li></ol>Lo tienes cuando: un acorde completo y rico con cada cuerda sonando — cuidado con tu índice en la cuerda 2.',
            hint: 'E major is one of the most satisfying open chords to play. If any string buzzes, check your index finger — it tends to accidentally mute string 2.',
            hint_es: 'E mayor es uno de los acordes al aire más satisfactorios de tocar. Si alguna cuerda zumba, revisa tu dedo índice — tiende a silenciar por accidente la cuerda 2.',
            stuck: 'E is the Em shape plus one finger — play a clean Em first, then add the index on string 3, fret 1.',
            stuck_es: 'E es la forma de Em más un dedo — toca un Em limpio primero, y luego agrega el índice en la cuerda 3, traste 1.',
            levelUp: 'Switch E→Am→E (similar finger feel), or loop E→B7→E.',
            levelUp_es: 'Cambia E→Am→E (sensación de dedos similar), o repite E→B7→E.',
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
            text: '<ol><li>Fret B7 (index finger on string 4, fret 1 · middle finger on string 5, fret 2 · ring finger on string 3, fret 2 · pinky on string 1, fret 2).</li><li>Strum strings 1–5.</li></ol>You\'ve got it when: all four fingers down and every played string clean — then play E→B7→E and listen: the B7 sounds unfinished and "wants" to move back to E — that pull is called resolving.',
            text_es: '<ol><li>Trastea B7 (dedo índice en la cuerda 4, traste 1 · dedo medio en la cuerda 5, traste 2 · dedo anular en la cuerda 3, traste 2 · meñique en la cuerda 1, traste 2).</li><li>Rasguea las cuerdas 1–5.</li></ol>Lo tienes cuando: los cuatro dedos abajo y cada cuerda tocada suena limpia — y luego toca E→B7→E y escucha: el B7 suena inconcluso y "quiere" volver a E — ese tirón se llama resolución.',
            hint: 'B7 is a dominant 7th chord — it has a slightly tense sound that wants to resolve to E. Play E then B7 then E again and hear how it pulls back.',
            hint_es: 'B7 es un acorde de séptima dominante — tiene un sonido ligeramente tenso que quiere resolver hacia E. Toca E, luego B7 y luego E otra vez, y escucha cómo tira de vuelta.',
            stuck: 'Place the fingers one at a time in order — index, middle, ring, then pinky — and check that the open string 2 still rings between them.',
            stuck_es: 'Coloca los dedos uno a la vez en orden — índice, medio, anular, y meñique al final — y revisa que la cuerda 2 al aire siga sonando entre ellos.',
            levelUp: 'Loop E→B7→E in time at 60 BPM and feel that pull back to E on every cycle.',
            levelUp_es: 'Repite E→B7→E a tiempo a 60 BPM y siente ese tirón de vuelta a E en cada ciclo.',
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
                text: '<ol><li>Set the ⏱ Timer for 60 seconds.</li><li>Switch E→B7→E→B7 as many times as you can — only CLEAN changes count (all four B7 fingers down, strings 1–5 ringing).</li></ol>You\'ve got it when: type your count below and aim for a higher count than your Set 3 number.',
                text_es: '<ol><li>Pon el ⏱ Temporizador en 60 segundos.</li><li>Cambia E→B7→E→B7 tantas veces como puedas — solo cuentan los cambios LIMPIOS (los cuatro dedos de B7 abajo, cuerdas 1–5 sonando).</li></ol>Lo tienes cuando: escribes tu cuenta abajo y apuntas a superar el número de la Unidad 3.',
                hint: 'These two share no fingers, so this is the hardest pair yet. Pre-shape B7 in the air before you land it, and keep string 2 open.',
                hint_es: 'Estos dos no comparten ningún dedo, así que este es el par más difícil hasta ahora. Preforma B7 en el aire antes de aterrizarlo, y mantén la cuerda 2 al aire.',
                stuck: 'Drill just dropping into B7 from E and back, slowly, until all four fingers land together. Speed comes after the landing is clean.',
                stuck_es: 'Ejercita solo caer en B7 desde E y volver, despacio, hasta que los cuatro dedos aterricen juntos. La velocidad llega después de que el aterrizaje sea limpio.',
                levelUp: 'Add a strum on each chord before switching, or run E→Am→B7.',
                levelUp_es: 'Agrega un rasgueo en cada acorde antes de cambiar, o prueba E→Am→B7.',
                skills: [1, 2],
                response: { type: 'short', prompt: 'Personal record — clean E↔B7 changes in 60 seconds. Your count today?', prompt_es: 'Récord personal — cambios limpios E↔B7 en 60 segundos. ¿Tu cuenta hoy?', placeholder: 'e.g. 14 — try for a higher number next time', placeholder_es: 'p. ej. 14 — intenta superarlo la próxima vez' }
              }
            ]
          },
          {
            title: 'Perform your song start to finish',
            title_es: 'Interpreta tu canción de principio a fin',
            steps: [
          {
            label: 'Challenge 4 — Full Run', label_es: 'Reto 4 — Pasada completa',
            text: '<ol><li>Optional: play your performance song — the one you\'re building toward performing for someone (family, a friend, or a recording) — start to finish 3 times without stopping, even through mistakes.</li><li>Then run your core song ("Let It Be", "Luna", or &ldquo;the cure&rdquo;) from memory with no chart — this is your assessment piece.</li><li>Time yourself.</li></ol>No score — this trains your recovery, not perfection.',
            text_es: '<ol><li>Opcional: toca tu canción de interpretación — la que estás construyendo para interpretar frente a alguien (familia, un amigo, o una grabación) — de principio a fin 3 veces sin detenerte, incluso con errores.</li><li>Luego toca tu canción principal ("Let It Be", "Luna" o &ldquo;the cure&rdquo;) de memoria sin diagrama — esta es tu pieza de evaluación.</li><li>Cronométrate.</li></ol>Sin puntaje — esto entrena tu recuperación, no la perfección.',
            hint: 'Don\'t stop when you make a mistake in performance practice. The goal is to keep going. You can fix mistakes in slow practice — performance practice trains your recovery.',
            hint_es: 'No te detengas cuando cometas un error en la práctica de interpretación. El objetivo es seguir tocando. Puedes corregir errores en la práctica lenta — la práctica de interpretación entrena tu recuperación.',
            skills: [5, 6]
          }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Luna", strummed (full-song version)', label_es: 'Reto — "Luna", rasgueada (versión de canción completa)',
                text: 'The full song is F · Am, with Dm making a brief passing appearance near the end of the verse and in the closing bridge.<ol><li>Play two downbeat strums per bar at 60 BPM, building toward 70.</li><li>Sing or hum "Luna, dile tú" while you play — it\'s tricky!</li></ol>You\'ve got it when: a full verse and chorus with every change on the downbeat and the F ringing clean. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 5 of 5</a>.',
                text_es: 'La canción completa es F · Am, con Dm apareciendo brevemente de paso cerca del final de la estrofa y en el puente final.<ol><li>Toca dos rasgueos en el tiempo fuerte por compás a 60 BPM, subiendo hacia 70.</li><li>Canta o tararea "Luna, dile tú" mientras tocas — ¡es complicado!</li></ol>Lo tienes cuando: una estrofa y un coro completos con cada cambio en el tiempo fuerte y el F sonando limpio. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 5 de 5</a>.',
                hint: 'You met this vamp in Set 3 — now make it assessment-clean. F is the trickiest shape; keep your fingers arched and thumb behind the neck so all four strings you strum ring.',
                hint_es: 'Conociste este vamp en la Unidad 3 — ahora déjalo limpio para la evaluación. F es la forma más complicada; mantén tus dedos arqueados y el pulgar detrás del mástil para que las cuatro cuerdas que rasgueas suenen.',
                stuck: 'F is the tough one — loop Am → F on its own until the shape lands clean, then run the full F–Am (with the passing Dm near the verse\'s end and in the closing bridge).',
                stuck_es: 'F es el difícil — repite solo Am → F hasta que la forma caiga limpia, y luego corre el F–Am completo (con el Dm de paso cerca del final de la estrofa y en el puente final).',
                levelUp: 'Try the down-down-up split strum on each chord, or push to 70 BPM.',
                levelUp_es: 'Prueba el rasgueo dividido abajo-abajo-arriba en cada acorde, o empuja a 70 BPM.',
                skills: [5, 6],
                chords: [
                  { name: 'F',  chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'Dm', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'2'],[2,3,'3'],[1,1,'1']], position: 0 }
                ],
                response: { type: 'short', prompt: 'Which core song do you most want to play start-to-finish for the assessment?', prompt_es: '¿Qué canción principal más quieres tocar de principio a fin en la evaluación?', placeholder: 'e.g. "Luna", all of it', placeholder_es: 'p. ej. "Luna", completa' }
              }
            ]
          },
          {
            title: 'Call & Response over a backing track',
            title_es: 'Llamada y respuesta sobre una pista de acompañamiento',
            steps: [
              {
                label: 'Challenge — Call & Response (your Module 5 wrap-up jam)', label_es: 'Reto — Llamada y respuesta (tu jam de cierre del Módulo 5)',
                text: 'Jam (play along freely and make up your own part) over <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; the Am jam track</a> (or any core-song ▶ &#x1F3B5; Backing track — recorded music you play along with — in Module 4\'s &#x1F3B5; Songs list).<ol><li>Improvise a call-and-response solo — play a 2-bar "question" phrase, leave a little space, then answer it with a 2-bar "response."</li><li>Stay in the minor pentatonic box from Module 4.</li></ol>You\'ve got it when: you hold the track\'s pulse start to finish with no restarts, and your response phrase clearly answers your question phrase. Ungraded — a chance to revisit the Module 4 solo skill, not part of this Set\'s scored assessment.',
                text_es: 'Improvisa (toca libremente junto con la pista y crea tu propia parte) sobre <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; la pista de jam en Am</a> (o cualquier ▶ &#x1F3B5; pista de acompañamiento — música grabada con la que tocas junto — de canción principal en la lista de &#x1F3B5; Canciones del Módulo 4).<ol><li>Improvisa un solo de llamada y respuesta — toca una frase "pregunta" de 2 compases, deja un poco de espacio, y luego respóndela con una "respuesta" de 2 compases.</li><li>Quédate en la caja pentatónica menor del Módulo 4.</li></ol>Lo tienes cuando: mantienes el pulso de la pista de principio a fin sin reiniciar, y tu frase de respuesta claramente responde a tu frase de pregunta. Sin calificación — una oportunidad para repasar la destreza del solo del Módulo 4, no forma parte de la evaluación calificada de esta unidad.',
                hint: 'Every skill here is a Module 4 skill — this is an easy, fun review of what you already know. The &#x1F3B5; Songs list at the bottom of Module 4 has a ▶ &#x1F3B5; Backing track for every core song. If the pentatonic box feels rusty, run the Module 4 scale-climb warm-up first, then come back.',
                hint_es: 'Cada destreza aquí es una destreza del Módulo 4 — este es un repaso fácil y divertido de lo que ya sabes. La lista de &#x1F3B5; Canciones al final del Módulo 4 tiene una ▶ &#x1F3B5; pista de acompañamiento para cada canción principal. Si la caja pentatónica se siente oxidada, corre primero el calentamiento de escalada de escala del Módulo 4, y luego regresa.',
                stuck: 'Play a 2-bar question, then answer with the SAME rhythm on different notes — copying the rhythm is the easiest way to make two phrases talk to each other.',
                stuck_es: 'Toca una pregunta de 2 compases, y luego responde con el MISMO ritmo en notas distintas — copiar el ritmo es la forma más fácil de hacer que dos frases se hablen entre sí.',
                levelUp: 'Record your 2-bar call, play the recording back over the track, and improvise the response to it live — or trade call and response with a friend if one\'s around.',
                levelUp_es: 'Graba tu llamada de 2 compases, reproduce la grabación sobre la pista, e improvisa la respuesta en vivo — o intercambia llamada y respuesta con un amigo si hay alguno cerca.'
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: your pressure point', label_es: 'Cierre: tu punto débil bajo presión',
                text: 'After today, what\'s the one part of your performance song most likely to fall apart under pressure (recording light on, someone listening)? Type it below — that\'s exactly where your next practice starts.',
                text_es: 'Después de hoy, ¿cuál es la única parte de tu canción de interpretación que más probablemente se desarme bajo presión (con la luz de grabación encendida, alguien escuchando)? Escríbelo abajo — ahí es exactamente donde empieza tu próxima práctica.',
                response: { type: 'short', placeholder: 'e.g. the B7 in the chorus — it never lands in time', placeholder_es: 'p. ej. el B7 en el coro — nunca cae a tiempo' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Module 5 assessment — perform one CORE open-chord song from memory: "Let It Be" (C–G–Am–F), "Luna" (F–Am–Dm), or "the cure" (Am–C–Dm–F–G/B). Also: play three chords in an 8-bar progression at 70 BPM with clean changes, and name chords on an unlabelled chord chart. Evaluated on chord accuracy, timing, smooth transitions, and musicality. (Separate and ungraded: your written "My Guitar Adventure — Semester 1 Check-in" reflection — just for you, not part of the assessment score.)',
      goal_es: 'Evaluación del Módulo 5 — interpreta una canción PRINCIPAL de acordes al aire de memoria: "Let It Be" (C–G–Am–F), "Luna" (F–Am–Dm) o "the cure" (Am–C–Dm–F–G/B). Además: toca tres acordes en una progresión de 8 compases a 70 BPM con cambios limpios, y nombra acordes en un diagrama sin etiquetar. Se evalúa la precisión de los acordes, el tiempo, las transiciones suaves y la musicalidad. (Aparte y sin calificar: tu reflexión escrita "Mi aventura con la guitarra — Check-in del Semestre 1" — solo para ti, no forma parte del puntaje de la evaluación.)',
      performance: 'Module 5 assessment performance. Student records a full run of the core song from memory (or plays it for family or friends), then reviews the recording for chord accuracy, timing, transitions, and expression.',
      selfCheck: 'Can you play your core song from memory — no chart in front of you — all the way through without stopping? Can you name every chord in it and which group it belongs to?',
      selfCheck_es: '¿Puedes tocar tu canción principal de memoria — sin ningún diagrama delante — de principio a fin sin detenerte? ¿Puedes nombrar cada acorde y a qué grupo pertenece?',
      standards: ['Pr.4a', 'Pr.5b', 'Pr.6a', 'Re.9a']
    },

    skills: [
      { id: 'm5w4-s1', text: 'Fret E major open chord cleanly — all 6 strings ring',
        text_es: 'Trastear el acorde E mayor al aire limpio — las 6 cuerdas suenan',
        gotItWhen: 'you strum all 6 strings and the chord rings full and rich — string 2 (the one your index finger sits next to) doesn\'t buzz or mute.',
        gotItWhen_es: 'rasgueas las 6 cuerdas y el acorde suena completo y rico — la cuerda 2 (junto a la que se sienta tu dedo índice) no zumba ni se silencia.',
        practice: { type: 'playSeq', label: 'Hear E major (arpeggiated)', label_es: 'Escucha E mayor (arpegiado)', bpm: 60,
          notes: [40, 47, 52, 56, 59, 64] } },
      { id: 'm5w4-s2', text: 'Fret B7 open chord cleanly — 4 fingers, strings 1–5',
        text_es: 'Trastear el acorde B7 al aire limpio — 4 dedos, cuerdas 1–5',
        gotItWhen: 'all four fingers land at once and strings 1–5 ring clearly — the low E stays silent (no extra ring underneath).',
        gotItWhen_es: 'los cuatro dedos aterrizan a la vez y las cuerdas 1–5 suenan claras — la Mi grave se queda en silencio (sin sonido extra debajo).',
        practice: { type: 'mc', prompt: 'B7 is called a "dominant 7th" chord. What does the "7" tell you it adds to the chord?',
          prompt_es: 'B7 se llama un acorde de "séptima dominante". ¿Qué te dice el "7" que agrega al acorde?',
          choices: ['Seven fingers', 'A 7th interval — gives it a slightly tense, jazzy/bluesy sound', 'Play on the 7th fret', 'Strum it seven times'],
          choices_es: ['Siete dedos', 'Un intervalo de 7ª — le da un sonido ligeramente tenso, jazzero/bluesero', 'Tócalo en el traste 7', 'Rasguéalo siete veces'], answer: 1 } },
      { id: 'm5w4-s3', text: 'Identify F#m and C#m shapes on a chord diagram',
        text_es: 'Identificar las formas F#m y C#m en un diagrama de acorde',
        gotItWhen: 'you can see an F#m or C#m diagram and explain which version (partial barre or full barre) and which finger goes where, even if you can\'t play it cleanly yet.',
        gotItWhen_es: 'puedes ver un diagrama de F#m o C#m y explicar qué versión es (cejilla parcial o completa) y qué dedo va dónde, incluso si todavía no puedes tocarlo limpio.',
        practice: { type: 'mc', prompt: 'F#m and C#m use a "barre" shape. What is a barre?',
          prompt_es: 'F#m y C#m usan una forma de "cejilla". ¿Qué es una cejilla?',
          choices: ['One finger pressing across multiple strings at the same fret', 'A type of pick', 'A string-bending technique', 'Strumming with the thumb'],
          choices_es: ['Un dedo presionando a través de varias cuerdas en el mismo traste', 'Un tipo de púa', 'Una técnica de doblar cuerdas', 'Rasguear con el pulgar'], answer: 0 } },
      { id: 'm5w4-s4', text: 'Demonstrate a chord from each of Semester 1\'s 3 chord groups',
        text_es: 'Demostrar un acorde de cada uno de los 3 grupos de acordes del Semestre 1',
        gotItWhen: 'you can play at least one chord from each of Groups 1, 2, and 3 cleanly on demand — and name the group each belongs to.',
        gotItWhen_es: 'puedes tocar al menos un acorde de cada uno de los Grupos 1, 2 y 3 limpio a pedido — y nombrar el grupo al que pertenece cada uno.',
        practice: { type: 'mc', prompt: 'Which of these chords is from Group 2 (D, A, Em, Bm)?',
          prompt_es: '¿Cuál de estos acordes es del Grupo 2 (D, A, Em, Bm)?',
          choices: ['C major', 'G major', 'D major', 'F major'],
          choices_es: ['C mayor', 'G mayor', 'D mayor', 'F mayor'], answer: 2 } },
      { id: 'm5w4-s5', text: 'Perform a core song from memory, all the way through without stopping',
        text_es: 'Interpretar una canción principal de memoria, de principio a fin sin detenerse',
        gotItWhen: 'you can play your core song ("Let It Be", "Luna", or "the cure") from memory with no chart in front of you — fingers arched, thumb behind the neck, the shapes held through the whole song — and even with mistakes you keep going and stay in time.',
        gotItWhen_es: 'puedes tocar tu canción principal ("Let It Be", "Luna" o "the cure") de memoria sin ningún diagrama delante — dedos arqueados, pulgar detrás del mástil, las formas sostenidas durante toda la canción — y aunque haya errores sigues tocando y te mantienes a tiempo.',
        practice: { type: 'pr', prompt: 'Play your core song from memory, start to finish without stopping — mistakes are fine, stopping isn\'t. How many complete no-stop runs did you get today?',
          prompt_es: 'Toca tu canción principal de memoria, de principio a fin sin detenerte — los errores están bien, detenerse no. ¿Cuántas pasadas completas sin paradas lograste hoy?',
          unit: 'count', placeholder: 'e.g. 2 runs — try for a higher number', placeholder_es: 'p. ej. 2 pasadas — intenta superarlo' } },
      { id: 'm5w4-s6', text: 'Maintain a steady strum pattern throughout a full song',
        text_es: 'Mantener un patrón de rasgueo constante durante una canción completa',
        gotItWhen: 'your strum pattern stays consistent across the whole song — it doesn\'t fall apart during the hard chord changes.',
        gotItWhen_es: 'tu patrón de rasgueo se mantiene constante durante toda la canción — no se desarma durante los cambios de acorde difíciles.',
        practice: { type: 'pr', prompt: '<ol><li>Play a full verse and chorus of your song and count the chord changes you made WITHOUT breaking the strum pattern.</li><li>Log your best count.</li></ol>',
          prompt_es: '<ol><li>Toca una estrofa y un coro completos de tu canción y cuenta los cambios de acorde que hiciste SIN romper el patrón de rasgueo.</li><li>Anota tu mejor cuenta.</li></ol>',
          unit: 'count', placeholder: 'e.g. 10 changes — try for a higher number', placeholder_es: 'p. ej. 10 cambios — intenta superarlo' } }
    ]
  }

); // end module-5.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[5] = [
      { name: '"Let It Be" — The Beatles', meta: 'Verse & chorus full chord strum · C–G–Am–F (I–V–vi–IV)', meta_es: 'Rasgueo completo de estrofa y coro · C–G–Am–F (I–V–vi–IV)', type: 'Core', core: true, journeyUrl: 'tabs/let-it-be.html',
        originalUrl: 'https://www.youtube.com/watch?v=CGj85pVzRJs',
        tutorialUrl: 'https://www.youtube.com/watch?v=_Kw4subj5z8',
        backingUrl: 'audio/the-beatles-let-it-be-backing-C-71bpm-440hz-rhythm-down.mp3',
        backingKey: 'C' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Full performance with open chords', meta_es: 'Interpretación completa con acordes al aire', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"the cure" — Olivia Rodrigo', meta: 'Open-chord play-along · Am–C–Dm–F–G/B', meta_es: 'Toca junto con acordes al aire · Am–C–Dm–F–G/B', type: 'Core', core: true, journeyUrl: 'tabs/the-cure.html',
        originalUrl: 'https://www.youtube.com/watch?v=B402rKl4bUg',
        tutorialUrl: 'https://www.youtube.com/watch?v=adW_zSkClaY' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: 'Full-song performance · F–Am–Dm', meta_es: 'Interpretación de la canción completa · F–Am–Dm', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
      { name: '"Happy Birthday"', meta: 'Full chord arrangement — all groups reviewed (optional)', meta_es: 'Arreglo completo de acordes — repasa todos los grupos (opcional)', type: 'Supp', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Seven Nation Army" — The White Stripes', meta: '◐ optional harder challenge · Em–G–D–C strummed adaptation', meta_es: '◐ reto opcional más difícil · adaptación rasgueada Em–G–D–C', type: 'Supp', core: false, journeyUrl: 'tabs/seven-nation-army.html',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Optional extra · D–C–G power chords (from Module 3)', meta_es: 'Extra opcional · acordes de potencia D–C–G (del Módulo 3)', type: 'Supp', core: false, journeyUrl: 'tabs/sweet-child-o-mine.html',
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0ASVeXINKYM' },
      { name: '"Riptide" — Vance Joy', meta: 'Am–G–C — three-chord wonder', meta_es: 'Am–G–C — maravilla de tres acordes', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=uJ_1HMAGb4k',
        tutorialUrl: 'https://www.youtube.com/watch?v=4pmK0x6mY0I' },
      { name: '"No Woman No Cry" — Bob Marley', meta: 'C–G–Am–F — beautiful and rhythmic', meta_es: 'C–G–Am–F — hermosa y rítmica', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=IT8XvzIfi4U',
        tutorialUrl: 'https://www.youtube.com/watch?v=qK4NutAn3rg' },
      { name: '"Ella Baila Sola" — Eslabon Armado × Peso Pluma', meta: 'Capo 1 · Em–D–C–B7 vamp — current sierreño hit', meta_es: 'Capo 1 · vamp Em–D–C–B7 — éxito actual de sierreño', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=lZiaYpD9ZrI',
        tutorialUrl: 'https://www.youtube.com/watch?v=fciArjRISjc' },
      { name: '"Hallelujah" — Leonard Cohen', meta: 'C–Am–F–G — beautiful performance song', meta_es: 'C–Am–F–G — hermosa canción de interpretación', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=ttEMYvpoR-k',
        tutorialUrl: 'https://www.youtube.com/watch?v=eFLJUspLfnk' },
      { name: '"Shallow" — Lady Gaga', meta: 'Em–D–G–C–Am–D — challenge song', meta_es: 'Em–D–G–C–Am–D — canción de reto', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=bo_efYhYU2A',
        tutorialUrl: 'https://www.youtube.com/watch?v=wocQ8UHN5kQ' }
    ];

MODULE_REVIEWS[5] = {
  moduleNum: 5,
  module: 'Open Chords',
  module_es: 'Acordes al aire',
  skills: [
    { id: 'mr5-s1', text: 'I can read any chord diagram and place my fingers on the right strings, frets, and finger numbers without looking anything up',
      text_es: 'Puedo leer cualquier diagrama de acorde y colocar mis dedos en las cuerdas, trastes y números de dedo correctos sin buscar nada', set: 'm5w1' },
    { id: 'mr5-s2', text: 'I can fret Am and Em cleanly — every string in each rings with no buzz',
      text_es: 'Puedo trastear Am y Em limpios — cada cuerda de ambos suena sin zumbido', set: 'm5w1' },
    { id: 'mr5-s3', text: 'I can fret Group 1 chords (C, G, Am, and the simplified F) with clean tone',
      text_es: 'Puedo trastear los acordes del Grupo 1 (C, G, Am, y el F simplificado) con tono limpio', set: 'm5w2' },
    { id: 'mr5-s6', text: 'I can keep a steady down-up (1 + 2 + 3 + 4 +) strumming pattern through a chord change',
      text_es: 'Puedo mantener un patrón de rasgueo abajo-arriba constante (1 + 2 + 3 + 4 +) a través de un cambio de acorde', set: 'm5w2' },
    { id: 'mr5-s4', text: 'I can fret Group 2 chords (D, A, and a partial-barre Bm) with clean tone',
      text_es: 'Puedo trastear los acordes del Grupo 2 (D, A, y un Bm con cejilla parcial) con tono limpio', set: 'm5w3' },
    { id: 'mr5-s8', text: 'I can perform a core song from memory, start to finish, for the Module 5 assessment',
      text_es: 'Puedo interpretar una canción principal de memoria, de principio a fin, para la evaluación del Módulo 5', set: 'm5w4' }
  ],
  assessItems: [
    'Run the chord deck (Set 3) for three chords at random and play them in an 8-bar progression at 70 BPM with clean changes in time',
    'Record (or perform for someone) one core song from memory — "Let It Be", "Luna", or "the cure" — with clean tone and smooth transitions, then listen back and check it',
    'Identify and name the chords on an unlabelled chord chart',
    'Ungraded reflection (not scored): your written "My Guitar Adventure — Semester 1 Check-in" — what changed since the Module 1 goal'
  ],
  assessItems_es: [
    'Corre la baraja de acordes (Unidad 3) para elegir tres acordes al azar y tócalos en una progresión de 8 compases a 70 BPM con cambios limpios a tiempo',
    'Graba (o interpreta para alguien) una canción principal de memoria — "Let It Be", "Luna", o "the cure" — con tono limpio y transiciones suaves, y luego escúchala y revísala',
    'Identifica y nombra los acordes en un diagrama de acordes sin etiquetar',
    'Reflexión sin calificar (no cuenta para la nota): tu reflexión escrita "Mi aventura con la guitarra — Check-in del Semestre 1" — qué cambió desde la meta del Módulo 1'
  ],
  forward: 'Every chord you can now fret is a word — <strong>Module 6 is where you learn to speak in rhythm.</strong> The down-up pattern you started here grows into full strumming patterns, accents, and syncopation that turn these shapes into real songs.',
  forward_es: 'Cada acorde que ahora puedes trastear es una palabra — <strong>el Módulo 6 es donde aprendes a hablar en ritmo.</strong> El patrón abajo-arriba que empezaste aquí crece hasta convertirse en patrones de rasgueo completos, acentos y síncopa que transforman estas formas en canciones reales.',
  standards: ['Pr.4a', 'Pr.5a', 'Pr.5b', 'Pr.6a', 'Re.7a', 'Re.9a', 'Cn.11b']
};
