// ============================================================
//  MODULE 8 — Finger Picking
//  Edit this file to change Module 8 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm8w1',
    label: 'Set 1',
    locked: false,
    module: 'Finger Picking',
    moduleNum: 8,
    unit: 'Module 8 · Finger Picking',
    unit_es: 'Módulo 8 · Fingerpicking',
    title: 'Set 1',
    subtitle: 'Hand position · p-i-m-a · Thumb on bass · Fingers on treble',
    subtitle_es: 'Posición de la mano · p-i-m-a · Pulgar en el bajo · Dedos en las agudas',
    skillFocus: 'A relaxed fingerpicking hand position · Thumb on the bass strings, fingers on the treble · Rest stroke vs. free stroke',
    skillFocus_es: 'Una posición relajada de la mano de fingerpicking · Pulgar en las cuerdas graves, dedos en las agudas · Apoyando (toque de apoyo) vs. tirando (toque libre)',
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
            label: 'Watch: fingerpicking basics', label_es: 'Mira: fundamentos de fingerpicking',
            text: 'Watch: <a href="https://youtu.be/YZkkUjDDamA" target="_blank">Beginner Fingerpicking Made Easy: Pinch, Pluck, & Play! – Marty Music</a> (0:00–5:00). As you watch, copy his RIGHT-HAND shape on your own guitar — thumb resting on the low E, fingers curved over the treble strings.',
            text_es: 'Mira: <a href="https://youtu.be/YZkkUjDDamA" target="_blank">Beginner Fingerpicking Made Easy: Pinch, Pluck, & Play! – Marty Music</a> (0:00–5:00). Mientras miras, copia su forma de la MANO DERECHA en tu propia guitarra — pulgar apoyado en la Mi grave, dedos curvados sobre las cuerdas agudas.',
            hint: 'Watch the right hand: wrist arched, fingers curved like he\'s holding a small ball. The thumb sits FORWARD of the fingers, not tucked under them.',
            hint_es: 'Observa la mano derecha: muñeca arqueada, dedos curvados como si sostuviera una pelotita. El pulgar se ubica ADELANTE de los dedos, no metido debajo de ellos.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'In classical fingerpicking notation, which finger is "p"?',
              prompt_es: 'En la notación clásica de fingerpicking, ¿cuál dedo es "p"?',
              answer: 2,
              explain: '"p" is the thumb (from Spanish "pulgar"). The rest: i = index, m = middle, a = ring.',
              explain_es: '"p" es el pulgar. El resto: i = índice, m = medio, a = anular.',
              choices: [
              'Index finger',
              'Middle finger',
              'Thumb',
              'Ring finger'
            ],
              choices_es: [
              'Dedo índice',
              'Dedo medio',
              'Pulgar',
              'Dedo anular'
            ] }
          },
          {
            label: 'Watch: p-i-m-a finger assignments', label_es: 'Mira: asignación de dedos p-i-m-a',
            text: 'Watch: <a href="https://youtu.be/K2Z3RZc5t-A" target="_blank">Basic Fingerstyle – Travis Finger Picking (FO-108) – JustinGuitar</a> (0:00–4:00). Pause when he assigns the fingers and place yours the same way: p on the bass, i-m-a on G-B-e.',
            text_es: 'Mira: <a href="https://youtu.be/K2Z3RZc5t-A" target="_blank">Basic Fingerstyle – Travis Finger Picking (FO-108) – JustinGuitar</a> (0:00–4:00). Pausa cuando asigna los dedos y coloca los tuyos de la misma manera: p en el bajo, i-m-a en Sol, Si y mi aguda.',
            hint: 'Justin\'s assignment: thumb handles strings 6, 5, 4 (the bass) and i-m-a handle strings 3, 2, 1 (treble). One finger per string is the goal.',
            hint_es: 'La asignación de Justin: el pulgar se encarga de las cuerdas 6, 5, 4 (el bajo) y i-m-a se encargan de las cuerdas 3, 2, 1 (las agudas). Un dedo por cuerda es la meta.',
            skills: [2, 3],
            response: { type: 'mc', prompt: 'Which finger normally plucks the B string (string 2)?',
              prompt_es: '¿Cuál dedo pulsa normalmente la cuerda Si (cuerda 2)?',
              answer: 2,
              explain: 'Each finger gets a "home" string: i on G (3), m on B (2), a on high e (1). So the B string is m (middle).',
              explain_es: 'Cada dedo tiene una cuerda "de base": i en Sol (3), m en Si (2), a en mi aguda (1). Así que la cuerda Si es m (medio).',
              choices: [
              'p (thumb)',
              'i (index)',
              'm (middle)',
              'a (ring)'
            ],
              choices_es: [
              'p (pulgar)',
              'i (índice)',
              'm (medio)',
              'a (anular)'
            ] }
          }
            ]
          },
          {
            title: 'Listen for the thumb and fingers',
            title_es: 'Escucha el pulgar y los dedos',
            steps: [
          {
            label: 'Listen: "Dust in the Wind"', label_es: 'Escucha: "Dust in the Wind"',
            text: 'Listen to "Dust in the Wind" by Kansas. Pay attention to the picking pattern — you can clearly hear the alternating bass (thumb) underneath the melody (fingers).',
            text_es: 'Escucha "Dust in the Wind" de Kansas. Pon atención al patrón de punteo — puedes escuchar claramente el bajo alternante (pulgar) debajo de la melodía (dedos).',
            hint: 'This song is the classic example of fingerpicking. The bass moves on every beat, the fingers play between the beats.',
            hint_es: 'Esta canción es el ejemplo clásico de fingerpicking. El bajo se mueve en cada tiempo, los dedos tocan entre los tiempos.',
            skills: [4, 5],
            response: { type: 'short', placeholder: 'In "Dust in the Wind", describe what you hear the THUMB doing vs. what the FINGERS are doing.',
              placeholder_es: 'En "Dust in the Wind", describe qué escuchas haciendo al PULGAR frente a lo que hacen los DEDOS.' }
          }
            ]
          },
          {
            title: 'Try p-i-m-a on open strings',
            title_es: 'Prueba p-i-m-a en cuerdas al aire',
            steps: [
          {
            label: 'Try it: p-i-m-a on open strings', label_es: 'Pruébalo: p-i-m-a al aire',
            text: 'Now try it: pluck p-i-m-a on open strings — low E (p), G (i), B (m), high e (a):<ol><li>Click any note below the TAB to hear it.</li><li>Then play the staircase on your own guitar, one finger per string.</li></ol>',
            text_es: 'Ahora pruébalo: pulsa p-i-m-a en cuerdas al aire — Mi grave (p), Sol (i), Si (m), mi aguda (a):<ol><li>Haz clic en cualquier nota debajo del TAB para escucharla.</li><li>Luego toca la escalera en tu propia guitarra, un dedo por cuerda.</li></ol>',
            hint: 'No pick, no chord yet — just the right hand. Each pluck lands on its own string, reading left to right. Aim for the same volume from every finger.',
            hint_es: 'Sin púa, sin acorde todavía — solo la mano derecha. Cada pulsación cae en su propia cuerda, leyendo de izquierda a derecha. Apunta al mismo volumen en cada dedo.',
            skills: [3, 4, 5],
            tab: {
              caption: 'p-i-m-a on open strings · low E · G · B · high e',
              caption_es: 'p-i-m-a en cuerdas al aire · Mi grave · Sol · Si · mi aguda',
              notes: [
                { string: 'E', fret: 0, note: 'E', midi: 40 },
                { string: 'G', fret: 0, note: 'G', midi: 55 },
                { string: 'B', fret: 0, note: 'B', midi: 59 },
                { string: 'e', fret: 0, note: 'e', midi: 64 }
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
            label: 'Wrap-up: your trickiest finger', label_es: 'Cierre: tu dedo más difícil',
            text: 'Station Wrap-Up — pause and think: which finger felt the most awkward today, and what helped it land more evenly?',
            text_es: 'Cierre de la estación — pausa y piensa: ¿cuál dedo se sintió más incómodo hoy, y qué ayudó a que cayera más parejo?',
            response: { type: 'short', placeholder: 'e.g. the ring (a) finger was weakest — slowing down and watching it helped',
              placeholder_es: 'p. ej. el dedo anular (a) era el más débil — ir más despacio y observarlo ayudó' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — finger assignments',
        title_es: 'Estación de práctica — asignación de dedos',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tuning check', label_es: 'Calentamiento: afinación',
                text: 'Start every practice session the same way:<ol><li>Tune all 6 strings to green (E A D G B e).</li><li>Then play each string open.</li></ol>You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera:<ol><li>Afina las 6 cuerdas hasta que estén en verde (E A D G B e).</li><li>Luego toca cada cuerda al aire.</li></ol>Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                hint: 'Tuning (Module 1) matters even more in fingerpicking — every note is exposed, so an out-of-tune string is easy to hear.',
                hint_es: 'Afinar (Módulo 1) importa todavía más en el fingerpicking — cada nota queda expuesta, así que una cuerda desafinada se escucha fácilmente.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Set up a relaxed fingerpicking hand',
            title_es: 'Prepara una mano de fingerpicking relajada',
            steps: [
          {
            label: 'Challenge 1 — Hand Shape', label_es: 'Reto 1 — Forma de la mano',
            text: '<ol><li>Put the pick down.</li><li>Rest your thumb on the low E and i-m-a on the G, B, and high e strings.</li><li>Hold for 30 seconds.</li></ol>You\'ve got it when: a relaxed, arched wrist with curved fingers — like holding an apple.<span class="step-figure"><img src="img/m8-pima-map-en.svg" alt="Diagram of the picking-hand finger assignments: the thumb, p, rests on the low E string sitting forward of the fingers, i is on the G string, m on the B string, and a on the high e string; dashed marks show p also covers the A and D strings."></span>',
            text_es: '<ol><li>Deja la púa a un lado.</li><li>Apoya tu pulgar en la Mi grave e i-m-a en las cuerdas Sol, Si y mi aguda.</li><li>Sostén la posición por 30 segundos.</li></ol>Lo tienes cuando: una muñeca relajada y arqueada con dedos curvados — como si sostuvieras una manzana.<span class="step-figure"><img src="img/m8-pima-map-es.svg" alt="Diagrama de la asignación de dedos de la mano de pulsar: el pulgar, p, se apoya en la cuerda Mi grave por delante de los dedos, i va en la cuerda Sol, m en la cuerda Si y a en la cuerda mi aguda; unas marcas punteadas muestran que p también cubre las cuerdas La y Re."></span>',
            hint: 'Your wrist should be arched (curved) — not flat against the guitar body. Fingers curved as if you\'re holding an apple. Relax.',
            hint_es: 'Tu muñeca debe estar arqueada (curvada) — no plana contra el cuerpo de la guitarra. Dedos curvados como si sostuvieras una manzana. Relájate.',
            stuck: 'Drop your hand to your side and shake it loose, then place it back on the strings without tensing up — relaxed first, accurate second.',
            stuck_es: 'Deja caer tu mano a un lado y sacúdela para soltarla, y luego colócala de nuevo en las cuerdas sin tensarte — relajada primero, precisa después.',
            levelUp: 'Hold the shape, look away, then pluck each string in turn by feel alone — no peeking.',
            levelUp_es: 'Sostén la forma, mira hacia otro lado, y luego pulsa cada cuerda por turno solo por sensación — sin mirar.',
            skills: [1, 2]
          }
            ]
          },
          {
            title: 'Pluck p-i-m-a — thumb bass, i-m-a treble',
            title_es: 'Pulsa p-i-m-a — pulgar en el bajo, i-m-a en las agudas',
            steps: [
          {
            label: 'Challenge 2 — p-i-m-a Plucks (your assessment piece)', label_es: 'Reto 2 — Pulsaciones p-i-m-a (tu pieza de evaluación)',
            text: '<ul><li>Pluck once with each finger in order — p (low E), i (G), m (B), a (high e) — saying each letter aloud, 8 times at 60 BPM.</li></ul>You\'ve got it when: the same volume from every finger, even the weaker ring (a). This open-string check is the Set 1 check-off.',
            text_es: '<ul><li>Pulsa una vez con cada dedo en orden — p (Mi grave), i (G), m (B), a (mi aguda) — diciendo cada letra en voz alta, 8 veces a 60 BPM.</li></ul>Lo tienes cuando: el mismo volumen en cada dedo, incluso en el anular (a), que es más débil. Esta revisión con cuerdas al aire es el chequeo de la Unidad 1.',
            hint: 'No strumming, no pick. Each finger gets ONE string. Aim for the same volume from each finger — the ring finger (a) is usually the weakest at first. Set the ⏱ Timer for 2 minutes and loop it.',
            hint_es: 'Sin rasgueo, sin púa. Cada dedo tiene UNA cuerda. Apunta al mismo volumen en cada dedo — el dedo anular (a) suele ser el más débil al principio. Pon el ⏱ Temporizador en 2 minutos y repítelo.',
            stuck: 'Pluck just p then i, over and over, until those two are even — then add m, then a.',
            stuck_es: 'Pulsa solo p y luego i, una y otra vez, hasta que esos dos salgan parejos — y luego agrega m, y luego a.',
            levelUp: 'Run it backwards (a-m-i-p), or close your eyes and keep every finger on its string.',
            levelUp_es: 'Tócalo al revés (a-m-i-p), o cierra los ojos y mantén cada dedo en su cuerda.',
            skills: [3, 4, 5],
            playSeq: { label: 'Hear p-i-m-a on open strings', label_es: 'Escucha p-i-m-a en cuerdas al aire', bpm: 60, notes: [40, 55, 59, 64] },
            response: { type: 'short', prompt: 'Personal record: play it cleanly at 60 BPM, then raise the metronome +10 at a time. Your fastest CLEAN, even p-i-m-a lap (one full time through the pattern) today (BPM)?', prompt_es: 'Récord personal: tócalo limpio a 60 BPM, y luego sube el metrónomo de 10 en 10. ¿Tu vuelta p-i-m-a más rápida, LIMPIA y pareja (una vuelta = un recorrido completo del patrón) hoy (BPM)?', placeholder: 'e.g. 80 — try for a higher number next time', placeholder_es: 'p. ej. 80 — intenta superarlo la próxima vez' }
          }
            ]
          },
          {
            title: 'Move the thumb between bass strings',
            title_es: 'Mueve el pulgar entre las cuerdas graves',
            steps: [
          {
            label: 'Challenge 3 — Moving Bass', label_es: 'Reto 3 — Bajo en movimiento',
            text: '<ol><li>Pluck the low E string with p.</li><li>Then G-B-e with i-m-a.</li><li>Then the A string.</li><li>Then the D string with p — fingers staying put.</li></ol>You\'ve got it when: only the thumb moves to find each bass note — the i-m-a fingers stay anchored.',
            text_es: '<ol><li>Pulsa la cuerda Mi grave con p.</li><li>Y luego Sol, Si y mi aguda con i-m-a.</li><li>Luego la cuerda La.</li><li>Y luego la cuerda Re con p — los dedos se quedan quietos.</li></ol>Lo tienes cuando: solo el pulgar se mueve para encontrar cada nota grave — los dedos i-m-a se quedan anclados.',
            hint: 'This is how you change chords later — the thumb finds the bass note of the chord (root) while the fingers stay anchored on the treble strings.',
            hint_es: 'Así es como cambiarás de acorde más adelante — el pulgar encuentra la nota grave del acorde (la raíz) mientras los dedos se quedan anclados en las cuerdas agudas.',
            stuck: 'Move just the thumb E → A → D with the fingers resting (not plucking) on G-B-e, until the thumb finds each bass without looking.',
            stuck_es: 'Mueve solo el pulgar Mi → La → Re con los dedos apoyados (sin pulsar) en Sol, Si y mi aguda, hasta que el pulgar encuentre cada nota grave sin mirar.',
            levelUp: 'Call out the bass string a beat before you play it, or shift E → A → D → A → E in a continuous loop without stopping.',
            levelUp_es: 'Anuncia la cuerda grave un tiempo antes de tocarla, o cambia Mi → La → Re → La → Mi en un loop continuo sin detenerte.',
            skills: [2, 3, 6],
            playSeq: { label: 'Thumb shifts: E · A · D bass with i-m-a above', label_es: 'Cambios del pulgar: bajo Mi · La · Re con i-m-a arriba', bpm: 60, notes: [40, 55, 59, 64, 45, 55, 59, 64, 50, 55, 59, 64] }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "the cure", first touch', label_es: 'Reto — "the cure", primer contacto',
                text: '<ol><li>Fret Am and pluck p (A string) · i · m · a, one note per beat at 60 BPM — that soft broken-chord sound IS the verse feel of "the cure".</li><li>Then change to C: your thumb stays on the same bass STRING — C\'s root lives on the A string too, just at the 3rd fret, where your ring finger now supplies the new bass note.</li></ol>You\'ve got it when: four clean p-i-m-a laps on Am and four on C, every note even.',
                text_es: '<ol><li>Trastea Am y pulsa p (cuerda La) · i · m · a, una nota por tiempo a 60 BPM — ese sonido suave de acorde desglosado ES la sensación de la estrofa de "the cure".</li><li>Luego cambia a C: tu pulgar se queda en la misma CUERDA grave — la raíz de C también vive en la cuerda La, solo que en el traste 3, donde tu dedo anular ahora aporta la nueva nota grave.</li></ol>Lo tienes cuando: cuatro vueltas limpias de p-i-m-a en Am y cuatro en C, cada nota pareja.',
                hint: 'Olivia\'s verse is fingerpicked for exactly this reason — soft and close. Wrist stays arched; only the fingers move. Four notes, four beats, one bar of 4/4 — Set 2 stretches the same idea into a longer pattern over the same song.',
                hint_es: 'La estrofa de Olivia está tocada con fingerpicking exactamente por esta razón — suave y cercana. La muñeca se mantiene arqueada; solo se mueven los dedos. Cuatro notas, cuatro tiempos, un compás de 4/4 — la Unidad 2 estira esta misma idea en un patrón más largo sobre la misma canción.',
                stuck: 'Run p-i-m-a on open strings first (no chord at all), then add the Am under it.',
                stuck_es: 'Toca p-i-m-a en cuerdas al aire primero (sin acorde alguno), y luego agrega el Am debajo.',
                levelUp: 'Add Dm and F: the thumb travels to the D string for both — and now you have the song\'s whole verse loop (Am · C · Dm · F).',
                levelUp_es: 'Agrega Dm y F: el pulgar viaja a la cuerda Re para ambos — y ahora tienes todo el loop de la estrofa de la canción (Am · C · Dm · F).',
                skills: [5, 6],
                playSeq: { label: '"the cure" feel — p-i-m-a on Am', label_es: 'Sensación de "the cure" — p-i-m-a en Am', bpm: 60, notes: [45, 57, 60, 64] },
                chords: [
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
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
                label: 'Wrap-up: wrist or volume?', label_es: 'Cierre: ¿muñeca o volumen?',
                text: 'Which still needs work — keeping the wrist arched, or getting even volume from all four fingers? Write it below — that\'s your warm-up target next time you practice.',
                text_es: '¿Qué todavía necesita trabajo — mantener la muñeca arqueada, o lograr volumen parejo en los cuatro dedos? Escríbelo abajo — ese es tu objetivo de calentamiento la próxima vez que practiques.',
                response: { type: 'short', placeholder: 'e.g. the ring finger is still quieter than the others; wrist flattens when I speed up',
                  placeholder_es: 'p. ej. el dedo anular todavía suena más bajo que los demás; la muñeca se aplana cuando acelero' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Holds correct fingerpicking hand position · Assigns p to bass, i-m-a to G-B-e · Plucks each open string with the correct finger · Plays through p-i-m-a in order without looking',
      goal_es: 'Mantiene una posición correcta de la mano de fingerpicking · Asigna p al bajo, i-m-a a Sol, Si y mi aguda · Pulsa cada cuerda al aire con el dedo correcto · Toca p-i-m-a en orden sin mirar',
      performance: 'Play p-i-m-a on open strings at 60 BPM for 8 reps. Check your own hand position in a mirror or on your device\'s camera — wrist arched, fingers curved.',
      selfCheck: 'Can you pluck a string with your "a" finger without looking? Can you keep your wrist arched for 30 seconds without it collapsing?',
      selfCheck_es: '¿Puedes pulsar una cuerda con tu dedo "a" sin mirar? ¿Puedes mantener tu muñeca arqueada durante 30 segundos sin que se colapse?',
      standards: ['Pr.4a', 'Pr.5a']
    },

    skills: [
      { id: 'm8w1-s1', text: 'Hold a relaxed fingerpicking hand position — wrist arched, fingers curved',
        text_es: 'Mantener una posición relajada de la mano de fingerpicking — muñeca arqueada, dedos curvados',
        gotItWhen: 'you can hold the position for 30 seconds without your wrist collapsing flat, and your fingers stay curved (not flat) over the treble strings.',
        gotItWhen_es: 'puedes mantener la posición durante 30 segundos sin que tu muñeca se aplane, y tus dedos se quedan curvados (no planos) sobre las cuerdas agudas.',
        practice: { type: 'mc', prompt: 'In a correct fingerpicking hand position, your wrist should be:',
          prompt_es: 'En una posición correcta de la mano de fingerpicking, tu muñeca debería estar:',
          choices: ['Flat against the guitar body', 'Arched (curved away from the guitar)', 'Locked stiff', 'Pointing toward the floor'],
          choices_es: ['Plana contra el cuerpo de la guitarra', 'Arqueada (curvada lejos de la guitarra)', 'Bloqueada y rígida', 'Apuntando hacia el suelo'], answer: 1,
          explain: 'An arched wrist leaves room under your hand so the fingers can curl and pull the string straight back. Flat against the body pins them, and they end up scraping sideways.',
          explain_es: 'Una muñeca arqueada deja espacio debajo de la mano para que los dedos se curven y tiren de la cuerda hacia atrás. Plana contra el cuerpo los aplasta, y terminan raspando de lado.' } },
      { id: 'm8w1-s2', text: 'Identify p, i, m, a finger letters and their string assignments',
        text_es: 'Identificar las letras de dedos p, i, m, a y sus cuerdas asignadas',
        gotItWhen: 'you can say "p = thumb / bass strings, i = index / G, m = middle / B, a = ring / high e" without hesitating — and assign a finger to any string on demand.',
        gotItWhen_es: 'puedes decir "p = pulgar / cuerdas graves, i = índice / Sol, m = medio / Si, a = anular / mi aguda" sin dudar — y asignar un dedo a cualquier cuerda cuando se te pida.',
        practice: { type: 'mc', prompt: 'In p-i-m-a notation, which finger handles the G string (string 3)?',
          prompt_es: 'En la notación p-i-m-a, ¿cuál dedo se encarga de la cuerda Sol (cuerda 3)?',
          choices: ['p (thumb)', 'i (index)', 'm (middle)', 'a (ring)'],
          choices_es: ['p (pulgar)', 'i (índice)', 'm (medio)', 'a (anular)'], answer: 1,
          explain: 'i (the index finger) lives on the G string — that\'s its home. The thumb patrols all three bass strings, while i, m, and a each own one treble string: G, B, and high e.',
          explain_es: 'La i (el dedo índice) vive en la cuerda Sol — ese es su hogar. El pulgar patrulla las tres cuerdas graves, mientras que i, m y a tienen cada uno su propia cuerda aguda: Sol, Si y mi aguda.' } },
      { id: 'm8w1-s3', text: 'Pluck the low E string cleanly with my thumb (p)',
        text_es: 'Pulsar la cuerda Mi grave de forma limpia con mi pulgar (p)',
        gotItWhen: 'your thumb pulls down and slightly inward (toward the body) and the low E rings clearly with a warm, full tone — no clicking.',
        gotItWhen_es: 'tu pulgar tira hacia abajo y ligeramente hacia adentro (hacia el cuerpo de la guitarra) y la Mi grave suena clara con un tono cálido y lleno — sin chasquidos.',
        practice: { type: 'playSeq', label: 'Thumb only — low E · A · D bass strings', label_es: 'Solo el pulgar — cuerdas graves Mi · La · Re', bpm: 60,
          notes: [40, 45, 50] } },
      { id: 'm8w1-s4', text: 'Pluck the G, B, and high e strings with i, m, a fingers respectively',
        text_es: 'Pulsar las cuerdas Sol, Si y mi aguda con los dedos i, m, a respectivamente',
        gotItWhen: 'each finger goes to its assigned string without you having to look — and all three sound roughly equal in volume.',
        gotItWhen_es: 'cada dedo va a su cuerda asignada sin que tengas que mirar — y los tres suenan más o menos con el mismo volumen.',
        practice: { type: 'playSeq', label: 'i · m · a on G · B · e', label_es: 'i · m · a en Sol · Si · mi aguda', bpm: 60,
          notes: [55, 59, 64] } },
      { id: 'm8w1-s5', text: 'Pluck p-i-m-a in order on open strings at 60 BPM',
        text_es: 'Pulsar p-i-m-a en orden en cuerdas al aire a 60 BPM',
        gotItWhen: 'you can pluck low E (p), G (i), B (m), high e (a) in order, four times in a row at 60 BPM, all four notes equal in volume.',
        gotItWhen_es: 'puedes pulsar Mi grave (p), Sol (i), Si (m), mi aguda (a) en orden, cuatro veces seguidas a 60 BPM, con las cuatro notas iguales en volumen.',
        practice: { type: 'playSeq', label: 'p-i-m-a (low E · G · B · e) at 60 BPM', label_es: 'p-i-m-a (Mi grave · Sol · Si · mi aguda) a 60 BPM', bpm: 60,
          notes: [40, 55, 59, 64] } },
      { id: 'm8w1-s6', text: 'Move the thumb to a different bass string while i-m-a stay on G, B, e',
        text_es: 'Mover el pulgar a una cuerda grave distinta mientras i-m-a se quedan en Sol, Si y mi aguda',
        gotItWhen: 'when the chord changes from Em to Am, your thumb shifts from the low E string to the A string (finding the new root) while your i-m-a fingers stay anchored on G-B-e the whole time.',
        gotItWhen_es: 'cuando el acorde cambia de Em a Am, tu pulgar se mueve de la cuerda Mi grave a la cuerda La (encontrando la nueva raíz) mientras tus dedos i-m-a se quedan anclados en Sol, Si y mi aguda todo el tiempo.',
        practice: { type: 'playSeq', label: 'p walks E → A → D while i·m·a stay on G · B · e', label_es: 'p camina por Mi → La → Re mientras i·m·a se quedan en Sol · Si · mi aguda', bpm: 60,
          notes: [40, 55, 59, 64, 45, 55, 59, 64, 50, 55, 59, 64] } }
    ]
  },

  {
    id: 'm8w2',
    label: 'Set 2',
    locked: false,
    module: 'Finger Picking',
    moduleNum: 8,
    unit: 'Module 8 · Finger Picking',
    unit_es: 'Módulo 8 · Fingerpicking',
    title: 'Set 2',
    subtitle: 'Basic PIMA pattern · The classic arpeggio (the notes of a chord played one at a time) · Over a single chord',
    subtitle_es: 'Patrón básico PIMA · El arpegio clásico (las notas de un acorde tocadas una a la vez) · Sobre un solo acorde',
    skillFocus: 'Playing a PIMA arpeggio pattern · Keeping even timing and volume · Picking through a held chord',
    skillFocus_es: 'Tocar un patrón de arpegio PIMA · Mantener el tiempo y el volumen parejos · Puntear a través de un acorde sostenido',
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
            label: 'Watch: count the 6-note cycle', label_es: 'Mira: cuenta el ciclo de 6 notas',
            text: 'Watch: <a href="https://youtu.be/K2Z3RZc5t-A" target="_blank">Basic Fingerstyle – Travis Finger Picking (FO-108) – JustinGuitar</a> (revisit 0:00–4:00). This time, watch one full pattern cycle and count the notes out loud with him.',
            text_es: 'Mira: <a href="https://youtu.be/K2Z3RZc5t-A" target="_blank">Basic Fingerstyle – Travis Finger Picking (FO-108) – JustinGuitar</a> (revisita 0:00–4:00). Esta vez, mira un ciclo completo del patrón y cuenta las notas en voz alta con él.',
            hint: 'The "p-i-m-a-m-i" cycle (6 notes per bar) is one of the most-used patterns in folk and pop. It creates a flowing, arpeggiated feel under a chord.',
            hint_es: 'El ciclo "p-i-m-a-m-i" (6 notas por compás) es uno de los patrones más usados en folk y pop. Crea una sensación fluida y arpegiada debajo de un acorde.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'In the 6-note pattern "p-i-m-a-m-i", how many times does each finger play in one cycle?',
              prompt_es: 'En el patrón de 6 notas "p-i-m-a-m-i", ¿cuántas veces toca cada dedo en un ciclo?',
              answer: 0,
              explain: 'Count the letters: p(1) i(2) m(2) a(1) — i and m each play twice as the pattern climbs up and back down, while p and a play once.',
              explain_es: 'Cuenta las letras: p(1) i(2) m(2) a(1) — i y m tocan cada uno dos veces mientras el patrón sube y vuelve a bajar, mientras que p y a tocan una vez.',
              choices: [
              'p once, i twice, m twice, a once',
              'Each finger plays exactly once',
              'p three times, others once each',
              'p twice, i once, m once, a twice'
            ],
              choices_es: [
              'p una vez, i dos veces, m dos veces, a una vez',
              'Cada dedo toca exactamente una vez',
              'p tres veces, los demás una vez cada uno',
              'p dos veces, i una vez, m una vez, a dos veces'
            ] }
          },
          {
            label: 'Watch: pluck patterns and walkdowns', label_es: 'Mira: patrones de pulsación y walkdowns',
            text: 'Watch: <a href="https://youtu.be/AFyqe-rfxTU" target="_blank">Fingerpicking for Beginners — Pluck Patterns and Walkdowns – Lauren Bateman</a> — a fingerpicking specialist\'s take on the same skill as Set 1\'s videos. Mute the strings with your fretting hand and tap the FINGER ORDER on the guitar top as she plays.',
            text_es: 'Mira: <a href="https://youtu.be/AFyqe-rfxTU" target="_blank">Fingerpicking for Beginners — Pluck Patterns and Walkdowns – Lauren Bateman</a> — el enfoque de una especialista en fingerpicking sobre la misma destreza de los videos de la Unidad 1. Silencia las cuerdas con tu mano de trastear y marca el ORDEN DE LOS DEDOS en la tapa de la guitarra mientras ella toca.',
            hint: 'Second teacher, same rule: focus on the FINGER ORDER — once it\'s automatic, your speed will follow.',
            hint_es: 'Segunda maestra, misma regla: concéntrate en el ORDEN DE LOS DEDOS — una vez que sea automático, la velocidad vendrá sola.',
            skills: [3, 4],
            response: { type: 'short', placeholder: 'When the chord changes, does the picking pattern change too? And what did Lauren show that Set 1\'s videos didn\'t?',
              placeholder_es: 'Cuando el acorde cambia, ¿el patrón de punteo también cambia? ¿Y qué mostró Lauren que los videos de la Unidad 1 no mostraron?' }
          }
            ]
          },
          {
            title: 'Listen for the 6-note pulse',
            title_es: 'Escucha el pulso de 6 notas',
            steps: [
          {
            label: 'Listen: "Nothing Else Matters"', label_es: 'Escucha: "Nothing Else Matters"',
            text: 'Listen to "Nothing Else Matters" by Metallica. The intro is entirely fingerpicked open chords. Tap along — can you feel the 6-note pulse?',
            text_es: 'Escucha "Nothing Else Matters" de Metallica. El intro son acordes al aire tocados enteramente con fingerpicking. Sigue el ritmo — ¿puedes sentir el pulso de 6 notas?',
            hint: 'James Hetfield famously taught himself this with no plan. He uses thumb-finger-thumb-finger patterns. Notice the constant thumb motion.',
            hint_es: 'James Hetfield famosamente se enseñó esto a sí mismo sin ningún plan. Usa patrones de pulgar-dedo-pulgar-dedo. Fíjate en el movimiento constante del pulgar.',
            skills: [4, 5],
            response: { type: 'mc', prompt: 'In a typical fingerpicked arpeggio, what role does the THUMB usually play?',
              prompt_es: 'En un arpegio típico de fingerpicking, ¿qué papel suele cumplir el PULGAR?',
              answer: 0,
              explain: 'The thumb is the anchor — it stays on a bass string and lays down the foundation while i, m, and a handle the higher, faster notes.',
              explain_es: 'El pulgar es el ancla — se queda en una cuerda grave y sienta la base mientras i, m y a se encargan de las notas más agudas y rápidas.',
              choices: [
              'It moves least — it stays on a bass string and provides the foundation',
              'It moves fastest, switching strings every beat',
              'It doesn\'t play at all in arpeggios',
              'It plays the highest notes'
            ],
              choices_es: [
              'Es el que menos se mueve — se queda en una cuerda grave y da la base',
              'Es el que más rápido se mueve, cambiando de cuerda en cada tiempo',
              'No toca para nada en los arpegios',
              'Toca las notas más agudas'
            ] }
          }
            ]
          },
          {
            title: 'Try the pattern on Em',
            title_es: 'Prueba el patrón en Em',
            steps: [
          {
            label: 'Try it: the pattern on Em', label_es: 'Pruébalo: el patrón en Em',
            text: 'Now try it: fret Em and play the 6-note p-i-m-a-m-i arpeggio:<ol><li>Click any note below the TAB to hear it.</li><li>Then play the staircase yourself — thumb on the low E (Em\'s root), i-m-a on G-B-e, then back down m-i.</li></ol>',
            text_es: 'Ahora pruébalo: trastea Em y toca el arpegio de 6 notas p-i-m-a-m-i:<ol><li>Haz clic en cualquier nota debajo del TAB para escucharla.</li><li>Luego toca la escalera tú mismo — pulgar en la Mi grave (la raíz de Em), i-m-a en Sol, Si y mi aguda, y luego de vuelta hacia abajo m-i.</li></ol>',
            hint: 'Em is all open strings on the treble side, so you can focus entirely on the picking hand. Read the TAB left to right — the bass note starts it, then the fingers climb and come back.',
            hint_es: 'Em son todas cuerdas al aire del lado agudo, así que puedes concentrarte por completo en la mano de pulsar. Lee el TAB de izquierda a derecha — la nota grave lo empieza, y luego los dedos suben y vuelven.',
            skills: [1, 2, 3],
            tab: {
              caption: 'Em arpeggio · p-i-m-a-m-i · thumb on the low E',
              caption_es: 'Arpegio de Em · p-i-m-a-m-i · pulgar en la Mi grave',
              notes: [
                { string: 'E', fret: 0, note: 'E', midi: 40 },
                { string: 'G', fret: 0, note: 'G', midi: 55 },
                { string: 'B', fret: 0, note: 'B', midi: 59 },
                { string: 'e', fret: 0, note: 'e', midi: 64 },
                { string: 'B', fret: 0, note: 'B', midi: 59 },
                { string: 'G', fret: 0, note: 'G', midi: 55 }
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
            label: 'Wrap-up: is it automatic yet?', label_es: 'Cierre: ¿ya es automático?',
            text: 'Station Wrap-Up — pause and think: did the pattern start to feel automatic, or were you still thinking through each finger? What would make it smoother?',
            text_es: 'Cierre de la estación — pausa y piensa: ¿el patrón empezó a sentirse automático, o todavía estabas pensando en cada dedo? ¿Qué lo haría más fluido?',
            response: { type: 'short', placeholder: 'e.g. still counting each finger — slowing the metronome down helped it flow',
              placeholder_es: 'p. ej. todavía cuento cada dedo — bajar el metrónomo ayudó a que fluyera' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — the 6-note pattern',
        title_es: 'Estación de práctica — el patrón de 6 notas',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tuning check', label_es: 'Calentamiento: afinación',
                text: 'Start every practice session the same way:<ol><li>Tune all 6 strings to green (E A D G B e).</li><li>Then play each string open.</li></ol>You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera:<ol><li>Afina las 6 cuerdas hasta que estén en verde (E A D G B e).</li><li>Luego toca cada cuerda al aire.</li></ol>Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                hint: 'Every note in an arpeggio rings on its own with nothing to cover it up — an out-of-tune string stands out even more once the thumb starts moving between chords.',
                hint_es: 'En un arpegio cada nota suena sola, sin nada que la disimule — una cuerda desafinada se nota todavía más una vez que el pulgar empieza a moverse entre acordes.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Play the p-i-m-a-m-i pattern on Em',
            title_es: 'Toca el patrón p-i-m-a-m-i en Em',
            steps: [
          {
            label: 'Challenge 1 — Em Pattern', label_es: 'Reto 1 — Patrón en Em',
            text: 'Six notes make one bar here — that is 6/8 time, six beats to a bar instead of the four you have counted all course:<ol><li>Fret Em.</li><li>Play the 6-note pattern p-i-m-a-m-i at 60 BPM, one note per click, for 8 bars.</li><li>Count "1-2-3-4-5-6" out loud so the thumb always lands on count 1.</li></ol>You\'ve got it when: a steady, even pulse with every note ringing clean and p on every count 1.',
            text_es: 'Seis notas forman un compás aquí — eso es el compás de 6/8, seis tiempos por compás en lugar de los cuatro que has contado todo el curso:<ol><li>Trastea Em.</li><li>Toca el patrón de 6 notas p-i-m-a-m-i a 60 BPM, una nota por clic, durante 8 compases.</li><li>Cuenta "1-2-3-4-5-6" en voz alta para que el pulgar siempre caiga en el conteo 1.</li></ol>Lo tienes cuando: un pulso constante y parejo con cada nota sonando limpia y la p en cada conteo 1.',
            hint: '"Nothing Else Matters", the song you listened to at the computer station, is in 6/8 too — that is exactly why this six-note pattern fits it so neatly. Songs in 4/4 (four beats a bar) need a different count, and you will do that on the song card at the bottom of this station. Don\'t worry about exact rhythm yet; just keep the pulse steady.',
            hint_es: '"Nothing Else Matters", la canción que escuchaste en la estación de computadora, también está en 6/8 — por eso justamente este patrón de seis notas le queda tan bien. Las canciones en 4/4 (cuatro tiempos por compás) necesitan otro conteo, y eso lo harás en la tarjeta de canción al final de esta estación. No te preocupes todavía por el ritmo exacto; solo mantén el pulso constante.',
            stuck: 'Drop the metronome and play the pattern as slowly as you need to — get the finger order automatic first, speed comes after.',
            stuck_es: 'Deja el metrónomo y toca el patrón tan despacio como necesites — logra que el orden de los dedos sea automático primero, la velocidad viene después.',
            levelUp: 'Play 8 bars without a single uneven note, or close your eyes and keep the pulse rock-steady.',
            levelUp_es: 'Toca 8 compases sin una sola nota despareja, o cierra los ojos y mantén el pulso firme como una roca.',
            skills: [1, 2, 3],
            playSeq: { label: 'Em p-i-m-a-m-i pattern at 60 BPM', label_es: 'Patrón p-i-m-a-m-i en Em a 60 BPM', bpm: 60,
              notes: [40, 55, 59, 64, 59, 55] }
          }
            ]
          },
          {
            title: 'Play the pattern on Am (move the thumb)',
            title_es: 'Toca el patrón en Am (mueve el pulgar)',
            steps: [
          {
            label: 'Challenge 2 — Am Pattern', label_es: 'Reto 2 — Patrón en Am',
            text: '<ol><li>Fret Am.</li><li>Play the 6-note pattern over it — thumb on the A string (Am\'s root), i-m-a still on G-B-e — 8 times.</li></ol>You\'ve got it when: only the thumb moves to the new bass; the fingers stay anchored. Click any note below the TAB to hear it.',
            text_es: '<ol><li>Trastea Am.</li><li>Toca el patrón de 6 notas sobre él — pulgar en la cuerda La (la raíz de Am), i-m-a siguen en Sol, Si y mi aguda — 8 veces.</li></ol>Lo tienes cuando: solo el pulgar se mueve hacia el nuevo bajo; los dedos se quedan anclados. Haz clic en cualquier nota debajo del TAB para escucharla.',
            hint: 'The only change from Em is which bass string the thumb plays. Fingers stay parked on G, B, high e.',
            hint_es: 'El único cambio respecto a Em es en cuál cuerda grave toca el pulgar. Los dedos se quedan estacionados en Sol, Si y mi aguda.',
            stuck: 'Drop the pattern — just pluck the Am bass (p) and let it ring, then add i-m-a one finger at a time.',
            stuck_es: 'Deja el patrón — solo pulsa el bajo de Am (p) y deja que suene, y luego agrega i-m-a un dedo a la vez.',
            levelUp: 'Switch Em → Am every 2 bars without breaking the pulse — only the thumb relocates.',
            levelUp_es: 'Cambia Em → Am cada 2 compases sin romper el pulso — solo el pulgar se reubica.',
            skills: [3, 4, 6],
            tab: {
              caption: 'Am arpeggio · p-i-m-a-m-i · thumb on the A string',
              caption_es: 'Arpegio de Am · p-i-m-a-m-i · pulgar en la cuerda La',
              notes: [
                { string: 'A', fret: 0, note: 'A', midi: 45 },
                { string: 'G', fret: 2, note: 'A', midi: 57 },
                { string: 'B', fret: 1, note: 'C', midi: 60 },
                { string: 'e', fret: 0, note: 'E', midi: 64 },
                { string: 'B', fret: 1, note: 'C', midi: 60 },
                { string: 'G', fret: 2, note: 'A', midi: 57 }
              ]
            }
          }
            ]
          },
          {
            title: 'Build up your tempo (70+ BPM)',
            title_es: 'Aumenta tu tempo (70+ BPM)',
            steps: [
          {
            label: 'Challenge 3 — Raise Your Tempo (your assessment piece)', label_es: 'Reto 3 — Sube tu tempo (tu pieza de evaluación)',
            text: '<ol><li>Play the Em pattern at 70 BPM.</li><li>Try 80.</li></ol>You\'ve got it when: clean at 70+ with the "a" finger landing right on its beat — drop back to 60 if it falls apart. This steady-pattern check is the Set 2 check-off.',
            text_es: '<ol><li>Toca el patrón de Em a 70 BPM.</li><li>Intenta 80.</li></ol>Lo tienes cuando: limpio a 70+ con el dedo "a" cayendo justo en su tiempo — baja a 60 si se desarma. Esta revisión de patrón constante es el chequeo de la Unidad 2.',
            hint: 'The most common mistake: the ring finger (a) comes in late. Pay extra attention to your ring finger — it needs to land exactly on its beat, no later. Set the ⏱ Timer for 2 minutes and loop it.',
            hint_es: 'El error más común: el dedo anular (a) llega tarde. Presta atención extra a tu dedo anular — necesita caer exactamente en su tiempo, no después. Pon el ⏱ Temporizador en 2 minutos y repítelo.',
            stuck: 'Go back to 60 BPM and stay there until it\'s effortless — a clean 60 is better than a sloppy 80 every time.',
            stuck_es: 'Regresa a 60 BPM y quédate ahí hasta que salga sin esfuerzo — un 60 limpio siempre es mejor que un 80 desordenado.',
            levelUp: 'Push past 80 BPM, or play the pattern over Am at the same tempo with the thumb relocating.',
            levelUp_es: 'Supera los 80 BPM, o toca el patrón sobre Am al mismo tempo con el pulgar reubicándose.',
            skills: [2, 5],
            response: { type: 'short', prompt: 'Personal record: play it cleanly at 70 BPM, then raise the metronome +10 at a time. Your fastest CLEAN, even pattern today (BPM)?', prompt_es: 'Récord personal: tócalo limpio a 70 BPM, y luego sube el metrónomo de 10 en 10. ¿Tu patrón más rápido, LIMPIO y parejo hoy (BPM)?', placeholder: 'e.g. 90 — try for a higher number next time', placeholder_es: 'p. ej. 90 — intenta superarlo la próxima vez' }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "the cure", verse', label_es: 'Reto — "the cure", estrofa',
                text: '"the cure" is in 4/4 — four beats a bar, not the six you just drilled on Em — so stretch the pattern to eight notes, p-i-m-a-m-i-m-i, two notes per beat:<ul><li>Play it over the verse loop — Am · C · Dm · F, one bar each at 60 BPM.</li><li>Thumb on the A string for Am and C.</li><li>Thumb on the D string for Dm and F.</li><li>i-m-a never leave G-B-e.</li></ul>You\'ve got it when: one full lap with the pattern unbroken at every change.',
                text_es: '"the cure" está en 4/4 — cuatro tiempos por compás, no los seis que acabas de ejercitar en Em — así que estira el patrón a ocho notas, p-i-m-a-m-i-m-i, dos notas por tiempo:<ul><li>Tócalo sobre el loop de la estrofa — Am · C · Dm · F, un compás cada uno a 60 BPM.</li><li>Pulgar en la cuerda La para Am y C.</li><li>Pulgar en la cuerda Re para Dm y F.</li><li>i-m-a nunca dejan Sol, Si y mi aguda.</li></ul>Lo tienes cuando: una vuelta completa con el patrón sin interrupciones en cada cambio.',
                hint: 'Eight too many? Use Set 1\'s four-note p-i-m-a instead, one note per beat — four notes, four beats, one bar. That is exactly what you played on "the cure" in Set 1, so the two sets ask for the same thing at two sizes. Either way the four bass notes pair up: Am and C both live on the A string, Dm and F both live on the D string — the thumb travels only once, at C→Dm, then stays. The fingers never move at all.',
                hint_es: '¿Ocho son demasiadas? Usa el p-i-m-a de cuatro notas de la Unidad 1, una nota por tiempo — cuatro notas, cuatro tiempos, un compás. Eso es exactamente lo que tocaste en "the cure" en la Unidad 1, así que las dos unidades piden lo mismo en dos tamaños. De cualquier forma, las cuatro notas graves se emparejan: Am y C viven en la cuerda La, Dm y F viven en la cuerda Re — el pulgar viaja solo una vez, en C→Dm, y luego se queda. Los dedos nunca se mueven.',
                stuck: 'Loop Am → C until your fretting hand lands on fret 3 without looking — the thumb just keeps plucking the A string — then add Dm and F as their own pair.',
                stuck_es: 'Repite Am → C hasta que tu mano de trastear caiga en el traste 3 sin mirar — el pulgar sigue pulsando la cuerda La — y luego agrega Dm y F como su propio par.',
                levelUp: 'Hum the melody over your own picking — this is the actual sound of the record.',
                levelUp_es: 'Tararea la melodía sobre tu propio punteo — este es el sonido real de la grabación.',
                skills: [4, 6],
                tab: {
                  caption: '"the cure" — fingerstyle bass roots · Am · C · Dm · F · one bar each · 60 BPM',
                  caption_es: '"the cure" — raíces graves de fingerstyle · Am · C · Dm · F · un compás cada uno · 60 BPM',
                  notes: [
                    { string: 'A', fret: 0, note: 'A', midi: 45 },
                    { string: 'A', fret: 0, note: 'A', midi: 45 },
                    { string: 'A', fret: 0, note: 'A', midi: 45 },
                    { string: 'A', fret: 0, note: 'A', midi: 45 },
                    { string: 'A', fret: 3, note: 'C', midi: 48 },
                    { string: 'A', fret: 3, note: 'C', midi: 48 },
                    { string: 'A', fret: 3, note: 'C', midi: 48 },
                    { string: 'A', fret: 3, note: 'C', midi: 48 },
                    { string: 'D', fret: 0, note: 'D', midi: 50 },
                    { string: 'D', fret: 0, note: 'D', midi: 50 },
                    { string: 'D', fret: 0, note: 'D', midi: 50 },
                    { string: 'D', fret: 0, note: 'D', midi: 50 },
                    { string: 'D', fret: 3, note: 'F', midi: 53 },
                    { string: 'D', fret: 3, note: 'F', midi: 53 },
                    { string: 'D', fret: 3, note: 'F', midi: 53 },
                    { string: 'D', fret: 3, note: 'F', midi: 53 }
                  ]
                },
                response: { type: 'short', prompt: 'Which change broke the pattern more — Am→C or C→Dm?', prompt_es: '¿Qué cambio rompió más el patrón — Am→C o C→Dm?', placeholder: 'e.g. C→Dm — the thumb overshoots the D string', placeholder_es: 'p. ej. C→Dm — el pulgar se pasa de la cuerda Re' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: your top clean tempo', label_es: 'Cierre: tu tempo limpio máximo',
                text: 'What\'s your honest top clean tempo right now, and which finger gives out first when you push it? Write it below — that\'s your warm-up target next time.',
                text_es: '¿Cuál es honestamente tu mejor tempo limpio ahora mismo, y cuál dedo cede primero cuando lo aceleras? Escríbelo abajo — ese es tu objetivo de calentamiento la próxima vez.',
                response: { type: 'short', placeholder: 'e.g. clean to 80, then the ring finger starts dragging behind the beat',
                  placeholder_es: 'p. ej. limpio hasta 80, y luego el dedo anular empieza a atrasarse del tiempo' }
              }
            ]
          },
          {
            title: '⚡ Ear Spark — optional ear bonus',
            title_es: '⚡ Chispa auditiva — bono opcional de oído',
            steps: [
              {
                label: 'Ear Spark: name the bass string', label_es: 'Chispa auditiva: nombra el bajo',
                text: '⚡ Ear Spark (optional, 2 min):<ol><li>Press play below — the deck draws a random mix of Am\'s A-string and D-string bass notes and plays them for you, and you never see which.</li><li>Name each one by ear before you check: A string is Am\'s root (low), D string is the passing bass a step higher — low vs. high bass is a fingerpicker\'s first ear skill.</li></ol>',
                text_es: '⚡ Chispa auditiva (opcional, 2 min):<ol><li>Presiona reproducir abajo — la baraja saca una mezcla al azar de notas graves de Am en la cuerda La y en la cuerda Re, y las toca por ti, sin que veas cuáles son.</li><li>Nombra cada una de oído antes de revisar: la cuerda La es la raíz de Am (grave), la cuerda Re es el bajo de paso, un poco más agudo — grave vs. agudo en el bajo es la primera destreza auditiva de un fingerpicker.</li></ol>',
                drill: { type: 'ear', pool: 'amBassAD', draw: 5, skill: 'm8w2-s6' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Plays p-i-m-a-m-i pattern cleanly over one chord · Even volume across all fingers · Pattern stays steady at 70 BPM · Adapts to a different chord by moving only the thumb',
      goal_es: 'Toca el patrón p-i-m-a-m-i de forma limpia sobre un acorde · Volumen parejo en todos los dedos · El patrón se mantiene estable a 70 BPM · Se adapta a un acorde distinto moviendo solo el pulgar',
      performance: 'Play the 6-note pattern over Em at 70 BPM, then try 80. Record yourself and listen back for even volume on every finger, especially the "a" finger landing right on its beat.',
      selfCheck: 'Can you play 8 bars of the pattern without losing your place? Can you switch from Em to Am bass without breaking the picking?',
      selfCheck_es: '¿Puedes tocar 8 compases del patrón sin perder tu lugar? ¿Puedes cambiar del bajo de Em al de Am sin romper el punteo?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
    },

    skills: [
      { id: 'm8w2-s1', text: 'Play the 6-note p-i-m-a-m-i pattern in order from memory',
        text_es: 'Tocar el patrón de 6 notas p-i-m-a-m-i en orden de memoria',
        gotItWhen: 'you can play the sequence p-i-m-a-m-i on open strings (or one chord) at 60 BPM without having to think about which finger comes next.',
        gotItWhen_es: 'puedes tocar la secuencia p-i-m-a-m-i en cuerdas al aire (o un acorde) a 60 BPM sin tener que pensar cuál dedo sigue.',
        practice: { type: 'mc', prompt: 'In the "p-i-m-a-m-i" pattern, which two fingers each play TWICE per bar?',
          prompt_es: 'En el patrón "p-i-m-a-m-i", ¿cuáles dos dedos tocan DOS VECES cada uno por compás?',
          choices: ['p and a', 'i and m', 'p and i', 'm and a'],
          choices_es: ['p y a', 'i y m', 'p e i', 'm y a'], answer: 1,
          explain: 'The pattern climbs p-i-m-a and comes back down m-i, so i and m get played on the way up and again on the way home. p and a sit at the two ends and play once each.',
          explain_es: 'El patrón sube p-i-m-a y vuelve a bajar m-i, así que i y m se tocan a la ida y otra vez a la vuelta. p y a están en los dos extremos y tocan una sola vez cada uno.' } },
      { id: 'm8w2-s2', text: 'Pluck with even volume across all four fingers',
        text_es: 'Pulsar con volumen parejo en los cuatro dedos',
        gotItWhen: 'when you listen back to your picking, no single finger is noticeably louder or quieter than the others — including the ring finger (a), which is hardest.',
        gotItWhen_es: 'cuando escuchas tu punteo grabado, ningún dedo suena notablemente más fuerte o más suave que los demás — incluyendo el dedo anular (a), que es el más difícil.',
        practice: { type: 'mc', prompt: 'Which finger is usually the WEAKEST at first and needs extra practice?',
          prompt_es: '¿Cuál dedo suele ser el MÁS DÉBIL al principio y necesita práctica extra?',
          choices: ['p (thumb)', 'i (index)', 'm (middle)', 'a (ring)'],
          choices_es: ['p (pulgar)', 'i (índice)', 'm (medio)', 'a (anular)'], answer: 3,
          explain: 'The ring finger (a) shares tendons with the middle finger and does almost nothing in daily life, so it starts out weak and quiet. Without extra reps, the high e string always sounds thinner than the rest.',
          explain_es: 'El dedo anular (a) comparte tendones con el medio y casi no hace nada en la vida diaria, así que empieza débil y suena flojo. Sin repeticiones extra, la cuerda mi aguda siempre suena más delgada que las demás.' } },
      { id: 'm8w2-s3', text: 'Hold an Em chord while picking through it cleanly',
        text_es: 'Mantener un acorde Em mientras lo punteas de forma limpia',
        gotItWhen: 'your fretting hand stays planted on Em the entire bar while your picking hand cycles through the pattern — and every note rings clearly.',
        gotItWhen_es: 'tu mano de trastear se queda plantada en Em durante todo el compás mientras tu mano de pulsar recorre el patrón — y cada nota suena con claridad.',
        practice: { type: 'playSeq', label: 'Em arpeggio p-i-m-a-m-i', label_es: 'Arpegio de Em p-i-m-a-m-i', bpm: 60,
          notes: [40, 55, 59, 64, 59, 55] } },
      { id: 'm8w2-s4', text: 'Play the pattern over Am (thumb on A string)',
        text_es: 'Tocar el patrón sobre Am (pulgar en la cuerda La)',
        gotItWhen: 'you can switch your THUMB from low E to A string when the chord changes Em → Am, while i-m-a stay on G-B-e the whole time.',
        gotItWhen_es: 'puedes cambiar tu PULGAR de la Mi grave a la cuerda La cuando el acorde cambia de Em → Am, mientras i-m-a se quedan en Sol, Si y mi aguda todo el tiempo.',
        practice: { type: 'playSeq', label: 'Am arpeggio p-i-m-a-m-i', label_es: 'Arpegio de Am p-i-m-a-m-i', bpm: 60,
          notes: [45, 57, 60, 64, 60, 57] } },
      { id: 'm8w2-s5', text: 'Keep the pattern steady at 70 BPM for 4+ bars',
        text_es: 'Mantener el patrón estable a 70 BPM durante 4 o más compases',
        gotItWhen: 'you can play the pattern for at least 4 bars at 70 BPM without your tempo slowing down or speeding up — the metronome and you agree the whole time.',
        gotItWhen_es: 'puedes tocar el patrón durante al menos 4 compases a 70 BPM sin que tu tempo se atrase ni se acelere — el metrónomo y tú están de acuerdo todo el tiempo.',
        practice: { type: 'pr', prompt: '<ol><li>Keep the p-i-m-a-m-i pattern going for 4 bars straight with the metronome.</li><li>Start at 60 BPM and raise it +5 at a time.</li><li>Log the fastest BPM where the tempo never wavered.</li></ol>',
          prompt_es: '<ol><li>Mantén el patrón p-i-m-a-m-i durante 4 compases seguidos con el metrónomo.</li><li>Empieza a 60 BPM y súbelo de 5 en 5.</li><li>Anota el BPM más rápido donde el tempo nunca vaciló.</li></ol>',
          unit: 'BPM', placeholder: 'e.g. 70 — try for a higher number next session', placeholder_es: 'p. ej. 70 — intenta superarlo la próxima sesión' } },
      { id: 'm8w2-s6', text: 'Switch the thumb to a new bass string at a chord change',
        text_es: 'Cambiar el pulgar a una nueva cuerda grave en un cambio de acorde',
        gotItWhen: 'at a chord change, only your thumb moves to find the new root note — i-m-a stay parked on G, B, high e. The pattern continues uninterrupted.',
        gotItWhen_es: 'en un cambio de acorde, solo tu pulgar se mueve para encontrar la nueva nota raíz — i-m-a se quedan estacionados en Sol, Si y mi aguda. El patrón continúa sin interrupciones.',
        practice: { type: 'mc', prompt: 'You\'re fingerpicking and the chord changes Em → Am. What changes for your PICKING hand?',
          prompt_es: 'Estás tocando fingerpicking y el acorde cambia de Em → Am. ¿Qué cambia para tu mano de PUNTEO?',
          choices: ['Only the thumb — it moves from the low E string to the A string; i-m-a stay put', 'All four fingers shift up one string', 'Nothing at all, ever', 'i-m-a move to new strings; the thumb stays'],
          choices_es: ['Solo el pulgar — se mueve de la cuerda Mi grave a la cuerda La; i-m-a se quedan en su lugar', 'Los cuatro dedos suben una cuerda', 'Nada en absoluto, nunca', 'i-m-a se mueven a cuerdas nuevas; el pulgar se queda'], answer: 0,
          explain: 'The thumb hunts the new root; i-m-a stay parked on G, B, and high e. Moving everything is what breaks the pattern at changes.',
          explain_es: 'El pulgar busca la nueva raíz; i-m-a se quedan estacionados en Sol, Si y mi aguda. Mover todo es lo que rompe el patrón en los cambios.' } }
    ]
  },

  {
    id: 'm8w3',
    songThread: [{ name: '"Let It Be"', journey: 'tabs/let-it-be.html', note: 'the fingerpicked arrangement' }],
    label: 'Set 3',
    locked: false,
    module: 'Finger Picking',
    moduleNum: 8,
    unit: 'Module 8 · Finger Picking',
    unit_es: 'Módulo 8 · Fingerpicking',
    title: 'Set 3',
    subtitle: 'Fingerpick a full progression · Travis picking intro · Performance song',
    subtitle_es: 'Fingerpicking sobre una progresión completa · Introducción al Travis picking · Canción de interpretación',
    skillFocus: 'Fingerpicking through a chord progression · An intro to Travis picking · Performing a fingerpicked song',
    skillFocus_es: 'Tocar con fingerpicking a través de una progresión de acordes · Una introducción al Travis picking · Interpretar una canción con fingerpicking',
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
            label: 'Watch: Travis picking basics', label_es: 'Mira: fundamentos del Travis picking',
            text: 'Watch: <a href="https://www.youtube.com/watch?v=JvtFd7vkea0" target="_blank">How To Travis Pick on Guitar – Lauren Bateman (0:00–5:00)</a>. As you watch, tap the alternating thumb on your knee — bass on 1, the other bass on 3 — before you ever add the fingers.',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=JvtFd7vkea0" target="_blank">How To Travis Pick on Guitar – Lauren Bateman (0:00–5:00)</a>. Mientras miras, marca el pulgar alternante en tu rodilla — bajo en el 1, el otro bajo en el 3 — antes de siquiera agregar los dedos.',
            hint: 'Travis picking uses an ALTERNATING thumb: bass note on beat 1, a different bass note on beat 3. The fingers fill in between. It\'s the foundation of country, folk, and a lot of pop.',
            hint_es: 'El Travis picking usa un pulgar ALTERNANTE: nota grave en el tiempo 1, una nota grave distinta en el tiempo 3. Los dedos rellenan en el medio. Es la base del country, el folk y mucho pop.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'In Travis picking, what does the THUMB do?',
              prompt_es: 'En el Travis picking, ¿qué hace el PULGAR?',
              answer: 1,
              explain: 'The Travis "engine" is the thumb alternating between two bass strings (usually the root and the 5th) in steady time, while the fingers add melody on top.',
              explain_es: 'El "motor" del Travis picking es el pulgar alternando entre dos cuerdas graves (normalmente la raíz y la quinta) en tiempo constante, mientras los dedos agregan melodía encima.',
              choices: [
              'Plays the same bass note over and over',
              'Alternates between two bass notes — usually the root and the 5th',
              'Doesn\'t play at all',
              'Plays the melody'
            ],
              choices_es: [
              'Toca la misma nota grave una y otra vez',
              'Alterna entre dos notas graves — normalmente la raíz y la quinta',
              'No toca en absoluto',
              'Toca la melodía'
            ] }
          },
          {
            label: 'Watch: "Nothing Else Matters" lesson', label_es: 'Mira: lección de "Nothing Else Matters"',
            text: 'Watch: <a href="https://youtu.be/7silbMA9UME" target="_blank">Nothing Else Matters Guitar Lesson Part 1 – Marty Music</a> (0:00–4:00). Watch one chord change closely — notice when his fretting hand starts moving toward the next shape.',
            text_es: 'Mira: <a href="https://youtu.be/7silbMA9UME" target="_blank">Nothing Else Matters Guitar Lesson Part 1 – Marty Music</a> (0:00–4:00). Observa de cerca un cambio de acorde — fíjate cuándo su mano de trastear empieza a moverse hacia la siguiente forma.',
            hint: 'The hardest part: keeping the picking pattern PERFECTLY STEADY through a chord change. Anticipate the next chord — start moving your fretting hand on the LAST note of the current bar.',
            hint_es: 'La parte más difícil: mantener el patrón de punteo PERFECTAMENTE CONSTANTE a través de un cambio de acorde. Anticipa el siguiente acorde — empieza a mover tu mano de trastear en la ÚLTIMA nota del compás actual.',
            skills: [3, 4],
            response: { type: 'short', placeholder: 'When you fingerpick from Am to C, when (which note in the bar) does your fretting hand start preparing for the next chord?',
              placeholder_es: 'Cuando tocas con fingerpicking de Am a C, ¿cuándo (en cuál nota del compás) empieza tu mano de trastear a prepararse para el siguiente acorde?' }
          }
            ]
          },
          {
            title: 'Listen through a full verse',
            title_es: 'Escucha una estrofa completa',
            steps: [
          {
            label: 'Listen: a full fingerpicked verse', label_es: 'Escucha: una estrofa completa',
            text: 'Listen to one of: "House of the Rising Sun", "Dust in the Wind", or "Hallelujah". Listen to a full verse. Can you hear when the chord changes? Does the pattern ever break?',
            text_es: 'Escucha una de estas: "House of the Rising Sun", "Dust in the Wind", o "Hallelujah". Escucha una estrofa completa. ¿Puedes escuchar cuándo cambia el acorde? ¿El patrón se rompe en algún momento?',
            hint: 'In professional recordings the pattern almost never breaks at a chord change — that\'s your standard. It\'s a high bar but worth aiming for.',
            hint_es: 'En las grabaciones profesionales el patrón casi nunca se rompe en un cambio de acorde — ese es tu estándar. Es una meta alta pero vale la pena perseguirla.',
            skills: [4, 5],
            response: { type: 'short', placeholder: 'Which song did you listen to? Did the picking pattern stay completely steady through every chord change?',
              placeholder_es: '¿Cuál canción escuchaste? ¿El patrón de punteo se mantuvo completamente estable en cada cambio de acorde?' }
          }
            ]
          },
          {
            title: 'Try the arpeggio on C',
            title_es: 'Prueba el arpegio en C',
            steps: [
          {
            label: 'Try it: the arpeggio on C', label_es: 'Pruébalo: el arpegio en C',
            text: 'Now try it: fret C and play the 6-note arpeggio over it:<ol><li>Click any note below the TAB to hear it.</li><li>Then play the staircase — thumb on the A string\'s 3rd fret (C\'s root), i-m-a on G-B-e, then back down m-i.</li></ol>',
            text_es: 'Ahora pruébalo: trastea C y toca el arpegio de 6 notas sobre él:<ol><li>Haz clic en cualquier nota debajo del TAB para escucharla.</li><li>Luego toca la escalera — pulgar en el traste 3 de la cuerda La (la raíz de C), i-m-a en Sol, Si y mi aguda, y luego de vuelta hacia abajo m-i.</li></ol>',
            hint: 'C uses the same picking pattern as Em and Am — only the thumb\'s bass note changes. Read the TAB left to right and match each pluck.',
            hint_es: 'C usa el mismo patrón de punteo que Em y Am — solo cambia la nota grave del pulgar. Lee el TAB de izquierda a derecha y haz coincidir cada pulsación.',
            skills: [1, 3, 4],
            tab: {
              caption: 'C arpeggio · p-i-m-a-m-i · thumb on the A string (3rd fret)',
              caption_es: 'Arpegio de C · p-i-m-a-m-i · pulgar en la cuerda La (traste 3)',
              notes: [
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'G', fret: 0, note: 'G', midi: 55 },
                { string: 'B', fret: 1, note: 'C', midi: 60 },
                { string: 'e', fret: 0, note: 'E', midi: 64 },
                { string: 'B', fret: 1, note: 'C', midi: 60 },
                { string: 'G', fret: 0, note: 'G', midi: 55 }
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
            label: 'Wrap-up: pattern or chord changes?', label_es: 'Cierre: ¿patrón o cambios?',
            text: 'Station Wrap-Up — pause and think: across the whole module, which is harder for you — keeping the picking pattern steady, or changing chords cleanly underneath it? What\'s your plan for the harder one?',
            text_es: 'Cierre de la estación — pausa y piensa: a lo largo de todo el módulo, ¿qué se te hace más difícil — mantener el patrón de punteo estable, o cambiar de acorde limpiamente debajo de él? ¿Cuál es tu plan para lo más difícil?',
            response: { type: 'short', placeholder: 'e.g. chord changes break my pattern — I\'ll practice moving the fretting hand a beat early',
              placeholder_es: 'p. ej. los cambios de acorde rompen mi patrón — voy a practicar mover la mano de trastear un tiempo antes' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — full progressions & performance',
        title_es: 'Estación de práctica — progresiones completas e interpretación',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tuning check', label_es: 'Calentamiento: afinación',
                text: 'Start every practice session the same way:<ol><li>Tune all 6 strings to green (E A D G B e).</li><li>Then play each string open.</li></ol>You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera:<ol><li>Afina las 6 cuerdas hasta que estén en verde (E A D G B e).</li><li>Luego toca cada cuerda al aire.</li></ol>Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                hint: 'You\'re about to fingerpick full progressions and a whole song — an out-of-tune string will stick out through all of it, so check first.',
                hint_es: 'Estás a punto de tocar con fingerpicking progresiones completas y una canción entera — una cuerda desafinada se va a notar durante todo el recorrido, así que revisa primero.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Fret each chord clean before you fingerpick it',
            title_es: 'Trastea cada acorde limpio antes de tocarlo con fingerpicking',
            steps: [
          {
            label: 'Challenge 1 — Clean Shapes First', label_es: 'Reto 1 — Formas limpias primero',
            text: 'Before you fingerpick the progression:<ol><li>Strum each chord once (Am, C, D, F).</li><li>Check every string rings — these are the exact open chords you learned in Module 5.</li></ol>You\'ve got it when: all four shapes clean on a strum before you pick a single note through them.',
            text_es: 'Antes de tocar la progresión con fingerpicking:<ol><li>Rasguea cada acorde una vez (Am, C, D, F).</li><li>Revisa que suenen todas las cuerdas — estos son exactamente los acordes al aire que aprendiste en el Módulo 5.</li></ol>Lo tienes cuando: las cuatro formas suenan limpias con un rasgueo antes de puntear una sola nota a través de ellas.',
            hint: 'Fingerpicking exposes every note, so a chord that was "good enough" for strumming in Module 5 needs to be truly clean here. Fix the fretting hand first; then the picking hand has something solid to work over.',
            hint_es: 'El fingerpicking expone cada nota, así que un acorde que era "suficientemente bueno" para rasguear en el Módulo 5 necesita estar de verdad limpio aquí. Arregla primero la mano de trastear; luego la mano de pulsar tiene algo sólido con qué trabajar.',
            stuck: 'Whichever shape buzzes, fix just that one — adjust your finger angle so the fingertip (not the pad) presses just behind the fret.',
            stuck_es: 'La forma que zumbe, arregla solo esa — ajusta el ángulo de tu dedo para que la punta (no la yema plana) presione justo detrás del traste.',
            levelUp: 'Fret each shape, lift off, and re-fret it cleanly 5 times in a row before moving to the next chord.',
            levelUp_es: 'Trastea cada forma, levanta los dedos, y vuelve a trastearla limpia 5 veces seguidas antes de pasar al siguiente acorde.',
            skills: [1]
          }
            ]
          },
          {
            title: 'Fingerpick a full chord progression',
            title_es: 'Toca con fingerpicking una progresión de acordes completa',
            steps: [
          {
            label: 'Challenge 2 — Full Progression', label_es: 'Reto 2 — Progresión completa',
            text: 'These progressions are in 4/4 — four beats a bar — so use the eight-note stretch, p-i-m-a-m-i-m-i, two notes per beat:<ul><li>Play it over a 4-chord progression — Am–C–D–F or C–Am–F–G — 1 bar each at 60 BPM.</li></ul>You\'ve got it when: the thumb finds each chord\'s root bass while the fingers stay on G-B-e.',
            text_es: 'Estas progresiones están en 4/4 — cuatro tiempos por compás — así que usa el estiramiento de ocho notas, p-i-m-a-m-i-m-i, dos notas por tiempo:<ul><li>Tócalo sobre una progresión de 4 acordes — Am–C–D–F o C–Am–F–G — 1 compás cada uno a 60 BPM.</li></ul>Lo tienes cuando: el pulgar encuentra el bajo raíz de cada acorde mientras los dedos se quedan en Sol, Si y mi aguda.',
            hint: 'The six-note pattern is a 6/8 pattern — it does not divide evenly into a 4/4 bar, which is why it stretches to eight here. Too many? Use the four-note p-i-m-a from Set 1, one note per beat. For each chord, the thumb plays the ROOT bass note (Am = A string, C = A string, D = D string, F = D string). Fingers always on G-B-e.',
            hint_es: 'El patrón de seis notas es un patrón de 6/8 — no se divide parejo en un compás de 4/4, por eso aquí se estira a ocho. ¿Son demasiadas? Usa el p-i-m-a de cuatro notas de la Unidad 1, una nota por tiempo. Para cada acorde, el pulgar toca la nota grave RAÍZ (Am = cuerda La, C = cuerda La, D = cuerda Re, F = cuerda Re). Los dedos siempre en Sol, Si y mi aguda.',
            stuck: 'Drop to two chords (Am–C) and loop just that change until the pattern doesn\'t break, then add D and F.',
            stuck_es: 'Baja a dos acordes (Am–C) y repite solo ese cambio hasta que el patrón no se rompa, y luego agrega D y F.',
            levelUp: 'Run the full four-chord loop without a single broken pattern, or nudge the metronome to 70 BPM.',
            levelUp_es: 'Corre el loop completo de cuatro acordes sin un solo patrón roto, o empuja el metrónomo a 70 BPM.',
            skills: [1, 3, 4],
            playSeq: { label: 'Am · C · D · F bass roots', label_es: 'Raíces graves Am · C · D · F', bpm: 60,
              notes: [45, 48, 50, 53] },
            response: { type: 'short', prompt: 'Personal record: play it cleanly at 60 BPM, then raise the metronome +10 at a time. Your fastest CLEAN lap of the progression today (BPM)?', prompt_es: 'Récord personal: tócalo limpio a 60 BPM, y luego sube el metrónomo de 10 en 10. ¿Tu vuelta más rápida y LIMPIA de la progresión hoy (BPM)?', placeholder: 'e.g. 75 — try for a higher number next time', placeholder_es: 'p. ej. 75 — intenta superarlo la próxima vez' }
          }
            ]
          },
          {
            title: 'Pinch the thumb and a finger together',
            title_es: 'Pellizca el pulgar y un dedo juntos',
            steps: [
          {
            label: 'Challenge 3 — The Pinch', label_es: 'Reto 3 — El pellizco',
            text: '<ol><li>Fret C.</li><li>"Pinch" two strings at once — thumb on the A string (root) and your "a" finger on the high e, plucked at the SAME instant, on each beat for 8 beats.</li></ol>You\'ve got it when: both notes sound together as one, perfectly in sync — not one slightly before the other.',
            text_es: '<ol><li>Trastea C.</li><li>"Pellizca" dos cuerdas a la vez — pulgar en la cuerda La (raíz) y tu dedo "a" en la mi aguda, pulsadas en el MISMO instante, en cada tiempo durante 8 tiempos.</li></ol>Lo tienes cuando: ambas notas suenan juntas como una sola, perfectamente sincronizadas — no una ligeramente antes que la otra.',
            hint: 'A pinch is the bridge between arpeggios and Travis picking — thumb and finger move toward each other and meet. Listen for ONE sound, not a flam (two close hits).',
            hint_es: 'Un pellizco es el puente entre los arpegios y el Travis picking — el pulgar y el dedo se mueven uno hacia el otro y se encuentran. Escucha UN solo sonido, no un "flam" (dos golpes muy cercanos).',
            stuck: 'Pluck the bass and the treble separately first, slowly, then bring them closer until they land together.',
            stuck_es: 'Pulsa el bajo y la aguda por separado primero, despacio, y luego acércalos hasta que caigan juntos.',
            levelUp: 'Pinch on beats 1 & 3 and fill beats 2 & 4 with a single i-pluck on the B string — that\'s the Travis groove (its steady rhythmic feel) starting to form.',
            levelUp_es: 'Pellizca en los tiempos 1 y 3 y rellena los tiempos 2 y 4 con una sola pulsación de i en la cuerda Si — así empieza a formarse el groove del Travis picking (su sensación rítmica constante).',
            skills: [2, 4]
          }
            ]
          },
          {
            title: 'Try Travis picking',
            title_es: 'Prueba el Travis picking',
            steps: [
          {
            label: 'Challenge 4 — Travis Thumb', label_es: 'Reto 4 — Pulgar Travis',
            text: '<ol><li>Change your C shape first: add your PINKY on string 6, fret 3. The open C from Module 5 mutes the low E, so there is no bass note down there to alternate to — this four-finger version is called the "Travis C".</li><li>Warm up Travis picking on it — thumb alternating the A string, root C (beats 1 & 3) and the low E string, fret 3 = G, the 5th (beats 2 & 4), thumb-only at 60 BPM.</li></ol>That\'s the "root and the 5th" alternating bass from the intro video — both bass strings, no fingers yet. You\'ve got it when: a steady, even alternating thumb — then add an i-pluck on the B string on each "+".',
            text_es: '<ol><li>Primero cambia tu forma de C: agrega tu MEÑIQUE en la cuerda 6, traste 3. El C al aire del Módulo 5 silencia la Mi grave, así que ahí abajo no hay ninguna nota grave con la cual alternar — esta versión de cuatro dedos se llama el "C de Travis".</li><li>Calienta el Travis picking sobre ella — pulgar alternando entre la cuerda La, raíz C (tiempos 1 y 3) y la cuerda Mi grave, traste 3 = G, la 5ª (tiempos 2 y 4), solo el pulgar a 60 BPM.</li></ol>Ese es el bajo alternante de "raíz y la 5ª" del video introductorio — ambas cuerdas graves, todavía sin dedos. Lo tienes cuando: un pulgar alternante constante y parejo — y luego agrega una pulsación de i en la cuerda Si en cada "+".',
            hint: 'The pinky and the ring finger end up on the same fret, one string apart — string 6 and string 5, both at fret 3. Then it is just the thumb! Once that\'s steady, add an i-pluck on the B string on the "+" of each beat. Travis picking adds fingers ON TOP of an already-grooving thumb.',
            hint_es: 'El meñique y el anular terminan en el mismo traste, a una cuerda de distancia — la cuerda 6 y la cuerda 5, las dos en el traste 3. Y después es solo el pulgar. Una vez que esté estable, agrega una pulsación de i en la cuerda Si en el "+" de cada tiempo. El Travis picking agrega dedos ENCIMA de un pulgar que ya tiene groove.',
            stuck: 'If the pinky won\'t reach string 6 yet, keep the plain open C and alternate the A string (root C) with the D string (fret 2, the note E) instead — a lighter bass, but the same alternating motion. Thumb only, no fingers, as slow as you need — get the alternating bass rock-steady before adding anything on top.',
            stuck_es: 'Si el meñique todavía no alcanza la cuerda 6, quédate con el C al aire normal y alterna la cuerda La (raíz C) con la cuerda Re (traste 2, la nota E) — un bajo más ligero, pero el mismo movimiento alternante. Solo el pulgar, sin dedos, tan despacio como necesites — logra que el bajo alternante sea firme como una roca antes de agregar algo encima.',
            levelUp: 'Add the i-pluck on every "+", or carry the alternating thumb through a C → Am change without it stumbling.',
            levelUp_es: 'Agrega la pulsación de i en cada "+", o lleva el pulgar alternante a través de un cambio C → Am sin que tropiece.',
            skills: [2, 5],
            chords: [
              { name: 'Travis C', chord: [[6,3,'4'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Let It Be", fingerpicked', label_es: 'Reto — "Let It Be", con fingerpicking',
                text: '"Let It Be" is in 4/4, so use the eight-note stretch — p-i-m-a-m-i-m-i, two notes per beat — not the six-note 6/8 version:<ul><li>Play the four-chord verse — C · G · Am · F — one bar each at 60 BPM.</li><li>Thumb root: C and Am on the A string.</li><li>Thumb root: G on the low E.</li><li>Thumb root: F on the D string.</li></ul>You\'ve got it when: a full verse with the pattern unbroken — the same song you strummed in Modules 5 and 6, now a lullaby. <a href="tabs/let-it-be.html" target="_blank">&#x1F9F5; Song Journey: the fingerstyle arrangement</a>.',
                text_es: '"Let It Be" está en 4/4, así que usa el estiramiento de ocho notas — p-i-m-a-m-i-m-i, dos notas por tiempo — no la versión de seis notas en 6/8:<ul><li>Toca la estrofa de cuatro acordes — C · G · Am · F — un compás cada uno a 60 BPM.</li><li>Raíz del pulgar: C y Am en la cuerda La.</li><li>Raíz del pulgar: G en la Mi grave.</li><li>Raíz del pulgar: F en la cuerda Re.</li></ul>Lo tienes cuando: una estrofa completa con el patrón sin interrupciones — la misma canción que rasgueaste en los Módulos 5 y 6, ahora una canción de cuna. <a href="tabs/let-it-be.html" target="_blank">&#x1F9F5; Recorrido de la canción: el arreglo fingerstyle</a>.',
                hint: 'Eight notes still too many? Play Set 1\'s four-note p-i-m-a, one note per beat — four notes fill a 4/4 bar exactly. Either size, anticipate like the second lesson video showed you: the fretting hand starts moving on the pattern\'s last note, so beat 1 always lands ready.',
                hint_es: '¿Ocho notas siguen siendo demasiadas? Toca el p-i-m-a de cuatro notas de la Unidad 1, una nota por tiempo — cuatro notas llenan un compás de 4/4 exactamente. Con cualquiera de los dos tamaños, anticipa como te mostró el segundo video de la lección: la mano de trastear empieza a moverse en la última nota del patrón, así que el tiempo 1 siempre cae listo.',
                stuck: 'Strum each chord once to check it rings, then loop just C → G — the only change where the thumb crosses to the low E.',
                stuck_es: 'Rasguea cada acorde una vez para revisar que suene, y luego repite solo C → G — el único cambio donde el pulgar cruza hacia la Mi grave.',
                levelUp: 'Add a pinch (p + a together) on beat 1 of each chord and hear the verse bloom, or sing it over your own picking.',
                levelUp_es: 'Agrega un pellizco (p + a juntos) en el tiempo 1 de cada acorde y escucha cómo florece la estrofa, o cántala sobre tu propio punteo.',
                skills: [1, 3],
                tab: {
                  caption: '"Let It Be" — fingerstyle bass roots · C · G · Am · F · one bar each · 60 BPM',
                  caption_es: '"Let It Be" — raíces graves de fingerstyle · C · G · Am · F · un compás cada uno · 60 BPM',
                  notes: [
                    { string: 'A', fret: 3, note: 'C', midi: 48 },
                    { string: 'A', fret: 3, note: 'C', midi: 48 },
                    { string: 'A', fret: 3, note: 'C', midi: 48 },
                    { string: 'A', fret: 3, note: 'C', midi: 48 },
                    { string: 'E', fret: 3, note: 'G', midi: 43 },
                    { string: 'E', fret: 3, note: 'G', midi: 43 },
                    { string: 'E', fret: 3, note: 'G', midi: 43 },
                    { string: 'E', fret: 3, note: 'G', midi: 43 },
                    { string: 'A', fret: 0, note: 'A', midi: 45 },
                    { string: 'A', fret: 0, note: 'A', midi: 45 },
                    { string: 'A', fret: 0, note: 'A', midi: 45 },
                    { string: 'A', fret: 0, note: 'A', midi: 45 },
                    { string: 'D', fret: 3, note: 'F', midi: 53 },
                    { string: 'D', fret: 3, note: 'F', midi: 53 },
                    { string: 'D', fret: 3, note: 'F', midi: 53 },
                    { string: 'D', fret: 3, note: 'F', midi: 53 }
                  ]
                }
              }
            ]
          },
          {
            title: 'Perform a fingerpicked song',
            title_es: 'Interpreta una canción con fingerpicking',
            steps: [
          {
            label: 'Challenge 5 — Perform It (your assessment piece — try it!)', label_es: 'Reto 5 — Interprétala (tu pieza de evaluación — ¡pruébalo!)',
            text: '<ol><li>Pick one song — "the cure", "Hallelujah" (from Module 5\'s song list), "Let It Be" (verse), or a choice-list song.</li><li>Play it through 3 times without stopping, even with mistakes.</li></ol>No score — practice the recovery; keep going no matter what.',
            text_es: '<ol><li>Elige una canción — "the cure", "Hallelujah" (de la lista de canciones del Módulo 5), "Let It Be" (estrofa), o una canción de la lista de elección.</li><li>Tócala completa 3 veces sin detenerte, incluso con errores.</li></ol>Sin puntaje — practica la recuperación; sigue adelante pase lo que pase.',
            hint: 'Mistakes are normal — stopping is what makes them sound bad, so keep going and practice the recovery. No one to play for? Record yourself on your phone or device and watch it back — the playback shows you exactly where the pattern broke.',
            hint_es: 'Los errores son normales — detenerte es lo que los hace sonar mal, así que sigue adelante y practica la recuperación. ¿No tienes a nadie para quien tocar? Grábate en tu teléfono o dispositivo y vuelve a verlo — la grabación te muestra exactamente dónde se rompió el patrón.',
            stuck: 'Pick the shortest, slowest song you know (Hallelujah is forgiving) and play just the verse — finishing matters more than difficulty.',
            stuck_es: 'Elige la canción más corta y lenta que conozcas (Hallelujah es indulgente) y toca solo la estrofa — terminar importa más que la dificultad.',
            levelUp: 'Perform standing up, or play it for family or a friend and keep going through any mistake.',
            levelUp_es: 'Interprétala de pie, o tócala para tu familia o un amigo y sigue adelante a través de cualquier error.',
            skills: [4, 5, 6]
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: halfway-point reflection', label_es: 'Cierre: reflexión de medio curso',
                text: 'You\'ve reached the end of the first half of the course — what fingerpicking skill are you proudest of, and what\'s the one song you want to keep working on after this module? Write it below.',
                text_es: 'Has llegado al final de la primera mitad del curso — ¿de cuál destreza de fingerpicking estás más orgulloso, y cuál es la única canción que quieres seguir trabajando después de este módulo? Escríbelo abajo.',
                response: { type: 'short', placeholder: 'e.g. proud of clean arpeggios; want to keep working on "Blackbird"',
                  placeholder_es: 'p. ej. orgulloso de mis arpegios limpios; quiero seguir trabajando en "Blackbird"' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Fingerpicks through a full 4-chord progression · Pattern stays steady through chord changes · Demonstrates Travis picking (alternating bass thumb) · Performs one full fingerpicked song from start to finish',
      goal_es: 'Toca con fingerpicking una progresión completa de 4 acordes · El patrón se mantiene estable a través de los cambios de acorde · Demuestra Travis picking (pulgar de bajo alternante) · Interpreta una canción completa con fingerpicking de principio a fin',
      performance: 'Perform one full song — from this module\'s song list or another fingerpicked song you know (like "Hallelujah" from Module 5) — using fingerpicking from start to finish, for family, a friend, or a recording you share. Listen back for pattern consistency, chord changes, and timing.',
      selfCheck: 'Can you play a 4-chord song with fingerpicking and not break the pattern at any chord change? Can your thumb alternate between two bass strings for 4 bars without confusion?',
      selfCheck_es: '¿Puedes tocar una canción de 4 acordes con fingerpicking sin romper el patrón en ningún cambio de acorde? ¿Puede tu pulgar alternar entre dos cuerdas graves durante 4 compases sin confundirse?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
    },

    skills: [
      { id: 'm8w3-s1', text: 'Fingerpick a 4-chord progression with the pattern unbroken',
        text_es: 'Tocar con fingerpicking una progresión de 4 acordes con el patrón sin interrupciones',
        gotItWhen: 'you can play Am–C–D–F (or another 4-chord progression) with the 6-note arpeggio over each chord, and the pattern never breaks at a chord change.',
        gotItWhen_es: 'puedes tocar Am–C–D–F (u otra progresión de 4 acordes) con el arpegio de 6 notas sobre cada acorde, y el patrón nunca se rompe en un cambio de acorde.',
        practice: { type: 'playSeq', label: 'Am · C · D · F bass roots', label_es: 'Raíces graves Am · C · D · F', bpm: 60,
          notes: [45, 48, 50, 53] } },
      { id: 'm8w3-s2', text: 'Demonstrate Travis picking — thumb alternates between two bass strings',
        text_es: 'Demostrar el Travis picking — el pulgar alterna entre dos cuerdas graves',
        gotItWhen: 'your thumb plays the root of the chord on beats 1 and 3, and a different bass string on beats 2 and 4 — steadily, for at least 4 bars.',
        gotItWhen_es: 'tu pulgar toca la raíz del acorde en los tiempos 1 y 3, y una cuerda grave distinta en los tiempos 2 y 4 — de forma constante, durante al menos 4 compases.',
        practice: { type: 'mc', prompt: 'In Travis picking on a C major chord, your thumb might alternate between which two strings?',
          prompt_es: 'En el Travis picking sobre un acorde de C mayor, ¿tu pulgar podría alternar entre cuáles dos cuerdas?',
          choices: ['B string and high e', 'A string (root C) and low E string (the 5th, G)', 'High e and G string', 'Low E and high e'],
          choices_es: ['La cuerda Si y la mi aguda', 'La cuerda La (raíz de C) y la cuerda Mi grave (la 5ª, G)', 'La mi aguda y la cuerda Sol', 'La Mi grave y la mi aguda'], answer: 1,
          explain: 'Travis picking alternates the thumb between two BASS strings — on C, the root C on the A string and the G under it on the low E string. Any answer with treble strings is wrong: those belong to i, m and a.',
          explain_es: 'El Travis picking alterna el pulgar entre dos cuerdas GRAVES — en C, la raíz C en la cuerda La y el G debajo en la cuerda Mi grave. Cualquier respuesta con cuerdas agudas está mal: esas les pertenecen a i, m y a.' } },
      { id: 'm8w3-s3', text: 'Keep the picking pattern steady through a chord change',
        text_es: 'Mantener el patrón de punteo estable a través de un cambio de acorde',
        gotItWhen: 'when the chord changes mid-song, you don\'t miss a single note in the picking pattern — the fretting hand catches up, but the picking pattern stays exact.',
        gotItWhen_es: 'cuando el acorde cambia a mitad de la canción, no te pierdes ni una sola nota del patrón de punteo — la mano de trastear se pone al día, pero el patrón de punteo se mantiene exacto.',
        practice: { type: 'pr', prompt: '<ol><li>One minute: fingerpick your pattern over Em ↔ Am, changing every bar.</li><li>Count the changes where the pattern never missed a note.</li><li>Log your best.</li></ol>',
          prompt_es: '<ol><li>Un minuto: toca tu patrón de fingerpicking sobre Em ↔ Am, cambiando cada compás.</li><li>Cuenta los cambios donde el patrón nunca perdió una nota.</li><li>Anota tu mejor número.</li></ol>',
          unit: 'count', placeholder: 'e.g. 8 changes — try for a higher number', placeholder_es: 'p. ej. 8 cambios — intenta superarlo' } },
      { id: 'm8w3-s4', text: 'Anticipate the next chord by moving the fretting hand on the last note of the bar',
        text_es: 'Anticipar el siguiente acorde moviendo la mano de trastear en la última nota del compás',
        gotItWhen: 'your fretting hand starts repositioning for the next chord BEFORE the current bar ends — by the time the new bar starts, you\'re ready.',
        gotItWhen_es: 'tu mano de trastear empieza a reposicionarse para el siguiente acorde ANTES de que termine el compás actual — para cuando empieza el nuevo compás, ya estás listo.',
        practice: { type: 'mc', prompt: 'When should your FRETTING hand start moving toward the next chord?',
          prompt_es: '¿Cuándo debería tu mano de TRASTEAR empezar a moverse hacia el siguiente acorde?',
          choices: ['On the first beat of the new bar', 'On the LAST note of the current bar — anticipate', 'Halfway through the current bar', 'Never — wait for the change'],
          choices_es: ['En el primer tiempo del nuevo compás', 'En la ÚLTIMA nota del compás actual — anticipa', 'A la mitad del compás actual', 'Nunca — espera al cambio'], answer: 1,
          explain: 'Chord changes arrive late because the hand leaves late. Starting the move on the last note of the bar buys you a full beat of travel time, so the picking hand never has to pause and wait.',
          explain_es: 'Los cambios de acorde llegan tarde porque la mano sale tarde. Empezar el movimiento en la última nota del compás te da un tiempo completo de viaje, así la mano de punteo nunca tiene que detenerse a esperar.' } },
      { id: 'm8w3-s5', text: 'Play a full verse of a fingerpicked song from start to finish',
        text_es: 'Tocar una estrofa completa de una canción con fingerpicking de principio a fin',
        gotItWhen: 'you can fingerpick through a complete verse of "House of the Rising Sun" or "Hallelujah" (from Module 5\'s song list) without stopping — mistakes ok, but you keep going.',
        gotItWhen_es: 'puedes tocar con fingerpicking una estrofa completa de "House of the Rising Sun" o "Hallelujah" (de la lista de canciones del Módulo 5) sin detenerte — los errores están bien, pero sigues adelante.',
        practice: { type: 'pr', prompt: 'Fingerpick a complete verse of your song without stopping — mistakes are fine, stopping isn\'t. How many full no-stop verses did you get today?',
          prompt_es: 'Toca con fingerpicking una estrofa completa de tu canción sin detenerte — los errores están bien, detenerse no. ¿Cuántas estrofas completas sin paradas lograste hoy?',
          unit: 'count', placeholder: 'e.g. 2 verses — try for a higher number', placeholder_es: 'p. ej. 2 estrofas — intenta superarlo' } },
      { id: 'm8w3-s6', text: 'Perform a fingerpicked song for an audience (family, a friend, or a recording you share)',
        text_es: 'Interpretar una canción con fingerpicking para una audiencia (familia, un amigo, o una grabación que compartas)',
        gotItWhen: 'you can perform your chosen song for someone — in person or on a recording you share — all the way through, with fingerpicking, and recover from any mistakes without breaking down.',
        gotItWhen_es: 'puedes interpretar tu canción elegida para alguien — en persona o en una grabación que compartas — de principio a fin, con fingerpicking, y recuperarte de cualquier error sin desmoronarte.',
        practice: { type: 'mc', prompt: 'Mid-performance you flub a note. What do experienced players do?',
          prompt_es: 'A mitad de la presentación fallas una nota. ¿Qué hacen los músicos con experiencia?',
          choices: ['Keep the pattern going and rejoin — most listeners never notice', 'Stop and restart the song from the top', 'Apologize and point out the mistake', 'Slow way down until confidence returns'],
          choices_es: ['Mantienen el patrón y se reincorporan — la mayoría de los oyentes nunca lo nota', 'Se detienen y reinician la canción desde el principio', 'Se disculpan y señalan el error', 'Bajan mucho la velocidad hasta que vuelve la confianza'], answer: 0,
          explain: 'The pulse is the performance — a dropped note vanishes if the rhythm survives. Stopping or announcing the mistake is what audiences actually remember.',
          explain_es: 'El pulso es la presentación — una nota perdida desaparece si el ritmo sobrevive. Detenerse o anunciar el error es lo que el público de verdad recuerda.' } }
    ]
  }

); // end module-8.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[8] = [
      { name: '"the cure" — Olivia Rodrigo', meta: 'Fingerpick the verse for a soft feel · Am–C–Dm–F', meta_es: 'Toca la estrofa con fingerpicking para una sensación suave · Am–C–Dm–F', type: 'Core', core: true, journeyUrl: 'tabs/the-cure.html',
        originalUrl: 'https://www.youtube.com/watch?v=B402rKl4bUg',
        tutorialUrl: 'https://www.youtube.com/watch?v=adW_zSkClaY' },
      { name: '"Let It Be" — The Beatles', meta: 'Fingerpick the verse · C–G–Am–F', meta_es: 'Toca la estrofa con fingerpicking · C–G–Am–F', type: 'Core', core: true, journeyUrl: 'tabs/let-it-be.html',
        originalUrl: 'https://www.youtube.com/watch?v=CGj85pVzRJs',
        tutorialUrl: 'https://www.youtube.com/watch?v=_Kw4subj5z8' },
      { name: '"House of the Rising Sun" — The Animals', meta: 'Am–C–D–F–Am–C–E–E · the classic fingerpicked song', meta_es: 'Am–C–D–F–Am–C–E–E · la canción clásica de fingerpicking', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=N4bFqW_eu2I',
        tutorialUrl: 'https://www.youtube.com/watch?v=q9dyAQLYybU' },
      { name: '"Sailor Song" — Gigi Perez', meta: 'Fingerpicked verse · capo IV (G-shapes)', meta_es: 'Estrofa con fingerpicking · capo en el traste 4 (formas de G)', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=1lrFsXkT_rM',
        tutorialUrl: 'https://www.youtube.com/watch?v=rpoyXduMZZw' },
      { name: '"Blackbird" — The Beatles', meta: 'Advanced fingerpicking · course capstone challenge', meta_es: 'Fingerpicking avanzado · reto final del curso', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=Man4Xw8Xypo',
        tutorialUrl: 'https://www.youtube.com/watch?v=Qqw15309knU' },
      { name: '"Tu Boda" — Oscar Maydon × Fuerza Regida', meta: 'Sierreño-style fingerpicking', meta_es: 'Fingerpicking estilo sierreño', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=_ymicn0_GYc',
        tutorialUrl: 'https://www.youtube.com/watch?v=AlElh28IumI' },
      { name: '"Just Like Heaven" — The Cure', meta: 'Iconic arpeggiated intro riff — dreamy chord-picking', meta_es: 'Riff de intro arpegiado e icónico — punteo de acordes soñador', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=n3nPiBai66M',
        tutorialUrl: 'https://www.youtube.com/watch?v=fEgsKS_IcQA' }
    ];

MODULE_REVIEWS[8] = {
  moduleNum: 8,
  module: 'Finger Picking',
  module_es: 'Fingerpicking',
  skills: [
    { id: 'mr8-s1', text: 'I can hold a relaxed fingerpicking hand — wrist arched, fingers curved — for 30 seconds without it collapsing flat', text_es: 'Puedo mantener una mano de fingerpicking relajada — muñeca arqueada, dedos curvados — durante 30 segundos sin que se aplane', set: 'm8w1' },
    { id: 'mr8-s2', text: 'I can assign p to the bass strings and i-m-a to G-B-e, and put any finger on its string without looking', text_es: 'Puedo asignar p a las cuerdas graves e i-m-a a Sol, Si y mi aguda, y poner cualquier dedo en su cuerda sin mirar', set: 'm8w1' },
    { id: 'mr8-s3', text: 'I can pluck p-i-m-a in order on open strings at 60 BPM with even volume on every finger, including the ring (a)', text_es: 'Puedo pulsar p-i-m-a en orden en cuerdas al aire a 60 BPM con volumen parejo en cada dedo, incluyendo el anular (a)', set: 'm8w1' },
    { id: 'mr8-s4', text: 'I can play the 6-note p-i-m-a-m-i arpeggio from memory while holding a chord, every note ringing clean', text_es: 'Puedo tocar el arpegio de 6 notas p-i-m-a-m-i de memoria mientras sostengo un acorde, con cada nota sonando limpia', set: 'm8w2' },
    { id: 'mr8-s5', text: 'I can fingerpick a full 4-chord progression without the pattern breaking at any chord change', text_es: 'Puedo tocar con fingerpicking una progresión completa de 4 acordes sin que el patrón se rompa en ningún cambio de acorde', set: 'm8w3' },
    { id: 'mr8-s6', text: 'I can demonstrate Travis picking — thumb alternating between two bass strings — steadily for at least 4 bars', text_es: 'Puedo demostrar el Travis picking — el pulgar alternando entre dos cuerdas graves — de forma constante durante al menos 4 compases', set: 'm8w3' },
    { id: 'mr8-s7', text: 'I can perform a full fingerpicked song start to finish, recovering from any mistake without stopping', text_es: 'Puedo interpretar una canción completa con fingerpicking de principio a fin, recuperándome de cualquier error sin detenerme', set: 'm8w3' }
  ],
  assessItems: [
    'Pluck p-i-m-a in order on open strings at 60 BPM for 8 reps — wrist arched, fingers curved, and the same volume from every finger including the ring (a)',
    'Fingerpick a 4-chord progression with the arpeggio, keeping the pattern unbroken through every chord change',
    'Perform one full fingerpicked song from the song list start to finish, recovering from any mistakes without stopping'
  ],
  assessItems_es: [
    'Pulsa p-i-m-a en orden en cuerdas al aire a 60 BPM durante 8 repeticiones — muñeca arqueada, dedos curvados, y el mismo volumen en cada dedo, incluyendo el anular (a)',
    'Toca con fingerpicking una progresión de 4 acordes con el arpegio, manteniendo el patrón sin interrupciones en cada cambio de acorde',
    'Interpreta una canción completa con fingerpicking de la lista de canciones de principio a fin, recuperándote de cualquier error sin detenerte'
  ],
  forward: 'You\'ve got the full first-half toolkit — notes, chords, power chords, lead, barre, strumming, and fingerpicking. <strong>The second half of the course goes deeper:</strong> Module 9 finishes the fretboard (all six strings) and teaches you to write your own TAB — the first step toward learning any song on your own.',
  forward_es: 'Ya tienes el kit de herramientas completo de la primera mitad — notas, acordes, acordes de potencia, solos, cejilla, rasgueo y fingerpicking. <strong>La segunda mitad del curso profundiza más:</strong> el Módulo 9 termina el mástil (las seis cuerdas) y te enseña a escribir tu propio TAB — el primer paso hacia aprender cualquier canción por tu cuenta.',
  standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
};
