// ============================================================
//  MODULE 6 — Strumming Patterns with Chords
//  Edit this file to change Module 6 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm6w1',
    songThread: [{ name: '"All Along the Watchtower"', journey: 'tabs/all-along-the-watchtower.html', note: 'your strumming patterns power this song' }],
    label: 'Set 1',
    locked: false,
    module: 'Strumming Patterns with Chords',
    moduleNum: 6,
    unit: 'Module 6 · Strumming Patterns with Chords',
    unit_es: 'Módulo 6 · Patrones de rasgueo con acordes',
    title: 'Set 1',
    subtitle: 'The down-up foundation · 8th-note pulse · Counting "1 + 2 + 3 + 4 +"',
    subtitle_es: 'La base abajo-arriba · Pulso de corcheas · Contar "1 + 2 + 3 + 4 +"',
    skillFocus: 'Keeping a steady down-up strum · Counting 8th notes · Strumming through chord changes',
    skillFocus_es: 'Mantener un rasgueo abajo-arriba constante · Contar corcheas · Rasguear a través de cambios de acorde',
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
            label: 'Watch: the strumming wrist', label_es: 'Mira: la muñeca de rasgueo',
            text: 'Watch: <a href="https://www.youtube.com/watch?v=SdLsQuvsuO0" target="_blank">Strumming Patterns for Absolute Beginners – Lauren Bateman (0:00–4:00)</a>. Your task while you watch: keep your eyes on her strumming wrist and count how many times it changes direction in one bar.',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=SdLsQuvsuO0" target="_blank">Strumming Patterns for Absolute Beginners – Lauren Bateman (0:00–4:00)</a>. Tu tarea mientras miras: mantén los ojos en su muñeca de rasgueo y cuenta cuántas veces cambia de dirección en un compás.',
            hint: 'Pay close attention to her wrist — it never stops moving, even when she isn\'t hitting the strings. The pendulum motion is the secret.',
            hint_es: 'Presta mucha atención a su muñeca — nunca deja de moverse, incluso cuando no está tocando las cuerdas. El movimiento de péndulo es el secreto.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'What is the SINGLE most important habit for good strumming?',
              prompt_es: '¿Cuál es el ÚNICO hábito más importante para un buen rasgueo?',
              answer: 0,
              explain: 'Keep the wrist swinging like a pendulum the whole time — even on skipped strums it keeps moving. That constant motion is what makes strumming steady and relaxed.',
              explain_es: 'Mantén la muñeca balanceándose como un péndulo todo el tiempo — incluso en los rasgueos que te saltas, sigue moviéndose. Ese movimiento constante es lo que hace que el rasgueo sea estable y relajado.',
              choices: [
              'Keep the wrist moving like a pendulum, even between strums',
              'Strum as loudly as possible',
              'Use a very thick pick',
              'Look at your strumming hand the whole time'
            ],
              choices_es: [
              'Mantener la muñeca moviéndose como un péndulo, incluso entre rasgueos',
              'Rasguear lo más fuerte posible',
              'Usar una púa muy gruesa',
              'Mirar tu mano de rasgueo todo el tiempo'
            ] }
          },
          {
            label: 'Watch: count your strums', label_es: 'Mira: cuenta tus rasgueos',
            text: 'Watch: <a href="https://youtu.be/NCV9IgeSYuU" target="_blank">Beginner Guitar Strumming Patterns You MUST Know! – Marty Music</a> (0:00–3:00). Your task while you watch: count "1 + 2 + 3 + 4 +" out loud with him for the first pattern and notice which counts get a down and which get an up.',
            text_es: 'Mira: <a href="https://youtu.be/NCV9IgeSYuU" target="_blank">Beginner Guitar Strumming Patterns You MUST Know! – Marty Music</a> (0:00–3:00). Tu tarea mientras miras: cuenta "1 + 2 + 3 + 4 +" en voz alta con él para el primer patrón y fíjate qué tiempos llevan un golpe hacia abajo y cuáles hacia arriba.',
            hint: 'Count out loud with him: "1 + 2 + 3 + 4 +". Saying the count is the fastest way to internalize the pulse.',
            hint_es: 'Cuenta en voz alta con él: "1 + 2 + 3 + 4 +". Decir el conteo en voz alta es la forma más rápida de interiorizar el pulso.',
            skills: [3],
            response: { type: 'short', placeholder: 'When you count "1 + 2 + 3 + 4 +", which counts are the downstrokes? Which are the upstrokes?',
              placeholder_es: 'Cuando cuentas "1 + 2 + 3 + 4 +", ¿cuáles tiempos son los golpes hacia abajo? ¿Cuáles son los golpes hacia arriba?' }
          }
            ]
          },
          {
            title: 'Feel the pulse in a real song',
            title_es: 'Siente el pulso en una canción real',
            steps: [
          {
            label: 'Feel the pulse: "Brown Eyed Girl"', label_es: 'Siente el pulso: "Brown Eyed Girl"',
            text: 'Listen to "Brown Eyed Girl" by Van Morrison. Tap along on your leg — down with your hand on the numbers, up on the "ands". Can you feel the 8th-note pulse?',
            text_es: 'Escucha "Brown Eyed Girl" de Van Morrison. Sigue el ritmo con la mano en tu pierna — hacia abajo en los números, hacia arriba en los "y". ¿Puedes sentir el pulso de corcheas?',
            hint: 'You don\'t need a guitar yet. Just train your body to feel the steady pulse before you add the strings.',
            hint_es: 'Todavía no necesitas una guitarra. Solo entrena tu cuerpo para sentir el pulso constante antes de agregar las cuerdas.',
            skills: [2, 3],
            response: { type: 'mc', prompt: 'In a down-up 8th-note pattern, how many total strums (down + up) happen in one bar of 4 beats?',
              prompt_es: 'En un patrón de corcheas abajo-arriba, ¿cuántos rasgueos en total (abajo + arriba) ocurren en un compás de 4 tiempos?',
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
            text: 'Meet your two chords for today: <strong>Em</strong> and <strong>Am</strong> (from Module 5). Form each shape from the diagram and strum once to make sure every string rings — you\'ll switch between these two for the rest of this set.',
            text_es: 'Conoce tus dos acordes de hoy: <strong>Em</strong> y <strong>Am</strong> (del Módulo 5). Forma cada forma a partir del diagrama y rasguea una vez para asegurarte de que suenen todas las cuerdas — vas a alternar entre estos dos durante el resto de esta unidad.',
            hint: 'Em uses two fingers; Am adds a third. The diagrams show exactly where each finger goes. Clean chords now make the strumming sound good later.',
            hint_es: 'Em usa dos dedos; Am agrega un tercero. Los diagramas muestran exactamente dónde va cada dedo. Acordes limpios ahora hacen que el rasgueo suene mejor después.',
            chords: [
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
          {
            label: 'Station wrap-up', label_es: 'Cierre de la estación',
            text: 'Station Wrap-Up — pause and think: which was harder to keep steady today — your strum hand swinging non-stop like a pendulum, or counting "1 + 2 + 3 + 4 +" out loud the whole time? What started to feel easier?',
            text_es: 'Cierre de la estación — pausa y piensa: ¿qué se sintió más difícil mantener estable hoy — tu mano de rasgueo balanceándose sin parar como un péndulo, o contar "1 + 2 + 3 + 4 +" en voz alta todo el tiempo? ¿Qué empezó a sentirse más fácil?',
            response: { type: 'short', placeholder: 'e.g. my hand kept freezing on the chord change — slowing to 50 BPM helped it keep swinging',
              placeholder_es: 'p. ej. mi mano se congelaba en el cambio de acorde — bajar a 50 BPM ayudó a que siguiera balanceándose' }
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
            title: 'Build the down-up pendulum motion',
            title_es: 'Construye el movimiento de péndulo abajo-arriba',
            steps: [
          {
            label: 'Challenge 1 — Pendulum Motion', label_es: 'Reto 1 — Movimiento de péndulo',
            text: '<ol><li>Mute the strings with your fretting hand.</li><li>At 60 BPM, strum just the down-up motion — down on each beat, up on each "+" — counting aloud.</li></ol>You\'ve got it when: a free, even swing with no forearm tension — pure rhythm, no notes.<div class="strum-line">D   U   D   U   D   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            text_es: '<ol><li>Silencia las cuerdas con tu mano de trastear.</li><li>A 60 BPM, rasguea solo el movimiento abajo-arriba — abajo en cada tiempo, arriba en cada "+" — contando en voz alta.</li></ol>Lo tienes cuando: un balanceo libre y parejo sin tensión en el antebrazo — puro ritmo, sin notas.<div class="strum-line">D   U   D   U   D   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            hint: 'No chord, no notes — just the rhythm. Your wrist should swing freely like a pendulum. If your forearm is tense, slow down.',
            hint_es: 'Sin acorde, sin notas — solo el ritmo. Tu muñeca debe balancearse libremente como un péndulo. Si tu antebrazo está tenso, ve más despacio.',
            stuck: 'Drop to 50 BPM and let your hand bounce loose, like shaking water off your fingers — the down-up should feel automatic before you add any pressure.',
            stuck_es: 'Baja a 50 BPM y deja que tu mano rebote suelta, como si sacudieras agua de los dedos — el abajo-arriba debe sentirse automático antes de agregar cualquier presión.',
            levelUp: 'Push to 80 BPM, or keep the swing perfectly even with your eyes closed for 8 bars.',
            levelUp_es: 'Sube a 80 BPM, o mantén el balanceo perfectamente parejo con los ojos cerrados durante 8 compases.',
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
            text: '<ol><li>Fret Em.</li><li>Strum down-up at 60 BPM for 8 bars.</li></ol>You\'ve got it when: every strum even — same volume, same timing — with upstrokes brushing only the top 3–4 strings.',
            text_es: '<ol><li>Trastea Em.</li><li>Rasguea abajo-arriba a 60 BPM durante 8 compases.</li></ol>Lo tienes cuando: cada rasgueo parejo — mismo volumen, mismo tiempo — con los golpes hacia arriba rozando solo las 3–4 cuerdas más agudas.',
            hint: 'It\'s normal for upstrokes to feel weaker at first. They should brush only the top 3–4 strings, not the whole chord.',
            hint_es: 'Es normal que los golpes hacia arriba se sientan más débiles al principio. Deben rozar solo las 3–4 cuerdas más agudas, no todo el acorde.',
            stuck: 'Lighten the pick on the way up so it grazes just the thin strings. If the chord buzzes, recheck your Em fingers before worrying about the strum.',
            stuck_es: 'Aligera la púa en el camino hacia arriba para que roce solo las cuerdas delgadas. Si el acorde zumba, revisa tus dedos de Em antes de preocuparte por el rasgueo.',
            levelUp: 'Speed up to 75 BPM, or hold the 8 bars without letting your eyes drop to your strumming hand.',
            levelUp_es: 'Acelera a 75 BPM, o sostén los 8 compases sin dejar que tus ojos bajen hacia tu mano de rasgueo.',
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
            text: '<ol><li>Switch Em ↔ Am every 2 bars while the down-up strum never stops.</li><li>Set the ⏱ Timer for 3 minutes and loop it.</li></ol>You\'ve got it when: the strum hand keeps swinging right through every chord change — let the chord catch up.',
            text_es: '<ol><li>Cambia entre Em ↔ Am cada 2 compases mientras el rasgueo abajo-arriba nunca se detiene.</li><li>Pon el ⏱ Temporizador en 3 minutos y repítelo.</li></ol>Lo tienes cuando: la mano de rasgueo sigue balanceándose durante cada cambio de acorde — deja que el acorde te alcance.',
            hint: 'The #1 beginner mistake is stopping the strum to fix the chord. Keep the wrist moving — let the chord catch up.',
            hint_es: 'El error #1 de los principiantes es detener el rasgueo para arreglar el acorde. Mantén la muñeca en movimiento — deja que el acorde te alcance.',
            stuck: 'Park on a finger Em and Am share and pivot around it — don\'t lift every finger at once. Drop to 50 BPM so the change has room.',
            stuck_es: 'Quédate en un dedo que Em y Am comparten y pivota alrededor de él — no levantes todos los dedos a la vez. Baja a 50 BPM para que el cambio tenga espacio.',
            levelUp: 'Switch every bar instead of every 2 bars, or climb to 75 BPM with the strum still unbroken.',
            levelUp_es: 'Cambia cada compás en lugar de cada 2, o sube a 75 BPM con el rasgueo aún sin interrupciones.',
            skills: [4, 5, 6],
            response: { type: 'short', prompt: 'Personal record — strum unbroken through Em↔Am: play it cleanly at 60 BPM, then go +10 at a time. Your fastest CLEAN switch today (BPM)?', prompt_es: 'Récord personal — rasgueo sin interrupciones a través de Em↔Am: tócalo limpio a 60 BPM, y luego sube de 10 en 10. ¿Tu cambio LIMPIO más rápido hoy (BPM)?', placeholder: 'e.g. 80 — try for a higher number next time', placeholder_es: 'p. ej. 80 — intenta superarlo la próxima vez' },
            playSeq: { label: 'Em → Am roots (2 beats each)', label_es: 'Raíces Em → Am (2 tiempos cada una)', bpm: 60, notes: [40, 40, 45, 45] },
            chords: [
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Speed changes — faster switches, strum never stops',
            title_es: 'Cambios más rápidos — la mano de rasgueo nunca se detiene',
            steps: [
          {
            label: 'Challenge — Half-Bar Switch, Non-Stop (2 chords)', label_es: 'Reto — Cambio de medio compás, sin parar (2 acordes)',
            text: '<ol><li>You just switched Em ↔ Am every two bars — now do it every TWO BEATS, down-up strumming the whole time, changing on beats 1 and 3, at 60 BPM.</li><li>The strum hand never pauses; the chord changes between strums.</li></ol>You\'ve got it when: four laps where the pendulum never stops and every change lands on the beat. Press &#x25B6; to hear the target.',
            text_es: '<ol><li>Acabas de cambiar entre Em ↔ Am cada dos compases — ahora hazlo cada DOS TIEMPOS, rasgueando abajo-arriba todo el tiempo, cambiando en los tiempos 1 y 3, a 60 BPM.</li><li>La mano de rasgueo nunca pausa; el acorde cambia entre rasgueos.</li></ol>Lo tienes cuando: cuatro vueltas donde el péndulo nunca se detiene y cada cambio cae en el tiempo. Presiona &#x25B6; para escuchar el objetivo.',
            hint: 'Keep the wrist swinging down-up-down-up without a hitch — the fingers change underneath a moving hand. The moment you freeze to place the chord, you\'ve stopped the strum.',
            hint_es: 'Mantén la muñeca balanceándose abajo-arriba-abajo-arriba sin tropiezos — los dedos cambian debajo de una mano en movimiento. En el momento que te congelas para colocar el acorde, has detenido el rasgueo.',
            stuck: 'Drop to 50 BPM. Say "change" on the "and" after beats 2 and 4 to remind your fingers to move early.',
            stuck_es: 'Baja a 50 BPM. Di "cambio" en el "y" después de los tiempos 2 y 4 para recordarle a tus dedos que se muevan temprano.',
            levelUp: 'Climb to 70 BPM, or jump ahead to the every-beat drill below.',
            levelUp_es: 'Sube a 70 BPM, o pasa directamente al ejercicio de cada tiempo de abajo.',
            skills: [4, 5],
            chords: [
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
            ],
            playSeq: { label: 'Em·Em · Am·Am roots (change every 2 beats)', label_es: 'Raíces Em·Em · Am·Am (cambia cada 2 tiempos)', bpm: 60, notes: [40, 40, 45, 45, 40, 40, 45, 45] }
          },
          {
            label: 'Challenge — Three-Chord Half-Bar (3 chords)', label_es: 'Reto — Medio compás con tres acordes (3 acordes)',
            text: '<ol><li>Add G (from Module 5).</li><li>Loop Em · Am · G, two beats each, the strum never stopping, at 60 BPM.</li></ol>You\'ve got it when: two clean laps with the pendulum unbroken through all three changes.',
            text_es: '<ol><li>Agrega G (del Módulo 5).</li><li>Repite Em · Am · G, dos tiempos cada uno, el rasgueo sin detenerse, a 60 BPM.</li></ol>Lo tienes cuando: dos vueltas limpias con el péndulo sin interrupciones a través de los tres cambios.',
            hint: 'Am → G moves every finger, so pre-shape G in the air while Am is still ringing. Em → Am shares your two fretting fingers — barely a move.',
            hint_es: 'Am → G mueve cada dedo, así que preforma G en el aire mientras Am todavía suena. Em → Am comparte tus dos dedos de trastear — apenas un movimiento.',
            stuck: 'Loop just Am → G until the strum survives that change, then drop Em back in front.',
            stuck_es: 'Repite solo Am → G hasta que el rasgueo sobreviva ese cambio, y luego vuelve a poner Em al frente.',
            levelUp: 'Speed up to 70 BPM, or count "1 + 2 + 3 + 4 +" aloud the whole time.',
            levelUp_es: 'Acelera a 70 BPM, o cuenta "1 + 2 + 3 + 4 +" en voz alta todo el tiempo.',
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
            text: 'Four chords at half-bar speed with the strum hand driving — this is real rhythm-guitar playing.<ul><li>Play the C · G · Am · F loop from Module 5, down-up strumming, two beats per chord at 60 BPM — this is exactly how the record\'s verse moves, just slowed from its real ~71 BPM, not just a speed drill.</li></ul>You\'ve got it when: two clean laps, strum unbroken, every change on the beat.',
            text_es: 'Cuatro acordes a velocidad de medio compás con la mano de rasgueo al mando — esto es tocar guitarra rítmica de verdad.<ul><li>Toca el loop C · G · Am · F del Módulo 5, rasgueando abajo-arriba, dos tiempos por acorde a 60 BPM — así es exactamente como se mueve la estrofa en la grabación, solo más lento que sus ~71 BPM reales, no es solo un ejercicio de velocidad.</li></ul>Lo tienes cuando: dos vueltas limpias, rasgueo sin interrupciones, cada cambio a tiempo.',
            hint: 'The right hand is the drummer and never stops; the left hand catches up between strokes. Keep upstrokes light — brush only the top few strings.',
            hint_es: 'La mano derecha es el baterista y nunca se detiene; la mano izquierda se pone al día entre golpes. Mantén los golpes hacia arriba ligeros — roza solo las cuerdas más agudas.',
            stuck: 'Isolate the pair that lags (often G → Am or Am → F) and loop just those two with the strum before running the circle.',
            stuck_es: 'Aísla el par que se atrasa (a menudo G → Am o Am → F) y repite solo esos dos con el rasgueo antes de correr el círculo completo.',
            levelUp: 'Push to 70 BPM, or move on to the every-beat drill below.',
            levelUp_es: 'Sube a 70 BPM, o pasa al ejercicio de cada tiempo de abajo.',
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
            text: 'Hear it — the same C · G · Am · F loop as full chords, each one ringing for the full two beats before the next change: two laps, just like the record\'s verse.',
            text_es: 'Escúchalo — el mismo loop C · G · Am · F como acordes completos, cada uno sonando los dos tiempos completos antes del siguiente cambio: dos vueltas, tal como la estrofa de la grabación.',
            playSeq: { label: 'Hear it — C · G · Am · F, two beats per chord', label_es: 'Escúchalo — C · G · Am · F, dos tiempos por acorde', bpm: 60, notes: [
              { midi: [48,52,55,60,64], beats: 2 },
              { midi: [43,47,50,55,59,67], beats: 2 },
              { midi: [45,52,57,60,64], beats: 2 },
              { midi: [53,57,60,65], beats: 2 },
              { midi: [48,52,55,60,64], beats: 2 },
              { midi: [43,47,50,55,59,67], beats: 2 },
              { midi: [45,52,57,60,64], beats: 2 },
              { midi: [53,57,60,65], beats: 2 }
            ] }
          },
          {
            label: 'Challenge — One Chord Per Beat (fastest)', label_es: 'Reto — Un acorde por tiempo (el más rápido)',
            text: 'The top of the ladder.<ul><li>Switch Em ↔ Am on every single beat — one down-strum per beat, a new chord each time, at 60 BPM, the strum still non-stop.</li></ul>You\'ve got it when: four laps clean at 60 where the change happens the instant your hand lifts for the next strum.',
            text_es: 'La cima de la escalera.<ul><li>Cambia entre Em ↔ Am en cada tiempo — un golpe hacia abajo por tiempo, un acorde nuevo cada vez, a 60 BPM, el rasgueo sigue sin detenerse.</li></ul>Lo tienes cuando: cuatro vueltas limpias a 60 donde el cambio ocurre en el instante en que tu mano se levanta para el siguiente rasgueo.',
            hint: 'Em and Am share two fingers, so this is the easiest pair to change every beat — perfect for training raw speed. Trust the shared fingers and move only what has to move.',
            hint_es: 'Em y Am comparten dos dedos, así que es el par más fácil para cambiar en cada tiempo — perfecto para entrenar velocidad pura. Confía en los dedos compartidos y mueve solo lo que tiene que moverse.',
            stuck: 'Slow to 50 BPM and let some changes be a little buzzy — here the goal is the timing of the switch, not perfect tone. Clean it up as the speed settles.',
            stuck_es: 'Baja a 50 BPM y deja que algunos cambios suenen un poco con zumbido — aquí el objetivo es el tiempo del cambio, no un tono perfecto. Límpialo a medida que se asiente la velocidad.',
            levelUp: 'Hold it clean at 70 BPM, or try Am · G one per beat (every finger moves — much harder).',
            levelUp_es: 'Mantenlo limpio a 70 BPM, o prueba Am · G uno por tiempo (cada dedo se mueve — mucho más difícil).',
            skills: [4, 5],
            chords: [
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
            ],
            playSeq: { label: 'Em·Am roots (one chord per beat)', label_es: 'Raíces Em·Am (un acorde por tiempo)', bpm: 60, notes: [40, 45, 40, 45, 40, 45, 40, 45] },
            response: { type: 'short', prompt: 'Your fastest CLEAN one-chord-per-beat Em↔Am today (BPM)?', prompt_es: '¿Tu Em↔Am más rápido y LIMPIO hoy, un acorde por tiempo (BPM)?', placeholder: 'e.g. 60 — 65 next session', placeholder_es: 'p. ej. 60 — 65 la próxima sesión' }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Watchtower", strummed', label_es: 'Reto — "Watchtower", rasgueado',
                text: '<ul><li>Play Am · G · F (small F) · G, four beats of down-up strumming per chord at 60 BPM, the pendulum swinging through all three changes.</li></ul>You\'ve got it when: two full laps (a lap = one full time through the loop) where the strum hand never stops — not even when the F lands late. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this song has grown with you since Module 1</a>.',
                text_es: '<ul><li>Toca Am · G · F (F pequeño) · G, cuatro tiempos de rasgueo abajo-arriba por acorde a 60 BPM, el péndulo balanceándose a través de los tres cambios.</li></ul>Lo tienes cuando: dos vueltas completas (una vuelta = un recorrido completo del loop) donde la mano de rasgueo nunca se detiene — ni siquiera cuando el F llega tarde. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: esta canción ha crecido contigo desde el Módulo 1</a>.',
                hint: 'Same loop you strummed in Module 5 — the new skill is that your right hand is now the drummer. The chord change happens BETWEEN strums. The record actually moves twice this fast — two beats per chord, the same half-bar pace as Module 3\'s Half-Bar Changes — try the level-up below once this feels steady.',
                hint_es: 'El mismo loop que rasgueaste en el Módulo 5 — la nueva destreza es que tu mano derecha ahora es el baterista. El cambio de acorde ocurre ENTRE rasgueos. La grabación en realidad se mueve al doble de esta velocidad — dos tiempos por acorde, el mismo ritmo de medio compás que los Cambios de Medio Compás del Módulo 3 — prueba el nivel superior de abajo cuando esto se sienta firme.',
                stuck: 'Drop to just Am ↔ G until the strum survives that change, then add the F back.',
                stuck_es: 'Baja a solo Am ↔ G hasta que el rasgueo sobreviva ese cambio, y luego agrega de vuelta el F.',
                levelUp: 'Switch every 2 beats instead of 4 — the record\'s actual pace — or count "1 + 2 + 3 + 4 +" out loud the whole time.',
                levelUp_es: 'Cambia cada 2 tiempos en lugar de 4 — el ritmo real de la grabación — o cuenta "1 + 2 + 3 + 4 +" en voz alta todo el tiempo.',
                skills: [2, 5]
              },
              {
                label: 'Challenge — "Knockin\' on Heaven\'s Door"', label_es: 'Reto — "Knockin\' on Heaven\'s Door"',
                text: '<ul><li>Play the real bar lengths — G · D · Am · Am · G · D · C · C — four beats of down-up per bar at 60 BPM. Am and C each hold for two full bars; the record is slow too, so this song never rushes you.</li></ul>You\'ve got it when: one full lap (all eight bars) with even volume on downs and ups and every change landing on beat 1.',
                text_es: '<ul><li>Toca la duración real de los compases — G · D · Am · Am · G · D · C · C — cuatro tiempos de abajo-arriba por compás a 60 BPM. Am y C se sostienen cada uno durante dos compases completos; la grabación también es lenta, así que esta canción nunca te apura.</li></ul>Lo tienes cuando: una vuelta completa (los ocho compases) con volumen parejo en los golpes hacia abajo y hacia arriba, y cada cambio cayendo en el tiempo 1.',
                hint: 'Dylan built this song to support a voice — soft, even 8ths are the whole job. If an upstroke catches the strings, let the pick graze just the top 3–4 strings.',
                hint_es: 'Dylan construyó esta canción para apoyar una voz — corcheas suaves y parejas son todo el trabajo. Si un golpe hacia arriba engancha las cuerdas, deja que la púa roce solo las 3–4 cuerdas más agudas.',
                stuck: 'Am and C each get two full bars, so those are your breathing room — no change to make until the bar after next. G → D, D → Am, Am → G, D → C, and C → G all reset the whole hand, so loop those one at a time.',
                stuck_es: 'Am y C se sostienen cada uno durante dos compases completos, así que esos son tu momento de respiro — no hay que cambiar hasta el compás siguiente. G → D, D → Am, Am → G, D → C, y C → G reinician toda la mano, así que repite esos uno a la vez.',
                levelUp: 'Sing or hum a line over your own strumming, or speed up to 70 BPM with the 8ths still even.',
                levelUp_es: 'Canta o tararea una línea sobre tu propio rasgueo, o acelera a 70 BPM manteniendo las corcheas parejas.',
                skills: [2, 4],
                response: { type: 'short', prompt: 'Personal record — full laps in a row with the strum hand never stopping. Your count today?', prompt_es: 'Récord personal — vueltas completas seguidas con la mano de rasgueo sin detenerse nunca. ¿Tu cuenta de hoy?', placeholder: 'e.g. 3 — try for a higher number next time', placeholder_es: 'p. ej. 3 — intenta superarlo la próxima vez' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Keeps a steady down-up 8th-note pulse for 8+ bars · Counts "1 + 2 + 3 + 4 +" aloud while strumming · Switches between Em and Am without stopping the strum hand · Strums evenly (downstrokes and upstrokes same volume)',
      goal_es: 'Mantiene un pulso de corcheas abajo-arriba constante durante 8+ compases · Cuenta "1 + 2 + 3 + 4 +" en voz alta mientras rasguea · Cambia entre Em y Am sin detener la mano de rasgueo · Rasguea de forma pareja (golpes hacia abajo y hacia arriba con el mismo volumen)',
      performance: 'Strum Em for 4 bars, then Am for 4 bars, with a steady down-up pulse at 60 BPM, counting aloud the whole time. Record 20 seconds on your phone and listen back for the strum hand never stopping — especially at the change.',
      selfCheck: 'Can you keep your strum hand moving even during a chord change? Can you count the 8th-note pulse out loud without slowing down?',
      selfCheck_es: '¿Puedes mantener tu mano de rasgueo en movimiento incluso durante un cambio de acorde? ¿Puedes contar el pulso de corcheas en voz alta sin ir más despacio?',
      standards: ['Pr.4a', 'Pr.5a']
    },

    skills: [
      { id: 'm6w1-s1', text: 'Move my strumming wrist like a pendulum — continuous motion, even between strums',
        text_es: 'Mover mi muñeca de rasgueo como un péndulo — movimiento continuo, incluso entre rasgueos',
        gotItWhen: 'you can watch your strum hand in a mirror or on a quick phone video and see that it never fully stops — the wrist is always traveling down or up, even when you skip a strum.',
        gotItWhen_es: 'puedes mirar tu mano de rasgueo en un espejo o en un video rápido del teléfono y ver que nunca se detiene por completo — la muñeca siempre viaja hacia abajo o hacia arriba, incluso cuando te saltas un rasgueo.',
        practice: { type: 'mc', prompt: 'When the wrist "stops" between strums, what usually goes wrong?',
          prompt_es: 'Cuando la muñeca "se detiene" entre rasgueos, ¿qué suele salir mal?',
          choices: ['Nothing — it should stop', 'You lose the pulse and the timing falls apart', 'The pick gets dropped', 'The chord sounds louder'],
          choices_es: ['Nada — debería detenerse', 'Pierdes el pulso y el tiempo se desmorona', 'Se te cae la púa', 'El acorde suena más fuerte'], answer: 1,
          explain: 'The pendulum swing IS your sense of the beat — stop the hand and you lose the pulse, so the next strum lands early or late. Keep it traveling even on strums you skip.',
          explain_es: 'El balanceo de péndulo ES tu sentido del tiempo — si detienes la mano pierdes el pulso, y el siguiente rasgueo cae temprano o tarde. Mantenla viajando incluso en los rasgueos que te saltas.' } },
      { id: 'm6w1-s2', text: 'Play a steady down-up 8th-note pattern at 60 BPM for 8 bars',
        text_es: 'Tocar un patrón de corcheas abajo-arriba constante a 60 BPM durante 8 compases',
        gotItWhen: 'you can strum down-up at 60 BPM for 8 bars and every strum lands evenly with the metronome — no drift, no skipped strums.',
        gotItWhen_es: 'puedes rasguear abajo-arriba a 60 BPM durante 8 compases y cada rasgueo cae parejo con el metrónomo — sin desviarte, sin saltarte rasgueos.',
        practice: { type: 'pr', prompt: '<ol><li>Strum down-up 8th notes on one chord, every strum landing with the click, for 8 bars.</li><li>Start at 60 BPM and raise the metronome +5 at a time.</li><li>Log your fastest even BPM.</li></ol>',
          prompt_es: '<ol><li>Rasguea corcheas abajo-arriba sobre un acorde, con cada rasgueo cayendo con el clic, durante 8 compases.</li><li>Empieza a 60 BPM y sube el metrónomo de 5 en 5.</li><li>Anota tu BPM parejo más rápido.</li></ol>',
          unit: 'BPM', placeholder: 'e.g. 70 — try for a higher number next session', placeholder_es: 'p. ej. 70 — intenta superarlo la próxima sesión' } },
      { id: 'm6w1-s3', text: 'Count "1 + 2 + 3 + 4 +" out loud while strumming',
        text_es: 'Contar "1 + 2 + 3 + 4 +" en voz alta mientras rasgueas',
        gotItWhen: 'you can count aloud with the strum and the numbers always land on downstrokes, the "and"s always land on upstrokes — no thinking required.',
        gotItWhen_es: 'puedes contar en voz alta con el rasgueo y los números siempre caen en los golpes hacia abajo, los "y" siempre caen en los golpes hacia arriba — sin necesidad de pensarlo.',
        practice: { type: 'mc', prompt: 'In "1 + 2 + 3 + 4 +", which counts are the DOWNSTROKES?',
          prompt_es: 'En "1 + 2 + 3 + 4 +", ¿cuáles tiempos son los GOLPES HACIA ABAJO?',
          choices: ['The "+" (and) counts', 'The numbers (1, 2, 3, 4)', 'All of them', 'Only beat 1'],
          choices_es: ['Los "+" (y)', 'Los números (1, 2, 3, 4)', 'Todos', 'Solo el tiempo 1'], answer: 1,
          explain: 'The numbers are the beats, and your hand is always traveling down when a beat arrives — so numbers = downstrokes, "+" = upstrokes. Keeping that fixed means you never have to decide mid-bar.',
          explain_es: 'Los números son los tiempos, y tu mano siempre va bajando cuando llega un tiempo — así que números = rasgueos hacia abajo, "+" = rasgueos hacia arriba. Mantener eso fijo hace que nunca tengas que decidirlo a mitad del compás.' } },
      { id: 'm6w1-s4', text: 'Strum with even volume — downstrokes and upstrokes feel equally controlled',
        text_es: 'Rasguear con volumen parejo — los golpes hacia abajo y hacia arriba se sienten igual de controlados',
        gotItWhen: 'your downstrokes and upstrokes sound roughly the same volume — neither overpowers the other, and your pick doesn\'t catch the strings on the way up.',
        gotItWhen_es: 'tus golpes hacia abajo y hacia arriba suenan más o menos con el mismo volumen — ninguno domina al otro, y tu púa no engancha las cuerdas en el camino hacia arriba.',
        practice: { type: 'mc', prompt: 'Your upstrokes sound weak and clunky compared to your downstrokes. What\'s the classic fix?',
          prompt_es: 'Tus golpes hacia arriba suenan débiles y torpes comparados con los de abajo. ¿Cuál es el arreglo clásico?',
          choices: ['Relax the wrist and let the upstroke brush just the top few strings', 'Grip the pick harder and dig in on the way up', 'Skip the upstrokes until they\'re perfect', 'Swing the whole arm up for more power'],
          choices_es: ['Relajar la muñeca y dejar que el golpe hacia arriba roce solo las primeras cuerdas agudas', 'Apretar más la púa y clavarla en el camino hacia arriba', 'Saltarte los golpes hacia arriba hasta que salgan perfectos', 'Subir todo el brazo para tener más fuerza'], answer: 0,
          explain: 'Upstrokes aren\'t downstrokes in reverse — a relaxed wrist brushing the top 3–4 strings sounds even. Gripping harder or using the whole arm makes the catch worse.',
          explain_es: 'Los golpes hacia arriba no son los de abajo al revés — una muñeca relajada rozando las 3–4 cuerdas agudas suena pareja. Apretar más o usar todo el brazo empeora el enganche.' } },
      { id: 'm6w1-s5', text: 'Keep the strum hand moving through a chord change',
        text_es: 'Mantener la mano de rasgueo en movimiento a través de un cambio de acorde',
        gotItWhen: 'when you switch from Em to Am (or any two chords), your strum hand never pauses — the chord change happens BETWEEN strums, not by stopping the rhythm.',
        gotItWhen_es: 'cuando cambias de Em a Am (o cualquier par de acordes), tu mano de rasgueo nunca pausa — el cambio de acorde ocurre ENTRE rasgueos, no deteniendo el ritmo.',
        practice: { type: 'mc', prompt: 'During a chord change, what should your STRUM hand do?',
          prompt_es: 'Durante un cambio de acorde, ¿qué debería hacer tu mano de RASGUEO?',
          choices: ['Stop and wait for the chord', 'Keep moving in the down-up pendulum', 'Strum extra hard to cover the change', 'Lift off the strings'],
          choices_es: ['Detenerse y esperar al acorde', 'Seguir moviéndose en el péndulo abajo-arriba', 'Rasguear extra fuerte para cubrir el cambio', 'Levantarse de las cuerdas'], answer: 1,
          explain: 'The strum hand keeps its down-up swing and the fretting hand does the changing. Stopping to wait for the chord is what turns a small fumble into a break in the beat.',
          explain_es: 'La mano de rasgueo mantiene su balanceo abajo-arriba y la mano de trastear es la que hace el cambio. Detenerte a esperar el acorde es lo que convierte un tropiezo pequeño en una interrupción del tiempo.' } },
      { id: 'm6w1-s6', text: 'Play 4 bars of Em then 4 bars of Am with a continuous down-up strum',
        text_es: 'Tocar 4 compases de Em y luego 4 compases de Am con un rasgueo abajo-arriba continuo',
        gotItWhen: 'you can loop Em-Em-Em-Em-Am-Am-Am-Am with down-up strumming at 60 BPM and never break the rhythm — even when the chord change is imperfect.',
        gotItWhen_es: 'puedes repetir Em-Em-Em-Em-Am-Am-Am-Am con rasgueo abajo-arriba a 60 BPM sin romper nunca el ritmo — incluso cuando el cambio de acorde no es perfecto.',
        practice: { type: 'playSeq', label: 'Em → Am roots (1 bar each — loop it for the full 4+4)', label_es: 'Raíces Em → Am (1 compás cada una — repítelo para los 4+4 completos)', bpm: 60,
          notes: [40, 40, 40, 40, 45, 45, 45, 45] } }
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
            title: 'Watch the lesson videos',
            title_es: 'Mira los videos de la lección',
            steps: [
          {
            label: 'Watch: the D-DU-UDU pattern', label_es: 'Mira: el patrón D-DU-UDU',
            text: 'Watch: <a href="https://youtu.be/6LmQCdt_ZhQ" target="_blank">The Most Common Strumming Pattern of All Time! – JustinGuitar</a> (0:00–4:00). Your task while you watch: air-strum along and find the two moments the pick misses — the wrist keeps swinging, but on purpose it skips one upstroke and one downstroke.',
            text_es: 'Mira: <a href="https://youtu.be/6LmQCdt_ZhQ" target="_blank">The Most Common Strumming Pattern of All Time! – JustinGuitar</a> (0:00–4:00). Tu tarea mientras miras: rasguea en el aire junto con él y encuentra los dos momentos en que la púa falla a propósito — la muñeca sigue balanceándose, pero se salta un golpe hacia arriba y uno hacia abajo a propósito.',
            hint: 'You already met this pattern in Module 5, where it was called the folk strum (D · D U · U D U) — it\'s the same six strums. What\'s new here is naming it, counting it out loud, and making it survive a chord change. Justin calls it the pattern you can always rely on — D-DU-UDU. Listen for which strums he skips: the wrist still moves, but the pick doesn\'t hit the strings on those two slots.',
            hint_es: 'Ya conociste este patrón en el Módulo 5, donde se llamaba el rasgueo folk (D · D U · U D U) — son los mismos seis rasgueos. Lo nuevo aquí es nombrarlo, contarlo en voz alta, y lograr que sobreviva a un cambio de acorde. Justin lo llama el patrón en el que siempre puedes confiar — D-DU-UDU. Escucha cuáles rasgueos se salta: la muñeca sigue moviéndose, pero la púa no toca las cuerdas en esos dos espacios.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'In the D-DU-UDU pattern, which UPSTROKE is skipped (the wrist swings up but the pick misses)?',
              prompt_es: 'En el patrón D-DU-UDU, ¿cuál GOLPE HACIA ARRIBA se salta (la muñeca sube pero la púa falla)?',
              answer: 0,
              explain: 'Reading "D - DU - UDU" over "1 + 2 + 3 + 4 +", the skipped upstroke is the "+" of beat 1 — the wrist swings up but the pick misses on purpose. (Beat 3, a downstroke, is the other skip.)',
              explain_es: 'Leyendo "D - DU - UDU" sobre "1 + 2 + 3 + 4 +", el golpe hacia arriba que se salta es el "+" del tiempo 1 — la muñeca sube pero la púa falla a propósito. (El tiempo 3, un golpe hacia abajo, es el otro que se salta.)',
              choices: [
              'The "+" of beat 1',
              'Beat 2 (the third strum)',
              'The "+" of beat 4',
              'Beat 1'
            ],
              choices_es: [
              'El "+" del tiempo 1',
              'El tiempo 2 (el tercer rasgueo)',
              'El "+" del tiempo 4',
              'El tiempo 1'
            ] }
          },
          {
            label: 'Watch: backbeat accents', label_es: 'Mira: acentos en el contratiempo',
            text: 'Watch: <a href="https://youtu.be/0JDGO0n6tjw" target="_blank">Step-by-Step Easy Strumming Patterns – Marty Music</a> (0:00–3:00). Your task while you watch: clap a little louder on beats 2 and 4 along with him, and feel how that "backbeat" makes the pattern groove.',
            text_es: 'Mira: <a href="https://youtu.be/0JDGO0n6tjw" target="_blank">Step-by-Step Easy Strumming Patterns – Marty Music</a> (0:00–3:00). Tu tarea mientras miras: aplaude un poco más fuerte en los tiempos 2 y 4 junto con él, y siente cómo ese "contratiempo" le da groove al patrón.',
            hint: 'Marty stacks patterns from easiest to harder, accenting beats 2 and 4 as he goes. The accents give the strum a "backbeat" feel, like a drummer\'s snare.',
            hint_es: 'Marty apila patrones de más fácil a más difícil, acentuando los tiempos 2 y 4 a medida que avanza. Los acentos le dan al rasgueo una sensación de "contratiempo", como el tambor de un baterista.',
            skills: [1, 3],
            response: { type: 'short', placeholder: 'Why might emphasizing beats 2 and 4 (instead of 1 and 3) make a strum pattern sound more "groovy"?',
              placeholder_es: '¿Por qué acentuar los tiempos 2 y 4 (en lugar de 1 y 3) podría hacer que un patrón de rasgueo suene con más "groove"?' }
          }
            ]
          },
          {
            title: 'Tap the pattern with a real song',
            title_es: 'Marca el patrón con una canción real',
            steps: [
          {
            label: 'Tap along: I\'m Yours', label_es: 'Marca el patrón: I\'m Yours',
            text: 'Listen to "I\'m Yours" by Jason Mraz. Tap the D-DU-UDU pattern on your leg along with the song. Where does the pattern repeat?',
            text_es: 'Escucha "I\'m Yours" de Jason Mraz. Marca el patrón D-DU-UDU en tu pierna junto con la canción. ¿Dónde se repite el patrón?',
            hint: 'The pattern is one bar long and repeats throughout the whole song. Once you have it, you have most of his song.',
            hint_es: 'El patrón dura un compás y se repite durante toda la canción. Una vez que lo dominas, tienes la mayor parte de la canción.',
            skills: [1, 5],
            response: { type: 'mc', prompt: 'You count one bar as "1 + 2 + 3 + 4 +". How many strum SLOTS is that — counting every down and every up?',
              prompt_es: 'Cuentas un compás como "1 y 2 y 3 y 4 y". ¿Cuántos ESPACIOS de rasgueo son — contando cada golpe hacia abajo y cada uno hacia arriba?',
              answer: 1,
              explain: 'Four beats, each split into a down (the number) and an up (the "+"), gives 8 slots in the bar. D-DU-UDU only strums six of them — the other two are the skipped "+" of beat 1 and the down on beat 3 — but the bar is still 8 slots wide.',
              explain_es: 'Cuatro tiempos, cada uno dividido en un golpe hacia abajo (el número) y uno hacia arriba (el "y"), dan 8 espacios en el compás. D-DU-UDU solo rasguea seis — los otros dos son el "y" del tiempo 1 y el "abajo" del tiempo 3 que se saltan — pero el compás sigue midiendo 8 espacios.',
              choices: [
              '4 — one slot per beat',
              '8 — a down and an up on every beat',
              '6 — D-DU-UDU only strums six times',
              '16 — that would be two bars\' worth'
            ],
              choices_es: [
              '4 — un espacio por tiempo',
              '8 — un golpe hacia abajo y uno hacia arriba en cada tiempo',
              '6 — D-DU-UDU solo rasguea seis veces',
              '16 — eso serían dos compases'
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
            text: 'Today\'s pattern lands on <strong>G</strong> and <strong>D</strong>. Form each shape from the diagram and strum once cleanly before you add the D-DU-UDU rhythm.',
            text_es: 'El patrón de hoy cae sobre <strong>G</strong> y <strong>D</strong>. Forma cada forma a partir del diagrama y rasguea una vez de forma limpia antes de agregar el ritmo D-DU-UDU.',
            hint: 'G is a full six-string chord; D skips the two lowest strings (the X marks). Get them ringing clean first — the rhythm is easier when the chord isn\'t fighting you.',
            hint_es: 'G es un acorde completo de seis cuerdas; D se salta las dos cuerdas más graves (las marcas X). Primero logra que suenen limpios — el ritmo es más fácil cuando el acorde no está peleando contigo.',
            chords: [
              { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
              { name: 'D', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'1'],[2,3,'3'],[1,2,'2']], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
          {
            label: 'Station wrap-up', label_es: 'Cierre de la estación',
            text: 'Station Wrap-Up — pause and think: in the D-DU-UDU pattern, what trips you up more right now — skipping a strum while the wrist keeps moving, or landing the accents on beats 2 and 4? What helped today?',
            text_es: 'Cierre de la estación — pausa y piensa: en el patrón D-DU-UDU, ¿qué te confunde más ahora mismo — saltarte un rasgueo mientras la muñeca sigue en movimiento, o hacer caer los acentos en los tiempos 2 y 4? ¿Qué te ayudó hoy?',
            response: { type: 'short', placeholder: 'e.g. I keep actually hitting the strings on the skip — pulling the pick back just slightly fixed it',
              placeholder_es: 'p. ej. sigo tocando las cuerdas en el rasgueo que debo saltarme — alejar la púa un poco lo arregló' }
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
            title: 'Warm-up — tune + recall the down-up (Modules 1 & 6)',
            title_es: 'Calentamiento — afina y recuerda el abajo-arriba (Módulos 1 y 6)',
            steps: [
              {
                label: 'Warm-up: tune + down-up', label_es: 'Calentamiento: afina + abajo-arriba',
                text: 'Tune all 6 strings to green, then warm the strum hand: 4 bars of steady down-up on Em at 60 BPM (Set 1). You\'ve got it when: in tune and the pendulum already swinging before you add the new pattern.',
                text_es: 'Afina las 6 cuerdas hasta que estén en verde, y luego calienta la mano de rasgueo: 4 compases de abajo-arriba constante en Em a 60 BPM (Unidad 1). Lo tienes cuando: estás afinado y el péndulo ya está balanceándose antes de agregar el nuevo patrón.',
                hint: 'Look back: D-DU-UDU is just the down-up you already own with two strums left out — the same six strums you met in Module 5 as the folk strum. Get the even swing going first.',
                hint_es: 'Recuerda: D-DU-UDU es solo el abajo-arriba que ya dominas con dos rasgueos omitidos — los mismos seis rasgueos que conociste en el Módulo 5 como el rasgueo folk. Primero logra que el balanceo parejo funcione.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Learn the D-DU-UDU pattern',
            title_es: 'Aprende el patrón D-DU-UDU',
            steps: [
          {
            label: 'Challenge 1 — D-DU-UDU, Muted Strings', label_es: 'Reto 1 — D-DU-UDU con cuerdas silenciadas',
            text: '<ol><li>Mute the strings.</li><li>At 60 BPM, strum the pattern "Down, Down-Up, Up-Down-Up" (D-DU-UDU).</li></ol>You\'ve got it when: the wrist keeps moving on the skipped downstroke — the pick just misses on purpose.<div class="strum-line">D   ·   D   U   ·   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            text_es: '<ol><li>Silencia las cuerdas.</li><li>A 60 BPM, rasguea el patrón "Abajo, Abajo-Arriba, Arriba-Abajo-Arriba" (D-DU-UDU).</li></ol>Lo tienes cuando: la muñeca sigue en movimiento en el golpe hacia abajo que te saltas — la púa solo falla a propósito.<div class="strum-line">D   ·   D   U   ·   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            hint: 'The trickiest part is keeping the wrist moving on the skipped downstroke. The wrist still goes down — the pick just misses the strings on purpose.',
            hint_es: 'La parte más difícil es mantener la muñeca en movimiento en el golpe hacia abajo que te saltas. La muñeca sigue bajando — la púa solo falla las cuerdas a propósito.',
            stuck: 'Say it out loud — "down, down-up, up-down-up" — and air-strum with no pick first. The · dots above are the beats your hand passes but doesn\'t hit.',
            stuck_es: 'Dilo en voz alta — "abajo, abajo-arriba, arriba-abajo-arriba" — y rasguea en el aire sin púa primero. Los puntos · de arriba son los tiempos que tu mano pasa pero no toca.',
            levelUp: 'Run it at 75 BPM, or accent the very first down of each bar so the pattern has a clear "top".',
            levelUp_es: 'Tócalo a 75 BPM, o acentúa el primer golpe hacia abajo de cada compás para que el patrón tenga un "inicio" claro.',
            skills: [1, 2, 6]
          }
            ]
          },
          {
            title: 'Play the pattern with backbeat accents',
            title_es: 'Toca el patrón con acentos de contratiempo',
            steps: [
          {
            label: 'Challenge 2 — D-DU-UDU on Em', label_es: 'Reto 2 — D-DU-UDU en Em',
            text: '<ol><li>Fret Em.</li><li>Play D-DU-UDU at 60 BPM for 8 bars, counting aloud and accenting beats 2 and 4.</li></ol>You\'ve got it when: 8 clean bars with a clear "snare hit" feel on 2 and 4.',
            text_es: '<ol><li>Trastea Em.</li><li>Toca D-DU-UDU a 60 BPM durante 8 compases, contando en voz alta y acentuando los tiempos 2 y 4.</li></ol>Lo tienes cuando: 8 compases limpios con una sensación clara de "golpe de tarola" en el 2 y el 4.',
            hint: 'Add accents on beats 2 and 4 — those downstrokes should be a little louder. Feel the "snare hit" on those beats.',
            hint_es: 'Agrega acentos en los tiempos 2 y 4 — esos golpes hacia abajo deben ser un poco más fuertes. Siente el "golpe de tarola" en esos tiempos.',
            stuck: 'Drop the accents for now and just get the D-DU-UDU shape clean for 8 bars; add the louder 2-and-4 hits once the pattern runs on autopilot.',
            stuck_es: 'Deja los acentos por ahora y solo logra que la forma D-DU-UDU salga limpia durante 8 compases; agrega los golpes más fuertes en 2 y 4 una vez que el patrón salga en piloto automático.',
            levelUp: 'Move it to G or D, or push to 75 BPM with the backbeat still landing.',
            levelUp_es: 'Muévelo a G o D, o sube a 75 BPM manteniendo el contratiempo cayendo bien.',
            skills: [1, 3],
            playSeq: { label: 'Hear the beat — add your own accent on 2 and 4', label_es: 'Escucha el tiempo — agrega tu propio acento en el 2 y el 4', bpm: 60, notes: [40, 47, 40, 47] }
          }
            ]
          },
          {
            title: 'Hold the pattern through a chord change',
            title_es: 'Mantén el patrón a través de un cambio de acorde',
            steps: [
          {
            label: 'Challenge 3 — G → D, Pattern Locked (your assessment piece)', label_es: 'Reto 3 — G → D, patrón asegurado (tu pieza de evaluación)',
            text: '<ol><li>Loop G → D every 2 bars playing D-DU-UDU.</li><li>Set the ⏱ Timer for 3 minutes to keep going.</li></ol>You\'ve got it when: the pattern stays identical through the change — only the chord moves (drop to 50 BPM if it falls apart).',
            text_es: '<ol><li>Repite G → D cada 2 compases tocando D-DU-UDU.</li><li>Pon el ⏱ Temporizador en 3 minutos para seguir.</li></ol>Lo tienes cuando: el patrón se mantiene idéntico a través del cambio — solo el acorde se mueve (baja a 50 BPM si se desarma).',
            hint: 'If the pattern falls apart during the chord change, slow to 50 BPM. The pattern is the GROOVE — losing it is worse than missing a note in the chord.',
            hint_es: 'Si el patrón se desarma durante el cambio de acorde, baja a 50 BPM. El patrón ES el groove — perderlo es peor que fallar una nota en el acorde.',
            stuck: 'Change the chord on the LAST upstroke of the bar, while your hand is already moving up — that\'s the free moment to jump from G to D. Loop just 2 bars until the join between the two bars (the seam) is smooth.',
            stuck_es: 'Cambia el acorde en el ÚLTIMO golpe hacia arriba del compás, mientras tu mano ya está subiendo — ese es el momento libre para saltar de G a D. Repite solo 2 compases hasta que la unión entre ambos (la costura) salga fluida.',
            levelUp: 'Add a third chord (G → D → Em), or run it at 75 BPM with no break at the change.',
            levelUp_es: 'Agrega un tercer acorde (G → D → Em), o tócalo a 75 BPM sin interrupción en el cambio.',
            skills: [1, 4],
            response: { type: 'short', prompt: 'Personal record — D-DU-UDU through the G→D change: play it cleanly at 60 BPM, then go +10 at a time. Your fastest CLEAN loop today (BPM)?', prompt_es: 'Récord personal — D-DU-UDU a través del cambio G→D: tócalo limpio a 60 BPM, y luego sube de 10 en 10. ¿Tu vuelta LIMPIA más rápida hoy (BPM)?', placeholder: 'e.g. 80 — try for a higher number next time', placeholder_es: 'p. ej. 80 — intenta superarlo la próxima vez' }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — I\'m Yours, verse', label_es: 'Reto — I\'m Yours, estrofa',
                text: 'This is THE song this pattern is famous for.<ul><li>Play G · D · Em · C with D-DU-UDU, one bar per chord at 60 BPM.</li></ul>You\'ve got it when: the verse loop start to finish with the pattern identical on every chord — even when a chord lands imperfect, the groove holds.',
                text_es: 'Esta es LA canción por la que este patrón es famoso.<ul><li>Toca G · D · Em · C con D-DU-UDU, un compás por acorde a 60 BPM.</li></ul>Lo tienes cuando: el loop de la estrofa de principio a fin con el patrón idéntico en cada acorde — incluso cuando un acorde no sale perfecto, el groove se mantiene.',
                hint: 'The pattern IS the song here. If it breaks at a change, the fix is Challenge 3\'s trick: jump chords on the last upstroke of the bar.',
                hint_es: 'El patrón ES la canción aquí. Si se rompe en un cambio, el arreglo es el truco del Reto 3: salta de acorde en el último golpe hacia arriba del compás.',
                stuck: 'Play the loop with one strum per bar until the changes are clean, then layer the pattern back on.',
                stuck_es: 'Toca el loop con un rasgueo por compás hasta que los cambios salgan limpios, y luego vuelve a agregar el patrón.',
                levelUp: 'Accent beats 2 and 4 to match the recording\'s bouncy feel, or push to 75 BPM.',
                levelUp_es: 'Acentúa los tiempos 2 y 4 para igualar la sensación rebotante de la grabación, o sube a 75 BPM.',
                skills: [4, 5],
                playSeq: { label: '"I\'m Yours" verse roots (G · D · Em · C)', label_es: 'Raíces de la estrofa de "I\'m Yours" (G · D · Em · C)', bpm: 60, notes: [43, 50, 40, 48] }
              },
              {
                label: 'Challenge — "Oye Mi Amor", verse', label_es: 'Reto — "Oye Mi Amor", estrofa',
                text: 'The verse uses just two chords, Bm · G:<ol><li>Use the small Bm (top four strings, no barre).</li><li>Play one bar of each with D-DU-UDU at 60 BPM.</li></ol>You\'ve got it when: four laps with the pattern unbroken and beats 2 and 4 accented so it pushes like the record.',
                text_es: 'La estrofa usa solo dos acordes, Bm · G:<ol><li>Usa el Bm pequeño (cuatro cuerdas más agudas, sin cejilla).</li><li>Toca un compás de cada uno con D-DU-UDU a 60 BPM.</li></ol>Lo tienes cuando: cuatro vueltas con el patrón sin interrupciones y los tiempos 2 y 4 acentuados para que empuje como la grabación.',
                hint: 'The small Bm is the easier beginner version — the full-barre Bm (one finger pressed flat across several strings) arrives in Module 7. For now the pattern matters more than the shape.',
                hint_es: 'El Bm pequeño es la versión más fácil para principiantes — el Bm con cejilla completa (un dedo presionado plano sobre varias cuerdas) llega en el Módulo 7. Por ahora el patrón importa más que la forma.',
                stuck: 'Loop just the G → Bm change with one strum per bar until the landing is clean, then add the pattern.',
                stuck_es: 'Repite solo el cambio G → Bm con un rasgueo por compás hasta que la llegada salga limpia, y luego agrega el patrón.',
                levelUp: 'Lean into the up-strums a little — that extra offbeat push is the Latin feel.',
                levelUp_es: 'Inclínate un poco más hacia los golpes hacia arriba — ese empuje extra de contratiempo es la sensación latina.',
                skills: [3, 5],
                chords: [
                  { name: 'Bm', chord: [[6,'x'],[5,'x'],[4,4,'4'],[3,4,'3'],[2,3,'2'],[1,2,'1']], position: 2 }
                ],
                response: { type: 'short', prompt: 'Which fought you more — the small Bm shape, or keeping the pattern through the change?', prompt_es: '¿Qué te costó más — la forma pequeña de Bm, o mantener el patrón a través del cambio?', placeholder: 'e.g. the Bm — my pinky keeps missing fret 4', placeholder_es: 'p. ej. el Bm — mi meñique sigue fallando el traste 4' }
              }
            ]
          },
          {
            title: 'Ear Spark — optional ear bonus',
            title_es: 'Chispa auditiva — bono opcional de oído',
            steps: [
              {
                label: 'Ear Spark: rhythm echo', label_es: 'Chispa auditiva: eco de ritmo',
                text: 'Ear Spark (optional, 2 min):<ol><li>Play any lesson video from this set and pause right after one bar of strumming.</li><li>Clap the rhythm back exactly.</li><li>Play it as muted strums.</li></ol>Rhythm echo is ear training too. Got someone around? Have them clap a bar of any pattern from this set for you to echo.',
                text_es: 'Chispa auditiva (opcional, 2 min):<ol><li>Reproduce cualquier video de lección de esta unidad y pausa justo después de un compás de rasgueo.</li><li>Aplaude el ritmo exactamente igual.</li><li>Tócalo como rasgueos silenciados.</li></ol>El eco rítmico también es entrenamiento auditivo. ¿Tienes a alguien cerca? Pídele que aplauda un compás de cualquier patrón de esta unidad para que lo repitas.'
              }
            ]
          },
          {
            title: 'Play-along — one full pass, no stopping',
            title_es: 'Toca junto — un pase completo, sin detenerte',
            steps: [
              {
                label: 'Play-along at 0.75×', label_es: 'Toca junto a 0.75×',
                text: 'Play-along:<ol><li>Open Station B\'s D-DU-UDU lesson video.</li><li>Set YouTube\'s speed to 0.75×.</li><li>Strum along for the ENTIRE demo section without stopping.</li></ol>You\'ve got it when: you finish a full pass with the video — flubbed changes and all, don\'t stop.',
                text_es: 'Toca junto:<ol><li>Abre el video de la lección D-DU-UDU de la Estación B.</li><li>Pon la velocidad de YouTube en 0.75×.</li><li>Rasguea junto con él durante TODA la sección de demostración sin detenerte.</li></ol>Lo tienes cuando: terminas un pase completo con el video — con cambios fallidos y todo, no te detengas.',
                hint: 'Not stopping is the skill. Real songs don\'t wait for you, and neither does the video — keeping going after a mistake is better than starting over.',
                hint_es: 'No detenerte es la destreza. Las canciones reales no te esperan, y el video tampoco — seguir adelante después de un error es mejor que volver a empezar.'
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Plays the D-DU-UDU pattern cleanly at 60 BPM (70+ is the push goal) · Accents beats 2 and 4 (backbeat) · Keeps pattern steady through a chord change · Applies pattern to a real song',
      goal_es: 'Toca el patrón D-DU-UDU de forma limpia a 60 BPM (70+ es la meta de empuje) · Acentúa los tiempos 2 y 4 (contratiempo) · Mantiene el patrón estable a través de un cambio de acorde · Aplica el patrón a una canción real',
      performance: 'Strum D-DU-UDU on G for 2 bars, then switch to D for 2 more, looping for 3 minutes without the pattern breaking at the change. With someone around, trade off instead: one plays G, the other takes over on D, and the pattern must not break at the handoff.',
      selfCheck: 'Can you play D-DU-UDU without thinking about which strum is next? Can you keep the pattern going through a G-to-D change?',
      selfCheck_es: '¿Puedes tocar D-DU-UDU sin pensar en cuál rasgueo sigue? ¿Puedes mantener el patrón a través de un cambio de G a D?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
    },

    skills: [
      { id: 'm6w2-s1', text: 'Play the D-DU-UDU pattern cleanly at 60 BPM',
        text_es: 'Tocar el patrón D-DU-UDU de forma limpia a 60 BPM',
        gotItWhen: 'you can play D-DU-UDU on a single chord at 60 BPM for 4 bars in a row without breaking the pattern or stopping the wrist.',
        gotItWhen_es: 'puedes tocar D-DU-UDU en un solo acorde a 60 BPM durante 4 compases seguidos sin romper el patrón ni detener la muñeca.',
        practice: { type: 'pr', prompt: '<ol><li>Play D-DU-UDU on a single chord, 4 bars in a row, wrist never stopping.</li><li>Start at 60 BPM and raise the metronome +5 at a time.</li><li>Log your fastest clean BPM.</li></ol>',
          prompt_es: '<ol><li>Toca D-DU-UDU sobre un solo acorde, 4 compases seguidos, sin que la muñeca se detenga.</li><li>Empieza a 60 BPM y sube el metrónomo de 5 en 5.</li><li>Anota tu BPM limpio más rápido.</li></ol>',
          unit: 'BPM', placeholder: 'e.g. 70 — try for a higher number next session', placeholder_es: 'p. ej. 70 — intenta superarlo la próxima sesión' } },
      { id: 'm6w2-s2', text: 'Skip a downstroke while keeping the wrist in motion',
        text_es: 'Saltarse un golpe hacia abajo manteniendo la muñeca en movimiento',
        gotItWhen: 'on the "skipped" strum in the pattern, your wrist still travels down — only the pick doesn\'t touch the strings. A quick phone video (or a mirror) shows the motion clearly.',
        gotItWhen_es: 'en el rasgueo "saltado" del patrón, tu muñeca sigue bajando — solo la púa no toca las cuerdas. Un video rápido del teléfono (o un espejo) muestra el movimiento claramente.',
        practice: { type: 'mc', prompt: 'When you "skip" a strum in the D-DU-UDU pattern, what does your wrist do?',
          prompt_es: 'Cuando te "saltas" un rasgueo en el patrón D-DU-UDU, ¿qué hace tu muñeca?',
          choices: ['Stops completely', 'Keeps moving in the pendulum — the pick just misses the strings', 'Lifts up away from the guitar', 'Locks for a beat'],
          choices_es: ['Se detiene por completo', 'Sigue moviéndose en el péndulo — la púa solo falla las cuerdas', 'Se levanta lejos de la guitarra', 'Se bloquea por un tiempo'], answer: 1,
          explain: 'A skipped strum is a miss on purpose — the wrist keeps its full swing and the pick simply travels past the strings without touching them. Stopping the hand would throw off every strum after it.',
          explain_es: 'Un rasgueo saltado es una falla a propósito — la muñeca mantiene todo su balanceo y la púa simplemente pasa junto a las cuerdas sin tocarlas. Detener la mano descuadraría todos los rasgueos que vienen después.' } },
      { id: 'm6w2-s3', text: 'Accent beats 2 and 4 (the "backbeat")',
        text_es: 'Acentuar los tiempos 2 y 4 (el "contratiempo")',
        gotItWhen: 'when you strum the pattern, beats 2 and 4 are noticeably louder than 1 and 3 — and the song starts to feel like it has a built-in drumbeat.',
        gotItWhen_es: 'cuando rasgueas el patrón, los tiempos 2 y 4 suenan notablemente más fuertes que el 1 y el 3 — y la canción empieza a sentirse como si tuviera un ritmo de batería incorporado.',
        practice: { type: 'playSeq', label: 'Hear the backbeat — louder hits on 2 and 4', label_es: 'Escucha el contratiempo — golpes más fuertes en el 2 y el 4', bpm: 70,
          notes: [40, 47, 40, 47] } },
      { id: 'm6w2-s4', text: 'Keep the D-DU-UDU pattern going through a chord change',
        text_es: 'Mantener el patrón D-DU-UDU a través de un cambio de acorde',
        gotItWhen: 'when you switch from G to D (or any two chords) the pattern doesn\'t change at all — only the chord underneath does.',
        gotItWhen_es: 'cuando cambias de G a D (o cualquier par de acordes) el patrón no cambia en absoluto — solo cambia el acorde debajo.',
        practice: { type: 'pr', prompt: '<ol><li>One minute: strum D-DU-UDU over G ↔ D, changing chords every bar.</li><li>Count the changes where the pattern never broke.</li><li>Log your best.</li></ol>',
          prompt_es: '<ol><li>Un minuto: rasguea D-DU-UDU sobre G ↔ D, cambiando de acorde cada compás.</li><li>Cuenta los cambios donde el patrón nunca se rompió.</li><li>Anota tu mejor número.</li></ol>',
          unit: 'count', placeholder: 'e.g. 12 changes — try for a higher number', placeholder_es: 'p. ej. 12 cambios — intenta superarlo' } },
      { id: 'm6w2-s5', text: 'Apply the D-DU-UDU pattern to a verse of a real song',
        text_es: 'Aplicar el patrón D-DU-UDU a la estrofa de una canción real',
        gotItWhen: 'you can play the verse of "I\'m Yours" or "Oye Mi Amor" with the D-DU-UDU pattern from start to finish — even if a chord is imperfect, the pattern holds.',
        gotItWhen_es: 'puedes tocar la estrofa de "I\'m Yours" u "Oye Mi Amor" con el patrón D-DU-UDU de principio a fin — incluso si un acorde no sale perfecto, el patrón se mantiene.',
        practice: { type: 'playSeq', label: '"I\'m Yours" verse roots (G · D · Em · C)', label_es: 'Raíces de la estrofa de "I\'m Yours" (G · D · Em · C)', bpm: 70,
          notes: [43, 50, 40, 48] } },
      { id: 'm6w2-s6', text: 'Read a strum-pattern chart (D/U arrows or symbols)',
        text_es: 'Leer un diagrama de patrón de rasgueo (flechas o símbolos D/U)',
        gotItWhen: 'you can look at a written-out strum pattern (e.g., "↓ ↓↑ ↑↓↑") and play it correctly the first time, without someone demonstrating it.',
        gotItWhen_es: 'puedes mirar un patrón de rasgueo escrito (p. ej., "↓ ↓↑ ↑↓↑") y tocarlo correctamente la primera vez, sin que alguien lo demuestre.',
        practice: { type: 'mc', prompt: 'In strum notation, what does the symbol "↑" mean?',
          prompt_es: 'En la notación de rasgueo, ¿qué significa el símbolo "↑"?',
          choices: ['Strum up (toward the ceiling, away from the floor)', 'Strum down', 'Mute the strings', 'Hold the chord'],
          choices_es: ['Rasguear hacia arriba (hacia el techo, lejos del suelo)', 'Rasguear hacia abajo', 'Silenciar las cuerdas', 'Sostener el acorde'], answer: 0,
          explain: 'The arrow points the way your hand travels: "↑" is an upstroke, moving from the thin strings toward the thick ones. "↓" is a downstroke, the other direction.',
          explain_es: 'La flecha apunta hacia donde viaja tu mano: "↑" es un rasgueo hacia arriba, moviéndose de las cuerdas delgadas hacia las gruesas. "↓" es un rasgueo hacia abajo, en la otra dirección.' } }
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
    subtitle: 'Multiple strum patterns · Folk, rock, reggae styles · Choosing the right groove',
    subtitle_es: 'Varios patrones de rasgueo · Estilos folk, rock, reggae · Elegir el groove correcto',
    skillFocus: 'Playing different strum styles · Matching a pattern to the song · Switching patterns mid-song',
    skillFocus_es: 'Tocar distintos estilos de rasgueo · Ajustar un patrón a la canción · Cambiar de patrón a mitad de la canción',
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
            label: 'Watch: any-pattern exercise (JustinGuitar)', label_es: 'Mira: ejercicio de patrones (JustinGuitar)',
            text: 'Watch: <a href="https://youtu.be/CjM5fyXoV8w" target="_blank">Learn ANY Strumming Pattern with this Exercise – JustinGuitar</a> (0:00–4:00). Your task while you watch: pick ONE pattern he shows and tap it on your leg until you can keep it going without looking.',
            text_es: 'Mira: <a href="https://youtu.be/CjM5fyXoV8w" target="_blank">Learn ANY Strumming Pattern with this Exercise – JustinGuitar</a> (0:00–4:00). Tu tarea mientras miras: elige UN patrón de los que muestra y márcalo en tu pierna hasta que puedas mantenerlo sin mirar.',
            hint: 'Notice how each pattern Justin demonstrates has a different feel — folk feels gentle, rock feels driving, reggae feels bouncy. The pattern is the GENRE in many cases.',
            hint_es: 'Fíjate en cómo cada patrón que Justin demuestra tiene una sensación distinta — el folk se siente suave, el rock se siente impulsor, el reggae se siente rebotante. El patrón ES el género en muchos casos.',
            skills: [1, 2, 3],
            response: { type: 'mc', prompt: 'Which strum-pattern feature most defines REGGAE rhythm?',
              prompt_es: '¿Qué característica del patrón de rasgueo define más al ritmo de REGGAE?',
              answer: 1,
              explain: 'Reggae lives on the offbeat — crisp upstrokes on the "+" of each beat while the downbeats stay empty. That offbeat chop — reggae players call it the "skank" — is what makes reggae sound like reggae.',
              explain_es: 'El reggae vive en el contratiempo — golpes hacia arriba nítidos en el "+" de cada tiempo mientras los tiempos fuertes quedan vacíos. Ese "picoteo" en el contratiempo — los músicos de reggae lo llaman "skank" — es lo que hace que el reggae suene a reggae.',
              choices: [
              'Loud downstrokes on beat 1',
              'Upstrokes on the "+" (and) of each beat, with the downstrokes skipped',
              'Strumming only on beat 4',
              'Fast, constant 16th-note strumming throughout'
            ],
              choices_es: [
              'Golpes fuertes hacia abajo en el tiempo 1',
              'Golpes hacia arriba en el "+" (y) de cada tiempo, saltándose los golpes hacia abajo',
              'Rasguear solo en el tiempo 4',
              'Rasgueo rápido y constante de semicorcheas todo el tiempo'
            ] }
          },
          {
            label: 'Watch: strumming exercise (Andy Guitar)', label_es: 'Mira: ejercicio de rasgueo (Andy Guitar)',
            text: 'Watch: <a href="https://youtu.be/vMt8T5Jqf10?t=39" target="_blank">Best Strumming Exercise For Beginners and Improvers – Andy Guitar</a> — a different teacher\'s method for building ANY pattern. Strum along with his exercise in real time, and notice how his approach differs from Justin\'s in the first video.',
            text_es: 'Mira: <a href="https://youtu.be/vMt8T5Jqf10?t=39" target="_blank">Best Strumming Exercise For Beginners and Improvers – Andy Guitar</a> — el método de un maestro distinto para construir CUALQUIER patrón. Rasguea junto con su ejercicio en tiempo real, y fíjate en cómo su enfoque difiere del de Justin en el primer video.',
            hint: 'There is no single "correct" pattern for a song — listen to the original recording and feel which fits. Andy\'s exercise builds the control to play whichever one you choose.',
            hint_es: 'No hay un único patrón "correcto" para una canción — escucha la grabación original y siente cuál encaja. El ejercicio de Andy construye el control para tocar el que elijas.',
            skills: [4, 5],
            response: { type: 'short', placeholder: 'Pick a song you like. Describe the strum pattern in your own words — is it gentle, driving, choppy? What gives it that feel?',
              placeholder_es: 'Elige una canción que te guste. Describe el patrón de rasgueo con tus propias palabras — ¿es suave, impulsor, entrecortado? ¿Qué le da esa sensación?' }
          }
            ]
          },
          {
            title: 'Compare reggae and rock feels',
            title_es: 'Compara las sensaciones de reggae y rock',
            steps: [
          {
            label: 'Compare: reggae vs. rock', label_es: 'Compara: reggae vs. rock',
            text: 'Compare two recordings: "Three Little Birds" (Bob Marley — reggae) and "Bad Moon Rising" (CCR — rock). Same speed-ish, very different feel. What makes the difference?',
            text_es: 'Compara dos grabaciones: "Three Little Birds" (Bob Marley — reggae) y "Bad Moon Rising" (CCR — rock). Velocidad parecida, sensación muy distinta. ¿Qué hace la diferencia?',
            hint: 'It\'s almost entirely the strum pattern. Reggae emphasizes the offbeats (the "+"); rock emphasizes the downbeats (the numbers).',
            hint_es: 'Es casi por completo el patrón de rasgueo. El reggae enfatiza los contratiempos (el "+"); el rock enfatiza los tiempos fuertes (los números).',
            skills: [2, 3],
            response: { type: 'short', placeholder: 'In one sentence: what is the biggest difference between the reggae strum and the rock strum?',
              placeholder_es: 'En una oración: ¿cuál es la mayor diferencia entre el rasgueo de reggae y el de rock?' }
          }
            ]
          },
          {
            title: 'Refresh the C chord',
            title_es: 'Repasa el acorde C',
            steps: [
          {
            label: 'Refresh the C chord', label_es: 'Repasa el acorde C',
            text: 'The progressions today lean on <strong>C</strong> — your shape from Module 5, back again. Form it from the diagram and strum the top five strings (the low E is muted) until it rings clean.',
            text_es: 'Las progresiones de hoy se apoyan en <strong>C</strong> — tu forma del Módulo 5, de vuelta. Fórmala a partir del diagrama y rasguea las cinco cuerdas más agudas (la Mi grave está silenciada) hasta que suene limpio.',
            hint: 'C skips the lowest string (the X on string 6). Your ring finger reaches to the 3rd fret of the A string — a big stretch at first.',
            hint_es: 'C se salta la cuerda más grave (la X en la cuerda 6). Tu dedo anular se estira hasta el traste 3 de la cuerda La — un gran estiramiento al principio.',
            chords: [
              { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
          {
            label: 'Station wrap-up', label_es: 'Cierre de la estación',
            text: 'Station Wrap-Up — pause and think: of the three feels you tried — folk, rock, reggae — which was hardest to make sound convincing on your guitar, and what gave it away as "not quite right"?',
            text_es: 'Cierre de la estación — pausa y piensa: de las tres sensaciones que probaste — folk, rock, reggae — ¿cuál fue la más difícil de hacer sonar convincente en tu guitarra, y qué la delataba como "no del todo correcta"?',
            response: { type: 'short', placeholder: 'e.g. reggae — my offbeat upstrokes were too heavy, so it sounded like rock with gaps',
              placeholder_es: 'p. ej. reggae — mis golpes hacia arriba en el contratiempo eran demasiado pesados, así que sonaba como rock con huecos' }
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
            title: 'Warm-up — tune + a quick pass through all three feels (recall)',
            title_es: 'Calentamiento — afina y repasa rápido las tres sensaciones (repaso)',
            steps: [
              {
                label: 'Warm-up: all three feels', label_es: 'Calentamiento: las tres sensaciones',
                text: 'Tune to green, then on a G chord play 2 bars each of:<ol><li>Steady down-up (folk).</li><li>Heavy down-up (rock).</li><li>Up-only on the "+" (reggae).</li></ol>You\'ve got it when: in tune and your hand remembers all three feels before you refine them.',
                text_es: 'Afina hasta que esté en verde, y luego con un acorde G toca 2 compases de cada uno:<ol><li>Abajo-arriba constante (folk).</li><li>Abajo-arriba pesado (rock).</li><li>Solo arriba en el "+" (reggae).</li></ol>Lo tienes cuando: estás afinado y tu mano recuerda las tres sensaciones antes de refinarlas.',
                hint: 'A quick 60-second pass through all three styles wakes up the patterns you\'ll polish this set.',
                hint_es: 'Un repaso rápido de 60 segundos por los tres estilos despierta los patrones que vas a pulir en esta unidad.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Play a folk feel',
            title_es: 'Toca una sensación folk',
            steps: [
          {
            label: 'Challenge 1 — Folk Feel', label_es: 'Reto 1 — Sensación folk',
            text: '<ol><li>Hold G.</li><li>Strum all downstrokes, one per beat, at 70 BPM — quiet and steady, singalong style.</li></ol>You\'ve got it when: even, soft, supportive strumming with no accents sticking out.<div class="strum-line">D       D       D       D\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            text_es: '<ol><li>Sostén G.</li><li>Rasguea todo hacia abajo, uno por tiempo, a 70 BPM — tranquilo y constante, estilo para cantar junto.</li></ol>Lo tienes cuando: un rasgueo parejo, suave, que acompaña, sin acentos que sobresalgan.<div class="strum-line">D       D       D       D\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            hint: 'Folk here means a FEEL, not one particular pattern — it\'s about supporting the singer instead of standing out. Soft attack, even volume, no accents. Module 5\'s "folk strum" (D · D U · U D U) played gently counts as a folk feel too; these steady downstrokes are just the plainest version of it.',
            hint_es: 'Folk aquí significa una SENSACIÓN, no un patrón concreto — se trata de acompañar al cantante en vez de sobresalir. Ataque suave, volumen parejo, sin acentos. El "rasgueo folk" del Módulo 5 (D · D U · U D U) tocado con suavidad también cuenta como sensación folk; estos golpes hacia abajo constantes son solo su versión más simple.',
            stuck: 'Strum from the wrist only and let the pick barely graze the strings — imagine someone is singing and you must not cover them up.',
            stuck_es: 'Rasguea solo desde la muñeca y deja que la púa apenas roce las cuerdas — imagina que alguien está cantando y no debes taparlo.',
            levelUp: 'Add a gentle up-strum on the "+" of beats 2 and 4 for a fuller singalong feel.',
            levelUp_es: 'Agrega un golpe suave hacia arriba en el "+" de los tiempos 2 y 4 para una sensación más completa de canto en grupo.',
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
            text: '<ol><li>Hold the same G at the same tempo.</li><li>Strum harder into the strings — heavy down-up-down-up, accenting every down.</li></ol>You\'ve got it when: a thick, driving sound using arm weight, not just wrist.<div class="strum-line">D   U   D   U   D   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            text_es: '<ol><li>Sostén el mismo G al mismo tempo.</li><li>Rasguea más fuerte hacia las cuerdas — abajo-arriba-abajo-arriba pesado, acentuando cada golpe hacia abajo.</li></ol>Lo tienes cuando: un sonido grueso e impulsor usando el peso del brazo, no solo la muñeca.<div class="strum-line">D   U   D   U   D   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            hint: 'Rock strumming uses arm weight more than wrist. Let the pick go deeper into the strings. Aim for a thick, heavy sound.',
            hint_es: 'El rasgueo de rock usa el peso del brazo más que la muñeca. Deja que la púa se hunda más en las cuerdas. Apunta a un sonido grueso y pesado.',
            stuck: 'Strum from the elbow, not just the wrist — rock needs weight. Keep the accents on the downs and let the ups stay light.',
            stuck_es: 'Rasguea desde el codo, no solo desde la muñeca — el rock necesita peso. Mantén los acentos en los golpes hacia abajo y deja los golpes hacia arriba ligeros.',
            levelUp: 'Push to 90 BPM, or palm-mute the low strings — rest the side of your strumming hand on them — for a tighter chug (a short, muted, punchy strum).',
            levelUp_es: 'Sube a 90 BPM, o silencia con la palma las cuerdas graves — apoya el borde de tu mano de rasgueo sobre ellas — para un chug (un rasgueo corto, silenciado y contundente) más ajustado.',
            skills: [2, 4]
          }
            ]
          },
          {
            title: 'Play a reggae strum',
            title_es: 'Toca un rasgueo reggae',
            steps: [
          {
            label: 'Challenge 3 — Reggae Chop (try it!)', label_es: 'Reto 3 — Picoteo reggae (¡pruébalo!)',
            text: 'A reggae chop is a short, quick, muted upstroke.<ol><li>Hold G.</li><li>Skip every downbeat, and strum UP only on each "+" — rest-up-rest-up.</li></ol>No score — play along with "Three Little Birds" to lock in the offbeat feel.<div class="strum-line">·   U   ·   U   ·   U   ·   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            text_es: 'Un picoteo reggae es un golpe hacia arriba corto, rápido y silenciado.<ol><li>Sostén G.</li><li>Sáltate cada tiempo fuerte, y rasguea hacia ARRIBA solo en cada "+" — silencio-arriba-silencio-arriba.</li></ol>Sin puntaje — toca junto con "Three Little Birds" para afianzar la sensación de contratiempo.<div class="strum-line">·   U   ·   U   ·   U   ·   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            hint: 'Counter-intuitive at first — your hand goes down on the beats but doesn\'t hit the strings. Listen to "Three Little Birds" while you do this to lock in the feel.',
            hint_es: 'Contraintuitivo al principio — tu mano baja en los tiempos pero no toca las cuerdas. Escucha "Three Little Birds" mientras haces esto para afianzar la sensación.',
            stuck: 'Keep your hand swinging down on every number, but lift the pick away so it only catches the strings on the way back up. Count "rest-UP-rest-UP" out loud.',
            stuck_es: 'Mantén tu mano bajando en cada número, pero levanta la púa para que solo enganche las cuerdas en el camino de vuelta hacia arriba. Cuenta "silencio-ARRIBA-silencio-ARRIBA" en voz alta.',
            levelUp: 'Mute with your fretting hand right after each up-strum for the crisp, clipped "chk" of a real reggae chop.',
            levelUp_es: 'Silencia con tu mano de trastear justo después de cada golpe hacia arriba para lograr el "chk" nítido y cortado de un verdadero picoteo reggae.',
            skills: [3, 4],
            playSeq: { label: 'Hear the backing root — chop your offbeat over it', label_es: 'Escucha la raíz de fondo — pica tu contratiempo sobre ella', bpm: 70, notes: [55, 55, 55, 55] }
          }
            ]
          },
          {
            title: 'Switch the feel mid-song (your assessment piece)',
            title_es: 'Cambia la sensación a mitad de la canción (tu pieza de evaluación)',
            steps: [
          {
            label: 'Challenge 4 — Two Feels, One Song (your assessment piece)', label_es: 'Reto 4 — Dos sensaciones, una canción (tu pieza de evaluación)',
            text: '<ol><li>Take G–D–Em–C and play 8 bars folk, then switch to rock for 8 bars — same chords, two clearly different feels, no break at the switch.</li><li>Set the ⏱ Timer for 3 minutes and loop it.</li></ol>',
            text_es: '<ol><li>Toma G–D–Em–C y toca 8 compases estilo folk, y luego cambia a rock durante 8 compases — mismos acordes, dos sensaciones claramente distintas, sin interrupción en el cambio.</li><li>Pon el ⏱ Temporizador en 3 minutos y repítelo.</li></ol>',
            hint: 'The switch is the skill. Change the feel on the downbeat of a new bar so the transition lands cleanly.',
            hint_es: 'El cambio es la destreza. Cambia la sensación en el tiempo fuerte de un compás nuevo para que la transición caiga limpia.',
            stuck: 'Keep the chords and tempo identical — change ONLY your strum hand. Drill just the 2-bar seam where folk becomes rock until it\'s smooth.',
            stuck_es: 'Mantén los acordes y el tempo idénticos — cambia SOLO tu mano de rasgueo. Practica solo la costura de 2 compases donde el folk se vuelve rock hasta que salga fluido.',
            levelUp: 'Add reggae as a third 8-bar section, or switch feels every 4 bars instead of every 8.',
            levelUp_es: 'Agrega el reggae como una tercera sección de 8 compases, o cambia de sensación cada 4 compases en lugar de cada 8.',
            skills: [5, 6],
            response: { type: 'short', prompt: 'Which two feels did you switch between, and on which song would you use them?', prompt_es: '¿Entre qué dos sensaciones cambiaste, y en qué canción las usarías?', placeholder: 'e.g. folk verse → rock chorus on "Bad Moon Rising"', placeholder_es: 'p. ej. estrofa folk → coro rock en "Bad Moon Rising"' },
            playSeq: { label: 'G · D · Em · C progression (try each feel)', label_es: 'Progresión G · D · Em · C (prueba cada sensación)', bpm: 70, notes: [43, 50, 40, 48] }
          }
            ]
          },
          {
            title: 'Solo over the groove with Pentatonic Pattern 1',
            title_es: 'Improvisa sobre el groove con el Patrón Pentatónico 1',
            steps: [
          {
            label: 'Challenge 5 — Trade Off: Strum, Then Solo (try it!)', label_es: 'Reto 5 — Túrnate: rasgueo y solo (¡pruébalo!)',
            text: '<ol><li>Loop the backing roots below — or record yourself strumming 8 bars of a progression (try Am–G–C or G–D–Em–C) with any pattern from this module.</li><li>Solo over it using Pentatonic Pattern 1 from Module 4.</li><li>Take turns with yourself every 8 bars: strum one pass, then solo over the next.</li></ol>No score — aim for one clear musical idea, not a flurry of notes.',
            text_es: '<ol><li>Repite las raíces de fondo de abajo — o grábate rasgueando 8 compases de una progresión (prueba Am–G–C o G–D–Em–C) con cualquier patrón de este módulo.</li><li>Improvisa sobre ella usando el Patrón Pentatónico 1 del Módulo 4.</li><li>Túrnate contigo mismo cada 8 compases: rasguea un pase, y luego improvisa en el siguiente.</li></ol>Sin puntaje — apunta a una idea musical clara, no a una ráfaga de notas.',
            hint: 'Am–G–C fits A minor pentatonic; a major-key progression fits major pentatonic. This is the reward: the scale you learned in Module 4 lives on top of the chords you strum here. Leave space — silence is part of a solo. Got another guitarist around? One strums, one solos, swap after 8 bars.',
            hint_es: 'Am–G–C encaja con la pentatónica menor de A; una progresión en tono mayor encaja con la pentatónica mayor. Esta es la recompensa: la escala que aprendiste en el Módulo 4 vive encima de los acordes que rasgueas aquí. Deja espacio — el silencio es parte de un solo. ¿Tienes a otro guitarrista cerca? Uno rasguea, uno improvisa, cambien después de 8 compases.',
            playSeq: { label: 'Backing roots — Am · G · C', label_es: 'Raíces de fondo — Am · G · C', bpm: 70, notes: [45, 43, 48] }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Watchtower", two ways', label_es: 'Reto — "Watchtower", de dos formas',
                text: '<ol><li>Play Am · G · F · G with a soft folk strum for 8 bars.</li><li>Then play the same loop rock-style — strum harder, accent the downs — for 8 bars, no break at the switch.</li></ol>You\'ve got it when: on a quick recording of yourself you can hear the exact bar the feel changed — Dylan\'s version becoming Hendrix\'s, live from your chair. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: five layers deep and still growing</a>.',
                text_es: '<ol><li>Toca Am · G · F · G con un rasgueo folk suave durante 8 compases.</li><li>Luego toca el mismo loop estilo rock — rasguea más fuerte, acentúa los golpes hacia abajo — durante 8 compases, sin interrupción en el cambio.</li></ol>Lo tienes cuando: en una grabación rápida de ti mismo puedes escuchar el compás exacto donde cambió la sensación — la versión de Dylan volviéndose la de Hendrix, en vivo desde tu silla. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: cinco capas de profundidad y sigue creciendo</a>.',
                hint: 'You heard exactly this in Module 1 — acoustic Dylan vs. electric Hendrix. Same chords, same tempo; ONLY your strum hand changes.',
                hint_es: 'Escuchaste exactamente esto en el Módulo 1 — Dylan acústico vs. Hendrix eléctrico. Mismos acordes, mismo tempo; SOLO tu mano de rasgueo cambia.',
                stuck: 'Make the switch on beat 1 of a new bar and drill just the 2-bar seam where folk becomes rock.',
                stuck_es: 'Haz el cambio en el tiempo 1 de un compás nuevo y practica solo la costura de 2 compases donde el folk se vuelve rock.',
                levelUp: 'Add the reggae chop as a third 8-bar section — three eras of the same song.',
                levelUp_es: 'Agrega el picoteo reggae como una tercera sección de 8 compases — tres épocas de la misma canción.',
                skills: [5, 6],
                response: { type: 'short', prompt: 'Which feel suited "Watchtower" better to your ear — folk or rock — and why?', prompt_es: '¿Qué sensación le quedó mejor a "Watchtower" para tu oído — folk o rock — y por qué?', placeholder: 'e.g. rock — the accents make the loop feel dangerous', placeholder_es: 'p. ej. rock — los acentos hacen que el loop se sienta peligroso' }
              },
              {
                label: 'Challenge — "Three Little Birds", reggae chop', label_es: 'Reto — "Three Little Birds", picoteo reggae',
                text: '<ul><li>Play A · D · E with up-strums only on the "+", one bar each at 70 BPM.</li></ul>You\'ve got it when: two laps where every hit is an offbeat — then play along with the record and disappear into it.',
                text_es: '<ul><li>Toca A · D · E con golpes hacia arriba solo en el "+", un compás cada uno a 70 BPM.</li></ul>Lo tienes cuando: dos vueltas donde cada golpe es un contratiempo — y luego toca junto con la grabación y piérdete en ella.',
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

    assessment: {
      goal: 'Plays folk, rock, and reggae strum styles on demand · Switches between two patterns mid-song · Chooses a pattern that fits a song\'s style · Applies pattern to a full chord progression',
      goal_es: 'Toca los estilos de rasgueo folk, rock y reggae a pedido · Cambia entre dos patrones a mitad de la canción · Elige un patrón que se ajuste al estilo de una canción · Aplica un patrón a una progresión de acordes completa',
      performance: 'Solo: pick one song and one strum style (folk, rock, or reggae). Play 8 bars with that pattern. Then switch to a different style for the next 8 bars. Same chords, two feels.',
      selfCheck: 'Can you play the same chord progression three different ways (folk, rock, reggae) and have them actually sound different? Can you pick the right pattern for a new song by ear?',
      selfCheck_es: '¿Puedes tocar la misma progresión de acordes de tres formas distintas (folk, rock, reggae) y que en verdad suenen diferentes? ¿Puedes elegir de oído el patrón correcto para una canción nueva?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a', 'Re.7a']
    },

    skills: [
      { id: 'm6w3-s1', text: 'Play a folk FEEL — gentle, even downstrokes that sit under a singer (a touch, not a particular pattern)',
        text_es: 'Tocar una SENSACIÓN folk — golpes hacia abajo suaves y parejos que se quedan debajo del cantante (un toque, no un patrón concreto)',
        gotItWhen: 'you can play a chord progression with even, soft downstrokes that supports a singer — no accents, no aggressive attack.',
        gotItWhen_es: 'puedes tocar una progresión de acordes con golpes hacia abajo parejos y suaves que acompañan a un cantante — sin acentos, sin ataque agresivo.',
        practice: { type: 'playSeq', label: 'Folk feel — soft, even strums (G root, one per beat)', label_es: 'Sensación folk — rasgueos suaves y parejos (raíz de G, uno por tiempo)', bpm: 70,
          notes: [43, 43, 43, 43, 43, 43, 43, 43] } },
      { id: 'm6w3-s2', text: 'Play a rock strum (heavy downstrokes with accent and weight)',
        text_es: 'Tocar un rasgueo rock (golpes hacia abajo pesados con acento y peso)',
        gotItWhen: 'your rock strum has clear weight and drive — play back a quick recording and you can hear that you mean it.',
        gotItWhen_es: 'tu rasgueo de rock tiene peso e impulso claros — reproduce una grabación rápida y puedes escuchar que lo dices en serio.',
        practice: { type: 'mc', prompt: 'What actually gives a rock strum its weight?',
          prompt_es: '¿Qué le da en realidad su peso a un rasgueo de rock?',
          choices: ['Accented downstrokes driven from the elbow, digging a little deeper into the strings', 'Strumming as fast as possible', 'Squeezing the chord harder with the fretting hand', 'Only strumming on beat 1'],
          choices_es: ['Golpes hacia abajo acentuados impulsados desde el codo, entrando un poco más profundo en las cuerdas', 'Rasguear lo más rápido posible', 'Apretar el acorde más fuerte con la mano de trastear', 'Rasguear solo en el tiempo 1'], answer: 0,
          explain: 'Weight comes from arm weight behind the picking hand\'s attack, not from speed or fret-hand squeezing. Strum from the elbow, dig in on the accents, and let the other strums stay lighter.',
          explain_es: 'El peso viene del peso del brazo detrás del ataque de la mano de pulsar, no de la velocidad ni de apretar con la mano de trastear. Rasguea desde el codo, entra con fuerza en los acentos, y deja los demás rasgueos más ligeros.' } },
      { id: 'm6w3-s3', text: 'Play a reggae strum (upstrokes on the "+", downstrokes skipped)',
        text_es: 'Tocar un rasgueo reggae (golpes hacia arriba en el "+", golpes hacia abajo omitidos)',
        gotItWhen: 'you can play a reggae chop where ONLY the upstrokes hit the strings — your hand still moves on the beats, but the pick misses on purpose.',
        gotItWhen_es: 'puedes tocar un picoteo reggae donde SOLO los golpes hacia arriba tocan las cuerdas — tu mano sigue moviéndose en los tiempos, pero la púa falla a propósito.',
        practice: { type: 'mc', prompt: 'In a reggae offbeat strum, the strings are hit on which counts?',
          prompt_es: 'En un rasgueo de contratiempo reggae, ¿en cuáles tiempos se tocan las cuerdas?',
          choices: ['1, 2, 3, 4 (the numbers)', 'The "+" of each beat (between numbers)', 'Only beat 1', 'Continuously'],
          choices_es: ['1, 2, 3, 4 (los números)', 'El "+" de cada tiempo (entre números)', 'Solo el tiempo 1', 'Continuamente'], answer: 1,
          explain: 'Reggae leaves the numbered beats empty and chops only on the "+" between them. Hitting the numbers instead gives you an ordinary strum — the offbeat is the whole sound.',
          explain_es: 'El reggae deja vacíos los tiempos numerados y solo golpea en el "+" entre ellos. Tocar en los números te da un rasgueo común y corriente — el contratiempo es todo el sonido.' } },
      { id: 'm6w3-s4', text: 'Choose a strum pattern that matches a song\'s style',
        text_es: 'Elegir un patrón de rasgueo que se ajuste al estilo de una canción',
        gotItWhen: 'you can put on any new song, listen for 15 seconds, and pick a strum pattern that fits — without a tutorial telling you what to play.',
        gotItWhen_es: 'puedes poner cualquier canción nueva, escuchar 15 segundos, y elegir un patrón de rasgueo que encaje — sin que un tutorial te diga qué tocar.',
        practice: { type: 'mc', prompt: 'You hear a song with a slow, gentle, acoustic feel and a singer-songwriter vibe. Which strum suits it best?',
          prompt_es: 'Escuchas una canción con una sensación lenta, suave, acústica y un aire de cantautor. ¿Qué rasgueo le queda mejor?',
          choices: ['Heavy rock chops on every downstroke', 'Reggae offbeat upstrokes', 'Gentle folk strum (soft down-up)', 'No strum at all'],
          choices_es: ['Golpes pesados de rock en cada golpe hacia abajo', 'Golpes hacia arriba de contratiempo reggae', 'Rasgueo folk suave (abajo-arriba suave)', 'Sin rasgueo alguno'], answer: 2,
          explain: 'Match the strum to the energy of the song: a soft, slow song wants a gentle folk strum that sits under the singer. Rock chops or a reggae offbeat would fight the mood.',
          explain_es: 'Ajusta el rasgueo a la energía de la canción: una canción suave y lenta pide un rasgueo folk suave que se quede debajo del cantante. Los golpes de rock o el contratiempo reggae chocarían con el ambiente.' } },
      { id: 'm6w3-s5', text: 'Switch strum patterns mid-song (e.g., verse vs. chorus)',
        text_es: 'Cambiar de patrón de rasgueo a mitad de la canción (p. ej., estrofa vs. coro)',
        gotItWhen: 'you can play 8 bars of one pattern, then switch cleanly to a different pattern for the next 8 bars — without losing the beat at the transition.',
        gotItWhen_es: 'puedes tocar 8 compases de un patrón, y luego cambiar limpiamente a un patrón distinto durante los siguientes 8 compases — sin perder el tiempo en la transición.',
        practice: { type: 'pr', prompt: '<ol><li>Play 4 bars of one pattern, then switch to a different pattern for 4 bars, back and forth.</li><li>Count the switches where you never lost the beat.</li><li>Log your best streak.</li></ol>',
          prompt_es: '<ol><li>Toca 4 compases de un patrón, y luego cambia a un patrón distinto durante 4 compases, ida y vuelta.</li><li>Cuenta los cambios donde nunca perdiste el tiempo.</li><li>Anota tu mejor racha.</li></ol>',
          unit: 'count', placeholder: 'e.g. 6 switches — try for a longer streak', placeholder_es: 'p. ej. 6 cambios — intenta una racha más larga' } },
      { id: 'm6w3-s6', text: 'Play 2+ different patterns over the same chord progression',
        text_es: 'Tocar 2 o más patrones distintos sobre la misma progresión de acordes',
        gotItWhen: 'you can take G–D–Em–C and play it two different ways (e.g., folk then rock) and the two versions actually sound like different songs.',
        gotItWhen_es: 'puedes tomar G–D–Em–C y tocarlo de dos formas distintas (p. ej., folk y luego rock) y las dos versiones en verdad suenan como canciones diferentes.',
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
      { name: '"Happy Birthday"', meta: 'C–F–C–G–C · waltz strum in 3 (D · D · D, strong beat 1)', meta_es: 'C–F–C–G–C · rasgueo de vals en 3 (D · D · D, tiempo 1 fuerte)', type: 'Focus', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w&start=46' },
      { name: '"I\'m Yours" — Jason Mraz', meta: 'G–D–Em–C · iconic D-DU-UDU strum', meta_es: 'G–D–Em–C · rasgueo icónico D-DU-UDU', type: 'Focus', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=EkHTsc9PU2A',
        tutorialUrl: 'https://www.youtube.com/watch?v=6ugeJWAMz6w' },
      { name: '"Three Little Birds" — Bob Marley', meta: 'A–D–E · classic reggae offbeat strum', meta_es: 'A–D–E · rasgueo clásico de contratiempo reggae', type: 'Focus', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=HNBCVM4KbUM',
        tutorialUrl: 'https://www.youtube.com/watch?v=61pk1YH9Lu0' },
      { name: '"Bad Moon Rising" — CCR', meta: 'D–A–G · driving rock-style strum', meta_es: 'D–A–G · rasgueo impulsor estilo rock', type: 'Focus', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=5BmEGm-mraE',
        tutorialUrl: 'https://www.youtube.com/watch?v=liBI2yT_fpw&start=84&end=251' },
      { name: '"Let It Be" — The Beatles', meta: 'C–G–Am–F · slow, even pattern', meta_es: 'C–G–Am–F · patrón lento y parejo', type: 'Core', core: true, journeyUrl: 'tabs/let-it-be.html',
        originalUrl: 'https://www.youtube.com/watch?v=CGj85pVzRJs',
        tutorialUrl: 'https://www.youtube.com/watch?v=gGt0akED_UU' },
      { name: '"Oye Mi Amor" — Maná', meta: 'Syncopated Latin strum on the verse · Bm (four-finger shape)–G', meta_es: 'Rasgueo latino sincopado en la estrofa · Bm (forma de cuatro dedos)–G', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=UlkG3DmZJEI',
        tutorialUrl: 'https://www.youtube.com/watch?v=F4BbTdP2v70' },
      { name: '"Tu Boda" — Oscar Maydon × Fuerza Regida', meta: 'Corrido / sierreño strum · current Spanish-language style', meta_es: 'Rasgueo de corrido / sierreño · estilo actual en español', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=_ymicn0_GYc',
        tutorialUrl: 'https://www.youtube.com/watch?v=AlElh28IumI' },
      { name: '"Wonderwall" — Oasis', meta: 'Em7–G–D–C · classic strum pattern with accents', meta_es: 'Em7–G–D–C · patrón de rasgueo clásico con acentos', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=6hzrDeceEKc',
        tutorialUrl: 'https://www.youtube.com/watch?v=5V81btmYxgE' },
      { name: '"Wagon Wheel" — Old Crow Medicine Show', meta: 'G–D–Em–C · folk strum classic', meta_es: 'G–D–Em–C · clásico rasgueo folk', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=1gX1EP6mG-E',
        tutorialUrl: 'https://www.youtube.com/watch?v=zx3Tv5uBAaE' },
      { name: '"Buffalo Soldier" — Bob Marley', meta: 'Bm–G–D–A · reggae offbeat practice', meta_es: 'Bm–G–D–A · práctica de contratiempo reggae', type: 'Choice', core: false, level: 2,
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
    'Loop G for 2 bars, then D for 2 bars, playing D-DU-UDU with the pattern staying identical through the change',
    'Take G–D–Em–C and play it two ways — folk, then rock — switching feel with no break at the seam'
  ],
  assessItems_es: [
    'Toca Em durante 4 compases, y luego Am durante 4 compases, con un rasgueo abajo-arriba sin interrupciones a 60 BPM',
    'Repite G durante 2 compases, y luego D durante 2 compases, tocando D-DU-UDU con el patrón idéntico a través del cambio',
    'Toma G–D–Em–C y tócalo de dos formas — folk, y luego rock — cambiando la sensación sin interrupción en la costura'
  ],
  forward: 'Module 7 is the <strong>barre-chord</strong> module — and every steady strum hand you just built is what carries you through it. The rhythm keeps going even while your fretting hand fights the hardest shapes in the course. The groove you own now is what makes a clamped, buzzy first barre still sound like music.',
  forward_es: 'El Módulo 7 es el módulo de <strong>acordes con cejilla</strong> — y cada mano de rasgueo estable que acabas de construir es lo que te lleva a través de él. El ritmo sigue adelante incluso mientras tu mano de trastear lucha con las formas más difíciles del curso. El groove que ahora dominas es lo que hace que una primera cejilla apretada y con zumbido siga sonando a música.',
  standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
};
