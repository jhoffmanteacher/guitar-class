// ============================================================
//  MODULE 9 — The Full Fretboard & Writing TAB
//  Edit this file to change Module 9 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm9w0',
    label: 'Set 1',
    locked: false,
    module: 'The Full Fretboard & Writing TAB',
    moduleNum: 9,
    unit: 'Module 9 · The Full Fretboard & Writing TAB',
    unit_es: 'Módulo 9 · El mástil completo y cómo escribir TAB',
    title: 'Set 1',
    subtitle: 'Welcome back · Prove it, don\'t re-learn it',
    subtitle_es: 'Bienvenido de vuelta · Demuéstralo, no lo vuelvas a aprender',
    skillFocus: 'Six quick re-tests: open chords · strumming · pentatonic · power chords · TAB reading · fingerpicking',
    skillFocus_es: 'Seis repasos rápidos: acordes abiertos · rasgueo · pentatónica · acordes de potencia · lectura de TAB · fingerpicking',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Where do I start?',
        title_es: 'Estación de computadora — ¿Por dónde empiezo?',
        sections: [
          {
            title: 'The six re-tests — rate yourself honestly',
            title_es: 'Los seis repasos — evalúate con honestidad',
            steps: [
              {
                label: 'How the checkpoint works', label_es: 'Cómo funciona el chequeo',
                text: 'This set has zero new material. It\'s a checkpoint: six things you could already do before the break.<ol><li>Play each one RIGHT NOW as you read it.</li><li>Answer honestly — solid, shaky, or gone.</li></ol>Nothing here is graded; a "gone" just tells you where to spend your first practice session.',
                text_es: 'Esta unidad no tiene material nuevo. Es un chequeo: seis cosas que ya podías hacer antes del receso.<ol><li>Toca cada una AHORA MISMO mientras la lees.</li><li>Responde con honestidad — sólida, insegura, o perdida.</li></ol>Nada de esto se califica; un "perdida" solo te dice dónde pasar tu primera sesión de práctica.',
                hint: 'Everyone loses a little over a break. Finding out exactly what you lost is the fastest way to get it back — usually it returns in a day or two, not weeks.',
                hint_es: 'Todos pierden algo durante un receso. Descubrir exactamente qué perdiste es la forma más rápida de recuperarlo — normalmente vuelve en un día o dos, no en semanas.'
              },
              {
                label: 'Re-test 1: open chords', label_es: 'Repaso 1: acordes abiertos',
                text: 'Re-test 1 — Open chords (Module 5): loop C → G → Am → F, two bars each at 60 BPM. Can you still land every change on beat 1 without breaking the strum?',
                text_es: 'Repaso 1 — Acordes abiertos (Módulo 5): repite C → G → Am → F, dos compases cada uno a 60 BPM. ¿Todavía puedes caer en cada cambio justo en el tiempo 1 sin romper el rasgueo?',
                hint: 'If one change drags, name it — that exact change is your first One-Minute Changes drill (a drill is a short exercise you repeat to build a skill).',
                hint_es: 'Si un cambio se atrasa, identifícalo — ese cambio exacto es tu primer ejercicio de Cambios de Un Minuto (un ejercicio es una actividad corta que repites para desarrollar una destreza).',
                skills: [1],
                response: { type: 'short', placeholder: 'Solid / shaky / gone — which change gives you trouble?',
                  placeholder_es: 'Sólida / insegura / perdida — ¿cuál cambio te cuesta trabajo?' }
              },
              {
                label: 'Re-test 2: strumming', label_es: 'Repaso 2: rasgueo',
                text: 'Re-test 2 — Strumming (Module 6): D-DU-UDU over a G → C change at 70 BPM. Does the pattern keep running while the chord moves, or does it break at the change?',
                text_es: 'Repaso 2 — Rasgueo (Módulo 6): D-DU-UDU sobre un cambio de G → C a 70 BPM. ¿El patrón sigue corriendo mientras cambia el acorde, o se rompe en el cambio?',
                hint: 'Watch your strum hand, not your fret hand — the pattern should not care which chord is underneath.',
                hint_es: 'Observa tu mano de rasgueo, no tu mano de trastear — al patrón no le debería importar cuál acorde hay debajo.',
                skills: [2],
                response: { type: 'short', placeholder: 'Solid / shaky / gone — does the pattern break at the change?',
                  placeholder_es: 'Sólida / insegura / perdida — ¿el patrón se rompe en el cambio?' }
              },
              {
                label: 'Re-test 3: pentatonic Pattern 1', label_es: 'Repaso 3: Patrón pentatónico 1',
                text: 'Re-test 3 — Pentatonic (Module 4): Pattern 1, up and back down, from memory. No diagram, every note on a 60 BPM click?',
                text_es: 'Repaso 3 — Pentatónica (Módulo 4): Patrón 1, hacia arriba y de vuelta hacia abajo, de memoria. ¿Sin diagrama, cada nota en el clic a 60 BPM?',
                hint: 'Hesitations count as "shaky" — you should know the pattern by feel, not by reading it.',
                hint_es: 'Las dudas cuentan como "insegura" — deberías saber el patrón por sensación, no por leerlo.',
                skills: [3],
                response: { type: 'short', placeholder: 'Solid / shaky / gone — where do you hesitate?',
                  placeholder_es: 'Sólida / insegura / perdida — ¿dónde dudas?' }
              },
              {
                label: 'Re-test 4: power chords', label_es: 'Repaso 4: acordes de potencia',
                text: 'Re-test 4 — Power chords (Module 3): move the two-finger shape E5 → G5 → A5, one change per bar, landing on the beat and naming each chord as you land it.',
                text_es: 'Repaso 4 — Acordes de potencia (Módulo 3): mueve la forma de dos dedos E5 → G5 → A5, un cambio por compás, cayendo en el tiempo y nombrando cada acorde al caer en él.',
                hint: 'Frets 0 → 3 → 5 on the low E root. If you\'re counting frets to find G5, that\'s a "shaky."',
                hint_es: 'Trastes 0 → 3 → 5 con raíz en la Mi grave. Si estás contando trastes para encontrar G5, eso es "insegura."',
                skills: [4],
                response: { type: 'short', placeholder: 'Solid / shaky / gone — can you still name them quickly while playing?',
                  placeholder_es: 'Sólida / insegura / perdida — ¿todavía puedes nombrarlos rápido mientras tocas?' }
              },
              {
                label: 'Re-test 5: TAB cold read', label_es: 'Repaso 5: TAB a primera vista',
                text: 'Re-test 5 — TAB reading (Module 2):<ol><li>Open any Song Journey page and find a section you\'ve never played.</li><li>Read 4 bars cold (cold = playing it the very first time you see it, no practice) — right strings, right frets, left to right.</li></ol>',
                text_es: 'Repaso 5 — Lectura de TAB (Módulo 2):<ol><li>Abre cualquier página de Recorrido de la canción y busca una sección que nunca hayas tocado.</li><li>Lee 4 compases a primera vista (a primera vista = tocarlo la primera vez que lo ves, sin práctica) — cuerdas correctas, trastes correctos, de izquierda a derecha.</li></ol>',
                hint: 'It must be TAB you haven\'t drilled — reading from memory isn\'t reading.',
                hint_es: 'Debe ser TAB que no hayas practicado — leer de memoria no es leer.',
                skills: [5],
                response: { type: 'short', placeholder: 'Solid / shaky / gone — what did you read, and how did it go?',
                  placeholder_es: 'Sólida / insegura / perdida — ¿qué leíste, y cómo te fue?' }
              },
              {
                label: 'Re-test 6: fingerpicking', label_es: 'Repaso 6: fingerpicking',
                text: 'Re-test 6 — Fingerpicking (Module 8):<ol><li>Fingerpick p-i-m-a over Am, thumb on the A string, without stopping.</li><li>Then change Em → Am and let the thumb switch bass strings while i-m-a stay put.</li></ol>',
                text_es: 'Repaso 6 — Fingerpicking (Módulo 8):<ol><li>Toca con fingerpicking p-i-m-a sobre Am, pulgar en la cuerda La, sin detenerte.</li><li>Luego cambia Em → Am y deja que el pulgar cambie de cuerda grave mientras i-m-a se quedan quietos.</li></ol>',
                hint: 'The fingers keep their strings for the whole test — only the thumb travels.',
                hint_es: 'Los dedos mantienen sus cuerdas durante toda la prueba — solo el pulgar viaja.',
                skills: [6],
                response: { type: 'short', placeholder: 'Solid / shaky / gone — did the thumb switch make you mess up?',
                  placeholder_es: 'Sólida / insegura / perdida — ¿el cambio del pulgar te hizo equivocarte?' }
              }
            ]
          },
          {
            title: 'Checkpoint',
            title_es: 'Punto de control',
            steps: [
              {
                label: 'Pick your weakest re-test', label_es: 'Elige tu repaso más débil',
                text: 'Look at your six answers. Which ONE re-test most needs more practice before you go deeper into Module 9? That\'s the first thing you practice next session — the original module\'s sets are all still there when you need them.',
                text_es: 'Mira tus seis respuestas. ¿Cuál ÚNICO repaso necesita más práctica antes de profundizar en el Módulo 9? Eso es lo primero que practicas la próxima sesión — las unidades del módulo original siguen ahí cuando las necesites.',
                hint: 'One focused session on your weakest re-test is better than a vague "practice everything."',
                hint_es: 'Una sesión enfocada en tu repaso más débil vale más que un vago "practicar todo."',
                response: { type: 'short', placeholder: 'e.g. Re-test 3 — Pattern 1 is half-gone; starting next session with Module 4, Set 1',
                  placeholder_es: 'p. ej. Repaso 3 — el Patrón 1 está a medio olvidar; empiezo la próxima sesión con el Módulo 4, Unidad 1' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — clear it or flag it',
        title_es: 'Estación de práctica — apruébalo o márcalo',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tune all 6 strings', label_es: 'Calentamiento: afina las 6 cuerdas',
                text: 'Start every practice session the same way:<ol><li>Tune all 6 strings to green (E A D G B e).</li><li>Then play each string open.</li></ol>You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera:<ol><li>Afina las 6 cuerdas hasta que estén en verde (E A D G B e).</li><li>Luego toca cada cuerda al aire.</li></ol>Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                hint: 'A break detunes guitars as reliably as it makes your fingers out of practice — check first.',
                hint_es: 'Un receso desafina las guitarras tan seguro como desentrena tus dedos — revisa primero.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'The six re-tests — mark each one as you go',
            title_es: 'Los seis repasos — márcalos a medida que avanzas',
            steps: [
              {
                label: 'How to mark each re-test', label_es: 'Cómo marcar cada repaso',
                text: '<ol><li>Play each re-test below.</li><li>Mark its skill on the checklist.</li><li>Clear it → "I\'ve got it!". Struggle → "Still working on it".</li></ol>That\'s not a failure, it\'s your practice list, and the pointer next to each re-test tells you exactly which module rebuilds it.',
                text_es: '<ol><li>Toca cada repaso de abajo.</li><li>Marca su destreza en la lista de verificación.</li><li>Lo apruebas → "¡Ya lo tengo!". Te cuesta → "Todavía en proceso".</li></ol>Eso no es un fracaso, es tu lista de práctica, y el enlace junto a cada repaso te dice exactamente cuál módulo lo reconstruye.',
                hint: 'Be strict. A generous self-check here just hides work that will come back in Module 10.',
                hint_es: 'Sé estricto. Una autoevaluación generosa aquí solo esconde trabajo que reaparecerá en el Módulo 10.'
              },
              {
                label: 'Re-test 1: open chords', label_es: 'Repaso 1: acordes abiertos',
                text: 'Re-test 1 — Open chords: 2 bars each of C, G, Am, F at 60 BPM, looped twice, every change on beat 1. Where to practice it: Module 5, Set 2 (the C–G–Am–F Loop and One-Minute Changes).',
                text_es: 'Repaso 1 — Acordes abiertos: 2 compases cada uno de C, G, Am, F a 60 BPM, repetido dos veces, cada cambio en el tiempo 1. Dónde practicarlo: Módulo 5, Unidad 2 (el Loop C–G–Am–F y Cambios de Un Minuto).',
                hint: 'Quality bar: no dead strings, no pause at the change.',
                hint_es: 'Nivel de calidad: sin cuerdas apagadas, sin pausa en el cambio.',
                skills: [1]
              },
              {
                label: 'Re-test 2: strumming', label_es: 'Repaso 2: rasgueo',
                text: 'Re-test 2 — Strumming: D-DU-UDU for 4 bars of G, then 4 bars of C at 70 BPM, the pattern never stopping where the two chords meet. Where to practice it: Module 6, Set 2.',
                text_es: 'Repaso 2 — Rasgueo: D-DU-UDU durante 4 compases de G, y luego 4 compases de C a 70 BPM, el patrón nunca se detiene donde se encuentran los dos acordes. Dónde practicarlo: Módulo 6, Unidad 2.',
                hint: 'If it breaks, drop to 60 BPM and rebuild — speed comes back last.',
                hint_es: 'Si se rompe, baja a 60 BPM y reconstrúyelo — la velocidad vuelve al final.',
                skills: [2]
              },
              {
                label: 'Re-test 3: pentatonic Pattern 1', label_es: 'Repaso 3: Patrón pentatónico 1',
                text: 'Re-test 3 — Pentatonic Pattern 1: up and back down from memory at 60 BPM, every note on the click. Use the play button to hear the target. Where to practice it: Module 4, Set 1.',
                text_es: 'Repaso 3 — Patrón pentatónico 1: hacia arriba y de vuelta hacia abajo de memoria a 60 BPM, cada nota en el clic. Usa el botón de reproducir para escuchar el objetivo. Dónde practicarlo: Módulo 4, Unidad 1.',
                hint: 'Fingers first, speed later — a clean 50 BPM pass is better than a sloppy 60.',
                hint_es: 'Primero los dedos, luego la velocidad — una pasada limpia a 50 BPM vale más que una desordenada a 60.',
                skills: [3],
                playSeq: { label: 'Am pentatonic Pattern 1 (ascending)', label_es: 'Patrón pentatónico 1 de Am (ascendente)', bpm: 60, notes: [45, 48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72] }
              },
              {
                label: 'Re-test 4: power chords', label_es: 'Repaso 4: acordes de potencia',
                text: 'Re-test 4 — Power chords: E5 → G5 → A5 (low-E root, frets 0 → 3 → 5), one bar each on the beat, saying each name as you land it. Where to practice it: Module 3, Set 1.',
                text_es: 'Repaso 4 — Acordes de potencia: E5 → G5 → A5 (raíz en la Mi grave, trastes 0 → 3 → 5), un compás cada uno en el tiempo, diciendo cada nombre al caer en él. Dónde practicarlo: Módulo 3, Unidad 1.',
                hint: 'Two fingers, unused strings muted — the mute is part of the skill.',
                hint_es: 'Dos dedos, las cuerdas que no usas silenciadas — el silenciado es parte de la destreza.',
                skills: [4]
              },
              {
                label: 'Re-test 5: TAB cold read', label_es: 'Repaso 5: TAB a primera vista',
                text: 'Re-test 5 — TAB cold read: 4 bars of TAB you\'ve never played, from any Song Journey page, right strings and frets in order. Where to practice it: Module 2, Set 2.',
                text_es: 'Repaso 5 — Lectura a primera vista de TAB: 4 compases de TAB que nunca hayas tocado, de cualquier página de Recorrido de la canción, cuerdas y trastes correctos en orden. Dónde practicarlo: Módulo 2, Unidad 2.',
                hint: 'Slow is fine — sight-reading is decoding, not speed.',
                hint_es: 'Ir despacio está bien — la lectura a primera vista es descifrar, no velocidad.',
                skills: [5]
              },
              {
                label: 'Re-test 6: fingerpicking', label_es: 'Repaso 6: fingerpicking',
                text: 'Re-test 6 — Fingerpicking: p-i-m-a over Am (thumb on A) for 4 bars without stopping, then Em → Am with the thumb switching bass strings while you keep playing. Where to practice it: Module 8, Sets 1–2.',
                text_es: 'Repaso 6 — Fingerpicking: p-i-m-a sobre Am (pulgar en La) durante 4 compases sin detenerte, y luego Em → Am con el pulgar cambiando de cuerda grave mientras sigues tocando. Dónde practicarlo: Módulo 8, Unidades 1–2.',
                hint: 'Even volume across all four fingers — listen for the weak one.',
                hint_es: 'Volumen parejo en los cuatro dedos — escucha cuál es el más débil.',
                skills: [6]
              },
              {
                label: 'Fast round: record all six', label_es: 'Ronda rápida: grábate los seis',
                text: '<ol><li>Record yourself playing all six re-tests back to back.</li><li>Then listen with the checklist open and settle any you weren\'t sure about.</li></ol>Cleared all six? Module 9 proper starts at Set 2. Flagged some? Spend a session with the practice spots listed above first — they come back fast.',
                text_es: '<ol><li>Grábate tocando los seis repasos seguidos.</li><li>Luego escucha con la lista de verificación abierta y resuelve cualquiera del que no estuvieras seguro.</li></ol>¿Aprobaste los seis? El Módulo 9 propiamente empieza en la Unidad 2. ¿Marcaste algunos? Dedica una sesión a los puntos de práctica listados arriba primero — vuelven rápido.',
                hint: 'The recording shows exactly how you really sounded — that\'s exactly why it\'s useful.',
                hint_es: 'La grabación muestra exactamente cómo sonaste de verdad — por eso es tan útil.'
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Clears all six re-tests in one focused session — or leaves with a named practice list and knows exactly which module rebuilds each flagged skill',
      goal_es: 'Aprueba los seis repasos en una sesión enfocada — o termina con una lista de práctica nombrada y sabe exactamente cuál módulo reconstruye cada destreza marcada',
      performance: 'Fast round: record all six re-tests back to back, listen back with the checklist open, and mark each skill honestly — cleared skills "got it," flagged skills "still working" with where to practice them noted.',
      selfCheck: 'Can you still play all six without re-learning anything? Which one faded the most over the break — and which module does it live in?',
      selfCheck_es: '¿Todavía puedes tocar los seis sin tener que volver a aprender nada? ¿Cuál se desvaneció más durante el receso — y en cuál módulo vive?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
    },

    skills: [
      { id: 'm9w0-s1', text: 'RE-TEST: Switch C → G → Am → F smoothly at 60 BPM',
        text_es: 'REPASO: Cambiar C → G → Am → F sin problemas a 60 BPM',
        gotItWhen: 'you loop C → G → Am → F, two bars each at 60 BPM, landing every change on beat 1 without breaking the strum. Level up: close your eyes, point at the chord chart to land on two of those four at random, and switch between them on beat 1 at 70 BPM.',
        gotItWhen_es: 'repites C → G → Am → F, dos compases cada uno a 60 BPM, cayendo en cada cambio en el tiempo 1 sin romper el rasgueo. Sube de nivel: cierra los ojos, señala el diagrama de acordes para elegir dos de esos cuatro al azar, y cambia entre ellos en el tiempo 1 a 70 BPM.',
        practice: { type: 'pr', prompt: '<ol><li>Loop C → G → Am → F, two bars each, every change landing on beat 1.</li><li>Start at 60 BPM and raise the metronome +5 at a time.</li><li>Log your fastest clean BPM.</li></ol>',
          prompt_es: '<ol><li>Repite C → G → Am → F, dos compases cada uno, con cada cambio cayendo en el tiempo 1.</li><li>Empieza a 60 BPM y sube el metrónomo de 5 en 5.</li><li>Anota tu BPM limpio más rápido.</li></ol>',
          unit: 'BPM', placeholder: 'e.g. 70 — try for a higher number next session', placeholder_es: 'p. ej. 70 — intenta superarlo la próxima sesión' } },
      { id: 'm9w0-s2', text: 'RE-TEST: Play D-DU-UDU over a G–C change at 70 BPM',
        text_es: 'REPASO: Tocar D-DU-UDU sobre un cambio de G–C a 70 BPM',
        gotItWhen: 'you switch from G to C (or any two chords) and the pattern doesn\'t change at all — only the chord underneath does.',
        gotItWhen_es: 'cambias de G a C (o cualquier par de acordes) y el patrón no cambia para nada — solo cambia el acorde debajo.',
        practice: { type: 'pr', prompt: '<ol><li>Strum D-DU-UDU over G ↔ C, changing every bar without breaking the pattern.</li><li>Start at 60 BPM and raise the metronome +5 at a time.</li><li>Log your fastest clean BPM (70 was the old goal — beat it).</li></ol>',
          prompt_es: '<ol><li>Rasguea D-DU-UDU sobre G ↔ C, cambiando cada compás sin romper el patrón.</li><li>Empieza a 60 BPM y sube el metrónomo de 5 en 5.</li><li>Anota tu BPM limpio más rápido (70 era la meta anterior — supérala).</li></ol>',
          unit: 'BPM', placeholder: 'e.g. 75 — try for a higher number next session', placeholder_es: 'p. ej. 75 — intenta superarlo la próxima sesión' } },
      { id: 'm9w0-s3', text: 'RE-TEST: Play pentatonic Pattern 1 up and down at 60 BPM',
        text_es: 'REPASO: Tocar el Patrón pentatónico 1 hacia arriba y hacia abajo a 60 BPM',
        gotItWhen: 'you can play the full pattern up and back down without looking at a diagram, with no missed notes or hesitations.',
        gotItWhen_es: 'puedes tocar el patrón completo hacia arriba y de vuelta hacia abajo sin mirar un diagrama, sin notas perdidas ni dudas.',
        practice: { type: 'playSeq', label: 'Am pentatonic Pattern 1 (ascending)', label_es: 'Patrón pentatónico 1 de Am (ascendente)', bpm: 60,
          notes: [45, 48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72] } },
      { id: 'm9w0-s4', text: 'RE-TEST: Move a two-finger power chord E5 → G5 → A5 on the beat',
        text_es: 'REPASO: Mover un acorde de potencia de dos dedos E5 → G5 → A5 en el tiempo',
        gotItWhen: 'you can move the same shape to any of those positions whenever you want and name the chord without counting frets.',
        gotItWhen_es: 'puedes mover la misma forma a cualquiera de esas posiciones cuando quieras y nombrar el acorde sin contar trastes.',
        practice: { type: 'playSeq', label: 'E5 · G5 · A5 roots — two beats each, move on the beat', label_es: 'Raíces E5 · G5 · A5 — dos tiempos cada una, muévete en el tiempo', bpm: 60,
          notes: [40, 40, 43, 43, 45, 45] } },
      { id: 'm9w0-s5', text: 'RE-TEST: Read and play a 4-bar TAB you haven\'t seen before',
        text_es: 'REPASO: Leer y tocar un TAB de 4 compases que no hayas visto antes',
        gotItWhen: 'you can look at a short TAB line you haven\'t drilled, identify which string and fret each number refers to, and play it — that\'s sight-reading.',
        gotItWhen_es: 'puedes mirar una línea corta de TAB que no hayas practicado, identificar a cuál cuerda y traste se refiere cada número, y tocarla — eso es lectura a primera vista.',
        practice: { type: 'mc', prompt: 'A new TAB shows a "3" on the second line from the bottom, then "0 2" side by side on the bottom line. What do you play?',
          prompt_es: 'Un TAB nuevo muestra un "3" en la segunda línea desde abajo, y luego "0 2" lado a lado en la línea de abajo. ¿Qué tocas?',
          choices: ['A string fret 3, then open low E, then low E fret 2', 'All three notes at once, as a single chord', 'Fingers 3, 0, and 2 on any strings you like', 'Frets 3, 0, 2 all on the top string'],
          choices_es: ['Cuerda La traste 3, luego Mi grave al aire y traste 2', 'Las tres notas a la vez, como un solo acorde', 'Dedos 3, 0 y 2 en las cuerdas que quieras', 'Trastes 3, 0 y 2 todos en la cuerda más aguda'], answer: 0,
          explain: 'Side-by-side numbers are played in order; only STACKED numbers sound together. The bottom line is the low E, the line above it is the A.',
          explain_es: 'Los números lado a lado se tocan en orden; solo los números APILADOS suenan juntos. La línea de abajo es la Mi grave; la línea de arriba de ella es la La.' } },
      { id: 'm9w0-s6', text: 'RE-TEST: Fingerpick p-i-m-a over Am without stopping',
        text_es: 'REPASO: Tocar con fingerpicking p-i-m-a sobre Am sin detenerte',
        gotItWhen: 'you can switch your THUMB from low E to A string when the chord changes Em → Am, while i-m-a stay on G-B-e the whole time.',
        gotItWhen_es: 'puedes cambiar tu PULGAR de la Mi grave a la cuerda La cuando el acorde cambia Em → Am, mientras i-m-a se quedan en Sol, Si y mi aguda todo el tiempo.',
        practice: { type: 'playSeq', label: 'p-i-m-a over Am — thumb on the A string', label_es: 'p-i-m-a sobre Am — el pulgar en la cuerda La', bpm: 60,
          notes: [45, 57, 60, 64, 45, 57, 60, 64] } }
    ]
  },

  {
    id: 'm9w1',
    songThread: [{ name: '"Sweet Child O\' Mine"', journey: 'tabs/sweet-child-o-mine.html', note: 'read its TAB anywhere on the neck' }],
    label: 'Set 2',
    locked: false,
    module: 'The Full Fretboard & Writing TAB',
    moduleNum: 9,
    unit: 'Module 9 · The Full Fretboard & Writing TAB',
    unit_es: 'Módulo 9 · El mástil completo y cómo escribir TAB',
    title: 'Set 2',
    subtitle: 'Notes on D & G · The octave shortcut · Sharps & flats',
    subtitle_es: 'Notas en Re y Sol · El atajo de la octava · Sostenidos y bemoles',
    skillFocus: 'Natural notes on D (0–12) · Natural notes on G (0–12) · The two-string octave shape',
    skillFocus_es: 'Notas naturales en Re (0–12) · Notas naturales en Sol (0–12) · La forma de octava de dos cuerdas',
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
                label: 'Watch: note system on D and G', label_es: 'Mira: sistema de notas en Re y Sol',
                text: 'Watch: <a href="https://youtu.be/WQ8DSYD2kvw" target="_blank">Learn Every Note on the Fretboard (Start With This Simple System) – Marty Music</a> (0:00–6:00). Follow along on your own guitar as he walks the D and G strings.',
                text_es: 'Mira: <a href="https://youtu.be/WQ8DSYD2kvw" target="_blank">Learn Every Note on the Fretboard (Start With This Simple System) – Marty Music</a> (0:00–6:00). Sigue el ritmo en tu propia guitarra mientras él recorre las cuerdas Re y Sol.',
                hint: 'Marty builds the fretboard the same way you already know the E and A strings from Module 2 — natural notes, then the sharps and flats that sit between them.',
                hint_es: 'Marty construye el mástil de la misma manera que ya conoces las cuerdas Mi y La del Módulo 2 — notas naturales, y luego los sostenidos y bemoles que están entre ellas.',
                skills: [1, 2],
                response: { type: 'mc', prompt: 'The D string at fret 2 is which note?',
                  prompt_es: '¿Cuál nota es la cuerda Re en el traste 2?',
                  answer: 1,
                  explain: 'D to E is a whole step — two frets — with D# sitting at fret 1 between them.',
                  explain_es: 'De D a E hay un tono entero — dos trastes — con D# ubicado en el traste 1 entre ambas.',
                  choices: ['D#', 'E', 'F', 'C'],
                  choices_es: ['D#', 'E', 'F', 'C'] }
              },
              {
                label: 'Watch: open string refresher', label_es: 'Mira: repaso de cuerdas al aire',
                text: 'Watch: <a href="https://youtu.be/Abrd0c92xRE" target="_blank">Open Notes On The Guitar | Practical Beginner Lesson – JustinGuitar</a> as a refresher on the open strings, then apply the same idea moving up the D and G strings fret by fret.',
                text_es: 'Mira: <a href="https://youtu.be/Abrd0c92xRE" target="_blank">Open Notes On The Guitar | Practical Beginner Lesson – JustinGuitar</a> como repaso de las cuerdas al aire, y luego aplica la misma idea subiendo por las cuerdas Re y Sol traste por traste.',
                hint: 'Refresh how each open string got its name in Module 1 — the exact same logic just keeps climbing the neck one fret at a time.',
                hint_es: 'Refresca cómo cada cuerda al aire recibió su nombre en el Módulo 1 — es exactamente la misma lógica, solo que sigue subiendo por el mástil un traste a la vez.',
                skills: [2, 3],
                response: { type: 'mc', prompt: 'On the G string, C sits at which fret?',
                  prompt_es: 'En la cuerda Sol, ¿en cuál traste está C?',
                  answer: 2,
                  explain: 'G(0) → A(2) → B(4) → C(5). B to C is a half step, so C is only one fret above B.',
                  explain_es: 'G(0) → A(2) → B(4) → C(5). De B a C hay un semitono, así que C está solo un traste arriba de B.',
                  choices: ['3', '4', '5', '7'],
                  choices_es: ['3', '4', '5', '7'] }
              }
            ]
          },
          {
            title: 'Listen for the note names',
            title_es: 'Escucha los nombres de las notas',
            steps: [
              {
                label: 'Name notes up the D and G strings', label_es: 'Nombra las notas por las cuerdas Re y Sol',
                text: '<ol><li>Play up the D string one fret at a time, saying each note name OUT LOUD before you check a chart.</li><li>Then do the same up the G string.</li><li>Notice where you hesitate — that\'s tonight\'s target.</li></ol>',
                text_es: '<ol><li>Toca hacia arriba por la cuerda Re un traste a la vez, diciendo cada nombre de nota EN VOZ ALTA antes de revisar un diagrama.</li><li>Luego haz lo mismo en la cuerda Sol.</li><li>Fíjate dónde dudas — ese es tu objetivo de esta noche.</li></ol>',
                hint: 'Naming a note before you check it (not after) is what actually builds the recall — reading a chart at the same time you say the name just trains you to read the chart.',
                hint_es: 'Nombrar una nota antes de revisarla (no después) es lo que realmente construye la memoria — leer un diagrama al mismo tiempo que dices el nombre solo te entrena a leer el diagrama.',
                skills: [1, 2],
                response: { type: 'mc', prompt: 'You know A is at fret 5 on the low E string. Using the octave shape — two strings down, two frets up — where\'s the next A?',
                  prompt_es: 'Sabes que A está en el traste 5 de la cuerda Mi grave. Usando la forma de octava — dos cuerdas hacia abajo, dos trastes hacia arriba — ¿dónde está la siguiente A?',
                  answer: 0,
                  explain: 'From the low E or A string, the octave lives two strings toward the floor and two frets toward the body.',
                  explain_es: 'Desde la cuerda Mi grave o La, la octava vive dos cuerdas hacia el piso y dos trastes hacia el cuerpo de la guitarra.',
                  choices: ['D string, fret 7', 'G string, fret 5', 'D string, fret 5', 'A string, fret 7'],
                  choices_es: ['Cuerda Re, traste 7', 'Cuerda Sol, traste 5', 'Cuerda Re, traste 5', 'Cuerda La, traste 7'] }
              }
            ]
          },
          {
            title: 'Try naming from anywhere on the neck',
            title_es: 'Prueba nombrar desde cualquier parte del mástil',
            steps: [
              {
                label: 'Octave shape: find the twin note', label_es: 'Forma de octava: la nota gemela',
                text: '<ol><li>Starting from any note you already know on the low E or A string, use the octave shape (two strings down, two frets up) to find its twin on the D or G string.</li><li>Try it from three different starting notes.</li></ol>',
                text_es: '<ol><li>Empezando desde cualquier nota que ya conozcas en la cuerda Mi grave o La, usa la forma de octava (dos cuerdas hacia abajo, dos trastes hacia arriba) para encontrar su gemela en la cuerda Re o Sol.</li><li>Pruébalo desde tres notas de partida distintas.</li></ol>',
                hint: 'This is the whole point of the octave shape — it turns one memorized note into a second one for free, anywhere on the neck.',
                hint_es: 'Este es todo el sentido de la forma de octava — convierte una nota memorizada en una segunda gratis, en cualquier parte del mástil.',
                skills: [4, 6],
                response: { type: 'mc', prompt: 'Which two natural notes have NO sharp or flat between them?',
                  prompt_es: '¿Cuáles dos notas naturales NO tienen sostenido ni bemol entre ellas?',
                  answer: 1,
                  explain: 'B–C and E–F are the two natural half steps — one fret apart, nothing in between.',
                  explain_es: 'B–C y E–F son los dos semitonos naturales — un traste de separación, nada en medio.',
                  choices: ['A and B', 'B and C', 'C and D', 'F and G'],
                  choices_es: ['A y B', 'B y C', 'C y D', 'F y G'] }
              },
              {
                label: 'Try fret 12 on D and G', label_es: 'Prueba el traste 12 en Re y Sol',
                text: '<ol><li>Play fret 12 on the D string, then fret 12 on the G string.</li><li>Say what you notice about fret 12 compared to the open string.</li></ol>',
                text_es: '<ol><li>Toca el traste 12 en la cuerda Re, y luego el traste 12 en la cuerda Sol.</li><li>Di qué notas sobre el traste 12 comparado con la cuerda al aire.</li></ol>',
                hint: 'Fret 12 is the octave marker on every string — look for the double-dot inlay as your landmark.',
                hint_es: 'El traste 12 es el marcador de octava en cada cuerda — busca el incrustado de doble punto como tu referencia.',
                skills: [1, 2],
                response: { type: 'mc', prompt: 'The D string at fret 12 is which note?',
                  prompt_es: '¿Cuál nota es la cuerda Re en el traste 12?',
                  answer: 1,
                  explain: 'Fret 12 is always the octave — the same note as the open string, one octave higher.',
                  explain_es: 'El traste 12 siempre es la octava — la misma nota que la cuerda al aire, una octava más aguda.',
                  choices: ['C', 'D', 'E', 'D#'],
                  choices_es: ['C', 'D', 'E', 'D#'] }
              }
            ]
          },
          {
            title: 'Checkpoint',
            title_es: 'Punto de control',
            steps: [
              {
                label: 'Which string stuck faster?', label_es: '¿Cuál cuerda se te quedó más rápido?',
                text: 'Checkpoint — which string\'s notes stuck faster today, D or G, and what trick helped?',
                text_es: 'Punto de control — ¿las notas de cuál cuerda se te quedaron más rápido hoy, Re o Sol, y qué truco ayudó?',
                response: { type: 'short', placeholder: 'e.g. G was easier — its B–C half step gave me a landmark at fret 4; the octave shape helped me check myself',
                  placeholder_es: 'p. ej. G fue más fácil — su semitono B–C me dio una referencia en el traste 4; la forma de octava me ayudó a comprobarme' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — the D and G strings',
        title_es: 'Estación de práctica — las cuerdas Re y Sol',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tune all 6 strings', label_es: 'Calentamiento: afina las 6 cuerdas',
                text: 'Start every practice session the same way:<ol><li>Tune all 6 strings to green (E A D G B e).</li><li>Then play each string open.</li></ol>You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera:<ol><li>Afina las 6 cuerdas hasta que estén en verde (E A D G B e).</li><li>Luego toca cada cuerda al aire.</li></ol>Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                hint: 'Every note-naming drill today depends on your strings actually being in tune — check first.',
                hint_es: 'Cada ejercicio de nombrar notas de hoy depende de que tus cuerdas realmente estén afinadas — revisa primero.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Say-then-play the D and G strings',
            title_es: 'Di y luego toca las cuerdas Re y Sol',
            steps: [
              {
                label: 'Challenge 1 — D-String Naturals', label_es: 'Reto 1 — Notas naturales de la cuerda Re',
                text: '<ul><li>Say-then-play every natural note on the D string, low to high, 0 through 12.</li></ul>You\'ve got it when: naming them takes under 15 seconds with no chart.<span class="step-figure"><img src="img/m9-d-naturals.svg" alt="A fretboard diagram of the D string, frets 0 to 12, with the natural notes marked: D open, E at fret 2, F at fret 3, G at fret 5, A at fret 7, B at fret 9, C at fret 10, and D again at fret 12."></span>',
                text_es: '<ul><li>Di y luego toca cada nota natural de la cuerda Re, de grave a aguda, del traste 0 al 12.</li></ul>Lo tienes cuando: nombrarlas te toma menos de 15 segundos sin diagrama.<span class="step-figure"><img src="img/m9-d-naturals.svg" alt="Un diagrama del diapasón de la cuerda Re, trastes 0 a 12, con las notas naturales marcadas: D al aire, E en el traste 2, F en el 3, G en el 5, A en el 7, B en el 9, C en el 10, y D de nuevo en el traste 12."></span>',
                hint: 'Say the note name first, THEN play it — that order is what builds the recall.',
                hint_es: 'Di el nombre de la nota primero, y LUEGO tócala — ese orden es lo que construye la memoria.',
                stuck: 'Cover frets 0–5 (D–G) first, get those solid, then add 7–12.',
                stuck_es: 'Cubre primero los trastes 0–5 (D–G), domínalos, y luego agrega 7–12.',
                levelUp: 'Say-then-play backwards, high to low.',
                levelUp_es: 'Di y luego toca al revés, de aguda a grave.',
                skills: [1],
                playSeq: { label: 'D-string naturals, low to high', label_es: 'Notas naturales de la cuerda Re, de grave a aguda', bpm: 60, notes: [50, 52, 53, 55, 57, 59, 60, 62] }
              },
              {
                label: 'Challenge 2 — G-String Naturals', label_es: 'Reto 2 — Notas naturales de la cuerda Sol',
                text: '<ul><li>Do the same drill on the G string, low to high, 0 through 12.</li></ul><span class="step-figure"><img src="img/m9-g-naturals.svg" alt="A fretboard diagram of the G string, frets 0 to 12, with the natural notes marked: G open, A at fret 2, B at fret 4, C at fret 5, D at fret 7, E at fret 9, F at fret 10, and G again at fret 12."></span>',
                text_es: '<ul><li>Haz el mismo ejercicio en la cuerda Sol, de grave a aguda, del traste 0 al 12.</li></ul><span class="step-figure"><img src="img/m9-g-naturals.svg" alt="Un diagrama del diapasón de la cuerda Sol, trastes 0 a 12, con las notas naturales marcadas: G al aire, A en el traste 2, B en el 4, C en el 5, D en el 7, E en el 9, F en el 10, y G de nuevo en el traste 12."></span>',
                hint: 'Each string has TWO natural half steps (notes one fret apart) between frets 0 and 12. The first one you meet going up: on D it\'s E–F (F at fret 3), on G it\'s B–C (B at fret 4, C at fret 5). The other pair sits at frets 9–10 on both strings — B–C on the D string, E–F on the G string.',
                hint_es: 'Cada cuerda tiene DOS semitonos naturales (notas separadas por un traste) entre los trastes 0 y 12. El primero que encuentras subiendo: en la cuerda Re es E–F (F en el traste 3), en la cuerda Sol es B–C (B en el traste 4, C en el traste 5). El otro par está en los trastes 9–10 en ambas cuerdas — B–C en la cuerda Re, E–F en la cuerda Sol.',
                stuck: 'Cover frets 0–5 (G–C) first, then add 5–12.',
                stuck_es: 'Cubre primero los trastes 0–5 (G–C), y luego agrega 5–12.',
                levelUp: 'Time yourself — name a random fret correctly three times in a row, then try to beat your time.',
                levelUp_es: 'Cronométrate — nombra un traste al azar correctamente tres veces seguidas, y luego intenta superar tu tiempo.',
                skills: [2],
                playSeq: { label: 'G-string naturals, low to high', label_es: 'Notas naturales de la cuerda Sol, de grave a aguda', bpm: 60, notes: [55, 57, 59, 60, 62, 64, 65, 67] }
              }
            ]
          },
          {
            title: 'Flashcard flash-drill',
            title_es: 'Ejercicio relámpago de tarjetas',
            steps: [
              {
                label: 'Challenge 3 — D & G Naturals Flash Drill (your assessment piece)', label_es: 'Reto 3 — Relámpago de naturales en Re y Sol (tu pieza de evaluación)',
                text: '<ol><li>Deal the natural-note deck below and find each note it gives you on the D or G string within 5 seconds.</li><li>Switch strings halfway through the deck.</li></ol>You\'ve got it when: 6 out of 7 correct within 5 seconds each, on both strings.',
                text_es: '<ol><li>Reparte la baraja de notas naturales de abajo y encuentra cada nota que te dé en la cuerda Re o Sol en menos de 5 segundos.</li><li>Cambia de cuerda a la mitad de la baraja.</li></ol>Lo tienes cuando: 6 de 7 correctas en menos de 5 segundos cada una, en ambas cuerdas.',
                drill: { type: 'deck', deck: 'naturals' },
                hint: 'If you\'re stuck, use the octave shape from a string you already know instead of counting up one fret at a time.',
                hint_es: 'Si te atoras, usa la forma de octava desde una cuerda que ya conozcas en vez de contar traste por traste.',
                stuck: 'Allow 10 seconds instead of 5 until it\'s automatic, then lower the time limit again.',
                stuck_es: 'Permite 10 segundos en vez de 5 hasta que sea automático, y luego baja el límite de tiempo de nuevo.',
                levelUp: 'Deal the level-up deck below with the sharps and flats added, or drop to a 3-second limit.',
                levelUp_es: 'Reparte la baraja de nivel extra de abajo con los sostenidos y bemoles agregados, o baja el límite a 3 segundos.',
                skills: [3, 4]
              },
              {
                label: 'Level-up: naturals + sharps & flats (optional)', label_es: 'Nivel extra: naturales + sostenidos y bemoles (opcional)',
                text: 'Deal the deck below — it adds F# and Bb to the natural notes. Find each one on the D or G string within 5 seconds, same as before.',
                text_es: 'Reparte la baraja de abajo — agrega F# y Bb a las notas naturales. Encuentra cada una en la cuerda Re o Sol en menos de 5 segundos, igual que antes.',
                drill: { type: 'deck', deck: 'naturals-plus' },
                hint: 'Same trick as before — the octave shape gets you there fast, even with the sharps and flats mixed in.',
                hint_es: 'El mismo truco de antes — la forma de octava te lleva rápido, incluso con los sostenidos y bemoles mezclados.'
              }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Sweet Child O\' Mine", name it as you play it', label_es: 'Reto — "Sweet Child O\' Mine", nómbralo mientras lo tocas',
                text: '<ol><li>Watch the intro-riff clip you first saw in Module 7 (<a href="https://www.youtube.com/watch?v=EBNlYH4P5r8" target="_blank">Sweet Child O\' Mine Intro in Standard Tuning – Jbf Music &amp; Guitar</a>).</li><li>Learn just its first four notes — D string fret 12, a skip up to the B string at fret 15, then two notes on the G string (frets 14 and 12).</li><li>Say each note\'s NAME as you play it — today\'s D/G-string knowledge covers three of the four; the B-string note is a sneak preview.</li></ol><a href="tabs/sweet-child-o-mine.html" target="_blank"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M5 8c0 6 14 2 14 8"/></svg> Song Journey: this song\'s Journey page</a> — the full intro riff isn\'t there yet on purpose; it waits for you at the end of the course.',
                text_es: '<ol><li>Mira el clip del riff de intro que viste por primera vez en el Módulo 7 (<a href="https://www.youtube.com/watch?v=EBNlYH4P5r8" target="_blank">Sweet Child O\' Mine Intro in Standard Tuning – Jbf Music &amp; Guitar</a>).</li><li>Aprende solo sus primeras cuatro notas — cuerda Re traste 12, un salto a la cuerda Si en el traste 15, y luego dos notas en la cuerda Sol (trastes 14 y 12).</li><li>Di el NOMBRE de cada nota mientras la tocas — lo que sabes hoy de las cuerdas Re y Sol cubre tres de las cuatro; la nota de la cuerda Si es un adelanto.</li></ol><a href="tabs/sweet-child-o-mine.html" target="_blank"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M5 8c0 6 14 2 14 8"/></svg> Recorrido de la canción: la página de Recorrido de esta canción</a> — el riff de intro completo todavía no está ahí a propósito; te espera al final del curso.',
                hint: 'A riff is a short musical phrase that repeats. This riff lives up the neck on strings you\'ve never named notes on before today — that\'s exactly why it\'s the reward for this set.',
                hint_es: 'Un riff es una frase musical corta que se repite. Este riff vive arriba en el mástil, en cuerdas donde nunca antes habías nombrado notas — por eso es exactamente la recompensa de esta unidad.',
                stuck: 'Pause the video on the very first note and just name that one string/fret before moving on.',
                stuck_es: 'Pausa el video en la primerísima nota y solo nombra esa cuerda/traste antes de continuar.',
                levelUp: 'Name all four notes of the opening phrase before you play them, then check yourself against the video.',
                levelUp_es: 'Nombra las cuatro notas de la frase de apertura antes de tocarlas, y luego compruébate con el video.',
                skills: [5]
              }
            ]
          },
          {
            title: 'Wrap-Up',
            title_es: 'Cierre',
            steps: [
              {
                label: 'Which fret still slows you?', label_es: '¿Cuál traste todavía te frena?',
                text: 'Which fret on D or G still makes you pause and count? Write it below — that\'s your warm-up target next time.',
                text_es: '¿Cuál traste en la cuerda Re o Sol todavía te hace pausar y contar? Escríbelo abajo — ese es tu objetivo de calentamiento la próxima vez.',
                response: { type: 'short', placeholder: 'e.g. fret 9 on the G string — I still count up from the fret-7 dot',
                  placeholder_es: 'p. ej. traste 9 en la cuerda Sol — todavía cuento desde el punto del traste 7' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Names naturals on D & G through fret 12 · Finds a named note within 5 seconds · Uses the octave shape as a shortcut',
      goal_es: 'Nombra las notas naturales en Re y Sol hasta el traste 12 · Encuentra una nota nombrada en menos de 5 segundos · Usa la forma de octava como atajo',
      performance: 'Deal the full 7-card natural-note deck, switching strings halfway through, and find each on the D or G string within 5 seconds — film yourself, then check every spot against a fretboard chart. Goal: 6 out of 7 correct.',
      selfCheck: 'Can you find C on the G string without counting up from open? Can you name the note two strings down and two frets up from any E-string note you know?',
      selfCheck_es: '¿Puedes encontrar C en la cuerda Sol sin contar desde el aire? ¿Puedes nombrar la nota que está dos cuerdas hacia abajo y dos trastes hacia arriba de cualquier nota de la cuerda Mi grave que conozcas?',
      standards: ['Pr.4a', 'Pr.6a']
    },

    skills: [
      { id: 'm9w1-s1', text: 'Name the natural notes on the D string, frets 0–12, in order',
        text_es: 'Nombrar las notas naturales de la cuerda Re, trastes 0–12, en orden',
        gotItWhen: 'naming them takes under 15 seconds with no chart',
        gotItWhen_es: 'nombrarlas te toma menos de 15 segundos sin diagrama',
        practice: { type: 'fretboard', string: 'D', label: 'Find the note — D string', label_es: 'Encuentra la nota — cuerda Re', bpm: 60, notes: [50, 52, 53, 55, 57, 59, 60, 62] } },
      { id: 'm9w1-s2', text: 'Name the natural notes on the G string, frets 0–12, in order',
        text_es: 'Nombrar las notas naturales de la cuerda Sol, trastes 0–12, en orden',
        gotItWhen: 'naming all of them, low to high, takes under 15 seconds with no chart.',
        gotItWhen_es: 'nombrarlas todas, de grave a aguda, te toma menos de 15 segundos sin diagrama.',
        practice: { type: 'fretboard', string: 'G', label: 'Find the note — G string', label_es: 'Encuentra la nota — cuerda Sol', bpm: 60, notes: [55, 57, 59, 60, 62, 64, 65, 67] } },
      { id: 'm9w1-s3', text: 'Find any named note (dealt from the natural-note deck) on the D or G string within 5 seconds',
        text_es: 'Encontrar cualquier nota nombrada (repartida de la baraja de notas naturales) en la cuerda Re o Sol en menos de 5 segundos',
        gotItWhen: 'you can find 6 out of 7 dealt notes on the D or G string within 5 seconds each.',
        gotItWhen_es: 'encuentras 6 de 7 notas repartidas en la cuerda Re o Sol en menos de 5 segundos cada una.',
        practice: { type: 'mc', prompt: 'On the D string, G is at which fret?', prompt_es: 'En la cuerda Re, ¿en cuál traste está G?', choices: ['3', '5', '7', '9'], choices_es: ['3', '5', '7', '9'], answer: 1,
          explain: 'Count up from the open D: D#(1), E(2), F(3), F#(4), G(5). Fret 3 is tempting because that\'s where G lives on the low E string — but every string has its own map.',
          explain_es: 'Cuenta desde la cuerda Re al aire: D#(1), E(2), F(3), F#(4), G(5). El traste 3 es tentador porque ahí vive G en la cuerda Mi grave — pero cada cuerda tiene su propio mapa.' } },
      { id: 'm9w1-s4', text: 'Use the octave shape to find a D- or G-string note from an E- or A-string note I already know',
        text_es: 'Usar la forma de octava para encontrar una nota en la cuerda Re o Sol a partir de una nota en la Mi grave o La que ya conozco',
        gotItWhen: 'you can start from any note on the low E or A string and land on its octave twin on the D or G string without counting frets.',
        gotItWhen_es: 'puedes partir de cualquier nota en la cuerda Mi grave o La y llegar a su gemela de octava en la cuerda Re o Sol sin contar trastes.',
        practice: { type: 'mc', prompt: 'The octave shape from the low E and A strings moves you:',
          prompt_es: 'La forma de octava desde las cuerdas Mi grave y La te mueve:',
          choices: ['Two strings down, two frets up', 'Two strings down, same fret', 'One string down, two frets up', 'Two strings down, three frets up'],
          choices_es: ['Dos cuerdas hacia abajo, dos trastes hacia arriba', 'Dos cuerdas hacia abajo, el mismo traste', 'Una cuerda hacia abajo, dos trastes hacia arriba', 'Dos cuerdas hacia abajo, tres trastes hacia arriba'], answer: 0,
          explain: 'Starting from the low E or A string, the same note repeats two strings toward the floor and two frets toward the body. The three-fret version is real, but only once the B string is part of the jump — D to B, or G to high e.',
          explain_es: 'Partiendo de la cuerda Mi grave o La, la misma nota se repite dos cuerdas hacia el suelo y dos trastes hacia el cuerpo. La versión de tres trastes existe, pero solo cuando la cuerda Si entra en el salto — de Re a Si, o de Sol a mi aguda.' } },
      { id: 'm9w1-s5', text: 'Play the "Sweet Child O\' Mine" intro fragment and name its D- and G-string notes',
        text_es: 'Tocar el fragmento de intro de "Sweet Child O\' Mine" y nombrar sus notas de las cuerdas Re y Sol',
        gotItWhen: 'you can play the intro\'s first four notes up around frets 12–15 and name the three on the D and G strings — the B-string note is a sneak preview, not something you\'re expected to name yet.',
        gotItWhen_es: 'puedes tocar las primeras cuatro notas de la intro alrededor de los trastes 12–15 y nombrar las tres de las cuerdas Re y Sol — la nota de la cuerda Si es un adelanto, no algo que se espera que nombres todavía.',
        practice: { type: 'mc', prompt: 'The "Sweet Child" intro TAB starts at fret 12 on the D string. Using today\'s fretboard knowledge, what note is that?',
          prompt_es: 'El TAB de la intro de "Sweet Child" empieza en el traste 12 de la cuerda Re. Usando lo que sabes hoy del diapasón, ¿qué nota es?',
          choices: ['D — fret 12 repeats the open string\'s name', 'C — one below the octave', 'E — fret 12 is always E', 'Notes don\'t have names above fret 5'],
          choices_es: ['D — el traste 12 repite el nombre de la cuerda al aire', 'C — una nota debajo de la octava', 'E — el traste 12 siempre es E', 'Las notas no tienen nombre arriba del traste 5'], answer: 0,
          explain: 'Fret 12 is the octave — every string repeats its open name there, so the whole map restarts. That\'s what makes riffs up high readable, not scary.',
          explain_es: 'El traste 12 es la octava — cada cuerda repite ahí el nombre de su cuerda al aire, así que todo el mapa vuelve a empezar. Eso hace que los riffs arriba sean legibles, no aterradores.' } },
      { id: 'm9w1-s6', text: 'Say which two natural notes any sharp or flat on D or G sits between',
        text_es: 'Decir entre cuáles dos notas naturales se ubica cualquier sostenido o bemol en la cuerda Re o Sol',
        gotItWhen: 'you can name the two natural notes on either side of any sharp or flat on the D or G string without checking a chart.',
        gotItWhen_es: 'puedes nombrar las dos notas naturales a cada lado de cualquier sostenido o bemol en la cuerda Re o Sol sin revisar un diagrama.',
        practice: { type: 'mc', prompt: 'F# on the D string sits at which fret?', prompt_es: '¿En cuál traste está F# en la cuerda Re?', choices: ['3', '4', '5', '2'], choices_es: ['3', '4', '5', '2'], answer: 1,
          explain: 'F sits at fret 3 on the D string, and a sharp is one fret higher — so F# is fret 4. It lands between F and G, which is exactly what a sharp name tells you.',
          explain_es: 'F está en el traste 3 de la cuerda Re, y un sostenido está un traste más arriba — así que F# es el traste 4. Cae entre F y G, que es justo lo que te dice el nombre de un sostenido.' } }
    ]
  },

  {
    id: 'm9w2',
    songThread: [{ name: '"Luna"', journey: 'tabs/luna.html', layer: 6, bonus: true, note: 'its fingerpicked intro — name every note as you roll it' }],
    label: 'Set 3',
    locked: false,
    module: 'The Full Fretboard & Writing TAB',
    moduleNum: 9,
    unit: 'Module 9 · The Full Fretboard & Writing TAB',
    unit_es: 'Módulo 9 · El mástil completo y cómo escribir TAB',
    title: 'Set 3',
    subtitle: 'Notes on B & e · The B-string bump · The whole neck',
    subtitle_es: 'Notas en Si y mi aguda · El desfase de la cuerda Si · Todo el mástil',
    skillFocus: 'Naturals on B (0–12) · Naturals on high e (they mirror low E) · The 3-fret octave shift onto B & e',
    skillFocus_es: 'Notas naturales en Si (0–12) · Notas naturales en mi aguda (reflejan la Mi grave) · El desplazamiento de octava de 3 trastes hacia Si y mi aguda',
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
                label: 'Watch: finishing on B and high e', label_es: 'Mira: termina en Si y mi aguda',
                text: 'Watch: <a href="https://youtu.be/WQ8DSYD2kvw?t=360" target="_blank">Learn Every Note on the Fretboard (Start With This Simple System) – Marty Music</a> (6:00–end), finishing the fretboard on the B and high-e strings.',
                text_es: 'Mira: <a href="https://youtu.be/WQ8DSYD2kvw?t=360" target="_blank">Learn Every Note on the Fretboard (Start With This Simple System) – Marty Music</a> (6:00–final), terminando el mástil en las cuerdas Si y mi aguda.',
                hint: 'Notice the B string breaks the pattern you learned last set — it\'s tuned a half-step "early," which shifts every shape crossing onto it.',
                hint_es: 'Fíjate que la cuerda Si rompe el patrón que aprendiste la unidad pasada — está afinada un semitono "antes," lo cual desplaza cualquier forma que cruce hacia ella.',
                skills: [1, 2],
                response: { type: 'mc', prompt: 'The high e string\'s notes are the same as which other string?',
                  prompt_es: '¿Las notas de la cuerda mi aguda son las mismas que las de cuál otra cuerda?',
                  answer: 1,
                  explain: 'Both E strings are tuned to E — same note names at every fret, two octaves apart.',
                  explain_es: 'Ambas cuerdas Mi están afinadas en E — los mismos nombres de nota en cada traste, separadas por dos octavas.',
                  choices: ['The B string', 'The low E string', 'The G string', 'No other string'],
                  choices_es: ['La cuerda Si', 'La cuerda Mi grave', 'La cuerda Sol', 'Ninguna otra cuerda'] }
              },
              {
                label: 'Watch: octaves and the B-string bump', label_es: 'Mira: octavas y el desfase de la cuerda Si',
                text: 'Watch: <a href="https://youtu.be/wElX3v3POWU?t=87" target="_blank">Finding Notes On The Guitar Neck Using Octaves – JustinGuitar</a>. Pay close attention to what changes when the shape crosses onto the B string — that\'s today\'s 3-fret bump.',
                text_es: 'Mira: <a href="https://youtu.be/wElX3v3POWU?t=87" target="_blank">Finding Notes On The Guitar Neck Using Octaves – JustinGuitar</a>. Presta mucha atención a qué cambia cuando la forma cruza hacia la cuerda Si — ese es el desfase de 3 trastes de hoy.',
                hint: 'Every octave shape you\'ve used so far has been "two strings down, two frets up." Crossing onto B (or e) adds one extra fret — watch for it in the video.',
                hint_es: 'Toda forma de octava que has usado hasta ahora ha sido "dos cuerdas hacia abajo, dos trastes hacia arriba." Cruzar hacia la Si (o la mi aguda) agrega un traste extra — obsérvalo en el video.',
                skills: [4],
                response: { type: 'mc', prompt: 'The octave shape coming FROM the D or G string onto the B or e string moves:',
                  prompt_es: 'La forma de octava que va DESDE la cuerda Re o Sol hacia la cuerda Si o mi aguda se mueve:',
                  answer: 1,
                  explain: 'The B string is tuned a half-step "early," so every shape crossing onto B (or e) stretches one extra fret — the B-string bump.',
                  explain_es: 'La cuerda Si está afinada un semitono "antes," así que toda forma que cruce hacia la Si (o la mi aguda) se estira un traste extra — el desfase de la cuerda Si.',
                  choices: ['Two strings down, two frets up', 'Two strings down, three frets up', 'Two strings down, same fret', 'One string down, three frets up'],
                  choices_es: ['Dos cuerdas hacia abajo, dos trastes hacia arriba', 'Dos cuerdas hacia abajo, tres trastes hacia arriba', 'Dos cuerdas hacia abajo, el mismo traste', 'Una cuerda hacia abajo, tres trastes hacia arriba'] }
              }
            ]
          },
          {
            title: 'Listen for the six-string landmarks',
            title_es: 'Escucha las referencias de las seis cuerdas',
            steps: [
              {
                label: 'Name the dot-fret landmarks', label_es: 'Nombra los trastes con punto',
                text: 'Play the dot-fret landmarks (3, 5, 7, 9, 12) across all six strings and say each note out loud before checking a chart. These five frets are your fastest shortcuts anywhere on the neck.',
                text_es: 'Toca las referencias de los trastes con punto (3, 5, 7, 9, 12) en las seis cuerdas y di cada nota en voz alta antes de revisar un diagrama. Estos cinco trastes son tus atajos más rápidos en cualquier parte del mástil.',
                hint: 'You already know these dots as fretting landmarks — today you\'re also learning what they\'re called on every string.',
                hint_es: 'Ya conoces estos puntos como referencias de trasteo — hoy también aprendes cómo se llaman en cada cuerda.',
                skills: [6],
                response: { type: 'mc', prompt: 'On the B string, C sits at which fret?',
                  prompt_es: 'En la cuerda Si, ¿en cuál traste está C?',
                  answer: 0,
                  explain: 'B to C is a natural half step — one fret.',
                  explain_es: 'De B a C hay un semitono natural — un traste.',
                  choices: ['1', '2', '3', '5'],
                  choices_es: ['1', '2', '3', '5'] }
              }
            ]
          },
          {
            title: 'Try the whole fretboard',
            title_es: 'Prueba con todo el mástil',
            steps: [
              {
                label: 'Find one note on all six strings', label_es: 'Encuentra una nota en las 6 cuerdas',
                text: 'Pick any note name and find it on all six strings, one string at a time, using the octave shape (remembering the B-string bump) rather than counting from open every time.',
                text_es: 'Elige el nombre de cualquier nota y encuéntrala en las seis cuerdas, una cuerda a la vez, usando la forma de octava (recordando el desfase de la cuerda Si) en vez de contar desde el aire cada vez.',
                hint: 'This is the moment the whole fretboard suddenly makes sense — one note, six places to find it.',
                hint_es: 'Este es el momento en que todo el mástil de repente tiene sentido — una nota, seis lugares para encontrarla.',
                skills: [3, 4],
                response: { type: 'mc', prompt: 'The B string at fret 5 is the same pitch as which open string?',
                  prompt_es: '¿La cuerda Si en el traste 5 es la misma nota que cuál cuerda al aire?',
                  answer: 2,
                  explain: 'B(0)→C(1)→D(3)→E(5). B at fret 5 = E, the open high-e — that\'s exactly how you tune by ear.',
                  explain_es: 'B(0)→C(1)→D(3)→E(5). B en el traste 5 = E, la mi aguda al aire — así es exactamente como afinas de oído.',
                  choices: ['G', 'D', 'high e', 'A'],
                  choices_es: ['Sol', 'Re', 'Mi aguda', 'La'] }
              },
              {
                label: 'Try fret 7 on every string', label_es: 'Prueba el traste 7 en cada cuerda',
                text: 'Try the dot at fret 7 on every string — name each note before checking. Dot frets are the fastest landmarks on the whole neck.',
                text_es: 'Prueba el punto en el traste 7 en cada cuerda — nombra cada nota antes de revisar. Los trastes con punto son las referencias más rápidas de todo el mástil.',
                hint: 'You already used fret 7 to tune by ear (5th-fret/7th-fret method) — now you\'re naming what\'s there.',
                hint_es: 'Ya usaste el traste 7 para afinar de oído (método del traste 5/traste 7) — ahora estás nombrando lo que hay ahí.',
                skills: [6],
                response: { type: 'mc', prompt: 'At the dot on fret 7, the low E string plays:',
                  prompt_es: 'En el punto del traste 7, la cuerda Mi grave toca:',
                  answer: 1,
                  explain: 'E→F(1)→G(3)→A(5)→B(7). Dot frets (3-5-7-9-12) are your landmarks.',
                  explain_es: 'E→F(1)→G(3)→A(5)→B(7). Los trastes con punto (3-5-7-9-12) son tus referencias.',
                  choices: ['A', 'B', 'C', 'G'],
                  choices_es: ['A', 'B', 'C', 'G'] }
              }
            ]
          },
          {
            title: 'Checkpoint',
            title_es: 'Punto de control',
            steps: [
              {
                label: 'Where are you slowest?', label_es: '¿Dónde eres más lento?',
                text: 'Checkpoint — where on the neck are you still slowest? Name the string and fret zone.',
                text_es: 'Punto de control — ¿dónde en el mástil todavía eres más lento? Nombra la cuerda y la zona de trastes.',
                response: { type: 'short', placeholder: 'e.g. B string frets 6–10 — I still count up from fret 5',
                  placeholder_es: 'p. ej. cuerda Si, trastes 6–10 — todavía cuento desde el traste 5' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — the whole fretboard',
        title_es: 'Estación de práctica — todo el mástil',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tune all 6 strings', label_es: 'Calentamiento: afina las 6 cuerdas',
                text: 'Start every practice session the same way:<ol><li>Tune all 6 strings to green (E A D G B e).</li><li>Then play each string open.</li></ol>You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera:<ol><li>Afina las 6 cuerdas hasta que estén en verde (E A D G B e).</li><li>Luego toca cada cuerda al aire.</li></ol>Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Say-then-play the B and high-e strings',
            title_es: 'Di y luego toca las cuerdas Si y mi aguda',
            steps: [
              {
                label: 'Challenge 1 — B-String Naturals', label_es: 'Reto 1 — Notas naturales de la cuerda Si',
                text: '<ul><li>Say-then-play every natural note on the B string, low to high, 0 through 12.</li></ul><span class="step-figure"><img src="img/m9-b-naturals.svg" alt="A fretboard diagram of the B string, frets 0 to 12, with the natural notes marked: B open, C at fret 1, D at fret 3, E at fret 5, F at fret 6, G at fret 8, A at fret 10, and B again at fret 12."></span>',
                text_es: '<ul><li>Di y luego toca cada nota natural de la cuerda Si, de grave a aguda, del traste 0 al 12.</li></ul><span class="step-figure"><img src="img/m9-b-naturals.svg" alt="Un diagrama del diapasón de la cuerda Si, trastes 0 a 12, con las notas naturales marcadas: B al aire, C en el traste 1, D en el 3, E en el 5, F en el 6, G en el 8, A en el 10, y B de nuevo en el traste 12."></span>',
                hint: 'Remember: B to C is only ONE fret, not two — the exception to the pattern you learned on D and G.',
                hint_es: 'Recuerda: de B a C hay solo UN traste, no dos — la excepción al patrón que aprendiste en las cuerdas Re y Sol.',
                stuck: 'Cover frets 0–5 (B–E) first, then add 5–12.',
                stuck_es: 'Cubre primero los trastes 0–5 (B–E), y luego agrega 5–12.',
                levelUp: 'Say-then-play backwards, high to low, without slowing down.',
                levelUp_es: 'Di y luego toca al revés, de aguda a grave, sin ir más despacio.',
                skills: [1],
                playSeq: { label: 'B-string naturals', label_es: 'Notas naturales de la cuerda Si', bpm: 60, notes: [59, 60, 62, 64, 65, 67, 69, 71] }
              },
              {
                label: 'Challenge 2 — High-e Naturals', label_es: 'Reto 2 — Notas naturales de la mi aguda',
                text: '<ol><li>Do the same drill on the high e string, low to high, 0 through 12.</li><li>Notice these are the exact same note names as the low E string.</li></ol><span class="step-figure"><img src="img/m9-high-e-naturals.svg" alt="A fretboard diagram of the high e string, frets 0 to 12, with the natural notes marked: E open, F at fret 1, G at fret 3, A at fret 5, B at fret 7, C at fret 8, D at fret 10, and E again at fret 12."></span>',
                text_es: '<ol><li>Haz el mismo ejercicio en la cuerda mi aguda, de grave a aguda, del traste 0 al 12.</li><li>Fíjate que son exactamente los mismos nombres de nota que la Mi grave.</li></ol><span class="step-figure"><img src="img/m9-high-e-naturals.svg" alt="Un diagrama del diapasón de la mi aguda, trastes 0 a 12, con las notas naturales marcadas: E al aire, F en el traste 1, G en el 3, A en el 5, B en el 7, C en el 8, D en el 10, y E de nuevo en el traste 12."></span>',
                hint: 'If you know the low E string from Module 2, you already know this string — just two octaves higher.',
                hint_es: 'Si conoces la cuerda Mi grave del Módulo 2, ya conoces esta cuerda — solo que dos octavas más aguda.',
                stuck: 'Say the low-E note names first, then transfer them to the high e string fret by fret.',
                stuck_es: 'Di los nombres de nota de la Mi grave primero, y luego transfiérelos a la mi aguda traste por traste.',
                levelUp: 'Time yourself naming random frets on the high e string — time three in a row, then try to make it faster.',
                levelUp_es: 'Cronométrate nombrando trastes al azar en la mi aguda — cronometra tres seguidos, y luego intenta hacerlo más rápido.',
                skills: [2],
                playSeq: { label: 'High-e naturals', label_es: 'Notas naturales de la mi aguda', bpm: 60, notes: [64, 65, 67, 69, 71, 72, 74, 76] }
              }
            ]
          },
          {
            title: 'Six-string landmark drill',
            title_es: 'Ejercicio de referencias de las seis cuerdas',
            steps: [
              {
                label: 'Challenge 3 — Six-String Dot Landmarks (your assessment piece)', label_es: 'Reto 3 — Puntos de referencia en 6 cuerdas (tu pieza de evaluación)',
                text: '<ol><li>Name every string at the fret-5 dot.</li><li>Name every string at the fret-7 dot.</li></ol>You\'ve got it when: all six strings named correctly at both dots, no chart, within 5 seconds each.',
                text_es: '<ol><li>Nombra cada cuerda en el punto del traste 5.</li><li>Nombra cada cuerda en el punto del traste 7.</li></ol>Lo tienes cuando: las seis cuerdas nombradas correctamente en ambos puntos, sin diagrama, en menos de 5 segundos cada una.',
                hint: 'Dots are the fastest way to orient yourself anywhere on the neck — this drill is worth over-practicing.',
                hint_es: 'Los puntos son la forma más rápida de orientarte en cualquier parte del mástil — vale la pena sobre-practicar este ejercicio.',
                stuck: 'Do the fret-5 dot on all six strings first until it\'s solid, then add fret 7.',
                stuck_es: 'Haz primero el punto del traste 5 en las seis cuerdas hasta que salga sólido, y luego agrega el traste 7.',
                levelUp: 'Add the fret-9 and fret-12 dots, then call out the dot frets in random order across all six strings instead of low to high.',
                levelUp_es: 'Agrega los puntos de los trastes 9 y 12, y luego nombra los trastes con punto en orden aleatorio en las seis cuerdas en vez de ir de grave a agudo.',
                skills: [3, 6]
              }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Luna", the punteo line', label_es: 'Reto — "Luna", la línea de punteo',
                text: '<ul><li>Play the fingerpicked intro fragment — one note each on D, G, B and open e, four strings — reading Layer 6 TAB from <a href="tabs/luna.html#layer-6" target="_blank">"Luna"\'s Song Journey page</a>.</li></ul>You\'ve got it when: all four notes ring cleanly in order, and you can name each one as you play it.',
                text_es: '<ul><li>Toca el fragmento de intro con fingerpicking — una nota en cada una de Re, Sol, Si y mi aguda al aire, cuatro cuerdas — leyendo el TAB de la Capa 6 de la <a href="tabs/luna.html#layer-6" target="_blank">página de Recorrido de la canción de "Luna"</a>.</li></ul>Lo tienes cuando: las cuatro notas suenan limpias en orden, y puedes nombrar cada una mientras la tocas.',
                hint: 'Punteo = the picked melody line, a Spanish guitar term. Layer 6 is the bonus requinto-intro layer — a requinto is a small, higher-pitched guitar that plays the lead melody. This roll uses the little-F shape you already know from Module 5, with one change: leave the high e string OPEN — don\'t fret it at fret 1 the way you do for the normal little F. Today\'s new skill is being able to name every note in it.',
                hint_es: 'Punteo = la línea melódica punteada, un término de guitarra en español. La Capa 6 es la capa bonus de intro con requinto — un requinto es una guitarra pequeña y más aguda que toca la melodía principal. Este roll usa la forma de F pequeña que ya conoces del Módulo 5, con un cambio: deja la cuerda mi aguda AL AIRE — no la trastees en el traste 1 como lo haces para la F pequeña normal. La destreza nueva de hoy es poder nombrar cada nota dentro de ella.',
                stuck: 'Fret the little F shape first, strum it once to hear the target chord, then break it apart one string at a time.',
                stuck_es: 'Trastea primero la forma de F pequeña, ráscala una vez para escuchar el acorde objetivo, y luego desármala una cuerda a la vez.',
                levelUp: 'Name each note out loud as you roll through it, or drop it in front of the Layer 5 vamp (a vamp is a short chord pattern repeated over and over) as a real intro.',
                levelUp_es: 'Nombra cada nota en voz alta mientras la tocas, o colócala antes del vamp de la Capa 5 (un vamp es un patrón de acordes corto que se repite una y otra vez) como una intro de verdad.',
                skills: [5]
              }
            ]
          },
          {
            title: 'Wrap-Up',
            title_es: 'Cierre',
            steps: [
              {
                label: 'Counting up or octave shape?', label_es: '¿Contar o la forma de octava?',
                text: 'Six strings, fully named — what\'s your fastest way to find a note now: counting up, or the octave shape? Write it below.',
                text_es: 'Seis cuerdas, completamente nombradas — ¿cuál es tu forma más rápida de encontrar una nota ahora: contar hacia arriba, o la forma de octava? Escríbelo abajo.',
                response: { type: 'short', placeholder: 'e.g. octave shape, every time — counting up from open is too slow now',
                  placeholder_es: 'p. ej. la forma de octava, siempre — contar desde el aire ya es demasiado lento' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Names naturals on all six strings · Locates any named note on the neck · Plays a melody crossing 3+ strings cleanly',
      goal_es: 'Nombra las notas naturales en las seis cuerdas · Ubica cualquier nota nombrada en el mástil · Toca una melodía que cruce 3 o más cuerdas de forma limpia',
      performance: 'Name every string at the fret-5 dot, then every string at the fret-7 dot, no chart, within 5 seconds each — then play "Luna"\'s fingerpicked intro fragment (D, G, B, open e) cleanly in order, naming each note as you play it.',
      selfCheck: 'Can you name all six strings at the 5th-fret dot? Can you find B on three different strings?',
      selfCheck_es: '¿Puedes nombrar las seis cuerdas en el punto del traste 5? ¿Puedes encontrar B en tres cuerdas distintas?',
      standards: ['Pr.4a', 'Pr.6a']
    },

    skills: [
      { id: 'm9w2-s1', text: 'Name the natural notes on the B string, frets 0–12, in order',
        text_es: 'Nombrar las notas naturales de la cuerda Si, trastes 0–12, en orden',
        gotItWhen: 'naming all of them, low to high, takes under 15 seconds with no chart — remember B to C is only one fret.',
        gotItWhen_es: 'nombrarlas todas, de grave a aguda, te toma menos de 15 segundos sin diagrama — recuerda que de B a C hay solo un traste.',
        practice: { type: 'fretboard', string: 'B', label: 'Find the note — B string', label_es: 'Encuentra la nota — cuerda Si', bpm: 60, notes: [59, 60, 62, 64, 65, 67, 69, 71] } },
      { id: 'm9w2-s2', text: 'Name the natural notes on the high e string and explain why they match the low E',
        text_es: 'Nombrar las notas naturales de la mi aguda y explicar por qué coinciden con la Mi grave',
        gotItWhen: 'you can name every fret the same way you do on the low E string, and explain that both strings are tuned to E, two octaves apart.',
        gotItWhen_es: 'puedes nombrar cada traste igual que en la cuerda Mi grave, y explicar que ambas cuerdas están afinadas en E, separadas por dos octavas.',
        practice: { type: 'fretboard', string: 'highE', label: 'Find the note — high e string (same map as low E)', label_es: 'Encuentra la nota — cuerda mi aguda (el mismo mapa que la Mi grave)' } },
      { id: 'm9w2-s3', text: 'Locate any named natural note (using the Find-the-Note drill) on any of the six strings',
        text_es: 'Ubicar cualquier nota natural nombrada (con el ejercicio de Encuentra la Nota) en cualquiera de las seis cuerdas',
        gotItWhen: 'you can find any named note on any of the six strings within 5 seconds, using the octave shape instead of counting from open.',
        gotItWhen_es: 'puedes encontrar cualquier nota nombrada en cualquiera de las seis cuerdas en menos de 5 segundos, usando la forma de octava en vez de contar desde el aire.',
        practice: { type: 'fretboard', string: 'all', label: 'Find the note — anywhere on the fretboard', label_es: 'Encuentra la nota — en cualquier parte del mástil' } },
      { id: 'm9w2-s4', text: 'Use the 3-fret octave shift when crossing onto the B or high-e string',
        text_es: 'Usar el desplazamiento de octava de 3 trastes al cruzar hacia la cuerda Si o mi aguda',
        gotItWhen: 'you can find the octave of a D- or G-string note on the B or high-e string by moving two strings down and three frets up, not two.',
        gotItWhen_es: 'puedes encontrar la octava de una nota de la cuerda Re o Sol en la cuerda Si o mi aguda moviéndote dos cuerdas hacia abajo y tres trastes hacia arriba, no dos.',
        practice: { type: 'mc', prompt: 'You know G at D-string fret 5. Its octave on the B string is at fret:',
          prompt_es: 'Sabes que G está en el traste 5 de la cuerda Re. Su octava en la cuerda Si está en el traste:',
          choices: ['5', '7', '8', '10'], choices_es: ['5', '7', '8', '10'], answer: 2,
          explain: 'Crossing onto the B string costs one extra fret, because the B string is tuned closer to the G string than the others are to their neighbors. Two strings down and THREE frets up: 5 + 3 = 8.',
          explain_es: 'Cruzar hacia la cuerda Si cuesta un traste extra, porque la cuerda Si está afinada más cerca de la cuerda Sol que las demás de sus vecinas. Dos cuerdas hacia abajo y TRES trastes hacia arriba: 5 + 3 = 8.' } },
      { id: 'm9w2-s5', text: 'Play a melody that crosses three or more strings cleanly ("Luna" intro fragment)',
        text_es: 'Tocar una melodía que cruce tres o más cuerdas de forma limpia (fragmento de intro de "Luna")',
        gotItWhen: 'all four notes of the "Luna" intro fragment ring cleanly in order, and you can name each one as you play it.',
        gotItWhen_es: 'las cuatro notas del fragmento de intro de "Luna" suenan limpias en orden, y puedes nombrar cada una mientras la tocas.',
        practice: { type: 'playSeq', label: '"Luna" intro punteo — D3 · G2 · B1 · open e', label_es: 'Punteo de la intro de "Luna" — D3 · G2 · B1 · e al aire', bpm: 60,
          notes: [53, 57, 60, 64] } },
      { id: 'm9w2-s6', text: 'Name the note at any dot fret (3, 5, 7, 9, 12) on all six strings',
        text_es: 'Nombrar la nota en cualquier traste con punto (3, 5, 7, 9, 12) en las seis cuerdas',
        gotItWhen: 'all six strings named correctly at both the fret-5 and fret-7 dots, no chart, within 5 seconds each.',
        gotItWhen_es: 'las seis cuerdas nombradas correctamente en los puntos del traste 5 y del traste 7, sin diagrama, en menos de 5 segundos cada una.',
        practice: { type: 'mc', prompt: 'At fret 3, the A string plays:', prompt_es: 'En el traste 3, la cuerda La toca:', choices: ['B', 'C', 'C#', 'D'], choices_es: ['B', 'C', 'C#', 'D'], answer: 1,
          explain: 'Count from the open A: A#(1), B(2), C(3). B to C is only one fret apart, and that half step is why C arrives sooner than you would expect.',
          explain_es: 'Cuenta desde la cuerda La al aire: A#(1), B(2), C(3). De B a C hay solo un traste de distancia, y ese semitono es la razón por la que C llega antes de lo que esperarías.' } }
    ]
  },

  {
    id: 'm9w3',
    songThread: [{ name: '"Luna"', journey: 'tabs/luna.html', note: 'read and write its lines in TAB' }],
    label: 'Set 4',
    locked: false,
    module: 'The Full Fretboard & Writing TAB',
    moduleNum: 9,
    unit: 'Module 9 · The Full Fretboard & Writing TAB',
    unit_es: 'Módulo 9 · El mástil completo y cómo escribir TAB',
    title: 'Set 4',
    subtitle: 'Higher-position TAB · Write your own 4 bars · Slash chords & partial shapes',
    subtitle_es: 'TAB en posiciones altas · Escribe tus propios 4 compases · Acordes con barra diagonal y formas parciales',
    skillFocus: 'Reading TAB above fret 5 · Writing TAB others can play · Slash chords (G/B) & partial-shape charts',
    skillFocus_es: 'Leer TAB arriba del traste 5 · Escribir TAB que otros puedan tocar · Acordes con barra diagonal (G/B) y diagramas de forma parcial',
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
                label: 'Watch: TAB reading refresher', label_es: 'Mira: repaso de lectura de TAB',
                text: 'Watch: <a href="https://youtu.be/qR0O0bUl5_A?t=32" target="_blank">How to Read Guitar TAB - A Better Way To Read Music – Lauren Bateman</a> as a refresher, paying attention to how string order and chord stacks are shown.',
                text_es: 'Mira: <a href="https://youtu.be/qR0O0bUl5_A?t=32" target="_blank">How to Read Guitar TAB - A Better Way To Read Music – Lauren Bateman</a> como repaso, prestando atención a cómo se muestran el orden de las cuerdas y las pilas de acordes.',
                hint: 'You met TAB reading back in Module 2 — today\'s new ground is reading it confidently ABOVE fret 5, and writing your own.',
                hint_es: 'Conociste la lectura de TAB en el Módulo 2 — el terreno nuevo de hoy es leerlo con confianza ARRIBA del traste 5, y escribir el tuyo propio.',
                skills: [1],
                response: { type: 'mc', prompt: 'In TAB, the TOP line represents:',
                  prompt_es: 'En el TAB, la línea SUPERIOR representa:',
                  answer: 1,
                  explain: 'TAB puts the highest-sounding string on top — the thinnest one. That\'s the OPPOSITE of what you see looking down at your own guitar, which is why it\'s the most common beginner reading mistake.',
                  explain_es: 'El TAB pone la cuerda más aguda arriba — la más delgada. Es lo CONTRARIO de lo que ves al mirar tu guitarra desde arriba, y por eso es el error de lectura más común entre principiantes.',
                  choices: ['The low E string (thickest)', 'The high e string (thinnest)', 'Whichever string you like', 'The B string'],
                  choices_es: ['La cuerda Mi grave (la más gruesa)', 'La cuerda mi aguda (la más delgada)', 'La que tú prefieras', 'La cuerda Si'] }
              },
              {
                label: 'Watch: writing your own TAB', label_es: 'Mira: escribe tu propio TAB',
                text: 'Watch: <a href="https://youtu.be/AjwEjsh3QQw" target="_blank">Writing TABs – JustinGuitar</a>. This is the reverse skill of reading TAB — watch how he turns a riff he can already play into TAB someone else could read.',
                text_es: 'Mira: <a href="https://youtu.be/AjwEjsh3QQw" target="_blank">Writing TABs – JustinGuitar</a>. Esta es la destreza inversa de leer TAB — observa cómo convierte un riff que ya puede tocar en un TAB que otra persona podría leer.',
                hint: 'Writing TAB is the reverse skill of reading it — the video models the process before you try it yourself at the practice station.',
                hint_es: 'Escribir TAB es la destreza inversa de leerlo — el video modela el proceso antes de que lo intentes tú mismo en la estación de práctica.',
                skills: [2, 3],
                response: { type: 'mc', prompt: 'Two numbers stacked in the same column of TAB mean:',
                  prompt_es: 'Dos números apilados en la misma columna del TAB significan:',
                  answer: 1,
                  explain: 'A vertical stack is a chord — everything in the column sounds together.',
                  explain_es: 'Una pila vertical es un acorde — todo lo que está en la columna suena junto.',
                  choices: ['Play them one after another', 'Play them at the same time', 'Choose one to play', 'Play the top one twice'],
                  choices_es: ['Tocarlos uno después del otro', 'Tocarlos al mismo tiempo', 'Elegir uno para tocar', 'Tocar el de arriba dos veces'] }
              }
            ]
          },
          {
            title: 'Listen for chords hiding in the TAB',
            title_es: 'Escucha los acordes escondidos en el TAB',
            steps: [
              {
                label: 'Spot chords inside the TAB', label_es: 'Encuentra acordes en el TAB',
                text: 'Read through a TAB\'d riff and notice where single notes stack into a chord (a vertical column) versus where they stay a single melodic line.',
                text_es: 'Lee un riff en TAB y fíjate dónde las notas sueltas se apilan en un acorde (una columna vertical) frente a dónde se quedan como una sola línea melódica.',
                hint: 'Spotting the difference between a melody line and a stacked chord in TAB is what lets you read faster.',
                hint_es: 'Distinguir entre una línea melódica y un acorde apilado en el TAB es lo que te permite leer más rápido.',
                skills: [1],
                response: { type: 'mc', prompt: 'A "12" written on the thinnest TAB line tells you to play:',
                  prompt_es: 'Un "12" escrito en la línea más delgada del TAB te dice que toques:',
                  answer: 1,
                  explain: 'Numbers are FRETS, lines are STRINGS — fret 12, high-e string.',
                  explain_es: 'Los números son TRASTES, las líneas son CUERDAS — traste 12, cuerda mi aguda.',
                  choices: ['Fret 12 on the low E', 'Fret 12 on the high e', 'String 12', 'The 12th chord'],
                  choices_es: ['El traste 12 en la Mi grave', 'El traste 12 en la mi aguda', 'La cuerda 12', 'El acorde número 12'] }
              }
            ]
          },
          {
            title: 'Try reading a slash chord',
            title_es: 'Prueba leer un acorde con barra diagonal',
            steps: [
              {
                label: 'G/B: find the lowest note', label_es: 'G/B: encuentra la nota más grave',
                text: 'Look up a chord chart for G/B and figure out, before checking, which note has to be the LOWEST one you strum.',
                text_es: 'Busca un diagrama de acorde para G/B y descubre, antes de revisar, cuál nota tiene que ser la MÁS GRAVE que rasgueas.',
                hint: 'Read the slash like a fraction: chord name first, bass note second.',
                hint_es: 'Lee la barra diagonal como una fracción: primero el nombre del acorde, luego la nota grave.',
                skills: [4],
                response: { type: 'mc', prompt: 'The chord G/B (say "G over B") means:',
                  prompt_es: 'El acorde G/B (di "G sobre B") significa:',
                  answer: 1,
                  explain: 'Slash chords name the chord, then the bass note — you met G/B inside "the cure"\'s progression.',
                  explain_es: 'Los acordes con barra diagonal nombran el acorde y luego la nota grave — conociste G/B dentro de la progresión de "the cure".',
                  choices: ['Play a G chord, then a B chord', 'A G chord with B as its lowest note', 'A B chord with G as its top note', 'Either G or B, your choice'],
                  choices_es: ['Tocar un acorde de G, y luego uno de B', 'Un acorde de G con B como su nota más grave', 'Un acorde de B con G como su nota más aguda', 'G o B, cualquiera de los dos, tú eliges'] }
              },
              {
                label: 'Try spacing TAB rhythm', label_es: 'Prueba espaciar el ritmo del TAB',
                text: 'Try spacing a few numbers the way you would in written TAB, then check: could someone else tell the rhythm from your spacing alone?',
                text_es: 'Prueba espaciar unos números de la manera que lo harías en un TAB escrito, y luego revisa: ¿podría alguien más deducir el ritmo solo por tu espaciado?',
                hint: 'Cramped numbers are the single most common reason a TAB is unplayable for anyone but the person who wrote it.',
                hint_es: 'Los números amontonados son la razón más común por la que un TAB resulta imposible de tocar para cualquiera que no sea quien lo escribió.',
                skills: [3],
                response: { type: 'mc', prompt: 'When you write your own TAB, the most important thing to keep readable is:',
                  prompt_es: 'Cuando escribes tu propio TAB, lo más importante que debes mantener legible es:',
                  answer: 1,
                  explain: 'Spacing IS the rhythm in TAB — cramped numbers make your riff unplayable for anyone else.',
                  explain_es: 'El espaciado ES el ritmo en el TAB — los números amontonados hacen que tu riff sea imposible de tocar para cualquier otra persona.',
                  choices: ['Neat, decorative handwriting', 'Even spacing that shows the rhythm', 'Using pen instead of pencil', 'Writing the song title at the top'],
                  choices_es: ['Una letra ordenada y decorativa', 'Un espaciado parejo que muestre el ritmo', 'Usar pluma en vez de lápiz', 'Escribir el título de la canción arriba'] }
              }
            ]
          },
          {
            title: 'Checkpoint',
            title_es: 'Punto de control',
            steps: [
              {
                label: 'Frets or rhythm: which was harder?', label_es: '¿Trastes o ritmo: qué fue más difícil?',
                text: 'Checkpoint — what was hardest about writing TAB: finding the frets, or spacing the rhythm?',
                text_es: 'Punto de control — ¿qué fue lo más difícil de escribir TAB: encontrar los trastes, o espaciar el ritmo?',
                response: { type: 'short', placeholder: 'e.g. I knew the frets but my spacing squished bar 3',
                  placeholder_es: 'p. ej. sabía los trastes pero mi espaciado apretó el compás 3' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — reading, writing, and cold-reading TAB',
        title_es: 'Estación de práctica — leer, escribir y leer TAB a primera vista',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tune all 6 strings', label_es: 'Calentamiento: afina las 6 cuerdas',
                text: 'Start every practice session the same way:<ol><li>Tune all 6 strings to green (E A D G B e).</li><li>Then play each string open.</li></ol>You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera:<ol><li>Afina las 6 cuerdas hasta que estén en verde (E A D G B e).</li><li>Luego toca cada cuerda al aire.</li></ol>Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Read a higher-position TAB',
            title_es: 'Lee un TAB en posición alta',
            steps: [
              {
                label: 'Challenge 1 — "Luna" Warm-Up Read (down low first)', label_es: 'Reto 1 — "Luna", lectura de calentamiento (primero abajo)',
                text: '<ul><li>Read and play the little-F Layer 6 intro TAB from <a href="tabs/luna.html#layer-6" target="_blank">"Luna"\'s Song Journey page</a> — it lives around the little-F shape, but you leave the high e string open instead of fretting it (D3, G2, B1, open e), down at frets 0–3.</li></ul>You\'ve got it when: you can read it straight through, no one walking you through it first.',
                text_es: '<ul><li>Lee y toca el TAB de intro de la Capa 6 de F pequeña de la <a href="tabs/luna.html#layer-6" target="_blank">página de Recorrido de la canción de "Luna"</a> — vive alrededor de la forma de F pequeña, pero dejas la cuerda mi aguda al aire en vez de trastearla (D3, G2, B1, e al aire), abajo en los trastes 0–3.</li></ul>Lo tienes cuando: puedes leerlo de corrido, sin que nadie te lo explique primero.',
                hint: 'Reading TAB up the neck feels harder mostly because the numbers are less familiar, not because it\'s actually different from reading it low.',
                hint_es: 'Leer TAB arriba del mástil se siente más difícil sobre todo porque los números son menos familiares, no porque sea realmente distinto a leerlo abajo.',
                stuck: 'Fret the little F shape and strum it once to hear the target chord before reading the roll note by note.',
                stuck_es: 'Trastea la forma de F pequeña y ráscala una vez para escuchar el acorde objetivo antes de leer el roll nota por nota.',
                levelUp: 'Read a second higher-position TAB you haven\'t seen before today, cold.',
                levelUp_es: 'Lee a primera vista un segundo TAB en posición alta que no hayas visto antes de hoy.',
                skills: [1]
              },
              {
                label: 'Challenge — Higher Still (the real up-high read)', label_es: 'Reto — Todavía más alto (la verdadera lectura arriba)',
                text: '<ul><li>Cold-read the 8-note line below — the up-high follow-up to the "Luna" warm-up above (frets 0–3). It lives entirely at frets 5–10, anchored around 5th position with a stretch up to fret 10, crossing the D, G, and B strings. No one walks you through it first; trust the numbers.</li></ul>You\'ve got it when: you play all eight notes in order, in tune, reading only the TAB.',
                text_es: '<ul><li>Lee a primera vista la línea de 8 notas de abajo — la continuación en posición alta de la lectura de calentamiento de "Luna" de arriba (trastes 0–3). Vive completamente en los trastes 5–10, anclada alrededor de la 5ª posición con un estiramiento hasta el traste 10, cruzando las cuerdas Re, Sol y Si. Nadie te lo explica primero; confía en los números.</li></ul>Lo tienes cuando: tocas las ocho notas en orden, afinado, leyendo solo el TAB.',
                hint: 'The shapes feel unfamiliar this high up, but the rule never changes: top line = thinnest string, numbers = frets. Find fret 5 (two frets past the fret-3 dot) and anchor your hand there.',
                hint_es: 'Las formas se sienten poco familiares tan arriba, pero la regla nunca cambia: línea superior = cuerda más delgada, números = trastes. Encuentra el traste 5 (dos trastes después del punto del traste 3) y ancla tu mano ahí.',
                stuck: 'Play it one note at a time and say each fret out loud before you fret it — decode first, speed later.',
                stuck_es: 'Tócala una nota a la vez y di cada traste en voz alta antes de trastearlo — primero descifra, la velocidad viene después.',
                levelUp: 'Play the line backwards, from the last note to the first, still reading only the page.',
                levelUp_es: 'Toca la línea al revés, de la última nota a la primera, todavía leyendo solo la página.',
                skills: [1],
                tab: { caption: 'Cold-read: a 5th-position line with a stretch to fret 10, across the D, G & B strings (frets 5–10)',
                  caption_es: 'Lectura a primera vista: una línea en 5ª posición con un estiramiento hasta el traste 10, a través de las cuerdas Re, Sol y Si (trastes 5–10)', notes: [
                  { string: 'G', fret: 5, note: 'C', midi: 60 },
                  { string: 'G', fret: 7, note: 'D', midi: 62 },
                  { string: 'B', fret: 5, note: 'E', midi: 64 },
                  { string: 'B', fret: 8, note: 'G', midi: 67 },
                  { string: 'B', fret: 10, note: 'A', midi: 69 },
                  { string: 'B', fret: 8, note: 'G', midi: 67 },
                  { string: 'G', fret: 7, note: 'D', midi: 62 },
                  { string: 'D', fret: 7, note: 'A', midi: 57 }
                ] },
                playSeq: { label: 'Hear the line (check yourself only AFTER you\'ve read it cold)', label_es: 'Escucha la línea (compruébate solo DESPUÉS de haberla leído a primera vista)', bpm: 70, notes: [60, 62, 64, 67, 69, 67, 62, 57] }
              }
            ]
          },
          {
            title: 'Write your own TAB from memory',
            title_es: 'Escribe tu propio TAB de memoria',
            steps: [
              {
                label: 'Challenge 2 — Write "Seven Nation Army" (your assessment piece)', label_es: 'Reto 2 — Escribe "Seven Nation Army" (tu pieza de evaluación)',
                text: '<ol><li>Without looking anything up, write the "Seven Nation Army" riff as TAB in the box below, from memory — you played it without looking at the chart back in Module 2.</li><li>Then check yourself.</li></ol>You\'ve got it when: you play back EXACTLY what you typed and it matches the riff note for note — every fret on the right string, in order. (The day-later, no-memory test is Challenge 4 — see it below.)',
                text_es: '<ol><li>Sin buscar nada, escribe de memoria el riff de "Seven Nation Army" como TAB en el cuadro de abajo — lo tocaste sin mirar el diagrama allá en el Módulo 2.</li><li>Luego compruébate.</li></ol>Lo tienes cuando: tocas EXACTAMENTE lo que escribiste y coincide con el riff nota por nota — cada traste en la cuerda correcta, en orden. (La prueba de un día después, sin memoria, es el Reto 4 — ve abajo.)',
                hint: 'Say each note name in your head as you write its fret — that\'s the same habit that made you fast at naming notes all module.',
                hint_es: 'Di el nombre de cada nota en tu mente mientras escribes su traste — es el mismo hábito que te hizo rápido nombrando notas todo el módulo.',
                stuck: 'Play the riff on your guitar first, one note at a time, typing each fret as you go — then clean up the spacing once you\'re done.',
                stuck_es: 'Toca el riff en tu guitarra primero, una nota a la vez, escribiendo cada traste en el cuadro mientras avanzas — y luego limpia el espaciado al final.',
                levelUp: 'Write a second 4-bar riff of your choice from memory, or write the riff transposed to a different starting fret.',
                levelUp_es: 'Escribe un segundo riff de 4 compases de tu elección de memoria, o escribe el riff transportado a un traste de partida distinto.',
                skills: [2, 3],
                response: { type: 'short', prompt: 'Write the riff as one-string TAB (string, then frets in order):',
                  prompt_es: 'Escribe el riff como TAB de una cuerda (cuerda, luego trastes en orden):',
                  placeholder: 'e.g. D|—0—2—3—2—0— (string, then frets in order)', placeholder_es: 'p. ej. D|—0—2—3—2—0— (cuerda, y luego los trastes en orden)' }
              }
            ]
          },
          {
            title: 'Read a slash chord and a partial shape',
            title_es: 'Lee un acorde con barra diagonal y una forma parcial',
            steps: [
              {
                label: 'Challenge 3 — G/B Slash Chord', label_es: 'Reto 3 — G/B, acorde con barra diagonal',
                text: '<ol><li>Fret and play G/B.</li><li>Compare it against a standard open G.</li><li>Notice what changes and what stays the same.</li></ol>',
                text_es: '<ol><li>Trastea y toca G/B.</li><li>Compáralo con un G abierto estándar.</li><li>Fíjate qué cambia y qué se mantiene igual.</li></ol>',
                hint: 'The chord shape barely changes — it\'s the LOWEST note you strum that makes it a slash chord.',
                hint_es: 'La forma del acorde casi no cambia — es la nota MÁS GRAVE que rasgueas lo que lo convierte en un acorde con barra diagonal.',
                stuck: 'Play the open G first, then lift your finger off the low E string and start your strum on the A string — the B (A string, fret 2) is already under your finger.',
                stuck_es: 'Toca el G abierto primero, luego levanta el dedo de la cuerda Mi grave y empieza tu rasgueo en la cuerda La — la B (cuerda La, traste 2) ya está bajo tu dedo.',
                levelUp: 'Walk C → G/B → Am as a smooth bass-line move — then listen for the same G/B glide in "the cure", where it pulls the loop from F back home to Am.',
                levelUp_es: 'Camina C → G/B → Am como un movimiento suave de línea de bajo — luego busca el mismo deslizamiento con G/B en "the cure", donde lleva el ciclo de F de vuelta a la base en Am.',
                skills: [4],
                chords: [
                  { name: 'G/B', chord: [[6,'x'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
                  { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 }
                ]
              },
              {
                label: 'Challenge — Read a Partial Shape', label_es: 'Reto — Lee una forma parcial',
                text: 'The chart below shows dots on only three strings — the rest are marked X. That\'s a partial shape: just the top slice of a chord, the way slash-chord and lead-sheet charts often print it so you can grab it fast.<ul><li>Fret the three dots and play.</li></ul>You\'ve got it when: only the three fretted strings sound, and the X\'d strings stay silent under your strum.',
                text_es: 'El diagrama de abajo muestra puntos en solo tres cuerdas — el resto están marcadas con X. Eso es una forma parcial: solo la rebanada superior de un acorde, tal como los diagramas de acordes con barra diagonal y de lead sheet suelen imprimirlos para que los agarres rápido.<ul><li>Trastea los tres puntos y toca.</li></ul>Lo tienes cuando: solo suenan las tres cuerdas trasteadas, y las marcadas con X se quedan silenciosas bajo tu rasgueo.',
                hint: 'An X over a string means "don\'t let this ring." Here the three X\'d strings are the lowest ones — brush only the top three, or lean a fretting finger against the low strings to mute them.',
                hint_es: 'Una X sobre una cuerda significa "no dejes que suene." Aquí las tres cuerdas con X son las más graves — rasguea solo las tres de arriba, o apoya un dedo de trastear contra las cuerdas graves para silenciarlas.',
                stuck: 'Pick the three fretted strings one at a time first, so you can hear that each one rings clean, then brush them together.',
                stuck_es: 'Pulsa las tres cuerdas trasteadas una a la vez primero, para que puedas escuchar que cada una suena limpia, y luego rasguéalas juntas.',
                levelUp: 'Slide the same three-string shape up two frets and name the new chord it spells.',
                levelUp_es: 'Desliza la misma forma de tres cuerdas dos trastes hacia arriba y nombra el nuevo acorde que forma.',
                skills: [5],
                chords: [
                  { name: 'D (partial — top 3 strings)', chord: [[6,'x'],[5,'x'],[4,'x'],[3,2,'1'],[2,3,'3'],[1,2,'2']], position: 0 }
                ],
                response: { type: 'mc', prompt: 'On this partial-shape chart, which strings actually ring when you play it?',
                  prompt_es: 'En este diagrama de forma parcial, ¿cuáles cuerdas realmente suenan cuando lo tocas?',
                  answer: 1,
                  explain: 'An X above a string means don\'t play it. The three lowest strings — low E, A, and D — are X\'d, so only the top three — G, B, and high e — ring out. A partial shape is just a full chord\'s top slice.',
                  explain_es: 'Una X sobre una cuerda significa que no la toques. Las tres cuerdas más graves — Mi grave, La y Re — tienen X, así que solo suenan las tres de arriba — Sol, Si y mi aguda. Una forma parcial es solo la rebanada superior de un acorde completo.',
                  choices: ['All six strings, top to bottom', 'Only the three fretted strings', 'Only the strings marked with an X', 'The three lowest strings only'],
                  choices_es: ['Las seis cuerdas, de arriba a abajo', 'Solo las tres cuerdas trasteadas', 'Solo las cuerdas marcadas con X', 'Solo las tres cuerdas más graves'] }
              }
            ]
          },
          {
            title: 'The TAB cold-read test',
            title_es: 'La prueba de lectura a primera vista de TAB',
            steps: [
              {
                label: 'Challenge 4 — Cold-Read Your "Seven Nation Army" TAB', label_es: 'Reto 4 — Lee a primera vista tu TAB de "Seven Nation Army"',
                text: 'At least a day after writing your Challenge 2 TAB:<ul><li>Open Challenge 2 above, look at what you typed, and play it back exactly as written — trust only what you typed, no memory allowed.</li></ul>You\'ve got it when: the riff comes out right on the first try, purely from what you typed — that\'s the ultimate readability test.',
                text_es: 'Al menos un día después de escribir tu TAB del Reto 2:<ul><li>Abre el Reto 2 de arriba, mira lo que escribiste, y tócalo exactamente como está — confía solo en lo que escribiste, no se permite memoria.</li></ul>Lo tienes cuando: el riff sale bien al primer intento, únicamente a partir de lo que escribiste — esa es la prueba definitiva de legibilidad.',
                hint: 'This is the real test of whether your spacing and fret numbers were actually readable — not just correct to you.',
                hint_es: 'Esta es la verdadera prueba de si tu espaciado y tus números de traste realmente eran legibles — no solo correctos para ti.',
                stuck: 'If your own TAB stumps you, say the fret numbers out loud in rhythm while following what you typed, then add the guitar.',
                stuck_es: 'Si tu propio TAB te confunde, di los números de traste en voz alta con el ritmo mientras sigues lo que escribiste, y luego agrega la guitarra.',
                levelUp: 'Write and cold-read a second riff.',
                levelUp_es: 'Escribe y lee a primera vista un segundo riff.',
                skills: [6]
              }
            ]
          },
          {
            title: 'Wrap-Up',
            title_es: 'Cierre',
            steps: [
              {
                label: 'Could a stranger play your TAB?', label_es: '¿Podría un desconocido tocar tu TAB?',
                text: 'Could a stranger play your TAB without hearing the song first? Write below what you\'d change about your spacing next time.',
                text_es: '¿Podría un desconocido tocar tu TAB sin haber escuchado la canción primero? Escribe abajo qué cambiarías de tu espaciado la próxima vez.',
                response: { type: 'short', placeholder: 'e.g. yes — but I\'d leave more room around the chord stack in bar 2',
                  placeholder_es: 'p. ej. sí — pero dejaría más espacio alrededor de la pila de acordes en el compás 2' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Reads TAB above fret 5 · Writes a playable 4-bar TAB · Reads a slash chord from a chart',
      goal_es: 'Lee TAB arriba del traste 5 · Escribe un TAB de 4 compases que se pueda tocar · Lee un acorde con barra diagonal de un diagrama',
      performance: 'The cold-read test: play your own hand-written TAB at least a day after writing it, exactly as written. If the page alone reproduces the riff, the TAB passes.',
      selfCheck: 'Could a stranger play your TAB without hearing the song first? Can you explain what G/B means in one sentence?',
      selfCheck_es: '¿Podría un desconocido tocar tu TAB sin haber escuchado la canción primero? ¿Puedes explicar qué significa G/B en una oración?',
      standards: ['Pr.4a', 'Pr.6a', 'Cn.10a']
    },

    skills: [
      { id: 'm9w3-s1', text: 'Read and play a TAB phrase written above fret 5',
        text_es: 'Leer y tocar una frase de TAB escrita arriba del traste 5',
        gotItWhen: 'you can cold-read an 8-note line living entirely at fret 5 and above, in tune, using only the TAB.',
        gotItWhen_es: 'puedes leer a primera vista una línea de 8 notas que vive completamente en el traste 5 y más arriba, afinada, usando solo el TAB.',
        practice: { type: 'mc', prompt: 'A high-position TAB shows "10" on the B-string line. What is it?',
          prompt_es: 'Un TAB en posición alta muestra "10" en la línea de la cuerda Si. ¿Qué es?',
          choices: ['One note — B string, fret 10', 'Two notes — fret 1, then fret 0', 'Finger 1, then an open string', 'Two strings played at the same time'],
          choices_es: ['Una nota — cuerda Si, traste 10', 'Dos notas — traste 1, y luego traste 0', 'Dedo 1, y luego una cuerda al aire', 'Dos cuerdas tocadas al mismo tiempo'], answer: 0,
          explain: 'Above fret 9, TAB numbers go double-digit — "10" is one fret, not a 1 and a 0. Spacing (or a dash) is what separates two real notes.',
          explain_es: 'Arriba del traste 9, los números del TAB pasan a dos dígitos — "10" es un solo traste, no un 1 y un 0. El espaciado (o un guion) es lo que separa dos notas reales.' } },
      { id: 'm9w3-s2', text: 'Write an accurate 4-bar TAB of a riff I can already play',
        text_es: 'Escribir un TAB preciso de 4 compases de un riff que ya sé tocar',
        gotItWhen: 'you play it back correctly a day later, reading only what\'s on the page — no memory needed.',
        gotItWhen_es: 'lo tocas correctamente un día después, leyendo solo lo que hay en la página — sin necesitar la memoria.',
        practice: { type: 'mc', prompt: 'You\'re writing TAB for a riff that lives on the D string. Which of the six lines does it go on?',
          prompt_es: 'Estás escribiendo el TAB de un riff que vive en la cuerda Re. ¿En cuál de las seis líneas va?',
          choices: ['The 3rd line from the bottom', 'The 3rd line from the top', 'The bottom line — thickest string goes lowest, D is thick-ish', 'Any line, as long as you label it'],
          choices_es: ['La 3ª línea desde abajo', 'La 3ª línea desde arriba', 'La línea de abajo — la cuerda más gruesa va más abajo, y la Re es algo gruesa', 'Cualquier línea, siempre que la etiquetes'], answer: 0,
          explain: 'TAB lines mirror the strings with the low E at the bottom: E-A-D from the bottom up, so the D string is line 3. Writing it on the wrong line is the #1 TAB-writing error.',
          explain_es: 'Las líneas del TAB reflejan las cuerdas con la Mi grave abajo: Mi grave-La-Re de abajo hacia arriba, así que la cuerda Re es la línea 3. Escribirla en la línea equivocada es el error número uno al escribir TAB.' } },
      { id: 'm9w3-s3', text: 'Space my TAB so the rhythm is readable',
        text_es: 'Espaciar mi TAB para que el ritmo sea legible',
        gotItWhen: 'your spacing alone shows the rhythm clearly enough that a stranger could read it without you explaining it.',
        gotItWhen_es: 'tu espaciado por sí solo muestra el ritmo con la claridad suficiente para que un desconocido lo lea sin que se lo expliques.',
        practice: { type: 'mc', prompt: 'In hand-written TAB, rhythm is shown mainly by:',
          prompt_es: 'En el TAB escrito a mano, el ritmo se muestra principalmente por:',
          choices: ['The shapes of the note heads', 'The spacing between numbers', 'Color coding of the numbers', 'It can\'t be shown in TAB'],
          choices_es: ['Las formas de las cabezas de nota', 'El espaciado entre los números', 'Un código de colores en los números', 'No se puede mostrar en el TAB'], answer: 1,
          explain: 'Plain TAB has no note-head shapes to carry rhythm, so spacing does the job: numbers packed close together are fast, numbers spread far apart are held. Sloppy spacing is why your own TAB can be unreadable a week later.',
          explain_es: 'El TAB simple no tiene formas de cabeza de nota que lleven el ritmo, así que el espaciado hace ese trabajo: los números muy juntos son rápidos, los números muy separados se sostienen. Un espaciado descuidado es la razón por la que tu propio TAB puede ser ilegible una semana después.' } },
      { id: 'm9w3-s4', text: 'Read a slash chord (like G/B) from a chart and play it',
        text_es: 'Leer un acorde con barra diagonal (como G/B) de un diagrama y tocarlo',
        gotItWhen: 'you can look at any slash chord and correctly name which note has to ring lowest.',
        gotItWhen_es: 'puedes mirar cualquier acorde con barra diagonal y nombrar correctamente cuál nota debe sonar más grave.',
        practice: { type: 'mc', prompt: 'In C/G, the lowest note you play is:', prompt_es: 'En C/G, la nota más grave que tocas es:', choices: ['C', 'E', 'G', 'B'], choices_es: ['C', 'E', 'G', 'B'], answer: 2,
          explain: 'In a slash chord, the letter after the slash is the bass note — the lowest note that rings. C/G is still a C chord; only the note at the bottom changes.',
          explain_es: 'En un acorde con barra diagonal, la letra después de la barra es la nota del bajo — la nota más grave que suena. C/G sigue siendo un acorde de C; solo cambia la nota de abajo.' } },
      { id: 'm9w3-s5', text: 'Read a partial chord shape (X marks and small grids) from a chart',
        text_es: 'Leer una forma de acorde parcial (marcas de X y diagramas pequeños) de un diagrama',
        gotItWhen: 'you can look at a partial chart, fret only the marked strings, and keep the X\'d strings silent under your strum.',
        gotItWhen_es: 'puedes mirar un diagrama parcial, trastear solo las cuerdas marcadas, y mantener silenciosas las cuerdas con X bajo tu rasgueo.',
        practice: { type: 'mc', prompt: 'An X above a string on a chord chart means:',
          prompt_es: 'Una X sobre una cuerda en un diagrama de acorde significa:',
          choices: ['Play it open', 'Don\'t play that string', 'Bend that string', 'Play it twice'],
          choices_es: ['Tócala al aire', 'No toques esa cuerda', 'Hazle un bend a esa cuerda', 'Tócala dos veces'], answer: 1,
          explain: 'An X means that string stays silent — skip it in your strum or mute it with a finger. The O (the letter o) is the one that means play it open.',
          explain_es: 'Una X significa que esa cuerda se queda en silencio — sáltala al rasguear o apágala con un dedo. La O (la letra o) es la que significa tocarla al aire.' } },
      { id: 'm9w3-s6', text: 'Play an unfamiliar hand-written TAB correctly on the first try — one I wrote days ago',
        text_es: 'Tocar correctamente al primer intento un TAB escrito a mano que no me sea familiar — uno que escribí hace días',
        gotItWhen: 'a TAB you wrote days ago comes out right on the first try, reading only what\'s on the page.',
        gotItWhen_es: 'un TAB que escribiste hace días sale bien al primer intento, leyendo solo lo que hay en la página.',
        practice: { type: 'pr', prompt: '<ol><li>Pull out a TAB you wrote days ago and sight-read it cold.</li><li>Count how many of its bars you played correctly on the very first pass.</li><li>Log your best.</li></ol>',
          prompt_es: '<ol><li>Saca un TAB que escribiste hace días y léelo a primera vista.</li><li>Cuenta cuántos de sus compases tocaste correctamente en la primerísima pasada.</li><li>Anota tu mejor número.</li></ol>',
          unit: 'count', placeholder: 'e.g. 3 of 4 bars — try for all of them', placeholder_es: 'p. ej. 3 de 4 compases — intenta lograrlos todos' } }
    ]
  }

); // end module-9.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[9] = [
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Map the intro up the neck — D & G strings', meta_es: 'Ubica la intro arriba del mástil — cuerdas Re y Sol', type: 'Core', core: true, journeyUrl: 'tabs/sweet-child-o-mine.html',
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0ASVeXINKYM&start=282&end=938' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: 'Punteo line crossing four strings', meta_es: 'Línea de punteo que cruza cuatro cuerdas', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Write the riff out as TAB yourself', meta_es: 'Escribe el riff como TAB tú mismo', type: 'Core', core: true, journeyUrl: 'tabs/seven-nation-army.html',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Beat It" — Michael Jackson', meta: 'Riff notes across E, A & D — map them', meta_es: 'Notas del riff a través de las cuerdas Mi grave, La y Re — ubícalas', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=oRdxUFDoQe0',
        tutorialUrl: 'https://www.youtube.com/watch?v=B5M5tVc7XZA' },
      { name: '"Just Like Heaven" — The Cure', meta: 'Arpeggiated riff — read it up the neck', meta_es: 'Riff arpegiado — léelo arriba del mástil', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=n3nPiBai66M',
        tutorialUrl: 'https://www.youtube.com/watch?v=fEgsKS_IcQA&start=98&end=587' },
      { name: '"Smoke on the Water" — Deep Purple', meta: 'Write its riff as TAB — the classic starter riff', meta_es: 'Escribe su riff como TAB — el clásico riff para principiantes', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=Q2FzZSBD5LE',
        tutorialUrl: 'https://www.youtube.com/watch?v=QkT5yLP5VQA' }
    ];

MODULE_REVIEWS[9] = {
  moduleNum: 9,
  module: 'The Full Fretboard & Writing TAB',
  module_es: 'El mástil completo y cómo escribir TAB',
  skills: [
    { id: 'mr9-s1', text: 'I can name every natural note on the D and G strings through fret 12', text_es: 'Puedo nombrar cada nota natural de las cuerdas Re y Sol hasta el traste 12', set: 'm9w1' },
    { id: 'mr9-s2', text: 'I can use the octave shape to find a note on a new string from one I already know', text_es: 'Puedo usar la forma de octava para encontrar una nota en una cuerda nueva a partir de una que ya conozco', set: 'm9w1' },
    { id: 'mr9-s3', text: 'I can locate any named note anywhere on the neck, on any of the six strings', text_es: 'Puedo ubicar cualquier nota nombrada en cualquier parte del mástil, en cualquiera de las seis cuerdas', set: 'm9w2' },
    { id: 'mr9-s4', text: 'I can name the note at any dot-fret landmark (3, 5, 7, 9, 12) on all six strings', text_es: 'Puedo nombrar la nota en cualquier traste con punto (3, 5, 7, 9, 12) en las seis cuerdas', set: 'm9w2' },
    { id: 'mr9-s5', text: 'I can read a TAB phrase written above fret 5 without help', text_es: 'Puedo leer una frase de TAB escrita arriba del traste 5 sin ayuda', set: 'm9w3' },
    { id: 'mr9-s6', text: 'I can write an accurate 4-bar TAB of a riff I already play, that reproduces the riff from the page alone', text_es: 'Puedo escribir un TAB preciso de 4 compases de un riff que ya toco, que reproduce el riff únicamente a partir de la página', set: 'm9w3' }
  ],
  assessItems: [
    'Name every string at the fret-5 dot and the fret-7 dot, no chart, within 5 seconds each',
    'Play a thread-song melody from TAB in a higher position',
    'Finish a 4-bar TAB you wrote yourself that passes the cold-read test — a day later, the page alone reproduces the riff',
    'Play a melody that crosses three or more strings cleanly, every note ringing in order',
    'Read a partial-shape or slash chord chart and name which strings actually ring'
  ],
  assessItems_es: [
    'Nombra cada cuerda en el punto del traste 5 y del traste 7, sin diagrama, en menos de 5 segundos cada una',
    'Toca una melodía de canción hilo a partir de TAB en una posición alta',
    'Termina un TAB de 4 compases que escribiste tú mismo y que pasa la prueba de lectura a primera vista — un día después, la página sola reproduce el riff',
    'Toca una melodía que cruce tres o más cuerdas de forma limpia, cada nota sonando en orden',
    'Lee un diagrama de forma parcial o de acorde con barra diagonal y nombra cuáles cuerdas realmente suenan'
  ],
  forward: 'The whole neck is yours now — and you can write down anything you figure out. <strong>Module 10 turns notes into keys:</strong> you\'ll learn the recipe that builds every scale, find the key of any song, and start trusting your ear. (And any time you come back from a long break, <strong>Set 1</strong> at the top of this module re-checks the six core skills in one sitting.)',
  forward_es: 'Ahora todo el mástil es tuyo — y puedes escribir cualquier cosa que descifres. <strong>El Módulo 10 convierte notas en tonalidades:</strong> aprenderás la receta que construye cada escala, encontrarás la tonalidad de cualquier canción, y empezarás a confiar en tu oído. (Y cada vez que vuelvas de un receso largo, la <strong>Unidad 1</strong> al inicio de este módulo repasa las seis destrezas principales en una sola sesión.)',
  standards: ['Pr.4a', 'Pr.6a', 'Cn.10a']
};
