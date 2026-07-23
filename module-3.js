// ============================================================
//  MODULE 3 — Two-Finger Power Chords
//  Edit this file to change Module 3 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm3w1',
    songThread: [{ name: 'Seven Nation Army', journey: 'tabs/seven-nation-army.html', layer: 3, note: 'the riff as power chords' }, { name: 'All Along the Watchtower', journey: 'tabs/all-along-the-watchtower.html', layer: 3, note: 'the loop as power chords' }],
    label: 'Set 1',
    locked: false,
    module: 'Two-Finger Power Chords',
    moduleNum: 3,
    unit: 'Module 3 · Two-Finger Power Chords',
    unit_es: 'Módulo 3 · Acordes de potencia con dos dedos',
    title: 'Set 1',
    subtitle: 'Power chord shape · Moving on E & A strings · Muting',
    subtitle_es: 'Forma del acorde de potencia · Moverse por las cuerdas Mi y La · Silenciar cuerdas',
    objective: 'I CAN fret a clean 2-finger power chord and move the shape along the E and A strings.',
    skillFocus: 'Fretting a clean power chord · Moving the shape along the E and A strings · Reading power-chord TAB',
    skillFocus_es: 'Trastear un acorde de potencia limpio · Mover la forma por las cuerdas Mi y La · Leer TAB de acordes de potencia',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        title_es: 'Estación de computadora — Mira · Escucha · Practica',
        sections: [
          {
            title: 'See the power chord shape move',
            title_es: 'Mira moverse la forma del acorde de potencia',
            steps: [
          {
            text: 'Power chord shape — see it move: here are E5, G5, and A5. It\'s the SAME two-finger shape (index on the root, ring finger two frets up on the next string — for E5 the root is the open low E, so no index finger is needed, just the ring) just slid to a new fret. Press ▶ to hear the root climb E → G → A, then build each shape on your guitar.',
            text_es: 'Forma del acorde de potencia — míralo moverse: aquí están E5, G5 y A5. Es la MISMA forma con dos dedos (el índice en la raíz, el anular dos trastes más arriba en la siguiente cuerda — para E5 la raíz es la Mi grave al aire, así que no hace falta el índice, solo el anular) simplemente deslizada a un traste nuevo. Presiona ▶ para escuchar la raíz subir E → G → A, y luego arma cada forma en tu guitarra.',
            hint: 'Your index finger names the chord — it sits on the root. The ring finger always lands two frets higher, on the next string. Pause and match each diagram before moving on.',
            hint_es: 'Tu dedo índice le da el nombre al acorde — se coloca en la raíz. El anular siempre cae dos trastes más arriba, en la siguiente cuerda. Pausa e iguala cada diagrama antes de seguir.',
            skills: [1, 2],
            chords: [
              { name: 'E5', chord: [[6,0],[5,2,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 0 },
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
            ],
            playSeq: { label: 'Hear the roots climb (E · G · A)', label_es: 'Escucha subir las raíces (E · G · A)', bpm: 60, notes: [40, 43, 45] },
            response: { type: 'mc', prompt: 'E5, G5, and A5 are played with…',
              prompt_es: 'E5, G5 y A5 se tocan con…',
              answer: 1,
              explain: 'A power chord is one movable shape — slide the same two-finger grip to a new fret and the root note (and the chord name) changes.',
              explain_es: 'Un acorde de potencia es una sola forma movible — desliza el mismo agarre de dos dedos a un traste nuevo y la nota raíz (y el nombre del acorde) cambia.',
              choices: [
              'Three completely different shapes',
              'The same shape moved to different frets',
              'All your fingers on different strings',
              'Only open strings'
            ],
              choices_es: [
              'Tres formas completamente distintas',
              'La misma forma movida a distintos trastes',
              'Todos tus dedos en cuerdas diferentes',
              'Solo cuerdas al aire'
            ] }
          }
            ]
          },
          {
            title: 'Watch the lesson videos',
            title_es: 'Mira los videos de la lección',
            steps: [
          {
            text: 'Watch: <a href="https://www.youtube.com/watch?v=vtcdDira8eE" target="_blank">What Is A Power Chord? Easy Rock Guitar Chords – Lauren Bateman (0:00–4:00)</a>.',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=vtcdDira8eE" target="_blank">What Is A Power Chord? Easy Rock Guitar Chords – Lauren Bateman (0:00–4:00)</a>.',
            hint: 'Focus on the two-finger shape — which fingers go where, and how the note under your index finger names the chord. Try the shape on your guitar as she shows it.',
            hint_es: 'Fíjate en la forma con dos dedos — qué dedo va dónde, y cómo la nota bajo tu dedo índice le da nombre al acorde. Prueba la forma en tu guitarra mientras ella la muestra.',
            skills: [1, 3],
            response: { type: 'short', placeholder: 'Describe the power chord shape in your own words — which fingers go where, and what names the chord?',
              placeholder_es: 'Describe con tus propias palabras la forma del acorde de potencia — qué dedo va dónde, y qué le da el nombre al acorde?' }
          },
          {
            text: 'Watch: <a href="https://youtu.be/DVveuwoVmmY" target="_blank">Power Chords for Beginners – Marty Music</a> (0:00–3:00).',
            text_es: 'Mira: <a href="https://youtu.be/DVveuwoVmmY" target="_blank">Power Chords for Beginners – Marty Music</a> (0:00–3:00).',
            hint: 'Notice how he moves the same shape to different positions. As he does, slide your own shape along to A5 and G5 with him.',
            hint_es: 'Fíjate en cómo él mueve la misma forma a distintas posiciones. Mientras lo hace, desliza tu propia forma hasta A5 y G5 junto con él.',
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
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
          {
            text: 'Station Wrap-Up — pause and think: which felt harder today — getting both notes to ring clean, or stopping the other strings from sounding? What started to help?',
            text_es: 'Cierre de la estación — pausa y piensa: ¿qué se sintió más difícil hoy — lograr que las dos notas suenen limpias, o evitar que sonaran las otras cuerdas? ¿Qué empezó a ayudarte?',
            response: { type: 'short', placeholder: 'e.g. muting — my strumming hand kept letting the high strings ring',
              placeholder_es: 'p. ej. silenciar — mi mano de rasgueo seguía dejando sonar las cuerdas agudas' }
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
            title: 'Fret a clean power chord & mute unused strings',
            title_es: 'Trastea un acorde de potencia limpio y silencia las cuerdas que no uses',
            steps: [
          {
            text: 'Challenge 1 — Clean E5: fret an E5 power chord (low E open root + 2nd fret A string) and strum just those two strings — no others. You\'ve got it when: a clean, buzz-free E5 with nothing else ringing.',
            text_es: 'Reto 1 — E5 limpio: trastea un acorde de potencia E5 (raíz Mi grave al aire + traste 2 de la cuerda La) y rasguea solo esas dos cuerdas — ninguna otra. Lo tienes cuando: un E5 limpio, sin zumbido, y nada más sonando.',
            hint: 'For E5 the root is the OPEN low E — no index finger needed. Just place your ring finger on the A string, 2nd fret (that note is the chord\'s fifth). Keep your pinky close. Palm-mute the strings below with the edge of your picking hand.',
            hint_es: 'Para E5 la raíz es la Mi grave AL AIRE — no hace falta el dedo índice. Solo coloca tu dedo anular en la cuerda La, traste 2 (esa nota es la quinta del acorde). Mantén tu meñique cerca. Silencia con la palma las cuerdas de abajo usando el borde de tu mano de pulsar.',
            stuck: 'Pluck the two notes one at a time first — make sure each rings alone — then strum them together.',
            stuck_es: 'Pulsa las dos notas una a la vez primero — asegúrate de que cada una suene sola — y luego rasguéalas juntas.',
            levelUp: 'Lift right off and re-fret the chord 5 times in a row, clean every single time.',
            levelUp_es: 'Levanta la mano por completo y vuelve a trastear el acorde 5 veces seguidas, limpio cada vez.',
            skills: [1, 3],
            chords: [
              { name: 'E5', chord: [[6,0],[5,2,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 0 }
            ]
          },
          {
            text: 'Challenge 2 — Mute Check: fret your E5 and strum hard across ALL six strings. You\'ve got it when: strum all six strings but only the two power-chord notes ring — the other four stay silent.',
            text_es: 'Reto 2 — Revisión de silenciado: trastea tu E5 y rasguea fuerte las SEIS cuerdas. Lo tienes cuando: rasgueas las seis cuerdas pero solo suenan las dos notas del acorde de potencia — las otras cuatro quedan en silencio.',
            hint: 'Let your fretting ring finger lean to deaden the strings above, and rest the side of your strumming hand lightly on the strings below the chord. A hard strum should still sound like just two notes.',
            hint_es: 'Deja que tu dedo anular al trastear se incline para apagar las cuerdas de arriba, y apoya el borde de tu mano de rasgueo suavemente sobre las cuerdas debajo del acorde. Un rasgueo fuerte debe seguir sonando como solo dos notas.',
            stuck: 'Mute with the fretting hand first — let a finger lightly touch the strings you\'re not playing — then add the side of your strumming hand.',
            stuck_es: 'Silencia primero con la mano de trastear — deja que un dedo toque suavemente las cuerdas que no estás tocando — y luego agrega el borde de tu mano de rasgueo.',
            levelUp: 'Do the same on G5 and A5, where your hand has to shift up the neck and re-find the mute.',
            levelUp_es: 'Haz lo mismo con G5 y A5, donde tu mano tiene que desplazarse por el mástil y volver a encontrar el silenciado.',
            skills: [3]
          }
            ]
          },
          {
            title: 'Move the power chord shape along the E & A strings',
            title_es: 'Mueve la forma del acorde de potencia por las cuerdas Mi y La',
            steps: [
          {
            text: 'Challenge 3 — Shape Shifter: slide the same shape to A5 (5th fret E), G5 (3rd fret E), D5 (5th fret A), and C5 (3rd fret A), saying each name aloud. You\'ve got it when: hit all four cleanly without losing the shape.',
            text_es: 'Reto 3 — Cambiaformas: desliza la misma forma a A5 (traste 5 de Mi), G5 (traste 3 de Mi), D5 (traste 5 de La), y C5 (traste 3 de La), diciendo cada nombre en voz alta. Lo tienes cuando: tocas las cuatro limpias sin perder la forma.',
            hint: 'Keep the same finger shape and just move it along the neck. The gap between your two fingers never changes.',
            hint_es: 'Mantén la misma forma de dedos y solo muévela por el mástil. La distancia entre tus dos dedos nunca cambia.',
            stuck: 'Park on just G5 and A5 (both E-string) and switch between them until it\'s smooth, then add the A-string chords.',
            stuck_es: 'Quédate solo con G5 y A5 (ambos en la cuerda Mi) y alterna entre ellos hasta que salga fluido, y luego agrega los acordes de la cuerda La.',
            levelUp: 'Make quick flashcards (E5, A5, C5, D5…), shuffle them, and find each chord within 3 seconds of flipping a card — no counting frets. Got someone around? Have them call out chords instead.',
            levelUp_es: 'Haz tarjetas rápidas (E5, A5, C5, D5…), mézclalas, y encuentra cada acorde en menos de 3 segundos al voltear una tarjeta — sin contar trastes. ¿Tienes a alguien cerca? Pídele que diga los acordes en voz alta en tu lugar.',
            skills: [2, 4],
            chords: [
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'C5', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
            ]
          }
            ]
          },
          {
            title: 'Name the root as you climb the neck (E & A strings)',
            title_es: 'Nombra la raíz mientras subes por el mástil (cuerdas Mi y La)',
            steps: [
          {
            text: 'Challenge 4 — Name & Climb (E string): walk the power chord UP the low E string and say each root aloud as you land it — E5 (open), F5 (1), G5 (3), A5 (5), B5 (7), C5 (8), D5 (10), E5 (12). You\'ve got it when: name every root correctly, without looking at the chart, all the way to the 12th fret.',
            text_es: 'Reto 4 — Nombra y sube (cuerda Mi): camina el acorde de potencia SUBIENDO por la cuerda Mi grave y di cada raíz en voz alta al llegar a ella — E5 (al aire), F5 (1), G5 (3), A5 (5), B5 (7), C5 (8), D5 (10), E5 (12). Lo tienes cuando: nombras cada raíz correctamente, sin mirar el diagrama, hasta el traste 12.',
            hint: 'You learned every note on the low E string in Module 2 — this is that same map. The root is wherever your index finger sits. Hit the natural notes; skip the sharps for now.',
            hint_es: 'Aprendiste todas las notas de la cuerda Mi grave en el Módulo 2 — es el mismo mapa. La raíz es donde sea que esté tu dedo índice. Toca las notas naturales; sáltate los sostenidos por ahora.',
            stuck: 'Do frets 0–7 only first (E5–B5), then add 8–12 once those are automatic.',
            stuck_es: 'Haz solo los trastes 0–7 primero (E5–B5), y luego agrega el 8–12 una vez que esos sean automáticos.',
            levelUp: 'Name your way back DOWN the string (12 → 0) without counting, or do the lap (a lap = one full time through) at 80 BPM.',
            levelUp_es: 'Nombra tu camino de regreso BAJANDO por la cuerda (12 → 0) sin contar, o haz la vuelta (una vuelta = un recorrido completo) a 80 BPM.',
            skills: [2],
            chords: [
              { name: 'E5', chord: [[6,0],[5,2,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 0 },
              { name: 'F5', chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 1 },
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'B5', chord: [[6,7,'1'],[5,9,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 7 },
              { name: 'C5', chord: [[6,8,'1'],[5,10,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 8 },
              { name: 'D5', chord: [[6,10,'1'],[5,12,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 10 },
              { name: 'E5', chord: [[6,12,'1'],[5,14,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 12 }
            ]
          },
          {
            text: 'Challenge 5 — Name & Climb (A string): now do the same up the A string — A5 (open), B5 (2), C5 (3), D5 (5), E5 (7), F5 (8), G5 (10), A5 (12). You\'ve got it when: name every root correctly, and notice the same note names land in different spots than they did on the E string.',
            text_es: 'Reto 5 — Nombra y sube (cuerda La): ahora haz lo mismo subiendo por la cuerda La — A5 (al aire), B5 (2), C5 (3), D5 (5), E5 (7), F5 (8), G5 (10), A5 (12). Lo tienes cuando: nombras cada raíz correctamente, y notas que los mismos nombres de nota caen en lugares distintos a los de la cuerda Mi.',
            hint: 'These are the A-string notes from Module 2. Keep the low E muted so only the power chord rings. Same note, new home — that\'s how the fretboard works.',
            hint_es: 'Estas son las notas de la cuerda La del Módulo 2. Mantén la Mi grave silenciada para que solo suene el acorde de potencia. La misma nota, un nuevo hogar — así funciona el diapasón.',
            stuck: 'Cover frets 0–5 (A5–D5) without looking at the chart first, then add the rest.',
            stuck_es: 'Cubre los trastes 0–5 (A5–D5) sin mirar el diagrama primero, y luego agrega el resto.',
            levelUp: 'Write random frets (0–12) for either string on flashcards, shuffle, and name each root on the spot as you flip. Got someone around? Have them call out frets instead.',
            levelUp_es: 'Escribe trastes al azar (0–12) de cualquiera de las dos cuerdas en tarjetas, mézclalas, y nombra cada raíz al instante al voltearlas. ¿Tienes a alguien cerca? Pídele que diga los trastes en voz alta en tu lugar.',
            skills: [4],
            chords: [
              { name: 'A5', chord: [[6,'x'],[5,0],[4,2,'3'],[3,'x'],[2,'x'],[1,'x']], position: 0 },
              { name: 'B5', chord: [[6,'x'],[5,2,'1'],[4,4,'3'],[3,'x'],[2,'x'],[1,'x']], position: 2 },
              { name: 'C5', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'E5', chord: [[6,'x'],[5,7,'1'],[4,9,'3'],[3,'x'],[2,'x'],[1,'x']], position: 7 },
              { name: 'F5', chord: [[6,'x'],[5,8,'1'],[4,10,'3'],[3,'x'],[2,'x'],[1,'x']], position: 8 },
              { name: 'G5', chord: [[6,'x'],[5,10,'1'],[4,12,'3'],[3,'x'],[2,'x'],[1,'x']], position: 10 },
              { name: 'A5', chord: [[6,'x'],[5,12,'1'],[4,14,'3'],[3,'x'],[2,'x'],[1,'x']], position: 12 }
            ]
          }
            ]
          },
          {
            title: 'Play a power chord progression in time',
            title_es: 'Toca una progresión de acordes de potencia a tiempo',
            steps: [
          {
            text: 'Challenge 6 — Watchtower Loop (your assessment piece): play A5–G5–F5–G5, two beats per chord at 60 BPM — this is exactly how the record cycles. You\'ve got it when: four times through, changing on the beat every time, with no stops. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
            text_es: 'Reto 6 — Vuelta de Watchtower (tu pieza de evaluación): toca A5–G5–F5–G5, dos tiempos por acorde a 60 BPM — así es exactamente como cicla la grabación. Lo tienes cuando: cuatro veces seguidas, cambiando a tiempo cada vez, sin detenerte. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 3 de 5</a>.',
            hint: 'A5 = 5th fret E string, G5 = 3rd fret E string, F5 = 1st fret E string. Shift smoothly — aim to land exactly on beat 1. (The original song uses an Am chord, but as a power chord it\'s just A5 — no major or minor.) This is your Set 1 check-off loop — record a lap and listen back.',
            hint_es: 'A5 = traste 5 de la cuerda Mi, G5 = traste 3 de la cuerda Mi, F5 = traste 1 de la cuerda Mi. Cambia con suavidad — apunta a caer exactamente en el tiempo 1. (La canción original usa un acorde de Am, pero como acorde de potencia es solo A5 — sin mayor ni menor.) Esta es tu vuelta de verificación de la Unidad 1 — graba una vuelta y escúchala después.',
            stuck: 'Loop just A5–G5 (frets 5 and 3) until that change is clean, then add F5.',
            stuck_es: 'Repite solo A5–G5 (trastes 5 y 3) hasta que ese cambio salga limpio, y luego agrega F5.',
            levelUp: 'Play it with an eighth-note strum (down on each number, up on each "+": "1 + 2 + 3 + 4 +"), or push past 70 BPM.',
            levelUp_es: 'Tócalo con un rasgueo de corcheas (abajo en cada número, arriba en cada "+": "1 + 2 + 3 + 4 +"), o sube de 70 BPM.',
            skills: [2, 5, 6],
            chords: [
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'G5',  chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'F5',  chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 1 }
            ],
            response: { type: 'short', prompt: 'Personal record: play it cleanly at 60, then raise the metronome +10 at a time. Your fastest CLEAN loop today (BPM)?', prompt_es: 'Récord personal: tócala limpia a 60, y luego sube el metrónomo de 10 en 10. ¿Tu vuelta LIMPIA más rápida hoy (BPM)?', placeholder: 'e.g. 80 — try for a higher number next session', placeholder_es: 'p. ej. 80 — intenta superarlo la próxima sesión' }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                text: 'Challenge — Seven Nation Army, verse riff: play the riff (a short musical phrase that repeats) as two-string power chords sliding along the A string, one chord per riff note at 60 BPM. You\'ve got it when: two clean laps in a row, both strings of every chord ringing. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
                text_es: 'Reto — Seven Nation Army, riff de la estrofa: toca el riff (una frase musical corta que se repite) como acordes de potencia de dos cuerdas deslizándose por la cuerda La, un acorde por nota del riff a 60 BPM. Lo tienes cuando: dos vueltas limpias seguidas, con ambas cuerdas de cada acorde sonando. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 3 de 5</a>.',
                hint: 'It\'s one shape sliding — keep your grip and let your arm do the moving.',
                hint_es: 'Es una sola forma deslizándose — mantén el agarre y deja que tu brazo haga el movimiento.',
                stuck: 'Play roots-only (your Module 2 line), then add the second string back one chord at a time.',
                stuck_es: 'Toca solo las raíces (tu línea del Módulo 2), y luego agrega de vuelta la segunda cuerda un acorde a la vez.',
                levelUp: 'Palm-mute the whole lap for the verse sound, then open up for a chorus lap.',
                levelUp_es: 'Silencia con la palma toda la vuelta para el sonido de la estrofa, y luego abre el sonido para una vuelta de coro.',
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
                response: { type: 'short', prompt: 'Which slide was hardest to land clean, and what fixed it?', prompt_es: '¿Qué deslizamiento fue el más difícil de hacer limpio, y qué lo arregló?', placeholder: 'e.g. E5 up to G5 — smaller jumps helped', placeholder_es: 'p. ej. de E5 a G5 — saltos más pequeños ayudaron' }
              }
            ]
          },
          {
            title: 'My Practice Routine — weekly check-in (never graded)',
            title_es: 'Mi rutina de práctica — check-in semanal (nunca se califica)',
            steps: [
              {
                text: 'Plan your practice — this one\'s just for you, never graded. Take two minutes to update your routine: (1) one thing you want to get better at, (2) when and where you\'ll practice this week, (3) how last week\'s plan went. Same check-in as Modules 1 and 2 — you\'ll keep it going through the whole course.',
                text_es: 'Planea tu práctica — esta parte es solo para ti, nunca se califica. Tómate dos minutos para actualizar tu rutina: (1) una cosa en la que quieres mejorar, (2) cuándo y dónde vas a practicar esta semana, (3) cómo te fue con el plan de la semana pasada. El mismo check-in de los Módulos 1 y 2 — lo vas a mantener durante todo el curso.',
                hint: 'No wrong answers — even five minutes a day is better than one long rushed session. You\'re building a habit you\'ll actually keep.',
                hint_es: 'No hay respuestas incorrectas — hasta cinco minutos al día es mejor que una sola sesión larga y apurada. Estás construyendo un hábito que de verdad vas a mantener.',
                response: { type: 'short', placeholder: '1) One thing to improve   2) When & where I\'ll practice   3) How last week went',
                  placeholder_es: '1) Algo que quiero mejorar   2) Cuándo y dónde voy a practicar   3) Cómo me fue la semana pasada' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                text: 'Which power chord change or muting move still feels shaky? Write it below — that\'s your warm-up target next time you practice.',
                text_es: '¿Qué cambio de acorde de potencia o movimiento de silenciado todavía se siente inestable? Escríbelo abajo — ese es tu objetivo de calentamiento la próxima vez que practiques.',
                response: { type: 'short', placeholder: 'e.g. the G5-to-F5 change drops a beat; high strings still ring sometimes',
                  placeholder_es: 'p. ej. el cambio de G5 a F5 pierde un tiempo; las cuerdas agudas a veces todavía suenan' }
              }
            ]
          },
          {
            title: '⚡ Ear Spark — optional ear bonus',
            title_es: '⚡ Chispa auditiva — bono opcional de oído',
            steps: [
              {
                text: '⚡ Ear Spark (optional, 2 min): first, build a full open E major — it\'s your E5 (open low E + A string, 2nd fret) with two notes added: G string, 1st fret and D string, 2nd fret, letting the open B and high e ring too. Now write "power" on a few paper slips and "full" on a few others, shuffle them face-down, and draw one at a time: play E5 for a "power" slip or the full E major for a "full" slip, a few reps. On playback, call each one "power" or "full" before flipping the slip to check — power chords are hollow, with no major/minor color. Got someone around? Have them play while you look away.',
                text_es: '⚡ Chispa auditiva (opcional, 2 min): primero, arma un Mi mayor al aire completo — es tu E5 (Mi grave al aire + cuerda La, traste 2) con dos notas agregadas: cuerda Sol, traste 1 y cuerda Re, traste 2, dejando sonar también la B y la mi aguda al aire. Ahora escribe "potencia" en algunos papelitos y "completo" en otros, mézclalos boca abajo, y saca uno a la vez: toca E5 para un papelito de "potencia" o el Mi mayor completo para uno de "completo", varias repeticiones. Al escuchar, di "potencia" o "completo" antes de voltear el papelito para comprobar — los acordes de potencia suenan huecos, sin color mayor o menor. ¿Tienes a alguien cerca? Que toque mientras miras hacia otro lado.'
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Frets a clean 2-finger power chord · Moves shape along E string without buzzing · Moves shape along A string · Mutes unused strings cleanly · Plays a chord on the beat · Reads a power chord TAB',
      goal_es: 'Trastea un acorde de potencia limpio con dos dedos · Mueve la forma por la cuerda Mi sin zumbido · Mueve la forma por la cuerda La · Silencia las cuerdas que no usa de forma limpia · Toca un acorde a tiempo · Lee un TAB de acordes de potencia',
      performance: 'Record yourself playing the A5–G5–F5–G5 loop at 60 BPM, then listen back for muting and timing.',
      selfCheck: 'Can you fret a power chord with no buzzing from unused strings? Can you move the shape to 3 different positions without pausing?',
      selfCheck_es: '¿Puedes trastear un acorde de potencia sin zumbido de las cuerdas que no usas? ¿Puedes mover la forma a 3 posiciones distintas sin pausar?',
      standards: ['Pr.4a', 'Pr.5a', 'Re.7a']
    },

    skills: [
      { id: 'm3w1-s1', text: 'Fret a clean 2-finger power chord (root + 5th) with no buzzing',
        text_es: 'Trastear un acorde de potencia limpio con dos dedos (raíz + quinta) sin zumbido',
        gotItWhen: 'both notes ring clearly when you strum, with no buzz and no muffled strings — and it sounds the same every time you play it.',
        gotItWhen_es: 'las dos notas suenan claramente al rasguear, sin zumbido y sin cuerdas apagadas — y suena igual cada vez que lo tocas.',
        practice: { type: 'mc', prompt: 'A power chord is built from which two scale degrees (a scale degree = a note\'s number in the scale, counting up from the root)?',
          prompt_es: '¿Un acorde de potencia se construye con cuáles dos grados de la escala (un grado de la escala = el número de una nota en la escala, contando desde la raíz)?',
          choices: ['Root + 3rd', 'Root + 5th', 'Root + 7th', 'Root + octave'],
          choices_es: ['Raíz + 3ª', 'Raíz + 5ª', 'Raíz + 7ª', 'Raíz + octava'], answer: 1 } },
      { id: 'm3w1-s2', text: 'Move the power chord shape along the E string (E5, G5, A5, B5)',
        text_es: 'Mover la forma del acorde de potencia por la cuerda Mi (E5, G5, A5, B5)',
        gotItWhen: 'you can move the same shape to any of those positions on call and name the chord without counting frets.',
        gotItWhen_es: 'puedes mover la misma forma a cualquiera de esas posiciones a pedido y nombrar el acorde sin contar trastes.',
        practice: { type: 'mc', prompt: 'Your index finger is on the low E string at fret 5. Which power chord are you playing?',
          prompt_es: 'Tu dedo índice está en la cuerda Mi grave, traste 5. ¿Qué acorde de potencia estás tocando?',
          choices: ['G5', 'A5', 'B5', 'D5'], choices_es: ['G5', 'A5', 'B5', 'D5'], answer: 1 } },
      { id: 'm3w1-s3', text: 'Mute unused strings with palm and fretting hand',
        text_es: 'Silenciar las cuerdas que no usas con la palma y la mano de trastear',
        gotItWhen: 'you can strum hard across all 6 strings and only the two intentional notes ring — the other 4 stay silent.',
        gotItWhen_es: 'puedes rasguear fuerte las 6 cuerdas y solo suenan las dos notas intencionadas — las otras 4 quedan en silencio.',
        practice: { type: 'mc', prompt: 'You strum all 6 strings on an E-root power chord, but extra strings keep ringing. What\'s the real fix?',
          prompt_es: 'Rasgueas las 6 cuerdas en un acorde de potencia con raíz en Mi, pero siguen sonando cuerdas de más. ¿Cuál es el verdadero arreglo?',
          choices: ['Strum much more softly', 'Aim your strum so you only ever hit the two strings you want', 'Let your fretting fingers lean lightly against the unused strings to mute them', 'Press the unused strings all the way down with spare fingers'],
          choices_es: ['Rasguear mucho más suave', 'Apuntar tu rasgueo para golpear solo las dos cuerdas que quieres', 'Dejar que tus dedos de trastear se apoyen suavemente contra las cuerdas sin usar para silenciarlas', 'Presionar las cuerdas sin usar hasta el fondo con los dedos libres'], answer: 2,
          explain: 'Muting comes from the fretting hand touching — not pressing — the strings you don\'t want. Perfect strum aim isn\'t reliable; pros strum through the mute.',
          explain_es: 'El silenciado viene de la mano de trastear tocando — sin presionar — las cuerdas que no quieres. Apuntar perfecto no es confiable; los profesionales rasguean a través del silenciado.' } },
      { id: 'm3w1-s4', text: 'Move the power chord shape along the A string (A5, C5, D5)',
        text_es: 'Mover la forma del acorde de potencia por la cuerda La (A5, C5, D5)',
        gotItWhen: 'you can shift the shape to the A-string root without your palm mute breaking — and the low E string stays silent.',
        gotItWhen_es: 'puedes desplazar la forma a la raíz de la cuerda La sin que se rompa tu silenciado con la palma — y la cuerda Mi grave se queda en silencio.',
        practice: { type: 'mc', prompt: 'Your index finger is on the A string at fret 3. Which power chord are you playing?',
          prompt_es: 'Tu dedo índice está en la cuerda La, traste 3. ¿Qué acorde de potencia estás tocando?',
          choices: ['B5', 'C5', 'D5', 'A5'], choices_es: ['B5', 'C5', 'D5', 'A5'], answer: 1 } },
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
          choices_es: ['Tocar solo la nota A', 'Un acorde de potencia con raíz en A', 'Un acorde mayor', 'Tocar el traste 5 de la cuerda La'], answer: 1 } }
    ]
  },

  {
    id: 'm3w2',
    songThread: [{ name: 'Luna', journey: 'tabs/luna.html', layer: 3, note: 'the F5–A5 vamp' }, { name: 'Sweet Child O\' Mine', journey: 'tabs/sweet-child-o-mine.html', layer: 3, note: 'D5–C5–G5 — your assessment piece' }, { name: 'All Along the Watchtower', journey: 'tabs/all-along-the-watchtower.html', layer: 3, note: 'the A5–G5–F5 loop' }, { name: '"the cure"', journey: 'tabs/the-cure.html', layer: 3, note: 'the changes as power chords' }],
    label: 'Set 2',
    locked: false,
    module: 'Two-Finger Power Chords',
    moduleNum: 3,
    unit: 'Module 3 · Two-Finger Power Chords',
    unit_es: 'Módulo 3 · Acordes de potencia con dos dedos',
    title: 'Set 2',
    subtitle: 'Power chords with metronome · Chord changes · Strumming patterns',
    subtitle_es: 'Acordes de potencia con metrónomo · Cambios de acorde · Patrones de rasgueo',
    objective: 'I CAN change power chords on beat 1 at 60 BPM and hold a steady 8-bar progression up to 80 BPM.',
    skillFocus: 'Changing power chords in time · Building speed with a metronome · Playing a song progression',
    skillFocus_es: 'Cambiar acordes de potencia a tiempo · Ganar velocidad con un metrónomo · Tocar la progresión de una canción',
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
            text: 'Watch: <a href="https://youtu.be/sNa44EmrsDc" target="_blank">How & Why to Use a Metronome – JustinGuitar</a> (0:00–4:00).',
            text_es: 'Mira: <a href="https://youtu.be/sNa44EmrsDc" target="_blank">How & Why to Use a Metronome – JustinGuitar</a> (0:00–4:00).',
            hint: 'His tip about setting the metronome 10 BPM slower than you think you need is key. As he explains it, set your own metronome and tap along. Slow is smooth, smooth is fast — practice slowly and cleanly, and speed comes on its own.',
            hint_es: 'Su consejo de poner el metrónomo 10 BPM más lento de lo que crees que necesitas es clave. Mientras lo explica, pon tu propio metrónomo y sigue el ritmo con la mano. Despacio es suave, suave es rápido — practica despacio y limpio, y la velocidad llega sola.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'According to the video, where should you set the metronome when learning something new?',
              prompt_es: 'Según el video, ¿dónde deberías poner el metrónomo cuando estás aprendiendo algo nuevo?',
              answer: 0,
              explain: 'Start a touch slower than feels comfortable — clean and in time first, then speed up. Practicing fast and sloppy just makes the mistakes permanent.',
              explain_es: 'Empieza un poco más despacio de lo que se siente cómodo — limpio y a tiempo primero, y luego acelera. Practicar rápido y descuidado solo hace permanentes los errores.',
              choices: [
              'About 10 BPM slower than you think you need',
              'As fast as you can possibly play',
              'It doesn\'t matter — pick any tempo',
              'Always 120 BPM'
            ],
              choices_es: [
              'Cerca de 10 BPM más lento de lo que crees que necesitas',
              'Lo más rápido que puedas tocar',
              'No importa — elige cualquier tempo',
              'Siempre 120 BPM'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/m3dYOsXbWII" target="_blank">Easy Power-Chord Songs Everyone Should Know – Marty Music</a> (0:00–3:00).',
            text_es: 'Mira: <a href="https://youtu.be/m3dYOsXbWII" target="_blank">Easy Power-Chord Songs Everyone Should Know – Marty Music</a> (0:00–3:00).',
            hint: 'Pick one song you recognize and try to play along as it plays. Match the strum timing to what you hear.',
            hint_es: 'Elige una canción que reconozcas e intenta tocarla junto con el video. Iguala el momento del rasgueo con lo que escuchas.',
            skills: [3, 4],
            response: { type: 'short', placeholder: 'Which song did you try to play along with? What was hardest about it?',
              placeholder_es: '¿Con qué canción intentaste tocar junto? ¿Qué fue lo más difícil de eso?' }
          },
          {
            text: 'Watch: <a href="https://youtu.be/q8SHmo1-dac" target="_blank">3 Tips to NAIL Alternate Picking (build speed) – JustinGuitar</a> (0:00–3:00). Alternate picking means strict down-up-down-up — every downstroke is followed by an upstroke, so the pick never travels the same way twice in a row. Watch his tempo-step method for building speed.',
            text_es: 'Mira: <a href="https://youtu.be/q8SHmo1-dac" target="_blank">3 Tips to NAIL Alternate Picking (build speed) – JustinGuitar</a> (0:00–3:00). Púa alterna significa abajo-arriba-abajo-arriba estricto — cada golpe hacia abajo va seguido de uno hacia arriba, así que la púa nunca viaja en la misma dirección dos veces seguidas. Mira su método de pasos de tempo para ganar velocidad.',
            hint: 'Notice his method for building tempo gradually. As he describes it, try it: play your "Watchtower" loop at 60 BPM, then bump to 65, then 70.',
            hint_es: 'Fíjate en su método para subir el tempo gradualmente. Mientras lo describe, pruébalo: toca tu vuelta de "Watchtower" a 60 BPM, y luego sube a 65 y a 70.',
            skills: [1, 2],
            response: { type: 'short', placeholder: 'In one sentence, describe his method for building up tempo gradually.',
              placeholder_es: 'En una oración, describe su método para subir el tempo gradualmente.' }
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
          {
            text: 'Station Wrap-Up — pause and think: at what tempo does your loop start to fall apart, and which part breaks down first — the change, the strum, or the muting?',
            text_es: 'Cierre de la estación — pausa y piensa: ¿a qué tempo tu vuelta empieza a desarmarse, y qué parte falla primero — el cambio, el rasgueo, o el silenciado?',
            response: { type: 'short', placeholder: 'e.g. around 75 BPM the F5 change gets late',
              placeholder_es: 'p. ej. cerca de 75 BPM el cambio a F5 se atrasa' }
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
            text: 'Challenge 1 — Loop in Time: play the "Watchtower" loop (A5–G5–F5–G5) at 60 BPM, each chord one bar (4 beats), four times through. You\'ve got it when: every chord change lands on beat 1, with no stops.',
            text_es: 'Reto 1 — Vuelta a tiempo: toca la vuelta de "Watchtower" (A5–G5–F5–G5) a 60 BPM, cada acorde un compás (4 tiempos), cuatro veces seguidas. Lo tienes cuando: cada cambio de acorde cae en el tiempo 1, sin detenerte.',
            hint: 'If you miss beat 1, keep going — don\'t stop. Staying in time matters more than the perfect change right now.',
            hint_es: 'Si te pierdes el tiempo 1, sigue tocando — no te detengas. Mantenerte a tiempo importa más que el cambio perfecto por ahora.',
            stuck: 'Drop to 50 BPM and get it clean there first; play through a missed change instead of stopping to fix it.',
            stuck_es: 'Baja a 50 BPM y déjalo limpio ahí primero; sigue tocando aunque falles un cambio en vez de detenerte a corregirlo.',
            levelUp: 'Bump to 70 BPM, or change chords every two beats instead of every bar so the moves come twice as fast.',
            levelUp_es: 'Sube a 70 BPM, o cambia de acorde cada dos tiempos en vez de cada compás para que los cambios lleguen el doble de rápido.',
            skills: [1, 2]
          }
            ]
          },
          {
            title: 'Speed changes — every two beats, then every beat',
            title_es: 'Cambios más rápidos — cada dos tiempos, y luego cada tiempo',
            steps: [
          {
            text: 'Challenge — Half-Bar Power Switches (2 chords): real riffs change faster than once a bar. Keep A5 and D5, but switch every TWO beats — two down-strums on A5, two on D5, and repeat, at 60 BPM. That\'s a change every half-bar, twice as often as the loops so far. You\'ve got it when: four laps where every switch lands right on the beat, no stops. Press &#x25B6; to hear the target.',
            text_es: 'Reto — Cambios de potencia por medio compás (2 acordes): los riffs reales cambian más rápido que una vez por compás. Mantén A5 y D5, pero cambia cada DOS tiempos — dos rasgueos hacia abajo en A5, dos en D5, y repite, a 60 BPM. Eso es un cambio cada medio compás, el doble de seguido que las vueltas de antes. Lo tienes cuando: cuatro vueltas donde cada cambio cae justo en el tiempo, sin detenerte. Presiona &#x25B6; para escuchar el objetivo.',
            hint: 'A5 and D5 are the same shape one string apart — A5 roots on the low E (fret 5), D5 on the A string (fret 5). Shift the whole shape across and keep your two fingers glued together.',
            hint_es: 'A5 y D5 son la misma forma a una cuerda de distancia — A5 tiene su raíz en la Mi grave (traste 5), D5 en la cuerda La (traste 5). Desplaza toda la forma y mantén tus dos dedos pegados.',
            stuck: 'Drop to 50 BPM. Start moving your fingers to the next chord on the "and" after beat 2, so the shape is ready before the switch.',
            stuck_es: 'Baja a 50 BPM. Empieza a mover tus dedos hacia el siguiente acorde en el "y" después del tiempo 2, para que la forma esté lista antes del cambio.',
            levelUp: 'Climb to 70, then 80 BPM, or jump ahead to the every-beat drill below.',
            levelUp_es: 'Sube a 70, y luego a 80 BPM, o salta al ejercicio de cada tiempo de abajo.',
            skills: [1, 2],
            chords: [
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
            ],
            playSeq: { label: 'Hear it — A5·A5 · D5·D5 (change every 2 beats)', label_es: 'Escúchalo — A5·A5 · D5·D5 (cambio cada 2 tiempos)', bpm: 60, notes: [[45,52],[45,52],[50,57],[50,57],[45,52],[45,52],[50,57],[50,57]] }
          },
          {
            text: 'Challenge — Three-Chord Half-Bar (3 chords): now three shapes, still two beats each — G5 · C5 · D5, then back to G5, looping at 60 BPM. That\'s a I–IV–V in the key of G, the backbone of thousands of songs, moving at chorus speed. You\'ve got it when: two clean laps, every change on the beat.',
            text_es: 'Reto — Medio compás con tres acordes (3 acordes): ahora tres formas, todavía dos tiempos cada una — G5 · C5 · D5, y de vuelta a G5, repitiendo a 60 BPM. Eso es un I–IV–V en la tonalidad de G, la columna vertebral de miles de canciones, moviéndose a velocidad de coro. Lo tienes cuando: dos vueltas limpias, cada cambio a tiempo.',
            hint: 'C5 and D5 are both A-string roots two frets apart (frets 3 and 5); G5 drops to the low E string (fret 3). Group the two A-string shapes in your mind, then the hop down to G5.',
            hint_es: 'C5 y D5 son ambas raíces de la cuerda La a dos trastes de distancia (trastes 3 y 5); G5 baja a la cuerda Mi grave (traste 3). Agrupa mentalmente las dos formas de la cuerda La, y luego el salto a G5.',
            stuck: 'Loop just C5 → D5 (the same-string, two-fret slide) until it\'s automatic, then add the G5 hop.',
            stuck_es: 'Repite solo C5 → D5 (el deslizamiento de dos trastes en la misma cuerda) hasta que sea automático, y luego agrega el salto a G5.',
            levelUp: 'Speed up to 75 BPM, or reorder as G5 · D5 · C5 and keep every change on the beat.',
            levelUp_es: 'Acelera a 75 BPM, o reordénalo como G5 · D5 · C5 y mantén cada cambio a tiempo.',
            skills: [1, 2],
            chords: [
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'C5', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
            ],
            playSeq: { label: 'Hear it — G5·G5 · C5·C5 · D5·D5 (I–IV–V, every 2 beats)', label_es: 'Escúchalo — G5·G5 · C5·C5 · D5·D5 (I–IV–V, cada 2 tiempos)', bpm: 60, notes: [[43,50],[43,50],[48,55],[48,55],[50,57],[50,57]] }
          },
          {
            text: 'Challenge — Four-Chord Half-Bar (Watchtower): the full "All Along the Watchtower" loop as low-E power chords — A5 · G5 · F5 · G5 — two beats each at 60 BPM, looping. Four chord slots inside every two bars — this is exactly how the record cycles. You\'ve got it when: four clean laps, every change landing on the beat.',
            text_es: 'Reto — Medio compás con cuatro acordes (Watchtower): la vuelta completa de "All Along the Watchtower" como acordes de potencia en la cuerda Mi — A5 · G5 · F5 · G5 — dos tiempos cada uno a 60 BPM, repitiendo. Cuatro espacios de acorde dentro de cada dos compases — así es exactamente como cicla la grabación. Lo tienes cuando: cuatro vueltas limpias, cada cambio cayendo a tiempo.',
            hint: 'All three roots sit on the low E string — A5 (fret 5), G5 (fret 3), F5 (fret 1). It\'s one shape walking down the neck and back up.',
            hint_es: 'Las tres raíces están en la cuerda Mi grave — A5 (traste 5), G5 (traste 3), F5 (traste 1). Es una sola forma caminando hacia abajo por el mástil y de regreso.',
            stuck: 'Play just the roots (skip the second string) for one lap to lock the walk, then add the fifth back in.',
            stuck_es: 'Toca solo las raíces (sáltate la segunda cuerda) por una vuelta para fijar el recorrido, y luego agrega de vuelta la quinta.',
            levelUp: 'Palm-mute for a tighter chug, or move on to the every-beat version below.',
            levelUp_es: 'Silencia con la palma para un chug más ajustado, o pasa a la versión de cada tiempo de abajo.',
            skills: [1, 2],
            chords: [
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'F5', chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 1 }
            ],
            playSeq: { label: 'Hear it — A5·G5·F5·G5 (every 2 beats)', label_es: 'Escúchalo — A5·G5·F5·G5 (cada 2 tiempos)', bpm: 60, notes: [[45,52],[45,52],[43,50],[43,50],[41,48],[41,48],[43,50],[43,50]] }
          },
          {
            text: 'Challenge — One Chord Per Beat (Watchtower, fast): the top of the ladder — a new chord on every single beat. Same A5 · G5 · F5 · G5 loop, but one down-strum per beat at 60 BPM, no repeats. This is what a driving riff feels like: no time to think, the next shape has to be ready before you arrive. You\'ve got it when: four laps clean at 60, then climb 65 → 70.',
            text_es: 'Reto — Un acorde por tiempo (Watchtower, rápido): el escalón más alto — un acorde nuevo en cada tiempo. La misma vuelta A5 · G5 · F5 · G5, pero un rasgueo hacia abajo por tiempo a 60 BPM, sin repetir. Así se siente un riff a toda marcha: sin tiempo para pensar, la siguiente forma tiene que estar lista antes de llegar. Lo tienes cuando: cuatro vueltas limpias a 60, y luego sube 65 → 70.',
            hint: 'Because the walk is A5→G5→F5→G5, your hand moves two frets, two frets, then back two — a steady rocking slide. Feel the pattern in your arm, not your eyes.',
            hint_es: 'Como el recorrido es A5→G5→F5→G5, tu mano se mueve dos trastes, dos trastes, y luego dos hacia atrás — un vaivén constante. Siente el patrón en tu brazo, no con los ojos.',
            stuck: 'Cut it in half: loop just A5 · G5, one per beat, until it\'s smooth, then add F5.',
            stuck_es: 'Divide a la mitad: repite solo A5 · G5, uno por tiempo, hasta que sea fluido, y luego agrega F5.',
            levelUp: 'Hold it clean at 80 BPM, or make all four different — E5 · G5 · A5 · C5, one per beat.',
            levelUp_es: 'Mantenlo limpio a 80 BPM, o haz los cuatro distintos — E5 · G5 · A5 · C5, uno por tiempo.',
            skills: [1, 2],
            chords: [
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'F5', chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 1 }
            ],
            playSeq: { label: 'Hear it — A5·G5·F5·G5 (one chord per beat)', label_es: 'Escúchalo — A5·G5·F5·G5 (un acorde por tiempo)', bpm: 60, notes: [[45,52],[43,50],[41,48],[43,50],[45,52],[43,50],[41,48],[43,50]] },
            response: { type: 'short', prompt: 'Your fastest CLEAN one-chord-per-beat Watchtower today (BPM)?', prompt_es: '¿Tu Watchtower a un-acorde-por-tiempo LIMPIO más rápido hoy (BPM)?', placeholder: 'e.g. 70 — 80 next session', placeholder_es: 'p. ej. 70 — 80 la próxima sesión' }
          }
            ]
          },
          {
            title: 'Read and clap the rhythm',
            title_es: 'Lee y aplaude el ritmo',
            steps: [
          {
            text: 'Challenge — Clap & Count: before you play, read this 4-bar rhythm line. Bar 1 = one whole note (clap once, hold all 4 beats). Bar 2 = two half notes (clap on beats 1 and 3, each held 2 beats). Bar 3 = four quarter notes (one clap per beat: 1, 2, 3, 4). Bar 4 = eight straight eighths (two claps per beat: "1 + 2 + 3 + 4 +"). Clap and count all 4 bars out loud. You\'ve got it when: you can clap all 4 bars in time with the metronome at 70 BPM and name which notes are whole, half, quarter, and eighth.',
            text_es: 'Reto — Aplaude y cuenta: antes de tocar, lee esta línea rítmica de 4 compases. Compás 1 = una redonda (aplaude una vez, sostén los 4 tiempos). Compás 2 = dos blancas (aplaude en los tiempos 1 y 3, cada una sostenida 2 tiempos). Compás 3 = cuatro negras (un aplauso por tiempo: 1, 2, 3, 4). Compás 4 = ocho corcheas rectas (dos aplausos por tiempo: "1 + 2 + 3 + 4 +"). Aplaude y cuenta los 4 compases en voz alta. Lo tienes cuando: puedes aplaudir los 4 compases a tiempo con el metrónomo a 70 BPM y nombrar cuáles notas son redondas, blancas, negras y corcheas.',
            hint: 'Whole note = one clap held for a full bar. Half note = one clap held for two beats. Eighth notes = two even claps per beat. The straight-eighths strum you play (down on each number, up on each "+") is just eighth notes — same rhythm, on the guitar.',
            hint_es: 'Redonda = un aplauso sostenido por todo el compás. Blanca = un aplauso sostenido por dos tiempos. Corcheas = dos aplausos parejos por tiempo. El rasgueo de corcheas rectas que tocas (abajo en cada número, arriba en cada "+") son solo corcheas — el mismo ritmo, en la guitarra.',
            stuck: 'Clap quarter notes on every beat first (1 2 3 4), then split one beat into eighths ("1 +") and feel the difference.',
            stuck_es: 'Aplaude negras en cada tiempo primero (1 2 3 4), y luego divide un tiempo en corcheas ("1 +") y siente la diferencia.',
            levelUp: 'Clap one bar of eighths, one bar of quarters, alternating, without losing the count.',
            levelUp_es: 'Aplaude un compás de corcheas, un compás de negras, alternando, sin perder la cuenta.',
            skills: [6]
          }
            ]
          },
          {
            title: 'Play an 8-bar progression with a steady strum',
            title_es: 'Toca una progresión de 8 compases con un rasgueo constante',
            steps: [
          {
            text: 'Challenge — Name Your Progression: I–IV–V ("one–four–five"): musicians number chords by counting up the musical alphabet from the key\'s home note (the note the music rests on and sounds finished). In the key of A: A is I, count up to D for IV, and E for V — so A5–D5–E5 is a I–IV–V. Play A5–D5–E5, two bars each, one strum per beat at 60 BPM. You\'ve got it when: you can play the loop reading only the chord symbols AND say which chord is the I, the IV, and the V. At the module self-check you\'ll read a three-chord (I–IV–V) progression from chord symbols with your named strum — this is that skill.',
            text_es: 'Reto — Nombra tu progresión: I–IV–V ("uno-cuatro-cinco"): los músicos numeran los acordes contando hacia arriba en el alfabeto musical desde la nota base de la tonalidad (la nota en la que descansa la música y que suena resuelta). En la tonalidad de A: A es I, cuenta hacia arriba hasta D para el IV, y E para el V — así que A5–D5–E5 es un I–IV–V. Toca A5–D5–E5, dos compases cada uno, un rasgueo por tiempo a 60 BPM. Lo tienes cuando: puedes tocar la vuelta leyendo solo los símbolos de acorde Y decir cuál acorde es el I, el IV y el V. En el autochequeo del módulo vas a leer una progresión de tres acordes (I–IV–V) a partir de símbolos de acorde con tu rasgueo nombrado — esa es esta destreza.',
            hint: 'All three use the same two-finger shape: A5 root on the E string (fret 5), D5 root on the A string (fret 5) — same fret, string hop! — and E5 root on the A string (fret 7).',
            hint_es: 'Los tres usan la misma forma de dos dedos: A5 con raíz en la cuerda Mi (traste 5), D5 con raíz en la cuerda La (traste 5) — ¡mismo traste, salto de cuerda! — y E5 con raíz en la cuerda La (traste 7).',
            stuck: 'Loop just A5→D5 (the same-fret hop) until it\'s clean, then add E5.',
            stuck_es: 'Repite solo A5→D5 (el salto del mismo traste) hasta que salga limpio, y luego agrega E5.',
            levelUp: 'Transpose it — build a I–IV–V starting from G5 (G–C–D) and name each chord\'s number.',
            levelUp_es: 'Transpórtala — arma un I–IV–V empezando desde G5 (G–C–D) y nombra el número de cada acorde.',
            skills: [2, 4],
            chords: [
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'E5', chord: [[6,'x'],[5,7,'1'],[4,9,'3'],[3,'x'],[2,'x'],[1,'x']], position: 7 }
            ]
          },
          {
            text: 'Challenge 2 — Eighth-Note Strum (one of your assessment pieces): play the A5–D5–E5 loop (two bars each) with straight eighths (down on each number, up on each "+"), counting "1 + 2 + 3 + 4 +". You\'ve got it when: eight bars clean and steady at 60, then speed up in steps (65 → 70 → 75) and hold 80 BPM for at least 15 seconds — that\'s the module bar.',
            text_es: 'Reto 2 — Rasgueo de corcheas (una de tus piezas de evaluación): toca la vuelta A5–D5–E5 (dos compases cada uno) con corcheas rectas (abajo en cada número, arriba en cada "+"), contando "1 + 2 + 3 + 4 +". Lo tienes cuando: ocho compases limpios y constantes a 60, y luego acelera en pasos (65 → 70 → 75) y sostén 80 BPM por al menos 15 segundos — esa es la meta del módulo.',
            hint: 'Start at 60 BPM. If it feels easy, bump up 5 BPM. The module-end self-check is an 8-bar progression changing on beat 1 at 60, then holding 80 BPM for 15 seconds with clean muting — this is that piece.',
            hint_es: 'Empieza a 60 BPM. Si se siente fácil, sube 5 BPM. El autochequeo de fin de módulo es una progresión de 8 compases que cambia en el tiempo 1 a 60, y luego sostiene 80 BPM por 15 segundos con silenciado limpio — esta es esa pieza.',
            stuck: 'Strum down-only on each beat first ("1 2 3 4"), then add the up-strums one at a time.',
            stuck_es: 'Rasguea solo hacia abajo en cada tiempo primero ("1 2 3 4"), y luego agrega los rasgueos hacia arriba de uno en uno.',
            levelUp: 'Hold it clean at 80 BPM, or play it straight through a full song excerpt from the songs list.',
            levelUp_es: 'Mantenlo limpio a 80 BPM, o tócalo de corrido en un fragmento completo de canción de la lista.',
            skills: [3, 4],
            response: { type: 'short', prompt: 'Personal record: once it\'s clean at 60, raise the metronome +5 at a time. Your fastest CLEAN tempo today (BPM)?', prompt_es: 'Récord personal: una vez que esté limpio a 60, sube el metrónomo de 5 en 5. ¿Tu tempo LIMPIO más rápido hoy (BPM)?', placeholder: 'e.g. 75 — try for a higher number next session', placeholder_es: 'p. ej. 75 — intenta superarlo la próxima sesión' }
          },
          {
            text: 'Challenge 3 — Split Strum ("boom-chick"): the other named strum for this progression. Split each pair of beats in two jobs — beat 1: pick ONLY the root (your 1st-finger bass note), beat 2: strum the whole shape. Count "boom-chick, boom-chick": 1 = boom (root alone), 2 = chick (full chord), 3 = boom, 4 = chick. Play the A5–D5–E5 loop this way, two bars each at 60 BPM. Click "Hear the split strum" to hear one bar of A5 then one of D5. You\'ve got it when: eight bars where every boom is JUST the root string and every chick is the full shape — no accidental extra strings on the boom.',
            text_es: 'Reto 3 — Rasgueo dividido ("boom-chick"): el otro rasgueo nombrado para esta progresión. Divide cada par de tiempos en dos trabajos — tiempo 1: pulsa SOLO la raíz (tu nota grave del dedo 1), tiempo 2: rasguea toda la forma. Cuenta "boom-chick, boom-chick": 1 = boom (solo la raíz), 2 = chick (acorde completo), 3 = boom, 4 = chick. Toca la vuelta A5–D5–E5 así, dos compases cada uno a 60 BPM. Haz clic en "Escucha el rasgueo dividido" para oír un compás de A5 y luego uno de D5. Lo tienes cuando: ocho compases donde cada boom es SOLO la cuerda de la raíz y cada chick es la forma completa — sin cuerdas extra por accidente en el boom.',
            hint: 'The pick does two different jobs an inch apart: a small, aimed pick stroke on just the root string, then a relaxed strum through the shape. Keep your eyes on the root string for the boom — that\'s the precision half.',
            hint_es: 'La púa hace dos trabajos distintos a poca distancia: un golpe pequeño y apuntado solo en la cuerda de la raíz, y luego un rasgueo relajado por toda la forma. Mantén la vista en la cuerda de la raíz para el boom — esa es la mitad de precisión.',
            stuck: 'Mute the strings with your fretting hand and drill just the motion: pick-strum, pick-strum, until the aim is automatic. Then fret A5 and add one chord at a time.',
            stuck_es: 'Silencia las cuerdas con tu mano de trastear y ejercita solo el movimiento: pulsa-rasguea, pulsa-rasguea, hasta que la puntería sea automática. Luego trastea A5 y agrega un acorde a la vez.',
            levelUp: 'Split strum the whole I–IV–V from chord symbols only, or mix it: two bars split strum, two bars straight eighths — feel how the same chords groove two different ways (a groove = the steady rhythmic feel).',
            levelUp_es: 'Haz el rasgueo dividido de todo el I–IV–V solo a partir de los símbolos de acorde, o combínalo: dos compases de rasgueo dividido, dos compases de corcheas rectas — siente cómo los mismos acordes groovean de dos formas distintas (un groove = la sensación rítmica constante).',
            skills: [3, 4],
            playSeq: { label: 'Hear the split strum', label_es: 'Escucha el rasgueo dividido', bpm: 70, notes: [45, [45,52], 45, [45,52], 50, [50,57], 50, [50,57]] }
          }
            ]
          },
          {
            title: 'Optional: add octave doubling',
            title_es: 'Opcional: agrega duplicación de octava',
            steps: [
          {
            text: 'Challenge 4 — Octave Add-On (try it!): add your pinky on the next string, at the same fret as your ring finger, to make a 3-note power chord. No score — just try it and notice how the sound changes.',
            text_es: 'Reto 4 — Octava extra (¡pruébalo!): agrega tu meñique en la siguiente cuerda, en el mismo traste que tu anular, para hacer un acorde de potencia de 3 notas. Sin puntaje — solo pruébalo y nota cómo cambia el sonido.',
            hint: 'This is optional. If your power chord sounds clean as is, keep it. Only add the 3rd finger if you can do it without buzzing.',
            hint_es: 'Esto es opcional. Si tu acorde de potencia ya suena limpio, déjalo así. Agrega el tercer dedo solo si puedes hacerlo sin zumbido.',
            skills: [5]
          }
            ]
          },
          {
            title: 'Luna: F5–A5 two-shape metronome drill',
            title_es: 'Luna: ejercicio de metrónomo con dos formas F5–A5',
            steps: [
          {
            text: 'Challenge — F5 ↔ A5 Two-Shape Drill: Luna\'s whole vamp (a vamp = a short chord pattern repeated over and over) is two power chords — F5 (root F, low E string, fret 1) and A5 (root A, fret 5) — the same two-finger shape sliding four frets. One strum per big beat: Luna is in 6/8, so strum just the downbeats, two per bar, nothing syncopated (syncopated = accents landing off the main beat). You\'ve got it when: you can switch F5 ↔ A5 landing every downbeat clean, speeding up in steps: 60 → 70 → 80 BPM. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
            text_es: 'Reto — Ejercicio de dos formas F5 ↔ A5: todo el vamp de Luna (un vamp = un patrón de acordes corto que se repite una y otra vez) son dos acordes de potencia — F5 (raíz F, cuerda Mi grave, traste 1) y A5 (raíz A, traste 5) — la misma forma de dos dedos deslizándose cuatro trastes. Un rasgueo por tiempo fuerte: Luna está en 6/8, así que rasguea solo los tiempos fuertes, dos por compás, nada sincopado (sincopado = acentos que caen fuera del tiempo principal). Lo tienes cuando: puedes cambiar F5 ↔ A5 cayendo limpio en cada tiempo fuerte, acelerando en pasos: 60 → 70 → 80 BPM. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 3 de 5</a>.',
            hint: 'A power chord has no major or minor — just root + 5th. Keep the two-finger shape locked and let your whole arm make the four-fret slide.',
            hint_es: 'Un acorde de potencia no tiene mayor ni menor — solo raíz + quinta. Mantén la forma de dos dedos fija y deja que todo tu brazo haga el deslizamiento de cuatro trastes.',
            stuck: 'Park on the slide: fret 1, fret 5, fret 1, fret 5 with no rhythm until the jump is automatic — then add the metronome at 60.',
            stuck_es: 'Quédate en el deslizamiento: traste 1, traste 5, traste 1, traste 5 sin ritmo hasta que el salto sea automático — y luego agrega el metrónomo a 60.',
            levelUp: 'Palm-mute for a tight sierreño chug (sierreño = a Mexican acoustic-guitar style; a chug = a short, muted, punchy strum) — then let it ring and hear why distortion isn\'t this song\'s home. That\'s what the ◐ means.',
            levelUp_es: 'Silencia con la palma para un chug de sierreño ajustado (sierreño = un estilo de guitarra acústica mexicana; un chug = un rasgueo corto, silenciado y contundente) — y luego deja que suene abierto y escucha por qué la distorsión no es el hogar de esta canción. Eso es lo que significa el ◐.',
            skills: [1, 2],
            chords: [
              { name: 'F5', chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 1 },
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
            ],
            playSeq: { label: 'Hear F5 → A5 (roots F · A)', label_es: 'Escucha F5 → A5 (raíces F · A)', bpm: 60, notes: [41, 45] },
            response: { type: 'short', prompt: 'Your fastest CLEAN F5↔A5 today (BPM)?', prompt_es: '¿Tu F5↔A5 LIMPIO más rápido hoy (BPM)?', placeholder: 'e.g. 70 — 80 next session', placeholder_es: 'p. ej. 70 — 80 la próxima sesión' }
          }
            ]
          },
          {
            title: 'Sweet Child O\' Mine — assessment rehearsal',
            title_es: 'Sweet Child O\' Mine — ensayo de evaluación',
            steps: [
          {
            text: 'Challenge — Sweet Child Verse (assessment rehearsal): play the Guns N\' Roses verse as power chords — D5 · C5 · G5, one note per bar at 60 BPM — the same patient, one-per-bar spacing as your Module 2 bass roots, just power chords now. This is one of the songs you can use for the module self-assessment. You\'ve got it when: two clean laps, every change on beat 1, each chord ringing the full bar, muting tight. <a href="tabs/sweet-child-o-mine.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
            text_es: 'Reto — Estrofa de Sweet Child (ensayo de evaluación): toca la estrofa de Guns N\' Roses como acordes de potencia — D5 · C5 · G5, una nota por compás a 60 BPM — el mismo espaciado paciente, una nota por compás, que tus raíces de bajo del Módulo 2, ahora con acordes de potencia. Esta es una de las canciones que puedes usar para la autoevaluación del módulo. Lo tienes cuando: dos vueltas limpias, cada cambio en el tiempo 1, cada acorde sonando el compás completo, silenciado ajustado. <a href="tabs/sweet-child-o-mine.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 3 de 5</a>.',
            hint: 'On this site we play Sweet Child in standard tuning. (The famous recording is tuned a half-step down, so your D5–C5–G5 sound one fret higher than the recording — that\'s expected; don\'t retune.) D5 and C5 are A-string roots; G5 drops to the low E string. It\'s a patience test — the temptation is to rush into the next chord instead of holding the bar out.',
            hint_es: 'En este sitio tocamos Sweet Child en afinación estándar. (La grabación famosa está afinada medio tono más abajo, así que tu D5–C5–G5 suena un traste más alto que la grabación — eso es esperado; no reafines.) D5 y C5 son raíces de la cuerda La; G5 baja a la cuerda Mi grave. Es una prueba de paciencia — la tentación es apurarte al siguiente acorde en vez de sostener el compás completo.',
            stuck: 'Loop D5 → C5 (both A-string, 2 frets apart) until smooth, then add the jump to G5 on the low E string. Count the full 4 beats out loud before each change so you don\'t rush it.',
            stuck_es: 'Repite D5 → C5 (ambas en la cuerda La, a 2 trastes de distancia) hasta que salga fluido, y luego agrega el salto a G5 en la cuerda Mi grave. Cuenta los 4 tiempos completos en voz alta antes de cada cambio para no apurarte.',
            levelUp: 'Once two full bars feels easy to hold, speed up in steps to 70, then 80 BPM — still one note per bar, just brisker.',
            levelUp_es: 'Cuando sostener dos compases completos ya te resulte fácil, acelera en pasos a 70, y luego a 80 BPM — sigue siendo una nota por compás, solo más rápido.',
            skills: [3, 4],
            chords: [
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'C5', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 }
            ],
            response: { type: 'short', prompt: 'Clean laps of D5–C5–G5 at 60 BPM?', prompt_es: '¿Vueltas limpias de D5–C5–G5 a 60 BPM?', placeholder: 'e.g. 3 — the G5 jump lags', placeholder_es: 'p. ej. 3 — el salto a G5 se atrasa' }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                text: 'Challenge — Watchtower, verse: play the "All Along the Watchtower" loop as power chords rooted on the low E string — A5 · G5 · F5 · G5 — two beats per chord at 60 BPM. You\'ve got it when: four clean laps, every change landing on the beat. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
                text_es: 'Reto — Watchtower, estrofa: toca la vuelta de "All Along the Watchtower" como acordes de potencia con raíz en la cuerda Mi grave — A5 · G5 · F5 · G5 — dos tiempos por acorde a 60 BPM. Lo tienes cuando: cuatro vueltas limpias, cada cambio cayendo a tiempo. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 3 de 5</a>.',
                hint: 'Same three roots you played in Module 2 — now each root note also sounds its fifth.',
                hint_es: 'Las mismas tres raíces que tocaste en el Módulo 2 — ahora cada nota raíz también suena su quinta.',
                stuck: 'Drop to roots-only for a lap, then add the second string back on just the A5.',
                stuck_es: 'Baja a solo raíces por una vuelta, y luego agrega de vuelta la segunda cuerda solo en el A5.',
                levelUp: 'One beat per chord instead of two — same 60 BPM, twice the changes.',
                levelUp_es: 'Un tiempo por acorde en vez de dos — el mismo 60 BPM, el doble de cambios.',
                skills: [3, 4],
                tab: {
                  caption: '"All Along the Watchtower" — verse loop as power chords · 60 BPM',
                  caption_es: '"All Along the Watchtower" — vuelta de la estrofa como acordes de potencia · 60 BPM',
                  notes: [
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45] },
                    { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43] }
                  ]
                },
                response: { type: 'short', prompt: 'Clean laps in a row at 60 BPM — your count?', prompt_es: 'Vueltas limpias seguidas a 60 BPM — ¿tu cuenta?', placeholder: 'e.g. 3 — F5 keeps buzzing', placeholder_es: 'p. ej. 3 — F5 sigue zumbando' }
              },
              {
                text: 'Challenge — "the cure" as power chords (◐ optional harder challenge — try it, no score!): this gentle acoustic song isn\'t usually played this way — that\'s the point. Play its progression as power chords — A5 · C5 · D5 · F5 — two beats per chord at 60 BPM, quietly. You\'ve got it when: two laps clean AND soft — power chords don\'t have to be loud. <a href="tabs/the-cure.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
                text_es: 'Reto — "the cure" como acordes de potencia (◐ reto opcional más difícil — pruébalo, ¡sin puntaje!): esta canción acústica y suave normalmente no se toca así — ese es el punto. Toca su progresión como acordes de potencia — A5 · C5 · D5 · F5 — dos tiempos por acorde a 60 BPM, suavemente. Lo tienes cuando: dos vueltas limpias Y suaves — los acordes de potencia no tienen que ser fuertes. <a href="tabs/the-cure.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 3 de 5</a>.',
                hint: 'You already know these roots from Module 2. The challenge here is touch: light pick, both strings ringing, no harsh sound.',
                hint_es: 'Ya conoces estas raíces del Módulo 2. El reto aquí es el toque: púa ligera, ambas cuerdas sonando, sin sonido áspero.',
                stuck: 'Roots-only at a whisper first — get the dynamics, then add the fifths.',
                stuck_es: 'Solo raíces en un susurro primero — consigue la dinámica, y luego agrega las quintas.',
                levelUp: 'Add G5 before looping back to A5, or play one lap loud and one lap soft and hear the difference.',
                levelUp_es: 'Agrega G5 antes de volver a A5, o toca una vuelta fuerte y una vuelta suave y escucha la diferencia.',
                tab: {
                  caption: '"the cure" — progression as power chords (teaching arrangement) · 60 BPM',
                  caption_es: '"the cure" — progresión como acordes de potencia (arreglo didáctico) · 60 BPM',
                  notes: [
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 7], ['A', 5]], note: 'D5', midi: [57, 50] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] }
                  ]
                },
                response: { type: 'short', prompt: 'Loud vs. soft power chords — which was harder to keep clean?', prompt_es: 'Acordes de potencia fuertes vs. suaves — ¿cuál fue más difícil de mantener limpio?', placeholder: 'e.g. soft — I kept muting the D string', placeholder_es: 'p. ej. suave — seguía silenciando la cuerda Re' }
              },
              {
                text: 'Challenge — Luna, full vamp: the whole song rides F5 ↔ A5. Play along with the teaching arrangement — two downbeat strums per bar, changing where the record changes. You\'ve got it when: a full verse and chorus without losing a downbeat, F5 ringing as clean as A5. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
                text_es: 'Reto — Luna, vamp completo: toda la canción se apoya en F5 ↔ A5. Toca junto con el arreglo didáctico — dos rasgueos en el tiempo fuerte por compás, cambiando donde cambia la grabación. Lo tienes cuando: una estrofa y un coro completos sin perder un tiempo fuerte, con F5 sonando tan limpio como A5. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 3 de 5</a>.',
                hint: 'This is the same F5↔A5 slide from the drill above — the only change is following where the record changes instead of a fixed count.',
                hint_es: 'Es el mismo deslizamiento F5↔A5 del ejercicio de arriba — el único cambio es seguir donde cambia la grabación en vez de una cuenta fija.',
                stuck: 'Loop the F5↔A5 slide with no song for a few rounds first, then drop in following the record.',
                stuck_es: 'Repite el deslizamiento F5↔A5 sin la canción por unas cuantas rondas primero, y luego entra siguiendo la grabación.',
                levelUp: 'Add a light palm mute for the verse, then let it ring open for the chorus — instant dynamics.',
                levelUp_es: 'Agrega un silenciado ligero con la palma para la estrofa, y luego déjalo sonar abierto para el coro — dinámica instantánea.',
                skills: [3, 4],
                tab: {
                  caption: '"Luna" — the vamp as power chords (teaching arrangement) · 60 BPM',
                  caption_es: '"Luna" — el vamp como acordes de potencia (arreglo didáctico) · 60 BPM',
                  notes: [
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45] }
                  ]
                },
                response: { type: 'short', prompt: 'Which song did you land power chords in today, and at what BPM?', prompt_es: '¿En qué canción lograste los acordes de potencia hoy, y a qué BPM?', placeholder: 'e.g. Luna at 60 — clean', placeholder_es: 'p. ej. Luna a 60 — limpio' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                text: 'What\'s your current top clean tempo on the loop, and what\'s the one thing holding you back from going faster — a specific change, the strum, or muting? Name it below.',
                text_es: '¿Cuál es tu tempo limpio más alto en la vuelta ahora mismo, y cuál es la única cosa que te frena para ir más rápido — un cambio específico, el rasgueo, o el silenciado? Nómbralo abajo.',
                response: { type: 'short', placeholder: 'e.g. 75 BPM — the eighth-note up-strums get sloppy',
                  placeholder_es: 'p. ej. 75 BPM — los rasgueos hacia arriba de las corcheas se descuidan' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Module-end (three tasks): (1) Play a core-song excerpt to the metronome — e.g., the Seven Nation Army riff, All Along the Watchtower\'s A5–G5–F5, or Sweet Child\'s D5–C5–G5 — switching cleanly between two power chords with roots on the same fret of the E and A strings at 60 BPM, then holding 80 BPM for at least 15 seconds. (2) Read a three-chord (I–IV–V) progression from chord symbols / TAB using a named strumming pattern (straight-eighths or split strum), and name power chords from a chord chart. (3) Clap and count a 4-bar rhythm using whole, half, quarter, and eighth notes.',
      goal_es: 'Fin de módulo (tres tareas): (1) Toca un fragmento de canción principal con el metrónomo — p. ej., el riff de Seven Nation Army, el A5–G5–F5 de All Along the Watchtower, o el D5–C5–G5 de Sweet Child — cambiando limpiamente entre dos acordes de potencia con raíces en el mismo traste de las cuerdas Mi y La a 60 BPM, y luego sosteniendo 80 BPM por al menos 15 segundos. (2) Lee una progresión de tres acordes (I–IV–V) a partir de símbolos de acorde / TAB usando un patrón de rasgueo nombrado (corcheas rectas o rasgueo dividido), y nombra acordes de potencia a partir de un diagrama de acordes. (3) Aplaude y cuenta un ritmo de 4 compases usando redondas, blancas, negras y corcheas.',
      performance: 'Record yourself: play a core-song excerpt with the metronome — changes on beat 1 at 60 BPM, then hold 80 BPM for 15 seconds; read a three-chord (I–IV–V) progression from chord symbols with your named strum; then clap and count a 4-bar rhythm. Listen back and note one thing to improve.',
      selfCheck: 'Can you change chords on beat 1 at 60 BPM and hold 80 BPM for 15 seconds? Can you read a I–IV–V progression from chord symbols and name power chords from a chart?',
      selfCheck_es: '¿Puedes cambiar de acorde en el tiempo 1 a 60 BPM y sostener 80 BPM por 15 segundos? ¿Puedes leer una progresión I–IV–V a partir de símbolos de acorde y nombrar acordes de potencia a partir de un diagrama?',
      standards: ['Pr.4a', 'Pr.5b', 'Pr.6a']
    },

    skills: [
      { id: 'm3w2-s1', text: 'Change power chords on beat 1 at 60 BPM',
        text_es: 'Cambiar acordes de potencia en el tiempo 1 a 60 BPM',
        gotItWhen: 'your chord changes land exactly on beat 1 with the metronome at 60 BPM and you don\'t need to pause or restart (70+ BPM is an optional harder challenge).',
        gotItWhen_es: 'tus cambios de acorde caen exactamente en el tiempo 1 con el metrónomo a 60 BPM y no necesitas pausar ni reiniciar (70+ BPM es un reto opcional más difícil).',
        practice: { type: 'pr', prompt: 'Loop A5 → G5, changing on beat 1 of every bar. Start at 60 BPM and raise the metronome +5 at a time — log your fastest BPM with clean changes.',
          prompt_es: 'Repite A5 → G5, cambiando en el tiempo 1 de cada compás. Empieza a 60 BPM y sube el metrónomo de 5 en 5 — anota tu BPM más rápido con cambios limpios.',
          unit: 'BPM', placeholder: 'e.g. 70 — try for a higher number next session', placeholder_es: 'p. ej. 70 — intenta superarlo la próxima sesión' } },
      { id: 'm3w2-s2', text: 'Play a full 8-bar power chord progression in time',
        text_es: 'Tocar una progresión completa de 8 compases de acordes de potencia a tiempo',
        gotItWhen: 'you can play through 8 bars without stopping, even if a chord change is rough — you keep going to the next downbeat.',
        gotItWhen_es: 'puedes tocar los 8 compases sin detenerte, aunque un cambio de acorde salga imperfecto — sigues hasta el siguiente tiempo fuerte.',
        practice: { type: 'playSeq', label: 'Watchtower roots (A · G · F · G) — two beats each', label_es: 'Raíces de Watchtower (A · G · F · G) — dos tiempos cada una', bpm: 60,
          notes: [45, 45, 43, 43, 41, 41, 43, 43] } },
      { id: 'm3w2-s3', text: 'Play a straight-eighths strumming pattern with power chords',
        text_es: 'Tocar un patrón de rasgueo de corcheas rectas con acordes de potencia',
        gotItWhen: 'you can strum down on each number and up on each "+" across a bar and count "1 + 2 + 3 + 4 +" aloud without losing the strum.',
        gotItWhen_es: 'puedes rasguear hacia abajo en cada número y hacia arriba en cada "+" a lo largo de un compás y contar "1 + 2 + 3 + 4 +" en voz alta sin perder el rasgueo.',
        practice: { type: 'playSeq', label: 'Eighth-note pulse on A — strum along, counting "1 + 2 + 3 + 4 +"', label_es: 'Pulso de corcheas en La — rasguea al ritmo, contando "1 + 2 + 3 + 4 +"', bpm: 80,
          notes: [45, 45, 45, 45, 45, 45, 45, 45] } },
      { id: 'm3w2-s4', text: 'Apply power chords on both E and A string roots in the same song',
        text_es: 'Aplicar acordes de potencia con raíces tanto en la cuerda Mi como en la La dentro de la misma canción',
        gotItWhen: 'you can switch between an E-root and an A-root power chord mid-song without your palm mute breaking or the wrong strings ringing.',
        gotItWhen_es: 'puedes cambiar entre un acorde de potencia con raíz en Mi y uno con raíz en La a mitad de la canción sin que se rompa tu silenciado con la palma o suenen las cuerdas equivocadas.',
        practice: { type: 'mc', prompt: 'A song calls for G5 then C5. Where does your index finger go for each?',
          prompt_es: 'Una canción pide G5 y luego C5. ¿Dónde va tu dedo índice para cada uno?',
          choices: ['Both on E string', 'Both on A string', 'G5 on E (fret 3), C5 on A (fret 3)', 'G5 on A, C5 on E'],
          choices_es: ['Ambos en la cuerda Mi', 'Ambos en la cuerda La', 'G5 en Mi (traste 3), C5 en La (traste 3)', 'G5 en La, C5 en Mi'], answer: 2 } },
      { id: 'm3w2-s5', text: 'Optional: add 3rd finger octave doubling to the power chord shape',
        text_es: 'Opcional: agregar duplicación de octava con el tercer dedo a la forma del acorde de potencia',
        gotItWhen: 'your pinky lands on the next string at the same fret as your ring finger and all three notes ring cleanly — no buzz, no muffled string.',
        gotItWhen_es: 'tu meñique cae en la siguiente cuerda en el mismo traste que tu anular y las tres notas suenan limpias — sin zumbido, sin cuerdas apagadas.',
        practice: { type: 'mc', prompt: 'You add your pinky on the next string, at the same fret as your ring finger. What interval (an interval = the distance between two notes) did you just add to the chord?',
          prompt_es: 'Agregas tu meñique en la siguiente cuerda, en el mismo traste que tu anular. ¿Qué intervalo (un intervalo = la distancia entre dos notas) acabas de agregar al acorde?',
          choices: ['A 3rd', 'A 5th', 'An octave (same note, higher)', 'A 7th'],
          choices_es: ['Una 3ª', 'Una 5ª', 'Una octava (la misma nota, más aguda)', 'Una 7ª'], answer: 2 } },
      { id: 'm3w2-s6', text: 'Clap and count a 4-bar rhythm, and name whole, half, quarter, and eighth notes',
        text_es: 'Aplaudir y contar un ritmo de 4 compases, y nombrar redondas, blancas, negras y corcheas',
        gotItWhen: 'you can clap a 4-bar line in time with the metronome and say which notes are whole, half, quarter, or eighth — and name your strum as "straight eighths".',
        gotItWhen_es: 'puedes aplaudir una línea de 4 compases a tiempo con el metrónomo y decir cuáles notas son redondas, blancas, negras o corcheas — y nombrar tu rasgueo como "corcheas rectas".',
        practice: { type: 'mc', prompt: 'A straight-eighths strum — down on each number, up on each "+", counted "1 + 2 + 3 + 4 +" — is made of which note value?',
          prompt_es: 'Un rasgueo de corcheas rectas — abajo en cada número, arriba en cada "+", contado "1 + 2 + 3 + 4 +" — está hecho de qué figura rítmica?',
          choices: ['Whole notes', 'Quarter notes', 'Eighth notes', 'Half notes'],
          choices_es: ['Redondas', 'Negras', 'Corcheas', 'Blancas'], answer: 2 } }
    ]
  }

); // end module-3.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[3] = [
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Full power chord loop · change on beat 1 at 60, hold 80 BPM', meta_es: 'Vuelta completa de acordes de potencia · cambia en el tiempo 1 a 60, mantén 80 BPM', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Full riff with power chords', meta_es: 'Riff completo con acordes de potencia', type: 'Core', core: true, journeyUrl: 'tabs/seven-nation-army.html',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: '◐ Sierreño vamp → power-chord version (on purpose, in a different style than the original)', meta_es: '◐ Vamp de sierreño → versión con acordes de potencia (a propósito, en un estilo distinto al original)', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Verse: D5–C5–G5 power chord loop', meta_es: 'Verso: vuelta de acordes de potencia D5–C5–G5', type: 'Core', core: true, journeyUrl: 'tabs/sweet-child-o-mine.html',
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0ASVeXINKYM' },
      { name: '"Happy Birthday"', meta: 'Full power chord arrangement (optional)', meta_es: 'Arreglo completo con acordes de potencia (opcional)', type: 'Supp', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Smells Like Teen Spirit" — Nirvana', meta: 'F Bb Ab Db power chord progression', meta_es: 'Progresión de acordes de potencia F Bb Ab Db', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=hTWKbfoikeg',
        tutorialUrl: 'https://www.youtube.com/watch?v=HfhZbd5w-iY' },
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
    { id: 'mr3-s8', text: 'I can play an 8-bar progression with a straight-eighths strum, counting "1 + 2 + 3 + 4 +"',
      text_es: 'Puedo tocar una progresión de 8 compases con un rasgueo de corcheas rectas, contando "1 + 2 + 3 + 4 +"', set: 'm3w2' }
  ],
  assessItems: [
    'Play a core-song excerpt (Seven Nation Army, All Along the Watchtower\'s A5–G5–F5, or Sweet Child\'s D5–C5–G5) with changes on beat 1 at 60 BPM — including a clean switch between two power chords with roots on the same fret of the E and A strings, with unused strings muted the whole way — then hold 80 BPM for 15 seconds',
    'Read a three-chord (I–IV–V) progression from chord symbols / TAB with a named strumming pattern (straight eighths or the split strum), and name power chords from a chord chart',
    'Clap and count a 4-bar rhythm using whole, half, quarter, and eighth notes'
  ],
  assessItems_es: [
    'Toca un fragmento de canción principal (Seven Nation Army, el A5–G5–F5 de All Along the Watchtower, o el D5–C5–G5 de Sweet Child) con cambios en el tiempo 1 a 60 BPM — incluyendo un cambio limpio entre dos acordes de potencia con raíces en el mismo traste de las cuerdas Mi y La, con las cuerdas que no usas silenciadas todo el tiempo — y luego sostén 80 BPM por 15 segundos',
    'Lee una progresión de tres acordes (I–IV–V) a partir de símbolos de acorde / TAB con un patrón de rasgueo nombrado (corcheas rectas o el rasgueo dividido), y nombra acordes de potencia a partir de un diagrama de acordes',
    'Aplaude y cuenta un ritmo de 4 compases usando redondas, blancas, negras y corcheas'
  ],
  forward: 'The two-finger shape and the muting you just locked in are the backbone of rhythm guitar. The E &amp; A string roots you slide between also become your <strong>starting point for the pentatonic patterns in Module 4</strong> — that\'s where you\'ll play lead lines and solos over these very same power chords.',
  forward_es: 'La forma de dos dedos y el silenciado que acabas de dominar son la columna vertebral de la guitarra rítmica. Las raíces de las cuerdas Mi &amp; La entre las que te deslizas también se convierten en tu <strong>punto de partida para los patrones pentatónicos del Módulo 4</strong> — ahí es donde vas a tocar líneas melódicas y solos sobre estos mismos acordes de potencia.',
  standards: ['Pr.4a', 'Pr.5a', 'Pr.5b', 'Pr.6a', 'Re.7a']
};
