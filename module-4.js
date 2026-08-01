// ============================================================
//  MODULE 4 — Major / Minor / Blues Pentatonic Scales
//  Edit this file to change Module 4 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm4w1',
    songThread: [{ name: '"Seven Nation Army"', journey: 'tabs/seven-nation-army.html', layer: 4, note: 'solo over the riff' }, { name: '"All Along the Watchtower"', journey: 'tabs/all-along-the-watchtower.html', layer: 4, note: 'improvise over its backing track' }, { name: '"Luna"', journey: 'tabs/luna.html', layer: 4, note: 'Dm pentatonic in its highest box' }],
    label: 'Set 1',
    locked: false,
    module: 'Major / Minor / Blues Pentatonic Scales',
    moduleNum: 4,
    unit: 'Module 4 · Major / Minor / Blues Pentatonic Scales',
    unit_es: 'Módulo 4 · Escalas pentatónicas mayor, menor y de blues',
    title: 'Set 1',
    subtitle: 'Pentatonic Pattern 1 · Major & minor positioning · Improvising on E & A strings',
    subtitle_es: 'Patrón pentatónico 1 · Posicionamiento mayor y menor · Improvisar en las cuerdas Mi y La',
    skillFocus: 'Playing Pentatonic Pattern 1 · Positioning it for major and minor keys · Improvising with the scale',
    skillFocus_es: 'Tocar el Patrón pentatónico 1 · Posicionarlo para tonalidades mayores y menores · Improvisar con la escala',
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
            label: 'Watch: minor pentatonic scale', label_es: 'Mira: pentatónica menor',
            text: 'Watch: <a href="https://www.youtube.com/watch?v=l6ayje1ug_0" target="_blank">The Minor Pentatonic Scale on Guitar Explained – Lauren Bateman (0:00–5:00)</a>. As you watch, follow along on your guitar — pause and find each note BEFORE she names it.',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=l6ayje1ug_0" target="_blank">The Minor Pentatonic Scale on Guitar Explained – Lauren Bateman (0:00–5:00)</a>. Mientras miras, sigue el ritmo en tu guitarra — pausa y encuentra cada nota ANTES de que ella la nombre.',
            hint: 'Follow along on your guitar as she shows the pattern. Pause and find each note before she names it.',
            hint_es: 'Sigue el ritmo en tu guitarra mientras ella muestra el patrón. Pausa y encuentra cada nota antes de que ella la nombre.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'For A minor pentatonic Pattern 1, where does your 1st finger sit on the low E string?',
              prompt_es: 'Para el Patrón pentatónico 1 de A menor, ¿dónde se coloca tu dedo índice en la cuerda Mi grave?',
              answer: 0,
              explain: 'The root A is at fret 5 on the low E, and in minor pentatonic Pattern 1 your 1st finger plays the root — so 5th fret.',
              explain_es: 'La raíz A está en el traste 5 de la Mi grave, y en el Patrón pentatónico 1 menor tu dedo índice toca la raíz — así que el traste 5.',
              choices: [
              '5th fret',
              '3rd fret',
              'The open string',
              '7th fret'
            ],
              choices_es: [
              'Traste 5',
              'Traste 3',
              'La cuerda al aire',
              'Traste 7'
            ] }
          },
          {
            // Reviewed by Jonathan 2026-07-11: fits Set 1; start at 1:45 (the link jumps there — the intro before is skippable).
            label: 'Watch: major pentatonic scale', label_es: 'Mira: pentatónica mayor',
            text: 'Watch: <a href="https://youtu.be/m_IiyJu60-c?t=105" target="_blank">Major Pentatonic Scale – Marty Music</a> (the link jumps to 1:45, where the lesson starts — watch to about 4:00). As you watch:<ol><li>Find the root note on your own neck.</li><li>Play the shape up once before answering below.</li></ol>',
            text_es: 'Mira: <a href="https://youtu.be/m_IiyJu60-c?t=105" target="_blank">Major Pentatonic Scale – Marty Music</a> (el enlace salta a 1:45, donde empieza la lección — mira hasta cerca de 4:00). Mientras miras:<ol><li>Encuentra la nota raíz en tu propio mástil.</li><li>Toca la forma una vez antes de responder abajo.</li></ol>',
            hint: 'Focus on the Pattern 1 shape — how does it sit on the neck? Notice where the root note is.',
            hint_es: 'Concéntrate en la forma del Patrón 1 — ¿cómo se ubica en el mástil? Fíjate en dónde está la nota raíz.',
            skills: [1, 4],
            response: { type: 'short', placeholder: 'Describe the Pattern 1 shape. Where is the root note?',
              placeholder_es: 'Describe la forma del Patrón 1. ¿Dónde está la nota raíz?' }
          }
            ]
          },
          {
            title: 'Position the pattern yourself',
            title_es: 'Posiciona el patrón tú mismo',
            steps: [
          {
            label: 'Position Pattern 1 as C major', label_es: 'Posiciona el Patrón 1 en C mayor',
            text: 'Try positioning Pattern 1 as C major pentatonic:<ol><li>Place your 4th finger on the 8th fret of string 6 (the note C).</li><li>Play the pattern up and down slowly.</li><li>Click "Hear C major pentatonic" below to check your ear against it.</li></ol>',
            text_es: 'Intenta posicionar el Patrón 1 como C mayor pentatónica:<ol><li>Coloca tu dedo meñique (4º) en el traste 8 de la cuerda 6 (la nota C).</li><li>Toca el patrón hacia arriba y hacia abajo despacio.</li><li>Presiona "Escucha C mayor pentatónica" abajo para comprobarlo con tu oído.</li></ol>',
            hint: 'The pattern shape never changes between major and minor — the only thing that changes is which finger owns the root note. Once you know that, you can slide the same shape to any key without relearning it.',
            hint_es: 'La forma del patrón nunca cambia entre mayor y menor — lo único que cambia es qué dedo se queda con la nota raíz. Una vez que lo sabes, puedes deslizar la misma forma a cualquier tonalidad sin volver a aprenderla.',
            skills: [3, 4],
            playSeq: { label: 'Hear C major pentatonic', label_es: 'Escucha C mayor pentatónica', bpm: 60, notes: [48, 50, 52, 55, 57, 60] },
            response: { type: 'mc', prompt: 'You slide Pattern 1 along the neck to play G MAJOR pentatonic instead of C. Which finger lands on the root note now?',
              prompt_es: 'Deslizas el Patrón 1 por el mástil para tocar G MAYOR pentatónica en vez de C. ¿Qué dedo cae ahora en la nota raíz?',
              answer: 0,
              explain: 'The finger doesn\'t change with the key — only with major vs minor. In MAJOR pentatonic your 4th finger (pinky) sits on the root wherever you move the shape; in minor it\'s the 1st finger.',
              explain_es: 'El dedo no cambia con la tonalidad — solo cambia entre mayor y menor. En la pentatónica MAYOR tu dedo 4º (meñique) se coloca en la raíz donde sea que muevas la forma; en la menor es el dedo 1º (índice).',
              choices: [
              '4th finger (pinky)',
              '1st finger (index)',
              '2nd finger (middle)',
              'It does not matter which finger'
            ],
              choices_es: [
              'Dedo 4º (meñique)',
              'Dedo 1º (índice)',
              'Dedo 2º (medio)',
              'No importa qué dedo'
            ] }
          }
            ]
          },
          {
            title: 'Listen — major vs minor moods',
            title_es: 'Escucha — estados de ánimo mayor vs menor',
            steps: [
          {
            label: 'Listen: major vs. minor moods', label_es: 'Escucha: ánimo mayor vs. menor',
            text: 'Match the mood — scale choice changes the feel. Listen to two short solos:<ul><li><a href="https://www.youtube.com/watch?v=BycLmWI97Nc" target="_blank" data-ext="1">Clip 1 — "La Bamba"</a> (major pentatonic).</li><li><a href="https://www.youtube.com/watch?v=kpC69qIe02E" target="_blank" data-ext="1">Clip 2 — "The Thrill Is Gone"</a> (minor / blues).</li></ul>Notice how the major-pentatonic solo sounds brighter and happier, while the minor / blues solo sounds darker and moodier.',
            text_es: 'Iguala el estado de ánimo — la elección de escala cambia la sensación. Escucha dos solos cortos:<ul><li><a href="https://www.youtube.com/watch?v=BycLmWI97Nc" target="_blank" data-ext="1">Clip 1 — "La Bamba"</a> (pentatónica mayor).</li><li><a href="https://www.youtube.com/watch?v=kpC69qIe02E" target="_blank" data-ext="1">Clip 2 — "The Thrill Is Gone"</a> (menor / blues).</li></ul>Fíjate en cómo el solo con pentatónica mayor suena más brillante y alegre, mientras que el solo menor / blues suena más oscuro y melancólico.',
            hint: 'Major pentatonic = brighter, sunnier. Minor / blues = darker, sadder, more "bluesy." Same instrument — the scale choice sets the mood.',
            hint_es: 'Pentatónica mayor = más brillante, más soleada. Menor / blues = más oscura, más triste, más "bluesera." Mismo instrumento — la escala elegida define el ánimo.',
            response: { type: 'mc', prompt: 'Which solo sounds darker / more "blues"?',
              prompt_es: '¿Qué solo suena más oscuro / más "blues"?',
              answer: 1,
              explain: 'Clip 2 ("The Thrill Is Gone") uses the minor / blues scale — darker and moodier. Clip 1 ("La Bamba") is major pentatonic — brighter and sunnier.',
              explain_es: 'El Clip 2 ("The Thrill Is Gone") usa la escala menor / blues — más oscura y melancólica. El Clip 1 ("La Bamba") es pentatónica mayor — más brillante y alegre.',
              choices: [
              'Clip 1 (major pentatonic)',
              'Clip 2 (minor / blues)',
              'No difference'
            ],
              choices_es: [
              'Clip 1 (pentatónica mayor)',
              'Clip 2 (menor / blues)',
              'Sin diferencia'
            ] }
          },
          {
            label: 'Name the mood of each clip', label_es: 'Nombra el ánimo de cada clip',
            text: 'In one word each, name the mood you heard in the two clips above.',
            text_es: 'En una palabra cada uno, nombra el estado de ánimo que escuchaste en los dos clips de arriba.',
            hint: 'There\'s no wrong answer — trust your ear. Words like "bright," "happy," "dark," "sad," or "moody" all work.',
            hint_es: 'No hay respuesta incorrecta — confía en tu oído. Palabras como "brillante," "alegre," "oscuro," "triste," o "melancólico" funcionan todas.',
            response: { type: 'short', prompt: 'In one word, describe the mood of each clip.', prompt_es: 'En una palabra, describe el estado de ánimo de cada clip.', placeholder: 'Clip 1: ____   ·   Clip 2: ____', placeholder_es: 'Clip 1: ____   ·   Clip 2: ____' }
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
          {
            label: 'Wrap-up: the finger or the sound?', label_es: 'Cierre: ¿el dedo o el sonido?',
            text: 'Station Wrap-Up — pause and think: when you positioned Pattern 1 today, what told you whether you were set up for MAJOR or MINOR — the finger on the root, or the sound? Which felt more reliable?',
            text_es: 'Cierre de la estación — pausa y piensa: cuando posicionaste el Patrón 1 hoy, ¿qué te decía si estabas listo para MAYOR o para MENOR — el dedo en la raíz, o el sonido? ¿Cuál se sintió más confiable?',
            response: { type: 'short', placeholder: 'e.g. I trusted the finger (4th = major, 1st = minor) more than my ear so far',
              placeholder_es: 'p. ej. confié más en el dedo (4º = mayor, 1º = menor) que en mi oído hasta ahora' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — pattern drill & first improvisation',
        title_es: 'Estación de práctica — ejercicio del patrón y primera improvisación',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Tune all 6 strings', label_es: 'Afina las 6 cuerdas',
                text: 'Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                hint: 'Tuning (Module 1) is a skill you keep forever. As you climb the pentatonic pattern today, keep naming the notes too — that\'s your Module 2 fretboard map in action.',
                hint_es: 'Afinar (Módulo 1) es una destreza que conservas para siempre. Mientras subes por el patrón pentatónico hoy, sigue nombrando las notas también — es tu mapa del diapasón del Módulo 2 en acción.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Play Pattern 1 with alternate picking',
            title_es: 'Toca el Patrón 1 con púa alterna',
            steps: [
          {
            label: 'Challenge 1 — Pattern 1 Climb (skills-check warm-up)', label_es: 'Reto 1 — Subida del Patrón 1 (calentamiento de revisión de destrezas)',
            text: '<ul><li>Play Pentatonic Pattern 1 ascending at 60 BPM, one note per beat, alternate picking (down-up-down-up).</li></ul>You\'ve got it when: every note rings clean with no missed picks. The box below shows where every finger goes; click "Play all" to hear it, and the next challenge maps the same climb note by note in TAB.<span class="step-figure"><img src="img/m4-pentatonic-box1-en.svg" alt="Fretboard diagram of A minor pentatonic Pattern 1, frets 5 to 8: finger 1 on fret 5 of every string, finger 4 on fret 8 of the low E, B, and high e strings, and finger 3 on fret 7 of the A, D, and G strings. The root note A is marked solid at fret 5 on the low E and high e strings and at fret 7 on the D string."></span>',
            text_es: '<ul><li>Toca el Patrón pentatónico 1 subiendo a 60 BPM, una nota por tiempo, con púa alterna (abajo-arriba-abajo-arriba).</li></ul>Lo tienes cuando: cada nota suena limpia sin púas falladas. La caja de abajo muestra dónde va cada dedo; presiona "Tocar todo" para escucharlo, y el siguiente reto mapea la misma subida nota por nota en TAB.<span class="step-figure"><img src="img/m4-pentatonic-box1-es.svg" alt="Diagrama del diapasón del Patrón 1 de A menor pentatónica, trastes 5 a 8: el dedo 1 en el traste 5 de todas las cuerdas, el dedo 4 en el traste 8 de las cuerdas Mi grave, Si y mi aguda, y el dedo 3 en el traste 7 de las cuerdas La, Re y Sol. La nota raíz A está marcada en sólido en el traste 5 de la Mi grave y la mi aguda, y en el traste 7 de la cuerda Re."></span>',
            hint: 'This is a warm-up drill — the module assessment is your own 4-bar solo (you\'ll compose it in Set 3), held to the backing track\'s pulse — but this climb is the benchmark lap (a lap = one full time through) for your Set 1 check-off. Go as slow as you need. Every note should ring cleanly. Instead of note names, say each note\'s SCALE DEGREE aloud as you climb — 1, ♭3, 4, 5, ♭7, then 1 again an octave up, and around again. The degrees work on every string, including the ones whose note names you haven\'t met yet (D and G come later this module). Set the ⏱ Timer for 2 minutes and loop it.',
            hint_es: 'Este es un ejercicio de calentamiento — la evaluación del módulo es tu propio solo de 4 compases (lo compondrás en la Unidad 3), sostenido al pulso de la pista de acompañamiento — pero esta subida es la vuelta de referencia (una vuelta = un recorrido completo) para tu verificación de la Unidad 1. Ve tan despacio como necesites. Cada nota debe sonar limpia. En vez de los nombres de las notas, di en voz alta el GRADO de la escala de cada nota mientras subes — 1, ♭3, 4, 5, ♭7, y luego 1 otra vez una octava más arriba, y de nuevo. Los grados funcionan en todas las cuerdas, incluidas aquellas cuyos nombres de nota todavía no conoces (Re y Sol vienen más adelante en este módulo). Pon el ⏱ Temporizador en 2 minutos y repítelo.',
            stuck: 'Drop to the lowest two strings only (E and A) and climb just those until they\'re clean, then add the rest one string at a time.',
            stuck_es: 'Baja a solo las dos cuerdas más graves (Mi y La) y sube solo esas hasta que estén limpias, y luego agrega el resto una cuerda a la vez.',
            levelUp: 'Play it descending too (top to bottom), or raise the metronome to 80 BPM and keep the picking strictly down-up.',
            levelUp_es: 'Tócalo también bajando (de arriba a abajo), o sube el metrónomo a 80 BPM y mantén la púa estrictamente abajo-arriba.',
            skills: [1, 2, 5],
            playSeq: { label: 'Play all', label_es: 'Tocar todo', bpm: 60, notes: [45, 48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72] },
            response: { type: 'short', prompt: 'Personal record: play it cleanly at 60 BPM, then raise the metronome +10 at a time. Your fastest CLEAN climb today (BPM)?', prompt_es: 'Récord personal: tócalo limpio a 60 BPM, y luego sube el metrónomo de 10 en 10. ¿Tu subida LIMPIA más rápida hoy (BPM)?', placeholder: 'e.g. 80 — try for a higher number next session', placeholder_es: 'p. ej. 80 — intenta superarlo la próxima sesión' }
          }
            ]
          },
          {
            title: 'Position Pattern 1 for major & minor',
            title_es: 'Posiciona el Patrón 1 para mayor y menor',
            steps: [
          {
            label: 'Challenge 2 — Move the Box: A Minor to E Minor', label_es: 'Reto 2 — Mueve la caja: de A menor a E menor',
            text: 'A box = the block of frets where a scale pattern sits.<ol><li>Play Pattern 1 as A minor pentatonic (1st finger, 5th fret, string 6) up and down using the TAB map.</li><li>Then shift it to E minor pentatonic (open-string root).</li></ol>You\'ve got it when: both positions clean — same shape, two spots on the neck.<span class="step-figure"><img src="img/m4-pentatonic-box1-en.svg" alt="Fretboard diagram of A minor pentatonic Pattern 1, frets 5 to 8: finger 1 on fret 5 of every string, finger 4 on fret 8 of the low E, B, and high e strings, and finger 3 on fret 7 of the A, D, and G strings. The root note A is marked solid at fret 5 on the low E and high e strings and at fret 7 on the D string."></span>',
            text_es: 'Una caja = el bloque de trastes donde se ubica un patrón de escala.<ol><li>Toca el Patrón 1 como A menor pentatónica (dedo índice, traste 5, cuerda 6) subiendo y bajando usando el mapa de TAB.</li><li>Luego cámbialo a E menor pentatónica (raíz en cuerda al aire).</li></ol>Lo tienes cuando: ambas posiciones limpias — misma forma, dos lugares en el mástil.<span class="step-figure"><img src="img/m4-pentatonic-box1-es.svg" alt="Diagrama del diapasón del Patrón 1 de A menor pentatónica, trastes 5 a 8: el dedo 1 en el traste 5 de todas las cuerdas, el dedo 4 en el traste 8 de las cuerdas Mi grave, Si y mi aguda, y el dedo 3 en el traste 7 de las cuerdas La, Re y Sol. La nota raíz A está marcada en sólido en el traste 5 de la Mi grave y la mi aguda, y en el traste 7 de la cuerda Re."></span>',
            hint: 'A minor: your hand sits around frets 5–8. E minor: the open strings do your 1st finger\'s job, and your other fingers play frets 2 and 3.',
            hint_es: 'A menor: tu mano se ubica alrededor de los trastes 5–8. E menor: las cuerdas al aire hacen el trabajo de tu dedo índice, y tus otros dedos tocan los trastes 2 y 3.',
            stuck: 'Stay on A minor only until the shape is automatic, then slide the whole hand down to find E minor — it\'s the exact same finger pattern, just moved.',
            stuck_es: 'Quédate solo con A menor hasta que la forma sea automática, y luego desliza toda la mano hacia abajo para encontrar E menor — es exactamente el mismo patrón de dedos, solo movido.',
            levelUp: 'Position it a third place — G minor (3rd fret root) — or call out the root note name before you start each box.',
            levelUp_es: 'Posiciónalo en un tercer lugar — G menor (raíz en traste 3) — o di en voz alta el nombre de la nota raíz antes de empezar cada caja.',
            skills: [3, 4],
            tab: {
              caption: 'A minor pentatonic Pattern 1 · ascending across all 6 strings',
              caption_es: 'Patrón pentatónico 1 de A menor · subiendo por las 6 cuerdas',
              notes: [
                { string: 'E', fret: 5, note: 'A', midi: 45 },
                { string: 'E', fret: 8, note: 'C', midi: 48 },
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'A', fret: 7, note: 'E', midi: 52 },
                { string: 'D', fret: 5, note: 'G', midi: 55 },
                { string: 'D', fret: 7, note: 'A', midi: 57 },
                { string: 'G', fret: 5, note: 'C', midi: 60 },
                { string: 'G', fret: 7, note: 'D', midi: 62 },
                { string: 'B', fret: 5, note: 'E', midi: 64 },
                { string: 'B', fret: 8, note: 'G', midi: 67 },
                { string: 'e', fret: 5, note: 'A', midi: 69 },
                { string: 'e', fret: 8, note: 'C', midi: 72 }
              ]
            }
          }
            ]
          },
          {
            title: 'Improvise your first solo',
            title_es: 'Improvisa tu primer solo',
            steps: [
          {
            label: 'Challenge 3 — Rule of 3 (try it!)', label_es: 'Reto 3 — Regla de 3 (¡pruébalo!)',
            text: '<ol><li>Improvise using ONLY 3 notes of Pattern 1 for 4 bars over the Am backing track — <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; Am jam track</a>.</li><li>Once those 3 feel comfortable, add a 4th note and play 4 more bars.</li></ol>No score — aim for short, intentional ideas with space between them.',
            text_es: '<ol><li>Improvisa usando SOLO 3 notas del Patrón 1 durante 4 compases sobre la pista de acompañamiento de Am — <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; pista de jam en Am</a>.</li><li>Una vez que esas 3 se sientan cómodas, agrega una 4ª nota y toca 4 compases más.</li></ol>Sin puntaje — apunta a ideas cortas e intencionadas con espacio entre ellas.',
            hint: 'Limiting yourself to 3 notes forces you to make music with phrasing and rhythm, not note-count. A short, clear idea with silence around it is better than a stream of notes.',
            hint_es: 'Limitarte a 3 notas te obliga a hacer música con frases y ritmo, no con cantidad de notas. Una idea corta y clara con silencio alrededor es mejor que un torrente de notas.',
            stuck: 'Pick just 2 notes on one string and trade them back and forth, changing only the rhythm — that\'s already improvising.',
            stuck_es: 'Elige solo 2 notas en una cuerda e intercámbialas, cambiando solo el ritmo — eso ya es improvisar.',
            levelUp: 'Add a 4th and 5th note, or end every phrase on the root (A) so each idea "arrives home" (home = the note the music rests on and sounds finished).',
            levelUp_es: 'Agrega una 4ª y 5ª nota, o termina cada frase en la raíz (A) para que cada idea "llegue a la nota base" (nota base = la nota donde descansa la música y suena terminada).',
            skills: [6]
          },
          {
            label: 'Challenge 4 — The Four-Phrase Plan', label_es: 'Reto 4 — El plan de las cuatro frases',
            text: 'Use the SAME 3 notes from Rule of 3, but now shape a whole solo with four short phrases — about one bar each. Give each phrase a job:<ol><li><strong>Phrase 1 — say it</strong> (a tiny idea, 2–4 notes).</li><li><strong>Phrase 2 — repeat it</strong> (play that same idea again, maybe with one note changed).</li><li><strong>Phrase 3 — stretch it</strong> (take the idea higher, or keep the notes and change the rhythm).</li><li><strong>Phrase 4 — come home</strong> (end on the root, A, so the solo lands).</li></ol>Play it over the Am backing track — <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; Am jam track</a>. You\'ve got it when: four distinct phrases with space between them, and the last one lands on the root (A).',
            text_es: 'Usa las MISMAS 3 notas de la Regla de 3, pero ahora dale forma a un solo entero con cuatro frases cortas — más o menos un compás cada una. Dale un trabajo a cada frase:<ol><li><strong>Frase 1 — dila</strong> (una idea pequeña, 2–4 notas).</li><li><strong>Frase 2 — repítela</strong> (toca esa misma idea otra vez, tal vez con una nota cambiada).</li><li><strong>Frase 3 — estírala</strong> (lleva la idea más arriba, o mantén las notas y cambia el ritmo).</li><li><strong>Frase 4 — llega a la nota base</strong> (termina en la raíz, A, para que el solo aterrice).</li></ol>Tócalo sobre la pista de acompañamiento de Am — <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; pista de jam en Am</a>. Lo tienes cuando: cuatro frases distintas con espacio entre ellas, y la última aterriza en la raíz (A).',
            hint: 'Leave silence between the phrases — the space IS part of the plan. This is Rule of 3 with a road map. Say-it / repeat-it / stretch-it / come-home turns three notes into a story with a beginning, middle, and ending — instead of a random string of notes.',
            hint_es: 'Deja silencio entre las frases — el espacio SÍ es parte del plan. Esto es la Regla de 3 con un mapa de ruta. Decirla / repetirla / estirarla / llegar a la nota base convierte tres notas en una historia con principio, desarrollo y final — en vez de una serie aleatoria de notas.',
            stuck: 'Make Phrases 1 and 2 EXACTLY the same — note for note. Repeating an idea isn\'t cheating, it\'s how nearly every melody you know works. Your ear is waiting to hear it come back.',
            stuck_es: 'Haz que las Frases 1 y 2 sean EXACTAMENTE iguales — nota por nota. Repetir una idea no es hacer trampa, así funciona casi toda melodía que conoces. Tu oído está esperando escucharla regresar.',
            levelUp: 'Name the four jobs out loud — "say it… repeat it… stretch it… come home" — before you play each phrase, or run the whole plan over the Am backing track and hold the track\'s pulse start to finish.',
            levelUp_es: 'Nombra los cuatro trabajos en voz alta — "dila… repítela… estírala… llega a la nota base" — antes de tocar cada frase, o corre el plan completo sobre la pista de acompañamiento de Am y sostén el pulso de la pista de principio a fin.',
            skills: [6],
            response: { type: 'short', prompt: 'Describe your Phrase 1 "say it" idea in words — which notes, and its rhythm?', prompt_es: 'Describe con palabras tu idea de la Frase 1 "dila" — ¿qué notas, y qué ritmo?', placeholder: 'e.g. A then C, two quick notes', placeholder_es: 'p. ej. A y luego C, dos notas rápidas' }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — Solo over "Seven Nation Army"', label_es: 'Reto — Solo sobre "Seven Nation Army"',
                text: '<ol><li>Record yourself playing the A-string version of the "Seven Nation Army" riff (a riff = a short musical phrase that repeats) — the true-pitch one from Module 2, E · E · G · E · D · C · B — and loop the recording.</li><li>Improvise over it using ONLY these three notes — open low E, G (low E, fret 3), and open A — for four bars.</li></ol>You\'ve got it when: four bars of intentional phrases — not a stream of notes — that land back on E. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 4 of 5</a>.',
                text_es: '<ol><li>Grábate tocando la versión en la cuerda La del riff de "Seven Nation Army" (un riff = una frase musical corta que se repite) — la de tono real del Módulo 2, E · E · G · E · D · C · B — y repite la grabación en bucle.</li><li>Improvisa sobre ella usando SOLO estas tres notas — Mi grave al aire, G (cuerda Mi grave, traste 3), y La al aire — durante cuatro compases.</li></ol>Lo tienes cuando: cuatro compases de frases intencionadas — no un torrente de notas — que aterricen de vuelta en E. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 4 de 5</a>.',
                hint: 'Remember the Rule of 3: short ideas, with space between them. E is the note this song centers on, and your three notes come from E minor pentatonic — so they only fit the A-string version of the riff. The low-E version you learned first sounds lower than the record (it comes out in B minor), and these three notes will fight it.',
                hint_es: 'Recuerda la Regla de 3: ideas cortas, con espacio entre ellas. E es la nota en la que se centra esta canción, y tus tres notas vienen de la pentatónica de E menor — así que solo encajan con la versión en la cuerda La del riff. La versión en la cuerda Mi grave que aprendiste primero suena más grave que la grabación (sale en B menor), y estas tres notas van a chocar con ella.',
                stuck: 'Play just E and G, trading two-beat phrases with silence: play two beats, rest two beats.',
                stuck_es: 'Toca solo E y G, intercambiando frases de dos tiempos con silencio: toca dos tiempos, descansa dos tiempos.',
                levelUp: 'Add the open D string as a fourth note, or record the riff on a loop and trade fours with your recording (trade fours = play 4 bars, then let the recording play 4) — or with anyone at home who\'ll play it.',
                levelUp_es: 'Agrega la cuerda Re al aire como una cuarta nota, o graba el riff en un loop e intercambia de a cuatro con tu grabación (intercambiar de a cuatro = toca 4 compases, y luego deja que la grabación toque 4) — o con quien esté en casa y quiera tocarlo.',
                skills: [6],
                tab: {
                  caption: 'Your three allowed notes — E minor pentatonic, open position',
                  caption_es: 'Tus tres notas permitidas — E menor pentatónica, posición abierta',
                  notes: [
                    { string: 'E', fret: 0, note: 'E', midi: 40 },
                    { string: 'E', fret: 3, note: 'G', midi: 43 },
                    { string: 'A', fret: 0, note: 'A', midi: 45 }
                  ]
                },
                response: { type: 'short', prompt: 'Describe your best phrase in words — what made it feel finished?', prompt_es: 'Describe tu mejor frase con palabras — ¿qué la hizo sentir terminada?', placeholder: 'e.g. two quick notes then a long E', placeholder_es: 'p. ej. dos notas rápidas y luego una E larga' }
              },
              {
                label: 'Challenge — Solo over "Watchtower"', label_es: 'Reto — Solo sobre "Watchtower"',
                text: 'The song\'s loop is Am · G · F · G — and A minor pentatonic Pattern 1 (the box you just learned) fits every bar of it:<ol><li>Improvise four bars using only the three notes marked below.</li><li>Then improvise four more, adding a fourth note of your choice from Pattern 1.</li></ol>You\'ve got it when: eight bars where every phrase starts or ends on A. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 4 of 5</a>.',
                text_es: 'La vuelta de la canción es Am · G · F · G — y el Patrón pentatónico 1 de A menor (la caja que acabas de aprender) encaja en cada compás:<ol><li>Improvisa cuatro compases usando solo las tres notas marcadas abajo.</li><li>Luego improvisa cuatro más, agregando una cuarta nota de tu elección del Patrón 1.</li></ol>Lo tienes cuando: ocho compases donde cada frase empieza o termina en A. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 4 de 5</a>.',
                hint: 'This is the same box from your Pattern 1 drill — you\'re not learning anything new, you\'re USING it. That\'s the whole point of today.',
                hint_es: 'Esta es la misma caja de tu ejercicio del Patrón 1 — no estás aprendiendo nada nuevo, la estás USANDO. Ese es todo el punto de hoy.',
                stuck: 'Freeze the rhythm: only quarter notes, only the three marked notes, until an idea shows up on its own.',
                stuck_es: 'Congela el ritmo: solo negras, solo las tres notas marcadas, hasta que una idea aparezca por sí sola.',
                levelUp: 'Start a phrase during the F bar and resolve it on the Am bar — that\'s real tension and release.',
                levelUp_es: 'Empieza una frase durante el compás de F y resuélvela en el compás de Am — eso es tensión y resolución de verdad.',
                skills: [6],
                tab: {
                  caption: 'Your three starting notes — Am pentatonic Pattern 1 · 5th position',
                  caption_es: 'Tus tres notas iniciales — Patrón pentatónico 1 de Am · 5ª posición',
                  notes: [
                    { string: 'A', fret: 7, note: 'E', midi: 52 },
                    { string: 'D', fret: 5, note: 'G', midi: 55 },
                    { string: 'D', fret: 7, note: 'A', midi: 57 }
                  ]
                },
                response: { type: 'short', prompt: 'Which chord in the loop was easiest to solo over, and which fought you?', prompt_es: '¿Qué acorde de la vuelta fue el más fácil para improvisar, y cuál se te resistió?', placeholder: 'e.g. Am easy, F felt weird', placeholder_es: 'p. ej. Am fácil, F se sintió raro' }
              },
              {
                label: 'Challenge — "Watchtower", the real rhythm', label_es: 'Reto — "Watchtower", el ritmo real',
                text: '<ol><li>Listen to the recording.</li><li>Find the riff\'s TAB with rhythm stems (Songsterr shows them clearly).</li><li>Play it the way the record actually goes — each root held a full two beats, just as you played it back in Module 3.</li></ol>You\'ve got it when: you can loop A · G · F · G along with the record and stay locked with it. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: revisit Layer 2 of 5</a>.',
                text_es: '<ol><li>Escucha la grabación.</li><li>Busca el TAB del riff con plicas de ritmo (Songsterr las muestra claramente).</li><li>Tócalo como realmente suena en el disco — cada raíz sostenida dos tiempos completos, igual que la tocaste en el Módulo 3.</li></ol>Lo tienes cuando: puedes repetir A · G · F · G junto con la grabación y mantenerte sincronizado. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: vuelve a la Capa 2 de 5</a>.',
                hint: 'You already know this loop holds each root for two beats — you played it that way as power chords back in Module 3. What\'s new here is where the rhythm comes FROM: you read it off the TAB\'s rhythm stems instead of being told it, and you lock to the record instead of a metronome. A click waits for nobody but stays perfectly even; a record breathes, and you have to follow it.',
                hint_es: 'Ya sabes que esta vuelta sostiene cada raíz dos tiempos — la tocaste así como acordes de potencia en el Módulo 3. Lo nuevo aquí es DE DÓNDE viene el ritmo: lo lees en las plicas de ritmo del TAB en vez de que te lo digan, y te sincronizas con la grabación en vez de con un metrónomo. Un clic no espera a nadie pero se mantiene perfectamente parejo; una grabación respira, y tú tienes que seguirla.',
                stuck: 'Clap the record\'s rhythm first, no guitar — one clap per root, holding through the silence — then add the frets back once your hands know the shape of the timing.',
                stuck_es: 'Primero aplaude el ritmo de la grabación, sin guitarra — un aplauso por raíz, sosteniendo durante el silencio — y luego vuelve a agregar los trastes una vez que tus manos conozcan la forma del tiempo.',
                levelUp: 'Play it as power chords instead of single notes — same two-beat holds, fuller sound.',
                levelUp_es: 'Tócalo como acordes de potencia en vez de notas sueltas — los mismos dos tiempos sostenidos, un sonido más lleno.',
                playSeq: { label: 'Hear it — A · G · F · G roots, held two full beats each', label_es: 'Escúchalo — raíces A · G · F · G, sostenidas dos tiempos completos cada una', bpm: 60, notes: [{ midi: 45, beats: 2 }, { midi: 43, beats: 2 }, { midi: 41, beats: 2 }, { midi: 43, beats: 2 }] },
                response: { type: 'short', prompt: 'What did you notice, holding each root for two beats instead of one?', prompt_es: '¿Qué notaste al sostener cada raíz dos tiempos en vez de uno?', placeholder: 'e.g. it finally sounds like the song, not an exercise', placeholder_es: 'p. ej. por fin suena como la canción, no como un ejercicio' }
              },
              {
                label: 'Challenge — "Seven Nation Army", the real rhythm (by ear)', label_es: 'Reto — "Seven Nation Army", el ritmo real (de oído)',
                text: '<ol><li>Press the two &#x25B6; buttons below to hear the difference before you clap it.</li><li>Listen to the recording on repeat.</li><li>Clap the riff\'s rhythm with no guitar — some notes clipped short, some held longer — until it\'s in your hands.</li><li>Add the frets back once the feel is there.</li></ol>You\'ve got it when: you can loop the riff along with the record and stay locked with its groove. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Song Journey: revisit Layer 2 of 5</a>.',
                text_es: '<ol><li>Presiona los dos botones &#x25B6; de abajo para escuchar la diferencia antes de aplaudirlo.</li><li>Escucha la grabación una y otra vez.</li><li>Aplaude el ritmo del riff sin guitarra — algunas notas cortas, algunas sostenidas más — hasta que esté en tus manos.</li><li>Vuelve a agregar los trastes una vez que tengas la sensación.</li></ol>Lo tienes cuando: puedes repetir el riff junto con la grabación y mantenerte sincronizado con su groove (el groove = la sensación rítmica que te hace mover el cuerpo). <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Recorrido de la canción: vuelve a la Capa 2 de 5</a>.',
                hint: 'You\'ve played this riff since Module 1 as straight, even quarter notes — but the record swings it looser than that. For now, trust your ear: don\'t reach for counts or note values yet — this is ear training, the same way you learned to clap "Watchtower"\'s rhythm. Your ear already knows this riff; you\'re just teaching your hands to match it.',
                hint_es: 'Has tocado este riff desde el Módulo 1 como negras parejas y rectas — pero la grabación lo balancea más suelto que eso. Por ahora, confía en tu oído: no busques contar tiempos o valores de nota todavía — esto es entrenamiento de oído, igual que aprendiste a aplaudir el ritmo de "Watchtower". Tu oído ya conoce este riff; solo estás enseñándole a tus manos a igualarlo.',
                stuck: 'Clap just the first half of the riff (B · B · D · B) on loop until that half locks with the record, then add the second half (A · G · F#).',
                stuck_es: 'Aplaude solo la primera mitad del riff (B · B · D · B) en bucle hasta que esa mitad encaje con la grabación, y luego agrega la segunda mitad (A · G · F#).',
                levelUp: 'Play it as power chords instead of single notes, keeping the same swung feel — same trick as "Watchtower"\'s real-rhythm level-up.',
                levelUp_es: 'Tócalo como acordes de potencia en vez de notas sueltas, manteniendo la misma sensación de balanceo — el mismo truco que el nivel superior del ritmo real de "Watchtower".',
                tabs: [
                  {
                    title: 'How you learned it — straight teaching count',
                    title_es: 'Cómo lo aprendiste — conteo de enseñanza recto',
                    caption: '"Seven Nation Army" — main riff · Low E string · straight quarter notes',
                    caption_es: '"Seven Nation Army" — riff principal · cuerda Mi grave · negras rectas y parejas',
                    bpm: 60,
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
                  {
                    title: 'How the record\'s rhythm goes — low-E version',
                    title_es: 'Cómo va el ritmo de la grabación — versión en la Mi grave',
                    caption: '"Seven Nation Army" — main riff · Low E string · the record\'s real durations (close to the record\'s feel, not note-perfect). Same low-E frets as above, so it still sounds lower than the record — the A-string version from Module 2 is the true pitch.',
                    caption_es: '"Seven Nation Army" — riff principal · cuerda Mi grave · las duraciones reales de la grabación (cercano a la sensación de la grabación, no nota por nota). Los mismos trastes de la Mi grave que arriba, así que sigue sonando más grave que la grabación — la versión en la cuerda La del Módulo 2 es el tono real.',
                    bpm: 60,
                    maxBpm: 130,
                    notes: [
                      { string: 'E', fret: 7,  note: 'B',  midi: 47, beats: 1.5 },
                      { string: 'E', fret: 7,  note: 'B',  midi: 47, beats: 0.5 },
                      { string: 'E', fret: 10, note: 'D',  midi: 50, beats: 0.5 },
                      { string: 'E', fret: 7,  note: 'B',  midi: 47, beats: 0.5 },
                      { string: 'E', fret: 5,  note: 'A',  midi: 45, beats: 0.5 },
                      { string: 'E', fret: 3,  note: 'G',  midi: 43, beats: 2 },
                      { string: 'E', fret: 2,  note: 'F#', midi: 42, beats: 2.5 }
                    ]
                  }
                ],
                response: { type: 'short', prompt: 'What\'s different about the riff\'s real rhythm compared to how you first learned it?', prompt_es: '¿Qué es diferente en el ritmo real del riff comparado con cómo lo aprendiste primero?', placeholder: 'e.g. the first two B\'s aren\'t evenly spaced', placeholder_es: 'p. ej. las primeras dos B no están parejas' }
              },
              {
                label: 'Challenge — Solo over "Luna"', label_es: 'Reto — Solo sobre "Luna"',
                text: 'Your box is D minor pentatonic Pattern 1 — root D, low E fret 10. Jam over <a href="https://www.youtube.com/watch?v=wBxFnX_V9mQ&t=84" target="_blank">▶ &#x1F3B5; a slow Dm practice jam (Luna\'s solo key)</a>:<ol><li>Improvise four bars using only the three notes marked below.</li><li>Improvise four more, adding a fourth note from the box.</li></ol>You\'ve got it when: eight bars where every phrase starts or ends on D. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 4 of 5</a>.',
                text_es: 'Tu caja es el Patrón pentatónico 1 de D menor — raíz D, cuerda Mi grave traste 10. Toca sobre <a href="https://www.youtube.com/watch?v=wBxFnX_V9mQ&t=84" target="_blank">▶ &#x1F3B5; una pista de jam lenta en D menor (la tonalidad del solo de Luna)</a>:<ol><li>Improvisa cuatro compases usando solo las tres notas marcadas abajo.</li><li>Improvisa cuatro más, agregando una cuarta nota de la caja.</li></ol>Lo tienes cuando: ocho compases donde cada frase empieza o termina en D. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 4 de 5</a>.',
                hint: '"Luna" lives in F major, and F\'s relative minor is D — that\'s why D minor pentatonic is your box here. Same Pattern 1 shape you\'ve been drilling — just at fret 10, the highest position you\'ve played so far. This high up, the frets sit closer together, so the stretch is easier than it looks.',
                hint_es: '"Luna" vive en F mayor, y la relativa menor de F es D — por eso la pentatónica de D menor es tu caja aquí. La misma forma del Patrón 1 que has estado ejercitando — solo que en el traste 10, la posición más alta que has tocado hasta ahora. Tan arriba, los trastes están más juntos, así que el estiramiento es más fácil de lo que parece.',
                stuck: 'Trade just D and F (frets 10 and 13 on the low E) back and forth, changing only the rhythm, until an idea appears.',
                stuck_es: 'Intercambia solo D y F (trastes 10 y 13 en la Mi grave), cambiando solo el ritmo, hasta que aparezca una idea.',
                levelUp: 'End every phrase on D so each idea arrives home — or hold the F (fret 13) a little longer for a sadder, longing feel.',
                levelUp_es: 'Termina cada frase en D para que cada idea llegue a la nota base — o sostén el F (traste 13) un poco más para una sensación más triste y anhelante.',
                skills: [6],
                tab: {
                  caption: 'Your three starting notes — D minor pentatonic Pattern 1 · 10th position',
                  caption_es: 'Tus tres notas iniciales — Patrón pentatónico 1 de D menor · 10ª posición',
                  notes: [
                    { string: 'E', fret: 10, note: 'D', midi: 50 },
                    { string: 'E', fret: 13, note: 'F', midi: 53 },
                    { string: 'A', fret: 10, note: 'G', midi: 55 }
                  ]
                },
                response: { type: 'short', prompt: 'Which note felt like "home" over the Dm track, and did your phrases land there?', prompt_es: '¿Qué nota se sintió como "nota base" sobre la pista de Dm, y tus frases aterrizaron ahí?', placeholder: 'e.g. D at fret 10 — landed there most times', placeholder_es: 'p. ej. D en el traste 10 — aterricé ahí la mayoría de las veces' }
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
                label: 'Wrap-up: what felt harder?', label_es: 'Cierre: ¿qué fue más difícil?',
                text: 'Which felt harder today — playing the pattern cleanly, or making music with only 3 notes? Write it below — that\'s your warm-up target next time.',
                text_es: '¿Qué se sintió más difícil hoy — tocar el patrón limpio, o hacer música con solo 3 notas? Escríbelo abajo — ese es tu objetivo de calentamiento la próxima vez.',
                response: { type: 'short', placeholder: 'e.g. the pattern is clean; making 3 notes sound intentional is the hard part',
                  placeholder_es: 'p. ej. el patrón sale limpio; hacer que 3 notas suenen intencionadas es la parte difícil' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Plays minor pentatonic ascending and descending · Plays major pentatonic on E & A strings · Uses alternate picking · Improvises a 4-bar phrase over a backing track · Identifies minor vs major pentatonic by ear',
      goal_es: 'Toca la pentatónica menor subiendo y bajando · Toca la pentatónica mayor en las cuerdas Mi y La · Usa púa alterna · Improvisa una frase de 4 compases sobre una pista de acompañamiento · Identifica pentatónica menor vs mayor de oído',
      performance: 'Solo: record yourself improvising 4 bars over an Am backing track — either "All Along the Watchtower" or "the cure" ▶ &#x1F3B5; Backing track button in the &#x1F3B5; Songs list at the bottom of Module 4 (both are in Am) — then listen back. Goal is one clear phrase, not speed.',
      selfCheck: 'Can you play Pattern 1 up and down without stopping? Can you position it for both Am and Em pentatonic?',
      selfCheck_es: '¿Puedes tocar el Patrón 1 subiendo y bajando sin detenerte? ¿Puedes posicionarlo tanto para Am como para Em pentatónica?',
      standards: ['Cr.1a', 'Pr.4a', 'Pr.5a']
    },

    skills: [
      { id: 'm4w1-s1', text: 'Play Pentatonic Pattern 1 ascending and descending from memory',
        text_es: 'Tocar el Patrón pentatónico 1 subiendo y bajando de memoria',
        gotItWhen: 'you can play the full pattern up and back down without looking at a diagram, with no missed notes or hesitations.',
        gotItWhen_es: 'puedes tocar el patrón completo subiendo y volviendo a bajar sin mirar un diagrama, sin notas falladas ni dudas.',
        practice: { type: 'playSeq', label: 'Am pentatonic Pattern 1 (ascending)', label_es: 'Patrón pentatónico 1 de Am (subiendo)', bpm: 70,
          notes: [45, 48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72] } },
      { id: 'm4w1-s2', text: 'Use alternate picking (down-up) consistently through the pattern',
        text_es: 'Usar púa alterna (abajo-arriba) de forma constante a lo largo del patrón',
        gotItWhen: 'your pick alternates down-up-down-up automatically — you don\'t have to think about which direction comes next.',
        gotItWhen_es: 'tu púa alterna abajo-arriba-abajo-arriba automáticamente — no tienes que pensar en qué dirección sigue.',
        practice: { type: 'playSeq', label: 'Pattern 1 descending — alternate picking (down-up)', label_es: 'Patrón 1 bajando — púa alterna (abajo-arriba)', bpm: 70,
          notes: [72, 69, 67, 64, 62, 60, 57, 55, 52, 50, 48, 45] } },
      { id: 'm4w1-s3', text: 'Position Pattern 1 as a minor pentatonic scale (1st finger on root)',
        text_es: 'Posicionar el Patrón 1 como escala pentatónica menor (dedo índice en la raíz)',
        gotItWhen: 'you can pick any minor key (Am, Em, Gm…), place your 1st finger on the right fret of the low E, and play the pattern from there.',
        gotItWhen_es: 'puedes elegir cualquier tonalidad menor (Am, Em, Gm…), colocar tu dedo índice en el traste correcto de la Mi grave, y tocar el patrón desde ahí.',
        practice: { type: 'mc', prompt: 'Your 1st finger is on the low E string at fret 8. Which minor pentatonic scale are you set up to play?',
          prompt_es: 'Tu dedo índice está en la cuerda Mi grave, traste 8. ¿Qué escala pentatónica menor estás listo para tocar?',
          choices: ['A minor', 'C minor', 'E minor', 'G minor'], choices_es: ['A menor', 'C menor', 'E menor', 'G menor'], answer: 1,
          explain: 'In the minor version of Pattern 1 your 1st finger sits on the root, and the low E string at fret 8 is C — so C minor pentatonic. A minor is the tempting answer, but that one starts back at fret 5.',
          explain_es: 'En la versión menor del Patrón 1 tu dedo índice va sobre la raíz, y la cuerda Mi grave en el traste 8 es C — así que pentatónica de C menor. A menor es la respuesta tentadora, pero esa empieza allá en el traste 5.' } },
      { id: 'm4w1-s4', text: 'Position Pattern 1 as a major pentatonic scale (4th finger on root)',
        text_es: 'Posicionar el Patrón 1 como escala pentatónica mayor (dedo meñique en la raíz)',
        gotItWhen: 'you can pick any major key (C, G, D…), place your 4th finger on the right fret of the low E, and play the pattern from there.',
        gotItWhen_es: 'puedes elegir cualquier tonalidad mayor (C, G, D…), colocar tu dedo meñique en el traste correcto de la Mi grave, y tocar el patrón desde ahí.',
        practice: { type: 'mc', prompt: 'When you treat Pattern 1 as a MAJOR pentatonic, which finger sits on the root?',
          prompt_es: 'Cuando tratas el Patrón 1 como pentatónica MAYOR, ¿qué dedo se coloca en la raíz?',
          choices: ['1st (index)', '2nd (middle)', '3rd (ring)', '4th (pinky)'], choices_es: ['1º (índice)', '2º (medio)', '3º (anular)', '4º (meñique)'], answer: 3,
          explain: 'Same shape, different home note: as a major pentatonic the root sits under your 4th finger (pinky) on the low E string, not your 1st. Reaching for the index finger is the minor-scale reflex to unlearn here.',
          explain_es: 'La misma forma, distinta nota base: como pentatónica mayor la raíz queda bajo tu dedo meñique en la cuerda Mi grave, no bajo el índice. Buscar el índice es el reflejo de la escala menor que hay que desaprender aquí.' } },
      { id: 'm4w1-s5', text: 'Play the pattern in time at 60 BPM with a metronome',
        text_es: 'Tocar el patrón a tiempo a 60 BPM con un metrónomo',
        gotItWhen: 'every note lands on a beat at 60 BPM and you can play the whole pattern without stopping or losing the click.',
        gotItWhen_es: 'cada nota cae en un tiempo a 60 BPM y puedes tocar todo el patrón sin detenerte ni perder el clic.',
        practice: { type: 'pr', prompt: '<ol><li>Play Pattern 1 up and down with every note landing on a click.</li><li>Start at 60 BPM and raise the metronome +5 at a time.</li><li>Log your fastest CLEAN tempo.</li></ol>',
          prompt_es: '<ol><li>Toca el Patrón 1 subiendo y bajando con cada nota cayendo en un clic.</li><li>Empieza a 60 BPM y sube el metrónomo de 5 en 5.</li><li>Anota tu tempo LIMPIO más rápido.</li></ol>',
          unit: 'BPM', placeholder: 'e.g. 70 — try for a higher number next session', placeholder_es: 'p. ej. 70 — intenta superarlo la próxima sesión' } },
      { id: 'm4w1-s6', text: 'Improvise a short 2-bar musical idea using 2–3 notes from the pattern',
        text_es: 'Improvisar una idea musical corta de 2 compases usando 2–3 notas del patrón',
        gotItWhen: 'you can play a 2-bar phrase that feels intentional — not random — using just 2 or 3 notes from the pattern.',
        gotItWhen_es: 'puedes tocar una frase de 2 compases que se sienta intencionada — no aleatoria — usando solo 2 o 3 notas del patrón.',
        practice: { type: 'mc', prompt: 'What makes a short improvised phrase sound intentional instead of random?',
          prompt_es: '¿Qué hace que una frase improvisada corta suene intencionada en vez de aleatoria?',
          choices: ['Using as many different notes as possible', 'Playing it as fast as you can', 'Never repeating anything', 'Repeating an idea, varying it, and leaving space'],
          choices_es: ['Usar tantas notas diferentes como sea posible', 'Tocarla lo más rápido que puedas', 'Nunca repetir nada', 'Repetir una idea, variarla, y dejar espacio'], answer: 3,
          explain: 'Repetition with small changes — and space between the phrases — is what makes a phrase sound "meant." More notes and more speed usually make it sound MORE random, not less.',
          explain_es: 'La repetición con pequeños cambios — y el espacio entre las frases — es lo que hace que una frase suene "a propósito". Más notas y más velocidad normalmente la hacen sonar MÁS aleatoria, no menos.' } }
    ]
  },

  {
    id: 'm4w2',
    songThread: [{ name: '"Sweet Child O\' Mine"', journey: 'tabs/sweet-child-o-mine.html', layer: 4, note: 'solo territory' }],
    label: 'Set 2',
    locked: false,
    module: 'Major / Minor / Blues Pentatonic Scales',
    moduleNum: 4,
    unit: 'Module 4 · Major / Minor / Blues Pentatonic Scales',
    unit_es: 'Módulo 4 · Escalas pentatónicas mayor, menor y de blues',
    title: 'Set 2',
    subtitle: 'Tone parameters · Phrasing strategies · Notes on D & G strings',
    subtitle_es: 'Parámetros de tono · Estrategias de fraseo · Notas en las cuerdas Re y Sol',
    skillFocus: 'Playing expressively with dynamics and tone · Phrasing a solo with call-and-response · Notes on the D and G strings',
    skillFocus_es: 'Tocar con expresividad usando dinámica y tono · Frasear un solo con llamada y respuesta · Notas en las cuerdas Re y Sol',
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
            label: 'Watch: using the minor pentatonic', label_es: 'Mira: usar la pentatónica menor',
            text: 'Watch: <a href="https://www.youtube.com/watch?v=1mT5nUE0o7M&t=31" target="_blank">How to USE the Minor Pentatonic Scale – Lauren Bateman (0:00–4:00)</a> to refresh the shape. Then YOU add the expression the video doesn\'t:<ol><li>Pick one note from the pattern.</li><li>Play it loud, then soft.</li></ol>That difference in volume is dynamics.',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=1mT5nUE0o7M&t=31" target="_blank">How to USE the Minor Pentatonic Scale – Lauren Bateman (0:00–4:00)</a> para repasar la forma. Luego TÚ agregas la expresión que el video no muestra:<ol><li>Elige una nota del patrón.</li><li>Tócala fuerte, y luego suave.</li></ol>Esa diferencia de volumen es la dinámica.',
            hint: 'The video shows the notes; the dynamics are on you. Play one note loud, then whisper-soft, and listen for how much the FEEL changes even though the note doesn\'t.',
            hint_es: 'El video muestra las notas; la dinámica depende de ti. Toca una nota fuerte, y luego en un susurro suave, y escucha cuánto cambia la SENSACIÓN aunque la nota no cambie.',
            skills: [1, 2],
            response: { type: 'short', placeholder: 'Describe your own loud-then-soft experiment: which note, and what changed in the sound?',
              placeholder_es: 'Describe tu propio experimento fuerte-luego-suave: ¿qué nota, y qué cambió en el sonido?' }
          },
          {
            label: 'Watch: hammer-ons and pull-offs', label_es: 'Mira: hammer-ons y pull-offs',
            text: 'Watch: <a href="https://youtu.be/7hDdZAjKBjY" target="_blank">Hammer-Ons Explained + Exercise For Beginners – JustinGuitar</a> (0:00–3:00). The video covers the hammer-on; the pull-off is the same move in reverse — try both on your own guitar:<ol><li>Pick the open D string.</li><li>Then hammer your finger onto the 2nd fret without picking again — that\'s the hammer-on.</li><li>Now the pull-off, the same move backwards: fret the D string at the 2nd fret and pick it, then flick that finger sideways off the string so the open D rings on its own — no second pick.</li></ol>',
            text_es: 'Mira: <a href="https://youtu.be/7hDdZAjKBjY" target="_blank">Hammer-Ons Explained + Exercise For Beginners – JustinGuitar</a> (0:00–3:00). El video cubre el hammer-on; el pull-off es el mismo movimiento al revés — prueba los dos en tu propia guitarra:<ol><li>Pulsa la cuerda Re al aire.</li><li>Luego martilla tu dedo sobre el traste 2 sin pulsar de nuevo — eso es el hammer-on.</li><li>Ahora el pull-off, el mismo movimiento al revés: trastea la cuerda Re en el traste 2 y púlsala, y luego saca ese dedo de la cuerda de un tirón hacia el costado para que la Re al aire suene sola — sin un segundo golpe de púa.</li></ol>',
            hint: 'These are your first "expressive" techniques. A hammer-on connects two notes with one pick stroke — it changes the shape (envelope) of the notes. A pull-off is the same trick going down: your finger plucks the string on its way off, so the lower note sounds with no pick at all.',
            hint_es: 'Estas son tus primeras técnicas "expresivas." Un hammer-on conecta dos notas con un solo golpe de púa — cambia la forma (envolvente) de las notas. Un pull-off es el mismo truco pero bajando: tu dedo pulsa la cuerda al salir, así que la nota más grave suena sin ningún golpe de púa.',
            skills: [3, 4],
            response: { type: 'mc', prompt: 'A hammer-on connects two notes using how many pick strokes?',
              prompt_es: '¿Un hammer-on conecta dos notas usando cuántos golpes de púa?',
              answer: 0,
              explain: 'You pick the first note once, then "hammer" a finger onto the higher fret to sound the second note — one pick stroke for both.',
              explain_es: 'Pulsas la primera nota una vez, y luego "martillas" un dedo sobre el traste más alto para sonar la segunda nota — un golpe de púa para las dos.',
              choices: [
              'One pick stroke',
              'Two pick strokes',
              'Zero pick strokes',
              'Depends on the speed'
            ],
              choices_es: [
              'Un golpe de púa',
              'Dos golpes de púa',
              'Cero golpes de púa',
              'Depende de la velocidad'
            ] }
          }
            ]
          },
          {
            title: 'Experiment with timbre',
            title_es: 'Experimenta con el timbre',
            steps: [
          {
            label: 'Bright vs. warm timbre', label_es: 'Timbre brillante vs. cálido',
            text: 'Experiment with timbre:<ol><li>Play a note close to the bridge.</li><li>Then play the same note near the neck.</li></ol>Hear the difference? Bright vs warm. Try to match the mood of a song you know.',
            text_es: 'Experimenta con el timbre:<ol><li>Toca una nota cerca del puente.</li><li>Y luego toca la misma nota cerca del mástil.</li></ol>¿Escuchas la diferencia? Brillante vs cálido. Intenta igualar el estado de ánimo de una canción que conozcas.',
            hint: 'There\'s no wrong answer here. Your picking hand position is a real-time tone control. Move it consciously.',
            hint_es: 'No hay respuesta incorrecta aquí. La posición de tu mano de pulsar es un control de tono en tiempo real. Muévela con intención.',
            skills: [2],
            response: { type: 'mc', prompt: 'Which picking position sounds BRIGHTER?',
              prompt_es: '¿Qué posición de pulsado suena más BRILLANTE?',
              answer: 0,
              explain: 'Picking close to the bridge gives a brighter, sharper tone; picking near the neck sounds warmer and rounder. Your picking hand is a live tone control.',
              explain_es: 'Pulsar cerca del puente da un tono más brillante y agudo; pulsar cerca del mástil suena más cálido y redondo. Tu mano de pulsar es un control de tono en vivo.',
              choices: [
              'Close to the bridge',
              'Close to the neck',
              'Right over the soundhole',
              'They sound exactly the same'
            ],
              choices_es: [
              'Cerca del puente',
              'Cerca del mástil',
              'Justo sobre la boca de la guitarra',
              'Suenan exactamente igual'
            ] }
          }
            ]
          },
          {
            title: 'Name the D-string notes',
            title_es: 'Nombra las notas de la cuerda Re',
            steps: [
          {
            label: 'Play and name the D-string notes', label_es: 'Toca y nombra las notas de la cuerda Re',
            text: 'Now try it: the natural notes on the D string:<ol><li>Click any note below the TAB to hear it.</li><li>Then play and NAME each one up the string — D · E · F · G · A · B · C.</li></ol>You\'ll drill this without looking at the chart at the practice station.',
            text_es: 'Ahora pruébalo: las notas naturales de la cuerda Re:<ol><li>Presiona cualquier nota debajo del TAB para escucharla.</li><li>Luego toca y NOMBRA cada una subiendo por la cuerda — D · E · F · G · A · B · C.</li></ol>Vas a ejercitar esto sin mirar el diagrama en la estación de práctica.',
            hint: 'It\'s the same musical alphabet you know from the E and A strings. The gap between E–F and B–C is one fret (a half step). Every other gap is two frets (a whole step).',
            hint_es: 'Es el mismo alfabeto musical que conoces de las cuerdas Mi y La. La distancia entre E–F y B–C es un traste (un semitono). Cualquier otra distancia es de dos trastes (un tono).',
            skills: [7],
            tab: {
              caption: 'D string natural notes · D E F G A B C (frets 0–10)',
              caption_es: 'Notas naturales de la cuerda Re · D E F G A B C (trastes 0–10)',
              notes: [
                { string: 'D', fret: 0, note: 'D', midi: 50 },
                { string: 'D', fret: 2, note: 'E', midi: 52 },
                { string: 'D', fret: 3, note: 'F', midi: 53 },
                { string: 'D', fret: 5, note: 'G', midi: 55 },
                { string: 'D', fret: 7, note: 'A', midi: 57 },
                { string: 'D', fret: 9, note: 'B', midi: 59 },
                { string: 'D', fret: 10, note: 'C', midi: 60 }
              ]
            }
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
          {
            label: 'Wrap-up: your go-to expressive tool', label_es: 'Cierre: tu herramienta expresiva',
            text: 'Station Wrap-Up — pause and think: which expressive tool felt most natural today — dynamics (loud/soft), timbre (bright/warm), or the hammer-on? Which one will you lean on in your solos?',
            text_es: 'Cierre de la estación — pausa y piensa: ¿qué herramienta expresiva se sintió más natural hoy — la dinámica (fuerte/suave), el timbre (brillante/cálido), o el hammer-on? ¿En cuál te vas a apoyar en tus solos?',
            response: { type: 'short', placeholder: 'e.g. dynamics came easily; hammer-ons still feel unreliable',
              placeholder_es: 'p. ej. la dinámica salió fácil; los hammer-ons todavía se sienten poco confiables' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — phrasing & D/G strings',
        title_es: 'Estación de práctica — fraseo y cuerdas Re/Sol',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Tune all 6 strings', label_es: 'Afina las 6 cuerdas',
                text: 'Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                hint: 'Tuning (Module 1) is a skill you keep forever. Today you\'re adding expression on top of clean notes — so the notes have to be clean first.',
                hint_es: 'Afinar (Módulo 1) es una destreza que conservas para siempre. Hoy agregas expresión sobre notas limpias — así que las notas tienen que estar limpias primero.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Play an expressive one-note solo',
            title_es: 'Toca un solo expresivo de una sola nota',
            steps: [
          {
            label: 'Challenge 1 — The One-Note Solo', label_es: 'Reto 1 — El solo de una nota',
            text: '<ol><li>Choose one note in the Am pentatonic pattern.</li><li>Play only that note for 8 bars, varying rhythm, dynamics, and tone.</li></ol>You\'ve got it when: make one note stay interesting for all 8 bars — record it and listen back.',
            text_es: '<ol><li>Elige una nota del patrón pentatónico de Am.</li><li>Toca solo esa nota durante 8 compases, variando el ritmo, la dinámica y el tono.</li></ol>Lo tienes cuando: logras que una nota se mantenga interesante durante los 8 compases — grábalo y escúchalo después.',
            hint: 'This sounds easy but isn\'t. Can you make one note interesting for 8 whole bars? The way you play it matters more than how many notes you play.',
            hint_es: 'Esto suena fácil pero no lo es. ¿Puedes hacer que una nota sea interesante durante 8 compases completos? La forma en que la tocas importa más que cuántas notas toques.',
            stuck: 'Just change ONE thing per bar — louder, then softer, then short, then long. That\'s already a one-note solo.',
            stuck_es: 'Cambia SOLO una cosa por compás — más fuerte, y luego más suave, y luego corta, y luego larga. Eso ya es un solo de una nota.',
            levelUp: 'Add a hammer-on or a slide into the note, or move your picking hand bridge-to-neck mid-phrase to change the tone live.',
            levelUp_es: 'Agrega un hammer-on o un deslizamiento hacia la nota, o mueve tu mano de pulsar de puente a mástil a mitad de la frase para cambiar el tono en vivo.',
            skills: [1, 2, 5]
          }
            ]
          },
          {
            title: 'Improvise a call-and-response phrase',
            title_es: 'Improvisa una frase de llamada y respuesta',
            steps: [
          {
            label: 'Challenge 2 — Call & Response (your assessment piece)', label_es: 'Reto 2 — Llamada y respuesta (tu pieza de evaluación)',
            text: 'Over the Am backing track (<a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; Am jam track</a>):<ol><li>Play a 2-bar idea (call).</li><li>Pause 1 bar.</li><li>Answer with a 2-bar idea (response).</li></ol>You\'ve got it when: the call ends on a non-root note (unresolved) and the response lands on the root (arrives home). This — call-and-response — is one of the two phrasing strategies you\'ll name at your Set 3 assessment.',
            text_es: 'Sobre la pista de acompañamiento de Am (<a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; pista de jam en Am</a>):<ol><li>Toca una idea de 2 compases (llamada).</li><li>Pausa 1 compás.</li><li>Responde con una idea de 2 compases (respuesta).</li></ol>Lo tienes cuando: la llamada termina en una nota que no es la raíz (sin resolver) y la respuesta aterriza en la raíz (llega a la nota base). Esto — llamada y respuesta — es una de las dos estrategias de fraseo que vas a nombrar en tu evaluación de la Unidad 3.',
            hint: 'Think of it like a musical question and answer. The call feels unresolved; the response feels like it arrives somewhere.',
            hint_es: 'Piénsalo como una pregunta y respuesta musical. La llamada se siente sin resolver; la respuesta se siente como si llegara a algún lugar.',
            stuck: 'Use just 2–3 notes for both call and response — end the response on A (the root) every time so the "answer" always lands home.',
            stuck_es: 'Usa solo 2–3 notas tanto para la llamada como para la respuesta — termina la respuesta en A (la raíz) cada vez para que la "respuesta" siempre llegue a la nota base.',
            levelUp: 'Record a 2-bar call and answer it live over the playback, or make the call longer than the response so the answer feels like a punchline. (Someone around? Trade: you call, they answer.)',
            levelUp_es: 'Graba una llamada de 2 compases y respóndela en vivo sobre la grabación, o haz que la llamada sea más larga que la respuesta para que la respuesta se sienta como un remate. (¿Tienes a alguien cerca? Intercambien: tú llamas, ellos responden.)',
            skills: [5, 6]
          }
            ]
          },
          {
            title: 'Name the notes on the D & G strings',
            title_es: 'Nombra las notas en las cuerdas Re y Sol',
            steps: [
          {
            label: 'Challenge 3 — D String Map', label_es: 'Reto 3 — Mapa de la cuerda Re',
            text: '<ul><li>Play the natural notes on the D string — D · E · F · G · A · B · C (frets 0–10) — slowly, saying each name aloud.</li></ul>You\'ve got it when: a clean lap up and back, without looking at the chart. Click "Play all" to hear it at 60 BPM.<span class="step-figure"><img src="img/m4-d-naturals.svg" alt="A fretboard diagram of the D string, frets 0 to 10, with the natural notes marked: D open, E at fret 2, F at fret 3, G at fret 5, A at fret 7, B at fret 9, and C at fret 10."></span>',
            text_es: '<ul><li>Toca las notas naturales de la cuerda Re — D · E · F · G · A · B · C (trastes 0–10) — despacio, diciendo cada nombre en voz alta.</li></ul>Lo tienes cuando: una vuelta limpia subiendo y bajando, sin mirar el diagrama. Presiona "Tocar todo" para escucharlo a 60 BPM.<span class="step-figure"><img src="img/m4-d-naturals.svg" alt="Un diagrama del diapasón de la cuerda Re, trastes 0 a 10, con las notas naturales marcadas: D al aire, E en el traste 2, F en el 3, G en el 5, A en el 7, B en el 9, y C en el 10."></span>',
            hint: 'Same musical alphabet pattern you know from E and A strings. Find the pattern — it repeats! Set the ⏱ Timer for 2 minutes and see how many laps you get without looking at the chart.',
            hint_es: 'Es el mismo patrón de alfabeto musical que conoces de las cuerdas Mi y La. Encuentra el patrón — ¡se repite! Pon el ⏱ Temporizador en 2 minutos y ve cuántas vueltas logras sin mirar el diagrama.',
            stuck: 'Cover the chart and name just the first five notes (frets 0, 2, 3, 5, 7 — D, E, F, G, A) — find E–F and B–C, the two one-fret jumps, and the rest falls into place.',
            stuck_es: 'Cubre el diagrama y nombra solo las primeras cinco notas (trastes 0, 2, 3, 5, 7 — D, E, F, G, A) — encuentra E–F y B–C, los dos saltos de un traste, y el resto encaja solo.',
            levelUp: 'Point to a random fret 0–10 without counting up and name the note in under 3 seconds, or run the string top-to-bottom (C back down to D).',
            levelUp_es: 'Señala un traste al azar entre 0–10 sin contar desde el inicio y nombra la nota en menos de 3 segundos, o recorre la cuerda de arriba hacia abajo (de C de vuelta a D).',
            skills: [7],
            playSeq: { label: 'Play all', label_es: 'Tocar todo', bpm: 60, notes: [50, 52, 53, 55, 57, 59, 60] },
            response: { type: 'short', prompt: 'Personal record: play it cleanly at 60 BPM, then raise the metronome +10 at a time. Your fastest CLEAN lap naming + playing the D string, without looking at the chart (BPM)?', prompt_es: 'Récord personal: tócalo limpio a 60 BPM, y luego sube el metrónomo de 10 en 10. ¿Tu vuelta LIMPIA más rápida nombrando y tocando la cuerda Re, sin mirar el diagrama (BPM)?', placeholder: 'e.g. 80 — try for a higher number next session', placeholder_es: 'p. ej. 80 — intenta superarlo la próxima sesión' }
          },
          {
            label: 'Challenge 4 — G String Map', label_es: 'Reto 4 — Mapa de la cuerda Sol',
            text: '<ul><li>Play the same on the G string — G · A · B · C · D · E · F (frets 0–10), slowly, names aloud.</li></ul>You\'ve got it when: a clean lap up and back, without looking at the chart.<span class="step-figure"><img src="img/m4-g-naturals.svg" alt="A fretboard diagram of the G string, frets 0 to 10, with the natural notes marked: G open, A at fret 2, B at fret 4, C at fret 5, D at fret 7, E at fret 9, and F at fret 10."></span>',
            text_es: '<ul><li>Toca lo mismo en la cuerda Sol — G · A · B · C · D · E · F (trastes 0–10), despacio, nombres en voz alta.</li></ul>Lo tienes cuando: una vuelta limpia subiendo y bajando, sin mirar el diagrama.<span class="step-figure"><img src="img/m4-g-naturals.svg" alt="Un diagrama del diapasón de la cuerda Sol, trastes 0 a 10, con las notas naturales marcadas: G al aire, A en el traste 2, B en el 4, C en el 5, D en el 7, E en el 9, y F en el 10."></span>',
            hint: 'Notice the same pattern of whole and half steps — the musical alphabet behaves the same way on every string.',
            hint_es: 'Fíjate en el mismo patrón de tonos y semitonos — el alfabeto musical se comporta igual en cada cuerda.',
            stuck: 'Find the two half steps first — B–C (frets 4–5) and E–F (frets 9–10) — then fill in the whole-step gaps between them.',
            stuck_es: 'Encuentra primero los dos semitonos — B–C (trastes 4–5) y E–F (trastes 9–10) — y luego llena los tonos completos entre ellos.',
            levelUp: 'Jump between strings: play D on the D string, then D on the G string, and name both — or quiz yourself on random frets against the clock.',
            levelUp_es: 'Salta entre cuerdas: toca D en la cuerda Re, y luego D en la cuerda Sol, y nombra ambas — o ponte a prueba con trastes al azar contra el reloj.',
            skills: [7],
            playSeq: { label: 'Play all', label_es: 'Tocar todo', bpm: 60, notes: [55, 57, 59, 60, 62, 64, 65] }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Sweet Child O\' Mine", solo-section feel', label_es: 'Reto — "Sweet Child O\' Mine", sensación de sección de solo',
                text: 'The famous outro solo lives in E minor pentatonic:<ol><li>Improvise four bars in the open position.</li><li>Then move the same shape up to the 12th fret and play four more — same pattern, one octave up, instant "solo voice."</li></ol>You\'ve got it when: both registers (register = how high or low the notes are), phrases with space, landing on E in each. <a href="tabs/sweet-child-o-mine.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 4 of 5</a>.',
                text_es: 'El famoso solo del outro vive en E menor pentatónica:<ol><li>Improvisa cuatro compases en posición abierta.</li><li>Luego mueve la misma forma hasta el traste 12 y toca cuatro más — mismo patrón, una octava más arriba, sonido de "solo" instantáneo.</li></ol>Lo tienes cuando: ambos registros (registro = qué tan agudas o graves son las notas), frases con espacio, aterrizando en E en cada uno. <a href="tabs/sweet-child-o-mine.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 4 de 5</a>.',
                hint: 'High on the neck IS the solo sound. Nothing about your ideas has to change — the register does the drama for you.',
                hint_es: 'Arriba en el mástil ES el sonido de solo. Nada de tus ideas tiene que cambiar — el registro hace el drama por ti.',
                stuck: 'Stay open-position and just VISIT the 12th fret for your last note of each phrase.',
                stuck_es: 'Quédate en posición abierta y solo VISITA el traste 12 para la última nota de cada frase.',
                levelUp: 'Slide between the two positions mid-phrase, or hold your longest note an extra bar and let it ring out.',
                levelUp_es: 'Desliza entre las dos posiciones a mitad de frase, o sostén tu nota más larga un compás extra y déjala sonar.',
                skills: [5, 6],
                tab: {
                  caption: 'Same shape, two homes — E at fret 0 and fret 12',
                  caption_es: 'Misma forma, dos hogares — E en el traste 0 y el traste 12',
                  notes: [
                    { string: 'E', fret: 0,  note: 'E', midi: 40 },
                    { string: 'E', fret: 3,  note: 'G', midi: 43 },
                    { string: 'A', fret: 0,  note: 'A', midi: 45 },
                    { string: 'E', fret: 12, note: 'E', midi: 52 },
                    { string: 'E', fret: 15, note: 'G', midi: 55 }
                  ]
                },
                response: { type: 'short', prompt: 'Open position vs. 12th fret — which felt more like "your" sound?', prompt_es: 'Posición abierta vs. traste 12 — ¿cuál se sintió más como "tu" sonido?', placeholder: 'e.g. 12th fret — felt like a real solo', placeholder_es: 'p. ej. traste 12 — se sintió como un solo de verdad' }
              },
              {
                label: 'Challenge — Solo over "the cure"', label_es: 'Reto — Solo sobre "the cure"',
                text: 'Olivia\'s song is soft — so your solo has to be too. Improvise eight bars in Am pentatonic Pattern 1 at a whisper:<ul><li>Light pick.</li><li>Slow phrases.</li><li>Lots of space.</li></ul>You\'ve got it when: eight bars where the quietest note is as clean as your loudest. <a href="tabs/the-cure.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 4 of 5</a>.',
                text_es: 'La canción de Olivia es suave — así que tu solo también tiene que serlo. Improvisa ocho compases en el Patrón pentatónico 1 de Am en un susurro:<ul><li>Púa ligera.</li><li>Frases lentas.</li><li>Mucho espacio.</li></ul>Lo tienes cuando: ocho compases donde la nota más suave está tan limpia como la más fuerte. <a href="tabs/the-cure.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 4 de 5</a>.',
                hint: 'Playing quietly is a skill, not a limitation. Every buzz and mistake hides at loud volume and shows at soft — this is an honesty check.',
                hint_es: 'Tocar suave es una destreza, no una limitación. Cada zumbido y error se esconde a volumen fuerte y se nota a volumen suave — esto es una prueba de honestidad.',
                stuck: 'Rule of 3 at half speed: three notes, whisper volume, one phrase per two bars.',
                stuck_es: 'Regla de 3 a media velocidad: tres notas, volumen susurrado, una frase cada dos compases.',
                levelUp: 'Build one long crescendo across all eight bars — start at a whisper, end singing, never harsh.',
                levelUp_es: 'Construye un solo crescendo largo a lo largo de los ocho compases — empieza en un susurro, termina cantando, nunca áspero.',
                skills: [5, 6],
                response: { type: 'short', prompt: 'Rate your quiet control 1–3, and name one note that buzzed when soft.', prompt_es: 'Califica tu control del volumen suave del 1 al 3, y nombra una nota que zumbó cuando tocaste suave.', placeholder: 'e.g. 2 — the G on the D string buzzes', placeholder_es: 'p. ej. 2 — el G en la cuerda Re zumba' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: phrasing or note names?', label_es: 'Cierre: ¿fraseo o nombres de nota?',
                text: 'Which is more solid right now — your expressive phrasing (call-and-response, dynamics) or your note names on D and G? Write the weaker one below — that\'s your warm-up target next time.',
                text_es: '¿Qué está más sólido ahora mismo — tu fraseo expresivo (llamada y respuesta, dinámica) o tus nombres de nota en Re y Sol? Escribe el más débil abajo — ese es tu objetivo de calentamiento la próxima vez.',
                response: { type: 'short', placeholder: 'e.g. phrasing is coming along; G string note names still need counting',
                  placeholder_es: 'p. ej. el fraseo va mejorando; los nombres de nota de la cuerda Sol todavía necesitan que cuente' }
              }
            ]
          },
          {
            title: 'Ear Spark — optional ear bonus',
            title_es: 'Chispa auditiva — bono opcional de oído',
            steps: [
              {
                label: 'Ear Spark: sing and find the note', label_es: 'Chispa auditiva: canta y encuentra la nota',
                text: 'Ear Spark (optional, 2 min):<ol><li>Press play below — the deck draws three notes from the low E string, frets 0–5, and plays them for you.</li><li>Sing each note back and hold it, then find it on the string — singing first is the whole trick.</li><li>Check yourself last.</li></ol>',
                text_es: 'Chispa auditiva (opcional, 2 min):<ol><li>Presiona reproducir abajo — la baraja saca tres notas de la cuerda Mi grave, trastes 0–5, y las toca por ti.</li><li>Canta cada nota de vuelta y sostenla, y luego encuéntrala en la cuerda — cantar primero es todo el truco.</li><li>Revísate al final.</li></ol>',
                drill: { type: 'ear', pool: 'lowEFrets', draw: 3 },
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Varies dynamics on purpose (p, mf, f) · Changes timbre by shifting picking-hand position · Performs a hammer-on and pull-off · Shapes a note\'s "envelope" (attack and length) · Plays a call-and-response phrase (call unresolved, response lands on root) · Names all natural notes on the D & G strings',
      goal_es: 'Varía la dinámica a propósito (p, mf, f) · Cambia el timbre moviendo la posición de la mano de pulsar · Ejecuta un hammer-on y un pull-off · Da forma a la "envolvente" de una nota (ataque y duración) · Toca una frase de llamada y respuesta (la llamada sin resolver, la respuesta aterriza en la raíz) · Nombra todas las notas naturales en las cuerdas Re y Sol',
      performance: 'Solo check: record a call-and-response phrase over the Am jam track — a 2-bar call, a 1-bar pause, then a 2-bar response — then listen back and judge: does the response resolve at the end?',
      selfCheck: 'Can you vary your dynamics on purpose (loud vs soft)? Can you play a clear call-and-response phrase where the "answer" lands on the root?',
      selfCheck_es: '¿Puedes variar tu dinámica a propósito (fuerte vs suave)? ¿Puedes tocar una frase clara de llamada y respuesta donde la "respuesta" aterrice en la raíz?',
      standards: ['Cr.1a', 'Pr.4a', 'Pr.5b']
    },

    skills: [
      { id: 'm4w2-s1', text: 'Vary dynamics consciously: play the same note at p, mf, and f (the letters musicians use for volume: p = piano, quiet · mf = mezzo-forte, medium · f = forte, loud)',
        text_es: 'Variar la dinámica de forma consciente: tocar la misma nota en p, mf y f (las letras que usan los músicos para el volumen: p = piano, suave · mf = mezzo-forte, medio · f = forte, fuerte)',
        gotItWhen: 'you play the same note three times in a row and can clearly hear on a recording that you got louder each time.',
        gotItWhen_es: 'tocas la misma nota tres veces seguidas y puedes escuchar claramente en una grabación que subiste el volumen cada vez.',
        practice: { type: 'mc', prompt: 'Which order goes from QUIETEST to LOUDEST?',
          prompt_es: '¿Qué orden va de MÁS SUAVE a MÁS FUERTE?',
          choices: ['p, mf, f', 'f, mf, p', 'mf, p, f', 'mf, f, p'], choices_es: ['p, mf, f', 'f, mf, p', 'mf, p, f', 'mf, f, p'], answer: 0,
          explain: 'The letters are Italian: p = piano (quiet), mf = mezzo-forte (medium), f = forte (loud). So p, mf, f is the climb from softest to loudest — f, mf, p is that same climb read backwards.',
          explain_es: 'Las letras vienen del italiano: p = piano (suave), mf = mezzo-forte (medio), f = forte (fuerte). Así que p, mf, f es la subida de lo más suave a lo más fuerte — f, mf, p es esa misma subida leída al revés.' } },
      { id: 'm4w2-s2', text: 'Change timbre by moving picking hand between bridge and neck',
        text_es: 'Cambiar el timbre moviendo la mano de pulsar entre el puente y el mástil',
        gotItWhen: 'the difference between your "bright" (near the bridge) and "warm" (near the neck) tones is obvious on a recording without you announcing which is which.',
        gotItWhen_es: 'la diferencia entre tu tono "brillante" (cerca del puente) y "cálido" (cerca del mástil) es obvia en una grabación sin que anuncies cuál es cuál.',
        practice: { type: 'mc', prompt: 'You want a warmer, rounder tone for a quiet verse. Where should your picking hand move?',
          prompt_es: 'Quieres un tono más cálido y redondo para una estrofa tranquila. ¿Hacia dónde debe moverse tu mano de pulsar?',
          choices: ['Toward the neck', 'Tight against the bridge', 'Nowhere — tone comes from the guitar, not your hands', 'Higher up the frets with the fretting hand'],
          choices_es: ['Hacia el mástil', 'Pegada contra el puente', 'A ningún lado — el tono viene de la guitarra, no de tus manos', 'Más arriba en los trastes con la mano de trastear'], answer: 0,
          explain: 'Near the neck sounds warm and round; near the bridge sounds bright and sharp. Your picking-hand position is a built-in tone control.',
          explain_es: 'Cerca del mástil suena cálido y redondo; cerca del puente suena brillante y agudo. La posición de tu mano de pulsar es un control de tono integrado.' } },
      { id: 'm4w2-s3', text: 'Perform a hammer-on and a pull-off',
        text_es: 'Ejecutar un hammer-on y un pull-off',
        gotItWhen: 'you can produce the second note with no pick stroke — and it rings as clearly as a picked note.',
        gotItWhen_es: 'puedes producir la segunda nota sin ningún golpe de púa — y suena tan claro como una nota pulsada.',
        practice: { type: 'mc', prompt: 'On a pull-off, your finger starts on the higher fret. How do you make the SECOND note sound?',
          prompt_es: 'En un pull-off, tu dedo empieza en el traste más alto. ¿Cómo haces sonar la SEGUNDA nota?',
          choices: ['Pluck it with your picking hand', 'Snap your finger off the string sideways', 'Hammer down on a lower fret', 'Bend the string up'], choices_es: ['Pulsándola con tu mano de pulsar', 'Sacando el dedo de un tirón hacia el costado', 'Martillando sobre un traste más bajo', 'Doblando la cuerda hacia arriba'], answer: 1,
          explain: 'A pull-off sounds because your finger flicks sideways off the string and plucks it on the way out — no pick stroke at all. Picking the second note would give you the same pitch, but then it isn\'t a pull-off.',
          explain_es: 'Un pull-off suena porque tu dedo sale de la cuerda hacia el costado y la pulsa al salir — sin ningún golpe de púa. Pulsar la segunda nota te daría la misma altura, pero entonces ya no es un pull-off.' } },
      { id: 'm4w2-s4', text: 'Use "envelope": vary attack (attack = how hard and suddenly a note starts) and note length intentionally',
        text_es: 'Usar la "envolvente": variar el ataque (ataque = qué tan fuerte y repentino empieza una nota) y la duración de la nota de forma intencionada',
        gotItWhen: 'you can play a short, sharp note and a long, sustained note on demand, and the difference is obvious on playback.',
        gotItWhen_es: 'puedes tocar una nota corta y aguda y una nota larga y sostenida a pedido, y la diferencia es obvia al escuchar la grabación.',
        practice: { type: 'mc', prompt: 'You want a short, sharp "stab" of a note. What do you do?',
          prompt_es: 'Quieres una nota corta y punzante, como una "puñalada". ¿Qué haces?',
          choices: ['Pick softly and let the note ring out on its own', 'Pick firmly, then stop the string ringing', 'Just turn the volume up', 'Bend the string as you pick it'],
          choices_es: ['Pulsar suave y dejar que la nota suene por sí sola', 'Pulsar firme, y luego detener el sonido de la cuerda', 'Solo subir el volumen', 'Doblar la cuerda mientras la pulsas'], answer: 1,
          explain: 'Attack (how hard the note starts) plus length (how soon you stop it) are the two ends of a note\'s envelope — a stab is a hard attack cut short.',
          explain_es: 'El ataque (qué tan fuerte empieza la nota) más la duración (qué tan pronto la detienes) son los dos extremos de la envolvente de una nota — una nota punzante es un ataque fuerte cortado en seco.' } },
      { id: 'm4w2-s5', text: 'Play a one-note solo that uses dynamics and rhythm for expression',
        text_es: 'Tocar un solo de una sola nota que use dinámica y ritmo para la expresión',
        gotItWhen: 'you can play one note for 8 bars and a recording still holds your attention on listen-back — because you change something each time.',
        gotItWhen_es: 'puedes tocar una nota durante 8 compases y una grabación todavía mantiene tu atención al escucharla — porque cambias algo cada vez.',
        practice: { type: 'mc', prompt: 'Your solo is stuck on ONE note for 8 bars. What keeps a listener interested?',
          prompt_es: 'Tu solo está atascado en UNA sola nota durante 8 compases. ¿Qué mantiene interesado al oyente?',
          choices: ['Nothing — you need more notes to be interesting', 'Playing that note as fast as possible the whole time', 'Changing the rhythm, volume, and note length as you go', 'Holding one long note for all 8 bars'],
          choices_es: ['Nada — necesitas más notas para ser interesante', 'Tocar esa nota lo más rápido posible todo el tiempo', 'Cambiar el ritmo, el volumen y la duración de la nota sobre la marcha', 'Sostener una sola nota larga durante los 8 compases'], answer: 2,
          explain: 'Rhythm, dynamics, and space are expression tools that don\'t need new notes — that\'s the whole point of the one-note solo.',
          explain_es: 'El ritmo, la dinámica y el espacio son herramientas de expresión que no necesitan notas nuevas — ese es todo el punto del solo de una nota.' } },
      { id: 'm4w2-s6', text: 'Improvise a call-and-response phrase (call ends off root; response lands on root)',
        text_es: 'Improvisar una frase de llamada y respuesta (la llamada termina fuera de la raíz; la respuesta aterriza en la raíz)',
        gotItWhen: 'on playback you can hear the question (call) and the answer (response) — the call feels unresolved, the response feels like it arrives.',
        gotItWhen_es: 'al escuchar la grabación puedes oír la pregunta (llamada) y la respuesta — la llamada se siente sin resolver, la respuesta se siente como si llegara.',
        practice: { type: 'mc', prompt: 'In a call-and-response phrase, where should the RESPONSE end?',
          prompt_es: 'En una frase de llamada y respuesta, ¿dónde debe terminar la RESPUESTA?',
          choices: ['On any random note', 'On the root', 'On a non-root note', 'On the highest note in the scale'], choices_es: ['En cualquier nota al azar', 'En la raíz', 'En una nota que no es la raíz', 'En la nota más aguda de la escala'], answer: 1,
          explain: 'Landing on the root is what makes the response feel like an answer — the root is the note the ear hears as home. The call deliberately ends somewhere else, which is what keeps it sounding like a question.',
          explain_es: 'Aterrizar en la raíz es lo que hace que la respuesta se sienta como una respuesta — la raíz es la nota que el oído escucha como nota base. La llamada termina a propósito en otro lugar, y eso es lo que la mantiene sonando como una pregunta.' } },
      { id: 'm4w2-s7', text: 'Name all natural notes on the D string (frets 0–10) and G string (frets 0–10)',
        text_es: 'Nombrar todas las notas naturales de la cuerda Re (trastes 0–10) y la cuerda Sol (trastes 0–10)',
        gotItWhen: 'you can point to any fret 0–10 on D or G and name the note instantly without counting up from the open string.',
        gotItWhen_es: 'puedes señalar cualquier traste 0–10 en Re o Sol y nombrar la nota al instante sin contar desde la cuerda al aire.',
        practice: { type: 'mc', prompt: 'On the G string, what note is at fret 5?',
          prompt_es: 'En la cuerda Sol, ¿qué nota está en el traste 5?',
          choices: ['B', 'C', 'D', 'A'], choices_es: ['B', 'C', 'D', 'A'], answer: 1,
          explain: 'The G string open is G, and counting up five frets runs G–G#–A–A#–B–C, so fret 5 is C. B is the near-miss at fret 4 — on the G string the next string up is only four frets away, not five.',
          explain_es: 'La cuerda Sol al aire es G, y contando cinco trastes hacia arriba va G–G#–A–A#–B–C, así que el traste 5 es C. B es el casi-acierto en el traste 4 — en la cuerda Sol la siguiente cuerda queda a solo cuatro trastes, no a cinco.' } }
    ]
  },

  {
    id: 'm4w3',
    label: 'Set 3',
    locked: false,
    module: 'Major / Minor / Blues Pentatonic Scales',
    moduleNum: 4,
    unit: 'Module 4 · Major / Minor / Blues Pentatonic Scales',
    unit_es: 'Módulo 4 · Escalas pentatónicas mayor, menor y de blues',
    title: 'Set 3',
    subtitle: 'Scale theory · Blues scale · Compose an original solo',
    subtitle_es: 'Teoría de escalas · Escala de blues · Compón un solo original',
    skillFocus: 'How pentatonic and blues scales are built · Transposing to new keys · Composing and performing your own solo',
    skillFocus_es: 'Cómo se construyen las escalas pentatónica y de blues · Transponer a nuevas tonalidades · Componer y tocar tu propio solo',
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
            label: 'Re-watch: major/minor connection', label_es: 'Vuelve a mirar: conexión mayor/menor',
            text: 'Re-watch the same video from Set 1 — <a href="https://youtu.be/m_IiyJu60-c?t=105" target="_blank">Major Pentatonic Scale – Marty Music</a> (the link skips the intro) — this time listening for the major/minor connection. Then prove it on your own neck:<ol><li>Play Pattern 1 and call the low E root (1st finger) "home" for minor.</li><li>Then treat the note three frets higher (4th finger, same string) as "home" and hear the same shape turn major.</li></ol>',
            text_es: 'Vuelve a mirar el mismo video de la Unidad 1 — <a href="https://youtu.be/m_IiyJu60-c?t=105" target="_blank">Major Pentatonic Scale – Marty Music</a> (el enlace se salta la intro) — esta vez escuchando la conexión mayor/menor. Luego compruébalo en tu propio mástil:<ol><li>Toca el Patrón 1 y llama "nota base" a la raíz de la Mi grave (dedo 1º) para menor.</li><li>Luego trata la nota tres trastes más arriba (dedo 4º, misma cuerda) como "nota base" y escucha cómo la misma forma se vuelve mayor.</li></ol>',
            hint: 'Same five notes, two names: whichever note you treat as "home" (the root) decides whether it sounds major or minor. Watch for that connection, then prove it on your own neck. Your hand stays parked in one place — only which note you call "home" changes.',
            hint_es: 'Las mismas cinco notas, dos nombres: la nota que trates como "nota base" (la raíz) decide si suena mayor o menor. Fíjate en esa conexión, y luego compruébala en tu propio mástil. Tu mano se queda quieta en un lugar — solo cambia qué nota llamas "nota base."',
            skills: [1, 2],
            response: { type: 'short', placeholder: 'Explain the relative major/minor connection in your own words.',
              placeholder_es: 'Explica con tus propias palabras la conexión entre relativa mayor y menor.' }
          },
          {
            label: 'Watch: vibrato technique', label_es: 'Mira: técnica de vibrato',
            text: 'Watch: <a href="https://youtu.be/WNWqobkgdBA?t=93" target="_blank">Vibrato Technique (Hand Movement, TE-103) – JustinGuitar</a> (0:00–3:00). As you watch, try it yourself on the 5th fret of string 1 — rock the finger back and forth gently and listen for the pitch to wobble.',
            text_es: 'Mira: <a href="https://youtu.be/WNWqobkgdBA?t=93" target="_blank">Vibrato Technique (Hand Movement, TE-103) – JustinGuitar</a> (0:00–3:00). Mientras miras, pruébalo tú mismo en el traste 5 de la cuerda 1 — mece el dedo hacia adelante y atrás suavemente y escucha cómo la nota oscila.',
            hint: 'Keep the fingertip planted — the motion comes from the wrist, not from sliding along the string. Listen closely to what happens to the note while your finger rocks, and how it differs from a bend. It takes weeks to develop — just start!',
            hint_es: 'Mantén la yema plantada — el movimiento viene de la muñeca, no de deslizarte por la cuerda. Escucha con atención qué le pasa a la nota mientras tu dedo se mece, y en qué se diferencia de un bend. Toma semanas desarrollarlo — ¡solo empieza!',
            skills: [3],
            response: { type: 'mc', prompt: 'Vibrato is best described as:',
              prompt_es: 'El vibrato se describe mejor como:',
              answer: 0,
              explain: 'Vibrato is a small, controlled, repeating pitch wobble on a held note — it adds life and sustain. A one-time push up to a new pitch is a bend, not vibrato.',
              explain_es: 'El vibrato es una pequeña oscilación controlada y repetida de la altura en una nota sostenida — le agrega vida y sostenimiento. Un empujón único hacia una nueva altura es un bend, no vibrato.',
              choices: [
              'A small, controlled pitch wobble on a held note',
              'Playing two notes at the same time',
              'Bending the string up a whole step and holding it',
              'Sliding between two frets quickly'
            ],
              choices_es: [
              'Una pequeña oscilación controlada de la altura en una nota sostenida',
              'Tocar dos notas al mismo tiempo',
              'Doblar la cuerda hacia arriba un tono completo y sostenerla',
              'Deslizarse rápido entre dos trastes'
            ] }
          }
            ]
          },
          {
            title: 'Hear the blues note',
            title_es: 'Escucha la nota de blues',
            steps: [
          {
            label: 'The blues note: ♭5', label_es: 'La nota de blues: ♭5',
            text: 'Theory check: the blues scale adds one note to the minor pentatonic — the ♭5 (flat 5). In A minor, that\'s the note Eb. Click "Hear the A blues scale" below and listen for the extra note that wasn\'t in the plain minor pentatonic — that\'s the blue note.',
            text_es: 'Revisión de teoría: la escala de blues agrega una nota a la pentatónica menor — la ♭5 (quinta bemol). En A menor, esa nota es Eb. Presiona "Escucha la escala de blues de A" abajo y escucha la nota extra que no estaba en la pentatónica menor simple — esa es la nota de blues.',
            hint: 'In Pattern 1 for A minor, the ♭5 sits between the 4 and 5 on the A string — fret 6, right between the 4 at fret 5 and the 5 at fret 7. It\'s a "passing tone" — it creates tension that wants to resolve.',
            hint_es: 'En el Patrón 1 de A menor, la ♭5 se ubica entre el 4 y el 5 en la cuerda La — traste 6, justo entre el 4 en el traste 5 y el 5 en el traste 7. Es una "nota de paso" — crea tensión que quiere resolverse.',
            skills: [4],
            playSeq: { label: 'Hear the A blues scale (listen for the blue note)', label_es: 'Escucha la escala de blues de A (escucha la nota de blues)', bpm: 70, notes: [45, 48, 50, 51, 52, 55, 57] },
            response: { type: 'mc', prompt: 'What is the "blue note" added to the minor pentatonic to make a blues scale?',
              prompt_es: '¿Cuál es la "nota de blues" que se agrega a la pentatónica menor para hacer una escala de blues?',
              answer: 0,
              explain: 'The blues scale = minor pentatonic + the ♭5 (flat 5) passing tone. In A minor that\'s Eb — the note that gives blues its tension.',
              explain_es: 'La escala de blues = pentatónica menor + la nota de paso ♭5 (quinta bemol). En A menor esa es Eb — la nota que le da al blues su tensión.',
              choices: [
              'The ♭5 (flat 5)',
              'The major 3rd',
              'The ♭7 (flat 7)',
              'The 2nd'
            ],
              choices_es: [
              'La ♭5 (quinta bemol)',
              'La 3ª mayor',
              'La ♭7 (séptima bemol)',
              'La 2ª'
            ] }
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
          {
            label: 'Wrap-up: which theory clicked?', label_es: 'Cierre: ¿qué teoría tuvo sentido?',
            text: 'Station Wrap-Up — pause and think: you can now explain how the pentatonic is built, add the blues note, and use vibrato. Which piece of theory finally made sense today, and which still feels fuzzy?',
            text_es: 'Cierre de la estación — pausa y piensa: ahora puedes explicar cómo se construye la pentatónica, agregar la nota de blues, y usar vibrato. ¿Qué parte de la teoría finalmente tuvo sentido hoy, y cuál todavía se siente confusa?',
            response: { type: 'short', placeholder: 'e.g. relative major/minor made sense; the ♭5 blue note still feels random to me',
              placeholder_es: 'p. ej. la relativa mayor/menor tuvo sentido; la nota de blues ♭5 todavía se siente aleatoria para mí' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — theory in action & original solo',
        title_es: 'Estación de práctica — teoría en acción y solo original',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Tune all 6 strings', label_es: 'Afina las 6 cuerdas',
                text: 'Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                hint: 'Tuning (Module 1) is a skill you keep forever. Today you compose and perform — a clean, in-tune guitar is what makes a simple solo sound finished.',
                hint_es: 'Afinar (Módulo 1) es una destreza que conservas para siempre. Hoy compones y tocas — una guitarra limpia y afinada es lo que hace que un solo simple suene terminado.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Understand relative major & minor scales',
            title_es: 'Comprende las escalas relativas mayor y menor',
            steps: [
          {
            label: 'Challenge 1 — Relative Scales', label_es: 'Reto 1 — Escalas relativas',
            text: 'Type these into the box below:<ol><li>C major pentatonic (1 C, 2 D, 3 E, 5 G, 6 A).</li><li>Then A minor pentatonic (1 A, ♭3 C, 4 D, 5 E, ♭7 G).</li></ol>You\'ve got it when: you spot that they share the same five notes — only which note is "home" changes.',
            text_es: 'Escribe esto en el cuadro de abajo:<ol><li>C mayor pentatónica (1 C, 2 D, 3 E, 5 G, 6 A).</li><li>Y luego A menor pentatónica (1 A, ♭3 C, 4 D, 5 E, ♭7 G).</li></ol>Lo tienes cuando: notas que comparten las mismas cinco notas — solo cambia cuál nota es "nota base."',
            hint: 'C major pentatonic and A minor pentatonic share exactly the same five notes. Your hand position is the same — only which note you treat as "home" (the root) changes.',
            hint_es: 'C mayor pentatónica y A menor pentatónica comparten exactamente las mismas cinco notas. La posición de tu mano es la misma — solo cambia qué nota tratas como "nota base" (la raíz).',
            stuck: 'List the five notes once (A C D E G). Now circle A in your head and call it minor; circle C and call it major. Same notes, different home.',
            stuck_es: 'Anota las cinco notas una vez (A C D E G). Ahora encierra A en tu mente y llámala menor; encierra C y llámala mayor. Mismas notas, nota base distinta.',
            levelUp: 'Find another relative pair from memory — G major and its relative minor (E minor) — and prove they share five notes.',
            levelUp_es: 'Encuentra otro par relativo de memoria — G mayor y su relativa menor (E menor) — y comprueba que comparten cinco notas.',
            skills: [1, 2, 5],
            response: { type: 'short', placeholder: 'C major pent: C D E G A · A minor pent: A C D E G — what do you notice?',
              placeholder_es: 'C mayor pent: C D E G A · A menor pent: A C D E G — ¿qué notas?' }
          }
            ]
          },
          {
            title: 'Compose a 4-bar solo',
            title_es: 'Compón un solo de 4 compases',
            steps: [
          {
            label: 'Challenge 2 — Compose It in Scale Degrees', label_es: 'Reto 2 — Compónlo en grados de escala',
            text: '<ol><li>Write a 4-bar solo as scale-degree numbers (e.g. 1 ♭3 5 ♭3 | ♭7 5 ♭3 1 | …).</li><li>Then play exactly what you wrote, varying the rhythms.</li></ol>You\'ve got it when: a deliberate 4-bar line you can play back the same way twice. Type your 4 bars into the box below so you have them next session.',
            text_es: '<ol><li>Escribe un solo de 4 compases como números de grado de escala (p. ej. 1 ♭3 5 ♭3 | ♭7 5 ♭3 1 | …).</li><li>Luego toca exactamente lo que escribiste, variando los ritmos.</li></ol>Lo tienes cuando: una línea deliberada de 4 compases que puedes volver a tocar de la misma manera dos veces. Escribe tus 4 compases en el cuadro de abajo para tenerlos la próxima sesión.',
            hint: 'Write first, then play! It\'s okay if it sounds simple. The goal is to make a deliberate musical decision, not to improvise randomly.',
            hint_es: '¡Escribe primero, y luego toca! Está bien si suena simple. El objetivo es tomar una decisión musical deliberada, no improvisar al azar.',
            stuck: 'Start with just bar 1 — pick 4 scale degrees you like, play them, and only move on once that bar sounds good. Repeat it for bar 3 if you\'re stuck for ideas.',
            stuck_es: 'Empieza solo con el compás 1 — elige 4 grados de escala que te gusten, tócalos, y avanza solo cuando ese compás suene bien. Repítelo para el compás 3 si te faltan ideas.',
            levelUp: 'Make bar 4 answer bar 2 (end on the root, 1), or add a hammer-on or the ♭5 blue note as a passing tone somewhere.',
            levelUp_es: 'Haz que el compás 4 responda al compás 2 (termina en la raíz, 1), o agrega un hammer-on o la nota de blues ♭5 como nota de paso en algún lugar.',
            skills: [6, 7],
            response: { type: 'short', prompt: 'Write your 4-bar solo as scale-degree numbers (use | between bars):', prompt_es: 'Escribe tu solo de 4 compases como números de grado de escala (usa | entre compases):', placeholder: 'e.g. 1 ♭3 5 ♭3 | ♭7 5 ♭3 1 | 5 4 ♭3 1 | 1 — — —', placeholder_es: 'p. ej. 1 ♭3 5 ♭3 | ♭7 5 ♭3 1 | 5 4 ♭3 1 | 1 — — —' }
          }
            ]
          },
          {
            title: 'Read a lick cold',
            title_es: 'Lee un lick a primera vista',
            steps: [
          {
            label: 'Challenge — Cold Read (Knowledge & Reading)', label_es: 'Reto — Lectura a primera vista (Conocimiento y lectura)',
            text: 'Here\'s a 4-bar lick (a lick = a short solo phrase) in the A minor pentatonic box. It starts from the ascending run you already know, then turns around and comes back down a new way:<ol><li>DECODE it from the TAB first — name each string and fret, left to right.</li><li>Then play it cold, without pressing Play first.</li></ol>You\'ve got it when: you can read a short 4-bar pentatonic lick straight from TAB and play it accurately, without anyone demonstrating it first.',
            text_es: 'Aquí tienes un lick de 4 compases (un lick = una frase corta de solo) en la caja de A menor pentatónica. Empieza con el recorrido ascendente que ya conoces, y luego da la vuelta y baja de una forma nueva:<ol><li>DECODIFÍCALO del TAB primero — nombra cada cuerda y traste, de izquierda a derecha.</li><li>Luego tócalo a primera vista, sin presionar Tocar antes.</li></ol>Lo tienes cuando: puedes leer un lick pentatónico corto de 4 compases directamente del TAB y tocarlo con precisión, sin que nadie te lo demuestre primero.',
            hint: 'At the module self-assessment you\'ll read a NEW 4-bar lick cold — this is Task 2. Read before you press Play. Bottom TAB line = low E, top line = high e; the number is the fret. Say it out loud — "G string, fret 5, that\'s C" — as you go, then hit Play all to check yourself.',
            hint_es: 'En la autoevaluación del módulo vas a leer un lick de 4 compases NUEVO a primera vista — esta es la Tarea 2. Lee antes de presionar Tocar. La línea inferior del TAB = Mi grave, la línea superior = mi aguda; el número es el traste. Dilo en voz alta — "cuerda Sol, traste 5, eso es C" — mientras avanzas, y luego presiona Tocar todo para comprobarte.',
            stuck: 'Take it two notes at a time. Find the first note on the neck and play it, then the next — speed comes after the map is clear.',
            stuck_es: 'Tómalo de a dos notas. Encuentra la primera nota en el mástil y tócala, y luego la siguiente — la velocidad llega después de que el mapa esté claro.',
            levelUp: 'Read it backwards (right to left), or move the same shape to the E minor box (open-string root) and read it there.',
            levelUp_es: 'Léelo al revés (de derecha a izquierda), o mueve la misma forma a la caja de E menor (raíz en cuerda al aire) y léelo ahí.',
            skills: [8],
            tab: {
              caption: 'Cold-read lick · A minor pentatonic box · four bars',
              caption_es: 'Lick a primera vista · caja de A menor pentatónica · cuatro compases',
              notes: [
                // Bar 1 — climb from the low root
                { string: 'E', fret: 5, note: 'A', midi: 45 },
                { string: 'E', fret: 8, note: 'C', midi: 48 },
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'A', fret: 7, note: 'E', midi: 52 },
                // Bar 2 — through the middle strings
                { string: 'D', fret: 5, note: 'G', midi: 55 },
                { string: 'D', fret: 7, note: 'A', midi: 57 },
                { string: 'G', fret: 5, note: 'C', midi: 60 },
                { string: 'G', fret: 7, note: 'D', midi: 62 },
                // Bar 3 — peak and turn
                { string: 'B', fret: 5, note: 'E', midi: 64 },
                { string: 'B', fret: 8, note: 'G', midi: 67 },
                { string: 'e', fret: 5, note: 'A', midi: 69 },
                { string: 'B', fret: 8, note: 'G', midi: 67 },
                // Bar 4 — come home to the root
                { string: 'B', fret: 5, note: 'E', midi: 64 },
                { string: 'G', fret: 7, note: 'D', midi: 62 },
                { string: 'G', fret: 5, note: 'C', midi: 60 },
                { string: 'D', fret: 7, note: 'A', midi: 57 }
              ]
            }
          }
            ]
          },
          {
            title: 'Perform your original solo',
            title_es: 'Toca tu solo original',
            steps: [
          {
            label: 'Challenge 3 — Record Over the Am Jam Track (your assessment piece)', label_es: 'Reto 3 — Graba sobre la pista de jam en Am (tu pieza de evaluación)',
            text: 'Play your 4-bar solo over a core-song backing track — start with <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; the Am jam track</a> — working in at least one hammer-on, pull-off, or vibrato:<ol><li>Record your take.</li><li>Say your phrasing strategy (call-and-response or four-phrase) out loud on the recording.</li><li>Listen back.</li></ol>You\'ve got it when: you hold the backing track\'s pulse start to finish with no restarts, and you can name your phrasing strategy.',
            text_es: 'Toca tu solo de 4 compases sobre la pista de acompañamiento de una canción principal — empieza con <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; la pista de jam en Am</a> — incorporando al menos un hammer-on, pull-off, o vibrato:<ol><li>Graba tu toma.</li><li>Di en voz alta tu estrategia de fraseo (llamada y respuesta o cuatro frases) en la grabación.</li><li>Escúchala después.</li></ol>Lo tienes cuando: sostienes el pulso de la pista de principio a fin sin reiniciar, y puedes nombrar tu estrategia de fraseo.',
            hint: 'You can also pick any core song\'s ▶ &#x1F3B5; Backing track from the &#x1F3B5; Songs list at the bottom of this module. Include at least one technique (hammer-on, pull-off, or vibrato) in your solo. Don\'t just run up and down the scale — play musical ideas! Recording your take counts as performing — pressing record adds just enough pressure — and the playback shows you exactly where to tighten up.',
            hint_es: 'También puedes elegir la ▶ &#x1F3B5; Pista de acompañamiento de cualquier canción principal de la lista de &#x1F3B5; Canciones al final de este módulo. Incluye al menos una técnica (hammer-on, pull-off, o vibrato) en tu solo. ¡No solo subas y bajes la escala — toca ideas musicales! Grabar tu toma cuenta como tocar en vivo — pulsar grabar añade justo la presión necesaria — y la grabación te muestra exactamente dónde ajustar.',
            stuck: 'Drop the backing track and play your written 4 bars alone, slowly, until they\'re solid — then add the track back and just one technique.',
            stuck_es: 'Quita la pista de acompañamiento y toca tus 4 compases escritos solo, despacio, hasta que estén sólidos — y luego vuelve a agregar la pista y solo una técnica.',
            levelUp: 'Perform it standing, record a performance take, or play it for someone at home — or transpose your solo to E minor and play it from the open-string box.',
            levelUp_es: 'Tócalo de pie, graba una toma de presentación, o tócalo para alguien en casa — o transpón tu solo a E menor y tócalo desde la caja con raíz en cuerda al aire.',
            skills: [3, 6, 7]
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: reflect on your solo', label_es: 'Cierre: reflexiona sobre tu solo',
                text: 'You composed and performed an original solo — what are you proudest of, and what would make the next one better? Write it below; this is the kind of reflection your end-of-module recorded performance builds on.',
                text_es: 'Compusiste y tocaste un solo original — ¿de qué estás más orgulloso, y qué haría mejor el siguiente? Escríbelo abajo; este es el tipo de reflexión sobre el que se construye tu presentación grabada de fin de módulo.',
                response: { type: 'short', placeholder: 'e.g. proud it resolved on the root; next time I\'ll leave more space between phrases',
                  placeholder_es: 'p. ej. orgulloso de que resolvió en la raíz; la próxima vez voy a dejar más espacio entre frases' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Module-end (two tasks): (1) Perform an original 4-bar solo over a course-song backing track, holding the track\'s pulse start to finish — use the full minor pentatonic box, include at least one hammer-on, pull-off, or vibrato, and follow a named phrasing strategy (call-and-response or four-phrase). (2) Read a short 4-bar pentatonic lick from TAB and play it.',
      goal_es: 'Fin de módulo (dos tareas): (1) Toca un solo original de 4 compases sobre la pista de acompañamiento de una canción del curso, sosteniendo el pulso de la pista de principio a fin — usa la caja completa de pentatónica menor, incluye al menos un hammer-on, pull-off, o vibrato, y sigue una estrategia de fraseo nombrada (llamada y respuesta o cuatro frases). (2) Lee un lick pentatónico corto de 4 compases del TAB y tócalo.',
      performance: 'Solo: record your original 4-bar solo over a core-song backing track, saying your phrasing strategy (call-and-response or four-phrase) out loud on the recording, then listen back; then sight-read and play a short 4-bar pentatonic lick from TAB.',
      selfCheck: 'Can you explain the difference between major and minor pentatonic? Can you add the blues note? Can you perform your original solo without looking at your notes?',
      selfCheck_es: '¿Puedes explicar la diferencia entre pentatónica mayor y menor? ¿Puedes agregar la nota de blues? ¿Puedes tocar tu solo original sin mirar tus notas?',
      standards: ['Cr.1a', 'Cr.2a', 'Pr.6a']
    },

    skills: [
      { id: 'm4w3-s1', text: 'Explain what a major pentatonic scale is (degrees 1 2 3 5 6)',
        text_es: 'Explicar qué es una escala pentatónica mayor (grados 1 2 3 5 6)',
        gotItWhen: 'you can list the scale degrees from memory and name the 5 notes in any major key you pick.',
        gotItWhen_es: 'puedes enumerar los grados de la escala de memoria y nombrar las 5 notas en cualquier tonalidad mayor que elijas.',
        practice: { type: 'mc', prompt: 'Which scale degrees make up a MAJOR pentatonic scale?',
          prompt_es: '¿Qué grados de escala forman una escala pentatónica MAYOR?',
          choices: ['1 2 3 4 5', '1 2 3 5 6', '1 ♭3 4 5 ♭7', '1 3 5 7 9'], choices_es: ['1 2 3 4 5', '1 2 3 5 6', '1 ♭3 4 5 ♭7', '1 3 5 7 9'], answer: 1,
          explain: 'Major pentatonic is the major scale with the 4th and 7th removed, leaving 1 2 3 5 6 — five notes, which is what "pentatonic" means. 1 2 3 4 5 is just the first five degrees in a row, not a pentatonic scale.',
          explain_es: 'La pentatónica mayor es la escala mayor sin el 4º ni el 7º grado, y quedan 1 2 3 5 6 — cinco notas, que es justo lo que significa "pentatónica". 1 2 3 4 5 son solo los primeros cinco grados seguidos, no una escala pentatónica.' } },
      { id: 'm4w3-s2', text: 'Explain what a minor pentatonic scale is (degrees 1 ♭3 4 5 ♭7)',
        text_es: 'Explicar qué es una escala pentatónica menor (grados 1 ♭3 4 5 ♭7)',
        gotItWhen: 'you can list the minor pentatonic degrees from memory and explain why two of them are flatted compared to the major scale.',
        gotItWhen_es: 'puedes enumerar los grados de la pentatónica menor de memoria y explicar por qué dos de ellos están bemolizados en comparación con la escala mayor.',
        practice: { type: 'mc', prompt: 'Which scale degrees make up a MINOR pentatonic scale?',
          prompt_es: '¿Qué grados de escala forman una escala pentatónica MENOR?',
          choices: ['1 2 3 5 6', '1 ♭3 4 5 ♭7', '1 ♭3 4 ♭5 ♭7', '1 ♭2 ♭3 5 ♭7'], choices_es: ['1 2 3 5 6', '1 ♭3 4 5 ♭7', '1 ♭3 4 ♭5 ♭7', '1 ♭2 ♭3 5 ♭7'], answer: 1,
          explain: 'Minor pentatonic is 1 ♭3 4 5 ♭7, and it\'s the flatted 3rd that makes it sound minor. Adding a ♭5 on top of those gives you the blues scale — six notes, so it can\'t be the pentatonic.',
          explain_es: 'La pentatónica menor es 1 ♭3 4 5 ♭7, y es la 3ª bemol la que la hace sonar menor. Agregar una ♭5 encima de esas te da la escala de blues — seis notas, así que no puede ser la pentatónica.' } },
      { id: 'm4w3-s3', text: 'Add vibrato on at least one sustained note',
        text_es: 'Agregar vibrato en al menos una nota sostenida',
        gotItWhen: 'your finger rocks back and forth on a sustained note and the pitch wobbles intentionally — not from shaking nerves.',
        gotItWhen_es: 'tu dedo se mece hacia adelante y atrás en una nota sostenida y la altura oscila intencionalmente — no por nervios que hacen temblar la mano.',
        practice: { type: 'mc', prompt: 'Your vibrato sounds like nervous shaking instead of music. What\'s the fix?',
          prompt_es: 'Tu vibrato suena como un temblor nervioso en vez de música. ¿Cuál es el arreglo?',
          choices: ['Shake your whole hand faster', 'Slide your finger along the string to a new fret', 'Press harder so the note can\'t move at all', 'Slow down — rock the finger in an even, repeating rhythm'],
          choices_es: ['Sacudir toda tu mano más rápido', 'Deslizar tu dedo a lo largo de la cuerda hasta un traste nuevo', 'Presionar más fuerte para que la nota no pueda moverse', 'Ir más despacio — mecer el dedo en un ritmo parejo y repetido'], answer: 3,
          explain: 'Good vibrato is a controlled, even wobble; speed comes later. Sliding changes frets, and pressing harder kills the movement entirely.',
          explain_es: 'El buen vibrato es una oscilación controlada y pareja; la velocidad viene después. Deslizar cambia de traste, y presionar más fuerte mata el movimiento por completo.' } },
      { id: 'm4w3-s4', text: 'Identify and play the ♭5 blues note within Pattern 1',
        text_es: 'Identificar y tocar la nota de blues ♭5 dentro del Patrón 1',
        gotItWhen: 'you can find the ♭5 anywhere in Pattern 1 and use it as a passing tone — not a landing point.',
        gotItWhen_es: 'puedes encontrar la ♭5 en cualquier parte del Patrón 1 y usarla como nota de paso — no como punto de aterrizaje.',
        practice: { type: 'mc', prompt: 'In A minor pentatonic, what is the ♭5 "blues note"?',
          prompt_es: 'En A menor pentatónica, ¿cuál es la "nota de blues" ♭5?',
          choices: ['D♭', 'D', 'E♭', 'E'], choices_es: ['D♭', 'D', 'E♭', 'E'], answer: 2,
          explain: 'Counting up from A, the 5th degree is E, so the ♭5 is E lowered a half step (one fret) to E♭. D is tempting because it\'s right next door in the scale, but D is degree 4.',
          explain_es: 'Contando desde A, el grado 5 es E, así que la ♭5 es E bajado un semitono (un traste) hasta E♭. D es tentador porque está justo al lado en la escala, pero D es el grado 4.' } },
      { id: 'm4w3-s5', text: 'Explain how C major pentatonic and A minor pentatonic are relative scales',
        text_es: 'Explicar cómo C mayor pentatónica y A menor pentatónica son escalas relativas',
        gotItWhen: 'you can explain that they share the same 5 notes — only the root changes — and prove it on the fretboard.',
        gotItWhen_es: 'puedes explicar que comparten las mismas 5 notas — solo cambia la raíz — y comprobarlo en el diapasón.',
        practice: { type: 'mc', prompt: 'C major pentatonic and A minor pentatonic contain the exact same 5 notes. What\'s different between them?',
          prompt_es: 'C mayor pentatónica y A menor pentatónica contienen exactamente las mismas 5 notas. ¿Qué es diferente entre ellas?',
          choices: ['Which note feels like "home" (the root)', 'They use different hand shapes', 'A minor has 6 notes, C major has 5', 'They\'re played on different strings'], choices_es: ['Qué nota se siente como "nota base" (la raíz)', 'Usan formas de mano diferentes', 'A menor tiene 6 notas, C mayor tiene 5', 'Se tocan en cuerdas diferentes'], answer: 0,
          explain: 'Relative scales share every note — the only thing that changes is which one your ear treats as home. Same frets, same hand shape, different landing note, and that alone flips the mood from bright to dark.',
          explain_es: 'Las escalas relativas comparten todas las notas — lo único que cambia es cuál trata tu oído como nota base. Los mismos trastes, la misma forma de la mano, distinta nota de aterrizaje, y solo eso cambia el ánimo de brillante a oscuro.' } },
      { id: 'm4w3-s6', text: 'Compose and write out a 4-bar original solo using scale degrees',
        text_es: 'Componer y escribir un solo original de 4 compases usando grados de escala',
        gotItWhen: 'you have 4 bars written down in scale-degree numbers and you can play exactly what you wrote — not improvise something different.',
        gotItWhen_es: 'tienes 4 compases escritos en números de grado de escala y puedes tocar exactamente lo que escribiste — no improvisar algo distinto.',
        practice: { type: 'mc', prompt: 'You\'re writing your solo in scale degrees. In A minor pentatonic (A · C · D · E · G), which note is degree 4?',
          prompt_es: 'Estás escribiendo tu solo en grados de escala. En A menor pentatónica (A · C · D · E · G), ¿qué nota es el grado 4?',
          choices: ['C', 'D', 'E', 'G'],
          choices_es: ['C', 'D', 'E', 'G'], answer: 1,
          explain: 'Count from the root: 1=A, ♭3=C, 4=D, 5=E, ♭7=G. Writing in degrees is what lets you move the same solo to any key.',
          explain_es: 'Cuenta desde la raíz: 1=A, ♭3=C, 4=D, 5=E, ♭7=G. Escribir en grados es lo que te permite mover el mismo solo a cualquier tonalidad.' } },
      { id: 'm4w3-s7', text: 'Perform the original solo over a course song backing track from memory, holding the track\'s pulse',
        text_es: 'Tocar el solo original sobre la pista de acompañamiento de una canción del curso de memoria, sosteniendo el pulso de la pista',
        gotItWhen: 'you can play your 4-bar solo all the way through with the backing track — holding its pulse with no restarts — and name your phrasing strategy (call-and-response or four-phrase).',
        gotItWhen_es: 'puedes tocar tu solo de 4 compases de principio a fin con la pista de acompañamiento — sosteniendo su pulso sin reiniciar — y nombrar tu estrategia de fraseo (llamada y respuesta o cuatro frases).',
        practice: { type: 'pr', prompt: '<ol><li>Play your 4-bar solo over the backing track, holding its pulse.</li><li>Count how many times in a row you get through with no restart.</li><li>Log your best streak.</li></ol>',
          prompt_es: '<ol><li>Toca tu solo de 4 compases sobre la pista de acompañamiento, sosteniendo su pulso.</li><li>Cuenta cuántas veces seguidas puedes completarlo sin reiniciar.</li><li>Anota tu mejor racha.</li></ol>',
          unit: 'count', placeholder: 'e.g. 3 in a row — try for a longer streak', placeholder_es: 'p. ej. 3 seguidas — intenta una racha más larga' } },
      { id: 'm4w3-s8', text: 'Sight-read a short 4-bar pentatonic lick from TAB and play it',
        text_es: 'Leer a primera vista un lick pentatónico corto de 4 compases del TAB y tocarlo',
        gotItWhen: 'you can decode a 4-bar pentatonic lick straight from the TAB — reading it cold, without hearing it first — and play it accurately without anyone demonstrating it.',
        gotItWhen_es: 'puedes decodificar un lick pentatónico de 4 compases directamente del TAB — leyéndolo a primera vista, sin escucharlo antes — y tocarlo con precisión sin que nadie te lo demuestre.',
        practice: { type: 'mc', prompt: 'A TAB line shows "5 7" on the G-string line. What do those numbers tell you?',
          prompt_es: 'Una línea de TAB muestra "5 7" en la línea de la cuerda Sol. ¿Qué te dicen esos números?',
          choices: ['Which frets to press on the G string — fret 5, then fret 7', 'Which fingers to use — like the numbers on a chord diagram', 'How many times to pick each note', 'Which beats of the bar the notes land on'],
          choices_es: ['Qué trastes presionar en la cuerda Sol — el traste 5, y luego el 7', 'Qué dedos usar — como los números en un diagrama de acorde', 'Cuántas veces pulsar cada nota', 'En qué tiempos del compás caen las notas'], answer: 0,
          explain: 'In TAB, numbers are always FRETS on the string that line represents. (In chord diagrams numbers mean fingers — that\'s the classic mix-up.)',
          explain_es: 'En el TAB, los números siempre son TRASTES en la cuerda que representa esa línea. (En los diagramas de acorde los números significan dedos — esa es la confusión clásica.)' } }
    ]
  }

); // end module-4.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[4] = [
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Full solo using Am pentatonic across 4 strings', meta_es: 'Solo completo usando Am pentatónica en 4 cuerdas', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8',
        backingUrl: 'https://www.youtube.com/watch?v=einl3CzAp1E',
        backingKey: 'Am' },
      { name: '"the cure" — Olivia Rodrigo', meta: 'Full solo · A minor pentatonic', meta_es: 'Solo completo · A menor pentatónica', type: 'Core', core: true, journeyUrl: 'tabs/the-cure.html',
        originalUrl: 'https://www.youtube.com/watch?v=B402rKl4bUg',
        tutorialUrl: 'https://www.youtube.com/watch?v=adW_zSkClaY',
        backingUrl: 'https://www.youtube.com/watch?v=4M-RBg-ULb8&start=16',
        backingKey: 'Am' },
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Full solo over D–C–G · E minor pentatonic', meta_es: 'Solo completo sobre D–C–G · E menor pentatónica', type: 'Core', core: true, journeyUrl: 'tabs/sweet-child-o-mine.html',
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0ASVeXINKYM&start=282&end=938',
        backingUrl: 'https://www.youtube.com/watch?v=AFbg4SgEwBg',
        backingKey: 'Em' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'E minor pentatonic solo', meta_es: 'Solo en E menor pentatónica', type: 'Core', core: true, journeyUrl: 'tabs/seven-nation-army.html',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw',
        backingUrl: 'https://www.youtube.com/watch?v=6WBzxOEH7hI',
        backingKey: 'Em' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: 'Full solo using Dm pentatonic (root D, low E fret 10)', meta_es: 'Solo completo usando Dm pentatónica (raíz D, Mi grave traste 10)', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok',
        backingUrl: 'https://www.youtube.com/watch?v=wBxFnX_V9mQ&start=84',
        backingKey: 'Dm' },
      { name: '"Let It Be" — The Beatles', meta: 'Am / C-major pentatonic solo over C–G–Am–F', meta_es: 'Solo en Am / C mayor pentatónica sobre C–G–Am–F', type: 'Core', core: true, journeyUrl: 'tabs/let-it-be.html',
        originalUrl: 'https://www.youtube.com/watch?v=CGj85pVzRJs',
        tutorialUrl: 'https://www.youtube.com/watch?v=_Kw4subj5z8',
        backingUrl: 'https://www.youtube.com/watch?v=bCl8YuqHURE',
        backingKey: 'C' },
      { name: '"Happy Birthday"', meta: 'Full melodic reharmonization using pentatonic (optional)', meta_es: 'Rearmonización melódica completa usando pentatónica (opcional)', type: 'Supp', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w&start=46' },
      { name: '"12-bar blues in E"', meta: 'E minor pentatonic — classic improv context', meta_es: 'E menor pentatónica — contexto clásico de improvisación', type: 'Choice', core: false, level: 1,
        tutorialUrl: 'https://www.youtube.com/watch?v=pJL2j2v6XZM' },
      { name: '"La Bamba" — Ritchie Valens', meta: 'C major pentatonic — bright and fun', meta_es: 'C mayor pentatónica — brillante y divertida', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=BycLmWI97Nc',
        tutorialUrl: 'https://www.youtube.com/watch?v=o-SdTXIAvTE&start=52' },
      { name: '"Back in Black" — AC/DC', meta: 'Simplified solo intro — A minor pentatonic', meta_es: 'Intro de solo simplificada — A menor pentatónica', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=pAgnJDJN4VA',
        tutorialUrl: 'https://www.youtube.com/watch?v=aeYDJciDuao' },
      { name: '"Boom Boom" — John Lee Hooker', meta: 'E blues pentatonic — call and response phrasing', meta_es: 'E blues pentatónica — fraseo de llamada y respuesta', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=jZv04xAejrc',
        tutorialUrl: 'https://www.youtube.com/watch?v=dutLP1SoSLs' },
      { name: '"Purple Haze" — Jimi Hendrix', meta: 'E pentatonic box — full pattern', meta_es: 'Caja de E pentatónica — patrón completo', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=WGoDaYjdfSg',
        tutorialUrl: 'https://www.youtube.com/watch?v=gKhmARXdWGE&start=8' }
    ];

MODULE_REVIEWS[4] = {
  moduleNum: 4,
  module: 'Major / Minor / Blues Pentatonic Scales',
  module_es: 'Escalas pentatónicas mayor, menor y de blues',
  skills: [
    { id: 'mr4-s1', text: 'I can play Pentatonic Pattern 1 ascending AND descending from memory — no diagram, no missed notes or hesitations',
      text_es: 'Puedo tocar el Patrón pentatónico 1 subiendo Y bajando de memoria — sin diagrama, sin notas falladas ni dudas', set: 'm4w1' },
    { id: 'mr4-s2', text: 'I can use alternate picking (down-up) automatically at 60 BPM, every note on a beat, without losing the click',
      text_es: 'Puedo usar púa alterna (abajo-arriba) automáticamente a 60 BPM, cada nota en un tiempo, sin perder el clic', set: 'm4w1' },
    { id: 'mr4-s3', text: 'I can position Pattern 1 as a MINOR scale (1st finger on root) or a MAJOR scale (4th finger on root) on demand from any named key',
      text_es: 'Puedo posicionar el Patrón 1 como escala MENOR (dedo índice en la raíz) o escala MAYOR (dedo meñique en la raíz) a pedido desde cualquier tonalidad nombrada', set: 'm4w1' },
    { id: 'mr4-s6', text: 'I can perform a hammer-on and a pull-off',
      text_es: 'Puedo ejecutar un hammer-on y un pull-off', set: 'm4w2' },
    { id: 'mr4-s7', text: 'I can name all natural notes on the D string (frets 0–10) and the G string (frets 0–10)',
      text_es: 'Puedo nombrar todas las notas naturales en la cuerda Re (trastes 0–10) y la cuerda Sol (trastes 0–10)', set: 'm4w2' },
    { id: 'mr4-s5', text: 'I can play the same note quiet, medium and loud on purpose (p, mf, f), and change its tone by moving my picking hand between the bridge and the neck',
      text_es: 'Puedo tocar la misma nota suave, media y fuerte a propósito (p, mf, f), y cambiar su tono moviendo mi mano de pulsar entre el puente y el mástil', set: 'm4w2' },
    { id: 'mr4-s9', text: 'I can add an intentional vibrato on a sustained note',
      text_es: 'Puedo agregar un vibrato intencional en una nota sostenida', set: 'm4w3' },
    { id: 'mr4-s8', text: 'I can explain how major (1 2 3 5 6) and minor (1 ♭3 4 5 ♭7) pentatonic are built, that they\'re relative (same 5 notes), and where the ♭5 blue note goes',
      text_es: 'Puedo explicar cómo se construyen la pentatónica mayor (1 2 3 5 6) y menor (1 ♭3 4 5 ♭7), que son relativas (mismas 5 notas), y dónde va la nota de blues ♭5', set: 'm4w3' },
    { id: 'mr4-s10', text: 'I can perform my original 4-bar solo over a backing track from memory — holding its pulse with no restarts, working in at least one hammer-on, pull-off, or vibrato, and naming my phrasing strategy',
      text_es: 'Puedo tocar mi solo original de 4 compases sobre una pista de acompañamiento de memoria — sosteniendo su pulso sin reiniciar, incorporando al menos un hammer-on, pull-off, o vibrato, y nombrando mi estrategia de fraseo', set: 'm4w3' },
    { id: 'mr4-s11', text: 'I can read a short 4-bar pentatonic lick from TAB that I haven\'t practiced and play it accurately',
      text_es: 'Puedo leer un lick pentatónico corto de 4 compases del TAB que no he practicado y tocarlo con precisión', set: 'm4w3' }
  ],
  assessItems: [
    'Perform an original 4-bar solo over a course-song backing track, holding its pulse with no restarts, using the minor pentatonic box and at least one hammer-on, pull-off, or vibrato, with clean notes throughout (no buzz or dead notes — high strings included), following a named phrasing strategy (call-and-response or four-phrase)',
    'Read a short 4-bar pentatonic lick from TAB and play it accurately'
  ],
  assessItems_es: [
    'Toca un solo original de 4 compases sobre la pista de acompañamiento de una canción del curso, sosteniendo su pulso sin reiniciar, usando la caja de pentatónica menor y al menos un hammer-on, pull-off, o vibrato, con notas limpias en todo momento (sin zumbido ni notas apagadas — cuerdas agudas incluidas), siguiendo una estrategia de fraseo nombrada (llamada y respuesta o cuatro frases)',
    'Lee un lick pentatónico corto de 4 compases del TAB y tócalo con precisión'
  ],
  forward: 'Those single pentatonic notes you\'ve been soloing with don\'t disappear in <strong>Module 5</strong> — you stack them. The open chords you\'ll build there (Am, C, G, D…) are made of these same notes. And the clean fretting and finger independence you sharpened here are exactly what makes a chord ring without buzzing. You\'ll go from playing one note at a time to playing five at once.',
  forward_es: 'Esas notas pentatónicas individuales con las que has estado improvisando no desaparecen en el <strong>Módulo 5</strong> — las apilas. Los acordes abiertos que vas a construir ahí (Am, C, G, D…) están hechos de estas mismas notas. Y el trasteo limpio y la independencia de dedos que perfeccionaste aquí son exactamente lo que hace que un acorde suene sin zumbido. Vas a pasar de tocar una nota a la vez a tocar cinco a la vez.',
  standards: ['Cr.1a', 'Cr.2a', 'Pr.4a', 'Pr.5a', 'Pr.5b', 'Pr.6a']
};
