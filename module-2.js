// ============================================================
//  MODULE 2 — Notes on the E & A Strings
//  Edit this file to change Module 2 content.
//  Upload to GitHub alongside index.html + firebase-config.js
//
//  ★ TEMPLATE MODULE — pattern source for all other modules.
//    When building or upgrading another module, copy the patterns
//    here (named challenges w/ "You've got it when:", Stuck?/Level up,
//    exit tickets, PR ladders, self-contained gotItWhens,
//    forward link in the module review). See WORKFLOW.md Appendix A
//    for the full checklist. Frozen 2026-06-11 after Session 1.4.
//    Known open item: Set 2 computer station keeps 3 short timestamped
//    videos (vs the ≤2 guideline) — each anchors a distinct skill and
//    carries an active during-watching job; revisit if it runs long.
// ============================================================

SETS.push(

  {
    id: 'm2w1',
    songThread: [{ name: '"Seven Nation Army"', journey: 'tabs/seven-nation-army.html', layer: 2, note: 'the riff on your low E string' }],
    label: 'Set 1',
    locked: false,
    module: 'Notes on the E & A Strings',
    moduleNum: 2,
    unit: 'Module 2 · Notes on the E & A Strings',
    unit_es: 'Módulo 2 · Notas en las cuerdas Mi y La',
    title: 'Set 1',
    subtitle: 'Musical alphabet · Note names on E & A · Fretboard reading',
    subtitle_es: 'Alfabeto musical · Nombres de notas en Mi y La · Lectura del diapasón',
    objective: 'I CAN name all notes on the E and A strings (frets 0–12) and identify them on a fretboard diagram.',
    skillFocus: 'Natural notes on the E and A strings · Reading notes on a fretboard chart',
    skillFocus_es: 'Notas naturales en las cuerdas Mi y La · Lectura de notas en un diagrama del diapasón',
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
                label: 'Watch: open string notes', label_es: 'Mira: notas al aire',
                text: 'Watch: <a href="https://youtu.be/Abrd0c92xRE" target="_blank">Open Notes On The Guitar – JustinGuitar</a>.',
                text_es: 'Mira: <a href="https://youtu.be/Abrd0c92xRE" target="_blank">Open Notes On The Guitar – JustinGuitar</a>.',
                hint: 'Play along on your guitar as he goes through each note on both strings. Pause and find each note before he names it.',
                hint_es: 'Toca junto con él en tu guitarra mientras recorre cada nota en las dos cuerdas. Pausa y encuentra cada nota antes de que él la nombre.',
                skills: [1, 2, 3],
                response: { type: 'mc', prompt: 'On the low E string, which note is at fret 5?',
                  prompt_es: 'En la cuerda Mi grave, ¿qué nota está en el traste 5?',
                  answer: 0,
                  explain: 'Fret 5 of the low E is A — the same pitch as the open A string right next to it.',
                  explain_es: 'El traste 5 de la Mi grave es A — el mismo tono que la cuerda La al aire, justo al lado.',
                  choices: [
                  'A',
                  'D',
                  'G',
                  'F'
                ],
                  choices_es: [
                  'A',
                  'D',
                  'G',
                  'F'
                ] }
              },
              {
                label: 'Watch: notes on the fretboard', label_es: 'Mira: notas en el mástil',
                text: 'Watch: <a href="https://youtu.be/WQ8DSYD2kvw" target="_blank">Learn Every Note on the Fretboard – Marty Music</a> (0:00–4:00).',
                text_es: 'Mira: <a href="https://youtu.be/WQ8DSYD2kvw" target="_blank">Learn Every Note on the Fretboard – Marty Music</a> (0:00–4:00).',
                hint: 'Focus on the E and A strings only for now. What patterns does he point out?',
                hint_es: 'Concéntrate solo en las cuerdas Mi y La por ahora. ¿Qué patrones señala él?',
                skills: [2, 3],
                response: { type: 'short', placeholder: 'Describe one pattern he points out for finding notes on the E or A string.',
                  placeholder_es: 'Describe un patrón que él señala para encontrar notas en la cuerda Mi o La.' }
              }
            ]
          },
          {
            title: 'Listen and find notes by ear',
            title_es: 'Escucha y encuentra notas de oído',
            steps: [
              {
                label: 'Ear: find "Happy Birthday" notes', label_es: 'Oído: notas de "Happy Birthday"',
                text: 'Listen to the opening of "Happy Birthday" — press ▶ to hear it, then hum along and see if you can identify which notes of the melody live on the E or A string.',
                text_es: 'Escucha el inicio de "Happy Birthday" — presiona ▶ para escucharlo, luego tararea y trata de identificar qué notas de la melodía viven en la cuerda Mi o La.',
                hint: 'Don\'t worry about playing it yet — just train your ear to connect sounds to strings.',
                hint_es: 'No te preocupes todavía por tocarla — solo entrena tu oído para conectar sonidos con cuerdas.',
                playSeq: { label: 'Hear the opening', label_es: 'Escucha el inicio', bpm: 60, notes: [40, 40, 42, 40, 45, 44] },
                response: { type: 'short', placeholder: 'Which note(s) did you find first? Where on the fretboard?',
                  placeholder_es: '¿Qué nota(s) encontraste primero? ¿Dónde en el diapasón?' }
              }
            ]
          },
          {
            title: 'Play along with your note chart',
            title_es: 'Toca junto con tu tabla de notas',
            steps: [
              {
                label: 'Low E notes with your chart', label_es: 'Notas de la Mi grave con tu tabla',
                text: 'Play-along preview:<ol><li>Keep your note-name chart open.</li><li>Play up the low E string slowly with the audio, frets 0–12 — E · F · G · A · B · C · D · E — saying each name aloud.</li></ol>Lean on the chart here; you\'ll do it from memory at the practice station.<span class="step-figure"><img src="img/m2-alphabet-loop.svg" alt="Diagram of the musical alphabet A to G arranged in a loop, with an arrow showing that after G it starts over at A."></span>',
                text_es: 'Adelanto para tocar junto:<ol><li>Mantén abierta tu tabla de nombres de notas.</li><li>Toca despacio hacia arriba en la cuerda Mi grave junto con el audio, trastes 0–12 — E · F · G · A · B · C · D · E — diciendo cada nombre en voz alta.</li></ol>Apóyate en la tabla aquí; lo harás de memoria en la estación de práctica.<span class="step-figure"><img src="img/m2-alphabet-loop.svg" alt="Diagrama del alfabeto musical de A a G en un círculo, con una flecha que muestra que después de G se empieza de nuevo en A."></span>',
                hint: 'Slow is fine. Right now the goal is connecting each name to its spot — use the chart freely.',
                hint_es: 'Ir despacio está bien. Ahora mismo la meta es conectar cada nombre con su lugar — usa la tabla libremente.',
                skills: [2],
                playSeq: { label: 'Play all', label_es: 'Tocar todo', bpm: 60, notes: [40, 41, 43, 45, 47, 48, 50, 52] },
                response: { type: 'mc', prompt: 'On the low E string, what note is at fret 10?',
                  prompt_es: 'En la cuerda Mi grave, ¿qué nota está en el traste 10?',
                  answer: 1,
                  explain: 'Counting the naturals up the low E (E F G A B C D), fret 10 lands on D — fret 12 is E again, the octave.',
                  explain_es: 'Contando las notas naturales hacia arriba en la Mi grave (E F G A B C D), el traste 10 cae en D — el traste 12 es E otra vez, la octava.',
                  choices: [
                  'C',
                  'D',
                  'E',
                  'B'
                ],
                  choices_es: [
                  'C',
                  'D',
                  'E',
                  'B'
                ] }
              },
              {
                label: 'A string notes with your chart', label_es: 'Notas de la cuerda La con tu tabla',
                text: 'Same idea on the A string, still with your chart: A · B · C · D · E · F · G · A (frets 0–12), up then back down, names aloud.',
                text_es: 'La misma idea en la cuerda La, todavía con tu tabla: A · B · C · D · E · F · G · A (trastes 0–12), hacia arriba y de regreso, nombres en voz alta.',
                hint: 'Notice fret 5 of the A string is the same note as the open D string — that connection helps later.',
                hint_es: 'Fíjate que el traste 5 de la cuerda La es la misma nota que la cuerda Re al aire — esa conexión ayuda más adelante.',
                skills: [3],
                playSeq: { label: 'Play all', label_es: 'Tocar todo', bpm: 60, notes: [45, 47, 48, 50, 52, 53, 55, 57] },
                response: { type: 'short', placeholder: 'What did you notice about any of the notes? Did any two notes feel or sound similar?',
                  placeholder_es: '¿Qué notaste sobre alguna de las notas? ¿Alguna se sintió o sonó parecida a otra?' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Station wrap-up', label_es: 'Cierre de la estación',
                text: 'Station Wrap-Up — pause and think: which note or fret felt fuzziest today, and what (if anything) started to make sense?',
                text_es: 'Cierre de la estación — pausa y piensa: ¿qué nota o traste se sintió más confuso hoy, y qué (si acaso) empezó a tener sentido?',
                response: { type: 'short', placeholder: 'e.g. fret 8 on the low E — kept mixing up B and C',
                  placeholder_es: 'ej. el traste 8 en la Mi grave — seguía confundiendo B y C' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — fretboard drill',
        title_es: 'Estación de práctica — ejercicio de diapasón',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tune all 6 strings', label_es: 'Calentamiento: afina las 6 cuerdas',
                text: 'Before today\'s notes:<ol><li>Tune all 6 strings to green, low to high — E A D G B e — and say each string name as you go.</li><li>Try for a faster time than last session.</li><li>Click "Hear all 6 strings" for the target pitches.</li></ol>',
                text_es: 'Antes de las notas de hoy:<ol><li>Afina las 6 cuerdas en verde, de grave a aguda — E A D G B e — y di cada nombre de cuerda a medida que avanzas.</li><li>Intenta lograr un tiempo más rápido que la sesión pasada.</li><li>Haz clic en "Escucha las 6 cuerdas" para escuchar los tonos objetivo.</li></ol>',
                hint: 'Tuning and the string names are Module 1 skills you keep forever — do this every practice session before you play. Going slowly works better than rushing past the note.',
                hint_es: 'Afinar y nombrar las cuerdas son destrezas del Módulo 1 que conservas para siempre — hazlo en cada sesión de práctica antes de tocar. Ir despacio funciona mejor que pasarte de largo de la nota.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Name every note on the low E string (frets 0–12)',
            title_es: 'Nombra cada nota en la cuerda Mi grave (trastes 0–12)',
            steps: [
              {
                label: 'Challenge 1 — Low E Run', label_es: 'Reto 1 — Recorrido de la Mi grave',
                text: '<ul><li>Play every natural note up the low E string and back down — E · F · G · A · B · C · D · E — saying each name aloud.</li></ul>You\'ve got it when: one clean lap (a lap = one full time through) without looking at the chart, with no mistakes.<span class="step-figure"><img src="img/m2-low-e-naturals.svg" alt="A fretboard diagram of the low E string, frets 0 to 12, with the natural notes marked: E open, F at fret 1, G at fret 3, A at fret 5, B at fret 7, C at fret 8, D at fret 10, and E again at fret 12."></span>',
                text_es: '<ul><li>Toca cada nota natural hacia arriba en la cuerda Mi grave y de regreso — E · F · G · A · B · C · D · E — diciendo cada nombre en voz alta.</li></ul>Lo tienes cuando: una vuelta limpia (una vuelta = una pasada completa) sin mirar la tabla, sin errores.<span class="step-figure"><img src="img/m2-low-e-naturals.svg" alt="Un diagrama del diapasón de la cuerda Mi grave, trastes 0 a 12, con las notas naturales marcadas: E al aire, F en el traste 1, G en el 3, A en el 5, B en el 7, C en el 8, D en el 10, y E de nuevo en el traste 12."></span>',
                hint: 'Hearing + saying + playing helps you memorize it. Peek at the chart only if you\'re truly stuck. Set the ⏱ Timer (bottom of the screen) to 2 min and count how many clean laps you fit before it beeps — try for a higher number next session.',
                hint_es: 'Escuchar + decir + tocar te ayuda a memorizarlo. Mira la tabla solo si de verdad estás atascado. Pon el ⏱ Temporizador (abajo en la pantalla) en 2 min y cuenta cuántas vueltas limpias logras antes de que suene — intenta superar el número la próxima sesión.',
                stuck: 'Master frets 0–5 only (E–A) without looking at the chart first, then add 7–12 once those are automatic.',
                stuck_es: 'Domina solo los trastes 0–5 (E–A) sin mirar la tabla primero, y luego agrega 7–12 una vez que esos sean automáticos.',
                levelUp: 'One clean lap at 80 BPM, or start at fret 12 and name your way down.',
                levelUp_es: 'Una vuelta limpia a 80 BPM, o empieza en el traste 12 y nombra tu camino hacia abajo.',
                skills: [2],
                playSeq: { label: 'Play all', label_es: 'Tocar todo', bpm: 60, notes: [40, 41, 43, 45, 47, 48, 50, 52] },
                response: { type: 'short', prompt: 'Personal record: play it cleanly at 60, then raise the metronome +10 at a time. What\'s your fastest CLEAN lap today (BPM)?', prompt_es: 'Récord personal: tócalo limpio a 60, y luego sube el metrónomo de 10 en 10. ¿Cuál es tu vuelta LIMPIA más rápida hoy (BPM)?', placeholder: 'e.g. 90 — try for a higher number next session', placeholder_es: 'ej. 90 — intenta superarlo la próxima sesión' }
              },
              {
                label: 'Quick check: low E notes', label_es: 'Revisión rápida: notas de Mi grave',
                text: 'Quick check — name the note before you play it:',
                text_es: 'Revisión rápida — nombra la nota antes de tocarla:',
                skills: [2],
                response: { type: 'mc', prompt: 'Low E string — what note is at fret 8?',
                  prompt_es: 'Cuerda Mi grave — ¿qué nota está en el traste 8?',
                  answer: 1,
                  explain: 'Fret 7 is B, and C is just one fret up at 8 — there\'s no sharp between B and C.',
                  explain_es: 'El traste 7 es B, y C está justo un traste más arriba en el 8 — no hay sostenido entre B y C.',
                  choices: ['A', 'C', 'D', 'B'],
                  choices_es: ['A', 'C', 'D', 'B'] }
              },
              {
                label: 'Ear: name that riff', label_es: 'Oído: adivina el riff',
                text: 'Name That Riff (try it!): pick out the "Seven Nation Army" or "Smoke on the Water" main riff (a riff = a short musical phrase that repeats) by ear on the low E string. No score — just try it.',
                text_es: 'Adivina el riff (¡pruébalo!): saca de oído el riff principal de "Seven Nation Army" o "Smoke on the Water" (un riff = una frase musical corta que se repite) en la cuerda Mi grave. Sin puntaje — solo pruébalo.',
                hint: 'Use the note-name chart. Don\'t worry about getting it perfect — the attempt trains your ear.',
                hint_es: 'Usa la tabla de nombres de notas. No te preocupes por hacerlo perfecto — el intento entrena tu oído.',
              }
            ]
          },
          {
            title: 'Name every note on the A string (frets 0–12)',
            title_es: 'Nombra cada nota en la cuerda La (trastes 0–12)',
            steps: [
              {
                label: 'Challenge 2 — A String Run (your Set 1 check-off)', label_es: 'Reto 2 — Recorrido de la cuerda La (tu evaluación de la Unidad 1)',
                text: '<ul><li>Play the same run on the A string without looking at the chart — A · B · C · D · E · F · G · A — up to fret 12 and back, one note per beat.</li></ul>You\'ve got it when: a clean lap with the metronome and no stalls.<span class="step-figure"><img src="img/m2-a-naturals.svg" alt="A fretboard diagram of the A string, frets 0 to 12, with the natural notes marked: A open, B at fret 2, C at fret 3, D at fret 5, E at fret 7, F at fret 8, G at fret 10, and A again at fret 12."></span>',
                text_es: '<ul><li>Toca el mismo recorrido en la cuerda La sin mirar la tabla — A · B · C · D · E · F · G · A — hasta el traste 12 y de regreso, una nota por pulso.</li></ul>Lo tienes cuando: una vuelta limpia con el metrónomo y sin trabarte.<span class="step-figure"><img src="img/m2-a-naturals.svg" alt="Un diagrama del diapasón de la cuerda La, trastes 0 a 12, con las notas naturales marcadas: A al aire, B en el traste 2, C en el 3, D en el 5, E en el 7, F en el 8, G en el 10, y A de nuevo en el traste 12."></span>',
                hint: 'Keep the metronome at 60 BPM. If you stall on a note, that\'s the one to drill.',
                hint_es: 'Mantén el metrónomo a 60 BPM. Si te trabas en una nota, esa es la que debes practicar.',
                stuck: 'Drop to 50 BPM and play it cleanly there first, or cover frets 0–5 (A–D) before adding the rest.',
                stuck_es: 'Baja a 50 BPM y tócalo limpio ahí primero, o cubre los trastes 0–5 (A–D) antes de agregar el resto.',
                levelUp: 'Lap it at 80 BPM, or draw shuffled fret slips and name each on the spot. Got someone around? Have them call out random frets instead.',
                levelUp_es: 'Haz la vuelta a 80 BPM, o saca papelitos revueltos de trastes y nombra cada uno al instante. ¿Tienes a alguien cerca? Pídele que diga trastes al azar en su lugar.',
                skills: [3],
                playSeq: { label: 'Play all', label_es: 'Tocar todo', bpm: 60, notes: [45, 47, 48, 50, 52, 53, 55, 57] },
                response: { type: 'short', prompt: 'Personal record: play it cleanly at 60, then raise the metronome +10 at a time. Your fastest CLEAN A-string lap today (BPM)?', prompt_es: 'Récord personal: tócalo limpio a 60, y luego sube el metrónomo de 10 en 10. ¿Cuál es tu vuelta LIMPIA más rápida en la cuerda La hoy (BPM)?', placeholder: 'e.g. 80 — try for a higher number next session', placeholder_es: 'ej. 80 — intenta superarlo la próxima sesión' }
              },
              {
                label: 'Quick check: A string notes', label_es: 'Revisión rápida: notas de la La',
                text: 'Quick check — name the note before you play it:',
                text_es: 'Revisión rápida — nombra la nota antes de tocarla:',
                skills: [3],
                response: { type: 'mc', prompt: 'A string — what note is at fret 2?',
                  prompt_es: 'Cuerda La — ¿qué nota está en el traste 2?',
                  answer: 1,
                  explain: 'From open A, one fret up is A#, and two frets up is B. So fret 2 on the A string is B.',
                  explain_es: 'Desde la A al aire, un traste arriba es A#, y dos trastes arriba es B. Así que el traste 2 en la cuerda La es B.',
                  choices: ['A', 'B', 'C', 'D'],
                  choices_es: ['A', 'B', 'C', 'D'] }
              },
              {
                label: 'Shuffle self-quiz', label_es: 'Autoevaluación con cartas',
                text: 'Shuffle self-quiz — the deck below deals you a random fret. Say the A-string note out loud, then press it, before the ring runs out: three seconds a card, ten rounds. Miss one and it comes back later in the ten. Nine in time and you can check the skill off right there.',
                text_es: 'Autoevaluación con cartas — el mazo de abajo te reparte un traste al azar. Di en voz alta la nota de la cuerda La y luego presiónala, antes de que el círculo se acabe: tres segundos por carta, diez rondas. Si fallas una, vuelve a salir más adelante. Nueve a tiempo y ya puedes marcar la destreza ahí mismo.',
                drill: { type: 'shuffle', string: 'A', maxFret: 12, rounds: 10, seconds: 3, pile: 'naturals', skill: 'm2w1-s3' },
                hint: 'No chart. If you stall on a note, loop just that part of the string until it\'s automatic.',
                hint_es: 'Sin tabla. Si te trabas en una nota, repite solo esa parte de la cuerda hasta que sea automática.',
                levelUp: 'Switch to the sharps pile — all 13 frets, sharps included. Got someone around? Have them call out random frets while you answer on the guitar.',
                levelUp_es: 'Cambia al montón con sostenidos — los 13 trastes, sostenidos incluidos. ¿Tienes a alguien cerca? Pídele que diga trastes al azar mientras tú respondes en la guitarra.',
                skills: [3]
              },
              {
                label: 'Challenge 3 — Shuffle Run', label_es: 'Reto 3 — Recorrido con cartas',
                text: '<ol><li>Play the same deck, now on the low E string — and this time name it AND play it before the ring runs out.</li><li>Keep the guitar in hand for this one: the app checks the name, your ear checks the note.</li></ol>You\'ve got it when: 10 in a row with no counting up from E.',
                text_es: '<ol><li>Toca el mismo mazo, ahora en la cuerda Mi grave — y esta vez nómbrala Y tócala antes de que se acabe el círculo.</li><li>Mantén la guitarra en la mano: la app revisa el nombre, tu oído revisa la nota.</li></ol>Lo tienes cuando: 10 seguidas sin contar desde E.',
                drill: { type: 'shuffle', string: 'lowE', maxFret: 12, rounds: 10, seconds: 3, pile: 'naturals', skill: 'm2w1-s2' },
                hint: 'The 3-second limit is the real test. You\'re jumping to random frets, not running a memorized lap — that\'s what "name any fret instantly" really means.',
                hint_es: 'El límite de 3 segundos es la verdadera prueba. Estás saltando a trastes al azar, no haciendo una vuelta memorizada — eso es lo que de verdad significa "nombrar cualquier traste al instante".',
                stuck: 'Stay on the naturals pile — it deals only the eight natural frets. Add the sharps pile once you hit 9 of 10.',
                stuck_es: 'Quédate en el montón de solo naturales — reparte únicamente los ocho trastes naturales. Agrega el montón con sostenidos cuando logres 9 de 10.',
                levelUp: 'Run the Shuffle on the A string too, or name a full lap going down the string (12 → 0) without counting.',
                levelUp_es: 'Haz el ejercicio de papelitos en la cuerda La también, o nombra una vuelta completa bajando por la cuerda (12 → 0) sin contar.',
                skills: [2]
              }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Seven Nation Army," without looking at the chart', label_es: 'Reto — "Seven Nation Army," sin mirar la tabla',
                text: '<ul><li>Play the riff on the low E string.</li><li>Say each note name out loud as you play it — B · B · D · B · A · G · F#.</li></ul>You\'ve got it when: one clean lap, no chart, every note named correctly. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 2 of 5</a>.',
                text_es: '<ul><li>Toca el riff en la cuerda Mi grave.</li><li>Di cada nombre de nota en voz alta mientras lo tocas — B · B · D · B · A · G · F#.</li></ul>Lo tienes cuando: una vuelta limpia, sin tabla, cada nota nombrada correctamente. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 2 de 5</a>.',
                hint: 'You played this riff in Module 1 with the TAB in front of you. Today the goal is knowing WHERE you are — name it, then play it.',
                hint_es: 'Tocaste este riff en el Módulo 1 con el TAB delante de ti. Hoy la meta es saber DÓNDE estás — nómbralo, luego tócalo.',
                stuck: 'Do it in two halves: name-and-play B B D B, then A G F#. Join them once each half is automatic.',
                stuck_es: 'Hazlo en dos mitades: nombra y toca B B D B, luego A G F#. Únelas una vez que cada mitad sea automática.',
                levelUp: 'Close your eyes for a lap, or play it one octave-position up starting at fret 7 of the A string.',
                levelUp_es: 'Cierra los ojos para una vuelta, o tócalo una octava más arriba empezando en el traste 7 de la cuerda La.',
                skills: [2, 3],
                tab: {
                  caption: '"Seven Nation Army" — riff · Low E string · say each note name',
                  caption_es: '"Seven Nation Army" — riff · cuerda Mi grave · di cada nombre de nota',
                  notes: [
                    { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                    { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                    { string: 'E', fret: 10, note: 'D',  midi: 50 },
                    { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                    { string: 'E', fret: 5,  note: 'A',  midi: 45 },
                    { string: 'E', fret: 3,  note: 'G',  midi: 43 },
                    { string: 'E', fret: 2,  note: 'F#', midi: 42 }
                  ]
                },
                response: { type: 'short', prompt: 'A lap without looking at the chart — clean or not yet? What note still needs a look at the chart?', prompt_es: 'Una vuelta sin mirar la tabla — ¿limpia o todavía no? ¿Qué nota todavía necesita una miradita a la tabla?', placeholder: 'e.g. clean! / still peeking at the G', placeholder_es: 'ej. ¡limpia! / todavía miro la G' }
              }
            ]
          },
          {
            title: 'My Practice Routine — weekly check-in (never graded)',
            title_es: 'Mi rutina de práctica — check-in semanal (nunca se califica)',
            steps: [
              {
                label: 'Plan your practice', label_es: 'Planea tu práctica',
                text: 'Plan your practice — this one\'s just for you, never graded. Take two minutes to update your routine:<ol><li>One thing you want to get better at.</li><li>When and where you\'ll practice this week.</li><li>How last week\'s plan went.</li></ol>Same check-in as Module 1 — we keep it going for the whole course.',
                text_es: 'Planea tu práctica — esta parte es solo para ti, nunca se califica. Tómate dos minutos para actualizar tu rutina:<ol><li>Una cosa en la que quieres mejorar.</li><li>Cuándo y dónde vas a practicar esta semana.</li><li>Cómo te fue con el plan de la semana pasada.</li></ol>El mismo check-in del Módulo 1 — lo mantenemos durante todo el curso.',
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
                label: 'Station wrap-up', label_es: 'Cierre de la estación',
                text: 'Which fret made you stop and count today? Write it below — that\'s your first thing to drill next time you practice.',
                text_es: '¿Qué traste te hizo detenerte y contar hoy? Escríbelo abajo — eso es lo primero que debes practicar la próxima vez.',
                response: { type: 'short', placeholder: 'e.g. A string fret 7 — I keep guessing D vs E',
                  placeholder_es: 'ej. traste 7 de la cuerda La — sigo adivinando entre D y E' }
              }
            ]
          },
          {
            title: '⚡ Ear Spark — optional ear bonus',
            title_es: '⚡ Chispa de oído — bono opcional',
            steps: [
              {
                label: 'Ear Spark: name the open strings', label_es: 'Chispa auditiva: nombra las cuerdas',
                text: '⚡ Ear Spark (optional, 2 min):<ol><li>Press play below — the deck draws five open strings at random and plucks them for you, and you never see which.</li><li>Name each one by ear before you check: thickest to thinnest is E-A-D-G-B-e, and your ear learns them faster than you\'d think.</li></ol>',
                text_es: '⚡ Chispa de oído (opcional, 2 min):<ol><li>Presiona reproducir abajo — la baraja saca cinco cuerdas al aire al azar y las pulsa por ti, y nunca ves cuáles son.</li><li>Nombra cada una de oído antes de revisar: de más gruesa a más delgada es E-A-D-G-B-e, y tu oído las aprende más rápido de lo que crees.</li></ol>',
                drill: { type: 'ear', pool: 'openStrings', draw: 5 },
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Names all notes on E string (frets 0–12) · Names all notes on A string (frets 0–12) · Points to a named note on the fretboard · Reads a basic fretboard note chart',
      goal_es: 'Nombra todas las notas en la cuerda Mi (trastes 0–12) · Nombra todas las notas en la cuerda La (trastes 0–12) · Señala una nota nombrada en el diapasón · Lee una tabla básica de notas del diapasón',
      performance: 'Self-quiz with shuffled note-name slips: draw a note, find it on the E or A string within 3 seconds. Then reverse it: draw a fret, name the note. 10 in a row each way.',
      selfCheck: 'Can you name every natural note on the E string without looking? Can you find any note on E or A within 3 seconds when a shuffled slip (or a friend) names it?',
      selfCheck_es: '¿Puedes nombrar cada nota natural en la cuerda Mi sin mirar? ¿Puedes encontrar cualquier nota en Mi o La en 3 segundos cuando un papelito revuelto (o un amigo) la nombra?',
      standards: ['Re.7a', 'Pr.4a']
    },

    skills: [
      { id: 'm2w1-s1', text: 'Recite the musical alphabet (A B C D E F G) from memory',
        text_es: 'Recitar el alfabeto musical (A B C D E F G) de memoria',
        gotItWhen: 'you can say A B C D E F G — and what comes after G — without pausing or looking at anything.',
        gotItWhen_es: 'puedes decir A B C D E F G — y lo que viene después de G — sin pausar ni mirar nada.',
        practice: { type: 'mc', prompt: 'What note comes after G?',
          prompt_es: '¿Qué nota viene después de G?',
          choices: ['G#', 'A', 'A#', 'It starts over at C'], choices_es: ['G#', 'A', 'A#', 'Vuelve a empezar en C'], answer: 1 } },
      { id: 'm2w1-s2', text: 'Name all natural notes on the E string (frets 0–12)',
        text_es: 'Nombrar todas las notas naturales en la cuerda Mi (trastes 0–12)',
        gotItWhen: 'you can draw any fret 0–12 at random — shuffled slip, or someone calling it out — and say the low-E note name instantly, without counting up from E.',
        gotItWhen_es: 'puedes sacar cualquier traste del 0 al 12 al azar — un papelito revuelto, o alguien que lo diga — y decir el nombre de la nota en la Mi grave al instante, sin contar desde E.',
        practice: { type: 'fretboard', string: 'lowE', label: 'Find the note — low E string', bpm: 60,
          notes: [40, 41, 43, 45, 47, 48, 50, 52] } },
      { id: 'm2w1-s3', text: 'Name all natural notes on the A string (frets 0–12)',
        text_es: 'Nombrar todas las notas naturales en la cuerda La (trastes 0–12)',
        gotItWhen: 'you can draw any fret 0–12 at random — shuffled slip, or someone calling it out — and say the A-string note name instantly, without counting up from A.',
        gotItWhen_es: 'puedes sacar cualquier traste del 0 al 12 al azar — un papelito revuelto, o alguien que lo diga — y decir el nombre de la nota en la cuerda La al instante, sin contar desde A.',
        practice: { type: 'fretboard', string: 'A', label: 'Find the note — A string', bpm: 60,
          notes: [45, 47, 48, 50, 52, 53, 55, 57] } },
      { id: 'm2w1-s4', text: 'Point to any named note on E or A string when called out',
        text_es: 'Señalar cualquier nota nombrada en la cuerda Mi o La cuando se diga en voz alta',
        gotItWhen: 'you draw a note name from your shuffled slips (or someone calls one out) and you can put your finger on it within 3 seconds without looking at a chart.',
        gotItWhen_es: 'sacas un nombre de nota de tus papelitos revueltos (o alguien lo dice) y puedes poner tu dedo ahí en 3 segundos sin mirar una tabla.',
        practice: { type: 'fretboard', string: 'both', label: 'Find the note — E and A strings' } },
      { id: 'm2w1-s5', text: 'Read a basic fretboard note-name chart',
        text_es: 'Leer una tabla básica de nombres de notas del diapasón',
        gotItWhen: 'you can use the chart to look up a note you don\'t know yet — you understand what the rows and columns mean.',
        gotItWhen_es: 'puedes usar la tabla para buscar una nota que todavía no sabes — entiendes lo que significan las filas y columnas.',
        practice: { type: 'mc', prompt: 'On a fretboard note-name chart, what does each ROW of the grid stand for?',
          prompt_es: 'En una tabla de nombres de notas del diapasón, ¿qué representa cada FILA de la cuadrícula?',
          choices: ['One string of the guitar', 'One finger of your fretting hand', 'One beat of the bar', 'One chord shape'],
          choices_es: ['Una cuerda de la guitarra', 'Un dedo de tu mano de trastear', 'Un tiempo del compás', 'La forma de un acorde'], answer: 0,
          explain: 'A fretboard chart is a map of the neck: rows are strings, columns are frets, and the name in each cell is the note at that spot.',
          explain_es: 'Una tabla del diapasón es un mapa del mástil: las filas son cuerdas, las columnas son trastes, y el nombre en cada celda es la nota en ese punto.' } }
    ]
  },

  {
    id: 'm2w2',
    songThread: [{ name: '"All Along the Watchtower"', journey: 'tabs/all-along-the-watchtower.html', layer: 2, note: 'the bass-note line — your assessment piece' }, { name: '"Seven Nation Army"', journey: 'tabs/seven-nation-army.html', layer: 2, note: 'the riff, note by note' }, { name: '"Sweet Child O\' Mine"', journey: 'tabs/sweet-child-o-mine.html', layer: 2, note: 'the bass roots' }, { name: '"Luna"', journey: 'tabs/luna.html', layer: 2, note: 'the single-note line' }, { name: '"Let It Be"', journey: 'tabs/let-it-be.html', layer: 2, note: 'the C–G–A–F bass outline' }],
    label: 'Set 2',
    locked: false,
    module: 'Notes on the E & A Strings',
    moduleNum: 2,
    unit: 'Module 2 · Notes on the E & A Strings',
    unit_es: 'Módulo 2 · Notas en las cuerdas Mi y La',
    title: 'Set 2',
    subtitle: 'Finger placement · Clean tone · TAB reading · 4-bar melodies',
    subtitle_es: 'Colocación de los dedos · Tono limpio · Lectura de TAB · Melodías de 4 compases',
    objective: 'I CAN press notes cleanly with correct finger placement, read basic TAB, and play a 4-bar melody in time.',
    skillFocus: 'Fretting notes cleanly · Reading basic TAB · Playing a melody in time',
    skillFocus_es: 'Trastear notas limpias · Leer TAB básico · Tocar una melodía a tiempo',
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
                label: 'Watch: spider exercises', label_es: 'Mira: ejercicios de araña',
                text: 'Watch: <a href="https://www.youtube.com/watch?v=DBNNf4Ri3yc" target="_blank">Spider Exercises: Finger Dexterity #1 – Lauren Bateman (0:00–4:00)</a>.',
                text_es: 'Mira: <a href="https://www.youtube.com/watch?v=DBNNf4Ri3yc" target="_blank">Spider Exercises: Finger Dexterity #1 – Lauren Bateman (0:00–4:00)</a>.',
                hint: 'Try each exercise slowly on your guitar as she demonstrates. Slow and clean is better than fast and buzzy, every time.',
                hint_es: 'Prueba cada ejercicio despacio en tu guitarra mientras ella lo demuestra. Despacio y limpio es siempre mejor que rápido y con zumbido.',
                skills: [1, 2, 3],
                response: { type: 'short', placeholder: 'Which exercise felt hardest, and what do you think makes it hard?',
                  placeholder_es: '¿Qué ejercicio se sintió más difícil, y por qué crees que es difícil?' }
              },
              {
                label: 'Watch: avoiding fret buzz', label_es: 'Mira: evita el zumbido',
                text: 'Watch: <a href="https://youtu.be/IscDj_-Nr0s" target="_blank">Finger Placement to Avoid Fret Buzz (BC-106) – JustinGuitar</a> (0:00–4:00).<span class="step-figure"><img src="img/m2-behind-the-fret.svg" alt="Side view of a string over the frets: a fingertip just behind the fret rings clean, a fingertip too far back buzzes, and a fingertip on top of the fret wire mutes the note."></span>',
                text_es: 'Mira: <a href="https://youtu.be/IscDj_-Nr0s" target="_blank">Finger Placement to Avoid Fret Buzz (BC-106) – JustinGuitar</a> (0:00–4:00).<span class="step-figure"><img src="img/m2-behind-the-fret.svg" alt="Vista lateral de una cuerda sobre los trastes: la yema justo detrás del traste suena limpia, muy atrás la nota zumba, y encima del traste la nota queda apagada."></span>',
                hint: 'As he lists each cause, pause and test it on your own guitar — find your buzz before he names the fix.',
                hint_es: 'Mientras él enumera cada causa, pausa y pruébala en tu propia guitarra — encuentra tu zumbido antes de que él nombre la solución.',
                skills: [1, 2],
                response: { type: 'mc', prompt: 'Which is the MOST common cause of fret buzz for beginners?',
                  prompt_es: '¿Cuál es la causa MÁS común de zumbido para principiantes?',
                  answer: 0,
                  explain: 'Light or too-far-from-the-fret pressure can\'t fully close the string — the #1 beginner cause. A wrong pick, bad tuning, or low volume won\'t make a note buzz.',
                  explain_es: 'Una presión ligera o muy alejada del traste no puede cerrar bien la cuerda — la causa número uno en principiantes. Una púa equivocada, una mala afinación o un volumen bajo no hacen que una nota zumbe.',
                  choices: [
                  'Pressing the string too lightly, or too far from the fret',
                  'Using the wrong pick',
                  'The guitar being out of tune',
                  'Strumming too quietly'
                ],
                  choices_es: [
                  'Presionar la cuerda demasiado suave, o muy lejos del traste',
                  'Usar la púa equivocada',
                  'Que la guitarra esté desafinada',
                  'Rasguear demasiado suave'
                ] }
              },
              {
                label: 'Watch: how to read TAB', label_es: 'Mira: cómo leer TAB',
                text: 'Watch: <a href="https://www.youtube.com/watch?v=qR0O0bUl5_A" target="_blank">How to Read Guitar TAB – Lauren Bateman (0:00–4:00)</a>.<span class="step-figure"><img src="img/m2-tab-orientation.svg" alt="A TAB staff with its six lines labeled: the top line is the thinnest string, high e, and the bottom line is the thickest string, low E."></span>',
                text_es: 'Mira: <a href="https://www.youtube.com/watch?v=qR0O0bUl5_A" target="_blank">How to Read Guitar TAB – Lauren Bateman (0:00–4:00)</a>.<span class="step-figure"><img src="img/m2-tab-orientation.svg" alt="Un TAB con sus seis líneas marcadas: la línea de arriba es la cuerda más delgada, la mi aguda, y la línea de abajo es la más gruesa, la Mi grave."></span>',
                hint: 'Pause when she shows a TAB example. Find those notes on your guitar before hitting play.',
                hint_es: 'Pausa cuando ella muestre un ejemplo de TAB. Encuentra esas notas en tu guitarra antes de presionar reproducir.',
                skills: [4],
                response: { type: 'mc', prompt: 'On a TAB diagram, the TOP line represents which string?',
                  prompt_es: 'En un diagrama de TAB, ¿qué cuerda representa la línea de ARRIBA?',
                  answer: 0,
                  explain: 'TAB lines mirror the strings by pitch: the TOP line is the thinnest, highest string (high e); the BOTTOM line is the low E.',
                  explain_es: 'Las líneas del TAB reflejan las cuerdas por su tono: la línea de ARRIBA es la cuerda más delgada y aguda (mi aguda); la línea de ABAJO es la Mi grave.',
                  choices: [
                  'The high E (thinnest) string',
                  'The low E (thickest) string',
                  'The A string',
                  'It depends on the song'
                ],
                  choices_es: [
                  'La cuerda mi aguda (la más delgada)',
                  'La cuerda Mi grave (la más gruesa)',
                  'La cuerda La',
                  'Depende de la canción'
                ] }
              }
            ]
          },
          {
            title: 'Practice TAB reading and clean notes',
            title_es: 'Practica la lectura de TAB y notas limpias',
            steps: [
              {
                label: 'Read TAB: "Happy Birthday"', label_es: 'Lee el TAB: "Happy Birthday"',
                text: 'Read this TAB: the opening of "Happy Birthday" written out on the low E string:<ol><li>Look at the fret numbers on the bottom line and try to play it.</li><li>Click any note name below the TAB to hear how it should sound.</li></ol>',
                text_es: 'Lee este TAB: el inicio de "Happy Birthday" escrito en la cuerda Mi grave:<ol><li>Mira los números de traste en la línea de abajo e intenta tocarlo.</li><li>Haz clic en cualquier nombre de nota debajo del TAB para escuchar cómo debe sonar.</li></ol>',
                hint: 'Read left-to-right, one note per beat. The numbers tell you which fret to press on the low E string. See a # (sharp)? It just means one fret higher than the plain note — F# is one fret above F. We\'ll cover sharps and flats later. For now, just trust the fret numbers.',
                hint_es: 'Lee de izquierda a derecha, una nota por pulso. Los números te dicen qué traste presionar en la cuerda Mi grave. ¿Ves un # (sostenido)? Solo significa un traste más arriba que la nota simple — F# es un traste arriba de F. Veremos sostenidos y bemoles más adelante. Por ahora, solo confía en los números de traste.',
                skills: [4, 5],
                tab: {
                  caption: '"Happy Birthday" — first two phrases · Low E string',
                  caption_es: '"Happy Birthday" — primeras dos frases · cuerda Mi grave',
                  notes: [
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'E', fret: 2, note: 'F#', midi: 42 },
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'E', fret: 5, note: 'A',  midi: 45 },
                    { string: 'E', fret: 4, note: 'G#', midi: 44 },
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'E', fret: 2, note: 'F#', midi: 42 },
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'E', fret: 7, note: 'B',  midi: 47 },
                    { string: 'E', fret: 5, note: 'A',  midi: 45 }
                  ]
                }
              },
              {
                label: 'Fret buzz self-check', label_es: 'Autorrevisión de zumbido',
                text: 'Fret buzz self-check:<ol><li>Play frets 1–4 on the low E string, one at a time.</li><li>Press lightly until you hear buzz, then press just enough to stop it.</li></ol>That is the minimum pressure needed.',
                text_es: 'Autorrevisión de zumbido:<ol><li>Toca los trastes 1–4 en la cuerda Mi grave, uno a la vez.</li><li>Presiona suave hasta que escuches zumbido, y luego presiona justo lo necesario para que pare.</li></ol>Esa es la presión mínima necesaria.',
                hint: 'Most beginners press too hard. Finding the minimum pressure is a real technique.',
                hint_es: 'La mayoría de los principiantes presiona demasiado fuerte. Encontrar la presión mínima es una técnica real.',
                skills: [1, 2],
                response: { type: 'mc', prompt: 'Where should your fingertip press to get the cleanest tone?',
                  prompt_es: '¿Dónde debe presionar la punta de tu dedo para lograr el tono más limpio?',
                  answer: 0,
                  explain: 'Press just behind the fret (toward the nut) with your fingertip — close to the wire without sitting on it gives the cleanest, buzz-free note.',
                  explain_es: 'Presiona justo detrás del traste (hacia la cejuela) con la punta del dedo — cerca del metal sin apoyarte encima da la nota más limpia y sin zumbido.',
                  choices: [
                  'Just behind the fret (toward the nut)',
                  'On top of the fret wire',
                  'In the middle of the fret space',
                  'As close to the nut as possible'
                ],
                  choices_es: [
                  'Justo detrás del traste (hacia la cejuela)',
                  'Encima del metal del traste',
                  'En medio del espacio del traste',
                  'Lo más cerca posible de la cejuela'
                ] }
              },
              {
                label: 'Read TAB: choose a song', label_es: 'Lee el TAB: elige una canción',
                text: 'Try reading the TAB for "Ode to Joy" or "Mary Had a Little Lamb". Play it through at least once — slow and clean. Click a song below to open its TAB.',
                text_es: 'Intenta leer el TAB de "Ode to Joy" o "Mary Had a Little Lamb". Tócalo completo al menos una vez — despacio y limpio. Haz clic en una canción abajo para abrir su TAB.',
                hint: 'If you get stuck on a note, use your note-name chart to find it. TAB numbers = fret numbers.',
                hint_es: 'Si te atascas en una nota, usa tu tabla de nombres de notas para encontrarla. Los números del TAB = números de traste.',
                skills: [4, 5],
                tabs: [
                  {
                    title: '"Ode to Joy" — opening phrase',
                    title_es: '"Ode to Joy" — frase inicial',
                    caption: 'A string · frets 3–10 · go slow',
                    caption_es: 'Cuerda La · trastes 3–10 · ve despacio',
                    notes: [
                      { string: 'A', fret: 7,  note: 'E',  midi: 52 },
                      { string: 'A', fret: 7,  note: 'E',  midi: 52 },
                      { string: 'A', fret: 8,  note: 'F',  midi: 53 },
                      { string: 'A', fret: 10, note: 'G',  midi: 55 },
                      { string: 'A', fret: 10, note: 'G',  midi: 55 },
                      { string: 'A', fret: 8,  note: 'F',  midi: 53 },
                      { string: 'A', fret: 7,  note: 'E',  midi: 52 },
                      { string: 'A', fret: 5,  note: 'D',  midi: 50 },
                      { string: 'A', fret: 3,  note: 'C',  midi: 48 },
                      { string: 'A', fret: 3,  note: 'C',  midi: 48 },
                      { string: 'A', fret: 5,  note: 'D',  midi: 50 },
                      { string: 'A', fret: 7,  note: 'E',  midi: 52 },
                      { string: 'A', fret: 7,  note: 'E',  midi: 52 },
                      { string: 'A', fret: 5,  note: 'D',  midi: 50 }
                    ]
                  },
                  {
                    title: '"Mary Had a Little Lamb" — opening phrase',
                    title_es: '"Mary Had a Little Lamb" — frase inicial',
                    caption: 'A string · frets 3–7 · 7 notes',
                    caption_es: 'Cuerda La · trastes 3–7 · 7 notas',
                    notes: [
                      { string: 'A', fret: 7, note: 'E', midi: 52 },
                      { string: 'A', fret: 5, note: 'D', midi: 50 },
                      { string: 'A', fret: 3, note: 'C', midi: 48 },
                      { string: 'A', fret: 5, note: 'D', midi: 50 },
                      { string: 'A', fret: 7, note: 'E', midi: 52 },
                      { string: 'A', fret: 7, note: 'E', midi: 52 },
                      { string: 'A', fret: 7, note: 'E', midi: 52 }
                    ]
                  }
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
                text: 'Station Wrap-Up — pause and think: what tripped you up most today — reading the TAB, or getting a clean note with no buzz? What felt easier than you expected?',
                text_es: 'Cierre de la estación — pausa y piensa: ¿qué te costó más hoy — leer el TAB, o lograr una nota limpia sin zumbido? ¿Qué se sintió más fácil de lo que esperabas?',
                response: { type: 'short', placeholder: 'e.g. reading TAB was fine, but fret 1 kept buzzing',
                  placeholder_es: 'ej. leer el TAB estuvo bien, pero el traste 1 seguía zumbando' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — melodies & TAB',
        title_es: 'Estación de práctica — melodías y TAB',
        sections: [
          {
            title: 'Press notes cleanly with no fret buzz',
            title_es: 'Presiona notas limpias sin zumbido',
            steps: [
          {
            label: 'Challenge 1 — Finger Workout', label_es: 'Reto 1 — Ejercicio de dedos',
            text: '<ol><li>Play frets 1–5 on the low E string, one finger per fret, then do the same on the A string.</li><li>Keep your thumb behind the neck.</li></ol>You\'ve got it when: every note rings clean with no buzz.<span class="step-figure"><img src="img/m2-thumb-behind-neck.svg" alt="The guitar neck seen end-on, twice: with the thumb flat on the back of the neck the fingers drop straight down, but with the thumb hooked over the top the fingers flatten and mute strings."></span>',
            text_es: '<ol><li>Toca los trastes 1–5 en la cuerda Mi grave, un dedo por traste, y luego lo mismo en la cuerda La.</li><li>Mantén el pulgar detrás del mástil.</li></ol>Lo tienes cuando: cada nota suena limpia sin zumbido.<span class="step-figure"><img src="img/m2-thumb-behind-neck.svg" alt="El mástil visto de frente en dos versiones: con el pulgar plano detrás del mástil los dedos caen rectos, pero con el pulgar enganchado por encima los dedos se aplastan y apagan cuerdas."></span>',
            hint: 'Go as slow as you need. Every note should ring cleanly with no buzz.',
            hint_es: 'Ve tan despacio como necesites. Cada nota debe sonar limpia sin zumbido.',
            stuck: 'Use just frets 1–3 with three fingers first, then add the pinky on frets 4–5.',
            stuck_es: 'Usa solo los trastes 1–3 con tres dedos primero, y luego agrega el meñique en los trastes 4–5.',
            levelUp: 'Run the same 1-2-3-4 pattern starting at fret 5, where the stretches are smaller — notice the difference.',
            levelUp_es: 'Haz el mismo patrón 1-2-3-4 empezando en el traste 5, donde los estiramientos son más pequeños — nota la diferencia.',
            skills: [1, 2, 3, 6]
          },
          {
            label: 'Minimum-pressure drill', label_es: 'Ejercicio de presión mínima',
            text: 'Minimum-pressure drill:<ol><li>Play frets 1–4 on the low E string one at a time.</li><li>Press lightly until it buzzes, then add just enough to make it ring clean.</li></ol>That is your target pressure.',
            text_es: 'Ejercicio de presión mínima:<ol><li>Toca los trastes 1–4 en la cuerda Mi grave uno a la vez.</li><li>Presiona suave hasta que zumbe, y luego agrega justo lo necesario para que suene limpio.</li></ol>Esa es tu presión objetivo.',
            hint: 'Press just behind the fret, on your fingertip, thumb behind the neck. Most beginners press far too hard.',
            hint_es: 'Presiona justo detrás del traste, con la punta del dedo, pulgar detrás del mástil. La mayoría de los principiantes presiona demasiado fuerte.',
            skills: [1, 2]
          },
          {
            label: 'One-finger-per-fret check', label_es: 'Revisión de un dedo por traste',
            text: 'One-finger-per-fret check: index=1, middle=2, ring=3, pinky=4 up the low E string. Every note rings — nothing buzzes or mutes. Click to hear the clean target tone.<span class="step-figure"><img src="img/m2-one-finger-per-fret.svg" alt="Fretboard diagram with a numbered dot just behind each of the first four frets on the low E string: finger 1 presses fret 1, finger 2 fret 2, finger 3 fret 3, and finger 4 fret 4."></span>',
            text_es: 'Revisión de un dedo por traste: índice=1, medio=2, anular=3, meñique=4 subiendo la cuerda Mi grave. Cada nota suena — nada zumba ni se apaga. Haz clic para escuchar el tono objetivo limpio.<span class="step-figure"><img src="img/m2-one-finger-per-fret.svg" alt="Diagrama del diapasón con un punto numerado justo detrás de cada uno de los primeros cuatro trastes en la cuerda Mi grave: el dedo 1 pisa el traste 1, el 2 el traste 2, el 3 el traste 3 y el 4 el traste 4."></span>',
            hint: 'Keep unused fingers hovering close, ready to drop down.',
            hint_es: 'Mantén los dedos que no usas flotando cerca, listos para bajar.',
            skills: [2, 3],
            playSeq: { label: 'Target tone (frets 1–4)', label_es: 'Tono objetivo (trastes 1–4)', bpm: 60, notes: [41, 42, 43, 44] }
          },
          {
            label: 'Quick check: clean notes', label_es: 'Revisión rápida: notas limpias',
            text: 'Quick check:',
            text_es: 'Revisión rápida:',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'The note still buzzes even though you\'re pressing just behind the fret. What\'s the most likely cause?',
              prompt_es: 'La nota sigue zumbando aunque estás presionando justo detrás del traste. ¿Cuál es la causa más probable?',
              answer: 0,
              explain: 'With good placement, buzz usually means too little pressure or a fingertip leaning over and deadening the string. Pressing harder isn\'t the fix — a vertical fingertip is.',
              explain_es: 'Con buena colocación, el zumbido usualmente significa muy poca presión o una punta del dedo inclinada que apaga la cuerda. Presionar más fuerte no es la solución — un dedo vertical sí lo es.',
              choices: [
              'Too little pressure, or a fingertip leaning over and muting the string',
              'Pressing too hard on the string',
              'The string is too new',
              'Holding the pick too tightly'
            ],
              choices_es: [
              'Muy poca presión, o una punta del dedo inclinada que apaga la cuerda',
              'Presionar demasiado fuerte la cuerda',
              'La cuerda es demasiado nueva',
              'Sostener la púa demasiado apretada'
            ] }
          }
            ]
          },
          {
            title: 'Read TAB & play a 4-bar melody in time at 60 BPM',
            title_es: 'Lee TAB y toca una melodía de 4 compases a tiempo a 60 BPM',
            steps: [
          {
            label: 'Warm-up TAB read', label_es: 'Lectura de calentamiento',
            text: 'Warm-up read — play this melody straight from the TAB at 60 BPM, one note per beat. Click any note name to hear how it should sound.',
            text_es: 'Lectura de calentamiento — toca esta melodía directo del TAB a 60 BPM, una nota por pulso. Haz clic en cualquier nombre de nota para escuchar cómo debe sonar.',
            hint: 'Read left-to-right. The numbers are fret numbers on the A string. If you buzz, fix the finger before moving on.',
            hint_es: 'Lee de izquierda a derecha. Los números son números de traste en la cuerda La. Si zumbas, arregla el dedo antes de seguir.',
            skills: [4, 5],
            tab: {
              caption: '"Mary Had a Little Lamb" — A string · frets 3–7 · 60 BPM',
              caption_es: '"Mary Had a Little Lamb" — cuerda La · trastes 3–7 · 60 BPM',
              notes: [
                { string: 'A', fret: 7, note: 'E', midi: 52 },
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'A', fret: 7, note: 'E', midi: 52 },
                { string: 'A', fret: 7, note: 'E', midi: 52 },
                { string: 'A', fret: 7, note: 'E', midi: 52 }
              ]
            }
          },
          {
            label: 'Challenge 2 — Play the Tune', label_es: 'Reto 2 — Toca la melodía',
            text: 'Using the TAB:<ul><li>Play "Happy Birthday" on the E & A strings at 60 BPM, one note per beat.</li></ul>You\'ve got it when: the whole melody start to finish, in time, no buzz. Click any note name to hear how it should sound.',
            text_es: 'Usando el TAB:<ul><li>Toca "Happy Birthday" en las cuerdas Mi y La a 60 BPM, una nota por pulso.</li></ul>Lo tienes cuando: la melodía completa de principio a fin, a tiempo, sin zumbido. Haz clic en cualquier nombre de nota para escuchar cómo debe sonar.',
            hint: 'If you buzz on a note, stop, fix your finger position, then continue. Don\'t just play through the buzz.',
            hint_es: 'Si zumbas en una nota, párate, arregla la posición del dedo, y luego continúa. No sigas tocando con el zumbido.',
            stuck: 'Play just the first phrase ("Hap-py birth-day to you") until it\'s smooth, then add the second.',
            stuck_es: 'Toca solo la primera frase ("Hap-py birth-day to you") hasta que salga suave, y luego agrega la segunda.',
            levelUp: 'Play it through with no note names showing, or bump the metronome to 80 BPM.',
            levelUp_es: 'Tócala completa sin mostrar los nombres de las notas, o sube el metrónomo a 80 BPM.',
            skills: [4, 5],
            tab: {
              caption: '"Happy Birthday" — full melody · E & A strings · 60 BPM',
              caption_es: '"Happy Birthday" — melodía completa · cuerdas Mi y La · 60 BPM',
              phrases: [
                {
                  label: '"Hap-py birth-day to you · Hap-py birth-day to you"',
                  notes: [
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'E', fret: 2, note: 'F#', midi: 42 },
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'E', fret: 5, note: 'A',  midi: 45 },
                    { string: 'E', fret: 4, note: 'G#', midi: 44 },
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'E', fret: 2, note: 'F#', midi: 42 },
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'A', fret: 2, note: 'B',  midi: 47 },
                    { string: 'A', fret: 0, note: 'A',  midi: 45 }
                  ]
                },
                {
                  label: '"Hap-py birth-day dear ___ · Hap-py birth-day to you"',
                  notes: [
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'A', fret: 7, note: 'E',  midi: 52 },
                    { string: 'A', fret: 4, note: 'C#', midi: 49 },
                    { string: 'A', fret: 0, note: 'A',  midi: 45 },
                    { string: 'E', fret: 4, note: 'G#', midi: 44 },
                    { string: 'E', fret: 2, note: 'F#', midi: 42 },
                    { string: 'A', fret: 5, note: 'D',  midi: 50 },
                    { string: 'A', fret: 5, note: 'D',  midi: 50 },
                    { string: 'A', fret: 4, note: 'C#', midi: 49 },
                    { string: 'A', fret: 0, note: 'A',  midi: 45 },
                    { string: 'A', fret: 2, note: 'B',  midi: 47 },
                    { string: 'A', fret: 0, note: 'A',  midi: 45 }
                  ]
                }
              ]
            }
          },
          {
            label: 'Challenge 3 — "Watchtower" Bass Riff (your module assessment piece)', label_es: 'Reto 3 — Riff de bajo de "Watchtower" (tu pieza de evaluación del módulo)',
            text: 'Using the TAB:<ul><li>Play the "All Along the Watchtower" bass line on the low E string only — A · G · F · G, looping — one note per beat at 60 BPM.</li></ul>You\'ve got it when: the riff start to finish from memory, in time, with clean tone and correct fingering. Click any note name to hear how it should sound. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 2 of 5</a>.<span class="step-figure"><img src="img/m2-record-assessment.svg" alt="Three steps: turn on the Chromebook camera, press record, and play the riff A G F G from memory."></span>',
            text_es: 'Usando el TAB:<ul><li>Toca la línea de bajo de "All Along the Watchtower" solo en la cuerda Mi grave — A · G · F · G, en bucle — una nota por pulso a 60 BPM.</li></ul>Lo tienes cuando: el riff de principio a fin de memoria, a tiempo, con tono limpio y digitación correcta. Haz clic en cualquier nombre de nota para escuchar cómo debe sonar. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 2 de 5</a>.<span class="step-figure"><img src="img/m2-record-assessment.svg" alt="Tres pasos: enciende la cámara del Chromebook, pulsa grabar y toca el riff A, G, F, G de memoria."></span>',
            hint: 'Fingering: index on fret 1 (F), ring on fret 3 (G), pinky on fret 5 (A) — a one-fret stretch past your usual index=1/middle=2/ring=3/pinky=4 hand position, since this riff climbs past fret 4. Keep your thumb behind the neck. Let each note ring fully before the next. Drill it until you can run it with your eyes closed — then record yourself playing it: that\'s your module-end assessment piece.',
            hint_es: 'Digitación: índice en el traste 1 (F), anular en el traste 3 (G), meñique en el traste 5 (A) — un estiramiento de un traste más allá de tu posición habitual índice=1/medio=2/anular=3/meñique=4, porque este riff sube más allá del traste 4. Mantén el pulgar detrás del mástil. Deja que cada nota suene por completo antes de la siguiente. Practícalo hasta que puedas tocarlo con los ojos cerrados — luego grábate tocándolo: esa es tu pieza de evaluación de fin de módulo.',
            stuck: 'Loop just F–G (frets 1–3) until the finger change is clean, then add the A on fret 5.',
            stuck_es: 'Repite solo F–G (trastes 1–3) hasta que el cambio de dedo salga limpio, y luego agrega el A en el traste 5.',
            levelUp: 'Run the whole riff with your eyes closed — that\'s the real "from memory" test.',
            levelUp_es: 'Toca el riff completo con los ojos cerrados — esa es la verdadera prueba "de memoria".',
            skills: [1, 2, 4, 5, 6],
            tab: {
              caption: '"All Along the Watchtower" — bass-note riff · Low E string · loops · 60 BPM',
              caption_es: '"All Along the Watchtower" — riff de bajo · cuerda Mi grave · en bucle · 60 BPM',
              notes: [
                { string: 'E', fret: 5, note: 'A', midi: 45 },
                { string: 'E', fret: 3, note: 'G', midi: 43 },
                { string: 'E', fret: 1, note: 'F', midi: 41 },
                { string: 'E', fret: 3, note: 'G', midi: 43 },
                { string: 'E', fret: 5, note: 'A', midi: 45 },
                { string: 'E', fret: 3, note: 'G', midi: 43 },
                { string: 'E', fret: 1, note: 'F', midi: 41 },
                { string: 'E', fret: 3, note: 'G', midi: 43 }
              ]
            },
            response: { type: 'short', prompt: 'Personal record: once it loops clean at 60, raise the metronome +10 at a time. Your fastest CLEAN loop today (BPM)?', prompt_es: 'Récord personal: una vez que el bucle salga limpio a 60, sube el metrónomo de 10 en 10. ¿Cuál es tu bucle LIMPIO más rápido hoy (BPM)?', placeholder: 'e.g. 100 — try for a higher number next session', placeholder_es: 'ej. 100 — intenta superarlo la próxima sesión' }
          },
          {
            label: 'Bonus: "Sweet Child O\' Mine" roots', label_es: 'Extra: raíces de "Sweet Child O\' Mine"',
            text: 'Bonus riff — "Sweet Child O\' Mine" (Guns N\' Roses) bass roots on the E & A strings:<ol><li>Play the root note under each verse chord — D · C · G · D — one per bar at 60 BPM.</li><li>Click any note name to hear how it should sound.</li></ol><a href="tabs/sweet-child-o-mine.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 2 of 5</a>.',
            text_es: 'Riff extra — raíces de bajo de "Sweet Child O\' Mine" (Guns N\' Roses) en las cuerdas Mi y La:<ol><li>Toca la nota raíz bajo cada acorde de la estrofa — D · C · G · D — una por compás a 60 BPM.</li><li>Haz clic en cualquier nombre de nota para escuchar cómo debe sonar.</li></ol><a href="tabs/sweet-child-o-mine.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 2 de 5</a>.',
            hint: 'These are the roots of the D–C–G verse loop. Note: the original recording is tuned a half-step lower, so your notes will sound slightly higher than the recording — that\'s normal, not a mistake.',
            hint_es: 'Estas son las raíces del bucle D–C–G de la estrofa. Nota: la grabación original está afinada medio tono más abajo, así que tus notas sonarán un poco más agudas que la grabación — eso es normal, no un error.',
            skills: [4, 5],
            tab: {
              caption: '"Sweet Child O\' Mine" — verse bass roots · E & A strings · 60 BPM',
              caption_es: '"Sweet Child O\' Mine" — raíces de bajo de la estrofa · cuerdas Mi y La · 60 BPM',
              notes: [
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'E', fret: 3, note: 'G', midi: 43 },
                { string: 'E', fret: 3, note: 'G', midi: 43 },
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'A', fret: 5, note: 'D', midi: 50 }
              ]
            }
          },
          {
            label: 'Quick check: reading TAB', label_es: 'Revisión rápida: lectura de TAB',
            text: 'Quick check on reading TAB:',
            text_es: 'Revisión rápida sobre la lectura de TAB:',
            skills: [4],
            response: { type: 'mc', prompt: 'In TAB the bottom line is the low E string and the line above it is the A string. A "3" on the A-string line is which note?',
              prompt_es: 'En el TAB la línea de abajo es la cuerda Mi grave y la línea justo encima es la cuerda La. Si ves un "3" en la línea de la cuerda La, ¿qué nota es?',
              answer: 1,
              explain: 'From open A: A(0)–A#(1)–B(2)–C(3). A "3" on the A-string line is C.',
              explain_es: 'Desde la A al aire: A(0)–A#(1)–B(2)–C(3). Un "3" en la línea de la cuerda La es C.',
              choices: ['B', 'C', 'D', 'G'],
              choices_es: ['B', 'C', 'D', 'G'] }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Watchtower" bass line', label_es: 'Reto — Línea de bajo de "Watchtower"',
                text: '<ul><li>Play the "All Along the Watchtower" bass loop on the low E string — A · G · F · G — one note per beat at 60 BPM, four laps without stopping.</li></ul>You\'ve got it when: four laps, every note landing on the click. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 2 of 5</a>.',
                text_es: '<ul><li>Toca el bucle de bajo de "All Along the Watchtower" en la cuerda Mi grave — A · G · F · G — una nota por pulso a 60 BPM, cuatro vueltas sin parar.</li></ul>Lo tienes cuando: cuatro vueltas, cada nota cayendo con el clic. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 2 de 5</a>.',
                hint: 'Three notes carry this whole song. Keep your eyes one note ahead of your pick.',
                hint_es: 'Tres notas sostienen toda esta canción. Mantén tus ojos una nota por delante de tu púa.',
                stuck: 'Loop just A → G until the shift is smooth, then add the F.',
                stuck_es: 'Repite solo A → G hasta que el cambio sea suave, y luego agrega el F.',
                levelUp: 'Say each note name out loud while playing, or double the loop to eight laps without a stumble.',
                levelUp_es: 'Di cada nombre de nota en voz alta mientras tocas, o duplica el bucle a ocho vueltas sin tropezar.',
                skills: [1, 2, 4, 5, 6],
                tab: {
                  caption: '"All Along the Watchtower" — bass loop · Low E string · 60 BPM',
                  caption_es: '"All Along the Watchtower" — bucle de bajo · cuerda Mi grave · 60 BPM',
                  notes: [
                    { string: 'E', fret: 5, note: 'A', midi: 45 },
                    { string: 'E', fret: 3, note: 'G', midi: 43 },
                    { string: 'E', fret: 1, note: 'F', midi: 41 },
                    { string: 'E', fret: 3, note: 'G', midi: 43 }
                  ]
                },
                response: { type: 'short', prompt: 'How many clean laps in a row did you get at 60 BPM?', prompt_es: '¿Cuántas vueltas limpias seguidas lograste a 60 BPM?', placeholder: 'e.g. 4 — try for a higher number next session', placeholder_es: 'ej. 4 — intenta superarlo la próxima sesión' }
              },
              {
                label: 'Challenge — "Seven Nation Army," true pitch', label_es: 'Reto — "Seven Nation Army," tono real',
                text: '<ul><li>Play the riff where the record actually lives — on the A string — E · E · G · E · D · C · B at 60 BPM.</li></ul>You\'ve got it when: two clean laps, and you can say which string version sounds like the recording. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 2 of 5</a>.',
                text_es: '<ul><li>Toca el riff donde realmente vive en la grabación — en la cuerda La — E · E · G · E · D · C · B a 60 BPM.</li></ul>Lo tienes cuando: dos vueltas limpias, y puedes decir qué versión de cuerda suena como la grabación. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 2 de 5</a>.',
                hint: 'Same riff, new string, new note names. Notice how the shape of the moves feels the same even though every name changed.',
                hint_es: 'El mismo riff, una nueva cuerda, nuevos nombres de notas. Fíjate en cómo la forma de los movimientos se siente igual aunque cada nombre cambió.',
                stuck: 'Go back to your low-E version for one lap to remind your hand of the moves, then bring it up to the A string.',
                stuck_es: 'Regresa a tu versión de la Mi grave por una vuelta para recordarle a tu mano los movimientos, y luego llévalo a la cuerda La.',
                levelUp: 'Alternate laps: one on low E, one on the A string, without stopping between.',
                levelUp_es: 'Alterna vueltas: una en la Mi grave, una en la cuerda La, sin parar entre ellas.',
                skills: [1, 2, 4, 5, 6],
                tab: {
                  caption: '"Seven Nation Army" — riff at true pitch · A string · 60 BPM',
                  caption_es: '"Seven Nation Army" — riff en tono real · cuerda La · 60 BPM',
                  notes: [
                    { string: 'A', fret: 7,  note: 'E', midi: 52 },
                    { string: 'A', fret: 7,  note: 'E', midi: 52 },
                    { string: 'A', fret: 10, note: 'G', midi: 55 },
                    { string: 'A', fret: 7,  note: 'E', midi: 52 },
                    { string: 'A', fret: 5,  note: 'D', midi: 50 },
                    { string: 'A', fret: 3,  note: 'C', midi: 48 },
                    { string: 'A', fret: 2,  note: 'B', midi: 47 }
                  ]
                },
                response: { type: 'short', prompt: 'Which version do you like playing more — low E or A string — and why?', prompt_es: '¿Qué versión te gusta más tocar — Mi grave o cuerda La — y por qué?', placeholder: 'e.g. A string, it sounds like the song', placeholder_es: 'ej. cuerda La, suena como la canción' }
              },
              {
                label: 'Challenge — "the cure," root line', label_es: 'Reto — "the cure," línea de raíces',
                text: '<ul><li>Play the roots of Olivia Rodrigo\'s "the cure" across both strings — A · C · D · F · G — two beats per note at 60 BPM.</li></ul>You\'ve got it when: two clean laps crossing between the A and E strings without looking down.',
                text_es: '<ul><li>Toca las raíces de "the cure" de Olivia Rodrigo cruzando ambas cuerdas — A · C · D · F · G — dos pulsos por nota a 60 BPM.</li></ul>Lo tienes cuando: dos vueltas limpias cruzando entre las cuerdas La y Mi sin mirar hacia abajo.',
                hint: 'This is the simplest outline of the song — next module these exact roots become power chords. Learn where they live now and Module 3 is half done.',
                hint_es: 'Este es el esquema más simple de la canción — en el próximo módulo estas mismas raíces se convierten en acordes de potencia. Aprende dónde viven ahora y el Módulo 3 estará medio hecho.',
                stuck: 'Split it by string: A · C · D on the A string first, then F · G on the low E, then join them.',
                stuck_es: 'Divídelo por cuerda: A · C · D en la cuerda La primero, luego F · G en la Mi grave, y luego únelas.',
                levelUp: 'Play the lap with the play button keeping the beat, or say each note name as you land it. Got someone around? Have them clap the beat instead.',
                levelUp_es: 'Toca la vuelta con el botón de reproducir marcando el pulso, o di cada nombre de nota al aterrizarla. ¿Tienes a alguien cerca? Pídele que marque el pulso con palmas en su lugar.',
                skills: [1, 2, 4, 5, 6],
                tab: {
                  caption: '"the cure" — root line (teaching arrangement) · 60 BPM',
                  caption_es: '"the cure" — línea de raíces (arreglo didáctico) · 60 BPM',
                  notes: [
                    { string: 'A', fret: 0, note: 'A', midi: 45 },
                    { string: 'A', fret: 0, note: 'A', midi: 45 },
                    { string: 'A', fret: 3, note: 'C', midi: 48 },
                    { string: 'A', fret: 3, note: 'C', midi: 48 },
                    { string: 'A', fret: 5, note: 'D', midi: 50 },
                    { string: 'A', fret: 5, note: 'D', midi: 50 },
                    { string: 'E', fret: 1, note: 'F', midi: 41 },
                    { string: 'E', fret: 1, note: 'F', midi: 41 },
                    { string: 'E', fret: 3, note: 'G', midi: 43 },
                    { string: 'E', fret: 3, note: 'G', midi: 43 }
                  ]
                },
                response: { type: 'short', prompt: 'Which move was harder — crossing strings from D down to F, or walking up the same string from F to G?', prompt_es: '¿Qué movimiento fue más difícil — cruzar de cuerda de D a F, o subir por la misma cuerda de F a G?', placeholder: 'e.g. D to F — big jump', placeholder_es: 'ej. D a F — un salto grande' }
              },
              {
                label: 'Challenge — "Luna," bass roots', label_es: 'Reto — "Luna," raíces de bajo',
                text: '"Luna" rides two chords — F and Am — so its bassline is two notes:<ol><li>Play F (low E string, fret 1) and A (open A string) as single notes, two big beats each.</li><li>The song is in 6/8, so feel the pulse in 2 and land each note on a downbeat.</li></ol>You\'ve got it when: four laps of F → A, both notes clean with no buzz, locked to the downbeats at 60 BPM. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 2 of 5</a>.',
                text_es: '"Luna" se apoya en dos acordes — F y Am — así que su línea de bajo son dos notas:<ol><li>Toca F (cuerda Mi grave, traste 1) y A (cuerda La al aire) como notas individuales, dos pulsos grandes cada una.</li><li>La canción está en 6/8, así que siente el pulso en 2 y aterriza cada nota en un tiempo fuerte.</li></ol>Lo tienes cuando: cuatro vueltas de F → A, ambas notas limpias sin zumbido, ajustadas a los tiempos fuertes a 60 BPM. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 2 de 5</a>.',
                hint: 'Fret 1 is the tightest squeeze on the neck — press right behind the fret wire with the tip of your index and the F will ring clean.',
                hint_es: 'El traste 1 es el aprieto más fuerte del mástil — presiona justo detrás del metal del traste con la punta de tu índice y el F sonará limpio.',
                stuck: 'Park on just the F: pluck, listen, adjust, until five ring in a row. Then add the open A — that one\'s free.',
                stuck_es: 'Quédate solo en el F: pulsa, escucha, ajusta, hasta que salgan cinco seguidas. Luego agrega la A al aire — esa es gratis.',
                levelUp: 'Trade the open A for fret 5 on the low E — same note, new position. Want the simplified requinto intro line (a requinto is a small, higher-pitched guitar that plays the lead melody)? It\'s the bonus Layer 6 on the "Luna" Song Journey.',
                levelUp_es: 'Cambia la A al aire por el traste 5 de la Mi grave — la misma nota, una posición nueva. ¿Quieres la línea de intro simplificada de requinto (un requinto es una guitarra pequeña y de tono más agudo que toca la melodía principal)? Es la Capa 6 extra en el Recorrido de la canción de "Luna".'
              },
              {
                label: 'Challenge — "Let It Be," bass line', label_es: 'Reto — "Let It Be," línea de bajo',
                text: '<ul><li>Play the roots of "Let It Be" (Beatles) on the low E & A strings — C · G · A · F, two beats each at 60 BPM.</li></ul>These four notes are the simple bass outline of the whole song, so learn where its roots live now. You\'ve got it when: two clean laps of C–G–A–F, every note ringing, each landing on the beat.',
                text_es: '<ul><li>Toca las raíces de "Let It Be" (Beatles) en las cuerdas Mi y La — C · G · A · F, dos pulsos cada una a 60 BPM.</li></ul>Estas cuatro notas son el esquema simple de bajo de toda la canción, así que aprende dónde viven sus raíces desde ahora. Lo tienes cuando: dos vueltas limpias de C–G–A–F, cada nota sonando, cada una cayendo en el pulso.',
                hint: 'C is A-string fret 3 (ring finger), G is low-E fret 3 (ring finger), A is the open A string, F is low-E fret 1 (index). Watch the crossings between the two strings and keep your thumb behind the neck. Click any note name to hear how it should sound.',
                hint_es: 'C es el traste 3 de la cuerda La (dedo anular), G es el traste 3 de la Mi grave (dedo anular), A es la cuerda La al aire, F es el traste 1 de la Mi grave (índice). Fíjate en los cruces entre las dos cuerdas y mantén el pulgar detrás del mástil. Haz clic en cualquier nombre de nota para escuchar cómo debe sonar.',
                stuck: 'Split it by string: play C then A (both on the A string), then G then F (both on the low E), then join all four in order.',
                stuck_es: 'Divídelo por cuerda: toca C y luego A (ambas en la cuerda La), luego G y luego F (ambas en la Mi grave), y luego une las cuatro en orden.',
                levelUp: 'Say each root name out loud as you land it, or run four laps in a row without stopping.',
                levelUp_es: 'Di cada nombre de raíz en voz alta al aterrizarla, o haz cuatro vueltas seguidas sin parar.',
                skills: [1, 2, 4, 5, 6],
                tab: {
                  caption: '"Let It Be" — bass roots · E & A strings · two beats each · 60 BPM',
                  caption_es: '"Let It Be" — raíces de bajo · cuerdas Mi y La · dos pulsos cada una · 60 BPM',
                  notes: [
                    { string: 'A', fret: 3, note: 'C', midi: 48 },
                    { string: 'A', fret: 3, note: 'C', midi: 48 },
                    { string: 'E', fret: 3, note: 'G', midi: 43 },
                    { string: 'E', fret: 3, note: 'G', midi: 43 },
                    { string: 'A', fret: 0, note: 'A', midi: 45 },
                    { string: 'A', fret: 0, note: 'A', midi: 45 },
                    { string: 'E', fret: 1, note: 'F', midi: 41 },
                    { string: 'E', fret: 1, note: 'F', midi: 41 }
                  ]
                },
                response: { type: 'short', prompt: 'Which string crossing was trickiest — C down to G, or A down to F?', prompt_es: '¿Qué cruce de cuerda fue más complicado — C bajando a G, o A bajando a F?', placeholder: 'e.g. A to F — the jump across strings', placeholder_es: 'ej. A a F — el salto entre cuerdas' }
              },
              {
                label: 'Challenge — Mystery TAB (sight-read it cold)', label_es: 'Reto — TAB misterioso (léelo a primera vista, en frío)',
                text: 'Here\'s a 2-bar melody you\'ve never heard.<ol><li>Do NOT press ▶ Play tab first.</li><li>Read it straight off the page — work out each string and fret and play all the way through, one note per beat at 60 BPM.</li><li>THEN press ▶ Play tab to check yourself.</li></ol>You\'ve got it when: you play it correctly on the first cold read, before ever hearing it. That\'s real sight-reading, and it\'s exactly what your module assessment asks for.',
                text_es: 'Aquí hay una melodía de 2 compases que nunca has escuchado.<ol><li>NO presiones ▶ Tocar el tab primero.</li><li>Léela directo de la página — descifra cada cuerda y traste y tócala completa, una nota por pulso a 60 BPM.</li><li>LUEGO presiona ▶ Tocar el tab para revisarte.</li></ol>Lo tienes cuando: la tocas correctamente en la primera lectura en frío, antes de escucharla siquiera. Eso es lectura a primera vista real, y es exactamente lo que pide tu evaluación del módulo.',
                hint: 'This is the whole point of sight-reading: playing music you don\'t already know by ear. Bottom line = low E, the line above it = A, the next one up = D. Every fret here is 0–3 on the A and D strings. Say each note name before you pluck it, then use ▶ Play tab as your answer key — only after you\'ve played it yourself.',
                hint_es: 'Este es todo el punto de la lectura a primera vista: tocar música que todavía no conoces de oído. Línea de abajo = Mi grave, la línea justo encima = La, la siguiente hacia arriba = Re. Cada traste aquí es 0–3 en las cuerdas La y Re. Di cada nombre de nota antes de pulsarla, y luego usa ▶ Tocar el tab como tu clave de respuestas — solo después de haberla tocado tú.',
                stuck: 'Break it into two 1-bar halves: read and play the first four notes clean, then the last four, then join them. Peeking at your note-name chart to find a fret is fine — hitting Play tab to hear the tune first is not (hearing it cold is the part you\'re testing).',
                stuck_es: 'Divídela en dos mitades de 1 compás: lee y toca limpias las primeras cuatro notas, luego las últimas cuatro, y luego únelas. Ver tu tabla de nombres de notas para encontrar un traste está bien — presionar Tocar el tab para escuchar la melodía primero no lo está (escucharla en frío es lo que estás poniendo a prueba).',
                levelUp: 'Cover the note names and read from the fret numbers alone, or play it once, look away, and try to play it back from memory.',
                levelUp_es: 'Cubre los nombres de las notas y lee solo con los números de traste, o tócala una vez, mira hacia otro lado, e intenta tocarla de nuevo de memoria.',
                skills: [4, 5],
                tab: {
                  caption: 'Mystery melody — sight-read cold · A & D strings · frets 0–3 · 60 BPM',
                  caption_es: 'Melodía misteriosa — lectura en frío · cuerdas La y Re · trastes 0–3 · 60 BPM',
                  notes: [
                    { string: 'A', fret: 0, note: 'A', midi: 45 },
                    { string: 'A', fret: 2, note: 'B', midi: 47 },
                    { string: 'A', fret: 3, note: 'C', midi: 48 },
                    { string: 'D', fret: 0, note: 'D', midi: 50 },
                    { string: 'D', fret: 2, note: 'E', midi: 52 },
                    { string: 'D', fret: 0, note: 'D', midi: 50 },
                    { string: 'A', fret: 3, note: 'C', midi: 48 },
                    { string: 'A', fret: 0, note: 'A', midi: 45 }
                  ]
                },
                response: { type: 'short', prompt: 'First cold read — did your played version match the ▶ Play tab check? Which note (if any) did you misread?', prompt_es: 'Primera lectura en frío — ¿tu versión tocada coincidió con la revisión de ▶ Tocar el tab? ¿Qué nota (si acaso) leíste mal?', placeholder: 'e.g. matched! / misread the D-string fret 2', placeholder_es: 'ej. ¡coincidió! / leí mal el traste 2 de la cuerda Re' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Station wrap-up', label_es: 'Cierre de la estación',
                text: 'Which part of your "Watchtower" assessment riff still needs work? Write it below — that\'s your warm-up target next time you practice.',
                text_es: '¿Qué parte de tu riff de evaluación de "Watchtower" todavía necesita trabajo? Escríbelo abajo — ese es tu objetivo de calentamiento la próxima vez que practiques.',
                response: { type: 'short', placeholder: 'e.g. the F-to-G change on frets 1 and 3 is shaky',
                  placeholder_es: 'ej. el cambio de F a G en los trastes 1 y 3 sale inestable' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Module-end recording: (1) Play the "All Along the Watchtower" bass-note line on the low E string from memory, to the metronome at 60 BPM, with clean tone and correct fingering — or the alternate single-note root line from "the cure." (2) Sight-read a short 2-bar bass line from TAB.',
      goal_es: 'Grabación de fin de módulo: (1) Toca la línea de bajo de "All Along the Watchtower" en la cuerda Mi grave de memoria, con el metrónomo a 60 BPM, con tono limpio y digitación correcta — o la línea alterna de raíces de una sola nota de "the cure." (2) Lee a primera vista una línea corta de bajo de 2 compases desde el TAB.',
      performance: 'Self-check: record yourself playing the "Watchtower" low-E line from memory at 60 BPM, then sight-read and play a short 2-bar bass line from TAB. Listen back and name one thing to improve.',
      selfCheck: 'Can you press a note cleanly with no buzzing? Can you read a basic TAB? Can you play a 4-bar melody in time at 60 BPM?',
      selfCheck_es: '¿Puedes presionar una nota limpia sin zumbido? ¿Puedes leer un TAB básico? ¿Puedes tocar una melodía de 4 compases a tiempo a 60 BPM?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a', 'Re.7a']
    },

    skills: [
      { id: 'm2w2-s1', text: 'Press notes cleanly — no buzzing — by pressing just behind the fret',
        text_es: 'Presionar notas limpias — sin zumbido — presionando justo detrás del traste',
        gotItWhen: 'you play frets 1–5 on the E string and every note sustains cleanly — no buzzing, no muffling.',
        gotItWhen_es: 'tocas los trastes 1–5 en la cuerda Mi y cada nota suena limpia y sostenida — sin zumbido, sin apagarse.',
        practice: { type: 'playSeq', label: 'E string frets 1–5 — every note clean', label_es: 'Cuerda Mi, trastes 1–5 — cada nota limpia', bpm: 60,
          notes: [41, 42, 43, 44, 45, 44, 43, 42, 41] } },
      { id: 'm2w2-s2', text: 'Use correct finger per fret (index=1, middle=2, ring=3, pinky=4)',
        text_es: 'Usar el dedo correcto por traste (índice=1, medio=2, anular=3, meñique=4)',
        gotItWhen: 'your index finger always plays fret 1, middle plays fret 2, ring plays fret 3, pinky plays fret 4 — without having to think about it.',
        gotItWhen_es: 'tu dedo índice siempre toca el traste 1, el medio toca el 2, el anular toca el 3, el meñique toca el 4 — sin tener que pensarlo.',
        practice: { type: 'mc', prompt: 'In one-finger-per-fret position (index on fret 1), which finger plays fret 3?',
          prompt_es: 'En la posición de un-dedo-por-traste (índice en el traste 1), ¿qué dedo toca el traste 3?',
          choices: ['Index (1)', 'Middle (2)', 'Ring (3)', 'Pinky (4)'],
          choices_es: ['Índice (1)', 'Medio (2)', 'Anular (3)', 'Meñique (4)'], answer: 2,
          explain: 'Each finger owns one fret: index=1, middle=2, ring=3, pinky=4. Sliding the index around to reach everything is the habit this rule breaks.',
          explain_es: 'Cada dedo es dueño de un traste: índice=1, medio=2, anular=3, meñique=4. Deslizar el índice para alcanzarlo todo es el hábito que esta regla rompe.' } },
      { id: 'm2w2-s3', text: 'Keep unused fingers hovering close to the strings',
        text_es: 'Mantener los dedos que no usas flotando cerca de las cuerdas',
        gotItWhen: 'your fingers that aren\'t pressing a note stay within about a centimeter of the strings, ready to drop down.',
        gotItWhen_es: 'los dedos que no están presionando una nota se quedan a un centímetro más o menos de las cuerdas, listos para bajar.',
        practice: { type: 'mc', prompt: 'Between notes, where should the fingers you\'re NOT using be?',
          prompt_es: 'Entre notas, ¿dónde deben estar los dedos que NO estás usando?',
          choices: ['Curled into your palm, out of the way', 'Hovering about a centimeter above the strings', 'Resting flat across the strings', 'Stretched straight out for balance'],
          choices_es: ['Enroscados dentro de tu palma, fuera del camino', 'Flotando a un centímetro por encima de las cuerdas', 'Apoyados planos sobre las cuerdas', 'Estirados rectos para el equilibrio'], answer: 1,
          explain: 'Fingers that fly away or curl into your palm have a long trip back to the fretboard. Hovering close keeps every note one small drop away.',
          explain_es: 'Los dedos que se alejan volando o se esconden en la palma tienen un viaje largo de regreso al diapasón. Flotar cerca deja cada nota a una pequeña caída de distancia.' } },
      { id: 'm2w2-s4', text: 'Sight-read a basic 2-bar TAB line (strings, fret numbers, left-to-right order)',
        text_es: 'Leer a primera vista una línea básica de TAB de 2 compases (cuerdas, números de traste, orden de izquierda a derecha)',
        gotItWhen: 'you can look at a short TAB line you haven\'t drilled, identify which string and fret each number refers to, and play it — that\'s sight-reading.',
        gotItWhen_es: 'puedes ver una línea corta de TAB que no has practicado, identificar a qué cuerda y traste se refiere cada número, y tocarla — eso es lectura a primera vista.',
        practice: { type: 'mc',
          prompt: 'In TAB, the bottom line is the low E string and the line above it is the A string. If you see a "3" on the A-string line, which note do you play?',
          prompt_es: 'En el TAB, la línea de abajo es la cuerda Mi grave y la línea justo encima es la cuerda La. Si ves un "3" en la línea de la cuerda La, ¿qué nota tocas?',
          choices: ['B', 'C', 'D', 'G'], choices_es: ['B', 'C', 'D', 'G'], answer: 1 } },
      { id: 'm2w2-s5', text: 'Play a 4-bar melody in time at 60 BPM',
        text_es: 'Tocar una melodía de 4 compases a tiempo a 60 BPM',
        gotItWhen: 'you can play the "Happy Birthday" phrase all the way through at 60 BPM without stopping to find a note.',
        gotItWhen_es: 'puedes tocar la frase de "Happy Birthday" completa a 60 BPM sin detenerte a buscar una nota.',
        practice: { type: 'pr', prompt: '<ol><li>Play the "Happy Birthday" phrase start to finish with no stops.</li><li>Start at 60 BPM and raise the metronome +5 at a time.</li><li>Log your fastest CLEAN run.</li></ol>',
          prompt_es: '<ol><li>Toca la frase de "Happy Birthday" de principio a fin sin detenerte.</li><li>Empieza a 60 BPM y sube el metrónomo de 5 en 5.</li><li>Anota tu pasada LIMPIA más rápida.</li></ol>',
          unit: 'BPM', placeholder: 'e.g. 70 — try for a higher number next session', placeholder_es: 'p. ej. 70 — intenta superarlo la próxima sesión' } },
      { id: 'm2w2-s6', text: 'Keep thumb behind the neck throughout',
        text_es: 'Mantener el pulgar detrás del mástil todo el tiempo',
        gotItWhen: 'your thumb stays roughly behind your middle finger on the back of the neck — not hooked over the top.',
        gotItWhen_es: 'tu pulgar se queda más o menos detrás de tu dedo medio en la parte de atrás del mástil — no enganchado por encima.',
        practice: { type: 'mc', prompt: 'While you\'re fretting notes, where should your thumb be?',
          prompt_es: 'Mientras trasteas notas, ¿dónde debe estar tu pulgar?',
          choices: ['Hooked over the top of the neck', 'Pressed flat along the side of the fretboard', 'On the back of the neck, roughly behind your middle finger', 'Anywhere — the thumb doesn\'t affect your fingers'],
          choices_es: ['Enganchado por encima del mástil', 'Presionado plano contra el costado del diapasón', 'En la parte de atrás del mástil, más o menos detrás de tu dedo medio', 'En cualquier lugar — el pulgar no afecta a tus dedos'], answer: 2,
          explain: 'A thumb behind the neck lets your fingers arch and stretch. Hooking it over the top locks your hand and flattens your fingers onto neighboring strings.',
          explain_es: 'Un pulgar detrás del mástil deja que tus dedos se arqueen y se estiren. Engancharlo por encima bloquea tu mano y aplana los dedos sobre las cuerdas vecinas.' } }
    ]
  }

); // end module-2.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[2] = [
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Play bass-note riff on low E string from memory', meta_es: 'Toca de memoria el riff de notas graves en la cuerda Mi grave', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'E string TAB — great first riff', meta_es: 'TAB en la cuerda Mi — un gran primer riff', type: 'Core', core: true, journeyUrl: 'tabs/seven-nation-army.html',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: 'Listen ahead — our Latin core song; you play its bass roots this module', meta_es: 'Escucha con anticipación — nuestra canción principal en español; tocas sus notas graves este módulo', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Play verse bass roots on E & A strings', meta_es: 'Toca las notas graves del verso en las cuerdas Mi y La', type: 'Core', core: true, journeyUrl: 'tabs/sweet-child-o-mine.html',
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0ASVeXINKYM' },
      { name: '"the cure" — Olivia Rodrigo', meta: 'Play the bassline as single-note roots (A C D F G)', meta_es: 'Toca la línea de bajo como notas individuales (A C D F G)', type: 'Core', core: true, journeyUrl: 'tabs/the-cure.html',
        originalUrl: 'https://www.youtube.com/watch?v=B402rKl4bUg',
        tutorialUrl: 'https://www.youtube.com/watch?v=adW_zSkClaY' },
      { name: '"Happy Birthday"', meta: 'Play full melody on E & A strings from TAB', meta_es: 'Toca la melodía completa en las cuerdas Mi y La usando el TAB', type: 'Supp', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Smoke on the Water" — Deep Purple', meta: 'E string TAB — iconic beginner riff', meta_es: 'TAB en la cuerda Mi — un riff icónico para principiantes', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=Q2FzZSBD5LE',
        tutorialUrl: 'https://www.youtube.com/watch?v=QkT5yLP5VQA' },
      { name: '"La Bamba" — Ritchie Valens', meta: 'Iconic single-note intro riff · C–F–G roots', meta_es: 'Riff de intro icónico con notas individuales · notas graves C–F–G', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=BycLmWI97Nc',
        tutorialUrl: 'https://www.youtube.com/watch?v=o-SdTXIAvTE' },
      { name: '"Come As You Are" — Nirvana', meta: 'Partial riff on A string', meta_es: 'Riff parcial en la cuerda La', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=vabnZ9-ex7o',
        tutorialUrl: 'https://www.youtube.com/watch?v=G14kHAijVHM' },
      { name: '"Crazy Train" — Ozzy Osbourne', meta: 'Intro notes on E string', meta_es: 'Notas de la intro en la cuerda Mi', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=FVovq9TGBw0',
        tutorialUrl: 'https://www.youtube.com/watch?v=JoL3YrtcwuQ' },
      { name: '"Beat It" — Michael Jackson', meta: 'Intro riff on E string', meta_es: 'Riff de la intro en la cuerda Mi', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=oRdxUFDoQe0',
        tutorialUrl: 'https://www.youtube.com/watch?v=B5M5tVc7XZA' }
    ];

