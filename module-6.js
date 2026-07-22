// ============================================================
//  MODULE 6 — Strumming Patterns with Chords
//  Edit this file to change Module 6 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm6w1',
    songThread: [{ name: 'All Along the Watchtower', journey: 'tabs/all-along-the-watchtower.html', note: 'your strumming patterns power this song' }],
    label: 'Set 1',
    locked: false,
    module: 'Strumming Patterns with Chords',
    moduleNum: 6,
    unit: 'Module 6 · Strumming Patterns with Chords',
    unit_es: 'Módulo 6 · Patrones de rasgueo con acordes',
    title: 'Set 1',
    subtitle: 'The down-up foundation · 8th-note pulse · Counting "1 + 2 + 3 + 4 +"',
    subtitle_es: 'La base abajo-arriba · Pulso de corcheas · Contar "1 + 2 + 3 + 4 +"',
    objective: 'I CAN play a steady down-up 8th-note strum pattern over open chords without losing the beat — playing it cleanly at 60 BPM, then trying 70.',
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
            text: 'Listen to "Brown Eyed Girl" by Van Morrison. Tap along on your leg — down with your hand on the numbers, up on the "ands". Can you feel the 8th-note pulse?',
            text_es: 'Escucha "Brown Eyed Girl" de Van Morrison. Sigue el ritmo con la mano en tu pierna — hacia abajo en los números, hacia arriba en los "y". ¿Puedes sentir el pulso de corcheas?',
            hint: 'You don\'t need a guitar yet. Just train your body to feel the steady pulse before you add the strings.',
            hint_es: 'Todavía no necesitas una guitarra. Solo entrena tu cuerpo para sentir el pulso constante antes de agregar las cuerdas.',
            skills: [3, 4],
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
            text: 'Challenge 1 — Pendulum Motion: mute the strings with your fretting hand and, at 60 BPM, strum just the down-up motion — down on each beat, up on each "+", counting aloud. You\'ve got it when: a free, even swing with no forearm tension — pure rhythm, no notes.<div class="strum-line">D   U   D   U   D   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            text_es: 'Reto 1 — Movimiento de péndulo: silencia las cuerdas con tu mano de trastear y, a 60 BPM, rasguea solo el movimiento abajo-arriba — abajo en cada tiempo, arriba en cada "+", contando en voz alta. Lo tienes cuando: un balanceo libre y parejo sin tensión en el antebrazo — puro ritmo, sin notas.<div class="strum-line">D   U   D   U   D   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
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
            text: 'Challenge 2 — Even Eighths on Em: fret Em and strum down-up at 60 BPM for 8 bars. You\'ve got it when: every strum even — same volume, same timing — with upstrokes brushing only the top 3–4 strings.',
            text_es: 'Reto 2 — Corcheas parejas en Em: trastea Em y rasguea abajo-arriba a 60 BPM durante 8 compases. Lo tienes cuando: cada rasgueo parejo — mismo volumen, mismo tiempo — con los golpes hacia arriba rozando solo las 3–4 cuerdas más agudas.',
            hint: 'It\'s normal for upstrokes to feel weaker at first. They should brush only the top 3–4 strings, not the whole chord.',
            hint_es: 'Es normal que los golpes hacia arriba se sientan más débiles al principio. Deben rozar solo las 3–4 cuerdas más agudas, no todo el acorde.',
            stuck: 'Lighten the pick on the way up so it grazes just the thin strings. If the chord buzzes, recheck your Em fingers before worrying about the strum.',
            stuck_es: 'Aligera la púa en el camino hacia arriba para que roce solo las cuerdas delgadas. Si el acorde zumba, revisa tus dedos de Em antes de preocuparte por el rasgueo.',
            levelUp: 'Speed up to 75 BPM, or hold the 8 bars without letting your eyes drop to your strumming hand.',
            levelUp_es: 'Acelera a 75 BPM, o sostén los 8 compases sin dejar que tus ojos bajen hacia tu mano de rasgueo.',
            skills: [2, 4],
            playSeq: { label: 'Hear the 8th-note pulse', label_es: 'Escucha el pulso de corcheas', bpm: 60, notes: [60, 60, 60, 60, 60, 60, 60, 60] },
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
            text: 'Challenge 3 — Em ↔ Am Switch (your assessment piece): switch Em ↔ Am every 2 bars while the down-up strum never stops. Set the ⏱ Timer for 3 minutes and loop it. You\'ve got it when: the strum hand keeps swinging right through every chord change — let the chord catch up.',
            text_es: 'Reto 3 — Cambio Em ↔ Am (tu pieza de evaluación): cambia entre Em ↔ Am cada 2 compases mientras el rasgueo abajo-arriba nunca se detiene. Pon el ⏱ Temporizador en 3 minutos y repítelo. Lo tienes cuando: la mano de rasgueo sigue balanceándose durante cada cambio de acorde — deja que el acorde te alcance.',
            hint: 'The #1 beginner mistake is stopping the strum to fix the chord. Keep the wrist moving — let the chord catch up.',
            hint_es: 'El error #1 de los principiantes es detener el rasgueo para arreglar el acorde. Mantén la muñeca en movimiento — deja que el acorde te alcance.',
            stuck: 'Park on a finger Em and Am share and pivot around it — don\'t lift every finger at once. Drop to 50 BPM so the change has room.',
            stuck_es: 'Quédate en un dedo que Em y Am comparten y pivota alrededor de él — no levantes todos los dedos a la vez. Baja a 50 BPM para que el cambio tenga espacio.',
            levelUp: 'Switch every bar instead of every 2 bars, or climb to 75 BPM with the strum still unbroken.',
            levelUp_es: 'Cambia cada compás en lugar de cada 2, o sube a 75 BPM con el rasgueo aún sin interrupciones.',
            skills: [4, 5, 6],
            response: { type: 'short', prompt: 'Personal record — strum unbroken through Em↔Am: play it cleanly at 60 BPM, then go +10 at a time. Your fastest CLEAN switch today (BPM)?', prompt_es: 'Récord personal — rasgueo sin interrupciones a través de Em↔Am: tócalo limpio a 60 BPM, y luego sube de 10 en 10. ¿Tu cambio LIMPIO más rápido hoy (BPM)?', placeholder: 'e.g. 80 — try for a higher number next time', placeholder_es: 'p. ej. 80 — intenta superarlo la próxima vez' },
            playSeq: { label: 'Em → Am roots (2 bars each)', label_es: 'Raíces Em → Am (2 compases cada una)', bpm: 60, notes: [40, 40, 45, 45] },
            chords: [
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
            text: 'Challenge — Half-Bar Switch, Non-Stop (2 chords): you just switched Em ↔ Am every two bars. Now do it every TWO BEATS — down-up strumming the whole time, changing on beats 1 and 3, at 60 BPM. The strum hand never pauses; the chord changes between strums. You\'ve got it when: four laps where the pendulum never stops and every change lands on the beat. Press &#x25B6; to hear the target.',
            text_es: 'Reto — Cambio de medio compás, sin parar (2 acordes): acabas de cambiar entre Em ↔ Am cada dos compases. Ahora hazlo cada DOS TIEMPOS — rasgueando abajo-arriba todo el tiempo, cambiando en los tiempos 1 y 3, a 60 BPM. La mano de rasgueo nunca pausa; el acorde cambia entre rasgueos. Lo tienes cuando: cuatro vueltas donde el péndulo nunca se detiene y cada cambio cae en el tiempo. Presiona &#x25B6; para escuchar el objetivo.',
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
            text: 'Challenge — Three-Chord Half-Bar (3 chords): add G (from Module 5). Loop Em · Am · G, two beats each, the strum never stopping, at 60 BPM. You\'ve got it when: two clean laps with the pendulum unbroken through all three changes.',
            text_es: 'Reto — Medio compás con tres acordes (3 acordes): agrega G (del Módulo 5). Repite Em · Am · G, dos tiempos cada uno, el rasgueo sin detenerse, a 60 BPM. Lo tienes cuando: dos vueltas limpias con el péndulo sin interrupciones a través de los tres cambios.',
            hint: 'Am → G moves every finger, so pre-shape G in the air while Am is still ringing. Em → Am shares your two fretting fingers — barely a move.',
            hint_es: 'Am → G mueve cada dedo, así que preforma G en el aire mientras Am todavía suena. Em → Am comparte tus dos dedos de trastear — apenas un movimiento.',
            stuck: 'Loop just Am → G until the strum survives that change, then drop Em back in front.',
            stuck_es: 'Repite solo Am → G hasta que el rasgueo sobreviva ese cambio, y luego vuelve a poner Em al frente.',
            levelUp: 'Speed up to 70 BPM, or count "1 + 2 + 3 + 4 +" aloud the whole time.',
            levelUp_es: 'Acelera a 70 BPM, o cuenta "1 + 2 + 3 + 4 +" en voz alta todo el tiempo.',
            skills: [5, 6],
            chords: [
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
              { name: 'G',  chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 }
            ],
            playSeq: { label: 'Em·Em · Am·Am · G·G roots (every 2 beats)', label_es: 'Raíces Em·Em · Am·Am · G·G (cada 2 tiempos)', bpm: 60, notes: [40, 40, 45, 45, 43, 43] }
          },
          {
            text: 'Challenge — Four-Chord Half-Bar (Let It Be, strummed): the C · G · Am · F loop from Module 5, down-up strumming, two beats per chord at 60 BPM. Four chords at half-bar speed with the strum hand driving — this is real rhythm-guitar playing. You\'ve got it when: two clean laps, strum unbroken, every change on the beat.',
            text_es: 'Reto — Medio compás con cuatro acordes (Let It Be, rasgueado): el loop C · G · Am · F del Módulo 5, rasgueando abajo-arriba, dos tiempos por acorde a 60 BPM. Cuatro acordes a velocidad de medio compás con la mano de rasgueo al mando — esto es tocar guitarra rítmica de verdad. Lo tienes cuando: dos vueltas limpias, rasgueo sin interrupciones, cada cambio a tiempo.',
            hint: 'The right hand is the drummer and never stops; the left hand catches up between strokes. Keep upstrokes light — brush only the top few strings.',
            hint_es: 'La mano derecha es el baterista y nunca se detiene; la mano izquierda se pone al día entre golpes. Mantén los golpes hacia arriba ligeros — roza solo las cuerdas más agudas.',
            stuck: 'Isolate the pair that lags (often G → Am or Am → F) and loop just those two with the strum before running the circle.',
            stuck_es: 'Aísla el par que se atrasa (a menudo G → Am o Am → F) y repite solo esos dos con el rasgueo antes de correr el círculo completo.',
            levelUp: 'Push to 70 BPM, or move on to the every-beat drill below.',
            levelUp_es: 'Sube a 70 BPM, o pasa al ejercicio de cada tiempo de abajo.',
            skills: [5, 6],
            chords: [
              { name: 'C',  chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
              { name: 'G',  chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
              { name: 'F',  chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
            ],
            playSeq: { label: 'C·C · G·G · Am·Am · F·F roots (every 2 beats)', label_es: 'Raíces C·C · G·G · Am·Am · F·F (cada 2 tiempos)', bpm: 60, notes: [48, 48, 43, 43, 45, 45, 53, 53] }
          },
          {
            text: 'Challenge — One Chord Per Beat (fastest): the top of the ladder. Switch Em ↔ Am on every single beat — one down-strum per beat, a new chord each time, at 60 BPM, the strum still non-stop. You\'ve got it when: four laps clean at 60 where the change happens the instant your hand lifts for the next strum.',
            text_es: 'Reto — Un acorde por tiempo (el más rápido): la cima de la escalera. Cambia entre Em ↔ Am en cada tiempo — un golpe hacia abajo por tiempo, un acorde nuevo cada vez, a 60 BPM, el rasgueo sigue sin detenerse. Lo tienes cuando: cuatro vueltas limpias a 60 donde el cambio ocurre en el instante en que tu mano se levanta para el siguiente rasgueo.',
            hint: 'Em and Am share two fingers, so this is the easiest pair to change every beat — perfect for training raw speed. Trust the shared fingers and move only what has to move.',
            hint_es: 'Em y Am comparten dos dedos, así que es el par más fácil para cambiar en cada tiempo — perfecto para entrenar velocidad pura. Confía en los dedos compartidos y mueve solo lo que tiene que moverse.',
            stuck: 'Slow to 50 BPM and let some changes be a little buzzy — here the goal is the timing of the switch, not perfect tone. Clean it up as the speed settles.',
            stuck_es: 'Baja a 50 BPM y deja que algunos cambios suenen un poco con zumbido — aquí el objetivo es el tiempo del cambio, no un tono perfecto. Límpialo a medida que se asiente la velocidad.',
            levelUp: 'Hold it clean at 70 BPM, or try Am · G one per beat (every finger moves — much harder).',
            levelUp_es: 'Mantenlo limpio a 70 BPM, o prueba Am · G uno por tiempo (cada dedo se mueve — mucho más difícil).',
            skills: [5, 6],
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
                text: 'Challenge — Watchtower, strummed for real: play Am · G · F (small F), four beats of down-up strumming per chord at 60 BPM, the pendulum swinging through both changes. You\'ve got it when: two full laps (a lap = one full time through the loop) where the strum hand never stops — not even when the F lands late. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this song has grown with you since Module 1</a>.',
                text_es: 'Reto — Watchtower, rasgueado de verdad: toca Am · G · F (F pequeño), cuatro tiempos de rasgueo abajo-arriba por acorde a 60 BPM, el péndulo balanceándose a través de ambos cambios. Lo tienes cuando: dos vueltas completas (una vuelta = un recorrido completo del loop) donde la mano de rasgueo nunca se detiene — ni siquiera cuando el F llega tarde. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: esta canción ha crecido contigo desde el Módulo 1</a>.',
                hint: 'Same loop you strummed in Module 5 — the new skill is that your right hand is now the drummer. The chord change happens BETWEEN strums.',
                hint_es: 'El mismo loop que rasgueaste en el Módulo 5 — la nueva destreza es que tu mano derecha ahora es el baterista. El cambio de acorde ocurre ENTRE rasgueos.',
                stuck: 'Drop to just Am ↔ G until the strum survives that change, then add the F back.',
                stuck_es: 'Baja a solo Am ↔ G hasta que el rasgueo sobreviva ese cambio, y luego agrega de vuelta el F.',
                levelUp: 'Switch every 2 beats instead of 4, or count "1 + 2 + 3 + 4 +" out loud the whole time.',
                levelUp_es: 'Cambia cada 2 tiempos en lugar de 4, o cuenta "1 + 2 + 3 + 4 +" en voz alta todo el tiempo.',
                skills: [2, 5]
              },
              {
                text: 'Challenge — Knockin\' on Heaven\'s Door: play G · D · Am · C, four beats of down-up each at 60 BPM — the record is slow too, so this song never rushes you. You\'ve got it when: one full lap with even volume on downs and ups and every change landing on beat 1.',
                text_es: 'Reto — Knockin\' on Heaven\'s Door: toca G · D · Am · C, cuatro tiempos de abajo-arriba cada uno a 60 BPM — la grabación también es lenta, así que esta canción nunca te apura. Lo tienes cuando: una vuelta completa con volumen parejo en los golpes hacia abajo y hacia arriba, y cada cambio cayendo en el tiempo 1.',
                hint: 'Dylan built this song to support a voice — soft, even 8ths are the whole job. If an upstroke catches the strings, let the pick graze just the top 3–4 strings.',
                hint_es: 'Dylan construyó esta canción para apoyar una voz — corcheas suaves y parejas son todo el trabajo. Si un golpe hacia arriba engancha las cuerdas, deja que la púa roce solo las 3–4 cuerdas más agudas.',
                stuck: 'Loop the G → D change alone — it\'s the only move where every finger travels.',
                stuck_es: 'Repite solo el cambio G → D — es el único movimiento donde cada dedo viaja.',
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
          choices_es: ['Nada — debería detenerse', 'Pierdes el pulso y el tiempo se desmorona', 'Se te cae la púa', 'El acorde suena más fuerte'], answer: 1 } },
      { id: 'm6w1-s2', text: 'Play a steady down-up 8th-note pattern at 60 BPM for 8 bars',
        text_es: 'Tocar un patrón de corcheas abajo-arriba constante a 60 BPM durante 8 compases',
        gotItWhen: 'you can strum down-up at 60 BPM for 8 bars and every strum lands evenly with the metronome — no drift, no skipped strums.',
        gotItWhen_es: 'puedes rasguear abajo-arriba a 60 BPM durante 8 compases y cada rasgueo cae parejo con el metrónomo — sin desviarte, sin saltarte rasgueos.',
        practice: { type: 'playSeq', label: 'Hear the 8th-note pulse (8 evens)', label_es: 'Escucha el pulso de corcheas (8 parejas)', bpm: 60,
          notes: [60, 60, 60, 60, 60, 60, 60, 60] } },
      { id: 'm6w1-s3', text: 'Count "1 + 2 + 3 + 4 +" out loud while strumming',
        text_es: 'Contar "1 + 2 + 3 + 4 +" en voz alta mientras rasgueas',
        gotItWhen: 'you can count aloud with the strum and the numbers always land on downstrokes, the "and"s always land on upstrokes — no thinking required.',
        gotItWhen_es: 'puedes contar en voz alta con el rasgueo y los números siempre caen en los golpes hacia abajo, los "y" siempre caen en los golpes hacia arriba — sin necesidad de pensarlo.',
        practice: { type: 'mc', prompt: 'In "1 + 2 + 3 + 4 +", which counts are the DOWNSTROKES?',
          prompt_es: 'En "1 + 2 + 3 + 4 +", ¿cuáles tiempos son los GOLPES HACIA ABAJO?',
          choices: ['The "+" (and) counts', 'The numbers (1, 2, 3, 4)', 'All of them', 'Only beat 1'],
          choices_es: ['Los "+" (y)', 'Los números (1, 2, 3, 4)', 'Todos', 'Solo el tiempo 1'], answer: 1 } },
      { id: 'm6w1-s4', text: 'Strum with even volume — downstrokes and upstrokes feel equally controlled',
        text_es: 'Rasguear con volumen parejo — los golpes hacia abajo y hacia arriba se sienten igual de controlados',
        gotItWhen: 'your downstrokes and upstrokes sound roughly the same volume — neither overpowers the other, and your pick doesn\'t catch the strings on the way up.',
        gotItWhen_es: 'tus golpes hacia abajo y hacia arriba suenan más o menos con el mismo volumen — ninguno domina al otro, y tu púa no engancha las cuerdas en el camino hacia arriba.' },
      { id: 'm6w1-s5', text: 'Keep the strum hand moving through a chord change',
        text_es: 'Mantener la mano de rasgueo en movimiento a través de un cambio de acorde',
        gotItWhen: 'when you switch from Em to Am (or any two chords), your strum hand never pauses — the chord change happens BETWEEN strums, not by stopping the rhythm.',
        gotItWhen_es: 'cuando cambias de Em a Am (o cualquier par de acordes), tu mano de rasgueo nunca pausa — el cambio de acorde ocurre ENTRE rasgueos, no deteniendo el ritmo.',
        practice: { type: 'mc', prompt: 'During a chord change, what should your STRUM hand do?',
          prompt_es: 'Durante un cambio de acorde, ¿qué debería hacer tu mano de RASGUEO?',
          choices: ['Stop and wait for the chord', 'Keep moving in the down-up pendulum', 'Strum extra hard to cover the change', 'Lift off the strings'],
          choices_es: ['Detenerse y esperar al acorde', 'Seguir moviéndose en el péndulo abajo-arriba', 'Rasguear extra fuerte para cubrir el cambio', 'Levantarse de las cuerdas'], answer: 1 } },
      { id: 'm6w1-s6', text: 'Play 4 bars of Em then 4 bars of Am with a continuous down-up strum',
        text_es: 'Tocar 4 compases de Em y luego 4 compases de Am con un rasgueo abajo-arriba continuo',
        gotItWhen: 'you can loop Em-Em-Em-Em-Am-Am-Am-Am with down-up strumming at 60 BPM and never break the rhythm — even when the chord change is imperfect.',
        gotItWhen_es: 'puedes repetir Em-Em-Em-Em-Am-Am-Am-Am con rasgueo abajo-arriba a 60 BPM sin romper nunca el ritmo — incluso cuando el cambio de acorde no es perfecto.',
        practice: { type: 'playSeq', label: 'Em → Am roots (4 bars each)', label_es: 'Raíces Em → Am (4 compases cada una)', bpm: 60,
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
    objective: 'I CAN play the classic D-DU-UDU strum pattern at 60 BPM — pushing toward 70+ — and apply it to a real song with chord changes.',
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
            text: 'Watch: <a href="https://youtu.be/6LmQCdt_ZhQ" target="_blank">The Most Common Strumming Pattern of All Time! – JustinGuitar</a> (0:00–4:00). Your task while you watch: air-strum along and find the two moments the pick misses — the wrist keeps swinging, but on purpose it skips one upstroke and one downstroke.',
            text_es: 'Mira: <a href="https://youtu.be/6LmQCdt_ZhQ" target="_blank">The Most Common Strumming Pattern of All Time! – JustinGuitar</a> (0:00–4:00). Tu tarea mientras miras: rasguea en el aire junto con él y encuentra los dos momentos en que la púa falla a propósito — la muñeca sigue balanceándose, pero se salta un golpe hacia arriba y uno hacia abajo a propósito.',
            hint: 'Justin calls it the pattern you can always rely on — D-DU-UDU. Listen for which strums he skips: the wrist still moves, but the pick doesn\'t hit the strings on those beats.',
            hint_es: 'Justin lo llama el patrón en el que siempre puedes confiar — D-DU-UDU. Escucha cuáles rasgueos se salta: la muñeca sigue moviéndose, pero la púa no toca las cuerdas en esos tiempos.',
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
            text: 'Watch: <a href="https://youtu.be/0JDGO0n6tjw" target="_blank">Step-by-Step Easy Strumming Patterns – Marty Music</a> (0:00–3:00). Your task while you watch: clap a little louder on beats 2 and 4 along with him, and feel how that "backbeat" makes the pattern groove.',
            text_es: 'Mira: <a href="https://youtu.be/0JDGO0n6tjw" target="_blank">Step-by-Step Easy Strumming Patterns – Marty Music</a> (0:00–3:00). Tu tarea mientras miras: aplaude un poco más fuerte en los tiempos 2 y 4 junto con él, y siente cómo ese "contratiempo" le da groove al patrón.',
            hint: 'Marty stacks patterns from easiest to harder, accenting beats 2 and 4 as he goes. The accents give the strum a "backbeat" feel, like a drummer\'s snare.',
            hint_es: 'Marty apila patrones de más fácil a más difícil, acentuando los tiempos 2 y 4 a medida que avanza. Los acentos le dan al rasgueo una sensación de "contratiempo", como el tambor de un baterista.',
            skills: [3, 4],
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
            text: 'Listen to "I\'m Yours" by Jason Mraz. Tap the D-DU-UDU pattern on your leg along with the song. Where does the pattern repeat?',
            text_es: 'Escucha "I\'m Yours" de Jason Mraz. Marca el patrón D-DU-UDU en tu pierna junto con la canción. ¿Dónde se repite el patrón?',
            hint: 'The pattern is one bar long and repeats throughout the whole song. Once you have it, you have most of his song.',
            hint_es: 'El patrón dura un compás y se repite durante toda la canción. Una vez que lo dominas, tienes la mayor parte de la canción.',
            skills: [4, 5],
            response: { type: 'mc', prompt: 'A one-bar strum pattern in 4/4 time covers how many BEATS?',
              prompt_es: 'Un patrón de rasgueo de un compás en tiempo 4/4 cubre cuántos TIEMPOS?',
              answer: 1,
              explain: 'The top number of 4/4 means 4 beats (counts) per bar — "1, 2, 3, 4." Add the "+" upbeats and you get 8 eighth-note slots, but the bar is 4 counts.',
              explain_es: 'El número de arriba en 4/4 significa 4 tiempos (conteos) por compás — "1, 2, 3, 4". Agrega los contratiempos "+" y obtienes 8 espacios de corchea, pero el compás son 4 conteos.',
              choices: [
              '2',
              '4',
              '8',
              '16'
            ],
              choices_es: [
              '2',
              '4',
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
                text: 'Tune all 6 strings to green, then warm the strum hand: 4 bars of steady down-up on Em at 60 BPM (Set 1). You\'ve got it when: in tune and the pendulum already swinging before you add the new pattern.',
                text_es: 'Afina las 6 cuerdas hasta que estén en verde, y luego calienta la mano de rasgueo: 4 compases de abajo-arriba constante en Em a 60 BPM (Unidad 1). Lo tienes cuando: estás afinado y el péndulo ya está balanceándose antes de agregar el nuevo patrón.',
                hint: 'Look back: D-DU-UDU is just the down-up you already own with two strums left out. Get the even swing going first.',
                hint_es: 'Recuerda: D-DU-UDU es solo el abajo-arriba que ya dominas con dos rasgueos omitidos. Primero logra que el balanceo parejo funcione.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Learn the D-DU-UDU pattern',
            title_es: 'Aprende el patrón D-DU-UDU',
            steps: [
          {
            text: 'Challenge 1 — Learn the Groove: mute the strings and, at 60 BPM, strum the pattern "Down, Down-Up, Up-Down-Up" (D-DU-UDU). You\'ve got it when: the wrist keeps moving on the skipped downstroke — the pick just misses on purpose.<div class="strum-line">D   ·   D   U   ·   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            text_es: 'Reto 1 — Aprende el groove: silencia las cuerdas y, a 60 BPM, rasguea el patrón "Abajo, Abajo-Arriba, Arriba-Abajo-Arriba" (D-DU-UDU). Lo tienes cuando: la muñeca sigue en movimiento en el golpe hacia abajo que te saltas — la púa solo falla a propósito.<div class="strum-line">D   ·   D   U   ·   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            hint: 'The trickiest part is keeping the wrist moving on the skipped downstroke. The wrist still goes down — the pick just misses the strings on purpose.',
            hint_es: 'La parte más difícil es mantener la muñeca en movimiento en el golpe hacia abajo que te saltas. La muñeca sigue bajando — la púa solo falla las cuerdas a propósito.',
            stuck: 'Say it out loud — "down, down-up, up-down-up" — and air-strum with no pick first. The · dots above are the beats your hand passes but doesn\'t hit.',
            stuck_es: 'Dilo en voz alta — "abajo, abajo-arriba, arriba-abajo-arriba" — y rasguea en el aire sin púa primero. Los puntos · de arriba son los tiempos que tu mano pasa pero no toca.',
            levelUp: 'Run it at 75 BPM, or accent the very first down of each bar so the pattern has a clear "top".',
            levelUp_es: 'Tócalo a 75 BPM, o acentúa el primer golpe hacia abajo de cada compás para que el patrón tenga un "inicio" claro.',
            skills: [1, 2, 3]
          }
            ]
          },
          {
            title: 'Play the pattern with backbeat accents',
            title_es: 'Toca el patrón con acentos de contratiempo',
            steps: [
          {
            text: 'Challenge 2 — Pattern on Em: fret Em and play D-DU-UDU at 60 BPM for 8 bars, counting aloud and accenting beats 2 and 4. You\'ve got it when: 8 clean bars with a clear "snare hit" feel on 2 and 4.',
            text_es: 'Reto 2 — Patrón en Em: trastea Em y toca D-DU-UDU a 60 BPM durante 8 compases, contando en voz alta y acentuando los tiempos 2 y 4. Lo tienes cuando: 8 compases limpios con una sensación clara de "golpe de tarola" en el 2 y el 4.',
            hint: 'Add accents on beats 2 and 4 — those downstrokes should be a little louder. Feel the "snare hit" on those beats.',
            hint_es: 'Agrega acentos en los tiempos 2 y 4 — esos golpes hacia abajo deben ser un poco más fuertes. Siente el "golpe de tarola" en esos tiempos.',
            stuck: 'Drop the accents for now and just get the D-DU-UDU shape clean for 8 bars; add the louder 2-and-4 hits once the pattern runs on autopilot.',
            stuck_es: 'Deja los acentos por ahora y solo logra que la forma D-DU-UDU salga limpia durante 8 compases; agrega los golpes más fuertes en 2 y 4 una vez que el patrón salga en piloto automático.',
            levelUp: 'Move it to G or D, or push to 75 BPM with the backbeat still landing.',
            levelUp_es: 'Muévelo a G o D, o sube a 75 BPM manteniendo el contratiempo cayendo bien.',
            skills: [2, 4, 5],
            playSeq: { label: 'Hear Em with accent on 2 and 4', label_es: 'Escucha Em con acento en el 2 y el 4', bpm: 60, notes: [40, 47, 40, 47] }
          }
            ]
          },
          {
            title: 'Hold the pattern through a chord change',
            title_es: 'Mantén el patrón a través de un cambio de acorde',
            steps: [
          {
            text: 'Challenge 3 — G → D, Pattern Locked (your assessment piece): loop G → D every 2 bars playing D-DU-UDU, and set the ⏱ Timer for 3 minutes to keep going. You\'ve got it when: the pattern stays identical through the change — only the chord moves (drop to 50 BPM if it falls apart).',
            text_es: 'Reto 3 — G → D, patrón asegurado (tu pieza de evaluación): repite G → D cada 2 compases tocando D-DU-UDU, y pon el ⏱ Temporizador en 3 minutos para seguir. Lo tienes cuando: el patrón se mantiene idéntico a través del cambio — solo el acorde se mueve (baja a 50 BPM si se desarma).',
            hint: 'If the pattern falls apart during the chord change, slow to 50 BPM. The pattern is the GROOVE — losing it is worse than missing a note in the chord.',
            hint_es: 'Si el patrón se desarma durante el cambio de acorde, baja a 50 BPM. El patrón ES el groove — perderlo es peor que fallar una nota en el acorde.',
            stuck: 'Change the chord on the LAST upstroke of the bar, while your hand is already moving up — that\'s the free moment to jump from G to D. Loop just 2 bars until the join between the two bars (the seam) is smooth.',
            stuck_es: 'Cambia el acorde en el ÚLTIMO golpe hacia arriba del compás, mientras tu mano ya está subiendo — ese es el momento libre para saltar de G a D. Repite solo 2 compases hasta que la unión entre ambos (la costura) salga fluida.',
            levelUp: 'Add a third chord (G → D → Em), or run it at 75 BPM with no break at the change.',
            levelUp_es: 'Agrega un tercer acorde (G → D → Em), o tócalo a 75 BPM sin interrupción en el cambio.',
            skills: [4, 5, 6],
            response: { type: 'short', prompt: 'Personal record — D-DU-UDU through the G→D change: play it cleanly at 60 BPM, then go +10 at a time. Your fastest CLEAN loop today (BPM)?', prompt_es: 'Récord personal — D-DU-UDU a través del cambio G→D: tócalo limpio a 60 BPM, y luego sube de 10 en 10. ¿Tu vuelta LIMPIA más rápida hoy (BPM)?', placeholder: 'e.g. 80 — try for a higher number next time', placeholder_es: 'p. ej. 80 — intenta superarlo la próxima vez' }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                text: 'Challenge — I\'m Yours, verse: play G · D · Em · C with D-DU-UDU, one bar per chord at 60 BPM. This is THE song this pattern is famous for. You\'ve got it when: the verse loop start to finish with the pattern identical on every chord — even when a chord lands imperfect, the groove holds.',
                text_es: 'Reto — I\'m Yours, estrofa: toca G · D · Em · C con D-DU-UDU, un compás por acorde a 60 BPM. Esta es LA canción por la que este patrón es famoso. Lo tienes cuando: el loop de la estrofa de principio a fin con el patrón idéntico en cada acorde — incluso cuando un acorde no sale perfecto, el groove se mantiene.',
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
                text: 'Challenge — Oye Mi Amor, verse: the verse uses just two chords, Bm · G — use the small Bm (top four strings, no barre) and play one bar of each with D-DU-UDU at 60 BPM. You\'ve got it when: four laps with the pattern unbroken and beats 2 and 4 accented so it pushes like the record.',
                text_es: 'Reto — Oye Mi Amor, estrofa: la estrofa usa solo dos acordes, Bm · G — usa el Bm pequeño (cuatro cuerdas más agudas, sin cejilla) y toca un compás de cada uno con D-DU-UDU a 60 BPM. Lo tienes cuando: cuatro vueltas con el patrón sin interrupciones y los tiempos 2 y 4 acentuados para que empuje como la grabación.',
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
            title: '⚡ Ear Spark — optional ear bonus',
            title_es: '⚡ Chispa auditiva — bono opcional de oído',
            steps: [
              {
                text: '⚡ Ear Spark (optional, 2 min): play any lesson video from this set and pause right after one bar of strumming — clap the rhythm back exactly, then play it as muted strums. Rhythm echo is ear training too. Got someone around? Have them clap a bar of any pattern from this set for you to echo.',
                text_es: '⚡ Chispa auditiva (opcional, 2 min): reproduce cualquier video de lección de esta unidad y pausa justo después de un compás de rasgueo — aplaude el ritmo exactamente igual, y luego tócalo como rasgueos silenciados. El eco rítmico también es entrenamiento auditivo. ¿Tienes a alguien cerca? Pídele que aplauda un compás de cualquier patrón de esta unidad para que lo repitas.'
              }
            ]
          },
          {
            title: 'Play-along — one full pass, no stopping',
            title_es: 'Toca junto — un pase completo, sin detenerte',
            steps: [
              {
                text: 'Play-along: open Station B\'s D-DU-UDU lesson video, set YouTube\'s speed to 0.75×, and strum along for the ENTIRE demo section without stopping. You\'ve got it when: you finish a full pass with the video — flubbed changes and all, don\'t stop.',
                text_es: 'Toca junto: abre el video de la lección D-DU-UDU de la Estación B, pon la velocidad de YouTube en 0.75×, y rasguea junto con él durante TODA la sección de demostración sin detenerte. Lo tienes cuando: terminas un pase completo con el video — con cambios fallidos y todo, no te detengas.',
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
      performance: 'Strum D-DU-UDU on Em for 4 bars, then switch to Am for 4 more without the pattern breaking at the change. With someone around, trade fours instead: one plays Em, the other takes over on Am, and the pattern must not break at the handoff.',
      selfCheck: 'Can you play D-DU-UDU without thinking about which strum is next? Can you keep the pattern going through a G-to-D change?',
      selfCheck_es: '¿Puedes tocar D-DU-UDU sin pensar en cuál rasgueo sigue? ¿Puedes mantener el patrón a través de un cambio de G a D?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
    },

    skills: [
      { id: 'm6w2-s1', text: 'Play the D-DU-UDU pattern cleanly at 60 BPM',
        text_es: 'Tocar el patrón D-DU-UDU de forma limpia a 60 BPM',
        gotItWhen: 'you can play D-DU-UDU on a single chord at 60 BPM for 4 bars in a row without breaking the pattern or stopping the wrist.',
        gotItWhen_es: 'puedes tocar D-DU-UDU en un solo acorde a 60 BPM durante 4 compases seguidos sin romper el patrón ni detener la muñeca.',
        practice: { type: 'mc', prompt: 'How would you read D-DU-UDU out loud as a count? (one of these matches)',
          prompt_es: '¿Cómo leerías D-DU-UDU en voz alta como conteo? (una de estas coincide)',
          choices: ['1, 2-+, +-4-+', '1, 2-+, +-3-+', 'Just count "1, 2, 3, 4"', '1-2-3-4-5-6'],
          choices_es: ['1, 2-+, +-4-+', '1, 2-+, +-3-+', 'Solo contar "1, 2, 3, 4"', '1-2-3-4-5-6'], answer: 0 } },
      { id: 'm6w2-s2', text: 'Skip a downstroke while keeping the wrist in motion',
        text_es: 'Saltarse un golpe hacia abajo manteniendo la muñeca en movimiento',
        gotItWhen: 'on the "skipped" strum in the pattern, your wrist still travels down — only the pick doesn\'t touch the strings. A quick phone video (or a mirror) shows the motion clearly.',
        gotItWhen_es: 'en el rasgueo "saltado" del patrón, tu muñeca sigue bajando — solo la púa no toca las cuerdas. Un video rápido del teléfono (o un espejo) muestra el movimiento claramente.',
        practice: { type: 'mc', prompt: 'When you "skip" a strum in the D-DU-UDU pattern, what does your wrist do?',
          prompt_es: 'Cuando te "saltas" un rasgueo en el patrón D-DU-UDU, ¿qué hace tu muñeca?',
          choices: ['Stops completely', 'Keeps moving in the pendulum — the pick just misses the strings', 'Lifts up away from the guitar', 'Locks for a beat'],
          choices_es: ['Se detiene por completo', 'Sigue moviéndose en el péndulo — la púa solo falla las cuerdas', 'Se levanta lejos de la guitarra', 'Se bloquea por un tiempo'], answer: 1 } },
      { id: 'm6w2-s3', text: 'Accent beats 2 and 4 (the "backbeat")',
        text_es: 'Acentuar los tiempos 2 y 4 (el "contratiempo")',
        gotItWhen: 'when you strum the pattern, beats 2 and 4 are noticeably louder than 1 and 3 — and the song starts to feel like it has a built-in drumbeat.',
        gotItWhen_es: 'cuando rasgueas el patrón, los tiempos 2 y 4 suenan notablemente más fuertes que el 1 y el 3 — y la canción empieza a sentirse como si tuviera un ritmo de batería incorporado.',
        practice: { type: 'playSeq', label: 'Hear the backbeat — louder hits on 2 and 4', label_es: 'Escucha el contratiempo — golpes más fuertes en el 2 y el 4', bpm: 70,
          notes: [40, 47, 40, 47] } },
      { id: 'm6w2-s4', text: 'Keep the D-DU-UDU pattern going through a chord change',
        text_es: 'Mantener el patrón D-DU-UDU a través de un cambio de acorde',
        gotItWhen: 'when you switch from G to D (or any two chords) the pattern doesn\'t change at all — only the chord underneath does.',
        gotItWhen_es: 'cuando cambias de G a D (o cualquier par de acordes) el patrón no cambia en absoluto — solo cambia el acorde debajo.' },
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
          choices_es: ['Rasguear hacia arriba (hacia el techo, lejos del suelo)', 'Rasguear hacia abajo', 'Silenciar las cuerdas', 'Sostener el acorde'], answer: 0 } }
    ]
  },

  {
    id: 'm6w3',
    songThread: [{ name: 'All Along the Watchtower', journey: 'tabs/all-along-the-watchtower.html', note: 'five layers deep and still growing' }],
    label: 'Set 3',
    locked: false,
    module: 'Strumming Patterns with Chords',
    moduleNum: 6,
    unit: 'Module 6 · Strumming Patterns with Chords',
    unit_es: 'Módulo 6 · Patrones de rasgueo con acordes',
    title: 'Set 3',
    subtitle: 'Multiple strum patterns · Folk, rock, reggae styles · Choosing the right groove',
    subtitle_es: 'Varios patrones de rasgueo · Estilos folk, rock, reggae · Elegir el groove correcto',
    objective: 'I CAN play 2+ different strum patterns over the same chord progression and choose a pattern that fits a song\'s style.',
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
            text: 'Watch: <a href="https://youtu.be/vMt8T5Jqf10" target="_blank">Best Strumming Exercise For Beginners and Improvers – Andy Guitar</a> — a different teacher\'s method for building ANY pattern. Strum along with his exercise in real time, and notice how his approach differs from Justin\'s in the first video.',
            text_es: 'Mira: <a href="https://youtu.be/vMt8T5Jqf10" target="_blank">Best Strumming Exercise For Beginners and Improvers – Andy Guitar</a> — el método de un maestro distinto para construir CUALQUIER patrón. Rasguea junto con su ejercicio en tiempo real, y fíjate en cómo su enfoque difiere del de Justin en el primer video.',
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
            text: 'Compare two recordings: "Three Little Birds" (Bob Marley — reggae) and "Bad Moon Rising" (CCR — rock). Same speed-ish, very different feel. What makes the difference?',
            text_es: 'Compara dos grabaciones: "Three Little Birds" (Bob Marley — reggae) y "Bad Moon Rising" (CCR — rock). Velocidad parecida, sensación muy distinta. ¿Qué hace la diferencia?',
            hint: 'It\'s almost entirely the strum pattern. Reggae emphasizes the offbeats (the "+"); rock emphasizes the downbeats (the numbers).',
            hint_es: 'Es casi por completo el patrón de rasgueo. El reggae enfatiza los contratiempos (el "+"); el rock enfatiza los tiempos fuertes (los números).',
            skills: [4, 5],
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
                text: 'Tune to green, then on a G chord play 2 bars each of: steady down-up (folk), heavy down-up (rock), and up-only on the "+" (reggae). You\'ve got it when: in tune and your hand remembers all three feels before you refine them.',
                text_es: 'Afina hasta que esté en verde, y luego con un acorde G toca 2 compases de cada uno: abajo-arriba constante (folk), abajo-arriba pesado (rock), y solo arriba en el "+" (reggae). Lo tienes cuando: estás afinado y tu mano recuerda las tres sensaciones antes de refinarlas.',
                hint: 'A quick 60-second pass through all three styles wakes up the patterns you\'ll polish this set.',
                hint_es: 'Un repaso rápido de 60 segundos por los tres estilos despierta los patrones que vas a pulir en esta unidad.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Play a folk strum',
            title_es: 'Toca un rasgueo folk',
            steps: [
          {
            text: 'Challenge 1 — Folk Feel: hold G and strum all downstrokes, one per beat, at 70 BPM — quiet and steady, singalong style. You\'ve got it when: even, soft, supportive strumming with no accents sticking out.<div class="strum-line">D       D       D       D\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            text_es: 'Reto 1 — Sensación folk: sostén G y rasguea todo hacia abajo, uno por tiempo, a 70 BPM — tranquilo y constante, estilo para cantar junto. Lo tienes cuando: un rasgueo parejo, suave, que acompaña, sin acentos que sobresalgan.<div class="strum-line">D       D       D       D\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            hint: 'Folk is about supporting the singer, not standing out. Soft attack, even volume, no accents.',
            hint_es: 'El folk se trata de acompañar al cantante, no de sobresalir. Ataque suave, volumen parejo, sin acentos.',
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
            text: 'Challenge 2 — Rock Feel: same G at the same tempo, but strum harder into the strings — heavy down-up-down-up accenting every down. You\'ve got it when: a thick, driving sound using arm weight, not just wrist.<div class="strum-line">D   U   D   U   D   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            text_es: 'Reto 2 — Sensación rock: el mismo G al mismo tempo, pero rasguea más fuerte hacia las cuerdas — abajo-arriba-abajo-arriba pesado acentuando cada golpe hacia abajo. Lo tienes cuando: un sonido grueso e impulsor usando el peso del brazo, no solo la muñeca.<div class="strum-line">D   U   D   U   D   U   D   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
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
            text: 'Challenge 3 — Reggae Chop, a short, quick, muted upstroke (try it!): hold G, skip every downbeat, and strum UP only on each "+" — rest-up-rest-up. No score — play along with "Three Little Birds" to lock in the offbeat feel.<div class="strum-line">·   U   ·   U   ·   U   ·   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
            text_es: 'Reto 3 — Picoteo reggae, un golpe hacia arriba corto, rápido y silenciado (¡pruébalo!): sostén G, sáltate cada tiempo fuerte, y rasguea hacia ARRIBA solo en cada "+" — silencio-arriba-silencio-arriba. Sin puntaje — toca junto con "Three Little Birds" para afianzar la sensación de contratiempo.<div class="strum-line">·   U   ·   U   ·   U   ·   U\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>',
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
            text: 'Challenge 4 — Two Feels, One Song (your assessment piece): take G–D–Em–C and play 8 bars folk, then switch to rock for 8 bars — same chords, two clearly different feels, no break at the switch. Set the ⏱ Timer for 3 minutes and loop it.',
            text_es: 'Reto 4 — Dos sensaciones, una canción (tu pieza de evaluación): toma G–D–Em–C y toca 8 compases estilo folk, y luego cambia a rock durante 8 compases — mismos acordes, dos sensaciones claramente distintas, sin interrupción en el cambio. Pon el ⏱ Temporizador en 3 minutos y repítelo.',
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
            text: 'Challenge 5 — Trade Off (try it!): loop the backing roots below — or record yourself strumming 8 bars of a progression (try Am–G–C or G–D–Em–C) with any pattern from this module — then solo over it using Pentatonic Pattern 1 from Module 4. Take turns with yourself every 8 bars: strum one pass, then solo over the next. Got another guitarist around? One strums, one solos, swap after 8 bars. No score — aim for one clear musical idea, not a flurry of notes.',
            text_es: 'Reto 5 — Intercambio (¡pruébalo!): repite las raíces de fondo de abajo — o grábate rasgueando 8 compases de una progresión (prueba Am–G–C o G–D–Em–C) con cualquier patrón de este módulo — y luego improvisa sobre ella usando el Patrón Pentatónico 1 del Módulo 4. Túrnate contigo mismo cada 8 compases: rasguea un pase, y luego improvisa en el siguiente. ¿Tienes a otro guitarrista cerca? Uno rasguea, uno improvisa, cambien después de 8 compases. Sin puntaje — apunta a una idea musical clara, no a una ráfaga de notas.',
            hint: 'Am–G–C fits A minor pentatonic; a major-key progression fits major pentatonic. This is the reward: the scale you learned in Module 4 lives on top of the chords you strum here. Leave space — silence is part of a solo.',
            hint_es: 'Am–G–C encaja con la pentatónica menor de A; una progresión en tono mayor encaja con la pentatónica mayor. Esta es la recompensa: la escala que aprendiste en el Módulo 4 vive encima de los acordes que rasgueas aquí. Deja espacio — el silencio es parte de un solo.',
            playSeq: { label: 'Backing roots — Am · G · C', label_es: 'Raíces de fondo — Am · G · C', bpm: 70, notes: [45, 43, 48] }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                text: 'Challenge — Watchtower, two ways: play Am · G · F with a soft folk strum for 8 bars, then the same loop rock-style — strum harder, accent the downs — for 8 bars, no break at the switch. You\'ve got it when: on a quick recording of yourself you can hear the exact bar the feel changed — Dylan\'s version becoming Hendrix\'s, live from your chair. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: five layers deep and still growing</a>.',
                text_es: 'Reto — Watchtower, de dos formas: toca Am · G · F con un rasgueo folk suave durante 8 compases, y luego el mismo loop estilo rock — rasguea más fuerte, acentúa los golpes hacia abajo — durante 8 compases, sin interrupción en el cambio. Lo tienes cuando: en una grabación rápida de ti mismo puedes escuchar el compás exacto donde cambió la sensación — la versión de Dylan volviéndose la de Hendrix, en vivo desde tu silla. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: cinco capas de profundidad y sigue creciendo</a>.',
                hint: 'You heard exactly this in Module 1 — acoustic Dylan vs. electric Hendrix. Same chords, same tempo; ONLY your strum hand changes.',
                hint_es: 'Escuchaste exactamente esto en el Módulo 1 — Dylan acústico vs. Hendrix eléctrico. Mismos acordes, mismo tempo; SOLO tu mano de rasgueo cambia.',
                stuck: 'Make the switch on beat 1 of a new bar and drill just the 2-bar seam where folk becomes rock.',
                stuck_es: 'Haz el cambio en el tiempo 1 de un compás nuevo y practica solo la costura de 2 compases donde el folk se vuelve rock.',
                levelUp: 'Add the reggae chop as a third 8-bar section — three eras of the same song.',
                levelUp_es: 'Agrega el picoteo reggae como una tercera sección de 8 compases — tres épocas de la misma canción.',
                skills: [5, 6],
                response: { type: 'short', prompt: 'Which feel suited Watchtower better to your ear — folk or rock — and why?', prompt_es: '¿Qué sensación le quedó mejor a Watchtower para tu oído — folk o rock — y por qué?', placeholder: 'e.g. rock — the accents make the loop feel dangerous', placeholder_es: 'p. ej. rock — los acentos hacen que el loop se sienta peligroso' }
              },
              {
                text: 'Challenge — Three Little Birds, reggae chop: play A · D · E with up-strums only on the "+", one bar each at 70 BPM. You\'ve got it when: two laps where every hit is an offbeat — then play along with the record and disappear into it.',
                text_es: 'Reto — Three Little Birds, picoteo reggae: toca A · D · E con golpes hacia arriba solo en el "+", un compás cada uno a 70 BPM. Lo tienes cuando: dos vueltas donde cada golpe es un contratiempo — y luego toca junto con la grabación y piérdete en ella.',
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
      { id: 'm6w3-s1', text: 'Play a folk strum (gentle, even all-downstrokes or simple down-up)',
        text_es: 'Tocar un rasgueo folk (suave, parejo, todo hacia abajo o abajo-arriba simple)',
        gotItWhen: 'you can play a chord progression with even, soft downstrokes that supports a singer — no accents, no aggressive attack.',
        gotItWhen_es: 'puedes tocar una progresión de acordes con golpes hacia abajo parejos y suaves que acompañan a un cantante — sin acentos, sin ataque agresivo.' },
      { id: 'm6w3-s2', text: 'Play a rock strum (heavy downstrokes with accent and weight)',
        text_es: 'Tocar un rasgueo rock (golpes hacia abajo pesados con acento y peso)',
        gotItWhen: 'your rock strum has clear weight and drive — play back a quick recording and you can hear that you mean it.',
        gotItWhen_es: 'tu rasgueo de rock tiene peso e impulso claros — reproduce una grabación rápida y puedes escuchar que lo dices en serio.' },
      { id: 'm6w3-s3', text: 'Play a reggae strum (upstrokes on the "+", downstrokes skipped)',
        text_es: 'Tocar un rasgueo reggae (golpes hacia arriba en el "+", golpes hacia abajo omitidos)',
        gotItWhen: 'you can play a reggae chop where ONLY the upstrokes hit the strings — your hand still moves on the beats, but the pick misses on purpose.',
        gotItWhen_es: 'puedes tocar un picoteo reggae donde SOLO los golpes hacia arriba tocan las cuerdas — tu mano sigue moviéndose en los tiempos, pero la púa falla a propósito.',
        practice: { type: 'mc', prompt: 'In a reggae offbeat strum, the strings are hit on which counts?',
          prompt_es: 'En un rasgueo de contratiempo reggae, ¿en cuáles tiempos se tocan las cuerdas?',
          choices: ['1, 2, 3, 4 (the numbers)', 'The "+" of each beat (between numbers)', 'Only beat 1', 'Continuously'],
          choices_es: ['1, 2, 3, 4 (los números)', 'El "+" de cada tiempo (entre números)', 'Solo el tiempo 1', 'Continuamente'], answer: 1 } },
      { id: 'm6w3-s4', text: 'Choose a strum pattern that matches a song\'s style',
        text_es: 'Elegir un patrón de rasgueo que se ajuste al estilo de una canción',
        gotItWhen: 'you can put on any new song, listen for 15 seconds, and pick a strum pattern that fits — without a tutorial telling you what to play.',
        gotItWhen_es: 'puedes poner cualquier canción nueva, escuchar 15 segundos, y elegir un patrón de rasgueo que encaje — sin que un tutorial te diga qué tocar.',
        practice: { type: 'mc', prompt: 'You hear a song with a slow, gentle, acoustic feel and a singer-songwriter vibe. Which strum suits it best?',
          prompt_es: 'Escuchas una canción con una sensación lenta, suave, acústica y un aire de cantautor. ¿Qué rasgueo le queda mejor?',
          choices: ['Heavy rock chops on every downstroke', 'Reggae offbeat upstrokes', 'Gentle folk strum (soft down-up)', 'No strum at all'],
          choices_es: ['Golpes pesados de rock en cada golpe hacia abajo', 'Golpes hacia arriba de contratiempo reggae', 'Rasgueo folk suave (abajo-arriba suave)', 'Sin rasgueo alguno'], answer: 2 } },
      { id: 'm6w3-s5', text: 'Switch strum patterns mid-song (e.g., verse vs. chorus)',
        text_es: 'Cambiar de patrón de rasgueo a mitad de la canción (p. ej., estrofa vs. coro)',
        gotItWhen: 'you can play 8 bars of one pattern, then switch cleanly to a different pattern for the next 8 bars — without losing the beat at the transition.',
        gotItWhen_es: 'puedes tocar 8 compases de un patrón, y luego cambiar limpiamente a un patrón distinto durante los siguientes 8 compases — sin perder el tiempo en la transición.' },
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
      { name: '"Knockin\' on Heaven\'s Door" — Dylan', meta: 'G–D–Am–C · slow tempo, perfect for first strum patterns', meta_es: 'G–D–Am–C · tempo lento, perfecto para los primeros patrones de rasgueo', type: 'Focus', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=rm9coqlk8fY',
        tutorialUrl: 'https://www.youtube.com/watch?v=pWIL4N6QZ-Y' },
      { name: '"Happy Birthday"', meta: 'Apply D-DU-UDU to C–G–Am–F arrangement', meta_es: 'Aplica D-DU-UDU al arreglo C–G–Am–F', type: 'Focus', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"I\'m Yours" — Jason Mraz', meta: 'G–D–Em–C · iconic D-DU-UDU strum', meta_es: 'G–D–Em–C · rasgueo icónico D-DU-UDU', type: 'Focus', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=EkHTsc9PU2A',
        tutorialUrl: 'https://www.youtube.com/watch?v=6ugeJWAMz6w' },
      { name: '"Three Little Birds" — Bob Marley', meta: 'A–D–E · classic reggae offbeat strum', meta_es: 'A–D–E · rasgueo clásico de contratiempo reggae', type: 'Focus', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=HNBCVM4KbUM',
        tutorialUrl: 'https://www.youtube.com/watch?v=61pk1YH9Lu0' },
      { name: '"Bad Moon Rising" — CCR', meta: 'D–A–G · driving rock-style strum', meta_es: 'D–A–G · rasgueo impulsor estilo rock', type: 'Focus', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=5BmEGm-mraE',
        tutorialUrl: 'https://www.youtube.com/watch?v=liBI2yT_fpw' },
      { name: '"Let It Be" — The Beatles', meta: 'C–G–Am–F · slow, even pattern', meta_es: 'C–G–Am–F · patrón lento y parejo', type: 'Choice', core: false, level: 2, journeyUrl: 'tabs/let-it-be.html',
        originalUrl: 'https://www.youtube.com/watch?v=CGj85pVzRJs',
        tutorialUrl: 'https://www.youtube.com/watch?v=gGt0akED_UU' },
      { name: '"Oye Mi Amor" — Maná', meta: 'Syncopated Latin strum on the verse · Bm (partial barre)–G', meta_es: 'Rasgueo latino sincopado en la estrofa · Bm (cejilla parcial)–G', type: 'Choice', core: false, level: 2,
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
        tutorialUrl: 'https://www.youtube.com/watch?v=rNSq3E3KfMk' }
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
    'Take G–D–Em–C and play it two ways — folk, then rock — switching feel with no break at the seam'
  ],
  assessItems_es: [
    'Toca Em durante 4 compases, y luego Am durante 4 compases, con un rasgueo abajo-arriba sin interrupciones a 60 BPM',
    'Toma G–D–Em–C y tócalo de dos formas — folk, y luego rock — cambiando la sensación sin interrupción en la costura'
  ],
  forward: 'Module 7 is the <strong>barre-chord</strong> module — and every steady strum hand you just built is what carries you through it. The rhythm keeps going even while your fretting hand fights the hardest shapes in the course. The groove you own now is what makes a clamped, buzzy first barre still sound like music.',
  forward_es: 'El Módulo 7 es el módulo de <strong>acordes con cejilla</strong> — y cada mano de rasgueo estable que acabas de construir es lo que te lleva a través de él. El ritmo sigue adelante incluso mientras tu mano de trastear lucha con las formas más difíciles del curso. El groove que ahora dominas es lo que hace que una primera cejilla apretada y con zumbido siga sonando a música.',
  standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
};
