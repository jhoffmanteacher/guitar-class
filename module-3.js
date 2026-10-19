// ============================================================
//  MODULE 3 — Two-Finger Power Chords
//  Edit this file to change Module 3 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm3w1',
    songThread: [{ name: '"Seven Nation Army"', journey: 'tabs/seven-nation-army.html', layer: 3, note: 'the riff as power chords' }, { name: '"All Along the Watchtower"', journey: 'tabs/all-along-the-watchtower.html', layer: 3, note: 'the loop as power chords' }],
    label: 'Set 1',
    locked: false,
    module: 'Two-Finger Power Chords',
    moduleNum: 3,
    unit: 'Module 3 · Two-Finger Power Chords',
    unit_es: 'Módulo 3 · Acordes de potencia con dos dedos',
    title: 'Set 1',
    subtitle: 'Power chord shape · Moving on E & A strings · Muting',
    subtitle_es: 'Forma del acorde de potencia · Moverse por las cuerdas Mi y La · Silenciar cuerdas',
    skillFocus: 'Fretting a clean power chord · Moving the shape along the E and A strings · Reading power-chord TAB',
    skillFocus_es: 'Trastear un acorde de potencia limpio · Mover la forma por las cuerdas Mi y La · Leer TAB de acordes de potencia',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        title_es: 'Estación de computadora — Mira · Escucha · Practica',
        sections: [
          {
            title: 'Watch: what a power chord is',
            title_es: 'Mira: qué es un acorde de potencia',
            steps: [
          {
            label: 'One shape, three chords', label_es: 'Una forma, tres acordes',
            text: 'A power chord is two notes: the root, which names the chord, and the 5th. The 5 in E5 is not a fret number.<ol><li>Watch: <a href="https://www.youtube.com/watch?v=vtcdDira8eE" target="_blank">What Is A Power Chord? – Lauren Bateman</a> (0:00–4:00). Build each shape on your guitar as she plays it.</li><li>Press ▶ to hear the three roots: E, G, A.</li><li>Play each chord below. Put your index finger on the root and your ring finger two frets higher on the next string.</li></ol>You\'ve got it when: you play E5, G5 and A5 with both notes ringing on each one.',
            text_es: 'Un acorde de potencia son dos notas: la raíz, que le da el nombre al acorde, y la quinta. El 5 de E5 no es un número de traste.<ol><li>Mira: <a href="https://www.youtube.com/watch?v=vtcdDira8eE" target="_blank">What Is A Power Chord? – Lauren Bateman</a> (0:00–4:00). Arma cada forma en tu guitarra mientras ella la toca.</li><li>Presiona ▶ para escuchar las tres raíces: E, G, A.</li><li>Toca cada acorde de abajo. Pon tu dedo índice en la raíz y tu dedo anular dos trastes más arriba en la siguiente cuerda.</li></ol>Lo tienes cuando: tocas E5, G5 y A5 con las dos notas sonando en cada uno.',
            hint: 'E5 uses the open low E as its root, so only your ring finger presses. To find the 5th, count five letters up from the root, starting at 1: E F G A B. The 5th of E is B.',
            hint_es: 'E5 usa la Mi grave al aire como raíz, así que solo presiona tu dedo anular. Para encontrar la quinta, cuenta cinco letras hacia arriba desde la raíz, empezando en 1: E F G A B. La quinta de E es B.',
            skills: [1, 2],
            chords: [
              { name: 'E5', chord: [[6,0],[5,2,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 0 },
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
            ],
            playSeq: { label: 'Hear the roots climb (E · G · A)', label_es: 'Escucha subir las raíces (E · G · A)', bpm: 60, notes: [40, 43, 45] },
            response: { type: 'mc', prompt: 'C5 is not shown. Using the same shape, where does your index finger go for C5?',
              prompt_es: 'C5 no se muestra. Con la misma forma, ¿dónde va tu dedo índice para C5?',
              answer: 0,
              explain: 'A power chord is one movable shape, and the note under your index finger names it. Fret 3 of the A string is C (A string: A, B at fret 2, C at fret 3), so C5 starts there. Fret 8 of the low E string is also C (E, F at fret 1, G at fret 3, A at fret 5, B at fret 7, C at fret 8), so C5 works there too. Fret 3 of the low E string is G, which gives G5, and fret 5 of the A string is D, which gives D5.',
              explain_es: 'Un acorde de potencia es una sola forma movible, y la nota bajo tu dedo índice le da el nombre. El traste 3 de la cuerda La es C (cuerda La: A, B en el traste 2, C en el traste 3), así que C5 empieza ahí. El traste 8 de la cuerda Mi grave también es C (E, F en el traste 1, G en el traste 3, A en el traste 5, B en el traste 7, C en el traste 8), así que C5 también funciona ahí. El traste 3 de la cuerda Mi grave es G, que da G5, y el traste 5 de la cuerda La es D, que da D5.',
              // Each choice named one spot until 2026-10-19 (now two spots for the
              // same chord), after Module 3 opened; renamedChoices maps a pick saved
              // under the old text to the new one (the graded path stores the text).
              renamedChoices: {
                'Fret 3 on the A string': 'Fret 3 on the A string, or fret 8 on the low E string',
                'Fret 3 on the low E string': 'Fret 3 on the low E string, or fret 10 on the A string',
                'Fret 5 on the A string': 'Fret 5 on the A string, or fret 10 on the low E string',
                'Fret 5 on the low E string': 'Fret 5 on the low E string, or fret 12 on the A string'
              },
              choices: [
              'Fret 3 on the A string, or fret 8 on the low E string',
              'Fret 3 on the low E string, or fret 10 on the A string',
              'Fret 5 on the A string, or fret 10 on the low E string',
              'Fret 5 on the low E string, or fret 12 on the A string'
            ],
              choices_es: [
              'Traste 3 de la cuerda La, o traste 8 de la cuerda Mi grave',
              'Traste 3 de la cuerda Mi grave, o traste 10 de la cuerda La',
              'Traste 5 de la cuerda La, o traste 10 de la cuerda Mi grave',
              'Traste 5 de la cuerda Mi grave, o traste 12 de la cuerda La'
            ] }
          }
            ]
          },
          {
            title: 'Watch: move the shape',
            title_es: 'Mira: mueve la forma',
            steps: [
          {
            // Hidden 2026-10-16: this video now opens the set, inside the
            // first card ("One shape, three chords"). Kept in the array so
            // no progress key after it moves.
            hidden: true,
            label: 'Watch: what a power chord is', label_es: 'Mira: qué es un acorde de potencia',
            text: 'Watch: <a href="https://www.youtube.com/watch?v=vtcdDira8eE" target="_blank">What Is A Power Chord? Easy Rock Guitar Chords – Lauren Bateman (0:00–4:00)</a>. While you watch, build each shape on your guitar as she plays it. You\'ve got it when: you have built the shape on the low E string and played it three times in a row with both notes sounding together, without looking back at the video.',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=vtcdDira8eE" target="_blank">What Is A Power Chord? Easy Rock Guitar Chords – Lauren Bateman (0:00–4:00)</a>. Mientras miras, arma cada forma en tu guitarra mientras ella la toca. Lo tienes cuando: ya formaste la forma en la cuerda Mi grave y la tocaste tres veces seguidas con las dos notas sonando juntas, sin volver a ver el video.',
            hint: 'Focus on the two-finger shape — which fingers go where, and how the note under your index finger names the chord. Try the shape on your guitar as she shows it.',
            hint_es: 'Fíjate en la forma con dos dedos — qué dedo va dónde, y cómo la nota bajo tu dedo índice le da nombre al acorde. Prueba la forma en tu guitarra mientras ella la muestra.',
            skills: [1, 3],
          },
          {
            label: 'Watch: playing power chords', label_es: 'Mira: tocar acordes de potencia',
            text: 'Watch: <a href="https://youtu.be/DVveuwoVmmY" target="_blank">Your Very First Guitar Power Chord Lesson – Marty Music</a> (0:00–3:00). Slide your shape to A5 and G5 with him. You\'ve got it when: you land both chords in time with the video without pausing it.',
            text_es: 'Mira: <a href="https://youtu.be/DVveuwoVmmY" target="_blank">Your Very First Guitar Power Chord Lesson – Marty Music</a> (0:00–3:00). Desliza tu forma hasta A5 y G5 junto con él. Lo tienes cuando: llegas a los dos acordes a tiempo con el video sin pausarlo.',
            hint: 'Keep the shape the same. Move your whole hand to the new fret.',
            hint_es: 'Mantén la misma forma. Mueve toda la mano al traste nuevo.',
            skills: [2, 4],
            response: { type: 'mc', prompt: 'If you play the same power chord shape with your index finger on the 5th fret of the low E string, what chord is it?',
              prompt_es: 'Si tocas la misma forma de acorde de potencia con tu dedo índice en el traste 5 de la cuerda Mi grave, ¿qué acorde es?',
              answer: 0,
              explain: 'The root sets the name. Fret 5 of the low E is A, so the power chord rooted there is A5.',
              explain_es: 'La raíz determina el nombre. El traste 5 de la Mi grave es A, así que el acorde de potencia con esa raíz es A5.',
              choices: [
              'A5',
              'G5',
              'C5',
              'E5'
            ],
              choices_es: [
              'A5',
              'G5',
              'C5',
              'E5'
            ] }
          }
            ]
          },
          {
            kind: 'reflection',
            title: 'Checkpoint',
            title_es: 'Punto de control',
            steps: [
          {
            label: 'Wrap-up: today\'s hardest part', label_es: 'Cierre: lo más difícil de hoy',
            text: 'Checkpoint — pause and think: which felt harder today — getting both notes to ring clean, or building the shape quickly from the diagram? What started to help?',
            text_es: 'Punto de control — pausa y piensa: ¿qué se sintió más difícil hoy — lograr que las dos notas suenen limpias, o armar la forma rápido a partir del diagrama? ¿Qué empezó a ayudarte?',
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — power chord drill',
        title_es: 'Estación de práctica — ejercicio de acordes de potencia',
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
                hint: 'Tuning (Module 1) is a skill you keep forever. 60 seconds here makes everything today sound better.',
                hint_es: 'Afinar (Módulo 1) es una destreza que conservas para siempre. 60 segundos aquí hacen que todo suene mejor hoy.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Play a clean power chord and mute the other strings',
            title_es: 'Toca un acorde de potencia limpio y silencia las demás cuerdas',
            steps: [
          {
            label: 'Challenge 1 — Clean E5', label_es: 'Reto 1 — E5 limpio',
            text: '<ol><li>Put your ring finger on the A string, fret 2. Leave the low E open.</li><li>Strum only the low E and A strings.</li><li>Lift your hand off and play it again.</li></ol>You\'ve got it when: you play three E5s in a row with no buzz and no other strings ringing.',
            text_es: '<ol><li>Pon tu dedo anular en la cuerda La, traste 2. Deja la Mi grave al aire.</li><li>Rasguea solo las cuerdas Mi grave y La.</li><li>Levanta la mano y tócalo otra vez.</li></ol>Lo tienes cuando: tocas tres E5 seguidos sin zumbido y sin que suenen otras cuerdas.',
            hint: 'Press with the tip of your ring finger, just behind the fret wire.',
            hint_es: 'Presiona con la punta de tu dedo anular, justo detrás del traste.',
            stuck: 'Pluck the two strings one at a time. Make each one ring. Then strum them together.',
            stuck_es: 'Pulsa las dos cuerdas una a la vez. Haz que cada una suene. Luego rasguéalas juntas.',
            levelUp: 'Lift off and play the chord 5 times in a row, clean each time.',
            levelUp_es: 'Levanta la mano y toca el acorde 5 veces seguidas, limpio cada vez.',
            skills: [1, 3],
            chords: [
              { name: 'E5', chord: [[6,0],[5,2,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 0 }
            ]
          },
          {
            label: 'Challenge 2 — Mute Check', label_es: 'Reto 2 — Revisión de silenciado',
            text: '<ol><li>Play your E5.</li><li>Lay your index finger flat across the D, G, B and high e strings. Touch them. Do not press.</li><li>Strum all six strings softly. Check that those four strings stay silent.</li><li>Strum all six strings hard.</li></ol>You\'ve got it when: you strum all six strings hard and only the two chord notes ring.',
            text_es: '<ol><li>Toca tu E5.</li><li>Coloca tu dedo índice plano sobre las cuerdas Re, Sol, Si y mi aguda. Tócalas. No presiones.</li><li>Rasguea suave las seis cuerdas. Comprueba que esas cuatro cuerdas queden en silencio.</li><li>Rasguea fuerte las seis cuerdas.</li></ol>Lo tienes cuando: rasgueas fuerte las seis cuerdas y solo suenan las dos notas del acorde.',
            hint: 'Your fretting hand mutes the thinner strings. Later, on chords with the root on the A string, the tip of your index finger also mutes the low E.',
            hint_es: 'Tu mano de trastear silencia las cuerdas más delgadas. Más adelante, en los acordes con la raíz en la cuerda La, la punta de tu dedo índice también silencia la Mi grave.',
            stuck: 'Pluck each of the four muted strings one at a time. Move your index finger until each one makes only a dull click.',
            stuck_es: 'Pulsa cada una de las cuatro cuerdas silenciadas, una a la vez. Mueve tu dedo índice hasta que cada una haga solo un clic apagado.',
            levelUp: 'Do the same on G5 and A5.',
            levelUp_es: 'Haz lo mismo con G5 y A5.',
            skills: [3]
          }
            ]
          },
          {
            title: 'Move the shape on the low E and A strings',
            title_es: 'Mueve la forma en las cuerdas Mi grave y La',
            steps: [
          {
            label: 'Challenge 3 — Shape Shifter', label_es: 'Reto 3 — Cambiaformas',
            text: 'Move the same shape to each chord. Say its name out loud.<ol><li>A5: low E string, fret 5.</li><li>G5: low E string, fret 3.</li><li>D5: A string, fret 5.</li><li>C5: A string, fret 3.</li></ol>You\'ve got it when: you play all four clean without changing the shape.',
            text_es: 'Mueve la misma forma a cada acorde. Di su nombre en voz alta.<ol><li>A5: cuerda Mi grave, traste 5.</li><li>G5: cuerda Mi grave, traste 3.</li><li>D5: cuerda La, traste 5.</li><li>C5: cuerda La, traste 3.</li></ol>Lo tienes cuando: tocas las cuatro limpias sin cambiar la forma.',
            hint: 'The space between your two fingers never changes. Move your whole hand.',
            hint_es: 'La distancia entre tus dos dedos nunca cambia. Mueve toda la mano.',
            stuck: 'Switch between G5 and A5 only. Add the A-string chords when that switch is smooth.',
            stuck_es: 'Cambia solo entre G5 y A5. Agrega los acordes de la cuerda La cuando ese cambio salga fluido.',
            levelUp: 'Run the deck below. Find each chord within 3 seconds without counting frets.',
            levelUp_es: 'Corre la baraja de abajo. Encuentra cada acorde en menos de 3 segundos sin contar trastes.',
            skills: [2, 4],
            drill: { type: 'deck', deck: 'power-chord-shapes' },
            chords: [
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'C5', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
            ]
          },
          {
            label: 'Mute Check — A-string chords', label_es: 'Revisión de silenciado — acordes en la cuerda La',
            text: 'C5 and D5 have the root on the A string. The low E must stay silent.<ol><li>Play C5: A string, fret 3.</li><li>Lean the tip of your index finger back so it touches the low E string.</li><li>Lay your index finger flat across the thin strings.</li><li>Strum all six strings hard.</li><li>Do the same on D5: A string, fret 5.</li></ol>You\'ve got it when: you play three hard strums on C5 and three on D5, and only the two chord notes ring each time.',
            text_es: 'C5 y D5 tienen la raíz en la cuerda La. La Mi grave tiene que quedar en silencio.<ol><li>Toca C5: cuerda La, traste 3.</li><li>Inclina la punta de tu dedo índice hacia atrás para que toque la cuerda Mi grave.</li><li>Coloca tu dedo índice plano sobre las cuerdas delgadas.</li><li>Rasguea fuerte las seis cuerdas.</li><li>Haz lo mismo con D5: cuerda La, traste 5.</li></ol>Lo tienes cuando: tocas tres rasgueos fuertes en C5 y tres en D5, y solo suenan las dos notas del acorde cada vez.',
            hint: 'If the low E still rings, also rest the side of your strumming hand on it.',
            hint_es: 'Si la Mi grave sigue sonando, apoya también el borde de tu mano de rasgueo sobre ella.',
            stuck: 'Hold C5 and pluck only the low E. If you hear a note, lean your index fingertip back until it stops. Then strum.',
            stuck_es: 'Sostén C5 y pulsa solo la Mi grave. Si oyes una nota, inclina la punta del índice hacia atrás hasta que pare. Luego rasguea.',
            levelUp: 'Switch C5, G5, C5, G5 with hard strums. The low E rings on G5 and stays silent on C5.',
            levelUp_es: 'Cambia C5, G5, C5, G5 con rasgueos fuertes. La Mi grave suena en G5 y queda en silencio en C5.',
            skills: [3, 4],
            chords: [
              { name: 'C5', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
            ]
          }
            ]
          },
          {
            title: 'Name each root as you move up the neck',
            title_es: 'Nombra cada raíz mientras subes por el mástil',
            steps: [
          {
            label: 'Challenge 4 — Name & Climb (E string)', label_es: 'Reto 4 — Nombra y sube (cuerda Mi)',
            text: 'Move the shape up the low E string. Say each root out loud as you play it.<ol><li>E5: open.</li><li>F5: fret 1.</li><li>G5: fret 3.</li><li>A5: fret 5.</li><li>B5: fret 7.</li><li>C5: fret 8.</li><li>D5: fret 10.</li></ol>You\'ve got it when: you name every root correctly up to D5 without looking at the chart.',
            text_es: 'Mueve la forma hacia arriba por la cuerda Mi grave. Di cada raíz en voz alta al tocarla.<ol><li>E5: al aire.</li><li>F5: traste 1.</li><li>G5: traste 3.</li><li>A5: traste 5.</li><li>B5: traste 7.</li><li>C5: traste 8.</li><li>D5: traste 10.</li></ol>Lo tienes cuando: nombras cada raíz correctamente hasta D5 sin mirar el diagrama.',
            hint: 'These are the low E string notes from Module 2. The root is under your index finger. Play only the natural notes, with no sharps.',
            hint_es: 'Estas son las notas de la cuerda Mi grave del Módulo 2. La raíz está bajo tu dedo índice. Toca solo las notas naturales, sin sostenidos.',
            stuck: 'Play frets 0 to 7 first (E5 to B5). Add frets 8 and 10 when those are easy.',
            stuck_es: 'Toca primero los trastes 0 a 7 (E5 a B5). Agrega los trastes 8 y 10 cuando esos te salgan fácil.',
            levelUp: 'Name your way back down from D5 to E5 without counting. Then run the shuffle drill below.',
            levelUp_es: 'Nombra el camino de regreso desde D5 hasta E5 sin contar. Luego corre el ejercicio de mezcla de abajo.',
            skills: [2],
            drill: { type: 'shuffle', string: 'lowE', maxFret: 12, rounds: 10, seconds: 3, pile: 'naturals', skill: 'm3w1-s2' },
            chords: [
              { name: 'E5', chord: [[6,0],[5,2,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 0 },
              { name: 'F5', chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 1 },
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'B5', chord: [[6,7,'1'],[5,9,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 7 },
              { name: 'C5', chord: [[6,8,'1'],[5,10,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 8 },
              { name: 'D5', chord: [[6,10,'1'],[5,12,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 10 }
            ]
          },
          {
            label: 'Challenge 5 — Name & Climb (A string)', label_es: 'Reto 5 — Nombra y sube (cuerda La)',
            text: 'Move the shape up the A string. Say each root out loud as you play it.<ol><li>A5: open.</li><li>B5: fret 2.</li><li>C5: fret 3.</li><li>D5: fret 5.</li><li>E5: fret 7.</li><li>F5: fret 8.</li><li>G5: fret 10.</li></ol>You\'ve got it when: you name every root correctly up to G5, and the low E stays silent on every chord.',
            text_es: 'Mueve la forma hacia arriba por la cuerda La. Di cada raíz en voz alta al tocarla.<ol><li>A5: al aire.</li><li>B5: traste 2.</li><li>C5: traste 3.</li><li>D5: traste 5.</li><li>E5: traste 7.</li><li>F5: traste 8.</li><li>G5: traste 10.</li></ol>Lo tienes cuando: nombras cada raíz correctamente hasta G5, y la Mi grave queda en silencio en cada acorde.',
            hint: 'These are the A string notes from Module 2. Mute the low E with the tip of your index finger.',
            hint_es: 'Estas son las notas de la cuerda La del Módulo 2. Silencia la Mi grave con la punta de tu dedo índice.',
            stuck: 'Play frets 0 to 5 first (A5 to D5) without looking at the chart. Then add the rest.',
            stuck_es: 'Toca primero los trastes 0 a 5 (A5 a D5) sin mirar el diagrama. Luego agrega el resto.',
            levelUp: 'Run the shuffle drill below. Name each root as soon as it appears.',
            levelUp_es: 'Corre el ejercicio de mezcla de abajo. Nombra cada raíz en cuanto aparezca.',
            skills: [4],
            drill: { type: 'shuffle', string: 'A', maxFret: 12, rounds: 10, seconds: 3, pile: 'naturals', skill: 'm3w1-s4' },
            chords: [
              { name: 'A5', chord: [[6,'x'],[5,0],[4,2,'3'],[3,'x'],[2,'x'],[1,'x']], position: 0 },
              { name: 'B5', chord: [[6,'x'],[5,2,'1'],[4,4,'3'],[3,'x'],[2,'x'],[1,'x']], position: 2 },
              { name: 'C5', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'E5', chord: [[6,'x'],[5,7,'1'],[4,9,'3'],[3,'x'],[2,'x'],[1,'x']], position: 7 },
              { name: 'F5', chord: [[6,'x'],[5,8,'1'],[4,10,'3'],[3,'x'],[2,'x'],[1,'x']], position: 8 },
              { name: 'G5', chord: [[6,'x'],[5,10,'1'],[4,12,'3'],[3,'x'],[2,'x'],[1,'x']], position: 10 }
            ]
          }
            ]
          },
          {
            title: 'Mystery Chart — name chords from the chart',
            title_es: 'Diagrama misterioso — nombra acordes a partir del diagrama',
            steps: [
              {
                label: 'Challenge 6 — Mystery Chart', label_es: 'Reto 6 — Diagrama misterioso',
                text: 'The three charts below have no names.<ol><li>Find the root. It is the dot nearest the thick strings, where your index finger goes.</li><li>Name the root\'s string and fret.</li><li>Name that note and add 5. That is the chord.</li><li>Say all three chords out loud, left to right.</li></ol>Then answer the question below.',
                text_es: 'Los tres diagramas de abajo no tienen nombre.<ol><li>Encuentra la raíz. Es el punto más cercano a las cuerdas gruesas, donde va tu dedo índice.</li><li>Nombra la cuerda y el traste de la raíz.</li><li>Nombra esa nota y agrégale un 5. Ese es el acorde.</li><li>Di los tres acordes en voz alta, de izquierda a derecha.</li></ol>Luego responde la pregunta de abajo.',
                hint: 'You learned these notes on the low E and A strings in Module 2.',
                hint_es: 'Aprendiste estas notas de las cuerdas Mi grave y La en el Módulo 2.',
                stuck: 'Count up the string one fret at a time from the open note. Say the musical alphabet as you go (low E: E F F# G … A string: A A# B C …). Where you stop is the root.',
                stuck_es: 'Cuenta hacia arriba por la cuerda, un traste a la vez desde la nota al aire. Di el alfabeto musical mientras avanzas (Mi grave: E F F# G … cuerda La: A A# B C …). Donde te detienes es la raíz.',
                levelUp: 'Open a song on the Songs page. For each power chord, say the string and fret of the root before you play it.',
                levelUp_es: 'Abre una canción en la página de Canciones. Para cada acorde de potencia, di la cuerda y el traste de la raíz antes de tocarlo.',
                skills: [6],
                chords: [
                  { chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
                  { chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
                  { chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
                ],
                response: { type: 'mc', prompt: 'Left to right, the three unlabelled diagrams are which chords?',
                  prompt_es: 'De izquierda a derecha, ¿qué acordes son los tres diagramas sin etiquetar?',
                  answer: 0,
                  explain: 'G5 · C5 · A5. The first roots on the low E string at fret 3 (G), the second on the A string at fret 3 (C), the third on the low E string at fret 5 (A). Same shape all three times — only the root moves, and the root is what names the chord.',
                  explain_es: 'G5 · C5 · A5. El primero tiene la raíz en la cuerda Mi grave, traste 3 (G); el segundo en la cuerda La, traste 3 (C); el tercero en la Mi grave, traste 5 (A). La misma forma las tres veces — solo se mueve la raíz, y la raíz es la que le da nombre al acorde.',
                  choices: ['G5 · C5 · A5', 'E5 · A5 · G5', 'G5 · A5 · C5', 'C5 · G5 · D5'],
                  choices_es: ['G5 · C5 · A5', 'E5 · A5 · G5', 'G5 · A5 · C5', 'C5 · G5 · D5'] }
              }
            ]
          },
          {
            title: 'Play the "Watchtower" loop in time',
            title_es: 'Toca la vuelta de "Watchtower" a tiempo',
            steps: [
          {
            label: 'Challenge 7 — "Watchtower" Loop (assessment preparation)', label_es: 'Reto 7 — Vuelta de "Watchtower" (preparación para la evaluación)',
            text: '<ol><li>Count each bar out loud: 1 + 2 + 3 + 4 +.</li><li>Bar 1: strum A5 on 1, +, 2. Strum G5 on the + after 3 and on 4.</li><li>Bar 2: strum F5 on 1, +, 2. Strum G5 on the + after 3 and on 4.</li><li>Repeat at 60 BPM.</li></ol>In the TAB, two numbers in one column mean you play both strings together. You\'ve got it when: you play the loop four times with every strum on its count and no stops.',
            text_es: '<ol><li>Cuenta cada compás en voz alta: 1 + 2 + 3 + 4 +.</li><li>Compás 1: rasguea A5 en 1, +, 2. Rasguea G5 en el + después del 3 y en el 4.</li><li>Compás 2: rasguea F5 en 1, +, 2. Rasguea G5 en el + después del 3 y en el 4.</li><li>Repite a 60 BPM.</li></ol>En el TAB, dos números en una columna significan que tocas las dos cuerdas juntas. Lo tienes cuando: tocas la vuelta cuatro veces con cada rasgueo en su conteo y sin detenerte.',
            hint: 'All three roots are on the low E string: A5 at fret 5, G5 at fret 3, F5 at fret 1. Keep the shape and slide your whole hand.',
            hint_es: 'Las tres raíces están en la cuerda Mi grave: A5 en el traste 5, G5 en el traste 3, F5 en el traste 1. Mantén la forma y desliza toda la mano.',
            stuck: 'Play only A5 and G5 until that change is clean. Then add F5.',
            stuck_es: 'Toca solo A5 y G5 hasta que ese cambio salga limpio. Luego agrega F5.',
            levelUp: 'Play it at 70 BPM. Then play it from memory without the TAB.',
            levelUp_es: 'Tócalo a 70 BPM. Luego tócalo de memoria sin el TAB.',
            skills: [2, 5, 6],
            chords: [
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'G5',  chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'F5',  chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 1 }
            ],
            tab: {
              caption: '"Watchtower" loop — A5 · G5 · F5 · G5, count 1 + 2 (rest) + 4 · 60 BPM',
              caption_es: 'Vuelta de "Watchtower" — A5 · G5 · F5 · G5, cuenta 1 + 2 (silencio) + 4 · 60 BPM',
              notes: [
                { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45], beats: 0.5 },
                { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45], beats: 0.5 },
                { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45], beats: 1.5 },
                { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43], beats: 0.5 },
                { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43], beats: 1 },
                { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41], beats: 0.5 },
                { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41], beats: 0.5 },
                { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41], beats: 1.5 },
                { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43], beats: 0.5 },
                { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43], beats: 1 }
              ]
            },
          }
            ]
          },
          {
            kind: 'take-to-song',
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Seven Nation Army", verse riff', label_es: 'Reto — "Seven Nation Army", riff de la estrofa',
                text: '<ul><li>Play the riff (a short musical phrase that repeats) as two-string power chords sliding along the A string, one chord per riff note at 60 BPM.</li></ul>You\'ve got it when: two clean laps in a row, both strings of every chord ringing. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
                text_es: '<ul><li>Toca el riff (una frase musical corta que se repite) como acordes de potencia de dos cuerdas deslizándose por la cuerda La, un acorde por nota del riff a 60 BPM.</li></ul>Lo tienes cuando: dos vueltas limpias seguidas, con ambas cuerdas de cada acorde sonando. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 3 de 5</a>.',
                hint: 'It\'s one shape sliding — keep your grip and let your arm do the moving.',
                hint_es: 'Es una sola forma deslizándose — mantén el agarre y deja que tu brazo haga el movimiento.',
                stuck: 'Play roots-only (your Module 2 line), then add the second string back one chord at a time.',
                stuck_es: 'Toca solo las raíces (tu línea del Módulo 2), y luego agrega de vuelta la segunda cuerda un acorde a la vez.',
                levelUp: 'Palm-mute the whole lap for the verse sound, then open up for a chorus lap. To palm-mute, rest the side of your picking hand lightly on the strings right where they leave the bridge — the notes come out short and quiet.',
                levelUp_es: 'Silencia con la palma toda la vuelta para el sonido de la estrofa, y luego abre el sonido para una vuelta de coro. Para silenciar con la palma, apoya el borde de tu mano de la púa suavemente sobre las cuerdas justo donde salen del puente — las notas suenan cortas y apagadas.',
                skills: [2, 5, 6],
                tab: {
                  caption: '"Seven Nation Army" — verse riff as power chords · 60 BPM',
                  caption_es: '"Seven Nation Army" — riff de la estrofa como acordes de potencia · 60 BPM',
                  notes: [
                    { frets: [['D', 9],  ['A', 7]],  note: 'E5', midi: [59, 52] },
                    { frets: [['D', 9],  ['A', 7]],  note: 'E5', midi: [59, 52] },
                    { frets: [['D', 12], ['A', 10]], note: 'G5', midi: [62, 55] },
                    { frets: [['D', 9],  ['A', 7]],  note: 'E5', midi: [59, 52] },
                    { frets: [['D', 7],  ['A', 5]],  note: 'D5', midi: [57, 50] },
                    { frets: [['D', 5],  ['A', 3]],  note: 'C5', midi: [55, 48] },
                    { frets: [['D', 4],  ['A', 2]],  note: 'B5', midi: [54, 47] }
                  ]
                },
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
                text: 'Plan your practice — this one\'s just for you, never graded. Take two minutes to update your routine:<ol><li>One thing you want to get better at.</li><li>When and where you\'ll practice this week.</li><li>How last week\'s plan went.</li></ol>Same check-in as Modules 1 and 2 — you\'ll keep it going through the whole course.',
                text_es: 'Planea tu práctica — esta parte es solo para ti, nunca se califica. Tómate dos minutos para actualizar tu rutina:<ol><li>Una cosa en la que quieres mejorar.</li><li>Cuándo y dónde vas a practicar esta semana.</li><li>Cómo te fue con el plan de la semana pasada.</li></ol>El mismo check-in de los Módulos 1 y 2 — lo vas a mantener durante todo el curso.',
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
                label: 'Wrap-up: your shaky spot', label_es: 'Cierre: tu punto inestable',
                text: 'Which power chord change or muting move still feels shaky? Write it below — that\'s your warm-up target next time you practice.',
                text_es: '¿Qué cambio de acorde de potencia o movimiento de silenciado todavía se siente inestable? Escríbelo abajo — ese es tu objetivo de calentamiento la próxima vez que practiques.',
              }
            ]
          },
          {
            kind: 'ear-spark',
            title: 'Ear Spark — optional ear bonus',
            title_es: 'Chispa auditiva — bono opcional de oído',
            steps: [
              {
                label: 'Ear Spark: E5 vs. E major', label_es: 'Chispa auditiva: E5 vs. E mayor',
                text: 'Ear Spark (optional, 2 min):<ol><li>First, build a full open E major — it\'s your E5 (open low E + A string, 2nd fret) with two notes added: G string, 1st fret and D string, 2nd fret, letting the open B and high e ring too (index on G string fret 1, middle on A string fret 2, ring on D string fret 2) — you\'ll meet chords like this properly in Module 4.</li><li>Run the deck below — it deals you "E5" or "E". Play whichever chord it names, a few reps of each.</li><li>Listen for the difference each time.</li></ol>',
                text_es: 'Chispa auditiva (opcional, 2 min):<ol><li>Primero, arma un E mayor al aire completo — es tu E5 (Mi grave al aire + cuerda La, traste 2) con dos notas agregadas: cuerda Sol, traste 1 y cuerda Re, traste 2, dejando sonar también la Si y la mi aguda al aire (índice en la cuerda Sol traste 1, medio en la cuerda La traste 2, anular en la cuerda Re traste 2) — conocerás bien acordes así en el Módulo 4.</li><li>Corre la baraja de abajo — te reparte "E5" o "E". Toca el acorde que indique, varias repeticiones de cada uno.</li><li>Escucha la diferencia cada vez.</li></ol>',
                hint: 'What you\'re listening for each time: power chords are hollow, with no major/minor color.',
                hint_es: 'Lo que escuchas cada vez: los acordes de potencia suenan huecos, sin color mayor o menor.',
                drill: { type: 'deck', deck: 'e5-vs-emajor' }
              }
            ]
          }
        ]
      }
    },

    skills: [
      { id: 'm3w1-s1', text: 'Fret a clean 2-finger power chord with no buzzing',
        text_es: 'Trastear un acorde de potencia limpio con dos dedos sin zumbido',
        gotItWhen: 'both notes ring clearly when you strum, with no buzz and no muffled strings — and it sounds the same every time you play it.',
        gotItWhen_es: 'las dos notas suenan claramente al rasguear, sin zumbido y sin cuerdas apagadas — y suena igual cada vez que lo tocas.',
        practice: { type: 'mc', prompt: 'A power chord is built from which two scale degrees (a scale degree = a note\'s number in the scale, counting up from the root)?',
          prompt_es: '¿Un acorde de potencia se construye con cuáles dos grados de la escala (un grado de la escala = el número de una nota en la escala, contando desde la raíz)?',
          choices: ['Root + 3rd', 'Root + 5th', 'Root + 7th', 'Root + octave'],
          choices_es: ['Raíz + 3ª', 'Raíz + 5ª', 'Raíz + 7ª', 'Raíz + octava'], answer: 1,
          explain: 'A power chord is just the root and the 5th. It leaves out the 3rd — the note that would make a chord sound major or happy, or minor or sad — which is exactly why it fits over almost anything.',
          explain_es: 'Un acorde de potencia es solo la raíz y la 5ª. Deja fuera la 3ª — la nota que haría que un acorde sonara mayor o alegre, o menor o triste — y por eso mismo encaja sobre casi cualquier cosa.' } },
      { id: 'm3w1-s2', text: 'Move the power chord shape along the low E string (E5, G5, A5, B5)',
        text_es: 'Mover la forma del acorde de potencia por la cuerda Mi grave (E5, G5, A5, B5)',
        gotItWhen: 'you can move the same shape to any of those positions right away and name the chord without counting frets.',
        gotItWhen_es: 'puedes mover la misma forma a cualquiera de esas posiciones de inmediato y nombrar el acorde sin contar trastes.',
        practice: { type: 'mc', prompt: 'Your index finger is on the low E string at fret 5. Which power chord are you playing?',
          prompt_es: 'Tu dedo índice está en la cuerda Mi grave, traste 5. ¿Qué acorde de potencia estás tocando?',
          choices: ['G5', 'A5', 'B5', 'D5'], choices_es: ['G5', 'A5', 'B5', 'D5'], answer: 1,
          explain: 'The note under your index finger names the chord, and the low E string at fret 5 is A — so A5. Fret 3 would give you G5, and fret 7 would give you B5.',
          explain_es: 'La nota bajo tu dedo índice le da nombre al acorde, y la cuerda Mi grave en el traste 5 es A — así que A5. El traste 3 te daría G5, y el traste 7 te daría B5.' } },
      { id: 'm3w1-s3', text: 'Mute unused strings with palm and fretting hand',
        text_es: 'Silenciar las cuerdas que no usas con la palma y la mano de trastear',
        gotItWhen: 'you strum all 6 strings hard and only the two chord notes ring. Your fretting hand mutes the thinner strings. On A-string chords, the tip of your index finger also mutes the low E.',
        gotItWhen_es: 'rasgueas fuerte las 6 cuerdas y solo suenan las dos notas del acorde. Tu mano de trastear silencia las cuerdas más delgadas. En los acordes de la cuerda La, la punta de tu dedo índice también silencia la Mi grave.',
        practice: { type: 'mc', prompt: 'You strum all 6 strings on an E-root power chord, but extra strings keep ringing. What\'s the real fix?',
          prompt_es: 'Rasgueas las 6 cuerdas en un acorde de potencia con raíz en Mi, pero siguen sonando cuerdas de más. ¿Cuál es el verdadero arreglo?',
          choices: ['Strum much more softly', 'Aim your strum so carefully that you only ever hit the two strings you want', 'Let your fretting fingers lean lightly against the unused strings to mute them', 'Press the unused strings all the way down with spare fingers'],
          choices_es: ['Rasguear mucho más suave', 'Apuntar tu rasgueo con tanto cuidado que solo golpees las dos cuerdas que quieres', 'Apoyar suavemente los dedos de trastear en las cuerdas sin usar para silenciarlas', 'Presionar las cuerdas sin usar hasta el fondo con los dedos libres'], answer: 2,
          explain: 'Muting comes from the fretting hand touching — not pressing — the strings you don\'t want. Aiming the strum at only two strings is not reliable. Guitarists strum all the strings and let the mute stop the extra ones.',
          explain_es: 'El silenciado viene de la mano de trastear tocando — sin presionar — las cuerdas que no quieres. Apuntar el rasgueo a solo dos cuerdas no es confiable. Los guitarristas rasguean todas las cuerdas y dejan que el silenciado detenga las que sobran.' } },
      { id: 'm3w1-s4', text: 'Move the power chord shape along the A string (A5, C5, D5)',
        text_es: 'Mover la forma del acorde de potencia por la cuerda La (A5, C5, D5)',
        gotItWhen: 'you can shift the shape to the A-string root without the sound breaking up — and the low E string stays silent.',
        gotItWhen_es: 'puedes desplazar la forma a la raíz de la cuerda La sin que se corte el sonido — y la cuerda Mi grave se queda en silencio.',
        practice: { type: 'mc', prompt: 'Your index finger is on the A string at fret 3. Which power chord are you playing?',
          prompt_es: 'Tu dedo índice está en la cuerda La, traste 3. ¿Qué acorde de potencia estás tocando?',
          choices: ['B5', 'C5', 'D5', 'A5'], choices_es: ['B5', 'C5', 'D5', 'A5'], answer: 1,
          explain: 'Your index finger sits on the root, and the A string at fret 3 is C — so C5. That same fret on the low E string would be G5, which is the easy mix-up once you start moving between the two root strings.',
          explain_es: 'Tu dedo índice va sobre la raíz, y la cuerda La en el traste 3 es C — así que C5. Ese mismo traste en la cuerda Mi grave sería G5, y esa es la confusión fácil cuando empiezas a moverte entre las dos cuerdas de raíz.' } },
      { id: 'm3w1-s5', text: 'Play a power chord on the beat with a single down-strum',
        text_es: 'Tocar un acorde de potencia a tiempo con un solo rasgueo hacia abajo',
        gotItWhen: 'your strum lands on beat 1 with the metronome and the chord rings cleanly — no early or late attacks.',
        gotItWhen_es: 'tu rasgueo cae en el tiempo 1 con el metrónomo y el acorde suena limpio — sin ataques adelantados ni atrasados.',
        practice: { type: 'playSeq', label: 'One down-strum per click — E5 then G5 roots', label_es: 'Un rasgueo hacia abajo por clic — raíces de E5 y luego G5', bpm: 60,
          notes: [40, 40, 40, 40, 43, 43, 43, 43] } },
      { id: 'm3w1-s6', text: 'Read a basic power chord TAB or chord symbol (e.g. A5, G5)',
        text_es: 'Leer un TAB básico de acordes de potencia o un símbolo de acorde (p. ej. A5, G5)',
        gotItWhen: 'you can see "A5" or "G5" on a chart and instantly know which fret your index finger goes on, on which string.',
        gotItWhen_es: 'puedes ver "A5" o "G5" en un diagrama y saber al instante en qué traste y qué cuerda va tu dedo índice.',
        practice: { type: 'mc', prompt: 'You see "A5" written above a bar. What does it mean?',
          prompt_es: 'Ves "A5" escrito sobre un compás. ¿Qué significa?',
          choices: ['Play just the A note', 'A power chord rooted on A', 'A major chord', 'Play the 5th fret on A string'],
          choices_es: ['Tocar solo la nota A', 'Un acorde de potencia con raíz en A', 'Un acorde mayor', 'Tocar el traste 5 de la cuerda La'], answer: 1,
          explain: 'A "5" after the letter always means power chord — root plus 5th — so A5 is a power chord with A as its root. The 5 is not a fret number, which is the usual first guess.',
          explain_es: 'Un "5" después de la letra siempre significa acorde de potencia — raíz más 5ª — así que A5 es un acorde de potencia con A como raíz. El 5 no es un número de traste, aunque esa suele ser la primera suposición.' } }
    ]
  },

  {
    id: 'm3w2',
    songThread: [{ name: '"Luna"', journey: 'tabs/luna.html', layer: 3, note: 'the F5–A5 vamp' }, { name: '"Sweet Child O\' Mine"', journey: 'tabs/sweet-child-o-mine.html', layer: 3, note: 'Assessment preparation: the D5–C5–G5 progression' }, { name: '"All Along the Watchtower"', journey: 'tabs/all-along-the-watchtower.html', layer: 3, note: 'the A5–G5–F5 loop' }, { name: '"the cure"', journey: 'tabs/the-cure.html', layer: 3, note: 'the changes as power chords' }],
    label: 'Set 2',
    locked: false,
    module: 'Two-Finger Power Chords',
    moduleNum: 3,
    unit: 'Module 3 · Two-Finger Power Chords',
    unit_es: 'Módulo 3 · Acordes de potencia con dos dedos',
    title: 'Set 2',
    subtitle: 'Power chords with metronome · Chord changes · Strumming patterns',
    subtitle_es: 'Acordes de potencia con metrónomo · Cambios de acorde · Patrones de rasgueo',
    skillFocus: 'Changing power chords in time · Building speed with a metronome · Playing a song progression',
    skillFocus_es: 'Cambiar acordes de potencia a tiempo · Ganar velocidad con un metrónomo · Tocar la progresión de una canción',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        title_es: 'Estación de computadora — Mira · Escucha · Practica',
        sections: [
          {
            title: 'Watch: play with a metronome',
            title_es: 'Mira: toca con un metrónomo',
            steps: [
          {
            label: 'Watch: using a metronome', label_es: 'Mira: usar el metrónomo',
            text: 'Watch: <a href="https://youtu.be/sNa44EmrsDc" target="_blank">How & Why to Use a Metronome – JustinGuitar</a> (0:00–4:00). Set your own metronome and tap along with it. You\'ve got it when: you tap along with your metronome for one full minute.',
            text_es: 'Mira: <a href="https://youtu.be/sNa44EmrsDc" target="_blank">How & Why to Use a Metronome – JustinGuitar</a> (0:00–4:00). Pon tu propio metrónomo y sigue el pulso con la mano. Lo tienes cuando: sigues el pulso de tu metrónomo con la mano durante un minuto completo.',
            hint: 'Watch his strumming hand and copy it.',
            hint_es: 'Fíjate en su mano de rasgueo y cópiala.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'According to the video, what is the first thing to practice with a metronome?',
              prompt_es: 'Según el video, ¿qué es lo primero que hay que practicar con el metrónomo?',
              answer: 0,
              explain: 'Justin starts as simply as it gets: one down strum on each click, sitting right on the beat — not a little early, not a little late. Most beginners rush. Chasing the fastest tempo you can reach, or playing a whole song at full speed, comes much later; the exercise here is landing with the click every time.',
              explain_es: 'Justin empieza de la forma más simple posible: un rasgueo hacia abajo en cada clic, justo sobre el pulso — ni un poco antes, ni un poco después. La mayoría de los principiantes se apuran. Buscar el tempo más rápido que puedas alcanzar, o tocar una canción entera a toda velocidad, viene mucho después; el ejercicio aquí es caer con el clic cada vez.',
              choices: [
              'A single stroke on each click, landing with it',
              'A different strum pattern on every click',
              'The fastest tempo you can reach without stopping',
              'A full song at its real speed, all the way through'
            ],
              choices_es: [
              'Un solo golpe en cada clic, cayendo junto con él',
              'Un patrón de rasgueo distinto en cada clic',
              'El tempo más rápido que puedas alcanzar sin parar',
              'Una canción completa a su velocidad real, de principio a fin'
            ] }
          },
          {
            // Hidden 2026-10-16 (Module 3 trim): a bonus video the set never
            // needed. Kept in the array so no progress key after it moves.
            hidden: true,
            label: 'Watch: easy rock songs to explore', label_es: 'Mira: canciones de rock fáciles para explorar',
            text: 'Watch: <a href="https://youtu.be/m3dYOsXbWII?t=20" target="_blank">Easy Electric Guitar Songs Everyone Should Know – Marty Music</a> (0:20–3:00). This one is a bonus. The set is complete without it. While you watch, pick one song you recognize and try to play along with it. You\'ve got it when: you have played along with one song for eight bars in a row without losing the beat.',
            text_es: 'Mira: <a href="https://youtu.be/m3dYOsXbWII?t=20" target="_blank">Easy Electric Guitar Songs Everyone Should Know – Marty Music</a> (0:20–3:00). Esto es un bono. La unidad está completa sin él. Mientras miras, elige una canción que reconozcas e intenta tocarla junto con el video. Lo tienes cuando: ya tocaste junto con una canción durante ocho compases seguidos sin perder el pulso.',
            hint: 'Pick one song you recognize and try to play along as it plays. Match the strum timing to what you hear.',
            hint_es: 'Elige una canción que reconozcas e intenta tocarla junto con el video. Iguala el momento del rasgueo con lo que escuchas.',
            // No `skills:` tag on purpose (2026-10-01). This is the bonus
            // video — "the set is complete without it" — and tagged [3, 4]
            // it was the FIRST step carrying those skills, so "Show me where"
            // on the Eighth-Note Strum and E-root/A-root skills opened a
            // bonus video instead of the step that teaches them.
          },
          {
            // Hidden 2026-10-16 (Module 3 trim): single-note picking, off
            // the set's topic (power-chord changes and strumming). Kept in
            // the array so no progress key moves.
            hidden: true,
            label: 'Watch: alternate picking', label_es: 'Mira: púa alterna',
            text: 'Watch: <a href="https://youtu.be/q8SHmo1-dac" target="_blank">3 Tips to NAIL Alternate Picking (build speed) – JustinGuitar</a> (0:00–3:00). Alternate picking means strict down-up-down-up — every downstroke is followed by an upstroke, so the pick never travels the same way twice in a row. Watch his tempo-step method for building speed. You\'ve got it when: you have played eight notes on one string with strict down-up picking, three times in a row, with no two downstrokes in a row.',
            text_es: 'Mira: <a href="https://youtu.be/q8SHmo1-dac" target="_blank">3 Tips to NAIL Alternate Picking (build speed) – JustinGuitar</a> (0:00–3:00). Púa alterna significa abajo-arriba-abajo-arriba estricto — cada golpe hacia abajo va seguido de uno hacia arriba, así que la púa nunca viaja en la misma dirección dos veces seguidas. Mira su método de pasos de tempo para ganar velocidad. Lo tienes cuando: ya tocaste ocho notas en una cuerda con púa alterna estricta, tres veces seguidas, sin dos golpes hacia abajo seguidos.',
            hint: 'Notice his method for building tempo gradually. As he describes it, try it: play the eight notes on one string at 60 BPM, then 65, then 70.',
            hint_es: 'Fíjate en su método para subir el tempo gradualmente. Mientras lo describe, pruébalo: toca las ocho notas en una cuerda a 60 BPM, y luego a 65 y a 70.',
            skills: [2, 3],
          }
            ]
          },
          {
            kind: 'reflection',
            title: 'Checkpoint',
            title_es: 'Punto de control',
            steps: [
          {
            label: 'Wrap-up: where the loop breaks', label_es: 'Cierre: dónde se desarma la vuelta',
            text: 'Checkpoint — pause and think: at what tempo does your loop start to fall apart, and which part breaks down first — the change, the strum, or the muting?',
            text_es: 'Punto de control — pausa y piensa: ¿a qué tempo tu vuelta empieza a desarmarse, y qué parte falla primero — el cambio, el rasgueo, o el silenciado?',
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — metronome & chord changes',
        title_es: 'Estación de práctica — metrónomo y cambios de acorde',
        sections: [
          {
            title: 'Change power chords on beat 1 at 60 BPM',
            title_es: 'Cambia acordes de potencia en el tiempo 1 a 60 BPM',
            steps: [
          {
            label: 'Challenge 1 — "Watchtower" Loop in Time', label_es: 'Reto 1 — Vuelta de "Watchtower" a tiempo',
            text: '<ol><li>Set the metronome to 60 BPM.</li><li>Play A5, G5, F5, G5. Give each chord one bar: strum once on each beat.</li><li>Change chords on beat 1.</li><li>Play the loop four times.</li></ol>You\'ve got it when: every change lands on beat 1 and you do not stop.',
            text_es: '<ol><li>Pon el metrónomo a 60 BPM.</li><li>Toca A5, G5, F5, G5. Dale a cada acorde un compás: rasguea una vez en cada tiempo.</li><li>Cambia de acorde en el tiempo 1.</li><li>Toca la vuelta cuatro veces.</li></ol>Lo tienes cuando: cada cambio cae en el tiempo 1 y no te detienes.',
            hint: 'If you miss beat 1, keep playing. Join again on the next beat 1.',
            hint_es: 'Si te pierdes el tiempo 1, sigue tocando. Vuelve a entrar en el siguiente tiempo 1.',
            stuck: 'Set the metronome to 50 BPM. Keep playing when you miss a change.',
            stuck_es: 'Pon el metrónomo a 50 BPM. Sigue tocando cuando falles un cambio.',
            levelUp: 'Play it at 70 BPM.',
            levelUp_es: 'Tócalo a 70 BPM.',
            skills: [1, 2]
          }
            ]
          },
          {
            title: 'Change chords every two beats, then every beat',
            title_es: 'Cambia de acorde cada dos tiempos, y luego cada tiempo',
            steps: [
          {
            label: 'Challenge — Half-Bar Power Switches (2 chords)', label_es: 'Reto — Cambios de potencia por medio compás (2 acordes)',
            text: 'Change chords every two beats.<ol><li>Strum A5 on beats 1 and 2.</li><li>Strum D5 on beats 3 and 4.</li><li>Repeat at 60 BPM.</li></ol>Press &#x25B6; to hear it. You\'ve got it when: you play four bars with every change on the beat and no stops.',
            text_es: 'Cambia de acorde cada dos tiempos.<ol><li>Rasguea A5 en los tiempos 1 y 2.</li><li>Rasguea D5 en los tiempos 3 y 4.</li><li>Repite a 60 BPM.</li></ol>Presiona &#x25B6; para escucharlo. Lo tienes cuando: tocas cuatro compases con cada cambio a tiempo y sin detenerte.',
            hint: 'A5 has its root on the low E, fret 5. D5 has its root on the A string, fret 5. Keep the shape and move it over one string.',
            hint_es: 'A5 tiene su raíz en la Mi grave, traste 5. D5 tiene su raíz en la cuerda La, traste 5. Mantén la forma y muévela una cuerda.',
            stuck: 'Set the metronome to 50 BPM. Start moving to the next chord on the + before the change.',
            stuck_es: 'Pon el metrónomo a 50 BPM. Empieza a moverte al siguiente acorde en el + antes del cambio.',
            levelUp: 'Play it at 70 BPM, then 80.',
            levelUp_es: 'Tócalo a 70 BPM, y luego a 80.',
            skills: [1, 2],
            chords: [
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
            ],
            playSeq: { label: 'Hear it — A5·A5 · D5·D5 (change every 2 beats)', label_es: 'Escúchalo — A5·A5 · D5·D5 (cambio cada 2 tiempos)', bpm: 60, notes: [[45,52],[45,52],[50,57],[50,57],[45,52],[45,52],[50,57],[50,57]] }
          },
          {
            label: 'Challenge — Three-Chord Half-Bar (3 chords)', label_es: 'Reto — Medio compás con tres acordes (3 acordes)',
            text: 'Change chords every two beats with three chords.<ol><li>Strum G5 twice.</li><li>Strum C5 twice.</li><li>Strum D5 twice.</li><li>Repeat at 60 BPM.</li></ol>You\'ve got it when: you play the loop twice with every change on the beat.',
            text_es: 'Cambia de acorde cada dos tiempos con tres acordes.<ol><li>Rasguea G5 dos veces.</li><li>Rasguea C5 dos veces.</li><li>Rasguea D5 dos veces.</li><li>Repite a 60 BPM.</li></ol>Lo tienes cuando: tocas la vuelta dos veces con cada cambio a tiempo.',
            hint: 'C5 and D5 have roots on the A string, frets 3 and 5. G5 has its root on the low E, fret 3.',
            hint_es: 'C5 y D5 tienen la raíz en la cuerda La, trastes 3 y 5. G5 tiene la raíz en la Mi grave, traste 3.',
            stuck: 'Play only C5 and D5 until that slide is easy. Then add G5.',
            stuck_es: 'Toca solo C5 y D5 hasta que ese deslizamiento te salga fácil. Luego agrega G5.',
            levelUp: 'Play it at 75 BPM, or in the order G5, D5, C5.',
            levelUp_es: 'Tócalo a 75 BPM, o en el orden G5, D5, C5.',
            skills: [1, 2],
            chords: [
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'C5', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
            ],
            playSeq: { label: 'Hear it — G5·G5 · C5·C5 · D5·D5 (every 2 beats)', label_es: 'Escúchalo — G5·G5 · C5·C5 · D5·D5 (cada 2 tiempos)', bpm: 60, notes: [[43,50],[43,50],[48,55],[48,55],[50,57],[50,57]] }
          },
          {
            // Hidden 2026-10-16 (Module 3 trim): the same "Watchtower" loop
            // and rhythm as Set 1 Challenge 7, only at 70 BPM — Set 1 Challenge 7's
            // level-up covers that. Kept so no progress key moves.
            hidden: true,
            label: 'Challenge — Four-Chord Half-Bar ("Watchtower")', label_es: 'Reto — Medio compás con cuatro acordes ("Watchtower")',
            text: '<ul><li>Play the full "All Along the Watchtower" loop — A5 · G5 · F5 · G5 — with the track\'s timing, looping: count 1 + 2 (rest) + 4 in each bar: A5 on 1, +, 2, then G5 on the "+" after 3 and on 4; then F5 on 1, +, 2, and G5 the same way. All three roots sit on the low E string.</li></ul>You played this at 60 BPM in Set 1. Now play it at 70. You\'ve got it when: four clean laps at 70 BPM, every change landing on the beat.',
            text_es: '<ul><li>Toca la vuelta completa de "All Along the Watchtower" — A5 · G5 · F5 · G5 — con el ritmo de la pista, repitiendo: cuenta 1 + 2 (silencio) + 4 en cada compás: A5 en 1, +, 2, luego G5 en el "+" después del 3 y en el 4; luego F5 en 1, +, 2, y G5 igual. Las tres raíces están en la cuerda Mi grave.</li></ul>Ya lo tocaste a 60 BPM en la Unidad 1. Ahora tócalo a 70. Lo tienes cuando: cuatro vueltas limpias a 70 BPM, cada cambio cayendo a tiempo.',
            hint: 'One shape, three frets on the low E: A5 at fret 5, G5 at fret 3, F5 at fret 1, with the ring finger two frets higher on the A string. Slide the whole hand; don\'t lift and rebuild the shape.',
            hint_es: 'Una forma, tres trastes en la Mi grave: A5 en el traste 5, G5 en el traste 3, F5 en el traste 1, con el anular dos trastes más arriba en la cuerda La. Desliza toda la mano; no la levantes para armar la forma de nuevo.',
            stuck: 'Play just the roots (skip the second string) until the walk is steady, then add the fifth back in.',
            stuck_es: 'Toca solo las raíces (sáltate la segunda cuerda) hasta que el recorrido salga parejo, y luego agrega de vuelta la quinta.',
            levelUp: 'Palm-mute for a tighter chug: rest the side of your strumming hand lightly on the strings, right where they meet the bridge, and strum (a chug = a short, muted, punchy strum). Or move on to the every-beat version below.',
            levelUp_es: 'Silencia con la palma para un chug más ajustado: apoya suavemente el borde de tu mano de rasgueo sobre las cuerdas, justo donde se juntan con el puente, y rasguea (un chug = un rasgueo corto, silenciado y contundente). O pasa a la versión de cada tiempo de abajo.',
            skills: [1, 2],
            chords: [
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'F5', chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 1 }
            ],
            playSeq: { label: 'Hear it — A5 A5 A5 · G5 G5 | F5 F5 F5 · G5 G5', label_es: 'Escúchalo — A5 A5 A5 · G5 G5 | F5 F5 F5 · G5 G5', bpm: 70, notes: [{ midi: [45,52], beats: 0.5 },{ midi: [45,52], beats: 0.5 },{ midi: [45,52], beats: 1.5 },{ midi: [43,50], beats: 0.5 },{ midi: [43,50], beats: 1 },{ midi: [41,48], beats: 0.5 },{ midi: [41,48], beats: 0.5 },{ midi: [41,48], beats: 1.5 },{ midi: [43,50], beats: 0.5 },{ midi: [43,50], beats: 1 }] }
          },
          {
            label: 'Challenge — One Chord Per Beat ("Watchtower", fast)', label_es: 'Reto — Un acorde por tiempo ("Watchtower", rápido)',
            text: 'Play a new chord on every beat.<ol><li>Strum A5, G5, F5, G5: one down-strum on each beat.</li><li>Repeat at 60 BPM.</li></ol>Move to the next shape before its beat. You\'ve got it when: you play the loop four times clean at 60 BPM, then at 65 and 70.',
            text_es: 'Toca un acorde nuevo en cada tiempo.<ol><li>Rasguea A5, G5, F5, G5: un rasgueo hacia abajo en cada tiempo.</li><li>Repite a 60 BPM.</li></ol>Muévete a la siguiente forma antes de su tiempo. Lo tienes cuando: tocas la vuelta cuatro veces limpia a 60 BPM, y luego a 65 y a 70.',
            hint: 'Every root is on the low E: fret 5, 3, 1, 3. Each move is two frets.',
            hint_es: 'Todas las raíces están en la Mi grave: traste 5, 3, 1, 3. Cada movimiento es de dos trastes.',
            stuck: 'Play only A5 and G5, one per beat, until the change is smooth. Then add F5.',
            stuck_es: 'Toca solo A5 y G5, uno por tiempo, hasta que el cambio salga fluido. Luego agrega F5.',
            levelUp: 'Play it at 80 BPM, or play E5, G5, A5, C5, one per beat.',
            levelUp_es: 'Tócalo a 80 BPM, o toca E5, G5, A5, C5, uno por tiempo.',
            skills: [1, 2],
            chords: [
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'F5', chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 1 }
            ],
            playSeq: { label: 'Hear it — A5·G5·F5·G5 (one chord per beat)', label_es: 'Escúchalo — A5·G5·F5·G5 (un acorde por tiempo)', bpm: 60, notes: [[45,52],[43,50],[41,48],[43,50],[45,52],[43,50],[41,48],[43,50]] },
          }
            ]
          },
          {
            title: 'Read and clap the rhythm',
            title_es: 'Lee y aplaude el ritmo',
            steps: [
          {
            label: 'Challenge — Clap & Count', label_es: 'Reto — Aplaude y cuenta',
            text: 'Clap and count each bar out loud. X means clap. &middot; means count without clapping.<ol><li>Bar 1: one whole note. Clap once and hold for 4 beats.</li><li>Bar 2: two half notes. Clap on 1 and 3.</li><li>Bar 3: four quarter notes. Clap on 1, 2, 3 and 4.</li><li>Bar 4: eight eighth notes. Clap on every number and every +.</li></ol><div class="strum-line">X   &middot;   &middot;   &middot;   &middot;   &middot;   &middot;   &middot;\n<span class="su-count">1   +   2   +   3   +   4   +</span></div><div class="strum-line">X   &middot;   &middot;   &middot;   X   &middot;   &middot;   &middot;\n<span class="su-count">1   +   2   +   3   +   4   +</span></div><div class="strum-line">X   &middot;   X   &middot;   X   &middot;   X   &middot;\n<span class="su-count">1   +   2   +   3   +   4   +</span></div><div class="strum-line">X   X   X   X   X   X   X   X\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>You\'ve got it when: you clap all 4 bars with the metronome at 70 BPM and name each note value.',
            text_es: 'Aplaude y cuenta cada compás en voz alta. X significa aplauso. &middot; significa contar sin aplaudir.<ol><li>Compás 1: una redonda. Aplaude una vez y sostén 4 tiempos.</li><li>Compás 2: dos blancas. Aplaude en 1 y 3.</li><li>Compás 3: cuatro negras. Aplaude en 1, 2, 3 y 4.</li><li>Compás 4: ocho corcheas. Aplaude en cada número y en cada +.</li></ol><div class="strum-line">X   &middot;   &middot;   &middot;   &middot;   &middot;   &middot;   &middot;\n<span class="su-count">1   +   2   +   3   +   4   +</span></div><div class="strum-line">X   &middot;   &middot;   &middot;   X   &middot;   &middot;   &middot;\n<span class="su-count">1   +   2   +   3   +   4   +</span></div><div class="strum-line">X   &middot;   X   &middot;   X   &middot;   X   &middot;\n<span class="su-count">1   +   2   +   3   +   4   +</span></div><div class="strum-line">X   X   X   X   X   X   X   X\n<span class="su-count">1   +   2   +   3   +   4   +</span></div>Lo tienes cuando: aplaudes los 4 compases con el metrónomo a 70 BPM y nombras cada figura rítmica.',
            hint: 'Count the claps in one beat. Hold each clap until the next one.',
            hint_es: 'Cuenta los aplausos en un tiempo. Sostén cada aplauso hasta el siguiente.',
            stuck: 'Clap once per beat first: 1 2 3 4. Then clap twice per beat: 1 + 2 + 3 + 4 +.',
            stuck_es: 'Primero aplaude una vez por tiempo: 1 2 3 4. Luego aplaude dos veces por tiempo: 1 + 2 + 3 + 4 +.',
            levelUp: 'Switch between one bar of eighth notes and one bar of quarter notes without losing the count.',
            levelUp_es: 'Alterna un compás de corcheas y un compás de negras sin perder la cuenta.',
            skills: [6]
          }
            ]
          },
          {
            title: 'Play a 6-bar progression with a steady strum',
            title_es: 'Toca una progresión de 6 compases con un rasgueo constante',
            steps: [
          {
            label: 'Challenge — Name Your Progression: I–IV–V ("one–four–five")', label_es: 'Reto — Nombra tu progresión: I–IV–V ("uno-cuatro-cinco")',
            text: 'A key is the group of notes a song uses. Its home note is the note where the music sounds finished. To number the chords, count up the musical alphabet from the home note. In the key of A, A is I, D is IV and E is V.<ol><li>Play A5 for two bars, D5 for two bars, E5 for two bars.</li><li>Strum once on each beat at 60 BPM.</li></ol>You\'ve got it when: you play the loop from the chord names only and say which chord is I, IV and V.',
            text_es: 'Una tonalidad es el grupo de notas que usa una canción. Su nota base es la nota donde la música suena terminada. Para numerar los acordes, cuenta hacia arriba en el alfabeto musical desde la nota base. En la tonalidad de A, A es I, D es IV y E es V.<ol><li>Toca A5 dos compases, D5 dos compases, E5 dos compases.</li><li>Rasguea una vez en cada tiempo a 60 BPM.</li></ol>Lo tienes cuando: tocas la vuelta leyendo solo los nombres de los acordes y dices cuál acorde es I, IV y V.',
            hint: 'A5: low E, fret 5. D5: A string, fret 5. E5: A string, fret 7.',
            hint_es: 'A5: Mi grave, traste 5. D5: cuerda La, traste 5. E5: cuerda La, traste 7.',
            stuck: 'Play only A5 and D5 until that change is clean. Then add E5.',
            stuck_es: 'Toca solo A5 y D5 hasta que ese cambio salga limpio. Luego agrega E5.',
            levelUp: 'Build a I–IV–V in the key of G: G5, C5, D5. Name each chord\'s number.',
            levelUp_es: 'Arma un I–IV–V en la tonalidad de G: G5, C5, D5. Nombra el número de cada acorde.',
            skills: [2, 4],
            chords: [
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'E5', chord: [[6,'x'],[5,7,'1'],[4,9,'3'],[3,'x'],[2,'x'],[1,'x']], position: 7 }
            ]
          },
          {
            label: 'Challenge 2 — Eighth-Note Strum (assessment preparation)', label_es: 'Reto 2 — Rasgueo de corcheas (preparación para la evaluación)',
            text: '<ol><li>Play the A5, D5, E5 loop, two bars each.</li><li>Strum down on each number and up on each +. Count 1 + 2 + 3 + 4 + out loud.</li><li>Start at 60 BPM. Speed up 5 BPM at a time to 80.</li></ol>You\'ve got it when: you play six clean bars at 60 BPM, then hold 80 BPM for 15 seconds.',
            text_es: '<ol><li>Toca la vuelta A5, D5, E5, dos compases cada uno.</li><li>Rasguea hacia abajo en cada número y hacia arriba en cada +. Cuenta 1 + 2 + 3 + 4 + en voz alta.</li><li>Empieza a 60 BPM. Sube de 5 en 5 BPM hasta 80.</li></ol>Lo tienes cuando: tocas seis compases limpios a 60 BPM, y luego sostienes 80 BPM durante 15 segundos.',
            hint: 'Keep your strumming hand moving down and up the whole time.',
            hint_es: 'Mantén tu mano de rasgueo moviéndose abajo y arriba todo el tiempo.',
            stuck: 'Strum down only, once per beat. Then add the up-strums.',
            stuck_es: 'Rasguea solo hacia abajo, una vez por tiempo. Luego agrega los rasgueos hacia arriba.',
            levelUp: 'Play it at 80 BPM along with a song from the Songs page.',
            levelUp_es: 'Tócalo a 80 BPM junto con una canción de la página de Canciones.',
            skills: [3, 4],
          },
          {
            label: 'Challenge 3 — Split Strum ("boom-chick")', label_es: 'Reto 3 — Rasgueo dividido ("boom-chick")',
            text: 'Each pair of beats has two parts.<ol><li>Beat 1, "boom": pick only the root string.</li><li>Beat 2, "chick": strum the whole shape.</li><li>Do the same on beats 3 and 4.</li><li>Play the A5, D5, E5 loop this way, two bars each, at 60 BPM.</li></ol>Press "Hear the split strum" to hear it. You\'ve got it when: you play six bars and every boom is only the root string.',
            text_es: 'Cada par de tiempos tiene dos partes.<ol><li>Tiempo 1, "boom": pulsa solo la cuerda de la raíz.</li><li>Tiempo 2, "chick": rasguea toda la forma.</li><li>Haz lo mismo en los tiempos 3 y 4.</li><li>Toca así la vuelta A5, D5, E5, dos compases cada uno, a 60 BPM.</li></ol>Presiona "Escucha el rasgueo dividido" para escucharlo. Lo tienes cuando: tocas seis compases y cada boom es solo la cuerda de la raíz.',
            hint: 'Count "boom-chick, boom-chick". Look at the root string before each boom.',
            hint_es: 'Cuenta "boom-chick, boom-chick". Mira la cuerda de la raíz antes de cada boom.',
            stuck: 'Mute the strings with your fretting hand. Practice pick, strum, pick, strum until you hit the root string every time. Then play A5.',
            stuck_es: 'Silencia las cuerdas con tu mano de trastear. Practica pulsa, rasguea, pulsa, rasguea hasta que le pegues a la cuerda de la raíz cada vez. Luego toca A5.',
            levelUp: 'Play two bars of split strum, then two bars of eighth notes. Repeat.',
            levelUp_es: 'Toca dos compases de rasgueo dividido, y luego dos compases de corcheas. Repite.',
            skills: [2, 4],
            playSeq: { label: 'Hear the split strum', label_es: 'Escucha el rasgueo dividido', bpm: 60, notes: [45, [45,52], 45, [45,52], 50, [50,57], 50, [50,57]] }
          }
            ]
          },
          {
            title: 'Optional: add a third note',
            title_es: 'Opcional: agrega una tercera nota',
            steps: [
          {
            label: 'Challenge 4 — Octave Add-On (optional)', label_es: 'Reto 4 — Octava extra (opcional)',
            text: '<ol><li>Play G5.</li><li>Add your pinky on the D string, fret 5.</li><li>Strum the three strings.</li></ol>This step is optional. You\'ve got it when: you play three strums in a row with all three notes ringing and no buzz.',
            text_es: '<ol><li>Toca G5.</li><li>Agrega tu meñique en la cuerda Re, traste 5.</li><li>Rasguea las tres cuerdas.</li></ol>Este paso es opcional. Lo tienes cuando: tocas tres rasgueos seguidos con las tres notas sonando y sin zumbido.',
            hint: 'If the three-note chord buzzes, play the two-note shape.',
            hint_es: 'Si el acorde de tres notas zumba, toca la forma de dos notas.',
            skills: [5]
          }
            ]
          },
          {
            title: '"Luna": switch between F5 and A5',
            title_es: '"Luna": cambia entre F5 y A5',
            steps: [
          {
            label: 'Challenge — F5 ↔ A5 Two-Shape Drill ("Luna")', label_es: 'Reto — Ejercicio de dos formas F5 ↔ A5 ("Luna")',
            text: '"Luna" is in 6/8: six beats in each bar, counted 1 2 3 4 5 6. Strum only on 1 and 4.<ol><li>Play F5 for two bars: low E string, fret 1.</li><li>Play A5 for two bars: low E string, fret 5.</li><li>Repeat at 60 BPM.</li></ol>You\'ve got it when: you play the loop four times clean at 60 BPM, then at 70 and 80.',
            text_es: '"Luna" está en 6/8: seis tiempos en cada compás, contados 1 2 3 4 5 6. Rasguea solo en el 1 y el 4.<ol><li>Toca F5 dos compases: cuerda Mi grave, traste 1.</li><li>Toca A5 dos compases: cuerda Mi grave, traste 5.</li><li>Repite a 60 BPM.</li></ol>Lo tienes cuando: tocas la vuelta cuatro veces limpia a 60 BPM, y luego a 70 y a 80.',
            hint: 'A vamp is a short chord pattern repeated over and over. Keep the shape and slide your whole hand four frets.',
            hint_es: 'Un vamp es un patrón corto de acordes que se repite una y otra vez. Mantén la forma y desliza toda la mano cuatro trastes.',
            stuck: 'Slide between fret 1 and fret 5 with no metronome until the move is easy. Then add the metronome at 60 BPM.',
            stuck_es: 'Desliza entre el traste 1 y el traste 5 sin metrónomo hasta que el movimiento te salga fácil. Luego agrega el metrónomo a 60 BPM.',
            levelUp: 'Palm-mute: rest the side of your strumming hand on the strings next to the bridge. Then play without the mute and compare the two sounds.',
            levelUp_es: 'Silencia con la palma: apoya el borde de tu mano de rasgueo sobre las cuerdas junto al puente. Luego toca sin silenciar y compara los dos sonidos.',
            skills: [1, 2],
            chords: [
              { name: 'F5', chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 1 },
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
            ],
            playSeq: { label: 'Hear F5 → A5 (roots F · A)', label_es: 'Escucha F5 → A5 (raíces F · A)', bpm: 60, notes: [{ midi: 41, beats: 4 }, { midi: 45, beats: 4 }] },
          }
            ]
          },
          {
            title: '"Sweet Child O\' Mine" — assessment preparation',
            title_es: '"Sweet Child O\' Mine" — preparación para la evaluación',
            steps: [
          {
            label: 'Challenge — "Sweet Child" Intro and Verse (assessment preparation)', label_es: 'Reto — Intro y estrofa de "Sweet Child" (preparación para la evaluación)',
            text: '<ol><li>Play D5 for two bars.</li><li>Play C5 for two bars.</li><li>Play G5 for two bars.</li><li>Repeat at 60 BPM.</li></ol>You\'ve got it when: you play the loop twice with every change on beat 1 and no other strings ringing.',
            text_es: '<ol><li>Toca D5 dos compases.</li><li>Toca C5 dos compases.</li><li>Toca G5 dos compases.</li><li>Repite a 60 BPM.</li></ol>Lo tienes cuando: tocas la vuelta dos veces con cada cambio en el tiempo 1 y sin que suenen otras cuerdas.',
            hint: 'D5 and C5 have roots on the A string. G5 has its root on the low E. Count all 8 beats before each change. The recording is tuned a half step lower, so it sounds one fret lower than you. Do not retune.',
            hint_es: 'D5 y C5 tienen la raíz en la cuerda La. G5 tiene la raíz en la Mi grave. Cuenta los 8 tiempos antes de cada cambio. La grabación está afinada medio tono más abajo, así que suena un traste más grave que tú. No reafines.',
            stuck: 'Play only D5 and C5 until the change is smooth. Then add G5.',
            stuck_es: 'Toca solo D5 y C5 hasta que el cambio salga fluido. Luego agrega G5.',
            levelUp: 'Play it at 70 BPM, then 80.',
            levelUp_es: 'Tócalo a 70 BPM, y luego a 80.',
            skills: [3, 4],
            chords: [
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'C5', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 }
            ],
          }
            ]
          },
          {
            kind: 'take-to-song',
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Watchtower", verse', label_es: 'Reto — "Watchtower", estrofa',
                text: '<ul><li>Play the "All Along the Watchtower" loop as power chords, all three rooted on the low E string — A5 · G5 · F5 · G5 at 60 BPM — count 1 + 2 (rest) + 4 in each bar: A5 on 1, +, 2, then G5 on the "+" after 3 and on 4; then F5 on 1, +, 2, and G5 the same way.</li></ul>You\'ve got it when: four clean laps, every strum on its count. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
                text_es: '<ul><li>Toca la vuelta de "All Along the Watchtower" como acordes de potencia, los tres con raíz en la cuerda Mi grave — A5 · G5 · F5 · G5 a 60 BPM — cuenta 1 + 2 (silencio) + 4 en cada compás: A5 en 1, +, 2, luego G5 en el "+" después del 3 y en el 4; luego F5 en 1, +, 2, y G5 igual.</li></ul>Lo tienes cuando: cuatro vueltas limpias, cada rasgueo en su conteo. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 3 de 5</a>.',
                hint: 'Same three roots you played in Module 2 — now each root note also sounds its fifth, and every root stays on the low E string.',
                hint_es: 'Las mismas tres raíces que tocaste en el Módulo 2 — ahora cada nota raíz también suena su quinta, y todas las raíces se quedan en la cuerda Mi grave.',
                stuck: 'Drop to roots-only for a lap, then add the second string back on just the G5.',
                stuck_es: 'Baja a solo raíces por una vuelta, y luego agrega de vuelta la segunda cuerda solo en el G5.',
                levelUp: 'Speed it up: 70 BPM, then 80.',
                levelUp_es: 'Acelera: 70 BPM, y luego 80.',
                skills: [3, 4],
                tab: {
                  caption: '"All Along the Watchtower" — verse loop as power chords · count 1 + 2 (rest) + 4 · 60 BPM',
                  caption_es: '"All Along the Watchtower" — vuelta de la estrofa como acordes de potencia · cuenta 1 + 2 (silencio) + 4 · 60 BPM',
                  notes: [
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45], beats: 0.5 },
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45], beats: 0.5 },
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45], beats: 1.5 },
                    { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43], beats: 0.5 },
                    { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43], beats: 1 },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41], beats: 0.5 },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41], beats: 0.5 },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41], beats: 1.5 },
                    { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43], beats: 0.5 },
                    { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43], beats: 1 }
                  ]
                },
              },
              {
                label: 'Challenge — "the cure" as power chords', label_es: 'Reto — "the cure" como acordes de potencia',
                text: 'This gentle acoustic song isn\'t usually played with power chords. Here you play it that way on purpose. It\'s marked ◐, our flag for a song played against its natural style.<ul><li>Play the whole song as power chords — verse: A5 · C5 · A5 · C5, then F5 · C5 · F5 · C5 — eight bars; chorus: D5 · F5 · C5 · G5, twice — eight more — four beats per chord at 60 BPM, one strum per beat, quietly.</li></ul>You\'ve got it when: two laps clean AND soft — power chords don\'t have to be loud. No score — just try it. <a href="tabs/the-cure.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
                text_es: 'Esta canción acústica y suave normalmente no se toca con acordes de potencia. Aquí la tocas así a propósito. Lleva la marca ◐, nuestra señal para una canción tocada en contra de su estilo natural.<ul><li>Toca la canción entera como acordes de potencia — estrofa: A5 · C5 · A5 · C5, y luego F5 · C5 · F5 · C5 — ocho compases; coro: D5 · F5 · C5 · G5, dos veces — ocho más — cuatro tiempos por acorde a 60 BPM, un rasgueo por tiempo, suavemente.</li></ul>Lo tienes cuando: dos vueltas limpias Y suaves — los acordes de potencia no tienen que ser fuertes. Sin puntaje — solo pruébalo. <a href="tabs/the-cure.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 3 de 5</a>.',
                hint: 'The verse roots — A, C, F — you already know from Module 2. D and G, this song\'s chorus roots, are familiar too: Module 2 taught them for other songs. Use both root strings: A5, F5 and G5 root on the low E, C5 and D5 on the A string, which keeps every root inside the first five frets. The challenge here is touch: light pick, both strings ringing, no harsh sound.',
                hint_es: 'Las raíces de la estrofa — A, C, F — ya las conoces del Módulo 2. D y G, las raíces del coro de esta canción, también son conocidas: el Módulo 2 las enseñó en otras canciones. Usa las dos cuerdas de raíz: A5, F5 y G5 tienen su raíz en la cuerda Mi grave, y C5 y D5 en la cuerda La, lo que mantiene todas las raíces dentro de los primeros cinco trastes. El reto aquí es el toque: púa ligera, ambas cuerdas sonando, sin sonido áspero.',
                stuck: 'Roots-only as quietly as you can first — get the dynamics, then add the fifths.',
                stuck_es: 'Solo raíces lo más suave que puedas primero — consigue la dinámica, y luego agrega las quintas.',
                levelUp: 'Play one lap loud and one lap soft and hear the difference.',
                levelUp_es: 'Toca una vuelta fuerte y una vuelta suave y escucha la diferencia.',
                tab: {
                  caption: '"the cure" — verse and chorus as power chords (teaching arrangement) · one strum per beat, four beats per chord · 60 BPM',
                  caption_es: '"the cure" — estrofa y coro como acordes de potencia (arreglo didáctico) · un rasgueo por tiempo, cuatro tiempos por acorde · 60 BPM',
                  notes: [
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45] },
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45] },
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45] },
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45] },
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45] },
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45] },
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 7], ['A', 5]], note: 'D5', midi: [57, 50] },
                    { frets: [['D', 7], ['A', 5]], note: 'D5', midi: [57, 50] },
                    { frets: [['D', 7], ['A', 5]], note: 'D5', midi: [57, 50] },
                    { frets: [['D', 7], ['A', 5]], note: 'D5', midi: [57, 50] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43] },
                    { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43] },
                    { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43] },
                    { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43] },
                    { frets: [['D', 7], ['A', 5]], note: 'D5', midi: [57, 50] },
                    { frets: [['D', 7], ['A', 5]], note: 'D5', midi: [57, 50] },
                    { frets: [['D', 7], ['A', 5]], note: 'D5', midi: [57, 50] },
                    { frets: [['D', 7], ['A', 5]], note: 'D5', midi: [57, 50] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43] },
                    { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43] },
                    { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43] },
                    { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43] }
                  ]
                },
              },
              {
                label: 'Challenge — "Luna", full vamp', label_es: 'Reto — "Luna", vamp completo',
                text: 'The whole song rides F5 ↔ A5.<ul><li>Play along with the teaching arrangement — two big-beat strums per bar at 60 BPM, changing every two bars: F5, F5, A5, A5.</li></ul>You\'ve got it when: a full verse and chorus without losing a big beat, F5 ringing as clean as A5. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
                text_es: 'Toda la canción se apoya en F5 ↔ A5.<ul><li>Toca junto con el arreglo didáctico — dos rasgueos en el tiempo fuerte por compás a 60 BPM, cambiando cada dos compases: F5, F5, A5, A5.</li></ul>Lo tienes cuando: una estrofa y un coro completos sin perder un tiempo fuerte, con F5 sonando tan limpio como A5. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 3 de 5</a>.',
                hint: 'This is the same F5↔A5 slide from the drill above. Each chord holds for two bars — four big beats — before you slide, which is where the record changes.',
                hint_es: 'Es el mismo deslizamiento F5↔A5 del ejercicio de arriba. Cada acorde se sostiene dos compases — cuatro tiempos fuertes — antes de que deslices, que es donde cambia la grabación.',
                stuck: 'Loop the F5↔A5 slide with no song for a few rounds first, then drop in following the record.',
                stuck_es: 'Repite el deslizamiento F5↔A5 sin la canción por unas cuantas rondas primero, y luego entra siguiendo la grabación.',
                levelUp: 'Try a palm mute for the verse — rest the edge of your picking hand on the strings right where they cross the bridge, so the notes sound short and thick — then lift it off and let the chorus ring open.',
                levelUp_es: 'Prueba un silenciado con la palma para la estrofa — apoya el canto de tu mano de rasgueo sobre las cuerdas justo donde cruzan el puente, para que las notas suenen cortas y gruesas — y luego levántala y deja que el coro suene abierto.',
                skills: [3, 4],
                tab: {
                  caption: '"Luna" — the vamp as power chords (teaching arrangement) · 2 strums per bar, change every 2 bars · 60 BPM',
                  caption_es: '"Luna" — el vamp como acordes de potencia (arreglo didáctico) · 2 rasgueos por compás, cambio cada 2 compases · 60 BPM',
                  notes: [
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45] },
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45] },
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45] },
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45] }
                  ]
                },
              }
            ]
          },
          {
            kind: 'reflection',
            title: 'Wrap-Up',
            title_es: 'Cierre',
            steps: [
              {
                label: 'Wrap-up: your top clean tempo', label_es: 'Cierre: tu tempo limpio máximo',
                text: 'What\'s your current top clean tempo on the loop, and what\'s the one thing holding you back from going faster — a specific change, the strum, or muting? Name it below.',
                text_es: '¿Cuál es tu tempo limpio más alto en la vuelta ahora mismo, y cuál es la única cosa que te frena para ir más rápido — un cambio específico, el rasgueo, o el silenciado? Nómbralo abajo.',
              }
            ]
          }
        ]
      }
    },

    skills: [
      { id: 'm3w2-s1', text: 'Change power chords on beat 1 at 60 BPM',
        text_es: 'Cambiar acordes de potencia en el tiempo 1 a 60 BPM',
        gotItWhen: 'your chord changes land exactly on beat 1 with the metronome at 60 BPM and you don\'t need to pause or restart.',
        gotItWhen_es: 'tus cambios de acorde caen exactamente en el tiempo 1 con el metrónomo a 60 BPM y no necesitas pausar ni reiniciar.',
        practice: { type: 'pr', prompt: '<ol><li>Loop A5 → G5, changing on beat 1 of every bar.</li><li>Start at 60 BPM and raise the metronome +5 at a time.</li><li>Log your fastest BPM with clean changes.</li></ol>',
          prompt_es: '<ol><li>Repite A5 → G5, cambiando en el tiempo 1 de cada compás.</li><li>Empieza a 60 BPM y sube el metrónomo de 5 en 5.</li><li>Anota tu BPM más rápido con cambios limpios.</li></ol>',
          unit: 'BPM', placeholder: 'e.g. 75 — try for a higher number next session', placeholder_es: 'p. ej. 75 — intenta superarlo la próxima sesión' } },
      { id: 'm3w2-s2', text: 'Play a full 6-bar power chord progression in time',
        text_es: 'Tocar una progresión completa de 6 compases de acordes de potencia a tiempo',
        gotItWhen: 'you can play through 6 bars without stopping, even if a chord change is rough — you keep going to the next downbeat.',
        gotItWhen_es: 'puedes tocar los 6 compases sin detenerte, aunque un cambio de acorde salga imperfecto — sigues hasta el siguiente tiempo fuerte.',
        practice: { type: 'playSeq', label: '"Watchtower" roots — 1 + 2 (rest) + 4', label_es: 'Raíces de "Watchtower" — 1 + 2 (silencio) + 4', bpm: 60,
          notes: [{ midi: 45, beats: 0.5 }, { midi: 45, beats: 0.5 }, { midi: 45, beats: 1.5 }, { midi: 43, beats: 0.5 }, { midi: 43, beats: 1 }, { midi: 41, beats: 0.5 }, { midi: 41, beats: 0.5 }, { midi: 41, beats: 1.5 }, { midi: 43, beats: 0.5 }, { midi: 43, beats: 1 }] } },
      { id: 'm3w2-s3', text: 'Play a straight-eighths strumming pattern with power chords',
        text_es: 'Tocar un patrón de rasgueo de corcheas rectas con acordes de potencia',
        gotItWhen: 'you can strum down on each number and up on each "+" across a bar and count "1 + 2 + 3 + 4 +" aloud without losing the strum.',
        gotItWhen_es: 'puedes rasguear hacia abajo en cada número y hacia arriba en cada "+" a lo largo de un compás y contar "1 + 2 + 3 + 4 +" en voz alta sin perder el rasgueo.',
        practice: { type: 'playSeq', label: 'Eighth-note pulse on A — strum along, counting "1 + 2 + 3 + 4 +"', label_es: 'Pulso de corcheas en La — rasguea al ritmo, contando "1 + 2 + 3 + 4 +"', bpm: 160,
          notes: [45, 45, 45, 45, 45, 45, 45, 45] } },
      { id: 'm3w2-s4', text: 'Play E-root and A-root power chords in one song',
        text_es: 'Toca acordes de potencia con raíz en Mi y en La en una misma canción',
        gotItWhen: 'you can switch between an E-root and an A-root power chord mid-song without a gap in the sound and without the wrong strings ringing.',
        gotItWhen_es: 'puedes cambiar entre un acorde de potencia con raíz en Mi y uno con raíz en La a mitad de la canción sin que se corte el sonido y sin que suenen las cuerdas equivocadas.',
        practice: { type: 'mc', prompt: 'A song calls for G5 then C5. You want the smallest hand move between them. Where does your index finger go for each?',
          prompt_es: 'Una canción pide G5 y luego C5. Quieres el movimiento de mano más pequeño entre ellos. ¿Dónde va tu dedo índice para cada uno?',
          choices: ['Both on the low E string, frets 3 and 8', 'Both on the A string, frets 3 and 10', 'G5 on E (fret 3), C5 on A (fret 3)', 'G5 on A (fret 10), C5 on E (fret 8)'],
          choices_es: ['Ambos en la cuerda Mi grave, trastes 3 y 8', 'Ambos en la cuerda La, trastes 3 y 10', 'G5 en Mi grave (traste 3), C5 en La (traste 3)', 'G5 en La (traste 10), C5 en Mi grave (traste 8)'], answer: 2,
          explain: 'G is at fret 3 of the low E string and C is at fret 3 of the A string — so the fret number never changes, only the string does. G5 at fret 10 of the A string and C5 at fret 8 of the low E string are real chords too, but they make your hand jump.',
          explain_es: 'G está en el traste 3 de la cuerda Mi grave y C está en el traste 3 de la cuerda La — así que el número de traste nunca cambia, solo la cuerda. G5 en el traste 10 de la cuerda La y C5 en el traste 8 de la cuerda Mi grave también son acordes reales, pero hacen que tu mano salte.' } },
      { id: 'm3w2-s5', text: 'Optional: add your pinky to the power chord shape (three notes)',
        text_es: 'Opcional: agregar el meñique a la forma del acorde de potencia (tres notas)',
        gotItWhen: 'your pinky lands on the next string at the same fret as your ring finger and all three notes ring cleanly — no buzz, no muffled string.',
        gotItWhen_es: 'tu meñique cae en la siguiente cuerda en el mismo traste que tu anular y las tres notas suenan limpias — sin zumbido, sin cuerdas apagadas.',
        practice: { type: 'mc', prompt: 'You add your pinky on the next string, at the same fret as your ring finger. What interval (an interval = the distance between two notes) did you just add to the chord?',
          prompt_es: 'Agregas tu meñique en la siguiente cuerda, en el mismo traste que tu anular. ¿Qué intervalo (un intervalo = la distancia entre dos notas) acabas de agregar al acorde?',
          choices: ['A 3rd', 'A 5th', 'An octave', 'A 7th'],
          choices_es: ['Una 3ª', 'Una 5ª', 'Una octava', 'Una 7ª'], answer: 2,
          explain: 'Your ring finger is already on the 5th, so the next string at that same fret lands on the root again — one octave higher. Doubling the root makes the chord thicker without changing which chord it is.',
          explain_es: 'Tu dedo anular ya está en la 5ª, así que la siguiente cuerda en ese mismo traste cae otra vez en la raíz — una octava más aguda. Duplicar la raíz engrosa el acorde sin cambiar qué acorde es.' } },
      { id: 'm3w2-s6', text: 'Clap and count a 4-bar rhythm, and name whole, half, quarter, and eighth notes',
        text_es: 'Aplaudir y contar un ritmo de 4 compases, y nombrar redondas, blancas, negras y corcheas',
        gotItWhen: 'you can clap a 4-bar line in time with the metronome without stopping, and say which notes are whole, half, quarter, or eighth.',
        gotItWhen_es: 'puedes aplaudir una línea de 4 compases a tiempo con el metrónomo sin detenerte, y decir cuáles notas son redondas, blancas, negras o corcheas.',
        practice: { type: 'mc', prompt: 'You strum down on each number and up on each "+", counting "1 + 2 + 3 + 4 +" — two strums per beat. Which note value are you playing?',
          prompt_es: 'Rasgueas hacia abajo en cada número y hacia arriba en cada "+", contando "1 + 2 + 3 + 4 +" — dos rasgueos por tiempo. ¿Qué figura rítmica estás tocando?',
          choices: ['Whole notes', 'Quarter notes', 'Eighth notes', 'Half notes'],
          choices_es: ['Redondas', 'Negras', 'Corcheas', 'Blancas'], answer: 2,
          explain: 'Every "+" splits a beat in half, so you get two strums per beat — and two notes per beat is exactly what eighth notes are. Quarter notes would be one strum on each number with no "+" between them.',
          explain_es: 'Cada "+" parte un tiempo por la mitad, así que te salen dos rasgueos por tiempo — y dos notas por tiempo es exactamente lo que son las corcheas. Las negras serían un rasgueo en cada número, sin ningún "+" en medio.' } }
    ]
  }

); // end module-3.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[3] = [
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Full power chord loop · every change on the beat at 60, hold 80 BPM', meta_es: 'Vuelta completa de acordes de potencia · cada cambio a tiempo a 60, mantén 80 BPM', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Full riff with power chords', meta_es: 'Riff completo con acordes de potencia', type: 'Core', core: true, journeyUrl: 'tabs/seven-nation-army.html',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: '◐ Sierreño vamp → power-chord version (on purpose, in a different style than the original)', meta_es: '◐ Vamp de sierreño → versión con acordes de potencia (a propósito, en un estilo distinto al original)', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Intro and verse: D5–C5–G5 power chord loop', meta_es: 'Intro y estrofa: vuelta de acordes de potencia D5–C5–G5', type: 'Core', core: true, journeyUrl: 'tabs/sweet-child-o-mine.html',
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0ASVeXINKYM&start=282&end=938' },
      { name: '"the cure" — Olivia Rodrigo', meta: '◐ Power chord arrangement (a gentle song, played softly) · verse A5–C5–A5–C5, F5–C5–F5–C5 · chorus D5–F5–C5–G5, twice', meta_es: '◐ Arreglo con acordes de potencia (una canción suave, tocada suavemente) · estrofa A5–C5–A5–C5, F5–C5–F5–C5 · coro D5–F5–C5–G5, dos veces', type: 'Core', core: true, journeyUrl: 'tabs/the-cure.html',
        originalUrl: 'https://www.youtube.com/watch?v=B402rKl4bUg',
        tutorialUrl: 'https://www.youtube.com/watch?v=adW_zSkClaY' },
      { name: '"Happy Birthday"', meta: 'Full power chord arrangement (optional)', meta_es: 'Arreglo completo con acordes de potencia (opcional)', type: 'Supp', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w&start=46' },
      { name: '"Smells Like Teen Spirit" — Nirvana', meta: 'F Bb Ab Db power chord progression', meta_es: 'Progresión de acordes de potencia F Bb Ab Db', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=hTWKbfoikeg',
        tutorialUrl: 'https://www.youtube.com/watch?v=HfhZbd5w-iY&start=60' },
      { name: '"Zombie" — The Cranberries', meta: 'Em C G D power chord version', meta_es: 'Versión con acordes de potencia Em C G D', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=6Ejga4kJUts',
        tutorialUrl: 'https://www.youtube.com/watch?v=uGMybMuDKAU' },
      { name: '"Master of Puppets" — Metallica', meta: 'Simplified intro power chord riff', meta_es: 'Riff de intro simplificado con acordes de potencia', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=hx27NL_iqEM',
        tutorialUrl: 'https://www.youtube.com/watch?v=FvVrCKgEu4s' },
      { name: '"Blitzkrieg Bop" — Ramones', meta: 'A5 D5 E5 — fast and fun', meta_es: 'A5 D5 E5 — rápido y divertido', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=268C3N2dDYk',
        tutorialUrl: 'https://www.youtube.com/watch?v=9lFufklJ-nU' },
      { name: '"De Música Ligera" — Soda Stereo', meta: 'Bm–G–D–A riff, played as B5–G5–D5–A5 power chords', meta_es: 'Riff Bm–G–D–A, tocado como acordes de potencia B5–G5–D5–A5', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=T_FkEw27XJ0',
        tutorialUrl: 'https://www.youtube.com/watch?v=TRciSsMYuZ0' }
    ];

