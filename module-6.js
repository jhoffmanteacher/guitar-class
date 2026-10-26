// ============================================================
//  MODULE 6 — Strumming Patterns with Chords
//  Edit this file to change Module 6 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm6w1',
    songThread: [{ name: '"All Along the Watchtower"', journey: 'tabs/all-along-the-watchtower.html', note: 'this song runs on your strumming patterns' }],
    label: 'Set 1',
    locked: false,
    module: 'Strumming Patterns with Chords',
    moduleNum: 6,
    unit: 'Module 6 · Strumming Patterns with Chords',
    unit_es: 'Módulo 6 · Patrones de rasgueo con acordes',
    title: 'Set 1',
    subtitle: 'The down-up strum · 8th-note pulse · Counting "1 + 2 + 3 + 4 +"',
    subtitle_es: 'El rasgueo abajo-arriba · Pulso de corcheas · Contar "1 + 2 + 3 + 4 +"',
    skillFocus: 'Keeping a steady down-up strum · Counting 8th notes · Strumming through chord changes',
    skillFocus_es: 'Mantener un rasgueo abajo-arriba constante · Contar corcheas · Rasguear a través de cambios de acorde',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        title_es: 'Estación de computadora — Mira · Escucha · Practica',
        sections: [
          {
            title: 'Watch: the strumming hand',
            title_es: 'Mira: la mano de rasgueo',
            steps: [
          {
            label: 'Watch: the strumming wrist', label_es: 'Mira: la muñeca de rasgueo',
            text: 'Watch: <a href="https://www.youtube.com/watch?v=SdLsQuvsuO0" target="_blank">Guitar Strumming Patterns for Beginners – Lauren Bateman (0:00–4:00)</a>. Same lesson in Spanish: <a href="https://www.youtube.com/watch?v=zEDxLaZi9Ug" target="_blank">Rasgueos de Guitarra / Lección para Principiantes – Christianvib</a>.<ol><li>Watch her strumming hand, not the chord.</li><li>Count how many times the hand changes direction in one bar.</li><li>Count again in a second bar.</li></ol>You\'ve got it when: you get the same number in both bars.',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=SdLsQuvsuO0" target="_blank">Guitar Strumming Patterns for Beginners – Lauren Bateman (0:00–4:00)</a> (en inglés). La misma lección en español: <a href="https://www.youtube.com/watch?v=zEDxLaZi9Ug" target="_blank">Rasgueos de Guitarra / Lección para Principiantes – Christianvib</a>.<ol><li>Mira su mano de rasgueo, no el acorde.</li><li>Cuenta cuántas veces la mano cambia de dirección en un compás.</li><li>Cuenta otra vez en un segundo compás.</li></ol>Lo tienes cuando: obtienes el mismo número en los dos compases.',
            hint: 'Count each change of direction as one.',
            hint_es: 'Cuenta cada cambio de dirección como uno.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'What should your strumming wrist do the whole time?',
              prompt_es: '¿Qué debe hacer tu muñeca de rasgueo todo el tiempo?',
              answer: 0,
              explain: 'Keep the wrist swinging like a pendulum the whole time — even on skipped strums it keeps moving. That constant motion is what makes strumming steady and relaxed.',
              explain_es: 'Mantén la muñeca balanceándose como un péndulo todo el tiempo — incluso en los rasgueos que te saltas, sigue moviéndose. Ese movimiento constante es lo que hace que el rasgueo sea estable y relajado.',
              choices: [
              'Keep the wrist moving like a pendulum, even between strums',
              'Move only on the strums that hit the strings',
              'Stop at the bottom after each down-strum',
              'Stay still and let the elbow do all the strumming'
            ],
              choices_es: [
              'Mantener la muñeca en péndulo, incluso entre rasgueos',
              'Moverse solo en los rasgueos que tocan las cuerdas',
              'Detenerse abajo después de cada rasgueo hacia abajo',
              'Quedarse quieta y dejar que el codo haga todo el rasgueo'
            ] }
          },
          {
            label: 'Watch: count your strums', label_es: 'Mira: cuenta tus rasgueos',
            text: 'Watch: <a href="https://youtu.be/NCV9IgeSYuU" target="_blank">Beginner Guitar Strumming Patterns You MUST Know! – Marty Music</a> (0:00–3:00).<ol><li>Count "1 + 2 + 3 + 4 +" out loud with him for the first pattern.</li><li>Strum down on each number and up on each "+".</li></ol>You\'ve got it when: you count and strum four bars this way without stopping.',
            text_es: 'Mira: <a href="https://youtu.be/NCV9IgeSYuU" target="_blank">Beginner Guitar Strumming Patterns You MUST Know! – Marty Music</a> (0:00–3:00).<ol><li>Cuenta "1 + 2 + 3 + 4 +" en voz alta con él para el primer patrón.</li><li>Rasguea hacia abajo en cada número y hacia arriba en cada "+".</li></ol>Lo tienes cuando: cuentas y rasgueas cuatro compases así sin detenerte.',
            hint: 'Say "and" for each "+".',
            hint_es: 'Di "y" en cada "+".',
            skills: [3],
          }
            ]
          },
          {
            title: 'Tap the beat with a song',
            title_es: 'Marca el pulso con una canción',
            steps: [
          {
            label: 'Feel the pulse: "Brown Eyed Girl"', label_es: 'Siente el pulso: "Brown Eyed Girl"',
            text: 'Listen to <a href="https://www.youtube.com/watch?v=UfmkgQRmmeE" target="_blank">"Brown Eyed Girl" by Van Morrison</a>.<ol><li>Tap your hand on your leg: down on each number, up on each "+".</li><li>Count your taps in one bar.</li></ol>Then answer the question below.',
            text_es: 'Escucha <a href="https://www.youtube.com/watch?v=UfmkgQRmmeE" target="_blank">"Brown Eyed Girl" de Van Morrison</a>.<ol><li>Marca con la mano en tu pierna: abajo en cada número, arriba en cada "+".</li><li>Cuenta tus golpecitos en un compás.</li></ol>Luego responde la pregunta de abajo.',
            hint: 'You do not need the guitar for this step.',
            hint_es: 'No necesitas la guitarra para este paso.',
            skills: [2, 3],
            response: { type: 'mc', prompt: 'You strum down on every number and up on every "+". How many strums is that in one bar of 4 beats?',
              prompt_es: 'Rasgueas hacia abajo en cada número y hacia arriba en cada "+". ¿Cuántos rasgueos son en un compás de 4 tiempos?',
              answer: 2,
              explain: 'Each of the 4 beats gets a down AND an up (the "+"), so 4 × 2 = 8 strums — that\'s "1 + 2 + 3 + 4 +".',
              explain_es: 'Cada uno de los 4 tiempos recibe un golpe hacia abajo Y uno hacia arriba (el "+"), así que 4 × 2 = 8 rasgueos — eso es "1 + 2 + 3 + 4 +".',
              choices: [
              '4',
              '6',
              '8',
              '16'
            ],
              choices_es: [
              '4',
              '6',
              '8',
              '16'
            ] }
          }
            ]
          },
          {
            title: 'Form today\'s chords',
            title_es: 'Forma los acordes de hoy',
            steps: [
          {
            label: 'Form Em and Am', label_es: 'Forma Em y Am',
            text: 'Today\'s chords are Em and Am, from Module 4. You use them for the rest of this set.<ol><li>Play Em from the diagram and strum once.</li><li>Play Am from the diagram and strum once.</li></ol>You\'ve got it when: every string in each chord rings clean.',
            text_es: 'Los acordes de hoy son Em y Am, del Módulo 4. Los usas durante el resto de esta unidad.<ol><li>Toca Em a partir del diagrama y rasguea una vez.</li><li>Toca Am a partir del diagrama y rasguea una vez.</li></ol>Lo tienes cuando: cada cuerda de cada acorde suena limpia.',
            hint: 'Em uses two fingers. Am adds a third.',
            hint_es: 'Em usa dos dedos. Am agrega un tercero.',
            chords: [
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            kind: 'reflection',
            title: 'Checkpoint',
            title_es: 'Punto de control',
            steps: [
          {
            label: 'Checkpoint', label_es: 'Punto de control',
            text: 'Checkpoint — pause and think: which was harder to keep steady today — your strum hand swinging non-stop like a pendulum, or counting "1 + 2 + 3 + 4 +" out loud the whole time? What started to feel easier?',
            text_es: 'Punto de control — pausa y piensa: ¿qué se sintió más difícil mantener estable hoy — tu mano de rasgueo balanceándose sin parar como un péndulo, o contar "1 + 2 + 3 + 4 +" en voz alta todo el tiempo? ¿Qué empezó a sentirse más fácil?',
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — strumming hand drill (a short exercise you repeat)',
        title_es: 'Estación de práctica — ejercicio para la mano de rasgueo (un ejercicio corto que repites)',
        sections: [
          {
            kind: 'tuning-warmup',
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tune to green', label_es: 'Calentamiento: afina hasta verde',
                text: 'Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                hint: 'Tuning (Module 1) is a skill you keep forever. 60 seconds here makes everything today sound better.',
                hint_es: 'Afinar (Módulo 1) es una destreza que conservas para siempre. 60 segundos aquí hacen que todo suene mejor hoy.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Swing the strumming hand down and up',
            title_es: 'Balancea la mano de rasgueo abajo y arriba',
            steps: [
          {
            label: 'Challenge 1 — Pendulum Motion', label_es: 'Reto 1 — Movimiento de péndulo',
            text: '<ol><li>Mute the strings with your fretting hand.</li><li>Set the metronome to 60 BPM.</li><li>Strum down on each number and up on each "+". Count out loud.</li></ol><div class="strum-line">D   U   D   U   D   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>You\'ve got it when: you play 8 bars and your strumming hand never stops.<span class="step-figure"><img src="img/m6-strum-pendulum.jpg" alt="Photo of a strumming hand holding a pick over the soundhole of an acoustic guitar, with a curved double-headed arrow tracing the down-up arc of the wrist\'s pendulum swing." width="1200" height="654"></span>',
            text_es: '<ol><li>Silencia las cuerdas con tu mano de trastear.</li><li>Pon el metrónomo a 60 BPM.</li><li>Rasguea hacia abajo en cada número y hacia arriba en cada "+". Cuenta en voz alta.</li></ol><div class="strum-line">D   U   D   U   D   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>Lo tienes cuando: tocas 8 compases y tu mano de rasgueo nunca se detiene.<span class="step-figure"><img src="img/m6-strum-pendulum.jpg" alt="Foto de una mano de rasgueo sosteniendo una púa sobre la boca de una guitarra acústica, con una flecha curva de dos puntas que marca el arco abajo-arriba del balanceo de péndulo de la muñeca." width="1200" height="654"></span>',
            hint: 'No chord yet, only the rhythm. Keep your forearm loose. If it gets tight, slow down.',
            hint_es: 'Todavía sin acorde, solo el ritmo. Mantén el antebrazo suelto. Si se pone tenso, ve más despacio.',
            stuck: 'Set the metronome to 50 BPM. Let your hand swing loose from the wrist.',
            stuck_es: 'Pon el metrónomo a 50 BPM. Deja que tu mano se balancee suelta desde la muñeca.',
            levelUp: 'Play it at 80 BPM, or play 8 bars with your eyes closed.',
            levelUp_es: 'Tócalo a 80 BPM, o toca 8 compases con los ojos cerrados.',
            skills: [1, 3]
          }
            ]
          },
          {
            title: 'Hold a steady down-up strum',
            title_es: 'Mantén un rasgueo abajo-arriba constante',
            steps: [
          {
            label: 'Challenge 2 — Even Eighths on Em', label_es: 'Reto 2 — Corcheas parejas en Em',
            text: '<ol><li>Play Em.</li><li>Strum down-up at 60 BPM for 8 bars.</li><li>On each upstroke, brush only the thin strings: high e, B and G.</li></ol>You\'ve got it when: you play 8 bars with even timing and every upstroke lighter than the downstrokes.',
            text_es: '<ol><li>Toca Em.</li><li>Rasguea abajo-arriba a 60 BPM durante 8 compases.</li><li>En cada golpe hacia arriba, roza solo las cuerdas delgadas: mi aguda, Si y Sol.</li></ol>Lo tienes cuando: tocas 8 compases con tiempo parejo y cada golpe hacia arriba más ligero que los de abajo.',
            hint: 'Play the upstrokes lighter than the downstrokes.',
            hint_es: 'Toca los golpes hacia arriba más suaves que los de abajo.',
            stuck: 'If the chord buzzes, fix your Em fingers first. Then go back to the strum.',
            stuck_es: 'Si el acorde zumba, arregla primero tus dedos de Em. Luego vuelve al rasgueo.',
            levelUp: 'Play it at 75 BPM, or play 8 bars without looking at your strumming hand.',
            levelUp_es: 'Tócalo a 75 BPM, o toca 8 compases sin mirar tu mano de rasgueo.',
            skills: [2, 4],
            playSeq: { label: 'Hear the 8th-note pulse', label_es: 'Escucha el pulso de corcheas', bpm: 60, notes: [
              {midi:64,beats:0.5},{midi:64,beats:0.5},{midi:64,beats:0.5},{midi:64,beats:0.5},
              {midi:64,beats:0.5},{midi:64,beats:0.5},{midi:64,beats:0.5},{midi:64,beats:0.5}
            ] },
            chords: [
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Keep time through a chord change',
            title_es: 'Mantén el tiempo a través de un cambio de acorde',
            steps: [
          {
            label: 'Challenge 3 — Em ↔ Am Switch', label_es: 'Reto 3 — Cambio Em ↔ Am',
            text: 'One loop is 4 bars of Em, then 4 bars of Am.<ol><li>Strum down-up at 60 BPM.</li><li>Play the loop. Keep strumming through each chord change.</li><li>Set the ⏱ Timer for 3 minutes and repeat the loop.</li></ol>You\'ve got it when: you play the loop four times and your strumming hand never stops.',
            text_es: 'Una vuelta son 4 compases de Em y luego 4 compases de Am.<ol><li>Rasguea abajo-arriba a 60 BPM.</li><li>Toca la vuelta. Sigue rasgueando en cada cambio de acorde.</li><li>Pon el ⏱ Temporizador en 3 minutos y repite la vuelta.</li></ol>Lo tienes cuando: tocas la vuelta cuatro veces y tu mano de rasgueo nunca se detiene.',
            hint: 'Keep strumming while your fingers find the new chord.',
            hint_es: 'Sigue rasgueando mientras tus dedos buscan el acorde nuevo.',
            stuck: 'Keep fingers 2 and 3 together and move them over one string, toward the floor. Put your index finger on the B string, fret 1. Slow to 50 BPM.',
            stuck_es: 'Mantén los dedos 2 y 3 juntos y muévelos una cuerda hacia el suelo. Pon tu dedo índice en la cuerda Si, traste 1. Baja a 50 BPM.',
            levelUp: 'Change every 2 bars instead of every 4, or play it at 75 BPM.',
            levelUp_es: 'Cambia cada 2 compases en lugar de cada 4, o tócalo a 75 BPM.',
            skills: [4, 5, 6],
            playSeq: { label: 'Em → Am roots, 4 bars each (one note per beat)', label_es: 'Raíces Em → Am, 4 compases cada una (una nota por tiempo)', bpm: 60, notes: [
              40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40,
              45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45
            ] },
            chords: [
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Change chords faster without stopping the strum',
            title_es: 'Cambia de acorde más rápido sin detener el rasgueo',
            steps: [
          {
            label: 'Challenge — Half-Bar Switch, Non-Stop (2 chords)', label_es: 'Reto — Cambio de medio compás, sin parar (2 acordes)',
            text: 'Change chords every two beats.<ol><li>Strum down-up at 60 BPM.</li><li>Play Em on beats 1 and 2.</li><li>Play Am on beats 3 and 4.</li><li>Repeat. Keep strumming through each change.</li></ol>Press &#x25B6; to hear it. You\'ve got it when: you play four bars with every change on the beat and no stop in the strum.',
            text_es: 'Cambia de acorde cada dos tiempos.<ol><li>Rasguea abajo-arriba a 60 BPM.</li><li>Toca Em en los tiempos 1 y 2.</li><li>Toca Am en los tiempos 3 y 4.</li><li>Repite. Sigue rasgueando en cada cambio.</li></ol>Presiona &#x25B6; para escucharlo. Lo tienes cuando: tocas cuatro compases con cada cambio a tiempo y sin parar el rasgueo.',
            hint: 'Your fingers change while the strumming hand keeps moving.',
            hint_es: 'Tus dedos cambian mientras la mano de rasgueo sigue moviéndose.',
            stuck: 'Set the metronome to 50 BPM. Say "change" on the "+" before each change.',
            stuck_es: 'Pon el metrónomo a 50 BPM. Di "cambio" en el "+" antes de cada cambio.',
            levelUp: 'Play it at 70 BPM.',
            levelUp_es: 'Tócalo a 70 BPM.',
            skills: [4, 5],
            chords: [
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
            ],
            playSeq: { label: 'Em·Em · Am·Am roots (change every 2 beats)', label_es: 'Raíces Em·Em · Am·Am (cambia cada 2 tiempos)', bpm: 60, notes: [40, 40, 45, 45, 40, 40, 45, 45] }
          },
          {
            label: 'Challenge — Three-Chord Half-Bar (3 chords)', label_es: 'Reto — Medio compás con tres acordes (3 acordes)',
            text: 'Add G, from Module 4.<ol><li>Play Em, Am, G: two beats each.</li><li>Strum down-up at 60 BPM. Keep strumming through each change.</li><li>Repeat.</li></ol>You\'ve got it when: you play the loop twice with no stop in the strum.',
            text_es: 'Agrega G, del Módulo 4.<ol><li>Toca Em, Am, G: dos tiempos cada uno.</li><li>Rasguea abajo-arriba a 60 BPM. Sigue rasgueando en cada cambio.</li><li>Repite.</li></ol>Lo tienes cuando: tocas la vuelta dos veces sin parar el rasgueo.',
            hint: 'Am to G moves every finger. Shape G in the air while Am still rings.',
            hint_es: 'De Am a G se mueve cada dedo. Forma G en el aire mientras Am todavía suena.',
            stuck: 'Play only Am and G until the strum keeps going through that change. Then add Em.',
            stuck_es: 'Toca solo Am y G hasta que el rasgueo siga en ese cambio. Luego agrega Em.',
            levelUp: 'Play it at 70 BPM, or count "1 + 2 + 3 + 4 +" out loud the whole time.',
            levelUp_es: 'Tócalo a 70 BPM, o cuenta "1 + 2 + 3 + 4 +" en voz alta todo el tiempo.',
            skills: [4, 5],
            chords: [
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
              { name: 'G',  chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 }
            ],
            playSeq: { label: 'Em·Em · Am·Am · G·G roots (every 2 beats)', label_es: 'Raíces Em·Em · Am·Am · G·G (cada 2 tiempos)', bpm: 60, notes: [40, 40, 45, 45, 43, 43] }
          },
          {
            label: 'Challenge — Four-Chord Half-Bar ("Let It Be", strummed)', label_es: 'Reto — Medio compás con cuatro acordes ("Let It Be", rasgueado)',
            text: 'This is the first line of the verse of "Let It Be".<ol><li>Play C, G, Am, F: two beats each.</li><li>Strum down-up at 60 BPM. Keep strumming through each change.</li><li>Repeat.</li></ol>You\'ve got it when: you play the loop twice with every change on the beat and no stop in the strum.',
            text_es: 'Esta es la primera línea de la estrofa de "Let It Be".<ol><li>Toca C, G, Am, F: dos tiempos cada uno.</li><li>Rasguea abajo-arriba a 60 BPM. Sigue rasgueando en cada cambio.</li><li>Repite.</li></ol>Lo tienes cuando: tocas la vuelta dos veces con cada cambio a tiempo y sin parar el rasgueo.',
            hint: 'Keep the upstrokes light. Brush only the thin strings: high e, B and G.',
            hint_es: 'Mantén ligeros los golpes hacia arriba. Roza solo las cuerdas delgadas: mi aguda, Si y Sol.',
            stuck: 'Find the slow change (often G to Am, or Am to F). Play only those two chords until the change is smooth.',
            stuck_es: 'Busca el cambio lento (a menudo G a Am, o Am a F). Toca solo esos dos acordes hasta que el cambio salga fluido.',
            levelUp: 'Play it at 70 BPM.',
            levelUp_es: 'Tócalo a 70 BPM.',
            skills: [4, 5],
            chords: [
              { name: 'C',  chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
              { name: 'G',  chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
              { name: 'F',  chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
            ],
            playSeq: { label: 'C·C · G·G · Am·Am · F·F roots (every 2 beats)', label_es: 'Raíces C·C · G·G · Am·Am · F·F (cada 2 tiempos)', bpm: 60, notes: [48, 48, 43, 43, 45, 45, 53, 53] }
          },
          {
            label: 'Hear it: full-chord loop', label_es: 'Escúchalo: loop de acordes completos',
            text: 'Press &#x25B6; to hear the verse of "Let It Be" as full chords, two beats each: C, G, Am, F, then C, G, F, C. The second line ends on F, C.<ol><li>First time: listen for the changes.</li><li>Second time: strum down once on the first beat of each chord.</li></ol>You\'ve got it when: you strum all eight chords with the playback and every change lands with it.',
            text_es: 'Presiona &#x25B6; para escuchar la estrofa de "Let It Be" con acordes completos, dos tiempos cada uno: C, G, Am, F, y luego C, G, F, C. La segunda línea termina en F, C.<ol><li>Primera vez: escucha los cambios.</li><li>Segunda vez: rasguea una vez hacia abajo en el primer tiempo de cada acorde.</li></ol>Lo tienes cuando: rasgueas los ocho acordes con la reproducción y cada cambio cae con ella.',
            playSeq: { label: 'Hear it — C · G · Am · F, then C · G · F · C, two beats per chord', label_es: 'Escúchalo — C · G · Am · F, y luego C · G · F · C, dos tiempos por acorde', bpm: 60, notes: [
              { midi: [48,52,55,60,64], beats: 2 },
              { midi: [43,47,50,55,59,67], beats: 2 },
              { midi: [45,52,57,60,64], beats: 2 },
              { midi: [53,57,60,65], beats: 2 },
              { midi: [48,52,55,60,64], beats: 2 },
              { midi: [43,47,50,55,59,67], beats: 2 },
              { midi: [53,57,60,65], beats: 2 },
              { midi: [48,52,55,60,64], beats: 2 }
            ] }
          },
          {
            label: 'Bonus — One Chord Per Beat (fastest)', label_es: 'Bono — Un acorde por tiempo (el más rápido)',
            text: 'This step is a bonus.<ol><li>Strum down once on each beat at 60 BPM.</li><li>Change between Em and Am on every beat.</li><li>Keep strumming without a stop.</li></ol>You\'ve got it when: you play four bars clean at 60 BPM.',
            text_es: 'Este paso es un bono.<ol><li>Rasguea una vez hacia abajo en cada tiempo a 60 BPM.</li><li>Cambia entre Em y Am en cada tiempo.</li><li>Sigue rasgueando sin parar.</li></ol>Lo tienes cuando: tocas cuatro compases limpios a 60 BPM.',
            hint: 'Keep fingers 2 and 3 together and move them over one string, toward the floor. Put your index finger on the B string, fret 1.',
            hint_es: 'Mantén los dedos 2 y 3 juntos y muévelos una cuerda hacia el suelo. Pon tu dedo índice en la cuerda Si, traste 1.',
            stuck: 'Set the metronome to 50 BPM. Get the timing of the change right first. Then clean up the sound.',
            stuck_es: 'Pon el metrónomo a 50 BPM. Primero haz el cambio a tiempo. Después limpia el sonido.',
            levelUp: 'Play it clean at 70 BPM, or try Am and G, one per beat.',
            levelUp_es: 'Tócalo limpio a 70 BPM, o prueba Am y G, uno por tiempo.',
            skills: [4, 5],
            chords: [
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
            ],
            playSeq: { label: 'Em·Am roots (one chord per beat)', label_es: 'Raíces Em·Am (un acorde por tiempo)', bpm: 60, notes: [40, 45, 40, 45, 40, 45, 40, 45] },
          }
            ]
          },
          {
            kind: 'take-to-song',
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Watchtower", strummed', label_es: 'Reto — "Watchtower", rasgueado',
                text: '<ul><li>Play Am · G · F (small F) · G at 60 BPM, down-up strumming the whole time: Bar 1: Am from 1 to the "+" after 2, then G from 3 — the change lands on a down-strum. Bar 2: F from 1 to 2, then G from the "+" after 3 — the change lands on an up-strum.</li></ul>You\'ve got it when: two full laps (a lap = one full time through the loop) where the strum hand never stops, even when your F shape is slow. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this song has grown with you since Module 1</a>.',
                text_es: '<ul><li>Toca Am · G · F (F pequeño) · G a 60 BPM, rasgueando abajo-arriba todo el tiempo: Compás 1: Am del 1 hasta el "+" después del 2, luego G desde el 3 — el cambio cae en un golpe hacia abajo. Compás 2: F del 1 al 2, luego G desde el "+" después del 3 — el cambio cae en un golpe hacia arriba.</li></ul>Lo tienes cuando: dos vueltas completas (una vuelta = un recorrido completo del loop) donde la mano de rasgueo nunca se detiene, aunque tu forma de F sea lenta. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: esta canción ha crecido contigo desde el Módulo 1</a>.',
                hint: 'Same loop and same timing you played in Module 4. The new part: your right hand keeps the beat and never stops. The chord changes BETWEEN strums.',
                hint_es: 'El mismo loop y el mismo ritmo que tocaste en el Módulo 4. Lo nuevo: tu mano derecha lleva el tiempo y nunca se detiene. El cambio de acorde ocurre ENTRE rasgueos.',
                stuck: 'Drop to just Am ↔ G until the strum survives that change, then add the F back.',
                stuck_es: 'Baja a solo Am ↔ G hasta que el rasgueo sobreviva ese cambio, y luego agrega de vuelta el F.',
                levelUp: 'Speed up in steps of 5 BPM: 60 → 65 → 70. Or count "1 + 2 + 3 + 4 +" out loud the whole time.',
                levelUp_es: 'Acelera de 5 en 5 BPM: 60 → 65 → 70. O cuenta "1 + 2 + 3 + 4 +" en voz alta todo el tiempo.',
                skills: [2, 5]
              },
              {
                label: 'Challenge — "Knockin\' on Heaven\'s Door"', label_es: 'Reto — "Knockin\' on Heaven\'s Door"',
                text: '<ul><li>Play the real bar lengths — G · D · Am · Am · G · D · C · C — four beats of down-up per bar at 60 BPM. Am and C each hold for two full bars; the record is slow too, so this song never rushes you.</li></ul>You\'ve got it when: one full lap (all eight bars) with light, controlled upstrokes and every change landing on beat 1.',
                text_es: '<ul><li>Toca la duración real de los compases — G · D · Am · Am · G · D · C · C — cuatro tiempos de abajo-arriba por compás a 60 BPM. Am y C se sostienen cada uno durante dos compases completos; la grabación también es lenta, así que esta canción nunca te apura.</li></ul>Lo tienes cuando: una vuelta completa (los ocho compases) con golpes hacia arriba ligeros y controlados, y cada cambio cayendo en el tiempo 1.',
                hint: 'Dylan built this song to support a voice — keep the 8ths soft and even. If an upstroke catches the strings, let the pick brush only the thin strings (high e, B, G).',
                hint_es: 'Dylan construyó esta canción para apoyar una voz — mantén las corcheas suaves y parejas. Si un golpe hacia arriba engancha las cuerdas, deja que la púa roce solo las cuerdas delgadas (mi aguda, Si, Sol).',
                stuck: 'Am and C each get two full bars, so after landing on either one there is no change to make until the bar after next. G → D, D → Am, Am → G, D → C, and C → G all reset the whole hand, so loop those one at a time.',
                stuck_es: 'Am y C se sostienen cada uno durante dos compases completos, así que después de llegar a cualquiera de los dos no hay que cambiar hasta dentro de dos compases. G → D, D → Am, Am → G, D → C, y C → G reinician toda la mano, así que repite esos uno a la vez.',
                levelUp: 'Sing or hum a line over your own strumming, or speed up to 70 BPM with the 8ths still even.',
                levelUp_es: 'Canta o tararea una línea sobre tu propio rasgueo, o acelera a 70 BPM manteniendo las corcheas parejas.',
                skills: [2, 4],
              }
            ]
          }
        ]
      }
    },

    skills: [
      { id: 'm6w1-s1', text: 'Keep my strumming wrist moving, even between strums',
        text_es: 'Mantener mi muñeca de rasgueo en movimiento, incluso entre rasgueos',
        gotItWhen: 'a phone video or a mirror shows that your strumming hand never stops. It moves down or up even when you skip a strum.',
        gotItWhen_es: 'un video del teléfono o un espejo muestra que tu mano de rasgueo nunca se detiene. Baja o sube incluso cuando te saltas un rasgueo.',
        practice: { type: 'mc', prompt: 'When the wrist "stops" between strums, what usually goes wrong?',
          prompt_es: 'Cuando la muñeca "se detiene" entre rasgueos, ¿qué suele salir mal?',
          choices: ['Nothing — stopping keeps the strums cleaner', 'You lose the pulse and drift off the beat', 'The pick slips out of your fingers', 'The chord rings louder on the next strum'],
          choices_es: ['Nada — detenerse mantiene los rasgueos más limpios', 'Pierdes el pulso y te sales del tiempo', 'La púa se te resbala de los dedos', 'El acorde suena más fuerte en el siguiente rasgueo'], answer: 1,
          explain: 'The pendulum swing keeps the beat. If you stop your hand, you lose the pulse, and the next strum lands early or late. Keep your hand moving, even on strums you skip.',
          explain_es: 'El balanceo de péndulo mantiene el tiempo. Si detienes la mano, pierdes el pulso, y el siguiente rasgueo cae temprano o tarde. Mantén la mano en movimiento, incluso en los rasgueos que te saltas.' } },
      { id: 'm6w1-s2', text: 'Play a steady down-up 8th-note pattern at 60 BPM for 8 bars',
        text_es: 'Tocar un patrón de corcheas abajo-arriba constante a 60 BPM durante 8 compases',
        gotItWhen: 'you strum down-up at 60 BPM for 8 bars and every strum lands with the metronome.',
        gotItWhen_es: 'rasgueas abajo-arriba a 60 BPM durante 8 compases y cada rasgueo cae con el metrónomo.',
        practice: { type: 'pr', prompt: '<ol><li>Strum down-up 8th notes on one chord, every strum landing with the click, for 8 bars.</li><li>Start at 60 BPM and raise the metronome +5 at a time.</li><li>Log your fastest even BPM.</li></ol>',
          prompt_es: '<ol><li>Rasguea corcheas abajo-arriba sobre un acorde, con cada rasgueo cayendo con el clic, durante 8 compases.</li><li>Empieza a 60 BPM y sube el metrónomo de 5 en 5.</li><li>Anota tu BPM parejo más rápido.</li></ol>',
          unit: 'BPM', placeholder: 'e.g. 70 — try for a higher number next session', placeholder_es: 'p. ej. 70 — intenta superarlo la próxima sesión' } },
      { id: 'm6w1-s3', text: 'Count "1 + 2 + 3 + 4 +" out loud while strumming',
        text_es: 'Contar "1 + 2 + 3 + 4 +" en voz alta mientras rasgueas',
        gotItWhen: 'you count out loud while you strum, with every number on a downstroke and every "+" on an upstroke.',
        gotItWhen_es: 'cuentas en voz alta mientras rasgueas, con cada número en un golpe hacia abajo y cada "+" en un golpe hacia arriba.',
        practice: { type: 'mc', prompt: 'In "1 + 2 + 3 + 4 +", which counts are the DOWNSTROKES?',
          prompt_es: 'En "1 + 2 + 3 + 4 +", ¿cuáles tiempos son los GOLPES HACIA ABAJO?',
          choices: ['The "+" (and) counts', 'The numbers (1, 2, 3, 4)', 'All of them', 'Only beat 1'],
          choices_es: ['Los tiempos de "+" (la "y")', 'Los números (1, 2, 3, 4)', 'Todos', 'Solo el tiempo 1'], answer: 1,
          explain: 'The numbers are the beats, and your hand is always traveling down when a beat arrives — so numbers = downstrokes, "+" = upstrokes. Keeping that fixed means you never have to decide mid-bar.',
          explain_es: 'Los números son los tiempos, y tu mano siempre va bajando cuando llega un tiempo — así que números = rasgueos hacia abajo, "+" = rasgueos hacia arriba. Mantener eso fijo hace que nunca tengas que decidirlo a mitad del compás.' } },
      { id: 'm6w1-s4', text: 'Strum with even timing, with upstrokes lighter than downstrokes',
        text_es: 'Rasguear con tiempo parejo, con los golpes hacia arriba más ligeros que los de abajo',
        gotItWhen: 'your strums are evenly spaced, your upstrokes are lighter than your downstrokes, and the pick does not catch the strings on the way up.',
        gotItWhen_es: 'tus rasgueos van parejos, tus golpes hacia arriba son más ligeros que los de abajo, y la púa no se engancha en las cuerdas al subir.',
        practice: { type: 'mc', prompt: 'Your upstrokes sound weak and uneven compared with your downstrokes. What fixes it?',
          prompt_es: 'Tus golpes hacia arriba suenan débiles y disparejos comparados con los de abajo. ¿Qué lo arregla?',
          choices: ['Relax the wrist and brush only the thin strings', 'Grip the pick harder and push into the strings on the way up', 'Skip the upstrokes until they\'re perfect', 'Swing the whole arm up for more power'],
          choices_es: ['Relajar la muñeca y rozar solo las cuerdas delgadas', 'Apretar más la púa y clavarla en el camino hacia arriba', 'Saltarte los golpes hacia arriba hasta que salgan perfectos', 'Subir todo el brazo para tener más fuerza'], answer: 0,
          explain: 'An upstroke is not a downstroke in reverse. A relaxed wrist that brushes only the thin strings (high e, B, G) sounds even. Gripping harder or using the whole arm makes the pick catch more.',
          explain_es: 'Un golpe hacia arriba no es uno de abajo al revés. Una muñeca relajada que roza solo las cuerdas delgadas (mi aguda, Si, Sol) suena pareja. Apretar más o usar todo el brazo hace que la púa se enganche más.' } },
      { id: 'm6w1-s5', text: 'Keep the strum hand moving through a chord change',
        text_es: 'Mantener la mano de rasgueo en movimiento a través de un cambio de acorde',
        gotItWhen: 'you change from Em to Am (or any two chords) and your strumming hand keeps moving. The chord changes between strums.',
        gotItWhen_es: 'cambias de Em a Am (o entre dos acordes cualesquiera) y tu mano de rasgueo sigue moviéndose. El acorde cambia entre rasgueos.',
        practice: { type: 'mc', prompt: 'Every time you change Em → Am, there is a silent gap in your strum. What fixes it?',
          prompt_es: 'Cada vez que cambias de Em → Am, hay un hueco en silencio en tu rasgueo. ¿Qué lo arregla?',
          choices: ['Stop strumming until the new chord is ready', 'Never pause the swing — let the new chord land a little late', 'Strum extra hard to cover the gap', 'Lift the pick off the strings during the change'],
          choices_es: ['Dejar de rasguear hasta que el acorde nuevo esté listo', 'No pausar nunca el balanceo; el acorde llega un poco tarde', 'Rasguear extra fuerte para cubrir el hueco', 'Levantar la púa de las cuerdas durante el cambio'], answer: 1,
          explain: 'The strum hand keeps its down-up swing and the fretting hand does the changing. If you stop to wait for the chord, a small mistake becomes a break in the beat.',
          explain_es: 'La mano de rasgueo mantiene su balanceo abajo-arriba y la mano de trastear es la que hace el cambio. Si te detienes a esperar el acorde, un error pequeño se convierte en una interrupción del tiempo.' } },
      { id: 'm6w1-s6', text: 'Play 4 bars of Em then 4 bars of Am with a continuous down-up strum',
        text_es: 'Tocar 4 compases de Em y luego 4 compases de Am con un rasgueo abajo-arriba continuo',
        gotItWhen: 'you loop 4 bars of Em and 4 bars of Am with a down-up strum at 60 BPM and never break the rhythm, even when a change is not clean.',
        gotItWhen_es: 'repites 4 compases de Em y 4 de Am con un rasgueo abajo-arriba a 60 BPM sin romper nunca el ritmo, aunque un cambio no salga limpio.',
        practice: { type: 'playSeq', label: 'Em → Am roots, 4 bars each (one note per beat)', label_es: 'Raíces Em → Am, 4 compases cada una (una nota por tiempo)', bpm: 60,
          notes: [
            40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40,
            45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45
          ] } }
    ]
  },

  {
    id: 'm6w2',
    label: 'Set 2',
    locked: false,
    module: 'Strumming Patterns with Chords',
    moduleNum: 6,
    unit: 'Module 6 · Strumming Patterns with Chords',
    unit_es: 'Módulo 6 · Patrones de rasgueo con acordes',
    title: 'Set 2',
    subtitle: 'The "D-DU-UDU" pattern · Rests and accents · Adding groove (the steady rhythmic feel)',
    subtitle_es: 'El patrón "D-DU-UDU" · Silencios y acentos · Agregar groove (la sensación rítmica constante)',
    skillFocus: 'Playing the D-DU-UDU strum pattern · Adding accents and rests · Reading strum-pattern notation',
    skillFocus_es: 'Tocar el patrón de rasgueo D-DU-UDU · Agregar acentos y silencios · Leer la notación de patrones de rasgueo',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        title_es: 'Estación de computadora — Mira · Escucha · Practica',
        sections: [
          {
            title: 'Watch: the D-DU-UDU pattern',
            title_es: 'Mira: el patrón D-DU-UDU',
            steps: [
          {
            label: 'Watch: the D-DU-UDU pattern', label_es: 'Mira: el patrón D-DU-UDU',
            text: 'Watch: <a href="https://youtu.be/6LmQCdt_ZhQ" target="_blank">The Most Common Strumming Pattern of All Time! – JustinGuitar</a> (0:00–4:00).<ol><li>Strum in the air along with him.</li><li>Find the two places where the pick misses the strings. The wrist keeps moving there.</li></ol>Then answer the question below.',
            text_es: 'Mira: <a href="https://youtu.be/6LmQCdt_ZhQ" target="_blank">The Most Common Strumming Pattern of All Time! – JustinGuitar</a> (0:00–4:00).<ol><li>Rasguea en el aire junto con él.</li><li>Encuentra los dos lugares donde la púa no toca las cuerdas. Ahí la muñeca sigue moviéndose.</li></ol>Luego responde la pregunta de abajo.',
            hint: 'This is the folk strum from Module 4, D · D U · U D U: the same six strums.',
            hint_es: 'Este es el rasgueo folk del Módulo 4, D · D U · U D U: los mismos seis rasgueos.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'In the D-DU-UDU pattern, which UPSTROKE is skipped (the wrist swings up but the pick misses)?',
              prompt_es: 'En el patrón D-DU-UDU, ¿cuál GOLPE HACIA ARRIBA se salta (la muñeca sube pero la púa falla)?',
              answer: 0,
              explain: 'Reading "D - DU - UDU" over "1 + 2 + 3 + 4 +", the skipped upstroke is the "+" of beat 1 — the wrist swings up but the pick misses on purpose. (Beat 3, a downstroke, is the other skip.)',
              explain_es: 'Leyendo "D - DU - UDU" sobre "1 + 2 + 3 + 4 +", el golpe hacia arriba que se salta es el "+" del tiempo 1 — la muñeca sube pero la púa falla a propósito. (El tiempo 3, un golpe hacia abajo, es el otro que se salta.)',
              choices: [
              'The "+" of beat 1',
              'The "+" of beat 2',
              'The "+" of beat 4',
              'Beat 1'
            ],
              choices_es: [
              'El "+" del tiempo 1',
              'El "+" del tiempo 2',
              'El "+" del tiempo 4',
              'El tiempo 1'
            ] }
          },
          {
            label: 'Watch: backbeat accents', label_es: 'Mira: acentos en los tiempos 2 y 4',
            text: 'Watch: <a href="https://youtu.be/0JDGO0n6tjw" target="_blank">Step-by-Step Easy Strumming Patterns – Marty Music</a> (0:00–3:00).<ol><li>Clap along with him.</li><li>Clap louder on beats 2 and 4. Louder beats 2 and 4 are called the backbeat.</li></ol>You\'ve got it when: you clap four bars with the video, with beats 2 and 4 clearly louder than beats 1 and 3.',
            text_es: 'Mira: <a href="https://youtu.be/0JDGO0n6tjw" target="_blank">Step-by-Step Easy Strumming Patterns – Marty Music</a> (0:00–3:00).<ol><li>Aplaude junto con él.</li><li>Aplaude más fuerte en los tiempos 2 y 4. Los tiempos 2 y 4 más fuertes se llaman contratiempo.</li></ol>Lo tienes cuando: aplaudes cuatro compases con el video, con los tiempos 2 y 4 claramente más fuertes que el 1 y el 3.',
            hint: 'Louder beats 2 and 4 match the snare drum in most songs.',
            hint_es: 'Los tiempos 2 y 4 más fuertes coinciden con la tarola en la mayoría de las canciones.',
            skills: [1, 3],
          }
            ]
          },
          {
            title: 'Tap the pattern with a real song',
            title_es: 'Marca el patrón con una canción real',
            steps: [
          {
            label: 'Tap along: I\'m Yours', label_es: 'Marca el patrón: I\'m Yours',
            text: 'Listen to <a href="https://www.youtube.com/watch?v=EkHTsc9PU2A" target="_blank">"I\'m Yours" by Jason Mraz</a>. Tap the D-DU-UDU pattern on your leg with the song. You\'ve got it when: you tap the pattern with the song for 4 bars in a row without losing your place.',
            text_es: 'Escucha <a href="https://www.youtube.com/watch?v=EkHTsc9PU2A" target="_blank">"I\'m Yours" de Jason Mraz</a>. Marca el patrón D-DU-UDU en tu pierna junto con la canción. Lo tienes cuando: marcas el patrón con la canción durante 4 compases seguidos sin perder tu lugar.',
            hint: 'Say "1" each time a new bar starts. Check where your hand is in the pattern.',
            hint_es: 'Di "1" cada vez que empieza un compás nuevo. Fíjate en qué parte del patrón está tu mano.',
            skills: [1, 5],
            response: { type: 'mc', prompt: 'In "I\'m Yours", how often does the D-DU-UDU pattern start over?',
              prompt_es: 'En "I\'m Yours", ¿cada cuánto vuelve a empezar el patrón D-DU-UDU?',
              answer: 0,
              explain: 'D-DU-UDU fills exactly one bar: "1 + 2 + 3 + 4 +". On the next beat 1 it starts again, all through the song.',
              explain_es: 'D-DU-UDU llena exactamente un compás: "1 + 2 + 3 + 4 +". En el siguiente tiempo 1 vuelve a empezar, durante toda la canción.',
              choices: [
              'On every beat 1 — the pattern is one bar long',
              'On every beat 3 — the pattern is two beats long',
              'Every other bar — the pattern is two bars long',
              'Every fourth bar — the pattern is four bars long'
            ],
              choices_es: [
              'En cada tiempo 1 — el patrón dura un compás',
              'En cada tiempo 3 — el patrón dura dos tiempos',
              'Cada dos compases — el patrón dura dos compases',
              'Cada cuatro compases — el patrón dura cuatro compases'
            ] }
          }
            ]
          },
          {
            title: 'Form today\'s chords',
            title_es: 'Forma los acordes de hoy',
            steps: [
          {
            label: 'Form G and D', label_es: 'Forma G y D',
            text: 'Today\'s chords are G and D.<ol><li>Play G from the diagram and strum once.</li><li>Play D from the diagram and strum once.</li></ol>You\'ve got it when: every string in each chord rings clean.',
            text_es: 'Los acordes de hoy son G y D.<ol><li>Toca G a partir del diagrama y rasguea una vez.</li><li>Toca D a partir del diagrama y rasguea una vez.</li></ol>Lo tienes cuando: cada cuerda de cada acorde suena limpia.',
            hint: 'G uses all six strings. D skips the two lowest strings (the X marks).',
            hint_es: 'G usa las seis cuerdas. D se salta las dos cuerdas más graves (las marcas X).',
            chords: [
              { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
              { name: 'D', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'1'],[2,3,'3'],[1,2,'2']], position: 0 }
            ]
          }
            ]
          },
          {
            kind: 'reflection',
            title: 'Checkpoint',
            title_es: 'Punto de control',
            steps: [
          {
            label: 'Checkpoint', label_es: 'Punto de control',
            text: 'Checkpoint — pause and think: in the D-DU-UDU pattern, what is harder for you right now — skipping a strum while the wrist keeps moving, or landing the accents on beats 2 and 4? What helped today?',
            text_es: 'Punto de control — pausa y piensa: en el patrón D-DU-UDU, ¿qué te confunde más ahora mismo — saltarte un rasgueo mientras la muñeca sigue en movimiento, o hacer caer los acentos en los tiempos 2 y 4? ¿Qué te ayudó hoy?',
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — D-DU-UDU pattern drill',
        title_es: 'Estación de práctica — ejercicio del patrón D-DU-UDU',
        sections: [
          {
            title: 'Warm-up — recall the down-up (Set 1)',
            title_es: 'Calentamiento — recuerda el abajo-arriba (Unidad 1)',
            steps: [
              {
                label: 'Warm-up: down-up', label_es: 'Calentamiento: abajo-arriba',
                text: '<ol><li>Play Em.</li><li>Strum down-up at 60 BPM for 4 bars. This is the same strum as Set 1.</li></ol>You\'ve got it when: you play 4 bars and your hand never stops.',
                text_es: '<ol><li>Toca Em.</li><li>Rasguea abajo-arriba a 60 BPM durante 4 compases. Es el mismo rasgueo de la Unidad 1.</li></ol>Lo tienes cuando: tocas 4 compases y tu mano nunca se detiene.',
                hint: 'D-DU-UDU is this same down-up with two strums left out.',
                hint_es: 'D-DU-UDU es este mismo abajo-arriba con dos rasgueos de menos.',
                playSeq: { label: 'Hear the 8th-note pulse', label_es: 'Escucha el pulso de corcheas', bpm: 60, notes: [
                  {midi:64,beats:0.5},{midi:64,beats:0.5},{midi:64,beats:0.5},{midi:64,beats:0.5},
                  {midi:64,beats:0.5},{midi:64,beats:0.5},{midi:64,beats:0.5},{midi:64,beats:0.5}
                ] }
              }
            ]
          },
          {
            title: 'Learn the D-DU-UDU pattern',
            title_es: 'Aprende el patrón D-DU-UDU',
            steps: [
          /* Two stepping stones between straight eighths and the full
             pattern (2026-09-20). Inserted, not appended: nobody has
             reached Module 3, so Modules 3-6 may gain a step inside a
             section. Deliberately NOT numbered "Challenge N" — the set's
             numbered run stays 1-3, and m6w2's take-to-song hint points
             at "Challenge 3" by name. */
          {
            label: 'Rhythm step 1 — one gap', label_es: 'Paso de ritmo 1 — un hueco',
            text: 'Strum down-up, but leave out one strum: the up after beat 1. Your hand still moves up there, but the pick misses.<ol><li>Mute the strings.</li><li>Play it at 60 BPM and count out loud.</li></ol><div class="strum-line">D   &middot;   D   U   D   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>You\'ve got it when: you play four bars with only that one up missing and your hand never stops.',
            text_es: 'Rasguea abajo-arriba, pero deja fuera un rasgueo: el de arriba después del tiempo 1. Tu mano sigue subiendo ahí, pero la púa no toca.<ol><li>Silencia las cuerdas.</li><li>Tócalo a 60 BPM y cuenta en voz alta.</li></ol><div class="strum-line">D   &middot;   D   U   D   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>Lo tienes cuando: tocas cuatro compases donde solo falta ese golpe hacia arriba y tu mano nunca se detiene.',
            hint: 'Count "1 and 2 and 3 and 4 and". Do not hit the strings on the first "and".',
            hint_es: 'Cuenta "1 y 2 y 3 y 4 y". No toques las cuerdas en el primer "y".',
            skills: [1, 2]
          },
          {
            label: 'Rhythm step 2 — the hard gap', label_es: 'Paso de ritmo 2 — el hueco difícil',
            text: 'Strum down-up, but leave out one strum: the down on beat 3. Your hand still moves down there, but the pick misses.<ol><li>Mute the strings.</li><li>Play it at 60 BPM and count out loud.</li></ol><div class="strum-line">D   U   D   U   &middot;   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>You\'ve got it when: you play four bars with only that one down missing and your hand never stops.',
            text_es: 'Rasguea abajo-arriba, pero deja fuera un rasgueo: el de abajo en el tiempo 3. Tu mano sigue bajando ahí, pero la púa no toca.<ol><li>Silencia las cuerdas.</li><li>Tócalo a 60 BPM y cuenta en voz alta.</li></ol><div class="strum-line">D   U   D   U   &middot;   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>Lo tienes cuando: tocas cuatro compases donde solo falta ese golpe hacia abajo y tu mano nunca se detiene.',
            hint: 'Put this gap and the gap from the last step together and you get D-DU-UDU.',
            hint_es: 'Junta este hueco y el del paso anterior y obtienes D-DU-UDU.',
            skills: [1, 2]
          },
          {
            label: 'Challenge 1 — D-DU-UDU, Muted Strings', label_es: 'Reto 1 — D-DU-UDU con cuerdas silenciadas',
            text: '<ol><li>Mute the strings.</li><li>Strum "Down, Down-Up, Up-Down-Up" (D-DU-UDU) at 60 BPM.</li><li>On each "·", keep your hand moving but miss the strings.</li></ol><div class="strum-line">D   ·   D   U   ·   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>You\'ve got it when: you play four bars in a row and your wrist never stops.',
            text_es: '<ol><li>Silencia las cuerdas.</li><li>Rasguea "Abajo, Abajo-Arriba, Arriba-Abajo-Arriba" (D-DU-UDU) a 60 BPM.</li><li>En cada "·", mantén la mano en movimiento pero no toques las cuerdas.</li></ol><div class="strum-line">D   ·   D   U   ·   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>Lo tienes cuando: tocas cuatro compases seguidos y tu muñeca nunca se detiene.',
            hint: 'The hardest part is beat 3. Your wrist still moves down there, but the pick misses.',
            hint_es: 'La parte más difícil es el tiempo 3. Tu muñeca sigue bajando ahí, pero la púa no toca.',
            stuck: 'Say "down, down-up, up-down-up" out loud. Then strum it in the air with no pick.',
            stuck_es: 'Di "abajo, abajo-arriba, arriba-abajo-arriba" en voz alta. Luego rasguéalo en el aire sin púa.',
            levelUp: 'Play it at 75 BPM, or accent the first down of each bar. An accent is a louder strum.',
            levelUp_es: 'Tócalo a 75 BPM, o acentúa el primer golpe hacia abajo de cada compás. Un acento es un rasgueo más fuerte.',
            skills: [1, 2, 6]
          }
            ]
          },
          {
            title: 'Play the pattern with accents on beats 2 and 4',
            title_es: 'Toca el patrón con acentos en los tiempos 2 y 4',
            steps: [
          {
            label: 'Challenge 2 — D-DU-UDU on Em', label_es: 'Reto 2 — D-DU-UDU en Em',
            text: 'An accent is a louder strum.<ol><li>Play Em.</li><li>Play D-DU-UDU at 60 BPM for 8 bars and count out loud.</li><li>Accent beats 2 and 4.</li></ol>You\'ve got it when: you play 8 bars in a row with beats 2 and 4 clearly louder than beats 1 and 3.',
            text_es: 'Un acento es un rasgueo más fuerte.<ol><li>Toca Em.</li><li>Toca D-DU-UDU a 60 BPM durante 8 compases y cuenta en voz alta.</li><li>Acentúa los tiempos 2 y 4.</li></ol>Lo tienes cuando: tocas 8 compases seguidos con los tiempos 2 y 4 claramente más fuertes que los tiempos 1 y 3.',
            hint: 'In this pattern, beats 2 and 4 are downstrokes. Hit those two a little harder.',
            hint_es: 'En este patrón, los tiempos 2 y 4 son golpes hacia abajo. Tócalos un poco más fuerte.',
            stuck: 'Leave out the accents first. Play the pattern clean for 8 bars. Then add the accents.',
            stuck_es: 'Primero deja fuera los acentos. Toca el patrón limpio durante 8 compases. Luego agrega los acentos.',
            levelUp: 'Play it on G or D, or at 75 BPM.',
            levelUp_es: 'Tócalo en G o D, o a 75 BPM.',
            skills: [1, 3],
            playSeq: { label: 'Hear the beat — add your own accent on 2 and 4', label_es: 'Escucha el tiempo — agrega tu propio acento en el 2 y el 4', bpm: 60, notes: [40, 47, 40, 47] }
          },
          /* Inserted 2026-09-24 (pre-release review F7): m6w2-s6 asks for a
             first-time read of a strum-line, and no step had one. Open
             regime — Module 6 may gain a step inside a section. */
          {
            label: 'Read a new strum-line', label_es: 'Lee una línea de rasgueo nueva',
            text: 'You have not played this strum-line before.<ol><li>Play Em.</li><li>Read the line and count "1 + 2 + 3 + 4 +" out loud.</li><li>Play it for one bar at 60 BPM. On each "·", move past the strings without hitting them.</li><li>Press &#x25B6; to hear the one-bar playback. Compare it with your bar.</li></ol><div class="strum-line">D   ·   D   U   D   U   D   ·\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>You\'ve got it when: your bar matches the playback on your first try.',
            text_es: 'Nunca has tocado esta línea de rasgueo.<ol><li>Toca Em.</li><li>Lee la línea y cuenta "1 + 2 + 3 + 4 +" en voz alta.</li><li>Tócala durante un compás a 60 BPM. En cada "·", pasa junto a las cuerdas sin tocarlas.</li><li>Presiona &#x25B6; para escuchar la grabación de un compás. Compárala con tu compás.</li></ol><div class="strum-line">D   ·   D   U   D   U   D   ·\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>Lo tienes cuando: tu compás coincide con la grabación en tu primer intento.',
            hint: 'D is a downstroke. U is an upstroke. "·" means your hand moves but misses the strings.',
            hint_es: 'D es un golpe hacia abajo. U es un golpe hacia arriba. "·" significa que tu mano se mueve pero no toca las cuerdas.',
            stuck: 'Say the line out loud first: "down, miss, down, up, down, up, down, miss". Then strum it in the air with no pick.',
            stuck_es: 'Di la línea en voz alta primero: "abajo, nada, abajo, arriba, abajo, arriba, abajo, nada". Luego rasguéala en el aire sin púa.',
            levelUp: 'Make up your own strum-line with two "·" slots. Say it, then play it four bars in a row.',
            levelUp_es: 'Inventa tu propia línea de rasgueo con dos espacios "·". Dila, y luego tócala cuatro compases seguidos.',
            skills: [6],
            playSeq: { label: 'Check it — D · D U D U D · on Em', label_es: 'Compruébalo — D · D U D U D · en Em', bpm: 60, notes: [
              { midi: [40,47,52,55,59,64], beats: 1 },
              { midi: [40,47,52,55,59,64], beats: 0.5 }, { midi: [55,59,64], beats: 0.5 },
              { midi: [40,47,52,55,59,64], beats: 0.5 }, { midi: [55,59,64], beats: 0.5 },
              { midi: [40,47,52,55,59,64], beats: 1 }
            ] },
            chords: [
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Hold the pattern through a chord change',
            title_es: 'Mantén el patrón a través de un cambio de acorde',
            steps: [
          {
            label: 'Challenge 3 — G → D, Pattern Locked (assessment preparation)', label_es: 'Reto 3 — G → D, patrón asegurado (preparación para la evaluación)',
            text: '<ol><li>Play G for 2 bars, then D for 2 bars, with D-DU-UDU.</li><li>Change chords on the last upstroke before the new chord. Your hand is already moving up then.</li><li>Set the ⏱ Timer for 3 minutes and repeat.</li></ol>You\'ve got it when: you play the G-to-D loop four times with all six strums in every bar.',
            text_es: '<ol><li>Toca G durante 2 compases, y luego D durante 2 compases, con D-DU-UDU.</li><li>Cambia de acorde en el último golpe hacia arriba antes del acorde nuevo. Tu mano ya va subiendo en ese momento.</li><li>Pon el ⏱ Temporizador en 3 minutos y repite.</li></ol>Lo tienes cuando: tocas la vuelta de G a D cuatro veces con los seis rasgueos en cada compás.',
            hint: 'If the pattern falls apart at the change, slow to 50 BPM. Keep the pattern going even if a note in the chord is missing.',
            hint_es: 'Si el patrón se desarma en el cambio, baja a 50 BPM. Mantén el patrón aunque falte una nota del acorde.',
            stuck: 'Play only the last bar of G and the first bar of D. Repeat until the change is smooth.',
            stuck_es: 'Toca solo el último compás de G y el primer compás de D. Repite hasta que el cambio salga fluido.',
            levelUp: 'Add Em after D (G, D, Em), or play it at 75 BPM.',
            levelUp_es: 'Agrega Em después de D (G, D, Em), o tócalo a 75 BPM.',
            skills: [1, 4],
          }
            ]
          },
          {
            kind: 'take-to-song',
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — I\'m Yours, verse', label_es: 'Reto — I\'m Yours, estrofa',
                text: '<ul><li>Play G · D · Em · C with D-DU-UDU, one bar per chord at 60 BPM — this is THE song this pattern is famous for.</li></ul>You\'ve got it when: the verse loop start to finish with the pattern identical on every chord — even when a chord lands imperfect, the groove holds.',
                text_es: '<ul><li>Toca G · D · Em · C con D-DU-UDU, un compás por acorde a 60 BPM — esta es LA canción por la que este patrón es famoso.</li></ul>Lo tienes cuando: el loop de la estrofa de principio a fin con el patrón idéntico en cada acorde — incluso cuando un acorde no sale perfecto, el groove se mantiene.',
                hint: 'Most of this song\'s sound is the strum pattern. If it breaks at a change, the fix is Challenge 3\'s trick: jump chords on the last upstroke of the bar.',
                hint_es: 'La mayor parte del sonido de esta canción es el patrón de rasgueo. Si se rompe en un cambio, el arreglo es el truco del Reto 3: salta de acorde en el último golpe hacia arriba del compás.',
                stuck: 'Play the loop with one strum per bar until the changes are clean, then layer the pattern back on.',
                stuck_es: 'Toca el loop con un rasgueo por compás hasta que los cambios salgan limpios, y luego vuelve a agregar el patrón.',
                levelUp: 'Accent beats 2 and 4 to match the recording\'s bouncy feel, or push to 75 BPM.',
                levelUp_es: 'Acentúa los tiempos 2 y 4 para igualar la sensación rebotante de la grabación, o sube a 75 BPM.',
                skills: [4, 5],
                playSeq: { label: '"I\'m Yours" verse roots (G · D · Em · C)', label_es: 'Raíces de la estrofa de "I\'m Yours" (G · D · Em · C)', bpm: 60, notes: [43, 50, 40, 48] }
              },
              {
                label: 'Challenge — "Oye Mi Amor", verse', label_es: 'Reto — "Oye Mi Amor", estrofa',
                text: '<ol><li>The verse uses two chords, Bm and A (A is from Module 4). Play the small Bm on just four strings (D, G, B, high e), no barre.</li><li>Play one bar of each with D-DU-UDU at 60 BPM.</li></ol>You\'ve got it when: four laps with the pattern unbroken and beats 2 and 4 accented so it pushes like the record.',
                text_es: '<ol><li>La estrofa usa dos acordes, Bm y A (A es del Módulo 4). Toca el Bm pequeño en solo cuatro cuerdas (Re, Sol, Si, mi aguda), sin cejilla.</li><li>Toca un compás de cada uno con D-DU-UDU a 60 BPM.</li></ol>Lo tienes cuando: cuatro vueltas con el patrón sin interrupciones y los tiempos 2 y 4 acentuados para que empuje como la grabación.',
                hint: 'The small Bm is the easier beginner version — the full-barre Bm (one finger pressed flat across several strings) arrives in Module 7.',
                hint_es: 'El Bm pequeño es la versión más fácil para principiantes — el Bm con cejilla completa (un dedo presionado plano sobre varias cuerdas) llega en el Módulo 7.',
                stuck: 'Loop just the A → Bm change with one strum per bar until the landing is clean, then add the pattern.',
                stuck_es: 'Repite solo el cambio A → Bm con un rasgueo por compás hasta que la llegada salga limpia, y luego agrega el patrón.',
                levelUp: 'Play the up-strums a little stronger — that extra offbeat push is the Latin feel.',
                levelUp_es: 'Toca los golpes hacia arriba un poco más fuerte — ese empuje extra de contratiempo es la sensación latina.',
                skills: [3, 5],
                chords: [
                  { name: 'Bm', chord: [[6,'x'],[5,'x'],[4,4,'4'],[3,4,'3'],[2,3,'2'],[1,2,'1']], position: 2 }
                ],
              }
            ]
          },
          {
            kind: 'ear-spark',
            title: 'Ear Spark — optional ear bonus',
            title_es: 'Chispa auditiva — bono opcional de oído',
            steps: [
              {
                label: 'Ear Spark: rhythm echo', label_es: 'Chispa auditiva: eco de ritmo',
                text: 'Ear Spark (optional, 2 min):<ol><li>Play any lesson video from this set and pause right after one bar of strumming.</li><li>Clap the rhythm back exactly.</li><li>Play it as muted strums.</li></ol>Rhythm echo is ear training too.',
                text_es: 'Chispa auditiva (opcional, 2 min):<ol><li>Reproduce cualquier video de lección de esta unidad y pausa justo después de un compás de rasgueo.</li><li>Aplaude el ritmo exactamente igual.</li><li>Tócalo como rasgueos silenciados.</li></ol>El eco rítmico también es entrenamiento auditivo.'
              }
            ]
          },
          {
            title: 'Play along with the video',
            title_es: 'Toca junto con el video',
            steps: [
              {
                label: 'Play-along at 0.75×', label_es: 'Toca junto a 0.75×',
                text: '<ol><li>Open the D-DU-UDU video from the start of this set.</li><li>Set the YouTube speed to 0.75×.</li><li>Strum along through the whole demo section.</li></ol>You\'ve got it when: you play to the end of the demo section without stopping, even if some changes go wrong.',
                text_es: '<ol><li>Abre el video de D-DU-UDU del inicio de esta unidad.</li><li>Pon la velocidad de YouTube en 0.75×.</li><li>Rasguea junto con él durante toda la sección de demostración.</li></ol>Lo tienes cuando: tocas hasta el final de la demostración sin detenerte, aunque algunos cambios salgan mal.',
                hint: 'If you make a mistake, keep strumming.',
                hint_es: 'Si te equivocas, sigue rasgueando.'
              }
            ]
          }
        ]
      }
    },

    skills: [
      { id: 'm6w2-s1', text: 'Play the D-DU-UDU pattern cleanly at 60 BPM',
        text_es: 'Tocar el patrón D-DU-UDU de forma limpia a 60 BPM',
        gotItWhen: 'you play D-DU-UDU on one chord at 60 BPM for 4 bars in a row without breaking the pattern or stopping your wrist.',
        gotItWhen_es: 'tocas D-DU-UDU en un acorde a 60 BPM durante 4 compases seguidos sin romper el patrón ni detener la muñeca.',
        practice: { type: 'pr', prompt: '<ol><li>Play D-DU-UDU on a single chord, 4 bars in a row, wrist never stopping.</li><li>Start at 60 BPM and raise the metronome +5 at a time.</li><li>Log your fastest clean BPM.</li></ol>',
          prompt_es: '<ol><li>Toca D-DU-UDU sobre un solo acorde, 4 compases seguidos, sin que la muñeca se detenga.</li><li>Empieza a 60 BPM y sube el metrónomo de 5 en 5.</li><li>Anota tu BPM limpio más rápido.</li></ol>',
          unit: 'BPM', placeholder: 'e.g. 70 — try for a higher number next session', placeholder_es: 'p. ej. 70 — intenta superarlo la próxima sesión' } },
      { id: 'm6w2-s2', text: 'Skip a downstroke while keeping the wrist in motion',
        text_es: 'Saltarse un golpe hacia abajo manteniendo la muñeca en movimiento',
        gotItWhen: 'on the skipped strum, your wrist still moves down and only the pick misses the strings. A phone video or a mirror shows it.',
        gotItWhen_es: 'en el rasgueo que te saltas, tu muñeca sigue bajando y solo la púa no toca las cuerdas. Un video del teléfono o un espejo lo muestra.',
        practice: { type: 'mc', prompt: 'In your D-DU-UDU, the up-strum right after beat 3 comes in early. Which habit fixes it?',
          prompt_es: 'En tu D-DU-UDU, el golpe hacia arriba justo después del tiempo 3 entra antes de tiempo. ¿Qué hábito lo arregla?',
          choices: ['Pause on beat 3 and wait for the next strum', 'Swing down past the strings on beat 3 without touching them', 'Pull the hand up and away from the guitar on beat 3', 'Hold the hand still for all of beat 3'],
          choices_es: ['Pausar en el tiempo 3 y esperar al siguiente rasgueo', 'Bajar pasando junto a las cuerdas en el tiempo 3 sin tocarlas', 'Alejar la mano de la guitarra hacia arriba en el tiempo 3', 'Dejar la mano quieta durante todo el tiempo 3'], answer: 1,
          explain: 'A skipped strum is a miss on purpose. Your wrist keeps its full swing, and the pick passes the strings without touching them. If you stop your hand, every strum after it is off.',
          explain_es: 'Un rasgueo saltado es una falla a propósito. La muñeca mantiene todo su balanceo, y la púa pasa junto a las cuerdas sin tocarlas. Si detienes la mano, todos los rasgueos que vienen después se descuadran.' } },
      { id: 'm6w2-s3', text: 'Accent beats 2 and 4 (play them louder)',
        text_es: 'Acentuar los tiempos 2 y 4 (tocarlos más fuerte)',
        gotItWhen: 'beats 2 and 4 are clearly louder than beats 1 and 3 when you strum the pattern.',
        gotItWhen_es: 'los tiempos 2 y 4 suenan claramente más fuertes que el 1 y el 3 cuando rasgueas el patrón.',
        practice: { type: 'playSeq', label: 'Hear the beat — add your own accent on 2 and 4', label_es: 'Escucha el tiempo — agrega tu propio acento en el 2 y el 4', bpm: 70,
          notes: [40, 47, 40, 47] } },
      { id: 'm6w2-s4', text: 'Keep the D-DU-UDU pattern going through a chord change',
        text_es: 'Mantener el patrón D-DU-UDU a través de un cambio de acorde',
        gotItWhen: 'you change from G to D (or any two chords) and the pattern stays exactly the same. Only the chord changes.',
        gotItWhen_es: 'cambias de G a D (o entre dos acordes cualesquiera) y el patrón queda exactamente igual. Solo cambia el acorde.',
        practice: { type: 'pr', prompt: '<ol><li>One minute: strum D-DU-UDU over G ↔ D, changing chords every 2 bars.</li><li>Count the changes where the pattern never broke.</li><li>Log your best.</li></ol>',
          prompt_es: '<ol><li>Un minuto: rasguea D-DU-UDU sobre G ↔ D, cambiando de acorde cada 2 compases.</li><li>Cuenta los cambios donde el patrón nunca se rompió.</li><li>Anota tu mejor número.</li></ol>',
          unit: 'count', placeholder: 'e.g. 12 changes — try for a higher number', placeholder_es: 'p. ej. 12 cambios — intenta superarlo' } },
      { id: 'm6w2-s5', text: 'Play the D-DU-UDU pattern on a verse of a real song',
        text_es: 'Tocar el patrón D-DU-UDU en la estrofa de una canción real',
        gotItWhen: 'you play the verse of "I\'m Yours" or "Oye Mi Amor" with D-DU-UDU from start to finish without breaking the pattern, even if a chord is not clean.',
        gotItWhen_es: 'tocas la estrofa de "I\'m Yours" u "Oye Mi Amor" con D-DU-UDU de principio a fin sin romper el patrón, aunque un acorde no salga limpio.',
        practice: { type: 'playSeq', label: '"I\'m Yours" verse roots (G · D · Em · C)', label_es: 'Raíces de la estrofa de "I\'m Yours" (G · D · Em · C)', bpm: 70,
          notes: [43, 50, 40, 48] } },
      { id: 'm6w2-s6', text: 'Read a strum-line (D, U and · over "1 + 2 + 3 + 4 +")',
        text_es: 'Leer una línea de rasgueo (D, U y · sobre "1 + 2 + 3 + 4 +")',
        gotItWhen: 'you read a strum-line you have not played before (for example "D · D · D U D U") and play it right on the first try.',
        gotItWhen_es: 'lees una línea de rasgueo que no has tocado antes (por ejemplo "D · D · D U D U") y la tocas bien en el primer intento.',
        practice: { type: 'mc', prompt: 'A strum-line reads "D · D U · U D U". Beat 3 is "·". What does your hand do on the "+" right after beat 3?',
          prompt_es: 'Una línea de rasgueo dice "D · D U · U D U". El tiempo 3 es "·". ¿Qué hace tu mano en el "+" justo después del tiempo 3?',
          choices: ['Strum up, toward the ceiling', 'Strum down, toward the floor', 'Mute the strings with your palm', 'Hold the chord without strumming'],
          choices_es: ['Rasguear hacia arriba, hacia el techo', 'Rasguear hacia abajo, hacia el suelo', 'Silenciar las cuerdas con la palma', 'Sostener el acorde sin rasguear'], answer: 0,
          explain: 'Count the slots: 1 +, 2 +, 3 +. The slot after the "·" on beat 3 is the "+" of 3, and it reads "U" — an upstroke. Your hand swung down past the strings on beat 3, so it is already on its way up.',
          explain_es: 'Cuenta los espacios: 1 +, 2 +, 3 +. El espacio después del "·" del tiempo 3 es el "+" del 3, y dice "U" — un golpe hacia arriba. Tu mano bajó pasando junto a las cuerdas en el tiempo 3, así que ya va de subida.' } }
    ]
  },

  {
    id: 'm6w3',
    songThread: [{ name: '"All Along the Watchtower"', journey: 'tabs/all-along-the-watchtower.html', note: 'five layers deep and still growing' }],
    label: 'Set 3',
    locked: false,
    module: 'Strumming Patterns with Chords',
    moduleNum: 6,
    unit: 'Module 6 · Strumming Patterns with Chords',
    unit_es: 'Módulo 6 · Patrones de rasgueo con acordes',
    title: 'Set 3',
    subtitle: 'Multiple strum patterns · Soft, rock, reggae styles · Choosing the right groove',
    subtitle_es: 'Varios patrones de rasgueo · Estilos suave, rock, reggae · Elegir el groove correcto',
    skillFocus: 'Playing different strum styles · Matching a pattern to the song · Switching patterns mid-song',
    skillFocus_es: 'Tocar distintos estilos de rasgueo · Ajustar un patrón a la canción · Cambiar de patrón a mitad de la canción',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        title_es: 'Estación de computadora — Mira · Escucha · Practica',
        sections: [
          {
            title: 'Watch: build any strum pattern',
            title_es: 'Mira: arma cualquier patrón de rasgueo',
            steps: [
          {
            label: 'Watch: any-pattern exercise (JustinGuitar)', label_es: 'Mira: ejercicio de patrones (JustinGuitar)',
            text: 'Watch: <a href="https://youtu.be/CjM5fyXoV8w" target="_blank">Learn ANY Strumming Pattern with this Exercise – JustinGuitar</a> (0:00–4:00).<ol><li>Pick one pattern he shows.</li><li>Tap it on your leg until you can keep it going without looking at the video.</li></ol>Then answer the question below.',
            text_es: 'Mira: <a href="https://youtu.be/CjM5fyXoV8w" target="_blank">Learn ANY Strumming Pattern with this Exercise – JustinGuitar</a> (0:00–4:00).<ol><li>Elige un patrón de los que muestra.</li><li>Márcalo en tu pierna hasta que puedas mantenerlo sin mirar el video.</li></ol>Luego responde la pregunta de abajo.',
            hint: 'Watch his strumming hand, not the chord. Counting "1 and 2 and 3 and 4 and" gives eight strums in a bar.',
            hint_es: 'Fíjate en su mano de rasgueo, no en el acorde. Contar "1 y 2 y 3 y 4 y" da ocho rasgueos en un compás.',
            skills: [4],
            response: { type: 'mc', prompt: 'You are playing a pattern that leaves out some of the eight possible strums in a bar. What does your strumming hand do on the ones you leave out?',
              prompt_es: 'Estás tocando un patrón que deja fuera algunos de los ocho rasgueos posibles de un compás. ¿Qué hace tu mano de rasgueo en los que deja fuera?',
              answer: 0,
              explain: 'The hand never stops. It swings down on every number and up on every "and," all through the bar. A pattern is just which of those swings touch the strings. If you stop your hand between strums, you lose the count and the next strum comes in late.',
              explain_es: 'La mano nunca se detiene. Baja en cada número y sube en cada "y", durante todo el compás. Un patrón es solo cuáles de esos movimientos tocan las cuerdas. Si detienes la mano entre rasgueos, pierdes la cuenta y el siguiente rasgueo entra tarde.',
              choices: [
              'Keeps moving in time, but misses the strings',
              'Stops, and starts moving again for the next strum',
              'Moves twice as fast to catch up',
              'Presses the strings without strumming'
            ],
              choices_es: [
              'Sigue moviéndose a tiempo, pero no toca las cuerdas',
              'Se detiene y vuelve a moverse para el siguiente rasgueo',
              'Se mueve al doble de velocidad para alcanzar el ritmo',
              'Presiona las cuerdas sin rasguear'
            ] }
          },
          {
            // Hidden 2026-10-16 (Module 6 trim): a second video for the same any-pattern exercise; the JustinGuitar video above teaches it and carries the same skill. Kept in the array so no progress key moves.
            hidden: true,
            label: 'Watch: strumming exercise (Andy Guitar)', label_es: 'Mira: ejercicio de rasgueo (Andy Guitar)',
            text: 'Watch: <a href="https://youtu.be/vMt8T5Jqf10?t=39" target="_blank">Best Strumming Exercise For Beginners and Improvers – Andy Guitar</a> — a different teacher\'s method for building ANY pattern. Strum along with his exercise in real time. You\'ve got it when: you have strummed along with his exercise for four bars without losing the count.',
            text_es: 'Mira: <a href="https://youtu.be/vMt8T5Jqf10?t=39" target="_blank">Best Strumming Exercise For Beginners and Improvers – Andy Guitar</a> — el método de un maestro distinto para construir CUALQUIER patrón. Rasguea junto con su ejercicio en tiempo real. Lo tienes cuando: ya rasgueaste junto con su ejercicio durante cuatro compases sin perder la cuenta.',
            hint: 'There is no single "correct" pattern for a song — listen to the original recording and feel which fits. Andy\'s exercise builds the control to play whichever one you choose.',
            hint_es: 'No hay un único patrón "correcto" para una canción — escucha la grabación original y siente cuál encaja. El ejercicio de Andy construye el control para tocar el que elijas.',
            skills: [4],
          }
            ]
          },
          {
            title: 'Compare reggae and rock feels',
            title_es: 'Compara las sensaciones de reggae y rock',
            steps: [
          {
            label: 'Compare: reggae vs. rock', label_es: 'Compara: reggae vs. rock',
            text: 'Listen to <a href="https://www.youtube.com/watch?v=HNBCVM4KbUM" target="_blank">"Three Little Birds" (Bob Marley)</a>, a reggae song, and <a href="https://www.youtube.com/watch?v=5BmEGm-mraE" target="_blank">"Bad Moon Rising" (CCR)</a>, a rock song. They are about the same speed. Listen for how the strums are different. Then answer the question below.',
            text_es: 'Escucha <a href="https://www.youtube.com/watch?v=HNBCVM4KbUM" target="_blank">"Three Little Birds" (Bob Marley)</a>, una canción de reggae, y <a href="https://www.youtube.com/watch?v=5BmEGm-mraE" target="_blank">"Bad Moon Rising" (CCR)</a>, una canción de rock. Tienen una velocidad parecida. Escucha en qué se diferencian los rasgueos. Luego responde la pregunta de abajo.',
            hint: 'Listen for which counts the guitar hits: the numbers or the "+".',
            hint_es: 'Escucha en qué tiempos toca la guitarra: en los números o en el "+".',
            skills: [2, 3],
            response: { type: 'short', prompt: 'In one sentence: what is the biggest difference between the reggae strum and the rock strum?',
              prompt_es: 'En una oración: ¿cuál es la mayor diferencia entre el rasgueo de reggae y el de rock?',
              placeholder: 'e.g. The reggae strum hits ____, but the rock strum hits ____.',
              placeholder_es: 'p. ej. El rasgueo de reggae toca ____, pero el rasgueo de rock toca ____.' }
          },
          /* Inserted 2026-09-24 (pre-release review F8): m6w3-s4 asks the
             student to listen and CHOOSE a pattern, and every other step
             tells them which one to play. Open regime — Module 6 may gain
             a step inside a section. */
          {
            label: 'Pick the feel: three songs', label_es: 'Elige la sensación: tres canciones',
            text: 'Three songs: <a href="https://www.youtube.com/watch?v=rm9coqlk8fY" target="_blank">"Knockin\' on Heaven\'s Door" (Bob Dylan)</a>, <a href="https://www.youtube.com/watch?v=uMUQMSXLlHM" target="_blank">"Buffalo Soldier" (Bob Marley)</a> and <a href="https://www.youtube.com/watch?v=5BmEGm-mraE" target="_blank">"Bad Moon Rising" (CCR)</a>.<ol><li>Listen to 15 seconds of each song.</li><li>Pick a feel for each one: soft, rock or reggae.</li><li>Play each song again. Mute the strings (rest your fretting hand lightly across them) and strum your feel with the song for 4 bars.</li></ol>You\'ve got it when: you strum 4 bars with each song and every strum stays with the record.',
            text_es: 'Tres canciones: <a href="https://www.youtube.com/watch?v=rm9coqlk8fY" target="_blank">"Knockin\' on Heaven\'s Door" (Bob Dylan)</a>, <a href="https://www.youtube.com/watch?v=uMUQMSXLlHM" target="_blank">"Buffalo Soldier" (Bob Marley)</a> y <a href="https://www.youtube.com/watch?v=5BmEGm-mraE" target="_blank">"Bad Moon Rising" (CCR)</a>.<ol><li>Escucha 15 segundos de cada canción.</li><li>Elige una sensación para cada una: suave, rock o reggae.</li><li>Pon cada canción otra vez. Silencia las cuerdas (apoya la mano de trastear suavemente sobre ellas) y rasguea tu sensación con la canción durante 4 compases.</li></ol>Lo tienes cuando: rasgueas 4 compases con cada canción y cada rasgueo se mantiene con la grabación.',
            hint: 'Soft sits under a singer. Rock hits hard on the numbers. Reggae hits only the "+". If your strum sounds wrong with the record, try another feel.',
            hint_es: 'Lo suave se queda debajo del cantante. El rock toca fuerte en los números. El reggae toca solo en el "+". Si tu rasgueo suena mal con la grabación, prueba otra sensación.',
            skills: [4]
          }
            ]
          },
          {
            title: 'Refresh the C chord',
            title_es: 'Repasa el acorde C',
            steps: [
          {
            label: 'Refresh the C chord', label_es: 'Repasa el acorde C',
            text: 'Today\'s progressions use C, from Module 4.<ol><li>Play C from the diagram.</li><li>Strum the five strings from A to high e. Do not hit the low E.</li></ol>You\'ve got it when: you strum once and all five strings ring clean.',
            text_es: 'Las progresiones de hoy usan C, del Módulo 4.<ol><li>Toca C a partir del diagrama.</li><li>Rasguea las cinco cuerdas de La a mi aguda. No toques la Mi grave.</li></ol>Lo tienes cuando: rasgueas una vez y las cinco cuerdas suenan limpias.',
            hint: 'Your ring finger reaches to fret 3 of the A string.',
            hint_es: 'Tu dedo anular llega al traste 3 de la cuerda La.',
            chords: [
              { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            kind: 'reflection',
            title: 'Checkpoint',
            title_es: 'Punto de control',
            steps: [
          {
            label: 'Checkpoint', label_es: 'Punto de control',
            text: 'Checkpoint — pause and think: of the three feels you tried — soft, rock, reggae — which was hardest to make sound convincing on your guitar, and what gave it away as "not quite right"?',
            text_es: 'Punto de control — pausa y piensa: de las tres sensaciones que probaste — suave, rock, reggae — ¿cuál fue la más difícil de hacer sonar convincente en tu guitarra, y qué la delataba como "no del todo correcta"?',
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — try three styles',
        title_es: 'Estación de práctica — prueba tres estilos',
        sections: [
          {
            title: 'Warm-up — a quick pass through all three feels',
            title_es: 'Calentamiento — repasa rápido las tres sensaciones',
            steps: [
              {
                label: 'Warm-up: all three feels', label_es: 'Calentamiento: las tres sensaciones',
                text: 'Try three ways to strum a G chord, 2 bars each.<ol><li>Soft: one light downstroke on each beat.</li><li>Rock: down-up on every count, strummed harder.</li><li>Reggae: strum up only on each "+". Skip every number.</li></ol>You\'ve got it when: you play 2 bars of each of the three.',
                text_es: 'Prueba tres maneras de rasguear un acorde G, 2 compases cada una.<ol><li>Suave: un golpe ligero hacia abajo en cada tiempo.</li><li>Rock: abajo-arriba en cada conteo, rasgueado más fuerte.</li><li>Reggae: rasguea hacia arriba solo en cada "+". Sáltate cada número.</li></ol>Lo tienes cuando: tocas 2 compases de cada una de las tres.',
                hint: 'Keep the same tempo for all three.',
                hint_es: 'Mantén el mismo tempo en las tres.',
                playSeq: { label: 'Hear the beat — 2 bars on G', label_es: 'Escucha el tiempo — 2 compases en G', bpm: 60, notes: [43, 43, 43, 43, 43, 43, 43, 43] }
              }
            ]
          },
          {
            title: 'Play a soft feel',
            title_es: 'Toca una sensación suave',
            steps: [
          {
            label: 'Challenge 1 — Soft Feel', label_es: 'Reto 1 — Sensación suave',
            text: '<ol><li>Play G.</li><li>Strum down once on each beat at 70 BPM. Keep it quiet and even.</li></ol><div class="strum-line">D       D       D       D\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>You\'ve got it when: you play four bars in a row, even and soft, with no strum louder than the others.',
            text_es: '<ol><li>Toca G.</li><li>Rasguea una vez hacia abajo en cada tiempo a 70 BPM. Mantenlo suave y parejo.</li></ol><div class="strum-line">D       D       D       D\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>Lo tienes cuando: tocas cuatro compases seguidos, parejos y suaves, sin ningún rasgueo más fuerte que los demás.',
            hint: 'Soft is a way of playing, not one pattern. It stays quieter than the singer. The folk strum from Module 4 (D · D U · U D U), played gently, also works.',
            hint_es: 'Suave es una manera de tocar, no un patrón. Se queda más bajo que el cantante. El rasgueo folk del Módulo 4 (D · D U · U D U), tocado con suavidad, también funciona.',
            stuck: 'Strum from the wrist only. Let the pick just touch the strings.',
            stuck_es: 'Rasguea solo desde la muñeca. Deja que la púa apenas toque las cuerdas.',
            levelUp: 'Add a light upstroke on the "+" after beats 2 and 4.',
            levelUp_es: 'Agrega un golpe ligero hacia arriba en el "+" después de los tiempos 2 y 4.',
            skills: [1, 4]
          }
            ]
          },
          {
            title: 'Play a rock strum',
            title_es: 'Toca un rasgueo rock',
            steps: [
          {
            label: 'Challenge 2 — Rock Feel', label_es: 'Reto 2 — Sensación rock',
            text: '<ol><li>Play the same G at the same tempo.</li><li>Strum down-up on every count. Strum harder and accent every downstroke.</li><li>Move from the elbow, not only the wrist.</li></ol><div class="strum-line">D   U   D   U   D   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>You\'ve got it when: you play four bars in a row with every downstroke louder than the upstrokes.',
            text_es: '<ol><li>Toca el mismo G al mismo tempo.</li><li>Rasguea abajo-arriba en cada conteo. Rasguea más fuerte y acentúa cada golpe hacia abajo.</li><li>Muévete desde el codo, no solo desde la muñeca.</li></ol><div class="strum-line">D   U   D   U   D   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>Lo tienes cuando: tocas cuatro compases seguidos con cada golpe hacia abajo más fuerte que los de arriba.',
            hint: 'Let the pick go deeper into the strings for a thick, heavy sound.',
            hint_es: 'Deja que la púa entre más en las cuerdas para un sonido grueso y pesado.',
            stuck: 'Keep the upstrokes light. Put the extra force only on the downstrokes.',
            stuck_es: 'Mantén ligeros los golpes hacia arriba. Pon la fuerza extra solo en los golpes hacia abajo.',
            levelUp: 'Play it at 90 BPM, or palm-mute: rest the side of your strumming hand on the low strings for a short, muted sound.',
            levelUp_es: 'Tócalo a 90 BPM, o silencia con la palma: apoya el borde de tu mano de rasgueo sobre las cuerdas graves para un sonido corto y apagado.',
            skills: [2, 4]
          }
            ]
          },
          {
            title: 'Play a reggae strum',
            title_es: 'Toca un rasgueo reggae',
            steps: [
          {
            label: 'Challenge 3 — Reggae Chop', label_es: 'Reto 3 — Picoteo reggae',
            text: 'A reggae chop is a short, quick, muted upstroke.<ol><li>Play G.</li><li>Skip every number. Strum up only on each "+". Your hand still moves down on each number, but misses the strings.</li><li>Then play along with "Three Little Birds". The record is not in G, so let go of G and mute the strings: rest your fretting hand lightly across them.</li></ol><div class="strum-line">·   U   ·   U   ·   U   ·   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>You\'ve got it when: you play four bars at 70 BPM where only the "+" sounds.',
            text_es: 'Un picoteo reggae es un golpe hacia arriba corto, rápido y silenciado.<ol><li>Toca G.</li><li>Sáltate cada número. Rasguea hacia arriba solo en cada "+". Tu mano sigue bajando en cada número, pero no toca las cuerdas.</li><li>Luego toca junto con "Three Little Birds". La grabación no está en G, así que suelta el G y silencia las cuerdas: apoya la mano de trastear suavemente sobre ellas.</li></ol><div class="strum-line">·   U   ·   U   ·   U   ·   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>Lo tienes cuando: tocas cuatro compases a 70 BPM donde solo suena el "+".',
            hint: 'Listen to "Three Little Birds" while you play to hear the rhythm.',
            hint_es: 'Escucha "Three Little Birds" mientras tocas para oír el ritmo.',
            stuck: 'Keep your hand moving down on every number, but hold the pick away from the strings. Count "rest-UP-rest-UP" out loud.',
            stuck_es: 'Mantén tu mano bajando en cada número, pero aleja la púa de las cuerdas. Cuenta "silencio-ARRIBA-silencio-ARRIBA" en voz alta.',
            levelUp: 'Right after each upstroke, mute the strings with your fretting hand to make a short "chk" sound.',
            levelUp_es: 'Justo después de cada golpe hacia arriba, silencia las cuerdas con la mano de trastear para hacer un sonido corto "chk".',
            skills: [3, 4],
            playSeq: { label: 'Hear the backing root — chop your offbeat over it', label_es: 'Escucha la raíz de fondo — pica tu contratiempo sobre ella', bpm: 70, notes: [55, 55, 55, 55] }
          }
            ]
          },
          {
            title: 'Switch the feel mid-song (assessment preparation)',
            title_es: 'Cambia la sensación a mitad de la canción (preparación para la evaluación)',
            steps: [
          {
            label: 'Challenge 4 — Two Feels, One Song (assessment preparation)', label_es: 'Reto 4 — Dos sensaciones, una canción (preparación para la evaluación)',
            text: '<ol><li>Play G, D, Em, C soft for 8 bars.</li><li>Switch to rock for the next 8 bars. Keep the same chords and tempo.</li><li>Switch on beat 1 of a new bar, with no break.</li><li>Set the ⏱ Timer for 3 minutes and repeat.</li></ol>You\'ve got it when: you play the 16-bar loop three times with no break at either switch, and a recording of you shows the bar where the feel changes.',
            text_es: '<ol><li>Toca G, D, Em, C suave durante 8 compases.</li><li>Cambia a rock durante los siguientes 8 compases. Mantén los mismos acordes y el mismo tempo.</li><li>Cambia en el tiempo 1 de un compás nuevo, sin interrupción.</li><li>Pon el ⏱ Temporizador en 3 minutos y repite.</li></ol>Lo tienes cuando: tocas la vuelta de 16 compases tres veces sin interrupción en ningún cambio, y una grabación tuya muestra el compás donde cambia la sensación.',
            hint: 'Record yourself on a phone. Then listen for the bar where the feel changes.',
            hint_es: 'Grábate con el teléfono. Luego escucha el compás donde cambia la sensación.',
            stuck: 'Change only your strumming hand. Practice the 2 bars around the switch until they are smooth.',
            stuck_es: 'Cambia solo tu mano de rasgueo. Practica los 2 compases alrededor del cambio hasta que salgan fluidos.',
            levelUp: 'Add 8 bars of reggae, or switch feel every 4 bars.',
            levelUp_es: 'Agrega 8 compases de reggae, o cambia de sensación cada 4 compases.',
            skills: [5, 6],
            playSeq: { label: 'G · D · Em · C progression (try each feel)', label_es: 'Progresión G · D · Em · C (prueba cada sensación)', bpm: 70, notes: [43, 50, 40, 48] }
          }
            ]
          },
          {
            title: 'Strum, then solo with Pentatonic Pattern 1',
            title_es: 'Rasguea y luego improvisa con el Patrón Pentatónico 1',
            steps: [
          {
            label: 'Challenge 5 — Trade Off: Strum, Then Solo', label_es: 'Reto 5 — Túrnate: rasgueo y solo',
            text: '<ol><li>Press ▶ Hear the roots to hear the root notes of Am, G, C.</li><li>Record yourself strumming 8 bars of Am, G, C (or G, D, Em, C) with any pattern from this module. Or play <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; the Am jam track</a>.</li><li>Solo over it with A minor pentatonic Pattern 1 from Module 5, index finger at fret 5 of the low E string.</li><li>Take turns: strum 8 bars, then solo 8 bars.</li></ol>No score. Play a few notes, then rest.',
            text_es: '<ol><li>Pulsa ▶ Escucha las raíces para oír las notas raíz de Am, G, C.</li><li>Grábate rasgueando 8 compases de Am, G, C (o G, D, Em, C) con cualquier patrón de este módulo. O pon <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; la pista de jam en Am</a>.</li><li>Improvisa encima con el Patrón 1 de la pentatónica menor de A del Módulo 5, con el dedo índice en el traste 5 de la cuerda Mi grave.</li><li>Túrnate: rasguea 8 compases, y luego improvisa 8 compases.</li></ol>Sin puntaje. Toca algunas notas, y luego descansa.',
            hint: 'Leave space between your phrases. With another guitarist, one strums and one solos. Swap after 8 bars.',
            hint_es: 'Deja espacio entre tus frases. Con otro guitarrista, uno rasguea y otro improvisa. Cambien después de 8 compases.',
            playSeq: { label: 'Hear the roots — Am · G · C', label_es: 'Escucha las raíces — Am · G · C', bpm: 70, notes: [45, 43, 48] }
          }
            ]
          },
          {
            kind: 'take-to-song',
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Watchtower", two ways', label_es: 'Reto — "Watchtower", de dos formas',
                text: '<ol><li>Play Am · G · F · G with a soft strum for 8 bars, counting 1 + 2 + 3 + 4 + in each bar — in bar 1 the G comes in on beat 3, in bar 2 on the "+" after 3.</li><li>Then play the same loop rock-style — strum harder, accent the downs — for 8 bars, no break at the switch.</li></ol>You\'ve got it when: on a quick recording of yourself you can hear the exact bar the feel changed — Dylan\'s version becoming Hendrix\'s. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: five layers deep and still growing</a>.',
                text_es: '<ol><li>Toca Am · G · F · G con un rasgueo suave durante 8 compases, contando 1 + 2 + 3 + 4 + en cada compás — en el compás 1 la G entra en el 3, en el compás 2 en el "+" después del 3.</li><li>Luego toca el mismo loop estilo rock — rasguea más fuerte, acentúa los golpes hacia abajo — durante 8 compases, sin interrupción en el cambio.</li></ol>Lo tienes cuando: en una grabación rápida de ti mismo puedes escuchar el compás exacto donde cambió la sensación — la versión de Dylan volviéndose la de Hendrix. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: cinco capas de profundidad y sigue creciendo</a>.',
                hint: 'Module 1 had you tell Dylan\'s acoustic apart from Hendrix\'s electric by tone. Here you make that same soft-to-rock switch yourself, with just your strum hand — same chords, same tempo the whole way through.',
                hint_es: 'En el Módulo 1 distinguiste el acústico de Dylan del eléctrico de Hendrix por el tono. Aquí haces tú mismo ese mismo cambio de suave a rock, solo con la mano de rasgueo — mismos acordes, mismo tempo todo el tiempo.',
                stuck: 'Make the switch on beat 1 of a new bar and drill just the 2-bar seam where soft becomes rock.',
                stuck_es: 'Haz el cambio en el tiempo 1 de un compás nuevo y practica solo la costura de 2 compases donde lo suave se vuelve rock.',
                levelUp: 'Add the reggae chop as a third 8-bar section.',
                levelUp_es: 'Agrega el picoteo reggae como una tercera sección de 8 compases.',
                skills: [5, 6],
              },
              {
                label: 'Challenge — "Three Little Birds", reggae chop', label_es: 'Reto — "Three Little Birds", picoteo reggae',
                text: '<ol><li>Play A · D · E with up-strums only on the "+", one bar each at 70 BPM.</li><li>Then play along with the record on muted strings (fretting hand resting lightly across the strings). The record does not change chords every bar. Your muted chops only need to match its beat.</li></ol>You\'ve got it when: two laps of A · D · E where every hit is on the "+", then 8 bars with the record where every chop stays with it.',
                text_es: '<ol><li>Toca A · D · E con golpes hacia arriba solo en el "+", un compás cada uno a 70 BPM.</li><li>Luego toca junto con la grabación con cuerdas silenciadas (la mano de trastear apoyada suavemente sobre las cuerdas). La grabación no cambia de acorde en cada compás. Tus picoteos silenciados solo tienen que coincidir con su pulso.</li></ol>Lo tienes cuando: dos vueltas de A · D · E donde cada golpe cae en el "+", y luego 8 compases con la grabación donde cada picoteo se mantiene con ella.',
                hint: 'Your hand still travels down on every number — the pick just misses on purpose. The record is your metronome here; Marley\'s band never rushes.',
                hint_es: 'Tu mano sigue bajando en cada número — la púa solo falla a propósito. La grabación es tu metrónomo aquí; la banda de Marley nunca se apura.',
                stuck: 'Mute the strings and chop the offbeat rhythm alone until it feels natural, then add the chords.',
                stuck_es: 'Silencia las cuerdas y pica el ritmo del contratiempo solo hasta que se sienta natural, y luego agrega los acordes.',
                levelUp: 'Clip each up-strum short with a quick fretting-hand mute — the crisp "chk" of a real reggae chop.',
                levelUp_es: 'Corta cada golpe hacia arriba con un silenciado rápido de la mano de trastear — el "chk" nítido de un verdadero picoteo reggae.',
                skills: [3, 4]
              }
            ]
          }
        ]
      }
    },

    skills: [
      { id: 'm6w3-s1', text: 'Play a soft feel: light, even downstrokes that stay under a singer',
        text_es: 'Tocar una sensación suave: golpes hacia abajo ligeros y parejos que se quedan debajo del cantante',
        gotItWhen: 'you play a chord progression with light, even downstrokes and no accents.',
        gotItWhen_es: 'tocas una progresión de acordes con golpes hacia abajo ligeros y parejos, sin acentos.',
        practice: { type: 'playSeq', label: 'Soft feel — light, even strums (G root, one per beat)', label_es: 'Sensación suave — rasgueos ligeros y parejos (raíz de G, uno por tiempo)', bpm: 70,
          notes: [43, 43, 43, 43, 43, 43, 43, 43] } },
      { id: 'm6w3-s2', text: 'Play a rock strum that sounds clearly heavier than the soft feel',
        text_es: 'Tocar un rasgueo rock que suene claramente más pesado que la sensación suave',
        gotItWhen: 'a recording of your rock strum sounds clearly heavier than your soft feel, with the downstrokes hit hardest.',
        gotItWhen_es: 'una grabación de tu rasgueo rock suena claramente más pesada que tu sensación suave, con los golpes hacia abajo más fuertes.',
        practice: { type: 'mc', prompt: 'Your rock strum sounds thin, like the soft feel. What gives it a heavy sound?',
          prompt_es: 'Tu rasgueo rock suena delgado, como la sensación suave. ¿Qué le da un sonido pesado?',
          choices: ['Arm weight from the elbow behind accented downs', 'Strumming as fast as possible', 'Squeezing the chord harder with the fretting hand', 'Only strumming on beat 1'],
          choices_es: ['El peso del brazo desde el codo en golpes acentuados hacia abajo', 'Rasguear lo más rápido posible', 'Apretar el acorde más fuerte con la mano de trastear', 'Rasguear solo en el tiempo 1'], answer: 0,
          explain: 'A heavy sound comes from the weight of your arm behind each strum, not from speed or from squeezing the chord. Strum from the elbow, strum harder on the accents, and keep the other strums lighter.',
          explain_es: 'Un sonido pesado viene del peso del brazo detrás de cada rasgueo, no de la velocidad ni de apretar el acorde. Rasguea desde el codo, rasguea más fuerte en los acentos, y deja los demás rasgueos más ligeros.' } },
      { id: 'm6w3-s3', text: 'Play a reggae strum (the reggae chop)',
        text_es: 'Tocar un rasgueo reggae (el picoteo reggae)',
        gotItWhen: 'only the upstrokes hit the strings. Your hand still moves down on each number, but the pick misses.',
        gotItWhen_es: 'solo los golpes hacia arriba tocan las cuerdas. Tu mano sigue bajando en cada número, pero la púa no toca.',
        practice: { type: 'mc', prompt: 'Each strum-line sits over "1 + 2 + 3 + 4 +". Which one is a reggae chop?',
          prompt_es: 'Cada línea de rasgueo va sobre "1 + 2 + 3 + 4 +". ¿Cuál es un picoteo reggae?',
          choices: ['D · D · D · D ·', '· U · U · U · U', 'D · · · · · · ·', 'D U D U D U D U'],
          choices_es: ['D · D · D · D ·', '· U · U · U · U', 'D · · · · · · ·', 'D U D U D U D U'], answer: 1,
          explain: 'Reggae leaves the numbered beats empty and chops only on the "+" between them. Hitting the numbers instead gives you an ordinary strum. The offbeat is what makes it sound like reggae.',
          explain_es: 'El reggae deja vacíos los tiempos numerados y solo golpea en el "+" entre ellos. Tocar en los números te da un rasgueo común y corriente. El contratiempo es lo que hace que suene a reggae.' } },
      { id: 'm6w3-s4', text: 'Choose a strum pattern that matches a song\'s style',
        text_es: 'Elegir un patrón de rasgueo que se ajuste al estilo de una canción',
        gotItWhen: 'you listen to a new song for 15 seconds and pick a strum that fits, without a tutorial.',
        gotItWhen_es: 'escuchas una canción nueva durante 15 segundos y eliges un rasgueo que encaje, sin un tutorial.',
        practice: { type: 'mc', prompt: 'A quiet love song: one voice and one acoustic guitar. Which strum fits it best?',
          prompt_es: 'Una canción de amor tranquila: una voz y una guitarra acústica. ¿Qué rasgueo le queda mejor?',
          choices: ['Heavy rock strum, accenting every down', 'Reggae up-strums on the "+" only', 'Light, even strum that stays under the voice', 'No strum at all'],
          choices_es: ['Rasgueo rock pesado, acentuando cada golpe hacia abajo', 'Golpes reggae hacia arriba solo en el "+"', 'Rasgueo ligero y parejo que se queda debajo de la voz', 'Sin rasgueo alguno'], answer: 2,
          explain: 'Match the strum to the energy of the song. A soft, slow song needs a gentle strum that stays quieter than the singer. A heavy rock strum or a reggae offbeat would not fit the mood.',
          explain_es: 'Ajusta el rasgueo a la energía de la canción. Una canción suave y lenta necesita un rasgueo suave que se mantenga más bajo que el cantante. Un rasgueo fuerte de rock o el contratiempo reggae no irían con el ambiente.' } },
      { id: 'm6w3-s5', text: 'Switch strum patterns mid-song (for example, verse and chorus)',
        text_es: 'Cambiar de patrón de rasgueo a mitad de la canción (por ejemplo, estrofa y coro)',
        gotItWhen: 'you play 8 bars of one pattern, then switch to another pattern for 8 bars without losing the beat.',
        gotItWhen_es: 'tocas 8 compases de un patrón y luego cambias a otro patrón durante 8 compases sin perder el tiempo.',
        practice: { type: 'pr', prompt: '<ol><li>Play 4 bars of one pattern, then switch to a different pattern for 4 bars, back and forth.</li><li>Count the switches where you never lost the beat.</li><li>Log your best streak.</li></ol>',
          prompt_es: '<ol><li>Toca 4 compases de un patrón, y luego cambia a un patrón distinto durante 4 compases, ida y vuelta.</li><li>Cuenta los cambios donde nunca perdiste el tiempo.</li><li>Anota tu mejor racha.</li></ol>',
          unit: 'count', placeholder: 'e.g. 6 switches — try for a longer streak', placeholder_es: 'p. ej. 6 cambios — intenta una racha más larga' } },
      { id: 'm6w3-s6', text: 'Play 2 or more patterns over the same chord progression',
        text_es: 'Tocar 2 o más patrones sobre la misma progresión de acordes',
        gotItWhen: 'you play G–D–Em–C two ways (for example, soft and rock) and the two versions sound clearly different.',
        gotItWhen_es: 'tocas G–D–Em–C de dos formas (por ejemplo, suave y rock) y las dos versiones suenan claramente distintas.',
        practice: { type: 'playSeq', label: 'G · D · Em · C progression (try with each style)', label_es: 'Progresión G · D · Em · C (prueba con cada estilo)', bpm: 70,
          notes: [43, 50, 40, 48] } }
    ]
  }

); // end module-6.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[6] = [
      { name: '"Brown Eyed Girl" — Van Morrison', meta: 'G–C–G–D · classic 8th-note down-up strum', meta_es: 'G–C–G–D · rasgueo clásico de corcheas abajo-arriba', type: 'Focus', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=UfmkgQRmmeE',
        tutorialUrl: 'https://www.youtube.com/watch?v=v-EGJOz-Mek' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Am–G–F–G · steady down-up over chord changes', meta_es: 'Am–G–F–G · abajo-arriba constante a través de cambios de acorde', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Knockin\' on Heaven\'s Door" — Dylan', meta: 'G–D–Am–Am–G–D–C–C · slow tempo, perfect for first strum patterns', meta_es: 'G–D–Am–Am–G–D–C–C · tempo lento, perfecto para los primeros patrones de rasgueo', type: 'Focus', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=rm9coqlk8fY',
        tutorialUrl: 'https://www.youtube.com/watch?v=pWIL4N6QZ-Y&start=55&end=529' },
      { name: '"Happy Birthday"', meta: 'C–G–C–F–C–G–C · waltz strum in 3 (D · D · D, strong beat 1)', meta_es: 'C–G–C–F–C–G–C · rasgueo de vals en 3 (D · D · D, tiempo 1 fuerte)', type: 'Focus', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w&start=46' },
      { name: '"I\'m Yours" — Jason Mraz', meta: 'G–D–Em–C · iconic D-DU-UDU strum', meta_es: 'G–D–Em–C · rasgueo icónico D-DU-UDU', type: 'Focus', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=EkHTsc9PU2A',
        tutorialUrl: 'https://www.youtube.com/watch?v=6ugeJWAMz6w' },
      { name: '"Three Little Birds" — Bob Marley', meta: 'A–D–E · classic reggae offbeat strum', meta_es: 'A–D–E · rasgueo clásico de contratiempo reggae', type: 'Focus', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=HNBCVM4KbUM',
        tutorialUrl: 'https://www.youtube.com/watch?v=61pk1YH9Lu0&t=68' },
      { name: '"Bad Moon Rising" — CCR', meta: 'D–A–G · driving rock-style strum', meta_es: 'D–A–G · rasgueo impulsor estilo rock', type: 'Focus', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=5BmEGm-mraE',
        tutorialUrl: 'https://www.youtube.com/watch?v=liBI2yT_fpw&start=84&end=251' },
      { name: '"Let It Be" — The Beatles', meta: 'C–G–Am–F · slow, even pattern', meta_es: 'C–G–Am–F · patrón lento y parejo', type: 'Core', core: true, journeyUrl: 'tabs/let-it-be.html',
        originalUrl: 'https://www.youtube.com/watch?v=CGj85pVzRJs',
        tutorialUrl: 'https://www.youtube.com/watch?v=gGt0akED_UU' },
      { name: '"Oye Mi Amor" — Maná', meta: 'Syncopated Latin strum on the verse · Bm (four-finger shape)–A', meta_es: 'Rasgueo latino sincopado en la estrofa · Bm (forma de cuatro dedos)–A', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=UlkG3DmZJEI',
        tutorialUrl: 'https://www.youtube.com/watch?v=F4BbTdP2v70' },
      { name: '"Está Dañada" — Iván Cornejo', meta: 'Sierreño strum · current Spanish-language style', meta_es: 'Rasgueo sierreño · estilo actual en español', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=rBLLbgD0FsM',
        tutorialUrl: 'https://www.youtube.com/watch?v=DjSzkgEeddc' },
      { name: '"Wonderwall" — Oasis', meta: 'Em7–G–D–C · classic strum pattern with accents', meta_es: 'Em7–G–D–C · patrón de rasgueo clásico con acentos', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=6hzrDeceEKc',
        tutorialUrl: 'https://www.youtube.com/watch?v=5V81btmYxgE&t=110' },
      { name: '"Wagon Wheel" — Old Crow Medicine Show', meta: 'G–D–Em–C · folk strum classic', meta_es: 'G–D–Em–C · clásico rasgueo folk', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=1gX1EP6mG-E',
        tutorialUrl: 'https://www.youtube.com/watch?v=zx3Tv5uBAaE&t=53' },
      { name: '"Buffalo Soldier" — Bob Marley', meta: 'A–F#m–D · reggae offbeat practice', meta_es: 'A–F#m–D · práctica de contratiempo reggae', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=uMUQMSXLlHM',
        tutorialUrl: 'https://www.youtube.com/watch?v=rNSq3E3KfMk&start=94&end=522' }
    ];

MODULE_REVIEWS[6] = {
  moduleNum: 6,
  module: 'Strumming Patterns with Chords',
  module_es: 'Patrones de rasgueo con acordes',
  skills: [
    { id: 'mr6-s1', text: 'I can hold a steady down-up strum pattern (play it cleanly at 60 BPM, then try 70)', text_es: 'Puedo mantener un patrón de rasgueo abajo-arriba constante (tocarlo limpio a 60 BPM, y luego intentar 70)', set: 'm6w1' },
    { id: 'mr6-s3', text: 'I can keep my strum hand moving right through a chord change', text_es: 'Puedo mantener mi mano de rasgueo en movimiento a través de un cambio de acorde', set: 'm6w1' },
    { id: 'mr6-s4', text: 'I can play the D-DU-UDU pattern and accent beats 2 and 4', text_es: 'Puedo tocar el patrón D-DU-UDU y acentuar los tiempos 2 y 4', set: 'm6w2' },
    { id: 'mr6-s5', text: 'I can read a written strum pattern (D/U over "1 + 2 + 3 + 4 +") and play it', text_es: 'Puedo leer un patrón de rasgueo escrito (D/U sobre "1 + 2 + 3 + 4 +") y tocarlo', set: 'm6w2' },
    { id: 'mr6-s2', text: 'I can play 2+ different strum patterns over the same chord progression', text_es: 'Puedo tocar 2 o más patrones de rasgueo distintos sobre la misma progresión de acordes', set: 'm6w3' },
    { id: 'mr6-s6', text: 'I can switch strum styles mid-song without dropping the beat', text_es: 'Puedo cambiar de estilo de rasgueo a mitad de la canción sin perder el tiempo', set: 'm6w3' }
  ],
  assessItems: [
    'Play Em for 4 bars, then Am for 4 bars, with a non-stop down-up strum at 60 BPM',
    'Loop G for 2 bars, then D for 2 bars, playing D-DU-UDU with the same pattern through the change',
    'Take G–D–Em–C and play it two ways — soft, then rock — switching feel with no break between them'
  ],
  assessItems_es: [
    'Toca Em durante 4 compases, y luego Am durante 4 compases, con un rasgueo abajo-arriba sin interrupciones a 60 BPM',
    'Repite G durante 2 compases, y luego D durante 2 compases, tocando D-DU-UDU con el mismo patrón durante el cambio',
    'Toma G–D–Em–C y tócalo de dos formas — suave, y luego rock — cambiando la sensación sin interrupción entre las dos'
  ],
  forward: 'Module 7 teaches <strong>barre chords</strong>. Keep your strum steady while you learn them.',
  forward_es: 'El Módulo 7 enseña <strong>acordes con cejilla</strong>. Mantén tu rasgueo constante mientras los aprendes.',
  standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
};
