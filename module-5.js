// ============================================================
//  MODULE 5 — Major / Minor / Blues Pentatonic Scales
//  Edit this file to change Module 5 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm5w1',
    songThread: [{ name: '"Seven Nation Army"', journey: 'tabs/seven-nation-army.html', layer: 5, note: 'solo over the riff' }, { name: '"All Along the Watchtower"', journey: 'tabs/all-along-the-watchtower.html', layer: 5, note: 'improvise over its backing track' }, { name: '"Luna"', journey: 'tabs/luna.html', layer: 5, note: 'Dm pentatonic in its highest box' }],
    label: 'Set 1',
    locked: false,
    module: 'Major / Minor / Blues Pentatonic Scales',
    moduleNum: 5,
    unit: 'Module 5 · Major / Minor / Blues Pentatonic Scales',
    unit_es: 'Módulo 5 · Escalas pentatónicas mayor, menor y de blues',
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
            title: 'Watch: minor and major pentatonic',
            title_es: 'Mira: pentatónica menor y mayor',
            steps: [
          {
            label: 'Watch: minor pentatonic scale', label_es: 'Mira: pentatónica menor',
            text: 'A pentatonic scale is a scale with five notes. The shape in this video is called Pattern 1.<ol><li>Watch: <a href="https://www.youtube.com/watch?v=l6ayje1ug_0" target="_blank">The Minor Pentatonic Scale on Guitar Explained – Lauren Bateman (0:00–5:00)</a>.</li><li>Play along on your guitar. Pause and find each note before she names it.</li></ol>You\'ve got it when: you play the whole shape up and back once along with the video, every note ringing.',
            text_es: 'Una escala pentatónica es una escala de cinco notas. La forma de este video se llama Patrón 1.<ol><li>Mira: <a href="https://www.youtube.com/watch?v=l6ayje1ug_0" target="_blank">The Minor Pentatonic Scale on Guitar Explained – Lauren Bateman (0:00–5:00)</a>.</li><li>Toca junto con ella en tu guitarra. Pausa y encuentra cada nota antes de que ella la nombre.</li></ol>Lo tienes cuando: tocas toda la forma subiendo y bajando una vez junto con el video, con cada nota sonando.',
            hint: 'Pause after each string. Copy her fingers before you go on.',
            hint_es: 'Pausa después de cada cuerda. Copia sus dedos antes de seguir.',
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
            text: '<ol><li>Watch: <a href="https://youtu.be/m_IiyJu60-c?t=105" target="_blank">Major Pentatonic Scale – Marty Music</a> from 1:45 to about 4:00. The link starts at 1:45.</li><li>Find the root note on your guitar.</li><li>Play the shape up once, then back down.</li></ol>You\'ve got it when: you play the shape up and back twice, every note ringing.',
            text_es: '<ol><li>Mira: <a href="https://youtu.be/m_IiyJu60-c?t=105" target="_blank">Major Pentatonic Scale – Marty Music</a> desde 1:45 hasta cerca de 4:00. El enlace empieza en 1:45.</li><li>Encuentra la nota raíz en tu guitarra.</li><li>Toca la forma una vez subiendo, y luego bajando.</li></ol>Lo tienes cuando: tocas la forma subiendo y bajando dos veces, con cada nota sonando.',
            hint: 'Look at the Pattern 1 shape. Find the root note in it.',
            hint_es: 'Mira la forma del Patrón 1. Encuentra la nota raíz.',
            skills: [1, 4],
          }
            ]
          },
          {
            title: 'Position the pattern yourself',
            title_es: 'Posiciona el patrón tú mismo',
            steps: [
          {
            label: 'Position Pattern 1 as C major', label_es: 'Posiciona el Patrón 1 en C mayor',
            text: 'The picture shows a box: the block of frets a scale shape covers. Use this box as C major pentatonic.<ol><li>Put your pinky on fret 8 of the low E string. That note is C.</li><li>Play the box in the picture up and down, slowly.</li><li>Press "Hear C major pentatonic" below and compare.</li></ol>The solid dots in the picture mark A. For C major the root is C: your pinky at fret 8 on the low E and high e strings. You\'ve got it when: you play the box up and back twice in a row, and your pinky lands on fret 8 both times.<span class="step-figure"><img src="img/m4-pentatonic-box1-en.svg" alt="Fretboard diagram of A minor pentatonic Pattern 1, frets 5 to 8: finger 1 on fret 5 of every string, finger 4 on fret 8 of the low E, B, and high e strings, and finger 3 on fret 7 of the A, D, and G strings. The root note A is marked solid at fret 5 on the low E and high e strings and at fret 7 on the D string." width="640" height="244"></span>',
            text_es: 'El dibujo muestra una caja: el bloque de trastes que cubre la forma de una escala. Usa esta caja como C mayor pentatónica.<ol><li>Pon tu meñique en el traste 8 de la cuerda Mi grave. Esa nota es C.</li><li>Toca la caja del dibujo subiendo y bajando, despacio.</li><li>Presiona "Escucha C mayor pentatónica" abajo y compara.</li></ol>Los puntos sólidos del dibujo marcan A. Para C mayor la raíz es C: tu meñique en el traste 8 de las cuerdas Mi grave y mi aguda. Lo tienes cuando: tocas la caja subiendo y bajando dos veces seguidas, y tu meñique cae en el traste 8 las dos veces.<span class="step-figure"><img src="img/m4-pentatonic-box1-es.svg" alt="Diagrama del diapasón del Patrón 1 de A menor pentatónica, trastes 5 a 8: el dedo 1 en el traste 5 de todas las cuerdas, el dedo 4 en el traste 8 de las cuerdas Mi grave, Si y mi aguda, y el dedo 3 en el traste 7 de las cuerdas La, Re y Sol. La nota raíz A está marcada en sólido en el traste 5 de la Mi grave y la mi aguda, y en el traste 7 de la cuerda Re." width="640" height="244"></span>',
            hint: 'Major and minor use the same shape. Only the finger on the root changes.',
            hint_es: 'Mayor y menor usan la misma forma. Solo cambia el dedo que va en la raíz.',
            skills: [3, 4],
            playSeq: { label: 'Hear C major pentatonic', label_es: 'Escucha C mayor pentatónica', bpm: 60, notes: [48, 50, 52, 55, 57, 60] },
            response: { type: 'mc', prompt: 'You set Pattern 1 up for major. Your pinky is on the low E string at fret 3. Which major pentatonic are you playing?',
              prompt_es: 'Preparas el Patrón 1 para mayor. Tu meñique está en la cuerda Mi grave, traste 3. ¿Qué pentatónica mayor estás tocando?',
              answer: 0,
              explain: 'In the major setup, the pinky is on the root. The low E string at fret 3 is G, so this is G major pentatonic. The open low E string is E. E minor uses the same notes, with E as the root.',
              explain_es: 'En la posición mayor, el meñique está en la raíz. La cuerda Mi grave en el traste 3 es G, así que es G mayor pentatónica. La cuerda Mi grave al aire es E. E menor usa las mismas notas, con E como raíz.',
              choices: [
              'G major',
              'E major',
              'C major',
              'A major'
            ],
              choices_es: [
              'G mayor',
              'E mayor',
              'C mayor',
              'A mayor'
            ] }
          }
            ]
          },
          {
            title: 'Listen: major and minor moods',
            title_es: 'Escucha: ánimo mayor y menor',
            steps: [
          {
            label: 'Listen: major vs. minor moods', label_es: 'Escucha: ánimo mayor vs. menor',
            text: 'The scale a player picks changes how a solo feels. Listen to both clips all the way through: <a href="https://www.youtube.com/watch?v=BycLmWI97Nc" target="_blank" data-ext="1">Clip 1 — "La Bamba"</a> · <a href="https://www.youtube.com/watch?v=kpC69qIe02E" target="_blank" data-ext="1">Clip 2 — "The Thrill Is Gone"</a>. Then answer the question below.',
            text_es: 'La escala que elige quien toca cambia cómo se siente un solo. Escucha completos los dos clips: <a href="https://www.youtube.com/watch?v=BycLmWI97Nc" target="_blank" data-ext="1">Clip 1 — "La Bamba"</a> · <a href="https://www.youtube.com/watch?v=kpC69qIe02E" target="_blank" data-ext="1">Clip 2 — "The Thrill Is Gone"</a>. Luego responde la pregunta de abajo.',
            hint: 'Listen for the mood: bright, or dark?',
            hint_es: 'Escucha el ánimo: ¿brillante u oscuro?',
            response: { type: 'mc', prompt: 'Which solo sounds darker / more "blues"?',
              prompt_es: '¿Qué solo suena más oscuro / más "blues"?',
              answer: 1,
              explain: 'Clip 2 is darker. It uses the minor / blues scale. Clip 1 uses the major pentatonic, which sounds brighter. The scale sets the mood. If they sounded the same, play them one right after the other and listen for the mood, not the speed.',
              explain_es: 'El Clip 2 es más oscuro. Usa la escala menor / blues. El Clip 1 usa la pentatónica mayor, que suena más brillante. La escala define el ánimo. Si te sonaron iguales, escúchalos uno justo después del otro y fíjate en el ánimo, no en la velocidad.',
              choices: [
              'Clip 1',
              'Clip 2',
              'They sound the same'
            ],
              choices_es: [
              'Clip 1',
              'Clip 2',
              'Suenan igual'
            ] }
          },
          {
            label: 'Name the mood of each clip', label_es: 'Nombra el ánimo de cada clip',
            text: 'Name the mood of each clip above in one word.',
            text_es: 'Nombra el ánimo de cada clip de arriba con una palabra.',
            hint: 'Use words like "bright," "happy," "dark," "sad," or "moody."',
            hint_es: 'Usa palabras como "brillante," "alegre," "oscuro," "triste," o "melancólico."',
            response: { type: 'short', prompt: 'In one word, describe the mood of each clip.', prompt_es: 'En una palabra, describe el estado de ánimo de cada clip.', placeholder: 'Clip 1: ____   ·   Clip 2: ____', placeholder_es: 'Clip 1: ____   ·   Clip 2: ____' }
          }
            ]
          },
          {
            kind: 'reflection',
            title: 'Checkpoint',
            title_es: 'Punto de control',
            steps: [
          {
            label: 'Wrap-up: the finger or the sound?', label_es: 'Cierre: ¿el dedo o el sonido?',
            text: 'Checkpoint — pause and think: when you positioned Pattern 1 today, what told you whether you were set up for MAJOR or MINOR — the finger on the root, or the sound? Which felt more reliable?',
            text_es: 'Punto de control — pausa y piensa: cuando posicionaste el Patrón 1 hoy, ¿qué te decía si estabas listo para MAYOR o para MENOR — el dedo en la raíz, o el sonido? ¿Cuál se sintió más confiable?',
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
            kind: 'tuning-warmup',
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
          /* Two steps INSERTED ahead of the fret-5 climb (2026-09-20): the
             same shape is much easier to meet at the open strings first,
             where the nut does the work of the index finger. Nobody has
             reached Module 3 yet, so Modules 3-6 may gain a step inside an
             existing section. Unnumbered on purpose — the section's
             "Challenge 1" keeps its number. */
          {
            label: 'The shape at the open strings', label_es: 'La forma en las cuerdas al aire',
            text: 'Start Pattern 1 at the open strings. Here the nut does the job your index finger does later.<ol><li>Play the notes in the picture one string at a time, low to high.</li><li>Play it back down.</li></ol>Here the shape is E minor pentatonic. It has four of the five notes in the "Seven Nation Army" riff: E, G, D and B. You\'ve got it when: you play it up and back two times, every note ringing, without looking at the diagram.<span class="step-figure"><img src="img/m4-em-pentatonic-open.svg" alt="A six-string fretboard diagram with the open-position E minor pentatonic scale circled: low E open and fret 3, A open and fret 2, D open and fret 2, G open and fret 2, B open and fret 3, high e open and fret 3." width="640" height="244"></span>',
            text_es: 'Empieza el Patrón 1 en las cuerdas al aire. Aquí la cejuela hace el trabajo que más adelante hace tu dedo índice.<ol><li>Toca las notas del dibujo una cuerda a la vez, de grave a aguda.</li><li>Tócalo de regreso hacia abajo.</li></ol>Aquí la forma es E menor pentatónica. Tiene cuatro de las cinco notas del riff de "Seven Nation Army": E, G, D y B. Lo tienes cuando: la tocas subiendo y bajando dos veces, con cada nota sonando, sin mirar el diagrama.<span class="step-figure"><img src="img/m4-em-pentatonic-open-es.svg" alt="Un diagrama del diapasón de seis cuerdas con la escala pentatónica de E menor en posición abierta marcada: Mi grave al aire y traste 3, La al aire y traste 2, Re al aire y traste 2, Sol al aire y traste 2, Si al aire y traste 3, mi aguda al aire y traste 3." width="640" height="244"></span>',
            hint: 'An open string counts as part of the shape. Only six of the twelve notes need a finger at all.',
            hint_es: 'Una cuerda al aire cuenta como parte de la forma. Solo seis de las doce notas necesitan un dedo.',
            skills: [1],
            playSeq: { label: 'Hear it', label_es: 'Escúchalo', bpm: 60, notes: [40, 43, 45, 47, 50, 52, 55, 57, 59, 62, 64, 67] }
          },
          {
            label: 'The same shape at fret 5', label_es: 'La misma forma en el traste 5',
            text: 'Move the whole shape up five frets. Now your index finger does the job of the nut.<ol><li>Play each fret-5 note with your index finger, one string at a time.</li><li>Fret 2 becomes fret 7. Use your ring finger.</li><li>Fret 3 becomes fret 8. Use your pinky.</li><li>Play it up and back.</li></ol>Here the shape is A minor pentatonic. The rest of this set uses it. You\'ve got it when: you play it up and back two times at fret 5 with no open strings ringing.',
            text_es: 'Mueve toda la forma cinco trastes hacia arriba. Ahora tu dedo índice hace el trabajo de la cejuela.<ol><li>Toca cada nota del traste 5 con tu dedo índice, una cuerda a la vez.</li><li>El traste 2 pasa a ser el traste 7. Usa tu dedo anular.</li><li>El traste 3 pasa a ser el traste 8. Usa tu meñique.</li><li>Tócalo subiendo y bajando.</li></ol>Aquí la forma es A menor pentatónica. El resto de esta unidad la usa. Lo tienes cuando: la tocas subiendo y bajando dos veces en el traste 5 sin que suene ninguna cuerda al aire.',
            hint: 'Same shape, same order. Only the starting fret changed, so the scale has a new name.',
            hint_es: 'La misma forma, el mismo orden. Solo cambió el traste de inicio, así que la escala tiene otro nombre.',
            stuck: 'Play the open version once, then the fret-5 version once. They sound like the same tune, only higher.',
            stuck_es: 'Toca la versión al aire una vez, y luego la del traste 5 una vez. Suenan como la misma melodía, solo que más aguda.',
            skills: [1, 3]
          },
          {
            label: 'Challenge 1 — Pattern 1 Climb (skills-check warm-up)', label_es: 'Reto 1 — Subida del Patrón 1 (calentamiento de revisión de destrezas)',
            text: '<ol><li>Set the metronome to 60 BPM.</li><li>Play Pattern 1 up and back down, one note per beat.</li><li>Use alternate picking: down, up, down, up.</li></ol>The picture shows where each finger goes. Press "Play all" to hear it. You\'ve got it when: you play it up and back two times with every note clean and no missed picks.<span class="step-figure"><img src="img/m4-pentatonic-box1-en.svg" alt="Fretboard diagram of A minor pentatonic Pattern 1, frets 5 to 8: finger 1 on fret 5 of every string, finger 4 on fret 8 of the low E, B, and high e strings, and finger 3 on fret 7 of the A, D, and G strings. The root note A is marked solid at fret 5 on the low E and high e strings and at fret 7 on the D string." width="640" height="244"></span>',
            text_es: '<ol><li>Pon el metrónomo a 60 BPM.</li><li>Toca el Patrón 1 subiendo y luego bajando, una nota por tiempo.</li><li>Usa púa alterna: abajo, arriba, abajo, arriba.</li></ol>El dibujo muestra dónde va cada dedo. Presiona "Tocar todo" para escucharlo. Lo tienes cuando: lo tocas subiendo y bajando dos veces con cada nota limpia y sin púas falladas.<span class="step-figure"><img src="img/m4-pentatonic-box1-es.svg" alt="Diagrama del diapasón del Patrón 1 de A menor pentatónica, trastes 5 a 8: el dedo 1 en el traste 5 de todas las cuerdas, el dedo 4 en el traste 8 de las cuerdas Mi grave, Si y mi aguda, y el dedo 3 en el traste 7 de las cuerdas La, Re y Sol. La nota raíz A está marcada en sólido en el traste 5 de la Mi grave y la mi aguda, y en el traste 7 de la cuerda Re." width="640" height="244"></span>',
            hint: 'Go slow enough that every note rings. Set the ⏱ Timer for 2 minutes and repeat it.',
            hint_es: 'Ve lo bastante despacio para que cada nota suene. Pon el ⏱ Temporizador en 2 minutos y repítelo.',
            stuck: 'Play only the low E and A strings until they are clean. Then add one string at a time.',
            stuck_es: 'Toca solo las cuerdas Mi grave y La hasta que salgan limpias. Luego agrega una cuerda a la vez.',
            levelUp: 'Say the note names out loud on the low E and A strings: A, C, D, E. Or play it at 80 BPM.',
            levelUp_es: 'Di en voz alta los nombres de las notas en las cuerdas Mi grave y La: A, C, D, E. O tócalo a 80 BPM.',
            skills: [1, 2, 5],
            playSeq: { label: 'Play all', label_es: 'Tocar todo', bpm: 60, notes: [45, 48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72] },
          }
            ]
          },
          {
            title: 'Position Pattern 1 for major & minor',
            title_es: 'Posiciona el Patrón 1 para mayor y menor',
            steps: [
          {
            label: 'Challenge 2 — Move the Box: A Minor to G Minor', label_es: 'Reto 2 — Mueve la caja: de A menor a G menor',
            text: '<ol><li>Play Pattern 1 at fret 5, up and back. This is A minor pentatonic. Use the TAB below.</li><li>Slide your whole hand down two frets. Your index finger is now on the low E string at fret 3, the note G. This is G minor pentatonic.</li><li>Play the same shape up and back.</li><li>Before each box, say its root out loud: "A" or "G".</li></ol>You\'ve got it when: you play A minor, then G minor, up and back, two times in a row, and say the root before each box.<span class="step-figure"><img src="img/m4-pentatonic-box1-en.svg" alt="Fretboard diagram of A minor pentatonic Pattern 1, frets 5 to 8: finger 1 on fret 5 of every string, finger 4 on fret 8 of the low E, B, and high e strings, and finger 3 on fret 7 of the A, D, and G strings. The root note A is marked solid at fret 5 on the low E and high e strings and at fret 7 on the D string." width="640" height="244"></span>',
            text_es: '<ol><li>Toca el Patrón 1 en el traste 5, subiendo y bajando. Esta es A menor pentatónica. Usa el TAB de abajo.</li><li>Desliza toda la mano dos trastes hacia abajo. Tu dedo índice está ahora en la cuerda Mi grave, traste 3, la nota G. Esta es G menor pentatónica.</li><li>Toca la misma forma subiendo y bajando.</li><li>Antes de cada caja, di su raíz en voz alta: "A" o "G".</li></ol>Lo tienes cuando: tocas A menor, y luego G menor, subiendo y bajando, dos veces seguidas, y dices la raíz antes de cada caja.<span class="step-figure"><img src="img/m4-pentatonic-box1-es.svg" alt="Diagrama del diapasón del Patrón 1 de A menor pentatónica, trastes 5 a 8: el dedo 1 en el traste 5 de todas las cuerdas, el dedo 4 en el traste 8 de las cuerdas Mi grave, Si y mi aguda, y el dedo 3 en el traste 7 de las cuerdas La, Re y Sol. La nota raíz A está marcada en sólido en el traste 5 de la Mi grave y la mi aguda, y en el traste 7 de la cuerda Re." width="640" height="244"></span>',
            hint: 'A minor: your hand covers frets 5–8. G minor: the same shape covers frets 3–6. Every fret number is two lower.',
            hint_es: 'A menor: tu mano cubre los trastes 5–8. G menor: la misma forma cubre los trastes 3–6. Cada número de traste es dos menos.',
            stuck: 'Play A minor until you can do it without looking. Then slide your whole hand down two frets.',
            stuck_es: 'Toca A menor hasta que puedas hacerlo sin mirar. Luego desliza toda la mano dos trastes hacia abajo.',
            levelUp: 'Move it to a third place: D minor, with your index finger on the low E string at fret 10.',
            levelUp_es: 'Muévela a un tercer lugar: D menor, con tu dedo índice en la cuerda Mi grave, traste 10.',
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
          },
          {
            label: 'Number the box', label_es: 'Numera la caja',
            text: 'A scale degree is a note\'s number in the scale. Play up the box one string at a time. Say each note\'s degree instead of its name.<ol><li>Say 1, ♭3, 4, 5, ♭7, then 1 again an octave higher.</li><li>Keep going up through every string.</li></ol>Say ♭3 as "flat three" and ♭7 as "flat seven". The ♭ (flat) marks a note one fret lower than in the major scale. Set 3 shows why. You\'ve got it when: you say every degree in time with your picking, on every string, without stopping.<span class="step-figure"><img src="img/m4-pentatonic-degrees.svg" alt="A fretboard diagram of A minor pentatonic Pattern 1 across all six strings, frets 0 to 12, with scale-degree numbers marked: on the low E and high e strings, 1 at fret 5 and ♭3 at fret 8; on the A string, 4 at fret 5 and 5 at fret 7; on the D string, ♭7 at fret 5 and 1 at fret 7; on the G string, ♭3 at fret 5 and 4 at fret 7; on the B string, 5 at fret 5 and ♭7 at fret 8." width="640" height="244"></span>',
            text_es: 'Un grado de escala es el número de una nota dentro de la escala. Toca subiendo por la caja una cuerda a la vez. Di el grado de cada nota en vez de su nombre.<ol><li>Di 1, ♭3, 4, 5, ♭7, y luego 1 otra vez una octava más arriba.</li><li>Sigue subiendo por todas las cuerdas.</li></ol>Di ♭3 como "tres bemol" y ♭7 como "siete bemol". El ♭ (bemol) marca una nota un traste más abajo que en la escala mayor. La Unidad 3 muestra por qué. Lo tienes cuando: dices cada grado al mismo tiempo que tu púa, en todas las cuerdas, sin detenerte.<span class="step-figure"><img src="img/m4-pentatonic-degrees-es.svg" alt="Un diagrama del diapasón del Patrón 1 de A menor pentatónica en las seis cuerdas, trastes 0 a 12, con los números de grado de escala marcados: en las cuerdas Mi grave y mi aguda, 1 en el traste 5 y ♭3 en el traste 8; en la cuerda La, 4 en el traste 5 y 5 en el traste 7; en la cuerda Re, ♭7 en el traste 5 y 1 en el traste 7; en la cuerda Sol, ♭3 en el traste 5 y 4 en el traste 7; en la cuerda Si, 5 en el traste 5 y ♭7 en el traste 8." width="640" height="244"></span>',
            hint: 'Say each number at the same speed as you pick.',
            hint_es: 'Di cada número a la misma velocidad con la que pulsas.',
            stuck: 'Say the degrees on the low E string only: 1 at fret 5, ♭3 at fret 8. Then add the other strings.',
            stuck_es: 'Di los grados solo en la cuerda Mi grave: 1 en el traste 5, ♭3 en el traste 8. Luego agrega las demás cuerdas.',
            levelUp: 'Say the degrees going up and down the box. Or say them at 80 BPM.',
            levelUp_es: 'Di los grados subiendo y bajando por la caja. O dilos a 80 BPM.'
          },
          /* INSERTED 2026-09-20 — the set teaches how to POSITION the major
             pentatonic and then never plays it over anything. This uses the
             "Let It Be" backing track that is already in this module's song
             list (C-G-Am-F, so C major pentatonic fits it); no new URL. */
          {
            label: 'Play the major shape over a track', label_es: 'Toca la forma mayor sobre una pista',
            text: '<ol><li>Put your pinky on fret 8 of the low E string, the note C. The shape is now C major pentatonic.</li><li>Start <a href="https://www.youtube.com/watch?v=bCl8YuqHURE" target="_blank">&#x25B6; &#x1F3B5; the "Let It Be" backing track</a>. Its chords are C, G, Am and F. This shape fits all four.</li><li>Play four bars with any notes from the box.</li><li>Rest for four bars. Then repeat.</li></ol>You\'ve got it when: you play four rounds without losing the beat, and each round ends on C (low E fret 8, or G string fret 5).',
            text_es: '<ol><li>Pon tu meñique en el traste 8 de la cuerda Mi grave, la nota C. Ahora la forma es C mayor pentatónica.</li><li>Pon <a href="https://www.youtube.com/watch?v=bCl8YuqHURE" target="_blank">&#x25B6; &#x1F3B5; la pista de acompañamiento de "Let It Be"</a>. Sus acordes son C, G, Am y F. Esta forma encaja con los cuatro.</li><li>Toca cuatro compases con cualquier nota de la caja.</li><li>Descansa cuatro compases. Luego repite.</li></ol>Lo tienes cuando: tocas cuatro rondas sin perder el pulso, y cada ronda termina en C (Mi grave traste 8, o cuerda Sol traste 5).',
            hint: 'In the rest bars, listen to the track and choose your next notes.',
            hint_es: 'En los compases de descanso, escucha la pista y elige tus próximas notas.',
            stuck: 'Use only two notes: C and the next note up. Play every note in time with the track.',
            stuck_es: 'Usa solo dos notas: C y la siguiente nota hacia arriba. Toca cada nota a tiempo con la pista.',
            skills: [4, 5],
            playSeq: { label: 'Hear C major pentatonic', label_es: 'Escucha C mayor pentatónica', bpm: 60, notes: [48, 50, 52, 55, 57, 60] }
          }
            ]
          },
          {
            title: 'Improvise your first solo',
            title_es: 'Improvisa tu primer solo',
            steps: [
          {
            label: 'Challenge 3 — Rule of 3', label_es: 'Reto 3 — Regla de 3',
            text: 'To improvise means to make up the notes as you play.<ol><li>Start the <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; Am jam track</a>.</li><li>Improvise for 4 bars with only 3 notes: A (low E fret 5), C (low E fret 8) and D (A string fret 5).</li><li>Add a 4th note from the box. Improvise 4 more bars.</li><li>Pick your favorite 2-bar idea. Play it three times in a row, note for note.</li></ol>You\'ve got it when: you play both 4-bar parts with rests between your ideas, then play one 2-bar idea three times in a row, note for note.',
            text_es: 'Improvisar es inventar las notas mientras tocas.<ol><li>Pon la <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; pista de jam en Am</a>.</li><li>Improvisa durante 4 compases con solo 3 notas: A (Mi grave traste 5), C (Mi grave traste 8) y D (cuerda La traste 5).</li><li>Agrega una 4ª nota de la caja. Improvisa 4 compases más.</li><li>Elige tu idea favorita de 2 compases. Tócala tres veces seguidas, nota por nota.</li></ol>Lo tienes cuando: tocas las dos partes de 4 compases con silencios entre tus ideas, y luego tocas una idea de 2 compases tres veces seguidas, nota por nota.',
            hint: 'With only 3 notes, change the rhythm to make new ideas.',
            hint_es: 'Con solo 3 notas, cambia el ritmo para crear ideas nuevas.',
            stuck: 'Use only 2 notes on one string. Change only the rhythm.',
            stuck_es: 'Usa solo 2 notas en una cuerda. Cambia solo el ritmo.',
            levelUp: 'Add a 5th note. Or end every idea on A, the root.',
            levelUp_es: 'Agrega una 5ª nota. O termina cada idea en A, la raíz.',
            skills: [6]
          },
          {
            label: 'Challenge 4 — The Four-Phrase Plan', label_es: 'Reto 4 — El plan de las cuatro frases',
            text: 'A phrase is a short musical idea. Use the same 3 notes: A, C and D. Play four phrases, about one bar each, and give each one a job:<ol><li><strong>Phrase 1 — say it:</strong> play an idea of 2 to 4 notes.</li><li><strong>Phrase 2 — repeat it:</strong> play the same idea again. You may change one note.</li><li><strong>Phrase 3 — stretch it:</strong> play the idea higher, or keep the notes and change the rhythm.</li><li><strong>Phrase 4 — come home:</strong> end on the root, A.</li></ol>Play it over the <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; Am jam track</a>. You\'ve got it when: you play four different phrases with a rest between each, and the last one ends on A.',
            text_es: 'Una frase es una idea musical corta. Usa las mismas 3 notas: A, C y D. Toca cuatro frases, más o menos de un compás cada una, y dale un trabajo a cada una:<ol><li><strong>Frase 1 — dila:</strong> toca una idea de 2 a 4 notas.</li><li><strong>Frase 2 — repítela:</strong> toca la misma idea otra vez. Puedes cambiar una nota.</li><li><strong>Frase 3 — estírala:</strong> toca la idea más arriba, o mantén las notas y cambia el ritmo.</li><li><strong>Frase 4 — llega a la nota base:</strong> termina en la raíz, A.</li></ol>Tócalo sobre la <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; pista de jam en Am</a>. Lo tienes cuando: tocas cuatro frases distintas con un silencio entre cada una, y la última termina en A.',
            hint: 'Rest at least one beat between phrases.',
            hint_es: 'Descansa por lo menos un tiempo entre frases.',
            stuck: 'Make Phrases 1 and 2 exactly the same, note for note.',
            stuck_es: 'Haz que las Frases 1 y 2 sean exactamente iguales, nota por nota.',
            levelUp: 'Say each job out loud before you play its phrase: "say it, repeat it, stretch it, come home".',
            levelUp_es: 'Di cada trabajo en voz alta antes de tocar su frase: "dila, repítela, estírala, llega a la nota base".',
            skills: [6]
          }
            ]
          },
          {
            kind: 'take-to-song',
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — Solo over "Seven Nation Army"', label_es: 'Reto — Solo sobre "Seven Nation Army"',
                text: '<ol><li>Record yourself playing the "Seven Nation Army" riff (a riff = a short musical phrase that repeats) on the A string — E · E · G · E · D · C · B, the same one from Module 2 — and loop the recording.</li><li>Improvise over it using ONLY these three notes — open low E, G (low E, fret 3), and open A — for four bars.</li></ol>You\'ve got it when: four bars of intentional phrases — not a stream of notes — that land back on E. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 5 of 5</a>.',
                text_es: '<ol><li>Grábate tocando el riff de "Seven Nation Army" (un riff = una frase musical corta que se repite) en la cuerda La — E · E · G · E · D · C · B, el mismo que tocas desde el Módulo 2 — y repite la grabación en bucle.</li><li>Improvisa sobre ella usando SOLO estas tres notas — Mi grave al aire, G (cuerda Mi grave, traste 3), y La al aire — durante cuatro compases.</li></ol>Lo tienes cuando: cuatro compases de frases intencionadas — no un torrente de notas — que aterricen de vuelta en E. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 5 de 5</a>.',
                hint: 'Remember the Rule of 3: short ideas, with space between them. E is the note this song centers on, and your three notes come from E minor pentatonic — so they sit just below the riff, which you play on the A string.',
                hint_es: 'Recuerda la Regla de 3: ideas cortas, con espacio entre ellas. E es la nota en la que se centra esta canción, y tus tres notas vienen de la pentatónica de E menor — así que caen justo debajo del riff, que tocas en la cuerda La.',
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
              },
              {
                label: 'Challenge — Solo over "Watchtower"', label_es: 'Reto — Solo sobre "Watchtower"',
                text: 'The song\'s loop is Am · G · F · G — and A minor pentatonic Pattern 1 (the box you just learned) fits every bar of it:<ol><li>Improvise four bars using only the three notes marked below.</li><li>Then improvise four more, adding a fourth note of your choice from Pattern 1.</li></ol>You\'ve got it when: eight bars where every phrase starts or ends on A. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 5 of 5</a>.',
                text_es: 'La vuelta de la canción es Am · G · F · G — y el Patrón pentatónico 1 de A menor (la caja que acabas de aprender) encaja en cada compás:<ol><li>Improvisa cuatro compases usando solo las tres notas marcadas abajo.</li><li>Luego improvisa cuatro más, agregando una cuarta nota de tu elección del Patrón 1.</li></ol>Lo tienes cuando: ocho compases donde cada frase empieza o termina en A. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 5 de 5</a>.',
                hint: 'This is the same box from your Pattern 1 drill — you\'re not learning anything new, you\'re USING it. That\'s what today is for.',
                hint_es: 'Esta es la misma caja de tu ejercicio del Patrón 1 — no estás aprendiendo nada nuevo, la estás USANDO. Para esto sirve el trabajo de hoy.',
                stuck: 'Freeze the rhythm: only quarter notes, only the three marked notes, until an idea shows up on its own.',
                stuck_es: 'Congela el ritmo: solo negras, solo las tres notas marcadas, hasta que una idea aparezca por sí sola.',
                levelUp: 'Start a phrase over the F, and land it on A when the loop comes back to Am — that\'s real tension and release.',
                levelUp_es: 'Empieza una frase sobre el acorde F y aterriza en A cuando la vuelta regrese a Am — eso es tensión y resolución de verdad.',
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
              },
              {
                label: 'Challenge — "Watchtower", the real rhythm', label_es: 'Reto — "Watchtower", el ritmo real',
                text: '<ol><li>Open the Song Journey page and play the play-along track from the start.</li><li>Count "1 + 2 + 3 + 4 +" along with it.</li><li>Listen for the G: it comes in on the "+" after 3, not on a beat.</li><li>Play the roots along from the start: 1 + 2 (rest) + 4 in every bar.</li></ol>You\'ve got it when: you play the roots with the track from the start, every G landing on the "+" after 3, and you stay locked with the band. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: revisit Layer 2 of 5</a>.',
                text_es: '<ol><li>Abre la página del Recorrido de la canción y pon la pista para tocar encima desde el principio.</li><li>Cuenta "1 + 2 + 3 + 4 +" junto con ella.</li><li>Escucha la G: entra en el "+" después del 3, no en un tiempo.</li><li>Toca las raíces junto con la pista desde el principio: 1 + 2 (silencio) + 4 en cada compás.</li></ol>Lo tienes cuando: tocas las raíces con la pista desde el principio, cada G cayendo en el "+" después del 3, y te mantienes sincronizado con la banda. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: vuelve a la Capa 2 de 5</a>.',
                hint: 'What\'s new here is where the rhythm comes FROM: you check it against the record with your own ear, and you lock to the record instead of a metronome. A click waits for nobody but stays perfectly even; a record breathes, and you have to follow it.',
                hint_es: 'Lo nuevo aquí es DE DÓNDE viene el ritmo: lo compruebas con la grabación usando tu propio oído, y te sincronizas con la grabación en vez de con un metrónomo. Un clic no espera a nadie pero se mantiene perfectamente parejo; una grabación respira, y tú tienes que seguirla.',
                stuck: 'Clap first, no guitar. Play the track and clap only when the G arrives — on the "+" after 3. Add the frets back once your claps match the band.',
                stuck_es: 'Primero aplaude, sin guitarra. Pon la pista y aplaude solo cuando llega la G — en el "+" después del 3. Vuelve a agregar los trastes cuando tus aplausos coincidan con la banda.',
                levelUp: 'Play it as power chords instead of single notes — same changes, fuller sound.',
                levelUp_es: 'Tócalo como acordes de potencia en vez de notas sueltas — los mismos cambios, un sonido más lleno.',
                playSeq: { label: 'Hear it — 1 + 2 (rest) + 4, two laps', label_es: 'Escúchalo — 1 + 2 (silencio) + 4, dos vueltas', bpm: 60, notes: [{ midi: 45, beats: 0.5 }, { midi: 45, beats: 0.5 }, { midi: 45, beats: 1.5 }, { midi: 43, beats: 0.5 }, { midi: 43, beats: 1 }, { midi: 41, beats: 0.5 }, { midi: 41, beats: 0.5 }, { midi: 41, beats: 1.5 }, { midi: 43, beats: 0.5 }, { midi: 43, beats: 1 }, { midi: 45, beats: 0.5 }, { midi: 45, beats: 0.5 }, { midi: 45, beats: 1.5 }, { midi: 43, beats: 0.5 }, { midi: 43, beats: 1 }, { midi: 41, beats: 0.5 }, { midi: 41, beats: 0.5 }, { midi: 41, beats: 1.5 }, { midi: 43, beats: 0.5 }, { midi: 43, beats: 1 }] },
              },
              {
                label: 'Challenge — "Seven Nation Army", the real rhythm (by ear)', label_es: 'Reto — "Seven Nation Army", el ritmo real (de oído)',
                text: '<ol><li>Press the two &#x25B6; buttons below to hear the difference before you clap it.</li><li>Listen to the recording on repeat.</li><li>Clap the riff\'s rhythm with no guitar — some notes clipped short, some held longer — until it\'s in your hands.</li><li>Add the frets back once the feel is there.</li></ol>You\'ve got it when: you can loop the riff along with the record and stay locked with its groove. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Song Journey: revisit Layer 2 of 5</a>.',
                text_es: '<ol><li>Presiona los dos botones &#x25B6; de abajo para escuchar la diferencia antes de aplaudirlo.</li><li>Escucha la grabación una y otra vez.</li><li>Aplaude el ritmo del riff sin guitarra — algunas notas cortas, algunas sostenidas más — hasta que esté en tus manos.</li><li>Vuelve a agregar los trastes una vez que tengas la sensación.</li></ol>Lo tienes cuando: puedes repetir el riff junto con la grabación y mantenerte sincronizado con su groove (el groove = la sensación rítmica que te hace mover el cuerpo). <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Recorrido de la canción: vuelve a la Capa 2 de 5</a>.',
                hint: 'You\'ve played this riff since Module 2 as straight, even quarter notes — but on the record the notes are not all the same length, and some of them land between the beats. For now, go by ear: don\'t reach for counts or note values yet — this is ear training, the same way you learned to clap "Watchtower"\'s rhythm. Your ear already knows this riff; you\'re just teaching your hands to match it.',
                hint_es: 'Has tocado este riff desde el Módulo 2 como negras parejas y rectas — pero en la grabación las notas no duran todas lo mismo, y algunas caen entre los tiempos. Por ahora, guíate por el oído: no busques contar tiempos o valores de nota todavía — esto es entrenamiento de oído, igual que aprendiste a aplaudir el ritmo de "Watchtower". Tu oído ya conoce este riff; solo estás enseñándole a tus manos a igualarlo.',
                stuck: 'Clap just the first half of the riff (E · E · G · E) on loop until that half locks with the record, then add the second half (D · C · B).',
                stuck_es: 'Aplaude solo la primera mitad del riff (E · E · G · E) en bucle hasta que esa mitad encaje con la grabación, y luego agrega la segunda mitad (D · C · B).',
                levelUp: 'Play it as power chords instead of single notes, keeping the same timing — the same method as "Watchtower"\'s real-rhythm level-up.',
                levelUp_es: 'Tócalo como acordes de potencia en vez de notas sueltas, manteniendo el mismo ritmo — el mismo método que el nivel superior del ritmo real de "Watchtower".',
                tabs: [
                  {
                    title: 'How you learned it — straight teaching count',
                    title_es: 'Cómo lo aprendiste — conteo de enseñanza recto',
                    caption: '"Seven Nation Army" — main riff · A string · straight quarter notes',
                    caption_es: '"Seven Nation Army" — riff principal · cuerda La · negras rectas y parejas',
                    bpm: 60,
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
                  {
                    title: 'How the record\'s rhythm goes',
                    title_es: 'Cómo va el ritmo de la grabación',
                    caption: '"Seven Nation Army" — main riff · A string · the record\'s real durations (close to the record\'s feel, not note-perfect). Same frets as above — only the timing changes.',
                    caption_es: '"Seven Nation Army" — riff principal · cuerda La · las duraciones reales de la grabación (cercano a la sensación de la grabación, no nota por nota). Los mismos trastes que arriba — solo cambia el tiempo.',
                    bpm: 60,
                    maxBpm: 130,
                    notes: [
                      { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 1.5 },
                      { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.5 },
                      { string: 'A', fret: 10, note: 'G', midi: 55, beats: 0.75 },
                      { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.75 },
                      { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 0.5 },
                      { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 2 },
                      { string: 'A', fret: 2,  note: 'B', midi: 47, beats: 2 }
                    ]
                  }
                ],
              },
              {
                label: 'Challenge — Solo over "Luna"', label_es: 'Reto — Solo sobre "Luna"',
                text: 'Your box is D minor pentatonic Pattern 1 — root D, low E fret 10. Jam over <a href="https://www.youtube.com/watch?v=wBxFnX_V9mQ&t=84" target="_blank">▶ &#x1F3B5; a slow Dm practice jam (Luna\'s solo key)</a>:<ol><li>Improvise four bars using only the three notes marked below.</li><li>Improvise four more, adding a fourth note from the box.</li></ol>You\'ve got it when: eight bars where every phrase starts or ends on D. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 5 of 5</a>.',
                text_es: 'Tu caja es el Patrón pentatónico 1 de D menor — raíz D, cuerda Mi grave traste 10. Toca sobre <a href="https://www.youtube.com/watch?v=wBxFnX_V9mQ&t=84" target="_blank">▶ &#x1F3B5; una pista de jam lenta en D menor (la tonalidad del solo de Luna)</a>:<ol><li>Improvisa cuatro compases usando solo las tres notas marcadas abajo.</li><li>Improvisa cuatro más, agregando una cuarta nota de la caja.</li></ol>Lo tienes cuando: ocho compases donde cada frase empieza o termina en D. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 5 de 5</a>.',
                hint: '"Luna" is in F major, but this solo uses D minor pentatonic — the same five notes, just centered on D instead of F. Same Pattern 1 shape you\'ve been drilling — just at fret 10. This high up, the frets sit closer together, so the stretch is easier than it looks.',
                hint_es: '"Luna" está en F mayor, pero este solo usa la pentatónica de D menor — las mismas cinco notas, solo centradas en D en vez de F. La misma forma del Patrón 1 que has estado ejercitando — solo que en el traste 10. Tan arriba, los trastes están más juntos, así que el estiramiento es más fácil de lo que parece.',
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
                label: 'Wrap-up: what felt harder?', label_es: 'Cierre: ¿qué fue más difícil?',
                text: 'Which felt harder today — playing the pattern cleanly, or making music with only 3 notes? Write it below — that\'s your warm-up target next time.',
                text_es: '¿Qué se sintió más difícil hoy — tocar el patrón limpio, o hacer música con solo 3 notas? Escríbelo abajo — ese es tu objetivo de calentamiento la próxima vez.',
              }
            ]
          }
        ]
      }
    },

    skills: [
      { id: 'm5w1-s1', text: 'Play Pentatonic Pattern 1 ascending and descending from memory',
        text_es: 'Tocar el Patrón pentatónico 1 subiendo y bajando de memoria',
        gotItWhen: 'you can play the full pattern up and back down without looking at a diagram, with no missed notes or pauses.',
        gotItWhen_es: 'puedes tocar el patrón completo subiendo y volviendo a bajar sin mirar un diagrama, sin notas falladas ni pausas.',
        practice: { type: 'playSeq', label: 'Am pentatonic Pattern 1 (ascending)', label_es: 'Patrón pentatónico 1 de Am (subiendo)', bpm: 70,
          notes: [45, 48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72] } },
      { id: 'm5w1-s2', text: 'Use alternate picking (down-up) consistently through the pattern',
        text_es: 'Usar púa alterna (abajo-arriba) de forma constante a lo largo del patrón',
        gotItWhen: 'your pick alternates down-up-down-up automatically — you don\'t have to think about which direction comes next.',
        gotItWhen_es: 'tu púa alterna abajo-arriba-abajo-arriba automáticamente — no tienes que pensar en qué dirección sigue.',
        practice: { type: 'playSeq', label: 'Pattern 1 descending — alternate picking (down-up)', label_es: 'Patrón 1 bajando — púa alterna (abajo-arriba)', bpm: 70,
          notes: [72, 69, 67, 64, 62, 60, 57, 55, 52, 50, 48, 45] } },
      { id: 'm5w1-s3', text: 'Position Pattern 1 as a minor pentatonic scale in any key',
        text_es: 'Posicionar el Patrón 1 como escala pentatónica menor en cualquier tonalidad',
        gotItWhen: 'you can pick any minor key (Am, Em, Gm…), place your 1st finger on the right fret of the low E, and play the pattern from there.',
        gotItWhen_es: 'puedes elegir cualquier tonalidad menor (Am, Em, Gm…), colocar tu dedo índice en el traste correcto de la Mi grave, y tocar el patrón desde ahí.',
        practice: { type: 'mc', prompt: 'Your 1st finger is on the low E string at fret 8. Which minor pentatonic scale are you set up to play?',
          prompt_es: 'Tu dedo índice está en la cuerda Mi grave, traste 8. ¿Qué escala pentatónica menor estás listo para tocar?',
          choices: ['A minor', 'C minor', 'E minor', 'G minor'], choices_es: ['A menor', 'C menor', 'E menor', 'G menor'], answer: 1,
          explain: 'In the minor version of Pattern 1 your 1st finger sits on the root, and the low E string at fret 8 is C — so C minor pentatonic. A minor is not right: it starts at fret 5.',
          explain_es: 'En la versión menor del Patrón 1 tu dedo índice va sobre la raíz, y la cuerda Mi grave en el traste 8 es C — así que pentatónica de C menor. No es A menor: esa empieza en el traste 5.' } },
      { id: 'm5w1-s4', text: 'Position Pattern 1 as a major pentatonic scale in any key',
        text_es: 'Posicionar el Patrón 1 como escala pentatónica mayor en cualquier tonalidad',
        gotItWhen: 'you can pick any major key (C, G, D…), find its root on the low E, put the correct finger on it, and play the pattern from there.',
        gotItWhen_es: 'puedes elegir cualquier tonalidad mayor (C, G, D…), encontrar su raíz en la Mi grave, poner el dedo correcto sobre ella, y tocar el patrón desde ahí.',
        practice: { type: 'mc', prompt: 'When you treat Pattern 1 as a MAJOR pentatonic, which finger sits on the root?',
          prompt_es: 'Cuando tratas el Patrón 1 como pentatónica MAYOR, ¿qué dedo se coloca en la raíz?',
          choices: ['1st (index)', '2nd (middle)', '3rd (ring)', '4th (pinky)'], choices_es: ['1º (índice)', '2º (medio)', '3º (anular)', '4º (meñique)'], answer: 3,
          explain: 'Same shape, different home note. In major pentatonic, the root is under your 4th finger (pinky) on the low E string, not your 1st. The index finger on the root is the minor setup.',
          explain_es: 'La misma forma, distinta nota base. En la pentatónica mayor, la raíz queda bajo tu dedo meñique en la cuerda Mi grave, no bajo el índice. El índice en la raíz es la posición menor.' } },
      { id: 'm5w1-s5', text: 'Play the pattern in time at 60 BPM with a metronome',
        text_es: 'Tocar el patrón a tiempo a 60 BPM con un metrónomo',
        gotItWhen: 'every note lands on a beat at 60 BPM and you can play the whole pattern without stopping or losing the click.',
        gotItWhen_es: 'cada nota cae en un tiempo a 60 BPM y puedes tocar todo el patrón sin detenerte ni perder el clic.',
        practice: { type: 'pr', prompt: '<ol><li>Play Pattern 1 up and down with every note landing on a click.</li><li>Start at 60 BPM and raise the metronome +5 at a time.</li><li>Log your fastest CLEAN tempo.</li></ol>',
          prompt_es: '<ol><li>Toca el Patrón 1 subiendo y bajando con cada nota cayendo en un clic.</li><li>Empieza a 60 BPM y sube el metrónomo de 5 en 5.</li><li>Anota tu tempo LIMPIO más rápido.</li></ol>',
          unit: 'BPM', placeholder: 'e.g. 70 — try for a higher number next session', placeholder_es: 'p. ej. 70 — intenta superarlo la próxima sesión' } },
      { id: 'm5w1-s6', text: 'Improvise a short 2-bar musical idea using 2–3 notes from the pattern',
        text_es: 'Improvisar una idea musical corta de 2 compases usando 2–3 notas del patrón',
        gotItWhen: 'you play the same 2-bar phrase three times in a row, note for note, using 2 or 3 notes from the pattern.',
        gotItWhen_es: 'tocas la misma frase de 2 compases tres veces seguidas, nota por nota, usando 2 o 3 notas del patrón.',
        practice: { type: 'mc', prompt: 'What makes a short improvised phrase sound intentional instead of random?',
          prompt_es: '¿Qué hace que una frase improvisada corta suene intencionada en vez de aleatoria?',
          choices: ['Using as many different notes as possible', 'Playing it as fast as you can', 'Never repeating anything', 'Repeating an idea, varying it, and leaving space'],
          choices_es: ['Usar tantas notas diferentes como sea posible', 'Tocarla lo más rápido que puedas', 'Nunca repetir nada', 'Repetir una idea, variarla, y dejar espacio'], answer: 3,
          explain: 'Repeat the phrase with small changes, and leave space between phrases. That makes a phrase sound planned. More notes and more speed usually make it sound MORE random, not less.',
          explain_es: 'Repite la frase con pequeños cambios, y deja espacio entre las frases. Eso hace que una frase suene planeada. Más notas y más velocidad normalmente la hacen sonar MÁS aleatoria, no menos.' } }
    ]
  },

  {
    id: 'm5w2',
    songThread: [{ name: '"Sweet Child O\' Mine"', journey: 'tabs/sweet-child-o-mine.html', layer: 5, note: 'soloing over this song' }, { name: '"the cure"', journey: 'tabs/the-cure.html', layer: 5, note: 'a very quiet solo' }],
    label: 'Set 2',
    locked: false,
    module: 'Major / Minor / Blues Pentatonic Scales',
    moduleNum: 5,
    unit: 'Module 5 · Major / Minor / Blues Pentatonic Scales',
    unit_es: 'Módulo 5 · Escalas pentatónicas mayor, menor y de blues',
    title: 'Set 2',
    subtitle: 'Tone controls · Short solo ideas · Notes on D & G strings',
    subtitle_es: 'Controles de timbre · Ideas cortas para solos · Notas en las cuerdas Re y Sol',
    skillFocus: 'Playing expressively with dynamics and tone · Phrasing a solo with call-and-response · Notes on the D and G strings',
    skillFocus_es: 'Tocar con expresividad usando dinámica y timbre · Frasear un solo con llamada y respuesta · Notas en las cuerdas Re y Sol',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        title_es: 'Estación de computadora — Mira · Escucha · Practica',
        sections: [
          {
            title: 'Watch: dynamics and hammer-ons',
            title_es: 'Mira: dinámica y hammer-ons',
            steps: [
          {
            label: 'Watch: using the minor pentatonic', label_es: 'Mira: usar la pentatónica menor',
            text: '<ol><li>Watch: <a href="https://www.youtube.com/watch?v=1mT5nUE0o7M&t=31" target="_blank">How to USE the Minor Pentatonic Scale – Lauren Bateman (0:31–4:00)</a> to review the shape.</li><li>Pick one note from the pattern.</li><li>Play it quiet (p), then medium (mf), then loud (f).</li></ol>This change in volume is called dynamics. You\'ve got it when: you play the same note at all three levels four times in a row, and you hear three different volumes each time.',
            text_es: '<ol><li>Mira: <a href="https://www.youtube.com/watch?v=1mT5nUE0o7M&t=31" target="_blank">How to USE the Minor Pentatonic Scale – Lauren Bateman (0:31–4:00)</a> para repasar la forma.</li><li>Elige una nota del patrón.</li><li>Tócala suave (p), luego a volumen medio (mf), y luego fuerte (f).</li></ol>Este cambio de volumen se llama dinámica. Lo tienes cuando: tocas la misma nota en los tres niveles cuatro veces seguidas, y escuchas tres volúmenes distintos cada vez.',
            hint: 'Pick lightly for quiet. Pick firmly for loud. The note stays the same.',
            hint_es: 'Pulsa con poca fuerza para suave. Pulsa con firmeza para fuerte. La nota sigue siendo la misma.',
            skills: [1],
          },
          {
            label: 'Watch: hammer-ons and pull-offs', label_es: 'Mira: hammer-ons y pull-offs',
            text: 'A hammer-on and a pull-off sound a second note without picking it again.<ol><li>Watch: <a href="https://youtu.be/7hDdZAjKBjY" target="_blank">Hammer-Ons Explained + Exercise For Beginners – JustinGuitar</a> (0:00–3:00). The video shows the hammer-on.</li><li>Hammer-on: pick the open D string. Then press a finger down fast on fret 2, just behind the fret. Do not pick again.</li><li>Pull-off: put a finger on the D string at fret 2 and pick it. Then pull that finger sideways off the string so the open D rings. Do not pick again.</li></ol>In TAB, h means hammer-on. "0h2" on the D string is the hammer-on you just played. You\'ve got it when: you play five hammer-ons and five pull-offs on the D string, and each second note sounds without a second pick.',
            text_es: 'Un hammer-on y un pull-off hacen sonar una segunda nota sin volver a pulsar.<ol><li>Mira: <a href="https://youtu.be/7hDdZAjKBjY" target="_blank">Hammer-Ons Explained + Exercise For Beginners – JustinGuitar</a> (0:00–3:00). El video muestra el hammer-on.</li><li>Hammer-on: pulsa la cuerda Re al aire. Luego presiona un dedo rápido sobre el traste 2, justo detrás del traste. No vuelvas a pulsar.</li><li>Pull-off: pon un dedo en la cuerda Re en el traste 2 y púlsala. Luego saca ese dedo de lado para que suene la Re al aire. No vuelvas a pulsar.</li></ol>En TAB, h significa hammer-on. "0h2" en la cuerda Re es el hammer-on que acabas de tocar. Lo tienes cuando: tocas cinco hammer-ons y cinco pull-offs en la cuerda Re, y cada segunda nota suena sin un segundo golpe de púa.',
            hint: 'Land the finger just behind the fret. On a pull-off, the finger plucks the string as it leaves.',
            hint_es: 'El dedo debe caer justo detrás del traste. En un pull-off, el dedo pulsa la cuerda al salir.',
            skills: [3],
            response: { type: 'mc', prompt: 'In TAB, you see "5h7" on the G string. How do you play it?',
              prompt_es: 'En TAB, ves "5h7" en la cuerda Sol. ¿Cómo lo tocas?',
              answer: 0,
              explain: 'The h means hammer-on. You pick only the first note, fret 5. Then your finger drops onto fret 7, and that drop makes the second note sound. Picking fret 7 too would make two picked notes. A slide keeps the finger on the string the whole way.',
              explain_es: 'La h significa hammer-on. Pulsas solo la primera nota, el traste 5. Luego tu dedo cae sobre el traste 7, y esa caída hace sonar la segunda nota. Pulsar también el traste 7 daría dos notas pulsadas. Un deslizamiento mantiene el dedo sobre la cuerda todo el camino.',
              choices: [
              'Pick fret 5 only; drop a finger onto fret 7',
              'Pick fret 7, then pull off to fret 5',
              'Pick fret 5, then pick fret 7 as well',
              'Pick fret 5, then slide up to fret 7'
            ],
              choices_es: [
              'Pulsa solo el traste 5; deja caer un dedo en el traste 7',
              'Pulsa el traste 7, y luego haz pull-off al traste 5',
              'Pulsa el traste 5, y luego pulsa también el traste 7',
              'Pulsa el traste 5, y luego desliza hasta el traste 7'
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
            text: 'Timbre is the color of a sound. It is not pitch and not volume.<ol><li>Pick a note with your picking hand near the neck.</li><li>Pick the same note near the bridge.</li><li>Listen to how the sound changes.</li><li>Record 8 notes. Pick each one near the neck or near the bridge, in any order. Do not say which.</li></ol>You\'ve got it when: you play back the recording and name neck or bridge correctly for at least 7 of the 8 notes.',
            text_es: 'El timbre es el color de un sonido. No es la altura ni el volumen.<ol><li>Pulsa una nota con tu mano de pulsar cerca del mástil.</li><li>Pulsa la misma nota cerca del puente.</li><li>Escucha cómo cambia el sonido.</li><li>Graba 8 notas. Pulsa cada una cerca del mástil o cerca del puente, en cualquier orden. No digas cuál.</li></ol>Lo tienes cuando: escuchas la grabación y nombras bien mástil o puente en por lo menos 7 de las 8 notas.',
            hint: 'Move your picking hand to change the tone.',
            hint_es: 'Mueve tu mano de pulsar para cambiar el timbre.',
            skills: [2],
            response: { type: 'mc', prompt: 'Which picking position sounds BRIGHTER?',
              prompt_es: '¿Qué posición de pulsado suena más BRILLANTE?',
              answer: 0,
              explain: 'Picking close to the bridge gives a brighter, thinner tone. Picking near the neck sounds warmer and rounder. If they sounded the same to you, play them one right after the other and listen again.',
              explain_es: 'Pulsar cerca del puente da un timbre más brillante y delgado. Pulsar cerca del mástil suena más cálido y redondo. Si te sonaron iguales, tócalos uno justo después del otro y escucha otra vez.',
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
            text: '<ol><li>Press any note below the TAB to hear it.</li><li>Play each note up the D string and say its name.</li></ol>Later in this set you play them without the chart. You\'ve got it when: you play and name all seven notes, fret 0 to fret 10, two times with the TAB in view.',
            text_es: '<ol><li>Presiona cualquier nota debajo del TAB para escucharla.</li><li>Toca cada nota subiendo por la cuerda Re y di su nombre.</li></ol>Más adelante en esta unidad las tocas sin el diagrama. Lo tienes cuando: tocas y nombras las siete notas, del traste 0 al traste 10, dos veces con el TAB a la vista.',
            hint: 'The alphabet works as it does on the E and A strings. E to F and B to C are one fret apart (a half step). Every other pair is two frets apart (a whole step).',
            hint_es: 'El alfabeto funciona igual que en las cuerdas Mi y La. De E a F y de B a C hay un traste (un semitono). Entre las demás hay dos trastes (un tono).',
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
            kind: 'reflection',
            title: 'Checkpoint',
            title_es: 'Punto de control',
            steps: [
          {
            label: 'Wrap-up: your expressive tool', label_es: 'Cierre: tu herramienta expresiva',
            text: 'Checkpoint — pause and think: which expressive tool felt most natural today — dynamics (loud/soft), timbre (bright/warm), or the hammer-on? Which one will you use most in your solos?',
            text_es: 'Punto de control — pausa y piensa: ¿qué herramienta expresiva se sintió más natural hoy — la dinámica (fuerte/suave), el timbre (brillante/cálido), o el hammer-on? ¿Cuál vas a usar más en tus solos?',
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
            kind: 'tuning-warmup',
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
            title: 'Play a one-note solo',
            title_es: 'Toca un solo de una sola nota',
            steps: [
          {
            label: 'Challenge 1 — The One-Note Solo', label_es: 'Reto 1 — El solo de una nota',
            text: '<ol><li>Choose one note in the Am pentatonic pattern.</li><li>Play only that note for 8 bars.</li><li>Change one thing in every bar: rhythm, dynamics (how loud or soft you play) or tone.</li><li>Make at least two bars short, hard notes: pick firmly, then stop the string.</li><li>Make at least two bars long, soft notes.</li></ol>You\'ve got it when: you record the 8 bars, listen back, and name what you changed in each bar.',
            text_es: '<ol><li>Elige una nota del patrón pentatónico de Am.</li><li>Toca solo esa nota durante 8 compases.</li><li>Cambia una cosa en cada compás: el ritmo, la dinámica (qué tan fuerte o suave tocas) o el timbre.</li><li>Haz por lo menos dos compases de notas cortas y duras: pulsa firme, y luego detén la cuerda.</li><li>Haz por lo menos dos compases de notas largas y suaves.</li></ol>Lo tienes cuando: grabas los 8 compases, los escuchas, y nombras lo que cambiaste en cada compás.',
            hint: 'Loud, soft, short and long each count as a change.',
            hint_es: 'Fuerte, suave, corta y larga cuentan cada una como un cambio.',
            stuck: 'Change one thing per bar: louder, then softer, then shorter, then longer.',
            stuck_es: 'Cambia una cosa por compás: más fuerte, luego más suave, luego más corta, luego más larga.',
            levelUp: 'Add a hammer-on into the note. Or move your picking hand from the bridge to the neck in the middle of a phrase.',
            levelUp_es: 'Agrega un hammer-on hacia la nota. O mueve tu mano de pulsar del puente al mástil a mitad de una frase.',
            skills: [1, 2, 4, 5]
          }
            ]
          },
          {
            title: 'Hammer-ons and pull-offs, then call and response',
            title_es: 'Hammer-ons y pull-offs, luego llamada y respuesta',
            steps: [
          /* INSERTED 2026-09-20 — a hammer-on and pull-off drill. Both are
             used by the expressive-phrasing work above and by the level-up
             on the one-note solo, and until now only a video taught them.
             Unnumbered, so "Challenge 2" below keeps its number. */
          {
            label: 'Hammer-ons and pull-offs', label_es: 'Hammer-ons y pull-offs',
            text: 'Both moves happen inside the box you know.<ol><li><strong>Hammer-on:</strong> pick fret 5 on the D string. Then drop your ring finger fast onto fret 7, just behind the fret. Do not pick again.</li><li>Play ten hammer-ons in a row. Make the fret-7 note as loud as the picked note.</li><li><strong>Pull-off:</strong> hold both fingers down and pick fret 7. Then pull your ring finger sideways off the string so fret 5 rings.</li><li>Play ten pull-offs in a row.</li></ol>You\'ve got it when: you play ten hammer-ons and ten pull-offs in a row, each second note clear, with only the first note of each pair picked.',
            text_es: 'Los dos movimientos ocurren dentro de la caja que ya conoces.<ol><li><strong>Hammer-on:</strong> pulsa el traste 5 de la cuerda Re. Luego deja caer rápido el dedo anular sobre el traste 7, justo detrás del traste. No vuelvas a pulsar.</li><li>Toca diez hammer-ons seguidos. Haz que la nota del traste 7 suene tan fuerte como la pulsada.</li><li><strong>Pull-off:</strong> mantén los dos dedos puestos y pulsa el traste 7. Luego saca el anular de lado para que suene el traste 5.</li><li>Toca diez pull-offs seguidos.</li></ol>Lo tienes cuando: tocas diez hammer-ons y diez pull-offs seguidos, con cada segunda nota clara, y solo la primera nota de cada par pulsada.',
            hint: 'Use speed, not force. Land on your fingertip just behind the fret.',
            hint_es: 'Usa velocidad, no fuerza. Cae sobre la punta del dedo justo detrás del traste.',
            stuck: 'Keep your index finger on fret 5 the whole time. Only your ring finger moves.',
            stuck_es: 'Deja el dedo índice en el traste 5 todo el tiempo. Solo se mueve el anular.',
            skills: [3],
            playSeq: { label: 'Hear the pair', label_es: 'Escucha el par', bpm: 60, notes: [55, 57, 55, 57] }
          },
          {
            label: 'Challenge 2 — Call & Response (assessment preparation)', label_es: 'Reto 2 — Llamada y respuesta (preparación para la evaluación)',
            text: '<ol><li>Start the <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; Am jam track</a>.</li><li>Call: play a 2-bar idea that ends on any note except A.</li><li>Rest for 1 bar.</li><li>Response: play a 2-bar idea that ends on A, the root (low E fret 5 or D string fret 7).</li></ol>You\'ve got it when: you play three call-and-response pairs in a row, every call ending off A and every response ending on A.',
            text_es: '<ol><li>Pon la <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; pista de jam en Am</a>.</li><li>Llamada: toca una idea de 2 compases que termine en cualquier nota menos A.</li><li>Descansa 1 compás.</li><li>Respuesta: toca una idea de 2 compases que termine en A, la raíz (Mi grave traste 5 o cuerda Re traste 7).</li></ol>Lo tienes cuando: tocas tres pares seguidos de llamada y respuesta, cada llamada terminando fuera de A y cada respuesta terminando en A.',
            hint: 'The call sounds like a question. The response sounds like the answer.',
            hint_es: 'La llamada suena como una pregunta. La respuesta suena como la contestación.',
            stuck: 'Use only 2 or 3 notes for both parts. End every response on A.',
            stuck_es: 'Usa solo 2 o 3 notas en las dos partes. Termina cada respuesta en A.',
            levelUp: 'Take turns with the person next to you: two bars each, back and forth, four times. End every one of your answers on A. Or record a 2-bar call and answer it over the playback.',
            levelUp_es: 'Alterna con la persona de al lado: dos compases cada quien, de ida y vuelta, cuatro veces. Termina cada una de tus respuestas en A. O graba una llamada de 2 compases y respóndela sobre la grabación.',
            skills: [6]
          }
            ]
          },
          {
            title: 'Name the notes on the D & G strings',
            title_es: 'Nombra las notas en las cuerdas Re y Sol',
            steps: [
          {
            label: 'Challenge 3 — D String Map', label_es: 'Reto 3 — Mapa de la cuerda Re',
            text: '<ol><li>Press "Play all" to hear the seven natural notes on the D string.</li><li>Play them slowly up the string. Say each name out loud.</li><li>Cover the diagram. Play them up and back again.</li></ol>You\'ve got it when: you play and name all seven up and back without looking at the diagram.<span class="step-figure"><img src="img/m4-d-naturals.svg" alt="A fretboard diagram of the D string, frets 0 to 10, with the natural notes marked: D open, E at fret 2, F at fret 3, G at fret 5, A at fret 7, B at fret 9, and C at fret 10." width="640" height="244"></span>',
            text_es: '<ol><li>Presiona "Tocar todo" para escuchar las siete notas naturales de la cuerda Re.</li><li>Tócalas despacio subiendo por la cuerda. Di cada nombre en voz alta.</li><li>Tapa el diagrama. Tócalas otra vez subiendo y bajando.</li></ol>Lo tienes cuando: tocas y nombras las siete subiendo y bajando sin mirar el diagrama.<span class="step-figure"><img src="img/m4-d-naturals-es.svg" alt="Un diagrama del diapasón de la cuerda Re, trastes 0 a 10, con las notas naturales marcadas: D al aire, E en el traste 2, F en el 3, G en el 5, A en el 7, B en el 9, y C en el 10." width="640" height="244"></span>',
            hint: 'Set the ⏱ Timer for 2 minutes. Count how many times up and back you play without looking.',
            hint_es: 'Pon el ⏱ Temporizador en 2 minutos. Cuenta cuántas veces subes y bajas sin mirar.',
            stuck: 'Start with frets 0, 2, 3, 5 and 7: D, E, F, G, A. Then add B and C at frets 9 and 10.',
            stuck_es: 'Empieza con los trastes 0, 2, 3, 5 y 7: D, E, F, G, A. Luego agrega B y C en los trastes 9 y 10.',
            levelUp: 'Point to a random fret from 0 to 10 and name the note in under 3 seconds. Or play the string from C back down to D.',
            levelUp_es: 'Señala un traste al azar del 0 al 10 y nombra la nota en menos de 3 segundos. O toca la cuerda desde C de regreso hasta D.',
            skills: [7],
            playSeq: { label: 'Play all', label_es: 'Tocar todo', bpm: 60, notes: [50, 52, 53, 55, 57, 59, 60] },
          },
          {
            label: 'Challenge 4 — G String Map', label_es: 'Reto 4 — Mapa de la cuerda Sol',
            text: '<ol><li>Play the natural notes on the G string: G, A, B, C, D, E, F (frets 0 to 10).</li><li>Say each name out loud.</li><li>Play them up and back.</li></ol>You\'ve got it when: you play and name all seven up and back without looking at the diagram.<span class="step-figure"><img src="img/m4-g-naturals.svg" alt="A fretboard diagram of the G string, frets 0 to 10, with the natural notes marked: G open, A at fret 2, B at fret 4, C at fret 5, D at fret 7, E at fret 9, and F at fret 10." width="640" height="244"></span>',
            text_es: '<ol><li>Toca las notas naturales de la cuerda Sol: G, A, B, C, D, E, F (trastes 0 a 10).</li><li>Di cada nombre en voz alta.</li><li>Tócalas subiendo y bajando.</li></ol>Lo tienes cuando: tocas y nombras las siete subiendo y bajando sin mirar el diagrama.<span class="step-figure"><img src="img/m4-g-naturals-es.svg" alt="Un diagrama del diapasón de la cuerda Sol, trastes 0 a 10, con las notas naturales marcadas: G al aire, A en el traste 2, B en el 4, C en el 5, D en el 7, E en el 9, y F en el 10." width="640" height="244"></span>',
            hint: 'E to F and B to C are still one fret apart. On the G string they land on different frets.',
            hint_es: 'De E a F y de B a C sigue habiendo un traste. En la cuerda Sol caen en otros trastes.',
            stuck: 'Find the two one-fret pairs first: B and C (frets 4 and 5), E and F (frets 9 and 10). Then fill in the notes between them.',
            stuck_es: 'Encuentra primero los dos pares de un traste: B y C (trastes 4 y 5), E y F (trastes 9 y 10). Luego completa las notas entre ellos.',
            levelUp: 'Play D on the D string, then D on the G string, and name both.',
            levelUp_es: 'Toca D en la cuerda Re, luego D en la cuerda Sol, y nombra las dos.',
            skills: [7],
            playSeq: { label: 'Play all', label_es: 'Tocar todo', bpm: 60, notes: [55, 57, 59, 60, 62, 64, 65] }
          }
            ]
          },
          {
            kind: 'take-to-song',
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Sweet Child O\' Mine", solo-section feel', label_es: 'Reto — "Sweet Child O\' Mine", sensación de sección de solo',
                text: 'The famous outro solo uses E minor pentatonic:<ol><li>Improvise four bars in the open position.</li><li>Then move the same shape up to the 12th fret and play four more — same pattern, one octave up, instant "solo voice."</li></ol>You\'ve got it when: both registers (register = how high or low the notes are), phrases with space, landing on E in each. <a href="tabs/sweet-child-o-mine.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 5 of 5</a>.',
                text_es: 'El famoso solo del outro usa la pentatónica de E menor:<ol><li>Improvisa cuatro compases en posición abierta.</li><li>Luego mueve la misma forma hasta el traste 12 y toca cuatro más — mismo patrón, una octava más arriba, sonido de "solo" instantáneo.</li></ol>Lo tienes cuando: ambos registros (registro = qué tan agudas o graves son las notas), frases con espacio, aterrizando en E en cada uno. <a href="tabs/sweet-child-o-mine.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 5 de 5</a>.',
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
              },
              {
                label: 'Challenge — Solo over "the cure"', label_es: 'Reto — Solo sobre "the cure"',
                text: 'Olivia\'s song is soft — so your solo has to be too. Improvise eight bars in Am pentatonic Pattern 1 as quietly as you can:<ul><li>Light pick.</li><li>Slow phrases.</li><li>Lots of space.</li></ul>You\'ve got it when: eight bars where the quietest note is as clean as your loudest. <a href="tabs/the-cure.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 5 of 5</a>.',
                text_es: 'La canción de Olivia es suave — así que tu solo también tiene que serlo. Improvisa ocho compases en el Patrón pentatónico 1 de Am lo más suave que puedas:<ul><li>Púa ligera.</li><li>Frases lentas.</li><li>Mucho espacio.</li></ul>Lo tienes cuando: ocho compases donde la nota más suave está tan limpia como la más fuerte. <a href="tabs/the-cure.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 5 de 5</a>.',
                hint: 'Buzzes and mistakes hide at loud volume and show at soft volume. Play quietly so you can hear every one.',
                hint_es: 'Los zumbidos y los errores se esconden a volumen fuerte y se notan a volumen suave. Toca suave para oír cada uno.',
                stuck: 'Rule of 3 at half speed: three notes, whisper volume, one phrase per two bars.',
                stuck_es: 'Regla de 3 a media velocidad: tres notas, volumen susurrado, una frase cada dos compases.',
                levelUp: 'Build one long crescendo across all eight bars — start as quietly as you can, end singing, never harsh.',
                levelUp_es: 'Construye un solo crescendo largo a lo largo de los ocho compases — empieza lo más suave que puedas, termina cantando, nunca áspero.',
                skills: [5, 6],
              }
            ]
          },
          {
            kind: 'reflection',
            title: 'Wrap-Up',
            title_es: 'Cierre',
            steps: [
              {
                label: 'Wrap-up: phrasing or note names?', label_es: 'Cierre: ¿fraseo o nombres de nota?',
                text: 'Which is more solid right now — your expressive phrasing (call-and-response, dynamics) or your note names on D and G? Write the weaker one below — that\'s your warm-up target next time.',
                text_es: '¿Qué está más sólido ahora mismo — tu fraseo expresivo (llamada y respuesta, dinámica) o tus nombres de nota en Re y Sol? Escribe el más débil abajo — ese es tu objetivo de calentamiento la próxima vez.',
              }
            ]
          },
          {
            kind: 'ear-spark',
            title: 'Ear Spark — optional ear bonus',
            title_es: 'Chispa auditiva — bono opcional de oído',
            steps: [
              {
                label: 'Ear Spark: sing and find the note', label_es: 'Chispa auditiva: canta y encuentra la nota',
                text: 'Ear Spark (optional, 2 min):<ol><li>Press play below — the deck draws three notes from the low E string, frets 0–5, and plays them for you.</li><li>Sing each note back and hold it, then find it on the string — singing first is the important part.</li><li>Check yourself last.</li></ol>',
                text_es: 'Chispa auditiva (opcional, 2 min):<ol><li>Presiona reproducir abajo — la baraja saca tres notas de la cuerda Mi grave, trastes 0–5, y las toca por ti.</li><li>Canta cada nota de vuelta y sostenla, y luego encuéntrala en la cuerda — cantar primero es la parte importante.</li><li>Revísate al final.</li></ol>',
                drill: { type: 'ear', pool: 'lowEFrets', draw: 3 },
              }
            ]
          }
        ]
      }
    },

    skills: [
      { id: 'm5w2-s1', text: 'Play the same note quiet, medium and loud on purpose: p (piano, quiet), mf (mezzo-forte, medium), f (forte, loud)',
        text_es: 'Tocar la misma nota suave, media y fuerte a propósito: p (piano, suave), mf (mezzo-forte, medio), f (forte, fuerte)',
        gotItWhen: 'you play the same note three times in a row and can clearly hear on a recording that you got louder each time.',
        gotItWhen_es: 'tocas la misma nota tres veces seguidas y puedes escuchar claramente en una grabación que subiste el volumen cada vez.',
        practice: { type: 'mc', prompt: 'Which order goes from QUIETEST to LOUDEST?',
          prompt_es: '¿Qué orden va de MÁS SUAVE a MÁS FUERTE?',
          choices: ['p, mf, f', 'f, mf, p', 'mf, p, f', 'mf, f, p'], choices_es: ['p, mf, f', 'f, mf, p', 'mf, p, f', 'mf, f, p'], answer: 0,
          explain: 'The letters are Italian: p = piano (quiet), mf = mezzo-forte (medium), f = forte (loud). So p, mf, f is the climb from softest to loudest — f, mf, p is that same climb read backwards.',
          explain_es: 'Las letras vienen del italiano: p = piano (suave), mf = mezzo-forte (medio), f = forte (fuerte). Así que p, mf, f es la subida de lo más suave a lo más fuerte — f, mf, p es esa misma subida leída al revés.' } },
      { id: 'm5w2-s2', text: 'Change timbre by moving picking hand between bridge and neck',
        text_es: 'Cambiar el timbre moviendo la mano de pulsar entre el puente y el mástil',
        gotItWhen: 'the difference between your "bright" (near the bridge) and "warm" (near the neck) tones is clear on a recording without you saying which is which.',
        gotItWhen_es: 'la diferencia entre tu timbre "brillante" (cerca del puente) y "cálido" (cerca del mástil) es clara en una grabación sin que digas cuál es cuál.',
        practice: { type: 'mc', prompt: 'You want a warmer, rounder tone for a quiet verse. Where should your picking hand move?',
          prompt_es: 'Quieres un timbre más cálido y redondo para una estrofa tranquila. ¿Hacia dónde debe moverse tu mano de pulsar?',
          choices: ['Toward the neck, over the fretboard', 'Tight against the bridge', 'Nowhere — tone comes from the guitar, not your hands', 'Higher up the frets with the fretting hand'],
          choices_es: ['Hacia el mástil, sobre el diapasón', 'Pegada contra el puente', 'A ningún lado — el timbre viene de la guitarra, no de tus manos', 'Más arriba en los trastes con la mano de trastear'], answer: 0,
          explain: 'Near the neck sounds warm and round; near the bridge sounds bright and thin. Your picking-hand position is a built-in tone control.',
          explain_es: 'Cerca del mástil suena cálido y redondo; cerca del puente suena brillante y delgado. La posición de tu mano de pulsar es un control de timbre integrado.' } },
      { id: 'm5w2-s3', text: 'Perform a hammer-on and a pull-off',
        text_es: 'Ejecutar un hammer-on y un pull-off',
        gotItWhen: 'you can produce the second note with no pick stroke — and it rings as clearly as a picked note.',
        gotItWhen_es: 'puedes producir la segunda nota sin ningún golpe de púa — y suena tan claro como una nota pulsada.',
        practice: { type: 'mc', prompt: 'On a pull-off, your finger starts on the higher fret. How do you make the SECOND note sound?',
          prompt_es: 'En un pull-off, tu dedo empieza en el traste más alto. ¿Cómo haces sonar la SEGUNDA nota?',
          choices: ['Pluck it with your picking hand', 'Snap your finger off the string sideways', 'Hammer down on a lower fret', 'Bend the string up'], choices_es: ['Pulsándola con tu mano de pulsar', 'Sacando el dedo de un tirón hacia el costado', 'Martillando sobre un traste más bajo', 'Doblando la cuerda hacia arriba'], answer: 1,
          explain: 'A pull-off sounds because your finger flicks sideways off the string and plucks it on the way out — no pick stroke at all. Picking the second note would give you the same pitch, but then it isn\'t a pull-off.',
          explain_es: 'Un pull-off suena porque tu dedo sale de la cuerda hacia el costado y la pulsa al salir — sin ningún golpe de púa. Pulsar la segunda nota te daría la misma altura, pero entonces ya no es un pull-off.' } },
      { id: 'm5w2-s4', text: 'Play some notes short and hard, and some long and soft',
        text_es: 'Tocar algunas notas cortas y duras, y otras largas y suaves',
        gotItWhen: 'you can play a short, hard note and a long, held note whenever you want, and the difference is clear on playback.',
        gotItWhen_es: 'puedes tocar una nota corta y seca y una nota larga y sostenida cuando quieras, y la diferencia es clara al escuchar la grabación.',
        practice: { type: 'mc', prompt: 'You want a short, sharp "stab" of a note. What do you do?',
          prompt_es: 'Quieres una nota corta y punzante, como una "puñalada". ¿Qué haces?',
          choices: ['Pick softly and let the note ring out on its own', 'Pick firmly, then stop the string ringing', 'Just turn the volume up', 'Bend the string as you pick it'],
          choices_es: ['Pulsar suave y dejar que la nota suene por sí sola', 'Pulsar firme, y luego detener el sonido de la cuerda', 'Solo subir el volumen', 'Doblar la cuerda mientras la pulsas'], answer: 1,
          explain: 'A short, sharp note needs a hard start (pick firmly) and a quick stop.',
          explain_es: 'Una nota corta y punzante necesita un comienzo fuerte (pulsar firme) y un final rápido.' } },
      { id: 'm5w2-s5', text: 'Play a one-note solo that changes loudness and rhythm',
        text_es: 'Tocar un solo de una sola nota que cambie el volumen y el ritmo',
        gotItWhen: 'you play one note for 8 bars and, on playback, can say what you changed in each bar — no bar played the same way as the bar before it.',
        gotItWhen_es: 'tocas una nota durante 8 compases y, al escuchar la grabación, puedes decir qué cambiaste en cada compás — ningún compás tocado igual que el anterior.',
        practice: { type: 'mc', prompt: 'Your solo is stuck on ONE note for 8 bars. What keeps a listener interested?',
          prompt_es: 'Tu solo está atascado en UNA sola nota durante 8 compases. ¿Qué mantiene interesado al oyente?',
          choices: ['Nothing — you need more notes to be interesting', 'Playing that note as fast as possible the whole time', 'Changing the rhythm, volume, and note length as you go', 'Holding one long note for all 8 bars'],
          choices_es: ['Nada — necesitas más notas para ser interesante', 'Tocar esa nota lo más rápido posible todo el tiempo', 'Ir cambiando el ritmo, el volumen y la duración de la nota', 'Sostener una sola nota larga durante los 8 compases'], answer: 2,
          explain: 'Change the rhythm, the loudness, and the rests. You don\'t need new notes.',
          explain_es: 'Cambia el ritmo, el volumen y los silencios. No necesitas notas nuevas.' } },
      { id: 'm5w2-s6', text: 'Improvise a call-and-response phrase',
        text_es: 'Improvisar una frase de llamada y respuesta',
        gotItWhen: 'on playback, every call ends on a note other than the root and every response ends on the root.',
        gotItWhen_es: 'al escuchar la grabación, cada llamada termina en una nota que no es la raíz y cada respuesta termina en la raíz.',
        practice: { type: 'mc', prompt: 'In a call-and-response phrase, where should the RESPONSE end?',
          prompt_es: 'En una frase de llamada y respuesta, ¿dónde debe terminar la RESPUESTA?',
          choices: ['On any note that feels right', 'On the root note of the key', 'On a note that is not the root', 'On the highest note of the scale'], choices_es: ['En cualquier nota que suene bien', 'En la nota raíz de la tonalidad', 'En una nota que no sea la raíz', 'En la nota más aguda de la escala'], answer: 1,
          explain: 'Ending on the root makes the response sound like an answer, because the ear hears the root as home. The call ends on a different note, so it sounds like a question.',
          explain_es: 'Terminar en la raíz hace que la respuesta suene como una respuesta, porque el oído escucha la raíz como nota base. La llamada termina en otra nota, así que suena como una pregunta.' } },
      { id: 'm5w2-s7', text: 'Name all natural notes on the D string (frets 0–10) and G string (frets 0–10)',
        text_es: 'Nombrar todas las notas naturales de la cuerda Re (trastes 0–10) y la cuerda Sol (trastes 0–10)',
        gotItWhen: 'you can point to any fret 0–10 on D or G and name the note right away, without counting up from the open string.',
        gotItWhen_es: 'puedes señalar cualquier traste 0–10 en Re o Sol y nombrar la nota de inmediato, sin contar desde la cuerda al aire.',
        practice: { type: 'mc', prompt: 'On the G string, what note is at fret 5?',
          prompt_es: 'En la cuerda Sol, ¿qué nota está en el traste 5?',
          choices: ['B', 'C', 'D', 'A'], choices_es: ['B', 'C', 'D', 'A'], answer: 1,
          explain: 'The G string open is G, and counting up five frets runs G–G#–A–A#–B–C, so fret 5 is C. B is one fret lower, at fret 4. Between B and C there is only one fret (a half step).',
          explain_es: 'La cuerda Sol al aire es G, y contando cinco trastes hacia arriba va G–G#–A–A#–B–C, así que el traste 5 es C. B está un traste más abajo, en el traste 4. Entre B y C hay solo un traste (un semitono).' } }
    ]
  },

  {
    id: 'm5w3',
    label: 'Set 3',
    locked: false,
    module: 'Major / Minor / Blues Pentatonic Scales',
    moduleNum: 5,
    unit: 'Module 5 · Major / Minor / Blues Pentatonic Scales',
    unit_es: 'Módulo 5 · Escalas pentatónicas mayor, menor y de blues',
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
            title: 'Watch: vibrato',
            title_es: 'Mira: vibrato',
            steps: [
          {
            // Hidden 2026-10-16 (Module 5 trim): the same Marty Music video as Set 1, and Challenge 1 — Relative Scales below teaches the same idea on the guitar. The set now opens with the vibrato video.
            hidden: true,
            label: 'Re-watch: major/minor connection', label_es: 'Vuelve a mirar: conexión mayor/menor',
            text: 'Re-watch the same video from Set 1 — <a href="https://youtu.be/m_IiyJu60-c?t=105" target="_blank">Major Pentatonic Scale – Marty Music</a> (the link skips the intro) — this time listening for the major/minor connection. Then prove it on your own neck:<ol><li>Play Pattern 1 and call the low E root (1st finger) "home" for minor.</li><li>Then treat the note three frets higher (4th finger, same string) as "home" and hear the same shape turn major.</li></ol>You\'ve got it when: you have played the pattern twice each way, landing on the "home" note at the end of both.',
            text_es: 'Vuelve a mirar el mismo video de la Unidad 1 — <a href="https://youtu.be/m_IiyJu60-c?t=105" target="_blank">Major Pentatonic Scale – Marty Music</a> (el enlace se salta la intro) — esta vez escuchando la conexión mayor/menor. Luego compruébalo en tu propio mástil:<ol><li>Toca el Patrón 1 y llama "nota base" a la raíz de la Mi grave (dedo 1º) para menor.</li><li>Luego trata la nota tres trastes más arriba (dedo 4º, misma cuerda) como "nota base" y escucha cómo la misma forma se vuelve mayor.</li></ol>Lo tienes cuando: ya tocaste el patrón dos veces de cada manera, cayendo en la "nota base" al final de las dos.',
            hint: 'Same five notes, two names: whichever note you treat as "home" (the root) decides whether it sounds major or minor. Your hand stays in one place — only which note you call "home" changes.',
            hint_es: 'Las mismas cinco notas, dos nombres: la nota que trates como "nota base" (la raíz) decide si suena mayor o menor. Tu mano se queda quieta en un lugar — solo cambia qué nota llamas "nota base."',
            skills: [1, 2],
          },
          {
            label: 'Watch: vibrato technique', label_es: 'Mira: técnica de vibrato',
            text: 'Vibrato is a small, even change in pitch, up and back, on a held note.<ol><li>Watch: <a href="https://youtu.be/WNWqobkgdBA" target="_blank">Vibrato Technique (Hand Movement, TE-103) – JustinGuitar</a> (0:00–3:00).</li><li>Put your ring finger on the G string at fret 7. Put the two fingers behind it on the string for support.</li><li>Pick the note.</li><li>Push the string up a tiny amount and let it come back. Repeat at an even speed.</li></ol>You\'ve got it when: you hold one note for four beats with even vibrato, five times in a row.',
            text_es: 'El vibrato es un cambio pequeño y parejo de la altura, arriba y de vuelta, en una nota sostenida.<ol><li>Mira: <a href="https://youtu.be/WNWqobkgdBA" target="_blank">Vibrato Technique (Hand Movement, TE-103) – JustinGuitar</a> (0:00–3:00).</li><li>Pon el dedo anular en la cuerda Sol, traste 7. Pon los dos dedos de atrás sobre la cuerda para apoyarlo.</li><li>Pulsa la nota.</li><li>Empuja la cuerda hacia arriba una cantidad pequeñita y déjala volver. Repite a una velocidad pareja.</li></ol>Lo tienes cuando: sostienes una nota durante cuatro tiempos con un vibrato parejo, cinco veces seguidas.',
            hint: 'Keep your fingertip on the same fret. Push the string sideways, toward the next string. Listen for the pitch to move.',
            hint_es: 'Mantén la yema en el mismo traste. Empuja la cuerda de lado, hacia la cuerda de al lado. Escucha cómo se mueve la altura.',
            skills: [3],
            response: { type: 'mc', prompt: 'In the video, where does the vibrato movement come from?',
              prompt_es: 'En el video, ¿de dónde viene el movimiento del vibrato?',
              answer: 0,
              explain: 'The wrist turns a little, and the finger moves with it. The fingertip stays on the same fret the whole time. Sliding along the string would change the fret. Squeezing harder and softer barely moves the pitch.',
              explain_es: 'La muñeca gira un poco, y el dedo se mueve con ella. La yema se queda en el mismo traste todo el tiempo. Deslizar a lo largo de la cuerda cambiaría el traste. Apretar más y menos casi no mueve la altura.',
              choices: [
              'A small turn of your fretting-hand wrist',
              'Your fingertip sliding along the string',
              'Your picking hand shaking the string',
              'Squeezing the note harder, then softer'
            ],
              choices_es: [
              'Un pequeño giro de la muñeca de la mano que trastea',
              'La yema del dedo deslizándose a lo largo de la cuerda',
              'La mano de pulsar sacudiendo la cuerda',
              'Apretar la nota más fuerte, y luego más suave'
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
            text: 'The blues scale is the minor pentatonic plus one note: the ♭5 (flat five). In A minor that note is E♭, one fret below E.<ol><li>Press "Hear the A blues scale" below. Listen for the extra note.</li><li>Play it in your Pattern 1 box: low E string frets 5 and 8, A string frets 5, 6 and 7, then D string frets 5 and 7.</li><li>Fret 6 on the A string is the blue note.</li></ol>You\'ve got it when: you play these seven notes up and back three times, and say "blue note" each time you play A-string fret 6.',
            text_es: 'La escala de blues es la pentatónica menor más una nota: la ♭5 (quinta bemol). En A menor esa nota es E♭, un traste debajo de E.<ol><li>Presiona "Escucha la escala de blues de A" abajo. Escucha la nota extra.</li><li>Tócala en tu caja del Patrón 1: cuerda Mi grave trastes 5 y 8, cuerda La trastes 5, 6 y 7, y luego cuerda Re trastes 5 y 7.</li><li>El traste 6 de la cuerda La es la nota de blues.</li></ol>Lo tienes cuando: tocas estas siete notas subiendo y bajando tres veces, y dices "nota de blues" cada vez que tocas el traste 6 de la cuerda La.',
            hint: 'On the A string, the ♭5 sits between the 4 (fret 5) and the 5 (fret 7). It is a passing note: you play it on the way to the next note, not as the note you stop on.',
            hint_es: 'En la cuerda La, la ♭5 queda entre el 4 (traste 5) y el 5 (traste 7). Es una nota de paso: la tocas de camino a la siguiente nota, no como la nota en la que te detienes.',
            skills: [4],
            playSeq: { label: 'Hear the A blues scale', label_es: 'Escucha la escala de blues de A', bpm: 70, notes: [45, 48, 50, 51, 52, 55, 57] },
            response: { type: 'mc', prompt: 'Now play E minor pentatonic at the open strings. On the A string, which fret is the blue note (♭5)?',
              prompt_es: 'Ahora toca E menor pentatónica en las cuerdas al aire. En la cuerda La, ¿qué traste es la nota de blues (♭5)?',
              answer: 0,
              explain: 'In E minor at the open strings, the A string plays the 4 (open) and the 5 (fret 2). The blue note sits between them, at fret 1 (the note B♭). It is the same move as fret 6 in A minor: one fret below the 5.',
              explain_es: 'En E menor en las cuerdas al aire, la cuerda La toca el 4 (al aire) y el 5 (traste 2). La nota de blues queda entre ellos, en el traste 1 (la nota B♭). Es el mismo paso que el traste 6 en A menor: un traste debajo del 5.',
              choices: [
              'Fret 1',
              'Fret 2',
              'Open string',
              'Fret 3'
            ],
              choices_es: [
              'Traste 1',
              'Traste 2',
              'Cuerda al aire',
              'Traste 3'
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
            label: 'Wrap-up: which theory clicked?', label_es: 'Cierre: ¿qué teoría tuvo sentido?',
            text: 'Checkpoint — pause and think: you can now explain how the pentatonic is built, add the blues note, and use vibrato. Which piece of theory finally made sense today, and which still feels fuzzy?',
            text_es: 'Punto de control — pausa y piensa: ahora puedes explicar cómo se construye la pentatónica, agregar la nota de blues, y usar vibrato. ¿Qué parte de la teoría finalmente tuvo sentido hoy, y cuál todavía se siente confusa?',
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
            kind: 'tuning-warmup',
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
            title: 'Play relative major and minor scales',
            title_es: 'Toca las escalas relativas mayor y menor',
            steps: [
          /* INSERTED 2026-09-24 (Module 5 pre-release review, A3) — Set 1's
             "Number the box" promises "Set 3 explains why" the ♭ degrees are
             flat, and m5w3-s1/s2 ask the student to explain how the
             pentatonic is built, but no visible step taught the seven-note
             major scale. Unnumbered, so "Challenge 1" below keeps its number. */
          {
            label: 'Build the pentatonic from the major scale', label_es: 'Construye la pentatónica desde la escala mayor',
            text: 'The major scale is the seven-note do-re-mi scale. The pentatonic scales come from it.<ol><li>Play the C major scale from the TAB below: C D E F G A B, then C again. Say 1 to 7 as you play, then 1 again.</li><li>Play it again, but skip 4 (F) and 7 (B). The five notes left are 1 2 3 5 6. That is C major pentatonic.</li><li>Start the same five notes on A: A C D E G. In A major, the 3 is C♯ and the 7 is G♯. Your C and G are one fret lower, so they are ♭3 and ♭7. That is why A minor pentatonic is 1 ♭3 4 5 ♭7.</li></ol>You\'ve got it when: you play the C major scale, then the five pentatonic notes, two times each, and name the two notes you skipped (F and B).',
            text_es: 'La escala mayor es la escala de siete notas do-re-mi. Las escalas pentatónicas salen de ella.<ol><li>Toca la escala de C mayor del TAB de abajo: C D E F G A B, y luego C otra vez. Di del 1 al 7 mientras tocas, y luego 1 otra vez.</li><li>Tócala otra vez, pero sáltate el 4 (F) y el 7 (B). Las cinco notas que quedan son 1 2 3 5 6. Esa es C mayor pentatónica.</li><li>Empieza las mismas cinco notas en A: A C D E G. En A mayor, el 3 es C♯ y el 7 es G♯. Tu C y tu G quedan un traste más abajo, así que son ♭3 y ♭7. Por eso A menor pentatónica es 1 ♭3 4 5 ♭7.</li></ol>Lo tienes cuando: tocas la escala de C mayor, y luego las cinco notas pentatónicas, dos veces cada una, y nombras las dos notas que te saltaste (F y B).',
            hint: 'Pentatonic means five notes. The major pentatonic is the major scale with two notes taken out.',
            hint_es: 'Pentatónica significa cinco notas. La pentatónica mayor es la escala mayor sin dos de sus notas.',
            stuck: 'Play only the first five notes of the scale (C D E F G) and say 1 2 3 4 5. Then play C D E G and say 1 2 3 5.',
            stuck_es: 'Toca solo las primeras cinco notas de la escala (C D E F G) y di 1 2 3 4 5. Luego toca C D E G y di 1 2 3 5.',
            skills: [1, 2],
            playSeq: { label: 'Hear C major pentatonic', label_es: 'Escucha C mayor pentatónica', bpm: 60, notes: [48, 50, 52, 55, 57, 60] },
            tab: {
              caption: 'C major scale · A, D and G strings · degrees 1 to 7, then 1 again',
              caption_es: 'Escala de C mayor · cuerdas La, Re y Sol · grados 1 a 7, y luego 1 otra vez',
              notes: [
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'D', fret: 2, note: 'E', midi: 52 },
                { string: 'D', fret: 3, note: 'F', midi: 53 },
                { string: 'D', fret: 5, note: 'G', midi: 55 },
                { string: 'G', fret: 2, note: 'A', midi: 57 },
                { string: 'G', fret: 4, note: 'B', midi: 59 },
                { string: 'G', fret: 5, note: 'C', midi: 60 }
              ]
            }
          },
          {
            label: 'Challenge 1 — Relative Scales', label_es: 'Reto 1 — Escalas relativas',
            text: 'Relative scales share the same notes. Only the root, the "home" note, changes. Play one octave on the low E, A, D and G strings, and say each note name as you play it.<ol><li>Play C major pentatonic: C, D, E, G, A.</li><li>Play A minor pentatonic: A, C, D, E, G.</li><li>Play both again.</li></ol>You\'ve got it when: you play both scales twice and name the five notes they share.',
            text_es: 'Las escalas relativas comparten las mismas notas. Solo cambia la raíz, la "nota base". Toca una octava en las cuerdas Mi grave, La, Re y Sol, y di el nombre de cada nota al tocarla.<ol><li>Toca C mayor pentatónica: C, D, E, G, A.</li><li>Toca A menor pentatónica: A, C, D, E, G.</li><li>Toca las dos otra vez.</li></ol>Lo tienes cuando: tocas las dos escalas dos veces y nombras las cinco notas que comparten.',
            hint: 'Your hand stays in the same place. Only the note you treat as home changes.',
            hint_es: 'Tu mano se queda en el mismo lugar. Solo cambia la nota que tratas como nota base.',
            stuck: 'Say the five notes once: A C D E G. With A as home, the scale is minor. With C as home, it is major.',
            stuck_es: 'Di las cinco notas una vez: A C D E G. Con A como nota base, la escala es menor. Con C como nota base, es mayor.',
            levelUp: 'Find another pair: G major and E minor. Show that they share five notes.',
            levelUp_es: 'Encuentra otro par: G mayor y E menor. Muestra que comparten cinco notas.',
            skills: [1, 2, 5],
          }
            ]
          },
          {
            title: 'Compose a 4-bar solo',
            title_es: 'Compón un solo de 4 compases',
            steps: [
          {
            label: 'Challenge 2 — Compose It in Scale Degrees', label_es: 'Reto 2 — Compónlo en grados de escala',
            text: '<ol><li>Write a 4-bar solo as scale-degree numbers, for example: 1 ♭3 5 ♭3 | ♭7 5 ♭3 1 | …</li><li>Type your 4 bars into the box below so you have them next time.</li><li>Play exactly what you wrote. Choose your own rhythms.</li></ol>You\'ve got it when: you play your 4 bars the same way two times in a row.<span class="step-figure"><img src="img/m4-pentatonic-degrees.svg" alt="A fretboard diagram of A minor pentatonic Pattern 1 across all six strings, frets 0 to 12, with scale-degree numbers marked: on the low E and high e strings, 1 at fret 5 and ♭3 at fret 8; on the A string, 4 at fret 5 and 5 at fret 7; on the D string, ♭7 at fret 5 and 1 at fret 7; on the G string, ♭3 at fret 5 and 4 at fret 7; on the B string, 5 at fret 5 and ♭7 at fret 8." width="640" height="244"></span>',
            text_es: '<ol><li>Escribe un solo de 4 compases como números de grado de escala, por ejemplo: 1 ♭3 5 ♭3 | ♭7 5 ♭3 1 | …</li><li>Escribe tus 4 compases en el cuadro de abajo para tenerlos la próxima vez.</li><li>Toca exactamente lo que escribiste. Elige tus propios ritmos.</li></ol>Lo tienes cuando: tocas tus 4 compases de la misma manera dos veces seguidas.<span class="step-figure"><img src="img/m4-pentatonic-degrees-es.svg" alt="Un diagrama del diapasón del Patrón 1 de A menor pentatónica en las seis cuerdas, trastes 0 a 12, con los números de grado de escala marcados: en las cuerdas Mi grave y mi aguda, 1 en el traste 5 y ♭3 en el traste 8; en la cuerda La, 4 en el traste 5 y 5 en el traste 7; en la cuerda Re, ♭7 en el traste 5 y 1 en el traste 7; en la cuerda Sol, ♭3 en el traste 5 y 4 en el traste 7; en la cuerda Si, 5 en el traste 5 y ♭7 en el traste 8." width="640" height="244"></span>',
            hint: 'The ♭ means one fret lower than in the major scale.',
            hint_es: 'El ♭ significa un traste más abajo que en la escala mayor.',
            stuck: 'Write bar 1 first: 4 degrees you like. Play it until it sounds good. You can use it again for bar 3.',
            stuck_es: 'Escribe primero el compás 1: 4 grados que te gusten. Tócalo hasta que suene bien. Puedes usarlo otra vez en el compás 3.',
            levelUp: 'End bar 4 on 1, the root. Or add a hammer-on, or the ♭5 blue note as a passing note.',
            levelUp_es: 'Termina el compás 4 en el 1, la raíz. O agrega un hammer-on, o la nota de blues ♭5 como nota de paso.',
            skills: [6, 7],
            response: { type: 'short', prompt: 'Write your 4-bar solo as scale-degree numbers (use | between bars):', prompt_es: 'Escribe tu solo de 4 compases como números de grado de escala (usa | entre compases):', placeholder: 'e.g. 1 ♭3 5 ♭3 | ♭7 5 ♭3 1 | 5 4 ♭3 1 | 1 — — —', placeholder_es: 'p. ej. 1 ♭3 5 ♭3 | ♭7 5 ♭3 1 | 5 4 ♭3 1 | 1 — — —' }
          }
            ]
          },
          {
            title: 'Read a lick at first sight',
            title_es: 'Lee un lick a primera vista',
            steps: [
          {
            label: 'Challenge — Reading at First Sight (Knowledge & Reading)', label_es: 'Reto — Lectura a primera vista (Conocimiento y lectura)',
            text: 'A lick is a short solo phrase. This 4-bar lick uses the A minor pentatonic box.<ol><li>Read the TAB first. Name each string and fret, left to right.</li><li>Play it before you press Play tab.</li></ol>You\'ve got it when: you play all 16 notes in order at 60 BPM before you press Play tab, with no more than one stop.',
            text_es: 'Un lick es una frase corta de solo. Este lick de 4 compases usa la caja de A menor pentatónica.<ol><li>Lee el TAB primero. Nombra cada cuerda y traste, de izquierda a derecha.</li><li>Tócalo antes de presionar Tocar el tab.</li></ol>Lo tienes cuando: tocas las 16 notas en orden a 60 BPM antes de presionar Tocar el tab, con no más de una parada.',
            hint: 'The bottom TAB line is the low E. The top line is the high e. The number is the fret. Say each one out loud, for example "G string, fret 5, C". Then press Play tab to check.',
            hint_es: 'La línea inferior del TAB es la Mi grave. La línea superior es la mi aguda. El número es el traste. Di cada uno en voz alta, por ejemplo "cuerda Sol, traste 5, C". Luego presiona Tocar el tab para comprobarlo.',
            stuck: 'Read two notes at a time. Find each note on the neck before you play it.',
            stuck_es: 'Lee dos notas a la vez. Encuentra cada nota en el mástil antes de tocarla.',
            levelUp: 'Read it backwards, right to left. Or play the same shape in the E minor box, at the open strings.',
            levelUp_es: 'Léelo al revés, de derecha a izquierda. O toca la misma forma en la caja de E menor, en las cuerdas al aire.',
            skills: [8],
            tab: {
              caption: 'At-first-sight lick · A minor pentatonic box · four bars',
              caption_es: 'Lick a primera vista · caja de A menor pentatónica · cuatro compases',
              notes: [
                // Bar 1 — start on the middle A and step down (not the
                // Pattern 1 climb students have drilled since Set 1)
                { string: 'D', fret: 7, note: 'A', midi: 57 },
                { string: 'D', fret: 5, note: 'G', midi: 55 },
                { string: 'A', fret: 7, note: 'E', midi: 52 },
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                // Bar 2 — turn and climb back up
                { string: 'A', fret: 7, note: 'E', midi: 52 },
                { string: 'D', fret: 5, note: 'G', midi: 55 },
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
            label: 'Challenge 3 — Record Over the Am Jam Track (assessment preparation)', label_es: 'Reto 3 — Graba sobre la pista de jam en Am (preparación para la evaluación)',
            text: 'Play your 4-bar solo over a backing track. Use at least one hammer-on, pull-off or vibrato.<ol><li>Start the <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; Am jam track</a>. Or open &#x1F3B5; Songs in the left menu and pick the "the cure" or "Watchtower" backing track. Both are in A minor.</li><li>Record your solo from memory.</li><li>On the recording, say which plan you used: "call-and-response" or "four phrases".</li><li>Listen back.</li></ol>You\'ve got it when: you play from memory with the track from start to finish, with no restarts.',
            text_es: 'Toca tu solo de 4 compases sobre una pista de acompañamiento. Usa por lo menos un hammer-on, pull-off o vibrato.<ol><li>Pon la <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; pista de jam en Am</a>. O abre &#x1F3B5; Canciones en el menú de la izquierda y elige la pista de acompañamiento de "the cure" o de "Watchtower". Las dos están en A menor.</li><li>Graba tu solo de memoria.</li><li>En la grabación, di qué plan usaste: "llamada y respuesta" o "cuatro frases".</li><li>Escúchala después.</li></ol>Lo tienes cuando: tocas de memoria con la pista de principio a fin, sin reiniciar.',
            hint: 'Don\'t just run up and down the scale. Play short ideas with rests.',
            hint_es: 'No solo subas y bajes la escala. Toca ideas cortas con silencios.',
            stuck: 'Play your 4 bars alone, slowly, with no track. Then add the track and one technique.',
            stuck_es: 'Toca tus 4 compases solo, despacio, sin pista. Luego agrega la pista y una técnica.',
            levelUp: 'Play it standing up, or for someone at home. Or move your solo to E minor and play it in the open-string box.',
            levelUp_es: 'Tócalo de pie, o para alguien en casa. O pasa tu solo a E menor y tócalo en la caja de las cuerdas al aire.',
            skills: [3, 6, 7]
          }
            ]
          },
          {
            kind: 'reflection',
            title: 'Wrap-Up',
            title_es: 'Cierre',
            steps: [
              {
                label: 'Wrap-up: reflect on your solo', label_es: 'Cierre: reflexiona sobre tu solo',
                text: 'You composed and performed an original solo — what are you proudest of, and what would make the next one better? Write it below; this is the kind of reflection your end-of-module recorded performance builds on.',
                text_es: 'Compusiste y tocaste un solo original — ¿de qué estás más orgulloso, y qué haría mejor el siguiente? Escríbelo abajo; este es el tipo de reflexión sobre el que se construye tu presentación grabada de fin de módulo.',
              }
            ]
          }
        ]
      }
    },

    skills: [
      { id: 'm5w3-s1', text: 'Explain how a major pentatonic scale is built from the major scale',
        text_es: 'Explicar cómo se construye una escala pentatónica mayor desde la escala mayor',
        gotItWhen: 'you can list the scale degrees from memory and name the 5 notes in any major key you pick.',
        gotItWhen_es: 'puedes enumerar los grados de la escala de memoria y nombrar las 5 notas en cualquier tonalidad mayor que elijas.',
        practice: { type: 'mc', prompt: 'Which scale degrees make up a MAJOR pentatonic scale?',
          prompt_es: '¿Qué grados de escala forman una escala pentatónica MAYOR?',
          choices: ['1 2 3 4 5', '1 2 3 5 6', '1 ♭3 4 5 ♭7', '1 3 5 7 9'], choices_es: ['1 2 3 4 5', '1 2 3 5 6', '1 ♭3 4 5 ♭7', '1 3 5 7 9'], answer: 1,
          explain: 'Major pentatonic is the major scale with the 4th and 7th removed, leaving 1 2 3 5 6 — five notes, which is what "pentatonic" means. 1 2 3 4 5 is just the first five degrees in a row, not a pentatonic scale.',
          explain_es: 'La pentatónica mayor es la escala mayor sin el 4º ni el 7º grado, y quedan 1 2 3 5 6 — cinco notas, que es justo lo que significa "pentatónica". 1 2 3 4 5 son solo los primeros cinco grados seguidos, no una escala pentatónica.' } },
      { id: 'm5w3-s2', text: 'Explain what a minor pentatonic scale is and name its five scale degrees',
        text_es: 'Explicar qué es una escala pentatónica menor y nombrar sus cinco grados de escala',
        gotItWhen: 'you can list the minor pentatonic degrees from memory and say which two degrees are flat compared to the major scale.',
        gotItWhen_es: 'puedes enumerar los grados de la pentatónica menor de memoria y decir cuáles dos grados son bemol en comparación con la escala mayor.',
        practice: { type: 'mc', prompt: 'Which scale degrees make up a MINOR pentatonic scale?',
          prompt_es: '¿Qué grados de escala forman una escala pentatónica MENOR?',
          choices: ['1 2 3 5 6', '1 ♭3 4 5 ♭7', '1 ♭3 4 ♭5 ♭7', '1 ♭2 ♭3 5 ♭7'], choices_es: ['1 2 3 5 6', '1 ♭3 4 5 ♭7', '1 ♭3 4 ♭5 ♭7', '1 ♭2 ♭3 5 ♭7'], answer: 1,
          explain: 'Minor pentatonic is 1 ♭3 4 5 ♭7, and the flatted 3rd is what makes it sound minor. 1 ♭3 4 ♭5 ♭7 swaps out the 5. The blues scale keeps the 5 AND adds the ♭5, so it has six notes.',
          explain_es: 'La pentatónica menor es 1 ♭3 4 5 ♭7, y es la 3ª bemol la que la hace sonar menor. 1 ♭3 4 ♭5 ♭7 quita el 5. La escala de blues conserva el 5 Y agrega la ♭5, así que tiene seis notas.' } },
      { id: 'm5w3-s3', text: 'Add vibrato on at least one sustained note',
        text_es: 'Agregar vibrato en al menos una nota sostenida',
        gotItWhen: 'you hold one note and push the string up and back a tiny amount, evenly, four times in a row, and hear the pitch move each time.',
        gotItWhen_es: 'sostienes una nota y empujas la cuerda hacia arriba y de vuelta una cantidad pequeñita, pareja, cuatro veces seguidas, y escuchas cómo se mueve la altura cada vez.',
        practice: { type: 'mc', prompt: 'Your vibrato sounds like nervous shaking instead of music. What\'s the fix?',
          prompt_es: 'Tu vibrato suena como un temblor nervioso en vez de música. ¿Cuál es el arreglo?',
          choices: ['Shake your whole hand faster', 'Slide your finger along the string to a new fret', 'Press harder so the note can\'t move at all', 'Slow down — rock the finger in an even, repeating rhythm'],
          choices_es: ['Sacudir toda tu mano más rápido', 'Deslizar tu dedo a lo largo de la cuerda hasta un traste nuevo', 'Presionar más fuerte para que la nota no pueda moverse', 'Ir más despacio — mecer el dedo en un ritmo parejo y repetido'], answer: 3,
          explain: 'Good vibrato is a controlled, even up-and-back movement; speed comes later. Sliding changes frets, and pressing harder stops the movement.',
          explain_es: 'El buen vibrato es un movimiento controlado y parejo, arriba y de vuelta; la velocidad viene después. Deslizar cambia de traste, y presionar más fuerte detiene el movimiento.' } },
      { id: 'm5w3-s4', text: 'Find and play the ♭5 blues note within Pattern 1',
        text_es: 'Encontrar y tocar la nota de blues ♭5 dentro del Patrón 1',
        gotItWhen: 'you can find the ♭5 in Pattern 1 and play it between two other scale notes, on the way to the next one — never as the note you stop on.',
        gotItWhen_es: 'puedes encontrar la ♭5 en el Patrón 1 y tocarla entre dos notas de la escala, de camino a la siguiente — nunca como la nota en la que te detienes.',
        practice: { type: 'mc', prompt: 'In the A blues scale, what is the ♭5 "blues note"?',
          prompt_es: 'En la escala de blues de A, ¿cuál es la "nota de blues" ♭5?',
          choices: ['D♭', 'D', 'E♭', 'E'], choices_es: ['D♭', 'D', 'E♭', 'E'], answer: 2,
          explain: 'Counting up from A, the 5th degree is E, so the ♭5 is E lowered a half step (one fret) to E♭. D is right next to it in the scale, but D is degree 4.',
          explain_es: 'Contando desde A, el grado 5 es E, así que la ♭5 es E bajado un semitono (un traste) hasta E♭. D está justo al lado en la escala, pero D es el grado 4.' } },
      { id: 'm5w3-s5', text: 'Explain how C major pentatonic and A minor pentatonic are relative scales',
        text_es: 'Explicar cómo C mayor pentatónica y A menor pentatónica son escalas relativas',
        gotItWhen: 'you can explain that they share the same 5 notes — only the root changes — and prove it on the fretboard.',
        gotItWhen_es: 'puedes explicar que comparten las mismas 5 notas — solo cambia la raíz — y comprobarlo en el diapasón.',
        practice: { type: 'mc', prompt: 'C major pentatonic and A minor pentatonic contain the exact same 5 notes. What\'s different between them?',
          prompt_es: 'C mayor pentatónica y A menor pentatónica contienen exactamente las mismas 5 notas. ¿Qué es diferente entre ellas?',
          choices: ['Which note feels like "home" (the root)', 'They use different hand shapes', 'A minor has 6 notes, C major has 5', 'They\'re played on different strings'], choices_es: ['Qué nota se siente como "nota base" (la raíz)', 'Usan formas de mano diferentes', 'A menor tiene 6 notas, C mayor tiene 5', 'Se tocan en cuerdas diferentes'], answer: 0,
          explain: 'Relative scales share every note — the only thing that changes is which one your ear treats as home. Same frets, same hand shape, different landing note, and that alone flips the mood from bright to dark.',
          explain_es: 'Las escalas relativas comparten todas las notas — lo único que cambia es cuál trata tu oído como nota base. Los mismos trastes, la misma forma de la mano, distinta nota de aterrizaje, y solo eso cambia el ánimo de brillante a oscuro.' } },
      { id: 'm5w3-s6', text: 'Compose and write out a 4-bar original solo using scale degrees',
        text_es: 'Componer y escribir un solo original de 4 compases usando grados de escala',
        gotItWhen: 'you have 4 bars written down in scale-degree numbers and you can play exactly what you wrote — not improvise something different.',
        gotItWhen_es: 'tienes 4 compases escritos en números de grado de escala y puedes tocar exactamente lo que escribiste — no improvisar algo distinto.',
        practice: { type: 'mc', prompt: 'You\'re writing your solo in scale degrees. In A minor pentatonic (A · C · D · E · G), which note is degree 4?',
          prompt_es: 'Estás escribiendo tu solo en grados de escala. En A menor pentatónica (A · C · D · E · G), ¿qué nota es el grado 4?',
          choices: ['C', 'D', 'E', 'G'],
          choices_es: ['C', 'D', 'E', 'G'], answer: 1,
          explain: 'Count from the root: 1=A, ♭3=C, 4=D, 5=E, ♭7=G. Writing in degrees is what lets you move the same solo to any key.',
          explain_es: 'Cuenta desde la raíz: 1=A, ♭3=C, 4=D, 5=E, ♭7=G. Escribir en grados es lo que te permite mover el mismo solo a cualquier tonalidad.' } },
      { id: 'm5w3-s7', text: 'Play your own solo from memory over a course song\'s backing track, on the beat',
        text_es: 'Tocar tu propio solo de memoria sobre la pista de acompañamiento de una canción del curso, a tiempo',
        gotItWhen: 'you play your 4-bar solo all the way through with the backing track, on the beat and with no restarts, and say which plan you used (call-and-response or four phrases).',
        gotItWhen_es: 'tocas tu solo de 4 compases de principio a fin con la pista de acompañamiento, a tiempo y sin reiniciar, y dices qué plan usaste (llamada y respuesta o cuatro frases).',
        practice: { type: 'pr', prompt: '<ol><li>Play your 4-bar solo over the backing track, holding its pulse.</li><li>Count how many times in a row you get through with no restart.</li><li>Log your best streak.</li></ol>',
          prompt_es: '<ol><li>Toca tu solo de 4 compases sobre la pista de acompañamiento, sosteniendo su pulso.</li><li>Cuenta cuántas veces seguidas puedes completarlo sin reiniciar.</li><li>Anota tu mejor racha.</li></ol>',
          unit: 'count', placeholder: 'e.g. 3 in a row — try for a longer streak', placeholder_es: 'p. ej. 3 seguidas — intenta una racha más larga' } },
      { id: 'm5w3-s8', text: 'Sight-read a short 4-bar pentatonic lick from TAB and play it',
        text_es: 'Leer a primera vista un lick pentatónico corto de 4 compases del TAB y tocarlo',
        gotItWhen: 'you read a 4-bar pentatonic lick from TAB without hearing it first, and play it with no wrong notes.',
        gotItWhen_es: 'lees un lick pentatónico de 4 compases del TAB sin escucharlo antes, y lo tocas sin notas equivocadas.',
        practice: { type: 'mc', prompt: 'A TAB line shows "5 7" on the G-string line. What do those numbers tell you?',
          prompt_es: 'Una línea de TAB muestra "5 7" en la línea de la cuerda Sol. ¿Qué te dicen esos números?',
          choices: ['Which frets to press on the G string — fret 5, then fret 7', 'Which fingers to use — like the numbers on a chord diagram', 'How many times to pick each note', 'Which beats of the bar the notes land on'],
          choices_es: ['Qué trastes presionar en la cuerda Sol — el traste 5, y luego el 7', 'Qué dedos usar — como los números en un diagrama de acorde', 'Cuántas veces pulsar cada nota', 'En qué tiempos del compás caen las notas'], answer: 0,
          explain: 'In TAB, numbers are always FRETS on the string that line represents. (In chord diagrams numbers mean fingers — that\'s the classic mix-up.)',
          explain_es: 'En el TAB, los números siempre son TRASTES en la cuerda que representa esa línea. (En los diagramas de acorde los números significan dedos — esa es la confusión clásica.)' } }
    ]
  }

); // end module-5.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[5] = [
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
      { name: '"12-bar blues in E"', name_es: '"Blues de 12 compases en E"', meta:'E minor pentatonic — classic improv context', meta_es: 'E menor pentatónica — contexto clásico de improvisación', type: 'Choice', core: false, level: 1,
        tutorialUrl: 'https://www.youtube.com/watch?v=pJL2j2v6XZM' },
      { name: '"La Bamba" — Ritchie Valens', meta: 'C major pentatonic — bright and fun', meta_es: 'C mayor pentatónica — brillante y divertida', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=BycLmWI97Nc',
        tutorialUrl: 'https://www.youtube.com/watch?v=o-SdTXIAvTE&start=52' },
      { name: '"Back in Black" — AC/DC', meta: 'Simplified solo intro — A minor pentatonic', meta_es: 'Intro de solo simplificada — A menor pentatónica', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=pAgnJDJN4VA',
        tutorialUrl: 'https://www.youtube.com/watch?v=aeYDJciDuao' },
      { name: '"Boom Boom" — John Lee Hooker', meta: 'E blues pentatonic — call and response phrasing', meta_es: 'E blues pentatónica — fraseo de llamada y respuesta', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=jZv04xAejrc',
        tutorialUrl: 'https://www.youtube.com/watch?v=dutLP1SoSLs&t=8' },
      { name: '"Purple Haze" — Jimi Hendrix', meta: 'E pentatonic box — full pattern', meta_es: 'Caja de E pentatónica — patrón completo', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=WGoDaYjdfSg',
        tutorialUrl: 'https://www.youtube.com/watch?v=gKhmARXdWGE&start=8' }
    ];

MODULE_REVIEWS[5] = {
  moduleNum: 5,
  module: 'Major / Minor / Blues Pentatonic Scales',
  module_es: 'Escalas pentatónicas mayor, menor y de blues',
  skills: [
    { id: 'mr5-s1', text: 'I can play Pentatonic Pattern 1 ascending AND descending from memory — no diagram, no missed notes or pauses',
      text_es: 'Puedo tocar el Patrón pentatónico 1 subiendo Y bajando de memoria — sin diagrama, sin notas falladas ni pausas', set: 'm5w1' },
    { id: 'mr5-s2', text: 'I can use alternate picking (down-up) automatically at 60 BPM, every note on a beat, without losing the click',
      text_es: 'Puedo usar púa alterna (abajo-arriba) automáticamente a 60 BPM, cada nota en un tiempo, sin perder el clic', set: 'm5w1' },
    { id: 'mr5-s3', text: 'I can position Pattern 1 as a MINOR scale (1st finger on root) or a MAJOR scale (4th finger on root) for any key you are given',
      text_es: 'Puedo posicionar el Patrón 1 como escala MENOR (dedo índice en la raíz) o escala MAYOR (dedo meñique en la raíz) para cualquier tonalidad que te den', set: 'm5w1' },
    { id: 'mr5-s6', text: 'I can perform a hammer-on and a pull-off',
      text_es: 'Puedo ejecutar un hammer-on y un pull-off', set: 'm5w2' },
    { id: 'mr5-s7', text: 'I can name all natural notes on the D string (frets 0–10) and the G string (frets 0–10)',
      text_es: 'Puedo nombrar todas las notas naturales en la cuerda Re (trastes 0–10) y la cuerda Sol (trastes 0–10)', set: 'm5w2' },
    { id: 'mr5-s5', text: 'I can play the same note quiet, medium and loud on purpose (p, mf, f), and change its tone by moving my picking hand between the bridge and the neck',
      text_es: 'Puedo tocar la misma nota suave, media y fuerte a propósito (p, mf, f), y cambiar su timbre moviendo mi mano de pulsar entre el puente y el mástil', set: 'm5w2' },
    { id: 'mr5-s9', text: 'I can add vibrato to a long note',
      text_es: 'Puedo agregar vibrato a una nota larga', set: 'm5w3' },
    { id: 'mr5-s8', text: 'I can explain how major (1 2 3 5 6) and minor (1 ♭3 4 5 ♭7) pentatonic are built, that they\'re relative (same 5 notes), and where the ♭5 blue note goes',
      text_es: 'Puedo explicar cómo se construyen la pentatónica mayor (1 2 3 5 6) y menor (1 ♭3 4 5 ♭7), que son relativas (mismas 5 notas), y dónde va la nota de blues ♭5', set: 'm5w3' },
    { id: 'mr5-s10', text: 'I can perform my original 4-bar solo over a backing track from memory — holding its pulse with no restarts, using at least one hammer-on, pull-off, or vibrato, and saying which plan I used (call-and-response or four phrases)',
      text_es: 'Puedo tocar mi solo original de 4 compases sobre una pista de acompañamiento de memoria — sosteniendo su pulso sin reiniciar, usando al menos un hammer-on, pull-off, o vibrato, y diciendo qué plan usé (llamada y respuesta o cuatro frases)', set: 'm5w3' },
    { id: 'mr5-s11', text: 'I can read a short 4-bar pentatonic lick from TAB that I haven\'t practiced and play it accurately',
      text_es: 'Puedo leer un lick pentatónico corto de 4 compases del TAB que no he practicado y tocarlo con precisión', set: 'm5w3' }
  ],
  assessItems: [
    'Perform an original 4-bar solo over a course-song backing track, holding its pulse with no restarts, using the minor pentatonic box and at least one hammer-on, pull-off, or vibrato, with clean notes throughout (no buzz or dead notes — high strings included), following a plan (call-and-response or four-phrase)',
    'Read a short 4-bar pentatonic lick from TAB and play it accurately'
  ],
  assessItems_es: [
    'Toca un solo original de 4 compases sobre la pista de acompañamiento de una canción del curso, sosteniendo su pulso sin reiniciar, usando la caja de pentatónica menor y al menos un hammer-on, pull-off, o vibrato, con notas limpias en todo momento (sin zumbido ni notas apagadas — cuerdas agudas incluidas), siguiendo un plan (llamada y respuesta o cuatro frases)',
    'Lee un lick pentatónico corto de 4 compases del TAB y tócalo con precisión'
  ],
  forward: 'In <strong>Module 6</strong> you go back to the open chords from Module 4 and strum them in new ways: a steady down-up through every change, skipped strums, accents, and three styles — soft, rock and reggae. You also take turns strumming and soloing with this scale.',
  forward_es: 'En el <strong>Módulo 6</strong> vuelves a los acordes al aire del Módulo 4 y los rasgueas de maneras nuevas: un abajo-arriba constante en cada cambio, rasgueos saltados, acentos y tres estilos — suave, rock y reggae. También te turnas entre rasguear e improvisar con esta escala.',
  standards: ['Cr.1a', 'Cr.2a', 'Pr.4a', 'Pr.5a', 'Pr.5b', 'Pr.6a']
};