MODULE_REVIEWS[2] = {
  moduleNum: 2,
  module: 'Notes on the E & A Strings',
  module_es: 'Notas en las cuerdas Mi y La',
  skills: [
    { id: 'mr2-s1', text: 'I can recite the musical alphabet (A–G) from memory, including what comes after G', text_es: 'Puedo recitar el alfabeto musical (A–G) de memoria, incluyendo lo que viene después de G', set: 'm2w1' },
    { id: 'mr2-s2', text: 'I can name all natural notes on the E string (frets 0–12)', text_es: 'Puedo nombrar todas las notas naturales en la cuerda Mi (trastes 0–12)', set: 'm2w1' },
    { id: 'mr2-s3', text: 'I can name all natural notes on the A string (frets 0–12)', text_es: 'Puedo nombrar todas las notas naturales en la cuerda La (trastes 0–12)', set: 'm2w1' },
    { id: 'mr2-s4', text: 'I can press notes cleanly with no fret buzz', text_es: 'Puedo presionar notas limpias sin zumbido', set: 'm2w2' },
    { id: 'mr2-s6', text: 'I can use one finger per fret (index=1, middle=2, ring=3, pinky=4)', text_es: 'Puedo usar un dedo por traste (índice=1, medio=2, anular=3, meñique=4)', set: 'm2w2' },
    { id: 'mr2-s5', text: 'I can read a basic TAB and play a 4-bar melody in time at 60 BPM', text_es: 'Puedo leer un TAB básico y tocar una melodía de 4 compases a tiempo a 60 BPM', set: 'm2w2' }
  ],
  assessItems: [
    'Name the notes on the E and A strings from memory through fret 12',
    'Play "All Along the Watchtower" bass-note line using only the E string — or the single-note root line from "the cure" — from memory, to the metronome at 60 BPM without stopping, with clean tone and correct fingering (one finger per fret, thumb behind the neck)',
    'Sight-read a short 2-bar bass line from TAB and play it'
  ],
  assessItems_es: [
    'Nombrar las notas en las cuerdas Mi y La de memoria hasta el traste 12',
    'Tocar la línea de bajo de "All Along the Watchtower" usando solo la cuerda Mi grave — o la línea alterna de raíces de una sola nota de "the cure" — de memoria, con el metrónomo a 60 BPM sin detenerse, con tono limpio y digitación correcta (un dedo por traste, pulgar detrás del mástil)',
    'Leer a primera vista una línea corta de bajo de 2 compases desde el TAB y tocarla'
  ],
  forward: 'The E &amp; A notes you just learned become the <strong>roots of every power chord in Module 3</strong> — when you play an A5 or G5, you\'re landing on the exact frets you just memorized. Knowing the fretboard is what lets you move chords around freely.',
  forward_es: 'Las notas de Mi y La que acabas de aprender se convierten en las <strong>raíces de todos los acordes de potencia del Módulo 3</strong> — cuando tocas un A5 o un G5, estás cayendo exactamente en los trastes que acabas de memorizar. Conocer el diapasón es lo que te permite mover los acordes con libertad.',
  standards: ['Pr.4a', 'Pr.5a', 'Pr.6a', 'Re.7a']
};
