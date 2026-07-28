// ============================================================
//  MODULE 10 — Scales, Keys & Ear Training
//  Edit this file to change Module 10 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm10w1',
    label: 'Set 1',
    locked: false,
    module: 'Scales, Keys & Ear Training',
    moduleNum: 10,
    unit: 'Module 10 · Scales, Keys & Ear Training',
    unit_es: 'Módulo 10 · Escalas, tonalidades y entrenamiento auditivo',
    title: 'Set 1',
    subtitle: 'The W-W-H recipe · Build a scale on one string · Where pentatonics come from',
    subtitle_es: 'La receta de tonos y semitonos · Construye una escala en una sola cuerda · De dónde vienen las pentatónicas',
    skillFocus: 'W-W-H-W-W-W-H · Whole step = 2 frets, half step = 1 · Major pentatonic = major scale minus 2 notes',
    skillFocus_es: 'T-T-S-T-T-T-S · Un tono = 2 trastes, un semitono = 1 · La pentatónica mayor = la escala mayor menos 2 notas',
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
                label: 'Watch: the major scale recipe', label_es: 'Mira: la receta de la escala mayor',
                text: 'Watch: <a href="https://www.youtube.com/watch?v=fnVlMjza32c" target="_blank">What is a Major Scale Guitar Lesson - Music Theory For Guitar – Lauren Bateman (0:00–5:12)</a>. Follow along as she lays out the whole/half-step recipe — the exact formula you\'ll use to build C and G major yourself.',
                text_es: 'Mira: <a href="https://www.youtube.com/watch?v=fnVlMjza32c" target="_blank">What is a Major Scale Guitar Lesson - Music Theory For Guitar – Lauren Bateman (0:00–5:12)</a>. Sigue el video mientras ella explica la receta de tonos y semitonos — la fórmula exacta que usarás para construir C mayor y G mayor tú mismo.',
                hint: 'The recipe is a formula — the exact same seven-step pattern of whole and half steps, starting from any note, builds that note\'s major scale.',
                hint_es: 'La receta es una fórmula — el mismo patrón de siete pasos de tonos y semitonos, empezando desde cualquier nota, construye la escala mayor de esa nota.',
                skills: [1],
                response: { type: 'mc', prompt: 'The step recipe that builds EVERY major scale is:',
                  prompt_es: 'La receta de pasos que construye TODAS las escalas mayores es:',
                  answer: 1,
                  explain: 'Whole-whole-half, whole-whole-whole-half. Same recipe from any starting note — that\'s what makes it a formula.',
                  explain_es: 'Tono-tono-semitono, tono-tono-tono-semitono. La misma receta desde cualquier nota inicial — eso es lo que la hace una fórmula.',
                  choices: ['W-H-W-W-H-W-W', 'W-W-H-W-W-W-H', 'H-W-W-H-W-W-W', 'W-W-W-H-W-W-H'],
                  choices_es: ['T-S-T-T-S-T-T', 'T-T-S-T-T-T-S', 'S-T-T-S-T-T-T', 'T-T-T-S-T-T-S'] }
              },
              {
                label: 'Watch: the major pentatonic scale', label_es: 'Mira: la pentatónica mayor',
                text: 'Watch: <a href="https://youtu.be/m_IiyJu60-c" target="_blank">How to Play the Major Pentatonic Scale: Your Guide to Beautiful Solos – Marty Music</a>. This is where the pentatonic sound you\'ve been soloing with since Module 4 actually comes from.',
                text_es: 'Mira: <a href="https://youtu.be/m_IiyJu60-c" target="_blank">How to Play the Major Pentatonic Scale: Your Guide to Beautiful Solos – Marty Music</a>. Aquí es de donde realmente viene el sonido pentatónico con el que has estado improvisando desde el Módulo 4.',
                hint: 'Major pentatonic isn\'t a separate scale to memorize — it\'s the major scale with two notes lifted out.',
                hint_es: 'La pentatónica mayor no es una escala separada para memorizar — es la escala mayor con dos notas quitadas.',
                skills: [5],
                response: { type: 'mc', prompt: 'Major pentatonic is the major scale with which two notes removed?',
                  prompt_es: '¿La pentatónica mayor es la escala mayor menos cuáles dos notas?',
                  answer: 2,
                  explain: 'Drop the 4th and 7th — the two "tension" notes, the ones that sound unsettled and want to move — and the friendly five-note pentatonic you already solo with is what\'s left.',
                  explain_es: 'Quita el 4º y el 7º — las dos notas de "tensión", las que suenan inestables y quieren resolver — y lo que queda es la amigable escala pentatónica de cinco notas con la que ya improvisas.',
                  choices: ['1st and 5th', '2nd and 6th', '4th and 7th', '3rd and 5th'],
                  choices_es: ['1º y 5º', '2º y 6º', '4º y 7º', '3º y 5º'] }
              }
            ]
          },
          {
            title: 'Listen for the recipe as you play it',
            title_es: 'Escucha la receta mientras la tocas',
            steps: [
              {
                label: 'Hear the recipe in the frets', label_es: 'Escucha la receta en los trastes',
                text: 'Listen for it: play up the C major scale on one string, saying "whole, whole, half, whole, whole, whole, half" out loud on every step. The distances should match the frets you\'re moving.',
                text_es: 'Escucha esto: toca la escala de C mayor subiendo en una sola cuerda, diciendo "tono, tono, semitono, tono, tono, tono, semitono" en voz alta en cada paso. Las distancias deben coincidir con los trastes que te mueves.',
                hint: 'On guitar, a whole step and a half step are just fret distances — say the word, then check it\'s 2 frets (whole) or 1 fret (half).',
                hint_es: 'En la guitarra, un tono y un semitono son solo distancias de trastes — di la palabra, y luego comprueba que sean 2 trastes (tono) o 1 traste (semitono).',
                skills: [2],
                response: { type: 'mc', prompt: 'On guitar, a whole step equals how many frets?',
                  prompt_es: 'En la guitarra, ¿cuántos trastes equivale un tono?',
                  answer: 1,
                  explain: 'One fret = half step, two frets = whole step. The recipe becomes fret distances: 2-2-1-2-2-2-1.',
                  explain_es: 'Un traste = semitono, dos trastes = tono. La receta se convierte en distancias de trastes: 2-2-1-2-2-2-1.',
                  choices: ['1', '2', '3', '4'],
                  choices_es: ['1', '2', '3', '4'] }
              }
            ]
          },
          {
            title: 'Try building a scale from a new starting note',
            title_es: 'Prueba a construir una escala desde una nota inicial nueva',
            steps: [
              {
                label: 'Build C major with the recipe', label_es: 'Construye C mayor con la receta',
                text: 'Now try it: run the same W-W-H-W-W-W-H recipe starting from C first — your baseline — and notice you never need a sharp or flat. That clean run is what makes the odd note stand out when you try G next.',
                text_es: 'Ahora pruébalo: corre la misma receta T-T-S-T-T-T-S empezando primero desde C — tu punto de referencia — y fíjate que nunca necesitas un sostenido ni un bemol. Ese recorrido limpio es lo que hace que la nota rara resalte cuando pruebes G a continuación.',
                hint: 'C major is the recipe\'s starting-point example — every other major key is the same shape, just starting somewhere else.',
                hint_es: 'C mayor es el ejemplo de punto de partida de la receta — cada otra tonalidad mayor es la misma forma, solo que empieza en otro lugar.',
                skills: [6],
                response: { type: 'mc', prompt: 'C major is special among scales because:',
                  prompt_es: 'C mayor es especial entre las escalas porque:',
                  answer: 1,
                  explain: 'C is the recipe\'s "clean" starting point — all seven natural notes, C D E F G A B.',
                  explain_es: 'C es el punto de partida "limpio" de la receta — las siete notas naturales, C D E F G A B.',
                  choices: ['It has one sharp', 'It has no sharps or flats', 'It\'s the hardest scale', 'It only works on piano'],
                  choices_es: ['Tiene un sostenido', 'No tiene sostenidos ni bemoles', 'Es la escala más difícil', 'Solo funciona en el piano'] }
              },
              {
                label: 'Try the recipe from G', label_es: 'Prueba la receta desde G',
                text: 'Try it again starting from G, on one string — follow the recipe exactly and see what note comes out different from the rest.',
                text_es: 'Pruébalo otra vez empezando desde G, en una sola cuerda — sigue la receta exactamente y observa qué nota sale distinta de las demás.',
                hint: 'Follow W-W-H-W-W-W-H from G one step at a time; the recipe itself will tell you which note needs raising.',
                hint_es: 'Sigue T-T-S-T-T-T-S desde G un paso a la vez; la receta misma te dirá cuál nota necesita subirse.',
                skills: [3],
                response: { type: 'mc', prompt: 'Follow the recipe from G and one note comes out sharp. Which?',
                  prompt_es: 'Sigue la receta desde G y una nota sale sostenida. ¿Cuál?',
                  answer: 2,
                  explain: 'G A B C D E F#. The last whole step forces F up to F# — G major\'s single sharp.',
                  explain_es: 'G A B C D E F#. El último tono obliga a F a subir a F# — el único sostenido de G mayor.',
                  choices: ['C#', 'G#', 'F#', 'A#'],
                  choices_es: ['C#', 'G#', 'F#', 'A#'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: what is a key?', label_es: 'Cierre: ¿qué es una tonalidad?',
                text: 'Station Wrap-Up — in your own words: what does it mean when someone says a song is "in the key of G"?',
                text_es: 'Cierre de la estación — con tus propias palabras: ¿qué significa cuando alguien dice que una canción está "en la tonalidad de G"?',
                response: { type: 'short', placeholder: 'e.g. its notes and chords come from the G major scale — G feels like home',
                  placeholder_es: 'p. ej. sus notas y acordes vienen de la escala de G mayor — G se siente como el hogar' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — building the major scale',
        title_es: 'Estación de práctica — construir la escala mayor',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tuning check', label_es: 'Calentamiento: afinación',
                text: 'Start every practice session the same way:<ol><li>Tune all 6 strings to green (E A D G B e).</li><li>Play each string open.</li></ol>You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera:<ol><li>Afina las 6 cuerdas hasta que estén en verde (E A D G B e).</li><li>Toca cada cuerda al aire.</li></ol>Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Build C major and G major on one string',
            title_es: 'Construye C mayor y G mayor en una sola cuerda',
            steps: [
              {
                label: 'Challenge 1 — C Major Walk', label_es: 'Reto 1 — Caminata de C Mayor',
                text: '<ul><li>Play the C major scale on the A string using the recipe, saying "whole, whole, half…" out loud as you go.</li></ul>',
                text_es: '<ul><li>Toca la escala de C mayor en la cuerda La usando la receta, diciendo "tono, tono, semitono…" en voz alta mientras avanzas.</li></ul>',
                hint: 'Start on C (A string, fret 3) and let the recipe — not a chart — tell you where each next note lands.',
                hint_es: 'Empieza en C (cuerda La, traste 3) y deja que la receta — no un diagrama — te diga dónde cae cada siguiente nota.',
                stuck: 'Play just the first three notes (C-D-E) until the whole-whole-half feel is automatic, then keep climbing.',
                stuck_es: 'Toca solo las primeras tres notas (C-D-E) hasta que la sensación de tono-tono-semitono sea automática, y luego sigue subiendo.',
                levelUp: 'Play it descending too, saying the recipe backwards (half, whole, whole, whole, half, whole, whole).',
                levelUp_es: 'Tócala también descendiendo, diciendo la receta al revés (semitono, tono, tono, tono, semitono, tono, tono).',
                skills: [1, 2],
                playSeq: { label: 'C major on the A string (recipe walk)', label_es: 'C mayor en la cuerda La (caminata de la receta)', bpm: 60, notes: [48, 50, 52, 53, 55, 57, 59, 60] }
              },
              {
                label: 'Challenge 2 — G Major Walk', label_es: 'Reto 2 — Caminata de G Mayor',
                text: '<ol><li>Play the G major scale on the low E string using the same recipe.</li><li>Catch the one note that needs to be sharp.</li></ol>',
                text_es: '<ol><li>Toca la escala de G mayor en la cuerda Mi grave usando la misma receta.</li><li>Detecta la única nota que necesita ser sostenida.</li></ol>',
                hint: 'Everything is identical to the C major walk except one note — the recipe itself will tell you which.',
                hint_es: 'Todo es idéntico a la caminata de C mayor excepto una nota — la receta misma te dirá cuál.',
                stuck: 'Play up to the 6th note first (G-A-B-C-D-E), stop, and only then figure out what the 7th note needs to be.',
                stuck_es: 'Toca hasta la 6ª nota primero (G-A-B-C-D-E), detente, y solo entonces averigua qué necesita ser la 7ª nota.',
                levelUp: 'Play both C major and G major back to back without stopping, on their two different strings.',
                levelUp_es: 'Toca C mayor y G mayor una después de la otra sin detenerte, en sus dos cuerdas distintas.',
                skills: [1, 3],
                playSeq: { label: 'G major on the low E string', label_es: 'G mayor en la cuerda Mi grave', bpm: 60, notes: [43, 45, 47, 48, 50, 52, 54, 55] }
              }
            ]
          },
          {
            title: 'Say the recipe while you play',
            title_es: 'Di la receta mientras tocas',
            steps: [
              {
                label: 'Challenge 3 — Recipe by Heart (your assessment piece)', label_es: 'Reto 3 — La Receta de Memoria (tu pieza de evaluación)',
                text: '<ul><li>Play the C major scale while saying "whole, whole, half, whole, whole, whole, half" out loud, no chart, no hesitating.</li></ul>You\'ve got it when: you can say the whole recipe from memory before you even touch the guitar.',
                text_es: '<ul><li>Toca la escala de C mayor mientras dices "tono, tono, semitono, tono, tono, tono, semitono" en voz alta, sin diagrama, sin dudar.</li></ul>Lo tienes cuando: puedes decir toda la receta de memoria antes incluso de tocar la guitarra.',
                hint: 'If you can say the recipe from memory, you can build ANY major scale on the spot — that\'s the whole point of memorizing it as words, not just frets.',
                hint_es: 'Si puedes decir la receta de memoria, puedes construir CUALQUIER escala mayor al instante — ese es el punto de memorizarla como palabras, no solo como trastes.',
                stuck: 'Say the recipe alone, away from the guitar, until it\'s automatic — then add the fretting hand back in.',
                stuck_es: 'Di la receta sola, lejos de la guitarra, hasta que sea automática — y luego agrega de nuevo la mano de trastear.',
                levelUp: 'Say the recipe starting from a key you haven\'t tried yet (D, or A) and build it on the spot.',
                levelUp_es: 'Di la receta empezando desde una tonalidad que no hayas probado todavía (D, o A) y constrúyela al instante.',
                skills: [1, 6]
              }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Let It Be", in the scale', label_es: 'Reto — "Let It Be", dentro de la escala',
                text: '<ol><li>Hum the "Let It Be" melody while playing the C major walk underneath it.</li><li>Notice every note of the tune lives inside the scale you just built.</li></ol>',
                text_es: '<ol><li>Tararea la melodía de "Let It Be" mientras tocas la caminata de C mayor debajo.</li><li>Fíjate cómo cada nota de la melodía vive dentro de la escala que acabas de construir.</li></ol>',
                hint: 'This is the payoff of today\'s whole set — a song\'s melody isn\'t random, it\'s built from the same key\'s scale.',
                hint_es: 'Esta es la recompensa de toda la unidad de hoy — la melodía de una canción no es aleatoria, está construida a partir de la escala de su misma tonalidad.',
                stuck: 'Just hum the first line of the melody on its own first, then play the C major walk separately, then try them together.',
                stuck_es: 'Primero tararea sola la primera línea de la melodía, luego toca la caminata de C mayor por separado, y después intenta ambas juntas.',
                levelUp: 'Find where in the walk the melody\'s highest note lives, and name it.',
                levelUp_es: 'Encuentra dónde en la caminata vive la nota más aguda de la melodía, y nómbrala.',
                skills: [2, 4]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: do you know the recipe?', label_es: 'Cierre: ¿sabes la receta?',
                text: 'Can you say the major-scale recipe from memory right now, no guitar in hand? Write below how confident you feel.',
                text_es: '¿Puedes decir la receta de la escala mayor de memoria ahora mismo, sin guitarra en la mano? Escribe abajo qué tan seguro te sientes.',
                response: { type: 'short', placeholder: 'e.g. solid on W-W-H-W-W-W-H now — just need more tries building from a new note',
                  placeholder_es: 'p. ej. ya domino T-T-S-T-T-T-S — solo necesito más intentos construyendo desde una nota nueva' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Says the recipe from memory · Builds C and G major on one string · Explains where the pentatonic comes from',
      goal_es: 'Dice la receta de memoria · Construye C mayor y G mayor en una sola cuerda · Explica de dónde viene la pentatónica',
      performance: 'Build C major on one string using only the recipe — no chart — saying each whole/half step out loud as you go.',
      selfCheck: 'Can you spell G major out loud, including its sharp? Can you say which two scale notes pentatonic drops?',
      selfCheck_es: '¿Puedes deletrear G mayor en voz alta, incluyendo su sostenido? ¿Puedes decir cuáles dos notas de la escala quita la pentatónica?',
      standards: ['Pr.4a', 'Cn.10a']
    },

    skills: [
      { id: 'm10w1-s1', text: 'Say the major-scale recipe (W-W-H-W-W-W-H) from memory',
        text_es: 'Decir la receta de la escala mayor (T-T-S-T-T-T-S) de memoria',
        gotItWhen: 'you can say "whole, whole, half, whole, whole, whole, half" out loud, start to finish, with no chart and no hesitating.',
        gotItWhen_es: 'puedes decir "tono, tono, semitono, tono, tono, tono, semitono" en voz alta, de principio a fin, sin diagrama y sin dudar.',
        practice: { type: 'mc', prompt: 'In fret distances, the recipe is:',
          prompt_es: 'En distancias de trastes, la receta es:',
          choices: ['2-2-1-2-2-2-1', '1-2-2-1-2-2-2', '2-1-2-2-1-2-2', '3-3-1-3-3-3-1'],
          choices_es: ['2-2-1-2-2-2-1', '1-2-2-1-2-2-2', '2-1-2-2-1-2-2', '3-3-1-3-3-3-1'], answer: 0,
          explain: 'One fret is a half step and two frets are a whole step, so W-W-H-W-W-W-H becomes 2-2-1-2-2-2-1 on the neck. The two 1s always land in the same places — between notes 3 and 4, and between 7 and 8.',
          explain_es: 'Un traste es un semitono y dos trastes son un tono, así que T-T-S-T-T-T-S se convierte en 2-2-1-2-2-2-1 en el mástil. Los dos 1 siempre caen en los mismos lugares — entre las notas 3 y 4, y entre la 7 y la 8.' } },
      { id: 'm10w1-s2', text: 'Build a C major scale on one string using the recipe',
        text_es: 'Construir una escala de C mayor en una sola cuerda usando la receta',
        gotItWhen: 'you can play all eight notes of the C major scale on the A string, saying "whole, whole, half…" out loud as you go, letting the recipe — not a chart — tell you where each note lands.',
        gotItWhen_es: 'puedes tocar las ocho notas de la escala de C mayor en la cuerda La, diciendo "tono, tono, semitono…" en voz alta mientras avanzas, dejando que la receta — no un diagrama — te diga dónde cae cada nota.',
        practice: { type: 'playSeq', label: 'C major on the A string', label_es: 'C mayor en la cuerda La', bpm: 60, notes: [48, 50, 52, 53, 55, 57, 59, 60] } },
      { id: 'm10w1-s3', text: 'Build a G major scale on one string and find the F#',
        text_es: 'Construir una escala de G mayor en una sola cuerda y encontrar el F#',
        gotItWhen: 'you can play the G major scale on the low E string using the recipe and land on the one sharped note — F# — without being told which one it is.',
        gotItWhen_es: 'puedes tocar la escala de G mayor en la cuerda Mi grave usando la receta y llegar a la única nota sostenida — F# — sin que te digan cuál es.',
        practice: { type: 'playSeq', label: 'G major on the low E string', label_es: 'G mayor en la cuerda Mi grave', bpm: 60, notes: [43, 45, 47, 48, 50, 52, 54, 55] } },
      { id: 'm10w1-s4', text: 'Explain what a key is — the scale a song\'s notes and chords come from',
        text_es: 'Explicar qué es una tonalidad — la escala de la que vienen las notas y acordes de una canción',
        gotItWhen: 'you can finish the sentence "this song is in G" by explaining, in your own words, that its notes and chords come from the G major scale and G feels like home.',
        gotItWhen_es: 'puedes completar la frase "esta canción está en G" explicando, con tus propias palabras, que sus notas y acordes vienen de la escala de G mayor y G se siente como el hogar.',
        practice: { type: 'mc', prompt: '"This song is in A" most nearly means:',
          prompt_es: '"Esta canción está en A" quiere decir principalmente que:',
          choices: ['It starts loud', 'Its notes & chords come from the A major scale and A feels like home', 'It uses only the A string', 'It\'s at 100 BPM'],
          choices_es: ['Empieza fuerte', 'Sus notas y acordes vienen de la escala de A mayor y A se siente como el hogar', 'Usa solo la cuerda La', 'Está a 100 BPM'], answer: 1,
          explain: 'A key names two things: the scale a song draws its notes and chords from, and the note that feels like home. It says nothing about how loud or how fast the song is.',
          explain_es: 'Una tonalidad nombra dos cosas: la escala de la que la canción saca sus notas y acordes, y la nota que se siente como el hogar. No dice nada sobre qué tan fuerte ni qué tan rápida es la canción.' } },
      { id: 'm10w1-s5', text: 'Explain how major pentatonic relates to the major scale',
        text_es: 'Explicar cómo se relaciona la pentatónica mayor con la escala mayor',
        gotItWhen: 'you can say, without looking it up, that major pentatonic is just the major scale with the 4th and 7th notes dropped out.',
        gotItWhen_es: 'puedes decir, sin consultar nada, que la pentatónica mayor es simplemente la escala mayor sin el 4º y el 7º grado.',
        practice: { type: 'mc', prompt: 'The pentatonic has how many different notes?',
          prompt_es: '¿Cuántas notas distintas tiene la pentatónica?',
          choices: ['4', '5', '6', '7'], choices_es: ['4', '5', '6', '7'], answer: 1,
          explain: '"Penta" means five — the pentatonic is the seven-note major scale with two notes taken out (the 4th and the 7th). Dropping the two most unsettled notes is what makes it so forgiving to solo with.',
          explain_es: '"Penta" significa cinco — la pentatónica es la escala mayor de siete notas con dos notas quitadas (el 4º y el 7º grado). Quitar las dos notas más inquietas es lo que la hace tan fácil de usar al improvisar.' } },
      { id: 'm10w1-s6', text: 'Spell C major and G major note-by-note out loud',
        text_es: 'Deletrear C mayor y G mayor nota por nota en voz alta',
        gotItWhen: 'you can say "C D E F G A B" for C major and "G A B C D E F# G" for G major out loud, without hesitating on the sharp.',
        gotItWhen_es: 'puedes decir "C D E F G A B" para C mayor y "G A B C D E F# G" para G mayor en voz alta, sin dudar en el sostenido.',
        practice: { type: 'mc', prompt: 'Which is the correct spelling of the G major scale?',
          prompt_es: '¿Cuál es el deletreo correcto de la escala de G mayor?',
          choices: ['G A B C D E F G', 'G A B C D E F# G', 'G A Bb C D E F# G', 'G B D G B D G'],
          choices_es: ['G A B C D E F G', 'G A B C D E F# G', 'G A Bb C D E F# G', 'G B D G B D G'], answer: 1,
          explain: 'Run the W-W-H-W-W-W-H recipe from G and the 7th note lands on F#, not F — forgetting that sharp is the classic slip. (C major is the one key with no sharps or flats.)',
          explain_es: 'Aplica la receta W-W-H-W-W-W-H desde G y la 7ª nota cae en F#, no en F — olvidar ese sostenido es el desliz clásico. (C mayor es la única tonalidad sin sostenidos ni bemoles.)' } }
    ]
  },

  {
    id: 'm10w2',
    label: 'Set 2',
    locked: false,
    module: 'Scales, Keys & Ear Training',
    moduleNum: 10,
    unit: 'Module 10 · Scales, Keys & Ear Training',
    unit_es: 'Módulo 10 · Escalas, tonalidades y entrenamiento auditivo',
    title: 'Set 2',
    subtitle: 'Every major key\'s minor twin · Relative vs parallel · Add the b5 = blues',
    subtitle_es: 'La gemela menor de cada tonalidad mayor · Relativa vs. paralela · Agrega la b5 = blues',
    skillFocus: 'Relative minor = 3 frets down (the 6th degree) · Relative shares NOTES, parallel shares ROOT · Blues scale = minor pentatonic + b5',
    skillFocus_es: 'La relativa menor = 3 trastes abajo (el 6º grado) · La relativa comparte NOTAS, la paralela comparte RAÍZ · La escala de blues = pentatónica menor + b5',
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
                label: 'Watch: minor pentatonic refresher', label_es: 'Mira: repaso de pentatónica menor',
                text: 'Watch: <a href="https://www.youtube.com/watch?v=l6ayje1ug_0" target="_blank">The MINOR PENTATONIC scale on Guitar Explained – Lauren Bateman (0:00–5:30)</a> as a refresher on the box-1 shape you\'ll build the blues scale from today.',
                text_es: 'Mira: <a href="https://www.youtube.com/watch?v=l6ayje1ug_0" target="_blank">The MINOR PENTATONIC scale on Guitar Explained – Lauren Bateman (0:00–5:30)</a> como repaso de la forma de la caja 1 sobre la que vas a construir la escala de blues hoy.',
                hint: 'Everything today builds on top of the minor pentatonic box you already know from Module 4 — nothing new to fret, just one note added.',
                hint_es: 'Todo lo de hoy se construye encima de la caja de pentatónica menor que ya conoces del Módulo 4 — nada nuevo que trastear, solo se agrega una nota.',
                skills: [1],
                response: { type: 'mc', prompt: 'Minor pentatonic box 1 with its root at low-E fret 5 is which key?',
                  prompt_es: '¿La caja 1 de la pentatónica menor con su raíz en el traste 5 de la Mi grave es qué tonalidad?',
                  answer: 1,
                  explain: 'The root fret names the key — fret 5 on the low E is A, so box 1 there is A minor: the shape you\'ll add the blues note to today.',
                  explain_es: 'El traste de la raíz nombra la tonalidad — el traste 5 en la Mi grave es A, así que la caja 1 ahí es A menor: la forma a la que le agregarás la nota de blues hoy.',
                  choices: ['C minor', 'A minor', 'E minor', 'G minor'],
                  choices_es: ['C menor', 'A menor', 'E menor', 'G menor'] }
              },
              {
                label: 'Watch: the blues scale', label_es: 'Mira: la escala de blues',
                text: 'Watch: <a href="https://youtu.be/EILFkSGNkdA" target="_blank">The First Scale Beginners Should Learn for BLUES GUITAR – JustinGuitar</a>. Listen for the one extra note added to the minor pentatonic box you already know — that\'s the b5.',
                text_es: 'Mira: <a href="https://youtu.be/EILFkSGNkdA" target="_blank">The First Scale Beginners Should Learn for BLUES GUITAR – JustinGuitar</a>. Escucha la única nota extra que se agrega a la caja de pentatónica menor que ya conoces — esa es la b5.',
                hint: 'The blues scale is just minor pentatonic plus one extra note — listen for where it gets added in the video.',
                hint_es: 'La escala de blues es simplemente la pentatónica menor más una nota extra — escucha dónde se agrega en el video.',
                skills: [4],
                response: { type: 'mc', prompt: 'The blues scale is the minor pentatonic plus which extra note?',
                  prompt_es: '¿La escala de blues es la pentatónica menor más cuál nota extra?',
                  answer: 1,
                  explain: 'One sour-sweet note — the flat five — turns the pentatonic blue.',
                  explain_es: 'Una nota agridulce — la quinta bemol — convierte la pentatónica en blues.',
                  choices: ['The 2nd', 'The b5', 'The major 7th', 'The 4th'],
                  choices_es: ['El 2º', 'La b5', 'La 7ª mayor', 'El 4º'] }
              }
            ]
          },
          {
            title: 'Listen for relative vs parallel',
            title_es: 'Escucha la relativa frente a la paralela',
            steps: [
              {
                label: 'Ear training: relative vs. parallel', label_es: 'Oído: relativa vs. paralela',
                text: 'Listen for it:<ol><li>Play a C major chord, then an A minor chord, then a C minor chord (Cm = your full Bm barre shape from Module 7, slid up one fret to fret 3).</li><li>C-to-Am shares every note (relative); C-to-Cm shares only the root (parallel).</li><li>Notice how different Am and Cm sound from each other, even though both are "C\'s minor."</li></ol>',
                text_es: 'Escucha esto:<ol><li>Toca un acorde de C mayor, luego un acorde de A menor, y luego un acorde de C menor (Cm = tu forma completa de cejilla de Bm del Módulo 7, deslizada un traste hacia arriba, al traste 3).</li><li>C a Am comparte cada nota (relativa); C a Cm comparte solo la raíz (paralela).</li><li>Fíjate qué tan diferentes suenan Am y Cm entre sí, aunque ambos sean "el menor de C."</li></ol>',
                hint: 'These two ideas get mixed up constantly — the exercise is hearing that "C\'s relative minor" and "C\'s parallel minor" are two completely different chords.',
                hint_es: 'Estas dos ideas se confunden constantemente — el ejercicio es escuchar que "la relativa menor de C" y "la paralela menor de C" son dos acordes completamente distintos.',
                skills: [2],
                response: { type: 'mc', prompt: 'Relative minor vs parallel minor — the difference is:',
                  prompt_es: 'La relativa menor frente a la paralela menor — la diferencia es:',
                  answer: 0,
                  explain: 'A minor is C major\'s relative (same notes). C minor is C major\'s parallel (same root, different notes).',
                  explain_es: 'A menor es la relativa de C mayor (mismas notas). C menor es la paralela de C mayor (misma raíz, notas distintas).',
                  choices: ['Relative shares the same NOTES; parallel shares the same ROOT', 'They\'re two names for one thing', 'Parallel shares the notes; relative shares the root', 'Neither involves minor'],
                  choices_es: ['La relativa comparte las mismas NOTAS; la paralela comparte la misma RAÍZ', 'Son dos nombres para la misma cosa', 'La paralela comparte las notas; la relativa comparte la raíz', 'Ninguna de las dos involucra menor'] }
              }
            ]
          },
          {
            title: 'Try finding a core song\'s relative key',
            title_es: 'Prueba a encontrar la tonalidad relativa de una canción principal',
            steps: [
              {
                label: 'Find "Watchtower"\'s relative major', label_es: 'La relativa mayor de "Watchtower"',
                text: 'Now try it: "All Along the Watchtower" loops in A minor. Find its relative major by sliding 3 frets up from A — check your answer before moving on.',
                text_es: 'Ahora pruébalo: "All Along the Watchtower" gira en A menor. Encuentra su relativa mayor deslizando 3 trastes hacia arriba desde A — comprueba tu respuesta antes de seguir.',
                hint: 'Relative major is always 3 frets UP from a minor root — the mirror image of sliding 3 frets down to find a relative minor.',
                hint_es: 'La relativa mayor siempre está 3 trastes ARRIBA de una raíz menor — la imagen espejo de deslizar 3 trastes abajo para encontrar una relativa menor.',
                skills: [3],
                response: { type: 'mc', prompt: '"All Along the Watchtower" lives in A minor. Its relative major is:',
                  prompt_es: '"All Along the Watchtower" vive en A menor. Su relativa mayor es:',
                  answer: 2,
                  explain: '3 frets UP from A lands on C — Am and C major share every note.',
                  explain_es: '3 trastes ARRIBA de A cae en C — Am y C mayor comparten cada nota.',
                  choices: ['A major', 'F major', 'C major', 'G major'],
                  choices_es: ['A mayor', 'F mayor', 'C mayor', 'G mayor'] }
              },
              {
                label: 'Why "Luna"\'s solo is in D minor', label_es: 'Por qué el solo de "Luna" está en D menor',
                text: 'Try it on "Luna": its solo lives in D minor pentatonic even though the song is in F major. Work out why using what you just learned about relative keys.',
                text_es: 'Pruébalo con "Luna": su solo vive en la pentatónica menor de D aunque la canción esté en F mayor. Descubre por qué usando lo que acabas de aprender sobre tonalidades relativas.',
                hint: 'D minor is exactly 3 frets down from F — the same relative relationship you just used on "Watchtower".',
                hint_es: 'D menor está exactamente 3 trastes abajo de F — la misma relación relativa que acabas de usar en "Watchtower".',
                skills: [5],
                response: { type: 'mc', prompt: '"Luna" is in F major, which is exactly why its solo uses:',
                  prompt_es: '"Luna" está en F mayor, y por eso mismo su solo usa:',
                  answer: 1,
                  explain: 'D minor is F major\'s relative minor — same notes. That\'s why the Module 4 solo box sits at fret 10: its root is D.',
                  explain_es: 'D menor es la relativa menor de F mayor — mismas notas. Por eso la caja del solo del Módulo 4 está en el traste 10: su raíz es D.',
                  choices: ['F minor pentatonic', 'D minor pentatonic', 'A major pentatonic', 'C blues'],
                  choices_es: ['Pentatónica menor de F', 'Pentatónica menor de D', 'Pentatónica mayor de A', 'Blues de C'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: explain relative minor', label_es: 'Cierre: explica la relativa menor',
                text: 'Station Wrap-Up — explain relative minor in one sentence, as if to a friend.',
                text_es: 'Cierre de la estación — explica la relativa menor en una oración, como si fuera para un amigo.',
                response: { type: 'short', placeholder: 'e.g. it\'s the minor key hiding inside every major key — same notes, sadder home',
                  placeholder_es: 'p. ej. es la tonalidad menor escondida dentro de cada tonalidad mayor — mismas notas, un hogar más triste' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — relative keys and the blues scale',
        title_es: 'Estación de práctica — tonalidades relativas y la escala de blues',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tuning check', label_es: 'Calentamiento: afinación',
                text: 'Start every practice session the same way:<ol><li>Tune all 6 strings to green (E A D G B e).</li><li>Play each string open.</li></ol>You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera:<ol><li>Afina las 6 cuerdas hasta que estén en verde (E A D G B e).</li><li>Toca cada cuerda al aire.</li></ol>Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Find relative and parallel minors',
            title_es: 'Encuentra relativas y paralelas menores',
            steps: [
              {
                label: 'Challenge 1 — Relative Pairs Drill', label_es: 'Reto 1 — Ejercicio de Pares Relativos',
                text: 'A drill is a short exercise you repeat to build a skill.<ol><li>Run the deck below — major key on the front, relative minor on the back — and answer out loud before you check.</li><li>Then explain out loud how a PARALLEL minor would be different for the same key.</li></ol>',
                text_es: 'Un ejercicio es una actividad corta que repites para desarrollar una destreza.<ol><li>Corre la baraja de abajo — tonalidad mayor al frente, relativa menor atrás — y responde en voz alta antes de revisar.</li><li>Luego explica en voz alta cómo sería distinta una paralela menor para esa misma tonalidad.</li></ol>',
                drill: { type: 'deck', deck: 'relative-pairs' },
                hint: 'The shortcut: relative minor is always 3 frets down from the major root, or the major scale\'s 6th note.',
                hint_es: 'El atajo: la relativa menor siempre está 3 trastes abajo de la raíz mayor, o es la 6ª nota de la escala mayor.',
                stuck: 'Drill just C→Am and G→Em until those two are automatic, then add the rest.',
                stuck_es: 'Practica solo C→Am y G→Em hasta que esos dos sean automáticos, y luego agrega el resto.',
                levelUp: 'Add two more keys of your own (E, Bb) and find their relative minors on the spot.',
                levelUp_es: 'Agrega dos tonalidades más por tu cuenta (E, Bb) y encuentra sus relativas menores al instante.',
                skills: [1, 2, 3]
              }
            ]
          },
          {
            title: 'Build and play the blues scale',
            title_es: 'Construye y toca la escala de blues',
            steps: [
              {
                label: 'Challenge 2 — Blues Scale (your assessment piece)', label_es: 'Reto 2 — Escala de Blues (tu pieza de evaluación)',
                text: '<ol><li>Add the b5 to A minor pentatonic box 1 and play it ascending and descending at 60 BPM.</li><li>The play button checks the ascending run — match it.</li><li>Then play the descent on your own after.</li></ol>You\'ve got it when: the added note matches what you hear from the play button, every time.',
                text_es: '<ol><li>Agrega la b5 a la caja 1 de la pentatónica menor de A y tócala subiendo y bajando a 60 BPM.</li><li>El botón de reproducir comprueba el recorrido ascendente — iguálalo.</li><li>Luego toca el descenso por tu cuenta después.</li></ol>Lo tienes cuando: la nota agregada coincide con lo que escuchas del botón de reproducir, cada vez.',
                hint: 'The b5 sits between two notes you already know in the box — it\'s one extra finger placement, not a new shape to learn from scratch.',
                hint_es: 'La b5 se ubica entre dos notas que ya conoces en la caja — es una colocación de dedo extra, no una forma nueva que aprender desde cero.',
                stuck: 'Play the plain minor pentatonic box first, then just add the one extra note once the rest is solid.',
                stuck_es: 'Toca primero la caja simple de pentatónica menor, y luego agrega solo la nota extra una vez que el resto esté sólido.',
                levelUp: 'Play the blues scale over a 12-bar blues feel, or build it starting from a different root.',
                levelUp_es: 'Toca la escala de blues sobre la sensación de un blues de 12 compases, o constrúyela empezando desde otra raíz.',
                skills: [4, 5],
                playSeq: { label: 'A blues scale, box 1', label_es: 'Escala de blues de A, caja 1', bpm: 60, notes: [45, 48, 50, 51, 52, 55, 57] }
              }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Smoke on the Water", bluesy', label_es: 'Reto — "Smoke on the Water", con sabor a blues',
                text: 'The riff (a riff is a short musical phrase that repeats) is in G, so the blues scale has to move there too — same shape, three frets down from where you built it:<ol><li>Play the G blues scale: the same box, starting at fret 3 on the low E string.</li><li>Play it over the feel of the riff. This is where this scale is normally used — the sound it was built for.</li></ol>You\'ve got it when: the scale sounds at home over the riff instead of fighting it.',
                text_es: 'El riff (un riff es una frase musical corta que se repite) está en G, así que la escala de blues también tiene que mudarse — la misma forma, tres trastes más abajo de donde la armaste:<ol><li>Toca la escala de blues de G: la misma caja, empezando en el traste 3 de la cuerda Mi grave.</li><li>Tócala sobre la sensación del riff. Aquí es donde normalmente se usa esta escala — el sonido para el que fue creada.</li></ol>Lo tienes cuando: la escala suena en casa sobre el riff en vez de pelearse con él.',
                hint: 'Look at the riff\'s own notes: G, Bb, C, then that Db before it falls back to C. Those are the first four notes of the G blues scale — and the Db IS the b5, the note you just added. The riff is not just in the same world as this scale; it is built out of it.',
                hint_es: 'Fíjate en las notas del riff: G, Bb, C, y ese Db antes de volver a C. Son las primeras cuatro notas de la escala de blues de G — y el Db ES el b5, la nota que acabas de agregar. El riff no solo vive en el mismo mundo que esta escala; está hecho de ella.',
                stuck: 'Play the riff itself first to get the feel steady, then freely play the blues scale over the same groove (a groove is the steady rhythmic feel).',
                stuck_es: 'Toca primero el riff mismo para asentar la sensación, y luego toca libremente la escala de blues sobre el mismo groove (un groove es la sensación rítmica constante).',
                levelUp: 'Try soloing over the riff using only the G blues scale, no other notes — and land on G to finish.',
                levelUp_es: 'Intenta improvisar un solo sobre el riff usando solo la escala de blues de G, sin otras notas — y termina cayendo en G.',
                skills: [5, 6]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: relative key and the b5', label_es: 'Cierre: la relativa y la b5',
                text: 'What\'s the relative minor of F ("Luna"\'s key)? Which single note makes a pentatonic a blues scale? Write both below. (One more below: Jam it — the blues scale over a real form.)',
                text_es: '¿Cuál es la relativa menor de F (la tonalidad de "Luna")? ¿Cuál nota única convierte una pentatónica en una escala de blues? Escribe ambas abajo. (Una más abajo: Tócalo de improviso — la escala de blues sobre una forma real.)',
                response: { type: 'short', placeholder: 'e.g. Dm is F\'s relative minor; the b5 is what makes it blues',
                  placeholder_es: 'p. ej. Dm es la relativa menor de F; la b5 es lo que la hace blues' }
              }
            ]
          },
          {
            title: 'Jam it — the blues scale over a real form',
            title_es: 'Tócalo de improviso — la escala de blues sobre una forma real',
            steps: [
              {
                label: 'Jam: blues scale over 12-bar form', label_es: 'Improvisa: blues de 12 compases',
                text: 'Jam it:<ol><li>Record yourself strumming the 12-bar blues form in A — the bars run A A A A | D D A A | E D A E (plain A, D, E or power chords work fine for now).</li><li>Then loop the recording and solo over it with your blues scale, box 1 at fret 5.</li><li>One chorus of comping, one chorus of soloing — one chorus = one full trip through the 12 bars, and comping = playing the backing chords while someone else solos.</li></ol>',
                text_es: 'Tócalo de improviso:<ol><li>Grábate rasgueando la forma de blues de 12 compases en A — los compases van A A A A | D D A A | E D A E (por ahora funcionan bien A, D, E simples o como acordes de potencia).</li><li>Luego repite la grabación en loop y haz un solo sobre ella con tu escala de blues, caja 1 en el traste 5.</li><li>Una vuelta de acompañamiento, una vuelta de solo — una vuelta = un recorrido completo por los 12 compases, y acompañar = tocar los acordes de base mientras otra persona hace el solo.</li></ol>',
                hint: 'To jam = play along freely and make up your own part. Follow the form, not just the scale — when the loop returns to A, land on an A and let it ring. That arrival is what "playing the changes" means. The full story behind that bar map is in Module 11, Set 3. Playing with someone? One comps while the other solos, then swap.',
                hint_es: 'Tocar de improviso = tocar libremente e inventar tu propia parte. Sigue la forma, no solo la escala — cuando el loop regresa a A, cae en una A y déjala sonar. Esa llegada es lo que significa "tocar los cambios." La historia completa detrás de ese mapa de compases está en el Módulo 11, Unidad 3. ¿Tocando con alguien? Uno acompaña mientras el otro hace el solo, y luego cambian.',
                skills: [7],
                playSeq: { label: 'A blues scale, box 1 (loop-ready)', label_es: 'Escala de blues de A, caja 1 (lista para loop)', bpm: 60, notes: [45, 48, 50, 51, 52, 55, 57] }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Finds any key\'s relative minor · Explains relative vs parallel · Builds and plays the blues scale at 60 BPM',
      goal_es: 'Encuentra la relativa menor de cualquier tonalidad · Explica la relativa frente a la paralela · Construye y toca la escala de blues a 60 BPM',
      performance: 'Fast round: run the relative-pairs deck and answer each relative minor in rhythm — no pauses, then flip to check. Then add the b5 to A minor pentatonic box 1 and play the blues scale ascending and descending at 60 BPM, matching the play button.',
      selfCheck: 'What\'s the relative minor of F ("Luna"\'s key)? Which single note makes a pentatonic a blues scale?',
      selfCheck_es: '¿Cuál es la relativa menor de F (la tonalidad de "Luna")? ¿Cuál nota única convierte una pentatónica en una escala de blues?',
      standards: ['Pr.4a', 'Pr.6a', 'Cn.10a']
    },

    skills: [
      { id: 'm10w2-s1', text: 'Find the relative minor of any major key (6th degree / 3 frets down)',
        text_es: 'Encontrar la relativa menor de cualquier tonalidad mayor (6º grado / 3 trastes abajo)',
        gotItWhen: 'you can name any major key\'s relative minor on the spot by counting 3 frets down from the major root, no pausing to work it out.',
        gotItWhen_es: 'puedes nombrar la relativa menor de cualquier tonalidad mayor al instante contando 3 trastes abajo de la raíz mayor, sin detenerte a calcularlo.',
        practice: { type: 'mc', prompt: 'The relative minor of G major is:',
          prompt_es: 'La relativa menor de G mayor es:',
          choices: ['G minor', 'B minor', 'E minor', 'D minor'],
          choices_es: ['G menor', 'B menor', 'E menor', 'D menor'], answer: 2,
          explain: 'Count 3 frets down from G and you land on E, so Em is G major\'s relative minor — the same notes, a different home. G minor is the parallel minor, a different idea entirely.',
          explain_es: 'Cuenta 3 trastes abajo desde G y caes en E, así que Em es la relativa menor de G mayor — las mismas notas, otro hogar. G menor es la paralela menor, que es una idea completamente distinta.' } },
      { id: 'm10w2-s2', text: 'Explain the difference between relative and parallel minor',
        text_es: 'Explicar la diferencia entre la relativa y la paralela menor',
        gotItWhen: 'you can say out loud that relative minor shares the same NOTES as its major (just a different home), while parallel minor shares only the ROOT — and give a real example of each (C major → Am relative, Cm parallel).',
        gotItWhen_es: 'puedes decir en voz alta que la relativa menor comparte las mismas NOTAS que su mayor (solo un hogar distinto), mientras que la paralela menor comparte solo la RAÍZ — y dar un ejemplo real de cada una (C mayor → Am relativa, Cm paralela).',
        practice: { type: 'mc', prompt: 'C major\'s PARALLEL minor is:',
          prompt_es: 'La PARALELA menor de C mayor es:',
          choices: ['A minor', 'C minor', 'E minor', 'F minor'],
          choices_es: ['A menor', 'C menor', 'E menor', 'F menor'], answer: 1,
          explain: 'Parallel minor keeps the same ROOT and changes the notes: C major becomes C minor. A minor is the tempting one, but it keeps the same notes — that makes it the relative minor.',
          explain_es: 'La paralela menor mantiene la misma RAÍZ y cambia las notas: C mayor se vuelve C menor. A menor es la opción tentadora, pero mantiene las mismas notas — eso la hace la relativa menor.' } },
      { id: 'm10w2-s3', text: 'Name "Watchtower"\'s key (Am) and its relative major (C)',
        text_es: 'Nombrar la tonalidad de "Watchtower" (Am) y su relativa mayor (C)',
        gotItWhen: 'you can name "Watchtower" as A minor and its relative major as C, and explain why: 3 frets up from A lands on C.',
        gotItWhen_es: 'puedes nombrar "Watchtower" como A menor y su relativa mayor como C, y explicar por qué: 3 trastes arriba de A cae en C.',
        practice: { type: 'mc', prompt: '"Watchtower" loops Am–G–F, and Am is the chord that feels like home. Name the key and its relative major.',
          prompt_es: '"Watchtower" repite Am–G–F, y Am es el acorde que se siente como base. Nombra la tonalidad y su relativa mayor.',
          choices: ['A minor — relative major C', 'A major — relative minor F#m', 'C minor — relative major Eb', 'G major — because G is in the loop'],
          choices_es: ['A menor — relativa mayor C', 'A mayor — relativa menor F#m', 'C menor — relativa mayor Eb', 'G mayor — porque G está en la vuelta'], answer: 0,
          explain: 'Home chord Am makes it A minor, and A minor shares all its notes with C major — its relative major, 3 frets up.',
          explain_es: 'El acorde base Am la hace A menor, y A menor comparte todas sus notas con C mayor — su relativa mayor, 3 trastes arriba.' } },
      { id: 'm10w2-s4', text: 'Build the blues scale by adding the b5 to minor pentatonic box 1',
        text_es: 'Construir la escala de blues agregando la b5 a la caja 1 de pentatónica menor',
        gotItWhen: 'you can find and add the b5 inside minor pentatonic box 1 on your own — it sits between two notes you already know, one extra finger placement, not a new shape.',
        gotItWhen_es: 'puedes encontrar y agregar la b5 dentro de la caja 1 de pentatónica menor por tu cuenta — se ubica entre dos notas que ya conoces, una colocación de dedo extra, no una forma nueva.',
        practice: { type: 'mc', prompt: 'In A minor pentatonic at fret 5, the added blues note (b5, an Eb) sits on the A string at fret:',
          prompt_es: 'En la pentatónica menor de A en el traste 5, la nota de blues agregada (b5, una Eb) se ubica en la cuerda La en el traste:',
          choices: ['5', '6', '7', '8'],
          choices_es: ['5', '6', '7', '8'], answer: 1,
          explain: 'On the A string, fret 5 is D and fret 7 is E, so Eb squeezes in between them at fret 6. The blues note is one extra finger inside a shape you already know, not a new box.',
          explain_es: 'En la cuerda La, el traste 5 es D y el traste 7 es E, así que Eb se mete entre ellos en el traste 6. La nota de blues es un dedo extra dentro de una forma que ya conoces, no una caja nueva.' } },
      { id: 'm10w2-s5', text: 'Play the blues scale ascending and descending at 60 BPM',
        text_es: 'Tocar la escala de blues subiendo y bajando a 60 BPM',
        gotItWhen: 'the notes you play ascending and descending match what you hear from the play button, every time, at 60 BPM.',
        gotItWhen_es: 'las notas que tocas subiendo y bajando coinciden con lo que escuchas del botón de reproducir, cada vez, a 60 BPM.',
        practice: { type: 'playSeq', label: 'A blues scale, box 1', label_es: 'Escala de blues de A, caja 1', bpm: 60, notes: [45, 48, 50, 51, 52, 55, 57] } },
      { id: 'm10w2-s6', text: 'Name relative pairs for our core songs\' keys ("Seven Nation Army" Em↔G · "Watchtower" Am↔C · "Sweet Child" D↔Bm · "Luna" F↔Dm · "Let It Be" C↔Am)',
        text_es: 'Nombrar los pares relativos de las tonalidades de nuestras canciones principales ("Seven Nation Army" Em↔G · "Watchtower" Am↔C · "Sweet Child" D↔Bm · "Luna" F↔Dm · "Let It Be" C↔Am)',
        gotItWhen: 'you can rattle off all five core-song relative pairs (Seven Nation Army Em↔G, Watchtower Am↔C, Sweet Child D↔Bm, Luna F↔Dm, Let It Be C↔Am) without looking any of them up.',
        gotItWhen_es: 'puedes recitar los cinco pares relativos de nuestras canciones principales (Seven Nation Army Em↔G, Watchtower Am↔C, Sweet Child D↔Bm, Luna F↔Dm, Let It Be C↔Am) sin consultar ninguno.',
        practice: { type: 'mc', prompt: '"Seven Nation Army" lives in E minor. Which key is its relative major?',
          prompt_es: '"Seven Nation Army" vive en E menor. ¿Cuál tonalidad es su relativa mayor?',
          choices: ['E major', 'G major', 'C major', 'B major'],
          choices_es: ['E mayor', 'G mayor', 'C mayor', 'B mayor'], answer: 1,
          explain: 'Relative major = 3 frets up from the minor root: E → G. E major is the PARALLEL major — same root, different notes.',
          explain_es: 'La relativa mayor = 3 trastes arriba de la raíz menor: E → G. E mayor es la mayor PARALELA — misma raíz, notas distintas.' } },
      { id: 'm10w2-s7', text: 'Solo with the blues scale over a 12-bar blues loop, following the form',
        text_es: 'Improvisar un solo con la escala de blues sobre un loop de blues de 12 compases, siguiendo la forma',
        gotItWhen: 'you can hear the chord changes coming and land on a strong note when the loop returns to the I chord.',
        gotItWhen_es: 'puedes escuchar los cambios de acorde venir y caer en una nota fuerte cuando el loop regresa al acorde I.',
        practice: { type: 'playSeq', label: 'A blues scale, box 1 (loop-ready)', label_es: 'Escala de blues de A, caja 1 (lista para loop)', bpm: 60,
          notes: [45, 48, 50, 51, 52, 55, 57] } }
    ]
  },

  {
    id: 'm10w3',
    label: 'Set 3',
    locked: false,
    module: 'Scales, Keys & Ear Training',
    moduleNum: 10,
    unit: 'Module 10 · Scales, Keys & Ear Training',
    unit_es: 'Módulo 10 · Escalas, tonalidades y entrenamiento auditivo',
    title: 'Set 3',
    subtitle: 'Move any pattern to any key · Sing it, then play it · Major vs minor by ear',
    subtitle_es: 'Mueve cualquier patrón a cualquier tonalidad · Cántalo, y luego tócalo · Mayor vs. menor de oído',
    skillFocus: 'Transposing = moving the root · Sing-then-play · Hearing major (bright) vs minor (dark)',
    skillFocus_es: 'Transponer = mover la raíz · Canta y luego toca · Escuchar mayor (brillante) vs. menor (oscuro)',
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
                label: 'Watch: the movable pentatonic box', label_es: 'Mira: la caja pentatónica móvil',
                text: 'Watch: <a href="https://www.youtube.com/watch?v=1mT5nUE0o7M" target="_blank">HOW TO USE The Minor Pentatonic Scale on the Guitar – Lauren Bateman (0:00–5:00)</a>, watching the shape as a MOVABLE pattern rather than a fixed one.',
                text_es: 'Mira: <a href="https://www.youtube.com/watch?v=1mT5nUE0o7M" target="_blank">HOW TO USE The Minor Pentatonic Scale on the Guitar – Lauren Bateman (0:00–5:00)</a>, observando la forma como un patrón MÓVIL en lugar de uno fijo.',
                hint: 'Nothing about the shape changes when you slide it — only the fret you start on, which renames the key.',
                hint_es: 'Nada de la forma cambia cuando la deslizas — solo el traste en el que empiezas, que renombra la tonalidad.',
                skills: [1],
                response: { type: 'mc', prompt: 'Minor pentatonic box 1 with its root at fret 5 is A minor. Slide it to fret 7 and it becomes:',
                  prompt_es: 'La caja 1 de pentatónica menor con su raíz en el traste 5 es A menor. Deslízala al traste 7 y se convierte en:',
                  answer: 0,
                  explain: 'The root fret names the key: fret 7 on the low E is B.',
                  explain_es: 'El traste de la raíz nombra la tonalidad: el traste 7 en la Mi grave es B.',
                  choices: ['B minor', 'C minor', 'G minor', 'A major'],
                  choices_es: ['B menor', 'C menor', 'G menor', 'A mayor'] }
              },
              {
                label: 'Watch: find melodies by ear', label_es: 'Mira: encuentra melodías de oído',
                text: 'Watch: <a href="https://youtu.be/bd8M2fhK6Z8" target="_blank">5\' Guitar Exercise: Find Melodies You Know – JustinGuitar</a>. This is the exact sing-it-then-find-it habit today\'s Station C drill is built around.',
                text_es: 'Mira: <a href="https://youtu.be/bd8M2fhK6Z8" target="_blank">5\' Guitar Exercise: Find Melodies You Know – JustinGuitar</a>. Este es exactamente el hábito de cantarlo-y-luego-encontrarlo alrededor del cual está construido el ejercicio de la Estación C de hoy.',
                hint: 'This is the single most useful guitar habit you can build: sing what you hear first, then let your hands catch up.',
                hint_es: 'Este es el hábito más útil que puedes construir en la guitarra: canta primero lo que escuchas, y luego deja que tus manos te alcancen.',
                skills: [3],
                response: { type: 'mc', prompt: 'The best FIRST step to playing a melody by ear is:',
                  prompt_es: 'El mejor PRIMER paso para tocar una melodía de oído es:',
                  answer: 1,
                  explain: 'If you can sing it, you know it — your hands just have to find what your voice already solved.',
                  explain_es: 'Si puedes cantarla, la conoces — tus manos solo tienen que encontrar lo que tu voz ya resolvió.',
                  choices: ['Guess randomly', 'Sing it, then hunt for your sung notes on one string', 'Look up the TAB', 'Play every fret until something works'],
                  choices_es: ['Adivinar al azar', 'Cantarla, y luego buscar las notas cantadas en una sola cuerda', 'Buscar el TAB', 'Tocar cada traste hasta que algo funcione'] }
              },
              {
                label: 'Optional watch: building your ear', label_es: 'Opcional: desarrolla tu oído',
                text: 'Optional bonus watch: <a href="https://youtu.be/rPSRH3tf5B8" target="_blank">How To Develop The World\'s Greatest Ear – Rick Beato</a> — a producer\'s view of the exact skill this set trains. You don\'t need the advanced parts: the opening idea (ears are built by a little practice every day, not talent) is the main point — then go do the Station C echo drills.',
                text_es: 'Video extra opcional: <a href="https://youtu.be/rPSRH3tf5B8" target="_blank">How To Develop The World\'s Greatest Ear – Rick Beato</a> — la visión de un productor sobre exactamente la destreza que entrena esta unidad. No necesitas las partes avanzadas: la idea inicial (el oído se construye con un poco de práctica cada día, no con talento) es el punto principal — y luego ve a hacer los ejercicios de eco de la Estación C.',
                response: { type: 'short', placeholder: 'One idea from this video worth borrowing for your own practice: …',
                  placeholder_es: 'Una idea de este video que vale la pena tomar prestada para tu propia práctica: …' }
              }
            ]
          },
          {
            title: 'Listen for bright vs dark',
            title_es: 'Escucha brillante vs. oscuro',
            steps: [
              {
                label: 'Ear training: bright vs. dark', label_es: 'Oído: brillante vs. oscuro',
                text: 'Listen for it: play a major chord, then its parallel minor, back and forth. Notice which one sounds "bright" and which sounds "dark" — this is the ear-training foundation for everything else today.',
                text_es: 'Escucha esto: toca un acorde mayor, luego su paralela menor, alternando. Fíjate cuál suena "brillante" y cuál suena "oscuro" — esta es la base de entrenamiento auditivo para todo lo demás de hoy.',
                hint: 'You\'ve been hearing this distinction since Module 4 — today you\'re naming it and using it deliberately.',
                hint_es: 'Has estado escuchando esta distinción desde el Módulo 4 — hoy la estás nombrando y usando a propósito.',
                skills: [4],
                response: { type: 'mc', prompt: 'To most ears, major sounds ___ and minor sounds ___:',
                  prompt_es: 'Para la mayoría de los oídos, el mayor suena ___ y el menor suena ___:',
                  answer: 1,
                  explain: 'Bright-happy vs dark-moody is the first ear-training distinction — you\'ve been hearing it since Module 4.',
                  explain_es: 'Brillante-alegre vs. oscuro-melancólico es la primera distinción del entrenamiento auditivo — la has estado escuchando desde el Módulo 4.',
                  choices: ['dark, then bright', 'bright, then dark', 'loud, then quiet', 'fast, then slow'],
                  choices_es: ['oscuro, y luego brillante', 'brillante, y luego oscuro', 'fuerte, y luego suave', 'rápido, y luego lento'] }
              }
            ]
          },
          {
            title: 'Try transposing a pattern',
            title_es: 'Prueba a transponer un patrón',
            steps: [
              {
                label: 'Move box 1 up two frets', label_es: 'Mueve la caja 1 dos trastes',
                text: 'Now try it: take minor pentatonic box 1 and move it up two frets from wherever you\'re starting. Say out loud what key it\'s in now before you check.',
                text_es: 'Ahora pruébalo: toma la caja 1 de pentatónica menor y muévela dos trastes hacia arriba desde donde estés empezando. Di en voz alta en qué tonalidad está ahora antes de comprobarlo.',
                hint: 'The pattern itself never changes shape — only the fret you start it on, which is what "transposing" means.',
                hint_es: 'El patrón en sí nunca cambia de forma — solo el traste en el que lo empiezas, que es lo que significa "transponer."',
                skills: [2],
                response: { type: 'mc', prompt: 'Transposing a riff means:',
                  prompt_es: 'Transponer un riff significa:',
                  answer: 1,
                  explain: 'The pattern is a movable shape — slide the whole thing so its ROOT lands on the new key\'s note.',
                  explain_es: 'El patrón es una forma móvil — desliza todo el conjunto para que su RAÍZ caiga en la nota de la nueva tonalidad.',
                  choices: ['Playing it faster', 'Moving it to a different key, keeping its shape', 'Playing it backwards', 'Adding more notes'],
                  choices_es: ['Tocarlo más rápido', 'Moverlo a una tonalidad distinta, manteniendo su forma', 'Tocarlo al revés', 'Agregar más notas'] }
              },
              {
                label: 'Predict the new fret', label_es: 'Predice el nuevo traste',
                text: 'Try moving a pattern UP two half steps and predict the new fret before you slide there.',
                text_es: 'Prueba a mover un patrón dos semitonos HACIA ARRIBA y predice el nuevo traste antes de deslizarte hasta ahí.',
                hint: 'Half steps are just frets — count two frets toward the body from wherever you started.',
                hint_es: 'Los semitonos son solo trastes — cuenta dos trastes hacia el cuerpo desde donde empezaste.',
                skills: [2],
                response: { type: 'mc', prompt: 'To move a pattern UP two half steps, you move it:',
                  prompt_es: 'Para mover un patrón dos semitonos HACIA ARRIBA, lo mueves:',
                  answer: 1,
                  explain: 'Half steps are frets — two half steps = two frets up the neck.',
                  explain_es: 'Los semitonos son trastes — dos semitonos = dos trastes hacia arriba del mástil.',
                  choices: ['2 strings up', '2 frets toward the body', '2 frets toward the headstock', 'You can\'t'],
                  choices_es: ['2 cuerdas hacia arriba', '2 trastes hacia el cuerpo', '2 trastes hacia el clavijero', 'No puedes'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: which was harder?', label_es: 'Cierre: ¿qué fue más difícil?',
                text: 'Station Wrap-Up — which was harder today, moving the pattern to a new key, or echoing by ear? Why?',
                text_es: 'Cierre de la estación — ¿qué fue más difícil hoy, mover el patrón a una nueva tonalidad, o repetir de oído? ¿Por qué?',
                response: { type: 'short', placeholder: 'e.g. echoing — I could sing it but took a while to find the starting fret',
                  placeholder_es: 'p. ej. repetir de oído — podía cantarlo pero me tomó tiempo encontrar el traste inicial' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — transposing and ear training',
        title_es: 'Estación de práctica — transponer y entrenamiento auditivo',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tuning check', label_es: 'Calentamiento: afinación',
                text: 'Start every practice session the same way:<ol><li>Tune all 6 strings to green (E A D G B e).</li><li>Play each string open.</li></ol>You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera:<ol><li>Afina las 6 cuerdas hasta que estén en verde (E A D G B e).</li><li>Toca cada cuerda al aire.</li></ol>Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Transpose box 1 to a named key',
            title_es: 'Transpon la caja 1 a una tonalidad nombrada',
            steps: [
              {
                label: 'Challenge 1 — Transpose Drill', label_es: 'Reto 1 — Ejercicio de Transposición',
                text: '<ol><li>Run the key deck below and play minor pentatonic box 1 at that key\'s fret: fret 5 (Am), fret 3 (Gm), fret 7 (Bm), fret 10 (Dm — "Luna"\'s solo box!).</li></ol>You\'ve got it when: you can find any of these four positions within 5 seconds of the card turning up.',
                text_es: '<ol><li>Corre la baraja de tonalidades de abajo y toca la caja 1 de pentatónica menor en el traste de esa tonalidad: traste 5 (Am), traste 3 (Gm), traste 7 (Bm), traste 10 (Dm — ¡la caja del solo de "Luna"!).</li></ol>Lo tienes cuando: puedes encontrar cualquiera de estas cuatro posiciones dentro de los 5 segundos de que aparezca la carta.',
                drill: { type: 'deck', deck: 'minor-keys-box1' },
                hint: 'Fret 10 should feel familiar — it\'s the exact box you\'ve been using for "Luna"\'s solo since Module 4, now with a name attached.',
                hint_es: 'El traste 10 debería sentirse familiar — es exactamente la caja que has estado usando para el solo de "Luna" desde el Módulo 4, ahora con un nombre asignado.',
                stuck: 'Drill just Am (fret 5) and Dm (fret 10) — the two you already know from real songs — before adding Gm and Bm.',
                stuck_es: 'Practica solo Am (traste 5) y Dm (traste 10) — los dos que ya conoces de canciones reales — antes de agregar Gm y Bm.',
                levelUp: 'Move through all four positions without stopping, or name the fret before the card finishes turning.',
                levelUp_es: 'Recorre las cuatro posiciones sin detenerte, o nombra el traste antes de que la carta termine de girar.',
                skills: [1, 2]
              }
            ]
          },
          {
            title: 'Sing it, then play it',
            title_es: 'Cántalo, y luego tócalo',
            steps: [
              {
                label: 'Challenge 2 — Sing-Then-Play', label_es: 'Reto 2 — Canta y Luego Toca',
                text: '<ol><li>Record yourself playing 3 random notes on the low E string (frets 0–5) without watching your hand — or use the Echo Drill play button below as your note source.</li><li>Wait a moment, play the recording back, and sing the notes.</li><li>Find and play them.</li></ol>',
                text_es: '<ol><li>Grábate tocando 3 notas al azar en la cuerda Mi grave (trastes 0–5) sin mirar tu mano — o usa el botón de reproducir del Ejercicio de Eco de abajo como tu fuente de notas.</li><li>Espera un momento, reproduce la grabación, y canta las notas.</li><li>Encuéntralas y tócalas.</li></ol>',
                hint: 'Sing FIRST, before you touch the guitar — that order is the whole skill.',
                hint_es: 'Canta PRIMERO, antes de tocar la guitarra — ese orden es toda la destreza.',
                stuck: 'Start with just one note instead of three, and build up once that\'s reliable.',
                stuck_es: 'Empieza con solo una nota en lugar de tres, y aumenta una vez que eso sea confiable.',
                levelUp: 'Extend to 5 notes, or record notes spread across two strings.',
                levelUp_es: 'Extiéndelo a 5 notas, o graba notas repartidas en dos cuerdas.',
                skills: [3]
              }
            ]
          },
          {
            title: 'Echo a pattern by ear',
            title_es: 'Repite un patrón de oído',
            steps: [
              {
                label: 'Challenge 3 — Echo Drill (your assessment piece)', label_es: 'Reto 3 — Ejercicio de Eco (tu pieza de evaluación)',
                text: '<ol><li>For round 1, listen to the 3-note pattern once using the play button below, sing it back, then play it on the E or A string.</li><li>For rounds 2–4, record yourself playing 3 random notes (eyes off your hand) and echo those back the same way.</li></ol>You\'ve got it when: 3 out of 4 patterns matched correctly, by ear alone.',
                text_es: '<ol><li>Para la ronda 1, escucha el patrón de 3 notas una vez usando el botón de reproducir de abajo, cántalo de vuelta, y luego tócalo en la cuerda Mi o La.</li><li>Para las rondas 2–4, grábate tocando 3 notas al azar (sin mirar tu mano) y repítelas de la misma manera.</li></ol>Lo tienes cuando: 3 de 4 patrones coincidan correctamente, solo de oído.',
                hint: 'Resist the urge to search fret by fret at random before you\'ve sung the pattern — singing first fixes the pitch in your ear, and that\'s what your hands need to find.',
                hint_es: 'Resiste el impulso de buscar traste por traste al azar antes de haber cantado el patrón — cantar primero fija el tono en tu oído, y eso es lo que tus manos necesitan encontrar.',
                stuck: 'Slow the pattern down and repeat just the first two notes until they\'re solid, then add the third.',
                stuck_es: 'Baja la velocidad del patrón y repite solo las primeras dos notas hasta que estén sólidas, y luego agrega la tercera.',
                levelUp: 'Extend the echo to 4 or 5 notes, or echo a short lick (a lick is a short solo phrase) from a tutorial video you haven\'t learned yet — a pattern you\'ve truly never heard.',
                levelUp_es: 'Extiende el eco a 4 o 5 notas, o repite un lick corto (un lick es una frase corta de solo) de un video tutorial que no hayas aprendido todavía — un patrón que de verdad nunca hayas escuchado.',
                skills: [3, 5],
                playSeq: { label: 'Echo pattern — E · G · A', label_es: 'Patrón de eco — E · G · A', bpm: 60, notes: [40, 43, 45] }
              }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "the cure", by ear', label_es: 'Reto — "the cure", de oído',
                text: '<ol><li>Strum through the progression.</li><li>Without looking anything up, decide by ear which chords feel bright and which feel dark.</li></ol>',
                text_es: '<ol><li>Rasguea la progresión.</li><li>Sin buscar nada, decide de oído cuáles acordes se sienten brillantes y cuáles se sienten oscuros.</li></ol>',
                hint: 'You already know the chord names from Module 9 — today\'s challenge is trusting your ear to sort them into bright vs dark before you check.',
                hint_es: 'Ya conoces los nombres de los acordes desde el Módulo 9 — el reto de hoy es confiar en tu oído para clasificarlos en brillante vs. oscuro antes de comprobarlo.',
                stuck: 'Isolate just two chords at a time and compare them directly, back and forth.',
                stuck_es: 'Aísla solo dos acordes a la vez y compáralos directamente, alternando.',
                levelUp: 'Guess which chord is the "home" chord using only your ear, then confirm it.',
                levelUp_es: 'Adivina cuál acorde es el acorde "base" usando solo tu oído, y luego confírmalo.',
                skills: [4, 6]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: box 1 and finding notes', label_es: 'Cierre: caja 1 y notas de oído',
                text: 'Where does box 1 sit for D minor? Can you sing a phrase from a core song and find its first note? Write both below.',
                text_es: '¿Dónde se ubica la caja 1 para D menor? ¿Puedes cantar una frase de una canción principal y encontrar su primera nota? Escribe ambas abajo.',
                response: { type: 'short', placeholder: 'e.g. D minor box 1 is fret 10; I found "the cure"\'s first note on the A string',
                  placeholder_es: 'p. ej. la caja 1 de D menor está en el traste 10; encontré la primera nota de "the cure" en la cuerda La' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Transposes box 1 to a named key · Sings then plays a 3-note pattern · Tells major from minor by ear',
      goal_es: 'Transpone la caja 1 a una tonalidad nombrada · Canta y luego toca un patrón de 3 notas · Distingue mayor de menor de oído',
      performance: 'Run the minor-keys-box1 deck, slide box 1 to the key drawn, and play it. Then four echo rounds by ear — the play button for round 1, your own self-recorded random patterns for rounds 2–4 — singing each pattern back before you play it. Goal: 3 out of 4 matched correctly.',
      selfCheck: 'Where does box 1 sit for D minor? Can you sing a phrase from a core song and find its first note?',
      selfCheck_es: '¿Dónde se ubica la caja 1 para D menor? ¿Puedes cantar una frase de una canción principal y encontrar su primera nota?',
      standards: ['Pr.4a', 'Pr.6a', 'Re.7b']
    },

    skills: [
      { id: 'm10w3-s1', text: 'Transpose minor pentatonic box 1 to any named key',
        text_es: 'Transponer la caja 1 de pentatónica menor a cualquier tonalidad nombrada',
        gotItWhen: 'you can find box 1\'s fret for any of the four named keys (Am fret 5, Gm fret 3, Bm fret 7, Dm fret 10) within 5 seconds of being asked.',
        gotItWhen_es: 'puedes encontrar el traste de la caja 1 para cualquiera de las cuatro tonalidades (Am traste 5, Gm traste 3, Bm traste 7, Dm traste 10) dentro de los 5 segundos de que te lo pidan.',
        practice: { type: 'mc', prompt: 'For D minor, box 1\'s root sits at low-E fret:',
          prompt_es: 'Para D menor, la raíz de la caja 1 se ubica en el traste de la Mi grave:',
          choices: ['5', '7', '10', '12'],
          choices_es: ['5', '7', '10', '12'], answer: 2,
          explain: 'Box 1 is named by the note under your first finger on the low E string, and D sits at fret 10 there. Fret 5 is the tempting answer because that\'s A minor — the fret you first learned the shape at.',
          explain_es: 'La caja 1 se nombra por la nota bajo tu primer dedo en la cuerda Mi grave, y ahí D está en el traste 10. El traste 5 es la respuesta tentadora porque ese es A menor — el traste donde aprendiste la forma por primera vez.' } },
      { id: 'm10w3-s2', text: 'Move a riff up or down the neck to a new key and play it',
        text_es: 'Mover un riff hacia arriba o abajo del mástil a una nueva tonalidad y tocarlo',
        gotItWhen: 'you can slide a riff\'s whole shape up or down the neck to a new key and play it, keeping every internal fret distance exactly the same.',
        gotItWhen_es: 'puedes deslizar toda la forma de un riff hacia arriba o abajo del mástil a una nueva tonalidad y tocarlo, manteniendo cada distancia interna de trastes exactamente igual.',
        practice: { type: 'mc', prompt: 'A riff starts on G (low E string, fret 3). To play the same riff in A, what do you do?',
          prompt_es: 'Un riff empieza en G (cuerda Mi grave, traste 3). Para tocar el mismo riff en A, ¿qué haces?',
          choices: ['Slide the whole shape up 2 frets and keep every distance the same', 'Play the same frets but on the A string', 'Move only the first note up 2 frets', 'Relearn the riff from a new TAB'],
          choices_es: ['Deslizar toda la forma 2 trastes hacia arriba y mantener todas las distancias iguales', 'Tocar los mismos trastes pero en la cuerda La', 'Mover solo la primera nota 2 trastes arriba', 'Volver a aprender el riff de un TAB nuevo'], answer: 0,
          explain: 'Transposing on one string is pure sliding — move the whole shape by the distance between old and new root (G→A = 2 frets). The internal distances never change.',
          explain_es: 'Transportar en una cuerda es puro deslizamiento — mueve toda la forma la distancia entre la raíz vieja y la nueva (G→A = 2 trastes). Las distancias internas nunca cambian.' } },
      { id: 'm10w3-s3', text: 'Sing a short pattern, then find and play it on one string',
        text_es: 'Cantar un patrón corto, y luego encontrarlo y tocarlo en una sola cuerda',
        gotItWhen: 'you sing a pattern first, then find its matching frets on one string by ear — the fretted note and your voice lock into one sound, no wobble.',
        gotItWhen_es: 'cantas un patrón primero, y luego encuentras sus trastes correspondientes en una sola cuerda de oído — la nota trasteada y tu voz se funden en un solo sonido, sin oscilación.',
        practice: { type: 'mc', prompt: 'You sang a note and you\'re hunting for it on the B string. How do you know you\'ve found the right fret?',
          prompt_es: 'Cantaste una nota y la estás buscando en la cuerda Si. ¿Cómo sabes que encontraste el traste correcto?',
          choices: ['The fretted note and your voice blend into one sound — no wobble between them', 'The tuner shows the string is in tune', 'It\'s the fret that sounds loudest', 'Any nearby fret counts if you sing along'],
          choices_es: ['La nota trasteada y tu voz se funden en un solo sonido — sin oscilación entre ellas', 'El afinador muestra que la cuerda está afinada', 'Es el traste que suena más fuerte', 'Cualquier traste cercano cuenta si cantas junto'], answer: 0,
          explain: 'Matching pitch feels like the two sounds lock together; a close-but-wrong fret makes an audible beating wobble. The tuner checks the string, not your melody.',
          explain_es: 'Igualar el tono se siente como si los dos sonidos se acoplaran; un traste cercano pero equivocado produce una oscilación audible. El afinador revisa la cuerda, no tu melodía.' } },
      { id: 'm10w3-s4', text: 'Tell major from minor by ear',
        text_es: 'Distinguir mayor de menor de oído',
        gotItWhen: 'you can hear a chord or progression and call it "major" or "minor" before you check — bright means major, dark and moody means minor.',
        gotItWhen_es: 'puedes escuchar un acorde o una progresión y decir "mayor" o "menor" antes de comprobarlo — brillante significa mayor, oscuro y melancólico significa menor.',
        practice: { type: 'mc', prompt: 'A progression feels moody and dark. Its home chord is most likely:',
          prompt_es: 'Una progresión se siente melancólica y oscura. Su acorde base es más probablemente:',
          choices: ['Major', 'Minor', 'A power chord', 'A slash chord'],
          choices_es: ['Mayor', 'Menor', 'Un acorde de potencia', 'Un acorde con barra diagonal (con un bajo distinto)'], answer: 1,
          explain: 'Dark and moody is the sound of minor; bright and happy is major. Power chords and slash chords aren\'t answers here — neither one is major or minor on its own.',
          explain_es: 'Oscuro y melancólico es el sonido de lo menor; brillante y alegre es lo mayor. Los acordes de potencia y los acordes con barra diagonal no son respuestas aquí — ninguno de los dos es mayor ni menor por sí solo.' } },
      { id: 'm10w3-s5', text: 'Echo back a 3-note pattern by ear on the E or A string',
        text_es: 'Repetir de oído un patrón de 3 notas en la cuerda Mi o La',
        gotItWhen: 'you match 3 out of 4 echoed patterns correctly, by ear alone — singing each pattern back before you ever touch the fretboard.',
        gotItWhen_es: 'igualas correctamente 3 de 4 patrones repetidos, solo de oído — cantando cada patrón de vuelta antes de tocar siquiera el diapasón.',
        practice: { type: 'playSeq', label: 'Echo pattern — E · G · A', label_es: 'Patrón de eco — E · G · A', bpm: 60, notes: [40, 43, 45] } },
      { id: 'm10w3-s6', text: 'Identify whether a core-song chord sounds major or minor ("Luna"\'s F = bright, Am = dark)',
        text_es: 'Identificar si un acorde de una canción principal suena mayor o menor (la F de "Luna" = brillante, Am = oscuro)',
        gotItWhen: 'you can hear "Luna"\'s F (bright) and Am (dark) and explain the difference comes down to one note — the 3rd, lowered a half step in minor.',
        gotItWhen_es: 'puedes escuchar la F de "Luna" (brillante) y su Am (oscuro) y explicar que la diferencia se reduce a una sola nota — la 3ª, bajada medio tono en menor.',
        practice: { type: 'mc', prompt: '"Luna"\'s F sounds bright and its Am sounds dark. What single ingredient makes a chord minor?',
          prompt_es: 'La F de "Luna" suena brillante y su Am suena oscuro. ¿Cuál único ingrediente hace que un acorde sea menor?',
          choices: ['Its 3rd is lowered a half step', 'It\'s strummed more quietly', 'It uses fewer strings', 'It\'s played higher up the neck'],
          choices_es: ['Su 3ª está bajada medio tono', 'Se rasguea más suave', 'Usa menos cuerdas', 'Se toca más arriba en el mástil'], answer: 0,
          explain: 'Major and minor differ by one note: the 3rd, a half step lower in minor. Volume, string count, and position change the sound but never the major/minor color.',
          explain_es: 'Mayor y menor difieren en una sola nota: la 3ª, medio tono más baja en menor. El volumen, el número de cuerdas y la posición cambian el sonido, pero nunca el color mayor/menor.' } }
    ]
  }

); // end module-10.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[10] = [
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Name its key and scale (E minor)', meta_es: 'Nombra su tonalidad y escala (E menor)', type: 'Core', core: true, journeyUrl: 'tabs/seven-nation-army.html',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Am — find the relative major', meta_es: 'Am — encuentra la relativa mayor', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: 'F major — why the solo uses D minor pentatonic', meta_es: 'F mayor — por qué el solo usa la pentatónica menor de D', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
      { name: '"the cure" — Olivia Rodrigo', meta: 'Transpose the progression\'s shapes to a new key', meta_es: 'Transpon las formas de la progresión a una nueva tonalidad', type: 'Core', core: true, journeyUrl: 'tabs/the-cure.html',
        originalUrl: 'https://www.youtube.com/watch?v=B402rKl4bUg',
        tutorialUrl: 'https://www.youtube.com/watch?v=adW_zSkClaY' },
      { name: '"Smoke on the Water" — Deep Purple', meta: 'Blues scale where it\'s normally used', meta_es: 'La escala de blues donde normalmente se usa', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=Q2FzZSBD5LE',
        tutorialUrl: 'https://www.youtube.com/watch?v=QkT5yLP5VQA' },
      { name: '"Beat It" — Michael Jackson', meta: 'The Em pentatonic solo — name the key by ear', meta_es: 'El solo de pentatónica de Em — nombra la tonalidad de oído', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=oRdxUFDoQe0',
        tutorialUrl: 'https://www.youtube.com/watch?v=B5M5tVc7XZA' },
      { name: '"Ella Baila Sola" — Eslabon Armado × Peso Pluma', meta: 'Hear major vs minor in the progression', meta_es: 'Escucha mayor vs. menor en la progresión', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=lZiaYpD9ZrI',
        tutorialUrl: 'https://www.youtube.com/watch?v=fciArjRISjc' },
      { name: '"House of the Rising Sun" — The Animals', meta: 'A minor — the classic minor-key sound', meta_es: 'A menor — el sonido clásico de tonalidad menor', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=N4bFqW_eu2I',
        tutorialUrl: 'https://www.youtube.com/watch?v=q9dyAQLYybU' }
    ];

MODULE_REVIEWS[10] = {
  moduleNum: 10,
  module: 'Scales, Keys & Ear Training',
  module_es: 'Escalas, Tonalidades y Entrenamiento Auditivo',
  skills: [
    { id: 'mr10-s1', text: 'I can say the major-scale recipe (W-W-H-W-W-W-H) from memory', text_es: 'Puedo decir la receta de la escala mayor (T-T-S-T-T-T-S) de memoria', set: 'm10w1' },
    { id: 'mr10-s2', text: 'I can spell C major and G major note-by-note out loud', text_es: 'Puedo deletrear C mayor y G mayor nota por nota en voz alta', set: 'm10w1' },
    { id: 'mr10-s3', text: 'I can find the relative minor of any major key', text_es: 'Puedo encontrar la relativa menor de cualquier tonalidad mayor', set: 'm10w2' },
    { id: 'mr10-s4', text: 'I can build and play the blues scale from minor pentatonic box 1', text_es: 'Puedo construir y tocar la escala de blues a partir de la caja 1 de pentatónica menor', set: 'm10w2' },
    { id: 'mr10-s5', text: 'I can transpose minor pentatonic box 1 to any named key', text_es: 'Puedo transponer la caja 1 de pentatónica menor a cualquier tonalidad nombrada', set: 'm10w3' },
    { id: 'mr10-s6', text: 'I can tell major from minor by ear', text_es: 'Puedo distinguir mayor de menor de oído', set: 'm10w3' }
  ],
  assessItems: [
    'Transpose a pentatonic pattern to a randomly drawn key and play it',
    'Name the relative minor of a given major key',
    'Identify major vs minor — and echo a short pattern — by ear'
  ],
  assessItems_es: [
    'Transponer un patrón pentatónico a una tonalidad sacada al azar y tocarlo',
    'Nombrar la relativa menor de una tonalidad mayor dada',
    'Identificar mayor vs. menor — y repetir un patrón corto — de oído'
  ],
  forward: 'You can build scales, name keys, and trust your ear. <strong>Module 11 does the same for chords:</strong> you\'ll see why "Let It Be"\'s four chords work, number any progression like a pro, and unlock twelve chords from one barre shape.',
  forward_es: 'Puedes construir escalas, nombrar tonalidades, y confiar en tu oído. <strong>El Módulo 11 hace lo mismo con los acordes:</strong> verás por qué funcionan los cuatro acordes de "Let It Be", numerarás cualquier progresión como un profesional, y desbloquearás doce acordes a partir de una sola forma de cejilla.',
  standards: ['Pr.4a', 'Pr.6a', 'Cn.10a']
};