MODULE_REVIEWS[3] = {
  moduleNum: 3,
  module: 'Two-Finger Power Chords',
  module_es: 'Acordes de potencia con dos dedos',
  skills: [
    { id: 'mr3-s1', text: 'I can fret a clean 2-finger power chord (root + 5th) with both notes ringing and no buzz',
      text_es: 'Puedo trastear un acorde de potencia limpio con dos dedos (raíz + quinta) con las dos notas sonando y sin zumbido', set: 'm3w1' },
    { id: 'mr3-s2', text: 'I can move the same shape along the low E string and name each chord without counting frets',
      text_es: 'Puedo mover la misma forma por la cuerda Mi grave y nombrar cada acorde sin contar trastes', set: 'm3w1' },
    { id: 'mr3-s3', text: 'I can move the shape along the A string and keep the low E string silent',
      text_es: 'Puedo mover la forma por la cuerda La y mantener silenciada la cuerda Mi grave', set: 'm3w1' },
    { id: 'mr3-s5', text: 'I can read a power chord symbol like "A5" and instantly know which fret and string my index finger goes to',
      text_es: 'Puedo leer un símbolo de acorde de potencia como "A5" y saber al instante en qué traste y cuerda va mi dedo índice', set: 'm3w1' },
    { id: 'mr3-s7', text: 'I can change power chords on beat 1 at 60 BPM without stopping',
      text_es: 'Puedo cambiar acordes de potencia en el tiempo 1 a 60 BPM sin detenerme', set: 'm3w2' },
    { id: 'mr3-s8', text: 'I can play a 6-bar progression with a straight-eighths strum, counting "1 + 2 + 3 + 4 +"',
      text_es: 'Puedo tocar una progresión de 6 compases con un rasgueo de corcheas rectas, contando "1 + 2 + 3 + 4 +"', set: 'm3w2' },
    { id: 'mr3-s9', text: 'I can hold a power-chord progression at 80 BPM for 15 seconds with clean muting',
      text_es: 'Puedo sostener una progresión de acordes de potencia a 80 BPM por 15 segundos con silenciado limpio', set: 'm3w2' },
    { id: 'mr3-s10', text: 'I can play the split strum ("boom-chick") — just the root on beat 1, the full shape on beat 2',
      text_es: 'Puedo tocar el rasgueo dividido ("boom-chick") — solo la raíz en el tiempo 1, la forma completa en el tiempo 2', set: 'm3w2' },
    { id: 'mr3-s11', text: 'I can clap and count a 4-bar rhythm and name which notes are whole, half, quarter, and eighth notes',
      text_es: 'Puedo aplaudir y contar un ritmo de 4 compases y nombrar cuáles notas son redondas, blancas, negras y corcheas', set: 'm3w2' }
  ],
  assessItems: [
    'Play part of a core song at 80 BPM for at least 15 seconds: "Seven Nation Army", "All Along the Watchtower" (A5–G5–F5–G5) or "Sweet Child O\' Mine" (D5–C5–G5). Every change lands on its beat, and the strings you do not use stay silent.',
    'Read a I–IV–V progression from chord names or TAB and play it with a named strum (straight eighths or the split strum). Name power chords from a chord chart.',
    'Clap and count a 4-bar rhythm using whole, half, quarter, and eighth notes'
  ],
  assessItems_es: [
    'Toca parte de una canción principal a 80 BPM durante al menos 15 segundos: "Seven Nation Army", "All Along the Watchtower" (A5–G5–F5–G5) o "Sweet Child O\' Mine" (D5–C5–G5). Cada cambio cae en su tiempo, y las cuerdas que no usas quedan en silencio.',
    'Lee una progresión I–IV–V a partir de nombres de acordes o TAB y tócala con un rasgueo nombrado (corcheas rectas o el rasgueo dividido). Nombra acordes de potencia a partir de un diagrama de acordes.',
    'Aplaude y cuenta un ritmo de 4 compases usando redondas, blancas, negras y corcheas'
  ],
  forward: '<strong>Module 4 teaches open chords</strong> — full chords that let open strings ring, like Am, C and G. You play "All Along the Watchtower" and "Sweet Child O\' Mine" again with them, on the same roots as your power chords. Then in Module 5, the E &amp; A string roots you slide between become the starting point for pentatonic scales (five-note scales) and your first solos.',
  forward_es: '<strong>El Módulo 4 enseña acordes al aire</strong> — acordes completos que dejan sonar cuerdas al aire, como Am, C y G. Vuelves a tocar "All Along the Watchtower" y "Sweet Child O\' Mine" con ellos, sobre las mismas raíces que tus acordes de potencia. Después, en el Módulo 5, las raíces de las cuerdas Mi &amp; La entre las que te deslizas se convierten en el punto de partida para las escalas pentatónicas (escalas de cinco notas) y tus primeros solos.',
  standards: ['Pr.4a', 'Pr.5a', 'Pr.5b', 'Pr.6a', 'Re.7a']
};
